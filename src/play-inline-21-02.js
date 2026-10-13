// play-inline-21 02 — ctx
// Lines 377-410 of readable/play-inline-21.pretty.js (statement-aligned).
  function buildRoughCanvas(name) {
    const def = X.GEN[name];
    const src = TEX.get(name).image;
    const s = Math.min(256, src.width),
      sh = Math.round((s * src.height) / src.width);
    const cv = X.canvas(s, sh);
    cv.ctx.drawImage(src, 0, 0, s, sh);
    const img = cv.ctx.getImageData(0, 0, s, sh),
      d = img.data;
    let mean = 0;
    for (let i = 0; i < d.length; i += 4)
      mean += d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    mean /= d.length / 4;
    const base = def.rough === undefined ? 0.8 : def.rough,
      k = def.roughVar;
    // generator-painted gloss (tar seals, polished wheel paths, oil): smoother than the colour alone would say
    let gl = null;
    if (X.gloss && X.gloss[name]) {
      const gcv = X.canvas(s, sh);
      gcv.ctx.drawImage(X.gloss[name], 0, 0, s, sh);
      gl = gcv.ctx.getImageData(0, 0, s, sh).data;
    }
    for (let i = 0; i < d.length; i += 4) {
      const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      let v = base + ((mean - l) / 255) * k * (def.roughInvert ? -1 : 1);
      if (gl) v -= (gl[i] / 255) * 0.55;
      v = Math.max(0.04, Math.min(1, v)) * 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    cv.ctx.putImageData(img, 0, 0);
    return cv.c;
  }

