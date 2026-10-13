// play-inline-369 02 — the
// Lines 25-314 of readable/play-inline-369.pretty.js (statement-aligned).
  const U = G.util;

  const P = (G._m3 = G._m3 || {});

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
      G.reportError("poi_midtown3:lockReg:" + spec.id, e);
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
      G.reportError("poi_midtown3:lockLearn:" + id, e);
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
  // Exterior/interior file split: an exterior file (NN_site.js) builds the street site and calls
  // P.finishSite(id, EX); the matching NN_site_interior.js registers P.interiorBuilders[id](EX), which builds
  // the interior cell, the street<->interior doors and the G.pois entry.
  P.interiorBuilders = {};
  // -------------------------------------------------------------------
  // Dynamic interior light (the shared PointLight pool). Static geometry keeps its baked vertex light;
  // every real light source of an interior cell (lamps, chandeliers, sconces, candles, fires, boiler
  // glow, fill lamps) is registered as a fixture with atmosphere's pool (G.atmos.addFixtureLight →
  // the flash PointLight pool, CONTRACT ≤ 6 dynamic lights): the 2 nearest/brightest get a real
  // PointLight while the player is in the cell, so NPCs, creatures, the viewmodel and loose props are
  // lit by the room's lamps (and flicker by its fires). No PointLight is ever created here.
  // -------------------------------------------------------------------
  P.fixtureStats = { sites: 0, lights: 0 };
  P.registerFixtureLights = function (S, lights) {
    const A = G.atmos;
    if (
      !A ||
      typeof A.addFixtureLight !== "function" ||
      !lights ||
      !lights.length
    )
      return 0;
    const kept = [];
    // strongest first; lights within 1.8 m of a stronger one merge into it (candle clusters, chandelier arms)
    const list = lights
      .filter((l) => l.i >= 0.25 && l.r >= 3)
      .sort((a, b) => b.i * b.r - a.i * a.r);
    for (const l of list) {
      if (kept.length >= 160) break;
      if (kept.some((k) => k.p.distanceToSquared(l.p) < 1.8 * 1.8)) continue;
      kept.push(l);
    }
    const hsl = {};
    for (const l of kept) {
      l.c.getHSL(hsl);
      // fire / candle / furnace colours (warm, saturated) flicker; green radiation glow and cold fluorescents stay steady
      const warm = hsl.h < 0.12 && hsl.s > 0.6 && l.c.b < 0.55;
      const big = l.r >= 16; // skylights, big fills: broad and soft
      A.addFixtureLight(l.p.clone(), l.c.clone(), {
        intensity: P.clamp(0.35 + l.i * 0.55, 0.4, 1.05) * (big ? 0.7 : 1),
        range: P.clamp(l.r * (big ? 0.6 : 0.85), 4, 12),
        flicker: warm ? 0.22 : 0,
        glow: false, // the site already draws its own glow sprites
      });
    }
    P.fixtureStats.sites++;
    P.fixtureStats.lights += kept.length;
    return kept.length;
  };
  /**
   * One-way door, barred from the far side: shows "Barred", opens for good once the player comes through
   * from the other side (door.unbar()). It is not a lock (there is no key or code); the unbarred state is
   * saved per door id under 'poi_midtown3:bars' and reset on a new game.
   */
  P.bars = P.bars || {};
  P.barDoor = function (door, o) {
    if (!door) return door;
    o = o || {};
    const id = String(
      o.id || (door.def && door.def.id) || "bar" + Object.keys(P.bars).length,
    );
    const inner = door.onInteract;
    door._barred = !P.bars[id];
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
      P.bars[id] = true;
      if (o.unbarMessage && !silent) G.notify(o.unbarMessage);
      return true;
    };
    door.rebar = function () {
      door._barred = true;
      delete P.bars[id];
    };
    (P._barDoors = P._barDoors || []).push({ id, door });
    if (!P._barHooked) {
      P._barHooked = true;
      const rebarAll = () => {
        for (const b of P._barDoors) b.door.rebar();
      };
      G.events.on("newGame", rebarAll);
      G.events.on("reset", rebarAll);
      if (G.save && G.save.register)
        G.save.register("poi_midtown3:bars", {
          save: () => Object.keys(P.bars),
          load: (d) => {
            for (const b of P._barDoors)
              if ((d || []).indexOf(b.id) >= 0) b.door.unbar(true);
          },
        });
    }
    return door;
  };
  P.finishSite = function (id, EX) {
    const fn = P.interiorBuilders[id];
    if (fn) return fn(EX);
    const E = EX && EX.S ? EX.S : EX;
    return P.register(id, {
      root: E.root,
      anchors: Object.assign({}, E.anchors),
    });
  };
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
      G.reportError("poi_midtown3:" + where, e);
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
      G.reportError("poi_midtown3:tex " + key, e);
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
