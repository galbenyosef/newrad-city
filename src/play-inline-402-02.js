// play-inline-402 02 — defineitem
// Lines 33-375 of readable/play-inline-402.pretty.js (statement-aligned).
  const PV = G._pv3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const q = K.q;
  const QC = "pv3_contempt",
    QT = "pv3_tower_light";

  const ctxOf = (id) => (PV.ctxs || []).find((c) => c.id === id);
  const V = (a) => (a ? { x: a.x, y: a.y, z: a.z } : null);
  const actor = (id) => {
    try {
      return !G.isStub("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  function isNight() {
    try {
      if (!G.isStub("atmos") && G.atmos.isNight) return !!G.atmos.isNight();
    } catch (e) {
      /* */
    }
    const h = (G.time && G.time.hour) || 12;
    return h < 6.5 || h > 19;
  }
  const payScrip = (n) => K.scrip(-n);
  function marker(poi, name, label, interior) {
    return () => {
      const a = PV.anchor(poi, name);
      return a ? { x: a.x, z: a.z, y: a.y, label, interior } : null;
    };
  }

  // ==================================================================
  // Jefferson Market: cell 2 state, release paths, magistrate verdicts
  // ==================================================================
  function setCellOpen(open) {
    const c = ctxOf("jefferson_market");
    if (!c) return;
    if (c.cellDoorGroup) c.cellDoorGroup.visible = !open;
    if (open && c.cellDoorCol && !c.cellDoorColRemoved) {
      K.safe("cellcol", () => G.world.removeCollider(c.cellDoorCol));
      c.cellDoorColRemoved = true;
    }
    if (!open && c.cellDoorColRemoved) {
      const O = c.O,
        dz0 = -21 - 1.4,
        dz1 = -21 - 0.1,
        BY = PV.JM.BY;
      c.cellDoorCol = G.world.addBox(
        O.x - 6.15,
        O.y + BY,
        O.z + dz0,
        O.x - 5.95,
        O.y + BY + 2.5,
        O.z + dz1,
        { tag: "bars", walkable: false, surface: "metal" },
      );
      c.cellDoorColRemoved = false;
    }
  }
  function courtRobotsHostile() {
    for (const id of [
      "pv3_jm_bailiff1",
      "pv3_jm_bailiff2",
      "pv3_jm_magistrate",
      "pv3_jm_steno",
    ]) {
      const a = actor(id);
      if (a && !a.dead && a.setHostile)
        K.safe("hostile", () => a.setHostile(true));
    }
  }
  PV.jm = {
    dotHeld: () => !PV.flag("dot_free") && !PV.flag("dot_guilty"),
    canPardon: () => PV.jm.dotHeld(),
    release(how) {
      if (!PV.jm.dotHeld()) return;
      PV.setFlag("dot_free", how);
      setCellOpen(true);
      K.sfx(
        "keypad_accept",
        K.world(ctxOf("jefferson_market"), -6.2, PV.JM.BY + 1.2, -22.2),
      );
      if (PV.LK_JM) K.lockUnlock(PV.LK_JM.cell2.id);
      const dot = actor("pv3_dot");
      if (dot && !dot.dead) {
        K.safe("dotsay", () =>
          dot.say(
            how === "trial"
              ? "Not guilty! You hear that, tin can? NOT GUILTY!"
              : how === "pardon"
                ? "A pardon? From a dead judge? I'll take it!"
                : "Run now, thank later!",
          ),
        );
        K.safe("dotmove", () => {
          if (dot.moveTo) {
            const e = PV.anchor("jefferson_market", "entrance");
            if (e) dot.moveTo(e.x, e.z);
          }
        });
      }
      if (how === "jailbreak") {
        PV.setFlag("jm_contempt", true);
        courtRobotsHostile();
        const m = actor("pv3_jm_magistrate");
        if (m && !m.dead)
          K.safe("say", () =>
            m.say("CONTEMPT OF COURT. BAILIFFS: PROPORTIONATE FORCE."),
          );
        K.notify("The court's bailiffs have been ordered to restrain you.");
      } else if (how === "trial") {
        K.standing(20, "Won Fran Zielinski's trial");
      }
      if (q.active(QC)) q.set(QC, "return");
      else {
        q.start(QC);
        q.set(QC, "return");
      }
      // she walks home to Bedford's once the player has left the courthouse (see updateAll)
    },
  };
  function spawnDotAtBedfords() {
    const c = ctxOf("bedfords");
    if (!c || !PV.jm || PV.jm.dotHeld()) return;
    const ex = actor("pv3_dot");
    if (ex && !ex.dead && !ex.removed && !ex._removed) {
      const a = c.anchors.dot;
      if (a && Math.hypot(ex.pos.x - a.x, ex.pos.z - a.z) < 20) return;
      if (ctxOf("jefferson_market").inside) return; // still walking out of the court
      K.safe("dotrm", () => G.actors.remove(ex));
    }
    PV.spawnActor(c, {
      id: "pv3_dot",
      type: "human",
      gender: "f",
      outfit: "merchant",
      name: "Fran Zielinski",
      faction: "settlers",
      level: 6,
      essential: true,
      pos: V(c.anchors.dot),
      yaw: 0,
      ai: "merchant",
      home: "here",
      homeR: 1.5,
      dialogue: "pv3_dlg_dot",
      voice: "settler",
      merchant: {
        scrip: 380,
        stock: K.stock(
          [
            ["scrap_metal", 12],
            ["rally_tonic", 2],
            ["prussian_blue", 1],
            ["scrap_electronics", 3],
            ["dry_cell", 2],
          ],
          "merchant_general",
          5,
        ),
        restock: 3,
        priceMult: PV.flag("dot_discount") ? 0.85 : 1,
      },
      barks: [
        "Buy, sell, no questions.",
        "Nineteen days in a cage. Prices went UP.",
        "Curfew my foot.",
      ],
    });
  }

  // ==================================================================
  // Five Boroughs: regulator, install, security stand-down
  // ==================================================================
  PV.ce = {
    pacified: () => !!PV.flag("ce_pacified"),
    pacify() {
      PV.setFlag("ce_pacified", true);
      calmRobots();
      K.xp(60, "Relieved the Five Boroughs security units");
      K.notify("Five Boroughs security robots are standing down.");
    },
    canInstall: () => !PV.flag("ce_mode") && K.has("pv3_arc_regulator"),
    install(mode) {
      if (!PV.ce.canInstall()) return;
      K.take("pv3_arc_regulator", 1);
      PV.setFlag("ce_mode", mode);
      K.setQFlag("ms_tower_light", mode); // main story: the finale's epilogue may mention the Tower of Light (outline: pv3_tower_light)
      const c = ctxOf("five_boro_tower");
      if (c && c.lensGroup) c.lensGroup.visible = mode === "beacon";
      K.sfx("terminal_success");
      K.xp(
        150,
        mode === "beacon"
          ? "Relit the Tower of Light"
          : "Powered the Village grid",
      );
      K.standing(mode === "beacon" ? 25 : 15, "Tower of Light");
      K.safe("news", () => {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            mode === "beacon"
              ? "Folks, look downtown tonight: the old Five Boroughs clock tower is LIT. Somebody climbed up there and turned on the Tower of Light. First time since the bombs. Makes you want to believe in something."
              : "Word from the Village: the street lamps on Bedford Street came on last night. Bedford's has electric light. Somebody turned the power back on down there, and they're not even charging for it.",
          );
      });
      if (!q.started(QT)) q.start(QT);
      if (q.active(QT)) q.set(QT, "return");
    },
  };
  function calmRobots() {
    const c = ctxOf("five_boro_tower");
    if (!c || G.isStub("actors")) return;
    K.safe("calm", () => {
      for (const a of G.actors.inRadius(c.O, 170))
        if (a && !a.dead && a.faction === "robots" && a.setHostile)
          a.setHostile(false);
    });
  }

  // ==================================================================
  // DATA (initDone): items, quests, dialogues, world interactables
  // ==================================================================
  function items() {
    K.defineItem({
      id: "pv3_gin",
      type: "aid",
      name: "Bedford's Bathtub Gin",
      weight: 0.5,
      value: 6,
      tags: ["drink", "alcohol"],
      mesh: "bottle_whiskey",
      sound: "drink",
      effects: { duration: 180, attrs: { presence: 1, wits: -1 } },
      desc: "Distilled in the cellar, aged in the bathtub, served in a teacup out of respect for a law that has been repealed once and bombed once.",
    });
    K.defineItem({
      id: "pv3_pigeon_stew",
      type: "aid",
      name: "Pigeon Stew",
      weight: 0.5,
      value: 9,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hpOverTime: [40, 12] },
      desc: 'Pigeon bits, potato, a gnarlberry for sweetness and a secret ingredient Lee will only describe as "municipal."',
    });
    K.defineItem({
      id: "pv3_ordinance",
      type: "misc",
      name: "Local Law 44 of 1966 (bound copy)",
      weight: 1,
      value: 5,
      tags: ["quest"],
      desc: 'A bound volume of the 1966 municipal code, dog-eared at page 1,183: "Local Law 9 of 1957 (Public Curfew) is hereby REPEALED." Stamped CERTIFIED TRUE COPY. The court will want to see this.',
    });
    K.defineItem({
      id: "pv3_dots_effects",
      type: "misc",
      name: "Fran's Confiscated Effects",
      weight: 1,
      value: 20,
      tags: ["quest"],
      desc: "An evidence bag: a brass lighter engraved \"D.K.\", a trader's ledger, and a lucky rabbit's foot that has not, so far, been especially lucky.",
    });
    K.defineItem({
      id: "pv3_spyglass",
      type: "misc",
      name: "Fire Watchman's Spyglass",
      weight: 1,
      value: 180,
      tags: ["valuable", "unique"],
      desc: 'Brass, dented, engraved "JEFFERSON MKT. FIRE LOOKOUT — 1877". The last man who looked through it saw the Bronx catch fire at once.',
    });
    K.defineItem({
      id: "pv3_bootleg_ledger",
      type: "note",
      name: "Bootlegger's Ledger, 1928",
      weight: 0,
      value: 25,
      text: 'MARCH 1928\n40 cs. "medicinal" — Dr. P.\n12 cs. to the Courthouse (Judge\'s chambers, back stair, ASK FOR MIKE)\n6 cs. to Tammany (no charge. Insurance.)\n\nAPRIL 1928\nRaid Tuesday. Tipped by the desk sgt. at 6th Precinct — 86 at 9:40, all out the Bedford door, clean.\n\nNOTE: the tunnel floods at high tide. Move the good stuff.',
      desc: "A water-stained ledger from the speakeasy's first decade.",
    });
    K.defineItem({
      id: "pv3_fiveboro_key",
      type: "key",
      name: "Five Boroughs Supervisor Keycard",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: 'Laminated, cracked, clipped to a lanyard that says "SYSTEM OPERATIONS — KEEP THE LIGHTS ON". Opens the executive elevator to the tower.',
    });
    K.defineItem({
      id: "pv3_key_jm_cells",
      type: "key",
      name: "Detention Key Ring (spare)",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: 'Five iron keys on a ring tagged "WOMEN\'S HOUSE OF DETENTION — ANNEX — BAILIFF SPARES". The bailiffs never needed them. Bailiffs have claws.',
    });
    K.defineItem({
      id: "pv3_key_ch_grate",
      type: "key",
      name: "Rusted Grate Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: "A long, rust-brown padlock key on a loop of twine. Somebody in the cellar has been meaning to see what is behind that grate for years.",
    });
    K.defineItem({
      id: "pv3_arc_regulator",
      type: "misc",
      name: "Arc Regulator",
      weight: 4,
      value: 150,
      tags: ["quest"],
      desc: "A copper drum the size of a coffee can with a glass eye that glows faintly blue. It hums. It is the only thing between the Tower of Light and another night of darkness.",
    });
    K.defineItem({
      id: "pv3_linemans_pin",
      type: "misc",
      name: "Local 3 Lineman's Pin",
      weight: 0,
      value: 45,
      tags: ["valuable"],
      desc: 'Enamel lightning bolt over a tower: "I.B.E.W. LOCAL 3 — 25 YEARS". Hazel would want to see this.',
    });
    K.defineItem({
      id: "pv3_linemans_lamp",
      type: "misc",
      name: "Hazel's Lineman Lamp",
      weight: 1,
      value: 220,
      tags: ["valuable", "unique"],
      desc: "A battered brass hand lamp with a Five Boroughs decal and a dry cell that still works. Hazel carried it through the Blackout of 1965. She gave it to you.",
    });
  }

