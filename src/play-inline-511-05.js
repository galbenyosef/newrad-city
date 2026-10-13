// play-inline-511 05 — info
// Lines 1360-1674 of readable/play-inline-511.pretty.js (statement-aligned).
  function randomCone(dir, spread, out) {
    if (!spread) return out.copy(dir);
    // uniform-ish in a disc of radius tan(spread)
    const r = Math.sqrt(Math.random()) * Math.tan(spread),
      th = Math.random() * Math.PI * 2;
    const up = Math.abs(dir.y) < 0.95 ? UP : _r.set(1, 0, 0);
    const ax = _p.crossVectors(dir, up).normalize(),
      ay = _q.crossVectors(ax, dir).normalize();
    return out
      .copy(dir)
      .addScaledVector(ax, Math.cos(th) * r)
      .addScaledVector(ay, Math.sin(th) * r)
      .normalize();
  }
  let lastNoiseFrame = -1;
  /**
   * opts: {from:'player'|actor, origin:Vector3, dir:Vector3 (normalised), weaponId, damage, spread, pellets, range,
   *        projectile, crit?, muzzle?, damageType?, beam?, projectileSpeed?, explosionRadius?}
   * → {hits:[{actor, part, damage, crit, killed, point}], hit (first), world (raycast hit|null), end (Vector3)}
   */
  CB.fire = function (opts) {
    opts = opts || {};
    const from = C.normSource(opts.from || "player") || "player";
    const isPlayer = from === "player";
    const info =
      C.weaponInfo(opts.weaponId) ||
      (isPlayer ? C.weaponInfo("unarmed") : null);
    const origin = opts.origin
      ? opts.origin.clone()
      : isPlayer
        ? G.player.eye.clone()
        : from.muzzlePos();
    const dir = opts.dir
      ? opts.dir.clone().normalize()
      : isPlayer
        ? G.player.forward.clone()
        : from.forward();
    const proj =
      opts.projectile !== undefined
        ? opts.projectile === "hitscan"
          ? null
          : opts.projectile
        : info && info.projectile;
    const damageType =
      opts.damageType || (info && info.damageType) || "ballistic";
    // Hearing: the player's gunfire (in case the weapons module didn't emit weaponFired)
    if (isPlayer && G.time.frame !== lastNoiseFrame && !(info && info.melee)) {
      lastNoiseFrame = G.time.frame;
      C.noise(
        G.player.pos,
        C.loudness(info) * (C.playerSilenced() ? 0.3 : 1),
        "player",
        "gun",
      );
    }
    // Projectile weapons
    if (proj) {
      const speed =
        opts.projectileSpeed ||
        (info && info.projectileSpeed) ||
        (proj === "missile" ? 40 : 18);
      const out = [];
      const n = proj === "flame" ? 1 : Math.max(1, opts.pellets || 1);
      for (let i = 0; i < n; i++) {
        const d = randomCone(dir, opts.spread || 0, new THREE.Vector3());
        const spawnPos = opts.muzzle
          ? opts.muzzle.clone()
          : origin.clone().addScaledVector(d, isPlayer ? 0.6 : 0.1);
        const grav =
          proj === "grenade"
            ? 9.8
            : proj === "spit"
              ? 9.8
              : proj === "flame"
                ? -1
                : 0;
        const vel = d.clone().multiplyScalar(speed);
        out.push(
          CB.spawnProjectile({
            kind: proj,
            pos: spawnPos,
            vel,
            gravity: grav,
            damage:
              opts.damage !== undefined ? opts.damage : info ? info.damage : 10,
            radius:
              opts.explosionRadius ||
              (info && info.explosionRadius) ||
              (proj === "missile" ? 5 : 1),
            from,
            weaponId: opts.weaponId,
            crit: opts.crit,
            explosionKind: info && info.explosionKind,
            fuse: opts.fuse,
            life:
              proj === "flame"
                ? ((info && info.range) || 12) / speed
                : undefined,
          }),
        );
      }
      return { projectiles: out, hits: [], hit: null };
    }
    const pellets = Math.max(1, opts.pellets || (info && info.pellets) || 1);
    const range = opts.range || (info && info.range) || 150;
    const baseDmg =
      opts.damage !== undefined ? opts.damage : info ? info.damage : 10;
    const results = { hits: [], hit: null, world: null, end: null };
    const d = new THREE.Vector3();
    for (let i = 0; i < pellets; i++) {
      randomCone(dir, opts.spread || 0, d);
      const wh = G.world.raycast(origin, d, range, {
        ignoreTags: ["actor", "interactable_self", "foliage"],
      });
      const wd = wh ? wh.dist : range;
      // Actors (skip the shooter)
      const ah = C.rayActors(origin, d, wd, {
        exclude: isPlayer ? null : from,
      });
      // Player (NPC shots)
      let ph = null;
      if (!isPlayer) {
        ph = C.rayPlayer(origin, d, ah ? ah.t : wd);
      }
      let endPoint;
      if (ph) {
        endPoint = origin.clone().addScaledVector(d, ph.t);
        let dmg = baseDmg; // per pellet
        if (ph.part === "head") dmg *= 1.5;
        G.player.damage(dmg, {
          type:
            damageType === "energy"
              ? "energy"
              : damageType === "fire"
                ? "fire"
                : damageType === "explosive"
                  ? "explosive"
                  : "ballistic",
          source: from,
          part: ph.part,
          dir: d.clone(),
        });
        C.sfx("bullet_flesh", { pos: endPoint, volume: 0.5 });
        results.hits.push({
          actor: null,
          player: true,
          part: ph.part,
          damage: dmg,
          point: endPoint,
        });
      } else if (ah) {
        endPoint = origin.clone().addScaledVector(d, ah.t);
        const a = ah.actor;
        let dmg = baseDmg,
          crit = !!opts.crit,
          sneak = false;
        if (isPlayer) {
          dmg = playerDamage(baseDmg, info, a, opts);
          if (!crit && Math.random() < C.playerCritChance(info)) crit = true;
          if (!a.dead && C.isUnaware(a)) {
            crit = true;
            sneak = true;
          }
        } else {
          if (!a.dead && Math.random() < 0.03) crit = true;
        }
        const wasDead = a.dead;
        const final = C.applyDamage(a, dmg, {
          type: damageType === "fire" ? "fire" : damageType,
          source: from,
          part: ah.key,
          crit,
          critMult: info ? info.critMult : 1,
          sneak,
          weaponId: opts.weaponId,
          dir: d.clone(),
          point: endPoint.clone(),
          projectile: null,
        });
        if (sneak && isPlayer && !wasDead && i === 0) {
          G.notify("Sneak attack critical!");
          C.sfx("bullet_flesh", { volume: 0.6 });
        }
        const hitRec = {
          actor: a,
          part: ah.key,
          damage: final,
          crit,
          sneak,
          killed: !wasDead && a.dead,
          point: endPoint,
        };
        results.hits.push(hitRec);
        if (!results.hit) results.hit = hitRec;
      } else if (wh) {
        endPoint = wh.point;
        results.world = wh;
        C.fx(
          "impact",
          wh.point.clone(),
          wh.normal.clone(),
          wh.surface || "concrete",
        );
        C.fx(
          "decal",
          wh.point.clone(),
          wh.normal.clone(),
          damageType === "energy"
            ? "laser"
            : wh.surface === "metal"
              ? "bullet_metal"
              : wh.surface === "wood"
                ? "bullet_wood"
                : "bullet",
        );
        if (i === 0 || Math.random() < 0.3) {
          if (damageType === "energy")
            C.sfx("laser_impact", { pos: wh.point, volume: 0.45 });
          else
            C.sfx(
              wh.surface === "metal" && Math.random() < 0.5
                ? "ricochet"
                : "bullet_impact",
              { pos: wh.point, volume: 0.45 },
            );
        }
        if (!G.isStub("props") && typeof G.props.damageAt === "function") {
          try {
            G.props.damageAt(wh.point, baseDmg / pellets);
          } catch (e) {
            /* ignore */
          }
        }
      } else endPoint = _miss.copy(origin).addScaledVector(d, range);
      results.end = endPoint;
      // Tracers / beams
      const muzzle = opts.muzzle
        ? opts.muzzle
        : isPlayer
          ? playerMuzzleGuess()
          : origin;
      if (opts.beam || (info && info.beam)) {
        if (i === 0)
          C.fx(
            "laserBeam",
            muzzle.clone(),
            endPoint.clone(),
            opts.beam || info.beam,
          );
      } else if (
        damageType === "ballistic" &&
        (!isPlayer || Math.random() < (pellets > 1 ? 0.15 : 0.35))
      ) {
        C.fx(
          "tracer",
          muzzle.clone(),
          endPoint.clone(),
          isPlayer ? 0xffe0a0 : 0xffd080,
        );
      }
      // Rounds cracking past NPCs: suppression / [CAUTION] for unaware enemies (35_reactions)
      if (i === 0 && C.shotPassed) {
        try {
          C.shotPassed(
            origin,
            d,
            endPoint.distanceTo(origin),
            from,
            ah ? ah.actor : null,
            !ph && !ah && wh ? wh.point : null,
          );
        } catch (e) {
          G.reportError("combat:shotPassed", e);
        }
      }
      // Near-miss whiz past the player's head
      if (!isPlayer && !ph && i === 0) {
        const res = raySeg(origin, d, wd, G.player.eye, G.player.eye);
        if (res[1] < 2.2 * 2.2 && res[0] > 3)
          C.sfx("ricochet", {
            pos: origin.clone().addScaledVector(d, res[0]),
            volume: 0.35,
            pitch: 1.4,
          });
      }
    }
    if (results.end === _miss) results.end = _miss.clone();
    return results;
  };
  const _pm = new THREE.Vector3(),
    _miss = new THREE.Vector3();
  function playerMuzzleGuess() {
    const P = G.player,
      f = P.forward;
    const right = _r.set(-f.z, 0, f.x).normalize();
    _pm.copy(P.eye).addScaledVector(f, 0.7).addScaledVector(right, 0.14);
    _pm.y -= 0.13;
    return _pm; // scratch — callers clone what they keep
  }
  /** How far the player's weapon is heard. */
  C.loudness = function (info) {
    if (!info) return 50;
    if (info.melee) return 8;
    if (info.projectile === "missile") return 110;
    if (info.damageType === "energy") return 40;
    if (/sniper/.test(info.id || "")) return 55;
    return info.automatic ? 70 : 60;
  };

  // ------------------------------------------------------------------
  // Explosions
  // ------------------------------------------------------------------
  const tempRads = [];
  /** explode(pos, radius, damage, {source, kind:'normal'|'nuke'|'fire'|'gas', small?, weaponId}) — damages the player too.
   *  kind 'gas' (riot gas) is a cloud, not a blast: handed to G.weapons.gasCloud. */
