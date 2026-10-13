// play-inline-40 01 — math
// Lines 30-375 of readable/play-inline-40.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;
  const D = S.define;
  const clamp = S.clamp;

  // ------------------------------------------------------------------
  // Worker DSP: a babbling talker (parallel formant voice, no words)
  // ------------------------------------------------------------------
  /**
   * Adds one talker into `out` (Float32Array). o: {f0, fem, rasp, gain, lp, laugh (0..1 laugh chance per
   * utterance), talk (fraction of time talking), seed offset via r}. Pure JS, shipped to the worker.
   */
  function nyTalker(out, sr, r, n, o) {
    const VW = [
      [730, 1090, 2440],
      [530, 1840, 2480],
      [290, 2250, 2950],
      [570, 840, 2410],
      [440, 1020, 2240],
      [300, 870, 2240],
      [660, 1720, 2410],
      [490, 1350, 1690],
      [520, 1190, 2390],
      [400, 1920, 2560],
    ];
    const fk = o.fem ? 1.17 : 1;
    const bq1 = biquad("bp", 500, 5, sr),
      bq2 = biquad("bp", 1500, 9, sr),
      bq3 = biquad("bp", 2500, 12, sr);
    const frq = biquad("bp", 4500, 1.4, sr),
      lpo = biquad("lp", o.lp || 4000, 0.6, sr),
      hpo = biquad("hp", o.fem ? 140 : 90, 0.7, sr);
    let F1 = 500,
      F2 = 1500,
      F3 = 2500,
      T1 = 500,
      T2 = 1500,
      T3 = 2500;
    let ph = 0,
      prevG = 0,
      f0 = o.f0,
      jit = 1;
    // utterance state
    let mode = 0,
      left = o.now ? 1 : r() * 1.5 * sr,
      uttLen = 1,
      uttPos = 0,
      laughing = false,
      q = false;
    let syl = 0,
      sylPos = 0,
      sylLen = 1,
      onsetLen = 0,
      onsetKind = 0,
      stress = 1,
      amp = 0,
      ampT = 0,
      aspT = 0,
      asp = 0;
    const talk = o.talk === undefined ? 0.55 : o.talk;
    const newUtt = () => {
      laughing = r() < (o.laugh || 0);
      const nsyl = laughing ? 3 + ((r() * 5) | 0) : 2 + ((r() * 13) | 0);
      uttLen = nsyl;
      uttPos = 0;
      q = r() < 0.18;
      syl = 0;
      newSyl();
    };
    const newSyl = () => {
      const base = laughing
        ? 0.17 + r() * 0.05
        : (0.11 + r() * 0.15) * (o.rate || 1);
      sylLen = Math.floor(base * sr);
      sylPos = 0;
      onsetKind = laughing
        ? 4
        : r() < 0.25
          ? 0
          : r() < 0.45
            ? 1
            : r() < 0.7
              ? 2
              : 3; // none, fricative, stop, nasal, laugh /h/
      onsetLen = Math.floor(
        (onsetKind === 1
          ? 0.06
          : onsetKind === 2
            ? 0.025
            : onsetKind === 3
              ? 0.05
              : onsetKind === 4
                ? 0.05
                : 0) * sr,
      );
      stress = laughing ? 1 - syl * 0.08 : r() < 0.3 ? 1.35 : 0.85 + r() * 0.2;
      const v = laughing ? VW[0] : VW[(r() * VW.length) | 0];
      T1 = v[0] * fk * (laughing ? 1.05 : 1);
      T2 = v[1] * fk;
      T3 = v[2] * fk;
      if (onsetKind === 1) frq.set(2800 + r() * 3500, 1.2 + r());
    };
    for (let i = 0; i < n; i++) {
      if (mode === 0) {
        // pause between utterances
        if (--left <= 0) {
          mode = 1;
          newUtt();
        }
        ampT = 0;
        aspT = 0;
      } else {
        // inside a syllable: onset consonant then vowel
        const k = uttPos / Math.max(1, uttLen); // declination / question rise
        let fk0 = laughing
          ? 1.45 - syl * 0.05
          : 1.12 - 0.22 * k + (q && k > 0.75 ? (k - 0.75) * 1.6 : 0);
        fk0 *= 1 + (stress - 1) * 0.35;
        const inOnset = sylPos < onsetLen;
        if (inOnset) {
          if (onsetKind === 1) {
            ampT = 0.08;
            aspT = 0.55;
          } else if (onsetKind === 2) {
            ampT = 0;
            aspT = sylPos < sr * 0.012 ? 0.9 : 0;
          } else if (onsetKind === 3) {
            ampT = 0.35 * stress;
            aspT = 0;
            T1 = 280 * fk;
          } else if (onsetKind === 4) {
            ampT = 0.03;
            aspT = 0.5;
          }
        } else {
          const vp = (sylPos - onsetLen) / Math.max(1, sylLen - onsetLen);
          ampT =
            stress *
            (laughing
              ? Math.pow(Math.sin(Math.PI * Math.min(1, vp * 1.15)), 1.5)
              : Math.pow(Math.sin(Math.PI * vp), 0.8));
          aspT = laughing ? 0.12 : 0.04;
        }
        f0 += (o.f0 * fk0 - f0) * 0.002;
        if (++sylPos >= sylLen) {
          syl++;
          uttPos++;
          if (uttPos >= uttLen) {
            mode = 0;
            left = Math.floor(
              (sr * (talk > 0.5 ? 0.25 + r() * 1.2 : 0.8 + r() * 3.5)) /
                Math.max(0.2, talk * 1.6),
            );
          } else newSyl();
        }
      }
      // smooth controls (≈ 6–25 ms)
      amp += (ampT - amp) * (ampT > amp ? 0.012 : 0.008);
      asp += (aspT - asp) * 0.02;
      if ((i & 31) === 0) {
        F1 += (T1 - F1) * 0.35;
        F2 += (T2 - F2) * 0.3;
        F3 += (T3 - F3) * 0.3;
        bq1.set(F1, 5);
        bq2.set(F2, 9);
        bq3.set(F3, 12);
        jit = 1 + (r() - 0.5) * (o.rasp ? 0.06 : 0.015);
      }
      // glottal source: Rosenberg flow pulse, differentiated (lip radiation) → buzzy but not harsh
      ph += (f0 * jit) / sr;
      if (ph >= 1) ph -= 1;
      const oq = 0.6,
        g =
          ph < oq
            ? 0.5 * (1 - Math.cos((Math.PI * ph) / oq))
            : Math.max(
                0,
                Math.cos((Math.PI * (ph - oq)) / (2 * (1 - oq) * 0.35)),
              );
      const dg = ((g - prevG) * sr) / (f0 * 6);
      prevG = g;
      const nz = r() * 2 - 1;
      const src =
        dg * amp +
        nz *
          (asp * 0.5 +
            (o.rasp ? amp * 0.22 * (ph < oq ? 1 : 0.3) : amp * 0.03));
      let y = bq1(src) * 1.0 + bq2(src) * 0.55 + bq3(src) * 0.28;
      if (asp > 0.05) y += frq(nz) * asp * 0.35;
      out[i] += lpo(hpo(y)) * o.gain;
    }
  }
  /** Metallic impacts (tin cans, pots, crates) scattered through `out` at `rate` per second. */
  function nyClatter(out, sr, r, n, rate, gain) {
    let i = Math.floor((r() * sr * 0.5) / rate);
    while (i < n) {
      const hits = 1 + ((r() * 3) | 0),
        fb = 700 + r() * 2600,
        kind = r();
      let at = i;
      for (let h = 0; h < hits && at < n; h++) {
        const parts = [1, 2.31 + r() * 0.2, 3.9 + r() * 0.4, 5.6 + r() * 0.5],
          g0 = gain * (0.4 + r() * 0.6) * (h ? 0.5 : 1);
        const dec = kind < 0.5 ? 0.05 + r() * 0.08 : 0.012 + r() * 0.03,
          len = Math.min(n - at, Math.floor(dec * 6 * sr));
        for (let k = 0; k < len; k++) {
          const t = k / sr,
            e = Math.exp(-t / dec);
          let v = 0;
          for (let p = 0; p < 4; p++)
            v +=
              (Math.sin(2 * Math.PI * fb * parts[p] * t) *
                Math.exp(-t * p * 12)) /
              (p + 1);
          if (kind >= 0.5) v = v * 0.4 + (r() * 2 - 1) * 0.7; // wooden crate / thud
          out[at + k] += v * e * g0;
        }
        at += Math.floor((0.05 + r() * 0.14) * sr);
      }
      i += Math.floor((sr * (0.2 + r() * 2)) / rate);
    }
  }
  /** Crowd bed: `talkers` distant voices, stereo placed, + market clatter + low street murmur. */
  function nyCrowdBed(d, sr, r, n, o) {
    const tmp = new Float32Array(n);
    for (let k = 0; k < o.talkers; k++) {
      tmp.fill(0);
      const fem = r() < 0.4,
        dist = 4 + r() * 26;
      nyTalker(tmp, sr, r, n, {
        f0: fem ? 175 + r() * 60 : 92 + r() * 45,
        fem,
        rasp: r() < 0.3,
        gain: 0.9 / Math.sqrt(dist),
        lp: Math.max(900, 4200 - dist * 110) * o.lpK,
        laugh: 0.08,
        talk: 0.35 + r() * 0.4,
      });
      const pan = r(),
        gl = Math.cos((pan * Math.PI) / 2),
        gr = Math.sin((pan * Math.PI) / 2);
      const dl = Math.floor(r() * sr * 0.012); // interaural-ish offset
      for (let i = 0; i < n; i++) {
        const v = tmp[i];
        d[0][i] += v * gl;
        d[1][(i + dl) % n] += v * gr;
      }
    }
    tmp.fill(0);
    nyClatter(tmp, sr, r, n, o.clatter, 0.08);
    const pan = r();
    for (let i = 0; i < n; i++) {
      d[0][i] += tmp[i] * (0.4 + pan * 0.6);
      d[1][i] += tmp[i] * (1 - pan * 0.6);
    }
    // street reflections (canyon facades) + low murmur; then the distance / wall filter
    for (let c = 0; c < 2; c++) {
      const a = d[c],
        lp = biquad("lp", 160, 0.6, sr),
        wall = biquad("lp", o.wall || 20000, 0.6, sr),
        sn = slowNoise(r, n / sr, 6);
      const taps = [
        [Math.floor(sr * (0.023 + c * 0.006)), 0.32],
        [Math.floor(sr * (0.047 + c * 0.004)), 0.2],
        [Math.floor(sr * 0.081), 0.12],
      ];
      const src = a.slice(0);
      for (let i = 0; i < n; i++) {
        let v = src[i];
        for (const t of taps) v += src[(i - t[0] + n) % n] * t[1];
        const x = r() * 2 - 1;
        v += lp(x) * 0.5 * (0.7 + 0.3 * sn(i / sr + c));
        a[i] = o.wall ? wall(v) : v;
      }
    }
  }
  /** Gas-discharge neon: the tube strikes twice per mains cycle (sharp current edges = the buzz) + ballast hum. */
  function nyNeonBuzz(a, sr, r, n, o) {
    const bp = biquad("bp", o.bp || 2600, 0.8, sr),
      hp = biquad("hp", 1800, 0.7, sr),
      lp = biquad("lp", 5200, 0.7, sr);
    let prevOn = 0,
      ring = 0,
      ringV = 0;
    const strike = o.strike || 0.32;
    for (let i = 0; i < n; i++) {
      const t = i / sr,
        s = Math.sin(2 * Math.PI * 60 * t);
      const on = Math.abs(s) > strike ? (s > 0 ? 1 : -1) : 0;
      const edge = on - prevOn;
      prevOn = on;
      const hum =
        Math.sin(2 * Math.PI * 120 * t) * 0.34 +
        Math.sin(2 * Math.PI * 240 * t + 0.4) * 0.13 +
        Math.sin(2 * Math.PI * 360 * t + 1.1) * 0.05;
      if (r() < (o.crackle || 0.00012)) ringV = (r() - 0.5) * 3;
      ring = ring * 0.9 + ringV;
      ringV *= 0.3;
      const hiss = on ? hp(r() * 2 - 1) * 0.05 : hp(0) * 0.05;
      a[i] = lp(hum * 0.55 + bp(edge * 1.6) * 0.9 + hiss + ring * 0.25);
    }
  }
  S.workerLib(nyTalker, nyClatter, nyCrowdBed, nyNeonBuzz);
  S.nyTalker = nyTalker;
  S.nyClatter = nyClatter; // main-thread fallback for other beds that use the babble voice (64_spaces.js)

  // ------------------------------------------------------------------
  // Recipes
  // ------------------------------------------------------------------
  const BED = {
    loop: true,
    bus: "amb",
    channels: 2,
    sr: 16000,
    gain: 0.55,
    pitchVar: 0,
    priority: 2,
    wet: 0,
    lazy: true,
  };
  D(
    "amb_neon",
    Object.assign({}, BED, {
      dur: 16,
      gen(d, sr, r, n) {
        nyCrowdBed(d, sr, r, n, { talkers: 12, clatter: 0.8, lpK: 1 });
      },
    }),
  );
  D(
    "amb_neon_in",
    Object.assign({}, BED, {
      dur: 14,
      gain: 0.5,
      gen(d, sr, r, n) {
        nyCrowdBed(d, sr, r, n, {
          talkers: 9,
          clatter: 0.5,
          lpK: 0.8,
          wall: 480,
        });
      },
    }),
  );
  // conversation pockets: 3–4 people close together, turn-taking, the odd laugh (mono, positional)
