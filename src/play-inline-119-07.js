// play-inline-119 07 — the
// Lines 1189-4008 of readable/play-inline-119.pretty.js (statement-aligned).
  K.neonTown = function (ctx) {
    const { rec, b, d, ads, glows, flick, spill, P } = ctx;
    const L = G.LAYOUT;
    K.tsxInit();
    signs();
    const A = (name, x, y, z, yaw) => rec.anchor(name, x, y, z, nrm(yaw || 0));
    const N = K.atlases.tsx_neon.slots;
    const GY = 0.16;
    /** Neon sign from tsx_neon on a façade frame, with a halo + ground pool. */
    const neon = (key, x, y, z, w, f, col, o) => {
      o = o || {};
      const s = N[key];
      const h = (w * s.h) / s.w;
      if (o.backing !== false)
        d.box(
          "black_metal",
          x - Math.sin(f) * 0.08,
          y - h / 2 - 0.08,
          z - Math.cos(f) * 0.08,
          w + 0.2,
          h + 0.16,
          0.1,
          { yaw: f, grime: 0.4 },
        );
      d.panel("tsxn", x, y, z, w, h, f, {
        rect: s.rect,
        off: 0.02,
        both: !!o.both,
      });
      if (col !== null)
        (o.flicker ? flick : glows).add(
          x + Math.sin(f) * 0.6,
          y,
          z + Math.cos(f) * 0.6,
          col,
          o.cls || (w > 3 ? "l" : "m"),
        );
      return h;
    };
    const board = (key, x, y, z, w, h, f, o) => {
      o = o || {};
      P.signBoard(
        d,
        o.glow ? "tsxg" : "tsxp",
        K.atlases.tsx_paint.slots[key].rect,
        x,
        y,
        z,
        w,
        h,
        f,
        { backMat: o.back || "wood_dark" },
      );
    };
    const bulbRow = (pts, cols, o) =>
      P.bulbs(
        d,
        glows,
        pts,
        Object.assign(
          { spacing: 0.45, sag: 0.02, colors: cols || [0xffe0a0], size: "s" },
          o || {},
        ),
      );
    /** Door leaf + frame flush on a façade; returns the outside frame fn. */
    const doorway = (e, o) => {
      o = o || {};
      const W = fr(e.x, e.z, e.f),
        dw = o.w || 1.5,
        dh = o.h || 2.5,
        fm = o.frame || "black_metal";
      const p0 = W(-dw / 2 - 0.12, 0.08),
        p1 = W(dw / 2 + 0.12, 0.08),
        pt = W(0, 0.08);
      d.box(fm, p0[0], 0, p0[1], 0.24, dh + 0.24, 0.22, {
        yaw: e.f,
        grime: 0.4,
      });
      d.box(fm, p1[0], 0, p1[1], 0.24, dh + 0.24, 0.22, {
        yaw: e.f,
        grime: 0.4,
      });
      d.box(fm, pt[0], dh, pt[1], dw + 0.48, 0.24, 0.22, {
        yaw: e.f,
        grime: 0.4,
      });
      const leaf = W(0, 0.05),
        bk = W(0, 0.03);
      // what shows through the doorway: a dim lamp-lit lobby behind glass, darkness behind a gate
      if (o.glass || o.grille)
        d.panel(
          o.glass ? "lit_warm" : "black_metal",
          bk[0],
          dh / 2,
          bk[1],
          dw,
          dh,
          e.f,
          { tint: o.glass ? 0x5a3a1c : 0x080808 },
        );
      if (o.glass) {
        d.panel("glass", leaf[0], dh / 2, leaf[1], dw, dh, e.f, { off: 0.01 });
        d.box("brass", leaf[0], dh / 2 - 0.05, leaf[1], dw, 0.08, 0.06, {
          yaw: e.f,
        });
        d.box(fm, leaf[0], 0, leaf[1], 0.08, dh, 0.08, { yaw: e.f });
      } else if (o.grille) {
        for (let k = 0; k <= 10; k++) {
          const q = W(-dw / 2 + (dw * k) / 10, 0.1);
          d.beam("rust", q[0], 0, q[1], q[0], dh, q[1], 0.03);
        }
        for (const yy of [0.2, dh / 2, dh - 0.15]) {
          const qa = W(-dw / 2, 0.1),
            qb = W(dw / 2, 0.1);
          d.beam("rust", qa[0], yy, qa[1], qb[0], yy, qb[1], 0.05);
        }
      } else {
        d.panel(o.leaf || "metal_dark", leaf[0], dh / 2, leaf[1], dw, dh, e.f, {
          off: 0.01,
          tint: o.tint,
          grime: 0.5,
        });
        const hk = W(dw / 2 - 0.2, 0.1);
        d.box("brass", hk[0], 1.0, hk[1], 0.05, 0.12, 0.06, { yaw: e.f });
      }
      // step + mat
      const st = W(0, 0.35);
      d.box("concrete_dark", st[0], 0, st[1], dw + 0.9, GY + 0.06, 0.6, {
        yaw: e.f,
        grime: 0.6,
      });
      // the door leaf is solid (the façade collider has a doorway-sized opening here: walk right up to it)
      const lc = W(0, 0.0);
      K.colRot(lc[0], lc[1], dw + 0.3, 0.16, 0, dh + 0.3, e.f, {
        surface: "metal",
      });
      return W;
    };
    const lampOver = (W, lx, y, col) => {
      const p = W(lx, 0.55);
      d.beam(
        "black_metal",
        ...W(lx, 0.05).slice(0, 1),
        y + 0.25,
        W(lx, 0.05)[1],
        p[0],
        y + 0.25,
        p[1],
        0.04,
      );
      d.box("black_metal", p[0], y, p[1], 0.3, 0.25, 0.3, {});
      d.geo("lit_warm", T.sphereLo, {
        x: p[0],
        y: y - 0.05,
        z: p[1],
        s: 0.12,
        tint: col || 0xffd0a0,
      });
      glows.add(p[0], y - 0.1, p[1], col || 0xffc080, "m");
      const g = W(lx, 2.0);
      spill.add(g[0], g[1], col || 0xffc080, 2.8, { y: GY, i: 0.35 });
    };
    const colW = (W, lx0, lz0, lx1, lz1, h) => {
      const a = W(lx0, lz0),
        c = W(lx1, lz1);
      K.colWall(a[0], a[1], c[0], c[1], 0.25, 0, h, []);
    };

    // =========================== GATES ===========================
    /** Guard booth: corrugated hut with a sliding window toward `f`, roof lamp, HALT board. */
    const booth = (x, z, f, seed) => {
      const W = fr(x, z, f);
      P.shack(d, x, z, 2.2, 2.0, 2.5, f + PI / 2, {
        seed,
        door: true,
        doorAt: 0.5,
      });
      const win = W(0, 1.14);
      d.panel("glass", win[0], 1.55, win[1], 1.3, 0.7, f, { off: 0.01 });
      d.box("wood_dark", win[0], 1.12, win[1], 1.5, 0.08, 0.35, { yaw: f });
      const lp = W(0, 1.35);
      d.geo("lit_warm", T.sphereLo, {
        x: lp[0],
        y: 2.55,
        z: lp[1],
        s: 0.11,
        tint: 0xffb060,
      });
      glows.add(lp[0], 2.5, lp[1], 0xffa040, "m");
      spill.add(...W(0, 2.4), 0xffb060, 2.6, { y: GY, i: 0.3 });
      const hb = W(0, 1.18);
      board("p_halt", hb[0], 2.2, hb[1], 1.6, 0.4, f, {});
    };
    /** Raised boom barrier on a post (arm up: the road stays open). */
    const boom = (x, z, f, len) => {
      d.box("paint_yellow", x, 0, z, 0.35, 1.1, 0.35, { yaw: f, grime: 0.6 });
      d.box("concrete", x, 0, z, 0.7, 0.3, 0.7, { yaw: f, grime: 0.7 });
      K.colBox(x - 0.3, 0, z - 0.3, x + 0.3, 1.1, z + 0.3, {
        surface: "metal",
      });
      // arm pointing up at 80°, red/white stripes as alternating short beams
      const dx = Math.cos(f),
        dz = -Math.sin(f);
      for (let k = 0; k < 6; k++) {
        const t0 = (k * len) / 6,
          t1 = ((k + 1) * len) / 6,
          a = 1.38;
        d.beam(
          k % 2 ? "paint_white" : "paint_red",
          x + dx * Math.cos(a) * t0,
          1.1 + Math.sin(a) * t0,
          z + dz * Math.cos(a) * t0,
          x + dx * Math.cos(a) * t1,
          1.1 + Math.sin(a) * t1,
          z + dz * Math.cos(a) * t1,
          0.1,
        );
      }
      d.geo("lit_red", T.sphereLo, { x, y: 1.2, z, s: 0.08 });
      flick.add(x, 1.25, z, 0xff3020, "s");
    };
    // NORTH (the gantry over 7th Ave / Duffy / Broadway): booth + captain on the NE plaza, nests on both pavements
    booth(-26.4, -309.9, PI, 601);
    P.sandbags(d, -32.4, -311.6, -29.6, -311.6, 3, { seed: 602 });
    P.sandbags(d, -29.4, -311.6, -29.4, -309.2, 3, { seed: 603 });
    P.sandbags(d, -70.6, -310.2, -68.2, -311.6, 3, { seed: 604 });
    boom(-31.0, -312.4, PI, 5.5);
    A("gate_n", -40.0, 0, -313.6, 0);
    A("gate_n_guard1", -31.0, 0, -310.2, 0);
    A("gate_n_guard2", -67.9, 0, -309.6, 0.2);
    A("gate_n_spot", -62.5, 5.6, -311.0, 0);
    A("guard_captain", -27.9, 0, -306.4, -0.35);
    // SOUTH (the arches hung off One Times Square): booth + spotlight on the SW plaza, nests on the pavements
    booth(-52.2, -214.4, 0, 611);
    P.searchlight(d, glows, -50.9, 0, -217.2, 0.25, 0.28);
    P.sandbags(d, -49.8, -212.9, -47.0, -212.9, 3, { seed: 612 });
    P.sandbags(d, -13.8, -212.9, -11.2, -212.9, 3, { seed: 613 });
    boom(-48.6, -212.6, 0, 5.5);
    A("gate_s", -40.0, 0, -211.0, PI);
    A("gate_s_guard1", -48.4, 0, -214.4, PI);
    A("gate_s_guard2", -12.6, 0, -214.4, PI);
    A("gate_s_spot", -50.9, 0, -217.2, PI);
    // EAST (47th St at 7th Ave's far side) and WEST (42nd St, the Port-Authority side, by the depot)
    const sideGate = (dir, x, zA, zB, f, seed) => {
      const sx = x + (f > 0 ? -0.6 : 0.6);
      P.sandbags(d, sx, zA, sx, zA + (zB > zA ? 1.6 : -1.6), 3, { seed });
      P.searchlight(
        d,
        glows,
        sx + (f > 0 ? -0.9 : 0.9),
        0,
        zA + (zB > zA ? 0.4 : -0.4),
        f,
        0.25,
      );
      const hb = [sx + (f > 0 ? -0.2 : 0.2), zB + (zB > zA ? -0.8 : 0.8)];
      for (const s of [-0.7, 0.7])
        d.beam("wood", hb[0], 0, hb[1] + s, hb[0], 2.3, hb[1] + s, 0.07);
      board("p_halt", hb[0], 2.0, hb[1], 1.6, 0.4, f, {});
      boom(x + (f > 0 ? -0.3 : 0.3), zA + (zB > zA ? -0.6 : 0.6), f, 4.2);
      A(
        "gate_" + dir + "_spot",
        sx + (f > 0 ? -0.9 : 0.9),
        0,
        zA + (zB > zA ? 0.4 : -0.4),
        AY(f),
      );
    };
    sideGate("e", 14.4, -281.0, -269.0, PI / 2, 621);
    A("gate_e", 16.0, 0, -275.0, AY(PI / 2));
    A("gate_e_guard1", 13.0, 0, -279.6, AY(PI / 2));
    A("gate_e_guard2", 13.0, 0, -270.2, AY(PI / 2));
    sideGate("w", -93.4, -224.0, -236.0, -PI / 2, 631);
    A("gate_w", -96.0, 0, -230.0, AY(-PI / 2));
    A("gate_w_guard1", -92.4, 0, -225.0, AY(-PI / 2));
    A("gate_w_guard2", -92.4, 0, -235.2, AY(-PI / 2));

    // ---- FORTIFICATION PASS (round 2): a town shows its walls first (scrap wall, gate, watchtower) ----
    const Wd0 = G.world;
    const freeAt = (x, z, r) => {
      if (L.isRoad(x, z, true)) return false;
      for (const c of Wd0.query(
        x - r - 0.5,
        z - r - 0.5,
        x + r + 0.5,
        z + r + 0.5,
      ))
        if (c.maxY > 0.3 && c.minY < 2.0 && Wd0.pointInCollider(c, x, z, r))
          return false;
      return true;
    };
    /** concertina wire coil A→B at height y (two crossed cut-out quads, no collider: it sits on sandbags / walls) */
    const wire = (ax, az, bx, bz, y, hgt) => {
      const at = K.dclInit(),
        s = at.slots.wire,
        Lg = Math.hypot(bx - ax, bz - az);
      hgt = hgt || 0.75;
      const nx = (-(bz - az) / Lg) * 0.18,
        nz = ((bx - ax) / Lg) * 0.18,
        reps = Math.max(1, Math.round(Lg / 2.4));
      for (let k = 0; k < reps; k++) {
        const t0 = k / reps,
          t1 = (k + 1) / reps,
          p0 = [ax + (bx - ax) * t0, az + (bz - az) * t0],
          p1 = [ax + (bx - ax) * t1, az + (bz - az) * t1];
        for (const sd of [-1, 1])
          d.quad(
            "dcl",
            [p0[0] + nx * sd, y, p0[1] + nz * sd],
            [p1[0] + nx * sd, y, p1[1] + nz * sd],
            [p1[0] - nx * sd, y + hgt, p1[1] - nz * sd],
            [p0[0] - nx * sd, y + hgt, p0[1] - nz * sd],
            { rect: s.rect, grime: 0 },
          );
      }
    };
    /** Czech hedgehog: three welded rail sections (anti-vehicle), solid */
    const hedgehog = (x, z, yaw) => {
      if (!freeAt(x, z, 0.9)) return false;
      const c = Math.cos(yaw),
        s2 = Math.sin(yaw),
        R = 0.85;
      const axes = [
        [1, 0.35, 0],
        [-0.5, 0.35, 0.87],
        [-0.5, 0.35, -0.87],
      ];
      for (const a of axes) {
        const ax = a[0] * c + a[2] * s2,
          az = -a[0] * s2 + a[2] * c;
        d.beam(
          "rust",
          x - ax * R,
          0.05,
          z - az * R,
          x + ax * R,
          1.25,
          z + az * R,
          0.09,
        );
        d.beam(
          "rust",
          x + ax * R,
          0.05,
          z + az * R,
          x - ax * R,
          1.25,
          z - az * R,
          0.09,
        );
      }
      K.colBox(x - 0.6, 0, z - 0.6, x + 0.6, 1.2, z + 0.6, {
        surface: "metal",
        tag: "cover",
      });
      return true;
    };
    /** scrap watchtower: I-beam legs, braced, corrugated deck at PY, scrap-sheet + sandbag parapet, lean-to roof, lamp, pennant */
    const watchtower = (x0, z0, x1, z1, PY, o) => {
      o = o || {};
      const legs = [
        [x0, z0],
        [x1, z0],
        [x1, z1],
        [x0, z1],
      ];
      for (const p of legs) {
        d.box("rust", p[0], 0, p[1], 0.26, PY + 2.6, 0.26, { grime: 0.7 });
        d.box("concrete", p[0], 0, p[1], 0.6, 0.35, 0.6, { grime: 0.7 });
        K.colBox(p[0] - 0.2, 0, p[1] - 0.2, p[0] + 0.2, PY - 0.2, p[1] + 0.2, {
          surface: "metal",
        });
      }
      for (let i = 0; i < 4; i++) {
        const a = legs[i],
          c = legs[(i + 1) % 4];
        if (o.open === i) continue;
        d.beam("rust", a[0], 0.4, a[1], c[0], PY - 0.4, c[1], 0.06);
        d.beam("rust", c[0], 0.4, c[1], a[0], PY - 0.4, a[1], 0.06);
        d.beam("rust", a[0], PY * 0.5, a[1], c[0], PY * 0.5, c[1], 0.05);
      }
      d.boxMM(
        "corrugated",
        x0 - 0.3,
        PY - 0.2,
        z0 - 0.3,
        x1 + 0.3,
        PY,
        z1 + 0.3,
        { grime: 0.7 },
      );
      K.colBox(x0 - 0.3, PY - 0.25, z0 - 0.3, x1 + 0.3, PY, z1 + 0.3, {
        surface: "metal",
      });
      // parapet: scrap sheets on three sides (side o.gap stays open for the way up), sandbags behind them
      const E4 = [
        [x0 - 0.3, z0 - 0.3, x1 + 0.3, z0 - 0.3],
        [x1 + 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3],
        [x1 + 0.3, z1 + 0.3, x0 - 0.3, z1 + 0.3],
        [x0 - 0.3, z1 + 0.3, x0 - 0.3, z0 - 0.3],
      ];
      E4.forEach((e2, i) => {
        if (o.gap === i) return;
        P.scrapWall(d, e2[0], e2[1], e2[2], e2[3], 1.15, {
          y: PY,
          seed: 900 + i + Math.round(x0),
          collide: false,
        });
        K.colWall(e2[0], e2[1], e2[2], e2[3], 0.2, PY, PY + 1.15, [], {
          walkable: false,
        });
        wire(e2[0], e2[1], e2[2], e2[3], PY + 1.1, 0.5);
      });
      // lean-to roof on four posts
      for (const p of legs)
        d.beam(
          "rust",
          p[0],
          PY,
          p[1],
          p[0],
          PY + (p[1] === z0 ? 2.6 : 2.3),
          p[1],
          0.06,
        );
      d.quad(
        "corrugated",
        [x0 - 0.5, PY + 2.62, z0 - 0.5],
        [x1 + 0.5, PY + 2.62, z0 - 0.5],
        [x1 + 0.5, PY + 2.3, z1 + 0.5],
        [x0 - 0.5, PY + 2.3, z1 + 0.5],
        { double: true, grime: 0.7 },
      );
      const cxm = (x0 + x1) / 2,
        czm = (z0 + z1) / 2;
      d.beam("black_metal", cxm, PY + 2.4, czm, cxm, PY + 2.05, czm, 0.02);
      d.geo("lit_warm", T.sphereLo, { x: cxm, y: PY + 2.0, z: czm, s: 0.1 });
      glows.add(cxm, PY + 1.95, czm, 0xffc070, "m");
      if (o.light !== false)
        P.searchlight(
          d,
          glows,
          o.lx !== undefined ? o.lx : x1,
          PY,
          o.lz !== undefined ? o.lz : z0,
          o.ly || 0,
          0.2,
        );
      // Neon pennant on a whip pole
      d.beam(
        "metal",
        x1 + 0.3,
        PY + 2.4,
        z0 - 0.3,
        x1 + 0.3,
        PY + 5.2,
        z0 - 0.3,
        0.03,
      );
      d.panel(
        "fabric",
        x1 + 0.3 + 0.5,
        PY + 4.8,
        z0 - 0.3,
        1.0,
        0.6,
        (PI / 2) * 0 + (o.flagYaw || 0),
        { double: true, tint: 0x2a8a4a, grime: 0.3 },
      );
    };
    // NORTH: a watchtower at the west end of the gantry (its deck IS the tower's level; the plank joins them)
    {
      const GYD = 5.6;
      watchtower(-75.0, -311.6, -72.4, -309.0, GYD, {
        gap: 1,
        lx: -73.7,
        lz: -311.8,
        ly: PI,
      });
      d.boxMM("wood", -72.1, GYD - 0.14, -311.5, -69.8, GYD, -310.2, {
        grime: 0.6,
      });
      K.colBox(-72.1, GYD - 0.2, -311.5, -69.8, GYD, -310.2, {
        surface: "wood",
      });
      for (const z of [-311.55, -310.15]) {
        d.beam("rust", -72.1, GYD + 1.0, z, -69.8, GYD + 1.0, z, 0.04);
        K.colBox(-72.1, GYD, z - 0.04, -69.8, GYD + 1.05, z + 0.04, {
          walkable: false,
        });
      }
      A("gate_n_tower", -73.7, GYD, -310.3, AY(PI));
      // hedgehogs + wire on the pavement flanks (the carriageways stay open)
      for (const q of [
        [-78.5, -314.6, 0.3],
        [-83.0, -314.8, 1.1],
        [-49.6, -314.4, 0.6],
        [-27.8, -314.6, 0.2],
        [-22.0, -314.8, 0.9],
      ])
        hedgehog(q[0], q[1], q[2]);
      wire(-32.4, -311.6, -29.6, -311.6, 0.7);
      wire(-29.4, -311.6, -29.4, -309.2, 0.7);
      wire(-70.6, -310.2, -68.2, -311.6, 0.7);
    }
    // SOUTH: the booth gets a sandbagged roof nest (ladder up the back), wire on the sandbags, hedgehogs on the pavements
    {
      const bx = -52.2,
        bz = -214.4,
        RY = 2.62;
      d.boxMM(
        "corrugated",
        bx - 1.25,
        RY - 0.1,
        bz - 1.15,
        bx + 1.25,
        RY,
        bz + 1.15,
        { grime: 0.7 },
      );
      P.sandbags(d, bx - 1.1, bz + 1.0, bx + 1.1, bz + 1.0, 2, {
        y: RY,
        seed: 681,
        collide: false,
      });
      P.sandbags(d, bx + 1.1, bz + 1.0, bx + 1.1, bz - 1.0, 2, {
        y: RY,
        seed: 682,
        collide: false,
      });
      P.sandbags(d, bx - 1.1, bz + 1.0, bx - 1.1, bz - 1.0, 2, {
        y: RY,
        seed: 683,
        collide: false,
      });
      for (let k = 0; k < 8; k++)
        d.beam(
          "rust",
          bx - 0.35,
          0.3 + k * 0.3,
          bz - 1.2,
          bx + 0.35,
          0.3 + k * 0.3,
          bz - 1.2,
          0.025,
        ); // ladder rungs (north side)
      for (const s2 of [-0.38, 0.38])
        d.beam(
          "rust",
          bx + s2,
          0,
          bz - 1.22,
          bx + s2,
          RY + 0.9,
          bz - 1.22,
          0.035,
        );
      d.beam(
        "metal",
        bx + 0.9,
        RY,
        bz + 0.8,
        bx + 0.9,
        RY + 3.4,
        bz + 0.8,
        0.035,
      );
      d.box("paint_red", bx + 0.9, RY + 3.2, bz + 0.8, 0.35, 0.2, 0.25, {}); // siren
      wire(-49.8, -212.9, -47.0, -212.9, 0.66);
      wire(-13.8, -212.9, -11.2, -212.9, 0.66);
      for (const q of [
        [-45.2, -211.2, 0.4],
        [-5.8, -211.4, 1.0],
        [-3.2, -210.6, 0.2],
      ])
        hedgehog(q[0], q[1], q[2]);
    }
    // EAST / WEST (side streets): wire on the sandbag lines, a scrap-wall stub + hedgehogs on the pavements, WARNING boards
    {
      wire(13.8, -281.0, 13.8, -279.4, 0.66);
      wire(-92.8, -224.0, -92.8, -225.6, 0.66);
      P.scrapWall(d, 13.6, -270.2, 13.6, -268.4, 2.2, { seed: 691 });
      P.scrapWall(d, -93.6, -236.4, -93.6, -234.8, 2.2, { seed: 692 });
      wire(13.6, -270.2, 13.6, -268.4, 2.2, 0.5);
      wire(-93.6, -236.4, -93.6, -234.8, 2.2, 0.5);
      for (const q of [
        [11.0, -268.8, 0.5],
        [-90.8, -223.4, 1.2],
        [-90.6, -236.3, 0.1],
      ])
        hedgehog(q[0], q[1], q[2]);
    }

    // =========================== MARKET ===========================
    const AN = rec.anchors;
    const stallAnchor = (n, src) => {
      const v = AN[src];
      if (v) A("market_stall_" + n, v.x, 0, v.z, AY(v.yaw));
    };
    // the stalls 40 built (their anchor yaw is the stall front) → plan names, merchants face their customers
    stallAnchor(1, "merchant1");
    stallAnchor(7, "merchant2");
    stallAnchor(2, "merchant3");
    stallAnchor(3, "merchant4");
    stallAnchor(9, "vendor1");
    stallAnchor(10, "vendor2");
    if (AN.repairman)
      A(
        "market_stall_4",
        AN.repairman.x,
        0,
        AN.repairman.z,
        AY(AN.repairman.yaw),
      );
    if (AN.noodles)
      A("market_stall_5", AN.noodles.x, 0, AN.noodles.z, AN.noodles.yaw); // inside the ring, facing the stools
    if (AN.butcher)
      A("market_stall_6", AN.butcher.x, 0, AN.butcher.z, AY(AN.butcher.yaw));
    if (AN.water) A("market_stall_8", AN.water.x, 0, AN.water.z, AN.water.yaw); // at the tap, facing the lane
    /** New lit stall (same dressing as 40's). */
    const newStall = (n, x, z, f, col, key) => {
      const cust = P.stall(d, x, z, 3.6, f, { seed: 700 + n, color: col });
      const W = fr(x, z, f);
      const hb = W(0, -0.3);
      d.beam("black_metal", hb[0], 2.55, hb[1], hb[0], 2.2, hb[1], 0.02, {});
      d.geo("lit_warm", T.sphereLo, { x: hb[0], y: 2.12, z: hb[1], s: 0.1 });
      glows.add(hb[0], 2.1, hb[1], 0xffc878, "m");
      spill.add(...W(0, 1.6), 0xffc070, 3.0, { y: GY, i: 0.35 });
      const bp = W(0, -1.45);
      board(key, bp[0], 2.95, bp[1], 2.6, 0.65, f, {});
      const m = W(0, -0.45);
      A("market_stall_" + n, m[0], 0, m[1], AY(f));
      A("market_stall_" + n + "_customer", cust[0], 0, cust[2], f);
    };
    newStall(11, -26.4, -286.6, -PI / 2, 0x6a3a8a, "p_trinkets"); // NE plaza, by the Opry corner
    {
      const q = onFace(FACE_E[0], FACE_E[1], 3.3, 2.0, X0);
      newStall(12, q.x, q.z, q.f, 0x2a6a4a, "p_eats2");
    }
    // trade boards over the existing stalls (who sells what, readable by day)
    const overStall = (src, key) => {
      const v = AN[src];
      if (!v) return;
      const W = fr(v.x, v.z, v.yaw);
      const p = W(0, -1.1);
      board(key, p[0], 4.15, p[1], 2.4, 0.6, v.yaw, {});
    };
    overStall("merchant1", "p_guns");
    overStall("merchant2", "p_chems");
    overStall("merchant3", "p_ammo");
    overStall("merchant4", "p_armor");
    overStall("vendor2", "p_junk");
    {
      const v = AN.water;
      if (v) board("p_booze", v.x - 1.1, 2.3, v.z + 2.5, 2.2, 0.55, 0, {});
    }
    // the market banner: MARQUEE MARKET neon hung between the stack shacks and the lamp posts over the lane
    {
      const zc = -253.1,
        y = 5.3;
      for (const z of [zc - 4.6, zc + 4.6]) {
        d.beam("rust", -63.6, y + 0.6, z, -50.6, y + 0.6, z, 0.06);
      }
      d.box("black_metal", -57.0, y - 0.9, zc - 4.6, 0.12, 1.8, 0.12, {});
      neon("x_market", -57.0, y + 0.1, zc - 4.62, 6.4, 0, 0xffd23a, {
        both: true,
        cls: "l",
      });
      d.beam(
        "rust",
        -60.2,
        y + 0.6,
        zc - 4.6,
        -57.0 - 3.2,
        y + 0.9,
        zc - 4.6,
        0.03,
      );
      d.beam(
        "rust",
        -53.8,
        y + 0.6,
        zc - 4.6,
        -57.0 + 3.2,
        y + 0.9,
        zc - 4.6,
        0.03,
      );
      // bunting over the lane
      for (const z of [zc - 9, zc + 9]) {
        const pts = d.cable(
          "rust",
          -63.6,
          6.2,
          z,
          -50.6,
          6.0,
          z,
          0.5,
          0.015,
          12,
        );
        for (let i = 1; i < pts.length - 1; i++)
          d.quad(
            "fabric",
            [pts[i][0] - 0.22, pts[i][1], pts[i][2]],
            [pts[i][0] + 0.22, pts[i][1], pts[i][2]],
            [pts[i][0], pts[i][1] - 0.45, pts[i][2]],
            [pts[i][0], pts[i][1] - 0.45, pts[i][2]],
            {
              double: true,
              tint: [0xc02a22, 0xf0d040, 0x2a6ac0, 0xf0ece0][i % 4],
              grime: 0.3,
            },
          );
      }
    }
    // hawker spots (pavements and plazas, never the carriageway)
    A("hawker_1", -48.6, 0, -268.6, -2.4); // NW corner of the crossing
    A("hawker_2", -55.9, 0, -246.2, -PI / 2); // market lane
    A("hawker_3", -28.4, 0, -283.6, 2.4); // outside the Opry
    A("hawker_4", -19.0, 0, -241.0, 1.2); // east plaza
    A("hawker_5", -51.0, 0, -220.4, 2.0); // south gate
    A("hawker_6", -66.6, 0, -294.6, -2.0); // NW plaza, by the Mayor
    A("plaza_centre", -55.8, 0, -253.1, 0);
    A("screen_view", -49.4, 2.0, -306.0, PI); // on the red steps, facing the Crossroads Screen

    // =========================== PLACES (façades; doors are interior code) ===========================
    const door = (k, W, o) => {
      const p = W((o && o.lx) || 0, 1.2);
      A(k + "_door", p[0], 0, p[1], AY(E[k] ? E[k].f : 0));
    };
    // 2 · DOC BROADWAY'S CLINIC — the theatre box office: glass doors, ticket window, marquee board, red cross
    {
      const e = E.clinic,
        W = doorway(e, { glass: true, w: 1.8, h: 2.6, frame: "brass" });
      const tw = W(-2.4, 0.04);
      d.box("wood_dark", tw[0], 0, tw[1], 1.5, 1.1, 0.3, {
        yaw: e.f,
        grime: 0.5,
      });
      d.panel(
        "glass",
        ...[W(-2.4, 0.2)[0], 1.75, W(-2.4, 0.2)[1]],
        1.2,
        1.0,
        e.f,
        {},
      );
      for (let k = 0; k < 6; k++) {
        const q = W(-2.95 + k * 0.22, 0.24);
        d.beam("brass", q[0], 1.25, q[1], q[0], 2.25, q[1], 0.02);
      }
      const bo = W(-2.4, 0.3);
      board("p_boxoffice", bo[0], 2.55, bo[1], 1.5, 0.38, e.f, { glow: true });
      const m = W(0, 1.0);
      d.box("black_metal", m[0], 3.05, m[1], 5.6, 0.45, 2.0, {
        yaw: e.f,
        grime: 0.4,
      }); // canopy
      const cb = W(0, 2.02);
      board("p_clinic", cb[0], 3.28, cb[1], 5.4, 0.42, e.f, { glow: true });
      bulbRow(
        [
          [...W(-2.8, 2.05).slice(0, 1), 3.05, W(-2.8, 2.05)[1]],
          [W(2.8, 2.05)[0], 3.05, W(2.8, 2.05)[1]],
        ],
        [0xffe0a0, 0xff6a50],
      );
      const sg = W(0, 0.2);
      neon("x_clinic", sg[0], 4.2, sg[1], 4.6, e.f, 0xff3a3a, {});
      const cr = W(3.3, 0.9);
      d.box("black_metal", cr[0], 3.6, cr[1], 0.12, 1.4, 1.4, { yaw: e.f });
      d.panel("tsxn", cr[0], 4.3, cr[1], 1.3, 1.3, e.f + PI / 2, {
        rect: N.x_cross.rect,
        off: 0.07,
        both: true,
      });
      flick.add(cr[0], 4.3, cr[1], 0xff2a2a, "l");
      for (let k = 0; k < 4; k++) {
        const q = W(-1.2 + k * 0.8, 0.35);
        d.geo("lit_warm", T.sphereLo, { x: q[0], y: 2.98, z: q[1], s: 0.07 });
        if (k % 2) glows.add(q[0], 2.9, q[1], 0xffd8a0, "s");
      }
      spill.add(...W(0, 2.2), 0xff6a5a, 3.2, { y: GY, i: 0.32 });
      door("clinic", W);
      A("doctor", ...[W(0, 1.6)[0], 0, W(0, 1.6)[1]], AY(e.f));
    }
    // 3 · AMMO ANNIE'S SHOOTING GALLERY — carnival arcade front
    {
      const e = E.gallery,
        W = doorway(e, { w: 2.2, h: 2.7, leaf: "wood", tint: 0x9a2a1a });
      const aw = W(0, 0.05);
      const rect = K.paint("ts_awn_r", 128, 128);
      const a0 = W(-2.6, 0),
        a1 = W(2.6, 0),
        a2 = W(2.6, 1.7),
        a3 = W(-2.6, 1.7);
      d.quad(
        "atlas_paint",
        [a0[0], 3.55, a0[1]],
        [a1[0], 3.55, a1[1]],
        [a2[0], 2.95, a2[1]],
        [a3[0], 2.95, a3[1]],
        { rect, double: true, grime: 0.3 },
      );
      void aw;
      const sg = W(0, 0.2);
      neon("x_gallery", sg[0], 4.4, sg[1], 5.0, e.f, 0xffd23a, {
        flicker: true,
      });
      for (const s of [-1, 1]) {
        const q = W(s * 3.3, 0.2);
        d.panel("tsxn", q[0], 2.2, q[1], 1.2, 1.2, e.f, {
          rect: N.x_target.rect,
          off: 0.02,
        });
        glows.add(
          ...[W(s * 3.3, 0.7)[0], 2.2, W(s * 3.3, 0.7)[1]],
          0xff4040,
          "m",
        );
      }
      const pb = W(0, 0.12);
      board("p_prizes", pb[0], 3.2, pb[1], 2.4, 0.6, e.f, {});
      bulbRow(
        [
          [W(-2.6, 1.72)[0], 2.93, W(-2.6, 1.72)[1]],
          [W(2.6, 1.72)[0], 2.93, W(2.6, 1.72)[1]],
        ],
        [0xffd23a, 0xff4040, 0xffffff],
        { spacing: 0.35 },
      );
      // prize teddy on a shelf in the ticket hatch
      const tb = W(1.8, 0.25);
      d.box("wood", tb[0], 1.0, tb[1], 0.9, 0.08, 0.4, { yaw: e.f });
      d.geo("fabric", T.sphereLo, {
        x: tb[0],
        y: 1.25,
        z: tb[1],
        s: 0.18,
        tint: 0x8a5a3a,
      });
      spill.add(...W(0, 2.2), 0xffd060, 3.2, { y: GY, i: 0.32 });
      door("gallery", W);
    }
    // 4 · RADIO REPAIR / ROBO-SHOP — tube-radio neon, a robot arm over the door
    {
      const e = E.robo,
        W = doorway(e, { w: 1.6, h: 2.5, leaf: "metal", tint: 0x3a6a6a });
      const sg = W(0, 0.2);
      neon("x_robo", sg[0], 3.6, sg[1], 3.6, e.f, 0x5af0ff, { flicker: true });
      const rd = W(-2.5, 0.25);
      d.panel("tsxn", rd[0], 2.3, rd[1], 1.3, 1.06, e.f, {
        rect: N.x_radio.rect,
        off: 0.02,
      });
      glows.add(...[W(-2.5, 0.8)[0], 2.3, W(-2.5, 0.8)[1]], 0xffb040, "m");
      const pb = W(0.3, 0.1);
      board("p_robo", pb[0], 2.95, pb[1], 2.6, 0.5, e.f, {});
      // robot arm: base bolted to the wall, two segments, a claw holding a wrench
      const b0 = W(2.4, 0.15),
        j1 = W(2.4, 1.2),
        j2 = W(1.7, 1.9);
      d.box("paint_yellow", b0[0], 3.2, b0[1], 0.5, 0.5, 0.3, { yaw: e.f });
      d.beam("paint_yellow", b0[0], 3.45, b0[1], j1[0], 4.1, j1[1], 0.18);
      d.geo("metal_dark", T.sphereLo, { x: j1[0], y: 4.1, z: j1[1], s: 0.16 });
      d.beam("paint_yellow", j1[0], 4.1, j1[1], j2[0], 3.4, j2[1], 0.14);
      for (const s of [-1, 1]) {
        const c = W(1.7 + s * 0.12, 2.05);
        d.beam("chrome", j2[0], 3.4, j2[1], c[0], 3.05, c[1], 0.04);
      }
      d.geo("lit_red", T.sphereLo, { x: j1[0], y: 4.26, z: j1[1], s: 0.05 });
      flick.add(j1[0], 4.3, j1[1], 0xff3020, "s");
      spill.add(...W(0, 2.0), 0x5af0ff, 2.8, { y: GY, i: 0.25 });
      door("robo", W);
    }
    // 5 · THE PAWN PALACE — gaudy gold sign, the three gold balls of the pawnbroker
    {
      const e = E.pawn,
        W = doorway(e, {
          w: 1.5,
          h: 2.5,
          leaf: "wood",
          tint: 0x4a2a14,
          frame: "gold",
        });
      const sg = W(0, 0.2);
      neon("x_pawn", sg[0], 3.35, sg[1], 3.6, e.f, 0xffc83a, {});
      const pb = W(0, 0.1);
      board("p_pawn", pb[0], 2.75, pb[1], 2.4, 0.42, e.f, { glow: true });
      const br = W(-1.8, 0.1),
        bt = W(-1.8, 1.25);
      d.beam("gold", br[0], 3.0, br[1], bt[0], 3.0, bt[1], 0.06);
      for (const q of [
        [-0.25, 2.25],
        [0.25, 2.25],
        [0, 1.85],
      ]) {
        const p = W(-1.8 + q[0], 1.1);
        d.beam("gold", p[0], 3.0, p[1], p[0], q[1] + 0.25, p[1], 0.012);
        d.geo("gold_bright", T.sphere, { x: p[0], y: q[1], z: p[1], s: 0.22 });
        glows.add(p[0], q[1], p[1], 0xffc860, "s");
      }
      // display window with a grille
      const wv = W(1.6, 0.04);
      d.panel("glass", wv[0], 1.6, wv[1], 1.4, 1.4, e.f, { off: 0.02 });
      for (let k = 0; k < 6; k++) {
        const q = W(0.95 + k * 0.26, 0.12);
        d.beam("rust", q[0], 0.9, q[1], q[0], 2.3, q[1], 0.02);
      }
      d.geo("gold", T.box, { x: wv[0], y: 1.05, z: wv[1], s: 0.15 });
      spill.add(...W(0, 2.0), 0xffc050, 2.6, { y: GY, i: 0.3 });
      door("pawn", W);
    }
    // 7 · THE NEON OPRY — a real Broadway marquee over the 47th St pavement
    {
      const e = E.opry,
        W = doorway(e, { glass: true, w: 3.0, h: 2.8, frame: "gold" });
      const MZ = 2.6,
        MY = 3.4,
        MW = 9.4;
      const mc = W(0, MZ / 2 + 0.05);
      d.box("black_metal", mc[0], MY, mc[1], MW, 1.35, MZ, {
        yaw: e.f,
        grime: 0.3,
      });
      d.box("gold", mc[0], MY - 0.08, mc[1], MW + 0.1, 0.1, MZ + 0.1, {
        yaw: e.f,
      });
      const fz = W(0, MZ + 0.08);
      board(
        "p_opry1",
        ...[W(0, MZ + 0.08)[0], MY + 1.05, W(0, MZ + 0.08)[1]],
        4.2,
        0.36,
        e.f,
        { glow: true },
      );
      board("p_opry2", fz[0], MY + 0.7, fz[1], 8.4, 0.36, e.f, { glow: true });
      board("p_opry3", fz[0], MY + 0.3, fz[1], 6.0, 0.34, e.f, { glow: true });
      for (const s of [-1, 1]) {
        const sd = W(s * (MW / 2 + 0.06), MZ / 2);
        board(
          "p_opry2",
          sd[0],
          MY + 0.65,
          sd[1],
          2.4,
          0.3,
          e.f + (s * PI) / 2,
          { glow: true },
        );
      }
      // chaser bulbs on all three faces + soffit bulbs
      bulbRow(
        [
          [W(-MW / 2, MZ + 0.12)[0], MY + 1.38, W(-MW / 2, MZ + 0.12)[1]],
          [W(MW / 2, MZ + 0.12)[0], MY + 1.38, W(MW / 2, MZ + 0.12)[1]],
        ],
        [0xffe8a0, 0xffe8a0, 0xff9a5a],
        { spacing: 0.3 },
      );
      bulbRow(
        [
          [W(-MW / 2, MZ + 0.12)[0], MY - 0.06, W(-MW / 2, MZ + 0.12)[1]],
          [W(MW / 2, MZ + 0.12)[0], MY - 0.06, W(MW / 2, MZ + 0.12)[1]],
        ],
        [0xffe8a0],
        { spacing: 0.3 },
      );
      for (let i = 0; i < 5; i++)
        for (let j = 0; j < 2; j++) {
          const q = W(-3.6 + i * 1.8, 0.7 + j * 1.2);
          d.geo("lit_warm", T.sphereLo, {
            x: q[0],
            y: MY - 0.03,
            z: q[1],
            s: 0.09,
          });
          glows.add(q[0], MY - 0.12, q[1], 0xffe0a8, "m");
        }
      const sg = W(0, 0.2);
      neon("x_opry", sg[0], MY + 2.35, sg[1], 6.4, e.f, 0xff5ab4, { cls: "l" });
      // vertical OPRY blade on the corner of the building
      const bl = W(-4.4, 1.5),
        bs = N.x_b_opry,
        bh = 7.5,
        bw = (bh * bs.w) / bs.h;
      d.box("black_metal", bl[0], MY + 1.6, bl[1], 0.25, bh + 0.3, 2.2, {
        yaw: e.f,
      });
      d.panel("tsxn", bl[0], MY + 1.75 + bh / 2, bl[1], bw, bh, e.f + PI / 2, {
        rect: bs.rect,
        off: 0.14,
        both: true,
      });
      flick.add(bl[0], MY + 1.75 + bh / 2, bl[1], 0xffd060, "l");
      // posters in frames either side of the doors
      for (const s of [-1, 1]) {
        const q = W(s * 2.8, 0.1);
        d.box("gold", q[0], 0.55, q[1], 1.1, 1.7, 0.08, { yaw: e.f });
        d.panel("atlas_ads", q[0], 1.4, q[1], 0.95, 1.5, e.f, {
          rect: K.ad(s < 0 ? "super_sergeant" : "excalibur_gardens", 1),
          off: 0.05,
        });
      }
      spill.add(...W(0, 2.3), 0xffd8a0, 5.0, {
        y: GY,
        i: 0.45,
        sx: 5.2,
        sz: 2.4,
        yaw: e.f,
      });
      door("opry", W);
    }
    // 12 · NEON POWER & LIGHT — cellar door beside the theatre, cables climbing the façade to the boards
    {
      const e = E.power,
        W = doorway(e, { w: 1.3, h: 2.2, leaf: "metal", tint: 0x3a4a3a });
      const sg = W(0, 0.2);
      neon("x_power", sg[0], 2.95, sg[1], 2.6, e.f, 0x9ad8ff, {
        flicker: true,
      });
      const pb = W(0, 0.1);
      board("p_power", pb[0], 2.55, pb[1], 1.9, 0.36, e.f, {});
      const dg = W(1.4, 0.1);
      P.signBoard(
        d,
        "tsxp",
        K.atlases.tsx_paint.slots.p_danger.rect,
        dg[0],
        1.5,
        dg[1],
        0.6,
        0.6,
        e.f,
        {},
      );
      // transformer box + fat cable bundle up the wall to the billboards, one loop sagging over the pavement
      const tb = W(-2.2, 0.45);
      d.box("paint_green", tb[0], 0, tb[1], 1.2, 1.6, 0.8, {
        yaw: e.f,
        grime: 0.7,
      });
      K.colRot(tb[0], tb[1], 1.2, 0.8, 0, 1.6, e.f, { surface: "metal" });
      for (const k of [-0.3, 0, 0.3]) {
        const a = W(-2.2 + k, 0.2),
          c = W(-2.2 + k * 2, 0.18),
          t = W(-3.5 + k * 3, 0.2);
        d.beam("rubber", a[0], 1.6, a[1], c[0], 7.0, c[1], 0.07);
        d.beam("rubber", c[0], 7.0, c[1], t[0], 16 + k * 4, t[1], 0.06);
      }
      d.cable(
        "rubber",
        ...[W(-2.8, 0.25)[0], 5.2, W(-2.8, 0.25)[1]],
        W(2.4, 0.25)[0],
        6.4,
        W(2.4, 0.25)[1],
        0.8,
        0.05,
        8,
      );
      d.geo("lit_white", T.sphereLo, { x: tb[0], y: 1.7, z: tb[1], s: 0.05 });
      flick.add(tb[0], 1.75, tb[1], 0x9ad8ff, "s");
      spill.add(...W(0, 1.8), 0x9ad8ff, 2.2, { y: GY, i: 0.25 });
      door("power", W);
    }
    // 14 · THE BUNKHOUSE HOTEL — canopy, vertical HOTEL blade, VACANCY neon
    {
      const e = E.bunk,
        W = doorway(e, { glass: true, w: 1.8, h: 2.6, frame: "brass" });
      const c = W(0, 1.1);
      d.box("carpet", c[0], 3.0, c[1], 2.6, 0.22, 2.2, {
        yaw: e.f,
        tint: 0x2a3a6a,
        grime: 0.4,
      });
      for (const s of [-1, 1]) {
        const p = W(s * 1.2, 2.1);
        d.beam("brass", p[0], 0, p[1], p[0], 3.0, p[1], 0.05);
      }
      const sg = W(0, 0.2);
      neon("x_bunk", sg[0], 3.75, sg[1], 3.4, e.f, 0x60d0ff, {});
      const vc = W(1.9, 0.2);
      neon("x_vacancy", vc[0], 2.1, vc[1], 1.3, e.f, 0xff4a4a, {
        flicker: true,
        cls: "s",
      });
      const bl = W(-2.1, 1.3),
        bs = N.x_b_bunk,
        bh = 8.5,
        bw = (bh * bs.w) / bs.h;
      d.box("black_metal", bl[0], 4.4, bl[1], 0.25, bh + 0.3, 2.0, {
        yaw: e.f,
      });
      d.panel("tsxn", bl[0], 4.55 + bh / 2, bl[1], bw, bh, e.f + PI / 2, {
        rect: bs.rect,
        off: 0.14,
        both: true,
      });
      flick.add(bl[0], 4.55 + bh / 2, bl[1], 0x60d0ff, "l");
      lampOver(W, 0, 2.9, 0xffd0a0);
      door("bunk", W);
    }
    // 15 · NEON GUARD BARRACKS — a subway-kiosk doorway: twin green globes, stencil board, sandbags
    {
      const e = E.barracks,
        W = doorway(e, { w: 1.8, h: 2.5, leaf: "metal_dark" });
      for (const s of [-1, 1]) {
        const p = W(s * 1.45, 0.45);
        d.cyl("paint_green", p[0], 0, p[1], 0.07, 0.06, 2.3, 8, { grime: 0.5 });
        d.geo("lit_green", T.sphere, { x: p[0], y: 2.5, z: p[1], s: 0.22 });
        glows.add(p[0], 2.5, p[1], 0x7aff8a, "m");
      }
      const sg = W(0, 0.2);
      neon("x_guard", sg[0], 3.3, sg[1], 2.6, e.f, 0x7aff6a, {});
      const pb = W(0, 0.1);
      board("p_barracks", pb[0], 2.8, pb[1], 2.6, 0.4, e.f, {});
      const nw = W(-2.3, 0.1);
      board("p_noweap", nw[0], 1.7, nw[1], 1.4, 0.36, e.f, {});
      P.sandbags(d, ...W(-2.4, 0.6), ...W(-1.7, 1.4), 2, { seed: 651 });
      P.sandbags(d, ...W(2.4, 0.6), ...W(1.7, 1.4), 2, { seed: 652 });
      spill.add(...W(0, 1.8), 0x7aff8a, 2.4, { y: GY, i: 0.25 });
      door("barracks", W);
    }
    // 16 · THE CINDER CLUB — pink script neon, velvet rope, carpet runner, the bouncer's spot
    {
      const e = E.club,
        W = doorway(e, {
          w: 1.6,
          h: 2.6,
          leaf: "carpet",
          tint: 0x5a1030,
          frame: "chrome",
        });
      const sg = W(0, 0.22);
      neon("x_club", sg[0], 3.7, sg[1], 4.4, e.f, 0xff6ad0, { cls: "l" });
      const mb = W(0, 0.2);
      neon("x_members", mb[0], 2.95, mb[1], 1.8, e.f, 0xb070ff, { cls: "s" });
      const cp = W(0, 1.4);
      d.box("carpet", cp[0], GY - 0.1, cp[1], 1.3, 0.12, 2.6, {
        yaw: e.f,
        tint: 0x8a1030,
        grime: 0.3,
      });
      for (const lz of [0.9, 2.6]) {
        const p = W(1.2, lz);
        d.cyl("chrome", p[0], 0, p[1], 0.06, 0.05, 0.95, 6, {});
        d.geo("chrome", T.sphereLo, { x: p[0], y: 0.98, z: p[1], s: 0.07 });
        d.cyl("chrome", p[0], 0, p[1], 0.16, 0.18, 0.04, 8, {});
      }
      d.cable(
        "carpet",
        ...[W(1.2, 0.9)[0], 0.9, W(1.2, 0.9)[1]],
        W(1.2, 2.6)[0],
        0.9,
        W(1.2, 2.6)[1],
        0.18,
        0.03,
        6,
      );
      for (let k = 0; k < 7; k++)
        for (const s of [-1, 1]) {
          const q = W(s * 1.02, 0.12);
          const y = 0.3 + k * 0.38;
          d.geo("lit_warm", T.sphereLo, {
            x: q[0],
            y,
            z: q[1],
            s: 0.05,
            tint: 0xff9ae0,
          });
          if (k % 2) glows.add(q[0], y, q[1], 0xff8ad0, "s");
        }
      spill.add(...W(0, 2.0), 0xff6ad0, 3.4, { y: GY, i: 0.35 });
      door("club", W);
      const bq = W(1.7, 1.3);
      A("club_bouncer", bq[0], 0, bq[1], AY(e.f));
    }
    // 17 · THE SPEAKEASY — a building subway entrance on 42nd St, gate shut on a keypad lock; the code is chalked beside it
    {
      const e = E.speak,
        W = doorway(e, { grille: true, w: 2.2, h: 2.6 });
      for (const s of [-1, 1]) {
        const p = W(s * 1.5, 0.35);
        d.cyl("black_metal", p[0], 0, p[1], 0.06, 0.05, 2.4, 8, {});
        d.geo("lit_green", T.sphere, { x: p[0], y: 2.6, z: p[1], s: 0.2 });
        flick.add(p[0], 2.6, p[1], 0x7aff8a, "m");
      }
      const sb = W(0, 0.12);
      board("p_subway", sb[0], 3.1, sb[1], 2.8, 0.5, e.f, {
        back: "black_metal",
      });
      const cl = W(0, 0.2);
      board("p_closed", cl[0], 1.55, cl[1], 1.0, 0.25, e.f, {});
      const lk = W(0.15, 0.22);
      d.box("brass", lk[0], 1.1, lk[1], 0.12, 0.16, 0.06, { yaw: e.f });
      // the chalk scrawl on the tiles to the left of the gate + a Read interaction that logs the code (G.locks)
      const ks = W(-1.85, 0.03),
        kr = K.atlases.tsx_paint.slots.p_knock;
      if (kr)
        d.panel("tsxp", ks[0], 1.45, ks[1], 0.8, 0.6, e.f, {
          rect: kr.rect,
          off: 0.02,
        });
      const SL = K.neonSpeakLock || {
        id: "lma_neon_speakeasy_gate",
        code: "20142",
      };
      G.world.addInteractable({
        pos: new THREE.Vector3(ks[0], 1.45, ks[1]),
        radius: 0.45,
        range: 2.2,
        priority: 0.2,
        label: "Chalk scrawl",
        verb: "Read",
        onInteract: () => {
          G.notify &&
            G.notify(
              'Chalked on the tiles: "THE 42 — KNOCK 2 · 0 · 1 · 42 — WHISPER SENT YOU." The gate keypad code: ' +
                SL.code.split("").join("-") +
                ".",
            );
          K.lockLearn(SL.id);
        },
      });
      door("speak", W);
    }
    // 10 · THE TICKER ORACLE — the prow of One Times Square: steel door, eye + name neon, the Ball's street winch
    {
      const e = E.oracle,
        W = doorway(e, { w: 1.1, h: 2.3, leaf: "metal_dark" });
      const sg = W(-0.45, 0.15);
      neon("x_oracle", sg[0], 3.35, sg[1], 2.2, e.f, 0x6aff9a, {
        flicker: true,
        cls: "m",
      });
      const ey = W(-0.45, 0.12);
      d.panel("tsxn", ey[0], 4.3, ey[1], 1.3, 0.83, e.f, {
        rect: N.x_eye.rect,
        off: 0.03,
      });
      glows.add(ey[0], 4.3, ey[1] - 0.5, 0x9a7aff, "m");
      door("oracle", W);
      // the winch (quests: ball_base), cable up the prow to the soffit
      const wq = [-30.9, -225.12];
      d.box("paint_green", wq[0], 0.25, wq[1], 0.75, 0.9, 0.42, { grime: 0.8 });
      d.cyl("rust", wq[0], 0.55, wq[1] - 0.26, 0.2, 0.2, 0.3, 10, {
        grime: 0.8,
      });
      d.beam("black_metal", wq[0], 1.15, wq[1], wq[0], 6.1, wq[1], 0.03);
      d.box("black_metal", wq[0], 0, wq[1], 0.9, 0.25, 0.5, {});
      A("ball_base", -30.9, 0, -225.8, 0);
      spill.add(-31.6, -226.4, 0x6aff9a, 2.2, { y: GY, i: 0.22 });
    }
    // THE ROOFTOP NEST — service-stair door on the market plaza
    {
      const e = E.nest,
        W = doorway(e, { w: 1.1, h: 2.3, leaf: "metal_dark", tint: 0x4a5a3a });
      const pb = W(0, 0.1);
      board("p_nest", pb[0], 2.65, pb[1], 1.6, 0.34, e.f, {});
      lampOver(W, 0, 2.6, 0xffc080);
      door("nest", W);
    }
    // 11 · THE MAYOR'S OFFICE — the old Armed Forces Recruiting Station, free-standing on the NW plaza
    {
      const s = ST,
        hw = s.W / 2,
        hl = s.L / 2,
        f = s.f; // f: front faces along +u (toward the crossing)
      const Wc = (lx, lz) => [
        s.x + s.ux * lz + s.nx * lx,
        s.z + s.uz * lz + s.nz * lx,
      ]; // lz along u, lx along n
      const corners = [Wc(-hw, -hl), Wc(hw, -hl), Wc(hw, hl), Wc(-hw, hl)];
      const poly = corners.map((p) => [p[0], p[1]]);
      b.prism("steel", poly, 0, 3.4, { grime: 0.35 });
      b.prism(
        "black_metal",
        poly.map((p) => [
          p[0] + (p[0] - s.x) * 0.06,
          p[1] + (p[1] - s.z) * 0.06,
        ]),
        3.4,
        3.7,
        { grime: 0.3 },
      );
      for (let i = 0; i < 4; i++) {
        const a = corners[i],
          c = corners[(i + 1) % 4];
        K.colWall(a[0], a[1], c[0], c[1], 0.3, 0, 3.7, []);
      }
      // front: glass door + fascia; long sides: the neon flag in the glass; back: a notice board
      const fW = fr(...Wc(0, hl + 0.02), f);
      d.panel(
        "glass",
        ...[fW(0, 0.02)[0], 1.35, fW(0, 0.02)[1]],
        1.4,
        2.4,
        f,
        {},
      );
      d.box(
        "chrome",
        fW(-0.72, 0.03)[0],
        0,
        fW(-0.72, 0.03)[1],
        0.1,
        2.6,
        0.1,
        { yaw: f },
      );
      d.box("chrome", fW(0.72, 0.03)[0], 0, fW(0.72, 0.03)[1], 0.1, 2.6, 0.1, {
        yaw: f,
      });
      board("p_mayor", fW(0, 0.04)[0], 2.95, fW(0, 0.04)[1], 2.6, 0.5, f, {
        glow: true,
      });
      for (const sd of [-1, 1]) {
        const sf = f + (sd * PI) / 2;
        const sW = fr(...Wc(sd * (hw + 0.02), 0), sf);
        d.panel(
          "glass",
          ...[sW(0, 0.01)[0], 1.9, sW(0, 0.01)[1]],
          5.6,
          2.4,
          sf,
          {},
        );
        d.panel("tsxn", sW(0, 0.05)[0], 1.95, sW(0, 0.05)[1], 3.6, 2.16, sf, {
          rect: N.x_flag.rect,
        });
        glows.add(sW(-1, 0.6)[0], 1.9, sW(-1, 0.6)[1], 0xff4040, "l");
        glows.add(sW(1.2, 0.6)[0], 2.2, sW(1.2, 0.6)[1], 0x6a8aff, "m");
        board("p_recruit", sW(0, 0.04)[0], 3.45, sW(0, 0.04)[1], 6.2, 0.5, sf, {
          glow: true,
        });
      }
      const bW = fr(...Wc(0, -hl - 0.02), f + PI);
      P.signBoard(
        d,
        "tsxp",
        K.atlases.tsx_paint.slots.p_notice.rect,
        bW(0, 0.05)[0],
        1.6,
        bW(0, 0.05)[1],
        1.8,
        1.2,
        f + PI,
        { backMat: "wood_dark" },
      );
      const nb = bW(0, 0.9);
      A("notice_board", nb[0], 0, nb[1], AY(f));
      // flags on poles at the front corners (US + a Neon pennant), sandbags, a lamp
      for (const sd of [-1, 1]) {
        const p = fW(sd * 1.9, 0.6);
        d.cyl("metal", p[0], 0, p[1], 0.06, 0.04, 5.2, 6, {});
        d.geo("gold", T.sphereLo, { x: p[0], y: 5.3, z: p[1], s: 0.09 });
        d.panel(
          "fabric",
          p[0] + Math.cos(f) * sd * 0.7,
          4.55,
          p[1] - Math.sin(f) * sd * 0.7,
          1.4,
          0.9,
          f,
          { tint: sd < 0 ? 0xb02a22 : 0x2a8a4a, double: true, grime: 0.3 },
        );
      }
      lampOver(fW, 0, 3.1, 0xfff0d0);
      spill.add(s.x, s.z, 0xff5050, 4.6, {
        y: GY,
        i: 0.18,
        sx: 3.4,
        sz: 5.4,
        yaw: f,
      });
      A("mayor_door", fW(0, 1.2)[0], 0, fW(0, 1.2)[1], AY(f));
    }

    // =========================== THE FREIGHT DEPOT (yard on the Port-Authority side) ===========================
    {
      const Y = YARD;
      // yard floor: packed dirt + straw over the old foundation
      d.boxMM("dirt", Y.x0, 0, Y.wz, Y.x1, 0.14, Y.z1, {
        faces: "t",
        grime: 0.7,
      });
      // warehouse (north part of the lot): brick base, corrugated upper storey, roll-up doors on the yard side
      const wy = 8.2;
      b.boxMM("brick_brown", Y.x0, 0, Y.z0, Y.x1, 4.2, Y.wz, { grime: 0.6 });
      b.boxMM("corrugated", Y.x0, 4.2, Y.z0, Y.x1, wy, Y.wz, { grime: 0.7 });
      b.boxMM(
        "rust",
        Y.x0 - 0.2,
        wy,
        Y.z0 - 0.2,
        Y.x1 + 0.2,
        wy + 0.25,
        Y.wz + 0.2,
        { grime: 0.7 },
      );
      K.colBox(Y.x0, 0, Y.z0, Y.x1, wy + 0.25, Y.wz);
      const face = (x, key, lit) => {
        d.boxMM(
          "black_metal",
          x - 1.9,
          0,
          Y.wz - 0.05,
          x + 1.9,
          3.6,
          Y.wz + 0.12,
          { grime: 0.5 },
        );
        for (let k = 0; k < 10; k++)
          d.boxMM(
            lit ? "metal" : "rust",
            x - 1.7,
            0.2 + k * 0.33,
            Y.wz + 0.12,
            x + 1.7,
            0.5 + k * 0.33,
            Y.wz + 0.2,
            { grime: 0.6 },
          );
        if (key) board(key, x, 4.4, Y.wz + 0.12, 3.6, 0.5, 0, {});
      };
      face(-82.0, "p_oxpen", false);
      // walk-in door (depot interior) with the NEON FREIGHT neon over it
      d.boxMM(
        "black_metal",
        E.depot.x - 1.0,
        0,
        Y.wz - 0.05,
        E.depot.x + 1.0,
        2.6,
        Y.wz + 0.15,
        {},
      );
      d.panel("wood", E.depot.x, 1.2, Y.wz + 0.16, 1.5, 2.4, 0, {
        tint: 0x6a4a2a,
      });
      neon("x_depot", E.depot.x - 1.6, 5.3, Y.wz + 0.18, 4.2, 0, 0xff9a3a, {});
      d.panel("tsxg", E.depot.x - 1.6, 6.5, Y.wz + 0.2, 5.4, 0.72, 0, {
        rect: K.atlases.tsx_paint.slots.p_depot.rect,
      });
      for (const lx of [-90.5, -82.0]) {
        d.box("black_metal", lx, 3.9, Y.wz + 0.6, 0.3, 0.25, 0.3, {});
        d.geo("lit_warm", T.sphereLo, {
          x: lx,
          y: 3.85,
          z: Y.wz + 0.6,
          s: 0.12,
        });
        glows.add(lx, 3.8, Y.wz + 0.7, 0xffb060, "m");
      }
      A("depot_door", E.depot.x, 0, Y.wz + 1.2, AY(0));
      // north face on 47th St: a boarded loading door + a painted sign
      d.boxMM("wood_rotten", -89.5, 0, Y.z0 - 0.12, -83.5, 3.2, Y.z0, {
        grime: 0.7,
      });
      d.panel("tsxp", -86.5, 4.6, Y.z0 - 0.14, 5.4, 0.72, PI, {
        rect: K.atlases.tsx_paint.slots.p_depot.rect,
      });
      // the exposed party wall of the market block: a faded ghost sign
      d.panel("tsxp", Y.x1 - 0.06, 20, -252.5, 14, 14, -PI / 2, {
        rect: K.atlases.tsx_paint.slots.p_ghost.rect,
      });
      // yard walls: scrap on the lot line with the convoy gate on 42nd St, wood fence along the west neighbour
      P.scrapWall(d, Y.x0, Y.z1 - 0.3, -89.8, Y.z1 - 0.3, 3.0, { seed: 661 });
      P.scrapWall(d, -83.2, Y.z1 - 0.3, Y.x1 + 0.1, Y.z1 - 0.3, 3.0, {
        seed: 662,
      });
      for (const gx of [-89.8, -83.2]) {
        d.box("rust", gx, 0, Y.z1 - 0.3, 0.4, 4.6, 0.4, { grime: 0.6 });
        K.colBox(gx - 0.2, 0, Y.z1 - 0.5, gx + 0.2, 4.6, Y.z1 - 0.1);
      }
      d.box("rust", -86.5, 4.4, Y.z1 - 0.3, 7.0, 0.35, 0.3, { grime: 0.6 });
      neon("x_depot", -86.5, 5.05, Y.z1 - 0.1, 4.6, 0, 0xff9a3a, {
        backing: true,
      });
      bulbRow(
        [
          [-89.8, 4.3, Y.z1 - 0.1],
          [-83.2, 4.3, Y.z1 - 0.1],
        ],
        [0xffd060, 0xff8a40],
        { spacing: 0.6, sag: 0.25 },
      );
      // swung-open gate leaves
      d.box("corrugated", -90.8, 0.1, Y.z1 - 1.3, 0.12, 2.6, 2.0, {
        yaw: 0.2,
        grime: 0.7,
      });
      d.box("corrugated", -82.2, 0.1, Y.z1 - 1.3, 0.12, 2.6, 2.0, {
        yaw: -0.2,
        grime: 0.7,
      });
      // ox pen: posts + rails, trough, hay
      const px0 = Y.x0 + 0.4,
        px1 = -88.2,
        pz0 = -255.6,
        pz1 = -241.8;
      for (let z = pz0; z <= pz1 + 0.01; z += 2.3) {
        d.beam("wood", px1, 0, z, px1, 1.3, z, 0.1);
      }
      for (let x = px0; x <= px1 + 0.01; x += 2.0) {
        d.beam("wood", x, 0, pz0, x, 1.3, pz0, 0.1);
        d.beam("wood", x, 0, pz1, x, 1.3, pz1, 0.1);
      }
      for (const y of [0.55, 1.15]) {
        d.beam("wood", px1, y, pz0, px1, y, pz1 - 3.0, 0.07);
        d.beam("wood", px0, y, pz0, px1, y, pz0, 0.07);
        d.beam("wood", px0, y, pz1, px1, y, pz1, 0.07);
      }
      K.colBox(px1 - 0.1, 0, pz0, px1 + 0.1, 1.3, pz1 - 3.0, {
        walkable: false,
      });
      K.colBox(px0, 0, pz0 - 0.1, px1, 1.3, pz0 + 0.1, { walkable: false });
      K.colBox(px0, 0, pz1 - 0.1, px1, 1.3, pz1 + 0.1, { walkable: false });
      d.box("wood_dark", -91.0, 0, -252.6, 2.4, 0.5, 0.6, { grime: 0.6 });
      d.box("dirt", -91.0, 0.35, -252.6, 2.2, 0.1, 0.45, { tint: 0x6a7a8a });
      for (const h of [
        [-92.6, -245.0],
        [-91.4, -244.1],
        [-92.8, -247.4],
      ])
        d.box("dirt", h[0], 0, h[1], 1.0, 0.6, 0.7, {
          yaw: h[0] * 0.3,
          tint: 0xc8b070,
          grime: 0.3,
        });
      board("p_oxpen", px1 + 0.05, 1.9, -243.2, 1.8, 0.45, PI / 2, {});
      // a wagon (two wheels, bed, canvas hoop cover) + a wreck used for parts, crates, feed sacks, lanterns
      const wagon = (x, z, yaw, cover) => {
        const W = fr(x, z, yaw);
        d.box("wood", x, 0.7, z, 1.8, 0.18, 3.6, { yaw, grime: 0.6 });
        for (const sd of [-0.85, 0.85]) {
          const sb = W(sd, 0);
          d.box("wood", sb[0], 0.88, sb[1], 0.08, 0.45, 3.6, { yaw });
        }
        for (const s of [-1, 1]) {
          const w = W(s * 1.02, 0.3);
          d.geo("wood_dark", T.torusThick, {
            x: w[0],
            y: 0.72,
            z: w[1],
            ry: yaw + PI / 2,
            s: 0.62,
          });
          d.geo("wood", T.cyl8, {
            x: w[0],
            y: 0.72,
            z: w[1],
            rz: PI / 2,
            ry: yaw + PI / 2,
            sx: 0.08,
            sy: 0.3,
            sz: 0.08,
          });
        }
        const tg = W(0, 2.8);
        d.beam(
          "wood",
          ...[W(-0.3, 1.8)[0], 0.8, W(-0.3, 1.8)[1]],
          tg[0],
          0.3,
          tg[1],
          0.06,
        );
        d.beam(
          "wood",
          ...[W(0.3, 1.8)[0], 0.8, W(0.3, 1.8)[1]],
          tg[0],
          0.3,
          tg[1],
          0.06,
        );
        if (cover)
          for (let k = 0; k < 4; k++) {
            const q = W(0, -1.5 + k * 1.0);
            d.geo("fabric", T.cyl12, {
              x: q[0],
              y: 0.9,
              z: q[1],
              rx: PI / 2,
              ry: yaw,
              sx: 0.95,
              sy: 0.9,
              sz: 1.3,
              tint: 0xd8ccaa,
              grime: 0.5,
            });
          }
        K.colRot(x, z, 1.9, 3.7, 0, 2.2, yaw, {
          surface: "wood",
          tag: "cover",
        });
      };
      wagon(-82.6, -254.2, 0.08, true);
      wagon(-91.4, -239.2, 1.45, false);
      for (const c of [
        [-80.6, -245.4, 0.2],
        [-80.4, -246.4, 0.9],
        [-80.7, -245.9, 0.4, 0.8],
        [-81.0, -256.9, 0.1],
        [-80.1, -257.0, 0.7],
      ])
        P.crate(d, c[0], c[3] || 0, c[1], 0.8, c[2]);
      for (let k = 0; k < 4; k++)
        d.geo("fabric", T.sphereLo, {
          x: -80.4 - (k % 2) * 0.5,
          y: 0.3,
          z: -240.5 - k * 0.6,
          sx: 0.4,
          sy: 0.3,
          sz: 0.3,
          tint: 0xb8a878,
          grime: 0.5,
        });
      P.barrel(d, -81.0, 0, -249.8, "fire", { glows, collide: true });
      P.bulbs(
        d,
        glows,
        [
          [-93.6, 5.2, -258.2],
          [-86.5, 4.6, -248.0],
          [-79.3, 6.0, -238.0],
        ],
        { spacing: 1.1, sag: 0.4, colors: [0xffc070, 0xffe0a0, 0xff9050] },
      );
      A("convoy_arrive", -86.5, 0, -235.4, 0);
      A("convoy_park_1", -84.6, 0, -243.0, 0);
      A("convoy_park_2", -84.6, 0, -248.6, 0);
      A("convoy_park_3", -86.4, 0, -252.4, 0);
      A("ox_pen", -91.2, 0, -248.6, 0);
      A("convoy_master", -85.3, 0, -256.4, AY(0));
    }

    // =========================== THE SNIPERS' NEST (market block roof, y 42) ===========================
    {
      const RY = 42,
        x0 = -79,
        x1 = -64,
        z0 = -268,
        z1 = -237;
      // parapet on all four edges (visible + solid)
      for (const e2 of [
        [x0, z0, x1, z0 + 0.35],
        [x0, z1 - 0.35, x1, z1],
        [x0, z0, x0 + 0.35, z1],
        [x1 - 0.35, z0, x1, z1],
      ]) {
        d.boxMM("limestone_dark", e2[0], RY, e2[1], e2[2], RY + 1.05, e2[3], {
          grime: 0.6,
        });
        K.colBox(e2[0], RY, e2[1], e2[2], RY + 1.05, e2[3], {
          walkable: false,
        });
      }
      // stair bulkhead with the door down
      d.boxMM("brick_brown", -71.2, RY, -266.2, -67.8, RY + 2.9, -262.8, {
        grime: 0.6,
      });
      K.colBox(-71.2, RY, -266.2, -67.8, RY + 2.9, -262.8);
      d.boxMM("rust", -71.4, RY + 2.9, -266.4, -67.6, RY + 3.1, -262.6, {
        grime: 0.6,
      });
      d.panel("metal_dark", -67.78, RY + 1.15, -264.5, 1.1, 2.2, PI / 2, {
        tint: 0x4a5a3a,
      });
      d.box("black_metal", -67.5, RY + 2.35, -264.5, 0.3, 0.25, 0.3, {});
      d.geo("lit_warm", T.sphereLo, {
        x: -67.4,
        y: RY + 2.3,
        z: -264.5,
        s: 0.1,
      });
      glows.add(-67.2, RY + 2.25, -264.5, 0xffb060, "m");
      A("nest_door", -66.6, RY, -264.5, AY(PI / 2));
      // the nest: sandbag ring along the east parapet, a tarp on poles, cot, ammo crates, a spotlight, a radio
      P.sandbags(d, -65.0, -259.5, -65.0, -244.5, 2, { y: RY, seed: 671 });
      P.sandbags(d, -65.2, -259.8, -68.4, -259.8, 2, { y: RY, seed: 672 });
      P.sandbags(d, -65.2, -244.2, -68.4, -244.2, 2, { y: RY, seed: 673 });
      for (const p of [
        [-65.6, -258.8],
        [-69.4, -258.8],
        [-65.6, -245.2],
        [-69.4, -245.2],
      ])
        d.beam(
          "wood",
          p[0],
          RY,
          p[1],
          p[0],
          RY + (p[0] > -67 ? 2.6 : 2.3),
          p[1],
          0.08,
        );
      d.quad(
        "fabric",
        [-69.4, RY + 2.3, -245.2],
        [-65.6, RY + 2.6, -245.2],
        [-65.6, RY + 2.6, -258.8],
        [-69.4, RY + 2.3, -258.8],
        { double: true, tint: 0x5a6a4a, grime: 0.5 },
      );
      P.mattress(d, -68.4, RY + 0.02, -249.0, 0.05);
      P.crate(d, -68.6, RY, -256.6, 0.8, 0.2, { tint: 0x5a6a3a });
      P.crate(d, -68.5, RY + 0.64, -256.4, 0.6, 0.7, { tint: 0x5a6a3a });
      d.box("metal_dark", -68.7, RY, -253.0, 0.5, 0.9, 0.35, {
        tint: 0x4a5a3a,
      });
      d.geo("lit_green", T.sphereLo, {
        x: -68.7,
        y: RY + 0.95,
        z: -253.0,
        s: 0.04,
      });
      P.searchlight(d, glows, -65.8, RY, -252.0, PI / 2, 0.12);
      for (let k = 0; k < 3; k++)
        d.beam(
          "wood_dark",
          -69.6,
          RY + 0.4 + k * 0.5,
          -247.2,
          -69.6,
          RY + 0.4 + k * 0.5,
          -246.0,
          0.05,
        ); // rifle rack
      glows.add(-67.5, RY + 2.2, -252.0, 0xffc080, "m");
      A("sniper_1", -65.9, RY, -256.6, AY(PI / 2 + 0.35));
      A("sniper_2", -65.9, RY, -247.2, AY(PI / 2 - 0.35));
    }

    // =========================== ONE TIMES SQUARE: the Ball, the Crossroads Screen, the zipper ===========================
    const TOP = 60;
    const up = [
      [-34.6, -225.3],
      [-29.15, -225.3],
      [-23.95, -212.5],
      [-34.6, -212.5],
    ];
    const grow = (poly, g) => {
      const cen = poly.reduce(
        (s, p) => [s[0] + p[0] / poly.length, s[1] + p[1] / poly.length],
        [0, 0],
      );
      return poly.map((p) => {
        const vx = p[0] - cen[0],
          vz = p[1] - cen[1],
          l = Math.hypot(vx, vz) || 1;
        return [p[0] + (vx / l) * g, p[1] + (vz / l) * g];
      });
    };
    const top2 = grow(up, -0.9),
      bc = top2.reduce(
        (s, p) => [s[0] + p[0] / top2.length, s[1] + p[1] / top2.length],
        [0, 0],
      );
    const BALL_TOP = TOP + 23.4,
      DROP = 19.2,
      R0 = 1.75;
    const TS = rec;
    {
      // lattice mast: four angle posts tapering up, zig-zag bracing, a crown and an aircraft beacon
      const hb = 1.15,
        ht = 0.34,
        MH = 25.2;
      const post = (sx, sz, y) => {
        const f = y / MH,
          h = hb + (ht - hb) * f;
        return [bc[0] + sx * h, TOP + y, bc[1] + sz * h];
      };
      for (const c of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ]) {
        const a = post(c[0], c[1], 0),
          e2 = post(c[0], c[1], MH);
        d.beam("black_metal", a[0], a[1], a[2], e2[0], e2[1], e2[2], 0.12);
      }
      for (let y = 0; y < MH - 0.5; y += 1.8) {
        const sides = [
          [
            [-1, -1],
            [1, -1],
          ],
          [
            [1, -1],
            [1, 1],
          ],
          [
            [1, 1],
            [-1, 1],
          ],
          [
            [-1, 1],
            [-1, -1],
          ],
        ];
        for (const sd of sides) {
          const a = post(sd[0][0], sd[0][1], y),
            e2 = post(sd[1][0], sd[1][1], y + 1.8);
          d.beam("rust", a[0], a[1], a[2], e2[0], e2[1], e2[2], 0.05);
          const h1 = post(sd[0][0], sd[0][1], y);
          const h2 = post(sd[1][0], sd[1][1], y);
          d.beam("rust", h1[0], h1[1], h1[2], h2[0], h2[1], h2[2], 0.05);
        }
      }
      d.cyl("black_metal", bc[0], TOP + MH, bc[1], 0.5, 0.2, 0.6, 8, {});
      d.geo("lit_red", T.sphereLo, {
        x: bc[0],
        y: TOP + MH + 0.75,
        z: bc[1],
        s: 0.16,
      });
      d.boxMM(
        "rust",
        bc[0] - 1.6,
        TOP,
        bc[1] - 1.6,
        bc[0] + 1.6,
        TOP + 0.45,
        bc[1] + 1.6,
        { grime: 0.7 },
      ); // base plinth
      d.box("paint_green", bc[0] + 1.9, TOP, bc[1] + 0.2, 1.0, 0.9, 0.7, {
        grime: 0.8,
      }); // the rooftop winch
      d.beam(
        "black_metal",
        bc[0] + 1.6,
        TOP + 0.7,
        bc[1] + 0.2,
        bc[0] + 0.3,
        TOP + MH - 0.3,
        bc[1],
        0.025,
      ); // hoist cable
      TS.anchor("ball_bottom", bc[0], BALL_TOP - DROP, bc[1], 0);
      TS.anchor("ball_top", bc[0], BALL_TOP, bc[1], 0);
      TS.anchor("one_times_square", bc[0], TOP, bc[1], 0);
      // the ball (own moving group): 80 triangular crystal panels (some dead, some rusted), a chrome frame on the icosa edges
      K.defineMat("ts_ball_lit", {
        basic: true,
        color: 0xffffff,
        toneMapped: false,
        noShadow: true,
      });
      const ballGrp = new THREE.Group();
      ballGrp.name = "lma_ts_ball";
      rec.root.add(ballGrp);
      const bb = K.builder("ts_ball", { grime: 0 });
      const geo = new THREE.IcosahedronGeometry(R0, 1),
        pa = geo.attributes.position;
      const pal = [0xfff4e0, 0xff5050, 0x60a0ff, 0xffd060, 0xfff4e0, 0x70ff90];
      const rr = K.rng(5150);
      for (let i = 0; i < pa.count; i += 3) {
        const v = [0, 1, 2].map((k) => [
          bc[0] + pa.getX(i + k),
          BALL_TOP + pa.getY(i + k),
          bc[1] + pa.getZ(i + k),
        ]);
        const dead = rr() < 0.22;
        bb.quad(dead ? "rust" : "ts_ball_lit", v[0], v[1], v[2], v[2], {
          tint: dead ? 0x6a4a3a : pal[Math.floor(rr() * pal.length)],
          grime: dead ? 0.6 : 0,
        });
      }
      const eg = new THREE.EdgesGeometry(
          new THREE.IcosahedronGeometry(R0 * 1.01, 1),
        ),
        ea = eg.attributes.position;
      for (let i = 0; i < ea.count; i += 2)
        bb.beam(
          "chrome",
          bc[0] + ea.getX(i),
          BALL_TOP + ea.getY(i),
          bc[1] + ea.getZ(i),
          bc[0] + ea.getX(i + 1),
          BALL_TOP + ea.getY(i + 1),
          bc[1] + ea.getZ(i + 1),
          0.045,
        );
      geo.dispose();
      eg.dispose();
      bb.cyl(
        "black_metal",
        bc[0],
        BALL_TOP - R0 - 0.25,
        bc[1],
        0.6,
        0.45,
        0.3,
        10,
        {},
      ); // carriage collar
      bb.finish(ballGrp, { cast: false });
      const bgl = K.glowSet("ts_ball");
      for (let k = 0; k < 26; k++) {
        const a = k * 2.399,
          yy = -1 + (k / 25) * 2,
          r2 = Math.sqrt(1 - yy * yy) * (R0 + 0.12);
        bgl.add(
          bc[0] + Math.cos(a) * r2,
          BALL_TOP + yy * (R0 + 0.1),
          bc[1] + Math.sin(a) * r2,
          pal[k % 4],
          "s",
        );
      }
      bgl.add(bc[0], BALL_TOP, bc[1], 0xfff4e0, "xl");
      const bglGrp = bgl.finish(ballGrp, {
        dayOpacity: 0.3,
        nightOpacity: 1,
        flicker: 0.15,
      });
      const ballMat = K.mat("ts_ball_lit");
      const BS = {
        t: 0.55,
        lastCall: -1e9,
        fixed: false,
        lit: 0.25,
        grp: ballGrp,
        glow: bglGrp,
      };
      TS.ball = BS;
      TS.setBallDrop = function (t) {
        BS.t = U.clamp(+t || 0, 0, 1);
        BS.lastCall = K._tsTime || 0;
      };
      TS.ballState = () => ({
        t: BS.t,
        fixed: BS.fixed,
        y: BALL_TOP - DROP * BS.t,
      });
      K.animate((dt, t, night) => {
        K._tsTime = t;
        if (((t * 2) | 0) !== BS._tick) {
          // 2 Hz: is the ball fixed? (quests flag)
          BS._tick = (t * 2) | 0;
          try {
            BS.fixed = !!(
              G.quests &&
              !G.isStub("quests") &&
              G.quests.flag &&
              (G.quests.flag("neon_ball_fixed") ||
                (G.quests.isComplete && G.quests.isComplete("sq_neon_ball")))
            );
          } catch (e) {
            BS.fixed = false;
          }
        }
        const calling = t - BS.lastCall < 1.0;
        const want = calling ? BS.t : BS.fixed ? 0 : 0.55;
        if (!calling) BS.t += (want - BS.t) * Math.min(1, dt * 1.5);
        ballGrp.position.y = -DROP * BS.t;
        const tgt = BS.fixed
          ? 1
          : 0.28 + 0.12 * (Math.sin(t * 7.1) > 0.7 ? 1 : 0);
        BS.lit += (tgt - BS.lit) * Math.min(1, dt * 2);
        ballMat.color.setScalar(
          (0.35 + 0.65 * night) *
            BS.lit *
            (K._tsPower === undefined ? 1 : K._tsPower),
        );
      });
    }
    {
      // ---- the Crossroads Screen (replaces the lower screen of the stack) ----
      // THE hero screen of the square: wider than the tower stack, a deep steel cabinet with a chrome bezel, chaser bulbs,
      // a CROSSROADS apron with its own neon, knee braces and a maintenance catwalk under it. It lights the plaza (pool),
      // not the air in front of it (no floating glow orb).
      const cx = -31.9,
        zw = -225.3,
        DEP = 1.25,
        zf = zw - DEP - 0.02,
        SW = 15.2,
        SH = 8.2,
        SB = 14.4,
        SY = SB + SH / 2;
      const FW = SW + 1.4,
        FB = 12.9,
        FT = SB + SH + 0.7;
      d.boxMM("black_metal", cx - FW / 2, FB, zw - DEP, cx + FW / 2, FT, zw, {
        grime: 0.35,
      });
      for (const q of [
        [SB - 0.14, SB + 0.02],
        [SB + SH - 0.02, SB + SH + 0.14],
      ])
        d.boxMM(
          "chrome",
          cx - SW / 2 - 0.14,
          q[0],
          zf - 0.12,
          cx + SW / 2 + 0.14,
          q[1],
          zf + 0.02,
          {},
        );
      for (const sx of [-1, 1]) {
        const x0 = sx < 0 ? cx - SW / 2 - 0.14 : cx + SW / 2;
        d.boxMM(
          "chrome",
          x0,
          SB - 0.14,
          zf - 0.12,
          x0 + 0.14,
          SB + SH + 0.14,
          zf + 0.02,
          {},
        );
      }
      for (const q of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        d.box(
          "chrome",
          cx + q[0] * (FW / 2 - 0.3),
          q[1] < 0 ? FB + 0.1 : FT - 0.5,
          zw - DEP - 0.05,
          0.4,
          0.4,
          0.1,
          {},
        ); // corner plates
      // knee braces back to the façade + the catwalk under the apron
      for (const sx of [-1, 1]) {
        d.beam(
          "black_metal",
          cx + sx * (FW / 2 - 0.4),
          FB + 0.2,
          zw - DEP + 0.1,
          cx + sx * 2.6,
          FB - 3.0,
          zw - 0.3,
          0.1,
        );
        d.beam(
          "black_metal",
          cx + sx * (FW / 2 - 0.4),
          FT - 0.2,
          zw - DEP + 0.1,
          cx + sx * 2.6,
          FT + 2.0,
          zw - 0.3,
          0.08,
        );
      }
      d.boxMM(
        "metal_dark",
        cx - FW / 2 + 0.3,
        FB - 0.18,
        zw - DEP - 0.9,
        cx + FW / 2 - 0.3,
        FB - 0.08,
        zw - DEP + 0.05,
        { grime: 0.6 },
      );
      d.beam(
        "rust",
        cx - FW / 2 + 0.3,
        FB + 0.85,
        zw - DEP - 0.88,
        cx + FW / 2 - 0.3,
        FB + 0.85,
        zw - DEP - 0.88,
        0.035,
      );
      for (let k = 0; k <= 8; k++)
        d.beam(
          "rust",
          cx - FW / 2 + 0.3 + (k * (FW - 0.6)) / 8,
          FB - 0.1,
          zw - DEP - 0.88,
          cx - FW / 2 + 0.3 + (k * (FW - 0.6)) / 8,
          FB + 0.85,
          zw - DEP - 0.88,
          0.025,
        );
      // CROSSROADS apron neon + chaser bulbs round the cabinet
      const xs = K.tsxNeon(
        "x_crossroads_hdr",
        "CROSSROADS  ·  NEWS  ·  THE NEON",
        0x7ad0ff,
        { font: 'bold 64px "Arial Black", Impact, sans-serif', h: 100 },
      );
      d.panel(
        "tsxn",
        cx,
        FB + 0.72,
        zw - DEP - 0.04,
        10.5,
        (10.5 * xs.h) / xs.w,
        PI,
        { rect: xs.rect, off: 0.02 },
      );
      bulbRow(
        [
          [cx - FW / 2 + 0.1, FT - 0.12, zw - DEP - 0.06],
          [cx + FW / 2 - 0.1, FT - 0.12, zw - DEP - 0.06],
        ],
        [0xffe8a0, 0xffe8a0, 0xff7a5a],
        { spacing: 0.5, sag: 0, size: "s" },
      );
      bulbRow(
        [
          [cx - FW / 2 + 0.1, FB + 0.1, zw - DEP - 0.06],
          [cx + FW / 2 - 0.1, FB + 0.1, zw - DEP - 0.06],
        ],
        [0xffe8a0, 0xff7a5a, 0xffe8a0],
        { spacing: 0.5, sag: 0, size: "s" },
      );
      for (const sx of [-1, 1])
        bulbRow(
          [
            [cx + sx * (FW / 2 - 0.12), FB + 0.4, zw - DEP - 0.06],
            [cx + sx * (FW / 2 - 0.12), FT - 0.4, zw - DEP - 0.06],
          ],
          [0xffe8a0],
          { spacing: 0.5, sag: 0, size: "s" },
        );
      const cv = K.canvas(1024, 512),
        cx2 = cv.getContext("2d");
      const tex = K.texFromCanvas(cv, { clamp: true });
      K.defineMat("ts_xscreen", {
        basic: true,
        map: tex,
        color: 0xffffff,
        toneMapped: false,
        noShadow: true,
      });
      ads.panel("ts_xscreen", cx, SY, zf, SW, SH, PI, { rect: [0, 0, 1, 1] });
      for (const s2 of [-5, 0, 5])
        glows.add(cx + s2, SB + 0.3, zf - 0.35, 0xa0c8ff, "m");
      spill.add(cx, -236.0, 0x8ab4ff, 9.0, { y: GY, i: 0.12, sx: 9, sz: 7 });
      // crawl strip (scrolling texture, redrawn only when the news changes)
      const cc = K.canvas(2048, 64),
        ccx = cc.getContext("2d");
      const ctex = K.texFromCanvas(cc, {});
      ctex.wrapT = THREE.ClampToEdgeWrapping;
      K.defineMat("ts_crawl", {
        basic: true,
        map: ctex,
        color: 0xffffff,
        toneMapped: false,
        noShadow: true,
      });
      ads.panel("ts_crawl", cx, SB + 0.42, zf - 0.03, SW, 0.84, PI, {
        rect: [0, 0, SW / 12.6, 1],
      });
      // the zipper round the base (3 faces), same scrolling-texture trick, amber LEDs
      const zc = K.canvas(2048, 64),
        zcx = zc.getContext("2d");
      const ztex = K.texFromCanvas(zc, {});
      ztex.wrapT = THREE.ClampToEdgeWrapping;
      K.defineMat("ts_zipper", {
        basic: true,
        map: ztex,
        color: 0xffffff,
        toneMapped: false,
        noShadow: true,
      });
      const ZY = 5.62,
        ZH = 0.62,
        ZL = 20.8; // texture length in metres
      const zfaces = [
        [
          [-33.4, -212.5],
          [-33.4, -224.9],
        ],
        [
          [-33.4, -224.9],
          [-30.45, -224.9],
        ],
        [
          [-30.45, -224.9],
          [-25.25, -212.5],
        ],
      ];
      let u = 0;
      for (const zfc of zfaces) {
        const a = zfc[0],
          c = zfc[1],
          Lg = Math.hypot(c[0] - a[0], c[1] - a[1]);
        const nx = (c[1] - a[1]) / Lg,
          nz = -(c[0] - a[0]) / Lg; // outward (polygon is clockwise seen from above here)
        const m = [
          (a[0] + c[0]) / 2 + nx * 0.08,
          (a[1] + c[1]) / 2 + nz * 0.08,
        ];
        const f = Math.atan2(nx, nz);
        d.box(
          "black_metal",
          m[0] - nx * 0.04,
          ZY - ZH / 2 - 0.06,
          m[1] - nz * 0.04,
          Lg,
          ZH + 0.12,
          0.08,
          { yaw: f },
        );
        d.panel("ts_zipper", m[0], ZY, m[1], Lg, ZH, f, {
          rect: [u / ZL, 0, (u + Lg) / ZL, 1],
          off: 0.02,
        });
        u += Lg;
        glows.add(m[0] + nx * 0.8, ZY, m[1] + nz * 0.8, 0xffb040, "m");
      }
      // programme drawing
      const noise = (() => {
        const c = K.canvas(256, 128),
          x = c.getContext("2d"),
          im = x.createImageData(256, 128);
        for (let i = 0; i < im.data.length; i += 4) {
          const v = Math.random() * 255;
          im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
          im.data[i + 3] = 255;
        }
        x.putImageData(im, 0, 0);
        return c;
      })();
      const brands = G.LAYOUT.BRANDS || Object.keys(K.BRAND_ART);
      const clockStr = () => {
        const h = G.time && typeof G.time.hour === "number" ? G.time.hour : 12;
        const hh = Math.floor(h),
          mm = Math.floor((h - hh) * 60);
        return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
      };
      const wrap = (x, text, maxW) => {
        const words = text.split(" "),
          lines = [];
        let l = "";
        for (const w of words) {
          const t2 = l ? l + " " + w : w;
          if (x.measureText(t2).width > maxW && l) {
            lines.push(l);
            l = w;
          } else l = t2;
        }
        if (l) lines.push(l);
        return lines;
      };
      let prog = 0,
        newsIdx = 0;
      const draw = (kind) => {
        const x = cx2,
          W = 1024,
          H = 512,
          BH = 60; // bottom band sits under the crawl strip
        x.save();
        x.setTransform(1, 0, 0, 1, 0, 0);
        if (kind === "static") {
          x.drawImage(
            noise,
            Math.random() * -40,
            Math.random() * -20,
            W + 60,
            H + 40,
          );
          x.restore();
          tex.needsUpdate = true;
          return;
        }
        x.fillStyle = "#05070a";
        x.fillRect(0, 0, W, H);
        if (kind === "ad") {
          const br = brands[Math.floor(Math.random() * brands.length)];
          x.save();
          x.translate(0, 0);
          x.scale(W / 512, (H - BH) / 256);
          K.drawBrand(x, 512, 256, br, Math.floor(Math.random() * 3));
          x.restore();
        } else if (kind === "news") {
          const list = headlines();
          const hl = list[newsIdx++ % Math.max(1, list.length)] || "";
          x.fillStyle = "#0e2a4a";
          x.fillRect(0, 0, W, 86);
          x.fillStyle = "#ffd23f";
          x.font = 'bold 50px "Arial Black", sans-serif';
          x.textAlign = "left";
          x.textBaseline = "middle";
          x.fillText("CROSSROADS NEWS", 28, 45);
          x.textAlign = "right";
          x.fillStyle = "#e8f0ff";
          x.font = "bold 40px monospace";
          x.fillText(clockStr(), W - 28, 45);
          x.fillStyle = "#c81e1e";
          x.fillRect(0, 86, 250, 46);
          x.fillStyle = "#fff";
          x.font = 'bold 32px "Arial Black", sans-serif';
          x.textAlign = "left";
          x.fillText(
            NEWS.player.indexOf(hl) >= 0 ? "BREAKING" : "THE NEON",
            18,
            110,
          );
          x.fillStyle = "#f4f0e0";
          x.font = 'bold 54px "Arial Black", Impact, sans-serif';
          const lines = wrap(x, hl, W - 80).slice(0, 4);
          lines.forEach((ln, i) => x.fillText(ln, 40, 190 + i * 64));
        } else if (kind === "psa") {
          // a Civil Defense slate (the old public-service reels still loop on the Neon's projector)
          x.fillStyle = "#e8e4d8";
          x.fillRect(0, 0, W, H - BH);
          x.strokeStyle = "#1a2a4a";
          x.lineWidth = 16;
          x.beginPath();
          x.arc(W / 2, 170, 115, 0, 7);
          x.stroke();
          x.fillStyle = "#c81e1e";
          x.beginPath();
          x.moveTo(W / 2, 80);
          x.lineTo(W / 2 + 92, 228);
          x.lineTo(W / 2 - 92, 228);
          x.closePath();
          x.fill();
          x.fillStyle = "#ffffff";
          x.font = 'bold 80px "Arial Black", sans-serif';
          x.textAlign = "center";
          x.textBaseline = "middle";
          x.fillText("CD", W / 2, 180);
          x.fillStyle = "#1a2a4a";
          x.font = 'bold 58px "Arial Black", sans-serif';
          x.fillText(
            ["STAY TUNED", "DUCK AND COVER!", "BOIL YOUR WATER"][
              Math.floor(Math.random() * 3)
            ],
            W / 2,
            350,
          );
        } else if (kind === "clock") {
          x.fillStyle = "#0a0a12";
          x.fillRect(0, 0, W, H - BH);
          x.textAlign = "center";
          x.textBaseline = "middle";
          x.fillStyle = "#7aff9a";
          x.font = 'bold 150px "Arial Black", sans-serif';
          x.fillText(clockStr(), W / 2, 170);
          x.fillStyle = "#ffd86a";
          x.font = "bold 44px monospace";
          x.fillText("THE NEON · CROSSROADS OF THE WORLD", W / 2, 310);
          x.fillText("RADS: MODERATE · HOLSTER YOUR IRON", W / 2, 370);
        }
        x.fillStyle = "rgba(0,0,0,0.22)";
        for (let y = 0; y < H; y += 4) x.fillRect(0, y, W, 2);
        x.fillStyle = "#000";
        x.fillRect(0, H - BH, W, BH);
        x.restore();
        tex.needsUpdate = true;
      };
      const drawStrip = (cvs, cx3, text, fg, bg) => {
        cx3.fillStyle = bg;
        cx3.fillRect(0, 0, 2048, 64);
        cx3.font = 'bold 44px "Arial Black", Impact, sans-serif';
        cx3.textBaseline = "middle";
        cx3.fillStyle = fg;
        cx3.textAlign = "left";
        let x = 20;
        const parts = text;
        let i = 0;
        while (x < 2048 && parts.length) {
          const t2 = parts[i++ % parts.length] + "   +++   ";
          cx3.fillText(t2, x, 34);
          x += cx3.measureText(t2).width;
        }
      };
      const drawZip = () => {
        drawStrip(zc, zcx, headlines().slice(0, 6), "#ffb030", "#060402");
        zcx.fillStyle = "rgba(0,0,0,0.55)";
        for (let x = 0; x < 2048; x += 4) zcx.fillRect(x, 0, 1, 64);
        for (let y = 0; y < 64; y += 4) zcx.fillRect(0, y, 2048, 1);
        ztex.needsUpdate = true;
        drawStrip(cc, ccx, headlines().slice(0, 6), "#f4f0e0", "#9a1414");
        ctex.needsUpdate = true;
      };
      draw("news");
      drawZip();
      let seenVer = NEWS.version,
        next = 6,
        staticUntil = 0,
        pending = null;
      const seq = ["news", "ad", "news", "clock", "ad", "psa"];
      const scr = K.mat("ts_xscreen"),
        crm = K.mat("ts_crawl"),
        zm = K.mat("ts_zipper");
      K.animate((dt, t, night) => {
        const Pp = G.player && G.player.pos;
        if (!Pp || Math.abs(Pp.x + 40) > 320 || Math.abs(Pp.z + 262) > 320)
          return;
        ctex.offset.x = (ctex.offset.x + dt * 0.055) % 1;
        ztex.offset.x = (ztex.offset.x + dt * 0.1) % 1;
        const br = 0.62 + 0.38 * night; // (the power level is applied to the square's private clones: neonTownPost)
        scr.color.setScalar(br);
        crm.color.setScalar(br);
        zm.color.setScalar(0.7 + 0.3 * night);
        if (NEWS.version !== seenVer) {
          seenVer = NEWS.version;
          drawZip();
        }
        if (pending && t > staticUntil) {
          draw(pending);
          pending = null;
        }
        if (t > next) {
          next = t + 5 + Math.random() * 3;
          prog = (prog + 1) % seq.length;
          draw("static");
          pending = seq[prog];
          staticUntil = t + 0.25 + Math.random() * 0.2;
        }
      });
      TS.addNews = (text) => pushNews(text, true);
      TS.screenHeadlines = headlines;
    }

    // =========================== MARKET ROWS + STREET LIFE / RUIN PASS (round 2) ===========================
    {
      const at = K.dclInit();
      const anchorNear = (x, z, r) => {
        for (const k in AN) {
          const v = AN[k];
          if (v && Math.abs(v.y || 0) < 1 && Math.hypot(v.x - x, v.z - z) < r)
            return true;
        }
        return false;
      };
      const doorNear = (x, z, r) => {
        for (const k in E) {
          const e = E[k];
          if (e && Math.hypot(e.x - x, e.z - z) < r) return true;
        }
        return false;
      };
      /** blanket-and-trestle stall under a striped parasol: goods, a crate, a price board, a lantern (the parasol throws the light) */
      let msN = 0;
      // canopy canvas lets the daylight through (a lit twin of fabric) — plain fabric read as black cut-outs from below
      K.litTwin("fabric", "ts_canvas", 0xfff0dc, 0.42);
      const miniStall = (x, z, f, seed) => {
        if (!freeAt(x, z, 1.25) || anchorNear(x, z, 2.2) || doorNear(x, z, 4.0))
          return false;
        for (const fi of G.LMA.fires || [])
          if (Math.hypot(fi.pos.x - x, fi.pos.z - z) < 7) return false; // no canvas next to a trash fire
        const W = fr(x, z, f),
          r = K.rng(seed);
        P.table(d, x, 0, z, f, { w: 1.7, d: 0.75 });
        d.box("fabric", x, 0.745, z, 1.76, 0.02, 0.8, {
          yaw: f,
          tint: [0x8a2a22, 0x2a4a6a, 0x6a5a2a, 0x3a5a3a][seed % 4],
          grime: 0.5,
        });
        for (let k = 0; k < 6; k++) {
          const q = W(-0.7 + k * 0.28, (r() - 0.5) * 0.3);
          const kind = r();
          if (kind < 0.4)
            d.cyl(
              r() < 0.5 ? "glass" : "metal",
              q[0],
              0.77,
              q[1],
              0.045,
              0.04,
              0.22,
              6,
              { tint: [0x8a5a1a, 0x3a6a2a, 0xb0261c, 0x3a5a8a][k % 4] },
            );
          else
            d.box(
              ["wood", "paint_yellow", "paint_red", "metal", "fabric"][k % 5],
              q[0],
              0.77,
              q[1],
              0.18 + r() * 0.1,
              0.1 + r() * 0.16,
              0.16,
              {
                yaw: f + r(),
                grime: 0.5,
                tint: [0xffffff, 0xd8c8a0, 0x9a9a8a][k % 3],
              },
            );
        }
        const cr = W(1.3, -0.2);
        P.crate(d, cr[0], 0, cr[1], 0.65, f + r());
        K.colRot(x, z, 1.8, 0.85, 0, 0.8, f, { surface: "wood", tag: "cover" });
        // parasol: pole + 10 alternating canvas gores + a lantern under the rim
        const pp = W(-0.95, -0.55),
          PY2 = 2.55,
          R2 = 1.45,
          cols = [
            [0xc8382a, 0xf0e8d0],
            [0x2a6ab0, 0xf0e8d0],
            [0x3a8a4a, 0xf4d040],
            [0xe0a020, 0x7a2a6a],
          ][seed % 4];
        d.beam("metal", pp[0], 0, pp[1], pp[0], PY2 + 0.4, pp[1], 0.03);
        for (let k = 0; k < 10; k++) {
          const a0 = (k / 10) * PI * 2,
            a1 = ((k + 1) / 10) * PI * 2;
          d.quad(
            "ts_canvas",
            [pp[0], PY2 + 0.45, pp[1]],
            [pp[0] + Math.cos(a1) * R2, PY2 - 0.05, pp[1] + Math.sin(a1) * R2],
            [pp[0] + Math.cos(a0) * R2, PY2 - 0.05, pp[1] + Math.sin(a0) * R2],
            [pp[0], PY2 + 0.45, pp[1]],
            { double: true, tint: cols[k % 2], grime: 0.3 },
          );
        }
        d.beam(
          "black_metal",
          pp[0] + 0.6,
          PY2 + 0.2,
          pp[1],
          pp[0] + 0.6,
          PY2 - 0.25,
          pp[1],
          0.01,
        );
        d.geo("lit_warm", T.sphereLo, {
          x: pp[0] + 0.6,
          y: PY2 - 0.32,
          z: pp[1],
          s: 0.08,
        });
        glows.add(pp[0] + 0.6, PY2 - 0.35, pp[1], 0xffc070, "s");
        spill.add(x, z, 0xffc070, 2.4, { y: GY, i: 0.3 });
        const bp = W(0, 0.45);
        P.signBoard(
          d,
          "tsxp",
          K.atlases.tsx_paint.slots[
            ["p_junk", "p_trinkets", "p_booze", "p_eats2"][seed % 4]
          ].rect,
          bp[0],
          0.95,
          bp[1],
          1.1,
          0.28,
          f,
          { backMat: "wood_dark" },
        );
        msN++;
        A("market_row_" + msN, W(0, -0.75)[0], 0, W(0, -0.75)[1], AY(f));
        return true;
      };
      // the market row down the Seventh Avenue edge of the west plaza, then the corners of the other plazas
      // (not next to the trash-fire barrel at (-50.9, -246.2): canvas and burning barrels don't mix)
      const rowCands = [
        [-50.9, -268.2, -PI / 2],
        [-50.9, -265.4, -PI / 2],
        [-51.0, -241.2, -PI / 2],
        [-51.0, -238.4, -PI / 2],
        [-20.0, -241.5, -1.17],
        [-10.6, -221.2, -PI / 2],
      ];
      rowCands.forEach((c, i) => miniStall(c[0], c[1], c[2], 820 + i));
      // litter drifts along kerbs and in the plaza corners, oil stains + cracks on the carriageways, soot under the fire barrels
      const rr = K.rng(8801);
      let nl = 0,
        ns = 0;
      for (let i = 0; i < 260 && (nl < 70 || ns < 50); i++) {
        const x = -94 + rr() * 108,
          z = -311 + rr() * 98,
          road = L.isRoad(x, z, true);
        if (!road && nl < 70) {
          if (!freeAt(x, z, 0.3)) continue;
          K.dclGround(
            d,
            rr() < 0.5 ? "litter1" : "litter2",
            x,
            z,
            1.1 + rr() * 1.0,
            1.1 + rr() * 1.0,
            rr() * 6.3,
            { y: GY + 0.012 + (nl % 7) * 0.002 },
          );
          nl++;
        } else if (road && ns < 50) {
          K.dclGround(
            d,
            rr() < 0.55 ? "stain" : "crack",
            x,
            z,
            1.6 + rr() * 2.6,
            1.6 + rr() * 2.6,
            rr() * 6.3,
            { y: 0.04 + (ns % 5) * 0.002 },
          );
          ns++;
        }
      }
      // paste-up poster walls at street level on the plaza façades (between the shopfronts) + on the guard booths
      for (const q of [
        [FACE_NW, 5.5],
        [FACE_NW, 28.0],
        [FACE_E, 13.8],
        [FACE_E, 33.0],
      ]) {
        const p = onFace(q[0][0], q[0][1], q[1], 0.07, X0);
        if (doorNear(p.x, p.z, 2.5)) continue;
        d.panel("dcl", p.x, 1.35, p.z, 2.6, 1.3, p.f, {
          rect: at.slots.pasteups.rect,
        });
      }
      for (const q of [
        [-64.03, -258.0, PI / 2],
        [-58.03, -218.0, PI / 2],
        [-11.0, -236.95, 0],
        [-40.0, -282.05, PI],
      ])
        if (!doorNear(q[0], q[1], 2.0))
          d.panel(
            "dcl",
            q[0] + Math.sin(q[2]) * 0.07,
            1.35,
            q[1] + Math.cos(q[2]) * 0.07,
            2.6,
            1.3,
            q[2],
            { rect: at.slots.pasteups.rect },
          );
      // rubble heaps + trash-bag piles in the corners where façades meet (only where nothing else stands)
      for (const q of [
        [-92.0, -284.0],
        [-78.8, -310.6],
        [-65.8, -283.8],
        [-18.6, -283.6],
        [12.6, -283.8],
        [-22.8, -266.6],
        [-62.8, -236.8],
        [-92.4, -238.2],
        [-57.2, -222.0],
        [12.8, -238.6],
        [-7.6, -221.6],
      ]) {
        if (
          !freeAt(q[0], q[1], 1.3) ||
          anchorNear(q[0], q[1], 2.0) ||
          doorNear(q[0], q[1], 3.5)
        )
          continue;
        if ((q[0] * 7 + q[1]) % 2 < 1)
          P.rubblePile(d, q[0], q[1], 1.1, 0.8, {
            seed: Math.round(q[0] * 3 - q[1]),
          });
        else
          for (let k = 0; k < 5; k++)
            d.geo("rubber", T.sphereLo, {
              x: q[0] + (k % 3) * 0.45 - 0.45,
              y: 0.28 + (k > 2 ? 0.3 : 0),
              z: q[1] + (k % 2) * 0.4 - 0.2,
              sx: 0.36,
              sy: 0.3,
              sz: 0.34,
              tint: [0x1e2a1e, 0x1a1a1a, 0x2a2a22][k % 3],
              grime: 0.3,
            });
        K.dclGround(d, "litter1", q[0], q[1], 2.4, 2.4, q[0], {
          y: GY + 0.014,
        });
      }
    }

    // =========================== benches + crowd points (validated against the colliders) ===========================
    const Wd = G.world;
    const clear = (x, z, r) => {
      if (L.isRoad(x, z, true)) return false;
      for (const c of Wd.query(
        x - r - 0.5,
        z - r - 0.5,
        x + r + 0.5,
        z + r + 0.5,
      ))
        if (c.maxY > 0.3 && c.minY < 2.0 && Wd.pointInCollider(c, x, z, r))
          return false;
      return true;
    };
    {
      const cands = [
        [-62.5, -236.0, PI],
        [-2, -236.0, PI],
        [-80, -269.0, 0],
        [-71.6, -307.4, 1.99],
        [-15.2, -244.6, -1.17],
        [-28.0, -299.8, -PI / 2],
        [-28.1, -292.6, -PI / 2],
        [-49.0, -222.8, PI / 2],
        [-11.6, -238.6, -1.17],
        [-70.2, -286.4, 1.99],
        [-55.9, -238.6, 0],
      ];
      let n = 0;
      for (const c of cands) {
        if (n >= 8) break;
        const f = c[2],
          ok = [-0.8, 0, 0.8].every((k) =>
            clear(c[0] + Math.cos(f) * k, c[1] - Math.sin(f) * k, 0.35),
          );
        if (!ok) continue;
        P.bench(d, c[0], c[1], f);
        n++;
        const s = fr(c[0], c[1], f)(0, 0.1);
        A("bench_" + n, s[0], 0, s[1], AY(f));
      }
    }
    {
      const cands = [
        [-56.0, -262.0],
        [-55.8, -244.8],
        [-48.0, -276.0],
        [-44.5, -291.0],
        [-27.0, -304.0],
        [-26.8, -295.0],
        [-24.8, -283.8],
        [-19.0, -262.0],
        [-21.0, -254.5],
        [-14.8, -241.0],
        [-10.5, -218.0],
        [-53.0, -222.0],
        [-60.0, -281.0],
        [-69.4, -296.8],
        [-66.0, -287.0],
        [-73.0, -309.0],
        [-38.0, -281.0],
        [-6.0, -280.4],
        [-86.5, -246.0],
        [-49.0, -250.0],
        [-49.0, -240.0],
        [-31.0, -270.0],
        [-12.0, -270.0],
        [-55.2, -232.0],
        [-80.0, -234.6],
      ];
      let n = 0;
      for (const c of cands) {
        if (n >= 20) break;
        if (!clear(c[0], c[1], 0.45)) continue;
        n++;
        A("crowd_" + n, c[0], 0, c[1], 0);
      }
    }
    // Rad Room plan names (lounge inside B1 west; see 40_times_square_interior.js)
    {
      const R = (n, x, z, yaw, y) => A(n, x, y || 0, z, yaw);
      R("radroom_bar", -7.3, -297.5, PI / 2);
      R("radroom_cards", -12.1, -298.4, PI / 2);
      R("radroom_patron_1", -10.5, -302.0, -PI / 2);
      R("radroom_patron_2", -10.5, -300.2, -PI / 2);
      R("radroom_patron_3", -10.5, -294.8, -PI / 2);
      R("radroom_patron_4", -17.5, -302.8, -PI / 2);
      R("radroom_patron_5", -15.6, -298.4, PI / 2);
      R("radroom_patron_6", -17.5, -288.2, -PI / 2);
      R("jukebox", -6.45, -283.9, 0);
    }

    // =========================== news feed ===========================
    try {
      if (
        G.radio &&
        !G.isStub("radio") &&
        typeof G.radio.addNews === "function" &&
        !G.radio.addNews.__neon
      ) {
        const orig = G.radio.addNews;
        const wrapped = function (text) {
          try {
            pushNews(text, true);
          } catch (e) {
            /* ignore */
          }
          return orig.apply(this, arguments);
        };
        wrapped.__neon = true;
        G.radio.addNews = wrapped;
      }
    } catch (e) {
      /* ignore */
    }
    if (G.events && !K._tsNewsHooked) {
      K._tsNewsHooked = true;
      G.events.on("questCompleted", (q) => {
        const n = q && (q.title || q.name);
        if (n)
          pushNews(
            'Local hero wraps up "' + n + '" — the Neon tips its hat',
            true,
          );
      });
      G.events.on("locationDiscovered", (l) => {
        if (l && l.name && Math.random() < 0.5)
          pushNews("Stranger sighted at " + l.name, true);
      });
      G.events.on("levelUp", (lv) => {
        if (Math.random() < 0.5)
          pushNews(
            "Word on the street: " +
              ((G.HERO && G.HERO.name) || "that stranger") +
              " is getting tougher" +
              (typeof lv === "number" ? " (level " + lv + ")" : ""),
            true,
          );
      });
      G.events.on("newGame", () => {
        NEWS.player.length = 0;
        NEWS.version++;
      });
    }
  };

  /** After 40 finished its sets: setPower(k) dims the square's glows, spills, reflections, neon, boards and screens. */
