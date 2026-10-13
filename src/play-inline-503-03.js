// play-inline-503 03 — obj
// Lines 705-1033 of readable/play-inline-503.pretty.js (statement-aligned).
  function actorOnSegment(a, b, skip) {
    if (
      G.isStub("actors") ||
      !G.actors ||
      typeof G.actors.inRadius !== "function"
    )
      return null;
    const mid = _c.copy(a).add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    let list = [];
    try {
      list = G.actors.inRadius(mid, len / 2 + 2.5) || [];
    } catch (e) {
      list = [];
    }
    let best = null,
      bestT = Infinity;
    for (const act of list) {
      if (!act || act.removed || act.dead || skip.has(act)) continue;
      const ap = act.pos;
      if (!ap) continue;
      const h = act.height || (act.char && act.char.height) || 1.75,
        r = Math.max(0.35, act.radius || 0.4);
      // closest approach of the segment to the actor's vertical axis (2D), then height check
      const dx = b.x - a.x,
        dz = b.z - a.z,
        fx = a.x - ap.x,
        fz = a.z - ap.z;
      const L2 = dx * dx + dz * dz;
      let t = L2 > 1e-8 ? -(fx * dx + fz * dz) / L2 : 0;
      t = Math.max(0, Math.min(1, t));
      const px = fx + dx * t,
        pz = fz + dz * t;
      if (px * px + pz * pz > r * r) continue;
      const y = a.y + (b.y - a.y) * t;
      if (y < ap.y - 0.1 || y > ap.y + h + 0.15) continue;
      if (t < bestT) {
        bestT = t;
        best = act;
      }
    }
    return best ? { actor: best, t: bestT } : null;
  }
  function hitActor(p, act, from, dir, damage) {
    const res = { hit: false };
    if (P.combatReal()) {
      try {
        // resolve through combat (skill/condition scaling, crits, sneak attacks, limbs, gore, XP)
        const toC = _c
          .set(act.pos.x, act.pos.y + (act.height || 1.75) * 0.6, act.pos.z)
          .sub(from);
        const aim = Math.abs(toC.normalize().dot(dir)) > 0.6 ? dir : toC;
        const r = G.combat.fire({
          from: "player",
          origin: from.clone().addScaledVector(aim, -0.4),
          dir: aim.clone().normalize(),
          weaponId: p.weaponId,
          weapon: p.w,
          damage,
          spread: 0,
          pellets: 1,
          range: 4,
          projectile: "hitscan",
          damageType: "ballistic",
          muzzle: from.clone(),
          condition: P.getCond(p.weaponId),
        });
        if (r && r.hit) {
          res.hit = true;
          res.point = r.hit.point;
        }
      } catch (e) {
        G.reportError("weapons:customHit", e);
      }
    } else if (typeof act.damage === "function") {
      try {
        act.damage(damage, {
          type: "ballistic",
          source: "player",
          weaponId: p.weaponId,
        });
        res.hit = true;
      } catch (e) {
        /* ignore */
      }
    }
    return res;
  }
  function embed(p, point, dir) {
    const obj = p.obj;
    obj.position.copy(point).addScaledVector(dir, 0.012);
    _q.setFromUnitVectors(_z, dir.clone().negate());
    obj.quaternion.copy(_q);
    stuck.push({ obj, t: 20 });
    while (stuck.length > 24) G.scene.remove(stuck.shift().obj);
  }
  // ticker-tape: paper strips shed along the rocket's path
  let paperGeo = null;
  const paperMats = [];
  function spawnPaper(pos) {
    if (papers.length > 160) {
      const old = papers.shift();
      G.scene.remove(old.obj);
    }
    if (!paperGeo) {
      paperGeo = new THREE.PlaneGeometry(0.035, 0.12);
      for (const c of [0xf4f0e2, 0xf4f0e2, 0xc8302a, 0x2c5aa0]) {
        const m = new THREE.MeshBasicMaterial({
          color: c,
          side: THREE.DoubleSide,
          fog: true,
        });
        m.userData.shared = true;
        paperMats.push(m);
      }
    }
    const m = new THREE.Mesh(
      paperGeo,
      paperMats[(Math.random() * paperMats.length) | 0],
    );
    m.position.copy(pos);
    m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    G.scene.add(m);
    papers.push({
      obj: m,
      t: 3.5 + Math.random() * 2,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        0.6 + Math.random(),
        (Math.random() - 0.5) * 1.5,
      ),
      spin: new THREE.Vector3(
        Math.random() * 6 - 3,
        Math.random() * 6 - 3,
        Math.random() * 4 - 2,
      ),
    });
  }
  function updateFlying(dt) {
    if (dt <= 0) return;
    for (let i = flying.length - 1; i >= 0; i--) {
      const p = flying[i];
      p.age += dt;
      if (p.kind === "gyro") {
        // the rocket accelerates: ~0.25 s from a stroll to full speed
        p.speed = Math.min(p.maxSpeed, p.speed + 950 * dt);
        p.vel.copy(p.dir).multiplyScalar(p.speed);
      }
      p.vel.y -= (GRAV[p.kind] || 3) * dt;
      const step = p.vel.length() * dt;
      _d.copy(p.vel).normalize();
      const next = p.pos.clone().addScaledVector(p.vel, dt);
      let done = false;
      // actors first (so a raider in front of a wall gets hit)
      const ah = p.age < 4 ? actorOnSegment(p.pos, next, p.hitSet) : null;
      if (ah) {
        p.hitSet.add(ah.actor);
        const at = p.pos.clone().lerp(next, ah.t);
        const dmg =
          p.kind === "gyro"
            ? Math.round(p.damage * gyroFactor(p.w.gyro, p.dist + step * ah.t))
            : p.damage;
        const r = hitActor(p, ah.actor, at, _d.clone(), dmg);
        if (r.hit) {
          done = true;
          G.scene.remove(p.obj);
          if (p.kind === "gyro" && fxOk()) {
            try {
              G.fx.sparks(at, { count: 6, speed: 4 });
            } catch (e) {
              /* ignore */
            }
          }
        }
      }
      // world
      if (!done) {
        const wh = G.world.raycast(p.pos, _d, step + 0.02, {
          ignoreTags: ["actor", "interactable_self", "foliage"],
        });
        if (wh) {
          try {
            G.fx.impact(wh.point, wh.normal, wh.surface || "metal");
          } catch (e) {
            /* ignore */
          }
          try {
            G.sfx.play(p.kind === "rivet" ? "ricochet" : "bullet_impact", {
              pos: wh.point,
              volume: p.kind === "rivet" ? 0.6 : 0.45,
              pitch: p.kind === "rivet" ? 0.55 : 1.2,
            });
          } catch (e) {
            /* ignore */
          }
          if (!G.isStub("props") && G.props.damageAt) {
            try {
              G.props.damageAt(wh.point, p.damage);
            } catch (e) {
              /* ignore */
            }
          }
          if (p.kind === "rivet") embed(p, wh.point, _d.clone());
          else {
            G.scene.remove(p.obj);
            if (fxOk()) {
              try {
                G.fx.sparks(wh.point, { count: 8, speed: 5 });
              } catch (e) {
                /* ignore */
              }
            }
          }
          done = true;
        } else {
          p.pos.copy(next);
          p.dist += step;
        }
      }
      if (done) {
        flying.splice(i, 1);
        continue;
      }
      // visuals: the model starts at the gun muzzle and converges on the true path within ~6 m
      const k = Math.min(1, p.age * 6);
      p.vis.lerp(p.pos, k);
      p.obj.position.copy(p.vis);
      if (p.vel.lengthSq() > 1e-4) {
        _q.setFromUnitVectors(_z, _d.clone().negate());
        p.obj.quaternion.copy(_q);
      }
      if (p.kind === "gyro") {
        p.puffT -= dt;
        if (p.puffT <= 0 && fxOk()) {
          p.puffT = 0.035;
          try {
            G.fx.dust(p.obj.position, {
              scale: 0.14,
              count: 1,
              color: 0xd8d4ca,
            });
          } catch (e) {
            /* ignore */
          }
        }
        if (p.w.streamers) {
          p.paperT -= dt;
          if (p.paperT <= 0) {
            p.paperT = 0.03;
            spawnPaper(p.obj.position);
          }
        }
      }
      if (p.age > 4) {
        G.scene.remove(p.obj);
        flying.splice(i, 1);
      }
    }
    for (let i = stuck.length - 1; i >= 0; i--) {
      stuck[i].t -= dt;
      if (stuck[i].t <= 0) {
        G.scene.remove(stuck[i].obj);
        stuck.splice(i, 1);
      }
    }
    for (let i = papers.length - 1; i >= 0; i--) {
      const q = papers[i];
      q.t -= dt;
      q.vel.y = Math.max(-0.7, q.vel.y - 2.2 * dt);
      q.vel.x *= 0.985;
      q.vel.z *= 0.985;
      q.obj.position.addScaledVector(q.vel, dt);
      q.obj.rotation.x += q.spin.x * dt;
      q.obj.rotation.y += q.spin.y * dt;
      q.obj.rotation.z += q.spin.z * dt;
      if (q.t <= 0) {
        G.scene.remove(q.obj);
        papers.splice(i, 1);
      }
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.t += dt;
      const k = r.t / 0.5;
      if (k >= 1) {
        G.scene.remove(r.obj);
        r.obj.material.dispose();
        rings.splice(i, 1);
        continue;
      }
      const s = 0.15 + k * r.base;
      r.obj.scale.setScalar(s);
      r.obj.position.copy(r.from).addScaledVector(r.dir, 0.4 + k * r.reach);
      r.obj.material.opacity = 0.55 * (1 - k);
    }
  }

  // ------------------------------------------------------------------
  // Siren Horn: one shriek hits everything in a short cone (no projectile)
  // ------------------------------------------------------------------
  let ringGeo = null;
  function sirenRings(from, dir, range) {
    if (!ringGeo) ringGeo = new THREE.RingGeometry(0.82, 1.0, 48);
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xcfeefa,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
        fog: false,
      });
      const m = new THREE.Mesh(ringGeo, mat);
      _q.setFromUnitVectors(_z, dir);
      m.quaternion.copy(_q);
      m.position.copy(from);
      G.scene.add(m);
      rings.push({
        obj: m,
        t: -i * 0.09,
        from: from.clone(),
        dir: dir.clone(),
        base: range * 0.55,
        reach: range * 0.85,
      });
    }
  }
