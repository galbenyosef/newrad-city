// play-inline-503 04 — pos
// Lines 1034-1371 of readable/play-inline-503.pretty.js (statement-aligned).
  function sirenShot(shot, cur) {
    const w = shot.weapon,
      so = w.sonic || { range: 10, arc: 0.6, knock: 0.85 };
    const origin = shot.origin.clone(),
      dir = shot.dir.clone().normalize();
    const C = CMB(),
      t = now();
    const cosA = Math.cos(so.arc || 0.6);
    const cond = P.getCond(cur.id);
    let hits = 0;
    const list = C && C.list ? C.list : [];
    for (const a of list) {
      if (!a || a.dead || !a.inScene || a.removed) continue;
      const cp = a.centerPos ? a.centerPos(new THREE.Vector3()) : a.pos.clone();
      const to = cp.clone().sub(origin);
      const dist = to.length();
      if (dist > so.range + (a.radius || 0.4) || dist < 1e-3) continue;
      if (to.normalize().dot(dir) < cosA && dist > 1.5) continue;
      if (!G.world.lineOfSight(origin, cp)) continue;
      const f = Math.max(0.3, 1 - (dist / so.range) * 0.6);
      const dmg = w.damage * f * (0.6 + 0.4 * cond);
      try {
        C.applyDamage(a, dmg, {
          type: "sonic",
          source: "player",
          part: "torso",
          dir: dir.clone(),
          point: cp.clone(),
          weaponId: cur.id,
        });
      } catch (e) {
        G.reportError("weapons:siren", e);
      }
      if (!a.dead) {
        const down = C.tryKnockdown
          ? C.tryKnockdown(a, (so.knock || 0.85) * f, dir.clone())
          : false;
        if (!down) {
          a.slowT = Math.max(a.slowT || 0, t + 1.4 * f);
          a.speed = 0;
        }
        a.suppressT = Math.max(a.suppressT || 0, t + 2.2);
        a.aimT = Math.max(a.aimT || 0, t + 0.9 * f);
      }
      hits++;
    }
    if (C && C.noise) {
      try {
        C.noise(origin, 90, "player", "gun");
      } catch (e) {
        /* ignore */
      }
    }
    // glass, cans and car alarms in the cone take a beating too
    if (!G.isStub("props") && G.props.damageAt) {
      try {
        G.props.damageAt(
          origin.clone().addScaledVector(dir, so.range * 0.5),
          w.damage * 0.5,
          so.range * 0.5,
        );
      } catch (e) {
        /* ignore */
      }
    }
    sirenRings(
      shot.muzzle
        ? shot.muzzle.clone()
        : origin.clone().addScaledVector(dir, 0.5),
      dir,
      so.range,
    );
    if (fxOk()) {
      try {
        G.fx.dust(
          origin
            .clone()
            .addScaledVector(dir, 2)
            .setY(G.player.pos.y + 0.1),
          { scale: 1.2, count: 8, color: 0xb8b0a0 },
        );
      } catch (e) {
        /* ignore */
      }
    }
    return hits >= 0;
  }

  // ------------------------------------------------------------------
  // Recoilless rifle back-blast: anything standing behind you gets the exhaust;
  // a wall right behind you bounces some of it back.
  // ------------------------------------------------------------------
  P.backblast = function (w, wid) {
    const bb = w.backblast || { range: 5, damage: 40 };
    const pl = G.player;
    const back = pl.forward.clone().negate();
    back.y = 0;
    if (back.lengthSq() < 1e-6) return;
    back.normalize();
    const origin = pl.eye.clone().addScaledVector(back, 0.7);
    origin.y -= 0.2;
    if (fxOk()) {
      try {
        G.fx.dust(origin, { scale: 1.8, count: 12, color: 0xb0a898 });
        G.fx.flash(origin, 0xffa050, 2.5, 0.08, { range: 8 });
        G.fx.sparks(origin, { dir: back, count: 10, speed: 9 });
      } catch (e) {
        /* ignore */
      }
    }
    const C = CMB();
    if (C && C.list) {
      for (const a of C.list) {
        if (!a || a.dead || !a.inScene) continue;
        const to = new THREE.Vector3(a.pos.x - pl.pos.x, 0, a.pos.z - pl.pos.z);
        const dist = to.length();
        if (dist > bb.range || dist < 0.1) continue;
        if (to.normalize().dot(back) < 0.55) continue;
        const f = 1 - dist / bb.range;
        try {
          C.applyDamage(a, bb.damage * f, {
            type: "fire",
            source: "player",
            part: "torso",
            weaponId: wid,
            dir: back.clone(),
          });
        } catch (e) {
          /* ignore */
        }
        if (!a.dead && C.tryKnockdown)
          C.tryKnockdown(a, 0.4 + f * 0.6, back.clone());
      }
    }
    // a wall within a metre and a half behind: the blast comes straight back
    try {
      const wh = G.world.raycast(pl.eye, back, 1.5, {
        ignoreTags: ["actor", "foliage"],
      });
      if (wh) {
        pl.damage(12 * (1 - wh.dist / 1.5) + 4, {
          type: "explosive",
          source: "player",
        });
        pl.shake(0.5, 0.4);
        G.notify("The back-blast hits the wall behind you.");
      }
    } catch (e) {
      /* ignore */
    }
  };

  // ------------------------------------------------------------------
  // Riot gas: a low white cloud. Everyone inside is slowed and can't aim
  // (robots don't breathe). G.weapons.gasCloud is also called by combat
  // for NPC-thrown gas ('gas' explosion kind).
  // ------------------------------------------------------------------
  const clouds = [];
  P.gasCloud = W.gasCloud = function (pos, radius, opts) {
    opts = opts || {};
    const c = {
      pos: new THREE.Vector3(pos.x, pos.y, pos.z),
      r: radius || 5,
      t: opts.secs || 10,
      src: opts.source === undefined ? "player" : opts.source,
      tick: 0,
      em: [],
      weaponId: opts.weaponId || "riot_gas_grenade",
    };
    try {
      const gy = G.world.groundHeight(c.pos.x, c.pos.z, c.pos.y + 1, 0.2);
      if (isFinite(gy) && Math.abs(gy - c.pos.y) < 3) c.pos.y = gy;
    } catch (e) {
      /* ignore */
    }
    if (fxOk() && G.fx.smoke) {
      for (let i = 0; i < 4; i++) {
        const a = i * 1.7,
          rr = i ? c.r * 0.45 : 0;
        try {
          const e = G.fx.smoke(
            new THREE.Vector3(
              c.pos.x + Math.cos(a) * rr,
              c.pos.y + 0.1,
              c.pos.z + Math.sin(a) * rr,
            ),
            0.5,
            { color: 0xd8dccb, alpha: 0.34, rise: 0.22, rate: 5, lod: 160 },
          );
          if (e) c.em.push(e);
        } catch (e) {
          /* ignore */
        }
      }
    }
    try {
      G.sfx.play("steam_hiss", { pos: c.pos, volume: 0.9, pitch: 0.8 });
    } catch (e) {
      /* ignore */
    }
    clouds.push(c);
    return c;
  };
  function updateClouds(dt) {
    if (!clouds.length || dt <= 0) return;
    const C = CMB(),
      t = now(),
      pl = G.player;
    for (let i = clouds.length - 1; i >= 0; i--) {
      const c = clouds[i];
      c.t -= dt;
      c.tick -= dt;
      if (c.tick <= 0) {
        c.tick = 0.3;
        const r = c.r * Math.min(1, 0.6 + (10 - Math.min(10, c.t)) * 0.2); // the cloud spreads for the first two seconds
        if (C && C.list)
          for (const a of C.list) {
            if (!a || a.dead || !a.inScene || a.isRobot) continue;
            const dx = a.pos.x - c.pos.x,
              dz = a.pos.z - c.pos.z;
            if (dx * dx + dz * dz > r * r || Math.abs(a.pos.y - c.pos.y) > 3)
              continue;
            a.slowT = Math.max(a.slowT || 0, t + 0.7);
            a.suppressT = Math.max(a.suppressT || 0, t + 1.0);
            if (Math.random() < 0.4) a.aimT = Math.max(a.aimT || 0, t + 0.5);
            if (Math.random() < 0.5) {
              try {
                C.applyDamage(a, 1, {
                  type: "poison",
                  source: c.src,
                  part: "torso",
                  silent: true,
                  weaponId: c.weaponId,
                });
              } catch (e) {
                /* ignore */
              }
            }
          }
        if (pl && pl.alive !== false) {
          const dx = pl.pos.x - c.pos.x,
            dz = pl.pos.z - c.pos.z;
          if (dx * dx + dz * dz < r * r && Math.abs(pl.pos.y - c.pos.y) < 3) {
            if (
              !G.isStub("rpg") &&
              G.rpg &&
              typeof G.rpg.addEffect === "function"
            ) {
              try {
                G.rpg.addEffect({
                  id: "tear_gas",
                  name: "Tear Gas",
                  kind: "debuff",
                  duration: 2.5,
                  mods: { speedMult: -0.3, spreadMult: 0.6 },
                  desc: "Eyes streaming: slower, wilder aim",
                });
              } catch (e) {
                /* ignore */
              }
            }
            if (Math.random() < 0.3) {
              try {
                pl.damage(1, { type: "poison", source: c.src });
              } catch (e) {
                /* ignore */
              }
            }
          }
        }
      }
      if (c.t <= 0) {
        for (const e of c.em) {
          try {
            e.stop();
          } catch (er) {
            /* ignore */
          }
        }
        clouds.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------
  // Molotov: the bottle breaks, a whoomph, a patch of burning ground
  // ------------------------------------------------------------------
  const fires = [];
  P.fireBurst = function (pos, radius, damage, spec) {
    const p = new THREE.Vector3(pos.x, pos.y, pos.z);
    try {
      const gy = G.world.groundHeight(p.x, p.z, p.y + 0.5, 0.2);
      if (isFinite(gy) && Math.abs(gy - p.y) < 2.5) p.y = gy;
    } catch (e) {
      /* ignore */
    }
    try {
      G.sfx.play("glass_break", { pos: p, volume: 0.9 });
    } catch (e) {
      /* ignore */
    }
    if (P.combatReal() && typeof G.combat.explode === "function") {
      try {
        G.combat.explode(p, radius * 0.7, damage * 0.5, {
          source: "player",
          kind: "fire",
          weaponId: spec.weaponId,
          small: true,
        });
      } catch (e) {
        G.reportError("weapons:molotov", e);
      }
    } else if (fxOk()) {
      try {
        G.fx.explosion(p, radius, "fire");
      } catch (e) {
        /* ignore */
      }
    }
    const burn = spec.burn || { secs: 8, dps: 6 };
    let fx = null;
    if (fxOk() && G.fx.fire) {
      try {
        fx = G.fx.fire(p, Math.max(0.8, radius * 0.45), { light: true });
      } catch (e) {
        fx = null;
      }
    }
    fires.push({
      pos: p,
      r: radius,
      t: burn.secs,
      dps: burn.dps,
      tick: 0,
      fx,
      weaponId: spec.weaponId || "molotov",
    });
  };
