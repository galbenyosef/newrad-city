// play-inline-23 01 — math
// Lines 24-370 of readable/play-inline-23.pretty.js (statement-aligned).
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
