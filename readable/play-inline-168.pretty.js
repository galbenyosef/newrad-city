/* src/poi_uptown/97_questwalk.js */
/* =====================================================================
 * NEW RAD CITY — POI quest walker (dev / test utility; no runtime cost unless called)
 *
 * G.poiQuestWalk({ids, maxIter, verbose}) → Promise<report>
 * Plays every listed side quest to completion through the REAL interaction surface, the way a
 * player would, one objective at a time:
 *   start the quest → read its live objective markers (G.quests.activeMarkers) → teleport next to
 *   each marker (true in-cell position, nearest walkable spot) → act there, in order:
 *     1. kill hostiles within 18 m (the walker is in god mode, it does not test combat balance),
 *     2. talk to friendly NPCs with dialogue within 6 m — conversations are driven by key presses
 *        through the dialogue UI (Digit1..9), choosing lines by a quest-seeking heuristic and
 *        varying choices on repeat visits,
 *     3. empty containers within 3.5 m, run every terminal within 3.5 m (onUnlock + entry actions,
 *        honouring their conditions), trigger every other interactable (pickups, levers, shelves,
 *        dynamos, seats; every G.locks lock opens as if its key or code were known),
 *   and re-reads the stage after every action. A quest that makes no progress over a full pass of
 *   its markers is reported as stuck at that stage (with what was tried).
 * The player gets god mode, skills 100 and 5,000 scrip (the walker tests reachability of the quest
 * LOGIC, not character builds). Used by the round-1 test runner (see poi_uptown/NOTES.md).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || G.poiQuestWalk) return;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  /** Let ms of game time pass. When no render loop is running (headless survey/test pages) the
   *  simulation is stepped by hand via core's G._step so actors, AI and UI timers advance. */
  async function pump(ms) {
    const r0 = G.time.real;
    await sleep(20);
    if (G.time.real > r0 || typeof G._step !== "function") {
      await sleep(ms);
      return;
    }
    const n = Math.max(1, Math.ceil(ms / 33));
    for (let i = 0; i < n; i++) {
      try {
        G._step(1 / 30);
      } catch (e) {
        /* reported by core */
      }
      if (i % 8 === 7) await sleep(0);
    }
    await sleep(Math.min(ms, 600)); // let real timers (fades, confirm popups, delayed spawns) fire too
  }
  const DEFAULT_IDS = [
    "pu_encore",
    "pu_nursery",
    "pu_heist",
    "pu_omelette",
    "pmid_q_pit",
    "pmid_q_claim",
    "pmid_q_bellevue",
    "pmid_q_deadair",
    "pv_last_portrait",
    "pv_what_shes_having",
    "pv_red_star",
    "pv_jailbreak",
  ];

  function key(code) {
    try {
      G.events.emit("keydown", code, {
        code,
        preventDefault() {},
        stopPropagation() {},
      });
    } catch (e) {
      /* ignore */
    }
  }
  function st(id) {
    try {
      return G.quests.stage(id);
    } catch (e) {
      return null;
    }
  }
  function status(id) {
    try {
      if (G.quests.isComplete(id)) return "complete";
      if (G.quests.isActive(id)) return "active";
    } catch (e) {
      /* ignore */
    }
    try {
      const v = G.quests.get && G.quests.get(id);
      if (v && v.status) return v.status;
    } catch (e) {
      /* ignore */
    }
    return "inactive";
  }
  function sig(id) {
    return (
      status(id) +
      ":" +
      st(id) +
      ":" +
      JSON.stringify(
        Object.keys(G.quests._flagsDump ? G.quests._flagsDump() : {}),
      )
    );
  }

  /** y for a marker: its own y, an NPC's feet, or the nearest POI anchor at that x/z. */
  function markerPos(m) {
    const x = m.trueX !== undefined ? m.trueX : m.x,
      z = m.trueZ !== undefined ? m.trueZ : m.z;
    if (m.npc && G.actors && G.actors.get) {
      const a = G.actors.get(m.npc);
      if (a && a.pos) return { x: a.pos.x, y: a.pos.y, z: a.pos.z };
    }
    let best = null,
      bd = 4;
    for (const k in G.pois || {}) {
      const p = G.pois[k];
      if (!p || typeof p !== "object" || !p.anchors) continue;
      for (const n in p.anchors) {
        const v = p.anchors[n];
        if (!v || typeof v.x !== "number") continue;
        const d = Math.hypot(v.x - x, v.z - z);
        if (d < bd) {
          bd = d;
          best = v;
        }
      }
    }
    if (m.y !== undefined && !m.viaDoor) return { x, y: m.y, z };
    if (best) return { x, y: best.y, z };
    return { x, y: G.world.groundHeight(x, z, 200), z };
  }
  /** Nearest free standing spot (walkable ground ≈ y, no wall) within 3 m of p. */
  function standAt(p) {
    const W = G.world;
    const free = (x, z, y) => {
      for (const c of W.query(x - 0.4, z - 0.4, x + 0.4, z + 0.4))
        if (
          c.maxY > y + 0.55 &&
          c.minY < y + 1.7 &&
          W.pointInCollider(c, x, z, 0.3)
        )
          return false;
      return true;
    };
    for (const r of [0, 0.8, 1.4, 2.0, 2.8]) {
      for (let k = 0; k < (r ? 12 : 1); k++) {
        const a = (k / 12) * Math.PI * 2,
          x = p.x + Math.cos(a) * r,
          z = p.z + Math.sin(a) * r;
        const g = W.groundHeight(x, z, p.y + 0.6);
        if (Math.abs(g - p.y) < 0.8 && free(x, z, g)) return { x, y: g, z };
      }
    }
    return { x: p.x, y: p.y, z: p.z };
  }
  function tp(p, look) {
    const s = standAt(p);
    const yaw = look ? Math.atan2(-(look.x - s.x), -(look.z - s.z)) : 0;
    G.player.teleport(s.x, s.y + 0.05, s.z, yaw);
    return s;
  }

  // ---------------------------------------------------------------- dialogue
  const used = {};
  const GOOD =
    /accept|i'?ll|i will|deal|yes|sure|here|give|found|have|got|done|help|job|work|need|concert|score|egg|diamond|key|portrait|ledger|prisoner|free|install|power|patron|sign|contract|ready|start|tell me|what happened|belt|bout|fight|policy|claim|cache|pharmac|jammer|payment|reward|\[speech|\[science|\[barter|\[medicine|\[repair|\[lockpick|\[intelligence|\[charisma|report|back|return|nanny|agnes|rest|peace/i;
  const BAD =
    /goodbye|good-bye|bye\b|leave|never mind|nevermind|later|not now|not interested|no thanks|let'?s trade|let me see your|what do you have for sale|\btrade\b|buy\b|sell\b|rent|room for the night|shop/i;
  async function drive(did, log) {
    for (let step = 0; step < 16 && G.dialogue.isActive(); step++) {
      await pump(320);
      if (!G.dialogue.isActive()) break;
      if (G.state === "barter") {
        key("Escape");
        await pump(200);
      }
      const cur = G.dialogue.current();
      const lis = Array.from(document.querySelectorAll(".dlg-resp ol li"));
      if (!lis.length) {
        key("Escape");
        break;
      }
      let bi = 0,
        bs = -1e9;
      lis.forEach((li, i) => {
        const t = li.textContent || "";
        const k = did + "|" + (cur && cur.node) + "|" + t;
        let s = 0;
        if (li.classList.contains("locked")) s -= 50;
        if (GOOD.test(t)) s += 3;
        if (BAD.test(t)) s -= 6;
        if (li.classList.contains("used")) s -= 1.5;
        s -= (used[k] || 0) * 2.5;
        s += (lis.length - i) * 0.05; // stable tie-break: earlier lines first
        if (s > bs) {
          bs = s;
          bi = i;
        }
      });
      const t = lis[bi].textContent || "";
      const k = did + "|" + (cur && cur.node) + "|" + t;
      used[k] = (used[k] || 0) + 1;
      log.push("  say[" + (cur && cur.node) + "]: " + t.slice(0, 70));
      key("Digit" + (bi + 1));
    }
    await pump(200);
    if (G.dialogue.isActive()) {
      key("Escape");
      G.dialogue.end(true);
    }
    if (G.state !== "play") {
      try {
        G.setState("play");
      } catch (e) {
        /* ignore */
      }
    }
  }

  // ---------------------------------------------------------------- terminals
  function runTerminal(id, log) {
    const def = G.terminals.get(id);
    if (!def) return;
    log.push("  terminal " + id);
    try {
      if (def.onUnlock) def.onUnlock();
    } catch (e) {
      log.push("   ! onUnlock " + e);
    }
    const walk = (list, depth) => {
      for (const e of list || []) {
        try {
          if (e.cond && !e.cond()) continue;
          if (e.action) {
            e.action();
            log.push(
              "   entry: " +
                (typeof e.title === "function" ? e.title() : e.title),
            );
          }
          if (e.entries && depth < 3)
            walk(
              typeof e.entries === "function" ? e.entries() : e.entries,
              depth + 1,
            );
        } catch (err) {
          log.push("   ! entry " + err);
        }
      }
    };
    walk(typeof def.entries === "function" ? def.entries() : def.entries, 0);
  }

  // ---------------------------------------------------------------- act at a spot
  async function actAt(id, p, log, before, talkOnly) {
    const changed = () => sig(id) !== before;
    // 1. hostiles
    if (G.actors && G.actors.list) {
      for (const a of G.actors.list()) {
        if (!a || a.dead || !a.pos) continue;
        let hostile = false;
        try {
          hostile = typeof a.hostile === "function" ? a.hostile() : !!a.hostile;
        } catch (e) {
          /* ignore */
        }
        if (
          !hostile ||
          Math.hypot(a.pos.x - p.x, a.pos.z - p.z) > 18 ||
          Math.abs(a.pos.y - p.y) > 6
        )
          continue;
        try {
          if (a.kill) a.kill();
          else a.damage(1e6, { source: "player" });
          log.push("  kill " + (a.name || a.type));
        } catch (e) {
          /* ignore */
        }
      }
      await pump(250);
      if (changed()) return true;
    }
    // 2. talk
    const ints = G.world.interactables.filter((it) => {
      const q = it.getPos ? it.getPos() : it.pos;
      if (!q) return false;
      return (
        Math.hypot(q.x - p.x, q.z - p.z) < 6 &&
        Math.abs((q.y || 0) - p.y) < 3.5 &&
        (!it.enabled || it.enabled() !== false)
      );
    });
    const label = (it) => {
      try {
        return (
          String(typeof it.label === "function" ? it.label() : it.label || "") +
          " " +
          String(typeof it.verb === "function" ? it.verb() : it.verb || "")
        );
      } catch (e) {
        return "";
      }
    };
    const isDoor = (it) =>
      /door|exit|enter|leave|elevator|ladder|hatch|stairs|go (up|down)|travel/i.test(
        label(it),
      ) && !/vault|sealed|gate|cell|3b/i.test(label(it));
    const talkers = (G.actors && G.actors.list ? G.actors.list() : []).filter(
      (a) =>
        a &&
        !a.dead &&
        a.pos &&
        a.interactable &&
        Math.hypot(a.pos.x - p.x, a.pos.z - p.z) < 6 &&
        Math.abs(a.pos.y - p.y) < 3.5,
    );
    for (const a of talkers) {
      try {
        if (!a.inScene && a.attach) a.attach();
      } catch (e) {
        /* ignore */
      }
    }
    await pump(100);
    for (const it of talkers
      .map((a) => a.interactable)
      .filter((q) => {
        try {
          return !q.enabled || q.enabled();
        } catch (e) {
          return false;
        }
      })) {
      for (let visit = 0; visit < 3; visit++) {
        try {
          it.onInteract();
        } catch (e) {
          log.push("  ! talk " + e);
        }
        await pump(120);
        const cur = G.dialogue.current();
        log.push(
          " talk " + label(it).trim() + " (" + (cur ? cur.id : "-") + ")",
        );
        if (cur) await drive(cur.id, log);
        if (changed()) return true;
      }
    }
    if (talkOnly) return changed();
    // 3. containers
    if (G.containers && G.containers.near) {
      for (const c of G.containers.near(p, 7)) {
        if (c.pos && Math.abs(c.pos.y - p.y) > 3) continue;
        try {
          if (c.locked) c.locked = 0;
          if (c.takeAll) {
            const n = (c.list ? c.list() : []).length;
            c.takeAll();
            if (n) log.push("  loot " + (c.name || c.id) + " (" + n + ")");
          }
        } catch (e) {
          /* ignore */
        }
      }
      if (changed()) return true;
    }
    // 4. other interactables (terminals via a captured open)
    for (const it of ints) {
      if (/talk/i.test(label(it)) || isDoor(it)) continue;
      const q = it.getPos ? it.getPos() : it.pos;
      if (Math.hypot(q.x - p.x, q.z - p.z) > 5) continue;
      if (it.locked) it.locked = 0;
      let termId = null;
      const T = G.terminals,
        open0 = T && T.open;
      if (T)
        T.open = (tid) => {
          termId = tid;
          return true;
        };
      try {
        it.onInteract();
        log.push("  use " + label(it).trim());
      } catch (e) {
        log.push("  ! use " + label(it).trim() + " " + e);
      }
      if (T) T.open = open0;
      await pump(150);
      if (termId) runTerminal(termId, log);
      if (G.dialogue.isActive()) await drive(G.dialogue.current().id, log);
      if (G.state !== "play") {
        key("Escape");
        await pump(100);
        try {
          G.setState("play");
        } catch (e) {
          /* ignore */
        }
      }
      if (changed()) return true;
    }
    return changed();
  }

  G.poiQuestWalk = async function (opts) {
    opts = opts || {};
    const ids = opts.ids || DEFAULT_IDS,
      maxIter = opts.maxIter || 24;
    const report = [];
    // test harness: god mode, skills and attributes maxed, scrip
    try {
      if (G.cheat) G.cheat.god = true;
    } catch (e) {
      /* ignore */
    }
    const skill0 = G.rpg && G.rpg.skill,
      attr0 = G.rpg && G.rpg.attr;
    try {
      if (G.rpg) {
        G.rpg.skill = () => 100;
        if (typeof attr0 === "function") G.rpg.attr = () => 10;
      }
    } catch (e) {
      /* ignore */
    }
    try {
      if (G.inventory && G.inventory.addScrip) G.inventory.addScrip(5000);
    } catch (e) {
      /* ignore */
    }
    // modal helpers answer themselves: confirmations say yes, every lock opens (as if its key or code were known;
    // the locks audit separately proves each key / code is obtainable in the world)
    const confirm0 = G.ui && G.ui.confirm,
      lo0 = G.locks && G.locks.open;
    try {
      if (G.ui && !G.isStub("ui")) G.ui.confirm = () => Promise.resolve(true);
    } catch (e) {
      /* ignore */
    }
    try {
      if (G.locks && !G.isStub("locks"))
        G.locks.open = (spec, ok) => {
          try {
            const id = typeof spec === "string" ? spec : spec && spec.id;
            if (id && G.locks.unlock) G.locks.unlock(id);
          } catch (e) {
            /* ignore */
          }
          try {
            ok && ok();
          } catch (e) {
            /* ignore */
          }
          return true;
        };
    } catch (e) {
      /* ignore */
    }
    for (const id of ids) {
      const log = [],
        path = [];
      let res = "inactive";
      if (!G.quests || !G.quests.get || !G.quests.get(id)) {
        report.push({ id, result: "undefined" });
        continue;
      }
      // start it the way a player would: talk to the giver (if the quest has one and they are around)
      if (status(id) === "inactive") {
        let giver = null;
        try {
          const v = G.quests.get(id);
          const gn = v && (v.giver || (v.def && v.def.giver));
          if (gn)
            giver = G.actors
              .list()
              .find(
                (a) =>
                  a &&
                  !a.dead &&
                  a.name &&
                  (a.name === gn ||
                    a.name.indexOf(gn) >= 0 ||
                    gn.indexOf(a.name) >= 0),
              );
        } catch (e) {
          /* ignore */
        }
        if (giver) {
          const gp = { x: giver.pos.x, y: giver.pos.y, z: giver.pos.z };
          tp(gp, gp);
          await pump(400);
          log.push(" giver " + giver.name);
          for (let k = 0; k < 4 && status(id) === "inactive"; k++)
            await actAt(id, gp, log, sig(id), true);
        }
        if (status(id) === "inactive") {
          log.push(" (forced start)");
          try {
            G.quests.start(id);
          } catch (e) {
            log.push("! start " + e);
          }
        }
      }
      let stuck = 0,
        iter = 0;
      const visitedDoors = new Set();
      let lingered = false;
      while (iter++ < maxIter) {
        const s = status(id);
        if (s === "complete" || s === "failed") {
          res = s;
          break;
        }
        const stage = st(id);
        if (path[path.length - 1] !== stage) path.push(stage);
        let ms = [];
        try {
          ms = G.quests
            .activeMarkers(true)
            .filter((m) => m.questId === id || m.quest === id);
        } catch (e) {
          /* ignore */
        }
        log.push(
          "[" + stage + "] markers " + ms.map((m) => m.label || "?").join(", "),
        );
        const before = sig(id);
        let progressed = false;
        let entered = false;
        for (const m of ms) {
          const p = markerPos(m);
          // an objective marker on a building's street door → walk in through that door (markers then resolve in-cell)
          if (p.x < G.LAYOUT.INTERIOR_X_MIN) {
            const d = (G.world.doors || [])
              .filter((q) => !q._barred)
              .map((q) => q.def || q)
              .find(
                (f) =>
                  f.pos &&
                  f.target &&
                  f.target.x >= G.LAYOUT.INTERIOR_X_MIN &&
                  Math.hypot(f.pos.x - p.x, f.pos.z - p.z) < 7 &&
                  !(
                    f.locked > 0 &&
                    f.id &&
                    /rose|service|manhole|bay_in|courts/i.test(f.id)
                  ),
              );
            if (d && !visitedDoors.has(d)) {
              visitedDoors.add(d);
              G.player.teleport(
                d.target.x,
                (d.target.y || 0) + 0.05,
                d.target.z,
                d.target.yaw || 0,
              );
              // a real door use also runs the door's onEnter hook (discovery, quest progress on entry)
              try {
                if (typeof d.onEnter === "function") d.onEnter();
                G.events.emit("doorTransition", d);
              } catch (e) {
                log.push(" ! door onEnter " + e);
              }
              await pump(500);
              log.push(" enter " + (d.label || d.id || "door"));
              entered = true;
              break;
            }
          }
          const s2 = tp(p, p);
          await pump(450);
          log.push(
            " at " +
              (m.label || "?") +
              " (" +
              p.x.toFixed(1) +
              "," +
              p.y.toFixed(1) +
              "," +
              p.z.toFixed(1) +
              ") stood " +
              s2.x.toFixed(1) +
              "," +
              s2.y.toFixed(1) +
              "," +
              s2.z.toFixed(1),
          );
          if (await actAt(id, p, log, before)) {
            progressed = true;
            break;
          }
        }
        if (entered) continue;
        if (!progressed) {
          // fallback: some stages are handed in / kicked off by the quest giver (e.g. "tell Mickey you're ready")
          const v = G.quests.get(id),
            gn = v && v.giver;
          const giver =
            gn &&
            G.actors
              .list()
              .find(
                (a) =>
                  a &&
                  !a.dead &&
                  a.name &&
                  (a.name === gn ||
                    a.name.indexOf(gn) >= 0 ||
                    gn.indexOf(a.name) >= 0),
              );
          if (giver && stuck === 0) {
            const gp = { x: giver.pos.x, y: giver.pos.y, z: giver.pos.z };
            tp(gp, gp);
            await pump(300);
            log.push(" back to giver " + giver.name);
            if (await actAt(id, gp, log, before, true)) {
              stuck = 0;
              visitedDoors.clear();
              continue;
            }
          }
          // some objectives just take time (a concert, a countdown): linger ~55 s of game time once before giving up
          if (stuck === 0 && !lingered) {
            lingered = true;
            log.push(" linger");
            const n = 280;
            for (let i = 0; i < n && sig(id) === before; i++) {
              try {
                G._step(0.2);
              } catch (e) {
                /* */
              }
              if (i % 20 === 19) await sleep(0);
            }
            if (sig(id) !== before) {
              stuck = 0;
              continue;
            }
          }
          if (++stuck >= 2) {
            res = "stuck@" + stage;
            break;
          }
        } else {
          stuck = 0;
          visitedDoors.clear();
        }
      }
      if (res === "inactive")
        res = status(id) === "complete" ? "complete" : "timeout@" + st(id);
      report.push({
        id,
        result: res,
        path,
        log: opts.verbose ? log : log.slice(-14),
      });
    }
    try {
      if (G.rpg) {
        G.rpg.skill = skill0;
        if (attr0) G.rpg.attr = attr0;
      }
    } catch (e) {
      /* ignore */
    }
    try {
      if (confirm0) G.ui.confirm = confirm0;
      if (lo0) G.locks.open = lo0;
    } catch (e) {
      /* ignore */
    }
    return report;
  };
})();
