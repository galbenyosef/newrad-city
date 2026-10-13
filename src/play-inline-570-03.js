// play-inline-570 03 — three
// Lines 192-537 of readable/play-inline-570.pretty.js (statement-aligned).
  function buildWreck() {
    if (
      wreckGen === L.gen ||
      !G.scene ||
      !G.world ||
      !G.world.addCollider ||
      !window.THREE
    )
      return;
    const c = wc();
    if (!c || c.anchored) {
      wreckGen = L.gen;
      return;
    } // a POI owner built the real thing
    wreckGen = L.gen;
    const THREE = window.THREE,
      W = G.world;
    const y0 = terrainY(c.x, c.z, c.y);
    const hull = wmat("hull", 0x4b4f4a, 0.75, 0.55),
      burnt = wmat("burnt", 0x24221f, 0.95, 0.2),
      brass = wmat("brass", 0xa8833a, 0.45, 0.8),
      stone = wmat("slab", 0x6c6a64, 0.9, 0.3),
      drag = wmat("drag", 0x2c261d, 1, 0);
    const g = new THREE.Group();
    g.name = "ms_sirocco_wreck";
    const add = (geo, m, x, y, z, rx, ry, rz) => {
      const o = new THREE.Mesh(geo, m);
      o.position.set(x, y, z);
      o.rotation.set(rx || 0, ry || 0, rz || 0);
      o.castShadow = true;
      o.receiveShadow = true;
      g.add(o);
      return o;
    };
    // forward fuselage (nose ploughed in) and the broken-off tail section, both lying east-west
    add(
      new THREE.CylinderGeometry(1.35, 1.6, 9, 14, 1, true),
      hull,
      c.x - 2.6,
      y0 + 0.9,
      c.z,
      0.06,
      0,
      Math.PI / 2 + 0.07,
    );
    add(
      new THREE.SphereGeometry(1.36, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      burnt,
      c.x - 7.1,
      y0 + 0.65,
      c.z,
      0,
      0,
      Math.PI / 2,
    );
    add(
      new THREE.CylinderGeometry(1.5, 0.9, 7, 14, 1, true),
      hull,
      c.x + 6.6,
      y0 + 1.0,
      c.z - 0.9,
      0,
      0.32,
      Math.PI / 2 - 0.05,
    );
    add(
      new THREE.BoxGeometry(2.2, 2.8, 0.18),
      hull,
      c.x + 9.4,
      y0 + 2.4,
      c.z - 1.9,
      0,
      0.32,
      0.12,
    ); // tail fin
    add(
      new THREE.BoxGeometry(2.8, 0.22, 12),
      hull,
      c.x - 1.0,
      y0 + 0.35,
      c.z - 1.0,
      0.05,
      0.12,
      -0.06,
    ); // wing, snapped
    add(
      new THREE.BoxGeometry(1.8, 0.2, 4),
      burnt,
      c.x - 0.4,
      y0 + 0.25,
      c.z + 6.2,
      0.2,
      -0.4,
      0.1,
    ); // the other wing's stub
    // the empty bomb cradle: an open steel U where the belly split
    for (const dz of [1.7, 3.3])
      add(
        new THREE.BoxGeometry(3.2, 0.12, 0.12),
        burnt,
        c.x + 2.4,
        y0 + 0.75,
        c.z + dz,
      );
    for (const dx of [0.9, 3.9])
      add(
        new THREE.BoxGeometry(0.12, 0.9, 1.7),
        burnt,
        c.x + dx,
        y0 + 0.35,
        c.z + 2.5,
      );
    add(
      new THREE.BoxGeometry(0.55, 0.36, 0.04),
      brass,
      c.x + 2.4,
      y0 + 0.95,
      c.z + 3.36,
    ); // the weapon plate
    // drag marks: two dark furrows from the cradle to the slab
    const ins = { x: c.x + 15, z: c.z + 14 };
    const segs = 9;
    for (let i = 0; i < segs; i++) {
      for (const off of [-0.7, 0.7]) {
        const t0 = (i + 0.15) / segs,
          x = c.x + 2.4 + (ins.x - c.x - 2.4) * t0,
          z = c.z + 3.8 + (ins.z - c.z - 4.8) * t0;
        const ang = Math.atan2(ins.x - c.x - 2.4, ins.z - c.z - 4.8);
        const o = add(
          new THREE.PlaneGeometry(0.32, 1.5),
          drag,
          x + Math.cos(ang) * off,
          terrainY(x, z, y0) + 0.04,
          z - Math.sin(ang) * off,
          -Math.PI / 2,
          0,
          ang,
        );
        o.castShadow = false;
      }
    }
    // the slab: a panel of the bomber's own skin set upright, a sun disc riveted to it
    const iy = terrainY(ins.x, ins.z, y0);
    add(
      new THREE.BoxGeometry(1.3, 1.7, 0.16),
      stone,
      ins.x,
      iy + 0.85,
      ins.z,
      0,
      0.6,
      0,
    );
    add(
      new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12),
      brass,
      ins.x + Math.sin(0.6) * 0.1,
      iy + 1.35,
      ins.z + Math.cos(0.6) * 0.1,
      Math.PI / 2,
      0.6,
      0,
    );
    G.scene.add(g);
    const h = { object3d: g };
    const cols = [
      W.addCollider(c.x - 2.6, c.z, 9, 3.0, y0, y0 + 2.4, 0, { tag: "prop" }),
      W.addCollider(c.x + 6.6, c.z - 0.9, 7, 2.8, y0, y0 + 2.4, 0.32, {
        tag: "prop",
      }),
      W.addCollider(ins.x, ins.z, 1.3, 0.3, iy, iy + 1.7, 0.6, { tag: "prop" }),
    ];
    L.dyn(h);
    for (const col of cols) L.dyn({ collider: col });
    // the pilot, still in his straps; a few army crates the OCD never took home
    L.prop("skeleton", {
      x: c.x - 6.4,
      y: y0 + 0.6,
      z: c.z + 0.6,
      yaw: Math.PI / 2,
      pose: "sitting",
    });
    L.prop("crate", {
      x: c.x + 4.8,
      y: y0,
      z: c.z + 4.6,
      yaw: 0.4,
      kind: "army",
    });
    L.prop("debris", { x: c.x - 3.5, y: y0, z: c.z + 3.2, yaw: 1.2 });
  }
  L.hook("spawn", function () {
    L.later(0.3, buildWreck);
  });
  L.hook("reset", function () {
    wreckGen = -1;
  });

  // ---- the wreck's examine dialogues (also injected into Zeke's tree) ----
  function readPlate() {
    ms.set("knows_arming");
    if (!L.has("ms_note_sirocco_plate")) L.give("ms_note_sirocco_plate", 1);
    if (stage("mq30") === "wreck" || stage("mq30") === "plate")
      Q.setStage("mq30", "harness");
  }
  function checkHarness() {
    ms.set("mq30_harness");
    if (stage("mq30") === "harness") Q.setStage("mq30", "drag");
  }
  function readInscription() {
    ms.set("mq30_inscription");
    if (Q.isActive("mq30")) {
      if (!ms.f("knows_arming")) readPlate();
      Q.complete("mq30");
    }
  }
  const WRECK_NODES = {
    mq30_plate: {
      speaker: "Weapon Plate",
      text: "[A brass plate riveted to the empty bomb cradle, green with twenty-two winters. French, stamped deep:]\n\nSIROCCO 2 — CHARGE SPÉCIALE. ARMEMENT : DEUX CLÉS TOURNÉES ENSEMBLE (A : PILOTE / B : NAVIGATEUR). MOT D'ARMEMENT SUR LA ROUE CHIFFRANTE (VOIR CARNET SIROCCO). ALIMENTATION DU BLOC DE MISE À FEU : 28 V.",
      responses: [
        {
          text: "Zeke. Read it with me.",
          cond: () => zekeNear(30),
          next: "mq30_zplate",
        },
        {
          text: () => "You read French, " + ms.roseName() + "?",
          cond: () => !zekeNear(30),
          next: "mq30_rplate",
        },
      ],
    },
    mq30_zplate: {
      speaker: "Zeke Marlow",
      text: "Two keys, turned together. The pilot carries A, the navigator carries B. Then a word, dialled into a cipher wheel; the word's in their codebook, which we haven't got. And juice: twenty-eight volts to the firing set. [He raps the cradle with a knuckle.] That's a rig battery, near enough. Every Exo-rig in the city runs on twenty-eight.",
      responses: [{ text: "How big is it, Zeke?", next: "mq30_zyield" }],
    },
    mq30_zyield: {
      speaker: "Zeke Marlow",
      text: () =>
        "[He looks at the empty cradle a long time.] Enough to finish what the first one started. Battery to Harlem. " +
        (ms.f("keyB") === "destroyed"
          ? "Your girl took care of key B, so they're a key short. Unless somebody down there is clever with a drill. Somebody always is."
          : "And we know where key B is, don't we. In your pocket. Keep it there.") +
        " So: two keys, a word, a battery. Take away any one and it's the most expensive paperweight in New York.",
      onEnter() {
        readPlate();
      },
      responses: [
        { text: "[Look at the cockpit.]", next: "mq30_harness" },
        { text: "Let's keep looking." },
      ],
    },
    mq30_rplate: {
      speaker: "Rose",
      text: "I read French. Mom made sure. [She runs a finger under the stamped words.] Two keys, turned together: A for the pilot, B for the navigator. A word set on a cipher wheel, out of their codebook. Twenty-eight volts for the firing set. [Flat.] That's a rig battery. That's why they wanted the Neon's.",
      onEnter() {
        readPlate();
      },
      responses: [
        { text: "[Look at the cockpit.]", next: "mq30_harness" },
        { text: "Let's keep looking." },
      ],
    },
    mq30_harness: {
      speaker: "Cockpit",
      text: () =>
        "[The cockpit has torn away from the fuselage and lies nose-down in the leaf mould. The pilot is still in his harness, a skeleton in a flight suit gone the colour of the ground. Round his neck bones hangs a short chain, and the chain has been cut: cut clean, with a tool, not torn. Whatever hung on it is gone. The navigator's seat behind him is empty; his straps were slit by a Civil Defense recovery knife, the OCD's stencil still on the buckle.]" +
        (zekeNear(30)
          ? "\n\nZEKE: Key A, off the pilot. Somebody with a steady hand and a reason. And the navigator went home with the OCD in '67, key and all. That's how B ended up on Liberty."
          : "") +
        (rosePresent()
          ? "\n\n[" +
            ms.roseName() +
            " has turned away. She is looking at the trees.]"
          : ""),
      onEnter() {
        checkHarness();
      },
      responses: [{ text: "[Follow the drag marks.]" }],
    },
    mq30_inscr: {
      speaker: "Slab",
      text: "[Where the drag marks end, a panel of the bomber's own skin has been set upright in the earth like a headstone. A twelve-ray sun is punched into it, and the year 1971, and one line, cut letter by letter with a cold chisel:]\n\nHERE THE SECOND SUN CAME DOWN TO SLEEP. D.",
      responses: [
        {
          text: () => "[Look at " + ms.roseName() + ".]",
          cond: () => rosePresent(),
          next: "mq30_rinscr",
        },
        {
          text: "[Copy it into your notes.]",
          cond: () => !rosePresent(),
          action: () => readInscription(),
        },
      ],
    },
    mq30_rinscr: {
      speaker: "Rose",
      text: "[She doesn't touch the slab. She stands exactly where she must have stood, a hand held out a little from her side, as if someone were still holding it.] She held my hand right here, every March. She said it was sleeping like my father.",
      onEnter() {
        readInscription();
      },
      responses: [
        { text: "It isn't sleeping. And neither am I. Not any more." },
        { text: "[Say nothing. Stand with her.]" },
      ],
    },
  };
  const WD = ms.dlg("dlg_ms5_wreck", "idle");
  WD.add(
    Object.assign(
      {
        idle: {
          text: "[Nothing more to see here.]",
          responses: [{ text: "[Step back.]" }],
        },
      },
      WRECK_NODES,
    ),
  );

  ms.spot({
    id: "ms5_plate",
    when: () => inStage("mq30", ["wreck", "plate", "harness", "drag"]),
    at: P_PLATE,
    label: "Weapon Plate",
    verb: "Read",
    radius: 1.4,
    use() {
      if (stage("mq30") === "wreck") Q.setStage("mq30", "plate");
      ms.talk("dlg_ms5_wreck", "Weapon Plate", "mq30_plate");
    },
  });
  ms.spot({
    id: "ms5_cockpit",
    when: () => inStage("mq30", ["harness", "drag"]),
    at: P_COCKPIT,
    label: "Cockpit Harnesses",
    verb: "Check",
    radius: 1.6,
    use() {
      ms.talk("dlg_ms5_wreck", "Cockpit", "mq30_harness");
    },
  });
