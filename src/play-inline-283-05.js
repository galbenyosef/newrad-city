// play-inline-283 05 — box
// Lines 711-1728 of readable/play-inline-283.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("lyceum_theatre");
    const S = P.site("ly_int", {
      ox: O.x,
      oy: O.y + LIFT,
      oz: O.z,
      lit: true,
      ambient: 0x6a5a48,
      ambI: 0.42,
      interiorKey: "lyceum_theatre",
      grime: 0.4,
    });
    const b = S.b;
    const r = P.rng("ly_int");

    // ================= LOBBY (x -12..12, z 20..30, double height 9) =================
    S.room({
      x0: -12,
      z0: 20,
      x1: 12,
      z1: 30,
      y: 0,
      h: 9,
      wall: "plaster_gilt",
      floor: "marble",
      ceil: "plaster_gilt",
      skip: "n",
      trim: "gilt",
      holes: { s: [[-1.5, 1.5, 0, 3.4]] },
      frame: "gilt",
      wallOpts: {},
    });
    // wainscot + pilasters
    for (const [x0, z0, x1, z1] of [
      [-11.85, 20.2, -11.7, 29.8],
      [11.7, 20.2, 11.85, 29.8],
      [-11.8, 29.7, -1.6, 29.85],
      [1.6, 29.7, 11.8, 29.85],
    ])
      b.box("wood_oak", x0, 0, z0, x1, 1.3, z1, { seg: false });
    for (const x of [-9, -5, 5, 9]) {
      b.box("marble_green", x - 0.35, 0, 29.55, x + 0.35, 8.6, 29.85, {
        segLen: 3,
      });
      b.box("gilt", x - 0.45, 8.2, 29.5, x + 0.45, 8.7, 29.85, { seg: false });
    }
    // north wall of the lobby (z=20) = back of the auditorium: 3 doorways (x -7,0,7) at orchestra level + 3 at mezzanine level
    S.wallX(
      "plaster_gilt",
      20,
      -12.15,
      12.15,
      0,
      9,
      0.4,
      [
        [-8.2, -5.8, 0, 3.0],
        [-1.2, 1.2, 0, 3.0],
        [5.8, 8.2, 0, 3.0],
        [-6, -4, Y_BAL - 0, Y_BAL + 2.4],
        [4, 6, Y_BAL, Y_BAL + 2.4],
      ],
      { frame: "gilt" },
    );
    // mezzanine gallery along the north side (z 20..23.6, y 4.5) with gilt balustrade, west stair up
    S.floor("parquet", -12, 20, 12, 23.6, Y_BAL, { under: "plaster_gilt" });
    S.rail(
      "gilt",
      [
        [-9.6, 23.55],
        [11.8, 23.55],
      ],
      Y_BAL,
      1.0,
      { baluster: true, step: 0.35 },
    );
    S.stairs("marble", -10.8, 28.73, "n", 2.2, 0, Y_BAL, {
      rail: "gilt",
      railSides: [1],
      nosing: "gilt",
      solid: false,
      soffit: "plaster_gilt",
      run: 0.27,
    });
    {
      const n = Math.ceil(Y_BAL / 0.24),
        rise = Y_BAL / n;
      for (let i = 0; i < n; i++)
        b.box(
          "carpet_red",
          -11.5,
          (i + 1) * rise,
          28.73 - (i + 1) * 0.27,
          -10.1,
          (i + 1) * rise + 0.02,
          28.73 - i * 0.27,
          { seg: false, noAO: true },
        );
    }
    S.anchor("mezzanine", 0, Y_BAL, 21.8, 0);
    // moulded panels (upper storey + east wall), frieze band
    P.wallPanels(b, "gilt", "z", 11.85, 20.6, 25.2, 1.5, 2.8, -1, {
      w: 1.4,
      gap: 0.4,
      fill: "plaster_rose",
    });
    P.wallPanels(b, "gilt", "z", 11.85, 20.6, 29.4, 4.9, 3.2, -1, {
      w: 1.6,
      gap: 0.5,
      fill: "plaster_rose",
    });
    P.wallPanels(b, "gilt", "z", -11.85, 20.6, 29.4, 4.9, 3.2, 1, {
      w: 1.6,
      gap: 0.5,
      fill: "plaster_rose",
    });
    P.wallPanels(b, "gilt", "x", 29.85, -8.6, -5.4, 4.9, 3.2, -1, {
      w: 1.4,
      gap: 0.3,
      fill: "plaster_rose",
    });
    P.wallPanels(b, "gilt", "x", 29.85, 5.4, 8.6, 4.9, 3.2, -1, {
      w: 1.4,
      gap: 0.3,
      fill: "plaster_rose",
    });
    for (const [x0, z0, x1, z1] of [
      [-11.85, 20.2, -11.7, 29.8],
      [11.7, 20.2, 11.85, 29.8],
      [-11.9, 29.65, 11.9, 29.85],
    ])
      b.box("gilt", x0, 8.3, z0, x1, 8.6, z1, { seg: false });
    const lyN = P.texMat(
      "ly_lobbyname",
      P.signTex("ly_lobbyname", ["THE LYCEUM PLAYERS"], "gilt", 1024, 128),
      { rough: 0.5, emissive: 0.1 },
    );
    b.quad(lyN, 0, 7.1, 20.22, 7, 0.9, { ry: 0 });
    // chandelier (lit — the troupe keeps a generator)
    D.chandelier(S, 0, 7.6, 26.5, 1.3, {
      tiers: 3,
      chain: 1.2,
      li: 1.15,
      lr: 13,
    });
    D.rug(b, -3, 20.5, 3, 29.5, 0.01, "carpet_red");
    // Mortimer's bar (east side), bottle shelves on the east wall
    D.bar(b, 6.2, 11.2, 0, 26.2, 29.6, {
      wood: "wood_oak",
      top: "marble_dark",
    });
    S.col(6.2, 0, 25.6, 11.2, 1.12, 26.2, { walkable: false });
    for (let k = 0; k < 4; k++)
      D.chair(b, 6.8 + k * 1.3, 0, 25.2, PI + (r() - 0.5) * 0.4, {
        seat: "seat_red",
        wood: "chrome",
      });
    const barS = P.texMat(
      "ly_barsign",
      P.signTex(
        "ly_barsign",
        ["MORTIMER'S", "Refreshments · Intermission Specials"],
        "neon",
        512,
        128,
        { fg: "#ffb060" },
      ),
      { emissive: 0.9 },
    );
    b.quad(barS, 8.7, 3.8, 29.8, 3.4, 0.85, { ry: PI });
    S.light(8.7, 2.6, 27.5, 0xffc080, 7, 0.8);
    S.glow(8.7, 3.8, 29.6, 0xffb060, 2.0);
    S.anchor("bartender", 8.7, 0, 27.3, 0);
    S.container("Bar Cooler", 10.6, 0, 27.4, {
      loot: "drinks",
      kind: "cooler",
      owner: "settlers",
    });
    // lounge: sofas + café tables (west)
    D.sofa(b, -7.5, 0, 22, PI, { fabric: "velvet", w: 2.2 });
    D.sofa(b, -9.6, 0, 25, HP, { fabric: "velvet", w: 2.0 });
    D.table(b, -7.2, 0, 24.6, { r: 0.5, top: "marble" });
    D.candles(S, -7.2, 0.75, 24.6, 3, {});
    // box office window turned trading desk: "TICKETS 5 SCRIP"
    b.box("wood_oak", -4, 0, 28.6, -1.9, 1.1, 29.6);
    b.box("marble_dark", -4.1, 1.1, 28.5, -1.8, 1.16, 29.65, { seg: false });
    S.col(-4, 0, 28.5, -1.9, 1.16, 29.6, { walkable: false });
    const tk = P.texMat(
      "ly_tickets",
      P.signTex(
        "ly_tickets",
        ["TICKETS", "5 SCRIP · children & seniors free"],
        "label",
        384,
        160,
      ),
      { rough: 0.9 },
    );
    b.quad(tk, -2.95, 1.6, 28.48, 1.2, 0.5, { ry: PI });
    S.anchor("usher", 2.6, 0, 28.6, PI);
    // posters + portraits of the company
    for (let i = 0; i < 3; i++) {
      const pk = P.texMat("ly_poster" + i, playPoster(i), { rough: 0.9 });
      if (i < 2) b.quad(pk, i ? 7 : -7, 2.1, 29.78, 1.1, 1.65, { ry: PI });
      else b.quad(pk, -11.78, 2.1, 21.2, 1.1, 1.65, { ry: HP });
    }
    for (let i = 0; i < 3; i++)
      D.painting(b, 11.78, 5.8, 22.5 + i * 2.5, 1.3, 1.7, -HP, [1, 3, 5][i]);
    D.sconce(S, -11.75, 2.6, 27.5, HP, {});
    D.sconce(S, 11.75, 5.5, 29.2, -HP, {});
    for (const x of [-6, 6]) D.sconce(S, x, 6.3, 20.25, 0, {});

    // ================= AUDITORIUM (x -13..13, z -8..20; ceiling 13) =================
    S.wallZ("plaster_gilt", -13, -8, 20, Y_ORCH, 13, 0.5, [], {
      ground: Y_ORCH,
    });
    S.wallZ("plaster_gilt", 13, -8, 20, Y_ORCH, 13, 0.5, [], {
      ground: Y_ORCH,
    });
    S.wallX("plaster_gilt", 20, -13, 13, 9, 13, 0.4, []);
    S.wallX("plaster_gilt", 20, -13, -12, 0, 9, 0.4, []);
    S.wallX("plaster_gilt", 20, 12, 13, 0, 9, 0.4, []);
    S.wallX("plaster_gilt", 20, -13, 13, Y_ORCH, 0, 0.4, []);
    S.floor("carpet_red", -13, 17, 13, 20, 0, { surface: "carpet", t: 0.4 });
    // rows z 17 → 1 descending (seats face north = -z → ry PI)
    const NR = 15;
    for (let i = 0; i < NR; i++) {
      const za = 16 - i,
        zb = 17 - i,
        y = -0.12 * (i + 1);
      b.box("carpet_red", -13, Y_ORCH - 0.3, za, 13, y, zb, {
        segLen: 2.5,
        ground: y,
      });
      S.col(-13, Y_ORCH - 0.3, za, 13, y, zb, { surface: "carpet" });
      for (const [x0, x1] of [
        [-12.3, -5.2],
        [-3.6, 3.6],
        [5.2, 12.3],
      ])
        K.seatLine(b, x0, za + 0.5, x1, za + 0.5, y, PI, {
          missing: 0.06,
          seat: "seat_red",
          skip: (x, z) => x < -10.8 && z < 5.2,
        });
    }
    S.floor("carpet_red", -13, -2, 13, 2, Y_ORCH, { surface: "carpet" });
    // orchestra rail
    b.box("wood_oak", -8, Y_ORCH, -2.15, 8, Y_ORCH + 0.9, -1.95, {
      seg: false,
    });
    b.box("gilt", -8, Y_ORCH + 0.9, -2.2, 8, Y_ORCH + 0.98, -1.9, {
      seg: false,
    });
    S.col(-8, Y_ORCH, -2.2, 8, Y_ORCH + 0.98, -1.9, { walkable: false });
    // stage apron (z -8..-2) + steps at the sides
    S.floor("wood", -8, -8, 8, -2.2, Y_STAGE, { surface: "wood", t: 1.1 });
    b.box("wood_oak", -8, Y_ORCH, -2.25, 8, Y_STAGE - 0.02, -2.18, {
      seg: false,
    });
    for (let x = -7.5; x <= 7.5; x += 0.75) {
      b.cyl("bulb", x, Y_STAGE, -2.45, 0.07, 0.09, 0.08, 8, {
        noAO: true,
        noBake: true,
      });
      b.box("iron", x - 0.14, Y_STAGE, -2.4, x + 0.14, Y_STAGE + 0.14, -2.3, {
        seg: false,
      });
    }
    S.light(0, Y_STAGE + 0.6, -3, 0xffd8a0, 9, 0.9);
    for (const s of [-1, 1])
      S.stairs("wood", s * 9.4, -0.7, "n", 2.0, Y_ORCH, Y_STAGE, { run: 0.3 });
    S.floor("wood", -13, -8, -8, -2.2, Y_STAGE, { surface: "wood", t: 1.1 });
    S.floor("wood", 8, -8, 13, -2.2, Y_STAGE, { surface: "wood", t: 1.1 });
    // gilded walls: pilasters, arched panels, sconces
    for (const s of [-1, 1]) {
      const xw = s * 12.75;
      for (let z = 3; z <= 19; z += 4) {
        b.box("gilt", xw - s * 0.3, Y_ORCH, z - 0.3, xw, 12.5, z + 0.3, {
          segLen: 3,
          ground: Y_ORCH,
        });
      }
      for (let z = 5; z <= 17; z += 4) {
        b.box("plaster_red", xw - s * 0.06, 1.4, z - 1.5, xw, 7.8, z + 1.5, {
          seg: false,
          noAO: true,
        });
        b.torus("gilt", xw - s * 0.08, 7.8, z, 1.5, 0.1, PI, {
          ry: HP,
          ts: 12,
          rs: 4,
          noAO: true,
        });
        D.sconce(S, xw - s * 0.05, 3.2, z, s > 0 ? -HP : HP, { r: 7, i: 0.75 });
        if (z === 9) {
          const pk = P.texMat(
            "ly_mural" + (s > 0 ? 1 : 0),
            P.signTex(
              "ly_mural" + s,
              s > 0 ? ["MELPOMENE"] : ["THALIA"],
              "gilt",
              256,
              64,
            ),
            { rough: 0.5 },
          );
          b.quad(pk, xw - s * 0.09, 8.7, z, 2.2, 0.55, {
            ry: s > 0 ? -HP : HP,
          });
        }
      }
    }
    // coffered, gilded ceiling with the central dome + big chandelier
    S.ceil("plaster_gilt", -13, -8, 13, 20, 13);
    for (let x = -12; x <= 12; x += 4)
      b.box("gilt", x - 0.15, 12.3, -8, x + 0.15, 12.93, 20, {
        seg: false,
        noAO: true,
      });
    for (let z = -6; z <= 18; z += 4)
      b.box("gilt", -13, 12.4, z - 0.15, 13, 12.93, z + 0.15, {
        seg: false,
        noAO: true,
      });
    b.inside(
      "plaster_blue",
      new THREE.SphereGeometry(4.5, 20, 8, 0, TAU, 0, HP),
      P.m4(0, 11.2, 7, 0, 0, 0, 1, 0.4, 1),
      {},
    );
    b.torus("gilt", 0, 11.25, 7, 4.5, 0.18, TAU, { rx: HP, ts: 32, rs: 5 });
    D.chandelier(S, 0, 10.2, 7, 1.8, { tiers: 3, chain: 1.6, li: 1.1, lr: 16 });
    // proscenium (z -8): opening x -8..8, y -0.8..8; gilt frame, crest, house curtain (tied back), valance
    S.wallX(
      "plaster_gilt",
      -8,
      -13,
      13,
      Y_ORCH,
      13,
      0.8,
      [[-8, 8, Y_STAGE - Y_ORCH, 8 - Y_ORCH]],
      { ground: Y_ORCH },
    );
    b.box("gilt", -8.6, Y_STAGE, -7.55, -8.0, 8.6, -7.35, { seg: false });
    b.box("gilt", 8.0, Y_STAGE, -7.55, 8.6, 8.6, -7.35, { seg: false });
    b.box("gilt", -8.6, 8.0, -7.55, 8.6, 8.7, -7.35, { seg: false });
    b.cyl("gilt", 0, 9.9, -7.45, 1.1, 1.1, 0.25, 16, { rx: HP, noAO: true });
    const crest = P.texMat(
      "ly_crest",
      P.signTex("ly_crest", ["LP"], "gilt", 256, 256),
      { rough: 0.5 },
    );
    b.quad(crest, 0, 9.9, -7.28, 1.6, 1.6, { ry: 0 });
    for (const s of [-1, 1]) {
      const g = new THREE.PlaneGeometry(2.4, 8.7, 8, 1);
      const p = g.attributes.position;
      for (let v = 0; v < p.count; v++) {
        const yv = p.getY(v);
        p.setX(
          v,
          p.getX(v) * (0.35 + 0.65 * Math.min(1, Math.abs(yv - 0.6) / 4.35)),
        );
        p.setZ(v, Math.sin(p.getX(v) * 4) * 0.12);
      }
      b.geo("curtain", g, P.m4(s * 7.0, Y_STAGE + 4.35, -7.9), {
        uv: "box",
        noAO: true,
      });
      b.torus("gilt", s * 7.0, Y_STAGE + 3.6, -7.8, 0.35, 0.04, TAU, {
        ts: 10,
        rs: 3,
      });
    }
    b.box("curtain", -8, 7.1, -8.2, 8, 8.0, -7.95, { seg: false });
    for (let x = -7.8; x <= 7.8; x += 0.6)
      b.sphere("gilt", x, 7.05, -7.95, 0.06, { ws: 4, hs: 3, noAO: true });
    // stage boxes (two tiers each side; the lower west box is reachable by a small stair)
    for (const s of [-1, 1])
      for (const [yb, reach] of [
        [Y_BOX, s < 0],
        [Y_BOX + 2.6, false],
      ]) {
        const xin = s * 10.3,
          xo = s * 12.8;
        const x0 = Math.min(xin, xo),
          x1 = Math.max(xin, xo);
        b.box("carpet_red", x0, yb - 0.35, -6.8, x1, yb, -1.2, { seg: false });
        S.col(x0, yb - 0.35, -6.8, x1, yb, -1.2, { surface: "carpet" });
        // curved gilt parapet (segments)
        for (let k = 0; k < 6; k++) {
          const z0 = -6.8 + k * 0.93,
            z1 = z0 + 0.93,
            bulge = Math.sin(((k + 0.5) / 6) * PI) * 0.45;
          b.box(
            "plaster_gilt",
            xin - s * 0.12 - s * bulge - 0.12,
            yb - 0.9,
            z0,
            xin - s * 0.12 - s * bulge + 0.12,
            yb + 0.95,
            z1,
            { seg: false },
          );
          b.box(
            "gilt",
            xin - s * 0.12 - s * bulge - 0.16,
            yb + 0.95,
            z0,
            xin - s * 0.12 - s * bulge + 0.16,
            yb + 1.03,
            z1,
            { seg: false },
          );
          if (k % 2 === 0)
            b.sphere(
              "lamp_dim",
              xin - s * bulge - s * 0.28,
              yb - 0.6,
              (z0 + z1) / 2,
              0.08,
              { ws: 5, hs: 4, noAO: true },
            );
        }
        S.col(
          xin - s * 0.6 - 0.2,
          yb,
          -6.8,
          xin - s * 0.6 + 0.2,
          yb + 1.05,
          -1.2,
          { walkable: false },
        );
        b.box(
          "curtain",
          xo - s * 0.1 - 0.05,
          yb,
          -6.8,
          xo - s * 0.1 + 0.05,
          yb + 2.3,
          -5.9,
          { seg: false },
        );
        b.box(
          "gilt",
          xin - s * 0.3 - 0.1,
          yb + 2.2,
          -6.9,
          xin - s * 0.3 + 0.1,
          yb + 2.45,
          -1.1,
          { seg: false },
        );
        for (let k = 0; k < 3; k++)
          D.chair(
            b,
            (xin + xo) / 2 + s * 0.3,
            yb,
            -5.6 + k * 1.5,
            s > 0 ? -HP : HP,
            { seat: "velvet", wood: "gilt" },
          );
        S.light((xin + xo) / 2, yb + 1.2, -4, 0xffd8a0, 4.5, 0.5);
        void reach;
      }
    // stair up to the lower west box from the side aisle (x -12.6..-11, climbing north)
    S.stairs("wood_dark", -11.75, 4.2, "n", 1.4, -1.56, Y_BOX, {
      rail: "gilt",
      railSides: [1],
    });
    S.anchor("box", -11.6, Y_BOX, -3.5, HP);
    S.prop("skeleton", -11.6, Y_BOX, -2.3, HP, {
      pose: "seated",
      parent: S.root,
    });
    S.pickup("pt_note_ly_critic", 1, -11.1, Y_BOX + 0.02, -3.0);

    // ================= BALCONY (z 11.5..20, aisle at 4.5, rows down to the front) =================
    S.floor("carpet_red", -13, 18.5, 13, 20, Y_BAL, { surface: "carpet" });
    for (let j = 0; j < 7; j++) {
      const za = 17.5 - j,
        zb = 18.5 - j,
        y = Y_BAL - 0.2 * (j + 1);
      b.box("carpet_red", -12.75, 2.6, za, 12.75, y, zb, {
        segLen: 2.5,
        ground: y,
      });
      S.col(-12.75, 2.6, za, 12.75, y, zb, { surface: "carpet" });
      for (const [x0, x1] of [
        [-12.2, -1.0],
        [1.0, 12.2],
      ])
        K.seatLine(b, x0, za + 0.5, x1, za + 0.5, y, PI, {
          missing: 0.08,
          seat: "seat_red",
        });
    }
    b.box("plaster_gilt", -12.75, 2.45, 11.5, 12.75, 2.62, 20, { noAO: true });
    b.box("plaster_gilt", -12.75, 2.45, 11.3, 12.75, 4.1, 11.6, { segLen: 2 });
    b.box("gilt", -12.75, 4.05, 11.2, 12.75, 4.15, 11.7, { seg: false });
    S.col(-12.75, 2.45, 11.3, 12.75, 4.1, 11.6, { walkable: false });
    for (let x = -11; x <= 11; x += 2.75)
      b.sphere("lamp_dim", x, 2.3, 11.25, 0.09, { ws: 5, hs: 4, noAO: true });
    S.light(0, 1.8, 11, 0xffd8a0, 8, 0.5);
    S.anchor("balcony", 0, Y_BAL, 19.2, 0);

    // ================= STAGE (x -13..13, z -22..-8, y -0.8) =================
    S.floor("wood", -13, -22, 13, -8, Y_STAGE, { surface: "wood", t: 1.1 });
    S.wallX(
      "brick_red",
      -22,
      -13,
      13,
      Y_STAGE,
      17,
      0.5,
      [
        [-12.6, -10.4, 0, 3.0],
        [10.4, 12.6, 0, 3.0],
      ],
      { frame: "wood_dark" },
    );
    S.wallZ("brick_red", -13, -22, -8, Y_STAGE, 17, 0.5, []);
    S.wallZ("brick_red", 13, -22, -8, Y_STAGE, 17, 0.5, []);
    S.ceil("concrete_dark", -13, -22, 13, -8, 17);
    // "OUR GLOWING TOWN": painted backdrop (small town under a green glowing sky), picket fence, two ladders, porch, lamp post, cardboard moon
    const bdrop = P.texMat(
      "ly_backdrop",
      P.canvasTex("pt_ly_backdrop", 1024, 512, (ctx, w, h) => {
        const rr = P.rng("lybd");
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#0e2a14");
        g.addColorStop(0.5, "#3a8a3a");
        g.addColorStop(0.72, "#b8f07a");
        g.addColorStop(1, "#4a6a2a");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        // a mushroom cloud on the horizon, painted politely
        ctx.fillStyle = "rgba(230,255,190,0.55)";
        ctx.fillRect(w * 0.7, h * 0.35, 26, h * 0.35);
        ctx.beginPath();
        ctx.ellipse(w * 0.7 + 13, h * 0.32, 90, 50, 0, 0, TAU);
        ctx.fill();
        // houses
        for (let i = 0; i < 9; i++) {
          const x = 30 + i * 110 + rr() * 20,
            hw = 70 + rr() * 20,
            hh = 60 + rr() * 30,
            base = h * 0.82;
          ctx.fillStyle = ["#e8d8b0", "#c8b890", "#d8c0a0", "#b8c8a8"][i % 4];
          ctx.fillRect(x, base - hh, hw, hh);
          ctx.fillStyle = "#6a2a1a";
          ctx.beginPath();
          ctx.moveTo(x - 8, base - hh);
          ctx.lineTo(x + hw / 2, base - hh - 40);
          ctx.lineTo(x + hw + 8, base - hh);
          ctx.fill();
          ctx.fillStyle = rr() < 0.6 ? "#ffe890" : "#2a3a2a";
          ctx.fillRect(x + 12, base - hh + 18, 16, 18);
          ctx.fillRect(x + hw - 28, base - hh + 18, 16, 18);
          ctx.fillStyle = "#3a2a1a";
          ctx.fillRect(x + hw / 2 - 8, base - 28, 16, 28);
        }
        ctx.fillStyle = "#e8e0c8";
        for (let x = 0; x < w; x += 16) ctx.fillRect(x, h * 0.84, 6, 34);
        ctx.fillStyle = "#e8e0c8";
        ctx.fillRect(0, h * 0.86, w, 5);
        P.blotches(ctx, w, h, rr, 40, 0.3);
      }),
      { emissive: 0.35 },
    );
    b.quad(bdrop, 0, Y_STAGE + 4.6, -21.6, 19.5, 9.8, { ry: 0 });
    for (const s of [-1, 1])
      b.box(
        "curtain",
        s * 9.9 - 0.3,
        Y_STAGE,
        -21.5,
        s * 9.9 + 0.3,
        Y_STAGE + 9.8,
        -21.2,
        { seg: false },
      ); // legs framing the drop
    // set pieces
    for (let x = -7; x <= 7; x += 0.36)
      b.box(
        "paint_white",
        x - 0.05,
        Y_STAGE,
        -15.6,
        x + 0.05,
        Y_STAGE + 0.95,
        -15.55,
        { seg: false, noAO: true },
      );
    b.box("paint_white", -7, Y_STAGE + 0.7, -15.65, 7, Y_STAGE + 0.8, -15.5, {
      seg: false,
    });
    for (const s of [-1, 1]) {
      // the two ladders (the Webb and Gibbs houses, as it were)
      const x = s * 4.5;
      for (const t of [-0.3, 0.3])
        b.box(
          "wood",
          x + t - 0.04,
          Y_STAGE,
          -12.2,
          x + t + 0.04,
          Y_STAGE + 3.6,
          -12.1,
          { rx: -0.12, seg: false },
        );
      for (let k = 0; k < 10; k++)
        b.box(
          "wood",
          x - 0.3,
          Y_STAGE + 0.3 + k * 0.33,
          -12.15 + k * 0.04,
          x + 0.3,
          Y_STAGE + 0.34 + k * 0.33,
          -12.08 + k * 0.04,
          { seg: false },
        );
    }
    D.table(b, -2, Y_STAGE, -11, {
      rect: [1.6, 0.9],
      top: "wood",
      leg: "wood_dark",
      h: 0.76,
    });
    D.chair(b, -2.9, Y_STAGE, -11, HP, { seat: "wood", wood: "wood" });
    D.chair(b, -1.1, Y_STAGE, -11, -HP, { seat: "wood", wood: "wood" });
    b.cyl("iron", 6.5, Y_STAGE, -13.5, 0.06, 0.1, 3.4, 8);
    b.sphere("bulb", 6.5, Y_STAGE + 3.5, -13.5, 0.2, {
      noAO: true,
      noBake: true,
    });
    S.light(6.5, Y_STAGE + 3.2, -13, 0xfff0c0, 6, 0.8);
    b.cyl("neon_green", -7.5, Y_STAGE + 7.5, -20.8, 1.0, 1.0, 0.08, 20, {
      rx: HP,
      noAO: true,
    }); // the glowing moon
    S.glow(-7.5, Y_STAGE + 7.5, -20.6, 0xb8ffa0, 3.4);
    // stage lighting: battens with lit lanterns (warm) + a follow-spot from the balcony
    for (const z of [-10, -14, -18])
      K.batten(b, [-9, z], [9, z], 8.5, {
        lit: true,
        litFrac: 0.6,
        ry: 0,
        lineH: 8,
      });
    S.light(0, 6.5, -12, 0xffe4b8, 13, 1.2);
    S.light(-5, 3.5, -12, 0xffd0a0, 7, 0.7);
    S.light(5, 3.5, -12, 0xd0ffd0, 7, 0.6);
    S.glow(0, 8.1, -10, 0xfff0d0, 2.6);
    S.glow(0, 8.1, -14, 0xfff0d0, 2.2);
    K.lantern(b, 0, 6.2, 17.8, PI, 0.35, { lit: true });
    S.glow(0, 6.2, 17.5, 0xfff4d8, 1.4);
    // fly gallery (east side, y 5.4): catwalk, pin rail with ropes & sandbags, reached by a ladder-stair
    S.floor("steel", 10.8, -21.6, 12.7, -8.6, Y_FLY, {
      surface: "metal",
      t: 0.15,
      under: "steel",
    });
    S.rail(
      "iron",
      [
        [10.8, -21.6],
        [10.8, -15.9],
      ],
      Y_FLY,
      1.0,
      {},
    );
    S.rail(
      "iron",
      [
        [10.8, -8.6],
        [10.8, -9.2],
      ],
      Y_FLY,
      1.0,
      {},
    );
    b.box("wood_dark", 12.2, Y_FLY + 0.8, -21.5, 12.6, Y_FLY + 1.0, -8.7, {
      seg: false,
    });
    for (let z = -21; z < -9; z += 0.3)
      b.rod(
        "fabric",
        [12.4, Y_FLY + 1.0, z],
        [12.4, 16.8, z + 0.02],
        0.012,
        3,
        { noAO: true },
      );
    for (let z = -20; z < -10; z += 1.5)
      b.cyl(
        "fabric",
        12.0,
        Y_FLY + 1.2 + (z % 3 === 0 ? 1.5 : 0.4),
        z,
        0.2,
        0.25,
        0.5,
        8,
        { c: 0xa89878 },
      );
    S.stairs("steel", 9.85, -9.0, "n", 1.7, Y_STAGE, Y_FLY, {
      run: 0.26,
      rail: "iron",
      railSides: [-1],
      surface: "metal",
      solid: false,
    });
    S.floor("steel", 9.0, -16.3, 10.8, -15.6, Y_FLY, {
      surface: "metal",
      t: 0.15,
      under: "steel",
    });
    S.anchor("fly_gallery", 11.7, Y_FLY, -19, 0);
    S.pickup("pt_reel_ly_ghostlight", 1, 11.9, Y_FLY + 0.02, -20.6);
    S.container("Rigger's Footlocker", 12.0, Y_FLY, -15.5, {
      loot: "toolbox",
      kind: "footlocker",
      owner: "settlers",
    });
    // the ghost light (a single bare bulb on a stand — always left burning)
    b.cyl("iron", -9, Y_STAGE, -9.5, 0.2, 0.25, 0.05, 10);
    b.cyl("iron", -9, Y_STAGE, -9.5, 0.025, 0.025, 1.8, 6);
    b.sphere("bulb", -9, Y_STAGE + 1.95, -9.5, 0.12, {
      noAO: true,
      noBake: true,
    });
    for (let k = 0; k < 4; k++)
      b.rod(
        "iron",
        [-9, Y_STAGE + 1.95 - 0.15, -9.5],
        [
          -9 + Math.cos(k * HP) * 0.15,
          Y_STAGE + 2.1,
          -9.5 + Math.sin(k * HP) * 0.15,
        ],
        0.006,
        3,
      );
    S.light(-9, Y_STAGE + 1.9, -9.5, 0xfff0d0, 5, 0.8);
    S.glow(-9, Y_STAGE + 1.95, -9.5, 0xfff4e0, 0.9);
    S.anchor("ghost_light", -9, Y_STAGE, -9.5, 0);
    S.anchor("stage_c", 0, Y_STAGE, -11.5, PI);
    S.anchor("stage_l", -4.5, Y_STAGE, -13, PI + 0.4);
    S.anchor("stage_r", 4.5, Y_STAGE, -13, PI - 0.4);
    S.anchor("director", -3.5, Y_ORCH, 0.6, PI);
    S.anchor("seat", 0, -1.8 + 0.12 * 0, 1.5, PI);

    // ================= BACKSTAGE (z -34..-22, y -0.8) =================
    const YB = Y_STAGE,
      BH = 3.6;
    S.floor("wood_rotten", -13, -34, 13, -22, YB, { surface: "wood" });
    S.ceil("concrete_dark", -13, -34, 13, -22, YB + BH);
    S.wallX("brick_red", -34, -13.25, 13.25, YB, YB + BH, 0.5, []);
    S.wallZ("brick_red", -13, -34, -22, YB, YB + BH, 0.5, []);
    S.wallZ("brick_red", 13, -34, -22, YB, YB + BH, 0.5, []);
    // partitions: green room (x -13..-2), director's office (x -2..5), prop room (x 5..13); corridor z -25..-22
    S.wallX(
      "plaster_green",
      -25,
      -13,
      13,
      YB,
      YB + BH,
      0.2,
      [
        [-7.5, -6, 0, 2.3],
        [0.6, 2.0, 0, 2.3],
        [8.4, 9.8, 0, 2.3],
      ],
      { frame: "wood_dark" },
    );
    S.wallZ("plaster_green", -2, -34, -25, YB, YB + BH, 0.2, []);
    S.wallZ("plaster_green", 5, -34, -25, YB, YB + BH, 0.2, []);
    for (const x of [-10, -2, 6, 11]) {
      b.sphere(x === 6 ? "glass_dark" : "bulb", x, YB + BH - 0.3, -23.5, 0.08, {
        ws: 5,
        hs: 4,
        noAO: true,
        noBake: true,
      });
      if (x !== 6) S.light(x, YB + BH - 0.5, -23.5, 0xffe0a8, 5, 0.7);
    }
    const call = P.texMat(
      "ly_call",
      P.signTex(
        "ly_call",
        [
          "CALL BOARD",
          "OUR GLOWING TOWN — Act II rehearsal",
          "HALF HOUR at the bell.",
          "Whoever took the prompt book:",
          "bring it back. — B.T.",
        ],
        "label",
        384,
        320,
      ),
      { rough: 0.9 },
    );
    b.quad(call, 3.6, YB + 1.5, -24.88, 1.2, 1.0, { ry: 0 });
    // green room: bunks, stove, costume racks, communal table, Tess's trading counter, Rosalind's makeup chair
    for (let k = 0; k < 2; k++) {
      const x = -12.2,
        z = -33.2 + k * 2.6;
      b.box("iron", x - 0.5, YB, z - 0.05, x + 0.5, YB + 1.9, z + 2.05, {
        seg: false,
      });
      for (const yy of [0.45, 1.45]) {
        b.box(
          "mattress",
          x - 0.45,
          YB + yy,
          z,
          x + 0.45,
          YB + yy + 0.18,
          z + 2.0,
          { seg: false, grime: 0.6 },
        );
      }
      S.col(x - 0.5, YB, z - 0.05, x + 0.5, YB + 1.9, z + 2.05, {
        walkable: false,
      });
    }
    b.box("iron", -9.8, YB, -33.6, -8.6, YB + 0.9, -32.8);
    b.cyl("rust", -9.2, YB + 0.9, -33.2, 0.1, 0.1, 2.8, 6);
    b.box("fire", -9.6, YB + 0.3, -32.79, -8.8, YB + 0.6, -32.76, {
      seg: false,
    });
    S.light(-9.2, YB + 0.6, -32.4, 0xff8a40, 4.5, 0.9);
    S.glow(-9.2, YB + 0.5, -32.6, 0xff8a40, 0.8);
    S.col(-9.8, YB, -33.6, -8.6, YB + 0.9, -32.8, { walkable: false });
    D.table(b, -7, YB, -29.5, {
      rect: [2.4, 1.1],
      top: "wood",
      leg: "wood_dark",
    });
    for (const [dx, dz, ry] of [
      [-0.8, -0.9, 0],
      [0.8, -0.9, 0],
      [-0.8, 0.9, PI],
      [0.8, 0.9, PI],
    ])
      D.chair(b, -7 + dx, YB, -29.5 + dz, ry, { seat: "wood" });
    D.candles(S, -7, YB + 0.75, -29.5, 4, {});
    // string of bulbs zig-zagging over the green room + a hanging work lamp over Tess's counter
    for (let k = 0; k < 16; k++) {
      const t = k / 15,
        x = -12.4 + t * 10,
        z = -26.2 - Math.abs(Math.sin(t * PI * 3)) * 6.5;
      b.sphere(
        k % 5 === 3
          ? "glass_dark"
          : ["bulb", "neon_yellow", "neon_red", "neon_green"][k % 4],
        x,
        YB + BH - 0.35 - Math.sin(t * PI * 6) * 0.15,
        z,
        0.06,
        { ws: 5, hs: 4, noAO: true, noBake: true },
      );
    }
    S.light(-7.5, YB + 2.6, -29, 0xffd8a0, 9, 1.0);
    S.glow(-7.5, YB + BH - 0.4, -29, 0xffe0b0, 1.6);
    b.rod("iron", [-4, YB + BH, -30.5], [-4, YB + 2.6, -30.5], 0.01, 3);
    b.cyl("iron", -4, YB + 2.45, -30.5, 0.08, 0.3, 0.18, 10, { open: true });
    b.sphere("bulb", -4, YB + 2.45, -30.5, 0.07, { noAO: true, noBake: true });
    S.light(-4, YB + 2.2, -30, 0xffe8c0, 6, 0.9);
    S.glow(-4, YB + 2.4, -30.5, 0xffe8c0, 0.9);
    S.light(9, YB + 2.8, -29.5, 0xffe0b0, 7, 0.7);
    S.col(-8.2, YB, -30.05, -5.8, YB + 0.76, -28.95, { walkable: false });
    b.rod("chrome", [-12.6, YB + 1.9, -26], [-12.6, YB + 1.9, -25.4], 0.02, 4);
    // Tess's counter (east end of the green room)
    b.box("wood", -5.6, YB, -28.2, -2.4, YB + 1.05, -27.6);
    b.box("wood_oak", -5.7, YB + 1.05, -28.3, -2.3, YB + 1.12, -27.5, {
      seg: false,
    });
    S.col(-5.6, YB, -28.3, -2.4, YB + 1.12, -27.6, { walkable: false });
    for (let k = 0; k < 3; k++)
      b.box(
        "wood",
        -5.6,
        YB + 0.6 + k * 0.6,
        -33.8,
        -2.4,
        YB + 0.64 + k * 0.6,
        -33.3,
        { seg: false },
      );
    for (let k = 0; k < 12; k++)
      b.box(
        ["crate", "paint_red", "cryo_grey", "glass"][k % 4],
        -5.4 + (k % 6) * 0.5,
        YB + 0.64 + Math.floor(k / 6) * 0.6,
        -33.7,
        -5.1 + (k % 6) * 0.5,
        YB + 0.94 + Math.floor(k / 6) * 0.6,
        -33.4,
        { seg: false, noAO: true },
      );
    const pipS = P.texMat(
      "ly_pip",
      P.signTex(
        "ly_pip",
        ["TESS'S PROPS & PROVISIONS", "buy · sell · no refunds after curtain"],
        "default",
        512,
        128,
        { bg: "#2a2016", fg: "#e8d8a8" },
      ),
    );
    b.quad(pipS, -4, YB + 2.5, -33.72, 2.6, 0.65, { ry: 0 });
    S.anchor("merchant", -4, YB, -29, PI);
    // Rosalind's makeup chair + mirror (west end, by the bunks)
    b.box("glass", -12.7, YB + 1.1, -28.2, -12.66, YB + 2.0, -26.8, {
      seg: false,
      noAO: true,
    });
    for (let k = 0; k < 4; k++)
      b.sphere("bulb", -12.6, YB + 1.1 + k * 0.28, -28.3, 0.045, {
        ws: 4,
        hs: 3,
        noAO: true,
        noBake: true,
      });
    b.box("wood_dark", -12.8, YB, -28.2, -12.2, YB + 0.85, -26.8);
    S.col(-12.8, YB, -28.2, -12.2, YB + 0.85, -26.8, { walkable: false });
    D.chair(b, -11.3, YB, -27.5, -HP, { seat: "leather", arms: true });
    S.light(-12, YB + 1.8, -27.5, 0xfff0d8, 3.5, 0.7);
    S.anchor("doctor", -11.2, YB, -26.2, HP);
    S.container("Rosalind's Kit", -12.5, YB + 0.85, -27.8, {
      loot: "medical",
      kind: "first_aid",
      owner: "settlers",
    });
    // director's office: desk, terminal, script shelves, the "empty chair"
    b.box("wood_oak", 0, YB, -32.8, 3.2, YB + 0.78, -31.8);
    b.box("wood_dark", -0.05, YB + 0.78, -32.85, 3.25, YB + 0.84, -31.75, {
      seg: false,
    });
    S.col(0, YB, -32.85, 3.2, YB + 0.84, -31.75, { walkable: false });
    D.chair(b, 1.6, YB, -33.4, 0, { seat: "leather", arms: true });
    S.prop("terminal", 2.5, YB + 0.84, -32.3, PI, {
      terminalId: "pt_ly_director",
      mount: "bare",
      parent: S.root,
    });
    D.bookcase(b, -1.6, YB, -30, HP, { w: 2.0, h: 2.4 });
    D.papers(b, 1.5, YB, -29, 1.4, 10);
    const pt = P.texMat(
      "ly_pic",
      P.signTex(
        "ly_pic",
        ["OPENING NIGHT", "Mar. 5, 1967", "(postponed)"],
        "label",
        384,
        256,
      ),
      { rough: 0.9 },
    );
    b.quad(pt, 4.88, YB + 1.8, -30, 1.1, 0.75, { ry: -HP });
    S.light(1.6, YB + 2.6, -31, 0xffe0b0, 5, 0.7);
    S.container("Director's Strongbox", 4.3, YB, -33.4, {
      loot: "safe",
      kind: "safe",
      locked: 0,
      lock: P.LOCKS.ly_strongbox,
      owner: "settlers",
      items: [
        ["scrip", 60],
        ["pt_reel_ly_opening", 1],
      ],
    });
    // prop room: shelves of props, a throne, a skeleton "Yorick", a stuffed ripjaw head, painted flats
    D.bookcase(b, 12.6, YB, -30, -HP, { w: 3.0, h: 2.4, empty: 0.4 });
    b.box("gilt", 8, YB, -33.6, 9.4, YB + 0.5, -32.4);
    b.box("velvet", 8.1, YB + 0.5, -33.5, 9.3, YB + 0.6, -32.5, { seg: false });
    b.box("gilt", 8, YB + 0.5, -33.6, 9.4, YB + 2.3, -33.35, { seg: false });
    S.col(8, YB, -33.6, 9.4, YB + 0.6, -32.4, { walkable: false });
    b.sphere("bone", 10.5, YB + 1.12, -26.2, 0.11, { sy: 1.15 });
    b.box("wood", 10.2, YB, -26.5, 10.8, YB + 1.0, -25.9);
    for (let k = 0; k < 5; k++)
      b.box(
        "wood",
        5.4 + k * 0.1,
        YB,
        -33.8 + k * 0.5,
        5.5 + k * 0.1,
        YB + 3.2,
        -32.4 + k * 0.5,
        { rz: -0.1, seg: false },
      );
    S.container("Prop Hamper", 7, YB, -26, {
      loot: "luggage",
      kind: "crate",
      owner: "settlers",
    });
    S.anchor("prop_room", 9, YB, -29, 0);

    // ================= anchors =================
    S.anchor("entrance", 0, 0, 28.6, 0);
    S.anchor("npc1", -2, Y_STAGE, -12.5, PI);
    S.anchor("npc2", 2.2, Y_STAGE, -12.2, PI);
    S.anchor("npc3", -6.5, Y_STAGE, -16.5, PI);
    S.anchor("npc4", 3.5, Y_STAGE, -16.5, PI);
    S.anchor("guard1", 2.4, 0, 27.6, PI);
    S.anchor("loot1", -11.1, Y_BOX, -3.0, 0);
    S.anchor("loot2", 4.3, YB, -33.4, 0);
    return S;
  }

