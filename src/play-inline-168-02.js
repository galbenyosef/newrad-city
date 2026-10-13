// play-inline-168 02 — math
// Lines 28-258 of readable/play-inline-168.pretty.js (statement-aligned).
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
