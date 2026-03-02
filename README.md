# but-unzip

small unzip library.
~666 bytes for Node 😈,
and ~759^ bytes for browsers, _before_ gzip.

^95%+ of browsers support [the decompression API](https://caniuse.com/mdn-api_decompressionstream), which in 2026, is probably all your users.
If you _really_ care about the last 5%, you can dynamically import `pako`, adding ~20k: see below.

## Usage

Install via your favorite package manager and import `but-unzip`.
Has zero dependencies.

```bash
$ npm install but-unzip
```

This library returns zip entries synchronously, but only returns an entry's uncompressed bytes after calling `.read()`, which'll give `Uint8Array` _or_ `Promise<Uint8Array>`.

### Naïve use

If there's a built-in function to inflate compressed files (like in Node or most browsers), you can use the code like:

```js
import { iter } from 'but-unzip';

// in node, get bytes like this (or get a Uint8Array some other way)
import * as fs from 'fs';
const bytes = fs.readFileSync('somezip.zip');

// iterate through all entries
for (const entry of iter(bytes)) {
  console.info(entry.name, entry.comment);
  const bytes = await entry.read();
  // do something with bytes
}
```

### Provide inflate function

If you're worried about maximum compatibility, add `pako` as a dependency and:

```js
import { unzip, inflateRaw as platformInflateRaw } from 'but-unzip';
import { inflateRaw as pakoInflateRaw } from 'pako/lib/inflate.js';

async function decompressUint8Array(zipBytes) {
  const allEntries = unzip(zipBytes, platformInflateRaw || pakoInflateRaw);
  // do something with entries
}
```

But again, this is for 5% of users in browsers: ancient Safari, IE11 and so on.

## Limitations

* This library doesn't support ZIP64, but probably should.
  But your browser (and Node) will likely not be happy to work with 4gb+ files, especially as this is not a streaming library (it just gives everything at once).

* Like literally every zip library that exists, this only supports compression types 0 (store) and 8 (deflate).

## Notes

* In my testing with `esbuild`, Pako's ESM bundling can be a bit broken, so importing "pako/lib/inflate.js" adds ~20k.
  Importing `pako` wholesale, even if you only use `inflateRaw`, adds ~45k.

* If you're handling user data and it could be really big, use a `Worker`.
  But also, the compression API is `async` and doesn't block your main thread.
  YMMV!
