// play-inline-178 05 — tint
// Lines 1042-2109 of readable/play-inline-178.pretty.js (statement-aligned).
  function buildInterior(rec) {
    const O = G.LAYOUT.INTERIORS.penn_station.origin;
    const ox = O.x,
      oz = O.z;
    const b = K.builder("penn_int", {
      grime: 0.4,
      ambient: 1.0,
      maxLight: 2.8,
      gain: 1.3,
    });
    const glows = K.glowSet("penn_int");
    const WY = -4,
      PY = -12,
      BEDY = PY - 1.2;
    const stone = 0xd8c4b0,
      stone2 = 0xc8b4a0;
    // ---- baked lights ----
    b.light(ox, 6, oz + 34, 18, 0xe0e8c8, 1.0); // arcade skylight
    for (const x of [-26, 26]) b.light(ox + x, 12, oz - 4, 24, 0xd8e4b0, 1.3); // thermal windows
    b.light(ox, 12, oz - 4, 28, 0xe8e0c0, 1.0); // waiting-room ceiling
    b.light(ox + 26, 1, oz - 18, 10, 0xffd8a0, 0.6); // ticket office lamps
    for (const x of [-24, -8, 8, 24])
      for (const z of [-44, -28]) b.light(ox + x, 5, oz + z, 20, 0xd8e8b8, 1.0); // concourse glass
    for (let x = -34; x <= 34; x += 17)
      for (const z of [-40, -57])
        b.light(ox + x, PY + 4.5, oz + z, 13, 0xc8d8a0, 0.8); // platforms
    b.light(ox + 50, PY + 1, oz - 57, 16, 0x60ff60, 1.2); // the Conductor's tunnel (rad leak)
    b.light(ox + 40, WY + 3, oz - 15, 10, 0xffc880, 0.6); // baggage room

    // =========================== ARCADE ===========================
    const AX0 = ox - 6,
      AX1 = ox + 6,
      AZ0 = oz + 12,
      AZ1 = oz + 50,
      AH = 5;
    K.room(b, {
      x0: AX0,
      x1: AX1,
      z0: oz + 20,
      z1: AZ1,
      y: 0,
      h: AH,
      floor: "terrazzo",
      wall: "limestone",
      ceil: null,
      walls: "sew",
      doors: { s: [{ at: 6, w: 3, h: 3.6 }] },
      base: "marble_black",
      floorTint: 0xc0b098,
      wallTint: stone,
      grime: 0.5,
    });
    K.skin(b, "limestone", AX0, AZ0, AX0, oz + 20, WY, AH, [ox, oz + 16], [], {
      tint: stone,
    });
    K.skin(b, "limestone", AX1, AZ0, AX1, oz + 20, WY, AH, [ox, oz + 16], [], {
      tint: stone,
    });
    K.vault(b, "plaster", ox, AH, 6, AZ0, AZ1, {
      tint: 0xb8b0a0,
      tile: 3,
      ribMat: "limestone",
      ribStep: 4,
      ribTint: stone2,
      ribEvery: 1,
      ribW: 0.3,
      ribD: 0.35,
    });
    b.box("limestone", ox, AH, AZ1 - 0.15, 12, 6, 0.3, {
      faces: "n",
      tint: stone,
    });
    b.box("limestone", ox, AH, AZ0 + 0.15, 12, 6, 0.3, {
      faces: "s",
      tint: stone,
    });
    // skylight oculi in the vault
    for (let z = oz + 24; z < AZ1 - 3; z += 8) {
      b.geo("atlas_lit", new THREE.CircleGeometry(1.2, 16), {
        x: ox,
        y: AH + 5.95,
        z,
        rx: HP,
        uv: "rect",
        rect: K.litPaint("penn_sky", 256, 256),
      });
      glows.add(ox, AH + 5.8, z, 0xd8e0b0, "m");
      F.shaft(b, ox, AH + 5.9, z, 0.3, 2.2, 9, 0.18, { tint: 0x8a9a70 });
    }
    // shopfronts (niches with signs, dark glass, boarded)
    for (let i = 0; i < 8; i++) {
      const side = i % 2 ? 1 : -1,
        z = oz + 24 + Math.floor(i / 2) * 6.5;
      const x = side < 0 ? AX0 + 0.16 : AX1 - 0.16,
        face = side < 0 ? HP : -HP;
      b.panel("atlas_paint", x, 3.4, z, 3.6, 0.68, face, {
        rect: K.paint("penn_shop" + i, 512, 96),
        grime: 0.3,
        off: 0.02,
      });
      b.panel(
        i % 3 ? "glass_broken" : "wood_rotten",
        x,
        1.5,
        z,
        3.4,
        2.6,
        face,
        { tint: i % 3 ? 0x2a3430 : 0x6a5642, grime: 0.3, off: 0.03 },
      );
      b.box("bronze", x + side * -0.1, 0, z, 0.2, 0.4, 3.8, { tint: 0x6a5030 });
    }
    // toppled statue of the railroad president (pedestal + figure lying on the floor)
    b.box("granite", ox, 0, oz + 30, 2, 1.6, 2, { tint: 0x9a948c });
    K.colBox(ox - 1, 0, oz + 29, ox + 1, 1.6, oz + 31, { surface: "concrete" });
    b.geo("bronze", T.cyl8, {
      x: ox + 1.8,
      y: 0.45,
      z: oz + 32.5,
      sx: 0.45,
      sy: 2.6,
      sz: 0.4,
      rz: HP,
      ry: 0.6,
      tint: 0x4a6a58,
    });
    b.geo("bronze", T.sphereLo, {
      x: ox + 0.5,
      y: 0.35,
      z: oz + 33.4,
      s: 0.3,
      tint: 0x4a6a58,
    });
    F.debris(b, ox - 3, 0, oz + 40, 1.6, 12);
    F.papers(b, AX0, oz + 21, AX1, AZ1 - 1, 0, 28, { tint: 0xb0a488 });
    // grand stair down into the waiting room
    b.stairs("marble_t", ox, oz + 12, 0, 1, 11.4, 8, WY, 0, 10, {
      tint: 0xd8ccb8,
      solid: true,
    });
    for (const sgn of [-1, 1])
      F.railing(b, ox + sgn * 5.6, oz + 20, ox + sgn * 5.6, AZ0, 0, {
        mat: "bronze",
        h: 1,
        col: false,
      });
    // the great hanging clock at the head of the stair
    b.beam("black_metal", ox, AH + 5.8, oz + 18, ox, 4.2, oz + 18, 0.08);
    b.cyl("bronze", ox, 3.2, oz + 18, 0.9, 0.9, 0.35, 20, {
      rx: HP,
      tint: 0x6a5030,
      bottom: true,
    });
    const cd = K.litPaint("penn_clockdial", 256, 256);
    for (const f of [0, PI])
      b.panel("atlas_lit", ox, 3.2, oz + 18 + (f ? -0.19 : 0.19), 1.6, 1.6, f, {
        rect: cd,
        grime: 0,
      });
    glows.add(ox, 3.2, oz + 18, 0xfff0d0, "m");

    // =========================== MAIN WAITING ROOM ===========================
    const RX0 = ox - 32,
      RX1 = ox + 32,
      RZ0 = oz - 20,
      RZ1 = oz + 12,
      SPR = 10,
      RR = (RZ1 - RZ0) / 2;
    K.room(b, {
      x0: RX0,
      x1: RX1,
      z0: RZ0,
      z1: RZ1,
      y: WY,
      h: SPR - WY,
      floor: "marble_cream",
      wall: "limestone",
      ceil: null,
      doors: {
        s: [{ at: 32, w: 12, h: 9 }],
        n: [
          { at: 14, w: 10, h: 6.8, arch: true },
          { at: 32, w: 10, h: 6.8, arch: true },
          { at: 50, w: 10, h: 6.8, arch: true },
        ],
        e: [{ at: 15, w: 2, h: 2.6 }],
      },
      base: "marble_black",
      cornice: "limestone",
      corniceH: 1.2,
      floorTint: 0xd8ccb8,
      wallTint: stone,
      grime: 0.5,
    });
    // barrel vault along x, coffered
    const vcz = (RZ0 + RZ1) / 2;
    for (let i = 0; i < 20; i++) {
      const a0 = (PI * i) / 20,
        a1 = (PI * (i + 1)) / 20;
      const p0 = [vcz + Math.cos(a0) * RR, SPR + Math.sin(a0) * RR],
        p1 = [vcz + Math.cos(a1) * RR, SPR + Math.sin(a1) * RR];
      b.quad(
        "plaster",
        [RX0, p0[1], p0[0]],
        [RX0, p1[1], p1[0]],
        [RX1, p1[1], p1[0]],
        [RX1, p0[1], p0[0]],
        { tint: 0xc8b8a0, grime: 0.3, rect: [0, 0, 64 / 3, 2.5 / 3] },
      );
      if (i % 2 === 0)
        b.beam(
          "limestone",
          RX0,
          p0[1] - 0.2,
          p0[0],
          RX1,
          p0[1] - 0.2,
          p0[0],
          0.35,
          { tint: stone2 },
        );
    }
    for (let x = RX0 + 4; x < RX1; x += 4)
      for (let i = 0; i < 20; i++) {
        const a0 = (PI * i) / 20,
          a1 = (PI * (i + 1)) / 20;
        b.beam(
          "limestone",
          x,
          SPR + Math.sin(a0) * (RR - 0.3),
          vcz + Math.cos(a0) * (RR - 0.3),
          x,
          SPR + Math.sin(a1) * (RR - 0.3),
          vcz + Math.cos(a1) * (RR - 0.3),
          0.35,
          { tint: stone2 },
        );
      }
    // transverse arches dividing three bays
    for (const x of [RX0 + 21.3, RX1 - 21.3])
      for (let i = 0; i < 20; i++) {
        const a0 = (PI * i) / 20,
          a1 = (PI * (i + 1)) / 20;
        b.beam(
          "limestone",
          x,
          SPR + Math.sin(a0) * (RR - 1.2),
          vcz + Math.cos(a0) * (RR - 1.2),
          x,
          SPR + Math.sin(a1) * (RR - 1.2),
          vcz + Math.cos(a1) * (RR - 1.2),
          1.4,
          { d: 2.2, tint: stone },
        );
      }
    // end walls above the spring line with the Diocletian windows
    const tw = K.litPaint("penn_thermal", 512, 256);
    for (const sgn of [-1, 1]) {
      const x = sgn < 0 ? RX0 + 0.16 : RX1 - 0.16,
        face = sgn < 0 ? HP : -HP;
      const semi = new THREE.CircleGeometry(RR, 32, 0, PI);
      // wall lunette (stone ring) and window (smaller)
      const ring = new THREE.RingGeometry(RR - 3.4, RR, 32, 1, 0, PI);
      b.geo("limestone", ring, { x, y: SPR, z: vcz, ry: face, tint: stone });
      const win = new THREE.CircleGeometry(RR - 3.4, 32, 0, PI);
      b.geo("atlas_lit", win, {
        x: x + sgn * -0.02,
        y: SPR,
        z: vcz,
        ry: face,
        uv: "rect",
        rect: tw,
      });
      for (const dz of [-(RR - 3.4) / 3, (RR - 3.4) / 3])
        b.box(
          "limestone",
          x - sgn * 0.1,
          SPR,
          vcz + dz,
          0.4,
          Math.sqrt((RR - 3.4) ** 2 - dz * dz),
          0.8,
          { tint: stone2 },
        );
      b.box("limestone", x - sgn * 0.2, SPR - 0.6, vcz, 0.6, 0.6, RR * 2, {
        tint: stone2,
      });
      semi.dispose();
      ring.dispose();
      win.dispose();
      for (const dz of [-5, 0, 5])
        F.shaft(b, x - sgn * 0.5, SPR + 7, vcz + dz, face, 3.5, 24, 0.95, {
          tint: 0x7a8a60,
        });
    }
    // giant Corinthian columns along the long walls
    for (let x = RX0 + 5; x < RX1 - 2; x += 9)
      for (const z of [RZ0 + 1.6, RZ1 - 1.6]) {
        if (z > vcz && Math.abs(x - ox) < 8) continue; // arcade opening
        F.column(b, x, WY, z, 0.95, SPR - WY, {
          style: "corinthian",
          mat: "marble_t",
          tint: 0xe8d8c8,
          col: true,
        });
      }
    // benches (long, back-to-back) in two banks
    for (let bank = -1; bank <= 1; bank += 2)
      for (let r = 0; r < 4; r++) {
        const x = ox + bank * 16,
          z = oz - 12 + r * 5;
        F.bench(b, x - 3.5, WY, z, 0, 6.5, { mat: "oak", frame: "bronze" });
        F.bench(b, x - 3.5, WY, z - 0.75, PI, 6.5, {
          mat: "oak",
          frame: "bronze",
        });
        if ((r + bank) % 3 === 0)
          F.bench(b, x + 5, WY + 0.02, z, 0.4, 4.5, {
            mat: "oak",
            frame: "bronze",
          }); // shoved askew
      }
    // ticket office along the east wall: marble counter, brass grilles
    b.box("marble_black", RX1 - 3, WY, oz - 4, 1.4, 1.2, 20, {
      tint: 0x8a8480,
    });
    b.box("marble_t", RX1 - 3, WY + 1.2, oz - 4, 1.6, 0.08, 20.2, {
      tint: 0xd8ccb8,
    });
    for (let z = oz - 13.5; z < oz + 6; z += 2.4) {
      b.box("brass", RX1 - 3.6, WY + 1.28, z, 0.05, 1.3, 2.0, {
        tint: 0x9a7a40,
        faces: "w",
      });
      for (let k = -3; k <= 3; k++)
        b.beam(
          "brass",
          RX1 - 3.62,
          WY + 1.28,
          z + k * 0.28,
          RX1 - 3.62,
          WY + 2.58,
          z + k * 0.28,
          0.025,
        );
    }
    K.colBox(RX1 - 3.8, WY, oz - 14, RX1 - 2.2, WY + 2.6, oz + 6, {
      surface: "concrete",
    });
    b.panel("atlas_lit", RX1 - 0.2, WY + 6.4, oz - 4, 9, 4.5, -HP, {
      rect: K.litPaint("penn_board", 1024, 512),
      grime: 0,
    });
    glows.add(RX1 - 0.6, WY + 6.4, oz - 4, 0xffe0a0, "l");
    // newsstand kiosk (centre)
    b.box("mahogany", ox, WY, oz - 4, 3, 1.1, 2, { tint: 0x4a2a18 });
    b.box("mahogany", ox, WY + 2.5, oz - 4, 3.4, 0.2, 2.4, { tint: 0x4a2a18 });
    for (const c of [
      [-1.4, -0.9],
      [1.4, -0.9],
      [-1.4, 0.9],
      [1.4, 0.9],
    ])
      b.box("mahogany", ox + c[0], WY + 1.1, oz - 4 + c[1], 0.12, 1.4, 0.12);
    K.colBox(ox - 1.5, WY, oz - 5, ox + 1.5, WY + 1.2, oz - 3, {
      surface: "wood",
    });
    F.papers(b, ox - 3, oz - 7, ox + 3, oz - 1, WY, 22, { tint: 0xc8bca0 });
    // hanging iron lanterns
    for (const x of [-21, 0, 21]) {
      const lx = ox + x;
      b.beam("black_metal", lx, 22, vcz, lx, 7.5, vcz, 0.06);
      b.cyl("black_metal", lx, 6, vcz, 1.2, 0.8, 1.5, 8, {
        top: true,
        bottom: true,
        tint: 0x2a2a24,
      });
      b.geo("lamp_amber", T.sphereLo, {
        x: lx,
        y: 6.7,
        z: vcz,
        s: 0.5,
        grime: 0,
      });
      glows.add(lx, 6.7, vcz, 0xffc070, "l");
    }
    // collapse: one coffer section fell with the NW lantern (rubble mound + daylight hole)
    F.debris(b, ox - 20, WY, oz - 14, 3.4, 30, {
      mound: true,
      col: true,
      colH: 1.2,
      mats: ["plaster", "limestone", "rubble"],
    });
    F.shaft(b, ox - 20, 25, oz - 12, 0.2, 3, 29, 0.1, { tint: 0xa0aa80 });
    F.papers(b, RX0 + 2, RZ0 + 2, RX1 - 4, RZ1 - 2, WY, 60, { tint: 0xa89c80 });

    // =========================== CONCOURSE ===========================
    const CZ0 = oz - 52,
      CZ1 = RZ0,
      CH = 7;
    // floor with three stairwell openings (x = -20, 0, 20; z -44..-34)
    const holes = [-20, 0, 20];
    const fz0 = CZ0,
      fz1 = CZ1;
    const floorSeg = (x0, z0, x1, z1) =>
      K.slab(b, "terrazzo", ox + x0, z0, ox + x1, z1, WY, {
        th: 0.5,
        tint: 0xa8a090,
        faces: "tb",
      });
    floorSeg(-32, oz - 34, 32, fz1);
    floorSeg(-32, fz0, 32, oz - 44);
    let xa = -32;
    for (const hx of holes) {
      floorSeg(xa, oz - 44, hx - 2, oz - 34);
      xa = hx + 2;
    }
    floorSeg(xa, oz - 44, 32, oz - 34);
    K.room(b, {
      x0: RX0,
      x1: RX1,
      z0: CZ0,
      z1: CZ1,
      y: WY,
      h: CH,
      floor: null,
      wall: "brick_tan",
      ceil: null,
      doors: {
        s: [
          { at: 14, w: 10, h: 6.8, arch: true },
          { at: 32, w: 10, h: 6.8, arch: true },
          { at: 50, w: 10, h: 6.8, arch: true },
        ],
      },
      wallTint: 0xb8a890,
      base: "granite",
    });
    // steel lattice columns + arched glass vaults (four bays running north-south)
    const sky = K.litPaint("penn_sky", 256, 256);
    for (let bay = 0; bay < 4; bay++) {
      const bx = ox - 24 + bay * 16,
        R = 8;
      for (let i = 0; i < 12; i++) {
        const a0 = (PI * i) / 12,
          a1 = (PI * (i + 1)) / 12;
        const p0 = [bx + Math.cos(a0) * R, WY + CH + Math.sin(a0) * R * 0.75],
          p1 = [bx + Math.cos(a1) * R, WY + CH + Math.sin(a1) * R * 0.75];
        for (let z = CZ0; z < CZ1 - 0.1; z += 4) {
          const miss = (i * 13 + bay * 7 + Math.round(z)) % 7 === 0;
          b.quad(
            miss ? "black" : "atlas_lit",
            [p1[0], p1[1], z],
            [p0[0], p0[1], z],
            [p0[0], p0[1], z + 4],
            [p1[0], p1[1], z + 4],
            { rect: sky, grime: 0 },
          );
          b.beam("black_metal", p0[0], p0[1], z, p1[0], p1[1], z, 0.16);
        }
        b.beam("black_metal", p0[0], p0[1], CZ0, p0[0], p0[1], CZ1, 0.08);
      }
    }
    for (let x = -32; x <= 32; x += 16)
      for (let z = CZ0 + 4; z < CZ1; z += 8) {
        if (Math.abs(x) === 32) continue;
        const cx = ox + x,
          czz = z;
        for (const d of [
          [-0.3, -0.3],
          [0.3, -0.3],
          [-0.3, 0.3],
          [0.3, 0.3],
        ])
          b.beam(
            "black_metal",
            cx + d[0],
            WY,
            czz + d[1],
            cx + d[0] * 0.5,
            WY + CH,
            czz + d[1] * 0.5,
            0.12,
          );
        for (let y = WY + 0.8; y < WY + CH; y += 1.2) {
          b.beam(
            "black_metal",
            cx - 0.28,
            y,
            czz - 0.28,
            cx + 0.28,
            y + 0.6,
            czz + 0.28,
            0.05,
          );
          b.beam(
            "black_metal",
            cx + 0.28,
            y,
            czz - 0.28,
            cx - 0.28,
            y + 0.6,
            czz + 0.28,
            0.05,
          );
        }
        b.box("black_metal", cx, WY + CH - 0.3, czz, 1.6, 0.3, 1.6);
        K.colBox(cx - 0.4, WY, czz - 0.4, cx + 0.4, WY + CH, czz + 0.4, {
          surface: "metal",
        });
      }
    // gable walls closing the glass vaults at both ends
    b.box("brick_tan", ox, WY + CH, CZ0 + 0.15, 64, 6.2, 0.3, {
      faces: "s",
      tint: 0xa89880,
    });
    b.box("brick_tan", ox, WY + CH, CZ1 - 0.15, 64, 6.2, 0.3, {
      faces: "n",
      tint: 0xa89880,
    });
    // stairwell railings + signs + the stairs down
    for (const hx of holes) {
      const x = ox + hx;
      F.railing(b, x - 2, oz - 34, x - 2, oz - 44, WY, {
        mat: "black_metal",
        h: 1.0,
      });
      F.railing(b, x + 2, oz - 34, x + 2, oz - 44, WY, {
        mat: "black_metal",
        h: 1.0,
      });
      F.railing(b, x - 2, oz - 44, x + 2, oz - 44, WY, {
        mat: "black_metal",
        h: 1.0,
      });
      b.stairs("concrete", x, oz - 44, 0, 1, 3.8, 10, PY, WY, 20, {
        tint: 0x9a948a,
      });
      b.box("black_metal", x, WY + 2.6, oz - 33.4, 3.6, 0.8, 0.12);
      b.panel("atlas_lit", x, WY + 3.0, oz - 33.32, 3.2, 0.8, 0, {
        rect: K.litPaint("penn_tracks", 512, 128),
        grime: 0,
      });
      glows.add(x, WY + 3.0, oz - 33.2, 0xe8e0c8, "m");
    }
    // concourse clutter: overturned baggage carts, a gate sign, skeletons (props), Maniac nest bedding
    for (let k = 0; k < 3; k++) {
      const x = ox - 28 + k * 5,
        z = oz - 26 - k * 3;
      b.box("rust", x, 0.4 + WY, z, 2.4, 0.2, 1.2, {
        yaw: k * 0.7,
        rz: k === 1 ? 1.2 : 0,
      });
      for (const d of [-1, 1])
        b.geo("black_metal", T.cyl12, {
          x: x + d * 0.9,
          y: WY + 0.25,
          z,
          sx: 0.25,
          sy: 0.1,
          sz: 0.25,
          rx: HP,
        });
    }
    F.debris(b, ox + 10, WY, oz - 48, 2.6, 18, {
      mound: true,
      col: true,
      colH: 0.8,
      mats: ["glass_base", "rust", "rubble"],
    });
    for (let k = 0; k < 6; k++)
      b.box(
        "cloth_green",
        ox + 24 + (k % 3) * 1.2,
        WY + 0.01,
        oz - 26 - Math.floor(k / 3) * 2.2,
        1.0,
        0.1,
        1.9,
        { yaw: k * 0.6, tint: 0x5a5a3a, grime: 0.8 },
      );
    F.bones(b, ox + 25, WY, oz - 27, 8);
    F.bones(b, ox + 26.5, WY, oz - 29, 6, { skull: false });
    F.papers(b, RX0 + 2, CZ0 + 2, RX1 - 2, CZ1 - 2, WY, 40, { tint: 0x9a9078 });

    // =========================== PLATFORMS ===========================
    const PX0 = ox - 40,
      PX1 = ox + 40,
      PZ0 = oz - 70,
      PZ1 = oz - 34,
      PH = 6.4;
    K.room(b, {
      x0: PX0,
      x1: PX1,
      z0: PZ0,
      z1: PZ1,
      y: BEDY,
      h: PY + PH - BEDY,
      floor: "dirt",
      wall: "tile_cream",
      ceil: null,
      walls: "ns",
      doors: { s: [{ at: 75.5, w: 2.4, h: 2.6, y: 1.2 }] },
      floorTint: 0x4a4238,
      wallTint: 0xa8a088,
      ceilTint: 0x6a6a64,
      grime: 0.7,
      noFloorCol: false,
    });
    // end walls with tunnel portals (the track beds continue); west portal blocked by collapse
    for (const sgn of [-1, 1]) {
      const x = sgn < 0 ? PX0 : PX1;
      K.skin(
        b,
        "concrete_panel",
        x,
        PZ0,
        x,
        PZ1,
        BEDY,
        PY + PH,
        [ox, oz - 55],
        [
          { at: 20, w: 7.6, h: 5.2, arch: true },
          { at: 5, w: 7.6, h: 5.2, arch: true },
        ],
        { tint: 0x8a8478 },
      );
    }
    // ceiling (with the three stairwell holes from the concourse)
    {
      const cy = PY + PH,
        cz0 = oz - 44,
        cz1 = PZ1;
      let xa2 = -40;
      const ceil = (x0, z0, x1, z1) =>
        b.box(
          "concrete",
          ox + (x0 + x1) / 2,
          cy,
          (z0 + z1) / 2,
          x1 - x0,
          0.3,
          z1 - z0,
          { faces: "b", tint: 0x6a6a64, grime: 0.5, seg: 4 },
        );
      ceil(-40, PZ0, 40, cz0);
      for (const hx of [-20, 0, 20]) {
        ceil(xa2, cz0, hx - 2, cz1);
        xa2 = hx + 2;
      }
      ceil(xa2, cz0, 40, cz1);
    }
    // platforms P1 (z -46..-34) and P2 (z -60..-54), with yellow edge strips
    for (const p of [
      [oz - 46, oz - 34],
      [oz - 60, oz - 54],
    ]) {
      K.slab(b, "concrete", PX0, p[0], PX1, p[1], PY, {
        th: 1.2,
        tint: 0x9a948a,
        faces: "tnsew",
        surface: "concrete",
      });
      for (const ez of [p[0], p[1]])
        if (ez !== oz - 34)
          b.box(
            "paint_yellow",
            ox,
            PY,
            ez + (ez === p[0] ? 0.2 : -0.2),
            80,
            0.02,
            0.35,
            { faces: "t", tint: 0xb89830, grime: 0.6 },
          );
    }
    // track beds: tracks at z -52, -48 (bed A) and -66, -62 (bed B)
    for (const tz of [-52, -48, -66, -62])
      track(b, PX0 - 24, PX1 + 24, oz + tz, BEDY);
    // track-bed ladders (steps at the platform ends) so a fallen player can climb out
    for (const e of [
      [ox - 36, oz - 46.6, 1],
      [ox + 30, oz - 53.4, -1],
      [ox - 30, oz - 60.6, 1],
    ])
      b.stairs(
        "concrete",
        e[0],
        e[1] + e[2] * 0.0,
        0,
        e[2],
        1.4,
        1.2,
        BEDY,
        PY,
        3,
        { tint: 0x7a7468 },
      );
    // platform columns + hanging signs + dead lamps
    for (let x = PX0 + 6; x < PX1; x += 10)
      for (const z of [oz - 43, oz - 57]) {
        b.box("paint_green", x, PY, z, 0.5, PH, 0.5, { tint: 0x3a5a4a });
        K.colBox(x - 0.25, PY, z - 0.25, x + 0.25, PY + PH, z + 0.25, {
          surface: "metal",
        });
        if ((x - PX0) % 20 === 6) {
          b.box("lamp_white", x, PY + PH - 0.4, z, 0.2, 0.06, 2.4, {
            grime: 0,
          });
          glows.add(x, PY + PH - 0.5, z, 0xd8e8c0, "m");
        }
      }
    // the derailed locomotive (bed A, nose pitched up onto P2) and the enterable coach
    gg1(b, glows, ox - 14, BEDY + 0.2, oz - 50.5, 0.12, 0.07);
    // coach body on track z -48 (x 4..24), floor at PY, doors mid-car on both sides
    const CX0 = ox + 4,
      CX1 = ox + 24,
      CZa = oz - 49.6,
      CZb = oz - 46.4;
    K.room(b, {
      x0: CX0,
      x1: CX1,
      z0: CZa,
      z1: CZb,
      y: PY,
      h: 2.6,
      floor: "wood",
      wall: "walnut",
      ceil: "plaster",
      t: 0.12,
      doors: {
        n: [
          { at: 10, w: 1.2, h: 2.1 },
          { at: 3, w: 1.1, h: 0.8, y: 1.0 },
          { at: 6, w: 1.1, h: 0.8, y: 1.0 },
          { at: 14, w: 1.1, h: 0.8, y: 1.0 },
          { at: 17, w: 1.1, h: 0.8, y: 1.0 },
        ],
        s: [
          { at: 10, w: 1.2, h: 2.1 },
          { at: 3, w: 1.1, h: 0.8, y: 1.0 },
          { at: 6, w: 1.1, h: 0.8, y: 1.0 },
          { at: 14, w: 1.1, h: 0.8, y: 1.0 },
          { at: 17, w: 1.1, h: 0.8, y: 1.0 },
        ],
      },
      floorTint: 0x6a5238,
      wallTint: 0x6a4028,
      ceilTint: 0xc8b890,
      surface: "wood",
    });
    b.box(
      "paint_red",
      (CX0 + CX1) / 2,
      PY - 1.1,
      (CZa + CZb) / 2,
      CX1 - CX0 + 0.3,
      3.9,
      CZb - CZa + 0.3,
      { faces: "ew", tint: 0x6a2418 },
    );
    const cs = K.paint("penn_coachside", 1024, 128);
    for (const sgn of [-1, 1]) {
      const z = sgn < 0 ? CZa - 0.16 : CZb + 0.16;
      // outer skin: panels around the door and window holes are built as a skin facing outward
      K.skin(
        b,
        "paint_red",
        CX0,
        z,
        CX1,
        z,
        PY - 1.1,
        PY + 2.8,
        [(CX0 + CX1) / 2, z + sgn * 5],
        [
          { at: 10, w: 1.2, h: 3.2 },
          { at: 3, w: 1.1, h: 0.8, y: 2.1 },
          { at: 6, w: 1.1, h: 0.8, y: 2.1 },
          { at: 14, w: 1.1, h: 0.8, y: 2.1 },
          { at: 17, w: 1.1, h: 0.8, y: 2.1 },
        ],
        { t: 0.02, tint: 0x6a2418, col: false, reveal: false },
      );
      b.panel(
        "atlas_paint",
        (CX0 + CX1) / 2 - 5,
        PY + 2.5,
        z + sgn * 0.02,
        7,
        0.45,
        sgn < 0 ? PI : 0,
        { rect: cs, grime: 0.3 },
      );
    }
    // roof (curved) + bogies
    for (let i = 0; i < 6; i++) {
      const a0 = (PI * i) / 6,
        a1 = (PI * (i + 1)) / 6,
        R = 1.75,
        zc = (CZa + CZb) / 2;
      b.quad(
        "paint_red",
        [CX0 - 0.15, PY + 2.8 + Math.sin(a0) * 0.5, zc + Math.cos(a0) * R],
        [CX0 - 0.15, PY + 2.8 + Math.sin(a1) * 0.5, zc + Math.cos(a1) * R],
        [CX1 + 0.15, PY + 2.8 + Math.sin(a1) * 0.5, zc + Math.cos(a1) * R],
        [CX1 + 0.15, PY + 2.8 + Math.sin(a0) * 0.5, zc + Math.cos(a0) * R],
        { tint: 0x4a2018, grime: 0.7 },
      );
    }
    for (const x of [CX0 + 3, CX1 - 3])
      for (const dx of [-0.9, 0.9])
        for (const dz of [-0.72, 0.72])
          b.geo("black_metal", T.cyl12, {
            x: x + dx,
            y: BEDY + 0.6,
            z: oz - 48 + dz,
            sx: 0.45,
            sy: 0.12,
            sz: 0.45,
            rx: HP,
          });
    // coach interior: seat pairs both sides of the aisle, luggage racks
    for (let x = CX0 + 1.2; x < CX1 - 1; x += 1.6) {
      if (Math.abs(x - (CX0 + 10)) < 1.2) continue;
      for (const zs of [CZa + 0.55, CZb - 0.55]) {
        b.box("velvet_red", x, PY, zs, 0.55, 0.45, 0.9, {
          tint: 0x3a4a6a,
          grime: 0.6,
        });
        b.box("velvet_red", x - 0.25, PY + 0.45, zs, 0.1, 0.65, 0.9, {
          tint: 0x3a4a6a,
          grime: 0.6,
        });
      }
    }
    for (const zs of [CZa + 0.4, CZb - 0.4])
      b.box(
        "brass",
        (CX0 + CX1) / 2,
        PY + 2.0,
        zs,
        CX1 - CX0 - 0.6,
        0.04,
        0.45,
        { tint: 0x8a7040 },
      );
    b.box(
      "lamp_amber",
      (CX0 + CX1) / 2,
      PY + 2.55,
      (CZa + CZb) / 2,
      14,
      0.04,
      0.2,
      { grime: 0 },
    );
    glows.add(CX0 + 6, PY + 2.4, oz - 48, 0xffc070, "s");
    glows.add(CX1 - 6, PY + 2.4, oz - 48, 0xffc070, "s");
    // gangplanks: P1 ↔ coach door, coach door ↔ P2
    K.slab(b, "plate", CX0 + 9.4, CZb, CX0 + 10.6, oz - 46, PY, {
      th: 0.08,
      tint: 0x8a8a80,
      surface: "metal",
    });
    K.slab(b, "plate", CX0 + 9.4, oz - 54, CX0 + 10.6, CZa, PY, {
      th: 0.08,
      tint: 0x8a8a80,
      surface: "metal",
    });
    b.box("plate", CX0 + 10, PY - 0.3, oz - 52, 0.3, 0.3, 4, {
      tint: 0x5a5a50,
    });
    // west portal collapse, east tunnel continues to the baggage car & the Conductor
    F.debris(b, PX0 + 1.5, BEDY, oz - 50, 4, 30, {
      mound: true,
      col: true,
      colH: 3,
      mats: ["rubble", "concrete_dark", "rust"],
    });
    F.debris(b, PX0 + 1.5, BEDY, oz - 65, 4, 30, {
      mound: true,
      col: true,
      colH: 3,
      mats: ["rubble", "concrete_dark", "rust"],
    });
    const TX0 = PX1,
      TX1 = PX1 + 22;
    for (const tb of [
      [oz - 54, oz - 46, "n"],
      [oz - 69, oz - 61, "s"],
    ]) {
      K.room(b, {
        x0: TX0,
        x1: TX1,
        z0: tb[0],
        z1: tb[1],
        y: BEDY,
        h: 5.5,
        floor: "dirt",
        wall: "concrete_dark",
        ceil: "concrete_dark",
        walls: "nse",
        doors: { [tb[2]]: [{ at: 13.5, w: 3, h: 2.8 }] },
        floorTint: 0x3a3830,
        wallTint: 0x5a5850,
        grime: 0.8,
      });
    }
    // cross-passage between the two tunnel bores
    K.room(b, {
      x0: TX0 + 12,
      x1: TX0 + 15,
      z0: oz - 61,
      z1: oz - 54,
      y: BEDY,
      h: 3,
      floor: "dirt",
      wall: "concrete_dark",
      ceil: "concrete_dark",
      walls: "ew",
      floorTint: 0x3a3830,
      wallTint: 0x5a5850,
    });
    // baggage car in the north bore (loot), open side door
    b.box("paint_red", TX0 + 8, BEDY + 0.9, oz - 50, 12, 3.2, 3, {
      faces: "nsewt",
      tint: 0x4a2a1e,
      grime: 0.8,
    });
    K.colBox(TX0 + 2, BEDY, oz - 51.5, TX0 + 14, BEDY + 4.1, oz - 48.5, {
      surface: "metal",
    });
    b.box("black", TX0 + 8, BEDY + 1.4, oz - 48.48, 2.4, 2.2, 0.02, {
      faces: "s",
      grime: 0,
    });
    // glowing puddles (radiation) in the south bore
    for (const p of [
      [TX0 + 6, oz - 64],
      [TX0 + 12, oz - 62.5],
      [TX0 + 17, oz - 65],
    ]) {
      b.geo("lamp_fev", T.cyl12, {
        x: p[0],
        y: BEDY + 0.02,
        z: p[1],
        sx: 1.4,
        sy: 0.01,
        sz: 1.0,
        grime: 0,
      });
      glows.add(p[0], BEDY + 0.3, p[1], 0x60ff60, "l");
    }
    F.bones(b, TX0 + 15, BEDY, oz - 57, 10);
    F.bones(b, TX0 + 9, BEDY, oz - 66, 7);
    for (let k = 0; k < 5; k++)
      b.box(
        "cloth_green",
        TX0 + 13 + k * 0.7,
        BEDY + 0.01,
        oz - 58 + (k % 2) * 1.3,
        0.9,
        0.12,
        1.8,
        { yaw: k, tint: 0x4a4a30, grime: 0.9 },
      );
    // service stair: P1 east end → baggage room (y WY)
    K.room(b, {
      x0: ox + 34,
      x1: ox + 37,
      z0: oz - 34,
      z1: oz - 24,
      y: PY,
      h: WY - PY + 3,
      floor: null,
      wall: "concrete_panel",
      ceil: "concrete",
      walls: "ew",
      wallTint: 0x8a8478,
    });
    b.stairs("concrete", ox + 35.5, oz - 34, 0, 1, 2.8, 10, PY, WY, 20, {
      tint: 0x8a8478,
    });
    b.box("lamp_red", ox + 36.8, WY + 2.2, oz - 28, 0.05, 0.2, 0.3, {
      grime: 0,
    });
    glows.add(ox + 36.6, WY + 2.2, oz - 28, 0xff4030, "s");

    // =========================== BAGGAGE ROOM ===========================
    K.room(b, {
      x0: ox + 32,
      x1: ox + 48,
      z0: oz - 24,
      z1: oz,
      y: WY,
      h: 4.5,
      floor: "concrete",
      wall: "brick_tan",
      ceil: "ceil_tile",
      doors: {
        n: [{ at: 3.5, w: 2.8, h: 3.0 }],
        w: [{ at: 19, w: 2, h: 2.6 }],
      },
      floorTint: 0x8a8478,
      wallTint: 0xa89478,
    });
    for (let k = 0; k < 4; k++)
      F.shelf(b, ox + 46.8, WY, oz - 21 + k * 5, -HP, {
        mat: "wood",
        fill: "boxes",
        w: 3.6,
        h: 3,
        tint: 0x6a5238,
      });
    for (let k = 0; k < 9; k++) {
      const r = K.rng(700 + k);
      b.box(
        ["leather_brown", "fabric", "wood"][k % 3],
        ox + 36 + r() * 8,
        WY,
        oz - 18 + r() * 14,
        0.7 + r() * 0.4,
        0.35 + r() * 0.3,
        0.45,
        { yaw: r() * 3, tint: [0x5a3a26, 0x7a6a52, 0x6a5238][k % 3] },
      );
    }
    b.box("mahogany", ox + 40, WY, oz - 1, 6, 1.1, 0.8, { tint: 0x4a2a18 });
    K.colBox(ox + 37, WY, oz - 1.4, ox + 43, WY + 1.1, oz - 0.6, {
      surface: "wood",
    });
    b.box("lamp_amber", ox + 40, WY + 4.4, oz - 15, 0.3, 0.06, 3, { grime: 0 });
    glows.add(ox + 40, WY + 4.3, oz - 15, 0xffc070, "m");

    b.finish(rec.interiorRoot, { cast: false });
    glows.finish(rec.interiorRoot, {
      interior: true,
      nightOpacity: 0.95,
      flicker: 0.12,
    });

    const A = (n, x, y, z, yaw) => rec.anchor(n, x, y, z, yaw);
    A("entrance", ox, 0, oz + 47, 0);
    A("waiting_room", ox + 0.2, WY, oz - 2.6, 0);
    A("concourse", ox, WY, oz - 28, 0);
    A("platform", ox, PY, oz - 43, 0);
    A("boss", ox + 54, BEDY, oz - 64, HP);
    A("baggage_car", ox + 48, BEDY, oz - 47.8, 0);
    A("spawn1", ox - 12, WY, oz + 4, 0);
    A("spawn2", ox + 12, WY, oz - 14, 0);
    A("spawn3", ox - 18, WY, oz - 30, 0);
    A("spawn4", ox + 20, WY, oz - 46, 0);
    A("spawn5", ox - 20, PY, oz - 43, 0);
    A("spawn6", ox + 30, PY, oz - 57, 0);
    return {
      arrival: { x: ox, y: 0, z: oz + 47.5, yaw: 0 },
      exitPos: new THREE.Vector3(ox, 1.6, oz + 49.6),
      ox,
      oz,
      WY,
      PY,
      BEDY,
      TX0,
    };
  }

