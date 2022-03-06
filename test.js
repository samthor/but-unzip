import test from 'ava';
import { unzip } from './src/index.js';
import * as fs from 'fs';

test('unzip', t => {
  const b = fs.readFileSync('testfile2.zip');
  const out = unzip(b);

  t.is(out.length, 2);
  t.is(out[0]?.filename, 'package-lock.json');
  t.is(out[1]?.filename, 'package.json');
});

test('unzip bytes', async t => {
  const b = fs.readFileSync('testfile.zip');
  const out = unzip(b);

  t.is(out.length, 1);

  const file = await out[0]?.read();
  t.is(new TextDecoder().decode(file), 'Hello!\n');
});

test('ignores bad file', t => {
  const sizes = [0, 2, 100, 256 ** 2, 256 ** 3];
  for (const size of sizes) {
    const whatever = new Uint8Array(size);
    t.throws(() => {
      unzip(whatever, () => new Uint8Array());
    }, { message: 'but-unzip~2' });
  }
});