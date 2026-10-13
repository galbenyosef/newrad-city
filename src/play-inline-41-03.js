// play-inline-41 03 — gain
// Lines 685-1013 of readable/play-inline-41.pretty.js (statement-aligned).
  D(
    "rat_scurry",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 1.6,
      variants: 3,
      gain: 0.26,
      ref: 3,
      wet: 0.8,
      pitchVar: 0.1,
      build(k) {
        const strides = 3 + ((k.r() * 6) | 0);
        let t = 0.02;
        for (let s = 0; s < strides; s++) {
          const fade = 1 - (s / strides) * 0.6;
          for (let f = 0; f < 4; f++)
            k.burst({
              start: t + f * k.rr(0.011, 0.02),
              a: 0.0004,
              d: 0.005,
              peak: k.rr(0.3, 1) * fade,
              type: "highpass",
              f: k.rr(2500, 4500),
            });
          k.burst({
            kind: "pink",
            start: t,
            a: 0.004,
            d: 0.03,
            peak: 0.18 * fade,
            type: "bandpass",
            f: 1400,
            q: 0.8,
          });
          t += k.rr(0.07, 0.1);
        }
        if (k.r() < 0.65) {
          const f = k.rr(3200, 4300),
            st = k.rr(0.05, t);
          k.tone({
            type: "sine",
            f,
            f2: f * 1.25,
            glide: 0.05,
            start: st,
            a: 0.005,
            d: 0.06,
            peak: 0.35,
          });
        }
      },
    }),
  );
  D(
    "pipe_knock",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 2.4,
      variants: 4,
      gain: 0.4,
      ref: 10,
      wet: 1.3,
      pitchVar: 0.08,
      build(k) {
        // a steam/water pipe knocking as it cools: tuned pipe modes + the knock running along the pipe
        const base = k.rr(170, 320);
        const m = k.metal(base, [1, 2.76, 5.4, 8.93], 28, [1, 0.6, 0.35, 0.2]);
        const e = k.echo(k.rr(0.025, 0.05), 0.45, 1800, 0.45);
        k.chain(m.output, k.gain(0.9), k.out);
        m.output.connect(e.input);
        e.output.connect(k.out);
        const hits = 1 + ((k.r() * 4) | 0);
        let t = 0.01;
        for (let h = 0; h < hits; h++) {
          const pk = k.rr(0.6, 1);
          k.burst({
            start: t,
            a: 0.0005,
            d: 0.012,
            peak: pk,
            type: "lowpass",
            f: 2500,
            dest: m.input,
          });
          k.burst({
            kind: "brown",
            start: t,
            a: 0.001,
            d: 0.03,
            peak: 0.4 * pk,
            type: "lowpass",
            f: 300,
          });
          t += k.rr(0.12, 0.55);
        }
      },
    }),
  );
  D(
    "building_settle",
    Object.assign({}, SPOT, {
      sr: 16000,
      dur: 4.2,
      variants: 3,
      gain: 0.5,
      ref: 20,
      wet: 1.4,
      pitchVar: 0.06,
      build(k) {
        // the structure shifting: a deep stick-slip groan through the frame, a plaster crack, dust trickling down
        const d = k.rr(1.2, 2.4),
          f = k.rr(38, 60);
        const o = k.osc("sawtooth", f, 0.05, d + 0.2);
        k.env(o.frequency, [
          [0.05, f],
          [0.05 + d * 0.5, f * k.rr(1.2, 1.6), "l"],
          [0.05 + d, f * k.rr(0.8, 1.1), "l"],
        ]);
        const am = k.gain(0.5),
          sl = k.noise("pink", 0.05, d + 0.2, 0.08),
          lg = k.gain(0.6);
        k.chain(sl, k.filt("lowpass", 30, 0.7), lg, am.gain);
        const env = k.gain(0);
        k.env(env.gain, [
          [0.05, 0.0001],
          [0.05 + d * 0.3, 0.8],
          [0.05 + d * 0.8, 0.6, "l"],
          [0.05 + d + 0.2, 0.0001],
        ]);
        const res = k.metal(
          1,
          [k.rr(90, 130), k.rr(230, 300), k.rr(480, 600)],
          9,
        );
        k.chain(o, am, env, res.input);
        k.chain(res.output, k.gain(0.8), k.out);
        const tc = 0.05 + d * k.rr(0.4, 0.9);
        k.burst({
          start: tc,
          a: 0.0005,
          d: 0.03,
          peak: 0.8,
          type: "bandpass",
          f: 1800,
          q: 0.8,
        });
        k.grains({
          start: tc + 0.05,
          span: k.rr(0.8, 1.6),
          n: 26,
          f: 3000,
          q: 0.7,
          gain: 0.35,
          len: 0.005,
          skew: 1.6,
        });
        for (let i = 0; i < 3; i++)
          k.burst({
            kind: "pink",
            start: tc + k.rr(0.1, 1.2),
            a: 0.001,
            d: 0.04,
            peak: k.rr(0.2, 0.5),
            type: "lowpass",
            f: 700,
          });
      },
    }),
  );
  D(
    "plaster_trickle",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 2.6,
      variants: 3,
      gain: 0.3,
      ref: 6,
      wet: 1.1,
      build(k) {
        const span = k.rr(1, 1.8);
        k.grains({
          start: 0,
          span,
          n: 45,
          f: 2600,
          q: 0.6,
          gain: 0.6,
          len: 0.006,
          skew: 1.8,
        });
        k.grains({
          start: 0.02,
          span: span * 0.7,
          n: 20,
          f: 5000,
          q: 0.8,
          gain: 0.25,
          len: 0.003,
          skew: 2,
        });
        const chunks = 2 + ((k.r() * 3) | 0);
        for (let i = 0; i < chunks; i++)
          k.burst({
            kind: "pink",
            start: k.rr(0, span),
            a: 0.001,
            d: 0.05,
            peak: k.rr(0.3, 0.7),
            type: "lowpass",
            f: 900,
          });
        let t = span + 0.05,
          g = 0.6,
          dt = 0.12; // a last pebble bouncing
        for (let i = 0; i < 3; i++) {
          k.burst({
            start: t,
            a: 0.0004,
            d: 0.008,
            peak: g,
            type: "bandpass",
            f: 1600,
            q: 1.2,
          });
          t += dt;
          dt *= 0.65;
          g *= 0.6;
        }
      },
    }),
  );
  D(
    "paper_rustle",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 2.2,
      variants: 3,
      gain: 0.22,
      ref: 4,
      wet: 0.9,
      build(k) {
        // a draft dragging loose paper across the floor: crinkles + a dry slide
        const d = k.rr(0.9, 1.6);
        const s = k.noise("white", 0, d + 0.1),
          bp = k.filt("bandpass", k.rr(2500, 4000), 0.9),
          g = k.gain(0);
        k.env(g.gain, [
          [0, 0.0001],
          [d * 0.3, 0.35],
          [d * 0.7, 0.2, "l"],
          [d, 0.0001],
        ]);
        const am = k.gain(0.3),
          cr = k.noise("crackle", 0, d + 0.1, 0.5),
          ag = k.gain(1.5);
        k.chain(cr, ag, am.gain);
        k.chain(s, bp, am, g, k.out);
        k.grains({
          start: 0.02,
          span: d,
          n: 50,
          f: 3500,
          q: 0.6,
          gain: 0.5,
          len: 0.004,
        });
        k.burst({
          kind: "pink",
          start: d * 0.1,
          a: 0.05,
          d: d * 0.8,
          peak: 0.25,
          type: "bandpass",
          f: 1200,
          q: 0.8,
        });
      },
    }),
  );
  D(
    "fluoro_flicker",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 1.8,
      variants: 3,
      gain: 0.22,
      ref: 5,
      wet: 1,
      build(k) {
        // a dying tube: starter tick, the buzz stuttering on and off, maybe catching for a moment
        k.burst({
          start: 0,
          a: 0.0003,
          d: 0.004,
          peak: 1,
          type: "highpass",
          f: 2500,
        });
        const o = k.osc("sawtooth", 120, 0, 1.7),
          o2 = k.osc("square", 60, 0, 1.7);
        const mix = k.gain(1),
          g = k.gain(0);
        k.chain(o, k.filt("bandpass", 2200, 0.8), mix);
        k.chain(o2, k.filt("lowpass", 400, 0.7), k.gain(0.3), mix);
        k.chain(mix, g, k.out);
        let t = 0.02;
        const segs = 3 + ((k.r() * 6) | 0);
        g.gain.setValueAtTime(0, k.t);
        for (let s = 0; s < segs && t < 1.4; s++) {
          const on = k.rr(0.02, 0.18);
          g.gain.setTargetAtTime(k.rr(0.4, 1), k.t + t, 0.002);
          g.gain.setTargetAtTime(0, k.t + t + on, 0.002);
          k.burst({
            start: t,
            a: 0.0003,
            d: 0.003,
            peak: 0.5,
            type: "highpass",
            f: 3000,
          });
          t += on + k.rr(0.02, 0.15);
        }
        if (k.r() < 0.5 && t < 1.3) {
          g.gain.setTargetAtTime(0.6, k.t + t, 0.003);
          g.gain.setTargetAtTime(0, k.t + 1.6, 0.03);
        }
      },
    }),
  );
