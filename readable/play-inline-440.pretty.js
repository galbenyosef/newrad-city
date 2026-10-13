/* src/props/00_core.js */
/* =====================================================================
 * NEW RAD CITY — PROPS & SET DRESSING  (module 'props', order 30)
 * 00_core.js — namespace, shared materials, fallback textures, the Kit
 * geometry builder (procedural sub-assemblies with baked vertex colours:
 * ambient occlusion, grime, rust creep), the prototype registry, the
 * static chunk Batcher, and two cheap shader-driven effect fields:
 *   * GlowField  — one Points draw call for every lamp bulb / neon / radiation glow
 *                  (flicker + night intensity in the shader)
 *   * FlameField — instanced billboard flames + smoke for burning barrels,
 *                  campfires and wrecked cars (2 draw calls total)
 *
 * Other files in this dir extend G.props (public) and G.props._ (internal).
 * ===================================================================== */
(function () {
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
  X.mat = function (key) {
    if (MATS[key]) return MATS[key];
    let m;
    const std = (o) => {
      const mm = new THREE.MeshStandardMaterial(
        Object.assign({ vertexColors: true }, o),
      );
      return mm;
    };
    switch (key) {
      case "metal":
        m = std({ map: X.ownTex("grime"), roughness: 0.62, metalness: 0.35 });
        break;
      case "paint":
        m = std({ map: X.ownTex("grime"), roughness: 0.48, metalness: 0.32 });
        break;
      case "chrome":
        m = std({ roughness: 0.3, metalness: 0.75, color: 0xdddddd });
        break;
      case "rust":
        m = std({
          map: X.tex("rust", "rust"),
          roughness: 0.92,
          metalness: 0.25,
          color: 0x9a9088,
        });
        break;
      case "concrete":
        m = std({
          map: X.tex("concrete", "concrete"),
          roughness: 0.96,
          metalness: 0,
        });
        break;
      case "wood":
        m = std({
          map: X.tex("wood_planks", "wood"),
          roughness: 0.88,
          metalness: 0,
        });
        break;
      case "fabric":
        m = std({ map: X.ownTex("fabric"), roughness: 1, metalness: 0 });
        break;
      case "plain":
        m = std({ roughness: 0.72, metalness: 0.05 });
        break;
      case "glass":
        m = std({ roughness: 0.12, metalness: 0.65, color: 0x9fb0ae });
        break;
      case "atlas":
        m = std({ map: X.atlasTexture(), roughness: 0.72, metalness: 0.12 });
        break;
      case "trim":
        m = std({ map: X.atlasTexture(), roughness: 0.42, metalness: 0.5 });
        break;
      case "glow":
        m = new THREE.MeshBasicMaterial({ vertexColors: true });
        break;
      case "screen":
        m = new THREE.MeshBasicMaterial({
          vertexColors: true,
          map: X.atlasTexture(),
        });
        break;
      case "chain":
        m = std({
          map: X.ownTex("chain"),
          alphaTest: 0.28,
          transparent: false,
          side: THREE.DoubleSide,
          roughness: 0.5,
          metalness: 0.6,
        });
        break;
      default:
        m = std({ roughness: 0.8 });
    }
    m.userData.shared = true;
    m.name = "props_" + key;
    MATS[key] = m;
    return m;
  };
  /** The atlas texture is created by 10_atlas.js; placeholder until then. */
  X.atlasTexture = function () {
    return X._atlasTex || null;
  };

  // ------------------------------------------------------------------
  // Geometry helpers
  // ------------------------------------------------------------------
  const _m4 = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _p = new THREE.Vector3(),
    _s = new THREE.Vector3();
  function xform(o) {
    _e.set(o.rx || 0, o.ry || 0, o.rz || 0, o.order || "YXZ");
    _q.setFromEuler(_e);
    _p.set(o.x || 0, o.y || 0, o.z || 0);
    if (Array.isArray(o.s)) _s.set(o.s[0], o.s[1], o.s[2]);
    else {
      const s = o.s === undefined ? 1 : o.s;
      _s.set(s, s, s);
    }
    return _m4.compose(_p, _q, _s);
  }
  X.xform = xform;

  /** Box-projected UVs (metres * scale) chosen by dominant normal axis. */
  function boxUV(g, scale) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    const uv = new Float32Array(cnt * 2);
    for (let i = 0; i < cnt; i++) {
      const ax = Math.abs(n.getX(i)),
        ay = Math.abs(n.getY(i)),
        az = Math.abs(n.getZ(i));
      let u, v;
      if (ay >= ax && ay >= az) {
        u = p.getX(i);
        v = p.getZ(i);
      } else if (ax >= az) {
        u = p.getZ(i);
        v = p.getY(i);
      } else {
        u = p.getX(i);
        v = p.getY(i);
      }
      uv[i * 2] = u * scale;
      uv[i * 2 + 1] = v * scale;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  }
  X.boxUV = boxUV;

  /**
   * Bake vertex colours: base colour x height-AO x grime noise x rust creep.
   * o: {color, colorFn(x,y,z)->Color|hex, ao:[min, height], grime:0..1, rust:0..1, rustColor, noiseScale, seed}
   */
  const RUST_C = new THREE.Color(X.PAL.rust),
    RUST_D = new THREE.Color(X.PAL.rustDark);
  function bakeColors(g, o, worldOff) {
    const p = g.attributes.position,
      cnt = p.count;
    const col = new Float32Array(cnt * 3);
    const base = X.color(o.color !== undefined ? o.color : 0xffffff);
    const aoMin = o.ao ? o.ao[0] : 0.62,
      aoH = o.ao ? o.ao[1] : 0.55;
    const grime = o.grime === undefined ? 0.18 : o.grime;
    const rust = o.rust || 0;
    const rc = o.rustColor ? X.color(o.rustColor) : RUST_C;
    const ns = o.noiseScale || 2.3,
      seed = o.seed || 0;
    const tmp = new THREE.Color();
    for (let i = 0; i < cnt; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      if (o.colorFn) {
        const r = o.colorFn(x, y, z);
        tmp.set(r);
      } else tmp.copy(base);
      // ambient occlusion by height above the prop's ground plane
      const ao =
        aoMin >= 1
          ? 1
          : X.lerp(aoMin, 1, X.clamp((y - (o.aoY0 || 0)) / aoH, 0, 1));
      const n = X.noise3(x * ns + seed, y * ns, z * ns - seed);
      let k = ao * (1 - grime * n);
      if (rust > 0) {
        const rn =
          X.noise3(x * 3.1 + 7 + seed, y * 3.3, z * 2.9 + 3) +
          (1 - X.clamp(y / 1.2, 0, 1)) * 0.25;
        const t = X.smooth(1.05 - rust * 0.75, 1.2 - rust * 0.7, rn);
        if (t > 0) {
          tmp.lerp(rn > 0.9 ? RUST_D : rc, t);
        }
      }
      col[i * 3] = tmp.r * k;
      col[i * 3 + 1] = tmp.g * k;
      col[i * 3 + 2] = tmp.b * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  X.bakeColors = bakeColors;

  /**
   * Superellipse loft (car bodies, rounded cabinets, bus shells).
   * stations: [{z, wb, wt, yb, yt, n}] ordered along +z; wb/wt = half widths at bottom/top.
   * Returns indexed BufferGeometry with smooth normals and flat end faces.
   */
  X.loftGeometry = function (stations, seg, opts) {
    opts = opts || {};
    seg = seg || 16;
    const pos = [],
      idx = [];
    const se = (v, n) => Math.sign(v) * Math.pow(Math.abs(v), 2 / n);
    const ringStart = [];
    for (let i = 0; i < stations.length; i++) {
      const s = stations[i];
      ringStart.push(pos.length / 3);
      for (let j = 0; j < seg; j++) {
        const th = (j / seg) * X.TAU - Math.PI / 2;
        const n = s.n || 4;
        const ux = se(Math.cos(th), n),
          uy = se(Math.sin(th), n);
        const t = (uy + 1) / 2;
        const w = X.lerp(s.wb, s.wt, t);
        pos.push(ux * w + (s.x || 0), X.lerp(s.yb, s.yt, t), s.z);
      }
    }
    for (let i = 0; i < stations.length - 1; i++) {
      const a = ringStart[i],
        b = ringStart[i + 1];
      for (let j = 0; j < seg; j++) {
        const j2 = (j + 1) % seg;
        // rings run CCW (seen from +z) and advance along +z → this winding faces outward
        idx.push(a + j, a + j2, b + j, a + j2, b + j2, b + j);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const parts = [g];
    // flat end faces (separate verts so edges stay crisp). start face looks -z, end face +z
    const cap = (si, isEnd) => {
      const s = stations[si],
        cp = [],
        ci = [];
      const cy = (s.yb + s.yt) / 2;
      cp.push(s.x || 0, cy, s.z);
      for (let j = 0; j < seg; j++) {
        const k = (ringStart[si] + j) * 3;
        cp.push(pos[k], pos[k + 1], pos[k + 2]);
      }
      for (let j = 0; j < seg; j++) {
        const j2 = (j + 1) % seg;
        if (isEnd) ci.push(0, 1 + j, 1 + j2);
        else ci.push(0, 1 + j2, 1 + j);
      }
      const cg = new THREE.BufferGeometry();
      cg.setAttribute("position", new THREE.Float32BufferAttribute(cp, 3));
      cg.setIndex(ci);
      cg.computeVertexNormals();
      parts.push(cg);
    };
    if (opts.capStart !== false) cap(0, false);
    if (opts.capEnd !== false) cap(stations.length - 1, true);
    if (parts.length === 1) return g;
    // merge (no uv/colour yet)
    return mergeRaw(parts);
  };
  function mergeRaw(parts) {
    let vc = 0,
      ic = 0;
    for (const p of parts) {
      vc += p.attributes.position.count;
      ic += p.index ? p.index.count : p.attributes.position.count;
    }
    const pos = new Float32Array(vc * 3),
      nor = new Float32Array(vc * 3),
      idx = new Uint32Array(ic);
    let vo = 0,
      io = 0;
    for (const p of parts) {
      pos.set(p.attributes.position.array, vo * 3);
      nor.set(p.attributes.normal.array, vo * 3);
      if (p.index) {
        for (let i = 0; i < p.index.count; i++)
          idx[io++] = p.index.array[i] + vo;
      } else
        for (let i = 0; i < p.attributes.position.count; i++)
          idx[io++] = i + vo;
      vo += p.attributes.position.count;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    return g;
  }
  X.mergeRaw = mergeRaw;

  /** Extrude a 2D outline (array of [u,v]) by depth; shape plane XY, depth along +Z (centered). */
  X.extrudeGeometry = function (pts, depth, bevel) {
    const sh = new THREE.Shape();
    sh.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: !!bevel,
      bevelThickness: bevel || 0,
      bevelSize: bevel || 0,
      bevelSegments: 1,
      curveSegments: 4,
    });
    g.translate(0, 0, -depth / 2);
    return g;
  };

  // ------------------------------------------------------------------
  // Kit: builds a prototype from primitives. All positions in metres,
  // prop-local (y = 0 is the ground, -Z is the prop's "front").
  // Every primitive: (matKey, ...dims, x, y, z, opts) where (x,y,z) is the
  // CENTRE of the primitive; opts: {rx,ry,rz,s, color, colorFn, ao, grime,
  // rust, tint (instance tint applies), uv:'keep', uvScale, seg}.
  // ------------------------------------------------------------------
  class Kit {
    constructor(seed) {
      this.list = [];
      this.r = U.rng(seed || 7);
      this.meta = {};
      this.seed = seed || 7;
    }
    add(mat, geom, o) {
      o = o || {};
      const g = geom.index ? geom.toNonIndexed() : geom; // non-indexed → flat per-face UV/AO behaves
      g.applyMatrix4(xform(o));
      if (o.smooth) g.computeVertexNormals();
      else if (!g.attributes.normal) g.computeVertexNormals();
      if (o.uv !== "keep" || !g.attributes.uv) boxUV(g, o.uvScale || 1);
      if (o.uvFn) o.uvFn(g);
      bakeColors(g, Object.assign({ seed: this.seed * 0.37 }, o));
      this.list.push({ mat, tint: !!o.tint, geom: g });
      return g;
    }
    /** Keep index + smooth normals (lofted shells, spheres) */
    addSmooth(mat, geom, o) {
      o = o || {};
      const g = geom;
      g.applyMatrix4(xform(o));
      g.computeVertexNormals();
      if (o.uv !== "keep" || !g.attributes.uv) boxUV(g, o.uvScale || 1);
      if (o.uvFn) o.uvFn(g);
      bakeColors(g, Object.assign({ seed: this.seed * 0.37 }, o));
      this.list.push({ mat, tint: !!o.tint, geom: g });
      return g;
    }
    box(mat, w, h, d, x, y, z, o) {
      o = Object.assign({}, o, { x, y, z });
      const sg = o.segs || [1, 1, 1];
      return this.add(
        mat,
        new THREE.BoxGeometry(w, h, d, sg[0], sg[1], sg[2]),
        o,
      );
    }
    /** Box whose y is its bottom (handy for stacking) */
    boxB(mat, w, h, d, x, y, z, o) {
      return this.box(mat, w, h, d, x, y + h / 2, z, o);
    }
    /** Chamfered box (extruded rounded rectangle). */
    cbox(mat, w, h, d, x, y, z, o) {
      o = o || {};
      const b = Math.min(o.bevel || 0.03, w * 0.3, h * 0.3, d * 0.3);
      const sh = new THREE.Shape();
      const hw = w / 2 - b,
        hh = h / 2 - b;
      sh.moveTo(-hw, -hh);
      sh.lineTo(hw, -hh);
      sh.lineTo(hw, hh);
      sh.lineTo(-hw, hh);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: Math.max(0.001, d - 2 * b),
        bevelEnabled: true,
        bevelThickness: b,
        bevelSize: b,
        bevelSegments: 1,
        curveSegments: 1,
      });
      g.translate(0, 0, -(d - 2 * b) / 2);
      g.deleteAttribute("uv");
      return this.add(mat, g, Object.assign({}, o, { x, y, z }));
    }
    cyl(mat, rt, rb, h, x, y, z, o) {
      o = o || {};
      const g = new THREE.CylinderGeometry(
        rt,
        rb,
        h,
        o.seg || 12,
        o.hseg || 1,
        !!o.open,
        o.thetaStart || 0,
        o.thetaLength || X.TAU,
      );
      return o.flat === false
        ? this.addSmooth(mat, g, Object.assign({}, o, { x, y, z }))
        : this.add(mat, g, Object.assign({}, o, { x, y, z }));
    }
    /** Cylinder between two points a→b (pipes, bones, poles). */
    seg(mat, a, b, r, o) {
      o = o || {};
      const dx = b[0] - a[0],
        dy = b[1] - a[1],
        dz = b[2] - a[2];
      const len = Math.hypot(dx, dy, dz) || 0.001;
      const g = new THREE.CylinderGeometry(
        o.r2 !== undefined ? o.r2 : r,
        r,
        len,
        o.seg || 6,
        1,
        !!o.open,
      );
      // align +Y to direction
      const dir = new THREE.Vector3(dx, dy, dz).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir,
      );
      g.applyQuaternion(q);
      g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
      return this.add(
        mat,
        g,
        Object.assign({}, o, { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }),
      );
    }
    sphere(mat, r, x, y, z, o) {
      o = o || {};
      const g = new THREE.SphereGeometry(
        r,
        o.wseg || 10,
        o.hseg || 7,
        0,
        X.TAU,
        o.phiStart || 0,
        o.phiLength || Math.PI,
      );
      return this.addSmooth(mat, g, Object.assign({}, o, { x, y, z }));
    }
    torus(mat, R, r, x, y, z, o) {
      o = o || {};
      const g = new THREE.TorusGeometry(
        R,
        r,
        o.rseg || 6,
        o.tseg || 16,
        o.arc || X.TAU,
      );
      return this.addSmooth(mat, g, Object.assign({}, o, { x, y, z }));
    }
    lathe(mat, pts, x, y, z, o) {
      o = o || {};
      const g = new THREE.LatheGeometry(
        pts.map((p) => new THREE.Vector2(p[0], p[1])),
        o.seg || 12,
      );
      return this.addSmooth(mat, g, Object.assign({}, o, { x, y, z }));
    }
    loft(mat, stations, o) {
      o = o || {};
      const g = X.loftGeometry(stations, o.seg || 16, o);
      // loft carries smooth normals; keep them
      g.applyMatrix4(xform(o));
      boxUV(g, o.uvScale || 1);
      if (o.uvFn) o.uvFn(g);
      bakeColors(g, Object.assign({ seed: this.seed * 0.37 }, o));
      this.list.push({ mat, tint: !!o.tint, geom: g });
      return g;
    }
    extrude(mat, pts, depth, o) {
      o = o || {};
      const g = X.extrudeGeometry(pts, depth, o.bevel);
      g.deleteAttribute("uv");
      return this.add(mat, g, o);
    }
    /**
     * Atlas-mapped quad. Faces +Z by default (rotate with ry). opts.mat overrides material ('atlas'|'screen'|'trim').
     * region: name in the atlas (10_atlas.js); flipU mirrors.
     */
    quad(region, w, h, x, y, z, o) {
      o = o || {};
      const g = new THREE.PlaneGeometry(w, h);
      const R = X.atlasRegion(region);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        let u = uv.getX(i),
          v = uv.getY(i);
        if (o.flipU) u = 1 - u;
        uv.setXY(i, X.lerp(R.u0, R.u1, u), X.lerp(R.v0, R.v1, v));
      }
      return this.add(
        o.mat || "atlas",
        g,
        Object.assign(
          { ao: [1, 1], grime: o.grime !== undefined ? o.grime : 0.12 },
          o,
          { x, y, z, uv: "keep" },
        ),
      );
    }
    /** Box whose faces all sample one atlas region (crates, cabinets with printed faces). */
    abox(region, w, h, d, x, y, z, o) {
      o = o || {};
      const g = new THREE.BoxGeometry(w, h, d);
      const R = X.atlasRegion(region);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(
          i,
          X.lerp(R.u0, R.u1, uv.getX(i)),
          X.lerp(R.v0, R.v1, uv.getY(i)),
        );
      return this.add(
        o.mat || "atlas",
        g,
        Object.assign({}, o, { x, y, z, uv: "keep" }),
      );
    }
    /** Include another kit's geometry transformed by o (sub-assemblies). */
    include(kit, o) {
      const m = xform(o || {}).clone();
      for (const e of kit.list) {
        const g = e.geom.clone();
        g.applyMatrix4(m);
        this.list.push({ mat: e.mat, tint: e.tint, geom: g });
      }
      return this;
    }
    build(name) {
      const groups = new Map();
      for (const e of this.list) {
        const k = e.mat + (e.tint ? ":t" : "");
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(e.geom);
      }
      const parts = [];
      const box = new THREE.Box3();
      let tris = 0;
      for (const [k, geoms] of groups) {
        for (const g of geoms) {
          if (!g.attributes.uv) boxUV(g, 1);
          if (!g.attributes.color) bakeColors(g, {});
        }
        const merged = U.mergeGeometries(geoms);
        merged.computeBoundingBox();
        merged.computeBoundingSphere();
        box.union(merged.boundingBox);
        tris += merged.index
          ? merged.index.count / 3
          : merged.attributes.position.count / 3;
        const colon = k.indexOf(":");
        parts.push({
          mat: colon >= 0 ? k.slice(0, colon) : k,
          tint: colon >= 0,
          geom: merged,
        });
      }
      if (box.isEmpty())
        box.set(
          new THREE.Vector3(-0.1, 0, -0.1),
          new THREE.Vector3(0.1, 0.2, 0.1),
        );
      return { name: name || "proto", parts, box, tris, meta: this.meta };
    }
  }
  X.Kit = Kit;

  /** UV fn for solid colour on atlas-based materials (trim) */
  X.whiteUV = function (g) {
    const R = X.atlasRegion("white");
    const u = (R.u0 + R.u1) / 2,
      v = (R.v0 + R.v1) / 2;
    const a = new Float32Array(g.attributes.position.count * 2);
    for (let i = 0; i < a.length; i += 2) {
      a[i] = u;
      a[i + 1] = v;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(a, 2));
  };

  // ------------------------------------------------------------------
  // Prototype registry. Builders: fn(kit, rng, variant) — may set kit.meta:
  //   collider: {w, d, h, y0?, cx?, cz?} | null     (prop-local box)
  //   tier: 'small'|'medium'|'large'                (LOD tier for scatter)
  //   container: {name, loot, lock?}                (default container def; lock = G.locks spec)
  //   glows: [{x,y,z,color,size,flicker}]  fires: [{x,y,z,scale,smoke}]
  //   radiation: {y, radius, strength}   explosive: {hp, radius, damage}
  //   surface: collider surface
  // ------------------------------------------------------------------
  const PROTO_DEFS = {};
  const PROTO_CACHE = {};
  X.defineProto = function (name, builder, defaults) {
    PROTO_DEFS[name] = { builder, defaults: defaults || {} };
  };
  X.hasProto = (name) => !!PROTO_DEFS[name];
  X.protoNames = () => Object.keys(PROTO_DEFS);
  X.proto = function (name, variant) {
    variant = variant || 0;
    const key = name + "#" + variant;
    if (PROTO_CACHE[key]) return PROTO_CACHE[key];
    const def = PROTO_DEFS[name];
    if (!def) throw new Error("props: unknown prototype " + name);
    const seed = U.hashStr(key) || 1;
    const kit = new Kit(seed);
    Object.assign(kit.meta, def.defaults);
    def.builder(kit, U.rng(seed), variant);
    const pr = kit.build(key);
    pr.id = key;
    pr.type = name;
    pr.variant = variant;
    PROTO_CACHE[key] = pr;
    return pr;
  };
  X.protoStats = () =>
    Object.keys(PROTO_CACHE).map((k) => k + ":" + PROTO_CACHE[k].tris);

  /** Create a standalone Object3D (one Mesh per material part) from a proto. */
  X.instantiate = function (pr, opts) {
    opts = opts || {};
    const grp = new THREE.Group();
    grp.name = "prop_" + pr.id;
    for (const part of pr.parts) {
      const mesh = new THREE.Mesh(part.geom, X.mat(part.mat));
      mesh.castShadow = opts.castShadow !== false && pr.meta.tier !== "small";
      mesh.receiveShadow = true;
      mesh.userData.propPart = part.mat;
      grp.add(mesh);
    }
    return grp;
  };

  // ------------------------------------------------------------------
  // Static Batcher: merges transformed proto copies per chunk & material.
  // One Group per chunk (distance culled with G.world.addLOD).
  // ------------------------------------------------------------------
  // Static batches fold look-alike materials together to save draw calls per chunk.
  // 'glow' (unlit vertex colour) folds into 'screen' (unlit atlas) by pointing its UVs at the white texel.
  const STATIC_REMAP = {
    plain: "metal",
    paint: "metal",
    glass: "metal",
    chrome: "metal",
    trim: "atlas",
    glow: "screen",
  };
  const WHITE_UV_MATS = { glow: 1 };
  class Batcher {
    constructor(name, chunk, lodDist, opts) {
      this.name = name;
      this.chunk = chunk;
      this.lod = lodDist;
      this.opts = opts || {};
      this.cells = new Map();
      this.count = 0;
      this.tris = 0;
    }
    add(pr, x, y, z, yaw, o) {
      o = o || {};
      const cx = Math.floor(x / this.chunk),
        cz = Math.floor(z / this.chunk),
        key = cx + "," + cz;
      let cell = this.cells.get(key);
      if (!cell) {
        cell = { cx, cz, items: [] };
        this.cells.set(key, cell);
      }
      const sc = o.s === undefined ? 1 : o.s;
      // o.mirror: reflect across the prop's own X axis (left/right) — winding is flipped at build time
      const m = xform({
        x,
        y,
        z,
        ry: yaw || 0,
        rx: o.rx || 0,
        rz: o.rz || 0,
        s: o.mirror ? [-sc, sc, sc] : sc,
      }).clone();
      cell.items.push({
        pr,
        m,
        tint: o.tint ? X.color(o.tint) : null,
        rec: o.rec || null,
        flip: !!o.mirror,
      });
      if (o.rec) {
        o.rec.ranges = o.rec.ranges || [];
        o.rec.batcher = this;
      }
      this.count++;
      this.tris += pr.tris;
    }
    build(parent) {
      const nm = new THREE.Matrix3();
      const out = [];
      for (const cell of this.cells.values()) {
        const byMat = new Map();
        for (const it of cell.items) {
          for (const part of it.pr.parts) {
            const mk = STATIC_REMAP[part.mat] || part.mat;
            if (!byMat.has(mk)) byMat.set(mk, []);
            byMat.get(mk).push({
              part,
              m: it.m,
              tint: part.tint ? it.tint : null,
              rec: it.rec,
              flip: it.flip,
            });
          }
        }
        const grp = new THREE.Group();
        grp.name = "props_" + this.name + "_" + cell.cx + "_" + cell.cz;
        for (const [mk, list] of byMat) {
          let vc = 0,
            ic = 0;
          for (const e of list) {
            vc += e.part.geom.attributes.position.count;
            ic += e.part.geom.index
              ? e.part.geom.index.count
              : e.part.geom.attributes.position.count;
          }
          const pos = new Float32Array(vc * 3),
            nor = new Float32Array(vc * 3),
            uv = new Float32Array(vc * 2),
            col = new Float32Array(vc * 3);
          const idx = vc > 65535 ? new Uint32Array(ic) : new Uint16Array(ic);
          let vo = 0,
            io = 0;
          const v = new THREE.Vector3();
          const recRanges = [];
          for (const e of list) {
            if (e.rec)
              recRanges.push(e.rec, vo, e.part.geom.attributes.position.count);
            const g = e.part.geom,
              gp = g.attributes.position,
              gn = g.attributes.normal,
              gu = g.attributes.uv,
              gc = g.attributes.color;
            nm.getNormalMatrix(e.m);
            const me = e.m.elements,
              ne = nm.elements;
            const tr = e.tint ? e.tint.r : 1,
              tg = e.tint ? e.tint.g : 1,
              tb = e.tint ? e.tint.b : 1;
            const wuv = WHITE_UV_MATS[e.part.mat]
              ? X.atlasRegion("white")
              : null;
            for (let i = 0; i < gp.count; i++) {
              const px = gp.array[i * 3],
                py = gp.array[i * 3 + 1],
                pz = gp.array[i * 3 + 2];
              const o3 = (vo + i) * 3;
              pos[o3] = me[0] * px + me[4] * py + me[8] * pz + me[12];
              pos[o3 + 1] = me[1] * px + me[5] * py + me[9] * pz + me[13];
              pos[o3 + 2] = me[2] * px + me[6] * py + me[10] * pz + me[14];
              const nx = gn.array[i * 3],
                ny = gn.array[i * 3 + 1],
                nz = gn.array[i * 3 + 2];
              v.set(
                ne[0] * nx + ne[3] * ny + ne[6] * nz,
                ne[1] * nx + ne[4] * ny + ne[7] * nz,
                ne[2] * nx + ne[5] * ny + ne[8] * nz,
              ).normalize();
              nor[o3] = v.x;
              nor[o3 + 1] = v.y;
              nor[o3 + 2] = v.z;
              if (wuv) {
                uv[(vo + i) * 2] = (wuv.u0 + wuv.u1) / 2;
                uv[(vo + i) * 2 + 1] = (wuv.v0 + wuv.v1) / 2;
              } else {
                uv[(vo + i) * 2] = gu.array[i * 2];
                uv[(vo + i) * 2 + 1] = gu.array[i * 2 + 1];
              }
              col[o3] = gc.array[i * 3] * tr;
              col[o3 + 1] = gc.array[i * 3 + 1] * tg;
              col[o3 + 2] = gc.array[i * 3 + 2] * tb;
            }
            if (g.index) {
              const ia = g.index.array;
              if (e.flip)
                for (let i = 0; i + 2 < ia.length; i += 3) {
                  idx[io++] = ia[i] + vo;
                  idx[io++] = ia[i + 2] + vo;
                  idx[io++] = ia[i + 1] + vo;
                }
              else for (let i = 0; i < ia.length; i++) idx[io++] = ia[i] + vo;
            } else if (e.flip)
              for (let i = 0; i + 2 < gp.count; i += 3) {
                idx[io++] = i + vo;
                idx[io++] = i + 2 + vo;
                idx[io++] = i + 1 + vo;
              }
            else for (let i = 0; i < gp.count; i++) idx[io++] = i + vo;
            vo += gp.count;
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
          geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
          geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
          geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
          geo.setIndex(new THREE.BufferAttribute(idx, 1));
          geo.computeBoundingSphere();
          geo.computeBoundingBox();
          for (let i = 0; i < recRanges.length; i += 3)
            recRanges[i].ranges.push(
              geo.attributes.position,
              recRanges[i + 1],
              recRanges[i + 2],
            );
          const mesh = new THREE.Mesh(geo, X.mat(mk));
          mesh.castShadow =
            !!this.opts.castShadow && mk !== "glow" && mk !== "screen";
          mesh.receiveShadow = true;
          mesh.matrixAutoUpdate = false;
          mesh.updateMatrix();
          grp.add(mesh);
        }
        grp.matrixAutoUpdate = false;
        parent.add(grp);
        const center = new THREE.Vector3(
          (cell.cx + 0.5) * this.chunk,
          0,
          (cell.cz + 0.5) * this.chunk,
        );
        // LOD distance is measured from chunk centre → pad by half diagonal
        G.world.addLOD(grp, this.lod + this.chunk * 0.7, center);
        out.push(grp);
      }
      this.groups = out;
      this.cells.clear();
      return out;
    }
  }
  /**
   * Hide one already-built batched item (put() with o.rec): collapses its vertices onto its first vertex
   * (degenerate triangles, nothing drawn). Used by the door guard for props that ended up in front of a
   * door that another module added after the city was dressed.
   */
  Batcher.hideItem = function (rec) {
    if (!rec || !rec.ranges || rec.hidden) return false;
    const r = rec.ranges;
    for (let i = 0; i < r.length; i += 3) {
      const attr = r[i],
        s = r[i + 1],
        n = r[i + 2],
        a = attr.array;
      const x0 = a[s * 3],
        y0 = a[s * 3 + 1],
        z0 = a[s * 3 + 2];
      for (let k = s + 1; k < s + n; k++) {
        a[k * 3] = x0;
        a[k * 3 + 1] = y0;
        a[k * 3 + 2] = z0;
      }
      attr.needsUpdate = true;
    }
    rec.hidden = true;
    return true;
  };
  X.Batcher = Batcher;

  // ------------------------------------------------------------------
  // GlowField — fake lights: one Points draw call. Per-point colour, size
  // (metres), flicker amount/phase. Night factor boosts intensity.
  // ------------------------------------------------------------------
  const GLOW_VS = [
    "attribute float size; attribute vec3 gcolor; attribute vec2 fl;",
    "uniform float time; uniform float night; uniform float pxScale;",
    "varying vec3 vC; varying float vA;",
    "float h1(float n){ return fract(sin(n)*43758.5453); }",
    "void main(){",
    "  vec4 mv = modelViewMatrix * vec4(position, 1.0);",
    "  float t = time * 9.0 + fl.y * 31.0;",
    "  float f = 1.0;",
    "  float inside = step(1.5, fl.x); float fk = fl.x - 2.0 * inside;", // fl.x >= 2: interior light (ignores daylight)
    "  if (fk > 0.0) { float r = h1(floor(t)); f = mix(1.0, step(0.35, r) * (0.75 + 0.25*h1(floor(t*3.1))), fk); }",
    "  float d = -mv.z;",
    "  vA = f * mix(mix(0.12, 1.0, night), 0.85, inside) * clamp(1.4 - d / 900.0, 0.0, 1.0);",
    "  vC = gcolor;",
    "  gl_PointSize = clamp(size * pxScale / max(d, 0.5), 0.0, 256.0);",
    "  gl_Position = projectionMatrix * mv;",
    "}",
  ].join("\n");
  const GLOW_FS = [
    "varying vec3 vC; varying float vA;",
    "void main(){",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0; float r = dot(p, p);",
    "  if (r > 1.0) discard;",
    "  float a = pow(1.0 - r, 2.2) * vA;",
    "  float core = pow(max(0.0, 1.0 - r * 6.0), 2.0) * vA;",
    "  gl_FragColor = vec4(vC * a + vec3(core) * 0.6, 1.0);",
    "}",
  ].join("\n");
  class GlowField {
    constructor(cap) {
      this.cap = cap;
      this.n = 0;
      const g = new THREE.BufferGeometry();
      this.pos = new Float32Array(cap * 3);
      this.col = new Float32Array(cap * 3);
      this.size = new Float32Array(cap);
      this.fl = new Float32Array(cap * 2);
      g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
      g.setAttribute("gcolor", new THREE.BufferAttribute(this.col, 3));
      g.setAttribute("size", new THREE.BufferAttribute(this.size, 1));
      g.setAttribute("fl", new THREE.BufferAttribute(this.fl, 2));
      g.setDrawRange(0, 0);
      this.geo = g;
      this.mat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          night: { value: 0 },
          pxScale: { value: 600 },
        },
        vertexShader: GLOW_VS,
        fragmentShader: GLOW_FS,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      this.points = new THREE.Points(g, this.mat);
      this.points.frustumCulled = false;
      this.points.renderOrder = 5;
      this.points.name = "props_glowfield";
      this.free = [];
    }
    /** Returns slot index (use set/remove). */
    add(x, y, z, color, size, flicker, interior) {
      let i = this.free.length ? this.free.pop() : this.n++;
      if (i >= this.cap) {
        this.n = this.cap;
        return -1;
      }
      const c = X.color(color);
      this.pos[i * 3] = x;
      this.pos[i * 3 + 1] = y;
      this.pos[i * 3 + 2] = z;
      this.col[i * 3] = c.r;
      this.col[i * 3 + 1] = c.g;
      this.col[i * 3 + 2] = c.b;
      this.size[i] = size;
      this.fl[i * 2] = (flicker || 0) + (interior ? 2 : 0);
      this.fl[i * 2 + 1] = Math.random();
      this.dirty = true;
      return i;
    }
    setColor(i, color, size) {
      if (i < 0) return;
      const c = X.color(color);
      this.col[i * 3] = c.r;
      this.col[i * 3 + 1] = c.g;
      this.col[i * 3 + 2] = c.b;
      if (size !== undefined) this.size[i] = size;
      this.dirty = true;
    }
    setPos(i, x, y, z) {
      if (i < 0) return;
      this.pos[i * 3] = x;
      this.pos[i * 3 + 1] = y;
      this.pos[i * 3 + 2] = z;
      this.dirty = true;
    }
    remove(i) {
      if (i < 0) return;
      this.size[i] = 0;
      this.free.push(i);
      this.dirty = true;
    }
    update(time, night, h) {
      this.mat.uniforms.time.value = time;
      this.mat.uniforms.night.value = night;
      this.mat.uniforms.pxScale.value =
        h / (2 * Math.tan((G.camera.fov * Math.PI) / 180 / 2));
      if (this.dirty) {
        this.dirty = false;
        for (const k of ["position", "gcolor", "size", "fl"])
          this.geo.attributes[k].needsUpdate = true;
        this.geo.setDrawRange(0, this.n);
      }
    }
  }
  X.GlowField = GlowField;

  // ------------------------------------------------------------------
  // FlameField — instanced camera-facing quads animated in the shader.
  // kind 0 = flame (additive), kind 1 = smoke (alpha).
  // Emitters own a contiguous run of particle slots.
  // ------------------------------------------------------------------
  const FLAME_VS = [
    "attribute vec3 base; attribute vec4 prm;", // prm: scale, seed, life, heightMul
    "uniform float time; uniform float kind;",
    "varying vec2 vUv; varying float vT; varying float vSeed;",
    "void main(){",
    "  vUv = uv;",
    "  float sc = prm.x; float seed = prm.y;",
    "  float life = prm.z;",
    "  float t = fract(time / life + seed);",
    "  vT = t; vSeed = seed;",
    "  vec3 c = base;",
    "  if (kind < 0.5) {",
    "    c.y += t * 1.1 * sc * prm.w;",
    "    c.x += sin(time * 5.0 + seed * 40.0) * 0.07 * sc * t;",
    "    c.z += cos(time * 4.3 + seed * 33.0) * 0.07 * sc * t;",
    "  } else {",
    "    c.y += 0.6 * sc + t * 4.5 * sc * prm.w;",
    "    c.x += sin(seed * 60.0) * 0.4 * sc * t + t * t * 0.8 * sc;",
    "    c.z += cos(seed * 50.0) * 0.4 * sc * t;",
    "  }",
    "  float s = kind < 0.5 ? sc * (0.55 - 0.35 * t) * (0.8 + 0.4 * fract(seed * 7.0)) : sc * (0.4 + 1.6 * t);",
    "  vec4 mv = modelViewMatrix * vec4(c, 1.0);",
    "  mv.xy += (uv - 0.5) * 2.0 * s;",
    "  gl_Position = projectionMatrix * mv;",
    "}",
  ].join("\n");
  const FLAME_FS = [
    "uniform float kind; uniform float time;",
    "varying vec2 vUv; varying float vT; varying float vSeed;",
    "void main(){",
    "  vec2 p = vUv * 2.0 - 1.0;",
    "  if (kind < 0.5) {",
    "    p.y += 0.25; float r = length(vec2(p.x * 1.25, p.y * 0.8));",
    "    float a = smoothstep(1.0, 0.1, r) * (1.0 - vT) * 1.1;",
    "    vec3 hot = vec3(1.0, 0.85, 0.45), mid = vec3(1.0, 0.45, 0.1), cool = vec3(0.6, 0.12, 0.03);",
    "    vec3 col = mix(hot, mid, smoothstep(0.0, 0.4, vT)); col = mix(col, cool, smoothstep(0.4, 1.0, vT));",
    "    gl_FragColor = vec4(col * a * 1.4, 1.0);",
    "  } else {",
    "    float r = length(p);",
    "    float a = smoothstep(1.0, 0.2, r) * smoothstep(0.0, 0.15, vT) * (1.0 - vT) * 0.45;",
    "    gl_FragColor = vec4(vec3(0.16, 0.15, 0.14) + 0.05 * vSeed, a);",
    "  }",
    "}",
  ].join("\n");
  class FlameLayer {
    constructor(cap, kind) {
      this.cap = cap;
      this.kind = kind;
      const quad = new THREE.PlaneGeometry(1, 1);
      const g = new THREE.InstancedBufferGeometry();
      g.index = quad.index;
      g.setAttribute("position", quad.attributes.position);
      g.setAttribute("uv", quad.attributes.uv);
      this.base = new Float32Array(cap * 3);
      this.prm = new Float32Array(cap * 4);
      g.setAttribute("base", new THREE.InstancedBufferAttribute(this.base, 3));
      g.setAttribute("prm", new THREE.InstancedBufferAttribute(this.prm, 4));
      g.instanceCount = cap;
      this.geo = g;
      this.mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, kind: { value: kind } },
        vertexShader: FLAME_VS,
        fragmentShader: FLAME_FS,
        transparent: true,
        depthWrite: false,
        blending: kind === 0 ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      this.mesh = new THREE.Mesh(g, this.mat);
      this.mesh.frustumCulled = false;
      this.mesh.renderOrder = kind === 0 ? 6 : 4;
      this.used = new Uint8Array(cap);
    }
    alloc(n) {
      // find n contiguous free slots
      let run = 0;
      for (let i = 0; i < this.cap; i++) {
        run = this.used[i] ? 0 : run + 1;
        if (run === n) {
          const s = i - n + 1;
          for (let k = s; k <= i; k++) this.used[k] = 1;
          return s;
        }
      }
      return -1;
    }
    set(slot, x, y, z, scale, seed, life, hm) {
      this.base[slot * 3] = x;
      this.base[slot * 3 + 1] = y;
      this.base[slot * 3 + 2] = z;
      this.prm[slot * 4] = scale;
      this.prm[slot * 4 + 1] = seed;
      this.prm[slot * 4 + 2] = life;
      this.prm[slot * 4 + 3] = hm || 1;
      this.dirty = true;
    }
    release(s, n) {
      for (let k = s; k < s + n; k++) {
        this.used[k] = 0;
        this.prm[k * 4] = 0;
      }
      this.dirty = true;
    }
    update(time) {
      this.mat.uniforms.time.value = time;
      if (this.dirty) {
        this.dirty = false;
        this.geo.attributes.base.needsUpdate = true;
        this.geo.attributes.prm.needsUpdate = true;
      }
    }
  }
  class FlameField {
    constructor() {
      this.flames = new FlameLayer(1400, 0);
      this.smoke = new FlameLayer(900, 1);
      this.group = new THREE.Group();
      this.group.name = "props_flames";
      this.group.add(this.smoke.mesh, this.flames.mesh);
    }
    /** Add a fire. Returns handle {setScale(s), stop(), pos}. */
    add(x, y, z, scale, opts) {
      opts = opts || {};
      const nf =
          opts.flames !== undefined
            ? opts.flames
            : Math.max(5, Math.round(6 * Math.min(2, scale))),
        ns = opts.smoke === false ? 0 : opts.smokeCount || 4;
      const fs = nf > 0 ? this.flames.alloc(nf) : -1,
        ss = ns ? this.smoke.alloc(ns) : -1;
      const h = { x, y, z, scale, fs, nf, ss, ns, alive: true, field: this };
      const apply = () => {
        const spread = 0.28 * h.scale * (opts.spread || 1);
        if (fs >= 0)
          for (let i = 0; i < nf; i++) {
            const a = (i / nf) * X.TAU + Math.random() * 0.5,
              rr = spread * Math.sqrt(Math.random());
            this.flames.set(
              fs + i,
              x + Math.cos(a) * rr,
              y,
              z + Math.sin(a) * rr,
              h.scale * (0.8 + Math.random() * 0.4),
              i / nf + Math.random() * 0.1,
              0.7 + Math.random() * 0.5,
              opts.height || 1,
            );
          }
        if (ss >= 0)
          for (let i = 0; i < ns; i++)
            this.smoke.set(
              ss + i,
              x,
              y,
              z,
              h.scale * (opts.smokeScale || 1),
              i / ns,
              3.5 + Math.random() * 1.5,
              opts.smokeHeight || 1,
            );
      };
      apply();
      h.setScale = (s) => {
        h.scale = s;
        if (s <= 0.01) {
          if (fs >= 0)
            for (let i = 0; i < nf; i++) this.flames.prm[(fs + i) * 4] = 0;
          this.flames.dirty = true;
        } else apply();
      };
      h.stop = () => {
        if (!h.alive) return;
        h.alive = false;
        if (fs >= 0) this.flames.release(fs, nf);
        if (ss >= 0) this.smoke.release(ss, ns);
      };
      return h;
    }
    update(time) {
      this.flames.update(time);
      this.smoke.update(time);
    }
  }
  X.FlameField = FlameField;

  // ------------------------------------------------------------------
  // Misc helpers
  // ------------------------------------------------------------------
  /** Terrain/ground height at x,z (map module may provide hills). */
  X.ground = function (x, z) {
    try {
      const h = G.world.terrainHeight(x, z);
      return isFinite(h) ? Math.max(h, 0) : 0;
    } catch (e) {
      return 0;
    }
  };
  X.nightFactor = function () {
    const h = G.time ? G.time.hour : 12;
    if (
      G.atmos &&
      !G.isStub("atmos") &&
      typeof G.atmos.isNight === "function"
    ) {
      try {
        if (G.atmos.isNight()) return 1;
      } catch (e) {
        /* ignore */
      }
    }
    // smooth: full night 20→5, dusk/dawn ramps
    if (h >= 20.5 || h < 5) return 1;
    if (h >= 18) return X.smooth(18, 20.5, h);
    if (h < 7) return 1 - X.smooth(5, 7, h);
    return 0;
  };
  X.safe = function (fn, where) {
    try {
      return fn();
    } catch (e) {
      G.reportError("props:" + (where || "call"), e);
      return undefined;
    }
  };
  X.sfx = function (name, o) {
    try {
      if (!G.isStub("sfx")) return G.sfx.play(name, o || {});
    } catch (e) {
      /* ignore */
    }
    return null;
  };
})();
