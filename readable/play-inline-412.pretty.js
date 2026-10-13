/* src/poi_fidi3/21_bankers_interior.js */
/* =====================================================================
 * NEW RAD CITY — poi_fidi3 / 21_bankers_interior.js
 * BANKERS TRUST — interior cell `bankers_trust` + THE LAST WITHDRAWAL.
 *
 * Plan (local metres; player enters at (0,0,-1.6) looking north):
 *   Vestibule → BANKING HALL (28×30 m, 11 m coffered ceiling, two rows of
 *   green-marble columns, the brass teller cages, the officers' platform,
 *   check desks, the bronze clock) which the robots still keep "open for
 *   business"; north: elevator lobby (executive elevator → Pyramid Room),
 *   security office (robot / vault-response control), grand stair down to
 *   the VAULT LEVEL (y −5): antechamber with the 2.1 m round Mosler door,
 *   the time-lock console and three robot bays; the VAULT (deposit-box
 *   walls, cash carts, the gold cage); the boiler room (the vent exit).
 *   PYRAMID ROOM (y +40): the boardroom under the stepped roof, windows on
 *   a ruined skyline, the board still seated at its last meeting.
 *
 * Heist: open the vault (the console passcode from the vault clerk's duty
 *   card, or key in the Chairman's override code from the Pyramid Room) → a countdown starts
 *   (90 s; 150 s with the code / with the response units disabled), the
 *   alarm sounds and the vault-response robots wake. When the clock runs
 *   out the door swings shut; anyone inside is sealed in with the halon
 *   purge and must crawl out through the ventilation duct.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const VY = -5; // vault level
  const PY = 40; // Pyramid Room floor
  const DOOR = {
    hx: 2.25,
    hz: -61.55,
    r: 1.9,
    cy: 2.0,
    t: 0.7,
    open: 1.8,
    ro: 1.5,
  }; // cy ≥ r + 0.1: the disc clears the floor
  const VAULT = { x0: -7, x1: 7, z0: -76, z1: -62.2 };

  // ---- locks: keys, codes and passcodes (every unlock is placed in this file) ----
  const BT_LOCKS = {
    console: K.regLock({
      id: "pf3_lk_bt_console",
      label: "Mosler Time-Lock Console",
      passcode: "STEWARDSHIP",
      kind: "terminal",
      hint: "The vault clerk's duty card, by the clerk's remains in the boiler room.",
    }),
    override: K.regLock({
      id: "pf3_lk_bt_override",
      label: "Time-Lock Override Keypad",
      code: "149255",
      kind: "keypad",
      hint: "The Chairman's teletype in the Pyramid Room.",
    }),
    security: K.regLock({
      id: "pf3_lk_bt_security",
      label: "Bankers Trust Security Control",
      passcode: "NIGHTWATCH",
      kind: "terminal",
      hint: "The night guard's duty card, under the lobby waiting bench where he sat down.",
    }),
    lockers: K.regLock({
      id: "pf3_lk_bt_lockers",
      label: "Guard Lockers",
      code: "3308",
      kind: "container",
      hint: "The night guard's duty card, under the lobby waiting bench where he sat down.",
    }),
    chairman: K.regLock({
      id: "pf3_lk_bt_chairman",
      label: "Office of the Chairman Teletype",
      passcode: "MARGARET",
      kind: "terminal",
      hint: "The Chairman says it on the board-meeting tape reel.",
    }),
    wallsafe: K.regLock({
      id: "pf3_lk_bt_wallsafe",
      label: "Chairman's Wall Safe",
      code: "0614",
      kind: "safe",
      hint: "The Chairman's letter to Margaret, on his teletype.",
    }),
  };
  // safe-deposit boxes: each has its own code (the bank's carbon register, on the time-lock desk) and the master key opens them all
  const BOX_CODES = [null, "5814", "2290", null, "7736", "4061", "9127"];
  const boxLock = (i) =>
    BOX_CODES[i]
      ? K.regLock({
          id: "pf3_lk_bt_box" + (1041 + i * 17),
          label: "Safe Deposit Box " + (1041 + i * 17),
          code: BOX_CODES[i],
          key: "pf3_bt_box_key",
          kind: "container",
          hint: "The safe-deposit register on the time-lock desk; the master key is in the Chairman's wall safe.",
        })
      : null;
  const BOX_LOCKS = BOX_CODES.map((c, i) => boxLock(i));
  PV.BT_LOCKS = BT_LOCKS;
  K.keyFrom("pf3_bt_box_key", "Chairman's Wall Safe (Pyramid Room)");

  PV.btInterior = function (ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "bt_int",
      off: O,
      lit: true,
      amb: [0.08, 0.08, 0.085],
      floors: [0, VY, PY],
      grime: 0.4,
    });
    const r = K.rng("bt_int");
    const marbleW = [0.86, 0.84, 0.8],
      warm = [1, 0.84, 0.6],
      cold = [0.8, 0.9, 1],
      red = [1, 0.25, 0.15];

    // ------------------------------------------------ gaps
    K.gap(ctx, 0, 0, 2.6, 0, 4.0, { casing: false });
    K.gap(ctx, 0, -5, 3.0, 0, 4.5);
    K.gap(ctx, 0, -35, 3.0, 0, 4.0);
    K.gap(ctx, -9, -35, 2.0, 0, 3.0);
    K.gap(ctx, 9, -35, 1.4, 0, 2.4);
    K.gap(ctx, 0, -49, 2.4, VY, 3.0);
    K.gap(ctx, 0, -62, 3.0, VY, 3.55, { casing: false });
    K.gap(ctx, -8, -54, 1.4, VY, 2.4);

    // ================================================= VESTIBULE
    K.room(b, ctx, {
      x0: -4,
      z0: -5,
      x1: 4,
      z1: 0,
      y: 0,
      h: 6,
      floor: "marble",
      fc: [0.75, 0.73, 0.7],
      wall: "marble",
      wc: marbleW,
      wain: "marble_black",
      wainC: [0.3, 0.3, 0.3],
      wainH: 1.2,
      ceil: "coffer",
      cc: [0.62, 0.6, 0.56],
      cornice: true,
      corniceMat: "brass",
      surface: "concrete",
    });
    b.boxMM("bronze", -1.3, 0, -0.1, 1.3, 4.0, 0.0, { tint: [0.45, 0.4, 0.3] });
    b.boxMM("glass", -1.2, 0.2, -0.12, 1.2, 3.6, -0.1, {
      tint: [0.2, 0.22, 0.2],
    });
    b.plate(
      "art",
      0,
      4.9,
      -4.88,
      0,
      1,
      3.2,
      0.5,
      K.signCell("bt_welcome", "WELCOME, VALUED CUSTOMER", 512, 80, {
        bg: "#1a1a18",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, 0, 4.8, -2.5, "globe", warm, 0.8, 7, {
      ceil: 6,
      size: 0.25,
      lightOpts: { box: [-4.2, -1, -5.2, 4.2, 7, 0.2] },
    });

    // ================================================= BANKING HALL
    const HX0 = -14,
      HX1 = 14,
      HZ0 = -35,
      HZ1 = -5,
      HH = 11;
    const HB = [HX0 - 0.2, -1, HZ0 - 0.2, HX1 + 0.2, HH + 1, HZ1 + 0.2];
    K.room(b, ctx, {
      x0: HX0,
      z0: HZ0,
      x1: HX1,
      z1: HZ1,
      y: 0,
      h: HH,
      floor: "checker",
      fc: [0.72, 0.7, 0.66],
      wall: "marble",
      wc: marbleW,
      wain: "marble_green",
      wainC: [0.6, 0.7, 0.62],
      wainH: 1.3,
      ceil: "coffer",
      cc: [0.7, 0.66, 0.56],
      cornice: true,
      corniceMat: "gold",
      surface: "concrete",
    });
    b.hplate("decal", 0, 0.012, -20, 5, 5, 0, K.medallion("bt", 256));
    // green-marble columns in two rows
    for (const x of [-7.5, 7.5])
      for (let k = 0; k < 5; k++) {
        const z = -9 - k * 6.2;
        K.column(b, x, 0, z, 0.55, HH, {
          kind: "ionic",
          mat: "marble_green",
          tint: [0.75, 0.85, 0.78],
          flutes: false,
        });
        b.col(x - 0.55, 0, z - 0.55, x + 0.55, HH, z + 0.55, {
          tag: "column",
          walkable: false,
        });
      }
    // teller line (east): marble counter, brass grilles, teller windows, cash drawers
    const TX = 9.8;
    b.boxMM("marble_black", TX - 0.4, 0, -31, TX + 0.4, 1.1, -9, {
      tint: [0.35, 0.34, 0.33],
      faces: "nsewt",
    });
    b.boxMM("marble", TX - 0.5, 1.1, -31, TX + 0.5, 1.16, -9, {
      tint: marbleW,
    });
    for (let z = -31; z <= -9.01; z += 0.12)
      b.pipe("brass", TX, 1.16, z, TX, 2.6, z, 0.008, 3);
    for (const y of [1.2, 2.6])
      b.beam("brass", TX, y, -31, TX, y, -9, 0.06, 0.06);
    b.col(TX - 0.5, 0, -31, TX + 0.5, 2.7, -9, {
      tag: "counter",
      walkable: false,
    });
    for (let k = 0; k < 6; k++) {
      const z = -29 + k * 3.6;
      b.boxMM("marble", TX - 0.52, 1.5, z - 0.35, TX - 0.48, 1.9, z + 0.35, {
        tint: [0.1, 0.1, 0.1],
      }); // window hole backing
      b.plate(
        "art",
        TX - 0.53,
        2.35,
        z,
        -1,
        0,
        0.7,
        0.18,
        K.signCell(
          "bt_teller" + k,
          k === 3 ? "CLOSED" : "TELLER " + (k + 1),
          128,
          32,
          {
            bg: "#1a1a18",
            fg: "#d8c890",
            font: "Georgia, serif",
            weather: false,
          },
        ),
        { off: 0.01 },
      );
      K.chair(b, TX + 1.3, 0, z, -HP, { mat: "wood_dark" });
      b.boxMM("wood_dark", TX + 0.5, 0.8, z - 0.6, TX + 1.0, 1.05, z + 0.6, {
        tint: [0.4, 0.28, 0.18],
      });
    }
    b.plate(
      "art",
      HX1 - 0.12,
      4.6,
      -20,
      -1,
      0,
      8,
      1.2,
      K.signCell("bt_savings", "SAVINGS · LOANS · SAFE DEPOSIT", 1024, 150, {
        bg: null,
        fg: "#c8a860",
        font: "Georgia, serif",
      }),
    );
    // officers' platform (west): raised floor, rail, desks, the dead loan officers
    b.boxMM("marble", HX0, 0, -31, -9.5, 0.3, -9, {
      tint: [0.7, 0.68, 0.64],
      faces: "nsewt",
    });
    b.col(HX0, 0, -31, -9.5, 0.3, -9, { tag: "floor" });
    K.railing(b, -9.5, -31, -9.5, -22, 0.3, {
      mat: "brass",
      handMat: "brass",
      h: 0.9,
      step: 0.3,
    });
    K.railing(b, -9.5, -18, -9.5, -9, 0.3, {
      mat: "brass",
      handMat: "brass",
      h: 0.9,
      step: 0.3,
    });
    for (let k = 0; k < 4; k++) {
      const z = -28 + k * 5.5;
      K.table(b, -12, 0.3, z, 2.0, 1.0, { mat: "mahogany", yaw: HP });
      K.chair(b, -13.1, 0.3, z, HP, { mat: "leather", seatMat: "leather" });
      b.box("flat", -12, 1.06, z + 0.2, 0.3, 0.02, 0.4, {
        yaw: r(),
        tint: [0.85, 0.82, 0.72],
      });
      b.cyl("paint_green", -11.6, 1.06, z - 0.3, 0.1, 0.07, 0.05, 8);
      b.pipe("brass", -11.6, 1.1, z - 0.3, -11.6, 1.4, z - 0.3, 0.01, 3);
      b.geo("lamp", K.sphereGeo(), {
        x: -11.6,
        y: 1.43,
        z: z - 0.3,
        s: 0.04,
        tint: [0.4, 0.9, 0.5],
      });
      b.light(-11.6, 1.6, z - 0.3, [0.5, 0.8, 0.5], 0.3, 3, { box: HB });
    }
    K.skel(ctx, -13.0, 0.3, -22.5, HP, "seated");
    K.skel(ctx, -11.0, 0.3, -11.5, 2.4, "lying");
    // check-writing desks down the middle
    for (const z of [-11, -17, -23, -29]) {
      b.boxMM("marble", -1.8, 0.95, z - 0.45, 1.8, 1.05, z + 0.45, {
        tint: marbleW,
        faces: "nsewtb",
      });
      b.cyl("bronze", 0, 0, z, 0.25, 0.18, 0.95, 10, {
        tint: [0.5, 0.42, 0.3],
      });
      b.col(-1.8, 0, z - 0.45, 1.8, 1.05, z + 0.45, { tag: "furniture" });
      for (const s of [-1, 1]) {
        b.pipe("brass", s * 1.2, 1.05, z, s * 1.2, 1.35, z + 0.1, 0.006, 3);
        b.box("flat", s * 0.6, 1.051, z, 0.2, 0.004, 0.28, {
          yaw: r(),
          tint: [0.8, 0.78, 0.68],
        });
      }
    }
    // the great bronze clock over the stair arch, the name in gilt, the mural
    const clock = K.paint(
      "art",
      "bt_clock",
      256,
      256,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const cx = X + W / 2,
          cy = Y + H / 2;
        x.fillStyle = "#6a5a38";
        x.beginPath();
        x.arc(cx, cy, W * 0.48, 0, PI * 2);
        x.fill();
        x.fillStyle = "#e8e0c8";
        x.beginPath();
        x.arc(cx, cy, W * 0.42, 0, PI * 2);
        x.fill();
        x.fillStyle = "#2a2218";
        x.font = "bold 22px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
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
        R.forEach((t, i) => {
          const a = (i / 12) * PI * 2 - HP;
          x.fillText(
            t,
            cx + Math.cos(a) * W * 0.34,
            cy + Math.sin(a) * W * 0.34,
          );
        });
        x.strokeStyle = "#1a1410";
        x.lineCap = "round";
        x.lineWidth = 7;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(
          cx + Math.cos((9.7 / 12) * PI * 2 - HP) * W * 0.2,
          cy + Math.sin((9.7 / 12) * PI * 2 - HP) * W * 0.2,
        );
        x.stroke();
        x.lineWidth = 4;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(
          cx + Math.cos((47 / 60) * PI * 2 - HP) * W * 0.3,
          cy + Math.sin((47 / 60) * PI * 2 - HP) * W * 0.3,
        );
        x.stroke();
        x.font = "bold 12px Georgia, serif";
        x.fillText("BANKERS TRUST", cx, cy + W * 0.17);
        K.stains(x, X, Y, W, H, 6, 1234, 0.35, [60, 40, 20]);
      },
    );
    b.plate("art", 0, 7.2, HZ0 + 0.13, 0, 1, 2.6, 2.6, clock, { off: 0.02 });
    b.plate(
      "decal",
      0,
      9.3,
      HZ0 + 0.13,
      0,
      1,
      12,
      1.0,
      K.signCell("bt_gilt", "BANKERS TRUST COMPANY", 1024, 88, {
        bg: null,
        fg: "#d8b060",
        font: "Georgia, serif",
        weather: false,
      }),
      { off: 0.02 },
    );
    b.plate(
      "art",
      HX0 + 0.12,
      6.8,
      -20,
      1,
      0,
      14,
      4.2,
      K.painting(23, 512, 160),
      { off: 0.02 },
    );
    // chandeliers (the robots keep two of them lit) and robot charging alcove, scuff paths
    K.chandelier(b, 0, 8.4, -12, HH, {
      r: 1.1,
      arms: 10,
      intensity: 1.3,
      radius: 13,
      lightOpts: { box: HB },
    });
    K.chandelier(b, 0, 8.4, -28, HH, {
      r: 1.1,
      arms: 10,
      intensity: 1.1,
      radius: 12,
      lightOpts: { box: HB },
    });
    K.chandelier(b, 0, 8.4, -20, HH, { r: 1.1, arms: 10, dead: true });
    b.light(0, 3, -20, warm, 0.5, 14, { box: HB });
    for (const z of [-15, -25]) {
      b.boxMM("metal_dark", HX1 - 0.9, 0, z - 0.8, HX1 - 0.1, 2.6, z + 0.8, {
        tint: [0.3, 0.32, 0.3],
      });
      b.plate("lamp", HX1 - 0.92, 2.2, z, -1, 0, 0.9, 0.12, null, {
        tint: [0.3, 1, 0.4],
      });
      b.glow(HX1 - 1, 2.2, z, [0.15, 0.6, 0.2], 0.6);
    }
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        (r() - 0.5) * 20,
        0.013 + k * 0.0004,
        -20 + (r() - 0.5) * 24,
        1.5 + r() * 2,
        1 + r(),
        r() * 6,
        K.decal("grime", 60 + k),
      );
    K.litter(b, HX0 + 5, HZ0 + 1, HX1 - 5, HZ1 - 1, 0, 12, 2301);
    // a collapsed coffer bay (daylight through the hole onto the rubble), the queue line the robots still keep,
    // deposit slips everywhere except the clean lane the robots sweep
    b.face("paint_black", -5.2, HH - 0.01, -27.8, 1, 0, 0, 0, 0, 1, 3.2, 2.6, {
      uv: "top",
      tint: [0.04, 0.04, 0.04],
      grime: 0,
    });
    b.face("lamp", -4.8, HH - 0.03, -27.45, 1, 0, 0, 0, 0, 1, 2.4, 1.9, {
      uv: "top",
      tint: [0.5, 0.52, 0.44],
    });
    for (let k = 0; k < 5; k++)
      b.beam(
        "rust",
        -5.3 + k * 0.8,
        HH,
        -27.6 + r() * 0.3,
        -5.1 + k * 0.8 + (r() - 0.5),
        HH - 0.8 - r() * 1.4,
        -26.4 + r() * 0.6,
        0.02,
        0.02,
      );
    K.rubble(b, -3.6, 0, -26.5, 1.5, 0.7, {
      seed: 2321,
      tint: [0.78, 0.74, 0.66],
    });
    K.rubble(b, -2.6, 0, -25.2, 0.8, 0.4, {
      seed: 2322,
      col: false,
      tint: [0.72, 0.68, 0.6],
    });
    b.light(-3.6, 5, -26.6, [0.85, 0.88, 0.75], 1.1, 9, { box: HB, wrap: 0.5 });
    for (let k = 0; k < 5; k++)
      b.glow(
        -3.6 + (r() - 0.5) * 1.5,
        HH - 1 - k * 2,
        -26.5 + (r() - 0.5) * 1.2,
        [0.2, 0.21, 0.17],
        2.6,
      );
    for (let k = 0; k < 6; k++) {
      const z = -11 - k * 3.2;
      b.cyl("brass", 5.4, 0, z, 0.05, 0.05, 0.95, 6);
      b.cyl("brass", 5.4, 0, z, 0.18, 0.14, 0.05, 10);
      b.geo("brass", K.sphereGeo(), { x: 5.4, y: 0.98, z, s: 0.06 });
      if (k < 5) {
        b.pipe("velvet", 5.4, 0.88, z, 5.4, 0.7, z - 1.6, 0.025, 4, {
          tint: [0.55, 0.08, 0.1],
        });
        b.pipe("velvet", 5.4, 0.7, z - 1.6, 5.4, 0.88, z - 3.2, 0.025, 4, {
          tint: [0.55, 0.08, 0.1],
        });
      }
    }
    b.plate(
      "art",
      5.4,
      1.35,
      -10.2,
      0,
      1,
      0.6,
      0.35,
      K.signCell("bt_line", "PLEASE WAIT\nTO BE CALLED", 128, 72, {
        bg: "#1a1a18",
        fg: "#d8c890",
        font: "Georgia, serif",
        weather: false,
      }),
      { off: 0.0 },
    );
    K.clutter(b, HX0 + 4.6, HZ0 + 1, -2.4, HZ1 - 1, 0, {
      n: 16,
      seed: 2324,
      kinds: ["paper", "paper", "chair", "glass", "box"],
      avoid: [
        [-8.3, -35, -6.7, -5],
        [-5.4, -29, -1.6, -24],
      ],
    });
    K.clutter(b, 6.4, HZ0 + 1, TX - 0.6, HZ1 - 1, 0, {
      n: 8,
      seed: 2325,
      kinds: ["paper", "can", "glass"],
      avoid: [[6.7, -35, 8.3, -5]],
    });

    // ================================================= ELEVATOR LOBBY (NW)
    K.room(b, ctx, {
      x0: -14,
      z0: -43,
      x1: -4,
      z1: -35,
      y: 0,
      h: 4,
      floor: "marble",
      fc: [0.7, 0.68, 0.64],
      wall: "marble",
      wc: marbleW,
      wain: "marble_black",
      wainC: [0.3, 0.3, 0.3],
      wainH: 1.2,
      ceil: "plaster",
      cc: [0.6, 0.6, 0.56],
      surface: "concrete",
    });
    for (const [z, lab] of [
      [-37.4, "EXECUTIVE"],
      [-40.6, "OUT OF ORDER"],
    ]) {
      b.boxMM("bronze", -13.95, 0, z - 0.8, -13.85, 2.6, z + 0.8, {
        tint: [0.5, 0.42, 0.3],
      });
      b.beam("bronze", -13.8, 0, z, -13.8, 2.6, z, 0.04, 0.03, {
        tint: [0.3, 0.26, 0.2],
      });
      b.plate(
        "art",
        -13.84,
        3.0,
        z,
        1,
        0,
        1.2,
        0.26,
        K.signCell("bt_el_" + lab, lab, 192, 40, {
          bg: "#1a1a18",
          fg: "#d8c890",
          font: "Georgia, serif",
          weather: false,
        }),
        { off: 0.01 },
      );
      b.geo("lamp", K.sphereGeo(), {
        x: -13.8,
        y: 3.35,
        z,
        s: 0.05,
        tint: lab === "EXECUTIVE" ? [0.3, 1, 0.3] : [1, 0.3, 0.2],
      });
    }
    K.lamp(b, -9, 3.4, -39, "globe", warm, 0.6, 7, { ceil: 4, size: 0.2 });
    // the OUT OF ORDER car came down the shaft: buckled doors forced open, the car floor jammed a metre low
    b.boxMM("bronze", -13.9, 0, -41.4, -13.7, 1.05, -39.8, {
      tint: [0.35, 0.3, 0.22],
    });
    b.boxMM("paint_black", -13.95, 1.05, -41.3, -13.9, 2.5, -39.9, {
      tint: [0.04, 0.04, 0.04],
    });
    b.beam("bronze", -13.6, 1.1, -41.5, -12.9, 0.02, -41.9, 0.5, 0.05, {
      tint: [0.4, 0.34, 0.24],
    });
    b.plate("decal", -13.8, 1.0, -40.6, 1, 0, 1.6, 0.6, K.decal("scorch", 44), {
      off: 0.03,
    });
    K.rubble(b, -12.6, 0, -40.7, 0.7, 0.35, {
      seed: 2312,
      col: false,
      tint: [0.7, 0.68, 0.64],
    });
    b.boxMM("marble", -8.5, 0, -42.75, -5.5, 0.45, -42.2, {
      tint: [0.75, 0.73, 0.7],
    }); // waiting bench
    b.hplate("flat", -5.2, 0.014, -41.3, 1.0, 1.0, 0, null, {
      tint: [0.3, 0.31, 0.3],
    });
    for (let k = 0; k < 5; k++)
      b.box("steel", -5.6 + k * 0.2, 0.014, -41.3, 0.04, 0.012, 0.9, {
        tint: [0.5, 0.5, 0.5],
      });
    b.box("steel", -4.8, 0.014, -41.3, 0.16, 0.05, 0.08, {
      tint: [0.6, 0.6, 0.6],
    });
    b.col(-8.5, 0, -42.75, -5.5, 0.45, -42.2, { tag: "furniture" });
    for (const px of [-12.9, -5]) {
      b.cyl("brass", px, 0, -36, 0.32, 0.26, 0.6, 10, {
        tint: [0.7, 0.55, 0.3],
      });
      for (let k = 0; k < 5; k++)
        b.pipe(
          "wood_rotten",
          px,
          0.55,
          -36,
          px + (r() - 0.5) * 0.7,
          1.1 + r() * 0.5,
          -36 + (r() - 0.5) * 0.6,
          0.012,
          3,
          { tint: [0.4, 0.32, 0.2] },
        );
      b.col(px - 0.32, 0, -36.32, px + 0.32, 0.6, -35.68, { tag: "furniture" });
    }
    b.box("leather", -6.6, 0.45, -42.5, 0.45, 0.32, 0.12, {
      yaw: 0.2,
      tint: [0.3, 0.18, 0.1],
    });
    K.clutter(b, -14, -43, -4, -35, 0, {
      n: 12,
      seed: 2313,
      kinds: ["paper", "glass", "debris", "can"],
      avoid: [
        [-14, -38.4, -12, -36.4],
        [-10, -36, -8, -35],
      ],
    });

    // ================================================= SECURITY OFFICE (NE)
    K.room(b, ctx, {
      x0: 4,
      z0: -43,
      x1: 14,
      z1: -35,
      y: 0,
      h: 4,
      floor: "tile",
      fc: [0.5, 0.52, 0.5],
      wall: "metal",
      wc: [0.55, 0.58, 0.56],
      ceil: "metal_dark",
      cc: [0.4, 0.4, 0.4],
      surface: "metal",
      trim: false,
    });
    const SB = [3.8, -1, -43.2, 14.2, 4.2, -34.8];
    // monitor wall
    for (let k = 0; k < 8; k++) {
      const x = 6 + (k % 4) * 1.6,
        y = 1.6 + Math.floor(k / 4) * 1.0;
      b.boxMM(
        "metal_dark",
        x - 0.7,
        y - 0.42,
        -42.95,
        x + 0.7,
        y + 0.42,
        -42.6,
        { tint: [0.25, 0.26, 0.25] },
      );
      const cam = K.paint(
        "art",
        "bt_cctv" + k,
        160,
        96,
        function (x, X, Y, W, H) {
          x.fillStyle = "#0c1410";
          x.fillRect(X, Y, W, H);
          if (k === 5) {
            for (let q = 0; q < 900; q++) {
              const v = (r() * 200) | 0;
              x.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
              x.fillRect(X + r() * W, Y + r() * H, 2, 2);
            }
            return;
          }
          x.strokeStyle = "rgba(150,230,170,0.75)";
          x.fillStyle = "rgba(120,200,140,0.55)";
          x.lineWidth = 2;
          const view = k % 4;
          if (view === 0) {
            for (let c = 0; c < 4; c++) {
              x.fillRect(X + 18 + c * 38, Y + 14, 8, H - 30);
            }
            x.beginPath();
            x.moveTo(X, Y + H - 16);
            x.lineTo(X + W, Y + H - 22);
            x.stroke();
          } else if (view === 1) {
            x.beginPath();
            x.arc(X + W / 2, Y + H / 2, H * 0.34, 0, PI * 2);
            x.stroke();
            x.beginPath();
            x.arc(X + W / 2, Y + H / 2, H * 0.1, 0, PI * 2);
            x.stroke();
          } else if (view === 2) {
            for (let c = 0; c < 6; c++)
              x.strokeRect(X + 10 + c * 24, Y + 20, 18, 50);
            x.fillRect(X + W * 0.6, Y + H * 0.45, 10, 26);
          } else {
            x.beginPath();
            for (let c = 0; c < 7; c++) {
              x.moveTo(X + 10 + c * 20, Y + H - 10 - c * 9);
              x.lineTo(X + 30 + c * 20, Y + H - 10 - c * 9);
            }
            x.stroke();
          }
          x.fillStyle = "rgba(150,230,170,0.9)";
          x.font = "bold 11px monospace";
          x.fillText(
            "CAM 0" +
              (k + 1) +
              " " +
              ["HALL", "VAULT", "DEPOSIT", "STAIR"][view],
            X + 6,
            Y + 12,
          );
          for (let yy = 0; yy < H; yy += 3) {
            x.fillStyle = "rgba(0,0,0,0.28)";
            x.fillRect(X, Y + yy, W, 1);
          }
        },
      );
      b.plate("pics", x, y, -42.58, 0, 1, 1.2, 0.7, cam, {
        tint: [0.9, 1.1, 0.95],
      });
      b.plate("lamp", x, y, -42.585, 0, 1, 1.24, 0.74, null, {
        tint: [0.08, 0.14, 0.1],
      });
    }
    K.chair(b, 7.2, 0, -39.7, 0, {
      mat: "metal",
      seatMat: "leather",
      tint: [0.4, 0.4, 0.4],
    });
    K.clutter(b, 4, -43, 14, -35, 0, {
      n: 10,
      seed: 2311,
      kinds: ["paper", "can", "box"],
      avoid: [
        [5.8, -41.4, 11.2, -40.2],
        [12.5, -42.5, 14, -36.5],
        [8.4, -35.8, 9.6, -35],
      ],
    });
    b.light(8.5, 2, -41.5, [0.4, 0.8, 0.6], 0.8, 6, { box: SB });
    K.table(b, 8.5, 0, -40.8, 5, 0.9, { mat: "metal", h: 0.8 });
    K.skel(ctx, 7.2, 0, -39.7, PI, "seated");
    K.lamp(b, 9, 3.4, -38, "tube", cold, 0.5, 6, {
      ceil: 4,
      len: 1.2,
      lightOpts: { box: SB },
    });

    // ================================================= GRAND STAIR (down to the vault level)
    K.room(b, ctx, {
      x0: -2.5,
      z0: -49,
      x1: 2.5,
      z1: -35,
      y: VY,
      h: 9,
      floor: "marble",
      fc: [0.65, 0.63, 0.6],
      wall: "marble",
      wc: marbleW.map((v) => v * 0.9),
      ceil: "plaster",
      cc: [0.5, 0.5, 0.48],
      surface: "concrete",
    });
    K.stairs(b, -2, -46, 2, -36, VY, 0, "+z", {
      mat: "marble",
      tint: [0.8, 0.78, 0.74],
      rail: "both",
      railMat: "brass",
      handMat: "brass",
      nosing: "brass",
    });
    b.boxMM("marble", -2.5, -0.35, -36, 2.5, 0, -35, {
      tint: [0.8, 0.78, 0.74],
      faces: "nsewt",
    });
    b.col(-2.5, -0.35, -36, 2.5, 0, -35, { tag: "floor" });
    b.plate(
      "art",
      0,
      VY + 3.6,
      -48.88,
      0,
      1,
      2.2,
      0.4,
      K.signCell("bt_vaultsign", "SAFE DEPOSIT · VAULT", 384, 64, {
        bg: "#1a1a18",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, 0, 2.8, -40, "globe", warm, 0.6, 8, { ceil: 4, size: 0.2 });
    K.lamp(b, 0, VY + 3.2, -47.5, "globe", warm, 0.6, 6, {
      ceil: VY + 4,
      size: 0.2,
    });

    // ================================================= VAULT ANTECHAMBER (y −5)
    const AX0 = -8,
      AX1 = 8,
      AZ0 = -62,
      AZ1 = -49;
    const AB = [AX0 - 0.2, VY - 0.2, AZ0 - 0.3, AX1 + 0.2, VY + 5.2, AZ1 + 0.2];
    K.room(b, ctx, {
      x0: AX0,
      z0: AZ0,
      x1: AX1,
      z1: AZ1,
      y: VY,
      h: 5,
      floor: "terrazzo",
      fc: [0.62, 0.62, 0.6],
      wall: "marble",
      wc: [0.75, 0.74, 0.7],
      wain: "marble_black",
      wainC: [0.3, 0.3, 0.3],
      wainH: 1.0,
      ceil: "metal_dark",
      cc: [0.35, 0.36, 0.36],
      surface: "concrete",
    });
    // the vault door's collar (steel torus) and the stepped steel portal around it
    // round portal: steel collars on both faces hide the square cut, a steel-lined bore and a raised sill
    const PCY = VY + DOOR.cy;
    K.ringCollar(b, "vault_steel", 0, PCY, -61.88, 0, 1, DOOR.ro, 2.5, {
      tint: [0.55, 0.57, 0.58],
      bolts: 20,
    });
    K.ringCollar(b, "steel", 0, PCY, -61.86, 0, 1, DOOR.ro, DOOR.ro + 0.2, {
      tint: [0.75, 0.77, 0.78],
    });
    K.ringCollar(b, "vault_steel", 0, PCY, -62.12, 0, -1, DOOR.ro, 2.5, {
      tint: [0.5, 0.52, 0.53],
      bolts: 12,
    });
    for (let k = 0; k < 24; k++) {
      const a0 = (k / 24) * PI * 2,
        a1 = ((k + 1) / 24) * PI * 2,
        am = (a0 + a1) / 2,
        P = (z, a) => [Math.cos(a) * DOOR.ro, PCY + Math.sin(a) * DOOR.ro, z];
      b.quadN(
        "vault_steel",
        P(-62.13, a0),
        P(-61.87, a0),
        P(-61.87, a1),
        P(-62.13, a1),
        [-Math.cos(am), -Math.sin(am), 0],
        { tint: [0.6, 0.62, 0.63] },
      );
    }
    b.boxMM("steel", -1.3, VY, -62.14, 1.3, PCY - DOOR.ro + 0.02, -61.86, {
      tint: [0.55, 0.55, 0.56],
      faces: "nsewt",
    });
    b.col(-1.5, VY, -62.2, 1.5, PCY - DOOR.ro + 0.02, -61.8, {
      tag: "floor",
      surface: "metal",
    });
    for (let k = 0; k < 6; k++)
      b.box(
        "paint_yellow",
        -2.2 + k * 0.9,
        VY + 0.005,
        -60.6,
        0.45,
        0.004,
        0.7,
        { yaw: 0.6, tint: [0.85, 0.7, 0.2] },
      );
    b.boxMM("steel", -3.2, VY, -62.0, -2.5, VY + 4.9, -61.8, {
      tint: [0.45, 0.46, 0.47],
    });
    b.boxMM("steel", 2.5, VY, -62.0, 3.2, VY + 4.9, -61.8, {
      tint: [0.45, 0.46, 0.47],
    });
    b.plate(
      "art",
      0,
      VY + 4.5,
      -61.78,
      0,
      1,
      3.6,
      0.35,
      K.signCell("bt_mosler", "MOSLER SAFE CO. · HAMILTON, OHIO", 512, 48, {
        bg: "#2a2a28",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    // time-lock clock dials beside the door
    const tl = K.paint(
      "art",
      "bt_timelock",
      256,
      128,
      function (x, X, Y, W, H) {
        x.fillStyle = "#2a2622";
        x.fillRect(X, Y, W, H);
        for (let k = 0; k < 3; k++) {
          const cx = X + W * (0.2 + k * 0.3),
            cy = Y + H * 0.5;
          x.fillStyle = "#e0d8c0";
          x.beginPath();
          x.arc(cx, cy, H * 0.32, 0, PI * 2);
          x.fill();
          x.strokeStyle = "#1a1410";
          x.lineWidth = 3;
          x.beginPath();
          x.moveTo(cx, cy);
          x.lineTo(
            cx + Math.cos(k * 2.1) * H * 0.25,
            cy + Math.sin(k * 2.1) * H * 0.25,
          );
          x.stroke();
          for (let t = 0; t < 12; t++) {
            const a = (t / 12) * PI * 2;
            x.fillRect(
              cx + Math.cos(a) * H * 0.27,
              cy + Math.sin(a) * H * 0.27,
              2,
              2,
            );
          }
        }
        x.fillStyle = "#d8c890";
        x.font = "bold 12px Georgia, serif";
        x.textAlign = "center";
        x.fillText("TIME LOCK — 72 HR MOVEMENT", X + W / 2, Y + H * 0.95);
      },
    );
    b.plate("art", 4.6, VY + 2.4, -61.88, 0, 1, 1.4, 0.7, tl, { off: 0.02 });
    // robot bays (three alcoves on the side walls)
    ctx.btBays = [];
    for (const [x, z, nx] of [
      [AX0 + 0.1, -58, 1],
      [AX1 - 0.1, -58, -1],
      [AX1 - 0.1, -53, -1],
    ]) {
      const cx = x + nx * 0.7;
      b.boxMM(
        "metal_dark",
        Math.min(x, x + nx * 1.4),
        VY,
        z - 1.1,
        Math.max(x, x + nx * 1.4),
        VY + 0.12,
        z + 1.1,
        { tint: [0.3, 0.3, 0.3] },
      );
      b.boxMM(
        "metal_dark",
        Math.min(x, x + nx * 0.2),
        VY,
        z - 1.2,
        Math.max(x, x + nx * 0.2),
        VY + 3.2,
        z + 1.2,
        { tint: [0.28, 0.3, 0.3] },
      );
      b.plate(
        "art",
        x + nx * 0.22,
        VY + 2.8,
        z,
        nx,
        0,
        1.6,
        0.3,
        K.signCell("bt_bay", "VAULT RESPONSE UNIT", 256, 48, {
          bg: "#c8a830",
          fg: "#141414",
          font: "Arial Black, sans-serif",
        }),
        { off: 0.01 },
      );
      b.geo("lamp", K.sphereGeo(), {
        x: x + nx * 0.25,
        y: VY + 3.35,
        z,
        s: 0.08,
        tint: red,
      });
      b.glow(x + nx * 0.3, VY + 3.35, z, [0.7, 0.12, 0.05], 0.9);
      // alcove frame: side ribs + hood, charging cradle & clamp arms, cable bundles, floor rails
      for (const s2 of [-1, 1]) {
        b.boxMM(
          "steel",
          Math.min(x, x + nx * 1.5),
          VY,
          z + s2 * 1.25 - 0.12,
          Math.max(x, x + nx * 1.5),
          VY + 3.3,
          z + s2 * 1.25 + 0.12,
          { tint: [0.45, 0.46, 0.47], faces: "nsewt" },
        );
        b.col(
          Math.min(x, x + nx * 1.5),
          VY,
          z + s2 * 1.25 - 0.12,
          Math.max(x, x + nx * 1.5),
          VY + 3.3,
          z + s2 * 1.25 + 0.12,
          { tag: "wall" },
        );
      }
      b.boxMM(
        "steel",
        Math.min(x, x + nx * 1.55),
        VY + 3.3,
        z - 1.4,
        Math.max(x, x + nx * 1.55),
        VY + 3.6,
        z + 1.4,
        { tint: [0.4, 0.41, 0.42], faces: "nsewtb" },
      );
      b.boxMM(
        "paint_yellow",
        Math.min(x + nx * 1.5, x + nx * 1.56),
        VY + 3.3,
        z - 1.4,
        Math.max(x + nx * 1.5, x + nx * 1.56),
        VY + 3.6,
        z + 1.4,
        { tint: [0.8, 0.65, 0.2] },
      );
      for (const s2 of [-1, 1]) {
        b.beam(
          "metal_dark",
          x + nx * 0.25,
          VY + 1.6,
          z + s2 * 0.5,
          x + nx * 0.75,
          VY + 1.5,
          z + s2 * 0.75,
          0.1,
          0.1,
          { tint: [0.3, 0.3, 0.3] },
        );
        b.box(
          "paint_yellow",
          x + nx * 0.78,
          VY + 1.38,
          z + s2 * 0.78,
          0.14,
          0.25,
          0.14,
          { tint: [0.8, 0.65, 0.2] },
        );
      }
      for (let k = 0; k < 3; k++)
        b.pipe(
          "rubber",
          x + nx * 0.25,
          VY + 3.2,
          z - 0.3 + k * 0.3,
          x + nx * 0.5,
          VY + 1.8 - k * 0.2,
          z - 0.2 + k * 0.2,
          0.03,
          4,
          { tint: [0.12, 0.12, 0.12] },
        );
      for (const s2 of [-0.5, 0.5])
        b.boxMM(
          "steel",
          Math.min(x, x + nx * 1.5),
          VY,
          z + s2 - 0.05,
          Math.max(x, x + nx * 1.5),
          VY + 0.16,
          z + s2 + 0.05,
          { tint: [0.6, 0.6, 0.62] },
        );
      b.light(x + nx * 0.7, VY + 3.0, z, [1, 0.3, 0.2], 0.5, 3.2, { box: AB });
      ctx.btBays.push({ x: cx, y: VY, z, yaw: nx > 0 ? -HP : HP });
    }
    K.lamp(b, 0, VY + 4.3, -55, "tube", cold, 1.0, 10, {
      ceil: VY + 5,
      len: 1.6,
      lightOpts: { box: AB },
    });
    K.lamp(b, -4, VY + 4.3, -59.5, "tube", cold, 0.6, 7, {
      ceil: VY + 5,
      len: 1.2,
      lightOpts: { box: AB },
    });
    K.lamp(b, 4, VY + 4.3, -51.5, "tube", cold, 0.6, 7, {
      ceil: VY + 5,
      len: 1.2,
      lightOpts: { box: AB },
    });
    b.light(0, VY + 2, -60, [1, 0.3, 0.2], 0.35, 6, { box: AB });
    b.plate(
      "art",
      AX1 - 0.12,
      VY + 2.2,
      -50.6,
      -1,
      0,
      1.2,
      1.5,
      K.signCell(
        "bt_rules",
        "SAFE DEPOSIT\nRULES\n\n1. One visitor\n2. No weapons\n3. The time lock\n   is final",
        192,
        240,
        { bg: "#e8e0c8", fg: "#2a2218", font: "Georgia, serif" },
      ),
    );

    // ================================================= THE VAULT
    const VB = [
      VAULT.x0 - 0.2,
      VY - 0.2,
      VAULT.z0 - 0.2,
      VAULT.x1 + 0.2,
      VY + 4.4,
      -61.9,
    ];
    K.room(b, ctx, {
      x0: VAULT.x0,
      z0: VAULT.z0,
      x1: VAULT.x1,
      z1: -62,
      y: VY,
      h: 4.2,
      floor: "metal",
      fc: [0.5, 0.5, 0.48],
      wall: "deposit",
      wc: [0.95, 0.9, 0.85],
      ceil: "metal_dark",
      cc: [0.38, 0.38, 0.38],
      surface: "metal",
      trim: false,
    });
    // centre table + cash carts
    K.table(b, 0, VY, -68, 3.2, 1.2, { mat: "steel", h: 0.9 });
    for (let k = 0; k < 10; k++)
      b.box(
        "paint_green",
        -1.2 + (k % 5) * 0.55,
        VY + 0.9,
        -68.3 + Math.floor(k / 5) * 0.55,
        0.45,
        0.08 + r() * 0.12,
        0.22,
        { yaw: r() * 0.3, tint: [0.45, 0.55, 0.4] },
      );
    for (const [cx, cz] of [
      [-3.5, -65],
      [3.2, -71],
    ]) {
      b.boxMM(
        "steel",
        cx - 0.6,
        VY + 0.3,
        cz - 0.4,
        cx + 0.6,
        VY + 1.1,
        cz + 0.4,
        { tint: [0.6, 0.6, 0.6] },
      );
      for (const [dx, dz] of [
        [-0.5, -0.3],
        [0.5, -0.3],
        [-0.5, 0.3],
        [0.5, 0.3],
      ])
        b.cyl("rubber", cx + dx, VY, cz + dz, 0.08, 0.08, 0.3, 6);
      b.col(cx - 0.6, VY, cz - 0.4, cx + 0.6, VY + 1.1, cz + 0.4, {
        tag: "furniture",
      });
    }
    // the gold cage at the north end
    for (let x = -3; x <= 3.01; x += 0.15)
      if (Math.abs(x) > 0.5)
        b.pipe("black_iron", x, VY, -72.5, x, VY + 4.2, -72.5, 0.016, 4);
    b.beam("black_iron", -3, VY + 2.3, -72.5, 3, VY + 2.3, -72.5, 0.05, 0.08);
    b.col(-3, VY, -72.6, -0.5, VY + 4.2, -72.4, { walkable: false });
    b.col(0.5, VY, -72.6, 3, VY + 4.2, -72.4, { walkable: false });
    for (let k = 0; k < 24; k++)
      b.box(
        "gold",
        -2.4 + (k % 6) * 0.55,
        VY + 0.12 + Math.floor(k / 12) * 0.1,
        -74.8 + (Math.floor(k / 6) % 2) * 0.3,
        0.5,
        0.1,
        0.24,
        { tint: [0.95, 0.8, 0.4] },
      );
    b.boxMM("wood", -2.8, VY, -75.2, 1.0, VY + 0.12, -74.3, {
      tint: [0.5, 0.4, 0.3],
    });
    K.lamp(b, 0, VY + 3.7, -66, "cage", warm, 0.9, 8, {
      ceil: VY + 4.2,
      lightOpts: { box: VB },
    });
    K.lamp(b, 0, VY + 3.7, -73.5, "cage", warm, 0.9, 7, {
      ceil: VY + 4.2,
      lightOpts: { box: VB },
    });
    b.light(0, VY + 1, -74.5, [1, 0.8, 0.4], 0.6, 4, { box: VB }); // gold glint
    // the ventilation grate (one-way exit)
    b.boxMM(
      "black_iron",
      VAULT.x0 + 0.1,
      VY + 0.2,
      -71.2,
      VAULT.x0 + 0.16,
      VY + 1.2,
      -69.8,
      { tint: [0.25, 0.25, 0.25] },
    );
    for (let k = 0; k < 8; k++)
      b.beam(
        "steel",
        VAULT.x0 + 0.18,
        VY + 0.25 + k * 0.12,
        -71.15,
        VAULT.x0 + 0.18,
        VY + 0.25 + k * 0.12,
        -69.85,
        0.03,
        0.03,
      );

    // ================================================= BOILER ROOM (vent exit → antechamber)
    const BX0 = -20,
      BX1 = -8,
      BZ0 = -62,
      BZ1 = -49;
    const BB = [BX0 - 0.2, VY - 0.2, BZ0 - 0.2, BX1 + 0.2, VY + 4.7, BZ1 + 0.2];
    K.room(b, ctx, {
      x0: BX0,
      z0: BZ0,
      x1: BX1,
      z1: BZ1,
      y: VY,
      h: 4.5,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "brick_red",
      wc: [0.6, 0.45, 0.38],
      ceil: "concrete_dark",
      cc: [0.3, 0.3, 0.3],
      surface: "concrete",
      trim: false,
    });
    b.cyl("rust", -16, VY, -56, 1.6, 1.6, 3.2, 14, { tint: [0.55, 0.4, 0.3] });
    b.box("metal_dark", -16, VY + 0.4, -54.35, 0.8, 0.6, 0.1, {
      tint: [0.2, 0.2, 0.2],
    });
    b.col(-17.6, VY, -57.6, -14.4, VY + 3.2, -54.4, {
      tag: "furniture",
      surface: "metal",
    });
    for (let k = 0; k < 5; k++)
      b.pipe(
        k % 2 ? "rust" : "metal",
        BX0 + 0.3,
        VY + 3.2 + k * 0.22,
        BZ0 + 0.4,
        BX1 - 0.3,
        VY + 3.2 + k * 0.22,
        BZ0 + 0.4,
        0.07,
        6,
      );
    b.pipe("rust", -16, VY + 3.2, -56, -16, VY + 4.5, -56, 0.25, 8);
    b.boxMM("metal", BX0 + 0.1, VY + 3.1, -61.2, BX0 + 0.7, VY + 3.9, -58, {
      tint: [0.5, 0.5, 0.48],
    }); // duct end
    b.geo("lamp", K.sphereGeo(), {
      x: -16,
      y: VY + 0.7,
      z: -54.3,
      s: 0.12,
      tint: [1, 0.4, 0.1],
    });
    b.plate("lamp", -16, VY + 0.7, -54.28, 0, 1, 0.6, 0.35, null, {
      tint: [1, 0.45, 0.12],
    });
    b.light(-16, VY + 0.6, -53.4, [1, 0.45, 0.18], 1.6, 8, { box: BB });
    b.hplate(
      "decal",
      -16,
      VY + 0.012,
      -53.2,
      2.4,
      1.6,
      0,
      K.decal("scorch", 45),
    );
    b.glow(-16, VY + 0.7, -54.1, [0.9, 0.35, 0.08], 1.8);
    K.lamp(b, -11, VY + 3.9, -52, "cage", warm, 0.8, 7, {
      ceil: VY + 4.5,
      lightOpts: { box: BB },
    });
    K.lamp(b, -8.9, VY + 2.8, -55.9, "cage", warm, 0.6, 5, {
      ceil: VY + 4.5,
      lightOpts: { box: BB },
    });
    K.lamp(b, -19, VY + 3.2, -60.5, "cage", [1, 0.8, 0.55], 0.6, 5, {
      ceil: VY + 4.5,
      lightOpts: { box: BB },
    });
    // pipe runs on every wall, valves & gauges, a steam leak, the janitor's workbench, the pump
    for (let k = 0; k < 3; k++) {
      b.pipe(
        k % 2 ? "rust" : "metal",
        BX0 + 0.3,
        VY + 1.2 + k * 0.5,
        BZ1 - 0.35,
        BX0 + 0.3,
        VY + 1.2 + k * 0.5,
        BZ0 + 0.4,
        0.06,
        6,
      );
      b.pipe(
        "metal",
        BX1 - 0.3,
        VY + 2.4 + k * 0.4,
        BZ1 - 0.4,
        BX1 - 0.3,
        VY + 2.4 + k * 0.4,
        BZ0 + 0.4,
        0.05,
        6,
      );
    }
    for (const [vx, vy, vz, nx] of [
      [BX0 + 0.42, VY + 1.2, -55, 1],
      [BX0 + 0.42, VY + 1.7, -52, 1],
      [BX1 - 0.42, VY + 2.4, -58, -1],
    ]) {
      b.geo("paint_red", new THREE.TorusGeometry(0.16, 0.025, 4, 12), {
        x: vx,
        y: vy + 0.2,
        z: vz,
        ry: Math.PI / 2,
        tint: [0.7, 0.15, 0.1],
      });
      b.pipe("metal", vx, vy, vz, vx, vy + 0.2, vz, 0.02, 4);
    }
    for (let k = 0; k < 4; k++) {
      const gz = -60 + k * 2.2;
      b.cyl("brass", BX0 + 0.15, VY + 1.9, gz, 0.13, 0.13, 0.06, 12, {
        tint: [0.8, 0.65, 0.35],
      });
      b.plate(
        "art",
        BX0 + 0.12,
        VY + 1.93,
        gz,
        1,
        0,
        0.2,
        0.2,
        K.medallion("star", 64),
        { off: 0.07 },
      );
    }
    for (let k = 0; k < 6; k++)
      b.glow(
        -12.8 + k * 0.1,
        VY + 2.9 - k * 0.25,
        -61.5 + k * 0.18,
        [0.28, 0.28, 0.27],
        0.8 + k * 0.25,
      ); // steam leak
    K.table(b, -10.2, VY, -60.9, 2.4, 0.8, { mat: "metal", h: 0.9 });
    b.boxMM("metal_dark", -11.2, VY + 0.9, -61.2, -10.6, VY + 1.2, -60.8, {
      tint: [0.5, 0.2, 0.15],
    });
    for (let k = 0; k < 4; k++)
      b.box("steel", -9.8 + k * 0.2, VY + 0.9, -60.8, 0.05, 0.02, 0.28, {
        yaw: r(),
      });
    b.cyl("paint_green", -18.4, VY, -52.4, 0.45, 0.45, 1.2, 12, {
      tint: [0.25, 0.35, 0.25],
    });
    b.col(-18.9, VY, -52.9, -17.9, VY + 1.2, -51.9, {
      tag: "furniture",
      surface: "metal",
    });
    K.clutter(b, BX0, BZ0, BX1, BZ1, VY, {
      n: 12,
      seed: 2326,
      kinds: ["debris", "can", "paper", "box"],
      avoid: [
        [-17.8, -57.8, -14.2, -54],
        [-8.8, -55, -8, -53],
        [-19, -60, -17.4, -58.8],
      ],
      debrisTint: [0.55, 0.5, 0.45],
    });
    b.plate(
      "art",
      BX0 + 1.8,
      VY + 1.2,
      BZ0 + 0.12,
      0,
      1,
      0.5,
      2.8,
      K.signCell("bt_ladder", "LADDER\n\nLOBBY\nHATCH\n▲", 64, 256, {
        bg: "#c8a830",
        fg: "#141414",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.02 },
    );
    for (let k = 0; k < 12; k++)
      b.beam(
        "steel",
        BX0 + 1.5,
        VY + 0.3 + k * 0.33,
        BZ0 + 0.18,
        BX0 + 2.1,
        VY + 0.3 + k * 0.33,
        BZ0 + 0.18,
        0.04,
        0.04,
      );
    for (const lx of [BX0 + 1.5, BX0 + 2.1])
      b.beam("steel", lx, VY, BZ0 + 0.18, lx, VY + 4.5, BZ0 + 0.18, 0.05, 0.05);
    K.rubble(b, -18.5, VY, -50.5, 1.0, 0.6, { seed: 23 });
    K.litter(b, BX0 + 0.5, BZ0 + 0.5, BX1 - 0.5, BZ1 - 0.5, VY, 14, 2302);

    // ================================================= PYRAMID ROOM (y +40)
    const RX0 = -10,
      RX1 = 10,
      RZ0 = -110,
      RZ1 = -90;
    const RB = [RX0 - 0.3, PY - 1, RZ0 - 0.3, RX1 + 0.3, PY + 14, RZ1 + 0.3];
    K.room(b, ctx, {
      x0: RX0,
      z0: RZ0,
      x1: RX1,
      z1: RZ1,
      y: PY,
      h: 4.4,
      floor: "carpet",
      fc: [0.55, 0.2, 0.18],
      wall: "wood",
      wc: [0.55, 0.36, 0.24],
      noCeil: true,
      surface: "carpet",
      trimMat: "brass",
    });
    // windows on the skyline in every wall (mullioned), sills; the view is painted
    const sk = [K.skyline(1), K.skyline(2), K.skyline(3), K.skyline(4)];
    const winRow = (ax, az, bx, bz, nx, nz, img) => {
      const len = Math.hypot(bx - ax, bz - az),
        n = 4;
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n,
          cx = ax + (bx - ax) * t,
          cz = az + (bz - az) * t;
        b.plate(
          "pics",
          cx + nx * 0.13,
          PY + 2.3,
          cz + nz * 0.13,
          nx,
          nz,
          len / n - 0.7,
          2.6,
          img,
          { tint: [1.1, 1.1, 1.05], off: 0.01 },
        );
        b.plate(
          "lamp",
          cx + nx * 0.12,
          PY + 2.3,
          cz + nz * 0.12,
          nx,
          nz,
          len / n - 0.5,
          2.8,
          null,
          { tint: [0.12, 0.1, 0.08], off: 0.005 },
        );
        b.beam(
          "bronze",
          cx + nx * 0.17,
          PY + 1.0,
          cz + nz * 0.17,
          cx + nx * 0.17,
          PY + 3.6,
          cz + nz * 0.17,
          0.08,
          0.08,
          { tint: [0.4, 0.34, 0.24] },
        );
        b.beam(
          "bronze",
          cx + nx * 0.17,
          PY + 2.75,
          cz + nz * 0.17,
          cx + nx * 0.17 + (nz * (len / n - 0.7)) / 2,
          PY + 2.75,
          cz + nz * 0.17 - (nx * (len / n - 0.7)) / 2,
          0.06,
          0.06,
          { tint: [0.4, 0.34, 0.24] },
        );
        b.beam(
          "bronze",
          cx + nx * 0.17,
          PY + 2.75,
          cz + nz * 0.17,
          cx + nx * 0.17 - (nz * (len / n - 0.7)) / 2,
          PY + 2.75,
          cz + nz * 0.17 + (nx * (len / n - 0.7)) / 2,
          0.06,
          0.06,
          { tint: [0.4, 0.34, 0.24] },
        );
        b.box(
          "marble",
          cx + nx * 0.25,
          PY + 0.95,
          cz + nz * 0.15,
          Math.abs(nz) > 0.5 ? len / n - 0.5 : 0.3,
          0.06,
          Math.abs(nx) > 0.5 ? len / n - 0.5 : 0.3,
          { tint: marbleW },
        );
      }
    };
    winRow(RX0 + 1, RZ0, RX1 - 1, RZ0, 0, 1, sk[0]);
    winRow(RX0, RZ0 + 1, RX0, RZ1 - 4, 1, 0, sk[1]);
    winRow(RX1, RZ0 + 1, RX1, RZ1 - 4, -1, 0, sk[2]);
    b.light(0, PY + 2.5, RZ0 + 1.5, [0.95, 0.9, 0.7], 1.0, 14, {
      box: RB,
      wrap: 0.5,
    });
    b.light(RX0 + 1.5, PY + 2.5, -100, [0.95, 0.9, 0.7], 0.8, 12, {
      box: RB,
      wrap: 0.5,
    });
    b.light(RX1 - 1.5, PY + 2.5, -100, [0.95, 0.9, 0.7], 0.8, 12, {
      box: RB,
      wrap: 0.5,
    });
    // stepped pyramid ceiling: six receding tiers, a skylight lantern at the apex
    for (let i = 0; i < 6; i++) {
      const w0 = 20 - i * 2.8,
        d0 = 20 - i * 2.8,
        w1 = w0 - 2.8,
        y = PY + 4.4 + i * 1.1;
      const x0 = -w0 / 2,
        x1 = w0 / 2,
        z0 = -100 - d0 / 2,
        z1 = -100 + d0 / 2;
      const i0 = -w1 / 2,
        i1 = w1 / 2,
        j0 = -100 - w1 / 2,
        j1 = -100 + w1 / 2;
      // underside ring (faces down) + riser (faces inward)
      b.quadN(
        "wood",
        [x0, y, z0],
        [x1, y, z0],
        [i1, y, j0],
        [i0, y, j0],
        [0, -1, 0],
        { tint: [0.5, 0.34, 0.22] },
      );
      b.quadN(
        "wood",
        [x1, y, z0],
        [x1, y, z1],
        [i1, y, j1],
        [i1, y, j0],
        [0, -1, 0],
        { tint: [0.5, 0.34, 0.22] },
      );
      b.quadN(
        "wood",
        [x1, y, z1],
        [x0, y, z1],
        [i0, y, j1],
        [i1, y, j1],
        [0, -1, 0],
        { tint: [0.5, 0.34, 0.22] },
      );
      b.quadN(
        "wood",
        [x0, y, z1],
        [x0, y, z0],
        [i0, y, j0],
        [i0, y, j1],
        [0, -1, 0],
        { tint: [0.5, 0.34, 0.22] },
      );
      if (i < 5) {
        K.fwall(b, "wood", i0, j0, i1, j0, y, 1.1, 0, 1, {
          tint: [0.52, 0.35, 0.23],
        });
        K.fwall(b, "wood", i0, j1, i1, j1, y, 1.1, 0, -1, {
          tint: [0.52, 0.35, 0.23],
        });
        K.fwall(b, "wood", i0, j0, i0, j1, y, 1.1, 1, 0, {
          tint: [0.52, 0.35, 0.23],
        });
        K.fwall(b, "wood", i1, j0, i1, j1, y, 1.1, -1, 0, {
          tint: [0.52, 0.35, 0.23],
        });
        for (const [ax, az, bx2, bz2] of [
          [i0, j0 + 0.03, i1, j0 + 0.03],
          [i0, j1 - 0.03, i1, j1 - 0.03],
          [i0 + 0.03, j0, i0 + 0.03, j1],
          [i1 - 0.03, j0, i1 - 0.03, j1],
        ]) {
          b.beam("gold", ax, y + 0.04, az, bx2, y + 0.04, bz2, 0.05, 0.07);
          b.beam("gold", ax, y + 1.06, az, bx2, y + 1.06, bz2, 0.04, 0.05);
        }
        b.light(0, y - 0.3, -100, [1, 0.82, 0.55], 0.28, w1 * 0.75, {
          box: RB,
          wrap: 0.7,
        });
      } else {
        b.quadN(
          "lamp",
          [i0, y + 0.02, j0],
          [i1, y + 0.02, j0],
          [i1, y + 0.02, j1],
          [i0, y + 0.02, j1],
          [0, -1, 0],
          { tint: [0.55, 0.58, 0.48] },
        );
      }
    }
    b.light(0, PY + 9, -100, [0.9, 0.9, 0.75], 0.55, 12, {
      box: RB,
      wrap: 0.6,
    });
    // the boardroom table with the board at its last meeting
    b.boxMM("mahogany", -1.3, PY + 0.72, -106, 1.3, PY + 0.8, -94, {
      tint: [0.45, 0.2, 0.12],
      faces: "nsewtb",
    });
    for (const z of [-105, -95])
      b.boxMM("mahogany", -0.6, PY, z - 0.4, 0.6, PY + 0.72, z + 0.4, {
        tint: [0.35, 0.16, 0.1],
      });
    b.col(-1.3, PY, -106, 1.3, PY + 0.8, -94, {
      tag: "furniture",
      surface: "wood",
    });
    for (const z of [-103, -97])
      K.lamp(b, 0, PY + 3.3, z, "pendant", [1, 0.84, 0.6], 0.7, 7, {
        ceil: PY + 4.4,
        shade: "brass",
        lightOpts: { box: RB },
      });
    for (let k = 0; k < 5; k++)
      for (const s of [-1, 1]) {
        const z = -104.5 + k * 2.4;
        K.chair(b, s * 1.9, PY, z, s < 0 ? -HP : HP, {
          mat: "leather",
          seatMat: "leather",
        });
        b.box("flat", s * 0.8, PY + 0.81, z, 0.28, 0.005, 0.36, {
          yaw: r() * 0.3,
          tint: [0.85, 0.82, 0.72],
        });
        b.cyl("glass", s * 0.6, PY + 0.8, z + 0.4, 0.035, 0.03, 0.12, 6, {
          tint: [0.6, 0.55, 0.4],
        });
      }
    K.chair(b, 0, PY, -107.2, 0, { mat: "leather", seatMat: "leather" });
    // chairman's desk, bar cart, globe, portrait of the founder, a skeleton at the window
    K.table(b, -6.5, PY, -107, 2.6, 1.1, { mat: "mahogany" });
    b.box("leather", -6.5, PY + 0.77, -107, 1.0, 0.01, 0.6, {
      tint: [0.2, 0.3, 0.2],
    });
    b.cyl("brass", 6.5, PY, -107.5, 0.3, 0.25, 0.8, 8);
    b.geo("paint_blue", K.sphereGeo(), {
      x: 6.5,
      y: PY + 1.25,
      z: -107.5,
      s: 0.45,
      tint: [0.4, 0.55, 0.7],
    });
    b.pipe("brass", 6.5, PY + 0.75, -107.5, 6.5, PY + 1.75, -107.5, 0.03, 4);
    b.geo("brass", new THREE.TorusGeometry(0.5, 0.02, 4, 20), {
      x: 6.5,
      y: PY + 1.25,
      z: -107.5,
      ry: 0.4,
    });
    b.col(6.1, PY, -107.9, 6.9, PY + 1.7, -107.1, { tag: "furniture" });
    K.framed(
      b,
      RX1 - 0.12,
      PY + 2.4,
      -93,
      -1,
      0,
      1.4,
      1.8,
      K.photo("family", 77, 160, 200),
      { frame: "gold" },
    );
    b.boxMM("silver", 7.8, PY, -93.8, 8.8, PY + 0.8, -92.8, {
      tint: [0.6, 0.6, 0.62],
    });
    for (let k = 0; k < 5; k++)
      b.cyl("glass", 7.95 + k * 0.18, PY + 0.8, -93.3, 0.04, 0.035, 0.28, 6, {
        tint: r.pick([
          [0.6, 0.4, 0.15],
          [0.3, 0.5, 0.3],
          [0.8, 0.8, 0.7],
        ]),
      });
    b.hplate("decal", 0, PY + 0.012, -100, 6, 14, 0, K.decal("grime", 70));
    // elevator doors on the south wall
    b.boxMM("bronze", -0.9, PY, RZ1 - 0.1, 0.9, PY + 2.6, RZ1 - 0.02, {
      tint: [0.5, 0.42, 0.3],
    });
    b.beam("bronze", 0, PY, RZ1 - 0.12, 0, PY + 2.6, RZ1 - 0.12, 0.04, 0.03, {
      tint: [0.3, 0.26, 0.2],
    });

    // time-lock keypad beside the door (the Chairman's override)
    b.boxMM("steel", 3.0, VY + 1.1, -61.8, 3.6, VY + 1.8, -61.7, {
      tint: [0.4, 0.4, 0.42],
    });
    for (let k = 0; k < 12; k++)
      b.boxMM(
        "ivory",
        3.08 + (k % 3) * 0.16,
        VY + 1.18 + Math.floor(k / 3) * 0.12,
        -61.72,
        3.2 + (k % 3) * 0.16,
        VY + 1.27 + Math.floor(k / 3) * 0.12,
        -61.68,
        {},
      );
    b.plate("lamp", 3.3, VY + 1.72, -61.69, 0, 1, 0.4, 0.08, null, {
      tint: [1, 0.3, 0.2],
    });
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_bankers_trust_int";

    // ================================================= the vault door (separate hinged mesh)
    const db = K.builder({
      name: "bt_vdoor",
      off: { x: 0, y: 0, z: 0 },
      lit: true,
      amb: [0.1, 0.1, 0.11],
      floors: [0],
      grime: 0.25,
    });
    const dcx = -DOOR.hx,
      dcy = DOOR.cy,
      dcz = DOOR.t / 2 + 0.02;
    db.geo("vault_steel", K.unitCyl(36), {
      x: dcx,
      y: dcy,
      z: dcz,
      rx: HP,
      sx: DOOR.r,
      sy: DOOR.t,
      sz: DOOR.r,
      tint: [0.78, 0.8, 0.8],
    });
    db.geo("steel", new THREE.TorusGeometry(DOOR.r - 0.25, 0.08, 6, 32), {
      x: dcx,
      y: dcy,
      z: dcz + DOOR.t / 2 + 0.02,
      tint: [0.5, 0.52, 0.54],
    });
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * PI * 2;
      db.geo("steel", K.unitCyl(8), {
        x: dcx + Math.cos(a) * (DOOR.r - 0.12),
        y: dcy + Math.sin(a) * (DOOR.r - 0.12),
        z: dcz,
        rx: HP,
        sx: 0.1,
        sy: DOOR.t + 0.3,
        sz: 0.1,
        tint: [0.62, 0.64, 0.66],
      });
    }
    db.geo("brass", K.unitCyl(20), {
      x: dcx,
      y: dcy,
      z: dcz + DOOR.t / 2 + 0.06,
      rx: HP,
      sx: 0.45,
      sy: 0.1,
      sz: 0.45,
      tint: [0.9, 0.75, 0.45],
    });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * PI * 2 + 0.4;
      db.pipe(
        "steel",
        dcx,
        dcy,
        dcz + DOOR.t / 2 + 0.15,
        dcx + Math.cos(a) * 0.95,
        dcy + Math.sin(a) * 0.95,
        dcz + DOOR.t / 2 + 0.15,
        0.04,
        5,
        { tint: [0.6, 0.6, 0.62] },
      );
      db.geo("steel", K.sphereGeo(), {
        x: dcx + Math.cos(a) * 1.0,
        y: dcy + Math.sin(a) * 1.0,
        z: dcz + DOOR.t / 2 + 0.15,
        s: 0.08,
      });
    }
    db.box("steel", -0.1, dcy - 0.9, dcz, 0.4, 1.8, 0.5, {
      tint: [0.4, 0.4, 0.42],
      faces: "nsewtb",
    }); // hinge block
    for (let k = 0; k < 3; k++)
      db.cyl(
        "steel",
        0.05,
        dcy - 1.2 + k * 1.1,
        dcz - 0.3,
        0.12,
        0.12,
        0.3,
        10,
        { tint: [0.5, 0.5, 0.52] },
      ); // hinge knuckles
    db.light(-DOOR.hx, dcy + 1, 2.5, [0.8, 0.9, 1], 1.2, 7);
    db.light(-DOOR.hx, dcy, -2.5, [1, 0.85, 0.6], 0.6, 5);
    const door = db.finish(null);
    door.position.set(O.x + DOOR.hx, O.y + VY, O.z + DOOR.hz);
    door.matrixAutoUpdate = true;
    ctx.intRoot.add(door);
    ctx.btDoor = door;
    ctx.btDoorCol = null;
    setDoorClosed(ctx, true);

    // ================================================= doors, interactables, anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pf3_bt_in",
      pos: PV.bt.door.clone(),
      label: "Bankers Trust Company",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.6, yaw: 0 },
      onEnter: () => {
        K.safe("disc", () => G.discover("bankers_trust"));
        if (!K.q.started("pf3_bt_heist")) K.q.start("pf3_bt_heist");
      },
    });
    K.door(ctx, {
      id: "pf3_bt_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.35),
      label: "Wall Street",
      verb: "Leave",
      target: { x: PV.bt.XC, y: PV.bt.LOG_Y, z: PV.bt.LOG_Z - 2.6, yaw: 0 },
    });
    K.door(ctx, {
      id: "pf3_bt_elev_up",
      pos: new THREE.Vector3(OX - 13.6, OY + 1.3, OZ - 37.4),
      label: "Executive Elevator — Boardroom",
      verb: "Ride",
      sound: "door_open",
      target: { x: OX, y: OY + PY, z: OZ + RZ1 - 1.6, yaw: 0 },
    });
    K.door(ctx, {
      id: "pf3_bt_elev_down",
      pos: new THREE.Vector3(OX, OY + PY + 1.3, OZ + RZ1 - 0.35),
      label: "Executive Elevator — Lobby",
      verb: "Ride",
      sound: "door_open",
      target: { x: OX - 12.4, y: OY, z: OZ - 37.4, yaw: -HP },
    });
    K.door(ctx, {
      id: "pf3_bt_vent",
      pos: new THREE.Vector3(OX + VAULT.x0 + 0.5, OY + VY + 0.7, OZ - 70.5),
      radius: 1.0,
      label: "Ventilation Duct",
      verb: "Crawl into",
      sound: "door_open",
      target: { x: OX + BX0 + 1.6, y: OY + VY, z: OZ - 59.5, yaw: -HP },
      onEnter: () => {
        PV.setFlag("bt_trapped", false);
        if (K.q.active("pf3_bt_heist")) {
          K.q.complete("pf3_bt_heist");
          K.notify(
            "You squeeze out of the duct into the boiler room, coughing halon.",
          );
        }
      },
    });
    // one-way maintenance ladder: boiler room → hatch in the elevator lobby floor (bolted from below)
    K.oneWay(ctx, {
      flag: "bt_ladder",
      open: {
        pos: new THREE.Vector3(OX + BX0 + 1.8, OY + VY + 1.2, OZ + BZ0 + 0.6),
        label: "Maintenance Ladder — Lobby Hatch",
        verb: "Climb",
        target: { x: OX - 5.2, y: OY, z: OZ - 40.0, yaw: HP },
        msg: "You shoulder the hatch open into the elevator lobby. A way back down.",
      },
      barred: {
        pos: new THREE.Vector3(OX - 5.2, OY + 0.4, OZ - 41.6),
        label: "Maintenance Hatch",
        verb: "Climb down",
        target: { x: OX + BX0 + 1.8, y: OY + VY, z: OZ + BZ0 + 1.2, yaw: PI },
        msg: "The hatch is bolted from below.",
      },
    });
    // time-lock keypad (the Chairman's code) + the console terminal
    ctx.interactables.push(
      G.world.addInteractable({
        pos: new THREE.Vector3(OX + 3.3, OY + VY + 1.4, OZ - 61.7),
        radius: 0.5,
        label: "Time-Lock Keypad",
        verb: "Enter Override Code",
        priority: 2,
        enabled: () => !PV.flag("bt_state"),
        locked: () =>
          K.lockIsOpen(BT_LOCKS.override.id) ? null : "Six-digit override",
        onInteract: () =>
          K.lockOpen(BT_LOCKS.override, () => {
            PV.setFlag("bt_code", true);
            PV.btStartHeist(true);
          }),
      }),
    );
    K.anchor(ctx, "entrance", 0, 0, -1.6);
    K.anchor(ctx, "boss", 0, VY, -56);
    [
      [-4, 0, -12],
      [4, 0, -27],
      [-4.5, 0, -24],
      [4.5, 0, -15],
      [9, 0, -39],
      [-3, VY, -52.5],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "vault", 0, VY, -68);
    K.anchor(ctx, "vent", VAULT.x0 + 1.2, VY, -70.5);
    K.anchor(ctx, "console", -4.2, VY, -60.8);
    K.anchor(ctx, "chairman", -6.5, PY, -106);
    K.anchor(ctx, "loot1", 0, VY, -74);
    K.anchor(ctx, "loot2", -6.5, PY, -107.5);
    K.anchor(ctx, "loot3", 12.5, 0, -41);

    // ---- props & containers ----
    K.terminal(
      ctx,
      "pf3_term_bt_timelock",
      -4.2,
      VY,
      -60.9,
      0,
      termTimeLock(),
      "own_desk",
    );
    K.terminal(
      ctx,
      "pf3_term_bt_security",
      10.2,
      0.8,
      -40.9,
      0,
      termSecurity(),
      "bare",
    );
    K.terminal(
      ctx,
      "pf3_term_bt_chairman",
      -6.2,
      PY + 0.76,
      -106.9,
      PI,
      termChairman(),
      "bare",
    );
    K.loot(ctx, "locker", 13.3, 0, -37.5, -HP, {
      count: 2,
      loot: "locker",
      name: "Guard Lockers",
      lock: BT_LOCKS.lockers,
    });
    K.loot(ctx, "ammo_box", 13.2, 0, -41.8, -HP, {
      loot: "ammo_box",
      name: "Guard Ammunition",
    });
    K.loot(ctx, "desk", -12, 0.3, -17, HP, {
      loot: "desk",
      name: "Loan Officer's Desk",
    });
    K.loot(ctx, "cash_register", 11.2, 1.05, -21.8, -HP, {
      loot: "cash_register",
      name: "Teller Drawer",
    });
    K.loot(ctx, "cash_register", 11.2, 1.05, -14.6, -HP, {
      loot: "cash_register",
      name: "Teller Drawer",
    });
    K.loot(ctx, "safe", 9.2, PY + 1.2, -109.75, 0, {
      wall: true,
      loot: "wall_safe",
      lock: BT_LOCKS.wallsafe,
      name: "Chairman's Wall Safe",
      items: [
        ["pf3_bt_pen", 1],
        ["pf3_bt_box_key", 1],
      ],
    });
    K.loot(ctx, "file_cabinet", -9.4, PY, -104, HP, {
      loot: "file_cabinet",
      name: "Board Minutes",
    });
    K.loot(ctx, "toolbox", -18.8, VY, -60.6, 0, {
      loot: "toolbox",
      name: "Janitor's Toolbox",
    });
    // the vault's deposit boxes and the gold (only reachable during the heist — or by the vent… which is one-way)
    const boxes = [
      [-6.6, -64.5],
      [-6.6, -67.5],
      [-6.6, -73.5],
      [6.6, -64.5],
      [6.6, -67.8],
      [6.6, -71],
      [6.6, -74],
    ];
    boxes.forEach(([x, z], i) =>
      K.loot(
        ctx,
        "safe",
        x,
        VY + 0.9 + (i % 2) * 0.8,
        z,
        x < 0 ? HP : -HP,
        Object.assign(
          {
            wall: true,
            loot: "safe",
            name: "Safe Deposit Box " + (1041 + i * 17),
          },
          BOX_LOCKS[i] ? { lock: BOX_LOCKS[i] } : {},
        ),
      ),
    );
    K.loot(ctx, "crate", -1.9, VY, -74.8, 0, {
      kind: "plain",
      name: "Gold Reserve",
      items: [
        ["gold_bar", 3],
        ["pf3_bt_bonds", 1],
      ],
    });
    K.loot(ctx, "ammo_box", 2.2, VY, -74.9, 0, {
      loot: "safe",
      name: "Bullion Cart",
    });
    K.skel(ctx, -2.8, VY, -66.5, 1.2, "reaching");
    K.pickup(ctx, "gold_bar", 1, -0.8, VY + 0.13, -74.6, 0.1);
    K.pickup(ctx, "gold_bar", 1, 0.6, VY + 0.13, -74.9, 1.4);
    K.skel(ctx, -6.6, 0.45, -42.3, 0, "seated");
    K.skel(ctx, -16.8, VY, -51.2, 0.3, "curled");
    K.note(ctx, "pf3_note_bt_clerk", -16.2, VY + 0.03, -50.6, {
      name: "Vault Clerk's Duty Card",
      title: "Safe Deposit Dept. — Duty Card, R. Okonkwo",
      learn: BT_LOCKS.console.id,
      text: "SUNDAY CALL-IN (EMERGENCY BOARD SESSION) · 08:00 – ? · VAULT LEVEL\nOpen the department at 08:30 sharp. Log the time lock at the console every hour.\n\nCONSOLE LOG-ON (week of 02.27): STEWARDSHIP\n(Mr. Ashcombe picks them from the Chairman's speeches. Last week's was PRUDENCE.)\n\nOn the back, in pencil: \"Sirens. Going down to the boiler room, it's the thickest wall. Tell my mother —\"",
    });
    K.note(ctx, "pf3_note_bt_guard", -7.3, 0.03, -41.8, {
      name: "Night Guard's Duty Card",
      title: "Bankers Trust Protective Dept. — Duty Card, Night Watch",
      learn: [BT_LOCKS.security.id, BT_LOCKS.lockers.id],
      text: "POST: Lobby & Security Office · 22:00 – 08:00\n\nSECURITY CONTROL LOG-ON: NIGHTWATCH\nGUARD LOCKERS (both): 3308\n\nThe robots run the branch in the daytime now. You are there to sign their timesheets. Do not argue with Teller-Unit 7.",
    });
    K.note(ctx, "pf3_note_bt_register", -3.3, VY + 0.03, -60.2, {
      name: "Safe Deposit Register (carbon)",
      title: "Safe Deposit Register — Bank's Copy (DUAL CONTROL)",
      learn: BOX_LOCKS.filter(Boolean).map((l) => l.id),
      text: "BOX     RENTER                     COMBINATION\n1041    (vacant)                   —\n1058    Mrs. E. Van Rensselaer     5814\n1075    Haskins & Sons, Importers    2290\n1092    (vacant)                   —\n1109    Dr. M. Oyelaran               7736\n1126    The Hon. J. Thurlow         4061\n1143    Office of Civil Defense     9127  (SEALED — PROJECT LONG WINTER)\n\nMaster key: Chairman's safe ONLY.",
    });
    for (let k = 0; k < 7; k++)
      K.skel(
        ctx,
        (k % 2 ? 1.25 : -1.25) * 1.52,
        PY,
        -104.5 + Math.floor(k / 2) * 2.4 + (k === 6 ? 2.4 : 0),
        k % 2 ? -HP : HP,
        "seated",
      );
    K.skel(ctx, -8.6, PY, -108.6, 0.6, "lying");
    K.note(ctx, "pf3_reel_board", 0.2, PY + 0.82, -99.5, {
      type: "tape",
      name: 'Tape reel: "Q4 Board Meeting"',
      title: "Bankers Trust — Board of Directors, 03.05.1967, 09:30",
      learn: BT_LOCKS.chairman.id,
      text: "CHAIRMAN: — and so the Civil Defense bond account is, frankly, the finest investment this bank has ever made, and it is why we are here on a Sunday. Our depositors' futures are secure. Miss Kettering, please type that up on my machine; the word is MARGARET. — No, don't minute the word. Next item.\n\nDIRECTOR: Sir, the sirens.\n\nCHAIRMAN: A drill. Next item: the Easter dinner.\n\nDIRECTOR: Sir, they're not stopping.\n\nCHAIRMAN: Then we'll vote. All in favour of remaining in session?\n\n[Eleven voices: \"Aye.\"]\n\nCHAIRMAN: Motion carries. The time lock is set; our assets are safe for seventy-two hours. We will reconvene — [a sound like the sky tearing] — \n\n[Static. The recording keeps running for four hours. Nobody speaks again.]",
    });
  };

  // ------------------------------------------------------------------
  // Heist machinery
  // ------------------------------------------------------------------
  function setDoorClosed(ctx, closed) {
    const O = ctx.O;
    if (closed && !ctx.btDoorCol)
      ctx.btDoorCol = G.world.addBox(
        O.x - 2.4,
        O.y + VY,
        O.z - 62.4,
        O.x + 2.4,
        O.y + VY + 3.9,
        O.z - 61.5,
        { tag: "poi_fidi3", surface: "metal", walkable: false },
      );
    if (!closed && ctx.btDoorCol) {
      K.safe("rmcol", () => G.world.removeCollider(ctx.btDoorCol));
      ctx.btDoorCol = null;
    }
    // the swung-open door is a 4 m steel slab: give it a collider along its open position
    if (!closed && !ctx.btDoorOpenCol) {
      const a = DOOR.open,
        L = DOOR.r * 2 + 0.2,
        lx = -L / 2,
        lz = DOOR.t / 2;
      const cx = O.x + DOOR.hx + lx * Math.cos(a) + lz * Math.sin(a),
        cz = O.z + DOOR.hz - lx * Math.sin(a) + lz * Math.cos(a);
      ctx.btDoorOpenCol =
        K.safe("opencol", () =>
          G.world.addCollider(
            cx,
            cz,
            L,
            DOOR.t + 0.3,
            O.y + VY,
            O.y + VY + 3.9,
            -a,
            { tag: "poi_fidi3", surface: "metal", walkable: false },
          ),
        ) || null;
    }
    if (closed && ctx.btDoorOpenCol) {
      K.safe("rmcol", () => G.world.removeCollider(ctx.btDoorOpenCol));
      ctx.btDoorOpenCol = null;
    }
  }
  const H = {
    ctx: null,
    t: 0,
    anim: 0,
    target: 0,
    alarm: null,
    halonT: 0,
    ui: null,
    last: -1,
  };
  function inVault(p) {
    const O = H.ctx.O;
    return (
      p.x > O.x + VAULT.x0 &&
      p.x < O.x + VAULT.x1 &&
      p.z > O.z + VAULT.z0 &&
      p.z < O.z + VAULT.z1 &&
      Math.abs(p.y - (O.y + VY)) < 3
    );
  }
  function ui() {
    if (H.ui) return H.ui;
    const d = document.createElement("div");
    d.id = "pf3-heist";
    d.className = "pf3-heist";
    d.innerHTML =
      '<div class="pf3-heist-t">VAULT TIME LOCK</div><div class="pf3-heist-c">1:30</div>';
    (document.getElementById("hud") || document.body).appendChild(d);
    return (H.ui = d);
  }
  function stopAlarm() {
    if (H.alarm && H.alarm.stop) K.safe("alarm", () => H.alarm.stop());
    H.alarm = null;
  }
  PV.btStartHeist = function (withCode) {
    const ctx = H.ctx;
    if (!ctx || PV.flag("bt_state")) return;
    const calm = !!PV.flag("bt_robots_off");
    const t = 90 + (withCode ? 45 : 0) + (calm ? 45 : 0);
    PV.setFlag("bt_state", "open");
    PV.setFlag("bt_t", t);
    H.target = DOOR.open;
    if (ctx.btDoorCol) {
      K.safe("rmcol", () => G.world.removeCollider(ctx.btDoorCol));
      ctx.btDoorCol = null;
    }
    const O = ctx.O,
      at = new THREE.Vector3(O.x, O.y + VY + 2, O.z - 61);
    K.sfx("cryo_door", at, { volume: 1 });
    if (!calm) {
      H.alarm = K.sfx("cryo_alarm", at, { loop: true, volume: 0.7 });
      const types = ["bulwark", "patrolman", "patrolman"];
      (ctx.btBays || []).forEach((p, i) =>
        PV.spawnActor(ctx, {
          id: "pf3_bt_resp" + (i + 1),
          type: types[i],
          name: i ? "Vault Response Patrolman" : "Vault Response Bulwark",
          faction: "robots",
          hostile: true,
          level: 10,
          pos: { x: O.x + p.x, y: O.y + p.y, z: O.z + p.z },
          yaw: p.yaw,
          ai: "guard",
          home: { x: O.x + p.x, z: O.z + p.z - (i ? 0 : 2), r: 9 },
          loot: i ? "patrolman" : "bulwark",
          noRespawn: true,
          barks: [
            "UNSCHEDULED WITHDRAWAL DETECTED.",
            "PLEASE REMAIN WHERE YOU ARE, VALUED CUSTOMER.",
            "YOUR ACCOUNT HAS BEEN FLAGGED.",
          ],
        }),
      );
    }
    K.notify(
      withCode
        ? "Override accepted. The time lock disengages — the clock is running."
        : "The time lock disengages. The vault door begins to swing open — the clock is running.",
    );
    if (K.q.active("pf3_bt_heist")) K.q.set("pf3_bt_heist", "loot");
  };
  function sealVault() {
    const ctx = H.ctx;
    H.target = 0;
    PV.setFlag("bt_state", "sealed");
    stopAlarm();
    const O = ctx.O;
    K.sfx("cryo_door", new THREE.Vector3(O.x, O.y + VY + 2, O.z - 61), {
      volume: 1,
    });
    const P = G.player;
    if (P && P.pos && inVault(P.pos)) {
      PV.setFlag("bt_trapped", true);
      H.halonT = 8;
      K.notify(
        "The door booms shut. The time lock re-engages for seventy-two hours. HALON PURGE IN 8 SECONDS.",
      );
      if (K.q.active("pf3_bt_heist")) K.q.set("pf3_bt_heist", "escape");
    } else {
      K.notify(
        "Behind you, the vault door booms shut. The time lock re-engages.",
      );
      if (K.q.active("pf3_bt_heist")) K.q.complete("pf3_bt_heist");
    }
  }
  PV.btUpdate = function (dt, realDt, ctx) {
    H.ctx = ctx;
    // door animation (also runs paused-safe on realDt)
    if (ctx.btDoor) {
      const cur = ctx.btDoor.rotation.y;
      if (Math.abs(cur - H.target) > 1e-3) {
        const sp = 0.55 * (realDt || 0.016);
        ctx.btDoor.rotation.y =
          H.target > cur
            ? Math.min(H.target, cur + sp)
            : Math.max(H.target, cur - sp * 1.6);
        if (H.target === 0 && ctx.btDoor.rotation.y < 0.4)
          setDoorClosed(ctx, true);
        else if (
          H.target > 0 &&
          ctx.btDoor.rotation.y > 1.2 &&
          !ctx.btDoorOpenCol
        )
          setDoorClosed(ctx, false);
      }
    }
    const st = PV.flag("bt_state");
    // a save loaded mid-heist seals the vault (btLoaded): settle the quest the way sealVault() would have
    if (
      st === "sealed" &&
      dt > 0 &&
      K.q.active("pf3_bt_heist") &&
      K.q.stage("pf3_bt_heist") === "loot" &&
      G.player &&
      G.player.pos
    ) {
      if (inVault(G.player.pos)) {
        K.q.set("pf3_bt_heist", "escape");
        K.notify("The vault door is sealed. Find the ventilation duct.");
      } else K.q.complete("pf3_bt_heist");
    }
    const show = st === "open" && G.state === "play";
    if (show || H.ui) {
      const d = ui();
      d.style.display = show ? "block" : "none";
    }
    if (st === "open" && dt > 0) {
      let t = (PV.flag("bt_t") || 0) - dt;
      PV.setFlag("bt_t", t);
      const s = Math.max(0, Math.ceil(t));
      if (s !== H.last && H.ui) {
        H.last = s;
        H.ui.querySelector(".pf3-heist-c").textContent =
          Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
        H.ui.classList.toggle("pf3-heist-warn", s <= 15);
      }
      if (s === 30 || s === 10) {
        if (!H["w" + s]) {
          H["w" + s] = true;
          K.notify(s + " SECONDS UNTIL THE TIME LOCK RE-ENGAGES.");
        }
      }
      if (t <= 0) sealVault();
    }
    // halon purge while sealed inside
    if (PV.flag("bt_trapped") && dt > 0) {
      const P = G.player;
      if (!P || !P.pos || !inVault(P.pos)) {
        PV.setFlag("bt_trapped", false);
        return;
      }
      H.halonT -= dt;
      if (H.halonT <= 0) {
        H.halonAcc = (H.halonAcc || 0) + dt;
        if (H.halonAcc >= 1) {
          H.halonAcc = 0;
          K.safe("halon", () =>
            P.damage(4, { type: "poison", source: "halon" }),
          );
          if (Math.random() < 0.3)
            K.notify("The halon burns your lungs. Find the ventilation duct!");
        }
      }
    }
  };
  PV.btReset = function (ctx) {
    H.ctx = ctx;
    stopAlarm();
    H.target = 0;
    H.w30 = H.w10 = false;
    H.last = -1;
    if (ctx.btDoor) ctx.btDoor.rotation.y = 0;
    setDoorClosed(ctx, true);
    if (H.ui) H.ui.style.display = "none";
  };
  PV.btLoaded = function (ctx) {
    H.ctx = ctx;
    stopAlarm();
    // a heist interrupted by a save/load: the time lock won the race
    if (PV.flag("bt_state") === "open") PV.setFlag("bt_state", "sealed");
    H.target = 0;
    if (ctx.btDoor) ctx.btDoor.rotation.y = 0;
    setDoorClosed(ctx, true);
  };

  // ------------------------------------------------------------------
  // Terminals
  // ------------------------------------------------------------------
  function termTimeLock() {
    return {
      title: "MOSLER TIME-LOCK CONSOLE",
      header:
        "BANKERS TRUST COMPANY — SAFE DEPOSIT DEPARTMENT\nMOSLER CHRONO-LOCK MODEL 61 — 72 HOUR MOVEMENT",
      lock: BT_LOCKS.console,
      entries: [
        {
          title: "Lock Status",
          text: () => {
            const st = PV.flag("bt_state");
            return st === "open"
              ? "MOVEMENT: DISENGAGED\nDOOR: OPEN\nRE-ENGAGE IN: " +
                  Math.max(0, Math.ceil(PV.flag("bt_t") || 0)) +
                  " s"
              : st
                ? "MOVEMENT: ENGAGED\nDOOR: SEALED\nNEXT OPENING: 72:00:00\n\n(the clock resets itself every time it reaches zero; it has done so 2,678 times)"
                : "MOVEMENT: ENGAGED\nDOOR: SEALED\nNEXT OPENING: 72:00:00\n\nEMERGENCY OVERRIDE AVAILABLE.";
          },
        },
        {
          title: "Emergency Override — Open Vault",
          text: "OVERRIDE ACCEPTED. MOVEMENT DISENGAGED FOR ONE (1) CYCLE.\nVAULT RESPONSE UNITS NOTIFIED.\nHAVE A PROSPEROUS DAY.",
          action: () => {
            if (!PV.flag("bt_state")) PV.btStartHeist(false);
            else K.notify("The movement is engaged. Nothing happens.");
          },
        },
        {
          title: "Maintenance Log",
          text: '03.01.67 — Vault response units recalibrated. Unit 2 still greets the vault as "valued customer."\n03.02.67 — Halon suppression tested. Please warn Mr. Ashcombe before the next test. Mr. Ashcombe has asked for his eyebrows back.\n03.05.67 — Ventilation grate in the vault latches from the inside only. Per code. Do not "fix" it.',
        },
      ],
    };
  }
  function termSecurity() {
    return {
      title: "SECURITY CONTROL",
      header:
        "KESTREL TELETYPE CORP. SECURITY SUITE — BANKERS TRUST, 14 WALL ST\nUNITS ONLINE: 6",
      lock: BT_LOCKS.security,
      entries: [
        {
          title: "Unit Roster",
          text: 'LOBBY: 1× Bulwark "Greeter", 2× Patrolman "Tellers" — STATUS: OPEN FOR BUSINESS\nVAULT RESPONSE: 1× Bulwark, 2× Patrolman — STATUS: STANDBY (activates on unscheduled vault opening)',
        },
        {
          title: "Disable Vault Response Units",
          text: "VAULT RESPONSE UNITS: OFFLINE.\nALARM ANNUNCIATOR: MUTED.",
          action: () => {
            if (!PV.flag("bt_robots_off")) {
              PV.setFlag("bt_robots_off", true);
              K.notify(
                "The vault response units power down. The alarm is muted.",
              );
              K.xp(40, "Disabled vault security");
            }
          },
        },
        {
          title: "Close Branch (Lobby Units Shutdown)",
          text: "BRANCH CLOSED. LOBBY UNITS RETURNING TO CHARGING ALCOVES.\n...\nCHARGING ALCOVES NOT FOUND. UNITS POWERING DOWN IN PLACE.",
          action: () => {
            if (PV.flag("bt_lobby_off")) return;
            PV.setFlag("bt_lobby_off", true);
            const O = H.ctx ? H.ctx.O : null;
            if (!O || G.isStub("actors")) return;
            K.safe("lobbyoff", () => {
              for (const a of G.actors.list())
                if (
                  a &&
                  !a.dead &&
                  a.faction === "robots" &&
                  Math.abs(a.pos.x - O.x) < 150 &&
                  Math.abs(a.pos.z - O.z) < 150 &&
                  !/^pf3_bt_resp/.test(a.id || "")
                )
                  a.kill();
            });
            K.notify("Across the banking hall, the robots slump and go dark.");
          },
        },
        {
          title: "Incident Report 03.05.67",
          text: "At 09:47 all human staff called in for the Sunday emergency session attempted to exit the branch. Per policy 12-C, units asked each customer to complete a satisfaction survey before exiting. Survey completion rate: 0%. Units are awaiting completed surveys.",
        },
      ],
    };
  }
  function termChairman() {
    return {
      title: "OFFICE OF THE CHAIRMAN",
      header: "BANKERS TRUST COMPANY — EXECUTIVE TELETYPE\nCONFIDENTIAL",
      lock: BT_LOCKS.chairman,
      entries: [
        {
          title: "Memo: The OCD Account (LW-9)",
          text: 'The Office of Civil Defense has deposited a classified construction budget (account LW-9, purpose not stated) with us, in gold, pending "disbursement." They have asked that the time lock be set to its maximum movement and that it NOT be opened "under any circumstances, including the end of the world."\n\nI assume that is a figure of speech. Fee structure attached.',
        },
        {
          title: "Memo: Time-Lock Override Code",
          text: "For the Chairman's eyes only. In the event the time lock must be overridden, the keypad beside the vault accepts the code below. The override also grants an extended cycle.\n\nCODE: 14-9255 (that is 14 W-A-L-L on the telephone dial)\n\n(Please do not use the address of the building as the code again. — Security)",
          learn: BT_LOCKS.override.id,
          action: () => {
            if (!PV.flag("bt_code")) {
              PV.setFlag("bt_code", true);
              K.notify("You note down the vault override code.");
              if (K.q.active("pf3_bt_heist"))
                K.xp(25, "Found the override code");
            }
          },
        },
        {
          title: "Personal: to Margaret",
          text: "The board voted to stay in session. I voted with them. I have voted with them for thirty years.\n\nThe view from up here is the finest in the city, Maggie. I can see all the way up the island. There is a light up north, past the Bronx, that is getting brighter.\n\nI should have stayed home this morning. It was Sunday. The wall safe is still set to our anniversary, 0-6-1-4. You always said I'd forget it. I never did.",
          learn: BT_LOCKS.wallsafe.id,
        },
      ],
    };
  }

  // ------------------------------------------------------------------
  // Data: items, quest
  // ------------------------------------------------------------------
  PV.btData = function () {
    K.defineItem({
      id: "pf3_bt_bonds",
      type: "misc",
      name: "Bankers Trust Bearer Bonds",
      weight: 0.5,
      value: 600,
      tags: ["valuable", "unique"],
      desc: "A sheaf of engraved bearer bonds, payable to whoever holds them, redeemable at any Bankers Trust branch. There is one Bankers Trust branch left. It is run by robots.",
    });
    K.defineItem({
      id: "pf3_bt_box_key",
      type: "key",
      name: "Safe Deposit Master Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: "A long nickel key with a brass tag: BANKERS TRUST · SAFE DEPOSIT · MASTER · CHAIRMAN ONLY. It opens every box in the vault.",
    });
    K.defineItem({
      id: "pf3_bt_pen",
      type: "misc",
      name: "Chairman's Gold Fountain Pen",
      weight: 0.1,
      value: 180,
      tags: ["valuable", "unique"],
      desc: 'Solid gold, engraved "Thirty Years of Prudent Stewardship." It signed the Long Winter account. It still writes.',
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pf3_bt_heist",
        name: "The Last Withdrawal",
        giver: "",
        location: "Bankers Trust Building",
        desc: "The Bankers Trust vault under 14 Wall Street has been time-locked since the bombs fell. A dead robber's plan says it can be opened — for a little while.",
        stages: [
          {
            id: "open",
            text: "Open the vault: log on to the time-lock console (a vault clerk kept the password on a duty card), or find the Chairman's override code in the Pyramid Room.",
            markers: [
              () => {
                const a = PV.anchor("bankers_trust", "console");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Time-Lock Console",
                      interior: "bankers_trust",
                    }
                  : null;
              },
            ],
          },
          {
            id: "loot",
            text: "Clean out the vault — and get out before the time lock re-engages.",
            markers: [
              () => {
                const a = PV.anchor("bankers_trust", "vault");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Vault",
                      interior: "bankers_trust",
                    }
                  : null;
              },
            ],
          },
          {
            id: "escape",
            text: "You are sealed in the vault. Escape through the ventilation duct before the halon gets you.",
            markers: [
              () => {
                const a = PV.anchor("bankers_trust", "vent");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Ventilation Duct",
                      interior: "bankers_trust",
                    }
                  : null;
              },
            ],
          },
        ],
        rewards: { xp: 250 },
      });
    }
  };
  PV.btSpawn = function (ctx) {
    H.ctx = ctx;
    // the doorman on the loggia: a Patrolman that still bows customers in (harmless unless provoked)
    {
      const B = PV.bt;
      PV.spawnActor(ctx, {
        id: "pf3_bt_doorman",
        type: "patrolman",
        name: "Doorman-Unit 2",
        faction: "robots",
        level: 6,
        hostile: false,
        pos: { x: B.XC + 4.3, y: B.LOG_Y, z: B.LOG_Z - 1.6 },
        yaw: PI,
        ai: "static",
        loot: "patrolman",
        noRespawn: true,
        barks: [
          "GOOD MORNING, VALUED CUSTOMER. BANKERS TRUST IS OPEN FOR BUSINESS.",
          "PLEASE WIPE YOUR FEET. YOUR FEET ARE RADIOACTIVE.",
          "THE LOBBY UNITS ARE ALSO OPEN FOR BUSINESS. THEIR BUSINESS IS SECURITY.",
        ],
      });
    }
    // the robot "greeter" at the door keeps its bank open (in addition to the location's security units)
    PV.spawnActor(ctx, {
      id: "pf3_bt_greeter",
      type: "patrolman",
      name: "Teller-Unit 7",
      faction: "robots",
      level: 8,
      hostile: true,
      pos: { x: ctx.O.x + 2.5, y: ctx.O.y, z: ctx.O.z - 8 },
      yaw: PI,
      ai: "guard",
      home: { x: ctx.O.x + 2.5, z: ctx.O.z - 8, r: 4 },
      loot: "patrolman",
      noRespawn: true,
      barks: [
        "WELCOME TO BANKERS TRUST. PLEASE TAKE A NUMBER.",
        "YOUR NUMBER IS: TERMINATED.",
        "BANKING HOURS ARE NINE TO THREE. IT IS ALWAYS NINE TO THREE.",
        "HAVE YOU CONSIDERED A CHRISTMAS CLUB ACCOUNT?",
      ],
    });
  };
})();
