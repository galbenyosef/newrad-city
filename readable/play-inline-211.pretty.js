/* src/poi_harbor/00_kit.js */
/* =====================================================================
 * POI_HARBOR — private toolkit (G._pharbor)
 * Ellis Island Immigration Station, Brooklyn Sugar Works, Brooklyn Navy
 * Yard drydock + USS Hudson.  Techniques adapted (copied, not shared)
 * from landmarks_b/00_lib.js: per-material merge batches with world-
 * projected UVs + vertex-colour AO/grime, baked interior light as a
 * per-vertex emission attribute ('@lit' materials), yaw-safe colliders,
 * stairs with ≤0.3 m step colliders, anchors & lifecycle helpers.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
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
  function hullGreyTex() {
    return PH.canvasTex("ph_hullgrey", 1024, 1024, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tf(x, y, 180, 1024),
          m = tf(x + 300, y + 50, 40, 1024),
          st = tf(x * 4, y * 0.25, 200, 1024);
        const v =
          104 + n * 26 + m * 9 + (st - 0.5) * 10 + (U.hash2(x, y) - 0.5) * 6;
        return [v * 0.93, v * 0.99, v * 1.03];
      });
      const r = PH.rng("hullgrey");
      // touch-up paint patches (flat rectangles, slightly different grey)
      for (let i = 0; i < 16; i++) {
        const x = r() * w,
          y = r() * h,
          pw = 40 + r() * 200,
          ph = 20 + r() * 110,
          dv = (r() - 0.5) * 34;
        ctx.fillStyle =
          "rgba(" +
          ((112 + dv) | 0) +
          "," +
          ((120 + dv) | 0) +
          "," +
          ((126 + dv) | 0) +
          ",0.55)";
        ctx.fillRect(x, y, pw, ph);
      }
      // strakes: seams every 150 px (≈1.5 m), with a lit lap edge; butt joints staggered every 512 px
      for (let y = 0; y < h; y += 150) {
        ctx.fillStyle = "rgba(24,26,28,0.7)";
        ctx.fillRect(0, y, w, 3);
        ctx.fillStyle = "rgba(200,206,210,0.22)";
        ctx.fillRect(0, y + 3, w, 2);
        ctx.fillStyle = "rgba(40,42,44,0.18)";
        ctx.fillRect(0, y - 8, w, 8);
        const off = ((y / 150) % 2) * 256;
        for (let x = off; x < w + 1; x += 512) {
          ctx.fillStyle = "rgba(24,26,28,0.6)";
          ctx.fillRect(x % w, y, 3, 150);
          ctx.fillStyle = "rgba(200,206,210,0.18)";
          ctx.fillRect((x + 3) % w, y, 2, 150);
        }
      }
      // rust runs: from the seams and from random fittings, long, tapering, orange-brown
      const run = (x, y, len, wd, a) => {
        const g = ctx.createLinearGradient(0, y, 0, y + len);
        g.addColorStop(0, "rgba(120,64,28," + a + ")");
        g.addColorStop(0.35, "rgba(104,58,30," + a * 0.7 + ")");
        g.addColorStop(1, "rgba(90,56,34,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - wd / 2, y);
        ctx.lineTo(x + wd / 2, y);
        ctx.lineTo(x + wd * 0.15, y + len);
        ctx.lineTo(x - wd * 0.15, y + len);
        ctx.closePath();
        ctx.fill();
      };
      for (let i = 0; i < 120; i++) {
        const sy = Math.floor(r() * 7) * 150 + 4;
        run(r() * w, sy, 40 + r() * 260, 3 + r() * 10, 0.2 + r() * 0.4);
      }
      for (let i = 0; i < 26; i++) {
        const x = r() * w,
          y = r() * h;
        ctx.fillStyle = "rgba(92,52,26,0.7)";
        ctx.beginPath();
        ctx.arc(x, y, 3 + r() * 6, 0, TAU);
        ctx.fill();
        run(x, y, 120 + r() * 380, 8 + r() * 18, 0.35 + r() * 0.3);
      }
      // salt bloom along the seams
      for (let i = 0; i < 60; i++) {
        const x = r() * w,
          y = Math.floor(r() * 7) * 150 + 6;
        ctx.fillStyle = "rgba(210,210,196," + (0.05 + r() * 0.1) + ")";
        ctx.fillRect(x, y, 30 + r() * 120, 4 + r() * 16);
      }
      // fender scrapes: bare metal smears
      for (let i = 0; i < 8; i++) {
        const x = r() * w,
          y = r() * h,
          len = 80 + r() * 260;
        ctx.strokeStyle = "rgba(70,58,48,0.45)";
        ctx.lineWidth = 2 + r() * 5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y + (r() - 0.5) * 30);
        ctx.stroke();
      }
    });
  }
  /** Red anti-fouling below the boot-top: flaking red lead, barnacle crust & silt tide marks. */
  function hullRedTex() {
    return PH.canvasTex("ph_hullred", 512, 512, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tf(x, y, 90, 512),
          m = tf(x + 77, y, 18, 512);
        const flake = m > 0.66 ? 0.62 : 1,
          v = (0.8 + n * 0.3) * flake;
        return [
          132 * v + (1 - flake) * 40,
          50 * v + (1 - flake) * 36,
          38 * v + (1 - flake) * 28,
        ];
      });
      const r = PH.rng("hullred");
      for (let i = 0; i < 260; i++) {
        const x = r() * w,
          y = r() * h;
        ctx.fillStyle =
          "rgba(" +
          ((120 + r() * 40) | 0) +
          "," +
          ((100 + r() * 30) | 0) +
          ",84," +
          (0.12 + r() * 0.2) +
          ")";
        ctx.beginPath();
        ctx.arc(x, y, 1 + r() * 2.5, 0, TAU);
        ctx.fill();
      }
      for (let y = 40; y < h; y += 110 + r() * 60) {
        ctx.fillStyle = "rgba(70,60,48,0.3)";
        ctx.fillRect(0, y, w, 3 + r() * 6);
      }
    });
  }
  /** A view out of a window: hazy post-bomb sky, distant ruined skyline, grey water, grime & cracks on the glass.
   *  Used (emissive) on window panes of harbour interiors so they don't read as blank white. */
  function harborViewTex() {
    return PH.canvasTex("ph_harborview2", 1024, 256, (ctx, w, h) => {
      const HZ = h * 0.56; // horizon
      const sky = ctx.createLinearGradient(0, 0, 0, HZ);
      sky.addColorStop(0, "#7f8a78");
      sky.addColorStop(0.55, "#b4b89c");
      sky.addColorStop(1, "#d8d0aa");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      const r = PH.rng("harborview2");
      // cloud banks
      for (let i = 0; i < 14; i++) {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        ctx.save();
        ctx.translate(r() * w, r() * HZ * 0.6);
        ctx.scale(60 + r() * 160, 8 + r() * 18);
        g.addColorStop(0, "rgba(90,96,84,0.35)");
        g.addColorStop(1, "rgba(90,96,84,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      // far skyline (pale, hazy), then the near Manhattan skyline (darker, broken tops, a few lit windows)
      const skyline = (base, col, maxH, minW, maxW, lit) => {
        for (let x = -10; x < w;) {
          const bw = minW + r() * (maxW - minW),
            bh = h * (0.04 + Math.pow(r(), 1.6) * maxH);
          ctx.fillStyle = col;
          ctx.fillRect(x, base - bh, bw, bh + 1);
          if (r() < 0.2) {
            ctx.beginPath();
            ctx.moveTo(x + bw * 0.2, base - bh);
            ctx.lineTo(x + bw * 0.5, base - bh - h * 0.08);
            ctx.lineTo(x + bw * 0.8, base - bh);
            ctx.fill();
          } // spire
          else if (r() < 0.3) {
            ctx.clearRect(
              x + bw * (0.4 + r() * 0.4),
              base - bh,
              bw * 0.3,
              bh * 0.15 * r(),
            );
            ctx.fillStyle = col;
          } // bombed-out top
          if (lit)
            for (let k = 0; k < 3; k++)
              if (r() < 0.25) {
                ctx.fillStyle = "rgba(230,190,110,0.8)";
                ctx.fillRect(
                  x + 2 + r() * (bw - 4),
                  base - bh + 3 + r() * (bh - 6),
                  1.5,
                  1.5,
                );
              }
          x += bw + r() * 4;
        }
      };
      skyline(HZ, "rgba(128,132,116,0.8)", 0.26, 6, 16, false);
      skyline(HZ + 2, "rgba(78,82,72,0.95)", 0.2, 8, 22, true);
      // cranes and a derelict freighter on the waterline
      ctx.strokeStyle = "rgba(60,62,56,0.95)";
      ctx.lineWidth = 2;
      for (const cx of [180, 610, 840]) {
        ctx.beginPath();
        ctx.moveTo(cx, HZ);
        ctx.lineTo(cx, HZ - 34);
        ctx.lineTo(cx + 40, HZ - 44);
        ctx.moveTo(cx, HZ - 34);
        ctx.lineTo(cx - 12, HZ - 30);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(64,60,54,1)";
      ctx.fillRect(420, HZ - 6, 120, 8);
      ctx.fillRect(505, HZ - 16, 18, 10);
      // water: darker toward the viewer, long low glints
      const wat = ctx.createLinearGradient(0, HZ, 0, h);
      wat.addColorStop(0, "#8e927e");
      wat.addColorStop(1, "#474d44");
      ctx.fillStyle = wat;
      ctx.fillRect(0, HZ + 2, w, h - HZ);
      ctx.strokeStyle = "rgba(220,214,180,0.22)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 140; i++) {
        const y = HZ + 4 + Math.pow(r(), 1.5) * (h - HZ - 4),
          x = r() * w;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 6 + r() * 36 * (y / h), y);
        ctx.stroke();
      }
      // the glass itself: light, even film of dirt, a few runs, one crack web
      ctx.fillStyle = "rgba(70,64,48,0.12)";
      ctx.fillRect(0, 0, w, h);
      const gr = ctx.createLinearGradient(0, h * 0.8, 0, h);
      gr.addColorStop(0, "rgba(60,52,38,0)");
      gr.addColorStop(1, "rgba(60,52,38,0.3)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, h * 0.8, w, h * 0.2);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = "rgba(60,54,40,0.1)";
        ctx.fillRect(r() * w, r() * h * 0.4, 1, 20 + r() * 50);
      }
      ctx.strokeStyle = "rgba(225,225,215,0.35)";
      ctx.lineWidth = 1;
      {
        const cx = w * 0.7,
          cy = h * 0.35;
        for (let k = 0; k < 7; k++) {
          const a = r() * TAU;
          let x = cx,
            y = cy;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let s2 = 0; s2 < 4; s2++) {
            x += Math.cos(a + (r() - 0.5) * 0.8) * (10 + r() * 22);
            y += Math.sin(a + (r() - 0.5) * 0.8) * (10 + r() * 22);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    });
  }
  PH.harborViewKey = function () {
    return PH.texMat("ph_harborview", harborViewTex(), {
      emissive: 0.5,
      rough: 0.3,
      name: "ph_window_view",
    });
  };
  /** Hexagonal white ceramic floor tile (Ellis washrooms / medical rooms). */
  function hexTileTex() {
    return PH.canvasTex("ph_hextile", 256, 256, (ctx, w, h) => {
      ctx.fillStyle = "#6e6a60";
      ctx.fillRect(0, 0, w, h);
      const R = 9,
        dx = R * Math.sqrt(3),
        dy = R * 1.5,
        r = PH.rng("hex");
      for (let row = -1; row < h / dy + 2; row++)
        for (let col = -1; col < w / dx + 2; col++) {
          const cx = col * dx + ((row % 2) * dx) / 2,
            cy = row * dy;
          const v = 0.85 + r() * 0.15;
          const dirty = r() < 0.08;
          ctx.fillStyle = dirty
            ? "#5b5448"
            : "rgb(" +
              ((226 * v) | 0) +
              "," +
              ((222 * v) | 0) +
              "," +
              ((210 * v) | 0) +
              ")";
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * TAU + Math.PI / 6;
            ctx[k ? "lineTo" : "moveTo"](
              cx + Math.cos(a) * (R - 1),
              cy + Math.sin(a) * (R - 1),
            );
          }
          ctx.closePath();
          ctx.fill();
        }
      noiseFill(ctx, w, h, (x, y, R2, Gc, B) => {
        const n = tf(x, y, 40, 256);
        const k = 0.8 + n * 0.3;
        return [R2 * k, Gc * k, B * k * 0.97];
      });
    });
  }
  /** Red quarry tile (Ludowici-style) floor with dark grout, wear paths and dust. */
  function redTileTex() {
    return PH.canvasTex("ph_redtile", 512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#3a2a22";
      ctx.fillRect(0, 0, w, h);
      const r = PH.rng("redtile"),
        T = 64;
      for (let y = 0; y < h; y += T)
        for (let x = 0; x < w; x += T) {
          const v = 0.78 + r() * 0.28;
          ctx.fillStyle =
            "rgb(" +
            ((150 * v) | 0) +
            "," +
            ((66 * v) | 0) +
            "," +
            ((44 * v) | 0) +
            ")";
          ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
          if (r() < 0.12) {
            ctx.strokeStyle = "rgba(20,10,8,0.6)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x + r() * T, y);
            ctx.lineTo(x + r() * T, y + T);
            ctx.stroke();
          }
        }
      noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
        const n = tf(x, y, 90, 512);
        const k = 0.8 + n * 0.35;
        return [R * k, Gc * k, B * k];
      });
    });
  }
  /** Painted plaster: off-white, mottled, hairline cracks, rain streaks and a few chipped patches. */
  function plasterTex() {
    return PH.canvasTex("ph_plaster", 512, 512, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tf(x, y, 70, 512),
          m = tf(x + 200, y, 18, 512),
          st = U.fbm2(x / 6, y / 120, 2);
        let v = 196 + n * 34 + (m - 0.5) * 14 - Math.max(0, st - 0.58) * 70;
        return [v, v * 0.97, v * 0.9];
      });
      const r = PH.rng("plaster");
      ctx.strokeStyle = "rgba(60,50,40,0.45)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        let x = r() * w,
          y = r() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = 0; k < 8; k++) {
          x += (r() - 0.5) * 40;
          y += r() * 30;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let i = 0; i < 2; i++) {
        const x = r() * w,
          y = r() * h,
          rw = 10 + r() * 24,
          rh = 8 + r() * 18;
        ctx.fillStyle = "rgba(150,124,96,0.6)";
        ctx.beginPath();
        ctx.ellipse(x, y, rw, rh, r() * 3, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "rgba(70,52,36,0.7)";
        ctx.lineWidth = 2;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(x - rw * 0.8, y + k * rh * 0.3);
          ctx.lineTo(x + rw * 0.8, y + k * rh * 0.3);
          ctx.stroke();
        }
      }
      for (let i = 0; i < 8; i++) {
        const x = r() * w;
        const g = ctx.createLinearGradient(0, 0, 0, h * (0.3 + r() * 0.5));
        g.addColorStop(0, "rgba(90,70,40,0.35)");
        g.addColorStop(1, "rgba(90,70,40,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 6 + r() * 20, h);
      }
    });
  }
  /** Navy deck linoleum: dull green-grey 9-inch tiles, scuffs & wax build-up. */
  function linoTex() {
    return PH.canvasTex("ph_lino", 256, 256, (ctx, w, h) => {
      const r = PH.rng("lino"),
        T = 32;
      for (let y = 0; y < h; y += T)
        for (let x = 0; x < w; x += T) {
          const v = 0.85 + r() * 0.15,
            alt = ((x + y) / T) % 2;
          const c = alt ? [104, 112, 98] : [92, 100, 90];
          ctx.fillStyle =
            "rgb(" +
            ((c[0] * v) | 0) +
            "," +
            ((c[1] * v) | 0) +
            "," +
            ((c[2] * v) | 0) +
            ")";
          ctx.fillRect(x, y, T, T);
          ctx.fillStyle = "rgba(30,34,28,0.5)";
          ctx.fillRect(x, y, T, 1);
          ctx.fillRect(x, y, 1, T);
        }
      noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
        const n = tf(x, y, 40, 256);
        const k = 0.82 + n * 0.3;
        return [R * k, Gc * k, B * k];
      });
    });
  }
  PH.customTex = {
    lino: linoTex,
    plaster: plasterTex,
    redtile: redTileTex,
    guastavino: guastavinoTex,
    sugar: sugarTex,
    molasses: molassesTex,
    rawsugar: rawSugarTex,
    navyplate: navyPlateTex,
    hextile: hexTileTex,
    hullgrey: hullGreyTex,
    hullred: hullRedTex,
  };

  // -------------------------------------------------------------------
  // Sign textures (our own lettering; G.tex.sign is preferred when present)
  // -------------------------------------------------------------------
  function fitFont(ctx, lines, fs, maxW, fam, weight) {
    ctx.font = (weight || "bold") + " " + fs + "px " + fam;
    let mw = 0;
    for (const t of lines) mw = Math.max(mw, ctx.measureText(t).width);
    return mw > maxW ? Math.floor((fs * maxW) / mw) : fs;
  }
  /**
   * styles: enamel | engraved | raider | stencil | banner | neon_letters | chalk | paper
   * extra: {bg, fg, size, font}
   */
  PH.signTex = function (key, lines, style, w, h, extra) {
    w = w || 512;
    h = h || 128;
    extra = extra || {};
    return PH.canvasTex(
      "ph_sign_" + key,
      w,
      h,
      (ctx) => {
        const r = PH.rng(key);
        const fg = extra.fg,
          bg = extra.bg;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const draw = (fam, weight, fill, stroke, lh) => {
          let fs = extra.size || Math.floor((h * 0.7) / lines.length);
          fs = fitFont(ctx, lines, fs, w * 0.9, fam, weight);
          ctx.font = (weight || "bold") + " " + fs + "px " + fam;
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (lines.length - 1) / 2) * fs * (lh || 1.12);
            if (stroke) {
              ctx.lineJoin = "round";
              ctx.strokeStyle = stroke;
              ctx.lineWidth = Math.max(3, fs * 0.12);
              ctx.strokeText(t, w / 2, y);
            }
            ctx.fillStyle = fill;
            ctx.fillText(t, w / 2, y);
          });
          return fs;
        };
        if (style === "engraved") {
          ctx.fillStyle = bg || "#b9b09c";
          ctx.fillRect(0, 0, w, h);
          noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
            const n = (U.fbm2(x / 20, y / 20, 3) - 0.5) * 40;
            return [R + n, Gc + n, B + n];
          });
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          draw(
            '"Times New Roman", Georgia, serif',
            "bold",
            fg || "rgba(40,34,28,0.88)",
            null,
          );
        } else if (style === "raider") {
          ctx.fillStyle = bg || "#6d6a5e";
          ctx.fillRect(0, 0, w, h);
          for (let x = 0; x < w; x += 16) {
            ctx.fillStyle = "rgba(0,0,0,0.18)";
            ctx.fillRect(x, 0, 6, h);
          }
          for (let i = 0; i < 40; i++) {
            ctx.fillStyle =
              "rgba(" +
              ((120 + r() * 50) | 0) +
              "," +
              ((60 + r() * 30) | 0) +
              ",20," +
              (0.2 + r() * 0.4) +
              ")";
            ctx.beginPath();
            ctx.ellipse(
              r() * w,
              r() * h,
              8 + r() * 50,
              5 + r() * 30,
              r() * 3,
              0,
              TAU,
            );
            ctx.fill();
          }
          const fs = draw(
            'Impact, "Arial Black", sans-serif',
            "bold",
            fg || "#b3261c",
            "rgba(14,10,8,0.9)",
          );
          ctx.fillStyle = fg || "#b3261c";
          for (let k = 0; k < 14; k++)
            ctx.fillRect(
              w * 0.1 + r() * w * 0.8,
              h / 2 + fs * 0.3 * (r() - 0.2),
              3,
              6 + r() * fs * 0.5,
            );
        } else if (style === "stencil") {
          ctx.fillStyle = bg || "#5c6166";
          ctx.fillRect(0, 0, w, h);
          noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
            const n = (U.fbm2(x / 25, y / 25, 3) - 0.5) * 40;
            return [R + n, Gc + n, B + n];
          });
          draw(
            '"Arial Black", Impact, sans-serif',
            "bold",
            fg || "#e8e4d8",
            null,
          );
          for (let i = 0; i < 30; i++) {
            ctx.fillStyle =
              "rgba(" +
              ((100 + r() * 40) | 0) +
              ",50,20," +
              (0.2 + r() * 0.4) +
              ")";
            ctx.fillRect(r() * w, r() * h, 2 + r() * 5, 10 + r() * 40);
          }
        } else if (style === "banner") {
          ctx.fillStyle = bg || "#8e2b25";
          ctx.fillRect(0, 0, w, h);
          draw(
            '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
            "bold",
            fg || "#eadcbc",
            null,
            1.25,
          );
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(255,240,200,0.2)");
          g.addColorStop(1, "rgba(40,30,20,0.35)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 24; i++) {
            ctx.fillStyle = "rgba(30,20,10," + (0.08 + r() * 0.2) + ")";
            ctx.beginPath();
            ctx.ellipse(
              r() * w,
              r() * h,
              6 + r() * 30,
              10 + r() * 50,
              0,
              0,
              TAU,
            );
            ctx.fill();
          }
        } else if (style === "chalk") {
          ctx.fillStyle = bg || "#1d2420";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#6a5a40";
          ctx.lineWidth = h * 0.06;
          ctx.strokeRect(0, 0, w, h);
          draw(
            '"Comic Sans MS", "Segoe Print", cursive',
            "normal",
            fg || "rgba(230,230,220,0.85)",
            null,
            1.2,
          );
        } else if (style === "paper") {
          ctx.fillStyle = bg || "#d8cfb4";
          ctx.fillRect(0, 0, w, h);
          noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
            const n = (U.fbm2(x / 30, y / 30, 3) - 0.5) * 50;
            return [R + n, Gc + n, B + n - 8];
          });
          draw(
            '"Courier New", monospace',
            "bold",
            fg || "rgba(30,26,22,0.9)",
            null,
            1.25,
          );
        } else {
          // enamel
          ctx.fillStyle = bg || "#1d4a3a";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = fg || "#e8dfc4";
          ctx.lineWidth = Math.max(3, h * 0.05);
          ctx.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
          draw(
            '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
            "bold",
            fg || "#e8dfc4",
            null,
          );
          for (let i = 0; i < 50; i++) {
            ctx.fillStyle =
              "rgba(" +
              ((60 + r() * 50) | 0) +
              "," +
              ((40 + r() * 20) | 0) +
              ",20," +
              (0.4 + r() * 0.5) +
              ")";
            ctx.beginPath();
            ctx.arc(r() * w, r() * h, 1 + r() * 6, 0, TAU);
            ctx.fill();
          }
        }
      },
      { clamp: true },
    );
  };

  // -------------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------------
  // src = textures-module surface name (shared G.mats material); custom = our canvas; uv = metres per tile override
  const MAT_DEFS = {
    brick: { src: "brick_red", uv: 3 },
    brick_dark: { src: "brick_brown", uv: 3 },
    brick_tan: { src: "brick_tan", uv: 3 },
    limestone: { src: "stone_limestone", uv: 4 },
    granite: { src: "granite", uv: 3 },
    concrete: { src: "concrete", uv: 4 },
    concrete_dark: { src: "concrete_dark", uv: 4 },
    plaster: { custom: "plaster", uv: 3.5, rough: 0.9 },
    wallpaper: { src: "wallpaper", uv: 2 },
    tile_floor: { src: "tile_floor", uv: 2 },
    tile_white: { src: "tile_subway", uv: 1.2 },
    terrazzo: { src: "terrazzo", uv: 2 },
    marble: { src: "marble", uv: 3 },
    wood: { src: "wood_planks", uv: 2 },
    wood_dark: { src: "wood_planks", uv: 2, tint: 0x8a6a50 },
    rotten: { src: "wood_rotten", uv: 2 },
    crate: { src: "crate_wood", uv: 1 },
    metal: { src: "metal_painted", uv: 2 },
    panel: { src: "metal_panel", uv: 2 },
    diamond: { src: "metal_diamond", uv: 1 },
    scratched: { src: "metal_scratched", uv: 1 },
    rust: { src: "rust", uv: 2 },
    corrugated: { src: "corrugated", uv: 2 },
    copper: { src: "copper_patina", uv: 3 },
    bronze: { src: "bronze", uv: 2 },
    carpet: { src: "carpet", uv: 2 },
    fabric: { src: "fabric", uv: 0.8 },
    burlap: { src: "burlap", uv: 0.8 },
    canvas: { src: "burlap", uv: 1.2, tint: 0xc8bca0 },
    leather: { src: "leather", uv: 0.6 },
    cardboard: { src: "cardboard", uv: 0.8 },
    paper: { src: "paper", uv: 0.5 },
    bone: { src: "bone", uv: 0.5 },
    dirt: { src: "dirt", uv: 4 },
    rubble: { src: "rubble", uv: 4 },
    gravel: { src: "gravel", uv: 2 },
    roof: { src: "roof_tar", uv: 4 },
    sidewalk: { src: "sidewalk", uv: 3 },
    asphalt: { src: "asphalt", uv: 8 },
    glass: { src: "glass_dirty", uv: 2, rough: 0.3 },
    rubber: { src: "rubber", uv: 0.5 },
    cryotile: { src: "tile_cryo", uv: 2 },
    // painted metals (chipped paint over rust, from the textures module's paint_* family)
    navy: { src: "paint_grey", uv: 2 },
    navy_dark: { src: "paint_grey", uv: 2, tint: 0x70767c },
    hull_red: { src: "paint_red", uv: 2, tint: 0x9a5a50 },
    paint_teal: { src: "paint_teal", uv: 2 },
    paint_cream: { src: "paint_cream", uv: 2 },
    paint_green: { src: "paint_green", uv: 2 },
    paint_yellow: { src: "paint_yellow", uv: 2 },
    paint_red: { src: "paint_red", uv: 2 },
    paint_blue: { src: "paint_blue", uv: 2 },
    paint_black: { src: "paint_black", uv: 2 },
    paint_white: { src: "paint_white", uv: 2 },
    paint_olive: { src: "paint_olive", uv: 2 },
    iron: { src: "iron", uv: 2 },
    steel: { src: "steel", uv: 2 },
    chrome: { src: "chrome_dirty", uv: 1 },
    // custom canvases
    guastavino: { custom: "guastavino", uv: 3, rough: 0.8 },
    sugar: { custom: "sugar", uv: 2, rough: 0.95 },
    rawsugar: { custom: "rawsugar", uv: 2, rough: 0.95 },
    molasses: {
      custom: "molasses",
      uv: 3,
      rough: 0.22,
      metal: 0.05,
      emissive: 0x5a2a06,
      emissiveIntensity: 0.55,
      emissiveMapSelf: true,
    },
    navyplate: { custom: "navyplate", uv: 4, rough: 0.75, metal: 0.25 },
    hullgrey: { custom: "hullgrey", uv: 10, rough: 0.72, metal: 0.15 },
    hullred: { custom: "hullred", uv: 5, rough: 0.9 },
    hextile: { custom: "hextile", uv: 1.2, rough: 0.5 },
    lino: { custom: "lino", uv: 2.3, rough: 0.6 },
    ember: {
      color: 0xff8a3a,
      emissive: 0xff5a10,
      emissiveIntensity: 1.1,
      plain: true,
      noShadow: true,
    },
    redtile: { custom: "redtile", uv: 2.4, rough: 0.7 },
    daylight: {
      color: 0xc4ccb4,
      emissive: 0x9aa88e,
      emissiveIntensity: 0.85,
      rough: 0.3,
      plain: true,
      noShadow: true,
    },
    // plain / emissive (lamps are detected by atmosphere's interior fixture scan by name)
    lamp: {
      color: 0xffe0a8,
      emissive: 0xffd08a,
      emissiveIntensity: 2.2,
      plain: true,
      name: "ph_lamp_warm",
      noShadow: true,
    },
    lamp_cold: {
      color: 0xe0f0ff,
      emissive: 0xd8ecff,
      emissiveIntensity: 1.8,
      plain: true,
      name: "ph_lamp_cold_tube",
      noShadow: true,
    },
    lamp_red: {
      color: 0xff5040,
      emissive: 0xff2a1a,
      emissiveIntensity: 2.0,
      plain: true,
      name: "ph_lamp_red",
      noShadow: true,
    },
    lamp_green: {
      color: 0x80ff90,
      emissive: 0x40ff60,
      emissiveIntensity: 1.6,
      plain: true,
      name: "ph_lamp_green",
      noShadow: true,
    },
    fire: {
      color: 0xffa040,
      emissive: 0xff7a20,
      emissiveIntensity: 3.0,
      plain: true,
      noShadow: true,
    },
    screen: {
      color: 0x183a20,
      emissive: 0x3aff70,
      emissiveIntensity: 0.9,
      plain: true,
      noShadow: true,
    },
    goo: {
      color: 0x3a6a20,
      emissive: 0x6aff30,
      emissiveIntensity: 0.6,
      rough: 0.2,
      plain: true,
      noShadow: true,
    },
    syrup_hot: {
      color: 0x7a3a10,
      emissive: 0xff6a10,
      emissiveIntensity: 0.55,
      rough: 0.1,
      plain: true,
      noShadow: true,
    },
    black: { color: 0x0c0c0c, rough: 1, plain: true },
    shadow: { color: 0x050505, rough: 1, plain: true, noShadow: true },
    water: {
      color: 0x243222,
      emissive: 0x0e2008,
      emissiveIntensity: 0.4,
      rough: 0.1,
      metal: 0.3,
      plain: true,
      noShadow: true,
    },
    rope: { src: "burlap", uv: 0.3, tint: 0xa89070 },
    winlit: {
      color: 0xffc478,
      emissive: 0xffa04a,
      emissiveIntensity: 1.1,
      rough: 0.4,
      plain: true,
      glow: [0.04, 1.3],
      noShadow: true,
    },
    neon_yellow: {
      color: 0xffd24a,
      emissive: 0xffc21a,
      emissiveIntensity: 2.2,
      plain: true,
      glow: [0.35, 2.6],
      noShadow: true,
    },
    neon_dead: { color: 0x6a5a30, rough: 0.6, plain: true },
  };
  PH.MAT_DEFS = MAT_DEFS;
  const matCache = {};
  const NO_SHADOW = new Set();
  const baseKey = (k) =>
    k.length > 4 && k.slice(-4) === "@lit" ? k.slice(0, -4) : k;
  PH.baseKey = baseKey;
  const haveMats = () => {
    try {
      return !G.isStub("mats") && G.mats && typeof G.mats.get === "function";
    } catch (e) {
      return false;
    }
  };
  const texMeters = {};
  function metersFor(key) {
    if (texMeters[key] !== undefined) return texMeters[key];
    const d = MAT_DEFS[key];
    let m = d && d.uv ? d.uv : 4;
    return (texMeters[key] = m);
  }
  PH.mat = function (key) {
    if (matCache[key]) return matCache[key];
    if (baseKey(key) !== key)
      return (matCache[key] = makeBaked(PH.mat(baseKey(key)), key));
    if (key.indexOf("tex:") === 0) return PH.mat("concrete");
    const def = MAT_DEFS[key] || { src: "concrete" };
    let m = null;
    if (def.src && haveMats()) {
      try {
        const o = { vertexColors: true };
        if (def.tint !== undefined) o.color = def.tint;
        if (def.rough !== undefined) o.roughness = def.rough;
        if (def.metal !== undefined) o.metalness = def.metal;
        const base = G.mats.get(def.src, o);
        if (base && base.isMaterial) m = base;
      } catch (e) {
        m = null;
      }
    }
    if (!m) {
      const opts = {
        color: def.color !== undefined ? def.color : def.tint || 0x9a968c,
        roughness: def.rough === undefined ? 0.9 : def.rough,
        metalness: def.metal || 0,
        vertexColors: true,
      };
      if (def.custom && PH.customTex[def.custom]) {
        opts.map = PH.customTex[def.custom]();
        opts.color = 0xffffff;
      }
      if (def.emissive !== undefined) {
        opts.emissive = def.emissive;
        opts.emissiveIntensity = def.emissiveIntensity || 1;
        if (def.emissiveMapSelf && opts.map) {
          opts.emissive = 0xffffff;
          opts.emissiveMap = opts.map;
        }
      }
      m = new THREE.MeshStandardMaterial(opts);
      if (def.name) m.name = def.name;
      m.userData.shared = true;
      if (def.emissive !== undefined && haveMats() && G.mats.track) {
        try {
          G.mats.track(m, {
            glow: def.glow || [
              def.emissiveIntensity * 0.8,
              def.emissiveIntensity,
            ],
          });
        } catch (e) {
          /* optional */
        }
      }
    }
    if (def.noShadow) NO_SHADOW.add(key);
    return (matCache[key] = m);
  };
  /** Clone a material and add albedo × per-vertex `bake` (baked lamp light) to its emission. Chains existing hooks. */
  function makeBaked(base, key) {
    const m = base.clone();
    m.vertexColors = true;
    m.userData = Object.assign({}, base.userData, {
      shared: true,
      phBaked: true,
    });
    const prev = base.onBeforeCompile;
    const prevKey = base.customProgramCacheKey
      ? base.customProgramCacheKey.bind(base)
      : null;
    m.onBeforeCompile = function (sh, r) {
      if (
        typeof prev === "function" &&
        prev !== THREE.Material.prototype.onBeforeCompile
      ) {
        try {
          prev.call(this, sh, r);
        } catch (e) {
          /* keep ours */
        }
      }
      if (sh.vertexShader.indexOf("attribute vec3 bake;") < 0) {
        sh.vertexShader = sh.vertexShader
          .replace(
            "#include <common>",
            "#include <common>\nattribute vec3 bake;\nvarying vec3 vPhBake;",
          )
          .replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\nvPhBake = bake;",
          );
        sh.fragmentShader = sh.fragmentShader
          .replace(
            "#include <common>",
            "#include <common>\nvarying vec3 vPhBake;",
          )
          .replace(
            "#include <emissivemap_fragment>",
            "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vPhBake * 1.5;",
          );
      }
    };
    m.customProgramCacheKey = function () {
      return (prevKey ? prevKey() : "") + "|ph_baked1";
    };
    m.needsUpdate = true;
    return m;
  }
  /** Register a textured quad material (signs, banners). Returns the key. */
  PH.texMat = function (key, tex, opts) {
    opts = opts || {};
    const k = "tex:" + key;
    if (!matCache[k]) {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: opts.rough === undefined ? 0.85 : opts.rough,
        metalness: opts.metal || 0,
        side: opts.double ? THREE.DoubleSide : THREE.FrontSide,
        vertexColors: false,
      });
      if (opts.emissive) {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = tex;
        m.emissiveIntensity = opts.emissive;
        if (opts.name) m.name = opts.name;
      }
      if (opts.transparent) {
        m.transparent = true;
        m.alphaTest = 0.4;
        m.depthWrite = true;
      }
      if (opts.color !== undefined) m.color = new THREE.Color(opts.color);
      m.userData.shared = true;
      m.userData.keepUV = true;
      if (opts.emissive && haveMats() && G.mats.track) {
        try {
          G.mats.track(m, {
            glow: opts.glow || [opts.emissive * 0.4, opts.emissive],
          });
        } catch (e) {
          /* optional */
        }
      }
      matCache[k] = m;
      NO_SHADOW.add(k);
    }
    return k;
  };
  /** A material from the textures module used as-is (billboards, neon, signs). */
  PH.extMat = function (key, make) {
    const k = "tex:" + key;
    if (matCache[k]) return k;
    let m = null;
    try {
      if (haveMats()) m = make();
    } catch (e) {
      m = null;
    }
    if (!m || !m.isMaterial) return null;
    matCache[k] = m;
    NO_SHADOW.add(k);
    return k;
  };
  PH.brandMat = (brand) =>
    PH.extMat("brand_" + brand, () =>
      G.mats.billboard(brand, 0, { lit: true }),
    ) ||
    PH.texMat(
      "brandfb_" + brand,
      PH.signTex(
        "brand_" + brand,
        [brand.replace(/_/g, " ").toUpperCase()],
        "enamel",
        512,
        256,
        { bg: "#7a2520" },
      ),
    );
  /** Sign material: textures-module sign if present, else our canvas. */
  PH.signMat = function (key, lines, style, w, h, extra) {
    return PH.texMat(
      "sign_" + key,
      PH.signTex(key, lines, style, w, h, extra),
      extra && extra.emissive ? { emissive: extra.emissive } : {},
    );
  };

  // -------------------------------------------------------------------
  // Batch: collect geometry per material, UV + vertex colour + bake, merge
  // -------------------------------------------------------------------
  function Batch(name) {
    this.name = name;
    this.parts = new Map();
    this.M = null;
    this.ground = 0;
    this.aoH = 3.0;
    this.grime = 0.5;
    this.tris = 0;
    this.lights = null;
    this.ambient = null;
  }
  PH.batch = (name) => new Batch(name);
  Batch.prototype.frame = function (m) {
    this.M = m || null;
    return this;
  };
  Batch.prototype.setLights = function (lights, ambient, ambI) {
    const M = this.M;
    this.lights = (lights || []).map((l) => ({
      p: M
        ? new THREE.Vector3(l.x, l.y, l.z).applyMatrix4(M)
        : new THREE.Vector3(l.x, l.y, l.z),
      c: new THREE.Color(l.color === undefined ? 0xffd8a0 : l.color),
      r: l.r || 12,
      i: l.i === undefined ? 1 : l.i,
    }));
    this.ambient =
      ambient === undefined
        ? null
        : new THREE.Color(ambient).multiplyScalar(
            ambI === undefined ? 1 : ambI,
          );
    return this;
  };
  Batch.prototype.addLight = function (x, y, z, color, r, i) {
    if (!this.lights) this.lights = [];
    this.lights.push({
      p: this.M
        ? new THREE.Vector3(x, y, z).applyMatrix4(this.M)
        : new THREE.Vector3(x, y, z),
      c: new THREE.Color(color === undefined ? 0xffd8a0 : color),
      r: r || 10,
      i: i === undefined ? 1 : i,
    });
  };
  const emissiveKey = (key) => {
    const d = MAT_DEFS[baseKey(key)];
    return !!(d && d.emissive !== undefined);
  };
  Batch.prototype.add = function (key, geom, opts) {
    opts = opts || {};
    let g = geom;
    if (g.index) g = g.toNonIndexed();
    if (opts.m) g.applyMatrix4(opts.m);
    if (this.M) g.applyMatrix4(this.M);
    if (!g.attributes.normal) g.computeVertexNormals();
    const keep = key.indexOf("tex:") === 0;
    shade(g, opts, this, keep ? 1 : metersFor(key), keep);
    if ((this.lights || this.ambient) && !keep && !emissiveKey(key)) {
      bake(g, this);
      key = key + "@lit";
    }
    let arr = this.parts.get(key);
    if (!arr) {
      arr = [];
      this.parts.set(key, arr);
    }
    arr.push(g);
    this.tris += g.attributes.position.count / 3;
    return g;
  };
  function bake(g, batch) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    const out = new Float32Array(cnt * 3);
    const amb = batch.ambient,
      L = batch.lights || [];
    for (let i = 0; i < cnt; i++) {
      let r = amb ? amb.r : 0,
        gg = amb ? amb.g : 0,
        b = amb ? amb.b : 0;
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i),
        nx = n.getX(i),
        ny = n.getY(i),
        nz = n.getZ(i);
      for (let k = 0; k < L.length; k++) {
        const l = L[k];
        const dx = l.p.x - x,
          dy = l.p.y - y,
          dz = l.p.z - z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > l.r * l.r) continue;
        const d = Math.sqrt(d2) || 1e-3;
        const f = 1 - d / l.r,
          att = f * f * l.i;
        const ndl = (nx * dx + ny * dy + nz * dz) / d;
        const w = att * (0.22 + 0.78 * Math.max(0, ndl));
        r += l.c.r * w;
        gg += l.c.g * w;
        b += l.c.b * w;
      }
      out[i * 3] = Math.min(1.5, r);
      out[i * 3 + 1] = Math.min(1.5, gg);
      out[i * 3 + 2] = Math.min(1.5, b);
    }
    g.setAttribute("bake", new THREE.BufferAttribute(out, 3));
  }
  const GRIME = new THREE.Color(0x2a2218);
  function shade(g, opts, batch, meters, keep) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    if (!keep && opts.uv !== "keep") {
      const s = 1 / (opts.uvScale || meters || 4);
      const arr = new Float32Array(cnt * 2);
      for (let i = 0; i < cnt; i++) {
        const nx = Math.abs(n.getX(i)),
          ny = Math.abs(n.getY(i)),
          nz = Math.abs(n.getZ(i));
        const x = p.getX(i),
          y = p.getY(i),
          z = p.getZ(i);
        let u, v;
        if (ny >= nx && ny >= nz) {
          u = x;
          v = z;
        } else if (nx >= nz) {
          u = z;
          v = y;
        } else {
          u = x;
          v = y;
        }
        arr[i * 2] = u * s;
        arr[i * 2 + 1] = v * s;
      }
      g.setAttribute("uv", new THREE.BufferAttribute(arr, 2));
    } else if (!g.attributes.uv)
      g.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array(cnt * 2), 2),
      );
    else if (opts.uvRect) {
      const R = opts.uvRect,
        uv = g.attributes.uv;
      for (let i = 0; i < cnt; i++)
        uv.setXY(
          i,
          R[0] + uv.getX(i) * (R[2] - R[0]),
          R[1] + uv.getY(i) * (R[3] - R[1]),
        );
    }
    const col = new Float32Array(cnt * 3);
    const tint = new THREE.Color(opts.c === undefined ? 0xffffff : opts.c);
    const grime =
      opts.grime === undefined ? (keep ? 0.1 : batch.grime) : opts.grime;
    const ground = opts.ground === undefined ? batch.ground : opts.ground;
    const aoH = opts.aoH || batch.aoH;
    for (let i = 0; i < cnt; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      let k = 1;
      if (!opts.noAO) k *= 0.6 + 0.4 * PH.smooth(-0.2, aoH, y - ground);
      let gr = 0;
      if (grime > 0) {
        const blot = U.fbm2(x * 0.11 + z * 0.05 + 3.1, y * 0.13 + z * 0.09, 3);
        const streak = U.noise2((x + z) * 0.9, y * 0.02 + 7.3);
        gr =
          grime *
          (Math.max(0, blot - 0.42) * 1.3 + Math.max(0, streak - 0.55) * 0.9);
        if (n.getY(i) > 0.7) gr += grime * 0.22;
        gr = Math.min(0.85, gr);
        k *=
          0.9 +
          0.2 * U.hash2(Math.floor(x * 2.3), Math.floor(z * 2.3 + y * 1.7));
      }
      col[i * 3] = tint.r * k * (1 - gr) + GRIME.r * gr * k;
      col[i * 3 + 1] = tint.g * k * (1 - gr) + GRIME.g * gr * k;
      col[i * 3 + 2] = tint.b * k * (1 - gr) + GRIME.b * gr * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  const segs = (v, len, cap) =>
    Math.max(1, Math.min(cap || 8, Math.ceil(v / len)));
  /** Box by bottom-centre (cx, y0, cz), size w h d; opts.ry/rx/rz rotate about the box centre. */
  Batch.prototype.box = function (key, cx, y0, cz, w, h, d, opts) {
    opts = opts || {};
    const sl = opts.segLen || 5;
    const geo = new THREE.BoxGeometry(
      w,
      h,
      d,
      opts.seg === false ? 1 : segs(w, sl),
      opts.seg === false ? 1 : segs(h, sl),
      opts.seg === false ? 1 : segs(d, sl),
    );
    const m = PH.m4(cx, y0 + h / 2, cz, opts.ry, opts.rx, opts.rz);
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  Batch.prototype.boxMM = function (key, x0, y0, z0, x1, y1, z1, opts) {
    return this.box(
      key,
      (x0 + x1) / 2,
      y0,
      (z0 + z1) / 2,
      Math.abs(x1 - x0),
      y1 - y0,
      Math.abs(z1 - z0),
      opts,
    );
  };
  Batch.prototype.cyl = function (key, x, y0, z, rTop, rBot, h, seg, opts) {
    opts = opts || {};
    const geo = new THREE.CylinderGeometry(
      rTop,
      rBot,
      h,
      seg || 12,
      opts.hSeg || segs(h, 5),
      !!opts.open,
      opts.thetaStart || 0,
      opts.thetaLen || TAU,
    );
    // upright: y0 = base; laid on its side (|rx| or |rz| > 0.7): y0 = axis height
    const horiz = Math.abs(opts.rx || 0) > 0.7 || Math.abs(opts.rz || 0) > 0.7;
    const m = PH.m4(
      x,
      horiz ? y0 : y0 + h / 2,
      z,
      opts.ry,
      opts.rx,
      opts.rz,
      opts.sx,
      1,
      opts.sz === undefined ? opts.sx : opts.sz,
    );
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Cylinder between two points. */
  Batch.prototype.rod = function (key, a, b, r, seg, opts) {
    opts = opts || {};
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    if (len < 1e-4) return null;
    const geo = new THREE.CylinderGeometry(
      opts.r2 === undefined ? r : opts.r2,
      r,
      len,
      seg || 6,
      1,
      !!opts.open,
    );
    geo.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    const m = new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1));
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Square beam between two points. */
  Batch.prototype.beam = function (key, a, b, w, h, opts) {
    opts = opts || {};
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    if (len < 1e-4) return null;
    const geo = new THREE.BoxGeometry(w, len, h === undefined ? w : h);
    geo.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    const m = new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1));
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  Batch.prototype.sphere = function (key, x, y, z, r, opts) {
    opts = opts || {};
    const geo = new THREE.SphereGeometry(
      r,
      opts.ws || 12,
      opts.hs || 8,
      0,
      TAU,
      opts.phiStart || 0,
      opts.phiLen || Math.PI,
    );
    const m = PH.m4(
      x,
      y,
      z,
      opts.ry,
      opts.rx,
      opts.rz,
      opts.sx || 1,
      opts.sy || opts.sx || 1,
      opts.sz || opts.sx || 1,
    );
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Lathe from [[r,y],...] profile. */
  Batch.prototype.lathe = function (key, prof, seg, x, y, z, opts) {
    opts = opts || {};
    const pts = prof.map(
      (p) => new THREE.Vector2(Math.max(0.0001, p[0]), p[1]),
    );
    const geo = new THREE.LatheGeometry(
      pts,
      seg || 16,
      opts.phiStart || 0,
      opts.phiLen || TAU,
    );
    const m = PH.m4(
      x,
      y,
      z,
      opts.ry,
      opts.rx,
      opts.rz,
      opts.sx || 1,
      opts.sy || 1,
      opts.sz || opts.sx || 1,
    );
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Extrude a THREE.Shape (XY) by depth along +Z; place with opts.m. */
  Batch.prototype.extrude = function (key, shape, depth, opts) {
    opts = opts || {};
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: opts.curveSegments || 10,
    });
    return this.add(key, geo, opts);
  };
  /** Textured quad (uv 0..1), centre (x,y,z), faces direction ry (0 → +Z). */
  Batch.prototype.quad = function (key, x, y, z, w, h, opts) {
    opts = opts || {};
    const geo = new THREE.PlaneGeometry(w, h, 1, 1);
    const m = PH.m4(x, y, z, opts.ry, opts.rx, opts.rz);
    if (opts.m) m.premultiply(opts.m);
    return this.add(
      key,
      geo,
      Object.assign({ uv: "keep", grime: 0.1, noAO: true }, opts, { m }),
    );
  };
  Batch.prototype.geo = function (key, geo, m, opts) {
    return this.add(key, geo, Object.assign({}, opts || {}, { m }));
  };
  /** Irregular rock / rubble / heap chunk (displaced icosahedron). */
  Batch.prototype.rock = function (key, x, y, z, r, opts) {
    opts = opts || {};
    const geo = new THREE.IcosahedronGeometry(
      r,
      opts.detail === undefined ? 1 : opts.detail,
    );
    const p = geo.attributes.position,
      seed = opts.seed || x * 13.1 + z * 7.7;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i),
        vy = p.getY(i),
        vz = p.getZ(i);
      const n =
        U.fbm2((vx * 1.2) / r + seed, (vz * 1.2) / r + (vy * 0.5) / r) - 0.5;
      const k = 1 + n * (opts.rough === undefined ? 0.5 : opts.rough);
      p.setXYZ(i, vx * k, vy * k * (opts.flat || 1), vz * k);
    }
    geo.computeVertexNormals();
    const m = PH.m4(
      x,
      y,
      z,
      opts.ry || seed % 6,
      0,
      0,
      opts.sx || 1,
      opts.sy || 1,
      opts.sz || 1,
    );
    return this.add(key, geo, Object.assign({ grime: 0.4 }, opts, { m }));
  };
  /** Heap / mound (flattened hemisphere with noise): sugar piles, rubble drifts. */
  Batch.prototype.mound = function (key, x, y, z, rx, h, rz, opts) {
    opts = opts || {};
    const geo = new THREE.SphereGeometry(
      1,
      opts.ws || 18,
      opts.hs || 8,
      0,
      TAU,
      0,
      Math.PI / 2,
    );
    const p = geo.attributes.position,
      seed = opts.seed || x * 3.1 + z * 1.7;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i),
        vy = p.getY(i),
        vz = p.getZ(i);
      const n = U.fbm2(vx * 2 + seed, vz * 2 - seed) - 0.5;
      const sl = Math.pow(vy, opts.peak || 0.8);
      p.setXYZ(i, vx * (1 + n * 0.25), sl * (1 + n * 0.3), vz * (1 + n * 0.25));
    }
    geo.computeVertexNormals();
    return this.add(
      key,
      geo,
      Object.assign({ grime: 0.3 }, opts, {
        m: PH.m4(x, y, z, opts.ry || 0, 0, 0, rx, h, rz),
      }),
    );
  };

  const DETAIL_LOD = new Set([
    "bone",
    "rubber",
    "chrome",
    "fabric",
    "burlap",
    "paper",
    "cardboard",
    "rope",
    "leather",
    "crate",
    "screen",
    "lamp",
    "lamp_cold",
    "lamp_red",
    "lamp_green",
    "fire",
  ]);
  /** Merge the collected parts into meshes under parent. opts: {noLOD, lodDist, interior (no LOD: root visibility handles it)} */
  Batch.prototype.build = function (parent, opts) {
    opts = opts || {};
    const group = new THREE.Group();
    group.name = "ph_" + this.name;
    for (const [key, arr] of this.parts) {
      if (!arr.length) continue;
      let chunk = [],
        count = 0;
      const flush = () => {
        if (!chunk.length) return;
        const geo = mergeAll(chunk);
        for (const g of chunk) g.dispose();
        const mesh = new THREE.Mesh(geo, PH.mat(key));
        mesh.name = this.name + ":" + key;
        const bk = baseKey(key);
        mesh.castShadow =
          !opts.interior &&
          !NO_SHADOW.has(bk) &&
          !NO_SHADOW.has(key) &&
          opts.castShadow !== false &&
          !DETAIL_LOD.has(bk);
        mesh.receiveShadow = !opts.interior;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        group.add(mesh);
        if (!opts.noLOD && !opts.interior) {
          try {
            if (!geo.boundingSphere) geo.computeBoundingSphere();
            const bs = geo.boundingSphere,
              triN = geo.attributes.position.count / 3;
            let d = 0;
            if (DETAIL_LOD.has(bk) || opts.lodAll)
              d = (opts.lodDist || 170) + bs.radius;
            else if (
              triN < 1500 &&
              bs.radius < 40 &&
              !emissiveKey(bk) &&
              key.indexOf("tex:") !== 0
            )
              d = 260 + bs.radius;
            if (d > 0) G.world.addLOD(mesh, d, bs.center.clone());
          } catch (e) {
            /* core missing */
          }
        }
        chunk = [];
        count = 0;
      };
      for (const g of arr) {
        chunk.push(g);
        count += g.attributes.position.count;
        if (count > 400000) flush();
      }
      flush();
    }
    this.parts.clear();
    if (parent) parent.add(group);
    return group;
  };
  /** Merge non-indexed geometries keeping every shared attribute (incl. our `bake`). */
  function mergeAll(geoms) {
    geoms = geoms.filter(Boolean);
    const names = Object.keys(geoms[0].attributes).filter((n) =>
      geoms.every(
        (g) =>
          g.attributes[n] &&
          g.attributes[n].itemSize === geoms[0].attributes[n].itemSize,
      ),
    );
    let count = 0;
    for (const g of geoms) count += g.attributes.position.count;
    const out = new THREE.BufferGeometry();
    for (const n of names) {
      const size = geoms[0].attributes[n].itemSize,
        arr = new Float32Array(count * size);
      let o = 0;
      for (const g of geoms) {
        const src = g.attributes[n].array;
        if (src.length === g.attributes.position.count * size) arr.set(src, o);
        o += g.attributes.position.count * size;
      }
      out.setAttribute(n, new THREE.BufferAttribute(arr, size));
    }
    out.computeBoundingSphere();
    out.computeBoundingBox();
    return out;
  }
  PH.mergeAll = mergeAll;
  /** Turn a geometry inside-out (non-indexed copy, reversed winding, negated normals) — for vaults seen from below. */
  PH.flip = function (geo) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (!g.attributes.normal) g.computeVertexNormals();
    for (const name of Object.keys(g.attributes)) {
      const a = g.attributes[name],
        sz = a.itemSize,
        arr = a.array;
      for (let t = 0; t < a.count; t += 3)
        for (let k = 0; k < sz; k++) {
          const i1 = (t + 1) * sz + k,
            i2 = (t + 2) * sz + k;
          const tmp = arr[i1];
          arr[i1] = arr[i2];
          arr[i2] = tmp;
        }
    }
    const n = g.attributes.normal.array;
    for (let i = 0; i < n.length; i++) n[i] = -n[i];
    return g;
  };

  // -------------------------------------------------------------------
  // Colliders (yaw convention of core detected once)
  // -------------------------------------------------------------------
  let YAW_SIGN = null;
  function yawSign() {
    if (YAW_SIGN !== null) return YAW_SIGN;
    YAW_SIGN = -1;
    try {
      const W = G.world;
      const a = 0.5;
      const probe = {
        cx: 0,
        cz: 0,
        hx: 1,
        hz: 0.05,
        cos: Math.cos(-a),
        sin: Math.sin(-a),
      };
      const px = Math.cos(a) * 0.9,
        pz = -Math.sin(a) * 0.9;
      const inPos = W.pointInCollider(probe, px, pz, 0);
      probe.cos = Math.cos(a);
      probe.sin = Math.sin(a);
      const inNeg = W.pointInCollider(probe, px, pz, 0);
      if (inPos && !inNeg) YAW_SIGN = 1;
      else if (inNeg && !inPos) YAW_SIGN = -1;
    } catch (e) {
      /* keep default */
    }
    return YAW_SIGN;
  }
  PH.colliders = [];
  /**
   * Local build origin: while set (interior cells), colliders / wv() / anchors add this offset,
   * and batches should use b.frame(PH.originMatrix()).
   */
  PH.ofs = { x: 0, z: 0 };
  PH.setOrigin = (x, z) => {
    PH.ofs = { x: x || 0, z: z || 0 };
  };
  PH.originMatrix = () => PH.m4(PH.ofs.x, 0, PH.ofs.z);
  PH.wv = (x, y, z) => new THREE.Vector3(x + PH.ofs.x, y, z + PH.ofs.z);
  PH.A = (x, y, z, yaw) => PH.anchor(x + PH.ofs.x, y, z + PH.ofs.z, yaw);
  /** Box collider centre (cx,cz), size w (local X) × d (local Z), y0..y1, rotated like THREE rotation.y = ry. */
  PH.col = function (cx, cz, w, d, y0, y1, ry, opts) {
    opts = opts || {};
    try {
      const c = G.world.addCollider(
        cx + PH.ofs.x,
        cz + PH.ofs.z,
        w,
        d,
        y0,
        y1,
        (ry || 0) * yawSign(),
        {
          tag: opts.tag || "poi_harbor",
          walkable: opts.walkable !== false,
          surface: opts.surface || "concrete",
        },
      );
      PH.colliders.push(c);
      return c;
    } catch (e) {
      return null;
    }
  };
  PH.colMM = (x0, y0, z0, x1, y1, z1, opts) =>
    PH.col(
      (x0 + x1) / 2,
      (z0 + z1) / 2,
      Math.abs(x1 - x0),
      Math.abs(z1 - z0),
      y0,
      y1,
      0,
      opts,
    );
  /** Wall collider between two XZ points (thickness t), not walkable by default. */
  PH.colWall = function (x0, z0, x1, z1, t, y0, y1, opts) {
    const dx = x1 - x0,
      dz = z1 - z0,
      len = Math.hypot(dx, dz);
    if (len < 0.01) return null;
    return PH.col(
      (x0 + x1) / 2,
      (z0 + z1) / 2,
      len,
      t,
      y0,
      y1,
      Math.atan2(-dz, dx),
      Object.assign({ walkable: false }, opts || {}),
    );
  };

  // -------------------------------------------------------------------
  // Architecture helpers
  // -------------------------------------------------------------------
  /**
   * Straight flight of stairs climbing along local +Z (rotated ry) from (x,z,y0) to y1 over `run`.
   * Step colliders ≤ maxRise (0.3). opts: {rails:key, cheeks:key, solid:true, base, surface, c}
   */
  PH.stairs = function (b, key, x, z, ry, width, run, y0, y1, opts) {
    opts = opts || {};
    const rise = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.abs(rise) / (opts.maxRise || 0.3)));
    const stepRun = run / n,
      stepH = rise / n;
    for (let i = 0; i < n; i++) {
      const top = y0 + stepH * (i + 1);
      const base =
        opts.solid === false
          ? top - 0.22
          : opts.base === undefined
            ? y0 - 0.05
            : opts.base;
      const [wx, wz] = PH.rot(x, z, ry, 0, stepRun * (i + 0.5));
      b.box(key, wx, base, wz, width, top - base, stepRun + 0.02, {
        ry,
        seg: false,
        grime: opts.grime,
        c: opts.c,
      });
      PH.col(wx, wz, width, stepRun + 0.02, base, top, ry, {
        surface: opts.surface || "concrete",
      });
    }
    if (opts.solid === false) {
      // stringers under open steel stairs
      for (const s of [-1, 1]) {
        const [ax, az] = PH.rot(x, z, ry, s * (width / 2 - 0.05), 0),
          [bx, bz] = PH.rot(x, z, ry, s * (width / 2 - 0.05), run);
        b.beam(
          opts.stringer || key,
          PH.v3(ax, y0 - 0.25, az),
          PH.v3(bx, y1 - 0.25, bz),
          0.1,
          0.3,
        );
      }
    }
    if (opts.rails) {
      for (const s of opts.railSides || [-1, 1]) {
        const [ax, az] = PH.rot(x, z, ry, s * (width / 2 - 0.04), 0),
          [bx, bz] = PH.rot(x, z, ry, s * (width / 2 - 0.04), run);
        b.rod(
          opts.rails,
          PH.v3(ax, y0 + 0.95, az),
          PH.v3(bx, y1 + 0.95, bz),
          0.035,
          6,
        );
        for (let k = 0; k <= n; k += 3) {
          const t = k / n;
          const px = ax + (bx - ax) * t,
            pz = az + (bz - az) * t,
            py = y0 + rise * t;
          b.rod(
            opts.rails,
            PH.v3(px, py, pz),
            PH.v3(px, py + 0.95, pz),
            0.025,
            5,
          );
        }
      }
    }
    return n;
  };
  /**
   * Room shell: floor, optional ceiling, 4 walls with door gaps, colliders.
   * r = {x0,z0,x1,z1,y,h, wall, wall2 (inner face override), floor, ceil, t (wall thickness), doors:[{side:'n'|'s'|'e'|'w', at (0..1 or abs coord via abs:true), w, h}],
   *      noWalls:{n,s,e,w}, noFloor, noCeil, base (skirting key), trim (cornice key)}
   * Walls are built OUTSIDE-in: centred on the room edge.
   */
  PH.room = function (b, r) {
    const t = r.t || 0.3,
      y = r.y || 0,
      h = r.h || 3.2;
    if (!r.noFloor) {
      b.boxMM(r.floor || "concrete", r.x0, y - 0.3, r.z0, r.x1, y, r.z1, {
        grime: r.floorGrime === undefined ? 0.4 : r.floorGrime,
      });
      PH.colMM(r.x0, y - 0.3, r.z0, r.x1, y, r.z1, {
        surface: r.surface || "concrete",
      });
    }
    if (!r.noCeil) {
      b.boxMM(r.ceil || "plaster", r.x0, y + h, r.z0, r.x1, y + h + 0.3, r.z1, {
        grime: 0.5,
      });
      PH.colMM(r.x0, y + h, r.z0, r.x1, y + h + 0.3, r.z1, {
        walkable: r.ceilWalkable !== false,
      });
    }
    const sides = {
      n: [r.x0, r.z0, r.x1, r.z0],
      s: [r.x0, r.z1, r.x1, r.z1],
      w: [r.x0, r.z0, r.x0, r.z1],
      e: [r.x1, r.z0, r.x1, r.z1],
    };
    for (const s of ["n", "s", "w", "e"]) {
      if (r.noWalls && r.noWalls[s]) continue;
      const [ax, az, bx, bz] = sides[s];
      const horiz = az === bz;
      const len = horiz ? bx - ax : bz - az;
      const gaps = (r.doors || [])
        .filter((d) => d.side === s)
        .map((d) => {
          const c = d.abs ? (horiz ? d.at - ax : d.at - az) : d.at * len;
          return [c - d.w / 2, c + d.w / 2, d.h || 2.4];
        })
        .sort((p, q) => p[0] - q[0]);
      let cur = -t / 2;
      const seg = (u0, u1, yb, yt) => {
        if (u1 - u0 < 0.01 || yt - yb < 0.01) return;
        const cx = horiz ? ax + (u0 + u1) / 2 : ax,
          cz = horiz ? az : az + (u0 + u1) / 2;
        const w = horiz ? u1 - u0 : t,
          d = horiz ? t : u1 - u0;
        b.box(r.wall || "plaster", cx, yb, cz, w, yt - yb, d, {
          grime: r.wallGrime,
        });
        PH.col(cx, cz, w, d, yb, yt, 0, { walkable: false });
      };
      for (const gp of gaps) {
        seg(cur, gp[0], y, y + h);
        seg(gp[0], gp[1], y + gp[2], y + h); // lintel
        cur = gp[1];
      }
      seg(cur, len + t / 2, y, y + h);
      if (r.base) {
        // skirting board inside
        const inward = { n: [0, 1], s: [0, -1], w: [1, 0], e: [-1, 0] }[s];
        let c2 = 0;
        const sk = (u0, u1) => {
          if (u1 - u0 < 0.05) return;
          const cx = horiz
              ? ax + (u0 + u1) / 2
              : ax + inward[0] * (t / 2 + 0.02),
            cz = horiz ? az + inward[1] * (t / 2 + 0.02) : az + (u0 + u1) / 2;
          b.box(
            r.base,
            cx,
            y,
            cz,
            horiz ? u1 - u0 : 0.05,
            0.22,
            horiz ? 0.05 : u1 - u0,
            { seg: false, grime: 0.6 },
          );
        };
        for (const gp of gaps) {
          sk(c2, gp[0]);
          c2 = gp[1];
        }
        sk(c2, len);
      }
    }
  };
  /**
   * Straight wall centred on the line (x0,z0)→(x1,z1), thickness t, y0..y1, with openings.
   * gaps: [{c: distance along the wall from (x0,z0), w, b: bottom offset above y0 (0 = door), h}]
   * opts: {t, grime, c, wainscot:{key,h} (inner cladding both faces), noCol}
   */
  PH.wall = function (b, key, x0, z0, x1, z1, y0, y1, gaps, opts) {
    opts = opts || {};
    const t = opts.t || 0.3;
    const len = Math.hypot(x1 - x0, z1 - z0);
    if (len < 0.01) return;
    const ux = (x1 - x0) / len,
      uz = (z1 - z0) / len,
      ry = Math.atan2(-uz, ux);
    const seg = (u0, u1, ya, yb) => {
      if (u1 - u0 < 0.02 || yb - ya < 0.02) return;
      const cx = x0 + (ux * (u0 + u1)) / 2,
        cz = z0 + (uz * (u0 + u1)) / 2;
      b.box(key, cx, ya, cz, u1 - u0, yb - ya, t, {
        ry,
        grime: opts.grime,
        c: opts.c,
      });
      if (opts.wainscot && ya < y0 + opts.wainscot.h) {
        const top = Math.min(yb, y0 + opts.wainscot.h);
        b.box(opts.wainscot.key, cx, ya, cz, u1 - u0, top - ya, t + 0.06, {
          ry,
          grime: 0.35,
          seg: false,
        });
      }
      if (!opts.noCol)
        PH.col(cx, cz, u1 - u0, t, ya, yb, ry, { walkable: false });
    };
    const gs = (gaps || []).slice().sort((p, q) => p.c - q.c);
    let cur = -(opts.ext === undefined ? t / 2 : opts.ext);
    for (const g of gs) {
      const a = g.c - g.w / 2,
        e = g.c + g.w / 2,
        gb = y0 + (g.b || 0),
        gt = gb + (g.h || 2.4);
      seg(cur, a, y0, y1);
      seg(a, e, y0, gb);
      seg(a, e, gt, y1);
      cur = e;
    }
    seg(cur, len + (opts.ext === undefined ? t / 2 : opts.ext), y0, y1);
  };
  /**
   * Fill the ground-level void around an interior's rooms with solid (non-walkable) colliders so that
   * generic spawners (combat's interior fallback) can never place actors outside the rooms.
   * Local coords (current origin). rooms: [[x0,z0,x1,z1]], circles: [[x,z,r]]. Run-length boxes per row.
   */
  PH.fillVoid = function (x0, z0, x1, z1, rooms, circles, step, yTop) {
    step = step || 2;
    yTop = yTop || 3.2;
    const pad = 0.4;
    const inside = (x, z) =>
      rooms.some(
        (r) =>
          x > r[0] - pad && x < r[2] + pad && z > r[1] - pad && z < r[3] + pad,
      ) ||
      (circles || []).some((c) => Math.hypot(x - c[0], z - c[1]) < c[2] + pad);
    const cellFree = (cx, cz) => {
      const h = step / 2;
      return (
        !inside(cx - h, cz - h) &&
        !inside(cx + h, cz - h) &&
        !inside(cx - h, cz + h) &&
        !inside(cx + h, cz + h) &&
        !inside(cx, cz)
      );
    };
    let n = 0;
    for (let z = z0 + step / 2; z < z1; z += step) {
      let start = null;
      for (let x = x0 + step / 2; x <= x1 + step; x += step) {
        const free = x < x1 && cellFree(x, z);
        if (free && start === null) start = x;
        if (!free && start !== null) {
          const a = start - step / 2,
            e = x - step / 2;
          PH.colMM(a, 0, z - step / 2, e, yTop, z + step / 2, {
            walkable: false,
            tag: "poi_harbor_void",
          });
          n++;
          start = null;
        }
      }
    }
    return n;
  };
  /** Floor slab rectangle with collider (top at y). */
  PH.slab = function (b, key, x0, z0, x1, z1, y, th, opts) {
    th = th || 0.3;
    b.boxMM(key, x0, y - th, z0, x1, y, z1, opts || { grime: 0.4 });
    PH.colMM(x0, y - th, z0, x1, y, z1, {
      surface: (opts && opts.surface) || "concrete",
    });
  };
  /** Railing along a polyline (pts [[x,z],...]) at floor y. key: material. Collider 1.1 m. */
  PH.railing = function (b, pts, y, h, key, opts) {
    opts = opts || {};
    h = h || 1.0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i],
        [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 0.05) continue;
      b.rod(
        key,
        PH.v3(ax, y + h, az),
        PH.v3(bx, y + h, bz),
        opts.r || 0.035,
        6,
      );
      b.rod(
        key,
        PH.v3(ax, y + h * 0.5, az),
        PH.v3(bx, y + h * 0.5, bz),
        (opts.r || 0.035) * 0.7,
        5,
      );
      const n = Math.max(1, Math.round(len / (opts.postStep || 1.5)));
      for (let k = 0; k <= n; k++) {
        const t2 = k / n;
        const px = ax + (bx - ax) * t2,
          pz = az + (bz - az) * t2;
        b.rod(
          key,
          PH.v3(px, y, pz),
          PH.v3(px, y + h, pz),
          (opts.r || 0.035) * 0.9,
          5,
        );
      }
      if (opts.collide !== false)
        PH.colWall(ax, az, bx, bz, 0.2, y, y + Math.max(1.15, h + 0.1));
    }
  };
  /** Hanging lamp: cord + shade + emissive bulb (atmosphere's interior scan turns these into light pools). */
  PH.hangLamp = function (b, x, y, z, drop, opts) {
    opts = opts || {};
    b.rod(
      opts.cord || "black",
      PH.v3(x, y, z),
      PH.v3(x, y - drop, z),
      0.012,
      4,
    );
    b.lathe(
      opts.shade || "metal",
      [
        [0.05, 0],
        [0.12, -0.05],
        [0.28, -0.22],
        [0.3, -0.25],
      ],
      12,
      x,
      y - drop,
      z,
      { grime: 0.3 },
    );
    b.sphere(opts.bulb || "lamp", x, y - drop - 0.17, z, 0.1, {
      ws: 8,
      hs: 6,
      noAO: true,
    });
    if (b.lights || opts.bake)
      b.addLight(
        x,
        y - drop - 0.4,
        z,
        opts.color === undefined ? 0xffcf8a : opts.color,
        opts.r || 9,
        opts.i || 0.9,
      );
  };
  /** Wall-mounted caged bulb. ry = direction the wall faces (THREE ry). */
  PH.cageLamp = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const [fx, fz] = PH.rot(0, 0, ry, 0, 0.14);
    b.box("metal", x, y - 0.08, z, 0.16, 0.16, 0.06, { ry, seg: false });
    b.sphere(opts.bulb || "lamp", x + fx, y, z + fz, 0.07, {
      ws: 8,
      hs: 6,
      noAO: true,
    });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU;
      b.rod(
        "iron",
        PH.v3(
          x + fx + Math.cos(a) * 0.09,
          y - 0.1,
          z + fz + Math.sin(a) * 0.09,
        ),
        PH.v3(
          x + fx + Math.cos(a) * 0.09,
          y + 0.1,
          z + fz + Math.sin(a) * 0.09,
        ),
        0.008,
        3,
      );
    }
    if (b.lights)
      b.addLight(
        x + fx * 3,
        y,
        z + fz * 3,
        opts.color === undefined ? 0xffd090 : opts.color,
        opts.r || 7,
        opts.i || 0.8,
      );
  };
  /** Fluorescent tube fixture. */
  PH.tubeLamp = function (b, x, y, z, len, ry, opts) {
    opts = opts || {};
    b.box("metal", x, y - 0.06, z, 0.24, 0.06, len, { ry, seg: false });
    if (opts.dead)
      b.box("paint_white", x, y - 0.12, z, 0.06, 0.06, len * 0.95, {
        ry,
        seg: false,
      });
    else
      b.box(opts.bulb || "lamp_cold", x, y - 0.12, z, 0.07, 0.06, len * 0.95, {
        ry,
        seg: false,
        noAO: true,
      });
    if (b.lights && !opts.dead)
      b.addLight(
        x,
        y - 0.5,
        z,
        opts.color === undefined ? 0xcfe6ff : opts.color,
        opts.r || 8,
        opts.i || 0.7,
      );
  };
  /** Skeleton (bundled bones) lying/slumped at (x,y,z). */
  PH.skeleton = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PH.m4(x, y, z, ry || 0);
    const add = (geo, m) =>
      b.add("bone", geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    if (opts.sit) {
      add(
        new THREE.SphereGeometry(0.11, 8, 6),
        PH.m4(0, 0.78, 0.05, 0, 0.5, 0),
      );
      add(
        new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5),
        PH.m4(0, 0.45, 0, 0, 0.2, 0),
      );
      for (let k = 0; k < 5; k++)
        add(
          new THREE.TorusGeometry(0.1 - k * 0.008, 0.012, 4, 10, Math.PI * 1.3),
          PH.m4(0, 0.35 + k * 0.07, 0.02, 0, Math.PI / 2 + 0.2, 0),
        );
      for (const s of [-1, 1]) {
        add(
          new THREE.CylinderGeometry(0.025, 0.02, 0.42, 5),
          PH.m4(s * 0.1, 0.12, -0.22, 0, Math.PI / 2, 0),
        );
        add(
          new THREE.CylinderGeometry(0.02, 0.02, 0.4, 5),
          PH.m4(s * 0.1, 0.02, -0.45, 0, 0.2, 0),
        );
        add(
          new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5),
          PH.m4(s * 0.2, 0.45, -0.05, 0, 0.2, s * 0.3),
        );
      }
    } else {
      add(new THREE.SphereGeometry(0.11, 8, 6), PH.m4(0, 0.1, 0.78, 0.4));
      add(
        new THREE.CylinderGeometry(0.03, 0.03, 0.55, 5),
        PH.m4(0, 0.06, 0.45, 0, Math.PI / 2, 0),
      );
      for (let k = 0; k < 5; k++)
        add(
          new THREE.TorusGeometry(0.1 - k * 0.008, 0.012, 4, 10, Math.PI * 1.3),
          PH.m4(0, 0.08, 0.3 + k * 0.07, 0, 0, 0),
        );
      for (const s of [-1, 1]) {
        add(
          new THREE.CylinderGeometry(0.025, 0.02, 0.45, 5),
          PH.m4(s * 0.1, 0.04, -0.05, s * 0.15, Math.PI / 2, 0),
        );
        add(
          new THREE.CylinderGeometry(0.02, 0.02, 0.42, 5),
          PH.m4(s * 0.14, 0.04, -0.45, s * 0.1, Math.PI / 2, 0),
        );
        add(
          new THREE.CylinderGeometry(0.02, 0.018, 0.5, 5),
          PH.m4(s * 0.24, 0.04, 0.35, s * 0.5, Math.PI / 2, 0),
        );
      }
    }
  };
  /** Sandbag wall along a segment. */
  PH.sandbags = function (b, x0, z0, x1, z1, rows, opts) {
    opts = opts || {};
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const n = Math.max(1, Math.round(len / 0.62));
    for (let r = 0; r < rows; r++)
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5 + (r % 2) * 0.5) / n;
        if (t > 1) continue;
        const x = x0 + (x1 - x0) * t,
          z = z0 + (z1 - z0) * t;
        b.box("burlap", x, (opts.y || 0) + r * 0.26, z, 0.6, 0.27, 0.36, {
          ry: ry + (U.hash2(i, r) - 0.5) * 0.15,
          seg: false,
          c: 0xb8a888,
        });
      }
    PH.colWall(
      x0,
      z0,
      x1,
      z1,
      0.5,
      opts.y || 0,
      (opts.y || 0) + rows * 0.26 + 0.05,
      { walkable: true },
    );
  };
  /** Scrap-metal wall panel run (raider fortifications). */
  PH.scrapWall = function (b, x0, z0, x1, z1, h, opts) {
    opts = opts || {};
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const r = PH.rng("scrap" + x0 + z0);
    const n = Math.max(1, Math.round(len / 1.3));
    const keys = ["corrugated", "rust", "metal", "panel", "rotten"];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n,
        x = x0 + (x1 - x0) * t,
        z = z0 + (z1 - z0) * t;
      const hh = h * (0.8 + r() * 0.35);
      b.box(
        keys[(r() * keys.length) | 0],
        x,
        opts.y || 0,
        z,
        len / n + 0.25,
        hh,
        0.08,
        {
          ry: ry + (r() - 0.5) * 0.08,
          rz: (r() - 0.5) * 0.06,
          seg: false,
          c: [0xffffff, 0xd8c8b0, 0xb0a898][(r() * 3) | 0],
        },
      );
    }
    for (let i = 0; i <= n; i += 2) {
      const t = i / n,
        x = x0 + (x1 - x0) * t,
        z = z0 + (z1 - z0) * t;
      b.box("rust", x, opts.y || 0, z, 0.12, h + 0.3, 0.12, { seg: false });
    }
    PH.colWall(x0, z0, x1, z1, 0.3, opts.y || 0, (opts.y || 0) + h);
  };
  /** Crate stack. */
  PH.crates = function (b, x, y, z, ry, n, opts) {
    opts = opts || {};
    const r = PH.rng("crates" + x + z);
    for (let i = 0; i < n; i++) {
      const s = 0.6 + r() * 0.35;
      const lx = ((i % 3) - 1) * 0.95,
        lz = (((i / 3) | 0) % 2) * 0.9,
        ly = i >= 6 ? s : 0;
      const [wx, wz] = PH.rot(x, z, ry, lx, lz);
      b.box(opts.key || "crate", wx, y + ly, wz, s, s, s, {
        ry: ry + (r() - 0.5) * 0.3,
        seg: false,
      });
    }
    if (opts.collide !== false) PH.col(x, z + 0.45, 3, 2, y, y + 0.9, ry);
  };

  /** Rectangle with a round (semicircular or segmental) top; origin bottom-centre, in XY. */
  PH.archShape = function (w, h, rise) {
    const s = new THREE.Shape();
    const hw = w / 2;
    rise = rise === undefined ? hw : rise;
    s.moveTo(-hw, 0);
    s.lineTo(hw, 0);
    s.lineTo(hw, h - rise);
    if (rise >= hw - 1e-3) s.absarc(0, h - rise, hw, 0, Math.PI, false);
    else {
      const R = (hw * hw + rise * rise) / (2 * rise),
        cy = h - R,
        a0 = Math.asin(hw / R);
      s.absarc(0, cy, R, Math.PI / 2 - a0, Math.PI / 2 + a0, false);
    }
    s.lineTo(-hw, 0);
    return s;
  };
  /** Arched frame ring (outer w/h minus inner arch). */
  PH.archRing = function (w, h, t, rise) {
    const o = PH.archShape(
      w + 2 * t,
      h + t,
      rise === undefined ? undefined : rise + t,
    );
    const i = PH.archShape(w, h, rise);
    o.holes.push(new THREE.Path(i.getPoints(24).reverse()));
    return o;
  };
  /**
   * Window on a wall: frame (fx,fz) at the wall face, ry = outward direction; lx along the wall, y0 sill height.
   * kind: 'glass' | 'broken' | 'boarded' | 'dark'. opts: {arch:true, rise, frame:key, sill:key, key:true(keystone), mull:key}
   */
  PH.window = function (b, fx, fz, ry, lx, y0, w, h, kind, opts) {
    opts = opts || {};
    const M = (dz, dy) => {
      const [x, z] = PH.rot(fx, fz, ry, lx, dz);
      return PH.m4(x, y0 + (dy || 0), z, ry);
    };
    const shape = opts.arch ? PH.archShape(w, h, opts.rise) : null;
    const pane = shape
      ? new THREE.ShapeGeometry(shape, 16)
      : (() => {
          const g = new THREE.PlaneGeometry(w, h);
          g.translate(0, h / 2, 0);
          return g;
        })();
    // paneZ: pane offset along the outward normal (−0.12 = recessed into an opening; use ≈+0.03 on solid façades)
    const pz = opts.paneZ === undefined ? -0.12 : opts.paneZ,
      mz = opts.paneZ === undefined ? -0.08 : opts.paneZ + 0.03;
    if (kind !== "open")
      b.geo(kind === "glass" ? "glass" : "shadow", pane, M(pz), { grime: 0.2 }); // 'open': caller supplies its own pane
    if (kind === "boarded") {
      const r = PH.rng("brd" + fx + lx + y0);
      for (let k = 0; k < Math.max(2, Math.round(h / 0.45)); k++) {
        const yy = 0.2 + k * 0.42;
        if (yy > h - (opts.arch ? w * 0.4 : 0.2)) break;
        const [x, z] = PH.rot(
          fx,
          fz,
          ry,
          lx + (r() - 0.5) * 0.1,
          Math.max(0.03, pz + 0.05),
        );
        b.box("rotten", x, y0 + yy, z, w * 1.05, 0.3, 0.04, {
          ry,
          rz: (r() - 0.5) * 0.12,
          seg: false,
        });
      }
    }
    if (kind === "glass" || kind === "broken" || kind === "open") {
      const mk = opts.mull || "paint_white";
      const [x, z] = PH.rot(fx, fz, ry, lx, mz);
      b.box(mk, x, y0, z, 0.07, h - (opts.arch ? 0.05 : 0), 0.05, {
        ry,
        seg: false,
      });
      for (let t = 1; t < 3; t++) {
        const [x2, z2] = PH.rot(fx, fz, ry, lx, mz);
        b.box(
          mk,
          x2,
          y0 + (h * t) / 3 - (opts.arch ? w * 0.18 : 0),
          z2,
          w,
          0.06,
          0.05,
          { ry, seg: false },
        );
      }
    }
    if (opts.frame !== false) {
      const fk = opts.frame || "limestone";
      if (shape)
        b.extrude(fk, PH.archRing(w, h, opts.ft || 0.22, opts.rise), 0.18, {
          m: M(-0.05),
        });
      else {
        const [x, z] = PH.rot(fx, fz, ry, lx, 0.04);
        b.box(fk, x, y0 + h, z, w + 0.44, 0.24, 0.2, { ry, seg: false });
        for (const s of [-1, 1]) {
          const [x2, z2] = PH.rot(fx, fz, ry, lx + s * (w / 2 + 0.11), 0.04);
          b.box(fk, x2, y0, z2, 0.22, h, 0.18, { ry, seg: false });
        }
      }
      if (opts.keystone !== false && shape) {
        const [x, z] = PH.rot(fx, fz, ry, lx, 0.08);
        b.box(fk, x, y0 + h - 0.05, z, 0.34, 0.5, 0.26, { ry, seg: false });
      }
      const [sx, sz] = PH.rot(fx, fz, ry, lx, 0.1);
      b.box(opts.sill || fk, sx, y0 - 0.16, sz, w + 0.5, 0.16, 0.3, {
        ry,
        seg: false,
      });
    }
  };

  // -------------------------------------------------------------------
  // Registry / anchors
  // -------------------------------------------------------------------
  PH.publish = function () {
    if (!G.pois || G.pois.__stub) G.pois = {};
    const P = G.pois;
    for (const id in PH.entries) P[id] = PH.entries[id];
    if (typeof P.getAnchor !== "function") {
      P.getAnchor = function (idOrKey, name) {
        const PP = G.pois;
        const cl = (v) => {
          const c = v.clone();
          c.yaw = v.yaw || 0;
          return c;
        };
        for (const k in PP) {
          const e = PP[k];
          if (!e || typeof e !== "object" || !e.anchors) continue;
          if (idOrKey && e.id !== idOrKey && e.interiorKey !== idOrKey)
            continue;
          if (e.anchors[name]) return cl(e.anchors[name]);
        }
        return null;
      };
    }
  };
  PH.register = function (id, e) {
    e.id = id;
    e.owner = "poi_harbor";
    PH.entries[id] = e;
    PH.publish();
    return e;
  };
  PH.getAnchor = function (id, name) {
    const e = PH.entries[id];
    if (e && e.anchors && e.anchors[name]) {
      const c = e.anchors[name].clone();
      c.yaw = e.anchors[name].yaw || 0;
      return c;
    }
    return null;
  };
  /** Interior root: hidden unless the player is inside that cell. */
  PH.interiorRoot = function (key, name) {
    const I = G.LAYOUT.INTERIORS[key];
    const root = new THREE.Group();
    root.name = name || "ph_int_" + key;
    root.visible = false;
    G.scene.add(root);
    PH.interiors.push({ key, root, origin: I.origin });
    return root;
  };

  // -------------------------------------------------------------------
  // Props / items / interactables (safe wrappers; called at initDone+)
  // -------------------------------------------------------------------
  const LOOT_FIX = {
    common: "footlocker",
    raider: "raider_stash",
    ammo: "ammo_box",
    military: "weapon_crate",
  };
  PH.lootId = function (id, fallback) {
    if (!id) return id;
    let has = null;
    try {
      if (!G.isStub("items") && typeof G.items.hasLootTable === "function")
        has = G.items.hasLootTable;
    } catch (e) {
      has = null;
    }
    if (!has) return LOOT_FIX[id] || id;
    if (has(id)) return id;
    if (LOOT_FIX[id] && has(LOOT_FIX[id])) return LOOT_FIX[id];
    if (fallback && has(fallback)) return fallback;
    return undefined;
  };
  PH.spawned = [];
  /** Persistent world prop (spawned at initDone, stable id → props/rpg restore it per game). */
  PH.prop = function (type, opts) {
    opts = Object.assign({}, opts || {});
    if (opts.loot) {
      const l = PH.lootId(opts.loot, opts.lootFallback);
      if (l) opts.loot = l;
      else delete opts.loot;
    }
    delete opts.lootFallback;
    if (opts.persistent === undefined) opts.persistent = true;
    if (!opts.id)
      opts.id =
        "ph:" +
        type +
        "@" +
        (+opts.x || 0).toFixed(1) +
        "," +
        (+opts.y || 0).toFixed(1) +
        "," +
        (+opts.z || 0).toFixed(1);
    const rec = { type, opts, handle: null };
    rec.handle = spawnRaw(type, opts);
    PH.spawned.push(rec);
    return rec.handle;
  };
  function spawnRaw(type, opts) {
    try {
      if (G.isStub("props") || typeof G.props.spawn !== "function") return null;
      return G.props.spawn(type, opts);
    } catch (e) {
      if (!PH._propWarned) {
        PH._propWarned = true;
        console.warn(
          "[poi_harbor] props.spawn failed for " +
            type +
            ": " +
            (e && e.message),
        );
      }
      return null;
    }
  }
  PH.respawnMissing = function () {
    for (const rec of PH.spawned) {
      const h = rec.handle,
        r = h && h.record;
      const gone = h
        ? !!(r && r.removed)
        : !G.isStub("props") && typeof G.props.spawn === "function";
      if (!gone) continue;
      if (h && typeof h.remove === "function") {
        try {
          h.remove();
        } catch (e) {
          /* */
        }
      }
      rec.handle = spawnRaw(rec.type, rec.opts);
    }
  };
  /** Deferred persistent prop at LOCAL coords (current origin captured now, spawned at initDone). */
  PH.propAt = function (type, x, y, z, yaw, opts) {
    const o = Object.assign({}, opts || {}, {
      x: x + PH.ofs.x,
      y: y || 0,
      z: z + PH.ofs.z,
      yaw: yaw || 0,
    });
    PH.onReady.push(() => PH.prop(type, o));
  };
  /** Deferred "Read" interactable at LOCAL coords. */
  PH.readAt = function (x, y, z, title, text) {
    const p = PH.wv(x, y, z);
    PH.onReady.push(() => PH.readable(p, title, text));
  };
  /** "Read" interactable (plaques, chalkboards, graffiti). */
  PH.readable = function (pos, title, text, opts) {
    try {
      return G.world.addInteractable({
        pos,
        radius: (opts && opts.radius) || 0.7,
        label: title,
        verb: "Read",
        range: 2.6,
        onInteract() {
          G.notify(title + " — " + text, { duration: 10 });
          try {
            G.sfx.play("ui_click");
          } catch (e) {
            /* */
          }
        },
      });
    } catch (e) {
      return null;
    }
  };
  /** Session pickup (quest items / notes): tracked so reset can remove them. */
  PH.sessionPickups = [];
  PH.pickup = function (id, n, pos, opts) {
    if (G.isStub("items") || typeof G.items.spawnPickup !== "function")
      return null;
    try {
      const h = G.items.spawnPickup(id, n || 1, pos, opts || {});
      if (h) PH.sessionPickups.push(h);
      return h;
    } catch (e) {
      PH.safe("pickup " + id, () => {
        throw e;
      });
      return null;
    }
  };
  PH.hasItem = (id) => {
    try {
      return !G.isStub("inventory") && G.inventory.count(id) > 0;
    } catch (e) {
      return false;
    }
  };
  PH.give = (id, n, silent) => {
    try {
      if (!G.isStub("inventory"))
        G.inventory.add(id, n || 1, { silent: !!silent });
    } catch (e) {
      /* */
    }
  };
  PH.take = (id, n) => {
    try {
      if (!G.isStub("inventory")) G.inventory.remove(id, n || 1);
    } catch (e) {
      /* */
    }
  };
  /** Scrip (federal ration scrip) and Standing; the rpg API names settle during the rebrand, so resolve at call time. */
  PH.scrip = () => {
    try {
      if (G.isStub("inventory")) return 0;
      const I = G.inventory;
      return I.scrip ? I.scrip() : I.count("scrip");
    } catch (e) {
      return 0;
    }
  };
  PH.addScrip = (n) => {
    try {
      if (G.isStub("inventory")) return;
      const I = G.inventory;
      if (I.addScrip) I.addScrip(n);
      else if (n > 0) I.add("scrip", n);
      else I.remove("scrip", -n);
    } catch (e) {
      /* */
    }
  };
  PH.xp = (n, why) => {
    try {
      if (!G.isStub("rpg")) G.rpg.addXP(n, why);
    } catch (e) {
      /* */
    }
  };
  PH.standing = (n, why) => {
    try {
      if (!G.isStub("rpg") && G.rpg.addStanding) G.rpg.addStanding(n, why);
    } catch (e) {
      /* */
    }
  };
  PH.sfx = (name, opts) => {
    try {
      return G.sfx.play(name, opts);
    } catch (e) {
      return null;
    }
  };
  PH.itemExists = (id) => {
    try {
      return !G.isStub("items") && !!G.items.get(id);
    } catch (e) {
      return false;
    }
  };
  /** First existing item id from candidates. */
  PH.item = (...ids) => {
    for (const id of ids) if (PH.itemExists(id)) return id;
    return null;
  };

  /** Invisible door blocker collider that exists while flag is NOT set (checked by the update loop). */
  PH.blockers = [];
  PH.lockBlocker = function (flag, x, z, w, d, y0, y1) {
    PH.blockers.push({ flag, x, z, w, d, y0, y1, col: null });
  };
  PH.updateBlockers = function () {
    for (const bl of PH.blockers) {
      const want = !PH.flag(bl.flag);
      if (want && !bl.col) {
        try {
          bl.col = G.world.addCollider(
            bl.x,
            bl.z,
            bl.w,
            bl.d,
            bl.y0,
            bl.y1,
            0,
            { tag: "poi_harbor_door", walkable: false },
          );
        } catch (e) {
          /* */
        }
      } else if (!want && bl.col) {
        try {
          G.world.removeCollider(bl.col);
        } catch (e) {
          /* */
        }
        bl.col = null;
      }
    }
  };

  // Quest-state flags (our own, saved with the module)
  PH.flags = {};
  PH.flag = (k) => PH.flags[k];
  PH.setFlag = (k, v) => {
    PH.flags[k] = v === undefined ? true : v;
  };

  // ---- locks: keys, codes and passcodes (G.locks; specs registered at initDone) ----
  PH._locks = [];
  PH._learnSrc = [];
  PH._keySrc = [];
  PH._locksLive = false;
  const regNow = (sp) => {
    if (!G.isStub("locks") && G.locks.register) {
      try {
        G.locks.register(sp);
      } catch (e) {
        G.reportError("poi_harbor:lock " + sp.id, e);
      }
    }
  };
  /** Declare a lock spec {id, label, key?, code?, passcode?, hint}; returns the spec (pass it inline as `lock:`). */
  PH.regLock = function (sp) {
    if (!sp || !sp.id) return sp;
    if (!PH._locks.some((x) => x.id === sp.id)) PH._locks.push(sp);
    if (PH._locksLive) regNow(sp);
    return sp;
  };
  PH.lockSpec = (id) => PH._locks.find((x) => x.id === id) || null;
  PH.learn = function (lockId) {
    if (!G.isStub("locks") && G.locks.learn) {
      try {
        G.locks.learn(lockId);
      } catch (e) {
        G.reportError("poi_harbor:learn " + lockId, e);
      }
    }
  };
  /** Declare (for G.locks.audit) where a code is learned / a key is handed over by script. */
  PH.learnFrom = (lockId, label) => {
    PH._learnSrc.push([lockId, label]);
    if (PH._locksLive && !G.isStub("locks") && G.locks.learnableFrom)
      PH.safe("learnsrc", () => G.locks.learnableFrom(lockId, label));
  };
  PH.keyFrom = (itemId, label) => {
    PH._keySrc.push([itemId, label]);
    if (PH._locksLive && !G.isStub("locks") && G.locks.obtainableFrom)
      PH.safe("keysrc", () => G.locks.obtainableFrom(itemId, label));
  };
  PH.lockIsOpen = (id) => {
    try {
      return !G.isStub("locks") && G.locks.isOpen
        ? !!G.locks.isOpen(id)
        : false;
    } catch (e) {
      return false;
    }
  };
  /** Interact with a lock: G.locks handles key / keypad / passcode; key-only fallback while the registry is absent. */
  PH.lockOpen = function (sp, onOpen) {
    if (typeof sp === "string") sp = PH.lockSpec(sp) || { id: sp };
    if (!G.isStub("locks") && G.locks.open) {
      try {
        G.locks.open(sp, onOpen);
      } catch (e) {
        G.reportError("poi_harbor:lockOpen " + sp.id, e);
      }
      return;
    }
    if (sp.key && PH.hasItem(sp.key)) {
      onOpen();
      return;
    }
    PH.sfx("door_locked");
    G.notify("Locked.");
  };
  /** "Read" interactable that teaches a code (deferred to initDone; LOCAL coords like PH.readAt). */
  PH.readLearnAt = function (x, y, z, title, text, lockId) {
    const p = PH.wv(x, y, z);
    PH.learnFrom(lockId, "readable: " + title);
    PH.onReady.push(() => {
      try {
        G.world.addInteractable({
          pos: p,
          radius: 0.7,
          label: title,
          verb: "Read",
          range: 2.6,
          onInteract() {
            G.notify(title + " — " + text, { duration: 10 });
            PH.sfx("ui_click");
            PH.learn(lockId);
          },
        });
      } catch (e) {
        /* */
      }
    });
  };
  G.events.on("initDone", () => {
    PH._locksLive = true;
    PH._locks.forEach(regNow);
    if (G.isStub("locks")) return;
    for (const [id, l] of PH._learnSrc)
      PH.safe(
        "learnsrc",
        () => G.locks.learnableFrom && G.locks.learnableFrom(id, l),
      );
    for (const [it, l] of PH._keySrc)
      PH.safe(
        "keysrc",
        () => G.locks.obtainableFrom && G.locks.obtainableFrom(it, l),
      );
  });

  PH.U = U;
})();
