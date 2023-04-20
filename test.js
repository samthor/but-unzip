import { unzip } from './src/index.js';
import * as fs from 'node:fs';
import test from 'node:test';
import * as assert from 'node:assert';

test('unzip', () => {
  const b = fs.readFileSync('testfile2.zip');
  const out = unzip(b);

  assert.strictEqual(out.length, 2);
  assert.strictEqual(out[0]?.filename, 'package-lock.json');
  assert.strictEqual(out[1]?.filename, 'package.json');
});

test('unzip bytes', async () => {
  const b = fs.readFileSync('testfile.zip');
  const out = unzip(b);

  assert.strictEqual(out.length, 1);

  const file = await out[0]?.read();
  assert.strictEqual(new TextDecoder().decode(file), 'Hello!\n');
});

test('unzip zip64', async () => {
  const b = fs.readFileSync('testfile64.zip');
  const out = unzip(b);

  assert.strictEqual(out.length, 1);

  const file = await out[0]?.read();
  assert.strictEqual(new TextDecoder().decode(file), 'This is a long string\n');
});

test('ignores bad file', () => {
  const sizes = [0, 2, 100, 256 ** 2, 256 ** 3];
  for (const size of sizes) {
    const whatever = new Uint8Array(size);

    assert.throws(() => {
      unzip(whatever, () => new Uint8Array());
    });
  }
});

test('opens xlsx file', async () => {
  const b = fs.readFileSync('testfile.xlsx');
  const out = unzip(b);

  assert.strictEqual(out.length, 11);

  const sheet2 = out.find((x) => x.filename === 'xl/worksheets/sheet2.xml');
  assert.ok(sheet2);

  const bytes = await sheet2?.read();
  const s = new TextDecoder().decode(bytes);
  assert.ok(s.startsWith('<?xml version'));
});
