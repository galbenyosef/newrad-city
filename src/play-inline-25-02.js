// play-inline-25 02 — gain
// Lines 333-539 of readable/play-inline-25.pretty.js (statement-aligned).
  D("gun_sniper", {
    dur: 2.8,
    variants: 2,
    gain: 1.1,
    ref: 26,
    maxVoices: 3,
    priority: 3,
    pitchVar: 0.03,
    build(k) {
      gunshot(k, {
        crackF: 4000,
        crackD: 0.013,
        crackPeak: 1.6,
        popF: 1700,
        bodyF: 2500,
        bodyD: 0.17,
        dist: 8,
        thumpF0: 105,
        thumpF1: 32,
        thumpD: 0.26,
        thumpPeak: 1.4,
        ringF: [1100, 2050, 3300],
        ringPeak: 0.2,
        ringD: 0.25,
        tailD: 1.9,
        tailF: 1000,
        tailPeak: 0.55,
        echoT: 0.22,
        echoFb: 0.35,
        echo2T: 0.55,
      });
    },
  });
  D("gun_shotgun", {
    dur: 2.0,
    variants: 3,
    gain: 1.1,
    ref: 18,
    maxVoices: 4,
    priority: 1,
    pitchVar: 0.04,
    build(k) {
      gunshot(k, {
        crackF: 2200,
        crackD: 0.014,
        crackPeak: 0.8,
        popF: 700,
        bodyF: 1700,
        bodyF2: 300,
        bodyD: 0.22,
        bodyPeak: 1.3,
        dist: 9,
        thumpF0: 95,
        thumpF1: 34,
        thumpD: 0.24,
        thumpPeak: 1.5,
        tailD: 1.2,
        tailF: 900,
        tailPeak: 0.5,
        echoT: 0.16,
        echoFb: 0.3,
        echo2T: 0.39,
      });
      // pellet spread: a smear of tiny crackles right after the blast
      k.grains({
        start: 0.002,
        span: 0.03,
        n: 10,
        f: 3500,
        q: 0.8,
        gain: 0.3,
        len: 0.004,
      });
    },
  });
  D("gun_minigun", {
    dur: 0.45,
    variants: 4,
    gain: 0.8,
    ref: 16,
    maxVoices: 8,
    priority: 2,
    pitchVar: 0.06,
    dedupe: 0,
    build(k) {
      gunshot(k, {
        crackF: 3400,
        crackD: 0.006,
        bodyF: 2600,
        bodyD: 0.035,
        dist: 6,
        thumpF0: 170,
        thumpF1: 85,
        thumpD: 0.04,
        thumpPeak: 0.8,
        tailD: 0.14,
        tailF: 1400,
        tailPeak: 0.12,
        echoT: 0.09,
        echoFb: 0.15,
        echoWet: 0.2,
      });
      // barrel-cluster rattle + motor whine
      k.grains({
        start: 0.008,
        span: 0.03,
        n: 3,
        f: 2600,
        q: 5,
        gain: 0.35,
        len: 0.006,
      });
      const w = k.osc("sawtooth", k.rr(400, 440), 0, 0.09);
      const wg = k.gain(0);
      k.perc(wg.gain, 0, 0.12, 0.004, 0.07);
      k.chain(w, k.filt("bandpass", 900, 3), wg, k.out);
    },
  });
  D("gun_pipe", {
    dur: 1.2,
    variants: 3,
    gain: 0.9,
    ref: 13,
    maxVoices: 5,
    priority: 3,
    build(k) {
      gunshot(k, {
        crackF: 2500,
        crackD: 0.01,
        bodyF: 2000,
        bodyD: 0.08,
        dist: 8,
        thumpF0: 170,
        thumpF1: 55,
        thumpD: 0.09,
        thumpPeak: 0.8,
        ringF: [690, 1650, 2870, 4100],
        ringPeak: 0.6,
        ringD: 0.35,
        mechT: 0.05,
        mechF: 2200,
        mechPeak: 0.3,
        tailD: 0.5,
        tailF: 1100,
        tailPeak: 0.25,
        echoT: 0.12,
      });
    },
  });
  D("gun_bb", {
    dur: 0.4,
    variants: 2,
    gain: 0.45,
    ref: 5,
    maxVoices: 3,
    priority: 6,
    build(k) {
      k.burst({
        a: 0.001,
        d: 0.05,
        peak: 0.8,
        type: "bandpass",
        f: 1400,
        q: 1.2,
      }); // air puff
      k.tone({
        type: "sine",
        f: 950,
        f2: 760,
        glide: 0.08,
        a: 0.001,
        d: 0.09,
        peak: 0.25,
      }); // spring
      k.burst({
        start: 0.005,
        a: 0.0003,
        d: 0.008,
        peak: 0.6,
        type: "highpass",
        f: 3000,
      }); // click
      k.burst({
        start: 0.14,
        a: 0.001,
        d: 0.03,
        peak: 0.25,
        type: "bandpass",
        f: 2600,
        q: 3,
      }); // cock lever
    },
  });

  // ------------------------------------------------------------------
  // Report tails — the environment layer of every gunshot (played by S.play next to the dry report):
  //   gtail_out_*  outdoors: a rolling rumble down the street canyon + discrete slap-backs off the facades,
  //                each later one darker and quieter (the city "crack-and-roll")
  //   gtail_in_*   indoors: dense bright early reflections, a boomy short room decay and a low room mode
  //   gtail_far_*  a shot > 110 m away outdoors: no crack left, just a dull low boom and a long roll
  // sizes: s (pistol/SMG/energy), m (rifle/magnum/shotgun), l (hunting/sniper)
  // ------------------------------------------------------------------
  const TSZ = {
    s: { d: 0.9, f: 1400, pk: 0.55, n: 3, room: 0.35, boom: 0.6 },
    m: { d: 1.5, f: 1150, pk: 0.65, n: 4, room: 0.5, boom: 0.85 },
    l: { d: 2.4, f: 950, pk: 0.75, n: 5, room: 0.65, boom: 1 },
  };
