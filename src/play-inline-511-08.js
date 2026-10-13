// play-inline-511 08 — pos
// Lines 2204-2548 of readable/play-inline-511.pretty.js (statement-aligned).
  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.t += dt;
      if (p.stuck) {
        // Sticky charge riding on its victim (spawnProjectile({sticky:true}))
        if (p.stuck.removed) p.stuck = null;
        else
          p.pos.set(
            p.stuck.pos.x + p.stickOff.x,
            p.stuck.pos.y + p.stickOff.y,
            p.stuck.pos.z + p.stickOff.z,
          );
      } else if (!p.resting) {
        p.vel.y -= p.gravity * dt;
        const step = p.vel.length() * dt;
        if (step > 1e-5) {
          _seg.copy(p.vel).normalize();
          const hitResult = sweep(p, _seg, step);
          if (hitResult === "removed") {
            removeProjectile(i);
            continue;
          }
          if (!hitResult) p.pos.addScaledVector(p.vel, dt);
        }
      }
      // Orientation & visuals
      if (p.obj) {
        p.obj.position.copy(p.pos);
        if (p.kind === "missile" && p.vel.lengthSq() > 0.01)
          p.obj.lookAt(_p.copy(p.pos).sub(p.vel));
        if (p.kind === "grenade" && !p.resting) {
          p.obj.rotation.x += dt * 8;
          p.obj.rotation.z += dt * 5;
        }
        if (p.kind === "flame") {
          const k = p.t / p.life;
          p.obj.scale.setScalar(0.25 + k * 1.3);
          p.obj.material.opacity = 0.9 * (1 - k);
          p.obj.material.color.setHex(
            k < 0.3 ? 0xffc040 : k < 0.7 ? 0xff7a20 : 0x663322,
          );
        }
      }
      // Trails
      if (p.kind === "missile") {
        p.trailT -= dt;
        if (p.trailT <= 0) {
          p.trailT = 0.04;
          spawnTrail(p.pos, 0xbbbbbb);
        }
      }
      // Fuses & lifetime
      if (p.kind === "grenade") {
        if (p.mine) {
          if (p.resting && p.t > 1.5 && mineTriggered(p)) {
            detonate(p);
            removeProjectile(i);
            continue;
          }
          if (p.t > 600) {
            removeProjectile(i);
            continue;
          }
        } else if (p.t >= p.fuse) {
          detonate(p);
          removeProjectile(i);
          continue;
        }
      } else if (p.t >= p.life) {
        if (p.kind === "missile") detonate(p);
        removeProjectile(i);
        continue;
      }
    }
    updateTrails(dt);
  }
  function mineTriggered(p) {
    const P = G.player;
    if (p.from !== "player" && P.pos.distanceTo(p.pos) < 2.5) return true;
    for (const a of C.list)
      if (
        !a.dead &&
        a.inScene &&
        a !== p.from &&
        a.pos.distanceTo(p.pos) < 2.2 &&
        (p.from !== "player" || a.hostile() || true)
      )
        return true;
    return false;
  }
  /** Move a projectile along dir by len; handle collisions. Returns 'removed', true (handled), or false. */
  function sweep(p, dir, len) {
    const origin = p.pos;
    const isPlayerShot = p.from === "player";
    const wh = G.world.raycast(origin, dir, len + 0.05, {
      ignoreTags: ["actor", "foliage"],
      includeWater: p.kind !== "flame",
    });
    const wd = wh ? wh.dist : len;
    // Actors
    const ah =
      p.kind === "grenade" && p.t < 0.08
        ? null
        : C.rayActors(origin, dir, wd, {
            exclude: isPlayerShot ? null : p.from,
            aliveOnly: p.kind === "flame" || p.kind === "spit",
            noVirtual: true,
            skip: p.hitSet ? (a) => p.hitSet.has(a) : null,
          });
    const ph = !isPlayerShot ? C.rayPlayer(origin, dir, ah ? ah.t : wd) : null;
    // Flames: area burn, pass through
    if (p.kind === "flame") {
      const fr = 0.3 + (p.t / p.life) * 0.8;
      for (const a of C.list) {
        if (a.dead || !a.inScene || a === p.from || p.hitSet.has(a)) continue;
        if (a.centerPos(_q).distanceTo(origin) < fr + a.radius) {
          p.hitSet.add(a);
          let dmg = p.damage;
          if (isPlayerShot)
            dmg = playerDamage(
              dmg,
              C.weaponInfo(p.weaponId) || { skill: "firearms" },
              a,
              {},
            );
          C.applyDamage(a, dmg, {
            type: "fire",
            source: p.from,
            part: "torso",
            weaponId: p.weaponId,
            silent: false,
          });
          C.ignite(a, 3, isPlayerShot ? 4 : 3, p.from);
        }
      }
      if (!isPlayerShot && !p.hitSet.has("player")) {
        const P = G.player;
        if (
          _q.set(P.pos.x, P.pos.y + 1, P.pos.z).distanceTo(origin) <
          fr + 0.45
        ) {
          p.hitSet.add("player");
          P.damage(p.damage, { type: "fire", source: p.from });
        }
      }
      if (wh) {
        p.pos.copy(wh.point).addScaledVector(wh.normal, 0.1);
        p.vel.multiplyScalar(0.2);
        p.gravity = -2;
        return true;
      }
      return false;
    }
    if (ph) {
      const hp = origin.clone().addScaledVector(dir, ph.t);
      if (p.kind === "grenade") {
        bounce(p, new THREE.Vector3(-dir.x, 0.3, -dir.z).normalize(), hp);
        return true;
      }
      if (p.kind === "missile") {
        p.pos.copy(hp);
        detonate(p);
        return "removed";
      }
      const t = p.kind === "spit" ? p.type || "poison" : "energy";
      G.player.damage(p.damage, { type: t, source: p.from, part: ph.part });
      if (p.kind === "spit") {
        C.fx("blood", hp.clone(), UP.clone(), 1, 0x9adf40);
      }
      return "removed";
    }
    if (ah) {
      const hp = origin.clone().addScaledVector(dir, ah.t);
      const a = ah.actor;
      if (p.kind === "grenade") {
        if (p.sticky && !a.dead) {
          p.stuck = a;
          p.stickOff = hp.clone().sub(a.pos);
          p.pos.copy(hp);
          p.resting = true;
          C.sfx("bullet_flesh", { pos: hp, volume: 0.6 });
          return true;
        }
        bounce(p, new THREE.Vector3(-dir.x, 0.2, -dir.z).normalize(), hp);
        return true;
      }
      if (p.kind === "missile") {
        // direct hit bonus
        C.applyDamage(a, p.damage * 0.25, {
          type: "explosive",
          source: p.from,
          part: ah.key,
          weaponId: p.weaponId,
          dir: dir.clone(),
          point: hp.clone(),
        });
        p.pos.copy(hp);
        detonate(p);
        return "removed";
      }
      if (p.kind === "spit") {
        C.applyDamage(a, p.damage, {
          type: "poison",
          source: p.from,
          part: ah.key,
          point: hp.clone(),
          dir: dir.clone(),
        });
        return "removed";
      }
      return "removed";
    }
    if (wh) {
      const hp = wh.point.clone();
      if (p.kind === "grenade") {
        if (p.sticky && wh.dist < len + 0.05) {
          p.pos.copy(hp).addScaledVector(wh.normal, 0.05);
          p.resting = true;
          return true;
        }
        bounce(p, wh.normal, hp);
        return true;
      }
      if (p.kind === "missile") {
        p.pos.copy(hp).addScaledVector(wh.normal, 0.2);
        detonate(p);
        return "removed";
      }
      if (p.kind === "spit") {
        C.fx("decal", hp.clone(), wh.normal.clone(), "puddle");
        C.fx("impact", hp.clone(), wh.normal.clone(), "water");
        return "removed";
      }
      return "removed";
    }
    return false;
  }
  function bounce(p, n, point) {
    const v = p.vel;
    const vn = v.dot(n);
    v.addScaledVector(n, -1.6 * vn).multiplyScalar(p.restitution || 0.4);
    p.pos.copy(point).addScaledVector(n, 0.07);
    if (Math.abs(vn) > 2)
      C.sfx("empty_click", { pos: point, volume: 0.35, pitch: 0.6 });
    if (v.length() < 0.8 && n.y > 0.5) {
      v.set(0, 0, 0);
      p.resting = true;
    }
  }
  // Smoke trails (pooled sprites)
  const trails = [];
  function spawnTrail(pos, color) {
    let s;
    if (trails.length > 80) {
      s = trails.shift().s;
    } else {
      s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture(),
          color,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        }),
      );
      G.scene.add(s);
    }
    if (!s.parent) G.scene.add(s);
    s.position.copy(pos);
    s.scale.setScalar(0.3);
    s.material.opacity = 0.5;
    s.material.color.setHex(color);
    trails.push({ s, t: 0 });
  }
  function updateTrails(dt) {
    for (let i = trails.length - 1; i >= 0; i--) {
      const tr = trails[i];
      tr.t += dt;
      tr.s.scale.setScalar(0.3 + tr.t * 1.6);
      tr.s.material.opacity = Math.max(0, 0.5 - tr.t * 0.35);
      tr.s.position.y += dt * 0.4;
      if (tr.t > 1.4) {
        G.scene.remove(tr.s);
        tr.s.material.dispose();
        trails.splice(i, 1);
      }
    }
  }
  C.clearProjectiles = function () {
    while (projectiles.length) removeProjectile(projectiles.length - 1);
    for (const tr of trails) {
      G.scene.remove(tr.s);
      tr.s.material.dispose();
    }
    trails.length = 0;
    for (const b of bursts) {
      G.scene.remove(b.s);
    }
    bursts.length = 0;
    for (const r of tempRads) G.world.removeRadSource(r.src);
    tempRads.length = 0;
    for (const d of disints) {
      if (d.a.pile && d.a.pile.parent) d.a.pile.parent.remove(d.a.pile);
    }
    disints.length = 0;
  };
  CB.projectiles = () => projectiles;

  // ------------------------------------------------------------------
  // Crosshair target (HUD enemy health bar)
  // ------------------------------------------------------------------
  let chFrame = -1,
    chResult = null;
  CB.targetUnderCrosshair = function (maxDist) {
    if (chFrame === G.time.frame && !maxDist) return chResult;
    chFrame = G.time.frame;
    chResult = null;
    if (!G.camera) return null;
    const eye = G.player.eye,
      fwd = G.player.forward;
    const L = maxDist || 200;
    const wh = G.world.raycast(eye, fwd, L, {
      ignoreTags: ["actor", "foliage"],
    });
    const ah = C.rayActors(eye, fwd, wh ? wh.dist : L, {
      aliveOnly: true,
      noVirtual: true,
    });
    if (ah)
      chResult = {
        actor: ah.actor,
        part: ah.key,
        dist: ah.t,
        label: ah.hp.label,
      };
    return chResult;
  };

  // ------------------------------------------------------------------
  // Sneak detection for the HUD
  // ------------------------------------------------------------------
  let detT = 0,
    detVal = "hidden",
    detMax = 0;
