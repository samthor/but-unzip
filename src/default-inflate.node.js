import { inflateRaw } from 'zlib';
import { promisify } from 'util';

const p = promisify(inflateRaw);
export { p as inflateRaw };
