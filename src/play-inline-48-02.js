// play-inline-48 02 — env
// Lines 19-369 of readable/play-inline-48.pretty.js (statement-aligned).
  const A = G.atmos._,
    ATMOS = G.atmos;

  let sun = null,
    hemi = null,
    fog = null,
    fill = null;
  // shadow map size / half-extent follow the quality setting AND the live perf tier (40_postfx.js)
  const SH = { extent: 75, size: 2048, dist: 420, tier: -1 };
  const SH_TIERS = [
    { size: 2048, extent: 75 },
    { size: 2048, extent: 60 },
    { size: 1024, extent: 45 },
  ]; // 150 m → 90 m frustum
  const _lin = new THREE.Color();
  const _c = new THREE.Vector3(),
    _f = new THREE.Vector3(),
    _r = new THREE.Vector3(),
    _u = new THREE.Vector3();
  const _fwd = new THREE.Vector3(),
    _q = new THREE.Quaternion();
  const qDir = new THREE.Vector3(); // quantised shadow/light direction (see placeShadow)
  let viewShadow = 1,
    viewShadowTarget = 1,
    probeT = 0,
    viewSky = 1;
  let exposure = 1;
  let adapt = 0;
  let shadowRefresh = 2; // frames of shadow-map refresh left after entering an interior // eye adaptation boost when stepping from darkness into daylight (the cryo-exit glare)

  function init() {
    const B = G.baseLights || {};
    sun = B.sun;
    if (!sun) {
      sun = new THREE.DirectionalLight(0xfff1d0, 2);
      G.scene.add(sun);
    }
    hemi = B.hemi;
    if (!hemi) {
      hemi = new THREE.HemisphereLight(0xcfd6b8, 0x4a4032, 0.9);
      G.scene.add(hemi);
    }
    if (!sun.target.parent) G.scene.add(sun.target);
    // ambient-bounce fill: shadowless, created before any material compiles (light count never changes later)
    fill = new THREE.DirectionalLight(0xc9b99a, 0);
    fill.name = "atmos_fill";
    fill.castShadow = false;
    G.scene.add(fill);
    G.scene.add(fill.target);
    A.fill = fill;
    const t = SH_TIERS[shadowTierFor()];
    SH.size = t.size;
    SH.extent = t.extent;
    SH.tier = shadowTierFor();
    sun.castShadow = true;
    sun.shadow.mapSize.set(SH.size, SH.size);
    const cam = sun.shadow.camera;
    cam.left = -SH.extent;
    cam.right = SH.extent;
    cam.top = SH.extent;
    cam.bottom = -SH.extent;
    cam.near = 1;
    cam.far = SH.dist + 380;
    cam.updateProjectionMatrix();
    sun.shadow.bias = -0.00035;
    sun.shadow.normalBias = 0.045;
    if ("radius" in sun.shadow) sun.shadow.radius = 2;
    sun.name = "atmos_sun";
    hemi.name = "atmos_hemi";
    // Exponential fog (replacing core's linear fog before other modules compile materials)
    fog = new THREE.FogExp2(0x8a8f78, 0.0017);
    G.scene.fog = fog;
    A.sun = sun;
    A.hemi = hemi;
    A.fog = fog;
    ATMOS.sun = sun;
    ATMOS.hemi = hemi;
    apply(0, true);
    G.events.on("atmosInterior", (inside) => {
      if (
        !inside &&
        !G.SHOT &&
        !G.SMOKE &&
        G.state !== "title" &&
        A.env &&
        A.env.night < 0.5
      )
        adapt = 1; // blinding daylight after the dark
      else if (inside) adapt = 0;
    });
    G.events.on("reset", () => {
      adapt = 0;
    });
  }

  function placeShadow() {
    const env = A.env;
    const d = env.lightDir;
    if (env.interior) {
      // aim overhead, park shadow frustum 5 km below (everything indoors is outside it → unshadowed)
      _c.copy(A.camPos);
      _c.y -= 5000;
      sun.target.position.copy(_c);
      sun.position.copy(_c).addScaledVector(d, SH.dist);
      // Indoors the (empty) shadow map only has to be refreshed ONCE after the
      // transition (clears the outdoor shadows); afterwards the shadow pass is
      // skipped entirely → no wasted depth render of the interior every frame.
      // castShadow itself stays on (toggling it would recompile every lit material).
      const sm = G.renderer.shadowMap;
      sm.autoUpdate = false;
      if (shadowRefresh > 0) {
        sm.needsUpdate = true;
        shadowRefresh--;
      }
      return;
    }
    shadowRefresh = 2;
    G.renderer.shadowMap.autoUpdate = true;
    // centre shadow box a little ahead of the camera (more useful texels in view)
    G.camera.getWorldDirection(_fwd);
    _fwd.y = 0;
    if (_fwd.lengthSq() > 1e-6) _fwd.normalize();
    _c.copy(A.camPos).addScaledVector(_fwd, SH.extent * 0.45);
    _c.y = Math.max(0, Math.min(A.camPos.y, 60)) * 0.5;
    // light-space basis for texel snapping (kills shimmering when moving). The direction itself is
    // QUANTISED (only follows the sun once it moved > ~0.12°, like render_lighting's near cascade): a
    // continuously turning light direction re-rasterises every shadow edge each frame → slow crawl.
    if (qDir.lengthSq() < 0.5 || qDir.dot(d) < 0.9999978) qDir.copy(d);
    _f.copy(qDir);
    _r.set(0, 1, 0).cross(_f);
    if (_r.lengthSq() < 1e-6) _r.set(1, 0, 0);
    _r.normalize();
    _u.crossVectors(_f, _r).normalize();
    const texel = (SH.extent * 2) / SH.size;
    const cx = Math.round(_c.dot(_r) / texel) * texel;
    const cy = Math.round(_c.dot(_u) / texel) * texel;
    const cz = _c.dot(_f);
    _c.set(0, 0, 0)
      .addScaledVector(_r, cx)
      .addScaledVector(_u, cy)
      .addScaledVector(_f, cz);
    sun.target.position.copy(_c);
    sun.position.copy(_c).addScaledVector(_f, SH.dist);
  }

  function shadowTierFor() {
    const q = A.quality === "low" ? 2 : A.quality === "medium" ? 1 : 0;
    return Math.max(q, ATMOS.perfTier | 0);
  }
  function applyShadowTier(tier) {
    if (tier === SH.tier || !sun) return;
    SH.tier = tier;
    const t = SH_TIERS[tier];
    const cam = sun.shadow.camera;
    SH.extent = t.extent;
    cam.left = -t.extent;
    cam.right = t.extent;
    cam.top = t.extent;
    cam.bottom = -t.extent;
    cam.updateProjectionMatrix();
    if (t.size !== SH.size) {
      SH.size = t.size;
      sun.shadow.mapSize.set(t.size, t.size);
      // the map is re-allocated on the next shadow pass (shadowMapSize is a uniform → no recompiles)
      if (sun.shadow.map) {
        sun.shadow.map.dispose();
        sun.shadow.map = null;
      }
    }
  }
  A.applyShadowTier = () => applyShadowTier(shadowTierFor());

  // colours for the fog chunk: linear when rendering into the HDR target, output space when
  // three renders straight to the canvas (plain mode applies fog after the colour-space encode)
  function fogCol(dst, c, encode) {
    if (encode) {
      c.getRGB(_lin, THREE.SRGBColorSpace);
      dst.x = _lin.r;
      dst.y = _lin.g;
      dst.z = _lin.b;
    } else {
      dst.x = c.r;
      dst.y = c.g;
      dst.z = c.b;
    }
  }
  function applyFog(env) {
    const F = A.fogShared;
    if (!F) return;
    const P = F.nrcFogP.value,
      X = F.nrcFogX.value,
      S = F.nrcFogSun.value;
    const hdr = !!(A.post && A.post.enabled);
    if (env.interior) {
      P.w = 0;
      X.x = 0;
      S.w = 0;
      return;
    }
    P.x = 1 / Math.max(5, env.fogH);
    P.y = env.fogBase;
    P.z = env.fogHaze;
    P.w = 1;
    // bright sources punch through the night haze (HDR only: plain mode is already tone mapped)
    X.x = hdr ? 0.35 + 0.85 * env.night : 0;
    X.y = env.fogMax;
    X.z = env.aerial;
    fogCol(F.nrcFogSky.value, env.fogSky, !hdr);
    S.x = env.scatterDir.x;
    S.y = env.scatterDir.y;
    S.z = env.scatterDir.z;
    S.w = env.scatter;
    // scatter colour is relative to the fog brightness so it never turns into a hot spot at night
    const fl = Math.max(
      0.02,
      env.fogColor.r * 0.3 + env.fogColor.g * 0.5 + env.fogColor.b * 0.2,
    );
    _lin.copy(env.scatterColor).multiplyScalar(fl * 1.6);
    fogCol(F.nrcFogSunC.value, _lin, !hdr);
    // the sky shader always works in linear space
    if (A.skyFog) {
      const k = env.fogSky;
      A.skyFog.sky.x = k.r;
      A.skyFog.sky.y = k.g;
      A.skyFog.sky.z = k.b;
      A.skyFog.sunC.x = _lin.r;
      A.skyFog.sunC.y = _lin.g;
      A.skyFog.sunC.z = _lin.b;
    }
  }

  function apply(realDt, snap) {
    const env = A.env;
    if (fill) {
      fill.color.copy(env.fillColor);
      fill.intensity = env.fillInt;
      fill.position.copy(A.camPos).addScaledVector(env.fillDir, 100);
      fill.target.position.copy(A.camPos);
    }
    applyFog(env);
    applyShadowTier(shadowTierFor());
    sun.color.copy(env.lightColor);
    sun.intensity = env.lightInt;
    hemi.color.copy(env.hemiSky);
    hemi.groundColor.copy(env.hemiGround);
    hemi.intensity = env.hemiInt;
    fog.color.copy(env.fogColor);
    fog.density = env.fogDensity;
    const tgt = env.exposure;
    exposure = snap || !realDt ? tgt : A.damp(exposure, tgt, 1.5, realDt);
    if (adapt > 0 && realDt) adapt = Math.max(0, adapt - realDt * 0.45);
    G.renderer.toneMappingExposure = exposure * (1 + adapt * adapt * 2.2);
    A.exposure = exposure;
  }

  function update(dt, realDt) {
    apply(realDt, A.envSnap);
  }

  function late(dt, realDt) {
    if (!sun) return;
    placeShadow();
    // --- viewmodel lights (view camera space)
    const VL = G.viewLights;
    const env = A.env;
    if (VL) {
      // shadow probe: is the player's eye in the sun's shadow?
      probeT -= realDt;
      if (probeT <= 0) {
        probeT = 0.2;
        viewShadowTarget = 1;
        if (!env.interior && G.world && G.world.raycast) {
          try {
            const hit = G.world.raycast(A.camPos, env.lightDir, 220, {
              ignoreTags: ["actor", "interactable_self"],
            });
            if (hit) viewShadowTarget = 0.25;
          } catch (e) {
            /* ignore */
          }
        }
      }
      // moving cloud shadows reach the viewmodel too (same field as the world, CPU twin)
      const cs =
        !env.interior && A.cloudShadowAt
          ? A.cloudShadowAt(A.camPos.x, A.camPos.y, A.camPos.z)
          : 1;
      viewShadow = A.damp(
        viewShadow,
        viewShadowTarget * cs,
        5,
        realDt || 0.016,
      );
      if (VL.amb) {
        if (VL.amb.isHemisphereLight) {
          VL.amb.color.copy(env.hemiSky);
          VL.amb.groundColor.copy(env.hemiGround);
        } else VL.amb.color.copy(env.hemiSky);
        // indoors the world gets most of its light from local fixtures the viewmodel doesn't see,
        // so a full-strength hemisphere would make the hands glow against the dim room
        // outdoors: in a narrow street canyon the world's sky term is darkened by render_lighting's probes —
        // the hands follow the same sky visibility (they used to glow at full sky light in dark alleys)
        let sv = 1;
        if (
          !env.interior &&
          G.rlight &&
          G.rlight.skyVisibility &&
          !G.isStub("rlight")
        ) {
          try {
            sv = G.rlight.skyVisibility(
              A.camPos.x,
              A.camPos.y - 0.4,
              A.camPos.z,
              0.4,
            );
          } catch (e) {
            sv = 1;
          }
          if (!(sv >= 0 && sv <= 1.5)) sv = 1;
        }
        viewSky = A.damp(viewSky, sv, 3, realDt || 0.016);
        VL.amb.intensity =
          env.hemiInt * (env.interior ? 0.62 : 0.35 + 0.65 * viewSky) + 0.06;
      }
      if (VL.dir) {
        VL.dir.color.copy(env.lightColor);
        VL.dir.intensity =
          env.lightInt * (env.interior ? 0.45 : 0.75) * viewShadow;
        // world light dir → camera local space
        _q.copy(G.camera.quaternion).invert();
        const ld = A.tmpV.copy(env.lightDir).applyQuaternion(_q);
        VL.dir.position.copy(ld).multiplyScalar(5);
        if (VL.dir.target && VL.dir.target.position)
          VL.dir.target.position.set(0, 0, 0);
      }
    }
  }

  /** Re-derive the shadow map size/extent from the quality ('low'|'medium'|'high') and the live perf tier. */
  ATMOS.setShadowQuality = function (q) {
    if (q && ["low", "medium", "high"].indexOf(q) >= 0 && q !== A.quality)
      A.quality = ATMOS.quality = q;
    applyShadowTier(shadowTierFor());
  };
  ATMOS.shadowInfo = () => ({
    size: SH.size,
    extent: SH.extent,
    tier: SH.tier,
  });

