// play-inline-578 02 — the
// Lines 380-699 of readable/play-inline-578.pretty.js (statement-aligned).
  QX.trigger({
    id: "r_num_near",
    x: SP.numbers.x,
    z: SP.numbers.z,
    r: 55,
    cond: () => !QX.started(NUM) && G.player.pos.y < 30,
    fire: () => {
      QX.notify(
        "A faint chime and a woman's voice counting, from a speaker horn on the U.N. fence. Numbers. Just numbers.",
      );
    },
  });
  // Stage 'hatch' → 'inside' when the player enters the facility (35_cryo_c4.js calls this).
  R.enteredFacility = function () {
    if (!QX.started(C4)) R.startC4(true);
    if (QX.stage(C4) === "hatch") QX.setStage(C4, "inside");
  };

  // ==================================================================
  // Water Rising — exterior: the freight hatch
  // ==================================================================
  QX.hook("world", function () {
    const k = K();
    const p = QX.freeSpot(SP.hatch.x, SP.hatch.z, undefined, {
      maxR: 10,
      radius: 1.3,
    });
    SP.hatch.x = p.x;
    SP.hatch.z = p.z;
    SP.hatch.y = p.y;
    const yaw = Math.PI / 2; // stencil faces east, toward the park
    k.freightHatch(p.x, p.y, p.z, yaw, "C-4");
    // a gull-stained cairn of rocks + a faded bunch of plastic flowers: the sleepers' kids "wave at the hatch every spring"
    const g = k.group(p.x, p.y, p.z, yaw, 120);
    const b = k.builder();
    const rock = k.mat("concrete_dark", 0x55524c);
    for (let i = 0; i < 5; i++)
      k.box(
        b,
        rock,
        0.35 - i * 0.04,
        0.18,
        0.3 - i * 0.03,
        1.55 + (i % 2) * 0.05,
        0.09 + i * 0.17,
        -1.2,
        i * 0.7,
      );
    const faded = k.tint("qx_c4_flowers", 0xb88a9a, { roughness: 0.9 });
    const stem = k.tint("qx_c4_stems", 0x5f7a4a, { roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      k.cyl(
        b,
        stem,
        0.012,
        0.42,
        1.2 + i * 0.07,
        0.21,
        -0.95 + (i % 2) * 0.08,
        5,
      );
      k.sphere(b, faded, 0.05, 1.2 + i * 0.07, 0.44, -0.95 + (i % 2) * 0.08);
    }
    k.flush(b, g, false);
    const sg = k.sign("WE MADE IT\nALL 59\n— LOVE, C-4", "wood", 0.6, 0.34, {
      fg: "#2a2418",
      bg: "#cfc3a0",
    });
    sg.position.set(1.55, 0.95, -1.2);
    sg.rotation.y = -Math.PI / 2;
    sg.rotation.z = 0.08;
    g.add(sg);
    QX.world.c4Hatch = p;
  });

  // ==================================================================
  // Numbers Game — Static Okonkwo, the courier, the Sky-Eye drones
  // ==================================================================
  QX.hook("world", function () {
    const k = K();
    const p = QX.freeSpot(SP.sparks.x, SP.sparks.z, undefined, {
      maxR: 10,
      radius: 1.6,
    });
    SP.sparks.x = p.x;
    SP.sparks.z = p.z;
    SP.sparks.y = p.y;
    k.listeningPost(p.x, p.y, p.z, -Math.PI / 2);
    k.collider(p.x, p.z, 1.4, 0.8, p.y, p.y + 0.9, -Math.PI / 2, "wood");
    // the courier: a skeleton in the rubble with a satchel
    const c = QX.freeSpot(SP.courier.x, SP.courier.z, undefined, {
      maxR: 8,
      radius: 0.8,
    });
    SP.courier.x = c.x;
    SP.courier.z = c.z;
    SP.courier.y = c.y;
    QX.prop("skeleton", {
      x: c.x,
      z: c.z,
      yaw: 2.1,
      pose: "lying",
      persistent: true,
    });
    // the pad lives in the courier's satchel (a container, so it is found by searching, not by stepping on it)
    if (QX.live("containers") && G.containers.create) {
      QX.world.courierBag = QX.safe("courierBag", () =>
        G.containers.create({
          id: "qx_courier_satchel",
          kind: "bag",
          name: "Continuity Courier's Satchel",
          pos: { x: c.x + 0.7, y: c.y, z: c.z + 0.2 },
          yaw: 0.4,
          items: [
            ["qx_cipher_sheet", 1],
            [QX.SCRIP_ID, 35],
            ["rally_tonic", 1],
            ["ammo_dry_cell", 6],
            ["focus_pills", 1],
          ].filter((e) => e[0] === QX.SCRIP_ID || QX.itemExists(e[0])),
        }),
      );
    }
    // the pad as a ground pickup if containers are unavailable
    if (!QX.world.courierBag)
      QX.hook("spawn", () => {
        if (!QX.has("qx_cipher_sheet"))
          QX.pickup("num_pad", "qx_cipher_sheet", 1, {
            x: c.x + 0.6,
            y: c.y + 0.02,
            z: c.z + 0.3,
          });
      });
  });
  G.events.on("itemAdded", (id) => {
    if (id === "qx_cipher_sheet") {
      if (!QX.started(NUM)) R.startNumbers();
      if (!QX.started(NUM)) return; // Act 3 not open yet: the pad waits in the pack
      if (QX.stage(NUM) === "pad" || QX.stage(NUM) === "sparks") {
        if (!QX.flag("num_bots_killed")) QX.setFlag("num_quiet");
        QX.setStage(NUM, "decode");
      }
    }
    if (id === "qx_shackle_key" && QX.stage(BELL) === "find")
      QX.setStage(BELL, "free");
  });

  QX.hook("spawn", function () {
    QX.spawnNPC({
      id: "qx_sparks",
      type: "human",
      name: "Static Okonkwo",
      outfit: "drifter",
      gender: "f",
      hair: "afro",
      hat: "cap",
      skinTone: "dark",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 1.5,
      essential: true,
      level: 6,
      weapon: "pistol_10mm",
      dialogue: "qx_dlg_sparks",
      at: {
        fallback: {
          x: SP.sparks.x + 0.3,
          z: SP.sparks.z - 1.4,
          y: SP.sparks.y,
        },
      },
      lookAt: { x: SP.sparks.x + 6, z: SP.sparks.z },
      merchant: {
        scrip: 260,
        stock: [
          ["scrap_electronics", 6],
          ["ammo_dry_cell", 12],
          ["ammo_rivet", 30],
          ["dry_cell", 3],
          ["relay_board", 2],
          ["conductor", 4],
          ["duct_tape", 2],
        ],
        restock: 3,
      },
      barks: [
        "Seven. Four. Four. One... no. Nine?",
        "Shh! Group three is coming up.",
        "You hear that chime? That's the Continuity doing its homework.",
        "Every Tuesday. It's always Tuesday.",
      ],
    });
    // Sky-Eye escort still circling the courier (two, stable ids, never respawn)
    if (!QX.done(NUM) && !QX.flag("num_bots_killed")) {
      for (let i = 0; i < 2; i++) {
        QX.spawnNPC({
          id: "qx_num_drone" + i,
          type: DRONE_TYPE,
          name: "Continuity Courier Escort",
          faction: DRONE_FACTION,
          hostile: true,
          level: 5,
          noRespawn: true,
          ai: "patrol",
          patrol: [
            { x: SP.courier.x + (i ? 5 : -5), z: SP.courier.z - 4 },
            { x: SP.courier.x + (i ? -4 : 4), z: SP.courier.z + 5 },
          ],
          aggroRange: 14,
          at: {
            fallback: {
              x: SP.courier.x + (i ? 4 : -4),
              z: SP.courier.z + (i ? -3 : 3),
              y: SP.courier.y,
            },
            maxR: 6,
          },
          barks: [
            "SAFEGUARD THE DISPATCH. SAFEGUARD THE DISPATCH.",
            "*chirp* COURIER UNRESPONSIVE. PROCEDURE: CONTINUE WAITING. *chirp*",
          ],
        });
      }
    }
  });
  G.events.on("actorKilled", (a) => {
    if (a && /^qx_num_drone/.test(a.id || "")) {
      QX.setFlag("num_bots_killed");
    }
  });

  // ------------------------------------------------------------------ Numbers actions
  const N = (QX.numbers = {
    decode() {
      if (!QX.has("qx_cipher_sheet")) return false;
      QX.take("qx_cipher_sheet", 1);
      QX.give("qx_decoded_signal", 1);
      QX.setFlag("num_decoded");
      QX.xp(75, "Numbers Game — decoded");
      if (!QX.started(NUM)) QX.start(NUM, { stage: "choose" });
      else QX.setStage(NUM, "choose");
      return true;
    },
    jam() {
      QX.setFlag("num_jammed");
      QX.msFlag("skyeye_jammed"); // main story: no Sky-Eye drones over Liberty (mq06)
      QX.setQflag("qx_relay_jammed"); // (older name, kept for saves)
      QX.standing(50, "Jammed the Continuity relay net");
      QX.giveScrip(QX.flag("sparks_pay") ? 120 : 80);
      if (QX.itemExists("relay_board")) QX.give("relay_board", 1);
      QX.addEffect({
        id: "qx_eff_jammed",
        name: "Off the Air",
        kind: "buff",
        duration: 3600,
        source: "Numbers Game",
        desc: "The Continuity's Sky-Eye relay net is jammed. +10 Stealth.",
        mods: { skills: { stealth: 10 } },
      });
      QX.setStage(NUM, "done_jam");
      QX.news(
        "This just in: somebody jammed the Continuity's Sky-Eye drones on the East Side and out over the harbour. Those flying filing cabinets are playing static. Rocky calls that an improvement.",
      );
    },
    fakeDeath() {
      QX.setFlag("num_ghost");
      QX.setQflag("qx_wayte_file_closed");
      QX.setQflag("ms_wayte_file_closed"); // main story: an easier stealth landing on Liberty (mq06)
      QX.xp(125, "Numbers Game — file closed");
      QX.addEffect({
        id: "qx_talent_ghost",
        name: "File Closed",
        kind: EFFECT_KIND_TALENT,
        duration: 0,
        source: "Numbers Game",
        desc: "The Continuity has closed FILE C-9/WAYTE: officially, you are dead. +10 Stealth, +5 Persuasion.",
        mods: { skills: { stealth: 10, persuasion: 5 } },
      });
      QX.notify("Talent gained: File Closed");
      QX.setStage(NUM, "done_dead");
    },
    keep() {
      QX.setFlag("num_kept");
      QX.setQflag("qx_pad_kept");
      QX.setQflag("ms_pad_kept");
      if (!QX.has("qx_cipher_sheet")) QX.give("qx_cipher_sheet", 1);
      QX.setStage(NUM, "done_sold");
    },
  });

  // ==================================================================
  // The Closing Bell — Harlan, Ticker Tate, the drop box
  // ==================================================================
  function harlanExchangeSpot() {
    const bell = QX.anchor("nyse", ["bell"], null);
    if (bell)
      return QX.freeSpot(bell.x + 1.6, bell.z + 1.4, bell.y, { maxR: 4 });
    return QX.freeSpot(SP.harlanFallback.x, SP.harlanFallback.z, undefined, {
      maxR: 6,
    });
  }
  function harlanGCSpot() {
    return QX.anchor("grand_central", ["merchant3", "stall2"], SP.harlanGC);
  }
  const HARLAN_STOCK = [
    ["ox_meat", 4],
    ["purified_water", 6],
    ["rally_tonic", 3],
    ["ammo_10mm", 60],
    ["ammo_556", 40],
    ["ammo_308", 20],
    ["frag_grenade", 3],
    ["leather_armor", 1],
    ["hunting_rifle", 1],
    ["prussian_blue", 2],
    ["iodine_tabs", 2],
    ["dirty_water", 4],
    ["scrap_metal", 4],
  ];
