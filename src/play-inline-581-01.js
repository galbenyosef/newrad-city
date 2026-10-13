// play-inline-581 01 — zora
// Lines 15-362 of readable/play-inline-581.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const QX = G.qx;
  const K = () => QX.kit;

  const SP = {
    zora: { x: 236, z: 214 }, // Union Square plaza, NW quarter
    stash: { x: 111, z: 420 }, // Washington Square, south of the arch, by the old chess tables
    lou: { x: 27, z: -106 }, // 34th St & 6th Ave corner, Herald Square
  };
  QX.streetSpots = SP;
  const PQ = "qx_prophecy";
  // Shared ids owned by other modules (rpg).
  const MED_JET = "rally_tonic",
    FIZZO_BLUE = "fizzo_blue";

  // ==================================================================
  // Quest: The Ninth Stone (unmarked — no map marker)
  // ==================================================================
  QX.hook("quests", function () {
    QX.define({
      id: PQ,
      name: "The Ninth Stone",
      giver: "Madame Zora",
      location: "Washington Square",
      order: 50,
      desc:
        'Madame Zora turned a card and told you something she swears she has never told anyone: "Beneath the stone arch, where the kings sit and never move, ' +
        "count nine stones from the old men's tables. What the stranger finds there was left for a stranger.\"",
      stages: [
        {
          id: "seek",
          text: 'Find the ninth stone beneath the arch, "where the kings sit and never move".',
        },
        {
          id: "done",
          complete: true,
          text: "You found what was buried under the ninth stone. Madame Zora, it seems, is occasionally right.",
        },
      ],
      rewards: { xp: 100 },
    });
  });

  // ==================================================================
  // World
  // ==================================================================
  QX.hook("world", function () {
    const k = K();
    // Zora's booth (a striped carnival tent, see QX.kit.tent)
    const z = QX.freeSpot(SP.zora.x, SP.zora.z, undefined, {
      maxR: 10,
      radius: 3.0,
    });
    SP.zora.x = z.x;
    SP.zora.z = z.z;
    SP.zora.y = z.y;
    // the booth's mouth faces the middle of the square, where the foot traffic is
    const tyaw = Math.atan2(240 - z.x, 220 - z.z);
    const tent = k.tent(z.x, z.y, z.z, tyaw);
    SP.zora.seat = tent.seat;
    SP.zora.front = tent.front;

    // the ninth stone (a loose paving slab)
    const s = QX.freeSpot(SP.stash.x, SP.stash.z, undefined, {
      maxR: 6,
      radius: 0.5,
    });
    SP.stash.x = s.x;
    SP.stash.z = s.z;
    SP.stash.y = s.y;
    const sg2 = k.group(s.x, s.y, s.z, 0.3, 70);
    const sb = k.builder();
    const slab = k.mat("concrete", 0x6a6660);
    k.box(sb, slab, 0.62, 0.06, 0.62, 0, 0.03, 0, 0.08);
    k.box(
      sb,
      k.tint("qx_stone_chalk", 0xd8d0b8),
      0.05,
      0.005,
      0.22,
      0.12,
      0.064,
      0,
      0.7,
    ); // a chalk "IX", barely visible
    k.box(
      sb,
      k.tint("qx_stone_chalk", 0xd8d0b8),
      0.05,
      0.005,
      0.22,
      0.2,
      0.064,
      0,
      -0.7,
    );
    k.flush(sb, sg2, false);
    QX.interact({
      pos: QX.V3(s.x, s.y + 0.15, s.z),
      radius: 0.6,
      label: "Loose Paving Stone",
      verb: "Pry Up",
      priority: 1,
      enabled: () => !QX.flag("stash_found"),
      onInteract: () => Z.openStash(),
    });

    // Fingers's card table (Fingers stands behind it, facing the avenue)
    const l = QX.freeSpot(SP.lou.x, SP.lou.z, undefined, {
      maxR: 8,
      radius: 1.6,
    });
    SP.lou.x = l.x;
    SP.lou.z = l.z;
    SP.lou.y = l.y;
    k.cardTable(l.x, l.y, l.z, 0);
    k.collider(l.x, l.z, 0.9, 0.6, l.y, l.y + 0.8, 0, "wood");
  });

  QX.hook("spawn", function () {
    const zora = QX.spawnNPC({
      id: "qx_zora",
      type: "human",
      name: "Madame Zora",
      outfit: "settler",
      gender: "f",
      hair: "long",
      hairColor: 0x2a2020,
      skinTone: "olive",
      hat: "scarf",
      faction: "settlers",
      ai: "static",
      home: "here",
      homeR: 0.5,
      essential: true,
      level: 3,
      dialogue: "qx_dlg_zora",
      voice: "merchant",
      pos: SP.zora.seat
        ? { x: SP.zora.seat.x, y: SP.zora.y || 0, z: SP.zora.seat.z }
        : { x: SP.zora.x, y: SP.zora.y || 0, z: SP.zora.z },
      lookAt: SP.zora.front || { x: 240, z: 220 },
      barks: [
        "The cards know your name, child. They are too polite to say it.",
        "Your future, ten Scrip. Your past, free — it is written all over you.",
        "I see... a long journey. Also, you are standing on my foot.",
      ],
    });
    // older saves restore her where the old tent had her: put her back behind her table
    if (
      zora &&
      !zora.dead &&
      zora.pos &&
      SP.zora.seat &&
      Math.hypot(zora.pos.x - SP.zora.seat.x, zora.pos.z - SP.zora.seat.z) > 0.8
    )
      QX.safe("zoraMove", () => {
        zora.pos.x = SP.zora.seat.x;
        zora.pos.z = SP.zora.seat.z;
        if (zora.home && typeof zora.home === "object") {
          zora.home.x = SP.zora.seat.x;
          zora.home.z = SP.zora.seat.z;
        }
        if (SP.zora.front)
          zora.yaw = QX.yawTo(
            SP.zora.seat.x,
            SP.zora.seat.z,
            SP.zora.front.x,
            SP.zora.front.z,
          );
      });
    const L = SP.lou;
    if (!QX.flag("lou_gone"))
      QX.spawnNPC({
        id: "qx_lou",
        type: "human",
        name: "Fingers Fiorello",
        outfit: "merchant",
        gender: "m",
        hair: "slick",
        hat: "fedora",
        skinTone: "tan",
        faction: "settlers",
        ai: "static",
        home: "here",
        homeR: 0.5,
        level: 4,
        dialogue: "qx_dlg_lou",
        weapon: "switchblade",
        inventory: [[QX.SCRIP_ID, 140]],
        pos: { x: L.x, y: L.y || 0, z: L.z - 0.75 },
        yaw: Math.PI,
        barks: [
          "Follow the lady! Follow the lady!",
          "Easy money, easy money, find the queen!",
          "Nobody loses at Fingers'! Some people just win less.",
          "Round and round she goes!",
        ],
      });
  });

  // ==================================================================
  // Zora: readings
  // ==================================================================
  // attrs: attribute boons by name (turned into effect mods at read time by QX.attrMods); skills: shared skill ids
  const CARDS = [
    {
      id: "stranger",
      name: "The Stranger",
      text: "The Stranger, upright. A figure in a grey-white padded suit, walking toward a burning city. You will travel far, meet many people, and shoot most of them.",
      attrs: { senses: 1 },
      desc: "+1 Senses",
    },
    {
      id: "tower",
      name: "The Tower",
      text: "The Tower. The Empire State, struck by lightning. Something big is about to fall. Try not to be under it. Or, better, be the lightning.",
      mods: { skills: { firearms: 10 } },
      desc: "+10 Firearms",
    },
    {
      id: "star",
      name: "The Star",
      text: "The Star. A girl pouring clean water into a crater. Hope, child. Hope, and a good water filter.",
      attrs: { grit: 1 },
      mods: { skills: { medicine: 5 } },
      desc: "+1 Grit, +5 Medicine",
    },
    {
      id: "hermit",
      name: "The Hermit",
      text: "The Hermit. An old man with a lantern, in a subway tunnel. Walk softly in the dark places. The dark places are listening.",
      mods: { skills: { stealth: 10 } },
      desc: "+10 Stealth",
    },
    {
      id: "lovers",
      name: "The Lovers",
      text: "The Lovers. Two pack oxen, nose to nose, one of them wearing a hat. Charm, child. You have more of it than you use.",
      attrs: { presence: 1 },
      mods: { skills: { persuasion: 5 } },
      desc: "+1 Presence, +5 Persuasion",
    },
    {
      id: "death",
      name: "Death",
      text: "Death. Do not make that face. Death is change. Death is also, in your case specifically, quite often a man with a rusty bolt rifle. Aim for the head.",
      attrs: { senses: 1 },
      desc: "+1 Senses",
    },
    {
      id: "wheel",
      name: "Wheel of Fortune",
      text: "The Wheel of Fortune. A roulette wheel in the Neon, still turning. What goes around comes around. Usually on fire.",
      mods: { skills: { trade: 10 } },
      desc: "+10 Trade",
    },
  ];
  const cardMods = (c) =>
    Object.assign({}, c.mods || {}, c.attrs ? QX.attrMods(c.attrs) : {});
  function chooseCard() {
    const hpF = G.player && G.player.maxHp ? G.player.hp / G.player.maxHp : 1;
    const tier = QX.standingTier();
    const pool = [];
    if (hpF < 0.5) pool.push("star", "star");
    if (tier <= 1) pool.push("lovers", "star");
    if (tier >= 3) pool.push("death", "tower", "hermit");
    if (QX.attr("senses") >= 7) pool.push("wheel", "stranger");
    pool.push("stranger", "tower", "hermit", "wheel", "death", "lovers");
    // don't repeat yesterday's card
    const last = QX.flag("zora_last");
    const choices = pool.filter((c) => c !== last);
    const id =
      choices[Math.floor(Math.random() * choices.length)] || "stranger";
    return CARDS.find((c) => c.id === id);
  }
  let pendingCard = null;
  const Z = (QX.zora = {
    CARDS,
    canRead() {
      return QX.flag("zora_day") !== (G.time.day | 0);
    },
    read(deep) {
      const price = deep ? 50 : 10;
      if (!QX.pay(price)) return false;
      const c = chooseCard();
      pendingCard = c;
      QX.setFlag("zora_last", c.id);
      QX.setFlag("zora_day", G.time.day | 0);
      QX.addEffect({
        id: "qx_eff_tarot",
        name: "Tarot: " + c.name,
        kind: "buff",
        duration: 1800,
        source: "Madame Zora",
        desc: c.desc + " (for a day).",
        mods: cardMods(c),
      });
      if (!QX.has("qx_zora_card") && QX.once("zora_card"))
        QX.give("qx_zora_card", 1);
      QX.inc("zora_readings");
      if (
        (deep || QX.attr("senses") >= 7) &&
        !QX.started(PQ) &&
        !QX.flag("stash_found")
      )
        QX.setFlag("zora_prophecy_due"); // (stone already lifted: nothing left to foretell)
      return true;
    },
    cardText() {
      return pendingCard
        ? pendingCard.text + " [" + pendingCard.desc + " for a day.]"
        : "The cards are quiet today.";
    },
    prophecy() {
      QX.setFlag("zora_prophecy_due", false);
      if (!QX.started(PQ)) QX.start(PQ, { stage: "seek" });
      // the ninth stone was already lifted before the prophecy (the stash is gone): the prophecy has come true
      if (QX.flag("stash_found") && QX.active(PQ)) QX.setStage(PQ, "done");
    },
    openStash() {
      if (QX.flag("stash_found")) return;
      QX.setFlag("stash_found");
      QX.sfx("container_open");
      const loot = [
        [QX.SCRIP_ID, 180],
        ["qx_lucky_horseshoe", 1],
        [MED_JET, 2],
        [FIZZO_BLUE, 1],
        ["scrap_metal", 2],
      ];
      const got = [];
      for (const [id, n] of loot) if (QX.give(id, n)) got.push(id);
      QX.notify(
        'Under the stone: a rusted biscuit tin wrapped in oilcloth. Inside, a note: "For the next stranger. Somebody left one for me. — a friend of Zora\'s"',
      );
      if (QX.started(PQ) && !QX.done(PQ)) {
        QX.setStage(PQ, "done");
        QX.standing(10);
      } else QX.xp(50, "The Ninth Stone");
      void got;
    },
  });

  // ==================================================================
  // Fingers: three-card monte (DOM minigame)
  // ==================================================================
