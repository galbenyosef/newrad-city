/* src/sound/64_spaces.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 64_spaces.js
 * INTERIOR ACOUSTICS — every interior cell gets its own acoustic space:
 * an acoustic-space preset + an ambience set per cell:
 *
 *   1. ARCHETYPES (cathedral, concourse, marble gallery, office tower,
 *      residence/hotel, hospital, bar/diner, auditorium, concrete bunker,
 *      jail, industrial, ship hull, pier, bridge, powered citadel, subway)
 *      — reverb family, ambience beds, and a spot-sound palette. Every
 *      LAYOUT.INTERIORS key is mapped; unknown keys are classified by name.
 *   2. ACOUSTIC PROBE — 8 horizontal rays + 1 up ray (2 Hz) measure the room
 *      the player actually stands in: the reverb is picked from the
 *      archetype's material family by room size (a sacristy off a cathedral
 *      nave sounds like a stone room, the nave like a cathedral; the Neon's
 *      18 places in one cell each get their own size), with hysteresis.
 *      Spot sounds are placed INSIDE the measured room (pigeons up in the
 *      vaults, rats along the walls), "somewhere in the building" sounds
 *      beyond the walls (occlusion muffles them).
 *   3. New reverbs (lazy: built on first use, released when idle):
 *      small, office, gallery, cathedral, concourse, auditorium, hull,
 *      bunker, industrial.
 *   4. New beds: big-space air, dead-building tone, fluorescent ballasts,
 *      water against a hull, machine room, rain on the roof (heard inside),
 *      underground water, a room of people (only when ≥ 3 friendly NPCs
 *      are around).
 *   5. New spots: pigeons (coo, wing-clap take-off), rats, pipe knocks,
 *      structure settling, plaster trickle, drafts moving paper, flickering
 *      tubes, floorboard creaks, ship-hull groans & wave slaps, hanging
 *      chains, far collapses, wind moaning through broken windows, glass.
 *      Outdoors: pigeons clapping off ledges in the street canyons by day.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = G._snd;
  const D = S.define;
  const clamp = S.clamp;
  // gen() bodies run in the worker (free identifiers resolve to worker-lib functions) or, without a worker, here:
  const biquad = S.biquad,
    slowNoise = S.slowNoise;
  function nyTalker() {
    return S.nyTalker.apply(null, arguments);
  }
  function nyClatter() {
    return S.nyClatter.apply(null, arguments);
  }

  // ------------------------------------------------------------------
  // 1. Reverb presets (lazy)
  // ------------------------------------------------------------------
  Object.assign(S.ENVS, {
    small: {
      lazy: true,
      wet: 0.17,
      ir: {
        dur: 0.9,
        rt60: 0.42,
        pre: 0.003,
        fc0: 6000,
        fcEnd: 1100,
        er: [
          [0.006, 0.45],
          [0.011, 0.35],
          [0.017, 0.25],
          [0.024, 0.15],
        ],
      },
    },
    office: {
      lazy: true,
      wet: 0.24,
      ir: {
        dur: 1.5,
        rt60: 0.85,
        pre: 0.008,
        fc0: 7000,
        fcEnd: 1300,
        er: [
          [0.012, 0.38],
          [0.021, 0.3],
          [0.033, 0.22],
          [0.047, 0.12],
        ],
      },
    },
    gallery: {
      lazy: true,
      wet: 0.31,
      ir: {
        dur: 3.0,
        rt60: 2.1,
        pre: 0.018,
        fc0: 8500,
        fcEnd: 1500,
        er: [
          [0.024, 0.34],
          [0.041, 0.28],
          [0.063, 0.22],
          [0.09, 0.14],
        ],
      },
    },
    cathedral: {
      lazy: true,
      wet: 0.44,
      ir: {
        dur: 5.0,
        rt60: 4.3,
        pre: 0.035,
        fc0: 5200,
        fcEnd: 520,
        width: 0.6,
        er: [
          [0.048, 0.24],
          [0.079, 0.22],
          [0.118, 0.18],
          [0.165, 0.14],
          [0.23, 0.1],
        ],
      },
    },
    concourse: {
      lazy: true,
      wet: 0.4,
      ir: {
        dur: 4.4,
        rt60: 3.5,
        pre: 0.045,
        fc0: 6500,
        fcEnd: 700,
        width: 0.5,
        er: [
          [0.07, 0.3],
          [0.13, 0.24],
          [0.21, 0.2],
          [0.32, 0.15],
          [0.46, 0.1],
        ],
      },
    },
    auditorium: {
      lazy: true,
      wet: 0.3,
      ir: {
        dur: 2.6,
        rt60: 1.8,
        pre: 0.022,
        fc0: 5000,
        fcEnd: 650,
        er: [
          [0.028, 0.3],
          [0.045, 0.26],
          [0.066, 0.2],
          [0.098, 0.12],
        ],
      },
    },
    hull: {
      lazy: true,
      wet: 0.33,
      ir: {
        dur: 1.9,
        rt60: 1.15,
        pre: 0.006,
        fc0: 7500,
        fcEnd: 1400,
        metallic: 1.8,
        er: [
          [0.009, 0.45],
          [0.016, 0.35],
          [0.026, 0.28],
          [0.037, 0.2],
        ],
      },
    },
    bunker: {
      lazy: true,
      wet: 0.29,
      ir: {
        dur: 1.7,
        rt60: 1.05,
        pre: 0.006,
        fc0: 6500,
        fcEnd: 1200,
        er: [
          [0.018, 0.4],
          [0.036, 0.33],
          [0.054, 0.27],
          [0.072, 0.21],
          [0.09, 0.15],
          [0.108, 0.1],
        ],
      },
    },
    industrial: {
      lazy: true,
      wet: 0.36,
      ir: {
        dur: 3.4,
        rt60: 2.5,
        pre: 0.03,
        fc0: 6000,
        fcEnd: 800,
        metallic: 0.7,
        er: [
          [0.05, 0.3],
          [0.1, 0.24],
          [0.17, 0.18],
          [0.26, 0.12],
        ],
      },
    },
  });

  // ------------------------------------------------------------------
  // 2. Beds (stereo seamless loops, generated in the worker, lazy)
  // ------------------------------------------------------------------
  const BED = {
    loop: true,
    bus: "amb",
    channels: 2,
    sr: 16000,
    gain: 0.5,
    pitchVar: 0,
    priority: 3,
    wet: 0,
    lazy: true,
  };
  /** A huge ruined space: sub rumble, slow hollow swells, wind moaning somewhere high up through broken glass. */
  D(
    "amb_int_air",
    Object.assign({}, BED, {
      dur: 14,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 80, 0.7, sr),
            bp = biquad("bp", 220, 0.9, sr),
            mo = biquad("bp", 480, 14, sr),
            mo2 = biquad("bp", 690, 18, sr),
            hs = biquad("bp", 2600, 0.5, sr);
          const sw = slowNoise(r, 14, 7),
            pf = slowNoise(r, 14, 5),
            am = slowNoise(r, 14, 9);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            if ((i & 63) === 0) {
              mo.set(380 + 110 * pf(t + c * 0.3), 14);
              mo2.set(560 + 150 * pf(t * 1.3 + 3), 18);
            }
            const s = 0.55 + 0.45 * sw(t + c * 0.8),
              m = Math.max(0, am(t + c * 0.5) * 0.9 + 0.1);
            a[i] =
              lp(x) * 2.4 +
              bp(x) * 0.5 * s +
              (mo(x) * 2.0 + mo2(x) * 1.2) * m +
              hs(x) * 0.015;
          }
        }
      },
    }),
  );
  /** A dead building: structure-borne rumble, a hollow air shaft somewhere, no power (no mains hum). */
  D(
    "amb_int_building",
    Object.assign({}, BED, {
      dur: 10,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 55, 0.7, sr),
            duct = biquad("bp", 118 + c * 9, 2.5, sr),
            air = biquad("bp", 320, 1.1, sr),
            mid = biquad("bp", 800, 0.7, sr);
          const s1 = slowNoise(r, 10, 5),
            s2 = slowNoise(r, 10, 7);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            a[i] =
              lp(x) * 3.2 * (0.8 + 0.2 * s1(t)) +
              duct(x) * 0.55 * (0.6 + 0.4 * s2(t + c)) +
              air(x) * 0.18 * Math.max(0, s2(t * 2 + 1) * 0.6 + 0.4) +
              mid(x) * 0.035;
          }
        }
      },
    }),
  );
  /** Fluorescent tubes still on emergency power: 120 Hz ballast hum, strike buzz, a couple of tubes flickering. */
  D(
    "amb_int_fluoro",
    Object.assign({}, BED, {
      dur: 8,
      gain: 0.35,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            bp = biquad("bp", 2400 + c * 500, 0.9, sr),
            lp = biquad("lp", 5000, 0.7, sr);
          // flicker pattern: 1–3 bursts per loop where the tube stutters on/off
          const gate = new Float32Array(n).fill(1);
          const bursts = 1 + ((r() * 3) | 0);
          for (let b = 0; b < bursts; b++) {
            let i = Math.floor(r() * n * 0.8);
            const end = Math.min(n, i + Math.floor(sr * (0.3 + r() * 0.9)));
            while (i < end) {
              const on = r() < 0.45,
                len = Math.floor(sr * (0.02 + r() * 0.1));
              for (let j = i; j < Math.min(end, i + len); j++)
                gate[j] = on ? 0.9 : 0.05;
              i += len;
            }
          }
          let prevOn = 0,
            g = 1,
            ph = r() * 6.28;
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              s = Math.sin(2 * Math.PI * 60 * t + ph);
            const on = Math.abs(s) > 0.3 ? (s > 0 ? 1 : -1) : 0,
              edge = on - prevOn;
            prevOn = on;
            g += (gate[i] - g) * 0.02;
            const hum =
              Math.sin(2 * Math.PI * 120 * t + ph) * 0.5 +
              Math.sin(2 * Math.PI * 240 * t + ph * 2) * 0.16 +
              Math.sin(2 * Math.PI * 360 * t) * 0.05;
            a[i] = lp(
              hum * 0.5 * (0.4 + 0.6 * g) +
                bp(edge) * 0.9 * g +
                (r() * 2 - 1) * 0.006,
            );
          }
        }
      },
    }),
  );
  /** Inside a steel hull: waves thudding against the plating, the hull's low boom, sloshing, a trickle. */
  D(
    "amb_int_hull",
    Object.assign({}, BED, {
      dur: 12,
      gen(d, sr, r, n) {
        for (let c = 0; c < 2; c++) {
          const a = d[c],
            lp = biquad("lp", 160, 0.7, sr),
            b1 = biquad("bp", 62 + c * 4, 5, sr),
            b2 = biquad("bp", 131, 6, sr),
            sl = biquad("bp", 420, 1.2, sr),
            sll = biquad("lp", 700, 0.7, sr),
            tr = biquad("bp", 1800, 4, sr);
          const rates = [2 / 12, 3 / 12, 5 / 12],
            ph = rates.map(() => r()),
            sn = slowNoise(r, 12, 6);
          for (let i = 0; i < n; i++) {
            const t = i / sr,
              x = r() * 2 - 1;
            let env = 0;
            for (let k = 0; k < 3; k++)
              env += Math.pow(
                Math.max(
                  0,
                  Math.sin(2 * Math.PI * (rates[k] * t + ph[k] + c * 0.13)),
                ),
                8,
              );
            const ex = x * env;
            a[i] =
              lp(ex) * 2.2 +
              b1(ex) * 6 +
              b2(ex) * 3 +
              sll(sl(x)) * 0.5 * env * env +
              tr(x) * 0.12 * (0.5 + 0.5 * sn(t)) +
              lp(x * 0.3) * 0.4;
          }
        }
      },
    }),
  );
  /** A machine room still turning over: generator drone with beating, fan blade whir, a steady mechanical tick. */
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
  D(
    "glass_clink",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 1.0,
      variants: 4,
      gain: 0.22,
      ref: 4,
      wet: 1,
      build(k, v) {
        if (v % 2 === 0) {
          // two glasses touching
          const f = k.rr(2600, 3400),
            m = k.metal(1, [f, f * 2.71, f * 5.2], 60, [1, 0.5, 0.25]);
          k.chain(m.output, k.gain(0.8), k.out);
          const taps = 1 + ((k.r() * 2) | 0);
          for (let j = 0; j < taps; j++)
            k.burst({
              start: 0.01 + j * k.rr(0.08, 0.14),
              a: 0.0002,
              d: 0.002,
              peak: 1 - j * 0.4,
              type: "highpass",
              f: 2000,
              dest: m.input,
            });
        } else {
          // a bottle set down on the bar
          const f = k.rr(700, 1000),
            m = k.metal(1, [f, f * 2.4, f * 4.1], 30, [1, 0.5, 0.3]);
          k.chain(m.output, k.gain(0.5), k.out);
          k.burst({
            kind: "brown",
            start: 0.01,
            a: 0.001,
            d: 0.03,
            peak: 1,
            type: "lowpass",
            f: 400,
          });
          k.burst({
            start: 0.01,
            a: 0.0005,
            d: 0.006,
            peak: 0.6,
            type: "bandpass",
            f: 1800,
            q: 1,
            dest: m.input,
          });
        }
      },
    }),
  );

  // ------------------------------------------------------------------
  // 4. Archetypes & interior map
  // ------------------------------------------------------------------
  // spot option flags: high (up in the vaults/rafters), far (beyond the walls, occluded), wall (along the walls, low),
  // near (close to a friendly NPC), maxD (m)
  const FAMILY = {
    // room-size class → reverb, per material family
    stone: ["stone", "stone", "gallery", "concourse"],
    plaster: ["small", "office", "hall", "concourse"],
    wood: ["small", "room", "auditorium", "auditorium"],
    concrete: ["bunker", "bunker", "hall", "tunnel"],
    metal: ["hull", "hull", "industrial", "industrial"],
  };
  const OLD = [
    ["building_settle", 0.35],
    ["plaster_trickle", 0.45],
    ["distant_thud", 0.1, { far: 1 }],
  ];
  const ARCH = {
    cathedral: {
      fam: "stone",
      over: { 2: "gallery", 3: "cathedral" },
      def: "cathedral",
      rain: 0.55,
      beds: { amb_int_air: 0.55, amb_int_building: 0.2 },
      spots: [
        ["pigeon_coo", 2.6, { high: 1 }],
        ["pigeon_flutter", 0.7, { high: 1 }],
        ["wind_moan", 0.5, { high: 1 }],
        ["drip", 2],
        ["plaster_trickle", 0.6, { high: 1 }],
        ["building_settle", 0.3],
        ["distant_thud", 0.08, { far: 1 }],
      ],
    },
    concourse: {
      fam: "stone",
      def: "concourse",
      rain: 0.5,
      beds: { amb_int_air: 0.6, amb_int_building: 0.25 },
      spots: [
        ["pigeon_coo", 1.5, { high: 1 }],
        ["pigeon_flutter", 0.6, { high: 1 }],
        ["paper_rustle", 0.8],
        ["debris", 0.35],
        ["glass_tinkle", 0.3, { high: 1 }],
        ["wind_moan", 0.4, { high: 1 }],
        ["drip", 1.5],
        ["building_settle", 0.35],
        ["distant_thud", 0.12, { far: 1 }],
      ],
    },
    gallery: {
      fam: "stone",
      def: "gallery",
      rain: 0.35,
      beds: { amb_int_building: 0.6, amb_int_air: 0.2 },
      spots: [
        ["paper_rustle", 0.4],
        ["glass_tinkle", 0.2],
        ["drip", 1.2],
        ["pipe_knock", 0.3],
        ["pigeon_coo", 0.3, { high: 1 }],
        ["wind_moan", 0.2],
      ].concat(OLD),
    },
    office: {
      fam: "plaster",
      def: "office",
      rain: 0.4,
      wind: 0.08,
      beds: { amb_int_building: 0.65 },
      spots: [
        ["paper_rustle", 1.0],
        ["pipe_knock", 0.5],
        ["fluoro_flicker", 0.35],
        ["creak", 0.3, { far: 1 }],
        ["debris", 0.25],
        ["drip", 1],
        ["wind_moan", 0.3],
      ].concat(OLD),
    },
    residence: {
      fam: "plaster",
      over: { 0: "small", 1: "room" },
      def: "room",
      rain: 0.45,
      wind: 0.05,
      beds: { amb_int_building: 0.6 },
      spots: [
        ["wood_creak", 1.2],
        ["pipe_knock", 0.6],
        ["rat_scurry", 0.5, { wall: 1 }],
        ["drip", 1.2],
        ["wind_moan", 0.3],
      ].concat(OLD),
    },
    hospital: {
      fam: "plaster",
      def: "office",
      rain: 0.4,
      wind: 0.06,
      beds: { amb_int_building: 0.5, amb_int_fluoro: 0.35 },
      spots: [
        ["fluoro_flicker", 1.2],
        ["drip", 2.5],
        ["pipe_knock", 0.5],
        ["rat_scurry", 0.5, { wall: 1 }],
        ["wood_creak", 0.3],
        ["chain_rattle", 0.15],
        ["moan", 0.12, { far: 1 }],
        ["distant_thud", 0.14, { far: 1 }],
      ],
    },
    bar: {
      fam: "wood",
      def: "small",
      rain: 0.5,
      murmur: 1,
      beds: { amb_int_building: 0.45 },
      spots: [
        ["wood_creak", 1.0],
        ["pipe_knock", 0.3],
        ["rat_scurry", 0.25, { wall: 1 }],
        ["drip", 0.5],
        ["glass_clink", 1.2, { near: 1 }],
      ],
    },
    auditorium: {
      fam: "wood",
      def: "auditorium",
      rain: 0.4,
      murmur: 0.6,
      beds: { amb_int_air: 0.35, amb_int_building: 0.4 },
      spots: [
        ["wood_creak", 0.8],
        ["chain_rattle", 0.4, { high: 1 }],
        ["pigeon_coo", 0.5, { high: 1 }],
        ["pigeon_flutter", 0.25, { high: 1 }],
        ["debris", 0.3],
      ].concat(OLD),
    },
    bunker: {
      fam: "concrete",
      def: "bunker",
      rain: 0,
      beds: { amb_room: 0.5, amb_int_machine: 0.14, amb_int_fluoro: 0.12 },
      spots: [
        ["drip", 3],
        ["pipe_knock", 0.7],
        ["chain_rattle", 0.2],
        ["rat_scurry", 0.35, { wall: 1 }],
        ["fluoro_flicker", 0.3],
        ["distant_thud", 0.1, { far: 1 }],
      ],
    },
    strongroom: {
      fam: "concrete",
      def: "bunker",
      rain: 0,
      beds: { amb_room: 0.45, amb_int_machine: 0.25, amb_int_building: 0.2 },
      spots: [
        ["pipe_knock", 0.6],
        ["machinery_clank", 0.35],
        ["drip", 1.5],
        ["fluoro_flicker", 0.4],
        ["distant_thud", 0.1, { far: 1 }],
      ],
    },
    jail: {
      fam: "concrete",
      def: "bunker",
      rain: 0.2,
      beds: { amb_room: 0.45, amb_int_water: 0.2, amb_int_building: 0.2 },
      spots: [
        ["drip", 4],
        ["chain_rattle", 0.8],
        ["pipe_knock", 0.6],
        ["rat_scurry", 0.6, { wall: 1 }],
        ["moan", 0.2, { far: 1 }],
        ["distant_thud", 0.12, { far: 1 }],
      ],
    },
    industrial: {
      fam: "metal",
      def: "industrial",
      rain: 0.6,
      wind: 0.1,
      beds: { amb_int_air: 0.4 },
      spots: [
        ["machinery_clank", 0.4],
        ["chain_rattle", 0.8, { high: 1 }],
        ["creak", 0.8, { high: 1 }],
        ["pigeon_coo", 0.6, { high: 1 }],
        ["pigeon_flutter", 0.3, { high: 1 }],
        ["drip", 2],
        ["debris", 0.3],
        ["wind_moan", 0.4, { high: 1 }],
        ["distant_thud", 0.1, { far: 1 }],
      ],
    },
    ship: {
      fam: "metal",
      def: "hull",
      rain: 0.3,
      beds: { amb_int_hull: 0.65, amb_room: 0.2 },
      spots: [
        ["hull_groan", 1.1],
        ["hull_slap", 2.2, { wall: 1 }],
        ["drip", 3],
        ["chain_rattle", 0.4],
        ["pipe_knock", 0.5],
      ],
    },
    pier: {
      fam: "metal",
      over: { 0: "room", 1: "office" },
      def: "industrial",
      rain: 0.6,
      wind: 0.12,
      beds: { amb_int_hull: 0.3, amb_int_air: 0.3 },
      spots: [
        ["hull_slap", 1.2, { wall: 1 }],
        ["creak", 0.6, { high: 1 }],
        ["wood_creak", 0.8],
        ["chain_rattle", 0.5],
        ["gull", 0.6, { far: 1 }],
        ["pigeon_coo", 0.4, { high: 1 }],
        ["drip", 1.5],
      ],
    },
    bridge: {
      fam: "stone",
      def: "gallery",
      rain: 0.5,
      wind: 0.2,
      beds: { amb_int_air: 0.5, amb_int_building: 0.2 },
      spots: [
        ["creak", 1.0, { far: 1 }],
        ["pigeon_coo", 1.2, { high: 1 }],
        ["pigeon_flutter", 0.4, { high: 1 }],
        ["drip", 2],
        ["wind_moan", 0.5, { high: 1 }],
        ["distant_thud", 0.12, { far: 1 }],
      ],
    },
    citadel: {
      fam: "plaster",
      def: "office",
      rain: 0.3,
      murmur: 0.5,
      beds: {
        amb_int_building: 0.4,
        amb_int_machine: 0.3,
        amb_int_fluoro: 0.2,
      },
      spots: [
        ["machinery_clank", 0.5],
        ["pipe_knock", 0.4],
        ["steam_hiss", 0.3],
        ["fluoro_flicker", 0.2],
      ],
    },
    powerplant: {
      fam: "metal",
      def: "industrial",
      rain: 0.4,
      beds: { amb_int_machine: 0.5, amb_int_air: 0.25, amb_int_fluoro: 0.15 },
      spots: [
        ["machinery_clank", 0.9],
        ["steam_hiss", 0.6],
        ["zap", 0.35],
        ["pipe_knock", 0.6],
        ["chain_rattle", 0.3, { high: 1 }],
        ["drip", 1.5],
      ],
    },
    tunnel: {
      fam: "concrete",
      over: { 0: "tunnel", 1: "tunnel", 2: "tunnel" },
      def: "tunnel",
      rain: 0,
      beds: { amb_tunnel: 0.85, amb_room: 0.2, amb_int_water: 0.15 },
      spots: [
        ["drip", 5],
        ["rat_scurry", 0.7, { wall: 1 }],
        ["burrowrat_squeak", 0.4, { wall: 1, pitch: 1.7, vol: 0.5 }],
        ["moan", 0.35, { far: 1 }],
        ["pipe_knock", 0.3],
        ["debris", 0.3],
        ["distant_thud", 0.2, { far: 1 }],
      ],
    },
    outdoor: {
      fam: null,
      def: "outdoor",
      rain: 0,
      beds: { amb_wind: 0.4, amb_city: 0.22 },
      outdoor: 1,
      spots: [
        ["crow", 0.6, { high: 1 }],
        ["pigeon_flutter", 0.4, { high: 1 }],
        ["debris", 0.3],
      ],
    },
    neon: {
      fam: "wood",
      def: "room",
      rain: 0.35,
      beds: { amb_int_building: 0.3 },
      spots: [
        ["wood_creak", 0.5],
        ["glass_clink", 1.0, { near: 1 }],
        ["fluoro_flicker", 0.25],
      ],
    },
    generic: {
      fam: "plaster",
      def: "room",
      rain: 0.4,
      wind: 0.05,
      beds: { amb_int_building: 0.55, amb_room: 0.2 },
      spots: [
        ["drip", 1.5],
        ["wood_creak", 0.5],
        ["pipe_knock", 0.4],
        ["rat_scurry", 0.3, { wall: 1 }],
      ].concat(OLD),
    },
  };
  const MAP = {
    subway: "tunnel",
    empire_lobby: "gallery",
    liberty_pedestal: "gallery",
    old_st_patricks: "cathedral",
    trinity_church: "cathedral",
    st_pauls_chapel: "cathedral",
    penn_station: "concourse",
    port_authority: "concourse",
    whitehall_terminal: "concourse",
    farley_post_office: "concourse",
    ellis_island: "concourse",
    un_assembly: "concourse",
    nyse_floor: "concourse",
    park_ave_armory: "concourse",
    msg: "concourse",
    amnh: "gallery",
    moma: "gallery",
    frick: "gallery",
    cooper_hewitt: "gallery",
    morgan_library: "gallery",
    woolworth_lobby: "gallery",
    city_hall_rotunda: "gallery",
    custom_house: "gallery",
    federal_hall: "gallery",
    tiffany: "gallery",
    bellamys: "gallery",
    jefferson_market: "gallery",
    cp_zoo_arsenal: "gallery",
    queensboro_bridge: "bridge",
    manhattan_bridge: "bridge",
    bankers_trust: "gallery",
    forty_wall: "gallery",
    journal_bldg: "office",
    flatiron_interior: "office",
    metlife_tower: "office",
    municipal_building: "office",
    police_hq: "office",
    singer_building: "office",
    new_york_life: "office",
    helmsley: "office",
    cooper_union: "office",
    dakota: "residence",
    plaza_hotel: "residence",
    waldorf: "residence",
    chelsea_hotel: "residence",
    algonquin: "residence",
    ansonia: "residence",
    san_remo: "residence",
    hotel_new_yorker: "residence",
    hotel_pennsylvania: "residence",
    tudor_city: "residence",
    gracie_mansion: "residence",
    bellevue: "hospital",
    roosevelt_octagon: "hospital",
    smallpox_hospital: "hospital",
    orourkes: "bar",
    bedfords: "bar",
    fraunces_tavern: "bar",
    katz_deli: "bar",
    automat: "bar",
    empire_diner: "bar",
    club_52: "bar",
    delmonicos: "bar",
    tavern_on_green: "bar",
    village_vanguard: "bar",
    carnegie_hall: "auditorium",
    lyceum_theatre: "auditorium",
    ed_sullivan: "auditorium",
    webster_hall: "auditorium",
    tammany_hall: "auditorium",
    chinatown: "bunker",
    federal_reserve: "strongroom",
    tombs: "jail",
    domino_sugar: "industrial",
    nabisco_factory: "industrial",
    empire_stores: "industrial",
    five_boro_tower: "powerplant",
    uss_hudson: "ship",
    seaport: "pier",
    pier_a: "pier",
    rockefeller_30rock: "citadel",
    high_line: "outdoor",
    neon_interiors: "neon",
  };
  const NAME_RULES = [
    [/cathedral|church|chapel|basilica|synagogue|temple/i, "cathedral"],
    [
      /station|terminal|concourse|arena|garden|hall of|assembly|armory|post office|exchange/i,
      "concourse",
    ],
    [/museum|gallery|library|collection|lobby|rotunda|bank|court/i, "gallery"],
    [/hospital|clinic|asylum|infirmary|sanitar/i, "hospital"],
    [
      /bar\b|tavern|saloon|pub|ale house|diner|deli|automat|club|caf[eé]|restaurant|bistro/i,
      "bar",
    ],
    [/theat|opera|music hall|carnegie|ballroom|cinema/i, "auditorium"],
    [/hotel|apartment|mansion|house|residence|tenement|dakota/i, "residence"],
    [/bunker|cryo|shelter|jail|prison|tombs|cell|strongroom/i, "bunker"],
    [
      /factory|refinery|plant|mill|warehouse|works|foundry|depot/i,
      "industrial",
    ],
    [/ship|uss |boat|ferry|pier|dock|wharf/i, "pier"],
    [/subway|tunnel|sewer|metro|underground/i, "tunnel"],
    [/tower|building|office|headquarters|hq|plaza/i, "office"],
  ];
  S.spaceArch = ARCH;
  S.spaceRules = NAME_RULES; // 68_story_cues.js adds the lair's archetypes (candlehall, sunroom, track61)
  const archCache = {};
  /** Archetype key for an interior cell (flags on the INTERIORS entry win: `acoustics: '<archetype>'`). */
  function archOf(key) {
    if (!key) return "generic";
    if (archCache[key]) return archCache[key];
    const def = (G.LAYOUT.INTERIORS && G.LAYOUT.INTERIORS[key]) || {};
    let a = def.acoustics && ARCH[def.acoustics] ? def.acoustics : MAP[key];
    if (!a) {
      const nm = def.name || key;
      for (const r of NAME_RULES)
        if (r[0].test(nm)) {
          a = r[1];
          break;
        }
    }
    return (archCache[key] = a || "generic");
  }
  /** Settlement interiors (friendly LOCATIONS entry linked by interior or id). */
  const settleCache = {};
  function isSettlement(key) {
    if (key in settleCache) return settleCache[key];
    let s = false;
    try {
      const loc = (G.LAYOUT.LOCATIONS || []).find(
        (l) => l.interior === key || l.id === key,
      );
      s = !!(loc && !loc.hostile && loc.type === "settlement");
    } catch (e) {
      /* */
    }
    return (settleCache[key] = s);
  }

  // ------------------------------------------------------------------
  // 5. Acoustic probe
  // ------------------------------------------------------------------
  const IGN = [
    "actor",
    "prop_small",
    "interactable_self",
    "furniture",
    "counter",
    "cover",
    "rail",
    "railing",
    "prop",
    "skill_book",
    "column",
    "bars",
    "machine",
    "rubble",
  ];
  const RAYS = [];
  for (let i = 0; i < 8; i++)
    RAYS.push({
      x: Math.cos((i * Math.PI) / 4),
      y: 0,
      z: Math.sin((i * Math.PI) / 4),
    });
  const UP = { x: 0, y: 1, z: 0 };
  const PMAX = 50;
  const SP = (S.spaces = {
    probe: {
      valid: false,
      d: new Array(8).fill(20),
      span: 20,
      ceil: 12,
      cls: 1,
      hits: 0,
    },
    cls: -1,
    pendCls: -1,
    pendN: 0,
    key: null,
    arch: "generic",
    people: 0,
    peopleT: 0,
    rateK: 1,
    envName: null,
    ARCH,
    MAP,
  });
  function runProbe(p) {
    const pr = SP.probe,
      o = { x: p.x, y: p.y + 2.1, z: p.z };
    let hits = 0;
    try {
      for (let i = 0; i < 8; i++) {
        const h = G.world.raycast(o, RAYS[i], PMAX, { ignoreTags: IGN });
        if (h && h.collider) {
          pr.d[i] = Math.max(0.5, h.dist);
          hits++;
        } else pr.d[i] = PMAX;
      }
      const u = G.world.raycast({ x: p.x, y: p.y + 1.7, z: p.z }, UP, 60, {
        ignoreTags: IGN,
      });
      pr.ceilHit = !!(u && u.collider);
      pr.ceil = pr.ceilHit ? Math.max(2.4, u.dist + 1.7) : 14; // many cells have no ceiling collider
    } catch (e) {
      hits = 0;
    }
    pr.hits = hits;
    pr.valid = hits >= 3;
    // room size: twice the mean of the 5 shortest of the 8 wall distances (the 3 longest usually run out through a
    // doorway, an arch or down a corridor), so a nave reads by its width, a bar by its walls, not by its front door
    const sd = pr.d.slice(0).sort((x, y) => x - y);
    pr.span = (2 * (sd[0] + sd[1] + sd[2] + sd[3] + sd[4])) / 5;
    let cls = pr.span < 6 ? 0 : pr.span < 12 ? 1 : pr.span < 22 ? 2 : 3;
    if (pr.ceilHit && cls >= 2 && pr.ceil < 4.2) cls--; // a low ceiling is never a hall
    if (pr.ceilHit && cls === 1 && pr.ceil > 9) cls = 2; // a tall narrow space (stairwell, atrium) rings like one
    pr.cls = cls;
    return pr;
  }

  // ------------------------------------------------------------------
  // 6. Per-tick API used by the ambience system (60_ambience.js)
  // ------------------------------------------------------------------
  /** Called from sampleContext (2 Hz) for interiors: probe + archetype + occupancy. */
  SP.sample = function (c, p) {
    if (c.interior !== SP.key) {
      SP.key = c.interior;
      SP.arch = archOf(c.interior);
      SP.cls = -1;
      SP.pendCls = -1;
      SP.entered = true;
      hintArch(SP.arch);
    }
    const A = ARCH[SP.arch];
    if (A.fam) {
      const pr = runProbe(p);
      if (pr.valid) {
        if (SP.cls < 0) SP.cls = pr.cls;
        else if (pr.cls !== SP.cls) {
          if (pr.cls === SP.pendCls) {
            if (++SP.pendN >= 2) {
              SP.cls = pr.cls;
              SP.pendN = 0;
            }
          } else {
            SP.pendCls = pr.cls;
            SP.pendN = 1;
          }
        } else SP.pendN = 0;
      }
    } else SP.probe.valid = false;
    // friendly people around (1×/s)
    SP.peopleT -= 0.5;
    if (SP.peopleT <= 0) {
      SP.peopleT = 1;
      SP.people = countPeople(p, 14);
    }
    c.arch = SP.arch;
    c.probe = SP.probe;
    c.people = SP.people;
  };
  /** Reverb for the current interior sample. */
  SP.env = function (c) {
    if (S.isStartLab(c.interior)) return "cryo";
    const A = ARCH[SP.arch] || ARCH.generic;
    if (!A.fam || !SP.probe.valid || SP.cls < 0) return A.def;
    return (A.over && A.over[SP.cls]) || FAMILY[A.fam][SP.cls] || A.def;
  };
  /** Fill ambience-bed targets for an interior. Returns false for cells the legacy path keeps (Cryo Unit C-9). */
  SP.beds = function (c, t) {
    if (S.isStartLab(c.interior)) return false;
    const A = ARCH[SP.arch] || ARCH.generic;
    // bigger rooms get more of the big-space air, tiny rooms less
    const cls = SP.probe.valid ? SP.cls : 1,
      sizeK = [0.7, 0.9, 1.05, 1.2][Math.max(0, cls)];
    for (const b in A.beds)
      t[b] = A.beds[b] * (b === "amb_int_air" ? sizeK : 1);
    if (A.wind) t.amb_wind = (t.amb_wind || 0) + A.wind;
    if (A.rain && (c.weather === "rain" || c.weather === "thunderstorm"))
      t.amb_int_rain = A.rain * (c.weather === "thunderstorm" ? 1.15 : 1);
    // a handful of people → a murmuring room (settlements, bars; never for 1–2 NPCs, who bark for themselves)
    const mk = A.murmur || (isSettlement(c.interior) ? 0.55 : 0);
    if (mk && c.people >= 3)
      t.amb_int_murmur = mk * clamp(0.18 + (c.people - 3) * 0.08, 0.18, 0.5);
    return true;
  };
  function countPeople(p, r) {
    let n = 0;
    try {
      const list =
        G.actors && !G.isStub("actors") && G.actors.list
          ? G.actors.list()
          : null;
      if (!list) return 0;
      for (const a of list) {
        if (!a || a.dead || !a.pos || a.isCreature || a.isRobot) continue;
        if (
          Math.abs(a.pos.x - p.x) > r ||
          Math.abs(a.pos.z - p.z) > r ||
          Math.abs(a.pos.y - p.y) > 5
        )
          continue;
        if (a.hostile || (a.isHostile && a.isHostile())) continue;
        n++;
      }
    } catch (e) {
      return 0;
    }
    return n;
  }
  function nearPerson(p, r) {
    try {
      const list =
        G.actors && !G.isStub("actors") && G.actors.list
          ? G.actors.list()
          : null;
      if (!list) return null;
      const c = [];
      for (const a of list) {
        if (!a || a.dead || !a.pos || a.isCreature || a.isRobot || a.hostile)
          continue;
        if (
          Math.hypot(a.pos.x - p.x, a.pos.z - p.z) < r &&
          Math.abs(a.pos.y - p.y) < 4
        )
          c.push(a);
      }
      return c.length ? S.pick(c) : null;
    } catch (e) {
      return null;
    }
  }
  function hintArch(a) {
    const A = ARCH[a];
    if (!A) return;
    for (const s of A.spots) S.hintBake(s[0], 4);
  }
  /** A position for a spot sound inside (or, `far`, beyond) the measured room. */
  function spotPos(o) {
    const L = S.listenerPos,
      pr = SP.probe;
    if (o.near) {
      const a = nearPerson(G.player.pos, 16);
      if (a)
        return {
          x: a.pos.x + S.rand(-0.6, 0.6),
          y: a.pos.y + 1.1,
          z: a.pos.z + S.rand(-0.6, 0.6),
        };
      return null;
    }
    const i = (Math.random() * 8) | 0,
      ang = (i * Math.PI) / 4 + S.rand(-0.3, 0.3);
    const dWall = pr.valid ? pr.d[i] : 18;
    let dist;
    if (o.far) dist = Math.min(dWall, 45) + S.rand(5, 20);
    else if (o.wall) dist = Math.max(1.5, dWall - S.rand(0.3, 1.2));
    else dist = clamp(S.rand(0.35, 0.92) * dWall, 1.5, o.maxD || 40);
    const ceil = pr.valid ? pr.ceil : 10;
    const y = o.high
      ? L.y +
        S.rand(
          Math.min(3, ceil * 0.5),
          Math.max(2, Math.min(16, ceil - 1.7 - 0.4)),
        )
      : o.wall
        ? L.y - 1.5
        : L.y + S.rand(-1.2, 1.5);
    return { x: L.x + Math.cos(ang) * dist, y, z: L.z + Math.sin(ang) * dist };
  }
  /** Spot sounds for the current interior (called from the ambience update in play/goggles). */
  SP.spots = function (c, dt) {
    if (S.isStartLab(c.interior)) return;
    const A = ARCH[SP.arch] || ARCH.generic;
    // the first seconds after a door: let the space settle in before things start happening
    if (SP.entered) {
      SP.entered = false;
      SP.quietUntil = G.time.real + 4;
    }
    if (G.time.real < (SP.quietUntil || 0)) return;
    const small = SP.probe.valid && SP.cls === 0;
    for (const s of A.spots) {
      const name = s[0],
        rate = s[1] * (small && s[2] && s[2].high ? 0.3 : 1),
        o = s[2] || {};
      if (Math.random() >= (rate / 60) * dt) continue;
      if (S.R[name] && S.R[name].lazy && !S.cache[name]) {
        S.hintBake(name, 2);
        continue;
      } // never live-synthesise a lazy spot
      const pos = spotPos(o);
      if (!pos) continue;
      try {
        S.play(name, {
          pos,
          volume: (o.vol || 1) * (o.far ? 0.8 : 1) * S.rand(0.7, 1),
          pitch: o.pitch,
          noOcclusion: !o.far,
          distant: !!o.far,
        });
        // pigeons: a coo often answers another, flutters startle the others into cooing
        if (name === "pigeon_flutter" && Math.random() < 0.4)
          S.play("pigeon_coo", {
            pos: spotPos({ high: 1 }),
            delay: S.rand(1.5, 4),
            noOcclusion: true,
            volume: 0.7,
          });
        if (name === "pigeon_coo" && Math.random() < 0.35)
          S.play("pigeon_coo", {
            pos: {
              x: pos.x + S.rand(-3, 3),
              y: pos.y,
              z: pos.z + S.rand(-3, 3),
            },
            delay: S.rand(0.8, 2.2),
            noOcclusion: true,
            volume: 0.6,
            pitch: S.rand(0.92, 1.08),
          });
      } catch (e) {
        G.reportError("sound:space:" + name, e);
      }
    }
  };
  /** Outdoor extras: pigeons clapping off ledges in the street canyons by day; cooing under cover. */
  SP.outdoorSpots = function (c, dt) {
    const canyon =
      c.district === "midtown" ||
      c.district === "financial_district" ||
      c.district === "midtown_south" ||
      c.district === "lower_east_side" ||
      c.district === "village";
    const day =
      !c.night && c.weather !== "rain" && c.weather !== "thunderstorm";
    let rf = 0,
      rc = 0;
    if (day && canyon && c.alt < 12) rf = 0.35;
    if (day && c.covered) {
      rc = 0.9;
      rf += 0.15;
    }
    if (S.neonNear && S.neonNear(c.px, c.pz) > 0.5) {
      rf *= 0.3;
      rc *= 0.3;
    }
    const L = S.listenerPos;
    if (rf && Math.random() < (rf / 60) * dt) {
      if (!S.cache.pigeon_flutter) S.hintBake("pigeon_flutter", 3);
      else {
        const a = Math.random() * 6.283,
          d = S.rand(12, 40);
        S.play("pigeon_flutter", {
          pos: {
            x: L.x + Math.cos(a) * d,
            y: L.y + S.rand(8, 22),
            z: L.z + Math.sin(a) * d,
          },
          noOcclusion: true,
          volume: 0.8,
        });
      }
    }
    if (rc && Math.random() < (rc / 60) * dt) {
      if (!S.cache.pigeon_coo) S.hintBake("pigeon_coo", 3);
      else {
        const a = Math.random() * 6.283,
          d = S.rand(4, 14);
        S.play("pigeon_coo", {
          pos: {
            x: L.x + Math.cos(a) * d,
            y: L.y + S.rand(2, Math.max(2.5, c.roofH - 0.5)),
            z: L.z + Math.sin(a) * d,
          },
          noOcclusion: true,
          volume: 0.8,
        });
      }
    }
  };
  /** Leaving interiors: forget the room so the next door starts fresh. */
  SP.outside = function () {
    SP.key = null;
    SP.cls = -1;
    SP.probe.valid = false;
  };
  /** Diagnostics: current archetype, room size class, reverb. */
  SP.info = function () {
    return {
      key: SP.key,
      arch: SP.arch,
      span: +SP.probe.span.toFixed(1),
      ceil: +SP.probe.ceil.toFixed(1),
      cls: SP.cls,
      valid: SP.probe.valid,
      env: S.env.name,
      people: SP.people,
    };
  };
  SP.archOf = archOf;
  SP.NEW_BEDS = NEW_BEDS;

  // register the new beds with the ambience system
  if (S.amb && S.amb.addBeds) S.amb.addBeds(NEW_BEDS);
})();
