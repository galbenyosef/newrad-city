// play-inline-25 04 — peak
// Lines 886-1186 of readable/play-inline-25.pretty.js (statement-aligned).
  D("gun_recoilless", {
    dur: 2.0,
    variants: 2,
    gain: 1.0,
    ref: 18,
    maxVoices: 2,
    priority: 3,
    build(k) {
      k.burst({
        kind: "white",
        a: 0.0008,
        d: 0.1,
        peak: 1.3,
        type: "lowpass",
        f: 3200,
        f2: 500,
        fT: 0.12,
        shaper: 3,
      }); // muzzle crack
      k.tone({
        type: "sine",
        f: 80,
        f2: 32,
        glide: 0.25,
        a: 0.002,
        d: 0.4,
        peak: 1.4,
      }); // chest thump
      k.burst({
        kind: "brown",
        start: 0.01,
        a: 0.02,
        d: 0.9,
        peak: 1.0,
        type: "lowpass",
        f: 1200,
        f2: 250,
        fT: 0.9,
      }); // back-blast roar
      k.burst({
        start: 0.02,
        a: 0.01,
        d: 0.35,
        peak: 0.45,
        type: "bandpass",
        f: 2400,
        f2: 800,
        fT: 0.35,
        q: 0.9,
      }); // venturi hiss
      k.grains({
        start: 0.05,
        span: 0.7,
        n: 18,
        f: 1800,
        q: 0.7,
        gain: 0.25,
        len: 0.008,
        skew: 1.6,
      }); // debris patter
    },
  });
  D("gun_missile", {
    dur: 2.2,
    variants: 2,
    gain: 1.0,
    ref: 18,
    maxVoices: 3,
    priority: 3,
    build(k) {
      k.tone({
        type: "sine",
        f: 110,
        f2: 45,
        glide: 0.2,
        a: 0.002,
        d: 0.22,
        peak: 1.2,
      });
      k.burst({
        kind: "white",
        a: 0.004,
        d: 0.3,
        peak: 1.1,
        type: "bandpass",
        f: 500,
        f2: 2600,
        fT: 0.25,
        q: 0.8,
        shaper: 3,
      }); // fwoosh
      k.burst({
        kind: "brown",
        start: 0.05,
        a: 0.05,
        d: 1.4,
        peak: 0.9,
        type: "lowpass",
        f: 900,
        f2: 300,
        fT: 1.5,
      }); // rocket roar
      k.grains({
        start: 0.05,
        span: 1.2,
        n: 30,
        f: 2500,
        q: 0.7,
        gain: 0.3,
        len: 0.006,
        skew: 1.5,
      });
    },
  });

  /** Big layered explosion. scale ~1 grenade/car, 1.5 big. */
  function explosion(k, sc) {
    const mix = k.gain(1);
    mix.connect(k.out);
    const echo = k.echo(k.rr(0.2, 0.28), 0.32, 700, 0.35);
    echo.output.connect(mix);
    k.burst({
      kind: "white",
      a: 0.0003,
      d: 0.03,
      peak: 1.4,
      type: "highpass",
      f: 1400,
      dest: mix,
    }); // crack
    const body = k.burst({
      kind: "white",
      a: 0.002,
      d: 1.1 * sc,
      peak: 1.5,
      type: "lowpass",
      f: 5000,
      f2: 160,
      fT: 1.0 * sc,
      q: 0.7,
      shaper: 10,
      dest: mix,
    });
    body.connect(echo.input);
    const sub = k.tone({
      type: "sine",
      f: 75,
      f2: 26,
      glide: 1.0 * sc,
      a: 0.004,
      d: 1.3 * sc,
      peak: 1.7,
    });
    k.chain(sub.g, k.shaper(3), mix);
    const rum = k.burst({
      kind: "brown",
      a: 0.06,
      d: 2.4 * sc,
      peak: 1.1,
      type: "lowpass",
      f: 220,
      q: 0.5,
      dest: mix,
    });
    rum.connect(echo.input);
    // debris: stones, glass, metal raining down
    k.grains({
      start: 0.25,
      span: 2.2 * sc,
      n: 45,
      f: 2600,
      q: 0.9,
      gain: 0.35,
      len: 0.01,
      skew: 1.7,
      dest: mix,
    });
    for (let i = 0; i < 5; i++)
      k.tone({
        type: "sine",
        start: k.rr(0.3, 1.6),
        f: k.rr(90, 160),
        f2: 50,
        glide: 0.08,
        a: 0.002,
        d: 0.1,
        peak: k.rr(0.15, 0.35),
        dest: mix,
      });
    const glass = k.metal(1, [3100, 4700, 6900], 40);
    k.chain(glass.output, k.gain(0.3), mix);
    k.grains({
      start: 0.4,
      span: 1.2,
      n: 12,
      f: 5000,
      q: 1,
      gain: 0.5,
      len: 0.004,
      dest: glass.input,
    });
  }
  /** Gyrojet: a sharp ignition pop, then the rocket's fizzing whoosh leaving fast (no gunshot crack: it's a rocket). */
  D("gun_gyrojet", {
    dur: 0.9,
    variants: 3,
    gain: 0.85,
    ref: 12,
    maxVoices: 5,
    priority: 3,
    build(k) {
      k.burst({
        a: 0.0004,
        d: 0.02,
        peak: 0.9,
        type: "bandpass",
        f: 2600,
        q: 0.8,
      }); // primer pop
      k.tone({
        type: "sine",
        f: 260,
        f2: 90,
        glide: 0.05,
        a: 0.001,
        d: 0.06,
        peak: 0.5,
      });
      k.burst({
        kind: "white",
        start: 0.01,
        a: 0.015,
        d: 0.45,
        peak: 0.75,
        type: "bandpass",
        f: 1800,
        f2: 5200,
        fT: 0.4,
        q: 1.1,
      }); // fizz, rising away
      k.grains({
        start: 0.02,
        span: 0.35,
        n: 12,
        f: 4200,
        q: 0.8,
        gain: 0.25,
        len: 0.004,
        skew: 1.4,
      });
    },
  });
  /** Rivet gun: a pneumatic hammer thunk, a burst of air and the rivet's ring. */
  D("gun_rivet", {
    dur: 0.7,
    variants: 3,
    gain: 0.85,
    ref: 10,
    maxVoices: 4,
    priority: 4,
    build(k) {
      k.tone({
        type: "sine",
        f: 180,
        f2: 70,
        glide: 0.04,
        a: 0.001,
        d: 0.08,
        peak: 0.9,
      });
      k.burst({
        a: 0.0005,
        d: 0.03,
        peak: 0.8,
        type: "bandpass",
        f: 1400,
        q: 1.4,
      }); // hammer clack
      k.burst({
        kind: "white",
        start: 0.015,
        a: 0.01,
        d: 0.22,
        peak: 0.45,
        type: "highpass",
        f: 2200,
      }); // air exhaust
      const m = k.metal(1, [880, 1960, 3150], 9);
      k.chain(m.output, k.gain(0.35), k.out);
      k.burst({
        start: 0.01,
        a: 0.0004,
        d: 0.01,
        peak: 0.6,
        type: "highpass",
        f: 1500,
        dest: m.input,
      });
    },
  });
  /** Siren horn: one rising air-raid wail squeezed into a second, with a sub punch under it. */
