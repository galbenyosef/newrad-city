/* src/poi_village3/80_content.js */
/* =====================================================================
 * NEW RAD CITY — poi_village3 / 80_content.js
 * Gameplay content for the three Village-3 POIs + their PV.define()
 * registrations (build = exterior + interior files):
 *
 *   ITEMS      — bathtub gin, pigeon stew, Local Law 44 (evidence), Fran's
 *                confiscated effects, the watchman's spyglass, bootleg
 *                ledger, Five Boroughs keycard, detention & grate keys, arc
 *                regulator, lineman's pin & lamp (unique rewards).
 *   QUESTS     — "Contempt of Court" (Lee Bedford → free Fran Zielinski from
 *                the robot court: win the trial, enter a pardon in
 *                chambers, or break her out with the bailiffs' own key
 *                ring / cell-control teletype and face the bailiffs) and
 *                "Tower of Light" (Hazel Adeyemi → fight through the Five Boroughs
 *                robots, recover an arc regulator, then choose BEACON
 *                (relight the tower) or GRID (power the Village: Bedford's
 *                generator, courtyard lights, the courthouse clock)).
 *   NPCS       — Bedford's: Lee (bartender/merchant), Hazel, Vernon the
 *                poet, KEYS the piano-playing Valet, Ox at the gate,
 *                settlers; Fran (cell → Bedford's trader). Courthouse:
 *                Magistrate MK-IX and two Bailiff-Bots (Ardent Robotics
 *                Patrolman units), the Sky-Eye court stenographer.
 *                Five Boroughs: GRIDLOCK (named Bulwark boss).
 *   WORLD      — the fire bell, cell 2's lock, the regulator rack; lit
 *                groups follow the Tower of Light choice; sparks & arcs.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
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

  function quests() {
    if (G.isStub("quests") || !G.quests.define) return;
    G.quests.define({
      id: QC,
      name: "Contempt of Court",
      giver: "Lee Bedford",
      location: "Jefferson Market Courthouse",
      desc: "Fran Zielinski, Bedford's trader, was arrested by the courthouse robots for breaking a curfew from 1957. The Magistrate unit is still in session. Get her out — by law, by pardon, or with the bailiffs' own keys.",
      stages: [
        {
          id: "find",
          text: "Find out what happened to Fran at the Jefferson Market Courthouse.",
          markers: [
            () => {
              const c = ctxOf("jefferson_market");
              const a = c && c.anchors.door;
              return a
                ? { x: a.x, z: a.z, label: "Jefferson Market Courthouse" }
                : null;
            },
          ],
        },
        {
          id: "defend",
          text: "Free Fran: win her case before Magistrate MK-IX, issue a pardon from the judge's chambers, or break her out (spare cell keys in the evidence room, or the cell-control teletype).",
          markers: [
            marker(
              "jefferson_market",
              "judge",
              "Magistrate MK-IX",
              "jefferson_market",
            ),
            marker(
              "jefferson_market",
              "dot_cell",
              "Cell 2",
              "jefferson_market",
            ),
          ],
        },
        {
          id: "return",
          text: "Tell Lee at Bedford's that Fran is free.",
          markers: [{ npc: "pv3_lee", label: "Lee" }],
        },
      ],
      rewards: { xp: 250, scrip: 80 },
    });
    G.quests.define({
      id: QT,
      name: "Tower of Light",
      giver: "Hazel Adeyemi",
      location: "Five Boroughs Tower of Light",
      desc: "Hazel Adeyemi, an old lineman from Five Boroughs Local 3, says Transformer B in the Five Boroughs building is still energised. With an arc regulator in the tower's lantern, the Village could have power — or Manhattan could have its beacon back.",
      stages: [
        {
          id: "enter",
          text: "Get inside the Five Boroughs Power building on 15th Street.",
          markers: [
            () => {
              const c = ctxOf("five_boro_tower");
              const a = c && c.anchors.door;
              return a
                ? { x: a.x, z: a.z, label: "Five Boroughs Power Tower" }
                : null;
            },
          ],
        },
        {
          id: "regulator",
          text: "Recover an arc regulator from rack B in the transformer hall.",
          markers: [
            marker("five_boro_tower", "regulator", "Rack B", "five_boro_tower"),
          ],
        },
        {
          id: "crown",
          text: "Take the executive elevator to the tower and install the regulator in the lantern room.",
          markers: [
            marker(
              "five_boro_tower",
              "beacon",
              "Lantern Room",
              "five_boro_tower",
            ),
          ],
        },
        {
          id: "return",
          text: "Tell Hazel at Bedford's what you did with the power.",
          markers: [{ npc: "pv3_hazel", label: "Hazel" }],
        },
      ],
      rewards: { xp: 400, scrip: 120 },
    });
  }

  function dialogues() {
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const D = G.dialogue;

    // ---------------------------------------------------------------- Magistrate MK-IX
    const verdict = (how) => () => {
      PV.setFlag("trial_won", how);
      PV.jm.release("trial");
    };
    D.register("pv3_dlg_magistrate", {
      start: () =>
        !PV.jm.dotHeld() ? "after" : PV.flag("trial_lost") ? "again" : "hello",
      nodes: {
        hello: {
          speaker: "Magistrate MK-IX",
          text: "ORDER. ORDER IN THE COURT. [The robot raps its gavel. The bench shakes.] The Third Judicial District of the City of New York is now in session. It has been in session for 8,036 consecutive days. State your business.",
          responses: [
            {
              text: "I'm here about Fran Zielinski.",
              next: "case",
              action: () => {
                if (!q.started(QC)) q.start(QC);
                if (q.active(QC)) q.set(QC, "defend");
              },
            },
            { text: "What is this place?", next: "lore" },
            { text: "Nothing. Carry on.", end: true },
          ],
        },
        again: {
          speaker: "Magistrate MK-IX",
          text: "Counsel for the defence returns. Has counsel located anything resembling evidence?",
          responses: [
            { text: "I have. Let's proceed.", next: "trial" },
            { text: "Not yet.", end: true },
          ],
        },
        lore: {
          speaker: "Magistrate MK-IX",
          text: "The Jefferson Market Courthouse. Built 1877. Presiding: Ardent Robotics Judicial Automation Pilot unit MK-IX, installed on a Friday in March 1967. The human judge requested Monday off. The court has granted it. Indefinitely.",
          responses: [
            { text: "Who do you put on trial these days?", next: "docket" },
            {
              text: "About Fran Zielinski...",
              next: "case",
              cond: () => PV.jm.dotHeld(),
              action: () => {
                if (!q.started(QC)) q.start(QC);
                if (q.active(QC)) q.set(QC, "defend");
              },
            },
            { text: "Goodbye.", end: true },
          ],
        },
        docket: {
          speaker: "Magistrate MK-IX",
          text: "Pigeons, primarily. Littering. The weather, for arson; the weather has never appeared. And one human, the first in twenty-two years. The court was very excited. The court is still very excited.",
          responses: [
            {
              text: "That human is Fran Zielinski.",
              next: "case",
              cond: () => PV.jm.dotHeld(),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        case: {
          speaker: "Magistrate MK-IX",
          text: "Docket 67-0413. The People versus Frances Zielinski. Charges: violation of curfew under Local Law 9 of 1957; resisting a bailiff. The defendant has been held nineteen days awaiting counsel. The court asks: are you counsel?",
          responses: [
            { text: "Yes. I'll represent her.", next: "trial" },
            { text: "What's the penalty?", next: "penalty" },
            { text: "She's guilty. Keep her.", next: "guilty", standing: -40 },
            { text: "Not yet.", end: true },
          ],
        },
        penalty: {
          speaker: "Magistrate MK-IX",
          text: "Ninety days, or until the curfew ends, whichever is sooner. The curfew ends at 05:00. The court has not observed a 05:00 since the clock stopped at 9:47.",
          responses: [
            { text: "So... forever.", next: "forever" },
            { text: "I'll represent her.", next: "trial" },
          ],
        },
        forever: {
          speaker: "Magistrate MK-IX",
          text: 'The court prefers "pending." Forever is not a legal term.',
          responses: [
            { text: "I'll represent her.", next: "trial" },
            { text: "Goodbye.", end: true },
          ],
        },
        trial: {
          speaker: "Magistrate MK-IX",
          text: "The court recognises counsel for the defence. [A Sky-Eye stenographer drone swivels towards you and begins to click.] The court reminds counsel that Local Law 9 is valid law. Proceed.",
          responses: [
            {
              text: "[Present Local Law 44] Your Honor, the curfew was repealed in 1966. Certified copy, page 1,183.",
              cond: () => K.has("pv3_ordinance"),
              next: "acquit_law",
              action: verdict("law"),
            },
            {
              text: "[Persuasion 60] The city that passed that curfew doesn't exist. There's nobody left for her to be home with.",
              check: { skill: "persuasion", value: 60 },
              next: "acquit_speech",
              failNext: "overruled",
              action: verdict("speech"),
            },
            {
              text: "[Electronics 50] Your case-law core is missing its repeal tables. Service ticket 88213. You're ruling on corrupted data.",
              check: { skill: "electronics", value: 50 },
              next: "acquit_data",
              failNext: "overruled",
              action: verdict("data"),
            },
            {
              text: "[Presence 7] She resisted because your bailiff grabbed her with a hydraulic claw. That's excessive force.",
              check: { attr: "presence", value: 7 },
              next: "acquit_speech",
              failNext: "overruled",
              action: verdict("presence"),
            },
            { text: "I need time to prepare.", next: "recess" },
          ],
        },
        overruled: {
          speaker: "Magistrate MK-IX",
          text: "OVERRULED. [Gavel.] The court is unmoved by rhetoric. The court is moved by statute. Bring the court evidence, counsel. The law library is through the clerk's office. The court is aware nobody has used it since 1967.",
          onEnter: () => PV.setFlag("trial_lost", true),
          responses: [{ text: "Fine.", end: true }],
        },
        recess: {
          speaker: "Magistrate MK-IX",
          text: 'Recess granted. The defendant will remain in custody. The defendant has asked the court to tell you, quote, "hurry up."',
          responses: [{ text: "Goodbye.", end: true }],
        },
        acquit_law: {
          speaker: "Magistrate MK-IX",
          text: "[The robot reads. And reads. A fan spins up somewhere inside it.] ...Local Law 44 of 1966. Repeal table... updated. The court finds the defendant NOT GUILTY on all counts. Bailiff: release the defendant. [A long pause.] The court apologises for the nineteen days. The court is not programmed to apologise. The court is doing it anyway.",
          responses: [{ text: "Thank you, Your Honor.", end: true }],
        },
        acquit_speech: {
          speaker: "Magistrate MK-IX",
          text: "[Silence. Then, quietly:] The court has reviewed the population data of the jurisdiction. The court... had not reviewed it recently. Case dismissed in the interest of justice. Bailiff, release the defendant.",
          responses: [{ text: "Thank you, Your Honor.", end: true }],
        },
        acquit_data: {
          speaker: "Magistrate MK-IX",
          text: "Ticket 88213... confirmed. Integrity fault in the statute index. The court cannot convict on a corrupted record. Mistrial. The defendant is released. The court will be filing a complaint with Ardent Robotics. The court expects a reply shortly.",
          responses: [{ text: "I wouldn't hold your breath.", end: true }],
        },
        guilty: {
          speaker: "Magistrate MK-IX",
          text: "The court notes that counsel has... stipulated to guilt. Unusual. Efficient. The defendant will remain in custody. The court thanks the friend of the court with a witness fee. [A drawer opens. Scrip.]",
          onEnter: () => {
            PV.setFlag("dot_guilty", true);
            K.scrip(60);
            if (q.active(QC)) q.fail(QC);
          },
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        after: {
          speaker: "Magistrate MK-IX",
          text: () =>
            PV.flag("trial_won")
              ? "The court is in session. The court has updated its repeal tables. The court has also, on reflection, dismissed all charges against the pigeons."
              : "The court is in session. The court has nothing further for counsel.",
          responses: [{ text: "Goodbye, Your Honor.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Fran Zielinski
    D.register("pv3_dlg_dot", {
      start: () =>
        PV.jm.dotHeld()
          ? "cell"
          : K.has("pv3_dots_effects")
            ? "effects"
            : PV.flag("met_dot_free")
              ? "again"
              : "free",
      nodes: {
        cell: {
          speaker: "Fran Zielinski",
          text: "Hey. HEY. You're not a robot. Tell me you're not a robot.",
          responses: [
            { text: "Who are you?", next: "who" },
            {
              text: "I'm getting you out of here.",
              next: "plan",
              action: () => {
                if (!q.started(QC)) q.start(QC);
                if (q.active(QC)) q.set(QC, "defend");
              },
            },
            { text: "Hang in there.", end: true },
          ],
        },
        who: {
          speaker: "Fran Zielinski",
          text: "Fran Zielinski. I trade out of Bedford's, a block west on 7th. Walked home at 10:14 PM and a bailiff the size of a fridge tells me I broke curfew. A curfew from 1957! I said \"pal, there hasn't been a city for twenty-two years.\" It charged me with resisting.",
          responses: [
            {
              text: "I'm getting you out.",
              next: "plan",
              action: () => {
                if (!q.started(QC)) q.start(QC);
                if (q.active(QC)) q.set(QC, "defend");
              },
            },
            { text: "Tough break.", end: true },
          ],
        },
        plan: {
          speaker: "Fran Zielinski",
          text: "Okay. Okay! Options. One: the judge — it's a robot, it LOVES paperwork, find it some. Two: the old human judge had a terminal in chambers, upstairs past the courtroom. Three: the bailiffs keep a spare key ring in the evidence room down the hall — the clerk upstairs wrote the locker codes down, robots LOVE writing things down. Or the guard post teletype. Either way the bailiffs get very... proportionate.",
          responses: [{ text: "Leave it to me.", end: true }],
        },
        free: {
          speaker: "Fran Zielinski",
          onEnter: () => PV.setFlag("met_dot_free", true),
          text: () =>
            PV.flag("dot_free") === "jailbreak"
              ? "You broke me out of a robot jail. Most romantic thing anybody's done for me in a decade. Come on, let's trade — friends-and-accomplices discount."
              : "A free woman! Come see what I've got. Friends of Fran get the good prices. Friends of Fran are currently: you.",
          responses: [
            {
              text: "Let's trade.",
              barter: true,
              end: true,
              action: () => PV.setFlag("dot_discount", true),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Fran Zielinski",
          text: "Buy, sell, no questions. After curfew, even.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        effects: {
          speaker: "Fran Zielinski",
          text: "Is that... my lighter? My LEDGER? You went into the evidence room for my stuff?",
          responses: [
            {
              text: "Here. It's yours.",
              next: "thanks",
              action: () => {
                K.take("pv3_dots_effects", 1);
                K.scrip(60);
                K.xp(50, "Returned Fran's effects");
                K.standing(10, "Returned Fran's effects");
                PV.setFlag("dot_discount", true);
              },
            },
            { text: "Finders keepers.", next: "keep", standing: -10 },
          ],
        },
        thanks: {
          speaker: "Fran Zielinski",
          text: "Sixty scrip and my undying gratitude, which is worth more, although you can't spend it. Anytime you need something, you know where the cellar is.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Take care, Fran.", end: true },
          ],
        },
        keep: {
          speaker: "Fran Zielinski",
          text: "...Wow. Okay. Robots were nicer to me, and they locked me in a cage.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Lee Bedford
    D.register("pv3_dlg_lee", {
      start: () => {
        if (q.active(QC) && q.stage(QC) === "return") return "dot_back";
        return PV.flag("met_lee") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Lee Bedford",
          onEnter: () => PV.setFlag("met_lee", true),
          text: "No sign, no names, no trouble. You found the door, so you're either a friend or a very lucky raider. [He looks you over.] Friend. Probably. What'll it be?",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "What is this place?", next: "history" },
            { text: "Got any work?", next: "work" },
            { text: "A gin. Whatever's cheapest.", next: "gin" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Lee Bedford",
          text: () =>
            PV.flag("ce_mode") === "grid"
              ? "Electric light! In MY bar! I keep turning it off and on just to watch it work. What'll it be?"
              : "Back again. What'll it be?",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "A gin.", next: "gin" },
            { text: "Tell me about this place.", next: "history" },
            {
              text: "Got any work?",
              next: "work",
              cond: () => !q.started(QC) || !q.started(QT),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        gin: {
          speaker: "Lee Bedford",
          text: () =>
            PV.flag("ch_broke")
              ? "Three scrip. You don't have three scrip. Come back when you do. The gin isn't going anywhere. Neither is anybody."
              : "[He pours clear liquid into a teacup.] Bathtub gin. Served in a teacup, out of respect for Prohibition. Three scrip.",
          onEnter: () => {
            if (K.scripCount() >= 3) {
              payScrip(3);
              K.give("pv3_gin", 1);
              PV.setFlag("ch_broke", false);
            } else PV.setFlag("ch_broke", true);
          },
          responses: [
            { text: "Why a teacup?", next: "teacup" },
            { text: "Thanks.", end: true },
          ],
        },
        teacup: {
          speaker: "Lee Bedford",
          text: "Prohibition. 1920 to 1933. If the cops came in, it was tea. Prohibition's been over for fifty-six years. We're still ready.",
          responses: [{ text: "Ha. Goodbye.", end: true }],
        },
        history: {
          speaker: "Lee Bedford",
          text: "Bedford's. Speakeasy since 1922. The first Leland built it with two doors and no sign so the cops never knew which to watch. The bombs didn't find it either. Writers drank here — every jacket on those walls is somebody's masterpiece, to hear them tell it.",
          responses: [
            { text: 'Why do people say "eighty-sixed"?', next: "eightysix" },
            { text: "You're a Bedford?", next: "name" },
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        eightysix: {
          speaker: "Lee Bedford",
          text: 'Door number 86, on the avenue side. When a cop tipped us off, the bartender yelled "eighty-six!" and everybody went out that door. Now it means you\'re cut off. Same thing, really. [He points at the kitchen.] Still works, by the way. Knock and say "teacup" through the slot and Ox\'ll let you in that way. Same password since 1922.',
          learn: "pv3_lk_ch_door86",
          onEnter: () => K.learn("pv3_lk_ch_door86"),
          responses: [{ text: "Good to know.", end: true }],
        },
        name: {
          speaker: "Lee Bedford",
          text: "Great-great-great-somebody's-nephew. There's always a Bedford behind this bar. I just happen to be the one the Bombing left standing when the rest went. Stubbornness runs in the family now.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        work: {
          speaker: "Lee Bedford",
          text: "Two things. Fran Zielinski — our trader — went out after dark nineteen days back and never came home. Word is the robots at the Jefferson Market Courthouse arrested her. For CURFEW. And Hazel in the back room has a notion about the Five Boroughs tower she won't shut up about.",
          responses: [
            {
              text: "I'll look into Fran.",
              cond: () => !q.started(QC),
              next: "dot_ok",
              action: () => q.start(QC),
            },
            { text: "What does Hazel want?", next: "hazel_hint" },
            { text: "Not my problem.", end: true },
          ],
        },
        dot_ok: {
          speaker: "Lee Bedford",
          text: "Courthouse is the red one with the clock tower, 6th and 8th. The robot judge still holds court. Get her home and your drinks are on me for a month. A short month.",
          responses: [{ text: "On it.", end: true }],
        },
        hazel_hint: {
          speaker: "Lee Bedford",
          text: "She was a Five Boroughs lineman for twenty years before the Bombing. Thinks there's still power in that building on 15th. Talk to her in the back — she's the one arguing with the poet.",
          responses: [{ text: "Thanks.", end: true }],
        },
        dot_back: {
          speaker: "Lee Bedford",
          text: () =>
            PV.flag("dot_free") === "jailbreak"
              ? "Fran's back — came in the 86 door at a dead run with half the court's bailiffs yelling behind her. Subtle. I like it. Here — your cut, and a month of gin."
              : "Fran walked in, ordered a gin, and cried into it. Then she laughed, then she cried some more. Here — your cut, and a month of gin.",
          responses: [
            {
              text: "Glad she's home.",
              end: true,
              action: () => {
                K.give("pv3_gin", 4);
                q.complete(QC);
              },
            },
          ],
        },
      },
    });

    // ---------------------------------------------------------------- Hazel Adeyemi
    D.register("pv3_dlg_hazel", {
      start: () => {
        if (q.active(QT) && q.stage(QT) === "return") return "done";
        if (q.done(QT)) return "after";
        if (q.active(QT)) return "progress";
        return PV.flag("met_hazel") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Hazel Adeyemi",
          onEnter: () => PV.setFlag("met_hazel", true),
          text: "Sit down, fresh-face, you're blocking my view of nothing. ...Sorry. Hazel Adeyemi. Five Boroughs Local 3, splicer first class, retired by nuclear holocaust.",
          responses: [
            { text: "Tell me about Five Boroughs Power.", next: "fiveboro" },
            { text: "You look like somebody with a job.", next: "job" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Hazel Adeyemi",
          text: "Changed your mind about the tower?",
          responses: [
            { text: "Tell me the job again.", next: "job" },
            { text: "Not yet.", end: true },
          ],
        },
        fiveboro: {
          speaker: "Hazel Adeyemi",
          text: 'Five Boroughs Power. "Every borough, every bulb." They printed it on the bills, the trucks, the matchbooks. Tower on 14th and Irving. Clock tower, with a lantern on top they lit every night for the linemen who died in the blackout of \'65. My crew. The robots in there are still guarding a grid that died twenty-two years ago. Good robots. Terrible listeners.',
          responses: [
            { text: "So what do you want?", next: "job" },
            { text: "Goodbye.", end: true },
          ],
        },
        job: {
          speaker: "Hazel Adeyemi",
          text: "Transformer B in the basement hall is still energised. I can FEEL it, the way you feel a storm coming. Put an arc regulator back in the lantern and there's power. Real power. Then whoever did the work makes the call: light the tower — a beacon for every lost soul in Manhattan — or run the feed down to the Village. Street lamps. The generator in our cellar. Maybe even the courthouse clock.",
          responses: [
            { text: "I'll do it.", next: "yes", action: () => q.start(QT) },
            { text: "What about the robots?", next: "robots" },
            { text: "Not now.", end: true },
          ],
        },
        robots: {
          speaker: "Hazel Adeyemi",
          text: "Patrolmen, a Valet-M or two, and GRIDLOCK — a Bulwark they parked in the clock room in '66 and forgot about. There was a supervisor's keycard for the executive elevator in System Control. And the Grid Control console can stand the whole security detail down, if it still takes the operators' word. It was LAMPLIGHTER the month the bombs fell. Walt picked it.",
          learn: "pv3_lk_ce_grid",
          onEnter: () => K.learn("pv3_lk_ce_grid"),
          responses: [
            { text: "I'll do it.", next: "yes", action: () => q.start(QT) },
            { text: "Not now.", end: true },
          ],
        },
        yes: {
          speaker: "Hazel Adeyemi",
          text: "Rack B, transformer hall. Stairs are behind System Control. Mind the busbars; they've been arcing since the Truman Doctrine. And kid — whatever you pick up there, you pick. I won't hold it against you.",
          responses: [{ text: "Be back soon.", end: true }],
        },
        progress: {
          speaker: "Hazel Adeyemi",
          text: () =>
            K.has("pv3_arc_regulator")
              ? "You GOT one. Look at that blue eye. Now: executive elevator, clock room, lantern. Your call when you get there."
              : "Rack B. Transformer hall. Don't touch anything that hums.",
          responses: [{ text: "On it.", end: true }],
        },
        done: {
          speaker: "Hazel Adeyemi",
          text: () =>
            PV.flag("ce_mode") === "beacon"
              ? "I saw it. Went up on the roof and there it was, over 14th Street. Twenty-two years, and the light's back on. [She is quiet for a long time.] Here. My lineman's lamp. I carried it through the blackout. You've earned it."
              : "The generator coughed, then it HUMMED. Lee cried. Don't tell him I told you. The court clock's lit up at night now — nine forty-seven, glowing like a promise. Here. My lineman's lamp. You've earned it.",
          responses: [
            {
              text: "I found this in the lantern room. [Give Local 3 pin]",
              cond: () => K.has("pv3_linemans_pin"),
              next: "pin",
              action: () => {
                K.take("pv3_linemans_pin", 1);
                K.give("pv3_linemans_lamp", 1);
                K.scrip(80);
                q.complete(QT);
              },
            },
            {
              text: "The lights stay on.",
              end: true,
              action: () => {
                K.give("pv3_linemans_lamp", 1);
                q.complete(QT);
              },
            },
          ],
        },
        pin: {
          speaker: "Hazel Adeyemi",
          text: "...Walt's pin. Twenty-five years. He was the one who lit it every night. [She pins it on her coat.] Take this scrip and don't argue with an old lineman who's crying.",
          responses: [{ text: "The lights stay on, Hazel.", end: true }],
        },
        after: {
          speaker: "Hazel Adeyemi",
          text: "Lights stay on, kid.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Vernon Blake (poet)
    D.register("pv3_dlg_vernon", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Vernon Blake",
          text: "Ah. An audience. Would you like to hear a poem? Say yes. Everyone else has already said no, some of them physically.",
          responses: [
            { text: "Sure, one poem.", next: "poem" },
            { text: "What are you writing?", next: "writing" },
            { text: "No.", next: "no" },
          ],
        },
        poem: {
          speaker: "Vernon Blake",
          text: '"Ode to the Courthouse Clock."\n\nYou stopped at nine and forty-seven,\nas if you knew, as if you\'d seen\nthe sky go white above Sixth Avenue\nand thought: no, not a second more of this.\nWe went on without you. We were wrong to.\n\n[He waits.] ...You may clap.',
          responses: [
            {
              text: "[Clap.]",
              next: "clap",
              action: () => K.xp(10, "Poetry appreciation"),
            },
            { text: "That was bleak.", next: "bleak" },
          ],
        },
        clap: {
          speaker: "Vernon Blake",
          text: 'Thank you. I am going to put you in my memoirs. As "an audience."',
          responses: [{ text: "Goodbye.", end: true }],
        },
        bleak: {
          speaker: "Vernon Blake",
          text: "It's the apocalypse. Bleak is the house style.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        writing: {
          speaker: "Vernon Blake",
          text: "The Great Post-Atomic Novel. I've been writing it for twenty years. Chapter one is almost finished. The jackets on these walls — every writer who drank here got one. I intend to be up there before the sun burns out, which, given the pace, is a close race.",
          responses: [{ text: "Good luck.", end: true }],
        },
        no: {
          speaker: "Vernon Blake",
          text: "A critic. We have so few left. Treasure yourself.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Keys (piano-playing Valet)
    D.register("pv3_dlg_keys", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Keys",
          text: "Good evening, sir! Request? I know four songs. Three of them are the same song in a different key. The fourth is also that song.",
          responses: [
            {
              text: "Play the fourth one.",
              next: "play",
              action: () => K.sfx("ui_select"),
            },
            { text: "Why only one working arm?", next: "arm" },
            { text: "Carry on.", end: true },
          ],
        },
        play: {
          speaker: "Keys",
          text: "[Plink. Plonk. Something that might be jazz.] Thank you! I'll be here all week. I'll be here all century, actually. My contract was very poorly negotiated.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        arm: {
          speaker: "Keys",
          text: "The other one is holding the building up! Just kidding. A raider shot it off in '78. I play the left-hand part with my right hand now, and I traded the spare gripper for a tuning fork. Worth it. Pitch is everything.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
  }

  function worldHooks() {
    const jm = ctxOf("jefferson_market"),
      ce = ctxOf("five_boro_tower");
    // the cell 2 lock: the bailiffs' spare key ring (evidence locker 66-9120) opens it — a jailbreak in the court's eyes
    if (jm) {
      const p = jm.anchors.dot_door;
      G.world.addInteractable({
        pos: p,
        radius: 0.9,
        label: "Cell 2 (Zielinski)",
        verb: "Unlock",
        priority: 2,
        locked: () => (K.has("pv3_key_jm_cells") ? null : "Locked"),
        enabled: () => PV.jm.dotHeld(),
        onInteract() {
          if (!K.has("pv3_key_jm_cells")) {
            K.sfx("door_locked");
            K.notify(
              "The cell door is locked. The bailiffs keep spare keys somewhere on this level.",
            );
            return;
          }
          K.lockOpen(PV.LK_JM ? PV.LK_JM.cell2 : "pv3_lk_jm_cell2", () =>
            PV.jm.release("jailbreak"),
          );
        },
      });
      // the fire bell
      G.world.addInteractable({
        pos: jm.bellPos,
        radius: 1.2,
        label: "Fire Bell Rope",
        verb: "Ring",
        onInteract() {
          K.sfx("melee_hit", jm.bellPos, { pitch: 0.35, volume: 1 });
          setTimeout(
            () => K.sfx("melee_hit", jm.bellPos, { pitch: 0.34, volume: 0.8 }),
            900,
          );
          try {
            if (G.player && G.player.shake) G.player.shake(0.2, 0.4);
          } catch (e) {
            /* */
          }
          if (!PV.flag("bell_rung")) {
            PV.setFlag("bell_rung", true);
            K.xp(25, "Rang the Jefferson Market fire bell");
            K.notify(
              "The old fire bell tolls over the Village for the first time in twenty-two years.",
            );
          } else K.notify("BONG. ...BONG.");
        },
      });
      // the law library: Local Law 44 (a bound volume on shelf C)
      G.world.addInteractable({
        pos: K.world(jm, 15.4, 1.2, -13.6),
        radius: 0.9,
        label: "Bound Municipal Code, 1966",
        verb: "Take",
        enabled: () => !PV.flag("took_ordinance"),
        onInteract() {
          PV.setFlag("took_ordinance", true);
          K.give("pv3_ordinance", 1);
          K.sfx("pickup");
        },
      });
    }
    // the arc regulator on rack B
    if (ce) {
      G.world.addInteractable({
        pos: ce.regulatorPos,
        radius: 1.0,
        label: "Arc Regulator",
        verb: "Take",
        priority: 2,
        enabled: () => !PV.flag("reg_taken"),
        onInteract() {
          PV.setFlag("reg_taken", true);
          K.give("pv3_arc_regulator", 1);
          K.sfx("pickup");
          if (ce.regulatorGroup) ce.regulatorGroup.visible = false;
          if (
            q.active(QT) &&
            (q.stage(QT) === "enter" || q.stage(QT) === "regulator")
          )
            q.set(QT, "crown");
        },
      });
    }
  }

  // ==================================================================
  // SPAWN (newGame / loaded)
  // ==================================================================
  function spawnJM(ctx) {
    const A = ctx.anchors;
    const hostile = !!PV.flag("jm_contempt");
    setCellOpen(!PV.jm.dotHeld());
    PV.spawnActor(ctx, {
      id: "pv3_jm_magistrate",
      type: "patrolman",
      name: "Magistrate MK-IX",
      faction: "settlers",
      level: 10,
      hostile,
      hp: 320,
      dr: 18,
      pos: V(A.judge),
      yaw: 0,
      ai: "static",
      home: "here",
      homeR: 0.5,
      dialogue: "pv3_dlg_magistrate",
      voice: "robot",
      barks: [
        "ORDER.",
        "The court is in session.",
        "Silence in the gallery.",
        "Objection noted. Objection overruled.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_jm_bailiff1",
      type: "patrolman",
      name: "Bailiff-Bot",
      faction: "settlers",
      level: 8,
      hostile,
      pos: V(A.bailiff1),
      yaw: -HP,
      ai: "guard",
      home: "here",
      homeR: 2,
      voice: "robot",
      barks: ["All rise.", "Remain seated.", "Spitting is a crime."],
    });
    PV.spawnActor(ctx, {
      id: "pv3_jm_bailiff2",
      type: "patrolman",
      name: "Bailiff-Bot",
      faction: "settlers",
      level: 8,
      hostile,
      pos: V(A.bailiff2),
      yaw: 0,
      ai: "patrol",
      patrol: [
        { x: A.bailiff2.x, z: A.bailiff2.z },
        { x: A.guard_post.x + 1, z: A.guard_post.z },
      ],
      home: "here",
      homeR: 4,
      voice: "robot",
      barks: ["Curfew is at 22:00.", "Move along, citizen."],
    });
    PV.spawnActor(ctx, {
      id: "pv3_jm_steno",
      type: "sky_eye",
      name: "Court Stenographer",
      faction: "settlers",
      level: 3,
      hostile,
      pos: V(A.stenographer),
      ai: "static",
      home: "here",
      homeR: 1,
      barks: ["*click-click-click*", "Let the record show..."],
    });
    if (PV.jm.dotHeld()) {
      PV.spawnActor(ctx, {
        id: "pv3_dot",
        type: "human",
        gender: "f",
        outfit: "merchant",
        name: "Fran Zielinski",
        faction: "settlers",
        level: 6,
        essential: true,
        pos: V(A.dot_cell),
        yaw: HP,
        ai: "static",
        home: "here",
        homeR: 0.5,
        dialogue: "pv3_dlg_dot",
        voice: "settler",
        barks: [
          "Nineteen days. NINETEEN.",
          "Hey! Anybody with thumbs out there?",
          "I want a lawyer. I want a drink. Mostly the drink.",
        ],
      });
    }
  }
  function spawnCH(ctx) {
    const A = ctx.anchors;
    const v = (n) => V(A[n]);
    PV.spawnActor(ctx, {
      id: "pv3_lee",
      type: "human",
      gender: "m",
      outfit: "merchant",
      name: "Lee Bedford",
      faction: "settlers",
      level: 9,
      essential: true,
      pos: v("bartender"),
      yaw: HP,
      ai: "merchant",
      home: "here",
      homeR: 1.6,
      dialogue: "pv3_dlg_lee",
      voice: "settler",
      merchant: {
        scrip: 360,
        stock: K.stock(
          [
            ["pv3_gin", 10],
            ["pv3_pigeon_stew", 6],
            ["beer", 6],
            ["whiskey", 2],
            ["vodka", 2],
            ["purified_water", 4],
            ["fizzo_cola", 3],
          ],
          "merchant_food",
          3,
        ),
        restock: 2,
      },
      barks: [
        "No sign, no names, no trouble.",
        "Gin's in the teacups.",
        "Eighty-six him if he starts singing again.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_hazel",
      type: "human",
      gender: "f",
      outfit: "survivor_layers",
      name: "Hazel Adeyemi",
      faction: "settlers",
      level: 8,
      essential: true,
      pos: v("npc1"),
      yaw: HP,
      ai: "sit",
      home: "here",
      homeR: 0.4,
      dialogue: "pv3_dlg_hazel",
      voice: "settler",
      barks: [
        "Transformer B. I can feel it humming.",
        "The lights stay on. That was the motto.",
        'Vernon, if you rhyme "grid" with "did" one more time...',
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_vernon",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Vernon Blake",
      faction: "settlers",
      level: 3,
      essential: true,
      pos: v("npc2"),
      yaw: PI,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      dialogue: "pv3_dlg_vernon",
      voice: "settler",
      barks: [
        '"O city of stopped clocks..." no. No.',
        "Chapter one. Page four hundred.",
        "Is anyone here a publisher? Anyone?",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_keys",
      type: "valet",
      name: "Keys",
      faction: "settlers",
      level: 5,
      essential: true,
      pos: v("npc3"),
      yaw: PI,
      ai: "static",
      home: "here",
      homeR: 0.3,
      dialogue: "pv3_dlg_keys",
      voice: "robot",
      barks: [
        "*plink plonk*",
        "This next one is a ballad. So was the last one.",
        "Tips are appreciated! I cannot hold them, but they are appreciated!",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_ch_patron",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Regular",
      faction: "settlers",
      level: 3,
      pos: v("npc4"),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Two doors, no sign. Best bar in the world.",
        "Don't sit in the booth with the poet.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv3_ch_cellar",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Settler",
      faction: "settlers",
      level: 3,
      pos: v("npc5"),
      yaw: HP,
      ai: "wander",
      home: "here",
      homeR: 3,
    });
    PV.spawnActor(ctx, {
      id: "pv3_ch_cook",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Marguerite",
      faction: "settlers",
      level: 4,
      pos: v("npc6"),
      yaw: PI,
      ai: "wander",
      home: "here",
      homeR: 1.6,
      barks: [
        "Stew's on.",
        "Don't ask what's in it.",
        "Municipal. That's all I'll say.",
      ],
    });
    const gate = A.bouncer || A.gate;
    if (gate)
      PV.spawnActor(ctx, {
        id: "pv3_ox",
        type: "human",
        gender: "m",
        outfit: "leather_armor",
        name: "Ox",
        faction: "settlers",
        level: 9,
        pos: V(gate),
        yaw: PI,
        ai: "guard",
        home: "here",
        homeR: 0.6,
        weapon: "lead_pipe",
        barks: [
          "No sign. No problem.",
          "Knock twice. Once is a cop.",
          "You look thirsty. Door's at the back of the court.",
        ],
      });
    if (!PV.jm.dotHeld()) spawnDotAtBedfords();
    // one-way doors already used from inside stay open; the grate key waits on the cellar crates
    if (PV.flag("ch_86_open")) K.lockUnlock("pv3_lk_ch_door86");
    if (!PV.flag("ch_grate_key_taken") && A.grate_key)
      K.safe("gratekey", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("pv3_key_ch_grate", 1, V(A.grate_key), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
  }
  G.events.on("itemAdded", (id) => {
    if (id === "pv3_key_ch_grate") PV.setFlag("ch_grate_key_taken", true);
  });
  function spawnCE(ctx) {
    const A = ctx.anchors;
    if (ctx.regulatorGroup) ctx.regulatorGroup.visible = !PV.flag("reg_taken");
    if (ctx.lensGroup) ctx.lensGroup.visible = PV.flag("ce_mode") === "beacon";
    if (!PV.flag("gridlock_dead")) {
      PV.spawnActor(ctx, {
        id: "pv3_gridlock",
        type: "bulwark",
        name: "GRIDLOCK",
        faction: "robots",
        level: 12,
        hostile: !PV.flag("ce_pacified"),
        hp: 520,
        dr: 25,
        damage: 1.2,
        pos: V(A.boss),
        yaw: PI,
        ai: "guard",
        home: "here",
        homeR: 5,
        noRespawn: true,
        loot: "bulwark",
        inventory: [
          ["dry_cell", 2],
          ["relay_board", 1],
        ],
        barks: [
          "GRID SECURE.",
          "UNAUTHORISED PERSONNEL DETECTED IN CLOCK ROOM.",
          "LOAD SHEDDING INITIATED.",
        ],
        onDeath: () => {
          PV.setFlag("gridlock_dead", true);
          K.xp(120, "Destroyed GRIDLOCK");
        },
      });
    }
  }

  // ==================================================================
  // UPDATE: lit groups, blinking lamp, sparks, pacified robots
  // ==================================================================
  let stageT = 0,
    dotT = 0,
    blinkT = 0,
    sparkT = 3,
    arcT = 2,
    calmT = 0,
    nightT = 0,
    night = false;
  function updateAll(dt, realDt) {
    nightT -= realDt;
    if (nightT <= 0) {
      night = isNight();
      nightT = 2;
    }
    const mode = PV.flag("ce_mode");
    const jm = ctxOf("jefferson_market"),
      ch = ctxOf("bedfords"),
      ce = ctxOf("five_boro_tower");
    if (jm && jm.litGroup) jm.litGroup.visible = mode === "grid" && night;
    if (ch && ch.litGroup) ch.litGroup.visible = mode === "grid" && night;
    // stage hand-offs that must not depend on WHICH way the player got inside (street door, 86 door, a load, fast travel)
    stageT -= realDt;
    if (stageT <= 0) {
      stageT = 0.5;
      K.safe("stagecheck", () => {
        if (jm && jm.inside && q.active(QC) && q.stage(QC) === "find")
          q.set(QC, "defend");
        if (ce && ce.inside && q.active(QT) && q.stage(QT) === "enter")
          q.set(QT, K.has("pv3_arc_regulator") ? "crown" : "regulator");
        if (
          q.active(QT) &&
          q.stage(QT) === "regulator" &&
          K.has("pv3_arc_regulator")
        )
          q.set(QT, "crown");
      });
    }
    if (jm && !jm.inside) {
      dotT -= realDt;
      if (dotT <= 0) {
        dotT = 2;
        if (PV.jm && !PV.jm.dotHeld() && PV.flag("dot_free"))
          spawnDotAtBedfords();
      }
    }
    if (ce) {
      if (ce.litGroup) ce.litGroup.visible = mode === "beacon" && night;
      blinkT += realDt;
      if (ce.aviaGroup) ce.aviaGroup.visible = blinkT % 1.6 < 0.8;
      const p = G.player && G.player.pos;
      if (p && dt > 0 && !G.isStub("fx")) {
        if (
          ce.sparkPos &&
          Math.abs(p.x - ce.sparkPos.x) < 70 &&
          Math.abs(p.z - ce.sparkPos.z) < 70
        ) {
          sparkT -= dt;
          if (sparkT <= 0) {
            sparkT = 1.5 + Math.random() * 4;
            K.safe("spark", () => G.fx.sparks(ce.sparkPos));
            if (Math.random() < 0.5)
              K.sfx("hum_electric", ce.sparkPos, { volume: 0.4 });
          }
        }
        if (ce.inside && ce.arcPos && Math.abs(p.y - ce.arcPos.y) < 10) {
          arcT -= dt;
          if (arcT <= 0) {
            arcT = 0.8 + Math.random() * 2.5;
            K.safe("arc", () => {
              G.fx.sparks(ce.arcPos);
              if (G.fx.flash) G.fx.flash(ce.arcPos, 0x88bbff, 2, 0.12);
            });
          }
        }
      }
      if (PV.flag("ce_pacified") && ce.inside) {
        calmT -= realDt;
        if (calmT <= 0) {
          calmT = 2;
          calmRobots();
        }
      }
    }
  }

  // ==================================================================
  // Registrations
  // ==================================================================
  PV.onEnter = function (key) {
    if (key === "five_boro_tower" && q.active(QT) && q.stage(QT) === "enter")
      q.set(QT, K.has("pv3_arc_regulator") ? "crown" : "regulator");
    if (key === "jefferson_market" && q.active(QC) && q.stage(QC) === "find")
      q.set(QC, "defend");
  };
  let dataDone = false;
  function dataOnce() {
    if (dataDone) return;
    dataDone = true;
    K.safe("items", items);
    K.safe("quests", quests);
    K.safe("dialogues", dialogues);
    K.safe("hooks", worldHooks);
  }
  PV.define({
    id: "jefferson_market",
    name: "Jefferson Market Courthouse",
    interior: "jefferson_market",
    order: 10,
    lift: 5,
    build(ctx) {
      PV.EXT.jm(ctx);
      PV.INT.jm(ctx);
    },
    data: dataOnce,
    spawn: spawnJM,
    update: updateAll,
    reset() {
      setCellOpen(false);
    },
  });
  PV.define({
    id: "bedfords",
    name: "Bedford's",
    interior: "bedfords",
    order: 20,
    lift: 4,
    build(ctx) {
      PV.EXT.ch(ctx);
      PV.INT.ch(ctx);
    },
    data: dataOnce,
    spawn: spawnCH,
  });
  PV.define({
    id: "five_boro_tower",
    name: "Five Boroughs Tower of Light",
    interior: "five_boro_tower",
    order: 30,
    lift: 7,
    build(ctx) {
      PV.EXT.ce(ctx);
      PV.INT.ce(ctx);
    },
    data: dataOnce,
    spawn: spawnCE,
    reset(ctx) {
      if (ctx.regulatorGroup) ctx.regulatorGroup.visible = true;
      if (ctx.lensGroup) ctx.lensGroup.visible = false;
    },
  });
  // saves from before the main story: mirror the Tower of Light's mode into the main-story flag
  G.events.on("loaded", () =>
    setTimeout(() => {
      const m = PV.flag("ce_mode");
      if (m && !K.qflag("ms_tower_light")) K.setQFlag("ms_tower_light", m);
    }, 0),
  );
})();
