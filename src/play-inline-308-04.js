// play-inline-308 04 — atop
// Lines 629-875 of readable/play-inline-308.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("tc_story_ext", { grime: 0.5 });
    const b = S.b;
    // ---------- Rose's nook (roof, north of the penthouse, beside the breaker) ----------
    const NX0 = 318.2,
      NX1 = 323.6,
      NZ0 = -175.5,
      NZ1 = -173.0;
    b.geo(
      "burlap",
      new THREE.BoxGeometry(NX1 - NX0 + 0.4, 0.04, 2.9).rotateX(-0.62),
      P.m4((NX0 + NX1) / 2, ATOP + 1.85, -174.1),
      { grime: 0.7, noAO: true },
    ); // the tarp lean-to
    for (const xx of [NX0, (NX0 + NX1) / 2, NX1])
      b.rod(
        "wood_rotten",
        [xx, ATOP, NZ0 + 0.2],
        [xx, ATOP + 1.2, NZ0 + 0.2],
        0.04,
        4,
      );
    E.mattress(b, 319.2, ATOP + 0.02, -174.2, HP, { key: "burlap" });
    S.col(321.2, ATOP, -175.3, 322.0, ATOP + 1.05, -174.5, { walkable: false });
    b.box("crate", 321.2, ATOP, -175.3, 322.0, ATOP + 0.6, -174.5, {
      seg: false,
    });
    b.box("crate", 321.25, ATOP + 0.6, -175.2, 321.9, ATOP + 1.05, -174.6, {
      seg: false,
    });
    b.rod(
      "paint_black",
      [322.4, ATOP + 0.1, -175.4],
      [322.5, ATOP + 1.3, -175.5],
      0.03,
      6,
    ); // a rifle propped in the corner
    b.rod(
      "paint_black",
      [322.45, ATOP + 1.0, -175.45],
      [322.6, ATOP + 1.15, -175.48],
      0.025,
      6,
    ); // its scope
    b.cyl("lamp", 321.6, ATOP + 1.05, -174.9, 0.07, 0.09, 0.22, 8, {
      noAO: true,
    });
    S.light(321.6, ATOP + 1.3, -174.9, 0xffc070, 4, 0.7);
    S.glow(321.6, ATOP + 1.2, -174.9, 0xffc070, 0.9, { flicker: 0.1 });
    for (let i = 0; i < 5; i++)
      b.box(
        "paper",
        320.3 + i * 0.12,
        ATOP,
        -175.4,
        320.4 + i * 0.12,
        ATOP + 0.22 + (i % 3) * 0.03,
        -175.1,
        { seg: false },
      ); // borrowed books
    const sign = P.texMat(
      "tc_nook_sign",
      P.signTex(
        "tc_nook_sign",
        ["ROYAL", "LAMPLIGHTER", "KNOCK FIRST"],
        "raider",
        384,
        256,
        { fg: "#f0e0b0" },
      ),
      { transparent: true },
    );
    b.quad(sign, (NX0 + NX1) / 2, ATOP + 1.05, NZ0 + 0.05, 1.1, 0.72, {
      ry: 0,
    });
    // ---------- the fire escape: a drop ladder on the tower's south face (terrace ⇄ roof) ----------
    const FX = 321.7,
      FZ = AZ1 + 0.28;
    for (const s of [-0.3, 0.3])
      b.rod("iron", [FX + s, TY + 2.4, FZ], [FX + s, ATOP + 1.1, FZ], 0.025, 4);
    for (let y = TY + 2.6; y < ATOP + 0.8; y += 0.42)
      b.rod("iron", [FX - 0.3, y, FZ], [FX + 0.3, y, FZ], 0.014, 3);
    for (let y = TY + 8; y < ATOP - 4; y += 9.6) {
      b.box("iron", FX - 1.0, y, AZ1, FX + 1.0, y + 0.05, AZ1 + 0.9, {
        seg: false,
      });
      b.rod(
        "iron",
        [FX - 1.0, y + 0.9, AZ1 + 0.9],
        [FX + 1.0, y + 0.9, AZ1 + 0.9],
        0.02,
        3,
      );
    }
    b.rod(
      "rust",
      [FX - 0.3, ATOP + 1.1, FZ],
      [FX - 0.3, ATOP + 1.1, AZ1 - 0.4],
      0.03,
      4,
    );
    b.rod(
      "rust",
      [FX + 0.3, ATOP + 1.1, FZ],
      [FX + 0.3, ATOP + 1.1, AZ1 - 0.4],
      0.03,
      4,
    ); // the hoops over the parapet
    const fe = P.texMat(
      "tc_fe_sign",
      P.signTex(
        "tc_fe_sign",
        ["FIRE ESCAPE", "THE ROOF IS SPOKEN FOR"],
        "raider",
        384,
        160,
        { fg: "#e8d8b0" },
      ),
      { transparent: true },
    );
    b.quad(fe, FX, TY + 2.2, AZ1 + 0.06, 1.3, 0.54, { ry: 0 });
    // the 9C fire escape: a hook ladder over the north parapet down to the 9th-floor landing
    b.rod(
      "rust",
      [319.3, ATOP + 1.15, AZ0 + 0.1],
      [319.3, ATOP - 3.5, AZ0 - 0.25],
      0.025,
      4,
    );
    b.rod(
      "rust",
      [319.9, ATOP + 1.15, AZ0 + 0.1],
      [319.9, ATOP - 3.5, AZ0 - 0.25],
      0.025,
      4,
    );
    for (let k = 0; k < 10; k++)
      b.rod(
        "rust",
        [319.3, ATOP + 0.9 - k * 0.45, AZ0 + 0.05 - k * 0.03],
        [319.9, ATOP + 0.9 - k * 0.45, AZ0 + 0.05 - k * 0.03],
        0.012,
        3,
      );

    // ---------- anchors ----------
    S.anchor("rose_nook", 320.6, ATOP, -174.2, HP);
    S.anchor("unkindled1", 322.4, ATOP, -161.8, PI);
    S.anchor("unkindled2", 326.4, ATOP, -165.6, -HP);
    S.anchor("unkindled3", 316.6, ATOP, -161.4, HP);
    S.anchor("unkindled4", 325.4, ATOP, -175.0, PI * 0.75);
    S.anchor("dawn_gantry", 303.5, BTOP + 0.9, BZ1 - 2.6, -HP); // behind the Windsor wing's TUDOR CITY sign, across the gap
    S.anchor("fire_escape_bottom", FX, TY, AZ1 + 1.6, 0);
    S.anchor("fire_escape_top", 320.6, ATOP, AZ1 - 1.6, 0);
    S.anchor("roof_9c_ladder", 319.6, ATOP, AZ0 + 1.2, 0);
    S.build({ shadow: true, lod: 260 });
    return { S, FX };
  }

  // ------------------------------------------------------------------
  // builder: rooms, doors, anchors, the lit sign
  // ------------------------------------------------------------------
  P.addBuilder(
    "tudor_story",
    function () {
      const I = buildInterior();
      const EXT = buildExterior();
      const O = P.I("tudor_city");
      P.addInterior("tudor_city", I.root);
      const W = (x, y, z, yaw) => ({ x: O.x + x, y: O.y + y, z: O.z + z, yaw });
      // the Court ⇄ 9C stair
      I.door(
        10.5,
        F3 + 1.3,
        -13.6,
        "Stair — Upper Floors (Apartment 9C)",
        W(25.4, Y9, -2.0, -HP),
        { id: "pe_tc_9c_up", verb: "Climb", radius: 1.3 },
      );
      I.door(
        24.25,
        Y9 + 1.2,
        -2.0,
        "Stair — Down to the Court",
        W(10.5, F3, -12.4, PI),
        { id: "pe_tc_9c_down", verb: "Descend", radius: 1.3 },
      );
      // 9C window ⇄ the roof (beside Rose's nook)
      I.door(
        35.75,
        Y9 + 1.3,
        1.0,
        "Window — Fire Escape to the Roof",
        { x: 319.6, y: ATOP, z: AZ0 + 1.3, yaw: PI },
        { id: "pe_tc_9c_window", verb: "Climb out", radius: 1.3 },
      );
      EXT.S.door(
        319.6,
        ATOP + 1.0,
        AZ0 + 0.45,
        "Fire Escape — Apartment 9C (window)",
        W(34.6, Y9, 1.0, HP),
        { id: "pe_tc_9c_roof", verb: "Climb down to", radius: 1.2 },
      );
      // terrace ⇄ roof (the drop ladder)
      EXT.S.door(
        EXT.FX,
        TY + 1.4,
        AZ1 + 0.45,
        "Fire Escape — Climb to the Roof",
        { x: 320.6, y: ATOP, z: AZ1 - 1.6, yaw: 0 },
        { id: "pe_tc_fe_up", verb: "Climb", radius: 1.3 },
      );
      EXT.S.door(
        EXT.FX,
        ATOP + 1.0,
        AZ1 - 0.45,
        "Fire Escape — Down to the Terrace",
        { x: EXT.FX, y: TY, z: AZ1 + 1.6, yaw: PI },
        { id: "pe_tc_fe_down", verb: "Climb down", radius: 1.2 },
      );
      // publish the anchors on the Tudor City record
      const rec = G.pois && G.pois.tudor_city;
      if (rec && rec.anchors)
        Object.assign(rec.anchors, I.anchors, EXT.S.anchors);
      for (const k in I.anchors) I.anchors[k].interior = "tudor_city";
      // the Lamplighter keeps the big sign lit
      if (TC.signLit && TC.signDim) {
        TC.signLit.visible = true;
        TC.signDim.visible = false;
      }
      P.onReady = P.onReady || [];
      P.onReady.push(() => {
        if (G.isStub("fx") || !G.fx.glowSprite || !TC.glowSpots || !TC.extRoot)
          return;
        for (const g of TC.glowSpots)
          P.safe("signglow", () =>
            G.fx.glowSprite(g.pos, 0xff3a2a, 4.2, {
              parent: TC.extRoot,
              intensity: 1.1,
              dayFactor: 0.25,
            }),
          );
      });
    },
    21,
  );
