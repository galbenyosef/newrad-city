// play-inline-511 07 — pos
// Lines 1867-2203 of readable/play-inline-511.pretty.js (statement-aligned).
  CB.melee = function (opts) {
    opts = opts || {};
    const from = opts.from || "player";
    const range = opts.range || 2;
    const arc = opts.arc || 1.0;
    if (from === "player") {
      const P = G.player;
      const info = C.weaponInfo(opts.weaponId) || C.weaponInfo("unarmed");
      const eye = opts.origin || P.eye,
        fwd = opts.dir || P.forward;
      const fromWeapons = !!opts.weapon; // the weapons module plays its own hit sounds
      // Precise ray first
      let hit = C.rayActors(eye, fwd, range + 0.4, { noVirtual: true });
      let part = hit ? hit.key : "torso",
        target = hit ? hit.actor : null;
      if (!target) {
        let best = null,
          bs = -1e9;
        for (const a of C.list) {
          if (!a.inScene || a.disintegrated) continue;
          const dx = a.pos.x - P.pos.x,
            dz = a.pos.z - P.pos.z,
            d = Math.hypot(dx, dz) - a.radius;
          if (d > range) continue;
          const dy = a.pos.y - P.pos.y;
          if (dy > 2 || dy < -2.2) continue;
          const ang = Math.acos(
            C.clamp(
              (dx * fwd.x + dz * fwd.z) /
                (Math.hypot(dx, dz) * Math.hypot(fwd.x, fwd.z) || 1),
              -1,
              1,
            ),
          );
          if (ang > arc) continue;
          const s = -d - ang * 2 - (a.dead ? 5 : 0);
          if (s > bs) {
            bs = s;
            best = a;
          }
        }
        target = best;
      }
      if (!target) {
        const wh = G.world.raycast(eye, fwd, range, { ignoreTags: ["actor"] });
        if (wh) {
          C.fx(
            "impact",
            wh.point.clone(),
            wh.normal.clone(),
            wh.surface || "concrete",
          );
          if (!fromWeapons)
            C.sfx(wh.surface === "metal" ? "ricochet" : "melee_hit", {
              pos: wh.point,
              volume: 0.4,
            });
          if (!G.isStub("props") && typeof G.props.damageAt === "function") {
            try {
              G.props.damageAt(wh.point, (opts.damage || 5) * 0.5);
            } catch (e) {
              /* ignore */
            }
          }
        }
        C.noise(P.pos, 8, "player", "step");
        return { hit: null };
      }
      // (power attacks: the weapons module already doubles opts.damage)
      let dmg = playerDamage(
        opts.damage !== undefined ? opts.damage : info.damage,
        info,
        target,
        opts,
      );
      let crit = Math.random() < C.playerCritChance(info),
        sneak = false;
      if (!target.dead && C.isUnaware(target)) {
        crit = true;
        sneak = true;
      }
      const wasDead = target.dead;
      const pt = hit
        ? eye.clone().addScaledVector(fwd, hit.t)
        : target.centerPos();
      const final = C.applyDamage(target, dmg, {
        type: "melee",
        source: "player",
        part,
        crit,
        critMult: info.critMult,
        sneak,
        melee: true,
        weaponId: opts.weaponId,
        dir: fwd.clone(),
        point: pt,
      });
      if (!fromWeapons)
        C.sfx(info.unarmed || info.id === "unarmed" ? "punch" : "melee_hit", {
          pos: pt,
          volume: 0.9,
        });
      if (sneak && !wasDead) G.notify("Sneak attack critical!");
      // Knock the victim back a bit (power fist / sledge)
      if (!target.dead && (opts.power || info.damage > 25) && !target.td.boss) {
        target.slowT = now() + 0.5;
      }
      // heavy power attacks (sledgehammer, fire axe) and crits can floor them (35_reactions)
      if (
        !target.dead &&
        C.tryKnockdown &&
        ((opts.power && (crit || info.damage > 30)) ||
          (crit && info.damage > 45))
      )
        C.tryKnockdown(target, opts.power ? 0.7 : 0.5, fwd);
      return {
        hit: target,
        part,
        damage: final,
        crit,
        killed: !wasDead && target.dead,
      };
    }
    // ---- NPC melee ----
    const a = from;
    const t = a.target;
    const dmg = opts.damage || 5;
    const f = a.forward(_d);
    const hitsPlayer = () => {
      const P = G.player;
      if (!P.alive) return false;
      const dx = P.pos.x - a.pos.x,
        dz = P.pos.z - a.pos.z,
        d = Math.hypot(dx, dz);
      if (
        d > range + P.radius ||
        Math.abs(P.pos.y - a.pos.y) > Math.max(2.2, a.height * 0.8)
      )
        return false;
      if (opts.slam) return true;
      return (dx * f.x + dz * f.z) / (d || 1) > Math.cos(arc);
    };
    let result = { hit: null };
    if ((t === "player" || opts.slam || a.frenzied) && hitsPlayer()) {
      const P = G.player;
      const d = dmg;
      P.damage(d, { type: opts.type || "melee", source: a, part: "torso" });
      C.sfx(
        a.isCreature
          ? "bullet_flesh"
          : a.weapon && a.weapon.skill === "melee"
            ? "melee_hit"
            : "punch",
        { pos: P.pos, volume: 0.9 },
      );
      if (opts.knock) {
        const dx = P.pos.x - a.pos.x,
          dz = P.pos.z - a.pos.z,
          dd = Math.hypot(dx, dz) || 1;
        P.vel.x += (dx / dd) * opts.knock;
        P.vel.z += (dz / dd) * opts.knock;
        P.vel.y += opts.knock * 0.35;
        P.onGround = false;
        P.shake(0.6, 0.35);
      } else P.shake(0.25, 0.2);
      if (opts.rads) P.addRads(opts.rads);
      if (opts.poison) C.poisonPlayer(opts.poison, a);
      result = { hit: "player", damage: d };
    } else if (t && t !== "player" && !t.dead) {
      const dx = t.pos.x - a.pos.x,
        dz = t.pos.z - a.pos.z,
        d = Math.hypot(dx, dz);
      if (d < range + t.radius) {
        C.applyDamage(t, dmg, {
          type: opts.type || "melee",
          source: a,
          part: C.pick(["torso", "torso", "head", "leftArm", "rightArm"]),
          dir: f.clone(),
          point: t.centerPos(),
        });
        C.sfx("melee_hit", { pos: t.pos, volume: 0.8 });
        if (opts.knock && !t.dead && C.tryKnockdown)
          C.tryKnockdown(t, Math.min(1, 0.35 + opts.knock * 0.06), f);
        result = { hit: t, damage: dmg };
      }
    }
    if (opts.slam) {
      const c = a.pos.clone().addScaledVector(f, range * 0.6);
      C.fx("dust", c.clone());
      C.fx("impact", c.clone(), UP.clone(), "rubble");
      C.sfx("explosion", { pos: c, volume: 0.5, pitch: 0.5 });
      const pd = G.player.pos.distanceTo(c);
      if (pd < opts.slam * 3)
        G.player.shake(C.clamp(1 - pd / (opts.slam * 3), 0.1, 0.8), 0.5);
      if (!G.isStub("props") && typeof G.props.damageAt === "function") {
        try {
          G.props.damageAt(c, dmg * 0.5, opts.slam);
        } catch (e) {
          /* ignore */
        }
      }
    }
    return result;
  };

  // ------------------------------------------------------------------
  // Projectiles
  // ------------------------------------------------------------------
  const projectiles = [];
  let PG = null; // shared projectile assets
  function projAssets() {
    if (PG) return PG;
    const std = (c, o) => {
      const m = new THREE.MeshStandardMaterial(
        Object.assign({ color: c, roughness: 0.5, metalness: 0.4 }, o || {}),
      );
      m.userData.shared = true;
      return m;
    };
    const grenade = new THREE.Group();
    grenade.add(
      new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), std(0x3a4a2a)),
    );
    const pin = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.05, 0.03),
      std(0x888888),
    );
    pin.position.y = 0.07;
    grenade.add(pin);
    const missile = new THREE.Group();
    const mb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.7, 8),
      std(0x6a6a5a),
    );
    mb.rotation.x = Math.PI / 2;
    missile.add(mb);
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.18, 8),
      std(0xaa3322),
    );
    tip.rotation.x = -Math.PI / 2;
    tip.position.z = -0.44;
    missile.add(tip);
    PG = { grenade, missile };
    return PG;
  }
  const _seg = new THREE.Vector3();
  /**
   * spawnProjectile({kind:'grenade'|'missile'|'flame'|'spit', pos, vel, gravity, damage, radius, from, fuse?,
   *   explosionKind?, weaponId?, life?, type?}) → projectile record
   */
  CB.spawnProjectile = function (o) {
    projAssets();
    o = Object.assign({}, o, {
      from: C.normSource(o.from === undefined ? "player" : o.from),
    });
    const kind = o.kind || "grenade";
    const p = {
      kind,
      pos: o.pos.clone(),
      vel: o.vel ? o.vel.clone() : new THREE.Vector3(),
      gravity:
        o.gravity !== undefined
          ? o.gravity
          : kind === "grenade" || kind === "spit"
            ? 9.8
            : 0,
      damage: o.damage || 20,
      radius: o.radius || 3,
      from: o.from || null,
      t: 0,
      fuse: o.fuse || (kind === "grenade" ? 2.8 : 0),
      life: o.life || (kind === "flame" ? 0.7 : 8),
      explosionKind: o.explosionKind || "normal",
      weaponId: o.weaponId || null,
      crit: o.crit,
      type: o.type,
      hitSet: null,
      stuck: null,
      obj: null,
      trailT: 0,
    };
    if (
      kind === "grenade" &&
      (o.mine || (p.weaponId && /mine/.test(p.weaponId)))
    ) {
      p.mine = true;
      p.fuse = 1e9;
    }
    if (o.sticky !== undefined) p.sticky = !!o.sticky;
    p.restitution = o.bounce !== undefined ? o.bounce : 0.4;
    // Visuals
    let obj;
    if (kind === "grenade") {
      obj = PG.grenade.clone();
    } else if (kind === "missile") {
      obj = PG.missile.clone();
      const s = new THREE.Sprite(spriteMat(0xffa040, 1));
      s.scale.setScalar(0.5);
      s.position.z = 0.45;
      obj.add(s);
    } else if (kind === "flame") {
      obj = new THREE.Sprite(
        spriteMat(Math.random() < 0.5 ? 0xff8a20 : 0xffc040, 0.9),
      );
      obj.scale.setScalar(0.25);
      p.hitSet = new Set();
    } else if (kind === "spit") {
      obj = new THREE.Sprite(spriteMat(0x9adf40, 1));
      obj.scale.setScalar(0.3);
    } else obj = new THREE.Sprite(spriteMat(0xffffff, 1));
    obj.position.copy(p.pos);
    G.scene.add(obj);
    p.obj = obj;
    projectiles.push(p);
    if (kind === "missile")
      C.sfx("gun_missile", { pos: p.pos, volume: 0.4, pitch: 1.4 });
    return p;
  };
  function removeProjectile(i) {
    const p = projectiles[i];
    if (p.obj) {
      G.scene.remove(p.obj);
      p.obj.traverse((o) => {
        if (o.material && !o.material.userData.shared) o.material.dispose();
      });
    }
    projectiles.splice(i, 1);
  }
  function detonate(p) {
    const pos = p.pos.clone();
    CB.explode(pos, p.radius, p.damage, {
      source: p.from,
      kind: p.explosionKind,
      weaponId: p.weaponId,
    });
  }
