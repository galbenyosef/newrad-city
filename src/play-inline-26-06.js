// play-inline-26 06 — gain
// Lines 1633-1984 of readable/play-inline-26.pretty.js (statement-aligned).
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
