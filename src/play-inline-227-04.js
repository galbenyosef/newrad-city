// play-inline-227 04 — math
// Lines 691-3131 of readable/play-inline-227.pretty.js (statement-aligned).
  function build() {
    const C = LI.cell(KEY);
    C.site = "un_hq";
    const b = C.b;
    const T = art();
    b.ambient(0x2c2a2a, 1);
    // ---------- baked lights ----------
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      b.light(Math.cos(a) * 11, 17, -3 + Math.sin(a) * 11, 0xffe4b8, 20, 0.55);
    }
    b.light(0, 15, -3, 0xffe8c8, 24, 0.5);
    b.light(0, 7, 12.5, 0xffd890, 14, 1.2);
    b.light(-6, 13, 14, 0xffd070, 11, 0.8);
    b.light(6, 13, 14, 0xffd070, 11, 0.8);
    b.light(0, 3, 9, 0xffe0b0, 9, 0.7);
    for (const s of [-1, 1]) {
      b.light(s * 10.5, 8, 15.5, 0xffd8a0, 10, 0.9);
      b.light(s * 18, 4, -4, 0xffe0b8, 12, 0.5);
      b.light(s * 8, 5, -12, 0xffe0b8, 12, 0.45);
    }
    b.light(-9, 4, 11, 0xd8ecff, 13, 0.9);
    b.light(9, 4, 11, 0xd8ecff, 13, 0.9); // Continuity floodlights
    for (const s of [-1, 1])
      for (const r of [17, 23]) {
        const p = P(s * AM * 0.72, r);
        b.light(p[0], 9.5, p[1], 0xffcf90, 9, 0.45);
      }
    // lobby
    for (const [x, z] of [
      [-18, -38],
      [0, -38],
      [18, -38],
      [-18, -26],
      [0, -26],
      [18, -26],
      [-18, -14],
      [18, -12],
    ])
      b.light(x, LCEIL - 1.5, z, 0xffe6c0, 14, 0.7);
    b.light(0, 8, -43, 0xc8d8c0, 16, 0.8);
    b.light(28, 8, -37, 0x6a9aff, 10, 0.9);
    b.light(0, 5.6, -30, 0xd8ecff, 10, 0.7);
    // backstage + SC + lounge + strongroom
    for (let x = -26; x <= 46; x += 9) b.light(x, 3.6, 19.2, 0xe0f0ff, 7, 0.75);
    b.light(-28.4, 11, 12, 0xffd8a0, 9, 0.5);
    b.light(-28.4, 9.8, 5.2, 0xffd8a0, 7, 0.6);
    for (const [x, z] of [
      [36, -4],
      [44, -4],
      [36, 11],
      [44, 11],
    ])
      b.light(x, 8, z, 0xffe0b8, 13, 0.7);
    b.light(41.5, 2.8, 3.5, 0x60e0ff, 8, 0.9);
    b.light(40, 3.5, 3.5, 0xffe0b8, 14, 0.8);
    b.light(34, 3, 12.5, 0xffe0b0, 7, 0.6);
    b.light(48, 5, 3.5, 0xffc080, 10, 0.6);
    for (const [x, z] of [
      [35, -29],
      [45, -29],
      [35, -19],
      [45, -19],
    ])
      b.light(x, 6.6, z, 0xffcf90, 12, 1.0);
    b.light(57, 3.8, 11, 0xe8f0ff, 10, 0.9);
    b.light(57, 3.8, 20, 0xe8f0ff, 10, 0.9);
    b.light(52, 3.6, 15, 0xe8f0ff, 8, 0.6);
    b.light(60, 1.2, 10, 0x80ff60, 7, 0.8);

    // ==============================================================
    // GENERAL ASSEMBLY HALL
    // ==============================================================
    // floor of the well + fan
    const hallPoly = [];
    for (let i = 0; i <= 28; i++) hallPoly.push(P(-AM + (i / 28) * 2 * AM, RW));
    hallPoly.push(P(AM, 13), [12.2, 17.2], [-12.2, 17.2], P(-AM, 13));
    {
      const sh = new THREE.Shape();
      hallPoly.forEach((p, i) =>
        i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1]),
      );
      const g = new THREE.ShapeGeometry(sh);
      g.rotateX(-Math.PI / 2);
      g.translate(0, 0.01, 0);
      b.add("terrazzo", g, { noAO: true });
    }
    // tiers (faceted rings) + back aisle
    const facet = (ra, rbb, a0, a1) => {
      const am = (a0 + a1) / 2,
        rm = (ra + rbb) / 2,
        L = 2 * rbb * Math.sin((a1 - a0) / 2) + 0.06;
      return { am, rm, L, c: P(am, rm) };
    };
    const dA = (2 * AM) / NF;
    for (let i = 0; i <= NT; i++) {
      const ra = R0 + i * DR,
        rbb = i < NT ? ra + DR : RW + 0.1,
        top = Math.min(TOPY, (i + 1) * RISE);
      for (let j = 0; j < NF; j++) {
        const f = facet(ra, rbb, -AM + j * dA, -AM + (j + 1) * dA);
        const aisle = j === 0 || j === NF - 1 || j === (NF - 1) / 2;
        b.obox(
          aisle ? "carpet_red" : "carpet_blue",
          f.c[0],
          top / 2,
          f.c[1],
          f.L,
          top,
          rbb - ra,
          -f.am,
          { fy: 0, aoH: 0.5 },
        );
        C.colRot(f.c[0], f.c[1], f.L, rbb - ra, 0, top, -f.am, {
          surface: "carpet",
        });
        // tread nosing
        const n = P(f.am, ra + 0.03);
        b.obox(
          "brass",
          n[0],
          top + 0.005,
          n[1],
          2 * ra * Math.sin(dA / 2),
          0.03,
          0.06,
          -f.am,
          { noAO: true },
        );
        if (i >= NT || aisle) continue;
        // curved desk run + chairs
        const rd = ra + 0.42,
          dl = 2 * rd * Math.sin(dA / 2) - 0.18,
          dp = P(f.am, rd),
          pp = P(f.am, ra + 0.2);
        b.obox("wood_light", dp[0], top + 0.735, dp[1], dl, 0.05, 0.52, -f.am, {
          fy: top,
        });
        b.obox("wood_light", pp[0], top + 0.37, pp[1], dl, 0.72, 0.05, -f.am, {
          fy: top,
        });
        C.colRot(dp[0], dp[1], dl, 0.56, top, top + 0.76, -f.am, {
          walkable: false,
          surface: "wood",
        });
        const r = LI.rng(i * 31 + j);
        const nCh = Math.max(1, Math.floor(dl / 0.95));
        for (let k = 0; k < nCh; k++) {
          const a = f.am + ((k + 0.5) / nCh - 0.5) * (dl / rd) * 0.95,
            q = P(a, ra + 1.05),
            ry = Math.PI - a;
          if (r() < 0.1) continue;
          const tl = r() < 0.08;
          const sp = LI.rot(0, 0, q[0], q[1], ry),
            bk = LI.rot(0, 0.24, q[0], q[1], ry);
          if (tl) {
            b.obox(
              "fabric_blue",
              q[0],
              top + 0.3,
              q[1],
              0.5,
              0.08,
              0.5,
              ry + r(),
              { rx: 1.2, fy: top },
            );
            continue;
          }
          b.obox("fabric_blue", sp[0], top + 0.46, sp[1], 0.52, 0.1, 0.48, ry, {
            fy: top,
          });
          b.obox(
            "fabric_blue",
            bk[0],
            top + 0.78,
            bk[1],
            0.52,
            0.56,
            0.08,
            ry + (r() - 0.5) * 0.15,
            { fy: top, rx: -0.12 },
          );
          b.obox("metal_dark", sp[0], top + 0.2, sp[1], 0.08, 0.4, 0.08, ry, {
            fy: top,
          });
          if (r() < 0.35) {
            const pl = P(
              f.am + ((k + 0.5) / nCh - 0.5) * (dl / rd) * 0.95,
              ra + 0.24,
            );
            b.quad(T.placard, pl[0], top + 0.8, pl[1], 0.36, 0.09, -a, {
              uvRect: T.placardUV((i * 13 + j * 5 + k) % 96),
              rx: -0.25,
              noAO: true,
            });
          }
          if (r() < 0.05)
            C.prop("skeleton", q[0], top, q[1], ry, {
              pose: "seated",
              collide: false,
            });
          if (r() < 0.2)
            F.papers(
              C,
              dp[0],
              top + 0.765,
              dp[1],
              0.3,
              2,
              i * 100 + j * 10 + k,
            );
        }
      }
    }
    // stage: two green-marble tiers, rostrum, presidential desk, steps
    b.box("marble_green", -9, 0, 12.6, 9, 0.9, 17.05, { fy: 0 });
    C.col(-9, 0, 12.6, 9, 0.9, 17.05);
    b.box("carpet_red", -8.8, 0.9, 12.8, 8.8, 0.92, 17, { noAO: true });
    b.box("marble_green", -6.5, 0.9, 14.8, 6.5, 1.8, 17.05, { fy: 0.9 });
    C.col(-6.5, 0.9, 14.8, 6.5, 1.8, 17.05);
    b.box("brass", -9.05, 0.86, 12.55, 9.05, 0.92, 12.62, { noAO: true });
    for (const s of [-1, 1]) {
      A.stairs(C, "marble_green", s * 8.3, 11.3, "s", 1.4, 0, 0.9, {
        nose: "brass",
      });
      A.stairs(C, "marble_green", s * 5.75, 13.6, "s", 1.4, 0.9, 1.8, {
        nose: "brass",
      });
    }
    // presidential desk (upper tier) + three high-backed chairs
    b.box("marble_green", -5, 1.8, 15.2, 5, 2.62, 15.55, { fy: 1.8 });
    b.box("wood_light", -5.1, 2.62, 15.1, 5.1, 2.68, 16.0, { fy: 1.8 });
    C.col(-5.1, 1.8, 15.1, 5.1, 2.68, 16.0, { walkable: false });
    for (const x of [-2.2, 0, 2.2]) {
      b.box("leather", x - 0.32, 1.8, 16.2, x + 0.32, 2.3, 16.7, { fy: 1.8 });
      b.box("leather", x - 0.32, 2.3, 16.62, x + 0.32, 3.4, 16.8, { fy: 1.8 });
    }
    // speaker's rostrum
    b.box("marble_green", -0.75, 0.9, 12.9, 0.75, 2.0, 13.55, { fy: 0.9 });
    b.obox("wood_light", 0, 2.08, 13.2, 1.6, 0.06, 0.8, 0, { rx: -0.25 });
    b.quad(T.emblem, 0, 1.5, 12.88, 0.62, 0.62, Math.PI, { noAO: true });
    for (const s of [-1, 1])
      b.rod("chrome", [s * 0.25, 2.05, 13.0], [s * 0.1, 2.5, 12.8], 0.012);
    C.col(-0.75, 0.9, 12.9, 0.75, 2.1, 13.55, { walkable: false });
    // ---- emblem wall ----
    b.box("marble_green", -12.8, 0, 17, 12.8, HH, 17.4, { fy: 0 });
    b.box("gold_leaf", -7, 0.9, 16.88, 7, 18, 17.0, { noAO: true });
    for (let x = -6.65; x <= 6.66; x += 0.7)
      b.box("gold_leaf", x - 0.06, 0.9, 16.8, x + 0.06, 18, 16.9, {
        noAO: true,
      });
    b.box("gold_leaf", -7.2, 17.8, 16.7, 7.2, 18.25, 17.0);
    b.torus("gold", 0, 11.6, 16.74, 3.75, 0.12, { rx: 0, ts: 40 });
    b.quad(T.emblem, 0, 11.6, 16.72, 7.2, 7.2, Math.PI, { noAO: true });
    C.col(-12.8, 0, 17, -11.4, HH, 17.4, { walkable: false });
    C.col(-9.8, 0, 17, 9.8, HH, 17.4, { walkable: false });
    C.col(11.4, 0, 17, 12.8, HH, 17.4, { walkable: false });
    for (const s of [-1, 1]) {
      C.col(s * 11.4, 2.6, 17, s * 9.8, HH, 17.4, { walkable: false });
    }
    // the two door holes through the emblem wall: carve visually with dark jambs + lintel signs
    for (const s of [-1, 1]) {
      b.box(
        "black",
        s * 9.8 - (s > 0 ? 0 : 1.6),
        0,
        16.98,
        s * 9.8 + (s > 0 ? 1.6 : 0),
        2.6,
        17.42,
        { noAO: true, noBake: true },
      );
      b.box("brass", s * 10.6 - 0.95, 2.6, 16.85, s * 10.6 + 0.95, 2.75, 17.0);
      A.sconce(C, s * 10.6, 3.1, 16.85, Math.PI, { light: true });
    }
    // ---- walls ----
    const wallGaps = [
      { a: 3.3, b: 5.7, sill: 8.6, top: 10.4 },
      { a: 6.3, b: 8.7, sill: 8.6, top: 10.4 },
      { a: 9.3, b: 11.7, sill: 8.6, top: 10.4 },
      { a: 12.3, b: 14.7, sill: 8.6, top: 10.4 },
    ];
    A.wallLine(
      C,
      "plaster_warm",
      P(AM, 13),
      P(AM, RW + 0.6),
      0,
      HH,
      0.6,
      wallGaps,
      { off: 0.3 },
    );
    A.wallLine(
      C,
      "plaster_warm",
      P(-AM, 13),
      P(-AM, RW + 0.6),
      0,
      HH,
      0.6,
      wallGaps,
      { off: -0.3 },
    );
    for (const s of [-1, 1]) {
      b.box("plaster_warm", s * 12.2, 0, 7.55, s * 12.8, HH, 17.4, { fy: 0 });
      C.col(
        Math.min(s * 12.2, s * 12.8),
        0,
        7.55,
        Math.max(s * 12.2, s * 12.8),
        HH,
        17.4,
        { walkable: false },
      );
      // slatted wood cladding, the gallery band and gilded trim on the straight front walls
      const xi = s * 12.2 - s * 0.01;
      for (let z = 7.9; z < 17; z += 0.55)
        b.box(
          "wood_light",
          xi - (s > 0 ? 0.1 : 0),
          0,
          z - 0.05,
          xi + (s > 0 ? 0 : 0.1),
          7.8,
          z + 0.05,
        );
      b.box(
        "wood_light",
        xi - (s > 0 ? 0.04 : 0),
        0,
        7.6,
        xi + (s > 0 ? 0 : 0.04),
        7.8,
        17,
      );
      b.box(
        "gold",
        xi - (s > 0 ? 0.08 : 0),
        7.78,
        7.6,
        xi + (s > 0 ? 0 : 0.08),
        7.92,
        17,
      );
      b.box(
        "wood_dark",
        xi - (s > 0 ? 0.12 : 0),
        8.3,
        7.6,
        xi + (s > 0 ? 0 : 0.12),
        10.7,
        17,
      );
      for (const z of [9.6, 13.2])
        b.quad(
          "glass_dark",
          xi - s * 0.13,
          9.5,
          z,
          2.8,
          1.8,
          (-s * Math.PI) / 2,
        );
      b.box(
        "gold",
        xi - (s > 0 ? 0.08 : 0),
        18.5,
        7.6,
        xi + (s > 0 ? 0 : 0.08),
        18.75,
        17,
      );
    }
    // back arc wall: 29 facets, doors at 0° and ±24°
    const NW = 29,
      dW = (2 * AM) / NW;
    for (let j = 0; j < NW; j++) {
      const a0 = -AM + j * dW,
        a1 = a0 + dW,
        am = (a0 + a1) / 2;
      const door = j === 14 || j === 9 || j === 19;
      for (const [r0, r1, key] of [
        [RW, RW + 0.3, "wood_light"],
        [RW + 0.3, RW + 0.6, "marble"],
      ]) {
        const rm = (r0 + r1) / 2,
          L = 2 * r1 * Math.sin(dW / 2) + 0.05,
          c = P(am, rm);
        if (door) {
          b.obox(
            key,
            c[0],
            (LOBY + 2.9 + HH) / 2,
            c[1],
            L,
            HH - LOBY - 2.9,
            r1 - r0,
            -am,
          );
        } else
          b.obox(key, c[0], HH / 2, c[1], L, HH, r1 - r0, -am, { fy: LOBY });
      }
      const c = P(am, RW + 0.3),
        L = 2 * (RW + 0.6) * Math.sin(dW / 2) + 0.05;
      if (door) {
        C.colRot(c[0], c[1], L, 0.6, LOBY + 2.9, HH, -am, { walkable: false });
        const s0 = P(am, RW - 0.05);
        b.obox("brass", s0[0], LOBY + 2.95, s0[1], L - 0.2, 0.12, 0.1, -am);
        for (const e of [-1, 1]) {
          const q = P(am + e * (dW / 2 - 0.02), RW + 0.3);
          b.obox("brass", q[0], LOBY + 1.45, q[1], 0.1, 2.9, 0.66, -am);
        }
      } else C.colRot(c[0], c[1], L, 0.6, 0, HH, -am, { walkable: false });
    }
    // wood dado around the hall (on the radial walls, inner face)
    for (const s of [-1, 1]) {
      const p = P(s * AM, 13),
        q = P(s * AM, RW);
      const u = [(q[0] - p[0]) / 16, (q[1] - p[1]) / 16],
        nIn = [-s * Math.cos(AM) * 0.31, -Math.sin(AM) * 0.31];
      for (let k = 0; k < 16; k++) {
        const x = p[0] + u[0] * (k + 0.5) + nIn[0],
          z = p[1] + u[1] * (k + 0.5) + nIn[1];
        const r = 13 + k + 0.5,
          ty = Math.min(
            TOPY,
            Math.max(0, Math.floor((r - R0) / DR) + 1) * RISE,
          );
        const wry = Math.atan2(-u[1], u[0]);
        b.obox("wood_light", x, ty + 1.3, z, 1.02, 2.6, 0.04, wry, { fy: ty });
        // vertical slats up to the booth band
        for (const o of [-0.25, 0.25])
          b.obox(
            "wood_light",
            x + u[0] * o + nIn[0] * 0.25,
            (ty + 2.6 + 7.8) / 2,
            z + u[1] * o + nIn[1] * 0.25,
            0.08,
            7.8 - ty - 2.6,
            0.1,
            wry,
            { fy: ty },
          );
      }
      const mid = [(p[0] + q[0]) / 2 + nIn[0], (p[1] + q[1]) / 2 + nIn[1]],
        wry = Math.atan2(-u[1], u[0]);
      b.obox("gold", mid[0], 7.85, mid[1], 16, 0.14, 0.08, wry);
      b.obox("wood_dark", mid[0], 8.45, mid[1], 16, 0.3, 0.12, wry);
      b.obox("wood_dark", mid[0], 10.55, mid[1], 16, 0.3, 0.12, wry);
      b.obox("gold", mid[0], 18.6, mid[1], 16, 0.25, 0.1, wry);
    }
    // murals high on the side walls
    for (const s of [-1, 1]) {
      const m = P(s * AM, 21),
        nIn = [-s * Math.cos(AM), -Math.sin(AM)];
      const ry = Math.atan2(nIn[0], nIn[1]);
      b.quad(
        s < 0 ? T.muralW : T.muralE,
        m[0] + nIn[0] * 0.33,
        14.2,
        m[1] + nIn[1] * 0.33,
        13,
        6.4,
        ry,
      );
      // Continuity banners hanging between the booth windows and the murals
      for (const r of [15.2, 26.8]) {
        const q = P(s * AM, r);
        b.quad(
          T.banner,
          q[0] + nIn[0] * 0.36,
          8.2,
          q[1] + nIn[1] * 0.36,
          2.2,
          6.6,
          ry,
          { noAO: true },
        );
      }
    }
    // ceiling with the dome
    {
      const sh = new THREE.Shape();
      hallPoly.forEach((p, i) =>
        i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1]),
      );
      const h = new THREE.Path();
      h.absarc(0, -3, 14, 0, TAU, true);
      sh.holes.push(h);
      // blast breach in the flat ceiling (north-east of the dome) — a real ragged hole
      const BRX = 13.5,
        BRZ = -16.5,
        brR = LI.rng(66),
        brPts = [];
      for (let i = 0; i < 14; i++) {
        const a = (-i / 14) * TAU,
          rr = 2.2 + brR() * 1.4;
        brPts.push([BRX + Math.cos(a) * rr, BRZ + Math.sin(a) * rr * 0.8]);
      }
      const h2 = new THREE.Path();
      brPts.forEach((p, i) =>
        i ? h2.lineTo(p[0], p[1]) : h2.moveTo(p[0], p[1]),
      );
      h2.closePath();
      sh.holes.push(h2);
      C.breach = { x: BRX, z: BRZ, pts: brPts };
      const g = new THREE.ShapeGeometry(sh, 32);
      g.rotateX(Math.PI / 2);
      g.translate(0, HH, 0);
      b.add("plaster_warm", g, { noAO: true });
      const dome = new THREE.SphereGeometry(
        24,
        48,
        10,
        0,
        TAU,
        0,
        Math.asin(14 / 24),
      );
      b.add("plaster_warm", dome, {
        m: LI.M4(0, HH + 4.5 - 24, -3),
        flip: true,
        noAO: true,
      });
      // light rings + gilded ribs of the dome
      for (const [rr, lamp] of [
        [13.8, "lamp"],
        [10.5, "lamp"],
        [7, "lamp"],
        [3.2, "lamp"],
      ]) {
        const y = HH - 0.5 + Math.sqrt(24 * 24 - rr * rr) - 24 + 4.5 - 0.15;
        b.torus(lamp, 0, Math.max(HH - 0.1, y), -3, rr, 0.07, {
          ts: 64,
          rs: 4,
        });
      }
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * TAU,
          pts = [];
        for (let k = 0; k <= 3; k++) {
          const rr = 14 - k * 3.6;
          pts.push([
            Math.cos(a) * rr,
            HH - 0.5 + Math.sqrt(24 * 24 - rr * rr) - 24 + 4.5 - 0.2,
            -3 + Math.sin(a) * rr,
          ]);
        }
        for (let k = 0; k < 3; k++)
          b.beam("gold", pts[k], pts[k + 1], 0.12, 0.08, { noAO: true });
      }
      // collapsed sector: fallen ribs, rubble on the tiers, a dark breach patch
      // the cavity above the breach: slab edges, exposed girders, a grey-green sky patch through the roof
      const BR = C.breach;
      b.box(
        "concrete_dark",
        BR.x - 4.2,
        HH + 0.3,
        BR.z - 3.6,
        BR.x + 4.2,
        HH + 0.5,
        BR.z - 3.4,
      );
      b.box(
        "concrete_dark",
        BR.x - 4.2,
        HH + 0.3,
        BR.z + 3.4,
        BR.x + 4.2,
        HH + 0.5,
        BR.z + 3.6,
      );
      b.box(
        "concrete_dark",
        BR.x - 4.4,
        HH,
        BR.z - 3.6,
        BR.x - 4.2,
        HH + 4.2,
        BR.z + 3.6,
      );
      b.box(
        "concrete_dark",
        BR.x + 4.2,
        HH,
        BR.z - 3.6,
        BR.x + 4.4,
        HH + 4.2,
        BR.z + 3.6,
      );
      b.box(
        "concrete_dark",
        BR.x - 4.2,
        HH,
        BR.z - 3.6,
        BR.x + 4.2,
        HH + 4.2,
        BR.z - 3.4,
      );
      b.box(
        "concrete_dark",
        BR.x - 4.2,
        HH,
        BR.z + 3.4,
        BR.x + 4.2,
        HH + 4.2,
        BR.z + 3.6,
      );
      for (const k of [-2.4, 0, 2.4])
        b.box(
          "rust",
          BR.x + k - 0.12,
          HH + 1.2,
          BR.z - 3.5,
          BR.x + k + 0.12,
          HH + 1.6,
          BR.z + 3.5,
        );
      b.beam(
        "rust",
        [BR.x - 3, HH + 2.6, BR.z - 2],
        [BR.x + 2.5, HH - 1.8, BR.z + 1.2],
        0.18,
        0.3,
      );
      b.beam(
        "rust",
        [BR.x + 1, HH + 2.2, BR.z - 3],
        [BR.x - 0.6, HH - 2.5, BR.z - 0.4],
        0.12,
        0.2,
      );
      b.box(
        "lamp_cool",
        BR.x - 4.2,
        HH + 4.1,
        BR.z - 3.4,
        BR.x + 4.2,
        HH + 4.2,
        BR.z + 3.4,
        { noAO: true },
      );
      for (let i = 0; i < BR.pts.length; i++) {
        const p = BR.pts[i],
          q = BR.pts[(i + 1) % BR.pts.length];
        b.beam(
          "plaster_warm",
          [p[0], HH + 0.15, p[1]],
          [q[0], HH + 0.15, q[1]],
          0.25,
          0.3,
          { noAO: true },
        );
        if (i % 3 === 0)
          b.rod(
            "rust",
            [p[0], HH + 0.1, p[1]],
            [
              p[0] + (p[0] - BR.x) * 0.1,
              HH - 0.9 - (i % 2),
              p[1] + (p[1] - BR.z) * 0.1,
            ],
            0.02,
          );
      }
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 3.4, HH - 2, 16, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xb8c8a0,
          transparent: true,
          opacity: 0.045,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      shaft.position.set(BR.x, HH / 2 + 1, BR.z);
      C.root.add(shaft);
      b.light(BR.x, HH - 2, BR.z, 0xc8d8b0, 16, 0.9);
      const rbR = Math.hypot(BR.x - CX, BR.z - CZ),
        rbY = Math.min(TOPY, (Math.floor((rbR - R0) / DR) + 1) * RISE);
      F.rubble(C, BR.x, rbY, BR.z, 2.6, 71, {
        h: 0.55,
        col: true,
        n: 16,
        chunk: "plaster_warm",
      });
      b.beam(
        "rust",
        [BR.x - 1.5, rbY + 0.4, BR.z + 0.5],
        [BR.x + 2.5, rbY + 2.2, BR.z - 1.5],
        0.16,
        0.24,
      );
      b.obox(
        "plaster_warm",
        BR.x + 1.2,
        rbY + 0.9,
        BR.z + 1.4,
        2.6,
        0.25,
        1.8,
        0.4,
        { rx: 0.5, rz: 0.3 },
      );
    }
    // Continuity floodlights on tripods by the stage + crates + holo mast
    for (const s of [-1, 1]) {
      const x = s * 9.2,
        z = 10.6;
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * TAU;
        b.rod(
          "continuity_black",
          [x + Math.cos(a) * 0.6, 0, z + Math.sin(a) * 0.6],
          [x, 2.2, z],
          0.03,
        );
      }
      b.box(
        "continuity_black",
        x - 0.35,
        2.2,
        z - 0.25,
        x + 0.35,
        2.75,
        z + 0.25,
      );
      b.quad("lamp_cool", x, 2.48, z - 0.26 * 1, 0.5, 0.4, Math.PI - s * 0.5);
      C.col(x - 0.4, 0, z - 0.4, x + 0.4, 2.7, z + 0.4, { walkable: false });
    }
    F.crates(C, -10.8, 0, 14.5, 3, 0.3, { key: "continuity_black" });
    F.crates(C, 10.6, 0, 9.4, 2, -0.4, { key: "continuity_black" });
    // a skeleton slumped at the rostrum (the last speaker) + a dropped tape reel
    C.prop("skeleton", 0.3, 0.92, 13.95, 0.4, {
      pose: "sitting",
      collide: false,
    });

    // ==============================================================
    // INTERPRETER BOOTHS (west, reached from backstage) + press booths (east, sealed)
    // ==============================================================
    // frame u: from the outer (r = 29) end of the west wall toward the stage; v: outward (away from the hall)
    const uo = P(-AM, RW),
      ui = P(-AM, 13);
    const Fb = A.frame(uo[0], uo[1], ui[0] - uo[0], ui[1] - uo[1]);
    const BY = 7.8,
      BC = 10.9;
    Fb.box(C, "wood_dark", -1.2, 15.6, 0.3, 4.65, BY - 0.3, BY);
    Fb.col(C, -1.2, 15.6, 0.3, 4.65, BY - 0.3, BY, { surface: "wood" });
    Fb.box(C, "plaster", -1.2, 15.6, 0.3, 4.65, BC, BC + 0.2);
    Fb.box(C, "plaster", 1.5, 15.6, 4.35, 4.65, BY, BC);
    Fb.col(C, 1.5, 15.6, 4.35, 4.65, BY, BC, { walkable: false });
    Fb.box(C, "plaster", 15.3, 15.6, 0.3, 4.65, BY, BC);
    Fb.col(C, 15.3, 15.6, 0.3, 4.65, BY, BC, { walkable: false });
    Fb.box(C, "plaster", -1.5, -1.2, 0.3, 2.3, BY, BC);
    Fb.col(C, -1.5, -1.2, 0.3, 2.3, BY, BC, { walkable: false });
    const booths = [1, 4, 7, 10];
    for (const u of [1, 4, 7, 10, 13]) {
      Fb.box(C, "wood_dark", u - 0.06, u + 0.06, 0.3, 2.3, BY, BC);
      Fb.col(C, u - 0.06, u + 0.06, 0.3, 2.3, BY, BC, { walkable: false });
    }
    // booth back wall with doors
    let cu = -1.2;
    for (const u0 of booths) {
      const d0 = u0 + 1.9,
        d1 = u0 + 2.8;
      if (d0 > cu) {
        Fb.box(C, "wood_dark", cu, d0, 2.24, 2.36, BY, BC);
        Fb.col(C, cu, d0, 2.24, 2.36, BY, BC, { walkable: false });
      }
      Fb.box(C, "wood_dark", d0, d1, 2.24, 2.36, BY + 2.2, BC);
      cu = d1;
    }
    Fb.box(C, "wood_dark", cu, 15.3, 2.24, 2.36, BY, BC);
    Fb.col(C, cu, 15.3, 2.24, 2.36, BY, BC, { walkable: false });
    // booth fittings: console, mics, headsets, chairs, glass, labels
    const LANGS = ["ENGLISH", "ESPAÑOL", "РУССКИЙ", "FRANÇAIS"]; // Booth 4: Nicole Mead's (main story)
    booths.forEach((u0, k) => {
      const mid = u0 + 1.5;
      Fb.box(C, "wood_light", u0 + 0.2, u0 + 2.8, 0.35, 0.95, BY, BY + 0.78);
      const c1 = Fb.p(mid - 0.6, 0.62),
        c2 = Fb.p(mid + 0.6, 0.62);
      F.monitor(C, c1[0], BY + 0.78, c1[1], Fb.ry - Math.PI / 2, {
        dead: k === 2,
      });
      b.rod(
        "chrome",
        [c2[0], BY + 0.78, c2[1]],
        [c2[0], BY + 1.1, c2[1]],
        0.01,
      );
      b.sphere("rubber", c2[0], BY + 1.12, c2[1], 0.05);
      const ch = Fb.p(mid, 1.5);
      F.chair(C, ch[0], BY, ch[1], Fb.ry + Math.PI / 2, {
        key: "metal_dark",
        seat: "fabric_blue",
        toppled: k === 1,
      });
      const gw = Fb.p(mid, 0.02);
      b.quad("glass", gw[0], 9.5, gw[1], 2.4, 1.8, Fb.ry - Math.PI / 2, {
        double: true,
      });
      const sg = Fb.p(mid, 2.2);
      b.quad(
        LI.texMat(
          "un_lang" + k,
          LI.signTex(
            "un_lang" + k,
            ["BOOTH " + (k + 1), LANGS[k]],
            { bg: "#1c2a3a", fg: "#e8e0c8", size: 40 },
            256,
            96,
          ),
        ),
        sg[0],
        BY + 2.5,
        sg[1],
        0.8,
        0.3,
        Fb.ry + Math.PI / 2,
      );
      b.light(Fb.p(mid, 1.2)[0], BC - 0.4, Fb.p(mid, 1.2)[1], 0xffd8a0, 4, 0.5);
      const lp = Fb.p(mid, 1.2);
      b.sphere("lamp", lp[0], BC - 0.15, lp[1], 0.12);
    });
    b.light(Fb.p(6, 3.3)[0], BC - 0.5, Fb.p(6, 3.3)[1], 0xffe0b0, 9, 0.6);
    b.light(Fb.p(12, 3.3)[0], BC - 0.5, Fb.p(12, 3.3)[1], 0xffe0b0, 9, 0.6);
    for (const u of [2, 8, 14]) {
      const p = Fb.p(u, 3.3);
      A.tube(C, p[0], BC - 0.1, p[1], Fb.ry, 1.3, {
        dead: u === 8,
        light: false,
      });
    }
    // BOOTH FOUR (main story, mq08): Nicole Mead's booth, French ⇄ English. Her name card on the console with a pencilled
    // twelve-ray sun (she signed everything with it), her cardigan still over the chair back, a cold cup, a ring of dried
    // flowers in a jar. Anchors: booth_four (standing in the booth, facing the glass), booth_four_console (the console top).
    {
      const u0 = 10,
        mid = u0 + 1.5;
      const card = LI.texMat(
        "un_b4_card",
        LI.canvasTex("un_b4_card", 256, 128, (x, W, H) => {
          x.fillStyle = "#efe8d4";
          x.fillRect(0, 0, W, H);
          x.strokeStyle = "#8a7a5a";
          x.lineWidth = 3;
          x.strokeRect(4, 4, W - 8, H - 8);
          x.fillStyle = "#1c2a3a";
          x.font = "bold 30px Georgia, serif";
          x.textAlign = "center";
          x.fillText("N. MEAD", W * 0.42, H * 0.42);
          x.font = "18px Georgia, serif";
          x.fillText("FRANÇAIS ⇄ ENGLISH", W * 0.42, H * 0.72);
          // the pencilled sun in the corner
          x.save();
          x.translate(W * 0.86, H * 0.5);
          x.strokeStyle = "rgba(40,40,44,0.85)";
          x.lineWidth = 2;
          x.beginPath();
          x.arc(0, 0, 11, 0, 7);
          x.stroke();
          for (let i = 0; i < 12; i++) {
            const a = (i * Math.PI) / 6;
            x.beginPath();
            x.moveTo(Math.cos(a) * 15, Math.sin(a) * 15);
            x.lineTo(Math.cos(a) * 26, Math.sin(a) * 26);
            x.stroke();
          }
          x.restore();
        }),
      );
      const cp = Fb.p(mid + 0.55, 0.6);
      b.flat(
        card,
        cp[0],
        BY + 0.786,
        cp[1],
        0.3,
        0.15,
        Fb.ry + Math.PI / 2,
        {},
      );
      const cg = Fb.p(mid + 1.0, 1.72);
      b.obox("fabric", cg[0], BY + 0.78, cg[1], 0.5, 0.42, 0.07, Fb.ry, {
        c: 0x4a6a4a,
      }); // the cardigan over the chair back
      const cu = Fb.p(mid - 0.9, 0.55);
      b.cyl("bone", cu[0], BY + 0.78, cu[1], 0.045, 0.04, 0.1, 10);
      const jr = Fb.p(u0 + 0.45, 0.5);
      b.cyl("glass", jr[0], BY + 0.78, jr[1], 0.06, 0.05, 0.16, 10);
      for (let k = 0; k < 4; k++)
        b.cyl(
          "wood_dark",
          jr[0] + (k - 1.5) * 0.015,
          BY + 0.9,
          jr[1],
          0.006,
          0.006,
          0.22,
          4,
        );
      const ba = Fb.p(mid, 1.25);
      C.anchor("booth_four", ba[0], BY, ba[1], Fb.ry - Math.PI / 2);
      const bd = Fb.p(mid - 0.3, 0.6);
      C.anchor(
        "booth_four_console",
        bd[0],
        BY + 0.8,
        bd[1],
        Fb.ry - Math.PI / 2,
      );
    }
    const skb = Fb.p(8.5, 1.1);
    C.prop("skeleton", skb[0], BY, skb[1], Fb.ry + Math.PI / 2, {
      pose: "sitting",
      collide: false,
    });
    C.anchor("booth_note", Fb.p(8.2, 0.6)[0], BY + 0.8, Fb.p(8.2, 0.6)[1]);
    const fl = Fb.p(14.2, 3.4);
    C.prop("footlocker", fl[0], BY, fl[1], Fb.ry, {
      loot: "continuity_crate",
      owner: "continuity",
    });
    const fa = Fb.p(0.2, 4.2);
    C.prop("first_aid", fa[0], BY + 1.2, fa[1], Fb.ry + Math.PI, {});
    // east "press booths" (sealed volumes behind their windows)
    const eo = P(AM, RW),
      ei = P(AM, 13);
    const Fe = A.frame(eo[0], eo[1], ei[0] - eo[0], ei[1] - eo[1], true);
    Fe.box(C, "wood_dark", -0.5, 16, 0.3, 2.6, BY - 0.3, BY);
    Fe.box(C, "plaster", -0.5, 16, 0.3, 2.6, BC, BC + 0.2);
    Fe.box(C, "wood_dark", -0.5, 16, 2.5, 2.7, BY, BC);
    booths.forEach((u0, k) => {
      const mid = u0 + 1.5,
        gw = Fe.p(mid, 0.02);
      b.quad("glass", gw[0], 9.5, gw[1], 2.4, 1.8, Fe.ry + Math.PI / 2, {
        double: true,
      });
      Fe.box(C, "wood_light", u0 + 0.2, u0 + 2.8, 0.35, 0.95, BY, BY + 0.78);
      const lp = Fe.p(mid, 1.3);
      b.sphere(k === 1 ? "glass_dark" : "lamp", lp[0], BC - 0.15, lp[1], 0.12);
      if (k !== 1) b.light(lp[0], BC - 0.5, lp[1], 0xffd8a0, 4, 0.6);
      for (const u of [u0, u0 + 3])
        Fe.box(C, "wood_dark", u - 0.06, u + 0.06, 0.3, 2.6, BY, BC);
    });

    // ==============================================================
    // BACKSTAGE CORRIDOR + stair to the booths
    // ==============================================================
    const BZ0 = 17.4,
      BZ1 = 21,
      BX0 = -30,
      BX1 = 50,
      BCY = 4;
    A.floor(C, "concrete", BX0, BZ0, BX1, BZ1, 0.02, { col: false });
    A.ceil(C, "paint_cream", BX0, BZ0, BX1, BZ1, BCY);
    A.wall(C, "plaster", { x0: BX0, x1: BX1, z: BZ1 + 0.15 }, 0, BCY, 0.3, []);
    A.wall(C, "plaster", { x0: BX0, x1: -12.8, z: BZ0 + 0.15 }, 0, BCY, 0.3, [
      { a: -29.6, b: -27.2, top: BCY },
    ]);
    A.wall(
      C,
      "plaster",
      { x0: 12.8, x1: BX1, z: BZ0 + 0.15 },
      0,
      BCY,
      0.3,
      [{ a: 37.2, b: 39.4, top: 2.6 }],
      { casing: "wood_dark" },
    );
    A.wall(C, "plaster", { z0: BZ0, z1: BZ1, x: BX0 - 0.15 }, 0, BCY, 0.3, []);
    A.wall(
      C,
      "plaster",
      { z0: BZ0, z1: BZ1 + 0.3, x: BX1 + 0.15 },
      0,
      4.5,
      0.3,
      [{ a: 18.2, b: 20.2, top: 2.6 }],
      { casing: "continuity_black" },
    );
    b.box("metal_painted", BX0, 3.4, BZ1 - 0.35, BX1, 3.55, BZ1 - 0.2, {
      c: 0x8a7a5a,
    });
    b.cyl("rust", BX0, 3.7, BZ1 - 0.6, 0.12, 0.12, BX1 - BX0, 8, {
      rz: -Math.PI / 2,
      ry: 0,
    });
    for (let x = -26; x <= 46; x += 9)
      A.tube(C, x, BCY - 0.05, 19.2, 0, 1.3, { dead: x === -8, light: false });
    // stair up to the interpreter booths
    A.stairs(C, "concrete", -28.4, BZ0, "n", 2.2, 0, BY, {
      nose: "metal_dark",
    });
    A.wall(C, "plaster", { z0: 6.3, z1: BZ0, x: -29.65 }, 0, BC + 0.2, 0.3, []);
    A.wall(C, "plaster", { z0: 6.9, z1: BZ0, x: -27.15 }, 0, BC + 0.2, 0.3, []);
    b.box("concrete_dark", -29.8, BC, 4.0, -27.0, BC + 0.2, BZ0);
    A.floor(C, "wood_dark", -29.65, 3.9, -26.4, 6.62, BY, { th: 0.3 });
    A.wall(C, "plaster", { x0: -29.8, x1: -28.3, z: 3.85 }, BY, BC, 0.25, []);
    A.wall(C, "plaster", { z0: 3.85, z1: 6.62, x: -29.8 }, BY, BC, 0.25, []);
    b.box("metal_dark", -29.5, BY + 1.0, 6.55, -27.3, BY + 1.06, 6.62, {
      noAO: true,
    });
    // turrets guarding the Security Council door (terminal-controllable)
    C.prop("turret", 30.5, 0, 20.2, Math.PI, {
      faction: "continuity",
      hostile: true,
      group: "li_un_sec",
      terminalId: "li_un_project",
      handle: "turret1",
      continuity: true,
    });
    C.prop("turret", 45.5, 0, 20.2, Math.PI, {
      faction: "continuity",
      hostile: true,
      group: "li_un_sec",
      terminalId: "li_un_project",
      handle: "turret2",
      continuity: true,
    });
    F.crates(C, 2.5, 0, 20.2, 3, 0, { key: "continuity_black" });
    F.crates(C, -18, 0, 20.3, 4, 0.05, { key: "cardboard" });
    C.prop("skeleton", -8.5, 0, 18.4, 1.2, { pose: "lying", collide: false });
    F.papers(C, -8, 0.03, 18.8, 1.2, 10, 81);
    C.prop("ammo_box", 20, 0, 20.4, Math.PI, { loot: "ammo_box" });
    const scSign = T.sign(
      "sc",
      ["SECURITY COUNCIL", "CONSEIL DE SÉCURITÉ"],
      { bg: "#1c2a3a", fg: "#d8c890", size: 48 },
      512,
      128,
    );
    b.quad(scSign, 38.3, 3.1, BZ0 + 0.32, 2.4, 0.6, 0);
    const rvSign = T.sign(
      "rv",
      ["RECORDS STRONGROOM", "AUTHORIZED CONTINUITY PERSONNEL ONLY"],
      { bg: "#18213a", fg: "#e2d6b4", border: "#b08a3a", size: 44 },
      512,
      128,
    );
    b.quad(rvSign, BX1 - 0.02, 3.1, 19.2, 2.2, 0.55, -Math.PI / 2);
    const bsSign = T.sign(
      "bs",
      ["INTERPRETATION ▲", "STAFF ONLY"],
      { bg: "#2a2a26", fg: "#e8e0c8", size: 44 },
      512,
      128,
    );
    b.quad(bsSign, -28.4, 3.0, BZ0 + 0.35, 2.0, 0.5, 0);

    // ==============================================================
    // GA LOBBY (floor 3.6)
    // ==============================================================
    const LX0 = -30,
      LX1 = 30,
      LZ0 = -44;
    const lobPoly = [[LX0, LZ0], [LX1, LZ0], [LX1, 2.08], P(AM, RW)];
    for (let i = 1; i < 28; i++) lobPoly.push(P(AM - (i / 28) * 2 * AM, RW));
    lobPoly.push(P(-AM, RW), [LX0, 2.08]);
    {
      const sh = new THREE.Shape();
      lobPoly.forEach((p, i) =>
        i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1]),
      );
      const g = new THREE.ShapeGeometry(sh, 16);
      g.rotateX(-Math.PI / 2);
      g.translate(0, LOBY, 0);
      b.add("terrazzo", g, { noAO: true, uvScale: 1.5 });
      const sh2 = new THREE.Shape();
      lobPoly.forEach((p, i) =>
        i ? sh2.lineTo(p[0], p[1]) : sh2.moveTo(p[0], p[1]),
      );
      const g2 = new THREE.ShapeGeometry(sh2, 16);
      g2.rotateX(Math.PI / 2);
      g2.translate(0, LCEIL, 0);
      b.add("plaster", g2, { noAO: true });
    }
    // solid floor under the lobby (colliders in 2 m strips up to the arc)
    for (let x = LX0; x < LX1; x += 2) {
      const xm =
        Math.abs(x + 1) < RW * Math.sin(AM)
          ? Math.max(Math.abs(x), Math.abs(x + 2))
          : 99;
      const zEnd =
        xm < RW * Math.sin(AM) ? CZ - Math.sqrt(RW * RW - xm * xm) + 0.2 : 2.08;
      C.col(x, 0, LZ0, x + 2, LOBY, zEnd, { surface: "concrete" });
    }
    // walls
    A.wall(
      C,
      "marble",
      { z0: LZ0, z1: 2.1, x: LX0 - 0.2 },
      LOBY,
      LCEIL,
      0.4,
      [],
    );
    A.wall(
      C,
      "marble",
      { z0: LZ0, z1: 2.1, x: LX1 + 0.2 },
      LOBY,
      LCEIL,
      0.4,
      [{ a: -25.2, b: -22.8, top: LOBY + 2.8 }],
      { casing: "brass" },
    );
    for (const s of [-1, 1])
      A.wall(
        C,
        "marble",
        {
          x0: Math.min(s * 27.25, s * 30.4),
          x1: Math.max(s * 27.25, s * 30.4),
          z: 2.28,
        },
        LOBY,
        LCEIL,
        0.4,
        [],
      );
    // north glass front with the plaza beyond
    A.wall(
      C,
      "marble",
      { x0: LX0 - 0.4, x1: -12, z: LZ0 - 0.2 },
      LOBY,
      LCEIL,
      0.4,
      [],
    );
    A.wall(
      C,
      "marble",
      { x0: 12, x1: LX1 + 0.4, z: LZ0 - 0.2 },
      LOBY,
      LCEIL,
      0.4,
      [],
    );
    b.box("marble", -12, LCEIL - 1.2, LZ0 - 0.4, 12, LCEIL, LZ0);
    C.col(-12, LOBY, LZ0 - 0.6, 12, LCEIL, LZ0 - 0.1, { walkable: false });
    b.quad(
      "glass",
      0,
      (LOBY + LCEIL - 1.2) / 2,
      LZ0 - 0.15,
      24,
      LCEIL - 1.2 - LOBY,
      0,
    );
    for (let x = -12; x <= 12.01; x += 2.4)
      b.box(
        "metal_dark",
        x - 0.06,
        LOBY,
        LZ0 - 0.3,
        x + 0.06,
        LCEIL - 1.2,
        LZ0 - 0.1,
      );
    for (let y = LOBY + 3; y < LCEIL - 1.3; y += 2.6)
      b.box("metal_dark", -12, y, LZ0 - 0.3, 12, y + 0.1, LZ0 - 0.1);
    b.quad(T.backdrop, 0, LOBY + 4, LZ0 - 3, 34, 14, 0, { noAO: true });
    b.box("black", -18, LOBY - 1, LZ0 - 3.5, 18, LOBY, LZ0 - 0.3, {
      noBake: true,
    });
    // entrance doors (exit) framed in bronze
    b.box("bronze", -1.6, LOBY, LZ0 - 0.35, 1.6, LOBY + 2.9, LZ0 - 0.25);
    b.box(
      "glass_dark",
      -1.45,
      LOBY + 0.05,
      LZ0 - 0.24,
      1.45,
      LOBY + 2.8,
      LZ0 - 0.2,
    );
    // wall art: stained glass (east), UN flag row (west), directory signs
    b.box(
      "black",
      LX1 - 0.02,
      LOBY + 0.6,
      -41.8,
      LX1 + 0.3,
      LOBY + 8.6,
      -33.8,
      { noBake: true },
    );
    b.quad(T.glass, LX1 - 0.05, LOBY + 4.6, -37.8, 7.6, 7.6, -Math.PI / 2, {
      noAO: true,
    });
    for (let k = 0; k < 7; k++) {
      const z = -40 + k * 3.2;
      b.cyl("chrome", LX0 + 0.6, LOBY, z, 0.03, 0.04, 4.6, 6);
      const col = [
        "fabric_blue",
        "fabric_red",
        "fabric_green",
        "fabric",
        "fabric_blue",
        "fabric_red",
        "fabric",
      ][k];
      b.obox(col, LX0 + 0.62, LOBY + 3.9, z + 0.75, 0.02, 1.0, 1.5, 0, {
        rz: 0.05,
      });
    }
    const gaSign = T.sign(
      "ga",
      ["GENERAL ASSEMBLY", "ASSEMBLÉE GÉNÉRALE"],
      { bg: "#1c2a3a", fg: "#d8c890", size: 50 },
      512,
      128,
    );
    {
      const p = P(0, RW + 0.62);
      b.quad(gaSign, p[0], LOBY + 3.6, p[1] - 0.01, 3.4, 0.85, Math.PI);
    }
    // lobby architecture: the balcony that overlooks the lobby from the hall's back wall, slanted piers at the glass front,
    // bronze sconces, a terrazzo compass band
    for (let j = 0; j < 12; j++) {
      const a0 = -0.62 + (j / 12) * 1.24,
        a1 = a0 + 1.24 / 12,
        am = (a0 + a1) / 2,
        rr = RW + 1.9,
        c = P(am, rr),
        L = 2 * (RW + 3.2) * Math.sin(0.62 / 12) + 0.05;
      b.obox("marble", c[0], LOBY + 4.05, c[1], L, 0.5, 2.6, -am);
      const e = P(am, RW + 3.15);
      b.obox("brass", e[0], LOBY + 5.3, e[1], L, 0.08, 0.08, -am);
      b.obox("brass", e[0], LOBY + 4.8, e[1], L, 0.04, 0.04, -am);
      for (let k = 0; k < 3; k++) {
        const q = P(a0 + ((k + 0.5) / 3) * (a1 - a0), RW + 3.15);
        b.box(
          "brass",
          q[0] - 0.02,
          LOBY + 4.3,
          q[1] - 0.02,
          q[0] + 0.02,
          LOBY + 5.3,
          q[1] + 0.02,
        );
      }
      if (j % 3 === 1) {
        const q = P(am, RW + 0.7);
        A.sconce(C, q[0], LOBY + 2.6, q[1], Math.PI + am, {
          light: j === 4 || j === 7,
        });
      }
    }
    for (const x of [-18, -6, 6, 18]) {
      b.obox(
        "concrete",
        x,
        (LOBY + LCEIL) / 2,
        -42.2,
        0.9,
        LCEIL - LOBY,
        1.2,
        0,
        { rx: 0.1 },
      );
      C.col(x - 0.45, LOBY, -43.2, x + 0.45, LCEIL, -41.2, { walkable: false });
    }
    for (const [x, z, ry] of [
      [LX0 + 0.25, -34, Math.PI / 2],
      [LX0 + 0.25, -26, Math.PI / 2],
      [LX1 - 0.25, -30, -Math.PI / 2],
      [LX1 - 0.25, -14, -Math.PI / 2],
      [LX0 + 0.25, -6, Math.PI / 2],
    ])
      A.sconce(C, x, LOBY + 2.8, z, ry, { r: 7, i: 0.6 });
    b.flat("brass", 0, LOBY + 0.015, -36, 0.12, 14, 0, { noAO: true });
    b.flat("brass", 0, LOBY + 0.015, -36, 14, 0.12, 0, { noAO: true });
    // Foucault pendulum (animated bob, still driven by its old-world magnet)
    const PX = 13,
      PZ = -35;
    b.cyl("marble_dark", PX, LOBY - 0.001, PZ, 2.1, 2.1, 0.02, 32);
    b.flat(T.rose, PX, LOBY + 0.03, PZ, 3.9, 3.9, 0);
    A.rail(
      C,
      "brass",
      Array.from({ length: 17 }, (_, i) => [
        PX + Math.cos((i / 16) * TAU) * 2.4,
        PZ + Math.sin((i / 16) * TAU) * 2.4,
      ]),
      LOBY,
      0.95,
      { step: 1.0, mid: false },
    );
    b.cyl("brass", PX, LCEIL - 0.3, PZ, 0.25, 0.4, 0.3, 12);
    const pend = new THREE.Group();
    pend.position.set(PX, LCEIL - 0.3, PZ);
    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, LCEIL - 0.3 - LOBY - 0.95, 4),
      LI.mat("steel"),
    );
    wire.position.y = -(LCEIL - 0.3 - LOBY - 0.95) / 2;
    const bob = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 18, 12),
      LI.mat("gold"),
    );
    bob.position.y = -(LCEIL - 0.3 - LOBY - 0.95);
    pend.add(wire, bob);
    C.root.add(pend);
    LI.animators.push({
      cell: C,
      fn: (dt, t) => {
        const sw = Math.sin((t * 2 * Math.PI) / 6.2) * 0.075,
          pr = t * 0.0021;
        pend.rotation.set(Math.cos(pr) * sw, 0, Math.sin(pr) * sw);
      },
    });
    const fpSign = T.sign(
      "fp",
      ["FOUCAULT PENDULUM", "PROOF THAT THE EARTH STILL TURNS"],
      { bg: "#2a2a26", fg: "#d8c890", size: 40 },
      512,
      128,
    );
    b.obox("bronze", PX + 3.2, LOBY + 0.5, PZ + 2.2, 0.1, 1.0, 0.1, 0);
    b.quad(fpSign, PX + 3.2, LOBY + 1.1, PZ + 2.26, 1.1, 0.28, 0, { rx: -0.6 });
    // Sputnik model hanging over the arrival
    b.sphere("steel", -6, LCEIL - 3.2, -37, 0.42, { ws: 16, hs: 12 });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU + 0.4;
      b.rod(
        "chrome",
        [-6, LCEIL - 3.2, -37],
        [-6 + Math.cos(a) * 2.4, LCEIL - 4.4, -37 + Math.sin(a) * 2.4],
        0.012,
      );
    }
    b.rod("steel", [-6, LCEIL - 2.6, -37], [-6, LCEIL, -37], 0.008);
    // Continuity checkpoint across the lobby (gap in the middle)
    for (const [x0, x1] of [
      [-20, -2.2],
      [2.2, 20],
    ]) {
      for (let x = x0; x < x1 - 0.1; x += 2.2) {
        const w = Math.min(2.1, x1 - x);
        b.box("continuity_black", x, LOBY, -30.25, x + w, LOBY + 2.4, -29.75);
        b.box(
          "lamp_red",
          x + w / 2 - 0.08,
          LOBY + 2.3,
          -30.28,
          x + w / 2 + 0.08,
          LOBY + 2.38,
          -29.72,
        );
      }
      C.col(x0, LOBY, -30.25, x1, LOBY + 2.4, -29.75, {
        walkable: false,
        surface: "metal",
        tag: "cover",
      });
    }
    for (const x of [-2.4, 2.4]) {
      b.box(
        "continuity_black",
        x - 0.3,
        LOBY,
        -30.4,
        x + 0.3,
        LOBY + 3.2,
        -29.6,
      );
      b.sphere("lamp_red", x, LOBY + 3.35, -30, 0.14);
      C.col(x - 0.3, LOBY, -30.4, x + 0.3, LOBY + 3.2, -29.6, {
        walkable: false,
      });
    }
    b.quad(T.banner, 0, LOBY + 6.5, -30.1, 2.6, 7.8, Math.PI, {
      double: true,
      noAO: true,
    });
    const encSign = T.sign(
      "enc",
      ["CHECKPOINT — PRESENT CREDENTIALS", "THE CONTINUITY · PROJECT K"],
      { bg: "#18213a", fg: "#e2d6b4", border: "#b08a3a", size: 34 },
      768,
      128,
    );
    b.quad(encSign, -9, LOBY + 1.9, -30.3, 4.2, 0.7, Math.PI);
    b.quad(encSign, 9, LOBY + 1.9, -30.3, 4.2, 0.7, Math.PI);
    F.sandbags(C, [-4.2, -32.2], [-1.2, -33.4], LOBY, 3);
    F.table(C, 4.6, LOBY, -32.4, 1.6, 0.8, 0, { key: "continuity_black" });
    C.prop("terminal", 4.6, LOBY + 0.76, -32.4, Math.PI, {
      terminalId: "li_un_checkpoint",
      mount: "bare",
    });
    // info desk (curved) + visitors' benches + dead planters + queue dead
    for (let k = 0; k < 7; k++) {
      const a = -0.9 + k * 0.3,
        x = -14 + Math.sin(a) * 3.2,
        z = -38 + Math.cos(a) * 3.2;
      b.obox("wood_light", x, LOBY + 0.55, z, 1.0, 1.1, 0.5, a);
    }
    C.col(-17.3, LOBY, -36, -10.7, LOBY + 1.1, -34.6, { walkable: false });
    const infoSign = T.sign(
      "info",
      ["INFORMATION", "VISITOR TOURS SUSPENDED"],
      { bg: "#1c2a3a", fg: "#e8e0c8", size: 44 },
      512,
      128,
    );
    b.quad(infoSign, -14, LOBY + 2.8, -34.9, 2.4, 0.6, 0);
    C.prop("terminal", -14, LOBY + 1.1, -35.9, Math.PI, {
      terminalId: "li_un_visitor",
      mount: "bare",
    });
    for (const [x, z] of [
      [-20, -18],
      [-10, -20],
      [10, -20],
      [20, -18],
      [-6, -26],
      [8, -26],
    ]) {
      b.box(
        "wood_light",
        x - 1.2,
        LOBY + 0.42,
        z - 0.25,
        x + 1.2,
        LOBY + 0.48,
        z + 0.25,
      );
      b.box(
        "metal_dark",
        x - 1.1,
        LOBY,
        z - 0.05,
        x - 1.0,
        LOBY + 0.42,
        z + 0.05,
      );
      b.box(
        "metal_dark",
        x + 1.0,
        LOBY,
        z - 0.05,
        x + 1.1,
        LOBY + 0.42,
        z + 0.05,
      );
      C.col(x - 1.2, LOBY, z - 0.25, x + 1.2, LOBY + 0.48, z + 0.25, {
        walkable: false,
        surface: "wood",
      });
    }
    for (const [x, z] of [
      [-26, -42],
      [26, -42],
      [-26, -4],
      [26, -4],
    ]) {
      b.cyl("concrete", x, LOBY, z, 0.8, 0.7, 0.9, 12);
      b.cyl("dirt", x, LOBY + 0.86, z, 0.72, 0.72, 0.05, 12);
      for (let k = 0; k < 5; k++) {
        const a = k * 1.3;
        b.rod(
          "wood_rotten",
          [x, LOBY + 0.9, z],
          [x + Math.cos(a) * 0.7, LOBY + 2.2 + (k % 2), z + Math.sin(a) * 0.7],
          0.03,
        );
      }
      C.col(x - 0.8, LOBY, z - 0.8, x + 0.8, LOBY + 0.9, z + 0.8, {
        walkable: false,
      });
    }
    C.prop("skeleton", -3.5, LOBY, -40.5, 2.6, {
      pose: "reaching",
      collide: false,
    });
    C.prop("skeleton", -1.8, LOBY, -39.2, 0.3, {
      pose: "curled",
      collide: false,
    });
    C.prop("duffle_bag", -2.6, LOBY, -39.9, 0.8, { loot: "luggage" });
    C.prop("teddy_bear", 6.5, LOBY, -39.5, 2.0, {});
    F.papers(C, 0, LOBY + 0.02, -38, 4, 30, 91);
    // UN Bookshop (south-west corner) behind low glass partitions
    b.box("wood_light", -30, LOBY, -22.1, -22, LOBY + 1.0, -21.9);
    b.box("glass", -30, LOBY + 1.0, -22.05, -22, LOBY + 2.4, -21.95);
    b.box("wood_light", -22.1, LOBY, -22, -21.9, LOBY + 1.0, -12);
    b.box("glass", -22.05, LOBY + 1.0, -22, -21.95, LOBY + 2.4, -12);
    C.col(-30, LOBY, -22.2, -22, LOBY + 2.4, -21.8, { walkable: false });
    C.col(-22.2, LOBY, -22, -21.8, LOBY + 2.4, -12, { walkable: false });
    for (const z of [-20.5, -16.5])
      F.bookshelf(C, -26, LOBY, z, 4.2, 2.0, 0, {
        seed: (z * 7) | 0,
        gaps: 0.4,
      });
    F.bookshelf(C, -29.3, LOBY, -14, 3.6, 2.2, Math.PI / 2, {
      seed: 5,
      gaps: 0.35,
    });
    const bkSign = T.sign(
      "book",
      ["UN BOOKSHOP", "POSTCARDS · STAMPS · FLAGS"],
      { bg: "#2a4a78", fg: "#f0e8d0", size: 44 },
      512,
      128,
    );
    b.quad(bkSign, -26, LOBY + 3.0, -22.25, 3.0, 0.75, Math.PI);
    C.prop("cash_register", -23.4, LOBY + 1.0, -13.5, Math.PI / 2, {});
    F.table(C, -23.4, LOBY, -13.5, 1.0, 2.0, 0, { key: "wood_light", h: 1.0 });

    // ==============================================================
    // DELEGATES' LOUNGE (x 30..50, z -34..-14, floor 3.6)
    // ==============================================================
    const DX0 = 30.4,
      DX1 = 50,
      DZ0 = -34,
      DZ1 = -14,
      DC = LOBY + 4.2;
    C.col(DX0, 0, DZ0, DX1, LOBY, DZ1, {});
    A.floor(C, "carpet_green", DX0, DZ0, DX1, DZ1, LOBY + 0.01, {
      col: false,
      th: 0.05,
    });
    A.ceil(C, "plaster", DX0, DZ0, DX1, DZ1, DC);
    A.wall(
      C,
      "wood_light",
      { x0: DX0, x1: DX1, z: DZ0 - 0.15 },
      LOBY,
      DC,
      0.3,
      [],
    );
    A.wall(
      C,
      "wood_light",
      { x0: DX0, x1: DX1, z: DZ1 + 0.15 },
      LOBY,
      DC,
      0.3,
      [{ a: 45.4, b: 47.6, top: LOBY + 2.6 }],
    );
    A.wall(
      C,
      "wood_light",
      { z0: DZ0, z1: DZ1, x: DX1 + 0.15 },
      LOBY,
      DC,
      0.3,
      [{ a: -31, b: -17, sill: LOBY + 0.9, top: DC - 0.5 }],
    );
    b.quad(
      "glass",
      DX1 + 0.05,
      (LOBY + 0.9 + DC - 0.5) / 2,
      -24,
      14,
      DC - 0.5 - LOBY - 0.9,
      -Math.PI / 2,
    );
    b.quad(
      LI.texMat(
        "un_river",
        LI.canvasTex(
          "un_river",
          1024,
          256,
          (x, W, H) => {
            const g = x.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, "#7a8a62");
            g.addColorStop(0.6, "#a8a47a");
            g.addColorStop(0.62, "#3a4a40");
            g.addColorStop(1, "#1a2420");
            x.fillStyle = g;
            x.fillRect(0, 0, W, H);
            x.fillStyle = "rgba(40,40,36,0.85)";
            for (let i = 0; i < 30; i++) {
              const w = 20 + ((i * 37) % 50),
                h = 20 + ((i * 53) % 70);
              x.fillRect(i * 36, H * 0.6 - h, w, h);
            }
            LI.wear(x, W, H, 12, 0.4);
          },
          { clamp: true },
        ),
        { emissive: 0.5 },
      ),
      DX1 + 1.2,
      LOBY + 2.6,
      -24,
      18,
      4.5,
      -Math.PI / 2,
      { noAO: true },
    );
    b.box("black", DX1 + 0.3, LOBY - 1, -34, DX1 + 1.3, LOBY + 0.3, -14, {
      noBake: true,
    });
    b.box("wood_dark", 33, LOBY, -33.4, 42, LOBY + 1.1, -32.6);
    b.box("marble_dark", 32.9, LOBY + 1.1, -33.5, 42.1, LOBY + 1.16, -32.4);
    C.col(33, LOBY, -33.5, 42.1, LOBY + 1.16, -32.4, { walkable: false });
    for (let x = 33.6; x < 42; x += 0.5) {
      const r = LI.rng((x * 10) | 0)();
      if (r < 0.4)
        b.cyl(
          r < 0.2 ? "glass_dark" : "glass",
          x,
          LOBY + 1.16,
          -32.9,
          0.05,
          0.05,
          0.28,
          6,
        );
    }
    for (const [x, z, ry] of [
      [36, -26, 0],
      [44, -26, 0],
      [36, -19, Math.PI],
      [44, -19, Math.PI],
    ]) {
      F.sofa(C, x, LOBY, z, 2.2, ry, { key: "leather" });
    }
    for (const [x, z] of [
      [36, -22.5],
      [44, -22.5],
    ])
      F.table(C, x, LOBY, z, 1.4, 0.8, 0, { key: "wood_dark", h: 0.45 });
    for (const [x, z] of [
      [35, -29],
      [45, -29],
      [35, -19],
      [45, -19],
    ])
      A.pendant(C, x, DC - 1.2, z, DC, { light: false });
    const dlSign = T.sign(
      "dl",
      ["DELEGATES' LOUNGE", "NO PRESS BEYOND THIS POINT"],
      { bg: "#2a2a26", fg: "#d8c890", size: 44 },
      512,
      128,
    );
    b.quad(dlSign, LX1 + 0.02, LOBY + 3.2, -24, 2.4, 0.6, Math.PI / 2);
    C.prop("skeleton", 37, LOBY + 0.25, -25.6, Math.PI, {
      pose: "seated",
      collide: false,
    });
    C.prop("fizzo_machine", 49.4, LOBY, -32.8, -Math.PI / 2, {});
    // stair down into the Security Council
    A.stairs(C, "marble_dark", 46.5, -8.9, "n", 2.2, 0, LOBY, {
      nose: "brass",
    });
    A.wall(C, "wood_light", { z0: -14, z1: -8.9, x: 45.25 }, 0, DC, 0.3, []);
    A.wall(C, "wood_light", { z0: -14, z1: -8.9, x: 47.75 }, 0, DC, 0.3, []);
    b.box("plaster", 45.2, DC, -14, 47.8, DC + 0.3, -8.9);

    // ==============================================================
    // SECURITY COUNCIL CHAMBER (x 30..50, z -9..17.4)
    // ==============================================================
    const SX0 = 30.4,
      SX1 = 50,
      SZ0 = -8.9,
      SZ1 = BZ0,
      SH = 9;
    A.floor(C, "carpet_blue", SX0, SZ0, SX1, SZ1, 0.02, {
      col: false,
      th: 0.05,
    });
    A.ceil(C, "plaster", SX0, SZ0, SX1, SZ1, SH);
    A.wall(C, "wood_light", { x0: SX0, x1: SX1, z: SZ0 - 0.15 }, 0, SH, 0.3, [
      { a: 45.4, b: 47.6, top: LOBY + 2.6 },
    ]);
    A.wall(
      C,
      "wood_light",
      { z0: SZ0, z1: SZ1, x: SX0 - 0.15 },
      0,
      SH,
      0.3,
      [],
    );
    A.wall(
      C,
      "wood_light",
      { z0: SZ0 - 0.3, z1: 24.2, x: SX1 + 0.15 },
      0,
      SH,
      0.3,
      [{ a: 18.2, b: 20.2, top: 2.6 }],
    );
    // tapestry on the long walls, mural on the east wall
    b.quad(T.tapestry, 40, 5, SZ0 + 0.02, 19, 7.6, 0, {
      us: 19 / 3,
      noAO: true,
    });
    b.quad(T.tapestry, 34, 5.3, SZ1 - 0.01, 7, 7.0, Math.PI, {
      us: 7 / 3,
      noAO: true,
    });
    b.quad(T.tapestry, 45.5, 5.3, SZ1 - 0.01, 8.6, 7.0, Math.PI, {
      us: 8.6 / 3,
      noAO: true,
    });
    b.box("gold", SX1 - 0.12, 1.3, -2.2, SX1, 8.4, 9.2);
    b.quad(T.phoenix, SX1 - 0.14, 4.85, 3.5, 11, 6.6, -Math.PI / 2, {
      noAO: true,
    });
    // gallery benches (west)
    for (let k = 0; k < 3; k++) {
      const x0 = SX0 + k * 1.2,
        y = (k + 1) * 0.45;
      b.box("wood_dark", x0, 0, SZ0 + 1, SX0 + 3.6, y, SZ1 - 1, { fy: 0 });
      C.col(x0, 0, SZ0 + 1, SX0 + 3.6, y, SZ1 - 1, { surface: "wood" });
      b.box(
        "fabric_blue",
        x0 + 0.2,
        y,
        SZ0 + 1.5,
        x0 + 0.65,
        y + 0.42,
        SZ1 - 1.5,
      );
    }
    // the horseshoe table (open end toward the mural)
    const HX = 41,
      HZ = 3.5,
      HR = 5.2,
      NH = 9;
    for (let j = 0; j < NH; j++) {
      const f0 = -Math.PI / 2 + (j / NH) * Math.PI,
        f1 = f0 + Math.PI / NH,
        fm = (f0 + f1) / 2;
      const cx = HX - HR * Math.cos(fm),
        cz = HZ + HR * Math.sin(fm),
        ry = Math.atan2(-Math.cos(fm), Math.sin(fm)),
        L = 2 * (HR + 0.55) * Math.sin(Math.PI / NH / 2) + 0.05;
      b.obox("wood_light", cx, 0.74, cz, L, 0.06, 1.1, ry);
      const fr = [
        HX - (HR + 0.5) * Math.cos(fm),
        HZ + (HR + 0.5) * Math.sin(fm),
      ];
      b.obox("fabric_blue", fr[0], 0.37, fr[1], L - 0.05, 0.72, 0.06, ry);
      C.colRot(cx, cz, L, 1.1, 0, 0.77, ry, {
        walkable: false,
        surface: "wood",
      });
      const ch = [
        HX - (HR + 1.05) * Math.cos(fm),
        HZ + (HR + 1.05) * Math.sin(fm),
      ];
      F.chair(C, ch[0], 0, ch[1], ry + Math.PI, {
        key: "wood_light",
        seat: "fabric_blue",
        toppled: j === 6,
      });
      const pl = [
        HX - (HR - 0.35) * Math.cos(fm),
        HZ + (HR - 0.35) * Math.sin(fm),
      ];
      b.quad(T.placard, pl[0], 0.83, pl[1], 0.36, 0.09, ry + Math.PI, {
        uvRect: T.placardUV(70 + j),
        noAO: true,
      });
    }
    for (const s of [-1, 1]) {
      const z = HZ + s * HR;
      b.box("wood_light", HX, 0.71, z - 0.55, HX + 4.6, 0.77, z + 0.55);
      b.box(
        "fabric_blue",
        HX,
        0,
        z + s * 0.5 - 0.03,
        HX + 4.6,
        0.72,
        z + s * 0.5 + 0.03,
      );
      C.col(HX, 0, z - 0.55, HX + 4.6, 0.77, z + 0.55, {
        walkable: false,
        surface: "wood",
      });
      for (let k = 0; k < 3; k++)
        F.chair(C, HX + 0.8 + k * 1.4, 0, z + s * 1.05, s > 0 ? 0 : Math.PI, {
          key: "wood_light",
          seat: "fabric_blue",
        });
    }
    // the SKY-EYE RELAY desk (main story, mq19 Continuity variant): four CRTs fed by the drones over the harbour, against
    // the west wall; anchor sky_eye_room (the operator's chair, facing the screens)
    F.desk(C, 31.2, 0, -4.6, 2.6, 0.9, Math.PI / 2, {
      key: "continuity_black",
    });
    for (let k = 0; k < 4; k++)
      F.monitor(
        C,
        31.0,
        0.77 + (k > 1 ? 0.5 : 0),
        -5.4 + (k % 2) * 1.5,
        Math.PI / 2,
        { dead: k === 3 },
      );
    b.quad(
      LI.texMat(
        "un_skyeye_sign",
        LI.signTex(
          "un_skyeye_sign",
          ["SKY-EYE RELAY", "LIBERTY NET · NIGHT WATCH"],
          { bg: "#1c2a3a", fg: "#e8e0c8", size: 40 },
          512,
          128,
        ),
      ),
      30.62,
      2.6,
      -4.6,
      1.6,
      0.4,
      Math.PI / 2,
    );
    F.chair(C, 32.4, 0, -4.6, -Math.PI / 2, {
      key: "metal_dark",
      seat: "fabric_blue",
    });
    C.anchor("sky_eye_room", 32.9, 0, -4.6, Math.PI / 2);
    // Knickerbocker model: a backlit perspex-and-wire scale model of the torch on a light table inside the horseshoe
    b.cyl("continuity_black", 41.6, 0, 3.5, 0.9, 1.1, 0.8, 16);
    b.cyl("lamp_blue", 41.6, 0.8, 3.5, 0.7, 0.7, 0.04, 16);
    C.col(40.6, 0, 2.5, 42.6, 0.85, 4.5, { walkable: false, surface: "metal" });
    const holo = new THREE.Group();
    holo.position.set(41.6, 0.9, 3.5);
    const hm = new THREE.MeshBasicMaterial({
      color: 0xcfe6ee,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      side: THREE.DoubleSide,
      wireframe: false,
    });
    const hw = new THREE.MeshBasicMaterial({
      color: 0xb8c8cc,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      wireframe: true,
    });
    const torch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.1, 1.4, 10, 3, true),
      hw,
    );
    torch.position.y = 0.9;
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.6, 10, 2, true),
      hw,
    );
    flame.position.y = 1.9;
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.2, 0.3, 14, 1, true),
      hw,
    );
    cup.position.y = 1.6;
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.02, 4, 40), hm);
    ring1.position.y = 1.9;
    ring1.rotation.x = Math.PI / 2;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.02, 4, 40), hm);
    ring2.position.y = 1.5;
    ring2.rotation.x = Math.PI / 2;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.6, 2.4, 16, 1, true),
      hm,
    );
    beam.position.y = 1.2;
    holo.add(torch, flame, cup, ring1, ring2, beam);
    C.root.add(holo);
    holo.rotation.y = 0.4; // a static model (no projection)
    // war-map table, terminal desk, Continuity dressing
    F.table(C, 34.5, 0, 12.5, 3.2, 2.0, 0, {
      key: "continuity_black",
      h: 0.95,
    });
    b.flat(T.map, 34.5, 0.96, 12.5, 3.0, 1.85, 0);
    F.desk(C, 44.5, 0, 15.6, 2.4, 0.9, Math.PI, { key: "continuity_black" });
    C.prop("terminal", 44.5, 0.77, 15.6, 0, {
      terminalId: "li_un_project",
      mount: "bare",
    });
    F.monitor(C, 43.4, 0.77, 15.7, 0, {});
    b.quad(T.banner, SX0 + 0.05, 5.4, 3.5, 2.6, 7.4, Math.PI / 2, {
      noAO: true,
    });
    F.crates(C, 48.4, 0, -6.5, 4, Math.PI / 2, { key: "continuity_black" });
    C.prop("footlocker", 47.8, 0, 14.8, Math.PI, {
      loot: "continuity_crate",
      owner: "continuity",
    });
    C.prop("ammo_box", 48.6, 0, -3.2, -Math.PI / 2, {
      loot: "ammo_box",
      owner: "continuity",
    });
    // curtained windows (north wall)
    for (const x of [33, 37, 41]) {
      b.box("black", x - 1.2, 2.0, SZ0 + 0.01, x + 1.2, 7.6, SZ0 + 0.03, {
        noBake: true,
      });
      for (const s of [-1, 1])
        b.obox("fabric_red", x + s * 0.8, 4.8, SZ0 + 0.2, 0.9, 5.8, 0.12, 0, {
          rz: s * 0.02,
        });
    }
    for (const [x, z] of [
      [36, -4],
      [44, -4],
      [36, 11],
      [44, 11],
    ])
      A.chandelier(C, x, 6.8, z, SH, 1.0, { light: false });

    // ==============================================================
    // RECORDS STRONGROOM (x 50..64, z 6..24) behind an electric security grille
    // ==============================================================
    const VX0 = 50.3,
      VX1 = 64,
      VZ0 = 6,
      VZ1 = 24,
      VH = 4.5;
    A.floor(C, "concrete", VX0, VZ0, VX1, VZ1, 0.02, { col: false });
    A.ceil(C, "paint_green", VX0, VZ0, VX1, VZ1, VH);
    A.wall(C, "concrete", { x0: VX0, x1: VX1, z: VZ0 - 0.15 }, 0, VH, 0.3, []);
    A.wall(C, "concrete", { x0: VX0, x1: VX1, z: VZ1 + 0.15 }, 0, VH, 0.3, []);
    A.wall(C, "concrete", { z0: VZ0, z1: VZ1, x: VX1 + 0.15 }, 0, VH, 0.3, []);
    for (let x = 52.4; x < 62; x += 2.2)
      for (const [z0, z1] of [
        [8, 14],
        [16.6, 22],
      ]) {
        if (x > 59 && z0 > 15) continue;
        b.box("metal_olive", x - 0.3, 0, z0, x + 0.3, 2.3, z1);
        C.col(x - 0.3, 0, z0, x + 0.3, 2.3, z1, {
          walkable: false,
          surface: "metal",
        });
        for (let z = z0 + 0.25; z < z1 - 0.2; z += 0.5)
          for (let y = 0.3; y < 2.2; y += 0.55) {
            b.box(
              "metal_dark",
              x - 0.32,
              y,
              z - 0.18,
              x + 0.32,
              y + 0.04,
              z + 0.18,
            );
          }
      }
    for (let x = 52; x < 64; x += 4)
      A.tube(C, x, VH - 0.05, 15.3, Math.PI / 2, 1.3, {
        dead: x === 56,
        light: false,
      });
    // the leaking isotope cooler + irradiated puddle
    b.box("metal_painted", 59.2, 0, 8.6, 61.4, 2.1, 10.4, { c: 0x8a9a8a });
    C.col(59.2, 0, 8.6, 61.4, 2.1, 10.4, { walkable: false, surface: "metal" });
    b.cyl("lamp_green", 60.3, 2.1, 9.5, 0.25, 0.25, 0.3, 10);
    b.cyl("goo", 59.4, 0.03, 11.6, 1.6, 1.6, 0.02, 20);
    b.flat(
      LI.texMat(
        "un_rad",
        LI.canvasTex(
          "un_rad",
          256,
          256,
          (x, W, H) => {
            x.fillStyle = "#e8c020";
            x.fillRect(0, 0, W, H);
            x.fillStyle = "#141414";
            x.beginPath();
            x.arc(W / 2, H / 2, 22, 0, TAU);
            x.fill();
            for (let i = 0; i < 3; i++) {
              x.beginPath();
              x.moveTo(W / 2, H / 2);
              x.arc(
                W / 2,
                H / 2,
                100,
                (i * TAU) / 3 - Math.PI / 2 - 0.5,
                (i * TAU) / 3 - Math.PI / 2 + 0.5,
              );
              x.fill();
            }
            LI.wear(x, W, H, 2, 0.6);
          },
          { clamp: true },
        ),
      ),
      60.3,
      2.12,
      9.5,
      1.4,
      1.4,
      0,
    );
    C.radSource = { x: 60, y: 1, z: 10.5, radius: 6.5, strength: 3.0 };
    // tapes desk + terminal + the Secretary-General's safe
    F.desk(C, 61.5, 0, 20.5, 2.2, 0.9, -Math.PI / 2, { key: "metal_olive" });
    C.prop("terminal", 61.6, 0.77, 21.2, -Math.PI / 2, {
      terminalId: "li_un_records",
      mount: "bare",
    });
    C.anchor("tapes", 61.4, 0.8, 19.8); // the enrolment microfilm case (item id li_genome_tapes, kept for saves)
    C.anchor("ledger", 61.3, 0.8, 20.55); // desk R-10: the 1968 Relief Station ledger (main story places its note here)
    C.anchor("records", 60.0, 0, 20.3, -Math.PI / 2); // standing at the records desk
    C.prop("safe", 63.4, 0, 23.2, -Math.PI / 2, {
      items: [
        ["li_sg_suit", 1],
        ["scrip", 180],
        ["li_un_pass", 1],
      ],
      locked: 0,
      lock: LI.LOCKS.un_sg_safe,
      owner: "continuity",
      name: "Secretary-General's Safe",
    });
    C.prop("skeleton", 56.5, 0, 15.2, 0.4, { pose: "lying", collide: false });
    C.prop("file_cabinet", 51, 0, 23.2, Math.PI, { loot: "file_cabinet" });
    F.papers(C, 56, 0.03, 15.5, 2.2, 26, 111);
    // an electrically locked steel security grille across the strongroom door (collider removable; drops into the floor slot)
    const ffMat = new THREE.MeshStandardMaterial({
      map: LI.canvasTex("un_grille", 256, 256, (x, W, H) => {
        x.clearRect(0, 0, W, H);
        x.strokeStyle = "#7a8088";
        x.lineWidth = 9;
        for (let k = -W; k < W * 2; k += 36) {
          x.beginPath();
          x.moveTo(k, 0);
          x.lineTo(k + H, H);
          x.stroke();
          x.beginPath();
          x.moveTo(k + H, 0);
          x.lineTo(k, H);
          x.stroke();
        }
        x.strokeStyle = "#4a4e54";
        x.lineWidth = 14;
        x.strokeRect(0, 0, W, H);
        x.fillStyle = "#d8c020";
        x.fillRect(W * 0.38, H * 0.44, W * 0.24, H * 0.12);
        x.fillStyle = "#141414";
        x.font = "bold 18px monospace";
        x.textAlign = "center";
        x.fillText("DANGER", W / 2, H * 0.52);
      }),
      transparent: true,
      alphaTest: 0.4,
      side: THREE.DoubleSide,
      metalness: 0.6,
      roughness: 0.5,
    });
    const ff = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.6), ffMat);
    ff.position.set(BX1 + 0.15, 1.3, 19.2);
    ff.rotation.y = Math.PI / 2;
    C.root.add(ff);
    const ffCol = C.col(BX1 - 0.1, 0, 18.2, BX1 + 0.4, 2.6, 20.2, {
      walkable: false,
      tag: "forcefield",
      surface: "metal",
    });
    for (const z of [18.1, 20.3]) {
      b.box(
        "continuity_black",
        BX1 - 0.3,
        0,
        z - 0.12,
        BX1 + 0.6,
        2.8,
        z + 0.12,
      );
      b.box("lamp_blue", BX1 - 0.32, 2.3, z - 0.05, BX1 - 0.28, 2.6, z + 0.05);
    }
    const field = { on: true, col: ffCol, mesh: ff };
    LI.unField = field;
    LI.animators.push({
      cell: C,
      fn: () => {
        ff.visible = field.on;
      },
    });
    LI.setUnField = function (on) {
      if (field.on === !!on) return;
      field.on = !!on;
      if (on) {
        field.col = C.col(BX1 - 0.1, 0, 18.2, BX1 + 0.4, 2.6, 20.2, {
          walkable: false,
          tag: "forcefield",
          surface: "metal",
        });
      } else {
        try {
          G.world.removeCollider(field.col);
        } catch (e) {
          /* */
        }
        field.col = null;
        try {
          G.sfx.play("hum_electric", { pos: C.W(BX1, 1.3, 19.2), volume: 0.6 });
        } catch (e) {
          /* */
        }
      }
    };

    // ==============================================================
    // doors, anchors
    // ==============================================================
    // Follows landmarks_a's `un_hq.anchors.door` (door PLANE with .w/.h, .yaw = the player's yaw looking OUT) as soon as
    // it is published — the way the Woolworth follows `woolworth.door`; until then the surveyed north curtain-glass wall
    // of the GA (z −312.2, doors face north). Everything outside (doors, canopy, checkpoint) is built in a door-local
    // frame (u along the facade, v = metres OUT from it), so a refit with any yaw/position carries the whole surround.
    const UA0 = LI.siteAnchor("un_hq", "door", null),
      UA = UA0 && UA0.w ? UA0 : null; // only a door-PLANE anchor (.w/.h)
    const uYaw = UA ? UA.yaw || 0 : 0,
      uOut = [-Math.sin(uYaw), -Math.cos(uYaw)];
    const FP = UA
      ? { x: UA.x, y: UA.y || 0, z: UA.z }
      : { x: 314, y: 0, z: -312.45 }; // point on the facade plane
    const UF = A.frame(FP.x, FP.z, Math.cos(uYaw), -Math.sin(uYaw), true); // p(u, v): v = out from the wall
    const THR = 0.1; // granite apron / threshold step
    // (surveyed site: the Secretariat's west face (x 314, z ≤ −320) stands 7.8 m north of this wall, so the way in is the
    //  plaza to the north-west — the exit faces out that way, and the checkpoint closes the plaza side)
    const ext = { x: FP.x + uOut[0] * 0.45, z: FP.z + uOut[1] * 0.45 };
    C.door({
      pos: new THREE.Vector3(ext.x, FP.y + 1.3, ext.z),
      label: "UN General Assembly Hall",
      verb: "Enter",
      radius: 1.6,
      target: { x: C.O.x + 0, y: LOBY, z: C.O.z - 41.5, yaw: Math.PI },
      sound: "door_open",
      id: "li_un_in",
    });
    C.door({
      pos: C.W(0, LOBY + 1.3, LZ0 - 0.25),
      label: "United Nations Plaza",
      verb: "Exit",
      radius: 1.5,
      target: {
        x: FP.x + uOut[0] * 2.9,
        y: FP.y + THR,
        z: FP.z + uOut[1] * 2.9,
        yaw: UA ? uYaw : uYaw + 0.58,
      },
      sound: "door_open",
      id: "li_un_out",
    });
    C.anchor("entrance", 0, LOBY, -41.5, Math.PI);
    C.anchor("spawn1", 0, LOBY, -27.5, 0);
    C.anchor("spawn2", -12, TOPY, -14.8, Math.PI);
    C.anchor("spawn3", 4.5, 0.9, 13.6, 0);
    C.anchor("spawn4", 20, 0, 19.2, -Math.PI / 2);
    C.anchor("spawn5", 45, 0, 9.5, Math.PI / 2);
    C.anchor("spawn6", 40, LOBY, -24, Math.PI / 2);
    C.anchor("boss", 37.4, 0, 3.5, -Math.PI / 2);
    C.anchor("officer", 37.4, 0, 3.5, -Math.PI / 2);
    C.anchor("rostrum", 0, 0.9, 13.6, 0);
    C.anchor("booths", Fb.p(6, 3.3)[0], BY, Fb.p(6, 3.3)[1], 0);
    C.anchor("security_council", 38, 0, 12, 0);
    C.anchor("strongroom", 57, 0, 18.5, 0);
    C.anchor("loot1", 47.8, 0, 14.8);
    C.anchor("loot2", Fb.p(14.2, 3.4)[0], BY, Fb.p(14.2, 3.4)[1]);
    C.anchor("loot3", 63.4, 0, 23.2);
    C.anchor("npc1", 37.4, 0, 3.5, -Math.PI / 2);
    C.pickup("li_un_gavel", 1, 0.6, 2.72, 15.5, 0.3);
    C.pickup("li_reel_last_address", 1, -0.2, 2.12, 13.25, 0);
    C.pickup(
      "li_note_interpreter",
      1,
      C.anchors.booth_note.x - C.O.x,
      C.anchors.booth_note.y,
      C.anchors.booth_note.z - C.O.z,
      0,
    );
    C.pickup("li_note_keel_orders", 1, 44.0, 0.8, 15.4, 0.2);
    C.pickup("rally_tonic", 1, 49.2, 1.2, -6.2, 0);
    C.pickup("ammo_gyrojet", 16, 48.9, 1.45, -6.9, 0);
    C.finish();

    // ==============================================================
    // WORLD: the visitors' entrance in the GA's north glass wall (landmarks_a's
    // curtain glass at z −312.2) — bronze doors under a canopy, Continuity checkpoint
    // ==============================================================
    const Wu = LI.cell("un_world", { world: true });
    const wb = Wu.b;
    wb.ambient(0x000000, 0);
    const nb = { noBake: true },
      fy = FP.y,
      fry = UF.ry;
    // oriented box in the door frame: u0..u1 along the facade, v0..v1 out from it, y0..y1 above the paving
    const ub = (key, u0, u1, y0, y1, v0, v1, o) =>
      UF.box(
        Wu,
        key,
        u0,
        u1,
        v0,
        v1,
        fy + y0,
        fy + y1,
        Object.assign({}, nb, o || {}),
      );
    const ucol = (u0, u1, y0, y1, v0, v1, o) =>
      UF.col(
        Wu,
        u0,
        u1,
        v0,
        v1,
        fy + y0,
        fy + y1,
        Object.assign({ walkable: false, surface: "metal" }, o || {}),
      );
    const up = (u, v) => UF.p(u, v);
    // granite apron + threshold step under the canopy (a real level change against the plaza paving)
    ub("granite_black", -4.6, 4.6, 0, THR, 0, 3.7);
    ub("granite", -4.7, 4.7, THR - 0.02, THR, 3.62, 3.78); // light nosing on the step edge
    ucol(-4.6, 4.6, -0.3, THR, 0, 3.7, { walkable: true, surface: "concrete" });
    // door surround + two pairs of bronze doors with glass lights (one leaf of the right pair stands ajar)
    ub("bronze", -2.9, 2.9, THR, 0.12 + THR, 0.02, 0.25);
    for (const s2 of [-1, 1]) {
      ub("bronze", s2 * 2.75 - 0.12, s2 * 2.75 + 0.12, THR, 3.2, 0, 0.2);
      for (const k of [0, 1]) {
        const cu = s2 * (0.66 + k * 1.3),
          ajar = s2 > 0 && k === 0;
        if (ajar) {
          // hinge on the outer edge, swung 70° outwards: a dark gap you can read from across the plaza
          const hu = cu + 0.62,
            a = 0.95,
            du = -Math.cos(a) * 0.62,
            dv = Math.sin(a) * 0.62,
            c = up(hu + du, 0.1 + dv);
          wb.obox(
            "bronze",
            c[0],
            fy + THR + 1.4,
            c[1],
            1.24,
            2.8,
            0.06,
            fry - a,
            nb,
          );
          const cg = up(hu + du * 1.0, 0.1 + dv * 1.0 + 0.04);
          wb.obox(
            "glass_dark",
            cg[0],
            fy + THR + 1.75,
            cg[1],
            0.92,
            1.7,
            0.02,
            fry - a,
            nb,
          );
          ub("black", cu - 0.6, cu + 0.6, THR, 2.85, -0.5, -0.46); // the dark lobby behind the gap
          ub("marble_dark", cu - 0.62, cu + 0.62, THR, THR + 0.02, -0.46, 0.06); // floor seen through it
          continue;
        }
        ub("bronze", cu - 0.62, cu + 0.62, THR + 0.05, 2.85, 0.06, 0.12);
        ub("glass_dark", cu - 0.46, cu + 0.46, 0.9, 2.6, 0.12, 0.14);
        ub(
          "brass",
          cu - s2 * 0.5 - 0.03,
          cu - s2 * 0.5 + 0.03,
          1.0,
          1.6,
          0.16,
          0.22,
        );
      }
    }
    ub("bronze", -2.9, 2.9, 2.85, 3.2, 0, 0.2);
    // the thin cantilevered concrete canopy on two slim steel posts
    ub("concrete", -4.2, 4.2, 3.55, 3.8, 0, 3.4);
    ub("metal_dark", -4.2, 4.2, 3.45, 3.55, 3.3, 3.45);
    for (const s2 of [-1, 1]) {
      const c = up(s2 * 3.8, 3.0);
      wb.cyl("steel", c[0], fy + THR, c[1], 0.07, 0.07, 3.55 - THR, 8, nb);
      ucol(s2 * 3.8 - 0.1, s2 * 3.8 + 0.1, THR, 3.5, 2.9, 3.1);
    }
    for (const du of [-2.4, 0, 2.4])
      ub("lamp_cool", du - 0.25, du + 0.25, 3.5, 3.55, 1.6, 1.9);
    // fascia lettering + Continuity checkpoint board
    const visSign = LI.texMat(
      "un_ga_sign",
      LI.signTex(
        "un_ga_sign",
        ["GENERAL ASSEMBLY", "VISITORS ENTRANCE · ENTRÉE DES VISITEURS"],
        {
          bg: "#d8dcdc",
          fg: "#2e5a86",
          size: 58,
          font: "%spx Georgia, serif",
          wear: 0.5,
        },
        1024,
        128,
      ),
      { rough: 0.7 },
    );
    {
      const c = up(0, 3.32);
      wb.quad(visSign, c[0], fy + 4.22, c[1], 6.4, 0.8, fry + Math.PI, {
        noBake: true,
      });
    }
    ub("metal_dark", -3.25, 3.25, 3.8, 4.66, 3.2, 3.28);
    const ckSign = LI.texMat(
      "un_ck_sign",
      LI.canvasTex(
        "un_ck_sign",
        512,
        512,
        (x, W, H) => {
          x.fillStyle = "#18213a";
          x.fillRect(0, 0, W, H);
          x.fillStyle = "#b08a3a";
          x.fillRect(0, 0, W, 40);
          x.fillRect(0, H - 40, W, 40);
          LI.continuityEmblem(x, W / 2, 170, 95, "#e2d6b4");
          x.fillStyle = "#e2d6b4";
          x.textAlign = "center";
          x.textBaseline = "middle";
          LI.fitText(
            x,
            "CHECKPOINT",
            W / 2,
            320,
            W * 0.86,
            64,
            "bold %spx Georgia, serif",
          );
          LI.fitText(
            x,
            "THE CONTINUITY",
            W / 2,
            380,
            W * 0.86,
            34,
            "bold %spx Georgia, serif",
          );
          LI.fitText(
            x,
            "HALT · PRESENT IDENTITY PAPERS FOR SCREENING",
            W / 2,
            430,
            W * 0.9,
            24,
            "%spx Courier New, monospace",
          );
          LI.wear(x, W, H, 51, 0.4);
        },
        { clamp: true },
      ),
      { rough: 0.6 },
    );
    // A-frame board beside the lane
    {
      const c = up(3.4, 4.32),
        c2 = up(3.4, 4.1);
      wb.obox(ckSign, c[0], fy + 1.05, c[1], 1.0, 1.0, 0.04, fry + Math.PI, {
        rx: 0.18,
        keepUV: true,
        noBake: true,
      });
      wb.obox("metal_dark", c2[0], fy + 0.6, c2[1], 1.0, 1.2, 0.04, fry, {
        rx: 0.18,
        noBake: true,
      });
    }
    ucol(2.85, 3.95, 0, 1.2, 3.9, 4.55);
    // Continuity checkpoint on the plaza side: a red-lit post and a closed barrier arm running back toward the glass,
    // leaving a 2 m screening lane along the facade (the Secretariat closes the other side); the arm has a collider
    {
      const pu = -5.6,
        pv = 5.2;
      ub(
        "continuity_black",
        pu - 0.25,
        pu + 0.25,
        0,
        1.0,
        pv - 0.25,
        pv + 0.25,
      );
      ub("led_red", pu - 0.08, pu + 0.08, 1.0, 1.08, pv - 0.08, pv + 0.08);
      ub("metal_dark", pu - 0.14, pu + 0.14, 0.78, 1.0, pv - 0.42, pv - 0.25); // hinge housing
      {
        const c = up(pu, (pv - 0.3 + 2.1) / 2);
        wb.obox(
          "metal_painted",
          c[0],
          fy + 0.92,
          c[1],
          0.09,
          0.09,
          pv - 0.3 - 2.1,
          fry,
          { c: 0xe8e4d8, noBake: true },
        );
      }
      for (let k = 0; k < 5; k++) {
        const cv = pv - 0.55 - k * 0.55;
        ub("led_red", pu - 0.06, pu + 0.06, 0.87, 0.97, cv - 0.12, cv + 0.12);
      }
      ub("metal_dark", pu - 0.05, pu + 0.05, 0, 0.9, 2.05, 2.15); // arm rest post
      ucol(pu - 0.25, pu + 0.25, 0, 1.0, pv - 0.25, pv + 0.25);
      ucol(pu - 0.06, pu + 0.06, 0, 1.0, 2.1, pv - 0.25);
      {
        const c = up(pu, pv);
        Wu.glow(c[0], fy + 1.12, c[1], 0xff3020, 0.35, {
          dayFactor: 0.15,
          flicker: 0.2,
        });
      }
    }
    // night: the canopy downlights and a red beacon over the checkpoint give the entrance a real pool of light
    {
      const c = up(0, 1.75);
      Wu.glow(c[0], fy + 3.3, c[1], 0xd8ecff, 1.4, {
        fixture: true,
        intensity: 1.3,
        range: 9,
        dayFactor: 0.2,
      });
    }
    Wu.finish();
    return C;
  }

