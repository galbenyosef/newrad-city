// play-inline-3 01 — math
// Lines 13-362 of readable/play-inline-3.pretty.js (statement-aligned).
  "use strict";
  const G = (window.G = window.G || {});
  const THREE = window.THREE;
  G.VERSION = "0.1.0";
  G.GAME_NAME = "New Rad City";
  const QS = new URLSearchParams(location.search);
  G.QS = QS;
  G.DEBUG = QS.has("debug");
  G.SMOKE = QS.has("smoke");
  G.SHOT = QS.get("shot"); // "x,y,z,yaw,pitch"
  G.SURVEY = QS.get("survey"); // "x,z[,radius]" — multi-view survey sheet (src/core/survey.js)

  // ------------------------------------------------------------------
  // Error capture (used by smoke test + debug overlay)
  // ------------------------------------------------------------------
  G.errors = [];
  G.warnings = [];
  const seenErr = new Set();
  G.reportError = function (where, e) {
    const msg =
      "[" +
      where +
      "] " +
      (e && e.stack ? e.stack.split("\n").slice(0, 3).join(" | ") : String(e));
    if (seenErr.has(msg)) return;
    seenErr.add(msg);
    G.errors.push(msg);
    console.error(msg);
  };
  window.addEventListener("error", (ev) =>
    G.reportError("window", ev.error || ev.message),
  );
  window.addEventListener("unhandledrejection", (ev) =>
    G.reportError("promise", ev.reason),
  );
  const _warn = console.warn.bind(console);
  console.warn = function () {
    try {
      G.warnings.push(Array.from(arguments).join(" ").slice(0, 300));
    } catch (e) {
      /* ignore */
    }
    _warn.apply(console, arguments);
  };

  // ------------------------------------------------------------------
  // Utilities
  // ------------------------------------------------------------------
  const U = (G.util = {});
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.smoothstep = (a, b, x) => {
    const t = U.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  U.damp = (a, b, lambda, dt) => U.lerp(a, b, 1 - Math.exp(-lambda * dt));
  U.wrapAngle = (a) => {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  };
  U.angleDiff = (a, b) => U.wrapAngle(b - a);
  U.dist2D = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  /** Seeded PRNG (mulberry32) with helpers: r(), r.range(a,b), r.int(a,b), r.pick(arr), r.chance(p) */
  U.rng = function (seed) {
    let a = seed >>> 0 || 1;
    const r = function () {
      a |= 0;
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
  /** Deterministic hash of 2 numbers → [0,1) */
  U.hash2 = (x, z) => {
    let h = Math.imul((x * 73856093) | 0, 1) ^ Math.imul((z * 19349663) | 0, 1);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  U.hashStr = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  /** 2D value noise in [0,1], smooth. */
  U.noise2 = (x, z) => {
    const xi = Math.floor(x),
      zi = Math.floor(z),
      xf = x - xi,
      zf = z - zi;
    const s = (t) => t * t * (3 - 2 * t);
    const a = U.hash2(xi, zi),
      b = U.hash2(xi + 1, zi),
      c = U.hash2(xi, zi + 1),
      d = U.hash2(xi + 1, zi + 1);
    return U.lerp(U.lerp(a, b, s(xf)), U.lerp(c, d, s(xf)), s(zf));
  };
  U.fbm2 = (x, z, oct) => {
    let v = 0,
      amp = 0.5,
      f = 1;
    for (let i = 0; i < (oct || 4); i++) {
      v += amp * U.noise2(x * f, z * f);
      f *= 2;
      amp *= 0.5;
    }
    return v;
  };

  /**
   * Merge BufferGeometries into one (same material). Handles indexed and
   * non-indexed input; keeps position, normal, uv, color (if ALL have color,
   * otherwise color is dropped). Returns a new indexed BufferGeometry.
   */
  U.mergeGeometries = function (geoms) {
    geoms = geoms.filter(Boolean);
    if (!geoms.length) return new THREE.BufferGeometry();
    const hasColor = geoms.every((g) => g.attributes.color);
    const hasUV = geoms.every((g) => g.attributes.uv);
    let vCount = 0,
      iCount = 0;
    for (const g of geoms) {
      vCount += g.attributes.position.count;
      iCount += g.index ? g.index.count : g.attributes.position.count;
    }
    const pos = new Float32Array(vCount * 3),
      nor = new Float32Array(vCount * 3);
    const uv = hasUV ? new Float32Array(vCount * 2) : null;
    const col = hasColor ? new Float32Array(vCount * 3) : null;
    const idx =
      vCount > 65535 ? new Uint32Array(iCount) : new Uint16Array(iCount);
    let vo = 0,
      io = 0;
    for (const g of geoms) {
      if (!g.attributes.normal) g.computeVertexNormals();
      const p = g.attributes.position,
        n = g.attributes.normal;
      for (let i = 0; i < p.count; i++) {
        pos[(vo + i) * 3] = p.getX(i);
        pos[(vo + i) * 3 + 1] = p.getY(i);
        pos[(vo + i) * 3 + 2] = p.getZ(i);
        nor[(vo + i) * 3] = n.getX(i);
        nor[(vo + i) * 3 + 1] = n.getY(i);
        nor[(vo + i) * 3 + 2] = n.getZ(i);
        if (uv) {
          const u = g.attributes.uv;
          uv[(vo + i) * 2] = u.getX(i);
          uv[(vo + i) * 2 + 1] = u.getY(i);
        }
        if (col) {
          const c = g.attributes.color;
          col[(vo + i) * 3] = c.getX(i);
          col[(vo + i) * 3 + 1] = c.getY(i);
          col[(vo + i) * 3 + 2] = c.getZ(i);
        }
      }
      if (g.index) {
        for (let i = 0; i < g.index.count; i++)
          idx[io++] = g.index.getX(i) + vo;
      } else {
        for (let i = 0; i < p.count; i++) idx[io++] = i + vo;
      }
      vo += p.count;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    if (uv) out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    if (col) out.setAttribute("color", new THREE.BufferAttribute(col, 3));
    out.setIndex(new THREE.BufferAttribute(idx, 1));
    out.computeBoundingSphere();
    out.computeBoundingBox();
    return out;
  };
  /** Clone geometry with a transform baked in. */
  U.bake = (geom, pos, rotY, scale, rotX, rotZ) => {
    const g = geom.clone();
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(pos ? pos.x : 0, pos ? pos.y : 0, pos ? pos.z : 0),
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rotX || 0, rotY || 0, rotZ || 0, "YXZ"),
      ),
      typeof scale === "number"
        ? new THREE.Vector3(scale, scale, scale)
        : scale || new THREE.Vector3(1, 1, 1),
    );
    g.applyMatrix4(m);
    return g;
  };
  /** Paint a flat vertex color onto a geometry (adds 'color' attribute). */
  U.paint = (geom, color) => {
    const c = new THREE.Color(color),
      n = geom.attributes.position.count,
      a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = c.r;
      a[i * 3 + 1] = c.g;
      a[i * 3 + 2] = c.b;
    }
    geom.setAttribute("color", new THREE.BufferAttribute(a, 3));
    return geom;
  };
  U.disposeObject = (obj) => {
    obj.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material && !o.material.userData.shared)
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
          m.dispose(),
        );
    });
    if (obj.parent) obj.parent.remove(obj);
  };
  U.randomId = (() => {
    let n = 0;
    return (p) => (p || "id") + "_" + ++n;
  })();
  U.fmt = (n) => Math.round(n).toString();

  // ------------------------------------------------------------------
  // Event bus
  // ------------------------------------------------------------------
  const handlers = {};
  G.events = {
    on(name, fn) {
      (handlers[name] = handlers[name] || []).push(fn);
      return () => G.events.off(name, fn);
    },
    off(name, fn) {
      const h = handlers[name];
      if (h) {
        const i = h.indexOf(fn);
        if (i >= 0) h.splice(i, 1);
      }
    },
    once(name, fn) {
      const off = G.events.on(name, function w() {
        off();
        fn.apply(null, arguments);
      });
      return off;
    },
    emit(name) {
      const h = handlers[name];
      if (!h) return;
      const args = Array.prototype.slice.call(arguments, 1);
      for (const fn of h.slice()) {
        try {
          fn.apply(null, args);
        } catch (e) {
          G.reportError("event:" + name, e);
        }
      }
    },
  };
  G.on = G.events.on;
  G.emit = G.events.emit;

  // ------------------------------------------------------------------
  // Module registry
  // ------------------------------------------------------------------
  G._modules = [];
  /** def: {name, order=50, init(G)?: void|Promise, update(dt, realDt, G)?, lateUpdate(dt, realDt, G)?} */
  G.registerModule = function (def) {
    if (!def || !def.name) throw new Error("registerModule needs a name");
    if (def.order === undefined) def.order = 50;
    G._modules.push(def);
    G._modules.sort((a, b) => a.order - b.order);
  };
  G.getModule = (name) => G._modules.find((m) => m.name === name) || null;

  // ------------------------------------------------------------------
  // API stubs: every module's namespace exists from the start as a
  // Proxy whose unknown members are no-op functions. Modules REPLACE the
  // whole object at load time (e.g. `G.tex = {...}`). Never cache module
  // objects at load time — always call through G.x.method().
  // ------------------------------------------------------------------
  function makeStub(ns) {
    const noop = function () {
      return undefined;
    };
    return new Proxy(
      { __stub: true, __ns: ns },
      {
        get(t, p) {
          if (p in t) return t[p];
          if (typeof p === "symbol") return undefined;
          return noop;
        },
      },
    );
  }
  G.STUB_NAMESPACES = [
    "tex",
    "mats",
    "sfx",
    "music",
    "radio",
    "atmos",
    "fx",
    "map",
    "landmarks",
    "pois",
    "props",
    "chars",
    "items",
    "inventory",
    "rpg",
    "containers",
    "weapons",
    "actors",
    "combat",
    "quests",
    "dialogue",
    "terminals",
    "hud",
    "ui",
    "barter",
    "goggles",
    "locks",
  ];
  for (const ns of G.STUB_NAMESPACES) if (!G[ns]) G[ns] = makeStub(ns);
  G.isStub = (ns) => !!(G[ns] && G[ns].__stub);

  // ------------------------------------------------------------------
  // State machine
  // ------------------------------------------------------------------
  // States: loading | title | intro | play | goggles | dialogue | keypad |
  //         terminal | container | barter | levelup | paused | dead | cutscene | cheats (P menu, core)
  G.state = "loading";
  G.WORLD_RUNNING_STATES = new Set(["play", "cutscene"]);
  G.POINTER_LOCK_STATES = new Set(["play"]);
  G.timeScale = 1;
  G.setState = function (s, data) {
    const prev = G.state;
    if (prev === s) return;
    G.state = s;
    if (G.POINTER_LOCK_STATES.has(s)) G.input.requestLock();
    else G.input.exitLock();
    G.events.emit("state", s, prev, data);
  };
  G.isPlaying = () => G.state === "play";
