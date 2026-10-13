/* src/sound/62_neon.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 62_neon.js
 * THE NEON (Times Square) soundscape + VOICED NPC BARKS.
 *
 *  1. Crowd walla — procedurally "spoken" babble (glottal source through
 *     moving formant resonators, syllable rhythm, declination, turn-taking,
 *     smoky rasp, laughter), rendered in the generation worker:
 *       amb_neon      stereo bed: the whole market at a distance (+ clatter)
 *       amb_neon_in   the same heard through a wall (Neon interiors)
 *       neon_chatter_a/b/c/d  mono positional conversation pockets placed on
 *                     the market anchors, louder where NPCs actually stand.
 *     Level follows the hour (market day, nightlife, dead of night).
 *  2. Neon hum — gas-discharge buzz (120 Hz strike pulses + transformer
 *     magnetostriction) as positional loops on the square's real sign glows
 *     (read from the landmark's glow Points), louder at night; random
 *     sputtering tubes.
 *  3. Market life spots — cash register, tin/pot clatter, crowd laughter.
 *  4. The Rad Room JUKEBOX — Radio Free Manhattan's records (band + sung
 *     vocals) played on a 1950s jukebox: record-change mechanism, 78 crackle,
 *     cabinet tone, positional & occluded; the score steps aside near it.
 *  5. VOICED BARKS — every NPC bark / hawker cry / conversation line shown by
 *     combat's bark captions is performed by VOX (the radio formant voice,
 *     dry, no AM chain) from the speaker's head: human m/f, old men,
 *     Brute, robot (comb + ring-mod). Positional, following the actor.
 *     TEMPORARY BRIDGE: combat has no bark event yet, so G.combat.showBark is
 *     wrapped at call time (request in NOTES.md: emit `actorBark`).
 * ===================================================================== */
