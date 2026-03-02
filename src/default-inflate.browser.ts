export let inflateRaw: (b: Uint8Array) => Promise<Uint8Array>;
try {
  let x = new DecompressionStream('deflate-raw');
  let y = (q: BodyInit | Uint8Array) => new Response(q as any)

  inflateRaw = (b: Uint8Array) => y(y(b).body!.pipeThrough(x)).arrayBuffer().then((x) => new Uint8Array(x))
} catch {}
