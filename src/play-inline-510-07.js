// play-inline-510 07 — pos
// Lines 1958-2305 of readable/play-inline-510.pretty.js (statement-aligned).
  B.brawler = function (a, dt, opts) {
    const tp = targetPos(a, _c);
    const dx = tp.x - a.pos.x,
      dz = tp.z - a.pos.z,
      dist = Math.hypot(dx, dz) || 0.01;
    const atk = (opts && opts.atk) || meleeAttackDef(a);
    const tr = a.target === "player" ? G.player.radius : a.target.radius;
    const reach = atk.range + a.radius * 0.6 + tr;
    a.faceTarget = dist < reach + 1.5;
    if (a.faceTarget) a.faceTowards(tp.x, tp.z, 9, dt);
    // Lunge (maniacs, dogs): burst forward in the last few metres
    if (
      atk.lunge &&
      dist < atk.lunge + reach &&
      dist > reach * 0.9 &&
      !a.lungeT &&
      a.attackCd <= 0.2 &&
      Math.random() < 0.08
    ) {
      a.lungeT = 0.35;
      a.oneShot("attack_melee");
      C.sfx((a.td.sounds && a.td.sounds.alert) || "maniac_scream", {
        pos: a.pos,
        volume: 0.6,
        pitch: 1.1,
      });
    }
    if (a.lungeT) {
      a.lungeT -= dt;
      if (a.lungeT <= 0) a.lungeT = 0;
      C.steer(a, dx, dz, Math.max(9, a.runSpeed * 1.4), dt);
    } else if (dist > reach * 0.85) {
      const spd = opts && opts.speed ? opts.speed : a.runSpeed;
      if (!a.canSeeTarget || a.stuckT > 0.4 || a.detourT > 0 || C.navBusy(a)) {
        // Around cars, walls and park walls: path to the target (feelers still dodge small stuff)
        C.navMove(a, tp.x, tp.z, spd, dt, reach * 0.8);
      } else if (
        C.surroundSlot &&
        dist < 9 &&
        dist > reach * 1.3 &&
        C.surroundSlot(a, tp, reach, _e)
      ) {
        // Pack tactics: several melee attackers fan out and close in from different sides
        C.steer(a, _e.x - a.pos.x, _e.z - a.pos.z, spd, dt);
      } else {
        let sx = dx,
          sz = dz;
        if (opts && opts.zigzag && dist > 5) {
          const s = Math.sin(now() * 3.2 + a.uid) * 0.55;
          sx += (-dz / dist) * s * dist * 0.3;
          sz += (dx / dist) * s * dist * 0.3;
        }
        C.steer(a, sx, sz, spd, dt);
      }
    } else {
      a.speed = 0;
      // slight circling
      if (Math.random() < 0.02) a.strafeDir = -a.strafeDir;
    }
    a.attackCd -= dt;
    if (dist < reach && a.attackCd <= 0 && !a.pendingMelee) startMelee(a, atk);
  };

  /** Humanoids: pick gunner or brawler by weapon. Flee at low HP. */
  B.humanoid = function (a, dt) {
    if (
      a.td.flee &&
      !a.fledOnce &&
      !a.holdPos &&
      a.hp < a.maxHp * a.td.flee &&
      Math.random() < 0.5 * dt * 4
    ) {
      a.fledOnce = true;
      a.bark("flee", 1);
      a.setState("flee");
      a.fleeFrom = a.target;
      return;
    }
    if (a.weapon && !a.weapon.melee) B.gunner(a, dt);
    else B.brawler(a, dt);
  };
  B.brute = function (a, dt) {
    if (a.weapon && !a.weapon.melee) B.gunner(a, dt, { advance: true });
    else B.brawler(a, dt, { speed: a.runSpeed });
  };
  B.colossus = function (a, dt) {
    if (a.roarT && now() < a.roarT) {
      a.speed = 0;
      return;
    }
    B.brawler(a, dt, { speed: a.runSpeed, atk: a.natural });
  };
  B.maniac = function (a, dt) {
    B.brawler(a, dt, { zigzag: true });
  };
  B.ripjaw = function (a, dt) {
    if (a.roarT && now() < a.roarT) {
      a.speed = 0;
      a.faceTowards(targetPos(a, _c).x, _c.z, 4, dt);
      return;
    }
    const d = a.target === "player" ? a.distToPlayer() : a.distTo(a.target.pos);
    // Charge: fast, committed, poor turning
    if (d > 7 && !a.chargeT) {
      a.chargeT = 1.4;
    }
    if (a.chargeT) {
      a.chargeT -= dt;
      if (a.chargeT <= 0 || d < 3.5) a.chargeT = 0;
      const tp = targetPos(a, _c);
      const want = Math.atan2(-(tp.x - a.pos.x), -(tp.z - a.pos.z));
      a.yaw += C.clamp(U.angleDiff(a.yaw, want), -2.2 * dt, 2.2 * dt);
      a.applyYaw();
      a.faceTarget = true;
      C.steer(a, -Math.sin(a.yaw), -Math.cos(a.yaw), a.runSpeed, dt);
      a.attackCd -= dt;
      if (d < 3.4 && a.attackCd <= 0) startMelee(a, a.natural);
      return;
    }
    B.brawler(a, dt, { speed: a.runSpeed * 0.8, atk: a.natural });
  };
  B.swarm = function (a, dt) {
    // Burrow rats tunnel under the street and pop up next to you
    if (a.td.burrows) {
      const d =
        a.target === "player" ? a.distToPlayer() : a.distTo(a.target.pos);
      if (a.burrowed) {
        const tp = targetPos(a, _c);
        a.burrowT -= dt;
        steerTo(a, tp.x, tp.z, 5.5, dt, 1.6);
        if (a.burrowT <= 0 && (d < 2.4 || a.burrowT < -4)) {
          a.burrowed = false;
          a.char.root.visible = true;
          a.pos.y = G.world.groundHeight(a.pos.x, a.pos.z, a.pos.y + 1);
          C.fx("dust", a.pos.clone());
          C.fx("impact", a.pos.clone(), new THREE.Vector3(0, 1, 0), "dirt");
          C.sfx("burrowrat_squeak", { pos: a.pos, volume: 0.9 });
          a.attackCd = 0.2;
          a.burrowCd = now() + 12;
        }
        return;
      }
      if (d > 11 && now() > (a.burrowCd || 0) && Math.random() < 0.02) {
        if (!G.LAYOUT.isInterior(a.pos.x)) {
          a.burrowed = true;
          a.burrowT = 1.2;
          a.char.root.visible = false;
          C.fx("dust", a.pos.clone());
          C.sfx("burrowrat_squeak", { pos: a.pos, volume: 0.7, pitch: 0.8 });
          return;
        }
      }
    }
    // Giant roaches skitter in jittery lines
    B.brawler(a, dt, { zigzag: a.type === "giant_roach" });
  };
  B.dog = function (a, dt) {
    if (a.td.flee && !a.fledOnce && !a.holdPos && a.hp < a.maxHp * a.td.flee) {
      a.fledOnce = true;
      a.setState("flee");
      a.fleeFrom = a.target;
      C.sfx("dog_bark", { pos: a.pos, pitch: 1.6, volume: 0.6 });
      return;
    }
    if (Math.random() < 0.006) C.sfx("dog_bark", { pos: a.pos, volume: 0.7 });
    B.brawler(a, dt);
  };
  /** Orbit the target at a radius (flyers / sky-eye drones). */
  function orbit(a, dt, radius, speed) {
    const tp = targetPos(a, _c);
    const dx = a.pos.x - tp.x,
      dz = a.pos.z - tp.z;
    const d = Math.hypot(dx, dz) || 0.01;
    const radial = (d - radius) * 0.35;
    const tx = (-dz / d) * a.strafeDir,
      tz = (dx / d) * a.strafeDir;
    C.steer(a, tx - (dx / d) * radial, tz - (dz / d) * radial, speed, dt);
    a.strafeT -= dt;
    if (a.strafeT <= 0) {
      a.strafeT = 2 + Math.random() * 3;
      if (Math.random() < 0.4) a.strafeDir = -a.strafeDir;
    }
    a.faceTarget = true;
    a.faceTowards(tp.x, tp.z, 5, dt);
    return d;
  }
  B.flyer = function (a, dt) {
    const d = orbit(a, dt, 9, a.runSpeed);
    a.hoverBoost = Math.sin(now() * 1.3 + a.uid) * 0.8;
    a.attackCd -= dt;
    if (a.attackCd <= 0 && a.canSeeTarget && d < a.natural.range) {
      a.attackCd = a.natural.cooldown * (0.8 + Math.random() * 0.5);
      spit(a, a.natural);
    }
    if (d < 1.8)
      B.brawler(a, dt, {
        atk: {
          kind: "melee",
          dmg: 3,
          range: 1.2,
          cooldown: 1.2,
          windup: 0.2,
          type: "melee",
          sound: "gasfly_buzz",
        },
      });
  };
  B.robot = function (a, dt) {
    const nat = a.natural;
    const tp = targetPos(a, _c);
    const dx = tp.x - a.pos.x,
      dz = tp.z - a.pos.z,
      dist = Math.hypot(dx, dz) || 0.01;
    a.faceTarget = true;
    a.faceTowards(tp.x, tp.z, 3, dt);
    if (dist > 14 || !a.canSeeTarget) C.steer(a, dx, dz, a.runSpeed, dt);
    else if (dist < 4) C.steer(a, -dx, -dz, a.walkSpeed, dt);
    else a.speed = 0;
    a.attackCd -= dt;
    if (a.canSeeTarget && now() > a.aimT && a.attackCd <= 0) {
      if (a.burstLeft <= 0) a.burstLeft = nat.burst || 1;
      shoot(a);
      a.burstLeft--;
      a.attackCd =
        a.burstLeft > 0
          ? nat.burst > 5
            ? nat.cooldown
            : 0.28
          : (nat.rest || nat.cooldown) * (0.9 + Math.random() * 0.4);
      a.bark("combat", 0.05);
    }
  };
  B.valet = function (a, dt) {
    const nat = a.natural;
    const tp = targetPos(a, _c);
    const dx = tp.x - a.pos.x,
      dz = tp.z - a.pos.z,
      dist = Math.hypot(dx, dz) || 0.01;
    a.faceTarget = true;
    a.faceTowards(tp.x, tp.z, 5, dt);
    if (dist < 2.2) {
      B.brawler(a, dt, { atk: nat.alt });
      return;
    }
    if (dist > 6) C.steer(a, dx, dz, a.runSpeed, dt);
    else {
      const s = a.strafeDir;
      C.steer(a, (-dz / dist) * s, (dx / dist) * s, a.walkSpeed, dt);
    }
    // Flame bursts: 1.6 s on, 1.4 s off
    a.flameT = (a.flameT || 0) + dt;
    const cyc = nat.burstTime + nat.rest;
    if (a.flameT > cyc) a.flameT -= cyc;
    if (a.flameT < nat.burstTime && dist < nat.range && a.canSeeTarget)
      flame(a, nat, dt);
    if (Math.random() < 0.004) a.bark("combat", 1);
  };
  B.sky_eye = function (a, dt) {
    const d = orbit(a, dt, 12, a.runSpeed);
    a.attackCd -= dt;
    if (
      a.attackCd <= 0 &&
      a.canSeeTarget &&
      d < a.natural.range &&
      now() > a.aimT
    ) {
      a.attackCd = a.natural.cooldown * (0.8 + Math.random() * 0.5);
      shoot(a);
    }
    if (Math.random() < 0.01)
      C.sfx("skyeye_chatter", { pos: a.pos, volume: 0.5 });
  };
  B.shellback = function (a, dt) {
    // Clamp down under the carapace when badly hurt (soft underside protected)
    if (a.turtleT > 0) {
      a.turtleT -= dt;
      a.speed = 0;
      a.shellUp = a.turtleT > 0;
      if (!a.shellUp) a.anim("idle");
      return;
    }
    if (
      a.hp < a.maxHp * 0.45 &&
      !a.turtledOnce &&
      Math.random() < 0.3 * dt * 4
    ) {
      a.turtledOnce = true;
      a.turtleT = 2.5 + Math.random();
      a.shellUp = true;
      a.anim("cower");
      C.sfx("shellback_click", { pos: a.pos, volume: 0.8, pitch: 0.7 });
      return;
    }
    B.brawler(a, dt, { atk: a.natural });
  };
  B.matriarch = function (a, dt) {
    const d = a.target === "player" ? a.distToPlayer() : a.distTo(a.target.pos);
    a.spitCd = (a.spitCd || 2) - dt;
    if (d > 8 && a.spitCd <= 0 && a.canSeeTarget) {
      a.spitCd = a.natural.alt.cooldown * (0.8 + Math.random() * 0.4);
      spit(a, a.natural.alt);
    }
    B.brawler(a, dt, {
      speed: d > 14 ? a.runSpeed : a.walkSpeed * 1.5,
      atk: a.natural,
    });
  };

  /** Stingers: claws, and every few seconds the tail stinger (poison DoT), unless the tail was shot off. */
  B.stinger = function (a, dt) {
    const sting = a.td.stinger && C.NATURAL[a.td.stinger];
    // the tail is the scorpion's 'leftLeg' part (characters' SCORP_INFO): shot off or crippled = no sting
    const tailGone =
      (a.char &&
        typeof a.char.hasPart === "function" &&
        !a.char.hasPart("leftLeg")) ||
      !!(a.limbs && a.limbs.leftLeg && a.limbs.leftLeg.crippled);
    a.stingCd = (a.stingCd === undefined ? 1.5 : a.stingCd) - dt;
    let atk = a.natural;
    if (sting && !tailGone && a.stingCd <= 0) atk = sting;
    const before = a.pendingMelee;
    if (a.td.small && a.td.swarm) B.brawler(a, dt, { zigzag: true, atk });
    else B.brawler(a, dt, { atk });
    if (atk === sting && a.pendingMelee && a.pendingMelee !== before)
      a.stingCd = sting.cooldown * (0.8 + Math.random() * 0.5);
  };
  /** Fire ants / lurchers: lob the natural's alt spit from range, bite up close. */
  B.spitter = function (a, dt) {
    const alt = a.natural && a.natural.alt;
    if (alt) {
      const d =
        a.target === "player" ? a.distToPlayer() : a.distTo(a.target.pos);
      a.spitCd = (a.spitCd === undefined ? 1.2 : a.spitCd) - dt;
      if (
        d > (alt.minRange || 4) &&
        d < alt.range &&
        a.spitCd <= 0 &&
        a.canSeeTarget
      ) {
        a.spitCd = alt.cooldown * (0.8 + Math.random() * 0.4);
        const tp = targetPos(a, _c);
        a.faceTowards(tp.x, tp.z);
        spit(a, alt);
      }
    }
    B.brawler(a, dt, { atk: a.natural, zigzag: a.type === "fire_ant" });
  };

