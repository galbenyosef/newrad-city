// play-inline-553 09 — pos
// Lines 2497-2842 of readable/play-inline-553.pretty.js (statement-aligned).
  L.trigger({
    id: "comp_gugg_sighted",
    x: 160,
    z: -755,
    r: 34,
    cond: () => Q.stage("sq_tull") === "fetch" && !!following("tull"),
    fire() {
      bark(
        "tull",
        "The spiral. The core should be at the very top. Mind the robots — they were programmed to protect the art. I suppose we're the vandals now.",
        7,
        true,
      );
    },
  });

  // ------------------------------------------------------------------
  // Standing reactions & walk-outs
  // ------------------------------------------------------------------
  let farewellFor = null;
  G.events.on("standingChanged", (k0, delta) => {
    if (!delta || Math.abs(delta) < 40) return;
    const k = current();
    if (!k) return;
    if (!following(k)) return;
    L.later(1.0, () => bark(k, pick(delta > 0 ? cfg[k].good : cfg[k].bad), 4));
  });
  G.events.on("combatStart", () => {
    const k = current();
    if (!k || !following(k)) return;
    if (Math.random() < 0.55)
      L.later(0.4, () => bark(k, pick(cfg[k].combat), 3));
  });

  // ------------------------------------------------------------------
  // Controller (behaviour the combat AI doesn't model: distance, stance,
  // re-following after fights, homeward walks, location comments)
  // ------------------------------------------------------------------
  let tickT = 0,
    slowT = 0,
    aggroT = 0;
  const proxies = {};
  const LOCS = () => (G.LAYOUT && G.LAYOUT.LOCATIONS) || [];
  function farProxy(k, a) {
    let p = proxies[k];
    if (!p)
      p = proxies[k] = { pos: new THREE.Vector3(), dead: false, isProxy: true };
    const P = G.player.pos;
    let dx = a.pos.x - P.x,
      dz = a.pos.z - P.z;
    let d = Math.hypot(dx, dz);
    if (d < 0.5) {
      dx = Math.sin(G.player.yaw);
      dz = Math.cos(G.player.yaw);
      d = 1;
    }
    const want = 7.5;
    p.pos.set(
      P.x + (dx / d) * (want - 2.2),
      P.y,
      P.z + (dz / d) * (want - 2.2),
    );
    return p;
  }
  function engage(a, t) {
    if (typeof a.attack === "function") {
      try {
        a.attack(t);
        return;
      } catch (e) {
        /* fall through */
      }
    }
    // Mirror of combat's own enterCombat for a follower (no public API yet — see NOTES).
    try {
      a.target = t;
      a.inCombat = true;
      a.setState("combat");
      a.lastSeenT = now();
      a.aimT = now() + 0.35 + Math.random() * 0.3;
      a.lastKnown = (a.lastKnown || new THREE.Vector3()).copy(t.pos);
      if (Math.random() < 0.5) a.bark("alert", 1);
    } catch (e) {
      /* */
    }
  }
  function aggressiveScan(k, a) {
    if (a.state !== "follow" || a.inCombat) return;
    const P = G.player.pos;
    let list = [];
    try {
      list = G.actors.hostilesNear
        ? G.actors.hostilesNear(P, 32)
        : (G.actors.inRadius(P, 32) || []).filter(
            (o) => o.hostile && o.hostile(),
          );
    } catch (e) {
      list = [];
    }
    let best = null,
      bd = 1e9;
    for (const o of list) {
      if (
        !o ||
        o.dead ||
        o === a ||
        !o.inScene ||
        o.state === "dormant" ||
        o.questTruce
      )
        continue;
      const d = o.distTo(a.pos);
      if (d > 34 || d >= bd) continue;
      if (G.world.lineOfSight) {
        const e1 = a.eyePos
          ? a.eyePos()
          : new THREE.Vector3(a.pos.x, a.pos.y + 1.6, a.pos.z);
        const e2 = o.centerPos
          ? o.centerPos()
          : new THREE.Vector3(o.pos.x, o.pos.y + 1, o.pos.z);
        if (!G.world.lineOfSight(e1, e2)) continue;
      }
      best = o;
      bd = d;
    }
    if (best) engage(a, best);
  }
  function locationComment(k) {
    const P = G.player.pos;
    if (P.x >= (G.LAYOUT.INTERIOR_X_MIN || 1e9)) return;
    const s = st(k);
    s.saw = s.saw || {};
    const lines = cfg[k].loc;
    for (const l of LOCS()) {
      const key =
        l.id === "bethesda" || l.id === "belvedere" || l.id === "reservoir"
          ? "central_park"
          : l.id === "dumbo"
            ? "brooklyn_bridge"
            : l.id;
      if (!lines[key] || s.saw[key]) continue;
      if (Math.hypot(P.x - l.x, P.z - l.z) > Math.max(22, (l.r || 30) * 0.9))
        continue;
      if (bark(k, lines[key], 6)) s.saw[key] = true;
      return;
    }
  }
  /** Catch-up: a follower that has made no progress towards the player for ~5 s
   *  (wedged on geometry the steering can't route around) is moved to a free spot behind the
   *  player, out of view. Never mid-fight. */
  function unstick(k, a, s) {
    const d = a.distToPlayer();
    const want = s.far ? 13 : 9;
    if (d < want || a.inCombat || a.state !== "follow") {
      s._stuckN = 0;
      s._stuckD = d;
      return;
    }
    if (s._stuckD !== undefined && d > s._stuckD - 1.0)
      s._stuckN = (s._stuckN || 0) + 1;
    else s._stuckN = 0;
    s._stuckD = d;
    if (s._stuckN < 3) return;
    s._stuckN = 0;
    const P = G.player;
    const back = s.far ? 6 : 2.5;
    const sp = L.freeSpot(
      P.pos.x + Math.sin(P.yaw) * back,
      P.pos.z + Math.cos(P.yaw) * back,
      P.pos.y,
      { maxR: 5 },
    );
    if (sp && !sp.forced) {
      a.pos.set(sp.x, sp.y, sp.z);
      if (a.attach) {
        try {
          a.attach();
        } catch (e) {
          /* */
        }
      }
      s._stuckD = a.distToPlayer();
    }
  }
  function tickCompanion(k, slow) {
    const s = st(k);
    const a = actor(k);
    if (!a || a.dead) return;
    // Friendly fire past the warning: they turn on you.
    if (s.rec && a.hostile && a.hostile() && !s.hostile) {
      s.hostile = true;
      s.rec = false;
      a.essential = false;
      a.dialogue = null;
      syncTalent(k);
      L.notify(cfg[k].short + " has turned against you.");
      return;
    }
    if (s.hostile) return;
    if (s.rec && !s.wait) {
      a.faction = "player";
      a.essential = true;
      if (a.aiMode !== "follow") a.aiMode = "follow";
      if (
        !a.knockedOut &&
        a.state !== "knocked" &&
        (a.state === "idle" ||
          a.state === "search" ||
          (a.state === "move" && !a.moveGoal) ||
          !a.following)
      ) {
        try {
          a.follow("player");
        } catch (e) {
          /* */
        }
      }
      if (a.state === "follow") {
        if (s.far) a.followTarget = farProxy(k, a);
        else if (a.followTarget && a.followTarget.isProxy)
          a.followTarget = "player";
      }
      if (s.passive)
        a._nextFollowScan = now() + 5; // combat's follower scan stays quiet: fight only when attacked
      else if (a._nextFollowScan > now() + 1.5) a._nextFollowScan = 0;
      if (!s.passive && aggroT <= 0) aggressiveScan(k, a);
      if (slow) unstick(k, a, s);
      if (slow) {
        if (
          farewellFor === null &&
          cfg[k].leaves() &&
          G.state === "play" &&
          !(G.combat.inCombat && G.combat.inCombat()) &&
          !L.cineActive() &&
          a.distToPlayer() < 12
        ) {
          farewellFor = k;
          L.later(0.2, () => {
            farewellFor = null;
            if (st(k).rec && cfg[k].leaves() && G.state === "play")
              L.startDialogue(cfg[k].dlg, cfg[k].id);
          });
        }
        const P = G.player;
        if (
          P.hp < P.maxHp * 0.25 &&
          P.alive !== false &&
          (!s._hurtT || now() - s._hurtT > 60)
        ) {
          s._hurtT = now();
          bark(k, pick(cfg[k].hurt), 3.5, true);
        } else if (!(G.combat.inCombat && G.combat.inCombat())) {
          locationComment(k);
          if (!s._idleT) s._idleT = now() + 90 + Math.random() * 60;
          if (now() > s._idleT) {
            s._idleT = now() + 120 + Math.random() * 120;
            bark(k, pick(cfg[k].idle), 5);
          }
        }
      }
    } else if (s.rec && s.wait) {
      if (
        a.aiMode !== "guard" ||
        !a.home ||
        Math.hypot(a.home.x - s.wait.x, a.home.z - s.wait.z) > 1
      )
        setGuard(a, s.wait.x, s.wait.z, 1.5);
      if (s.rec && cfg[k].leaves() && slow) {
        /* they refuse when next spoken to (start node → farewell) */
      }
    } else {
      // Not hired: live at home. Walked home from far away? Arrive while the player isn't looking.
      const h = homeOf(k);
      a.faction = cfg[k].faction;
      if (
        a.aiMode !== "guard" ||
        !a.home ||
        Math.hypot(a.home.x - h.x, a.home.z - h.z) > 1
      )
        setGuard(a, h.x, h.z, 2);
      if (
        slow &&
        Math.hypot(a.pos.x - h.x, a.pos.z - h.z) > 25 &&
        a.distToPlayer() > 70
      ) {
        a.pos.set(h.x, h.y || 0, h.z);
        if (a.attach) {
          try {
            a.attach();
          } catch (e) {
            /* */
          }
        }
      }
    }
  }
  L.hook("update", function (dt, realDt) {
    if (G.isStub("actors")) return;
    tickT -= realDt;
    if (tickT > 0) return;
    tickT = 0.25;
    slowT -= 0.25;
    const slow = slowT <= 0;
    if (slow) slowT = 1.5;
    aggroT -= 0.25;
    const doAggro = aggroT <= 0;
    for (const k of KEYS) {
      try {
        tickCompanion(k, slow);
      } catch (e) {
        G.reportError("quests:companionTick:" + k, e);
      }
    }
    if (doAggro) aggroT = 1;
    if (slow) for (const k of KEYS) syncTalent(k);
  });

  // Keep followers with the player across doors, ferries and fast travel.
  function regroup() {
    for (const k of KEYS) {
      const a = following(k);
      if (!a) continue;
      L.later(0.2, () => {
        if (a.dead || !following(k)) return;
        if (Math.hypot(a.pos.x - G.player.pos.x, a.pos.z - G.player.pos.z) < 20)
          return;
        try {
          const p = G.player.pos,
            sp = L.freeSpot(p.x - 1.3, p.z + 1.3, p.y, { maxR: 4 });
          a.pos.set(sp.x, sp.y, sp.z);
          if (a.attach) a.attach();
          // a knocked-out companion is carried along but left to get up by itself: forcing 'follow' here
          // would skip combat's 'knocked' recovery and leave them at 1 HP / knockedOut forever
          if (!a.knockedOut && a.state !== "knocked") a.follow("player");
        } catch (e) {
          /* */
        }
      });
    }
  }
  G.events.on("doorTransition", regroup);
  G.events.on("teleport", regroup);

  // ------------------------------------------------------------------
  // Epilogue slides (called from 60_finale's ending)
  // ------------------------------------------------------------------
