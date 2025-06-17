# but-unzip

small unzip library.
~704 bytes for Node,
and ~944^ bytes for browsers, _before_ gzip.

^92.5%+ of browsers support [the decompression API](https://caniuse.com/mdn-api_decompressionstream), which in 2025, is probably all your users.
If you _really_ care about the last 7.5%, you can dynamically import `pako`, adding ~20k: see below.

## Usage

Install via your favorite package manager and import `but-unzip`.
Has zero dependencies.

```bash
$ npm install but-unzip

# for old browsers you need
$ npm install pako
```

This library returns zip entries synchronously, but only returns an entry's uncompressed bytes after calling `.read()`, which'll give `Uint8Array` _or_ `Promise<Uint8Array>`.

### Naïve use

If there's a built-in function to inflate compressed files (like in Node or most browsers), you can use the code like:

```js
import { iter } from 'but-unzip';
import * as fs from 'fs';

const bytes = fs.readFileSync('somezip.zip');

for (const entry of iter(bytes)) {
  console.info(entry.name, entry.comment);
  const bytes = await entry.read();
  // do something with bytes
}
```

### Provide inflate function

If you're worried about maximum compatibility:

```js
import { unzip, inflateRaw as platformInflateRaw } from 'but-unzip';
import { inflateRaw as pakoInflateRaw } from 'pako/lib/inflate.js';

async function decompressUint8Array(zipBytes) {
  const allEntries = unzip(zipBytes, platformInflateRaw || pakoInflateRaw);
  // do something with entries
}
```

### Dynamically import inflate

You _could_ use dynamic `import()` instead to include `pako`, but nearly all users who are missing the compression library probably also don't support ESM imports (e.g., IE11 and old browsers).

So this is how you'd do it but I'd probably not recommend it:

```js
import { inflateRaw as platformInflateRaw } from 'but-unzip';
const inflateRaw = platformInflateRaw || (await import('pako/lib/inflate.js').inflateRaw);
```

## Limitations

* This library doesn't support ZIP64, but probably should.
  But your browser (and Node) will probably not be happy to work with 4gb+ files, especially as this is not a streaming library (it just gives everything at once).

* Like literally every zip library that exists, this only supports compression types 0 (store) and 8 (deflate).

## Notes

* In my testing with `esbuild`, Pako's ESM bundling can be a bit broken, so importing "pako/lib/inflate.js" adds ~20k.
  Importing `pako` wholesale, even if you only use `inflateRaw`, adds ~45k.

* If you're handling user data and it could be really big, use a `Worker`.
  But also, the compression API is `async` and doesn't block your main thread.
  YMMV!
