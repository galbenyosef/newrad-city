// play-inline-583 01 — the
// Lines 21-350 of readable/play-inline-583.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const QX = G.qx;
  const K = () => QX.kit;

  const LH = "qx_lasthand",
    CH = "qx_chalk";
  // Shared ids owned by other modules (rpg).
  const OLD_DOLLARS = "old_dollars",
    FIZZO_BLUE = "fizzo_blue",
    FREEDOM_FLAKES = "freedom_flakes";
  /** The skull mailbox: a key lock (REBRAND §5). Deke the dealer palmed the key. */
  const SKULLBOX = {
    id: "qx_lh_skullbox",
    kind: "container",
    label: "Skull Mailbox",
    key: "qx_lh_key",
    hint: "Deke kept a key up his sleeve.",
    keyFrom: "Deke the dealer's remains (card table, 9th Ave & 20th St)",
  };
  const SP = {
    table: { x: -200, z: 128 }, // 9th Ave × 20th St (intersection, behind two wrecks)
    box: { x: -272, z: 79.6 }, // NE corner of 10th Ave × 23rd St
    lunch: { x: 47.6, z: 252 }, // 6th Ave east sidewalk, between 16th & 15th
    arrows: [
      // chalk arrows, in order (the last one is the "X")
      { x: 47.6, z: 239, to: { x: 48, z: 225 }, text: "1" },
      { x: 50.5, z: 225.6, to: { x: 75, z: 225.6 }, text: "2" },
      { x: 76, z: 225.6, to: { x: 100, z: 225.6 }, text: "3" },
      { x: 101, z: 225.6, to: { x: 108, z: 225.6 }, text: "4" },
    ],
    drain: { x: 108.5, z: 225.6 },
  };
  QX.unmarkedSpots = SP;

  // ==================================================================
  // Items
  // ==================================================================
  QX.hook("items", function () {
    const NOTE = (d) =>
      Object.assign(
        {
          type: "note",
          weight: 0,
          value: 0,
          noLoot: true,
          mesh: "paper",
          tags: ["note"],
        },
        d,
      );
    const Q = (d) =>
      Object.assign(
        {
          type: "misc",
          weight: 0,
          value: 0,
          quest: true,
          noLoot: true,
          tags: ["quest"],
        },
        d,
      );
    const defs = [
      NOTE({
        id: "qx_lh_scorecard",
        name: "Saturday Game Scorecard",
        title: "SATURDAY NIGHT GAME — 9th & 20th — HOUSE RULES",
        quest: true,
        text:
          "HOUSE RULES (no exceptions, Sal):\n1. Dealer's choice, nothing wild.\n2. No IOUs over 20 bucks.\n3. Winner of the LAST HAND takes the pot.\n" +
          "   Pot stays locked in the skull box, corner of 10th & 23rd\n   (one block west, one block up). Key goes in the MIDDLE OF THE TABLE.\n\n" +
          "SAT. NIGHT (still going Sun. a.m.)  DEKE   SAL   RUTHIE   MO\nhand 1             +12    -4     -4      -4\nhand 2             -6     +18    -6      -6\n" +
          "hand 3             +31    -9     -11     -11\nhand 4             +40    -20    +2      -22\n\n" +
          "[A different pen, pressed so hard it tore the card:]\n9:40 SUNDAY. SIRENS. Ruthie says it's a drill. Mo says it isn't.\nDeke says: LAST HAND. NOBODY LEAVES THE TABLE.",
      }),
      Q({
        id: "qx_lh_key",
        name: "Skull Box Key",
        type: "key",
        mesh: "key",
        desc: "A small brass mailbox key on a loop of string. It was up Deke's sleeve, next to an ace.",
      }),
      Q({
        id: "qx_lh_ace",
        name: "Deke's Sleeve Ace",
        quest: false,
        value: 5,
        mesh: "paper",
        tags: ["junk"],
        desc: "The ace of spades, soft as cloth, with a crease where it lived inside a cuff for twenty-two years.",
      }),
      NOTE({
        id: "qx_chalk_note",
        name: "Treasure Hunt Note",
        title: "DAD!!! (open me first)",
        quest: true,
        text:
          "DAD!!!\nHAPPY BIRTHDAY!!!\nIT'S A TRESURE HUNT. Mom said I could as long as I stay on OUR BLOCK and I did.\n" +
          "FOLLOW THE ARROWS. Don't cheat and don't ask Mom, she DOESN'T KNOW where.\nWhen you get to the X it is hot hot HOT.\n" +
          "love TOMMY (age 8 and 1/4)\n\nP.S. the arrows are in chalk so don't let it snow\nP.P.S. Sunday Mar 5 1967 (your birthday)",
      }),
      NOTE({
        id: "qx_chalk_card",
        name: "Hand-Made Birthday Card",
        title: "TO THE WORLD'S GREATEST DAD",
        quest: false,
        value: 0,
        text:
          "[Construction paper, folded twice. A crayon rocket on the front, and a man with a moustache riding it.]\n\n" +
          "HAPPY BIRTHDAY DAD\nYou are the best dad in New York and probably Brooklyn.\nI made you a ASHTRAY at school but you can use it for keys.\n" +
          "Also my Fizzo bottle-top collection. Not ALL of it. Some of it. It's a lot.\nWhen I grow up I am going to be a rocket man and you can come.\n\nlove TOMMY\n\n" +
          "[On the back, in adult handwriting, faint pencil — added later:]\nFound it, champ. Best present I ever got. Wait for me at the shelter. — Dad",
      }),
      Q({
        id: "qx_dad_ashtray",
        name: '"World\'s Greatest Dad" Ashtray',
        quest: false,
        type: "misc",
        weight: 0.5,
        value: 12,
        mesh: "bowl",
        tags: ["junk"],
        desc: "A lumpy clay ashtray, painted blue, with WORLD'S GRATEST DAD scratched in the rim. The fingerprints in the glaze are very small.",
      }),
    ];
    for (const d of defs) QX.defineItem(d);
  });

  // ==================================================================
  // Quests (no markers — unmarked)
  // ==================================================================
  const arrowsFound = () =>
    SP.arrows.filter((a, i) => QX.flag("chalk_" + i)).length;
  QX.hook("quests", function () {
    QX.define({
      id: LH,
      name: "Dead Man's Hand",
      giver: "",
      location: "9th Avenue & 20th Street",
      order: 51,
      unmarked: true,
      desc:
        "Four skeletons are still sitting at a card table in the middle of 9th Avenue, playing a hand that started when the sirens did. " +
        'According to their scorecard, the winner takes a pot locked in "the skull box" a block away. The key was supposed to be in the middle of the table.',
      stages: [
        {
          id: "key",
          text: "The key to \"the skull box\" should have been in the middle of the card table. It isn't. Somebody at that table didn't play fair.",
        },
        {
          id: "box",
          text: 'Open "the skull box" at the corner of 10th Avenue and 23rd Street, one block west and one block up from the card table.',
        },
        {
          id: "done",
          complete: true,
          text: () =>
            QX.flag("lh_cheat")
              ? "Deke palmed the key and an ace, and still never got up from the table. You collected his winnings."
              : "You opened the skull box and collected a twenty-two-year-old pot.",
        },
        {
          id: "o_cheat",
          sideObjective: true,
          text: "(Optional) Find out who was cheating.",
          doneIf: () => !!QX.flag("lh_cheat"),
          showIf: () => QX.stage(LH) === "key" || QX.stage(LH) === "box",
        },
      ],
      rewards: { xp: 150 },
    });
    QX.define({
      id: CH,
      name: "Getting Warmer",
      giver: "",
      location: "6th Avenue & 16th Street",
      order: 52,
      unmarked: true,
      desc: "A child's lunchbox on 6th Avenue held a note for his father: a birthday treasure hunt, laid out in chalk on the morning of March 5th, 1967.",
      stages: [
        {
          id: "follow",
          text: () =>
            'Follow Tommy\'s chalk arrows ("stay on OUR BLOCK") to the X (' +
            arrowsFound() +
            "/" +
            SP.arrows.length +
            " arrows).",
        },
        {
          id: "x",
          text: 'The arrows end at an X. "When you get to the X it is hot hot HOT."',
        },
        {
          id: "done",
          complete: true,
          text: "You found Tommy's birthday present for his dad. Somebody found it before you — and put it back.",
        },
      ],
      rewards: { xp: 100 },
    });
  });

  // ==================================================================
  // Actions (shared by the world, dialogue-free flows and the self-test)
  // ==================================================================
  const U = (QX.unmarked = {
    // ---- Dead Man's Hand ----
    lhStart(stage) {
      if (!QX.started(LH))
        QX.start(LH, { stage: stage || (QX.has("qx_lh_key") ? "box" : "key") });
      else if (stage && !QX.done(LH)) QX.setStage(LH, stage);
    },
    searchRemains(who) {
      const R = REMAINS.find((r) => r.id === who);
      if (!R) return false;
      if (QX.flag("lh_searched_" + who)) {
        QX.notify("You already went through " + R.name + "'s pockets.");
        return false;
      }
      QX.setFlag("lh_searched_" + who);
      QX.sfx("container_open");
      if (R.loot) for (const [id, n] of R.loot) QX.give(id, n);
      if (who === "deke") {
        QX.setFlag("lh_cheat");
        QX.give("qx_lh_key", 1);
        QX.give("qx_lh_ace", 1);
        QX.notify(R.found);
        QX.xp(25, "Caught a cheat");
        if (QX.started(LH) && !QX.done(LH)) QX.setStage(LH, "box");
      } else QX.notify(R.found);
      return true;
    },
    /** Senses 6+: the dealer's cuff gives him away the moment you look at the table. */
    readTable() {
      if (!QX.flag("lh_table_read")) {
        QX.setFlag("lh_table_read");
        QX.notify(
          "Four hands, face down forever. The dealer's pile of old-world dollars is twice anyone else's. In the middle of the table: an empty ring of dust where something small used to sit.",
        );
      }
      if (
        !QX.flag("lh_cheat") &&
        !QX.flag("lh_perc") &&
        QX.attr("senses") >= 6
      ) {
        QX.setFlag("lh_perc");
        QX.later(1.2, () =>
          QX.notify(
            "[Senses] The dealer's left cuff sits wrong — stiff, squared off. There is something up his sleeve.",
          ),
        );
      }
    },
    /** [Brawn 8] no key: wrench the rusted door clean off its hinges (the box's lock stays shut; the pot comes out). */
    wrenchBox() {
      if (QX.done(LH) || QX.attr("brawn") < 8) return false;
      QX.sfx("door_metal");
      QX.notify(
        "[Brawn] You get your fingers behind the rusted door and pull. Twenty-two years of rust give up before you do. The door comes away in your hands.",
      );
      QX.unlock(SKULLBOX.id);
      if (QX.world.lhBox && QX.live("containers") && G.containers.open)
        QX.safe("lhOpen", () => G.containers.open(QX.world.lhBox));
      else {
        QX.giveScrip(180);
        U.boxOpened();
      }
      return true;
    },
    boxOpened() {
      if (QX.done(LH)) return;
      if (!QX.started(LH)) QX.start(LH, { stage: "box" });
      QX.take("qx_lh_key", 1);
      QX.setStage(LH, "done");
      QX.news(
        "Strange sight on 9th Avenue: somebody finally cashed out the card game at 20th Street. Twenty-two years, four players, one pot. House always wins, folks. Eventually the house is a skeleton too.",
      );
    },
    // ---- Getting Warmer ----
    chalkStart() {
      if (!QX.started(CH))
        QX.start(CH, {
          stage: arrowsFound() >= SP.arrows.length ? "x" : "follow",
        });
    },
    arrow(i) {
      if (QX.flag("chalk_" + i)) return false;
      QX.setFlag("chalk_" + i);
      const lines = [
        'A chalk arrow on the paving, in a child\'s careful block capitals: "1 — THIS WAY DAD".',
        'Another arrow: "2 — WARMER!!". A rocket ship is drawn beside it.',
        '"3 — WARMER WARMER". A stick-figure dad with a moustache is following the arrow.',
        '"4 — HOT!!! DON\'T CHEAT". The arrow points at a drain grate.',
      ];
      if (QX.started(CH) && !QX.done(CH)) {
        QX.notify(lines[i] || "Another chalk arrow.", { quiet: true });
        if (arrowsFound() >= SP.arrows.length && QX.stage(CH) === "follow")
          QX.setStage(CH, "x");
        else QX.refresh(CH);
      }
      return true;
    },
    openDrain() {
      if (QX.flag("chalk_opened")) return false;
      QX.setFlag("chalk_opened");
      QX.sfx("container_open");
      QX.give("qx_chalk_card", 1);
      QX.give("qx_dad_ashtray", 1);
      QX.giveScrip(64);
      QX.give(FIZZO_BLUE, 1);
      QX.give(FREEDOM_FLAKES, 1);
      QX.notify(
        "Under the grate, wedged on a ledge above the drain: a biscuit tin wrapped in a plastic bread bag. Inside, a card, an ashtray, a bottle of Fizzo Blue, a box of Freedom Flakes — and a tight roll of sixty-four Scrip notes, much newer than anything else in the tin.",
      );
      if (!QX.started(CH)) QX.start(CH, { stage: "x" });
      if (!QX.done(CH)) {
        QX.setStage(CH, "done");
        QX.standing(5);
      }
      return true;
    },
    arrowsFound,
  });

  // ==================================================================
  // World
  // ==================================================================
