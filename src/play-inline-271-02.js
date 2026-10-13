// play-inline-271 02 — locks
// Lines 25-202 of readable/play-inline-271.pretty.js (statement-aligned).
  const U = G.util;

  const P = (G._uw = G._uw || {});

  // ---- Locks: every locked door, container, safe and terminal is declared to G.locks and opened through it
  // (a key item, a keypad code or a terminal passcode, always placed somewhere in this module's content).
  P.locksLive = () =>
    !!(G.locks && !G.isStub("locks") && typeof G.locks.open === "function");
  /** Declare a lock spec {id, label, key?|code?|passcode?, hint?} for the audit (queued until the locks module is up); returns the spec. */
  P._lockQueue = P._lockQueue || [];
  P.lockReg = function (spec) {
    if (!P.locksLive() || !G.locks.register) {
      P._lockQueue.push(spec);
      if (!P._lockQueueHooked) {
        P._lockQueueHooked = true;
        G.events.on("initDone", () => {
          const q = P._lockQueue.splice(0);
          for (const s of q) P.lockReg(s);
        });
      }
      return spec;
    }
    try {
      G.locks.register(spec);
    } catch (e) {
      G.reportError("poi_uws:lockReg:" + spec.id, e);
    }
    return spec;
  };
  /** Open through G.locks: onOpen runs once it is open (key held, code typed, or already open). */
  P.lockOpen = function (spec, onOpen) {
    if (!P.locksLive()) {
      onOpen();
      return;
    } // the locks module is not loaded in this build
    if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
      onOpen();
      return;
    }
    G.locks.open(spec, onOpen);
  };
  P.lockIsOpen = (id) =>
    !P.locksLive() || !G.locks.isOpen || !!G.locks.isOpen(id);
  /** The player has read / heard the code or passcode of lock id (logged in Goggles → NOTES → CODES). */
  P.lockLearn = function (id) {
    try {
      if (P.locksLive() && G.locks.learn) G.locks.learn(id);
    } catch (e) {
      G.reportError("poi_uws:lockLearn:" + id, e);
    }
  };
  /** Learn lock(s) when the player picks up or reads the note / tape reel item that carries the code. */
  P.learnFromItem = function (itemId, lockId) {
    const m = (P._learnMap = P._learnMap || {});
    (m[itemId] = m[itemId] || []).push(lockId);
    if (P._learnHooked) return;
    P._learnHooked = true;
    const fire = (id) => {
      const l = m[id];
      if (l) l.forEach(P.lockLearn);
    };
    G.events.on("itemAdded", fire);
    G.events.on("noteRead", fire);
  };
  /** Attach the lock spec to a spawned container handle (props / containers) when the owner did not copy it. */
  P.lockContainer = function (handle, spec) {
    if (!spec) return;
    P.lockReg(spec);
    const c =
      handle &&
      (handle.container || (handle.items !== undefined ? handle : null));
    if (c && !c.lock) c.lock = spec;
  };
  P.builders = []; // {id, fn, order}
  P.onReady = []; // initDone (props / items / terminals live)
  P.onNewGame = []; // newGame (dynamic: NPCs, quest state)
  P.onReset = []; // reset (before newGame and before a save load)
  P.onLoaded = []; // loaded (after every module applied its save)
  P.animators = []; // {c:{x,z}, r2, fn(t, dt)}
  P.interiors = []; // {key, root, ox, oz}
  P.saveHooks = {}; // key → {save(), load(d)}
  P.sites = []; // every site built (queued props / pickups / containers spawn at initDone)
  P.addBuilder = (id, fn, order) =>
    P.builders.push({ id, fn, order: order || 50 });
  const TAU = Math.PI * 2,
    PI = Math.PI,
    HP = Math.PI / 2;
  P.TAU = TAU;
  P.PI = PI;
  P.HP = HP;
  P.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  P.v3 = (x, y, z) => new THREE.Vector3(x, y, z);
  P.clamp = U.clamp;
  P.lerp = U.lerp;
  P.safe = function (where, fn) {
    try {
      return fn();
    } catch (e) {
      G.reportError("poi_uws:" + where, e);
      return undefined;
    }
  };
  P.m4 = function (x, y, z, ry, rx, rz, sx, sy, sz) {
    const e = new THREE.Euler(rx || 0, ry || 0, rz || 0, "YXZ");
    const s = new THREE.Vector3(
      sx === undefined ? 1 : sx,
      sy === undefined ? (sx === undefined ? 1 : sx) : sy,
      sz === undefined ? (sx === undefined ? 1 : sx) : sz,
    );
    return new THREE.Matrix4().compose(
      new THREE.Vector3(x || 0, y || 0, z || 0),
      new THREE.Quaternion().setFromEuler(e),
      s,
    );
  };

  // ===================================================================
  // Canvas textures (own)
  // ===================================================================
  const texCache = {};
  P.canvasTex = function (key, w, h, draw, opts) {
    if (texCache[key]) return texCache[key];
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    try {
      draw(ctx, w, h);
    } catch (e) {
      G.reportError("poi_uws:tex " + key, e);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT =
      opts && opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return (texCache[key] = t);
  };
  function fitFont(ctx, lines, fs, maxW, fam, weight) {
    ctx.font = (weight || "bold") + " " + fs + "px " + fam;
    let mw = 0;
    for (const t of lines) mw = Math.max(mw, ctx.measureText(t).width);
    return mw > maxW ? Math.floor((fs * maxW) / mw) : fs;
  }
  function speckle(ctx, w, h, r, n, dark, light) {
    for (let i = 0; i < n; i++) {
      ctx.fillStyle =
        r() < 0.5
          ? "rgba(20,14,8," + r() * (dark || 0.3) + ")"
          : "rgba(255,250,235," + r() * (light || 0.15) + ")";
      const s = 0.6 + r() * 1.8;
      ctx.fillRect(r() * w, r() * h, s, s);
    }
  }
  function blotches(ctx, w, h, r, n, a) {
    for (let i = 0; i < n; i++) {
      const x = r() * w,
        y = r() * h,
        rr = 10 + r() * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, "rgba(40,30,18," + (0.05 + r() * (a || 0.15)) + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
  }
  P.speckle = speckle;
  P.blotches = blotches;
  const SERIF = '"Times New Roman", Georgia, serif',
    SANS = '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
    DECO = '"Oswald", "Futura", "Arial Narrow", sans-serif';
  P.FONTS = { SERIF, SANS, DECO };

  /**
   * Lettering texture. style: 'engraved' (carved in stone), 'gilt' (gold letters on dark), 'bronze' (bronze letters, transparent bg),
   * 'banner' (museum / theatre banner), 'label' (exhibit label card), 'poster', 'raider' (spray on scrap), 'marquee', 'brass' (plate)
   */
