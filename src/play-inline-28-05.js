// play-inline-28 05 — math
// Lines 1355-1704 of readable/play-inline-28.pretty.js (statement-aligned).
  D("machinery_clank", {
    dur: 1.2,
    variants: 3,
    gain: 0.4,
    ref: 20,
    priority: 6,
    wet: 1.4,
    build(k) {
      const m = k.metal(
        1,
        [k.rr(140, 200), k.rr(350, 420), k.rr(760, 900), k.rr(1400, 1700)],
        14,
      );
      k.chain(m.output, k.gain(0.8), k.out);
      const hits = 1 + ((k.r() * 3) | 0);
      for (let i = 0; i < hits; i++)
        k.burst({
          start: i * k.rr(0.12, 0.25),
          a: 0.001,
          d: 0.03,
          peak: 1,
          type: "lowpass",
          f: 1500,
          dest: m.input,
        });
    },
  });
  D("siren_distant", {
    dur: 9,
    variants: 1,
    gain: 0.4,
    bus: "amb",
    sr: 22050,
    priority: 8,
    pitchVar: 0.03,
    build(k) {
      // an old civil-defence siren somewhere, still wailing on a dying battery
      const o = k.osc("sawtooth", 300, 0, 9),
        o2 = k.osc("sawtooth", 450, 0, 9);
      k.env(o.frequency, [
        [0, 180],
        [2.5, 520],
        [5, 480, "l"],
        [8.5, 150],
      ]);
      k.env(o2.frequency, [
        [0, 270],
        [2.5, 780],
        [5, 720, "l"],
        [8.5, 225],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [2.2, 0.4],
        [5.5, 0.35, "l"],
        [8.8, 0.0001],
      ]);
      const lp = k.filt("lowpass", 1400, 0.7);
      k.chain(o, lp, g, k.out);
      o2.connect(lp);
    },
  });
  D("howl", {
    sr: 22050,
    dur: 3.2,
    variants: 2,
    gain: 0.45,
    ref: 25,
    priority: 7,
    build(k) {
      const f = k.rr(420, 520);
      k.voice({
        dur: 2.6,
        f0: [
          [0, f * 0.8],
          [0.6, f * 1.15],
          [2.0, f * 1.05],
          [2.6, f * 0.7],
        ],
        vowels: [
          [0, "u"],
          [0.6, "o"],
          [2.6, "u"],
        ],
        shift: 1.3,
        breath: 0.3,
        rough: 0.2,
        gain: 1,
        attack: 0.3,
        release: 0.6,
      });
    },
  });
  D("moan", {
    sr: 22050,
    dur: 2.5,
    variants: 3,
    gain: 0.45,
    ref: 15,
    priority: 7,
    build(k) {
      const f = k.rr(90, 130);
      k.voice({
        dur: 2.0,
        f0: [
          [0, f],
          [1, f * 1.3],
          [2, f * 0.8],
        ],
        vowels: [
          [0, "uh"],
          [1, "o"],
          [2, "u"],
        ],
        breath: 0.6,
        rough: 0.7,
        growl: 14,
        gain: 1,
        attack: 0.4,
        release: 0.6,
        dist: 2,
      });
    },
  });
  D("buoy_bell", {
    sr: 22050,
    dur: 3.5,
    variants: 2,
    gain: 0.35,
    ref: 40,
    rolloff: 0.7,
    priority: 8,
    build(k) {
      S.jingleKit.bell(k, 0, 62 + (k.r() < 0.5 ? 0 : 3), 3, 0.6);
    },
  });
  D("fly_buzz", {
    dur: 1.6,
    variants: 2,
    gain: 0.25,
    ref: 2,
    priority: 8,
    channels: 2,
    build(k) {
      const o = k.osc("sawtooth", k.rr(220, 280), 0, 1.5),
        g = k.gain(0),
        p = k.pan(0);
      const w = k.osc("sine", 3, 0, 1.5),
        wg = k.gain(40);
      k.chain(w, wg, o.frequency);
      k.env(g.gain, [
        [0, 0.0001],
        [0.3, 0.4],
        [1.1, 0.35, "l"],
        [1.5, 0.0001],
      ]);
      k.env(p.pan, [
        [0, k.rr(-1, 0)],
        [1.5, k.rr(0, 1), "l"],
      ]);
      k.chain(o, k.filt("bandpass", 1200, 1.5), g, p, k.out);
    },
  });

  // ------------------------------------------------------------------
  // Ambience BEDS (stereo seamless loops on the ambience bus)
  // ------------------------------------------------------------------
  const BED = {
    loop: true,
    bus: "amb",
    channels: 2,
    sr: 22050,
    gain: 0.5,
    pitchVar: 0,
    priority: 2,
    wet: 0,
  };
  D(
    "amb_wind",
    Object.assign({}, BED, {
      dur: 10,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            f = biquad("bp", 400, 0.6, sr),
            lp = biquad("lp", 900, 0.5, sr);
          const cut = slowNoise(r, 10, 7),
            gust = slowNoise(r, 10, 5);
          for (let i = 0; i < n; i++) {
            const t = i / sr;
            if ((i & 63) === 0) f.set(320 + 260 * (cut(t + c * 0.7) + 1), 0.7);
            const x = r() * 2 - 1;
            a[i] =
              lp(f(x)) *
              (0.45 + 0.55 * Math.max(0, gust(t + c * 0.4) * 0.7 + 0.5)) *
              1.6;
          }
        }
      },
    }),
  );
  D(
    "amb_whistle",
    Object.assign({}, BED, {
      dur: 12,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            f = biquad("bp", 900, 30, sr),
            f2 = biquad("bp", 1400, 40, sr);
          const sw = slowNoise(r, 12, 6),
            amp = slowNoise(r, 12, 9);
          for (let i = 0; i < n; i++) {
            const t = i / sr;
            if ((i & 63) === 0) {
              f.set(760 + 280 * sw(t + c), 30);
              f2.set(1300 + 400 * sw(t * 1.3 + 2 + c), 40);
            }
            const x = r() * 2 - 1;
            a[i] =
              (f(x) * 5 + f2(x) * 3) *
              Math.max(0, amp(t + c * 0.5) * 0.8 + 0.2);
          }
        }
      },
    }),
  );
  D(
    "amb_city",
    Object.assign({}, BED, {
      dur: 8,
      sr: 16000,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 140, 0.6, sr),
            lp2 = biquad("lp", 600, 0.5, sr),
            sn = slowNoise(r, 8, 6);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            a[i] =
              lp(x) * 3.5 * (0.7 + 0.3 * sn(t + c)) +
              lp2(x) * 0.2 +
              Math.sin(2 * Math.PI * 50 * t) * 0.02;
          }
        }
      },
    }),
  );
  D(
    "amb_water",
    Object.assign({}, BED, {
      dur: 9,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 700, 0.7, sr),
            bp = biquad("bp", 1800, 1.5, sr);
          // wave pulses: sum of periodic bumps at loop-friendly rates
          const rates = [2 / 9, 3 / 9, 5 / 9].map((x) => x * (c ? 1 : 1)),
            ph = rates.map(() => r());
          for (let i = 0; i < n; i++) {
            const t = i / sr;
            let env = 0;
            for (let k = 0; k < 3; k++)
              env += Math.pow(
                Math.max(
                  0,
                  Math.sin(2 * Math.PI * (rates[k] * t + ph[k] + c * 0.21)),
                ),
                3,
              );
            const x = r() * 2 - 1;
            a[i] = lp(x) * 1.3 * (0.25 + env * 0.5) + bp(x) * 0.5 * env * env;
          }
        }
      },
    }),
  );
  D(
    "amb_crickets",
    Object.assign({}, BED, {
      dur: 6,
      sr: 22050,
      gen(d, sr, r, n) {
        // several crickets, each with its own chirp rhythm and pitch, panned
        const crickets = [];
        for (let k = 0; k < 5; k++)
          crickets.push({
            f: 3900 + r() * 1400,
            period: 6 / (4 + ((r() * 6) | 0)),
            off: r(),
            pulses: 2 + ((r() * 3) | 0),
            pan: r(),
            amp: 0.3 + r() * 0.7,
          });
        for (let i = 0; i < n; i++) {
          const t = i / sr;
          let L = 0,
            R = 0;
          for (const cr of crickets) {
            const tt = ((t / cr.period + cr.off) % 1) * cr.period; // time inside this chirp cycle
            const pulseLen = 0.022,
              idx = Math.floor(tt / 0.033);
            if (idx < cr.pulses) {
              const pt = tt - idx * 0.033;
              if (pt < pulseLen) {
                const v =
                  Math.sin(2 * Math.PI * cr.f * t) *
                  Math.sin((Math.PI * pt) / pulseLen) *
                  cr.amp;
                L += v * (1 - cr.pan);
                R += v * cr.pan;
              }
            }
          }
          d[0][i] = L * 0.5 + (r() * 2 - 1) * 0.004;
          d[1][i] = R * 0.5 + (r() * 2 - 1) * 0.004;
        }
      },
    }),
  );
  D(
    "amb_cryo",
    Object.assign({}, BED, {
      dur: 6,
      sr: 16000,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 700, 0.6, sr),
            sn = slowNoise(r, 6, 4);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            const hum =
              Math.sin(2 * Math.PI * 60 * t) * 0.3 +
              Math.sin(2 * Math.PI * 120 * t + c) * 0.12 +
              Math.sin(2 * Math.PI * 240 * t) * 0.03;
            a[i] =
              hum * 0.6 +
              lp(x) * 0.9 * (0.85 + 0.15 * sn(t)) +
              Math.sin(2 * Math.PI * 7000 * t) * 0.002;
          }
        }
      },
    }),
  );
