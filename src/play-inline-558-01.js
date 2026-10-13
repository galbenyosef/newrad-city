// play-inline-558 01 — bet
// Lines 18-368 of readable/play-inline-558.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const L = G.quests.lib;
  const Q = G.quests;
  const N = () => L.neonTown;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const lvl = () => Math.max(1, L.level());

  // ==================================================================
  // Doc Broadway
  // ==================================================================
  const price = {
    hp: () => 20 + lvl() * 3,
    rads: () => 40 + lvl() * 5,
    limbs: () => 30 + lvl() * 4,
    add: () => 90 + lvl() * 6,
  };
  function hurt() {
    return G.player && G.player.hp < G.player.maxHp - 0.5;
  }
  function rads() {
    return G.player && G.player.rads > 1;
  }
  function crippled() {
    try {
      if (!G.isStub("rpg") && typeof G.rpg.limbCondition === "function") {
        const l = G.rpg.limbCondition();
        return Object.keys(l).some((k) => l[k] < 100);
      }
    } catch (e) {
      /* ignore */
    }
    return false;
  }
  function addicted() {
    try {
      if (!G.isStub("rpg") && G.rpg.addictions) {
        const a =
          typeof G.rpg.addictions === "function"
            ? G.rpg.addictions()
            : G.rpg.addictions;
        return !!a && Object.keys(a).length > 0;
      }
    } catch (e) {
      /* ignore */
    }
    return false;
  }
  function docHeal(what, cost) {
    if (!L.pay(cost)) return;
    if (!G.isStub("rpg") && G.rpg.doctorHeal) {
      try {
        G.rpg.doctorHeal(what);
      } catch (e) {
        G.reportError("quests:doctorHeal", e);
      }
    } else {
      if (what.hp) G.player.heal(G.player.maxHp);
      if (what.rads) L.removeRads();
    }
    L.sfx(what.rads ? "iodine_tabs" : "inject");
    L.incFlag("neon_doc_visits");
  }
  function everythingCost() {
    let c = 0;
    if (hurt()) c += price.hp();
    if (rads()) c += price.rads();
    if (crippled()) c += price.limbs();
    return Math.round(c * 0.85);
  }
  const UNDER = [
    ["rush", 3],
    ["rage", 2],
    ["bull_tabs", 2],
    ["focus_pills", 2],
    ["overdrive", 1],
    ["sunny_pills", 2],
  ];

  // ==================================================================
  // Bunkhouse
  // ==================================================================
  function bedPrice() {
    return L.skill("trade") >= 45 ? 12 : 20;
  }
  // The storage locker is a key lock: renting it from Dottie hands over the key.
  const LOCKER_LOCK = {
    id: "q_neon_bunk_locker",
    label: "Bunkhouse Locker",
    key: "q_neon_locker_key",
    hint: "Rent it from Dottie Blythe at the Bunkhouse (100 scrip): she hands over the key.",
  };
  function giveLockerKey() {
    if (!L.has(LOCKER_LOCK.key)) L.give(LOCKER_LOCK.key, 1);
  }
  function sleepAt(hours) {
    if (!L.pay(bedPrice())) return;
    L.setFlag("neon_bed_nights", (Number(L.flag("neon_bed_nights")) || 0) + 1);
    G.fadeTransition(() => {
      if (!G.isStub("rpg") && G.rpg.sleep) {
        try {
          G.rpg.sleep(hours, { owned: true });
        } catch (e) {
          G.reportError("quests:sleep", e);
        }
      } else {
        G.player.heal(G.player.maxHp);
        G.time.hour = (G.time.hour + hours) % 24;
      }
    }, 1.2);
  }
  function hoursUntil(h) {
    return Math.max(1, Math.round((h - G.time.hour + 24) % 24) || 24);
  }

  // ==================================================================
  // Ticker Oracle
  // ==================================================================
  const JOKES = [
    "YOU WILL MEET A TALL DARK STRANGER. HE WILL BE A BRUTE. RUN.",
    "LUCKY NUMBERS: 10, 5.56, 12-GAUGE.",
    "A GREAT FORTUNE AWAITS YOU. IT IS IN A LOCKED SAFE. THE COMBINATION IS WRITTEN SOMEWHERE ELSE. GOOD LUCK.",
    "BEWARE THE PACK OX WITH THE KIND EYES. IT IS HIDING SOMETHING.",
    "YOUR FUTURE GLOWS. THAT IS NOT A METAPHOR.",
    "TODAY IS A GOOD DAY TO NOT DIE. CONSIDER IT.",
    "SOMEONE THINKS OF YOU CONSTANTLY. HE IS A MANIAC. HE IS ALSO SCREAMING.",
    "YOU WILL LIVE A LONG LIFE. ASK MAYOR CROWE HOW THAT TURNS OUT.",
    "THE MACHINE SEES ALL. THE MACHINE IS TIRED. PLEASE INSERT 5 SCRIP.",
    "REPLY HAZY. MACHINE IRRADIATED. ASK AGAIN IN 1990.",
  ];
  function hints() {
    const out = [];
    try {
      const v = Q.list().filter((q) => q.active && q.stageText);
      if (v.length) {
        const q = pick(v);
        out.push(
          'THE THREADS OF "' +
            q.name.toUpperCase() +
            '" PULL YOU ONWARD: ' +
            q.stageText.toUpperCase(),
        );
      }
    } catch (e) {
      /* ignore */
    }
    if (!Q.isStarted("sq_neon_ball"))
      out.push(
        "THE BALL THAT DOES NOT FALL AWAITS A STEADY HAND. SEEK THE MAYOR.",
      );
    if (!Q.isStarted("sq_neon_power"))
      out.push(
        "THE LIGHTS FLICKER BECAUSE A HAND IS ON THE SWITCH. ASK THE ENGINEER " +
          (N().place("power")
            ? "BELOW THE THEATRE."
            : "AT THE BREAKER CABINET."),
      );
    if (!L.flag("neon_guard_member"))
      out.push(
        "THE WALL NEEDS SHOULDERS. THE CAPTAIN AT THE NORTH GATE PAYS IN SCRIP AND SCARS.",
      );
    if (!Q.isStarted("sq_neon_opry"))
      out.push(
        "A STAGE STANDS EMPTY. A DIRECTOR WEEPS. YOUR NAME IN LIGHTS, IF YOU CAN CARRY A TUNE.",
      );
    if (!L.flag("neon_speakeasy_lore"))
      out.push(
        "BENEATH THE FORTY-SECOND STREET STAIRS, A LOCKED GATE HIDES A THIRSTY SECRET. KNOCK TWICE. WAIT. KNOCK ONCE.",
      );
    if (!Q.isStarted("sq_neon_club"))
      out.push(
        "THE VELVET ROPE PARTS FOR A GOOD JOKE AND A BAD FACE. THE BIG ONE AT THE DOOR IS SOFTER THAN HE LOOKS.",
      );
    if (
      L.flag("neon_guard_member") &&
      !Q.isActive("sq_neon_contract") &&
      L.flag("neon_contract_day") !== G.time.day
    )
      out.push(
        "THE SERGEANT BELOW THE ISLAND HAS WORK. THE AVENUES HAVE TEETH. PULL THEM.",
      );
    let md = 0;
    try {
      md = L.medallions ? L.medallions.count() : 0;
    } catch (e) {
      md = 0;
    }
    if (md < 20)
      out.push(
        "TWENTY BRONZE TOMORROWS WAIT IN HIGH PLACES. " +
          (20 - md) +
          " REMAIN.",
      );
    return out;
  }

  // ==================================================================
  // Rad Jack (blackjack) with Lucky Lou
  // ==================================================================
  const SUITS = ["♠", "♥", "♦", "♣"],
    RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const RJ = { deck: [], you: [], lou: [], bet: 0, over: true, msg: "" };
  function newDeck() {
    RJ.deck = [];
    for (let d = 0; d < 2; d++)
      for (const s of SUITS) for (const r of RANKS) RJ.deck.push(r + s);
    for (let i = RJ.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = RJ.deck[i];
      RJ.deck[i] = RJ.deck[j];
      RJ.deck[j] = t;
    }
  }
  function draw() {
    if (RJ.deck.length < 12) newDeck();
    return RJ.deck.pop();
  }
  function score(h) {
    let s = 0,
      a = 0;
    for (const c of h) {
      const r = c.replace(/[♠♥♦♣]/, "");
      if (r === "A") {
        a++;
        s += 11;
      } else if (r === "J" || r === "Q" || r === "K") s += 10;
      else s += Number(r);
    }
    while (s > 21 && a > 0) {
      s -= 10;
      a--;
    }
    return s;
  }
  function dailyWon() {
    const d =
      L.flag("neon_rj_day") === G.time.day
        ? Number(L.flag("neon_rj_won")) || 0
        : 0;
    return d;
  }
  function addWon(n) {
    if (L.flag("neon_rj_day") !== G.time.day) {
      L.setFlag("neon_rj_day", G.time.day);
      L.setFlag("neon_rj_won", 0);
    }
    L.setFlag("neon_rj_won", (Number(L.flag("neon_rj_won")) || 0) + n);
  }
  const CAP = 300;
  function deal(bet) {
    if (!L.pay(bet)) return "hello";
    RJ.bet = bet;
    RJ.you = [draw(), draw()];
    RJ.lou = [draw(), draw()];
    RJ.over = false;
    RJ.msg = "";
    L.sfx("ui_select");
    if (score(RJ.you) === 21) return settle(true);
    return "table";
  }
  function settle(natural) {
    RJ.over = true;
    const y = score(RJ.you);
    if (y > 21) {
      RJ.msg =
        "Bust. Lou rakes in your " +
        RJ.bet +
        " scrip with a sympathetic wheeze.";
      return "result";
    }
    // Lou draws to 17 (a sharp-eyed player, Senses 8+, sometimes catches Lou "peeking" — he stands early)
    const eyes = L.attr("senses");
    while (score(RJ.lou) < 17) {
      if (eyes >= 8 && score(RJ.lou) >= 13 && Math.random() < 0.25) break;
      RJ.lou.push(draw());
    }
    const l = score(RJ.lou);
    let win = 0;
    if (natural && !(l === 21 && RJ.lou.length === 2)) {
      win = Math.round(RJ.bet * 2.5);
      RJ.msg =
        "Rad Jack! Lou groans. \"Somebody check this one's sleeves. Both of 'em.\"";
    } else if (l > 21 || y > l) {
      win = RJ.bet * 2;
      RJ.msg =
        l > 21
          ? "Lou busts with " +
            l +
            '. "Eh. The cards hate me today. Tomorrow they\'ll hate you."'
          : "You win, " + y + " to " + l + ".";
    } else if (y === l) {
      win = RJ.bet;
      RJ.msg = "Push at " + y + ". Nobody's happy.";
    } else
      RJ.msg =
        "Lou takes it, " +
        l +
        " to " +
        y +
        '. "House always wins, pal. I\'m the house."';
    if (win) {
      L.giveScrip(win);
      if (win > RJ.bet) addWon(win - RJ.bet);
    }
    return "result";
  }
  function tableText() {
    const up = RJ.lou[0];
    return (
      "YOUR HAND: " +
      RJ.you.join("  ") +
      "   (" +
      score(RJ.you) +
      ")\nLOU SHOWS: " +
      up +
      "  [??]\nBET: " +
      RJ.bet +
      " scrip"
    );
  }
  const RUMORS = [
    [
      "Talk to Sparks down in the theatre basement. Power's been going out at the exact same hour three nights running. That ain't wear and tear, that's a schedule.",
      "neon_rumor_power",
    ],
    [
      "Lionel over at the Opry lost his leading man. The guy walked off mid-number. If you can hold a note, Lionel's desperate enough to hire a topsider.",
      "neon_rumor_opry",
    ],
    [
      "Captain Kincaid is hiring guns. Not guards — guns. Bounties on the Mayor's board, paid in scrip. Raider fingers, too, if you swing that way.",
      "neon_rumor_guard",
    ],
    [
      "Crowe wants the Ball fixed. Been wanting it since New Year's of '67. Says if the Ball drops, the Neon's a city again. Crowe says a lot of things.",
      "neon_rumor_ball",
    ],
    [
      "Eustace at the Depot pays escorts. Grand Central run, Radio City run. Raiders hit the second wagon, never the first. Remember that.",
      "neon_rumor_escort",
    ],
    [
      "Sal won't let topsiders in the Cinder Club. But Sal's a softie for a good joke, and a sucker for manners. Just don't mention his ears.",
      "neon_rumor_club",
    ],
  ];

  // ==================================================================
  // Ammo Annie's Shooting Gallery (pop-up targets)
  // ==================================================================
