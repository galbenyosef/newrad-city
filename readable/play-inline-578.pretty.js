/* src/quests_extra/30_radio.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS_EXTRA — 30: RADIO-SIGNAL QUESTS
 * The sound module puts three range-limited signals on the goggles' radio
 * dial (src/sound/50_radio.js) and emits 'radioSignalFound' on first
 * tune-in. Each one opens a quest here (tuning is optional: walking up to
 * the source starts the same quest, so nothing depends on the radio):
 *
 *   qx_c4       "Water Rising"    Cryo Unit C-4 distress beacon, Battery Park seawall
 *                                 → the flooded Long Winter site (35_cryo_c4.js),
 *                                 Facility Director Josephine Brandt, the Departure
 *                                 Roll. Tell her the truth (roll / Persuasion), lie to
 *                                 her (standing −), or kill her.
 *   qx_numbers  "Numbers Game"    absorbed into the MAIN STORY: run by mq20 (Act 3) as a
 *                                 proxy stage; it cannot start before mq20 has. The Continuity numbers station by
 *                                 the U.N. → Static Okonkwo's listening post on
 *                                 Lexington, a dead courier's one-time pad, the decode
 *                                 (the name readings: WAYTE / MEAD, N. / MEAD, R. on
 *                                 Directive 7-A Schedule C / the sun cult's Key B
 *                                 request), and a choice: jam the Sky-Eye net
 *                                 (skyeye_jammed), send "FILE C-9/WAYTE CLOSED"
 *                                 (qx_wayte_file_closed; Electronics / Wits), or keep
 *                                 the pad (qx_pad_kept). Flags go to the quests store.
 *   qx_bell     "The Closing Bell" (never starts once betty_dead is set)
 *                                 Bear Market Betty's ransom broadcast → convoy
 *                                 master Harlan Pruitt shackled at the Exchange.
 *                                 Pay the 500-Scrip ransom at the drop box (Trade
 *                                 note: 300), or go in: the pit boss's shackle key,
 *                                 a [Mechanics] hinge-pin trick, or Brawn. Harlan
 *                                 settles at Grand Central as a convoy trader.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const QX = G.qx;
  const K = () => QX.kit;

  // ------------------------------------------------------------------
  // Spots (street coordinates; all resolved to free ground at world build)
  // ------------------------------------------------------------------
  const SP = {
    hatch: { x: -174, z: 924 }, // Battery Park seawall, north of the old ferry pier (tape: "freight hatch on the seawall")
    beacon: { x: -75, z: 930 }, // radio source (sound module)
    sparks: { x: 283, z: -262 }, // Lexington Ave between 42nd & 47th, in the lee of the First Journal
    courier: { x: 287, z: -196 }, // Lexington & 40th: the courier never made it to the U.N.
    numbers: { x: 313, z: -330 }, // radio source (U.N.)
    dropBox: { x: 9, z: 807.5 }, // Wall Street, in front of the Exchange
    harlanFallback: { x: 6, z: 830 },
    harlanGC: { x: 232, z: -206 }, // Grand Central concourse, by the trade stalls
  };
  QX.radioSpots = SP;

  const C4 = "qx_c4",
    NUM = "qx_numbers",
    BELL = "qx_bell";
  // Shared ids owned by other modules (characters / combat / rpg).
  const DRONE_TYPE = "sky_eye",
    DRONE_FACTION = "continuity",
    EFFECT_KIND_TALENT = "talent",
    SKILL_TRADE = "trade";
  /** Harlan's ankle shackle: a key lock (REBRAND §5). Ticker Tate carries the key. */
  const SHACKLES = {
    id: "qx_bell_shackles",
    kind: "restraint",
    label: "Harlan's Shackles",
    key: "qx_shackle_key",
    hint: 'Pit Boss "Ticker" Tate carries the key on a loop of ticker tape.',
    keyFrom: 'Pit Boss "Ticker" Tate (NYSE trading floor)',
  };
  const RANSOM = 500,
    RANSOM_HAGGLED = 300;

  // ==================================================================
  // Quest definitions
  // ==================================================================
  QX.hook("quests", function () {
    // ------------------------------------------------------------- Water Rising
    QX.define({
      id: C4,
      name: "Water Rising",
      giver: "Cryo Unit C-4 Distress Signal",
      location: "Battery Park",
      order: 47,
      desc:
        "A Civil Defense distress tape is looping on 91.7 near Battery Park: Facility Director Brandt of Cryo Unit C-4, a Project Long Winter " +
        "site, sixty-one people, a flooded floor and a pressure door that will not open. The tape sounds old. The voice does not sound like it knows that.",
      stages: [
        {
          id: "hatch",
          text: "Find the Cryo Unit C-4 freight hatch on the Battery Park seawall, north of the old ferry pier.",
          markers: () => [
            {
              x: SP.hatch.x,
              z: SP.hatch.z,
              label: "Cryo Unit C-4 Freight Hatch",
            },
          ],
        },
        {
          id: "inside",
          text: "Find Facility Director Brandt inside Cryo Unit C-4.",
          markers: () =>
            QX.c4 ? [QX.c4.marker("office", "Director's Office")] : [],
        },
        {
          id: "talk",
          text: "Speak to Facility Director Brandt.",
          markers: () => [
            { npc: "qx_brandt", label: "Director Brandt", interior: true },
          ],
        },
        {
          id: "roll",
          text: "Find out what became of the fifty-nine people who left Cryo Unit C-4.",
          markers: () =>
            QX.c4 && !QX.has("qx_c4_roll")
              ? [QX.c4.marker("roll", "Hatch Shaft")]
              : [
                  {
                    npc: "qx_brandt",
                    label: "Director Brandt",
                    interior: true,
                  },
                ],
        },
        {
          id: "done_truth",
          complete: true,
          text: "You told Director Brandt what became of her people. The beacon is off. For the first time in twenty-two years, Cryo Unit C-4 is quiet.",
        },
        {
          id: "done_speech",
          complete: true,
          text: "You talked Director Brandt into leaving the facility. She switched off the beacon on her way out.",
        },
        {
          id: "done_lie",
          complete: true,
          text: "You told Director Brandt that Civil Defense is sending help. The tape is still playing. She is still waiting.",
        },
        {
          id: "done_dead",
          complete: true,
          text: "Director Brandt is dead. The beacon is still transmitting, for no one.",
        },
        {
          id: "o_pumps",
          sideObjective: true,
          text: "(Optional) Restart the pumps and drain the lower level.",
          doneIf: () => !!QX.flag("c4_pumps"),
          showIf: () => ["inside", "talk", "roll"].indexOf(QX.stage(C4)) >= 0,
        },
        {
          id: "o_marcus",
          sideObjective: true,
          text: "(Optional) Find out what happened to Marcus Abernathy.",
          doneIf: () => !!QX.flag("c4_marcus"),
          showIf: () => ["inside", "talk", "roll"].indexOf(QX.stage(C4)) >= 0,
        },
      ],
      rewards: { xp: 150 },
    });

    // ------------------------------------------------------------- Numbers Game
    QX.define({
      id: NUM,
      name: "Numbers Game",
      giver: "Static Okonkwo",
      location: "Lexington Avenue",
      order: 48,
      desc:
        "Somebody near the U.N. is reading names and numbers into the dark on 93.9: five-digit groups, a chime, a line of Morse. Static Okonkwo, " +
        "who has been writing them down from a folding table on Lexington Avenue for six years, says the Continuity reads its lists on that frequency. " +
        "If Directive 7-A has a list, it is on 93.9, and the courier who carried the one-time pads never came back down Lexington.",
      stages: [
        {
          id: "sparks",
          text: "Find someone who can make sense of the numbers station. Try the listening post on Lexington Avenue.",
          markers: () => [{ npc: "qx_sparks", label: "Listening Post" }],
        },
        {
          id: "pad",
          text: "Find the Continuity courier who carried the one-time pads to the U.N. Static last saw him heading up Lexington toward 40th Street.",
          markers: () =>
            QX.has("qx_cipher_sheet")
              ? []
              : [
                  {
                    x: SP.courier.x,
                    z: SP.courier.z,
                    label: "Continuity Courier",
                  },
                ],
        },
        {
          id: "decode",
          text: "Bring the one-time pad to Static Okonkwo and read the Continuity's name list.",
          markers: () => [{ npc: "qx_sparks", label: "Static Okonkwo" }],
        },
        {
          id: "choose",
          text: "Decide what to do about the Continuity's interest in you.",
          markers: () => [{ npc: "qx_sparks", label: "Static Okonkwo" }],
        },
        {
          id: "done_jam",
          complete: true,
          text: "Static jammed the Continuity's Sky-Eye relay net. No drone will be watching the water when you cross to Liberty. Rose Mead is still on Schedule C.",
        },
        {
          id: "done_dead",
          complete: true,
          text: 'The Continuity acknowledged "FILE C-9/WAYTE CLOSED". Officially the sleeper is dead, and nobody on Liberty is expecting you. Rose Mead is still on Schedule C.',
        },
        {
          id: "done_sold",
          complete: true,
          text: "You kept the one-time pad and the decoded name list. Continuity paper is worth something to somebody. Rose Mead is still on Schedule C.",
        },
        {
          id: "o_quiet",
          sideObjective: true,
          text: "(Optional) Recover the pad without destroying the courier's Sky-Eye escort.",
          doneIf: () => !!QX.flag("num_quiet"),
          showIf: () => QX.stage(NUM) === "pad",
        },
      ],
      rewards: { xp: 150 },
    });

    // ------------------------------------------------------------- The Closing Bell
    QX.define({
      id: BELL,
      name: "The Closing Bell",
      giver: "Bear Market Betty (radio)",
      location: "New York Stock Exchange",
      order: 49,
      desc:
        'Every evening on 99.5, Bear Market Betty rings the closing bell and quotes a price: convoy master Harlan Pruitt, "slightly used", ' +
        "five hundred Scrip, delivered to the Exchange. Every day, the price goes up and Harlan goes down.",
      stages: [
        {
          id: "find",
          text: () =>
            QX.qflag("betty_dead")
              ? "Betty is dead, but her pit boss still has Harlan Pruitt chained at the New York Stock Exchange. Get him out."
              : "Rescue Harlan Pruitt from the New York Stock Exchange — or pay the ransom at the drop box on Wall Street.",
          markers: () =>
            QX.qflag("betty_dead")
              ? [{ npc: "qx_harlan", label: "Harlan Pruitt" }]
              : [
                  { npc: "qx_harlan", label: "Harlan Pruitt" },
                  {
                    x: SP.dropBox.x,
                    z: SP.dropBox.z,
                    label: "Ransom Drop Box",
                  },
                ],
        },
        {
          id: "free",
          text: "Free Harlan Pruitt from his shackles (the pit boss has the key).",
          markers: () => {
            const m = [{ npc: "qx_harlan", label: "Harlan Pruitt" }];
            if (QX.alive("qx_ticker") && !QX.has("qx_shackle_key"))
              m.push({ npc: "qx_ticker", label: 'Pit Boss "Ticker" Tate' });
            return m;
          },
        },
        {
          id: "gc",
          text: "Meet Harlan Pruitt at Grand Central Market.",
          markers: () => [{ npc: "qx_harlan", label: "Harlan Pruitt" }],
        },
        {
          id: "done",
          complete: true,
          text: () =>
            (QX.flag("bell_paid")
              ? "You bought Harlan Pruitt back from Bear Market Betty. The market is up."
              : "You freed Harlan Pruitt from the Exchange. Betty's stock is down.") +
            " Pruitt & Sons Overland Freight is trading out of Grand Central.",
        },
        {
          id: "failed",
          complete: true,
          text: "Harlan Pruitt is dead. The closing bell rang for him after all.",
        },
        {
          id: "o_refund",
          sideObjective: true,
          text: "(Optional) Get the ransom back from Ticker Tate.",
          doneIf: () => !!QX.flag("bell_refund"),
          showIf: () => !!QX.flag("bell_paid") && !QX.done(BELL),
        },
      ],
      rewards: { xp: 100 },
    });
  });

  // ==================================================================
  // Starting the quests: radio first tune-in, or walking up to the source
  // ==================================================================
  // Signal ids from the sound module (src/sound/50_radio.js).
  const SIGNAL_TO_QUEST = {
    sig_c4: C4,
    sig_cryo_c4: C4,
    sig_numbers: NUM,
    sig_ransom: BELL,
  };
  const R = (QX.radioQuests = {
    startC4(silent) {
      if (QX.started(C4)) return;
      QX.start(C4, { stage: "hatch" });
      if (!silent)
        QX.notify(
          "The tape gives a location: a freight hatch on the seawall, north of the old ferry pier.",
          { sub: "Water Rising" },
        );
    },
    startNumbers() {
      if (QX.started(NUM) || !QX.mainOpen(NUM)) return;
      QX.start(NUM, {
        stage: QX.has("qx_cipher_sheet")
          ? "decode"
          : QX.flag("met_sparks")
            ? "pad"
            : "sparks",
      });
    },
    startBell() {
      if (QX.started(BELL) || QX.qflag("betty_dead")) return;
      if (!QX.alive("qx_harlan") && QX.flag("dead_qx_harlan")) return;
      QX.start(BELL, { stage: "find" });
    },
  });
  G.events.on("radioSignalFound", (e) => {
    const q = e && SIGNAL_TO_QUEST[e.id];
    if (!q || !QX.qlive()) return;
    QX.later(3, () => {
      if (q === C4) R.startC4();
      else if (q === NUM) R.startNumbers();
      else if (q === BELL) R.startBell();
    });
  });
  // Walking up to the source (radio off, or the sound module absent) starts the same quests.
  QX.trigger({
    id: "r_c4_near",
    pos: () => SP.hatch,
    r: 14,
    cond: () => !QX.started(C4),
    fire: () => {
      R.startC4(true);
      QX.notify(
        "A square steel hatch is set into the seawall, rimed with salt like frost. Stencilled on it, under twenty years of gull droppings: O.C.D. — CRYO UNIT C-4.",
      );
    },
  });
  QX.trigger({
    id: "r_bell_near",
    pos: () => {
      const a = QX.npc("qx_harlan");
      return a && !a.dead ? a.pos : null;
    },
    r: 9,
    cond: () => !QX.started(BELL),
    fire: () => R.startBell(),
  });
  QX.hook("loaded", () => {
    // older saves: the old outcome flags → the main-story flags
    if (QX.flag("num_jammed") && !QX.qflag("skyeye_jammed"))
      QX.msFlag("skyeye_jammed");
    if (QX.flag("num_ghost") && !QX.qflag("qx_wayte_file_closed"))
      QX.setQflag("qx_wayte_file_closed");
    QX.setQflag("ms_wayte_file_closed");
    if (QX.flag("num_kept") && !QX.qflag("qx_pad_kept"))
      QX.setQflag("qx_pad_kept");
    QX.setQflag("ms_pad_kept");
  });
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
  QX.hook("spawn", function () {
    // ransom paid but the save happened inside the 2.5 s before the release: he is free all the same
    if (QX.flag("bell_paid") && !QX.flag("bell_freed") && QX.active(BELL)) {
      QX.setFlag("bell_freed");
      QX.setFlag("bell_how", "ransom");
      QX.setStage(BELL, "gc");
    }
    // Betty fell before anyone answered her broadcast: Harlan walked out in the confusion (qx_bell never starts, outline: gated on betty_dead).
    if (QX.qflag("betty_dead") && !QX.started(BELL) && !QX.flag("bell_freed")) {
      QX.setFlag("bell_freed");
      QX.setFlag("bell_how", "betty_fell");
    }
    const freed = QX.flag("bell_freed");
    const pos = freed ? harlanGCSpot() : harlanExchangeSpot();
    if (!pos) return;
    const a = QX.spawnNPC({
      id: "qx_harlan",
      type: "human",
      name: "Harlan Pruitt",
      outfit: freed ? "merchant" : "drifter",
      gender: "m",
      hair: "balding",
      beard: "full",
      skinTone: "tan",
      faction: "settlers",
      ai: freed ? "merchant" : "static",
      home: "here",
      homeR: freed ? 2 : 0.3,
      level: 5,
      hp: 90,
      noRespawn: true,
      essential: !freed,
      dialogue: "qx_dlg_harlan",
      pos: { x: pos.x, y: pos.y || 0, z: pos.z },
      voice: "merchant",
      merchant: freed
        ? { scrip: 450, stock: HARLAN_STOCK, restock: 2 }
        : undefined,
      barks: freed
        ? [
            "Pruitt and Sons! Freight, fair prices, and one opinion on oxen, free.",
            "Market's open. The good kind.",
            "You again! Best customer I ever had. Only customer who bought ME.",
          ]
        : [
            "Psst. You. You're not a raider. Raiders don't wash.",
            "Six days on this bell. Six.",
            "If you're buying, I'm cheap. Tell Betty I said that.",
          ],
    });
    if (a && !freed) {
      QX.safe("harlanPose", () => {
        if (a.char && a.char.setAnim) a.char.setAnim("cower", { loop: true });
      });
      if (a.setHostile) QX.safe("harlanCalm", () => a.setHostile(false));
    }
    // the pit boss, with the shackle key and (after a ransom) the Scrip
    if (!freed && !QX.flag("dead_qx_ticker")) {
      QX.spawnNPC({
        id: "qx_ticker",
        type: "human",
        name: 'Pit Boss "Ticker" Tate',
        outfit: "raider",
        gender: "m",
        hair: "mohawk",
        faction: "raiders",
        hostile: true,
        level: 8,
        hp: 150,
        noRespawn: true,
        ai: "guard",
        home: "here",
        homeR: 6,
        weapon: "combat_shotgun",
        inventory: [
          ["qx_shackle_key", 1],
          [QX.SCRIP_ID, 60],
          ["ammo_shotgun", 12],
          ["whiskey", 1],
        ],
        at: { fallback: { x: pos.x - 3, z: pos.z - 2.5, y: pos.y } },
        barks: [
          "Harlan's stock is DOWN, baby!",
          "Bid or get off the floor!",
          "SOLD! To the man with the... wait, that's not a bid, that's a gun.",
        ],
      });
    }
  });
  QX.hook("world", function () {
    const k = K();
    const p = QX.freeSpot(SP.dropBox.x, SP.dropBox.z, undefined, {
      maxR: 6,
      radius: 0.6,
    });
    SP.dropBox.x = p.x;
    SP.dropBox.z = p.z;
    SP.dropBox.y = p.y;
    QX.registerLock(SHACKLES);
    k.dropBox(p.x, p.y, p.z, Math.PI, "RANSOM\nDEPOSITS\nONLY");
    k.collider(p.x, p.z, 0.7, 0.6, p.y, p.y + 1.2, 0, "metal");
    QX.interact({
      pos: QX.V3(p.x, p.y + 1.0, p.z),
      radius: 0.7,
      label: "Ransom Drop Box",
      verb: "Pay Ransom",
      priority: 1,
      enabled: () =>
        QX.stage(BELL) === "find" &&
        QX.alive("qx_harlan") &&
        !QX.flag("bell_paid") &&
        !QX.qflag("betty_dead"),
      onInteract: () => B.dropBox(),
    });
  });

  const B = (QX.bell = {
    price() {
      return QX.flag("bell_haggled") ? RANSOM_HAGGLED : RANSOM;
    },
    dropBox() {
      if (QX.stage(BELL) !== "find") return;
      // Trade: a counter-offer note, once
      if (!QX.flag("bell_note") && QX.skill(SKILL_TRADE) >= 50) {
        QX.setFlag("bell_note");
        QX.setFlag("bell_haggled");
        QX.notify(
          '[Trade 50] You pin a counter-offer to the slot: "300, final. Your hostage eats more than he\'s worth." Ten minutes later, a scrawl comes back: "FINE."',
        );
        return;
      }
      const price = B.price();
      if (!QX.pay(price)) {
        QX.notify(
          "The slot is labelled " + price + " SCRIP. EXACT CHANGE. NO REFUNDS.",
        );
        return;
      }
      QX.setFlag("bell_paid");
      QX.setFlag("bell_ransom", price);
      QX.notify(
        "You feed " +
          price +
          " Scrip into the slot, note by note. Somewhere inside the Exchange, a bell rings. Twice.",
      );
      // Ticker carries the ransom now (optional: take it back)
      const t = QX.npc("qx_ticker");
      if (t && !t.dead && t.inventory)
        QX.safe("tickerScrip", () => {
          const e = t.inventory.find
            ? t.inventory.find((s) => s[0] === QX.SCRIP_ID)
            : null;
          if (e) e[1] += price;
          else t.inventory.push([QX.SCRIP_ID, price]);
        });
      QX.later(2.5, () => B.release("ransom"));
    },
    /** Harlan is free: he makes his own way to Grand Central. */
    release(how) {
      if (QX.flag("bell_freed")) return;
      QX.setFlag("bell_freed");
      QX.setFlag("bell_how", how);
      QX.say(
        "qx_harlan",
        how === "ransom"
          ? "They... they let me go? Somebody PAID for me? Grand Central — find me there, friend!"
          : "Free! Thank you, thank you! I'm not waiting to find out if Betty noticed. Grand Central — meet me there!",
        6,
      );
      QX.setStage(BELL, "gc");
      QX.later(5, relocateHarlan);
    },
    /** [Mechanics] the shackle's hinge pin is rusted half through: knock it out and the cuff falls open. */
    knockPin() {
      B.release("hinge");
    },
    /** The shackle is a key lock (G.locks): Ticker Tate carries the key. */
    useKey() {
      if (!QX.has("qx_shackle_key")) return;
      QX.openLock(SHACKLES, () => {
        QX.take("qx_shackle_key", 1);
        B.release("key");
      });
    },
    breakChain() {
      B.release("brawn");
    },
    reward() {
      if (QX.stage(BELL) !== "gc") return;
      QX.give("qx_pruitt_voucher", 1);
      const paid = QX.flag("bell_paid");
      QX.giveScrip(paid ? 150 : 250);
      QX.xp(paid ? 150 : 250, "The Closing Bell");
      QX.standing(paid ? 25 : 50, "Rescued Harlan Pruitt");
      QX.setFlag("bell_discount");
      QX.setStage(BELL, "done");
      QX.news(
        "Trade news: Harlan Pruitt is back in business at Grand Central, minus six days, one ransom and most of his dignity. Pruitt and Sons says the first opinion on oxen is free.",
      );
    },
  });
  function relocateHarlan() {
    const a = QX.npc("qx_harlan");
    if (!a || a.dead) return;
    const gc = harlanGCSpot();
    if (!gc) return;
    // walk off: only teleport when the player can't see the jump (far from both ends)
    if (QX.dist(a.pos.x, a.pos.z) < 40 && QX.dist(gc.x, gc.z) > 40) {
      if (a.moveTo)
        QX.safe("harlanWalk", () => a.moveTo(SP.dropBox.x, SP.dropBox.z - 12));
      if (a.char && a.char.setAnim)
        QX.safe("harlanRun", () => a.char.setAnim("run", { loop: true }));
      QX.later(5, relocateHarlan);
      return;
    }
    QX.removeNPC("qx_harlan");
    QX.later(0.1, () => {
      QX.run("spawnHarlanOnly");
    });
  }
  // Respawn Harlan at Grand Central as a trader (spawn hook re-reads the 'bell_freed' flag).
  QX.hook("spawnHarlanOnly", function () {
    const gc = harlanGCSpot();
    if (!gc) return;
    QX.spawnNPC({
      id: "qx_harlan",
      type: "human",
      name: "Harlan Pruitt",
      outfit: "merchant",
      gender: "m",
      hair: "balding",
      beard: "full",
      skinTone: "tan",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      homeR: 2,
      level: 5,
      hp: 90,
      noRespawn: true,
      dialogue: "qx_dlg_harlan",
      voice: "merchant",
      pos: { x: gc.x, y: gc.y || 0, z: gc.z },
      merchant: { scrip: 450, stock: HARLAN_STOCK, restock: 2 },
      barks: [
        "Pruitt and Sons! Freight, fair prices, and one opinion on oxen, free.",
        "Market's open. The good kind.",
      ],
    });
  });
  G.events.on("actorKilled", (a) => {
    if (!a) return;
    if (a.id === "qx_harlan" && QX.started(BELL) && !QX.done(BELL)) {
      QX.setStage(BELL, "failed");
      QX.standing(-10);
    }
    if (a.id === "qx_ticker" && QX.flag("bell_paid"))
      QX.setFlag("bell_ticker_dead");
  });
  // Optional objective: the ransom back (looting Ticker's Scrip after paying).
  G.events.on("itemAdded", (id, n) => {
    if (
      id === QX.SCRIP_ID &&
      QX.flag("bell_paid") &&
      QX.flag("bell_ticker_dead") &&
      !QX.flag("bell_refund")
    ) {
      const t = QX.npc("qx_ticker");
      if (t && t.dead && QX.dist(t.pos.x, t.pos.z) < 5) {
        QX.setFlag("bell_refund");
        QX.refresh(BELL);
      }
    }
    void n;
  });

  // ==================================================================
  // Dialogue
  // ==================================================================
  QX.hook("register", function () {
    // ------------------------------------------------------------ Static Okonkwo
    const nst = () => QX.stage(NUM);
    QX.dialogue("qx_dlg_sparks", {
      start: () => {
        if (QX.done(NUM)) return "after";
        const s = nst();
        if (s === "decode" && QX.has("qx_cipher_sheet")) return "gotpad";
        if (s === "choose") return "choose";
        if (s === "pad") return "padprog";
        if (QX.has("qx_cipher_sheet")) return "gotpad";
        return QX.flag("met_sparks") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Static Okonkwo",
          onEnter: () => QX.setFlag("met_sparks"),
          text:
            '[She holds up one finger without looking at you. A chime drifts out of the headphones around her neck, then a woman\'s voice: "...Nine. Nine. Two. Seven..." She writes it down.] ' +
            "Sorry. Group two. You don't interrupt group two. Static Okonkwo. Radios, repairs, and a strong professional interest in things that are none of my business.",
          responses: [
            { text: "What are you listening to?", next: "what" },
            {
              text: "I picked up that numbers station on my goggles.",
              next: "what",
              cond: () => QX.started(NUM),
            },
            { text: "What do you have for sale?", barter: true },
            { text: "I'll leave you to it.", end: true },
          ],
        },
        again: {
          speaker: "Static Okonkwo",
          text: "Back again? Station's still reading. Station's always reading.",
          responses: [
            { text: "Tell me about the numbers again.", next: "what" },
            { text: "What do you have for sale?", barter: true },
            { text: "Later.", end: true },
          ],
        },
        what: {
          speaker: "Static Okonkwo",
          text:
            "Ninety-three point nine. A numbers station. Chime, a voice reading five-digit groups, a line of Morse, then it starts over. " +
            "I've been writing it down for six years. Twelve notebooks. It's the Continuity — the chime is the first bar of \"Hail, Columbia\", slowed down to a crawl. Somebody's idea of a joke.",
          responses: [
            { text: "What do the numbers mean?", next: "otp" },
            { text: "And the Morse?", next: "morse" },
          ],
        },
        morse: {
          speaker: "Static Okonkwo",
          text:
            "Z. MARLOW. LIBERTY. Every time. \"Z\" is a priority prefix: I think it means somebody they're holding. Liberty's the island. Marlow's a name. " +
            "And twice a week, after the groups, a man reads names. Just surnames and an initial, like a school register. I can't tell you what list they come off without the key.",
          responses: [{ text: "What key?", next: "otp" }],
        },
        otp: {
          speaker: "Static Okonkwo",
          text:
            "One-time pad. Unbreakable, if you use it right. Which the Continuity does, mostly — they still think it's 1967 and the Reds are listening. Sheets of random numbers; add the sheet to the message and it's gibberish to everybody without the sheet. " +
            "Here's the thing — they don't radio the pads. Too smart for that. They walk them in. A courier in a grey overcoat and two Sky-Eye drones, once a month, up Lexington to the U.N.",
          responses: [{ text: '"Once a month"?', next: "courier" }],
        },
        courier: {
          speaker: "Static Okonkwo",
          text:
            "Last month he never came back down. His drones are still up by Fortieth Street, going around and around like a pair of dogs at a grave. " +
            "Somebody who wasn't me could go and look in his satchel. Somebody with a gun. And shoes.",
          responses: [
            {
              text: "I'll get you the pad.",
              next: "accept",
              cond: () => QX.mainOpen(NUM),
            },
            {
              id: "sparks_why",
              text: "Why do you care what the Continuity is saying?",
              next: "why",
            },
            {
              id: "sparks_pay",
              text: "What's in it for me?",
              check: { skill: "trade", value: 35 },
              next: "pay",
              failNext: "pay_fail",
              cond: () => !QX.flag("sparks_pay") && QX.mainOpen(NUM),
            },
            { text: "Not my business. Not yet.", end: true },
          ],
        },
        why: {
          speaker: "Static Okonkwo",
          text:
            "Because they're listening to US. Every Sky-Eye on every corner is a microphone with a speaker glued on so you don't notice. " +
            "Six years I've heard them talk, and I've never once heard them say anything nice. Also — [she taps a notebook] — group three changed three weeks ago. Right about when somebody walked out of the Municipal Building who hadn't walked anywhere since 1967.",
          responses: [
            {
              text: "I'll get you the pad.",
              next: "accept",
              cond: () => QX.mainOpen(NUM),
            },
            { text: "I'll think about it.", end: true },
          ],
        },
        pay: {
          speaker: "Static Okonkwo",
          onEnter: () => QX.setFlag("sparks_pay"),
          text: "Scrip, a cut of whatever's in his bag, and a real discount on anything I sell. You drive a bargain like a man with a jammed transmission. Deal.",
          responses: [{ text: "Deal.", next: "accept" }],
        },
        pay_fail: {
          speaker: "Static Okonkwo",
          text: "What's in it for you is knowing. Knowing is free. Knowing is also the most expensive thing in this city. Think about that on your way up Lexington.",
          responses: [
            { text: "Fine. I'll get the pad.", next: "accept" },
            { text: "Pass.", end: true },
          ],
        },
        accept: {
          speaker: "Static Okonkwo",
          onEnter: () => {
            if (!QX.started(NUM)) QX.start(NUM, { stage: "pad" });
            else if (nst() === "sparks") QX.setStage(NUM, "pad");
          },
          text: "Fortieth and Lex. Watch the drones — they're old but they're Continuity, which means they'll shoot first and file a form about it after. If you can get the bag without cracking them open, even better. Nobody comes looking for drones that don't call in dead.",
          responses: [{ text: "On my way.", end: true }],
        },
        padprog: {
          speaker: "Static Okonkwo",
          text: "Fortieth and Lex. Grey coat, satchel, two Sky-Eyes doing laps. Bring me the pad and we'll find out what the Continuity thinks about at night.",
          responses: [
            { text: "What do you have for sale?", barter: true },
            { text: "On it.", end: true },
          ],
        },
        gotpad: {
          speaker: "Static Okonkwo",
          text:
            "[She takes the rice-paper sheet with two fingers, like it's hot.] Sheet fourteen. \"Don't forget to eat this after reading.\" ...He didn't eat it. Bless the civil service. " +
            "Give me a minute. [She lays the sheet over her notebook, runs a pencil down the columns, subtracts under her breath. The pencil stops.]",
          responses: [
            {
              text: "What does it say?",
              next: "decoded",
              action: () => N.decode(),
            },
          ],
        },
        decoded: {
          speaker: "Static Okonkwo",
          text: () =>
            "Group one's a resupply window for Liberty Island. Group two's the Sky-Eye relay net. They rotate frequencies every Tuesday. Group three is the names. " +
            '[She reads it twice, then reads it out, flat, like the man on the radio.] "WAYTE, E. FILE C-9/WAYTE. PRIORITY ASSET. RECOVER WITH THE KEY." In plain text, like somebody couldn\'t help himself: "Walking around Manhattan in a cryo suit." ' +
            '"MEAD, N. STRUCK, 1968."' +
            (QX.qflag("con_knows_nicole")
              ? ' And a new line under it: "FILE REOPENED 1989. SLEEPER INQUIRING."'
              : "") +
            ' "MEAD, R. UNENROLLED. DIRECTIVE 7-A, SCHEDULE C." In brackets: STERILISE. ' +
            'Last one: "SUN CULT EMISSARY REQUESTS KEY B. REFUSED." [She looks at your suit. She looks at you.] Kid. That first line is you. And I\'d bet my headphones that "Mead, R." is somebody\'s little girl.' +
            (QX.roseNear(18)
              ? " [Behind you, Rose takes the transcript out of Static's hand without asking. She reads her own line twice. She folds the paper very small, gives it back, and says nothing at all.]"
              : ""),
          onEnter: () => {
            QX.msFlag("read_7a_schedule");
            if (QX.roseNear(18)) QX.msFlag("rose_read_schedule_c");
          },
          responses: [
            { text: "Why would the Continuity care about me?", next: "whyme" },
            { text: "What is Schedule C?", next: "sched" },
            { text: "What can we do about it?", next: "choose" },
          ],
        },
        sched: {
          speaker: "Static Okonkwo",
          text:
            "Directive 7-A. They've been reading it out since November: everybody who isn't on the 1967 enrolment rolls, sorted into schedules. Schedule C is the children, " +
            'everyone born since the Bombing, because nobody born since was ever enrolled. "Sterilise" is the word they use. They don\'t say how. They say "the Array" a lot. ' +
            "[She taps the last line.] And somebody in a robe walked up to their front door asking for a key. Funny old year.",
          responses: [
            { text: "Why would the Continuity care about me?", next: "whyme" },
            { text: "What can we do about it?", next: "choose" },
          ],
        },
        whyme: {
          speaker: "Static Okonkwo",
          text:
            "Sleeper file. They're not interested in what you DO, they're interested in what you ARE, and what you carry. A federal volunteer, frozen in '67, thawed in '89, with a key on him they want badly enough to write it down. Whoever signed you into Long Winter made a note somewhere, and the Continuity keeps very good notes. " +
            "That's above my pay grade. What isn't above my pay grade is what we do about it tonight.",
          responses: [{ text: "Go on.", next: "choose" }],
        },
        choose: {
          speaker: "Static Okonkwo",
          text:
            "Three ways I can see. One: I use group two to jam the Sky-Eye relay net, harbour and all. They'll fix it eventually, but for a good while there's not a drone over Liberty that can see you coming. " +
            "Two: we use the pad to talk back. Same cipher, their frequency. We tell them FILE C-9/WAYTE is closed: the sleeper's dead, stop looking. It takes a steady hand. If the groups are wrong, they'll know someone's got the pad. " +
            "Three: you keep the pad. Continuity paper is worth a lot to the right buyer, and we both pretend this never happened.",
          responses: [
            { text: "Jam the relay net.", next: "jam", action: () => N.jam() },
            {
              id: "sparks_fake",
              text: "Let me write the reply. I know how to make a cipher look right.",
              check: { skill: "electronics", value: 55 },
              next: "fake",
              failNext: "fake_fail",
              cond: () => !QX.flag("num_fake_failed"),
            },
            {
              id: "sparks_fake_w",
              text: 'The pad is additive mod ten. We encrypt "FILE C-9/WAYTE CLOSED" in their format, same padding, same prefix.',
              check: { attr: "wits", value: 8 },
              next: "fake",
              failNext: "fake_fail",
              cond: () => !QX.flag("num_fake_failed"),
            },
            {
              text: "I'll keep the pad. Let's leave it alone.",
              next: "keep",
              action: () => N.keep(),
            },
          ],
        },
        jam: {
          speaker: "Static Okonkwo",
          text:
            "[She is already turning dials.] Group two, Tuesday rotation... and... there. [Somewhere up the avenue a drone's recorded announcement turns into a long, sad whistle.] Oh, that's beautiful. That's the prettiest thing I've heard in six years. " +
            "Here — for your trouble. And for the next few hours, walk soft. Nobody's listening.",
          responses: [{ text: "Thanks, Static.", end: true }],
        },
        fake: {
          speaker: "Static Okonkwo",
          onEnter: () => N.fakeDeath(),
          text:
            '[You work it out on the back of her notebook: prefix, groups, padding, the anthem chime. She keys it out over a hand-cranked transmitter, one digit at a time.] ... [Thirty seconds of static. Then, on 93.9, the voice: "Acknowledged. FILE C-9/WAYTE closed."] ' +
            "You just died, kid. Congratulations. Nobody on that island is waiting up for you now.",
          responses: [{ text: "Rest in peace, me.", end: true }],
        },
        fake_fail: {
          speaker: "Static Okonkwo",
          onEnter: () => QX.setFlag("num_fake_failed"),
          text: "[She reads your groups and winces.] No. No — that's a bad group, they'd spot that in a heartbeat. We send that and we've got a Rotorcraft on Lexington by breakfast. Let's not. Jam or leave it?",
          responses: [
            { text: "Jam the relay net.", next: "jam", action: () => N.jam() },
            { text: "Leave it.", next: "keep", action: () => N.keep() },
          ],
        },
        keep: {
          speaker: "Static Okonkwo",
          text: "Your call. Your file. Your pad. [She hands the rice paper back with two fingers.] Somebody in this city will pay for that. If you change your mind, I'll be here. Writing down numbers. Forever, apparently.",
          responses: [{ text: "Goodbye, Static.", end: true }],
        },
        after: {
          speaker: "Static Okonkwo",
          text: () =>
            QX.flag("num_jammed")
              ? "Relay net's back up, by the way. They fixed it. But they had to send a Rotorcraft to do it, and I watched it land. I know where they park now."
              : QX.flag("num_ghost")
                ? "Station's reading a new group three. Doesn't mention you. Still mentions Schedule C. [She winks.] Ghost."
                : "Still writing it all down. Somebody has to. They read Schedule C again last night. Same names. One more.",
          responses: [
            { text: "What do you have for sale?", barter: true },
            { text: "See you, Static.", end: true },
          ],
        },
      },
    });

    // ------------------------------------------------------------ Harlan Pruitt
    const bst = () => QX.stage(BELL);
    QX.dialogue("qx_dlg_harlan", {
      start: () => {
        if (QX.done(BELL) || QX.flag("bell_how") === "betty_fell")
          return "after";
        if (bst() === "gc" || QX.flag("bell_freed")) return "thanks";
        return QX.flag("met_harlan") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Harlan Pruitt",
          onEnter: () => {
            QX.setFlag("met_harlan");
            if (!QX.started(BELL)) R.startBell();
          },
          text:
            "[A big, sun-browned man in a torn duster, chained by one ankle to the brass rail of the bell podium. He looks at you, looks past you for raiders, and lowers his voice.] " +
            "You're not one of Betty's. You've got that look — the \"I've bathed this month\" look. Harlan Pruitt, Pruitt and Sons Overland Freight. The sons are in Jersey. The freight is in Betty's pockets. And I am, apparently, for sale.",
          responses: [
            {
              text: "I heard the broadcast. I'm getting you out.",
              next: "how",
            },
            { text: "How much are you worth, exactly?", next: "price" },
            { text: "Good luck with that.", end: true },
          ],
        },
        again: {
          speaker: "Harlan Pruitt",
          text: "Still here. Still chained. Still worth five hundred Scrip, apparently, which is more than I was worth at my wedding.",
          responses: [
            { text: "How do I get you out?", next: "how" },
            { text: "Hang in there.", end: true },
          ],
        },
        price: {
          speaker: "Harlan Pruitt",
          text: "Five hundred, in the drop box on Wall Street. Betty rings the bell on the radio every night and the price goes up. It never actually goes up. She just likes saying it. She's very theatrical, for a woman who eats rats raw.",
          responses: [{ text: "How do I get you out?", next: "how" }],
        },
        how: {
          speaker: "Harlan Pruitt",
          text:
            "Ticker Tate — the pit boss, the one with the shotgun and the ticker tape in his hair — he's got the key. Or you pay the box and Betty lets me walk. " +
            "Or — I don't want to tell you your business — you've got hands. This shackle's older than I am.",
          responses: [
            {
              text: "[Use the shackle key]",
              cond: () => QX.has("qx_shackle_key"),
              next: "freed",
              action: () => B.useKey(),
            },
            {
              id: "harlan_pin",
              text: "Hold still. That hinge pin is rusted half through — one good knock and the cuff falls open.",
              check: { skill: "mechanics", value: 50 },
              next: "pinned",
              failNext: "pin_fail",
              cond: () => !QX.flag("harlan_pin_fail"),
            },
            {
              id: "harlan_str",
              text: "[Wrench the rail out of the podium]",
              check: { attr: "brawn", value: 8 },
              next: "freed",
              failNext: "str_fail",
              cond: () => !QX.flag("harlan_str_fail"),
              action: () => {
                if (QX.attr("brawn") >= 8) B.breakChain();
              },
            },
            { text: "I'll be back with the key, or the Scrip.", end: true },
          ],
        },
        pinned: {
          speaker: "Harlan Pruitt",
          text: "[You set the edge of a brass bell-clapper against the hinge pin and give it one short, honest whack. Harlan holds his breath so hard he goes purple. The pin drops out, the cuff swings open, and nobody upstairs hears a thing.] ...Well, I'll be.",
          responses: [
            { text: "Go. Quietly.", next: "freed", action: () => B.knockPin() },
          ],
        },
        pin_fail: {
          speaker: "Harlan Pruitt",
          onEnter: () => QX.setFlag("harlan_pin_fail"),
          text: "That's — no, you've mushroomed the end of it. It's not coming out now. It's never coming out. Okay. Okay. The key. Get the key.",
          responses: [{ text: "Right. The key.", end: true }],
        },
        str_fail: {
          speaker: "Harlan Pruitt",
          onEnter: () => QX.setFlag("harlan_str_fail"),
          text: "[The rail groans, and holds. Harlan pats your shoulder.] Good effort. Solid effort. They built this place to hold money. It holds.",
          responses: [{ text: "I'll find the key.", end: true }],
        },
        freed: {
          speaker: "Harlan Pruitt",
          text: "[The shackle drops. Harlan rubs his ankle and grins with every tooth he has left.] Grand Central. Find me at Grand Central. I owe you a thing Pruitts never say out loud. Go!",
          responses: [{ text: "Go. I'll see you there.", end: true }],
        },
        thanks: {
          speaker: "Harlan Pruitt",
          text: () =>
            QX.flag("bell_paid")
              ? "There they are! My investor! Five hundred Scrip — " +
                (QX.flag("bell_haggled")
                  ? "three hundred, you haggled ME, I heard — "
                  : "") +
                "I'll pay it back. Not all at once, I'm a Pruitt, but I'll pay it."
              : "There they are! The hero of Wall Street! Six days on that bell and you walked in like it was a Tuesday. Pruitt and Sons owes you, and Pruitts pay.",
          responses: [
            {
              text: "Glad you made it.",
              next: "reward",
              cond: () => bst() === "gc",
            },
            {
              text: "Glad you made it.",
              end: true,
              cond: () => bst() !== "gc",
            },
          ],
        },
        reward: {
          speaker: "Harlan Pruitt",
          onEnter: () => B.reward(),
          text: "Here — Scrip, and a voucher. One favour, redeemable any time, from any Pruitt. And I'm setting up shop right here. Freight, food, ammunition. For you, the good prices. The ones I give my mother.",
          responses: [
            { text: "Let's see what you've got.", barter: true },
            { text: "Take care, Harlan.", end: true },
          ],
        },
        after: {
          speaker: "Harlan Pruitt",
          text: "My favourite customer! Freight, food, ammunition. And one opinion on oxen, free: they're smarter than they look. They'd have to be.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Tell me about the convoy routes.", next: "routes" },
            { text: "Bye, Harlan.", end: true },
          ],
        },
        routes: {
          speaker: "Harlan Pruitt",
          text:
            "Grand Central to the Neon, the Neon to the Village, down Broadway to the bridge if the toll-boys are feeling reasonable. Never the East River at night. " +
            "And never, ever buy a hot dog from a man who won't tell you what's in it. That rules out every hot dog in New York. Hence my figure.",
          responses: [
            { text: "Ha. Let's trade.", barter: true },
            { text: "See you around.", end: true },
          ],
        },
      },
    });
  });
})();
