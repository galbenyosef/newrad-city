// play-inline-565 01 — opts
// Lines 26-369 of readable/play-inline-565.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const hero = () => L.heroName();
  const first = () => String(hero()).split(" ")[0];

  // ------------------------------------------------------------------
  // Acts and the spine (play order). req = prerequisites (all complete).
  // ------------------------------------------------------------------
  const ACTS = {
    1: "Act I: Thaw",
    2: "Act II: The Long Noon",
    3: "Act III: The Rolls",
    4: "Act IV: Give Me Liberty",
    5: "Act V: The Second Sun",
  };
  const SPINE = [
    ["mq01", 1, 1, "Long Winter", []],
    ["mq02", 2, 1, "All Aboard", ["mq01"]],
    ["mq03", 3, 1, "Radio Free Manhattan", ["mq02"]],
    ["mq07", 4, 1, "The Court of Tudor City", ["mq02"]],
    ["mq08", 5, 1, "Booth Four", ["mq07"]],
    ["mq09", 6, 1, "The Candle Lady", ["mq08"]],
    ["mq10", 7, 1, "Return to Sender", ["mq03", "mq09"]],
    ["mq11", 8, 2, "Paper Trail", ["mq09"]],
    ["mq12", 9, 2, "The Long Noon", ["mq10"]],
    ["mq13", 10, 2, "Neon Heart", ["mq11"]],
    ["mq14", 11, 2, "Jamming Season", ["mq13"]],
    ["mq15", 12, 2, "Sept Means Seven", ["mq14"]],
    ["mq16", 13, 2, "Ten Days in the Madhouse", ["mq15"]],
    ["mq17", 14, 2, "The Dawn Hour", ["mq16"]],
    ["mq18", 15, 2, "The Stone and the Girl", ["mq12", "mq17"]],
    ["mq04", 16, 3, "The Company You Keep", ["mq18"]],
    ["mq19", 17, 3, "Eyes on the Island", ["mq04"]],
    ["mq20", 18, 3, "Numbers Game", ["mq04"]],
    ["mq21", 19, 3, "Pure Records", ["mq04"]],
    ["mq05", 20, 3, "King of the Empire", ["mq04"]],
    ["mq22", 21, 3, "Continuity of Government", ["mq04"]],
    ["mq23", 22, 3, "The Whispering Gallery", ["mq04", "mq18"]],
    [
      "mq24",
      23,
      3,
      "Crossing",
      ["mq05", "mq19", "mq20", "mq21", "mq22", "mq23"],
    ],
    ["mq06", 24, 4, "Give Me Liberty", ["mq24"]],
    ["mq25", 25, 4, "The Colonel", ["mq06"]],
    ["mq26", 26, 4, "Prisoners of Liberty", ["mq25"]],
    ["mq27", 27, 4, "Who Gave the Order", ["mq26"]],
    ["mq28", 28, 4, "The Torch", ["mq27"]],
    ["mq29", 29, 4, "The Second Dawn", ["mq28"]],
    ["mq30", 30, 5, "Sirocco Two", ["mq29"]],
    ["mq31", 31, 5, "Poste Dragon", ["mq30"]],
    ["mq32", 32, 5, "Blackout", ["mq30"]],
    ["mq33", 33, 5, "Keeper of the Keys", ["mq31", "mq32"]],
    ["mq34", 34, 5, "Sunday Best", ["mq33"]],
    ["mq35", 35, 5, "Track 61", ["mq34"]],
    ["mq36", 36, 5, "The Second Sun", ["mq35"]], // the finale: defined by src/lair (helper module)
  ].map((r) => ({ id: r[0], n: r[1], act: r[2], title: r[3], req: r[4] }));
  const BY_ID = {};
  for (const s of SPINE) BY_ID[s.id] = s;

  const ms = (L.ms = {});
  ms.ACTS = ACTS;
  ms.SPINE = SPINE;
  ms.spine = (id) => BY_ID[id] || null;
  ms.actLabel = (a) => ACTS[a] || "";

  // ------------------------------------------------------------------
  // Flags (ms_ prefix), trust, tokens
  // ------------------------------------------------------------------
  ms.f = (k) => L.flag("ms_" + k);
  ms.set = (k, v) => L.setFlag("ms_" + k, v === undefined ? true : v);
  ms.once = (k) => {
    if (L.flag("ms_once_" + k)) return false;
    L.setFlag("ms_once_" + k, true);
    return true;
  };

  /** Rose's trust 0..5 (starts at 1). */
  ms.trust = () => {
    const v = L.flag("ms_rose_trust");
    return typeof v === "number" ? v : 1;
  };
  ms.addTrust = function (n, why) {
    const before = ms.trust();
    const v = Math.max(0, Math.min(5, before + (Number(n) || 0)));
    L.setFlag("ms_rose_trust", v);
    if (v !== before && !G.SMOKE)
      L.notify(
        ms.roseName() +
          (v > before ? " will remember that." : " won't forget that."),
        { sub: why || "", quiet: true, duration: 3.5 },
      );
    return v;
  };
  ms.setTrust = (v) => {
    L.setFlag("ms_rose_trust", Math.max(0, Math.min(5, Number(v) || 0)));
    return ms.trust();
  };

  /** Memory tokens the finale uses (RING, RECORD, BOOTH, ROSE_PAGE, PASS, NELL, VOICE, POSTER). */
  ms.TOKENS = [
    "ring",
    "record",
    "booth",
    "rose_page",
    "pass",
    "nell",
    "voice",
    "poster",
  ];
  ms.token = (name, on) =>
    L.setFlag("ms_token_" + name, on === undefined ? true : !!on);
  ms.hasToken = (name) => !!L.flag("ms_token_" + name);
  ms.tokens = () => ms.TOKENS.filter((t) => ms.hasToken(t));

  /** Rose's name as the hero knows it. */
  ms.roseName = () => (L.flag("ms_rose_revealed") ? "Rose" : "Flint");

  // ------------------------------------------------------------------
  // Text helpers
  // ------------------------------------------------------------------
  /** Fill {NAME}/{FIRST}/{ROSE} at runtime. */
  ms.t = (s) =>
    typeof s !== "string"
      ? s
      : s
          .replace(/\{NAME\}/g, hero())
          .replace(/\{FIRST\}/g, first())
          .replace(/\{ROSE\}/g, ms.roseName());
  /** A spoken line as a notification (text only). */
  ms.say = (who, text, dur) => {
    L.notify(ms.t(text), { sub: who, speaker: who, duration: dur || 5.5 });
  };
  /** A sequence of lines with gaps (game time): [[who, text, gap?], ...]. */
  ms.scene = function (lines, gap) {
    let t = 0;
    for (const l of lines) {
      const w = l[0],
        tx = l[1];
      L.later(t, () =>
        w ? ms.say(w, tx) : L.notify(ms.t(tx), { duration: 6 }),
      );
      t += l[2] !== undefined ? l[2] : gap || 4.2;
    }
    return t;
  };

  // ------------------------------------------------------------------
  // Notes / items (defined in 'init', personalised at runtime)
  // ------------------------------------------------------------------
  const NOTE_DEFS = [];
  ms.note = function (def) {
    NOTE_DEFS.push(def);
    return def.id;
  };
  ms.item = function (def) {
    NOTE_DEFS.push(Object.assign({ _item: true }, def));
    return def.id;
  };
  function noteDef(n) {
    const d = Object.assign(
      { weight: 0, value: 0, quest: n.quest !== undefined ? n.quest : true },
      n,
    );
    delete d._item;
    if (!n._item) {
      d.type = "note";
      d.desc =
        d.desc ||
        (n.reel
          ? "A tape reel. Play it with your VIGIL goggles (NOTES)."
          : "Read it with your VIGIL goggles (NOTES).");
    }
    d.name = ms.t(n.name);
    if (n.title) d.title = ms.t(n.title);
    if (typeof n.text === "string") d.text = ms.t(n.text);
    return d;
  }
  L.hook("init", function () {
    for (const n of NOTE_DEFS) L.defineItem(noteDef(n));
  });
  L.hook("newGame", function () {
    if (G.isStub("items") || !G.items.get) return;
    for (const n of NOTE_DEFS) {
      const d = G.items.get(n.id);
      if (!d) continue;
      d.name = ms.t(n.name);
      if (n.title) d.title = ms.t(n.title);
      if (typeof n.text === "string") d.text = ms.t(n.text);
    }
  });

  // ------------------------------------------------------------------
  // Main quest definition
  // ------------------------------------------------------------------
  /**
   * ms.quest(def): def is a normal quest def; id must be on the spine. Adds main, category 'main',
   * order (= play order n), act + actLabel. desc may be a function.
   */
  ms.quest = function (def) {
    const sp = BY_ID[def.id] || { n: 99, act: def.act || 5, title: def.name };
    def.main = true;
    def.category = "main";
    def.order = sp.n;
    def.act = sp.act;
    def.actLabel = ACTS[sp.act];
    if (!def.name) def.name = sp.title;
    if (!def.rewards) def.rewards = { xp: 150 + sp.n * 15 };
    return L.quest(def);
  };

  // ------------------------------------------------------------------
  // Absorbed side quests: proxy stages
  // ------------------------------------------------------------------
  const PROXIES = []; // {mainId, stageId, sideId, next, onDone, reach}
  /**
   * A stage that runs a side quest inside a main quest.
   * opts: {id='side', text (fallback objective), markers (fallback), next (stage id, or null = complete the main quest),
   *        onDone(), startStage, reach:{site, anchors, fallback, r} (only used when the side quest does not exist)}
   */
  ms.proxy = function (mainId, sideId, opts) {
    opts = opts || {};
    L.absorb(sideId, mainId);
    const stageId = opts.id || "side";
    PROXIES.push({
      mainId,
      stageId,
      sideId,
      next: opts.next === undefined ? null : opts.next,
      onDone: opts.onDone,
      reach: opts.reach,
      startStage: opts.startStage,
    });
    return {
      id: stageId,
      text: () => {
        const v = Q.get(sideId);
        if (v && v.active && v.stageText) return v.stageText;
        return typeof opts.text === "function"
          ? opts.text()
          : opts.text || (v ? v.name : "");
      },
      markers: () => {
        if (Q.isActive(sideId)) {
          const m = L.questMarkers(sideId);
          if (m && m.length)
            return m.map((x) => ({
              x: x.x,
              z: x.z,
              y: x.y,
              label: x.label,
              exact: true,
              interior: x.interior,
            }));
        }
        const fm =
          typeof opts.markers === "function" ? opts.markers() : opts.markers;
        if (fm) return fm;
        if (opts.reach)
          return [
            {
              anchor: [opts.reach.site, opts.reach.anchors || []],
              fallback: opts.reach.fallback,
              label: opts.reach.label || "",
            },
          ];
        return [];
      },
      onEnter() {
        if (opts.onEnter) opts.onEnter();
        if (Q.get(sideId) && !Q.isStarted(sideId))
          Q.start(
            sideId,
            opts.startStage ? { stage: opts.startStage } : undefined,
          );
        L.later(0.5, pollProxies);
      },
    };
  };
  function proxyAdvance(p) {
    if (Q.stage(p.mainId) !== p.stageId || !Q.isActive(p.mainId)) return;
    if (p.onDone) {
      try {
        p.onDone();
      } catch (e) {
        G.reportError("quests:ms:proxy", e);
      }
    }
    if (Q.stage(p.mainId) !== p.stageId || !Q.isActive(p.mainId)) return; // onDone moved it on itself
    if (p.next) Q.setStage(p.mainId, p.next);
    else Q.complete(p.mainId);
  }
  function pollProxies() {
    for (const p of PROXIES) {
      if (!Q.isActive(p.mainId) || Q.stage(p.mainId) !== p.stageId) continue;
      const exists = !!Q.get(p.sideId);
      if (exists) {
        if (Q.isComplete(p.sideId) || Q.isFailed(p.sideId)) proxyAdvance(p);
        else if (!Q.isStarted(p.sideId))
          Q.start(p.sideId, p.startStage ? { stage: p.startStage } : undefined);
      } else if (p.reach && G.player) {
        // The side quest's module is missing: reaching the place stands in for it (never a soft-lock).
        const a = L.anchor(
          p.reach.site,
          p.reach.anchors || [],
          p.reach.fallback,
        );
        if (
          a &&
          Math.hypot(G.player.pos.x - a.x, G.player.pos.z - a.z) <
            (p.reach.r || 20)
        )
          proxyAdvance(p);
      }
    }
  }
  G.events.on("questCompleted", (v) => {
    if (v && PROXIES.some((p) => p.sideId === v.id)) L.later(1.2, pollProxies);
  });
  G.events.on("questFailed", (v) => {
    if (v && PROXIES.some((p) => p.sideId === v.id)) L.later(1.2, pollProxies);
  });

  // ------------------------------------------------------------------
  // The spine ticker: start quests whose prerequisites are complete
  // ------------------------------------------------------------------
  function actDone(a) {
    for (const s of SPINE)
      if (s.act === a && Q.get(s.id) && !Q.isComplete(s.id)) return false;
    return true;
  }
  function ready(s) {
    if (!Q.get(s.id) || Q.isStarted(s.id)) return false;
    for (const r of s.req) if (Q.get(r) && !Q.isComplete(r)) return false;
    if (s.act > 1 && !actDone(s.act - 1)) return false;
    return true;
  }
  ms.ready = (id) => (BY_ID[id] ? ready(BY_ID[id]) : false);
  ms.actDone = actDone;
  /** Start a spine quest now if its prerequisites are met (used at scripted hand-offs). */
