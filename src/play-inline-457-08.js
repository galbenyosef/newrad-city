// play-inline-457 08 — style
// Lines 1703-1764 of readable/play-inline-457.pretty.js (statement-aligned).
  H.beard = function (R, b, style, color, C, RX, RY, RZ) {
    const hs = b.headS;
    const mat = {
      color: L.shade(color, 0.9),
      region: "fur",
      rough: 0.95,
      noise: 0.18,
    };
    const g = P.sphere(1, 1, 1, 22, 16);
    P.deform(g, (v) => {
      const front = v.z < 0.15;
      let keep = front && v.y < -0.2 && Math.abs(v.x) < 0.95;
      if (style === "stubble") keep = keep && v.y < -0.3;
      if (style === "moustache")
        keep = v.z < -0.8 && v.y < -0.25 && v.y > -0.45 && Math.abs(v.x) < 0.38;
      // leave the mouth free
      if (
        keep &&
        style !== "moustache" &&
        v.z < -0.6 &&
        v.y > -0.55 &&
        v.y < -0.33 &&
        Math.abs(v.x) < 0.26
      )
        keep = false;
      const k = keep
        ? style === "full"
          ? 1.1
          : style === "stubble"
            ? 1.012
            : 1.05
        : 0.85;
      let x = v.x,
        y = v.y,
        z = v.z;
      if (y < -0.15) {
        const t = (-y - 0.15) / 0.85;
        x *= lerp(1, 0.8, Math.pow(t, 0.8));
        if (z < 0) z *= lerp(1, 1.06, t);
      }
      if (keep && style === "full" && y < -0.6) y -= 0.25;
      v.set(C[0] + x * RX * k, C[1] + y * RY * k, C[2] + z * RZ * k);
    });
    R.add("head", g, mat);
    if (style === "full" || style === "goatee") {
      R.add(
        "head",
        P.xf(
          P.sphere(0.024 * hs, 0.006 * hs, 0.01 * hs, 8, 5),
          C[0],
          C[1] - 0.046 * hs,
          C[2] - 0.095 * hs,
        ),
        mat,
      );
    }
  };

  // ------------------------------------------------------------------
  // HEADWEAR & ACCESSORIES (on head bone unless noted)
  // ------------------------------------------------------------------
  const HC = (b) => [0, 0.105 * b.headS, -0.01 * b.headS];
