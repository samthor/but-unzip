
import { inflateRaw } from '#default-inflate';
export { inflateRaw };

const LOCAL_FILE_HEADER_TYPE = 0x04034b50;
const CENTRAL_FILE_HEADER_TYPE = 0x02014b50;
const END_CENTRAL_TYPE = 0x06054b50;


const d = new TextDecoder();


/** @type {(code: number) => never} */
const throwCode = (code) => { throw new Error('but-unzip~' + code); };


// TODO: this should try utf-8, but if fails, fall back to "dos" encoding
/** @type {(raw: Uint8Array) => string} */
const decodeString = (raw) => d.decode(raw);


/**
 * @param {Uint8Array} raw
 */
const findEndCentralDirectory = (raw) => {
  // TODO: could go forward as we generally don't expect a comment. Might be faster?

  let search = raw.length - 20;
  const bounds = Math.max(search - 65516, 2);  // sub 2**256 - 20 (max comment length)

  while (
    ((search = raw.lastIndexOf(0x50, search - 1)) !== -1) &&
    !(raw[search + 1] === 0x4b && raw[search + 2] === 0x05 && raw[search + 3] === 0x06) &&
    search > bounds
  ) { }

  return search;

  // // TODO: this could be a single line? esbuild keeps 'break'
  // do {
  //   search = raw.lastIndexOf(0x50, search - 1);
  //   if (search === -1) {
  //     break;
  //   }
  //   if (raw[search + 1] === 0x4b && raw[search + 2] === 0x05 && raw[search + 3] === 0x06) {
  //     break;
  //   }
  // } while (search > bounds);
  // return search;

};


/**
 * @param {Uint8Array} raw
 * @param {(raw: Uint8Array) => Promise<Uint8Array>|Uint8Array} inf
 * @return {Generator<{ filename: string, comment: string, read: () => Promise<Uint8Array>|Uint8Array }>}
 */
export function* iter(raw, inf = inflateRaw) {
  let at = findEndCentralDirectory(raw);
  if (at === -1) {
    throwCode(2);  // bad zip format
  }

  /** @type {(startBy: number, endBy: number) => Uint8Array} */
  const subarrayMove = (startBy, endBy) => raw.subarray(at += startBy, at += endBy);

  const dataView = new DataView(raw.buffer, raw.byteOffset);   // we don't need byteLength, could be a longer buffer :shrug:

  /** @type {(off: number) => number} */
  const u16 = (off) => dataView.getUint16(off + at, true);

  /** @type {(off: number) => number} */
  const u32 = (off) => dataView.getUint32(off + at, true);


  // read end central directory
  let fileCount = u16(10);
  if (fileCount !== u16(8)) {
    throwCode(3);  // no multi-disk support
  }
  const centralDirectoryStart = u32(16);
  at = centralDirectoryStart;

  // read central directory
  while (fileCount--) {
    const compressionMethod = u16(10);
    const filenameLength = u16(28);
    const extraFieldsLength = u16(30);
    const commentLength = u16(32);
    const compressedSize = u32(20);

    // find local entry location
    const localEntryAt = u32(42);

    // read buffers, move at to after entry, and store where we were
    const filename = decodeString(subarrayMove(46, filenameLength));
    // we skip extraFields here
    const comment = decodeString(subarrayMove(extraFieldsLength, commentLength));
    const nextCentralDirectoryEntry = at;

    /** @type {Uint8Array} */
    let bytes;

    // >> start reading entry
    at = localEntryAt;

    // this is the local entry (filename + extra fields) length, which we skip
    bytes = subarrayMove(30 + u16(26) + u16(28), compressedSize);

    yield {
      filename,
      comment,
      read: () => {
        return (compressionMethod & 8) ? inf(bytes) :
          (compressionMethod ? throwCode(1) : bytes);
        // if (!compressionMethod) {
        //   return bytes;
        //   // do nothing
        // } else if (compressionMethod&8) {
        //   return inf(bytes);
        // }
        // return throwCode(1);  // only suppors DEFLATE
      },
    };

    at = nextCentralDirectoryEntry;
    // << finish reading entry
  }
}

/**
 * @type {(...args: Parameters<iter>) => { filename: string, comment: string, read: () => Promise<Uint8Array>|Uint8Array }[]}
 */
export const unzip = (...args) => [...iter(...args)];
