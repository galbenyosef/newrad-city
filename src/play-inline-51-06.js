// play-inline-51 06 — three
// Lines 1068-1350 of readable/play-inline-51.pretty.js (statement-aligned).
  function buildComposite(w, h) {
    const g = GRADES.olive;
    const variants = [];
    const canLut = !!(A.postGrade && !P.fail.lut),
      canDof = !!(P.mats.dofBlur && !P.fail.dof),
      canEye = !!(P.mats.eye && !P.fail.eye);
    const canVol = !!(P.mats.vol && P.mats.volBlur && !P.fail.vol);
    const canDist = !!(A.postDistort && !P.fail.heat);
    variants.push({
      lut: canLut,
      dof: canDof,
      eye: canEye,
      vol: canVol,
      dist: canDist,
    });
    if (canVol || canDist)
      variants.push({
        lut: canLut,
        dof: canDof,
        eye: canEye,
        vol: false,
        dist: false,
      });
    if (canDof)
      variants.push({ lut: canLut, dof: false, eye: canEye, vol: false });
    if (canLut)
      variants.push({ lut: false, dof: false, eye: canEye, vol: false });
    if (canEye)
      variants.push({ lut: false, dof: false, eye: false, vol: false });
    let last = null;
    for (const fl of variants) {
      const u = {
        tScene: { value: null },
        tBloom: { value: null },
        uRes: { value: new THREE.Vector2(w, h) },
        uTime: { value: 0 },
        uExposure: { value: 1 },
        uBloom: { value: 0.7 },
        uCA: { value: 0.0 },
        uVignette: { value: 0.42 },
        uGrain: { value: P.grain },
        uSat: { value: g.sat },
        uContrast: { value: g.contrast },
        uLift: { value: new THREE.Vector3() },
        uNightLift: { value: new THREE.Vector3() },
        uSrcTexel: { value: new THREE.Vector2(1 / w, 1 / h) },
        uSharpen: { value: 0 },
        uGamma: { value: new THREE.Vector3(1, 1, 1) },
        uGain: { value: new THREE.Vector3(1, 1, 1) },
        uShadowTint: { value: new THREE.Vector3() },
        uHighTint: { value: new THREE.Vector3() },
        uHurt: { value: 0 },
        uDamage: { value: 0 },
        uRad: { value: 0 },
        uMenuDim: { value: 0 },
        uDead: { value: 0 },
        uFlashAmt: { value: 0 },
        uFlashCol: { value: new THREE.Color(1, 1, 1) },
        uNight: { value: 0 },
        uBeat: { value: 0 },
        uSunUV: { value: new THREE.Vector2(0.5, 0.5) },
        uSunOn: { value: 0 },
        uAspect: { value: w / h },
        uSunTint: { value: new THREE.Color(1, 0.9, 0.7) },
        tRays: { value: null },
        uRayCol: { value: new THREE.Color(0, 0, 0) },
        uNoise: { value: A.noiseTex },
        uWaterOn: { value: 0 },
        uWaterStep: { value: 1 / 48 },
        uHorizonY: { value: 0.5 },
        uWaterTint: { value: new THREE.Color(0.62, 0.66, 0.54) },
        uWaterN: { value: 30 },
        tDepth: { value: P.rtDepth ? P.rtDepth.depthTexture : null },
        uPudOn: { value: 0 },
        uPudN: { value: 24 },
        uProj: { value: new THREE.Matrix4() },
        uInvProj: { value: new THREE.Matrix4() },
        uUpView: { value: new THREE.Vector3(0, 1, 0) },
        uSkyRefl: { value: new THREE.Color() },
        uCamNF: { value: new THREE.Vector2(0.1, 3000) },
        uStorm: { value: 0 },
        uStormTint: { value: new THREE.Color(0.86, 1.08, 0.6) },
        tAO: { value: P.rtAO ? P.rtAO.texture : null },
        tVM: { value: P.rtVM ? P.rtVM.depthTexture : null },
        uAOOn: { value: 0 },
        uAOStr: { value: 0.8 },
        uVMOn: { value: 0 },
        uOutLuma: { value: 0 },
      };
      if (fl.lut) {
        const t = A.postGrade.lut(P.grade);
        u.tLutA = { value: t };
        u.tLutB = { value: t };
        u.uLutMix = { value: 0 };
      }
      if (fl.dof) {
        u.tDof = { value: null };
        u.tFocus = { value: null };
        u.uDof = { value: new THREE.Vector4(1.6, 1, 0.2, 0) };
        u.uDofOn = { value: 0 };
      }
      if (fl.eye) {
        u.tEye = { value: null };
        u.uEye = { value: new THREE.Vector4(0, 0.2, 0.35, 0.7) };
        u.uEyeHi = { value: 1.6 };
      }
      if (fl.dist) Object.assign(u, A.postDistort.uniforms());
      if (fl.vol) {
        u.tVol = { value: null };
        u.uVolCol = { value: new THREE.Color(0, 0, 0) };
        u.uVolTexel = { value: new THREE.Vector2(1 / 256, 1 / 256) };
        u.uVolSky = { value: 0.35 };
        u.uVolOn = { value: 0 };
      }
      const m = new THREE.ShaderMaterial({
        vertexShader: A.glsl.fsVert,
        fragmentShader: compShader(fl),
        uniforms: u,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });
      if (A.validateMaterial(m, P.geo)) {
        P.mats.comp = m;
        P.feat.lutShader = fl.lut;
        P.feat.dofShader = fl.dof;
        P.feat.eyeShader = !!fl.eye;
        P.feat.volShader = !!fl.vol;
        P.feat.distShader = !!fl.dist;
        if (canVol && !fl.vol)
          dropFeature("vol", "volumetric composite failed to compile");
        if (canDist && !fl.dist)
          dropFeature("heat", "heat-haze composite failed to compile");
        if (canLut && !fl.lut)
          dropFeature(
            "lut",
            "LUT composite failed to compile (analytic grade)",
          );
        if (canDof && !fl.dof)
          dropFeature("dof", "DOF composite failed to compile");
        if (canEye && !fl.eye)
          dropFeature("eye", "eye-adaptation composite failed to compile");
        return;
      }
      last = fl;
      m.dispose();
    }
    throw new Error(
      "post-fx composite failed to compile (" + JSON.stringify(last) + ")",
    );
  }
  function wantMSAA() {
    const r = G.renderer;
    return QSET[P.postQ].msaa && r.capabilities.isWebGL2 && !G.SMOKE
      ? Math.min(4, r.capabilities.maxSamples || 4)
      : 0;
  }
  function setMSAA(want) {
    if (!P.rtScene || want === P.msaa) return;
    P.msaa = want;
    const old = P.rtScene;
    P.rtScene = mkRT(P.sw, P.sh, { depthBuffer: true, samples: want });
    P.rtScene.texture.name = "atmos_scene";
    old.dispose();
  }
  // lazily created targets (only when the feature is first used)
  function ensureDofRTs() {
    if (P.rtDofA) return;
    const bw = (x) => Math.max(1, Math.floor(x / 2));
    P.rtDofA = mkRT(bw(P.sw), bw(P.sh));
    P.rtDofB = mkRT(bw(P.sw), bw(P.sh));
    P.rtFocus = [
      mkRT(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
      }),
      mkRT(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
      }),
    ];
  }
  function ensureVol(div) {
    const w = Math.max(1, Math.floor(P.sw / div)),
      h = Math.max(1, Math.floor(P.sh / div));
    if (P.rtVol && P.volDiv === div) {
      if (P.rtVol.width !== w || P.rtVol.height !== h) {
        P.rtVol.setSize(w, h);
        P.rtVol2.setSize(w, h);
      }
      return;
    }
    if (P.rtVol) {
      P.rtVol.dispose();
      P.rtVol2.dispose();
    }
    P.volDiv = div;
    P.rtVol = mkRT(w, h);
    P.rtVol.texture.name = "atmos_vol";
    P.rtVol2 = mkRT(w, h);
  }
  function ensureLDR() {
    if (P.rtLDR) return;
    P.rtLDR = mkRT(P.w, P.h, { type: THREE.UnsignedByteType });
    P.rtLDR.texture.name = "atmos_ldr";
  }

  function resize() {
    if (!P.rtScene) return;
    const { w, h } = sizes();
    const { sw, sh } = sceneSize(w, h);
    if (w === P.w && h === P.h && sw === P.sw && sh === P.sh) return;
    P.w = w;
    P.h = h;
    P.sw = sw;
    P.sh = sh;
    P.rtScene.setSize(sw, sh);
    const bw = (x, d) => Math.max(1, Math.floor(x / d));
    P.rtBright.setSize(bw(sw, 2), bw(sh, 2));
    const divs = [4, 8, 16, 32];
    P.chain.forEach((rt, i) => rt.setSize(bw(sw, divs[i]), bw(sh, divs[i])));
    if (P.rtRays) P.rtRays.setSize(bw(sw, 4), bw(sh, 4));
    if (P.rtDepth) {
      P.rtDepth.setSize(sw, sh);
      P.depthDirty = true;
    }
    if (P.rtAO) {
      P.rtAO.setSize(bw(sw, 2), bw(sh, 2));
      P.rtAO2.setSize(bw(sw, 2), bw(sh, 2));
      P.mats.ao.uniforms.uDTexel.value.set(1 / sw, 1 / sh);
    }
    if (P.rtVM) {
      P.rtVM.setSize(sw, sh);
      P.vmDirty = true;
    }
    if (P.rtDofA) {
      P.rtDofA.setSize(bw(sw, 2), bw(sh, 2));
      P.rtDofB.setSize(bw(sw, 2), bw(sh, 2));
    }
    if (P.rtVol) ensureVol(P.volDiv);
    if (P.rtLDR) P.rtLDR.setSize(w, h);
    if (P.mats.aa) {
      P.mats.aa.uniforms.uTexel.value.set(1 / w, 1 / h);
      P.mats.aa.uniforms.uRes.value.set(w, h);
    }
    if (P.mats.rays) P.mats.rays.uniforms.uAspect.value = w / h;
    const u = P.mats.comp.uniforms;
    u.uRes.value.set(w, h);
    u.uAspect.value = w / h;
    u.uSrcTexel.value.set(1 / sw, 1 / sh);
    const k = sw / w;
    u.uSharpen.value = k < 0.97 ? Math.min(0.5, (1 - k) * 1.3) : 0;
  }

  // ------------------------------------------------------------------
  // Dynamic resolution + perf tier. Each 1 s window of frame times (hitches > 120 ms ignored)
  // steers the scene-target scale: over budget → shrink (pixel count ∝ scale², so the step is
  // sqrt(target/avg)); comfortably at budget for a few windows → grow by 0.1 (the wait doubles after
  // every up-step that had to be taken back, so it doesn't oscillate). If shrinking doesn't buy any
  // time we're CPU-bound: go back up and stop shrinking for 20 s. The perf tier (0 full, 1 reduced,
  // 2 low) follows the scale / sustained overload and drives shadow size/extent here and — via
  // G.atmos.perfTier / lodScale / the 'perfTierChanged' event — other modules' LOD distances.
  // ------------------------------------------------------------------
  function qualityTier() {
    return A.quality === "low" ? 2 : A.quality === "medium" ? 1 : 0;
  }
  function setTier() {
    const t = Math.max(qualityTier(), P.dyn.dynTier);
    if (t !== ATMOS.perfTier) {
      ATMOS.perfTier = t;
      ATMOS.lodScale = TIER_LOD[t];
      if (A.applyShadowTier) A.applyShadowTier();
      G.events.emit("perfTierChanged", t);
    }
  }
  function setScale(k) {
    const D = P.dyn;
    k = Math.round(clamp(k, D.min, D.max) * 20) / 20;
    if (Math.abs(k - D.scale) < 0.001) return false;
    D.scale = k;
    resize();
    return true;
  }
