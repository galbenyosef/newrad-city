// play-inline-440 01 — ctx
// Lines 16-340 of readable/play-inline-440.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const U = G.util;

  // Public namespace (replaced wholesale at load time, as the contract asks)
  const P = { __props: true };
  // Internal namespace shared between the files of this module
  const X = {};
  P._ = X;
  G.props = P;

  X.TAU = Math.PI * 2;
  X.v3 = (x, y, z) => new THREE.Vector3(x || 0, y || 0, z || 0);
  X.clamp = U.clamp;
  X.lerp = U.lerp;
  X.smooth = U.smoothstep;

  /** 3D value noise built on the core hash (cheap; used for vertex grime). */
  X.noise3 = function (x, y, z) {
    return (
      (U.noise2(x + z * 0.71, y * 1.13 - z * 0.37) +
        U.noise2(y + 17.3 + x * 0.29, z * 1.07 + 5.1)) *
      0.5
    );
  };

  // ------------------------------------------------------------------
  // Colours
  // ------------------------------------------------------------------
  const _c = new THREE.Color();
  X.color = function (c) {
    if (c === undefined || c === null) return new THREE.Color(1, 1, 1);
    if (c.isColor) return c.clone();
    if (Array.isArray(c)) return new THREE.Color(c[0], c[1], c[2]);
    return new THREE.Color(c);
  };
  /** Shared palette (linear-ish multipliers applied to near-white textures). */
  X.PAL = {
    rust: 0x6e3b1c,
    rustDark: 0x3d2414,
    rustLight: 0x9a5a2a,
    steel: 0x8a8c88,
    steelDark: 0x4a4c4a,
    chrome: 0xc8c8c0,
    black: 0x1b1a19,
    rubber: 0x191817,
    olive: 0x5b6242,
    armyGreen: 0x4a5236,
    khaki: 0x9a8c62,
    cream: 0xd9ceb0,
    bone: 0xd6ccb0,
    fizzoRed: 0xb0161a,
    fizzoRedDark: 0x6a0e10,
    ocdGrey: 0xd4d2c8,
    ocdOrange: 0xe0702a,
    mailBlue: 0x1d3f6e,
    hydrantRed: 0x9c2317,
    hydrantYellow: 0xc9a227,
    lampGreen: 0x2f4a3a,
    wood: 0x9a7650,
    woodDark: 0x5a4430,
    concrete: 0xb4b0a4,
    sand: 0xa89870,
    glassDark: 0x1e2a2a,
    bulbWarm: 0xffd890,
    bulbCold: 0xd8f0ff,
    radGreen: 0x7dff3a,
    fizzoGlow: 0xff5a4a,
    fizzoBlue: 0x3ad4ff,
    screenAmber: 0xffb347,
    dirt: 0x5a4a38,
  };

  // ------------------------------------------------------------------
  // Fallback / prop-specific greyscale textures (small canvases). Tintable
  // materials use these near-white grime textures so vertex colours carry
  // the actual hue. Coloured surfaces (rust, wood, concrete) prefer the
  // textures module when it is present.
  // ------------------------------------------------------------------
  const TEX = {};
  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  X.makeCanvas = makeCanvas;
  function finishTex(canvas, repeat, srgb) {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT =
      repeat === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }
  X.finishTex = finishTex;
  function noiseFill(ctx, w, h, seed, lo, hi, scale) {
    const img = ctx.getImageData(0, 0, w, h),
      d = img.data;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        // tileable fbm by wrapping sample coordinates on a torus-ish lattice
        const n = U.fbm2((x / w) * scale + seed, (y / h) * scale - seed, 4);
        const v = lo + (hi - lo) * n;
        const i = (y * w + x) * 4;
        d[i] = d[i] * v;
        d[i + 1] = d[i + 1] * v;
        d[i + 2] = d[i + 2] * v;
      }
    ctx.putImageData(img, 0, 0);
  }
  const TEX_BUILDERS = {
    // painted, dented, grimy metal (near white)
    grime(ctx, w, h, r) {
      ctx.fillStyle = "#eeeeea";
      ctx.fillRect(0, 0, w, h);
      noiseFill(ctx, w, h, 3.7, 0.72, 1.08, 6);
      // drips / streaks
      for (let i = 0; i < 70; i++) {
        const x = r() * w,
          y = r() * h,
          len = 10 + r() * 90;
        const g = ctx.createLinearGradient(x, y, x, y + len);
        g.addColorStop(0, "rgba(40,32,20," + (0.08 + r() * 0.16) + ")");
        g.addColorStop(1, "rgba(40,32,20,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x, y, 1 + r() * 3, len);
      }
      // chipped paint spots
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle =
          "rgba(" +
          ((90 + r() * 40) | 0) +
          "," +
          ((60 + r() * 20) | 0) +
          ",40," +
          (0.12 + r() * 0.3) +
          ")";
        ctx.beginPath();
        ctx.ellipse(
          r() * w,
          r() * h,
          0.5 + r() * 3.5,
          0.5 + r() * 2.5,
          r() * 3,
          0,
          X.TAU,
        );
        ctx.fill();
      }
      // scratches
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        const x = r() * w,
          y = r() * h;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 12);
        ctx.stroke();
      }
    },
    rust(ctx, w, h, r) {
      ctx.fillStyle = "#8a5230";
      ctx.fillRect(0, 0, w, h);
      noiseFill(ctx, w, h, 11.3, 0.5, 1.25, 8);
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle =
          r() < 0.5 ? "rgba(60,30,14,0.35)" : "rgba(170,96,44,0.3)";
        ctx.beginPath();
        ctx.arc(r() * w, r() * h, 0.5 + r() * 4, 0, X.TAU);
        ctx.fill();
      }
    },
    concrete(ctx, w, h, r) {
      ctx.fillStyle = "#c8c4b8";
      ctx.fillRect(0, 0, w, h);
      noiseFill(ctx, w, h, 5.1, 0.7, 1.08, 10);
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle =
          "rgba(" +
          (r() < 0.5 ? "40,40,36" : "240,236,226") +
          "," +
          (0.1 + r() * 0.25) +
          ")";
        ctx.fillRect(r() * w, r() * h, 1, 1);
      }
      ctx.strokeStyle = "rgba(40,36,30,0.35)";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        let x = r() * w,
          y = r() * h;
        ctx.moveTo(x, y);
        for (let k = 0; k < 8; k++) {
          x += (r() - 0.5) * 30;
          y += (r() - 0.3) * 20;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    },
    wood(ctx, w, h, r) {
      const planks = 4;
      for (let p = 0; p < planks; p++) {
        const y0 = (p / planks) * h,
          ph = h / planks;
        const base = 150 + r() * 50;
        ctx.fillStyle =
          "rgb(" +
          (base | 0) +
          "," +
          ((base * 0.78) | 0) +
          "," +
          ((base * 0.55) | 0) +
          ")";
        ctx.fillRect(0, y0, w, ph);
        for (let i = 0; i < 30; i++) {
          ctx.strokeStyle = "rgba(60,40,20," + (0.05 + r() * 0.15) + ")";
          ctx.beginPath();
          const yy = y0 + r() * ph;
          ctx.moveTo(0, yy);
          for (let x = 0; x <= w; x += 16)
            ctx.lineTo(x, yy + Math.sin(x * 0.05 + i) * 2);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(30,20,10,0.6)";
        ctx.fillRect(0, y0, w, 2);
        for (let k = 0; k < 2; k++) {
          ctx.fillStyle = "rgba(40,30,20,0.7)";
          ctx.beginPath();
          ctx.arc(8 + r() * (w - 16), y0 + ph / 2, 2, 0, X.TAU);
          ctx.fill();
        }
      }
      noiseFill(ctx, w, h, 8.8, 0.7, 1.05, 5);
    },
    fabric(ctx, w, h, r) {
      ctx.fillStyle = "#e6e2d8";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.fillRect(0, y, w, 1);
      }
      for (let x = 0; x < w; x += 2) {
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(x, 0, 1, h);
      }
      noiseFill(ctx, w, h, 2.2, 0.65, 1.05, 5);
      for (let i = 0; i < 14; i++) {
        // stains
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        g.addColorStop(0, "rgba(90,70,40,0.35)");
        g.addColorStop(1, "rgba(90,70,40,0)");
        ctx.save();
        ctx.translate(r() * w, r() * h);
        const s = 8 + r() * 30;
        ctx.scale(s, s * (0.6 + r() * 0.6));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, X.TAU);
        ctx.fill();
        ctx.restore();
      }
    },
    chain(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(200,200,190,1)";
      ctx.lineWidth = 3.5;
      const s = 16;
      for (let k = -h; k < w + h; k += s) {
        ctx.beginPath();
        ctx.moveTo(k, 0);
        ctx.lineTo(k + h, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(k + h, 0);
        ctx.lineTo(k, h);
        ctx.stroke();
      }
    },
  };
  /** Greyscale/prop texture by name (my own canvases). */
  X.ownTex = function (name) {
    if (TEX[name]) return TEX[name];
    const size = name === "chain" ? 128 : 256;
    const c = makeCanvas(size, size),
      ctx = c.getContext("2d");
    TEX_BUILDERS[name](ctx, size, size, U.rng(U.hashStr(name)));
    TEX[name] = finishTex(c, true, name !== "chain" ? true : true);
    return TEX[name];
  };
  /** Prefer the textures module for naturally coloured surfaces. */
  X.tex = function (name, fallback) {
    if (!G.isStub("tex") && G.tex && typeof G.tex.get === "function") {
      try {
        const t = G.tex.get(name);
        if (t && t.isTexture) return t;
      } catch (e) {
        /* fall through */
      }
    }
    return X.ownTex(fallback);
  };

  // ------------------------------------------------------------------
  // Materials (all shared; vertex colours carry hue/AO/grime)
  // ------------------------------------------------------------------
  const MATS = {};
  X.MAT_KEYS = [
    "metal",
    "paint",
    "chrome",
    "rust",
    "concrete",
    "wood",
    "fabric",
    "plain",
    "glass",
    "atlas",
    "trim",
    "glow",
    "screen",
    "chain",
  ];
