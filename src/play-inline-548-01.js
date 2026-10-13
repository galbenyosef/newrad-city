// play-inline-548 01 — status
// Lines 29-375 of readable/play-inline-548.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;

  // ------------------------------------------------------------------
  // Internal state
  // ------------------------------------------------------------------
  const DEFS = new Map(); // questId -> definition
  const STATE = new Map(); // questId -> {status, stage, log:[stageIds], t}
  let FLAGS = {}; // arbitrary persistent flags / counters
  let TRACKED = null; // tracked quest id
  const ENDINGS = new Map(); // endingId -> fn() => slides
  // Side quests absorbed into the main story: sideId -> mainId. While the main quest is
  // started, the side quest is hidden from the quest log and the tracker; its objective
  // text and markers show through the main quest's proxy stage (see lib.ms in 61_ms_core.js).
  const ABSORB = {};
  function hiddenNow(id) {
    const m = ABSORB[id];
    if (!m) return false;
    const s = STATE.get(m);
    if (!s || s.status === "inactive") return false;
    if (s.status === "active") return true;
    // main quest finished: the side quest stays folded into it only if it was played to the end too
    const o = STATE.get(id);
    return (
      !o ||
      o.status === "completed" ||
      o.status === "failed" ||
      o.status === "inactive"
    );
  }

  const HOOKS = {
    init: [],
    register: [],
    world: [],
    newGame: [],
    spawn: [],
    loaded: [],
    update: [],
    reset: [],
  };
  const DIALOGUES = new Map(); // id -> tree (kept so we can (re)register late)
  const TERMINALS = new Map(); // id -> def
  const TRIGGERS = []; // proximity triggers
  let worldBuilt = false;
  const DYN = []; // dynamic props/pickups spawned by quests (cleared on reset)
  function clearDynamic() {
    for (const h of DYN.splice(0)) {
      try {
        if (
          h.key !== undefined &&
          h.itemId === undefined &&
          !G.isStub("items") &&
          G.items.removePickup
        ) {
          G.items.removePickup(h);
          continue;
        }
        if (typeof h.remove === "function") h.remove();
        else if (typeof h.dispose === "function") h.dispose();
        if (h.object3d && h.object3d.parent)
          h.object3d.parent.remove(h.object3d);
        if (h.interactable) G.world.removeInteractable(h.interactable);
        if (h.collider) G.world.removeCollider(h.collider);
        if (
          h.container &&
          G.containers &&
          G.containers.remove &&
          !G.isStub("containers")
        )
          G.containers.remove(h.container);
      } catch (e) {
        /* already gone */
      }
    }
  }

  function safe(where, fn) {
    try {
      return fn();
    } catch (e) {
      G.reportError("quests:" + where, e);
      return undefined;
    }
  }

  // ------------------------------------------------------------------
  // Quest engine (public API)
  // ------------------------------------------------------------------
  function getState(id) {
    let s = STATE.get(id);
    if (!s) {
      s = { status: "inactive", stage: null, log: [], t: 0 };
      STATE.set(id, s);
    }
    return s;
  }
  function stageDef(q, stageId) {
    return q && q.stages
      ? q.stages.find((s) => s.id === stageId) || null
      : null;
  }
  function evalText(t) {
    if (typeof t === "function") {
      try {
        return String(t());
      } catch (e) {
        return "...";
      }
    }
    return t || "";
  }

  /** Public, UI-friendly snapshot of a quest (what events carry and list() returns). */
  function view(id) {
    const q = DEFS.get(id);
    if (!q) return null;
    const s = getState(id);
    const cur = stageDef(q, s.stage);
    const objectives = [];
    // Completed stages first (struck through in the goggles' quest log), then the current one.
    for (const sid of s.log) {
      const sd = stageDef(q, sid);
      if (!sd || sd.hidden) continue;
      const done = sid !== s.stage || s.status !== "active";
      objectives.push({
        id: sid,
        text: evalText(sd.text),
        done,
        current: !done && s.status === "active",
        optional: !!sd.optional,
        failed: s.status === "failed" && sid === s.stage,
      });
    }
    // Optional side objectives ("(Optional) ..." lines). Each solution to a
    // quest can be a sideObjective with doneIf() (ticked off once that path was taken,
    // and kept in the log after completion so the quest log records HOW it was solved)
    // and showIf() (only offered once the player could know about it).
    if (q.stages) {
      for (const sd of q.stages) {
        if (!sd.sideObjective || s.log.indexOf(sd.id) >= 0) continue;
        if (sideDone(sd)) {
          objectives.push({
            id: sd.id,
            text: evalText(sd.text),
            done: true,
            current: false,
            optional: true,
          });
          continue;
        }
        if (s.status !== "active") continue;
        if (sd.failIf && safe("failIf", sd.failIf)) {
          objectives.push({
            id: sd.id,
            text: evalText(sd.text),
            done: false,
            current: false,
            optional: true,
            failed: true,
          });
          continue;
        }
        if (sd.showIf && !safe("showIf", sd.showIf)) continue;
        objectives.push({
          id: sd.id,
          text: evalText(sd.text),
          done: false,
          current: true,
          optional: true,
        });
      }
    }
    return {
      id: q.id,
      name: q.name,
      main: !!q.main,
      category: q.category || (q.main ? "main" : "side"),
      giver: q.giver || "",
      desc: evalText(q.desc),
      location: q.location || "",
      status: s.status,
      active: s.status === "active",
      completed: s.status === "completed",
      failed: s.status === "failed",
      stage: s.stage,
      stageText: cur ? evalText(cur.text) : "",
      objectives,
      tracked: TRACKED === q.id,
      rewards: q.rewards || {},
      startedAt: s.t,
      order: q.order || 0,
      // main story: act number + label for the goggles QUEST tab (grouping "ACT I: THAW" ...)
      act: q.act || 0,
      actLabel: q.actLabel || "",
      absorbedBy: ABSORB[q.id] || null,
    };
  }

  /** A side objective whose solution has been carried out. */
  function sideDone(sd) {
    return !!(sd.doneIf && safe("doneIf", sd.doneIf));
  }
  /** What listeners get for a stage: a resolved snapshot, never the raw definition (whose
   *  text may be a function and which carries onEnter / markers closures). */
  function stageSnap(sd) {
    return sd
      ? {
          id: sd.id,
          text: evalText(sd.text),
          optional: !!sd.optional,
          main: !sd.sideObjective,
        }
      : null;
  }

  function defineQuest(def) {
    if (!def || !def.id) return null;
    def.stages = def.stages || [];
    def.rewards = def.rewards || {};
    DEFS.set(def.id, def);
    return def;
  }

  function start(id, opts) {
    const q = DEFS.get(id);
    if (!q) {
      console.warn("[quests] unknown quest " + id);
      return false;
    }
    const s = getState(id);
    if (s.status !== "inactive") return false;
    s.status = "active";
    s.t = G.time ? G.time.elapsed : 0;
    s.log = [];
    s.stage = null;
    const first = (opts && opts.stage) || (q.stages[0] && q.stages[0].id);
    if (hiddenNow(id)) {
      /* absorbed: the main quest carries the tracker */
    } else if (!TRACKED || q.main || (TRACKED && !isActive(TRACKED)))
      TRACKED = id;
    else if (q.track) TRACKED = id;
    const sd = first ? stageDef(q, first) : null;
    if (sd) {
      s.stage = first;
      s.log.push(first);
    }
    // NOTE: the jingle (quest_start / quest_update / quest_complete) is played by the
    // sound module from these events — never play it here too (it doubled up).
    G.events.emit("questStarted", view(id));
    if (sd && sd.onEnter) safe("onEnter:" + id + "/" + first, sd.onEnter);
    if (sd && sd.complete) complete(id);
    return true;
  }

  function enterStage(q, s, stageId, silent) {
    const sd = stageDef(q, stageId);
    if (!sd) {
      console.warn("[quests] unknown stage " + q.id + "/" + stageId);
      return false;
    }
    s.stage = stageId;
    if (s.log.indexOf(stageId) < 0) s.log.push(stageId);
    lib.markerCache.clear();
    if (!silent) G.events.emit("questUpdated", view(q.id), stageSnap(sd));
    if (sd.onEnter) safe("onEnter:" + q.id + "/" + stageId, sd.onEnter);
    if (sd.complete) complete(q.id);
    return true;
  }

  function setStage(id, stageId) {
    const q = DEFS.get(id);
    if (!q) return false;
    const s = getState(id);
    if (s.status === "completed" || s.status === "failed") return false;
    if (s.status === "inactive") {
      start(id, { stage: stageId });
      return true;
    }
    if (s.stage === stageId) return false;
    return enterStage(q, s, stageId, false);
  }

  function complete(id) {
    const q = DEFS.get(id);
    if (!q) return false;
    const s = getState(id);
    if (s.status === "completed") return false;
    if (s.status === "inactive") {
      s.status = "active";
      s.log = [];
    }
    s.status = "completed";
    const r = q.rewards || {};
    // Rewards — each guarded so a missing module never blocks completion.
    if (r.xp) lib.xp(r.xp, "Quest: " + q.name);
    const scripR = Number(r.scrip) || 0;
    if (scripR) lib.giveScrip(scripR);
    if (r.items) for (const it of r.items) lib.give(it[0], it[1] || 1);
    const standR = Number(r.standing) || 0;
    if (standR) lib.standing(standR, q.name);
    if (q.onComplete) safe("onComplete:" + id, q.onComplete);
    G.events.emit("questCompleted", view(id));
    if (TRACKED === id) {
      TRACKED = pickNextTracked();
      G.events.emit("questTracked", TRACKED);
    }
    return true;
  }

  function fail(id) {
    const q = DEFS.get(id);
    if (!q) return false;
    const s = getState(id);
    if (s.status === "completed" || s.status === "failed") return false;
    s.status = "failed";
    if (q.onFail) safe("onFail:" + id, q.onFail);
    G.events.emit("questFailed", view(id)); // HUD banner plays its own error sting
    if (TRACKED === id) {
      TRACKED = pickNextTracked();
      G.events.emit("questTracked", TRACKED);
    }
    return true;
  }

  /**
   * Write a quest straight into the completed state without banners, jingles or
   * rewards (used when a new game skips the cryo intro). `stages` = the stage ids
   * to record as done in the log, in order.
   */
  function completeSilently(id, stages) {
    const q = DEFS.get(id);
    if (!q) return false;
    const s = getState(id);
    if (s.status === "completed") return false;
    s.status = "completed";
    s.t = s.t || (G.time ? G.time.elapsed : 0);
    s.log = (
      stages || q.stages.filter((x) => !x.sideObjective).map((x) => x.id)
    ).slice();
    s.stage = s.log[s.log.length - 1] || null;
    if (TRACKED === id) TRACKED = pickNextTracked();
    lib.markerCache.clear();
    return true;
  }

