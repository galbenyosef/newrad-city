/* src/poi_village/50_tombs.js */
/* =====================================================================
 * NEW RAD CITY — poi_village / 50_tombs.js
 * THE TOMBS (Manhattan Detention Complex, White Street) — raider stronghold.
 *
 * EXTERIOR (site x 50..110, z 541..574): the Art-Deco North Tower (limestone
 *   piers, setbacks, stepped crown, a tall bronze portal under carved
 *   MANHATTAN HOUSE OF DETENTION lettering and an eagle), the older Courts
 *   building to the east, and the enclosed BRIDGE OF SIGHS between them with
 *   raider gibbet cages hanging under it; scrap walls, spikes, fire barrels.
 * INTERIOR (cell tombs):
 *   intake (booking cage, mugshot wall & height chart, metal detector,
 *   holding cell) → the three-tier CELL BLOCK (60 cells, catwalks, stairs,
 *   bridges, raider camp on the flats, skylight) → cafeteria / control room /
 *   warden's office stacked at the north end → the Bridge of Sighs → out
 *   through the Courts building to White Street (loop). A cell whose back
 *   wall was dug through leads into SOLITARY ("the Hole").
 * QUEST "Jailbreak": three prisoners in Block C. Free them (control-room
 *   teletype with its passcode, or Maddox's key ring) — or sell them to the
 *   slavers (standing).
 * Also holds Odile's stolen portrait (Chelsea quest) in the warden's office.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pv;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // ---- locks (G.locks): every key and code is placed in this file ----
  const LK = {
    blockc: K.regLock({
      id: "pv_lk_tombs_blockc",
      label: "Block C Cell Doors",
      kind: "door",
      key: "pv_key_tombs_cells",
      hint: "Warden Maddox carries the Block C key ring; the control room upstairs can also open the block.",
      keyFrom: "Carried by Warden Maddox",
    }),
    control: K.regLock({
      id: "pv_lk_tombs_control",
      label: "Cell Control Teletype",
      kind: "terminal",
      passcode: "GALLOWS",
      hint: "The raiders' mess rota and Maddox's own teletype both give the control-room word.",
      learnedFrom: [
        "Raider Mess Rota (cafeteria)",
        "Warden Maddox's teletype (Log)",
      ],
    }),
    wsafe: K.regLock({
      id: "pv_lk_tombs_wsafe",
      label: "Warden's Safe",
      kind: "safe",
      code: "12767",
      hint: "Maddox brags about the combination on his teletype; Solitary Sam knows it too.",
      learnedFrom: ["Warden Maddox's teletype", "Solitary Sam (dialogue)"],
    }),
    courts: K.regLock({
      id: "pv_lk_tombs_courts",
      label: "Criminal Courts Side Door",
      kind: "door",
      key: "pv_key_tombs_padlock",
      hint: "Padlocked from inside: a Tombs gatekeeper carries the padlock key, or open it from the Bridge of Sighs side.",
      keyFrom: "Carried by a Tombs Gatekeeper (portal sentry)",
    }),
  };

  // exterior
  // loop round 1: both blocks run out to the site's building lines (west x 50, east x 110, south z 573, the Worth St sidewalk line) — flush
  // with the Centre St / Worth St sidewalks instead of leaving 2–3 m strips of bare lot around them
  const TW = { x0: 50, x1: 82, z0: 543.5, z1: 573 }; // north tower base
  const CB = { x0: 90, x1: 110, z0: 543.5, z1: 573 }; // courts building
  const PORTAL_X = 67;
  const SIDE_DOOR = { x: 99, z: 543.5 };
  // interior
  const TIER = [0, 3.4, 6.8];
  const TOPC = 10.4;
  const CELLS = 10,
    CZ0 = -42.6,
    CW = 2.84; // cells along z
  const PRISON_CELLS = [6, 7, 8]; // east tier-1 cells holding prisoners
  const DUG_CELL = 1; // east tier-1 cell dug through to solitary
  const cellDoors = []; // prisoner cell doors {group, col, open, t}

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function decoTier(b, x0, x1, z0, z1, y0, y1, r, o) {
    o = o || {};
    const stone = o.stone || [0.86, 0.8, 0.68];
    const faces = [
      { ox: x1, oz: z0, ux: -1, uz: 0, len: x1 - x0, n: [0, -1] }, // north (street)
      { ox: x0, oz: z1, ux: 1, uz: 0, len: x1 - x0, n: [0, 1] }, // south
      { ox: x0, oz: z0, ux: 0, uz: 1, len: z1 - z0, n: [-1, 0] }, // west
      { ox: x1, oz: z1, ux: 0, uz: -1, len: z1 - z0, n: [1, 0] }, // east
    ];
    for (const f of faces) {
      if (o.skip && o.skip.indexOf(f.n.join()) >= 0) continue;
      b.face(
        "limestone",
        f.ox,
        y0,
        f.oz,
        f.ux,
        0,
        f.uz,
        0,
        1,
        0,
        f.len,
        y1 - y0,
        { tint: stone },
      );
      // vertical piers & dark spandrels with barred slit windows
      const step = 2.6,
        n = Math.floor(f.len / step);
      const off = (f.len - n * step) / 2;
      for (let k = 0; k <= n; k++) {
        const t = off + k * step,
          px = f.ox + f.ux * t,
          pz = f.oz + f.uz * t;
        b.box(
          "limestone",
          px + f.n[0] * 0.14,
          y0,
          pz + f.n[1] * 0.14,
          Math.abs(f.uz) * 0.28 + Math.abs(f.ux) * 0.6,
          y1 - y0 - 0.3,
          Math.abs(f.ux) * 0.28 + Math.abs(f.uz) * 0.6,
          { tint: [stone[0] * 1.04, stone[1] * 1.04, stone[2] * 1.04] },
        );
        // Art-Deco finials: every other pier rises past the coping (reads as vertical fluting from the street)
        if (k % 2 === 0 && f.n[1] !== 0)
          b.box(
            "limestone",
            px + f.n[0] * 0.14,
            y1 + 0.2,
            pz + f.n[1] * 0.14,
            Math.abs(f.ux) * 0.5 + 0.2,
            1.3,
            Math.abs(f.uz) * 0.5 + 0.2,
            { tint: [stone[0] * 1.06, stone[1] * 1.06, stone[2] * 1.06] },
          );
        if (k === n) break;
        if (o.portal && Math.abs(px - PORTAL_X) < 4 && f.n[1] === -1) continue;
        const cx = f.ox + f.ux * (t + step / 2),
          cz = f.oz + f.uz * (t + step / 2);
        for (let y = y0 + (o.firstY || 3.2); y < y1 - 2.2; y += 3.4) {
          const st = r() < 0.2 ? "dark" : "glass";
          K.window(b, cx, y + 0.9, cz, f.n[0], f.n[1], 0.7, 1.9, {
            state: st,
            sill: false,
            surround: "limestone",
            surroundTint: stone,
            inset: 0.08,
            frame: "black_iron",
          });
          // bars
          for (const s of [-0.2, 0, 0.2])
            b.beam(
              "black_iron",
              cx + (f.uz !== 0 ? 0 : s) + f.n[0] * 0.05,
              y,
              cz + (f.ux !== 0 ? 0 : s) + f.n[1] * 0.05,
              cx + (f.uz !== 0 ? 0 : s) + f.n[0] * 0.05,
              y + 1.85,
              cz + (f.ux !== 0 ? 0 : s) + f.n[1] * 0.05,
              0.03,
              0.03,
            );
          b.plate(
            "brick_tan",
            cx,
            y + 2.35,
            cz,
            f.n[0],
            f.n[1],
            step - 0.7,
            0.9,
            null,
            { tint: [0.45, 0.4, 0.34], off: 0.03 },
          ); // spandrel
        }
      }
    }
    // coping
    b.boxMM(
      "limestone",
      x0 - 0.3,
      y1 - 0.3,
      z0 - 0.3,
      x1 + 0.3,
      y1 + 0.25,
      z1 + 0.3,
      { tint: [0.78, 0.72, 0.62] },
    );
    b.face(
      "concrete_dark",
      x0,
      y1 + 0.25,
      z1 + 0.3,
      1,
      0,
      0,
      0,
      0,
      -1,
      x1 - x0,
      z1 - z0 + 0.6,
      { uv: "top", tint: [0.5, 0.48, 0.45] },
    );
    b.col(x0, y0, z0, x1, y1 + 0.25, z1, { tag: "building" });
  }
  function exterior(ctx) {
    const b = K.builder({ name: "tombs_ext", grime: 0.35 });
    const r = K.rng("tombs_ext");
    // ---- north tower: base + setbacks + crown ----
    decoTier(b, TW.x0, TW.x1, TW.z0, TW.z1, 0, 24, r, {
      portal: true,
      firstY: 10,
    });
    decoTier(b, 55, 79, 546.5, 568, 24.25, 34, r, { firstY: 0.6 });
    decoTier(b, 60, 74, 550.5, 564, 34.25, 42, r, { firstY: 0.6 });
    for (let k = 0; k < 4; k++) {
      const i = k * 0.9;
      b.boxMM(
        "limestone",
        62 + i,
        42.25 + k * 0.9,
        552.5 + i,
        72 - i,
        43.15 + k * 0.9,
        562 - i,
        { tint: [0.82, 0.76, 0.64] },
      );
    }
    b.cyl("metal_dark", 67, 45.8, 557.25, 0.15, 0.05, 4, 6); // mast
    b.glow(67, 49.8, 557.25, [1, 0.2, 0.15], 1.2);
    // raider floodlights on the setbacks + a few fire-lit windows (life inside)
    for (const [fx, fy, fz] of [
      [56, 24.6, 546.2],
      [78, 24.6, 546.2],
      [61, 34.6, 550.2],
      [73, 34.6, 550.2],
    ]) {
      b.cyl("black_iron", fx, fy, fz, 0.25, 0.3, 0.4, 8);
      b.glow(fx, fy + 0.5, fz - 0.4, [1, 0.9, 0.7], 2.2);
    }
    for (const [wx, wy] of [
      [58.6, 17.7],
      [73.4, 14.3],
      [63.8, 21.1],
      [76, 10.9],
    ])
      b.glow(wx, wy, TW.z0 - 0.3, [1, 0.5, 0.2], 1.6);
    // ground storey: dark granite base with a heavy portal
    b.boxMM("granite", TW.x0 - 0.2, 0, TW.z0 - 0.4, TW.x1 + 0.2, 1.2, TW.z0, {
      tint: [0.4, 0.38, 0.36],
    });
    for (let x = TW.x0 + 3; x < TW.x1 - 2; x += 5) {
      if (Math.abs(x - PORTAL_X) < 5) continue;
      K.window(b, x, 5.2, TW.z0, 0, -1, 1.6, 3.4, {
        state: "boarded",
        sill: true,
        surround: "limestone",
        surroundTint: [0.8, 0.74, 0.62],
      });
    }
    // the portal
    {
      const px = PORTAL_X,
        z = TW.z0;
      b.boxMM("limestone", px - 3.6, 0, z - 1.2, px - 2.4, 10.5, z, {
        tint: [0.9, 0.84, 0.72],
      });
      b.boxMM("limestone", px + 2.4, 0, z - 1.2, px + 3.6, 10.5, z, {
        tint: [0.9, 0.84, 0.72],
      });
      for (let k = 0; k < 4; k++)
        b.boxMM(
          "limestone",
          px - 2.4 + k * 0.15,
          9.2 - k * 0.2,
          z - 1.0 + k * 0.2,
          px + 2.4 - k * 0.15,
          10.5,
          z - 0.8 + k * 0.2,
          { tint: [0.84, 0.78, 0.66] },
        );
      b.boxMM(
        "bronze" in K.ALIAS ? "bronze" : "brass",
        px - 2.2,
        0,
        z - 0.25,
        px + 2.2,
        6.2,
        z - 0.05,
        { tint: [0.45, 0.35, 0.22] },
      );
      for (let k = 0; k < 6; k++)
        b.boxMM(
          "brass",
          px - 2.1 + k * 0.84,
          0.3,
          z - 0.3,
          px - 1.4 + k * 0.84,
          5.9,
          z - 0.26,
          { tint: [0.4, 0.3, 0.18] },
        ); // door panels
      b.plate("glass_dark", px, 7.7, z - 0.1, 0, -1, 4.2, 2.6, null, {
        tint: [0.2, 0.22, 0.22],
      });
      for (let x = -1.8; x <= 1.8; x += 0.45)
        b.beam(
          "brass",
          px + x,
          6.4,
          z - 0.14,
          px + x,
          9.0,
          z - 0.14,
          0.05,
          0.05,
          { tint: [0.4, 0.3, 0.18] },
        );
      // carved lettering + eagle
      const letters = K.signCell(
        "tombs_letters",
        "MANHATTAN HOUSE OF DETENTION",
        1024,
        96,
        { bg: "#d8ccb0", fg: "#4a4030", font: "Georgia, serif", weather: true },
      );
      b.plate("art", px, 11.3, z - 0.05, 0, -1, 13, 1.1, letters);
      const eagle = K.paint(
        "art",
        "tombs_eagle",
        256,
        160,
        function (x, X, Y, W, H) {
          x.fillStyle = "#d0c4a8";
          x.fillRect(X, Y, W, H);
          x.fillStyle = "#8a7c62";
          x.beginPath();
          x.moveTo(X + W / 2, Y + 30);
          for (let k = 0; k <= 8; k++) {
            x.lineTo(X + W / 2 - 20 - k * 12, Y + 40 + k * 6);
            x.lineTo(X + W / 2 - 24 - k * 12, Y + 58 + k * 6);
          }
          x.lineTo(X + W / 2, Y + 110);
          x.fill();
          x.beginPath();
          x.moveTo(X + W / 2, Y + 30);
          for (let k = 0; k <= 8; k++) {
            x.lineTo(X + W / 2 + 20 + k * 12, Y + 40 + k * 6);
            x.lineTo(X + W / 2 + 24 + k * 12, Y + 58 + k * 6);
          }
          x.lineTo(X + W / 2, Y + 110);
          x.fill();
          x.beginPath();
          x.ellipse(X + W / 2, Y + 70, 16, 44, 0, 0, 6.3);
          x.fill();
          x.beginPath();
          x.arc(X + W / 2, Y + 26, 12, 0, 6.3);
          x.fill();
          x.fillStyle = "#6a5c42";
          for (let k = 0; k < 5; k++)
            x.fillRect(X + W / 2 - 22 + k * 10, Y + 118, 4, 26);
          K.stains(x, X, Y, W, H, 8, 3, 0.35);
          K.streaks(x, X, Y, W, H, 12, 4, 0.3);
        },
      );
      b.plate("art", px, 13.4, z - 0.05, 0, -1, 4.2, 2.6, eagle);
      // raider additions
      b.plate(
        "decal",
        px,
        3.2,
        z - 0.3,
        0,
        -1,
        4.0,
        1.4,
        K.tag("THE TOMBS", "#e02020", 384, 110, { rot: -0.03 }),
      );
      b.plate(
        "decal",
        px - 8,
        2.5,
        z - 0.05,
        0,
        -1,
        5.0,
        1.4,
        K.tag("ABANDON HOPE", "#e8e8e8", 384, 110, { rot: 0.04 }),
      );
      b.plate(
        "decal",
        px + 9,
        2.2,
        z - 0.05,
        0,
        -1,
        4.6,
        1.3,
        K.tag("MADDOX RULES", "#f0c020", 384, 110, { rot: -0.05 }),
      );
      for (const s of [-1, 1]) {
        b.glow(px + s * 3.0, 7.5, z - 1.6, [1, 0.6, 0.3], 1.4);
        b.cyl("black_iron", px + s * 3.0, 7.2, z - 1.4, 0.2, 0.28, 0.5, 8);
      }
    }
    // ---- the Courts building ----
    {
      const stone = [0.72, 0.7, 0.66];
      b.face("granite", CB.x1, 0, CB.z0, -1, 0, 0, 0, 1, 0, CB.x1 - CB.x0, 24, {
        tint: stone,
      });
      b.face("granite", CB.x1, 0, CB.z1, 0, 0, -1, 0, 1, 0, CB.z1 - CB.z0, 24, {
        tint: stone,
      });
      b.face("granite", CB.x0, 0, CB.z0, 0, 0, 1, 0, 1, 0, CB.z1 - CB.z0, 24, {
        tint: stone,
      });
      b.face("granite", CB.x0, 0, CB.z1, 1, 0, 0, 0, 1, 0, CB.x1 - CB.x0, 24, {
        tint: stone,
      }); // south (Worth St) — was missing
      // Centre Street (east) and Worth Street (south) elevations: same granite windows, a barred ground floor
      for (let y = 3; y < 22; y += 3.6) {
        for (let z = CB.z0 + 3; z < CB.z1 - 1; z += 3.2)
          K.window(b, CB.x1, y + 1.1, z, 1, 0, 1.2, 2.0, {
            state: r() < 0.35 ? "boarded" : r() < 0.5 ? "broken" : "glass",
            lintel: 0.2,
            trimTint: [0.8, 0.76, 0.7],
            surround: "granite",
            surroundTint: stone,
          });
        for (let x = CB.x0 + 2; x < CB.x1 - 1; x += 3)
          K.window(b, x, y + 1.1, CB.z1, 0, 1, 1.2, 2.0, {
            state: r() < 0.4 ? "boarded" : "glass",
            lintel: 0.2,
            trimTint: [0.8, 0.76, 0.7],
            surround: "granite",
            surroundTint: stone,
          });
      }
      for (let z = CB.z0 + 3; z < CB.z1 - 1; z += 3.2)
        for (const s of [-0.3, 0, 0.3])
          b.beam(
            "black_iron",
            CB.x1 + 0.12,
            3.2,
            z + s,
            CB.x1 + 0.12,
            5.1,
            z + s,
            0.035,
            0.035,
          );
      b.boxMM("granite", CB.x1, 22.8, CB.z0, CB.x1 + 0.6, 24.3, CB.z1 + 0.6, {
        tint: [0.6, 0.58, 0.54],
      });
      b.boxMM("granite", CB.x0, 22.8, CB.z1, CB.x1, 24.3, CB.z1 + 0.6, {
        tint: [0.6, 0.58, 0.54],
      });
      b.plate(
        "decal",
        CB.x1 + 0.05,
        2.0,
        (CB.z0 + CB.z1) / 2,
        1,
        0,
        6,
        1.6,
        K.tag("JUSTICE IS DEAD", "#e0e0d0", 384, 110, { rot: 0.03 }),
      );
      b.face(
        "concrete_dark",
        CB.x0,
        24,
        CB.z1,
        1,
        0,
        0,
        0,
        0,
        -1,
        CB.x1 - CB.x0,
        CB.z1 - CB.z0,
        { uv: "top", tint: [0.5, 0.48, 0.45] },
      );
      b.col(CB.x0, 0, CB.z0, CB.x1, 24, CB.z1, { tag: "building" });
      for (let y = 3; y < 22; y += 3.6)
        for (let x = CB.x0 + 2; x < CB.x1 - 1; x += 3) {
          if (y < 4 && Math.abs(x - SIDE_DOOR.x) < 2) continue;
          K.window(b, x, y + 1.1, CB.z0, 0, -1, 1.2, 2.0, {
            state: r() < 0.3 ? "boarded" : r() < 0.5 ? "broken" : "glass",
            lintel: 0.2,
            trimTint: [0.8, 0.76, 0.7],
            surround: "granite",
            surroundTint: stone,
          });
        }
      for (let y = 3; y < 22; y += 3.6)
        for (let z = CB.z0 + 3; z < CB.z1 - 1; z += 3.2)
          K.window(b, CB.x0, y + 1.1, z, -1, 0, 1.2, 2.0, {
            state: r() < 0.4 ? "boarded" : "glass",
            lintel: 0.2,
            surround: "granite",
            surroundTint: stone,
          });
      b.boxMM(
        "granite",
        CB.x0 - 0.4,
        22.8,
        CB.z0 - 0.6,
        CB.x1 + 0.4,
        24.3,
        CB.z1,
        { tint: [0.6, 0.58, 0.54] },
      );
      for (let x = CB.x0 + 1; x < CB.x1; x += 2.2)
        b.cyl("granite", x, 1.0, CB.z0 - 0.5, 0.3, 0.3, 5.4, 10, {
          tint: [0.75, 0.73, 0.68],
        });
      // side door
      b.boxMM(
        "paint_black",
        SIDE_DOOR.x - 0.8,
        0,
        CB.z0 - 0.08,
        SIDE_DOOR.x + 0.8,
        2.6,
        CB.z0,
        { tint: [0.15, 0.12, 0.1] },
      );
      b.plate(
        "art",
        SIDE_DOOR.x,
        3.0,
        CB.z0 - 0.1,
        0,
        -1,
        2.6,
        0.4,
        K.signCell("tombs_courts", "CRIMINAL COURTS", 384, 64, {
          bg: "#2a2a2a",
          fg: "#d8d0b8",
          font: "Georgia, serif",
        }),
      );
    }
    // ---- the Bridge of Sighs (enclosed skybridge x 82..90) ----
    {
      const bz0 = 553,
        bz1 = 559,
        by0 = 14,
        by1 = 18.5;
      b.boxMM("limestone", TW.x1, by0 - 0.8, bz0, CB.x0, by0, bz1, {
        tint: [0.8, 0.74, 0.62],
        faces: "nsewtb",
      });
      for (const [z, n] of [
        [bz0, -1],
        [bz1, 1],
      ]) {
        b.face(
          "limestone",
          n < 0 ? CB.x0 : TW.x1,
          by0,
          z,
          n < 0 ? -1 : 1,
          0,
          0,
          0,
          1,
          0,
          CB.x0 - TW.x1,
          by1 - by0,
          { tint: [0.84, 0.78, 0.66] },
        );
        for (let k = 0; k < 3; k++) {
          const wx = TW.x1 + 1.35 + k * 2.65;
          b.plate(
            "glass_dark",
            wx,
            by0 + 2.1,
            z + n * 0.02,
            0,
            n,
            1.5,
            2.6,
            null,
            { tint: [0.25, 0.3, 0.3] },
          );
          b.cyl("limestone", wx, by0 + 3.4, z + n * 0.12, 0.8, 0.8, 0.2, 10, {
            arc0: 0,
            arc: PI,
          });
          for (const s of [-0.4, 0, 0.4])
            b.beam(
              "black_iron",
              wx + s,
              by0 + 0.8,
              z + n * 0.06,
              wx + s,
              by0 + 3.4,
              z + n * 0.06,
              0.03,
              0.03,
            );
        }
      }
      b.boxMM("limestone", TW.x1, by1, bz0 - 0.3, CB.x0, by1 + 0.6, bz1 + 0.3, {
        tint: [0.78, 0.72, 0.6],
      });
      for (let x = TW.x1 + 0.5; x < CB.x0; x += 1.1)
        b.boxMM(
          "limestone",
          x - 0.25,
          by1 + 0.6,
          bz0 - 0.3,
          x + 0.25,
          by1 + 1.1,
          bz1 + 0.3,
          { tint: [0.78, 0.72, 0.6] },
        );
      b.col(TW.x1, by0 - 0.8, bz0, CB.x0, by1 + 0.6, bz1, { tag: "bridge" });
      // gibbet cages hanging beneath
      for (const [cx, cz] of [
        [84.5, 556],
        [87.5, 556.5],
      ]) {
        b.pipe("black_iron", cx, by0 - 0.8, cz, cx, by0 - 4.5, cz, 0.02, 4);
        for (let k = 0; k < 8; k++) {
          const a = (k * PI) / 4;
          b.pipe(
            "black_iron",
            cx + Math.cos(a) * 0.5,
            by0 - 4.5,
            cz + Math.sin(a) * 0.5,
            cx + Math.cos(a) * 0.45,
            by0 - 6.6,
            cz + Math.sin(a) * 0.45,
            0.015,
            3,
          );
        }
        b.cyl("black_iron", cx, by0 - 6.7, cz, 0.5, 0.5, 0.1, 8);
        b.geo("bone", K.sphereGeo(), { x: cx, y: by0 - 5.0, z: cz, s: 0.14 });
        b.pipe("bone", cx, by0 - 5.2, cz, cx + 0.05, by0 - 6.1, cz, 0.08, 5);
      }
    }
    // ---- raider wall & gate along the street ----
    const wallZ = 541.8;
    for (let x = 51; x < 109; x += 2.3) {
      if (x > PORTAL_X - 4 && x < PORTAL_X + 3) continue;
      if (x + 2.3 > SIDE_DOOR.x - 1.3 && x < SIDE_DOOR.x + 1.3) continue; // keep the Courts side door clear (the old test left a panel across it)
      const h = 2.4 + r() * 1.4;
      b.quadGrid(
        r() < 0.5 ? "corrugated" : "rust",
        [x, 0, wallZ],
        [x + 2.3, 0, wallZ],
        [x + 2.3, h, wallZ],
        [x, h, wallZ],
        {
          tint: r.pick([
            [0.7, 0.6, 0.5],
            [0.6, 0.45, 0.35],
            [0.5, 0.5, 0.45],
          ]),
          seg: 3,
        },
      );
      b.quadGrid(
        "rust",
        [x + 2.3, 0, wallZ],
        [x, 0, wallZ],
        [x, h, wallZ],
        [x + 2.3, h, wallZ],
        { tint: [0.4, 0.35, 0.3], seg: 3 },
      );
      b.beam(
        "wood_rotten",
        x,
        0,
        wallZ - 0.1,
        x,
        h + 0.5,
        wallZ - 0.1,
        0.14,
        0.14,
      );
      if (r() < 0.5)
        b.pipe("rust", x + 1, h, wallZ, x + 1.2, h + 1.2, wallZ - 0.4, 0.04, 4); // spikes
      b.col(x, 0, wallZ - 0.15, x + 2.3, h, wallZ + 0.15, {
        tag: "fence",
        walkable: false,
      });
    }
    for (const s of [-1, 1]) {
      const gx = PORTAL_X + (s < 0 ? -4 : 3);
      b.beam("wood", gx, 0, wallZ, gx, 5.2, wallZ, 0.35, 0.35);
      b.pipe("rust", gx, 5.2, wallZ, gx, 6.4, wallZ, 0.05, 4);
      b.geo("bone", K.sphereGeo(), { x: gx, y: 6.5, z: wallZ, s: 0.16 }); // skull on a spike
      b.col(gx - 0.2, 0, wallZ - 0.2, gx + 0.2, 5.2, wallZ + 0.2, {
        walkable: false,
      });
    }
    b.beam(
      "wood",
      PORTAL_X - 4,
      4.8,
      wallZ,
      PORTAL_X + 3,
      4.8,
      wallZ,
      0.3,
      0.4,
    );
    b.plate(
      "art",
      PORTAL_X - 0.5,
      4.3,
      wallZ - 0.22,
      0,
      -1,
      5.0,
      0.8,
      K.signCell("tombs_gate", "THE TOMBS — KEEP OUT OR GET IN", 512, 80, {
        bg: "#3a2a1a",
        fg: "#e8d0a0",
        font: "Impact, Arial Black, sans-serif",
      }),
    );
    b.burn(PORTAL_X + 6, 4, TW.z0, 6, 0.6);
    b.burn(CB.x0 + 4, 18, CB.z0, 5, 0.5);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_tombs_ext";
    K.anchor(ctx, "door", PORTAL_X, 0, TW.z0 - 1.5, false);
    K.anchor(ctx, "gate", PORTAL_X - 0.5, 0, wallZ - 2, false);
    K.anchor(ctx, "sentry1", PORTAL_X - 6, 0, wallZ - 1.4, false);
    K.anchor(ctx, "sentry2", PORTAL_X + 5.5, 0, TW.z0 - 1.2, false);
    K.loot(ctx, "barrel", PORTAL_X - 5, 0, wallZ - 1.2, 0, {
      world: true,
      burning: true,
      container: false,
    });
    K.loot(ctx, "barrel", PORTAL_X + 4.5, 0, wallZ + 1.0, 0, {
      world: true,
      burning: true,
      container: false,
    });
    K.loot(ctx, "sandbags", PORTAL_X - 2, 0, TW.z0 - 1.6, 0, {
      world: true,
      container: false,
      count: 2,
    });
    K.loot(ctx, "car", 60, 0, 537, 1.4, { world: true, burnt: true });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
  function cell(b, ctx, side, tier, i, r, o) {
    // side −1 = west (x −10..−6.4), +1 = east (x 6.4..10)
    const y = TIER[tier],
      z0 = CZ0 + i * CW,
      z1 = z0 + CW,
      zc = (z0 + z1) / 2;
    const xo = side * 10,
      xf = side * 6.4; // outer wall / front
    const xin = (a) => (side < 0 ? a : -a); // mirror helper for x offsets from the outer wall
    const h = (tier < 2 ? TIER[tier + 1] - 0.25 : TOPC - 0.3) - y;
    // partition at z0 (and the last at z1)
    const part = (z) => {
      b.boxMM(
        "celltile",
        Math.min(xo, xf),
        y,
        z - 0.08,
        Math.max(xo, xf),
        y + h,
        z + 0.08,
        { tint: [0.78, 0.8, 0.72] },
      );
      b.col(Math.min(xo, xf), y, z - 0.08, Math.max(xo, xf), y + h, z + 0.08, {
        tag: "wall",
      });
    };
    part(z0);
    if (i === CELLS - 1) part(z1);
    // bunk, toilet, sink
    const bx = -10 + 1.6;
    b.boxMM(
      "metal",
      Math.min(xin(bx - 0.95) * 1, xin(bx + 0.95)),
      y + 0.45,
      z0 + 0.1,
      Math.max(xin(bx - 0.95), xin(bx + 0.95)),
      y + 0.52,
      z0 + 0.85,
      { tint: [0.5, 0.52, 0.5] },
    );
    if (r() < 0.7)
      b.boxMM(
        "fabric",
        Math.min(xin(bx - 0.9), xin(bx + 0.9)),
        y + 0.52,
        z0 + 0.12,
        Math.max(xin(bx - 0.9), xin(bx + 0.9)),
        y + 0.62,
        z0 + 0.82,
        {
          tint: r.pick([
            [0.55, 0.5, 0.42],
            [0.4, 0.38, 0.34],
            [0.5, 0.35, 0.3],
          ]),
        },
      );
    b.cyl("steel", xin(-9.55), y, z1 - 0.5, 0.2, 0.18, 0.42, 8, {
      tint: [0.7, 0.72, 0.72],
    });
    b.boxMM(
      "steel",
      Math.min(xin(-9.95), xin(-9.6)),
      y + 0.75,
      z1 - 1.3,
      Math.max(xin(-9.95), xin(-9.6)),
      y + 1.0,
      z1 - 0.85,
      { tint: [0.7, 0.72, 0.72] },
    );
    // tally marks / graffiti on the back wall
    if (r() < 0.5)
      b.plate(
        "decal",
        xo - side * 0.11,
        y + 1.6,
        zc,
        -side,
        0,
        1.2,
        0.5,
        K.tag(
          r.pick([
            "IIII IIII IIII",
            "INNOCENT",
            "1967",
            "IIII IIII",
            "NO EXIT",
            "MA I'M SORRY",
          ]),
          "#d8d0c0",
          256,
          96,
          { size: 0.5, rot: (r() - 0.5) * 0.2 },
        ),
        { off: 0.01 },
      );
    if (r() < 0.25)
      b.hplate(
        "decal",
        (xo + xf) / 2,
        y + 0.012,
        zc,
        1.5,
        1.5,
        r() * 6,
        K.decal("blood", (i + tier * 10) % 8),
      );
    // header above the bars
    b.boxMM(
      "celltile",
      Math.min(xf, xf + side * 0.1),
      y + 2.55,
      z0,
      Math.max(xf, xf + side * 0.1),
      y + h,
      z1,
      { tint: [0.6, 0.62, 0.56] },
    );
    // bars: fixed half (z0 side) always; door half (z1 side) open/closed/separate
    const bars = (bb, za, zb, open) => {
      for (let z = za + 0.12; z < zb - 0.05; z += 0.16)
        bb.pipe("black_iron", xf, y, z, xf, y + 2.55, z, 0.022, 5);
      for (const yy of [0.12, 1.25, 2.5])
        bb.beam("black_iron", xf, y + yy, za, xf, y + yy, zb, 0.06, 0.05);
      void open;
    };
    const zm = z1 - 1.25;
    bars(b, z0, zm);
    b.col(
      Math.min(xf, xf + side * 0.08) - 0.03,
      y,
      z0,
      Math.max(xf, xf + side * 0.08) + 0.03,
      y + 2.55,
      zm,
      { tag: "interactable_self", walkable: false },
    );
    const st = o.door || (r() < 0.45 ? "open" : "closed");
    if (st === "closed") {
      bars(b, zm, z1);
      b.col(
        Math.min(xf, xf + side * 0.08) - 0.03,
        y,
        zm,
        Math.max(xf, xf + side * 0.08) + 0.03,
        y + 2.55,
        z1,
        { tag: "interactable_self", walkable: false },
      );
    } else if (st === "open") {
      const xs = xf + side * 0.12;
      for (let z = z0 + 0.2; z < z0 + 1.2; z += 0.16)
        b.pipe("black_iron", xs, y, z, xs, y + 2.55, z, 0.022, 5);
    } // slid behind the fixed half
    return { y, z0, z1, zm, xf, zc };
  }
  function doorLeaf(ctx, side, y, zm, z1, xf) {
    // a separate, movable cell door (for the prisoners)
    const db = K.builder({
      name: "tombs_door",
      off: ctx.O,
      lit: true,
      amb: [0.28, 0.26, 0.24],
    });
    for (let z = 0.12; z < z1 - zm - 0.05; z += 0.16)
      db.pipe("black_iron", 0, 0, z, 0, 2.55, z, 0.022, 5);
    for (const yy of [0.12, 1.25, 2.5])
      db.beam("black_iron", 0, yy, 0, 0, yy, z1 - zm, 0.06, 0.05);
    db.box("black_iron", 0, 1.05, 0.4, 0.1, 0.25, 0.15, {}); // lock box
    const g = db.finish(null);
    g.position.set(xf, y, zm);
    g.children.forEach((m) => {
      m.matrixAutoUpdate = true;
    });
    const O = ctx.O;
    const col = G.world.addBox(
      O.x + Math.min(xf, xf + side * 0.08) - 0.03,
      O.y + y,
      O.z + zm,
      O.x + Math.max(xf, xf + side * 0.08) + 0.03,
      O.y + y + 2.55,
      O.z + z1,
      { tag: "interactable_self", walkable: false },
    );
    return { group: g, col, open: false, t: 0, z0: zm, O, side, y, xf, z1 };
  }

  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "tombs_int",
      off: O,
      lit: true,
      amb: [0.05, 0.05, 0.05],
      floors: TIER.concat([TOPC]),
      grime: 0.6,
    });
    const r = K.rng("tombs_int");
    const tile = [0.72, 0.76, 0.68];

    // ---------------- intake (x −8..8, z −12..0) ----------------
    const IB = [-8.1, -0.2, -12.1, 8.1, 3.8, 0.1];
    K.gap(ctx, 0, 0, 2.4, 0, 3.0);
    K.gap(ctx, 0, -12, 3.0, 0, 3.0);
    K.room(b, ctx, {
      x0: -8,
      z0: -12,
      x1: 8,
      z1: 0,
      y: 0,
      h: 3.6,
      floor: "terrazzo",
      fc: [0.62, 0.6, 0.56],
      wall: "celltile",
      wc: tile,
      wain: "paint_green",
      wainC: [0.3, 0.4, 0.32],
      wainH: 1.2,
      ceil: "plaster",
      cc: [0.5, 0.5, 0.48],
      trimMat: "metal_dark",
    });
    // booking desk with the cage window
    b.boxMM("wood_dark", -7, 0, -8.4, -2.2, 1.1, -7.6, {
      tint: [0.4, 0.3, 0.22],
    });
    b.col(-7, 0, -8.4, -2.2, 1.1, -7.6, { tag: "counter" });
    for (let x = -6.9; x < -2.2; x += 0.14)
      b.pipe("black_iron", x, 1.1, -8.0, x, 3.6, -8.0, 0.012, 4);
    b.plate(
      "art",
      -4.6,
      3.0,
      -7.95,
      0,
      1,
      2.2,
      0.35,
      K.signCell("tombs_booking", "BOOKING — ALL INMATES", 384, 64, {
        bg: "#1a1a1a",
        fg: "#e8e0c0",
        font: "Arial, sans-serif",
      }),
    );
    K.terminal(
      ctx,
      "pv_term_tombs_booking",
      -3.2,
      1.1,
      -8.0,
      PI,
      termBooking(),
      "bare",
    );
    // mugshot wall with a height chart (east wall)
    const chart = K.paint(
      "art",
      "tombs_chart",
      256,
      256,
      function (x, X, Y, W, H) {
        x.fillStyle = "#c8c0a8";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#2a2520";
        x.fillStyle = "#2a2520";
        x.font = "bold 18px Arial";
        for (let k = 0; k < 8; k++) {
          const yy = Y + H - (k * H) / 8;
          x.lineWidth = k % 2 ? 1 : 3;
          x.beginPath();
          x.moveTo(X, yy);
          x.lineTo(X + W, yy);
          x.stroke();
          if (k % 2 === 0) x.fillText(4 + k / 2 + "'", X + 6, yy - 4);
        }
        K.stains(x, X, Y, W, H, 8, 3, 0.4);
      },
    );
    b.plate("art", 7.88, 1.3, -4, -1, 0, 2.6, 2.6, chart);
    for (let k = 0; k < 10; k++)
      K.framed(
        b,
        7.88,
        2.9 + (k % 2) * 0.55,
        -9.8 + k * 0.62,
        -1,
        0,
        0.42,
        0.5,
        K.photo("mug", k),
        { frame: false },
      );
    // metal detector arch
    b.boxMM("metal", -1.4, 0, -4.2, -1.1, 2.3, -3.8, {
      tint: [0.6, 0.62, 0.6],
    });
    b.boxMM("metal", 1.1, 0, -4.2, 1.4, 2.3, -3.8, { tint: [0.6, 0.62, 0.6] });
    b.boxMM("metal", -1.4, 2.3, -4.2, 1.4, 2.6, -3.8, {
      tint: [0.6, 0.62, 0.6],
    });
    b.col(-1.4, 0, -4.2, -1.1, 2.3, -3.8, {});
    b.col(1.1, 0, -4.2, 1.4, 2.3, -3.8, {});
    b.glow(0, 2.45, -3.75, [1, 0.2, 0.15], 0.3);
    // holding cell (west)
    for (let z = -6; z <= -1.6; z += 0.16)
      b.pipe("black_iron", -5, 0, z, -5, 3.0, z, 0.02, 4);
    b.col(-5.05, 0, -6, -4.95, 3.0, -1.6, {
      tag: "interactable_self",
      walkable: false,
    });
    b.boxMM("celltile", -8, 0, -6.1, -5, 3.6, -5.9, { tint: tile });
    b.col(-8, 0, -6.1, -5, 3.6, -5.9, {});
    b.boxMM("metal", -7.8, 0.45, -5.8, -5.4, 0.52, -5.2, {
      tint: [0.5, 0.52, 0.5],
    });
    K.skel(ctx, -6.5, 0, -3.2, 1.2, "sitting");
    // property lockers, raider bedding, fire
    K.loot(ctx, "locker", 7.6, 0, -11.5, -HP, {
      loot: "locker",
      count: 3,
      name: "Inmate Property",
    });
    K.loot(ctx, "locker", 3.2, 0, -11.6, 0, {
      loot: "locker",
      name: "Inmate Property",
    });
    K.loot(ctx, "mattress", 3.5, 0, -7.5, 0.4, { container: false });
    K.loot(ctx, "barrel", 4.5, 0, -3, 0, { burning: true, container: false });
    b.light(4.5, 1.4, -3, [1, 0.55, 0.25], 1.6, 7, { box: IB });
    b.glow(4.5, 1.2, -3, [1, 0.5, 0.2], 1.4);
    K.lamp(b, -3, 3.3, -6, "tube", [0.9, 1, 0.9], 0.6, 7, {
      ceil: 3.6,
      len: 1.4,
      lightOpts: { box: IB },
    });
    K.lamp(b, 3, 3.3, -9, "tube", [0.9, 1, 0.9], 0, 0, {
      ceil: 3.6,
      len: 1.4,
      dead: true,
    });
    b.plate(
      "decal",
      0,
      2.2,
      -11.9,
      0,
      1,
      3.2,
      1.0,
      K.tag("FRESH MEAT →", "#e03020", 256, 96),
      {},
    );
    b.plate(
      "decal",
      -7.88,
      2.0,
      -9,
      1,
      0,
      3.0,
      1.1,
      K.tag("WARDEN MADDOX", "#e0c020", 256, 96),
      {},
    );
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -7 + r() * 14,
        0.012 + k * 0.001,
        -11 + r() * 10,
        1.4,
        1.4,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", k + 70),
      );
    K.litter(b, -7.5, -11.5, 7.5, -0.5, 0, 18, 81);

    // ---------------- the CELL BLOCK (x −10..10, z −44..−12, 0..10.4) ----------------
    const BB = [-10.1, -0.2, -44.1, 10.1, TOPC + 0.2, -11.9];
    K.gap(ctx, 0, -44, 1.6, TIER[0], 2.4);
    K.gap(ctx, 0, -44, 1.6, TIER[1], 2.4);
    K.gap(ctx, 0, -44, 1.6, TIER[2], 2.4);
    const dugZ = CZ0 + DUG_CELL * CW + CW / 2;
    K.gap(ctx, 10, dugZ, 1.1, 0, 2.0, { casing: false });
    K.room(b, ctx, {
      x0: -10,
      z0: -44,
      x1: 10,
      z1: -12,
      y: 0,
      h: TOPC,
      floor: "concrete",
      fc: [0.55, 0.54, 0.5],
      wall: "celltile",
      wc: tile,
      ceil: "metal_dark",
      cc: [0.35, 0.36, 0.34],
      trim: false,
      noCeil: true,
    });
    // ceiling with a skylight strip
    b.face("metal_dark", -10, TOPC, -44, 1, 0, 0, 0, 0, 1, 7, 32, {
      uv: "top",
      tint: [0.35, 0.36, 0.34],
    });
    b.face("metal_dark", 3, TOPC, -44, 1, 0, 0, 0, 0, 1, 7, 32, {
      uv: "top",
      tint: [0.35, 0.36, 0.34],
    });
    b.boxMM("lamp", -3, TOPC + 0.3, -43, 3, TOPC + 0.32, -13, {
      tint: [0.42, 0.46, 0.48],
    });
    for (let z = -43; z <= -13; z += 1.5)
      b.beam("black_iron", -3, TOPC + 0.2, z, 3, TOPC + 0.2, z, 0.08, 0.1);
    for (const x of [-3, 3])
      b.beam("metal_dark", x, TOPC, -44, x, TOPC + 0.3, -12, 0.1, 0.3);
    for (let z = -40; z <= -16; z += 8)
      b.light(0, TOPC - 0.3, z, [0.7, 0.8, 0.9], 1.1, 13, { box: BB });
    b.glow(0, TOPC, -28, [0.3, 0.33, 0.36], 6);
    // cells
    for (const side of [-1, 1])
      for (let tier = 0; tier < 3; tier++)
        for (let i = 0; i < CELLS; i++) {
          const prison = side > 0 && tier === 0 && PRISON_CELLS.indexOf(i) >= 0;
          const dug = side > 0 && tier === 0 && i === DUG_CELL;
          const c = cell(b, ctx, side, tier, i, r, {
            door: prison ? "door" : dug ? "open" : undefined,
          });
          if (prison) {
            const d = doorLeaf(ctx, side, c.y, c.zm, c.z1, c.xf);
            d.cell = i;
            cellDoors.push(d);
            K.anchor(ctx, "prison" + i, c.xf + side * 1.2, c.y, c.zc);
            K.anchor(
              ctx,
              "celldoor" + i,
              c.xf - side * 0.3,
              c.y + 1.2,
              (c.zm + c.z1) / 2,
            );
          }
          if (tier === 0 && side < 0 && i % 3 === 1)
            K.loot(ctx, "footlocker", -9.3, 0, c.zc, HP, {
              loot: "footlocker",
              name: "Cell Stash",
            });
          // light in some cells
          if (r() < 0.25)
            K.lamp(
              b,
              side * 8.2,
              c.y + 2.3,
              c.zc,
              "bulb",
              [1, 0.75, 0.45],
              0.45,
              3.5,
              {
                ceil: c.y + 2.55,
                lightOpts: {
                  box: [
                    Math.min(side * 10, side * 6.4) - 0.1,
                    c.y - 0.1,
                    c.z0,
                    Math.max(side * 10, side * 6.4) + 0.1,
                    c.y + 3,
                    c.z1,
                  ],
                },
              },
            );
        }
    // the dug-through cell: rubble & a hole in the back wall
    b.hplate("decal", 8.5, 0.013, dugZ, 1.8, 2.0, 0.4, K.decal("grime", 90));
    K.rubble(b, 8.9, 0, dugZ - 0.9, 0.6, 0.5, { seed: 7, col: false, n: 3 });
    // tier slabs (cells + catwalks) for tiers 2 & 3, and a top ledge
    for (let t = 1; t < 3; t++) {
      const y = TIER[t];
      for (const side of [-1, 1]) {
        const xa = side * 10,
          xb = side * 5;
        b.boxMM(
          "metal_dark",
          Math.min(xa, xb),
          y - 0.25,
          -44,
          Math.max(xa, xb),
          y,
          -12,
          { tint: [0.45, 0.46, 0.44], faces: "nsewtb" },
        );
        b.col(Math.min(xa, xb), y - 0.25, -44, Math.max(xa, xb), y, -12, {
          tag: "floor",
          surface: "metal",
        });
      }
      // north bridge across the void
      b.boxMM("metal_dark", -5, y - 0.25, -44, 5, y, -42.6, {
        tint: [0.45, 0.46, 0.44],
        faces: "nsewtb",
      });
      b.col(-5, y - 0.25, -44, 5, y, -42.6, { tag: "floor", surface: "metal" });
      K.railing(b, -5, -42.6, 5, -42.6, y, {
        h: 1.05,
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.25,
      });
      // catwalk rails along the void (with gaps where the stairs arrive)
      const gapZ = [-24, -22.4];
      if (t === 1) {
        // tier 2: west rail gap at the S1 landing; east rail gap at the S2 foot
        K.railing(b, -5, -42.6, -5, gapZ[0], y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
        K.railing(b, -5, gapZ[1], -5, -12, y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
        K.railing(b, 5, -42.6, 5, -14.4, y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
      } else {
        // tier 3: west rail full; east rail gap at the S2 landing
        K.railing(b, -5, -42.6, -5, -12, y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
        K.railing(b, 5, -42.6, 5, gapZ[0], y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
        K.railing(b, 5, gapZ[1], 5, -12, y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
      }
      // caged lights under the catwalks
      for (let z = -40; z < -13; z += 6)
        for (const side of [-1, 1])
          K.lamp(
            b,
            side * 5.7,
            y - 0.45,
            z,
            "cage",
            [1, 0.72, 0.42],
            t === 1 ? 0.7 : 0.5,
            6,
            { ceil: y - 0.25, dead: r() < 0.3, lightOpts: { box: BB } },
          );
    }
    // top-tier ceiling ledge over the tier-3 cells
    for (const side of [-1, 1]) {
      const xa = side * 10,
        xb = side * 6.4;
      b.boxMM(
        "metal_dark",
        Math.min(xa, xb),
        TOPC - 0.3,
        -44,
        Math.max(xa, xb),
        TOPC,
        -12,
        { tint: [0.4, 0.41, 0.4], faces: "b" },
      );
    }
    // stairs: S1 tier1→2 (west, climbing −z), S2 tier2→3 (east, climbing −z)
    K.stairs(b, -5, -22.4, -3.8, -15, 0, TIER[1], "-z", {
      mat: "metal_dark",
      tint: [0.5, 0.5, 0.48],
      rail: "r",
      railMat: "black_iron",
      handMat: "black_iron",
      surface: "metal",
    });
    b.boxMM("metal_dark", -5, TIER[1] - 0.25, -24, -3.8, TIER[1], -22.4, {
      tint: [0.45, 0.46, 0.44],
      faces: "nsewtb",
    });
    b.col(-5, TIER[1] - 0.25, -24, -3.8, TIER[1], -22.4, {
      tag: "floor",
      surface: "metal",
    });
    K.railing(b, -3.8, -24, -3.8, -22.4, TIER[1], {
      h: 1.05,
      mat: "black_iron",
      handMat: "black_iron",
    });
    K.railing(b, -5, -24, -3.8, -24, TIER[1], {
      h: 1.05,
      mat: "black_iron",
      handMat: "black_iron",
    });
    K.stairs(b, 3.8, -22.4, 5, -14.4, TIER[1], TIER[2], "-z", {
      mat: "metal_dark",
      tint: [0.5, 0.5, 0.48],
      rail: "l",
      railMat: "black_iron",
      handMat: "black_iron",
      surface: "metal",
      solid: false,
      thick: 0.45,
    });
    b.boxMM("metal_dark", 3.8, TIER[1] - 0.25, -14.4, 5, TIER[1], -12, {
      tint: [0.45, 0.46, 0.44],
      faces: "nsewtb",
    });
    b.col(3.8, TIER[1] - 0.25, -14.4, 5, TIER[1], -12, {
      tag: "floor",
      surface: "metal",
    });
    b.boxMM("metal_dark", 3.8, TIER[2] - 0.25, -24, 5, TIER[2], -22.4, {
      tint: [0.45, 0.46, 0.44],
      faces: "nsewtb",
    });
    b.col(3.8, TIER[2] - 0.25, -24, 5, TIER[2], -22.4, {
      tag: "floor",
      surface: "metal",
    });
    K.railing(b, 3.8, -24, 3.8, -22.4, TIER[2], {
      h: 1.05,
      mat: "black_iron",
      handMat: "black_iron",
    });
    K.railing(b, 3.8, -24, 5, -24, TIER[2], {
      h: 1.05,
      mat: "black_iron",
      handMat: "black_iron",
    });
    K.railing(b, 3.8, -14.4, 3.8, -12.2, TIER[1], {
      h: 1.05,
      mat: "black_iron",
      handMat: "black_iron",
    });
    // suicide netting over the void at tier 2 (sagging, torn)
    for (let z = -42; z < -13; z += 1.2)
      b.pipe(
        "fabric",
        -3.7,
        TIER[1] - 0.3,
        z,
        3.7,
        TIER[1] - 0.9 - Math.sin(z) * 0.2,
        z,
        0.01,
        3,
        { tint: [0.4, 0.4, 0.36] },
      );
    // the flats: raider camp
    const camp = [[0, -30]];
    for (const [cx, cz] of camp) {
      b.cyl("rust", cx, 0, cz, 0.7, 0.8, 0.5, 10, { tint: [0.4, 0.3, 0.25] });
      b.light(cx, 1.2, cz, [1, 0.55, 0.25], 2.2, 10, { box: BB });
      b.glow(cx, 0.9, cz, [1, 0.5, 0.2], 2.2);
      b.col(cx - 0.7, 0, cz - 0.7, cx + 0.7, 0.5, cz + 0.7, {});
    }
    K.loot(ctx, "campfire", 0, 0, -30, 0, { spit: true, container: false });
    for (const [x, z, yaw] of [
      [-3, -34, 0.3],
      [2.8, -35, -0.4],
      [-2.6, -26, 1.2],
      [3, -38, 0.1],
    ])
      K.loot(ctx, "mattress", x, 0, z, yaw, { container: false });
    K.table(b, 2.5, 0, -26.5, 1.8, 0.9, {
      mat: "wood_rotten",
      tint: [0.6, 0.5, 0.4],
    });
    for (let k = 0; k < 4; k++)
      b.cyl(
        "rubber",
        -3.5 + (k % 2) * 0.6,
        k > 1 ? 0.25 : 0,
        -40 + (k % 2) * 0.3,
        0.35,
        0.35,
        0.25,
        10,
        { tint: [0.15, 0.15, 0.15] },
      ); // tyres
    for (let k = 0; k < 10; k++)
      b.hplate(
        "decal",
        -4.5 + r() * 9,
        0.012 + k * 0.0006,
        -42 + r() * 28,
        1.6,
        1.6,
        r() * 6,
        K.decal(k % 3 ? "grime" : "blood", k + 100),
      );
    K.litter(b, -4.8, -42.5, 4.8, -13, 0, 30, 91);
    b.plate(
      "decal",
      0,
      TIER[2] + 1.8,
      -43.88,
      0,
      1,
      5.0,
      1.4,
      K.tag("BLOCK C", "#e0e0d0", 256, 96, { font: "Arial Black" }),
      {},
    );
    b.plate(
      "art",
      0,
      TIER[0] + 3.0,
      -43.88,
      0,
      1,
      2.0,
      0.4,
      K.signCell("tombs_mess", "MESS HALL", 384, 80, {
        bg: "#2a3a2a",
        fg: "#e8e0c0",
        font: "Arial, sans-serif",
      }),
      {},
    );
    b.plate(
      "art",
      0,
      TIER[1] + 2.8,
      -43.88,
      0,
      1,
      2.0,
      0.4,
      K.signCell("tombs_ctrl", "CONTROL", 384, 80, {
        bg: "#2a3a2a",
        fg: "#e8e0c0",
        font: "Arial, sans-serif",
      }),
      {},
    );
    b.plate(
      "art",
      0,
      TIER[2] + 2.8,
      -43.88,
      0,
      1,
      2.0,
      0.4,
      K.signCell("tombs_warden", "WARDEN", 384, 80, {
        bg: "#3a1a14",
        fg: "#e8e0c0",
        font: "Arial, sans-serif",
      }),
      {},
    );
    // hanging chains, meat hooks
    for (let k = 0; k < 6; k++) {
      const x = -3 + r() * 6,
        z = -40 + r() * 26;
      b.pipe("black_iron", x, TOPC, z, x, TOPC - 3 - r() * 3, z, 0.02, 3);
    }

    // ---------------- north stack: cafeteria (0) / control (3.4) / warden (6.8), x −10..10, z −58..−44 ----------------
    const NB = (y, h) => [-10.1, y - 0.2, -58.1, 10.1, y + h + 0.2, -43.9];
    // cafeteria
    K.room(b, ctx, {
      x0: -10,
      z0: -58,
      x1: 10,
      z1: -44,
      y: 0,
      h: 3.2,
      floor: "checker",
      fc: [0.6, 0.6, 0.56],
      wall: "celltile",
      wc: tile,
      wain: "paint_green",
      wainC: [0.3, 0.4, 0.32],
      ceil: "plaster",
      cc: [0.45, 0.45, 0.42],
      trimMat: "metal_dark",
      ceilCol: true,
    });
    for (let row = 0; row < 3; row++)
      for (let k = 0; k < 2; k++) {
        const tx = -5 + k * 10,
          tz = -47.5 - row * 3.4;
        b.boxMM("steel", tx - 2.6, 0.72, tz - 0.45, tx + 2.6, 0.78, tz + 0.45, {
          tint: [0.6, 0.62, 0.62],
        });
        b.boxMM("steel", tx - 0.1, 0, tz - 0.1, tx + 0.1, 0.72, tz + 0.1, {});
        for (const s of [-1, 1])
          for (let q = -2; q <= 2; q++) {
            b.cyl(
              "steel",
              tx + q * 1.0,
              0.42,
              tz + s * 0.75,
              0.16,
              0.16,
              0.05,
              8,
            );
            b.cyl("steel", tx + q * 1.0, 0, tz + s * 0.75, 0.03, 0.03, 0.42, 4);
          }
        b.col(tx - 2.6, 0, tz - 0.45, tx + 2.6, 0.78, tz + 0.45, {
          tag: "furniture",
        });
        if (r() < 0.6) {
          b.cyl("metal", tx + (r() - 0.5) * 3, 0.78, tz, 0.12, 0.1, 0.06, 8, {
            tint: [0.6, 0.62, 0.6],
          });
          b.box("metal", tx + (r() - 0.5) * 3, 0.78, tz, 0.4, 0.03, 0.3, {
            tint: [0.55, 0.57, 0.55],
          });
        }
      }
    b.boxMM("steel", -9.9, 0, -57.8, -8.6, 0.95, -48, {
      tint: [0.55, 0.57, 0.56],
    });
    b.col(-9.9, 0, -57.8, -8.6, 0.95, -48, { tag: "counter" });
    for (let z = -57; z < -48.5; z += 1.1)
      b.boxMM("steel", -9.7, 0.9, z, -8.8, 0.98, z + 0.8, {
        tint: [0.45, 0.47, 0.46],
      });
    b.beam("steel", -8.6, 1.35, -57.8, -8.6, 1.35, -48, 0.04, 0.04); // tray rail
    b.cyl("black_iron", 6.5, 0, -55.5, 0.9, 0.75, 0.9, 12, {
      tint: [0.3, 0.28, 0.26],
    }); // raider stew pot
    b.col(5.6, 0, -56.4, 7.4, 0.9, -54.6, {});
    b.light(6.5, 1.2, -55.5, [1, 0.5, 0.2], 1.4, 7, { box: NB(0, 3.2) });
    b.glow(6.5, 0.3, -55.5, [1, 0.45, 0.15], 1.6);
    K.lamp(b, 0, 2.9, -51, "tube", [0.9, 1, 0.9], 0.8, 9, {
      ceil: 3.2,
      len: 1.6,
      lightOpts: { box: NB(0, 3.2) },
    });
    b.plate(
      "decal",
      9.88,
      1.8,
      -51,
      -1,
      0,
      4,
      1.2,
      K.tag("SECONDS? NO.", "#e0e0d0", 256, 96),
      {},
    );
    K.loot(ctx, "fridge", 9.5, 0, -57.2, -HP, { loot: "fridge" });
    K.note(ctx, "pv_note_tombs_menu", -9.2, 0.99, -52, {
      name: "Raider Mess Rota",
      title: "MESS ROTA (written on a cafeteria tray)",
      learn: LK.control.id,
      text: "MON — mystery stew\nTUE — mystery stew (same)\nWED — whatever Skunk caught\nTHU — stew\nFRI — \"Prisoner's Choice\" (they don't get a choice)\n\nMADDOX SAYS: Nobody eats the prisoners. They're worth 100 scrip a head to the Gallowglass boys. Eat the roaches like normal people.\n\nROURKE: control room word is GALLOWS. Stop asking me. Stop writing it on the trays.\n(Someone has written it on the tray.)",
    });

    // control room (3.4)
    const CY = TIER[1];
    K.room(b, ctx, {
      x0: -10,
      z0: -58,
      x1: 10,
      z1: -44,
      y: CY,
      h: 3.2,
      floor: "metal",
      fc: [0.45, 0.47, 0.45],
      wall: "metal",
      wc: [0.5, 0.55, 0.5],
      ceil: "metal_dark",
      cc: [0.35, 0.36, 0.34],
      trim: false,
      surface: "metal",
      ceilCol: true,
    });
    // observation windows into the block (on the south wall, both sides of the door)
    for (const x of [-5.5, 5.5]) {
      b.plate("glass_clear", x, CY + 1.8, -44.0, 0, -1, 5, 1.4, null, {
        tint: [0.6, 0.7, 0.7],
      });
      b.beam(
        "metal_dark",
        x - 2.5,
        CY + 1.1,
        -43.85,
        x + 2.5,
        CY + 1.1,
        -43.85,
        0.08,
        0.1,
      );
    }
    // control desks
    for (let x = -8.5; x <= 7.5; x += 2.4) {
      if (Math.abs(x) < 1.4) continue;
      b.boxMM("metal", x - 1.1, CY, -45.6, x + 1.1, CY + 1.0, -44.8, {
        tint: [0.45, 0.5, 0.46],
      });
      b.quadN(
        "metal",
        [x - 1.1, CY + 1.0, -45.6],
        [x + 1.1, CY + 1.0, -45.6],
        [x + 1.1, CY + 1.25, -45.1],
        [x - 1.1, CY + 1.25, -45.1],
        [0, 1, 0.5],
        { tint: [0.4, 0.45, 0.42] },
      );
      for (let k = 0; k < 8; k++)
        b.geo("lamp", K.sphereGeo(), {
          x: x - 0.9 + k * 0.25,
          y: CY + 1.13,
          z: -45.3,
          s: 0.03,
          tint: r() < 0.5 ? [1, 0.3, 0.2] : [0.3, 1, 0.3],
        });
      b.col(x - 1.1, CY, -45.6, x + 1.1, CY + 1.25, -44.8, {
        tag: "furniture",
      });
    }
    for (let x = -9; x <= 9; x += 3) {
      b.boxMM(
        "paint_black",
        x - 0.5,
        CY + 1.8,
        -57.9,
        x + 0.5,
        CY + 2.6,
        -57.4,
        { tint: [0.25, 0.27, 0.25] },
      );
      b.plate("lamp", x, CY + 2.2, -57.38, 0, 1, 0.8, 0.6, null, {
        tint: r() < 0.4 ? [0.15, 0.3, 0.2] : [0.05, 0.08, 0.06],
      });
    }
    K.terminal(
      ctx,
      "pv_term_tombs_control",
      -1.8,
      CY + 1.0,
      -45.2,
      PI,
      termControl(),
      "own_desk",
    );
    b.light(0, CY + 2.6, -51, [0.5, 0.9, 0.6], 0.9, 11, { box: NB(CY, 3.2) });
    K.lamp(b, 0, CY + 2.9, -55, "cage", [1, 0.2, 0.15], 0.8, 8, {
      ceil: CY + 3.2,
      lightOpts: { box: NB(CY, 3.2) },
    });
    K.loot(ctx, "ammo_box", 9.3, CY, -57.2, -HP, { loot: "ammo_box" });
    K.loot(ctx, "locker", -9.6, CY, -52, HP, {
      loot: "locker",
      name: "Guard Locker",
    });

    // warden's office (6.8)
    const WY = TIER[2];
    const WB = NB(WY, 3.4);
    K.gap(ctx, 10, -51, 1.4, WY, 2.4); // → Bridge of Sighs
    K.room(b, ctx, {
      x0: -10,
      z0: -58,
      x1: 10,
      z1: -44,
      y: WY,
      h: 3.4,
      floor: "wood",
      fc: [0.5, 0.38, 0.3],
      wall: "wallpaper_green",
      wc: [0.55, 0.58, 0.48],
      wain: "wood_dark",
      wainC: [0.35, 0.24, 0.18],
      wainH: 1.1,
      ceil: "plaster",
      cc: [0.45, 0.44, 0.4],
      surface: "wood",
    });
    b.hplate("carpet", 0, WY + 0.012, -52, 7, 5, 0, null, {
      tint: [0.7, 0.6, 0.55],
    });
    const wdt = K.table(b, 0, WY, -54.5, 2.6, 1.2, { mat: "mahogany" });
    // Maddox's throne: a barber chair on a pallet
    b.boxMM("wood_rotten", -0.9, WY, -57.2, 0.9, WY + 0.2, -55.6, {
      tint: [0.55, 0.45, 0.35],
    });
    b.boxMM("leather_red", -0.4, WY + 0.2, -56.8, 0.4, WY + 0.75, -56, {
      tint: [0.7, 0.2, 0.15],
    });
    b.boxMM("leather_red", -0.4, WY + 0.75, -57.0, 0.4, WY + 1.8, -56.8, {
      tint: [0.7, 0.2, 0.15],
    });
    b.cyl("chrome", 0, WY + 0.2, -56.4, 0.25, 0.2, 0.1, 10);
    b.col(-0.9, WY, -57.2, 0.9, WY + 0.75, -55.6, { tag: "furniture" });
    // trophies: skull shelf, the dartboard over an empty frame (the portrait sits on the desk)
    for (let k = 0; k < 7; k++)
      b.geo("bone", K.sphereGeo(), {
        x: -8 + k * 0.5,
        y: WY + 1.9,
        z: -57.75,
        s: 0.12,
      });
    b.boxMM("wood_dark", -8.3, WY + 1.75, -57.95, -4.7, WY + 1.8, -57.6, {});
    b.cyl("cloth_red", 5, WY + 2.1, -57.9, 0.35, 0.35, 0.05, 16, {
      tint: [0.7, 0.25, 0.2],
      rows: 1,
    }); // dartboard (flat disc)
    K.framed(b, 5, WY + 2.1, -57.88, 0, 1, 1.0, 1.2, K.decal("grime", 120), {
      frame: "gold",
    });
    for (let k = 0; k < 12; k++)
      b.pipe(
        "rust",
        4.6 + r() * 0.8,
        WY + 1.6 + r() * 1.0,
        -57.85,
        4.6 + r() * 0.8,
        WY + 1.6 + r() * 1.0,
        -57.6,
        0.008,
        3,
      ); // darts in the wall
    K.terminal(
      ctx,
      "pv_term_tombs_warden",
      0.8,
      wdt,
      -54.7,
      0,
      termWarden(),
      "bare",
    );
    K.lamp(b, -0.6, wdt + 0.35, -54.6, "pendant", [1, 0.85, 0.6], 0.8, 5, {
      ceil: wdt + 0.45,
      shade: "paint_green",
      lightOpts: { box: WB },
    });
    b.box("brass", -0.6, wdt, -54.6, 0.15, 0.4, 0.15, {});
    K.lamp(b, -5, WY + 3.0, -50, "bulb", [1, 0.75, 0.45], 1.0, 9, {
      ceil: WY + 3.4,
      lightOpts: { box: WB },
    });
    K.lamp(b, 5, WY + 3.0, -50, "bulb", [1, 0.75, 0.45], 0.9, 9, {
      ceil: WY + 3.4,
      lightOpts: { box: WB },
    });
    K.lamp(b, -6, WY + 3.0, -55.5, "bulb", [1, 0.7, 0.4], 0.8, 7, {
      ceil: WY + 3.4,
      lightOpts: { box: WB },
    });
    K.lamp(b, 5, WY + 3.0, -55.5, "bulb", [1, 0.7, 0.4], 0.7, 7, {
      ceil: WY + 3.4,
      dead: false,
      lightOpts: { box: WB },
    });
    K.salonWall(b, -9.8, -8.2, WY + 1.2, WY + 3.0, 9.88, -1, 0, "tombs_w_e", {
      density: 0.5,
    });
    // Maddox's "court": banner, wanted/mugshot wall, gun rack, filing cabinets, a lounge by a fire barrel, loot piles
    b.plate(
      "decal",
      0,
      WY + 2.75,
      -57.88,
      0,
      1,
      5.2,
      1.0,
      K.tag("WARDEN MADDOX — LAW IS WHAT I SAY", "#e02020", 512, 96, {
        rot: -0.02,
      }),
      {},
    );
    for (let k = 0; k < 10; k++)
      K.framed(
        b,
        -9.88,
        WY + 1.5 + (k % 2) * 0.75,
        -46 - Math.floor(k / 2) * 1.1,
        1,
        0,
        0.45,
        0.6,
        K.photo("mug", 30 + k, 96, 128),
        { frame: "paint_black", fw: 0.02 },
      );
    b.plate(
      "decal",
      -9.87,
      WY + 2.9,
      -48.3,
      1,
      0,
      3.6,
      0.6,
      K.tag("MERCHANDISE", "#f0f0e0", 256, 64),
      {},
    );
    // gun rack (west wall, south of the safe)
    b.boxMM("wood_dark", -9.95, WY + 0.9, -54.4, -9.7, WY + 2.3, -51.6, {
      tint: [0.4, 0.28, 0.2],
    });
    for (let k = 0; k < 6; k++) {
      const z = -54.1 + k * 0.48;
      b.box("metal_dark", -9.62, WY + 0.95, z, 0.08, 1.15, 0.07, {
        tint: [0.22, 0.22, 0.2],
      });
      b.box("wood", -9.62, WY + 0.95, z, 0.1, 0.35, 0.1, {
        tint: [0.45, 0.3, 0.2],
      });
    }
    b.col(-9.95, WY, -54.4, -9.55, WY + 2.3, -51.6, { tag: "furniture" });
    // filing cabinets (old prison records, now tinder)
    for (let k = 0; k < 4; k++) {
      const x = 3 + k * 0.8;
      b.boxMM("metal", x - 0.36, WY, -57.95, x + 0.36, WY + 1.35, -57.35, {
        tint: [0.45, 0.48, 0.44],
      });
      for (let d = 0; d < 3; d++)
        b.boxMM(
          "brass",
          x - 0.08,
          WY + 0.3 + d * 0.4,
          -57.36,
          x + 0.08,
          WY + 0.34 + d * 0.4,
          -57.3,
          {},
        );
    }
    b.col(2.6, WY, -57.95, 5.8, WY + 1.35, -57.35, { tag: "furniture" });
    for (let k = 0; k < 30; k++)
      b.hplate(
        "flat",
        2 + r() * 5,
        WY + 0.013 + k * 0.0003,
        -57 + r() * 3.5,
        0.21,
        0.29,
        r() * 6.3,
        null,
        { tint: [0.8, 0.76, 0.66] },
      );
    // lounge: two couches round a fire barrel (baked firelight)
    K.sofa(b, 6.2, WY, -47.2, 2.2, PI, {
      mat: "leather_red",
      tint: [0.5, 0.2, 0.15],
    });
    K.sofa(b, 8.9, WY, -49.6, 2.0, -HP, {
      mat: "fabric",
      tint: [0.45, 0.42, 0.3],
    });
    b.col(5.1, WY, -47.6, 7.3, WY + 0.9, -46.8, { tag: "furniture" });
    b.col(8.6, WY, -50.6, 9.3, WY + 0.9, -48.6, { tag: "furniture" });
    b.cyl("rust", 6.6, WY, -49.6, 0.32, 0.3, 0.9, 10, {
      tint: [0.45, 0.3, 0.2],
    });
    b.col(6.3, WY, -49.9, 6.9, WY + 0.9, -49.3, {});
    b.light(6.6, WY + 1.3, -49.6, [1, 0.5, 0.2], 1.3, 7, { box: WB });
    b.glow(6.6, WY + 1.05, -49.6, [1, 0.45, 0.15], 1.5);
    for (let k = 0; k < 6; k++)
      b.cyl(
        "glass",
        5 + r() * 3,
        WY,
        -48.5 + r() * 1.4,
        0.035,
        0.035,
        0.26,
        6,
        { tint: [0.35, 0.5, 0.3] },
      );
    // loot heap: crates, a pile of scrip, stolen art stacked against the wall
    for (let k = 0; k < 5; k++)
      b.box(
        "wood_rotten",
        -7.5 + (k % 3) * 0.95,
        WY + (k > 2 ? 0.7 : 0),
        -44.9,
        0.9,
        0.7,
        0.7,
        { yaw: (r() - 0.5) * 0.3, tint: [0.6, 0.5, 0.36] },
      );
    b.col(-8, WY, -45.3, -4.9, WY + 1.4, -44.4, {});
    for (let k = 0; k < 4; k++)
      b.quad(
        "art",
        [-3.8 + k * 0.03, WY + 0.02, -44.2],
        [-2.6 + k * 0.03, WY + 0.02, -44.2],
        [-2.6 + k * 0.03, WY + 1.0, -44.45 + k * 0.06],
        [-3.8 + k * 0.03, WY + 1.0, -44.45 + k * 0.06],
        { rect: K.painting(70 + k, 128, 112), grime: 0.2 },
      );
    K.anchor(ctx, "portrait", -0.6, wdt + 0.02, -54.3);
    K.anchor(ctx, "boss", 0, WY, -52.5);
    K.loot(ctx, "safe", -9.7, WY, -56.5, HP, {
      loot: "safe",
      lock: LK.wsafe,
      name: "Warden's Safe",
      tag: "wsafe",
    });
    K.loot(ctx, "footlocker", 9.2, WY, -56.5, -HP, {
      loot: "raider_stash",
      name: "Maddox's Loot",
    });
    K.loot(ctx, "mattress", -7, WY, -47, 0.2, { container: false });

    // ---------------- Bridge of Sighs (x 10..26, z −53..−49, y 6.8) ----------------
    const SB2 = [9.9, WY - 0.2, -53.1, 26.1, WY + 3.4, -48.9];
    K.gap(ctx, 26, -51, 1.4, WY, 2.4);
    K.room(b, ctx, {
      x0: 10,
      z0: -53,
      x1: 26,
      z1: -49,
      y: WY,
      h: 3.2,
      floor: "terrazzo",
      fc: [0.55, 0.53, 0.5],
      wall: "limestone",
      wc: [0.72, 0.68, 0.6],
      ceil: "plaster",
      cc: [0.5, 0.48, 0.44],
      trim: false,
    });
    for (let k = 0; k < 5; k++) {
      const x = 12 + k * 3.2;
      for (const [z, n] of [
        [-53, 1],
        [-49, -1],
      ]) {
        b.plate("lamp", x, WY + 1.7, z + n * 0.12, 0, n, 1.3, 2.0, null, {
          tint: [0.5, 0.54, 0.58],
        });
        for (const s of [-0.35, 0, 0.35])
          b.beam(
            "black_iron",
            x + s,
            WY + 0.7,
            z + n * 0.14,
            x + s,
            WY + 2.7,
            z + n * 0.14,
            0.03,
            0.03,
          );
        b.light(x, WY + 1.8, z + n * 0.8, [0.7, 0.78, 0.86], 0.6, 3.5, {
          box: SB2,
        });
      }
    }
    for (let k = 0; k < 4; k++)
      b.hplate(
        "decal",
        12 + r() * 12,
        WY + 0.012 + k * 0.001,
        -52 + r() * 2,
        1.3,
        1.3,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", k + 130),
      );
    K.skel(ctx, 17.5, WY, -52.4, 0.6, "reaching");
    K.note(ctx, "pv_note_tombs_bridge", 18, WY + 0.02, -52.1, {
      name: "Last Walk",
      title:
        "Scratched into the bridge floor, finished in pencil on a court docket",
      text: "They call this the Bridge of Sighs. You walk across from the courts to the cells and you sigh because that's it, that's your life now.\n\nThe bombs fell while I was halfway across. The guards ran. The doors locked. So here I am, exactly halfway between guilty and innocent.\n\nFor the record: I didn't do it. For the record: nobody's keeping a record anymore.",
    });
    b.plate(
      "art",
      25.88,
      WY + 2.7,
      -51,
      -1,
      0,
      2.0,
      0.4,
      K.signCell("tombs_courts_in", "CRIMINAL COURTS →", 384, 80, {
        bg: "#2a2a2a",
        fg: "#d8d0b8",
        font: "Georgia, serif",
      }),
      {},
    );

    // ---------------- SOLITARY ("the Hole"): x 10..15, z −40..−16 ----------------
    const HB = [9.9, -0.2, -40.1, 15.1, 3.0, -15.9];
    K.room(b, ctx, {
      x0: 10,
      z0: -40,
      x1: 12,
      z1: -16,
      y: 0,
      h: 2.8,
      floor: "concrete",
      fc: [0.45, 0.44, 0.42],
      wall: "concrete",
      wc: [0.48, 0.48, 0.45],
      ceil: "concrete",
      cc: [0.3, 0.3, 0.3],
      trim: false,
      open: { e: true },
    });
    // hole cells: 6 × 4 m; #3 is Sam's padded cell (open)
    for (let k = 0; k < 6; k++) {
      const z0 = -40 + k * 4,
        z1 = z0 + 4,
        zc = z0 + 2;
      const open = k === 3 || k === 5;
      const gaps = open ? [{ t: 2, w: 0.9, y1: 2.1 }] : [];
      K.segWall(b, 12, z0, 12, z1, 0, 2.8, -1, {
        mat: "concrete",
        tint: [0.48, 0.48, 0.45],
        gaps,
        trim: false,
      });
      if (open)
        K.room(b, ctx, {
          x0: 12,
          z0,
          x1: 15,
          z1,
          y: 0,
          h: 2.8,
          floor: k === 3 ? "padded" : "concrete",
          fc: [0.6, 0.58, 0.52],
          wall: k === 3 ? "padded" : "concrete",
          wc: [0.62, 0.6, 0.54],
          ceil: "concrete",
          cc: [0.35, 0.35, 0.34],
          trim: false,
          open: { w: true },
        });
      else {
        b.boxMM("metal_dark", 11.9, 0, zc - 0.5, 11.97, 2.1, zc + 0.5, {
          tint: [0.35, 0.38, 0.35],
        });
        b.boxMM("paint_black", 11.85, 1.5, zc - 0.2, 11.9, 1.6, zc + 0.2, {});
        b.plate(
          "art",
          11.84,
          2.3,
          zc,
          -1,
          0,
          0.3,
          0.12,
          K.signCell("hole" + k, "H-" + (k + 1), 96, 40, {
            bg: "#1a1a1a",
            fg: "#d8d0b8",
            font: "Arial",
          }),
          {},
        );
      }
    }
    K.lamp(b, 11, 2.5, -30, "cage", [1, 0.15, 0.1], 0.9, 8, {
      ceil: 2.8,
      lightOpts: { box: HB },
    });
    K.lamp(b, 13.5, 2.5, -26, "bulb", [1, 0.8, 0.55], 0.6, 3.5, {
      ceil: 2.8,
      lightOpts: { box: [11.9, -0.2, -28.1, 15.1, 3, -23.9] },
    });
    K.lamp(b, 13.5, 2.5, -18, "bulb", [1, 0.8, 0.55], 0, 0, {
      ceil: 2.8,
      dead: true,
    });
    b.plate(
      "decal",
      14.88,
      1.4,
      -18,
      -1,
      0,
      3.4,
      1.4,
      K.paint("art", "tombs_tally", 256, 128, function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        x.strokeStyle = "rgba(220,210,190,0.8)";
        x.lineWidth = 2;
        for (let k = 0; k < 120; k++) {
          const gx = X + 6 + (k % 24) * 10,
            gy = Y + 8 + Math.floor(k / 24) * 24;
          x.beginPath();
          if (k % 5 === 4) {
            x.moveTo(gx - 42, gy + 16);
            x.lineTo(gx + 2, gy);
          } else {
            x.moveTo(gx, gy);
            x.lineTo(gx, gy + 18);
          }
          x.stroke();
        }
      }),
      {},
    );
    K.skel(ctx, 13.8, 0, -19, -HP, "curled");
    K.anchor(ctx, "sam", 13.4, 0, -26);
    K.loot(ctx, "footlocker", 14.3, 0, -24.6, -HP, {
      loot: "raider_stash",
      name: "Loose Brick Stash",
    }); // a hole behind a loose brick: no lock

    // ---------------- doors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pv_tombs_in",
      pos: new THREE.Vector3(PORTAL_X, 1.3, TW.z0 - 0.4),
      label: "The Tombs",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.4, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("tombs")),
    });
    K.door(ctx, {
      id: "pv_tombs_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.3),
      label: "White Street",
      verb: "Leave",
      target: { x: PORTAL_X, y: 0, z: TW.z0 - 2.2, yaw: 0 },
    });
    // the side door is padlocked from the inside: leaving that way takes the padlock off for good
    K.door(ctx, {
      id: "pv_tombs_courts_out",
      pos: new THREE.Vector3(OX + 25.8, OY + WY + 1.3, OZ - 51),
      label: "Criminal Courts — White Street",
      verb: "Go to",
      target: { x: SIDE_DOOR.x, y: 0, z: SIDE_DOOR.z - 2.9, yaw: 0 },
      onEnter: () => {
        PV.setFlag("tombs_courts_open", true);
        K.lockUnlock(LK.courts.id);
      },
    });
    K.door(ctx, {
      id: "pv_tombs_courts_in",
      pos: new THREE.Vector3(SIDE_DOOR.x, 1.3, SIDE_DOOR.z - 0.3),
      label: "Criminal Courts (Bridge of Sighs)",
      verb: "Enter",
      lock: LK.courts,
      target: { x: OX + 24.6, y: OY + WY, z: OZ - 51, yaw: HP },
    });

    // ---------------- anchors ----------------
    K.anchor(ctx, "entrance", 0, 0, -1.4);
    K.anchor(ctx, "raider1", -5.7, TIER[1], -30);
    K.anchor(ctx, "raider2", 5.7, TIER[2], -34);
    K.anchor(ctx, "raider3", 3, 0, -50);
    K.anchor(ctx, "raider4", 4, CY, -52);
    K.anchor(ctx, "blockc", 5, 0, -24);
    if (ctx.anchors.prison8) {
      ctx.anchors.prison8.x += 0.1;
      ctx.anchors.prison8.z -= 1.8;
    } // round 1b: was inside the bunk (audit)
    const sp = [
      [-3.1, 0, -8.8],
      [3, 0, -20],
      [-2, 0, -36],
      [-5.7, TIER[1], -18],
      [5.7, TIER[1], -38],
      [-5.7, TIER[2], -26],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", -9.7, WY, -56.5);
    K.anchor(ctx, "loot2", 9.3, CY, -57.2);
    K.anchor(ctx, "loot3", 14.3, 0, -24.6);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_tombs_int";
    for (const d of cellDoors) ctx.intRoot.add(d.group);
  }

  // ------------------------------------------------------------------
  // terminals
  // ------------------------------------------------------------------
  function termBooking() {
    return {
      title: "MANHATTAN HOUSE OF DETENTION — BOOKING",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\n-NYC Dept. of Correction-",
      entries: [
        {
          title: "Intake Log — March 1967",
          text: '06:10 — 14 transfers from Rikers (overcrowding).\n08:55 — 2 walk-ins: "Russian spies" (they are a Ukrainian bakery family; released).\n09:40 — ALERT CONDITION RED. Lockdown ordered.\n09:41 — Staff evacuating to the Courts building shelter.\n09:42 — Who has the keys to Block C?\n09:42 — Who has the keys to Block C??',
        },
        {
          title: "1988 — New Management",
          text: 'BOOKED BY WARDEN MADDOX (self-appointed):\n- one (1) wagon guard, "looked at me funny"\n- one (1) Vanguard girl, "sings too loud"\n- one (1) old man, "for being old"\nBAIL: 100 scrip each, payable to the Gallowglass Company.',
        },
      ],
    };
  }
  function termControl() {
    return {
      title: "CELL CONTROL — BLOCKS A/B/C",
      header: "KESTREL TELETYPE CORP. — DOOR CONTROL SUBSYSTEM",
      lock: LK.control,
      entries: [
        {
          title: "Block Status",
          text: () =>
            "BLOCK A: 0/30 occupied\nBLOCK B: 0/30 occupied\nBLOCK C: " +
            (PV.flag("tombs_prisoners") === "freed"
              ? "0/30 — DOORS OPEN"
              : PV.flag("tombs_prisoners") === "sold"
                ? '0/30 — "TRANSFERRED"'
                : "3/30 occupied — LOCKED"),
        },
        {
          title: "RELEASE BLOCK C",
          text: "Solenoids engaged. Block C cell doors open.",
          cond: () => !PV.flag("tombs_prisoners"),
          action: () => {
            K.lockUnlock(LK.blockc.id);
            releasePrisoners("terminal");
          },
        },
      ],
    };
  }
  function termWarden() {
    // Maddox never set a password ("who'd dare?")
    return {
      title: 'WARDEN — "MADDOX"',
      header: "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\n-PERSONAL-",
      entries: [
        {
          title: "Log",
          learn: LK.control.id,
          text: () => {
            K.learn(LK.control.id);
            return "Day 1 of my reign: took the Tombs from the Worth Street Rats. Cells work, walls are thick, the bridge is a great place to hang people. Figuratively. Also literally.\n\nDay 2: Control room word is GALLOWS. Rourke picked it. Rourke thinks he's funny.\n\nDay 40: Robbed the artist hotel on 23rd. Got a painting of a little girl on a swing. Nice frame. Hung it in the office. Use it for darts.\n\nDay 90: Gallowglass slavers pay 100 scrip a head. Three heads in Block C. Contract below — just sign it and they'll collect.";
          },
        },
        {
          title: "Gallowglass Contract — SIGN",
          text: "You sign over the three prisoners of Block C to the Gallowglass slavers. A runner will bring the 300 scrip to the Warden's safe. Your conscience will bring nothing.",
          cond: () => !PV.flag("tombs_prisoners"),
          action: () => sellPrisoners(),
        },
        {
          title: "Safe Combination",
          learn: LK.wsafe.id,
          text: () => {
            K.learn(LK.wsafe.id);
            return 'Twelve, seven, sixty-seven: 1-2-7-6-7. "The year the world ended, and my birthday." Nobody forgets a birthday like that.';
          },
        },
      ],
    };
  }

  // ------------------------------------------------------------------
  // prisoners: release / sell
  // ------------------------------------------------------------------
  const PRISONERS = [
    {
      id: "pv_prisoner_rosa",
      name: "Carmen Medina",
      gender: "f",
      outfit: "settler",
      cell: 6,
      bark: "Thank you! We'll make for the Vanguard — tell Mags to pour three.",
    },
    {
      id: "pv_prisoner_ike",
      name: 'Ike "Wagon" Mbeki',
      gender: "m",
      outfit: "combat_armor",
      cell: 7,
      bark: "Owe you one. Owe you a lot, actually.",
    },
    {
      id: "pv_prisoner_elias",
      name: "Old Elias",
      gender: "m",
      outfit: "survivor",
      cell: 8,
      bark: "Out! At my age! Hah!",
    },
  ];
  function openDoor(d, instant) {
    if (!d || d.open) return;
    d.open = true;
    d.t = instant ? 1 : 0;
    if (d.col) {
      G.world.removeCollider(d.col);
      d.col = null;
    }
    if (instant) d.group.position.z = d.z0 - 1.1;
    else
      K.sfx("door_open", d.group.getWorldPosition(new THREE.Vector3()), {
        pitch: 0.5,
      });
  }
  function closeDoor(d) {
    d.open = false;
    d.t = 0;
    d.group.position.z = d.z0;
    if (!d.col) {
      const O = d.O,
        xf = d.xf,
        side = d.side;
      d.col = G.world.addBox(
        O.x + Math.min(xf, xf + side * 0.08) - 0.03,
        O.y + d.y,
        O.z + d.z0,
        O.x + Math.max(xf, xf + side * 0.08) + 0.03,
        O.y + d.y + 2.55,
        O.z + d.z1,
        { tag: "interactable_self", walkable: false },
      );
    }
  }
  function releasePrisoners(how) {
    if (PV.flag("tombs_prisoners")) return;
    PV.setFlag("tombs_prisoners", "freed");
    for (const d of cellDoors) openDoor(d);
    K.standing(50, "Freed the Tombs prisoners");
    K.xp(150, "Jailbreak");
    PRISONERS.forEach((p, i) => {
      const a = !G.isStub("actors") && G.actors.get ? G.actors.get(p.id) : null;
      if (a && !a.dead) {
        K.safe("say", () => a.say && a.say(p.bark, 4));
        const ent = PV.anchor("tombs", "entrance");
        setTimeout(
          () =>
            K.safe("flee", () => {
              if (!a.dead && ent) {
                a.aiMode = "wander";
                a.ai = "wander";
                if (a.moveTo) a.moveTo(ent.x + i * 0.6, ent.z - 2);
              }
            }),
          1500 + i * 400,
        );
      }
    });
    if (!K.q.started("pv_jailbreak")) K.q.start("pv_jailbreak");
    K.q.complete("pv_jailbreak");
    K.notify(
      how === "terminal"
        ? "Block C cell doors open."
        : "The cell door swings open.",
    );
  }
  function sellPrisoners() {
    if (PV.flag("tombs_prisoners")) return;
    PV.setFlag("tombs_prisoners", "sold");
    K.standing(-100, "Sold prisoners to slavers");
    K.scrip(300);
    PRISONERS.forEach((p) => {
      const a = !G.isStub("actors") && G.actors.get ? G.actors.get(p.id) : null;
      if (a && G.actors.remove) K.safe("rm", () => G.actors.remove(a));
    });
    if (!K.q.started("pv_jailbreak")) K.q.start("pv_jailbreak");
    K.q.set("pv_jailbreak", "sold");
    K.q.complete("pv_jailbreak");
    K.notify("300 scrip. The Gallowglass runner will collect them tonight.");
  }

  // ==================================================================
  // DATA & SPAWN & UPDATE
  // ==================================================================
  function data(ctx) {
    K.defineItem({
      id: "pv_key_tombs_cells",
      type: "key",
      name: "Block C Key Ring",
      weight: 0,
      value: 0,
      desc: 'A ring of heavy brass keys stamped "BLOCK C". Maddox wore it like a medal.',
    });
    K.defineItem({
      id: "pv_key_tombs_padlock",
      type: "key",
      name: "Courts Padlock Key",
      weight: 0,
      value: 0,
      desc: "A small steel key on a bootlace. The gatekeepers lock the Criminal Courts side door with it.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pv_jailbreak",
        name: "Jailbreak",
        giver: "Carmen Medina",
        location: "The Tombs",
        desc: 'Raiders under a self-appointed "Warden Maddox" hold three prisoners in Block C of the Tombs, waiting to be sold to Gallowglass slavers.',
        stages: [
          {
            id: "free",
            text: "Free the prisoners held in Block C of the Tombs.",
            markers: [
              () => {
                const a = PV.anchor("tombs", "blockc");
                return a ? { x: a.x, z: a.z, y: a.y, label: "Block C" } : null;
              },
            ],
          },
          {
            id: "jb_ctrl",
            text: "(Optional) Open Block C from the control-room teletype (the raiders use a passcode).",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.stage("pv_jailbreak") === "free",
            doneIf: () => false,
          },
          {
            id: "jb_key",
            text: "(Optional) Take the Block C key from Warden Maddox.",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.stage("pv_jailbreak") === "free",
            doneIf: () => K.has("pv_key_tombs_cells"),
          },
          {
            id: "sold",
            text: "You sold the prisoners to the Gallowglass slavers.",
            hidden: false,
          },
        ],
        rewards: { xp: 300 },
      });
    }
    // cell door interactables
    for (const d of cellDoors) {
      const p = ctx.anchors["celldoor" + d.cell];
      G.world.addInteractable({
        pos: p,
        radius: 0.9,
        label: "Block C Cell Door",
        verb: "Open",
        priority: 2,
        locked: () => (d.open || K.has("pv_key_tombs_cells") ? null : "Locked"),
        enabled: () => !d.open && !PV.flag("tombs_prisoners"),
        onInteract() {
          if (!K.has("pv_key_tombs_cells") && !K.lockIsOpen(LK.blockc.id)) {
            K.sfx("door_locked");
            K.notify(
              "Locked. The key ring is with Maddox — or try the control room upstairs.",
            );
            return;
          }
          K.lockOpen(LK.blockc, () => releasePrisoners("key"));
        },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("pv_dlg_rosa", {
      start: () => (PV.flag("tombs_prisoners") === "freed" ? "free" : "caged"),
      nodes: {
        caged: {
          speaker: "Carmen Medina",
          onEnter: () => K.q.start("pv_jailbreak"),
          text: "Hey — HEY. You're not one of Maddox's. Please. They're selling us to the Gallowglass slavers when the runner comes. Maddox has the key ring. Or the control room — upstairs, second tier — can pop every door in Block C.",
          responses: [
            { text: "I'll get you out.", next: "promise" },
            { text: "Why are you here?", next: "why" },
            { text: "What's in it for me?", next: "pay" },
            { text: "Goodbye.", end: true },
          ],
        },
        why: {
          speaker: "Carmen Medina",
          text: "I sing at the Vanguard. Sang. Maddox came in for a drink and didn't like the song. Ike was guarding a trade wagon they hit. Elias... Elias was just old and slow. That's a crime now, apparently.",
          responses: [
            { text: "I'll get you out.", next: "promise" },
            { text: "Goodbye.", end: true },
          ],
        },
        pay: {
          speaker: "Carmen Medina",
          text: "Scrip? I've got a voice and a bar tab. Mags at the Vanguard will stand you drinks forever. That's the best I can do from in here.",
          responses: [
            { text: "Sit tight.", next: "promise" },
            { text: "Not my problem.", end: true, standing: -5 },
          ],
        },
        promise: {
          speaker: "Carmen Medina",
          text: "Hurry. And if you get to Maddox's office — he keeps a painting up there he stole from the Chelsea. Some painter lady's been crying over it for a year.",
          responses: [{ text: "Hang on.", end: true }],
        },
        free: {
          speaker: "Carmen Medina",
          text: "We're out! We're heading for the Vanguard. First song's for you.",
          responses: [{ text: "Go. Stay safe.", end: true }],
        },
      },
    });
    G.dialogue.register("pv_dlg_sam", {
      start: () => (PV.flag("met_sam") ? "again" : "hello"),
      nodes: {
        hello: {
          speaker: "Solitary Sam",
          onEnter: () => PV.setFlag("met_sam", true),
          text: "Shh. Shh. Don't open the door. I'm serving my time. Inmate 44-117, thirty days in the Hole for fighting in the yard. That was March 1967. By my count I have... six days left.",
          responses: [
            { text: "Sam, it's been twenty-two years.", next: "years" },
            { text: "What do you know about Maddox?", next: "maddox" },
            { text: "Goodbye.", end: true },
          ],
        },
        years: {
          speaker: "Solitary Sam",
          text: "That's what the raiders say too. But nobody signed my release. You don't just WALK out of the Hole. There's paperwork. Six more days. I'm a model prisoner.",
          responses: [{ text: "Fair enough.", next: "hello" }],
        },
        maddox: {
          speaker: "Solitary Sam",
          text: "The \"Warden.\" Hah. Real warden kept his safe combination on a sticky note. This one's worse: he TELLS people. One-two, seven, six-seven. Twelve-seven-sixty-seven. Never forgets it because it's his birthday. Tell him Sam says hello.",
          learn: LK.wsafe.id,
          responses: [
            {
              text: "(Remember the combination.)",
              learn: LK.wsafe.id,
              action: () => K.learn(LK.wsafe.id),
              end: true,
            },
          ],
        },
        again: {
          speaker: "Solitary Sam",
          text: "Five days left. Or six. The light doesn't change down here. Don't let the door hit you.",
          responses: [{ text: "Goodbye, Sam.", end: true }],
        },
      },
    });
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    // doors reflect saved state
    for (const d of cellDoors) {
      if (PV.flag("tombs_prisoners") === "freed") openDoor(d, true);
      else closeDoor(d);
    }
    if (PV.flag("tombs_courts_open")) K.lockUnlock(LK.courts.id);
    // the portrait on Maddox's desk (Chelsea quest)
    if (
      !PV.flag("portrait") &&
      !K.has("pv_q_portrait") &&
      !K.q.done("pv_last_portrait")
    ) {
      K.safe("portrait", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("pv_q_portrait", 1, v(A.portrait), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    }
    // prisoners (only while still caged)
    if (!PV.flag("tombs_prisoners")) {
      for (const p of PRISONERS) {
        PV.spawnActor(ctx, {
          id: p.id,
          type: "human",
          gender: p.gender,
          outfit: p.outfit,
          name: p.name,
          faction: "settlers",
          level: 3,
          essential: true,
          hostile: false,
          pos: v(A["prison" + p.cell]),
          yaw: -HP,
          ai: "static",
          home: "here",
          homeR: 0.5,
          dialogue: p.id === "pv_prisoner_rosa" ? "pv_dlg_rosa" : undefined,
          barks: [
            "Psst! Over here!",
            "Please... get us out.",
            "Maddox has the keys.",
          ],
        });
      }
    } else if (PV.flag("tombs_prisoners") === "freed") {
      moveFreedToVanguard(ctx);
    }
    // the warden and his crew
    if (!PV.flag("maddox_dead")) {
      PV.spawnActor(ctx, {
        id: "pv_tombs_maddox",
        type: "raider",
        outfit: "raider_heavy",
        name: "Warden Maddox",
        faction: "raiders",
        level: 9,
        hostile: true,
        hp: 280,
        dr: 16,
        aggroRange: 28,
        xp: 150,
        pos: v(A.boss),
        yaw: 0,
        ai: "guard",
        home: "here",
        homeR: 5,
        noRespawn: true,
        weapon: K.itemExists("combat_shotgun") ? "combat_shotgun" : undefined,
        inventory: K.stock([
          ["pv_key_tombs_cells", 1],
          ["ammo_12ga", 16],
          ["rally_tonic", 2],
          ["rush", 1],
        ]),
        loot: "raider_boss",
        barks: [
          "Visiting hours are OVER!",
          "You're gonna love the Hole!",
          "Nobody escapes the Tombs!",
        ],
        onDeath: () => PV.setFlag("maddox_dead", true),
      });
    }
    const crew = [
      ["pv_tombs_r1", A.raider1, "hunting_rifle"],
      ["pv_tombs_r2", A.raider2, "hunting_rifle"],
      ["pv_tombs_r3", A.raider3, "lead_pipe"],
      ["pv_tombs_r4", A.raider4, "smg_10mm"],
    ];
    // round 1b: one of the crew walks a beat between the mess hall and Block C (a guard patrol), the rest hold posts
    const O = ctx.O,
      beat = [
        [3, -50],
        [0, -47],
        [0, -41],
        [1, -31],
        [0, -41],
        [0, -47],
      ].map((q) => ({ x: O.x + q[0], z: O.z + q[1] }));
    for (const [id, p, w] of crew)
      PV.spawnActor(
        ctx,
        Object.assign(
          {
            id,
            type: "raider",
            faction: "raiders",
            level: 6,
            hostile: true,
            pos: v(p),
            ai: "guard",
            home: "here",
            homeR: 4,
            noRespawn: true,
            weapon: K.itemExists(w) ? w : undefined,
            loot: "raider",
          },
          id === "pv_tombs_r3" ? { ai: "patrol", patrol: beat, homeR: 12 } : {},
        ),
      );
    for (const [id, p] of [
      ["pv_tombs_s1", A.sentry1],
      ["pv_tombs_s2", A.sentry2],
    ])
      PV.spawnActor(ctx, {
        id,
        type: "raider",
        faction: "raiders",
        level: 5,
        hostile: true,
        pos: v(p),
        ai: "guard",
        home: "here",
        homeR: 3,
        noRespawn: true,
        weapon: K.itemExists("smg_10mm") ? "smg_10mm" : undefined,
        loot: "raider",
        name: "Tombs Gatekeeper",
        inventory:
          id === "pv_tombs_s1"
            ? K.stock([["pv_key_tombs_padlock", 1]])
            : undefined,
      });
    // Solitary Sam
    PV.spawnActor(ctx, {
      id: "pv_tombs_sam",
      type: "human",
      gender: "m",
      outfit: "survivor_layers",
      name: "Solitary Sam",
      faction: "settlers",
      level: 5,
      essential: true,
      hostile: false,
      pos: v(A.sam),
      yaw: -HP,
      ai: "static",
      home: "here",
      homeR: 0.5,
      dialogue: "pv_dlg_sam",
      voice: "settler",
      barks: ["Six days...", "Model prisoner. Model prisoner."],
    });
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  /**
   * Freed prisoners make their way to the Vanguard: once the player has left the Tombs (or on load) the Block C actors
   * are replaced by their settler selves in the Vanguard yard (stable ids *_vv), so Carmen can be found there in the same
   * session — before round 2 they only moved after a save/load and otherwise loitered at the Tombs' intake forever.
   */
  function moveFreedToVanguard(ctx) {
    ctx.prisonersMoved = true;
    const yard = PV.anchor("vanguard", "yard");
    if (!yard) return;
    PRISONERS.forEach((p, i) => {
      const old =
        !G.isStub("actors") && G.actors.get ? G.actors.get(p.id) : null;
      if (old && G.actors.remove)
        K.safe("rm prisoner", () => G.actors.remove(old));
      PV.spawnActor(ctx, {
        id: p.id + "_vv",
        type: "human",
        gender: p.gender,
        outfit: p.outfit,
        name: p.name,
        faction: "settlers",
        level: 3,
        pos: { x: yard.x + i * 1.5, y: 0, z: yard.z + 2 },
        ai: "wander",
        home: "here",
        homeR: 5,
        dialogue: p.id === "pv_prisoner_rosa" ? "pv_dlg_rosa" : undefined,
        barks: [p.bark, "Free air. Nothing like it."],
      });
    });
  }
  let ltT = 0;
  function update(dt, realDt, ctx) {
    // combat promotes one of the location's raiders to a generic 'Raider Boss'; Maddox is the Tombs' boss, so that one
    // becomes his turnkey (named lieutenant, keeps the combat buffs)
    ltT -= realDt || dt || 0;
    if (ctx.inside && ltT <= 0 && !G.isStub("actors") && G.actors.list) {
      ltT = 1;
      K.safe("tombs_lt", () => {
        for (const a of G.actors.list())
          if (
            a &&
            !a.dead &&
            a.name === "Raider Boss" &&
            a.pos &&
            Math.abs(a.pos.x - ctx.O.x) < 160 &&
            Math.abs(a.pos.z - ctx.O.z) < 160
          )
            a.name = "Turnkey Rourke";
      });
    }
    for (const d of cellDoors)
      if (d.open && d.t < 1) {
        d.t = Math.min(1, d.t + dt * 0.8);
        d.group.position.z = d.z0 - 1.1 * d.t;
      }
    // freed this session: they walk out while you're inside; by the time you're back on the street they're at the Vanguard
    if (
      !ctx.inside &&
      !ctx.prisonersMoved &&
      PV.flag("tombs_prisoners") === "freed"
    )
      K.safe("tombs_move", () => moveFreedToVanguard(ctx));
    // quest start when the player walks into Block C
    const p = G.player && G.player.pos;
    if (
      p &&
      ctx.inside &&
      !PV.flag("tombs_prisoners") &&
      !K.q.started("pv_jailbreak")
    ) {
      const lx = p.x - ctx.O.x,
        lz = p.z - ctx.O.z;
      if (lz < -14 && lz > -42 && Math.abs(lx) < 10 && p.y < ctx.O.y + 2)
        K.q.start("pv_jailbreak");
    }
  }

  PV.define({
    id: "tombs",
    name: "The Tombs",
    interior: "tombs",
    order: 50,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
    reset(ctx) {
      ctx.prisonersMoved = false;
    },
  });
})();
