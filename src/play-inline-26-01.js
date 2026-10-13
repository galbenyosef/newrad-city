// play-inline-26 01 — dur
// Lines 10-349 of readable/play-inline-26.pretty.js (statement-aligned).
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
