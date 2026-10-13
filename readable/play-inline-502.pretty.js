/* src/weapons/60_fire.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: firing, ammo, condition, melee, throws
 *
 * Player weapon logic.  Damage resolution goes through G.combat.fire /
 * G.combat.melee / G.combat.spawnProjectile.  When the combat module is a
 * stub we resolve shots ourselves (world raycast + impact FX, local
 * projectile simulation, explosions) so shooting always feels good.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const V = () => P.view;

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  P.state = {
    cur: null, // {id, def, mag}
    holstered: false,
    busyNoAds: false,
    mags: {}, // weaponId -> rounds loaded
    cond: {}, // weaponId -> 0..1 (local mirror)
    favorites: [null, null, null, null, null, null, null, null],
    bloom: 0,
    rofT: 0,
    emptyClickT: 0,
    autoReloadT: -1,
    flameSnd: null,
    spinSnd: null,
    lastThrown: "frag_grenade",
    condScale: 1,
  };
  const S = P.state;

  const invReal = () =>
    !G.isStub("inventory") && typeof G.inventory.count === "function";
  const rpgReal = () =>
    !G.isStub("rpg") && G.rpg && typeof G.rpg.skill === "function";
  const combatReal = () =>
    !G.isStub("combat") && G.combat && typeof G.combat.fire === "function";
  P.invReal = invReal;
  P.combatReal = combatReal;

  // ------------------------------------------------------------------
  // Ammo & condition
  // ------------------------------------------------------------------
  /** Rounds available in the inventory for this weapon (not counting the loaded mag). */
  P.reserve = function (def) {
    const w = def && def.weapon;
    if (!w || !w.ammo) return Infinity;
    if (!invReal()) return 999;
    // multi-ammo weapons (w.ammoAny: any item on the list loads): switch to the first one carried
    if (w.ammoAny && !(G.inventory.count(w.ammo) > 0)) {
      for (const id of w.ammoAny)
        if ((G.inventory.count(id) || 0) > 0) {
          w.ammo = id;
          break;
        }
    }
    const n = G.inventory.count(w.ammo) || 0;
    return w.reloadType === "throw" ? n : n;
  };
  function takeAmmo(ammoId, n) {
    if (!invReal() || n <= 0) return n;
    const have = G.inventory.count(ammoId) || 0;
    const k = Math.min(have, n);
    if (k > 0) {
      try {
        G.inventory.remove(ammoId, k, { silent: true });
      } catch (e) {
        G.reportError("weapons:takeAmmo", e);
      }
    }
    return k;
  }
  P.takeAmmo = takeAmmo;
  /** Weapon condition 0..1 (inventory is authoritative when present). */
  P.getCond = function (id) {
    if (!id || id === "unarmed") return 1;
    if (
      invReal() &&
      typeof G.inventory.condition === "function" &&
      (!G.inventory.has || G.inventory.has(id))
    ) {
      try {
        const v = G.inventory.condition(id);
        if (typeof v === "number" && isFinite(v)) {
          if (v > 1.001) S.condScale = 100;
          return G.util.clamp(S.condScale === 100 ? v / 100 : v, 0, 1);
        }
      } catch (e) {
        /* fall through */
      }
    }
    return S.cond[id] === undefined ? 1 : S.cond[id];
  };
  P.setCond = function (id, v) {
    if (!id || id === "unarmed") return;
    v = G.util.clamp(v, 0, 1);
    S.cond[id] = v;
    if (invReal() && typeof G.inventory.setCondition === "function") {
      try {
        G.inventory.setCondition(id, S.condScale === 100 ? v * 100 : v);
      } catch (e) {
        /* ignore */
      }
    }
  };
  function decay(def, mult) {
    const w = def.weapon;
    if (!w.condDecay) return;
    const c = P.getCond(def.id);
    P.setCond(def.id, c - w.condDecay * (mult || 1));
  }
  const emitAmmo = () => G.events.emit("ammoChanged", G.weapons.current());

  // ------------------------------------------------------------------
  // Spread (radians) — hip/ADS, skill, movement, airborne, condition, bloom
  // ------------------------------------------------------------------
  P.currentSpread = function (def) {
    def = def || (S.cur && S.cur.def);
    if (!def) return 0;
    const w = def.weapon;
    const pl = G.player;
    const v = V();
    let s = w.spread + (w.adsSpread - w.spread) * (v ? v.adsT : 0);
    const skill = rpgReal()
      ? G.util.clamp(G.rpg.skill(w.skill) || 0, 0, 100)
      : 50;
    s *= 1.55 - (skill / 100) * 0.85;
    // rpg.spreadMult = skill term × Senses × (1 + crippled-arm / Talent mods); weapons already applies the skill term, so only the rest is used
    if (rpgReal() && typeof G.rpg.spreadMult === "function") {
      try {
        const m = G.rpg.spreadMult(def) / Math.max(0.3, 1.5 - skill / 100);
        if (m > 0 && isFinite(m)) s *= G.util.clamp(m, 0.5, 3);
      } catch (e) {
        /* ignore */
      }
    }
    const mv = Math.min(1, (pl.moveSpeed || 0) / 4.6);
    s += w.spread * 0.7 * mv * (w.moveSpread || 1);
    if (pl.sneaking) s *= 0.8;
    if (!pl.onGround && !pl.swimming) s *= 1.8;
    s *= 1 + (1 - P.getCond(def.id)) * 1.2;
    s *= 1 + 0.2 * P.strDeficit(w); // under-strength = wild aim
    s += S.bloom;
    return s;
  };
  /** Points of Brawn below the weapon's requirement (0 when met or rpg is a stub). */
  P.strDeficit = function (w) {
    if (!w || !(w.strReq > 1) || !rpgReal() || typeof G.rpg.attr !== "function")
      return 0;
    try {
      const st = G.rpg.attr("brawn");
      return typeof st === "number" ? Math.max(0, w.strReq - st) : 0;
    } catch (e) {
      return 0;
    }
  };
  /** rpg multipliers (Reflex + Talents): reload time and recoil. 1 when rpg is a stub. */
  P.rpgMult = function (name) {
    if (!rpgReal() || typeof G.rpg[name] !== "function") return 1;
    try {
      const m = G.rpg[name]();
      return typeof m === "number" && isFinite(m) && m > 0 ? m : 1;
    } catch (e) {
      return 1;
    }
  };

  // ------------------------------------------------------------------
  // World helpers
  // ------------------------------------------------------------------
  const _mw = new THREE.Vector3();
  /** Approximate world-space muzzle position (view socket mapped through the world camera). */
  P.muzzleWorld = function (out) {
    out = out || new THREE.Vector3();
    const m = V().model;
    const cam = G.camera;
    // third-person camera (core): tracers / flashes start at the player body's gun, not the hidden viewmodel
    const body = G.player.thirdPersonActive && G.player.tpBody;
    if (body && body.weapon && typeof body.getMuzzle === "function") {
      try {
        const mz = body.getMuzzle();
        if (mz && mz.pos && isFinite(mz.pos.x)) return out.copy(mz.pos);
      } catch (e) {
        /* fall through */
      }
    }
    if (
      m &&
      m.sockets.muzzle &&
      V().root &&
      V().root.visible &&
      !G.player.thirdPersonActive
    ) {
      m.sockets.muzzle.getWorldPosition(_mw); // view camera space (camera at origin)
      // compensate FOV difference roughly so beams originate near the visible muzzle
      const k =
        Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) /
        Math.tan(THREE.MathUtils.degToRad(G.viewCamera.fov / 2));
      _mw.x *= k;
      _mw.y *= k;
      out.copy(_mw).applyMatrix4(cam.matrixWorld);
    } else {
      out.copy(G.player.eye).addScaledVector(G.player.forward, 0.5);
      out.y -= 0.15;
    }
    return out;
  };
  const _right = new THREE.Vector3(),
    _up = new THREE.Vector3();
  /** Random direction inside a cone of half-angle `spread` around dir. */
  P.applySpread = function (dir, spread, out) {
    out = out || new THREE.Vector3();
    if (!spread) return out.copy(dir);
    _right
      .crossVectors(
        dir,
        Math.abs(dir.y) > 0.95
          ? new THREE.Vector3(1, 0, 0)
          : new THREE.Vector3(0, 1, 0),
      )
      .normalize();
    _up.crossVectors(_right, dir).normalize();
    const a = Math.random() * Math.PI * 2,
      r = Math.sqrt(Math.random()) * Math.tan(spread);
    out
      .copy(dir)
      .addScaledVector(_right, Math.cos(a) * r)
      .addScaledVector(_up, Math.sin(a) * r)
      .normalize();
    return out;
  };

  // ------------------------------------------------------------------
  // Fallback resolution (combat stub): hitscan + FX, local projectiles
  // ------------------------------------------------------------------
  let tracerN = 0;
  function fallbackHitscan(shot) {
    const w = shot.weapon;
    const d = new THREE.Vector3();
    const n = w.pellets || 1;
    for (let i = 0; i < n; i++) {
      P.applySpread(shot.dir, shot.spread, d);
      const hit = G.world.raycast(shot.origin, d, w.range);
      const end = hit
        ? hit.point
        : shot.origin.clone().addScaledVector(d, w.range);
      if (n > 1 ? i % 3 === 0 : tracerN++ % (w.automatic ? 3 : 1) === 0)
        G.fx.tracer(shot.muzzle, end, 0xffd890);
      if (hit) {
        G.fx.impact(hit.point, hit.normal, hit.surface);
        if (i === 0 || Math.random() < 0.3)
          G.fx.decal(hit.point, hit.normal, "bullet");
        if (i === 0) {
          G.sfx.play("bullet_impact", { pos: hit.point, volume: 0.5 });
          if (Math.random() < 0.25)
            G.sfx.play("ricochet", {
              pos: hit.point,
              volume: 0.4,
              pitch: 0.8 + Math.random() * 0.5,
            });
        }
        if (!G.isStub("props") && G.props.damageAt)
          G.props.damageAt(hit.point, shot.damage);
      }
    }
  }

  // Local projectile simulation (only when combat is a stub)
  P.projectiles = [];
  const PROJ_LOOK = {};
  function projMesh(kind) {
    const grp = new THREE.Group();
    if (kind === "grenade" || kind === "mine") {
      return null; // uses world model of the grenade
    } else if (kind === "flame") {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: P.glowTexture(),
          color: 0xff8030,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        }),
      );
      s.scale.setScalar(0.4);
      grp.add(s);
    } else {
      // missiles / recoilless rounds use world models built by the model files
      return null;
    }
    return grp;
  }
  function explodeAt(pos, radius, damage, kind, spec) {
    // special payloads (riot gas, molotov fire) are handled by 70_craft.js
    if (kind === "gas" && P.gasCloud) {
      P.gasCloud(pos, radius, {
        source: "player",
        secs: spec && spec.gasSecs,
        weaponId: spec && spec.weaponId,
      });
      return;
    }
    if (kind === "fire" && P.fireBurst) {
      P.fireBurst(pos, radius, damage, spec || {});
      return;
    }
    if (combatReal() && typeof G.combat.explode === "function") {
      try {
        G.combat.explode(pos, radius, damage, {
          source: "player",
          kind: kind || "normal",
          weaponId: spec && spec.weaponId,
        });
        return;
      } catch (e) {
        G.reportError("weapons:explode", e);
      }
    }
    G.fx.explosion(pos, radius, "normal");
    G.sfx.play("explosion", { pos, volume: 1 });
    const pl = G.player;
    const d = pl.pos.distanceTo(pos);
    if (d < radius)
      pl.damage(damage * (1 - d / radius) * 0.5, {
        type: "explosive",
        source: "player",
      });
    if (d < radius * 4)
      pl.shake(Math.min(1, 0.8 * (1 - d / (radius * 4))), 0.5);
    if (!G.isStub("props") && G.props.damageAt) G.props.damageAt(pos, damage);
  }
  P.explodeAt = explodeAt;

  /** Spawn a projectile: through combat when present (unless spec.local), otherwise simulate locally. */
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
  P.reload = function (force) {
    const cur = S.cur;
    if (!cur) return false;
    const def = cur.def,
      w = def.weapon;
    if (!w.magSize || w.reloadType === "throw" || w.reloadType === "melee")
      return false;
    if (cur.mag >= w.magSize) return false;
    const reserve = P.reserve(def);
    if (reserve <= 0) {
      if (!force) {
        G.sfx.play("empty_click", { volume: 0.5 });
      }
      return false;
    }
    if (P.action && P.action.name === "reload") return false;
    if (P.action && !force && P.action.name !== "cycle") return false;
    const m = V().model;
    if (!m) return false;
    const wasEmpty = cur.mag <= 0;
    const spent =
      w.reloadType === "breakaction" || w.reloadType === "revolver"
        ? w.magSize - cur.mag
        : 0;
    const toLoad = Math.min(w.magSize - cur.mag, reserve);
    const ctx = {
      wasEmpty,
      spent,
      toLoad,
      onInsert(n) {
        const c = S.cur;
        if (!c || c.id !== cur.id) return;
        const need = n ? Math.min(n, w.magSize - c.mag) : w.magSize - c.mag;
        const got = w.ammo ? takeAmmo(w.ammo, need) : need;
        c.mag += got;
        S.mags[c.id] = c.mag;
        emitAmmo();
        if (!n || c.mag >= w.magSize) G.events.emit("reloaded", c.id);
      },
      fxSpark() {
        const p = P.muzzleWorld();
        G.fx.sparks && G.fx.sparks(p);
      },
    };
    V().ads = false;
    S.autoReloadT = -1;
    const ra = P.reloadAction(m, def, ctx);
    if (ra) ra.speed = (ra.speed || 1) / P.rpgMult("reloadMult"); // Reflex + Quick Hands: faster hands
    P.startAction(ra);
    return true;
  };

  /** Queue the auto-reload when the drawn weapon's magazine is empty and ammo remains. */
  P.armAutoReload = function (delay) {
    const cur = S.cur;
    if (!cur) return;
    const w = cur.def.weapon;
    if (
      w.magSize > 0 &&
      cur.mag <= 0 &&
      w.reloadType !== "throw" &&
      w.reloadType !== "melee" &&
      P.reserve(cur.def) > 0
    )
      S.autoReloadT = delay || 0.3;
  };

  // ------------------------------------------------------------------
  // Melee
  // ------------------------------------------------------------------
  let punchSide = "R";
  P.startMelee = function (instant) {
    const cur = S.cur;
    if (!cur) return null;
    const def = cur.def,
      w = def.weapon;
    const m = V().model;
    if (!m) return null;
    let side = "R";
    if (w.meleeStyle === "punch" && w.viewmodel === "fists") {
      side = punchSide;
      punchSide = punchSide === "R" ? "L" : "R";
    }
    const act = P.meleeAction(m, def, {
      style: w.meleeStyle || "swing",
      side,
      instant,
      pitch: w.viewmodel === "fire_axe" ? 0.7 : 1,
      speed: 1 / (1 + 0.12 * P.strDeficit(w)),
      canPower: () => (G.player.stamina || 0) >= 15, // power attacks cost sprint stamina
      onCharge: () => {
        G.sfx.play("melee_swing", { volume: 0.25, pitch: 0.6 });
      },
      onHit: (power) => {
        if (!instant) P.meleeHit(power);
      },
    });
    P.startAction(act);
    S.meleeAct = act;
    return act;
  };
  P.meleeHit = function (power) {
    const cur = S.cur;
    if (!cur) return;
    const def = cur.def,
      w = def.weapon;
    const pl = G.player;
    if (power) pl.useStamina(15);
    const dmg = w.damage * (power ? 2 : 1);
    let hitActor = false,
      res = null;
    if (combatReal() && typeof G.combat.melee === "function") {
      try {
        res = G.combat.melee({
          from: "player",
          range: w.meleeRange,
          arc: w.meleeArc,
          damage: dmg,
          weaponId: cur.id,
          weapon: w,
          def,
          power: !!power,
          origin: pl.eye.clone(),
          dir: pl.forward.clone(),
          damageType: w.damageType,
          condition: P.getCond(cur.id),
          skill: w.skill,
          sneak: !!pl.sneaking,
        });
      } catch (e) {
        G.reportError("weapons:combat.melee", e);
      }
      hitActor = !!(
        res &&
        (res === true ||
          res.hit ||
          res.actor ||
          (Array.isArray(res) && res.length) ||
          res.count > 0)
      );
      // (Third-Rail Shoe stun, censer rads, rivet burns etc. are applied from combat's actorDamaged event — 70_craft.js)
    }
    decay(def);
    const v = V();
    if (hitActor) {
      G.sfx.play(w.unarmed ? "punch" : "melee_hit", {
        volume: power ? 1 : 0.8,
        pitch: w.viewmodel === "fire_axe" ? 0.7 : 1,
      });
      pl.shake(power ? 0.25 : 0.12, 0.15);
      v.springs.recZ.v += 0.6;
      v.springs.recP.v -= 1.5;
      if (w.stunOnHit) {
        const mp = P.muzzleWorld();
        try {
          G.fx.arc && G.fx.arc(mp, { scale: 0.8 });
        } catch (e) {
          /* ignore */
        }
        P.snd("zap", "hum_electric", { volume: 0.8 });
      }
    } else {
      const hit = G.world.raycast(pl.eye, pl.forward, w.meleeRange || 2);
      if (hit) {
        G.fx.impact(hit.point, hit.normal, hit.surface);
        G.sfx.play(w.unarmed ? "punch" : "melee_hit", {
          pos: hit.point,
          volume: 0.6,
          pitch: 0.9 + Math.random() * 0.2,
        });
        pl.shake(0.1, 0.12);
        v.springs.recZ.v += 0.8;
        v.springs.recP.v -= 2;
        if (!G.isStub("props") && G.props.damageAt)
          G.props.damageAt(hit.point, dmg);
      }
    }
    G.events.emit("weaponFired", def);
  };

  // ------------------------------------------------------------------
  // Throwing
  // ------------------------------------------------------------------
  P.bestThrowable = function () {
    const ids = [
      S.lastThrown,
      "frag_grenade",
      "riot_gas_grenade",
      "molotov",
      "frag_mine",
    ];
    if (!invReal()) return S.lastThrown || "frag_grenade";
    for (const id of ids) if (id && (G.inventory.count(id) || 0) > 0) return id;
    return null;
  };
  let handItem = null,
    handItemId = null;
  function showHandItem(id, on) {
    const hand = P.arms.R && P.arms.R.hand.root;
    if (!hand) return;
    if (handItemId !== id) {
      if (handItem) hand.remove(handItem);
      handItem = P.buildViewItem(id);
      handItemId = id;
      if (handItem) hand.add(handItem);
    }
    if (handItem) handItem.visible = !!on;
  }
  P.showHandItem = showHandItem;
  /** Throw a grenade/mine. quick = G-key throw while holding another weapon. */
  P.startThrow = function (id, quick, target) {
    const def = P.defs.get(id);
    if (!def) return false;
    const m = V().model;
    if (!m) return false;
    if (invReal() && (G.inventory.count(id) || 0) <= 0) return false;
    if (P.isBusy()) return false;
    V().ads = false;
    S.lastThrown = id;
    const w = def.weapon;
    const act = P.throwAction(m, def, {
      quick,
      showGrenade: (on) => showHandItem(id, on),
      release: () => {
        const pl = G.player;
        if (invReal()) {
          try {
            G.inventory.remove(id, 1, { silent: true });
          } catch (e) {
            /* ignore */
          }
        }
        const pos = pl.eye.clone().addScaledVector(pl.forward, 0.45);
        const rightV = new THREE.Vector3(
          Math.cos(pl.yaw),
          0,
          -Math.sin(pl.yaw),
        );
        pos.addScaledVector(rightV, 0.2);
        pos.y -= 0.05;
        let vel;
        if (target) {
          const tp = target.pos ? target.pos : target;
          const d = new THREE.Vector3().subVectors(tp, pos);
          const flat = Math.hypot(d.x, d.z);
          const tFlight = Math.max(0.4, flat / (w.projectileSpeed || 16));
          vel = new THREE.Vector3(
            d.x / tFlight,
            (d.y + 0.5 * 9.8 * tFlight * tFlight) / tFlight,
            d.z / tFlight,
          );
        } else {
          vel = pl.forward.clone().multiplyScalar(w.projectileSpeed || 16);
          vel.y += (w.projectileSpeed || 16) * 0.22;
          if (pl.vel)
            vel.add(
              new THREE.Vector3(pl.vel.x, 0, pl.vel.z).multiplyScalar(0.8),
            );
        }
        // molotovs break on contact: simulated here (combat's grenades bounce); riot gas goes through combat (its
        // 'gas' explosion kind is forwarded to G.weapons.gasCloud)
        P.spawnProjectile({
          kind: "grenade",
          pos,
          vel,
          gravity: 9.8,
          damage: w.damage,
          radius: w.explosionRadius,
          from: "player",
          weaponId: id,
          fuse: w.fuse || 3,
          mine: !!w.mine,
          explosionKind: w.explosionKind || "normal",
          bounce: 0.38,
          impact: !!w.impact,
          local: !!w.impact,
          gasSecs: w.gas && w.gas.secs,
          burn: w.burn,
        });
        G.events.emit("weaponFired", def);
        G.events.emit("grenadeThrown", id);
        emitAmmo();
      },
    });
    act.onEnd = () => {
      showHandItem(id, false);
      // equipped throwable ran out → back to fists
      const cur = S.cur;
      if (
        cur &&
        cur.id === id &&
        invReal() &&
        (G.inventory.count(id) || 0) <= 0
      )
        G.weapons.equip(null);
    };
    act.onCancel = act.onEnd;
    P.startAction(act);
    return true;
  };

  // ------------------------------------------------------------------
  // Continuous weapons: flamer & minigun loops
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // Scope sway (slow drift of the reticle) + hold breath
  // (Shift while scoped & standing still steadies the aim for a few
  // seconds, then you're winded and it sways harder for a moment).
  // Sway is applied as a zero-mean offset to the player's view angles:
  // each frame we add (offset(t) - offset(t-dt)), and remove whatever
  // offset remains when leaving the scope, so it never drifts the aim.
  // ------------------------------------------------------------------
  const SWAY = {
    p: 0,
    y: 0,
    t: 0,
    breath: 1,
    holding: false,
    winded: 0,
    amp: 0,
    exhaleSnd: false,
  };
  P.scopeSway = SWAY;
  P.updateScopeSway = function (dt, w, v) {
    const pl = G.player;
    const active = !!(
      v &&
      v.ads &&
      w &&
      w.scope &&
      v.adsT > 0.6 &&
      G.state === "play" &&
      pl.alive !== false
    );
    let target = 0;
    if (active) {
      const skill = rpgReal()
        ? G.util.clamp(G.rpg.skill(w.skill) || 0, 0, 100)
        : 50;
      target = 0.018 * (1.25 - skill / 130); // ~0.016 rad at 50 skill; high skill = steadier
      if (pl.sneaking) target *= 0.65; // crouched = steadier
      target *= 1 + 0.3 * P.strDeficit(w); // too heavy for you
      target *= 1 + Math.min(1.5, (pl.moveSpeed || 0) * 0.35); // walking = shakier
      if (G.rpg && typeof G.rpg.hasTalent === "function") {
        try {
          if (G.rpg.hasTalent("steady_hands")) target *= 0.75;
        } catch (e) {
          /* ignore */
        }
      }
      // hold breath: sprint key while scoped (sprint itself needs movement, so standing still is free)
      const shift = G.input.action("sprint");
      if (!shift) SWAY.needRelease = false; // must let go after running out of breath
      const wantHold =
        shift &&
        !SWAY.needRelease &&
        (pl.moveSpeed || 0) < 0.5 &&
        SWAY.winded <= 0;
      if (wantHold && SWAY.breath > 0) {
        if (!SWAY.holding) {
          SWAY.holding = true;
          if (P.hasSfx("breath_hold"))
            P.snd("breath_hold", null, { volume: 0.5 });
        }
        SWAY.breath = Math.max(0, SWAY.breath - dt / 4.5); // ~4.5 s of held breath
        target *= 0.08;
        if (SWAY.breath <= 0) {
          SWAY.winded = 2.2;
          SWAY.holding = false;
          SWAY.needRelease = true;
          if (P.hasSfx("breath_exhale"))
            P.snd("breath_exhale", null, { volume: 0.6 });
        }
      } else {
        // released early: a softer exhale (only with a dedicated recipe — silence beats a wrong sound)
        if (SWAY.holding && P.hasSfx("breath_exhale"))
          P.snd("breath_exhale", null, { volume: 0.3 });
        SWAY.holding = false;
        SWAY.breath = Math.min(1, SWAY.breath + dt / 3.5);
      }
    } else {
      SWAY.holding = false;
      SWAY.breath = Math.min(1, SWAY.breath + dt / 3.5);
    }
    if (SWAY.winded > 0) {
      SWAY.winded -= dt;
      target *= 1.8;
    }
    SWAY.amp = G.util.damp ? G.util.damp(SWAY.amp, target, 4, dt) : target;
    // lissajous drift (figure-8 like the classic scope sway) with a slower breathing component
    SWAY.t += dt * (SWAY.winded > 0 ? 1.6 : 1);
    const t = SWAY.t;
    const np = active
      ? SWAY.amp * (Math.sin(t * 1.3) * 0.8 + Math.sin(t * 0.47 + 1.1) * 0.5)
      : 0;
    const ny = active
      ? SWAY.amp * (Math.sin(t * 0.65 + 0.4) * 1.0 + Math.sin(t * 0.29) * 0.4)
      : 0;
    const dp = np - SWAY.p,
      dy = ny - SWAY.y;
    if (dp || dy) {
      pl.pitch = G.util.clamp(pl.pitch + dp, -1.5, 1.5);
      pl.yaw += dy;
    }
    SWAY.p = np;
    SWAY.y = ny;
  };
  /** 0..1 held-breath reserve (HUD may draw it), and whether breath is being held now. */
  P.breathState = () => ({
    breath: SWAY.breath,
    holding: SWAY.holding,
    winded: SWAY.winded > 0,
  });

  P.stopLoops = function () {
    if (S.flameSnd) {
      try {
        S.flameSnd.stop();
      } catch (e) {
        /* ignore */
      }
      S.flameSnd = null;
    }
    if (S.spinSnd) {
      try {
        S.spinSnd.stop();
      } catch (e) {
        /* ignore */
      }
      S.spinSnd = null;
    }
  };

  // ------------------------------------------------------------------
  // Per-frame input & logic (G.state === 'play')
  // ------------------------------------------------------------------
  P.fireHeldT = 0;
  P.logic = function (dt) {
    const cur = S.cur;
    const v = V();
    S.rofT -= dt;
    S.bloom = Math.max(0, S.bloom - dt * 0.12);
    // auto-reload of an emptied weapon: waits while holstered / mid-swap / lowered (it is re-armed
    // on draw too, see P.armAutoReload), so it never plays on a hidden weapon or gets lost
    if (S.autoReloadT > 0) {
      S.autoReloadT -= dt;
      if (S.autoReloadT <= 0) {
        const ready =
          !S.holstered &&
          v.pendingKind === null &&
          v.lowerT < 0.5 &&
          G.state === "play";
        if (!ready) S.autoReloadT = 0.1;
        else {
          S.autoReloadT = -1;
          if (!P.action) P.reload();
          else if (P.action.name !== "reload") S.autoReloadT = 0.2;
        }
      }
    }
    const I = G.input;
    const playing = G.state === "play" && G.player.alive !== false;
    P.updateScopeSway(
      dt,
      cur && cur.def.weapon,
      playing && !S.holstered && !G.player.camOverride ? v : null,
    );
    if (!cur || !playing) {
      v.triggerHeld = false;
      v.spin = Math.max(0, v.spin - dt * 1.5);
      if (!playing) P.stopLoops();
      return;
    }
    const def = cur.def,
      w = def.weapon;

    // --- hotkeys
    for (let i = 1; i <= 8; i++)
      if (I.actionPressed("fav" + i)) {
        G.weapons.useFavorite(i);
      }
    if (I.actionPressed("holster")) G.weapons.holster(!S.holstered);
    if (I.actionPressed("grenade")) {
      const g = P.bestThrowable();
      if (!g) {
        G.notify("You have no grenades.");
        G.sfx.play("ui_error", { volume: 0.4 });
      } else {
        // the grenade hotkey throws immediately, even from holstered
        if (S.holstered) {
          G.weapons.holster(false);
          v.lowerT = Math.min(v.lowerT, 0.35);
        }
        if (P.action && !P.isBusy()) P.cancelAction(); // idle inspect / cycle tail
        if (!P.startThrow(g, w.reloadType !== "throw" || g !== cur.id, null))
          G.sfx.play("ui_error", { volume: 0.3 });
      }
    }
    if (I.actionPressed("reload") && !S.holstered) P.reload();

    const firePressed = I.actionPressed("fire"),
      fireHeld = I.action("fire"),
      fireReleased = I.actionReleased("fire") || (!fireHeld && P.fireHeldT > 0);
    P.fireHeldT = fireHeld ? P.fireHeldT + dt : 0;
    v.triggerHeld = fireHeld && !S.holstered && w.reloadType !== "melee";

    // holstered: attack draws the weapon
    if (S.holstered) {
      if (firePressed) G.weapons.holster(false);
      v.ads = false;
      v.blocking = false;
      P.stopLoops();
      return;
    }
    if (v.pendingKind !== null || v.lowerT > 0.5) {
      v.ads = false;
      return;
    }

    const isMelee = w.reloadType === "melee";
    // --- idle inspect after a while standing still; any input cancels it
    const anyInput =
      fireHeld ||
      I.action("aim") ||
      (G.player.moveSpeed || 0) > 0.3 ||
      I.actionPressed("reload") ||
      I.mouse.dx * I.mouse.dx + I.mouse.dy * I.mouse.dy > 400;
    if (P.action && P.action.name === "inspect" && anyInput) P.cancelAction();
    if (anyInput || P.action) S.idleT = 0;
    else S.idleT = (S.idleT || 0) + dt;
    if (
      S.idleT > 16 &&
      !P.action &&
      v.model &&
      !v.model.parts.fistR &&
      w.reloadType !== "throw"
    ) {
      S.idleT = -10;
      P.startAction(P.inspectAction(v.model));
    }
    // --- aim / block
    if (isMelee) {
      v.blocking = I.action("aim") && !P.isBusy();
      v.ads = false;
    } else {
      v.blocking = false;
      v.ads =
        I.action("aim") && !G.player.sprinting && w.reloadType !== "throw";
      v.scoped = !!w.scope;
    }

    // --- ADS FOV
    const wantFov = v.ads
      ? G.player.fovBase * (w.scope ? 1 / w.scope : w.adsFov || 0.82)
      : null;
    if (wantFov !== S.lastFov) {
      if (wantFov) G.player.setFov(wantFov);
      else if (S.lastFov) G.player.setFov(G.player.fovBase);
      S.lastFov = wantFov;
    }

    // --- per-round reload interrupt: fire during a shell-by-shell reload stops it
    if (
      P.action &&
      P.action.name === "reload" &&
      P.action.phase === "round" &&
      firePressed &&
      cur.mag > 0
    )
      P.action.stopReq = true;

    // --- melee
    if (isMelee) {
      if (firePressed && !P.isBusy() && S.rofT <= 0 && !G.player.sprinting) {
        P.startMelee(false);
        S.rofT = 1 / (w.rof || 1.5);
      }
      if (S.meleeAct && P.action === S.meleeAct && !fireHeld)
        P.meleeRelease(S.meleeAct);
      return;
    }
    // --- thrown
    if (w.reloadType === "throw") {
      if (firePressed && !P.isBusy()) P.startThrow(cur.id, false, null);
      return;
    }

    // --- minigun spin
    if (w.spinUp) {
      const want =
        fireHeld && !P.isBusy() && (cur.mag > 0 || P.reserve(def) > 0) ? 1 : 0;
      v.spin = G.util.clamp(
        v.spin + (want ? dt / w.spinUp : -dt / (w.spinUp * 1.8)),
        0,
        1,
      );
      // dedicated spin-up / spin loop / spin-down recipes when the sound module has them
      const rich = P.hasSfx("minigun_spin");
      if (want && !S.spinWant && v.spin < 0.6 && rich)
        P.snd("minigun_spinup", null, { volume: 0.75 });
      if (!want && S.spinWant && v.spin > 0.3 && rich)
        P.snd("minigun_spindown", null, { volume: 0.7 * v.spin });
      S.spinWant = want;
      if (v.spin > 0.05 && !S.spinSnd)
        S.spinSnd = rich
          ? P.snd("minigun_spin", null, { loop: true, volume: 0.05 })
          : G.sfx.play("hum_electric", { loop: true, volume: 0.5, pitch: 0.6 });
      if (S.spinSnd) {
        if (rich) {
          if (S.spinSnd.setVolume) S.spinSnd.setVolume(0.6 * v.spin * v.spin);
          if (S.spinSnd.setPitch) S.spinSnd.setPitch(0.7 + v.spin * 0.3);
        } else if (S.spinSnd.setPitch) S.spinSnd.setPitch(0.6 + v.spin * 0.9);
      }
      if (v.spin <= 0.02 && S.spinSnd) {
        try {
          S.spinSnd.stop();
        } catch (e) {
          /* ignore */
        }
        S.spinSnd = null;
      }
    }
    // --- flamer loop
    const flaming =
      w.flash === "flame" &&
      fireHeld &&
      cur.mag > 0 &&
      !P.isBusy() &&
      !G.player.sprinting;
    if (flaming) {
      v.flameEmit(dt);
      if (!S.flameSnd) {
        // ignition whoomph + pressurised roar loop (contract fire_loop as fallback)
        const ss = P.shotSound(w);
        if (ss.name !== "fire_loop")
          G.sfx.play(ss.name, { volume: 0.8 * ss.volume, pitch: ss.pitch });
        S.flameSnd = P.hasSfx("flamer_loop")
          ? P.snd("flamer_loop", null, {
              loop: true,
              volume: 0.85,
              pitch: ss.pitch,
            })
          : G.sfx.play("fire_loop", { loop: true, volume: 0.8, pitch: 1.3 });
      }
    } else if (S.flameSnd) {
      try {
        S.flameSnd.stop();
      } catch (e) {
        /* ignore */
      }
      S.flameSnd = null;
    }

    // --- fire
    const wantShot = w.automatic ? fireHeld : firePressed;
    if (wantShot && !G.player.sprinting) {
      if (P.action && P.action.name === "cycle") return;
      if (P.isBusy()) return;
      if (w.spinUp && v.spin < 0.95) return;
      if (w.magSize > 0 && cur.mag <= 0) {
        if (firePressed || S.emptyClickT <= 0) {
          G.sfx.play("empty_click", { volume: 0.7 });
          S.emptyClickT = 0.4;
          if (P.reserve(def) > 0) P.reload();
        }
        S.emptyClickT -= dt;
        return;
      }
      if (S.rofT > 0) return;
      S.rofT = Math.max(S.rofT, -0.02) + 1 / (w.rof || 3);
      P.fireOnce();
    } else S.emptyClickT = 0;
  };
})();
