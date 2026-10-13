// play-inline-4 01 — rpg
// Lines 14-212 of readable/play-inline-4.pretty.js (statement-aligned).
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
