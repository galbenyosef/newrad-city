// play-inline-208 05 — deck
// Lines 1464-2076 of readable/play-inline-208.pretty.js (statement-aligned).
  function peking(b, anchors, r) {
    const S = PK;
    hull(b, "hull_black", S, { nu: 18, nv: 40 });
    // red boot-top band just above the waterline + white sheer stripe (amidships runs)
    for (const s of [-1, 1]) {
      b.box(
        "hull_red",
        (S.x0 + S.x1) / 2 - 3,
        -1.25,
        S.zc + s * (S.hb - 0.3),
        (S.x1 - S.x0) * 0.62,
        0.6,
        0.2,
        { seg: false, grime: 0.4 },
      );
      b.box(
        "hull_white",
        (S.x0 + S.x1) / 2 - 3,
        S.top - 0.4,
        S.zc + s * (S.hb + 0.02),
        (S.x1 - S.x0) * 0.66,
        0.18,
        0.08,
        { seg: false, grime: 0.3 },
      );
      // painted gun-ports band (the old square-rigger look)
      for (let i = 0; i < 14; i++)
        b.quad(
          "hull_white",
          S.x0 + 12 + i * 3.1,
          S.top - 1.2,
          S.zc + s * (S.hb + 0.05),
          0.9,
          0.7,
          { ry: s > 0 ? 0 : PI, grime: 0.3, noAO: true },
        );
    }
    // decks: main (4.0), poop (aft, 5.8) and forecastle (bow, 5.8)
    deck(b, "deck_wood", S, S.deck, 0.15, true);
    const poopX = S.x0 + 11,
      fcX = S.x1 - 11;
    b.boxMM(
      "deck_wood",
      S.x0 + 0.4,
      S.deck,
      S.zc - S.hb * 0.72 + 0.2,
      poopX,
      S.deck + 1.8,
      S.zc + S.hb * 0.72 - 0.2,
      { grime: 0.5 },
    );
    PF.colMM(
      S.x0 + 0.4,
      S.deck,
      S.zc - S.hb * 0.8,
      poopX,
      S.deck + 1.8,
      S.zc + S.hb * 0.8,
      { surface: "wood" },
    );
    b.boxMM(
      "hull_white",
      poopX - 0.05,
      S.deck,
      S.zc - S.hb + 0.3,
      poopX + 0.05,
      S.deck + 1.8,
      S.zc + S.hb - 0.3,
      { seg: false },
    );
    b.boxMM(
      "deck_wood",
      fcX,
      S.deck,
      S.zc - S.hb + 0.35,
      S.x1 - 4,
      S.deck + 1.8,
      S.zc + S.hb - 0.35,
      { grime: 0.5 },
    );
    PF.colMM(
      fcX,
      S.deck,
      S.zc - S.hb + 0.35,
      S.x1 - 4,
      S.deck + 1.8,
      S.zc + S.hb - 0.35,
      { surface: "wood" },
    );
    b.boxMM(
      "hull_white",
      fcX - 0.05,
      S.deck,
      S.zc - S.hb + 0.35,
      fcX + 0.05,
      S.deck + 1.8,
      S.zc + S.hb - 0.35,
      { seg: false },
    );
    // ladders up to the poop and forecastle (steps ≤ 0.35)
    PF.stairs(
      b,
      "deck_wood",
      poopX + 2.2,
      S.zc - 2.5,
      -HP,
      1.2,
      2.0,
      S.deck,
      S.deck + 1.8,
      { base: S.deck },
    );
    PF.stairs(
      b,
      "deck_wood",
      poopX + 2.2,
      S.zc + 2.5,
      -HP,
      1.2,
      2.0,
      S.deck,
      S.deck + 1.8,
      { base: S.deck },
    );
    PF.stairs(
      b,
      "deck_wood",
      fcX - 2.2,
      S.zc - 2.3,
      HP,
      1.2,
      2.0,
      S.deck,
      S.deck + 1.8,
      { base: S.deck },
    );
    PF.stairs(
      b,
      "deck_wood",
      fcX - 2.2,
      S.zc + 2.3,
      HP,
      1.2,
      2.0,
      S.deck,
      S.deck + 1.8,
      { base: S.deck },
    );
    // bulwarks with the gangway gap (north side, amidships)
    bulwark(b, S, S.deck, 1.1, [[0.42, 0.47, -1]]);
    // raised-deck rails
    // break-deck rails with gaps where the ladders land (the gaps used to be amidships, so the rails blocked the
    // ladder tops and the poop / forecastle could not be climbed from the main deck)
    for (const [a0, a1] of [
      [-S.hb * 0.7, -3.15],
      [-1.85, 1.85],
      [3.15, S.hb * 0.7],
    ])
      PF.railing(
        b,
        [
          [poopX, S.zc + a0],
          [poopX, S.zc + a1],
        ],
        S.deck + 1.8,
        0.9,
        "mahogany",
        { collide: true },
      );
    for (const [a0, a1] of [
      [-S.hb + 0.5, -2.95],
      [-1.65, 1.65],
      [2.95, S.hb - 0.5],
    ])
      PF.railing(
        b,
        [
          [fcX, S.zc + a0],
          [fcX, S.zc + a1],
        ],
        S.deck + 1.8,
        0.9,
        "mahogany",
        { collide: true },
      );
    // deckhouse amidships, skylights, the big wheel aft, capstans, cargo hatches (fore = door)
    b.boxMM(
      "hull_white",
      288,
      S.deck,
      S.zc - 2.2,
      296,
      S.deck + 2.4,
      S.zc + 2.2,
      { grime: 0.5 },
    );
    b.boxMM(
      "mahogany",
      287.8,
      S.deck + 2.4,
      S.zc - 2.4,
      296.2,
      S.deck + 2.55,
      S.zc + 2.4,
      { seg: false },
    );
    for (let x = 289; x < 296; x += 1.6)
      for (const s of [-1, 1])
        b.quad("glass_dark", x, S.deck + 1.4, S.zc + s * 2.21, 0.6, 0.6, {
          ry: s > 0 ? 0 : PI,
          noAO: true,
        });
    PF.colMM(288, S.deck, S.zc - 2.2, 296, S.deck + 2.55, S.zc + 2.2, {
      walkable: false,
    });
    b.box("mahogany", S.x0 + 8.8, S.deck + 1.8, S.zc + 2.4, 2.2, 0.6, 1.6, {
      seg: false,
    });
    b.box("glass_dark", S.x0 + 8.8, S.deck + 2.4, S.zc + 2.4, 2.0, 0.3, 1.4, {
      rx: 0.2,
      seg: false,
    });
    PF.col(S.x0 + 8.8, S.zc + 2.4, 2.2, 1.6, S.deck + 1.8, S.deck + 2.7, 0, {
      walkable: false,
    });
    // the wheel (double wheel on the poop)
    for (const dx of [-0.35, 0.35]) {
      const wg = new THREE.TorusGeometry(0.75, 0.05, 6, 20);
      wg.rotateY(HP);
      b.add("mahogany", wg, { m: PF.m4(S.x0 + 2.2 + dx, S.deck + 3.1, S.zc) });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.beam(
          "mahogany",
          V3(S.x0 + 2.2 + dx, S.deck + 3.1, S.zc),
          V3(
            S.x0 + 2.2 + dx,
            S.deck + 3.1 + Math.sin(a) * 1.0,
            S.zc + Math.cos(a) * 1.0,
          ),
          0.05,
          0.05,
          {},
        );
      }
    }
    b.box("mahogany", S.x0 + 2.2, S.deck + 1.8, S.zc, 0.9, 0.9, 0.4, {
      seg: false,
    });
    PF.col(S.x0 + 2.2, S.zc, 1.2, 1.4, S.deck + 1.8, S.deck + 3.5, 0, {
      walkable: false,
    });
    for (const x of [284, 310]) {
      b.cyl("iron", x, S.deck, S.zc, 0.35, 0.45, 0.9, 10, { hSeg: 1 });
      b.cyl("iron", x, S.deck + 0.9, S.zc, 0.5, 0.35, 0.15, 10, { hSeg: 1 });
      PF.col(x, S.zc, 1.0, 1.0, S.deck, S.deck + 1.0, 0, { walkable: false });
    }
    for (const [x, w] of [
      [301, 3.2],
      [280, 3.0],
    ]) {
      b.boxMM(
        "mahogany",
        x - w / 2,
        S.deck,
        S.zc - 1.6,
        x + w / 2,
        S.deck + 0.7,
        S.zc + 1.6,
        { seg: false, grime: 0.5 },
      );
      b.boxMM(
        "tent",
        x - w / 2 + 0.1,
        S.deck + 0.7,
        S.zc - 1.5,
        x + w / 2 - 0.1,
        S.deck + 0.78,
        S.zc + 1.5,
        { seg: false, grime: 0.7 },
      );
      PF.colMM(
        x - w / 2,
        S.deck,
        S.zc - 1.6,
        x + w / 2,
        S.deck + 0.78,
        S.zc + 1.6,
        { surface: "wood" },
      );
    }
    // the fore hatch (door into the 'tween deck) and aft companionway (on the poop)
    b.boxMM(
      "mahogany",
      314,
      S.deck,
      S.zc - 1.2,
      317,
      S.deck + 1.9,
      S.zc + 1.2,
      { seg: false, grime: 0.5 },
    );
    b.box("rotten", 313.95, S.deck, S.zc, 0.08, 1.7, 1.0, { seg: false });
    PF.colMM(314, S.deck, S.zc - 1.2, 317, S.deck + 1.9, S.zc + 1.2, {
      walkable: false,
    });
    anchors.fore_hatch = PF.anchor(312.4, S.deck, S.zc + 1.8, HP); // beside the hatch house, looking aft down the deck (clear of the capstan)
    b.boxMM(
      "mahogany",
      S.x0 + 3.6,
      S.deck + 1.8,
      S.zc - 1.0,
      S.x0 + 5.6,
      S.deck + 3.6,
      S.zc + 1.0,
      { seg: false, grime: 0.5 },
    );
    b.box("rotten", S.x0 + 5.65, S.deck + 1.8, S.zc, 0.08, 1.6, 0.9, {
      seg: false,
    });
    PF.colMM(
      S.x0 + 3.6,
      S.deck + 1.8,
      S.zc - 1.0,
      S.x0 + 5.6,
      S.deck + 3.6,
      S.zc + 1.0,
      { walkable: false },
    );
    anchors.aft_hatch = PF.anchor(S.x0 + 6.4, S.deck + 1.8, S.zc, -HP); // on the poop, looking forward along the ship
    // nameboards & port of registry
    hullName(
      b,
      "PEKING",
      S.x1 - 6,
      S.top - 0.6,
      S.zc - S.hb * wf(0.9) - 0.06,
      PI - 0.15,
      4.4,
      0.8,
    );
    hullName(
      b,
      "PEKING",
      S.x1 - 6,
      S.top - 0.6,
      S.zc + S.hb * wf(0.9) + 0.06,
      0.15,
      4.4,
      0.8,
    );
    hullName(b, "PEKING", S.x0 - 0.05, S.top - 0.3, S.zc, -HP, 4.0, 0.75);
    hullName(b, "HAMBURG", S.x0 - 0.05, S.top - 1.1, S.zc, -HP, 3.0, 0.55);
    // bowsprit + jibboom
    b.rod(
      "mahogany",
      V3(S.x1 - 4, S.top + 0.4, S.zc),
      V3(S.x1 + 12, S.top + 4.0, S.zc),
      0.35,
      8,
      { r2: 0.12 },
    );
    // ---- the rig: four masts, yards, furled sails, shrouds, stays ----
    const masts = [
      { x: 318, sq: true },
      { x: 304, sq: true },
      { x: 290, sq: true },
      { x: 276, sq: false },
    ];
    const top = S.deck + 38;
    for (const m of masts) {
      const h = m.sq ? 38 : 33;
      b.cyl("mahogany", m.x, S.deck, S.zc, 0.32, 0.42, 17, 10, {
        hSeg: 3,
        grime: 0.4,
      });
      b.cyl("mahogany", m.x, S.deck + 16.5, S.zc, 0.24, 0.3, 12, 8, {
        hSeg: 2,
        grime: 0.4,
      });
      b.cyl("mahogany", m.x, S.deck + 28, S.zc, 0.12, 0.2, h - 28, 8, {
        hSeg: 2,
        grime: 0.4,
      });
      b.boxMM(
        "mahogany",
        m.x - 1.2,
        S.deck + 16,
        S.zc - 1.8,
        m.x + 1.2,
        S.deck + 16.3,
        S.zc + 1.8,
        { seg: false },
      ); // top
      b.boxMM(
        "mahogany",
        m.x - 0.7,
        S.deck + 27.6,
        S.zc - 1.2,
        m.x + 0.7,
        S.deck + 27.8,
        S.zc + 1.2,
        { seg: false },
      ); // crosstrees
      PF.col(m.x, S.zc, 0.9, 0.9, S.deck, S.deck + 16, 0, { walkable: false });
      if (m.sq) {
        const yards = [
          [11.5, 23],
          [15.5, 20],
          [19.5, 19],
          [23.5, 17],
          [27, 15.5],
          [31, 12.5],
          [34.5, 10],
        ];
        yards.forEach(([yy, L], i) => {
          const y = S.deck + yy,
            skew = (i % 2 ? 0.05 : -0.04) + (m.x === 304 ? 0.12 : 0);
          const a = V3(
              m.x - 0.4 + (Math.sin(skew) * L) / 2,
              y,
              S.zc - (Math.cos(skew) * L) / 2,
            ),
            c = V3(
              m.x - 0.4 - (Math.sin(skew) * L) / 2,
              y,
              S.zc + (Math.cos(skew) * L) / 2,
            );
          b.rod("mahogany", a, c, 0.16, 6, { r2: 0.16 });
          // furled sail along the yard (grey-white bundle), some sails hanging torn
          if (i === 1 && m.x === 290) {
            tornSail(b, m.x - 0.6, y, S.zc, L * 0.9, 4.2);
          } else
            b.rod(
              "linen",
              V3(a.x, a.y - 0.25, a.z),
              V3(c.x, c.y - 0.25, c.z),
              0.26,
              6,
              { r2: 0.26 },
            );
          // lifts & braces
          b.beam("iron", V3(m.x, y + 3.5, S.zc), a, 0.03, 0.03, { noAO: true });
          b.beam("iron", V3(m.x, y + 3.5, S.zc), c, 0.03, 0.03, { noAO: true });
        });
      } else {
        // jigger: spanker gaff & boom
        b.rod(
          "mahogany",
          V3(m.x - 0.3, S.deck + 3.2, S.zc),
          V3(m.x - 13, S.deck + 4.0, S.zc),
          0.18,
          6,
        );
        b.rod(
          "mahogany",
          V3(m.x - 0.3, S.deck + 15, S.zc),
          V3(m.x - 11, S.deck + 20, S.zc),
          0.14,
          6,
        );
        b.rod(
          "linen",
          V3(m.x - 0.6, S.deck + 3.6, S.zc),
          V3(m.x - 12.5, S.deck + 4.4, S.zc),
          0.3,
          6,
        );
      }
      // shrouds from the rails to the top (both sides) + ratline hints
      for (const s of [-1, 1]) {
        for (let k = 0; k < 5; k++) {
          const hx = m.x - 1.4 + k * 0.7;
          b.beam(
            "iron",
            V3(hx, S.top + 0.3, S.zc + s * (S.hb + 0.1)),
            V3(m.x, S.deck + 16, S.zc + s * 1.6),
            0.035,
            0.035,
            { noAO: true },
          );
        }
        b.beam(
          "iron",
          V3(m.x, S.deck + 16.3, S.zc + s * 1.6),
          V3(m.x, S.deck + 27.6, S.zc + s * 1.1),
          0.03,
          0.03,
          { noAO: true },
        );
        b.beam(
          "iron",
          V3(m.x - 0.8, S.deck + 16.3, S.zc + s * 1.7),
          V3(m.x, S.deck + 27.6, S.zc + s * 1.1),
          0.03,
          0.03,
          { noAO: true },
        );
        for (let y = S.deck + 2; y < S.deck + 15; y += 0.9) {
          const t = (y - S.top - 0.3) / (S.deck + 16 - S.top - 0.3);
          const zz = S.zc + s * (S.hb + 0.1 + (1.6 - S.hb - 0.1) * t);
          b.beam(
            "rope",
            V3(m.x - 1.4 + t * 1.4, y, zz),
            V3(m.x + 1.4 - t * 1.4, y, zz),
            0.02,
            0.02,
            { noAO: true },
          );
        }
      }
    }
    // stays between the mastheads and down to the bowsprit
    for (let i = 0; i < masts.length - 1; i++)
      b.beam(
        "iron",
        V3(masts[i + 1].x, S.deck + 30, S.zc),
        V3(masts[i].x, S.deck + 16.5, S.zc),
        0.04,
        0.04,
        { noAO: true },
      );
    b.beam(
      "iron",
      V3(318, S.deck + 30, S.zc),
      V3(S.x1 + 11, S.top + 3.8, S.zc),
      0.04,
      0.04,
      { noAO: true },
    );
    b.beam(
      "iron",
      V3(318, S.deck + 16.5, S.zc),
      V3(S.x1 + 6, S.top + 2.3, S.zc),
      0.05,
      0.05,
      { noAO: true },
    );
    b.beam(
      "iron",
      V3(318, S.deck + 36, S.zc),
      V3(S.x1 + 12, S.top + 4, S.zc),
      0.03,
      0.03,
      { noAO: true },
    );
    void top;
    // gangway from Pier 16 (y 0.3) up to the main deck through the bulwark gap (north side, v≈0.445)
    {
      const gx = S.x0 + 0.445 * (S.x1 - S.x0),
        zS = S.zc - S.hb * wf(0.445);
      const zP = P16.z1 - 0.8;
      // ramp along x on the pier edge from (gx + 9, 0.3) up to (gx + 0.8, 4.0), then a bridge plank across to the deck
      PF.stepPath(
        gx + 9.5,
        zP,
        -HP,
        1.4,
        8.7,
        (t) => 0.3 + (S.deck - 0.3) * t,
        { maxRise: 0.3, thick: 0.3 },
      );
      b.beam(
        "deck_wood",
        V3(gx + 9.5, 0.3, zP),
        V3(gx + 0.8, S.deck, zP),
        1.4,
        0.12,
        { twist: 0 },
      );
      for (const s of [-1, 1])
        b.beam(
          "iron",
          V3(gx + 9.5, 1.3, zP + s * 0.7),
          V3(gx + 0.8, S.deck + 1.0, zP + s * 0.7),
          0.04,
          0.04,
          {},
        );
      b.boxMM(
        "deck_wood",
        gx - 0.6,
        S.deck - 0.15,
        zP - 0.7,
        gx + 0.8,
        S.deck,
        zS + 0.6,
        { seg: false },
      );
      PF.colMM(gx - 0.6, S.deck - 0.3, zP - 0.7, gx + 0.8, S.deck, zS + 0.6, {
        surface: "wood",
      });
      anchors.gangway = PF.anchor(gx + 11, 0.3, zP, HP);
    }
    // deck clutter: coiled ropes, a dinghy on chocks, barrels, a shellback nest on the fo'c'sle
    for (const [x, z] of [
      [298, S.zc - 3.2],
      [285, S.zc + 3.1],
      [308, S.zc + 3.0],
    ])
      b.cyl("rope", x, S.deck, z, 0.45, 0.45, 0.25, 12, { hSeg: 1 });
    anchors.clutches.push(
      nest(b, S.x1 - 7, S.deck + 1.8, S.zc + 0.5, 1.2, 9, null, 75),
    );
    for (const [x, z, a] of [
      [300, S.zc - 2.5, 0.8],
      [293, S.zc + 3, 2.9],
    ])
      PF.skeleton(b, x, S.deck + 0.02, z, a);
    anchors.peking_deck = PF.anchor(300, S.deck, S.zc, 0);
  }

  /** Round-arched opening shape w × h. */
