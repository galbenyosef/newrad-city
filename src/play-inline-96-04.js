// play-inline-96 04 — state
// Lines 1032-1207 of readable/play-inline-96.pretty.js (statement-aligned).
  M.openBlastDoor = function (instant, o) {
    const d = blast,
      silent = !!(o && o.silent);
    if (instant) {
      d.sndT = -1;
      d.remCol();
      d.state = "open";
      d.t = 1;
      applyBlastPose(1);
      return;
    }
    if (d.state === "open" || d.state === "opening") return;
    d.state = "opening";
    if (!silent) {
      try {
        G.sfx.play("alarm", { pos: blastSndPos(), volume: 0.5 });
      } catch (e) {
        /* */
      }
      d.sndT = 0.5;
    }
    try {
      if (G.player && G.player.shake) G.player.shake(0.12, 0.8);
    } catch (e) {
      /* */
    }
    G.emit("blastDoor", "opening");
  };
  M.closeBlastDoor = function (instant) {
    const d = blast;
    if (instant) {
      d.sndT = -1;
      d.state = "closed";
      d.t = 0;
      applyBlastPose(0);
      d.addCol();
      return;
    }
    if (d.state === "closed" || d.state === "closing") return;
    d.state = "closing";
    d.sndT = -1;
    d.addCol();
    try {
      G.sfx.play("door_open", { pos: blastSndPos(), volume: 0.9, pitch: 0.6 });
    } catch (e) {
      /* */
    }
    G.emit("blastDoor", "closing");
  };
  M.updateBlastDoor = function (dt) {
    const d = blast;
    if (!(dt > 0)) return;
    if (d.sndT > 0) {
      d.sndT -= dt;
      if (d.sndT <= 0) {
        d.sndT = -1;
        try {
          G.sfx.play("door_open", {
            pos: blastSndPos(),
            volume: 1,
            pitch: 0.55,
          });
        } catch (e) {
          /* */
        }
      }
    }
    if (d.state === "opening") {
      d.t = Math.min(1, d.t + dt / 3.2);
      applyBlastPose(d.t);
      if (d.t > 0.6) d.remCol();
      if (d.t >= 1) {
        d.state = "open";
        G.emit("blastDoor", "open");
      }
    } else if (d.state === "closing") {
      d.t = Math.max(0, d.t - dt / 3.2);
      applyBlastPose(d.t);
      if (d.t <= 0) {
        d.state = "closed";
        d.addCol();
        G.emit("blastDoor", "closed");
      }
    }
  };
  /** Keypad use: quest hold → message; else the G.locks keypad (code 0220) → open. */
  function useKeypad() {
    const d = blast;
    if (d.state === "open" || d.state === "opening") {
      G.notify("The blast door is open.");
      return;
    }
    if (d.state !== "closed") return;
    if (d.locked) {
      try {
        G.sfx.play("ui_error");
      } catch (e) {
        /* */
      }
      G.notify(
        d.message || "The keypad is dark. No power to the door circuit.",
      );
      return;
    }
    const K = G.locks;
    if (K && !G.isStub("locks") && K.open) {
      if (K.isOpen && K.isOpen(LOCK_ID)) {
        M.openBlastDoor(false);
        return;
      }
      K.open(LOCK_ID, () => M.openBlastDoor(false), {
        label: "Cryo Unit C-9 — Blast Door",
      });
      return;
    }
    M.openBlastDoor(false); // no lock registry loaded: the door simply opens
  }
  M.useBlastKeypad = useKeypad;
  /** Register the keypad lock (the registry lives in ui_interact, order 70 → after map init). */
  function registerLock() {
    const K = G.locks;
    if (!K || G.isStub("locks") || !K.register) return;
    try {
      K.register({
        id: LOCK_ID,
        label: "Cryo Unit C-9 Blast Door",
        code: "0220",
        hint: "Director Calloway's office: her last log entry and the note on her desk.",
      });
    } catch (e) {
      G.reportError("map:cryoLock", e);
    }
  }
  G.on("initDone", registerLock);
  /**
   * The story route out: the landing's EXIT door climbs into the Municipal Building's service corridor
   * (poi_civic: anchor 'cryo_arrive', the C-9 blast door there at 'cryo_access'), and that door leads back
   * down to our landing. Without poi_civic the EXIT door keeps going straight out to LAYOUT.cryoExit.
   */
  function linkMunicipal() {
    try {
      const P = G.pois;
      if (!P || G.isStub("pois") || typeof P.setCryoAccessTarget !== "function")
        return;
      const A2 = M.anchors.cryo_c9;
      if (!A2 || !M.cryoExitDoor) return;
      const get = (n) =>
        (P.getAnchor &&
          (P.getAnchor("municipal_building", n) ||
            P.getAnchor("municipal", n))) ||
        null;
      const arrive = get("cryo_arrive") || new THREE.Vector3(9422, 0, -6.1);
      P.setCryoAccessTarget({
        x: A2.stair_top.x,
        y: A2.stair_top.y,
        z: A2.stair_top.z,
        yaw: Math.PI,
      });
      const d = M.cryoExitDoor.def;
      d.target = { x: arrive.x, y: arrive.y || 0, z: arrive.z, yaw: Math.PI };
      d.label = "Municipal Building";
      d.verb = "Climb up to";
      if (M.cryoExitDoor.label !== undefined) M.cryoExitDoor.label = d.label;
      if (M.cryoExitDoor.verb !== undefined) M.cryoExitDoor.verb = d.verb;
      M.cryoViaMunicipal = true;
    } catch (e) {
      G.reportError("map:cryoLink", e);
    }
  }
  G.on("initDone", linkMunicipal);

  // -------------------------------------------------------------------
  // Interior build
  // -------------------------------------------------------------------
  const BAY_H = 5.5;
  const POD_Z = [4, 8, 12, 16, 23, 27];
