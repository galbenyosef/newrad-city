// play-inline-312 02 — door
// Lines 28-246 of readable/play-inline-312.pretty.js (statement-aligned).
  const U = G.util;

  const PH = (G._ph = G._ph || {});

  // ---- Locks: every locked door, container, safe and terminal is declared to G.locks and opened through it
  // (a key item, a keypad code or a terminal passcode, always placed somewhere in this module's content).
  PH.locksLive = () =>
    !!(G.locks && !G.isStub("locks") && typeof G.locks.open === "function");
  /** Declare a lock spec {id, label, key?|code?|passcode?, hint?} for the audit (queued until the locks module is up); returns the spec. */
  PH._lockQueue = PH._lockQueue || [];
  PH.lockReg = function (spec) {
    if (!PH.locksLive() || !G.locks.register) {
      PH._lockQueue.push(spec);
      if (!PH._lockQueueHooked) {
        PH._lockQueueHooked = true;
        G.events.on("initDone", () => {
          const q = PH._lockQueue.splice(0);
          for (const s of q) PH.lockReg(s);
        });
      }
      return spec;
    }
    try {
      G.locks.register(spec);
    } catch (e) {
      G.reportError("poi_herald:lockReg:" + spec.id, e);
    }
    return spec;
  };
  /** Open through G.locks: onOpen runs once it is open (key held, code typed, or already open). */
  PH.lockOpen = function (spec, onOpen) {
    if (!PH.locksLive()) {
      onOpen();
      return;
    } // the locks module is not loaded in this build
    if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
      onOpen();
      return;
    }
    G.locks.open(spec, onOpen);
  };
  PH.lockIsOpen = (id) =>
    !PH.locksLive() || !G.locks.isOpen || !!G.locks.isOpen(id);
  /** The player has read / heard the code or passcode of lock id (logged in Goggles → NOTES → CODES). */
  PH.lockLearn = function (id) {
    try {
      if (PH.locksLive() && G.locks.learn) G.locks.learn(id);
    } catch (e) {
      G.reportError("poi_herald:lockLearn:" + id, e);
    }
  };
  /** Learn lock(s) when the player picks up or reads the note / tape reel item that carries the code. */
  PH.learnFromItem = function (itemId, lockId) {
    const m = (PH._learnMap = PH._learnMap || {});
    (m[itemId] = m[itemId] || []).push(lockId);
    if (PH._learnHooked) return;
    PH._learnHooked = true;
    const fire = (id) => {
      const l = m[id];
      if (l) l.forEach(PH.lockLearn);
    };
    G.events.on("itemAdded", fire);
    G.events.on("noteRead", fire);
  };
  /** Attach the lock spec to a spawned container handle (props / containers) when the owner did not copy it. */
  PH.lockContainer = function (handle, spec) {
    if (!spec) return;
    PH.lockReg(spec);
    const c =
      handle &&
      (handle.container || (handle.items !== undefined ? handle : null));
    if (c && !c.lock) c.lock = spec;
  };
  /**
   * One-way door, barred from the far side: shows "Barred", opens for good once the player comes through
   * from the other side (door.unbar()). It is not a lock (there is no key or code); the unbarred state is
   * saved per door id under 'poi_herald:bars' and reset on a new game.
   */
  PH.bars = PH.bars || {};
  PH.barDoor = function (door, o) {
    if (!door) return door;
    o = o || {};
    const id = String(
      o.id || (door.def && door.def.id) || "bar" + Object.keys(PH.bars).length,
    );
    const inner = door.onInteract;
    door._barred = !PH.bars[id];
    door.locked = () =>
      door._barred ? o.lockText || "Barred from the other side" : null;
    door.onInteract = function () {
      if (door._barred) {
        if (G.sfx && G.sfx.play) G.sfx.play("door_locked");
        G.notify(o.message || "This door is barred from the other side.");
        return;
      }
      return inner.apply(door, arguments);
    };
    door.unbar = function (silent) {
      if (!door._barred) return false;
      door._barred = false;
      PH.bars[id] = true;
      if (o.unbarMessage && !silent) G.notify(o.unbarMessage);
      return true;
    };
    door.rebar = function () {
      door._barred = true;
      delete PH.bars[id];
    };
    (PH._barDoors = PH._barDoors || []).push({ id, door });
    if (!PH._barHooked) {
      PH._barHooked = true;
      const rebarAll = () => {
        for (const b of PH._barDoors) b.door.rebar();
      };
      G.events.on("newGame", rebarAll);
      G.events.on("reset", rebarAll);
      if (G.save && G.save.register)
        G.save.register("poi_herald:bars", {
          save: () => Object.keys(PH.bars),
          load: (d) => {
            for (const b of PH._barDoors)
              if ((d || []).indexOf(b.id) >= 0) b.door.unbar(true);
          },
        });
    }
    return door;
  };
  PH.defs = PH.defs || [];
  /** POI definition: {id, order, build(K), data(K) (initDone), spawn(K) (newGame/loaded), update(dt, K)} */
  PH.define = (def) => {
    PH.defs.push(def);
  };
  const K = (PH.kit = {});
  K.PI = Math.PI;
  K.HP = Math.PI / 2;
  K.V = (x, y, z) => new THREE.Vector3(x, y, z);
  K.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  K.clamp = U.clamp;
  K.lerp = U.lerp;

  // ------------------------------------------------------------------
  // Canvas helpers
  // ------------------------------------------------------------------
  K.canvas = function (w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  K.texFromCanvas = function (c, o) {
    o = o || {};
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = o.clamp
      ? THREE.ClampToEdgeWrapping
      : THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    let an = 4;
    try {
      an = Math.min(8, G.renderer.capabilities.getMaxAnisotropy());
    } catch (e) {
      /* */
    }
    t.anisotropy = an;
    if (o.nomip) {
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
    }
    t.needsUpdate = true;
    return t;
  };
  function rgba(r, g, b, a) {
    return "rgba(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + "," + a + ")";
  }
  K.rgba = rgba;
  /** Speckle / grain on a canvas region. */
  K.grain = function (x, X, Y, W, H, amt, seed) {
    const r = K.rng(seed || 7);
    const n = Math.floor((W * H) / 60);
    for (let i = 0; i < n; i++) {
      const v = r() < 0.5 ? 0 : 255;
      x.fillStyle = rgba(v, v, v, ((r() * amt) / 255).toFixed(3));
      x.fillRect(X + r() * W, Y + r() * H, 1 + r() * 2, 1 + r() * 2);
    }
  };
  K.stains = function (x, X, Y, W, H, n, seed, a, col) {
    const r = K.rng(seed || 3);
    col = col || [40, 32, 22];
    for (let i = 0; i < n; i++) {
      const px = X + r() * W,
        py = Y + r() * H,
        rad = (0.05 + r() * 0.3) * Math.min(W, H);
      const g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(
        0,
        rgba(col[0], col[1], col[2], ((a || 0.3) * r()).toFixed(3)),
      );
      g.addColorStop(1, rgba(col[0], col[1], col[2], 0));
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
  };
  K.streaks = function (x, X, Y, W, H, n, seed, a) {
    const r = K.rng(seed || 5);
    for (let i = 0; i < n; i++) {
      const px = X + r() * W,
        py = Y + r() * H * 0.5,
        len = H * (0.15 + r() * 0.6);
      const g = x.createLinearGradient(0, py, 0, py + len);
      g.addColorStop(0, rgba(25, 20, 15, a || 0.2));
      g.addColorStop(1, rgba(25, 20, 15, 0));
      x.fillStyle = g;
      x.fillRect(px, py, 1 + r() * 4, len);
    }
  };

  // ------------------------------------------------------------------
  // Custom surface textures (this module's own)
  // ------------------------------------------------------------------
  const CUSTOM = {};
