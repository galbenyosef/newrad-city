// play-inline-510 04 — math
// Lines 1016-1361 of readable/play-inline-510.pretty.js (statement-aligned).
  function navFinish(S, reached) {
    const startK = navKey(S.six, S.siz);
    const endK = S.bestK;
    // A partial path must actually get us meaningfully closer
    const d0 = Math.hypot(S.gx - S.sx, S.gz - S.sz);
    if (endK === startK || (!reached && S.bestH > d0 - 2)) {
      NAV.stats.failed++;
      return "fail";
    }
    const cells = [];
    for (
      let k = endK, n = 0;
      k !== -1 && k !== undefined && n < 5000;
      k = S.par.get(k), n++
    )
      cells.push(k);
    cells.reverse();
    // string pulling over cells this search proved walkable
    const pts = cells.map((k) => ({
      x: Math.floor(k / 60000) - 30000 + 0.5,
      z: (k % 60000) - 30000 + 0.5,
    }));
    if (reached) pts.push({ x: S.gx, z: S.gz });
    const out = [];
    let i = 0;
    const from = { x: S.sx, z: S.sz };
    while (i < pts.length - 1) {
      let j = pts.length - 1;
      for (; j > i + 1; j--)
        if (navLineKnown(S, i === 0 ? from : pts[i], pts[j])) break;
      out.push(pts[j]);
      i = j;
    }
    if (!out.length) out.push(pts[pts.length - 1]);
    S.path = out;
    NAV.stats.found++;
    return "found";
  }
  /** Straight segment stays on cells the search expanded (known walkable)? */
  function navLineKnown(S, p, q) {
    const dx = q.x - p.x,
      dz = q.z - p.z,
      L = Math.hypot(dx, dz),
      n = Math.ceil(L / 0.35);
    for (let s = 1; s < n; s++) {
      const x = p.x + (dx * s) / n,
        z = p.z + (dz * s) / n;
      if (!S.closed.has(navKey(Math.floor(x), Math.floor(z)))) return false;
      // stay a little away from blocked neighbours (both sides of the line)
      if (
        !S.closed.has(navKey(Math.floor(x + 0.3), Math.floor(z))) &&
        !S.g.has(navKey(Math.floor(x + 0.3), Math.floor(z)))
      )
        return false;
      if (
        !S.closed.has(navKey(Math.floor(x - 0.3), Math.floor(z))) &&
        !S.g.has(navKey(Math.floor(x - 0.3), Math.floor(z)))
      )
        return false;
      if (
        !S.closed.has(navKey(Math.floor(x), Math.floor(z + 0.3))) &&
        !S.g.has(navKey(Math.floor(x), Math.floor(z + 0.3)))
      )
        return false;
      if (
        !S.closed.has(navKey(Math.floor(x), Math.floor(z - 0.3))) &&
        !S.g.has(navKey(Math.floor(x), Math.floor(z - 0.3)))
      )
        return false;
    }
    return true;
  }
  /** Knee-height ray: is the straight line to the goal free of walls/cars? */
  function clearWalk(a, gx, gz, d) {
    const L = Math.min(d, 30);
    if (L < 0.5) return true;
    _a.set(a.pos.x, a.pos.y + Math.min(0.75, (a.height || 1.8) * 0.5), a.pos.z);
    _dir.set((gx - a.pos.x) / d, 0, (gz - a.pos.z) / d);
    const h = G.world.raycast(_a, _dir, L, { ignoreTags: ["actor"] });
    return !(
      h &&
      h.dist < L - 0.3 &&
      !(h.collider && h.collider.maxY <= a.pos.y + NAV_STEP)
    );
  }
  const navCapable = (a) => !a.hover && !a.burrowed && !a.holdPos;
  /**
   * Move toward (gx,gz): straight steering while the way is clear, A* waypoints around walls,
   * cars and park walls when it isn't (or when steering gets stuck). Returns true on arrival.
   */
  C.navMove = function (a, gx, gz, speed, dt, stopDist) {
    stopDist = stopDist || 0.4;
    const dx = gx - a.pos.x,
      dz = gz - a.pos.z,
      d = Math.hypot(dx, dz);
    if (d <= stopDist) {
      a.speed = 0;
      if (a.nav) {
        a.nav.path = null;
        a.nav.search = null;
      }
      return true;
    }
    if (!navCapable(a)) return steerTo(a, gx, gz, speed, dt, stopDist);
    const N =
      a.nav ||
      (a.nav = {
        path: null,
        i: 0,
        gx,
        gz,
        search: null,
        checkT: Math.random() * 0.3,
        need: false,
        failUntil: 0,
        pathT: 0,
      });
    const t = now();
    // The goal moved a lot: the old plan is stale
    if (
      (N.path || N.search) &&
      Math.hypot(gx - N.gx, gz - N.gz) > Math.max(2.5, d * 0.3)
    ) {
      N.path = null;
      N.search = null;
      N.need = true;
      N.checkT = 0;
    }
    if (N.path) {
      let wp = N.path[N.i];
      while (
        wp &&
        N.i < N.path.length - 1 &&
        Math.hypot(wp.x - a.pos.x, wp.z - a.pos.z) < 0.8
      )
        wp = N.path[++N.i];
      const last = N.i >= N.path.length - 1;
      if (
        !wp ||
        (last && Math.hypot(wp.x - a.pos.x, wp.z - a.pos.z) < 0.8) ||
        t - N.pathT > 15 ||
        a.stuckT > 1.2
      ) {
        if (a.stuckT > 1.2) {
          N.need = true;
          N.checkT = 0;
        }
        N.path = null;
      } else {
        const wd = Math.hypot(wp.x - a.pos.x, wp.z - a.pos.z);
        C.steer(
          a,
          wp.x - a.pos.x,
          wp.z - a.pos.z,
          last ? Math.min(speed, (wd + 0.3) / Math.max(dt, 1e-3)) : speed,
          dt,
        );
        return false;
      }
    }
    N.checkT -= dt;
    if (N.checkT <= 0) {
      N.checkT = 0.45 + Math.random() * 0.2;
      N.need = a.stuckT > 0.35 || a.detourT > 0 || !clearWalk(a, gx, gz, d);
    }
    if (N.need && !N.search && t > N.failUntil) {
      N.search = navStart(a, gx, gz);
      N.gx = gx;
      N.gz = gz;
    }
    if (N.search) {
      const r = navRun(N.search);
      if (r === "found") {
        N.path = N.search.path;
        N.i = 0;
        N.pathT = t;
        N.search = null;
        N.need = false;
        a.detourT = 0;
        a.avoid = null;
        a.stuckT = 0;
        const wp = N.path[0];
        C.steer(a, wp.x - a.pos.x, wp.z - a.pos.z, speed, dt);
        return false;
      }
      if (r === "fail" || t - N.search.t0 > 4) {
        N.search = null;
        N.failUntil = t + 1.2 + Math.random();
        N.need = false;
      }
    }
    // Clear line (or still thinking): classic steering with feelers & stuck detours
    return steerTo(a, gx, gz, speed, dt, stopDist);
  };
  /** Is the actor currently following / computing a path? */
  C.navBusy = (a) => !!(a.nav && (a.nav.path || a.nav.search));
  /** Debug / probes: synchronous path query between two points (world x,z). */
  C.navDebugPath = function (x0, z0, x1, z1, opts) {
    const fake = {
      pos: new THREE.Vector3(
        x0,
        G.world.groundHeight(x0, z0, (opts && opts.y) || 0.6, 0.2),
        z0,
      ),
      height: 1.8,
      td: {},
    };
    const S = navStart(fake, x1, z1);
    let r = "pending",
      guard = 0;
    while (r === "pending" && guard++ < 400) {
      NAV.frame = -1;
      r = navRun(S);
    }
    return { result: r, nodes: S.nodes, path: S.path };
  };

  /** Vertical: ground snap, gravity, hover, amphibious wading. */
  function vertical(a, dt) {
    const gh = G.world.groundHeight(
      a.pos.x,
      a.pos.z,
      a.pos.y + 0.6,
      a.radius * 0.4,
    );
    if (a.hover) {
      const bob = Math.sin(now() * 2.1 + a.uid) * 0.12;
      const want =
        Math.max(gh, a.td.amphibious ? G.world.waterLevel : gh) +
        a.hover +
        bob +
        (a.hoverBoost || 0);
      a.pos.y = U.damp(a.pos.y, want, 3, dt);
      return;
    }
    let floor = gh;
    if (a.td.amphibious && gh < G.world.waterLevel - 0.9)
      floor = G.world.waterLevel - 0.9;
    if (a.pos.y > floor + 0.05) {
      a.vy -= 20 * dt;
      a.pos.y += a.vy * dt;
      if (a.pos.y <= floor) {
        a.pos.y = floor;
        a.vy = 0;
      }
    } else {
      a.pos.y = floor;
      a.vy = 0;
    }
  }
  C.vertical = vertical;

  // ------------------------------------------------------------------
  // Target helpers
  // ------------------------------------------------------------------
  function targetPos(a, out) {
    const t = a.target;
    if (t === "player") return out.copy(G.player.pos);
    return out.copy(t.pos);
  }
  function targetAimPoint(a, out) {
    const t = a.target;
    if (t === "player") {
      const P = G.player;
      return out.set(P.pos.x, P.pos.y + (P.sneaking ? 0.75 : 1.2), P.pos.z);
    }
    if (t.hitParts && t.inScene) return C.partCenter(t, "torso", out);
    return t.centerPos(out);
  }
  function targetValid(a) {
    const t = a.target;
    if (!t) return false;
    if (t === "player") return G.player.alive && a.isEnemy("player");
    return !t.dead && !t.removed && a.isEnemy(t);
  }
  function pickNewTarget(a) {
    // Player first if hostile & recently seen
    if (
      a.isEnemy("player") &&
      G.player.alive &&
      a.distToPlayer() < a.sight &&
      (a.seesPlayer || now() - (a.lastPlayerSeen || -99) < 3)
    )
      return "player";
    return scanActorEnemies(a);
  }

  // ------------------------------------------------------------------
  // Attacks
  // ------------------------------------------------------------------
  /** Natural melee attack (creatures, fists, melee weapons): windup then resolve. */
  function startMelee(a, atk) {
    a.attackCd = atk.cooldown * (0.85 + Math.random() * 0.3);
    a.pendingMelee = { t: now() + (atk.windup || 0.3), atk };
    a.oneShot("attack_melee");
    if (atk.sound && atk.sound !== "melee_swing")
      C.sfx(atk.sound, { pos: a.pos, volume: 0.7, pitch: a.td.boss ? 0.7 : 1 });
    else C.sfx("melee_swing", { pos: a.pos, volume: 0.6 });
  }
  function resolvePendingMelee(a) {
    const pm = a.pendingMelee;
    if (!pm || now() < pm.t) return;
    a.pendingMelee = null;
    const atk = pm.atk;
    const lvlScale =
      1 + ((atk.dmgLvl || 0) * (a.level - 1)) / Math.max(1, atk.dmg);
    const dmg = atk.dmg * lvlScale * a.damageMult;
    G.combat.melee({
      from: a,
      range: atk.range + a.radius,
      arc: atk.slam ? Math.PI : 1.2,
      damage: dmg,
      type: atk.type || "melee",
      knock: atk.knock || 0,
      slam: atk.slam || 0,
      rads: atk.rads || 0,
      poison: atk.poison || null,
      weaponId: a.weapon && a.weapon.melee ? a.weaponId : null,
    });
  }
  function meleeAttackDef(a) {
    if (a.weapon && a.weapon.melee) {
      const w = a.weapon;
      return {
        kind: "melee",
        dmg:
          w.damage *
          (w.skill === "unarmed" ? 1 : 1) *
          (a.td.boss ? 1.5 : 1) *
          (a.type === "brute" ? 1.3 : 1),
        dmgLvl: 0,
        range: Math.max(1.4, w.range * 0.9),
        cooldown: 1 / Math.max(0.3, w.rof) + 0.35,
        windup: 0.3,
        type: "melee",
        sound: "melee_swing",
      };
    }
    return a.natural && a.natural.kind === "melee"
      ? a.natural
      : a.natural && a.natural.alt && a.natural.alt.kind === "melee"
        ? a.natural.alt
        : C.NATURAL.fists;
  }

  /** Ranged shot (weapon or natural ranged). Returns true if fired. */
