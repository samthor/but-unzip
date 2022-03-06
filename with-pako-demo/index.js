import { iter, inflateRaw } from './lib.js';

const bytes = await fetch('../testfile2.zip').then((r) => r.blob());

const buf = await bytes.arrayBuffer();
const uint8 = new Uint8Array(buf);

for (const i of iter(uint8, inflateRaw)) {
  console.info(i);
  const b = await i.read();
  console.info('bytes', b);

  const s = new TextDecoder().decode(b);
  console.info('s', s);
}
