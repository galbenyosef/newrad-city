// play-inline-502 02 — mesh
// Lines 341-651 of readable/play-inline-502.pretty.js (statement-aligned).
  P.spawnProjectile = function (spec) {
    if (
      !spec.local &&
      combatReal() &&
      typeof G.combat.spawnProjectile === "function"
    ) {
      try {
        const r = G.combat.spawnProjectile(spec);
        if (r !== false) return r;
      } catch (e) {
        G.reportError("weapons:spawnProjectile", e);
      }
    }
    let mesh = projMesh(spec.kind);
    if (!mesh) {
      const wd = spec.weaponId && P.defs.get(spec.weaponId);
      const id =
        wd && wd.weapon.reloadType === "throw"
          ? spec.weaponId
          : spec.kind === "missile"
            ? (wd && wd.weapon.ammo) || "ammo_missile"
            : "frag_grenade";
      mesh =
        G.weapons.createWorldModel(id) ||
        new THREE.Mesh(
          new THREE.SphereGeometry(0.06),
          new THREE.MeshStandardMaterial({ color: 0x445533 }),
        );
    }
    mesh.position.copy(spec.pos);
    G.scene.add(mesh);
    const pr = {
      spec,
      mesh,
      vel: spec.vel.clone(),
      age: 0,
      fuse: spec.fuse || (spec.kind === "grenade" ? 3 : 8),
      stuck: false,
    };
    P.projectiles.push(pr);
    return pr;
  };
  const _pd = new THREE.Vector3(),
    _pn = new THREE.Vector3();
  P.updateProjectiles = function (dt) {
    if (!P.projectiles.length || dt <= 0) return;
    for (let i = P.projectiles.length - 1; i >= 0; i--) {
      const pr = P.projectiles[i],
        sp = pr.spec;
      pr.age += dt;
      let boom = pr.age > pr.fuse;
      if (!pr.stuck && !boom) {
        pr.vel.y -= (sp.gravity || 0) * dt;
        const step = pr.vel.length() * dt;
        if (step > 1e-5) {
          _pd.copy(pr.vel).normalize();
          let hit = G.world.raycast(pr.mesh.position, _pd, step + 0.05);
          // contact payloads (molotov) also break on whoever they hit
          if (
            sp.impact &&
            pr.age > 0.06 &&
            G.__cmb &&
            typeof G.__cmb.rayActors === "function"
          ) {
            try {
              const ah = G.__cmb.rayActors(
                pr.mesh.position,
                _pd,
                hit ? hit.dist : step + 0.05,
                { noVirtual: true },
              );
              if (ah)
                hit = {
                  point: pr.mesh.position.clone().addScaledVector(_pd, ah.t),
                  normal: _pn.copy(_pd).negate().clone(),
                  dist: ah.t,
                };
            } catch (e) {
              /* ignore */
            }
          }
          if (hit) {
            if (sp.kind === "grenade" && sp.impact) {
              pr.mesh.position
                .copy(hit.point)
                .addScaledVector(hit.normal, 0.05);
              boom = true;
            } else if (sp.kind === "grenade") {
              if (sp.mine) {
                pr.stuck = true;
                pr.mesh.position
                  .copy(hit.point)
                  .addScaledVector(hit.normal, 0.03);
                if (P.hasSfx("mine_beep"))
                  P.snd("mine_beep", null, { pos: hit.point, volume: 0.6 });
              } else {
                // bounce
                _pn.copy(hit.normal);
                pr.vel.reflect(_pn).multiplyScalar(0.38);
                pr.mesh.position.copy(hit.point).addScaledVector(_pn, 0.05);
                if (pr.vel.length() > 1.2)
                  P.snd(
                    "grenade_bounce",
                    "ricochet",
                    P.hasSfx("grenade_bounce")
                      ? { pos: hit.point, volume: 0.6 }
                      : { pos: hit.point, volume: 0.25, pitch: 0.5 },
                  );
              }
            } else if (sp.kind === "flame") {
              G.fx.fire && Math.random() < 0.15 && G.fx.fire(hit.point, 0.4);
              boom = false;
              pr.age = 99;
            } else {
              pr.mesh.position.copy(hit.point);
              boom = true;
            }
          } else pr.mesh.position.addScaledVector(pr.vel, dt);
        }
        if (sp.kind === "missile") {
          pr.mesh.lookAt(_pn.copy(pr.mesh.position).add(pr.vel));
          if (Math.random() < 0.5 && G.fx.dust) G.fx.dust(pr.mesh.position);
        }
        if (sp.kind === "grenade" && !sp.mine) {
          pr.mesh.rotation.x += dt * 8;
          pr.mesh.rotation.z += dt * 5;
        }
      }
      if (sp.kind === "flame" && pr.age > 0.6) {
        G.util.disposeObject(pr.mesh);
        P.projectiles.splice(i, 1);
        continue;
      }
      if (boom || pr.age > 20) {
        if (sp.kind !== "flame")
          explodeAt(
            pr.mesh.position,
            sp.radius || 4,
            sp.damage || 50,
            sp.explosionKind || "normal",
            sp,
          );
        G.util.disposeObject(pr.mesh);
        P.projectiles.splice(i, 1);
      }
    }
  };
  P.clearProjectiles = function () {
    for (const pr of P.projectiles) G.util.disposeObject(pr.mesh);
    P.projectiles.length = 0;
  };

  // ------------------------------------------------------------------
  // Firing
  // ------------------------------------------------------------------
  const FLASH_LIGHT = { ballistic: 0xffb060, gyro: 0xffa050, rocket: 0xffa050 };
  /**
   * Fire one shot of the current weapon (real time; there is no target-queue mode).
   * Returns true when a shot left the barrel.
   */
  P.fireOnce = function (opts) {
    opts = opts || {};
    const cur = S.cur;
    if (!cur) return false;
    const def = cur.def,
      w = def.weapon;
    if (w.magSize > 0) {
      if (cur.mag <= 0) return false;
      cur.mag -= 1;
      S.mags[cur.id] = cur.mag;
    }
    const cond = P.getCond(cur.id);
    // --- jams on worn guns
    if (
      w.skill === "firearms" &&
      w.magSize > 1 &&
      cond < 0.45 &&
      Math.random() < (0.45 - cond) * 0.07
    ) {
      cur.mag += 1;
      S.mags[cur.id] = cur.mag;
      P.startAction(P.jamAction(V().model, def, null));
      G.events.emit("weaponJammed", cur.id);
      return false;
    }
    decay(def);
    const pl = G.player;
    const origin = pl.eye.clone();
    const dir = pl.forward.clone();
    const muzzle = P.muzzleWorld();
    const spread = P.currentSpread(def);
    const shot = {
      from: "player",
      origin,
      dir,
      weaponId: cur.id,
      weapon: w,
      def,
      damage: w.damage,
      spread,
      pellets: w.pellets || 1,
      range: w.range,
      projectile: w.projectile,
      damageType: w.damageType,
      explosionRadius: w.explosionRadius,
      projectileSpeed: w.projectileSpeed,
      critMult: w.critMult,
      critChance: w.critChance,
      condition: cond,
      muzzle,
      skill: w.skill,
      beamColor: w.beamColor,
      sneak: !!pl.sneaking,
      target: opts.target,
    };
    {
      // gyrojets, rivets and the siren horn resolve their own shots (visible rockets / rivets, the sonic cone) — 70_craft.js
      if (w.customProj && P.customShot && P.customShot(shot, cur)) {
        /* handled */
      } else if (combatReal()) {
        try {
          G.combat.fire(shot);
        } catch (e) {
          G.reportError("weapons:combat.fire", e);
        }
      } else if (w.projectile && w.projectile !== "hitscan") {
        const speed = w.projectileSpeed || 40;
        const d = P.applySpread(dir, spread);
        const kind = w.projectile;
        P.spawnProjectile({
          kind,
          pos: muzzle.clone(),
          vel: d.multiplyScalar(speed),
          gravity: 0,
          damage: w.damage,
          radius: w.explosionRadius,
          from: "player",
          weaponId: cur.id,
          fuse: kind === "flame" ? 0.6 : 10,
        });
      } else fallbackHitscan(shot);
    }
    // --- feedback
    const v = V();
    v.shotT = 0;
    if (v.model && v.model.cfg.cylinderStep)
      v.cylTarget = (v.cylTarget || 0) - (Math.PI * 2) / 6;
    const adsK = v.adsT > 0.5 ? 0.6 : 1;
    const rm = P.rpgMult("recoilMult");
    const rp = (w.recoil || [0.01, 0.003]).map((x) => x * rm);
    if (w.flash !== "flame") {
      v.kick(w.kick || 1, w);
      pl.addRecoil(
        rp[0] * adsK * (0.85 + Math.random() * 0.3),
        (Math.random() - 0.5) * 2 * rp[1] * adsK,
      );
      v.muzzleFlash(w.flash, w.pellets > 1 ? 1.4 : 1);
      if (v.shotSmoke) v.shotSmoke(w);
      if (FLASH_LIGHT[w.flash])
        G.fx.flash(
          muzzle,
          FLASH_LIGHT[w.flash],
          w.flash === "rocket" ? 4 : 1.8,
          0.06,
        );
    } else {
      pl.addRecoil(rp[0] * 0.3, (Math.random() - 0.5) * rp[1]);
    }
    if (
      w.shell &&
      !w.cycle &&
      w.reloadType !== "revolver" &&
      w.reloadType !== "breakaction"
    )
      v.ejectShell(w.shell, "eject", null, 1.7);
    if (
      w.flash !== "flame" &&
      !(w.viewmodel === "minigun" && (S.shotCount = (S.shotCount || 0) + 1) % 2)
    ) {
      const ss = P.shotSound(w);
      G.sfx.play(ss.name, {
        volume: ss.volume,
        pitch: ss.pitch * (0.96 + Math.random() * 0.08),
      });
    }
    if (w.backblast) {
      pl.shake(0.32, 0.3);
      if (P.backblast) P.backblast(w, cur.id);
    } else if (w.viewmodel === "missile_launcher") pl.shake(0.25, 0.25);
    else if (w.pellets > 1) pl.shake(0.08, 0.1);
    S.bloom = Math.min(w.maxBloom || 0.06, S.bloom + (w.bloom || 0));
    G.events.emit("weaponFired", def);
    emitAmmo();
    // manual action / auto-reload when empty
    if (w.cycle && cur.mag > 0) {
      const ca = P.cycleAction(v.model, def, w.cycle);
      P.startAction(ca);
    }
    if (
      w.magSize > 0 &&
      cur.mag <= 0 &&
      P.reserve(def) > 0 &&
      w.reloadType !== "throw"
    )
      S.autoReloadT = 0.35;
    return true;
  };

  // ------------------------------------------------------------------
  // Reload
  // ------------------------------------------------------------------
