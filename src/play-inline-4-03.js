// play-inline-4 03 — pos
// Lines 554-727 of readable/play-inline-4.pretty.js (statement-aligned).
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
