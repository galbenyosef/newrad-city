// play-inline-573 03 — flags
// Lines 712-884 of readable/play-inline-573.pretty.js (statement-aligned).
  G.qx = QX;

  // ------------------------------------------------------------------
  // Trigger polling
  // ------------------------------------------------------------------
  let trigT = 0;
  function pollTriggers(dt) {
    trigT -= dt;
    if (trigT > 0) return;
    trigT = 0.2;
    const p = G.player.pos;
    for (const t of TRIGGERS) {
      if (t.once && FLAGS["trig_" + t.id]) continue;
      if (t._cool && G.time.real < t._cool) continue;
      let x = t.x,
        z = t.z;
      if (t.pos) {
        const pp = safe("trigpos", t.pos);
        if (!pp) continue;
        x = pp.x;
        z = pp.z;
      }
      if (x === undefined) {
        if (!t.cond || !safe("trigcond", t.cond)) continue;
      } else {
        const dx = p.x - x,
          dz = p.z - z;
        if (dx * dx + dz * dz > t.r * t.r) continue;
        if (t.y !== undefined && Math.abs(p.y - t.y) > (t.dy || 6)) continue;
        if (t.cond && !safe("trigcond:" + t.id, t.cond)) continue;
      }
      if (t.once) FLAGS["trig_" + t.id] = true;
      else t._cool = G.time.real + (t.cooldown || 3);
      safe("trigger:" + t.id, t.fire);
    }
  }
  function tickLater(dt) {
    if (!LATER.length || !(dt > 0)) return;
    const due = [];
    for (let i = LATER.length - 1; i >= 0; i--) {
      const e = LATER[i];
      if (e.gen !== gen) {
        LATER.splice(i, 1);
        continue;
      }
      e.t -= dt;
      if (e.t <= 0) {
        LATER.splice(i, 1);
        due.push(e);
      }
    }
    for (let i = due.length - 1; i >= 0; i--) safe("later", due[i].fn);
  }

  function clearSession() {
    for (const h of SESSION.splice(0)) {
      safe("clearSession", () => {
        if (h.interactable) G.world.removeInteractable(h.interactable);
        if (h.pickup) {
          const p = h.pickup;
          if (live("items") && G.items.removePickup && p.key !== undefined) {
            G.items.removePickup(p);
            return;
          }
          if (typeof p.remove === "function") p.remove();
          else if (p.object3d && p.object3d.parent)
            p.object3d.parent.remove(p.object3d);
          if (p.interactable) G.world.removeInteractable(p.interactable);
        }
      });
    }
  }

  // Remember collected pickups (only the one the player is standing at counts).
  function onItemAdded(id) {
    const P = G.player && G.player.pos;
    for (const k in QX.pickups) {
      const pk = QX.pickups[k];
      if (pk.id !== id || FLAGS["got_" + k]) continue;
      const h = pk.handle;
      const gone =
        h &&
        (h.collected ||
          h.taken ||
          h.removed ||
          (h.object3d && !h.object3d.parent));
      if (
        gone ||
        (P &&
          pk.pos &&
          Math.hypot(P.x - pk.pos.x, P.z - pk.pos.z) < 4.5 &&
          Math.abs(P.y - (pk.pos.y || 0)) < 4)
      )
        FLAGS["got_" + k] = true;
    }
  }
  function onActorKilled(actor) {
    if (actor && actor.id && actor.qxNpc) FLAGS["dead_" + actor.id] = true;
  }

  // ------------------------------------------------------------------
  // Save / load (own flags only; quest state is saved by the quests module)
  // ------------------------------------------------------------------
  G.save.register("quests_extra", {
    save() {
      return { flags: FLAGS };
    },
    load(d) {
      FLAGS = (d && d.flags) || {};
    },
  });

  function resetAll() {
    FLAGS = {};
    gen++;
    LATER.length = 0;
    QX.npcs = {};
    QX.pickups = {};
    clearSession();
    for (const t of TRIGGERS) t._cool = 0;
    QX.run("reset");
  }

  // ------------------------------------------------------------------
  // Registration
  // ------------------------------------------------------------------
  G.registerModule({
    name: "quests_extra",
    order: 62,
    init() {
      QX.run("items"); // rpg (40) is up: define items
      if (QX.qlive()) QX.run("quests");
      else
        console.warn(
          "[quests_extra] quests module absent — quest content disabled (NPCs and props still spawn).",
        );
      QX.run("register"); // collect dialogue trees + terminals
      QX.registerAll();
      G.events.on("initDone", () => {
        QX.registerAll(); // ui_interact (70) is live now
        if (!worldBuilt) {
          worldBuilt = true;
          QX.run("world");
        }
      });
      G.events.on("reset", resetAll);
      G.events.on("newGame", (opts) => {
        if (!worldBuilt) {
          worldBuilt = true;
          QX.run("world");
        }
        QX.run("spawn", Object.assign({ newGame: true }, opts || {}));
      });
      G.events.on("loaded", () => {
        if (!worldBuilt) {
          worldBuilt = true;
          QX.run("world");
        }
        QX.run("spawn", { loaded: true });
        QX.run("loaded");
      });
      G.events.on("itemAdded", onItemAdded);
      G.events.on("actorKilled", onActorKilled);
    },
    update(dt, realDt) {
      tickLater(dt);
      // 'always' hooks run in every state (visibility of interior roots, etc.)
      for (const fn of HOOKS.always) safe("always", () => fn(dt, realDt));
      if (G.state !== "play") return;
      pollTriggers(realDt);
      for (const fn of HOOKS.update) safe("update", () => fn(dt, realDt));
    },
  });
