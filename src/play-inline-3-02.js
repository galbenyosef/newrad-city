// play-inline-3 02 — code
// Lines 363-711 of readable/play-inline-3.pretty.js (statement-aligned).
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
