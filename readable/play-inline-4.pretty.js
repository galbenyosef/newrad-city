/* src/core/player.js */
/* =====================================================================
 * NEW RAD CITY — PLAYER CONTROLLER & VITALS
 * Owned by: CORE.  First-person movement, collision, camera, vitals,
 * damage, radiation exposure, sprint stamina, fall damage, swimming,
 * footsteps. RPG numbers (max HP, DR, speed multipliers) come from G.rpg
 * if present.
 *
 * G.HERO is the fixed protagonist (there is no character creation): his
 * name, his starting attributes (REBRAND §4) and his look. Every module
 * reads the hero's name from G.HERO.name — never hard-code it.
 * ===================================================================== */
(function () {
  "use strict";
  const G = (window.G = window.G || {});
  const THREE = window.THREE;
  const U = G.util;

  // ------------------------------------------------------------------
  // The hero. Eli Wayte: civil-service volunteer of Project Long Winter
  // (Office of Civil Defense), frozen on 20 Feb 1967 (a 90-day trial; the city was bombed
  // two weeks in, Sunday 5 March 1967) in Cryo Unit C-9 and thawed in 1989. Attributes 1–10 (Brawn, Reflex, Grit, Wits, Senses, Presence);
  // the rpg module reads `attributes` on newGame. Skills start at the rpg's
  // base values and grow by use.
  // ------------------------------------------------------------------
  G.HERO = Object.freeze({
    name: "Eli Wayte",
    gender: "m",
    born: 1931, // 36 when he went into the pod, 58 on the calendar, 36 in the mirror
    frozen: 1967,
    thawed: 1989,
    program: "Project Long Winter",
    agency: "Office of Civil Defense",
    unit: "Cryo Unit C-9",
    occupation: "Civil Defense records clerk (volunteer sleeper)",
    hometown: "Flatbush, Brooklyn",
    attributes: Object.freeze({
      brawn: 5,
      reflex: 5,
      grit: 6,
      wits: 7,
      senses: 6,
      presence: 5,
    }),
    // head-start skill points (the rpg adds them to the skill base): Civil Defense records work, first-aid & radio courses
    skills: Object.freeze({ electronics: 6, medicine: 4, trade: 3 }),
    // the characters module's look vocabulary (skinTone key, hair style, 0xRRGGBB hairColor, beard)
    appearance: Object.freeze({
      gender: "m",
      skinTone: "fair",
      hair: "short",
      hairColor: 0x3b2a1e,
      beard: "stubble",
    }),
  });

  const P = (G.player = {
    pos: new THREE.Vector3(0, 0, 0), // feet position
    vel: new THREE.Vector3(),
    yaw: 0,
    pitch: 0, // yaw 0 = looking toward -Z (north). yaw PI = looking south (+Z)
    height: 1.78,
    eyeHeight: 1.64,
    sneakEyeHeight: 1.05,
    radius: 0.34,
    onGround: true,
    sneaking: false,
    sprinting: false,
    swimming: false,
    inWater: false,
    fly: false,
    frozen: false,
    godMode: false,
    noclip: false,
    walkSpeed: 4.6,
    sprintSpeed: 7.2,
    sneakSpeed: 2.3,
    swimSpeed: 2.6,
    jumpSpeed: 5.2,
    gravity: 19,
    hp: 100,
    maxHp: 100,
    stamina: 80,
    maxStamina: 80,
    rads: 0,
    radRate: 0,
    alive: true,
    name: G.HERO.name,
    fovBase: 72,
    fovTarget: 72,
    fovCurrent: 72,
    lastDamageTime: -99,
    lastStaminaUse: -99,
    moveSpeed: 0, // current horizontal speed (for weapon sway etc.)
    groundSurface: "concrete",
    _bob: 0,
    _shake: 0,
    _shakeT: 0,
    _recoilP: 0,
    _recoilY: 0,
    _stepDist: 0,
    _airTime: 0,
    _peakFall: 0,
    lightOn: false,
  });

  P.eye = new THREE.Vector3();
  P.forward = new THREE.Vector3();

  P.teleport = function (x, y, z, yaw) {
    P.pos.set(x, y, z);
    if (!P.fly) P.pos.y = G.world.groundHeight(x, z, y + 1.0, P.radius);
    P.vel.set(0, 0, 0);
    if (yaw !== undefined) P.yaw = yaw;
    P.pitch = 0;
    P._airTime = 0;
    P._peakFall = 0;
    G.events.emit("teleport", P.pos);
    applyCamera(0);
  };

  /** Apply damage. info: {type:'ballistic'|'energy'|'fire'|'explosive'|'melee'|'rad'|'fall'|'poison', source?:actor, part?, crit?} */
  P.damage = function (amount, info) {
    info = info || {};
    if (!P.alive || P.godMode || amount <= 0) return 0;
    if (info.type === "rad") {
      P.addRads(amount);
      return 0;
    }
    let final = amount;
    if (G.rpg && !G.isStub("rpg") && G.rpg.mitigate)
      final = G.rpg.mitigate(amount, info.type || "ballistic", info);
    final = Math.max(info.type === "fall" ? 0 : 1, final);
    P.hp -= final;
    P.lastDamageTime = G.time.elapsed;
    G.events.emit("playerDamaged", final, info);
    G.sfx.play("hurt_player", { volume: Math.min(1, 0.4 + final / 30) });
    P.shake(Math.min(0.6, 0.1 + final / 60), 0.25);
    if (P.hp <= 0) {
      P.hp = 0;
      P.die(info);
    }
    return final;
  };
  P.die = function (info) {
    if (!P.alive) return;
    P.alive = false;
    G.sfx.play("death_player");
    G.events.emit("playerDied", info || {});
    // Death screen after the fall. The timer is cancelled by reset/load (e.g. F9 during the fall), and the
    // callback re-checks that the player is still dead so a loaded, living game never gets a death screen.
    if (P._deathTimer) clearTimeout(P._deathTimer);
    P._deathTimer = setTimeout(() => {
      P._deathTimer = 0;
      if (!P.alive && G.state !== "dead") G.setState("dead");
    }, 1500);
  };
  P.heal = function (n) {
    if (!P.alive) return;
    P.hp = Math.min(P.maxHp, P.hp + n);
    G.events.emit("playerHealed", n);
  };
  P.addRads = function (n) {
    if (P.godMode && n > 0) return;
    let amt = n;
    if (G.rpg && !G.isStub("rpg") && G.rpg.radResist)
      amt = n * (1 - U.clamp(G.rpg.radResist() / 100, 0, 0.85));
    P.rads = U.clamp(P.rads + amt, 0, 1000);
    G.events.emit("radsChanged", P.rads, amt);
    if (P.rads >= 1000) P.die({ type: "rad" });
  };
  P.useStamina = function (n) {
    if (P.stamina < n) return false;
    P.stamina -= n;
    P.lastStaminaUse = G.time.elapsed;
    G.events.emit("staminaChanged", P.stamina);
    return true;
  };
  P.shake = function (intensity, duration) {
    P._shake = Math.max(P._shake, intensity);
    P._shakeT = Math.max(P._shakeT, duration || 0.3);
  };
  /** Recoil kick in radians (pitch up, yaw random). Recovers automatically. */
  P.addRecoil = function (pitch, yaw) {
    P._recoilP += pitch;
    P._recoilY += yaw || 0;
    P.pitch = U.clamp(P.pitch + pitch, -1.5, 1.5);
    P.yaw += yaw || 0;
  };
  P.getEye = function () {
    return P.eye;
  };
  P.getForward = function () {
    return P.forward;
  };
  P.setFov = function (fov) {
    P.fovTarget = fov;
  };
  P.isOverencumbered = function () {
    return !!(
      G.rpg &&
      !G.isStub("rpg") &&
      G.rpg.isOverencumbered &&
      G.rpg.isOverencumbered()
    );
  };

  function speedMult() {
    return G.rpg && !G.isStub("rpg") && G.rpg.speedMult ? G.rpg.speedMult() : 1;
  }

  const _move = new THREE.Vector3();
  P.update = function (dt, realDt) {
    // Death camera sink
    if (!P.alive) {
      P.pitch = U.damp(P.pitch, 0.4, 2, realDt);
      P.eyeHeightCur = U.damp(P.eyeHeightCur || P.eyeHeight, 0.3, 2, realDt);
      applyCamera(realDt);
      return;
    }
    const playing = G.state === "play";
    const I = G.input;
    P.updateCameraInput();
    // --- look ---
    if (playing && I.locked) {
      const sens = I.sensitivity * (P.fovCurrent / P.fovBase);
      P.yaw -= I.mouse.dx * sens;
      P.pitch -= I.mouse.dy * sens * (I.invertY ? -1 : 1);
      P.pitch = U.clamp(P.pitch, -1.52, 1.52);
    }
    // recoil recovery
    if (P._recoilP > 0) {
      const r = Math.min(P._recoilP, P._recoilP * 6 * dt + 0.0005);
      P._recoilP -= r;
      P.pitch -= r * 0.8;
    }
    if (dt <= 0) {
      applyCamera(realDt);
      return;
    }

    // --- noclip: free-fly along the view direction, no collision/gravity ---
    if (P.noclip) {
      let mx = 0,
        mz = 0,
        my = 0;
      if (playing) {
        if (I.action("forward")) mz -= 1;
        if (I.action("back")) mz += 1;
        if (I.action("left")) mx -= 1;
        if (I.action("right")) mx += 1;
        if (I.action("jump")) my += 1;
        if (I.action("sneak")) my -= 1;
      }
      const flySpeed = I.action("sprint") ? 45 : 12;
      const fwd = new THREE.Vector3(0, 0, -1).applyEuler(G.camera.rotation);
      const right = new THREE.Vector3(Math.cos(P.yaw), 0, -Math.sin(P.yaw));
      const move = new THREE.Vector3()
        .addScaledVector(fwd, -mz)
        .addScaledVector(right, mx);
      move.y += my;
      if (move.lengthSq() > 0) move.normalize().multiplyScalar(flySpeed * dt);
      P.pos.add(move);
      P.vel.set(0, 0, 0);
      P.onGround = false;
      P.sneaking = false;
      P.sprinting = false;
      P.swimming = false;
      P.inWater = false;
      P.radRate = 0;
      P.moveSpeed = 0;
      applyCamera(realDt, 0);
      return;
    }

    // --- movement input ---
    let fx = 0,
      fz = 0;
    if (playing && !P.frozen) {
      if (I.action("forward")) fz -= 1;
      if (I.action("back")) fz += 1;
      if (I.action("left")) fx -= 1;
      if (I.action("right")) fx += 1;
      if (I.actionPressed("sneak")) {
        P.sneaking = !P.sneaking;
        G.events.emit("sneak", P.sneaking);
      }
    }
    const moving = fx !== 0 || fz !== 0;
    const over = P.isOverencumbered();
    P.sprinting =
      playing &&
      moving &&
      I.action("sprint") &&
      !P.sneaking &&
      !P.swimming &&
      P.stamina > 1 &&
      !over &&
      fz < 0;
    let speed = P.sneaking
      ? P.sneakSpeed
      : P.sprinting
        ? P.sprintSpeed
        : P.walkSpeed;
    if (P.swimming) speed = P.swimSpeed;
    if (over) speed = Math.min(speed, 1.6);
    speed *= speedMult();
    if (fx && fz) {
      fx *= Math.SQRT1_2;
      fz *= Math.SQRT1_2;
    }
    const sin = Math.sin(P.yaw),
      cos = Math.cos(P.yaw);
    // yaw 0 faces -Z. forward vector = (-sin, 0, -cos)
    const wx = fx * cos + fz * sin,
      wz = -fx * sin + fz * cos;
    const accel = P.onGround || P.swimming || P.fly ? 14 : 2.5;
    P.vel.x = U.damp(P.vel.x, wx * speed, accel, dt);
    P.vel.z = U.damp(P.vel.z, wz * speed, accel, dt);

    // --- stamina: sprint drain & regen ---
    if (P.sprinting) {
      P.stamina = Math.max(0, P.stamina - 14 * dt);
      P.lastStaminaUse = G.time.elapsed;
    } else if (G.time.elapsed - P.lastStaminaUse > 1.0) {
      const R = G.rpg,
        live = R && !G.isStub("rpg");
      const regen = live && R.staminaRegen ? R.staminaRegen() : 12;
      P.stamina = Math.min(P.maxStamina, P.stamina + regen * dt);
    }

    // --- vertical ---
    const W = G.world;
    const water = W.waterLevel;
    const terrain = W.terrainHeight(P.pos.x, P.pos.z);
    P.inWater = P.pos.y < water - 0.2 && terrain < water;
    P.swimming = P.pos.y < water - 1.1 && terrain < water - 1.2;
    if (P.fly || P.noclip) {
      P.vel.y = 0;
      if (playing && I.action("jump")) P.pos.y += 8 * dt;
      if (playing && I.action("sneak")) P.pos.y -= 8 * dt;
    } else if (P.swimming) {
      P.vel.y = U.damp(P.vel.y, (water - 1.25 - P.pos.y) * 3, 4, dt);
      if (playing && I.action("jump")) P.vel.y = 1.5;
    } else {
      if (P.onGround && playing && I.actionPressed("jump") && !over) {
        P.vel.y = P.jumpSpeed;
        P.onGround = false;
        G.sfx.play("jump", { volume: 0.4 });
        P.sneaking = false;
      }
      P.vel.y -= P.gravity * dt;
    }

    // --- horizontal collision ---
    if (P.noclip) {
      P.pos.x += P.vel.x * dt;
      P.pos.z += P.vel.z * dt;
    } else {
      const r = W.moveCircle(
        P.pos,
        P.radius,
        P.height,
        P.vel.x * dt,
        P.vel.z * dt,
      );
      P.pos.x = r.x;
      P.pos.z = r.z;
    }
    P.pos.y += P.vel.y * dt;

    // ceiling
    if (!P.noclip && P.vel.y > 0) {
      const cs = W.query(
        P.pos.x - P.radius,
        P.pos.z - P.radius,
        P.pos.x + P.radius,
        P.pos.z + P.radius,
      );
      for (const c of cs) {
        if (
          c.minY > P.pos.y + 0.5 &&
          c.minY < P.pos.y + P.height &&
          W.pointInCollider(c, P.pos.x, P.pos.z, P.radius * 0.5)
        ) {
          P.vel.y = 0;
          P.pos.y = c.minY - P.height;
        }
      }
    }
    // ground snap
    if (!P.fly && !P.noclip && !P.swimming) {
      const gh = W.groundHeight(
        P.pos.x,
        P.pos.z,
        P.pos.y + 0.05,
        P.radius * 0.6,
      );
      if (
        P.pos.y <= gh + 0.001 ||
        (P.onGround && P.vel.y <= 0 && P.pos.y - gh < 0.45)
      ) {
        if (!P.onGround) land(P._peakFall);
        P.pos.y = gh;
        P.vel.y = Math.max(0, P.vel.y);
        P.onGround = true;
        P._airTime = 0;
        P._peakFall = 0;
      } else {
        P.onGround = false;
        P._airTime += dt;
        P._peakFall = Math.min(P._peakFall, P.vel.y);
      }
    } else if (P.swimming) {
      P.onGround = false;
    }

    // safety: fell out of the world
    if (P.pos.y < -60) {
      const gh = W.groundHeight(P.pos.x, P.pos.z, 500);
      P.pos.y = gh;
      P.vel.set(0, 0, 0);
    }

    // --- surface + footsteps ---
    const hv = Math.hypot(P.vel.x, P.vel.z);
    P.moveSpeed = hv;
    if (P.onGround && hv > 0.5) {
      P._stepDist += hv * dt;
      const stride = P.sprinting ? 2.4 : P.sneaking ? 1.3 : 1.9;
      if (P._stepDist > stride) {
        P._stepDist = 0;
        P.groundSurface = surfaceAt();
        G.events.emit("footstep", {
          surface: P.groundSurface,
          sneaking: P.sneaking,
          sprinting: P.sprinting,
          pos: P.pos,
        });
      }
    }

    // --- radiation exposure ---
    let radRate = W.radiationAt({ x: P.pos.x, y: P.pos.y + 1, z: P.pos.z });
    if (P.inWater) radRate += P.swimming ? 3 : 1.5; // irradiated water, iconic
    P.radRate = radRate;
    if (radRate > 0) P.addRads(radRate * dt);

    // --- vitals from RPG ---
    if (G.rpg && !G.isStub("rpg")) {
      if (G.rpg.maxHp) P.maxHp = G.rpg.maxHp();
      if (G.rpg.maxStamina) P.maxStamina = G.rpg.maxStamina();
    }
    P.hp = Math.min(P.hp, P.maxHp);

    applyCamera(realDt, hv);
  };

  function surfaceAt() {
    const W = G.world;
    const cs = W.query(
      P.pos.x - 0.3,
      P.pos.z - 0.3,
      P.pos.x + 0.3,
      P.pos.z + 0.3,
    );
    for (const c of cs)
      if (
        Math.abs(c.maxY - P.pos.y) < 0.1 &&
        W.pointInCollider(c, P.pos.x, P.pos.z, 0.2)
      )
        return c.surface;
    if (P.inWater) return "water";
    if (G.LAYOUT.inPark(P.pos.x, P.pos.z) && !G.LAYOUT.isRoad(P.pos.x, P.pos.z))
      return "grass";
    if (G.LAYOUT.isInterior(P.pos.x)) return "metal";
    return G.world.surfaceAt ? G.world.surfaceAt(P.pos.x, P.pos.z) : "concrete";
  }

  function land(vy) {
    G.events.emit("land", vy);
    G.sfx.play("land", { volume: U.clamp(-vy / 12, 0.2, 1) });
    if (vy < -13) {
      const dmg = Math.pow(-vy - 12, 1.6) * 2.2;
      P.damage(dmg, { type: "fall" });
      P.shake(0.5, 0.3);
    } else if (vy < -6) P.shake(0.12, 0.15);
  }

  function applyCamera(realDt, hv) {
    const cam = G.camera;
    if (!cam) return;
    hv = hv || 0;
    const targetEye = P.alive
      ? P.sneaking
        ? P.sneakEyeHeight
        : P.eyeHeight
      : P.eyeHeightCur || P.eyeHeight;
    P._eyeCur = realDt
      ? U.damp(P._eyeCur || targetEye, targetEye, 10, realDt)
      : targetEye;
    // head bob
    if (P.onGround && hv > 0.5 && G.worldRunning()) P._bob += realDt * hv * 1.9;
    const bobAmt = P.onGround ? Math.min(hv / 7, 1) : 0;
    const bobY = Math.abs(Math.sin(P._bob)) * 0.045 * bobAmt,
      bobX = Math.cos(P._bob) * 0.025 * bobAmt;
    // shake
    let sx = 0,
      sy = 0;
    if (P._shakeT > 0 && realDt) {
      P._shakeT -= realDt;
      sx = (Math.random() - 0.5) * P._shake * 0.08;
      sy = (Math.random() - 0.5) * P._shake * 0.08;
      if (P._shakeT <= 0) P._shake = 0;
    }
    const tp = thirdPersonActive();
    if (tp !== P.thirdPersonActive) {
      P.thirdPersonActive = tp;
      P._tpCur = 0.6;
      G.events.emit("cameraMode", tp ? "third" : "first");
    }
    if (tp) {
      applyThirdPerson(cam, realDt, sx, sy);
      return;
    }
    cam.position.set(
      P.pos.x + Math.cos(P.yaw) * bobX,
      P.pos.y + P._eyeCur + bobY,
      P.pos.z - Math.sin(P.yaw) * bobX,
    );
    if (!P.camOverride) cam.rotation.set(P.pitch + sy, P.yaw + sx, 0, "YXZ");
    // FOV
    if (realDt) P.fovCurrent = U.damp(P.fovCurrent, P.fovTarget, 12, realDt);
    if (Math.abs(cam.fov - P.fovCurrent) > 0.01) {
      cam.fov = P.fovCurrent;
      cam.updateProjectionMatrix();
    }
    P.eye.copy(cam.position);
    P.forward.set(0, 0, -1).applyEuler(cam.rotation);
  }
  P.applyCamera = applyCamera;

  // ------------------------------------------------------------------
  // Third-person camera (F toggles, mouse wheel zooms; FO3/NV/4 style)
  // P.thirdPerson = the player's preference. P.thirdPersonActive = the camera really is behind the player
  // (forced back to first person in dialogue, the goggles menu, terminals, the keypad, death...).
  // The eye / firing origin stays at the head: P.eye is the head, P.forward points from the head at
  // whatever the crosshair (camera ray) is over. The body is drawn by src/core/thirdperson.js.
  // ------------------------------------------------------------------
  P.thirdPerson = false;
  P.thirdPersonActive = false;
  P.tpDist = 2.8; // wanted camera distance (2.2 … 3.5 m)
  P._tpCur = 0.6; // smoothed, collision-limited distance
  const TP_MIN = 2.2,
    TP_MAX = 3.5,
    TP_FIRST_ONLY = {
      dialogue: 1,
      goggles: 1,
      terminal: 1,
      keypad: 1,
      dead: 1,
      title: 1,
      chargen: 1,
      loading: 1,
    };
  function thirdPersonActive() {
    return !!(
      P.thirdPerson &&
      P.alive &&
      !P.camOverride &&
      !TP_FIRST_ONLY[G.state]
    );
  }
  P.setThirdPerson = function (on) {
    P.thirdPerson = !!on;
    if (P.thirdPerson) P.tpDist = U.clamp(P.tpDist || 2.8, TP_MIN, TP_MAX);
    return P.thirdPerson;
  };
  P.toggleThirdPerson = function () {
    return P.setThirdPerson(!P.thirdPerson);
  };
  const _tpPivot = new THREE.Vector3(),
    _tpBack = new THREE.Vector3(),
    _tpRight = new THREE.Vector3(),
    _tpFwd = new THREE.Vector3(),
    _tpAim = new THREE.Vector3();
  function applyThirdPerson(cam, realDt, sx, sy) {
    const W = G.world;
    const eyeY = P.pos.y + P._eyeCur;
    // look direction (same as first person)
    cam.rotation.set(P.pitch + sy, P.yaw + sx, 0, "YXZ");
    _tpFwd.set(0, 0, -1).applyEuler(cam.rotation);
    _tpRight.set(Math.cos(P.yaw), 0, -Math.sin(P.yaw));
    // pivot above the right shoulder
    _tpPivot.set(P.pos.x, eyeY + 0.12, P.pos.z).addScaledVector(_tpRight, 0.5);
    // keep the shoulder pivot itself out of walls
    const side = W.raycast(
      _tpBack.set(P.pos.x, eyeY + 0.12, P.pos.z),
      _tpRight,
      0.6,
      { ignoreTags: ["actor", "interactable_self"] },
    );
    if (side && side.dist < 0.6)
      _tpPivot
        .set(P.pos.x, eyeY + 0.12, P.pos.z)
        .addScaledVector(_tpRight, Math.max(0, side.dist - 0.2));
    // pull the camera in when something is behind it
    _tpBack.copy(_tpFwd).negate();
    let want = P.tpDist;
    const hit = W.raycast(_tpPivot, _tpBack, want + 0.3, {
      ignoreTags: ["actor", "interactable_self"],
    });
    if (hit && hit.dist < want + 0.3) want = Math.max(0.35, hit.dist - 0.3);
    // zoom in fast (never inside a wall), out slowly
    P._tpCur =
      want < P._tpCur || !realDt ? want : U.damp(P._tpCur, want, 6, realDt);
    cam.position.copy(_tpPivot).addScaledVector(_tpBack, P._tpCur);
    const gy = W.terrainHeight(cam.position.x, cam.position.z) + 0.25;
    if (cam.position.y < gy) cam.position.y = gy;
    if (realDt) P.fovCurrent = U.damp(P.fovCurrent, P.fovTarget, 12, realDt);
    if (Math.abs(cam.fov - P.fovCurrent) > 0.01) {
      cam.fov = P.fovCurrent;
      cam.updateProjectionMatrix();
    }
    // firing origin = head; aim at what the crosshair covers
    P.eye.set(P.pos.x, eyeY, P.pos.z);
    const aim = W.raycast(cam.position, _tpFwd, 300);
    if (aim && aim.dist > P._tpCur + 0.6) _tpAim.copy(aim.point);
    else _tpAim.copy(cam.position).addScaledVector(_tpFwd, 300);
    P.forward.subVectors(_tpAim, P.eye);
    if (P.forward.lengthSq() < 1e-6) P.forward.copy(_tpFwd);
    else P.forward.normalize();
  }
  /** Called by engine each frame in play: F toggles, the wheel zooms (zooming all the way in = first person). */
  P.updateCameraInput = function () {
    const I = G.input;
    if (G.state !== "play" || !P.alive) return;
    if (I.actionPressed("camera")) {
      I.consumeAction("camera");
      P.toggleThirdPerson();
    }
    if (P.thirdPerson && I.mouse.wheel) {
      const d = P.tpDist + I.mouse.wheel * 0.35;
      if (d < TP_MIN - 0.2) P.setThirdPerson(false);
      else P.tpDist = U.clamp(d, TP_MIN, TP_MAX);
    }
  };

  // Reset on new game / load
  function cancelDeathTimer() {
    if (P._deathTimer) {
      clearTimeout(P._deathTimer);
      P._deathTimer = 0;
    }
  }
  G.events.on("loaded", cancelDeathTimer);
  G.events.on("reset", () => {
    cancelDeathTimer();
    // (godMode / noclip are cheats: they deliberately persist across new game / load)
    P.hp = P.maxHp = 100;
    P.stamina = P.maxStamina = 80;
    P.rads = 0;
    P.alive = true;
    P.sneaking = false;
    P.fly = P.noclip;
    P.vel.set(0, 0, 0);
    P.pitch = 0;
    P.eyeHeightCur = P.eyeHeight;
    P.camOverride = false;
    P.frozen = false;
  });
  // The hero is fixed: his name always comes from G.HERO (newGame opts.name is ignored).
  G.events.on("newGame", () => {
    P.name = G.HERO.name;
    P.appearance = Object.assign({}, G.HERO.appearance);
  });
  G.save.register("player", {
    save: () => ({
      pos: [P.pos.x, P.pos.y, P.pos.z],
      yaw: P.yaw,
      hp: P.hp,
      stamina: P.stamina,
      rads: P.rads,
      sneaking: P.sneaking,
    }),
    load: (d) => {
      P.name = G.HERO.name;
      P.hp = Math.max(1, d.hp || 0);
      P.stamina = d.stamina !== undefined ? d.stamina : P.maxStamina;
      P.rads = d.rads;
      P.alive = true;
      P.teleport(d.pos[0], d.pos[1], d.pos[2], d.yaw);
    },
  });

  // Debug console helpers (open devtools: G.cheat.god(), G.cheat.tp('empire_state'))
  G.cheat = {
    god() {
      P.godMode = !P.godMode;
      return P.godMode;
    },
    fly() {
      P.fly = !P.fly;
      return P.fly;
    },
    noclip() {
      P.noclip = !P.noclip;
      P.fly = P.noclip;
      return P.noclip;
    },
    tp(id) {
      const l = G.LAYOUT.getLocation(id) || G.LAYOUT.getSite(id);
      if (!l) return "unknown";
      const x = l.x !== undefined ? l.x : (l.x0 + l.x1) / 2,
        z = l.z !== undefined ? l.z : l.z1 + 12;
      P.teleport(x, 0, z + (l.r || 20), 0);
      return [x, z];
    },
    pos() {
      return [
        P.pos.x.toFixed(1),
        P.pos.y.toFixed(1),
        P.pos.z.toFixed(1),
        P.yaw.toFixed(2),
      ];
    },
  };
})();
