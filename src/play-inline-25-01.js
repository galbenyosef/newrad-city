// play-inline-25 01 — mix
// Lines 13-332 of readable/play-inline-25.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;
  const D = S.define;

  /**
   * Generic layered gunshot.
   * p: {crackF, crackD, crackPeak, bodyF, bodyF2, bodyD, bodyPeak, dist, thumpF0, thumpF1, thumpD, thumpPeak,
   *     ringF (array of barrel ring freqs), ringPeak, mechT, mechF, mechPeak, tailD, tailF, tailPeak, echoT, echoFb, echoWet, echo2T}
   */
  function gunshot(k, p) {
    const mix = k.gain(1);
    mix.connect(k.out);
    const j = (v, amt) => v * (1 + (k.r() - 0.5) * 2 * (amt || 0.08)); // per-variant jitter
    // The environment (street-canyon slap-backs outdoors, a hard room slap indoors, the far-off rolling boom) is
    // NOT baked into the report any more: it is a separate runtime layer (gtail_* below) chosen per shot from the
    // listener's environment and the distance. p.envTail === false bakes the old outdoor echoes in.
    const envT = p.envTail !== false;
    const echo = envT
      ? null
      : k.echo(
          j(p.echoT || 0.13),
          p.echoFb || 0.28,
          p.echoLp || 1400,
          p.echoWet || 0.35,
        );
    if (echo) echo.output.connect(mix);
    let echo2 = null;
    if (!envT && p.echo2T) {
      echo2 = k.echo(j(p.echo2T), 0.2, 900, 0.25);
      echo2.output.connect(mix);
    }
    // 1. crack — bright short transient (supersonic snap)
    k.burst({
      kind: "white",
      a: 0.0002,
      d: j(p.crackD || 0.01),
      peak: p.crackPeak || 1,
      type: "highpass",
      f: j(p.crackF || 2800),
      q: 0.8,
      dest: mix,
    });
    // an N-wave "pop": square single cycle
    k.tone({
      type: "square",
      f: j(p.popF || 1100),
      a: 0.0002,
      d: 0.006,
      peak: (p.crackPeak || 1) * 0.5,
      dest: mix,
    });
    // 2. body — distorted, low-passed noise with closing filter
    const body = k.burst({
      kind: "white",
      a: 0.0006,
      d: j(p.bodyD),
      peak: p.bodyPeak || 1,
      type: "lowpass",
      q: 0.9,
      f: j(p.bodyF),
      f2: p.bodyF2 || p.bodyF * 0.35,
      fT: p.bodyD * 1.2,
      shaper: p.dist || 3,
      dest: mix,
    });
    if (echo) body.connect(echo.input);
    if (echo2) body.connect(echo2.input);
    // 3. thump — sub sine drop
    const th = k.tone({
      type: "sine",
      f: j(p.thumpF0),
      f2: p.thumpF1,
      glide: p.thumpD * 0.7,
      a: 0.0015,
      d: j(p.thumpD),
      peak: p.thumpPeak || 1,
    });
    k.chain(th.g, k.shaper(1.5), mix);
    // 4. barrel / receiver ring (metallic resonance) — gives each gun a character
    if (p.ringF) {
      const m = k.metal(
        1,
        p.ringF.map((f) => j(f, 0.04)),
        30,
      );
      const exc = k.burst({
        kind: "white",
        a: 0.0003,
        d: 0.012,
        peak: p.ringPeak || 0.5,
        type: "highpass",
        f: 800,
        dest: m.input,
      });
      void exc;
      const rg = k.gain(1);
      k.chain(m.output, rg, mix);
      k.env(rg.gain, [
        [0, 1],
        [p.ringD || 0.25, 0.001],
      ]);
    }
    // 5. mechanical action (slide / bolt / cylinder)
    if (p.mechT) {
      const mt = j(p.mechT, 0.1);
      k.burst({
        kind: "white",
        start: mt,
        a: 0.0005,
        d: 0.018,
        peak: p.mechPeak || 0.25,
        type: "bandpass",
        f: j(p.mechF || 3200),
        q: 3,
        dest: mix,
      });
      k.burst({
        kind: "white",
        start: mt + 0.012,
        a: 0.0005,
        d: 0.02,
        peak: (p.mechPeak || 0.25) * 0.7,
        type: "bandpass",
        f: j((p.mechF || 3200) * 0.7),
        q: 4,
        dest: mix,
      });
    }
    // 6. tail — rolling low rumble (outdoor decay), goes to the echo too
    const tail = k.burst({
      kind: "pink",
      start: 0.004,
      a: 0.012,
      d: j(p.tailD) * (envT ? 0.3 : 1),
      peak: (p.tailPeak || 0.3) * (envT ? 0.75 : 1),
      type: "lowpass",
      q: 0.6,
      f: j(p.tailF || 1200),
      f2: (p.tailF || 1200) * 0.3,
      fT: p.tailD * (envT ? 0.3 : 1),
      dest: mix,
    });
    if (echo) tail.connect(echo.input);
    return mix;
  }

  // ------------------------------------------------------------------
  // Ballistic guns
  // ------------------------------------------------------------------
  D("gun_pistol", {
    dur: 1.2,
    variants: 3,
    gain: 0.95,
    ref: 14,
    maxVoices: 5,
    priority: 1,
    pitchVar: 0.04,
    build(k) {
      gunshot(k, {
        crackF: 3000,
        crackD: 0.009,
        bodyF: 2600,
        bodyD: 0.07,
        dist: 4,
        thumpF0: 190,
        thumpF1: 60,
        thumpD: 0.08,
        thumpPeak: 0.8,
        ringF: [1850, 3100, 4700],
        ringPeak: 0.25,
        ringD: 0.12,
        mechT: 0.045,
        mechF: 3600,
        mechPeak: 0.28,
        tailD: 0.5,
        tailF: 1300,
        tailPeak: 0.26,
        echoT: 0.11,
      });
    },
  });
  D("gun_magnum", {
    dur: 1.6,
    variants: 3,
    gain: 1.0,
    ref: 18,
    maxVoices: 4,
    priority: 2,
    pitchVar: 0.04,
    build(k) {
      gunshot(k, {
        crackF: 2600,
        crackD: 0.012,
        crackPeak: 1.2,
        bodyF: 2000,
        bodyD: 0.12,
        dist: 6,
        thumpF0: 140,
        thumpF1: 42,
        thumpD: 0.15,
        thumpPeak: 1.25,
        ringF: [1320, 2450, 3900],
        ringPeak: 0.3,
        ringD: 0.18,
        mechT: 0.07,
        mechF: 2600,
        mechPeak: 0.18,
        tailD: 0.95,
        tailF: 1100,
        tailPeak: 0.38,
        echoT: 0.14,
        echo2T: 0.37,
      });
    },
  });
  D("gun_smg", {
    dur: 0.7,
    variants: 4,
    gain: 0.85,
    ref: 12,
    maxVoices: 6,
    priority: 1,
    pitchVar: 0.05,
    dedupe: 0,
    build(k) {
      gunshot(k, {
        crackF: 3300,
        crackD: 0.007,
        bodyF: 2300,
        bodyD: 0.05,
        dist: 5,
        thumpF0: 170,
        thumpF1: 70,
        thumpD: 0.05,
        thumpPeak: 0.7,
        ringF: [2100, 3500],
        ringPeak: 0.2,
        ringD: 0.08,
        mechT: 0.025,
        mechF: 4200,
        mechPeak: 0.18,
        tailD: 0.28,
        tailF: 1400,
        tailPeak: 0.16,
        echoT: 0.1,
        echoFb: 0.2,
      });
    },
  });
  D("gun_rifle", {
    dur: 1.6,
    variants: 4,
    gain: 1.0,
    ref: 18,
    maxVoices: 6,
    priority: 1,
    pitchVar: 0.04,
    dedupe: 0,
    build(k) {
      gunshot(k, {
        crackF: 3600,
        crackD: 0.008,
        crackPeak: 1.25,
        popF: 1500,
        bodyF: 3200,
        bodyD: 0.09,
        dist: 6,
        thumpF0: 150,
        thumpF1: 45,
        thumpD: 0.12,
        thumpPeak: 1.0,
        ringF: [1600, 2900, 4400],
        ringPeak: 0.22,
        ringD: 0.1,
        mechT: 0.035,
        mechF: 3900,
        mechPeak: 0.2,
        tailD: 0.9,
        tailF: 1500,
        tailPeak: 0.36,
        echoT: 0.14,
        echoFb: 0.33,
        echo2T: 0.31,
      });
    },
  });
  D("gun_hunting", {
    dur: 2.4,
    variants: 3,
    gain: 1.05,
    ref: 22,
    maxVoices: 4,
    priority: 2,
    pitchVar: 0.03,
    build(k) {
      gunshot(k, {
        crackF: 3200,
        crackD: 0.011,
        crackPeak: 1.35,
        popF: 1300,
        bodyF: 2300,
        bodyD: 0.15,
        dist: 7,
        thumpF0: 115,
        thumpF1: 36,
        thumpD: 0.22,
        thumpPeak: 1.35,
        ringF: [1200, 2250, 3500],
        ringPeak: 0.2,
        ringD: 0.2,
        tailD: 1.5,
        tailF: 1100,
        tailPeak: 0.48,
        echoT: 0.19,
        echoFb: 0.32,
        echo2T: 0.43,
      });
    },
  });
