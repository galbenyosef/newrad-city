// play-inline-26 05 — dur
// Lines 1324-1632 of readable/play-inline-26.pretty.js (statement-aligned).
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
