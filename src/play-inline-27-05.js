// play-inline-27 05 — start
// Lines 1390-1693 of readable/play-inline-27.pretty.js (statement-aligned).
  D("code_logged", {
    dur: 0.6,
    variants: 1,
    gain: 0.32,
    bus: "ui",
    dedupe: 0.4,
    priority: 2,
    build(k) {
      relay(k, 0, 0.5);
      [1319, 1568, 2093].forEach((f, i) =>
        beep(k, 0.05 + i * 0.07, f, 0.05, 0.2, "sine"),
      );
      k.burst({
        start: 0.3,
        a: 0.01,
        d: 0.12,
        peak: 0.08,
        type: "bandpass",
        f: 4200,
        q: 2,
      }); // data chatter
    },
  });
  /** A key in a lock: pins scraping as it goes in, a turn, the latch clacking open. */
  D("key_turn", {
    dur: 0.7,
    variants: 3,
    gain: 0.4,
    bus: "ui",
    dedupe: 0.2,
    priority: 2,
    pitchVar: 0.06,
    build(k) {
      k.grains({
        start: 0,
        span: 0.16,
        n: 5,
        f: k.rr(3800, 5200),
        q: 6,
        gain: 0.6,
        len: 0.005,
      }); // pins
      k.burst({
        start: 0.2,
        a: 0.03,
        d: 0.1,
        peak: 0.25,
        type: "bandpass",
        f: 2200,
        q: 3,
      }); // turn
      const m = k.metal(1, [900, 2100, 3400], 16);
      k.chain(m.output, k.gain(0.6), k.out);
      k.burst({
        start: 0.34,
        a: 0.0003,
        d: 0.015,
        peak: 0.9,
        type: "highpass",
        f: 700,
        dest: m.input,
      }); // latch
      k.tone({
        type: "sine",
        start: 0.34,
        f: 180,
        f2: 90,
        glide: 0.06,
        a: 0.001,
        d: 0.1,
        peak: 0.5,
      });
    },
  });

  // ------------------------------------------------------------------
  // Consumables
  // ------------------------------------------------------------------
  /** Hypodermic injector (morphine syrette, rage inhaler, doctors' shots): safety cap, spring-loaded needle, pressurised hiss, a relieved breath. */
  D("inject", {
    dur: 0.9,
    variants: 1,
    gain: 0.45,
    bus: "ui",
    dedupe: 0.3,
    priority: 2,
    build(k) {
      click(k, 0, 2600, 0.7); // cap off
      k.burst({
        start: 0.1,
        a: 0.0003,
        d: 0.012,
        peak: 0.6,
        type: "bandpass",
        f: 1700,
        q: 2,
      }); // spring fires
      k.burst({
        start: 0.12,
        a: 0.005,
        d: 0.02,
        peak: 0.5,
        type: "bandpass",
        f: 4000,
        q: 3,
      }); // needle in
      k.burst({
        start: 0.16,
        a: 0.03,
        d: 0.35,
        peak: 0.45,
        type: "highpass",
        f: 3000,
        f2: 5000,
        fT: 0.3,
      }); // plunger hiss
      k.tone({
        type: "sine",
        start: 0.55,
        f: 3200,
        a: 0.001,
        d: 0.25,
        peak: 0.12,
      }); // glass tink
      k.voice({
        start: 0.2,
        dur: 0.35,
        f0: [
          [0, 130],
          [0.35, 110],
        ],
        vowels: [
          [0, "hh"],
          [0.35, "uh"],
        ],
        breath: 1,
        gain: 0.15,
        attack: 0.05,
        release: 0.2,
      });
    },
  });
  D("eat", {
    dur: 1.3,
    variants: 2,
    gain: 0.45,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    build(k) {
      for (let i = 0; i < 3; i++) {
        const st = i * k.rr(0.3, 0.38);
        k.grains({
          start: st,
          span: 0.08,
          n: 9,
          f: 1400,
          q: 0.8,
          gain: 0.8,
          len: 0.012,
        });
        k.burst({
          start: st + 0.02,
          a: 0.02,
          d: 0.12,
          peak: 0.25,
          type: "lowpass",
          f: 700,
        }); // wet chew
      }
    },
  });
  function gulp(k, st, peak) {
    k.voice({
      start: st,
      dur: 0.14,
      f0: [
        [0, 90],
        [0.14, 70],
      ],
      vowels: [
        [0, "o"],
        [0.14, "u"],
      ],
      shift: 0.8,
      gain: peak,
      attack: 0.02,
      release: 0.06,
    });
    k.tone({
      type: "sine",
      start: st + 0.02,
      f: 300,
      f2: 180,
      glide: 0.08,
      a: 0.005,
      d: 0.08,
      peak: peak * 0.4,
    });
  }
  D("drink", {
    dur: 1.5,
    variants: 2,
    gain: 0.45,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    build(k) {
      k.tone({ type: "sine", f: 2900, a: 0.001, d: 0.12, peak: 0.08 }); // bottle to lips
      gulp(k, 0.25, 0.9);
      gulp(k, 0.55, 0.9);
      gulp(k, 0.85, 0.8);
      k.voice({
        start: 1.05,
        dur: 0.35,
        f0: [
          [0, 140],
          [0.35, 115],
        ],
        vowels: [
          [0, "hh"],
          [0.35, "a"],
        ],
        breath: 0.9,
        gain: 0.2,
        attack: 0.03,
        release: 0.2,
      });
    },
  });
  /** A bottle of Fizzo: the crown cap pops, a long fizz, two gulps and a satisfied "ahh". */
  D("drink_fizzo", {
    dur: 2.1,
    variants: 1,
    gain: 0.5,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    build(k) {
      k.burst({
        a: 0.0005,
        d: 0.03,
        peak: 1,
        type: "bandpass",
        f: 1800,
        q: 1.5,
      });
      k.tone({
        type: "sine",
        f: 1100,
        f2: 700,
        glide: 0.05,
        a: 0.001,
        d: 0.06,
        peak: 0.3,
      });
      k.grains({
        start: 0.02,
        span: 0.9,
        n: 60,
        f: 6000,
        q: 0.8,
        gain: 0.25,
        len: 0.002,
        skew: 1.6,
      });
      k.burst({
        start: 0.02,
        a: 0.01,
        d: 0.6,
        peak: 0.25,
        type: "highpass",
        f: 4500,
      });
      gulp(k, 0.55, 0.9);
      gulp(k, 0.85, 0.9);
      k.voice({
        start: 1.2,
        dur: 0.6,
        f0: [
          [0, 150],
          [0.2, 160],
          [0.6, 120],
        ],
        vowels: [
          [0, "a"],
          [0.6, "uh"],
        ],
        breath: 0.6,
        gain: 0.45,
        attack: 0.04,
        release: 0.3,
      });
      k.tone({
        type: "sine",
        start: 1.25,
        f: 3136,
        a: 0.001,
        d: 0.25,
        peak: 0.06,
      });
    },
  });
  /** Rally Tonic: the cork comes out with a squeak, the syrup glugs from the bottle, a last drip off the lip. */
