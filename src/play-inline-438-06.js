// play-inline-438 06 — ctx
// Lines 1026-1371 of readable/play-inline-438.pretty.js (statement-aligned).
  function spawnTavern(ctx) {
    const A = ctx.anchors;
    const v = (n) => V(A[n]);
    const disc = PK.flag("roz_discount") ? 0.9 : 1;
    PK.spawnActor(ctx, {
      id: "ppk_roz",
      type: "human",
      gender: "f",
      outfit: "merchant",
      name: "Roz Tavish",
      faction: "settlers",
      level: 10,
      essential: true,
      pos: v("merchant"),
      yaw: HP,
      ai: "merchant",
      home: "here",
      homeR: 1.4,
      dialogue: "ppk_dlg_roz",
      voice: "settler",
      merchant: {
        scrip: 480,
        stock: K.stock(
          [
            ["rally_tonic", 3],
            ["prussian_blue", 2],
            ["iodine_tabs", 2],
            ["purified_water", 6],
            ["ammo_10mm", 40],
            ["ammo_12ga", 16],
            ["ammo_308", 10],
            ["scrap_metal", 8],
            ["ppk_rack_of_ox", 3],
            ["ppk_tavern_wine", 2],
            ["ox_milk", 4],
          ],
          "merchant_general",
          5,
        ),
        restock: 3,
        priceMult: disc,
      },
      barks: [
        "Buy, sell, swap. No credit.",
        "The lights stay on.",
        "Weapons holstered, please.",
        "Wagons are due Thursday.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_maurice",
      type: "valet",
      name: "Maurice",
      faction: "settlers",
      level: 6,
      essential: true,
      pos: v("maitre_d"),
      yaw: PI,
      ai: "static",
      home: "here",
      homeR: 0.3,
      dialogue: "ppk_dlg_maurice",
      voice: "robot",
      barks: [
        "Welcome to Tavern on the Green!",
        "Your table will be ready momentarily.",
        "Might I take your coat? Or your rifle?",
        "The Hendersons are running a little late.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_anton",
      type: "human",
      gender: "m",
      outfit: "settler",
      name: "Anton Moreau",
      burn: "R",
      faction: "settlers",
      level: 8,
      essential: true,
      pos: v("chef"),
      yaw: 0,
      ai: "merchant",
      home: "here",
      homeR: 1.6,
      dialogue: "ppk_dlg_anton",
      voice: "settler",
      merchant: {
        scrip: 220,
        stock: K.stock(
          [
            ["ppk_rack_of_ox", 5],
            ["ox_milk", 3],
            ["wine", 3],
            ["beer", 6],
            ["purified_water", 4],
            ["frank_in_a_bun", 3],
          ],
          "merchant_food",
          3,
        ),
        restock: 2,
      },
      barks: [
        "Order up!",
        "Who touched my knives?",
        "It's PACK OXEN. It's supposed to taste like that.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_lillian",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Lillian",
      faction: "settlers",
      level: 4,
      essential: true,
      pos: v("singer"),
      yaw: 0,
      ai: "static",
      home: "here",
      homeR: 0.3,
      dialogue: "ppk_dlg_lillian",
      voice: "settler",
      barks: [
        "♪ ...one by one, the lights on Broadway... ♪",
        "♪ ...keep a candle in the window, darling... ♪",
        "This next one's for the Hendersons.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_tav_diner1",
      type: "human",
      gender: "m",
      outfit: "drifter",
      name: "Wagon Hand",
      faction: "settlers",
      level: 4,
      pos: v("npc1"),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Best meal between here and the Neon.",
        "Don't look at the chandeliers too long. You'll cry.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_tav_diner2",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Settler",
      faction: "settlers",
      level: 3,
      pos: v("npc2"),
      yaw: PI,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Lillian's on at eight.",
        "They say the zoo animals come out at night.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_tav_patron",
      type: "human",
      gender: "m",
      outfit: "merchant",
      name: "Wagon Master",
      faction: "settlers",
      level: 7,
      pos: v("npc3"),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Roz drives a hard bargain.",
        "Three days from Grand Central with a limping pack oxen.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_tav_cellar",
      type: "human",
      gender: "m",
      outfit: "drifter",
      name: "Settler",
      faction: "settlers",
      level: 3,
      pos: v("npc4"),
      yaw: 0,
      ai: "wander",
      home: "here",
      homeR: 2.5,
    });
  }
  function spawnTavernOutside(ctx) {
    const A = ctx.anchors;
    PK.spawnActor(ctx, {
      id: "ppk_buck",
      type: "human",
      gender: "m",
      outfit: "leather_armor",
      name: "Buck",
      faction: "settlers",
      level: 9,
      pos: V(A.guard),
      yaw: PI,
      ai: "guard",
      home: "here",
      homeR: 2,
      weapon: "hunting_rifle",
      dialogue: "ppk_dlg_buck",
      voice: "settler",
      barks: [
        "Weapons holstered inside.",
        "Watch the East Drive after dark.",
        "Evening.",
      ],
    });
    PK.spawnActor(ctx, {
      id: "ppk_dee",
      type: "human",
      gender: "f",
      outfit: "leather_armor",
      name: "Dee",
      faction: "settlers",
      level: 7,
      pos: V(A.guard2),
      yaw: -HP,
      ai: "guard",
      home: "here",
      homeR: 3,
      weapon: "combat_shotgun",
      barks: [
        "Pen's across the drive.",
        "Keep your hands where I can see them.",
        "Nice night for it.",
      ],
    });
  }

  // ==================================================================
  // UPDATE: lit groups at night, the clock, the raid on the Tavern
  // ==================================================================
  let nightT = 0,
    night = false,
    raidT = 1;
  function updateAll(dt, realDt) {
    nightT -= realDt;
    if (nightT <= 0) {
      night = isNight();
      nightT = 2;
    }
    const zoo = ctxOf("cp_zoo_arsenal"),
      tav = ctxOf("tavern_on_green");
    if (zoo && zoo.litGroup) zoo.litGroup.visible = night;
    if (tav && tav.litGroup) tav.litGroup.visible = night;
    const p = G.player && G.player.pos;
    // the clock: on the hour when the player is near (outside), and whenever it's wound
    if (zoo && zoo.clockRing && p) {
      const h = Math.floor((G.time && G.time.hour) || 0);
      const near =
        p.x < G.LAYOUT.INTERIOR_X_MIN &&
        Math.abs(p.x - zoo.clockPos.x) < 60 &&
        Math.abs(p.z - zoo.clockPos.z) < 60;
      if (lastHour >= 0 && h !== lastHour && near && clockT <= 0 && dt > 0)
        playClock(false);
      lastHour = h;
      if (clockT > 0 && dt > 0) {
        clockT -= dt;
        zoo.clockRing.rotation.y += dt * 0.45 * Math.min(1, clockT / 1.5 + 0.1);
        bellT -= dt;
        noteT -= dt;
        if (bellT <= 0 && clockT > 3) {
          bellT = 2.2;
          K.sfx("melee_hit", zoo.clockPos, { pitch: 0.42, volume: 0.9 });
        }
        if (noteT <= 0 && clockT > 1.5) {
          noteT = 0.42;
          K.sfx("ui_select", zoo.clockPos, {
            pitch: TUNE[noteI % TUNE.length],
            volume: 0.5,
          });
          noteI++;
        }
      }
    }
    // the Ark let loose: one raid on the Tavern courtyard the next time the player is nearby outside
    if (PK.flag("gates_open") && !PK.flag("raid_done") && tav && p && dt > 0) {
      raidT -= realDt;
      if (raidT <= 0) {
        raidT = 1;
        const a = tav.anchors.courtyard;
        if (
          a &&
          p.x < G.LAYOUT.INTERIOR_X_MIN &&
          Math.hypot(p.x - a.x, p.z - a.z) < 110
        ) {
          PK.setFlag("raid_done", true);
          const list = [
            ["ppk_raid_bear", "ash_bear", "raid1"],
            ["ppk_raid_rat1", "burrow_rat", "raid2"],
            ["ppk_raid_rat2", "burrow_rat", "raid3"],
            ["ppk_raid_scorp", "stinger", "raid3"],
          ];
          for (const [id, type, an] of list) {
            const s = tav.anchors[an];
            if (s)
              PK.spawnActor(tav, {
                id,
                type,
                faction: "creatures",
                level: 8,
                hostile: true,
                pos: {
                  x: s.x + (Math.random() - 0.5) * 2,
                  y: s.y,
                  z: s.z + (Math.random() - 0.5) * 2,
                },
                ai: "wander",
                home: { x: s.x, z: s.z, r: 10 },
                noRespawn: true,
              });
          }
          K.notify(
            "Screams from Tavern on the Green — the Ark's animals are in the courtyard!",
          );
        }
      }
    }
  }

  // ==================================================================
  // Registrations
  // ==================================================================
  PK.onEnter = function (key) {
    K.safe("disc", () => G.discover(key));
    if (key === "cp_zoo_arsenal" && q.active(QF) && q.stage(QF) === "zoo")
      q.set(QF, "ark");
  };
  let dataDone = false;
