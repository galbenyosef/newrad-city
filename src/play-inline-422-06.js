// play-inline-422 06 — tint
// Lines 1558-1958 of readable/play-inline-422.pretty.js (statement-aligned).
  function caravanStage(ctx, d) {
    const { AY, Z0 } = WH;
    // ox pen (SW end): scrap fence on three sides, trough, hay, water barrel
    K.fence(d, -20.6, 1.2, -13.2, 1.2, AY, { h: 1.3, seed: 1 });
    K.fence(d, -13.2, 1.2, -13.2, 5.2, AY, { h: 1.3, seed: 2 });
    K.fence(d, -20.6, 1.2, -20.6, 9.2, AY, { h: 1.3, seed: 3 });
    K.fence(d, -20.6, 9.2, -15.5, 9.2, AY, { h: 1.3, seed: 4 });
    d.cyl("wood_rotten", -19.6, AY, 5.2, 0.45, 0.45, 0.5, 10, {
      tint: [0.55, 0.45, 0.35],
    }); // trough barrel half
    d.box("wood", -17.6, AY, 8.3, 2.2, 0.5, 0.7, { tint: [0.52, 0.42, 0.3] });
    for (let k = 0; k < 4; k++)
      d.box(
        "flat",
        -19.5 + (k % 2) * 1.05,
        AY + (k > 1 ? 0.5 : 0),
        2.3,
        1.0,
        0.5,
        0.6,
        { tint: [0.72, 0.62, 0.34], yaw: 0.05 * k },
      );
    d.hplate("decal", -16.8, AY + 0.012, 5, 7, 7.5, 0.2, K.decal("grime", 4));
    for (let k = 0; k < 16; k++) {
      const r = K.rng("hay" + k);
      d.box("flat", -20 + r() * 6.5, AY + 0.01, 1.8 + r() * 7, 0.6, 0.01, 0.1, {
        yaw: r() * 3,
        tint: [0.75, 0.66, 0.4],
      });
    }
    const penSign = K.signCell("wh_pen", "OX PEN\nFEED 2 SCRIP", 256, 128, {
      bg: "#5a3a24",
      fg: "#f0e0b0",
      font: "Georgia, serif",
    });
    d.plate("art", -16.9, AY + 1.25, 1.1, 0, -1, 1.1, 0.55, penSign, {
      off: 0.03,
    });
    // covered wagons
    K.wagon(d, -9.6, AY, 4.0, 0.35, { canvas: [0.8, 0.74, 0.6] });
    K.wagon(d, 10.8, AY, 5.4, -0.5, { canvas: [0.62, 0.52, 0.42] });
    K.crates(d, -7.6, AY, 6.8, 0.2, 3, { col: true });
    K.crates(d, 13.2, AY, 3.2, -0.4, 2, { col: true });
    // stalls in front of the outer arches
    K.stall(d, -14.3, AY, 10.4, 0, 3.4, 2.0, {
      tarp: "canvas_red",
      tarpTint: [0.62, 0.3, 0.22],
      sign: K.signCell("wh_stall_guns", "BRASS & POWDER", 256, 64, {
        bg: "#e0d0a8",
        fg: "#5a1a10",
        font: "Impact, sans-serif",
      }),
      items: ["box", "can", "box"],
      seed: 21,
    });
    K.stall(d, 14.3, AY, 10.4, 0, 3.4, 2.0, {
      tarp: "canvas_blue",
      tarpTint: [0.36, 0.44, 0.56],
      sign: K.signCell("wh_stall_food", "WATER · JERKY · BREAD", 256, 64, {
        bg: "#e0d8c0",
        fg: "#1a2a44",
        font: "Impact, sans-serif",
      }),
      items: ["jar", "bottle", "can"],
      seed: 22,
    });
    // campfire ring with log benches (the fire itself is a props campfire)
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      d.box(
        "concrete",
        4.6 + Math.cos(a) * 0.75,
        AY,
        5.2 + Math.sin(a) * 0.75,
        0.32,
        0.22,
        0.26,
        { yaw: a, tint: [0.55, 0.52, 0.48] },
      );
    }
    for (const [a, len] of [
      [0.3, 2.4],
      [2.0, 2.0],
      [3.8, 2.2],
    ]) {
      const x = 4.6 + Math.cos(a) * 2.3,
        z = 5.2 + Math.sin(a) * 2.3;
      d.geo("wood_rotten", K.unitCyl(8), {
        x,
        y: AY + 0.22,
        z,
        sx: 0.22,
        sy: len,
        sz: 0.22,
        rz: HP,
        ry: -a + HP,
        tint: [0.55, 0.45, 0.35],
      });
      d.ocol(x, z, len, 0.45, AY, AY + 0.45, -a + HP, {
        tag: "bench",
        surface: "wood",
      });
    }
    d.burn(4.6, AY, 5.2, 1.4, 0.8);
    // signpost
    d.cyl("wood_rotten", -3.2, AY, 1.4, 0.09, 0.08, 3.6, 6, {
      tint: [0.5, 0.42, 0.34],
    });
    const arrows = [
      ["BROOKLYN via BRIDGE", 0.5, "#e8dcb8"],
      ["BRONX  ↑  (2 DAYS)", -0.6, "#d8e0c8"],
      ["JERSEY — NO", 2.4, "#e0c0b0"],
      ["CAPITAL RUINS 230 MI", -2.1, "#e8e0c0"],
    ];
    arrows.forEach(([t, yaw, bg], k) => {
      const cell = K.signCell("wh_arrow" + k, t, 384, 64, {
        bg,
        fg: "#2a1a10",
        font: "Georgia, serif",
      });
      const c = Math.cos(yaw),
        s = Math.sin(yaw),
        y = AY + 3.2 - k * 0.42,
        cx = -3.2 + c * 0.75,
        cz = 1.4 - s * 0.75;
      d.box("wood", cx, y - 0.15, cz, 1.5, 0.3, 0.05, {
        yaw,
        tint: [0.7, 0.6, 0.45],
      });
      d.plate(
        "art",
        cx - s * 0.03,
        y,
        cz - c * 0.03,
        -s,
        -c,
        1.45,
        0.25,
        cell,
        { off: 0.0 },
      );
      d.plate("art", cx + s * 0.03, y, cz + c * 0.03, s, c, 1.45, 0.25, cell, {
        off: 0.0,
      });
    });
    // watchtower (NE corner): four legs, deck, sandbag parapet, corrugated roof, ladder
    const TX = 18.6,
      TZ = 1.2,
      TY = AY + 4.2;
    for (const [dx, dz] of [
      [-1.2, -1.2],
      [1.2, -1.2],
      [1.2, 1.2],
      [-1.2, 1.2],
    ])
      d.box("wood_rotten", TX + dx, AY, TZ + dz, 0.2, 4.2 + 2.4, 0.2, {
        tint: [0.52, 0.44, 0.36],
      });
    d.boxMM("deck", TX - 1.4, TY - 0.15, TZ - 1.4, TX + 1.4, TY, TZ + 1.4, {
      faces: "nsewtb",
    });
    d.col(TX - 1.4, TY - 0.3, TZ - 1.4, TX + 1.4, TY, TZ + 1.4, {
      tag: "deck",
      surface: "wood",
    });
    for (const [ax, az, bx, bz] of [
      [-1.3, -1.3, 1.3, -1.3],
      [1.3, -1.3, 1.3, 1.3],
      [-1.3, -1.3, -1.3, 1.3],
    ])
      K.sandbags(d, TX + ax, TZ + az, TX + bx, TZ + bz, TY, 0.9, {
        seed: 70 + ax * 3,
      });
    d.quadN(
      "corrugated",
      [TX - 1.7, TY + 2.5, TZ + 1.7],
      [TX + 1.7, TY + 2.5, TZ + 1.7],
      [TX + 1.7, TY + 2.2, TZ - 1.7],
      [TX - 1.7, TY + 2.2, TZ - 1.7],
      [0, 1, 0],
      { tint: [0.6, 0.5, 0.4] },
    );
    K.ladder(d, TX, TZ + 1.4, AY, TY, 0, 1, { mat: "wood_rotten", w: 0.6 });
    WH.tower = {
      bottom: F.w(TX, AY + 1.2, TZ + 1.8),
      top: F.w(TX, TY + 1.0, TZ + 1.0),
      upT: F.w(TX, TY + 0.05, TZ),
      downT: F.w(TX, AY + 0.05, TZ + 2.4),
    };
    K.lamp(d, TX + 1.2, TY + 1.9, TZ - 1.2, "cage", [1, 0.8, 0.5], 0, 0, {
      ceil: TY + 2.2,
      glowSize: 1.4,
    });
    // sandbag chicane at the land edge (the way in from the Battery promenade)
    // (the esplanade railing stands along the shore NE of local x ≈ 0.6; SW of it the promenade runs straight onto the deck)
    K.sandbags(d, -12.5, -0.6, -7.2, -0.6, AY, 1.0, { seed: 81 });
    K.sandbags(d, 1.4, -0.6, 7.0, -0.6, AY, 1.0, { seed: 82 });
    K.sandbags(d, 10.0, -0.6, 14.5, -0.6, AY, 1.0, { seed: 84 });
    K.sandbags(d, 1.4, -0.6, 1.4, 1.8, AY, 1.0, { seed: 83 });
    // boarding stiles over the esplanade railing (the settlers' way onto the apron): timber steps up, a landing
    // above the rail, steps down onto the deck — with hand rails and colliders
    for (const sx of WH.STILES || [8.5]) {
      const w = 2.4,
        top = 1.45;
      const steps = [
        [-3.9, 0.3],
        [-3.5, 0.6],
        [-3.1, 0.9],
        [-2.7, 1.2],
      ];
      for (const [z0, y] of steps) {
        d.boxMM(
          "planks_iron",
          sx - w / 2,
          y - 0.3,
          z0,
          sx + w / 2,
          y,
          z0 + 0.4,
          { tint: [0.62, 0.52, 0.42], faces: "nsewt" },
        );
        d.col(sx - w / 2, 0, z0, sx + w / 2, y, z0 + 0.4, {
          tag: "stairs",
          surface: "wood",
        });
      }
      d.boxMM(
        "planks_iron",
        sx - w / 2,
        top - 0.2,
        -2.3,
        sx + w / 2,
        top,
        0.1,
        { tint: [0.62, 0.52, 0.42], faces: "nsewtb" },
      );
      d.col(sx - w / 2, top - 0.25, -2.3, sx + w / 2, top, 0.1, {
        tag: "stairs",
        surface: "wood",
      });
      for (const [z0, y] of [
        [0.1, 1.15],
        [0.5, 0.85],
        [0.9, 0.55],
      ]) {
        d.boxMM(
          "planks_iron",
          sx - w / 2,
          y - 0.25,
          z0,
          sx + w / 2,
          y,
          z0 + 0.4,
          { tint: [0.62, 0.52, 0.42], faces: "nsewt" },
        );
        d.col(sx - w / 2, AY, z0, sx + w / 2, y, z0 + 0.4, {
          tag: "stairs",
          surface: "wood",
        });
      }
      for (const e of [-1, 1]) {
        const x = sx + e * (w / 2 - 0.05);
        for (const z of [-3.9, -2.3, 0.1, 1.3])
          d.box(
            "wood_rotten",
            x,
            0,
            z,
            0.12,
            z < -3 ? 1.2 : z > 1 ? 1.4 : top + 1.0,
            0.12,
            { tint: [0.5, 0.42, 0.34] },
          );
        d.beam("wood_rotten", x, 1.2, -3.9, x, top + 1.0, -2.3, 0.07, 0.07);
        d.beam(
          "wood_rotten",
          x,
          top + 1.0,
          -2.3,
          x,
          top + 1.0,
          0.1,
          0.07,
          0.07,
        );
        d.beam("wood_rotten", x, top + 1.0, 0.1, x, 1.4, 1.3, 0.07, 0.07);
      }
    }
    // light poles + string lights to the marquee
    const poles = [
      [-9, 0.8],
      [0, 0.4],
      [9, 0.8],
    ];
    for (const [x, z] of poles) {
      d.cyl("wood_rotten", x, AY, z, 0.1, 0.09, 4.4, 6, {
        tint: [0.5, 0.42, 0.34],
      });
    }
    K.stringLights(
      d,
      [
        [-20, AY + 3.2, 9.5],
        [-9, AY + 4.3, 0.8],
        [0, AY + 4.3, 0.4],
        [9, AY + 4.3, 0.8],
        [20, AY + 3.2, 9.5],
      ],
      { sag: 0.5, deadEvery: 7 },
    );
    K.stringLights(
      d,
      [
        [-9, AY + 4.3, 0.8],
        [-4.8, 7.1, Z0 - 3.1],
      ],
      { sag: 0.35 },
    );
    K.stringLights(
      d,
      [
        [9, AY + 4.3, 0.8],
        [4.8, 7.1, Z0 - 3.1],
      ],
      { sag: 0.35 },
    );
    // barrels, junk, a Fizzo machine by the doors
    for (const [x, z] of [
      [-5.8, 11.8],
      [5.8, 11.8],
      [16.5, 7.5],
    ]) {
      d.cyl("rust", x, AY, z, 0.3, 0.3, 0.9, 10, { tint: [0.55, 0.42, 0.32] });
      d.cyl("rust", x, AY + 0.9, z, 0.31, 0.31, 0.05, 10);
    }
    // caravan-guild chalkboard with today's departures
    const board = K.paint(
      "art",
      "ph2_wh_departures",
      512,
      256,
      (x, X, Y, W, Hh) => {
        x.fillStyle = "#23302a";
        x.fillRect(X, Y, W, Hh);
        x.strokeStyle = "#8a6a40";
        x.lineWidth = 12;
        x.strokeRect(X + 6, Y + 6, W - 12, Hh - 12);
        x.fillStyle = "rgba(235,235,220,0.9)";
        x.font = 'bold 30px "Comic Sans MS", cursive, sans-serif';
        x.textAlign = "left";
        const lines = [
          "DEPARTURES",
          "Crow's Hat Co. — Brooklyn — DAWN",
          "Two-Horn Traders — Bronx — ??",
          "Slate & Sons — Uptown — CANCELLED",
          "  (raiders on Broadway)",
          "Shellback season: WATCH THE PIERS",
        ];
        lines.forEach((l, i) => x.fillText(l, X + 26, Y + 44 + i * 36, W - 40));
        K.grain(x, X, Y, W, Hh, 20, 461);
      },
    );
    d.box("wood_rotten", 7.4, AY, 11.6, 1.8, 0.05, 0.05, {
      tint: [0.5, 0.4, 0.3],
    });
    for (const e of [-1, 1])
      d.beam(
        "wood_rotten",
        7.4 + e * 0.8,
        AY,
        11.3,
        7.4 + e * 0.8,
        AY + 2.1,
        11.7,
        0.07,
        0.07,
      );
    d.quadN(
      "art",
      [6.45, AY + 0.95, 11.72],
      [8.35, AY + 0.95, 11.72],
      [8.35, AY + 1.95, 11.52],
      [6.45, AY + 1.95, 11.52],
      [0, 0.2, -1],
      { rect: board, grime: 0 },
    );
    // tarps & bedrolls along the NE flank walk (caravaneers sleep out here in summer)
    for (let k = 0; k < 3; k++) {
      d.box("canvas_green", 19.6, AY, 15 + k * 4, 1.8, 0.12, 0.8, {
        yaw: HP + 0.1 * k,
        tint: [0.5, 0.56, 0.42],
      });
      d.box("fabric", 19.4, AY + 0.1, 14.3 + k * 4, 0.5, 0.2, 0.35, {
        tint: [0.7, 0.66, 0.56],
      });
    }
  }

  // ==================================================================
  // DATA: items, quest, dialogue
  // ==================================================================
