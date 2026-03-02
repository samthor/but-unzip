# but-unzip

small unzip library.
~666 bytes for Node 😈,
and ~755^ bytes for browsers, _before_ gzip.

^95% of browsers support [the decompression API](https://caniuse.com/mdn-api_decompressionstream), which in 2026, is effectively all your users.
<small>
For niche use cases, you should import `pako`.
</small>

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

Just like that!

#### Provide inflate function

If you're worried about maximum compatibility, add `pako` as a dependency and include its `inflateRaw` method:

```js
import { unzip, inflateRaw as platformInflateRaw } from 'but-unzip';
import { inflateRaw as pakoInflateRaw } from 'pako/lib/inflate.js';

async function decompressUint8Array(zipBytes) {
  const allEntries = unzip(zipBytes, platformInflateRaw || pakoInflateRaw);
  // do something with entries
}
```

Again, this is for a tiny minority of users who can't practically use the modern web _anyway_.

## Notes

* This library doesn't support ZIP64.
  However, your browser (and Node) will likely not be happy to work with 4gb+ files, especially as this is not a streaming library (it just gives everything at once).

* Like literally every zip library that exists, this only supports compression types 0 (store) and 8 (deflate).

* If you're handling user data and it could be really big, use a `Worker`.
  But also, the compression API is `async` and doesn't block your main thread.
  YMMV!
