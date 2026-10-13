// play-inline-96 05 — box
// Lines 1208-1866 of readable/play-inline-96.pretty.js (statement-aligned).
  function buildInterior() {
    const rr = M.rng("cryoC9");
    // ================= STAIRWELL (up to the Municipal Building sub-basement) =================
    room(-2.5, -40, 2.5, -24.6, 0, 9.5, {
      wall: "concrete",
      floor: "concrete",
      lightStep: 4,
      deadLights: 0.5,
      noRibs: true,
      doors: [{ side: "s", a: -1.8, b: 1.8, h: 3, frame: false }],
    });
    // threshold between the two rooms under the blast door
    M.box(b("metal_panel"), -1.8, 0, -24.6, 1.8, 0.02, -24.0, {
      s: 1,
      c: [0.55, 0.57, 0.6],
      skip: 8,
    });
    // the flight: 24 steps × 0.25 m from z -25.2 to the landing at z -37 (y 6)
    const steps = 24,
      z0s = -25.2,
      run = (37 - 25.2) / steps;
    for (let i = 0; i < steps; i++) {
      const y = (6 * (i + 1)) / steps,
        za = z0s - i * run,
        zb = za - run;
      M.box(b("concrete"), -2.2, y - 0.25, zb, 2.2, y, za, {
        s: 1.5,
        c: [0.7, 0.7, 0.68],
      });
      M.box(b("metal_painted"), -2.2, y - 0.03, za - 0.06, 2.2, y + 0.005, za, {
        s: 1,
        c: C_ORANGE,
      }); // nosing
      CB(-2.2, 0, zb, 2.2, y, za, { surface: "concrete" });
    }
    // landing at y 6, z -40..-37
    M.box(b("concrete"), -2.5, 5.7, -40, 2.5, 6, -37, {
      s: 2,
      c: [0.66, 0.66, 0.64],
    });
    CB(-2.5, 5.7, -40, 2.5, 6, -37, { surface: "concrete" });
    // handrails along both walls
    for (const sx of [-2.38, 2.38]) {
      M.pipe(b("metal_painted"), sx, 1.0, -25, sx, 7.0, -37, 0.035, 6, {
        c: C_STEEL,
      });
      M.pipe(b("metal_painted"), sx, 7.0, -37, sx, 7.0, -39.8, 0.035, 6, {
        c: C_STEEL,
      });
    }
    // the exit door on the landing (north wall)
    M.box(b("metal_painted"), -0.75, 6, -39.98, 0.75, 8.2, -39.88, {
      s: 1,
      c: [0.42, 0.45, 0.44],
    });
    M.box(b("metal_painted"), -0.92, 6, -39.99, 0.92, 8.38, -39.95, {
      s: 1,
      c: C_DARK,
    });
    M.box(b("rust"), -0.5, 7.0, -39.88, 0.5, 7.06, -39.84, {
      s: 1,
      c: [0.8, 0.7, 0.6],
    });
    sign("EXIT", 0, 8.75, -39.95, 0, 1, 1.2);
    sign("MUNICIPAL BLDG · SUB-BASEMENT 3", 0, 9.1, -24.66, 0, -1, 3.6);
    sign("SERVICE STAIR", 1.6, 3.6, -24.66, 0, -1, 1.6);
    M.box(b("emissive_window@lamp"), -0.15, 8.6, -39.6, 0.15, 8.7, -39.3, {
      s: 1,
    });
    A.stair_bottom = [0, 0, -25.6];
    A.stair_top = [0, 6, -38.4];
    A.exit_door = [0, 7.2, -39.6];

    // ================= BLAST DOOR + CORRIDOR =================
    room(-2, -24, 2, 0, 0, 3.4, {
      pipes: true,
      lightStep: 3,
      doors: [
        { side: "s", a: -2, b: 2, h: 3, frame: false },
        { side: "n", a: -1.8, b: 1.8, h: 3, frame: false },
        { side: "e", a: -14, b: -12.5, h: 2.5 },
        { side: "e", a: -5, b: -3.5, h: 2.5 },
        { side: "w", a: -14, b: -12.5, h: 2.5 },
      ],
    });
    // heavy frame around the blast door (corridor side)
    const fr = b("metal_painted");
    M.box(fr, -2, 0, -24.0, -1.8, 3.0, -23.7, { s: 1, c: C_STEEL });
    M.box(fr, 1.8, 0, -24.0, 2, 3.0, -23.7, { s: 1, c: C_STEEL });
    M.box(fr, -2, 3.0, -24.0, 2, 3.4, -23.7, { s: 1, c: C_STEEL });
    for (let i = 0; i < 8; i++)
      M.quad(
        b("metal_painted"),
        [-1.8 + i * 0.45, 0.012, -23.7],
        [-1.8 + i * 0.45 + 0.22, 0.012, -23.7],
        [-1.8 + i * 0.45 + 0.42, 0.012, -22.9],
        [-1.8 + i * 0.45 + 0.2, 0.012, -22.9],
        [0, 1, 0],
        [0, 0, 1, 0, 1, 1, 0, 1],
        C_ORANGE,
      );
    sign("BLAST DOOR", 0, 3.2, -23.68, 0, 1, 2.4);
    // keypad on the east wall beside the door (corridor) + a twin on the stair side
    const kp = b("metal_painted");
    M.box(kp, 1.84, 1.05, -22.9, 2.0, 1.6, -22.35, {
      s: 1,
      c: [0.35, 0.37, 0.38],
    });
    M.box(b("emissive_window@lampw"), 1.835, 1.42, -22.82, 1.84, 1.54, -22.43, {
      s: 1,
    });
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 3; c++)
        M.box(
          kp,
          1.825,
          1.12 + r * 0.07,
          -22.78 + c * 0.11,
          1.84,
          1.17 + r * 0.07,
          -22.71 + c * 0.11,
          { s: 1, c: [0.82, 0.8, 0.72] },
        );
    M.box(kp, 2.05, 1.05, -24.85, 2.45, 1.6, -24.65, {
      s: 1,
      c: [0.35, 0.37, 0.38],
    });
    M.box(b("emissive_window@lampw"), 2.12, 1.42, -24.86, 2.38, 1.54, -24.85, {
      s: 1,
    });
    A.blast_door = [0, 0, -23.2];
    A.door_keypad = [1.75, 1.3, -22.6];
    A.door_keypad_stair = [2.25, 1.3, -25.0];
    for (const x of [-1.55, 1.55])
      M.cyl(b("neon_red@lampr"), x, 3.05, -23.6, 0.1, 0.1, 0.18, 8, {
        capTop: true,
      });
    A.corridor = [0, 0, -12];
    // corridor dressing: a fallen ceiling panel, frost creeping up from the bay, a wheelchair
    M.obox(b("metal_panel"), -0.8, 0.15, -7.5, 1.2, 0.05, 1.8, 0.35, {
      s: 1,
      c: C_CEIL,
    });
    frost(0, -1.5, 3.8, 3, 0);
    frost(0.4, -4, 2.6, 2, 0);
    sign("PROJECT LONG WINTER", 0, 2.7, -0.05, 0, -1, 2.8);
    sign("DIRECTOR'S OFFICE", 1.96, 2.85, -13.25, -1, 0, 1.6);
    sign("SECURITY", 1.96, 2.85, -4.25, -1, 0, 1.4);
    sign("COMPUTER ROOM", -1.96, 2.85, -13.25, 1, 0, 1.6);

    // ================= DIRECTOR'S OFFICE ================= x 2..13, z -20..-9
    room(2, -20, 13, -9, 0, 3.2, {
      floor: "wood_planks",
      floorC: [0.55, 0.45, 0.36],
      lightStep: 3.6,
      deadLights: 0.5,
      doors: [{ side: "w", a: -14, b: -12.5, h: 2.5 }],
    });
    slideDoor(2, -13.25, 1.5, 2.5, false, 0);
    desk(8.5, -16.2, 0, 2.2);
    chair(8.5, -17.1, 0, 0, [0.4, 0.22, 0.14]);
    M.box(b("fabric"), 5, 0.005, -18.5, 11.5, 0.02, -12.5, {
      s: 2,
      c: [0.42, 0.2, 0.16],
    }); // rug
    fileCabinet(12.55, -15, -Math.PI / 2, 3);
    // bookcase + framed map of the five boroughs, the Long Winter emblem
    M.box(b("wood_planks"), 12.6, 0, -19.6, 12.95, 2.2, -17.2, {
      s: 1,
      c: [0.45, 0.33, 0.24],
    });
    for (let y = 0.4; y < 2.2; y += 0.45)
      for (let i = 0; i < 5; i++)
        M.box(
          b("fabric"),
          12.62,
          y,
          -19.5 + i * 0.46,
          12.9,
          y + 0.36,
          -19.15 + i * 0.46,
          {
            s: 1,
            c: [
              [0.5, 0.2, 0.15],
              [0.2, 0.3, 0.45],
              [0.3, 0.38, 0.25],
              [0.6, 0.55, 0.4],
              [0.35, 0.3, 0.3],
            ][i],
          },
        );
    CB(12.6, 0, -19.6, 12.95, 2.2, -17.2);
    logo(7.5, 2.0, -19.95, 0, 0, 1, 1.4);
    M.box(b("wood_planks"), 3.5, 1.2, -19.97, 6.0, 2.6, -19.92, {
      s: 1,
      c: [0.3, 0.22, 0.16],
    });
    M.box(b("plaster_stained"), 3.6, 1.3, -19.92, 5.9, 2.5, -19.9, {
      s: 1,
      c: [0.9, 0.86, 0.72],
    });
    // the armchair in the corner where Ruth Calloway sat out the last winter before she left
    const ac = b("fabric");
    M.box(ac, 3.0, 0, -19.5, 4.4, 0.45, -18.1, { s: 1, c: [0.45, 0.32, 0.22] });
    M.box(ac, 3.0, 0.45, -19.5, 4.4, 1.15, -19.2, {
      s: 1,
      c: [0.45, 0.32, 0.22],
    });
    for (const sx of [3.0, 4.15])
      M.box(ac, sx, 0.45, -19.5, sx + 0.25, 0.75, -18.1, {
        s: 1,
        c: [0.42, 0.3, 0.2],
      });
    CB(3.0, 0, -19.5, 4.4, 0.45, -18.1, { surface: "fabric" });
    // (her chair is empty: her last log entry says she walked out into the city)
    A.director_office = [7.5, 0, -14];
    A.director_desk = [8.5, 0.78, -16.2];
    A.director_terminal = [11.4, 0, -19.1];
    A.director_body = [3.7, 0, -18.4];
    A.director_chair = [8.5, 0, -17.1];

    // ================= SECURITY ================= x 2..10, z -8..-1
    room(2, -8, 10, -1, 0, 3.2, {
      pipes: true,
      lightStep: 3.6,
      deadLights: 0.4,
      doors: [{ side: "w", a: -5, b: -3.5, h: 2.5 }],
    });
    desk(5.5, -6.8, 0, 1.8);
    chair(5.5, -6.0, Math.PI, 0);
    locker(9.6, -3, -Math.PI / 2, 2, 0, [0.42, 0.48, 0.44]);
    // gun rack (empty pegs) + monitors showing snow
    M.box(b("wood_planks"), 3.0, 1.0, -7.97, 4.8, 2.2, -7.85, {
      s: 1,
      c: [0.4, 0.3, 0.22],
    });
    for (let i = 0; i < 4; i++)
      M.box(
        b("metal_painted"),
        3.2 + i * 0.42,
        1.3,
        -7.85,
        3.25 + i * 0.42,
        1.36,
        -7.7,
        { s: 1, c: C_DARK },
      );
    for (let i = 0; i < 3; i++) {
      M.box(
        b("metal_painted"),
        6.2 + i * 0.9,
        1.6,
        -7.95,
        6.95 + i * 0.9,
        2.2,
        -7.6,
        { s: 1, c: [0.5, 0.48, 0.42] },
      );
      if (i !== 1)
        M.box(
          b("emissive_window@lampw"),
          6.28 + i * 0.9,
          1.68,
          -7.59,
          6.87 + i * 0.9,
          2.12,
          -7.58,
          { s: 1 },
        );
    }
    A.security = [6, 0, -4.5];
    A.security_locker = [9.35, 0, -6.4];
    A.security_desk = [5.5, 0.8, -6.8];

    // ================= COMPUTER ROOM (CUSTODIAN) ================= x -16..-2, z -22..-6
    room(-16, -22, -2, -6, 0, 4, {
      floor: "metal_panel",
      floorC: [0.5, 0.52, 0.55],
      pipes: true,
      lightStep: 4,
      deadLights: 0.6,
      doors: [{ side: "e", a: -14, b: -12.5, h: 2.5 }],
    });
    slideDoor(-2, -13.25, 1.5, 2.5, false, 0);
    const mr = M.rng("custodian");
    for (let i = 0; i < 6; i++) mainframe(-14.5 + i * 1.75, -21.35, 0, mr);
    for (let i = 0; i < 4; i++)
      mainframe(-15.45, -18 + i * 1.6, Math.PI / 2, mr);
    for (let i = 0; i < 3; i++)
      mainframe(-4.6 + 0, -19.2 + i * 1.5, -Math.PI / 2, mr);
    // the operator console + teletype in the middle of the room
    M.pushXF(M.mtx(-8.5, 0, -11.5, Math.PI));
    M.box(b("metal_painted"), -1.6, 0, -0.45, 1.6, 0.85, 0.45, {
      s: 1,
      c: [0.6, 0.62, 0.6],
    });
    M.obox(b("metal_painted"), 0, 0.95, 0.05, 3.2, 0.24, 0.7, 0, {
      pitch: 0.45,
      c: [0.55, 0.57, 0.56],
    });
    for (let i = 0; i < 14; i++)
      M.box(
        b(i % 5 === 0 ? "neon_red@lampr" : "emissive_window@lamp"),
        -1.4 + i * 0.2,
        1.06,
        0.08,
        -1.34 + i * 0.2,
        1.1,
        0.14,
        { s: 1 },
      );
    M.box(b("emissive_window@lampw"), -0.45, 1.2, -0.35, 0.45, 1.75, -0.3, {
      s: 1,
    }); // the one screen still lit
    M.box(b("metal_painted"), -0.55, 0.85, -0.42, 0.55, 1.85, -0.3, {
      s: 1,
      c: [0.45, 0.45, 0.42],
      skip: 16,
    });
    M.popXF();
    footCB(-8.5, -11.5, Math.PI, 3.2, 0.9, 1.1);
    chair(-8.5, -10.4, Math.PI, 0, [0.3, 0.32, 0.36]);
    // speaker grille high on the north wall
    M.box(b("metal_painted"), -9.6, 2.6, -21.98, -8.4, 3.4, -21.9, {
      s: 1,
      c: [0.3, 0.3, 0.3],
    });
    for (let i = 0; i < 6; i++)
      M.box(
        b("metal_painted"),
        -9.5,
        2.7 + i * 0.12,
        -21.9,
        -8.5,
        2.74 + i * 0.12,
        -21.87,
        { s: 1, c: C_DARK },
      );
    // cable bundles across the floor
    for (let i = 0; i < 5; i++)
      M.pipe(
        b("rubber"),
        -12 + i * 0.6,
        0.04,
        -20.5,
        -9.5 + i * 0.3,
        0.04,
        -12.2,
        0.04,
        5,
        { c: [0.1, 0.1, 0.1] },
      );
    sign("COMPUTER ROOM", -9, 3.55, -6.04, 0, -1, 2.2);
    A.computer_core = [-9, 0, -16];
    A.computer_terminal = [-8.5, 0, -10.6];
    A.custodian_speaker = [-9, 3.0, -21.6];

    // ================= POD BAY ================= x -9..9, z 0..30, h 5.5
    room(-9, 0, 9, 30, 0, BAY_H, {
      floor: "tile_cryo",
      floorC: [0.52, 0.56, 0.6],
      lightStep: 4.5,
      deadLights: 0.45,
      pipes: true,
      doors: [
        { side: "n", a: -2, b: 2, h: 3, frame: false },
        { side: "e", a: 18.5, b: 20.5, h: 2.6 },
        { side: "w", a: 18.5, b: 20.5, h: 2.6 },
        { side: "s", a: -1.5, b: 1.5, h: 2.6 },
      ],
    });
    // pods: west row 1–6 (front faces east), east row 7–12 (front faces west).
    // 7 = the hero's (open, alive), 9 = Zeke's (open, empty, thawed weeks ago); 3 and 11 cracked & leaking.
    POD_Z.forEach((z, i) => {
      const nW = i + 1,
        nE = i + 7;
      cryoPod(-7.4, z, Math.PI / 2, {
        dead: true,
        cracked: nW === 3,
        ceilY: BAY_H,
      });
      const eOpts =
        nE === 7
          ? { open: true, empty: true, ceilY: BAY_H }
          : nE === 9
            ? { open: true, empty: true, dead: true, ceilY: BAY_H }
            : { dead: true, cracked: nE === 11, ceilY: BAY_H };
      cryoPod(7.4, z, -Math.PI / 2, eOpts);
      A["pod_" + nW] = [-7.4, 0, z];
      A["pod_" + nE] = [7.4, 0, z];
    });
    // frost on the floor in front of the rows, coolant puddles
    for (const z of POD_Z) {
      frost(-5.9, z, 1.4, 2.2, 0);
      frost(5.9, z, 1.4, 2.2, 0);
    }
    puddle(5.2, 4.6, 0.9);
    puddle(-2.5, 14, 1.4);
    puddle(3.5, 25.5, 1.0);
    // central control island + coolant manifold
    M.box(b("metal_painted"), -1.4, 0, 13.2, 1.4, 1.0, 16.8, {
      s: 1,
      c: [0.55, 0.58, 0.6],
    });
    M.obox(b("metal_painted"), 0, 1.1, 15, 2.6, 0.2, 3.4, 0, {
      c: [0.48, 0.5, 0.52],
    });
    for (let i = 0; i < 12; i++)
      M.box(
        b(i === 6 ? "emissive_window@lamp" : "neon_red@lampr"),
        -1.1 + (i % 6) * 0.42,
        1.22,
        13.6 + Math.floor(i / 6) * 2.6,
        -0.98 + (i % 6) * 0.42,
        1.26,
        13.75 + Math.floor(i / 6) * 2.6,
        { s: 1 },
      );
    CB(-1.4, 0, 13.2, 1.4, 1.2, 16.8);
    M.cyl(b("metal_painted"), 0, 1.2, 15, 0.35, 0.35, BAY_H - 1.2, 10, {
      c: [0.6, 0.62, 0.64],
    });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + 0.4;
      M.pipe(
        b("metal_painted"),
        0,
        BAY_H - 0.6,
        15,
        Math.cos(a) * 6.5,
        BAY_H - 0.3,
        15 + Math.sin(a) * 9,
        0.09,
        6,
        { c: k % 2 ? C_ORANGE : [0.55, 0.72, 0.85] },
      );
    }
    if (M.skeleton) M.skeleton(-1.8, 17.4, 0.6, M.rng("tech"), false, LAYER, 0); // a technician who never made it out (local coords)
    sign("POD BAY", 0, 4.4, 0.06, 0, 1, 2.6);
    sign("SLEEP SAFE. WAKE STRONG.", 0, 4.4, 29.94, 0, -1, 4.2);
    sign("SUIT PREP", 8.94, 2.95, 19.5, -1, 0, 1.6);
    sign("INFIRMARY", -8.94, 2.95, 19.5, 1, 0, 1.6);
    sign("MAINTENANCE", 0, 2.95, 29.94, 0, -1, 1.8);
    sign("DANGER · COOLANT", 0, 3.6, 29.94, 0, -1, 2.0);
    logo(0, 0.02, 22, 0, 1, 0, 3.2);
    logo(0, 3.6, 0.06, 0, 0, 1, 1.4);
    // red emergency beacons along the bay
    for (const z of [6, 14, 22])
      for (const x of [-8.85, 8.85])
        M.cyl(
          b("neon_red@lampr"),
          x - Math.sign(x) * 0.1,
          4.6,
          z,
          0.09,
          0.09,
          0.2,
          8,
          { capTop: true },
        );
    A.pod_bay = [0, 0, 15];
    A.player_pod = A.pod_7;
    A.zeke_pod = A.pod_9;
    A.player_start = [6.35, 0, POD_Z[0]]; // standing in pod 7's doorway, facing the bay (west)

    // ================= SUIT PREP ================= x 9..19, z 14..25
    room(9, 14, 19, 25, 0, 3.2, {
      floor: "concrete",
      lightStep: 3.5,
      deadLights: 0.3,
      doors: [{ side: "w", a: 18.5, b: 20.5, h: 2.6 }],
    });
    slideDoor(9, 19.5, 2, 2.6, false, 0);
    // suit lockers on the north and south walls; a gap on the south wall for Zeke's locker (quest prop)
    for (let i = 0; i < 7; i++)
      locker(10.2 + i * 1.25, 14.35, 0, 2, 0, [0.72, 0.74, 0.74]);
    for (let i = 0; i < 6; i++) {
      const x = 10.2 + i * 1.25;
      if (Math.abs(x - 16.45) < 0.7) continue;
      locker(x, 24.65, Math.PI, 2, 0, [0.72, 0.74, 0.74]);
    }
    // benches down the middle
    for (const z of [17.4, 21.6]) {
      M.box(b("wood_planks"), 11, 0.42, z - 0.22, 17, 0.48, z + 0.22, {
        s: 1,
        c: [0.6, 0.48, 0.34],
      });
      M.box(b("metal_painted"), 11.2, 0, z - 0.05, 16.8, 0.42, z + 0.05, {
        s: 1,
        c: C_STEEL,
      });
      CB(11, 0, z - 0.22, 17, 0.48, z + 0.22, { surface: "wood" });
    }
    // spare cryo suits on hooks (grey-white with the orange collar ring)
    for (let i = 0; i < 4; i++) {
      const x = 18.85,
        z = 15.6 + i * 0.7;
      M.box(b("fabric"), x - 0.12, 0.6, z - 0.22, x - 0.02, 1.7, z + 0.22, {
        s: 1,
        c: [0.82, 0.83, 0.84],
      });
      M.box(b("fabric"), x - 0.13, 1.6, z - 0.2, x - 0.01, 1.68, z + 0.2, {
        s: 1,
        c: C_ORANGE,
      });
    }
    // the VIGIL charging cradle: a wall shelf with a cyan-lit bracket (the goggles themselves are a quest pickup)
    M.box(b("metal_painted"), 18.55, 1.0, 21.5, 18.98, 1.06, 23.1, {
      s: 1,
      c: [0.4, 0.42, 0.44],
    });
    M.box(b("emissive_window@lampw"), 18.6, 1.06, 21.7, 18.9, 1.09, 22.9, {
      s: 1,
    });
    M.box(b("metal_painted"), 18.9, 1.06, 21.6, 18.98, 1.6, 23.0, {
      s: 1,
      c: [0.35, 0.37, 0.4],
    });
    logo(18.95, 1.95, 22.3, -1, 0, 0, 0.7);
    CB(18.55, 0.95, 21.5, 18.98, 1.06, 23.1);
    // a mirror over a steel sink
    M.box(b("metal_painted"), 9.05, 0.8, 23.2, 9.6, 0.95, 24.2, {
      s: 1,
      c: [0.75, 0.77, 0.78],
    });
    M.box(b("chrome"), 9.02, 1.25, 23.2, 9.05, 2.1, 24.2, {
      s: 1,
      c: [0.85, 0.88, 0.9],
    });
    CB(9.05, 0, 23.2, 9.6, 0.95, 24.2);
    A.prep_room = [14, 0, 19.5];
    A.goggles_cradle = [18.65, 1.1, 22.3];
    A.zeke_locker = [16.45, 0, 24.3];
    A.lockers = [13, 0, 15.2];

    // ================= INFIRMARY ================= x -19..-9, z 14..25
    room(-19, 14, -9, 25, 0, 3.2, {
      floorC: [0.82, 0.84, 0.85],
      lightStep: 3.5,
      deadLights: 0.4,
      doors: [{ side: "e", a: 18.5, b: 20.5, h: 2.6 }],
    });
    slideDoor(-9, 19.5, 2, 2.6, false, 0);
    bed(-17.6, 16.2, Math.PI / 2);
    bed(-17.6, 19.6, Math.PI / 2);
    bed(-17.6, 23.0, Math.PI / 2);
    // a sheet over the middle bed's occupant
    M.box(b("fabric"), -18.5, 0.78, 19.25, -16.7, 0.98, 19.95, {
      s: 1,
      c: [0.88, 0.88, 0.86],
    });
    for (let i = 0; i < 3; i++) {
      M.box(
        b("metal_painted"),
        -14 + i * 1.2,
        0,
        14.05,
        -13.1 + i * 1.2,
        1.9,
        14.5,
        { s: 1, c: [0.9, 0.9, 0.88] },
      );
      M.box(
        b("neon_red@lampr"),
        -13.62 + i * 1.2,
        1.45,
        14.51,
        -13.48 + i * 1.2,
        1.52,
        14.52,
        { s: 1 },
      );
      M.box(
        b("neon_red@lampr"),
        -13.58 + i * 1.2,
        1.41,
        14.51,
        -13.52 + i * 1.2,
        1.56,
        14.52,
        { s: 1 },
      );
    }
    CB(-14, 0, 14.05, -10.5, 1.9, 14.5);
    table(-12, 22.8, 1.8, 0.8, 0.9, 0);
    M.cyl(b("metal_painted"), -15, 0, 21, 0.25, 0.25, 0.04, 8, {
      capTop: true,
      c: C_STEEL,
    });
    M.pipe(b("metal_painted"), -15, 0, 21, -15, 1.8, 21, 0.02, 4, {
      c: C_STEEL,
    }); // IV stand
    A.infirmary = [-13.5, 0, 19.5];
    A.infirmary_cabinet = [-12.5, 0, 14.9];

    // ================= MAINTENANCE / BOILERS ================= x -8..8, z 30..42
    room(-8, 30, 8, 42, 0, 4.5, {
      wall: "concrete",
      floor: "concrete",
      floorC: [0.45, 0.46, 0.46],
      pipes: true,
      lightStep: 4,
      deadLights: 0.6,
      noRibs: true,
      doors: [{ side: "n", a: -1.5, b: 1.5, h: 2.6 }],
    });
    slideDoor(0, 30, 3, 2.6, true, 0);
    // two boilers, the coolant pumps, the compressor
    for (const [x, z] of [
      [5, 34],
      [5, 39],
    ]) {
      M.cyl(b("metal_painted"), x, 0, z, 1.4, 1.4, 3.2, 18, {
        capTop: true,
        c: [0.55, 0.5, 0.45],
      });
      for (const y of [0.6, 1.6, 2.6])
        M.cyl(b("rust"), x, y, z, 1.43, 1.43, 0.12, 18, {
          c: [0.7, 0.55, 0.45],
        });
      M.pipe(b("metal_painted"), x, 3.2, z, x - 2, 4.3, z, 0.18, 8, {
        c: [0.6, 0.55, 0.5],
      });
      CB(x - 1.4, 0, z - 1.4, x + 1.4, 3.3, z + 1.4);
    }
    for (let i = 0; i < 3; i++) {
      const x = -6.2,
        z = 33 + i * 3;
      M.box(b("metal_painted"), x - 0.9, 0, z - 0.7, x + 0.9, 1.2, z + 0.7, {
        s: 1,
        c: [0.45, 0.55, 0.62],
      });
      M.cyl(b("metal_painted"), x, 1.2, z, 0.4, 0.4, 0.5, 10, {
        capTop: true,
        c: C_ORANGE,
      });
      M.pipe(b("metal_painted"), x, 1.7, z, x, 4.3, z, 0.12, 6, {
        c: [0.55, 0.72, 0.85],
      });
      CB(x - 0.9, 0, z - 0.7, x + 0.9, 1.7, z + 0.7);
    }
    crateStack(-1.5, 40.8, 2);
    crateStack(-0.4, 41.2, 1);
    puddle(1, 36, 1.6);
    puddle(-3.5, 39.5, 1.1);
    // the roaches' nest: rotten crates and filth in the south-west corner
    M.box(b("wood_rotten"), -7.6, 0, 40.4, -5.6, 0.5, 41.8, {
      s: 1,
      c: [0.45, 0.38, 0.3],
    });
    CB(-7.6, 0, 40.4, -5.6, 0.5, 41.8, { surface: "wood" });
    A.maintenance = [0, 0, 35];
    A.roach_nest = [-4.5, 0, 39];
    A.boiler = [3, 0, 36.5];
    // the cell's radiation: none (a cold, clean place); only the coolant hums
  }

  // -------------------------------------------------------------------
