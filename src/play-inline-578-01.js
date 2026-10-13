// play-inline-578 01 — the
// Lines 33-379 of readable/play-inline-578.pretty.js (statement-aligned).
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
