/* src/quests/61_ms_core.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 61: MAIN STORY CORE ("ms")
 *
 * The spine of the main story (story/outline.json): 35 main quests in five
 * acts plus the finale (mq36, src/lair). This file provides `L.ms`, the
 * toolkit every main-quest file uses:
 *   - SPINE: play order, acts, prerequisites. Quests start themselves when
 *     their prerequisites are complete; acts unlock in order (every quest of
 *     act N-1 must be complete before act N opens). Replaces the old
 *     hand-chained Q.start() calls.
 *   - ms.quest(def): defines a main quest (category 'main', act + label).
 *   - Absorbed side quests: ms.proxy(sideId, opts) is a stage that shows the
 *     side quest's objective + markers and advances when it completes
 *     (auto-completes when it was finished before the main quest unlocked).
 *   - Flags (prefix ms_), Rose's trust (ms_rose_trust 0..5, start 1) and the
 *     memory tokens the finale reads.
 *   - Rose ("Flint"): a scripted ally NPC (`ms_rose`), essential until the
 *     finale; ms.rose.place(...) persists where she is.
 *   - Composite dialogues (ms.dlg) and injections into existing trees
 *     (ms.inject), conditional NPCs / pickups / examine spots / terminals.
 *   - ms.finaleInputs(): one snapshot of everything the finale reads.
 * Text only: no speech synthesis anywhere.
 * ===================================================================== */
