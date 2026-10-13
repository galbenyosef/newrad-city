// play-inline-23 05 — connect
// Lines 1301-1639 of readable/play-inline-23.pretty.js (statement-aligned).
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
