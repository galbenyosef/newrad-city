// play-inline-170 02 — door
// Lines 20-287 of readable/play-inline-170.pretty.js (statement-aligned).
  const U = G.util;

  const A = (G.PMID = G.PMID || {});
  const K = (A.kit = {});
  A.defs = A.defs || []; // site build definitions: {id, order, build(K)}
  A.animators = A.animators || []; // fn(dt, time, night)
  A.dynamic = A.dynamic || []; // fn() called on newGame/loaded (spawn dynamic stuff)
  A.records = A.records || {}; // id -> POI record
  A.ready = A.ready || []; // fn() called once on initDone (props/items/terminals exist by then)
  K.A = A;

  // ---- Locks: every locked door, container, safe and terminal is declared to G.locks and opened through it
  // (a key item, a keypad code or a terminal passcode, always placed somewhere in this module's content).
  K.locksLive = () =>
    !!(G.locks && !G.isStub("locks") && typeof G.locks.open === "function");
  /** Declare a lock spec {id, label, key?|code?|passcode?, hint?} for the audit (queued until the locks module is up); returns the spec. */
  K._lockQueue = K._lockQueue || [];
  K.lockReg = function (spec) {
    if (!K.locksLive() || !G.locks.register) {
      K._lockQueue.push(spec);
      if (!K._lockQueueHooked) {
        K._lockQueueHooked = true;
        G.events.on("initDone", () => {
          const q = K._lockQueue.splice(0);
          for (const s of q) K.lockReg(s);
        });
      }
      return spec;
    }
    try {
      G.locks.register(spec);
    } catch (e) {
      G.reportError("poi_midtown:lockReg:" + spec.id, e);
    }
    return spec;
  };
  /** Open through G.locks: onOpen runs once it is open (key held, code typed, or already open). */
  K.lockOpen = function (spec, onOpen) {
    if (!K.locksLive()) {
      onOpen();
      return;
    } // the locks module is not loaded in this build
    if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
      onOpen();
      return;
    }
    G.locks.open(spec, onOpen);
  };
  K.lockIsOpen = (id) =>
    !K.locksLive() || !G.locks.isOpen || !!G.locks.isOpen(id);
  /** The player has read / heard the code or passcode of lock id (logged in Goggles → NOTES → CODES). */
  K.lockLearn = function (id) {
    try {
      if (K.locksLive() && G.locks.learn) G.locks.learn(id);
    } catch (e) {
      G.reportError("poi_midtown:lockLearn:" + id, e);
    }
  };
  /** Learn lock(s) when the player picks up or reads the note / tape reel item that carries the code. */
  K.learnFromItem = function (itemId, lockId) {
    const m = (K._learnMap = K._learnMap || {});
    (m[itemId] = m[itemId] || []).push(lockId);
    if (K._learnHooked) return;
    K._learnHooked = true;
    const fire = (id) => {
      const l = m[id];
      if (l) l.forEach(K.lockLearn);
    };
    G.events.on("itemAdded", fire);
    G.events.on("noteRead", fire);
  };
  /** Attach the lock spec to a spawned container handle (props / containers) when the owner did not copy it. */
  K.lockContainer = function (handle, spec) {
    if (!spec) return;
    K.lockReg(spec);
    const c =
      handle &&
      (handle.container || (handle.items !== undefined ? handle : null));
    if (c && !c.lock) c.lock = spec;
  };
  /**
   * One-way door, barred from the far side: shows "Barred", opens for good once the player comes through
   * from the other side (door.unbar()). It is not a lock (there is no key or code); the unbarred state is
   * saved per door id under 'poi_midtown:bars' and reset on a new game.
   */
  K.bars = K.bars || {};
  K.barDoor = function (door, o) {
    if (!door) return door;
    o = o || {};
    const id = String(
      o.id || (door.def && door.def.id) || "bar" + Object.keys(K.bars).length,
    );
    const inner = door.onInteract;
    door._barred = !K.bars[id];
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
      K.bars[id] = true;
      if (o.unbarMessage && !silent) G.notify(o.unbarMessage);
      return true;
    };
    door.rebar = function () {
      door._barred = true;
      delete K.bars[id];
    };
    (K._barDoors = K._barDoors || []).push({ id, door });
    if (!K._barHooked) {
      K._barHooked = true;
      const rebarAll = () => {
        for (const b of K._barDoors) b.door.rebar();
      };
      G.events.on("newGame", rebarAll);
      G.events.on("reset", rebarAll);
      if (G.save && G.save.register)
        G.save.register("poi_midtown:bars", {
          save: () => Object.keys(K.bars),
          load: (d) => {
            for (const b of K._barDoors)
              if ((d || []).indexOf(b.id) >= 0) b.door.unbar(true);
          },
        });
    }
    return door;
  };

  /** Register a landmark build function. */
  K.defineSite = function (id, order, build) {
    A.defs.push({ id, order, build });
  };
  K.animate = function (fn) {
    A.animators.push(fn);
  };
  K.onNewGame = function (fn) {
    A.dynamic.push(fn);
  };
  K.onReady = function (fn) {
    A.ready.push(fn);
  };

  // ------------------------------------------------------------------
  // Small helpers
  // ------------------------------------------------------------------
  K.clamp = U.clamp;
  K.lerp = U.lerp;
  K.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  K.V = (x, y, z) => new THREE.Vector3(x, y, z);
  K.site = (id) => G.LAYOUT.getSite(id);
  /** 0 = full day, 1 = full night. Uses atmosphere if present, else G.time.hour. */
  K.night = function () {
    const h = G.time && typeof G.time.hour === "number" ? G.time.hour : 12;
    const eve = U.smoothstep(17.2, 20.2, h),
      morn = 1 - U.smoothstep(4.8, 7.2, h);
    return U.clamp(Math.max(eve, morn), 0, 1);
  };
  K.isInteriorPos = (x) => x >= G.LAYOUT.INTERIOR_X_MIN;

  // ------------------------------------------------------------------
  // Canvas / texture helpers
  // ------------------------------------------------------------------
  K.canvas = function (w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  let maxAniso = 4;
  K.texFromCanvas = function (c, opts) {
    opts = opts || {};
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = opts.clamp
      ? THREE.ClampToEdgeWrapping
      : THREE.RepeatWrapping;
    t.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    try {
      maxAniso = G.renderer
        ? Math.min(8, G.renderer.capabilities.getMaxAnisotropy())
        : 4;
    } catch (e) {
      /* ignore */
    }
    t.anisotropy = opts.aniso || maxAniso;
    t.needsUpdate = true;
    return t;
  };
  const hex = (c) => "#" + new THREE.Color(c).getHexString();
  K.hex = hex;
  function shadeHex(c, f) {
    const col = new THREE.Color(c);
    col.r = U.clamp(col.r * f, 0, 1);
    col.g = U.clamp(col.g * f, 0, 1);
    col.b = U.clamp(col.b * f, 0, 1);
    return "#" + col.getHexString();
  }
  K.shadeHex = shadeHex;

  /** Film-grain style noise: a cached random tile blended with 'overlay' (GPU-fast, no readback). */
  let noiseTile = null;
  function getNoiseTile() {
    if (noiseTile) return noiseTile;
    const S = 128;
    noiseTile = K.canvas(S, S);
    const x = noiseTile.getContext("2d");
    const img = x.createImageData(S, S);
    const d = img.data;
    const r = K.rng(1234);
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.floor(r() * 256);
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return noiseTile;
  }
  K.grain = function (ctx, w, h, amt, seed) {
    const tile = getNoiseTile();
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = Math.min(1, amt / 90);
    const ox = ((seed || 0) * 37) % 128,
      oy = ((seed || 0) * 53) % 128;
    for (let y = -oy; y < h; y += 128)
      for (let x = -ox; x < w; x += 128) ctx.drawImage(tile, x, y);
    ctx.restore();
  };
  /** Dark blotches / water stains. */
  K.stains = function (ctx, w, h, n, seed, alpha, color) {
    const r = K.rng(seed || 3);
    for (let i = 0; i < n; i++) {
      const x = r() * w,
        y = r() * h,
        rad = (0.05 + r() * 0.25) * Math.min(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(
        0,
        "rgba(" + (color || "30,26,20") + "," + (alpha || 0.25) * r() + ")",
      );
      g.addColorStop(1, "rgba(" + (color || "30,26,20") + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  };
  /** Vertical rain streaks. */
  K.streaks = function (ctx, w, h, n, seed, alpha) {
    const r = K.rng(seed || 5);
    for (let i = 0; i < n; i++) {
      const x = r() * w,
        y = r() * h * 0.6,
        len = h * (0.1 + r() * 0.5),
        wd = 1 + r() * 4;
      const g = ctx.createLinearGradient(0, y, 0, y + len);
      g.addColorStop(0, "rgba(20,18,14," + (alpha || 0.18) + ")");
      g.addColorStop(1, "rgba(20,18,14,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, wd, len);
    }
  };

  // Procedural fallback surface textures (used when the textures module is absent)
