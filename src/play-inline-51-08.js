// play-inline-51 08 — three
// Lines 1640-1951 of readable/play-inline-51.pretty.js (statement-aligned).
  function guardMat(m) {
    const g = m.__nrcG;
    if (
      g &&
      m.blending === THREE.CustomBlending &&
      m.blendSrcAlpha === THREE.ZeroFactor &&
      m.blendDstAlpha === THREE.OneFactor
    )
      return;
    const b = m.blending;
    if (
      b === THREE.NoBlending ||
      (!m.transparent && b === THREE.NormalBlending) ||
      (m.userData && m.userData.nrcWriteAlpha)
    )
      return;
    const pm = m.premultipliedAlpha;
    let src,
      dst,
      eq = THREE.AddEquation;
    if (b === THREE.NormalBlending) {
      src = pm ? THREE.OneFactor : THREE.SrcAlphaFactor;
      dst = THREE.OneMinusSrcAlphaFactor;
    } else if (b === THREE.AdditiveBlending) {
      src = pm ? THREE.OneFactor : THREE.SrcAlphaFactor;
      dst = THREE.OneFactor;
    } else if (b === THREE.MultiplyBlending) {
      src = THREE.ZeroFactor;
      dst = THREE.SrcColorFactor;
    } else if (b === THREE.SubtractiveBlending) {
      src = THREE.ZeroFactor;
      dst = THREE.OneMinusSrcColorFactor;
    } else if (b === THREE.CustomBlending) {
      const ea =
        m.blendEquationAlpha !== null && m.blendEquationAlpha !== undefined
          ? m.blendEquationAlpha
          : m.blendEquation;
      if (
        ea !== THREE.AddEquation &&
        ea !== THREE.SubtractEquation &&
        ea !== THREE.ReverseSubtractEquation
      )
        return;
      src = m.blendSrc;
      dst = m.blendDst;
      eq = m.blendEquation;
    } else return;
    m.__nrcG = {
      blending: b,
      blendSrc: m.blendSrc,
      blendDst: m.blendDst,
      blendEquation: m.blendEquation,
      blendSrcAlpha: m.blendSrcAlpha,
      blendDstAlpha: m.blendDstAlpha,
      blendEquationAlpha: m.blendEquationAlpha,
    };
    m.blending = THREE.CustomBlending;
    m.blendSrc = src;
    m.blendDst = dst;
    m.blendEquation = eq;
    m.blendEquationAlpha = THREE.AddEquation;
    m.blendSrcAlpha = THREE.ZeroFactor;
    m.blendDstAlpha = THREE.OneFactor;
  }
  function unguardMat(m) {
    const g = m.__nrcG;
    m.__nrcG = null;
    // restore only if nobody changed the blending while it was guarded
    if (
      m.blending !== THREE.CustomBlending ||
      m.blendSrcAlpha !== THREE.ZeroFactor ||
      m.blendDstAlpha !== THREE.OneFactor
    )
      return;
    m.blending = g.blending;
    m.blendSrc = g.blendSrc;
    m.blendDst = g.blendDst;
    m.blendEquation = g.blendEquation;
    m.blendSrcAlpha = g.blendSrcAlpha;
    m.blendDstAlpha = g.blendDstAlpha;
    m.blendEquationAlpha = g.blendEquationAlpha;
  }
  function installAlphaGuard() {
    const MP = THREE.Material.prototype;
    if (MP._nrcGuard) return;
    const prev = MP.onBeforeRender;
    MP.onBeforeRender = function (
      renderer,
      scene,
      camera,
      geometry,
      object,
      group,
    ) {
      if (P.alphaGuard) {
        if (this.transparent || this.blending !== THREE.NormalBlending)
          guardMat(this);
      } else if (this.__nrcG) unguardMat(this);
      if (prev)
        prev.call(this, renderer, scene, camera, geometry, object, group);
    };
    MP._nrcGuard = true;
  }
  /** Which ShaderMaterials the alpha rule could NOT patch (raw / GLSL3 / no main) — for module owners. */
  A.alphaAudit = () => ({
    patched: AUDIT.patched,
    skipped: AUDIT.skipped.slice(),
  });
  ATMOS.alphaAudit = A.alphaAudit;

  function pass(mat, src, dst, texelOf) {
    const r = G.renderer;
    P.quad.material = mat;
    if (mat.uniforms.tSrc) mat.uniforms.tSrc.value = src.texture;
    if (mat.uniforms.uTexel)
      mat.uniforms.uTexel.value.set(1 / texelOf.width, 1 / texelOf.height);
    r.setRenderTarget(dst);
    r.render(P.qScene, P.qCam);
  }

  // renderer.info normally only reflects the LAST render() call. While our hook runs we let it
  // accumulate over the whole frame (world + viewmodel + post passes) so the smoke test's
  // draw-call / triangle numbers stay meaningful, and ALWAYS restore autoReset afterwards —
  // nothing global is left changed if post-fx dies or is switched off.
  function hook(r) {
    const info = r.info;
    info.autoReset = false;
    info.reset();
    try {
      frameRender(r);
    } finally {
      info.autoReset = true;
    }
    if (A.onFrameRendered) {
      try {
        A.onFrameRendered();
      } catch (e) {
        A.onFrameRendered = null;
      }
    }
  }
  function frameRender(r) {
    if (!P.enabled) {
      G.renderScenes(null);
      return;
    }
    resize();
    const F = P.feat;
    // 1) world + viewmodel → HDR target (depth copied before the transparent pass; alpha guarded)
    if (P.rtDepth && P.depthDirty) {
      const cur = r.getRenderTarget();
      r.setRenderTarget(P.rtDepth);
      r.setRenderTarget(cur);
      P.depthDirty = false;
    }
    const soft = A.softU;
    if (P.rtDepth && !P.depthFailed) {
      P.capArmed = true;
      soft.uSoftInv.value.set(1 / P.rtScene.width, 1 / P.rtScene.height);
      soft.uSoftP.value.set(G.camera.near, G.camera.far, P.depthOK ? 1 : 0, 0);
    }
    if (P.rtVM && P.vmDirty) {
      const cur = r.getRenderTarget();
      r.setRenderTarget(P.rtVM);
      r.setRenderTarget(cur);
      P.vmDirty = false;
    }
    P.vmArmed = !!((P.aoWant || F.dof) && P.rtVM);
    P.vmGot = false;
    P.alphaGuard = true;
    FORCE_A.value = 1;
    try {
      G.renderScenes(P.rtScene);
    } finally {
      P.alphaGuard = false;
      P.capArmed = false;
      P.vmArmed = false;
      FORCE_A.value = 0;
      soft.uSoftP.value.z = 0; // other render passes (reflections, minimap…) never sample a stale depth
    }
    P.depthValid = P.depthOK && !P.depthFailed;
    const prevAuto = r.autoClear;
    r.autoClear = true;
    // 1b) SSAO (half res + 2 blur passes) from the opaque depth copy
    const cu0 = P.mats.comp.uniforms;
    cu0.uAOOn.value = 0;
    cu0.uVMOn.value = 0;
    if (P.aoWant && P.depthValid && !P.aoFailed && P.mats.ao) {
      renderAO(r);
      cu0.uAOOn.value = 1;
      cu0.tDepth.value = P.rtDepth.depthTexture;
    }
    if (P.vmGot) cu0.uVMOn.value = 1;
    // 1c) volumetric light shafts (shadow-map ray march + 2 bilateral blur passes)
    if (cu0.uVolOn) {
      cu0.uVolOn.value = 0;
      if (P.volWant && P.depthValid) renderVol(r, cu0);
    }
    // 2) bloom (Karis bright pass → 13-tap downsamples → tent upsamples; 3 levels on 'low')
    const bloomOn = P.mats.comp.uniforms.uBloom.value > 0.001;
    if (bloomOn) {
      const lv = Math.max(2, Math.min(P.chain.length, F.bloomLv || 4));
      pass(P.mats.bright, P.rtScene, P.rtBright, P.rtScene);
      let src = P.rtBright;
      for (let i = 0; i < lv; i++) {
        pass(P.mats.down, src, P.chain[i], src);
        src = P.chain[i];
      }
      r.autoClear = false;
      for (let i = lv - 1; i > 0; i--) {
        // the widest levels are weighted down (tighter, less milky halos), more so at night (neon)
        P.mats.up.uniforms.uWeight.value =
          i >= 3 ? P.wideW * 0.85 : i === 2 ? P.wideW : 1.0;
        pass(P.mats.up, P.chain[i], P.chain[i - 1], P.chain[i]);
      }
      r.autoClear = true;
    }
    // 2b) light shafts (quarter resolution, only while the sun/moon is near the view)
    const cu = P.mats.comp.uniforms;
    if (P.raysOn) {
      P.mats.rays.uniforms.tSrc.value = P.rtScene.texture;
      P.quad.material = P.mats.rays;
      r.setRenderTarget(P.rtRays);
      r.render(P.qScene, P.qCam);
      cu.tRays.value = P.rtRays.texture;
    } else cu.uRayCol.value.setRGB(0, 0, 0);
    // 2c) depth of field (dialogue only): autofocus → CoC + colour at half res → bokeh gather
    if (cu.uDofOn) cu.uDofOn.value = 0;
    if (F.dof && P.dof && P.depthValid && cu.uDofOn) renderDOF(r, cu);
    // 2d) eye adaptation meter (1×1, reads the HDR scene; no readback)
    if (cu.uEye) {
      cu.uEye.value.x = 0;
      if (F.eye && P.mats.eye && P.rtEye) {
        const em = P.mats.eye,
          eu = em.uniforms,
          prevRT = P.rtEye[P.eyeIdx],
          nextRT = P.rtEye[1 - P.eyeIdx];
        eu.tSrc.value = P.rtScene.texture;
        eu.tPrev.value = prevRT.texture;
        P.quad.material = em;
        r.setRenderTarget(nextRT);
        r.render(P.qScene, P.qCam);
        P.eyeIdx = 1 - P.eyeIdx;
        cu.tEye.value = nextRT.texture;
        cu.uEye.value.x = 1;
      }
    }
    // 3) composite → screen, or → LDR target + FXAA/grain pass → screen
    cu.tScene.value = P.rtScene.texture;
    cu.tBloom.value = P.chain[0].texture;
    if (!cu.tRays.value) cu.tRays.value = P.chain[0].texture;
    P.quad.material = P.mats.comp;
    const aa = !!(F.aa && P.mats.aa);
    if (aa) ensureLDR();
    cu.uOutLuma.value = aa ? 1 : 0;
    cu.uGrain.value = aa ? 0 : P.grain;
    r.setRenderTarget(aa ? P.rtLDR : null);
    r.render(P.qScene, P.qCam);
    if (aa) {
      const au = P.mats.aa.uniforms;
      au.uGrain.value = P.grain;
      au.uTime.value = cu.uTime.value;
      au.uNight.value = cu.uNight.value;
      au.uAA.value = F.fxaa ? 1 : 0;
      au.uSharp.value = F.cas ? P.casAmt : 0;
      pass(P.mats.aa, P.rtLDR, null, P.rtLDR);
    }
    r.autoClear = prevAuto;
    watchFrame(r);
  }

  function renderVol(r, cu) {
    const V = P.vol,
      sun = A.sun,
      cam = G.camera;
    const map = sun && sun.shadow && sun.shadow.map;
    if (!V || !map || !map.texture) return;
    ensureVol(V.div);
    const vu = P.mats.vol.uniforms;
    vu.tShadow.value = map.texture;
    vu.uShadowMat.value.copy(sun.shadow.matrix);
    vu.uInvProj.value.copy(cam.projectionMatrixInverse);
    vu.uCamWorld.value.copy(cam.matrixWorld);
    vu.uCamPos.value.setFromMatrixPosition(cam.matrixWorld);
    vu.uLightDir.value.copy(V.lightDir);
    vu.uVolP.value.set(V.maxDist, V.steps, V.dens, V.H);
    vu.uVolQ.value.set(
      (G.world && G.world.groundY) || 0,
      V.g,
      V.lit0 !== undefined ? V.lit0 : 0.35,
      0,
    ); // outside the shadow box: neutral
    vu.uExt.value = V.ext;
    vu.uLit0.value = V.lit0 !== undefined ? V.lit0 : 0.35;
    vu.tDepth.value = P.rtDepth.depthTexture;
    P.quad.material = P.mats.vol;
    r.setRenderTarget(P.rtVol);
    r.render(P.qScene, P.qCam);
    const b = P.mats.volBlur;
    b.uniforms.uDir.value.set(1, 0);
    pass(b, P.rtVol, P.rtVol2, P.rtVol);
    b.uniforms.uDir.value.set(0, 1);
    pass(b, P.rtVol2, P.rtVol, P.rtVol2);
    cu.tVol.value = P.rtVol.texture;
    cu.uVolTexel.value.set(1 / P.rtVol.width, 1 / P.rtVol.height);
    cu.uVolCol.value.copy(V.col);
    cu.uVolSky.value = V.sky;
    cu.tDepth.value = P.rtDepth.depthTexture;
    cu.uCamNF.value.set(cam.near, cam.far);
    cu.uVolOn.value = 1;
  }