(function () {
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
  const CHAT = {
    loop: true,
    dur: 13,
    sr: 16000,
    gain: 0.7,
    ref: 4,
    rolloff: 1.1,
    priority: 3,
    pitchVar: 0.02,
    wet: 0.7,
    maxVoices: 2,
    lazy: true,
  };
  ["a", "b", "c", "d"].forEach((id, k) =>
    D(
      "neon_chatter_" + id,
      Object.assign({}, CHAT, {
        gen(d, sr, r, n) {
          const a = d[0],
            ppl = 3 + (r() < 0.5 ? 1 : 0);
          for (let p = 0; p < ppl; p++) {
            const fem = r() < 0.45;
            nyTalker(a, sr, r, n, {
              f0: fem ? 170 + r() * 70 : 88 + r() * 50,
              fem,
              rasp: r() < 0.3,
              gain: 0.5 + r() * 0.5,
              lp: 3000 + r() * 1500,
              laugh: 0.12,
              talk: 0.3 + r() * 0.25,
              rate: 0.9 + r() * 0.25,
            });
          }
          nyClatter(a, sr, r, n, 0.25, 0.05);
        },
      }),
    ),
  );
  // neon tube buzz (positional, on the signs)
  D("neon_buzz", {
    dur: 3,
    loop: true,
    sr: 22050,
    gain: 0.32,
    ref: 3.5,
    rolloff: 1.35,
    priority: 4,
    pitchVar: 0.03,
    wet: 0.35,
    maxVoices: 8,
    lazy: true,
    gen(d, sr, r, n) {
      nyNeonBuzz(d[0], sr, r, n, {
        strike: 0.28 + r() * 0.1,
        bp: 2200 + r() * 900,
      });
    },
  });
  // a tube that won't strike: stuttering buzz, arc ticks, ballast relay
  D("neon_sputter", {
    dur: 1.4,
    variants: 3,
    sr: 22050,
    gain: 0.5,
    ref: 5,
    rolloff: 1.2,
    priority: 5,
    dedupe: 0,
    wet: 0.5,
    lazy: true,
    gen(d, sr, r, n) {
      const a = d[0],
        tmp = new Float32Array(n);
      nyNeonBuzz(tmp, sr, r, n, { strike: 0.2, crackle: 0.002, bp: 3000 });
      let on = 1,
        next = 0;
      for (let i = 0; i < n; i++) {
        if (i >= next) {
          on = on ? 0 : 1;
          next =
            i + Math.floor(sr * (on ? 0.03 + r() * 0.16 : 0.02 + r() * 0.12));
          if (on) a[i] += (r() - 0.5) * 1.2;
        }
        a[i] += tmp[i] * on * (1.2 - (i / n) * 0.4);
      }
    },
  });
  // market register: keys, crank ratchet, drawer thump, bell
  D("cash_register", {
    dur: 1.6,
    variants: 3,
    sr: 22050,
    gain: 0.55,
    ref: 4,
    rolloff: 1.1,
    priority: 5,
    dedupe: 0,
    wet: 0.8,
    lazy: true,
    gen(d, sr, r, n) {
      const a = d[0],
        bp = biquad("bp", 1700, 3, sr);
      const click = (at, g, f) => {
        const b = biquad("bp", f, 4, sr);
        for (let k = 0; k < sr * 0.03 && at + k < n; k++)
          a[at + k] += b((r() * 2 - 1) * Math.exp(-k / (sr * 0.004))) * g;
      };
      let t = Math.floor(sr * 0.02);
      const keys = 2 + ((r() * 2) | 0);
      for (let k = 0; k < keys; k++) {
        click(t, 0.8, 1300 + r() * 600);
        t += Math.floor(sr * (0.1 + r() * 0.08));
      }
      for (let k = 0; k < 7; k++) {
        click(t, 0.35, 2600 + r() * 400);
        t += Math.floor(sr * 0.022);
      } // crank ratchet
      for (let k = 0; k < sr * 0.18 && t + k < n; k++) {
        const e = Math.exp(-k / (sr * 0.05));
        a[t + k] +=
          (Math.sin((2 * Math.PI * 110 * k) / sr) * 0.7 +
            bp(r() * 2 - 1) * 0.4) *
          e;
      }
      const bf = 2050 + r() * 250,
        bt = t + Math.floor(sr * 0.01);
      for (let k = 0; bt + k < n; k++) {
        const s = k / sr;
        a[bt + k] +=
          (Math.sin(2 * Math.PI * bf * s) * Math.exp(-s * 2.2) +
            Math.sin(2 * Math.PI * bf * 2.76 * s) * 0.5 * Math.exp(-s * 4) +
            Math.sin(2 * Math.PI * bf * 5.4 * s) * 0.25 * Math.exp(-s * 7)) *
          0.45;
      }
    },
  });
  D("market_clatter", {
    dur: 1.2,
    variants: 4,
    sr: 22050,
    gain: 0.45,
    ref: 4,
    rolloff: 1.1,
    priority: 6,
    dedupe: 0,
    wet: 0.8,
    lazy: true,
    gen(d, sr, r, n) {
      nyClatter(d[0], sr, r, Math.floor(n * 0.6), 2.2, 0.8);
    },
  });
  D("crowd_laugh", {
    dur: 2.2,
    variants: 4,
    sr: 16000,
    gain: 0.55,
    ref: 4,
    rolloff: 1.1,
    priority: 5,
    dedupe: 0,
    wet: 0.8,
    lazy: true,
    gen(d, sr, r, n) {
      const a = d[0],
        ppl = 2 + ((r() * 3) | 0);
      for (let p = 0; p < ppl; p++) {
        const fem = r() < 0.45,
          sub = new Float32Array(n),
          off = Math.floor(r() * sr * 0.25);
        nyTalker(sub, sr, r, n, {
          f0: fem ? 200 + r() * 60 : 105 + r() * 45,
          fem,
          rasp: r() < 0.3,
          gain: 0.5 + r() * 0.5,
          lp: 4000,
          laugh: 1,
          talk: 0.9,
          now: true,
        });
        for (let i = 0; i + off < n; i++)
          a[i + off] += sub[i] * Math.min(1, (n - i - off) / (sr * 0.4));
      }
    },
  });
  // jukebox record change: motor whirr, carriage clunks, tone-arm drop, run-in crackle
  D("jukebox_mech", {
    dur: 3.6,
    sr: 22050,
    gain: 0.5,
    ref: 3,
    rolloff: 1.2,
    priority: 5,
    dedupe: 0.5,
    wet: 0.7,
    lazy: true,
    gen(d, sr, r, n) {
      const a = d[0],
        lp = biquad("lp", 600, 0.8, sr),
        bp = biquad("bp", 1500, 2, sr);
      let ph = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          run =
            t < 2.6 ? Math.min(1, t / 0.2) * Math.min(1, (2.6 - t) / 0.2) : 0;
        ph += (48 + 40 * Math.min(1, t / 1.2)) / sr;
        a[i] += lp((ph % 1) * 2 - 1 + (r() * 2 - 1) * 0.4) * run * 0.5;
        if (t > 2.75) {
          const k = t - 2.75;
          a[i] +=
            bp(r() * 2 - 1) * 0.12 * Math.min(1, k * 3) +
            (r() < 0.0015 ? (r() - 0.5) * 1.5 : 0);
        }
      }
      for (const ct of [0.25, 1.35, 2.2, 2.7]) {
        const at = Math.floor(ct * sr),
          f = ct === 2.7 ? 90 : 160 + r() * 80;
        for (let k = 0; k < sr * 0.12 && at + k < n; k++) {
          const s = k / sr;
          a[at + k] +=
            (Math.sin(2 * Math.PI * f * s) * 0.9 +
              (r() * 2 - 1) * 0.5 * Math.exp(-s * 80)) *
            Math.exp(-s * 30);
        }
      }
    },
  });

  // ------------------------------------------------------------------
  // The Neon: where, how busy
  // ------------------------------------------------------------------
  const N = (S.neon = {
    active: false,
    near: 0,
    busy: 1,
    chat: [],
    buzz: [],
    built: false,
    jb: null,
    barks: [],
    lastBarkT: 0,
    spotsT: 0,
    tickT: 0,
    glowT: 0,
  });
  const SITE = { x0: -95, x1: 15, z0: -312, z1: -212 };
  const JUKEBOX_FALLBACK = { x: -6.45, y: 1.0, z: -283.3 };
  function siteRect() {
    try {
      const s =
        G.LAYOUT &&
        G.LAYOUT.SITES &&
        G.LAYOUT.SITES.find &&
        G.LAYOUT.SITES.find((q) => q.id === "times_square");
      if (s) return s;
    } catch (e) {
      /* */
    }
    return SITE;
  }
  /** 0..1: 1 inside the Neon's rectangle, fading to 0 at 70 m outside it. */
  S.neonNear = function (x, z) {
    const s = siteRect(),
      dx = Math.max(s.x0 - x, 0, x - s.x1),
      dz = Math.max(s.z0 - z, 0, z - s.z1);
    return clamp(1 - Math.hypot(dx, dz) / 70, 0, 1);
  };
  /** Crowd level by the hour: market day, a lively evening, near-empty small hours. */
  S.neonBusy = function () {
    const h = G.time ? G.time.hour : 12;
    if (h >= 7 && h < 21) return 1;
    if (h >= 21 || h < 1) return 0.8;
    if (h >= 5) return 0.45 + (h - 5) * 0.27;
    return 0.3;
  };
  function isNight() {
    try {
      if (G.atmos && !G.isStub("atmos") && G.atmos.isNight)
        return !!G.atmos.isNight();
    } catch (e) {
      /* */
    }
    const h = G.time ? G.time.hour : 12;
    return h < 5.5 || h > 20.5;
  }
  function anchors() {
    try {
      const L = G.landmarks && G.landmarks.times_square;
      if (L && L.anchors) return L.anchors;
    } catch (e) {
      /* */
    }
    return null;
  }
  /** Conversation pocket spots: stall / plaza / customer anchors ≥ 13 m apart (at most 6), else a fixed spread. */
  function pocketSpots() {
    const out = [],
      A = anchors(),
      s = siteRect();
    const push = (x, z) => {
      for (const p of out) if (Math.hypot(p.x - x, p.z - z) < 13) return;
      out.push({ x, y: 1.6, z });
    };
    if (A) {
      const pref = [
        "plaza",
        "center",
        "noodles_customer",
        "butcher",
        "repairman",
        "stage",
      ];
      for (const k of pref) {
        const v = A[k];
        if (v && Math.abs(v.y || 0) < 2) push(v.x, v.z);
      }
      for (const k in A) {
        if (out.length >= 6) break;
        if (/stall|customer|settler|hawker|crowd|bench/.test(k)) {
          const v = A[k];
          if (v && Math.abs(v.y || 0) < 2 && v.x > s.x0 && v.x < s.x1)
            push(v.x, v.z);
        }
      }
    }
    if (out.length < 3)
      [
        [-56.5, -257.2],
        [-40, -262],
        [-30, -290],
        [-45, -230],
        [-70, -280],
      ].forEach((p) => push(p[0], p[1]));
    return out.slice(0, 6);
  }
  /** Sign glows of the square (the landmark's additive glow Points): clustered into ≤ 7 buzz emitters. */
  function buzzSpots() {
    const L = G.landmarks && G.landmarks.times_square,
      root = L && L.root;
    const cells = new Map(),
      s = siteRect();
    if (root && root.traverse) {
      root.traverse((o) => {
        if (
          !o.isPoints ||
          !/lma_glow_ts/.test((o.parent && o.parent.name) || o.name || "")
        )
          return;
        const pa =
          o.geometry && o.geometry.attributes && o.geometry.attributes.position;
        if (!pa) return;
        o.updateMatrixWorld(true);
        const e = o.matrixWorld.elements;
        for (let i = 0; i < pa.count; i += 1) {
          const x0 = pa.getX(i),
            y0 = pa.getY(i),
            z0 = pa.getZ(i);
          const x = e[0] * x0 + e[4] * y0 + e[8] * z0 + e[12],
            y = e[1] * x0 + e[5] * y0 + e[9] * z0 + e[13],
            z = e[2] * x0 + e[6] * y0 + e[10] * z0 + e[14];
          if (
            y < 2.5 ||
            y > 22 ||
            x < s.x0 - 5 ||
            x > s.x1 + 5 ||
            z < s.z0 - 5 ||
            z > s.z1 + 5
          )
            continue;
          const key = Math.floor(x / 16) + "," + Math.floor(z / 16);
          const c = cells.get(key) || { x: 0, y: 0, z: 0, n: 0 };
          c.x += x;
          c.y += y;
          c.z += z;
          c.n++;
          cells.set(key, c);
        }
      });
    }
    const list = Array.from(cells.values())
      .filter((c) => c.n >= 2)
      .sort((a, b) => b.n - a.n)
      .slice(0, 7)
      .map((c) => ({
        x: c.x / c.n,
        y: Math.min(c.y / c.n, 9),
        z: c.z / c.n,
        n: c.n,
      }));
    return list;
  }
  function startEmitters() {
    if (N.built) return;
    N.built = true;
    const pk = pocketSpots();
    N.chat = pk.map((p, i) => ({
      p,
      h: S.play("neon_chatter_" + "abcd"[i % 4], {
        pos: p,
        loop: true,
        volume: 0.0001,
        noOcclusion: false,
      }),
      lvl: 0,
    }));
    const bz = buzzSpots();
    N.buzz = bz.map((p) => ({
      p,
      h: S.play("neon_buzz", {
        pos: p,
        loop: true,
        volume: 0.0001,
        pitch: 0.97 + Math.random() * 0.06,
      }),
      lvl: 0,
      n: p.n,
    }));
    N.glowFound = bz.length;
  }
  function stopEmitters() {
    if (!N.built) return;
    N.built = false;
    for (const e of N.chat) if (e.h) e.h.stop(1.5);
    for (const e of N.buzz) if (e.h) e.h.stop(1.5);
    N.chat = [];
    N.buzz = [];
  }
  /** Living, non-hostile people near each pocket (G.actors, polled 1×/s). */
  function peopleNear(p) {
    let n = 0;
    try {
      const list =
        G.actors && !G.isStub("actors") && G.actors.list
          ? G.actors.list()
          : null;
      if (!list) return -1;
      for (const a of list) {
        if (!a || a.dead || !a.pos || a.isCreature || a.isRobot) continue;
        if (Math.abs(a.pos.x - p.x) > 9 || Math.abs(a.pos.z - p.z) > 9)
          continue;
        if (a.hostile || (a.isHostile && a.isHostile())) continue;
        n++;
      }
    } catch (e) {
      return -1;
    }
    return n;
  }
  function spot(name, p, vol) {
    if (p)
      S.play(name, {
        pos: { x: p.x + S.rand(-3, 3), y: p.y || 1.2, z: p.z + S.rand(-3, 3) },
        volume: vol || 1,
      });
  }

  // ------------------------------------------------------------------
  // The Rad Room jukebox
  // ------------------------------------------------------------------
  const JB = {
    on: false,
    cue: null,
    song: null,
    next: 0,
    occK: 1,
    occT: 0,
    recent: [],
  };
  function jukeboxPos() {
    try {
      const v =
        G.landmarks &&
        G.landmarks.getAnchor &&
        G.landmarks.getAnchor("times_square", "jukebox");
      if (v) return { x: v.x, y: (v.y || 0) + 1.0, z: v.z };
    } catch (e) {
      /* */
    }
    return JUKEBOX_FALLBACK;
  }
  function jbChain() {
    const ctx = S.ctx,
      p = jukeboxPos();
    const input = ctx.createGain();
    const shelf = ctx.createBiquadFilter();
    shelf.type = "lowshelf";
    shelf.frequency.value = 140;
    shelf.gain.value = 4; // big wooden cabinet
    const box = ctx.createBiquadFilter();
    box.type = "peaking";
    box.frequency.value = 900;
    box.Q.value = 1.2;
    box.gain.value = 2.5;
    const air = ctx.createBiquadFilter();
    air.type = "lowpass";
    air.frequency.value = 9000;
    air.Q.value = 0.5;
    const pan = ctx.createPanner();
    pan.panningModel = "equalpower";
    pan.distanceModel = "inverse";
    pan.refDistance = 2.5;
    pan.rolloffFactor = 1.1;
    pan.maxDistance = 10000;
    S.setPannerPos(pan, p);
    const out = ctx.createGain();
    out.gain.value = 1;
    const send = ctx.createGain();
    send.gain.value = 0.35;
    input.connect(shelf);
    shelf.connect(box);
    box.connect(air);
    air.connect(out);
    out.connect(pan);
    pan.connect(S.bus.world);
    pan.connect(send);
    send.connect(S.bus.revSend);
    return {
      input,
      air,
      out,
      pan,
      send,
      p,
      dispose() {
        [input, shelf, box, air, out, pan, send].forEach((n) => {
          try {
            n.disconnect();
          } catch (e) {
            /* */
          }
        });
      },
    };
  }
  function jbPickSong() {
    const T = S.radioText,
      list = (T && T.rfmSongs) || [];
    if (!list.length) return null;
    const pool = list.filter((s) => !JB.recent.includes(s.title));
    const s = S.pick(pool.length ? pool : list);
    JB.recent.push(s.title);
    if (JB.recent.length > 6) JB.recent.shift();
    return s;
  }
  function jbStartRecord(midway) {
    const ctx = S.ctx,
      song = jbPickSong();
    if (!song || !S.songs || !S.Cue) return false;
    if (!JB.chain) JB.chain = jbChain();
    const gen = new S.songs.PhonoWrap(S.songs.make(song), {
      crackle: 0.22,
      hiss: 0.006,
      lp: 6800,
      hp: 70,
      out: 0.9,
    });
    const cue = new S.Cue("jukebox:" + song.title, gen, {
      dest: JB.chain.input,
      reverb: 0,
    });
    cue.out.gain.value = S.songs.gainFor(song) * 1.25;
    const startBar = midway
      ? Math.floor(Math.random() * S.songs.lengthOf(gen.gen) * 0.5)
      : 0;
    cue.start(ctx.currentTime + 0.1, midway ? 1.5 : 0.25);
    if (startBar) cue.seek(startBar);
    JB.cue = cue;
    JB.song = song;
    return true;
  }
  function jbStop(fade) {
    if (JB.cue) {
      JB.cue.stop(fade || 1.5);
      JB.cue = null;
    }
    if (JB.chain) {
      const c = JB.chain;
      JB.chain = null;
      setTimeout(() => c.dispose(), ((fade || 1.5) + 7) * 1000);
    }
    JB.on = false;
    JB.song = null;
  }
  const _o = { x: 0, y: 0, z: 0 },
    _d = { x: 0, y: 0, z: 0 };
  function occluded(pos) {
    try {
      const L = S.listenerPos,
        dist = Math.hypot(pos.x - L.x, pos.y - L.y, pos.z - L.z);
      if (!G.world || !G.world.raycast || dist < 2.5) return false;
      _o.x = L.x;
      _o.y = L.y;
      _o.z = L.z;
      _d.x = (pos.x - L.x) / dist;
      _d.y = (pos.y - L.y) / dist;
      _d.z = (pos.z - L.z) / dist;
      const h = G.world.raycast(_o, _d, dist - 0.8, {
        ignoreTags: ["actor", "interactable_self", "prop_small"],
      });
      return !!(h && h.collider && h.dist < dist - 1.0);
    } catch (e) {
      return false;
    }
  }
  /** How loud the jukebox is at the listener (0..1): the score steps aside for it (30_music.js). */
  S.jukeboxPresence = function () {
    if (!JB.on || !JB.chain) return 0;
    const p = JB.chain.p,
      L = S.listenerPos,
      d = Math.hypot(p.x - L.x, p.y - L.y, p.z - L.z);
    return (2.5 / (2.5 + 1.1 * Math.max(0, d - 2.5))) * JB.occK;
  };
  function jbUpdate(realDt) {
    const ctx = S.ctx,
      now = ctx.currentTime,
      st = G.state;
    const inWorld =
      st === "play" ||
      st === "goggles" ||
      st === "dialogue" ||
      st === "paused" ||
      st === "barter" ||
      st === "container";
    const p = jukeboxPos(),
      L = S.listenerPos,
      d = Math.hypot(p.x - L.x, p.z - L.z);
    const want =
      inWorld &&
      d < 40 &&
      Math.abs(L.y - p.y) < 12 &&
      !(G.LAYOUT && G.LAYOUT.isInterior && G.LAYOUT.isInterior(L.x));
    if (!want) {
      if (JB.on && (d > 55 || !inWorld)) jbStop(2);
      return;
    }
    const needs = ["piano", "bass", "drums", "guitar", "vibes", "pizz"];
    if (!S.inst.allReady(needs)) {
      needs.forEach(S.inst.ensure);
      return;
    }
    if (!JB.on) {
      JB.on = true;
      JB.next = 0;
      if (jbStartRecord(true)) {
        /* joined mid-record */
      }
    }
    if (JB.cue) {
      JB.cue.tick(now, now + 1.2);
      if (JB.cue.done || JB.cue.stopped) {
        JB.cue = null;
        JB.next = G.time.real + 1.2;
        S.play("jukebox_mech", { pos: p, volume: 0.9 });
      }
    } else if (G.time.real > JB.next && JB.next > 0) {
      JB.next = 0;
      jbStartRecord(false);
    } else if (JB.next === 0 && !JB.cue) JB.next = G.time.real + 3.4;
    // occlusion (walls between you and the Rad Room): muffle + drop, glided
    JB.occT -= realDt;
    if (JB.occT <= 0 && JB.chain) {
      JB.occT = 0.6;
      const k = occluded(p) ? 0.35 : 1;
      if (k !== JB.occK) {
        JB.occK = k;
        JB.chain.out.gain.setTargetAtTime(k, now, 0.25);
        JB.chain.air.frequency.setTargetAtTime(k < 1 ? 650 : 9000, now, 0.25);
      }
    }
  }

  // ------------------------------------------------------------------
  // Voiced barks (VOX performs what the bark captions show)
  // ------------------------------------------------------------------
  const VP = S.vox && S.vox.PROFILES;
  if (VP) {
    const base = VP.announcer;
    const mk = (o) =>
      Object.assign({}, base, { ta: 0.0001, patter: 0, pe: 2.2 }, o);
    VP.human_m = mk({
      f0: 112,
      range: 0.3,
      rate: 1.04,
      fs: 1.0,
      breath: 0.06,
      accent: 1.05,
      pause: 0.9,
      vib: 0.006,
      warmth: 4,
      fry: 0.5,
      tilt: 0.3,
      oq: 0.55,
      jitter: 0.01,
      shimmer: 0.04,
    });
    VP.human_f = mk({
      f0: 196,
      range: 0.3,
      rate: 1.04,
      fs: 1.16,
      breath: 0.09,
      accent: 1.0,
      pause: 0.9,
      vib: 0.006,
      gain: 0.9,
      warmth: 2,
      fry: 0.3,
      tilt: 0.36,
      oq: 0.63,
      jitter: 0.008,
      shimmer: 0.035,
    });
    VP.old_m = mk({
      f0: 104,
      range: 0.24,
      rate: 0.9,
      fs: 1.0,
      breath: 0.12,
      accent: 0.9,
      pause: 1.15,
      vib: 0.02,
      warmth: 4,
      fry: 1.0,
      tilt: 0.5,
      oq: 0.64,
      jitter: 0.025,
      shimmer: 0.08,
    });
    VP.raider_f = mk({
      f0: 185,
      range: 0.4,
      rate: 1.15,
      fs: 1.13,
      breath: 0.1,
      accent: 1.35,
      pause: 0.75,
      vib: 0.004,
      gain: 0.95,
      warmth: 3,
      fry: 0.5,
      tilt: 0.25,
      oq: 0.55,
      jitter: 0.02,
      shimmer: 0.06,
    });
    VP.brute = mk({
      f0: 66,
      range: 0.26,
      rate: 0.86,
      fs: 0.8,
      breath: 0.08,
      accent: 1.3,
      pause: 1.1,
      vib: 0.004,
      gain: 1.05,
      warmth: 8,
      fry: 1.2,
      tilt: 0.3,
      oq: 0.5,
      jitter: 0.03,
      shimmer: 0.1,
    });
    VP.soldier = mk({
      f0: 104,
      range: 0.2,
      rate: 1.02,
      fs: 0.98,
      breath: 0.05,
      accent: 0.9,
      pause: 0.85,
      vib: 0.004,
      warmth: 5,
      fry: 0.6,
      tilt: 0.3,
      oq: 0.52,
      jitter: 0.008,
      shimmer: 0.03,
    });
    VP.bot = mk({
      f0: 118,
      range: 0.03,
      rate: 0.92,
      fs: 1.02,
      breath: 0.0,
      accent: 0.3,
      pause: 1.1,
      vib: 0,
      gain: 0.95,
      warmth: 1,
      fry: 0,
      tilt: 0.2,
      oq: 0.45,
      jitter: 0.0,
      shimmer: 0.0,
    });
    VP.bot_posh = mk({
      f0: 150,
      range: 0.34,
      rate: 1.08,
      fs: 1.05,
      breath: 0.0,
      accent: 1.2,
      pause: 0.9,
      vib: 0.002,
      gain: 0.9,
      warmth: 1,
      fry: 0,
      tilt: 0.25,
      oq: 0.5,
      jitter: 0.002,
      shimmer: 0.01,
      patter: 0.05,
    });
  }
  function actorGender(a) {
    const g =
      a.gender ||
      (a.def && a.def.gender) ||
      (a.char && (a.char.gender || (a.char.opts && a.char.opts.gender))) ||
      (a.opts && a.opts.gender);
    if (g) return String(g)[0].toLowerCase() === "f" ? "f" : "m";
    return /(^f_|_f$|female)/.test(String(a.voice || "")) ? "f" : "m";
  }
  S.barkProfile = function (a) {
    const v = String(a.voice || ""),
      ty = String(a.type || ""),
      both = v + " " + ty;
    const kind = S.kindOf(ty);
    if (
      a.isRobot ||
      /robot|patrolman|valet|striker|bulwark|thinker|turret/.test(both) ||
      kind === "skyeye"
    )
      return kind === "skyeye" || /turret/.test(both)
        ? null
        : /posh|valet/.test(both)
          ? "bot_posh"
          : "bot";
    if (kind === "brute") return "brute";
    if (
      a.isCreature ||
      kind === "ripjaw" ||
      kind === "shellback" ||
      kind === "maniac" ||
      /amb_none/.test(both)
    )
      return null;
    const f = actorGender(a) === "f";
    if (v === "raider" || ty === "raider") return f ? "raider_f" : "raider";
    if (
      !f &&
      /continuity|covenant|warden|lancer|soldier|officer|marshal|guard/.test(
        both,
      )
    )
      return "soldier";
    if (!f && /m_old|preacher/.test(v)) return "old_m";
    return f ? "human_f" : "human_m";
  };
  let npcVox = false; // no spoken NPC barks by default (user preference); captions unaffected
  npcVox = S.lsGet("npcvox2") === "1";
  S.setNpcVoices = function (on) {
    npcVox = !!on;
    S.lsSet("npcvox2", npcVox ? "1" : "0");
    if (!npcVox) N.barks.slice().forEach((b) => endBark(b, 0.1));
  };
  S.npcVoices = () => npcVox;
  const BARK_MAX = 3;
  function cleanBark(text) {
    let t = String(text || "")
      .replace(/\*[^*]*\*/g, " ")
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    if (!t || t.indexOf("♪") >= 0) return ""; // sung lines are not spoken
    if (!/[a-z]/i.test(t)) return ""; // "…", "?!"
    if (t.length > 170) {
      const cut = t.slice(0, 170);
      const e = Math.max(
        cut.lastIndexOf(". "),
        cut.lastIndexOf("! "),
        cut.lastIndexOf("? "),
      );
      t = e > 40 ? cut.slice(0, e + 1) : cut.replace(/\s+\S*$/, "…");
    }
    return t;
  }
  function endBark(b, fade) {
    if (b.done) return;
    b.done = true;
    try {
      if (b.ctl) b.ctl.stop(fade === undefined ? 0.12 : fade);
    } catch (e) {
      /* */
    }
    const nodes = b.nodes;
    setTimeout(
      () =>
        nodes.forEach((n) => {
          try {
            if (n.stop) n.stop();
          } catch (e) {
            /* */
          }
          try {
            n.disconnect();
          } catch (e) {
            /* */
          }
        }),
      900,
    );
    const i = N.barks.indexOf(b);
    if (i >= 0) N.barks.splice(i, 1);
  }
  function headPos(a, out) {
    out.x = a.pos.x;
    out.z = a.pos.z;
    out.y = a.pos.y + (a.height || (a.td && a.td.height) || 1.75) * 0.92;
    return out;
  }
  /** Perform one bark line from an actor's head. */
  S.voiceBark = function (a, text) {
    const ctx = S.ctx;
    if (
      !npcVox ||
      !ctx ||
      ctx.state !== "running" ||
      !S.bus ||
      !S.vox ||
      !S.vox.say ||
      G.SMOKE ||
      G.SHOT
    )
      return false;
    if (!a || !a.pos || a.dead || !isFinite(a.pos.x)) return false;
    if (G.state !== "play") return false;
    const prof = S.barkProfile(a);
    if (!prof) return false;
    const L = S.listenerPos,
      dist = Math.hypot(a.pos.x - L.x, a.pos.y + 1.5 - L.y, a.pos.z - L.z);
    if (!(dist < 26)) return false;
    const t = cleanBark(text);
    if (!t) return false;
    const nowR = performance.now();
    for (const b of N.barks.slice()) if (b.a === a) endBark(b, 0.08); // a new line replaces the actor's last one
    if (nowR - N.lastBarkT < 220) return false; // one VOX plan per ~frame burst (main-thread budget)
    if (N.barks.length >= BARK_MAX) {
      // steal the farthest if this one is nearer
      let far = null;
      for (const b of N.barks) if (!far || b.dist > far.dist) far = b;
      if (!far || far.dist < dist) return false;
      endBark(far, 0.15);
    }
    N.lastBarkT = nowR;
    const h = G.util.hashStr(String(a.id || a.name || "npc"));
    const pitch = 0.9 + (h % 23) / 100; // every NPC keeps their own voice
    const nodes = [];
    const g = ctx.createGain();
    g.gain.value = 1.35 * (prof === "brute" ? 1.15 : 1);
    nodes.push(g);
    let tail = g;
    if (prof === "bot" || prof === "bot_posh") {
      // robot speaker: tinny band, a short metallic comb, and part ring-modulated
      const bot = prof === "bot";
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = bot ? 380 : 260;
      const dl = ctx.createDelay(0.05);
      dl.delayTime.value = bot ? 0.0045 : 0.0031;
      const fb = ctx.createGain();
      fb.gain.value = 0.55;
      const mix = ctx.createGain();
      const rm = ctx.createGain();
      rm.gain.value = 0;
      const osc = ctx.createOscillator();
      osc.frequency.value = bot ? 55 : 92;
      const og = ctx.createGain();
      og.gain.value = bot ? 0.5 : 0.3;
      const dry = ctx.createGain();
      dry.gain.value = 0.6;
      const sum = ctx.createGain();
      nodes.push(hp, dl, fb, mix, rm, osc, og, dry, sum);
      g.connect(hp);
      hp.connect(mix);
      hp.connect(dl);
      dl.connect(fb);
      fb.connect(dl);
      dl.connect(mix);
      osc.connect(og);
      og.connect(rm.gain);
      mix.connect(rm);
      mix.connect(dry);
      rm.connect(sum);
      dry.connect(sum);
      try {
        osc.start();
      } catch (e) {
        /* */
      }
      tail = sum;
    }
    const air = ctx.createBiquadFilter();
    air.type = "lowpass";
    air.frequency.value = clamp(20000 * Math.exp(-dist / 150), 2500, 20000);
    const pan = ctx.createPanner();
    pan.panningModel = dist < 12 ? "HRTF" : "equalpower";
    pan.distanceModel = "inverse";
    pan.refDistance = 1.8;
    pan.rolloffFactor = 1.15;
    pan.maxDistance = 10000;
    const send = ctx.createGain();
    send.gain.value = S.env.wet * clamp(1 + dist / 25, 1, 2.2) * 0.8;
    nodes.push(air, pan, send);
    S.setPannerPos(pan, headPos(a, { x: 0, y: 0, z: 0 }));
    tail.connect(air);
    air.connect(pan);
    pan.connect(S.bus.world);
    pan.connect(send);
    send.connect(S.bus.revSend);
    let ctl = null;
    try {
      ctl = S.vox.say(ctx, g, t, prof, {
        start: ctx.currentTime + 0.12,
        head: 0.16,
        pitch,
      });
    } catch (e) {
      G.reportError("sound:bark", e);
    }
    if (!ctl) {
      nodes.forEach((n) => {
        try {
          n.disconnect();
        } catch (e) {
          /* */
        }
      });
      return false;
    }
    const b = {
      a,
      ctl,
      nodes,
      dist,
      done: false,
      pan,
      air,
      hp: { x: 0, y: 0, z: 0 },
      end: ctl.end + 0.4,
    };
    N.barks.push(b);
    return true;
  };
  function barksUpdate() {
    if (!N.barks.length) return;
    const ctx = S.ctx,
      now = ctx.currentTime,
      L = S.listenerPos;
    for (const b of N.barks.slice()) {
      const a = b.a;
      if (b.ctl.pump) {
        try {
          b.ctl.pump(now + 0.6);
        } catch (e) {
          /* */
        }
      }
      if (
        now > b.end ||
        b.ctl.stopped ||
        !a ||
        a.dead ||
        !a.pos ||
        !isFinite(a.pos.x) ||
        G.state === "title" ||
        G.state === "dead"
      ) {
        endBark(b, a && a.dead ? 0.05 : 0.2);
        continue;
      }
      headPos(a, b.hp);
      S.setPannerPos(b.pan, b.hp);
      const d = Math.hypot(b.hp.x - L.x, b.hp.y - L.y, b.hp.z - L.z);
      b.dist = d;
      if (d > 45) {
        endBark(b, 0.4);
        continue;
      }
    }
  }
  // TEMPORARY BRIDGE: combat's bark captions (C.showBark) have no event yet — wrap them at call time, once.
  function installBarkBridge() {
    const C = G.combat;
    if (
      !C ||
      G.isStub("combat") ||
      typeof C.showBark !== "function" ||
      C.showBark.__vox
    )
      return !!(C && C.showBark && C.showBark.__vox);
    if (S.barkEvent) return true; // combat emits actorBark itself (see NOTES): no wrapping needed
    const orig = C.showBark;
    const wrapped = function (actor, text, dur) {
      const r = orig.apply(this, arguments);
      try {
        if (!S.barkEvent) S.voiceBark(actor, text);
      } catch (e) {
        G.reportError("sound:barkBridge", e);
      }
      return r;
    };
    wrapped.__vox = true;
    wrapped.__orig = orig;
    C.showBark = wrapped;
    return true;
  }
  G.events.on("actorBark", (e) => {
    S.barkEvent = true;
    if (e && e.actor) S.voiceBark(e.actor, e.text);
  });
  G.events.on("dialogueStart", () =>
    N.barks.slice().forEach((b) => endBark(b, 0.15)),
  );
  G.events.on("reset", () => {
    N.barks.slice().forEach((b) => endBark(b, 0.05));
    stopEmitters();
    jbStop(0.2);
  });

  // ------------------------------------------------------------------
  // Update (called from 90_main)
  // ------------------------------------------------------------------
  let bridgeT = 0;
  N.update = function (dt, realDt) {
    const ctx = S.ctx;
    if (!ctx || !S.bus || ctx.state !== "running" || !G.LAYOUT) return;
    bridgeT -= realDt;
    if (bridgeT <= 0) {
      bridgeT = 2;
      try {
        installBarkBridge();
      } catch (e) {
        /* */
      }
    }
    barksUpdate();
    const st = G.state;
    if (st === "title" || st === "chargen" || st === "loading" || !G.player) {
      stopEmitters();
      if (JB.on) jbStop(1);
      return;
    }
    try {
      jbUpdate(realDt);
    } catch (e) {
      G.reportError("sound:jukebox", e);
      jbStop(0.5);
    }
    N.tickT -= realDt;
    if (N.tickT > 0) return;
    N.tickT = 1;
    const P = G.player.pos,
      inside = G.LAYOUT.isInterior && G.LAYOUT.isInterior(P.x);
    N.near = inside ? 0 : S.neonNear(P.x, P.z);
    N.busy = S.neonBusy();
    if (N.near <= 0) {
      stopEmitters();
      return;
    }
    startEmitters();
    // re-read the sign glows once the landmark has streamed in
    if (!N.glowFound && (N.glowT -= 1) <= 0) {
      N.glowT = 10;
      const bz = buzzSpots();
      if (bz.length) {
        N.buzz.forEach((e) => e.h && e.h.stop(0.5));
        N.buzz = bz.map((p) => ({
          p,
          h: S.play("neon_buzz", { pos: p, loop: true, volume: 0.0001 }),
          lvl: 0,
          n: p.n,
        }));
        N.glowFound = bz.length;
      }
    }
    const night = isNight();
    for (const e of N.chat) {
      const ppl = peopleNear(e.p);
      const lvl = (ppl < 0 ? 0.55 : clamp(0.18 + ppl * 0.2, 0.18, 1)) * N.busy;
      if (Math.abs(lvl - e.lvl) > 0.02 && e.h) {
        e.lvl = lvl;
        e.h.setVolume(Math.max(0.0001, lvl), 1.5);
      }
    }
    for (const e of N.buzz) {
      const lvl = (night ? 1 : 0.55) * clamp(0.5 + e.n / 30, 0.5, 1);
      if (Math.abs(lvl - e.lvl) > 0.02 && e.h) {
        e.lvl = lvl;
        e.h.setVolume(lvl, 2);
      }
    }
    // market life (per second chances)
    if (st === "play" || st === "goggles") {
      const k = N.near * N.busy,
        pk = N.chat.length ? S.pick(N.chat).p : null;
      if (Math.random() < 0.035 * k && pk) spot("crowd_laugh", pk, 0.8);
      if (Math.random() < 0.02 * k && pk) spot("cash_register", pk, 0.9);
      if (Math.random() < 0.045 * k && pk) spot("market_clatter", pk, 0.8);
      if (N.buzz.length && Math.random() < (night ? 0.03 : 0.012) * N.near) {
        const b = S.pick(N.buzz);
        S.play("neon_sputter", { pos: b.p, volume: 0.9 });
      }
    }
  };
  // bake the Neon's sounds ahead of arrival (they're lazy)
  let hinted = false;
  N.hint = function (near) {
    if (hinted || near <= 0) return;
    hinted = true;
    [
      "amb_neon",
      "neon_chatter_a",
      "neon_chatter_b",
      "neon_chatter_c",
      "neon_chatter_d",
      "neon_buzz",
      "crowd_laugh",
      "cash_register",
      "market_clatter",
      "neon_sputter",
      "jukebox_mech",
    ].forEach((nm, i) => S.hintBake(nm, 2 + i * 0.1));
  };
})();
