import test from 'ava';
import { unzip } from './index.js';
import * as fs from 'fs';

test('unzip', t => {

  const b = fs.readFileSync('testfile2.zip');
  const out = unzip(b);

  t.is(out.length, 2);
  t.is(out[0]?.filename, 'package-lock.json');
  t.is(out[1]?.filename, 'package.json');
});
