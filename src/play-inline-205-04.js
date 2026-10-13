// play-inline-205 04 — seg
// Lines 1419-3806 of readable/play-inline-205.pretty.js (statement-aligned).
  function buildInterior(cell, extAnchors) {
    // The whole cell is lifted 10 m: core terrain is y=0 everywhere inside interior cells, so the crypt
    // (7 m below the nave) must stay above it.
    const O = cell.origin,
      ox = O.x,
      oy = O.y + 10,
      oz = O.z;
    const X = (x) => ox + x,
      Z = (z) => oz + z;
    const P = (x, y, z) => V3(ox + x, oy + y, oz + z);
    const A = (x, y, z, yaw) => PF.anchor(ox + x, oy + y, oz + z, yaw || 0);
    const anchors = {};
    const root = cell.root;
    const r = PF.rng("trinity_int");

    // ------------------------------------------------------------------
    // Lights: stained glass daylight, altar candles, settlers' lanterns,
    // clinic lamps, crypt candles & radioactive pool, belfry daylight
    // ------------------------------------------------------------------
    const lights = [];
    for (let z = -16; z <= 20; z += 5.5) {
      lights.push({ x: X(0), y: 5, z: Z(z), color: 0xffd8a0, r: 11, i: 0.42 }); // hanging lanterns down the nave
      lights.push({ x: X(-9), y: 4, z: Z(z), color: 0xa0b8ff, r: 7, i: 0.35 }); // stained glass (cool)
      lights.push({ x: X(9), y: 4, z: Z(z), color: 0xffb0a0, r: 7, i: 0.35 }); // stained glass (warm)
      lights.push({ x: X(0), y: 15, z: Z(z), color: 0xd0c8ff, r: 9, i: 0.25 }); // clerestory
    }
    lights.push({ x: X(0), y: 2, z: Z(-27), color: 0xffb060, r: 10, i: 0.9 }); // altar candles
    lights.push({ x: X(0), y: 13, z: Z(-30), color: 0xd8c0ff, r: 12, i: 0.45 }); // great window
    lights.push({ x: X(8), y: 2.6, z: Z(4), color: 0xfff0d8, r: 8, i: 0.7 }); // clinic
    lights.push({ x: X(8), y: 2.4, z: Z(-26), color: 0xffd090, r: 7, i: 0.6 }); // vestry
    lights.push({ x: X(0), y: 4, z: Z(28), color: 0xffd8a0, r: 9, i: 0.6 }); // narthex
    lights.push({ x: X(-8), y: 3, z: Z(28), color: 0xffe0b0, r: 8, i: 0.35 }); // stair hall base
    for (const y of [9, 16, 22])
      lights.push({
        x: X(-7.5),
        y,
        z: Z(28.5),
        color: 0xd8e0ff,
        r: 8,
        i: 0.35,
      });
    lights.push({ x: X(0), y: 9.5, z: Z(28), color: 0xffd8a0, r: 7, i: 0.5 }); // ringing chamber
    lights.push({ x: X(0), y: 16, z: Z(28), color: 0xfff0c0, r: 7, i: 0.55 }); // clock room (dials)
    lights.push({ x: X(0), y: 24, z: Z(28), color: 0xc8d8ff, r: 8, i: 0.7 }); // belfry
    lights.push({ x: X(0), y: 9, z: Z(21.5), color: 0xffd8a0, r: 7, i: 0.4 }); // organ loft
    // crypt
    for (const [x, z, c, i] of [
      [-8, -28, 0xffb060, 0.7],
      [0, -26, 0xffb060, 0.6],
      [-6, -10, 0xffa050, 0.55],
      [6, -8, 0xffa050, 0.45],
      [-6, 6, 0xffa050, 0.5],
      [6, 12, 0x60ff70, 0.7],
      [-6, 17, 0xffa050, 0.4],
      [-6, 30, 0xff9040, 0.5],
      [-6, 38, 0x60ff70, 0.45],
      [0, -2, 0x8090a0, 0.3],
    ]) {
      lights.push({ x: X(x), y: -3.2, z: Z(z), color: c, r: 8.5, i });
    }
    const b = PF.batch("trinity_int");
    b.ground = oy;
    b.aoH = 3;
    b.setLights(lights, 0x8a8aa0, 0.08);

    // ------------------------------------------------------------------
    // NARTHEX (tower base) — tower interior x -4.5..4.5, z 24.6..33;
    // walls 0.6 thick, 28 m tall; the stair turret adjoins on the west.
    // ------------------------------------------------------------------
    const TW0 = -4.5,
      TW1 = 4.5,
      TZ0 = 24.6,
      TZ1 = 33;
    b.boxMM("marble_floor", X(-11.2), oy - 0.5, Z(24), X(5.1), oy, Z(33.6), {
      grime: 0.5,
    });
    PF.colMM(X(-11.2), oy - 0.5, Z(24), X(5.1), oy, Z(33.6));
    const WG = 0.5;
    // west wall (shared with the stair turret): doorways at ground and at every landing (7 / 14 / 21)
    PF.wall(
      b,
      "brownstone_t",
      "z",
      Z(24),
      Z(33.6),
      X(-5.1),
      X(-4.5),
      oy,
      oy + 28,
      [
        { c: Z(32.2), w: 1.5, y0: oy, h: 2.7 },
        { c: Z(32.2), w: 1.5, y0: oy + 7, h: 2.5 },
        { c: Z(32.2), w: 1.5, y0: oy + 14, h: 2.5 },
        { c: Z(32.2), w: 1.5, y0: oy + 21, h: 2.5 },
      ],
      { grime: WG },
    );
    PF.wall(
      b,
      "brownstone_t",
      "z",
      Z(24),
      Z(33.6),
      X(4.5),
      X(5.1),
      oy,
      oy + 28,
      [],
      { grime: WG },
    ); // east
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(-4.5),
      X(4.5),
      Z(24),
      Z(24.6),
      oy,
      oy + 28,
      [
        // north
        { c: X(0), w: 6.2, y0: oy, h: 6.2 },
        { c: X(0), w: 2.0, y0: oy + 7, h: 2.5 },
      ],
      { grime: WG },
    );
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(-4.5),
      X(4.5),
      Z(33),
      Z(33.6),
      oy,
      oy + 28,
      [{ c: X(0), w: 2.6, y0: oy, h: 3.6 }],
      { grime: WG },
    ); // south
    PF.exitDoor(b, X(0), oy, Z(33.25), PI, 2.6, 3.6, {
      key: "oak",
      frame: "brownstone_dk",
    }); // west doors (to the churchyard), daylight in the lites
    // floors of the tower rooms: 7, 14, 21 (tops)
    for (const fy of [7, 14, 21]) {
      b.boxMM(
        "planks",
        X(TW0),
        oy + fy - 0.4,
        Z(TZ0),
        X(TW1),
        oy + fy,
        Z(TZ1),
        { grime: 0.6 },
      );
      PF.colMM(X(TW0), oy + fy - 0.4, Z(TZ0), X(TW1), oy + fy, Z(TZ1), {
        surface: "wood",
      });
      for (let x = TW0 + 0.8; x < TW1; x += 1.6)
        b.box("rotten", X(x), oy + fy - 0.7, Z(28.8), 0.25, 0.3, TZ1 - TZ0, {
          seg: false,
        });
    }
    b.boxMM("planks", X(TW0), oy + 27.6, Z(TZ0), X(TW1), oy + 28, Z(TZ1), {
      grime: 0.6,
    });
    // narthex dressing: sanctuary rules board, poor box, memorial portraits, inner door leaves
    const board = PF.texMat(
      "trinity_board",
      PF.signTex(
        "trinity_board",
        [
          "SANCTUARY RULES",
          "1. NO GUNS DRAWN INSIDE",
          "2. NO STEALING FROM THE POOR BOX",
          "3. MANIACS ARE NOT PARISHIONERS",
          "— REV. J. PENHALLOW",
        ],
        "engraved",
        512,
        384,
        { bg: "#b8a888", fg: "#2a2016" },
      ),
    );
    b.quad(board, X(4.42), oy + 1.9, Z(29), 1.5, 1.15, { ry: -HP });
    b.box("rotten", X(4.45), oy + 1.2, Z(29), 0.08, 1.5, 1.8, { seg: false });
    b.box("oak", X(-3.6), oy, Z(26.2), 0.6, 1.0, 0.6, { seg: false });
    PF.col(X(-3.6), Z(26.2), 0.6, 0.6, oy, oy + 1.0, 0, { walkable: false });
    for (let i = 0; i < 3; i++)
      D.painting(
        b,
        i + 1,
        X(-4.44),
        oy + 2.4,
        Z(26.8 + i * 1.7),
        0.9,
        1.1,
        HP,
        { frame: "brownstone_dk" },
      );
    for (const sx of [-1, 1])
      b.boxMM(
        "oak",
        X(sx > 0 ? 1.3 : -2.35),
        oy,
        Z(32.85),
        X(sx > 0 ? 2.35 : -1.3),
        oy + 3.5,
        Z(32.97),
        { seg: false, grime: 0.5 },
      ); // inner door leaves (open)
    anchors.entrance = A(0, 0, 31.2, 0);
    PF.door({
      id: "pf_tr_exit",
      pos: P(0, 1.5, 32.6),
      label: "Trinity Churchyard",
      verb: "Exit",
      radius: 1.4,
      target: {
        x: extAnchors.entrance.x,
        y: 0.05,
        z: extAnchors.entrance.z,
        yaw: -HP,
      },
      sound: "door_open",
    });

    // ------------------------------------------------------------------
    // STAIR TURRET (interior x -10.6..-5.1, z 24.6..33): switchback flights up to the belfry
    // ------------------------------------------------------------------
    const SX0 = -10.6,
      SX1 = -5.1;
    PF.wall(
      b,
      "brownstone_t",
      "z",
      Z(24),
      Z(33.6),
      X(-11.2),
      X(-10.6),
      oy,
      oy + 28,
      [],
      { grime: WG },
    ); // west
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(-11.2),
      X(-5.1),
      Z(24),
      Z(24.6),
      oy,
      oy + 28,
      [],
      { grime: WG },
    ); // north (also the aisle end)
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(-11.2),
      X(-5.1),
      Z(33),
      Z(33.6),
      oy,
      oy + 28,
      [],
      { grime: WG },
    ); // south
    b.boxMM(
      "brownstone_dk",
      X(-11.2),
      oy + 28,
      Z(24),
      X(-5.1),
      oy + 28.5,
      Z(33.6),
      {},
    );
    const FW = 2.0,
      L0 = 26.2,
      L1 = 31.4;
    const levels = [0, 3.5, 7, 10.5, 14, 17.5, 21];
    for (let i = 0; i < 6; i++) {
      const y0 = levels[i],
        y1 = levels[i + 1];
      if (i % 2 === 0)
        PF.stairs(
          b,
          "brownstone_dk",
          X(SX0 + FW / 2),
          Z(L1),
          PI,
          FW,
          L1 - L0,
          oy + y0,
          oy + y1,
          { base: oy + y0 - 0.35 },
        );
      else
        PF.stairs(
          b,
          "brownstone_dk",
          X(SX1 - FW / 2),
          Z(L0),
          0,
          FW,
          L1 - L0,
          oy + y0,
          oy + y1,
          { base: oy + y0 - 0.35 },
        );
      const north = i % 2 === 0;
      const lz0 = north ? TZ0 : L1,
        lz1 = north ? L0 : TZ1;
      b.boxMM(
        "brownstone_dk",
        X(SX0),
        oy + y1 - 0.35,
        Z(lz0),
        X(SX1),
        oy + y1,
        Z(lz1),
        { grime: 0.5 },
      );
      PF.colMM(X(SX0), oy + y1 - 0.35, Z(lz0), X(SX1), oy + y1, Z(lz1));
    }
    // spine wall between the flights
    b.boxMM(
      "brownstone_t",
      X(SX0 + FW + 0.05),
      oy,
      Z(L0),
      X(SX1 - FW - 0.05),
      oy + 22.2,
      Z(L1),
      { grime: 0.5 },
    );
    PF.colMM(
      X(SX0 + FW + 0.05),
      oy,
      Z(L0),
      X(SX1 - FW - 0.05),
      oy + 22.2,
      Z(L1),
      { walkable: false },
    );
    // slit windows (cool daylight) and a wall lamp per landing
    for (let k = 0; k < 7; k++)
      b.quad(
        "lamp_blue",
        X(-10.58),
        oy + 2 + k * 3.5,
        Z(k % 2 ? L0 - 0.8 : L1 + 0.8),
        0.22,
        1.1,
        { ry: HP, noAO: true, grime: 0 },
      );
    for (const y of [3.5, 10.5, 17.5]) {
      b.box("lamp_warm", X(-7.85), oy + y + 2.2, Z(24.66), 0.25, 0.3, 0.1, {
        seg: false,
        noAO: true,
      });
      PF.glow(P(-7.85, y + 2.3, 24.8), 0xffd8a0, 0.9, root, { intensity: 0.8 });
    }
    anchors.stairs_base = A(-8, 0, 32, 0);

    // ------------------------------------------------------------------
    // TOWER ROOMS above the narthex
    // ------------------------------------------------------------------
    // Ringing chamber (y 7): bell ropes with striped sallies, bench, peal boards
    for (let i = 0; i < 3; i++) {
      const x = -2 + i * 2;
      b.cyl("rope", X(x), oy + 7.8, Z(28.8), 0.025, 0.025, 13.2, 5, {
        hSeg: 2,
      });
      b.cyl("stripe_red", X(x), oy + 8.6, Z(28.8), 0.06, 0.06, 0.8, 6, {
        hSeg: 1,
      });
    }
    b.box("oak", X(0), oy + 7, Z(32.2), 5, 0.45, 0.5, { seg: false });
    PF.col(X(0), Z(32.2), 5, 0.5, oy + 7, oy + 7.45, 0, { surface: "wood" });
    const peal = PF.texMat(
      "trinity_peal",
      PF.signTex(
        "trinity_peal",
        [
          "ON THIS DAY WAS RUNG",
          "A PEAL OF 5040 CHANGES",
          "IN 3 HOURS 12 MINUTES",
          "MARCH 4th 1967",
        ],
        "engraved",
        512,
        320,
        { bg: "#3a2a1c", fg: "#d8c890" },
      ),
    );
    b.quad(peal, X(4.44), oy + 9.2, Z(27.5), 1.8, 1.1, { ry: -HP });
    // Clock room (y 14): four backlit dials, the going train, pendulum
    const dialBack = PF.texMat(
      "trinity_dialback",
      PF.canvasTex(
        "pf_trinity_dialback",
        256,
        256,
        (ctx, w) => {
          ctx.fillStyle = "#fff4d8";
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w / 2 - 2, 0, TAU);
          ctx.fill();
          ctx.save();
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
          ctx.fillStyle = "rgba(40,30,20,0.85)";
          ctx.font = "bold 22px Georgia";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const R = [
            "XII",
            "I",
            "II",
            "III",
            "IIII",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
            "X",
            "XI",
          ];
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU - HP;
            ctx.fillText(
              R[i],
              w / 2 + Math.cos(a) * (w / 2 - 30),
              w / 2 + Math.sin(a) * (w / 2 - 30),
            );
          }
          ctx.restore();
          ctx.strokeStyle = "rgba(20,14,8,0.9)";
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(w / 2, w / 2);
          ctx.lineTo(w / 2 - 50, w / 2 - 20);
          ctx.stroke();
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(w / 2, w / 2);
          ctx.lineTo(w / 2 + 30, w / 2 - 80);
          ctx.stroke();
        },
        { clamp: true },
      ),
      { emissive: 0.9, noShadow: true },
    );
    for (const [x, z, ry] of [
      [4.46, 28.8, -HP],
      [-4.46, 28.8, HP],
      [0, 24.64, 0],
      [0, 32.96, PI],
    ]) {
      if (x < 0) continue; // west dial hidden by the stair-turret wall opening
      b.add(dialBack, new THREE.CircleGeometry(1.5, 24), {
        m: PF.m4(X(x), oy + 17.3, Z(z), ry),
        uv: "keep",
        grime: 0.1,
        noAO: true,
      });
    }
    b.box("iron", X(0), oy + 14, Z(28.8), 1.6, 1.3, 1.0, {
      seg: false,
      grime: 0.4,
    }); // clock frame
    for (let i = 0; i < 5; i++) {
      const g = new THREE.CylinderGeometry(
        0.3 + i * 0.08,
        0.3 + i * 0.08,
        0.05,
        16,
      );
      g.rotateX(HP);
      b.add("brass", g, {
        m: PF.m4(X(-0.5 + i * 0.25), oy + 15.0 + (i % 2) * 0.25, Z(28.8)),
      });
    }
    for (const [x, z] of [
      [0, 24.7],
      [0, 32.9],
      [4.4, 28.8],
    ])
      b.beam("iron", P(0, 15.3, 28.5), P(x, 17.3, z), 0.05, 0.05);
    b.cyl("iron", X(0.7), oy + 11.2, Z(28.8), 0.02, 0.02, 3, 4, { hSeg: 1 });
    b.cyl("brass", X(0.7), oy + 11.0, Z(28.8), 0.25, 0.25, 0.08, 12, {
      hSeg: 1,
      rx: HP,
    });
    PF.col(X(0), Z(28.8), 1.6, 1.0, oy + 14, oy + 15.3, 0, { walkable: false });
    PF.skeleton(b, X(-2.4), oy + 14.02, Z(30.8), 2.2);
    // Belfry (y 21): oak bell frame, three bells, louvres
    b.boxMM("oak", X(-3.5), oy + 21, Z(26.5), X(3.5), oy + 21.35, Z(26.9), {
      seg: false,
    });
    b.boxMM("oak", X(-3.5), oy + 21, Z(30.7), X(3.5), oy + 21.35, Z(31.1), {
      seg: false,
    });
    for (const x of [-3.3, 0, 3.3])
      for (const z of [26.7, 30.9])
        b.box("oak", X(x), oy + 21, Z(z), 0.35, 4.2, 0.35, { seg: false });
    b.boxMM("oak", X(-3.5), oy + 25.2, Z(26.5), X(3.5), oy + 25.55, Z(31.1), {
      seg: false,
    });
    for (const [x, s] of [
      [-1.8, 1.1],
      [0.2, 0.85],
      [2.2, 0.7],
    ]) {
      b.lathe(
        "bronze_patina",
        [
          [0.02, 0],
          [s, 0.02],
          [s * 0.94, s * 0.25],
          [s * 0.62, s * 0.8],
          [s * 0.55, s * 1.1],
          [s * 0.2, s * 1.25],
          [0.02, s * 1.28],
        ],
        18,
        X(x),
        oy + 25.1 - s * 1.28,
        Z(28.8),
        {},
      );
      b.cyl("iron", X(x), oy + 25.1, Z(28.8), 0.08, 0.08, 0.45, 6, { hSeg: 1 });
    }
    PF.col(X(0.2), Z(28.8), 5.6, 2.6, oy + 21, oy + 24.9, 0, {
      walkable: false,
    });
    for (const [nx, nz, ry] of [
      [1, 0, -HP],
      [0, -1, 0],
      [0, 1, PI],
    ]) {
      for (const off of [-1.5, 1.5]) {
        const cx = nx * 4.46 + (nz !== 0 ? off : 0),
          cz = 28.8 + nz * 4.16 + (nx !== 0 ? off : 0);
        if (nz > 0 && Math.abs(off) < 2 && off > 0) continue; // lookout door slot
        b.quad("lamp_blue", X(cx), oy + 23.5, Z(cz), 1.3, 3.8, {
          ry,
          noAO: true,
          grime: 0,
        });
        for (let k = 0; k < 8; k++)
          b.box(
            "rotten",
            X(cx - nx * 0.1),
            oy + 21.9 + k * 0.45,
            Z(cz - nz * 0.1),
            nx !== 0 ? 0.05 : 1.4,
            0.05,
            nx !== 0 ? 1.4 : 0.05,
            {
              rx: nz !== 0 ? 0.6 * nz : 0,
              rz: nx !== 0 ? -0.6 * nx : 0,
              seg: false,
            },
          );
      }
    }
    // lookout door (south wall, belfry level) → exterior timber balcony
    b.boxMM("rotten", X(0.9), oy + 21, Z(32.95), X(2.3), oy + 23.3, Z(33.05), {
      seg: false,
    });
    anchors.belfry = A(1.6, 21, 31.2, PI);
    PF.door({
      id: "pf_tr_lookout_out",
      pos: P(1.6, 22.4, 32.6),
      label: "Belfry Lookout",
      verb: "Go to",
      radius: 1.1,
      target: {
        x: extAnchors.lookout.x,
        y: extAnchors.lookout.y + 0.05,
        z: extAnchors.lookout.z,
        yaw: extAnchors.lookout.yaw,
      },
      sound: "door_open",
    });
    PF.lookoutBack = { x: X(1.6), y: oy + 21.05, z: Z(31.7), yaw: 1.2 }; // facing WNW past the bell frame toward the lookout's nest
    // belfry loot: the lookout's nest
    D.mattress(b, X(-3.2), oy + 21, Z(32), HP);
    anchors.loot_belfry = A(3.2, 21, 25.4, 0);

    // ------------------------------------------------------------------
    // NAVE x -6..6 / AISLES x -10..-6 & 6..10, z -20..24
    // ------------------------------------------------------------------
    const NZ0 = -20,
      NZ1 = 24;
    b.boxMM("marble_floor", X(-8.0), oy - 0.5, Z(NZ0), X(10.6), oy, Z(NZ1), {
      grime: 0.55,
    });
    b.boxMM("marble_floor", X(-10.6), oy - 0.5, Z(NZ0), X(-9.8), oy, Z(NZ1), {
      grime: 0.55,
    });
    b.boxMM("marble_floor", X(-9.8), oy - 0.5, Z(NZ0), X(-8.0), oy, Z(15), {
      grime: 0.55,
    });
    b.boxMM("marble_floor", X(-9.8), oy - 0.5, Z(23), X(-8.0), oy, Z(NZ1), {
      grime: 0.55,
    });
    // floor colliders leave the openings for the crypt return stair (x -9.8..-8.0, z 15..23)
    PF.colMM(X(-10.6), oy - 0.5, Z(NZ0), X(-9.8), oy, Z(NZ1));
    PF.colMM(X(-8.0), oy - 0.5, Z(NZ0), X(10.6), oy, Z(NZ1));
    PF.colMM(X(-9.8), oy - 0.5, Z(NZ0), X(-8.0), oy, Z(15));
    PF.colMM(X(-9.8), oy - 0.5, Z(23), X(-8.0), oy, Z(NZ1));
    // outer aisle walls (x ±10.6) with stained-glass lancets per bay
    const piers = [19, 13.5, 8, 2.5, -3, -8.5, -14];
    for (const sx of [-1, 1]) {
      b.boxMM(
        "brownstone_t",
        X(sx * 10.6 - (sx > 0 ? 0 : 0.6)),
        oy,
        Z(NZ0),
        X(sx * 10.6 + (sx > 0 ? 0.6 : 0)),
        oy + 9,
        Z(NZ1),
        { grime: 0.45, segLen: 3 },
      );
      PF.colMM(
        X(sx * 10.6 - (sx > 0 ? 0 : 0.6)),
        oy,
        Z(NZ0),
        X(sx * 10.6 + (sx > 0 ? 0.6 : 0)),
        oy + 9,
        Z(NZ1),
        { walkable: false },
      );
      for (let i = 0; i < piers.length; i++) {
        const zc = piers[i] - 2.75;
        if (zc < NZ0 + 1) continue;
        PF.lancetWindow(
          b,
          X(sx * 10.55),
          oy + 1.6,
          Z(zc),
          sx > 0 ? -HP : HP,
          1.9,
          5.0,
          {
            glass: PF.stainedKey(i % 3, 1.1),
            frame: "limestone",
            frameW: 0.2,
            out: 0.06,
          },
        );
      }
      // wall shafts between windows
      for (const z of piers)
        b.box("limestone", X(sx * 10.35), oy, Z(z), 0.4, 6.2, 0.5, {
          seg: false,
        });
    }
    // arcade piers (clustered) + arches + clerestory walls
    for (const sx of [-1, 1]) {
      for (const z of piers.concat([-19.4])) {
        b.box("limestone", X(sx * 6), oy, Z(z), 1.3, 0.5, 1.3, {
          seg: false,
          grime: 0.5,
        });
        b.cyl("limestone", X(sx * 6), oy + 0.5, Z(z), 0.42, 0.42, 6.0, 12, {
          hSeg: 2,
          grime: 0.4,
        });
        for (const [dx, dz] of [
          [0.45, 0],
          [-0.45, 0],
          [0, 0.45],
          [0, -0.45],
        ])
          b.cyl(
            "limestone",
            X(sx * 6 + dx),
            oy + 0.5,
            Z(z + dz),
            0.14,
            0.14,
            6.0,
            6,
            { hSeg: 1 },
          );
        b.box("limestone", X(sx * 6), oy + 6.5, Z(z), 1.4, 0.35, 1.4, {
          seg: false,
        });
        if (Math.abs(z) < 30 && z !== -19.4)
          PF.col(X(sx * 6), Z(z), 1.3, 1.3, oy, oy + 14, 0, {
            walkable: false,
          });
      }
      // wall above the arcade (spandrels + triforium + clerestory), with pointed openings
      for (let i = 0; i < piers.length; i++) {
        const za = piers[i],
          zb = i + 1 < piers.length ? piers[i + 1] : -19.4;
        // spandrel wall 6.85..14 (solid band) with a pointed arch soffit beneath
        const N = 10;
        for (let k = 0; k < N; k++) {
          const t0 = k / N,
            t1 = (k + 1) / N;
          const zA = za + (zb - za) * t0,
            zB = za + (zb - za) * t1;
          const yA = archY(zA, Math.min(za, zb), Math.max(za, zb), 6.85, 3.0),
            yB = archY(zB, Math.min(za, zb), Math.max(za, zb), 6.85, 3.0);
          const y = Math.min(yA, yB);
          b.boxMM(
            "limestone",
            X(sx * 6 - 0.35),
            oy + y,
            Z(Math.min(zA, zB)),
            X(sx * 6 + 0.35),
            oy + 10.4,
            Z(Math.max(zA, zB)),
            { seg: false, grime: 0.35 },
          );
        }
        b.boxMM(
          "brownstone_t",
          X(sx * 6 - 0.35),
          oy + 10.4,
          Z(Math.min(za, zb)),
          X(sx * 6 + 0.35),
          oy + 14.2,
          Z(Math.max(za, zb)),
          { seg: false, grime: 0.4 },
        );
        // clerestory lancet (stained glass) facing the nave
        PF.lancetWindow(
          b,
          X(sx * 5.55),
          oy + 10.9,
          Z((za + zb) / 2),
          sx > 0 ? -HP : HP,
          1.8,
          2.9,
          {
            glass: PF.stainedKey((i + 1) % 3, 0.9),
            frame: "limestone",
            frameW: 0.14,
            sill: false,
            out: 0.02,
          },
        );
        // triforium band (blind arcading)
        for (let k = 0; k < 4; k++)
          b.box(
            "brownstone_dk",
            X(sx * 5.64),
            oy + 9.6,
            Z(za + ((zb - za) * (k + 0.5)) / 4),
            0.08,
            0.9,
            0.18,
            { seg: false },
          );
      }
    }
    // south end of the nave: east aisle end wall + filler strips beside the tower up to the vault
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(5.1),
      X(10.6),
      Z(NZ1),
      Z(NZ1 + 0.6),
      oy,
      oy + 9.5,
      [],
      { grime: 0.5 },
    );
    PF.wall(
      b,
      "brownstone_t",
      "x",
      X(5.1),
      X(6.4),
      Z(NZ1),
      Z(NZ1 + 0.6),
      oy + 9.5,
      oy + 19.2,
      [],
      { grime: 0.5 },
    );
    // vaults: nave (springing 14.2, apex 19), aisles (springing 6.5, apex 9)
    vault(
      b,
      "plaster_w",
      X(-6.3),
      X(6.3),
      Z(NZ0 - 0.1),
      Z(NZ1 + 0.1),
      oy + 14.2,
      4.8,
      { nu: 16 },
    );
    // ribs: transverse at every pier, diagonal per bay, ridge rib
    const allP = piers.concat([-19.4]);
    for (let i = 0; i < allP.length; i++) {
      rib(b, "limestone", X(-6), X(6), Z(allP[i]), oy + 14.2, 4.8, 0.3);
      if (i + 1 < allP.length) {
        rib(
          b,
          "limestone",
          X(-6),
          X(6),
          Z(allP[i]),
          oy + 14.2,
          4.8,
          0.2,
          Z(allP[i + 1]),
        );
        rib(
          b,
          "limestone",
          X(6),
          X(-6),
          Z(allP[i]),
          oy + 14.2,
          4.8,
          0.2,
          Z(allP[i + 1]),
        );
        // boss at the crossing
        b.sphere(
          "gilt",
          X(0),
          oy + 18.75,
          Z((allP[i] + allP[i + 1]) / 2),
          0.28,
          { ws: 8, hs: 6 },
        );
      }
    }
    b.beam("limestone", P(0, 18.85, NZ1), P(0, 18.85, NZ0), 0.22, 0.22, {});
    for (const sx of [-1, 1]) {
      const xa = sx > 0 ? 6.3 : -10.6,
        xb = sx > 0 ? 10.6 : -6.3;
      vault(
        b,
        "plaster_w",
        X(xa),
        X(xb),
        Z(NZ0 - 0.1),
        Z(NZ1 + 0.1),
        oy + 6.5,
        2.6,
        { nu: 10 },
      );
      for (const z of allP)
        rib(b, "limestone", X(xa), X(xb), Z(z), oy + 6.5, 2.6, 0.22);
      // aisle roof above the vault closes the volume (keeps the clerestory from looking into nothing)
      b.boxMM(
        "brownstone_dk",
        X(Math.min(xa, xb)),
        oy + 9.1,
        Z(NZ0),
        X(Math.max(xa, xb)),
        oy + 9.5,
        Z(NZ1),
        { seg: false },
      );
    }
    // roof hole in the nave vault: a charred gap with fallen debris below (the settlers put a bucket under it)
    D.rubble(b, X(-2.5), oy, Z(-6), 0.9, 7, 21);
    b.cyl("rust", X(-1.2), oy, Z(-5.2), 0.22, 0.18, 0.35, 8, {
      hSeg: 1,
      open: true,
    });
    // pews (12 rows each side of the centre aisle); some broken, some turned into beds
    for (let i = 0; i < 12; i++) {
      const z = 17 - i * 2.6;
      for (const sx of [-1, 1]) {
        const broken = r() < 0.12,
          bed = !broken && r() < 0.16;
        const cx = sx * 3.3,
          w = 4.4;
        if (broken) {
          b.box("mahogany", X(cx + (r() - 0.5)), oy, Z(z), w * 0.6, 0.45, 0.5, {
            ry: (r() - 0.5) * 0.8,
            rz: 0.3,
            seg: false,
            grime: 0.7,
          });
          continue;
        }
        b.box("mahogany", X(cx), oy + 0.42, Z(z), w, 0.07, 0.5, {
          seg: false,
          grime: 0.5,
        });
        b.box("mahogany", X(cx), oy + 0.45, Z(z + 0.3), w, 0.55, 0.06, {
          rx: 0.12,
          seg: false,
          grime: 0.5,
        });
        b.box("mahogany", X(cx), oy, Z(z + 0.4), w, 0.95, 0.07, {
          seg: false,
          grime: 0.5,
        });
        b.box("mahogany", X(cx - w / 2), oy, Z(z + 0.1), 0.08, 1.0, 0.7, {
          seg: false,
        });
        b.box("mahogany", X(cx + w / 2), oy, Z(z + 0.1), 0.08, 1.0, 0.7, {
          seg: false,
        });
        b.box("velvet", X(cx), oy + 0.2, Z(z - 0.45), w - 0.2, 0.14, 0.26, {
          seg: false,
          grime: 0.5,
        }); // kneeler
        if (bed) {
          b.box("linen", X(cx), oy + 0.49, Z(z), w - 0.6, 0.12, 0.45, {
            seg: false,
            c: 0xb0a890,
          });
          b.box(
            "linen",
            X(cx - w / 2 + 0.6),
            oy + 0.56,
            Z(z),
            0.4,
            0.12,
            0.35,
            { seg: false },
          );
        }
        PF.col(X(cx), Z(z + 0.1), w, 0.9, oy, oy + 0.5, 0, { surface: "wood" });
        PF.col(X(cx), Z(z + 0.4), w, 0.1, oy, oy + 1.0, 0, { walkable: false });
      }
    }
    // settlers' hanging lanterns down the nave
    for (let z = -16; z <= 20; z += 5.5) {
      b.cyl("iron", X(0), oy + 5.4, Z(z), 0.01, 0.01, 13.4, 3, { hSeg: 1 });
      b.cyl("lamp_warm", X(0), oy + 5.0, Z(z), 0.14, 0.17, 0.4, 6, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      b.cyl("iron", X(0), oy + 5.4, Z(z), 0.03, 0.22, 0.14, 6, { hSeg: 1 });
      PF.glow(P(0, 5.2, z), 0xffc880, 1.5, root, {
        intensity: 1.1,
        flicker: 0.12,
      });
    }
    // candle stands along the aisles
    for (const [x, z] of [
      [-8.5, 10],
      [8.5, -12],
      [-8.5, -12],
      [8.5, 16],
    ]) {
      b.cyl("iron", X(x), oy, Z(z), 0.04, 0.15, 1.2, 6, { hSeg: 1 });
      b.cyl("iron", X(x), oy + 1.2, Z(z), 0.35, 0.3, 0.06, 10, { hSeg: 1 });
      PF.candles(b, X(x), oy + 1.26, Z(z), 7, x * 3 + z, root);
    }

    // ------------------------------------------------------------------
    // SETTLERS' KITCHEN (west aisle, z 1..8): drum brazier with live flames, grill, soup pot, a door-on-crates
    // table, potato crates, water barrel, pots hung on a line between the piers
    // ------------------------------------------------------------------
    {
      const kx = -8.6,
        kz = 4.2;
      b.cyl("rust", X(kx), oy, Z(kz), 0.34, 0.3, 0.7, 10, {
        hSeg: 1,
        grime: 0.6,
      });
      b.cyl("fire", X(kx), oy + 0.62, Z(kz), 0.26, 0.28, 0.08, 8, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      for (let k = 0; k < 5; k++)
        b.box(
          "iron",
          X(kx - 0.3 + k * 0.15),
          oy + 0.72,
          Z(kz),
          0.03,
          0.03,
          0.7,
          { seg: false },
        );
      b.cyl(
        "steel",
        X(kx + 0.12),
        oy + 0.74,
        Z(kz + 0.05),
        0.2,
        0.18,
        0.3,
        10,
        { hSeg: 1, grime: 0.7 },
      );
      PF.fireAt(P(kx - 0.15, 0.7, kz - 0.1), 0.26, { smoke: false });
      PF.glow(P(kx, 1.0, kz), 0xff8a3a, 1.3, root, {
        intensity: 1.2,
        flicker: 0.45,
      });
      PF.col(X(kx), Z(kz), 0.75, 0.75, oy, oy + 0.9, 0, {
        walkable: false,
        surface: "metal",
      });
      // table: an old door on two crates, tin plates, a jar of plum preserves
      b.box("crate", X(-8.9), oy, Z(6.4), 0.6, 0.7, 0.6, { seg: false });
      b.box("crate", X(-8.9), oy, Z(7.9), 0.6, 0.7, 0.6, {
        ry: 0.2,
        seg: false,
      });
      b.box("oak", X(-8.9), oy + 0.7, Z(7.15), 0.95, 0.06, 2.1, {
        seg: false,
        grime: 0.6,
        c: 0x7a5a3a,
      });
      for (let k = 0; k < 4; k++)
        b.cyl(
          "steel",
          X(-8.75 + (k % 2) * -0.3),
          oy + 0.76,
          Z(6.5 + k * 0.4),
          0.12,
          0.1,
          0.03,
          8,
          { hSeg: 1 },
        );
      b.cyl("glass_dark", X(-9.1), oy + 0.76, Z(7.8), 0.07, 0.07, 0.2, 6, {
        hSeg: 1,
      });
      PF.col(X(-8.9), Z(7.15), 0.95, 2.2, oy, oy + 0.76, 0, {
        walkable: false,
        surface: "wood",
      });
      // potato crates + water barrel against the outer wall
      for (let k = 0; k < 3; k++) {
        const cz = 1.2 + k * 0.8;
        b.box("crate", X(-10.1), oy, Z(cz), 0.7, 0.45, 0.65, {
          ry: (k - 1) * 0.1,
          seg: false,
        });
        for (let j = 0; j < 5; j++)
          b.sphere(
            "paint_orange",
            X(-10.1 + (((j * 37) % 5) - 2) * 0.11),
            oy + 0.48,
            Z(cz + (((j * 23) % 5) - 2) * 0.1),
            0.07,
            { ws: 5, hs: 4, grime: 0.7 },
          );
      }
      PF.col(X(-10.1), Z(2.0), 0.75, 2.4, oy, oy + 0.5, 0, {
        walkable: false,
        surface: "wood",
      });
      PF.barrel(b, X(-10.0), oy, Z(5.4), { key: "paint_teal" });
      // pots and ladles hung from a rope between the aisle piers
      b.beam("rope", P(-10.3, 2.3, 2.0), P(-10.3, 2.3, 7.8), 0.02, 0.02, {});
      for (let k = 0; k < 4; k++) {
        const z = 2.8 + k * 1.3;
        b.beam("iron", P(-10.3, 2.3, z), P(-10.3, 2.0, z), 0.01, 0.01, {});
        b.cyl(
          k % 2 ? "copper" : "iron",
          X(-10.3),
          oy + 1.75,
          Z(z),
          0.16,
          0.13,
          0.22,
          8,
          { hSeg: 1 },
        );
      }
      anchors.kitchen = A(-7.6, 0, 4.6, HP);
    }

    // ------------------------------------------------------------------
    // CLINIC (east aisle, z -2..12): curtained cots, IV stands, cabinet
    // ------------------------------------------------------------------
    for (let i = 0; i < 4; i++) {
      const z = -0.5 + i * 3.2;
      b.box("iron", X(8.4), oy + 0.45, Z(z), 2.0, 0.06, 0.9, { seg: false });
      for (const dx of [-0.95, 0.95])
        b.box("iron", X(8.4 + dx), oy, Z(z), 0.05, 0.9, 0.9, { seg: false });
      b.box("linen", X(8.4), oy + 0.51, Z(z), 1.9, 0.14, 0.85, {
        seg: false,
        c: 0xd8d0c0,
        grime: 0.6,
      });
      b.box("linen", X(9.1), oy + 0.62, Z(z), 0.4, 0.12, 0.6, { seg: false });
      PF.col(X(8.4), Z(z), 2.0, 0.9, oy, oy + 0.62, 0, { surface: "wood" });
      // IV stand
      b.cyl("chrome", X(7.2), oy, Z(z + 0.5), 0.015, 0.015, 1.9, 4, {
        hSeg: 1,
      });
      b.box("glass_dark", X(7.2), oy + 1.7, Z(z + 0.5), 0.12, 0.22, 0.06, {
        seg: false,
      });
      // curtain between cots
      if (i < 3)
        b.box("linen", X(8.4), oy + 0.3, Z(z + 1.6), 2.2, 1.9, 0.03, {
          seg: false,
          c: 0xc8c8b8,
          grime: 0.7,
        });
    }
    b.cyl("iron", X(7.1), oy + 2.3, Z(4.2), 0.01, 0.01, 4.2, 3, { hSeg: 1 });
    b.box("lamp_warm", X(7.1), oy + 2.3, Z(4.2), 0.5, 0.08, 0.2, {
      seg: false,
      noAO: true,
    });
    PF.glow(P(7.1, 2.25, 4.2), 0xfff0d0, 1.4, root, { intensity: 1.0 });
    const redX = PF.texMat(
      "trinity_redcross",
      PF.signTex("trinity_redcross", ["+ INFIRMARY +"], "enamel", 512, 128, {
        bg: "#e8e0d0",
        fg: "#a82018",
      }),
    );
    b.quad(redX, X(10.52), oy + 3.1, Z(5), 2.4, 0.6, { ry: -HP });
    anchors.doctor = A(7.0, 0, 7.4, -HP);
    anchors.clinic = A(8.4, 0, 3, 0);

    // ------------------------------------------------------------------
    // CHANCEL z -32..-20 (raised 0.6), reredos, altar, great window, pulpit, lectern
    // ------------------------------------------------------------------
    const CY = 0.6;
    b.boxMM(
      "marble_floor",
      X(-5.6),
      oy - 0.5,
      Z(-32),
      X(5.6),
      oy + CY,
      Z(-20.9),
      { grime: 0.4 },
    );
    PF.colMM(X(-5.6), oy - 0.5, Z(-32), X(5.6), oy + CY, Z(-20.9));
    for (let k = 0; k < 3; k++) {
      const top = (k + 1) * 0.2,
        z0 = -20.9 + (2 - k) * 0.35;
      b.boxMM(
        "marble",
        X(-5.6),
        oy,
        Z(z0 - 0.35),
        X(5.6),
        oy + top,
        Z(z0 + 0.02),
        { seg: false, grime: 0.5 },
      );
      PF.colMM(X(-5.6), oy, Z(z0 - 0.35), X(5.6), oy + top, Z(z0 + 0.02));
    }
    // chancel walls (x ±5.6), side rooms beyond them (vestry east, crypt stair west)
    for (const sx of [-1, 1]) {
      b.boxMM(
        "brownstone_t",
        X(sx > 0 ? 5.6 : -6.2),
        oy,
        Z(-32.6),
        X(sx > 0 ? 6.2 : -5.6),
        oy + 14,
        Z(-20.9),
        { grime: 0.45 },
      );
      PF.colMM(
        X(sx > 0 ? 5.6 : -6.2),
        oy,
        Z(-32.6),
        X(sx > 0 ? 6.2 : -5.6),
        oy + 14,
        Z(-20.9),
        { walkable: false },
      );
      // choir stalls
      for (let i = 0; i < 4; i++) {
        const z = -28 + i * 1.6;
        b.box("oak", X(sx * 4.7), oy + CY, Z(z), 1.0, 0.5, 1.4, {
          seg: false,
          grime: 0.5,
        });
        b.box("oak", X(sx * 5.3), oy + CY, Z(z), 0.2, 2.2, 1.5, {
          seg: false,
          grime: 0.5,
        });
        K.pinnacle(
          b,
          "oak",
          X(sx * 5.3),
          oy + CY + 2.2,
          Z(z - 0.7),
          0.2,
          0.7,
          {},
        );
      }
      PF.col(X(sx * 4.9), Z(-25.6), 1.4, 6.4, oy + CY, oy + CY + 0.5, 0, {
        surface: "wood",
      });
    }
    // east & west end walls of the aisles at z -20 (with doors to the side rooms)
    for (const sx of [-1, 1]) {
      const x0 = sx > 0 ? 6.2 : -10.6,
        x1 = sx > 0 ? 10.6 : -6.2;
      const dc = sx > 0 ? 8.4 : -8.4;
      b.boxMM(
        "brownstone_t",
        X(x0),
        oy,
        Z(-20.6),
        X(dc - 0.8),
        oy + 9,
        Z(-20),
        { grime: 0.45 },
      );
      b.boxMM(
        "brownstone_t",
        X(dc + 0.8),
        oy,
        Z(-20.6),
        X(x1),
        oy + 9,
        Z(-20),
        { grime: 0.45 },
      );
      b.boxMM(
        "brownstone_t",
        X(dc - 0.8),
        oy + 2.6,
        Z(-20.6),
        X(dc + 0.8),
        oy + 9,
        Z(-20),
        { grime: 0.45 },
      );
      PF.colMM(X(x0), oy, Z(-20.6), X(dc - 0.8), oy + 9, Z(-20), {
        walkable: false,
      });
      PF.colMM(X(dc + 0.8), oy, Z(-20.6), X(x1), oy + 9, Z(-20), {
        walkable: false,
      });
      PF.lancetWindow(b, X(dc), oy, Z(-19.98), 0, 1.6, 2.6, {
        frame: "limestone",
        frameW: 0.16,
        sill: false,
      });
    }
    // chancel arch
    for (const sx of [-1, 1])
      b.boxMM(
        "limestone",
        X(sx > 0 ? 5.6 : -6.3),
        oy,
        Z(-21),
        X(sx > 0 ? 6.3 : -5.6),
        oy + 14.2,
        Z(-19.8),
        { seg: false, grime: 0.35 },
      );
    // chancel roof vault + back wall with the great window
    vault(b, "plaster_w", X(-5.7), X(5.7), Z(-32.4), Z(-20.4), oy + 12.8, 4.4, {
      nu: 14,
    });
    b.boxMM("brownstone_t", X(-6.2), oy, Z(-33.2), X(6.2), oy + 18, Z(-32.4), {
      grime: 0.45,
    });
    PF.colMM(X(-6.2), oy, Z(-33.2), X(6.2), oy + 18, Z(-32.4), {
      walkable: false,
    });
    for (const [dx, w, h] of [
      [-2.4, 1.9, 6.2],
      [0, 2.2, 7.6],
      [2.4, 1.9, 6.2],
    ])
      PF.lancetWindow(b, X(dx), oy + 9.6, Z(-32.38), 0, w, h, {
        glass: PF.stainedKey(dx === 0 ? 0 : 2, 0.8),
        frame: "limestone",
        frameW: 0.18,
        sill: dx === 0,
        out: 0.04,
      });
    // the reredos: white stone screen with niches, canopies & pinnacles
    {
      const rz = -31.6;
      b.boxMM(
        "marble",
        X(-4.2),
        oy + CY,
        Z(rz - 0.6),
        X(4.2),
        oy + CY + 3.0,
        Z(rz + 0.25),
        { grime: 0.35 },
      );
      for (let i = 0; i < 7; i++) {
        const x = -3.6 + i * 1.2;
        b.box("marble", X(x), oy + CY + 3.0, Z(rz), 0.9, 3.4, 0.5, {
          seg: false,
          grime: 0.35,
        });
        PF.lancetWindow(b, X(x), oy + CY + 3.3, Z(rz + 0.26), 0, 0.62, 2.4, {
          frame: "marble",
          frameW: 0.08,
          sill: false,
        });
        b.cyl(
          "marble",
          X(x),
          oy + CY + 3.35,
          Z(rz + 0.05),
          0.12,
          0.14,
          1.3,
          6,
          { hSeg: 1 },
        ); // statue stumps (figures)
        b.sphere("marble", X(x), oy + CY + 4.8, Z(rz + 0.05), 0.13, {
          ws: 6,
          hs: 5,
        });
        K.pinnacle(
          b,
          "marble",
          X(x),
          oy + CY + 6.4,
          Z(rz),
          0.5,
          2.2 + (i === 3 ? 1.6 : 0),
          {},
        );
      }
      b.box("gilt", X(0), oy + CY + 7.2, Z(rz + 0.1), 0.14, 1.6, 0.1, {
        seg: false,
      });
      b.box("gilt", X(0), oy + CY + 7.9, Z(rz + 0.1), 0.8, 0.12, 0.1, {
        seg: false,
      });
      PF.colMM(
        X(-4.2),
        oy + CY,
        Z(rz - 0.6),
        X(4.2),
        oy + CY + 6.4,
        Z(rz + 0.3),
        { walkable: false },
      );
    }
    // altar with frontal, candlesticks, and the settlers' offerings (scrip, tin cans, a teddy bear)
    b.boxMM(
      "marble",
      X(-1.6),
      oy + CY,
      Z(-29.4),
      X(1.6),
      oy + CY + 1.0,
      Z(-28.4),
      { grime: 0.3 },
    );
    b.boxMM(
      "velvet",
      X(-1.5),
      oy + CY + 0.05,
      Z(-28.38),
      X(1.5),
      oy + CY + 0.95,
      Z(-28.34),
      { seg: false },
    );
    b.boxMM(
      "linen",
      X(-1.7),
      oy + CY + 1.0,
      Z(-29.5),
      X(1.7),
      oy + CY + 1.04,
      Z(-28.3),
      { seg: false },
    );
    PF.colMM(X(-1.6), oy + CY, Z(-29.4), X(1.6), oy + CY + 1.04, Z(-28.3), {
      walkable: false,
    });
    for (const dx of [-1.2, 1.2]) {
      b.lathe(
        "brass",
        [
          [0.12, 0],
          [0.05, 0.05],
          [0.03, 0.55],
          [0.06, 0.6],
          [0.02, 0.62],
        ],
        8,
        X(dx),
        oy + CY + 1.04,
        Z(-29.1),
        {},
      );
      PF.candles(b, X(dx), oy + CY + 1.66, Z(-29.1), 1, dx * 9, root);
    }
    PF.candles(b, X(0.3), oy + CY + 1.04, Z(-28.7), 9, 77, root);
    for (let i = 0; i < 14; i++)
      b.cyl(
        "chrome",
        X(-1.2 + r() * 2.4),
        oy + CY + 1.04,
        Z(-28.9 + r() * 0.5),
        0.03,
        0.03,
        0.01,
        8,
        { hSeg: 1 },
      );
    // pulpit (hexagonal, carved, with a sounding board) and eagle lectern
    b.cyl("oak", X(4.2), oy, Z(-18.2), 0.8, 0.5, 1.6, 6, { hSeg: 1 });
    b.cyl("oak", X(4.2), oy + 1.6, Z(-18.2), 0.95, 0.95, 1.1, 6, {
      hSeg: 1,
      open: false,
    });
    b.cyl("oak", X(4.2), oy + 4.4, Z(-18.2), 1.2, 1.2, 0.12, 6, { hSeg: 1 });
    b.cyl("iron", X(4.2), oy + 4.5, Z(-18.2), 0.02, 0.02, 9.2, 3, { hSeg: 1 });
    PF.col(X(4.2), Z(-18.2), 1.9, 1.9, oy, oy + 2.7, 0, { walkable: false });
    b.cyl("brass", X(-4.0), oy, Z(-18.6), 0.08, 0.3, 1.2, 8, { hSeg: 1 });
    b.box("brass", X(-4.0), oy + 1.2, Z(-18.6), 0.2, 0.3, 0.6, {
      rx: -0.4,
      seg: false,
    });
    b.box("brass", X(-4.0), oy + 1.35, Z(-18.6), 0.9, 0.05, 0.5, {
      rx: -0.3,
      seg: false,
    });
    PF.col(X(-4.0), Z(-18.6), 0.7, 0.7, oy, oy + 1.4, 0, { walkable: false });
    anchors.reverend = A(3.2, 0, -16.2, PI - 0.3);
    anchors.npc1 = A(3.2, 0, -16.2, PI);
    anchors.altar = A(0, CY, -27.4, 0);

    // ------------------------------------------------------------------
    // ORGAN LOFT (y 7) over the south end of the nave, z 19.4..24
    // ------------------------------------------------------------------
    const OL = 7;
    b.boxMM("oak", X(-6), oy + OL - 0.45, Z(19.4), X(6), oy + OL, Z(NZ1), {
      grime: 0.5,
    });
    PF.colMM(X(-6), oy + OL - 0.45, Z(19.4), X(6), oy + OL, Z(NZ1), {
      surface: "wood",
    });
    for (const x of [-3.2, 3.2]) {
      b.cyl("limestone", X(x), oy, Z(19.8), 0.22, 0.25, OL - 0.45, 8, {
        hSeg: 1,
      });
      PF.col(X(x), Z(19.8), 0.5, 0.5, oy, oy + OL - 0.45, 0, {
        walkable: false,
      });
    }
    K.balustrade(
      b,
      "oak",
      [
        [X(-6), Z(19.5)],
        [X(6), Z(19.5)],
      ],
      oy + OL,
      1.0,
      { collide: true },
    );
    // organ case & pipes (east + west of the loft), console in the middle
    for (const sx of [-1, 1]) {
      b.boxMM(
        "oak",
        X(sx * 3.4),
        oy + OL,
        Z(22),
        X(sx * 6),
        oy + OL + 3,
        Z(24),
        { grime: 0.5 },
      );
      PF.colMM(
        X(Math.min(sx * 3.4, sx * 6)),
        oy + OL,
        Z(22),
        X(Math.max(sx * 3.4, sx * 6)),
        oy + OL + 3,
        Z(24),
        { walkable: false },
      );
      for (let i = 0; i < 9; i++) {
        const x = sx * (3.6 + i * 0.27),
          h = 2.5 + Math.sin((i / 8) * PI) * 3.0 + (i % 2) * 0.4;
        if (r() < 0.12) continue; // stolen pipes
        b.cyl("brass", X(x), oy + OL + 3, Z(22.3), 0.11, 0.11, h, 8, {
          hSeg: 1,
        });
        b.cyl("brass", X(x), oy + OL + 3 - 0.2, Z(22.3), 0.11, 0.02, 0.2, 8, {
          hSeg: 1,
        });
      }
    }
    b.box("oak", X(0), oy + OL, Z(22.6), 2.0, 1.1, 1.0, { seg: false });
    b.box("paint_cream", X(0), oy + OL + 0.8, Z(22.1), 1.8, 0.05, 0.3, {
      rx: -0.2,
      seg: false,
    });
    b.box("oak", X(0), oy + OL + 1.1, Z(23.0), 2.0, 0.9, 0.2, { seg: false });
    PF.col(X(0), Z(22.8), 2.0, 1.2, oy + OL, oy + OL + 1.1, 0, {
      walkable: false,
    });
    D.chair(b, X(0), oy + OL, Z(21.6), PI, false, "oak");
    PF.skeleton(b, X(1.8), oy + OL + 0.02, Z(21.2), 0.4);
    anchors.organ = A(0, OL, 21, 0);

    // ------------------------------------------------------------------
    // VESTRY (east side room x 6.2..10.6, z -32.6..-20.6)
    // ------------------------------------------------------------------
    b.boxMM("planks", X(6.2), oy - 0.5, Z(-32.6), X(10.6), oy, Z(-20.6), {
      grime: 0.5,
    });
    PF.colMM(X(6.2), oy - 0.5, Z(-32.6), X(10.6), oy, Z(-20.6), {
      surface: "wood",
    });
    b.boxMM("brownstone_t", X(10.6), oy, Z(-33.2), X(11.2), oy + 9, Z(-20), {
      grime: 0.5,
    });
    b.boxMM("brownstone_t", X(6.2), oy, Z(-33.2), X(11.2), oy + 9, Z(-32.6), {
      grime: 0.5,
    });
    PF.colMM(X(10.6), oy, Z(-33.2), X(11.2), oy + 9, Z(-20), {
      walkable: false,
    });
    PF.colMM(X(6.2), oy, Z(-33.2), X(11.2), oy + 9, Z(-32.6), {
      walkable: false,
    });
    b.boxMM(
      "plaster_w",
      X(6.2),
      oy + 4.2,
      Z(-32.6),
      X(10.6),
      oy + 4.5,
      Z(-20.6),
      { seg: false },
    );
    // vestment wardrobe, desk + terminal, cot, washstand, the safe
    b.boxMM("oak", X(9.6), oy, Z(-32.4), X(10.55), oy + 2.3, Z(-29.4), {
      grime: 0.5,
    });
    for (let i = 0; i < 5; i++)
      b.box(
        i % 2 ? "linen" : "velvet",
        X(9.9),
        oy + 0.7,
        Z(-31.9 + i * 0.5),
        0.1,
        1.3,
        0.4,
        { seg: false },
      );
    PF.colMM(X(9.6), oy, Z(-32.4), X(10.55), oy + 2.3, Z(-29.4), {
      walkable: false,
    });
    b.box("iron", X(7.2), oy + 0.35, Z(-31.2), 0.9, 0.06, 2.0, { seg: false });
    b.box("linen", X(7.2), oy + 0.41, Z(-31.2), 0.85, 0.14, 1.95, {
      seg: false,
      c: 0xa89a80,
    });
    PF.col(X(7.2), Z(-31.2), 0.9, 2.0, oy, oy + 0.55, 0, { surface: "wood" });
    D.shelf(b, X(10.3), oy, Z(-24.5), -HP, 2.6, 4, 55);
    b.box("lamp_warm", X(8.4), oy + 3.9, Z(-26.5), 0.4, 0.08, 0.4, {
      seg: false,
      noAO: true,
    });
    PF.glow(P(8.4, 3.8, -26.5), 0xffd8a0, 1.2, root, { intensity: 0.9 });
    anchors.terminal = A(8.2, 0, -27.4, 0);
    anchors.safe = A(10.1, 0, -27.8, -HP);
    anchors.vestry = A(8.4, 0, -23, PI);

    // ------------------------------------------------------------------
    // CRYPT STAIR ROOM (west side room x -10.6..-6.2, z -32.6..-20.6) + crypt door
    // ------------------------------------------------------------------
    b.boxMM("brownstone_t", X(-11.2), oy, Z(-33.2), X(-10.6), oy + 9, Z(-20), {
      grime: 0.5,
    });
    b.boxMM("brownstone_t", X(-11.2), oy, Z(-33.2), X(-6.2), oy + 9, Z(-32.6), {
      grime: 0.5,
    });
    PF.colMM(X(-11.2), oy, Z(-33.2), X(-10.6), oy + 9, Z(-20), {
      walkable: false,
    });
    PF.colMM(X(-11.2), oy, Z(-33.2), X(-6.2), oy + 9, Z(-32.6), {
      walkable: false,
    });
    b.boxMM(
      "plaster_w",
      X(-10.6),
      oy + 4.2,
      Z(-32.6),
      X(-6.2),
      oy + 4.5,
      Z(-20.6),
      { seg: false },
    );
    // floor with the stairwell opening (x -9.4..-7.4, z -30.8..-22.2)
    b.boxMM("planks", X(-10.6), oy - 0.5, Z(-22.2), X(-6.2), oy, Z(-20.6), {
      grime: 0.5,
    });
    b.boxMM("planks", X(-10.6), oy - 0.5, Z(-32.6), X(-9.4), oy, Z(-22.2), {
      grime: 0.5,
    });
    b.boxMM("planks", X(-7.4), oy - 0.5, Z(-32.6), X(-6.2), oy, Z(-22.2), {
      grime: 0.5,
    });
    b.boxMM("planks", X(-9.4), oy - 0.5, Z(-32.6), X(-7.4), oy, Z(-30.8), {
      grime: 0.5,
    });
    PF.colMM(X(-10.6), oy - 0.5, Z(-22.2), X(-6.2), oy, Z(-20.6), {
      surface: "wood",
    });
    PF.colMM(X(-10.6), oy - 0.5, Z(-32.6), X(-9.4), oy, Z(-22.2), {
      surface: "wood",
    });
    PF.colMM(X(-7.4), oy - 0.5, Z(-32.6), X(-6.2), oy, Z(-22.2), {
      surface: "wood",
    });
    PF.colMM(X(-9.4), oy - 0.5, Z(-32.6), X(-7.4), oy, Z(-30.8), {
      surface: "wood",
    });
    PF.railing(
      b,
      [
        [X(-9.4), Z(-30.8)],
        [X(-9.4), Z(-22.3)],
      ],
      oy,
      1.0,
      "iron",
      { collide: true },
    );
    PF.railing(
      b,
      [
        [X(-7.4), Z(-30.8)],
        [X(-7.4), Z(-22.3)],
      ],
      oy,
      1.0,
      "iron",
      { collide: true },
    );
    PF.railing(
      b,
      [
        [X(-9.4), Z(-30.8)],
        [X(-7.4), Z(-30.8)],
      ],
      oy,
      1.0,
      "iron",
      { collide: true },
    );
    // stairs down from y 0 (z -22.2) to y -5 (z -30.6), heading north
    PF.stairs(b, "brownstone_dk", X(-8.4), Z(-30.6), 0, 2.0, 8.4, oy - 5, oy, {
      base: oy - 5.3,
    });
    // crypt door: iron grille in the aisle-end doorway (x -9.2..-7.6 at z -20.3)
    const grille = new THREE.Group();
    grille.name = "pf_tr_crypt_grille";
    {
      const gb = PF.batch("trinity_grille");
      for (let i = 0; i < 9; i++)
        gb.box("iron", -0.7 + i * 0.175, 0, 0, 0.035, 2.5, 0.035, {
          seg: false,
        });
      for (const y of [0.2, 1.2, 2.3])
        gb.box("iron", 0, y, 0, 1.6, 0.06, 0.05, { seg: false });
      gb.box("iron", 0.55, 1.1, 0.05, 0.12, 0.22, 0.08, { seg: false });
      gb.build(grille);
      grille.position.set(X(-8.4), oy, Z(-20.3));
      root.add(grille);
    }
    const gcol = { c: null };
    const setGrille = (open) => {
      grille.rotation.y = open ? -1.7 : 0;
      grille.position.x = X(-8.4) + (open ? -0.8 : 0);
      grille.position.z = Z(-20.3) + (open ? -0.75 : 0);
      if (!open && !gcol.c)
        gcol.c = PF.col(X(-8.4), Z(-20.3), 1.6, 0.3, oy, oy + 2.6, 0, {
          walkable: false,
        });
      if (open && gcol.c) {
        G.world.removeCollider(gcol.c);
        gcol.c = null;
      }
    };
    setGrille(false);
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "tr_crypt_open")
        setGrille(!!PF.flag("tr_crypt_open"));
    });
    PF.onReset.push(() => setGrille(false));
    PF.use({
      pos: P(-8.4, 1.3, -20.2),
      radius: 0.9,
      range: 2.6,
      label: () => (PF.flag("tr_crypt_open") ? "Crypt Gate" : "Crypt Gate"),
      verb: () =>
        PF.flag("tr_crypt_open")
          ? "Close"
          : PF.inv.count("pf_crypt_key")
            ? "Unlock"
            : "Open",
      locked: () =>
        !PF.flag("tr_crypt_open") &&
        !PF.inv.count("pf_crypt_key") &&
        !PF.lockIsOpen(TR_LOCKS.crypt.id)
          ? "Locked — Reverend Penhallow has the key"
          : null,
      onInteract() {
        if (PF.flag("tr_crypt_open")) {
          PF.setFlag("tr_crypt_open", false);
          PF.sfx("door_open", P(-8.4, 1, -20.3));
          return;
        }
        const open = () => {
          PF.setFlag("tr_crypt_open", true);
          PF.sfx("door_open", P(-8.4, 1, -20.3));
          PF.q.advance("pf_dust", ["talk", "key"], "crypt");
        };
        PF.lockOpen(TR_LOCKS.crypt, open); // key-only: Reverend Penhallow hands it over (and has a spare)
      },
    });
    const cryptSign = PF.texMat(
      "trinity_crypt_sign",
      PF.signTex(
        "trinity_crypt_sign",
        ["CRYPT — KEEP OUT", "(IT'S NOT THE DEAD. IT'S THE ONES WHO SCREAM.)"],
        "raider",
        512,
        160,
        { bg: "#5a5040", fg: "#e0d8c0" },
      ),
    );
    b.quad(cryptSign, X(-8.4), oy + 3.0, Z(-19.96), 1.8, 0.56, {});
    anchors.crypt_door = A(-8.4, 0, -18.8, PI);

    // ------------------------------------------------------------------
    // CRYPT (floor y -5, ceiling ~ -0.5): x -11..11, z -32.6..20
    // ------------------------------------------------------------------
    const CF = -5;
    const cryptFloor = (x0, z0, x1, z1, y) => {
      b.boxMM(
        "granite",
        X(x0),
        oy + (y || CF) - 0.5,
        Z(z0),
        X(x1),
        oy + (y || CF),
        Z(z1),
        { grime: 0.7 },
      );
      PF.colMM(
        X(x0),
        oy + (y || CF) - 0.5,
        Z(z0),
        X(x1),
        oy + (y || CF),
        Z(z1),
      );
    };
    cryptFloor(-11, -32.6, 11, 5);
    cryptFloor(-11, 5, 2, 20);
    cryptFloor(2, 5, 11, 20, CF - 0.7); // the flooded vault (sunken)
    b.boxMM("granite", X(1.6), oy + CF - 0.7, Z(5), X(2.0), oy + CF, Z(20), {
      seg: false,
    });
    // stepping blocks out of the pool
    for (let i = 0; i < 4; i++) {
      b.box(
        "granite",
        X(2.6 + i * 0.8),
        oy + CF - 0.7,
        Z(12 + i * 0.3),
        0.7,
        0.4 + i * 0.07,
        0.7,
        { seg: false },
      );
    }
    PF.stairs(
      b,
      "granite",
      X(3.5),
      Z(5.1),
      PI,
      3,
      1.4,
      oy + CF - 0.7,
      oy + CF,
      { base: oy + CF - 0.8 },
    );
    // radioactive water
    b.boxMM("goo", X(2), oy + CF - 0.35, Z(5), X(11), oy + CF - 0.3, Z(20), {
      seg: false,
      uv: "box",
      grime: 0,
      noAO: true,
    });
    PF.safe("rad", () =>
      G.world.addRadSource({
        x: X(7),
        y: oy + CF - 0.3,
        z: Z(13),
        radius: 6.5,
        strength: 3.5,
      }),
    );
    // perimeter walls
    K.room(
      b,
      "schist",
      X(-11.6),
      Z(-33.2),
      X(11.6),
      Z(20.6),
      oy + CF - 0.8,
      oy - 0.45,
      0.6,
      [
        { side: "s", c: X(-6), w: 2.6, h: 3.0 }, // the breach (colonial tunnel)
        { side: "s", c: X(-8.9), w: 1.9, h: 6.0 }, // the return stair passes under the aisle
      ],
      { grime: 0.6 },
    );
    // ceiling (underside of the nave floor)
    b.boxMM("schist", X(-7.4), oy - 0.6, Z(-32.6), X(11), oy - 0.5, Z(20), {
      seg: false,
    });
    b.boxMM("schist", X(-11), oy - 0.6, Z(-22.2), X(-7.4), oy - 0.5, Z(14), {
      seg: false,
    });
    b.boxMM("schist", X(-11), oy - 0.6, Z(-32.6), X(-9.4), oy - 0.5, Z(-22.2), {
      seg: false,
    });
    b.boxMM("schist", X(-11), oy - 0.6, Z(14), X(-9.8), oy - 0.5, Z(20), {
      seg: false,
    });
    b.boxMM("schist", X(-8.0), oy - 0.6, Z(14), X(-7.4), oy - 0.5, Z(20), {
      seg: false,
    });
    // pier grid + transverse pointed arches
    const cpx = [-7.5, -3.5, 3.5, 7.5],
      cpz = [-28, -23, -18, -13, -8, -3, 2, 7, 12, 17];
    for (const x of cpx)
      for (const z of cpz) {
        if (x > 0 && z > 5) {
          /* piers in the pool are shorter bases */
        }
        const y0 = oy + (x > 1.6 && z > 5 && z < 20 ? CF - 0.7 : CF);
        b.box("schist", X(x), y0, Z(z), 0.9, oy - 0.5 - y0, 0.9, {
          seg: false,
          grime: 0.6,
        });
        PF.col(X(x), Z(z), 0.9, 0.9, y0, oy - 0.5, 0, { walkable: false });
      }
    for (const z of cpz)
      for (const [xa, xb] of [
        [-11, -7.5],
        [-7.5, -3.5],
        [-3.5, 3.5],
        [3.5, 7.5],
        [7.5, 11],
      ])
        rib(b, "schist", X(xa), X(xb), Z(z), oy - 2.6, 2.0, 0.45);
    for (const x of cpx)
      for (let i = 0; i < cpz.length - 1; i++) {
        // longitudinal arches between piers (z direction): approximate with a lintel-arch of beams
        const za = cpz[i],
          zb = cpz[i + 1],
          N = 6;
        let prev = null;
        for (let k = 0; k <= N; k++) {
          const z = za + ((zb - za) * k) / N;
          const p = P(x, archY(z, za, zb, -2.6, 2.0) - 0.15, z);
          if (prev) b.beam("schist", prev, p, 0.45, 0.45, { grime: 0.5 });
          prev = p;
        }
      }
    // wall niches (loculi) with slabs, some broken open showing bones
    for (const sx of [-1, 1])
      for (let z = -30; z < 18; z += 2.1) {
        if (sx < 0 && z > -31 && z < -28) continue;
        for (let row = 0; row < 3; row++) {
          const y = oy + CF + 0.3 + row * 1.05;
          const open = r() < 0.3;
          b.box(
            open ? "bone" : "limestone",
            X(sx * 10.9),
            y,
            Z(z),
            0.12,
            0.85,
            1.7,
            { seg: false, grime: 0.8, c: open ? 0x6a6050 : 0xffffff },
          );
          if (open) {
            b.sphere("bone", X(sx * 10.75), y + 0.2, Z(z + 0.3), 0.11, {
              ws: 6,
              hs: 4,
            });
            b.box(
              "bone",
              X(sx * 10.75),
              y + 0.05,
              Z(z - 0.2),
              0.06,
              0.05,
              0.8,
              { seg: false },
            );
          }
        }
      }
    // sarcophagi with recumbent effigies between the piers
    const sarcs = [
      [-5.5, -25.5],
      [5.5, -25.5],
      [-5.5, -15.5],
      [5.5, -15.5],
      [-5.5, -5.5],
      [0, -10.5],
      [5.5, -5.5],
      [5.5, 1.5],
    ];
    for (const [x, z] of sarcs) {
      b.boxMM(
        "limestone",
        X(x - 0.8),
        oy + CF,
        Z(z - 1.3),
        X(x + 0.8),
        oy + CF + 0.9,
        Z(z + 1.3),
        { grime: 0.7 },
      );
      b.boxMM(
        "limestone",
        X(x - 0.9),
        oy + CF + 0.9,
        Z(z - 1.4),
        X(x + 0.9),
        oy + CF + 1.05,
        Z(z + 1.4),
        { seg: false },
      );
      b.cyl("limestone", X(x), oy + CF + 1.25, Z(z), 0.28, 0.24, 1.6, 8, {
        hSeg: 1,
        rx: HP,
      });
      b.sphere("limestone", X(x), oy + CF + 1.25, Z(z - 1.05), 0.16, {
        ws: 7,
        hs: 5,
      });
      for (let k = 0; k < 3; k++)
        b.box(
          "limestone",
          X(x - 0.7 + k * 0.7),
          oy + CF + 0.2,
          Z(z + 1.31),
          0.4,
          0.5,
          0.03,
          { seg: false },
        );
      PF.colMM(
        X(x - 0.9),
        oy + CF,
        Z(z - 1.4),
        X(x + 0.9),
        oy + CF + 1.05,
        Z(z + 1.4),
      );
    }
    // ossuary under the chancel: walls of skulls & long bones, a skull cross
    for (const sx of [-1, 1]) {
      const wx = sx * 3.05;
      for (let row = 0; row < 7; row++)
        for (let i = 0; i < 16; i++) {
          const z = -31.9 + i * 0.52 + (row % 2) * 0.26,
            y = oy + CF + 0.25 + row * 0.42;
          if (row % 3 === 2)
            b.cyl("bone", X(wx - sx * 0.12), y, Z(z), 0.035, 0.035, 0.48, 4, {
              hSeg: 1,
              rx: HP,
            });
          else
            b.sphere("bone", X(wx - sx * 0.1), y + 0.1, Z(z), 0.14, {
              ws: 6,
              hs: 5,
              grime: 0.6,
            });
        }
      b.boxMM(
        "schist",
        X(Math.min(wx, wx + sx * 0.4)),
        oy + CF,
        Z(-32.6),
        X(Math.max(wx, wx + sx * 0.4)),
        oy - 0.5,
        Z(-23.5),
        { seg: false },
      );
      PF.colMM(
        X(Math.min(wx - sx * 0.2, wx + sx * 0.4)),
        oy + CF,
        Z(-32.6),
        X(Math.max(wx - sx * 0.2, wx + sx * 0.4)),
        oy - 0.5,
        Z(-23.5),
        { walkable: false },
      );
    }
    for (let i = 0; i < 9; i++)
      b.sphere("bone", X(0), oy + CF + 0.9 + i * 0.3, Z(-32.45), 0.13, {
        ws: 6,
        hs: 5,
      });
    for (let i = -3; i <= 3; i++)
      if (i)
        b.sphere("bone", X(i * 0.3), oy + CF + 2.7, Z(-32.45), 0.13, {
          ws: 6,
          hs: 5,
        });
    PF.candles(b, X(-1.2), oy + CF, Z(-31.8), 6, 991, root);
    PF.candles(b, X(1.2), oy + CF, Z(-31.8), 5, 992, root);
    // candles on sarcophagi + the Sexton's lamp
    for (const [x, z] of [
      [-5.5, -15.5],
      [0, -10.5],
      [5.5, 1.5],
    ])
      PF.candles(
        b,
        X(x + 0.5),
        oy + CF + 1.05,
        Z(z + 0.9),
        4,
        x * 13 + z,
        root,
      );
    // cobwebs / rubble / bones
    D.rubble(b, X(-9), oy + CF, Z(16), 0.9, 6, 31);
    D.rubble(b, X(-3.8), oy + CF, Z(18.6), 0.6, 4, 32);
    PF.skeleton(b, X(-1.5), oy + CF + 0.02, Z(-2), 1.1);
    PF.skeleton(b, X(9.6), oy + CF - 0.68, Z(17.2), 2.6);
    anchors.crypt = A(-6, CF, -20, 0);
    anchors.spawn1 = A(-5.5, CF, -20.5, 0);
    anchors.spawn2 = A(0, CF, -3, 0);
    anchors.spawn3 = A(-6, CF, 13, 0);
    anchors.spawn4 = A(0, CF, 10, 0);
    anchors.spawn5 = A(-6, CF - 2, 36, 0);
    anchors.spawn6 = A(-3, CF - 2, 39, 0);
    anchors.loot1 = A(5.5, CF, -15.5, 0);
    anchors.loot2 = A(-10.2, CF, 4.5, 0);

    // ---- the one-way return stair: crypt (z 8, y -5) → west aisle (z 23, y 0), gate at the top ----
    PF.stairs(b, "brownstone_dk", X(-8.9), Z(8.2), 0, 1.8, 14.6, oy + CF, oy, {
      base: oy + CF - 0.3,
    });
    b.boxMM("schist", X(-8.0), oy + CF, Z(8), X(-7.6), oy - 0.5, Z(20), {
      seg: false,
    });
    PF.colMM(X(-8.0), oy + CF, Z(8), X(-7.6), oy - 0.5, Z(20), {
      walkable: false,
    });
    PF.railing(
      b,
      [
        [X(-8.0), Z(15)],
        [X(-8.0), Z(22.8)],
      ],
      oy,
      1.0,
      "iron",
      { collide: true },
    );
    PF.railing(
      b,
      [
        [X(-9.8), Z(15)],
        [X(-8.0), Z(15)],
      ],
      oy,
      1.0,
      "iron",
      { collide: true },
    );
    const bolt = new THREE.Group();
    {
      const gb = PF.batch("trinity_bolt");
      for (let i = 0; i < 9; i++)
        gb.box("iron", -0.85 + i * 0.21, 0, 0, 0.035, 2.2, 0.035, {
          seg: false,
        });
      for (const y of [0.3, 1.1, 2.0])
        gb.box("iron", 0, y, 0, 1.8, 0.06, 0.05, { seg: false });
      gb.box("rust", 0, 1.1, -0.12, 0.6, 0.12, 0.12, { seg: false });
      gb.build(bolt);
      bolt.position.set(X(-8.9), oy, Z(22.9));
      root.add(bolt);
    }
    const bcol = { c: null };
    const setBolt = (open) => {
      bolt.position.y = oy + (open ? 2.3 : 0);
      if (!open && !bcol.c)
        bcol.c = PF.col(X(-8.9), Z(22.9), 1.8, 0.3, oy - 1.5, oy + 2.4, 0, {
          walkable: false,
        });
      if (open && bcol.c) {
        G.world.removeCollider(bcol.c);
        bcol.c = null;
      }
    };
    setBolt(false);
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "tr_crypt_gate")
        setBolt(!!PF.flag("tr_crypt_gate"));
    });
    PF.onReset.push(() => setBolt(false));
    PF.use({
      pos: P(-8.9, 0.6, 22.4),
      radius: 0.9,
      range: 2.8,
      label: "Crypt Gate",
      verb: () =>
        PF.flag("tr_crypt_gate")
          ? "Examine"
          : G.player.pos.y < oy - 0.3
            ? "Unbolt"
            : "Open",
      locked: () =>
        !PF.flag("tr_crypt_gate") && G.player.pos.y >= oy - 0.3
          ? "Bolted from the other side"
          : null,
      onInteract() {
        if (PF.flag("tr_crypt_gate")) {
          G.notify("The gate is chained open. A quick way out of the crypt.");
          return;
        }
        if (G.player.pos.y < oy - 0.3) {
          PF.setFlag("tr_crypt_gate", true);
          PF.sfx("door_open", P(-8.9, 0, 22.9));
          G.notify(
            "You slide the rusted bolt. The gate swings up into the aisle.",
          );
        } else {
          PF.sfx("door_locked");
          G.notify("The gate is bolted from below.");
        }
      },
    });

    // ---- the breach & colonial tunnel → the Maniac nest ---------------------
    // tunnel from the breach (x -6, z 20.6) sloping down south to y -7 at z 31, nest chamber z 31..42
    const TNF = -7;
    PF.stepPath(X(-6), Z(20.3), 0, 2.4, 11, (t) => oy + CF + (TNF - CF) * t, {
      maxRise: 0.25,
      thick: 0.6,
    });
    for (let k = 0; k < 11; k++) {
      const z = 20.8 + k,
        y = oy + CF + (TNF - CF) * (k / 11);
      b.box("dirt", X(-6), y - 0.4, Z(z), 2.6, 0.4, 1.05, {
        seg: false,
        grime: 0.5,
      });
      b.box("schist", X(-7.6), y, Z(z), 0.6, 3.0, 1.05, {
        seg: false,
        grime: 0.7,
      });
      b.box("schist", X(-4.4), y, Z(z), 0.6, 3.0, 1.05, {
        seg: false,
        grime: 0.7,
      });
      b.box("rotten", X(-6), y + 2.8, Z(z), 3.2, 0.25, 0.3, { seg: false }); // timber shoring
      if (k % 2 === 0)
        for (const sx of [-1, 1])
          b.box("rotten", X(-6 + sx * 1.25), y, Z(z), 0.2, 2.8, 0.2, {
            seg: false,
          });
    }
    PF.colMM(X(-7.9), oy + TNF - 1, Z(20.6), X(-7.3), oy + CF + 3, Z(31), {
      walkable: false,
    });
    PF.colMM(X(-4.7), oy + TNF - 1, Z(20.6), X(-4.1), oy + CF + 3, Z(31), {
      walkable: false,
    });
    // nest chamber (rough cave-cut room)
    b.boxMM("dirt", X(-11), oy + TNF - 0.5, Z(31), X(-1), oy + TNF, Z(42), {
      grime: 0.6,
    });
    PF.colMM(X(-11), oy + TNF - 0.5, Z(31), X(-1), oy + TNF, Z(42), {
      surface: "dirt",
    });
    K.room(
      b,
      "schist",
      X(-11.6),
      Z(31),
      X(-0.4),
      Z(42.6),
      oy + TNF,
      oy + TNF + 3.6,
      0.6,
      [{ side: "n", c: X(-6), w: 2.6, h: 3.4 }],
      { grime: 0.8 },
    );
    b.boxMM(
      "schist",
      X(-11),
      oy + TNF + 3.5,
      Z(31),
      X(-1),
      oy + TNF + 3.9,
      Z(42),
      { seg: false },
    );
    for (let i = 0; i < 6; i++)
      b.rock(
        "rock",
        X(-10 + r() * 8),
        oy + TNF,
        Z(33 + r() * 8),
        0.5 + r() * 0.6,
        { flat: 0.6 },
      );
    for (let i = 0; i < 5; i++)
      D.mattress(
        b,
        X(-9.5 + i * 1.8),
        oy + TNF + 0.02,
        Z(40.5 - (i % 2) * 1.2),
        r() * PI,
        0x6a5a40,
      );
    for (let i = 0; i < 14; i++)
      b.box(
        "bone",
        X(-10 + r() * 8),
        oy + TNF + 0.03,
        Z(32 + r() * 9),
        0.05,
        0.05,
        0.35 + r() * 0.3,
        { ry: r() * PI, seg: false },
      );
    PF.skeleton(b, X(-3), oy + TNF + 0.02, Z(37), 0.9);
    b.cyl("lamp_green", X(-2.2), oy + TNF, Z(40.5), 0.16, 0.2, 0.3, 6, {
      hSeg: 1,
      noAO: true,
    });
    PF.glow(P(-2.2, TNF + 0.3, 40.5), 0x70ff80, 1.2, root, {
      intensity: 0.9,
      flicker: 0.3,
    });
    anchors.breach = A(-6, CF, 19.6, 0);
    anchors.nest = A(-6, TNF, 37, 0);
    anchors.boss = A(-6, TNF, 39.5, 0);

    // breach interaction (seal the tunnel)
    PF.use({
      pos: P(-6, CF + 1.4, 20.4),
      radius: 1.2,
      range: 3.0,
      label: "The Breach",
      verb: () => (PF.flag("tr_breach") ? "Examine" : "Seal"),
      enabled: () => !!G.player && G.player.pos.z < Z(20.4),
      onInteract() {
        if (PF.flag("tr_breach")) {
          G.notify(
            "The breach is sealed. Nothing is scratching at the chancel any more.",
          );
          return;
        }
        if (PF.live("dialogue") && G.dialogue.start)
          G.dialogue.start("pf_dlg_breach", null, { name: "The Breach" });
        else sealBreach("rubble");
      },
    });
    const sealMesh = new THREE.Group();
    {
      const gb = PF.batch("trinity_seal");
      for (let i = 0; i < 6; i++)
        gb.box("rotten", 0, 0.2 + i * 0.45, 0, 2.8, 0.35, 0.3, {
          rz: i % 2 ? 0.05 : -0.05,
          seg: false,
          grime: 0.6,
        });
      gb.rock("rubble", -0.6, 0, 0.5, 0.8, { flat: 0.6 });
      gb.rock("rubble", 0.8, 0, 0.6, 0.7, { flat: 0.6 });
      gb.build(sealMesh);
      sealMesh.position.set(X(-6), oy + CF, Z(20.9));
      sealMesh.visible = false;
      root.add(sealMesh);
    }
    const scol = { c: null };
    const applySeal = () => {
      const s = !!PF.flag("tr_breach");
      sealMesh.visible = s;
      if (s && !scol.c)
        scol.c = PF.col(
          X(-6),
          Z(20.9),
          3.0,
          0.6,
          oy + CF - 0.5,
          oy + CF + 3.2,
          0,
          { walkable: false },
        );
      if (!s && scol.c) {
        G.world.removeCollider(scol.c);
        scol.c = null;
      }
    };
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "tr_breach") applySeal();
    });
    PF.onReset.push(() => {
      if (scol.c) {
        G.world.removeCollider(scol.c);
        scol.c = null;
      }
      sealMesh.visible = false;
    });
    PF.trBreachPos = P(-6, CF + 1, 20);

    const g = b.build(root, { lodDistInt: 400 });
    g.name = "trinity_interior";

    // triggers: entering the crypt → quest update; reaching the nest
    PF.trigger(
      {
        x0: X(-11),
        x1: X(11),
        y0: oy + CF - 1,
        y1: oy + CF + 2,
        z0: Z(-32),
        z1: Z(19),
      },
      () => {
        PF.q.advance("pf_dust", ["talk", "key", "crypt"], "clear");
      },
      {
        cond: () =>
          PF.q.active("pf_dust") &&
          ["talk", "key", "crypt"].indexOf(PF.q.stage("pf_dust")) >= 0,
      },
    );
    PF.trigger(
      {
        x0: X(-11),
        x1: X(-1),
        y0: oy + TNF - 1,
        y1: oy + TNF + 3,
        z0: Z(31),
        z1: Z(42),
      },
      () => {
        G.notify(
          "The smell of old death and new rot. Something has been nesting down here.",
        );
      },
      { cond: () => PF.q.active("pf_dust") },
    );
    return anchors;
  }

  // ===================================================================
  // Sealing the breach (dialogue actions call this)
  // ===================================================================
