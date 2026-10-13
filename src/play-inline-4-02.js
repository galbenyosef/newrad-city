// play-inline-4 02 — pos
// Lines 213-553 of readable/play-inline-4.pretty.js (statement-aligned).
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
