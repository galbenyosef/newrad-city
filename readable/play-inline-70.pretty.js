/* src/atmosphere/90_debug.js */
/* =====================================================================
 * ATMOSPHERE — debug / test hooks (URL params, no effect in normal play)
 *   ?weather=thunderstorm|rain|dust|fog|overcast|clear   (handled in weather)
 *   ?grading=olive|amber|teal|none   ?postfx=0
 *   ?fxtest=explosion,nuke,fire,smoke,impacts,laser,tracer,blood,ash,goo,
 *           lightning,glows,decals,plasma,muzzle,sparks   [&fxage=1.2][&fxdist=20][&fxframe=40]
 *     spawns the effects in front of the camera on the first play frame and
 *     fast-forwards the atmosphere systems by fxage seconds (screenshots).
 * Console helpers: G.atmos.debug.test('nuke'), G.atmos.debug.info()
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._,
    ATMOS = G.atmos,
    FX = G.fx;

  function ahead(dist, side, up) {
    const cam = G.camera;
    const f = new THREE.Vector3();
    cam.getWorldDirection(f);
    f.y = 0;
    f.normalize();
    const r = new THREE.Vector3(-f.z, 0, f.x);
    const p = cam.position
      .clone()
      .addScaledVector(f, dist)
      .addScaledVector(r, side || 0);
    p.y = A.groundAt(p.x, p.z, cam.position.y + 50) + (up || 0);
    return p;
  }
  function dummy(pos) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({
      color: 0x5a6a8a,
      roughness: 0.7,
    });
    const skin = new THREE.MeshStandardMaterial({
      color: 0xc89878,
      roughness: 0.8,
    });
    const add = (geo, mat, x, y, z) => {
      const o = new THREE.Mesh(geo, mat);
      o.position.set(x, y, z);
      o.castShadow = true;
      g.add(o);
    };
    add(new THREE.BoxGeometry(0.5, 0.7, 0.28), m, 0, 1.2, 0);
    add(new THREE.SphereGeometry(0.14, 12, 10), skin, 0, 1.72, 0);
    add(new THREE.BoxGeometry(0.16, 0.8, 0.16), m, -0.14, 0.42, 0);
    add(new THREE.BoxGeometry(0.16, 0.8, 0.16), m, 0.14, 0.42, 0);
    add(new THREE.BoxGeometry(0.12, 0.65, 0.12), m, -0.34, 1.2, 0);
    add(new THREE.BoxGeometry(0.12, 0.65, 0.12), m, 0.34, 1.2, 0);
    g.position.copy(pos);
    G.scene.add(g);
    return g;
  }

  function test(name, opts) {
    opts = opts || {};
    const d = opts.dist || 20;
    const up = new THREE.Vector3(0, 1, 0);
    switch (name) {
      case "explosion":
        FX.explosion(ahead(d, 0, 1), 5, "normal");
        break;
      case "car":
        FX.explosion(ahead(d, 0, 1), 6, "car");
        break;
      case "plasma":
        FX.explosion(ahead(d, 0, 1.2), 3, "plasma");
        break;
      case "electric":
        FX.explosion(ahead(d, 0, 1.2), 3, "electric");
        break;
      case "nuke":
        FX.explosion(ahead(Math.max(d, 120), 0, 1), 12, "nuke");
        break;
      case "fire":
        FX.fire(ahead(d * 0.5, -2), 1.2);
        FX.fire(ahead(d * 0.5, 3), 0.7);
        break;
      case "smoke":
        FX.smoke(ahead(d, 0, 0.5), 1.5);
        break;
      case "steam":
        FX.steam(ahead(d * 0.4, 0), 1);
        break;
      case "impacts": {
        const s = [
          "concrete",
          "metal",
          "wood",
          "dirt",
          "water",
          "glass",
          "flesh",
        ];
        s.forEach((k, i) =>
          FX.impact(
            ahead(d * 0.4, (i - 3) * 1.6, 0.8),
            new THREE.Vector3(0, 0.3, 1)
              .applyQuaternion(G.camera.quaternion)
              .normalize(),
            k,
          ),
        );
        break;
      }
      case "laser":
        FX.laserBeam(ahead(2, -1, 1.2), ahead(d * 2, 3, 1), "red");
        FX.laserBeam(ahead(2, 1, 1.4), ahead(d * 2, -4, 0.5), "blue");
        break;
      case "tracer":
        for (let i = 0; i < 6; i++)
          FX.tracer(ahead(1, 0.2, 1.3), ahead(d * 3, (i - 3) * 2, 1 + i * 0.3));
        break;
      case "blood":
        FX.blood(
          ahead(d * 0.3, -1, 1.2),
          new THREE.Vector3(0, 0.2, -1),
          2,
          "red",
        );
        FX.blood(
          ahead(d * 0.3, 1, 1.2),
          new THREE.Vector3(0.3, 0.3, -1),
          2,
          "green",
        );
        break;
      case "ash":
        FX.ash(dummy(ahead(d * 0.3, -0.8)));
        break;
      case "goo":
        FX.goo(dummy(ahead(d * 0.3, 0.8)));
        break;
      case "lightning":
        ATMOS.lightning(ahead(d * 4, 0));
        break;
      case "glows":
        for (let i = 0; i < 8; i++)
          FX.glowSprite(
            ahead(d * 0.5 + i * 4, i % 2 ? 4 : -4, 4.5),
            [0xffd8a0, 0x39ff5a, 0xff3a8a, 0x3aa0ff][i % 4],
            2.5,
          );
        break;
      case "decals":
        [
          "bullet",
          "scorch",
          "blood",
          "blood_green",
          "laser",
          "plasma",
          "goo",
          "oil",
          "crack",
          "rad_puddle",
        ].forEach((k, i) =>
          FX.decal(
            ahead(d * 0.25 + (i >> 1) * 1.5, i % 2 ? 1.2 : -1.2, 0.0),
            up,
            k,
          ),
        );
        break;
      case "muzzle":
        FX.muzzleFlash(
          ahead(3, 0.5, 1.3),
          new THREE.Vector3(0, 0, -1).applyQuaternion(G.camera.quaternion),
          "rifle",
        );
        break;
      case "muzzles": {
        // one of each family side by side (colour-speckle checks: ?fxtest=muzzles&fxfreeze=1)
        const kinds = ["pistol", "shotgun", "laser", "plasma", "minigun"];
        const fw = new THREE.Vector3(0, 0, -1).applyQuaternion(
          G.camera.quaternion,
        );
        const rt = new THREE.Vector3(1, 0, 0).applyQuaternion(
          G.camera.quaternion,
        );
        kinds.forEach((k, i) =>
          FX.muzzleFlash(
            ahead(Math.max(3, d * 0.2), (i - 2) * 0.9, 1.3),
            fw.clone().addScaledVector(rt, 0.9).normalize(),
            k,
          ),
        );
        break;
      }
      case "sparks":
        FX.sparks(ahead(d * 0.3, 0, 1), { count: 40 });
        break;
      case "reset":
        G.events.emit("reset");
        break;
      case "selftest":
        selftest();
        break;
      default:
        console.warn("[atmos debug] unknown test " + name);
    }
  }
  /**
   * Reset-safety self test: start lingering fires/smoke (car + nuke), a disintegration, then
   * run the atmosphere systems' reset path and check nothing survives / every promise settles.
   * Result lands in A.selftest (and in info()).
   */
  function selftest() {
    const res = (A.selftest = {
      ok: false,
      before: 0,
      after: 0,
      transientAfter: 0,
      ashSettled: false,
    });
    FX.explosion(ahead(30, 0, 1), 6, "car");
    FX.explosion(ahead(140, 0, 1), 12, "nuke");
    const job = FX.ash(dummy(ahead(6, 0)));
    if (job && job.done)
      job.done.then((v) => {
        res.ashSettled = true;
        res.ashValue = v === null ? "null" : "pile";
      });
    advance(0.5);
    res.before = A.emitters.length;
    A.flushTimersOnReset();
    for (const s of A.systems)
      if (s.reset && !s._dead) {
        try {
          s.reset();
        } catch (e) {
          G.reportError("atmos-selftest/" + s.name, e);
        }
      }
    res.after = A.emitters.length;
    res.transientAfter = A.emitters.filter((e) => e.transient).length;
    res.ok = res.transientAfter === 0 && res.before > res.after;
    Promise.resolve().then(() => {
      res.ok = res.ok && res.ashSettled;
    });
    return res;
  }
  function advance(sec) {
    // whole 1/30 s steps + the remainder (so a muzzle flash can be caught 12 ms into its 55 ms life)
    let left = Math.max(0, sec);
    while (left > 1e-4) {
      const st = Math.min(1 / 30, left);
      left -= st;
      A.animTime += st;
      for (const s of A.systems) {
        if (s._dead) continue;
        if (s.update) s.update(st, st, st);
      }
    }
  }
  function info() {
    const r = G.renderer;
    return {
      weather: ATMOS.getWeather(),
      hour: +G.time.hour.toFixed(2),
      grading: ATMOS.getGrading && ATMOS.getGrading(),
      post: ATMOS.isPostFX && ATMOS.isPostFX(),
      interior: ATMOS.interior,
      district: ATMOS.district,
      fx: FX.stats && FX.stats(),
      exposure: +r.toneMappingExposure.toFixed(2),
      fixtures: ATMOS.fixtureStats ? ATMOS.fixtureStats() : null,
      skyline: ATMOS.skylineStats ? ATMOS.skylineStats() : null,
      errs: (G.errors || [])
        .slice(0, 5)
        .map((e) => String(e && (e.message || e.msg || e)).slice(0, 160)),
      selftest: A.selftest || null,
      env: A.env
        ? {
            night: +A.env.night.toFixed(2),
            lightInt: +A.env.lightInt.toFixed(2),
            light: A.env.lightColor.getHexString(),
            lightDirY: +A.env.lightDir.y.toFixed(2),
            hemiInt: +A.env.hemiInt.toFixed(2),
            hemiSky: A.env.hemiSky.getHexString(),
            hemiGround: A.env.hemiGround.getHexString(),
            fogD: +A.env.fogDensity.toFixed(4),
          }
        : null,
      fog: A.env
        ? {
            H: +A.env.fogH.toFixed(1),
            haze: +A.env.fogHaze.toFixed(2),
            sky: A.env.fogSky.getHexString(),
            fog: A.env.fogColor.getHexString(),
            scatter: +A.env.scatter.toFixed(2),
            fillInt: +A.env.fillInt.toFixed(2),
          }
        : null,
      perf: ATMOS.perfStats ? ATMOS.perfStats() : null,
      fields: A.fields
        ? Object.keys(A.fields)
            .filter((k) => A.fields[k].mesh.visible)
            .map((k) => k + ":" + A.fields[k].amount.toFixed(2))
        : null,
      soft: A.softU ? A.softU.uSoftP.value.z : null,
      sheltered: A.weather ? [A.weather.sheltered, A.weather.roofH] : null,
      rainU:
        A.fields && A.fields.rain
          ? [
              A.fields.rain.u.uShelter.value.x,
              A.fields.rain.u.uShelter.value.y,
              A.fields.rain.u.uColor.value.w,
              A.fields.rain.u.uSize.value,
            ]
          : null,
      depthCopy: A.post ? !!A.post.depthValid : null,
      hemiLight: A.hemi
        ? {
            i: A.hemi.intensity,
            c: A.hemi.color.getHexString(),
            inScene: !!A.hemi.parent,
            visible: A.hemi.visible,
          }
        : null,
      calls: r.info.render.calls,
      tris: r.info.render.triangles,
      systems: A.systems.map(
        (s) =>
          s.name +
          (s._dead ? "(DEAD)" : "") +
          (s._initMs ? ":" + s._initMs + "ms" : ""),
      ),
    };
  }
  ATMOS.debug = {
    test,
    advance,
    info,
    ahead,
    selftest,
    perfProbe: (...a) => perfProbe(...a),
  };

  // URL-driven tests
  const q = G.QS;
  const list = q && q.get("fxtest") ? q.get("fxtest").split(",") : null;
  let fired = false;
  A.addSystem({
    name: "debug",
    order: 99,
    update() {
      if (!list || fired || G.state !== "play") return;
      if (G.time.frame < Number(q.get("fxframe") || 3)) return; // shots: &fxframe=40 spawns near the end of the 45 warm-up frames
      fired = true;
      const dist = Number(q.get("fxdist") || 20);
      G.camera.updateMatrixWorld();
      for (const t of list)
        try {
          test(t, { dist });
        } catch (e) {
          G.reportError("atmos-debug", e);
        }
      advance(Number(q.get("fxage") || 0.4));
      if (q.get("fxfreeze") === "1") A.fxFreeze = true;
    },
  });
  // ?perfprobe=1 (shots): after the shot frame, time full frames (world + post) with each post feature
  // switched off in turn. Synchronised with a 1-pixel readPixels, so it measures real GPU work.
  function perfProbe() {
    const r = G.renderer,
      gl = r.getContext(),
      px = new Uint8Array(4),
      P = A.post;
    if (!P || !P.enabled || !P.mats.comp) return { post: false };
    const u = P.mats.comp.uniforms;
    const sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const keep = {
      water: u.uWaterOn.value,
      pud: u.uPudOn.value,
      rays: P.raysOn,
      soft: A.softU.uSoftP.value.z,
    };
    const N = Number(q.get("perfn") || 8);
    const time = (set) => {
      set();
      G.render();
      G.render();
      sync();
      const t0 = performance.now();
      for (let i = 0; i < N; i++) G.render();
      sync();
      const ms = (performance.now() - t0) / N;
      return +ms.toFixed(2);
    };
    const res = {
      frames: N,
      calls: 0,
      water: !!keep.water,
      puddles: !!keep.pud,
      rays: !!keep.rays,
      scale: ATMOS.renderScale(),
    };
    res.all = time(() => {});
    res.calls = r.info.render.calls;
    res.noWaterSSR = time(() => {
      u.uWaterOn.value = 0;
    });
    res.noPuddleSSR = time(() => {
      u.uWaterOn.value = keep.water;
      u.uPudOn.value = 0;
    });
    res.noRays = time(() => {
      u.uPudOn.value = keep.pud;
      P.raysOn = false;
      u.uRayCol.value.setRGB(0, 0, 0);
    });
    res.noPost = time(() => {
      P.enabled = false;
    });
    P.enabled = true;
    P.raysOn = keep.rays;
    return res;
  }
  if (G.SHOT) {
    if (q && q.get("perfprobe"))
      G.events.on("initDone", () =>
        setTimeout(() => {
          let res;
          try {
            res = perfProbe();
          } catch (e) {
            res = { error: String(e && e.message) };
          }
          const pre = document.createElement("pre");
          pre.style.display = "none";
          pre.textContent =
            "ATMOS_PERF_BEGIN" + JSON.stringify(res) + "ATMOS_PERF_END";
          document.body.appendChild(pre);
        }, 0),
      );
    G.events.on("initDone", () =>
      setTimeout(() => {
        try {
          const pre = document.createElement("pre");
          pre.style.display = "none";
          pre.textContent =
            "ATMOS_DEBUG_BEGIN" + JSON.stringify(info()) + "ATMOS_DEBUG_END";
          document.body.appendChild(pre);
        } catch (e) {
          /* ignore */
        }
      }, 0),
    );
  }
})();
