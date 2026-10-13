// play-inline-51 07 — the
// Lines 1351-1639 of readable/play-inline-51.pretty.js (statement-aligned).
  function dynUpdate(realDt, st) {
    const D = P.dyn;
    if (
      !D.on ||
      D.fixed ||
      G.SMOKE ||
      G.SHOT ||
      st !== "play" ||
      document.hidden
    ) {
      D.acc = 0;
      D.n = 0;
      D.warm = 0;
      return;
    }
    D.warm += realDt;
    if (D.warm < 3) return; // let the level settle (shader compiles, streaming)
    const ms = realDt * 1000;
    if (ms > 120) return;
    D.acc += ms;
    D.n++;
    if (D.acc < 1000) return;
    const avg = D.acc / D.n;
    D.acc = 0;
    D.n = 0;
    D.avgMs = avg;
    D.cpuHold = Math.max(0, D.cpuHold - 1);
    // did the last down-step help?
    if (D.prevMs > 0) {
      if (avg > D.prevMs * 0.97 && D.scale < D.prevScale) {
        if (++D.noGain >= 2) {
          setScale(D.prevScale);
          D.cpuHold = 20;
          D.noGain = 0;
        }
      } else D.noGain = 0;
      D.prevMs = 0;
    }
    const over = avg > D.target * 1.1,
      ok = avg < D.target * 1.05;
    if (over && D.scale > D.min && D.cpuHold === 0) {
      D.prevScale = D.scale;
      D.prevMs = avg;
      setScale(D.scale * clamp(Math.sqrt(D.target / avg), 0.8, 0.95));
      if (D.upWins < 0) D.upNeed = Math.min(24, D.upNeed * 2); // we just grew into this → wait longer next time
      D.upWins = 0;
    } else if (ok && D.scale < D.max) {
      if (++D.upWins >= D.upNeed) {
        setScale(D.scale + 0.1);
        D.upWins = -1;
      }
    } else if (!over && D.upWins < 0) {
      D.upWins = 0;
      D.upNeed = Math.max(3, D.upNeed - 1);
    }
    // tier: sustained overload even at reduced scale → step down a tier; recover slowly
    D.slowWins = over ? D.slowWins + 1 : 0;
    D.fastWins = ok ? D.fastWins + 1 : 0;
    let t = D.dynTier;
    if (
      t < 2 &&
      D.slowWins >= 3 &&
      (D.scale <= (t === 0 ? 0.85 : 0.65) || D.cpuHold > 0)
    ) {
      t++;
      D.slowWins = 0;
    } else if (t > 0 && D.fastWins >= 8 && D.scale >= (t === 2 ? 0.75 : 0.9)) {
      t--;
      D.fastWins = 0;
    }
    if (t !== D.dynTier) {
      D.dynTier = t;
      setTier();
    }
  }

  // ------------------------------------------------------------------
  // Scene depth for soft particles + puddle reflections (WebGL2 only). An invisible, zero-length
  // draw sorted FIRST in the transparent list blits the opaque depth (MSAA-resolved) into a
  // DepthTexture right before smoke/fire/glows render; nothing is drawn twice. The GL bindings are
  // restored exactly (three's state cache stays valid). A blit error switches the feature off.
  // ------------------------------------------------------------------
  function buildDepthCapture(sw, sh) {
    const r = G.renderer;
    if (
      !r.capabilities.isWebGL2 ||
      P.depthFailed ||
      (G.QS && G.QS.get("softdepth") === "0")
    )
      return;
    const dt = new THREE.DepthTexture(sw, sh, THREE.UnsignedIntType);
    dt.minFilter = dt.magFilter = THREE.NearestFilter;
    P.rtDepth = new THREE.WebGLRenderTarget(sw, sh, {
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false,
      depthTexture: dt,
    });
    P.rtDepth.texture.generateMipmaps = false;
    P.depthDirty = true;
    P.depthOK = false;
    P.depthChecks = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(9), 3),
    );
    g.setDrawRange(0, 0);
    const m = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      colorWrite: false,
    });
    m.name = "atmos_depth_capture";
    const cap = new THREE.Mesh(g, m);
    cap.name = "atmos_depth_capture";
    cap.frustumCulled = false;
    cap.renderOrder = -1e9;
    cap.onBeforeRender = captureDepth;
    G.scene.add(cap);
    P.depthCap = cap;
    A.softU.tSoftDepth.value = dt;
  }
  // Viewmodel mask for the SSAO: core renders the gun/hands after clearing depth, so a blit of the
  // depth buffer at the END of the viewScene pass (zero-length draw sorted last) holds only the
  // viewmodel → the composite leaves those pixels alone (no world creases printed onto the gun).
  function buildViewDepthCapture(sw, sh) {
    if (!G.viewScene) return;
    const dt = new THREE.DepthTexture(sw, sh, THREE.UnsignedIntType);
    dt.minFilter = dt.magFilter = THREE.NearestFilter;
    P.rtVM = new THREE.WebGLRenderTarget(sw, sh, {
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false,
      depthTexture: dt,
    });
    P.rtVM.texture.generateMipmaps = false;
    P.vmDirty = true;
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(9), 3),
    );
    g.setDrawRange(0, 0);
    const m = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      colorWrite: false,
    });
    m.name = "atmos_vm_depth_capture";
    const cap = new THREE.Mesh(g, m);
    cap.name = "atmos_vm_depth_capture";
    cap.frustumCulled = false;
    cap.renderOrder = 1e9;
    cap.onBeforeRender = captureViewDepth;
    G.viewScene.add(cap);
    P.vmCap = cap;
  }
  function captureViewDepth(r, scene, camera) {
    if (
      !P.vmArmed ||
      camera !== G.viewCamera ||
      r.getRenderTarget() !== P.rtScene
    )
      return;
    P.vmArmed = false;
    const gl = r.getContext();
    const fb = r.properties.get(P.rtVM).__webglFramebuffer;
    if (!fb) return;
    const rd = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING),
      dr = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);
    const w = P.rtScene.width,
      h = P.rtScene.height;
    if (P.vmChecks < 3)
      while (gl.getError() !== gl.NO_ERROR) {
        /* flush stale errors */
      }
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, dr);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fb);
    gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.DEPTH_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, rd);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dr);
    if (
      (P.vmChecks = (P.vmChecks || 0) + 1) <= 3 &&
      gl.getError() !== gl.NO_ERROR
    ) {
      dropAO("viewmodel depth copy failed");
      return;
    }
    P.vmGot = true;
  }
  function dropAO(why) {
    P.aoFailed = true;
    if (P.mats.comp) P.mats.comp.uniforms.uAOOn.value = 0;
    console.warn("[atmosphere] SSAO off: " + why);
  }
  function renderAO(r) {
    const m = P.mats.ao;
    P.quad.material = m;
    r.setRenderTarget(P.rtAO);
    r.render(P.qScene, P.qCam);
    const b = P.mats.aoBlur;
    b.uniforms.uDir.value.set(1, 0);
    pass(b, P.rtAO, P.rtAO2, P.rtAO);
    b.uniforms.uDir.value.set(0, 1);
    pass(b, P.rtAO2, P.rtAO, P.rtAO2);
  }
  function captureDepth(r, scene, camera) {
    if (!P.capArmed || camera !== G.camera || r.getRenderTarget() !== P.rtScene)
      return;
    P.capArmed = false;
    const gl = r.getContext();
    const fb = r.properties.get(P.rtDepth).__webglFramebuffer;
    if (!fb) return;
    const rd = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING),
      dr = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);
    const w = P.rtScene.width,
      h = P.rtScene.height;
    if (P.depthChecks < 3)
      while (gl.getError() !== gl.NO_ERROR) {
        /* flush stale errors */
      }
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, dr);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fb);
    gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.DEPTH_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, rd);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dr);
    if (P.depthChecks < 3) {
      P.depthChecks++;
      if (gl.getError() !== gl.NO_ERROR) {
        P.depthFailed = true;
        P.depthOK = false;
        A.softU.uSoftP.value.z = 0;
        console.warn("[atmosphere] depth copy unsupported: soft particles off");
        return;
      }
    }
    P.depthOK = true;
    A.softU.uSoftP.value.z = 1;
  }

  // ------------------------------------------------------------------
  // ALPHA CHANNEL RULE of the HDR target. Alpha carries three tags: the sky mask (0), the water
  // reflectivity tag (0.3..0.65) and the puddle tag (0.87..0.97); everything else must read 1.
  // Two public-API mechanisms enforce it while (and only while) the world renders into that target:
  //  1) OPAQUE ShaderMaterials (any module) get their final alpha forced to 1: ShaderMaterial's
  //     onBeforeCompile wraps `main()` and adds `gl_FragColor.a = mix(a, 1, nrcForceA)` under three's
  //     own OPAQUE define (part of the program cache key, so transparent variants are untouched).
  //     nrcForceA is a shared uniform that is 1 only during the HDR world pass → offscreen passes of
  //     other modules (texture bakes, minimaps) keep their alpha. Opt-out for real taggers (sky,
  //     water): `defines: { NRC_WRITE_ALPHA: 1 }`. Not covered (see alphaAudit): RawShaderMaterial,
  //     GLSL3 shaders, materials with their own onBeforeCompile.
  //  2) BLENDED draws (smoke, glows, rain, other modules' sprites) keep the destination alpha:
  //     Material.onBeforeRender switches them to the equivalent CustomBlending with alpha factors
  //     (ZERO, ONE) during the HDR pass and restores the author's blend settings outside it.
  //     Opt-out: material.userData.nrcWriteAlpha = true.
  // ------------------------------------------------------------------
  const FORCE_A = { value: 0 };
  const MAIN_RE = /\bvoid\s+main\s*\(\s*(?:void)?\s*\)/g;
  const AUDIT = { patched: 0, skipped: [] };
  function auditSkip(m, why) {
    if (AUDIT.skipped.length < 40)
      AUDIT.skipped.push((m.name || m.type) + ": " + why);
  }
  (function patchShaderMaterials() {
    const SMP = THREE.ShaderMaterial && THREE.ShaderMaterial.prototype;
    if (!SMP || SMP._nrcAlpha) return;
    SMP.onBeforeCompile = function nrcOpaqueAlpha(shader) {
      try {
        if (this.isRawShaderMaterial) return auditSkip(this, "raw");
        if (this.glslVersion === THREE.GLSL3) return auditSkip(this, "glsl3");
        const fs = shader.fragmentShader;
        if (typeof fs !== "string" || fs.indexOf("nrc_main") >= 0) return;
        const hits = fs.match(MAIN_RE);
        if (!hits || hits.length !== 1 || fs.indexOf("gl_FragData") >= 0)
          return auditSkip(this, "main() not found");
        shader.uniforms.nrcForceA = FORCE_A;
        shader.fragmentShader =
          fs.replace(MAIN_RE, "uniform float nrcForceA;\nvoid nrc_main()") +
          "\nvoid main(){\n  nrc_main();\n#if defined(OPAQUE) && !defined(NRC_WRITE_ALPHA)\n  gl_FragColor.a = mix(gl_FragColor.a, 1.0, nrcForceA);\n#endif\n}\n";
        AUDIT.patched++;
      } catch (e) {
        /* leave the shader as authored */
      }
    };
    SMP._nrcAlpha = true;
  })();
