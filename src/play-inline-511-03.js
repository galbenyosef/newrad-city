// play-inline-511 03 — info
// Lines 706-1017 of readable/play-inline-511.pretty.js (statement-aligned).
  C.killActor = function (a, info) {
    if (a.dead) return;
    const killer = info.source || null;
    a.dead = true;
    a.hp = 0;
    a.deathT = now();
    a.killer = killer;
    a.inCombat = false;
    a.target = null;
    a.state = "dead";
    a.pendingMelee = null;
    a.speed = 0;
    if (a.burrowed) {
      a.burrowed = false;
      a.char.root.visible = true;
    }
    if (a.hoverBoost) a.hoverBoost = 0;
    C.hideBark(a);
    // a pickpocketed NPC's pockets become an ordinary corpse
    for (const c of [a.container, a._rpgContainer])
      if (c) {
        c.owner = null;
        c.pickpocket = false;
        c.onTake = null;
      }
    try {
      if (a.char.lookAt) a.char.lookAt(null);
    } catch (e) {
      /* ignore */
    }
    if (info.restore) {
      a.anim("dead");
      a.pos.y = G.world.groundHeight(a.pos.x, a.pos.z, a.pos.y + 0.5);
      return;
    }
    {
      let ddir = info.dir || null;
      if (info.explosion)
        ddir = new THREE.Vector3(
          a.pos.x - info.explosion.center.x,
          0,
          a.pos.z - info.explosion.center.z,
        ).normalize();
      try {
        a.char.setAim && a.char.setAim(false);
        a.char.setAnim("death", {
          dir: ddir,
          force: info.finalDamage || 0,
          explosive: info.type === "explosive",
          blast: !!info.explosion,
        });
      } catch (e) {
        /* ignore */
      }
      a._anim = "death";
    }
    if (a.td.sounds && a.td.sounds.death)
      C.sfx(a.td.sounds.death, {
        pos: a.pos,
        volume: 0.9,
        pitch: a.td.boss ? 0.6 : 0.9 + Math.random() * 0.15,
      });
    // Hovering things drop out of the sky
    if (a.hover) {
      a.corpse = { vx: 0, vy: 0, vz: 0, spin: 0 };
      a.hover = 0;
    }
    // Robots spark, sky-eye drones pop
    if (a.isRobot) {
      C.fx("sparks", a.centerPos());
      C.fx("smoke", a.centerPos(), 0.6);
      // delayed pop on the game clock (pauses in menus, cleared on load)
      if (a.type === "sky_eye" || Math.random() < 0.25)
        C.later(a.type === "sky_eye" ? 0.25 : 0.9, () => {
          if (!a.removed)
            CB.explode(
              a.centerPos(),
              a.type === "sky_eye" ? 2.5 : 3.5,
              a.type === "sky_eye" ? 15 : 30,
              { source: null, kind: "normal", small: true },
            );
        });
    }
    // Gore & disintegration
    const bloody = false; // (extra-gore option; off)
    if (!info.noGore && info.type !== "sonic") {
      if (
        info.type === "explosive" &&
        (info.finalDamage > a.maxHp * 0.6 || bloody || Math.random() < 0.35) &&
        !a.td.boss
      )
        C.gib(a, info, bloody ? 4 : 2 + Math.floor(Math.random() * 3));
      else if (
        info.part === "head" &&
        info.crit &&
        info.type !== "energy" &&
        (bloody || Math.random() < 0.65)
      )
        C.dismember(a, "head", info.dir, true);
      else if (
        info.crit &&
        info.part &&
        info.part !== "torso" &&
        (bloody || Math.random() < 0.5)
      )
        C.dismember(a, info.part, info.dir);
      else if (bloody && Math.random() < 0.4)
        C.dismember(
          a,
          info.part && info.part !== "torso"
            ? info.part
            : C.pick(["leftArm", "rightArm", "leftLeg", "rightLeg", "head"]),
          info.dir,
        );
      else if (
        info.part === "head" &&
        (info.finalDamage || 0) > a.maxHp * 1.2 &&
        Math.random() < 0.4
      )
        C.dismember(a, "head", info.dir, true);
    }
    // Knockback / tumble
    if (!a.disintegrated) C.throwCorpse(a, info);
    // (Standing for murdering bystanders & kill XP are awarded by the rpg module on actorKilled)
    // Allies notice: "Man down!", and friends who saw it happen go looking for the shooter (35_reactions)
    if (C.allyKilled) {
      try {
        C.allyKilled(a, info);
      } catch (e) {
        G.reportError("combat:allyKilled", e);
      }
    } else
      for (const o of C.list)
        if (
          o !== a &&
          !o.dead &&
          o.inScene &&
          o.faction === a.faction &&
          o.distTo(a.pos) < 20
        ) {
          o.bark("allyDown", 0.35);
          break;
        }
    // Callbacks & events
    if (a.onDeath) {
      try {
        a.onDeath(a, killer);
      } catch (e) {
        G.reportError("combat:onDeath", e);
      }
    }
    G.events.emit("actorKilled", a, killer);
    if (
      killer &&
      killer !== "player" &&
      !killer.dead &&
      typeof killer.bark === "function"
    )
      killer.bark("kill", 0.5); // (killer can be a terminal / hazard object)
  };

  /** Launch the corpse ragdoll-ish (bullet push, or explosion tumble). */
  C.throwCorpse = function (a, info) {
    const rig = !a.char.placeholder;
    if (rig && !info.explosion) return; // the G.chars death animation handles the fall direction
    const c = a.corpse || (a.corpse = { vx: 0, vy: 0, vz: 0, spin: 0 });
    if (info.explosion) {
      const ex = info.explosion;
      const dx = a.pos.x - ex.center.x,
        dz = a.pos.z - ex.center.z;
      const d = Math.hypot(dx, dz) || 0.1;
      const f =
        C.clamp(1 - d / ex.radius, 0.15, 1) *
        (a.td.boss ? 0.2 : a.td.small ? 1.6 : 1);
      c.vx = (dx / d) * 9 * f;
      c.vz = (dz / d) * 9 * f;
      c.vy = 4 + 6 * f;
      c.spin = rig ? 0 : (Math.random() < 0.5 ? -1 : 1) * (4 + 6 * f);
    } else if (info.dir && !a.td.boss) {
      const k = C.clamp(
        (info.finalDamage || 10) * 0.07,
        0.5,
        a.td.small ? 7 : 4,
      );
      c.vx += info.dir.x * k;
      c.vz += info.dir.z * k;
      c.vy += a.td.small ? k * 0.6 : 0.3;
    }
  };
  /** Per-frame corpse motion. */
  C.updateCorpse = function (a, dt) {
    const c = a.corpse;
    if (!c) return;
    a.pos.x += c.vx * dt;
    a.pos.z += c.vz * dt;
    // don't fly through walls
    const r = G.world.moveCircle(a.pos, Math.min(a.radius, 0.5), 0.5, 0, 0);
    a.pos.x = r.x;
    a.pos.z = r.z;
    c.vy -= 20 * dt;
    a.pos.y += c.vy * dt;
    const gh = G.world.groundHeight(a.pos.x, a.pos.z, a.pos.y + 0.5, 0.2);
    let floor = gh;
    if (
      G.world.terrainHeight(a.pos.x, a.pos.z) < G.world.waterLevel &&
      gh < G.world.waterLevel
    )
      floor = gh; // sinks in water
    if (c.spin) a.char.root.rotation.x += c.spin * dt;
    if (a.pos.y <= floor) {
      a.pos.y = floor;
      if (c.vy < -6 && !a._thudded) {
        a._thudded = true;
        C.fx("dust", a.pos.clone());
        C.sfx("land", { pos: a.pos, volume: 0.5, pitch: 0.7 });
      }
      c.vy = 0;
      c.vx *= Math.max(0, 1 - 8 * dt);
      c.vz *= Math.max(0, 1 - 8 * dt);
      if (c.spin) {
        c.spin = 0;
      }
    }
    // settle rotation back after landing
    if (!c.spin && a.char.root.rotation.x !== 0) {
      a.char.root.rotation.x = U.damp(a.char.root.rotation.x, 0, 6, dt);
      if (Math.abs(a.char.root.rotation.x) < 0.01) a.char.root.rotation.x = 0;
    }
    if (
      a.pos.y <= floor &&
      Math.abs(c.vx) + Math.abs(c.vz) < 0.05 &&
      !c.spin &&
      a.char.root.rotation.x === 0
    )
      a.corpse = null;
  };

  // ------------------------------------------------------------------
  // Gibs (Bloody Mess)
  // ------------------------------------------------------------------
  const gibs = [];
  let gibGeos = null,
    gibMats = null;
  function gibAssets() {
    if (gibGeos) return;
    gibGeos = [
      new THREE.DodecahedronGeometry(0.09, 0),
      new THREE.BoxGeometry(0.16, 0.08, 0.1),
      new THREE.IcosahedronGeometry(0.07, 0),
      new THREE.CylinderGeometry(0.035, 0.03, 0.26, 5),
    ];
    const mk = (c, o) => {
      const m = new THREE.MeshStandardMaterial(
        Object.assign({ color: c, roughness: 0.55, metalness: 0.05 }, o || {}),
      );
      m.userData.shared = true;
      return m;
    };
    gibMats = {
      red: [mk(0x6a0d0d), mk(0x8a1a14), mk(0xcfc6b0)],
      green: [mk(0x3d6a14), mk(0x5a8a22), mk(0xb8b89a)],
      oil: [
        mk(0x5a5a58, { metalness: 0.7 }),
        mk(0x3a3a3a, { metalness: 0.6 }),
        mk(0x8a6a2a, { metalness: 0.5 }),
      ],
      violet: [mk(0x4a1a4a), mk(0x6a2a5a), mk(0xc8c0b8)],
      blue: [mk(0x1e3c86), mk(0x6a5a3a, { roughness: 0.35 }), mk(0xb8b090)],
    };
  }
  function addGibPhysics(obj, pos, vel, life) {
    obj.position.copy(pos);
    if (!obj.parent) G.scene.add(obj);
    gibs.push({
      obj,
      vel,
      spin: new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18,
      ),
      life: life || 25,
      t: 0,
      rest: false,
    });
    while (gibs.length > 70) {
      const g = gibs.shift();
      if (g.obj.parent) g.obj.parent.remove(g.obj);
    }
  }
  /** Spawn n generic gib chunks at pos. */
  C.spawnGibs = function (pos, dir, n, gore, force) {
    gibAssets();
    const mats = gibMats[gore] || gibMats.red;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(
        gibGeos[i % gibGeos.length],
        mats[i % 3 === 2 ? 2 : Math.floor(Math.random() * 2)],
      );
      m.scale.setScalar(0.7 + Math.random() * 0.9);
      m.castShadow = false;
      const f = force || 4;
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * f,
        1.5 + Math.random() * f * 0.8,
        (Math.random() - 0.5) * f,
      );
      if (dir) v.addScaledVector(dir, f * 0.5);
      addGibPhysics(m, pos, v, 22 + Math.random() * 8);
    }
  };
  /** Sever a part (exploding head when part==='head' & explode). */
