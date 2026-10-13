/* src/sound/00_core.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 00_core.js
 * Owned by: sound.  Pure WebAudio synthesis — no sample files at all.
 *
 * This file is the audio "engine room" shared by all other sound files
 * through the private object G._snd (S):
 *   - AudioContext creation + unlock on first user gesture
 *   - Mixer: master → glue compressor → brick-wall limiter → speakers,
 *     buses for world sfx (with environment reverb + low-pass "shell
 *     shock" filter), UI, ambience, music (own hall reverb), radio.
 *   - Procedural noise buffers and procedural reverb impulse responses
 *   - Kit: a tiny DSL used by every sound "recipe" to build node graphs
 *     (works on live AudioContext AND OfflineAudioContext)
 *   - Recipe registry + background BAKING: every one-shot sound is
 *     rendered once (in several variants) in an OfflineAudioContext
 *     (off the main thread) and then played back as a cheap buffer.
 *     Until a bake finishes, the recipe is synthesised live instead.
 *   - Voice manager: voice limits per sound, global voice cap, stealing,
 *     positional (PannerNode) voices with air absorption, occlusion,
 *     distance-dependent reverb send, slow-motion pitch.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = (G._snd = G._snd || {});

  S.ctx = null;
  S.R = {}; // recipes by name
  S.alias = {}; // alias name → recipe name
  S.cache = {}; // name → [AudioBuffer variants]
  S.voices = []; // active voices
  S.listenerPos = { x: 0, y: 0, z: 0 };
  S.listenerFwd = { x: 0, y: 0, z: -1 };
  S.listenerVel = { x: 0, y: 0, z: 0, t: 0 };
  S.vol = {
    master: 0.9,
    sfx: 0.9,
    music: 0.55,
    radio: 0.6,
    ambience: 0.8,
    ui: 0.8,
  };
  S.env = { name: "outdoor", wet: 0.14 };
  S.stats = {
    baked: 0,
    bakeFailed: 0,
    played: 0,
    culled: 0,
    live: 0,
    bakeMs: 0,
    bakeMaxMs: 0,
    refused: 0,
    bakedBytes: 0,
    evicted: 0,
    skippedBg: 0,
  };
  S.MAX_VOICES = 56;
  S.MAX_REAL_LOOPS = 12; // positional loops that may own real voices at once (the loudest win)
  S.MAX_HRTF = 12; // HRTF panners are expensive: the rest use equal-power panning
  const warned = new Set();
  S.warnOnce = function (key, msg) {
    if (warned.has(key)) return;
    warned.add(key);
    console.warn("[sound] " + msg);
  };

  // ------------------------------------------------------------------
  // Small math helpers
  // ------------------------------------------------------------------
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  S.clamp = clamp;
  S.mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  S.dbToGain = (db) => Math.pow(10, db / 20);
  /** Simple non-seeded helpers for runtime randomness. */
  S.rand = (a, b) => a + Math.random() * (b - a);
  S.pick = (arr) => arr[(Math.random() * arr.length) | 0];
  S.chance = (p) => Math.random() < p;
  /** Seeded rng (core's mulberry32). */
  S.rng = (seed) => G.util.rng(seed >>> 0);

  // ------------------------------------------------------------------
  // Procedural buffers (context independent via AudioBuffer constructor)
  // ------------------------------------------------------------------
  function newBuffer(channels, length, sampleRate) {
    try {
      return new AudioBuffer({
        numberOfChannels: channels,
        length: Math.max(1, length | 0),
        sampleRate,
      });
    } catch (e) {
      return S.ctx
        ? S.ctx.createBuffer(channels, Math.max(1, length | 0), sampleRate)
        : null;
    }
  }
  S.newBuffer = newBuffer;

  /** White, pink (Kellet), brown and "crackle" (sparse impulses) noise, 3 s seamless loops, mono @44.1k. */
  function makeNoiseBuffers() {
    const sr = 44100,
      fade = 2048,
      n = sr * 3 + fade;
    const r = S.rng(1337);
    const w = new Float32Array(n),
      p = new Float32Array(n),
      b = new Float32Array(n),
      c = new Float32Array(n);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0,
      last = 0;
    for (let i = 0; i < n; i++) {
      const x = r() * 2 - 1;
      w[i] = x;
      b0 = 0.99886 * b0 + x * 0.0555179;
      b1 = 0.99332 * b1 + x * 0.0750759;
      b2 = 0.969 * b2 + x * 0.153852;
      b3 = 0.8665 * b3 + x * 0.3104856;
      b4 = 0.55 * b4 + x * 0.5329522;
      b5 = -0.7616 * b5 - x * 0.016898;
      p[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362) * 0.11;
      b6 = x * 0.115926;
      last = (last + 0.02 * x) / 1.02;
      b[i] = last * 3.5;
    }
    // crackle: sparse random impulses with a tiny ring (vinyl / fire / geiger texture)
    for (let k = 0; k < 900; k++) {
      const pos = (r() * (n - 200)) | 0,
        amp = Math.pow(r(), 3) * (r() < 0.5 ? -1 : 1);
      const len = 8 + ((r() * 40) | 0);
      for (let j = 0; j < len; j++)
        c[pos + j] += amp * Math.exp(-j / (len * 0.25)) * (j % 2 ? -0.6 : 1);
    }
    const mk = (arr) => {
      const out = newBuffer(1, n - fade, sr);
      out.getChannelData(0).set(loopify(arr, fade));
      return out;
    };
    return { white: mk(w), pink: mk(p), brown: mk(b), crackle: mk(c) };
  }
  /** Returns a copy of `s` shortened by `fade` samples whose end flows seamlessly into its start (equal-power crossfade). */
  function loopify(s, fade) {
    const m = s.length - fade,
      d = new Float32Array(m);
    for (let i = 0; i < m; i++) d[i] = s[i];
    for (let i = 0; i < fade; i++) {
      const t = i / fade;
      d[i] = s[i] * Math.sqrt(t) + s[m + i] * Math.sqrt(1 - t);
    }
    return d;
  }
  S.loopify = loopify;
  /** Build a seamless loop buffer from a generator fill(dataArrays, sr, rng). len in seconds. */
  S.makeLoop = function (seconds, sr, channels, fill, seed) {
    const fade = Math.floor(sr * 0.25);
    const n = Math.floor(seconds * sr) + fade;
    const tmp = [];
    for (let c = 0; c < channels; c++) tmp.push(new Float32Array(n));
    fill(tmp, sr, S.rng(seed || 77), n);
    const out = newBuffer(channels, n - fade, sr);
    for (let c = 0; c < channels; c++) {
      const s = tmp[c],
        d = out.getChannelData(c),
        m = n - fade;
      for (let i = 0; i < m; i++) d[i] = s[i];
      for (let i = 0; i < fade; i++) {
        const t = i / fade;
        d[i] = s[i] * Math.sqrt(t) + s[m + i] * Math.sqrt(1 - t);
      }
    }
    return out;
  };

  // ------------------------------------------------------------------
  // Waveshaper curves (cached)
  // ------------------------------------------------------------------
  const curves = {};
  /** Soft-clip curve. k≈0 clean, 1 warm, 5 fuzzy, 20 brutal. */
  S.curve = function (k, kind) {
    const key = (kind || "soft") + k;
    if (curves[key]) return curves[key];
    const n = 2048,
      c = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      if (kind === "hard") c[i] = clamp(x * (1 + k), -1, 1);
      else if (kind === "fold") c[i] = Math.sin(x * (1 + k) * Math.PI * 0.5);
      else if (kind === "tube")
        c[i] =
          x >= 0 ? Math.tanh(x * (1 + k)) : Math.tanh(x * (1 + k * 0.6)) * 0.9; // asymmetric warmth
      else c[i] = Math.tanh(x * (1 + k)) / Math.tanh(1 + k);
    }
    curves[key] = c;
    return c;
  };

  // ------------------------------------------------------------------
  // Periodic waves (per context — PeriodicWave is context bound)
  // ------------------------------------------------------------------
  const waveCache = new WeakMap();
  /** Named timbres: glottal, trumpet, clarinet, sax, organ, reed, cello, flute, buzz. */
  S.wave = function (ctx, name) {
    let m = waveCache.get(ctx);
    if (!m) {
      m = {};
      waveCache.set(ctx, m);
    }
    if (m[name]) return m[name];
    const N = 40,
      re = new Float32Array(N),
      im = new Float32Array(N);
    for (let h = 1; h < N; h++) {
      let a = 0;
      switch (name) {
        case "glottal":
          a = 1 / Math.pow(h, 1.35);
          break; // human voice source (~ -8dB/oct)
        case "trumpet":
          a =
            h < 9
              ? (0.55 + 0.45 * Math.sin(h * 0.9)) / Math.pow(h, 0.55)
              : 1 / Math.pow(h, 1.4);
          break;
        case "mute":
          a = (h >= 4 && h <= 9 ? 1.0 : 0.35) / Math.pow(h, 0.9);
          break; // harmon-muted trumpet: nasal mids
        case "clarinet":
          a = h % 2 ? 1 / h : h > 6 ? 0.12 / h : 0.02;
          break;
        case "sax":
          a =
            (1 / Math.pow(h, 0.95)) * (h === 2 ? 1.1 : 1) * (h > 12 ? 0.4 : 1);
          break;
        case "organ":
          a = [0, 1, 0.6, 0.3, 0.5, 0.1, 0.2, 0, 0.25][h] || 0;
          break;
        case "reed":
          a = (h % 2 ? 1 : 0.55) / Math.pow(h, 0.8);
          break; // harmonica / accordion
        case "cello":
          a = (1 / Math.pow(h, 1.05)) * (1 + 0.5 * Math.sin(h * 1.7));
          break;
        case "flute":
          a = h === 1 ? 1 : h === 2 ? 0.25 : h === 3 ? 0.08 : 0.01;
          break;
        case "buzz":
          a = 1 / Math.pow(h, 0.6);
          break; // insect / robot
        case "square":
          a = h % 2 ? 1 / h : 0;
          break;
        default:
          a = 1 / h;
      }
      im[h] = a;
    }
    const w = ctx.createPeriodicWave(re, im, { disableNormalization: false });
    m[name] = w;
    return w;
  };

  // ------------------------------------------------------------------
  // Formant table (Hz) for vocal synthesis — adult male reference.
  // ------------------------------------------------------------------
  S.VOWELS = {
    a: [730, 1090, 2440, 3400],
    e: [530, 1840, 2480, 3500],
    i: [270, 2290, 3010, 3700],
    o: [570, 840, 2410, 3300],
    u: [300, 870, 2240, 3200],
    ae: [660, 1720, 2410, 3400],
    uh: [520, 1190, 2390, 3300],
    er: [490, 1350, 1690, 3200],
    aw: [640, 950, 2400, 3300],
    oo: [350, 800, 2300, 3100],
    ng: [280, 1500, 2500, 3300],
    hh: [600, 1500, 2600, 3500],
  };

  // ------------------------------------------------------------------
  // KIT — graph-building DSL used by recipes (live or offline).
  // All times are relative to kit.t (the start time of the sound).
  // ------------------------------------------------------------------
  function Kit(ctx, out, t0, r) {
    this.ctx = ctx;
    this.out = out;
    this.t = t0;
    this.r = r || Math.random;
  }
  S.Kit = Kit;
  const KP = Kit.prototype;
  KP.rr = function (a, b) {
    return a + this.r() * (b - a);
  };
  KP.gain = function (v) {
    const g = this.ctx.createGain();
    g.gain.value = v === undefined ? 1 : v;
    return g;
  };
  KP.filt = function (type, f, q, g) {
    const b = this.ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    if (q !== undefined) b.Q.value = q;
    if (g !== undefined) b.gain.value = g;
    return b;
  };
  KP.osc = function (type, f, start, dur) {
    const o = this.ctx.createOscillator();
    if (
      typeof type === "string" &&
      !["sine", "square", "sawtooth", "triangle"].includes(type)
    )
      o.setPeriodicWave(S.wave(this.ctx, type));
    else o.type = type;
    o.frequency.value = f;
    start = start || 0;
    o.start(this.t + start);
    o.stop(this.t + start + (dur === undefined ? 2 : dur) + 0.05);
    return o;
  };
  /** Looping noise source. kind: white|pink|brown|crackle. rate = playbackRate (pitch the noise). */
  KP.noise = function (kind, start, dur, rate) {
    const s = this.ctx.createBufferSource();
    s.buffer = S.noiseBufs[kind || "white"];
    s.loop = true;
    if (rate) s.playbackRate.value = rate;
    start = start || 0;
    s.start(this.t + start, this.r() * 2.5);
    s.stop(this.t + start + (dur === undefined ? 2 : dur) + 0.05);
    return s;
  };
  KP.buf = function (buffer, start, rate, loop) {
    const s = this.ctx.createBufferSource();
    s.buffer = buffer;
    if (rate) s.playbackRate.value = rate;
    if (loop) s.loop = true;
    s.start(this.t + (start || 0));
    return s;
  };
  KP.shaper = function (k, kind) {
    const w = this.ctx.createWaveShaper();
    w.curve = S.curve(k, kind);
    w.oversample = "2x";
    return w;
  };
  KP.pan = function (p) {
    if (!this.ctx.createStereoPanner) return this.gain(1);
    const s = this.ctx.createStereoPanner();
    s.pan.value = p;
    return s;
  };
  KP.delay = function (time, max) {
    const d = this.ctx.createDelay(max || Math.max(1, time * 2));
    d.delayTime.value = time;
    return d;
  };
  /** Connect a chain of nodes a→b→c…; returns last. */
  KP.chain = function () {
    for (let i = 0; i < arguments.length - 1; i++)
      arguments[i].connect(arguments[i + 1]);
    return arguments[arguments.length - 1];
  };
  /** Connect node to the kit output (optionally through a gain). */
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
  function isLoopRec(rec) {
    return !!(rec.loop || rec.seamless || rec.exactLoop);
  }
  function normalize(buf, rec) {
    const chs = [];
    for (let c = 0; c < buf.numberOfChannels; c++)
      chs.push(buf.getChannelData(c));
    return normalizeArrays(
      chs,
      buf.sampleRate,
      rec.normRms || 0.25,
      isLoopRec(rec),
    );
  }

  /** Cut the silent tail of a one-shot buffer (saves memory: most recipes over-allocate for safety). */
  function trimTail(buf, rec) {
    if (rec.loop || rec.seamless || rec.exactLoop) return buf;
    const n = buf.length,
      chs = [];
    for (let c = 0; c < buf.numberOfChannels; c++)
      chs.push(buf.getChannelData(c));
    let pk = 0;
    for (const d of chs)
      for (let i = 0; i < n; i++) {
        const a = Math.abs(d[i]);
        if (a > pk) pk = a;
      }
    const thr = Math.max(1e-5, pk * 0.0012);
    let last = 0;
    for (const d of chs)
      for (let i = n - 1; i > last; i--)
        if (Math.abs(d[i]) > thr) {
          last = i;
          break;
        }
    const keep = Math.min(n, last + Math.floor(buf.sampleRate * 0.03));
    if (keep > n * 0.92) return buf;
    const out = newBuffer(buf.numberOfChannels, keep, buf.sampleRate);
    for (let c = 0; c < chs.length; c++) {
      const d = out.getChannelData(c);
      d.set(chs[c].subarray(0, keep));
      const fo = Math.min(keep >> 2, Math.floor(buf.sampleRate * 0.02));
      for (let i = 0; i < fo; i++) d[keep - 1 - i] *= i / fo;
    }
    return out;
  }
  S.trimTail = trimTail;

  // ------------------------------------------------------------------
  // Generation WORKER: all heavy JS sample synthesis (ambience beds, loops,
  // instrument multisamples) runs off the main thread. Modules register the
  // pure helper functions their generators need with S.workerLib(fn...).
  // Falls back to time-sliced main-thread generation if Workers fail.
  // ------------------------------------------------------------------
  S.workerLibs = [];
  S.workerLib = function () {
    for (const f of arguments) S.workerLibs.push(f.toString());
  };
  function mulberry(seed) {
    let a = seed >>> 0 || 1;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function workerMain(e) {
    const j = e.data;
    try {
      let chans,
        k = 1;
      if (j.type === "gen") {
        const obj = eval("({" + j.src + "})"); // eslint-disable-line no-eval
        const gen = obj.gen,
          r = mulberry(j.seed);
        if (j.loop) {
          const fade = Math.floor(j.sr * 0.25),
            n = Math.floor(j.dur * j.sr) + fade,
            tmp = [];
          for (let c = 0; c < j.channels; c++) tmp.push(new Float32Array(n));
          gen(tmp, j.sr, r, n, j.v);
          chans = tmp.map((a) => loopifyArr(a, fade));
        } else {
          const n = Math.ceil(j.dur * j.sr);
          chans = [];
          for (let c = 0; c < j.channels; c++) chans.push(new Float32Array(n));
          gen(chans, j.sr, r, n, j.v);
        }
        if (j.norm) k = normalizeArrays(chans, j.sr, j.normRms, j.noFade);
      } else if (j.type === "ir") {
        chans = irArrays(j.o, j.sr, j.seed);
      } else if (j.type === "inst") {
        const f = new Function("m", "r", "return " + j.expr); // eslint-disable-line no-new-func
        const a = f(j.m, mulberry(j.seed));
        let pk = 0;
        for (let i = 0; i < a.length; i++) {
          const v = Math.abs(a[i]);
          if (v > pk) pk = v;
        }
        const kk = pk > 0 ? 0.9 / pk : 1;
        for (let i = 0; i < a.length; i++) a[i] *= kk;
        chans = [a];
      }
      postMessage(
        { id: j.id, chans, k },
        chans.map((a) => a.buffer),
      );
    } catch (err) {
      postMessage({ id: j.id, error: String((err && err.stack) || err) });
    }
  }
  function loopifyArr(s, fade) {
    const m = s.length - fade,
      d = new Float32Array(m);
    for (let i = 0; i < m; i++) d[i] = s[i];
    for (let i = 0; i < fade; i++) {
      const t = i / fade;
      d[i] = s[i] * Math.sqrt(t) + s[m + i] * Math.sqrt(1 - t);
    }
    return d;
  }
  const W = (S.worker = {
    w: null,
    failed: false,
    next: 1,
    pending: new Map(),
  });
  function ensureWorker() {
    if (W.w || W.failed) return W.w;
    try {
      if (!window.Worker || !window.Blob || !window.URL)
        throw new Error("no Worker");
      const src = [
        "'use strict';",
        "const SR = 32000; const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);",
        mulberry.toString(),
        loopifyArr.toString(),
        normalizeArrays.toString(),
        S.workerLibs.join("\n"),
        'const S = { biquad: typeof biquad !== "undefined" ? biquad : null, slowNoise: typeof slowNoise !== "undefined" ? slowNoise : null, mtof };',
        "onmessage = " + workerMain.toString() + ";",
      ].join("\n");
      const url = URL.createObjectURL(
        new Blob([src], { type: "text/javascript" }),
      );
      W.w = new Worker(url);
      W.w.onmessage = (ev) => {
        const d = ev.data,
          p = W.pending.get(d.id);
        if (!p) return;
        W.pending.delete(d.id);
        if (d.error) p.reject(new Error(d.error));
        else p.resolve(d);
      };
      W.w.onerror = (ev) => {
        S.warnOnce(
          "worker",
          "sound worker error, falling back to main thread: " +
            (ev && ev.message),
        );
        W.failed = true;
        try {
          W.w.terminate();
        } catch (e) {
          /* */
        }
        W.w = null;
        W.pending.forEach((p) => p.reject(new Error("worker failed")));
        W.pending.clear();
      };
    } catch (e) {
      W.failed = true;
      W.w = null;
      S.warnOnce(
        "worker",
        "sound worker unavailable (" +
          e.message +
          "), generating on main thread",
      );
    }
    return W.w;
  }
  /** Post a job to the generation worker. Resolves {chans:[Float32Array], k}. Rejects if the worker is unavailable. */
  S.job = function (msg) {
    const w = ensureWorker();
    if (!w) return Promise.reject(new Error("no worker"));
    return new Promise((resolve, reject) => {
      const id = W.next++;
      W.pending.set(id, { resolve, reject });
      msg.id = id;
      w.postMessage(msg);
    });
  };
  S.canUseWorker = function () {
    return !W.failed && !!(window.Worker && window.Blob);
  };

  // ------------------------------------------------------------------
  // Baking (offline rendering) queue — async, a couple at a time.
  // ------------------------------------------------------------------
  const bakeQ = [];
  const bakeState = {}; // name → 'queued'|'baking'|'done'|'failed'
  let baking = 0;
  S.bakeConcurrency = 2;
  S.requestBake = function (name, prio, bg) {
    const rec = S.R[name];
    if (!rec) return;
    if (bakeState[name] === "queued" && prio !== undefined) {
      // bump priority of a queued job
      const j = bakeQ.find((x) => x.name === name);
      if (j) j.bg = !!bg && j.bg;
      if (j && prio < j.prio) {
        j.prio = prio;
        bakeQ.sort((a, b) => a.prio - b.prio);
      }
      return;
    }
    if (bakeState[name]) return;
    bakeState[name] = "queued";
    bakeQ.push({
      name,
      prio: prio === undefined ? rec.priority : prio,
      bg: !!bg,
    });
    bakeQ.sort((a, b) => a.prio - b.prio);
    pump();
  };
  S.bakeState = bakeState;
  S.bakePromises = {};
  /** Run fn in an idle slot (or soon): keeps graph building out of busy frames. */
  const idle = (fn) => {
    if (window.requestIdleCallback && !G.SMOKE)
      window.requestIdleCallback(fn, { timeout: 400 });
    else setTimeout(fn, 12);
  };
  S.idle = idle;
  function pump() {
    while (baking < S.bakeConcurrency && bakeQ.length) {
      const job = bakeQ.shift();
      // background pre-bakes stop at the soft memory budget: the rest bake on a hint or on first use
      if (job.bg && S.stats.bakedBytes > S.MEM_BUDGET * 0.8) {
        delete bakeState[job.name];
        S.stats.skippedBg++;
        continue;
      }
      baking++;
      bakeState[job.name] = "baking";
      const pr = bakeRecipe(job.name);
      S.bakePromises[job.name] = pr.then(
        () => true,
        () => false,
      );
      pr.then(() => {
        bakeState[job.name] = "done";
        S.stats.baked++;
        noteBaked(job.name);
      })
        .catch((e) => {
          bakeState[job.name] = "failed";
          S.stats.bakeFailed++;
          S.warnOnce(
            "bake:" + job.name,
            "bake failed for " + job.name + ": " + (e && e.message),
          );
        })
        .then(() => {
          baking--;
          setTimeout(pump, 0);
        });
    }
  }
  function bakeRecipe(name) {
    const rec = S.R[name];
    const t0 = performance.now();
    if (rec.gen) {
      const seedOf = (v) => G.util.hashStr(name) + v * 7919;
      const fromArrays = (res) => {
        const len = res.chans[0].length;
        const b = newBuffer(rec.channels, len, rec.sr);
        res.chans.forEach((a, c) => {
          if (b.copyToChannel) b.copyToChannel(a, c);
          else b.getChannelData(c).set(a);
        });
        if (rec.norm && res.k) rec._norm = res.k;
        return trimTail(b, rec);
      };
      if (S.canUseWorker()) {
        const jobs = [];
        for (let v = 0; v < rec.variants; v++) {
          jobs.push(
            S.job({
              type: "gen",
              src: rec.gen.toString(),
              dur: rec.dur,
              sr: rec.sr,
              channels: rec.channels,
              loop: !!(rec.loop || rec.seamless),
              seed: seedOf(v),
              v,
              norm: rec.norm,
              normRms: rec.normRms || 0.25,
              noFade: isLoopRec(rec),
            }),
          );
        }
        return Promise.all(jobs)
          .then((rs) => {
            S.cache[name] = rs.map(fromArrays);
            S.stats.bakeMs += performance.now() - t0;
          })
          .catch(() => {
            genSync(name);
          });
      }
      genSync(name);
      return Promise.resolve();
    }
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) return Promise.reject(new Error("no OfflineAudioContext"));
    // Graph building is synchronous main-thread work: build ONE variant per idle slot, render off-thread.
    return new Promise((resolve, reject) => {
      const jobs = [];
      let v = 0;
      const step = () => {
        const tb = performance.now();
        try {
          const len = Math.ceil(rec.dur * rec.sr);
          const oc = new OAC(rec.channels, len, rec.sr);
          const out = oc.createGain();
          out.connect(oc.destination);
          const r = S.rng(G.util.hashStr(name) + v * 7919);
          rec.build(new Kit(oc, out, 0, r), v, r, {});
          // normalise + trim each variant as its render lands (separate tasks, not one long batch)
          jobs.push(
            oc.startRendering().then((buf) => {
              const k = rec.norm ? normalize(buf, rec) : 1;
              if (k) rec._norm = k;
              return trimTail(buf, rec);
            }),
          );
        } catch (e) {
          reject(e);
          return;
        }
        const dt = performance.now() - tb;
        S.stats.bakeMs += dt;
        if (dt > S.stats.bakeMaxMs) S.stats.bakeMaxMs = dt;
        if (++v < rec.variants) {
          idle(step);
          return;
        }
        Promise.all(jobs).then((bufs) => {
          S.cache[name] = bufs;
          resolve();
        }, reject);
      };
      step();
    });
  }
  // Loudness hints: the normalisation gain of every baked recipe is remembered per browser, so the live-synthesis
  // fallback (used for the first few seconds, before a bake lands) plays at the same loudness as the baked buffer.
  let normHints = {};
  try {
    normHints = JSON.parse(S.lsGet("sfxnorm") || "{}") || {};
  } catch (e) {
    normHints = {};
  }
  let normSaveT = null;
  function noteBaked(name) {
    const rec = S.R[name],
      bufs = S.cache[name];
    let bytes = 0;
    if (bufs) for (const b of bufs) bytes += b.length * b.numberOfChannels * 4;
    S.stats.bakedBytes += bytes - (bakedSize[name] || 0);
    bakedSize[name] = bytes;
    lastUse[name] = lastUse[name] || performance.now();
    if (!rec || !rec._norm || rec.gen) return;
    const k = Math.round(rec._norm * 1000) / 1000;
    if (normHints[name] === k) return;
    normHints[name] = k;
    clearTimeout(normSaveT);
    normSaveT = setTimeout(() => {
      S.lsSet("sfxnorm", JSON.stringify(normHints));
    }, 3000);
  }
  S.normHint = (name) => normHints[name];
  /** Synchronous main-thread generation of a gen-recipe (fallback when no Worker). */
  function genSync(name) {
    const rec = S.R[name],
      t0 = performance.now(),
      bufs = [];
    for (let v = 0; v < rec.variants; v++) {
      const seed = G.util.hashStr(name) + v * 7919;
      let b;
      if (rec.loop || rec.seamless)
        b = S.makeLoop(
          rec.dur,
          rec.sr,
          rec.channels,
          (d, sr, rr, n) => rec.gen(d, sr, rr, n, v),
          seed,
        );
      else {
        b = newBuffer(rec.channels, Math.ceil(rec.dur * rec.sr), rec.sr);
        const arrs = [];
        for (let c = 0; c < rec.channels; c++) arrs.push(b.getChannelData(c));
        rec.gen(arrs, rec.sr, S.rng(seed), b.length, v);
      }
      if (rec.norm) rec._norm = normalize(b, rec);
      bufs.push(trimTail(b, rec));
    }
    S.cache[name] = bufs;
    S.stats.bakeMs += performance.now() - t0;
  }
  /**
   * Queue every recipe for background baking (priority order). Recipes flagged `lazy` (rare and/or long:
   * nuke blast, cryo hatch, thunder, ripjaw…) are skipped: they bake on a hint (S.hintBake / G.sfx.preload,
   * e.g. entering the cryo unit, rain starting, equipping a recoilless rifle) or on first use (played live meanwhile), so
   * their buffers never occupy memory in a session that doesn't need them.
   */
  S.bakeAll = function () {
    Object.keys(S.R).forEach((n) => {
      if (!S.R[n].lazy) S.requestBake(n, undefined, true);
    });
  };

  // ------------------------------------------------------------------
  // Memory manager. Baked sfx live in Float32 AudioBuffers; a whole session
  // would otherwise accumulate ~55 MB. Background pre-baking stops at 80 % of
  // S.MEM_BUDGET, and an LRU evicts buffers that have not been played for a
  // while whenever the total is over budget (they re-bake on the next hint or
  // use; build-recipes play live-synthesised meanwhile at matched loudness).
  // Never evicted: anything sounding or held by a loop/bed, pinned recipes
  // (UI, footsteps, Geiger, the equipped weapon), gen one-shots (no live path).
  // ------------------------------------------------------------------
  S.MEM_BUDGET = 28e6;
  S.EVICT_IDLE_MS = 90000;
  const bakedSize = (S.bakedSize = {});
  const lastUse = (S.lastUse = {});
  S.pinned = new Set();
  const PIN_RE = /^(footstep_|ui_|goggles_|terminal_|teletype_|keypad_|key_)/;
  function evictable(name, now, busy) {
    const rec = S.R[name];
    if (
      !rec ||
      !S.cache[name] ||
      bakeState[name] !== "done" ||
      busy.has(name) ||
      S.pinned.has(name) ||
      rec.pin
    )
      return false;
    if (PIN_RE.test(name) || rec.bus === "ui") return false;
    if (rec.gen && !isLoopRec(rec)) return false;
    return now - (lastUse[name] || 0) > S.EVICT_IDLE_MS;
  }
  /** Drop least-recently-used baked buffers until under 90 % of the budget. Returns bytes freed. */
  S.evictIdle = function (force) {
    if (!force && S.stats.bakedBytes <= S.MEM_BUDGET) return 0;
    const now = performance.now(),
      busy = new Set();
    for (const v of S.voices) busy.add(v.name);
    for (const h of S.loops) busy.add(h.name);
    if (S.amb && S.amb.beds) for (const b in S.amb.beds) busy.add(b);
    const cands = Object.keys(S.cache)
      .filter((n) => evictable(n, now, busy))
      .sort((a, b) => (lastUse[a] || 0) - (lastUse[b] || 0));
    let freed = 0;
    for (const n of cands) {
      if (!force && S.stats.bakedBytes <= S.MEM_BUDGET * 0.9) break;
      const sz = bakedSize[n] || 0;
      delete S.cache[n];
      delete bakeState[n];
      delete S.bakePromises[n];
      delete bakedSize[n];
      S.stats.bakedBytes -= sz;
      freed += sz;
      S.stats.evicted++;
    }
    return freed;
  };
  /** Ask for a recipe (or alias) to be baked soon — e.g. when its use becomes likely. */
  S.hintBake = function (name, prio) {
    name = S.resolve(name);
    if (S.R[name] && !S.cache[name])
      S.requestBake(name, prio === undefined ? 0 : prio);
  };
  /** Synchronously bake a gen-type recipe (used by loops at first play). */
  /** Make sure a gen-recipe gets generated soon (async via worker; sync only if workers are unavailable). */
  S.bakeNow = function (name) {
    const rec = S.R[name];
    if (!rec || S.cache[name]) return;
    if (S.canUseWorker()) S.requestBake(name, -2);
    else {
      bakeState[name] = "done";
      genSync(name);
      noteBaked(name);
    }
  };

  // ------------------------------------------------------------------
  // Reverb impulse responses (generated at context sample rate)
  // ------------------------------------------------------------------
  /**
   * o: {dur, rt60, pre (s), fc0 (Hz start brightness), fcEnd, er: [[time, gain], …], width (0..1), metallic (0..1)}
   */
  /** Pure IR synthesis into two Float32Arrays (runs in the worker or on the main thread). */
  function irArrays(o, sr, seed) {
    const n = Math.floor(sr * o.dur),
      r = mulberry(seed),
      chans = [new Float32Array(n), new Float32Array(n)];
    for (let c = 0; c < 2; c++) {
      const d = chans[c];
      let lp = 0;
      const pre = Math.floor((o.pre || 0.01) * sr);
      for (let i = pre; i < n; i++) {
        const t = (i - pre) / sr;
        const fc =
          (o.fcEnd || 800) +
          ((o.fc0 || 8000) - (o.fcEnd || 800)) *
            Math.exp((-t * 3) / (o.rt60 || 1));
        const a = Math.exp((-2 * Math.PI * fc) / sr);
        lp = lp * a + (r() * 2 - 1) * (1 - a);
        const envl =
          Math.exp((-6.9 * t) / (o.rt60 || 1)) * Math.min(1, t / 0.012 + 0.15);
        d[i] = lp * envl * (1.6 + fc / 6000);
      }
      if (o.metallic) {
        // cryo bunker / tunnel ring: a few decaying partials
        [311, 523, 877, 1290, 1811].forEach((f, k) => {
          const ph = r() * 6.28,
            rt = (o.rt60 || 1) * 0.6,
            w = (2 * Math.PI * f * (1 + c * 0.003)) / sr;
          const lim = Math.min(n, pre + Math.floor(rt * sr * 1.2));
          for (let i = pre; i < lim; i++) {
            const t = (i - pre) / sr;
            d[i] +=
              (Math.sin(ph + w * (i - pre)) *
                Math.exp((-6.9 * t) / rt) *
                0.02 *
                o.metallic) /
              (k + 1);
          }
        });
      }
      (o.er || []).forEach((e) => {
        // discrete early reflections (building slaps, walls)
        const idx = Math.floor((e[0] + (c ? 0.004 : 0) + r() * 0.003) * sr);
        for (let j = 0; j < 120 && idx + j < n; j++)
          d[idx + j] +=
            (r() * 2 - 1) *
            e[1] *
            Math.exp(-j / 25) *
            (c && o.width ? 1 - o.width * 0.5 : 1);
      });
    }
    let e = 0;
    for (const d of chans) for (let i = 0; i < n; i++) e += d[i] * d[i];
    const k = (1 / Math.sqrt(e / 2 + 1e-9)) * 0.9;
    for (const d of chans) for (let i = 0; i < n; i++) d[i] *= k;
    return chans;
  }
  S.workerLib(irArrays);
  function irBuffer(chans) {
    const b = S.ctx.createBuffer(2, chans[0].length, S.ctx.sampleRate);
    chans.forEach((a, c) => {
      if (b.copyToChannel) b.copyToChannel(a, c);
      else b.getChannelData(c).set(a);
    });
    return b;
  }
  /** Synchronous IR (used at init for the default environments). */
  S.makeIR = function (o) {
    return irBuffer(
      irArrays(o, S.ctx.sampleRate, G.util.hashStr(JSON.stringify(o))),
    );
  };
  /** Environment presets: IR + base wet send. */
  S.ENVS = {
    outdoor: {
      wet: 0.1,
      ir: {
        dur: 1.6,
        rt60: 0.9,
        pre: 0.02,
        fc0: 5000,
        fcEnd: 600,
        er: [
          [0.09, 0.25],
          [0.17, 0.18],
          [0.31, 0.1],
        ],
      },
    },
    canyon: {
      wet: 0.2,
      ir: {
        dur: 2.8,
        rt60: 1.7,
        pre: 0.03,
        fc0: 6000,
        fcEnd: 700,
        er: [
          [0.07, 0.35],
          [0.13, 0.3],
          [0.21, 0.22],
          [0.36, 0.16],
          [0.52, 0.1],
        ],
      },
    },
    open: {
      wet: 0.06,
      ir: {
        dur: 1.0,
        rt60: 0.5,
        pre: 0.03,
        fc0: 3000,
        fcEnd: 500,
        er: [[0.2, 0.08]],
      },
    },
    room: {
      wet: 0.22,
      ir: {
        dur: 1.2,
        rt60: 0.6,
        pre: 0.006,
        fc0: 7000,
        fcEnd: 1500,
        er: [
          [0.011, 0.4],
          [0.019, 0.3],
          [0.027, 0.2],
        ],
      },
    },
    cryo: {
      wet: 0.3,
      ir: {
        dur: 2.2,
        rt60: 1.4,
        pre: 0.008,
        fc0: 9000,
        fcEnd: 1800,
        metallic: 1,
        er: [
          [0.013, 0.4],
          [0.024, 0.3],
          [0.041, 0.2],
        ],
      },
    },
    hall: {
      wet: 0.34,
      ir: {
        dur: 3.2,
        rt60: 2.6,
        pre: 0.025,
        fc0: 6500,
        fcEnd: 900,
        er: [
          [0.03, 0.3],
          [0.055, 0.25],
          [0.08, 0.2],
        ],
      },
    },
    tunnel: {
      wet: 0.4,
      ir: {
        dur: 3.0,
        rt60: 2.2,
        pre: 0.015,
        fc0: 5000,
        fcEnd: 700,
        metallic: 0.4,
        er: [
          [0.02, 0.4],
          [0.045, 0.35],
          [0.09, 0.3],
          [0.135, 0.25],
          [0.18, 0.2],
          [0.225, 0.15],
        ],
      },
    },
    stone: {
      wet: 0.3,
      ir: {
        dur: 2.4,
        rt60: 1.6,
        pre: 0.01,
        fc0: 5500,
        fcEnd: 1000,
        er: [
          [0.015, 0.4],
          [0.03, 0.3],
        ],
      },
    },
  };
  const irCache = {},
    irPending = {};
  /** IR buffer for an environment; sync=false returns null while it is being generated in the worker. */
  S.getIR = function (name, sync) {
    if (irCache[name]) return irCache[name];
    const o = (S.ENVS[name] || S.ENVS.outdoor).ir;
    if (sync || !S.canUseWorker()) {
      irCache[name] = S.makeIR(o);
      return irCache[name];
    }
    if (!irPending[name]) {
      irPending[name] = true;
      S.job({
        type: "ir",
        o,
        sr: S.ctx.sampleRate,
        seed: G.util.hashStr(JSON.stringify(o)),
      }).then(
        (res) => {
          irCache[name] = irBuffer(res.chans);
        },
        () => {
          irCache[name] = S.makeIR(o);
        },
      );
    }
    return null;
  };
  // lazy environments (interior acoustics, 64_spaces.js) are generated/built on first use only
  S.prepareIRs = function () {
    Object.keys(S.ENVS).forEach((n) => {
      if (!S.ENVS[n].lazy) S.getIR(n);
    });
  };
  /** Call cb(ir) once the environment's IR exists (generated in the worker; never blocks init). */
  S.whenIR = function (name, cb) {
    const ir = S.getIR(name);
    if (ir) {
      cb(ir);
      return;
    }
    setTimeout(() => S.whenIR(name, cb), 60);
  };

  // ------------------------------------------------------------------
  // Mixer
  // ------------------------------------------------------------------
  S.createContext = function () {
    if (S.ctx) return S.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      S.warnOnce("noaudio", "WebAudio unavailable — sound disabled");
      return null;
    }
    try {
      S.ctx = new AC({ latencyHint: "interactive" });
    } catch (e) {
      try {
        S.ctx = new AC();
      } catch (e2) {
        S.warnOnce("noaudio", "AudioContext failed: " + e2.message);
        return null;
      }
    }
    buildMixer();
    return S.ctx;
  };
  function buildMixer() {
    const c = S.ctx;
    const B = (S.bus = {});
    const g = (v) => {
      const n = c.createGain();
      n.gain.value = v;
      return n;
    };
    // master chain
    B.master = g(S.vol.master);
    B.glue = c.createDynamicsCompressor();
    B.glue.threshold.value = -20;
    B.glue.knee.value = 14;
    B.glue.ratio.value = 3;
    B.glue.attack.value = 0.006;
    B.glue.release.value = 0.22;
    B.makeup = g(1.35);
    B.limiter = c.createDynamicsCompressor();
    B.limiter.threshold.value = -3;
    B.limiter.knee.value = 0;
    B.limiter.ratio.value = 20;
    B.limiter.attack.value = 0.001;
    B.limiter.release.value = 0.09;
    B.master.connect(B.glue);
    B.glue.connect(B.makeup);
    B.makeup.connect(B.limiter);
    B.limiter.connect(c.destination);
    // sfx (volume) ← world filter ← world dry + reverb ; ui
    B.sfx = g(S.vol.sfx);
    B.sfx.connect(B.master);
    B.worldFilter = c.createBiquadFilter();
    B.worldFilter.type = "lowpass";
    B.worldFilter.frequency.value = 20000;
    B.worldFilter.Q.value = 0.5;
    B.worldFilter.connect(B.sfx);
    B.world = g(1);
    B.world.connect(B.worldFilter); // dry world voices
    B.revSend = g(1); // reverb input (per-voice sends)
    B._revName = null;
    S.convs = {}; // environment → {conv, gain, connected}
    // reverbs are generated in the worker (hundreds of ms of maths): the mixer works dry until they land
    S.whenIR("outdoor", (ir) => {
      buildConv("outdoor", ir);
      S.setEnvironment(S.env.wanted || "outdoor");
    });
    B.ui = g(S.vol.ui);
    B.ui.connect(B.sfx);
    // ambience → world filter (so it gets muffled by low health / shell shock too)
    B.amb = g(S.vol.ambience);
    B.amb.connect(B.worldFilter);
    // music: in → (dry + hall reverb) → duck → vol → master
    B.music = g(S.vol.music);
    B.music.connect(B.master);
    B.musicDuck = g(1);
    B.musicDuck.connect(B.music);
    B.musicIn = g(1);
    B.musicIn.connect(B.musicDuck);
    B.musicRevSend = g(1);
    B.musicRev = c.createConvolver();
    S.whenIR("hall", (ir) => {
      try {
        B.musicRev.buffer = ir;
      } catch (e) {
        /* */
      }
    });
    B.musicRevRet = g(0.55);
    B.musicRevSend.connect(B.musicRev);
    B.musicRev.connect(B.musicRevRet);
    B.musicRevRet.connect(B.musicDuck);
    // radio (the settings "Music Volume" also scales the radio: see S.radioGain)
    B.radio = g(S.radioGain());
    B.radio.connect(B.master);
    B.radioDuck = g(1);
    B.radioDuck.connect(B.radio);
    // oscilloscope tap for the goggle radio page (pre-volume, so the scope moves even when turned down)
    try {
      B.radioScope = c.createAnalyser();
      B.radioScope.fftSize = 1024;
      B.radioScope.smoothingTimeConstant = 0.4;
      B.radioDuck.connect(B.radioScope);
    } catch (e) {
      B.radioScope = null;
    }
  }
  /** Radio bus gain: radio volume × music volume (relative to its default) — the HUD's music slider covers "score and radio". */
  S.MUSIC_DEFAULT = 0.55;
  S.radioGain = function () {
    return clamp(
      S.vol.radio * clamp(S.vol.music / S.MUSIC_DEFAULT, 0, 1.5),
      0,
      1,
    );
  };
  let scopeBuf = null;
  /** RMS level (0..1, scaled for display) of the radio signal. */
  S.radioLevel = function () {
    const a = S.bus && S.bus.radioScope;
    if (!a) return 0;
    if (!scopeBuf) scopeBuf = new Float32Array(a.fftSize);
    a.getFloatTimeDomainData(scopeBuf);
    let e = 0;
    for (let i = 0; i < scopeBuf.length; i++) e += scopeBuf[i] * scopeBuf[i];
    return clamp(Math.sqrt(e / scopeBuf.length) * 4, 0, 1);
  };
  /** Copy the live radio waveform into arr (Uint8Array → 0..255 bytes, Float32Array → −1..1). */
  S.radioWave = function (arr) {
    const a = S.bus && S.bus.radioScope;
    if (!a || !arr) return false;
    if (arr instanceof Uint8Array) a.getByteTimeDomainData(arr);
    else a.getFloatTimeDomainData(arr);
    return true;
  };

  /**
   * One persistent ConvolverNode per environment: assigning ConvolverNode.buffer is expensive on the main
   * thread, so each is built once (idle time) and environments are switched by reconnecting + crossfading.
   */
  function buildConv(name, ir) {
    if (S.convs[name] || !ir) return S.convs[name] || null;
    const c = S.ctx,
      conv = c.createConvolver(),
      gain = c.createGain();
    conv.buffer = ir;
    gain.gain.value = 0;
    conv.connect(gain);
    gain.connect(S.bus.worldFilter);
    S.convs[name] = { conv, gain, connected: false, offTimer: null };
    return S.convs[name];
  }
  /** Build the remaining environment convolvers one per idle slot (after their IRs arrive from the worker). */
  S.prepareConvolvers = function () {
    const todo = Object.keys(S.ENVS).filter(
      (n) => !S.convs[n] && !S.ENVS[n].lazy,
    );
    const step = () => {
      const n = todo[0];
      if (!n) return;
      const ir = S.getIR(n);
      if (ir) {
        todo.shift();
        buildConv(n, ir);
      }
      setTimeout(step, ir ? 120 : 300);
    };
    step();
  };
  /** Crossfade the world reverb to a new environment preset. */
  S.setEnvironment = function (name) {
    if (!S.ctx || !S.bus || S.bus._revName === name || !S.ENVS[name]) return;
    S.env.wanted = name;
    let E = S.convs[name];
    if (!E) {
      // not built yet: eager presets are built in idle slots; lazy ones (interior acoustics) are built here once their
      // IR has arrived from the worker — the ambience system retries every 0.5 s meanwhile
      const ir = S.getIR(name);
      if (!ir || !S.ENVS[name].lazy) return;
      E = buildConv(name, ir);
      if (!E) return;
    }
    const t = S.ctx.currentTime,
      B = S.bus;
    // release lazy convolvers that have been idle for a minute (their FFT partitions are the expensive part)
    const nowMs = performance.now();
    for (const n in S.convs) {
      const C = S.convs[n];
      if (
        n === name ||
        n === B._revName ||
        !S.ENVS[n] ||
        !S.ENVS[n].lazy ||
        C.connected ||
        !C.offAt ||
        nowMs - C.offAt < 60000
      )
        continue;
      try {
        C.conv.disconnect();
        C.gain.disconnect();
      } catch (e) {
        /* */
      }
      delete S.convs[n];
    }
    const old = B._revName && S.convs[B._revName];
    clearTimeout(E.offTimer);
    if (!E.connected) {
      B.revSend.connect(E.conv);
      E.connected = true;
    }
    E.gain.gain.cancelScheduledValues(t);
    E.gain.gain.setValueAtTime(E.gain.gain.value, t);
    E.gain.gain.linearRampToValueAtTime(1, t + 1.2);
    if (old) {
      old.gain.gain.cancelScheduledValues(t);
      old.gain.gain.setValueAtTime(old.gain.gain.value, t);
      old.gain.gain.linearRampToValueAtTime(0, t + 1.2);
      old.offTimer = setTimeout(() => {
        if (B._revName !== name || !old.connected) return;
        try {
          B.revSend.disconnect(old.conv);
        } catch (e) {
          /* */
        }
        old.connected = false;
        old.offAt = performance.now();
      }, 5000);
    }
    B._revName = name;
    S.env.name = name;
    S.env.wet = S.ENVS[name].wet;
  };

  /** Smoothly set an AudioParam. */
  S.ramp = function (param, v, time, tau) {
    if (!S.ctx) return;
    const t = S.ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setTargetAtTime(v, t, tau || time / 3 || 0.05);
  };
  /** Dip a bus gain (sidechain-style): to `level` in `a`, hold, recover over `r`. */
  S.duck = function (param, level, a, hold, r) {
    if (!S.ctx) return;
    const t = S.ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
    param.linearRampToValueAtTime(level, t + a);
    param.setValueAtTime(level, t + a + hold);
    param.linearRampToValueAtTime(1, t + a + hold + r);
  };

  // ------------------------------------------------------------------
  // Voice playback
  // ------------------------------------------------------------------
  const NULL_HANDLE = Object.freeze({
    stop() {},
    setVolume() {},
    setPosition() {},
    setPitch() {},
    playing: false,
    isNull: true,
  });
  S.NULL_HANDLE = NULL_HANDLE;
  const lastPlay = {};
  const lastVariant = {};

  function removeVoice(v) {
    const i = S.voices.indexOf(v);
    if (i >= 0) S.voices.splice(i, 1);
    v.playing = false;
    try {
      v.nodes.forEach((n) => n.disconnect());
    } catch (e) {
      /* already */
    }
  }
  // ------------------------------------------------------------------
  // Virtualised positional loops: a positional loop (burning barrel, humming
  // generator, buzzing gasfly) only owns real audio nodes while it is
  // audible; out of range it becomes "virtual" (just data) and is realised
  // again when the listener approaches. The caller's handle stays valid.
  // ------------------------------------------------------------------
  S.loops = [];
  function managedLoop(name, opts) {
    const rec = S.R[name];
    const h = {
      name,
      managed: true,
      playing: true,
      real: null,
      isNull: false,
      opts: Object.assign({}, opts, { _raw: true, loop: true }),
      stop(f) {
        h.playing = false;
        if (h.real) {
          h.real.stop(f);
          h.real = null;
        }
        const i = S.loops.indexOf(h);
        if (i >= 0) S.loops.splice(i, 1);
      },
      setVolume(v, t) {
        h.opts.volume = v;
        if (h.real) h.real.setVolume(v, t);
      },
      setPosition(p) {
        h.opts.pos = p;
        if (h.real) h.real.setPosition(p);
      },
      setPitch(p) {
        h.opts.pitch = p;
        if (h.real) h.real.setPitch(p);
      },
      audibility() {
        const p = h.opts.pos,
          L = S.listenerPos;
        if (!p) return 1;
        const d = Math.hypot(p.x - L.x, (p.y || 0) - L.y, p.z - L.z),
          ref = h.opts.ref || rec.ref;
        return (
          ((h.opts.volume === undefined ? 1 : h.opts.volume) * rec.gain * ref) /
          (ref + rec.rolloff * Math.max(0, d - ref))
        );
      },
    };
    S.loops.push(h);
    if (!S.cache[name]) S.requestBake(name, -1);
    S.updateLoops(true, h);
    return h;
  }
  /**
   * Realise / virtualise managed loops (called 4×/s by the module update). Loops are ranked by audibility and
   * only the S.MAX_REAL_LOOPS loudest own real voices (with a little hysteresis so ranks don't flap); a street
   * full of burning barrels costs a dozen voices, not forty. Real loops re-check occlusion about once a second.
   */
  let occT = 0,
    evT = 0;
  function realise(h) {
    h.real = S.play(h.name, Object.assign({}, h.opts, { randomStart: true }));
    if (h.real.isNull) h.real = null;
  }
  S.updateLoops = function (force, only) {
    if (only) {
      // a freshly started loop: realise straight away if it would make the cut
      if (!only.playing || only.real || !S.cache[only.name]) return;
      let real = 0;
      for (const h of S.loops) if (h.real) real++;
      if (real < S.MAX_REAL_LOOPS && only.audibility() > 0.02) realise(only);
      return;
    }
    const act = [];
    for (const h of S.loops) {
      if (!h.playing) continue;
      if (h.real && !h.real.playing) h.real = null; // its voice was stopped/stolen from outside: re-realise below
      h._a = h.audibility();
      act.push(h);
    }
    act.sort((a, b) => b._a - a._a);
    const recheck = (occT = (occT + 1) % 4) === 0;
    if (++evT >= 20) {
      evT = 0;
      S.evictIdle();
    } // every ~5 s
    for (let rank = 0; rank < act.length; rank++) {
      const h = act[rank],
        a = h._a;
      const want = a > 0.02 && rank < S.MAX_REAL_LOOPS;
      const keep = a > 0.01 && rank < S.MAX_REAL_LOOPS + 3;
      if (!h.real) {
        if (want && S.cache[h.name]) realise(h);
      } else if (!keep) {
        h.real.stop(0.4);
        h.real = null;
      } else if (h.opts.pos) {
        if (h.real.setPosition) h.real.setPosition(h.opts.pos); // follow moving emitters
        if (recheck && h.real.refreshOcclusion) h.real.refreshOcclusion();
      }
    }
    S.stats.realLoops = act.filter((h) => h.real).length;
    S.stats.virtualLoops = act.length - S.stats.realLoops;
    // long positional one-shots (explosion tails, roars, the cryo hatch, a nuke blast) re-test their line of sight
    // twice a second, so ducking behind / stepping out from a wall mid-sound muffles / opens it up
    if (occT % 2 === 0) {
      const now = S.ctx ? S.ctx.currentTime : 0;
      for (const v of S.voices) {
        if (v.loop || !v.pos || !v.refreshOcclusion || v.t0 > now) continue;
        const rec = S.R[v.name];
        if (!rec || rec.dur < 1.5) continue;
        v.refreshOcclusion();
      }
    }
  };

  /** Handle for a looping sound whose buffer is still being generated: binds to the real voice when ready. */
  function deferredVoice(name, opts) {
    let on = true;
    const h = {
      name,
      deferred: true,
      real: null,
      isNull: false,
      opts: Object.assign({}, opts),
      /** false once stopped — or once the bound voice was stopped from outside (G.sfx.stopAll, stealing). */
      get playing() {
        return on && (!h.real || h.real.isNull || h.real.playing !== false);
      },
      stop(f) {
        on = false;
        if (h.real) h.real.stop(f);
      },
      setVolume(v, t) {
        h.opts.volume = v;
        if (h.real) h.real.setVolume(v, t);
      },
      setPosition(p) {
        h.opts.pos = p;
        if (h.real) h.real.setPosition(p);
      },
      setPitch(p) {
        h.opts.pitch = p;
        if (h.real) h.real.setPitch(p);
      },
    };
    S.requestBake(name, -1);
    const tryBind = () => {
      if (!on) return;
      if (S.cache[name]) {
        h.real = S.play(name, h.opts);
        if (h.real.isNull && S.bakeState[name] !== "failed")
          setTimeout(tryBind, 500);
      } else if (S.bakeState[name] !== "failed") setTimeout(tryBind, 200);
    };
    setTimeout(tryBind, 30);
    return h;
  }
  /**
   * Make room for a new voice. Only voices that are already sounding are candidates: a shot scheduled for
   * later (burst fire, a distant firefight) is never killed before it plays. Returns false when the new voice
   * must be refused (every slot is taken by loops or by scheduled-but-not-started voices).
   */
  function stealFor(name, rec) {
    const now = S.ctx.currentTime;
    let same = 0,
      oldest = null;
    for (const v of S.voices) {
      if (v.name !== name || v.loop || v.t0 > now + 0.02) continue;
      same++;
      if (!oldest || v.t0 < oldest.t0) oldest = v;
    }
    if (same >= rec.maxVoices && oldest) oldest.stop(0.03);
    if (S.voices.length >= S.MAX_VOICES) {
      // steal the oldest, quietest sounding one-shot
      let victim = null,
        score = 1e9;
      for (const v of S.voices) {
        if (v.loop || v.t0 > now) continue;
        const s = v.t0 + v.vol * 2;
        if (s < score) {
          score = s;
          victim = v;
        }
      }
      if (!victim) return false;
      victim.stop(0.02);
    }
    return true;
  }
  const _o = { x: 0, y: 0, z: 0 },
    _d = { x: 0, y: 0, z: 0 };
  function occluded(pos, dist) {
    try {
      if (!G.world || !G.world.raycast || dist < 3 || dist > 90) return false;
      const L = S.listenerPos;
      _o.x = L.x;
      _o.y = L.y;
      _o.z = L.z;
      _d.x = (pos.x - L.x) / dist;
      _d.y = ((pos.y || 0) + 0.5 - L.y) / dist;
      _d.z = (pos.z - L.z) / dist;
      const h = G.world.raycast(_o, _d, dist - 1.0, {
        ignoreTags: ["actor", "interactable_self", "prop_small"],
      });
      return !!(h && h.collider && h.dist < dist - 1.2);
    } catch (e) {
      return false;
    }
  }

  /**
   * Core play. opts: {pos, volume, pitch, loop, distant (bool: heavy air absorption), noOcclusion, delay (s), bus}
   */
  S.play = function (name, opts) {
    opts = opts || {};
    name = S.resolve(name);
    const rec = S.R[name];
    if (!rec) {
      S.warnOnce("unk:" + name, 'unknown sfx "' + name + '" (no-op)');
      return NULL_HANDLE;
    }
    const ctx = S.ctx;
    if (!ctx || !S.bus) return NULL_HANDLE;
    const loop = !!(opts.loop || rec.loop);
    if (loop && opts.pos && !opts._raw) return managedLoop(name, opts);
    if (ctx.state !== "running" && !loop) return NULL_HANDLE;
    const now = ctx.currentTime;
    const pos = opts.pos || null;
    // de-duplicate identical non-positional triggers in a short window (several modules may react to one event)
    if (
      !pos &&
      !loop &&
      rec.dedupe &&
      lastPlay[name] !== undefined &&
      now - lastPlay[name] < rec.dedupe
    )
      return NULL_HANDLE;
    let vol = (opts.volume === undefined ? 1 : opts.volume) * rec.gain;
    let dist = 0;
    if (pos) {
      const L = S.listenerPos;
      dist = Math.hypot(pos.x - L.x, (pos.y || 0) - L.y, pos.z - L.z);
      const ref = opts.ref || rec.ref,
        ro = rec.rolloff;
      const est = (vol * ref) / (ref + ro * Math.max(0, dist - ref));
      if (est < 0.006 && !loop) {
        S.stats.culled++;
        return NULL_HANDLE;
      }
    }
    // gun reports: pick the environment tail (indoor slap / outdoor street-canyon roll / far-off boom) for this shot
    let tailPlan = null;
    if (rec.tail && !opts._tail && !loop && (opts.bus || rec.bus) === "world") {
      const indoor = !!INDOOR_ENV[S.env.name];
      const far = !!pos && !indoor && dist > 110,
        mid = !!pos && dist > 30;
      if (far) vol *= 0.3; // the crack and body are mostly gone at that range
      tailPlan = {
        name: "gtail_" + (indoor ? "in" : "out") + "_" + rec.tail,
        k: (mid ? 1.35 : 1) * (rec.tailGain || 1),
        far,
      };
    }
    if (!stealFor(name, rec)) {
      S.stats.refused++;
      return NULL_HANDLE;
    }
    lastPlay[name] = now;
    lastUse[name] = performance.now();
    // pick a variant (avoid immediate repeats)
    const bufs = S.cache[name];
    let vi = 0;
    if (rec.variants > 1) {
      vi = (Math.random() * rec.variants) | 0;
      if (vi === lastVariant[name]) vi = (vi + 1) % rec.variants;
    }
    lastVariant[name] = vi;
    const buf = bufs && bufs[vi];
    if (!bufs) {
      if (rec.gen) S.bakeNow(name);
      else S.requestBake(name, -1);
    }
    const buf2 = buf || (S.cache[name] && S.cache[name][vi]);
    if (!buf2 && loop) return deferredVoice(name, opts);
    // pitch
    let rate =
      (opts.pitch || 1) * (1 + (Math.random() - 0.5) * 2 * rec.pitchVar);
    if (
      rec.bus === "world" &&
      G.timeScale < 0.5 &&
      G.timeScale > 0 &&
      !opts.noSlowmo
    )
      rate *= 0.62;
    const t0 = now + (opts.delay || 0) + 0.004;
    const nodes = [];
    const g = ctx.createGain();
    nodes.push(g);
    g.gain.value = vol;
    let src = null;
    if (buf2) {
      src = ctx.createBufferSource();
      src.buffer = buf2;
      src.playbackRate.value = rate;
      src.loop = loop;
      src.connect(g);
      nodes.push(src);
      src.start(
        t0,
        loop && opts.randomStart ? Math.random() * buf2.duration : 0,
      );
    } else if (rec.build && !loop && !opts.bakedOnly) {
      // live synthesis fallback while the bake is pending
      S.stats.live++;
      const lg = ctx.createGain();
      lg.gain.value = rec._norm || normHints[name] || 0.6;
      lg.connect(g);
      nodes.push(lg);
      try {
        rec.build(new Kit(ctx, lg, t0, Math.random), vi, Math.random, {
          live: true,
        });
      } catch (e) {
        G.reportError("sfx:" + name, e);
      }
    } else {
      return NULL_HANDLE; // loop still baking
    }
    // routing
    const busName = opts.bus || rec.bus;
    const dest =
      opts.dest ||
      (busName === "ui"
        ? S.bus.ui
        : busName === "amb"
          ? S.bus.amb
          : busName === "music"
            ? S.bus.musicIn
            : busName === "radio"
              ? S.bus.radioDuck
              : S.bus.world);
    let tail = g;
    let panner = null,
      air = null,
      occK = 1,
      hrtf = false;
    const airFc = (d, occ) =>
      clamp(
        Math.min(
          20000 * Math.exp(-d / (opts.distant ? 70 : 170)),
          occ ? 900 : 20000,
        ),
        350,
        20000,
      );
    const canOcc = !opts.noOcclusion && busName === "world";
    if (pos) {
      air = ctx.createBiquadFilter();
      air.type = "lowpass";
      nodes.push(air);
      if (canOcc && occluded(pos, dist)) {
        occK = 0.5;
        g.gain.value = vol * occK;
      }
      air.frequency.value = airFc(dist, occK < 1);
      panner = ctx.createPanner();
      nodes.push(panner);
      // HRTF for a limited number of one-shots; loops and the overflow use cheap equal-power panning
      if (!loop) {
        let n = 0;
        for (const v of S.voices) if (v.hrtf) n++;
        hrtf = n < S.MAX_HRTF;
      }
      panner.panningModel = hrtf ? "HRTF" : "equalpower";
      panner.distanceModel = "inverse";
      panner.refDistance = opts.ref || rec.ref;
      panner.rolloffFactor = rec.rolloff;
      panner.maxDistance = 10000;
      setPannerPos(panner, pos);
      tail.connect(air);
      air.connect(panner);
      tail = panner;
    }
    tail.connect(dest);
    // reverb send (world sounds only)
    if (busName === "world" && rec.wet > 0) {
      const send = ctx.createGain();
      nodes.push(send);
      send.gain.value =
        S.env.wet * rec.wet * clamp(1 + dist / 35, 1, opts.distant ? 3.5 : 2.2);
      tail.connect(send);
      send.connect(S.bus.revSend);
    }
    S.stats.played++;
    const voice = {
      name,
      t0,
      loop,
      vol,
      nodes,
      src,
      gain: g,
      playing: true,
      hrtf,
      pos,
      stop(fade) {
        if (!voice.playing) return;
        const t = ctx.currentTime,
          f = fade === undefined ? 0.06 : fade;
        try {
          g.gain.cancelScheduledValues(t);
          g.gain.setValueAtTime(g.gain.value, t);
          g.gain.linearRampToValueAtTime(0, t + f);
        } catch (e) {
          /* */
        }
        voice.playing = false;
        const i = S.voices.indexOf(voice);
        if (i >= 0) S.voices.splice(i, 1); // frees the slot immediately
        setTimeout(
          () => {
            try {
              if (src) src.stop();
            } catch (e) {
              /* */
            }
            removeVoice(voice);
          },
          (f + 0.05) * 1000,
        );
      },
      setVolume(v, time) {
        if (!voice.playing) return;
        const t = ctx.currentTime;
        voice.vol = v * rec.gain;
        g.gain.cancelScheduledValues(t);
        g.gain.setTargetAtTime(voice.vol * occK, t, time || 0.05);
      },
      setPitch(p) {
        voice.baseRate = p;
        voice.dop = 1;
        if (src) src.playbackRate.setTargetAtTime(p, ctx.currentTime, 0.05);
      },
      setPosition(p) {
        if (
          !panner ||
          !p ||
          !(isFinite(p.x) && isFinite(p.z) && isFinite(p.y || 0))
        )
          return;
        voice.pos = p;
        setPannerPos(panner, p);
        const L = S.listenerPos,
          d = Math.hypot(p.x - L.x, (p.y || 0) - L.y, p.z - L.z),
          t = ctx.currentTime;
        if (air) air.frequency.setTargetAtTime(airFc(d, occK < 1), t, 0.1);
        // Doppler for moving emitters (drones, robots, vehicles): the EMITTER's own velocity (wall-clock time between
        // position updates, not the audio clock's callback-quantised currentTime), projected on the listener→emitter
        // axis → playback rate, smoothed & clamped (0.8–1.25: rotorcraft/projectile flybys). The listener's smoothed
        // velocity is subtracted (relative motion); it is zeroed on any > 5 m frame jump, so teleports, fast travel and
        // doors never read as a sudden approach; an emitter jumping > 10 m in one update resets it.
        if (src && isFinite(d) && d > 0.01) {
          const tn = performance.now() / 1000,
            pp = voice.pPrev;
          if (!pp) {
            voice.pPrev = { x: p.x, y: p.y || 0, z: p.z };
            voice.pT = tn;
          } else {
            const dt = tn - voice.pT;
            if (dt >= 0.03) {
              const mx = p.x - pp.x,
                my = (p.y || 0) - pp.y,
                mz = p.z - pp.z,
                moved = Math.hypot(mx, my, mz);
              let k = 1;
              if (moved <= 10 && dt < 0.5) {
                // relative radial speed: emitter velocity minus the (smoothed, teleport-safe) listener velocity
                const LV = S.listenerVel,
                  rx = mx / dt - LV.x,
                  ry = my / dt - LV.y,
                  rz = mz / dt - LV.z;
                const vr = clamp(
                  (rx * (p.x - L.x) +
                    ry * ((p.y || 0) - L.y) +
                    rz * (p.z - L.z)) /
                    d,
                  -90,
                  90,
                ); // + = receding
                k = clamp(343 / (343 + vr), 0.8, 1.25);
                voice.dop = (voice.dop || 1) * 0.7 + k * 0.3;
              } else voice.dop = 1; // jumped (respawn/teleport) or stale: no pitch bend
              if (Math.abs(voice.dop - 1) > 0.002 || voice.dopOn) {
                voice.dopOn = Math.abs(voice.dop - 1) > 0.002;
                src.playbackRate.setTargetAtTime(
                  (voice.baseRate || rate) * voice.dop,
                  t,
                  0.08,
                );
              }
              pp.x = p.x;
              pp.y = p.y || 0;
              pp.z = p.z;
              voice.pT = tn;
            }
          }
        }
      },
      /** Re-test the line of sight (long-lived positional voices) and glide the muffle in/out. */
      refreshOcclusion() {
        if (!voice.playing || !air || !canOcc || !voice.pos) return;
        const p = voice.pos,
          L = S.listenerPos,
          d = Math.hypot(p.x - L.x, (p.y || 0) - L.y, p.z - L.z);
        if (!isFinite(d)) return;
        const k = occluded(p, d) ? 0.5 : 1;
        if (k === occK) return;
        occK = k;
        const t = ctx.currentTime;
        air.frequency.setTargetAtTime(airFc(d, k < 1), t, 0.25);
        g.gain.cancelScheduledValues(t);
        g.gain.setTargetAtTime(voice.vol * k, t, 0.25);
      },
    };
    S.voices.push(voice);
    if (tailPlan) playTail(tailPlan, opts, now);
    if (src)
      src.onended = () => {
        if (voice.playing || S.voices.includes(voice)) removeVoice(voice);
      };
    else
      setTimeout(
        () => removeVoice(voice),
        (rec.dur / rate + 0.2 + (opts.delay || 0)) * 1000,
      );
    if (rec.onPlay) {
      try {
        rec.onPlay(opts, dist, voice);
      } catch (e) {
        G.reportError("sfx:onPlay:" + name, e);
      }
    }
    return voice;
  };
  const INDOOR_ENV = {
    room: 1,
    cryo: 1,
    hall: 1,
    tunnel: 1,
    stone: 1,
    small: 1,
    office: 1,
    gallery: 1,
    cathedral: 1,
    concourse: 1,
    auditorium: 1,
    hull: 1,
    bunker: 1,
    industrial: 1,
  };
  const lastTail = {};
  /** The environment layer of a gunshot (see gtail_* in 10_recipes_weapons.js). Automatic fire: ≤ 1 tail / 90 ms. */
  function playTail(tp, opts, now) {
    const key = tp.name + (opts.pos ? "@" : "");
    if (lastTail[key] !== undefined && now - lastTail[key] < 0.09) return;
    lastTail[key] = now;
    const to = {
      pos: opts.pos,
      volume: (opts.volume === undefined ? 1 : opts.volume) * tp.k,
      pitch: 0.97 + (opts.pitch || 1) * 0.03,
      delay: opts.delay,
      noOcclusion: true,
      distant: opts.distant,
      _tail: true,
    };
    S.play(tp.name, to);
    if (tp.far)
      S.play(
        tp.name.replace(/_out_|_in_/, "_far_"),
        Object.assign({}, to, { distant: true, volume: to.volume * 1.2 }),
      );
  }
  function setPannerPos(p, pos) {
    const y = pos.y || 0;
    if (p.positionX) {
      p.positionX.value = pos.x;
      p.positionY.value = y;
      p.positionZ.value = pos.z;
    } else p.setPosition(pos.x, y, pos.z);
  }
  S.setPannerPos = setPannerPos;

  /** Update the AudioListener from the camera (called each frame). */
  const _m = new Float32Array(16);
  S.syncListener = function () {
    const ctx = S.ctx,
      cam = G.camera;
    if (!ctx || !cam) return;
    cam.updateMatrixWorld();
    const e = cam.matrixWorld.elements;
    const px = e[12],
      py = e[13],
      pz = e[14];
    const fx = -e[8],
      fy = -e[9],
      fz = -e[10],
      ux = e[4],
      uy = e[5],
      uz = e[6];
    // smoothed listener velocity for Doppler (relative motion); a jump > 5 m in one frame (teleport, door, fast
    // travel, respawn) or a stall resets it instead of reading as a 1000 m/s approach
    const tn = performance.now() / 1000,
      LV = S.listenerVel,
      ldt = tn - LV.t;
    if (ldt > 0.004) {
      const mx = px - S.listenerPos.x,
        my = py - S.listenerPos.y,
        mz = pz - S.listenerPos.z;
      if (ldt < 0.25 && mx * mx + my * my + mz * mz < 25) {
        const a = Math.min(1, ldt / 0.12);
        LV.x += (mx / ldt - LV.x) * a;
        LV.y += (my / ldt - LV.y) * a;
        LV.z += (mz / ldt - LV.z) * a;
      } else {
        LV.x = 0;
        LV.y = 0;
        LV.z = 0;
      }
      LV.t = tn;
    }
    S.listenerPos.x = px;
    S.listenerPos.y = py;
    S.listenerPos.z = pz;
    S.listenerFwd.x = fx;
    S.listenerFwd.y = fy;
    S.listenerFwd.z = fz;
    // skip the AudioParam writes when the camera hasn't moved/turned (no automation churn on the audio thread)
    const E = 1e-4;
    if (
      Math.abs(px - _m[0]) < 1e-3 &&
      Math.abs(py - _m[1]) < 1e-3 &&
      Math.abs(pz - _m[2]) < 1e-3 &&
      Math.abs(fx - _m[3]) < E &&
      Math.abs(fy - _m[4]) < E &&
      Math.abs(fz - _m[5]) < E &&
      Math.abs(ux - _m[6]) < E &&
      Math.abs(uy - _m[7]) < E &&
      Math.abs(uz - _m[8]) < E &&
      _m[9] === 1
    )
      return;
    _m[0] = px;
    _m[1] = py;
    _m[2] = pz;
    _m[3] = fx;
    _m[4] = fy;
    _m[5] = fz;
    _m[6] = ux;
    _m[7] = uy;
    _m[8] = uz;
    _m[9] = 1;
    const L = ctx.listener;
    if (L.positionX) {
      // direct .value writes: one immediate update each, no per-frame automation events
      L.positionX.value = px;
      L.positionY.value = py;
      L.positionZ.value = pz;
      L.forwardX.value = fx;
      L.forwardY.value = fy;
      L.forwardZ.value = fz;
      L.upX.value = ux;
      L.upY.value = uy;
      L.upZ.value = uz;
    } else if (L.setPosition) {
      L.setPosition(px, py, pz);
      L.setOrientation(fx, fy, fz, ux, uy, uz);
    }
  };

  // ------------------------------------------------------------------
  // Unlock on first gesture
  // ------------------------------------------------------------------
  S.unlockHandlers = [];
  S.onUnlock = function (fn) {
    if (S.ctx && S.ctx.state === "running") {
      try {
        fn();
      } catch (e) {
        G.reportError("sound:unlock", e);
      }
    } else S.unlockHandlers.push(fn);
  };
  function tryUnlock() {
    if (!S.ctx) return;
    if (S.ctx.state !== "running") {
      const p = S.ctx.resume();
      if (p && p.then) p.then(fireUnlock).catch(() => {});
    } else fireUnlock();
  }
  function fireUnlock() {
    if (!S.ctx || S.ctx.state !== "running") return;
    const hs = S.unlockHandlers.splice(0);
    hs.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        G.reportError("sound:unlock", e);
      }
    });
  }
  S.installUnlock = function () {
    ["pointerdown", "mousedown", "keydown", "touchstart"].forEach((ev) =>
      window.addEventListener(ev, tryUnlock, { capture: true, passive: true }),
    );
    if (S.ctx)
      S.ctx.addEventListener &&
        S.ctx.addEventListener("statechange", () => {
          if (S.ctx.state === "running") fireUnlock();
        });
    tryUnlock();
  };

  // ------------------------------------------------------------------
  // Background work queue (time-sliced small tasks, e.g. instrument sample generation)
  // ------------------------------------------------------------------
  const taskQ = [];
  let taskTimer = null;
  S.task = function (fn) {
    taskQ.push(fn);
    if (!taskTimer) taskTimer = setTimeout(runTasks, 0);
  };
  function runTasks() {
    taskTimer = null;
    const t0 = performance.now();
    while (taskQ.length && performance.now() - t0 < 8) {
      const fn = taskQ.shift();
      try {
        fn();
      } catch (e) {
        G.reportError("sound:task", e);
      }
    }
    if (taskQ.length) taskTimer = setTimeout(runTasks, 4);
  }

  S.init = function () {
    S.noiseBufs = makeNoiseBuffers();
    S.createContext();
  };
})();
