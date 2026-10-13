// play-inline-419 04 — math
// Lines 685-840 of readable/play-inline-419.pretty.js (statement-aligned).
  K.ringWall = function (b, mat, cx, cz, r, y0, y1, a0, a1, seg, inward, o) {
    o = o || {};
    seg = seg || 16;
    for (let i = 0; i < seg; i++) {
      const t0 = a0 + ((a1 - a0) * i) / seg,
        t1 = a0 + ((a1 - a0) * (i + 1)) / seg;
      const p0 = [cx + Math.cos(t0) * r, y0, cz - Math.sin(t0) * r],
        p1 = [cx + Math.cos(t1) * r, y0, cz - Math.sin(t1) * r];
      const tm = (t0 + t1) / 2,
        nx = Math.cos(tm) * (inward ? -1 : 1),
        nz = -Math.sin(tm) * (inward ? -1 : 1);
      b.quadN(
        mat,
        p0,
        p1,
        [p1[0], y1, p1[2]],
        [p0[0], y1, p0[2]],
        [nx, 0, nz],
        { tint: o.tint, grime: o.grime },
      );
    }
    if (o.col !== false) {
      const n = Math.max(4, Math.ceil(seg / 2));
      for (let i = 0; i < n; i++) {
        const tm = a0 + ((a1 - a0) * (i + 0.5)) / n,
          px = cx + Math.cos(tm) * r,
          pz = cz - Math.sin(tm) * r;
        const len = (Math.abs(a1 - a0) * r) / n + 0.1;
        b.ocol(px, pz, len, 0.3, y0, y1, -tm + PI / 2, { tag: "wall" });
      }
    }
  };

  /** Lettering plate (alpha) — carved / painted / raised letters. */
  K.letters = function (b, x, y, z, nx, nz, w, h, text, o) {
    o = o || {};
    const key = "letters_" + text + "_" + (o.fg || "") + (o.font || "");
    const px = Math.min(2048, Math.max(256, Math.round((w / h) * 96)));
    const rect = K.paint("art", key, px, 96, function (x2, X, Y, W, H) {
      x2.clearRect(X, Y, W, H);
      x2.textAlign = "center";
      x2.textBaseline = "middle";
      x2.font =
        (o.weight || "bold") +
        " " +
        Math.round(H * (o.size || 0.72)) +
        "px " +
        (o.font || 'Georgia, "Times New Roman", serif');
      if (o.shadow !== false) {
        x2.fillStyle = "rgba(0,0,0,0.55)";
        x2.fillText(text, X + W / 2 + 2, Y + H / 2 + 3, W * 0.96);
      }
      x2.fillStyle = o.fg || "#e6dcc4";
      x2.fillText(text, X + W / 2, Y + H / 2, W * 0.96);
      if (o.weather !== false) {
        const r = K.rng(key);
        for (let k = 0; k < 30; k++) {
          x2.clearRect(X + r() * W, Y + r() * H, 1 + r() * 6, 1 + r() * 4);
        }
      }
    });
    b.plate("art", x, y, z, nx, nz, w, h, rect, {
      off: o.off || 0.03,
      tint: o.tint,
    });
  };

  /** A wishbone (V of two thin bones), hanging from (x,y,z). */
  K.wishbone = function (b, x, y, z, yaw, s) {
    s = s || 0.07;
    const c = Math.cos(yaw),
      sn = Math.sin(yaw);
    for (const e of [-1, 1])
      b.pipe(
        "bone",
        x,
        y,
        z,
        x + e * s * 0.45 * c,
        y - s,
        z - e * s * 0.45 * sn,
        0.0045,
        3,
        { tint: [0.85, 0.8, 0.66], grime: 0.4 },
      );
    b.pipe("black_iron", x, y, z, x, y + 0.04, z, 0.002, 3);
  };

  /** Seated / standing bronze figure (statue) facing yaw (three.js). o: {seated, scale, mat} */
  K.statueFigure = function (b, x, y, z, yaw, o) {
    o = o || {};
    const s = o.scale || 1,
      mat = o.mat || "bronze",
      t = o.tint || [0.45, 0.5, 0.4];
    const c = Math.cos(yaw),
      sn = Math.sin(yaw);
    const L = (lx, ly, lz) => [
      x + lx * c + lz * sn,
      y + ly,
      z - lx * sn + lz * c,
    ];
    const box = (lx, ly, lz, w, h, d, extra) => {
      const p = L(lx, ly, lz);
      b.box(
        mat,
        p[0],
        p[1],
        p[2],
        w * s,
        h * s,
        d * s,
        Object.assign({ yaw, tint: t }, extra || {}),
      );
    };
    const sph = (lx, ly, lz, sx, sy, sz) => {
      const p = L(lx, ly, lz);
      b.geo(mat, K.sphereGeo(), {
        x: p[0],
        y: p[1],
        z: p[2],
        sx: sx * s,
        sy: sy * s,
        sz: sz * s,
        ry: yaw,
        tint: t,
      });
    };
    if (o.seated) {
      // chair
      box(0, 0, 0.1 * s, 1.0, 0.55, 0.9, { tint: t.map((v) => v * 0.85) });
      box(0, 0.55 * s, 0.5 * s, 1.0, 1.1, 0.14, {
        tint: t.map((v) => v * 0.85),
      });
      // legs & robe
      box(0, 0.55 * s, -0.05 * s, 0.8, 0.28, 0.9);
      for (const e of [-1, 1]) {
        box(e * 0.2 * s, 0, -0.55 * s, 0.24, 0.6, 0.28);
        box(e * 0.2 * s, 0, -0.68 * s, 0.26, 0.08, 0.36);
      }
      // torso, coat, head (with beard)
      box(0, 0.8 * s, 0.15 * s, 0.66, 0.8, 0.42);
      box(0, 0.75 * s, 0.1 * s, 0.76, 0.4, 0.55);
      sph(0, 1.78 * s, 0.1 * s, 0.14, 0.17, 0.15);
      sph(0, 1.66 * s, 0.01 * s, 0.12, 0.1, 0.08); // beard
      for (const e of [-1, 1]) {
        box(e * 0.38 * s, 1.1 * s, 0.05 * s, 0.14, 0.5, 0.16);
        box(e * 0.38 * s, 0.9 * s, -0.2 * s, 0.14, 0.14, 0.45);
      }
      box(0.38 * s, 0.97 * s, -0.42 * s, 0.22, 0.1, 0.3); // book / papers in hand
    } else {
      for (const e of [-1, 1]) box(e * 0.13 * s, 0, 0, 0.2, 0.9, 0.24);
      box(0, 0.9 * s, 0, 0.5, 0.7, 0.3);
      sph(0, 1.78 * s, 0, 0.12, 0.15, 0.13);
      for (const e of [-1, 1]) box(e * 0.33 * s, 0.95 * s, 0, 0.12, 0.62, 0.14);
    }
  };
