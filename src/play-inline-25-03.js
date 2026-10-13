// play-inline-25 03 — mix
// Lines 540-885 of readable/play-inline-25.pretty.js (statement-aligned).
  Object.keys(TSZ).forEach((sz) => {
    const o = TSZ[sz];
    D("gtail_out_" + sz, {
      dur: o.d + 1.2,
      variants: 3,
      gain: 0.55 + o.pk * 0.3,
      ref: 20,
      rolloff: 0.6,
      maxVoices: 4,
      priority: 3,
      pitchVar: 0.03,
      dedupe: 0,
      sr: 22050,
      wet: 0.4,
      build(k) {
        const mix = k.gain(1);
        mix.connect(k.out);
        // the report rolling away down the avenue
        k.burst({
          kind: "pink",
          start: 0.005,
          a: 0.03,
          d: k.rr(o.d * 0.85, o.d * 1.15),
          peak: o.pk,
          type: "lowpass",
          q: 0.5,
          f: o.f,
          f2: o.f * 0.22,
          fT: o.d,
          dest: mix,
        });
        // slap-backs off the buildings
        let t = k.rr(0.07, 0.13);
        for (let i = 0; i < o.n; i++) {
          const g = o.pk * 1.25 * Math.pow(0.6, i) * k.rr(0.8, 1.1),
            fc = o.f * 1.7 * Math.pow(0.7, i);
          k.burst({
            kind: "white",
            start: t,
            a: 0.002,
            d: 0.05 + i * 0.035,
            peak: g,
            type: "lowpass",
            q: 0.8,
            f: fc,
            f2: fc * 0.35,
            fT: 0.12 + i * 0.04,
            shaper: 2,
            dest: mix,
          });
          k.tone({
            type: "sine",
            start: t,
            f: k.rr(110, 150),
            f2: 50,
            glide: 0.1,
            a: 0.003,
            d: 0.08 + i * 0.02,
            peak: g * 0.35,
            dest: mix,
          });
          t += k.rr(0.1, 0.24) * (1 + i * 0.35);
        }
      },
    });
    D("gtail_in_" + sz, {
      dur: o.d * 0.55 + 0.4,
      variants: 3,
      gain: 0.45 + o.room * 0.4,
      ref: 12,
      maxVoices: 4,
      priority: 3,
      pitchVar: 0.03,
      dedupe: 0,
      sr: 22050,
      wet: 0.6,
      build(k) {
        const mix = k.gain(1);
        mix.connect(k.out);
        // hard walls: dense early reflections 6–40 ms
        for (let i = 0; i < 8; i++)
          k.burst({
            kind: "white",
            start: k.rr(0.005, 0.04),
            a: 0.0008,
            d: k.rr(0.012, 0.03),
            peak: o.pk * k.rr(0.35, 0.8),
            type: "bandpass",
            f: k.rr(900, 3200),
            q: 1.1,
            dest: mix,
          });
        // the room "slap" and its short, boomy decay
        k.burst({
          kind: "pink",
          start: 0.008,
          a: 0.004,
          d: o.d * 0.3,
          peak: o.pk * 1.1,
          type: "lowpass",
          q: 1.3,
          f: o.f * 1.8,
          f2: o.f * 0.4,
          fT: o.d * 0.3,
          shaper: 1.5,
          dest: mix,
        });
        k.tone({
          type: "sine",
          start: 0.01,
          f: k.rr(70, 105),
          a: 0.004,
          d: o.d * 0.25,
          peak: o.room,
          dest: mix,
        }); // room mode
        k.tone({
          type: "sine",
          start: 0.012,
          f: k.rr(160, 220),
          a: 0.003,
          d: o.d * 0.15,
          peak: o.room * 0.4,
          dest: mix,
        });
      },
    });
    D("gtail_far_" + sz, {
      dur: o.d * 1.4 + 0.8,
      variants: 2,
      gain: 0.7,
      ref: 40,
      rolloff: 0.35,
      maxVoices: 3,
      priority: 4,
      pitchVar: 0.05,
      dedupe: 0,
      sr: 22050,
      wet: 0.5,
      lazy: true,
      build(k) {
        const mix = k.gain(1);
        mix.connect(k.out);
        k.burst({
          kind: "white",
          a: 0.006,
          d: 0.1 + o.boom * 0.08,
          peak: o.boom,
          type: "lowpass",
          q: 0.7,
          f: 650,
          f2: 180,
          fT: 0.25,
          shaper: 3,
          dest: mix,
        }); // dull thud
        k.tone({
          type: "sine",
          f: k.rr(85, 110),
          f2: 38,
          glide: 0.25,
          a: 0.006,
          d: 0.3,
          peak: o.boom * 0.8,
          dest: mix,
        });
        k.burst({
          kind: "pink",
          start: 0.03,
          a: 0.08,
          d: o.d * 1.3,
          peak: o.pk * 0.9,
          type: "lowpass",
          q: 0.5,
          f: 520,
          f2: 140,
          fT: o.d * 1.3,
          dest: mix,
        }); // long roll
        let t = k.rr(0.25, 0.45);
        for (let i = 0; i < 3; i++) {
          k.burst({
            kind: "brown",
            start: t,
            a: 0.01,
            d: 0.15 + i * 0.08,
            peak: o.pk * 0.7 * Math.pow(0.6, i),
            type: "lowpass",
            f: 450,
            q: 0.7,
            dest: mix,
          });
          t += k.rr(0.3, 0.6);
        }
      },
    });
  });

  // ------------------------------------------------------------------
  // Ray emitters (robots: patrolman, sky-eye drone)
  // ------------------------------------------------------------------
  /** Laser "tchew": FM zap with falling pitch, electric crackle, a punchy thump and a metallic ring tail. */
  function laser(k, p) {
    const mix = k.gain(1);
    mix.connect(k.out);
    const ring = k.echo(p.ringT || 0.045, 0.5, 6000, 0.35);
    ring.output.connect(mix);
    const f0 = k.rr(p.f0 * 0.93, p.f0 * 1.07),
      f1 = p.f1;
    // FM zap
    const car = k.osc("sine", f0, 0, p.d + 0.05),
      mod = k.osc("sine", f0 * 1.41, 0, p.d + 0.05);
    k.env(car.frequency, [
      [0, f0],
      [p.d, f1],
    ]);
    k.env(mod.frequency, [
      [0, f0 * 1.41],
      [p.d, f1 * 1.41],
    ]);
    const idx = k.gain(0);
    k.env(idx.gain, [
      [0, f0 * 2.5],
      [p.d, f1 * 0.4],
    ]);
    k.chain(mod, idx, car.frequency);
    const zg = k.gain(0);
    k.perc(zg.gain, 0, 0.9, 0.001, p.d);
    k.chain(car, zg, mix);
    zg.connect(ring.input);
    // buzzing saw layer (the "electric" edge)
    const saw = k.osc("sawtooth", f0 * 0.5, 0, p.d);
    k.env(saw.frequency, [
      [0, f0 * 0.5],
      [p.d * 0.8, f1 * 0.5],
    ]);
    const sg = k.gain(0);
    k.perc(sg.gain, 0, 0.35, 0.001, p.d * 0.7);
    k.chain(saw, k.filt("bandpass", p.bp || 1800, 1.5), sg, mix);
    // crackle
    k.grains({
      start: 0,
      span: p.d * 0.8,
      n: 14,
      f: 6000,
      q: 0.7,
      gain: 0.35,
      len: 0.003,
      skew: 1.8,
      dest: mix,
    });
    // punch
    k.tone({
      type: "sine",
      f: 220,
      f2: 70,
      glide: 0.06,
      a: 0.001,
      d: 0.07,
      peak: p.punch || 0.6,
      dest: mix,
    });
    k.burst({
      a: 0.0003,
      d: 0.012,
      peak: 0.6,
      type: "highpass",
      f: 4000,
      dest: mix,
    });
  }
  D("gun_laser", {
    dur: 0.9,
    variants: 3,
    gain: 0.85,
    ref: 14,
    maxVoices: 5,
    priority: 1,
    build(k) {
      laser(k, { f0: 2400, f1: 320, d: 0.2, bp: 1800 });
    },
  });
  D("gun_flamer", {
    dur: 0.9,
    variants: 3,
    gain: 0.8,
    ref: 12,
    maxVoices: 3,
    priority: 4,
    build(k) {
      k.burst({
        kind: "white",
        a: 0.03,
        d: 0.55,
        peak: 0.9,
        type: "lowpass",
        f: 2500,
        f2: 700,
        fT: 0.6,
        q: 0.6,
        shaper: 2,
      });
      k.burst({
        kind: "brown",
        a: 0.02,
        d: 0.6,
        peak: 1.0,
        type: "lowpass",
        f: 400,
      });
      k.grains({
        start: 0.02,
        span: 0.6,
        n: 22,
        f: 3000,
        q: 0.8,
        gain: 0.35,
        len: 0.005,
      });
      k.burst({ a: 0.001, d: 0.05, peak: 0.4, type: "bandpass", f: 900, q: 1 }); // ignition pop
    },
  });
  D("flamer_loop", {
    dur: 3,
    loop: true,
    gain: 0.7,
    ref: 12,
    sr: 32000,
    priority: 7,
    gen(d, sr, r, n) {
      const a = d[0];
      let lp = 0,
        lp2 = 0;
      for (let i = 0; i < n; i++) {
        const x = r() * 2 - 1;
        lp += (x - lp) * 0.12;
        lp2 += (x - lp2) * 0.02;
        a[i] = lp * 0.7 + lp2 * 2.2 + (r() < 0.002 ? (r() - 0.5) * 1.5 : 0);
      }
    },
  });

  // ------------------------------------------------------------------
  // Explosives
  // ------------------------------------------------------------------
  /** Recoilless rifle: a flat, enormous report up front and the back-blast's roar behind, a long rumbling tail. */
