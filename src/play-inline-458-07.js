// play-inline-458 07 — ctx
// Lines 1844-2163 of readable/play-inline-458.pretty.js (statement-aligned).
  function faceBase() {
    if (baseCanvas) return baseCanvas;
    baseCanvas = document.createElement("canvas");
    baseCanvas.width = baseCanvas.height = FT;
    paintGeneric(baseCanvas.getContext("2d"));
    return baseCanvas;
  }
  L.faceGeneric = function () {
    if (genericTex) return genericTex;
    if (typeof document === "undefined") return null;
    try {
      genericCanvas = document.createElement("canvas");
      genericCanvas.width = genericCanvas.height = FT;
      const ctx = genericCanvas.getContext("2d");
      ctx.drawImage(faceBase(), 0, 0);
      const mcv = document.createElement("canvas");
      mcv.width = mcv.height = FT;
      paintBrows(
        ctx,
        { hairColor: 0x3a2616, skin: L.SKIN.tan },
        L.rng(11),
        0.75,
        mcv.getContext("2d"),
      );
      markHair(ctx, mcv, null, 0x3a2616, 0x3a2616);
      genericTex = makeTex(genericCanvas);
      genericTex.userData = { shared: true };
    } catch (e) {
      if (G.reportError) G.reportError("chars.faceGeneric", e);
      genericTex = null;
    }
    return genericTex;
  };

  // ---- per-template overlays (2D canvas ops, a few ms) ----------------
  /** modulation byte for "want this colour on this skin" (linear ratio × 0.5) */
  function modCol(want, skin, alpha) {
    const w = L.col(want),
      s = L.col(skin);
    const f = (a, b) =>
      clamp(Math.round(((0.5 * (a + 0.004)) / (b + 0.004)) * 255), 3, 255);
    return (
      "rgba(" +
      f(w.r, s.r) +
      "," +
      f(w.g, s.g) +
      "," +
      f(w.b, s.b) +
      "," +
      (alpha === undefined ? 1 : alpha) +
      ")"
    );
  }
  const mulStyle = (r, g, b, a) =>
    "rgba(" +
    Math.round(r * 128) +
    "," +
    Math.round(g * 128) +
    "," +
    Math.round(b * 128) +
    "," +
    a +
    ")";
  /** stroke a polyline given in unit-head front coordinates */
  function strokeUnit(ctx, pts, width) {
    ctx.lineWidth = width;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const q = pxFront(p[0], p[1]);
      if (i) ctx.lineTo(q[0], q[1]);
      else ctx.moveTo(q[0], q[1]);
    });
    ctx.stroke();
  }
  function browColor(hc) {
    const bc = L.col(hc);
    const lum = bc.r * 0.3 + bc.g * 0.59 + bc.b * 0.11;
    return lum > 0.2 ? L.shade(hc, 0.72) : hc;
  } // light brows read a touch darker than the hair
  function paintBrows(ctx, F, R, weight, mctx) {
    const hc = F.hairColor || 0x3a2616;
    const browCol = browColor(hc);
    const thick =
      (F.gender === "f" ? 0.62 : 0.86) * (F.mutant ? 1.6 : 1) * (weight || 1); // (were caterpillar-heavy)
    ctx.save();
    ctx.lineCap = "round";
    for (const sg of [-1, 1]) {
      const path = [
        [0.11, 0.255],
        [0.24, 0.3],
        [0.38, 0.322],
        [0.5, 0.305],
        [0.6, 0.265],
      ].map((p) => [sg * p[0], p[1]]);
      // soft underlayer so the brow reads at distance
      ctx.strokeStyle = modCol(browCol, F.skin, 0.2);
      strokeUnit(ctx, path.slice(0, 4), 9 * thick);
      strokeUnit(ctx, path.slice(2), 6 * thick);
      if (mctx) {
        mctx.strokeStyle = "rgba(255,255,255,0.3)";
        mctx.lineCap = "round";
        strokeUnit(mctx, path.slice(0, 4), 7 * thick);
        strokeUnit(mctx, path.slice(2), 4.5 * thick);
      }
      // individual hairs
      const N = F.maniac ? 260 : 420;
      for (let i = 0; i < N; i++) {
        const u = R(),
          seg = Math.min(3, Math.floor(u * 4)),
          fu = u * 4 - seg;
        const a = path[seg],
          b = path[seg + 1];
        const x0 = lerp(a[0], b[0], fu),
          y0 = lerp(a[1], b[1], fu);
        const w = 0.03 * (1 - u * 0.55) * thick;
        const off = (R() - 0.5) * 2 * w;
        const tx = b[0] - a[0],
          ty = b[1] - a[1],
          tl = Math.hypot(tx, ty) || 1;
        // hairs point up/out at the head of the brow, along it toward the tail
        const up = (1 - u) * 0.9;
        const dx = (tx / tl) * (1 - up),
          dy = (ty / tl) * (1 - up) + up;
        const len = 0.035 + R() * 0.03;
        const p0 = pxFront(x0 - (ty / tl) * off, y0 + (tx / tl) * off * sg),
          p1 = pxFront(
            x0 - (ty / tl) * off + dx * len,
            y0 + (tx / tl) * off * sg + dy * len,
          );
        ctx.strokeStyle = modCol(
          L.shade(browCol, 0.75 + R() * 0.5),
          F.skin,
          0.35 + R() * 0.4,
        );
        ctx.lineWidth = 0.7 + R() * 0.6;
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.stroke();
        if (mctx) {
          mctx.strokeStyle = "rgba(255,255,255,0.45)";
          mctx.lineWidth = ctx.lineWidth;
          mctx.beginPath();
          mctx.moveTo(p0[0], p0[1]);
          mctx.lineTo(p1[0], p1[1]);
          mctx.stroke();
        }
      }
    }
    ctx.restore();
  }
  /**
   * HAIR MARKER: pixels covered by painted hair (brows, stubble) get alpha
   * 0.2 — the shader then re-tints them with the per-instance HAIR tint
   * instead of the skin tint, so brows always match the (tinted) hair.
   */
  function markHair(ctx, mcv, stub, hairHex, browHex) {
    // only the brow band carries hair marks: work on its bounding box
    const a = pxFront(-0.72, 0.5),
      b = pxFront(0.72, 0.1);
    const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0])) - 4),
      x1 = Math.min(FT, Math.ceil(Math.max(a[0], b[0])) + 4);
    const y0 = Math.max(0, Math.floor(Math.min(a[1], b[1])) - 4),
      y1 = Math.min(FT, Math.ceil(Math.max(a[1], b[1])) + 4);
    const w = x1 - x0,
      h = y1 - y0;
    if (w <= 0 || h <= 0) return;
    const img = ctx.getImageData(x0, y0, w, h),
      D = img.data;
    const M = mcv ? mcv.getContext("2d").getImageData(x0, y0, w, h).data : null;
    const hb = L.col(browHex || hairHex || 0x3a2616),
      hh = L.col(hairHex || 0x3a2616);
    for (let i = 0, n = w * h; i < n; i++) {
      const mb = M ? M[i * 4 + 3] / 255 : 0,
        ms = stub ? stub[i] / 255 : 0;
      const m = Math.max(mb, ms);
      if (m <= 0.33) continue;
      const c = mb >= ms ? hb : hh;
      const k = (1.3 - 0.55 * m) * (0.75 + 0.5 * hash2(i, 77)); // denser = darker, per-hair variation
      D[i * 4] = Math.sqrt(clamp(c.r * k, 0, 1)) * 255;
      D[i * 4 + 1] = Math.sqrt(clamp(c.g * k, 0, 1)) * 255;
      D[i * 4 + 2] = Math.sqrt(clamp(c.b * k, 0, 1)) * 255;
      D[i * 4 + 3] = 51;
    }
    ctx.putImageData(img, x0, y0);
  }
  /** Iterate pixels in a param-space box; fn(x,y,z,idx) mutates ImageData. */
  function eachPixel(ctx, s0, s1, t0, t1, fn) {
    ensureLUT();
    const x0 = Math.max(0, Math.floor(s0 * FT)),
      x1 = Math.min(FT, Math.ceil(s1 * FT)),
      y0 = Math.max(0, Math.floor(t0 * TV * FT)),
      y1 = Math.min(Math.floor(FT * TV), Math.ceil(t1 * TV * FT));
    if (x1 <= x0 || y1 <= y0) return;
    const img = ctx.getImageData(x0, y0, x1 - x0, y1 - y0),
      D = img.data,
      w = x1 - x0;
    for (let py = y0; py < y1; py++) {
      const st = rowT[py * 2],
        y = rowT[py * 2 + 1];
      for (let pxl = x0; pxl < x1; pxl++) {
        const x = st * colA[pxl * 2],
          z = -st * colA[pxl * 2 + 1];
        fn(x, y, z, D, ((py - y0) * w + (pxl - x0)) * 4, pxl, py);
      }
    }
    ctx.putImageData(img, x0, y0);
  }
  /** Beard-shadow mask in unit-head space (0..1, soft edged). */
  function beardMask(x, y, z) {
    const ax = Math.abs(x);
    const yl = lerp(-0.32, -0.08, sm(0.3, 0.85, ax)); // cheek line: under the nose → sideburns (low on the cheek)
    let m = sm(yl + 0.03, yl - 0.12, y);
    m *=
      1 -
      Math.exp(
        -(Math.pow(x / 0.265, 6) + Math.pow((y - MOUTH_Y + 0.012) / 0.058, 6)),
      ); // lips stay clean
    m *= 1 - Math.exp(-(x * x) / 0.006) * band(y, -0.29, -0.1, 0.03); // nose tip / columella
    m *= sm(0.55, 0.15, z); // fades behind the jaw
    return m;
  }
  function paintStubble(ctx, F, R, kind) {
    const hc = L.col(F.hairColor || 0x2a1a10),
      sk = L.col(F.skin);
    // darken toward the hair colour (never brighten: blond stubble reads as shadow)
    const tr = clamp((hc.r + 0.01) / (sk.r + 0.01), 0.25, 1),
      tg = clamp((hc.g + 0.01) / (sk.g + 0.01), 0.25, 1),
      tb = clamp((hc.b + 0.01) / (sk.b + 0.01), 0.25, 1);
    const shadow = kind === "heavy" ? 0.42 : 0.17,
      dots = kind === "heavy" ? 0.45 : 0.26; // (light stubble at 0.3 read as a dirty smudge on the cheeks)
    eachPixel(ctx, 0.04, 0.96, 0.4, 1, (x, y, z, D, i, pxl, py) => {
      const m = beardMask(x, y, z);
      if (m <= 0.01) return;
      const h = hash2(pxl * 5 + 3, py * 11 + 1);
      const k = m * (shadow + (h < 0.35 ? dots * (0.6 + h) : 0));
      D[i] *= 1 - k * (1 - tr);
      D[i + 1] *= 1 - k * (1 - tg);
      D[i + 2] *= 1 - k * (1 - tb);
    });
  }
  function paintAge(ctx, F, R) {
    const k = F.age;
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = mulStyle(0.8, 0.74, 0.72, 0.35 * k);
    for (let i = 0; i < 3; i++) {
      const y = 0.45 + i * 0.07;
      strokeUnit(
        ctx,
        [
          [-0.35, y + 0.01],
          [-0.12, y - 0.01],
          [0.12, y + 0.012],
          [0.35, y - 0.005],
        ],
        1.2,
      );
    }
    for (const sg of [-1, 1]) {
      for (let i = 0; i < 3; i++)
        strokeUnit(
          ctx,
          [
            [sg * 0.55, 0.13 + (i - 1) * 0.04],
            [sg * 0.64, 0.14 + (i - 1) * 0.07],
          ],
          1.0,
        ); // crow's feet
      strokeUnit(
        ctx,
        [
          [sg * 0.25, 0.0],
          [sg * 0.35, -0.03],
          [sg * 0.45, 0.0],
        ],
        1.1,
      ); // under-eye bags
      strokeUnit(
        ctx,
        [
          [sg * 0.15, -0.22],
          [sg * 0.23, -0.34],
          [sg * 0.31, -0.48],
        ],
        1.6,
      ); // deeper nasolabial
      strokeUnit(
        ctx,
        [
          [sg * 0.28, -0.52],
          [sg * 0.31, -0.62],
        ],
        1.2,
      ); // marionette lines
    }
    // liver spots
    ctx.fillStyle = mulStyle(0.82, 0.72, 0.62, 0.45 * k);
    for (let i = 0; i < 26; i++) {
      const p = pxFront((R() - 0.5) * 1.3, 0.2 + R() * 0.55);
      ctx.beginPath();
      ctx.arc(p[0], p[1], 0.6 + R() * 1.4, 0, PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function paintFreckles(ctx, R) {
    ctx.save();
    for (let i = 0; i < 160; i++) {
      const x = (R() - 0.5) * 1.1,
        y = -0.05 - R() * 0.25 + Math.abs(x) * 0.1;
      if (Math.abs(x) < 0.05 && y > -0.1) continue;
      const p = pxFront(x, y);
      ctx.fillStyle = mulStyle(0.84, 0.7, 0.58, 0.35 + R() * 0.35);
      ctx.beginPath();
      ctx.arc(p[0], p[1], 0.5 + R() * 0.9, 0, PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
