// play-inline-525 05 — yaw
// Lines 1143-1481 of readable/play-inline-525.pretty.js (statement-aligned).
  function encDeadDrop() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 30, 70, {
      road: false,
      hidden: true,
      notSettlement: true,
      clear: 1.2,
      tries: 50,
    });
    if (!s) return null;
    const E = {
      kind: "dead_drop",
      x: s.x,
      z: s.z,
      props: [],
      pickups: [],
      t: 0,
    };
    const yaw = Math.random() * 6.28;
    const sk = K.spawnProp("skeleton", {
      x: s.x,
      y: s.y,
      z: s.z,
      yaw,
      pose: K.pick(["sitting", "lying", "reaching"]),
    });
    if (sk) E.props.push(sk);
    const lx = s.x + Math.sin(yaw + 1.2) * 1.1,
      lz = s.z + Math.cos(yaw + 1.2) * 1.1;
    const loot = K.stock(
      K.pick([
        [
          [K.SCRIP, K.randInt(25, 70)],
          ["rally_tonic", 1],
          ["duct_tape", 1],
          ["purified_water", 1],
        ],
        [
          ["ammo_12ga", 14],
          ["ammo_10mm", 22],
          ["rally_tonic", 2],
          ["scrap_metal", 1],
        ],
        [
          ["iodine_tabs", 1],
          ["prussian_blue", 1],
          ["dirty_water", 2],
          ["golden_plain_jerky", 2],
          [K.SCRIP, K.randInt(15, 40)],
        ],
      ]),
    );
    const box = K.spawnProp("footlocker", {
      x: lx,
      y: s.y,
      z: lz,
      yaw: yaw + Math.PI / 2,
      items: loot,
      name: "Scavenger's Footlocker",
    });
    if (box) E.props.push(box);
    const note = K.pick([
      "amb_note_last_day_1",
      "amb_note_last_day_2",
      "amb_note_last_day_3",
    ]);
    const pk = K.spawnPickup(
      note,
      1,
      new THREE.Vector3(
        s.x + Math.sin(yaw) * 0.5,
        s.y + 0.05,
        s.z + Math.cos(yaw) * 0.5,
      ),
    );
    if (pk) E.pickups.push(pk);
    if (!E.props.length && !E.pickups.length) return null;
    // a crow or two already knows
    if (K.fauna && Math.random() < 0.6 && !K.isDark())
      K.fauna.spawnFlock(
        "crow",
        s.x,
        s.y + K.rand(14, 20),
        s.z,
        K.randInt(3, 5),
        { r: 8 },
      );
    E.update = function (dt) {
      E.t += dt;
      return castGone(E) ? "gone" : null;
    };
    E.cleanup = function () {
      removeCast(E);
    };
    return E;
  }

  // ------------------------------------------------------------------
  // Encounter: crashed Rotorcraft (flight locker: the key is on the pilot)
  // ------------------------------------------------------------------
  function encCrash() {
    if (!K.rotorcraft) return null;
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 70, 110, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 7,
      tries: 50,
    });
    if (!s) return null;
    const kind = Math.random() < 0.6 ? "continuity" : "covenant";
    const rc = K.rotorcraft.create(kind, { crashed: true });
    const yaw = Math.random() * 6.28;
    rc.root.position.set(s.x, s.y + 1.7, s.z);
    rc.root.rotation.set(0.1, yaw, 0.3, "YXZ");
    G.scene.add(rc.root);
    try {
      G.world.addLOD(rc.root, 420);
    } catch (e) {
      /* ignore */
    }
    const E = {
      kind: "crash_site",
      x: s.x,
      z: s.z,
      objs: [rc],
      props: [],
      pickups: [],
      colliders: [],
      fx: [],
      t: 0,
    };
    try {
      E.colliders.push(
        G.world.addCollider(s.x, s.z, 3.2, 15.0, s.y, s.y + 3.4, yaw, {
          tag: "amb_crash",
          surface: "metal",
        }),
      );
    } catch (e) {
      /* ignore */
    }
    // local axes of the wreck: forward (-Z of the model) and right (+X)
    const fx = -Math.sin(yaw),
      fz = -Math.cos(yaw),
      rx = Math.cos(yaw),
      rz = -Math.sin(yaw);
    if (!G.isStub("fx")) {
      try {
        const fp = new THREE.Vector3(
          s.x + fx * 4.5 + rx * 1.2,
          s.y + 1.4,
          s.z + fz * 4.5 + rz * 1.2,
        ); // aft engines burning
        const f = G.fx.fire(
          new THREE.Vector3(
            s.x - fx * 5 + rx * 1.3,
            s.y + 2.2,
            s.z - fz * 5 + rz * 1.3,
          ),
          1.2,
          { smoke: true, glow: true, sound: true },
        );
        if (f) E.fx.push(f);
        const sm = G.fx.smoke(fp, 2.4, { dark: true });
        if (sm) E.fx.push(sm);
      } catch (e) {
        /* ignore */
      }
    }
    const loot =
      kind === "continuity"
        ? [
            ["ammo_gyrojet", 24],
            ["ammo_dry_cell", 4],
            ["rally_tonic", 2],
            ["riot_gas_grenade", 1],
            ["gyrojet_pistol", 1],
          ]
        : [
            ["ammo_gyrojet", 18],
            ["ammo_556", 60],
            ["rally_tonic", 2],
            ["frag_grenade", 2],
            ["gyrojet_pistol", 1],
          ];
    // the flight locker sits by the open crew door; a fresh wreck means a fresh (locked) locker
    K.relock(CRASH_LOCK.id);
    const bx = s.x + rx * 2.8 + fx * 3.5,
      bz = s.z + rz * 2.8 + fz * 3.5;
    const box = K.spawnProp("locker", {
      x: bx,
      y: s.y,
      z: bz,
      yaw: yaw + Math.PI / 2,
      items: K.stock(loot),
      lock: CRASH_LOCK,
      name:
        kind === "continuity"
          ? "Continuity Flight Locker"
          : "Covenant Flight Locker",
    });
    if (box) E.props.push(box);
    // the pilot didn't make it far: remains, the locker key and the crew card a few steps from the nose
    const px = s.x + fx * 9.5 + rx * 1.8,
      pz = s.z + fz * 9.5 + rz * 1.8;
    const py = K.groundAt(px, pz, s.y + 0.5);
    if (py !== null) {
      const sk = K.spawnProp("skeleton", {
        x: px,
        y: py,
        z: pz,
        yaw: yaw + 2.2,
        pose: "reaching",
        name: "Pilot's Remains",
      });
      if (sk) E.props.push(sk);
      const kp = K.spawnPickup(
        FLIGHT_KEY,
        1,
        new THREE.Vector3(px + rx * 0.45, py + 0.05, pz + rz * 0.45),
      );
      if (kp) E.pickups.push(kp);
      const cp = K.spawnPickup(
        "amb_note_flight_card",
        1,
        new THREE.Vector3(px - rx * 0.4, py + 0.05, pz - rz * 0.4),
      );
      if (cp) E.pickups.push(cp);
    } else {
      // nowhere to lay the pilot: the key hangs in the locker door instead (the lock still resolves)
      const kp = K.spawnPickup(
        FLIGHT_KEY,
        1,
        new THREE.Vector3(bx + rx * 0.6, s.y + 0.05, bz + rz * 0.6),
      );
      if (kp) E.pickups.push(kp);
    }
    if (K.fauna) K.fauna.scare(s.x, s.z, 60);
    E.update = function (dt) {
      E.t += dt;
      return castGone(E) ? "gone" : null;
    };
    E.cleanup = function () {
      removeCast(E);
    };
    return E;
  }

  // ------------------------------------------------------------------
  // Encounter: standing hit squad
  // ------------------------------------------------------------------
  function hitSquadKind() {
    const k = K.standing();
    if (k >= 750) return "merc";
    if (k <= -750) return "marshal";
    return null;
  }
  function encHitSquad(force) {
    const kind = force || hitSquadKind();
    if (!kind) return null;
    let actors = [];
    if (
      !G.isStub("combat") &&
      typeof G.combat.spawnSpecialEncounter === "function"
    ) {
      try {
        actors = G.combat.spawnSpecialEncounter(kind) || [];
      } catch (e) {
        G.reportError("ambient:hitsquad", e);
        actors = [];
      }
    }
    if (!actors.length) actors = fallbackSquad(kind);
    if (!actors.length) return null;
    stats.hitSquads++;
    stats.lastHitSquadDay = K.day();
    // they announce themselves as soon as they spot you
    const lead = actors[0];
    const E = {
      kind: "hit_squad",
      x: lead.pos.x,
      z: lead.pos.z,
      actors,
      t: 0,
      shouted: false,
      owned: !lead.group,
    };
    E.update = function (dt) {
      E.t += dt;
      const alive = actors.filter((a) => K.actorAlive(a));
      if (!alive.length) return "dead";
      E.x = alive[0].pos.x;
      E.z = alive[0].pos.z;
      if (!E.shouted && K.distToPlayer(E.x, E.z) < 45) {
        E.shouted = true;
        K.say(
          alive[0],
          kind === "merc"
            ? K.pick([
                "There's the do-gooder! Contract says dead, boys!",
                "Nothing personal, popsicle. Somebody paid a lot of scrip.",
                "That's the mark! Light 'em up!",
              ])
            : K.pick([
                "By order of the Lantern Marshals, you're coming in. Dead's fine.",
                "There's the butcher! Weapons free!",
                "Your kind of trouble ends here, murderer.",
              ]),
          4,
        );
      }
      if (E.owned) {
        // own fallback squad: keep homing in (combat's squads home in on their own)
        if (E.t % 6 < dt)
          for (const a of alive)
            if (!a.inCombat) {
              a.patrol = [{ x: G.player.pos.x, z: G.player.pos.z }];
              a.patrolIdx = 0;
            }
        return castGone(E) ? "gone" : null;
      }
      return E.t > 30 ? "handed_off" : null; // combat owns and despawns its roaming groups
    };
    E.cleanup = function (reason) {
      if (E.owned && reason !== "handed_off") removeCast(E);
    };
    return E;
  }
  function squadWeapon() {
    const ok = [
      "assault_rifle",
      "combat_shotgun",
      "hunting_rifle",
      "pistol_10mm",
    ].filter((w) => K.itemExists(w));
    return ok.length ? K.pick(ok) : "none";
  }
