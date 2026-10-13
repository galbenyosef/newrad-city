// play-inline-26 03 — gain
// Lines 667-1014 of readable/play-inline-26.pretty.js (statement-aligned).
  D("ripjaw_roar", {
    dur: 2.4,
    variants: 3,
    gain: 1.0,
    ref: 18,
    maxVoices: 2,
    priority: 2,
    build(k) {
      const d = k.rr(1.4, 1.8),
        f = k.rr(95, 115);
      // chest bellow
      k.voice({
        dur: d,
        f0: [
          [0, f * 0.8],
          [0.2, f * 1.2],
          [d, f * 0.6],
        ],
        vowels: [
          [0, "uh"],
          [0.2, "a"],
          [d * 0.7, "aw"],
          [d, "uh"],
        ],
        shift: 0.55,
        breath: 0.6,
        rough: 0.7,
        growl: k.rr(34, 42),
        growlDepth: 0.8,
        dist: 9,
        gain: 1,
        attack: 0.06,
        release: 0.45,
      });
      // reptilian screech layered on top
      k.voice({
        start: 0.08,
        dur: d * 0.8,
        f0: [
          [0, 520],
          [0.2, 760],
          [d * 0.8, 380],
        ],
        vowels: [
          [0, "ae"],
          [d * 0.8, "i"],
        ],
        shift: 1.1,
        breath: 0.9,
        rough: 1,
        growl: 60,
        growlDepth: 0.5,
        dist: 8,
        gain: 0.35,
        attack: 0.05,
        release: 0.3,
      });
      // air rush / sub
      k.burst({
        kind: "brown",
        a: 0.1,
        d: d,
        peak: 0.6,
        type: "lowpass",
        f: 300,
      });
      k.tone({
        type: "sine",
        f: 60,
        f2: 40,
        glide: d,
        a: 0.1,
        d: d,
        peak: 0.5,
      });
    },
  });
  D("ripjaw_attack", {
    dur: 0.8,
    variants: 3,
    gain: 0.85,
    ref: 12,
    maxVoices: 2,
    priority: 4,
    build(k) {
      k.voice({
        dur: 0.45,
        f0: [
          [0, 140],
          [0.1, 180],
          [0.45, 110],
        ],
        vowels: [
          [0, "a"],
          [0.45, "uh"],
        ],
        shift: 0.6,
        breath: 0.6,
        rough: 0.8,
        growl: 40,
        dist: 9,
        gain: 1,
        attack: 0.02,
        release: 0.15,
      });
      const n = k.noise("white", 0.1, 0.3),
        f = k.filt("bandpass", 800, 2);
      k.env(f.frequency, [
        [0.1, 600],
        [0.25, 2500],
        [0.4, 900],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0.1, 0.0001],
        [0.24, 0.6],
        [0.4, 0.0001],
      ]);
      k.chain(n, f, g, k.out); // claw swipe
    },
  });

  // ------------------------------------------------------------------
  // Critters
  // ------------------------------------------------------------------
  D("roach_hiss", {
    dur: 0.8,
    variants: 3,
    gain: 0.5,
    ref: 4,
    maxVoices: 4,
    priority: 2,
    build(k) {
      const d = k.rr(0.4, 0.6);
      k.burst({
        a: 0.05,
        d: d,
        peak: 0.6,
        type: "highpass",
        f: k.rr(3200, 4200),
        q: 1,
      });
      k.burst({
        a: 0.03,
        d: d * 0.8,
        peak: 0.35,
        type: "bandpass",
        f: 6500,
        q: 2,
      });
      k.grains({
        start: 0.02,
        span: d,
        n: 18,
        f: 3000,
        q: 4,
        gain: 0.5,
        len: 0.004,
      }); // chitter / mandibles
    },
  });
  D("roach_death", {
    dur: 0.5,
    variants: 2,
    gain: 0.45,
    ref: 4,
    priority: 5,
    build(k) {
      k.grains({
        start: 0,
        span: 0.08,
        n: 8,
        f: 1800,
        q: 1.5,
        gain: 0.8,
        len: 0.008,
      }); // crunch
      k.burst({
        start: 0.03,
        a: 0.02,
        d: 0.3,
        peak: 0.3,
        type: "highpass",
        f: 4000,
      });
    },
  });
  D("burrowrat_squeak", {
    dur: 0.6,
    variants: 4,
    gain: 0.45,
    ref: 5,
    maxVoices: 3,
    priority: 2,
    build(k) {
      const n = 1 + ((k.r() * 2) | 0);
      for (let i = 0; i < n; i++) {
        const st = i * k.rr(0.14, 0.2),
          f = k.rr(1600, 2300),
          d = k.rr(0.1, 0.18);
        const o = k.osc("triangle", f, st, d);
        k.env(o.frequency, [
          [st, f * 0.8],
          [st + d * 0.4, f * 1.25],
          [st + d, f * 0.85],
        ]);
        const vib = k.osc("sine", 38, st, d),
          vg = k.gain(f * 0.05);
        k.chain(vib, vg, o.frequency);
        const g = k.gain(0);
        k.env(g.gain, [
          [st, 0.0001],
          [st + 0.015, 0.7],
          [st + d, 0.0001],
        ]);
        k.chain(o, g, k.out);
      }
      k.burst({ a: 0.02, d: 0.15, peak: 0.2, type: "bandpass", f: 1200, q: 1 }); // snuffle
    },
  });
  D("dog_bark", {
    dur: 0.8,
    variants: 4,
    gain: 0.7,
    ref: 10,
    maxVoices: 3,
    priority: 2,
    build(k, v) {
      const n = v < 2 ? 1 : 2;
      for (let i = 0; i < n; i++) {
        const st = i * k.rr(0.22, 0.3),
          f = k.rr(420, 520);
        k.voice({
          start: st,
          dur: 0.16,
          f0: [
            [0, f],
            [0.04, f * 1.05],
            [0.16, f * 0.55],
          ],
          vowels: [
            [0, "a"],
            [0.16, "o"],
          ],
          shift: 1.25,
          breath: 0.5,
          rough: 0.4,
          dist: 3,
          gain: 1,
          attack: 0.006,
          release: 0.06,
        });
      }
    },
  });
  D("dog_growl", {
    dur: 1.4,
    variants: 2,
    gain: 0.55,
    ref: 6,
    priority: 4,
    build(k) {
      k.voice({
        dur: 1.2,
        f0: [
          [0, 110],
          [0.6, 125],
          [1.2, 105],
        ],
        vowels: [
          [0, "er"],
          [1.2, "uh"],
        ],
        shift: 1.2,
        breath: 0.4,
        rough: 0.6,
        growl: 24,
        growlDepth: 0.85,
        dist: 2,
        gain: 1,
        attack: 0.15,
        release: 0.3,
      });
    },
  });
  D("dog_whine", {
    dur: 1.0,
    variants: 2,
    gain: 0.45,
    ref: 5,
    priority: 5,
    build(k) {
      k.voice({
        dur: 0.8,
        f0: [
          [0, 700],
          [0.3, 950],
          [0.8, 650],
        ],
        vowels: [
          [0, "i"],
          [0.8, "u"],
        ],
        shift: 1.3,
        breath: 0.4,
        rough: 0.2,
        gain: 1,
        attack: 0.05,
        release: 0.25,
      });
    },
  });
  D("gasfly_buzz", {
    dur: 2,
    variants: 2,
    gain: 0.45,
    ref: 5,
    maxVoices: 3,
    priority: 3,
    seamless: true,
    sr: 32000,
    gen(d, sr, r, n, v) {
      const a = d[0],
        f = v ? 205 : 188;
      let ph = 0,
        ph2 = 0,
        lp = 0,
        bp1 = 0,
        bp2 = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sr;
        const wob =
          1 +
          0.04 * Math.sin(2 * Math.PI * 1.3 * t) +
          0.02 * Math.sin(2 * Math.PI * 3.7 * t);
        ph += (f * wob) / sr;
        ph2 += (f * 1.013 * wob) / sr;
        const s = ((ph % 1) * 2 - 1) * 0.6 + ((ph2 % 1) * 2 - 1) * 0.4;
        const flutter =
          0.55 + 0.45 * Math.sin(2 * Math.PI * 27 * t + Math.sin(t * 5));
        // crude 2-pole bandpass around 900 Hz
        bp1 += 0.18 * (s - bp1 - 0.3 * bp2);
        bp2 += 0.18 * bp1;
        lp += 0.25 * (s - lp);
        a[i] = (bp1 * 1.4 + lp * 0.3) * flutter;
      }
    },
  });