(function () {
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
  ms.next = function (id) {
    const s = BY_ID[id];
    if (s && ready(s)) {
      Q.start(id);
      return true;
    }
    return false;
  };
  let lastStart = -1e9;
  function tickSpine() {
    if (L.hasPending("chain")) return;
    if (!Q.isStarted("mq01")) return; // a new game starts mq01 itself (20_cryo)
    const now = G.time ? G.time.elapsed : 0;
    if (now - lastStart < 2.5) return; // one new quest at a time: no stacked banners
    for (const s of SPINE) {
      if (!ready(s)) continue;
      lastStart = now;
      Q.start(s.id);
      return;
    }
  }
  let spineT = 0;
  L.hook("update", function (dt, realDt) {
    spineT -= realDt;
    if (spineT > 0) return;
    spineT = 1.0;
    tickSpine();
    pollProxies();
    pollRoster();
  });
  L.hook("reset", function () {
    lastStart = -1e9;
  });

  // ------------------------------------------------------------------
  // Composite dialogue trees (several files add nodes + start selectors)
  // ------------------------------------------------------------------
  const DLGS = {};
  /**
   * ms.dlg(id) → {nodes, add(nodes), when(fn), idle}. Start = the first `when` selector that returns a node id,
   * else `idle`. Add nodes/selectors at file load or in 'init'; registered in this file's 'register' hook.
   */
  ms.dlg = function (id, idle) {
    if (!DLGS[id]) {
      const C = (DLGS[id] = {
        id,
        nodes: {},
        starts: [],
        idle: idle || "idle",
      });
      C.add = (nodes) => {
        Object.assign(C.nodes, nodes);
        return C;
      };
      C.when = (fn) => {
        C.starts.push(fn);
        return C;
      };
      C.tree = {
        start: (actor) => {
          for (const fn of C.starts) {
            let r = null;
            try {
              r = fn(actor);
            } catch (e) {
              G.reportError("quests:ms:dlg:" + id, e);
            }
            if (r) return r;
          }
          return C.idle;
        },
        nodes: C.nodes,
      };
    } else if (idle) DLGS[id].idle = idle;
    return DLGS[id];
  };

  /**
   * Inject into an existing tree of this module (registered with L.dialogue by an earlier file):
   * spec {start(actor) → nodeId|null (checked before the tree's own start), nodes:{...}, add:[{node, responses:[...], first?}]}.
   */
  const INJECT = [];
  ms.inject = function (dlgId, spec) {
    INJECT.push({ dlgId, spec });
  };
  function applyInjections() {
    for (const { dlgId, spec } of INJECT) {
      const t = L.DIALOGUES.get(dlgId) || (DLGS[dlgId] && DLGS[dlgId].tree);
      if (!t) {
        console.warn("[quests:ms] inject: no dialogue " + dlgId);
        continue;
      }
      if (spec._done) continue;
      spec._done = true;
      if (spec.nodes) Object.assign(t.nodes, spec.nodes);
      for (const a of spec.add || []) {
        const n = t.nodes[a.node];
        if (!n) {
          console.warn("[quests:ms] inject: no node " + dlgId + "/" + a.node);
          continue;
        }
        n.responses = n.responses || [];
        if (a.first) n.responses.unshift(...a.responses);
        else {
          // before the last "goodbye"-style response when there is one
          const i =
            n.responses.length &&
            !n.responses[n.responses.length - 1].next &&
            !n.responses[n.responses.length - 1].action
              ? n.responses.length - 1
              : n.responses.length;
          n.responses.splice(i, 0, ...a.responses);
        }
      }
      if (spec.start) {
        const s0 = t.start;
        t.start = (actor) => {
          let r = null;
          try {
            r = spec.start(actor);
          } catch (e) {
            G.reportError("quests:ms:inject:" + dlgId, e);
          }
          return r || (typeof s0 === "function" ? s0(actor) : s0);
        };
      }
    }
  }
  L.hook("register", function () {
    for (const id in DLGS) L.dialogue(id, DLGS[id].tree);
    applyInjections();
  });
  // Late registrations (dialogues added after this hook ran): once more on initDone.
  G.events.on("initDone", () => {
    for (const id in DLGS) L.dialogue(id, DLGS[id].tree);
    applyInjections();
  });

  /** Open a dialogue tree without an NPC (examining objects, choices at a desk). */
  ms.talk = function (dlgId, name, node) {
    if (G.isStub("dialogue") || !G.dialogue.start) return false;
    try {
      return G.dialogue.start(dlgId, null, {
        name: name || "",
        noCamera: true,
        node,
      });
    } catch (e) {
      G.reportError("quests:ms:talk", e);
      return false;
    }
  };

  // ------------------------------------------------------------------
  // Conditional roster: NPCs, pickups, examine spots, terminals
  // ------------------------------------------------------------------
  const ACTORS = []; // {id, when, def(), onSpawn}
  const ITEMS = []; // {key, item, n, when, at}
  const SPOTS = []; // {id, when, at, label, verb, use, radius, h}
  /** An NPC that exists while when() is true. def: spawnNPC def (or a function returning one). */
  ms.actor = function (spec) {
    ACTORS.push(spec);
    return spec.id;
  };
  /** A pickup placed while when() is true and not yet collected. at: {site, anchors, fallback, dx, dz, dy}. */
  ms.pickup = function (spec) {
    ITEMS.push(spec);
    return spec.key;
  };
  /** An examine/use spot (G.world interactable) while when() is true. use() runs on [E]. */
  ms.spot = function (spec) {
    SPOTS.push(spec);
    return spec.id;
  };
  ms.resolve = function (at) {
    if (typeof at === "function") at = at();
    if (!at) return null;
    if (at.x !== undefined && at.z !== undefined && !at.site) return at;
    const p = L.anchor(at.site, at.anchors || [], at.fallback, {
      maxR: at.maxR || 10,
    });
    if (!p) return null;
    return {
      x: p.x + (at.dx || 0),
      y: (p.y || 0) + (at.dy || 0),
      z: p.z + (at.dz || 0),
      anchored: p.anchored,
    };
  };
  const on = (fn) => {
    try {
      return !fn || !!fn();
    } catch (e) {
      G.reportError("quests:ms:when", e);
      return false;
    }
  };
  function pollRoster() {
    if (!L.isWorldBuilt() || !G.player) return;
    for (const a of ACTORS) {
      const want = on(a.when) && !L.flag("dead_" + a.id);
      const have = L.npc(a.id);
      if (want && !have) {
        const def = typeof a.def === "function" ? a.def() : a.def;
        if (def) {
          const actor = L.spawnNPC(Object.assign({ id: a.id }, def));
          if (actor && a.onSpawn) {
            try {
              a.onSpawn(actor);
            } catch (e) {
              G.reportError("quests:ms:onSpawn", e);
            }
          }
        }
      } else if (!want && have && !have.dead && a.removeWhenOff !== false)
        L.removeNPC(a.id);
    }
    for (const it of ITEMS) {
      if (
        L.flag("got_" + it.key) ||
        (L.pickups[it.key] &&
          L.pickups[it.key].handle &&
          L.pickups[it.key]._gen === L.gen)
      )
        continue;
      if (!on(it.when) || (it.once !== false && L.has(it.item))) continue;
      const p = ms.resolve(it.at);
      if (!p) continue;
      L.pickup(it.key, it.item, it.n || 1, p);
      if (L.pickups[it.key]) L.pickups[it.key]._gen = L.gen;
    }
    for (const s of SPOTS) {
      const want = on(s.when);
      if (want && !s.h) {
        const p = ms.resolve(s.at);
        if (!p || !G.world.addInteractable) continue;
        s.pos = p;
        s.h = G.world.addInteractable({
          pos: L.V3(p.x, (p.y || 0) + (s.h0 || 1.1), p.z),
          radius: s.radius || 1.0,
          label: typeof s.label === "function" ? s.label() : s.label,
          verb: s.verb || "Examine",
          onInteract() {
            try {
              s.use();
            } catch (e) {
              G.reportError("quests:ms:spot:" + s.id, e);
            }
          },
        });
        s.gen = L.gen;
      } else if ((!want || s.gen !== L.gen) && s.h) {
        try {
          G.world.removeInteractable(s.h);
        } catch (e) {
          /* gone */
        }
        s.h = null;
      }
    }
  }
  ms.spotPos = (id) => {
    const s = SPOTS.find((x) => x.id === id);
    return s && s.pos ? s.pos : s ? ms.resolve(s.at) : null;
  };
  ms.pollRoster = pollRoster;
  L.hook("reset", function () {
    for (const s of SPOTS) {
      if (s.h) {
        try {
          G.world.removeInteractable(s.h);
        } catch (e) {
          /* */
        }
        s.h = null;
      }
    }
  });
  L.hook("spawn", function () {
    L.later(0.2, pollRoster);
  });

  /** Terminals placed by the main story: ms.terminal(id, def, at {site, anchors, fallback}, yaw). */
  const TERMS = [];
  ms.terminal = function (id, def, at, yaw) {
    L.terminal(id, def);
    TERMS.push({ id, at, yaw });
    return id;
  };
  L.hook("world", function () {
    for (const t of TERMS) {
      const p = ms.resolve(t.at);
      if (p) L.spawnTerminal(t.id, p, t.yaw || 0);
    }
  });
  ms.termMarker = (id, label) => {
    const p = L.termPos(id);
    return p ? [{ x: p.x, z: p.z, y: p.y - 1.1, label }] : [];
  };

  // ------------------------------------------------------------------
  // Rose ("Flint"): scripted ally
  // ------------------------------------------------------------------
  const ROSE_HOME = {
    site: "tudor_city",
    anchors: ["rose_nook", "ext_roof"],
    fallback: { x: 316, z: -168 },
  };
  const rose = (ms.rose = {
    id: "ms_rose",
    HOME: ROSE_HOME,
    /** Where Rose is: mode 'home' (her roof), 'at' (a spot), 'follow' (beside the hero), 'gone' (not in the world). Persists. */
    place(mode, at) {
      L.setFlag("ms_rose_place", { mode, at: at || null });
      rose.apply();
    },
    mode() {
      const p = L.flag("ms_rose_place");
      return p && p.mode ? p.mode : L.flag("ms_rose_met") ? "home" : "gone";
    },
    spec() {
      return {
        id: rose.id,
        type: "rose",
        preset: "rose",
        name: ms.roseName(),
        gender: "f",
        outfit: "leather_armor",
        hair: "ponytail",
        hairColor: 0x3a2616,
        skinTone: 0.32,
        age: 21,
        faction: "cryo",
        hostile: false,
        essential: true,
        level: 12,
        hp: 320,
        weapon: ["sniper_rifle", "hunting_rifle"],
        dialogue: "dlg_ms_rose",
        voice: "f_young",
        noRespawn: true,
      };
    },
    barks() {
      if (!L.flag("ms_rose_revealed"))
        return [
          "Eyes up.",
          "Keep moving, sleeper.",
          "I don't do candles.",
          "You walk like a man who's been asleep. You have.",
        ];
      return [
        "Stay close, Dad. ...Don't make it a thing.",
        "Eyes up.",
        "I've got the high ground. I always have the high ground.",
        "Five forty-seven. I'm always up at five forty-seven.",
      ];
    },
    apply() {
      if (!L.isWorldBuilt() || !G.player) return;
      const m = rose.mode();
      if (m === "gone" || L.flag("ms_rose_released")) {
        if (L.npc(rose.id)) L.removeNPC(rose.id);
        return;
      }
      const P = L.flag("ms_rose_place") || {};
      // normalise the spot: {site, anchors, fallback} | {fallback:{x,z,y}} | {x,z,y}
      let at = m === "home" ? ROSE_HOME : P.at || ROSE_HOME;
      if (m === "follow") {
        const p = G.player.pos;
        at = { fallback: { x: p.x + 1.6, z: p.z + 1.2, y: p.y } };
      }
      if (at.x !== undefined && !at.fallback)
        at = { fallback: { x: at.x, z: at.z, y: at.y } };
      let a = L.npc(rose.id);
      if (!a || a.dead) {
        const def = Object.assign(rose.spec(), {
          ai: m === "follow" ? "follow" : "guard",
          home: "here",
          homeR: 2,
        });
        def.barks = rose.barks();
        def.at = {
          site: at.site,
          anchors: at.anchors || [],
          fallback: at.fallback,
          maxR: 6,
        };
        if (!at.site) def.at = { fallback: at.fallback, maxR: 6 };
        a = L.spawnNPC(def);
      } else if (m !== "follow") {
        const p = at.site
          ? L.anchor(at.site, at.anchors || [], at.fallback, { maxR: 6 })
          : L.freeSpot(at.fallback.x, at.fallback.z, at.fallback.y, {
              maxR: 6,
            });
        if (p && Math.hypot(a.pos.x - p.x, a.pos.z - p.z) > 4)
          L.moveNPC(rose.id, p);
      }
      if (!a) return;
      a.name = ms.roseName();
      a.essential = !L.flag("ms_rose_mortal");
      if (a.setHostile) {
        try {
          a.setHostile(false);
        } catch (e) {
          /* */
        }
      }
      if (m === "follow") {
        a.ai = "follow";
        if (a.follow) {
          try {
            a.follow(G.player);
          } catch (e) {
            /* */
          }
        }
      } else {
        a.ai = "guard";
        if (a.stop) {
          try {
            a.stop();
          } catch (e) {
            /* */
          }
        }
      }
    },
    actor() {
      return L.npc(rose.id);
    },
    say(text, dur) {
      const a = L.npc(rose.id);
      if (a && !a.dead && a.say) {
        try {
          a.say(ms.t(text), dur || 4.5);
        } catch (e) {
          /* */
        }
      } else ms.say(ms.roseName(), text, dur);
    },
    /** The finale takes over Rose: remove the scripted ally (helper module spawns its own) or keep it (keep=true). */
    release(keep) {
      L.setFlag("ms_rose_released", !keep);
      if (!keep) L.removeNPC(rose.id);
    },
    marker(label) {
      return [{ npc: rose.id, label: label || ms.roseName() }];
    },
  });
  // Rose stays where the story put her (spawn/load) and keeps up when following.
  L.hook("spawn", function () {
    L.later(0.4, () => rose.apply());
  });
  let roseT = 0;
  L.hook("update", function (dt, realDt) {
    roseT -= realDt;
    if (roseT > 0) return;
    roseT = 2.0;
    if (!L.isWorldBuilt()) return;
    const m = rose.mode();
    if (m === "gone" || L.flag("ms_rose_released")) return;
    const a = L.npc(rose.id);
    if (!a) {
      rose.apply();
      return;
    }
    if (a.dead && !L.flag("ms_rose_mortal")) {
      L.removeNPC(rose.id);
      rose.apply();
      return;
    } // never dies before the finale
    if (m === "follow") {
      const p = G.player.pos;
      const d = Math.hypot(a.pos.x - p.x, a.pos.z - p.z);
      // left behind (fast travel, a load door): catch up
      if (d > 60 || Math.abs(a.pos.y - p.y) > 8) {
        const f = L.freeSpot(p.x + 1.6, p.z + 1.2, p.y, { maxR: 5 });
        L.moveNPC(rose.id, f);
      }
      if (a.follow && a.ai !== "follow") {
        a.ai = "follow";
        try {
          a.follow(G.player);
        } catch (e) {
          /* */
        }
      }
    }
    if (a.hp !== undefined && a.maxHp && a.hp < a.maxHp * 0.25 && a.heal) {
      try {
        a.heal(a.maxHp * 0.5);
      } catch (e) {
        /* */
      }
    }
  });

  // Rose's composite dialogue: act files add nodes + start selectors (ms.dlg('dlg_ms_rose')).
  const RD = ms.dlg("dlg_ms_rose", "idle");
  RD.add({
    idle: {
      speaker: () => ms.roseName(),
      text: () => {
        const t = ms.trust();
        if (!L.flag("ms_rose_revealed"))
          return [
            "Flint. Rifle. Roof. That's all there is to know.",
            "You want something, sleeper, or are you just standing in my light?",
            "I keep the sign lit. The sign keeps me fed. Simple.",
          ][Math.floor(Math.random() * 3)];
        if (t <= 1) return "[She doesn't look up from her rifle.] What.";
        if (t >= 4)
          return "[She almost smiles.] Hey, Dad. ...Still weird. Saying it. Go on.";
        return "Rose. Still here. What do you need?";
      },
      responses: [
        {
          text: "How are you holding up?",
          next: "holding",
          cond: () => !!L.flag("ms_rose_revealed"),
        },
        {
          text: "Come with me for a while.",
          next: "follow",
          cond: () => rose.mode() !== "follow" && !!L.flag("ms_rose_follow_ok"),
        },
        {
          text: "Wait here.",
          next: "stay",
          cond: () => rose.mode() === "follow" && !!L.flag("ms_rose_follow_ok"),
        },
        { text: "Never mind." },
      ],
    },
    holding: {
      text: () => {
        const t = ms.trust();
        if (t <= 1)
          return "Holding. Don't ask me again like that. Like you're somebody's father.";
        if (t === 2)
          return "I sleep three hours a night and I wake up at five forty-seven for a radio show I hate. So: normal.";
        if (t === 3)
          return "Better than I was. You talk in your sleep, you know. About radiators.";
        return "Better. Don't tell anybody. [She bumps your shoulder with hers, once, very fast.]";
      },
      responses: [{ text: "Good." }],
    },
    follow: {
      text: "Fine. I'll walk. Don't talk too much.",
      onEnter() {
        rose.place("follow");
      },
      responses: [{ text: "Let's go." }],
    },
    stay: {
      text: "I'll head back to the roof. You know where the sign is.",
      onEnter() {
        rose.place("home");
      },
      responses: [{ text: "See you there." }],
    },
  });

  // ------------------------------------------------------------------
  // Finale inputs: everything the lair/finale module reads, in one place
  // ------------------------------------------------------------------
  /** Rose's state going into the finale: 'captive' | 'with_eli' | 'alone'. */
  ms.roseState = function () {
    if (L.flag("ms_rose_captive")) return "captive";
    if (
      L.flag("ms_rose_with_eli") &&
      ms.trust() >= 3 &&
      L.flag("ms_torch") !== "selective"
    )
      return "with_eli";
    return "alone";
  };
  ms.finaleInputs = function () {
    const f = (k) => L.flag("ms_" + k);
    return {
      roseTrust: ms.trust(),
      roseState: ms.roseState(),
      rosePromise: !!f("rose_promise"),
      ring: f("ring") || (f("has_ring") ? "kept" : null), // 'rose' | 'stone' | 'kept' | null
      roseHasPhoto: !!f("rose_has_photo"),
      tokens: ms.tokens(),
      notice: f("notice") || null, // 'sundays' | 'plain'
      eliReplied: !!f("eli_replied"),
      glow: f("glow") || null, // 'planted' | 'warned' | 'placebo' | 'convinced' | 'refused'
      sunBattery: f("sun_battery") || null, // 'neon' | 'covenant' | 'glowkeepers' | 'repaired'
      lockTruth: !!f("lock_truth"),
      keel: f("keel") || null, // keel: 'defects' | 'dead' | 'spared'
      microfilm: f("microfilm") || null, // 'burned' | 'covenant' | 'continuity'
      attributionRead: !!f("attribution_read"),
      attributionBroadcast: !!f("attribution_broadcast"),
      torch: f("torch") || null, // 'reclamation' | 'selective' | 'charter' | 'destroyed'
      keyB: f("keyB") || null, // 'destroyed' | 'kept'
      sunWordDenied: !!f("sun_word_denied"),
      sunWordGlow: !!f("sun_word_glow"),
      knowsArming: !!f("knows_arming"),
      hollowell: f("hollowell") || null, // 'ally' | 'dead' | 'given'
      childrenSent: !!f("children_sent"),
      evacuation: !!(f("evacuation_called") || f("evac_gc")),
      zealotsSpared: !!f("zealots_spared"),
      tinderStopped: !!f("tinder_stopped"),
      faction: L.flag("mq_faction") || "none",
      musters: f("musters") || [],
      zekeFree: !!f("zeke_free"),
      calloway: !!f("calloway_free"),
      crane: f("crane") || null,
      dawnPact: f("dawn_pact") || null,
    };
  };

  // New game: Rose's trust starts at 1.
  L.hook("newGame", function () {
    if (typeof L.flag("ms_rose_trust") !== "number")
      L.setFlag("ms_rose_trust", 1);
  });

  // ------------------------------------------------------------------
  // Test solvers: per quest, per stage, a function that performs the stage's default resolution exactly as the
  // player would (the same functions dialogue responses / spots call: flags, items, setStage). Used by the forced
  // stage walk (G.quests.debug.ms.walk) to prove every main quest can be completed.
  // ------------------------------------------------------------------
  const SOLVERS = {};
  ms.solver = function (questId, stages) {
    SOLVERS[questId] = Object.assign(SOLVERS[questId] || {}, stages);
  };
  /** Walk a quest to completion with its solvers: returns the log of stages and any stall. */
  function walk(id, maxSteps) {
    const log = [];
    if (!Q.get(id)) return { id, ok: false, err: "undefined" };
    if (!Q.isStarted(id)) Q.start(id);
    for (let i = 0; i < (maxSteps || 40); i++) {
      if (Q.isComplete(id)) return { id, ok: true, log };
      const st = Q.stage(id);
      log.push(st);
      const fn = SOLVERS[id] && (SOLVERS[id][st] || SOLVERS[id]["*"]);
      if (!fn) return { id, ok: false, err: "no solver for stage " + st, log };
      try {
        fn(st);
      } catch (e) {
        return {
          id,
          ok: false,
          err: "solver threw at " + st + ": " + e.message,
          log,
        };
      }
      pollProxies();
      if (!Q.isComplete(id) && Q.stage(id) === st)
        return { id, ok: false, err: "stalled at " + st, log };
    }
    return { id, ok: Q.isComplete(id), log };
  }
  ms.walk = walk;

  // ------------------------------------------------------------------
  // Debug: G.quests.debug.ms
  // ------------------------------------------------------------------
  G.quests.debug.ms = {
    walk: (id) => walk(id),
    /** Walk the whole spine from wherever it is (each quest started by its solver walk). */
    walkAll(upTo) {
      const out = [];
      for (const s of SPINE) {
        if (!Q.get(s.id)) {
          out.push({ id: s.id, ok: false, err: "undefined" });
          continue;
        }
        if (Q.isComplete(s.id)) continue;
        const r = walk(s.id);
        out.push(r);
        if (!r.ok) break;
        if (upTo && s.id === upTo) break;
      }
      return out;
    },
    solvers: () => Object.keys(SOLVERS),
    spine: () =>
      SPINE.map(
        (s) =>
          s.n +
          " " +
          s.id +
          " [" +
          (Q.isComplete(s.id)
            ? "done"
            : Q.isActive(s.id)
              ? "active:" + Q.stage(s.id)
              : Q.get(s.id)
                ? "-"
                : "UNDEFINED") +
          "] " +
          s.title,
      ),
    /** Complete every spine quest before `id` (no rewards) and start `id`. */
    skipTo(id) {
      for (const s of SPINE) {
        if (s.id === id) break;
        if (Q.get(s.id) && !Q.isComplete(s.id)) {
          if (!Q.isStarted(s.id)) Q.start(s.id);
          L.completeSilently(s.id);
        }
      }
      if (Q.get(id) && !Q.isStarted(id)) Q.start(id);
      return Q.stage(id);
    },
    inputs: () => ms.finaleInputs(),
    trust: (v) => (v === undefined ? ms.trust() : ms.setTrust(v)),
    rose: () => {
      const a = rose.actor();
      return a
        ? { mode: rose.mode(), pos: [a.pos.x, a.pos.y, a.pos.z], name: a.name }
        : rose.mode();
    },
  };
})();
