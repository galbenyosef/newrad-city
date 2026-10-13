// play-inline-245 04 — math
// Lines 930-2732 of readable/play-inline-245.pretty.js (statement-aligned).
  function buildInterior(cell, extAnchors) {
    const O = cell.origin,
      ox = O.x,
      oy = O.y,
      oz = O.z;
    const X = (x) => ox + x,
      Y = (y) => oy + y,
      Z = (z) => oz + z;
    const P = (x, y, z) => V3(ox + x, oy + y, oz + z);
    const A = (x, y, z, yaw) => PR.anchor(ox + x, oy + y, oz + z, yaw || 0);
    const anchors = {};
    const root = cell.root;
    const r = PR.rng("pr_oct_int");
    let b = null;
    const W = (key, ax, a0, a1, f0, f1, y0, y1, gaps, o) =>
      PR.wall(
        b,
        key,
        ax,
        ax === "x" ? X(a0) : Z(a0),
        ax === "x" ? X(a1) : Z(a1),
        ax === "x" ? Z(f0) : X(f0),
        ax === "x" ? Z(f1) : X(f1),
        Y(y0),
        Y(y1),
        (gaps || []).map((g) => ({
          c: ax === "x" ? X(g.c) : Z(g.c),
          w: g.w,
          y0: Y(g.y0),
          h: g.h,
        })),
        o,
      );
    const floor = (key, x0, z0, x1, z1, y, t, o) => {
      b.boxMM(
        key,
        X(x0),
        Y(y - (t || 0.35)),
        Z(z0),
        X(x1),
        Y(y),
        Z(z1),
        o || { grime: 0.5 },
      );
      PR.colMM(X(x0), Y(y - (t || 0.35)), Z(z0), X(x1), Y(y), Z(z1));
    };
    const ceil = (key, x0, z0, x1, z1, y, o) =>
      b.boxMM(
        key,
        X(x0),
        Y(y),
        Z(z0),
        X(x1),
        Y(y + 0.3),
        Z(z1),
        o || { seg: false, grime: 0.3 },
      );
    const box = (key, x, y, z, w, h, d, o) =>
      b.box(key, X(x), Y(y), Z(z), w, h, d, o || { seg: false });
    const col = (x, z, w, d, y0, y1, ry, o) =>
      PR.col(X(x), Z(z), w, d, Y(y0), Y(y1), ry || 0, o || { walkable: false });
    const win = (x, y, z, ry, w, h) => {
      b.quad("win_day", X(x), Y(y), Z(z), w, h, { ry, noAO: true });
      for (let k = 1; k < 5; k++) {
        const lx = -w / 2 + (k * w) / 5;
        b.box(
          "iron",
          X(x + Math.cos(ry) * lx),
          Y(y - h / 2),
          Z(z - Math.sin(ry) * lx),
          0.03,
          h,
          0.03,
          { seg: false },
        );
      }
    };

    // ---------------- baked lights ----------------
    const L = [];
    const Lp = (x, y, z, color, rr, i) =>
      L.push({ x: X(x), y: Y(y), z: Z(z), color, r: rr, i });
    Lp(0, 27, 0, 0xe2e0cc, 34, 0.6); // oculus (neutral grey daylight)
    Lp(0, 3, 0, 0xffd8a8, 9, 0.25); // warm bounce off the checker floor
    Lp(0, 16, 0, 0xd8d8c8, 14, 0.25);
    Lp(-12.5, 3.4, 0, 0xffe0b0, 7, 0.55); // vestibule
    Lp(0, 3.6, -18, 0xffd8a0, 9, 0.35);
    Lp(0, 3.6, -30, 0xffd8a0, 9, 0.28);
    Lp(0, 2.0, -37.5, 0x60ff90, 6, 0.6);
    Lp(0, 3.6, 16, 0xd0e0ff, 10, 0.3);
    Lp(3.2, 0.8, 22, 0x70ff40, 8, 0.75);
    Lp(-3, 3.6, 27, 0xd0e0ff, 8, 0.25);
    Lp(0, 3, 36, 0xffc890, 8, 0.4);
    Lp(0, 8, 36, 0xffc890, 8, 0.35);
    Lp(0, 13, 36, 0xff5030, 8, 0.4);
    Lp(0, 6.9, -17, 0xffc070, 8, 0.7);
    Lp(0, 9, -19, 0xffe0b0, 10, 0.3);
    Lp(0, 8.6, -32, 0xd8e0ff, 10, 0.3);
    Lp(4.5, 6.4, 22, 0x8aa8e0, 7, 0.55);
    Lp(-3, 8.6, 18, 0xd8d0b0, 10, 0.3);
    Lp(0, 13.6, -17, 0xff3020, 9, 0.5);
    Lp(0, 13.6, -31, 0xff3020, 9, 0.45);
    Lp(0, 13.8, 20, 0xf0f8ff, 10, 0.75);
    Lp(-4, 12.2, 26, 0x80a0ff, 6, 0.35);
    Lp(-7, 16.4, 0, 0xffb060, 7, 0.6);
    b = PR.batch("oct_int");
    b.ground = oy;
    b.aoH = 3.2;
    b.setLights(L, 0x8a96a4, 0.08);

    // =============================== ROTUNDA ===============================
    const oct = PR.octPoly(0, 0, IRI);
    // floor (checker marble, a compass rose of the asylum seal) + gallery slabs with the stair well
    const fl = new THREE.Shape();
    oct.forEach((p, i) =>
      i ? fl.lineTo(p[0], -p[1]) : fl.moveTo(p[0], -p[1]),
    );
    const flg = new THREE.ExtrudeGeometry(fl, {
      depth: 0.3,
      bevelEnabled: false,
    });
    flg.rotateX(-HP);
    b.add("checker", flg, { m: PR.m4(X(0), Y(-0.3), Z(0)), grime: 0.5 });
    PR.colMM(X(-IRI), Y(-0.4), Z(-IRI), X(IRI), Y(0), Z(IRI));
    const sealK = PR.texMat(
      "pr_oct_seal",
      PR.canvasTex(
        "pr_oct_seal",
        512,
        512,
        (ctx, w) => {
          ctx.fillStyle = "#1e2224";
          ctx.fillRect(0, 0, w, w);
          ctx.strokeStyle = "#b8b0a0";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 14, 0, TAU);
          ctx.stroke();
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 44, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#b8b0a0";
          ctx.font = "bold 30px Georgia";
          ctx.textAlign = "center";
          const txt = "NEW YORK CITY LUNATIC ASYLUM • BLACKWELL'S ISLAND • ";
          for (let i = 0; i < txt.length; i++) {
            const a = -HP + (i / txt.length) * TAU;
            ctx.save();
            ctx.translate(
              w / 2 + Math.cos(a) * (w / 2 - 30),
              w / 2 + Math.sin(a) * (w / 2 - 30),
            );
            ctx.rotate(a + HP);
            ctx.fillText(txt[i], 0, 10);
            ctx.restore();
          }
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * TAU;
            ctx.beginPath();
            ctx.moveTo(w / 2, w / 2);
            ctx.lineTo(w / 2 + Math.cos(a) * 150, w / 2 + Math.sin(a) * 150);
            ctx.lineTo(
              w / 2 + Math.cos(a + 0.2) * 60,
              w / 2 + Math.sin(a + 0.2) * 60,
            );
            ctx.fill();
          }
          ctx.font = "bold 44px Georgia";
          ctx.fillText("1839", w / 2, w / 2 + 16);
          for (let i = 0; i < 2600; i++) {
            ctx.fillStyle = "rgba(0,0,0," + Math.random() * 0.3 + ")";
            ctx.fillRect(Math.random() * w, Math.random() * w, 3, 3);
          }
        },
        { clamp: true },
      ),
      { rough: 0.5 },
    );
    b.quad(sealK, X(0), Y(0.012), Z(0), 5.4, 5.4, { rx: -HP, grime: 0.4 });
    // gallery slabs (octagon ring with a round well)
    for (const y of [5, 10, 15]) {
      const sh = new THREE.Shape();
      oct.forEach((p, i) =>
        i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1]),
      );
      const hole = new THREE.Path();
      hole.absarc(0, 0, GAL_IN, 0, TAU, true);
      sh.holes.push(hole);
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: 0.35,
        bevelEnabled: false,
        curveSegments: 24,
      });
      g.rotateX(-HP);
      b.add(y === 15 ? "planks" : "planks", g, {
        m: PR.m4(X(0), Y(y - 0.35), Z(0)),
        grime: 0.5,
      });
      // colliders: 16 radial boxes + corner fillers
      for (let k = 0; k < 16; k++) {
        const a = ((k + 0.5) / 16) * TAU,
          rm = (GAL_IN + IAP) / 2 + 0.02;
        PR.col(
          X(Math.cos(a) * rm),
          Z(Math.sin(a) * rm),
          IAP - GAL_IN + 0.05,
          2 * IAP * Math.tan(PI / 16) + 0.1,
          Y(y - 0.4),
          Y(y),
          -a,
          { surface: "wood" },
        );
      }
      for (let k = 0; k < 8; k++) {
        const a = PI / 8 + (k * PI) / 4;
        PR.col(
          X(Math.cos(a) * (IRI - 0.7)),
          Z(Math.sin(a) * (IRI - 0.7)),
          1.4,
          1.4,
          Y(y - 0.4),
          Y(y),
          -a,
          { surface: "wood" },
        );
      }
      // cast-iron railing on the inner edge (gap at the stair arrival, angles -40°..+6°)
      const n = 48;
      for (let k = 0; k < n; k++) {
        const a0 = (k / n) * TAU,
          a1 = ((k + 1) / n) * TAU;
        const am = (a0 + a1) / 2;
        const rel = ((am + PI) % TAU) - PI;
        if (rel > -0.72 && rel < 0.1) continue;
        const p0 = [
            Math.cos(a0) * (GAL_IN + 0.08),
            Math.sin(a0) * (GAL_IN + 0.08),
          ],
          p1 = [Math.cos(a1) * (GAL_IN + 0.08), Math.sin(a1) * (GAL_IN + 0.08)];
        b.beam(
          "iron",
          P(p0[0], y + 1.0, p0[1]),
          P(p1[0], y + 1.0, p1[1]),
          0.06,
          0.05,
        );
        b.beam(
          "iron",
          P(p0[0], y + 0.12, p0[1]),
          P(p1[0], y + 0.12, p1[1]),
          0.04,
          0.04,
        );
        for (let q = 0; q < 3; q++) {
          const t = q / 3,
            aa = a0 + (a1 - a0) * t;
          box(
            "iron",
            Math.cos(aa) * (GAL_IN + 0.08),
            y,
            Math.sin(aa) * (GAL_IN + 0.08),
            0.03,
            1.0,
            0.03,
          );
        }
        PR.colWall(
          X(p0[0]),
          Z(p0[1]),
          X(p1[0]),
          Z(p1[1]),
          0.12,
          Y(y - 0.2),
          Y(y + 1.05),
          { walkable: false, surface: "metal" },
        );
      }
      // gallery fascia with a Greek-key band
      b.cyl(
        "plaster_w",
        X(0),
        Y(y - 0.75),
        Z(0),
        GAL_IN + 0.02,
        GAL_IN + 0.02,
        0.4,
        32,
        { hSeg: 1, open: true },
      );
    }
    // rotunda walls: 8 faces, openings N/S (three levels), W (entrance)
    const faceLen = 2 * IRI * Math.sin(PI / 8) + 0.9;
    const doorGaps = [
      { c: 0, w: 2.2, y0: 0, h: 3.0 },
      { c: 0, w: 2.2, y0: 5, h: 2.8 },
      { c: 0, w: 2.2, y0: 10, h: 2.8 },
    ];
    W(
      "plaster_w",
      "x",
      -faceLen / 2,
      faceLen / 2,
      -IAP - 0.8,
      -IAP,
      0,
      22,
      doorGaps,
      { grime: 0.5 },
    );
    W(
      "plaster_w",
      "x",
      -faceLen / 2,
      faceLen / 2,
      IAP,
      IAP + 0.8,
      0,
      22,
      doorGaps,
      { grime: 0.5 },
    );
    W(
      "plaster_w",
      "z",
      -faceLen / 2,
      faceLen / 2,
      -IAP - 0.8,
      -IAP,
      0,
      22,
      [
        { c: 0, w: 2.4, y0: 0, h: 3.2 },
        { c: 0, w: 1.4, y0: 6.2, h: 2.4 },
        { c: 0, w: 1.4, y0: 11.2, h: 2.4 },
      ],
      { grime: 0.5 },
    );
    W(
      "plaster_w",
      "z",
      -faceLen / 2,
      faceLen / 2,
      IAP,
      IAP + 0.8,
      0,
      22,
      [
        { c: 0, w: 1.4, y0: 1.2, h: 2.4 },
        { c: 0, w: 1.4, y0: 6.2, h: 2.4 },
        { c: 0, w: 1.4, y0: 11.2, h: 2.4 },
        { c: 0, w: 1.4, y0: 16.2, h: 2.4 },
      ],
      { grime: 0.5 },
    );
    for (const [x, y] of [
      [IAP + 0.45, 2.4],
      [IAP + 0.45, 7.4],
      [IAP + 0.45, 12.4],
      [IAP + 0.45, 17.4],
      [-IAP - 0.45, 7.4],
      [-IAP - 0.45, 12.4],
    ])
      win(x, y, 0, x > 0 ? -HP : HP, 1.4, 2.4);
    for (let k = 0; k < 4; k++) {
      const th = PI / 4 + (k * PI) / 2;
      const cx = Math.cos(th) * (IAP + 0.4),
        cz = Math.sin(th) * (IAP + 0.4);
      b.box("plaster_w", X(cx), Y(0), Z(cz), 0.8, 22, faceLen, {
        ry: -th,
        grime: 0.5,
        segLen: 4,
      });
      col(cx, cz, 0.8, faceLen, 0, 22, -th);
      // tall windows on the diagonal faces (one per level)
      for (const y of [2.2, 7.2, 12.2, 17.2]) {
        const wx = Math.cos(th) * (IAP - 0.02),
          wz = Math.sin(th) * (IAP - 0.02);
        b.quad("win_day", X(wx), Y(y), Z(wz), 1.2, 2.3, {
          ry: Math.atan2(-Math.cos(th), -Math.sin(th)),
          noAO: true,
        });
      }
    }
    // institutional two-tone paint: dark green-brown dado with a picture rail on every level (light plaster above)
    {
      const fl2 = 2 * IAP * Math.tan(PI / 8),
        DH = 1.15;
      for (let k = 0; k < 8; k++) {
        const th = (k * PI) / 4,
          nx = -Math.cos(th),
          nz = -Math.sin(th),
          tx = -Math.sin(th),
          tz = Math.cos(th);
        const ry = Math.atan2(nx, nz),
          axisDoor = k === 2 || k === 6; // k 2/6 = ±Z faces: doors on 3 levels
        for (const y of LV) {
          const door = (axisDoor && y < 15) || (k === 4 && y === 0);
          const dw = k === 4 ? 2.4 : 2.2;
          const segs = door
            ? [
                [-fl2 / 2, -dw / 2 - 0.05],
                [dw / 2 + 0.05, fl2 / 2],
              ]
            : [[-fl2 / 2, fl2 / 2]];
          for (const [u0, u1] of segs) {
            const uc = (u0 + u1) / 2,
              w = u1 - u0;
            if (w < 0.3) continue;
            const px = Math.cos(th) * (IAP - 0.025) + tx * uc,
              pz = Math.sin(th) * (IAP - 0.025) + tz * uc;
            b.quad("dado", X(px), Y(y + DH / 2), Z(pz), w, DH, {
              ry,
              grime: 0.5,
              uv: "box",
            });
            b.box(
              "oak",
              X(px + nx * 0.02),
              Y(y + DH),
              Z(pz + nz * 0.02),
              w,
              0.07,
              0.05,
              { ry, seg: false },
            );
          }
        }
      }
    }
    // wainscot + corner pilasters with capitals at each gallery
    for (let k = 0; k < 8; k++) {
      const a = PI / 8 + (k * PI) / 4,
        x = Math.cos(a) * (IRI - 0.25),
        z = Math.sin(a) * (IRI - 0.25);
      box("limestone", x, 0, z, 0.55, 20, 0.55, {
        ry: -a,
        seg: false,
        grime: 0.4,
      });
      for (const y of [4.3, 9.3, 14.3, 19.3])
        box("limestone", x, y, z, 0.8, 0.35, 0.8, { ry: -a, seg: false });
    }
    // dome (inner shell) + oculus + drum ring
    for (let k = 0; k < 8; k++) {
      const th = (k * PI) / 4;
      b.box(
        "limestone",
        X(Math.cos(th) * (IAP - 0.3)),
        Y(20),
        Z(Math.sin(th) * (IAP - 0.3)),
        0.9,
        0.55,
        faceLen,
        { ry: -th, seg: false, grime: 0.4 },
      );
    }
    const dprof = [
      [1.7, 8.2],
      [2.8, 7.9],
      [4.3, 7.2],
      [5.8, 6.0],
      [7.2, 4.4],
      [8.3, 2.6],
      [9.2, 0.9],
      [9.6, 0],
    ];
    b.lathe("plaster_w", dprof, 16, X(0), Y(20.5), Z(0), { grime: 0.6 });
    b.lathe("plaster_w", dprof.slice().reverse(), 16, X(0), Y(20.5), Z(0), {
      grime: 0.6,
    }); // both windings: visible from any side
    for (let k = 0; k < 8; k++) {
      const phi = PI / 8 + (k * PI) / 4,
        sx = Math.sin(phi),
        sz = Math.cos(phi);
      for (let i = 0; i < dprof.length - 1; i++) {
        const p = dprof[i],
          q = dprof[i + 1];
        b.beam(
          "limestone",
          P(sx * (p[0] - 0.05), 20.5 + p[1], sz * (p[0] - 0.05)),
          P(sx * (q[0] - 0.05), 20.5 + q[1], sz * (q[0] - 0.05)),
          0.22,
          0.18,
        );
      }
    }
    b.add("limestone", new THREE.TorusGeometry(1.75, 0.18, 6, 24), {
      m: PR.m4(X(0), Y(28.7), Z(0), 0, HP),
    });
    b.add("oculus", new THREE.CircleGeometry(1.7, 20), {
      m: PR.m4(X(0), Y(29.2), Z(0), 0, HP),
      uv: "box",
      noAO: true,
    });
    PR.lightShaft(root, X(0), Y(29), Z(0), 1.6, 5.2, 29, 0xe8e4d0, 0.03);
    PR.glow(P(0, 28.6, 0), 0xd8f0c8, 5, root, { intensity: 0.9 });
    // hanging chain + dead chandelier ring in the well
    b.beam("iron", P(0, 28.5, 0), P(0, 17, 0), 0.04, 0.04);
    b.add("brass", new THREE.TorusGeometry(1.2, 0.06, 5, 16), {
      m: PR.m4(X(0), Y(17), Z(0), 0, HP),
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      b.sphere(
        "glass_broken",
        X(Math.cos(a) * 1.2),
        Y(17.15),
        Z(Math.sin(a) * 1.2),
        0.08,
        { ws: 5, hs: 4 },
      );
    }

    // ---- THE SPIRAL STAIR (three full turns of cantilevered stone treads, iron stringer, balustrade) ----
    // Colliders from PR.spiral (visual off); the treads are built here as individual stone blocks with a
    // marble nosing plate so that from the rotunda floor the underside reads as a stepped, cantilevered helix
    // (not a smooth ramp), with a dark cast-iron inner stringer and a mahogany handrail on iron balusters.
    PR.spiral(
      b,
      "marble",
      X(0),
      Z(0),
      Y(0),
      STAIR.rIn,
      STAIR.rOut,
      STAIR.a0,
      3,
      5,
      STAIR.per,
      { noVisual: true, rail: "iron", railH: 1.0 },
    );
    {
      const per = STAIR.per,
        n = 3 * per,
        da = TAU / per,
        dy = 5 / per,
        rI = STAIR.rIn,
        rO = STAIR.rOut;
      const sector = (r0, r1, aA, aB) => {
        const sh = new THREE.Shape();
        sh.moveTo(Math.cos(aA) * r0, Math.sin(aA) * r0);
        sh.lineTo(Math.cos(aA) * r1, Math.sin(aA) * r1);
        sh.absarc(0, 0, r1, aA, aB, false);
        sh.lineTo(Math.cos(aB) * r0, Math.sin(aB) * r0);
        sh.absarc(0, 0, r0, aB, aA, true);
        return sh;
      };
      // one tread block (local: centred on angle 0), reused for every step through its matrix
      const blockH = dy + 0.16;
      const gBlock = new THREE.ExtrudeGeometry(
        sector(rI, rO - 0.06, -da / 2 - 0.01, da / 2 + 0.01),
        { depth: blockH, bevelEnabled: false, curveSegments: 2 },
      );
      gBlock.rotateX(HP);
      gBlock.translate(0, blockH, 0);
      const plateH = 0.06;
      const gPlate = new THREE.ExtrudeGeometry(
        sector(rI - 0.03, rO + 0.02, -da / 2 - 0.01, da / 2 + 0.05),
        { depth: plateH, bevelEnabled: false, curveSegments: 2 },
      );
      gPlate.rotateX(HP);
      gPlate.translate(0, plateH, 0);
      const rr = PR.rng("oct_stair");
      for (let i = 0; i < n; i++) {
        const a = STAIR.a0 + da * (i + 0.5),
          top = dy * (i + 1);
        const broken = i === 23 || i === 41; // two treads cracked off at the nosing
        b.add("limestone", gBlock.clone(), {
          m: PR.m4(X(0), Y(top - blockH - plateH + 0.001), Z(0), -a),
          grime: 0.5,
        });
        b.add(broken ? "marble_dark" : "marble", gPlate.clone(), {
          m: PR.m4(X(0), Y(top - plateH), Z(0), -a, 0, broken ? 0.02 : 0),
          grime: 0.35,
        });
        // balusters: two per tread on the inner edge (every fourth one a heavier turned post)
        for (const f of [0.25, 0.75]) {
          const aa = STAIR.a0 + da * (i + f),
            yb = top;
          const heavy = (i * 2 + (f > 0.5 ? 1 : 0)) % 4 === 0;
          if (i === 41 && f > 0.5) continue; // a missing baluster
          b.box(
            "iron",
            X(Math.cos(aa) * (rI + 0.1)),
            Y(yb),
            Z(Math.sin(aa) * (rI + 0.1)),
            heavy ? 0.05 : 0.022,
            0.98 + f * dy,
            heavy ? 0.05 : 0.022,
            { ry: -aa, seg: false, noAO: true },
          );
        }
        // handrail (mahogany cap on an iron core) and the lower iron rail
        const a1 = STAIR.a0 + da * i,
          a2 = a1 + da,
          y1 = dy * i + dy * 0.5,
          y2 = y1 + dy;
        const hp = (aa, y, rad, h) =>
          P(Math.cos(aa) * rad, y + h, Math.sin(aa) * rad);
        b.beam(
          "mahogany",
          hp(a1, y1 + 0.5 * dy, rI + 0.1, 1.0),
          hp(a2, y2 + 0.5 * dy, rI + 0.1, 1.0),
          0.09,
          0.06,
          { grime: 0.2 },
        );
        b.beam(
          "iron",
          hp(a1, y1 + 0.5 * dy, rI + 0.1, 0.16),
          hp(a2, y2 + 0.5 * dy, rI + 0.1, 0.16),
          0.03,
          0.03,
        );
        // a little debris on a few treads
        if (rr() < 0.12)
          b.box(
            "rubble",
            X(Math.cos(a) * (rI + 0.8 + rr() * 1.2)),
            Y(top),
            Z(Math.sin(a) * (rI + 0.8 + rr() * 1.2)),
            0.25,
            0.08,
            0.2,
            { ry: rr() * 3, seg: false },
          );
      }
      // cast-iron stringers: inner (tall, with a moulded top) and a slim outer fascia — both follow the helix
      const ribbon = (key, rad, hTop, hBot, flip) => {
        const pos = [],
          idx = [];
        for (let i = 0; i <= n * 2; i++) {
          const a = STAIR.a0 + (i / (per * 2)) * TAU,
            y = (i * dy) / 2;
          pos.push(
            Math.cos(a) * rad,
            y + hTop,
            Math.sin(a) * rad,
            Math.cos(a) * rad,
            y - hBot,
            Math.sin(a) * rad,
          );
          if (i < n * 2) {
            const q = i * 2;
            if (flip) idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3);
            else idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2);
          }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        b.add(key, g, { m: PR.m4(X(0), Y(0), Z(0)), grime: 0.3, noAO: true });
      };
      ribbon("iron", rI - 0.04, 0.04, 0.62, false);
      ribbon("iron", rI - 0.04, 0.04, 0.62, true); // both faces
      ribbon("iron", rO - 0.05, -0.02, 0.34, false);
      ribbon("iron", rO - 0.05, -0.02, 0.34, true);
      ribbon("limestone", rI - 0.07, 0.08, -0.02, false); // moulded cap line
    }
    // newel post at the foot of the stair
    box(
      "oak",
      Math.cos(STAIR.a0 + 0.05) * (STAIR.rIn + 0.1),
      0,
      Math.sin(STAIR.a0 + 0.05) * (STAIR.rIn + 0.1),
      0.3,
      1.3,
      0.3,
    );
    b.sphere(
      "brass",
      X(Math.cos(STAIR.a0 + 0.05) * (STAIR.rIn + 0.1)),
      Y(1.4),
      Z(Math.sin(STAIR.a0 + 0.05) * (STAIR.rIn + 0.1)),
      0.16,
      {},
    );
    // rotunda dressing: toppled benches, gurneys, a fallen chandelier, dead patients, papers
    D.papers(b, X(0), Y(0.01), Z(0), 7, 50, 1839);
    for (const [x, z, a] of [
      [-6.5, 4, 0.3],
      [6.2, -5.6, 2.2],
      [-3.5, -7.4, -1.1],
    ])
      PR.skeleton(b, X(x), Y(0.02), Z(z), a);
    PR.wheelchair(b, X(-6.8), Y(0), Z(-3.6), 0.6, true);
    PR.bed(b, X(6.4), Y(0), Z(5.4), 2.4, {
      mattress: true,
      sheet: "canvas_w",
      skeleton: false,
    });
    D.rubble(b, X(3.2), Y(0), Z(7.6), 1.0, 6, 55);
    for (let k = 0; k < 4; k++)
      D.chair(
        b,
        X(-7.6 + k * 0.9),
        Y(15),
        Z(-2.4 + k * 0.4),
        k * 0.7,
        k % 2 === 0,
        "oak",
      );
    const graf2 = PR.texMat(
      "pr_oct_graf2",
      PR.graffitiTex(
        "pr_oct_graf2",
        ["ROUND AND", "ROUND AND", "ROUND"],
        512,
        512,
        { color: "#8a1a10" },
      ),
      { transparent: true },
    );
    b.quad(graf2, X(0), Y(7.5), Z(IAP - 0.02), 2.6, 2.6, { ry: PI });
    const graf3 = PR.texMat(
      "pr_oct_graf3",
      PR.graffitiTex("pr_oct_graf3", ["HE IS", "UPSTAIRS"], 512, 512, {
        color: "#9a2014",
      }),
      { transparent: true },
    );
    b.quad(graf3, X(-IAP + 0.02), Y(12.6), Z(2.3), 2.0, 2.0, { ry: HP });
    anchors.rotunda = A(-4, 0, 0, -HP);
    anchors.spawn1 = A(6.5, 0, -2, HP);
    anchors.stair_foot = A(Math.cos(STAIR.a0) * 4.1 - 0.8, 0, -0.9, 0);

    // ---- vestibule & admissions (x -16..-9.85) ----
    floor("checker", -16.4, -3.4, -IAP - 0.8, 3.4, 0);
    W("gneiss_dk", "z", -3.4, 3.4, -16.8, -16.2, 0, 4.6);
    W("plaster_w", "x", -16.8, -IAP - 0.7, -3.9, -3.3, 0, 4.6);
    W("plaster_w", "x", -16.8, -IAP - 0.7, 3.3, 3.9, 0, 4.6);
    ceil("plaster_w", -16.8, -3.9, -IAP - 0.7, 3.9, 4.4);
    box("oak", -14.2, 0, -2.3, 3.2, 1.1, 0.9);
    col(-14.2, -2.3, 3.2, 0.9, 0, 1.1);
    box("oak", -14.2, 1.1, -2.3, 3.4, 0.06, 1.05);
    D.papers(b, X(-14.2), Y(1.17), Z(-2.3), 1.1, 8, 7);
    D.monitor(b, X(-13.4), Y(1.16), Z(-2.5), 0, false);
    b.box("brass", X(-15.3), Y(1.16), Z(-2.1), 0.14, 0.05, 0.14, {
      seg: false,
    }); // service bell
    for (let k = 0; k < 3; k++)
      D.chair(b, X(-15.4 + k * 1.1), Y(0), Z(2.7), PI, k === 1, "oak");
    b.quad("oak", X(-16.18), Y(1.6), Z(0), 1.8, 3.1, { ry: HP }); // front door (inside)
    const admK = PR.texMat(
      "pr_oct_adm",
      PR.signTex(
        "pr_oct_adm",
        ["ADMISSIONS", "ALL PATIENTS MUST BE ACCOMPANIED"],
        "enamel",
        512,
        128,
        { bg: "#1c2a2a", fg: "#e0d8b8" },
      ),
    );
    b.quad(admK, X(-14.2), Y(3.3), Z(-3.28), 2.2, 0.55, {});
    PR.door({
      id: "pr_oct_exit",
      pos: P(-15.9, 1.6, 0),
      label: "Blackwell's Island",
      verb: "Exit",
      radius: 1.4,
      target: {
        x: extAnchors.entrance.x,
        y: 0.05,
        z: extAnchors.entrance.z,
        yaw: HP,
      },
    });
    anchors.entrance = A(-14.4, 0, 0, -HP);
    anchors.admissions = A(-14.2, 1.17, -2.3, 0);

    // ---------------- helper to build one wing level ----------------
    // wings run along z from the rotunda face (|z| = IAP+0.8) out to |z| = 40, x -7..7
    const WZ0 = IAP + 0.8,
      WZ1 = 40.5;
    const S = (sgn, z) => sgn * z; // mirror helper (north wing: sgn -1)
    function wingShell(sgn) {
      // outer walls (both long sides), end wall, throat walls, floors & ceilings
      const za = S(sgn, WZ0),
        zb = S(sgn, WZ1);
      const z0 = Math.min(za, zb),
        z1 = Math.max(za, zb);
      for (const [x0, x1] of [
        [-7.6, -7],
        [7, 7.6],
      ])
        W("plaster_w", "z", z0, z1, x0, x1, 0, 15.4, [], { grime: 0.55 });
      W(
        "gneiss_dk",
        "x",
        -7.6,
        7.6,
        sgn < 0 ? z0 - 0.6 : z1,
        sgn < 0 ? z0 : z1 + 0.6,
        0,
        15.4,
        [],
        {},
      );
      // throat (2.2 m wide corridor from the rotunda doorway to the rooms)
      const tz0 = S(sgn, WZ0),
        tz1 = S(sgn, 12);
      for (const lv of [0, 5, 10]) {
        // throat side walls + partition at |z| = 12 with a doorway
        for (const sx of [-1, 1])
          W(
            "plaster_w",
            "z",
            Math.min(tz0, tz1),
            Math.max(tz0, tz1),
            sx * 1.1 - (sx > 0 ? 0 : 0.3),
            sx * 1.1 + (sx > 0 ? 0.3 : 0),
            lv,
            lv + 4.65,
            [],
            {},
          );
        W(
          "plaster_w",
          "x",
          -7,
          -1.1,
          Math.min(S(sgn, 12), S(sgn, 12.3)),
          Math.max(S(sgn, 12), S(sgn, 12.3)),
          lv,
          lv + 4.65,
          [],
          {},
        );
        W(
          "plaster_w",
          "x",
          1.1,
          7,
          Math.min(S(sgn, 12), S(sgn, 12.3)),
          Math.max(S(sgn, 12), S(sgn, 12.3)),
          lv,
          lv + 4.65,
          [],
          {},
        );
        b.boxMM(
          "plaster_w",
          X(-1.1),
          Y(lv + 3.0),
          Z(Math.min(S(sgn, 12), S(sgn, 12.3))),
          X(1.1),
          Y(lv + 4.65),
          Z(Math.max(S(sgn, 12), S(sgn, 12.3))),
          { seg: false },
        );
        floor(
          lv === 0 ? "checker" : "planks",
          -1.1,
          Math.min(tz0, tz1),
          1.1,
          Math.max(tz0, tz1),
          lv,
          0.35,
        );
        ceil(
          "plaster_w",
          -1.1,
          Math.min(tz0, tz1),
          1.1,
          Math.max(tz0, tz1),
          lv + 4.1,
        );
      }
    }
    wingShell(-1);
    wingShell(1);

    // ============================ NORTH WING ============================
    // ---- L0: Women's Ward A (z -12.3..-35) + night-nurse station (z -35..-40) ----
    floor("checker", -7, -40, 7, -12.3, 0);
    ceil("plaster_w", -7, -40, 7, -12.3, 4.6);
    for (let z = -15.2; z > -34; z -= 3.6) {
      for (const sx of [-1, 1]) {
        const i = Math.round(-z);
        PR.bed(b, X(sx * 5.2), Y(0), Z(z), sx > 0 ? -HP : HP, {
          skeleton: (i * 7 + sx) % 5 === 0,
          straps: (i + sx) % 3 === 0,
          tilt: r() - 0.5,
        });
        win(sx * 6.98, 2.5, z, sx > 0 ? -HP : HP, 1.2, 2.2);
      }
    }
    for (let z = -16; z > -34; z -= 6)
      D.fluoro(b, X(0), Y(4.2), Z(z), 0, 2.4, z % 12 === -4, Y(4.65));
    PR.wheelchair(b, X(1.2), Y(0), Z(-26), 2.2, false);
    D.papers(b, X(0), Y(0.01), Z(-24), 4, 18, 21);
    const wardK = PR.texMat(
      "pr_oct_wardA",
      PR.signTex(
        "pr_oct_wardA",
        ["WARD A — FEMALE", "QUIET PLEASE"],
        "enamel",
        512,
        128,
        { bg: "#e0d8c0", fg: "#1a2a3a" },
      ),
    );
    b.quad(wardK, X(0), Y(3.6), Z(-12.36), 2.0, 0.5, { ry: PI });
    // nurse station
    W("plaster_w", "x", -7, 7, -35.3, -35, 0, 4.65, [
      { c: 0, w: 2.0, y0: 0, h: 2.6 },
      { c: -4, w: 2.6, y0: 1.1, h: 1.2 },
    ]);
    box("enamel_w", -4, 0, -35.8, 3.0, 1.05, 0.6);
    col(-4, -35.8, 3.0, 0.6, 0, 1.05);
    box("panel", 4.6, 0, -39.4, 3.4, 2.0, 0.6);
    col(4.6, -39.4, 3.4, 0.6, 0, 2.0); // medicine cabinet wall
    for (let k = 0; k < 6; k++)
      b.cyl(
        k % 2 ? "glass_dark" : "paint_cream",
        X(3.2 + k * 0.5),
        Y(1.3),
        Z(-39.1),
        0.05,
        0.05,
        0.16,
        6,
        { hSeg: 1 },
      );
    D.chair(b, X(-4), Y(0), Z(-37), 0.2, false, "steel");
    PR.skeleton(b, X(-2.2), Y(0.02), Z(-38.2), 1.9);
    anchors.nurse_terminal = A(-5.2, 1.05, -35.9, PI);
    anchors.nurse_desk = A(-3.2, 1.07, -35.8, 0);
    anchors.nurse_aid = A(4.6, 1.4, -39.0, 0);
    anchors.ward = A(0, 0, -22, 0);
    anchors.ward_bed = A(-5.2, 0, -29.6, 0);
    anchors.spawn2 = A(2.5, 0, -28, 0);

    // ---- L1: Superintendent's office (z -12.3..-25) + records (z -25..-40) ----
    floor("carpet", -7, -25, 7, -12.3, 5);
    floor("planks", -7, -40, 7, -25, 5);
    ceil("plaster_w", -7, -40, 7, -12.3, 9.6);
    W("oak", "x", -7, 7, -25.3, -25, 5, 9.65, [
      { c: 3, w: 1.6, y0: 5, h: 2.5 },
    ]);
    // wood panelling, bookcases, desk, diplomas, display case (the Orbitoclast)
    for (const sx of [-1, 1])
      b.boxMM(
        "oak",
        X(sx * 6.98 - (sx > 0 ? 0.04 : 0)),
        Y(5),
        Z(-25),
        X(sx * 6.98 + (sx > 0 ? 0 : 0.04)),
        Y(6.3),
        Z(-12.3),
        { seg: false },
      );
    win(-6.97, 7.5, -18.5, HP, 1.4, 2.2);
    win(6.97, 7.5, -18.5, -HP, 1.4, 2.2);
    for (const z of [-14, -16.2, -20.8, -23]) {
      D.shelf(b, X(-6.6), Y(5), Z(z), HP, 2.0, 4, Math.round(-z * 3));
      col(-6.6, z, 0.5, 2.0, 5, 7.2);
    }
    box("mahogany", 0, 5, -17.5, 2.6, 0.8, 1.2);
    col(0, -17.5, 2.6, 1.2, 5, 5.8);
    box("mahogany", 0, 5.8, -17.5, 2.8, 0.06, 1.35);
    D.papers(b, X(0.6), Y(5.87), Z(-17.4), 0.8, 8, 44);
    b.cyl("brass", X(-0.9), Y(5.86), Z(-17.8), 0.1, 0.14, 0.05, 8, { hSeg: 1 });
    b.cyl("brass", X(-0.9), Y(5.9), Z(-17.8), 0.015, 0.015, 0.4, 4, {
      hSeg: 1,
    });
    b.cyl("lamp_warm", X(-0.9), Y(6.3), Z(-17.8), 0.08, 0.2, 0.18, 8, {
      hSeg: 1,
    });
    PR.glow(P(-0.9, 6.35, -17.8), 0xffc070, 1.2, root, {
      intensity: 0.9,
      flicker: 0.1,
    });
    D.chair(b, X(0), Y(5), Z(-18.6), PI, false, "mahogany");
    D.chair(b, X(-0.8), Y(5), Z(-15.8), 0.3, false, "mahogany");
    D.chair(b, X(0.9), Y(5), Z(-15.9), -0.4, true, "mahogany");
    for (let k = 0; k < 3; k++)
      D.painting(b, k + 1, X(-2.4 + k * 2.4), Y(7.8), Z(-24.98), 1.0, 0.8, 0);
    // display case
    box("mahogany", 4.8, 5, -14.2, 1.8, 0.9, 0.7);
    col(4.8, -14.2, 1.8, 0.7, 5, 6.1);
    b.boxMM(
      "glass_broken",
      X(3.95),
      Y(5.9),
      Z(-14.5),
      X(5.65),
      Y(6.1),
      Z(-13.9),
      { seg: false },
    );
    box("velvet", 4.8, 5.9, -14.2, 1.6, 0.03, 0.55);
    const certK = PR.texMat(
      "pr_oct_cert",
      PR.signTex(
        "pr_oct_cert",
        [
          "CERTIFICATE OF MERIT",
          "Dr. C. HARROW",
          "TRANSORBITAL LEUCOTOMY — 500 PROCEDURES",
          "Civil Defense Mental Hygiene Division",
        ],
        "engraved",
        512,
        320,
        { bg: "#e8dcb8" },
      ),
    );
    b.quad(certK, X(4.8), Y(7.4), Z(-12.4), 1.2, 0.75, { ry: PI });
    anchors.office = A(0, 5, -16, 0);
    anchors.office_terminal = A(0.7, 5.86, -17.9, 0);
    anchors.orbitoclast = A(4.8, 5.95, -14.2, 0);
    anchors.office_safe = A(5.9, 5, -23.8, -HP);
    // records room: rows of steel file cabinets
    for (let x = -5; x <= 5; x += 2.5) {
      for (let z = -27; z > -39; z -= 0.75)
        box("steel", x, 5, z, 0.7, 1.5, 0.62, { seg: false, grime: 0.6 });
      col(x, -33, 0.7, 12.2, 5, 6.5);
    }
    D.papers(b, X(0), Y(5.01), Z(-33), 5, 30, 71);
    PR.skeleton(b, X(1.3), Y(5.02), Z(-36), 0.4);
    for (let z = -28; z > -39; z -= 5)
      D.fluoro(b, X(0), Y(9.2), Z(z), 0, 2.4, z === -33, Y(9.65));
    anchors.records = A(0, 5, -32, 0);
    anchors.spawn4 = A(-3.8, 5, -31, 0);

    // ---- L2: "The Lodge" — padded isolation cells ----
    floor("checker", -7, -40, 7, -12.3, 10);
    ceil("plaster_w", -7, -40, 7, -12.3, 14.6);
    // corridor x -1.5..1.5; cells on both sides, 5 per side
    const lodgeCells = [];
    for (let i = 0; i < 5; i++) {
      const zc = -15 - i * 5.1;
      for (const sx of [-1, 1]) {
        const num = i * 2 + (sx > 0 ? 1 : 2);
        const xa = sx * 1.5,
          xb = sx * 7;
        // cell walls (padded inside)
        W(
          "plaster_w",
          "x",
          Math.min(xa, xb),
          Math.max(xa, xb),
          zc - 2.55,
          zc - 2.4,
          10,
          14.65,
          [],
          {},
        );
        W(
          "plaster_w",
          "z",
          zc - 2.4,
          zc + 2.4,
          sx > 0 ? 1.5 : -1.8,
          sx > 0 ? 1.8 : -1.5,
          10,
          14.65,
          [{ c: zc + 1.2, w: 1.1, y0: 10, h: 2.3 }],
          {},
        );
        b.boxMM(
          "padded",
          X(Math.min(xa, xb) + (sx > 0 ? 0.3 : 0.05)),
          Y(10),
          Z(zc - 2.38),
          X(Math.max(xa, xb) - (sx > 0 ? 0.05 : 0.3)),
          Y(13.2),
          Z(zc - 2.3),
          { seg: false, grime: 0.6 },
        );
        b.boxMM(
          "padded",
          X(sx > 0 ? 6.95 : -7.0),
          Y(10),
          Z(zc - 2.3),
          X(sx > 0 ? 7.0 : -6.95),
          Y(13.2),
          Z(zc + 2.3),
          { seg: false, grime: 0.6 },
        );
        lodgeCells.push({ num, zc, sx });
        const cellK = PR.texMat(
          "pr_oct_cell" + num,
          PR.signTex("pr_oct_cell" + num, [String(num)], "enamel", 128, 128, {
            bg: "#d8d0b8",
            fg: "#1a1a1a",
          }),
        );
        b.quad(cellK, X(sx * 1.47), Y(12.8), Z(zc + 1.2), 0.3, 0.3, {
          ry: sx > 0 ? -HP : HP,
        });
        // door leaf: open (swung in) or shut (solid + collider)
        const shut = num === 3 || num === 8;
        if (shut) {
          box("steel", sx * 1.65, 10, zc + 1.2, 0.08, 2.3, 1.1);
          col(sx * 1.65, zc + 1.2, 0.15, 1.1, 10, 12.3);
          box("glass_dark", sx * 1.6, 11.6, zc + 1.2, 0.04, 0.2, 0.4);
        } else if (num !== 6)
          box("steel", sx * 2.1, 10, zc + 1.9, 0.08, 2.3, 1.1, {
            ry: sx * 1.2,
            seg: false,
          });
        win(sx * 6.94, 12.6, zc - 0.6, sx > 0 ? -HP : HP, 0.5, 0.6);
      }
    }
    // cell contents: bed frames, restraints, scratches, a skeleton in a straitjacket, the locked cell 6
    for (const c of lodgeCells) {
      if (c.num % 3 !== 0)
        PR.bed(b, X(c.sx * 5.2), Y(10), Z(c.zc - 0.4), 0, {
          straps: true,
          skeleton: c.num === 5,
        });
      if (c.num === 7) {
        PR.skeleton(b, X(c.sx * 4.5), Y(10.02), Z(c.zc + 0.5), 0.8);
        b.box(
          "canvas_w",
          X(c.sx * 4.5),
          Y(10.05),
          Z(c.zc + 0.2),
          0.5,
          0.2,
          0.6,
          { seg: false },
        );
      }
    }
    const scratchK = PR.texMat(
      "pr_oct_scr",
      PR.graffitiTex(
        "pr_oct_scr",
        ["LET ME OUT", "LET ME OUT", "LET ME OUT"],
        512,
        512,
        { color: "#5a2a1a", drips: false },
      ),
      { transparent: true },
    );
    b.quad(scratchK, X(-6.9), Y(11.8), Z(-30.3 + 0.8), 2.4, 2.4, { ry: HP });
    const tally = PR.texMat(
      "pr_oct_tally",
      PR.canvasTex(
        "pr_oct_tally",
        256,
        256,
        (ctx, w, h) => {
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(60,30,20,0.85)";
          ctx.lineWidth = 3;
          for (let g = 0; g < 30; g++) {
            const x0 = 10 + (g % 6) * 40,
              y0 = 10 + Math.floor(g / 6) * 48;
            for (let k = 0; k < 4; k++) {
              ctx.beginPath();
              ctx.moveTo(x0 + k * 7, y0);
              ctx.lineTo(x0 + k * 7 + 2, y0 + 36);
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(x0 - 3, y0 + 30);
            ctx.lineTo(x0 + 28, y0 + 6);
            ctx.stroke();
          }
        },
        { clamp: true },
      ),
      { transparent: true },
    );
    b.quad(tally, X(6.9), Y(11.6), Z(-19.9), 1.6, 1.6, { ry: -HP });
    // cell 6 gate (lock 75): holds the lodge stash
    const c6 = lodgeCells.find((c) => c.num === 6);
    PR.gate({
      x: X(c6.sx * 1.65),
      y: Y(10),
      z: Z(c6.zc + 1.2),
      w: 1.1,
      h: 2.3,
      ry: HP,
      flag: "oct_cell6",
      label: "Isolation Cell 6",
      lock: PR.LOCKS.oct_cell6,
      parent: root,
      bars: false,
      key: "steel",
    });
    anchors.cell6 = A(c6.sx * 5, 10, c6.zc - 1.2, 0);
    anchors.lodge = A(0, 10, -24, 0);
    anchors.lodge_tape = A(-4.6, 10.05, -14.2, 0);
    anchors.spawn5 = A(0, 10, -30, 0);
    for (let z = -15; z > -38; z -= 6)
      D.fluoro(b, X(0), Y(14.2), Z(z), 0, 1.6, false, Y(14.65));
    for (const z of [-17, -31]) {
      b.box("lamp_red", X(0), Y(14.4), Z(z), 0.3, 0.14, 0.3, {
        seg: false,
        noAO: true,
      });
      PR.glow(P(0, 14.3, z), 0xff3020, 1.2, root, {
        intensity: 1.0,
        flicker: 0.5,
      });
    }
    const lodgeK = PR.texMat(
      "pr_oct_lodge",
      PR.signTex(
        "pr_oct_lodge",
        ["THE LODGE", "VIOLENT PATIENTS — STAFF IN PAIRS"],
        "enamel",
        512,
        128,
        { bg: "#7a1c14", fg: "#f0e0c0" },
      ),
    );
    b.quad(lodgeK, X(0), Y(13.6), Z(-12.36), 2.4, 0.6, { ry: PI });

    // ============================ SOUTH WING ============================
    // ---- L0: HYDROTHERAPY (z 12.3..32) ----
    b.boxMM("tile_wall", X(-7), Y(-0.01), Z(12.3), X(7), Y(0.02), Z(32), {
      seg: false,
      grime: 0.6,
    });
    PR.colMM(X(-7), Y(-0.4), Z(12.3), X(7), Y(0.02), Z(40));
    for (const sx of [-1, 1])
      b.boxMM(
        "tile_wall",
        X(sx > 0 ? 6.95 : -7),
        Y(0),
        Z(12.3),
        X(sx > 0 ? 7 : -6.95),
        Y(4.6),
        Z(32),
        { seg: false, grime: 0.6 },
      );
    ceil("plaster_w", -7, 12.3, 7, 32, 4.6);
    // continuous-bath tubs with canvas restraint covers; one leaks irradiated water
    const tubs = [];
    for (let i = 0; i < 4; i++)
      for (const sx of [-1, 1]) tubs.push([sx * 4.2, 15 + i * 4.2]);
    tubs.forEach(([x, z], i) => {
      // enamelled cast-iron tub: base + four walls (hollow), water inside, canvas restraint cover
      b.boxMM(
        "enamel_w",
        X(x - 0.8),
        Y(0),
        Z(z - 1.1),
        X(x + 0.8),
        Y(0.28),
        Z(z + 1.1),
        { seg: false, grime: 0.7 },
      );
      for (const [a0, b0, a1, b1] of [
        [-0.8, -1.1, 0.8, -0.98],
        [-0.8, 0.98, 0.8, 1.1],
        [-0.8, -1.1, -0.68, 1.1],
        [0.68, -1.1, 0.8, 1.1],
      ])
        b.boxMM(
          "enamel_w",
          X(x + a0),
          Y(0.28),
          Z(z + b0),
          X(x + a1),
          Y(0.74),
          Z(z + b1),
          { seg: false, grime: 0.6 },
        );
      b.boxMM(
        "enamel_w",
        X(x - 0.86),
        Y(0.72),
        Z(z - 1.16),
        X(x + 0.86),
        Y(0.78),
        Z(z + 1.16),
        { seg: false, grime: 0.5 },
      );
      const glowT = i === 3;
      b.boxMM(
        glowT ? "rad_water" : "dirty_water_k",
        X(x - 0.68),
        Y(0.5),
        Z(z - 0.98),
        X(x + 0.68),
        Y(0.53),
        Z(z + 0.98),
        { seg: false, noAO: true },
      );
      if (!glowT)
        b.boxMM(
          "canvas_w",
          X(x - 0.86),
          Y(0.78),
          Z(z - 1.1),
          X(x + 0.86),
          Y(0.81),
          Z(z + 0.55),
          { seg: false, grime: 0.6 },
        );
      if (!glowT && i % 2 === 0)
        b.sphere("canvas_w", X(x), Y(0.84), Z(z + 0.78), 0.14, {
          ws: 8,
          hs: 5,
          sy: 0.6,
        }); // the head-hole
      for (const sx of [-0.7, 0.7])
        for (const sz of [-1.0, 1.0])
          b.sphere("iron", X(x + sx), Y(0.06), Z(z + sz), 0.09, {
            ws: 5,
            hs: 4,
          }); // claw feet
      b.cyl("chrome", X(x), Y(0.78), Z(z - 1.05), 0.03, 0.03, 0.4, 5, {
        hSeg: 1,
      });
      col(x, z, 1.6, 2.2, 0, 0.78, 0, { surface: "metal" });
      if (i === 5) PR.skeleton(b, X(x), Y(0.82), Z(z - 0.2), 0);
    });
    const radTub = tubs[3];
    PR.onInitDone.push(() => {
      try {
        G.world.addRadSource({
          x: X(radTub[0]),
          y: Y(0.6),
          z: Z(radTub[1]),
          radius: 4,
          strength: 4,
        });
      } catch (e) {
        /* core */
      }
    });
    PR.glow(P(radTub[0], 0.9, radTub[1]), 0x70ff40, 2.0, root, {
      intensity: 0.9,
      flicker: 0.15,
    });
    b.boxMM(
      "rad_water",
      X(radTub[0] - 1.6),
      Y(0.021),
      Z(radTub[1] + 1.1),
      X(radTub[0] + 0.3),
      Y(0.03),
      Z(radTub[1] + 3.2),
      { seg: false, noAO: true },
    );
    // needle shower cage (ring pipes) + hose reel + drain channel + wet-pack table
    for (let k = 0; k < 6; k++)
      b.add("chrome", new THREE.TorusGeometry(0.65, 0.035, 5, 18), {
        m: PR.m4(X(0), Y(0.4 + k * 0.35), Z(29.4), 0, HP),
      });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU;
      b.cyl(
        "chrome",
        X(Math.cos(a) * 0.65),
        Y(0),
        Z(29.4 + Math.sin(a) * 0.65),
        0.03,
        0.03,
        2.4,
        5,
        { hSeg: 1 },
      );
    }
    b.cyl("chrome", X(0), Y(2.4), Z(29.4), 0.3, 0.12, 0.12, 10, { hSeg: 1 });
    b.boxMM("iron", X(-0.25), Y(0.021), Z(12.6), X(0.25), Y(0.03), Z(31.6), {
      seg: false,
    });
    b.box("steel", X(-6.4), Y(1.0), Z(26), 0.4, 0.9, 0.9, { seg: false });
    b.add("rust", new THREE.TorusGeometry(0.35, 0.08, 5, 14), {
      m: PR.m4(X(-6.1), Y(1.45), Z(26), HP),
    });
    box("enamel_w", 5.2, 0, 30, 1.2, 0.85, 2.2);
    col(5.2, 30, 1.2, 2.2, 0, 0.9);
    box("linen", 5.2, 0.85, 30, 1.1, 0.12, 2.0);
    for (let z = 14; z < 32; z += 6)
      D.fluoro(b, X(0), Y(4.2), Z(z), 0, 2.4, z === 20, Y(4.65));
    const hydK = PR.texMat(
      "pr_oct_hydro",
      PR.signTex(
        "pr_oct_hydro",
        ["HYDROTHERAPY", "CALM IS A TEMPERATURE"],
        "enamel",
        512,
        128,
        { bg: "#dce4e0", fg: "#1a3a4a" },
      ),
    );
    b.quad(hydK, X(0), Y(3.6), Z(12.36), 2.2, 0.55, {});
    anchors.hydro = A(0, 0, 21, PI);
    anchors.hydro_locker = A(-6.4, 0, 16.5, -HP);
    anchors.spawn3 = A(-1.5, 0, 24, PI);
    // wall between hydrotherapy and the service stair hall (z 32..32.3) with the chained gate at x -4
    W("tile_wall", "x", -7, 7, 32, 32.3, 0, 4.65, [
      { c: -4, w: 1.6, y0: 0, h: 2.6 },
    ]);
    PR.gate({
      x: X(-4),
      y: Y(0),
      z: Z(32.15),
      w: 1.6,
      h: 2.6,
      ry: 0,
      flag: "oct_gate",
      label: "Service Stair Gate",
      chain: true,
      parent: root,
      canUse: (p) => p.z > Z(32.15),
      denyText: "The gate is chained shut from the other side.",
      verbOpen: "Unchain",
      lockedText: "Chained from the other side.",
    });
    anchors.gate = A(-4, 0, 31.2, 0);

    // ---- L1: day room (z 12.3..32) ----
    floor("checker", -7, 12.3, 7, 32, 5);
    ceil("plaster_w", -7, 12.3, 7, 32, 9.6);
    W("plaster_w", "x", -7, 7, 32, 32.3, 5, 9.65, [
      { c: -4, w: 1.6, y0: 5, h: 2.6 },
    ]);
    for (let z = 15; z < 31; z += 4)
      for (const sx of [-1, 1])
        win(sx * 6.97, 7.4, z, sx > 0 ? -HP : HP, 1.2, 2.2);
    // circle of chairs, piano, TV console, checkers table, patient drawings
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      D.chair(
        b,
        X(Math.cos(a) * 2.2 - 1.5),
        Y(5),
        Z(20 + Math.sin(a) * 2.2),
        -a - HP + (k === 3 ? 1.5 : 0),
        k === 5,
        "oak",
      );
    }
    box("mahogany", -5.2, 5, 27.5, 1.5, 1.1, 0.7);
    box("mahogany", -5.2, 6.1, 27.8, 1.5, 0.6, 0.3);
    box("paint_cream", -5.2, 5.9, 27.3, 1.3, 0.05, 0.25);
    col(-5.2, 27.5, 1.5, 0.8, 5, 6.3);
    box("oak", 4.5, 5, 22, 1.3, 1.1, 0.7);
    col(4.5, 22, 1.3, 0.7, 5, 6.1);
    b.quad("tv_glow", X(4.5), Y(5.75), Z(21.63), 0.7, 0.55, {
      ry: PI,
      noAO: true,
    });
    PR.glow(P(4.5, 5.75, 21.5), 0x8aa8e0, 1.6, root, {
      intensity: 0.8,
      flicker: 0.6,
    });
    box("oak", 2, 5, 28, 0.9, 0.72, 0.9);
    b.quad(
      PR.texMat(
        "pr_checkers",
        PR.canvasTex(
          "pr_checkers",
          128,
          128,
          (ctx) => {
            for (let i = 0; i < 8; i++)
              for (let j = 0; j < 8; j++) {
                ctx.fillStyle = (i + j) % 2 ? "#1a1a1a" : "#b83a2a";
                ctx.fillRect(i * 16, j * 16, 16, 16);
              }
          },
          { clamp: true },
        ),
      ),
      X(2),
      Y(5.73),
      Z(28),
      0.7,
      0.7,
      { rx: -HP },
    );
    col(2, 28, 0.9, 0.9, 5, 5.72);
    const artK = PR.texMat(
      "pr_oct_art",
      PR.canvasTex(
        "pr_oct_art",
        512,
        256,
        (ctx, w, h) => {
          ctx.fillStyle = "#d8d0b8";
          ctx.fillRect(0, 0, w, h);
          const rr = PR.rng(1887);
          for (let k = 0; k < 4; k++) {
            const x0 = 10 + k * 125;
            ctx.fillStyle = "#efe8d4";
            ctx.fillRect(x0, 20, 110, 150);
            ctx.strokeStyle = ["#2a2a8a", "#8a2a2a", "#2a6a2a", "#1a1a1a"][k];
            ctx.lineWidth = 3;
            if (k === 0) {
              ctx.beginPath();
              for (let i = 0; i < 60; i++) {
                const a = i * 0.5,
                  rad = i * 0.8;
                ctx.lineTo(x0 + 55 + Math.cos(a) * rad, 95 + Math.sin(a) * rad);
              }
              ctx.stroke();
            }
            if (k === 1) {
              for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(x0 + 10 + i * 12, 30);
                ctx.lineTo(x0 + 10 + i * 12, 160);
                ctx.stroke();
              }
            }
            if (k === 2) {
              ctx.beginPath();
              ctx.moveTo(x0 + 20, 150);
              ctx.lineTo(x0 + 55, 40);
              ctx.lineTo(x0 + 90, 150);
              ctx.closePath();
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(x0 + 55, 110, 14, 0, TAU);
              ctx.stroke();
            }
            if (k === 3) {
              ctx.font = "bold 22px Georgia";
              ctx.fillStyle = "#1a1a1a";
              ctx.fillText("NELL", x0 + 20, 70);
              ctx.fillText("WAS", x0 + 25, 100);
              ctx.fillText("HERE", x0 + 20, 130);
            }
            void rr;
          }
        },
        { clamp: true },
      ),
    );
    b.quad(artK, X(-2.5), Y(7.6), Z(32 - 0.02), 3.2, 1.6, { ry: PI });
    for (let z = 15; z < 31; z += 7)
      D.fluoro(b, X(0), Y(9.2), Z(z), 0, 2.4, false, Y(9.65));
    anchors.dayroom = A(-1.5, 5, 20, 0);
    anchors.day_piano = A(-5.2, 5, 26.6, 0);

    // ---- L2: treatment room (z 12.3..32) ----
    floor("tile_wall", -7, 12.3, 7, 32, 10, 0.35, { seg: false, grime: 0.6 });
    ceil("plaster_w", -7, 12.3, 7, 32, 14.6);
    W("plaster_w", "x", -7, 7, 32, 32.3, 10, 14.65, [
      { c: -4, w: 1.6, y0: 10, h: 2.6 },
    ]);
    for (const sx of [-1, 1])
      b.boxMM(
        "tile_wall",
        X(sx > 0 ? 6.95 : -7),
        Y(10),
        Z(12.3),
        X(sx > 0 ? 7 : -6.95),
        Y(12),
        Z(32),
        { seg: false, grime: 0.6 },
      );
    // operating table + surgical lamp
    box("chrome", 0, 10, 20, 0.3, 0.85, 0.3);
    box("enamel_w", 0, 10.85, 20, 0.8, 0.12, 2.0);
    col(0, 20, 0.9, 2.0, 10, 11);
    b.cyl("chrome", X(0), Y(13.2), Z(20), 0.02, 0.02, 1.45, 4, { hSeg: 1 });
    b.lathe(
      "enamel_w",
      [
        [0.05, 0.3],
        [0.5, 0.25],
        [0.65, 0.05],
        [0.6, 0.0],
      ],
      16,
      X(0),
      Y(12.9),
      Z(20),
      {},
    );
    b.add("lamp", new THREE.CircleGeometry(0.5, 16), {
      m: PR.m4(X(0), Y(12.92), Z(20), 0, HP),
      uv: "box",
      noAO: true,
    });
    PR.glow(P(0, 12.8, 20), 0xf0f8ff, 2.4, root, {
      intensity: 1.0,
      flicker: 0.05,
    });
    // electroconvulsive chair with the apparatus
    box("oak", -4.2, 10, 25.5, 0.9, 0.5, 0.9);
    box("oak", -4.2, 10.5, 25.9, 0.9, 1.2, 0.12);
    box("oak", -4.2, 10.5, 25.5, 0.9, 0.08, 0.9);
    for (const sx of [-0.45, 0.45])
      box("oak", -4.2 + sx, 10.5, 25.5, 0.08, 0.35, 0.8);
    b.add("chrome", new THREE.TorusGeometry(0.16, 0.03, 5, 12), {
      m: PR.m4(X(-4.2), Y(11.85), Z(25.7), 0, HP),
    });
    col(-4.2, 25.6, 1.0, 1.0, 10, 11.7);
    box("panel", -6.2, 10, 25.5, 0.8, 1.6, 1.2);
    col(-6.2, 25.5, 0.8, 1.2, 10, 11.6);
    for (let k = 0; k < 3; k++) {
      b.cyl(
        "glass_dark",
        X(-5.78),
        Y(11.2),
        Z(25 + k * 0.45),
        0.12,
        0.12,
        0.04,
        10,
        { hSeg: 1, rz: HP },
      );
    }
    b.sphere("lamp_red", X(-5.78), Y(11.45), Z(26.2), 0.04, { ws: 5, hs: 4 });
    D.cable(
      b,
      [P(-5.8, 11.2, 25.5), P(-4.8, 11.9, 25.6), P(-4.3, 11.9, 25.7)],
      0.3,
    );
    PR.glow(P(-5.7, 11.4, 25.6), 0x80a0ff, 0.9, root, {
      intensity: 0.8,
      flicker: 0.9,
    });
    // instrument trolley, specimen jars, gurney with restraints
    box("chrome", 2.2, 10, 21.6, 0.9, 0.9, 0.5);
    for (let k = 0; k < 5; k++)
      box("chrome", 1.9 + k * 0.15, 10.9, 21.6, 0.03, 0.02, 0.25);
    col(2.2, 21.6, 0.9, 0.5, 10, 10.9);
    for (let k = 0; k < 6; k++) {
      b.cyl(
        "glass_dark",
        X(6.3),
        Y(11.2 + (k % 2) * 0.5),
        Z(15 + Math.floor(k / 2) * 0.5),
        0.12,
        0.12,
        0.35,
        8,
        { hSeg: 1 },
      );
    }
    box("steel", 6.4, 10, 15.5, 0.6, 2.0, 1.8);
    col(6.4, 15.5, 0.6, 1.8, 10, 12);
    PR.bed(b, X(3.8), Y(10), Z(28.2), HP, { straps: true, sheet: "linen" });
    const ectK = PR.texMat(
      "pr_oct_ect",
      PR.signTex(
        "pr_oct_ect",
        [
          "TREATMENT ROOM",
          "PATIENT MUST BE RESTRAINED",
          "BEFORE CURRENT IS APPLIED",
        ],
        "enamel",
        512,
        256,
        { bg: "#e0dcc8", fg: "#6a1a14" },
      ),
    );
    b.quad(ectK, X(-6.94), Y(12.9), Z(19), 1.6, 0.8, { ry: HP });
    for (let z = 14; z < 32; z += 6)
      D.fluoro(b, X(-3), Y(14.2), Z(z), 0, 1.6, false, Y(14.65));
    anchors.treatment = A(0, 10, 22, 0);
    anchors.treatment_tape = A(3.8, 10.62, 27.8, 0);
    anchors.treatment_cabinet = A(6.4, 10, 17.2, -HP);
    anchors.spawn6 = A(-2, 10, 16, PI);

    // ---- service stair hall (z 32.3..40, x -7..7): L0 ↔ L1 ↔ L2 ----
    const LN = [33.1, 35.1],
      LS = [37.4, 39.4]; // north lane z, south lane z
    const flights = [
      [0, 2.5, LN, 1],
      [2.5, 5, LS, -1],
      [5, 7.5, LN, 1],
      [7.5, 10, LS, -1],
    ];
    for (const [y0, y1, lane, dir] of flights) {
      const zc = (lane[0] + lane[1]) / 2,
        xs = dir > 0 ? -2 : 2;
      PR.treads(
        b,
        "planks",
        X(xs),
        Z(zc),
        dir > 0 ? HP : -HP,
        2.0,
        4.0,
        Y(y0),
        Y(y1),
        { maxRise: 0.25, surface: "wood", thick: 0.14 },
      );
      // stringer + rail on the well side
      const wz = dir > 0 ? lane[1] + 0.08 : lane[0] - 0.08;
      b.beam(
        "iron",
        P(xs, y0 + 1.0, wz),
        P(xs + dir * 4, y1 + 1.0, wz),
        0.05,
        0.05,
      );
      for (let s = 0; s < 4; s++) {
        const t = (s + 0.5) / 4;
        col(
          xs + dir * 4 * t,
          wz,
          1.0,
          0.1,
          y0 + (y1 - y0) * t - 0.1,
          y0 + (y1 - y0) * t + 1.0,
        );
      }
    }
    // landings: east at 2.5 & 7.5, west at 5 & 10
    for (const [y, x0, x1] of [
      [2.5, 2, 6.9],
      [7.5, 2, 6.9],
      [5, -6.9, -2],
      [10, -6.9, -2],
    ]) {
      floor("planks", x0, 32.3, x1, 39.9, y, 0.25);
    }
    for (const sx of [-1, 1])
      b.boxMM(
        "brick_int",
        X(sx > 0 ? 6.97 : -7),
        Y(0),
        Z(32.3),
        X(sx > 0 ? 7 : -6.97),
        Y(14.65),
        Z(40.5),
        { seg: false, grime: 0.7 },
      );
    W("brick_int", "x", -7, 7, 39.9, 40.5, 0, 15.4, [], {});
    ceil("plaster_w", -7, 32.3, 7, 40, 14.6);
    for (const y of [3.2, 8.2, 13.2]) {
      b.box("lamp_warm", X(0), Y(y), Z(39.8), 0.3, 0.2, 0.15, {
        seg: false,
        noAO: true,
      });
      PR.glow(P(0, y, 39.6), 0xffc890, 1.0, root, {
        intensity: 0.8,
        flicker: 0.3,
      });
    }
    PR.skeleton(b, X(4.5), Y(2.52), Z(36), 2.6);
    const exitK = PR.texMat(
      "pr_oct_svc",
      PR.signTex(
        "pr_oct_svc",
        ["STAFF STAIR", "KEEP GATE CHAINED — DR. H."],
        "enamel",
        512,
        128,
        { bg: "#2a3a2a", fg: "#e0d8b8" },
      ),
    );
    b.quad(exitK, X(-4), Y(3.2), Z(32.34), 1.6, 0.4, {});
    anchors.service_stair = A(-4, 10, 34, PI);

    // ============================ L3 DOME GALLERY ============================
    // the Superintendent's "archive": a nest of patient files, candles, his desk dragged up the stairs
    box("mahogany", -7.2, 15, -1.2, 1.2, 0.8, 2.4);
    col(-7.2, -1.2, 1.2, 2.4, 15, 15.8);
    D.papers(b, X(-7), Y(15.82), Z(-1.2), 0.9, 10, 88);
    D.papers(b, X(-6.2), Y(15.01), Z(1.8), 2.5, 40, 89);
    PR.candles(b, X(-7.3), Y(15.8), Z(-0.4), 5, 11, root);
    PR.candles(b, X(-6.4), Y(15.0), Z(3.4), 7, 12, root);
    for (let k = 0; k < 5; k++) {
      const a = PI * 0.8 + k * 0.18;
      D.crates(
        b,
        X(Math.cos(a) * 7.8),
        Y(15),
        Z(Math.sin(a) * 7.8),
        1 + (k % 2),
        200 + k,
        false,
      );
    }
    for (let k = 0; k < 3; k++)
      PR.bed(
        b,
        X(Math.cos(PI * 0.55 + k * 0.28) * 7.4),
        Y(15),
        Z(Math.sin(PI * 0.55 + k * 0.28) * 7.4),
        PI * 0.55 + k * 0.28,
        { skeleton: true, straps: true, collide: false },
      );
    anchors.boss = A(-6.2, 15, 0.5, -HP);
    anchors.dome = A(6, 15, 0, HP);
    anchors.dome_safe = A(-8.3, 15, -3.2, -HP);
    anchors.dome_bag = A(-6.8, 15.82, -2.0, 0);
    anchors.loot1 = A(-14.2, 1.17, -2.6, 0);
    anchors.loot2 = anchors.hydro_locker;
    anchors.loot3 = anchors.office_safe;
    anchors.loot4 = anchors.cell6;
    anchors.loot5 = anchors.dome_safe;

    b.build(root, { castShadow: false });
    return anchors;
  }

  // ===================================================================
  // BUILDER + CONTENT PLACEMENT
  // ===================================================================
