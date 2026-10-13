// play-inline-383 03 — tint
// Lines 316-603 of readable/play-inline-383.pretty.js (statement-aligned).
  K.column = function (b, x, y0, z, r, h, o) {
    o = o || {};
    const kind = o.kind || "doric",
      mat = o.mat || "limestone",
      tint = o.tint;
    const capH =
      kind === "ionic" ? r * 0.9 : kind === "iron" ? r * 1.6 : r * 0.7;
    const baseH = o.base === false ? 0 : r * 0.6;
    if (baseH) {
      b.box(mat, x, y0, z, r * 2.5, baseH * 0.5, r * 2.5, { tint });
      b.cyl(mat, x, y0 + baseH * 0.5, z, r * 1.2, r * 1.05, baseH * 0.5, 14, {
        tint,
      });
    }
    const sh = h - capH - baseH;
    if (o.flutes !== false && kind !== "iron")
      K.flutedShaft(
        b,
        o.shaftMat || mat,
        x,
        y0 + baseH,
        z,
        r,
        r * 0.86,
        sh,
        o.nFlutes || (kind === "doric" ? 20 : 24),
        tint,
      );
    else
      b.cyl(
        mat,
        x,
        y0 + baseH,
        z,
        r,
        r * (kind === "iron" ? 1 : 0.86),
        sh,
        kind === "iron" ? 10 : 16,
        { tint, top: false },
      );
    const yc = y0 + h - capH;
    if (kind === "iron") {
      b.cyl(mat, x, yc, z, r * 0.9, r * 1.8, capH * 0.7, 10, { tint });
      b.box(mat, x, yc + capH * 0.7, z, r * 3.4, capH * 0.3, r * 3.4, { tint });
    } else if (kind === "ionic") {
      b.cyl(mat, x, yc, z, r * 0.9, r * 1.05, capH * 0.35, 14, { tint });
      b.box(mat, x, yc + capH * 0.35, z, r * 2.5, capH * 0.3, r * 2.0, {
        tint,
      });
      for (const s of [-1, 1])
        b.geo(mat, K.unitCyl(10), {
          x: x + s * r * 1.15,
          y: yc + capH * 0.42,
          z,
          sx: capH * 0.32,
          sy: r * 2.1,
          sz: capH * 0.32,
          rx: PI / 2,
          tint,
        }); // volutes
      b.box(mat, x, yc + capH * 0.65, z, r * 2.7, capH * 0.35, r * 2.7, {
        tint,
      });
    } else {
      b.cyl(mat, x, yc, z, r * 0.88, r * 1.2, capH * 0.5, 14, { tint });
      b.box(mat, x, yc + capH * 0.5, z, r * 2.6, capH * 0.5, r * 2.6, { tint });
    }
  };

  /**
   * Fluted, tapering shaft: n concave flutes (two facets meeting 7 % inside the surface, shaded darker) separated by
   * narrow arrises at full radius — reads as real fluting at any distance (flat-shaded facets catch the sun).
   */
  K.flutedShaft = function (b, mat, x, y0, z, r0, r1, h, n, tint) {
    const t = tint || [1, 1, 1],
      tf = t.map((v) => v * 0.8),
      y1 = y0 + h,
      span = (PI * 2) / n;
    const P = (a, rr, y) => [x + Math.cos(a) * rr, y, z - Math.sin(a) * rr];
    for (let i = 0; i < n; i++) {
      const a0 = i * span,
        a1 = a0 + span * 0.16,
        a2 = a1 + (span - span * 0.16) / 2,
        a3 = (i + 1) * span;
      const quad = (aa, ab, ra, rb, tn) => {
        const am = (aa + ab) / 2;
        b.quadN(
          mat,
          P(aa, r0 * ra, y0),
          P(ab, r0 * rb, y0),
          P(ab, r1 * rb, y1),
          P(aa, r1 * ra, y1),
          [Math.cos(am), 0, -Math.sin(am)],
          { tint: tn },
        );
      };
      quad(a0, a1, 1, 1, t);
      quad(a1, a2, 1, 0.93, tf);
      quad(
        a2,
        a3,
        0.93,
        1,
        tf.map((v) => v * 1.1),
      );
    }
  };

  /** Flat pilaster on a façade (x,z on wall surface, facing nx,nz). */
  K.pilaster = function (b, x, y0, z, nx, nz, w, h, o) {
    o = o || {};
    const yaw = Math.atan2(nx, nz),
      d = o.depth || 0.25,
      mat = o.mat || "limestone";
    b.box(mat, x + (nx * d) / 2, y0, z + (nz * d) / 2, w, h, d, {
      yaw,
      tint: o.tint,
    });
    b.box(
      mat,
      x + nx * (d / 2 + 0.05),
      y0 + h - 0.35,
      z + nz * (d / 2 + 0.05),
      w + 0.2,
      0.35,
      d + 0.1,
      { yaw, tint: o.tint },
    );
    b.box(
      mat,
      x + nx * (d / 2 + 0.05),
      y0,
      z + nz * (d / 2 + 0.05),
      w + 0.2,
      0.3,
      d + 0.1,
      { yaw, tint: o.tint },
    );
  };

  /**
   * Cornice along a façade from A to B (wall surface line) at height y, projecting towards (nx,nz).
   * o: {mat, tint, depth (projection), h (total height), brackets (spacing, 0 = none), bracketMat}
   */
  K.cornice = function (b, ax, az, bx, bz, y, nx, nz, o) {
    o = o || {};
    const mat = o.mat || "limestone",
      tint = o.tint,
      dep = o.depth || 0.8,
      H = o.h || 0.9;
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.05) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      yaw = Math.atan2(nx, nz);
    const cx = (ax + bx) / 2,
      cz = (az + bz) / 2;
    // bed moulding, corona, cymatium (stepping out)
    const steps = [
      [0.0, 0.18, 0.2],
      [0.18, 0.2, 0.38],
      [0.5, 0.26, dep],
      [0.76, 0.14, dep + 0.08],
    ];
    for (const [yo, hh, dd] of steps) {
      if (yo >= H) break;
      b.box(
        mat,
        cx + (nx * dd) / 2,
        y + yo * (H / 0.9),
        cz + (nz * dd) / 2,
        len + dd * 0.9,
        hh * (H / 0.9),
        dd,
        { yaw, tint, faces: "nsewtb" },
      );
    }
    const sp = o.brackets === undefined ? 1.1 : o.brackets;
    if (sp > 0) {
      const n = Math.floor(len / sp);
      for (let i = 0; i <= n; i++) {
        const t = -len / 2 + (len - n * sp) / 2 + i * sp;
        const px = cx + ux * t,
          pz = cz + uz * t;
        b.box(
          o.bracketMat || mat,
          px + nx * 0.22,
          y - 0.35,
          pz + nz * 0.22,
          0.14,
          0.52,
          0.42,
          { yaw, tint },
        );
      }
    }
  };

  /** Cylindrical wall from angle a0 to a1 (radians, 0 = +x, counter-clockwise seen from above → −z). inward: normals toward the centre. */
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
