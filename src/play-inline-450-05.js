// play-inline-450 05 — pos
// Lines 1284-1627 of readable/play-inline-450.pretty.js (statement-aligned).
  function updateTurrets(dt) {
    if (!X.TURRETS.length || dt <= 0) return;
    const pl = G.player;
    for (const t of X.TURRETS) {
      if (!t.alive || t.rec.removed) continue;
      const obj = t.rec.obj;
      const dxp = pl.pos.x - obj.position.x,
        dzp = pl.pos.z - obj.position.z;
      if (dxp * dxp + dzp * dzp > 120 * 120) continue; // dormant far away
      if (!t.enabled) continue; // switched off from a terminal
      // muzzle position only changes when the head turns → cache it
      if (t.muzzleYaw !== t.yaw) {
        t.head.updateWorldMatrix(true, false);
        worldPoint(t.head, 0, 0.12, -0.9, t.muzzle);
        t.muzzleYaw = t.yaw;
      }
      const muzzle = t.muzzle;
      let target = null,
        tpos = null;
      if (turretHostileToPlayer(t) && pl.alive) {
        tpos = _tp.set(pl.pos.x, pl.pos.y + 1.2, pl.pos.z);
        if (
          muzzle.distanceTo(tpos) < t.range &&
          G.world.lineOfSight(muzzle, tpos, { ignoreTags: ["prop"] })
        )
          target = "player";
      }
      if (
        !target &&
        !G.isStub("actors") &&
        typeof G.actors.nearest === "function"
      ) {
        try {
          const a = G.actors.nearest(
            obj.position,
            t.range,
            (ac) =>
              !ac.dead &&
              ((ac.hostile && ac.hostile()) ||
                (G.combat.relation &&
                  G.combat.relation(t.faction, ac.faction) === "hostile")) &&
              ac.faction !== t.faction,
          );
          if (a) {
            tpos = _tp.set(a.pos.x, a.pos.y + 1.0, a.pos.z);
            if (
              G.world.lineOfSight(muzzle, tpos, {
                ignoreTags: ["prop", "actor"],
              })
            )
              target = a;
          }
        } catch (e) {
          /* ignore */
        }
      }
      let want;
      if (target)
        want =
          Math.atan2(-(tpos.x - obj.position.x), -(tpos.z - obj.position.z)) -
          obj.rotation.y;
      else {
        t.scan += dt * 0.5;
        want = Math.sin(t.scan) * 1.2;
      }
      const diff = U.wrapAngle(want - t.yaw);
      t.yaw += U.clamp(diff, -3 * dt, 3 * dt);
      t.head.rotation.y = t.yaw;
      t.cool -= dt;
      if (target && Math.abs(diff) < 0.15 && t.cool <= 0) {
        // burst fire
        t.burst = t.burst > 0 ? t.burst : 6;
        t.burst--;
        t.cool = t.burst > 0 ? 0.11 : 1.3 + Math.random() * 0.6;
        _td.subVectors(tpos, muzzle).normalize();
        X.sfx("gun_smg", { pos: muzzle, volume: 0.7 });
        if (!G.isStub("fx")) {
          try {
            G.fx.muzzleFlash(muzzle, _td, "smg");
          } catch (e) {
            /* ignore */
          }
        }
        let hit =
          Math.random() <
          (target === "player"
            ? (pl.sneaking ? 0.35 : 0.5) - Math.min(0.25, pl.moveSpeed * 0.03)
            : 0.6);
        const end = _wp.set(
          tpos.x + (Math.random() - 0.5) * (hit ? 0.2 : 1.6),
          tpos.y + (Math.random() - 0.5) * (hit ? 0.2 : 1.2),
          tpos.z + (Math.random() - 0.5) * (hit ? 0.2 : 1.6),
        );
        if (!G.isStub("fx")) {
          try {
            G.fx.tracer(muzzle, end, 0xffd080);
          } catch (e) {
            /* ignore */
          }
        }
        if (hit) {
          if (target === "player")
            pl.damage(t.damage, { type: "ballistic", source: "turret" });
          else
            try {
              target.damage(t.damage * 1.5, {
                type: "ballistic",
                source: "turret",
              });
            } catch (e) {
              /* ignore */
            }
        } else if (!G.isStub("fx")) {
          try {
            G.fx.impact(end, new THREE.Vector3(0, 1, 0), "concrete");
          } catch (e) {
            /* ignore */
          }
        }
      }
    }
  }
  function damageTurret(t, dmg) {
    if (!t.alive) return;
    t.hp -= dmg;
    if (!G.isStub("fx")) {
      try {
        G.fx.sparks(worldPoint(t.head, 0, 0.1, 0, _wp));
      } catch (e) {
        /* ignore */
      }
    }
    if (t.hp <= 0) {
      t.alive = false;
      t.head.rotation.x = 0.5;
      t.head.rotation.z = 0.3;
      t.muzzleYaw = NaN;
      const p = worldPoint(t.head, 0, 0.1, 0);
      X.explosion(p, 3, 25, { source: "turret", kind: "normal", small: true });
      X.sfx("robot_death", { pos: p });
      if (X.flames)
        t.smoke = X.flames.add(p.x, p.y, p.z, 0.5, {
          flames: 0,
          smokeCount: 4,
          smokeScale: 0.5,
        });
      G.emit("propExploded", {
        type: "turret",
        kind: t.rec.opts.continuity ? "continuity" : "turret",
        id: t.rec.id,
        pos: p,
      });
      G.emit("turretDestroyed", {
        id: t.rec.id,
        group: t.group,
        faction: t.faction,
        pos: p,
      });
      // XP like any robot kill (FO3 gives XP for turrets)
      if (t.xp > 0 && !G.isStub("rpg") && typeof G.rpg.addXP === "function") {
        try {
          G.rpg.addXP(t.xp, "Turret destroyed");
        } catch (e) {
          G.reportError("props:turretXP", e);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Explosions (combat when present; self-contained fallback otherwise)
  // ------------------------------------------------------------------
  let lastExplosion = { t: -1, x: 0, z: 0 };
  X.explosion = function (pos, radius, damage, o) {
    o = o || {};
    lastExplosion = { t: G.time.real, x: pos.x, z: pos.z };
    let handled = false;
    if (!G.isStub("combat") && typeof G.combat.explode === "function") {
      try {
        G.combat.explode(pos, radius, damage, {
          source: o.source || "prop",
          kind: o.kind || "normal",
        });
        handled = true;
      } catch (e) {
        G.reportError("props:explode", e);
      }
    }
    if (!handled) {
      if (!G.isStub("fx") && typeof G.fx.explosion === "function") {
        try {
          G.fx.explosion(pos, radius, o.kind || "normal");
        } catch (e) {
          /* ignore */
        }
      }
      X.sfx(o.small ? "explosion" : "explosion", {
        pos,
        volume: o.small ? 0.7 : 1,
      });
      // player damage + shake
      const pl = G.player,
        d = Math.hypot(
          pl.pos.x - pos.x,
          pl.pos.y + 1 - pos.y,
          pl.pos.z - pos.z,
        );
      if (d < radius)
        pl.damage(damage * (1 - d / radius), {
          type: "explosive",
          source: o.source || "prop",
        });
      if (d < radius * 5)
        pl.shake(Math.min(0.9, 2.5 / Math.max(1, d / radius)), 0.5);
      if (!G.isStub("actors") && typeof G.actors.inRadius === "function") {
        try {
          for (const a of G.actors.inRadius(pos, radius) || []) {
            if (a.dead) continue;
            const da = a.pos.distanceTo(pos);
            a.damage(damage * (1 - da / radius), {
              type: "explosive",
              source: o.source || "prop",
            });
          }
        } catch (e) {
          /* ignore */
        }
      }
    }
    // own flash & fireball (works even without the fx module)
    if (G.isStub("fx") && X.flames) {
      const f = X.flames.add(pos.x, pos.y - 0.3, pos.z, radius * 0.45, {
        flames: 16,
        smokeCount: 8,
        smokeScale: radius * 0.3,
        spread: 2.5,
      });
      const gi = X.glow
        ? X.glow.add(pos.x, pos.y + 1, pos.z, 0xffa040, radius * 5, 0)
        : -1;
      X.TIMERS.push(
        {
          t: 0.9,
          fn: () => {
            f.setScale(radius * 0.2);
          },
        },
        {
          t: 2.2,
          fn: () => {
            f.stop();
            if (gi >= 0) X.glow.remove(gi);
          },
        },
      );
    }
    // chain reaction into other props (slight delay so chains ripple)
    X.TIMERS.push({
      t: 0.08,
      fn: () => areaDamage(pos, radius * 1.15, damage),
    });
  };
  X.TIMERS = [];
  function areaDamage(pos, radius, dmg) {
    for (const { car, d } of X.carsNear(pos, radius))
      X.damageCar(car, dmg * (1 - d / (radius + 1)) * 1.3, {
        instant: d < radius * 0.35,
      });
    for (const e of X.EXPLOSIVES) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - pos.x, e.y - pos.y, e.z - pos.z);
      if (d < radius) damageExplosive(e, dmg * (1 - d / radius) * 1.5);
    }
    for (const t of X.TURRETS) {
      if (!t.alive) continue;
      const p = t.rec.obj.position;
      const d = Math.hypot(p.x - pos.x, p.z - pos.z);
      if (d < radius) damageTurret(t, dmg * (1 - d / radius));
    }
  }

  // ------------------------------------------------------------------
  // Public damage entry point (combat calls this for bullets / blasts)
  // ------------------------------------------------------------------
  let lastExternalHit = -1;
  P.damageAt = function (pos, dmg, opts) {
    if (typeof opts === "number") opts = { radius: opts }; // combat.explode passes the radius directly
    opts = opts || {};
    if (!pos) return false;
    if (!opts._internal) lastExternalHit = G.time.real;
    const r = opts.radius || 0;
    // ignore echoes of our own explosion
    if (
      r > 0 &&
      Math.abs(G.time.real - lastExplosion.t) < 0.06 &&
      Math.hypot(pos.x - lastExplosion.x, pos.z - lastExplosion.z) < 0.5
    )
      return false;
    if (r > 0) {
      areaDamage(pos, r, dmg);
      return true;
    }
    let hit = false;
    for (const { car } of X.carsNear(pos, 0.6)) {
      X.damageCar(car, dmg, opts);
      hit = true;
    }
    for (const e of X.EXPLOSIVES) {
      if (!e.dead && Math.hypot(e.x - pos.x, e.y - pos.y, e.z - pos.z) < 0.9) {
        damageExplosive(e, dmg);
        hit = true;
      }
    }
    for (const t of X.TURRETS) {
      if (!t.alive) continue;
      const tp = t.rec.obj.position;
      if (Math.abs(tp.x - pos.x) > 2 || Math.abs(tp.z - pos.z) > 2) continue;
      t.head.updateWorldMatrix(true, false);
      if (worldPoint(t.head, 0, 0.1, 0, _wp).distanceTo(pos) < 0.9) {
        damageTurret(t, dmg);
        hit = true;
      }
    }
    return hit;
  };
  P.explodeAt = function (pos, radius, dmg) {
    X.explosion(pos, radius || 5, dmg || 80, { source: "script" });
  };

  // Fallback bullet detection: if nobody reported a hit shortly after the
  // player fired, raycast ourselves (covers combat being a stub).
  let pendingShot = null;
  G.on("weaponFired", (def) => {
    try {
      const w = def && (def.weapon || (def.def && def.def.weapon) || def);
      const dmg = (w && (w.damage || 0)) * ((w && w.pellets) || 1) || 15;
      if (w && w.skill === "melee") return;
      pendingShot = { t: G.time.real, dmg, frames: 0 };
    } catch (e) {
      /* ignore */
    }
  });
  const _po = new THREE.Vector3(),
    _pd = new THREE.Vector3();
