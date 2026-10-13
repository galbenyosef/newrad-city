// play-inline-503 02 — actor
// Lines 380-704 of readable/play-inline-503.pretty.js (statement-aligned).
  W.modsOf = (id) => P.modsOf(id);
  W.canInstallMod = function (weaponId, modId) {
    const m = P.MODS[modId];
    if (!m) return false;
    if (m.fits.indexOf(weaponId) < 0) return false;
    const have = P.modsOf(weaponId);
    if (have.indexOf(modId) >= 0) return false;
    if (have.some((x) => P.MODS[x] && P.MODS[x].kind === m.kind)) return false;
    return true;
  };
  W.installMod = function (weaponId, modId) {
    if (!W.canInstallMod(weaponId, modId))
      return { ok: false, reason: "That mod doesn't fit." };
    if (invReal() && count(modId) < 1)
      return { ok: false, reason: "You don't have that mod." };
    if (invReal() && count(weaponId) < 1)
      return { ok: false, reason: "You don't have that weapon." };
    if (invReal()) {
      try {
        G.inventory.remove(modId, 1, { silent: true });
      } catch (e) {
        return { ok: false, reason: "Inventory error." };
      }
    }
    S.mods[weaponId] = P.modsOf(weaponId).concat([modId]);
    G.notify(itemName(modId) + " installed on " + itemName(weaponId) + ".");
    sfx("ui_equip", "reload", { volume: 0.6 });
    // re-derive the equipped def & view model (the gun lowers, the modded model comes up)
    if (S.cur && S.cur.id === weaponId)
      W.equip(weaponId, {
        refresh: true,
        fromInventory: true,
        keepHolster: true,
      });
    // a bigger magazine is loaded at the bench: top the equipped (or stored) magazine up to the new capacity
    try {
      const md = P.moddedDef ? P.moddedDef(W.getDef(weaponId)) : null,
        w = md && md.weapon;
      if (
        w &&
        w.magSize > 0 &&
        w.ammo &&
        !w.ammoAny &&
        w.reloadType !== "throw"
      ) {
        const cur = S.cur && S.cur.id === weaponId ? S.cur : null;
        const have = cur ? cur.mag : S.mags[weaponId] || 0;
        const need = w.magSize - have;
        if (need > 0 && (S.mags[weaponId] !== undefined || cur)) {
          const got = invReal()
            ? P.takeAmmo(w.ammo, Math.min(need, P.reserve(md)))
            : 0;
          if (got > 0) {
            if (cur) cur.mag += got;
            S.mags[weaponId] = have + got;
            G.events.emit("ammoChanged", W.current());
          }
        }
      }
    } catch (e) {
      G.reportError("weapons:modTopUp", e);
    }
    G.events.emit("weaponModded", weaponId, modId);
    return { ok: true };
  };

  // ------------------------------------------------------------------
  // Hit effects (stun, rads, crippling, burns) — from combat's actorDamaged
  // so they apply to projectile, hitscan and melee hits alike
  // ------------------------------------------------------------------
  // combat's public cripple/ignite (round-1 integration), falling back to its internal object
  const cmb = () =>
    !G.isStub("combat") &&
    typeof G.combat.cripple === "function" &&
    typeof G.combat.ignite === "function"
      ? G.combat
      : CMB();
  const dots = [];
  function addDot(actor, dps, secs, type) {
    const d = dots.find((x) => x.actor === actor && x.type === type);
    if (d) {
      d.t = Math.max(d.t, secs);
      d.dps = Math.max(d.dps, dps);
      return;
    }
    dots.push({ actor, dps, t: secs, type, acc: 0 });
  }
  const LIMBS = ["leftArm", "rightArm", "leftLeg", "rightLeg"];
  /** Stun: the actor loses its footing, its aim and its next move for a moment. */
  function stun(actor, secs) {
    const t = now();
    if (actor.isRobot) secs *= 1.4; // shorted out
    actor.slowT = Math.max(actor.slowT || 0, t + secs);
    actor.aimT = Math.max(actor.aimT || 0, t + secs);
    actor.suppressT = Math.max(actor.suppressT || 0, t + secs);
    actor.pendingMelee = null;
    if (actor.lungeT) actor.lungeT = 0;
    if (fxOk() && actor.centerPos) {
      try {
        G.fx.arc(actor.centerPos(), { scale: 1.2, count: 4 });
      } catch (e) {
        /* ignore */
      }
    }
  }
  P.stunActor = stun;
  P.onWeaponHitActor = function (actor, w, info) {
    if (!actor || !w || actor.dead) return;
    if (w.igniteOnHit) {
      const c = cmb();
      if (c && typeof c.ignite === "function") {
        try {
          c.ignite(actor, w.igniteOnHit.secs, w.igniteOnHit.dps, "player");
        } catch (e) {
          addDot(actor, w.igniteOnHit.dps, w.igniteOnHit.secs, "fire");
        }
      } else addDot(actor, w.igniteOnHit.dps, w.igniteOnHit.secs, "fire");
    }
    if (w.radOnHit) {
      addDot(actor, w.radOnHit.dps, w.radOnHit.secs, "rad");
      if (fxOk() && actor.centerPos) {
        try {
          G.fx.flash(actor.centerPos(), 0xffa040, 1.2, 0.12, { range: 4 });
        } catch (e) {
          /* ignore */
        }
      }
    }
    if (w.stunOnHit) stun(actor, w.stunOnHit.secs || 1.2);
    if (w.crippleChance && Math.random() < w.crippleChance) {
      const c = cmb();
      const part =
        info && LIMBS.indexOf(info.part) >= 0
          ? info.part
          : LIMBS[(Math.random() * 4) | 0];
      if (
        c &&
        typeof c.cripple === "function" &&
        actor.limbs &&
        actor.limbs[part]
      ) {
        try {
          c.cripple(actor, part, "player");
        } catch (e) {
          /* ignore */
        }
      } else if (/Leg/.test(part)) actor.legsCrippled = true;
    }
  };
  let hookBusy = false;
  G.events.on("actorDamaged", (actor, amount, info) => {
    if (hookBusy || !info || !info.weaponId || info.dot) return;
    const src = info.source;
    if (src !== "player" && src !== G.player) return;
    const def = P.defs.get(info.weaponId);
    const w = def && def.weapon;
    if (!w || !(w.crippleChance || w.igniteOnHit || w.stunOnHit || w.radOnHit))
      return;
    hookBusy = true;
    try {
      P.onWeaponHitActor(
        actor,
        S.cur && S.cur.id === info.weaponId ? S.cur.def.weapon : w,
        info,
      );
    } catch (e) {
      G.reportError("weapons:hitFx", e);
    } finally {
      hookBusy = false;
    }
  });
  function updateDots(dt) {
    if (!dots.length || dt <= 0) return;
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      if (!d.actor || d.actor.dead || d.actor.removed || d.t <= 0) {
        dots.splice(i, 1);
        continue;
      }
      d.t -= dt;
      d.acc += d.dps * dt;
      if (d.acc >= 1) {
        const amt = Math.floor(d.acc);
        d.acc -= amt;
        try {
          if (typeof d.actor.damage === "function")
            d.actor.damage(amt, {
              type: d.type,
              source: "player",
              part: "torso",
              silent: true,
              dot: true,
            });
        } catch (e) {
          dots.splice(i, 1);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Custom shots: gyrojet rockets, hot rivets (flying), the siren cone (instant)
  // ------------------------------------------------------------------
  const flying = []; // {kind, obj, pos, vel, age, damage, weaponId, w, dist, speed, dir}
  const stuck = []; // rivets left in walls {obj, t}
  const papers = []; // ticker-tape streamers drifting down {obj, vel, t, spin}
  const rings = []; // siren-horn shock rings {obj, t, dir, base}
  const _d = new THREE.Vector3(),
    _c = new THREE.Vector3(),
    _q = new THREE.Quaternion(),
    _z = new THREE.Vector3(0, 0, 1);
  let rivetProto = null,
    rocketProto = null;
  function rivetModel() {
    if (!rivetProto) {
      const b = P.builder();
      P.buildingWorld = true;
      b.add(P.GEO.cyl(0.0055, 0.03, 8), "glowAmber", {
        p: [0, 0, -0.004],
        tint: [1, 0.55, 0.3],
      });
      b.add(P.GEO.sphere(0.0085, 10, 6), "glowAmber", {
        p: [0, 0, 0.012],
        s: [1, 1, 0.55],
        tint: [1, 0.62, 0.32],
      });
      rivetProto = b.build(true);
      P.buildingWorld = false;
    }
    return rivetProto.clone(true);
  }
  function rocketModel() {
    if (!rocketProto) {
      const b = P.builder();
      P.buildingWorld = true;
      b.add(
        P.GEO.lathe(
          [
            [0.0, -0.012],
            [0.005, -0.008],
            [0.0062, 0.0],
            [0.0062, 0.026],
            [0.0, 0.026],
          ],
          10,
        ),
        "steel",
        { p: [0, 0, 0.0] },
      );
      rocketProto = b.build(true);
      P.buildingWorld = false;
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: P.glowTexture(),
          color: 0xffa040,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        }),
      );
      s.material.userData.shared = true;
      s.scale.setScalar(0.16);
      s.position.z = 0.04;
      rocketProto.add(s);
    }
    return rocketProto.clone(true);
  }
  /** Damage fraction of a gyrojet round that has flown `dist` metres (still accelerating close in). */
  function gyroFactor(g, dist) {
    if (!g) return 1;
    if (dist >= (g.full || 14) * 2) return 1 + (g.over || 0);
    return Math.min(
      1,
      (g.min || 0.35) + ((1 - (g.min || 0.35)) * dist) / (g.full || 14),
    );
  }
  P.gyroFactor = gyroFactor;
  /** Fire hook from 60_fire.fireOnce for weapons with w.customProj. */
  P.customShot = function (shot, cur) {
    const w = shot.weapon,
      kind = w.customProj;
    if (kind === "siren") return sirenShot(shot, cur);
    const d = P.applySpread
      ? P.applySpread(shot.dir.clone(), shot.spread)
      : shot.dir.clone();
    const start = shot.muzzle
      ? shot.muzzle.clone()
      : shot.origin.clone().addScaledVector(d, 0.5);
    // start from the eye line (so point-blank shots at walls don't pass through), the visual from the muzzle
    const pos = shot.origin.clone().addScaledVector(d, 0.35);
    const obj = kind === "gyro" ? rocketModel() : rivetModel();
    obj.position.copy(start);
    G.scene.add(obj);
    const gyro = kind === "gyro";
    const speed = gyro ? 24 : w.projectileSpeed || 55;
    flying.push({
      kind,
      obj,
      pos,
      vis: start,
      dir: d.clone(),
      speed,
      maxSpeed: w.projectileSpeed || 260,
      vel: d.clone().multiplyScalar(speed),
      age: 0,
      dist: 0.35,
      damage: w.damage,
      weaponId: cur.id,
      w,
      hitSet: new Set(),
      puffT: 0,
      paperT: 0,
    });
    if (gyro && fxOk()) {
      try {
        G.fx.dust(start, { scale: 0.25, count: 3, color: 0xcfcac0 });
      } catch (e) {
        /* ignore */
      }
    }
    if (kind === "rivet") sfx("steam_hiss", null, { volume: 0.25, pitch: 1.6 });
    return true;
  };
  const GRAV = { rivet: 2.5, gyro: 0.4 };
  /** Nearest actor whose body the segment a→b passes through (vertical capsule approximation). */
