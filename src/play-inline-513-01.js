// play-inline-513 01 — math
// Lines 30-367 of readable/play-inline-513.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const C = G.__cmb;

  C.groups = new Map(); // id → group
  C.groupSave = {}; // loaded group states (applied at populate)
  const SPAWN_R = 260,
    DESPAWN_ROAM_R = 280;
  const RESPAWN_DAYS = 3;
  const gameDay = () => (G.time.day || 1) + (G.time.hour || 0) / 24;

  // ------------------------------------------------------------------
  // Spawn point validation
  // ------------------------------------------------------------------
  /** Is (x,z) a free standing spot at ground level y? */
  C.freeSpot = function (x, z, r, yRef, allowWater) {
    if (!G.LAYOUT.isLand(x, z) && !allowWater) return null;
    const th = G.world.terrainHeight(x, z);
    if (th < G.world.waterLevel - 0.2 && !allowWater) return null;
    const y = G.world.groundHeight(
      x,
      z,
      (yRef === undefined ? 0 : yRef) + 1.0,
      r * 0.5,
    );
    const cs = G.world.query(
      x - r - 0.5,
      z - r - 0.5,
      x + r + 0.5,
      z + r + 0.5,
    );
    for (const c of cs) {
      if (c.maxY <= y + 0.6 || c.minY >= y + 1.8) continue;
      if (G.world.pointInCollider(c, x, z, r)) return null;
    }
    return y;
  };
  function nearWater(x, z, dist) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      if (
        G.world.terrainHeight(x + Math.sin(a) * dist, z + Math.cos(a) * dist) <
        G.world.waterLevel
      )
        return true;
    }
    return false;
  }
  function anchor(siteId, name) {
    if (G.isStub("landmarks") || typeof G.landmarks.getAnchor !== "function")
      return null;
    try {
      const v = G.landmarks.getAnchor(siteId, name);
      return v && typeof v.x === "number" ? v : null;
    } catch (e) {
      return null;
    }
  }
  /** Location id → landmark site id (for anchors) when they differ. */
  const LOC_SITE = { wall_street: "nyse", liberty: "statue_of_liberty" };
  C.siteFor = (loc) => LOC_SITE[loc.id] || loc.id;
  const now = () => G.time.elapsed;
  /** Quest state, read defensively at call time. */
  function qDone(id) {
    try {
      return (
        !G.isStub("quests") &&
        typeof G.quests.isComplete === "function" &&
        !!G.quests.isComplete(id)
      );
    } catch (e) {
      return false;
    }
  }
  function qFlag(name) {
    try {
      return !G.isStub("quests") && typeof G.quests.flag === "function"
        ? G.quests.flag(name)
        : undefined;
    } catch (e) {
      return undefined;
    }
  }

  // ------------------------------------------------------------------
  // Level shaping for sites that were one-shotting under-levelled players
  // ------------------------------------------------------------------
  /** Target member level for a location right now (null = use loc.level ± 1 as before). */
  function scaledLevel(loc) {
    const pl = C.playerLevel(),
      L = loc.level || 1;
    if (loc.id === "un_hq")
      return wardenRulesActive("un_hq")
        ? C.clamp(Math.max(6, pl + 2), 1, L)
        : Math.min(L, pl + 4);
    if (loc.id === "liberty") return Math.max(1, Math.min(L, pl + 4));
    if (loc.id === "north_woods" && !denOpen())
      return Math.min(L, Math.max(4, pl + 6));
    if (loc.id === "reservoir") return Math.max(1, Math.min(L, pl + 3)); // shellbacks close to the start
    return null;
  }
  /** Re-level a living actor in place (keeps its HP fraction, limb condition and rank name). */
  C.relevelActor = function (a, lvl) {
    lvl = Math.max(1, Math.round(lvl));
    if (a.dead || a.level === lvl) return;
    const frac = a.maxHp > 0 ? a.hp / a.maxHp : 1;
    const old = a.maxHp;
    let hp = Math.round(a.td.hp + (a.td.hpLvl || 5) * (lvl - 1));
    if (a.isBoss) hp = Math.round(hp * 1.7);
    a.level = lvl;
    a.maxHp = hp;
    a.hp = Math.max(1, Math.round(hp * frac));
    for (const k in a.limbs) {
      const l = a.limbs[k];
      const r = hp / Math.max(1, old);
      l.max *= r;
      l.hp *= r;
    }
    if (!a.def.name && !a.isBoss) {
      const n = C.rankName(a.type, lvl, a.def);
      if (n) a.name = n;
    }
  };

  // ------------------------------------------------------------------
  // Trespass wardens: the UN Plaza garrison is a guarded post before
  // the main quest's faction chapter (MQ04) is resolved. They watch you ([CAUTION]),
  // warn, give a last warning, and open fire after ~5 s on the plaza — or at
  // once if you shoot. They don't chase a retreating trespasser across town.
  // ------------------------------------------------------------------
  C.WARDEN_ZONES = { un_hq: { r: 40, warnR: 68, grace: 5, leash: 22 } };
  C.wardens = new Map();
  function wardenState(id) {
    let w = C.wardens.get(id);
    if (w) return w;
    const Z = C.WARDEN_ZONES[id],
      loc = G.LAYOUT.LOCATIONS.find((l) => l.id === id);
    if (!Z || !loc) return null;
    w = {
      id,
      x: loc.x,
      z: loc.z,
      r: Z.r,
      warnR: Z.warnR,
      grace: Z.grace,
      leash: Z.leash,
      t: 0,
      stage: 0,
      lastWarnT: -99,
      provokedUntil: 0,
      seenT: -99,
    };
    C.wardens.set(id, w);
    return w;
  }
  function wardenRulesActive(id) {
    if (id !== "un_hq") return false;
    if (qDone("mq04")) return false; // resolved: the Continuity is simply hostile (or your ally)
    if (qFlag("con_hostile")) return false; // refused the Continuity / shot up the plaza: no more warnings
    return true;
  }
  C.wardenRulesActive = wardenRulesActive;
  /** Is this garrison member holding fire (warning phase)? */
  C.wardenHold = function (a) {
    if (!a.warden || a.wasFriendly || a.hostOverride === true || a.frenzied)
      return false;
    const w = wardenState(a.warden);
    if (!w) return false;
    if (w.provokedUntil > now()) return false;
    return wardenRulesActive(w.id);
  };
  function wardenMembers(w) {
    const g = C.groups.get(w.id);
    return g ? g.actors.filter((a) => !a.dead && !a.removed) : [];
  }
  function wardenSpeaker(w) {
    const P = G.player;
    let best = null,
      bd = 1e9;
    for (const a of wardenMembers(w)) {
      if (a.isRobot || !a.hostile()) continue;
      const d = a.distToPlayer() - (a.seesPlayer ? 20 : 0);
      if (d < bd) {
        bd = d;
        best = a;
      }
    }
    return best;
  }
  function wardenWarn(w, kind) {
    w.lastWarnT = now();
    const s = wardenSpeaker(w);
    if (s) {
      s.say(C.pick(C.TRESPASS_BARKS[kind]), kind === "warn" ? 4.5 : 3.5);
      s.faceTowards(G.player.pos.x, G.player.pos.z);
    }
    const eb = wardenMembers(w).find(
      (a) => a.type === "sky_eye" && a.distToPlayer() < 60,
    );
    if (eb) {
      C.sfx("skyeye_chatter", { pos: eb.pos, volume: 0.9 });
      if (!s || kind === "warn") eb.say(C.pick(C.TRESPASS_BARKS.sky_eye), 4);
    }
    if (kind === "last") C.sfx("caution", { volume: 0.6 });
  }
  /** Perception hook (holding members): they watch the player instead of engaging. */
  C.wardenSaw = function (a, sees) {
    const w = wardenState(a.warden);
    if (!w) return;
    const P = G.player;
    const dz = Math.hypot(P.pos.x - w.x, P.pos.z - w.z);
    if (sees) {
      w.seenT = now();
      if (dz < w.warnR) {
        a.cautionAt = (a.cautionAt || new THREE.Vector3()).copy(P.pos);
        a.cautionUntil = now() + 1.2;
        a.awareness = Math.max(a.awareness, 0.45);
      }
    }
  };
  /** Hearing hook: gunfire near the post ends the warnings; footsteps just turn heads. */
  C.wardenNoise = function (a, kind) {
    const w = wardenState(a.warden);
    if (!w) return;
    const P = G.player;
    const dz = Math.hypot(P.pos.x - w.x, P.pos.z - w.z);
    if ((kind === "gun" || kind === "explosion") && dz < w.warnR + 20) {
      C.provokeWarden(a.warden, "gunfire");
      return;
    }
    if (dz < w.warnR) {
      a.cautionAt = (a.cautionAt || new THREE.Vector3()).copy(P.pos);
      a.cautionUntil = now() + 1.5;
      a.awareness = Math.max(a.awareness, 0.35);
    }
  };
  C.provokeWarden = function (id, why) {
    const w = wardenState(id);
    if (!w || !wardenRulesActive(id)) return;
    const was = w.provokedUntil > now();
    w.provokedUntil = now() + 90;
    w.t = 0;
    w.stage = 3;
    if (was) return;
    let barked = why === "attacked";
    for (const a of wardenMembers(w)) {
      if (!a.hostile()) continue;
      a.cautionUntil = 0;
      a.awareness = 1;
      if (!barked && !a.isRobot) {
        barked = true;
        a.say(C.pick(C.TRESPASS_BARKS.open), 3);
      }
      C.enterCombat(a, "player", 0.15 + Math.random() * 0.45);
    }
  };
  function updateWardens(dt) {
    if (!C.wardens.size && !C.groups.has("un_hq")) return;
    const P = G.player,
      t = now();
    for (const id in C.WARDEN_ZONES) {
      const g = C.groups.get(id);
      if (!g || g.state !== "active") continue;
      const w = wardenState(id);
      if (!w) continue;
      const alive = wardenMembers(w);
      if (!alive.length || !wardenRulesActive(id)) continue;
      const d = Math.hypot(P.pos.x - w.x, P.pos.z - w.z);
      if (w.provokedUntil > t) {
        const fighting = alive.filter(
          (a) => a.state === "combat" && a.target === "player",
        );
        // Leash: a guarded post doesn't chase a retreating trespasser across Midtown
        for (const a of fighting) {
          const hd = a.home
            ? Math.hypot(a.pos.x - a.home.x, a.pos.z - a.home.z)
            : 0;
          if (d > w.warnR + 35 && hd > w.leash) {
            C.leaveCombat(a, "idle");
            a.awareness = 0.3;
            a.wanderGoal = null;
          }
        }
        if (fighting.length && d < w.warnR + 60)
          w.provokedUntil = Math.max(w.provokedUntil, t + 20);
        else if (!fighting.length && d > w.warnR + 60) {
          w.provokedUntil = 0;
          w.stage = 0;
          w.t = 0;
        }
        continue;
      }
      if (!P.alive || G.LAYOUT.isInterior(P.pos.x)) {
        w.t = 0;
        continue;
      }
      const watched = t - w.seenT < 1.5 || d < w.r;
      if (d < w.warnR && watched && w.stage === 0) {
        w.stage = 1;
        wardenWarn(w, "warn");
      }
      if (d < w.r) {
        w.t += dt;
        if (w.stage < 2 && w.t > w.grace * 0.45) {
          w.stage = 2;
          wardenWarn(w, "last");
        }
        if (w.t >= w.grace) C.provokeWarden(id, "trespass");
      } else {
        w.t = Math.max(0, w.t - dt * 0.5);
        if (d > w.warnR + 8 && w.stage > 0) {
          if (t - w.lastWarnT < 40) {
            const s = wardenSpeaker(w);
            if (s && s.distToPlayer() < 90)
              s.say(C.pick(C.TRESPASS_BARKS.leave), 3);
          }
          w.stage = 0;
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // The North Woods den: ripjaws sleep (wake at ~13 m or on gunfire);
  // only one is home until the player is level 8+ or has finished MQ03.
  // A warning set-piece (bones + a hand-painted DANGER sign) marks the ridge.
  // ------------------------------------------------------------------
  const DEN_ID = "north_woods";
  function denOpen() {
    return C.playerLevel() >= 8 || qDone("mq03");
  }
  function makeDormant(a, wakeR) {
    a.denWake = wakeR || 13;
    a.setState("dormant");
    a.anim("dead");
  }
  C.setPieces = [];
