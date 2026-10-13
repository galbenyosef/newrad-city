// play-inline-51 11 — atmos
// Lines 2684-3022 of readable/play-inline-51.pretty.js (statement-aligned).
  function contextLook(env) {
    const GR = A.postGrade;
    if (!GR || P.grade === "none" || !P.feat.lutShader || P.ctxOpt === false)
      return null;
    const cur = P.lut.ctx || "",
      key = ATMOS.interiorKey || "";
    const mod = (m) => (GR.has(P.grade + "+" + m) ? P.grade + "+" + m : null);
    if (env.interior) {
      P.ctxDur = 0.6;
      if (/cryo/i.test(key) && GR.has("cryo")) return "cryo";
      if (/subway|metro|tunnel/i.test(key)) return mod("metro");
      if (/neon/i.test(key)) return mod("neon");
      return null;
    }
    const W = A.weather ? A.weather.cur : null;
    if (W) {
      const isDust = /\+dust$/.test(cur),
        isRain = /\+rain$/.test(cur);
      if (W.dust > (isDust ? 0.35 : 0.55) && W.rad < 0.3) {
        P.ctxDur = 6;
        return mod("dust");
      }
      if (
        W.rad < 0.3 &&
        (W.rain > (isRain ? 0.3 : 0.5) || W.fogMul > (isRain ? 2.6 : 3.0))
      ) {
        P.ctxDur = 6;
        return mod("rain");
      }
    }
    // The Neon (Times Square) after dark
    let ts = P._tsLoc;
    if (ts === undefined) {
      try {
        ts = P._tsLoc =
          (G.LAYOUT &&
            G.LAYOUT.getLocation &&
            G.LAYOUT.getLocation("times_square")) ||
          null;
      } catch (e) {
        ts = P._tsLoc = null;
      }
    }
    if (ts) {
      const isNeon = /\+neon$/.test(cur);
      const d = Math.hypot(A.camPos.x - ts.x, A.camPos.z - ts.z);
      if (
        d < (ts.r || 55) + (isNeon ? 40 : 20) &&
        env.night > (isNeon ? 0.25 : 0.4)
      ) {
        P.ctxDur = 2.5;
        return mod("neon");
      }
    }
    return null;
  }

  // ------------------------------------------------------------------
  // Light shafts: which light (sun by day, moon at night), where it is on screen, how strong.
  // Strength follows the haze (forward scatter), is strongest with a low sun (dawn/dusk through the
  // ruins, the cryo-exit glare), dims under a thick overcast and fades as the light leaves the view.
  // ------------------------------------------------------------------
  const _rayC = new THREE.Color();
  function updateRays(u, env, rd) {
    let want = 0;
    const W = A.weather ? A.weather.cur : null;
    if (
      !env.interior &&
      G.camera &&
      P.rtRays &&
      QSET[P.level].rays &&
      !P.fail.rays &&
      P.rayOpt !== false
    ) {
      const day = env.sunY > -0.03;
      const dir = day ? env.sunDir : env.moonDir;
      if (dir.y > -0.05) {
        const sp = _sunV
          .copy(G.camera.position)
          .addScaledVector(dir, 1500)
          .project(G.camera);
        const m = Math.max(Math.abs(sp.x), Math.abs(sp.y));
        if (sp.z < 1 && m < 2.2) {
          const onView = 1 - A.smooth(0.9, 2.2, m);
          const cloud = W ? W.cloud * W.cloudDark : 0;
          const lowSun = 1 - A.smooth(0.08, 0.6, dir.y);
          const haze =
            1 + (W ? W.dust * 0.8 + W.rad * 0.5 + (W.fogMul - 1) * 0.15 : 0);
          if (day) {
            want =
              onView *
              (0.55 + 0.75 * lowSun) *
              (1 - 0.8 * cloud) *
              Math.min(1, env.sunSize + 0.2) *
              haze;
            want *= A.smooth(-0.03, 0.04, env.sunY);
            _rayC.copy(env.lightColor);
          } else {
            want =
              onView *
              0.35 *
              (1 - 0.9 * cloud) *
              A.smooth(0.02, 0.2, dir.y) *
              env.night;
            _rayC.setRGB(0.55, 0.68, 0.85);
          }
          P.mats.rays.uniforms.uSun.value.set(
            sp.x * 0.5 + 0.5,
            sp.y * 0.5 + 0.5,
          );
          // mask threshold just under the sky brightness around the light: only the bright halo streams
          const hz = env.horizon,
            zl = hz.r * 0.2126 + hz.g * 0.7152 + hz.b * 0.0722;
          P.mats.rays.uniforms.uThresh.value = day
            ? zl * 0.55
            : zl * 0.9 + 0.02;
          P.mats.rays.uniforms.uFall.value = day
            ? 1.5 + 1.5 * (1 - lowSun)
            : 3.0;
          P.mats.rays.uniforms.uTime.value = A.realTime;
        }
      }
    }
    P.rayK = A.damp(P.rayK, want, 4, rd);
    if (A.envSnap || G.SHOT) P.rayK = want;
    P.raysOn = P.rayK > 0.01;
    if (P.raysOn) u.uRayCol.value.copy(_rayC).multiplyScalar(P.rayK * 3.0);
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  /** Grading preset 'olive' | 'amber' | 'teal' | 'none'. The game keeps 'teal' (fixed, not a player setting);
   *  this stays for debugging only and is not persisted. With the LUT path it cross-fades over opts.blend seconds. */
  ATMOS.setGrading = function (name, opts) {
    if (!GRADES[name]) return false;
    const bl = opts && opts.blend !== undefined ? +opts.blend : 1.2;
    P.lut.dur = Math.max(0.05, bl || 0.05);
    applyGrade(name, bl <= 0);
    return true;
  };
  ATMOS.getGrading = () => P.grade;
  ATMOS.gradings = () => Object.keys(GRADES);
  ATMOS.setPostFX = function (on) {
    enable(on);
    try {
      localStorage.setItem("nrc_postfx", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    return P.enabled;
  };
  ATMOS.isPostFX = () => P.enabled;
  /** Full-screen colour flash (nuke white-out etc). amount 0..1, decays in `dur` seconds. */
  ATMOS.screenFlash = function (amount, color, dur) {
    P.flashAmt = Math.max(P.flashAmt, clamp(amount || 1, 0, 1));
    P.flashCol.copy(A.color(color || 0xffffff));
    P.flashDecay = 1 / Math.max(0.05, dur || 0.5);
  };
  /** 'damage' | 'rad' pulse for UI-driven effects. */
  ATMOS.pulse = function (type, amt) {
    amt = amt === undefined ? 0.6 : amt;
    if (type === "damage") P.damage = Math.min(1, P.damage + amt);
    else if (type === "rad") P.rad = Math.min(1, P.rad + amt);
  };
  /** Post effect knobs (0..1 scalars): {vignette, grain, ca, bloom, sharpen: 0..1|false, rays:bool, waterReflections:bool,
   *  puddleReflections:bool, ao:bool, aa:bool (FXAA), dof:bool, eye:bool (eye adaptation)} */
  ATMOS.setPostParams = function (o) {
    if (!P.mats.comp || !o) return;
    const u = P.mats.comp.uniforms;
    if (o.rays !== undefined) P.rayOpt = !!o.rays;
    if (o.waterReflections !== undefined) P.waterOpt = !!o.waterReflections;
    if (o.puddleReflections !== undefined) P.puddleOpt = !!o.puddleReflections;
    if (o.ao !== undefined) P.aoOpt = !!o.ao;
    if (o.vignette !== undefined) {
      P.vig = o.vignette;
      u.uVignette.value = o.vignette;
    }
    if (o.grain !== undefined) P.grain = Math.max(0, +o.grain || 0);
    if (o.aa !== undefined) P.aaOpt = !!o.aa;
    if (o.dof !== undefined) P.dofOpt = !!o.dof;
    if (o.sharpen !== undefined) {
      if (o.sharpen === false) P.casOpt = false;
      else {
        P.casOpt = true;
        P.casStr = clamp(+o.sharpen || 0, 0, 1);
      }
    }
    if (o.eye !== undefined) P.eyeOpt = !!o.eye;
    if (o.looks !== undefined) P.ctxOpt = !!o.looks;
    if (o.volumetric !== undefined) P.volOpt = !!o.volumetric;
    if (o.heatHaze !== undefined) P.distOpt = !!o.heatHaze;
    if (o.ca !== undefined) u.uCA.value = o.ca;
    if (o.bloom !== undefined) P.baseBloom = o.bloom;
  };
  /** 'low' (no post, 1024 shadows) | 'medium' (post, no MSAA) | 'high' */
  ATMOS.setQuality = function (q) {
    if (["low", "medium", "high"].indexOf(q) < 0) return false;
    A.quality = ATMOS.quality = q;
    try {
      localStorage.setItem("nrc_gfx_quality", q);
    } catch (e) {
      /* ignore */
    }
    if (ATMOS.setShadowQuality) ATMOS.setShadowQuality(q);
    // the post level follows the graphics quality (an explicit setPostQuality afterwards overrides it)
    P.postQ = q === "low" ? 0 : q === "medium" ? 1 : 2;
    ATMOS.postQuality = POSTQ[P.postQ];
    try {
      localStorage.removeItem("nrc_postq");
    } catch (e) {
      /* ignore */
    }
    if (P.rtScene) setMSAA(wantMSAA());
    enable(q !== "low");
    setTier();
    armWatch();
    return true;
  };
  /**
   * Post-processing quality (persisted, independent of shadows/LOD):
   *  'low'    grade LUT, 3-level Karis bloom, vignette/grain, FXAA; no AO / light shafts / SSR
   *  'medium' + SSAO (8), light shafts, water + puddle SSR (short), DOF 20 taps, FXAA
   *  'high'   + MSAA 4× (WebGL2; FXAA only if MSAA is unavailable), SSAO 12, full SSR, DOF 28
   *  'ultra'  + FXAA on top of MSAA (foliage / wires / specular), SSAO 16, DOF 40
   * The live perf tier still limits the effective level (tier 1 → medium, tier 2 → low).
   * Turns post-fx on if it was off (unless it failed); use setPostFX(false) for plain rendering.
   */
  ATMOS.setPostQuality = function (q) {
    const i = POSTQ.indexOf(q);
    if (i < 0) return false;
    P.postQ = i;
    ATMOS.postQuality = q;
    try {
      localStorage.setItem("nrc_postq", q);
    } catch (e) {
      /* ignore */
    }
    if (P.rtScene) setMSAA(wantMSAA());
    if (!P.enabled && !P.failed) enable(true);
    armWatch();
    return P.enabled;
  };
  ATMOS.getPostQuality = () => POSTQ[P.postQ];
  ATMOS.postQualities = () => POSTQ.slice();
  /** Force a depth-of-field focus distance in metres (cutscenes, photo mode); 0 / null = automatic. */
  ATMOS.setDOF = function (dist) {
    if (A.postDOF) A.postDOF.force(+dist || 0);
  };
  /** What the post stack is doing right now (debug / settings UI / smoke). */
  ATMOS.postInfo = function () {
    const F = P.feat;
    return {
      enabled: P.enabled,
      failed: P.failed,
      quality: POSTQ[P.postQ],
      level: POSTQ[P.level],
      msaa: P.msaa,
      passes: {
        ao: P.aoWant && P.depthValid ? P.aoKind || "ssao" : false,
        bloomLevels: F.bloomLv || 0,
        rays: !!P.raysOn,
        water: !!P.waterRefl,
        puddles: !!P.pudRefl,
        dof: !!F.dof,
        aa:
          (F.fxaa ? "fxaa" : "") +
          (P.msaa
            ? (F.fxaa ? "+" : "") + "msaa" + P.msaa
            : F.fxaa
              ? ""
              : "none"),
        lut: !!F.lutShader,
        grade: P.grade,
        lutBlend: P.lut.b ? [P.lut.a, P.lut.b, +P.lut.mix.toFixed(2)] : P.lut.a,
        look: lutTarget(),
        eye: !!F.eye,
        sharpen: F.cas ? +(P.casAmt || 0).toFixed(2) : 0,
        heat: P.feat.distShader
          ? P.distOn && A.postDistort.S.last
            ? A.postDistort.S.last
            : "idle"
          : false,
        volumetric:
          P.volWant && P.vol
            ? {
                steps: P.vol.steps,
                res: "1/" + P.vol.div,
                dens: +P.vol.dens.toFixed(4),
              }
            : false,
      },
      failed_passes: Object.assign({}, P.fail),
      depthCopy: !!P.depthValid,
      scale: ATMOS.renderScale(),
    };
  };
  /** Eye adaptation (auto-exposure metering, 48_post_eye.js) on/off — persisted (nrc_eye). */
  ATMOS.setEyeAdaptation = function (on) {
    const EY = A.postEye;
    if (!EY) return false;
    EY.S.on = !!on;
    try {
      localStorage.setItem("nrc_eye", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (on) EY.snap();
    return EY.S.on;
  };
  /** {on, adapted, current, factor, key, k} — adapted/current = metered post-exposure log-average luminance.
   *  Reads 1 pixel back from the GPU (debug / tests only, not per frame). */
  ATMOS.eyeInfo = function () {
    const EY = A.postEye;
    if (
      !EY ||
      !P.rtEye ||
      !P.feat.eye ||
      !P.mats.comp ||
      !P.mats.comp.uniforms.uEye
    )
      return { on: false, failed: P.fail.eye || null };
    const v = EY.readback(G.renderer, P.rtEye[P.eyeIdx]);
    const e = P.mats.comp.uniforms.uEye.value,
      hi = P.mats.comp.uniforms.uEyeHi.value;
    const f = v
      ? clamp(Math.pow(e.y / Math.max(1e-4, v.adapted), e.z), e.w, hi)
      : null;
    return {
      on: true,
      adapted: v && +v.adapted.toFixed(4),
      current: v && +v.current.toFixed(4),
      factor: f && +f.toFixed(3),
      key: +e.y.toFixed(3),
      k: +e.z.toFixed(3),
      range: [+e.w.toFixed(2), +hi.toFixed(2)],
    };
  };
  /** Dynamic resolution on/off (persisted). Off → full-resolution scene target. */
