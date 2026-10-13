// play-inline-3 06 — simulate
// Lines 1648-1992 of readable/play-inline-3.pretty.js (statement-aligned).
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
