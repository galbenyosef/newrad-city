// play-inline-54 02 — actor
// Lines 25-214 of readable/play-inline-54.pretty.js (statement-aligned).
  const A = G.atmos._;

  // CoC (0..1) of a view depth z for focus f. uDof: x far gain, y near gain, z in-focus band (fraction
  // of f), w "blur everything" floor (menus)
  const COC_GLSL = `
    float dofCoc(float z, float f, vec4 k){
      float band = k.z * f;
      float far = clamp((z - (f + band)) / max(z, 1e-3) * k.x, 0.0, 1.0);
      float near = clamp(((f - band) - z) / max(z, 1e-3) * k.y, 0.0, 1.0);
      return max(max(far, near), k.w);
    }
  `;

  const FOCUS = `
    uniform sampler2D tDepth, tPrev; uniform vec2 uCamNF; uniform float uK, uOverride, uFirst;
    varying vec2 vUv;
    float linZ(float d){ float z = d * 2.0 - 1.0; return 2.0 * uCamNF.x * uCamNF.y / (uCamNF.y + uCamNF.x - z * (uCamNF.y - uCamNF.x)); }
    void main(){
      float f = 1e5;
      // nearest surface in a small centre cross (≈ 8 % of the frame): the NPC / target the camera frames
      for (int i = 0; i < 9; i++) {
        float a = float(i) * 2.39996; float r = i == 0 ? 0.0 : 0.012 + 0.03 * float(i) / 8.0;
        vec2 uv = vec2(0.5) + vec2(cos(a) * 0.6, sin(a)) * r;
        float d = texture2D(tDepth, uv).r;
        if (d < 0.99999) f = min(f, linZ(d));
      }
      if (f > 9e4) f = 400.0;
      if (uOverride > 0.0) f = uOverride;
      float p = texture2D(tPrev, vec2(0.5)).r;
      gl_FragColor = vec4(uFirst > 0.5 || p <= 0.0 ? f : mix(p, f, uK), 0.0, 0.0, 1.0);
    }
  `;

  const PRE = `
    uniform sampler2D tSrc, tDepth, tFocus, tVM; uniform vec2 uCamNF; uniform vec4 uDof; uniform float uVMOn;
    varying vec2 vUv;
    ${COC_GLSL}
    float linZ(float d){ float z = d * 2.0 - 1.0; return 2.0 * uCamNF.x * uCamNF.y / (uCamNF.y + uCamNF.x - z * (uCamNF.y - uCamNF.x)); }
    void main(){
      vec3 c = texture2D(tSrc, vUv).rgb;                  // bilinear at the half-res centre = 2×2 box
      #if __VERSION__ >= 300
        if (any(isnan(c)) || any(isinf(c))) c = vec3(0.0);  // (non-finite half-float overflow → no NaN bokeh)
      #endif
      c = clamp(c, 0.0, 60000.0);
      c *= 1.0 / (1.0 + max(max(c.r, max(c.g, c.b)) - 6.0, 0.0) * 0.25);   // tame fireflies (no flickering bokeh)
      float d = texture2D(tDepth, vUv).r;
      float f = texture2D(tFocus, vec2(0.5)).r;
      float k = dofCoc(d >= 0.99999 ? 1e5 : linZ(d), f, uDof);
      if (uVMOn > 0.5 && texture2D(tVM, vUv).r < 0.99999) k = 0.0;
      gl_FragColor = vec4(c, k);
    }
  `;

  const BLUR = `
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uMaxR, uN;
    varying vec2 vUv;
    void main(){
      vec4 c0 = texture2D(tSrc, vUv);
      float r0 = c0.a * uMaxR;
      vec3 acc = c0.rgb; float ws = 1.0;
      if (r0 > 0.5) {
        for (int i = 0; i < 48; i++) {
          if (float(i) >= uN) break;
          float t = sqrt((float(i) + 0.5) / uN);
          float a = float(i) * 2.39996323;
          float dist = t * r0;
          vec4 s = texture2D(tSrc, vUv + vec2(cos(a), sin(a)) * dist * uTexel);
          float rs = s.a * uMaxR;
          // scatter-as-gather: a tap counts only if its own disc reaches this pixel (in-focus taps
          // never smear onto the background) and never further than this pixel's own disc
          float w = clamp(min(r0, rs) - dist + 1.0, 0.0, 1.0);
          // bright taps weigh a little more → round, luminous bokeh on lamps and neon
          w *= 1.0 + 0.35 * clamp(max(s.r, max(s.g, s.b)) - 1.0, 0.0, 3.0);
          acc += s.rgb * w; ws += w;
        }
      }
      gl_FragColor = vec4(acc / ws, c0.a);
    }
  `;

  // ------------------------------------------------------------------
  // Controller: which situation wants DOF and how strong. Returns {amt, far, near, band, maxR, override, all}.
  // ------------------------------------------------------------------
  const S = {
    amt: 0,
    cur: "none",
    dlgActor: null,
    forced: -1,
    focusSnap: true,
  };
  const _v = new THREE.Vector3();
  const PROFILES = {
    // dialogue close-up — body in focus, everything a few metres behind soft
    dialogue: { far: 1.9, near: 1.2, band: 0.18, maxR: 9, all: 0 },
    // forced (testing / cutscenes via setDOF)
    forced: { far: 1.6, near: 1.0, band: 0.2, maxR: 8, all: 0 },
  };
  function speakerDistance() {
    let actor = S.dlgActor;
    try {
      if (
        !actor &&
        G.dialogue &&
        !G.isStub("dialogue") &&
        typeof G.dialogue.current === "function"
      ) {
        const c = G.dialogue.current();
        actor = c && c.actor;
      }
    } catch (e) {
      actor = null;
    }
    const p =
      actor &&
      (actor.pos ||
        (actor.root && actor.root.position) ||
        (actor.char && actor.char.root && actor.char.root.position));
    if (!p || !G.camera || typeof p.x !== "number") return 0;
    const h = actor.height || (actor.char && actor.char.height) || 1.75;
    _v.set(p.x, p.y + h * 0.88, p.z); // head height
    const d = _v.distanceTo(G.camera.position);
    return d > 0.3 && d < 60 ? d : 0;
  }
  /** Per-frame: decide the DOF profile. rd = real dt. */
  function want(env, rd) {
    const st = G.state;
    let prof = null,
      override = 0;
    if (S.forced > 0) {
      prof = PROFILES.forced;
      override = S.forced;
    } else if (st === "dialogue") {
      prof = PROFILES.dialogue;
      override = speakerDistance();
    }
    const name = prof ? (S.forced > 0 ? "forced" : st) : "none";
    if (name !== S.cur && prof) {
      if (S.cur === "none") S.focusSnap = true;
      S.cur = name;
      S.prof = prof;
    }
    if (!prof) S.cur = "none";
    S.amt = A.damp(S.amt, prof ? 1 : 0, prof ? 5 : 7, rd || 0.016);
    if (A.envSnap || G.SHOT) S.amt = prof ? 1 : 0;
    if (S.amt < 0.01) {
      S.amt = prof ? S.amt : 0;
      return null;
    }
    const p = S.prof || PROFILES.dialogue;
    return {
      amt: S.amt,
      far: p.far,
      near: p.near,
      band: p.band,
      maxR: p.maxR * S.amt,
      override,
      all: p.all,
    };
  }

  G.events.on("dialogueStart", (actor) => {
    S.dlgActor = actor || null;
  });
  G.events.on("dialogueEnd", () => {
    S.dlgActor = null;
  });
  G.events.on("reset", () => {
    S.dlgActor = null;
    S.amt = 0;
    S.cur = "none";
  });

  A.postDOF = {
    FOCUS,
    PRE,
    BLUR,
    COC_GLSL,
    want,
    S,
    /** force a focus distance (m) for cutscenes / testing; 0 or null = automatic */
    force(dist) {
      S.forced = dist > 0 ? dist : -1;
      S.focusSnap = true;
    },
    consumeSnap() {
      const s = S.focusSnap;
      S.focusSnap = false;
      return s;
    },
  };
