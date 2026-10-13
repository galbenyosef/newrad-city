// play-inline-47 03 — env
// Lines 348-530 of readable/play-inline-47.pretty.js (statement-aligned).
  function init() {
    // height-fog parameters shared with every world material; the two colours get linear-space
    // copies (the sky encodes itself, while built-ins in plain mode fog after the encode)
    const shared = {};
    for (const k in A.fogShared) shared[k] = { value: A.fogShared[k].value };
    A.skyFog = { sky: { x: 0, y: 0, z: 0 }, sunC: { x: 0, y: 0, z: 0 } };
    shared.nrcFogSky = { value: A.skyFog.sky };
    shared.nrcFogSunC = { value: A.skyFog.sunC };
    mat = new THREE.ShaderMaterial({
      uniforms: {
        uNoise: { value: A.noiseTex },
        uZenith: { value: new THREE.Color() },
        uHorizon: { value: new THREE.Color() },
        uFog: { value: new THREE.Color() },
        uGlow: { value: new THREE.Color() },
        uSunDir: { value: new THREE.Vector3(0, 1, 0) },
        uSunColor: { value: new THREE.Color() },
        uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
        uSunSize: { value: 1 },
        uStars: { value: 0 },
        uTime: { value: 0 },
        uNight: { value: 0 },
        uCloud: { value: 0.3 },
        uCloudDark: { value: 0 },
        uCloudLit: { value: new THREE.Color() },
        uCloudShade: { value: new THREE.Color() },
        uWind: { value: new THREE.Vector2(0.002, 0.001) },
        uFlash: { value: 0 },
        uFlashColor: { value: new THREE.Color(0x9aff9a) },
        uRad: { value: 0 },
        uDust: { value: 0 },
        uHFlash: { value: new THREE.Vector4(1, 0, 0, 0) },
        uFogBlend: { value: 1 },
        uFogDensity: { value: 0.0016 },
        uCamY: { value: 2 },
        uFogFar: { value: 2000 },
        uSkyAlpha: { value: 1 },
        uDeck: { value: new THREE.Vector4(520, 1, 0, 1) },
        uLightDir: { value: new THREE.Vector3(0, 1, 0) },
        uLightCol: { value: new THREE.Color() },
        uMoonPhase: { value: 0.4 },
        uTwi: { value: 0 },
        uWaterFar: { value: new THREE.Vector3(-1, 0, 0) },
        uNeonP: { value: new THREE.Vector4(-40, 90, -262, 8) },
        uNeonC: { value: new THREE.Color(0, 0, 0) },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      fog: false,
      defines: { NRC_WRITE_ALPHA: 1 }, // writes the sky mask (alpha 0) into the HDR target
    });
    Object.assign(mat.uniforms, shared);
    sky = new THREE.Mesh(new THREE.SphereGeometry(2400, 48, 24), mat);
    sky.name = "atmos_sky";
    sky.renderOrder = 9; // after the opaque world (early-z: sky shader only runs where nothing covers it)
    sky.frustumCulled = false;
    sky.matrixAutoUpdate = true;
    G.scene.add(sky);
    A.sky = sky;
    A.skyMat = mat;
    G.scene.background = new THREE.Color(0x8a8f78);
  }

  function update(dt, realDt, animDt) {
    const env = A.env,
      u = mat.uniforms,
      W = A.weather ? A.weather.cur : null;
    sky.visible = !env.interior;
    G.scene.background.copy(env.fogColor);
    updateDeck(env, W, animDt);
    if (env.interior) return;
    u.uSkyAlpha.value = A.post && A.post.enabled ? 0 : 1;
    u.uZenith.value.copy(env.zenith);
    u.uHorizon.value.copy(env.horizon);
    u.uFog.value.copy(env.fogColor);
    u.uGlow.value.copy(env.glow);
    u.uFogDensity.value = env.fogDensity;
    u.uCamY.value = A.camPos.y;
    u.uFogFar.value = env.fogFar || 2000;
    u.uSunDir.value.copy(env.sunDir);
    u.uMoonDir.value.copy(env.moonDir);
    // HDR sun colour: brighter at day, tinted at dusk
    u.uSunColor.value
      .copy(env.lightColor)
      .multiplyScalar(0.55 + 0.45 * Math.min(1, env.lightInt / 2.5));
    u.uSunSize.value = env.sunSize * A.smooth(-0.06, 0.02, env.sunY);
    u.uStars.value = env.stars;
    u.uNight.value = env.night;
    u.uTime.value = A.animTime;
    u.uCloudLit.value.copy(env.cloudLit);
    u.uCloudShade.value.copy(env.cloudShade);
    // cloud key light: the sun, or the moon at night (silver-edged moonlit cumulus); dips at the handover
    const dayW = A.smooth(-0.05, 0.05, env.sunY);
    u.uLightDir.value.copy(dayW > 0.5 ? env.sunDir : env.moonDir);
    if (u.uLightDir.value.y < 0.02) {
      u.uLightDir.value.y = 0.02;
      u.uLightDir.value.normalize();
    }
    const lk =
      dayW > 0.5
        ? 0.62 * Math.min(1.2, env.lightInt / 2.4 + 0.25)
        : 0.3 * Math.min(1, env.lightInt);
    u.uLightCol.value
      .copy(env.lightColor)
      .multiplyScalar(lk * (W ? 1 - 0.6 * W.cloud * W.cloudDark : 1));
    u.uDeck.value.set(DECK.thick, 1, 0, 1);
    if (A.waterFar && A.water && A.water.visible !== false)
      u.uWaterFar.value.set(A.waterFar.r, A.waterFar.g, A.waterFar.b);
    else u.uWaterFar.value.set(-1, 0, 0);
    // lunar month of 29.5 game days, kept between a fat crescent and full so moonlit nights stay bright
    const lun = (((env.day || 1) + env.hour / 24) / 29.53) % 1;
    u.uMoonPhase.value = 0.5 + 0.3 * Math.sin(lun * Math.PI * 2);
    u.uTwi.value =
      A.smooth(-0.2, -0.04, env.sunY) *
      (1 - A.smooth(0.03, 0.13, env.sunY)) *
      (W ? 1 - 0.8 * W.cloud * W.cloudDark : 1);
    if (W) {
      u.uCloud.value = W.cloud;
      u.uCloudDark.value = W.cloudDark;
      u.uRad.value = W.rad;
      u.uDust.value = W.dust;
      u.uFlash.value = env.flash;
      u.uFlashColor.value.copy(W.flashColor);
      u.uWind.value.set(W.windX * 0.0009, W.windZ * 0.0009);
    }
    // The Neon's sky-glow (night only; fades with the haze when very far away; overhead when inside it)
    {
      const L = G.LAYOUT,
        site = L && L.getSite ? L.getSite("times_square") : null;
      const cx = site ? (site.x0 + site.x1) / 2 : -40,
        cz = site ? (site.z0 + site.z1) / 2 : -262;
      const dx = cx - A.camPos.x,
        dz = cz - A.camPos.z,
        dist = Math.hypot(dx, dz);
      const nk =
        A.smooth(0.35, 0.85, env.night) *
        (1 - A.smooth(900, 2600, dist)) *
        (W ? 1 - 0.5 * W.dust : 1);
      u.uNeonP.value.set(
        cx,
        70 + Math.min(80, dist * 0.08),
        cz,
        A.lerp(3, 26, A.smooth(60, 1400, dist)),
      );
      u.uNeonC.value
        .setRGB(0.16, 0.065, 0.1)
        .multiplyScalar(nk * (W ? 1 + 0.6 * W.cloud : 1));
    }
    // occasional distant flashes on the horizon at night (far-off battles)
    hflash.next -= animDt;
    if (hflash.next <= 0) {
      hflash.next = A.rr(6, 22);
      if (env.night > 0.5 && Math.random() < 0.6) {
        const a = Math.random() * Math.PI * 2;
        hflash.dir.set(Math.cos(a), 0.02, Math.sin(a));
        hflash.t = 0;
        hflash.int = A.rr(0.3, 0.9);
        hflash.pulses = 1 + ((Math.random() * 3) | 0);
      }
    }
    if (hflash.int > 0) {
      hflash.t += animDt;
      const p = hflash.pulses || 1;
      const ph = hflash.t * 6;
      const k = ph < p ? Math.max(0, Math.sin(ph * Math.PI)) : 0;
      u.uHFlash.value.set(
        hflash.dir.x,
        hflash.dir.y,
        hflash.dir.z,
        k * hflash.int * env.night,
      );
      if (ph > p) hflash.int = 0;
    } else u.uHFlash.value.w = 0;
  }

  function late() {
    if (sky && G.camera) sky.position.copy(G.camera.position);
  }

  A.addSystem({ name: "sky", order: 20, init, update, late });
