// play-inline-211 02 — ctx
// Lines 16-311 of readable/play-inline-211.pretty.js (statement-aligned).
  const U = G.util;
  const TAU = Math.PI * 2;
  const PH = (G._pharbor = {}); // own object: poi_herald shares the name G._ph and clobbered PH.anchor (door-setup crash)
  PH.TAU = TAU;
  PH.builders = [];
  PH.onReady = []; // at initDone (props / items / terminals available)
  PH.onNewGame = []; // at newGame (NPCs, quest pickups)
  PH.onReset = []; // at reset
  PH.onLoaded = []; // after a save was applied
  PH.updaters = []; // fn(dt, realDt)
  PH.hazards = []; // fn(player, lastPos, dt)
  PH.saveHooks = {}; // key -> {save(), load(d)}
  PH.interiors = []; // {key, root, origin}
  PH.entries = {};
  PH.addBuilder = (id, fn, order) =>
    PH.builders.push({ id, fn, order: order || 50 });

  // -------------------------------------------------------------------
  // Small math helpers
  // -------------------------------------------------------------------
  PH.v3 = (x, y, z) => new THREE.Vector3(x, y, z);
  PH.m4 = function (x, y, z, ry, rx, rz, sx, sy, sz) {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(rx || 0, ry || 0, rz || 0, "YXZ"),
    );
    m.compose(
      new THREE.Vector3(x || 0, y || 0, z || 0),
      q,
      new THREE.Vector3(sx || 1, sy || sx || 1, sz || sx || 1),
    );
    return m;
  };
  PH.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  PH.smooth = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  /** Local → world helper for a frame (ox,oz, ry) → [x,z] (THREE rotation.y convention). */
  PH.rot = function (ox, oz, ry, lx, lz) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    return [ox + lx * c + lz * s, oz - lx * s + lz * c];
  };
  /** Yaw that faces from (x,z) toward (tx,tz), actor convention (forward = (-sin, 0, -cos)). */
  PH.yawTo = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z));
  PH.anchor = function (x, y, z, yaw) {
    const v = new THREE.Vector3(x, y, z);
    v.yaw = yaw || 0;
    return v;
  };
  PH.safe = function (tag, fn) {
    try {
      return fn();
    } catch (e) {
      try {
        G.reportError("poi_harbor:" + tag, e);
      } catch (e2) {
        /* */
      }
      return null;
    }
  };

  // -------------------------------------------------------------------
  // Canvas textures (our own: signs, herringbone tile, sugar, molasses)
  // -------------------------------------------------------------------
  const texCache = {};
  function canvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  PH.canvasTex = function (key, w, h, draw, opts) {
    if (texCache[key]) return texCache[key];
    const c = canvas(w, h);
    const ctx = c.getContext("2d", { willReadFrequently: true });
    try {
      draw(ctx, w, h);
    } catch (e) {
      PH.safe("tex " + key, () => {
        throw e;
      });
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT =
      opts && opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return (texCache[key] = t);
  };
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
  PH.noiseFill = noiseFill;
  const tf = (x, y, s, w) =>
    U.fbm2((((x % w) + w) % w) / s, (((y % w) + w) % w) / s, 4);

  /** Guastavino tile vault: buff terracotta tiles in herringbone with mortar, soot & water stains. */
  function guastavinoTex() {
    return PH.canvasTex("ph_guastavino", 512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#8a7a62";
      ctx.fillRect(0, 0, w, h); // mortar
      const r = PH.rng("guast");
      const L = 64,
        T = 22; // tile length / width in px (512 px = 3 m)
      for (let row = -2; row < 16; row++) {
        for (let col = -2; col < 16; col++) {
          const ox = col * L + (row % 2) * (L / 2),
            oy = row * (L / 2);
          for (const vert of [0, 1]) {
            ctx.save();
            ctx.translate(ox + (vert ? T : 0), oy);
            ctx.rotate(vert ? Math.PI / 4 : -Math.PI / 4);
            const v = 0.82 + r() * 0.3;
            ctx.fillStyle =
              "rgb(" +
              ((205 * v) | 0) +
              "," +
              ((178 * v) | 0) +
              "," +
              ((132 * v) | 0) +
              ")";
            ctx.fillRect(1, 1, L * 0.62 - 2, T - 2);
            ctx.restore();
          }
        }
      }
      noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
        const n = tf(x, y, 60, 512),
          s = U.fbm2(x / 5, y / 90, 2);
        const k =
          0.86 +
          n * 0.22 -
          Math.max(0, s - 0.6) * 0.5 +
          (U.hash2(x, y) - 0.5) * 0.08;
        return [R * k, Gc * k, B * k];
      });
    });
  }
  /** Granular refined sugar (pale with sparkles and dirty crust). */
  function sugarTex() {
    return PH.canvasTex("ph_sugar", 256, 256, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tf(x, y, 30, 256),
          g = U.hash2(x * 3, y * 7);
        let v = 222 + n * 30 + (g > 0.93 ? 30 : 0) - (g < 0.05 ? 25 : 0);
        const dirt = Math.max(0, tf(x + 90, y, 50, 256) - 0.62) * 180;
        return [v - dirt * 0.8, v - dirt * 0.95, v - dirt * 1.2 - 6];
      });
    });
  }
  /** Molasses / raw syrup: dark glossy brown with amber swirls. */
  function molassesTex() {
    return PH.canvasTex("ph_molasses", 256, 256, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tf(x, y, 40, 256),
          s = Math.sin((x + n * 90) * 0.05 + y * 0.02);
        const a = Math.max(0, s) * 70 * n;
        return [95 + a + n * 40, 48 + a * 0.6 + n * 18, 14 + a * 0.2];
      });
    });
  }
  /** Raw (brown) sugar. */
  function rawSugarTex() {
    return PH.canvasTex("ph_rawsugar", 256, 256, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tf(x, y, 24, 256),
          g = U.hash2(x * 5, y * 3),
          cr = tf(x + 50, y + 90, 6, 256);
        const v =
          0.82 +
          n * 0.22 +
          (cr - 0.5) * 0.12 +
          (g > 0.94 ? 0.2 : 0) -
          (g < 0.04 ? 0.15 : 0);
        return [214 * v, 172 * v, 116 * v];
      });
    });
  }
  /** Riveted battleship-grey plate with weld seams, rust weeping from rivets. */
  /** Riveted, welded haze-grey steel plate: panel seams with weld beads, rivet rows with highlights,
   *  chipped paint showing rust, rust runs below rivets (ship interiors, Rivet-City style). */
  function navyPlateTex() {
    return PH.canvasTex("ph_navyplate", 512, 512, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tf(x, y, 60, 512),
          m = tf(x + 131, y + 77, 14, 512);
        const v = 132 + n * 30 + m * 10 + (U.hash2(x, y) - 0.5) * 8;
        return [v * 0.9, v * 0.96, v * 0.99];
      });
      const r = PH.rng("navy2");
      // paint chips revealing rust (drawn under the seams)
      for (let i = 0; i < 14; i++) {
        const cx = r() * w,
          cy = r() * h,
          rr = 4 + r() * 22;
        ctx.fillStyle = "rgba(58,46,36,0.45)";
        ctx.beginPath();
        for (let k = 0; k < 9; k++) {
          const a = (k / 9) * TAU,
            q = rr * (0.6 + r() * 0.6);
          k
            ? ctx.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.7)
            : ctx.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.7);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(104,70,46,0.6)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr * 0.5, rr * 0.34, r() * 3, 0, TAU);
        ctx.fill();
      }
      // panels 256 x 128 (staggered): dark seam + lit bevel + weld bead
      const seamH = (y) => {
        ctx.fillStyle = "rgba(30,32,34,0.75)";
        ctx.fillRect(0, y - 1, w, 2);
        ctx.fillStyle = "rgba(210,214,216,0.25)";
        ctx.fillRect(0, y + 1, w, 1);
        ctx.fillStyle = "rgba(70,72,72,0.35)";
        ctx.fillRect(0, y - 3, w, 1);
      };
      const seamV = (x, y0, y1) => {
        ctx.fillStyle = "rgba(30,32,34,0.75)";
        ctx.fillRect(x - 1, y0, 2, y1 - y0);
        ctx.fillStyle = "rgba(210,214,216,0.22)";
        ctx.fillRect(x + 1, y0, 1, y1 - y0);
      };
      for (let y = 0; y <= h; y += 128) seamH(y % h);
      for (let row = 0; row < 4; row++)
        for (let x = (row % 2) * 128; x <= w; x += 256)
          seamV(x % w, row * 128, row * 128 + 128);
      // rivet rows along the horizontal seams (two rows) and the verticals
      const rivet = (x, y) => {
        ctx.fillStyle = "rgba(40,40,40,0.55)";
        ctx.beginPath();
        ctx.arc(x + 0.8, y + 0.8, 2.6, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(150,154,156,1)";
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(225,228,228,0.7)";
        ctx.beginPath();
        ctx.arc(x - 0.7, y - 0.7, 0.9, 0, TAU);
        ctx.fill();
        if (r() < 0.1) {
          const len = 30 + r() * 80;
          const g = ctx.createLinearGradient(0, y, 0, y + len);
          g.addColorStop(0, "rgba(110,66,36,0.45)");
          g.addColorStop(1, "rgba(110,66,36,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - 1.5, y + 2, 3 + r() * 3, len);
        }
      };
      for (let y = 0; y < h; y += 128)
        for (let x = 5; x < w; x += 12) {
          rivet(x, (y + 7) % h);
          rivet(x + 6, (y + h - 7) % h);
        }
      for (let row = 0; row < 4; row++)
        for (let x = (row % 2) * 128; x <= w; x += 256)
          for (let y = row * 128 + 14; y < row * 128 + 120; y += 12)
            rivet((x + 7) % w, y);
      // oily grime blooms
      for (let i = 0; i < 12; i++) {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        ctx.save();
        ctx.translate(r() * w, r() * h);
        ctx.scale(20 + r() * 60, 10 + r() * 40);
        g.addColorStop(0, "rgba(40,36,30,0.28)");
        g.addColorStop(1, "rgba(40,36,30,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    });
  }
  /** Battleship hull side (exterior, ~10 m tile): haze-grey paint in welded strakes (horizontal seams every
   *  ~1.8 m, staggered butt joints), touch-up patches in mismatched greys, salt bloom, and long rust runs weeping
   *  down from seams and fittings; a scatter of bare-metal scrapes (tug & pier fender marks). */
