try {
  const build = () => new DecompressionStream('deflate-raw');
  let y = (q: BodyInit | Uint8Array) => new Response(q as any)
  build();

  inflateRaw = (b: Uint8Array) => y(y(b).body!.pipeThrough(build())).arrayBuffer().then((x) => new Uint8Array(x))
} catch {}
export var inflateRaw: (b: Uint8Array) => Promise<Uint8Array>;
