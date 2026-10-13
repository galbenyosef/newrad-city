/* src/characters/00_lib.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: core library
 * Owned by: characters.
 *
 * Everything a character model needs, shared by every builder:
 *   - the G.chars namespace (replaced wholesale here; later files extend it)
 *   - ONE custom skinned material (MeshStandard + per-vertex roughness /
 *     metalness / emissive, body-part highlight, hit flash, dissolve)
 *   - a procedural texture ATLAS (fabric, leather, metal, skin, scales,
 *     shell, decals: "C-9" unit patch, faction emblems, sun disc, red cross, grilles…)
 *   - geometry primitives (rounded box, tapered limbs, lofted
 *     super-ellipse bodies, swept horns/claws/hoses, lathe, sphere…)
 *   - RigBuilder: bones + rigidly-skinned parts → ONE SkinnedMesh per
 *     character (1 draw call, 1 shadow draw) with per-bone geometry kept
 *     for dismemberment gibs.
 *
 * Conventions (bind pose, all bone rotations identity):
 *   model faces -Z (north at yaw 0), +X is the character's RIGHT, +Y up.
 *   Limb bones hang down (-Y). +X rotation swings a limb forward; on an
 *   upward bone (spine/neck/head) +X leans BACK / looks up.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;

  // Namespace: replaced wholesale (core pre-created a stub Proxy).
  const C = (G.chars = { __module: "characters" });
  const L = (C._lib = {});

  // ------------------------------------------------------------------
  // Small helpers
  // ------------------------------------------------------------------
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  L.clamp = clamp;
  L.lerp = lerp;
  L.smooth = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  /** Deterministic hash of a 3D point → [0,1). Used for vertex grime noise. */
  L.hash3 = function (x, y, z) {
    let h =
      Math.imul((x * 7919) | 0, 374761393) ^
      Math.imul((y * 7919) | 0, 668265263) ^
      Math.imul((z * 7919) | 0, 2147483647);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  /** Smooth-ish 3D value noise (cheap) in [0,1]. */
  L.noise3 = function (x, y, z) {
    const xi = Math.floor(x),
      yi = Math.floor(y),
      zi = Math.floor(z);
    const xf = x - xi,
      yf = y - yi,
      zf = z - zi;
    const s = (t) => t * t * (3 - 2 * t);
    const h = L.hash3;
    const a = lerp(
      lerp(h(xi, yi, zi), h(xi + 1, yi, zi), s(xf)),
      lerp(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), s(xf)),
      s(yf),
    );
    const b = lerp(
      lerp(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), s(xf)),
      lerp(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), s(xf)),
      s(yf),
    );
    return lerp(a, b, s(zf));
  };
  L.rng = function (seed) {
    if (G.util && G.util.rng) return G.util.rng(seed);
    let a = seed >>> 0 || 1;
    const r = function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.range = (lo, hi) => lo + (hi - lo) * r();
    r.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * r());
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.chance = (p) => r() < p;
    return r;
  };
  L.hashStr = (s) => {
    let h = 2166136261;
    s = String(s);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  /** Color helper: accepts hex number, '#hex', THREE.Color or [r,g,b] → THREE.Color (new). */
  L.col = function (c) {
    if (c instanceof THREE.Color) return c.clone();
    if (Array.isArray(c)) return new THREE.Color(c[0], c[1], c[2]);
    return new THREE.Color(c === undefined ? 0xffffff : c);
  };
  /** Mix two colors (hex) → hex. */
  L.mix = function (a, b, t) {
    return L.col(a).lerp(L.col(b), t).getHex();
  };
  L.shade = function (a, k) {
    const c = L.col(a);
    c.multiplyScalar(k);
    c.r = Math.min(1, c.r);
    c.g = Math.min(1, c.g);
    c.b = Math.min(1, c.b);
    return c.getHex();
  };

  // ------------------------------------------------------------------
  // PALETTE — shared colours (sun-bleached, grimy)
  // ------------------------------------------------------------------
  L.PAL = {
    cryoGrey: 0xb9bcb6,
    cryoGreyDark: 0x7b7f7c,
    cryoOrange: 0xd2601c,
    cryoOrangeDark: 0x94420f,
    leather: 0x5a3b24,
    leatherDark: 0x3a2616,
    leatherLight: 0x7a5534,
    denim: 0x3b4a5c,
    khaki: 0x8a7d5a,
    olive: 0x55583a,
    oliveDark: 0x3a3d27,
    drab: 0x6b624a,
    rust: 0x7a3f1d,
    steel: 0x7c8084,
    steelDark: 0x44484c,
    gunmetal: 0x2e3134,
    chrome: 0xb8bcc0,
    black: 0x151515,
    white: 0xd8d4c8,
    labWhite: 0xcfcbbf,
    red: 0x8e1d17,
    bone: 0xd6cba8,
    rag1: 0x6f6452,
    rag2: 0x585244,
    rag3: 0x7b6e58,
    rag4: 0x4f4a3f,
    covSteel: 0x8b8d86,
    rigOlive: 0x6b6d5a,
    contGrey: 0x1a1b1d,
    contLamp: 0xff6a1a,
    brute: 0x7a6c82,
    bruteDark: 0x52485c,
    ripjaw: 0x4b4234,
    ripjawBelly: 0x7a6a50,
    claw: 0xd9d0b6,
    shellback: 0x5b5a3e,
    shellbackBelly: 0xb7ab86,
    burrowRat: 0xa7837a,
    roach: 0x5a3a20,
    gasfly: 0xa89574,
    glow: 0xff6a2a,
    sunGold: 0xe8b04a,
    covRed: 0x9b2a1f,
  };
  L.SKIN = {
    // (r1 loop: 8–14 % less saturated — under the warm key + red subsurface
    // wrap the old tones rendered as orange terracotta against the olive grade)
    pale: 0xe0bda1,
    fair: 0xd3a788,
    tan: 0xba8f6f,
    olive: 0xa37c5d,
    brown: 0x855c41,
    dark: 0x5a3d2c,
  };
  L.HAIR = [
    0x1c1611, 0x3a2616, 0x5b3b20, 0x8a6a3c, 0xb89968, 0x6c2b18, 0x7a7670,
    0xc9c3b8,
  ];

  // ------------------------------------------------------------------
  // TEXTURE ATLAS (1024²). Mostly light greyscale detail so vertex colour
  // defines the hue; a few coloured decal regions (white vertex colour).
  // ------------------------------------------------------------------
  const ATLAS_SIZE = 1024;
  const REG = (L.REGIONS = {
    white: [0, 0, 128, 128],
    denim: [0, 128, 128, 128],
    cloth: [128, 0, 256, 256],
    leather: [384, 0, 256, 256],
    metal: [640, 0, 256, 256],
    skin: [896, 0, 128, 128],
    rubber: [896, 128, 128, 128],
    grime: [0, 256, 256, 256],
    scales: [256, 256, 256, 256],
    shell: [512, 256, 256, 256],
    unitpatch: [768, 256, 256, 128],
    covenant: [768, 384, 128, 128],
    longwinter: [896, 384, 128, 128],
    sundisc: [0, 512, 128, 128],
    redcross: [128, 512, 128, 128],
    grille: [256, 512, 128, 128],
    hazard: [384, 512, 128, 128],
    maker: [512, 512, 256, 128],
    continuity: [768, 512, 256, 128],
    fur: [0, 640, 256, 256],
    rags: [256, 640, 256, 256],
    crackskin: [512, 640, 256, 256],
    gauge: [768, 640, 256, 192],
    raidpaint: [0, 896, 256, 128],
    wood: [256, 896, 256, 128],
    tire: [512, 896, 256, 128],
    numplate: [768, 832, 256, 192],
  });
  let atlasTex = null;
  function buildAtlas() {
    const cv = document.createElement("canvas");
    cv.width = cv.height = ATLAS_SIZE;
    const g = cv.getContext("2d");
    const R = L.rng(9001);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, ATLAS_SIZE, ATLAS_SIZE);
    const region = (name, fn) => {
      const r = REG[name];
      g.save();
      g.beginPath();
      g.rect(r[0], r[1], r[2], r[3]);
      g.clip();
      g.translate(r[0], r[1]);
      fn(r[2], r[3]);
      g.restore();
    };
    const speckle = (w, h, n, lo, hi, sz) => {
      for (let i = 0; i < n; i++) {
        const v = Math.floor(lo + (hi - lo) * R());
        g.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
        g.fillRect(R() * w, R() * h, sz || 1 + R() * 2, sz || 1 + R() * 2);
      }
    };
    const blotches = (w, h, n, color, rmin, rmax, alpha) => {
      for (let i = 0; i < n; i++) {
        g.globalAlpha = alpha * (0.4 + 0.6 * R());
        g.fillStyle = color;
        g.beginPath();
        g.ellipse(
          R() * w,
          R() * h,
          rmin + R() * (rmax - rmin),
          rmin + R() * (rmax - rmin),
          R() * 3,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
      g.globalAlpha = 1;
    };
    // Detail from the textures module (fabric / leather), used as greyscale
    // luminance so vertex colour still defines the hue. Optional.
    let curW = 0,
      curH = 0;
    const texDetail = (name, alpha, filter) => {
      try {
        if (G.isStub && G.isStub("tex")) return;
        const t = G.tex && G.tex.get && G.tex.get(name);
        const img = t && t.image;
        if (!img || !img.width) return;
        g.save();
        g.globalCompositeOperation = "multiply";
        g.globalAlpha = alpha;
        g.filter = filter || "grayscale(1) contrast(1.3) brightness(1.55)";
        g.drawImage(img, 0, 0, img.width, img.height, 0, 0, curW, curH);
        g.restore();
      } catch (e) {
        /* optional */
      }
    };
    const regionWH = (name, fn) =>
      region(name, (w, h) => {
        curW = w;
        curH = h;
        fn(w, h);
      });
    /** Stitched seam along x = const (runs ALONG a limb/torso in lathe & loft uvs). */
    const seamV = (x, h, dark) => {
      g.fillStyle = "rgba(0,0,0," + (dark || 0.22) + ")";
      g.fillRect(x - 1, 0, 2, h);
      g.fillStyle = "rgba(255,255,255,0.16)";
      g.fillRect(x + 1, 0, 1, h);
      g.fillStyle = "rgba(40,30,20,0.35)";
      for (let y = 0; y < h; y += 5) {
        g.fillRect(x - 3, y, 1, 3);
        g.fillRect(x + 3, y + 2, 1, 3);
      }
    };
    const patch = (x, y, pw, ph, tone) => {
      g.fillStyle = "rgba(" + tone + "," + tone + "," + (tone - 8) + ",0.55)";
      g.fillRect(x, y, pw, ph);
      g.strokeStyle = "rgba(30,24,18,0.55)";
      g.lineWidth = 1;
      g.setLineDash([2, 2]);
      g.strokeRect(x + 1.5, y + 1.5, pw - 3, ph - 3);
      g.setLineDash([]);
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.fillRect(x, y + ph - 2, pw, 2);
    };
    const wear = (w, h, n) => {
      // frayed / thinning spots (lighter) and small holes (dark)
      blotches(w, h, n, "#ffffff", 3, 9, 0.22);
      for (let i = 0; i < n / 3; i++) {
        g.fillStyle = "rgba(20,16,12,0.7)";
        g.beginPath();
        g.ellipse(
          R() * w,
          R() * h,
          1 + R() * 2.5,
          1 + R() * 1.5,
          R() * 3,
          0,
          7,
        );
        g.fill();
      }
    };
    // cloth: fine weave, stitched seams running along the limbs, a sewn-on
    // patch or two, wear & grime (hue comes from vertex colour)
    /**
     * Soft garment FOLDS (painted shadow crease + highlight ridge, blurred):
     * mostly across the limb/torso axis, denser around the middle of the
     * region (elbows / knees on limb tubes, the waist on torsos) and bunched
     * near the bottom (cuffs & ankles). Also drives the bump relief.
     */
    const folds = (w, h, n, strength) => {
      g.save();
      g.filter = "blur(1.6px)";
      g.lineCap = "round";
      for (let i = 0; i < n; i++) {
        const zone = R();
        const y =
          zone < 0.45
            ? h * (0.38 + R() * 0.26)
            : zone < 0.75
              ? h * (0.82 + R() * 0.16)
              : h * R();
        const x0 = R() * w,
          len = w * (0.18 + R() * 0.4),
          tilt = (R() - 0.5) * 0.7,
          bow = (R() - 0.5) * 10;
        const x1 = x0 + len,
          y1 = y + Math.sin(tilt) * len;
        const a = strength * (0.55 + R() * 0.45);
        for (const [dy, col, lw] of [
          [2.2, "rgba(0,0,0," + 0.22 * a + ")", 3 + R() * 3],
          [-1.6, "rgba(255,255,255," + 0.2 * a + ")", 2 + R() * 2],
        ]) {
          for (const off of [0, -w]) {
            // wrap around the limb seam
            g.strokeStyle = col;
            g.lineWidth = lw;
            g.beginPath();
            g.moveTo(x0 + off, y + dy);
            g.quadraticCurveTo(
              (x0 + x1) / 2 + off,
              (y + y1) / 2 + bow + dy,
              x1 + off,
              y1 + dy,
            );
            g.stroke();
          }
        }
      }
      g.restore();
    };
    L._folds = folds;
    regionWH("cloth", (w, h) => {
      g.fillStyle = "#f4f4f4";
      g.fillRect(0, 0, w, h);
      texDetail(
        "fabric",
        0.3,
        "grayscale(1) contrast(1.1) brightness(1.7) blur(0.6px)",
      );
      // fine plain weave (sub-pixel at normal viewing distances: reads as a soft grain, not a basket)
      for (let y = 0; y < h; y++) {
        g.fillStyle = "rgba(0,0,0," + (0.015 + R() * 0.025) + ")";
        g.fillRect(0, y, w, 1);
        y++;
      }
      speckle(w, h, 2500, 215, 255, 1);
      folds(w, h, 34, 1);
      blotches(w, h, 40, "#8a7a60", 6, 30, 0.12);
      speckle(w, h, 900, 200, 255);
      seamV(w * 0.25, h);
      seamV(w * 0.75, h, 0.18);
      patch(w * 0.52, h * 0.3, 30, 24, 205);
      patch(w * 0.06, h * 0.68, 22, 26, 225);
      wear(w, h, 18);
      // grime collects toward the hems (bottom of the region = cuffs/ankles)
      const gr = g.createLinearGradient(0, h * 0.7, 0, h);
      gr.addColorStop(0, "rgba(90,75,55,0)");
      gr.addColorStop(1, "rgba(90,75,55,0.3)");
      g.fillStyle = gr;
      g.fillRect(0, h * 0.7, w, h * 0.3);
    });
    // denim: diagonal twill, faded wear lines ("whiskers"), double-stitched seams
    regionWH("denim", (w, h) => {
      g.fillStyle = "#e6e6e6";
      g.fillRect(0, 0, w, h);
      for (let i = -h; i < w + h; i += 2) {
        g.strokeStyle = "rgba(0,0,0," + (0.08 + R() * 0.06) + ")";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i + h * 0.6, h);
        g.stroke();
      }
      speckle(w, h, 700, 225, 255, 1);
      blotches(w, h, 14, "#ffffff", 5, 18, 0.2); // faded patches
      g.strokeStyle = "rgba(255,255,255,0.28)";
      g.lineWidth = 1.2;
      for (let i = 0; i < 7; i++) {
        const y = h * (0.45 + R() * 0.2);
        g.beginPath();
        g.moveTo(w * 0.35, y);
        g.quadraticCurveTo(w * 0.5, y - 3, w * 0.65, y + (R() - 0.5) * 6);
        g.stroke();
      }
      seamV(w * 0.25, h, 0.25);
      seamV(w * 0.75, h, 0.25);
      folds(w, h, 16, 0.9);
      patch(w * 0.55, h * 0.72, 20, 16, 180);
      wear(w, h, 10);
    });
    // leather: grain, creases, stitching, scuffs
    regionWH("leather", (w, h) => {
      g.fillStyle = "#f0f0f0";
      g.fillRect(0, 0, w, h);
      texDetail("leather", 0.6, "grayscale(1) contrast(1.2) brightness(2.1)");
      blotches(w, h, 80, "#9a9a9a", 3, 16, 0.25);
      blotches(w, h, 40, "#ffffff", 4, 14, 0.2);
      g.strokeStyle = "rgba(40,40,40,0.35)";
      g.lineWidth = 1;
      for (let i = 0; i < 60; i++) {
        g.beginPath();
        const x = R() * w,
          y = R() * h;
        g.moveTo(x, y);
        g.quadraticCurveTo(
          x + R() * 20 - 10,
          y + R() * 20 - 10,
          x + R() * 30 - 15,
          y + R() * 30 - 15,
        );
        g.stroke();
      }
      g.setLineDash([4, 3]);
      g.strokeStyle = "rgba(250,240,210,0.6)";
      g.strokeRect(8, 8, w - 16, h - 16);
      g.setLineDash([]);
      seamV(w * 0.5, h, 0.28);
      blotches(w, h, 25, "#ffffff", 2, 6, 0.3); // scuffs
    });
    // metal: brushed + scratches + rust
    region("metal", (w, h) => {
      g.fillStyle = "#ececec";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y++) {
        g.fillStyle =
          "rgba(" +
          (R() > 0.5 ? "255,255,255" : "0,0,0") +
          "," +
          R() * 0.07 +
          ")";
        g.fillRect(0, y, w, 1);
      }
      g.strokeStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 70; i++) {
        g.beginPath();
        const x = R() * w,
          y = R() * h;
        g.moveTo(x, y);
        g.lineTo(x + R() * 40 - 20, y + R() * 8 - 4);
        g.stroke();
      }
      blotches(w, h, 30, "#8a5a3a", 3, 18, 0.35);
      blotches(w, h, 20, "#5a3a22", 2, 8, 0.4);
      // rivets along the edge
      for (let x = 10; x < w; x += 24) {
        g.fillStyle = "#909090";
        g.beginPath();
        g.arc(x, 8, 3, 0, 7);
        g.fill();
        g.beginPath();
        g.arc(x, h - 8, 3, 0, 7);
        g.fill();
      }
    });
    region("skin", (w, h) => {
      g.fillStyle = "#fafafa";
      g.fillRect(0, 0, w, h);
      speckle(w, h, 700, 225, 255, 1);
      blotches(w, h, 25, "#c8a8a0", 3, 10, 0.18);
    });
    region("rubber", (w, h) => {
      g.fillStyle = "#d8d8d8";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 6) {
        g.fillStyle = "rgba(0,0,0,0.25)";
        g.fillRect(0, y, w, 2);
      }
      speckle(w, h, 300, 150, 220);
    });
    region("grime", (w, h) => {
      g.fillStyle = "#f6f6f6";
      g.fillRect(0, 0, w, h);
      blotches(w, h, 120, "#8a8070", 4, 26, 0.18);
      speckle(w, h, 1500, 190, 255);
    });
    region("scales", (w, h) => {
      g.fillStyle = "#e0e0e0";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h + 12; y += 10)
        for (let x = 0; x < w + 12; x += 12) {
          const ox = (y / 10) % 2 ? 6 : 0;
          const v = 150 + Math.floor(R() * 100);
          g.fillStyle = "rgb(" + v + "," + v + "," + (v - 10) + ")";
          g.beginPath();
          g.ellipse(x + ox, y, 6.5, 5.5, 0, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = "rgba(30,25,20,0.5)";
          g.lineWidth = 1;
          g.stroke();
        }
    });
    region("shell", (w, h) => {
      g.fillStyle = "#ececec";
      g.fillRect(0, 0, w, h);
      blotches(w, h, 70, "#7a7a60", 6, 28, 0.35);
      blotches(w, h, 50, "#ffffff", 3, 12, 0.3);
      g.strokeStyle = "rgba(30,30,20,0.45)";
      g.lineWidth = 2;
      for (let i = 0; i < 16; i++) {
        g.beginPath();
        g.moveTo(R() * w, 0);
        g.bezierCurveTo(R() * w, h * 0.3, R() * w, h * 0.6, R() * w, h);
        g.stroke();
      }
      speckle(w, h, 600, 90, 200);
    });
    // Cryo-unit patch: "C-9" stencil on a grey-white square with an orange stripe
    region("unitpatch", (w, h) => {
      g.fillStyle = "#d6d8d2";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#" + L.col(L.PAL.cryoOrange).getHexString();
      g.fillRect(0, h * 0.78, w, h * 0.12);
      g.strokeStyle = "#4a4e4c";
      g.lineWidth = 4;
      g.strokeRect(6, 6, w - 12, h - 12);
      g.fillStyle = "#2c302e";
      g.font = 'bold 82px "Courier New", monospace';
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("C-9", w / 2, h * 0.42);
      g.fillStyle = "#d6d8d2";
      for (const x of [w / 2 - 50, w / 2 + 2, w / 2 + 52])
        g.fillRect(x - 2, h * 0.2, 4, h * 0.45); // stencil bridges
      g.globalAlpha = 0.25;
      speckle(w, h, 800, 40, 120);
      g.globalAlpha = 1;
    });
    // Iron Covenant: an anvil inside a ring (cream on rust red)
    region("covenant", (w, h) => {
      g.fillStyle = "#5e605a";
      g.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2;
      g.fillStyle = "#" + L.col(L.PAL.covRed).getHexString();
      g.beginPath();
      g.arc(cx, cy, 54, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#d8c89a";
      g.lineWidth = 7;
      g.beginPath();
      g.arc(cx, cy, 46, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = "#d8c89a";
      g.beginPath(); // anvil: horn left, face, heel right, waist, foot
      g.moveTo(cx - 34, cy - 14);
      g.quadraticCurveTo(cx - 20, cy - 4, cx - 14, cy - 2);
      g.lineTo(cx - 10, cy - 2);
      g.lineTo(cx - 10, cy + 6);
      g.lineTo(cx - 18, cy + 18);
      g.lineTo(cx + 18, cy + 18);
      g.lineTo(cx + 10, cy + 6);
      g.lineTo(cx + 10, cy - 2);
      g.lineTo(cx + 24, cy - 2);
      g.lineTo(cx + 24, cy - 14);
      g.closePath();
      g.fill();
      g.fillRect(cx - 22, cy + 18, 44, 6);
    });
    // Project Long Winter: hexagonal snow crystal + lettering, orange on grey-white
    region("longwinter", (w, h) => {
      g.fillStyle = "#d6d8d2";
      g.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h * 0.44,
        col = "#" + L.col(L.PAL.cryoOrange).getHexString();
      g.strokeStyle = col;
      g.lineWidth = 6;
      g.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2,
          ux = Math.cos(a),
          uy = Math.sin(a);
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + ux * 38, cy + uy * 38);
        g.stroke();
        for (const k of [-1, 1]) {
          const b2 = a + k * 0.7;
          g.beginPath();
          g.moveTo(cx + ux * 22, cy + uy * 22);
          g.lineTo(
            cx + ux * 22 + Math.cos(b2) * 12,
            cy + uy * 22 + Math.sin(b2) * 12,
          );
          g.stroke();
        }
      }
      g.lineWidth = 4;
      g.beginPath();
      for (let i = 0; i <= 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        g[i ? "lineTo" : "moveTo"](
          cx + Math.cos(a) * 48,
          cy + Math.sin(a) * 48,
        );
      }
      g.stroke();
      g.fillStyle = "#3a3e3c";
      g.font = "bold 15px Arial, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("LONG WINTER", cx, h * 0.9);
    });
    // Glowkeepers: the TWELVE-RAY sun (Nicole's doodle on the blackout candle box) — used with emissive vertices
    region("sundisc", (w, h) => {
      g.fillStyle = "#3a2410";
      g.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2;
      g.fillStyle = "#ffcf6a";
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2,
          r1 = 58;
        g.beginPath();
        g.moveTo(cx + Math.cos(a - 0.12) * 26, cy + Math.sin(a - 0.12) * 26);
        g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        g.lineTo(cx + Math.cos(a + 0.12) * 26, cy + Math.sin(a + 0.12) * 26);
        g.fill();
      }
      g.fillStyle = "#fff0b8";
      g.beginPath();
      g.arc(cx, cy, 24, 0, 7);
      g.fill();
      g.strokeStyle = "#b8701e";
      g.lineWidth = 3;
      g.beginPath();
      g.arc(cx, cy, 15, 0, 7);
      g.stroke();
    });
    region("redcross", (w, h) => {
      g.fillStyle = "#e8e4d8";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#b01e18";
      g.fillRect(w / 2 - 14, 18, 28, h - 36);
      g.fillRect(18, h / 2 - 14, w - 36, 28);
      g.globalAlpha = 0.3;
      speckle(w, h, 400, 90, 160);
      g.globalAlpha = 1;
    });
    region("grille", (w, h) => {
      g.fillStyle = "#909090";
      g.fillRect(0, 0, w, h);
      for (let y = 6; y < h; y += 12) {
        g.fillStyle = "#1a1a1a";
        g.fillRect(4, y, w - 8, 6);
        g.fillStyle = "#d8d8d8";
        g.fillRect(4, y + 6, w - 8, 1);
      }
    });
    region("hazard", (w, h) => {
      g.fillStyle = "#e8c020";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#1a1a1a";
      for (let i = -h; i < w + h; i += 32) {
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i + 16, 0);
        g.lineTo(i + 16 - h, h);
        g.lineTo(i - h, h);
        g.fill();
      }
    });
    region("maker", (w, h) => {
      g.fillStyle = "#b8b09a";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#3a2a1a";
      g.lineWidth = 4;
      g.strokeRect(5, 5, w - 10, h - 10);
      // American Automaton Co. maker plate
      g.fillStyle = "#5a1f1a";
      g.font = "bold 40px Georgia, serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("AMERICAN", w / 2, h * 0.36, w - 24);
      g.fillStyle = "#2a2a24";
      g.font = "bold 21px Arial, sans-serif";
      g.fillText("A U T O M A T O N   C O .", w / 2, h * 0.72, w - 20);
      g.globalAlpha = 0.3;
      speckle(w, h, 600, 60, 140);
      g.globalAlpha = 1;
    });
    // The Continuity: a stylised capitol dome inside a circle (grey on charcoal)
    region("continuity", (w, h) => {
      g.fillStyle = "#2a2c2e";
      g.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2,
        R0 = Math.min(w, h) * 0.44;
      g.strokeStyle = "#d8d6ce";
      g.lineWidth = 6;
      g.beginPath();
      g.arc(cx, cy, R0, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = "#d8d6ce";
      g.beginPath();
      g.arc(cx, cy + 8, 24, Math.PI, 0);
      g.fill(); // dome
      g.fillRect(cx - 2, cy - 30, 4, 16);
      g.fillRect(cx - 6, cy - 22, 12, 4); // lantern & spire
      g.fillRect(cx - 30, cy + 8, 60, 5); // drum ledge
      for (let i = 0; i < 7; i++) g.fillRect(cx - 27 + i * 8.6, cy + 13, 4, 14); // colonnade
      g.fillRect(cx - 34, cy + 27, 68, 6); // base
    });
    region("fur", (w, h) => {
      // hair / fur: clumped strands running down the region (crown → nape on
      // hair shells, along the limb on fur), dark partings between clumps,
      // lighter strand tips — the bump pass turns it into strand relief
      g.fillStyle = "#cfcfcf";
      g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 3 + R() * 5) {
        g.fillStyle = "rgba(0,0,0," + (0.08 + R() * 0.14) + ")";
        g.fillRect(x, 0, 1 + R() * 1.5, h);
      } // partings
      g.lineCap = "round";
      for (let i = 0; i < 4200; i++) {
        const v = 110 + Math.floor(R() * 145),
          x = R() * w,
          y = R() * h,
          len = 6 + R() * 22,
          bend = (R() - 0.5) * 4;
        g.strokeStyle =
          "rgba(" + v + "," + v + "," + v + "," + (0.35 + R() * 0.5) + ")";
        g.lineWidth = 0.6 + R() * 0.8;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(
          x + bend,
          y + len * 0.5,
          x + bend * 0.5 + (R() - 0.5) * 2,
          y + len,
        );
        g.stroke();
      }
    });
    region("rags", (w, h) => {
      g.fillStyle = "#eeeeee";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 3) {
        g.fillStyle = "rgba(0,0,0," + R() * 0.08 + ")";
        g.fillRect(0, y, w, 2);
      }
      blotches(w, h, 50, "#6a5a40", 6, 30, 0.25);
      blotches(w, h, 12, "#3a2a1a", 3, 10, 0.5);
      // patches
      for (let i = 0; i < 6; i++) {
        g.fillStyle =
          "rgba(" +
          ((120 + R() * 100) | 0) +
          "," +
          ((110 + R() * 90) | 0) +
          "," +
          ((90 + R() * 70) | 0) +
          ",0.55)";
        const x = R() * w,
          y = R() * h,
          s = 18 + R() * 26;
        g.fillRect(x, y, s, s * 0.8);
        g.setLineDash([3, 3]);
        g.strokeStyle = "rgba(20,20,20,0.6)";
        g.strokeRect(x, y, s, s * 0.8);
        g.setLineDash([]);
      }
    });
    // Cracked hide detail (creature flesh): light base, a crazed network of fine cracks with lit
    // ridges, a few faded blotches and soot specks.
    region("crackskin", (w, h) => {
      g.fillStyle = "#c4c0bc";
      g.fillRect(0, 0, w, h);
      blotches(w, h, 30, "#a08a80", 6, 22, 0.18); // faded old burns
      blotches(w, h, 40, "#dad6d0", 3, 14, 0.35); // pale ash dust
      blotches(w, h, 30, "#3a3836", 2, 6, 0.35); // soot
      g.lineCap = "round";
      for (let i = 0; i < 420; i++) {
        let x = R() * w,
          y = R() * h;
        const ang = R() * Math.PI,
          n = 3 + ((R() * 4) | 0);
        g.beginPath();
        g.moveTo(x, y);
        const pts = [[x, y]];
        for (let k = 0; k < n; k++) {
          x += Math.cos(ang + (R() - 0.5) * 1.8) * 6;
          y += Math.sin(ang + (R() - 0.5) * 1.8) * 6;
          g.lineTo(x, y);
          pts.push([x, y]);
        }
        g.strokeStyle = "rgba(40,36,34," + (0.35 + R() * 0.35) + ")";
        g.lineWidth = 0.6 + R() * 0.9;
        g.stroke();
        g.beginPath();
        g.moveTo(pts[0][0] + 1, pts[0][1] + 1);
        for (const p of pts) g.lineTo(p[0] + 1, p[1] + 1);
        g.strokeStyle = "rgba(235,232,226,0.25)";
        g.lineWidth = 0.8;
        g.stroke(); // lit ridge beside each crack
      }
    });
    // generic analogue gauge face (dials on machinery)
    region("gauge", (w, h) => {
      g.fillStyle = "#1a1814";
      g.fillRect(0, 0, w, h);
      const cx = w / 2,
        cy = h * 0.6,
        r0 = Math.min(w, h) * 0.42;
      g.fillStyle = "#e4dcc4";
      g.beginPath();
      g.arc(cx, cy, r0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#2a2620";
      g.lineWidth = 3;
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI * (0.8 + i * 0.14);
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r0 * 0.78, cy + Math.sin(a) * r0 * 0.78);
        g.lineTo(cx + Math.cos(a) * r0 * 0.92, cy + Math.sin(a) * r0 * 0.92);
        g.stroke();
      }
      g.strokeStyle = "#b02a1a";
      g.lineWidth = 6;
      g.beginPath();
      g.arc(cx, cy, r0 * 0.85, Math.PI * 2.0, Math.PI * 2.2);
      g.stroke();
      g.strokeStyle = "#1a1814";
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(
        cx + Math.cos(Math.PI * 1.35) * r0 * 0.75,
        cy + Math.sin(Math.PI * 1.35) * r0 * 0.75,
      );
      g.stroke();
    });
    region("raidpaint", (w, h) => {
      g.fillStyle = "#d0d0d0";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#8e1d17";
      g.lineWidth = 7;
      g.lineCap = "round";
      for (let i = 0; i < 7; i++) {
        g.beginPath();
        g.moveTo(R() * w, R() * h);
        g.lineTo(R() * w, R() * h);
        g.stroke();
      }
      g.fillStyle = "#e8e0c8";
      g.font = "bold 44px Impact, sans-serif";
      g.fillText("X", w * 0.6, h * 0.7);
      blotches(w, h, 30, "#503020", 4, 16, 0.3);
    });
    region("wood", (w, h) => {
      g.fillStyle = "#c8b090";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        g.fillStyle =
          "rgba(60,40,20," + (0.1 + 0.15 * Math.sin(y * 0.3 + R())) + ")";
        g.fillRect(0, y, w, 1);
      }
    });
    region("tire", (w, h) => {
      g.fillStyle = "#909090";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#3a3a3a";
      for (let x = 0; x < w; x += 16) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x + 8, h / 2);
        g.lineTo(x, h);
        g.lineTo(x + 6, h);
        g.lineTo(x + 14, h / 2);
        g.lineTo(x + 6, 0);
        g.fill();
      }
    });
    region("numplate", (w, h) => {
      g.fillStyle = "#d8d0b8";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#20304a";
      g.font = "bold 40px Arial Black, sans-serif";
      g.textAlign = "center";
      g.fillText("N.Y.P.D.", w / 2, h * 0.35);
      g.font = "bold 30px monospace";
      g.fillText("UNIT 07", w / 2, h * 0.7);
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }
  L.atlas = function () {
    if (!atlasTex) atlasTex = buildAtlas();
    return atlasTex;
  };
  /** Map a 0..1 uv into an atlas region (with a small inset to avoid bleeding). */
  L.regionUV = function (name, u, v) {
    const r = REG[name] || REG.white;
    const inset = 3;
    const x = r[0] + inset + (r[2] - inset * 2) * u;
    const y = r[1] + inset + (r[3] - inset * 2) * v;
    return [x / ATLAS_SIZE, 1 - y / ATLAS_SIZE];
  };

  // ------------------------------------------------------------------
  // MATERIAL — one shader for every character (per-vertex PBR + FX)
  // Attributes: color (rgb), pbr (roughness, metalness, emissive), partId
  // Uniforms (per character material instance): uFlash, uHiPart, uHiColor,
  // uDissolve, uDissolveColor.  All instances share one GPU program.
  // ------------------------------------------------------------------
  let envTex = null;
  L.envMap = function () {
    if (envTex !== null) return envTex || null;
    envTex = false;
    try {
      if (!G.renderer) return null;
      // tiny equirect: hazy sky above, dusty brown ground below
      const cv = document.createElement("canvas");
      cv.width = 64;
      cv.height = 32;
      const g = cv.getContext("2d");
      const gr = g.createLinearGradient(0, 0, 0, 32);
      gr.addColorStop(0, "#b8bca0");
      gr.addColorStop(0.45, "#d8d0b0");
      gr.addColorStop(0.55, "#6a5e4a");
      gr.addColorStop(1, "#2a241c");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 32);
      const t = new THREE.CanvasTexture(cv);
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      const pm = new THREE.PMREMGenerator(G.renderer);
      envTex = pm.fromEquirectangular(t).texture;
      pm.dispose();
      t.dispose();
    } catch (e) {
      envTex = false;
    }
    return envTex || null;
  };
  // Vertex attributes added by the rig builder:
  //   pbr (roughness mul, metalness mul, emissive), partId (body part),
  //   mcls (material class for per-instance tinting: 0 none, 1 cloth,
  //         2 skin, 3 hair/fur, 4 leather, 5 paint/metal)
  const CHAR_VERT_DECL =
    "#include <common>\nattribute vec3 pbr;\nattribute float partId;\nattribute float mcls;\nvarying vec3 vPbr;\nvarying float vPart;\nvarying float vCls;\nvarying vec3 vLocalP;\n";
  const CHAR_FRAG_DECL = [
    "#include <common>",
    "uniform vec3 uFlash; uniform float uHiPart; uniform vec3 uHiColor; uniform float uDissolve; uniform vec3 uDissolveColor;",
    "uniform vec3 uTints[6]; uniform float uDirt; uniform float uBlood; uniform vec3 uBloodColor; uniform vec3 uRim; uniform float uEmisK;",
    "uniform sampler2D uFaceMap; uniform vec4 uFaceVar;",
    "varying vec3 vPbr; varying float vPart; varying float vCls; varying vec3 vLocalP;",
    "uniform float uBump; uniform float uSss;",
    "float chSkinK = 0.0;", // set in main (colour stage) before lighting: 1 on skin → subsurface wrap
    "float chHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }",
    "float chNoise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);",
    "  return mix(mix(mix(chHash(i+vec3(0,0,0)), chHash(i+vec3(1,0,0)), f.x), mix(chHash(i+vec3(0,1,0)), chHash(i+vec3(1,1,0)), f.x), f.y),",
    "             mix(mix(chHash(i+vec3(0,0,1)), chHash(i+vec3(1,0,1)), f.x), mix(chHash(i+vec3(0,1,1)), chHash(i+vec3(1,1,1)), f.x), f.y), f.z); }",
  ].join("\n");
  // Per-instance variety (tint by material class), street grime and
  // accumulated blood — all in bind-pose space so it sticks to the body.
  const CHAR_COLOR = [
    "#include <color_fragment>",
    // per-instance tint: never darken already-dark materials (black leather,
    // dark cloth) — below ~sRGB #40 the tint may only brighten
    "{ int ci = int(vCls + 0.5); if (ci > 0 && ci < 6) {",
    "  vec3 chT = uTints[ci]; float chL = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));",
    "  chT = mix(max(chT, vec3(1.0)), chT, smoothstep(0.02, 0.07, chL));",
    "  diffuseColor.rgb *= chT; } }",
    "diffuseColor.rgb = mix(diffuseColor.rgb, chHairC * uTints[3], chHair);",
    "chSkinK = (1.0 - step(0.5, abs(vCls - 2.0))) * (1.0 - chHair) * uSss;",
    // grime: darkens light materials, but reads as pale DUST on dark ones
    // PER-INDIVIDUAL FACE: face maps are per template, so every instance adds
    // its own moles, freckle density, blotchy redness and (Maniacs) raw scab patches
    // in the face's (s,t) space — two NPCs sharing a template never match.
    "#ifdef USE_MAP",
    "if (chFaceK > 0.5 && uFaceVar.w > 0.0 && abs(vCls - 2.0) < 0.5 && chHair < 0.5) {",
    "  vec2 fu = vec2(vMapUv.x - 2.0, 1.0 - vMapUv.y);",
    "  if (fu.y < 0.9) {",
    "    float sd = uFaceVar.w;",
    "    vec2 mg = fu * vec2(26.0, 20.0); vec2 mc = floor(mg);",
    "    float mh = chHash(vec3(mc, sd * 17.0));",
    "    if (mh > 0.972) { vec2 cc = mc + 0.3 + 0.4 * vec2(chHash(vec3(mc, sd + 3.1)), chHash(vec3(mc, sd + 5.7)));",
    "      float sp = 1.0 - smoothstep(0.09, 0.2, length(mg - cc)); diffuseColor.rgb *= mix(vec3(1.0), vec3(0.5, 0.4, 0.35), sp * 0.85); }",
    "    float fn = chNoise(vec3(fu * vec2(210.0, 150.0), sd * 5.0));",
    "    diffuseColor.rgb *= mix(vec3(1.0), vec3(0.8, 0.68, 0.58), smoothstep(0.72, 0.88, fn) * uFaceVar.x);",
    "    float bn = chNoise(vec3(fu * vec2(11.0, 8.0), sd * 3.0 + 7.0));",
    "    diffuseColor.rgb *= mix(vec3(1.0), vec3(1.07, 0.94, 0.93), uFaceVar.y * smoothstep(0.4, 0.8, bn));",
    "    if (uFaceVar.z > 0.0) { float rn = chNoise(vec3(fu * vec2(16.0, 12.0), sd * 2.0 + 1.3)) * 0.75 + chNoise(vec3(fu * vec2(47.0, 35.0), sd)) * 0.25;",
    "      float raw = smoothstep(0.6, 0.72, rn) * uFaceVar.z, crust = (smoothstep(0.55, 0.6, rn) - smoothstep(0.6, 0.66, rn)) * uFaceVar.z;",
    "      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.3, 0.72, 0.62), raw * 0.65) * (1.0 - crust * 0.45); }",
    "  } }",
    "#endif",
    "if (uDirt > 0.0) {",
    "  float dn = chNoise(vLocalP * 5.0) * 0.6 + chNoise(vLocalP * 17.0) * 0.4;",
    "  float low = 0.55 + 0.45 * (1.0 - smoothstep(0.0, 1.1, vLocalP.y));",
    "  float k = uDirt * smoothstep(0.4, 0.78, dn) * low;",
    "  vec3 chD = max(diffuseColor.rgb * vec3(0.55, 0.49, 0.4), vec3(0.075, 0.062, 0.045));",
    "  diffuseColor.rgb = mix(diffuseColor.rgb, chD, k);",
    "}",
    "if (uBlood > 0.0) {",
    "  float bn = chNoise(vLocalP * 9.0 + 3.7) * 0.7 + chNoise(vLocalP * 31.0) * 0.3;",
    "  float bk = smoothstep(1.0 - uBlood * 0.45, 1.02 - uBlood * 0.45, bn);",
    "  diffuseColor.rgb = mix(diffuseColor.rgb, uBloodColor, bk * 0.85);",
    "}",
  ].join("\n");
  // FACE MAP: vertices whose uv.x lies in [2,3) sample the per-character face
  // texture (skin detail painted in the head's own parameter space) instead of
  // the shared atlas. The face texture is stored LINEAR with 0.5 = neutral, so
  // it can both darken (brows, stubble, sockets) and brighten (scars, lips).
  // Its alpha channel is a roughness multiplier (oily T-zone, wet lips).
  // Both textures are always sampled (no divergent texture fetches).
  // Texels with alpha ≈ 0.2 are HAIR painted into the face (brows, stubble):
  // their rgb is the ABSOLUTE hair colour (sqrt-encoded) and replaces the
  // skin after the vertex colour, tinted by the per-instance HAIR tint — so
  // brows always match the character's (tinted) hair.
  const CHAR_MAP = [
    "float chFaceRough = 1.0; float chHair = 0.0; vec3 chHairC = vec3(0.0); float chFaceK = 0.0;",
    "#ifdef USE_MAP",
    "{ vec4 chA = texture2D(map, vMapUv);",
    "  vec4 chF = texture2D(uFaceMap, vec2(vMapUv.x - 2.0, vMapUv.y));",
    "  float chK = step(1.5, vMapUv.x); chFaceK = chK;",
    // hair shells with partial coverage (mcls 2.55..3): strand-shaped discard —
    // bright strands survive longest; beyond ~6 m a plain coverage threshold (stable, no shimmer)
    "  if (vCls > 2.52 && vCls < 2.995) {",
    "    float chCov = clamp((vCls - 2.55) / 0.45, 0.0, 1.0);",
    "    float chS = clamp((dot(chA.rgb, vec3(0.3333)) - 0.3) * 1.8, 0.0, 1.0);",
    "    float chN = chNoise(vLocalP * vec3(900.0, 70.0, 900.0)) * 0.65 + chNoise(vLocalP * vec3(260.0, 900.0, 260.0)) * 0.35;",
    "    float chH = mix(chS * 0.55 + chN * 0.45, 0.5, smoothstep(4.0, 9.0, length(vViewPosition)));",
    "    if (chH < 1.0 - chCov) discard;",
    "  }",
    "  chHair = chK * (1.0 - smoothstep(0.24, 0.42, chF.a));",
    "  chHairC = chF.rgb * chF.rgb;",
    "  vec4 sampledDiffuseColor = mix(chA, vec4(chF.rgb * 2.0, 1.0), chK);",
    "  chFaceRough = mix(1.0, chF.a, chK * (1.0 - chHair));",
    "  diffuseColor *= sampledDiffuseColor; }",
    "#endif",
  ].join("\n");
  const CHAR_EMISSIVE = [
    "#include <emissivemap_fragment>",
    // soft rim (sky bounce) so dark armour and clothing keep a readable silhouette
    "{ float chF = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);",
    "  totalEmissiveRadiance += uRim * (chF * chF * chF) * (0.3 + diffuseColor.rgb); }",
    "totalEmissiveRadiance += diffuseColor.rgb * vPbr.z * uEmisK + uFlash;",
    "if (uHiPart >= 0.0 && abs(vPart - uHiPart) < 0.5) totalEmissiveRadiance += uHiColor;",
    "if (uDissolve > 0.0) {",
    "  float dn = chNoise(vLocalP * 9.0) * 0.65 + chNoise(vLocalP * 23.0) * 0.35;",
    "  if (dn < uDissolve) discard;",
    "  float edge = 1.0 - smoothstep(uDissolve, uDissolve + 0.08, dn);",
    "  totalEmissiveRadiance += uDissolveColor * edge * 4.0;",
    "  diffuseColor.rgb *= mix(1.0, 0.25, smoothstep(0.0, 1.0, uDissolve * 1.5));",
    "}",
  ].join("\n");
  // SURFACE RELIEF: derivative bump mapping from the luminance of whatever
  // the fragment samples (atlas: weave, seams, stitching, folds, leather
  // grain, rivets, fur strands; face map: pores, wrinkles, scars, scabbed
  // crust). Heights are in METRES per unit of luminance (Mikkelsen's
  // unnormalised surface-gradient form → resolution independent, so close-ups
  // keep their relief), scaled per material class, faded out beyond 30 m.
  const CHAR_BUMP = [
    "#include <normal_fragment_maps>",
    "#if defined(USE_MAP) && __VERSION__ >= 300",
    "{ vec2 chUv = vMapUv; vec2 chDx = dFdx(chUv), chDy = dFdy(chUv);",
    "  vec3 chSX = dFdx(-vViewPosition), chSY = dFdy(-vViewPosition);",
    "  float chBk = uBump * (1.0 - smoothstep(14.0, 30.0, length(vViewPosition)));",
    "  int chC = int(vCls + 0.5);",
    "  chBk *= chC == 1 ? 1.0 : chC == 2 ? 0.55 : chC == 3 ? 1.6 : chC == 4 ? 0.9 : chC == 5 ? 0.45 : 0.6;",
    "  if (chBk > 1e-7) {",
    "    const vec3 chLW = vec3(0.299, 0.587, 0.114); float h0, hx, hy;",
    "    if (chUv.x > 1.5) { vec2 fu = chUv - vec2(2.0, 0.0);",
    "      h0 = dot(textureGrad(uFaceMap, fu, chDx, chDy).rgb, chLW); hx = dot(textureGrad(uFaceMap, fu + chDx, chDx, chDy).rgb, chLW); hy = dot(textureGrad(uFaceMap, fu + chDy, chDx, chDy).rgb, chLW); }",
    "    else { vec2 gx = chDx * 1.8, gy = chDy * 1.8; h0 = dot(textureGrad(map, chUv, gx, gy).rgb, chLW); hx = dot(textureGrad(map, chUv + chDx, gx, gy).rgb, chLW); hy = dot(textureGrad(map, chUv + chDy, gx, gy).rgb, chLW); }",
    "    vec2 dH = vec2(hx - h0, hy - h0) * chBk;",
    "    vec3 R1 = cross(chSY, normal), R2 = cross(normal, chSX);",
    "    float fDet = dot(chSX, R1) * faceDirection;",
    "    vec3 vGrad = sign(fDet) * (dH.x * R1 + dH.y * R2);",
    "    vec3 chN = abs(fDet) * normal - vGrad;",
    "    if (dot(chN, chN) > 1e-24) normal = normalize(chN);",
    "  } }",
    "#endif",
  ].join("\n");
  // SKIN: wrapped diffuse with a wider red wrap (cheap subsurface scattering)
  // — warm, soft terminators instead of the hard plastic falloff. Patched
  // into the physical direct-light function; skipped if the chunk differs.
  let physChunk = null;
  function charPhysChunk() {
    if (physChunk !== null) return physChunk;
    physChunk = false;
    try {
      const src = THREE.ShaderChunk.lights_physical_pars_fragment;
      const a = "vec3 irradiance = dotNL * directLight.color;";
      const b =
        "reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );";
      const m =
        /float dotNL = saturate\( dot\( ([\w.]+), directLight\.direction \) \);/.exec(
          src,
        );
      if (src && m && src.indexOf(a) >= 0 && src.indexOf(b) >= 0) {
        physChunk = src
          .replace(
            a,
            a +
              "\n\tvec3 chIrrD = irradiance;\n\tif (chSkinK > 0.0) { float chD = dot(" +
              m[1] +
              ", directLight.direction);" +
              " vec3 chW = clamp((vec3(chD) + vec3(0.62, 0.34, 0.26)) / vec3(1.62, 1.34, 1.26), 0.0, 1.0);" +
              " chIrrD = mix(irradiance, chW * directLight.color * vec3(1.0, 0.97, 0.95), chSkinK); }",
          )
          .replace(
            b,
            "reflectedLight.directDiffuse += chIrrD * BRDF_Lambert( material.diffuseColor );",
          );
      }
    } catch (e) {
      physChunk = false;
    }
    return physChunk;
  }
  /** Uniforms shared by EVERY character material (one object → one update per frame). */
  L.shared = {
    uRim: { value: new THREE.Color(0.05, 0.052, 0.046) },
    uBump: { value: 0.0016 }, // relief height (m) per unit luminance; 0 disables
    uSss: { value: 0.85 }, // skin subsurface wrap strength; 0 disables
  };
  L.makeMaterial = function (opts) {
    opts = opts || {};
    // FrontSide: open surfaces (coat panels, hoods, masks, visors) get an
    // inner shell at build time, so back-face culling is safe; shadows are
    // rendered from back faces (less acne on skinned bodies).
    const m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: L.atlas(),
      roughness: 1,
      metalness: 1,
      side: opts.side || THREE.FrontSide,
    });
    m.shadowSide =
      opts.side === THREE.DoubleSide ? THREE.DoubleSide : THREE.BackSide;
    const env = G.scene && G.scene.environment ? null : L.envMap();
    if (env) {
      m.envMap = env;
      m.envMapIntensity = 0.55;
    }
    const white = () => new THREE.Color(1, 1, 1);
    const u = (m.userData.uniforms = {
      uFlash: { value: new THREE.Color(0, 0, 0) },
      uHiPart: { value: -1 },
      uHiColor: { value: new THREE.Color(0, 0, 0) },
      uDissolve: { value: 0 },
      uDissolveColor: { value: new THREE.Color(1, 0.4, 0.1) },
      uTints: { value: [white(), white(), white(), white(), white(), white()] },
      uDirt: { value: 0 },
      uEmisK: { value: 1 },
      uBlood: { value: 0 },
      uBloodColor: { value: new THREE.Color(0.2, 0.015, 0.01) },
      uFaceMap: { value: L.faceTexDefault() },
      uFaceVar: { value: new THREE.Vector4(0, 0, 0, 0) }, // per-individual face: freckles, redness, raw scabs, seed (0 = off)
      uRim: L.shared.uRim,
      uBump: L.shared.uBump,
      uSss: L.shared.uSss,
    });
    m.onBeforeCompile = function (shader) {
      Object.assign(shader.uniforms, u);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", CHAR_VERT_DECL)
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvPbr = pbr; vPart = partId; vCls = mcls; vLocalP = position;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", CHAR_FRAG_DECL)
        .replace("#include <color_fragment>", CHAR_COLOR)
        .replace("#include <map_fragment>", CHAR_MAP)
        .replace(
          "#include <roughnessmap_fragment>",
          "float roughnessFactor = clamp(roughness * vPbr.x * chFaceRough, 0.04, 1.0);",
        )
        .replace(
          "#include <metalnessmap_fragment>",
          "float metalnessFactor = metalness * vPbr.y;",
        )
        .replace("#include <emissivemap_fragment>", CHAR_EMISSIVE)
        .replace("#include <normal_fragment_maps>", CHAR_BUMP);
      const phys = charPhysChunk();
      if (phys)
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <lights_physical_pars_fragment>",
          phys,
        );
    };
    m.customProgramCacheKey = function () {
      return "nrc_char_v8" + (m.envMap ? "_env" : "");
    };
    return m;
  };
  /**
   * Default face texture: the generic face painted by the humans builder
   * (L.faceGeneric, same head parameterisation for every human head), or a
   * 1×1 neutral grey (0.5 → ×1) until it exists.
   */
  let neutralFace = null;
  L.faceTexDefault = function () {
    if (L.faceGeneric) {
      try {
        const t = L.faceGeneric();
        if (t) return t;
      } catch (e) {
        /* fall through */
      }
    }
    if (!neutralFace) {
      neutralFace = new THREE.DataTexture(
        new Uint8Array([128, 128, 128, 255]),
        1,
        1,
        THREE.RGBAFormat,
      );
      neutralFace.needsUpdate = true;
    }
    return neutralFace;
  };
  /** Shared (never per-character) material used by gibs & player arms. */
  let sharedMat = null;
  L.sharedMaterial = function () {
    if (!sharedMat) {
      sharedMat = L.makeMaterial();
      sharedMat.userData.shared = true;
    }
    return sharedMat;
  };

  // ------------------------------------------------------------------
  // GEOMETRY PRIMITIVES — all return non-indexed-or-indexed BufferGeometry
  // with position/normal/uv. Coordinates are bone-local metres.
  // ------------------------------------------------------------------
  const P = (L.prim = {});
  const _m4 = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _s = new THREE.Vector3(),
    _p = new THREE.Vector3();
  /** Bake transform: position (x,y,z), rotation euler XYZ (rx,ry,rz), scale (sx,sy,sz | single). */
  P.xf = function (geo, x, y, z, rx, ry, rz, sx, sy, sz) {
    _p.set(x || 0, y || 0, z || 0);
    _e.set(rx || 0, ry || 0, rz || 0, "XYZ");
    _q.setFromEuler(_e);
    if (sx === undefined) sx = 1;
    if (sy === undefined) {
      sy = sx;
      sz = sx;
    }
    if (sz === undefined) sz = 1;
    _s.set(sx, sy, sz);
    _m4.compose(_p, _q, _s);
    geo.applyMatrix4(_m4);
    return geo;
  };
  P.sphere = function (
    rx,
    ry,
    rz,
    ws,
    hs,
    phiStart,
    phiLen,
    thetaStart,
    thetaLen,
  ) {
    const g = new THREE.SphereGeometry(
      1,
      ws || 12,
      hs || 9,
      phiStart || 0,
      phiLen === undefined ? Math.PI * 2 : phiLen,
      thetaStart || 0,
      thetaLen === undefined ? Math.PI : thetaLen,
    );
    g.scale(rx, ry === undefined ? rx : ry, rz === undefined ? rx : rz);
    return g;
  };
  /**
   * Partial sphere shell centred on the FRONT (-Z) of the character.
   * (three.js SphereGeometry puts phi=0 at -X, π/2 at +Z, π at +X and
   * 1.5π at -Z, so a front-facing arc must be centred on phi = 1.5π.)
   * arc: horizontal coverage (radians); thetaStart/thetaLen: vertical band from the top.
   */
  P.shell = function (rx, ry, rz, ws, hs, arc, thetaStart, thetaLen) {
    return P.sphere(
      rx,
      ry,
      rz,
      ws,
      hs,
      Math.PI * 1.5 - arc / 2,
      arc,
      thetaStart || 0,
      thetaLen === undefined ? Math.PI : thetaLen,
    );
  };
  /** Rounded (bevelled) box centred at origin. */
  P.box = function (w, h, d, r, seg) {
    seg = seg || 2;
    r = Math.min(
      r === undefined ? Math.min(w, h, d) * 0.15 : r,
      w / 2 - 1e-4,
      h / 2 - 1e-4,
      d / 2 - 1e-4,
    );
    const g = new THREE.BoxGeometry(w, h, d, seg * 2, seg * 2, seg * 2);
    if (r <= 0.0005) return g;
    const pos = g.attributes.position,
      nor = g.attributes.normal;
    const hx = w / 2 - r,
      hy = h / 2 - r,
      hz = d / 2 - r;
    const v = new THREE.Vector3(),
      inner = new THREE.Vector3(),
      n = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      inner.set(clamp(v.x, -hx, hx), clamp(v.y, -hy, hy), clamp(v.z, -hz, hz));
      n.subVectors(v, inner);
      if (n.lengthSq() < 1e-12) n.fromBufferAttribute(nor, i);
      else n.normalize();
      v.copy(inner).addScaledVector(n, r);
      pos.setXYZ(i, v.x, v.y, v.z);
      nor.setXYZ(i, n.x, n.y, n.z);
    }
    return g;
  };
  P.cyl = function (rt, rb, h, seg, open, hs) {
    return new THREE.CylinderGeometry(rt, rb, h, seg || 10, hs || 1, !!open);
  };
  P.cone = function (r, h, seg) {
    return new THREE.ConeGeometry(r, h, seg || 8);
  };
  P.torus = function (R, r, rs, ts, arc) {
    return new THREE.TorusGeometry(
      R,
      r,
      rs || 6,
      ts || 16,
      arc === undefined ? Math.PI * 2 : arc,
    );
  };
  P.lathe = function (pts, seg, phiStart, phiLen) {
    return new THREE.LatheGeometry(
      pts.map((p) => new THREE.Vector2(Math.max(0, p[0]), p[1])),
      seg || 12,
      phiStart || 0,
      phiLen === undefined ? Math.PI * 2 : phiLen,
    );
  };
  /**
   * Tapered capsule-ish limb hanging from y=0 down to y=-len.
   * r0: radius at top joint, r1: radius at bottom; opts.bulge (mid radius add),
   * opts.bulgeAt (0..1 from top), opts.flat (z scale), opts.seg.
   */
  P.limb = function (len, r0, r1, opts) {
    opts = opts || {};
    const seg = opts.seg || 10;
    const bul = opts.bulge || 0,
      ba = opts.bulgeAt === undefined ? 0.35 : opts.bulgeAt;
    const pts = [];
    const capB = opts.capB === undefined ? r1 * 0.9 : opts.capB,
      capT = opts.capT === undefined ? r0 * 0.9 : opts.capT;
    // bottom hemisphere-ish
    for (let i = 0; i <= 3; i++) {
      const a = ((i / 3) * Math.PI) / 2;
      pts.push([Math.sin(a) * r1, -len - Math.cos(a) * capB + capB * 0.15]);
    }
    const N = 6;
    for (let i = 1; i < N; i++) {
      const t = i / N; // 0 bottom → 1 top
      let r = lerp(r1, r0, t);
      const fromTop = 1 - t;
      r += bul * Math.exp(-Math.pow((fromTop - ba) / 0.28, 2));
      pts.push([r, -len + len * t]);
    }
    for (let i = 0; i <= 3; i++) {
      const a = ((1 - i / 3) * Math.PI) / 2;
      pts.push([Math.sin(a) * r0, Math.cos(a) * capT - capT * 0.15]);
    }
    // lathe requires increasing path; make sure first/last x = 0
    pts[0][0] = 0;
    pts[pts.length - 1][0] = 0;
    const g = P.lathe(pts, seg);
    if (opts.flat) g.scale(1, 1, opts.flat);
    if (opts.wide) g.scale(opts.wide, 1, 1);
    return g;
  };
  /**
   * Loft of super-ellipse rings (bodies, torsos, helmets, armour plates).
   * rings: [{y, rx, rz, ox=0, oz=0, n=2.2}] bottom→top.
   * opts: {seg=16, a0, a1 (partial angle range, 0 = front/-Z, +π/2 = +X), capTop, capBottom, flip}
   */
  P.loft = function (rings, opts) {
    opts = opts || {};
    const seg = opts.seg || 16;
    const partial = opts.a0 !== undefined;
    const a0 = partial ? opts.a0 : 0,
      a1 = partial ? opts.a1 : Math.PI * 2;
    const cols = seg + 1,
      rows = rings.length;
    const pos = [],
      uv = [],
      idx = [];
    const spow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
    for (let j = 0; j < rows; j++) {
      const R = rings[j];
      const e = 2 / (R.n || 2.2);
      for (let i = 0; i < cols; i++) {
        const a = a0 + (a1 - a0) * (i / seg);
        const x = (R.ox || 0) + R.rx * spow(Math.sin(a), e);
        const z = (R.oz || 0) - R.rz * spow(Math.cos(a), e);
        pos.push(x, R.y, z);
        uv.push(i / seg, j / (rows - 1));
      }
    }
    for (let j = 0; j < rows - 1; j++)
      for (let i = 0; i < seg; i++) {
        const a = j * cols + i,
          b = a + 1,
          c = a + cols,
          d = c + 1;
        // CCW when viewed from outside
        if (opts.flip) idx.push(a, b, c, b, d, c);
        else idx.push(a, c, b, b, c, d);
      }
    const addCap = (j, top) => {
      const R = rings[j];
      const center = pos.length / 3;
      pos.push(
        R.ox || 0,
        R.y + (top ? opts.capTopRaise || 0 : -(opts.capBottomDrop || 0)),
        R.oz || 0,
      );
      uv.push(0.5, top ? 1 : 0);
      for (let i = 0; i < seg; i++) {
        const a = j * cols + i,
          b = a + 1;
        if (top !== !!opts.flip) idx.push(center, b, a);
        else idx.push(center, a, b);
      }
    };
    if (opts.capTop) addCap(rows - 1, true);
    if (opts.capBottom) addCap(0, false);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  /**
   * Sweep a circle along a Catmull-Rom path with a radius profile — horns,
   * claws, tails, hoses, antennae, spikes, teeth.
   * pts: [[x,y,z]...]; radius: number | fn(t 0..1) ; opts {seg (tubular), rs (radial), cap}
   */
  P.sweep = function (pts, radius, opts) {
    opts = opts || {};
    const curve = new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    );
    const tSeg = opts.seg || 10,
      rs = opts.rs || 6;
    const frames = curve.computeFrenetFrames(tSeg, false);
    const pos = [],
      uv = [],
      idx = [];
    const rf = typeof radius === "function" ? radius : () => radius;
    for (let i = 0; i <= tSeg; i++) {
      const t = i / tSeg;
      const P0 = curve.getPointAt(t);
      const N = frames.normals[i],
        B = frames.binormals[i];
      const r = rf(t);
      for (let k = 0; k <= rs; k++) {
        const a = (k / rs) * Math.PI * 2;
        const cx = Math.cos(a),
          sy = Math.sin(a);
        pos.push(
          P0.x + r * (cx * N.x + sy * B.x),
          P0.y + r * (cx * N.y + sy * B.y),
          P0.z + r * (cx * N.z + sy * B.z),
        );
        uv.push(k / rs, t);
      }
    }
    const cols = rs + 1;
    for (let i = 0; i < tSeg; i++)
      for (let k = 0; k < rs; k++) {
        const a = i * cols + k,
          b = a + 1,
          c = a + cols,
          d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    if (opts.cap !== false) {
      // cap start
      const p0 = curve.getPointAt(0),
        s = pos.length / 3;
      pos.push(p0.x, p0.y, p0.z);
      uv.push(0.5, 0);
      for (let k = 0; k < rs; k++) idx.push(s, k + 1, k);
      const p1 = curve.getPointAt(1),
        e = pos.length / 3,
        base = tSeg * cols;
      pos.push(p1.x, p1.y, p1.z);
      uv.push(0.5, 1);
      for (let k = 0; k < rs; k++) idx.push(e, base + k, base + k + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  /** Extruded 2D shape (x,y points) with depth along z, centred on z. */
  P.extrude = function (pts2, depth, bevel) {
    const sh = new THREE.Shape(pts2.map((p) => new THREE.Vector2(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: !!bevel,
      bevelSize: bevel || 0,
      bevelThickness: bevel || 0,
      bevelSegments: 1,
      curveSegments: 6,
    });
    g.translate(0, 0, -depth / 2);
    // ExtrudeGeometry UVs are in shape units — normalise to 0..1
    const uv = g.attributes.uv;
    if (uv) {
      let mx = 1e-6;
      for (let i = 0; i < uv.count; i++)
        mx = Math.max(mx, Math.abs(uv.getX(i)), Math.abs(uv.getY(i)));
      for (let i = 0; i < uv.count; i++)
        uv.setXY(
          i,
          (uv.getX(i) / mx) * 0.5 + 0.5,
          (uv.getY(i) / mx) * 0.5 + 0.5,
        );
    }
    return g;
  };
  /** A plane facing -Z (the character's forward) — decals on chests etc. */
  P.decal = function (w, h) {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(Math.PI);
    return g;
  };
  /** Deform vertices: fn(v:Vector3) mutates v. Recomputes normals. */
  P.deform = function (geo, fn) {
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      fn(v, i);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  };
  /** Mirror a geometry across X (for left/right parts) — flips winding. */
  P.mirrorX = function (geo) {
    geo.scale(-1, 1, 1);
    const idx = geo.index;
    if (idx) {
      for (let i = 0; i < idx.count; i += 3) {
        const a = idx.getX(i + 1);
        idx.setX(i + 1, idx.getX(i + 2));
        idx.setX(i + 2, a);
      }
    } else {
      for (const name in geo.attributes) {
        const at = geo.attributes[name];
        const s = at.itemSize;
        for (let i = 0; i < at.count; i += 3)
          for (let k = 0; k < s; k++) {
            const t = at.array[(i + 1) * s + k];
            at.array[(i + 1) * s + k] = at.array[(i + 2) * s + k];
            at.array[(i + 2) * s + k] = t;
          }
      }
    }
    geo.computeVertexNormals();
    return geo;
  };

  // ------------------------------------------------------------------
  // RIG BUILDER
  // ------------------------------------------------------------------
  const PART_IDS = (L.PART_IDS = {
    head: 0,
    torso: 1,
    leftArm: 2,
    rightArm: 3,
    leftLeg: 4,
    rightLeg: 5,
    none: 9,
  });
  L.PART_NAMES = [
    "head",
    "torso",
    "leftArm",
    "rightArm",
    "leftLeg",
    "rightLeg",
  ];

  /**
   * Rig: define bones (bind positions, identity rotations) and attach
   * geometry to bones. build() produces a cached "template" from which
   * any number of SkinnedMesh instances are spawned.
   */
  class Rig {
    constructor(kind) {
      this.kind = kind || "biped";
      this.bones = []; // {name, parent, pos:[x,y,z], part, world:[x,y,z]}
      this.map = {};
      this.prims = []; // {bone, geo(with color/pbr), part}
      this.hit = []; // hit volumes {part, bone, a:[x,y,z], b:[x,y,z], r}
      this.markers = {}; // part → {bone, pos:[x,y,z], r}
      this.sockets = {}; // name → {bone, pos, rot}
      this.meta = {};
      this.soft = []; // per bone: soft joint at the bone's origin {r, reach, axis} (smooth skinning)
    }
    /**
     * Mark the joint at `name`'s origin as SOFT: vertices within ±r (along the
     * joint axis) and within `reach` of the axis are linearly blended between the
     * bone and its parent (and the parent's geometry toward this bone), so
     * elbows, knees, hips and the waist bend as one smooth surface instead of
     * rigid overlapping segments. axis defaults to the direction to the bone's
     * first child (or away from the parent).
     */
    softJoint(name, r, reach, axis) {
      const bi = this.map[name];
      if (bi === undefined || this.bones[bi].parent < 0) return;
      let ax = axis;
      if (!ax) {
        const ch = this.bones.find((b) => b.parent === bi);
        const v = ch ? ch.pos : this.bones[bi].pos;
        const l = Math.hypot(v[0], v[1], v[2]) || 1;
        ax = [v[0] / l, v[1] / l, v[2] / l];
      }
      this.soft[bi] = { r, reach, axis: ax };
    }
    /** Add a bone. pos is relative to parent. part: body part this bone belongs to (inherits parent's if omitted). */
    bone(name, parent, x, y, z, part) {
      const pi = parent ? this.map[parent] : -1;
      if (parent && pi === undefined)
        throw new Error("Rig: unknown parent bone " + parent);
      const pw = pi >= 0 ? this.bones[pi].world : [0, 0, 0];
      const b = {
        name,
        parent: pi,
        pos: [x, y, z],
        part: part || (pi >= 0 ? this.bones[pi].part : "torso"),
        world: [pw[0] + x, pw[1] + y, pw[2] + z],
      };
      this.map[name] = this.bones.length;
      this.bones.push(b);
      return this.bones.length - 1;
    }
    has(name) {
      return this.map[name] !== undefined;
    }
    world(name) {
      const b = this.bones[this.map[name]];
      return b ? b.world : [0, 0, 0];
    }
    /**
     * Attach geometry to a bone. o: {color, color2 (gradient top), grad:[bottomMul, topMul], noise,
     *   rough, metal, emis, region, uvScale, paint(fn(x,y,z,nx,ny,nz, out[3])), part}
     * geometry is in the bone's local space.
     */
    add(boneName, geo, o) {
      o = o || {};
      const bi = this.map[boneName];
      if (bi === undefined) {
        geo.dispose();
        return;
      }
      if (!geo.attributes.normal) geo.computeVertexNormals();
      // keep only the attributes we use (indexed geometry is preserved)
      for (const k of Object.keys(geo.attributes))
        if (k !== "position" && k !== "normal" && k !== "uv")
          geo.deleteAttribute(k);
      // open surfaces (coat panels, masks, hoods, decals) get an inner shell so the
      // shared material can use back-face culling
      if (!o.noDouble && L.isOpen(geo)) geo = L.doubleSided(geo);
      const n = geo.attributes.position.count;
      const pos = geo.attributes.position,
        nor = geo.attributes.normal;
      // --- vertex colours ---
      const base = L.col(o.color === undefined ? 0xaaaaaa : o.color);
      // near-black fabrics/paints vanish under the game's dim overcast light:
      // lift explicit material classes to a readable floor (tiny details keep true black)
      if (o.region && !o.keepDark && o.region !== "grille") {
        const lum = base.r * 0.2126 + base.g * 0.7152 + base.b * 0.0722;
        const floor = 0.026; // ≈ sRGB #2c: still reads as black, but keeps folds & panel lines visible
        if (lum < floor) {
          const k = lum > 1e-5 ? floor / lum : 0;
          if (k) base.multiplyScalar(k);
          else base.setRGB(floor, floor, floor);
        }
      }
      const top = o.color2 !== undefined ? L.col(o.color2) : null;
      const grad = o.grad || [0.9, 1.06];
      const noiseAmt = o.noise === undefined ? 0.12 : o.noise;
      geo.computeBoundingBox();
      const bb = geo.boundingBox;
      const hy = Math.max(1e-4, bb.max.y - bb.min.y);
      const col = new Float32Array(n * 3);
      const bw = this.bones[bi].world;
      const tmp = [0, 0, 0];
      const cc = new THREE.Color();
      for (let i = 0; i < n; i++) {
        const x = pos.getX(i),
          y = pos.getY(i),
          z = pos.getZ(i);
        const t = (y - bb.min.y) / hy;
        cc.copy(base);
        if (top) cc.lerp(top, t);
        const g = lerp(grad[0], grad[1], t);
        // grime noise in world-bind space (so parts line up)
        const wx = x + bw[0],
          wy = y + bw[1],
          wz = z + bw[2];
        const nz =
          (L.noise3(wx * 9, wy * 9, wz * 9) - 0.5) * 2 * noiseAmt +
          (L.hash3(wx * 97, wy * 97, wz * 97) - 0.5) * noiseAmt * 0.5;
        let r = cc.r * g * (1 + nz),
          gg = cc.g * g * (1 + nz),
          b = cc.b * g * (1 + nz * 0.9);
        if (o.paint) {
          tmp[0] = r;
          tmp[1] = gg;
          tmp[2] = b;
          o.paint(
            x,
            y,
            z,
            nor.getX(i),
            nor.getY(i),
            nor.getZ(i),
            tmp,
            wx,
            wy,
            wz,
          );
          r = tmp[0];
          gg = tmp[1];
          b = tmp[2];
        }
        if (o.vtint) {
          const vi = (i % (o.vtint.length / 3)) * 3;
          r *= o.vtint[vi];
          gg *= o.vtint[vi + 1];
          b *= o.vtint[vi + 2];
        } // baked AO / blush
        col[i * 3] = clamp(r, 0, 4);
        col[i * 3 + 1] = clamp(gg, 0, 4);
        col[i * 3 + 2] = clamp(b, 0, 4);
      }
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      // --- PBR attribute ---
      const pbr = new Float32Array(n * 3);
      const rough = o.rough === undefined ? 0.85 : o.rough,
        metal = o.metal || 0,
        emis = o.emis || 0;
      for (let i = 0; i < n; i++) {
        pbr[i * 3] = rough;
        pbr[i * 3 + 1] = metal;
        pbr[i * 3 + 2] = emis;
      }
      geo.setAttribute("pbr", new THREE.BufferAttribute(pbr, 3));
      // --- material class (per-instance tint) ---
      let cls = o.cls;
      if (cls === undefined) {
        const rg = o.region;
        if (emis > 0.3 || rg === "grille" || o.uvClamp)
          cls = 0; // lights, decals, screens keep their colour
        else if (rg === "skin" || rg === "crackskin") cls = 2;
        else if (rg === "fur") cls = 3;
        else if (rg === "cloth" || rg === "rags" || rg === "denim") cls = 1;
        else if (rg === "leather") cls = 4;
        else if (rg === "metal" || rg === "raidpaint" || metal > 0.3) cls = 5;
        else cls = 0;
      }
      geo.setAttribute(
        "mcls",
        new THREE.BufferAttribute(new Float32Array(n).fill(cls), 1),
      );
      // HAIR COVERAGE (hair shells): per-vertex 0..1 → mcls 2.55..3.0 (still class 3 = hair tint);
      // the shader discards strand-shaped gaps where coverage < 1 (soft, stranded hairlines and
      // a broken-up silhouette instead of a painted helmet edge)
      const hcv = geo.userData.hairCov;
      if (hcv && hcv.length === n && cls === 3) {
        const m = geo.attributes.mcls.array;
        for (let i = 0; i < n; i++) m[i] = 3 - 0.45 * (1 - clamp(hcv[i], 0, 1));
      }
      // --- UVs into atlas region ---
      const region = o.region || (metal > 0.3 ? "metal" : "grime");
      let uv = geo.attributes.uv;
      const uvOut = new Float32Array(n * 2);
      const us = o.uvScale || 1;
      if (o.faceUV && uv) {
        // face texture space: geometry uv = (s, t) with t = 0 at the canvas top
        for (let i = 0; i < n; i++) {
          uvOut[i * 2] = 2 + clamp(uv.getX(i), 0, 0.999);
          uvOut[i * 2 + 1] = 1 - clamp(uv.getY(i), 0, 1);
        }
      } else
        for (let i = 0; i < n; i++) {
          let u, v;
          if (uv && !o.boxUV) {
            u = uv.getX(i);
            v = uv.getY(i);
            if (us !== 1) {
              u = u * us;
              v = v * us;
              u -= Math.floor(u);
              v -= Math.floor(v);
            }
          } else {
            // box projection (no wrapping: parts sit within ~±1 m of their bone)
            const ax = Math.abs(nor.getX(i)),
              ay = Math.abs(nor.getY(i));
            const x = pos.getX(i),
              y = pos.getY(i),
              z = pos.getZ(i);
            if (ax > ay && ax > Math.abs(nor.getZ(i))) {
              u = z;
              v = y;
            } else if (ay > Math.abs(nor.getZ(i))) {
              u = x;
              v = z;
            } else {
              u = x;
              v = y;
            }
            u = u * 0.45 * us + 0.5;
            v = v * 0.45 * us + 0.5;
          }
          u = clamp(u, 0, 1);
          v = clamp(v, 0, 1);
          const t = L.regionUV(region, u, 1 - v);
          uvOut[i * 2] = t[0];
          uvOut[i * 2 + 1] = t[1];
        }
      geo.setAttribute("uv", new THREE.BufferAttribute(uvOut, 2));
      const part = o.part || this.bones[bi].part;
      geo.userData.part = part;
      geo.userData.keepLod = !!o.keepLod || emis > 0.8; // glowing eyes & lamps survive LOD
      geo.userData.rigid = !!o.rigid; // never soft-skinned (lenses, gadgets, straps)
      // custom skin weights (faces: chin → jaw, mouth corners, brows, cheeks):
      // o.skin(wx, wy, wz) → [[boneName, weight], …] (≤3 extra influences, the
      // rest stays on this bone). Evaluated in bind WORLD space.
      if (typeof o.skin === "function") {
        const idx = new Uint16Array(n * 4),
          wts = new Float32Array(n * 4);
        let any = false;
        for (let i = 0; i < n; i++) {
          const list = o.skin(
            pos.getX(i) + bw[0],
            pos.getY(i) + bw[1],
            pos.getZ(i) + bw[2],
          );
          let sum = 0,
            m = 0;
          idx[i * 4] = bi;
          if (list)
            for (const e of list) {
              if (m >= 3) break;
              const ob = this.map[e[0]],
                w = e[1];
              if (ob === undefined || !(w > 0.004)) continue;
              idx[i * 4 + 1 + m] = ob;
              wts[i * 4 + 1 + m] = w;
              sum += w;
              m++;
            }
          if (sum > 1) {
            for (let q = 1; q <= m; q++) wts[i * 4 + q] /= sum;
            sum = 1;
          }
          wts[i * 4] = 1 - sum;
          if (m) any = true;
        }
        if (any) geo.userData.infl = { idx, w: wts };
      }
      this.prims.push({ bone: bi, geo, part, rigid: !!o.rigid });
      return geo;
    }
    /** Same as add() but geometry is given in bind WORLD space (creature builders). */
    addW(boneName, geo, o) {
      const bi = this.map[boneName];
      if (bi === undefined) {
        geo.dispose();
        return;
      }
      const w = this.bones[bi].world;
      geo.translate(-w[0], -w[1], -w[2]);
      return this.add(boneName, geo, o);
    }
    /** Decal quad mapped to a full atlas region (uv 0..1 → region), white vertex colour. */
    decal(boneName, region, w, h, x, y, z, rx, ry, rz, o) {
      const g = P.decal(w, h);
      P.xf(g, x, y, z, rx || 0, ry || 0, rz || 0);
      o = Object.assign(
        { color: 0xffffff, noise: 0.04, grad: [1, 1], region, uvClamp: true },
        o || {},
      );
      return this.add(boneName, g, o);
    }
    /** Hit volume (capsule a→b in bone-local space) for raycasts & part targeting. */
    hitVol(part, boneName, a, b, r) {
      const bi = this.map[boneName];
      if (bi === undefined) return;
      this.hit.push({ part, bone: bi, a, b, r });
    }
    /** Part marker: the Object3D exposed as char.parts[part]. */
    marker(part, boneName, x, y, z, r) {
      const bi = this.map[boneName];
      if (bi === undefined) return;
      this.markers[part] = { bone: bi, pos: [x, y, z], r: r || 0.2 };
    }
    /** Named socket (weapon grip, muzzle, jet, eyes…). */
    socket(name, boneName, x, y, z, rx, ry, rz) {
      const bi = this.map[boneName];
      if (bi === undefined) return;
      this.sockets[name] = {
        bone: bi,
        pos: [x, y, z],
        rot: [rx || 0, ry || 0, rz || 0],
      };
    }

    /** Merge all prims into one skinned geometry. Returns a template object. */
    build() {
      const perBone = this.bones.map(() => []);
      for (const p of this.prims) perBone[p.bone].push(p.geo);
      const soft = this.bones.map((b, i) => this.soft[i] || null);
      const geo = L.mergeSkinned(this.prims, this.bones, soft);
      const tpl = {
        kind: this.kind,
        geometry: geo,
        bones: this.bones.map((b) => ({
          name: b.name,
          parent: b.parent,
          pos: b.pos.slice(),
          part: b.part,
          world: b.world.slice(),
        })),
        map: Object.assign({}, this.map),
        perBone, // bone-local geometries (non-skinned), used for gibs & LOD
        hit: this.hit.slice(),
        markers: Object.assign({}, this.markers),
        sockets: Object.assign({}, this.sockets),
        meta: Object.assign({}, this.meta),
        soft,
        triangles: geo.index.count / 3,
        vertices: geo.attributes.position.count,
        lods: [geo], // lods[1], lods[2] built lazily by L.getLod
      };
      this.prims = [];
      return tpl;
    }
  }
  L.Rig = Rig;

  /**
   * Merge bone-local prims [{geo, bone, part}] into ONE rigidly skinned
   * geometry (bind pose). Used for the full mesh and the LOD proxies.
   */
  L.mergeSkinned = function (prims, bones, soft) {
    let n = 0,
      ni = 0;
    for (const p of prims) {
      n += p.geo.attributes.position.count;
      ni += p.geo.index ? p.geo.index.count : p.geo.attributes.position.count;
    }
    const pos = new Float32Array(n * 3),
      nor = new Float32Array(n * 3),
      uv = new Float32Array(n * 2),
      col = new Float32Array(n * 3);
    const pbr = new Float32Array(n * 3),
      part = new Float32Array(n),
      cls = new Float32Array(n),
      si = new Uint16Array(n * 4),
      sw = new Float32Array(n * 4);
    const index = n > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    // soft-joint lookup: for each bone, the soft joints touching it
    // ({joint bone, other bone, origin offset in this bone's space, axis, sign})
    const touch = bones.map(() => []);
    if (soft) {
      for (let c = 0; c < bones.length; c++) {
        const J = soft[c];
        if (!J) continue;
        const pb = bones[c].parent;
        if (pb < 0) continue;
        // on the child: joint at its own origin, blend toward the parent below along<0
        touch[c].push({ other: pb, ox: 0, oy: 0, oz: 0, J, toChild: false });
        // on the parent: joint at the child's origin, blend toward the child for along>0
        const cp = bones[c].pos;
        touch[pb].push({
          other: c,
          ox: cp[0],
          oy: cp[1],
          oz: cp[2],
          J,
          toChild: true,
        });
      }
    }
    const ss = (a, b, x) => {
      const t = clamp((x - a) / (b - a), 0, 1);
      return t * t * (3 - 2 * t);
    };
    const inf = [0, 0, 0, 0, 0, 0]; // up to 3 extra influences: bone, weight pairs
    let o = 0,
      io = 0;
    for (const p of prims) {
      const g = p.geo,
        c = g.attributes.position.count,
        w = bones[p.bone].world;
      const gp = g.attributes.position.array,
        gn = g.attributes.normal.array,
        gu = g.attributes.uv.array,
        gc = g.attributes.color.array,
        gb = g.attributes.pbr.array;
      const gm = g.attributes.mcls ? g.attributes.mcls.array : null;
      const pid = PART_IDS[p.part] === undefined ? 9 : PART_IDS[p.part];
      const T =
        p.rigid || (g.userData && g.userData.rigid) ? null : touch[p.bone];
      for (let i = 0; i < c; i++) {
        const k = o + i;
        const lx = gp[i * 3],
          ly = gp[i * 3 + 1],
          lz = gp[i * 3 + 2];
        pos[k * 3] = lx + w[0];
        pos[k * 3 + 1] = ly + w[1];
        pos[k * 3 + 2] = lz + w[2];
        nor[k * 3] = gn[i * 3];
        nor[k * 3 + 1] = gn[i * 3 + 1];
        nor[k * 3 + 2] = gn[i * 3 + 2];
        uv[k * 2] = gu[i * 2];
        uv[k * 2 + 1] = gu[i * 2 + 1];
        col[k * 3] = gc[i * 3];
        col[k * 3 + 1] = gc[i * 3 + 1];
        col[k * 3 + 2] = gc[i * 3 + 2];
        pbr[k * 3] = gb[i * 3];
        pbr[k * 3 + 1] = gb[i * 3 + 1];
        pbr[k * 3 + 2] = gb[i * 3 + 2];
        part[k] = pid;
        cls[k] = gm ? gm[i] : 0;
        si[k * 4] = p.bone;
        sw[k * 4] = 1;
        const IF = g.userData && g.userData.infl;
        if (IF) {
          for (let q = 0; q < 4; q++) {
            si[k * 4 + q] = IF.idx[i * 4 + q];
            sw[k * 4 + q] = IF.w[i * 4 + q];
          }
          continue;
        }
        if (!T || !T.length) continue;
        let m = 0,
          sum = 0;
        for (let q = 0; q < T.length && m < 3; q++) {
          const t = T[q],
            J = t.J;
          const vx = lx - t.ox,
            vy = ly - t.oy,
            vz = lz - t.oz;
          const along = vx * J.axis[0] + vy * J.axis[1] + vz * J.axis[2];
          if (along < -J.r || along > J.r) {
            if (t.toChild ? along < -J.r : along > J.r) continue;
          }
          const rx = vx - along * J.axis[0],
            ry = vy - along * J.axis[1],
            rz = vz - along * J.axis[2];
          const rr = Math.sqrt(rx * rx + ry * ry + rz * rz);
          const fall = 1 - ss(J.reach * 0.7, J.reach * 1.2, rr);
          if (fall <= 0) continue;
          const wt =
            (t.toChild ? ss(-J.r, J.r, along) : 1 - ss(-J.r, J.r, along)) *
            fall;
          if (wt < 0.01) continue;
          inf[m * 2] = t.other;
          inf[m * 2 + 1] = wt;
          sum += wt;
          m++;
        }
        if (!m) continue;
        const sc = sum > 1 ? 1 / sum : 1;
        sw[k * 4] = Math.max(0, 1 - sum * sc);
        for (let q = 0; q < m; q++) {
          si[k * 4 + 1 + q] = inf[q * 2];
          sw[k * 4 + 1 + q] = inf[q * 2 + 1] * sc;
        }
      }
      if (g.index) {
        const ia = g.index.array;
        for (let i = 0; i < ia.length; i++) index[io++] = ia[i] + o;
      } else for (let i = 0; i < c; i++) index[io++] = o + i;
      o += c;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("pbr", new THREE.BufferAttribute(pbr, 3));
    geo.setAttribute("partId", new THREE.BufferAttribute(part, 1));
    geo.setAttribute("mcls", new THREE.BufferAttribute(cls, 1));
    geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(si, 4));
    geo.setAttribute("skinWeight", new THREE.BufferAttribute(sw, 4));
    geo.setIndex(new THREE.BufferAttribute(index, 1));
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    geo.userData.sharedCharGeo = true;
    return geo;
  };

  // ------------------------------------------------------------------
  // Open-surface detection & inner shells (enables back-face culling)
  // ------------------------------------------------------------------
  const _qk = (x, y, z) =>
    Math.round(x * 2e4) + "," + Math.round(y * 2e4) + "," + Math.round(z * 2e4);
  /** True if the (welded) surface has boundary edges, i.e. you could see inside it. */
  L.isOpen = function (geo) {
    const pos = geo.attributes.position,
      n = pos.count;
    const ids = new Int32Array(n),
      weld = new Map();
    for (let i = 0; i < n; i++) {
      const k = _qk(pos.getX(i), pos.getY(i), pos.getZ(i));
      let id = weld.get(k);
      if (id === undefined) {
        id = weld.size;
        weld.set(k, id);
      }
      ids[i] = id;
    }
    const idx = geo.index ? geo.index.array : null;
    const tn = idx ? idx.length : n;
    const edges = new Map();
    const W = weld.size + 1;
    const addE = (a, b) => {
      if (a === b) return;
      const k = a < b ? a * W + b : b * W + a;
      edges.set(k, (edges.get(k) || 0) + 1);
    };
    for (let t = 0; t < tn; t += 3) {
      const a = ids[idx ? idx[t] : t],
        b = ids[idx ? idx[t + 1] : t + 1],
        c = ids[idx ? idx[t + 2] : t + 2];
      if (a === b || b === c || a === c) continue;
      addE(a, b);
      addE(b, c);
      addE(c, a);
    }
    for (const v of edges.values()) if (v === 1) return true;
    return false;
  };
  /** Append a reversed copy (flipped normals & winding) of the surface. */
  L.doubleSided = function (geo) {
    const g = geo.index ? geo : geo; // indexed or not, handled below
    const n = g.attributes.position.count;
    const out = new THREE.BufferGeometry();
    for (const name of Object.keys(g.attributes)) {
      const a = g.attributes[name],
        s = a.itemSize;
      const arr = new Float32Array(n * 2 * s);
      arr.set(a.array.subarray ? a.array.subarray(0, n * s) : a.array);
      arr.set(a.array.subarray ? a.array.subarray(0, n * s) : a.array, n * s);
      if (name === "normal")
        for (let i = n * s; i < n * 2 * s; i++) arr[i] = -arr[i];
      out.setAttribute(name, new THREE.BufferAttribute(arr, s));
    }
    const src = g.index ? g.index.array : null;
    const tn = src ? src.length : n;
    const idx = new Uint32Array(tn * 2);
    for (let t = 0; t < tn; t += 3) {
      const a = src ? src[t] : t,
        b = src ? src[t + 1] : t + 1,
        c = src ? src[t + 2] : t + 2;
      idx[t] = a;
      idx[t + 1] = b;
      idx[t + 2] = c;
      idx[tn + t] = a + n;
      idx[tn + t + 1] = c + n;
      idx[tn + t + 2] = b + n;
    }
    out.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.dispose();
    return out;
  };

  // ------------------------------------------------------------------
  // LOD proxies: vertex-clustering simplification per prim (same skeleton,
  // so the SkinnedMesh just swaps geometry at distance — free).
  // ------------------------------------------------------------------
  L.simplify = function (geo, cell, dropK) {
    const pos = geo.attributes.position,
      nor = geo.attributes.normal,
      n = pos.count;
    if (!geo.boundingBox) geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const diag = Math.hypot(
      bb.max.x - bb.min.x,
      bb.max.y - bb.min.y,
      bb.max.z - bb.min.z,
    );
    if (geo.userData.keepLod) return diag > cell * 0.15 ? geo : null; // glowing bits stay as-is
    if (diag < cell * (dropK || 1.25)) return null; // tiny detail: drop
    const inv = 1 / cell;
    const map = new Map(),
      cl = new Int32Array(n);
    const acc = [];
    for (let i = 0; i < n; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i),
        nx = nor.getX(i),
        ny = nor.getY(i),
        nz = nor.getZ(i);
      // the normal octant keeps front/back shells and hard creases apart
      const oct = (nx > 0 ? 1 : 0) | (ny > 0 ? 2 : 0) | (nz > 0 ? 4 : 0);
      const k =
        Math.floor(x * inv) +
        "," +
        Math.floor(y * inv) +
        "," +
        Math.floor(z * inv) +
        "," +
        oct;
      let c = map.get(k);
      if (c === undefined) {
        c = acc.length;
        map.set(k, c);
        acc.push({ rep: i, px: 0, py: 0, pz: 0, nx: 0, ny: 0, nz: 0, w: 0 });
      }
      const A = acc[c];
      A.px += x;
      A.py += y;
      A.pz += z;
      A.nx += nx;
      A.ny += ny;
      A.nz += nz;
      A.w++;
      cl[i] = c;
    }
    const src = geo.index ? geo.index.array : null;
    const tn = src ? src.length : n;
    const tris = [];
    for (let t = 0; t < tn; t += 3) {
      const a = cl[src ? src[t] : t],
        b = cl[src ? src[t + 1] : t + 1],
        c = cl[src ? src[t + 2] : t + 2];
      if (a === b || b === c || a === c) continue;
      tris.push(a, b, c);
    }
    if (tris.length < 3) return null;
    // compact used clusters
    const used = new Int32Array(acc.length).fill(-1);
    let m = 0;
    for (const c of tris) if (used[c] < 0) used[c] = m++;
    const out = new THREE.BufferGeometry();
    const P3 = new Float32Array(m * 3),
      N3 = new Float32Array(m * 3);
    const extra = ["uv", "color", "pbr", "mcls"].filter(
      (k) => geo.attributes[k],
    );
    const ex = extra.map(
      (k) => new Float32Array(m * geo.attributes[k].itemSize),
    );
    for (let c = 0; c < acc.length; c++) {
      const j = used[c];
      if (j < 0) continue;
      const A = acc[c];
      P3[j * 3] = A.px / A.w;
      P3[j * 3 + 1] = A.py / A.w;
      P3[j * 3 + 2] = A.pz / A.w;
      const l = Math.hypot(A.nx, A.ny, A.nz) || 1;
      N3[j * 3] = A.nx / l;
      N3[j * 3 + 1] = A.ny / l;
      N3[j * 3 + 2] = A.nz / l;
      extra.forEach((k, e) => {
        const at = geo.attributes[k],
          s = at.itemSize;
        for (let q = 0; q < s; q++) ex[e][j * s + q] = at.array[A.rep * s + q];
      });
    }
    out.setAttribute("position", new THREE.BufferAttribute(P3, 3));
    out.setAttribute("normal", new THREE.BufferAttribute(N3, 3));
    extra.forEach((k, e) =>
      out.setAttribute(
        k,
        new THREE.BufferAttribute(ex[e], geo.attributes[k].itemSize),
      ),
    );
    const I = new Uint32Array(tris.length);
    for (let i = 0; i < tris.length; i++) I[i] = used[tris[i]];
    out.setIndex(new THREE.BufferAttribute(I, 1));
    // carry custom skin weights (continuous limbs, faces) with the cluster representative
    const IF = geo.userData.infl;
    if (IF) {
      const idx = new Uint16Array(m * 4),
        w = new Float32Array(m * 4);
      for (let c = 0; c < acc.length; c++) {
        const j = used[c];
        if (j < 0) continue;
        const r = acc[c].rep;
        for (let q = 0; q < 4; q++) {
          idx[j * 4 + q] = IF.idx[r * 4 + q];
          w[j * 4 + q] = IF.w[r * 4 + q];
        }
      }
      out.userData.infl = { idx, w };
    }
    return out;
  };
  /** LOD level geometry for a template (1 = mid, 2 = far); built on first use. */
  L.getLod = function (tpl, level) {
    if (!level) return tpl.geometry;
    if (tpl.lods[level]) return tpl.lods[level];
    try {
      const h = (tpl.meta && tpl.meta.height) || 1.8;
      // cell size scales with the creature (min absolute size so tiny critters still simplify)
      // level 3 = "mid" for faced templates: only the dense head/face prims are
      // simplified (fine cell), the body stays as authored
      const cell =
        level === 3
          ? 0.009
          : level === 1
            ? Math.max(h * 0.03, 0.014)
            : Math.max(h * 0.075, 0.04);
      const faceBones =
        level === 3
          ? new Set(
              tpl.bones
                .map((b, i) => (b.part === "head" ? i : -1))
                .filter((i) => i >= 0),
            )
          : null;
      const prims = [];
      for (let bi = 0; bi < tpl.perBone.length; bi++) {
        for (const g of tpl.perBone[bi]) {
          if (faceBones && !faceBones.has(bi)) {
            prims.push({
              geo: g,
              bone: bi,
              part: g.userData.part || tpl.bones[bi].part,
              rigid: !!g.userData.rigid,
              keep: true,
            });
            continue;
          }
          const s = L.simplify(
            g,
            cell,
            level === 1 ? 1.25 : level === 3 ? 0.8 : 2.2,
          );
          if (s)
            prims.push({
              geo: s,
              bone: bi,
              part: g.userData.part || tpl.bones[bi].part,
              rigid: !!g.userData.rigid,
            });
        }
      }
      const geo = prims.length
        ? L.mergeSkinned(prims, tpl.bones, tpl.soft)
        : tpl.geometry;
      for (const p of prims)
        if (!p.keep && p.geo !== geo && !tpl.perBone[p.bone].includes(p.geo))
          p.geo.dispose();
      tpl.lods[level] = geo;
      tpl["lodTris" + level] = geo.index ? geo.index.count / 3 : 0;
    } catch (e) {
      tpl.lods[level] = tpl.geometry;
      if (G.reportError) G.reportError("chars.lod", e);
    }
    return tpl.lods[level];
  };

  /**
   * Geometry of a bone subtree as a plain (non-skinned) mesh, relative to
   * the subtree root bone. Used for dismemberment gibs.
   */
  L.subtreeGeometry = function (tpl, rootBone, excludeRoot) {
    const inSub = (bi) => {
      let b = bi;
      while (b >= 0) {
        if (b === rootBone) return true;
        b = tpl.bones[b].parent;
      }
      return false;
    };
    const rw = tpl.bones[rootBone].world;
    const geos = [];
    for (let bi = 0; bi < tpl.bones.length; bi++) {
      if (!inSub(bi) || (excludeRoot && bi === rootBone)) continue;
      const w = tpl.bones[bi].world;
      for (const g of tpl.perBone[bi]) {
        const c = g.clone();
        c.translate(w[0] - rw[0], w[1] - rw[1], w[2] - rw[2]);
        geos.push(c);
      }
    }
    if (!geos.length) return null;
    return L.mergePlain(geos);
  };
  /** Merge non-indexed geometries that carry position/normal/uv/color/pbr. */
  L.mergePlain = function (geos) {
    let n = 0,
      ni = 0;
    for (const g of geos) {
      n += g.attributes.position.count;
      ni += g.index ? g.index.count : g.attributes.position.count;
    }
    const names = ["position", "normal", "uv", "color", "pbr", "mcls"],
      sizes = [3, 3, 2, 3, 3, 1];
    const out = new THREE.BufferGeometry();
    names.forEach((nm, k) => {
      const arr = new Float32Array(n * sizes[k]);
      let o = 0;
      for (const g of geos) {
        const a = g.attributes[nm];
        if (a) arr.set(a.array, o);
        o += g.attributes.position.count * sizes[k];
      }
      out.setAttribute(nm, new THREE.BufferAttribute(arr, sizes[k]));
    });
    const index = n > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0,
      io = 0;
    for (const g of geos) {
      const c = g.attributes.position.count;
      if (g.index) {
        const ia = g.index.array;
        for (let i = 0; i < ia.length; i++) index[io++] = ia[i] + vo;
      } else for (let i = 0; i < c; i++) index[io++] = vo + i;
      vo += c;
    }
    out.setIndex(new THREE.BufferAttribute(index, 1));
    const part = new Float32Array(n).fill(9);
    out.setAttribute("partId", new THREE.BufferAttribute(part, 1));
    for (const g of geos) g.dispose();
    out.computeBoundingSphere();
    return out;
  };

  // ------------------------------------------------------------------
  // Two-bone IK (analytic). Bones hang along -Y in bind pose; the second
  // bone bends about its local X axis. Works in world space targets.
  // ------------------------------------------------------------------
  const _t = new THREE.Vector3(),
    _pl = new THREE.Vector3(),
    _s0 = new THREE.Vector3(),
    _d = new THREE.Vector3(),
    _u = new THREE.Vector3(),
    _el = new THREE.Vector3();
  const _xA = new THREE.Vector3(),
    _yA = new THREE.Vector3(),
    _zA = new THREE.Vector3(),
    _mb = new THREE.Matrix4(),
    _inv = new THREE.Matrix4(),
    _qa = new THREE.Quaternion(),
    _qb = new THREE.Quaternion();
  /**
   * boneA (upper), boneB (lower, child of A), targetW (world pos for B's child joint = end effector),
   * poleW (world pos the joint should bend toward), lenA, lenB, weight (0..1 blend with current FK).
   * Assumes A.parent.matrixWorld is current. Updates A and B quaternions.
   */
  L.solveIK2 = function (A, B, targetW, poleW, lenA, lenB, weight) {
    const parent = A.parent;
    _inv.copy(parent.matrixWorld).invert();
    _t.copy(targetW).applyMatrix4(_inv);
    _pl.copy(poleW).applyMatrix4(_inv);
    // parent may be scaled (unlikely) — lengths are in local units already
    _s0.copy(A.position);
    _d.subVectors(_t, _s0);
    let dist = _d.length();
    const maxR = (lenA + lenB) * 0.9995,
      minR = Math.abs(lenA - lenB) + 1e-3;
    dist = clamp(dist, minR, maxR);
    if (_d.lengthSq() < 1e-10) return;
    _d.normalize();
    const cosA = clamp(
      (lenA * lenA + dist * dist - lenB * lenB) / (2 * lenA * dist),
      -1,
      1,
    );
    const sinA = Math.sqrt(1 - cosA * cosA);
    _u.subVectors(_pl, _s0);
    _u.addScaledVector(_d, -_u.dot(_d));
    if (_u.lengthSq() < 1e-8) {
      _u.set(0, 0, 1).addScaledVector(_d, -_d.z);
    }
    _u.normalize();
    _el
      .copy(_s0)
      .addScaledVector(_d, lenA * cosA)
      .addScaledVector(_u, lenA * sinA);
    // A basis: local -Y → elbow direction ; local X = bend plane normal
    _yA.subVectors(_s0, _el).normalize(); // +Y points from elbow back to shoulder
    _xA.crossVectors(_d, _u).normalize(); // normal of bend plane
    _zA.crossVectors(_xA, _yA).normalize();
    _xA.crossVectors(_yA, _zA).normalize();
    _mb.makeBasis(_xA, _yA, _zA);
    _qa.setFromRotationMatrix(_mb);
    // Forearm: angle about local X so the end reaches the target (in A space)
    // target relative to elbow, expressed in A's frame
    const tx = _t.x - _el.x,
      ty = _t.y - _el.y,
      tz = _t.z - _el.z;
    const ly = tx * _yA.x + ty * _yA.y + tz * _yA.z,
      lz = tx * _zA.x + ty * _zA.y + tz * _zA.z;
    let ang = Math.atan2(-lz, -ly);
    if (ang < -0.05) {
      // bending the wrong way: flip the bend normal
      _xA.negate();
      _zA.negate();
      _mb.makeBasis(_xA, _yA, _zA);
      _qa.setFromRotationMatrix(_mb);
      ang = -ang;
    }
    _qb.setFromAxisAngle(_xA.set(1, 0, 0), ang);
    const w = weight === undefined ? 1 : weight;
    if (w >= 0.999) {
      A.quaternion.copy(_qa);
      B.quaternion.copy(_qb);
    } else {
      A.quaternion.slerp(_qa, w);
      B.quaternion.slerp(_qb, w);
    }
  };

  // ------------------------------------------------------------------
  // Template cache
  // ------------------------------------------------------------------
  // Templates are shared by every instance built from the same (type,
  // appearance variant). The cache is an LRU capped at MAX_TEMPLATES: when a
  // new template pushes it over, the least-recently-used template with NO live
  // characters (tpl.users === 0) has its geometry (and LOD proxies) disposed.
  L.templates = new Map();
  L.MAX_TEMPLATES = 96;
  L.getTemplate = function (key, buildFn) {
    let t = L.templates.get(key);
    if (t) {
      L.templates.delete(key);
      L.templates.set(key, t);
      return t;
    } // bump to most-recent
    t = buildFn();
    t.users = 0;
    t.key = key;
    L.templates.set(key, t);
    if (L.templates.size > L.MAX_TEMPLATES) L.evictTemplates();
    return t;
  };
  L.disposeTemplate = function (t) {
    const seen = new Set();
    for (const g of [t.geometry].concat(t.lods || []))
      if (g && !seen.has(g)) {
        seen.add(g);
        g.dispose();
      }
    for (const list of t.perBone || []) for (const g of list) g.dispose();
    if (L.faceTexDrop) {
      try {
        L.faceTexDrop(t);
      } catch (e) {
        /* ignore */
      }
    }
    if (t.faceTex) {
      try {
        t.faceTex.dispose();
      } catch (e) {
        /* ignore */
      }
      t.faceTex = null;
    }
    t.disposed = true;
  };
  L.evictTemplates = function () {
    for (const [k, t] of L.templates) {
      if (L.templates.size <= L.MAX_TEMPLATES) break;
      if (t.users > 0) continue;
      L.templates.delete(k);
      L.disposeTemplate(t);
    }
  };

  // Builders register here: L.builders[type] = (opts, rng) → {tpl, info}
  L.builders = {};
  L.infos = {};
})();
