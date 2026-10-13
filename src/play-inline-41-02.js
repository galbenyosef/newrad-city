// play-inline-41 02 — math
// Lines 384-684 of readable/play-inline-41.pretty.js (statement-aligned).
  D(
    "amb_int_machine",
    Object.assign({}, BED, {
      dur: 6,
      gain: 0.45,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            fan = biquad("bp", 1150 + c * 150, 2, sr),
            rum = biquad("lp", 90, 0.7, sr);
          const clk = 0.75,
            f0 = 30;
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            const drone =
              Math.tanh(Math.sin(2 * Math.PI * f0 * t) * 2.2) * 0.3 +
              Math.sin(2 * Math.PI * 60 * t) * 0.14 +
              Math.sin(2 * Math.PI * 60.5 * t + c) * 0.1 +
              Math.sin(2 * Math.PI * 90 * t) * 0.05;
            const blade = 0.55 + 0.45 * Math.sin(2 * Math.PI * 18 * t);
            const tc = t % clk,
              tick =
                tc < 0.08
                  ? (Math.sin(2 * Math.PI * 930 * tc) * 0.6 +
                      Math.sin(2 * Math.PI * 1470 * tc) * 0.3) *
                      Math.exp(-tc / 0.012) +
                    Math.sin(2 * Math.PI * 70 * tc) * Math.exp(-tc / 0.04) * 0.5
                  : 0;
            a[i] =
              drone * 0.8 + fan(x) * 0.5 * blade + rum(x) * 1.2 + tick * 0.18;
          }
        }
      },
    }),
  );
  /** Rain heard from inside: a muffled roar on the roof, drops ticking on the glass, a gutter running somewhere. */
  D(
    "amb_int_rain",
    Object.assign({}, BED, {
      dur: 8,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 650, 0.6, sr),
            lp2 = biquad("lp", 160, 0.7, sr),
            pat = biquad("bp", 2600 + c * 400, 3, sr),
            gut = biquad("bp", 1350, 2, sr);
          const sn = slowNoise(r, 8, 5),
            gs = slowNoise(r, 8, 9);
          let drop = 0;
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            if (r() < 0.0011) drop = (r() - 0.3) * 1.4;
            drop *= 0.8;
            a[i] =
              lp(x) * 1.2 * (0.85 + 0.15 * sn(t + c)) +
              lp2(x) * 1.2 +
              pat(drop) * 0.9 +
              gut(x) * 0.22 * Math.max(0, gs(t + c * 0.3) * 0.8 + 0.2);
          }
        }
      },
    }),
  );
  /** Underground water: a flooded level running somewhere below, bubbling and trickling. */
  D(
    "amb_int_water",
    Object.assign({}, BED, {
      dur: 10,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            flow = biquad("bp", 650, 0.6, sr),
            lp = biquad("lp", 150, 0.7, sr),
            sn = slowNoise(r, 10, 6);
          const bub = [];
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            if (r() < 12 / sr && bub.length < 6)
              bub.push({
                f: 500 + r() * 900,
                p: 0,
                k: 0,
                len: Math.floor(sr * (0.015 + r() * 0.03)),
                g: 0.1 + r() * 0.25,
              });
            let b = 0;
            for (let j = bub.length - 1; j >= 0; j--) {
              const q = bub[j],
                u = q.k / q.len;
              q.p += (2 * Math.PI * q.f * (1 + u * 0.9)) / sr;
              b +=
                Math.sin(q.p) * q.g * Math.exp(-u * 4) * Math.min(1, q.k / 20);
              if (++q.k >= q.len) bub.splice(j, 1);
            }
            a[i] = flow(x) * 0.45 * (0.75 + 0.25 * sn(t + c)) + lp(x) * 1.1 + b;
          }
        }
      },
    }),
  );
  /** A room with a handful of people in it (settlement bars, markets): talkers + glasses and cutlery. */
  D(
    "amb_int_murmur",
    Object.assign({}, BED, {
      dur: 14,
      gain: 0.45,
      gen(d, sr, r, n) {
        const tmp = new Float32Array(n);
        const ppl = 4 + ((r() * 2) | 0);
        for (let k = 0; k < ppl; k++) {
          tmp.fill(0);
          const fem = r() < 0.42,
            dist = 2.5 + r() * 9;
          nyTalker(tmp, sr, r, n, {
            f0: fem ? 175 + r() * 55 : 95 + r() * 40,
            fem,
            rasp: r() < 0.55,
            gain: 0.8 / Math.sqrt(dist),
            lp: Math.max(1800, 4000 - dist * 150),
            laugh: 0.07,
            talk: 0.3 + r() * 0.3,
            rate: 0.9 + r() * 0.2,
          });
          const pan = r(),
            gl = Math.cos((pan * Math.PI) / 2),
            gr = Math.sin((pan * Math.PI) / 2),
            dl = Math.floor(r() * sr * 0.008);
          for (let i = 0; i < n; i++) {
            const v = tmp[i];
            d[0][i] += v * gl;
            d[1][(i + dl) % n] += v * gr;
          }
        }
        tmp.fill(0);
        nyClatter(tmp, sr, r, n, 0.45, 0.06);
        for (let i = 0; i < n; i++) {
          d[0][i] += tmp[i] * 0.7;
          d[1][i] += tmp[i] * 0.5;
        }
        // a small room's early reflections (the ambience bus has no reverb send)
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            src = a.slice(0),
            t1 = Math.floor(sr * (0.011 + c * 0.003)),
            t2 = Math.floor(sr * (0.023 + c * 0.002)),
            t3 = Math.floor(sr * 0.037);
          for (let i = 0; i < n; i++)
            a[i] =
              src[i] +
              src[(i - t1 + n) % n] * 0.3 +
              src[(i - t2 + n) % n] * 0.2 +
              src[(i - t3 + n) % n] * 0.12;
        }
      },
    }),
  );
  const NEW_BEDS = [
    "amb_int_air",
    "amb_int_building",
    "amb_int_fluoro",
    "amb_int_hull",
    "amb_int_machine",
    "amb_int_rain",
    "amb_int_water",
    "amb_int_murmur",
  ];

  // ------------------------------------------------------------------
  // 3. Spot recipes (Kit graphs, baked offline; lazy → hinted on entering a space that uses them)
  // ------------------------------------------------------------------
  const SPOT = { lazy: true, priority: 7, maxVoices: 3, dedupe: 0.05 };
  D(
    "pigeon_coo",
    Object.assign({}, SPOT, {
      sr: 16000,
      dur: 1.9,
      variants: 4,
      gain: 0.3,
      ref: 5,
      wet: 1.2,
      pitchVar: 0.06,
      build(k, v) {
        // rock dove perch coo: a short lead-in, a long throaty rolling note, a falling tail ("croo-OOO-oo")
        const f = k.rr(330, 450),
          sylls =
            v === 3
              ? [
                  [0, 0.12, 0.93, 1.0],
                  [0.2, 0.55, 1.02, 1.1, 1.0],
                ]
              : [
                  [0, 0.13, 0.94, 1.0],
                  [0.2, 0.5, 1.0, 1.13, 1.04],
                  [0.78, 0.34, 1.02, 0.86],
                ];
        const o = k.osc("sine", f, 0, 1.6),
          o2 = k.osc("sine", f * 2, 0, 1.6),
          g2 = k.gain(0.16);
        const trem = k.gain(0.55),
          lfo = k.osc("triangle", k.rr(24, 32), 0, 1.6),
          lg = k.gain(0.45);
        k.chain(lfo, lg, trem.gain);
        const env = k.gain(0);
        env.gain.setValueAtTime(0.0001, k.t);
        for (const s of sylls) {
          const t0 = s[0],
            d = s[1];
          o.frequency.setValueAtTime(f * s[2], k.t + t0);
          o2.frequency.setValueAtTime(f * 2 * s[2], k.t + t0);
          if (s.length > 4) {
            o.frequency.linearRampToValueAtTime(f * s[3], k.t + t0 + d * 0.45);
            o2.frequency.linearRampToValueAtTime(
              f * 2 * s[3],
              k.t + t0 + d * 0.45,
            );
          }
          o.frequency.linearRampToValueAtTime(
            f * s[s.length - 1],
            k.t + t0 + d,
          );
          o2.frequency.linearRampToValueAtTime(
            f * 2 * s[s.length - 1],
            k.t + t0 + d,
          );
          env.gain.setValueAtTime(0.0001, k.t + t0);
          env.gain.linearRampToValueAtTime(
            1,
            k.t + t0 + Math.min(0.06, d * 0.3),
          );
          env.gain.setValueAtTime(0.85, k.t + t0 + d * 0.75);
          env.gain.linearRampToValueAtTime(0.0001, k.t + t0 + d);
        }
        const bp = k.filt("lowpass", 1300, 0.7);
        k.chain(o, trem);
        k.chain(o2, g2, trem);
        k.chain(trem, env, bp, k.out);
        k.burst({
          kind: "pink",
          start: 0.18,
          a: 0.02,
          d: 0.5,
          peak: 0.05,
          type: "bandpass",
          f: 700,
          q: 1,
        }); // throat air
      },
    }),
  );
  D(
    "pigeon_flutter",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 2.8,
      variants: 3,
      gain: 0.42,
      ref: 8,
      wet: 1.3,
      pitchVar: 0.05,
      build(k) {
        // a few birds clapping off a ledge: sharp wing claps at 8–12 Hz, the first ones loudest, then flying off
        const birds = 1 + ((k.r() * 3) | 0);
        for (let b = 0; b < birds; b++) {
          let t = b ? k.rr(0.03, 0.45) : 0.01;
          const rate = k.rr(8.5, 11.5),
            nc = 9 + ((k.r() * 14) | 0),
            fc = k.rr(1500, 2600);
          for (let j = 0; j < nc; j++) {
            const amp =
              (j < 3 ? 1 : Math.exp(-(j - 3) / (nc * 0.4))) *
              k.rr(0.7, 1) *
              (b ? 0.7 : 1);
            k.burst({
              start: t,
              a: 0.0008,
              d: 0.016,
              peak: amp,
              type: "bandpass",
              f: fc * k.rr(0.9, 1.1),
              q: 0.7,
            });
            k.burst({
              kind: "pink",
              start: t + 0.004,
              a: 0.004,
              d: 0.05,
              peak: amp * 0.5,
              type: "lowpass",
              f: 480,
            });
            t += (1 / rate) * k.rr(0.9, 1.1) * (1 + j * 0.015);
            if (t > 2.4) break;
          }
        }
      },
    }),
  );
