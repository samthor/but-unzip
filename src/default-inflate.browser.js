export { inflateRaw };

let inflateRaw = undefined;

const method = 'deflate-raw';

const ctor = self['DecompressionStream'];
try {
  new ctor(method);

  // https://zlib.net/manual.html:
  //   A raw deflate stream is one with no zlib or gzip header or trailer. This routine would
  //   normally be used in a utility that reads zip or gzip files and writes out uncompressed files.
  //   The utility would decode the header and process the trailer on its own, hence this routine
  //   expects only the raw deflate stream to decompress. This is different from the default
  //   behavior of inflate(), which expects a zlib header and trailer around the deflate stream.

  inflateRaw = async (bytes) => {
    /** @type {{ readable: ReadableStream, writable: WritableStream }} */
    const stream = new ctor(method);

    const w = stream.writable.getWriter();
    const r = stream.readable.getReader();

    /** @type {Uint8Array} */
    let out;

    /** @type {Uint8Array[]} */
    const agg = [];
    let size = 0;
    let i = 0;

    /** @type {ReadableStreamReadResult<any>} */
    let s;

    w.write(bytes);
    w.close();

    while (!(s = await r.read()).done) {
      // use out as tmp var
      out = s.value;
      agg.push(out);
      size += out.length;
    }

    // we only got one chunk, return it
    if (!(agg.length - 1)) {
      return agg[0];
    }

    // have to merge chunks
    out = new Uint8Array(size);
    agg.map((a) => (
      out.set(a, i),
      i += a.length
    ));
    return out;
  };
} catch {}

