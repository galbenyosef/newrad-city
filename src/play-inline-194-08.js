// play-inline-194 08 — the
// Lines 2873-3207 of readable/play-inline-194.pretty.js (statement-aligned).
  function radioBank(b, x, y, z, face, r) {
    // face 1 = against the west wall (facing +x); 2 = against the north wall (facing +z)
    const w = 1.2,
      d = 0.6,
      h = 2.2;
    if (face === 1)
      b.boxMM("paint_green", x, y, z - w / 2, x + d, y + h, z + w / 2, {
        tint: [0.35, 0.42, 0.36],
      });
    else
      b.boxMM("paint_green", x - w / 2, y, z, x + w / 2, y + h, z + d, {
        tint: [0.35, 0.42, 0.36],
      });
    const fx = face === 1 ? x + d + 0.01 : x,
      fz = face === 1 ? z : z + d + 0.01,
      nx = face === 1 ? 1 : 0,
      nz = face === 1 ? 0 : 1;
    for (let k = 0; k < 6; k++) {
      const u = ((k % 3) - 1) * 0.35,
        v = 0.9 + Math.floor(k / 3) * 0.55;
      const px = fx + (face === 1 ? 0 : u),
        pz = fz + (face === 1 ? u : 0);
      b.cyl("lamp", px, y + v, pz, 0.07, 0.07, 0.01, 10, {
        tint: r() < 0.5 ? [0.9, 0.7, 0.3] : [0.3, 0.9, 0.4],
      });
    }
    b.plate("glass", fx, y + 1.8, fz, nx, nz, 0.9, 0.35, null, {
      tint: [0.2, 0.5, 0.3],
    });
    if (face === 1) b.col(x, y, z - w / 2, x + d, y + h, z + w / 2, {});
    else b.col(x - w / 2, y, z, x + w / 2, y + h, z + d, {});
  }

  // ------------------------------------------------------------------
  // terminals
  // ------------------------------------------------------------------
  // The station ran captured-and-rebadged American line terminals (KESTREL TELETYPE, bought through the front company).
  function termGuard() {
    // left logged in: the last guard on duty never signed off
    return {
      title: "POSTE DRAGON — GUARD STATION",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\nLANGUE: FRANÇAIS/ENGLISH (AUTO)",
      entries: [
        {
          title: "Duty Roster (auto-translated)",
          text: "Watch 1: Sgt. Brault\nWatch 2: Cpl. Vasseur\nWatch 3: Agent Roux (went up to the street, did not return)\nWatch 4: Agent Roux (returned, is not Agent Roux)\n\nNote: Do not let Agent Roux back in.",
        },
        {
          title: "Incident Log",
          text: "5 March '67, Sunday morning: The sky over the Bronx went white. Paris does not answer.\nDay 30: Men sick. Hair falling out. Gums bleeding.\nYear 2: The sick ones who lived are not the same. Bad tempers. Bad dreams. Forgetting.\nYear 7 (1974): Mlle Lys's courier at the Mott Street ladder again. Commandant's order: no answer. \"Let her think the Dragon died clean.\"\nYear 9: Three men lost their minds. Now they run the streets above, screaming. They still salute.\nYear 22: The Maniacs in the restaurant guard the storeroom. We do not know if they remember why. Some days, neither do we.",
        },
      ],
    };
  }
  function termRadio() {
    return {
      title: "RENSEIGNEMENT — INTERCEPT ARCHIVE",
      header: "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL",
      entries: [
        {
          title: "Intercept 1967-03-05, 09:31",
          text: 'SOURCE: US civil defense band.\nCONTENT: "...this is not a drill. Proceed to your designated public shelter..."\nANALYST NOTE: They expected Moscow. It was us. God forgive the men who gave the order. Recording anyway.',
        },
        {
          title: "Intercept 1974",
          text: 'SOURCE: Federal band, heavily encrypted. Speaker calls himself "Acting President."\nANALYST NOTE: The American government survived, after a fashion, and still believes it is 1967. We are recording an enemy who does not know we exist, for a service that may no longer exist. This is the most Bureau thing I have ever done.',
        },
        {
          title: "Intercept 1988",
          text: "SOURCE: Unlicensed Manhattan band.\nCONTENT: Swing music. A DJ tells jokes about the Bombing.\nANALYST NOTE: The jokes are not funny. The music is very good. Played it twice. Do not tell the Commandant.",
        },
        {
          title: "Transmitter Status",
          text: "BEACON: ACTIVE — broadcasting request for extraction, every hour, since March 1967.\nReplies received: 0.",
        },
      ],
    };
  }
  function termCommander() {
    return {
      title: "COMMANDANT — A. DELORME",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\nBUREAU SEPT · POSTE DRAGON · CHEF DE POSTE",
      lock: LK.commander,
      entries: [
        {
          title: "Personal Log — Year 22",
          learn: LK.safe.id,
          text: () => {
            K.learn(LK.safe.id);
            return "I have kept the post. I have kept the records. I have kept the shade suit clean, though no agent will come down that ladder to wear it.\n\nIf an American reads this: I am sorry. We were sent to listen, not to burn your city. Whoever gave the order is beyond your reach and mine.\n\nParis sent us the SIROCCO codebook in February of '67, so that we could read the strike flight's traffic. We were to listen to our own bombers. It is in the grey cipher safe behind my desk; the dial rusted at zero years ago and I never had it fixed. One of their two planes never arrived; if the sun people who scratch at my kitchen wall ever reach that book, God help this city twice. Burn it in my stove if you must. I never could.\n\nThe suit is in the armory locker; the release is below. My own safe is set to the Fête nationale, day then month: 1-4-0-7. Take what you like. Wear it better than we did.";
          },
        },
        {
          title: "Armory Access",
          text: "Authorization accepted. Armory locker released.",
          action: () => {
            PV.unlockTagged("chinatown", "armory");
            PV.setFlag("ct_armory_open", true);
            K.notify("The shade suit locker is unlocked.");
            advance("armory");
          },
        },
        {
          title: "Transmitter — Shut Down Beacon",
          text: "Beacon powered down. After twenty-two years, the Golden Dragon goes silent.",
          action: () => {
            if (!PV.flag("ct_beacon_off")) {
              PV.setFlag("ct_beacon_off", true);
              K.xp(100, "Silenced the Bureau Sept beacon");
              K.notify("The Bureau Sept beacon falls silent.");
            }
          },
        },
      ],
    };
  }

  // ==================================================================
  // DATA, QUEST, SPAWN, UPDATE
  // "Static Over Canal Street" (pv_red_star) — absorbed into the main story as mq31 "Poste Dragon" (Act 5).
  //   passage (the storeroom shelf) → bunker (the listening post) → office (deal with Commandant Delorme / reach his
  //   office) → COMPLETE. Optional: Delorme, the shade suit, the beacon. G.quests.start('pv_red_star') works at any
  //   time (stage synced to the world). The main story (src/quests/67_ms_act5.js) owns the Act 5 beats on top of this:
  //   the SIROCCO codebook in the Commandant's cipher safe (anchor 'cipher_safe'), the Glowkeepers' race and breach,
  //   Brault's 1970 page. This POI provides the set: the open grey cipher safe behind the desk, the Glowkeepers'
  //   fresh digging in the kitchen, the cracked east wall of the office, and the texts that point at all three.
  // ==================================================================
  function wantStage() {
    if (PV.flag("ct_office_seen") || PV.flag("ct_cdt_dead")) return "done";
    if (PV.flag("ct_bunker_seen") || PV.flag("ct_shelf_open")) return "bunker";
    return "passage";
  }
  function sync() {
    if (!K.q.active("pv_red_star")) return;
    const w = wantStage();
    if (w === "done") {
      K.q.complete("pv_red_star");
      return;
    }
    if (K.q.stage("pv_red_star") !== w) K.q.set("pv_red_star", w);
  }
  function advance(to) {
    if (to === "bunker") PV.setFlag("ct_bunker_seen", true);
    if (to === "office") {
      PV.setFlag("ct_bunker_seen", true);
      PV.setFlag("ct_office_seen", true);
    }
    if (!K.q.started("pv_red_star")) K.q.start("pv_red_star");
    sync();
  }
  /** Act 5 (the main story's mq31 running): the Glowkeepers are digging toward the post. */
  const act5 = () => {
    try {
      return (
        !G.isStub("quests") &&
        (G.quests.isStarted("mq31") || G.quests.isComplete("mq30"))
      );
    } catch (e) {
      return false;
    }
  };
  function data(ctx) {
    if (!G.isStub("quests") && G.quests.define) {
      const anchorMarker = (name, label, dz) => () => {
        const a = PV.anchor("chinatown", name);
        return a ? { x: a.x, z: a.z + (dz || 0), y: a.y, label } : null;
      };
      G.quests.define({
        id: "pv_red_star",
        name: "Static Over Canal Street",
        giver: "A scavenger's tape reel",
        location: "Chinatown",
        desc: "A Vanguard scavenger tracked a numbers station to the Golden Dragon restaurant in Chinatown before something in the kitchen found him. The signal comes from underground, and the woman reading the numbers speaks French.",
        stages: [
          {
            id: "passage",
            text: "Find the hidden passage in the Golden Dragon's storeroom.",
            markers: [anchorMarker("shelf", "Storeroom", 1.2)],
          }, // on the open floor in front of the shelf
          {
            id: "bunker",
            text: "Get into the Bureau Sept listening post beneath the Golden Dragon and deal with Commandant Delorme in his office.",
            markers: [anchorMarker("boss", "Commandant's Office")],
          },
          // legacy stage id (saves from before the main story): migrated by sync()
          {
            id: "armory",
            text: "Get into the Bureau Sept listening post beneath the Golden Dragon and deal with Commandant Delorme in his office.",
            hidden: true,
            markers: [anchorMarker("boss", "Commandant's Office")],
          },
          {
            id: "rs_delorme",
            text: "(Optional) Deal with Commandant Delorme.",
            sideObjective: true,
            optional: true,
            showIf: () => !!PV.flag("ct_bunker_seen"),
            doneIf: () => !!PV.flag("ct_cdt_dead"),
          },
          {
            id: "rs_suit",
            text: "(Optional) Claim the Bureau Sept shade suit from the armory (Commandant Delorme's key, or his teletype).",
            sideObjective: true,
            optional: true,
            showIf: () => !!PV.flag("ct_bunker_seen"),
            doneIf: () => !!PV.flag("ct_suit_taken"),
          },
          {
            id: "rs_beacon",
            text: "(Optional) Shut down the Bureau Sept transmitter.",
            sideObjective: true,
            optional: true,
            showIf: () => !!PV.flag("ct_bunker_seen"),
            doneIf: () => !!PV.flag("ct_beacon_off"),
          },
        ],
        rewards: { xp: 400 },
      });
    }
    // keys of this POI
    K.defineItem({
      id: "pv_key_ct_armory",
      type: "key",
      name: "Armory Key (Poste Dragon)",
      weight: 0,
      value: 0,
      desc: "A heavy brass key on a tricolour ribbon, stamped B7 — ARMURERIE.",
    });
    K.defineItem({
      id: "pv_ct_manhole_lifter",
      type: "key",
      name: "Manhole Lifter",
      weight: 1,
      value: 5,
      desc: 'A hooked iron bar for prising up street manhole covers. Someone has scratched "SORTIE" into the handle.',
    });
    // interactables: the shelf, the transmitter, the stove, the fresh digging, the cracked wall
    G.world.addInteractable({
      pos: ctx.anchors.shelf,
      radius: 1.3,
      label: "Heavy Shelf",
      verb: () => (shelf && shelf.open ? "" : "Push"),
      priority: 1,
      enabled: () => !!shelf && !shelf.open,
      onInteract() {
        openShelf(true);
      },
    });
    G.world.addInteractable({
      pos: ctx.anchors.transmitter,
      radius: 1.0,
      label: "Bureau Sept Transmitter",
      verb: "Smash",
      priority: 1,
      enabled: () => !PV.flag("ct_beacon_off"),
      onInteract() {
        PV.setFlag("ct_beacon_off", true);
        K.sfx("robot_death", ctx.anchors.transmitter);
        K.safe("fx", () => G.fx.sparks && G.fx.sparks(ctx.anchors.transmitter));
        K.xp(100, "Silenced the Bureau Sept beacon");
        K.notify(
          "The Bureau Sept beacon falls silent. The agents below will not be pleased.",
        );
      },
    });
    if (ctx.anchors.stove)
      G.world.addInteractable({
        pos: ctx.anchors.stove,
        radius: 1.0,
        label: "Commandant's Stove",
        verb: "Examine",
        priority: 1,
        onInteract() {
          K.notify(
            "A squat iron stove, still warm. The Commandant keeps a fire in it for his tea. A tin of sugar cubes sits on the warming shelf, the lid rusted shut.",
          );
        },
      });
    if (ctx.anchors.dig)
      G.world.addInteractable({
        pos: ctx.anchors.dig,
        radius: 1.2,
        label: "Fresh Digging",
        verb: "Examine",
        priority: 1,
        onInteract() {
          K.notify(
            act5()
              ? "A hole broken through the kitchen tiles, shored with chair legs and candle crates, angled down and south toward the old station. Wax drips on the rubble, still soft. They are close."
              : "A hole broken through the kitchen tiles and shored with chair legs, angled down toward the old station. Wax drips on the rubble. Someone has been digging here, on and off, for a long time.",
          );
        },
      });
    if (ctx.anchors.crack)
      G.world.addInteractable({
        pos: ctx.anchors.crack,
        radius: 1.0,
        label: "Cracked Wall",
        verb: "Listen",
        priority: 1,
        onInteract() {
          K.notify(
            act5()
              ? "You put your ear to the bulging plaster. Picks, close. Somebody on the other side is chanting under their breath, counting rays."
              : "You put your ear to the bulging plaster. Nothing. Then, very faint, a scrape, and a long silence.",
          );
        },
      });
    // contract (src/quests/NOTES.md): the main story may start the quest at any time
    G.events.on("questStarted", (q) => {
      if (q && q.id === "pv_red_star") setTimeout(sync, 0);
    });
    G.events.on("loaded", () => setTimeout(sync, 0));
  }
  function openShelf(byPlayer) {
    if (!shelf || shelf.open) return;
    shelf.open = true;
    shelf.t = byPlayer ? 0 : 1;
    PV.setFlag("ct_shelf_open", true);
    if (shelf.col) {
      G.world.removeCollider(shelf.col);
      shelf.col = null;
    }
    if (byPlayer) {
      K.sfx("door_open", shelf.group.getWorldPosition(new THREE.Vector3()), {
        pitch: 0.6,
      });
      K.notify(
        "The shelf grinds aside. Cold air, machine oil: a stairway leads down.",
      );
      advance("bunker");
    }
  }
