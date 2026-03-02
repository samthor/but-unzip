import { inflateRaw as i } from 'zlib';
import { promisify } from 'util';
export const inflateRaw = promisify(i);
