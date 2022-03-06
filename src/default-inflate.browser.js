let inflateRaw = undefined;

/** @type {(x: any) => Uint8Array} */
const buildBuffer = (x) => new Uint8Array(x);

const ctor = self['DecompressionStream'];
if (ctor) {
  // https://zlib.net/manual.html:
  //   A raw deflate stream is one with no zlib or gzip header or trailer. This routine would
  //   normally be used in a utility that reads zip or gzip files and writes out uncompressed files.
  //   The utility would decode the header and process the trailer on its own, hence this routine
  //   expects only the raw deflate stream to decompress. This is different from the default
  //   behavior of inflate(), which expects a zlib header and trailer around the deflate stream.

  inflateRaw = async (bytes) => {
    let afterDataWriteFrame = false;

    /** @type {{ readable: ReadableStream, writable: WritableStream }} */
    const stream = new ctor('deflate');

    const w = stream.writable.getWriter();
    const r = stream.readable.getReader();

    w.write(buildBuffer([0x78, 0x9c]));
    w.write(bytes);

    const data = (async () => {

      /** @type {Uint8Array[]} */
      const agg = [];
      let size = 0;

      for (; ;) {
        try {
          const s = await r.read();
          agg.push(s.value);
          size += s.value.length;
        } catch (e) {
          if (!afterDataWriteFrame) {
            // crash in compressed bytes
            throw e;
          }

          // we only got one chunk, return it
          if (agg.length === 1) {
            return agg[0];
          }

          // have to merge chunks
          const out = buildBuffer(size);
          let i = 0;
          for (const a of agg) {
            out.set(a, i);
            i += a.length;
          }
          return out;
        }
      }

    })();

    await Promise.resolve();
    afterDataWriteFrame = true;

    // This will cause an error because the checksum is bad and it should feel bad.
    // Swallow it whole.
    w.write(buildBuffer(4)).catch((e) => {});

    return data;
  };
}

export { inflateRaw };
