# but-unzip

small unzip library.
~777 bytes for Node,
and ~1.1k^ bytes for browsers.

^only Chrome and friends have built-in `inflateRaw` support for the compression in zip, so you'll need to include [e.g., pako](https://www.npmjs.com/package/pako), which adds ~20k.

## Usage

Install via your favorite package manager and import `but-unzip`.
Has zero dependencies.

```bash
$ npm install but-unzip

# for browsers you will likely need
$ npm install pako
```

This library returns zip entries synchronously, but only returns an entry's uncompressed bytes after calling `bytes()`, which'll give `Uint8Array` _or_ `Promise<Uint8Array>`.

### Naïve use

If there's a built-in function to inflate compressed files (like in Node), you can use the code like:

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

### Provide inflate function (non-Chrome)

In practice, in the browser, you're going to want to include `pako`, because only Chrome has built-in support:

```js
import { unzip, inflateRaw as platformInflateRaw } from 'but-unzip';
import { inflateRaw as pakoInflateRaw } from 'pako/lib/inflate.js';

async function decompressUint8Array(zipBytes) {
  const allEntries = unzip(zipBytes, platformInflateRaw || pakoInflateRaw);
  // do something with entries
}
```

### Dynamically import inflate

You might want to be tricky and only fetch `pako` if you need to:

```js
import { unzip, inflateRaw as platformInflateRaw } from 'but-unzip';

const inflateRaw = platformInflateRaw || (await import('pako/lib/inflate.js').inflateRaw);

// later
const all = unzip(zipBytes, inflateRaw);
```

## Notes

* Pako's ESM bundling is a bit broken, so importing 'pako/lib/inflate.js' adds ~20k.
Importing 'pako' wholesale, even if you only use `inflateRaw`, adds ~45k.

* This library doesn't support ZIP64, but probably should.

* Chrome actually only supports `inflate`, but we abuse that to provide `inflateRaw`.
