// play-inline-51 10 — env
// Lines 2293-2683 of readable/play-inline-51.pretty.js (statement-aligned).
  function update(dt, realDt) {
    if (!P.enabled || !P.mats.comp) {
      // core may have dropped our hook after an exception → stay in plain mode
      return;
    }
    if (G.renderHook !== hook) {
      P.enabled = false;
      P.failed = true;
      return;
    }
    const u = P.mats.comp.uniforms,
      env = A.env,
      pl = G.player,
      st = G.state;
    const rd = realDt || 0.016;
    P.rdLast = rd;
    // effective post level: the chosen quality, capped by the live perf tier (tier 1 → medium, tier 2 → low)
    const lvl = Math.min(
      P.postQ,
      P.dyn.dynTier >= 2 ? 0 : P.dyn.dynTier === 1 ? 1 : 3,
    );
    P.level = lvl;
    const QS_ = QSET[lvl],
      F = P.feat;
    F.bloomLv = QS_.bloomLv;
    P.mats.bright.uniforms.uKaris.value = QS_.karis;
    F.fxaa = !!(
      P.mats.aa &&
      !P.fail.aa &&
      P.aaOpt !== false &&
      (QS_.aa === "fxaa" || (QS_.aa === "auto" && P.msaa === 0))
    );
    // contrast-adaptive sharpening (46_post_aa.js) rides in the same LDR pass; halved while the composite's own
    // upscale unsharp mask is active (dynamic resolution) so the two never stack into ringing
    const casBase =
      P.casOpt === false ? 0 : P.casStr !== undefined ? P.casStr : QS_.cas;
    P.casAmt =
      casBase * (P.mats.comp.uniforms.uSharpen.value > 0.001 ? 0.5 : 1);
    F.cas = !!(P.mats.aa && !P.fail.aa && P.casAmt > 0.01);
    F.aa = F.fxaa || F.cas;
    lutUpdate(rd);
    u.uTime.value = A.realTime;
    u.uExposure.value = G.renderer.toneMappingExposure;
    // bloom: stronger at night (neon!) and indoors
    u.uBloom.value =
      (P.baseBloom || 0.7) *
      (0.8 + 0.2 * env.night + (env.interior ? 0.2 : 0)) *
      (1 -
        0.15 * (A.wetShared && !env.interior ? A.wetShared.nrcWet.value.x : 0));
    // interiors: low threshold so emissive ceiling tubes / terminals bloom (bunkers, the cryo unit)
    const md = env.interior ? env.mood : null;
    P.wideW = env.interior ? 0.85 : 0.9 - 0.2 * env.night;
    P.mats.bright.uniforms.uHot.value = env.interior
      ? 3.0
      : 4.0 - 1.5 * env.night;
    const wetB = A.wetShared && !env.interior ? A.wetShared.nrcWet.value.x : 0;
    P.mats.bright.uniforms.uThreshold.value = env.interior
      ? (md && md.bloom) || 0.6
      : 1.2 + 0.2 * (1 - env.night) + 0.35 * wetB;
    u.uNight.value = env.night;
    // moodier framing indoors and at night (bunker corridors, subway tunnels)
    P.vigCur = A.damp(
      P.vigCur,
      P.vig + (env.interior ? 0.14 + ((md && md.vig) || 0) : 0.06 * env.night),
      2,
      rd,
    );
    u.uVignette.value = P.vigCur;
    // sun glare position
    u.uSunOn.value = 0;
    if (!env.interior && env.sunSize > 0.05 && env.sunY > -0.02 && G.camera) {
      const sp = _sunV
        .copy(G.camera.position)
        .addScaledVector(env.sunDir, 1500)
        .project(G.camera);
      if (sp.z < 1 && Math.abs(sp.x) < 1.3 && Math.abs(sp.y) < 1.3) {
        u.uSunUV.value.set(sp.x * 0.5 + 0.5, sp.y * 0.5 + 0.5);
        const W = A.weather ? A.weather.cur : null;
        u.uSunOn.value =
          (1 - Math.max(Math.abs(sp.x), Math.abs(sp.y)) / 1.3) *
          (W ? 1 - W.cloud * W.cloudDark : 1);
        u.uSunTint.value.copy(env.lightColor).multiplyScalar(0.6);
      }
    }
    updateRays(u, env, rd);
    // screen-space water reflections: outdoors, medium+
    P.waterRefl = !env.interior && QS_.water && P.waterOpt !== false;
    u.uWaterOn.value =
      P.waterRefl && A.water && A.water.visible !== false ? 1 : 0;
    if (u.uWaterOn.value && G.camera) {
      // screen height of the water plane's horizon (straight ahead, 3 km out)
      G.camera.getWorldDirection(_hz);
      _hz.y = 0;
      if (_hz.lengthSq() < 1e-6) _hz.set(0, 0, -1);
      _hz.normalize().multiplyScalar(3000).add(G.camera.position);
      _hz.y =
        G.world && G.world.waterLevel !== undefined ? G.world.waterLevel : -1.2;
      _hz.project(G.camera);
      u.uHorizonY.value = clamp(_hz.y * 0.5 + 0.5 + 0.01, -0.1, 1.1);
    }
    // step budget by level (same reach: fewer, longer steps on medium)
    const hi = lvl >= 2;
    u.uWaterN.value = hi ? 30 : 16;
    u.uWaterStep.value = hi ? 1 / 48 : 1 / 26;
    // rain puddles: depth-buffer SSR (needs the depth copy), outdoors, medium+
    const wet = A.wetShared ? A.wetShared.nrcWet.value : null;
    P.pudRefl = !!(
      P.depthValid &&
      !env.interior &&
      QS_.pud &&
      P.puddleOpt !== false &&
      wet &&
      wet.x > 0.05 &&
      G.camera
    );
    u.uPudOn.value = P.pudRefl ? 1 : 0;
    if (P.pudRefl) {
      const cam = G.camera;
      u.uPudN.value = hi ? 24 : 12;
      u.uProj.value.copy(cam.projectionMatrix);
      u.uInvProj.value.copy(cam.projectionMatrixInverse);
      u.uUpView.value.set(0, 1, 0).transformDirection(cam.matrixWorldInverse);
      u.uCamNF.value.set(cam.near, cam.far);
      u.uSkyRefl.value.copy(env.horizon).lerp(env.zenith, 0.35);
      if (P.rtDepth) u.tDepth.value = P.rtDepth.depthTexture;
    }
    // SSAO: medium 8 samples, high 12, ultra 16, low off. Contact shadow under cars, rubble and props, dark
    // wall/floor seams, window reveals and street-canyon corners; strongest indoors (bunkers, subway).
    P.aoWant = !!(
      P.mats.ao &&
      !P.aoFailed &&
      P.depthValid !== false &&
      P.rtDepth &&
      !P.depthFailed &&
      QS_.ao &&
      P.aoOpt !== false &&
      G.camera &&
      st !== "title"
    );
    if (P.aoWant) {
      const cam = G.camera,
        au = P.mats.ao.uniforms;
      au.uProj.value.copy(cam.projectionMatrix);
      au.uInvProj.value.copy(cam.projectionMatrixInverse);
      au.uCamNF.value.set(cam.near, cam.far);
      u.uCamNF.value.set(cam.near, cam.far);
      au.uN.value = QS_.aoN;
      au.uRadius.value = env.interior ? 0.75 : 0.9;
      au.uInt.value = env.interior ? 2.4 : 2.1;
      au.uFar.value = env.interior ? 60 : 150;
      au.uFogD.value =
        (G.scene && G.scene.fog && G.scene.fog.density) ||
        env.fogDensity ||
        0.0015;
      // outdoors the direct sun already carves form: a lighter hand by day, fuller at night / overcast / indoors
      const Wa = A.weather ? A.weather.cur : null;
      const overc = Wa ? clamp(Wa.cloud * Wa.cloudDark, 0, 1) : 0;
      u.uAOStr.value = env.interior
        ? 0.95
        : 0.62 + 0.25 * Math.max(env.night, overc);
    }
    // depth of field: dialogue close-ups (44_post_dof.js decides the profile)
    const dofOk = !!(
      A.postDOF &&
      P.mats.dofBlur &&
      F.dofShader &&
      !P.fail.dof &&
      P.dofOpt !== false &&
      P.rtDepth &&
      !P.depthFailed &&
      G.camera
    );
    const dw = dofOk ? A.postDOF.want(env, rd) : null;
    F.dof = !!dw;
    if (dw) {
      dw.n = QS_.dofN;
      P.dof = dw;
    }
    // volumetric light shafts (45_post_vol.js): medium+, outdoors, needs the depth copy and the sun's shadow map
    const VP = A.postVol;
    const volOk = !!(
      VP &&
      P.mats.vol &&
      F.volShader &&
      !P.fail.vol &&
      P.volOpt !== false &&
      QS_.vol &&
      P.rtDepth &&
      !P.depthFailed &&
      G.camera &&
      st !== "title" &&
      G.renderer.shadowMap.enabled
    );
    const vp = volOk
      ? VP.params(env, A.weather ? A.weather.cur : null, lvl)
      : null;
    P.volK = A.damp(P.volK || 0, vp ? 1 : 0, 3, rd);
    if (A.envSnap || G.SHOT) P.volK = vp ? 1 : 0;
    P.volWant = !!vp && P.volK > 0.01;
    if (P.volWant) {
      vp.col.multiplyScalar(P.volK);
      P.vol = vp;
    }
    // heat haze over fires + explosion blast waves (49_post_distort.js; all levels — a UV offset, no extra pass)
    if (F.distShader && A.postDistort && u.uHeatN) {
      A.postDistort.hook();
      const on = P.distOpt !== false && !P.fail.heat;
      if (on)
        P.distOn = A.postDistort.update(
          u,
          env,
          rd,
          !!(P.depthValid && P.rtDepth),
        );
      else {
        u.uHeatN.value = 0;
        u.uShockN.value = 0;
        P.distOn = false;
      }
      if (P.distOn && P.rtDepth) {
        u.tDepth.value = P.rtDepth.depthTexture;
        if (G.camera) u.uCamNF.value.set(G.camera.near, G.camera.far);
      }
    }
    // eye adaptation (48_post_eye.js): meter what the player looks at, adapt faster to light than to dark
    const EY = A.postEye;
    F.eye = !!(
      EY &&
      EY.S.on &&
      P.mats.eye &&
      F.eyeShader &&
      !P.fail.eye &&
      P.eyeOpt !== false &&
      st !== "title"
    );
    if (F.eye) {
      const ep = EY.params(env),
        eu = P.mats.eye.uniforms;
      // meter against the BASE exposure (without the lighting's cryo-exit glare boost, which must stay visible)
      eu.uExpo.value =
        (A.exposure || G.renderer.toneMappingExposure || 1) / 0.6;
      eu.uKUp.value = 1 - Math.exp(-rd / 0.45);
      eu.uK.value = 1 - Math.exp(-rd / 1.4);
      eu.uFirst.value =
        EY.consumeSnap() || G.SHOT || G.SMOKE || P.eyeWasOff ? 1 : 0;
      eu.uSkyW.value = ep.skyW;
      const cu = u;
      if (cu.uEye) {
        cu.uEye.value.set(cu.uEye.value.x, ep.key, ep.k, ep.lo);
        cu.uEyeHi.value = ep.hi;
      }
    }
    P.eyeWasOff = !F.eye;
    // ?eyedebug=1: live meter numbers in a corner readout (GPU readback twice a second — testing only)
    if (G.QS && G.QS.get("eyedebug") && (A.realTime || 0) > (P.eyeDbgT || 0)) {
      P.eyeDbgT = (A.realTime || 0) + 0.5;
      try {
        let el = document.getElementById("nrc-eye-debug");
        if (!el) {
          el = document.createElement("div");
          el.id = "nrc-eye-debug";
          el.style.cssText =
            "position:fixed;left:6px;top:6px;z-index:99999;font:13px monospace;color:#9f9;background:rgba(0,0,0,.6);padding:2px 5px;pointer-events:none";
          document.body.appendChild(el);
        }
        el.textContent =
          "EYE " +
          JSON.stringify(ATMOS.eyeInfo()) +
          " exp=" +
          (A.exposure || 0).toFixed(3) +
          " POST " +
          JSON.stringify(ATMOS.postInfo());
      } catch (e) {
        /* ignore */
      }
    }
    // context look: a cool clinical blue inside the cryo units (blended in over ~1 s)
    // + region / weather imagespaces (42_post_grade.js MODS, layered on the player's grade): The Neon after dark,
    //   dust storms, rain / fog, subway tunnels. Weather looks fade over ~6 s, districts ~2.5 s, interiors snap.
    // bake the current grade's region/weather looks in idle play time (one ≈10 ms LUT every 1.5 s) → no hitch later
    if (
      F.lutShader &&
      A.postGrade &&
      A.postGrade.cached &&
      st === "play" &&
      P.grade !== "none" &&
      (A.realTime || 0) > (P.bakeT || 0)
    ) {
      P.bakeT = (A.realTime || 0) + 1.5;
      for (const m of ["neon", "dust", "rain", "metro"]) {
        const n = P.grade + "+" + m;
        if (!A.postGrade.cached(n)) {
          A.postGrade.lut(n);
          break;
        }
      }
    }
    const L = P.lut,
      ctx = contextLook(env);
    if (ctx !== L.ctx) {
      const prevT = lutTarget();
      L.ctx = ctx;
      L.ctxW = ctx ? 1 : 0;
      if (lutTarget() !== prevT) L.dur = P.ctxDur || 1.2;
    }
    // rad-weather grade (preset rad > 0 only; outdoors only; follows the storm's blend-in)
    const Wc = A.weather ? A.weather.cur : null;
    P.storm = A.damp(
      P.storm || 0,
      !env.interior && Wc ? clamp(Wc.rad, 0, 1) : 0,
      3,
      rd,
    );
    if (A.envSnap || G.SHOT)
      P.storm = !env.interior && Wc ? clamp(Wc.rad, 0, 1) : 0;
    // the toxic grade surges in slow pulses and jumps with every lightning flash
    const sT = A.realTime || 0,
      sp = 0.5 + 0.5 * Math.sin(sT * 0.83) * Math.sin(sT * 0.31 + 1.3);
    u.uStorm.value =
      P.storm * (0.8 + 0.3 * sp + 0.35 * clamp(env.flash || 0, 0, 1));
    // health
    let hurtT = 0;
    // the world starts draining of colour around half health and is fully "hurt" at 10 %
    if (pl && pl.maxHp > 0 && pl.alive) {
      const f = pl.hp / pl.maxHp;
      hurtT = clamp((0.5 - f) / 0.4, 0, 1);
      hurtT = hurtT * (0.7 + 0.3 * hurtT);
    }
    P.hurt = A.damp(P.hurt, hurtT, 3, rd);
    u.uHurt.value = P.hurt;
    // heartbeat: 70 → 125 bpm as health drops; "lub" then a softer "dub"
    if (P.hurt > 0.001 || P.damage > 0.001) {
      P.beatPh = (P.beatPh + (rd * (70 + 55 * P.hurt)) / 60) % 1;
      const ph = P.beatPh,
        b1 = (ph - 0.04) / 0.045,
        b2 = (ph - 0.23) / 0.055;
      u.uBeat.value = Math.exp(-b1 * b1) + 0.6 * Math.exp(-b2 * b2);
    } else u.uBeat.value = 0;
    P.damage = Math.max(0, P.damage - rd * 2.2);
    u.uDamage.value = P.damage;
    // radiation: event pulses + steady when in a hot zone
    const rr = pl ? pl.radRate || 0 : 0;
    P.rad = Math.max(
      rr > 0.05 ? Math.min(0.5, rr * 0.08) : 0,
      P.rad - rd * 1.5,
    );
    u.uRad.value = P.rad;
    // menus / death
    const menu =
      st === "paused" || st === "goggles"
        ? 1
        : st === "levelup" || st === "barter" || st === "container"
          ? 0.5
          : 0;
    P.menu = A.damp(P.menu, menu, 8, rd);
    u.uMenuDim.value = P.menu;
    P.dead = A.damp(
      P.dead,
      st === "dead" || (pl && !pl.alive) ? 1 : 0,
      1.2,
      rd,
    );
    u.uDead.value = P.dead;
    // flashes: nuke (set by fx) + close lightning
    P.flashAmt = Math.max(0, P.flashAmt - rd * P.flashDecay);
    const lf = env.flash > 0.6 && !env.interior ? (env.flash - 0.6) * 0.25 : 0;
    u.uFlashAmt.value = Math.max(P.flashAmt, lf);
    u.uFlashCol.value.copy(
      P.flashAmt >= lf
        ? P.flashCol
        : A.weather
          ? A.weather.cur.flashColor
          : P.flashCol,
    );
    dynUpdate(rd, st);
    // performance watchdog: drop MSAA when struggling
    if (!G.SMOKE && !G.SHOT && st === "play" && G.stats && G.stats.fps > 0) {
      if (G.stats.fps < 24) P.fpsLow += realDt;
      else P.fpsLow = Math.max(0, P.fpsLow - realDt * 0.5);
      if (P.fpsLow > 6 && P.msaa > 0) {
        P.fpsLow = 0;
        setMSAA(0);
        console.warn("[atmosphere] low fps → MSAA off");
      }
    }
  }

  // ------------------------------------------------------------------
  // Context look (an "imagespace" per region / weather): returns a LUT name or null (= the user grade).
  // Hysteresis on every trigger so a look never flickers at a threshold. Sets P.ctxDur (blend seconds).
  // ------------------------------------------------------------------
