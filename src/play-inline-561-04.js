// play-inline-561 04 — barks
// Lines 763-1105 of readable/play-inline-561.pretty.js (statement-aligned).
  L.hook("spawn", function () {
    // ---- Chrysler sniper ----
    if (!L.flag("dolores_left")) {
      const recruited = L.flag("dolores_recruited");
      L.spawnNPC({
        id: "chr_dolores",
        type: "human",
        name: "Deadeye Dolores",
        outfit: recruited ? "combat_armor" : "raider",
        gender: "f",
        faction: recruited ? "settlers" : "raiders",
        ai: "guard",
        home: "here",
        homeR: 2,
        hostile: false,
        level: 9,
        hp: 180,
        weapon: ["sniper_rifle", "hunting_rifle"],
        at: recruited
          ? {
              site: "grand_central",
              anchors: ["guard3", "rooftop", "entrance"],
              fallback: { x: 256, z: -186 },
            }
          : {
              site: "chrysler",
              anchors: ["sniper", "rooftop", "crown", "boss"],
              fallback: { x: CHRYSLER.x - 6, z: CHRYSLER.z + 22 },
            },
        dialogue: "dlg_chr_dolores",
        inventory: [
          ["q_note_dolores_diary", 1],
          ["ammo_308", 20],
        ],
        barks: recruited
          ? [
              "Supply run's clear. I've got eyes on 42nd.",
              "Nobody touches the pack-bots on my watch.",
            ]
          : ["Nice day for it.", "Keep walking, Frosty."],
      });
    }
    // ---- Brooklyn Bridge toll gang ----
    const bb = (anchors, dx, dz) => ({
      site: "brooklyn_bridge",
      anchors,
      fallback: { x: 178 + dx, z: 640 + dz },
    });
    {
      const hostile = !!L.flag("bridge_hostile");
      L.spawnNPC({
        id: "bb_tony",
        type: "human",
        name: "Tollbooth Tony",
        outfit: "raider_heavy",
        gender: "m",
        faction: "raiders",
        ai: "guard",
        home: "here",
        homeR: 3,
        hostile,
        level: 8,
        hp: 220,
        weapon: ["sawed_off_shotgun", "combat_shotgun"],
        inventory: [
          ["q_toll_collector_cap", 1],
          ["scrip", 120],
          ["q_note_toll_rates", 1],
        ],
        at: bb(["toll_boss", "toll", "boss", "manhattan_ramp"], 0, 0),
        dialogue: "dlg_bb_tony",
        barks: L.flag("bridge_legit")
          ? [
              "Brooklyn Bridge Toll Authority! Receipts available!",
              "Have a nice crossing!",
            ]
          : ["Toll's twenty. Complaints are fifty.", "Exact change, pal."],
      });
      L.spawnNPC({
        id: "bb_knuckles",
        type: "human",
        name: "Knuckles",
        outfit: "raider",
        gender: "m",
        faction: "raiders",
        ai: "guard",
        home: "here",
        homeR: 4,
        hostile,
        level: 5,
        weapon: ["lead_pipe", "baseball_bat"],
        at: bb(["toll_guard1", "footlocker", "spawn1"], 4, -4),
        barks: ["Pay the man.", "Boss says pay."],
      });
      L.spawnNPC({
        id: "bb_deedee",
        type: "human",
        name: "Dee-Dee",
        outfit: "raider",
        gender: "f",
        faction: "raiders",
        ai: "guard",
        home: "here",
        homeR: 4,
        hostile,
        level: 5,
        weapon: ["bolt_rifle_32", "pistol_32"],
        at: bb(["toll_guard2", "spawn1", "spawn2"], 4, 4),
        barks: ["Nice snowsuit. Toll's double for snowsuits.", "Heh."],
      });
    }
    // ---- Flatiron Trading Post ----
    const fl = (anchors, dx, dz) => ({
      site: "flatiron",
      anchors,
      fallback: { x: FLAT.x + dx, z: FLAT.z + dz },
    });
    L.spawnNPC({
      id: "fl_hattie",
      type: "human",
      name: "Hattie Caldwell",
      outfit: "merchant",
      gender: "f",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: fl(["merchant1", "wagon", "entrance"], -4, -32),
      dialogue: "dlg_fl_hattie",
      essential: true,
      merchant: { scrip: 500, stock: STOCK_WAGON, restock: 3 },
      barks: [
        "Caldwell & Daughters — we deliver! Usually!",
        "Anybody seen a pack-bot named Dolly?",
      ],
      skinTone: 0.6,
    });
    L.spawnNPC({
      id: "fl_gus",
      type: "human",
      name: "Gus Papadakis",
      outfit: "drifter",
      gender: "m",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: fl(["merchant2", "shop", "stall1"], 6, -30),
      dialogue: "dlg_fl_gus",
      merchant: { scrip: 400, stock: STOCK_GUS, restock: 3 },
      barks: [
        "Gus buys junk, Gus sells junk. Gus IS junk, some days.",
        "Best armour on Broadway! Only armour on Broadway!",
      ],
      hair: "beard",
    });
    L.spawnNPC({
      id: "fl_kwan",
      type: "human",
      name: "Nurse Abigail Kwan",
      outfit: "doctor",
      gender: "f",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: fl(["doctor", "clinic"], 9, 23),
      dialogue: "dlg_fl_kwan",
      merchant: {
        scrip: 250,
        stock: [
          [["rally_tonic"], 5],
          [["prussian_blue"], 3],
          [["iodine_tabs"], 2],
          [["morphine_syrette"], 1],
        ],
        restock: 3,
      },
      barks: [
        "Hold still. This will hurt, and then it won't.",
        "Wash your hands! Out here that's half of medicine.",
      ],
      skinTone: 0.35,
    });
    L.spawnNPC({
      id: "ws_charlie",
      type: "human",
      name: "Chess Charlie",
      outfit: "survivor_layers",
      gender: "m",
      faction: "settlers",
      ai: "sit",
      home: "here",
      essential: true,
      at: {
        site: "washington_square",
        anchors: ["chess", "fountain"],
        fallback: { x: 56, z: 447 },
      },
      dialogue: "dlg_ws_charlie",
      barks: [
        "Game? Five scrip a game. Ten if you're any good.",
        "Your move. Your move. It's been your move for a while, pal.",
      ],
      voice: "settler",
    });

    // ---- Wagon wreck & Woolworth strongbox ----
    if (!L.flag("wagon_done")) {
      const w = L.freeSpot(WRECK.x, WRECK.z, 0, { maxR: 8 });
      L.dyn(
        L.prop("skeleton", { x: w.x + 1.5, y: w.y, z: w.z + 0.5, yaw: 2.1 }),
      );
      L.dyn(L.prop("crate", { x: w.x - 1.2, y: w.y, z: w.z - 0.8, yaw: 0.4 }));
      L.pickup("wagon_manifest", "q_note_wagon_manifest", 1, {
        x: w.x + 0.6,
        y: w.y,
        z: w.z + 0.2,
      });
      if (!L.has("q_caldwell_strongbox")) {
        const s = L.anchor(
          "woolworth",
          ["loot", "boss", "footlocker", "entrance"],
          { x: 0, z: 625 },
        );
        if (s) {
          L.pickup("strongbox", "q_caldwell_strongbox", 1, s);
          L.pickup("woolworth_note", "q_note_raider_woolworth", 1, {
            x: s.x + 0.7,
            y: s.y,
            z: s.z,
          });
        }
      }
    }
    // ---- Met: CURATOR-7 ----
    {
      L.spawnNPC({
        id: "met_curator",
        type: "valet",
        name: "CURATOR-7",
        faction: "settlers",
        ai: "guard",
        home: "here",
        homeR: 3,
        hostile: false,
        essential: true,
        at: {
          site: "met",
          anchors: ["curator", "steps", "entrance"],
          fallback: { x: MET.x + 36, z: MET.z },
        },
        dialogue: "dlg_met_curator",
        barks: [
          "Welcome to the Metropolitan Museum of Art! Please do not touch the exhibits.",
          "Flash photography is strictly forbidden. So are flamers.",
          "The gift shop is closed. Permanently. Please enjoy the gift of knowledge.",
        ],
        voice: "robot_posh",
      });
    }
    // ---- Battery Park: Ossie ----
    const pier = batteryPier();
    L.spawnNPC({
      id: "bp_ossie",
      type: "human",
      name: "Ossie",
      outfit: "survivor_layers",
      gender: "m",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 2,
      pos: pier,
      dialogue: "dlg_bp_ossie",
      essential: true,
      weapon: ["hunting_rifle"],
      level: 8,
      barks: [
        "Ferry's leavin'. Eventually.",
        "Mind the shellbacks. They mind you.",
        "Hundred scrip to Liberty. No refunds if you die.",
      ],
      voice: "settler",
    });
    L.pickup("ferry_sign", "q_note_ossie_sign", 1, {
      x: pier.x + 1.2,
      y: pier.y,
      z: pier.z - 0.6,
    });
  });

  // ------------------------------------------------------------------
  // Ferry. landmarks_b moors a "Harbor Skiff" door at Battery Park: it is
  // Ossie's boat, so it only runs once Ossie has agreed to take you.
  // ------------------------------------------------------------------
  function ferryAllowed() {
    return (
      L.has("q_ferry_token") ||
      !!L.flag("ferry_paid") ||
      !!L.flag("ossie_free_ride") ||
      !!L.flag("ending_played") ||
      (covenantSided() && (Q.isActive("mq06") || Q.isActive("mq24")))
    );
  }
  L.ferryAllowed = ferryAllowed;
  function gateSkiff() {
    for (const d of L.doors()) {
      const p = d.def && d.def.pos,
        t = d.def && d.def.target;
      if (!p || !t) continue;
      if (
        p.x > -200 &&
        p.x < 150 &&
        p.z > 900 &&
        p.z < 1060 &&
        Math.hypot(t.x - G.LAYOUT.LIBERTY.x, t.z - G.LAYOUT.LIBERTY.z) < 80 &&
        !d._questGated
      ) {
        d._questGated = true;
        const prev = d.enabled;
        d.enabled = () => ferryAllowed() && (!prev || prev());
        // A stand-in prompt so the player knows who to talk to.
        G.world.addInteractable({
          pos: p,
          radius: d.radius || 1.6,
          label: "Harbor Skiff (talk to Ossie)",
          verb: "Ride",
          priority: 0.5,
          enabled: () => !ferryAllowed(),
          onInteract() {
            L.say(
              "bp_ossie",
              "Hey! HEY! That's my boat! Hundred scrip, then you ride.",
            );
            L.sfx("door_locked");
          },
        });
      }
    }
  }
  L.hook("world", gateSkiff);

  // ------------------------------------------------------------------
  // Ferry travel
  // ------------------------------------------------------------------
