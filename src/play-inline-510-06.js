// play-inline-510 06 — math
// Lines 1666-1957 of readable/play-inline-510.pretty.js (statement-aligned).
  function tryFlank(a, pd) {
    if (
      a.holdPos ||
      !a.td.human ||
      a.following ||
      a.hp < a.maxHp * 0.5 ||
      (G.LAYOUT.isInterior(a.pos.x) && Math.random() < 0.5)
    )
      return null;
    const t = now();
    if (a._flankCd && t < a._flankCd) return null;
    const squad = squadOf(a);
    if (
      squad.length < 2 ||
      squad.some((o) => o._flankUntil && t < o._flankUntil)
    )
      return null;
    // the member farthest from the squad's centre (already out on a wing) takes it
    const tp = targetPos(a, _c);
    let cx = a.pos.x,
      cz = a.pos.z;
    for (const o of squad) {
      cx += o.pos.x;
      cz += o.pos.z;
    }
    cx /= squad.length + 1;
    cz /= squad.length + 1;
    const mine = Math.hypot(a.pos.x - cx, a.pos.z - cz);
    if (
      squad.some(
        (o) =>
          Math.hypot(o.pos.x - cx, o.pos.z - cz) > mine + 1 &&
          !(o._flankCd && t < o._flankCd) &&
          o.td.human &&
          o.hp >= o.maxHp * 0.5,
      )
    )
      return null;
    const main = Math.atan2(cx - tp.x, cz - tp.z);
    const side =
      Math.sin(main) * (a.pos.z - cz) - Math.cos(main) * (a.pos.x - cx) >= 0
        ? 1
        : -1; // go round the side we're already on
    const c =
      findCover(a, Math.max(8, pd * 0.8), {
        base: main + side * 1.3,
        arc: 0.9,
        maxTravel: 32,
      }) ||
      findCover(a, Math.max(8, pd * 0.8), {
        base: main - side * 1.3,
        arc: 0.9,
        maxTravel: 32,
      });
    a._flankCd = t + 18 + Math.random() * 10;
    if (!c) return null;
    c.flank = true;
    a._flankUntil = t + 12;
    const lines =
      FLANK_BARKS[a.type] || FLANK_BARKS[a.faction] || FLANK_BARKS["*"];
    if (a.voice && Math.random() < 0.8) a.say(C.pick(lines), 2.5);
    return c;
  }

  function preferredDistance(a) {
    const w = a.weapon;
    if (!w) return a.natural && a.natural.range ? a.natural.range * 0.5 : 10;
    if (w.melee) return 1;
    if (w.projectile === "missile") return 28;
    if (w.projectile === "flame") return 6;
    if (w.pellets > 1) return 8;
    if (w.range >= 180) return 30;
    if (w.automatic) return 15;
    return 17;
  }

  // ------------------------------------------------------------------
  // Behaviours
  // ------------------------------------------------------------------
  const B = {};

  /** Ranged humanoid (raiders, Continuity, Covenant, settlers, Brute gunners). */
  B.gunner = function (a, dt, opts) {
    const w = a.weapon;
    const tp = targetPos(a, _c);
    const dx = tp.x - a.pos.x,
      dz = tp.z - a.pos.z,
      dist = Math.hypot(dx, dz) || 0.01;
    const pd =
      opts && opts.advance
        ? Math.min(preferredDistance(a), 12)
        : preferredDistance(a);
    const t = now();
    a.faceTarget = true;
    // Reloading
    if (a.reloadT > 0) {
      a.reloadT -= dt;
      if (a.reloadT <= 0) {
        a.magLeft = w.magSize;
      }
      // back off a little while reloading
      if (a.holdPos) a.speed = 0;
      else if (a.coverPos) {
        steerTo(a, a.coverPos.x, a.coverPos.z, a.runSpeed, dt, 0.5);
        if (
          a.coverPos.covered &&
          a.td.human &&
          Math.hypot(a.coverPos.x - a.pos.x, a.coverPos.z - a.pos.z) < 0.9
        ) {
          a.ducked = true;
          a.duckUntil = t + 0.4;
        }
      } else C.steer(a, -dx, -dz, a.walkSpeed, dt);
      a.faceTowards(tp.x, tp.z, 5, dt);
      return;
    }
    if (w.magSize > 0 && a.magLeft <= 0) {
      a.reloadT = w.reloadTime * (0.9 + Math.random() * 0.4);
      a.oneShot("reload");
      a.bark("reload", 0.45);
      C.sfx(w.pellets > 1 ? "reload_shotgun" : "reload", {
        pos: a.pos,
        volume: 0.5,
      });
      return;
    }
    // Grenade when the target hides behind cover
    if (
      a.td.grenades &&
      t > a.grenadeCd &&
      dist > 7 &&
      dist < 26 &&
      ((!a.canSeeTarget && t - a.lastSeenT < 5) || Math.random() < 0.004)
    ) {
      a.grenadeCd = t + 12 + Math.random() * 10;
      if (Math.random() < a.td.grenades * 2) {
        throwGrenade(a);
        return;
      }
    }
    // Choose/refresh position
    a.coverT -= dt;
    if (a.coverT <= 0 && !(opts && opts.advance)) {
      a.coverT = 4 + Math.random() * 4;
      if (
        a.coverPos &&
        a.coverPos.flank &&
        t < (a._flankUntil || 0) &&
        Math.hypot(a.coverPos.x - a.pos.x, a.coverPos.z - a.pos.z) > 1
      )
        a.coverT = 1.5; // still working round
      else
        a.coverPos =
          tryFlank(a, pd) ||
          (a.hp < a.maxHp * 0.85 || Math.random() < 0.6
            ? findCover(a, pd)
            : null);
      if (a.coverPos && a.coverPos.flank) a.coverT = 10;
    }
    let moving = false;
    if (a.holdPos) {
      // Snipers / turret-like posts (e.g. the Chrysler nest): never leave the spot
      a.coverPos = null;
    } else if (
      a.coverPos &&
      Math.hypot(a.coverPos.x - a.pos.x, a.coverPos.z - a.pos.z) > 0.6
    ) {
      C.navMove(
        a,
        a.coverPos.x,
        a.coverPos.z,
        dist < 12 ? a.runSpeed : a.runSpeed * 0.8,
        dt,
        0.5,
      );
      moving = true;
    } else if (a.ducked) {
      // tucked in behind cover (see below)
    } else if (
      !a.canSeeTarget &&
      t - a.lastSeenT > 1.2 &&
      t > (a.popT || 0) + 0.5
    ) {
      // Lost sight: advance toward last known position (pathing around the building in the way)
      const lk = a.lastKnown || tp;
      C.navMove(a, lk.x, lk.z, a.runSpeed * 0.8, dt, 2);
      moving = true;
      a.coverPos = null;
    } else if (dist > pd * 1.4) {
      if (a.canSeeTarget && !(a.stuckT > 0.4) && !C.navBusy(a))
        C.steer(a, dx, dz, a.runSpeed * 0.85, dt);
      else C.navMove(a, tp.x, tp.z, a.runSpeed * 0.85, dt, pd);
      moving = true;
    } else if (dist < pd * 0.5 && !(opts && opts.advance)) {
      C.steer(a, -dx, -dz, a.walkSpeed * 1.4, dt);
      moving = true;
    } else if (!a.coverPos || (opts && opts.advance)) {
      // Strafe
      a.strafeT -= dt;
      if (a.strafeT <= 0) {
        a.strafeT = 0.9 + Math.random() * 1.8;
        a.strafeDir = Math.random() < 0.3 ? 0 : Math.random() < 0.5 ? -1 : 1;
      }
      if (a.strafeDir) {
        const sx = (-dz / dist) * a.strafeDir,
          sz = (dx / dist) * a.strafeDir;
        const adv = opts && opts.advance ? 0.5 : 0;
        C.steer(
          a,
          sx + (dx / dist) * adv,
          sz + (dz / dist) * adv,
          a.walkSpeed * 1.3,
          dt,
        );
        moving = true;
      }
    }
    if (!moving) a.speed = 0;
    a.faceTowards(tp.x, tp.z, 7, dt);
    // Duck & pop: tucked in behind low cover between bursts and while reloading,
    // standing up to shoot (a short beat to aim first); a ducked head is hidden from the target too.
    const atCover =
      !moving &&
      !a.holdPos &&
      a.td.human &&
      a.coverPos &&
      a.coverPos.covered &&
      a.coverPos.peek &&
      Math.hypot(a.coverPos.x - a.pos.x, a.coverPos.z - a.pos.z) < 0.9 &&
      dist > 4;
    if (!atCover) a.ducked = false;
    else if (a.ducked) {
      if (t > (a.duckUntil || 0) && t - a.lastSeenT < 10) {
        a.ducked = false;
        a.popT = t + 0.3 + Math.random() * 0.3;
      }
    } else if (
      a._burstRest &&
      t < a._burstRest - 0.4 &&
      a.burstLeft <= 0 &&
      t > (a.popT || 0) + 0.6
    ) {
      a.ducked = true;
      a.duckUntil = a._burstRest;
    }
    // Fire in bursts
    if (
      a.canSeeTarget &&
      !a.ducked &&
      t > (a.popT || 0) &&
      t > a.aimT &&
      dist < w.range * 1.1
    ) {
      a.attackCd -= dt;
      if (a.attackCd <= 0) {
        if (a.burstLeft <= 0) {
          if (a._burstRest && t < a._burstRest) return;
          // Line of fire (35_reactions): never open up through a friend's back — sidestep instead
          if (C.friendInLine && C.friendInLine(a, targetAimPoint(a, _d))) {
            a.attackCd = 0.35 + Math.random() * 0.3;
            if (a.coverPos && !a.holdPos) a.coverT = Math.min(a.coverT, 0.2);
            else {
              a.strafeT = 0.8 + Math.random() * 0.6;
              a.strafeDir = a.strafeDir || (Math.random() < 0.5 ? -1 : 1);
            }
            return;
          }
          a.burstLeft = w.automatic ? C.randInt(3, 8) : C.randInt(1, 3);
        }
        if (w.projectile === "flame") {
          flame(a, { dmg: w.damage, dmgLvl: 0, range: w.range }, dt);
          a.burstLeft -= dt * 3;
          if (a.burstLeft <= 0) a._burstRest = t + 1 + Math.random();
          return;
        }
        shoot(a);
        a.burstLeft--;
        a.attackCd = w.automatic
          ? 1 / w.rof
          : (1 / w.rof) * (1.3 + Math.random() * 0.9) + 0.15;
        if (a.burstLeft <= 0)
          a._burstRest =
            t +
            (w.automatic ? 0.6 : 0.4) +
            Math.random() * 1.1 +
            (atCover ? 0.9 + Math.random() * 1.2 : 0);
        a.bark("combat", 0.06);
      }
    }
  };

  /** Melee humanoid / generic melee creature: rush & swing. */
