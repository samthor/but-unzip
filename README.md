# but-unzip

small unzip library.
~743 bytes for Node,
and ~999^ bytes for browsers.

^90%+ of browsers support [the decompression API](https://caniuse.com/mdn-api_decompressionstream).
For the last 10%, dynamically import `pako`, adding ~20k.

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

If there's a built-in function to inflate compressed files (like in Node or 90%+ of browsers), you can use the code like:

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

You should only fetch `pako` if you need to, because again, 90% of people don't need it:

```js
import { unzip, inflateRaw as platformInflateRaw } from 'but-unzip';

const inflateRaw = platformInflateRaw || (await import('pako/lib/inflate.js').inflateRaw);

// later
const all = unzip(zipBytes, inflateRaw);
```

## Limitations

* This library doesn't support ZIP64, but probably should.
  But your browser (and Node) will probably not be happy to work with 4gb+ files, especially as this is not a streaming library (it just gives everything at once).

* Like literally every zip library that exists, this only supports compression types 0 (store) and 8 (deflate).

## Notes

* Pako's ESM bundling can be a bit broken, so importing 'pako/lib/inflate.js' adds ~20k.
  Importing 'pako' wholesale, even if you only use `inflateRaw`, adds ~45k.

* The main thread is only good for decompressing small things.
  If you're handling user data and it could be really big, use a `Worker`.
