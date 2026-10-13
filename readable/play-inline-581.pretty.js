/* src/quests_extra/40_street.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS_EXTRA — 40: STREET ENCOUNTERS
 *   Madame Zora     fortune teller in a patched tent at Union Square. Ten Scrip
 *                   buys a reading: an Atomic Tarot card chosen by your standing,
 *                   health and Senses, with a day-long boon. Senses 7 (or the
 *                   fifty-Scrip "deep reading") earns a prophecy → the unmarked
 *                   quest qx_prophecy "The Ninth Stone" (Washington Square stash).
 *   Fingers Fiorello       three-card monte on 34th Street by Herald Square. A real
 *                   minigame (follow the queen). Big bets are rigged — a sharp
 *                   eye (Senses 6+) spots the palm, and calling him out wins
 *                   your losses back, his marked deck, or a fight.
 * ===================================================================== */
(function () {
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
  const Lou = (QX.monte = {
    bet: 0,
    state: null,
    el: null,
    rigged(bet) {
      return bet >= 25 && !QX.flag("lou_caught") && !QX.flag("lou_honest");
    },
    /** Chance to spot the palm, from Senses. */
    spotChance() {
      return Math.min(0.95, Math.max(0, (QX.attr("senses") - 5) * 0.26));
    },
    /** Senses hunch at the pick: nothing below Senses 6, then 12% per point (Senses 10 = 60%). */
    hunchChance() {
      return Math.min(0.6, Math.max(0, (QX.attr("senses") - 5) * 0.12));
    },
    play(bet) {
      if (!QX.pay(bet)) return false;
      QX.inc("monte_games");
      Lou.bet = bet;
      setTimeout(() => {
        if (G.state === "play" || G.state === "dialogue") Lou.open();
      }, 80); // after the dialogue has closed
      return true;
    },
    open() {
      Lou.close();
      const root = QX.el("div", "qx-monte");
      root.innerHTML =
        '<div class="qx-monte-panel"><div class="qx-monte-title">FINGERS FIORELLO\'S — FOLLOW THE LADY</div>' +
        '<div class="qx-monte-bet"></div><div class="qx-monte-table"></div><div class="qx-monte-msg">Watch the queen...</div>' +
        '<div class="qx-monte-btns"></div></div>';
      Lou.el = root;
      root.querySelector(".qx-monte-bet").textContent =
        "BET: " + Lou.bet + " SCRIP   ·   PAYS 2 TO 1";
      const table = root.querySelector(".qx-monte-table");
      const cards = [];
      for (let i = 0; i < 3; i++) {
        const c = document.createElement("div");
        c.className = "qx-monte-card";
        c.dataset.i = i;
        c.innerHTML =
          '<div class="qx-card-back"></div><div class="qx-card-face">' +
          (i === 1
            ? "<b>Q</b><span>&#9829;</span>"
            : "<b>" + (i ? "7" : "2") + "</b><span>&#9827;</span>") +
          "</div>";
        table.appendChild(c);
        cards.push(c);
      }
      // slot[i] = which card element sits in position i; queen = card 1
      const S = (Lou.state = {
        cards,
        slot: [0, 1, 2],
        swaps: 0,
        phase: "show",
        t: 0,
        rig: Lou.rigged(Lou.bet),
        spotted: false,
        chosen: -1,
      });
      S.total = 5 + (Lou.bet >= 50 ? 5 : Lou.bet >= 25 ? 3 : 0);
      S.speed = Math.max(
        0.2,
        0.62 - QX.attr("senses") * 0.035 - (Lou.bet >= 50 ? 0.12 : 0),
      );
      Lou.layout(true);
      G.setState("qx_monte");
      QX.sfx("ui_click");
      setTimeout(() => {
        if (Lou.state === S) {
          for (const c of cards) c.classList.add("down");
          S.phase = "shuffle";
          Lou.step();
        }
      }, 1400);
    },
    layout(instant) {
      const S = Lou.state;
      if (!S) return;
      S.slot.forEach((ci, pos) => {
        const c = S.cards[ci];
        c.style.transition = instant
          ? "none"
          : "left " +
            S.speed +
            "s ease-in-out, transform " +
            S.speed +
            "s ease-in-out";
        c.style.left = pos * 132 + 14 + "px";
      });
    },
    step() {
      const S = Lou.state;
      if (!S || S.phase !== "shuffle") return;
      if (S.swaps >= S.total) {
        S.phase = "pick";
        Lou.pickable(true);
        // [Senses] a hunch: fair games only point at the real queen; on a palmed
        // game a sharp-eyed player simply feels that none of the three is her.
        if (!S.spotted && Math.random() < Lou.hunchChance()) {
          if (S.palmed) {
            S.spotted = true;
            Lou.pickable(true);
            Lou.msg(
              "[Senses] A cold, certain little feeling: she isn't on this table at all.",
            );
          } else {
            const pos = S.slot.indexOf(1);
            S.cards[1].classList.add("hunch");
            Lou.msg(
              "[Senses] You get a feeling about the " +
                ["left", "middle", "right"][pos] +
                " card.",
            );
          }
        } else if (!S.spotted) Lou.msg("Where's the lady? Pick a card.");
        return;
      }
      const a = Math.floor(Math.random() * 3);
      let bb = Math.floor(Math.random() * 2);
      if (bb >= a) bb++;
      const t = S.slot[a];
      S.slot[a] = S.slot[bb];
      S.slot[bb] = t;
      S.cards[S.slot[a]].style.transform = "translateY(-14px)";
      S.cards[S.slot[bb]].style.transform = "translateY(14px)";
      Lou.layout(false);
      setTimeout(() => {
        if (Lou.state !== S) return;
        for (const c of S.cards) c.style.transform = "";
      }, S.speed * 500);
      S.swaps++;
      // the palm: on a rigged game, midway through, Fingers lifts the queen — a sharp eye may catch it
      if (S.rig && S.swaps === Math.ceil(S.total * 0.6)) {
        S.palmed = true;
        if (Math.random() < Lou.spotChance()) {
          S.spotted = true;
          Lou.msg(
            "[Senses] Fingers' pinky dips toward his cuff as the cards cross. Did the queen just... leave?",
          );
        }
      }
      QX.sfx("ui_tick");
      setTimeout(() => Lou.step(), S.speed * 1000 + 40);
    },
    pickable(on) {
      const S = Lou.state;
      if (!S) return;
      for (const c of S.cards) {
        c.classList.toggle("pick", on);
        c.onclick = on
          ? () => Lou.pick(S.slot.indexOf(Number(c.dataset.i)))
          : null;
      }
      const btns = Lou.el.querySelector(".qx-monte-btns");
      btns.innerHTML = "";
      if (on && S.spotted)
        Lou.btn('"Fingers. Show me your sleeve."', () => Lou.callOut());
      if (!on) Lou.btn("Done", () => Lou.finish());
    },
    btn(label, fn) {
      const b = document.createElement("button");
      b.className = "qx-monte-btn";
      b.textContent = label;
      b.onclick = fn;
      Lou.el.querySelector(".qx-monte-btns").appendChild(b);
      return b;
    },
    msg(t) {
      if (Lou.el) Lou.el.querySelector(".qx-monte-msg").textContent = t;
    },
    pick(pos) {
      const S = Lou.state;
      if (!S || S.phase !== "pick") return;
      S.phase = "reveal";
      S.chosen = pos;
      Lou.pickable(false);
      const ci = S.slot[pos];
      let win = ci === 1 && !S.palmed;
      if (S.palmed && ci === 1) {
        // the queen was palmed; Fingers "reveals" a club where she should be and drops her under another card
        S.cards[1].querySelector(".qx-card-face").innerHTML =
          "<b>7</b><span>&#9827;</span>";
      }
      S.cards[ci].classList.remove("down");
      setTimeout(() => {
        if (Lou.state !== S) return;
        for (const c of S.cards) c.classList.remove("down");
        if (S.palmed && ci === 1) {
          const other = S.cards[(ci + 1) % 3];
          other.querySelector(".qx-card-face").innerHTML =
            "<b>Q</b><span>&#9829;</span>";
        }
        if (win) {
          QX.giveScrip(Lou.bet * 2);
          QX.inc("monte_won", Lou.bet);
          Lou.msg(
            "The lady! You win " +
              Lou.bet * 2 +
              " Scrip. Fingers grins like it hurts.",
          );
          QX.say(
            "qx_lou",
            [
              "Beginner's luck! Go again, go again!",
              "Ooh, sharp eyes on this one!",
              "The lady likes you! She never likes ME.",
            ][Math.floor(Math.random() * 3)],
          );
        } else {
          QX.inc("monte_lost", Lou.bet);
          Lou.msg(
            S.palmed
              ? "Not the lady. ...Somehow, she's under the other card now. Fingers shrugs, all innocence."
              : "Not the lady. Fingers sweeps your Scrip away with a sympathetic wince.",
          );
          QX.say(
            "qx_lou",
            [
              "So close! SO close!",
              "The lady's a tricky one!",
              "Double or nothing? Double or nothing!",
            ][Math.floor(Math.random() * 3)],
          );
        }
      }, 700);
    },
    callOut() {
      const S = Lou.state;
      if (!S) return;
      Lou.close();
      G.setState("play");
      QX.setFlag("lou_caught");
      QX.talk("qx_dlg_lou", "qx_lou");
    },
    finish() {
      Lou.close();
      if (G.state === "qx_monte") G.setState("play");
    },
    close() {
      if (Lou.el) {
        Lou.el.remove();
        Lou.el = null;
      }
      Lou.state = null;
    },
  });
  document.addEventListener(
    "keydown",
    (e) => {
      if (G.state !== "qx_monte" || !Lou.state) return;
      if (e.code === "Escape" || e.code === "Tab") {
        e.preventDefault();
        if (Lou.state.phase === "shuffle" || Lou.state.phase === "show") return;
        Lou.finish();
      }
      if (Lou.state.phase === "pick" && /^Digit[123]$/.test(e.code))
        Lou.pick(Number(e.code.slice(5)) - 1);
    },
    true,
  );
  QX.hook("reset", () => {
    Lou.close();
    pendingCard = null;
  });
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "qx_lou") QX.setFlag("lou_gone");
  });

  // ==================================================================
  // Dialogue
  // ==================================================================
  QX.hook("register", function () {
    QX.dialogue("qx_dlg_zora", {
      start: () =>
        QX.flag("zora_prophecy_due")
          ? "prophecy"
          : QX.flag("met_zora")
            ? "again"
            : "hello",
      nodes: {
        hello: {
          speaker: "Madame Zora",
          onEnter: () => QX.setFlag("met_zora"),
          text:
            "[A woman in a dozen scarves, every one a different decade, looks up from a table draped in velvet. In front of her sits a glowing glass globe that is very obviously a car's fuse housing.] " +
            "Ah. I have been expecting you. [A pause.] That is what I say to everyone. It is, however, true of everyone. Madame Zora. Ten Scrip, and the cards will tell you what the day holds.",
          responses: [
            {
              text: "Read my cards. [10 Scrip]",
              cond: () => Z.canRead(),
              next: "reading",
              action: () => {
                if (!Z.read(false)) QX.setFlag("zora_broke");
              },
            },
            { text: "Can you really see the future?", next: "real" },
            { text: "Maybe later.", end: true },
          ],
        },
        again: {
          speaker: "Madame Zora",
          text: () =>
            Z.canRead()
              ? "The stranger returns. The cards have been shuffling themselves all morning. They are impatient. Like me."
              : "You have had your reading for today, child. The cards need to rest. So do I. So, frankly, do you.",
          responses: [
            {
              text: "Read my cards. [10 Scrip]",
              cond: () => Z.canRead(),
              next: "reading",
              action: () => {
                if (!Z.read(false)) QX.setFlag("zora_broke");
              },
            },
            {
              text: "Give me the deep reading. [50 Scrip]",
              cond: () => Z.canRead() && !QX.started(PQ),
              next: "reading",
              action: () => {
                if (!Z.read(true)) QX.setFlag("zora_broke");
              },
            },
            { text: "Can you really see the future?", next: "real" },
            { text: "Goodbye, Zora.", end: true },
          ],
        },
        reading: {
          speaker: "Madame Zora",
          text: () => {
            if (QX.flag("zora_broke")) {
              QX.setFlag("zora_broke", false);
              return "The cards do not read on credit, child. Neither do I.";
            }
            return (
              "[She fans the deck, and turns one card with a long, lacquered nail.] " +
              Z.cardText()
            );
          },
          responses: [
            {
              text: "Anything else?",
              cond: () => !!QX.flag("zora_prophecy_due"),
              next: "prophecy",
            },
            { text: "Thank you, Zora.", end: true },
          ],
        },
        prophecy: {
          speaker: "Madame Zora",
          onEnter: () => Z.prophecy(),
          text:
            "[Her eyes go glassy. The fuse-globe flickers — possibly on its own, possibly because her knee is on the cable.] \"Beneath the stone arch, where the kings sit and never move, count nine stones from the old men's tables. " +
            "What the stranger finds there was left for a stranger.\" [She blinks.] ...Did I say something? I do that. Don't tell anyone. It's bad for business when it comes true.",
          responses: [
            { text: "Where the kings sit and never move...", end: true },
          ],
        },
        real: {
          speaker: "Madame Zora",
          text:
            "Child, I can see that you walk like a man who slept a long time in a cold box, stand like a soldier and smell like a shellback. From that, I can tell you a great deal about tomorrow. " +
            "The cards help. The cards are mostly a way of keeping people still while I look at them.",
          responses: [
            {
              id: "zora_wits",
              text: "So it's a cold reading. Observation and suggestion.",
              check: { attr: "wits", value: 7 },
              next: "cold",
              failNext: "cold_fail",
            },
            { text: "Fair enough.", next: "again" },
          ],
        },
        cold: {
          speaker: "Madame Zora",
          text: "[She laughs, delighted.] Ha! Clever. Yes. Mostly. [She leans in.] And every now and then, child, something comes through that I did not put there. Those, I don't charge for.",
          responses: [{ text: "Every now and then?", next: "again" }],
        },
        cold_fail: {
          speaker: "Madame Zora",
          text: "Hush. The cards are listening. They are very sensitive about their methods.",
          responses: [{ text: "...Sorry, cards.", next: "again" }],
        },
      },
    });

    const lost = () => Number(QX.flag("monte_lost")) || 0;
    QX.dialogue("qx_dlg_lou", {
      start: () =>
        QX.flag("lou_caught") && !QX.flag("lou_settled")
          ? "caught"
          : QX.flag("met_lou")
            ? "again"
            : "hello",
      nodes: {
        hello: {
          speaker: "Fingers Fiorello",
          onEnter: () => QX.setFlag("met_lou"),
          text:
            "[A thin man in a pinstripe suit with more patches than stripes flips three cards across a folding table so fast they blur.] Step right up, step right up! Fingers Fiorello's, the only honest game on Thirty-Fourth Street! " +
            "Find the lady, double your Scrip. Lose the lady, well — [he spreads his hands] — she was never really yours.",
          responses: [
            {
              text: "I'll play. [10 Scrip]",
              next: null,
              end: true,
              action: () => Lou.play(10),
              cond: () => QX.scrip() >= 10,
            },
            {
              text: "I'll play. [25 Scrip]",
              next: null,
              end: true,
              action: () => Lou.play(25),
              cond: () => QX.scrip() >= 25,
            },
            {
              text: "Big money. [50 Scrip]",
              next: null,
              end: true,
              action: () => Lou.play(50),
              cond: () => QX.scrip() >= 50,
            },
            { text: '"The only honest game"?', next: "honest" },
            { text: "Not today.", end: true },
          ],
        },
        again: {
          speaker: "Fingers Fiorello",
          text: () =>
            QX.flag("lou_honest")
              ? "My friend! My honest friend! The game is clean, I swear on my mother. My real mother. Play?"
              : "Back for more? The lady missed you. She told me.",
          responses: [
            {
              text: "Deal me in. [10 Scrip]",
              end: true,
              action: () => Lou.play(10),
              cond: () => QX.scrip() >= 10,
            },
            {
              text: "Deal me in. [25 Scrip]",
              end: true,
              action: () => Lou.play(25),
              cond: () => QX.scrip() >= 25,
            },
            {
              text: "Big money. [50 Scrip]",
              end: true,
              action: () => Lou.play(50),
              cond: () => QX.scrip() >= 50,
            },
            { text: "Not today, Fingers.", end: true },
          ],
        },
        honest: {
          speaker: "Fingers Fiorello",
          text: "Honest as the day is long! Ask anybody. Ask Mort, from the hot dogs. Actually don't ask Mort. Mort and I have a history. Play a round, you'll see.",
          responses: [
            {
              id: "lou_senses",
              text: "Your left cuff is two inches too wide.",
              check: { attr: "senses", value: 7 },
              next: "cuff",
              failNext: "cuff_fail",
              cond: () => !QX.flag("lou_caught"),
            },
            {
              text: "Deal me in. [10 Scrip]",
              end: true,
              action: () => Lou.play(10),
              cond: () => QX.scrip() >= 10,
            },
            { text: "Maybe later.", end: true },
          ],
        },
        cuff: {
          speaker: "Fingers Fiorello",
          onEnter: () => QX.setFlag("lou_caught"),
          text: "[His hands freeze mid-shuffle. He looks at his cuff. He looks at you. The queen of hearts slides out of his sleeve and lands face-up on the table.] ...Would you believe that's where she lives?",
          responses: [{ text: "No.", next: "caught" }],
        },
        cuff_fail: {
          speaker: "Fingers Fiorello",
          text: "My cuff? Tailored! Old-world! You got an eye for fashion, friend. Now — got an eye for the lady?",
          responses: [
            {
              text: "Deal me in. [10 Scrip]",
              end: true,
              action: () => Lou.play(10),
              cond: () => QX.scrip() >= 10,
            },
            { text: "Later.", end: true },
          ],
        },
        caught: {
          speaker: "Fingers Fiorello",
          text: () =>
            "[Fingers glances left and right, then leans across the table, all teeth.] Okay. Okay! Keep your voice down. " +
            (lost() ? "You're down " + lost() + " Scrip — " : "") +
            "Let's be reasonable people about this. Reasonable, quiet people.",
          responses: [
            {
              text: "Give me back what I lost.",
              cond: () => lost() > 0,
              next: "refund",
              action: () => {
                QX.giveScrip(lost());
                QX.setFlag("monte_lost", 0);
                QX.setFlag("lou_settled");
                QX.setFlag("lou_honest");
              },
            },
            {
              id: "lou_persuade",
              text: "Everyone on this street is going to hear about your sleeve. Unless you make it worth my while.",
              check: { skill: "persuasion", value: 45 },
              next: "hush",
              failNext: "hush_fail",
            },
            {
              text: "From now on you play it straight. With everybody.",
              next: "straight",
              action: () => {
                QX.setFlag("lou_honest");
                QX.setFlag("lou_settled");
                QX.giveScrip(lost());
                QX.setFlag("monte_lost", 0);
                QX.standing(20, "Made Fingers Fiorello play it straight");
              },
            },
            {
              text: "[Attack] Cheats get what's coming.",
              end: true,
              action: () => {
                QX.setFlag("lou_settled");
                const a = QX.npc("qx_lou");
                if (a && a.setHostile) a.setHostile(true);
              },
            },
          ],
        },
        refund: {
          speaker: "Fingers Fiorello",
          text: "There. Every note. Counted twice. [He mops his brow.] No hard feelings. The game's clean now. For you. For you, I'm a church.",
          responses: [{ text: "Good.", end: true }],
        },
        hush: {
          speaker: "Fingers Fiorello",
          onEnter: () => {
            QX.setFlag("lou_settled");
            QX.giveScrip(lost() + 75);
            QX.setFlag("monte_lost", 0);
            QX.standing(-10);
            if (QX.itemExists("qx_marked_deck")) QX.give("qx_marked_deck", 1);
          },
          text: "[He counts out Scrip with the speed of long practice.] Your losses. Plus seventy-five for your trouble. Plus — [he slides over a worn deck] — a little something for your own games. Marked. Every card. You didn't get it from me.",
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        hush_fail: {
          speaker: "Fingers Fiorello",
          onEnter: () => {
            QX.setFlag("lou_settled");
            QX.giveScrip(lost());
            QX.setFlag("monte_lost", 0);
          },
          text: "Hey, hey — don't push it, friend. You get your Scrip back. That's the deal. Everybody walks away. Walk away.",
          responses: [{ text: "Fine.", end: true }],
        },
        straight: {
          speaker: "Fingers Fiorello",
          text: "[He looks physically pained.] Straight. With EVERYBODY? ...Fine. FINE. Here's your Scrip. You know what an honest monte game is? It's a card trick nobody pays for. [He sighs.] Straight.",
          responses: [{ text: "You'll live.", end: true }],
        },
      },
    });
  });

  // Extra items for this file (defined in the items phase)
  QX.hook("items", function () {
    QX.defineItem({
      id: "qx_lucky_horseshoe",
      name: "Lucky Horseshoe",
      type: "misc",
      weight: 0.5,
      value: 60,
      mesh: "lighter",
      tags: ["junk"],
      desc: 'An ox shoe, bent from a single stride, with "LUCK" scratched into it. It is heavier than luck ought to be.',
    });
    QX.defineItem({
      id: "qx_marked_deck",
      name: "Fingers' Marked Deck",
      type: "misc",
      weight: 0.1,
      value: 40,
      mesh: "paper",
      tags: ["junk"],
      skills: { trade: 5 },
      desc: "Fifty-two old-world playing cards with pinprick marks in the corners. Hold it and you feel slightly more persuasive, and slightly less trustworthy.",
    });
  });
})();
