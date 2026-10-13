// play-inline-237 02 — ctx
// Lines 24-338 of readable/play-inline-237.pretty.js (statement-aligned).
  const U = G.util;

  const PR = (G._pr = G._pr || {});

  // ---- Locks: every locked door, container, safe and terminal is declared to G.locks and opened through it
  // (a key item, a keypad code or a terminal passcode, always placed somewhere in this module's content).
  PR.locksLive = () =>
    !!(G.locks && !G.isStub("locks") && typeof G.locks.open === "function");
  /** Declare a lock spec {id, label, key?|code?|passcode?, hint?} for the audit (queued until the locks module is up); returns the spec. */
  PR._lockQueue = PR._lockQueue || [];
  PR.lockReg = function (spec) {
    if (!PR.locksLive() || !G.locks.register) {
      PR._lockQueue.push(spec);
      if (!PR._lockQueueHooked) {
        PR._lockQueueHooked = true;
        G.events.on("initDone", () => {
          const q = PR._lockQueue.splice(0);
          for (const s of q) PR.lockReg(s);
        });
      }
      return spec;
    }
    try {
      G.locks.register(spec);
    } catch (e) {
      G.reportError("poi_roosevelt:lockReg:" + spec.id, e);
    }
    return spec;
  };
  /** Open through G.locks: onOpen runs once it is open (key held, code typed, or already open). */
  PR.lockOpen = function (spec, onOpen) {
    if (!PR.locksLive()) {
      onOpen();
      return;
    } // the locks module is not loaded in this build
    if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
      onOpen();
      return;
    }
    G.locks.open(spec, onOpen);
  };
  PR.lockIsOpen = (id) =>
    !PR.locksLive() || !G.locks.isOpen || !!G.locks.isOpen(id);
  /** The player has read / heard the code or passcode of lock id (logged in Goggles → NOTES → CODES). */
  PR.lockLearn = function (id) {
    try {
      if (PR.locksLive() && G.locks.learn) G.locks.learn(id);
    } catch (e) {
      G.reportError("poi_roosevelt:lockLearn:" + id, e);
    }
  };
  /** Learn lock(s) when the player picks up or reads the note / tape reel item that carries the code. */
  PR.learnFromItem = function (itemId, lockId) {
    const m = (PR._learnMap = PR._learnMap || {});
    (m[itemId] = m[itemId] || []).push(lockId);
    if (PR._learnHooked) return;
    PR._learnHooked = true;
    const fire = (id) => {
      const l = m[id];
      if (l) l.forEach(PR.lockLearn);
    };
    G.events.on("itemAdded", fire);
    G.events.on("noteRead", fire);
  };
  /** Attach the lock spec to a spawned container handle (props / containers) when the owner did not copy it. */
  PR.lockContainer = function (handle, spec) {
    if (!spec) return;
    PR.lockReg(spec);
    const c =
      handle &&
      (handle.container || (handle.items !== undefined ? handle : null));
    if (c && !c.lock) c.lock = spec;
  };
  PR.builders = PR.builders || [];
  PR.entries = PR.entries || {};
  PR.animators = PR.animators || [];
  PR.onReady = PR.onReady || []; // fns run at initDone (props/fx available)
  PR.onNewGame = PR.onNewGame || []; // fns run at newGame
  PR.onReset = PR.onReset || []; // fns run at 'reset' (before newGame and before a save is loaded)
  PR.onLoaded = PR.onLoaded || []; // fns run at 'loaded' (after every module's save data was applied)
  /** Per-feature persistent state: key → {save(): json, load(json)} (all saved under G.save key 'poi_roosevelt'). */
  PR.saveHooks = PR.saveHooks || {};
  /** Register a landmark builder: fn(PR, site) → returns nothing; runs in init. */
  PR.addBuilder = function (id, fn, order) {
    PR.builders.push({ id, fn, order: order || 50 });
  };

  // -------------------------------------------------------------------
  // Small math helpers
  // -------------------------------------------------------------------
  const TAU = Math.PI * 2;
  PR.TAU = TAU;
  PR.v3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _s = new THREE.Vector3(),
    _p = new THREE.Vector3();
  /** Compose a Matrix4: translate(x,y,z) * rotY/rotX/rotZ (YXZ order) * scale. */
  PR.m4 = function (x, y, z, ry, rx, rz, sx, sy, sz) {
    _e.set(rx || 0, ry || 0, rz || 0, "YXZ");
    _q.setFromEuler(_e);
    _p.set(x || 0, y || 0, z || 0);
    _s.set(
      sx === undefined ? 1 : sx,
      sy === undefined ? (sx === undefined ? 1 : sx) : sy,
      sz === undefined ? (sx === undefined ? 1 : sx) : sz,
    );
    return new THREE.Matrix4().compose(_p, _q, _s);
  };
  PR.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  PR.terrain = (x, z) => {
    try {
      const h = G.world.terrainHeight(x, z);
      return isFinite(h) ? h : 0;
    } catch (e) {
      return 0;
    }
  };
  PR.smooth = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  // -------------------------------------------------------------------
  // Canvas texture helpers (custom textures owned by this module)
  // -------------------------------------------------------------------
  const texCache = {};
  function canvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  function finishTex(c, opts) {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT =
      opts && opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }
  /** Cached custom canvas texture. draw(ctx, w, h). */
  PR.canvasTex = function (key, w, h, draw, opts) {
    if (texCache[key]) return texCache[key];
    const c = canvas(w, h);
    const ctx = c.getContext("2d");
    try {
      draw(ctx, w, h);
    } catch (e) {
      G.reportError("init:poi_roosevelt", e);
    }
    return (texCache[key] = finishTex(c, opts));
  };
  /** Per-pixel noise fill helper (value noise via G.util). */
  function noiseFill(ctx, w, h, fn) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        const c = fn(x, y, d[o], d[o + 1], d[o + 2]);
        d[o] = c[0];
        d[o + 1] = c[1];
        d[o + 2] = c[2];
        d[o + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);
  }
  // tileable-ish fbm using wrapped coordinates
  function tfbm(x, y, s, w) {
    return U.fbm2((((x % w) + w) % w) / s, (((y % w) + w) % w) / s, 4);
  }

  /** Generic grainy fallback texture (used when G.tex is absent). */
  PR.noiseTex = function () {
    return PR.canvasTex("pr_noise", 256, 256, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n =
          0.72 +
          0.28 * U.fbm2(x / 18, y / 18, 4) +
          (U.hash2(x, y) - 0.5) * 0.12;
        const v = Math.max(0, Math.min(255, n * 235));
        return [v, v, v];
      });
    });
  };
  /** Weathered copper-green patina with vertical run-off streaks. */
  PR.verdigrisTex = function () {
    return PR.canvasTex("pr_verdigris", 512, 512, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = U.fbm2(x / 40, y / 40, 5);
        const streak = U.fbm2(x / 3.5, y / 90, 3); // tall, thin vertical streaks
        const blotch = U.fbm2(x / 90 + 10, y / 70 + 3, 3);
        let r = 104 + n * 44,
          g = 168 + n * 36,
          b = 146 + n * 30; // pale teal-green base
        const dark = Math.max(0, streak - 0.48) * 2.2; // dark run-off streaks
        r -= dark * 45;
        g -= dark * 55;
        b -= dark * 45;
        const chalk = Math.max(0, blotch - 0.62) * 2.5; // chalky pale patches
        r += chalk * 60;
        g += chalk * 50;
        b += chalk * 45;
        const bronze = Math.max(0, 0.3 - n) * 2.4; // bronze showing through
        r += bronze * 40;
        g -= bronze * 40;
        b -= bronze * 55;
        const grain = (U.hash2(x, y) - 0.5) * 18;
        return [r + grain, g + grain, b + grain];
      });
    });
  };
  /** Rust-stained dark iron for bridge steel & ironwork (fallback detail). */
  PR.grimeTex = function () {
    return PR.canvasTex("pr_grime", 256, 256, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tfbm(x, y, 22, 256),
          s = U.fbm2(x / 3, y / 50, 2);
        const v =
          150 +
          n * 90 -
          Math.max(0, s - 0.55) * 120 +
          (U.hash2(x, y) - 0.5) * 20;
        return [v, v * 0.97, v * 0.92];
      });
    });
  };

  /** The old-world US flag: 13 stripes and 13 stars in a ring, faded & torn. */
  PR.flagTex = function (variant) {
    return PR.canvasTex(
      "pr_flag_" + (variant || 0),
      512,
      288,
      (ctx, w, h) => {
        const sh = h / 13;
        for (let i = 0; i < 13; i++) {
          ctx.fillStyle = i % 2 ? "#e4dccb" : "#9a2a24";
          ctx.fillRect(0, i * sh, w, sh + 1);
        }
        const cw = w * 0.42,
          ch = sh * 7;
        ctx.fillStyle = "#26345a";
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = "#e8e0cc";
        const cx = cw / 2,
          cy = ch / 2,
          R = ch * 0.34;
        for (let i = 0; i < 13; i++) {
          const a = (i / 13) * TAU - Math.PI / 2;
          drawStar(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R, ch * 0.06);
        }
        // weathering: grime, fading, holes
        const r = U.rng(77 + (variant || 0) * 13);
        ctx.globalCompositeOperation = "multiply";
        for (let i = 0; i < 90; i++) {
          ctx.fillStyle =
            "rgba(" +
            ((120 + r() * 60) | 0) +
            "," +
            ((100 + r() * 50) | 0) +
            ",70," +
            (0.08 + r() * 0.12) +
            ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            10 + r() * 60,
            6 + r() * 30,
            r() * 3,
            0,
            TAU,
          );
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
        if (variant) {
          // burnt holes (alpha is not used, paint as dark scorched)
          for (let i = 0; i < 6; i++) {
            ctx.fillStyle = "rgba(25,18,12,0.85)";
            ctx.beginPath();
            ctx.arc(r() * w, r() * h, 6 + r() * 16, 0, TAU);
            ctx.fill();
          }
        }
      },
      { clamp: true },
    );
  };
  function drawStar(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU - Math.PI / 2,
        rr = i % 2 ? r * 0.42 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
  PR.drawStar = drawStar;

  /**
   * Painted / engraved sign texture.  style: 'engraved' (stone lettering),
   * 'raider' (sloppy red paint on scrap), 'enamel' (retro enamel plate),
   * 'bronze' (historical plaque), 'banner' (museum banner), 'neon'.
   */
  function fitFont(ctx, lines, fs, maxW, fam) {
    ctx.font = "bold " + fs + "px " + fam;
    let mw = 0;
    for (const t of lines) mw = Math.max(mw, ctx.measureText(t).width);
    return mw > maxW ? Math.floor((fs * maxW) / mw) : fs;
  }
