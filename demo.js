import { unzip } from './index.js';
import * as fs from 'fs';
import * as zlib from 'zlib';

const b = fs.readFileSync('testfile2.zip');
const out = unzip(b, zlib.inflateRawSync);

console.info(out);