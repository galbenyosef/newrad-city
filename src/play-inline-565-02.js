// play-inline-565 02 — spec
// Lines 370-677 of readable/play-inline-565.pretty.js (statement-aligned).
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
