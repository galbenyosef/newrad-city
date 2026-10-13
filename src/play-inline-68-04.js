// play-inline-68 04 — vel
// Lines 586-725 of readable/play-inline-68.pretty.js (statement-aligned).
  function update(dt, realDt, animDt) {
    const env = A.env,
      W = A.weather ? A.weather.cur : null;
    const inter = env.interior;
    // lighting factor for alpha fields
    _light.copy(env.hemiSky).multiplyScalar(env.hemiInt * 0.7);
    _light.r += env.lightColor.r * env.lightInt * 0.25;
    _light.g += env.lightColor.g * env.lightInt * 0.25;
    _light.b += env.lightColor.b * env.lightInt * 0.25;
    const sheltered = !!(A.weather && A.weather.sheltered);
    // dry zone around the player while under a roof (smoothly faded, radius from the roof height)
    shelterK = A.damp(
      shelterK,
      sheltered && !inter ? 1 : 0,
      4,
      realDt || 0.016,
    );
    if (sheltered) shelterR = A.clamp(3 + (A.weather.roofH || 4) * 0.6, 3.5, 9);
    for (const k of [
      "rain",
      "rainnear",
      "ash",
      "rad",
      "radveil",
      "dust",
      "duststreak",
    ])
      if (fields[k])
        fields[k].u.uShelter.value.set(
          k === "dust" ? shelterR * 0.6 : shelterR,
          shelterK * (k === "dust" ? 0.7 : 1),
        );
    // motes: always (subtle), more indoors (bunker dust in the light)
    _vel.set(ATMOS.wind.x * 0.08, 0.02, ATMOS.wind.z * 0.08);
    const moteI = inter ? 0.9 : 0.35 + 0.35 * (1 - env.night);
    setField(
      fields.motes,
      inter ? 0.8 : 0.55,
      _vel,
      0xfff4d8,
      0.35 * moteI,
      null,
    );
    // ash: outdoors, district-dependent, heavier in dust storms
    const dist = ATMOS.district;
    const ashBase =
      dist === "financial_district" || dist === "brooklyn"
        ? 0.5
        : dist === "central_park"
          ? 0.15
          : 0.3;
    _vel.set(ATMOS.wind.x * 0.35, -0.45, ATMOS.wind.z * 0.35);
    setField(
      fields.ash,
      inter ? 0 : Math.min(1, ashBase + (W ? W.dust * 0.4 + W.rad * 0.3 : 0)),
      _vel,
      0x6a665e,
      0.75,
      _light,
    );
    // rain
    const rain = !inter && W ? W.rain : 0;
    _vel.set(W ? W.windX * 0.5 : 0, -15, W ? W.windZ * 0.5 : 0);
    // streaks catch the light: a brightness floor (lamps, neon, the grey sky behind them) so rain reads at night too
    _rainL.copy(_light).multiplyScalar(1.15);
    _rainL.r += 0.07;
    _rainL.g += 0.075;
    _rainL.b += 0.085;
    if (rain > 0.003) updatePoolUniforms();
    setField(fields.rain, rain, _vel, 0xc4ced2, 0.3, _rainL);
    setField(fields.rainnear, rain, _vel, 0xd4dce0, 0.22, _rainL);
    // dust storm sheets
    const dust = !inter && W ? W.dust : 0;
    _vel.set(W ? W.windX * 1.4 : 0, 0.3, W ? W.windZ * 1.4 : 0);
    setField(fields.dust, dust, _vel, 0xa8906a, 0.2, _light);
    _vel.set(W ? W.windX * 1.9 : 0, -0.25, W ? W.windZ * 1.9 : 0);
    setField(fields.duststreak, dust, _vel, 0xc0a47c, 0.13, _light);
    // rad-weather specks
    const rad = !inter && W ? W.rad : 0;
    _vel.set(W ? W.windX * 0.4 : 0, -0.8, W ? W.windZ * 0.4 : 0);
    _vel.set(W ? W.windX * 0.8 : 0, -0.6, W ? W.windZ * 0.8 : 0);
    setField(
      fields.rad,
      rad,
      _vel,
      0x7aff4a,
      1.1 * (0.6 + 0.4 * Math.sin(A.animTime * 1.7)),
      null,
    );
    _vel.set(W ? W.windX * 1.2 : 0, 0.2, W ? W.windZ * 1.2 : 0);
    _radL.copy(_light).multiplyScalar(1.3);
    _radL.g *= 1.25;
    setField(fields.radveil, rad, _vel, 0x78a846, 0.16, _radL);
    // rain splashes near the player
    if (rain > 0.05 && animDt > 0 && A.psAlpha) {
      splashAcc += animDt * 150 * rain;
      while (splashAcc >= 1) {
        splashAcc -= 1;
        const a = Math.random() * Math.PI * 2,
          r = Math.sqrt(Math.random()) * 14;
        if (shelterK > 0.5 && r < shelterR + 1) continue; // dry under the roof
        const x = A.camPos.x + Math.cos(a) * r,
          z = A.camPos.z + Math.sin(a) * r;
        const y = A.groundAt(x, z, A.camPos.y + 1);
        if (y < A.camPos.y - 6) continue;
        A.psAlpha.spawn({
          x,
          y: y + 0.03,
          z,
          size: 0.05,
          size1: rr(0.2, 0.35),
          life: 0.28,
          color: 0xc8d0d4,
          alpha: 0.5,
          frame: FR.SPLASH,
          rot: 0,
          fadeIn: 0.02,
          lit: 1,
        });
      }
    }
    // plumes
    if (plumes) {
      plumes.visible = !inter;
      const u = plumes.material.uniforms;
      u.uCam.value.copy(A.camPos);
      u.uTime.value = A.animTime;
      u.uWind.value.set(ATMOS.wind.x, ATMOS.wind.z);
      u.uLight.value.copy(_light);
      u.uGlowCol.value
        .setRGB(3, 1.1, 0.3)
        .multiplyScalar(0.3 + 0.9 * env.night);
    }
  }

  function reset() {
    /* ambient emitters are permanent world features */
  }

  A.addSystem({ name: "ambient", order: 70, init, update, reset });
