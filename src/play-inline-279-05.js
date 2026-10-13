// play-inline-279 05 — basekey
// Lines 884-921 of readable/play-inline-279.pretty.js (statement-aligned).
  P.MAT = MAT;
  // Materials not given distance LOD / shadows (tiny parts)
  const DETAIL = new Set([
    "bulb",
    "neon_red",
    "neon_blue",
    "neon_green",
    "neon_yellow",
    "screen_blue",
    "screen_amber",
    "iron",
    "bronze",
    "chrome",
    "gold",
    "bone",
    "bone_dark",
    "paper",
    "fabric",
    "fabric_white",
    "fabric_pink",
    "velvet",
    "crystal",
    "candle",
    "leather",
    "rubber",
    "crate",
    "screen",
  ]);
  const NO_SHADOW = new Set();
  const baseKey = (k) => (k.slice(-4) === "@lit" ? k.slice(0, -4) : k);
  P.baseKey = baseKey;
  const isEmissive = (k) => {
    const d = MAT[baseKey(k)];
    return !!(d && d.emissive !== undefined);
  };
  P.isEmissive = isEmissive;

  // ---- custom surfaces ------------------------------------------------
