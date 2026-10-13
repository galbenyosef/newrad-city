// play-inline-49 03 — env
// Lines 333-508 of readable/play-inline-49.pretty.js (statement-aligned).
  function init() {
    shoreTex = bakeShore();
    const U = A.fogUniforms({
      uNoise: { value: A.noiseTex },
      uShore: { value: shoreTex },
      uShoreRect: { value: new THREE.Vector4(0, 0, 1, 1) },
      uTime: { value: 0 },
      uNight: { value: 0 },
      uGlow: { value: 1 },
      uRain: { value: 0 },
      uFlash: { value: 0 },
      uFoamAmt: { value: 1 },
      uChop: { value: 1 },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color() },
      uZenith: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uFogTop: { value: new THREE.Color() },
      uDeep: { value: new THREE.Color("#1d2419") },
      uShallow: { value: new THREE.Color("#3e4228") },
      uFoamColor: { value: new THREE.Color("#7e7b68") },
      uAmbient: { value: new THREE.Color() },
      uSunLight: { value: new THREE.Color() },
      uFlashColor: { value: new THREE.Color() },
      uWind: { value: new THREE.Vector2(0.3, 0.1) },
      uCloudLit: { value: new THREE.Color() },
      uCloudShade: { value: new THREE.Color() },
      uSSS: { value: new THREE.Color() },
      uPostA: { value: 0 },
    });
    if (A.shore)
      U.uShoreRect.value.set(
        A.shore.minX,
        A.shore.minZ,
        1 / A.shore.sizeX,
        1 / A.shore.sizeZ,
      );
    mat = new THREE.ShaderMaterial({
      uniforms: U,
      vertexShader: VERT,
      fragmentShader: FRAG,
      fog: true,
      defines: { NRC_WRITE_ALPHA: 1 },
    }); // writes the reflectivity tag
    mat.name = "atmos_water";
    mat.userData.shared = true;
    const y =
      G.world && G.world.waterLevel !== undefined ? G.world.waterLevel : -1.2;
    const L = G.LAYOUT;
    const xMax = L ? L.INTERIOR_X_MIN - 150 : 2350;
    const x0 = -3400,
      x1 = xMax,
      z0 = -3400,
      z1 = 3400;
    const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, 48, 48);
    geo.rotateX(-Math.PI / 2);
    geo.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
    water = new THREE.Mesh(geo, mat);
    water.name = "atmos_water";
    water.frustumCulled = false;
    water.receiveShadow = false;
    water.castShadow = false;
    water.renderOrder = 10; // after other opaques → early-z skips water hidden under the land plates
    G.scene.add(water);
    A.water = water;
    A.waterMat = mat;
    ATMOS.waterMaterial = mat;
    ATMOS.waterMesh = water;
  }

  /**
   * Create an extra water surface (pond/lake/reservoir/flooded area) sharing the water look.
   * spec: {x0,x1,z0,z1,y} rectangle, or {geometry, y?}. opts: {murk:0..1, glow:0..1}
   * Returns the Mesh (caller adds it to its own group or it is added to G.scene when opts.add !== false).
   */
  ATMOS.createWaterMesh = function (spec, opts) {
    opts = opts || {};
    if (!mat) return null;
    let m2 = extraMats[0];
    if (!m2) {
      m2 = new THREE.ShaderMaterial({
        uniforms: mat.uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        fog: true,
        defines: { NO_SHORE: 1, NRC_WRITE_ALPHA: 1 },
      });
      m2.name = "atmos_water_pond";
      m2.userData.shared = true;
      extraMats.push(m2);
    }
    let geo;
    if (spec && spec.geometry) geo = spec.geometry;
    else {
      const x0 = spec.x0,
        x1 = spec.x1,
        z0 = spec.z0,
        z1 = spec.z1;
      geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, 4, 4);
      geo.rotateX(-Math.PI / 2);
      geo.translate(
        (x0 + x1) / 2,
        spec.y !== undefined ? spec.y : -0.6,
        (z0 + z1) / 2,
      );
    }
    const mesh = new THREE.Mesh(geo, m2);
    mesh.name = "atmos_pond";
    if (opts.add !== false) G.scene.add(mesh);
    return mesh;
  };

  const _wl = new THREE.Color(),
    _ws = new THREE.Color();
  function cloudAvg() {
    const D = A.cloudDeck;
    return D ? 1 - D.shadow * 0.3 : 1;
  }
  function update(dt, realDt, animDt) {
    if (!water) return;
    const env = A.env,
      u = mat.uniforms,
      W = A.weather ? A.weather.cur : null;
    water.visible = !env.interior;
    if (env.interior) return;
    u.uPostA.value = A.post && A.post.enabled && A.post.waterRefl ? 1 : 0;
    u.uTime.value = A.animTime;
    u.uNight.value = env.night;
    u.uSunDir.value.copy(env.night > 0.5 ? env.moonDir : env.sunDir);
    const sunVis =
      env.night > 0.5
        ? 0.35 * A.smooth(0.02, 0.2, env.moonDir.y)
        : env.sunSize * A.smooth(-0.02, 0.1, env.sunY);
    u.uSunColor.value
      .copy(env.lightColor)
      .multiplyScalar(
        Math.min(1.6, env.lightInt) *
          sunVis *
          (W ? 0.2 + 0.8 * (1 - W.cloud * W.cloudDark) : 1),
      );
    u.uZenith.value.copy(env.zenith);
    u.uHorizon.value.copy(env.horizon);
    u.uFogTop.value.copy(env.fogColor);
    u.uAmbient.value.copy(env.hemiSky).multiplyScalar(env.hemiInt * 0.55);
    u.uSunLight.value.copy(env.lightColor).multiplyScalar(env.lightInt * 0.3);
    u.uCloudLit.value.copy(env.cloudLit);
    u.uCloudShade.value.copy(env.cloudShade);
    u.uSSS.value
      .setRGB(0.42, 0.52, 0.2)
      .multiply(env.lightColor)
      .multiplyScalar(Math.min(1.5, env.lightInt) * 0.22 * (1 - env.night));
    // colour the water converges to near the far clip (grazing Fresnel ≈ 0.71, far roughness mix 0.35,
    // murk averages out) — the sky dome continues the sea with it below the horizon (12_sky.js)
    const wf = A.waterFar || (A.waterFar = new THREE.Color());
    const _l = _wl
      .copy(u.uSunLight.value)
      .multiplyScalar(Math.max(0, u.uSunDir.value.y) * 0.35 * cloudAvg());
    _l.r += u.uAmbient.value.r * 0.9;
    _l.g += u.uAmbient.value.g * 0.9;
    _l.b += u.uAmbient.value.b * 0.9;
    _l.multiply(u.uDeep.value);
    const _s = _ws
      .copy(env.horizon)
      .lerp(env.zenith, 0.15)
      .lerp(env.fogColor, 0.35);
    wf.copy(_l).lerp(_s, 0.71).lerp(_l.multiplyScalar(0.9), 0.35);
    if (W) {
      u.uRain.value = W.rain;
      u.uFlash.value = env.flash;
      u.uFlashColor.value.copy(W.flashColor);
      u.uChop.value = 0.7 + Math.min(1.5, W.wind / 8);
      u.uWind.value.set(W.windX * 0.05, W.windZ * 0.05);
    }
  }

  A.addSystem({ name: "water", order: 40, init, update });
