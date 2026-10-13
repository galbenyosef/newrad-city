// play-inline-51 05 — three
// Lines 793-1067 of readable/play-inline-51.pretty.js (statement-aligned).
  function build() {
    const { w, h } = sizes();
    P.w = w;
    P.h = h;
    const { sw, sh } = sceneSize(w, h);
    P.sw = sw;
    P.sh = sh;
    const r = G.renderer;
    P.msaa = wantMSAA();
    P.rtScene = mkRT(sw, sh, { depthBuffer: true, samples: P.msaa });
    P.rtScene.texture.name = "atmos_scene";
    const bw = (x, d) => Math.max(1, Math.floor(x / d));
    P.rtBright = mkRT(bw(sw, 2), bw(sh, 2));
    P.chain = [
      mkRT(bw(sw, 4), bw(sh, 4)),
      mkRT(bw(sw, 8), bw(sh, 8)),
      mkRT(bw(sw, 16), bw(sh, 16)),
      mkRT(bw(sw, 32), bw(sh, 32)),
    ];
    P.rtRays = mkRT(bw(sw, 4), bw(sh, 4));
    buildDepthCapture(sw, sh);
    if (P.rtDepth) {
      P.rtAO = mkRT(bw(sw, 2), bw(sh, 2));
      P.rtAO.texture.name = "atmos_ao";
      P.rtAO2 = mkRT(bw(sw, 2), bw(sh, 2));
      buildViewDepthCapture(sw, sh);
    }

    const vs = A.glsl.fsVert;
    const mk = (fs, uniforms) =>
      new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        uniforms,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });
    P.mats.bright = mk(BRIGHT, {
      tSrc: { value: null },
      uTexel: { value: new THREE.Vector2() },
      uThreshold: { value: 1.0 },
      uKnee: { value: 0.5 },
      uHot: { value: 3.0 },
      uKaris: { value: 1 },
    });
    P.mats.down = mk(DOWN, {
      tSrc: { value: null },
      uTexel: { value: new THREE.Vector2() },
    });
    P.mats.up = mk(UP, {
      tSrc: { value: null },
      uTexel: { value: new THREE.Vector2() },
      uWeight: { value: 1 },
    });
    P.mats.up.blending = THREE.AdditiveBlending;
    P.mats.up.transparent = true;
    P.mats.rays = mk(RAYS, {
      tSrc: { value: null },
      uSun: { value: new THREE.Vector2(0.5, 0.5) },
      uAspect: { value: w / h },
      uThresh: { value: 0.3 },
      uFall: { value: 1.6 },
      uTime: { value: 0 },
    });
    if (P.rtAO) {
      // GTAO-lite (43_post_gtao.js) when it compiles, else the previous disc SSAO. ?aomode=ssao for A/B shots.
      const wantGT = !!(
        A.postGTAO &&
        !P.fail.gtao &&
        !(G.QS && G.QS.get("aomode") === "ssao")
      );
      const aoU = () => ({
        tDepth: { value: P.rtDepth.depthTexture },
        uProj: { value: new THREE.Matrix4() },
        uInvProj: { value: new THREE.Matrix4() },
        uCamNF: { value: new THREE.Vector2(0.1, 3000) },
        uDTexel: { value: new THREE.Vector2(1 / sw, 1 / sh) },
        uRadius: { value: 0.9 },
        uN: { value: 12 },
        uFar: { value: 140 },
        uInt: { value: 2.2 },
        uFogD: { value: 0.0015 },
        uMaxUV: { value: 0.09 },
      });
      if (wantGT) {
        const gm = mk(A.postGTAO.FS, aoU());
        if (A.validateMaterial(gm, null) !== false) {
          P.mats.ao = gm;
          P.aoKind = "gtao";
        } else {
          gm.dispose();
          P.fail.gtao = "GTAO failed to compile (disc SSAO)";
        }
      }
      if (!P.mats.ao) {
        P.aoKind = "ssao";
        P.mats.ao = mk(AO, {
          tDepth: { value: P.rtDepth.depthTexture },
          uProj: { value: new THREE.Matrix4() },
          uInvProj: { value: new THREE.Matrix4() },
          uCamNF: { value: new THREE.Vector2(0.1, 3000) },
          uDTexel: { value: new THREE.Vector2(1 / sw, 1 / sh) },
          uRadius: { value: 0.9 },
          uN: { value: 12 },
          uFar: { value: 140 },
          uInt: { value: 2.2 },
          uFogD: { value: 0.0015 },
          uMaxUV: { value: 0.09 },
        });
      }
      P.mats.aoBlur = mk(AOBLUR, {
        tSrc: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uDir: { value: new THREE.Vector2(1, 0) },
      });
    }
    // depth of field (needs the depth copy) — 44_post_dof.js
    const DF = A.postDOF;
    if (P.rtDepth && DF && !P.fail.dof) {
      const nf = () => ({ value: new THREE.Vector2(0.1, 3000) });
      P.mats.dofFocus = mk(DF.FOCUS, {
        tDepth: { value: P.rtDepth.depthTexture },
        tPrev: { value: null },
        uCamNF: nf(),
        uK: { value: 0.1 },
        uOverride: { value: 0 },
        uFirst: { value: 1 },
      });
      P.mats.dofPre = mk(DF.PRE, {
        tSrc: { value: null },
        tDepth: { value: P.rtDepth.depthTexture },
        tFocus: { value: null },
        tVM: { value: null },
        uCamNF: nf(),
        uDof: { value: new THREE.Vector4(1.6, 1, 0.2, 0) },
        uVMOn: { value: 0 },
      });
      P.mats.dofBlur = mk(DF.BLUR, {
        tSrc: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uMaxR: { value: 8 },
        uN: { value: 24 },
      });
    }
    // volumetric light shafts (shadow-map ray march, ½ / ¼ res + bilateral blur) — 45_post_vol.js
    if (P.rtDepth && A.postVol && !P.fail.vol) {
      P.mats.vol = mk(A.postVol.FS, {
        tDepth: { value: P.rtDepth.depthTexture },
        tShadow: { value: null },
        uInvProj: { value: new THREE.Matrix4() },
        uCamWorld: { value: new THREE.Matrix4() },
        uShadowMat: { value: new THREE.Matrix4() },
        uCamPos: { value: new THREE.Vector3() },
        uLightDir: { value: new THREE.Vector3(0, 1, 0) },
        uVolP: { value: new THREE.Vector4(110, 16, 0.001, 30) },
        uVolQ: { value: new THREE.Vector4(0, 0.5, 0.5, 0) },
        uExt: { value: 0.004 },
        uLit0: { value: 0.35 },
      });
      P.mats.volBlur = mk(AOBLUR, {
        tSrc: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uDir: { value: new THREE.Vector2(1, 0) },
      });
    }
    // eye adaptation meter (1×1 ping-pong, half float) — 48_post_eye.js
    if (A.postEye && !P.fail.eye) {
      P.mats.eye = mk(A.postEye.METER, {
        tSrc: { value: null },
        tPrev: { value: null },
        uExpo: { value: 1 },
        uK: { value: 0.02 },
        uKUp: { value: 0.05 },
        uFirst: { value: 1 },
        uSkyW: { value: 0.45 },
      });
      const n1 = () =>
        mkRT(1, 1, {
          minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter,
        });
      P.rtEye = [n1(), n1()];
      P.eyeIdx = 0;
    }
    // anti-aliasing + grain pass — 46_post_aa.js
    if (A.postAA && !P.fail.aa) {
      P.mats.aa = mk(A.postAA.FXAA, {
        tSrc: { value: null },
        uTexel: { value: new THREE.Vector2(1 / w, 1 / h) },
        uRes: { value: new THREE.Vector2(w, h) },
        uGrain: { value: 0 },
        uTime: { value: 0 },
        uNight: { value: 0 },
        uAA: { value: 1 },
        uSharp: { value: 0 },
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
        3,
      ),
    );
    P.geo = geo;
    // validate every optional pass on its own: a failing one is switched off, the rest keeps running
    const OPTIONAL = {
      rays: "rays",
      ao: "ao",
      aoBlur: "ao",
      dofFocus: "dof",
      dofPre: "dof",
      dofBlur: "dof",
      aa: "aa",
      eye: "eye",
      vol: "vol",
      volBlur: "vol",
    };
    for (const k in P.mats) {
      if (A.validateMaterial(P.mats[k], geo)) continue;
      const f = OPTIONAL[k];
      if (!f) throw new Error('post-fx shader "' + k + '" failed to compile');
      dropFeature(f, 'shader "' + k + '" failed to compile');
    }
    // composite: full → without DOF → without LUT; only if even the plain composite fails is post-fx off
    buildComposite(w, h);
    P.quad = new THREE.Mesh(geo, P.mats.comp);
    P.quad.frustumCulled = false;
    P.qScene = new THREE.Scene();
    P.qScene.add(P.quad);
    P.qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    applyGrade(P.grade, true);
    P.sw = 0;
    resize(); // push the source-texel / sharpen uniforms for the initial scale
    armWatch();
  }
  function dropFeature(f, why) {
    P.fail[f] = why;
    if (f === "ao") {
      dropAO(why);
      return;
    }
    if (f === "eye" && P.mats.comp && P.mats.comp.uniforms.uEye)
      P.mats.comp.uniforms.uEye.value.x = 0;
    console.warn("[atmosphere] post " + f + " off: " + why);
  }
  function compShader(flags) {
    const DF = A.postDOF,
      GR = A.postGrade,
      AA = A.postAA;
    let pre = "";
    if (G.QS && G.QS.get("raysdebug")) pre += "#define RAYS_DEBUG\n";
    if (G.QS && G.QS.get("aodebug")) pre += "#define AO_DEBUG\n";
    if (flags.lut) pre += "#define USE_LUT\n";
    if (flags.dof) pre += "#define USE_DOF\n";
    if (flags.eye) pre += "#define USE_EYE\n";
    if (flags.vol) pre += "#define USE_VOL\n";
    if (flags.dist) pre += "#define USE_DIST\n";
    if (flags.vol && G.QS && G.QS.get("voldebug")) pre += "#define VOL_DEBUG\n";
    return (
      pre +
      COMPOSITE.replace("__EYE_GLSL__", flags.eye ? A.postEye.APPLY_GLSL : "")
        .replace("__VOL_GLSL__", flags.vol ? A.postVol.APPLY_GLSL : "")
        .replace("__DISTU_GLSL__", flags.dist ? A.postDistort.GLSL : "")
        .replace("__DIST_GLSL__", flags.dist ? A.postDistort.APPLY_GLSL : "")
        .replace("__LUT_GLSL__", flags.lut ? GR.GLSL : "")
        .replace("__COC_GLSL__", flags.dof ? DF.COC_GLSL : "")
        .replace(
          "__GRAIN_GLSL__",
          AA && !P.fail.grain ? AA.GRAIN_GLSL : GRAIN_FALLBACK,
        )
    );
  }
