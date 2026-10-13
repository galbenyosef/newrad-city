// play-inline-510 05 — pos
// Lines 1362-1665 of readable/play-inline-510.pretty.js (statement-aligned).
  function shoot(a) {
    const aim = targetAimPoint(a, _c);
    const muzzle = C.leanOrigin(a, a.muzzlePos(_d), aim);
    const dir = _a.subVectors(aim, muzzle);
    const dist = dir.length();
    dir.divideScalar(dist || 1);
    const w = a.weapon;
    const nat =
      !w && a.natural && a.natural.kind === "ranged" ? a.natural : null;
    if (!w && !nat) return false;
    // Face the target
    a.faceTowards(aim.x, aim.z);
    // scoped long guns (sniper / hunting rifles) are properly accurate at range
    let spread = w
      ? w.spread * 0.8 + (w.range >= 150 ? 0.0025 : 0.012)
      : nat.spread || 0.03;
    if (a.speed > 0.5) spread *= 1.4;
    if (a.armCrippled) spread *= 2;
    if (a.suppressT && a.suppressT > now()) spread *= 1.6; // rounds cracking past (35_reactions)
    if (a.target === "player") {
      const P = G.player;
      if (P.moveSpeed > 3) spread *= 1 + (P.moveSpeed - 3) * 0.08;
      if (P.sneaking) spread *= 1.15;
    }
    spread /= a.accuracy;
    const lvlScale = w
      ? 0.85 + a.level * 0.03
      : 1 + ((nat.dmgLvl || 0) * (a.level - 1)) / Math.max(1, nat.dmg);
    const damage = (w ? w.damage : nat.dmg) * lvlScale * a.damageMult;
    a.oneShot("attack_ranged");
    if (w) {
      C.sfx(w.sound, {
        pos: muzzle,
        volume: 0.9,
        pitch: (w.sfxPitch || 1) * (0.95 + Math.random() * 0.1),
      });
      if (w.projectile !== "flame")
        C.fx(
          "muzzleFlash",
          muzzle.clone(),
          dir.clone(),
          w.flash || (w.damageType === "energy" ? "laser" : "ballistic"),
        );
      G.combat.fire({
        from: a,
        origin: muzzle.clone(),
        dir: dir.clone(),
        weaponId: a.weaponId,
        damage,
        spread,
        pellets: w.pellets,
        range: w.range * 1.2,
        projectile: w.projectile,
        projectileSpeed: w.projectileSpeed,
        explosionRadius: w.explosionRadius,
        damageType: w.damageType,
        beam: w.beam,
      });
      if (w.magSize > 0) a.magLeft--;
      C.noise(a.pos, 45, a, "gun");
    } else {
      C.sfx(nat.sound, { pos: muzzle, volume: 0.8, pitch: nat.pitch || 1 });
      if (nat.energy) C.fx("muzzleFlash", muzzle.clone(), dir.clone(), "laser");
      G.combat.fire({
        from: a,
        origin: muzzle.clone(),
        dir: dir.clone(),
        weaponId: null,
        damage,
        spread,
        pellets: 1,
        range: nat.range * 1.3,
        damageType: nat.type === "energy" ? "energy" : "ballistic",
        beam: nat.beam || null,
      });
      C.noise(a.pos, 30, a, "gun");
    }
    return true;
  }
  /** Throw a grenade in a ballistic arc at the target. */
  function throwGrenade(a) {
    const tp = targetPos(a, _c);
    const from = _d.set(a.pos.x, a.pos.y + a.height * 0.9, a.pos.z);
    const dx = tp.x - from.x,
      dz = tp.z - from.z,
      dist = Math.hypot(dx, dz);
    const t = C.clamp(dist / 13, 0.6, 2.0),
      g = 9.8;
    const vel = new THREE.Vector3(
      dx / t,
      (tp.y + 0.3 - from.y + 0.5 * g * t * t) / t,
      dz / t,
    );
    a.oneShot("attack_melee");
    a.bark("grenade", 0.9);
    const gas = a.faction === "continuity"; // Continuity troopers throw riot gas (combat hands 'gas' to G.weapons.gasCloud)
    G.combat.spawnProjectile({
      kind: "grenade",
      pos: from.clone(),
      vel,
      gravity: g,
      damage: gas ? 4 : 60,
      radius: gas ? 5.5 : 5,
      from: a,
      fuse: 2.2 + Math.random() * 0.6,
      explosionKind: gas ? "gas" : "normal",
      weaponId: gas ? "riot_gas_grenade" : "frag_grenade",
    });
    C.sfx("melee_swing", { pos: a.pos, volume: 0.5 });
  }
  /** Spit projectile (gasfly bile / shellback matriarch acid). */
  function spit(a, atk) {
    const tp = targetAimPoint(a, _c);
    const from = _d.set(a.pos.x, a.pos.y + a.height * 0.6, a.pos.z);
    const f = a.forward(_b);
    from.addScaledVector(f, a.radius * 0.8);
    const dx = tp.x - from.x,
      dz = tp.z - from.z,
      dist = Math.hypot(dx, dz);
    const sp = atk.speed || 16,
      t = Math.max(0.3, dist / sp),
      g = 9.8;
    const lvlScale =
      1 + ((atk.dmgLvl || 0) * (a.level - 1)) / Math.max(1, atk.dmg);
    for (let i = 0; i < (atk.count || 1); i++) {
      const jx = (Math.random() - 0.5) * (atk.count > 1 ? 3 : 0.8),
        jz = (Math.random() - 0.5) * (atk.count > 1 ? 3 : 0.8);
      const vel = new THREE.Vector3(
        (dx + jx) / t,
        (tp.y - from.y + 0.5 * g * t * t) / t,
        (dz + jz) / t,
      );
      G.combat.spawnProjectile({
        kind: "spit",
        pos: from.clone(),
        vel,
        gravity: g,
        damage: atk.dmg * lvlScale * a.damageMult,
        radius: 1.2,
        from: a,
        type: atk.type || "poison",
      });
    }
    a.oneShot("attack_ranged");
    C.sfx(atk.sound || "gasfly_buzz", { pos: a.pos, volume: 0.7, pitch: 1.3 });
  }
  /** Flamer stream (Valet-M / NPC flamer): spawns flame particles toward target. */
  function flame(a, atk, dt) {
    const tp = targetAimPoint(a, _c);
    const from = a.muzzlePos(_d);
    const dir = _a.subVectors(tp, from).normalize();
    a.faceTowards(tp.x, tp.z, 6, dt);
    a._flameAcc = (a._flameAcc || 0) + dt;
    const lvlScale =
      1 + ((atk.dmgLvl || 0) * (a.level - 1)) / Math.max(1, atk.dmg);
    while (a._flameAcc > 0.06) {
      a._flameAcc -= 0.06;
      const v = dir
        .clone()
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.12,
            (Math.random() - 0.5) * 0.08,
            (Math.random() - 0.5) * 0.12,
          ),
        )
        .normalize()
        .multiplyScalar(14 + Math.random() * 4);
      G.combat.spawnProjectile({
        kind: "flame",
        pos: from.clone(),
        vel: v,
        gravity: -1,
        damage: atk.dmg * lvlScale * a.damageMult,
        radius: 0.7,
        from: a,
        life: (atk.range || 8) / 15,
      });
    }
    if (!a._flameSnd || now() - a._flameSnd > 0.9) {
      a._flameSnd = now();
      C.sfx("fire_loop", { pos: a.pos, volume: 0.5 });
    }
  }

  // ------------------------------------------------------------------
  // Cover search (ranged humanoids)
  // ------------------------------------------------------------------
  function findCover(a, prefDist, opts) {
    const tp = targetPos(a, _c);
    const tEye = _d.set(tp.x, tp.y + 1.5, tp.z);
    let best = null,
      bestScore = -1e9;
    const base =
      opts && typeof opts.base === "number"
        ? opts.base
        : Math.atan2(a.pos.x - tp.x, a.pos.z - tp.z);
    const arc = opts && opts.arc ? opts.arc : 2.4,
      maxTravel = opts && opts.maxTravel ? opts.maxTravel : 16;
    for (let i = 0; i < 10; i++) {
      const ang = base + (Math.random() - 0.5) * arc;
      const dist = C.clamp(
        prefDist * (0.7 + Math.random() * 0.6),
        5,
        a.sight * 0.8,
      );
      const px = tp.x + Math.sin(ang) * dist,
        pz = tp.z + Math.cos(ang) * dist;
      const travel = Math.hypot(px - a.pos.x, pz - a.pos.z);
      if (travel > maxTravel) continue;
      // interiors: stay inside the built cell (no cover spots out in the void between rooms)
      if (
        G.LAYOUT.isInterior(px) &&
        !G.world.lineOfSight(
          _e.set(a.pos.x, a.pos.y + 1.0, a.pos.z),
          _f.set(px, a.pos.y + 1.0, pz),
        ) &&
        travel > 6
      )
        continue;
      if (
        !G.LAYOUT.isLand(px, pz) ||
        G.world.terrainHeight(px, pz) < G.world.waterLevel
      )
        continue;
      const gy = G.world.groundHeight(px, pz, a.pos.y + 0.6, a.radius * 0.5);
      if (Math.abs(gy - a.pos.y) > 1.2) continue;
      // Inside a collider?
      const cs = G.world.query(
        px - a.radius,
        pz - a.radius,
        px + a.radius,
        pz + a.radius,
      );
      let inside = false;
      for (const c of cs)
        if (
          c.maxY > gy + 0.6 &&
          c.minY < gy + 1.7 &&
          G.world.pointInCollider(c, px, pz, a.radius)
        ) {
          inside = true;
          break;
        }
      if (inside) continue;
      const low = _a.set(px, gy + 0.8, pz),
        high = _b.set(px, gy + 1.65, pz);
      const coveredLow = !G.world.lineOfSight(tEye, low);
      const peek = G.world.lineOfSight(high, tEye);
      let score =
        (coveredLow ? 3 : 0) +
        (peek ? 2 : -1) -
        Math.abs(dist - prefDist) * 0.08 -
        travel * 0.12;
      if (coveredLow && !peek) score -= 1.5;
      if (score > bestScore) {
        bestScore = score;
        best = { x: px, z: pz, y: gy, covered: coveredLow, peek };
      }
    }
    return best && bestScore > 0 ? best : null;
  }

  /**
   * Squad tactics: when three or more gunners of one side fight the same target, one of
   * them breaks off to work around the flank (~75° off the squad's line) while the rest hold and suppress.
   */
  const FLANK_BARKS = {
    raider: [
      "Go around! Go around!",
      "I'm flankin'! Keep 'em busy!",
      "Cover me, I'm goin' wide!",
    ],
    brute: ["Go around! Break from side!", "You shoot. Brute goes around."],
    continuity: [
      "Flanking left!",
      "Moving to flank. Suppressing fire!",
      "Pincer! Push the side!",
    ],
    covenant: ["Moving to flank!", "Suppressing fire, I'm going around!"],
    "*": [
      "Flank them!",
      "Going around the side!",
      "Keep them pinned — I'm moving!",
    ],
  };
  function squadOf(a) {
    const out = [];
    for (const o of C.list) {
      if (
        o === a ||
        o.dead ||
        !o.inCombat ||
        o.target !== a.target ||
        !o.inScene
      )
        continue;
      if (o.faction !== a.faction || !o.weapon || o.weapon.melee || o.holdPos)
        continue;
      if (Math.hypot(o.pos.x - a.pos.x, o.pos.z - a.pos.z) > 40) continue;
      out.push(o);
    }
    return out;
  }
