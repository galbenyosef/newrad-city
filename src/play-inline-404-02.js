// play-inline-404 02 — seed
// Lines 26-120 of readable/play-inline-404.pretty.js (statement-aligned).
  const U = G.util;

  const PV = (G._pf3 = G._pf3 || {});
  PV.defs = PV.defs || [];
  /** POI definition: {id, order, build(K), data(K) (initDone), spawn(K) (newGame/loaded), update(dt, K)} */
  PV.define = (def) => {
    PV.defs.push(def);
  };
  const K = (PV.kit = {});
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
