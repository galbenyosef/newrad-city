// play-inline-510 01 — pos
// Lines 22-346 of readable/play-inline-510.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const C = G.__cmb;
  const U = G.util;

  const _a = new THREE.Vector3(),
    _b = new THREE.Vector3(),
    _c = new THREE.Vector3(),
    _d = new THREE.Vector3();
  const _e = new THREE.Vector3(),
    _f = new THREE.Vector3();
  const now = () => G.time.elapsed;

  // ------------------------------------------------------------------
  // Init per actor
  // ------------------------------------------------------------------
  C.initAI = function (a, def) {
    a.aiMode = def.ai || "wander";
    a.speed = 0;
    a.vel = new THREE.Vector3();
    a.nextPerceive = now() + Math.random() * 0.4;
    a.nextThink = now() + Math.random() * 2;
    a.attackCd = 0;
    a.burstLeft = 0;
    a.reloadT = 0;
    a.aimT = 0;
    a.lastSeenT = -99;
    a.canSeeTarget = false;
    a.stuckT = 0;
    a.detourT = 0;
    a.detour = null;
    a.feelT = 0;
    a.avoid = null;
    a.lastPos = new THREE.Vector3().copy(a.pos);
    a.coverPos = null;
    a.coverT = 0;
    a.strafeDir = Math.random() < 0.5 ? -1 : 1;
    a.strafeT = 0;
    a.grenadeCd = now() + 6 + Math.random() * 8;
    a.fledOnce = false;
    a.holdPos = !!def.holdPos;
    a.homeYaw = a.yaw;
    if (a.aiMode === "follow") a.follow("player");
    // Maniacs sometimes lie still among the corpses (they get up when you come close)
    if (
      def._dormantOk &&
      a.td.dormantChance &&
      Math.random() < a.td.dormantChance
    ) {
      a.setState("dormant");
      a.anim("dead");
    } else a.anim("idle");
    if (a.aiMode === "sit") a.anim("sit");
    if (a.aiMode === "kneel") a.anim("kneel");
  };

  // ------------------------------------------------------------------
  // Perception
  // ------------------------------------------------------------------
  /** How visible the player is right now (before distance/cone). */
  function playerVisibility() {
    const P = G.player;
    let v;
    if (P.sneaking) {
      const sneak = C.skill("stealth", 15);
      v = Math.max(0.08, 1 - sneak / 125) * (P.moveSpeed > 0.4 ? 1.25 : 0.5);
      if (C.mod("silentRun")) v *= 0.85;
    } else v = P.sprinting && !C.mod("silentRun") ? 4.5 : 3.5;
    // Light: night and darkness help; the goggle lamp gives you away
    const interior = G.LAYOUT.isInterior(P.pos.x);
    let dark = false;
    try {
      dark =
        !interior && !G.isStub("atmos") && G.atmos.isNight && G.atmos.isNight();
    } catch (e) {
      dark = false;
    }
    if (!dark && !interior && G.isStub("atmos")) {
      const h = G.time.hour;
      dark = h < 5.5 || h > 20.5;
    }
    if (dark) v *= 0.55;
    if (interior) v *= 0.8;
    if (P.lightOn) v *= 1.7;
    return v;
  }
  C.playerVisibility = playerVisibility;

  /** Enemy actors (not player) visible to a, nearest first (cheap: distance + LOS for nearest few). */
  function scanActorEnemies(a) {
    let best = null,
      bd = a.sight * 0.8;
    for (const o of C.list) {
      if (
        o === a ||
        o.dead ||
        !o.inScene ||
        o.state === "dormant" ||
        o.burrowed
      )
        continue;
      const d = Math.hypot(o.pos.x - a.pos.x, o.pos.z - a.pos.z);
      if (d >= bd) continue;
      if (!a.isEnemy(o)) continue;
      // Leash (integration): NPCs defending a home spot don't start faction fights far from it — keeps the
      // Chrysler raiders and the Grand Central guards from wiping each other out before the player arrives.
      if (
        a.home &&
        a.following !== "player" &&
        Math.hypot(o.pos.x - a.home.x, o.pos.z - a.home.z) >
          (a.home.r || 8) + 16
      )
        continue;
      if (d > 4 && !inCone(a, o.pos, a.state === "combat" ? 2.2 : 1.3))
        continue;
      if (!G.world.lineOfSight(a.eyePos(_a), o.centerPos(_b))) continue;
      best = o;
      bd = d;
    }
    return best;
  }
  /** Posted (holdPos) shooters lean over their ledge/parapet: sight lines and shots start ~2 m out
   *  toward the target so the perch's own floor/parapet doesn't block steep downward views. */
  C.leanOrigin = function (a, origin, toward) {
    if (!a.holdPos) return origin;
    const dx = toward.x - origin.x,
      dz = toward.z - origin.z,
      h = Math.hypot(dx, dz);
    if (h < 3) return origin;
    const k = Math.min(2.2, h * 0.3) / h;
    origin.x += dx * k;
    origin.z += dz * k;
    return origin;
  };
  function inCone(a, p, halfAngle) {
    const dx = p.x - a.pos.x,
      dz = p.z - a.pos.z;
    const d = Math.hypot(dx, dz) || 1;
    const fx = -Math.sin(a.yaw),
      fz = -Math.cos(a.yaw);
    return (dx * fx + dz * fz) / d > Math.cos(halfAngle);
  }

  function perceive(a, dtp) {
    const P = G.player;
    const wantsPlayer = a.isEnemy("player");
    const d = a.distToPlayer();
    const inInterior =
      G.LAYOUT.isInterior(a.pos.x) === G.LAYOUT.isInterior(P.pos.x);
    let sees = false;
    if (
      P.alive &&
      inInterior &&
      d < a.sight * 1.2 &&
      Math.abs(P.pos.y - a.pos.y) < (a.holdPos ? 150 : 40)
    ) {
      const combatish = a.state === "combat" || a.state === "search";
      // posted snipers scan a wide arc from their perch
      const cone =
        d < 3
          ? 3.2
          : a.holdPos
            ? combatish
              ? 2.6
              : 1.8
            : combatish
              ? 1.9
              : 1.2;
      if (inCone(a, P.pos, cone)) {
        _b.set(P.pos.x, P.pos.y + (P.sneaking ? 0.9 : 1.3), P.pos.z);
        sees = G.world.lineOfSight(C.leanOrigin(a, a.eyePos(_a), _b), _b);
      }
    }
    // Close-range hearing/feel: an un-sneaking player right behind you gets noticed
    const hearR =
      (P.sneaking ? 1.5 : 4 + a.perception * 0.8) *
      (P.moveSpeed > 0.5 ? 1.4 : 1);
    const heard =
      !sees &&
      P.alive &&
      inInterior &&
      d < hearR &&
      Math.abs(P.pos.y - a.pos.y) < 4;
    a.seesPlayer = sees;
    if (sees) {
      a.lastPlayerSeen = now();
      if (wantsPlayer && a.target === "player") {
        a.lastSeenT = now();
        a.lastKnown = a.lastKnown || new THREE.Vector3();
        a.lastKnown.copy(P.pos);
      }
    }
    // Awareness of the player (detection meter)
    if (wantsPlayer && a.state !== "combat") {
      // Trespass garrison (UN Plaza before MQ04): warnings instead of opening fire (40_population)
      const hold = !!(a.warden && C.wardenHold && C.wardenHold(a));
      if (sees) {
        const perF = 0.55 + a.perception * 0.09;
        const distF =
          Math.pow(C.clamp(1 - d / (a.sight * perF), 0, 1), 0.8) * 2;
        let rate = playerVisibility() * perF * distF;
        const moving = P.moveSpeed > 0.4;
        // A still figure is much harder to pick out (sneaking already folds movement in)
        if (!P.sneaking && !moving) rate *= 0.5;
        if (a.state === "search") rate *= 1.6;
        if (a.headCrippled) rate *= 0.5;
        // Reaction window ([CAUTION]): beyond 8 m nobody snaps onto you instantly
        if (d > 8) rate = Math.min(rate, noticeCap(a, moving));
        // …but right in their face, or while their friends are already shooting at you, it's instant
        if ((!P.sneaking && d < 4.5) || allyFightingPlayer(a))
          rate = Math.max(rate, 12);
        a.awareness += rate * dtp;
        a.cautionAt = (a.cautionAt || new THREE.Vector3()).copy(P.pos);
      } else if (heard) {
        a.awareness += (P.sneaking ? 0.35 : 1.2) * (1 - d / hearR) * dtp + 0.05;
        if (a.awareness > 0.5 && a.state !== "search") {
          a.faceTowards(P.pos.x, P.pos.z);
        }
      } else a.awareness = Math.max(0, a.awareness - 0.12 * dtp);
      if (hold) {
        a.awareness = Math.min(a.awareness, 0.6);
        C.wardenSaw(a, sees);
      } else if (a.awareness >= 1) {
        a.cautionUntil = 0;
        C.enterCombat(a, "player"); // (emits playerDetected)
      } else if (
        sees &&
        a.awareness > 0.5 &&
        (a.state === "idle" || a.state === "move")
      ) {
        // Half-noticed: stop, turn toward the shape, "Huh?" — the player's window to duck out of sight
        if (!(a.cautionUntil > now())) {
          if (!a._cautionBarkT || now() - a._cautionBarkT > 8) {
            a._cautionBarkT = now();
            if (a.voice && !a.isCreature) a.say(C.cautionBark(a.voice), 2.2);
            else if (a.td.sounds && a.td.sounds.idle)
              C.sfx(a.td.sounds.idle, { pos: a.pos, volume: 0.6, pitch: 1.15 });
          }
        }
        a.cautionUntil = now() + 1.6;
      } else if (
        !sees &&
        a.awareness > 0.4 &&
        (a.state === "idle" || a.state === "move")
      ) {
        // Lost sight of it (or only heard it): go and look where it was
        const lk = heard || !a.cautionAt ? P.pos : a.cautionAt;
        a.cautionUntil = 0;
        a.lastKnown = (a.lastKnown || new THREE.Vector3()).copy(lk);
        C.startSearch(a, lk);
      }
    }
    // Other enemies (opportunistic faction fights) — less often
    if (
      a.state !== "combat" ||
      (a.target !== "player" && (!a.target || a.target.dead))
    ) {
      if (!a._nextActorScan || now() > a._nextActorScan) {
        a._nextActorScan = now() + 0.8 + Math.random() * 0.6;
        const o = scanActorEnemies(a);
        if (o) C.enterCombat(a, o);
      }
    }
    // In combat: can we see our target?
    if (a.state === "combat" && a.target) {
      if (a.target === "player") a.canSeeTarget = sees;
      else {
        const t = a.target;
        a.canSeeTarget =
          !t.dead && G.world.lineOfSight(a.eyePos(_a), t.centerPos(_b));
        if (a.canSeeTarget) {
          a.lastSeenT = now();
          a.lastKnown = (a.lastKnown || new THREE.Vector3()).copy(t.pos);
        }
      }
    }
  }

  /** Max awareness gain per second beyond 8 m: movement, light and the goggle lamp matter. */
  function noticeCap(a, moving) {
    const P = G.player;
    let cap = 1.2 * (moving ? (P.sprinting ? 1.35 : 1) : 0.5);
    const interior = G.LAYOUT.isInterior(P.pos.x);
    let dark = false;
    try {
      dark =
        !interior && !G.isStub("atmos") && G.atmos.isNight && G.atmos.isNight();
    } catch (e) {
      dark = false;
    }
    if (!dark && !interior && G.isStub("atmos")) {
      const h = G.time.hour;
      dark = h < 5.5 || h > 20.5;
    }
    if (dark) cap *= 0.6;
    if (interior) cap *= 0.85;
    if (P.lightOn) cap *= 1.5;
    if (a.state === "search") cap *= 1.5;
    return cap;
  }
  /** A friend within 35 m is already fighting the player (and can see them) → instant detection. */
  function allyFightingPlayer(a) {
    if (!C.anyCombat) return false;
    for (const o of C.list) {
      if (
        o === a ||
        o.dead ||
        !o.inCombat ||
        o.target !== "player" ||
        !o.canSeeTarget
      )
        continue;
      if (
        o.faction !== a.faction &&
        G.combat.relation(o.faction, a.faction) !== "ally"
      )
        continue;
      if (Math.hypot(o.pos.x - a.pos.x, o.pos.z - a.pos.z) < 35) return true;
    }
    return false;
  }
  C.noticeCap = noticeCap;

  /** Hearing: something loud happened at pos. source = 'player' | actor. */
