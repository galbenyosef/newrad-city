// play-inline-458 03 — math
// Lines 297-609 of readable/play-inline-458.pretty.js (statement-aligned).
  function sculpt(face, x, y, z, out, opts) {
    const K = face._k;
    const mutant = K.mutant,
      female = K.female;
    let shade = 1,
      warm = 0;
    // BASE FORM: the unit sphere is re-lofted through per-height cross-sections
    // (flat-sided cranium, front/side planes on the face, a square jaw with a
    // gonial corner, forward chin). Features below are evaluated in the
    // ORIGINAL direction space (so they stay registered to the face texture)
    // and the loft delta is added at the end.
    loft(K, x, y, z, _lo);
    const dX = _lo[0] - x,
      dY = _lo[1] - y,
      dZ = _lo[2] - z;
    // temples: a shallow hollow behind the lateral brow (front half only)
    const gt = K.gaunt || 0; // 0 = ordinary, ~0.6 = a Maniac
    x *=
      1 -
      (0.025 + 0.035 * gt) *
        sm(0.7, 0.8, Math.abs(x)) *
        band(y, -0.2, 0.3, 0.08) *
        sm(0.2, -0.3, z);
    const f = sm(0.15, 0.7, -z); // front-facing weight
    if (f > 0) {
      // forehead: gently sloped back, fuller on women
      z += (female ? 0.0 : 0.02) * sm(0.45, 0.8, y) * f;
      // brow ridge
      const bw =
        Math.exp(-Math.pow((y - 0.29) / 0.085, 2)) * sm(0.8, 0.3, Math.abs(x));
      z -= ((female ? 0.07 : 0.088) * K.browK + (mutant ? 0.11 : 0)) * bw * f;
      shade -=
        0.16 *
        Math.exp(-Math.pow((y - 0.2) / 0.05, 2)) *
        sm(0.7, 0.3, Math.abs(x)) *
        f; // under the brow
      for (const sg of [-1, 1]) {
        const dx = x - sg * 0.355,
          dy = y - 0.125;
        // eye sockets: flat-bottomed, the eyeball sits in them
        if (!opts || !opts.noSocket) {
          const e = Math.exp(
            -Math.pow((dx * dx) / 0.016 + (dy * dy) / 0.0105, 1.5),
          );
          z += K.socket * e * f;
          shade -= 0.3 * e * f;
        }
        // upper-lid fold under the brow and a soft lower-lid bag
        if (!mutant) {
          z -=
            0.022 *
            Math.exp(
              -Math.pow(dx / 0.13, 2) - Math.pow((y - 0.215) / 0.035, 2),
            ) *
            f;
          z -=
            (0.012 + K.age * 0.012) *
            Math.exp(-Math.pow(dx / 0.11, 2) - Math.pow((y - 0.02) / 0.03, 2)) *
            f;
        }
        // cheekbones
        const cb = gau(x - sg * 0.5, y + 0.04, 0.026);
        z -= lerp(0.045, 0.012, gt) * K.zyg * cb * f;
        x += sg * 0.03 * K.zyg * cb;
        warm += mutant ? 0 : cb * (female ? 0.4 : 0.14);
        shade += 0.04 * K.zyg * cb * f; // the cheekbone plane catches the light
        // zygomatic arch running back to the ear, and the sub-zygomatic hollow under it
        const ax0 = Math.abs(x);
        const arch =
          Math.exp(-Math.pow((y + 0.02 - 0.06 * (ax0 - 0.6)) / 0.055, 2)) *
          sm(0.5, 0.72, ax0) *
          sm(0.35, -0.05, z) *
          (x * sg > 0 ? 1 : 0);
        x += sg * 0.022 * K.zyg * arch;
        const sub = gau(x - sg * 0.6, y + 0.28, 0.022) * sm(0.35, -0.3, z);
        x -= sg * lerp(0.018 + K.age * 0.015, 0.07, gt) * sub;
        shade -= lerp(0.05, 0.14, gt) * sub;
        // cheek hollows (gaunt on Maniacs)
        const hc = gau(x - sg * 0.48, y + 0.32, 0.03);
        z += lerp(0.02 + K.age * 0.02, 0.08, gt) * hc * f;
        shade -= lerp(0.05, 0.16, gt) * hc * f;
        // nasolabial folds
        const nd = segD(x, y, sg * 0.14, -0.21, sg * 0.3, -0.47);
        const nf = Math.exp(-Math.pow(nd / 0.03, 2)) * f;
        z += (0.02 + K.age * 0.018) * nf;
        shade -= 0.12 * nf * (1 + K.age * 0.6);
        // cheek volume beside the fold
        if (gt < 0.5)
          z -= 0.02 * (1 - gt) * gau(x - sg * 0.36, y + 0.3, 0.012) * f;
      }
      {
        // ---- NOSE: bridge → tip → columella, with alae
        const ns = K.nose;
        const nr = clamp((0.17 - y) / 0.34, 0, 1);
        // (r2: ~12 % more projection — in profile the nose read as a small bump on a flat face)
        let p =
          0.034 +
          0.152 * (0.5 * nr + 0.5 * Math.pow(nr, 1.7)) * K.noseL +
          0.016 * K.hump * Math.exp(-Math.pow((y - 0.0) / 0.07, 2)); // straight bridge (+ hump)
        p *= sm(0.34, 0.16, y);
        if (y < -0.17) p = 0.186 * Math.pow(sm(-0.29, -0.17, y), 0.55);
        if (mutant) p *= 0.75;
        const w =
          (0.062 + 0.058 * sm(0.05, -0.2, y)) *
          (mutant ? 1.5 : 1) *
          (0.9 + ns * 0.1);
        const nose = p * Math.exp(-Math.pow((x * x) / (w * w), 1.6)); // flat-topped bridge with distinct side planes
        z -= nose * f * ns;
        for (const sg of [-1, 1]) {
          const al = gau(x - sg * 0.1 * (mutant ? 1.3 : 1), y + 0.228, 0.0028);
          z -= 0.06 * al * f * ns;
          shade -=
            0.07 *
            Math.exp(
              -Math.pow(
                (Math.hypot(x - sg * 0.1, (y + 0.228) * 1.2) - 0.065) / 0.014,
                2,
              ),
            ) *
            f; // alar crease
        }
        z -= 0.03 * gau(x * 0.8, y + 0.185, 0.005) * f * ns; // rounded tip (bulb)
        shade +=
          0.05 * Math.exp(-(x * x) / 0.004) * band(y, -0.18, 0.15, 0.05) * f; // lit bridge
        // philtrum groove & ridges
        const ph = band(y, -0.37, -0.27, 0.02);
        z += 0.012 * Math.exp(-(x * x) / 0.0012) * ph * f;
        z -=
          0.006 *
          (Math.exp(-Math.pow((x - 0.05) / 0.02, 2)) +
            Math.exp(-Math.pow((x + 0.05) / 0.02, 2))) *
          ph *
          f;
      }
      // cavity occlusion that reads under flat/ambient light: sides of the
      // nose, under the nose, inner eye corners, mouth corners, temples
      if (!mutant) {
        const ax = Math.abs(x);
        shade -=
          0.13 *
          Math.exp(-Math.pow((ax - 0.14) / 0.045, 2)) *
          band(y, -0.2, 0.1, 0.05) *
          f;
        shade -=
          (female ? 0.035 : 0.06) *
          Math.exp(-(x * x) / 0.012) *
          Math.exp(-Math.pow((y + 0.3) / 0.03, 2)) *
          f; // (0.1 read as a moustache on pale skin)
        shade -=
          0.14 *
          Math.exp(-(Math.pow(ax - 0.2, 2) + Math.pow(y - 0.1, 2)) / 0.004) *
          f;
        shade -=
          0.2 *
          Math.exp(
            -(
              Math.pow(ax - K.mouthW * 1.02, 2) / 0.0018 +
              Math.pow(y - MOUTH_Y, 2) / 0.0025
            ),
          ) *
          f;
        shade -=
          0.07 *
          Math.exp(-Math.pow((ax - 0.78) / 0.12, 2)) *
          band(y, 0.05, 0.4, 0.1) *
          f;
      }
      // muzzle (orbicularis) and the MOUTH RECESS (oral cavity behind the lips)
      z -= (mutant ? 0.08 : 0.024) * gau(x * 0.8, y - MOUTH_Y, 0.03) * f;
      if (!opts || !opts.noRecess) {
        const rw = K.mouthW + 0.01;
        const rm =
          Math.exp(-Math.pow((x / rw) * (x / rw), 2.5)) *
          Math.exp(-Math.pow((y - MOUTH_Y) / 0.042, 2));
        z += 0.17 * rm * f;
        shade -= 0.45 * rm * f;
      }
      // chin
      const cn = gau(x * (female ? 1.3 : 1), y + 0.72, 0.03);
      z -= (female ? 0.04 : 0.07) * cn * f;
      if (!female) x *= 1 + 0.08 * cn;
      z += 0.018 * gau(x * 0.7, y + 0.6, 0.004) * f;
      shade -= 0.08 * gau(x, y + 0.6, 0.006) * f; // mentolabial sulcus
    }
    if (mutant) {
      if (y > 0.1) {
        const nn = L.noise3(x * 2.6 + 1.3, y * 2.6, z * 2.6) - 0.5;
        const k = sm(0.1, 0.25, y);
        x *= 1 + nn * 0.12 * k;
        y *= 1 + nn * 0.08 * k;
        z *= 1 + nn * 0.12 * k;
      }
      if (y < -0.4) {
        const k = sm(-0.4, -0.8, y);
        z -= 0.11 * k * sm(0.3, 0.1, z);
        x *= 1 + 0.12 * k;
      }
    }
    if (y < -0.62)
      shade -= 0.2 * sm(-0.66, -0.97, y) * (1 - 0.75 * sm(0.2, 0.7, -z));
    x += dX;
    y += dY;
    z += dZ;
    // under the jaw: a plane rising from the chin back to the throat (the
    // mandible's lower border reads as a crisp line from chin to gonion)
    if (y < -0.5) {
      const yu = -0.835 + 0.3 * sm(-0.75, 0.25, z) - 0.035 * (K.chinL || 0);
      const kk = 0.05,
        h = Math.max(kk - Math.abs(y - yu), 0) / kk;
      const ny = Math.max(y, yu) + h * h * kk * 0.25; // smooth max: points below the plane are lifted onto it
      shade -= 0.14 * clamp((ny - y) / 0.1, 0, 1);
      y = ny;
    }
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = clamp(shade, 0.4, 1.08);
    out[4] = warm;
    out[5] = 0;
    return out;
  }
  /** Sculpted surface point (unit space) roughly in front of (x, y). */
  function surfAt(face, x, y, opts) {
    const o = [0, 0, 0, 0, 0, 0];
    const z = -Math.sqrt(Math.max(0.02, 1 - x * x - y * y));
    return sculpt(face, x, y, z, o, opts);
  }

  // ==================================================================
  // FACE SKIN WEIGHTS (chin → jaw hinge, lip corners, brows, lids)
  // ==================================================================
  function faceSkin(K, ux, uy, uz, part) {
    const cand = [];
    const ax = Math.abs(ux),
      mw = K.mouthW;
    const side = ux < 0 ? "L" : "R"; // skeleton convention: 'L' is the −X side
    // ---- jaw: everything below a line from the mouth corners back to the ear lobes
    let jw = 0;
    if (part === "lowerLip" || part === "lowerTeeth") jw = 1;
    else if (part !== "upperLip") {
      const yl = MOUTH_Y + Math.max(0, ax - mw * 0.95) * 0.34;
      const inMouth = sm(mw + 0.05, mw - 0.02, ax) * sm(-0.2, -0.6, uz);
      const fe = lerp(0.075, 0.012, inMouth);
      jw = sm(yl + fe * 0.35, yl - fe, uy) * sm(0.45, 0.1, uz);
      if (uy < -0.93) jw *= sm(0.1, -0.3, uz); // bottom cap (inside the neck) mostly stays
    }
    if (jw > 0.004) cand.push(["jaw", jw]);
    // ---- mouth corners (and the cheeks they pull on)
    const sg = ux < 0 ? -1 : 1;
    let wc = 0;
    if (part === "upperLip" || part === "lowerLip")
      wc = sm(0.25, 1.0, ax / mw) * 0.95;
    else if (part !== "lowerTeeth" && part !== "teeth") {
      wc =
        0.85 *
          Math.exp(
            -(Math.pow(ux - sg * mw, 2) + Math.pow(uy - MOUTH_Y, 2)) / 0.02,
          ) +
        0.32 *
          Math.exp(
            -(Math.pow(ux - sg * 0.45, 2) + Math.pow(uy + 0.1, 2)) / 0.03,
          );
      wc *= sm(0.35, -0.2, uz);
    }
    if (wc > 0.004) cand.push(["mouth" + side, Math.min(1, wc)]);
    // ---- upper lip / philtrum
    let wu = 0;
    if (part === "upperLip") wu = (1 - sm(0.25, 1.0, ax / mw)) * 0.9;
    else if (!part)
      wu =
        0.55 *
        Math.exp(-((ux * ux) / 0.03 + Math.pow(uy + 0.345, 2) / 0.004)) *
        sm(MOUTH_Y - 0.01, MOUTH_Y + 0.03, uy) *
        sm(0.2, -0.3, uz);
    if (wu > 0.004) cand.push(["lipU", wu]);
    if (!part) {
      // ---- brows drag the forehead skin
      const dy = uy - 0.3;
      const wb =
        Math.exp(
          -(
            Math.pow(ux - sg * 0.33, 2) / 0.05 +
            (dy * dy) / (dy > 0 ? 0.07 : 0.009)
          ),
        ) *
        sm(0.14, 0.24, uy) *
        sm(0.4, -0.2, uz);
      if (wb > 0.004) cand.push(["brow" + side, wb * 0.95]);
      // ---- lower lids pull a little cheek skin with them (squint / smile)
      const wl =
        0.4 *
        Math.exp(
          -(
            Math.pow(ux - sg * 0.355, 2) / 0.012 +
            Math.pow(uy - 0.03, 2) / 0.005
          ),
        ) *
        sm(0.2, -0.5, uz);
      if (wl > 0.004) cand.push(["lidLo" + side, wl]);
    }
    cand.sort((a, b) => b[1] - a[1]);
    if (cand.length > 3) cand.length = 3;
    return cand;
  }

  // ==================================================================
  // LIP / TOOTH / LID GEOMETRY HELPERS
  // ==================================================================
  /**
   * Closed tube along the mouth width with an elliptical cross-section.
   * ctr(u) → [x,y,z] centre; radius(u) → [rv, rz]; tilt(u) → radians (front
   * points down for +tilt); u ∈ [−1,1]. uv → the lips swatch.
   */
