// play-inline-502 01 — math
// Lines 11-340 of readable/play-inline-502.pretty.js (statement-aligned).
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
