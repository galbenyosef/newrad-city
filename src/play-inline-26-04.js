// play-inline-26 04 — gain
// Lines 1015-1323 of readable/play-inline-26.pretty.js (statement-aligned).
  D("shellback_click", {
    dur: 1.0,
    variants: 4,
    gain: 0.55,
    ref: 6,
    maxVoices: 3,
    priority: 2,
    build(k) {
      const n = 5 + ((k.r() * 8) | 0);
      let t = 0;
      for (let i = 0; i < n; i++) {
        t += k.rr(0.03, 0.08);
        k.burst({
          start: t,
          a: 0.0003,
          d: 0.01,
          peak: k.rr(0.5, 1),
          type: "bandpass",
          f: k.rr(1800, 3500),
          q: 7,
        });
      }
      // bubbling gurgle
      for (let i = 0; i < 7; i++) {
        const st = k.rr(0.05, 0.7),
          f = k.rr(250, 600);
        k.tone({
          type: "sine",
          start: st,
          f: f,
          f2: f * 1.8,
          glide: 0.04,
          a: 0.003,
          d: 0.05,
          peak: 0.25,
        });
      }
      k.voice({
        start: 0.1,
        dur: 0.6,
        f0: [
          [0, 70],
          [0.6, 60],
        ],
        vowels: [
          [0, "uh"],
          [0.6, "o"],
        ],
        shift: 0.8,
        breath: 0.6,
        rough: 0.9,
        growl: 15,
        gain: 0.35,
        attack: 0.1,
        release: 0.2,
      });
    },
  });
  D("crow", {
    dur: 1.2,
    variants: 3,
    gain: 0.4,
    ref: 20,
    maxVoices: 2,
    priority: 7,
    build(k) {
      const n = 1 + ((k.r() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const st = i * k.rr(0.28, 0.4),
          f = k.rr(560, 700);
        k.voice({
          start: st,
          dur: 0.22,
          f0: [
            [0, f],
            [0.08, f * 1.08],
            [0.22, f * 0.85],
          ],
          vowels: [
            [0, "a"],
            [0.22, "aw"],
          ],
          shift: 1.6,
          breath: 0.7,
          rough: 0.9,
          growl: 70,
          growlDepth: 0.5,
          dist: 3,
          gain: 1,
          attack: 0.01,
          release: 0.08,
        });
      }
    },
  });
  D("bird_chirp", {
    dur: 1.0,
    variants: 3,
    gain: 0.25,
    ref: 15,
    maxVoices: 2,
    priority: 8,
    build(k) {
      const n = 2 + ((k.r() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const st = i * k.rr(0.1, 0.18),
          f = k.rr(2800, 4200);
        k.tone({
          type: "sine",
          start: st,
          f: f,
          f2: f * k.rr(0.7, 1.4),
          glide: 0.06,
          a: 0.004,
          d: 0.07,
          peak: 0.6,
        });
      }
    },
  });
  D("gull", {
    dur: 1.2,
    variants: 2,
    gain: 0.35,
    ref: 25,
    priority: 8,
    build(k) {
      for (let i = 0; i < 3; i++) {
        const st = i * 0.3,
          f = k.rr(1100, 1300);
        k.voice({
          start: st,
          dur: 0.25,
          f0: [
            [0, f * 0.8],
            [0.1, f],
            [0.25, f * 0.7],
          ],
          vowels: [
            [0, "e"],
            [0.25, "a"],
          ],
          shift: 1.8,
          breath: 0.5,
          rough: 0.3,
          gain: 1,
          attack: 0.02,
          release: 0.1,
        });
      }
    },
  });

  // ------------------------------------------------------------------
  // Robots
  // ------------------------------------------------------------------
  D("robot_beep", {
    dur: 0.5,
    variants: 4,
    gain: 0.35,
    ref: 6,
    maxVoices: 3,
    priority: 2,
    build(k) {
      const n = 2 + ((k.r() * 3) | 0),
        notes = [880, 1175, 1320, 1760, 2093, 2640];
      let t = 0;
      for (let i = 0; i < n; i++) {
        const d = k.rr(0.04, 0.07);
        k.tone({
          type: "square",
          start: t,
          f: notes[(k.r() * notes.length) | 0],
          a: 0.002,
          d: d,
          peak: 0.5,
          filter: ["lowpass", 3500],
          curve: "lin",
        });
        t += d + k.rr(0.01, 0.04);
      }
    },
  });
  D("robot_voice", {
    dur: 1.6,
    variants: 4,
    gain: 0.55,
    ref: 7,
    maxVoices: 2,
    priority: 3,
    build(k) {
      // Monotone buzzy pseudo-speech: formant syllables on a fixed-pitch carrier, ring-modulated.
      const mix = k.gain(1);
      const rm = k.gain(0),
        car = k.osc("sine", 57, 0, 1.6);
      car.connect(rm.gain);
      const dry = k.gain(0.55);
      k.chain(mix, rm, k.out);
      k.chain(mix, dry, k.out);
      let t = 0.02;
      const syl = 5 + ((k.r() * 5) | 0),
        vows = ["a", "e", "i", "o", "u", "ae", "er"];
      const f0 = k.rr(95, 125);
      for (let i = 0; i < syl && t < 1.4; i++) {
        const d = k.rr(0.08, 0.16);
        if (k.r() < 0.6)
          k.burst({
            start: t,
            a: 0.002,
            d: 0.025,
            peak: 0.4,
            type: "highpass",
            f: k.rr(2500, 5000),
            dest: mix,
          }); // consonant
        const va = vows[(k.r() * vows.length) | 0],
          vb = vows[(k.r() * vows.length) | 0];
        k.voice({
          start: t + 0.02,
          dur: d,
          f0: [
            [0, f0],
            [d, f0 * (i === syl - 1 ? 0.85 : 1)],
          ],
          vowels: [
            [0, va],
            [d, vb],
          ],
          wave: "buzz",
          q: 2.2,
          gain: 1,
          attack: 0.008,
          release: 0.03,
          dist: 2,
          distKind: "hard",
          dest: mix,
        });
        t += d + k.rr(0.02, 0.07);
      }
    },
  });
  D("robot_death", {
    dur: 2.2,
    variants: 2,
    gain: 0.8,
    ref: 10,
    maxVoices: 2,
    priority: 3,
    build(k) {
      const o = k.osc("sawtooth", 700, 0, 1.4);
      k.env(o.frequency, [
        [0, 780],
        [1.3, 35],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.02, 0.6],
        [1.35, 0.0001],
      ]);
      k.chain(o, k.filt("bandpass", 900, 1.2), g, k.out);
      k.grains({
        start: 0,
        span: 1.0,
        n: 30,
        f: 5000,
        q: 0.7,
        gain: 0.45,
        len: 0.004,
        skew: 1.4,
      }); // sparks
      k.burst({
        a: 0.0005,
        d: 0.08,
        peak: 0.8,
        type: "lowpass",
        f: 2000,
        shaper: 4,
      }); // pop
      const m = k.metal(1, [320, 780, 1450, 2300], 20);
      k.chain(m.output, k.gain(0.8), k.out);
      k.burst({
        start: 1.45,
        a: 0.0005,
        d: 0.02,
        peak: 1,
        type: "highpass",
        f: 400,
        dest: m.input,
      }); // clatter to the ground
      k.burst({
        start: 1.45,
        a: 0.002,
        d: 0.2,
        peak: 0.6,
        type: "lowpass",
        f: 300,
      });
      k.burst({
        start: 1.62,
        a: 0.0005,
        d: 0.02,
        peak: 0.5,
        type: "highpass",
        f: 400,
        dest: m.input,
      });
    },
  });
