// play-inline-23 02 — gain
// Lines 371-719 of readable/play-inline-23.pretty.js (statement-aligned).
  KP.to = function (node, g) {
    if (g !== undefined) {
      const gg = this.gain(g);
      node.connect(gg);
      gg.connect(this.out);
      return gg;
    }
    node.connect(this.out);
    return node;
  };
  /**
   * Automation: pts = [[time, value, mode]] with mode 'l' linear, 'e' exponential (default), 's' set, 't' target(τ=4th el).
   * First point is always a set.
   */
  KP.env = function (param, pts) {
    const t = this.t;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i],
        time = t + p[0],
        v = p[1],
        m = p[2] || "e";
      if (i === 0 || m === "s") param.setValueAtTime(v, time);
      else if (m === "l") param.linearRampToValueAtTime(v, time);
      else if (m === "t")
        param.setTargetAtTime(v, t + pts[i - 1][0], p[3] || 0.05);
      else
        param.exponentialRampToValueAtTime(
          Math.max(Math.abs(v), 1e-5) * (v < 0 ? -1 : 1),
          time,
        );
    }
    return param;
  };
  /** Percussive envelope on a gain param: silent → peak in `a` → decays to ~0 over `d`. */
  KP.perc = function (param, start, peak, a, d, curve) {
    const t = this.t + start;
    param.setValueAtTime(0.00001, t);
    if (a > 0.0005) param.exponentialRampToValueAtTime(peak, t + a);
    else param.setValueAtTime(peak, t);
    if (curve === "lin") param.linearRampToValueAtTime(0.00001, t + a + d);
    else param.setTargetAtTime(0.00001, t + a, d / 4.5);
    return param;
  };
  /** Noise burst through a filter with a percussive envelope → out. Returns the envelope gain. */
  KP.burst = function (o) {
    // o: {kind, start, a, d, peak, type, f, q, f2 (filter sweep target), rate, dest, shaper}
    const s = this.noise(
      o.kind || "white",
      o.start || 0,
      (o.a || 0.001) + (o.d || 0.1) * 1.6 + 0.05,
      o.rate,
    );
    const f = this.filt(
      o.type || "bandpass",
      o.f || 1000,
      o.q === undefined ? 1 : o.q,
    );
    if (o.f2)
      this.env(f.frequency, [
        [o.start || 0, o.f],
        [(o.start || 0) + (o.fT || o.d || 0.1), o.f2],
      ]);
    const g = this.gain(0);
    this.perc(
      g.gain,
      o.start || 0,
      o.peak === undefined ? 1 : o.peak,
      o.a || 0.001,
      o.d || 0.1,
      o.curve,
    );
    let last = this.chain(s, f, g);
    if (o.shaper) last = this.chain(last, this.shaper(o.shaper, o.shaperKind));
    if (o.f3) {
      const f3 = this.filt(o.f3type || "lowpass", o.f3, o.q3 || 0.7);
      last = this.chain(last, f3);
    }
    last.connect(o.dest || this.out);
    return g;
  };
  /** Pitched tone with percussive envelope & optional glide. o: {type, f, f2, glide, start, a, d, peak, dest} */
  KP.tone = function (o) {
    const st = o.start || 0;
    const osc = this.osc(
      o.type || "sine",
      o.f,
      st,
      (o.a || 0.002) + (o.d || 0.2) * 1.6 + 0.1,
    );
    if (o.f2) {
      if (o.glideLin)
        this.env(osc.frequency, [
          [st, o.f],
          [st + (o.glide || o.d || 0.1), o.f2, "l"],
        ]);
      else
        this.env(osc.frequency, [
          [st, o.f],
          [st + (o.glide || o.d || 0.1), o.f2],
        ]);
    }
    if (o.detune) osc.detune.value = o.detune;
    const g = this.gain(0);
    this.perc(
      g.gain,
      st,
      o.peak === undefined ? 1 : o.peak,
      o.a || 0.002,
      o.d || 0.2,
      o.curve,
    );
    let last = this.chain(osc, g);
    if (o.filter)
      last = this.chain(last, this.filt(o.filter[0], o.filter[1], o.filter[2]));
    last.connect(o.dest || this.out);
    return { osc, g };
  };
  /** Feedback echo; returns {input, output}. */
  KP.echo = function (time, fb, lp, wet) {
    const input = this.gain(1),
      d = this.delay(time, time + 0.1),
      f = this.filt("lowpass", lp || 3000, 0.5),
      g = this.gain(fb),
      w = this.gain(wet === undefined ? 1 : wet);
    input.connect(d);
    d.connect(f);
    f.connect(g);
    g.connect(d);
    f.connect(w);
    return { input, output: w };
  };
  /** Resonant "metal" body: parallel high-Q bandpasses at inharmonic ratios. Returns {input, output}. */
  KP.metal = function (base, ratios, q, gainsOpt) {
    const input = this.gain(1),
      output = this.gain(1);
    ratios.forEach((ra, i) => {
      const f = this.filt("bandpass", base * ra, q);
      const g = this.gain(gainsOpt ? gainsOpt[i] : 1 / (i + 1));
      input.connect(f);
      f.connect(g);
      g.connect(output);
    });
    return { input, output };
  };
  /**
   * Vocal / creature voice synthesiser (source-filter model).
   * o: {start, dur, f0:[[t,hz]], vowels:[[t,'a']], shift (formant scale, <1 = bigger creature), gain, breath (0..1),
   *     rough (0..1 jitter/growl AM), growl (Hz of AM), dist (waveshaper k), wave ('glottal'|'buzz'|'sawtooth'), q (formant sharpness),
   *     env:[[t,v]] custom amplitude envelope, dest}
   */
  KP.voice = function (o) {
    const st = o.start || 0,
      dur = o.dur || 0.5,
      shift = o.shift || 1;
    const src = this.osc(o.wave || "glottal", o.f0[0][1], st, dur + 0.1);
    const pts = o.f0.map((p) => [st + p[0], p[1], p[2]]);
    this.env(src.frequency, pts);
    // jitter / growl: noise → FM + AM
    const pre = this.gain(1);
    if (o.rough) {
      const jn = this.noise(
        "pink",
        st,
        dur + 0.1,
        0.25 + (o.jitterRate || 0.2),
      );
      const jf = this.filt("lowpass", 60 + o.rough * 120, 0.5);
      const jg = this.gain(o.f0[0][1] * 0.08 * o.rough);
      this.chain(jn, jf, jg, src.frequency);
    }
    let body = src;
    if (o.growl) {
      // amplitude modulation "rattle" in the throat
      const am = this.gain(1 - 0.5 * (o.growlDepth || 0.7));
      const lfo = this.osc(o.growlWave || "square", o.growl, st, dur + 0.1);
      const lg = this.gain(0.5 * (o.growlDepth || 0.7));
      lfo.connect(lg);
      lg.connect(am.gain);
      src.connect(am);
      body = am;
    }
    body.connect(pre);
    // breath noise
    if (o.breath) {
      const bn = this.noise("white", st, dur + 0.1);
      const bg = this.gain(o.breath * 0.6);
      this.chain(bn, this.filt("highpass", 400), bg, pre);
    }
    // formant bank
    const q = o.q || 1;
    const out = this.gain(1);
    const vs = o.vowels || [[0, "a"]];
    const fGains = [1, 0.6, 0.28, 0.12];
    for (let k = 0; k < 4; k++) {
      const v0 = S.VOWELS[vs[0][1]] || S.VOWELS.a;
      const f = this.filt(
        "bandpass",
        v0[k] * shift,
        (v0[k] / [90, 110, 160, 220][k]) * q,
      );
      for (let i = 0; i < vs.length; i++) {
        const vv = S.VOWELS[vs[i][1]] || S.VOWELS.a;
        if (i === 0)
          f.frequency.setValueAtTime(vv[k] * shift, this.t + st + vs[i][0]);
        else
          f.frequency.linearRampToValueAtTime(
            vv[k] * shift,
            this.t + st + vs[i][0],
          );
      }
      const g = this.gain(fGains[k] * (o.formantGains ? o.formantGains[k] : 1));
      pre.connect(f);
      f.connect(g);
      g.connect(out);
    }
    let last = out;
    if (o.dist) last = this.chain(last, this.shaper(o.dist, o.distKind));
    const amp = this.gain(0);
    if (o.env)
      this.env(
        amp.gain,
        o.env.map((p) => [st + p[0], p[1] * (o.gain || 1), p[2]]),
      );
    else {
      const a = o.attack || 0.03,
        rel = o.release || 0.12,
        pk = o.gain || 1;
      amp.gain.setValueAtTime(0.0001, this.t + st);
      amp.gain.exponentialRampToValueAtTime(pk, this.t + st + a);
      amp.gain.setValueAtTime(pk, this.t + st + Math.max(a, dur - rel));
      amp.gain.exponentialRampToValueAtTime(0.0001, this.t + st + dur);
    }
    this.chain(last, amp).connect(o.dest || this.out);
    return amp;
  };
  /** Granular crackle: n tiny clicks spread over [start, start+span] through a bandpass. */
  KP.grains = function (o) {
    const st = o.start || 0,
      n = o.n || 10;
    const f = this.filt(o.type || "bandpass", o.f || 2500, o.q || 1.2);
    const g = this.gain(o.gain || 1);
    f.connect(g);
    g.connect(o.dest || this.out);
    for (let i = 0; i < n; i++) {
      const tt = st + Math.pow(this.r(), o.skew || 1) * (o.span || 0.2);
      const s = this.noise("white", tt, o.len || 0.012);
      const e = this.gain(0);
      this.perc(
        e.gain,
        tt,
        (o.peakMin || 0.2) + this.r() * (1 - (o.peakMin || 0.2)),
        0.0005,
        o.len || 0.012,
      );
      this.chain(s, e, f);
    }
    return g;
  };

  // ------------------------------------------------------------------
  // Recipes registry
  // ------------------------------------------------------------------
  /**
   * def: {
   *   build(kit, variantIndex, rng, params)   — graph builder (offline-bakeable), OR
   *   gen(dataArrays, sr, rng, n)             — direct sample generator (fast JS, used for loops)
   *   dur: seconds, variants: n, sr: sample rate, channels: 1|2,
   *   bus: 'world'|'ui'|'amb', gain (relative mix level, 1 = loud gun), ref (m, panner refDistance), rolloff,
   *   maxVoices, pitchVar (±fraction), dedupe (s), wet (reverb send mult), loop (bool: this recipe is a loop),
   *   priority (bake order, lower first), norm:false (skip loudness normalisation), onPlay(opts) hook
   * }
   */
  S.define = function (name, def) {
    S.R[name] = Object.assign(
      {
        name,
        variants: 1,
        dur: 1,
        sr: 32000,
        channels: 1,
        bus: "world",
        gain: 0.8,
        ref: 6,
        rolloff: 1,
        maxVoices: 4,
        pitchVar: 0.05,
        dedupe: 0.03,
        wet: 1,
        loop: false,
        priority: 5,
        norm: true,
      },
      def,
    );
  };
  S.aliasOf = function (alias, target) {
    S.alias[alias] = target;
  };

  // ------------------------------------------------------------------
  // Loudness normalisation of a rendered buffer: scale so the loudest
  // 50 ms window hits ~-12 dBFS RMS, never exceeding peak 0.95.
  // ------------------------------------------------------------------
  /**
   * Array-based loudness normaliser (also shipped to the worker): scales channel arrays so the loudest 50 ms
   * window hits `target` RMS without exceeding peak 0.95; NaNs are zeroed; optional 12 ms end fade. Returns k.
   */
  function normalizeArrays(chs, sr, target, noFade) {
    const n = chs[0].length,
      win = Math.max(64, Math.floor(sr * 0.05));
    let peak = 0,
      bestRms = 0,
      acc = 0;
    const sq = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let v = 0;
      for (let c = 0; c < chs.length; c++) {
        const d = chs[c];
        const x = d[i];
        if (x !== x) {
          d[i] = 0;
          continue;
        }
        const ax = x < 0 ? -x : x;
        if (ax > peak) peak = ax;
        v += x * x;
      }
      sq[i] = v / chs.length;
    }
    for (let i = 0; i < n; i++) {
      acc += sq[i];
      if (i >= win) acc -= sq[i - win];
      if (i >= win - 1) {
        const rms = Math.sqrt(Math.max(0, acc) / win);
        if (rms > bestRms) bestRms = rms;
      }
    }
    if (n < win) bestRms = Math.sqrt(acc / Math.max(1, n));
    if (peak < 1e-6) return 0;
    let k = bestRms > 1e-6 ? (target || 0.25) / bestRms : 1;
    k = Math.min(k, 0.95 / peak);
    const fo = noFade ? 0 : Math.min(n >> 2, Math.floor(sr * 0.012));
    for (let c = 0; c < chs.length; c++) {
      const d = chs[c];
      for (let i = 0; i < n; i++) d[i] *= k;
      for (let i = 0; i < fo; i++) d[n - 1 - i] *= i / fo;
    }
    return k;
  }
