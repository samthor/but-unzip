/**
 * Iterate over all items found in the zip file.
 *
 * @param raw The raw bytes of the zip file
 * @param inflate Optional inflate helper; needed in browsers without {@link DecompressionStream}
 */
export function iter(
  raw: Uint8Array,
  inflate?: (raw: Uint8Array) => Promise<Uint8Array> | Uint8Array,
): Generator<ZipItem, void, void>;

/**
 * Returns all items found in the zip file at once.
 *
 * @param raw The raw bytes of the zip file
 * @param inflate Optional inflate helper; needed in browsers without {@link DecompressionStream}
 */
export function unzip(
  raw: Uint8Array,
  inflate?: (raw: Uint8Array) => Promise<Uint8Array> | Uint8Array,
): Array<ZipItem>;

/**
 * Each {@link ZipItem} can have its decompressed bytes read by calling its `read()` method,
 * which'll give either `Uint8Array` _or_ `Promise<Uint8Array>` (as it's possible to be sync).
 */
export type ZipItem = {
  filename: string;
  comment: string;
  read: () => Promise<Uint8Array> | Uint8Array;
};

/**
 * The platform-default inflate helper. This is provided for Node, and browsers with support for
 * {@link DecompressionStream}.
 *
 * If this is `undefined`, you'll need to provide a helper (e.g., from the Pako library) to `unzip`
 * and `iter`.
 */
export const inflateRaw: ((raw: Uint8Array) => Promise<Uint8Array> | Uint8Array) | undefined;
