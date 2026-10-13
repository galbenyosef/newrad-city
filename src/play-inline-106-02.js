// play-inline-106 02 — col
// Lines 20-319 of readable/play-inline-106.pretty.js (statement-aligned).
  const U = G.util;

  const A = (G.LMA = G.LMA || {});
  const K = (A.kit = {});
  A.defs = A.defs || []; // site build definitions: {id, order, build(K)}
  A.animators = A.animators || []; // fn(dt, time, night)
  A.dynamic = A.dynamic || []; // fn() called on newGame/loaded (spawn dynamic stuff)
  K.A = A;

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

  // Locks: keys / codes / passcodes (G.locks). Every lock in this directory is registered at build time and opened
  // through G.locks; while the locks module is absent (stub) the lock simply opens.
  K.locksLive = () =>
    !!(G.locks && !G.isStub("locks") && typeof G.locks.open === "function");
  K.lockReg = function (spec) {
    try {
      if (K.locksLive() && G.locks.register) G.locks.register(spec);
    } catch (e) {
      G.reportError && G.reportError("landmarks_a:lockReg:" + spec.id, e);
    }
    return spec;
  };
  K.lockOpen = function (spec, onOpen) {
    try {
      if (K.locksLive()) {
        if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
          onOpen();
          return;
        }
        G.locks.open(spec, onOpen);
        return;
      }
    } catch (e) {
      G.reportError && G.reportError("landmarks_a:lockOpen:" + spec.id, e);
    }
    onOpen();
  };
  K.lockIsOpen = (id) =>
    !K.locksLive() || !G.locks.isOpen || !!G.locks.isOpen(id);
  K.lockLearn = function (id) {
    try {
      if (K.locksLive() && G.locks.learn) G.locks.learn(id);
    } catch (e) {
      G.reportError && G.reportError("landmarks_a:lockLearn:" + id, e);
    }
  };
  /** Learn lock code(s) when the player picks up or reads the item that carries them (note / tape reel). */
  K.learnFromItem = function (itemId, lockId) {
    const m = (K._learnMap = K._learnMap || {});
    m[itemId] = (m[itemId] || []).concat([lockId]);
    if (K._learnHooked || !G.events) return;
    K._learnHooked = true;
    const fire = (id) => {
      const l = m[id];
      if (l) l.forEach(K.lockLearn);
    };
    G.events.on("itemAdded", fire);
    G.events.on("noteRead", fire);
  };

  /*
   * Interior / exterior split (streams, 2026-09-27). Everything built INSIDE a building's shell (rooms, floors seen
   * from inside, ceilings, furniture, interior props / lights / NPC anchors, interior-cell geometry, street↔interior
   * doors) lives in `NN_<site>_interior.js` files, which register named hooks with K.defineInterior(). The exterior
   * build calls K.interior(name, ctx) at the exact point where that code used to run, handing over its builders /
   * glow sets / record through `ctx`, so merged meshes, atlas packing and RNG streams stay byte-identical.
   * A missing hook is a no-op (the shell still builds); a throwing hook is reported and the rest of the site builds.
   */
  A.interiors = A.interiors || {};
  K.defineInterior = function (name, fn) {
    A.interiors[name] = fn;
  };
  K.interior = function (name, ctx) {
    const fn = A.interiors[name];
    if (typeof fn !== "function") return undefined;
    try {
      return fn(ctx || {});
    } catch (e) {
      G.reportError("init:landmarks_a/" + name, e);
      return undefined;
    }
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
        rds = (0.05 + r() * 0.25) * Math.min(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rds);
      g.addColorStop(
        0,
        "rgba(" + (color || "30,26,20") + "," + (alpha || 0.25) * r() + ")",
      );
      g.addColorStop(1, "rgba(" + (color || "30,26,20") + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rds, y - rds, rds * 2, rds * 2);
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
  function fallbackCanvas(kind, base, seed) {
    const S = 256,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      r = K.rng(seed);
    x.fillStyle = hex(base);
    x.fillRect(0, 0, S, S);
    if (kind === "brick") {
      const bh = 16,
        bw = 48;
      x.fillStyle = shadeHex(base, 0.55);
      x.fillRect(0, 0, S, S);
      for (let row = 0; row < S / bh; row++)
        for (let col = -1; col < S / bw + 1; col++) {
          const ox = ((row % 2) * bw) / 2;
          x.fillStyle = shadeHex(base, 0.8 + r() * 0.35);
          x.fillRect(col * bw + ox + 2, row * bh + 2, bw - 4, bh - 3);
        }
    } else if (kind === "blocks" || kind === "marble") {
      const bh = 64,
        bw = 128;
      for (let row = 0; row < S / bh; row++)
        for (let col = -1; col < S / bw + 1; col++) {
          const ox = ((row % 2) * bw) / 2;
          x.fillStyle = shadeHex(base, 0.9 + r() * 0.16);
          x.fillRect(col * bw + ox, row * bh, bw, bh);
          x.strokeStyle = shadeHex(base, 0.62);
          x.lineWidth = 2;
          x.strokeRect(col * bw + ox, row * bh, bw, bh);
        }
      if (kind === "marble") {
        x.globalAlpha = 0.35;
        for (let i = 0; i < 14; i++) {
          x.strokeStyle = shadeHex(base, 0.55 + r() * 0.3);
          x.lineWidth = 0.5 + r() * 2;
          x.beginPath();
          let px = r() * S,
            py = r() * S;
          x.moveTo(px, py);
          for (let k = 0; k < 6; k++) {
            px += (r() - 0.3) * 60;
            py += (r() - 0.5) * 60;
            x.lineTo(px, py);
          }
          x.stroke();
        }
        x.globalAlpha = 1;
      }
    } else if (kind === "planks") {
      for (let i = 0; i < 8; i++) {
        x.fillStyle = shadeHex(base, 0.75 + r() * 0.4);
        x.fillRect(0, i * 32, S, 30);
      }
      x.globalAlpha = 0.25;
      x.strokeStyle = shadeHex(base, 0.5);
      for (let i = 0; i < 40; i++) {
        const y = r() * S;
        x.beginPath();
        x.moveTo(0, y);
        x.bezierCurveTo(80, y + r() * 6, 160, y - r() * 6, S, y);
        x.stroke();
      }
      x.globalAlpha = 1;
    } else if (kind === "corrugated") {
      for (let i = 0; i < S; i += 4) {
        const t = 0.75 + 0.3 * Math.sin((i / 16) * Math.PI * 2);
        x.fillStyle = shadeHex(base, t);
        x.fillRect(i, 0, 4, S);
      }
      K.stains(x, S, S, 10, seed + 1, 0.5, "90,50,20");
    } else if (kind === "fabric") {
      x.globalAlpha = 0.15;
      x.fillStyle = "#000";
      for (let i = 0; i < S; i += 3) {
        x.fillRect(i, 0, 1, S);
        x.fillRect(0, i, S, 1);
      }
      x.globalAlpha = 1;
    }
    K.stains(x, S, S, 8, seed + 2, 0.22);
    K.grain(x, S, S, kind === "metal" ? 14 : 26, seed + 3);
    return c;
  }

  // ------------------------------------------------------------------
  // Materials
  // ------------------------------------------------------------------
  // key -> def. tex = G.tex name, fb = fallback kind, tile = [metres per texture repeat u, v]
