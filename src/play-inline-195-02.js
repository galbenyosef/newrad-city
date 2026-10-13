// play-inline-195 02 — stone
// Lines 28-217 of readable/play-inline-195.pretty.js (statement-aligned).
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
