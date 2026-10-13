// play-inline-51 04 — three
// Lines 604-792 of readable/play-inline-51.pretty.js (statement-aligned).
  const P = {
    enabled: false,
    failed: false,
    msaa: 0,
    rtScene: null,
    rtBright: null,
    chain: [],
    rtRays: null,
    wideW: 0.9,
    raysOn: false,
    rayK: 0,
    quad: null,
    qScene: null,
    qCam: null,
    mats: {},
    grade: "teal",
    hurt: 0,
    damage: 0,
    rad: 0,
    menu: 0,
    dead: 0,
    flashAmt: 0,
    flashDecay: 2,
    flashCol: new THREE.Color(1, 1, 1),
    fpsLow: 0,
    w: 0,
    h: 0,
    sw: 0,
    sh: 0,
    beatPh: 0,
    vig: 0.42,
    vigCur: 0.42,
    // dynamic resolution (scene + bloom targets scale 0.6..1.0 from a 1 s frame-time average, target 16.6 ms)
    dyn: {
      on: true,
      fixed: 0,
      scale: 1,
      min: 0.6,
      max: 1.0,
      target: 22.2, // 45 fps floor: a 16.6 ms target never registers as 'comfortable' on a vsync'd 60 Hz display (frames average 17–19 ms), so the scale/tier ratcheted down after the load hitch and never came back — 60% resolution, tier 2, window interiors off (user report 2026-09-27)
      acc: 0,
      n: 0,
      warm: 0,
      avgMs: 16.6,
      upWins: 0,
      upNeed: 3,
      prevScale: 1,
      prevMs: 0,
      noGain: 0,
      cpuHold: 0,
      slowWins: 0,
      fastWins: 0,
      dynTier: 0,
    },
    // post quality (render_post): 0 low, 1 medium, 2 high, 3 ultra; `level` = effective (capped by the live perf tier)
    postQ: 2,
    level: 2,
    feat: {},
    fail: {},
    grain: 0.035,
    // LUT grading cross-fade
    lut: {
      on: false,
      a: "olive",
      b: null,
      mix: 0,
      dur: 1.2,
      ctx: null,
      ctxW: 0,
    },
    // depth of field
    dof: null,
    dofFocusIdx: 0,
    // black-frame watchdog
    watch: { until: 0, next: 0, zero: 0, stage: 0 },
  };
  const TIER_LOD = [1, 0.8, 0.65];
  const POSTQ = ["low", "medium", "high", "ultra"];
  // per-level pass settings (see NOTES.md "Post-processing stack v2")
  const QSET = [
    /* low    */ {
      bloomLv: 3,
      karis: 1,
      ao: 0,
      aoN: 0,
      vol: false,
      rays: false,
      water: false,
      pud: false,
      dofN: 12,
      aa: "fxaa",
      msaa: false,
      cas: 0.3,
    },
    /* medium */ {
      bloomLv: 4,
      karis: 1,
      ao: 1,
      aoN: 8,
      vol: true,
      rays: true,
      water: true,
      pud: true,
      dofN: 20,
      aa: "fxaa",
      msaa: false,
      cas: 0.45,
    },
    /* high   */ {
      bloomLv: 4,
      karis: 1,
      ao: 1,
      aoN: 12,
      vol: true,
      rays: true,
      water: true,
      pud: true,
      dofN: 28,
      aa: "auto",
      msaa: true,
      cas: 0.5,
    },
    /* ultra  */ {
      bloomLv: 4,
      karis: 1,
      ao: 1,
      aoN: 16,
      vol: true,
      rays: true,
      water: true,
      pud: true,
      dofN: 40,
      aa: "fxaa",
      msaa: true,
      cas: 0.55,
    },
  ];
  A.post = P;
  const _sunV = new THREE.Vector3(),
    _hz = new THREE.Vector3();

  function capable() {
    const r = G.renderer;
    if (!r || !r.capabilities) return false;
    if (r.capabilities.isWebGL2) {
      return (
        r.extensions.has("EXT_color_buffer_float") ||
        r.extensions.has("EXT_color_buffer_half_float")
      );
    }
    return (
      r.extensions.has("OES_texture_half_float") &&
      r.extensions.has("EXT_color_buffer_half_float")
    );
  }

  function mkRT(w, h, opts) {
    const rt = new THREE.WebGLRenderTarget(
      Math.max(1, w),
      Math.max(1, h),
      Object.assign(
        {
          type: THREE.HalfFloatType,
          format: THREE.RGBAFormat,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: false,
          stencilBuffer: false,
          generateMipmaps: false,
        },
        opts || {},
      ),
    );
    rt.texture.generateMipmaps = false;
    return rt;
  }

  function sizes() {
    const v = G.renderer.getDrawingBufferSize(new THREE.Vector2());
    return { w: Math.max(2, v.x | 0), h: Math.max(2, v.y | 0) };
  }

  function sceneSize(w, h) {
    const k = P.dyn.fixed || P.dyn.scale;
    return {
      sw: Math.max(2, Math.round(w * k)),
      sh: Math.max(2, Math.round(h * k)),
    };
  }
