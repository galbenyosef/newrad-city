// play-inline-511 06 — center
// Lines 1675-1866 of readable/play-inline-511.pretty.js (statement-aligned).
  CB.explode = function (pos, radius, damage, opts) {
    opts = opts || {};
    const kind = opts.kind || "normal";
    if (
      kind === "gas" &&
      !G.isStub("weapons") &&
      typeof G.weapons.gasCloud === "function"
    ) {
      try {
        G.weapons.gasCloud(pos, radius, {
          source: C.normSource(opts.source),
          weaponId: opts.weaponId,
        });
      } catch (e) {
        G.reportError("combat:gas", e);
      }
      return;
    }
    const src = C.normSource(opts.source);
    const center = pos.clone
      ? pos.clone()
      : new THREE.Vector3(pos.x, pos.y, pos.z);
    C.fx("explosion", center.clone(), radius, kind);
    C.sfx(kind === "nuke" ? "explosion_nuke" : "explosion", {
      pos: center,
      volume: opts.small ? 0.6 : 1,
      pitch: opts.small ? 1.3 : 0.9 + Math.random() * 0.2,
    });
    if (G.isStub("fx")) {
      /* nothing visual */
    }
    C.fx(
      "decal",
      new THREE.Vector3(
        center.x,
        G.world.groundHeight(center.x, center.z, center.y + 0.5) + 0.02,
        center.z,
      ),
      UP.clone(),
      "scorch",
    );
    C.noise(center, kind === "nuke" ? 250 : 110, src || "player", "explosion"); // unknown sources (props) are blamed on the player: you shot the car
    const ex = { center, radius };
    const isPlayer = src === "player";
    // Actors
    for (const a of C.list.slice()) {
      if (!a.inScene) continue;
      const cp = a.centerPos(_p);
      const d = cp.distanceTo(center);
      if (d > radius + a.radius) continue;
      let f = C.clamp(
        1 - Math.pow(Math.max(0, d - a.radius) / radius, 1.4),
        0,
        1,
      );
      if (f <= 0) continue;
      if (
        !G.world.lineOfSight(
          center.clone().add(new THREE.Vector3(0, 0.3, 0)),
          cp,
        )
      )
        f *= 0.35;
      let dmg = damage * f;
      if (isPlayer)
        dmg = playerDamage(
          dmg,
          C.weaponInfo(opts.weaponId) || { skill: "explosives" },
          a,
          {},
        );
      const bdir = _d.subVectors(cp, center).normalize().clone();
      C.applyDamage(a, dmg, {
        type: "explosive",
        source: src,
        part: "torso",
        explosion: ex,
        dir: bdir,
        weaponId: opts.weaponId,
        explosionKind: kind,
        raw: false,
      });
      // survivors close to the blast are thrown off their feet (35_reactions)
      if (!a.dead && C.tryKnockdown && !opts.small)
        C.tryKnockdown(a, f * (kind === "nuke" ? 1.5 : 1), bdir);
      if (kind === "nuke" && !a.dead) C.ignite(a, 4, 6, src);
    }
    // Player
    const P = G.player;
    const pd = P.pos.distanceTo(center);
    if (pd < radius * 1.1 && P.alive && !opts.ignorePlayer) {
      let f = C.clamp(1 - Math.pow(pd / radius, 1.4), 0, 1);
      if (
        !G.world.lineOfSight(
          center.clone().add(new THREE.Vector3(0, 0.3, 0)),
          _p.set(P.pos.x, P.pos.y + 1, P.pos.z),
        )
      )
        f *= 0.35;
      if (f > 0) {
        let dmg = damage * f * (src && src !== "player" ? 0.6 : 0.8);
        P.damage(dmg, { type: "explosive", source: src });
        // knockback
        const kx = P.pos.x - center.x,
          kz = P.pos.z - center.z,
          kd = Math.hypot(kx, kz) || 1;
        P.vel.x += (kx / kd) * 7 * f;
        P.vel.z += (kz / kd) * 7 * f;
        P.vel.y += 3 * f;
        P.onGround = false;
      }
    }
    if (pd < radius * 6)
      P.shake(
        C.clamp((kind === "nuke" ? 2 : 1) * (1 - pd / (radius * 6)), 0.1, 1),
        kind === "nuke" ? 1.5 : 0.5,
      );
    // Cars & props chain reactions
    if (!G.isStub("props") && typeof G.props.damageAt === "function") {
      try {
        G.props.damageAt(center, damage, radius);
      } catch (e) {
        /* ignore */
      }
    }
    // Nuke-class blasts leave a hot zone for a while
    if (kind === "nuke") {
      const src2 = G.world.addRadSource({
        x: center.x,
        y: center.y,
        z: center.z,
        radius: radius * 2,
        strength: 14,
      });
      tempRads.push({ src: src2, t: 30, s0: 14 });
    }
    // Flash light
    C.fx(
      "flash",
      center.clone(),
      0xffa040,
      kind === "nuke" ? 12 : 5,
      kind === "nuke" ? 1.5 : 0.35,
    );
    // Fallback visual if the fx module is missing: a quick fireball sprite
    if (G.isStub("fx")) fallbackBurst(center, radius, kind);
  };
  function updateTempRads(dt) {
    for (let i = tempRads.length - 1; i >= 0; i--) {
      const r = tempRads[i];
      r.t -= dt;
      r.src.strength = r.s0 * C.clamp(r.t / 30, 0, 1);
      if (r.t <= 0) {
        G.world.removeRadSource(r.src);
        tempRads.splice(i, 1);
      }
    }
  }
  const bursts = [];
  function fallbackBurst(center, radius, kind) {
    const s = new THREE.Sprite(
      spriteMat(kind === "nuke" ? 0xfff0c0 : 0xffa040, 1),
    );
    s.position.copy(center);
    s.scale.setScalar(0.5);
    G.scene.add(s);
    bursts.push({ s, t: 0, r: radius * (kind === "nuke" ? 2.5 : 1.3) });
  }
  function updateBursts(dt) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.t += dt;
      const k = b.t / 0.6;
      b.s.scale.setScalar(b.r * Math.min(1, k * 2));
      b.s.material.opacity = Math.max(0, 1 - k);
      if (k >= 1) {
        G.scene.remove(b.s);
        b.s.material.dispose();
        bursts.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------
  // Melee
  // ------------------------------------------------------------------
  /**
   * melee({from, range, arc, damage, weaponId, type?, knock?, slam?, rads?, power?})
   * Player: hits the best actor in the swing arc (per-part via a ray, else torso).
   * Actor: hits its target (player or actor) if in reach & arc; slams hit everyone nearby.
   * Returns {hit: actor|'player'|null, part, damage}.
   */
