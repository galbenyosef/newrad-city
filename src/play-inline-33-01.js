// play-inline-33 01 — accent
// Lines 50-381 of readable/play-inline-33.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;

  // ------------------------------------------------------------------
  // Voice profiles (f0 Hz, pitch range, speaking rate, formant scale,
  // breathiness, accent energy, pause scale)
  // ------------------------------------------------------------------
  const PROFILES = {
    // "Rocky" Delgado: quick, bright, grinning showman (an old ring announcer)
    dj: {
      f0: 116,
      range: 0.34,
      rate: 1.12,
      fs: 1.0,
      breath: 0.05,
      accent: 1.15,
      pause: 0.85,
      vib: 0.006,
      gain: 1.0,
      warmth: 5,
      fry: 0.5,
      tilt: 0.22,
      oq: 0.52,
      jitter: 0.009,
      shimmer: 0.035,
    },
    // Acting President Marsh of the Continuity: slow, low, grandfatherly and measured
    president: {
      f0: 94,
      range: 0.22,
      rate: 0.84,
      fs: 0.95,
      breath: 0.07,
      accent: 0.8,
      pause: 1.35,
      vib: 0.009,
      gain: 0.96,
      warmth: 6,
      fry: 1.0,
      tilt: 0.42,
      oq: 0.6,
      jitter: 0.012,
      shimmer: 0.05,
    },
    // Office of Civil Defense EBS: calm recorded female announcer, flat and even
    ebs: {
      f0: 198,
      range: 0.13,
      rate: 0.95,
      fs: 1.17,
      breath: 0.08,
      accent: 0.55,
      pause: 1.1,
      vib: 0.004,
      gain: 0.8,
      warmth: 2,
      fry: 0.15,
      tilt: 0.38,
      oq: 0.64,
      jitter: 0.007,
      shimmer: 0.03,
    },
    // Classical NYC host: soft-spoken, unhurried
    classical: {
      f0: 106,
      range: 0.2,
      rate: 0.9,
      fs: 0.98,
      breath: 0.08,
      accent: 0.75,
      pause: 1.2,
      vib: 0.005,
      gain: 1.02,
      warmth: 4,
      fry: 0.6,
      tilt: 0.45,
      oq: 0.62,
      jitter: 0.01,
      shimmer: 0.04,
    },
    // newsreel-style station announcer
    announcer: {
      f0: 110,
      range: 0.28,
      rate: 1.0,
      fs: 1.0,
      breath: 0.05,
      accent: 1.0,
      pause: 1.0,
      vib: 0.006,
      gain: 1.0,
      warmth: 4,
      fry: 0.4,
      tilt: 0.28,
      oq: 0.55,
      jitter: 0.009,
      shimmer: 0.035,
    },
    // Cryo Unit C-4's facility director (Josephine Brandt) on a looping distress tape: tired, breathy, halting, low for a woman
    director: {
      f0: 168,
      range: 0.18,
      rate: 0.9,
      fs: 1.12,
      breath: 0.14,
      accent: 0.7,
      pause: 1.3,
      vib: 0.012,
      gain: 0.9,
      warmth: 3,
      fry: 0.7,
      tilt: 0.5,
      oq: 0.68,
      jitter: 0.02,
      shimmer: 0.08,
    },
    // an exo-rig's automatic transponder: synthetic, monotone, evenly clipped
    transponder: {
      f0: 120,
      range: 0.02,
      rate: 0.86,
      fs: 1.0,
      breath: 0.0,
      accent: 0.15,
      pause: 1.4,
      vib: 0.0,
      gain: 0.85,
      warmth: 1,
      fry: 0,
      tilt: 0.3,
      oq: 0.5,
      jitter: 0.002,
      shimmer: 0.01,
    },
    // numbers station: a flat, clipped female reader with almost no intonation
    numbers: {
      f0: 192,
      range: 0.04,
      rate: 0.82,
      fs: 1.15,
      breath: 0.03,
      accent: 0.2,
      pause: 1.5,
      vib: 0.002,
      gain: 0.8,
      warmth: 1,
      fry: 0,
      tilt: 0.35,
      oq: 0.6,
      jitter: 0.005,
      shimmer: 0.02,
    },
    // raider on a stolen transmitter: fast, loud, sneering, lots of breath
    raider: {
      f0: 128,
      range: 0.42,
      rate: 1.18,
      fs: 0.97,
      breath: 0.1,
      accent: 1.4,
      pause: 0.75,
      vib: 0.004,
      gain: 1.05,
      warmth: 6,
      fry: 0.7,
      tilt: 0.18,
      oq: 0.5,
      jitter: 0.02,
      shimmer: 0.07,
    },
  };

  // VOX 2 extras: ta = glottal return-phase time constant (s), patter = fast-talk register (0..0.15),
  // tilt/pe/norm re-tuned for the softer glottal closure (same long-term spectrum and loudness as before).
  for (const id in PROFILES) {
    const P = PROFILES[id];
    P.ta = P.ta || 0.0001;
    P.patter = P.patter || 0;
    P.pe = 2.2;
  }
  PROFILES.dj.patter = 0.1;
  PROFILES.raider.patter = 0.12;
  PROFILES.announcer.patter = 0.04;
  PROFILES.president.ta = 0.00013;
  PROFILES.director.ta = 0.00014;

  // ------------------------------------------------------------------
  // Phone inventory. F = formant targets (Hz, adult male), v = voicing,
  // a = aspiration (noise through the vocal tract), fr = [centre Hz, Q, amp]
  // frication (noise straight to the lips), d = base duration (s).
  // Classes: V vowel, D diphthong, N nasal, L approximant, F fricative,
  //          P plosive, H aspirate.
  // ------------------------------------------------------------------
  const VF = {
    i: [290, 2250, 2950, 3600],
    ih: [400, 1920, 2560, 3400],
    e: [530, 1840, 2480, 3500],
    ae: [680, 1700, 2410, 3400],
    a: [730, 1090, 2440, 3400],
    aw: [620, 940, 2400, 3300],
    o: [560, 880, 2400, 3300],
    uh: [540, 1190, 2390, 3300],
    oo: [330, 870, 2240, 3200],
    uu: [440, 1020, 2240, 3200],
    er: [490, 1350, 1690, 3200],
    schwa: [500, 1400, 2450, 3350],
  };
  const PH = {
    // nasals
    M: { c: "N", F: [270, 950, 2200, 3100], v: 0.42, d: 0.065 },
    N: { c: "N", F: [270, 1650, 2600, 3300], v: 0.42, d: 0.06 },
    NG: { c: "N", F: [270, 2000, 2400, 3300], v: 0.38, d: 0.07 },
    // approximants
    L: { c: "L", F: [360, 1250, 2700, 3300], v: 0.7, d: 0.055 },
    R: { c: "L", F: [420, 1150, 1500, 3000], v: 0.72, d: 0.06 },
    W: { c: "L", F: [300, 650, 2200, 3100], v: 0.62, d: 0.05 },
    Y: { c: "L", F: [280, 2150, 2950, 3600], v: 0.62, d: 0.045 },
    // fricatives
    S: { c: "F", F2: 1700, v: 0, fr: [5400, 2.2, 0.36], d: 0.09 },
    Z: { c: "F", F2: 1700, v: 0.32, fr: [5000, 2.2, 0.22], d: 0.075 },
    SH: { c: "F", F2: 1900, v: 0, fr: [2700, 1.6, 0.44], d: 0.095 },
    ZH: { c: "F", F2: 1900, v: 0.32, fr: [2600, 1.6, 0.26], d: 0.07 },
    F: { c: "F", F2: 950, v: 0, fr: [6500, 0.7, 0.11], d: 0.085 },
    V: { c: "F", F2: 950, v: 0.38, fr: [6000, 0.7, 0.06], d: 0.06 },
    TH: { c: "F", F2: 1450, v: 0, fr: [6200, 0.7, 0.09], d: 0.08 },
    DH: { c: "F", F2: 1450, v: 0.4, fr: [5800, 0.7, 0.04], d: 0.045 },
    H: { c: "H", v: 0, a: 0.34, d: 0.055 },
    // plosives: closure (cl s), burst [Hz, Q, amp], aspiration (asp s)
    P: {
      c: "P",
      F2: 900,
      cl: 0.06,
      v: 0,
      b: [1000, 0.6, 0.45],
      asp: 0.04,
      d: 0.06,
    },
    B: {
      c: "P",
      F2: 900,
      cl: 0.045,
      v: 0.14,
      b: [900, 0.6, 0.28],
      asp: 0,
      d: 0.045,
    },
    T: {
      c: "P",
      F2: 1750,
      cl: 0.055,
      v: 0,
      b: [4300, 1.3, 0.5],
      asp: 0.035,
      d: 0.055,
    },
    D: {
      c: "P",
      F2: 1750,
      cl: 0.04,
      v: 0.14,
      b: [3600, 1.3, 0.3],
      asp: 0,
      d: 0.04,
    },
    K: {
      c: "P",
      F2: 2000,
      cl: 0.06,
      v: 0,
      b: [2100, 1.6, 0.5],
      asp: 0.045,
      d: 0.06,
    },
    G: {
      c: "P",
      F2: 2000,
      cl: 0.045,
      v: 0.14,
      b: [2000, 1.6, 0.3],
      asp: 0,
      d: 0.045,
    },
  };

  // Function words: unstressed, reduced, quick.
  const FUNC = new Set(
    (
      "a an the and or but of to in on at by for with from as is are was were be been am it its this that these those " +
      "i you he she we they me him her us them my your his our their not no so if then than there here do does did has have had " +
      "will would can could should shall may might must just into onto up out over off about all any some what who which when where how " +
      "i'm you're it's that's don't can't we're they're i'll you'll we'll let's"
    ).split(" "),
  );

  const NUM = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const TEENS = {
    10: "ten",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
    15: "fifteen",
    16: "sixteen",
    17: "seventeen",
    18: "eighteen",
    19: "nineteen",
  };
  const TENS = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  /** Spell a number the way a 1950s announcer would read it (years in pairs: "twenty seventy seven"). */
