// play-inline-589 02 — box
// Lines 29-271 of readable/play-inline-589.pretty.js (statement-aligned).
  const HP = K.HP,
    PI = K.PI;
  const LR = G.lair;

  const HATCH_LOCK = {
    id: "ms_track61_hatch",
    label: "Track 61 Hatch",
    key: "q_track61_key",
    hint: "Keeper Hollowell keeps the Track 61 key (Keeper of the Keys).",
    keyFrom: 'Keeper Hollowell (mq33 "Keeper of the Keys")',
  };
  K.HATCH_LOCK = HATCH_LOCK;
  K.dressRoots = K.dressRoots || [];
  K.doors = K.doors || {};

  const Q = () => K.Q();
  const outerOpen = () =>
    !!(
      K.flag("ms_track61_open") ||
      K.flag("ms_lair_open") ||
      (Q() && (Q().isStarted("mq35") || Q().isStarted("mq36")))
    );
  const m42Open = () =>
    !!(
      K.flag("ms_lair_open") ||
      (Q() && (Q().isComplete("mq35") || Q().isStarted("mq36")))
    );
  const locksLive = () => K.live("locks") && typeof G.locks.open === "function";
  K.outerOpen = outerOpen;
  K.m42Open = m42Open;

  /**
   * A load door with our own gate in front of the engine's teleport.
   * gate() → null (pass) or the message shown; lock (optional) is opened through G.locks first.
   */
  function gatedDoor(id, def, gate, lock, lockedLabel) {
    const door = G.world.addDoor(Object.assign({ id }, def));
    const go = door.onInteract;
    door.locked = () => {
      if (gate && gate()) return lockedLabel || "Sealed";
      if (
        lock &&
        locksLive() &&
        G.locks.isOpen &&
        !G.locks.isOpen(lock.id) &&
        !(lock.key && hasItem(lock.key))
      )
        return "Locked";
      return null;
    };
    door.onInteract = function () {
      const msg = gate && gate();
      if (msg) {
        K.sfx("door_locked");
        K.notify(msg, { duration: 5 });
        return;
      }
      if (lock && locksLive() && !G.locks.isOpen(lock.id)) {
        G.locks.open(lock, () => go.call(door));
        return;
      }
      go.call(door);
    };
    K.doors[id] = door;
    return door;
  }
  function hasItem(id) {
    return (
      K.live("inventory") &&
      !!K.safe("inv.has", () => G.inventory.count(id) > 0)
    );
  }

  // ------------------------------------------------------------------
  // Positions (world). Computed once the cells are known.
  // ------------------------------------------------------------------
  function waldorfSpot() {
    const I = G.LAYOUT.INTERIORS.waldorf;
    if (!I) return null;
    const ox = I.origin.x,
      oz = I.origin.z,
      YL = 1.5;
    // west wall of the service stair hall (x ox+5, z oz-24..oz-14)
    return {
      wallX: ox + 5.14,
      z: oz - 18.6,
      y: YL,
      arrival: { x: ox + 6.7, y: YL, z: oz - 18.6, yaw: -HP },
    };
  }
  function subwaySpot() {
    const I = G.LAYOUT.INTERIORS.subway;
    if (!I) return null;
    const S = I.origin;
    // north wall of the east tunnel (local z -8), x 80
    return {
      x: S.x + 80,
      wallZ: S.z - 7.9,
      y: 0,
      arrival: { x: S.x + 80, y: 0, z: S.z - 5.9, yaw: PI },
    };
  }
  function parkSpot() {
    const x = 207.7,
      z = -386;
    let y = 0.12;
    try {
      y = G.world.terrainHeight(x, z);
      if (!isFinite(y)) y = 0.12;
    } catch (e) {
      y = 0.12;
    }
    return { x, z, y, arrival: { x, y, z: z + 1.7, yaw: PI } };
  }

  // ------------------------------------------------------------------
  // Outside dressing (built with the lair kit, shown only near each place)
  // ------------------------------------------------------------------
  K.addBuild(30, function buildEntrances() {
    const W = waldorfSpot(),
      S = subwaySpot(),
      P = parkSpot();
    // --- Waldorf: the M-61 freight door (welded, then cut) ---
    if (W) {
      const root = new THREE.Group();
      root.name = "lair_dress_waldorf";
      G.scene.add(root);
      const b = K.builder("dress_waldorf", { ambient: 0.35, grime: 0.6 });
      const x = W.wallX,
        z = W.z,
        y = W.y;
      b.box("iron", x + 0.06, y, z, 0.12, 2.9, 2.5, { grime: 0.6 }); // frame
      b.box("rust", x + 0.13, y + 0.06, z - 0.6, 0.06, 2.6, 1.15, {
        grime: 0.6,
      });
      b.box("rust", x + 0.13, y + 0.06, z + 0.6, 0.06, 2.6, 1.15, {
        grime: 0.6,
      });
      for (let k = 0; k < 6; k++)
        b.box("steel", x + 0.17, y + 0.3 + k * 0.42, z, 0.04, 0.05, 0.12, {
          tint: 0x6a6460,
        }); // weld beads down the seam
      b.panel("decal", x + 0.18, y + 3.15, z, 1.9, 0.25, HP, {
        rect: K.decal("m61"),
      });
      b.panel("decal", x + 0.18, y + 1.5, z, 1.3, 1.3, HP, {
        rect: K.decal("sun_soot"),
      });
      b.light(x + 1.5, y + 2.4, z, 4.5, 0xff6040, 0.7);
      b.finish(root);
      K.dressRoots.push({
        root,
        test: (cam, indoor) =>
          indoor && Math.abs(cam.x - x) < 120 && Math.abs(cam.z - z) < 120,
      });
      K.anchor("waldorf_m61_outside", K.V(W.arrival.x, y, W.arrival.z), -HP);
    }
    // --- 42nd St tunnels: the T-61 bulkhead hatch ---
    if (S) {
      const root = new THREE.Group();
      root.name = "lair_dress_bulkhead";
      G.scene.add(root);
      const b = K.builder("dress_bulkhead", { ambient: 0.3, grime: 0.6 });
      const x = S.x,
        z = S.wallZ;
      b.box("concrete_soot", x, 0, z + 0.08, 3.4, 3.4, 0.16, { grime: 0.7 });
      b.box("rust", x, 0.1, z + 0.2, 2.2, 2.6, 0.12, { grime: 0.6 });
      b.box("iron", x, 0.05, z + 0.28, 2.5, 0.12, 0.1);
      b.box("iron", x, 2.7, z + 0.28, 2.5, 0.12, 0.1);
      for (const sx of [-1.2, 1.2])
        b.box("iron", x + sx, 0.05, z + 0.28, 0.12, 2.75, 0.1);
      for (const [dx, dy] of [
        [-0.95, 0.4],
        [-0.95, 2.1],
        [0.95, 0.4],
        [0.95, 2.1],
      ])
        b.box("steel", x + dx, dy, z + 0.32, 0.3, 0.1, 0.1, { tint: 0x8a8680 });
      b.geo("steel", K.T.torus, {
        x,
        y: 1.35,
        z: z + 0.36,
        s: 0.42,
        tint: 0x8a8680,
      });
      b.panel("decal", x, 3.15, z + 0.17, 2.6, 0.33, 0, {
        rect: K.decal("t61_hatch"),
      });
      b.panel("decal", x - 0.9, 1.6, z + 0.3, 0.8, 0.4, 0, {
        rect: K.decal("roses_chalk"),
      });
      b.light(x, 2.4, z + 1.6, 5, 0xc0a080, 0.6);
      b.finish(root);
      K.col(x - 1.7, 0, z, x + 1.7, 3.4, z + 0.3);
      K.dressRoots.push({
        root,
        test: (cam, indoor) =>
          indoor && Math.abs(cam.x - x) < 140 && Math.abs(cam.z - z) < 140,
      });
      K.anchor("bulkhead_outside", K.V(S.arrival.x, 0, S.arrival.z), PI);
      K.anchor("tunnel_bulkhead", K.V(S.arrival.x, 0, S.arrival.z), PI);
    }
    // --- Park Avenue: the handcar-spur hatch in the sidewalk ---
    if (P) {
      const root = new THREE.Group();
      root.name = "lair_dress_parkave";
      G.scene.add(root);
      const b = K.builder("dress_park", { ambient: 1.0, grime: 0.7 });
      const x = P.x,
        z = P.z,
        y = P.y;
      b.box("iron", x, y, z, 1.4, 0.06, 1.4, { grime: 0.7 });
      for (let k = -2; k <= 2; k++)
        b.box("rust", x + k * 0.24, y + 0.06, z, 0.08, 0.03, 1.2, {
          grime: 0.6,
        });
      b.box("rust", x - 0.66, y + 0.06, z + 0.3, 0.12, 0.12, 0.3, {
        grime: 0.5,
      }); // hinge
      b.floorDecal("roses_chalk", x + 0.95, y + 0.01, z - 0.4, 0.7, 0.35, HP);
      b.box("paint_black", x + 0.72, y, z - 0.66, 0.06, 1.1, 0.06, {
        grime: 0.5,
      }); // a post with a small enamel plate
      b.box("paint_cream", x + 0.72, y + 0.95, z - 0.62, 0.36, 0.22, 0.02, {
        grime: 0.5,
      });
      b.finish(root);
      K.col(x - 0.7, y, z - 0.7, x + 0.7, y + 0.08, z + 0.7, {
        surface: "metal",
      });
      K.dressRoots.push({
        root,
        test: (cam, indoor) =>
          !indoor && Math.abs(cam.x - x) < 160 && Math.abs(cam.z - z) < 160,
      });
      K.anchor("spur_outside", K.V(P.arrival.x, y, P.arrival.z), PI);
    }
  });

  // ------------------------------------------------------------------
  // Doors (world interactables; created at build time so they exist before any save loads)
  // ------------------------------------------------------------------
  const SEALED = "Welded shut from the far side. Fresh weld, still bright.";
