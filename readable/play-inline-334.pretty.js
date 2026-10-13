/* src/poi_eastvillage/06_arch.js */
/* =====================================================================
 * NEW RAD CITY — poi_eastvillage / 06_arch.js
 * Classical / Italianate / Georgian architecture helpers used by the
 * three East Village POIs (all local coords on a kit builder `b`):
 *   K.archWin     round-arched window with moulded surround + keystone
 *   K.column      classical column (Doric / Ionic / cast-iron)
 *   K.pilaster    flat engaged pilaster
 *   K.cornice     stepped cornice with modillion brackets along a façade
 *   K.ringWall    cylindrical wall section (inward / outward facing)
 *   K.letters     raised / painted lettering plate (alpha)
 *   K.sash        Georgian multi-pane sash window
 *   K.wishbone    tiny wishbone (O'Rourke's gas lamp)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const EV = G._pev;
  const K = EV.kit;
  const PI = Math.PI;

  /**
   * Round-arched window. (x,z) = centre on the wall surface, yb = bottom of the opening,
   * facing (nx,nz). w = width, h = total height (arch included).
   * o: {state 'glass'|'broken'|'boarded'|'dark'|'lit', surround mat, surroundTint, fw (surround width),
   *     depth, keystone (bool), sill (bool), mullion (bool), seg (arch segments), paneTint}
   */
  K.archWin = function (b, x, yb, z, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz,
      rz = -nx;
    const R = w / 2,
      hr = Math.max(0.1, h - R);
    const d0 = 0.015;
    const P = (u, v, d) => [x + rx * u + nx * d, yb + v, z + rz * u + nz * d];
    const n = [nx, 0, nz];
    const st = o.state || "glass";
    const back =
      st === "glass"
        ? "glass"
        : st === "lit"
          ? "lamp"
          : st === "boarded"
            ? "wood_rotten"
            : "paint_black";
    const tint =
      o.paneTint ||
      (st === "glass"
        ? [0.42, 0.5, 0.5]
        : st === "lit"
          ? [0.95, 0.66, 0.36]
          : st === "boarded"
            ? [0.55, 0.47, 0.4]
            : [0.035, 0.035, 0.035]);
    const N = o.seg || 8;
    // pane: rectangle + fan
    b.quadN(back, P(-R, 0, d0), P(R, 0, d0), P(R, hr, d0), P(-R, hr, d0), n, {
      tint,
      grime: 0.2,
    });
    for (let i = 0; i < N; i++) {
      const a0 = (PI * i) / N,
        a1 = (PI * (i + 1)) / N;
      const C = P(0, hr, d0),
        A = P(Math.cos(a0) * R, hr + Math.sin(a0) * R, d0),
        B = P(Math.cos(a1) * R, hr + Math.sin(a1) * R, d0);
      b.quadN(back, C, A, B, B, n, { tint, grime: 0.2 });
    }
    if (st === "broken") {
      const r = K.rng((x * 17 + yb * 5 + z * 3) | 0);
      for (let k = 0; k < 3; k++) {
        const u = (r() - 0.5) * w * 0.7;
        b.quadN(
          "glass",
          P(u - 0.12, 0, d0 + 0.004),
          P(u + 0.16, 0, d0 + 0.004),
          P(u + 0.04, 0.3 + r() * 0.6, d0 + 0.004),
          P(u, 0.25 + r() * 0.5, d0 + 0.004),
          n,
          { tint: [0.45, 0.52, 0.52] },
        );
      }
    }
    const fm = o.frame || "paint_black";
    if (st !== "boarded" && o.mullion !== false) {
      // glazing bars: centre mullion, transom at the springing line, radial bars in the fan
      const m0 = P(0, 0, d0 + 0.03),
        m1 = P(0, hr + R, d0 + 0.03);
      b.beam(fm, m0[0], m0[1], m0[2], m1[0], m1[1], m1[2], 0.05, 0.04, {
        grime: 0.2,
      });
      const t0 = P(-R, hr, d0 + 0.03),
        t1 = P(R, hr, d0 + 0.03);
      b.beam(fm, t0[0], t0[1], t0[2], t1[0], t1[1], t1[2], 0.05, 0.04, {
        grime: 0.2,
      });
      if (hr > 1.2) {
        const q0 = P(-R, hr * 0.5, d0 + 0.03),
          q1 = P(R, hr * 0.5, d0 + 0.03);
        b.beam(fm, q0[0], q0[1], q0[2], q1[0], q1[1], q1[2], 0.04, 0.04, {
          grime: 0.2,
        });
      }
    }
    if (st === "boarded") {
      const r = K.rng((x * 13 + yb * 7 + z * 5) | 0);
      for (let i = 0; i < 3; i++) {
        const yy = 0.3 + (i * (hr - 0.3)) / 2 + (r() - 0.5) * 0.2;
        const a = P(-R - 0.08, yy + (r() - 0.5) * 0.25, 0.12),
          c = P(R + 0.08, yy + (r() - 0.5) * 0.25, 0.12);
        b.beam("wood_rotten", a[0], a[1], a[2], c[0], c[1], c[2], 0.22, 0.03, {
          tint: [0.7, 0.6, 0.5],
        });
      }
    }
    // surround: jambs + arch moulding + keystone + sill
    const sm = o.surround || "brownstone",
      stn = o.surroundTint,
      fw = o.fw || 0.16,
      dep = o.depth !== undefined ? o.depth : 0.16;
    for (const s of [-1, 1]) {
      const a = P(s * (R + fw / 2), 0, dep / 2),
        c = P(s * (R + fw / 2), hr, dep / 2);
      b.beam(sm, a[0], a[1], a[2], c[0], c[1], c[2], fw, dep, { tint: stn });
    }
    for (let i = 0; i < N; i++) {
      const a0 = (PI * i) / N,
        a1 = (PI * (i + 1)) / N,
        rr = R + fw / 2;
      const A = P(Math.cos(a0) * rr, hr + Math.sin(a0) * rr, dep / 2),
        B = P(Math.cos(a1) * rr, hr + Math.sin(a1) * rr, dep / 2);
      // extend a hair so the segments overlap
      const ex = 0.02,
        dx = B[0] - A[0],
        dy = B[1] - A[1],
        dz = B[2] - A[2],
        L = Math.hypot(dx, dy, dz) || 1;
      b.beam(
        sm,
        A[0] - (dx / L) * ex,
        A[1] - (dy / L) * ex,
        A[2] - (dz / L) * ex,
        B[0] + (dx / L) * ex,
        B[1] + (dy / L) * ex,
        B[2] + (dz / L) * ex,
        fw,
        dep,
        { tint: stn },
      );
    }
    if (o.keystone !== false) {
      const k = P(0, hr + R + fw * 0.2, dep * 0.6);
      b.box(sm, k[0], k[1] - 0.22, k[2], w * 0.14 + 0.08, 0.44, dep * 1.2, {
        yaw: Math.atan2(nx, nz),
        tint: stn,
      });
    }
    if (o.sill !== false) {
      const s = P(0, -0.06, dep * 0.6);
      b.box(
        o.sillMat || sm,
        s[0],
        s[1] - 0.06,
        s[2],
        w + fw * 2 + 0.2,
        0.12,
        dep * 1.4,
        { yaw: Math.atan2(nx, nz), tint: stn },
      );
    }
  };

  /** Georgian sash window: w×h opening, muntins (cols×rows per sash), limestone lintel with keystone. o: {state, frame, lintel, surround} */
  K.sash = function (b, x, yb, z, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz,
      rz = -nx,
      d0 = 0.015,
      n = [nx, 0, nz];
    const P = (u, v, d) => [x + rx * u + nx * d, yb + v, z + rz * u + nz * d];
    const st = o.state || "glass";
    const back =
      st === "glass"
        ? "glass"
        : st === "lit"
          ? "lamp"
          : st === "boarded"
            ? "wood_rotten"
            : "paint_black";
    const tint =
      st === "glass"
        ? [0.36, 0.42, 0.42]
        : st === "lit"
          ? [0.95, 0.66, 0.36]
          : st === "boarded"
            ? [0.55, 0.47, 0.4]
            : [0.035, 0.035, 0.035];
    b.quadN(
      back,
      P(-w / 2, 0, d0),
      P(w / 2, 0, d0),
      P(w / 2, h, d0),
      P(-w / 2, h, d0),
      n,
      { tint, grime: 0.2 },
    );
    const fm = o.frame || "paint_white";
    if (st !== "boarded") {
      const cols = o.cols || 3,
        rows = o.rows || 4;
      for (let i = 1; i < cols; i++) {
        const u = -w / 2 + (w * i) / cols;
        const a = P(u, 0, d0 + 0.025),
          c = P(u, h, d0 + 0.025);
        b.beam(fm, a[0], a[1], a[2], c[0], c[1], c[2], 0.035, 0.03, {
          grime: 0.15,
        });
      }
      for (let j = 1; j < rows; j++) {
        const v = (h * j) / rows;
        const a = P(-w / 2, v, d0 + 0.025),
          c = P(w / 2, v, d0 + 0.025);
        b.beam(
          fm,
          a[0],
          a[1],
          a[2],
          c[0],
          c[1],
          c[2],
          j === rows / 2 ? 0.07 : 0.035,
          0.03,
          { grime: 0.15 },
        );
      }
    } else {
      const r = K.rng((x * 11 + yb * 3 + z * 7) | 0);
      for (let i = 0; i < 3; i++) {
        const yy = 0.3 + (i * (h - 0.6)) / 2;
        const a = P(-w / 2 - 0.08, yy + (r() - 0.5) * 0.25, 0.1),
          c = P(w / 2 + 0.08, yy + (r() - 0.5) * 0.25, 0.1);
        b.beam("wood_rotten", a[0], a[1], a[2], c[0], c[1], c[2], 0.22, 0.03, {
          tint: [0.7, 0.6, 0.5],
        });
      }
    }
    if (st === "broken") {
      const r = K.rng((x * 17 + yb * 5 + z * 3) | 0);
      for (let k = 0; k < 2; k++) {
        const u = (r() - 0.5) * w * 0.6;
        b.quadN(
          "glass",
          P(u - 0.12, 0, d0 + 0.004),
          P(u + 0.16, 0, d0 + 0.004),
          P(u + 0.04, 0.4 + r() * 0.5, d0 + 0.004),
          P(u, 0.3 + r() * 0.5, d0 + 0.004),
          n,
          { tint: [0.45, 0.52, 0.52] },
        );
      }
    }
    const yaw = Math.atan2(nx, nz),
      sm = o.surround || "limestone",
      stn = o.surroundTint || [0.86, 0.82, 0.74];
    // jambs (thin), lintel with keystone, sill
    for (const s of [-1, 1]) {
      const a = P(s * (w / 2 + 0.06), h / 2, 0.06);
      b.box(sm, a[0], yb, a[2], 0.12, h, 0.12, { yaw, tint: stn });
    }
    const L = P(0, h, 0.09);
    b.box(sm, L[0], yb + h, L[2], w + 0.5, o.lintel || 0.32, 0.18, {
      yaw,
      tint: stn,
    });
    const Kk = P(0, h, 0.14);
    b.box(
      sm,
      Kk[0],
      yb + h - 0.04,
      Kk[2],
      0.26,
      (o.lintel || 0.32) + 0.12,
      0.24,
      { yaw, tint: stn },
    );
    const S = P(0, 0, 0.1);
    b.box(sm, S[0], yb - 0.12, S[2], w + 0.3, 0.12, 0.22, { yaw, tint: stn });
  };

  /** Classical column. kind: 'doric'|'ionic'|'iron'. o: {mat, tint, capMat, base (bool), flutes} */
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
    if (o.flutes !== false && kind !== "iron") {
      // flutes as thin dark strips (cheap: shaded vertical beams sunk into the shaft)
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * PI * 2,
          c = Math.cos(a),
          s = Math.sin(a);
        b.beam(
          mat,
          x + c * r * 0.97,
          y0 + baseH + 0.2,
          z - s * r * 0.97,
          x + c * r * 0.84,
          y0 + baseH + sh - 0.15,
          z - s * r * 0.84,
          0.03,
          0.03,
          { tint: tint ? tint.map((v) => v * 0.72) : [0.62, 0.6, 0.55] },
        );
      }
    }
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
})();
