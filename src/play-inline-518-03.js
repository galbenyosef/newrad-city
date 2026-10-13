// play-inline-518 03 — env
// Lines 713-939 of readable/play-inline-518.pretty.js (statement-aligned).
  K.canvasTex = function (w, h, draw) {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d");
    draw(ctx, w, h);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace || t.colorSpace;
    if (
      THREE.sRGBEncoding !== undefined &&
      t.encoding !== undefined &&
      !THREE.SRGBColorSpace
    )
      t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  };

  // ------------------------------------------------------------------
  // Sound: sound-module names + a tiny custom synth on the same AudioContext
  // ------------------------------------------------------------------
  K.sfx = function (name, opts) {
    try {
      if (!G.isStub("sfx") && typeof G.sfx.play === "function")
        return G.sfx.play(name, opts || {}) || null;
    } catch (e) {
      /* ignore */
    }
    return null;
  };
  const SY = (K.synth = {});
  SY.ctx = function () {
    try {
      const c = !G.isStub("sfx") ? G.sfx.context : null;
      return c && c.state === "running" ? c : null;
    } catch (e) {
      return null;
    }
  };
  /** Effective SFX volume (master × sfx), from the sound module's persisted settings. */
  SY.vol = function () {
    try {
      const v = G.sfx.getVolumes ? G.sfx.getVolumes() : null;
      if (v)
        return (
          (v.master !== undefined ? v.master : 1) *
          (v.sfx !== undefined ? v.sfx : 1)
        );
    } catch (e) {
      /* ignore */
    }
    return 0.8;
  };
  let noiseBuf = null;
  SY.noise = function (c) {
    if (noiseBuf && noiseBuf.sampleRate === c.sampleRate) return noiseBuf;
    const n = Math.floor(c.sampleRate * 2);
    noiseBuf = c.createBuffer(1, n, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b = 0.97 * b + 0.03 * w;
      d[i] = w * 0.55 + b * 2.2;
    }
    return noiseBuf;
  };
  /** Positional output chain → destination. Returns {input, panner, out}. */
  SY.chain = function (c, pos, refDist, gain) {
    const out = c.createGain();
    out.gain.value = (gain || 1) * SY.vol();
    let input = out,
      panner = null;
    if (pos) {
      panner = c.createPanner();
      panner.panningModel = "equalpower";
      panner.distanceModel = "inverse";
      panner.refDistance = refDist || 6;
      panner.rolloffFactor = 1.2;
      panner.maxDistance = 3000;
      if (panner.positionX) {
        panner.positionX.value = pos.x;
        panner.positionY.value = pos.y;
        panner.positionZ.value = pos.z;
      } else panner.setPosition(pos.x, pos.y, pos.z);
      panner.connect(out);
      input = panner;
    }
    out.connect(c.destination);
    return { input, panner, out };
  };
  /** World is paused / dead / title → no new world sounds. */
  SY.worldAudible = () => G.worldRunning && G.worldRunning() && K.playerOk();

  /** Ox bellow: a formant "mooo" from one throat; `low` adds a short grunt a beat later. */
  SY.moo = function (pos, pitch, grunt) {
    const c = SY.ctx();
    if (!c || !SY.worldAudible()) return;
    const t0 = c.currentTime + 0.02;
    const voice = (tt, f0, dur, g) => {
      const ch = SY.chain(c, pos, 7, g);
      const o1 = c.createOscillator(),
        o2 = c.createOscillator();
      o1.type = "sawtooth";
      o2.type = "sawtooth";
      o1.frequency.setValueAtTime(f0 * 1.15, tt);
      o1.frequency.exponentialRampToValueAtTime(f0, tt + 0.25);
      o1.frequency.exponentialRampToValueAtTime(f0 * 0.8, tt + dur);
      o2.frequency.setValueAtTime(f0 * 1.16, tt);
      o2.frequency.exponentialRampToValueAtTime(f0 * 1.01, tt + 0.25);
      o2.frequency.exponentialRampToValueAtTime(f0 * 0.79, tt + dur);
      const f1 = c.createBiquadFilter();
      f1.type = "bandpass";
      f1.frequency.setValueAtTime(320, tt);
      f1.frequency.linearRampToValueAtTime(620, tt + 0.35);
      f1.frequency.linearRampToValueAtTime(380, tt + dur);
      f1.Q.value = 3;
      const f2 = c.createBiquadFilter();
      f2.type = "bandpass";
      f2.frequency.value = 950;
      f2.Q.value = 5;
      const env = c.createGain();
      env.gain.setValueAtTime(0.0001, tt);
      env.gain.exponentialRampToValueAtTime(0.5, tt + 0.12);
      env.gain.setValueAtTime(0.5, tt + dur * 0.7);
      env.gain.exponentialRampToValueAtTime(0.0001, tt + dur);
      const mix = c.createGain();
      mix.gain.value = 0.35;
      o1.connect(f1);
      o2.connect(f1);
      o1.connect(f2);
      f1.connect(env);
      f2.connect(mix);
      mix.connect(env);
      env.connect(ch.input);
      o1.start(tt);
      o2.start(tt);
      o1.stop(tt + dur + 0.05);
      o2.stop(tt + dur + 0.05);
    };
    const f = 88 * (pitch || 1);
    voice(t0, f, 1.35, 0.9);
    if (grunt) voice(t0 + 1.5 + Math.random() * 0.3, f * 0.92, 0.35, 0.5);
  };
  /** Wing flutter burst (a pigeon flock taking off). */
  SY.flutter = function (pos, strength) {
    const c = SY.ctx();
    if (!c || !SY.worldAudible()) return;
    const t0 = c.currentTime + 0.01,
      dur = 0.9 + 0.4 * (strength || 1);
    const ch = SY.chain(c, pos, 5, 0.9 * (strength || 1));
    const src = c.createBufferSource();
    src.buffer = SY.noise(c);
    src.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2400;
    bp.Q.value = 0.8;
    const am = c.createGain();
    am.gain.value = 0;
    const lfo = c.createOscillator();
    lfo.type = "square";
    lfo.frequency.setValueAtTime(19, t0);
    lfo.frequency.linearRampToValueAtTime(12, t0 + dur);
    const lg = c.createGain();
    lg.gain.value = 0.5;
    lfo.connect(lg);
    lg.connect(am.gain);
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(0.7, t0 + 0.05);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp);
    bp.connect(am);
    am.connect(env);
    env.connect(ch.input);
    src.start(t0, Math.random());
    lfo.start(t0);
    src.stop(t0 + dur + 0.05);
    lfo.stop(t0 + dur + 0.05);
  };
  /** The Stranger's three-note sting (original motif: low brass-ish swell). */
  SY.sting = function () {
    const c = SY.ctx();
    if (!c) return;
    const t0 = c.currentTime + 0.02;
    const ch = SY.chain(c, null, 1, 0.35);
    const notes = [
      [146.8, 0, 0.32],
      [138.6, 0.36, 0.32],
      [110, 0.74, 1.6],
    ];
    for (const [f, dt, d] of notes) {
      const tt = t0 + dt;
      const o = c.createOscillator(),
        o2 = c.createOscillator();
      o.type = "sawtooth";
      o2.type = "square";
      o.frequency.value = f;
      o2.frequency.value = f * 0.5;
      const lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(400, tt);
      lp.frequency.linearRampToValueAtTime(1400, tt + d * 0.4);
      lp.frequency.linearRampToValueAtTime(500, tt + d);
      const env = c.createGain();
      env.gain.setValueAtTime(0.0001, tt);
      env.gain.exponentialRampToValueAtTime(0.6, tt + 0.06);
      env.gain.setValueAtTime(0.6, tt + d * 0.6);
      env.gain.exponentialRampToValueAtTime(0.0001, tt + d);
      const g2 = c.createGain();
      g2.gain.value = 0.4;
      o.connect(lp);
      o2.connect(g2);
      g2.connect(lp);
      lp.connect(env);
      env.connect(ch.input);
      o.start(tt);
      o2.start(tt);
      o.stop(tt + d + 0.05);
      o2.stop(tt + d + 0.05);
    }
  };
  /**
   * Continuous rotor wash for a Rotorcraft (blade-slap AM on filtered noise + turbine whine).
   * Returns a handle {update(pos, vel, level, realDt), stop()}. Silently a no-op without audio.
   */
