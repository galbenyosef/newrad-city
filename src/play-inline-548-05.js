// play-inline-548 05 — lib
// Lines 1726-2066 of readable/play-inline-548.pretty.js (statement-aligned).
  lib.resolveMarker = (m) => resolveMarkerSpec(m);
  /** Raw (not door-redirected) objective markers of any active quest (the main story's proxy stages use it). */
  lib.questMarkers = (id) => rawMarkers(id);
  lib.questView = (id) => view(id);
  /** Absorb a side quest into a main quest (see ABSORB). */
  lib.absorb = (sideId, mainId) => {
    ABSORB[sideId] = mainId;
  };
  lib.absorbed = (sideId) => ABSORB[sideId] || null;
  lib.isHidden = (id) => hiddenNow(id);
  lib.redirectMarker = (m) => redirect(m);
  lib.stageDef = stageDef;
  lib.isWorldBuilt = () => worldBuilt;

  // ------------------------------------------------------------------
  // Fallbacks when props / items modules are absent
  // ------------------------------------------------------------------
  let fbMats = null;
  function fbMat() {
    if (fbMats) return fbMats;
    fbMats = {
      body: new THREE.MeshStandardMaterial({
        color: 0x6b6452,
        roughness: 0.7,
        metalness: 0.4,
      }),
      screen: new THREE.MeshStandardMaterial({
        color: 0x1a0f04,
        emissive: 0xffa53a,
        emissiveIntensity: 0.8,
        roughness: 0.3,
      }), // amber teletype glow
      paper: new THREE.MeshStandardMaterial({
        color: 0xd9ceb0,
        roughness: 0.9,
      }),
      tape: new THREE.MeshStandardMaterial({
        color: 0x3a3a40,
        roughness: 0.4,
        metalness: 0.5,
      }),
    };
    for (const k in fbMats) fbMats[k].userData.shared = true;
    return fbMats;
  }
  function fallbackTerminal(terminalId, pos, yaw) {
    const m = fbMat();
    const g = new THREE.Group();
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.6), m.body);
    desk.position.y = 0.4;
    g.add(desk);
    const mon = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 0.5), m.body);
    mon.position.set(0, 1.08, -0.02);
    g.add(mon);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.36), m.screen);
    scr.position.set(0, 1.1, 0.235);
    g.add(scr);
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.2), m.body);
    kb.position.set(0, 0.83, 0.18);
    g.add(kb);
    g.position.set(pos.x, pos.y || 0, pos.z);
    g.rotation.y = yaw;
    G.scene.add(g);
    const col = G.world.addCollider(
      pos.x,
      pos.z,
      1.1,
      0.6,
      pos.y || 0,
      (pos.y || 0) + 1.35,
      yaw,
      { tag: "prop" },
    );
    const it = G.world.addInteractable({
      pos: V3(pos.x, (pos.y || 0) + 1.1, pos.z),
      radius: 0.7,
      label: "Terminal",
      verb: "Access",
      onInteract() {
        if (!G.isStub("terminals")) G.terminals.open(terminalId);
        else lib.notify("The terminal flickers but nothing happens.");
      },
    });
    return { object3d: g, interactable: it, collider: col, fallback: true };
  }
  function fallbackPickup(key, id, n, pos) {
    const m = fbMat();
    const def = !G.isStub("items") && G.items.get ? G.items.get(id) : null;
    const isTape = !!(def && (def.reel || def.type === "tape")); // tape reels get a small box, notes a sheet of paper
    const mesh = new THREE.Mesh(
      isTape
        ? new THREE.BoxGeometry(0.14, 0.03, 0.1)
        : new THREE.BoxGeometry(0.22, 0.01, 0.3),
      isTape ? m.tape : m.paper,
    );
    const y = (pos.y || 0) + 0.05;
    mesh.position.set(pos.x, y, pos.z);
    G.scene.add(mesh);
    const h = { object3d: mesh };
    h.interactable = G.world.addInteractable({
      pos: V3(pos.x, y, pos.z),
      radius: 0.5,
      label: def ? def.name : id,
      verb: "Take",
      onInteract() {
        lib.give(id, n);
        G.world.removeInteractable(h.interactable);
        G.scene.remove(mesh);
        lib.setFlag("got_" + key);
        G.events.emit("itemAdded", id, n);
      },
    });
    return h;
  }

  // ------------------------------------------------------------------
  // Game-time scheduler, camera scripts, overlays
  // ------------------------------------------------------------------
  const LATER = []; // [{t, fn, tag, gen}] — see lib.later
  let CINE = null; // active lib.cinematic
  const OVERLAYS = []; // DOM washes to remove on reset
  function tickLater(dt) {
    if (!LATER.length || !(dt > 0)) return;
    // Snapshot: callbacks may schedule more work (runs next tick at the earliest).
    const due = [];
    for (let i = LATER.length - 1; i >= 0; i--) {
      const e = LATER[i];
      if (e.gen !== lib.gen) {
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
  function tickCine(dt) {
    if (!CINE) return;
    if (CINE.gen !== lib.gen) {
      CINE = null;
      if (G.player) G.player.frozen = false;
      return;
    }
    CINE.t += dt;
    const t = Math.min(1, CINE.t / CINE.dur),
      e = t * t * (3 - 2 * t);
    const c = CINE;
    safe("cine", () => c.step(e, t));
    if (t >= 1 && CINE === c) {
      CINE = null;
      if (G.player) G.player.frozen = false;
      if (c.done) safe("cine", c.done);
    }
  }
  function clearScheduled() {
    LATER.length = 0;
    if (CINE) {
      CINE = null;
      if (G.player) G.player.frozen = false;
    }
    for (const el of OVERLAYS.splice(0)) {
      try {
        el.remove();
      } catch (e) {
        /* gone */
      }
    }
  }

  // ------------------------------------------------------------------
  // Local truce zones (see lib.factionTruce)
  // ------------------------------------------------------------------
  const TRUCE_LIVE = new Map(); // id -> {id, faction, x, z, r, cond} (cond'd, in-memory)
  function truceZones() {
    if (!FLAGS.__truces || typeof FLAGS.__truces !== "object")
      FLAGS.__truces = {};
    return FLAGS.__truces;
  }
  /** Stand down every not-yet-processed actor of the zone's faction inside it. */
  function applyTruceZone(id, t) {
    if (!t) return 0;
    let n = 0;
    for (const a of lib.actorsOf(t.faction)) {
      if (a.questTruce === id || !a.setHostile) continue; // processed already (and maybe re-angered by the player since)
      if (Math.hypot(a.pos.x - t.x, a.pos.z - t.z) > t.r) continue;
      if (a.wasFriendly && a.hostOverride === true) continue; // the player shot at them: combat's call
      a.questTruce = id;
      safe("truce", () => a.setHostile(false));
      n++;
    }
    return n;
  }
  /** Lift a zone: its actors return to the normal faction relation. */
  function revertTruceZone(id) {
    for (const a of G.isStub("actors") || !G.actors.list
      ? []
      : safe("list", () => G.actors.list()) || []) {
      if (!a || a.questTruce !== id) continue;
      delete a.questTruce;
      if (!a.dead && a.setHostile && a.hostOverride === false)
        safe("truce", () => a.setHostile(undefined));
    }
  }
  let truceT = 0;
  function pollTruces(dt) {
    truceT -= dt;
    if (truceT > 0) return;
    truceT = 1;
    const zs = truceZones();
    for (const id in zs) applyTruceZone(id, zs[id]);
    for (const [id, t] of TRUCE_LIVE) {
      const on = !t.cond || !!safe("truceCond:" + id, t.cond);
      if (on) {
        t.off = false;
        applyTruceZone(id, t);
      } else if (!t.off) {
        t.off = true;
        revertTruceZone(id);
      }
    }
  }

  // ------------------------------------------------------------------
  // Trigger + objective polling
  // ------------------------------------------------------------------
  let trigTimer = 0;
  function pollTriggers(dt) {
    trigTimer -= dt;
    if (trigTimer > 0) return;
    trigTimer = 0.2;
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
        if (Math.hypot(p.x - x, p.z - z) > t.r) continue;
        if (t.y !== undefined && Math.abs(p.y - t.y) > (t.dy || 6)) continue;
        if (t.cond && !safe("trigcond:" + t.id, t.cond)) continue;
      }
      if (t.once) FLAGS["trig_" + t.id] = true;
      else t._cool = G.time.real + (t.cooldown || 3);
      safe("trigger:" + t.id, t.fire);
    }
  }

  /** Has a pickup handle left the world (collected)? Handles differ per items module. */
  function pickupTaken(pk) {
    const h = pk && pk.handle;
    if (!h) return false;
    if (h.collected || h.taken || h.removed) return true;
    const o = h.object3d || h.mesh || (h.isObject3D ? h : null);
    return !!(o && !o.parent);
  }

  // ------------------------------------------------------------------
  // Goggles gate: until the hero picks up his VIGIL goggles in the cryo prep
  // room there is no menu, map or quest log. Quests update before ui_hud each
  // frame, so consuming the action here stops the goggles / map / journal /
  // lamp from opening. Only while MQ01 is active (never blocks skipped intros).
  // ------------------------------------------------------------------
  const GATED = ["goggles", "map", "journal", "light"];
  function gogglesGate() {
    if (
      FLAGS.got_goggles ||
      G.SHOT ||
      !isActive("mq01") ||
      !G.input ||
      !G.input.actionPressed
    )
      return;
    for (const act of GATED) {
      let down = false;
      try {
        down = G.input.actionPressed(act);
      } catch (e) {
        down = false;
      }
      if (!down) continue;
      if (G.input.consumeAction)
        safe("consumeAction", () => G.input.consumeAction(act));
      const now = G.time.real;
      if (!(lib._gogNagT > now)) {
        lib._gogNagT = now + 2.5;
        lib.notify("You haven't found your VIGIL goggles yet.");
        lib.sfx("ui_error");
      }
    }
  }

  // Track item pickups & deaths of named NPCs.
  function onActorKilled(actor, killer) {
    if (!actor) return;
    if (actor.id && lib.npcs[actor.id] === actor)
      FLAGS["dead_" + actor.id] = true;
    else if (actor.id && actor.questNpc) FLAGS["dead_" + actor.id] = true;
  }

  // ------------------------------------------------------------------
  // Save / load
  // ------------------------------------------------------------------
  G.save.register("quests", {
    save() {
      const q = {};
      for (const [id, s] of STATE)
        if (s.status !== "inactive")
          q[id] = { s: s.status, st: s.stage, log: s.log.slice(), t: s.t };
      return { q, flags: FLAGS, tracked: TRACKED };
    },
    load(d) {
      STATE.clear();
      FLAGS = {};
      TRACKED = null;
      if (!d) return;
      for (const id in d.q || {}) {
        const x = d.q[id];
        STATE.set(id, {
          status: x.s,
          stage: x.st,
          log: x.log || [],
          t: x.t || 0,
        });
      }
      FLAGS = d.flags || {};
      TRACKED = d.tracked || null;
      lib.hintsShown = {};
    },
  });

