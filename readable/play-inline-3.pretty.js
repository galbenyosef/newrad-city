/* src/core/engine.js */
/* =====================================================================
 * NEW RAD CITY — CORE ENGINE
 * Owned by: CORE.  See CONTRACT.md for the full module API contract.
 *
 * Provides: G.util, G.events, G.registerModule, state machine,
 * renderer/scene/camera (+ viewmodel scene), input, world colliders,
 * raycasts, interactables, doors, LOD, rad sources, save/load, notify,
 * fades, location discovery, main loop, loading, smoke-test & screenshot
 * harness.
 * ===================================================================== */
(function () {
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
  G.worldRunning = () => G.WORLD_RUNNING_STATES.has(G.state);

  // Time of day (atmosphere advances it; others read it)
  G.time = {
    elapsed: 0,
    real: 0,
    hour: 10.5,
    day: 1,
    minutesPerSecond: 0.5,
    frame: 0,
  };

  // ------------------------------------------------------------------
  // Renderer / scene / cameras
  // ------------------------------------------------------------------
  G.initRenderer = function () {
    const r = new THREE.WebGLRenderer({
      antialias: !G.SMOKE,
      powerPreference: "high-performance",
      preserveDrawingBuffer: !!(G.SHOT || G.SURVEY),
    });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    r.setSize(window.innerWidth, window.innerHeight);
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.domElement.id = "game-canvas";
    document.getElementById("game-root").appendChild(r.domElement);
    G.renderer = r;
    G.scene = new THREE.Scene();
    G.scene.background = new THREE.Color(0x8a8f78);
    G.scene.fog = new THREE.Fog(0x8a8f78, 60, 900);
    G.camera = new THREE.PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.08,
      3500,
    );
    G.camera.rotation.order = "YXZ";
    G.scene.add(G.camera);
    // Viewmodel (first-person weapon/arms) scene, rendered on top with cleared depth
    G.viewScene = new THREE.Scene();
    G.viewCamera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.01,
      20,
    );
    G.viewScene.add(G.viewCamera);
    G.viewLights = {
      amb: new THREE.HemisphereLight(0xd8dcc0, 0x3a3428, 1.1),
      dir: new THREE.DirectionalLight(0xfff0d0, 1.6),
    };
    G.viewLights.dir.position.set(0.5, 1, 0.3);
    G.viewScene.add(G.viewLights.amb, G.viewLights.dir);
    // Fallback world lights (atmosphere module replaces/adjusts these)
    G.baseLights = {
      hemi: new THREE.HemisphereLight(0xcfd6b8, 0x4a4032, 0.9),
      sun: new THREE.DirectionalLight(0xfff1d0, 1.8),
    };
    G.baseLights.sun.position.set(200, 400, 100);
    G.scene.add(G.baseLights.hemi, G.baseLights.sun);
    window.addEventListener("resize", onResize);
    window.addEventListener("resize", () => G.redrawHeld && G.redrawHeld());
  };
  function onResize() {
    const w = window.innerWidth,
      h = window.innerHeight;
    G.renderer.setSize(w, h);
    G.camera.aspect = w / h;
    G.camera.updateProjectionMatrix();
    G.viewCamera.aspect = w / h;
    G.viewCamera.updateProjectionMatrix();
    G.events.emit("resize", w, h);
  }
  G.viewmodelVisible = true;
  /** Render main scene + viewmodel into target (null = screen). Post-FX hooks call this. */
  G.renderScenes = function (target) {
    const r = G.renderer;
    r.setRenderTarget(target || null);
    r.autoClear = true;
    r.render(G.scene, G.camera);
    if (
      G.viewmodelVisible &&
      !L_interior_hidden() &&
      !(G.player && G.player.thirdPersonActive)
    ) {
      r.autoClear = false;
      r.clearDepth();
      r.render(G.viewScene, G.viewCamera);
      r.autoClear = true;
    }
  };
  function L_interior_hidden() {
    return (
      G.state === "dead" ||
      G.state === "title" ||
      G.state === "chargen" ||
      G.state === "loading"
    );
  }
  /** Post-processing hook: set G.renderHook = (renderer) => {...} ; it must call G.renderScenes(rt). */
  G.renderHook = null;
  G.render = function () {
    if (G.renderHook) {
      try {
        G.renderHook(G.renderer);
      } catch (e) {
        G.reportError("renderHook", e);
        G.renderHook = null;
        G.renderScenes(null);
      }
    } else G.renderScenes(null);
    if (captureQ.length) grabFrame();
  };
  /** Screenshot of the next rendered frame (3D view only, no DOM HUD) → Promise<Blob|null> (JPEG, ≤ maxW px wide).
   *  Copied right after the frame is drawn, so it works without preserveDrawingBuffer. */
  const captureQ = [];
  G.captureFrame = function (maxW) {
    return new Promise((resolve) => {
      captureQ.push({ resolve, maxW: maxW || 1600 });
      setTimeout(() => {
        if (captureQ.length) {
          try {
            G.render();
          } catch (e) {
            grabFrame();
          }
        }
      }, 500); // paused loop fallback
    });
  };
  function grabFrame() {
    const q = captureQ.splice(0),
      src = G.renderer && G.renderer.domElement;
    let c = null;
    try {
      const k = Math.min(1, q[0].maxW / src.width);
      c = document.createElement("canvas");
      c.width = Math.round(src.width * k);
      c.height = Math.round(src.height * k);
      c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
    } catch (e) {
      G.reportError("captureFrame", e);
      c = null;
    }
    const done = (b) => q.forEach((x) => x.resolve(b));
    if (!c) return done(null);
    c.toBlob((b) => done(b || null), "image/jpeg", 0.85);
  }

  // ------------------------------------------------------------------
  // Input
  // ------------------------------------------------------------------
  const I = (G.input = {
    keys: {},
    pressed: {},
    released: {},
    mouse: { dx: 0, dy: 0, wheel: 0, x: 0, y: 0 },
    locked: false,
    sensitivity: 0.0022,
    invertY: false,
    bindings: {
      forward: ["KeyW", "ArrowUp"],
      back: ["KeyS", "ArrowDown"],
      left: ["KeyA", "ArrowLeft"],
      right: ["KeyD", "ArrowRight"],
      jump: ["Space"],
      sprint: ["ShiftLeft", "ShiftRight"],
      sneak: ["KeyC"], // (no Ctrl: Ctrl+W would close the tab)
      interact: ["KeyE"],
      goggles: ["Tab", "KeyI"],
      reload: ["KeyR"],
      fire: ["Mouse0"],
      aim: ["Mouse2"],
      grenade: ["KeyG"],
      holster: ["KeyH"],
      light: ["KeyL"],
      quicksave: ["F5"],
      quickload: ["F9"],
      map: ["KeyM"],
      journal: ["KeyJ"],
      pause: ["Escape"],
      cheats: ["KeyP"],
      camera: ["KeyF"],
      fav1: ["Digit1"],
      fav2: ["Digit2"],
      fav3: ["Digit3"],
      fav4: ["Digit4"],
      fav5: ["Digit5"],
      fav6: ["Digit6"],
      fav7: ["Digit7"],
      fav8: ["Digit8"],
    },
    down(code) {
      return !!I.keys[code];
    },
    justPressed(code) {
      return !!I.pressed[code];
    },
    justReleased(code) {
      return !!I.released[code];
    },
    /** Mark a press as handled so later modules in the same frame don't also act on it. */
    consume(code) {
      I.pressed[code] = false;
    },
    action(name) {
      const b = I.bindings[name];
      return !!b && b.some((c) => I.keys[c]);
    },
    actionPressed(name) {
      const b = I.bindings[name];
      return !!b && b.some((c) => I.pressed[c]);
    },
    actionReleased(name) {
      const b = I.bindings[name];
      return !!b && b.some((c) => I.released[c]);
    },
    consumeAction(name) {
      const b = I.bindings[name];
      if (b) b.forEach((c) => (I.pressed[c] = false));
    },
    requestLock() {
      if (G.SMOKE || G.SHOT || G.SURVEY) {
        I.locked = true;
        return;
      }
      const c = G.renderer && G.renderer.domElement;
      if (c && document.pointerLockElement !== c) {
        try {
          const p = c.requestPointerLock();
          if (p && p.catch) p.catch(() => {});
        } catch (e) {
          /* needs gesture */
        }
      }
    },
    exitLock() {
      if (document.pointerLockElement) document.exitPointerLock();
    },
    endFrame() {
      I.pressed = {};
      I.released = {};
      I.mouse.dx = 0;
      I.mouse.dy = 0;
      I.mouse.wheel = 0;
    },
  });
  const PREVENT = new Set([
    "Tab",
    "Space",
    "F5",
    "F9",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Backspace",
  ]);
  window.addEventListener("keydown", (e) => {
    if (
      e.target &&
      (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
    )
      return;
    if (PREVENT.has(e.code)) e.preventDefault();
    if (!I.keys[e.code]) I.pressed[e.code] = true;
    I.keys[e.code] = true;
    G.events.emit("keydown", e.code, e);
  });
  // Guard against losing progress by closing / reloading the tab mid-game (Ctrl+W, Cmd+R, back gesture...).
  window.addEventListener("beforeunload", (e) => {
    if (G.SMOKE || G.SHOT || G.SURVEY) return;
    if (
      ["title", "loading", "chargen"].indexOf(G.state) >= 0 ||
      G.state === undefined
    )
      return;
    e.preventDefault();
    e.returnValue = "";
    return "";
  });
  // Best effort: in fullscreen, ask the browser to route system shortcuts (Ctrl+W etc.) to the page.
  document.addEventListener("fullscreenchange", () => {
    try {
      if (!navigator.keyboard || !navigator.keyboard.lock) return;
      if (document.fullscreenElement) {
        const p = navigator.keyboard.lock();
        if (p && p.catch) p.catch(() => {});
      } else navigator.keyboard.unlock();
    } catch (e) {
      /* unsupported */
    }
  });
  window.addEventListener("keyup", (e) => {
    I.keys[e.code] = false;
    I.released[e.code] = true;
    G.events.emit("keyup", e.code, e);
  });
  window.addEventListener("blur", () => {
    I.keys = {};
  });
  window.addEventListener("mousemove", (e) => {
    I.mouse.x = e.clientX;
    I.mouse.y = e.clientY;
    if (I.locked) {
      I.mouse.dx += e.movementX || 0;
      I.mouse.dy += e.movementY || 0;
    }
  });
  window.addEventListener("mousedown", (e) => {
    const c = "Mouse" + e.button;
    if (!I.keys[c]) I.pressed[c] = true;
    I.keys[c] = true;
    if (
      G.state === "play" &&
      !I.locked &&
      G.renderer &&
      e.target === G.renderer.domElement
    )
      I.requestLock();
  });
  window.addEventListener("mouseup", (e) => {
    const c = "Mouse" + e.button;
    I.keys[c] = false;
    I.released[c] = true;
  });
  window.addEventListener(
    "wheel",
    (e) => {
      I.mouse.wheel += Math.sign(e.deltaY);
    },
    { passive: true },
  );
  window.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("pointerlockchange", () => {
    const was = I.locked;
    I.locked = !!document.pointerLockElement;
    if (was && !I.locked && G.state === "play") G.setState("paused");
    G.events.emit("pointerlock", I.locked);
  });

  // ------------------------------------------------------------------
  // World: colliders (yaw-rotated boxes), spatial grid, raycast, ground
  // ------------------------------------------------------------------
  const CELL = 20;
  const W = (G.world = {
    colliders: [],
    grid: new Map(),
    CELL,
    waterLevel: -1.2,
    stepHeight: 0.55,
    interactables: [],
    focus: null,
    radSources: [],
    lods: [],
    doors: [],
    interactRange: 3.2,
  });
  function cellKey(cx, cz) {
    return (cx * 73856093) ^ (cz * 19349663);
  }
  function colliderAABB(c) {
    const cos = Math.abs(Math.cos(c.yaw)),
      sin = Math.abs(Math.sin(c.yaw));
    const ex = c.hx * cos + c.hz * sin,
      ez = c.hx * sin + c.hz * cos;
    return { x0: c.cx - ex, x1: c.cx + ex, z0: c.cz - ez, z1: c.cz + ez };
  }
  /**
   * Add a collider: an XZ-rotated box. opts: {tag, walkable=true, surface:'concrete'|'metal'|'grass'|'dirt'|'wood'|'water', data}
   * @returns collider handle (pass to removeCollider)
   */
  W.addCollider = function (cx, cz, w, d, minY, maxY, yaw, opts) {
    opts = opts || {};
    const c = {
      cx,
      cz,
      hx: w / 2,
      hz: d / 2,
      minY,
      maxY,
      yaw: yaw || 0,
      cos: Math.cos(-(yaw || 0)),
      sin: Math.sin(-(yaw || 0)),
      tag: opts.tag || "static",
      walkable: opts.walkable !== false,
      surface: opts.surface || "concrete",
      data: opts.data || null,
      _stamp: 0,
      cells: [],
    };
    const bb = colliderAABB(c);
    c.bb = bb;
    for (let x = Math.floor(bb.x0 / CELL); x <= Math.floor(bb.x1 / CELL); x++) {
      for (
        let z = Math.floor(bb.z0 / CELL);
        z <= Math.floor(bb.z1 / CELL);
        z++
      ) {
        const k = cellKey(x, z);
        let arr = W.grid.get(k);
        if (!arr) {
          arr = [];
          W.grid.set(k, arr);
        }
        arr.push(c);
        c.cells.push(k);
      }
    }
    W.colliders.push(c);
    return c;
  };
  /** Axis-aligned convenience: min/max corners. */
  W.addBox = function (minX, minY, minZ, maxX, maxY, maxZ, opts) {
    return W.addCollider(
      (minX + maxX) / 2,
      (minZ + maxZ) / 2,
      maxX - minX,
      maxZ - minZ,
      minY,
      maxY,
      0,
      opts,
    );
  };
  /** Collider from a mesh/group: uses local bounding box, world position, world yaw and scale. */
  W.addFromObject = function (obj, opts) {
    obj.updateWorldMatrix(true, true);
    const box = new THREE.Box3();
    // local-space bounds of the whole object (relative to obj)
    const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert();
    obj.traverse((o) => {
      if (!o.geometry) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      const b = o.geometry.boundingBox
        .clone()
        .applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
      box.union(b);
    });
    if (box.isEmpty()) return null;
    const pos = new THREE.Vector3(),
      quat = new THREE.Quaternion(),
      scl = new THREE.Vector3();
    obj.matrixWorld.decompose(pos, quat, scl);
    const e = new THREE.Euler().setFromQuaternion(quat, "YXZ");
    const center = box
      .getCenter(new THREE.Vector3())
      .multiply(scl)
      .applyQuaternion(quat)
      .add(pos);
    const size = box.getSize(new THREE.Vector3()).multiply(scl);
    return W.addCollider(
      center.x,
      center.z,
      size.x,
      size.z,
      center.y - size.y / 2,
      center.y + size.y / 2,
      e.y,
      opts,
    );
  };
  W.removeCollider = function (c) {
    if (!c) return;
    for (const k of c.cells) {
      const arr = W.grid.get(k);
      if (arr) {
        const i = arr.indexOf(c);
        if (i >= 0) arr.splice(i, 1);
      }
    }
    const i = W.colliders.indexOf(c);
    if (i >= 0) W.colliders.splice(i, 1);
  };
  let stamp = 1;
  /** Colliders whose grid cells touch the XZ rect. */
  W.query = function (x0, z0, x1, z1) {
    stamp++;
    const out = [];
    for (let x = Math.floor(x0 / CELL); x <= Math.floor(x1 / CELL); x++) {
      for (let z = Math.floor(z0 / CELL); z <= Math.floor(z1 / CELL); z++) {
        const arr = W.grid.get(cellKey(x, z));
        if (!arr) continue;
        for (const c of arr)
          if (c._stamp !== stamp) {
            c._stamp = stamp;
            out.push(c);
          }
      }
    }
    return out;
  };
  function toLocal(c, x, z) {
    const dx = x - c.cx,
      dz = z - c.cz;
    return [dx * c.cos - dz * c.sin, dx * c.sin + dz * c.cos];
  }
  function toWorldDir(c, lx, lz) {
    return [lx * c.cos + lz * c.sin, -lx * c.sin + lz * c.cos];
  }
  W.pointInCollider = (c, x, z, pad) => {
    const l = toLocal(c, x, z);
    pad = pad || 0;
    return Math.abs(l[0]) <= c.hx + pad && Math.abs(l[1]) <= c.hz + pad;
  };

  /** Terrain height (land y≈0; map module may override for park hills; river bed below water). */
  W.terrainHeight = function (x, z) {
    return G.LAYOUT && G.LAYOUT.isLand(x, z) ? 0 : -6;
  };
  /** Highest walkable surface under (x,z) that is at or below yRef + stepHeight. */
  W.groundHeight = function (x, z, yRef, radius) {
    if (yRef === undefined) yRef = 1e6;
    radius = radius || 0;
    let best = W.terrainHeight(x, z);
    const cs = W.query(x - radius, z - radius, x + radius, z + radius);
    for (const c of cs) {
      if (!c.walkable) continue;
      if (
        c.maxY > best &&
        c.maxY <= yRef + W.stepHeight &&
        W.pointInCollider(c, x, z, radius * 0.5)
      )
        best = c.maxY;
    }
    return best;
  };
  /**
   * Move a vertical cylinder (feet at pos.y, given height) by (dx,dz) with wall sliding.
   * Returns {x, z, blocked}. Colliders whose top is within stepHeight of feet are ignored (stepped onto).
   */
  W.moveCircle = function (pos, radius, height, dx, dz, ignore) {
    let x = pos.x + dx,
      z = pos.z + dz,
      blocked = false;
    const feet = pos.y + W.stepHeight,
      head = pos.y + height;
    for (let iter = 0; iter < 3; iter++) {
      let pushed = false;
      const cs = W.query(
        x - radius - 1,
        z - radius - 1,
        x + radius + 1,
        z + radius + 1,
      );
      for (const c of cs) {
        if (c === ignore || c.maxY <= feet || c.minY >= head) continue;
        const l = toLocal(c, x, z);
        const qx = U.clamp(l[0], -c.hx, c.hx),
          qz = U.clamp(l[1], -c.hz, c.hz);
        let ox = l[0] - qx,
          oz = l[1] - qz;
        const d2 = ox * ox + oz * oz;
        if (d2 >= radius * radius) continue;
        let nx, nz, pen;
        if (d2 > 1e-8) {
          const d = Math.sqrt(d2);
          nx = ox / d;
          nz = oz / d;
          pen = radius - d;
        } else {
          // center inside box: push out along smallest axis
          const px = c.hx - Math.abs(l[0]),
            pz = c.hz - Math.abs(l[1]);
          if (px < pz) {
            nx = Math.sign(l[0]) || 1;
            nz = 0;
            pen = px + radius;
          } else {
            nx = 0;
            nz = Math.sign(l[1]) || 1;
            pen = pz + radius;
          }
        }
        const wd = toWorldDir(c, nx, nz);
        x += wd[0] * pen;
        z += wd[1] * pen;
        pushed = true;
        blocked = true;
      }
      if (!pushed) break;
    }
    // world bounds
    const WB = G.LAYOUT ? G.LAYOUT.WORLD : null;
    if (WB && x < G.LAYOUT.INTERIOR_X_MIN) {
      x = U.clamp(x, WB.minX + 2, WB.maxX - 2);
      z = U.clamp(z, WB.minZ + 2, WB.maxZ - 2);
    }
    return { x, z, blocked };
  };
  /**
   * Raycast against colliders + terrain.  dir must be normalized.
   * opts: {ignoreTags:Set|Array, includeWater:false}
   * returns {dist, point:Vector3, normal:Vector3, collider|null, surface} or null
   */
  const _v = new THREE.Vector3();
  W.raycast = function (origin, dir, maxDist, opts) {
    opts = opts || {};
    const ignore = opts.ignoreTags ? new Set(opts.ignoreTags) : null;
    let best = maxDist,
      hit = null,
      hitN = null;
    const step = CELL;
    stamp++;
    const myStamp = stamp;
    const nSteps = Math.ceil(maxDist / step) + 1;
    for (let s = 0; s <= nSteps; s++) {
      const t0 = s * step;
      if (t0 > best + step) break;
      const px = origin.x + dir.x * t0,
        pz = origin.z + dir.z * t0;
      const px2 = origin.x + dir.x * Math.min(t0 + step, maxDist),
        pz2 = origin.z + dir.z * Math.min(t0 + step, maxDist);
      for (
        let cx = Math.floor(Math.min(px, px2) / CELL) - 0;
        cx <= Math.floor(Math.max(px, px2) / CELL);
        cx++
      ) {
        for (
          let cz = Math.floor(Math.min(pz, pz2) / CELL);
          cz <= Math.floor(Math.max(pz, pz2) / CELL);
          cz++
        ) {
          const arr = W.grid.get(cellKey(cx, cz));
          if (!arr) continue;
          for (const c of arr) {
            if (c._stamp === myStamp) continue;
            c._stamp = myStamp;
            if (ignore && ignore.has(c.tag)) continue;
            // slab test in collider local frame
            const lo = toLocal(c, origin.x, origin.z);
            const ldx = dir.x * c.cos - dir.z * c.sin,
              ldz = dir.x * c.sin + dir.z * c.cos;
            let tmin = 0,
              tmax = best,
              nAxis = -1,
              nSign = 0;
            const slabs = [
              [lo[0], ldx, -c.hx, c.hx, 0],
              [origin.y, dir.y, c.minY, c.maxY, 1],
              [lo[1], ldz, -c.hz, c.hz, 2],
            ];
            let ok = true;
            for (const sl of slabs) {
              const o = sl[0],
                d = sl[1];
              if (Math.abs(d) < 1e-9) {
                if (o < sl[2] || o > sl[3]) {
                  ok = false;
                  break;
                }
                continue;
              }
              let t1 = (sl[2] - o) / d,
                t2 = (sl[3] - o) / d,
                sg = -1;
              if (t1 > t2) {
                const tt = t1;
                t1 = t2;
                t2 = tt;
                sg = 1;
              }
              if (t1 > tmin) {
                tmin = t1;
                nAxis = sl[4];
                nSign = sg;
              }
              if (t2 < tmax) tmax = t2;
              if (tmin > tmax) {
                ok = false;
                break;
              }
            }
            if (!ok || tmin >= best || nAxis < 0) continue;
            best = tmin;
            hit = c;
            if (nAxis === 1) hitN = [0, nSign, 0];
            else {
              const wd =
                nAxis === 0 ? toWorldDir(c, nSign, 0) : toWorldDir(c, 0, nSign);
              hitN = [wd[0], 0, wd[1]];
            }
          }
        }
      }
    }
    // terrain / water
    if (dir.y < -1e-4) {
      const tStep = 1.0;
      for (let t = 0; t < best; t += tStep) {
        const x = origin.x + dir.x * t,
          y = origin.y + dir.y * t,
          z = origin.z + dir.z * t;
        let gh = W.terrainHeight(x, z);
        if (opts.includeWater && gh < W.waterLevel) gh = W.waterLevel;
        if (y <= gh) {
          best = Math.max(0, t - tStep * 0.5);
          hit = null;
          hitN = [0, 1, 0];
          break;
        }
      }
    }
    if (!hitN) return null;
    return {
      dist: best,
      point: new THREE.Vector3(
        origin.x + dir.x * best,
        origin.y + dir.y * best,
        origin.z + dir.z * best,
      ),
      normal: new THREE.Vector3(hitN[0], hitN[1], hitN[2]),
      collider: hit,
      surface: hit
        ? hit.surface
        : G.LAYOUT &&
            G.LAYOUT.inPark(origin.x + dir.x * best, origin.z + dir.z * best)
          ? "grass"
          : "concrete",
    };
  };
  W.lineOfSight = function (a, b, opts) {
    _v.subVectors(b, a);
    const d = _v.length();
    if (d < 1e-3) return true;
    _v.divideScalar(d);
    const h = W.raycast(a, _v, d, opts);
    return !h || h.dist >= d - 0.3;
  };

  // ---- Interactables ------------------------------------------------
  /**
   * Register something the player can activate with E.
   * def: {pos:Vector3 | getPos():Vector3, radius=0.8, label:string|fn, verb:'Open'|'Talk'|'Take'|..., enabled?():bool,
   *       onInteract(), object3d?, priority=0, range?}
   */
  // Broad phase: the ~1,100 interactables are culled to a short candidate list near the eye, rebuilt 4x/s
  // (or when the eye moves > 2 m / the list changes). A generous pad covers items moving between rebuilds.
  let _cand = [],
    _candDirty = true,
    _candT = 0;
  const _candEye = new THREE.Vector3(1e9, 0, 0),
    CAND_PAD = 6;
  W.addInteractable = function (def) {
    def.radius = def.radius || 0.8;
    def.id = def.id || U.randomId("int");
    W.interactables.push(def);
    _candDirty = true;
    return def;
  };
  W.removeInteractable = function (def) {
    const i = W.interactables.indexOf(def);
    if (i >= 0) W.interactables.splice(i, 1);
    const j = _cand.indexOf(def);
    if (j >= 0) _cand.splice(j, 1);
    if (W.focus === def) {
      W.focus = null;
      G.events.emit("focus", null);
    }
  };
  function rebuildCandidates(eye) {
    _cand = [];
    for (const it of W.interactables) {
      let p;
      try {
        p = it.getPos ? it.getPos() : it.pos;
      } catch (e) {
        p = null;
      }
      if (!p) {
        if (it.getPos) _cand.push(it);
        continue;
      } // position unknown right now: keep testing it
      const r = (it.range || W.interactRange) + (it.radius || 0.8) + CAND_PAD;
      const dx = p.x - eye.x,
        dy = (p.y || 0) - eye.y,
        dz = p.z - eye.z;
      if (dx * dx + dy * dy + dz * dz < r * r) _cand.push(it);
    }
    _candEye.copy(eye);
    _candDirty = false;
    _candT = 0.25;
  }
  const _fwd = new THREE.Vector3(),
    _to = new THREE.Vector3(),
    _eye = new THREE.Vector3();
  function updateFocus() {
    let best = null,
      bestScore = -1e9;
    if (G.player && G.player.thirdPersonActive) {
      _eye.copy(G.player.eye);
      _fwd.copy(G.player.forward);
    } // camera is behind the player
    else {
      G.camera.getWorldPosition(_eye);
      G.camera.getWorldDirection(_fwd);
    }
    _candT -= G.realDt || 0.016;
    if (_candDirty || _candT <= 0 || _eye.distanceToSquared(_candEye) > 4)
      rebuildCandidates(_eye);
    for (const it of _cand) {
      if (it.enabled && !it.enabled()) continue;
      const p = it.getPos ? it.getPos() : it.pos;
      if (!p) continue;
      _to.subVectors(p, _eye);
      const dist = _to.length();
      const range = (it.range || W.interactRange) + it.radius;
      if (dist > range) continue;
      _to.divideScalar(dist || 1);
      const dot = _to.dot(_fwd);
      const angTol = Math.atan2(it.radius, Math.max(dist, 0.1));
      const ang = Math.acos(U.clamp(dot, -1, 1));
      if (ang > angTol + 0.12) continue;
      const score = -ang * 3 - dist * 0.1 + (it.priority || 0);
      if (score > bestScore) {
        bestScore = score;
        best = it;
      }
    }
    if (best) {
      // occlusion check
      const p = best.getPos ? best.getPos() : best.pos;
      if (
        !W.lineOfSight(_eye, p, { ignoreTags: ["interactable_self", "actor"] })
      ) {
        const d = _eye.distanceTo(p);
        if (d > 1.2) best = null;
      }
    }
    if (best !== W.focus) {
      W.focus = best;
      G.events.emit("focus", best);
    }
  }
  W.getFocusLabel = function () {
    const f = W.focus;
    if (!f) return null;
    return {
      verb: typeof f.verb === "function" ? f.verb() : f.verb || "Activate",
      label: typeof f.label === "function" ? f.label() : f.label || "",
      locked: f.locked
        ? typeof f.locked === "function"
          ? f.locked()
          : f.locked
        : null,
    };
  };

  // ---- Doors / teleports ---------------------------------------------
  /**
   * def: {pos:Vector3, label:'Records Room', verb:'Enter', target:{x,y,z,yaw}, lock?:{id, key?, code?, passcode?} (G.locks),
   *       sound?:'door_open'|…, radius?, onEnter?()}   (locked?: truthy = a script-held door that only scripts open)
   */
  W.addDoor = function (def) {
    const door = W.addInteractable({
      pos: def.pos,
      radius: def.radius || 1.2,
      label: def.label,
      verb: def.verb || "Enter",
      priority: 1,
      locked: () =>
        def.lock
          ? G.locks &&
            G.locks.isOpen &&
            !G.isStub("locks") &&
            !G.locks.isOpen(def.lock.id)
            ? "Locked"
            : null
          : door._locked
            ? "Locked"
            : null,
      onInteract() {
        if (
          def.lock &&
          G.locks &&
          !G.isStub("locks") &&
          G.locks.open &&
          !G.locks.isOpen(def.lock.id)
        ) {
          G.locks.open(
            def.lock,
            () => door.def && door.onInteract && door.onInteract(),
          );
          return;
        }
        if (door._locked) {
          G.sfx.play("door_locked");
          G.notify("This door is locked.");
          return;
        }
        G.sfx.play(def.sound || "door_open");
        G.fadeTransition(() => {
          G.player.teleport(
            def.target.x,
            def.target.y || 0,
            def.target.z,
            def.target.yaw || 0,
          );
          if (def.onEnter) def.onEnter();
          G.events.emit("doorTransition", def);
        });
      },
    });
    door._locked = def.locked || 0;
    door.def = def;
    W.doors.push(door);
    return door;
  };
  /** Stable key for a door's lock state in saves (explicit def.id, else its rounded position). */
  function doorKey(d) {
    if (d.def && d.def.id) return String(d.def.id);
    const p = d.pos || (d.def && d.def.pos);
    if (!p) return null;
    return (
      Math.round(p.x * 10) +
      "," +
      Math.round((p.y || 0) * 10) +
      "," +
      Math.round(p.z * 10)
    );
  }
  /** Script-held doors opened this playthrough (locked by definition, now open). */
  W.unlockedDoorKeys = function () {
    const out = [];
    for (const d of W.doors)
      if (d.def && d.def.locked > 0 && !d._locked) {
        const k = doorKey(d);
        if (k) out.push(k);
      }
    return out;
  };
  /** Restore every door to its defined lock, then re-open the given keys (save data). */
  W.restoreDoorLocks = function (unlocked) {
    const set = new Set(unlocked || []);
    for (const d of W.doors) {
      if (!d.def) continue;
      d._locked = set.has(doorKey(d)) ? 0 : d.def.locked || 0;
    }
  };

  // ---- Distance LOD / culling ---------------------------------------
  /** Hide obj when camera farther than maxDist (checked 4×/s). */
  W.addLOD = function (obj, maxDist, center) {
    const e = { obj, max2: maxDist * maxDist, c: center || null };
    W.lods.push(e);
    return e;
  };
  let lodTimer = 0;
  const _lp = new THREE.Vector3();
  function updateLODs(dt) {
    lodTimer -= dt;
    if (lodTimer > 0) return;
    lodTimer = 0.25;
    const cam = G.camera.position;
    for (const e of W.lods) {
      const p = e.c || e.obj.getWorldPosition(_lp);
      const dx = p.x - cam.x,
        dz = p.z - cam.z;
      e.obj.visible = dx * dx + dz * dz < e.max2;
    }
  }

  // ---- Radiation sources ---------------------------------------------
  /** {x,y,z, radius, strength (rads/sec at centre)} — player accumulates rads when inside. */
  W.addRadSource = function (src) {
    W.radSources.push(src);
    return src;
  };
  W.removeRadSource = function (src) {
    const i = W.radSources.indexOf(src);
    if (i >= 0) W.radSources.splice(i, 1);
  };
  W.radiationAt = function (p) {
    let r = 0;
    for (const s of W.radSources) {
      const d = Math.hypot(p.x - s.x, (p.y || 0) - (s.y || 0), p.z - s.z);
      if (d < s.radius) r += s.strength * (1 - d / s.radius);
    }
    return r;
  };

  // ---- Location discovery --------------------------------------------
  G.discovered = new Set();
  let discTimer = 0;
  function updateDiscovery(dt) {
    discTimer -= dt;
    if (discTimer > 0 || !G.LAYOUT) return;
    discTimer = 0.5;
    const p = G.player.pos;
    for (const l of G.LAYOUT.LOCATIONS) {
      if (G.discovered.has(l.id)) continue;
      if (l.sub) continue; // sub-locations share their parent's map marker
      if (Math.hypot(p.x - l.x, p.z - l.z) < Math.max(l.r, 25) + 15)
        G.discover(l.id);
    }
  }
  G.discover = function (id) {
    if (G.discovered.has(id)) return;
    const l = G.LAYOUT.getLocation(id);
    if (!l) return;
    G.discovered.add(id);
    G.events.emit("locationDiscovered", l);
  };

  // ------------------------------------------------------------------
  // Notifications & fades (UI module may style; core provides fallback DOM)
  // ------------------------------------------------------------------
  /** Short on-screen message ("Rally Tonic added."). HUD listens to 'notify'. */
  G.notify = function (text, opts) {
    G.events.emit("notify", text, opts || {});
    if (G.isStub("hud")) console.log("[notify] " + text);
  };
  let fadeEl = null;
  G.fadeTransition = function (midFn, dur) {
    dur = dur || 0.45;
    if (!fadeEl) {
      fadeEl = document.createElement("div");
      fadeEl.style.cssText =
        "position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:900;transition:opacity " +
        dur +
        "s";
      document.body.appendChild(fadeEl);
    }
    fadeEl.style.opacity = "1";
    setTimeout(() => {
      try {
        midFn && midFn();
      } catch (e) {
        G.reportError("fade", e);
      }
      setTimeout(() => {
        fadeEl.style.opacity = "0";
      }, 120);
    }, dur * 1000);
  };

  // ------------------------------------------------------------------
  // Save / load (localStorage)
  // ------------------------------------------------------------------
  const saveRegs = {};
  G.save = {
    /** reg: {save(): json, load(data)} — load is called after 'reset'. */
    register(key, reg) {
      saveRegs[key] = reg;
    },
    /** Save migrations: fn(data) → data (or undefined to keep the mutated object). Run on every load, before any module loads. */
    migrations: [],
    saveGame(slot, label) {
      slot = slot || "quick";
      // Never write a save of a dead player (e.g. F5 during the death fall).
      if (G.player && G.player.alive === false) {
        G.notify("You can't save while dead.");
        return false;
      }
      let place = "";
      try {
        place = G.savePlace ? String(G.savePlace() || "") : "";
      } catch (e) {
        /* ignore */
      }
      const data = {
        version: G.VERSION,
        time: Date.now(),
        label: label || "",
        place,
        modules: {},
      };
      for (const k in saveRegs) {
        try {
          data.modules[k] = saveRegs[k].save();
        } catch (e) {
          G.reportError("save:" + k, e);
        }
      }
      try {
        localStorage.setItem("nrc_save_" + slot, JSON.stringify(data));
      } catch (e) {
        G.reportError("save", e);
        G.notify("Save failed.");
        return false;
      }
      G.events.emit("saved", slot);
      G.notify("Game saved.");
      return true;
    },
    loadGame(slot) {
      slot = slot || "quick";
      let data = null;
      try {
        data = JSON.parse(localStorage.getItem("nrc_save_" + slot));
      } catch (e) {
        data = null;
      }
      if (!data) {
        G.notify("No saved game.");
        return false;
      }
      for (const fn of G.save.migrations) {
        try {
          const r = fn(data);
          if (r && typeof r === "object") data = r;
        } catch (e) {
          G.reportError("save:migrate", e);
        }
      }
      G.events.emit("reset", { loading: true });
      for (const k in saveRegs) {
        if (data.modules[k] !== undefined) {
          try {
            saveRegs[k].load(data.modules[k]);
          } catch (e) {
            G.reportError("load:" + k, e);
          }
        }
      }
      G.events.emit("loaded", data);
      G.setState("play");
      return true;
    },
    listSlots() {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("nrc_save_")) {
          try {
            const d = JSON.parse(localStorage.getItem(k));
            out.push({
              slot: k.slice(9),
              time: d.time,
              label: d.label,
              place: d.place || "",
            });
          } catch (e) {
            /* skip */
          }
        }
      }
      return out.sort((a, b) => b.time - a.time);
    },
    deleteSlot(slot) {
      localStorage.removeItem("nrc_save_" + slot);
    },
    hasAny() {
      return G.save.listSlots().length > 0;
    },
  };
  G.save.register("core", {
    save: () => ({
      discovered: Array.from(G.discovered),
      time: { hour: G.time.hour, day: G.time.day },
      unlocked: W.unlockedDoorKeys(),
    }),
    load: (d) => {
      G.discovered = new Set(d.discovered || []);
      if (d.time) {
        G.time.hour = d.time.hour;
        G.time.day = d.time.day;
      }
      W.restoreDoorLocks(d.unlocked || []);
    },
  });
  // New game / load start from the defined lock state (load then re-applies the saved unlocks).
  G.events.on("reset", () => {
    try {
      W.restoreDoorLocks([]);
    } catch (e) {
      G.reportError("doors", e);
    }
  });

  // ------------------------------------------------------------------
  // New game
  // ------------------------------------------------------------------
  /** opts: {name, special?, tags?, skipIntro?}. UI chargen calls this. */
  G.newGame = function (opts) {
    opts = opts || {};
    G.events.emit("reset", { loading: false });
    G.discovered = new Set();
    G.time.hour = 9.5;
    G.time.day = 1;
    const s = G.LAYOUT.playerStart;
    G.player.teleport(s.x, s.y || 0, s.z, s.yaw || 0);
    G.events.emit("newGame", opts);
    G.setState("play");
  };

  // ------------------------------------------------------------------
  // Main loop
  // ------------------------------------------------------------------
  let last = 0;
  G.stats = { fps: 0, frameMs: 0 };
  let fpsAcc = 0,
    fpsN = 0,
    holdFrames = 0;
  G.redrawHeld = () => {
    holdFrames = 0;
  }; // e.g. after a resize while the goggles are open
  function frame(t) {
    requestAnimationFrame(frame);
    const now = t / 1000;
    let realDt = last ? now - last : 0.016;
    last = now;
    if (realDt > 0.1) realDt = 0.1;
    step(realDt);
  }
  function step(realDt) {
    const t0 = performance.now();
    const running = G.worldRunning();
    const dt = running ? realDt * G.timeScale : 0;
    G.dt = dt;
    G.realDt = realDt;
    G.time.real += realDt;
    G.time.elapsed += dt;
    G.time.frame++;
    // global hotkeys
    if (G.state === "play") {
      if (I.actionPressed("quicksave")) {
        if (G.player && G.player.alive) G.save.saveGame("quick", "Quicksave");
        else I.consumeAction("quicksave");
      }
      if (I.actionPressed("quickload")) G.save.loadGame("quick");
    }
    try {
      if (G.player && G.player.update) G.player.update(dt, realDt);
    } catch (e) {
      G.reportError("player", e);
    }
    for (const m of G._modules)
      if (m.update && !m._dead) {
        try {
          m.update(dt, realDt, G);
        } catch (e) {
          G.reportError("update:" + m.name, e);
        }
      }
    if (G.state === "play") updateFocus();
    else if (W.focus) {
      W.focus = null;
      G.events.emit("focus", null);
    }
    if (running || G.state === "play") {
      updateDiscovery(realDt);
    }
    updateLODs(realDt);
    // E to interact
    if (G.state === "play" && W.focus && I.actionPressed("interact")) {
      I.consumeAction("interact");
      try {
        W.focus.onInteract();
      } catch (e) {
        G.reportError("interact", e);
      }
    }
    for (const m of G._modules)
      if (m.lateUpdate && !m._dead) {
        try {
          m.lateUpdate(dt, realDt, G);
        } catch (e) {
          G.reportError("late:" + m.name, e);
        }
      }
    G.viewCamera.fov = G.viewCamera.fov; // (weapons module may adjust)
    // The world is frozen behind the VIGIL goggles: after a few frames keep the last image instead of
    // redrawing it, so the blurred backdrop is computed once rather than every frame.
    holdFrames = G.state === "goggles" && !G.SHOT ? holdFrames + 1 : 0;
    if (holdFrames < 4) G.render();
    I.endFrame();
    G.stats.frameMs = performance.now() - t0;
    fpsAcc += realDt;
    fpsN++;
    if (fpsAcc > 0.5) {
      G.stats.fps = fpsN / fpsAcc;
      fpsAcc = 0;
      fpsN = 0;
    }
  }
  G._step = step;

  // ------------------------------------------------------------------
  // Boot / loading
  // ------------------------------------------------------------------
  function loadingUI(text, frac) {
    let el = document.getElementById("core-loading");
    if (!el) {
      el = document.createElement("div");
      el.id = "core-loading";
      el.style.cssText =
        'position:fixed;inset:0;background:#05080b;color:#cfeefa;font:18px/1.4 "Courier New",monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1000;text-shadow:0 0 8px rgba(150,220,240,.6)';
      el.innerHTML =
        '<div style="font-size:34px;letter-spacing:6px;margin-bottom:24px">' +
        (G.GAME_NAME || "NEW RAD CITY").toUpperCase() +
        '</div><div id="core-loading-text"></div><div style="width:360px;height:14px;border:2px solid #cfeefa;margin-top:12px"><div id="core-loading-bar" style="height:100%;width:0;background:#cfeefa"></div></div>';
      document.body.appendChild(el);
    }
    document.getElementById("core-loading-text").textContent = text;
    document.getElementById("core-loading-bar").style.width =
      Math.round(frac * 100) + "%";
    G.events.emit("loadingProgress", text, frac);
  }
  G.hideCoreLoading = () => {
    const el = document.getElementById("core-loading");
    if (el) el.remove();
  };
  G.initTimes = {};
  async function boot() {
    if (!THREE) {
      document.body.innerHTML =
        '<h1 style="color:#f44">three.js failed to load (check internet connection for CDN).</h1>';
      return;
    }
    G.initRenderer();
    const mods = G._modules;
    for (let i = 0; i < mods.length; i++) {
      const m = mods[i];
      loadingUI("Initializing " + m.name + "…", i / mods.length);
      await new Promise((r) => setTimeout(r, 0));
      const t0 = performance.now();
      try {
        if (m.init) await m.init(G);
      } catch (e) {
        G.reportError("init:" + m.name, e);
      }
      G.initTimes[m.name] = Math.round(performance.now() - t0);
    }
    loadingUI("Ready.", 1);
    G.events.emit("initDone");
    G.hideCoreLoading();
    if (G.SMOKE) return runSmoke();
    if (G.SURVEY && G.runSurvey) return G.runSurvey();
    if (G.SHOT) return runShot();
    G.setState("title");
    // Fallback title if no UI module provides one
    if (G.isStub("ui")) {
      const d = document.createElement("div");
      d.style.cssText =
        "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#cfeefa;font:28px monospace;background:rgba(0,0,0,.6);cursor:pointer;z-index:800";
      d.textContent = "[ CLICK TO START — core fallback title ]";
      d.onclick = () => {
        d.remove();
        G.newGame({ name: (G.HERO && G.HERO.name) || "Eli Wayte" });
      };
      document.body.appendChild(d);
    }
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------
  // Smoke test: ?smoke=1  — runs headless, writes JSON to <pre id=smoke-result>
  // ------------------------------------------------------------------
  function simulate(frames, inputFn) {
    for (let f = 0; f < frames; f++) {
      if (inputFn) inputFn(f);
      step(1 / 30);
    }
  }
  function press(code) {
    I.pressed[code] = true;
    I.keys[code] = true;
  }
  function release(code) {
    I.keys[code] = false;
    I.released[code] = true;
  }
  // Result markers are assembled at runtime so the literal never appears in the (inlined dist) source,
  // where tools/smoke.py's regex would otherwise match the script text instead of the result.
  const SMOKE_B = "SMOKE_JSON_" + "BEGIN",
    SMOKE_E = "SMOKE_JSON_" + "END";
  // ---------------- World sanity gate (used by smoke; any failure makes the smoke FAIL) ----------------
  // Catches "the whole city is underwater" / "new game starts in a broken place" regressions.
  function worldStartCheck() {
    const P = G.player,
      L = G.LAYOUT,
      W = G.world,
      out = { pos: [P.pos.x, P.pos.y, P.pos.z].map((v) => +v.toFixed(2)) };
    const fail = (m) => (out.fail = (out.fail || []).concat(m));
    if (!(P.pos.x >= L.INTERIOR_X_MIN))
      fail(
        "new game did not start inside the cryo unit interior (x=" +
          P.pos.x.toFixed(1) +
          ")",
      );
    if (P.swimming || P.inWater) fail("new game starts in water");
    if (
      !isFinite(P.pos.y) ||
      Math.abs(
        P.pos.y - W.groundHeight(P.pos.x, P.pos.z, P.pos.y + 1, P.radius),
      ) > 1.5
    )
      fail("new game start is not standing on a floor");
    if (G.state !== "play") fail("state after newGame is " + G.state);
    return out;
  }
  function worldSanityChecks(res) {
    const P = G.player,
      L = G.LAYOUT,
      W = G.world,
      wl = W.waterLevel;
    if (res.start && res.start.fail) res.failures.push(...res.start.fail);
    // Land sample points: cryo unit exit + every on-land location + street intersections spread over the city
    const pts = [{ id: "cryo_exit", x: L.cryoExit.x, z: L.cryoExit.z }];
    for (const l of L.LOCATIONS)
      if (!l.interior && L.isLand(l.x, l.z) && l.x < L.INTERIOR_X_MIN)
        pts.push({ id: l.id, x: l.x, z: l.z });
    for (const a of L.avenues)
      for (let z = a.z0 + 20; z < a.z1; z += 240)
        pts.push({ id: "ave" + a.x + "@" + Math.round(z), x: a.x, z });
    let underwater = [];
    const PF = L.PARK_FEATURES,
      wet = (x, z) =>
        [PF.lake, PF.reservoir].some((r) => r && L.inRect(x, z, r, 4));
    for (const p of pts) {
      if (wet(p.x, p.z)) continue; // the Lake & Reservoir are meant to be water
      const th = W.terrainHeight(p.x, p.z),
        gh = W.groundHeight(p.x, p.z, 200);
      if (!(th > wl + 0.3) && !(gh > wl + 0.3))
        underwater.push(p.id + " terrain=" + th.toFixed(2));
    }
    if (underwater.length)
      res.failures.push(
        "land below water level at " +
          underwater.length +
          "/" +
          pts.length +
          " points: " +
          underwater.slice(0, 6).join(", "),
      );
    // Walk test at a few points: player must end up dry, on the ground
    for (const p of pts.filter((q) =>
      [
        "cryo_exit",
        "times_square",
        "grand_central",
        "wall_street",
        "bethesda",
      ].includes(q.id),
    )) {
      P.teleport(p.x, 0, p.z, 0);
      simulate(20);
      if (P.swimming || P.inWater || P.pos.y < wl)
        res.failures.push(
          "player in water at " + p.id + " (y=" + P.pos.y.toFixed(2) + ")",
        );
    }
    // Visual: large flat meshes (water sheets, ground plates) must not sit above street level on the land area
    const box = new THREE.Box3(),
      size = new THREE.Vector3(),
      c = new THREE.Vector3(),
      bad = [];
    G.scene.traverse((o) => {
      if (!o.isMesh || !o.geometry || !o.visible) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      box.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
      box.getSize(size);
      box.getCenter(c);
      if (
        size.x > 400 &&
        size.z > 400 &&
        size.y < 3 &&
        c.y > 0.6 &&
        c.x < L.INTERIOR_X_MIN
      )
        bad.push((o.name || o.type) + " y=" + c.y.toFixed(2));
    });
    if (bad.length)
      res.failures.push(
        "large flat sheet above street level (flooded look?): " +
          bad.slice(0, 4).join(", "),
      );
    res.points = pts.length;
    res.drawCalls = G.renderer.info.render.calls;
    if (res.drawCalls > 1600)
      res.warn = "draw calls " + res.drawCalls + " over budget";
  }

  function runSmoke() {
    const result = {
      ok: false,
      modules: G._modules.map((m) => m.name),
      initTimes: G.initTimes,
      stubs: G.STUB_NAMESPACES.filter((n) => G.isStub(n)),
      steps: [],
    };
    const t0 = performance.now();
    const stepLog = (name) =>
      result.steps.push(
        name +
          " @" +
          Math.round(performance.now() - t0) +
          "ms errors=" +
          G.errors.length,
      );
    try {
      G.setState("title");
      simulate(5);
      stepLog("title");
      G.newGame({ name: "Smoke Tester", skipIntro: true });
      simulate(10);
      stepLog("newGame");
      result.sanity = { failures: [], start: worldStartCheck() };
      // Walk around the cryo unit
      simulate(60, (f) => {
        if (f === 0) press("KeyW");
        if (f === 30) {
          release("KeyW");
          press("KeyD");
        }
        if (f === 59) release("KeyD");
        I.mouse.dx = 8;
      });
      stepLog("walk");
      // Fire weapon
      simulate(30, (f) => {
        if (f % 6 === 0) press("Mouse0");
        if (f % 6 === 3) release("Mouse0");
      });
      stepLog("fire");
      simulate(5, (f) => {
        if (f === 0) press("KeyR");
        if (f === 1) release("KeyR");
      });
      stepLog("reload");
      // Teleport outside & wander midtown
      const ex = G.LAYOUT.cryoExit;
      G.player.teleport(ex.x, 0, ex.z, ex.yaw);
      simulate(30);
      stepLog("outside");
      G.player.teleport(-40, 0, -262, 0);
      simulate(60, (f) => {
        if (f === 0) press("KeyW");
        if (f === 59) release("KeyW");
      });
      stepLog("times_square");
      G.player.teleport(80, 0, -20, Math.PI);
      simulate(30);
      stepLog("empire_state");
      // Third-person camera: toggle with F, walk, zoom, fire, toggle back
      simulate(3, (f) => {
        if (f === 0) press("KeyF");
        if (f === 1) release("KeyF");
      });
      simulate(40, (f) => {
        if (f === 0) press("KeyW");
        if (f === 20) {
          release("KeyW");
          I.mouse.wheel = 1;
        }
        if (f % 8 === 0) press("Mouse0");
        if (f % 8 === 4) release("Mouse0");
        I.mouse.dx = 5;
      });
      stepLog("third_person active=" + !!G.player.thirdPersonActive);
      simulate(3, (f) => {
        if (f === 0) press("KeyF");
        if (f === 1) release("KeyF");
      });
      stepLog("first_person active=" + !!G.player.thirdPersonActive);
      // Goggles
      simulate(4, (f) => {
        if (f === 0) press("Tab");
        if (f === 1) release("Tab");
      });
      stepLog("goggles_open state=" + G.state);
      simulate(10);
      simulate(4, (f) => {
        if (f === 0) press("Tab");
        if (f === 1) release("Tab");
      });
      stepLog("goggles_close state=" + G.state);
      if (G.state !== "play") G.setState("play");
      simulate(30);
      if (G.state !== "play") G.setState("play");
      simulate(4, (f) => {
        if (f === 0) press("Escape");
        if (f === 1) release("Escape");
      });
      if (G.state !== "play") G.setState("play");
      // Save/load roundtrip
      G.save.saveGame("smoke", "smoke");
      G.save.loadGame("smoke");
      G.save.deleteSlot("smoke");
      simulate(10);
      stepLog("saveload");
      // Downtown + harbour
      G.player.teleport(0, 0, 780, Math.PI);
      simulate(30);
      stepLog("wall_street");
      G.player.teleport(-420, 0, 1180, Math.PI);
      simulate(20);
      stepLog("liberty");
      G.player.teleport(300, 0, 640, Math.PI / 2);
      simulate(20);
      stepLog("bridge");
      // damage & death path
      G.player.damage(5, { type: "ballistic" });
      simulate(5);
      stepLog("damage");
      worldSanityChecks(result.sanity);
      result.ok = G.errors.length === 0 && result.sanity.failures.length === 0;
    } catch (e) {
      G.reportError("smoke", e);
    }
    const info = G.renderer.info;
    result.render = {
      calls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
    };
    result.sceneObjects = 0;
    G.scene.traverse(() => result.sceneObjects++);
    result.colliders = W.colliders.length;
    result.interactables = W.interactables.length;
    result.actors =
      G.actors && G.actors.list && !G.isStub("actors")
        ? G.actors.list().length || 0
        : "stub";
    result.errors = G.errors.slice(0, 60);
    result.warnings = G.warnings.slice(0, 20);
    result.elapsedMs = Math.round(performance.now() - t0);
    const pre = document.createElement("pre");
    pre.id = "smoke-result";
    pre.textContent = SMOKE_B + JSON.stringify(result) + SMOKE_E;
    document.body.appendChild(pre);
    document.title = result.ok ? "SMOKE_OK" : "SMOKE_FAIL";
  }
  // Screenshot mode: ?shot=x,y,z,yaw,pitch[&hour=12][&state=goggles]
  function runShot() {
    const v = G.SHOT.split(",").map(Number);
    G.newGame({ name: "Shot", skipIntro: true });
    if (QS.has("hour")) G.time.hour = Number(QS.get("hour"));
    G.player.teleport(v[0], v[1] || 0, v[2], v[3] || 0);
    G.player.pitch = v[4] || 0;
    G.player.fly = true;
    G.player.pos.y = v[1] || 0;
    if (QS.get("state")) G.setState(QS.get("state"));
    if (QS.get("nohud")) {
      const st = document.createElement("style");
      st.textContent = "#ui-root,#cheat-badge{display:none!important}";
      document.head.appendChild(st);
    } // screenshot-only: clean frame for mockups
    if (QS.get("tp") === "1" && G.player.setThirdPerson)
      G.player.setThirdPerson(true);
    for (let f = 0; f < 45; f++) {
      step(1 / 30);
      // discovery XP can pop the level-up screen over a world shot: close it (shot mode only)
      if (
        !QS.get("state") &&
        (G.state === "levelup" || G.state === "dialogue") &&
        G.player.alive
      )
        G.setState("play");
    }
    G.player.pos.y = v[1] || 0;
    step(1 / 30);
    document.title = "SHOT_READY";
    const pre = document.createElement("pre");
    pre.id = "smoke-result";
    pre.style.display = "none";
    pre.textContent =
      SMOKE_B +
      JSON.stringify({
        errors: G.errors.slice(0, 40),
        calls: G.renderer.info.render.calls,
        tris: G.renderer.info.render.triangles,
      }) +
      SMOKE_E;
    document.body.appendChild(pre);
  }

  window.addEventListener("load", () => {
    boot().catch((e) => G.reportError("boot", e));
  });
})();
