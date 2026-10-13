// play-inline-585 02 — opts
// Lines 21-321 of readable/play-inline-585.pretty.js (statement-aligned).
  const U = G.util;

  const LR = (G.lair = G.lair && !G.lair.__stub ? G.lair : {});
  const K = (LR._ = LR._ || {});
  K.builds = K.builds || []; // [{order, fn}] static geometry, run in init
  K.readyFns = K.readyFns || []; // run once at initDone
  K.spawnFns = K.spawnFns || []; // run on newGame / loaded
  K.resetFns = K.resetFns || []; // run on reset
  K.updateFns = K.updateFns || []; // (dt, realDt) every frame
  K.animFns = K.animFns || []; // (dt, t) while a lair root is visible
  K.addBuild = (order, fn) => K.builds.push({ order, fn });
  K.onReady = (fn) => K.readyFns.push(fn);
  K.onSpawn = (fn) => K.spawnFns.push(fn);
  K.onReset = (fn) => K.resetFns.push(fn);
  K.onUpdate = (fn) => K.updateFns.push(fn);
  K.onAnim = (fn) => K.animFns.push(fn);
  K.PI = Math.PI;
  K.HP = Math.PI / 2;
  K.TAU = Math.PI * 2;
  K.clamp = U.clamp;
  K.lerp = U.lerp;
  K.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  K.V = (x, y, z) => new THREE.Vector3(x, y, z);
  K.safe = function (where, fn) {
    try {
      return fn();
    } catch (e) {
      G.reportError("lair:" + where, e);
      return undefined;
    }
  };
  K.live = (ns) => !!(G[ns] && !G.isStub(ns));

  // ------------------------------------------------------------------
  // Interior cells. Two cells on the 400 m interior grid, far east of every
  // other module's cell: Track 61 (shaft foot, platform, railcar, Hall of
  // Candles, the stair down, M42 antechamber, Tinder's workshop) and the
  // M42 substation itself (the Sun Room). Registered here at load time
  // (add-only; core layout.js is not edited). If a key / origin is already
  // taken we walk the grid east until a free spot is found.
  // ------------------------------------------------------------------
  const CELL_DEFS = [
    {
      key: "lair_track61",
      name: "Track 61 (under the Waldorf-Astoria)",
      pref: { x: 14000, y: 0, z: 0 },
    },
    {
      key: "lair_m42",
      name: "M42 Substation: the Sun Room",
      pref: { x: 14000, y: 0, z: 400 },
    },
  ];
  K.cells = {};
  function pickOrigin(pref, taken) {
    let o = { x: pref.x, y: 0, z: pref.z };
    for (let tries = 0; tries < 40; tries++) {
      const clash = taken.some(
        (t) => Math.abs(t.x - o.x) < 400 && Math.abs(t.z - o.z) < 400,
      );
      if (!clash) return o;
      o = { x: o.x + 400, y: 0, z: o.z };
    }
    return o;
  }
  (function registerCells() {
    const L = G.LAYOUT;
    if (!L || !L.INTERIORS) return;
    for (const d of CELL_DEFS) {
      const have = L.INTERIORS[d.key];
      if (have && have.owner === "lair") {
        K.cells[d.key] = have.origin;
        continue;
      }
      const taken = [];
      for (const k in L.INTERIORS)
        if (L.INTERIORS[k] && L.INTERIORS[k].origin)
          taken.push(L.INTERIORS[k].origin);
      const o = pickOrigin(d.pref, taken);
      if (o.x !== d.pref.x || o.z !== d.pref.z)
        console.warn("[lair] cell " + d.key + " moved to " + o.x + "," + o.z);
      L.INTERIORS[d.key] = {
        owner: "lair",
        origin: o,
        name: d.name,
        type: "lair",
      };
      K.cells[d.key] = o;
    }
  })();
  K.O1 = () => K.cells.lair_track61; // Track 61 cell origin
  K.O2 = () => K.cells.lair_m42; // Sun Room cell origin
  /** World position from cell-local coordinates. */
  K.w1 = (x, y, z) => new THREE.Vector3(K.O1().x + x, y, K.O1().z + z);
  K.w2 = (x, y, z) => new THREE.Vector3(K.O2().x + x, y, K.O2().z + z);
  /** Which lair cell is world position p in (null outside)? */
  K.cellAt = function (p) {
    if (!p) return null;
    for (const k in K.cells) {
      const o = K.cells[k];
      if (Math.abs(p.x - o.x) < 160 && Math.abs(p.z - o.z) < 160) return k;
    }
    return null;
  };
  K.inLair = (p) => !!K.cellAt(p || (G.player && G.player.pos));

  // ------------------------------------------------------------------
  // Canvas helpers
  // ------------------------------------------------------------------
  K.canvas = function (w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  K.texFromCanvas = function (c, opts) {
    opts = opts || {};
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = opts.clamp
      ? THREE.ClampToEdgeWrapping
      : THREE.RepeatWrapping;
    t.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    let an = 4;
    try {
      an = G.renderer
        ? Math.min(8, G.renderer.capabilities.getMaxAnisotropy())
        : 4;
    } catch (e) {
      /* ignore */
    }
    t.anisotropy = an;
    t.needsUpdate = true;
    return t;
  };
  const hex = (c) => "#" + new THREE.Color(c).getHexString();
  K.hex = hex;
  K.shade = function (c, f) {
    const col = new THREE.Color(c);
    col.r = K.clamp(col.r * f, 0, 1);
    col.g = K.clamp(col.g * f, 0, 1);
    col.b = K.clamp(col.b * f, 0, 1);
    return "#" + col.getHexString();
  };
  let noiseTile = null;
  K.grain = function (x, w, h, amt, seed) {
    if (!noiseTile) {
      const S = 128;
      noiseTile = K.canvas(S, S);
      const nx = noiseTile.getContext("2d");
      const img = nx.createImageData(S, S);
      const d = img.data;
      const r = K.rng(4242);
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.floor(r() * 256);
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      nx.putImageData(img, 0, 0);
    }
    x.save();
    x.globalCompositeOperation = "overlay";
    x.globalAlpha = Math.min(1, amt / 90);
    const ox = ((seed || 0) * 37) % 128,
      oy = ((seed || 0) * 53) % 128;
    for (let y = -oy; y < h; y += 128)
      for (let xx = -ox; xx < w; xx += 128) x.drawImage(noiseTile, xx, y);
    x.restore();
  };
  K.stains = function (x, w, h, n, seed, alpha, color) {
    const r = K.rng(seed || 3);
    for (let i = 0; i < n; i++) {
      const px = r() * w,
        py = r() * h,
        rad = (0.05 + r() * 0.25) * Math.min(w, h);
      const g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(
        0,
        "rgba(" + (color || "30,26,20") + "," + (alpha || 0.25) * r() + ")",
      );
      g.addColorStop(1, "rgba(" + (color || "30,26,20") + ",0)");
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
  };
  /** Twelve-ray sun (the Glowkeepers' sign): straight rays alternating long/short, solid disc. */
  K.drawSun = function (x, cx, cy, R, opts) {
    opts = opts || {};
    const rays = 12,
      inner = R * (opts.disc || 0.42);
    x.save();
    x.translate(cx, cy);
    if (opts.rot) x.rotate(opts.rot);
    x.fillStyle = opts.color || "#d8a640";
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2,
        len = i % 2 ? R * 0.78 : R,
        w = (opts.width || 0.13) * R * (i % 2 ? 0.85 : 1);
      x.save();
      x.rotate(a);
      x.beginPath();
      x.moveTo(-w / 2, -inner * 0.92);
      x.lineTo(0, -len);
      x.lineTo(w / 2, -inner * 0.92);
      x.closePath();
      x.fill();
      x.restore();
    }
    x.beginPath();
    x.arc(0, 0, inner, 0, Math.PI * 2);
    x.fill();
    if (opts.ring) {
      x.strokeStyle = opts.ring;
      x.lineWidth = R * 0.03;
      x.beginPath();
      x.arc(0, 0, inner * 0.82, 0, Math.PI * 2);
      x.stroke();
    }
    x.restore();
  };
  K.stencilText = function (x, text, cx, cy, size, color, opts) {
    opts = opts || {};
    x.save();
    x.font =
      (opts.weight || "700") +
      " " +
      size +
      "px " +
      (opts.font || '"Courier New", monospace');
    x.textAlign = opts.align || "center";
    x.textBaseline = "middle";
    x.fillStyle = color || "#1a1a1a";
    if (opts.spacing) {
      try {
        x.letterSpacing = opts.spacing + "px";
      } catch (e) {
        /* older canvas */
      }
    }
    if (opts.maxW) {
      const m = x.measureText(text).width;
      if (m > opts.maxW) {
        x.translate(cx, cy);
        x.scale(opts.maxW / m, 1);
        x.fillText(text, 0, 0);
        x.restore();
        return;
      }
    }
    x.fillText(text, cx, cy);
    if (opts.stencilBreaks) {
      // stencil bridges: thin vertical gaps through the letters
      x.globalCompositeOperation = "destination-out";
      const w = x.measureText(text).width;
      const r = K.rng(text);
      for (let i = 0; i < text.length; i++) {
        const px = cx - w / 2 + ((i + 0.5) * w) / text.length + (r() - 0.5) * 3;
        x.fillRect(px - 1.2, cy - size * 0.55, 2.4, size * 1.1);
      }
    }
    x.restore();
  };

  // ------------------------------------------------------------------
  // Procedural fallback surfaces (used only when the textures module is absent)
  // ------------------------------------------------------------------
  function fallbackCanvas(kind, seed) {
    const S = 256,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      r = K.rng(seed || 1);
    x.fillStyle = "#c8c8c8";
    x.fillRect(0, 0, S, S);
    if (kind === "brick") {
      x.fillStyle = "#8a8a8a";
      x.fillRect(0, 0, S, S);
      for (let row = 0; row < S / 16; row++)
        for (let col = -1; col < S / 48 + 1; col++) {
          const ox = (row % 2) * 24;
          x.fillStyle = K.shade("#c8c8c8", 0.8 + r() * 0.3);
          x.fillRect(col * 48 + ox + 2, row * 16 + 2, 44, 13);
        }
    } else if (kind === "tile") {
      for (let yy = 0; yy < S; yy += 32)
        for (let xx = 0; xx < S; xx += 64) {
          x.fillStyle = K.shade("#e8e8e8", 0.92 + r() * 0.08);
          x.fillRect(xx + 1, yy + 1, 62, 30);
        }
    } else if (kind === "planks") {
      for (let i = 0; i < 8; i++) {
        x.fillStyle = K.shade("#c8c8c8", 0.75 + r() * 0.4);
        x.fillRect(0, i * 32, S, 30);
      }
    }
    K.stains(x, S, S, 8, (seed || 1) + 2, 0.22);
    K.grain(x, S, S, 26, (seed || 1) + 3);
    return c;
  }

  // ------------------------------------------------------------------
  // Materials. key -> def. tex = G.tex surface, tile = metres per repeat [u, v]
  // ------------------------------------------------------------------
