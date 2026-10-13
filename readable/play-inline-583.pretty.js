/* src/quests_extra/50_unmarked.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS_EXTRA — 50: UNMARKED QUESTS
 * "Unmarked" quests: no quest giver, no map marker. They start from
 * something the player finds in the street and are solved by reading the
 * world, not by following an arrow.
 *
 *   qx_lasthand  "Dead Man's Hand"   Four skeletons still seated at a card
 *                table in the middle of 9th Avenue & 20th Street. The
 *                scorecard says the pot is locked in "the skull box" on
 *                the corner of 10th & 23rd and the key went in the middle
 *                of the table. It isn't there. Someone at this table
 *                cheated (search the remains / [Senses]). The box is a
 *                key lock (G.locks 'qx_lh_skullbox', key qx_lh_key up the
 *                dealer's sleeve), or [Brawn 8] wrench the rusted door off.
 *   qx_chalk     "Getting Warmer"    A child's lunchbox on 6th Avenue with
 *                a note: a birthday treasure hunt for Dad, March 5th,
 *                1967. Follow the chalk arrows to the loose drain grate.
 * ===================================================================== */
(function () {
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
  const REMAINS = [
    {
      id: "deke",
      name: "the dealer",
      seat: 0,
      loot: [[OLD_DOLLARS, 8]],
      found:
        'The dealer\'s left cuff is stiff. Inside it: a brass key on a string, and the ace of spades. The rest of his "winnings" are in his lap.',
    },
    {
      id: "sal",
      name: "Sal",
      seat: 1,
      loot: [["cigarettes", 1]],
      found:
        "Sal: a pack of cigarettes, an IOU for twenty dollars made out to Deke, and a pair of three.",
    },
    {
      id: "ruthie",
      name: "Ruthie",
      seat: 2,
      loot: [["lighter", 1]],
      found:
        "Ruthie: a silver lighter and a full house, kings over nines. She would have won.",
    },
    {
      id: "mo",
      name: "Mo",
      seat: 3,
      loot: [["subway_token", 1]],
      found:
        "Mo: a subway token, a rabbit's foot and a hand of nothing. He folded. He never got up.",
    },
  ];
  QX.hook("world", function () {
    const k = K();
    // ---------------- Dead Man's Hand: the table ----------------
    const t = QX.freeSpot(SP.table.x, SP.table.z, undefined, {
      maxR: 8,
      radius: 1.8,
    });
    SP.table.x = t.x;
    SP.table.z = t.z;
    SP.table.y = t.y;
    const g = k.group(t.x, t.y, t.z, 0.25, 110);
    const b = k.builder();
    const wood = k.mat("wood_planks", 0x5a3a20),
      felt = k.tint("qx_lh_felt", 0x1c3a26, { roughness: 1 }),
      card = k.tint("qx_card", 0xece6d4, { roughness: 0.8 });
    const chip = k.tint("qx_lh_chip", 0x8a2a22, { roughness: 0.6 }),
      money = k.tint("qx_lh_money", 0x6f7a55, { roughness: 0.95 }),
      glass = k.tint("qx_lh_glass", 0x4a3a1a, {
        roughness: 0.2,
        metalness: 0.1,
      });
    k.cyl(b, wood, 0.62, 0.05, 0, 0.74, 0, 18);
    k.cyl(b, felt, 0.57, 0.012, 0, 0.768, 0, 18);
    k.cyl(b, wood, 0.06, 0.72, 0, 0.36, 0, 8);
    k.cyl(b, wood, 0.32, 0.04, 0, 0.02, 0, 12);
    // four hands of cards, face down in front of each seat; dollars & chips
    for (let s = 0; s < 4; s++) {
      const a = (s * Math.PI) / 2,
        cx = Math.sin(a) * 0.4,
        cz = Math.cos(a) * 0.4;
      for (let c = 0; c < 5; c++)
        k.box(
          b,
          card,
          0.065,
          0.004,
          0.09,
          cx + Math.cos(a) * (c - 2) * 0.03,
          0.777,
          cz - Math.sin(a) * (c - 2) * 0.03,
          a + (c - 2) * 0.12,
        );
      k.box(
        b,
        money,
        0.14,
        0.012 + (s === 0 ? 0.03 : 0.006 * s),
        0.07,
        Math.sin(a) * 0.22 + 0.08,
        0.782,
        Math.cos(a) * 0.22,
        a,
      );
      for (let c = 0; c < 3 + s; c++)
        k.cyl(
          b,
          chip,
          0.022,
          0.006,
          Math.sin(a + 0.6) * 0.3,
          0.778 + c * 0.006,
          Math.cos(a + 0.6) * 0.3,
          8,
        );
    }
    k.cyl(b, glass, 0.04, 0.24, 0.12, 0.89, -0.1, 8);
    k.cyl(b, glass, 0.015, 0.06, 0.12, 1.03, -0.1, 6); // whiskey bottle
    // the dust ring where the key should be
    k.cyl(
      b,
      k.tint("qx_lh_dust", 0x6a6050, { roughness: 1 }),
      0.05,
      0.002,
      0,
      0.775,
      0,
      10,
    );
    // four chairs; seat 0.45 (the seated skeleton pose sits on 0.45)
    for (let s = 0; s < 4; s++) {
      const a = (s * Math.PI) / 2,
        cx = Math.sin(a) * 0.95,
        cz = Math.cos(a) * 0.95;
      k.box(b, wood, 0.44, 0.04, 0.42, cx, 0.43, cz, a);
      const bx = Math.sin(a) * 1.16,
        bz = Math.cos(a) * 1.16;
      k.box(b, wood, 0.42, 0.5, 0.04, bx, 0.7, bz, a);
      for (const [lx, lz] of [
        [-0.18, -0.17],
        [0.18, -0.17],
        [-0.18, 0.17],
        [0.18, 0.17],
      ]) {
        const c = Math.cos(a),
          sn = Math.sin(a);
        k.box(
          b,
          wood,
          0.035,
          0.42,
          0.035,
          cx + lx * c + lz * sn,
          0.21,
          cz - lx * sn + lz * c,
        );
      }
    }
    k.flush(b, g, false);
    k.collider(t.x, t.z, 2.4, 2.4, t.y, t.y + 0.8, 0.25, "wood");
    // the players (seat s sits at angle a, facing the table centre)
    for (const R of REMAINS) {
      const a = 0.25 + (R.seat * Math.PI) / 2;
      const sx = t.x + Math.sin(a) * 0.9,
        sz = t.z + Math.cos(a) * 0.9;
      QX.prop("skeleton", {
        x: sx,
        y: t.y,
        z: sz,
        yaw: QX.yawTo(sx, sz, t.x, t.z),
        pose: "seated",
        persistent: true,
      });
      QX.interact({
        pos: QX.V3(sx, t.y + 0.95, sz),
        radius: 0.45,
        label:
          R.id === "deke" ? "The Dealer's Remains" : "Remains of " + R.name,
        verb: "Search",
        priority: 1,
        enabled: () => !QX.flag("lh_searched_" + R.id),
        onInteract: () => U.searchRemains(R.id),
      });
    }
    QX.interact({
      pos: QX.V3(t.x, t.y + 0.85, t.z),
      radius: 0.55,
      label: "Card Table",
      verb: "Examine",
      priority: 0,
      enabled: () => !QX.done(LH),
      onInteract: () => U.readTable(),
    });
    // two wrecks as a windbreak, a street lamp that went out with the game
    QX.prop("car", {
      x: t.x - 5.2,
      z: t.z - 2.5,
      yaw: 1.35,
      kind: "coupe",
      wreck: true,
      persistent: true,
    });
    QX.prop("car", {
      x: t.x + 4.8,
      z: t.z + 3.0,
      yaw: -1.9,
      kind: "sedan",
      wreck: true,
      burnt: true,
      persistent: true,
    });

    // ---------------- the skull box ----------------
    const m = QX.freeSpot(SP.box.x, SP.box.z, undefined, {
      maxR: 5,
      radius: 0.5,
    });
    SP.box.x = m.x;
    SP.box.z = m.z;
    SP.box.y = m.y;
    const yaw = -Math.PI / 2; // mail slot faces the avenue (west)
    QX.registerLock(SKULLBOX);
    if (QX.live("containers") && G.containers.create) {
      QX.world.lhBox = QX.safe("lhBox", () =>
        G.containers.create({
          id: "qx_lh_skullbox",
          kind: "mailbox",
          name: "Mailbox (painted skull)",
          pos: { x: m.x, y: m.y, z: m.z },
          yaw,
          lock: SKULLBOX,
          items: [
            [QX.SCRIP_ID, 180],
            [OLD_DOLLARS, 14],
            ["magnum_44", 1],
            ["ammo_44", 18],
            ["scotch", 1],
            ["cigarette_carton", 1],
          ].filter((e) => e[0] === QX.SCRIP_ID || QX.itemExists(e[0])),
        }),
      );
    }
    // no key: a strong stranger can tear the rusted door off (the key path always works too)
    QX.interact({
      pos: QX.V3(m.x, m.y + 0.6, m.z),
      radius: 0.5,
      label: "Rusted Mailbox Door",
      verb: "[Brawn 8] Wrench Open",
      priority: 0,
      enabled: () =>
        !QX.done(LH) &&
        !QX.has("qx_lh_key") &&
        !QX.isUnlocked(SKULLBOX.id) &&
        QX.attr("brawn") >= 8,
      onInteract: () => U.wrenchBox(),
    });
    // the painted skull: a white skull stencil on the mailbox's front (container models face +Z local)
    const sk = k.group(m.x, m.y, m.z, yaw, 90);
    const skull = skullTexture();
    const pm = new THREE.MeshStandardMaterial({
      map: skull,
      transparent: true,
      alphaTest: 0.2,
      roughness: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.38), pm);
    plane.position.set(0, 0.64, 0.254); // the mailbox's front (+Z), over the U.S. MAIL panel
    sk.add(plane);
    // nobody mails anything here: a dead pigeon & a pile of leaves (cheap boxes)
    const lb = k.builder();
    k.box(
      lb,
      k.tint("qx_lh_leaves", 0x5a4a2a, { roughness: 1 }),
      0.8,
      0.06,
      0.5,
      0.2,
      0.03,
      0.55,
      0.4,
    );
    k.flush(lb, sk, false);
    if (!QX.world.lhBox) {
      // no container system: the box is a plain "Open" interactable
      QX.interact({
        pos: QX.V3(m.x, m.y + 1.0, m.z),
        radius: 0.5,
        label: "Mailbox (painted skull)",
        verb: "Open",
        priority: 1,
        enabled: () => !QX.done(LH) && QX.has("qx_lh_key"),
        onInteract: () =>
          QX.openLock(SKULLBOX, () => {
            QX.giveScrip(180);
            U.boxOpened();
          }),
      });
    }

    // ---------------- Getting Warmer ----------------
    const lu = QX.freeSpot(SP.lunch.x, SP.lunch.z, undefined, {
      maxR: 4,
      radius: 0.35,
    });
    SP.lunch.x = lu.x;
    SP.lunch.z = lu.z;
    SP.lunch.y = lu.y;
    const lg = k.group(lu.x, lu.y, lu.z, 0.4, 70);
    const bb = k.builder();
    const tin = k.tint("qx_chalk_lunch", 0xc8402a, {
        roughness: 0.5,
        metalness: 0.5,
      }),
      tin2 = k.tint("qx_chalk_lunch2", 0xe0c040, {
        roughness: 0.5,
        metalness: 0.5,
      });
    k.box(bb, tin, 0.3, 0.2, 0.12, 0, 0.1, 0);
    k.box(bb, tin2, 0.31, 0.03, 0.125, 0, 0.13, 0);
    k.torus(bb, tin2, 0.05, 0, 0.215, 0, 0, Math.PI / 2);
    k.flush(bb, lg, false);
    decal(
      lu.x - 0.9,
      lu.y,
      lu.z + 0.2,
      QX.yawTo(lu.x, lu.z, SP.arrows[0].x, SP.arrows[0].z),
      "start",
    );
    SP.arrows.forEach((a, i) => {
      const p = QX.freeSpot(a.x, a.z, undefined, { maxR: 3, radius: 0.3 });
      a.x = p.x;
      a.z = p.z;
      a.y = p.y;
      decal(p.x, p.y, p.z, QX.yawTo(p.x, p.z, a.to.x, a.to.z), a.text);
    });
    const d = QX.freeSpot(SP.drain.x, SP.drain.z, undefined, {
      maxR: 3,
      radius: 0.4,
    });
    SP.drain.x = d.x;
    SP.drain.z = d.z;
    SP.drain.y = d.y;
    decal(d.x, d.y, d.z, 0, "x");
    const dg = k.group(d.x, d.y, d.z, 0, 70);
    const db = k.builder();
    const iron = k.tint("qx_chalk_grate", 0x2a2724, {
      roughness: 0.6,
      metalness: 0.7,
    });
    for (let i = -3; i <= 3; i++)
      k.box(db, iron, 0.05, 0.03, 0.5, i * 0.08, 0.015, 0);
    k.box(db, iron, 0.6, 0.03, 0.05, 0, 0.015, -0.25);
    k.box(db, iron, 0.6, 0.03, 0.05, 0, 0.015, 0.25);
    k.flush(db, dg, false);
    QX.interact({
      pos: QX.V3(d.x, d.y + 0.3, d.z),
      radius: 0.6,
      label: "Loose Drain Grate",
      verb: "Reach Under",
      priority: 1,
      enabled: () => !QX.flag("chalk_opened"),
      onInteract: () => U.openDrain(),
    });
  });

  // Session pickups: the scorecard on the table, Tommy's note on the lunchbox.
  QX.hook("spawn", function () {
    if (
      !QX.started(LH) &&
      !QX.has("qx_lh_scorecard") &&
      SP.table.y !== undefined
    )
      QX.pickup("lh_card", "qx_lh_scorecard", 1, {
        x: SP.table.x + 0.18,
        y: SP.table.y + 0.78,
        z: SP.table.z - 0.12,
      });
    if (!QX.started(CH) && !QX.has("qx_chalk_note") && SP.lunch.y !== undefined)
      QX.pickup("chalk_note", "qx_chalk_note", 1, {
        x: SP.lunch.x,
        y: SP.lunch.y + 0.23,
        z: SP.lunch.z,
      });
  });
  G.events.on("itemAdded", (id) => {
    if (id === "qx_lh_scorecard" && !QX.started(LH)) {
      U.lhStart();
      QX.notify(
        '"Winner of the LAST HAND takes the pot... Key goes in the MIDDLE OF THE TABLE." The middle of the table is empty.',
        { quiet: true },
      );
    }
    if (id === "qx_chalk_note" && !QX.started(CH)) {
      U.chalkStart();
    }
  });
  G.events.on("containerOpened", (c) => {
    if (c && c.id === "qx_lh_skullbox") U.boxOpened();
  });

  // Walking over an arrow counts it (once the hunt is known; before, it's just graffiti).
  SP.arrows.forEach((a, i) => {
    QX.trigger({
      id: "chalk_arrow_" + i,
      pos: () => a,
      r: 2.6,
      once: false,
      cooldown: 2,
      cond: () => QX.started(CH) && !QX.done(CH) && !QX.flag("chalk_" + i),
      fire: () => U.arrow(i),
    });
  });
  // Seeing the arrows first: the lunchbox is right there.
  QX.trigger({
    id: "chalk_hint",
    pos: () => SP.arrows[0],
    r: 3,
    cond: () => !QX.started(CH),
    fire: () =>
      QX.notify(
        'A chalk arrow on the sidewalk, in a child\'s hand: "1 — THIS WAY DAD". Somebody has gone over it again and again in fresher chalk, for years by the look of it. It starts at a red lunchbox by the kerb.',
        { quiet: true },
      ),
  });
  QX.trigger({
    id: "lh_hint",
    pos: () => SP.table,
    r: 9,
    cond: () => !QX.started(LH),
    fire: () =>
      QX.notify(
        "Four people died playing cards in the middle of 9th Avenue. None of them got up to run.",
        { quiet: true },
      ),
  });

  // ------------------------------------------------------------------
  // Canvas art: chalk arrows and the stencilled skull
  // ------------------------------------------------------------------
  const texCache = {};
  function chalkTexture(kind) {
    if (texCache[kind]) return texCache[kind];
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const x = c.getContext("2d");
    const col =
      kind === "x"
        ? "240,120,140"
        : kind === "start"
          ? "150,200,255"
          : "245,242,225";
    // a chalk stroke = many jittered, semi-transparent short lines
    let seed = 7 + kind.charCodeAt(0);
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed & 0xffff) / 0xffff;
    };
    const stroke = (pts, w) => {
      for (let pass = 0; pass < 5; pass++) {
        x.strokeStyle = "rgba(" + col + "," + (0.18 + rnd() * 0.22) + ")";
        x.lineWidth = w * (0.5 + rnd() * 0.7);
        x.lineCap = "round";
        x.beginPath();
        pts.forEach((p, i) => {
          const jx = p[0] + (rnd() - 0.5) * 5,
            jy = p[1] + (rnd() - 0.5) * 5;
          if (i) x.lineTo(jx, jy);
          else x.moveTo(jx, jy);
        });
        x.stroke();
      }
    };
    if (kind === "x") {
      stroke(
        [
          [60, 60],
          [196, 196],
        ],
        16,
      );
      stroke(
        [
          [196, 60],
          [60, 196],
        ],
        16,
      );
      stroke(
        [
          [128, 20],
          [150, 40],
          [128, 60],
          [106, 40],
          [128, 20],
        ],
        6,
      ); // a little heart-ish flourish
    } else {
      // arrow pointing up the canvas (+Y of the plane → forward)
      stroke(
        [
          [128, 236],
          [128, 50],
        ],
        14,
      );
      stroke(
        [
          [76, 104],
          [128, 40],
          [180, 104],
        ],
        14,
      );
      x.fillStyle = "rgba(" + col + ",0.85)";
      x.font = 'bold 54px "Comic Sans MS", "Chalkboard", cursive';
      x.textAlign = "center";
      x.fillText(kind === "start" ? "DAD" : kind, 196, 200);
      if (kind === "4") {
        x.font = 'bold 30px "Comic Sans MS", cursive';
        x.fillText("HOT!!", 62, 214);
      }
      if (kind === "2" || kind === "3") {
        x.font = 'bold 26px "Comic Sans MS", cursive';
        x.fillText("WARMER", 64, 226);
      }
    }
    const t = new THREE.CanvasTexture(c);
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    texCache[kind] = t;
    return t;
  }
  const decalMats = {};
  function decal(xw, y, zw, yaw, kind) {
    const m =
      decalMats[kind] ||
      (decalMats[kind] = new THREE.MeshStandardMaterial({
        map: chalkTexture(kind),
        transparent: true,
        depthWrite: false,
        roughness: 1,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
      }));
    const g = new THREE.Group();
    g.position.set(xw, y + 0.02, zw);
    g.rotation.y = yaw;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.renderOrder = 2;
    g.add(mesh);
    G.scene.add(g);
    if (G.world.addLOD) G.world.addLOD(g, 60);
    return g;
  }
  function skullTexture() {
    if (texCache.skull) return texCache.skull;
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const x = c.getContext("2d");
    x.fillStyle = "rgba(236,232,220,0.92)";
    x.beginPath();
    x.arc(64, 54, 38, 0, Math.PI * 2);
    x.fill();
    x.fillRect(40, 70, 48, 30);
    x.globalCompositeOperation = "destination-out";
    x.beginPath();
    x.arc(48, 56, 11, 0, Math.PI * 2);
    x.arc(80, 56, 11, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.moveTo(64, 66);
    x.lineTo(57, 80);
    x.lineTo(71, 80);
    x.closePath();
    x.fill();
    for (let i = 0; i < 4; i++) x.fillRect(46 + i * 10, 88, 4, 12);
    x.globalCompositeOperation = "source-over";
    // drips
    x.fillStyle = "rgba(236,232,220,0.8)";
    for (const dx of [44, 70, 86]) x.fillRect(dx, 98, 3, 10 + (dx % 7) * 2);
    const t = new THREE.CanvasTexture(c);
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    texCache.skull = t;
    return t;
  }
})();
