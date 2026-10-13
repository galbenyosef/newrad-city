// play-inline-96 06 — world
// Lines 1867-1934 of readable/play-inline-96.pretty.js (statement-aligned).
  M.buildCryo = function () {
    const L = G.LAYOUT;
    const I = L.INTERIORS && L.INTERIORS.cryo_c9;
    if (I) O = I.origin;
    M.pushXF(M.mtx(O.x, O.y || 0, O.z, 0));
    buildInterior();
    M.popXF();
    buildBlastDoor();
    if (M.buildCryoStreetDoor) M.buildCryoStreetDoor(); // 50_cryo.js (world coords)
    // --- anchors to world ---
    const W = {};
    for (const k in A) {
      const a = A[k];
      if (k.startsWith("ext_")) W[k] = new THREE.Vector3(a[0], a[1], a[2]);
      else W[k] = new THREE.Vector3(O.x + a[0], (O.y || 0) + a[1], O.z + a[2]);
    }
    const EX = L.cryoExit;
    W.exterior = new THREE.Vector3(EX.x, 0, EX.z);
    M.anchors.cryo_c9 = W;
    // --- player start: in pod 7's doorway, facing west across the bay ---
    L.playerStart = {
      x: W.player_start.x,
      y: O.y || 0,
      z: W.player_start.z,
      yaw: Math.PI / 2,
    };
    // --- doors: landing exit ⇄ Chambers Street arch ---
    M.cryoExitDoor = G.world.addDoor({
      pos: W.exit_door.clone(),
      label: "Chambers Street",
      verb: "Climb out to",
      radius: 1.4,
      target: { x: EX.x, y: 0, z: EX.z, yaw: EX.yaw },
      sound: "door_open",
    });
    const SD = M.cryoStreetDoor;
    M.cryoStreetEntry = G.world.addDoor({
      pos: new THREE.Vector3(SD.x + 0.15, 1.2, SD.z),
      label: "Cryo Unit C-9 (service stair)",
      verb: "Enter",
      radius: 1.3,
      target: {
        x: W.stair_top.x,
        y: W.stair_top.y,
        z: W.stair_top.z,
        yaw: Math.PI,
      },
      sound: "door_open",
    });
    // --- keypads (both sides of the blast door) ---
    const keypadLabel = () =>
      blast.state === "open" || blast.state === "opening"
        ? "Blast Door (Open)"
        : blast.locked
          ? "Blast Door Keypad (No Power)"
          : "Blast Door Keypad";
    for (const k of ["door_keypad", "door_keypad_stair"]) {
      const p = W[k];
      G.world.addInteractable({
        pos: p.clone(),
        radius: 0.8,
        priority: 2,
        label: keypadLabel,
        verb: "Use",
        onInteract: useKeypad,
      });
    }
  };
