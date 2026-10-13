// play-inline-51 09 — test
// Lines 1952-2292 of readable/play-inline-51.pretty.js (statement-aligned).
  function renderDOF(r, cu) {
    const D = P.dof,
      m = P.mats;
    ensureDofRTs();
    const cam = G.camera;
    // focus (1×1 ping-pong: temporal smoothing without a readback)
    const fi = P.dofFocusIdx,
      prev = P.rtFocus[fi],
      next = P.rtFocus[1 - fi];
    const fu = m.dofFocus.uniforms;
    fu.tPrev.value = prev.texture;
    fu.uCamNF.value.set(cam.near, cam.far);
    fu.uOverride.value = D.override || 0;
    fu.uFirst.value = A.postDOF.consumeSnap() || G.SHOT ? 1 : 0;
    fu.uK.value = 1 - Math.exp(-(P.rdLast || 0.016) * 6);
    P.quad.material = m.dofFocus;
    r.setRenderTarget(next);
    r.render(P.qScene, P.qCam);
    P.dofFocusIdx = 1 - fi;
    const dv = cu.uDof.value.set(D.far, D.near, D.band, D.all || 0);
    // CoC + colour at half res
    const pu = m.dofPre.uniforms;
    pu.tSrc.value = P.rtScene.texture;
    pu.tFocus.value = next.texture;
    pu.uCamNF.value.set(cam.near, cam.far);
    pu.uDof.value.copy(dv);
    pu.tVM.value = P.rtVM ? P.rtVM.depthTexture : null;
    pu.uVMOn.value = P.vmGot ? 1 : 0;
    P.quad.material = m.dofPre;
    r.setRenderTarget(P.rtDofA);
    r.render(P.qScene, P.qCam);
    // gather
    const bu = m.dofBlur.uniforms;
    bu.uMaxR.value = D.maxR;
    bu.uN.value = D.n;
    pass(m.dofBlur, P.rtDofA, P.rtDofB, P.rtDofA);
    cu.tDof.value = P.rtDofB.texture;
    cu.tFocus.value = next.texture;
    cu.tDepth.value = P.rtDepth.depthTexture;
    cu.uCamNF.value.set(cam.near, cam.far);
    cu.uDofOn.value = 1;
  }

  // ------------------------------------------------------------------
  // Black-frame watchdog: for ~25 s after post-fx (re)builds or changes quality, every 0.5 s read 5
  // pixels of the final frame. Film grain makes an honestly dark frame non-zero somewhere, so 5
  // exact-zero pixels 3 times in a row means a pass is producing garbage (NaN, driver bug):
  // first strip down to the minimal composite, then — if it is still black — plain rendering.
  // ------------------------------------------------------------------
  const _px = new Uint8Array(4);
  function armWatch() {
    const W = P.watch;
    W.until = (A.realTime || 0) + 25;
    W.next = (A.realTime || 0) + 2;
    W.zero = 0;
  }
  function watchFrame(r) {
    const W = P.watch,
      t = A.realTime || 0;
    if (t > W.until || t < W.next || P.grain < 0.004) return;
    const st = G.state;
    if (
      st !== "play" ||
      P.dead > 0.05 ||
      P.flashAmt > 0.05 ||
      P.menu > 0.05 ||
      (G.player && !G.player.alive)
    )
      return;
    W.next = t + 0.5;
    try {
      const gl = r.getContext();
      const cw = gl.drawingBufferWidth,
        ch = gl.drawingBufferHeight;
      let zero = 0;
      const pts = [
        [0.5, 0.5],
        [0.25, 0.3],
        [0.75, 0.3],
        [0.3, 0.7],
        [0.7, 0.7],
      ];
      for (const p of pts) {
        gl.readPixels(
          (cw * p[0]) | 0,
          (ch * p[1]) | 0,
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          _px,
        );
        if (_px[0] === 0 && _px[1] === 0 && _px[2] === 0) zero++;
      }
      W.zero = zero === pts.length ? W.zero + 1 : 0;
      if (W.zero < 3) return;
      W.zero = 0;
      if (W.stage === 0) {
        W.stage = 1;
        console.warn(
          "[atmosphere] black frame detected: post-fx stripped to the minimal composite",
        );
        for (const f of ["dof", "lut", "aa", "ao", "eye", "vol", "heat"])
          if (!P.fail[f]) dropFeature(f, "black-frame watchdog");
        P.rayOpt = false;
        const old = P.mats.comp;
        buildComposite(P.w, P.h);
        P.quad.material = P.mats.comp;
        applyGrade(P.grade, true);
        if (old && old !== P.mats.comp) old.dispose();
        P.sw = 0;
        resize();
        armWatch();
      } else {
        console.warn("[atmosphere] black frame persists: plain rendering");
        P.failed = true;
        enable(false);
      }
    } catch (e) {
      W.until = 0;
    }
  }

  function applyGrade(name, snap) {
    const g = GRADES[name] || GRADES.olive;
    P.grade = GRADES[name] ? name : "olive";
    ATMOS.grading = P.grade;
    if (!P.mats.comp) return;
    const u = P.mats.comp.uniforms;
    u.uSat.value = g.sat;
    u.uContrast.value = g.contrast;
    u.uLift.value.fromArray(g.lift);
    u.uNightLift.value.fromArray(g.nightLift || [0, 0, 0]);
    u.uGamma.value.fromArray(g.gamma);
    u.uGain.value.fromArray(g.gain);
    u.uShadowTint.value.fromArray(g.shadowTint);
    u.uHighTint.value.fromArray(g.highTint);
    P.baseBloom = g.bloom;
    if (snap) {
      const L = P.lut;
      L.a = P.grade;
      L.b = null;
      L.mix = 0;
      lutBind();
    }
  }
  // LUT cross-fade state → uniforms. Target look = user grade, or a context look (cryo-unit interiors)
  // mixed in by weight; any change blends over L.dur seconds.
  function lutBind() {
    const u = P.mats.comp && P.mats.comp.uniforms,
      GR = A.postGrade;
    if (!u || !u.tLutA || !GR) return;
    const L = P.lut;
    u.tLutA.value = GR.lut(L.a);
    u.tLutB.value = GR.lut(L.b || L.a);
    u.uLutMix.value = L.b ? L.mix : 0;
  }
  function lutTarget() {
    const L = P.lut;
    return L.ctx && L.ctxW > 0.5 ? L.ctx : P.grade;
  }
  function lutUpdate(rd) {
    const L = P.lut;
    if (!P.feat.lutShader) return;
    const tgt = lutTarget();
    if (!L.b) {
      if (tgt !== L.a) {
        L.b = tgt;
        L.mix = 0;
      }
    } else if (tgt !== L.b) {
      if (tgt === L.a) {
        L.a = L.b;
        L.b = tgt;
        L.mix = 1 - L.mix;
      } else if (L.mix < 0.5) {
        L.b = tgt;
      } else {
        L.a = L.b;
        L.b = tgt;
        L.mix = 0;
      }
    }
    if (L.b) {
      L.mix =
        A.envSnap || G.SHOT
          ? 1
          : Math.min(1, L.mix + rd / Math.max(0.05, L.dur));
      if (L.mix >= 1) {
        L.a = L.b;
        L.b = null;
        L.mix = 0;
      }
    }
    lutBind();
  }

  function enable(on) {
    on = !!on && !P.failed;
    if (on && !P.rtScene) {
      try {
        build();
      } catch (e) {
        P.failed = true;
        on = false;
        console.warn("[atmosphere] post-fx disabled: " + (e && e.message));
      }
    }
    P.enabled = on;
    G.renderHook = on ? hook : null;
  }

  // ------------------------------------------------------------------
  function init() {
    // the world's colour grade is fixed to teal (not player-selectable); clear any old saved choice
    P.grade = "teal";
    try {
      localStorage.removeItem("nrc_grading");
    } catch (e) {
      /* ignore */
    }
    ATMOS.grading = P.grade;
    let want = A.quality !== "low";
    // post quality: explicit setting (nrc_postq) wins, else it follows the graphics quality
    P.postQ = A.quality === "low" ? 0 : A.quality === "medium" ? 1 : 2;
    try {
      const pq = POSTQ.indexOf(localStorage.getItem("nrc_postq"));
      if (pq >= 0) {
        P.postQ = pq;
        want = true;
      }
    } catch (e) {
      /* ignore */
    }
    if (G.QS && POSTQ.indexOf(G.QS.get("postq")) >= 0) {
      P.postQ = POSTQ.indexOf(G.QS.get("postq"));
      want = true;
    }
    ATMOS.postQuality = POSTQ[P.postQ];
    try {
      if (localStorage.getItem("nrc_postfx") === "0") want = false;
    } catch (e) {
      /* ignore */
    }
    if (G.QS && G.QS.get("postfx") === "0") want = false;
    if (!capable()) {
      P.failed = true;
      want = false;
      console.warn(
        "[atmosphere] no renderable half-float targets: plain rendering",
      );
    }
    try {
      if (localStorage.getItem("nrc_dynres") === "0") P.dyn.on = false;
    } catch (e) {
      /* ignore */
    }
    const qd = G.QS && G.QS.get("dynres");
    if (qd === "0") P.dyn.on = false;
    else if (qd && isFinite(+qd) && +qd >= 0.3 && +qd < 1) P.dyn.fixed = +qd; // testing: fixed render scale
    ATMOS.perfTier = -1;
    setTier();
    try {
      installAlphaGuard();
    } catch (e) {
      /* plain three state: no guard */
    }
    // testing: ?postoff=pud,water,rays switches single post features off (shots / A-B comparisons)
    const off = (G.QS && G.QS.get("postoff")) || "";
    if (off) {
      if (/pud/.test(off)) P.puddleOpt = false;
      if (/water/.test(off)) P.waterOpt = false;
      if (/rays/.test(off)) P.rayOpt = false;
      if (/ao/.test(off)) P.aoOpt = false;
      if (/aa/.test(off)) P.aaOpt = false;
      if (/dof/.test(off)) P.dofOpt = false;
      if (/cas|sharp/.test(off)) P.casOpt = false;
      if (/eye/.test(off)) P.eyeOpt = false;
      if (/vol/.test(off)) P.volOpt = false;
      if (/lut/.test(off)) P.fail.lut = "postoff";
      if (/grain/.test(off)) P.grain = 0;
    }
    // testing: ?postdof=2.5 forces a 2.5 m focus distance (dialogue-style depth of field in shots)
    const fd = G.QS && +G.QS.get("postdof");
    if (fd > 0 && A.postDOF) A.postDOF.force(fd);
    // testing: ?postfail=dof,aa,lut,comp simulates shader compile failures (fallback checks)
    const pf = (G.QS && G.QS.get("postfail")) || "";
    if (pf) {
      const _v = A.validateMaterial;
      A.validateMaterial = function (m, g) {
        const fs = (m && m.fragmentShader) || "";
        // (match DEFINITIONS, not call sites: the composite source always contains the #ifdef'd calls)
        if (
          /dof/.test(pf) &&
          (fs.indexOf("float dofCoc(") >= 0 ||
            fs.indexOf("uOverride") >= 0 ||
            fs.indexOf("scatter-as-gather") >= 0)
        )
          return false;
        if (/aa/.test(pf) && fs.indexOf("stepQ") >= 0) return false;
        if (
          /eye/.test(pf) &&
          (fs.indexOf("uKUp") >= 0 || fs.indexOf("float eyeFactor(") >= 0)
        )
          return false;
        if (/lut/.test(pf) && fs.indexOf("vec3 lutSample(") >= 0) return false;
        if (/comp/.test(pf) && fs.indexOf("uOutLuma") >= 0) return false;
        if (
          /vol/.test(pf) &&
          (fs.indexOf("float shadowLit(") >= 0 ||
            fs.indexOf("float volAt(") >= 0)
        )
          return false;
        if (/heat/.test(pf) && fs.indexOf("vec2 nrcDistort(") >= 0)
          return false;
        return _v.call(this, m, g);
      };
      A._postFailTest = pf;
    }
    enable(want);
    G.events.on("playerDamaged", (amt) => {
      P.damage = Math.min(1, P.damage + 0.3 + (amt || 0) / 30);
    });
    // crippled limb: a sharp red throb even at high HP
    G.events.on("limbCrippled", () => {
      P.damage = Math.min(1, P.damage + 0.8);
      P.beatPh = 0;
    });
    G.events.on("radsChanged", (rads, amt) => {
      if (amt > 0) P.rad = Math.min(1, P.rad + amt * 0.08);
    });
    G.events.on("resize", () => resize());
    G.events.on("reset", () => {
      P.damage = 0;
      P.rad = 0;
      P.dead = 0;
      P.flashAmt = 0;
      if (A.postDistort) A.postDistort.reset();
    });
  }

