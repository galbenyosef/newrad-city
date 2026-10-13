// play-inline-267 04 — the
// Lines 399-750 of readable/play-inline-267.pretty.js (statement-aligned).
  function build() {
    const O = P.I("gracie_mansion");
    const S = P.site("gracie_vault", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x6a5a48,
      ambI: 0.34,
      interiorKey: "gracie_mansion",
    });
    const b = S.b;
    const W = (x, y, z) => ({ x: x + O.x, y: y + O.y, z: z + O.z });

    // ---- the cellar door in the Front Hall (west wall, under the landing) ----
    b.box("wood_dark", -3.3, 0, 5.35, -3.24, 2.2, 6.45, { seg: false });
    for (const [z0, z1] of [
      [5.25, 5.35],
      [6.45, 6.55],
    ])
      b.box("paint_white", -3.3, 0, z0, -3.2, 2.3, z1, { seg: false });
    b.box("paint_white", -3.3, 2.2, 5.25, -3.2, 2.3, 6.55, { seg: false });
    for (const [y0, y1] of [
      [0.3, 1.0],
      [1.2, 2.0],
    ])
      b.box("wood", -3.24, y0, 5.5, -3.22, y1, 6.3, { seg: false });
    b.sphere("gold", -3.19, 1.0, 6.3, 0.035, { ws: 8, hs: 6 });
    D.label(
      b,
      "vault_cellar",
      ["CELLAR", "PRIVATE"],
      -3.2,
      2.45,
      5.9,
      0.42,
      0.16,
      HP,
      "bronze",
    );
    S.anchor("cellar_door", -2.4, 0, 5.9, -HP);

    // ---- the cellar (x -10..-4, z -10..-5, 3 m) ----
    const CY = 3.0;
    S.floor("concrete", -10, -10, -4, -5, 0);
    S.ceil("concrete", -10, -10, -4, -5, CY, { col: true });
    S.wallX("brick_red", -4.85, -10.3, -3.7, 0, CY, 0.3);
    S.wallX("concrete", -10.5, -10.3, -3.7, 0, CY, 1.0);
    S.wallZ("brick_red", -10.15, -10, -5, 0, CY, 0.3);
    S.wallZ("brick_red", -3.85, -10, -5, 0, CY, 0.3);
    // stairs up into the south wall (to the Front Hall)
    for (let i = 0; i < 4; i++) {
      b.box(
        "wood_dark",
        -7.7,
        0,
        -6 + i * 0.25,
        -6.3,
        0.2 + i * 0.2,
        -5.75 + i * 0.25,
        { seg: false },
      );
      S.col(-7.7, 0, -6 + i * 0.25, -6.3, 0.2 + i * 0.2, -5.75 + i * 0.25, {
        surface: "wood",
      });
    }
    b.box("wood_dark", -7.75, 0, -6.05, -7.7, 1.9, -5.0, { seg: false });
    b.box("wood_dark", -6.3, 0, -6.05, -6.25, 1.9, -5.0, { seg: false });
    b.rod("wood", [-7.72, 1.0, -6.05], [-7.72, 1.9, -5.1], 0.025, 6);
    // the bare bulb, shelter stores on the west wall, a wine rack, file boxes
    b.rod("iron", [-7, CY, -7.6], [-7, CY - 0.5, -7.6], 0.01, 4);
    b.sphere("lamp", -7, CY - 0.58, -7.6, 0.07, { ws: 8, hs: 6 });
    S.light(-7, CY - 0.7, -7.6, 0xffd8a0, 8, 0.95, { size: 0.5 });
    for (let k = 0; k < 4; k++)
      b.box("wood", -9.95, 0.25 + k * 0.6, -9.6, -9.4, 0.29 + k * 0.6, -6.2, {
        seg: false,
      });
    for (const z of [-9.55, -6.25])
      b.box("wood_dark", -9.95, 0, z - 0.04, -9.4, 2.2, z + 0.04, {
        seg: false,
      });
    for (let k = 0; k < 4; k++)
      for (let i = 0; i < 9; i++) {
        const rn = P.rng("vcan" + k + i);
        if (rn() < 0.2) continue;
        const z = -9.35 + i * 0.36;
        if (rn() < 0.5)
          b.cyl(
            ["metal", "rust", "steel"][Math.floor(rn() * 3)],
            -9.65,
            0.29 + k * 0.6,
            z,
            0.1,
            0.1,
            0.24 + rn() * 0.08,
            10,
          );
        else
          b.box(
            ["crate", "paper", "leather"][Math.floor(rn() * 3)],
            -9.85,
            0.29 + k * 0.6,
            z - 0.15,
            -9.45,
            0.5 + k * 0.6,
            z + 0.15,
            { seg: false },
          );
      }
    S.col(-9.95, 0, -9.6, -9.4, 2.3, -6.2, { walkable: false });
    b.quad(
      P.texMat("vault_cd_poster", posterTex(), {}),
      -9.38,
      1.75,
      -5.7,
      0.5,
      0.7,
      { ry: HP },
    );
    for (let i = 0; i < 3; i++)
      b.box(
        "crate",
        -5.0 + (i % 2) * 0.05,
        i * 0.42,
        -6.0,
        -4.2,
        0.4 + i * 0.42,
        -5.3,
        { seg: false, ry: i * 0.1 },
      );
    S.col(-5.0, 0, -6.0, -4.2, 1.26, -5.3, { walkable: false });

    // ---- the vault door in the north wall (frame, the door model, the Keyboard) ----
    b.torus("steel", -7, 1.45, -10.0, 1.36, 0.14, TAU, { rs: 8, ts: 40 });
    b.box("concrete_dark", -8.55, 0, -10.0, -5.45, 0.08, -9.7, { seg: false });
    b.cyl("paint_black", -7, 1.44, -10.02, 1.2, 1.2, 0.02, 32, { rx: HP });
    // the Keyboard: mahogany panel, sixteen brass escutcheons + keyholes, the seal above, the plate below
    b.box("wood_dark", -5.38, 0.72, -10.0, -4.42, 1.78, -9.9, { seg: false });
    b.box("gold", -5.42, 1.78, -10.0, -4.38, 1.82, -9.88, { seg: false });
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        const kx = -4.9 + (c - 1.5) * 0.17,
          ky = 1.24 + (1.5 - r) * 0.16;
        b.cyl("gold", kx, ky - 0.01, -9.888, 0.045, 0.045, 0.02, 14, {
          rx: HP,
        });
        b.box(
          "paint_black",
          kx - 0.008,
          ky - 0.03,
          -9.88,
          kx + 0.008,
          ky + 0.012,
          -9.874,
          { seg: false },
        );
      }
    b.quad(
      P.texMat("vault_seal", sealTex("vault_seal"), { rough: 0.5, metal: 0.3 }),
      -4.9,
      2.1,
      -9.97,
      0.5,
      0.5,
      {},
    );
    D.label(
      b,
      "vault_keyboard",
      ["THE KEYS TO THE CITY", "Sixteen keys. One city."],
      -4.9,
      0.6,
      -9.89,
      0.86,
      0.2,
      0,
      "bronze",
    );
    S.anchor("vault_door", -7, 0, -9.0, 0);

    // ---- the strongroom (x -10..-4, z -17..-11.2, 2.8 m) ----
    const VY = 2.8;
    S.floor("terrazzo", -10, -17, -4, -11, 0);
    S.ceil("plaster", -10, -17, -4, -11, VY, { col: true });
    S.wallX("panel", -17.15, -10.3, -3.7, 0, VY, 0.3);
    S.wallX("panel", -10.95, -10.3, -3.7, 0, VY, 0.3);
    S.wallZ("panel", -10.15, -17, -11, 0, VY, 0.3);
    S.wallZ("panel", -3.85, -17, -11, 0, VY, 0.3);
    b.torus("steel", -7, 1.45, -11.12, 1.3, 0.12, TAU, { rs: 8, ts: 40 }); // the inside of the door frame
    b.cyl("paint_black", -7, 1.44, -11.08, 1.18, 1.18, 0.02, 32, { rx: HP });
    D.rug(b, -8.6, -16.4, -5.4, -12.4, 0.01, "carpet_red");
    // the Mayor's desk, chair, green lamp, the city flag and the national flag
    b.box("wood_dark", -8.0, 0, -16.2, -6.0, 0.78, -15.3, { seg: false });
    S.col(-8.0, 0, -16.2, -6.0, 0.8, -15.3, { walkable: false });
    b.box("leather", -7.7, 0.78, -16.0, -6.9, 0.785, -15.5, { seg: false });
    b.cyl("gold", -6.4, 0.78, -15.9, 0.06, 0.08, 0.04, 10);
    b.rod("gold", [-6.4, 0.8, -15.9], [-6.4, 1.15, -15.9], 0.01, 5);
    b.cyl("lamp", -6.4, 1.12, -15.85, 0.07, 0.14, 0.1, 12, { open: true });
    S.light(-6.4, 1.05, -15.7, 0xffe2b0, 3, 0.35, { size: 0.3 });
    D.chair(b, -7.0, 0, -16.6, 0, { seat: "leather", arms: true });
    for (const [x, c] of [
      [-9.4, 0x5a70c0],
      [-4.6, 0xffffff],
    ]) {
      b.cyl("gold", x, 0, -16.7, 0.02, 0.02, 2.3, 5);
      b.box("fabric_white", x, 1.5, -16.72, x + 0.75, 2.2, -16.7, {
        seg: false,
        noAO: true,
        c,
      });
    }
    b.quad(
      P.texMat("vault_seal2", sealTex("vault_seal2"), {
        rough: 0.5,
        metal: 0.3,
      }),
      -7,
      1.95,
      -16.98,
      0.8,
      0.8,
      {},
    );
    // steel shelving with strongboxes and banded bundles of ration scrip
    for (const x of [-9.9, -4.4]) {
      for (let k = 0; k < 4; k++)
        b.box(
          "steel",
          x - 0.25,
          0.3 + k * 0.55,
          -16.4,
          x + 0.25,
          0.33 + k * 0.55,
          -12.0,
          { seg: false },
        );
      for (const z of [-16.4, -12.0])
        b.box("steel", x - 0.25, 0, z - 0.03, x + 0.25, 2.1, z + 0.03, {
          seg: false,
        });
      for (let k = 0; k < 4; k++)
        for (let i = 0; i < 7; i++) {
          const rn = P.rng("vbox" + x + k + i);
          if (rn() < 0.25) continue;
          const z = -16.1 + i * 0.6;
          if (rn() < 0.55)
            b.box(
              "steel",
              x - 0.2,
              0.33 + k * 0.55,
              z - 0.2,
              x + 0.2,
              0.55 + k * 0.55,
              z + 0.2,
              { seg: false },
            );
          else
            for (let j = 0; j < 3; j++)
              b.box(
                "paper",
                x - 0.18,
                0.33 + k * 0.55 + j * 0.06,
                z - 0.12,
                x + 0.18,
                0.385 + k * 0.55 + j * 0.06,
                z + 0.12,
                { seg: false, c: 0xc8d0b0 },
              );
        }
      S.col(x - 0.25, 0, -16.4, x + 0.25, 2.2, -12.0, { walkable: false });
    }
    D.label(
      b,
      "vault_payroll",
      ["CITY OF NEW YORK", "EMERGENCY PAYROLL", "Federal ration scrip · 1962"],
      -9.62,
      2.35,
      -14.2,
      0.9,
      0.3,
      HP,
      "bronze",
    );
    S.light(-7, VY - 0.3, -13.6, 0xffe0b0, 9, 0.9, { size: 0.6 });
    b.sphere("lamp", -7, VY - 0.12, -13.6, 0.12, { ws: 10, hs: 6, sy: 0.4 });
    S.anchor("vault", -7, 0, -13.6, 0);

    // ---- contents: the strongbox (scrip + the coat + the pistol), the letter, the reel ----
    S.prop("safe", -8.9, 0, -14.4, HP, {
      locked: 0,
      name: "The City's Emergency Payroll",
      items: [
        ["scrip", 3000],
        [ITEMS.coat, 1],
        [ITEMS.pistol, 1],
      ],
    });
    S.pickup(ITEMS.letter, 1, -7.3, 0.79, -15.75);
    S.pickup(ITEMS.reel, 1, -6.8, 0.79, -15.6);

    S.build({ interior: true });
    P.addInterior("gracie_mansion", S.root);

    // ---- doors ----
    S.door(-3.0, 1.2, 5.9, "Cellar Stairs", W(-7, 0, -6.4), {
      verb: "Descend",
      radius: 1.0,
      id: "ues_gracie_cellar_down",
    });
    S.door(
      -7,
      1.2,
      -5.6,
      "Front Hall",
      Object.assign(W(-2.3, 0, 5.9), { yaw: -HP }),
      { verb: "Climb", radius: 1.2, id: "ues_gracie_cellar_up" },
    );
    S.door(
      -7,
      1.4,
      -9.6,
      "The Mayor's Vault",
      Object.assign(W(-7, 0, -12.1), { yaw: 0 }),
      {
        verb: "Open",
        radius: 1.5,
        id: "ues_gracie_vault_door",
        lock: LOCK,
        sound: "door_open",
      },
    );
    S.door(
      -7,
      1.3,
      -11.5,
      "The Cellar",
      Object.assign(W(-7, 0, -8.8), { yaw: PI }),
      { verb: "Leave", radius: 1.2, id: "ues_gracie_vault_out" },
    );

    // ---- the swinging door model + the Keyboard keys + the strongroom glow ----
    const m = doorModel(O);
    VD.door = m.hinge;
    VD.keys = m.keys;
    VD.glow = m.glow;
    S.root.add(m.hinge, m.keys, m.glow);
    syncVault();

    // anchors onto the mansion's POI record (quests: vault marker)
    const rec = G.pois && G.pois.gracie_mansion;
    if (rec && rec.anchors) Object.assign(rec.anchors, S.anchors);
  }
