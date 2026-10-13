// play-inline-118 04 — boxmm
// Lines 678-1014 of readable/play-inline-118.pretty.js (statement-aligned).
  function shell(r, o) {
    const { x0, x1, z0, z1, h } = r,
      b = r.b;
    b.boxMM(o.floor, x0, -0.2, z0, x1, 0, z1, {
      faces: "t",
      grime: o.floorGrime !== undefined ? o.floorGrime : 0.4,
      tint: o.floorTint,
    });
    // o.split = {z: world z, h2}: south of z the ceiling steps up to h2 (a stair hall over an entrance landing)
    const sp = o.split,
      zc = sp ? sp.z : z1,
      h2 = sp ? sp.h2 : h,
      H = Math.max(h, h2);
    b.boxMM(o.ceil || "nx_tin", x0, h, z0, x1, h + 0.2, zc, {
      faces: "b",
      grime: 0.25,
      tint: o.ceilTint,
    });
    if (sp) {
      b.boxMM(o.ceil || "nx_tin", x0, h2, zc, x1, h2 + 0.2, z1, {
        faces: "b",
        grime: 0.25,
        tint: o.ceilTint,
      });
      b.boxMM(o.wall, x0, h, zc - 0.2, x1, h2, zc, {
        faces: "s",
        grime: 0.35,
        tint: o.wallTint,
      });
    }
    const wall = o.wall,
      dado = o.dado,
      dh = o.dadoH || 1.1,
      wt = o.wallTint,
      dt = o.dadoTint;
    const W = (fx0, fz0, fx1, fz1, face, hh) => {
      if (dado) {
        b.boxMM(dado, fx0, 0, fz0, fx1, dh, fz1, {
          faces: face,
          grime: 0.45,
          tint: dt,
        });
        b.boxMM(wall, fx0, dh, fz0, fx1, hh, fz1, {
          faces: face,
          grime: 0.3,
          tint: wt,
        });
      } else
        b.boxMM(wall, fx0, 0, fz0, fx1, hh, fz1, {
          faces: face,
          grime: 0.35,
          tint: wt,
        });
    };
    W(x0, z0 - 0.2, x1, z0, "s", h);
    W(x0, z1, x1, z1 + 0.2, "n", h2);
    W(x0 - 0.2, z0, x0, zc, "e", h);
    W(x1, z0, x1 + 0.2, zc, "w", h);
    if (sp) {
      W(x0 - 0.2, zc, x0, z1, "e", h2);
      W(x1, zc, x1 + 0.2, z1, "w", h2);
    }
    const trim = o.trim || "wood_dark";
    if (dado && o.rail !== false) {
      b.boxMM(
        o.railMat || "brass",
        x0,
        dh - 0.03,
        z0,
        x1,
        dh + 0.04,
        z0 + 0.04,
        {},
      );
      b.boxMM(
        o.railMat || "brass",
        x0,
        dh - 0.03,
        z1 - 0.04,
        x1,
        dh + 0.04,
        z1,
        {},
      );
      b.boxMM(
        o.railMat || "brass",
        x0,
        dh - 0.03,
        z0,
        x0 + 0.04,
        dh + 0.04,
        z1,
        {},
      );
      b.boxMM(
        o.railMat || "brass",
        x1 - 0.04,
        dh - 0.03,
        z0,
        x1,
        dh + 0.04,
        z1,
        {},
      );
    }
    if (o.cornice !== false) {
      b.boxMM(trim, x0, h - 0.22, z0, x1, h, z0 + 0.12, { faces: "sb" });
      b.boxMM(trim, x0, h - 0.22, z1 - 0.12, x1, h, z1, { faces: "nb" });
      b.boxMM(trim, x0, h - 0.22, z0, x0 + 0.12, h, z1, { faces: "eb" });
      b.boxMM(trim, x1 - 0.12, h - 0.22, z0, x1, h, z1, { faces: "wb" });
      b.boxMM(trim, x0, 0, z0, x1, 0.14, z0 + 0.03, { faces: "s" });
      b.boxMM(trim, x0, 0, z1 - 0.03, x1, 0.14, z1, { faces: "n" });
      b.boxMM(trim, x0, 0, z0, x0 + 0.03, 0.14, z1, { faces: "e" });
      b.boxMM(trim, x1 - 0.03, 0, z0, x1, 0.14, z1, { faces: "w" });
    }
    K.colBox(x0 - 0.5, 0, z0 - 0.5, x1 + 0.5, H, z0);
    K.colBox(x0 - 0.5, 0, z1, x1 + 0.5, H, z1 + 0.5);
    K.colBox(x0 - 0.5, 0, z0, x0, H, z1);
    K.colBox(x1, 0, z0, x1 + 0.5, H, z1);
    // entrance door on the south wall (on the entrance landing when r.entryY > 0): frame, leaf, push plate, kick plate,
    // a lit EXIT sign over it and a warm light pool in front, so the way out reads at a glance
    const dx = r.doorX,
      dw = o.doorW || 1.4,
      dhh = o.doorH || 2.4,
      ey = r.entryY;
    b.boxMM(
      o.doorFrame || "wood_dark",
      dx - dw / 2 - 0.14,
      ey,
      z1 - 0.1,
      dx - dw / 2,
      ey + dhh + 0.14,
      z1,
      {},
    );
    b.boxMM(
      o.doorFrame || "wood_dark",
      dx + dw / 2,
      ey,
      z1 - 0.1,
      dx + dw / 2 + 0.14,
      ey + dhh + 0.14,
      z1,
      {},
    );
    b.boxMM(
      o.doorFrame || "wood_dark",
      dx - dw / 2 - 0.14,
      ey + dhh,
      z1 - 0.1,
      dx + dw / 2 + 0.14,
      ey + dhh + 0.14,
      z1,
      {},
    );
    b.panel(o.doorLeaf || "wood", dx, ey + dhh / 2, z1 - 0.03, dw, dhh, PI, {
      tint: o.doorTint,
    });
    b.boxMM(
      "brass",
      dx + dw / 2 - 0.22,
      ey + 1.0,
      z1 - 0.09,
      dx + dw / 2 - 0.12,
      ey + 1.1,
      z1 - 0.05,
      {},
    );
    b.boxMM(
      "brass",
      dx - dw / 2 + 0.05,
      ey + 0.02,
      z1 - 0.06,
      dx + dw / 2 - 0.05,
      ey + 0.26,
      z1 - 0.04,
      { grime: 0.6 },
    );
    const ex = K.atlases.tsx_neon.slots.x_exit;
    b.box("black_metal", dx, ey + dhh + 0.22, z1 - 0.06, 0.72, 0.42, 0.08, {});
    b.panel(
      "tsxn",
      dx,
      ey + dhh + 0.45,
      z1 - 0.11,
      0.62,
      (0.62 * ex.h) / ex.w,
      PI,
      { rect: ex.rect },
    );
    r.g.add(dx, ey + dhh + 0.45, z1 - 0.3, 0xff3020, "s");
    r.sp.add(dx, z1 - 1.1, 0xff6040, 1.4, { y: ey + 0.03, i: 0.28 });
  }
  /** Hanging lamp: shade + bulb + glow + light pool (+ a borrowed real light for the big ones). */
  function lamp(r, x, z, o) {
    o = o || {};
    const y = o.y || r.h - 0.9,
      col = o.col || 0xffd29a,
      b = r.b;
    b.beam("black_metal", x, o.ceil || r.h, z, x, y + 0.2, z, 0.012);
    if (o.kind === "bulb") {
      b.box("black_metal", x, y + 0.12, z, 0.08, 0.1, 0.08, {});
      b.geo("lit_warm", T.sphereLo, { x, y, z, s: 0.07, tint: col });
      r.g.add(x, y, z, col, "m");
    } else if (o.kind === "cage") {
      b.geo("black_metal", T.cyl6, {
        x,
        y: y + 0.05,
        z,
        sx: 0.16,
        sy: 0.3,
        sz: 0.16,
      });
      b.geo("lit_warm", T.sphereLo, { x, y, z, s: 0.1, tint: col });
      r.g.add(x, y, z, col, "m");
    } else if (o.kind === "chandelier") {
      b.cyl("brass", x, y - 0.2, z, 0.1, 0.5, 0.5, 8, {});
      for (let k = 0; k < 8; k++) {
        const a = (k * PI) / 4,
          px = x + Math.cos(a) * 0.9,
          pz = z + Math.sin(a) * 0.9;
        b.beam("brass", x, y, z, px, y - 0.25, pz, 0.025);
        b.geo("lit_warm", T.sphereLo, {
          x: px,
          y: y - 0.18,
          z: pz,
          s: 0.08,
          tint: col,
        });
        r.g.add(px, y - 0.18, pz, col, "s");
      }
      for (let k = 0; k < 14; k++) {
        const a = k * 0.45,
          rr2 = 0.4 + (k % 3) * 0.2;
        b.geo("glass", T.cone4, {
          x: x + Math.cos(a) * rr2,
          y: y - 0.45 - (k % 2) * 0.15,
          z: z + Math.sin(a) * rr2,
          sx: 0.04,
          sy: 0.18,
          sz: 0.04,
          rx: PI,
        });
      }
      r.g.add(x, y - 0.2, z, col, "l");
    } else if (o.kind === "fluor") {
      const L = o.len || 1.3,
        yaw = o.yaw || 0,
        c = Math.cos(yaw),
        s = Math.sin(yaw);
      // troffer: steel housing on two chains, twin tubes, a frosted diffuser strip; three small halos along the tube
      // (two big 'm' halos read as a pair of orbs, not a strip light)
      b.box("metal", x, y + 0.06, z, 0.26, 0.07, L, { yaw });
      for (const e of [-0.42, 0.42])
        b.beam(
          "black_metal",
          x + s * L * e,
          r.h,
          z + c * L * e,
          x + s * L * e,
          y + 0.13,
          z + c * L * e,
          0.008,
        );
      for (const o2 of [-0.05, 0.05])
        b.geo("lit_white", T.cyl6, {
          x: x + c * o2,
          y: y + 0.02,
          z: z - s * o2,
          rx: PI / 2,
          ry: yaw,
          sx: 0.028,
          sy: L * 0.95,
          sz: 0.028,
        });
      b.box("lit_white", x, y - 0.02, z, 0.2, 0.012, L * 0.96, {
        yaw,
        tint: 0xd8e0e8,
      });
      for (const e of [-0.33, 0, 0.33])
        r.g.add(x + s * L * e, y - 0.05, z + c * L * e, col, "s");
    } else {
      // enamel shade
      b.cyl(o.shade || "paint_green", x, y, z, 0.34, 0.1, 0.24, 10, {
        top: true,
        grime: 0.3,
      });
      b.geo("lit_warm", T.sphereLo, { x, y: y - 0.02, z, s: 0.1, tint: col });
      r.g.add(x, y - 0.06, z, col, "m");
    }
    r.sp.add(x, z, col, o.pool || 3.2, {
      y: (o.fy || 0) + 0.03,
      i: o.i || 0.42,
    });
    if (o.light)
      r.fix.push([
        x,
        y - 0.2,
        z,
        col,
        { intensity: o.light, range: o.range || 9 },
      ]);
  }
  function poster(r, key, x, y, z, w, h, f) {
    const s = K.atlases.tsx_paint.slots[key];
    if (!s) return;
    r.b.panel("tsxi", x, y, z, w, h, f, { rect: s.rect, off: 0.02 });
  }
  function neonSign(r, key, x, y, z, w, f, col, cls) {
    const s = K.atlases.tsx_neon.slots[key];
    if (!s) return;
    const h = (w * s.h) / s.w;
    r.b.box(
      "black_metal",
      x - Math.sin(f) * 0.05,
      y - h / 2 - 0.05,
      z - Math.cos(f) * 0.05,
      w + 0.12,
      h + 0.1,
      0.06,
      { yaw: f },
    );
    r.b.panel("tsxn", x, y, z, w, h, f, { rect: s.rect, off: 0.02 });
    r.g.add(x + Math.sin(f) * 0.4, y, z + Math.cos(f) * 0.4, col, cls || "m");
    r.sp.add(x + Math.sin(f) * 1.4, z + Math.cos(f) * 1.4, col, 2.4, {
      y: 0.03,
      i: 0.3,
    });
  }
  function board(r, key, x, y, z, w, h, f) {
    const s = K.atlases.tsx_paint.slots[key];
    if (!s) return;
    P.signBoard(r.b, "tsxi", s.rect, x, y, z, w, h, f, {
      backMat: "wood_dark",
    });
  }
  /** Shelf unit (face f = the side you take things from), with goods. */
