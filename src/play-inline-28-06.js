// play-inline-28 06 — math
// Lines 1705-1809 of readable/play-inline-28.pretty.js (statement-aligned).
  D(
    "amb_room",
    Object.assign({}, BED, {
      dur: 8,
      sr: 16000,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 260, 0.6, sr),
            bp = biquad("bp", 900, 0.8, sr),
            sn = slowNoise(r, 8, 5);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            a[i] = lp(x) * 2.2 * (0.7 + 0.3 * sn(t + c)) + bp(x) * 0.06;
          }
        }
      },
    }),
  );
  D(
    "amb_tunnel",
    Object.assign({}, BED, {
      dur: 12,
      sr: 16000,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 120, 0.7, sr),
            bp = biquad("bp", 500, 1.2, sr),
            sw = slowNoise(r, 12, 6),
            am = slowNoise(r, 12, 8);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            if ((i & 63) === 0) bp.set(350 + 250 * (sw(t + c) + 1), 1.4);
            a[i] = lp(x) * 3 + bp(x) * 0.6 * Math.max(0, am(t) * 0.7 + 0.4);
          }
        }
      },
    }),
  );
  D(
    "amb_rain",
    Object.assign({}, BED, {
      dur: 5,
      sr: 22050,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            hp = biquad("hp", 900, 0.6, sr),
            lp = biquad("lp", 7000, 0.6, sr);
          let drop = 0;
          for (let i = 0; i < n; i++) {
            const x = r() * 2 - 1;
            if (r() < 0.0025) drop = (r() - 0.3) * 1.5;
            drop *= 0.86;
            a[i] = lp(hp(x)) * 0.55 + drop * 0.5;
          }
        }
      },
    }),
  );
  D(
    "amb_storm",
    Object.assign({}, BED, {
      dur: 6,
      sr: 22050,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            sn = slowNoise(r, 6, 12);
          let ring = 0,
            v = 0;
          for (let i = 0; i < n; i++) {
            const t = i / sr;
            if (r() < 0.0012 * (1 + sn(t))) v = (r() - 0.5) * 2;
            ring = ring * 0.8 + v;
            v *= 0.2;
            a[i] =
              ring * 0.3 +
              Math.sin(2 * Math.PI * 55 * t) * 0.05 * (1 + sn(t + 1));
          }
        }
      },
    }),
  );
  D(
    "amb_hum_generator",
    Object.assign({}, BED, {
      dur: 4,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c];
          for (let i = 0; i < n; i++) {
            const t = i / sr;
            a[i] =
              Math.tanh(Math.sin(2 * Math.PI * 30 * t) * 3) * 0.3 +
              Math.sin(2 * Math.PI * 90 * t) * 0.1 +
              (r() * 2 - 1) * 0.04;
          }
        }
      },
    }),
  );
