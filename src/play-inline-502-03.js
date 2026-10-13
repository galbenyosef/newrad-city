// play-inline-502 03 — cur
// Lines 652-974 of readable/play-inline-502.pretty.js (statement-aligned).
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
