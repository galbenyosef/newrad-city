// play-inline-454 02 — math
// Lines 30-215 of readable/play-inline-454.pretty.js (statement-aligned).
  const C = (G.chars = { __module: "characters" });
  const L = (C._lib = {});

  // ------------------------------------------------------------------
  // Small helpers
  // ------------------------------------------------------------------
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  L.clamp = clamp;
  L.lerp = lerp;
  L.smooth = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  /** Deterministic hash of a 3D point → [0,1). Used for vertex grime noise. */
  L.hash3 = function (x, y, z) {
    let h =
      Math.imul((x * 7919) | 0, 374761393) ^
      Math.imul((y * 7919) | 0, 668265263) ^
      Math.imul((z * 7919) | 0, 2147483647);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  /** Smooth-ish 3D value noise (cheap) in [0,1]. */
  L.noise3 = function (x, y, z) {
    const xi = Math.floor(x),
      yi = Math.floor(y),
      zi = Math.floor(z);
    const xf = x - xi,
      yf = y - yi,
      zf = z - zi;
    const s = (t) => t * t * (3 - 2 * t);
    const h = L.hash3;
    const a = lerp(
      lerp(h(xi, yi, zi), h(xi + 1, yi, zi), s(xf)),
      lerp(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), s(xf)),
      s(yf),
    );
    const b = lerp(
      lerp(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), s(xf)),
      lerp(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), s(xf)),
      s(yf),
    );
    return lerp(a, b, s(zf));
  };
  L.rng = function (seed) {
    if (G.util && G.util.rng) return G.util.rng(seed);
    let a = seed >>> 0 || 1;
    const r = function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.range = (lo, hi) => lo + (hi - lo) * r();
    r.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * r());
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.chance = (p) => r() < p;
    return r;
  };
  L.hashStr = (s) => {
    let h = 2166136261;
    s = String(s);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  /** Color helper: accepts hex number, '#hex', THREE.Color or [r,g,b] → THREE.Color (new). */
  L.col = function (c) {
    if (c instanceof THREE.Color) return c.clone();
    if (Array.isArray(c)) return new THREE.Color(c[0], c[1], c[2]);
    return new THREE.Color(c === undefined ? 0xffffff : c);
  };
  /** Mix two colors (hex) → hex. */
  L.mix = function (a, b, t) {
    return L.col(a).lerp(L.col(b), t).getHex();
  };
  L.shade = function (a, k) {
    const c = L.col(a);
    c.multiplyScalar(k);
    c.r = Math.min(1, c.r);
    c.g = Math.min(1, c.g);
    c.b = Math.min(1, c.b);
    return c.getHex();
  };

  // ------------------------------------------------------------------
  // PALETTE — shared colours (sun-bleached, grimy)
  // ------------------------------------------------------------------
  L.PAL = {
    cryoGrey: 0xb9bcb6,
    cryoGreyDark: 0x7b7f7c,
    cryoOrange: 0xd2601c,
    cryoOrangeDark: 0x94420f,
    leather: 0x5a3b24,
    leatherDark: 0x3a2616,
    leatherLight: 0x7a5534,
    denim: 0x3b4a5c,
    khaki: 0x8a7d5a,
    olive: 0x55583a,
    oliveDark: 0x3a3d27,
    drab: 0x6b624a,
    rust: 0x7a3f1d,
    steel: 0x7c8084,
    steelDark: 0x44484c,
    gunmetal: 0x2e3134,
    chrome: 0xb8bcc0,
    black: 0x151515,
    white: 0xd8d4c8,
    labWhite: 0xcfcbbf,
    red: 0x8e1d17,
    bone: 0xd6cba8,
    rag1: 0x6f6452,
    rag2: 0x585244,
    rag3: 0x7b6e58,
    rag4: 0x4f4a3f,
    covSteel: 0x8b8d86,
    rigOlive: 0x6b6d5a,
    contGrey: 0x1a1b1d,
    contLamp: 0xff6a1a,
    brute: 0x7a6c82,
    bruteDark: 0x52485c,
    ripjaw: 0x4b4234,
    ripjawBelly: 0x7a6a50,
    claw: 0xd9d0b6,
    shellback: 0x5b5a3e,
    shellbackBelly: 0xb7ab86,
    burrowRat: 0xa7837a,
    roach: 0x5a3a20,
    gasfly: 0xa89574,
    glow: 0xff6a2a,
    sunGold: 0xe8b04a,
    covRed: 0x9b2a1f,
  };
  L.SKIN = {
    // (r1 loop: 8–14 % less saturated — under the warm key + red subsurface
    // wrap the old tones rendered as orange terracotta against the olive grade)
    pale: 0xe0bda1,
    fair: 0xd3a788,
    tan: 0xba8f6f,
    olive: 0xa37c5d,
    brown: 0x855c41,
    dark: 0x5a3d2c,
  };
  L.HAIR = [
    0x1c1611, 0x3a2616, 0x5b3b20, 0x8a6a3c, 0xb89968, 0x6c2b18, 0x7a7670,
    0xc9c3b8,
  ];

  // ------------------------------------------------------------------
  // TEXTURE ATLAS (1024²). Mostly light greyscale detail so vertex colour
  // defines the hue; a few coloured decal regions (white vertex colour).
  // ------------------------------------------------------------------
  const ATLAS_SIZE = 1024;
  const REG = (L.REGIONS = {
    white: [0, 0, 128, 128],
    denim: [0, 128, 128, 128],
    cloth: [128, 0, 256, 256],
    leather: [384, 0, 256, 256],
    metal: [640, 0, 256, 256],
    skin: [896, 0, 128, 128],
    rubber: [896, 128, 128, 128],
    grime: [0, 256, 256, 256],
    scales: [256, 256, 256, 256],
    shell: [512, 256, 256, 256],
    unitpatch: [768, 256, 256, 128],
    covenant: [768, 384, 128, 128],
    longwinter: [896, 384, 128, 128],
    sundisc: [0, 512, 128, 128],
    redcross: [128, 512, 128, 128],
    grille: [256, 512, 128, 128],
    hazard: [384, 512, 128, 128],
    maker: [512, 512, 256, 128],
    continuity: [768, 512, 256, 128],
    fur: [0, 640, 256, 256],
    rags: [256, 640, 256, 256],
    crackskin: [512, 640, 256, 256],
    gauge: [768, 640, 256, 192],
    raidpaint: [0, 896, 256, 128],
    wood: [256, 896, 256, 128],
    tire: [512, 896, 256, 128],
    numplate: [768, 832, 256, 192],
  });
  let atlasTex = null;
