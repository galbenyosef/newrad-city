/* src/sound/12_recipes_voices.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 12_recipes_voices.js
 * Human pain/death vocalisations, the city's bestiary and robots.
 * Built on Kit.voice(): glottal source → formant bank (vowels) with
 * jitter/growl amplitude modulation, breath noise and saturation.
 * Formant shift < 1 = bigger throat (brute, ripjaw).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = G._snd;
  const D = S.define;
  const VOW = ["a", "uh", "ae", "aw", "er"];

  // ------------------------------------------------------------------
  // Humans
  // ------------------------------------------------------------------
  D("hurt_player", {
    dur: 0.45,
    variants: 5,
    gain: 0.55,
    bus: "ui",
    dedupe: 0.12,
    maxVoices: 2,
    priority: 2,
    pitchVar: 0.03,
    build(k, v) {
      const f = k.rr(120, 150);
      k.voice({
        dur: k.rr(0.2, 0.3),
        f0: [
          [0, f * 1.15],
          [0.05, f],
          [0.28, f * 0.8],
        ],
        vowels: [
          [0, VOW[v % 5]],
          [0.25, "uh"],
        ],
        breath: 0.35,
        rough: 0.3,
        gain: 1,
        attack: 0.012,
        release: 0.1,
        dist: 1,
      });
      k.burst({ a: 0.002, d: 0.05, peak: 0.25, type: "lowpass", f: 400 }); // body impact
    },
  });
  D("death_player", {
    dur: 1.8,
    variants: 1,
    gain: 0.7,
    bus: "ui",
    priority: 4,
    build(k) {
      k.voice({
        dur: 1.0,
        f0: [
          [0, 170],
          [0.15, 150],
          [0.9, 85],
        ],
        vowels: [
          [0, "a"],
          [0.5, "aw"],
          [0.95, "uh"],
        ],
        breath: 0.4,
        rough: 0.5,
        gain: 1,
        attack: 0.02,
        release: 0.4,
        dist: 1.5,
      });
      k.voice({
        start: 1.05,
        dur: 0.6,
        f0: [
          [0, 95],
          [0.6, 70],
        ],
        vowels: [
          [0, "hh"],
          [0.6, "uh"],
        ],
        breath: 1,
        rough: 0.8,
        gain: 0.35,
        attack: 0.1,
        release: 0.4,
      }); // last exhale
    },
  });
  D("hurt_human", {
    dur: 0.5,
    variants: 6,
    gain: 0.6,
    ref: 6,
    maxVoices: 4,
    priority: 2,
    build(k, v) {
      const fem = v % 3 === 2;
      const f = fem ? k.rr(220, 260) : k.rr(105, 140);
      k.voice({
        dur: k.rr(0.18, 0.32),
        f0: [
          [0, f * 1.2],
          [0.05, f],
          [0.3, f * 0.8],
        ],
        vowels: [
          [0, VOW[v % 5]],
          [0.25, "uh"],
        ],
        shift: fem ? 1.17 : 1,
        breath: 0.3,
        rough: 0.35,
        gain: 1,
        attack: 0.01,
        release: 0.1,
        dist: 1.2,
      });
    },
  });
  D("death_human", {
    dur: 1.4,
    variants: 4,
    gain: 0.7,
    ref: 7,
    maxVoices: 3,
    priority: 2,
    build(k, v) {
      const fem = v === 3;
      const f = fem ? k.rr(250, 290) : k.rr(130, 170);
      k.voice({
        dur: k.rr(0.6, 0.9),
        f0: [
          [0, f * 1.25],
          [0.1, f * 1.1],
          [0.8, f * 0.6],
        ],
        vowels: [
          [0, "a"],
          [0.4, "aw"],
          [0.8, "uh"],
        ],
        shift: fem ? 1.17 : 1,
        breath: 0.4,
        rough: 0.55,
        gain: 1,
        attack: 0.015,
        release: 0.35,
        dist: 1.5,
      });
      // gurgle / collapse
      k.voice({
        start: 0.85,
        dur: 0.4,
        f0: [
          [0, 90],
          [0.4, 60],
        ],
        vowels: [[0, "uh"]],
        breath: 0.8,
        rough: 0.9,
        growl: 18,
        gain: 0.3,
        attack: 0.05,
        release: 0.2,
      });
      k.burst({
        start: k.rr(0.9, 1.1),
        a: 0.003,
        d: 0.12,
        peak: 0.35,
        type: "lowpass",
        f: 300,
      }); // body drop
    },
  });

  // ------------------------------------------------------------------
  // Beasts (lurcher, brute hounds): wet growl and a ragged screech
  // ------------------------------------------------------------------
  D("beast_growl", {
    dur: 1.3,
    variants: 4,
    gain: 0.7,
    ref: 6,
    maxVoices: 4,
    priority: 2,
    build(k) {
      const f = k.rr(70, 95),
        d = k.rr(0.7, 1.1);
      k.voice({
        dur: d,
        f0: [
          [0, f],
          [d * 0.4, f * 1.2],
          [d, f * 0.8],
        ],
        vowels: [
          [0, "uh"],
          [d * 0.5, "aw"],
          [d, "er"],
        ],
        shift: 0.95,
        breath: 0.7,
        rough: 0.9,
        growl: k.rr(18, 26),
        growlDepth: 0.9,
        dist: 4,
        gain: 1,
        attack: 0.08,
        release: 0.3,
      });
      // wet rasp
      k.burst({
        start: 0.05,
        a: 0.1,
        d: d * 0.8,
        peak: 0.25,
        type: "bandpass",
        f: 1400,
        q: 2,
      });
    },
  });
  D("beast_screech", {
    dur: 1.2,
    variants: 4,
    gain: 0.75,
    ref: 9,
    maxVoices: 3,
    priority: 2,
    build(k) {
      const f = k.rr(380, 480),
        d = k.rr(0.6, 0.9);
      const mk = (det, g) =>
        k.voice({
          dur: d,
          f0: [
            [0, f * det * 0.8],
            [0.12, f * det * 1.45],
            [d, f * det * 0.9],
          ],
          vowels: [
            [0, "a"],
            [0.2, "ae"],
            [d, "i"],
          ],
          shift: 1.05,
          breath: 0.8,
          rough: 0.8,
          growl: 45,
          growlDepth: 0.4,
          dist: 6,
          gain: g,
          attack: 0.03,
          release: 0.25,
        });
      mk(1, 1);
      mk(1.07, 0.5); // two ragged throats
      k.burst({ a: 0.05, d: d, peak: 0.25, type: "highpass", f: 2500 });
    },
  });

  // ------------------------------------------------------------------
  // Maniacs: human throats, no words. Shrieks and howls when they spot
  // you, gibbering and sobbing while they wander, raw yelps when hit.
  // ------------------------------------------------------------------
  D("maniac_scream", {
    dur: 1.6,
    variants: 6,
    gain: 0.75,
    ref: 9,
    maxVoices: 3,
    priority: 2,
    build(k, v) {
      const fem = v % 3 === 2;
      if (v % 2 === 0) {
        // a raw human shriek that cracks at the top
        const f = fem ? k.rr(420, 520) : k.rr(300, 380),
          d = k.rr(0.7, 1.05);
        k.voice({
          dur: d,
          f0: [
            [0, f * 0.75],
            [0.1, f * 1.3],
            [d * 0.6, f * 1.15],
            [d, f * 0.7],
          ],
          vowels: [
            [0, "a"],
            [0.15, "ae"],
            [d, "a"],
          ],
          shift: fem ? 1.17 : 1.02,
          breath: 0.6,
          rough: 0.55,
          growl: 22,
          growlDepth: 0.3,
          dist: 4,
          gain: 1,
          attack: 0.02,
          release: 0.3,
        });
        k.burst({
          start: 0.08,
          a: 0.05,
          d: d * 0.7,
          peak: 0.18,
          type: "highpass",
          f: 2600,
        }); // breath tearing the throat
      } else {
        // a long wavering howl, like a dog that learned it from a man
        const f = fem ? k.rr(330, 400) : k.rr(210, 270),
          d = k.rr(1.0, 1.4);
        k.voice({
          dur: d,
          f0: [
            [0, f * 0.8],
            [0.25, f * 1.2],
            [d * 0.55, f * 1.05],
            [d * 0.75, f * 1.2],
            [d, f * 0.6],
          ],
          vowels: [
            [0, "uh"],
            [0.2, "o"],
            [d * 0.7, "aw"],
            [d, "uh"],
          ],
          shift: fem ? 1.15 : 1,
          breath: 0.45,
          rough: 0.4,
          growl: 10,
          growlDepth: 0.2,
          dist: 3,
          gain: 1,
          attack: 0.08,
          release: 0.4,
        });
      }
    },
  });
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
  D("ripjaw_roar", {
    dur: 2.4,
    variants: 3,
    gain: 1.0,
    ref: 18,
    maxVoices: 2,
    priority: 2,
    build(k) {
      const d = k.rr(1.4, 1.8),
        f = k.rr(95, 115);
      // chest bellow
      k.voice({
        dur: d,
        f0: [
          [0, f * 0.8],
          [0.2, f * 1.2],
          [d, f * 0.6],
        ],
        vowels: [
          [0, "uh"],
          [0.2, "a"],
          [d * 0.7, "aw"],
          [d, "uh"],
        ],
        shift: 0.55,
        breath: 0.6,
        rough: 0.7,
        growl: k.rr(34, 42),
        growlDepth: 0.8,
        dist: 9,
        gain: 1,
        attack: 0.06,
        release: 0.45,
      });
      // reptilian screech layered on top
      k.voice({
        start: 0.08,
        dur: d * 0.8,
        f0: [
          [0, 520],
          [0.2, 760],
          [d * 0.8, 380],
        ],
        vowels: [
          [0, "ae"],
          [d * 0.8, "i"],
        ],
        shift: 1.1,
        breath: 0.9,
        rough: 1,
        growl: 60,
        growlDepth: 0.5,
        dist: 8,
        gain: 0.35,
        attack: 0.05,
        release: 0.3,
      });
      // air rush / sub
      k.burst({
        kind: "brown",
        a: 0.1,
        d: d,
        peak: 0.6,
        type: "lowpass",
        f: 300,
      });
      k.tone({
        type: "sine",
        f: 60,
        f2: 40,
        glide: d,
        a: 0.1,
        d: d,
        peak: 0.5,
      });
    },
  });
  D("ripjaw_attack", {
    dur: 0.8,
    variants: 3,
    gain: 0.85,
    ref: 12,
    maxVoices: 2,
    priority: 4,
    build(k) {
      k.voice({
        dur: 0.45,
        f0: [
          [0, 140],
          [0.1, 180],
          [0.45, 110],
        ],
        vowels: [
          [0, "a"],
          [0.45, "uh"],
        ],
        shift: 0.6,
        breath: 0.6,
        rough: 0.8,
        growl: 40,
        dist: 9,
        gain: 1,
        attack: 0.02,
        release: 0.15,
      });
      const n = k.noise("white", 0.1, 0.3),
        f = k.filt("bandpass", 800, 2);
      k.env(f.frequency, [
        [0.1, 600],
        [0.25, 2500],
        [0.4, 900],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0.1, 0.0001],
        [0.24, 0.6],
        [0.4, 0.0001],
      ]);
      k.chain(n, f, g, k.out); // claw swipe
    },
  });

  // ------------------------------------------------------------------
  // Critters
  // ------------------------------------------------------------------
  D("roach_hiss", {
    dur: 0.8,
    variants: 3,
    gain: 0.5,
    ref: 4,
    maxVoices: 4,
    priority: 2,
    build(k) {
      const d = k.rr(0.4, 0.6);
      k.burst({
        a: 0.05,
        d: d,
        peak: 0.6,
        type: "highpass",
        f: k.rr(3200, 4200),
        q: 1,
      });
      k.burst({
        a: 0.03,
        d: d * 0.8,
        peak: 0.35,
        type: "bandpass",
        f: 6500,
        q: 2,
      });
      k.grains({
        start: 0.02,
        span: d,
        n: 18,
        f: 3000,
        q: 4,
        gain: 0.5,
        len: 0.004,
      }); // chitter / mandibles
    },
  });
  D("roach_death", {
    dur: 0.5,
    variants: 2,
    gain: 0.45,
    ref: 4,
    priority: 5,
    build(k) {
      k.grains({
        start: 0,
        span: 0.08,
        n: 8,
        f: 1800,
        q: 1.5,
        gain: 0.8,
        len: 0.008,
      }); // crunch
      k.burst({
        start: 0.03,
        a: 0.02,
        d: 0.3,
        peak: 0.3,
        type: "highpass",
        f: 4000,
      });
    },
  });
  D("burrowrat_squeak", {
    dur: 0.6,
    variants: 4,
    gain: 0.45,
    ref: 5,
    maxVoices: 3,
    priority: 2,
    build(k) {
      const n = 1 + ((k.r() * 2) | 0);
      for (let i = 0; i < n; i++) {
        const st = i * k.rr(0.14, 0.2),
          f = k.rr(1600, 2300),
          d = k.rr(0.1, 0.18);
        const o = k.osc("triangle", f, st, d);
        k.env(o.frequency, [
          [st, f * 0.8],
          [st + d * 0.4, f * 1.25],
          [st + d, f * 0.85],
        ]);
        const vib = k.osc("sine", 38, st, d),
          vg = k.gain(f * 0.05);
        k.chain(vib, vg, o.frequency);
        const g = k.gain(0);
        k.env(g.gain, [
          [st, 0.0001],
          [st + 0.015, 0.7],
          [st + d, 0.0001],
        ]);
        k.chain(o, g, k.out);
      }
      k.burst({ a: 0.02, d: 0.15, peak: 0.2, type: "bandpass", f: 1200, q: 1 }); // snuffle
    },
  });
  D("dog_bark", {
    dur: 0.8,
    variants: 4,
    gain: 0.7,
    ref: 10,
    maxVoices: 3,
    priority: 2,
    build(k, v) {
      const n = v < 2 ? 1 : 2;
      for (let i = 0; i < n; i++) {
        const st = i * k.rr(0.22, 0.3),
          f = k.rr(420, 520);
        k.voice({
          start: st,
          dur: 0.16,
          f0: [
            [0, f],
            [0.04, f * 1.05],
            [0.16, f * 0.55],
          ],
          vowels: [
            [0, "a"],
            [0.16, "o"],
          ],
          shift: 1.25,
          breath: 0.5,
          rough: 0.4,
          dist: 3,
          gain: 1,
          attack: 0.006,
          release: 0.06,
        });
      }
    },
  });
  D("dog_growl", {
    dur: 1.4,
    variants: 2,
    gain: 0.55,
    ref: 6,
    priority: 4,
    build(k) {
      k.voice({
        dur: 1.2,
        f0: [
          [0, 110],
          [0.6, 125],
          [1.2, 105],
        ],
        vowels: [
          [0, "er"],
          [1.2, "uh"],
        ],
        shift: 1.2,
        breath: 0.4,
        rough: 0.6,
        growl: 24,
        growlDepth: 0.85,
        dist: 2,
        gain: 1,
        attack: 0.15,
        release: 0.3,
      });
    },
  });
  D("dog_whine", {
    dur: 1.0,
    variants: 2,
    gain: 0.45,
    ref: 5,
    priority: 5,
    build(k) {
      k.voice({
        dur: 0.8,
        f0: [
          [0, 700],
          [0.3, 950],
          [0.8, 650],
        ],
        vowels: [
          [0, "i"],
          [0.8, "u"],
        ],
        shift: 1.3,
        breath: 0.4,
        rough: 0.2,
        gain: 1,
        attack: 0.05,
        release: 0.25,
      });
    },
  });
  D("gasfly_buzz", {
    dur: 2,
    variants: 2,
    gain: 0.45,
    ref: 5,
    maxVoices: 3,
    priority: 3,
    seamless: true,
    sr: 32000,
    gen(d, sr, r, n, v) {
      const a = d[0],
        f = v ? 205 : 188;
      let ph = 0,
        ph2 = 0,
        lp = 0,
        bp1 = 0,
        bp2 = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sr;
        const wob =
          1 +
          0.04 * Math.sin(2 * Math.PI * 1.3 * t) +
          0.02 * Math.sin(2 * Math.PI * 3.7 * t);
        ph += (f * wob) / sr;
        ph2 += (f * 1.013 * wob) / sr;
        const s = ((ph % 1) * 2 - 1) * 0.6 + ((ph2 % 1) * 2 - 1) * 0.4;
        const flutter =
          0.55 + 0.45 * Math.sin(2 * Math.PI * 27 * t + Math.sin(t * 5));
        // crude 2-pole bandpass around 900 Hz
        bp1 += 0.18 * (s - bp1 - 0.3 * bp2);
        bp2 += 0.18 * bp1;
        lp += 0.25 * (s - lp);
        a[i] = (bp1 * 1.4 + lp * 0.3) * flutter;
      }
    },
  });
  D("shellback_click", {
    dur: 1.0,
    variants: 4,
    gain: 0.55,
    ref: 6,
    maxVoices: 3,
    priority: 2,
    build(k) {
      const n = 5 + ((k.r() * 8) | 0);
      let t = 0;
      for (let i = 0; i < n; i++) {
        t += k.rr(0.03, 0.08);
        k.burst({
          start: t,
          a: 0.0003,
          d: 0.01,
          peak: k.rr(0.5, 1),
          type: "bandpass",
          f: k.rr(1800, 3500),
          q: 7,
        });
      }
      // bubbling gurgle
      for (let i = 0; i < 7; i++) {
        const st = k.rr(0.05, 0.7),
          f = k.rr(250, 600);
        k.tone({
          type: "sine",
          start: st,
          f: f,
          f2: f * 1.8,
          glide: 0.04,
          a: 0.003,
          d: 0.05,
          peak: 0.25,
        });
      }
      k.voice({
        start: 0.1,
        dur: 0.6,
        f0: [
          [0, 70],
          [0.6, 60],
        ],
        vowels: [
          [0, "uh"],
          [0.6, "o"],
        ],
        shift: 0.8,
        breath: 0.6,
        rough: 0.9,
        growl: 15,
        gain: 0.35,
        attack: 0.1,
        release: 0.2,
      });
    },
  });
  D("crow", {
    dur: 1.2,
    variants: 3,
    gain: 0.4,
    ref: 20,
    maxVoices: 2,
    priority: 7,
    build(k) {
      const n = 1 + ((k.r() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const st = i * k.rr(0.28, 0.4),
          f = k.rr(560, 700);
        k.voice({
          start: st,
          dur: 0.22,
          f0: [
            [0, f],
            [0.08, f * 1.08],
            [0.22, f * 0.85],
          ],
          vowels: [
            [0, "a"],
            [0.22, "aw"],
          ],
          shift: 1.6,
          breath: 0.7,
          rough: 0.9,
          growl: 70,
          growlDepth: 0.5,
          dist: 3,
          gain: 1,
          attack: 0.01,
          release: 0.08,
        });
      }
    },
  });
  D("bird_chirp", {
    dur: 1.0,
    variants: 3,
    gain: 0.25,
    ref: 15,
    maxVoices: 2,
    priority: 8,
    build(k) {
      const n = 2 + ((k.r() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const st = i * k.rr(0.1, 0.18),
          f = k.rr(2800, 4200);
        k.tone({
          type: "sine",
          start: st,
          f: f,
          f2: f * k.rr(0.7, 1.4),
          glide: 0.06,
          a: 0.004,
          d: 0.07,
          peak: 0.6,
        });
      }
    },
  });
  D("gull", {
    dur: 1.2,
    variants: 2,
    gain: 0.35,
    ref: 25,
    priority: 8,
    build(k) {
      for (let i = 0; i < 3; i++) {
        const st = i * 0.3,
          f = k.rr(1100, 1300);
        k.voice({
          start: st,
          dur: 0.25,
          f0: [
            [0, f * 0.8],
            [0.1, f],
            [0.25, f * 0.7],
          ],
          vowels: [
            [0, "e"],
            [0.25, "a"],
          ],
          shift: 1.8,
          breath: 0.5,
          rough: 0.3,
          gain: 1,
          attack: 0.02,
          release: 0.1,
        });
      }
    },
  });

  // ------------------------------------------------------------------
  // Robots
  // ------------------------------------------------------------------
  D("robot_beep", {
    dur: 0.5,
    variants: 4,
    gain: 0.35,
    ref: 6,
    maxVoices: 3,
    priority: 2,
    build(k) {
      const n = 2 + ((k.r() * 3) | 0),
        notes = [880, 1175, 1320, 1760, 2093, 2640];
      let t = 0;
      for (let i = 0; i < n; i++) {
        const d = k.rr(0.04, 0.07);
        k.tone({
          type: "square",
          start: t,
          f: notes[(k.r() * notes.length) | 0],
          a: 0.002,
          d: d,
          peak: 0.5,
          filter: ["lowpass", 3500],
          curve: "lin",
        });
        t += d + k.rr(0.01, 0.04);
      }
    },
  });
  D("robot_voice", {
    dur: 1.6,
    variants: 4,
    gain: 0.55,
    ref: 7,
    maxVoices: 2,
    priority: 3,
    build(k) {
      // Monotone buzzy pseudo-speech: formant syllables on a fixed-pitch carrier, ring-modulated.
      const mix = k.gain(1);
      const rm = k.gain(0),
        car = k.osc("sine", 57, 0, 1.6);
      car.connect(rm.gain);
      const dry = k.gain(0.55);
      k.chain(mix, rm, k.out);
      k.chain(mix, dry, k.out);
      let t = 0.02;
      const syl = 5 + ((k.r() * 5) | 0),
        vows = ["a", "e", "i", "o", "u", "ae", "er"];
      const f0 = k.rr(95, 125);
      for (let i = 0; i < syl && t < 1.4; i++) {
        const d = k.rr(0.08, 0.16);
        if (k.r() < 0.6)
          k.burst({
            start: t,
            a: 0.002,
            d: 0.025,
            peak: 0.4,
            type: "highpass",
            f: k.rr(2500, 5000),
            dest: mix,
          }); // consonant
        const va = vows[(k.r() * vows.length) | 0],
          vb = vows[(k.r() * vows.length) | 0];
        k.voice({
          start: t + 0.02,
          dur: d,
          f0: [
            [0, f0],
            [d, f0 * (i === syl - 1 ? 0.85 : 1)],
          ],
          vowels: [
            [0, va],
            [d, vb],
          ],
          wave: "buzz",
          q: 2.2,
          gain: 1,
          attack: 0.008,
          release: 0.03,
          dist: 2,
          distKind: "hard",
          dest: mix,
        });
        t += d + k.rr(0.02, 0.07);
      }
    },
  });
  D("robot_death", {
    dur: 2.2,
    variants: 2,
    gain: 0.8,
    ref: 10,
    maxVoices: 2,
    priority: 3,
    build(k) {
      const o = k.osc("sawtooth", 700, 0, 1.4);
      k.env(o.frequency, [
        [0, 780],
        [1.3, 35],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.02, 0.6],
        [1.35, 0.0001],
      ]);
      k.chain(o, k.filt("bandpass", 900, 1.2), g, k.out);
      k.grains({
        start: 0,
        span: 1.0,
        n: 30,
        f: 5000,
        q: 0.7,
        gain: 0.45,
        len: 0.004,
        skew: 1.4,
      }); // sparks
      k.burst({
        a: 0.0005,
        d: 0.08,
        peak: 0.8,
        type: "lowpass",
        f: 2000,
        shaper: 4,
      }); // pop
      const m = k.metal(1, [320, 780, 1450, 2300], 20);
      k.chain(m.output, k.gain(0.8), k.out);
      k.burst({
        start: 1.45,
        a: 0.0005,
        d: 0.02,
        peak: 1,
        type: "highpass",
        f: 400,
        dest: m.input,
      }); // clatter to the ground
      k.burst({
        start: 1.45,
        a: 0.002,
        d: 0.2,
        peak: 0.6,
        type: "lowpass",
        f: 300,
      });
      k.burst({
        start: 1.62,
        a: 0.0005,
        d: 0.02,
        peak: 0.5,
        type: "highpass",
        f: 400,
        dest: m.input,
      });
    },
  });
  D("skyeye_chatter", {
    dur: 1.4,
    variants: 4,
    gain: 0.4,
    ref: 8,
    maxVoices: 2,
    priority: 3,
    build(k) {
      let t = 0;
      const n = 6 + ((k.r() * 7) | 0);
      for (let i = 0; i < n; i++) {
        const d = k.rr(0.03, 0.09),
          f = k.rr(700, 3000),
          f2 = f * k.rr(0.5, 2);
        if (k.r() < 0.75)
          k.tone({
            type: "sine",
            start: t,
            f: f,
            f2: f2,
            glide: d,
            a: 0.003,
            d: d,
            peak: 0.6,
            curve: "lin",
          });
        else
          k.tone({
            type: "square",
            start: t,
            f: f * 0.5,
            a: 0.002,
            d: d,
            peak: 0.3,
            filter: ["lowpass", 2500],
            curve: "lin",
          });
        t += d + k.rr(0.005, 0.05);
      }
      k.burst({
        start: t,
        a: 0.01,
        d: 0.12,
        peak: 0.25,
        type: "bandpass",
        f: 2200,
        q: 0.6,
      }); // radio static tail
    },
  });
  D("robot_jet", {
    dur: 2,
    loop: true,
    gain: 0.4,
    ref: 6,
    sr: 32000,
    priority: 7,
    gen(d, sr, r, n) {
      const a = d[0];
      let lp = 0,
        hp = 0;
      for (let i = 0; i < n; i++) {
        const x = r() * 2 - 1;
        lp += (x - lp) * 0.08;
        hp = x - lp;
        a[i] =
          lp * 1.4 +
          hp * 0.15 * (0.8 + 0.2 * Math.sin((i / sr) * 2 * Math.PI * 9));
      }
    },
  });
  [
    ["patrolman_voice", "robot_voice"],
    ["valet_voice", "robot_voice"],
    ["brute_attack", "brute_roar"],
    ["burrowrat_hurt", "burrowrat_squeak"],
    ["creature_hurt", "brute_hurt"],
    ["robot_hurt", "bullet_impact_metal"],
    ["skyeye_beep", "robot_beep"],
    ["shellback_hurt", "shellback_click"],
    ["dog_hurt", "dog_whine"],
    ["gasfly_hurt", "gasfly_buzz"],
    ["roach_hurt", "roach_hiss"],
  ].forEach((a) => S.aliasOf(a[0], a[1]));

  // ------------------------------------------------------------------
  // Creature vocal SETS (round 1, pass B): idle / alert / pain / death per species, so a ripjaw breathes and
  // grumbles while it prowls, bellows when it spots you, shrieks when hit and dies with a long falling moan.
  // Combat still plays one generic name per species; S.creatureVoice() below picks the state-specific
  // recipe from the actor at that position (dead → death, just damaged → pain, hunting → alert, else idle).
  // Other modules can ask directly: G.sfx.creature(kind, state, {pos}).
  // ------------------------------------------------------------------
  D("ripjaw_idle", {
    dur: 1.6,
    variants: 4,
    gain: 0.7,
    ref: 10,
    maxVoices: 2,
    priority: 3,
    sr: 24000,
    build(k, v) {
      // heavy nasal chuffs + a low throat grumble (the thing is breathing right behind the wall)
      const n = 2 + (v % 2);
      for (let i = 0; i < n; i++)
        k.burst({
          kind: "brown",
          start: i * k.rr(0.32, 0.45),
          a: 0.04,
          d: k.rr(0.18, 0.28),
          peak: 0.8,
          type: "bandpass",
          f: k.rr(320, 480),
          q: 1.4,
        });
      const d = k.rr(0.7, 1.0),
        f = k.rr(55, 70);
      k.voice({
        start: 0.15,
        dur: d,
        f0: [
          [0, f],
          [d * 0.5, f * 1.15],
          [d, f * 0.85],
        ],
        vowels: [
          [0, "uh"],
          [d, "aw"],
        ],
        shift: 0.5,
        breath: 0.8,
        rough: 0.9,
        growl: k.rr(16, 22),
        growlDepth: 0.9,
        dist: 5,
        gain: 0.7,
        attack: 0.15,
        release: 0.35,
      });
    },
  });
  D("ripjaw_pain", {
    dur: 0.9,
    variants: 4,
    gain: 0.95,
    ref: 14,
    maxVoices: 2,
    priority: 2,
    sr: 24000,
    build(k) {
      const d = k.rr(0.35, 0.55),
        f = k.rr(150, 190);
      k.voice({
        dur: d,
        f0: [
          [0, f * 1.3],
          [0.05, f * 1.6],
          [d, f * 0.8],
        ],
        vowels: [
          [0, "ae"],
          [d, "uh"],
        ],
        shift: 0.62,
        breath: 0.6,
        rough: 0.9,
        growl: 40,
        dist: 9,
        gain: 1,
        attack: 0.008,
        release: 0.15,
      });
      k.voice({
        start: 0.02,
        dur: d * 0.8,
        f0: [
          [0, 700],
          [0.08, 950],
          [d * 0.8, 520],
        ],
        vowels: [
          [0, "ae"],
          [d * 0.8, "i"],
        ],
        shift: 1.1,
        breath: 0.9,
        rough: 1,
        growl: 70,
        dist: 8,
        gain: 0.4,
        attack: 0.01,
        release: 0.12,
      });
    },
  });
  D("ripjaw_death", {
    dur: 3.0,
    variants: 2,
    gain: 1.0,
    ref: 16,
    maxVoices: 1,
    priority: 3,
    sr: 24000,
    lazy: true,
    build(k) {
      k.voice({
        dur: 1.7,
        f0: [
          [0, 170],
          [0.2, 190],
          [1.7, 55],
        ],
        vowels: [
          [0, "a"],
          [0.6, "aw"],
          [1.4, "o"],
          [1.7, "uh"],
        ],
        shift: 0.55,
        breath: 0.7,
        rough: 0.8,
        growl: 32,
        growlDepth: 0.9,
        dist: 8,
        gain: 1,
        attack: 0.03,
        release: 0.6,
      });
      k.voice({
        start: 1.75,
        dur: 0.6,
        f0: [
          [0, 70],
          [0.6, 45],
        ],
        vowels: [[0, "uh"]],
        shift: 0.5,
        breath: 1,
        rough: 1,
        growl: 14,
        gain: 0.45,
        attack: 0.08,
        release: 0.3,
      }); // death rattle
      k.burst({
        kind: "brown",
        start: 1.5,
        a: 0.004,
        d: 0.4,
        peak: 1,
        type: "lowpass",
        f: 220,
      }); // collapse
      k.tone({
        type: "sine",
        start: 1.5,
        f: 70,
        f2: 32,
        glide: 0.3,
        a: 0.003,
        d: 0.4,
        peak: 0.8,
      });
      k.burst({
        start: 1.62,
        a: 0.002,
        d: 0.12,
        peak: 0.35,
        type: "bandpass",
        f: 900,
        q: 1.5,
      }); // claws on concrete
    },
  });
  D("maniac_pain", {
    dur: 0.7,
    variants: 5,
    gain: 0.75,
    ref: 7,
    maxVoices: 3,
    priority: 2,
    sr: 24000,
    build(k, v) {
      // a raw human yelp, half a sob
      const fem = v % 3 === 2,
        f = fem ? k.rr(330, 400) : k.rr(200, 250),
        d = k.rr(0.18, 0.32);
      k.voice({
        dur: d,
        f0: [
          [0, f * 1.15],
          [0.04, f * 1.35],
          [d, f * 0.75],
        ],
        vowels: [
          [0, VOW[v % 5]],
          [d, "uh"],
        ],
        shift: fem ? 1.17 : 1,
        breath: 0.6,
        rough: 0.6,
        growl: 25,
        growlDepth: 0.3,
        dist: 3,
        gain: 1,
        attack: 0.006,
        release: 0.1,
      });
    },
  });
  D("maniac_death", {
    dur: 1.6,
    variants: 4,
    gain: 0.75,
    ref: 7,
    maxVoices: 2,
    priority: 3,
    sr: 24000,
    build(k, v) {
      const fem = v === 3,
        f = fem ? k.rr(300, 350) : k.rr(190, 230),
        d = k.rr(0.6, 0.9);
      k.voice({
        dur: d,
        f0: [
          [0, f * 1.1],
          [0.1, f * 1.25],
          [d, f * 0.5],
        ],
        vowels: [
          [0, "a"],
          [d * 0.5, "aw"],
          [d, "uh"],
        ],
        shift: fem ? 1.17 : 1,
        breath: 0.7,
        rough: 0.6,
        growl: 18,
        dist: 3,
        gain: 1,
        attack: 0.01,
        release: 0.3,
      });
      k.voice({
        start: d + 0.05,
        dur: 0.45,
        f0: [
          [0, 95],
          [0.45, 65],
        ],
        vowels: [[0, "uh"]],
        breath: 1,
        rough: 0.9,
        growl: 16,
        gain: 0.35,
        attack: 0.05,
        release: 0.25,
      }); // last breath
      k.burst({
        start: d + 0.2,
        a: 0.003,
        d: 0.14,
        peak: 0.45,
        type: "lowpass",
        f: 300,
      }); // body drop
    },
  });
  D("brute_idle", {
    dur: 1.8,
    variants: 5,
    gain: 0.6,
    ref: 8,
    maxVoices: 2,
    priority: 4,
    sr: 24000,
    build(k) {
      // a brute muttering to itself: word-like grunts with a falling contour
      const n = 2 + ((k.r() * 3) | 0),
        V = ["uh", "a", "aw", "o", "er"];
      let t = 0;
      for (let i = 0; i < n; i++) {
        const d = k.rr(0.14, 0.3),
          f = k.rr(78, 96) * (1 - i * 0.05);
        k.voice({
          start: t,
          dur: d,
          f0: [
            [0, f * 1.08],
            [d, f * 0.9],
          ],
          vowels: [
            [0, V[(k.r() * 5) | 0]],
            [d, V[(k.r() * 5) | 0]],
          ],
          shift: 0.72,
          breath: 0.4,
          rough: 0.55,
          growl: 24,
          growlDepth: 0.5,
          dist: 4,
          gain: 0.9,
          attack: 0.02,
          release: 0.07,
        });
        t += d + k.rr(0.05, 0.16);
      }
      k.burst({
        kind: "brown",
        start: t,
        a: 0.06,
        d: 0.25,
        peak: 0.4,
        type: "lowpass",
        f: 400,
      }); // snort
    },
  });
  D("shellback_idle", {
    dur: 1.4,
    variants: 4,
    gain: 0.4,
    ref: 5,
    maxVoices: 2,
    priority: 5,
    sr: 24000,
    build(k) {
      let t = 0;
      for (let i = 0; i < 4 + ((k.r() * 4) | 0); i++) {
        t += k.rr(0.06, 0.18);
        k.burst({
          start: t,
          a: 0.0003,
          d: 0.008,
          peak: k.rr(0.3, 0.7),
          type: "bandpass",
          f: k.rr(2200, 3600),
          q: 8,
        });
      }
      for (let i = 0; i < 6; i++) {
        const st = k.rr(0.1, 1.1),
          f = k.rr(200, 420);
        k.tone({
          type: "sine",
          start: st,
          f,
          f2: f * 1.9,
          glide: 0.05,
          a: 0.004,
          d: 0.06,
          peak: 0.3,
        });
      } // bubbles
    },
  });
  D("shellback_alert", {
    dur: 1.2,
    variants: 3,
    gain: 0.75,
    ref: 10,
    maxVoices: 2,
    priority: 2,
    sr: 24000,
    build(k) {
      // hissing shriek + rapid mandible clatter
      const d = k.rr(0.5, 0.7);
      k.burst({
        kind: "white",
        a: 0.02,
        d: d,
        peak: 0.8,
        type: "bandpass",
        f: 3200,
        f2: 2000,
        fT: d,
        q: 1.4,
      });
      k.voice({
        start: 0.03,
        dur: d * 0.9,
        f0: [
          [0, 420],
          [0.1, 560],
          [d * 0.9, 300],
        ],
        vowels: [
          [0, "i"],
          [d * 0.9, "ae"],
        ],
        shift: 1.2,
        breath: 0.95,
        rough: 1,
        growl: 80,
        growlDepth: 0.6,
        dist: 6,
        gain: 0.55,
        attack: 0.02,
        release: 0.2,
      });
      for (let i = 0; i < 12; i++)
        k.burst({
          start: 0.05 + i * k.rr(0.035, 0.05),
          a: 0.0002,
          d: 0.007,
          peak: k.rr(0.6, 1),
          type: "bandpass",
          f: k.rr(1800, 3000),
          q: 8,
        });
    },
  });
  D("shellback_pain", {
    dur: 0.6,
    variants: 3,
    gain: 0.7,
    ref: 8,
    maxVoices: 2,
    priority: 2,
    sr: 24000,
    build(k) {
      const d = k.rr(0.2, 0.3);
      k.voice({
        dur: d,
        f0: [
          [0, 600],
          [0.04, 820],
          [d, 420],
        ],
        vowels: [
          [0, "ae"],
          [d, "i"],
        ],
        shift: 1.25,
        breath: 0.9,
        rough: 1,
        growl: 90,
        dist: 6,
        gain: 1,
        attack: 0.004,
        release: 0.08,
      });
      k.burst({
        a: 0.002,
        d: 0.05,
        peak: 0.5,
        type: "bandpass",
        f: 1400,
        q: 3,
      }); // shell knock
    },
  });
  D("shellback_death", {
    dur: 1.6,
    variants: 2,
    gain: 0.7,
    ref: 8,
    maxVoices: 1,
    priority: 3,
    sr: 24000,
    build(k) {
      k.voice({
        dur: 0.7,
        f0: [
          [0, 380],
          [0.7, 120],
        ],
        vowels: [
          [0, "ae"],
          [0.7, "uh"],
        ],
        shift: 1.1,
        breath: 1,
        rough: 1,
        growl: 40,
        dist: 5,
        gain: 0.8,
        attack: 0.01,
        release: 0.3,
      });
      for (let i = 0; i < 9; i++) {
        const st = k.rr(0.3, 1.2),
          f = k.rr(150, 320);
        k.tone({
          type: "sine",
          start: st,
          f,
          f2: f * 1.6,
          glide: 0.06,
          a: 0.004,
          d: 0.07,
          peak: 0.35,
        });
      } // last bubbles
      k.burst({
        start: 0.65,
        a: 0.002,
        d: 0.2,
        peak: 0.7,
        type: "lowpass",
        f: 500,
      }); // shell hits the ground
      k.grains({
        start: 0.66,
        span: 0.15,
        n: 6,
        f: 2200,
        q: 4,
        gain: 0.35,
        len: 0.01,
      });
    },
  });

  const CREATURE_OF = {
    ripjaw_roar: "ripjaw",
    shellback_click: "shellback",
    maniac_scream: "maniac",
    maniac_roar: "maniac",
    brute_roar: "brute",
    brute_hurt: "brute",
  };
  const CREATURE_SETS = {
    ripjaw: {
      idle: "ripjaw_idle",
      alert: "ripjaw_roar",
      pain: "ripjaw_pain",
      death: "ripjaw_death",
    },
    shellback: {
      idle: "shellback_idle",
      alert: "shellback_alert",
      pain: "shellback_pain",
      death: "shellback_death",
    },
    maniac: {
      idle: "maniac_idle",
      alert: "maniac_scream",
      pain: "maniac_pain",
      death: "maniac_death",
    },
    brute: {
      idle: "brute_idle",
      alert: "brute_roar",
      pain: "brute_hurt",
      death: "brute_death",
    },
  };
  S.CREATURE_SETS = CREATURE_SETS;
  S.CREATURE_KIND_ALIAS = Object.assign(S.CREATURE_KIND_ALIAS || {}, {
    maniac_bruiser: "maniac",
    colossus: "brute",
    shellback_matriarch: "shellback",
    shellback_stalker: "shellback",
    shellback_spawn: "shellback",
  });
  const HUNT = { combat: 1, search: 1, flee: 1, attack: 1, chase: 1, alert: 1 };
  /**
   * Bridge for combat's one-name-per-species calls: generic creature name + position → the state-specific recipe of
   * the actor standing there (or the name unchanged when no actor is found). Cheap: the actor list is short and the
   * usual caller passes actor.pos itself (identity match).
   */
  S.creatureVoice = function (name, pos) {
    const kind = CREATURE_OF[name];
    if (!kind || !pos || !G.actors || G.isStub("actors") || !G.actors.list)
      return name;
    let a = null,
      best = 2.25;
    try {
      for (const x of G.actors.list()) {
        if (!x || !x.pos) continue;
        if (x.pos === pos) {
          a = x;
          break;
        }
        const dx = x.pos.x - pos.x,
          dz = x.pos.z - pos.z,
          d2 = dx * dx + dz * dz;
        if (d2 < best) {
          best = d2;
          a = x;
        }
      }
    } catch (e) {
      return name;
    }
    if (!a) return name;
    const now = G.time ? G.time.elapsed : 0,
      set = CREATURE_SETS[kind];
    if (a.dead || a.hp <= 0) return set.death;
    if (a.lastDamageT !== undefined && now - a.lastDamageT < 0.3)
      return set.pain;
    if (
      HUNT[a.state] ||
      (a.target && a.state !== "idle" && a.state !== "dormant")
    )
      return set.alert;
    return set.idle;
  };
})();
