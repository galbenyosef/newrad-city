// play-inline-172 05 — tint
// Lines 981-1284 of readable/play-inline-172.pretty.js (statement-aligned).
  F.shelf = function (b, x, y, z, yaw, o) {
    o = o || {};
    const w = o.w || 1.8,
      h = o.h || 2.1,
      d = o.d || 0.4,
      m = o.mat || "metal",
      n = o.n || 5;
    for (const s of [-1, 1]) {
      const p = rot(x, z, yaw, (s * w) / 2, 0);
      b.box(m, p[0], y, p[1], 0.04, h, d, { yaw, tint: o.tint });
    }
    const bp = rot(x, z, yaw, 0, -d / 2 + 0.01);
    b.box(m, bp[0], y, bp[1], w, h, 0.02, { yaw, tint: o.tint, faces: "s" });
    const r = K.rng(Math.round(x * 31 + z * 17 + y));
    for (let i = 0; i < n; i++) {
      const sy = y + 0.08 + (i * (h - 0.1)) / (n - 1);
      b.box(m, x, sy, z, w, 0.03, d, { yaw, tint: o.tint, faces: "nsewtb" });
      if (!o.fill || i === n - 1) continue;
      let u = -w / 2 + 0.06;
      while (u < w / 2 - 0.1) {
        const bw =
          o.fill === "books"
            ? 0.04 + r() * 0.05
            : o.fill === "files"
              ? 0.3
              : 0.2 + r() * 0.2;
        if (r() < (o.sparse || 0.25)) {
          u += bw + r() * 0.2;
          continue;
        }
        const bh =
          o.fill === "books"
            ? 0.2 + r() * 0.12
            : o.fill === "files"
              ? 0.28
              : 0.12 + r() * 0.2;
        const p = rot(x, z, yaw, u + bw / 2, 0);
        const tint =
          o.fill === "books"
            ? [0x6a2a1e, 0x2a3a5a, 0x3a4a2a, 0x8a6a3a, 0x4a2a3a][
                Math.floor(r() * 5)
              ]
            : o.fill === "files"
              ? 0xb0a070
              : o.fill === "jars"
                ? 0x6a8a60
                : 0x8a7a5a;
        b.box(
          o.fill === "jars" ? "glass_base" : "fabric",
          p[0],
          sy + 0.03,
          p[1],
          bw,
          Math.min(bh, (h - 0.1) / (n - 1) - 0.06),
          d * 0.8,
          { yaw: yaw + (r() - 0.5) * 0.08, tint, grime: 0.4 },
        );
        u += bw + 0.01;
      }
    }
    col(x, z, w, d, y, y + h, yaw, "metal");
  };
  /** Filing cabinet bank (visual only; loot comes from props). */
  F.cabinets = function (b, x, y, z, yaw, n, o) {
    o = o || {};
    for (let i = 0; i < n; i++) {
      const p = rot(x, z, yaw, (i - (n - 1) / 2) * 0.5, 0);
      b.box(o.mat || "metal", p[0], y, p[1], 0.48, 1.32, 0.62, {
        yaw,
        tint: o.tint || 0x6a7064,
      });
      for (let k = 0; k < 4; k++) {
        const q = rot(p[0], p[1], yaw, 0, 0.315);
        b.box("chrome", q[0], y + 0.25 + k * 0.32, q[1], 0.14, 0.03, 0.02, {
          yaw,
          grime: 0.2,
        });
      }
    }
    col(x, z, n * 0.5, 0.62, y, y + 1.32, yaw, "metal");
  };
  /** Classical column. style: 'doric' | 'ionic' | 'corinthian' | 'deco' | 'iron' */
  F.column = function (b, x, y, z, r, h, o) {
    o = o || {};
    const m = o.mat || "limestone",
      st = o.style || "doric";
    if (st === "iron") {
      b.cyl(m, x, y, z, r, r * 0.9, h, 10, { tint: o.tint });
      b.cyl(m, x, y, z, r * 1.6, r * 1.6, 0.3, 10, { tint: o.tint });
      b.cyl(m, x, y + h - 0.4, z, r * 0.9, r * 1.7, 0.4, 10, { tint: o.tint });
    } else if (st === "deco") {
      b.box(m, x, y, z, r * 2.3, 0.5, r * 2.3, { tint: o.baseTint || o.tint });
      b.cyl(m, x, y + 0.5, z, r, r, h - 1.1, 12, { tint: o.tint, uvScale: 1 });
      for (let i = 0; i < 3; i++)
        b.cyl(
          o.capMat || "nickel",
          x,
          y + h - 0.6 + i * 0.18,
          z,
          r * (1.08 + i * 0.12),
          r * (1.08 + i * 0.12),
          0.12,
          12,
          { tint: o.capTint, grime: 0.2 },
        );
      b.box(o.capMat || "nickel", x, y + h - 0.06, z, r * 2.8, 0.06, r * 2.8, {
        tint: o.capTint,
        grime: 0.2,
      });
    } else {
      // shaft with entasis + flutes suggested by 16-sided smooth cylinder
      b.box(
        o.baseMat || m,
        x,
        y,
        z,
        r * 2.5,
        st === "doric" ? 0.12 : 0.35,
        r * 2.5,
        { tint: o.tint },
      );
      if (st !== "doric")
        b.cyl(m, x, y + 0.35, z, r * 1.15, r * 1.1, 0.2, 16, { tint: o.tint });
      b.cyl(
        m,
        x,
        y + (st === "doric" ? 0.12 : 0.55),
        z,
        r,
        r * 0.86,
        h - (st === "doric" ? 0.6 : 1.35),
        16,
        { tint: o.tint, rows: 3 },
      );
      if (st === "doric") {
        b.cyl(m, x, y + h - 0.48, z, r * 0.86, r * 1.18, 0.28, 16, {
          tint: o.tint,
        });
        b.box(m, x, y + h - 0.2, z, r * 2.5, 0.2, r * 2.5, {
          tint: o.tint,
          faces: "nsewtb",
        });
      } else if (st === "ionic") {
        b.box(m, x, y + h - 0.6, z, r * 2.6, 0.3, r * 1.9, {
          tint: o.tint,
          faces: "nsewtb",
        });
        for (const s of [-1, 1])
          b.geo(m, T.torusThick, {
            x: x + s * r * 1.05,
            y: y + h - 0.62,
            z,
            ry: HP,
            s: r * 0.35,
            tint: o.tint,
          });
        b.box(m, x, y + h - 0.2, z, r * 2.6, 0.2, r * 2.6, {
          tint: o.tint,
          faces: "nsewtb",
        });
      } else {
        // corinthian: bell of leaves + abacus
        b.cyl(m, x, y + h - 0.8, z, r * 0.9, r * 1.3, 0.62, 12, {
          tint: o.tint,
        });
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * PI * 2;
          b.geo(m, T.cone4, {
            x: x + Math.cos(a) * r * 1.05,
            y: y + h - 0.45,
            z: z + Math.sin(a) * r * 1.05,
            s: (0.18 * r) / 0.5,
            rz: Math.cos(a) * 0.5,
            rx: -Math.sin(a) * 0.5,
            tint: o.tint,
          });
        }
        b.box(m, x, y + h - 0.18, z, r * 2.7, 0.18, r * 2.7, {
          tint: o.tint,
          faces: "nsewtb",
        });
      }
    }
    if (o.col !== false)
      K.colBox(x - r, y, z - r, x + r, y + h, z + r, {
        surface: "concrete",
        tag: "column",
      });
  };
  /** Chandelier / pendant lamp: tiers of arms + bulbs (lamp material → auto fixture lights) + glow points. */
  F.chandelier = function (b, glows, x, y, z, r, o) {
    o = o || {};
    const m = o.mat || "brass",
      lamp = o.lamp || "lamp_amber";
    b.beam(m, x, y + (o.chain || 2), z, x, y + 0.4, z, 0.04, { grime: 0.2 });
    b.cyl(m, x, y, z, r * 0.25, r * 0.12, 0.5, 8, { grime: 0.2, bottom: true });
    const tiers = o.tiers || 2;
    for (let t = 0; t < tiers; t++) {
      const rr = r * (1 - t * 0.35),
        yy = y + 0.1 + t * 0.35,
        n = 8 - t * 2;
      b.geo(m, T.torus, { x, y: yy, z, rx: HP, s: rr, grime: 0.2 });
      for (let i = 0; i < n; i++) {
        const a = (i / n) * PI * 2,
          px = x + Math.cos(a) * rr,
          pz = z + Math.sin(a) * rr;
        if (o.broken && (i + t) % 3 === 0) continue;
        b.cyl(m, px, yy, pz, 0.04, 0.05, 0.1, 6, { grime: 0.2 });
        b.geo(lamp, T.sphereLo, {
          x: px,
          y: yy + 0.16,
          z: pz,
          s: 0.07,
          grime: 0,
        });
        if (o.crystals)
          b.geo("glass_base", T.cone4, {
            x: px,
            y: yy - 0.15,
            z: pz,
            s: 0.05,
            sy: 0.18,
            rx: PI,
            tint: 0xd8e0e0,
            grime: 0,
          });
        if (glows && i % 2 === 0)
          glows.add(px, yy + 0.16, pz, o.glowColor || 0xffc070, "s");
      }
    }
    if (glows)
      glows.add(x, y + 0.2, z, o.glowColor || 0xffc070, o.glowSize || "l");
  };
  /** Wall sconce facing direction yaw (the lamp sits 0.2 m off the wall). */
  F.sconce = function (b, glows, x, y, z, yaw, o) {
    o = o || {};
    const p = rot(x, z, yaw, 0, 0.12);
    b.box(o.mat || "brass", x, y - 0.2, z, 0.14, 0.4, 0.04, {
      yaw,
      grime: 0.2,
    });
    b.geo(o.lamp || "lamp_amber", T.cone6, {
      x: p[0],
      y: y + 0.08,
      z: p[1],
      s: 0.1,
      sy: 0.18,
      rx: PI,
      grime: 0,
    });
    if (glows && !o.dead)
      glows.add(p[0], y + 0.05, p[1], o.color || 0xffc070, o.size || "m");
  };
  /** Railing between two points at deck height y (balusters + handrail), with collider. */
  F.railing = function (b, ax, az, bx, bz, y, o) {
    o = o || {};
    const h = o.h || 1.0,
      m = o.mat || "brass",
      L = Math.hypot(bx - ax, bz - az);
    b.beam(m, ax, y + h, az, bx, y + h, bz, o.w || 0.06, { grime: 0.2 });
    if (o.solid) {
      const yaw = Math.atan2(bx - ax, bz - az) - HP;
      b.box(o.solid, (ax + bx) / 2, y, (az + bz) / 2, L, h, 0.12, {
        yaw,
        tint: o.tint,
      });
    } else {
      const n = Math.max(2, Math.round(L / (o.step || 0.25)));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        b.beam(
          m,
          ax + (bx - ax) * t,
          y,
          az + (bz - az) * t,
          ax + (bx - ax) * t,
          y + h,
          az + (bz - az) * t,
          i % 8 === 0 ? 0.07 : 0.025,
          { grime: 0.2 },
        );
      }
      b.beam(m, ax, y + 0.08, az, bx, y + 0.08, bz, 0.05, { grime: 0.2 });
    }
    if (o.col !== false)
      K.colRot(
        (ax + bx) / 2,
        (az + bz) / 2,
        L,
        0.15,
        y,
        y + h + 0.1,
        Math.atan2(bx - ax, bz - az) - HP,
        { surface: "metal", tag: "railing" },
      );
  };

  /**
   * Round 2 — New-York cast-iron fire escape bolted to a façade (merged, ~600 tris per landing).
   * (x,z) = centre on the wall face, (nx,nz) = outward normal, w = landing width, ys = landing heights
   * (bottom first). Landings with slatted decks, top rails + balusters, under-brackets, switch-back
   * stairs between landings, and a counterweighted drop ladder hanging from the lowest one.
   * Visual only (it sits above head height, out of reach — the lowest landing is ≥ 3.5 m up).
   */
