
const LOCAL_FILE_HEADER_TYPE = 0x04034b50;
const CENTRAL_FILE_HEADER_TYPE = 0x02014b50;
const END_CENTRAL_TYPE = 0x06054b50;


const d = new TextDecoder('utf-8');


// TODO: this should try utf-8, but if fails, fall back to "dos" encoding
/** @type {(raw: Uint8Array) => string} */
const decode = (raw) => d.decode(raw);


/**
 * @param {Uint8Array} raw
 */
const findEndCentralDirectory = (raw) => {
  let search = raw.length - 20;

  while (search > 2) {
    search = raw.lastIndexOf(0x50, search - 1);
    if (search === -1) {
      break;
    }
    if (raw[search + 1] === 0x4b && raw[search + 2] === 0x05 && raw[search + 3] === 0x06) {
      return search;
    }
  }
  return -1;
};


/**
 * @param {Uint8Array} bytes
 * @param {number} method
 */
export function decodeCompressedBytes(bytes, method) {
  if (method === 0) {
    return bytes;
  } else if (method !== 8) {
    throw new Error(`only supports DEFLATE, found: ${method}`);
  }

  // TODO: if node, use zlib.deflateSync


}


/**
 * @param {Uint8Array} raw
 */
export function* iter(raw) {
  let at = findEndCentralDirectory(raw);
  if (at === -1) {
    throw new Error(`can't find directory`);
  }

  const dataView = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);

  /** @type {(off: number) => number} */
  const u16 = (off) => dataView.getUint16(off + at, true);

  /** @type {(off: number) => number} */
  const u32 = (off) => dataView.getUint32(off + at, true);


  // read end central directory
  const fileCount = u16(10);
  if (fileCount !== u16(8)) {
    throw new Error(`no multi-disk support`);
  }
  const centralDirectoryStart = u32(16);
  at = centralDirectoryStart;

  // read central directory
  for (let i = 0; i < fileCount; ++i) {
    const compressionMethod = u16(10);
    const filenameLength = u16(28);
    const extraFieldsLength = u16(30);
    const commentLength = u16(32);
    const compressedSize = u32(20);

    const localFileHeaderAt = u32(42);
    const after = at + 46 + filenameLength + extraFieldsLength + commentLength;

    const filenameBuffer = raw.subarray(at + 46, at + 46 + filenameLength);
    const filename = decode(filenameBuffer);

    at = localFileHeaderAt;

    const localFilenameLength = u16(26);
    const localExtraFieldsLength = u16(28);

    at += (localFilenameLength + localExtraFieldsLength);
    const bytes = raw.subarray(at, at + compressedSize);

    yield {
      filename,
      raw: bytes,
      bytes: decodeCompressedBytes(bytes, compressionMethod),
    };

    at = after;
  }
}

/**
 * @param {Uint8Array} raw
 */
export const unzip = (raw) => [...iter(raw)];
