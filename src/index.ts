import { inflateRaw } from '#default-inflate';
export { inflateRaw };

type InflateMethod = (x: Uint8Array) => Promise<Uint8Array> | Uint8Array;

const d = new TextDecoder(),
  e = (c: number) => { throw Error('but-unzip~' + c); };

export const unzip = (a: Uint8Array, i: InflateMethod) => [...iter(a, i)];

export function* iter(raw: Uint8Array, i: InflateMethod = inflateRaw as any) {
  let at = raw.length - 21,
    tmp = at - 65536; // used for bounds, then count
  const dv = new DataView(raw.buffer, raw.byteOffset),
    u16 = (o: number) => dv.getUint16(o + at, 1 as any),
    u32 = (o: number) => dv.getUint32(o + at, 1 as any),
    sub = (o: number, l: number) => raw.subarray(at += o, at += l);

  while (at > tmp && (at = raw.lastIndexOf(80, at - 1)) + 1 && (raw[at + 1] - 75 || raw[at + 2] - 5 || raw[at + 3] - 6));

  if (at < 0) {
    e(2); // bad zip format
  }

  tmp = u16(10);
  if (tmp - u16(8)) {
    e(3); // no multi-disk support
  }
  at = u32(16);

  while (tmp--) {
    let method = u16(10),
      filenameLength = u16(28),
      compressedSize = u16(30),
      commentLength = u16(32),
      size = u32(20),
      localEntryAt = u32(42),
      filename = d.decode(sub(46, filenameLength)),
      comment = d.decode(sub(compressedSize, commentLength)),
      next = at,
      bytes: Uint8Array;

    // >> start reading entry
    at = localEntryAt;

    // this is the local entry (filename + extra fields) length, which we skip
    bytes = sub(30 + u16(26) + u16(28), size);
    yield { filename, comment, read: () => method - 8 ? (method ? e(1) : bytes) : i(bytes) };

    // << finish reading entry
    at = next;
  }
}
