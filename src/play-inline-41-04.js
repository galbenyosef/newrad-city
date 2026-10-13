// play-inline-41 04 — gain
// Lines 1014-1339 of readable/play-inline-41.pretty.js (statement-aligned).
  D(
    "wood_creak",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 1.8,
      variants: 4,
      gain: 0.35,
      ref: 6,
      wet: 1,
      pitchVar: 0.1,
      build(k) {
        // a floorboard / old door: stick-slip pulses gliding through the board's resonances
        const d = k.rr(0.4, 1.2),
          f0 = k.rr(35, 70),
          f1 = f0 * k.rr(1.5, 3);
        const o = k.osc("sawtooth", f0, 0.02, d + 0.1);
        k.env(o.frequency, [
          [0.02, f0],
          [0.02 + d * 0.6, f1, "l"],
          [0.02 + d, f1 * k.rr(0.7, 1), "l"],
        ]);
        const jn = k.noise("pink", 0.02, d + 0.1, 0.3),
          jg = k.gain(f0 * 0.3);
        k.chain(jn, k.filt("lowpass", 80, 0.7), jg, o.frequency);
        const m = k.metal(
          1,
          [
            k.rr(500, 700),
            k.rr(1100, 1400),
            k.rr(2000, 2600),
            k.rr(3200, 3800),
          ],
          7,
          [1, 0.8, 0.5, 0.25],
        );
        const env = k.gain(0);
        k.env(env.gain, [
          [0.02, 0.0001],
          [0.02 + d * 0.2, 0.9],
          [0.02 + d * 0.8, 0.7, "l"],
          [0.02 + d + 0.05, 0.0001],
        ]);
        k.chain(o, env, m.input);
        k.chain(m.output, k.gain(1), k.out);
        k.burst({
          kind: "brown",
          start: 0.02,
          a: 0.003,
          d: 0.05,
          peak: 0.3,
          type: "lowpass",
          f: 200,
        });
      },
    }),
  );
  D(
    "hull_groan",
    Object.assign({}, SPOT, {
      sr: 16000,
      dur: 5,
      variants: 3,
      gain: 0.5,
      ref: 25,
      wet: 1.3,
      pitchVar: 0.06,
      build(k) {
        // steel plating flexing against the tide: a slow stick-slip groan through hull modes, a rivet "tonk"
        const d = k.rr(2, 3.8),
          f = k.rr(22, 34);
        const o = k.osc("sawtooth", f, 0.05, d + 0.3);
        k.env(o.frequency, [
          [0.05, f],
          [0.05 + d * 0.45, f * k.rr(1.2, 1.5), "l"],
          [0.05 + d, f * k.rr(0.85, 1), "l"],
        ]);
        const am = k.gain(0.45),
          sl = k.noise("pink", 0.05, d + 0.3, 0.06),
          lg = k.gain(0.55);
        k.chain(sl, k.filt("lowpass", 22, 0.7), lg, am.gain);
        const env = k.gain(0);
        k.env(env.gain, [
          [0.05, 0.0001],
          [0.05 + d * 0.4, 0.9],
          [0.05 + d * 0.8, 0.7, "l"],
          [0.05 + d + 0.3, 0.0001],
        ]);
        const m = k.metal(
          1,
          [k.rr(80, 110), k.rr(190, 240), k.rr(330, 400), k.rr(610, 700)],
          25,
        );
        k.chain(o, am, env, m.input);
        k.chain(m.output, k.gain(1), k.out);
        const tk = k.metal(1, [k.rr(700, 900), k.rr(1900, 2300)], 40);
        k.chain(tk.output, k.gain(0.5), k.out);
        k.burst({
          start: 0.05 + d * k.rr(0.3, 0.9),
          a: 0.0005,
          d: 0.01,
          peak: 1,
          type: "lowpass",
          f: 3000,
          dest: tk.input,
        });
      },
    }),
  );
  D(
    "hull_slap",
    Object.assign({}, SPOT, {
      sr: 16000,
      dur: 1.6,
      variants: 3,
      gain: 0.4,
      ref: 8,
      wet: 1.2,
      pitchVar: 0.08,
      build(k) {
        const m = k.metal(
          1,
          [k.rr(55, 75), k.rr(120, 150), k.rr(230, 280)],
          10,
          [1, 0.6, 0.3],
        );
        k.chain(m.output, k.gain(1), k.out);
        k.burst({
          kind: "brown",
          a: 0.01,
          d: 0.12,
          peak: 1,
          type: "lowpass",
          f: 300,
          dest: m.input,
        });
        k.burst({
          kind: "brown",
          a: 0.01,
          d: 0.15,
          peak: 0.6,
          type: "lowpass",
          f: 180,
        });
        k.burst({
          start: 0.02,
          a: 0.02,
          d: 0.35,
          peak: 0.22,
          type: "bandpass",
          f: 900,
          q: 0.7,
          f3: 1500,
        }); // the splash, through the plate
      },
    }),
  );
  D(
    "chain_rattle",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 2,
      variants: 3,
      gain: 0.3,
      ref: 6,
      wet: 1.2,
      pitchVar: 0.06,
      build(k) {
        const m = k.metal(
          1,
          [k.rr(2300, 2700), k.rr(3600, 4200), k.rr(5200, 6000)],
          35,
        );
        k.chain(m.output, k.gain(0.8), k.out);
        const swings = 2 + ((k.r() * 3) | 0);
        let t = 0.01;
        for (let s = 0; s < swings; s++) {
          const nn = 3 + ((k.r() * 5) | 0);
          for (let j = 0; j < nn; j++)
            k.burst({
              start: t + j * k.rr(0.012, 0.035),
              a: 0.0003,
              d: 0.006,
              peak: k.rr(0.3, 1) * (1 - s * 0.18),
              type: "highpass",
              f: 1800,
              dest: m.input,
            });
          t += k.rr(0.3, 0.55);
        }
      },
    }),
  );
  D(
    "distant_thud",
    Object.assign({}, SPOT, {
      sr: 16000,
      dur: 3.5,
      variants: 3,
      gain: 0.55,
      ref: 30,
      rolloff: 0.6,
      wet: 1.8,
      pitchVar: 0.08,
      build(k) {
        // something heavy giving way elsewhere in the building
        k.tone({
          type: "sine",
          f: k.rr(55, 70),
          f2: 28,
          glide: 0.4,
          a: 0.005,
          d: 0.8,
          peak: 1,
        });
        k.burst({
          kind: "brown",
          a: 0.005,
          d: 0.5,
          peak: 0.9,
          type: "lowpass",
          f: 220,
        });
        for (let i = 0; i < 5; i++)
          k.burst({
            kind: "brown",
            start: k.rr(0.1, 1.2),
            a: 0.02,
            d: k.rr(0.2, 0.6),
            peak: k.rr(0.2, 0.5),
            type: "lowpass",
            f: k.rr(150, 350),
          });
      },
    }),
  );
  D(
    "wind_moan",
    Object.assign({}, SPOT, {
      sr: 16000,
      dur: 5.5,
      variants: 3,
      gain: 0.28,
      ref: 12,
      wet: 1.2,
      pitchVar: 0.08,
      build(k) {
        // wind finding a broken pane: a hollow tonal moan that rises and sags
        const d = k.rr(2.5, 4.5),
          f = k.rr(280, 620),
          h = k.rr(1.47, 1.53);
        const s = k.noise("white", 0, d + 0.2),
          bp = k.filt("bandpass", f, k.rr(14, 24)),
          bp2 = k.filt("bandpass", f * h, 20);
        const curve = (m) => [
          [0, f * m * 0.9],
          [d * 0.4, f * m * 1.08, "l"],
          [d * 0.75, f * m * 0.97, "l"],
          [d, f * m * 0.85, "l"],
        ];
        k.env(bp.frequency, curve(1));
        k.env(bp2.frequency, curve(h));
        const g = k.gain(0);
        k.env(g.gain, [
          [0, 0.0001],
          [d * 0.35, 1],
          [d * 0.6, 0.7, "l"],
          [d, 0.0001],
        ]);
        k.chain(s, bp, g);
        k.chain(s, bp2, k.gain(0.4), g);
        g.connect(k.out);
        k.burst({
          kind: "pink",
          start: 0,
          a: d * 0.3,
          d: d * 0.8,
          peak: 0.12,
          type: "lowpass",
          f: 600,
          curve: "lin",
        });
      },
    }),
  );
  D(
    "glass_tinkle",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 1.4,
      variants: 3,
      gain: 0.25,
      ref: 5,
      wet: 1.2,
      build(k) {
        const m = k.metal(
          1,
          [k.rr(4200, 5000), k.rr(6100, 6900), k.rr(7800, 8800)],
          50,
        );
        k.chain(m.output, k.gain(0.7), k.out);
        let t = 0.01;
        const nn = 2 + ((k.r() * 4) | 0);
        for (let j = 0; j < nn; j++) {
          k.burst({
            start: t,
            a: 0.0003,
            d: 0.004,
            peak: 1 - j * 0.18,
            type: "highpass",
            f: 3000,
            dest: m.input,
          });
          t += k.rr(0.05, 0.2) * (1 - j * 0.1);
        }
        k.grains({
          start: 0.05,
          span: 0.4,
          n: 8,
          f: 6000,
          q: 1,
          gain: 0.2,
          len: 0.002,
        });
      },
    }),
  );
