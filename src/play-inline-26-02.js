// play-inline-26 02 — dur
// Lines 350-666 of readable/play-inline-26.pretty.js (statement-aligned).
  D("maniac_roar", {
    dur: 1.8,
    variants: 3,
    gain: 0.85,
    ref: 11,
    maxVoices: 2,
    priority: 2,
    build(k) {
      // the bruiser: a big man bellowing until his voice breaks
      const f = k.rr(150, 185),
        d = k.rr(1.0, 1.35);
      k.voice({
        dur: d,
        f0: [
          [0, f * 0.8],
          [0.15, f * 1.25],
          [d * 0.7, f * 1.1],
          [d, f * 0.65],
        ],
        vowels: [
          [0, "uh"],
          [0.15, "a"],
          [d * 0.8, "aw"],
        ],
        shift: 0.9,
        breath: 0.55,
        rough: 0.7,
        growl: 26,
        growlDepth: 0.45,
        dist: 5,
        gain: 1,
        attack: 0.04,
        release: 0.35,
      });
      k.voice({
        start: d * 0.55,
        dur: d * 0.35,
        f0: [
          [0, f * 2.1],
          [d * 0.35, f * 1.6],
        ],
        vowels: [[0, "ae"]],
        shift: 0.95,
        breath: 0.8,
        rough: 0.9,
        growl: 40,
        dist: 5,
        gain: 0.35,
        attack: 0.02,
        release: 0.12,
      }); // the crack
    },
  });
  D("maniac_attack", {
    dur: 0.6,
    variants: 5,
    gain: 0.7,
    ref: 7,
    maxVoices: 3,
    priority: 2,
    build(k, v) {
      // a short barked shout as it swings
      const fem = v % 4 === 3,
        f = fem ? k.rr(330, 400) : k.rr(190, 240),
        d = k.rr(0.16, 0.26);
      k.voice({
        dur: d,
        f0: [
          [0, f * 0.9],
          [0.04, f * 1.2],
          [d, f * 0.8],
        ],
        vowels: [
          [0, VOW[v % 5]],
          [d, "uh"],
        ],
        shift: fem ? 1.17 : 1,
        breath: 0.5,
        rough: 0.6,
        growl: 20,
        dist: 4,
        gain: 1,
        attack: 0.006,
        release: 0.08,
      });
    },
  });
  D("maniac_idle", {
    dur: 1.8,
    variants: 6,
    gain: 0.55,
    ref: 5,
    maxVoices: 3,
    priority: 4,
    sr: 24000,
    build(k, v) {
      const fem = v % 3 === 1,
        base = fem ? k.rr(200, 250) : k.rr(115, 150);
      if (v % 2 === 0) {
        // gibbering: quick, pitch-jumping nonsense syllables that never become words
        const V = ["a", "i", "uh", "o", "ae", "er"];
        let t = 0;
        const n = 5 + ((k.r() * 5) | 0);
        for (let i = 0; i < n; i++) {
          const d = k.rr(0.05, 0.11),
            f = base * k.rr(0.85, 1.6);
          k.voice({
            start: t,
            dur: d,
            f0: [
              [0, f],
              [d, f * k.rr(0.8, 1.2)],
            ],
            vowels: [
              [0, V[(k.r() * 6) | 0]],
              [d, V[(k.r() * 6) | 0]],
            ],
            shift: fem ? 1.17 : 1,
            breath: 0.45,
            rough: 0.35,
            gain: 0.85,
            attack: 0.008,
            release: 0.03,
          });
          t += d + k.rr(0.02, 0.09);
        }
        k.voice({
          start: t + 0.05,
          dur: 0.3,
          f0: [
            [0, base * 1.5],
            [0.3, base * 1.1],
          ],
          vowels: [
            [0, "i"],
            [0.3, "ae"],
          ],
          shift: fem ? 1.17 : 1,
          breath: 0.7,
          rough: 0.3,
          gain: 0.5,
          attack: 0.02,
          release: 0.12,
        }); // a giggle that trails off
      } else {
        // a low sob / moan with a hitching breath
        const d = k.rr(0.8, 1.2);
        k.voice({
          dur: d,
          f0: [
            [0, base],
            [d * 0.3, base * 1.15],
            [d * 0.6, base * 0.95],
            [d, base * 0.75],
          ],
          vowels: [
            [0, "o"],
            [d * 0.6, "uh"],
            [d, "er"],
          ],
          shift: fem ? 1.15 : 1,
          breath: 0.85,
          rough: 0.4,
          gain: 0.8,
          attack: 0.15,
          release: 0.3,
        });
        for (let i = 0; i < 2; i++)
          k.burst({
            kind: "pink",
            start: d + 0.05 + i * 0.13,
            a: 0.02,
            d: 0.08,
            peak: 0.3,
            type: "bandpass",
            f: 1500,
            q: 1.4,
          }); // hitching in-breath
      }
    },
  });
  S.aliasOf && S.aliasOf("maniac_growl", "maniac_idle");

  // ------------------------------------------------------------------
  // Brutes & colossus
  // ------------------------------------------------------------------
  D("brute_roar", {
    dur: 1.7,
    variants: 4,
    gain: 0.9,
    ref: 12,
    maxVoices: 3,
    priority: 2,
    build(k) {
      const f = k.rr(85, 105),
        d = k.rr(0.9, 1.3);
      k.voice({
        dur: d,
        f0: [
          [0, f * 0.9],
          [0.15, f * 1.15],
          [d, f * 0.75],
        ],
        vowels: [
          [0, "uh"],
          [0.15, "a"],
          [d * 0.8, "aw"],
        ],
        shift: 0.72,
        breath: 0.5,
        rough: 0.6,
        growl: k.rr(28, 36),
        growlDepth: 0.6,
        dist: 7,
        gain: 1,
        attack: 0.05,
        release: 0.3,
      });
      k.voice({
        dur: d,
        f0: [
          [0, f * 0.5],
          [d, f * 0.4],
        ],
        vowels: [[0, "aw"]],
        shift: 0.6,
        rough: 0.5,
        dist: 3,
        gain: 0.5,
        attack: 0.08,
        release: 0.3,
      });
    },
  });
  D("brute_hurt", {
    dur: 0.6,
    variants: 4,
    gain: 0.75,
    ref: 9,
    maxVoices: 3,
    priority: 2,
    build(k, v) {
      const f = k.rr(80, 100);
      k.voice({
        dur: k.rr(0.25, 0.4),
        f0: [
          [0, f * 1.3],
          [0.06, f],
          [0.35, f * 0.8],
        ],
        vowels: [
          [0, VOW[v % 5]],
          [0.3, "uh"],
        ],
        shift: 0.72,
        breath: 0.3,
        rough: 0.6,
        growl: 30,
        dist: 5,
        gain: 1,
        attack: 0.01,
        release: 0.12,
      });
    },
  });
  D("brute_death", {
    dur: 1.8,
    variants: 2,
    gain: 0.85,
    ref: 10,
    priority: 4,
    build(k) {
      k.voice({
        dur: 1.2,
        f0: [
          [0, 120],
          [0.2, 110],
          [1.2, 55],
        ],
        vowels: [
          [0, "a"],
          [0.6, "aw"],
          [1.2, "uh"],
        ],
        shift: 0.72,
        breath: 0.5,
        rough: 0.7,
        growl: 26,
        dist: 6,
        gain: 1,
        attack: 0.03,
        release: 0.5,
      });
      k.burst({
        start: 1.25,
        a: 0.004,
        d: 0.25,
        peak: 0.6,
        type: "lowpass",
        f: 250,
      }); // heavy body fall
      k.tone({
        type: "sine",
        start: 1.25,
        f: 80,
        f2: 40,
        glide: 0.2,
        a: 0.002,
        d: 0.25,
        peak: 0.6,
      });
    },
  });

  // ------------------------------------------------------------------
  // Ripjaw
  // ------------------------------------------------------------------
