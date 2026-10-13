/* src/sound/10_recipes_weapons.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 10_recipes_weapons.js
 * Gun reports, gyrojets, robot ray emitters, explosives, reloads, melee, impacts.
 *
 * Every gunshot is layered like a film/game gun: supersonic CRACK
 * (bright transient) + BODY (distorted low-passed noise burst) + THUMP
 * (sub sine drop) + MECHANICAL action + TAIL (long low rumble with
 * discrete "slap-back" echoes off the canyon of ruined buildings).
 * Per-weapon parameters make each class distinct.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = G._snd;
  const D = S.define;

  /**
   * Generic layered gunshot.
   * p: {crackF, crackD, crackPeak, bodyF, bodyF2, bodyD, bodyPeak, dist, thumpF0, thumpF1, thumpD, thumpPeak,
   *     ringF (array of barrel ring freqs), ringPeak, mechT, mechF, mechPeak, tailD, tailF, tailPeak, echoT, echoFb, echoWet, echo2T}
   */
  function gunshot(k, p) {
    const mix = k.gain(1);
    mix.connect(k.out);
    const j = (v, amt) => v * (1 + (k.r() - 0.5) * 2 * (amt || 0.08)); // per-variant jitter
    // The environment (street-canyon slap-backs outdoors, a hard room slap indoors, the far-off rolling boom) is
    // NOT baked into the report any more: it is a separate runtime layer (gtail_* below) chosen per shot from the
    // listener's environment and the distance. p.envTail === false bakes the old outdoor echoes in.
    const envT = p.envTail !== false;
    const echo = envT
      ? null
      : k.echo(
          j(p.echoT || 0.13),
          p.echoFb || 0.28,
          p.echoLp || 1400,
          p.echoWet || 0.35,
        );
    if (echo) echo.output.connect(mix);
    let echo2 = null;
    if (!envT && p.echo2T) {
      echo2 = k.echo(j(p.echo2T), 0.2, 900, 0.25);
      echo2.output.connect(mix);
    }
    // 1. crack — bright short transient (supersonic snap)
    k.burst({
      kind: "white",
      a: 0.0002,
      d: j(p.crackD || 0.01),
      peak: p.crackPeak || 1,
      type: "highpass",
      f: j(p.crackF || 2800),
      q: 0.8,
      dest: mix,
    });
    // an N-wave "pop": square single cycle
    k.tone({
      type: "square",
      f: j(p.popF || 1100),
      a: 0.0002,
      d: 0.006,
      peak: (p.crackPeak || 1) * 0.5,
      dest: mix,
    });
    // 2. body — distorted, low-passed noise with closing filter
    const body = k.burst({
      kind: "white",
      a: 0.0006,
      d: j(p.bodyD),
      peak: p.bodyPeak || 1,
      type: "lowpass",
      q: 0.9,
      f: j(p.bodyF),
      f2: p.bodyF2 || p.bodyF * 0.35,
      fT: p.bodyD * 1.2,
      shaper: p.dist || 3,
      dest: mix,
    });
    if (echo) body.connect(echo.input);
    if (echo2) body.connect(echo2.input);
    // 3. thump — sub sine drop
    const th = k.tone({
      type: "sine",
      f: j(p.thumpF0),
      f2: p.thumpF1,
      glide: p.thumpD * 0.7,
      a: 0.0015,
      d: j(p.thumpD),
      peak: p.thumpPeak || 1,
    });
    k.chain(th.g, k.shaper(1.5), mix);
    // 4. barrel / receiver ring (metallic resonance) — gives each gun a character
    if (p.ringF) {
      const m = k.metal(
        1,
        p.ringF.map((f) => j(f, 0.04)),
        30,
      );
      const exc = k.burst({
        kind: "white",
        a: 0.0003,
        d: 0.012,
        peak: p.ringPeak || 0.5,
        type: "highpass",
        f: 800,
        dest: m.input,
      });
      void exc;
      const rg = k.gain(1);
      k.chain(m.output, rg, mix);
      k.env(rg.gain, [
        [0, 1],
        [p.ringD || 0.25, 0.001],
      ]);
    }
    // 5. mechanical action (slide / bolt / cylinder)
    if (p.mechT) {
      const mt = j(p.mechT, 0.1);
      k.burst({
        kind: "white",
        start: mt,
        a: 0.0005,
        d: 0.018,
        peak: p.mechPeak || 0.25,
        type: "bandpass",
        f: j(p.mechF || 3200),
        q: 3,
        dest: mix,
      });
      k.burst({
        kind: "white",
        start: mt + 0.012,
        a: 0.0005,
        d: 0.02,
        peak: (p.mechPeak || 0.25) * 0.7,
        type: "bandpass",
        f: j((p.mechF || 3200) * 0.7),
        q: 4,
        dest: mix,
      });
    }
    // 6. tail — rolling low rumble (outdoor decay), goes to the echo too
    const tail = k.burst({
      kind: "pink",
      start: 0.004,
      a: 0.012,
      d: j(p.tailD) * (envT ? 0.3 : 1),
      peak: (p.tailPeak || 0.3) * (envT ? 0.75 : 1),
      type: "lowpass",
      q: 0.6,
      f: j(p.tailF || 1200),
      f2: (p.tailF || 1200) * 0.3,
      fT: p.tailD * (envT ? 0.3 : 1),
      dest: mix,
    });
    if (echo) tail.connect(echo.input);
    return mix;
  }

  // ------------------------------------------------------------------
  // Ballistic guns
  // ------------------------------------------------------------------
  D("gun_pistol", {
    dur: 1.2,
    variants: 3,
    gain: 0.95,
    ref: 14,
    maxVoices: 5,
    priority: 1,
    pitchVar: 0.04,
    build(k) {
      gunshot(k, {
        crackF: 3000,
        crackD: 0.009,
        bodyF: 2600,
        bodyD: 0.07,
        dist: 4,
        thumpF0: 190,
        thumpF1: 60,
        thumpD: 0.08,
        thumpPeak: 0.8,
        ringF: [1850, 3100, 4700],
        ringPeak: 0.25,
        ringD: 0.12,
        mechT: 0.045,
        mechF: 3600,
        mechPeak: 0.28,
        tailD: 0.5,
        tailF: 1300,
        tailPeak: 0.26,
        echoT: 0.11,
      });
    },
  });
  D("gun_magnum", {
    dur: 1.6,
    variants: 3,
    gain: 1.0,
    ref: 18,
    maxVoices: 4,
    priority: 2,
    pitchVar: 0.04,
    build(k) {
      gunshot(k, {
        crackF: 2600,
        crackD: 0.012,
        crackPeak: 1.2,
        bodyF: 2000,
        bodyD: 0.12,
        dist: 6,
        thumpF0: 140,
        thumpF1: 42,
        thumpD: 0.15,
        thumpPeak: 1.25,
        ringF: [1320, 2450, 3900],
        ringPeak: 0.3,
        ringD: 0.18,
        mechT: 0.07,
        mechF: 2600,
        mechPeak: 0.18,
        tailD: 0.95,
        tailF: 1100,
        tailPeak: 0.38,
        echoT: 0.14,
        echo2T: 0.37,
      });
    },
  });
  D("gun_smg", {
    dur: 0.7,
    variants: 4,
    gain: 0.85,
    ref: 12,
    maxVoices: 6,
    priority: 1,
    pitchVar: 0.05,
    dedupe: 0,
    build(k) {
      gunshot(k, {
        crackF: 3300,
        crackD: 0.007,
        bodyF: 2300,
        bodyD: 0.05,
        dist: 5,
        thumpF0: 170,
        thumpF1: 70,
        thumpD: 0.05,
        thumpPeak: 0.7,
        ringF: [2100, 3500],
        ringPeak: 0.2,
        ringD: 0.08,
        mechT: 0.025,
        mechF: 4200,
        mechPeak: 0.18,
        tailD: 0.28,
        tailF: 1400,
        tailPeak: 0.16,
        echoT: 0.1,
        echoFb: 0.2,
      });
    },
  });
  D("gun_rifle", {
    dur: 1.6,
    variants: 4,
    gain: 1.0,
    ref: 18,
    maxVoices: 6,
    priority: 1,
    pitchVar: 0.04,
    dedupe: 0,
    build(k) {
      gunshot(k, {
        crackF: 3600,
        crackD: 0.008,
        crackPeak: 1.25,
        popF: 1500,
        bodyF: 3200,
        bodyD: 0.09,
        dist: 6,
        thumpF0: 150,
        thumpF1: 45,
        thumpD: 0.12,
        thumpPeak: 1.0,
        ringF: [1600, 2900, 4400],
        ringPeak: 0.22,
        ringD: 0.1,
        mechT: 0.035,
        mechF: 3900,
        mechPeak: 0.2,
        tailD: 0.9,
        tailF: 1500,
        tailPeak: 0.36,
        echoT: 0.14,
        echoFb: 0.33,
        echo2T: 0.31,
      });
    },
  });
  D("gun_hunting", {
    dur: 2.4,
    variants: 3,
    gain: 1.05,
    ref: 22,
    maxVoices: 4,
    priority: 2,
    pitchVar: 0.03,
    build(k) {
      gunshot(k, {
        crackF: 3200,
        crackD: 0.011,
        crackPeak: 1.35,
        popF: 1300,
        bodyF: 2300,
        bodyD: 0.15,
        dist: 7,
        thumpF0: 115,
        thumpF1: 36,
        thumpD: 0.22,
        thumpPeak: 1.35,
        ringF: [1200, 2250, 3500],
        ringPeak: 0.2,
        ringD: 0.2,
        tailD: 1.5,
        tailF: 1100,
        tailPeak: 0.48,
        echoT: 0.19,
        echoFb: 0.32,
        echo2T: 0.43,
      });
    },
  });
  D("gun_sniper", {
    dur: 2.8,
    variants: 2,
    gain: 1.1,
    ref: 26,
    maxVoices: 3,
    priority: 3,
    pitchVar: 0.03,
    build(k) {
      gunshot(k, {
        crackF: 4000,
        crackD: 0.013,
        crackPeak: 1.6,
        popF: 1700,
        bodyF: 2500,
        bodyD: 0.17,
        dist: 8,
        thumpF0: 105,
        thumpF1: 32,
        thumpD: 0.26,
        thumpPeak: 1.4,
        ringF: [1100, 2050, 3300],
        ringPeak: 0.2,
        ringD: 0.25,
        tailD: 1.9,
        tailF: 1000,
        tailPeak: 0.55,
        echoT: 0.22,
        echoFb: 0.35,
        echo2T: 0.55,
      });
    },
  });
  D("gun_shotgun", {
    dur: 2.0,
    variants: 3,
    gain: 1.1,
    ref: 18,
    maxVoices: 4,
    priority: 1,
    pitchVar: 0.04,
    build(k) {
      gunshot(k, {
        crackF: 2200,
        crackD: 0.014,
        crackPeak: 0.8,
        popF: 700,
        bodyF: 1700,
        bodyF2: 300,
        bodyD: 0.22,
        bodyPeak: 1.3,
        dist: 9,
        thumpF0: 95,
        thumpF1: 34,
        thumpD: 0.24,
        thumpPeak: 1.5,
        tailD: 1.2,
        tailF: 900,
        tailPeak: 0.5,
        echoT: 0.16,
        echoFb: 0.3,
        echo2T: 0.39,
      });
      // pellet spread: a smear of tiny crackles right after the blast
      k.grains({
        start: 0.002,
        span: 0.03,
        n: 10,
        f: 3500,
        q: 0.8,
        gain: 0.3,
        len: 0.004,
      });
    },
  });
  D("gun_minigun", {
    dur: 0.45,
    variants: 4,
    gain: 0.8,
    ref: 16,
    maxVoices: 8,
    priority: 2,
    pitchVar: 0.06,
    dedupe: 0,
    build(k) {
      gunshot(k, {
        crackF: 3400,
        crackD: 0.006,
        bodyF: 2600,
        bodyD: 0.035,
        dist: 6,
        thumpF0: 170,
        thumpF1: 85,
        thumpD: 0.04,
        thumpPeak: 0.8,
        tailD: 0.14,
        tailF: 1400,
        tailPeak: 0.12,
        echoT: 0.09,
        echoFb: 0.15,
        echoWet: 0.2,
      });
      // barrel-cluster rattle + motor whine
      k.grains({
        start: 0.008,
        span: 0.03,
        n: 3,
        f: 2600,
        q: 5,
        gain: 0.35,
        len: 0.006,
      });
      const w = k.osc("sawtooth", k.rr(400, 440), 0, 0.09);
      const wg = k.gain(0);
      k.perc(wg.gain, 0, 0.12, 0.004, 0.07);
      k.chain(w, k.filt("bandpass", 900, 3), wg, k.out);
    },
  });
  D("gun_pipe", {
    dur: 1.2,
    variants: 3,
    gain: 0.9,
    ref: 13,
    maxVoices: 5,
    priority: 3,
    build(k) {
      gunshot(k, {
        crackF: 2500,
        crackD: 0.01,
        bodyF: 2000,
        bodyD: 0.08,
        dist: 8,
        thumpF0: 170,
        thumpF1: 55,
        thumpD: 0.09,
        thumpPeak: 0.8,
        ringF: [690, 1650, 2870, 4100],
        ringPeak: 0.6,
        ringD: 0.35,
        mechT: 0.05,
        mechF: 2200,
        mechPeak: 0.3,
        tailD: 0.5,
        tailF: 1100,
        tailPeak: 0.25,
        echoT: 0.12,
      });
    },
  });
  D("gun_bb", {
    dur: 0.4,
    variants: 2,
    gain: 0.45,
    ref: 5,
    maxVoices: 3,
    priority: 6,
    build(k) {
      k.burst({
        a: 0.001,
        d: 0.05,
        peak: 0.8,
        type: "bandpass",
        f: 1400,
        q: 1.2,
      }); // air puff
      k.tone({
        type: "sine",
        f: 950,
        f2: 760,
        glide: 0.08,
        a: 0.001,
        d: 0.09,
        peak: 0.25,
      }); // spring
      k.burst({
        start: 0.005,
        a: 0.0003,
        d: 0.008,
        peak: 0.6,
        type: "highpass",
        f: 3000,
      }); // click
      k.burst({
        start: 0.14,
        a: 0.001,
        d: 0.03,
        peak: 0.25,
        type: "bandpass",
        f: 2600,
        q: 3,
      }); // cock lever
    },
  });

  // ------------------------------------------------------------------
  // Report tails — the environment layer of every gunshot (played by S.play next to the dry report):
  //   gtail_out_*  outdoors: a rolling rumble down the street canyon + discrete slap-backs off the facades,
  //                each later one darker and quieter (the city "crack-and-roll")
  //   gtail_in_*   indoors: dense bright early reflections, a boomy short room decay and a low room mode
  //   gtail_far_*  a shot > 110 m away outdoors: no crack left, just a dull low boom and a long roll
  // sizes: s (pistol/SMG/energy), m (rifle/magnum/shotgun), l (hunting/sniper)
  // ------------------------------------------------------------------
  const TSZ = {
    s: { d: 0.9, f: 1400, pk: 0.55, n: 3, room: 0.35, boom: 0.6 },
    m: { d: 1.5, f: 1150, pk: 0.65, n: 4, room: 0.5, boom: 0.85 },
    l: { d: 2.4, f: 950, pk: 0.75, n: 5, room: 0.65, boom: 1 },
  };
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
  D("siren_blast", {
    dur: 1.4,
    variants: 2,
    gain: 0.9,
    ref: 16,
    maxVoices: 2,
    priority: 3,
    build(k) {
      const o = k.osc("sawtooth", 260, 0, 1.3),
        o2 = k.osc("sawtooth", 390, 0, 1.3);
      k.env(o.frequency, [
        [0, 220],
        [0.35, 640],
        [0.9, 610, "l"],
        [1.3, 300],
      ]);
      k.env(o2.frequency, [
        [0, 330],
        [0.35, 960],
        [0.9, 915, "l"],
        [1.3, 450],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.08, 0.9],
        [0.9, 0.7, "l"],
        [1.3, 0.0001],
      ]);
      const lp = k.filt("lowpass", 2600, 0.8);
      k.chain(o, lp, g, k.out);
      o2.connect(lp);
      k.tone({
        type: "sine",
        f: 70,
        f2: 40,
        glide: 0.2,
        a: 0.004,
        d: 0.3,
        peak: 1.0,
      });
      k.burst({
        kind: "brown",
        a: 0.01,
        d: 0.25,
        peak: 0.5,
        type: "lowpass",
        f: 500,
      });
    },
  });
  D("explosion", {
    dur: 3.6,
    variants: 3,
    gain: 1.15,
    ref: 30,
    rolloff: 1,
    maxVoices: 4,
    priority: 1,
    pitchVar: 0.08,
    build(k) {
      explosion(k, 1);
    },
    onPlay(opts, dist) {
      if (dist < 40) {
        const amt = 1 - dist / 40;
        S.shellShock && S.shellShock(amt * 0.7, 1.2 + amt * 2);
        S.duck(S.bus.musicDuck.gain, 1 - amt * 0.6, 0.02, 0.3, 1.5);
      }
    },
  });
  D("explosion_nuke", {
    dur: 9,
    variants: 1,
    gain: 1.4,
    ref: 120,
    rolloff: 0.6,
    maxVoices: 2,
    priority: 3,
    sr: 24000,
    pitchVar: 0.02,
    wet: 0.6,
    build(k) {
      const mix = k.gain(1);
      mix.connect(k.out);
      k.burst({
        kind: "white",
        a: 0.0003,
        d: 0.05,
        peak: 1.6,
        type: "highpass",
        f: 1000,
        dest: mix,
      });
      // colossal sub swell
      const sub = k.osc("sine", 48, 0, 8);
      k.env(sub.frequency, [
        [0, 55],
        [5, 21],
      ]);
      const sg = k.gain(0);
      k.env(sg.gain, [
        [0, 0.0001],
        [0.25, 1.8],
        [2.5, 1.2],
        [8.5, 0.0001],
      ]);
      k.chain(sub, sg, k.shaper(4), mix);
      // main roar
      const roar = k.noise("brown", 0, 8.8);
      const rf = k.filt("lowpass", 300, 0.7);
      k.env(rf.frequency, [
        [0, 1200],
        [0.6, 700],
        [3, 380],
        [8, 120],
      ]);
      const rg = k.gain(0);
      k.env(rg.gain, [
        [0, 0.0001],
        [0.3, 2.0],
        [3, 1.4],
        [8.8, 0.0001],
      ]);
      k.chain(roar, rf, rg, k.shaper(6), mix);
      // fireball blast
      k.burst({
        kind: "white",
        a: 0.004,
        d: 2.2,
        peak: 1.4,
        type: "lowpass",
        f: 4500,
        f2: 200,
        fT: 2,
        shaper: 12,
        dest: mix,
      });
      // shockwave wind rush passing
      const wind = k.noise("pink", 1.2, 5);
      const wf = k.filt("bandpass", 400, 1.2);
      k.env(wf.frequency, [
        [1.2, 300],
        [2.8, 2200],
        [6, 500],
      ]);
      const wg = k.gain(0);
      k.env(wg.gain, [
        [1.2, 0.0001],
        [2.6, 0.9],
        [6.2, 0.0001],
      ]);
      k.chain(wind, wf, wg, mix);
      // rolling thunder
      for (let i = 0; i < 7; i++)
        k.burst({
          kind: "brown",
          start: k.rr(0.8, 5.5),
          a: 0.05,
          d: k.rr(0.6, 1.4),
          peak: k.rr(0.4, 0.9),
          type: "lowpass",
          f: k.rr(250, 500),
          dest: mix,
        });
      // debris rain
      k.grains({
        start: 2.0,
        span: 5.5,
        n: 70,
        f: 2200,
        q: 0.8,
        gain: 0.3,
        len: 0.012,
        skew: 1.3,
        dest: mix,
      });
    },
    onPlay(opts, dist) {
      const amt = S.clamp(1 - dist / 450, 0, 1);
      if (amt > 0) {
        S.shellShock && S.shellShock(0.5 + amt * 0.5, 3 + amt * 4);
        if (amt > 0.3) S.tinnitus && S.tinnitus(amt, 4 + amt * 3);
        S.duck(S.bus.musicDuck.gain, 0.15, 0.05, 3, 4);
        S.duck(S.bus.radioDuck.gain, 0.2, 0.05, 3, 4);
      }
    },
  });

  // ------------------------------------------------------------------
  // Reloading & handling
  // ------------------------------------------------------------------
  function clack(k, t, base, peak, dest) {
    const m = k.metal(1, [base, base * 2.13, base * 3.41], 18);
    k.chain(m.output, k.gain(0.8), dest || k.out);
    k.burst({
      start: t,
      a: 0.0004,
      d: 0.012,
      peak: peak,
      type: "highpass",
      f: 700,
      dest: m.input,
    });
    k.burst({
      start: t,
      a: 0.0004,
      d: 0.025,
      peak: peak * 0.7,
      type: "bandpass",
      f: base * 2.5,
      q: 1.2,
      dest: dest || k.out,
    });
    k.tone({
      type: "sine",
      start: t,
      f: 260,
      f2: 120,
      glide: 0.03,
      a: 0.001,
      d: 0.04,
      peak: peak * 0.4,
      dest: dest || k.out,
    });
  }
  function slide(k, t, d, f0, f1, peak) {
    k.burst({
      start: t,
      a: d * 0.3,
      d: d,
      peak: peak,
      type: "bandpass",
      f: f0,
      f2: f1,
      fT: d,
      q: 1.4,
    });
  }
  D("reload", {
    dur: 1.35,
    variants: 2,
    gain: 0.55,
    ref: 4,
    bus: "world",
    wet: 0.4,
    maxVoices: 2,
    priority: 2,
    build(k) {
      // mag release + slide out
      k.burst({
        start: 0.05,
        a: 0.0004,
        d: 0.012,
        peak: 0.6,
        type: "bandpass",
        f: 4200,
        q: 4,
      });
      slide(k, 0.08, 0.12, 1600, 2400, 0.35);
      // new mag slides in → seats with a clack
      slide(k, 0.42, 0.1, 1400, 2200, 0.35);
      clack(k, 0.55, 1150, 0.9);
      // charging handle pulled back & released
      slide(k, 0.84, 0.07, 3000, 1600, 0.4);
      clack(k, 0.97, 900, 1.0);
    },
  });
  D("reload_shotgun", {
    dur: 0.4,
    variants: 3,
    gain: 0.5,
    ref: 4,
    wet: 0.4,
    maxVoices: 3,
    priority: 2,
    dedupe: 0.05,
    build(k) {
      slide(k, 0.0, 0.04, 2600, 3400, 0.4); // shell pushed past the gate
      clack(k, 0.06, 1500, 0.6);
      k.tone({
        type: "sine",
        start: 0.06,
        f: 700,
        f2: 500,
        glide: 0.05,
        a: 0.001,
        d: 0.06,
        peak: 0.12,
      }); // brass tink
    },
  });
  D("shotgun_pump", {
    dur: 0.6,
    variants: 2,
    gain: 0.6,
    ref: 5,
    wet: 0.4,
    maxVoices: 2,
    priority: 3,
    build(k) {
      slide(k, 0.0, 0.08, 1300, 2600, 0.5);
      clack(k, 0.1, 800, 0.9);
      slide(k, 0.22, 0.07, 2600, 1300, 0.5);
      clack(k, 0.3, 950, 1.0);
    },
  });
  D("bolt_action", {
    dur: 0.9,
    variants: 2,
    gain: 0.55,
    ref: 5,
    wet: 0.4,
    maxVoices: 2,
    priority: 5,
    build(k) {
      clack(k, 0.02, 1400, 0.6);
      slide(k, 0.1, 0.12, 2000, 3200, 0.4);
      k.tone({
        type: "sine",
        start: 0.2,
        f: 900,
        f2: 700,
        glide: 0.1,
        a: 0.001,
        d: 0.15,
        peak: 0.12,
      });
      slide(k, 0.42, 0.1, 3200, 2000, 0.4);
      clack(k, 0.55, 1200, 0.9);
    },
  });
  D("reload_energy", {
    dur: 1.2,
    variants: 1,
    gain: 0.5,
    ref: 4,
    wet: 0.3,
    maxVoices: 2,
    priority: 4,
    build(k) {
      k.tone({
        type: "sine",
        start: 0.05,
        f: 900,
        f2: 300,
        glide: 0.25,
        a: 0.005,
        d: 0.25,
        peak: 0.25,
      }); // power down
      slide(k, 0.1, 0.1, 1800, 2600, 0.35);
      clack(k, 0.45, 1300, 0.7);
      k.tone({
        type: "sine",
        start: 0.6,
        f: 400,
        f2: 2200,
        glide: 0.35,
        a: 0.02,
        d: 0.35,
        peak: 0.25,
      }); // charge up whine
      k.tone({
        type: "square",
        start: 0.98,
        f: 1760,
        a: 0.002,
        d: 0.05,
        peak: 0.1,
        filter: ["lowpass", 3000],
      });
    },
  });
  D("empty_click", {
    dur: 0.18,
    variants: 2,
    gain: 0.45,
    ref: 3,
    wet: 0.2,
    maxVoices: 2,
    priority: 1,
    dedupe: 0.08,
    build(k) {
      const m = k.metal(1, [2800, 5100, 7300], 25);
      k.chain(m.output, k.gain(0.6), k.out);
      k.burst({
        a: 0.0002,
        d: 0.006,
        peak: 1,
        type: "highpass",
        f: 2500,
        dest: m.input,
      });
      k.burst({
        a: 0.0002,
        d: 0.008,
        peak: 0.7,
        type: "bandpass",
        f: 3500,
        q: 2,
      });
    },
  });
  D("weapon_draw", {
    dur: 0.55,
    variants: 2,
    gain: 0.4,
    ref: 3,
    wet: 0.2,
    maxVoices: 2,
    priority: 2,
    dedupe: 0.1,
    build(k) {
      k.burst({
        kind: "pink",
        a: 0.08,
        d: 0.2,
        peak: 0.5,
        type: "bandpass",
        f: 2200,
        q: 0.7,
      }); // cloth
      k.grains({
        start: 0.02,
        span: 0.2,
        n: 8,
        f: 3000,
        q: 0.8,
        gain: 0.25,
        len: 0.01,
      });
      slide(k, 0.22, 0.06, 2500, 3500, 0.35);
      clack(k, 0.3, 1600, 0.6);
    },
  });
  D("weapon_holster", {
    dur: 0.45,
    variants: 1,
    gain: 0.35,
    ref: 3,
    wet: 0.2,
    priority: 6,
    build(k) {
      clack(k, 0.02, 1400, 0.5);
      k.burst({
        kind: "pink",
        start: 0.05,
        a: 0.06,
        d: 0.2,
        peak: 0.45,
        type: "bandpass",
        f: 1900,
        q: 0.7,
      });
    },
  });
  D("melee_swing", {
    dur: 0.45,
    variants: 3,
    gain: 0.55,
    ref: 4,
    wet: 0.2,
    maxVoices: 3,
    priority: 2,
    dedupe: 0.05,
    build(k) {
      const n = k.noise("white", 0, 0.4);
      const f = k.filt("bandpass", 400, 2.2);
      k.env(f.frequency, [
        [0, 350],
        [0.13, k.rr(1400, 1900)],
        [0.3, 500],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.12, 0.9],
        [0.3, 0.0001],
      ]);
      k.chain(n, f, g, k.out);
      const w = k.osc("triangle", 180, 0, 0.35);
      k.env(w.frequency, [
        [0, 150],
        [0.13, 260],
        [0.3, 140],
      ]);
      const wg = k.gain(0);
      k.env(wg.gain, [
        [0, 0.0001],
        [0.12, 0.08],
        [0.3, 0.0001],
      ]);
      k.chain(w, wg, k.out);
    },
  });
  D("melee_hit", {
    dur: 0.6,
    variants: 3,
    gain: 0.8,
    ref: 6,
    wet: 0.5,
    maxVoices: 4,
    priority: 2,
    dedupe: 0.02,
    build(k) {
      k.tone({
        type: "sine",
        f: k.rr(100, 130),
        f2: 55,
        glide: 0.1,
        a: 0.001,
        d: 0.14,
        peak: 1.2,
      });
      k.burst({
        kind: "white",
        a: 0.0008,
        d: 0.09,
        peak: 1,
        type: "lowpass",
        f: 1100,
        shaper: 3,
      });
      k.grains({
        start: 0.003,
        span: 0.05,
        n: 6,
        f: 1600,
        q: 1.2,
        gain: 0.5,
        len: 0.008,
      }); // crunch
      k.burst({
        kind: "pink",
        start: 0.01,
        a: 0.005,
        d: 0.18,
        peak: 0.25,
        type: "bandpass",
        f: 500,
        q: 1,
      });
    },
  });
  D("punch", {
    dur: 0.4,
    variants: 3,
    gain: 0.7,
    ref: 5,
    wet: 0.4,
    maxVoices: 4,
    priority: 2,
    dedupe: 0.02,
    build(k) {
      k.tone({
        type: "sine",
        f: k.rr(140, 170),
        f2: 70,
        glide: 0.07,
        a: 0.001,
        d: 0.1,
        peak: 1,
      });
      k.burst({ a: 0.0005, d: 0.02, peak: 0.8, type: "highpass", f: 1500 }); // slap
      k.burst({
        a: 0.001,
        d: 0.07,
        peak: 0.7,
        type: "lowpass",
        f: 800,
        shaper: 2,
      });
    },
  });

  // ------------------------------------------------------------------
  // Impacts
  // ------------------------------------------------------------------
  D("bullet_impact", {
    dur: 0.45,
    variants: 4,
    gain: 0.55,
    ref: 4,
    maxVoices: 6,
    priority: 1,
    dedupe: 0,
    pitchVar: 0.12,
    build(k) {
      k.burst({ a: 0.0002, d: 0.008, peak: 1, type: "highpass", f: 2600 });
      k.burst({
        a: 0.0005,
        d: 0.035,
        peak: 0.7,
        type: "bandpass",
        f: k.rr(700, 1100),
        q: 1.5,
        shaper: 2,
      });
      k.grains({
        start: 0.01,
        span: 0.2,
        n: 7,
        f: k.rr(2500, 4000),
        q: 1,
        gain: 0.35,
        len: 0.006,
        skew: 1.6,
      }); // chips
    },
  });
  D("bullet_impact_metal", {
    dur: 0.6,
    variants: 3,
    gain: 0.55,
    ref: 5,
    maxVoices: 5,
    priority: 3,
    dedupe: 0,
    pitchVar: 0.12,
    build(k) {
      const m = k.metal(
        1,
        [k.rr(900, 1300), k.rr(2300, 2800), k.rr(3900, 4700), 6100],
        35,
      );
      k.chain(m.output, k.gain(0.7), k.out);
      k.burst({
        a: 0.0002,
        d: 0.01,
        peak: 1,
        type: "highpass",
        f: 1500,
        dest: m.input,
      });
      k.burst({ a: 0.0002, d: 0.01, peak: 0.8, type: "highpass", f: 3000 });
    },
  });
  D("bullet_flesh", {
    dur: 0.35,
    variants: 3,
    gain: 0.6,
    ref: 4,
    maxVoices: 5,
    priority: 1,
    dedupe: 0,
    build(k) {
      k.burst({
        a: 0.001,
        d: 0.06,
        peak: 1,
        type: "lowpass",
        f: 600,
        shaper: 2,
      });
      k.burst({
        start: 0.005,
        a: 0.004,
        d: 0.09,
        peak: 0.6,
        type: "bandpass",
        f: 1000,
        f2: 380,
        fT: 0.09,
        q: 4,
      }); // squelch
      k.tone({
        type: "sine",
        f: 150,
        f2: 70,
        glide: 0.05,
        a: 0.001,
        d: 0.06,
        peak: 0.6,
      });
    },
  });
  D("ricochet", {
    dur: 0.8,
    variants: 4,
    gain: 0.45,
    ref: 6,
    maxVoices: 3,
    priority: 3,
    dedupe: 0.05,
    channels: 2,
    build(k) {
      const f0 = k.rr(2600, 4300),
        f1 = f0 * k.rr(0.45, 0.6);
      const o = k.osc("sine", f0, 0, 0.6);
      k.env(o.frequency, [
        [0, f0],
        [0.55, f1],
      ]);
      const v = k.osc("sine", k.rr(25, 40), 0, 0.6),
        vg = k.gain(f0 * 0.02);
      k.chain(v, vg, o.frequency);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.01, 0.6],
        [0.55, 0.0001],
      ]);
      const p = k.pan(0);
      k.env(p.pan, [
        [0, k.rr(-0.6, 0.6)],
        [0.5, k.rr(-1, 1), "l"],
      ]);
      k.chain(o, g, p, k.out);
      k.burst({ a: 0.0002, d: 0.01, peak: 0.9, type: "highpass", f: 3000 });
      k.burst({
        start: 0.005,
        a: 0.01,
        d: 0.3,
        peak: 0.25,
        type: "bandpass",
        f: 3000,
        f2: 1500,
        fT: 0.3,
        q: 3,
      });
    },
  });
  // Near-miss flyby: the supersonic "crack" (a sharp N-wave) + a Doppler "zzip" of turbulent air, panned across the head.
  // bullet_whiz_lr / _rl travel left→right / right→left (G.sfx.play picks one from the bullet's direction relative to
  // the listener — opts.dir, or the shot that was just fired); plain bullet_whiz picks a random side.
  const whiz = (fixed) => ({
    dur: 0.35,
    variants: fixed ? 3 : 4,
    gain: 0.5,
    ref: 3,
    maxVoices: 3,
    priority: 3,
    dedupe: 0.03,
    channels: 2,
    pitchVar: 0.08,
    build(k) {
      const side = fixed || (k.rr(0, 1) < 0.5 ? -1 : 1);
      const p = k.pan(0);
      k.env(p.pan, [
        [0, -0.7 * side],
        [0.09, 0.8 * side, "l"],
        [0.3, 0.9 * side, "l"],
      ]);
      const g = k.gain(1);
      k.chain(g, p, k.out);
      k.burst({
        a: 0.0001,
        d: 0.004,
        peak: 1,
        type: "highpass",
        f: 2200,
        dest: g,
      }); // crack
      k.burst({
        start: 0.001,
        a: 0.0001,
        d: 0.003,
        peak: 0.6,
        type: "bandpass",
        f: 1200,
        q: 0.8,
        dest: g,
      }); // N-wave tail
      const f0 = k.rr(3600, 4800);
      k.burst({
        start: 0.003,
        a: 0.018,
        d: 0.11,
        peak: 0.55,
        type: "bandpass",
        f: f0,
        f2: f0 * 0.45,
        fT: 0.12,
        q: 5,
        dest: g,
      }); // zzip (Doppler fall)
      k.burst({
        start: 0.01,
        a: 0.03,
        d: 0.18,
        peak: 0.12,
        type: "lowpass",
        f: 900,
        dest: g,
      }); // air wake
    },
  });
  D("bullet_whiz", whiz(0));
  D("bullet_whiz_lr", whiz(1));
  D("bullet_whiz_rl", whiz(-1));
  D("laser_impact", {
    dur: 0.45,
    variants: 2,
    gain: 0.5,
    ref: 4,
    maxVoices: 4,
    priority: 2,
    dedupe: 0,
    build(k) {
      k.grains({
        start: 0,
        span: 0.25,
        n: 26,
        f: 5000,
        q: 0.8,
        gain: 0.6,
        len: 0.003,
        skew: 1.5,
      });
      k.tone({
        type: "sine",
        f: 1800,
        f2: 300,
        glide: 0.1,
        a: 0.001,
        d: 0.1,
        peak: 0.5,
      });
      k.burst({ a: 0.005, d: 0.3, peak: 0.3, type: "highpass", f: 3500 });
    },
  });
  // ------------------------------------------------------------------
  // Grenades / mines / minigun extras
  // ------------------------------------------------------------------
  D("grenade_pin", {
    dur: 0.35,
    variants: 1,
    gain: 0.4,
    ref: 3,
    priority: 5,
    build(k) {
      clack(k, 0.0, 2200, 0.4);
      k.tone({
        type: "sine",
        start: 0.03,
        f: 3400,
        a: 0.001,
        d: 0.25,
        peak: 0.15,
      });
    },
  });
  D("grenade_throw", {
    dur: 0.45,
    variants: 2,
    gain: 0.45,
    ref: 3,
    priority: 5,
    dedupe: 0.1,
    build(k) {
      const n = k.noise("white", 0, 0.35),
        f = k.filt("bandpass", 600, 2);
      k.env(f.frequency, [
        [0, 500],
        [0.15, 1500],
        [0.32, 600],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.14, 0.7],
        [0.32, 0.0001],
      ]);
      k.chain(n, f, g, k.out);
      k.voice({
        start: 0.02,
        dur: 0.18,
        f0: [
          [0, 150],
          [0.18, 120],
        ],
        vowels: [[0, "uh"]],
        breath: 0.6,
        gain: 0.25,
      });
    },
  });
  D("grenade_bounce", {
    dur: 0.3,
    variants: 3,
    gain: 0.45,
    ref: 5,
    maxVoices: 4,
    priority: 4,
    dedupe: 0,
    pitchVar: 0.12,
    build(k) {
      clack(k, 0, k.rr(700, 1000), 0.6);
    },
  });
  D("mine_beep", {
    dur: 0.2,
    variants: 1,
    gain: 0.35,
    ref: 4,
    maxVoices: 4,
    priority: 5,
    dedupe: 0,
    pitchVar: 0,
    build(k) {
      k.tone({
        type: "square",
        f: 2350,
        a: 0.002,
        d: 0.08,
        peak: 0.5,
        filter: ["lowpass", 4000],
      });
    },
  });
  D("minigun_spinup", {
    dur: 0.9,
    variants: 1,
    gain: 0.55,
    ref: 10,
    priority: 4,
    build(k) {
      const o = k.osc("sawtooth", 60, 0, 0.9);
      k.env(o.frequency, [
        [0, 50],
        [0.8, 420],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.3, 0.4],
        [0.85, 0.5],
        [0.9, 0.0001],
      ]);
      k.chain(o, k.filt("bandpass", 900, 1.5), g, k.out);
      const r = k.noise("white", 0, 0.9),
        rf = k.filt("bandpass", 1600, 2),
        rg = k.gain(0);
      k.env(rg.gain, [
        [0, 0.0001],
        [0.8, 0.25],
        [0.9, 0.0001],
      ]);
      k.chain(r, rf, rg, k.out);
    },
  });
  D("minigun_spindown", {
    dur: 1.3,
    variants: 1,
    gain: 0.5,
    ref: 10,
    priority: 4,
    build(k) {
      const o = k.osc("sawtooth", 420, 0, 1.3);
      k.env(o.frequency, [
        [0, 420],
        [1.2, 40],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.5],
        [1.25, 0.0001],
      ]);
      k.chain(o, k.filt("bandpass", 800, 1.5), g, k.out);
      k.grains({
        start: 0.05,
        span: 1.0,
        n: 10,
        f: 2500,
        q: 3,
        gain: 0.25,
        len: 0.006,
        skew: 0.7,
      });
    },
  });
  D("minigun_spin", {
    dur: 2,
    loop: true,
    gain: 0.45,
    ref: 10,
    sr: 32000,
    priority: 5,
    gen(d, sr, r, n) {
      const a = d[0],
        f = 420;
      let ph = 0,
        lp = 0;
      for (let i = 0; i < n; i++) {
        ph += f / sr;
        if (ph > 1) ph -= 1;
        const saw = ph * 2 - 1,
          rot = 0.6 + 0.4 * Math.sin((2 * Math.PI * 42 * i) / sr);
        lp += (r() * 2 - 1 - lp) * 0.3;
        a[i] = (saw * 0.35 + lp * 0.25) * rot;
      }
    },
  });
  // aliases so weapon defs with slightly different naming still work
  [
    ["gun_10mm", "gun_pistol"],
    ["gun_32", "gun_pistol"],
    ["gun_44", "gun_magnum"],
    ["gun_revolver", "gun_magnum"],
    ["gun_assault", "gun_rifle"],
    ["gun_assault_rifle", "gun_rifle"],
    ["gun_combat_shotgun", "gun_shotgun"],
    ["gun_sawedoff", "gun_shotgun"],
    ["gun_launcher", "gun_missile"],
    ["gun_missile_launcher", "gun_missile"],
    ["gun_recoilless_rifle", "gun_recoilless"],
    ["gun_bbgun", "gun_bb"],
    ["gun_gyrojet_pistol", "gun_gyrojet"],
    ["gun_gyrojet_carbine", "gun_gyrojet"],
    ["gun_rivet_gun", "gun_rivet"],
    ["gun_sniper_rifle", "gun_sniper"],
    ["gun_hunting_rifle", "gun_hunting"],
    ["flamer", "gun_flamer"],
    ["impact", "bullet_impact"],
    ["impact_metal", "bullet_impact_metal"],
    ["swing", "melee_swing"],
    ["reload_pistol", "reload"],
    ["reload_rifle", "reload"],
    ["draw", "weapon_draw"],
    ["holster", "weapon_holster"],
    ["throw", "grenade_throw"],
  ].forEach((a) => S.aliasOf(a[0], a[1]));
  // report → environment tail class (S.play layers gtail_<env>_<class> under it); ray emitters / rockets get a lighter tail
  const TAIL_OF = {
    gun_pistol: "s",
    gun_smg: "s",
    gun_pipe: "s",
    gun_minigun: "s",
    gun_magnum: "m",
    gun_rifle: "m",
    gun_shotgun: "m",
    gun_hunting: "l",
    gun_sniper: "l",
    gun_recoilless: "l",
    gun_laser: "e",
    gun_gyrojet: "e",
    gun_rivet: "e",
  };
  Object.keys(TAIL_OF).forEach((n) => {
    const r = S.R[n];
    if (!r) return;
    const c = TAIL_OF[n];
    r.tail = c === "e" ? "s" : c;
    r.tailGain =
      c === "e" ? 0.45 : n === "gun_minigun" || n === "gun_smg" ? 0.7 : 1;
  });
})();
