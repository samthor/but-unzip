import { unzip } from './index.js';
import * as fs from 'fs';

const b = fs.readFileSync('testfile2.zip');
const out = unzip(b);