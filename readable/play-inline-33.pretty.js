/* src/sound/48_radio_voice.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 48_radio_voice.js
 * "VOX": the procedural on-air voice.
 *
 * The browser's speechSynthesis voices are modern, clean and cannot be
 * routed into WebAudio — over a 1950s AM broadcast they break the
 * illusion. VOX instead *performs* each line with a Klatt-style formant
 * synthesiser that lives inside the WebAudio graph, so the voice goes
 * through the station's AM chain (band-limit, broadcast limiter, tube,
 * wow/flutter, crackle, signal static), the mixer, bus ducking, world
 * radio distance/panning and reverb, exactly like the records do.
 *
 * It is not a TTS engine: letters are turned into rough English phones
 * (digraph-aware grapheme→phone rules), grouped into syllables, stressed
 * (content vs. function words), timed (stress, phrase-final lengthening,
 * punctuation pauses, breaths) and given a real intonation contour
 * (declination, pitch accents, falls on '.', rises on '?' and continuation
 * rises on ','). Heard through a crackling AM set it reads as a real
 * announcer just past intelligibility — the subtitles ('radioText') carry
 * the words, the voice carries the performance.
 *
 * Graph per line (≈16 nodes, reused for the whole line):
 *   glottal osc (+vibrato, jitter) ─► voicing gain ─┐
 *   white noise ─► aspiration gain ─────────────────┴► 4 cascaded resonators (F1..F4, automated)
 *   white noise ─► frication band-pass (automated) ─► frication gain ─────┐     │
 *                                                                        ▼     ▼
 *                                              lip radiation / mic EQ ─► line gain ─► dest
 * Automation is scheduled one phrase at a time (lookahead pump), so a long
 * presidential address never floods the AudioParam timelines.
 *
 * AAA loop, improvement ROUND 1 — three passes (details in NOTES.md):
 *  pass A (VOX 2): sample-level formant synth, lexicon, duration rules, locus transitions;
 *  pass B (VOX 3, after critique 1): worker rendering, connected-speech rules, accent prosody,
 *    emphasis and [laugh]/[whoop]/… marks;
 *  pass C (after critique 2): consonant fixes measured with an automated rhyme test (no prevoiced
 *    /b d g/, decaying voice bars, longer VC transitions, released final stops), singing pass
 *    (see SING2), +460 lexicon entries (NY places, surnames, the city's own words).
 * Pass A: the live voice and the record singers are now VOX 2
 * (further down): a sample-level cascade/parallel formant synthesiser with
 * a pronouncing lexicon, Klatt duration rules and locus-equation
 * transitions. The WebAudio-biquad voice below is kept as the legacy
 * S.vox.sayFormant / S.vox.singerFormant.
 *
 * API (internal): S.vox.say(ctx, dest, text, profileId, opts) → controller
 *   {start, end, duration, pump(untilCtxTime), stop(fade), done}
 *   S.vox.plan(text, profileId) → phrase plan (pure JS, for tests)
 * ===================================================================== */
(function () {
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
  function spellNumber(s) {
    const n = parseInt(s, 10);
    if (!(n >= 0)) return s;
    const two = (x) =>
      x < 10
        ? NUM[x]
        : x < 20
          ? TEENS[x]
          : TENS[(x / 10) | 0] + (x % 10 ? " " + NUM[x % 10] : "");
    if (n < 100) return two(n);
    const hundreds = (x) =>
      x >= 100
        ? NUM[(x / 100) | 0] + " hundred" + (x % 100 ? " " + two(x % 100) : "")
        : two(x);
    if (n >= 1000 && n < 1e6 && !(n >= 1100 && n < 2100 && n % 1000))
      return (
        hundreds((n / 1000) | 0) +
        " thousand" +
        (n % 1000 ? " " + hundreds(n % 1000) : "")
      );
    if (s.length === 4)
      return (
        two((n / 100) | 0) +
        " " +
        (n % 100 === 0
          ? "hundred"
          : n % 100 < 10
            ? "oh " + NUM[n % 100]
            : two(n % 100))
      );
    if (n < 1000)
      return (
        NUM[(n / 100) | 0] + " hundred" + (n % 100 ? " " + two(n % 100) : "")
      );
    return s
      .split("")
      .map((d) => NUM[+d] || "")
      .join(" ");
  }

  // ------------------------------------------------------------------
  // Grapheme → phone rules (rough, digraph-aware English)
  // Returns [{p:'AE'|phone, k:'V'|'D'|cons, v:[vowel(s)]}] per word.
  // ------------------------------------------------------------------
  // Common irregular words (the rules get these badly wrong). Lowercase = vowel (a-b = diphthong), upper = consonant.
  const EXC = {
    the: "DH schwa",
    a: "schwa",
    i: "a-ih",
    you: "Y oo",
    to: "T oo",
    do: "D oo",
    of: "uh V",
    one: "W uh N",
    two: "T oo",
    are: "a R",
    was: "W uh Z",
    is: "ih Z",
    what: "W uh T",
    your: "Y o R",
    our: "a-uu R",
    said: "S e D",
    have: "H ae V",
    be: "B i",
    he: "H i",
    we: "W i",
    me: "M i",
    she: "SH i",
    they: "DH e-ih",
    there: "DH e R",
    where: "W e R",
    here: "H i R",
    who: "H oo",
    new: "N oo",
    york: "Y o R K",
    radio: "R e-ih D i o-uu",
    manhattan: "M ae N H ae T schwa N",
    america: "schwa M e R ih K schwa",
    american: "schwa M e R ih K schwa N",
    people: "P i P schwa L",
    friends: "F R e N D Z",
    good: "G uu D",
    could: "K uu D",
    would: "W uu D",
    should: "SH uu D",
    from: "F R uh M",
    some: "S uh M",
    come: "K uh M",
    done: "D uh N",
    love: "L uh V",
    only: "o-uu N L i",
    any: "e N i",
    many: "M e N i",
    been: "B ih N",
    theres: "DH e R Z",
    music: "M ih-oo Z ih K",
    world: "W er L D",
    city: "S ih T i",
    listening: "L ih S schwa N ih NG",
    tech: "T e K",
    president: "P R e Z ih D schwa N T",
    station: "S T e-ih SH schwa N",
    broadcast: "B R aw D K ae S T",
    mister: "M ih S T er",
    ok: "o-uu K e-ih",
    okay: "o-uu K e-ih",
    oh: "o-uu",
    hey: "H e-ih",
    so: "S o-uu",
    no: "N o-uu",
    go: "G o-uu",
    my: "M a-ih",
  };
  // More irregular words (lyrics and patter) the spelling rules mangle. Apostrophes are stripped before lookup.
  Object.assign(EXC, {
    above: "schwa B uh V",
    all: "aw L",
    alone: "schwa L o-uu N",
    among: "schwa M uh NG",
    anyway: "e N i W e-ih",
    around: "schwa R a-uu N D",
    atomic: "schwa T a M ih K",
    away: "schwa W e-ih",
    before: "B ih F o R",
    bomb: "B a M",
    bombs: "B a M Z",
    boogie: "B uu G i",
    bowl: "B o-uu L",
    breath: "B R e TH",
    broadway: "B R aw D W e-ih",
    bury: "B e R i",
    by: "B a-ih",
    call: "K aw L",
    chase: "T SH e-ih S",
    chorus: "K o R schwa S",
    chryslers: "K R a-ih S L er Z",
    chrysler: "K R a-ih S L er",
    citys: "S ih T i Z",
    close: "K L o-uu S",
    closing: "K L o-uu Z ih NG",
    comes: "K uh M Z",
    concrete: "K a N K R i T",
    cousin: "K uh Z ih N",
    cover: "K uh V er",
    dare: "D e R",
    dial: "D a-ih schwa L",
    diamond: "D a-ih M schwa N D",
    doctor: "D a K T er",
    dont: "D o-uu N T",
    wont: "W o-uu N T",
    door: "D o R",
    earl: "er L",
    eye: "a-ih",
    eyes: "a-ih Z",
    every: "e V R i",
    everything: "e V R i TH ih NG",
    everyone: "e V R i W uh N",
    fades: "F e-ih D Z",
    fall: "F aw L",
    fellas: "F e L schwa Z",
    ferry: "F e R i",
    ferrys: "F e R i Z",
    flare: "F L e R",
    forever: "F er e V er",
    full: "F uu L",
    fusion: "F ih-oo ZH schwa N",
    geiger: "G a-ih G er",
    get: "G e T",
    glow: "G L o-uu",
    glowing: "G L o-uu ih NG",
    gone: "G aw N",
    gonna: "G uh N schwa",
    hair: "H e R",
    half: "H ae F",
    harbor: "H a R B er",
    head: "H e D",
    heart: "H a R T",
    hell: "H i L",
    hold: "H o-uu L D",
    honey: "H uh N i",
    hudson: "H uh D S schwa N",
    hundred: "H uh N D R schwa D",
    id: "a-ih D",
    ill: "a-ih L",
    im: "a-ih M",
    illusion: "ih L oo ZH schwa N",
    itll: "ih T schwa L",
    kiss: "K ih S",
    know: "N o-uu",
    ladys: "L e-ih D i Z",
    liberty: "L ih B er T i",
    libertys: "L ih B er T i Z",
    lonely: "L o-uu N L i",
    long: "L aw NG",
    lost: "L aw S T",
    lovely: "L uh V L i",
    low: "L o-uu",
    maybe: "M e-ih B i",
    measured: "M e ZH er D",
    minute: "M ih N ih T",
    miss: "M ih S",
    nothing: "N uh TH ih NG",
    off: "aw F",
    old: "o-uu L D",
    on: "aw N",
    once: "W uh N S",
    ones: "W uh N Z",
    places: "P L e-ih S ih Z",
    pour: "P o R",
    practice: "P R ae K T ih S",
    put: "P uu T",
    radiation: "R e-ih D i e-ih SH schwa N",
    riding: "R a-ih D ih NG",
    ruins: "R oo ih N Z",
    says: "S e Z",
    shelter: "SH e L T er",
    shining: "SH a-ih N ih NG",
    sirens: "S a-ih R schwa N Z",
    siren: "S a-ih R schwa N",
    sky: "S K a-ih",
    slow: "S L o-uu",
    smiling: "S M a-ih L ih NG",
    soft: "S aw F T",
    sold: "S o-uu L D",
    somewhere: "S uh M W e R",
    son: "S uh N",
    song: "S aw NG",
    soul: "S o-uu L",
    sugar: "SH uu G er",
    sweetheart: "S W i T H a R T",
    thats: "DH ae T S",
    theyre: "DH e R",
    though: "DH o-uu",
    thousand: "TH a-uu Z schwa N D",
    through: "TH R oo",
    tomorrow: "T schwa M a R o-uu",
    tonight: "T schwa N a-ih T",
    took: "T uu K",
    tubes: "T oo B Z",
    use: "Y oo Z",
    walk: "W aw K",
    walked: "W aw K T",
    walking: "W aw K ih NG",
    want: "W aw N T",
    watch: "W a T SH",
    water: "W aw T er",
    were: "W er",
    whole: "H o-uu L",
    why: "W a-ih",
    worth: "W er TH",
    youll: "Y oo L",
    youre: "Y o R",
    electron: "ih L e K T R a N",
    electrons: "ih L e K T R a N Z",
    defense: "D ih F e N S",
    cue: "K Y oo",
    better: "B e T er",
    rocky: "R a K i",
    delgado: "D e L G a D o-uu",
    rockette: "R a K e T",
    pal: "P ae L",
    folks: "F o-uu K S",
    listening: "L ih S schwa N ih NG",
    kong: "K aw NG",
    zeke: "Z i K",
  });
  function excPhones(str) {
    return str
      .split(" ")
      .map((tok) =>
        tok === tok.toUpperCase() && !/^[a-z]/.test(tok)
          ? { k: "C", p: tok }
          : tok.indexOf("-") > 0
            ? { k: "D", v: tok.split("-") }
            : { k: "V", v: [tok] },
      );
  }
  const isV = (ch) =>
    ch === "a" ||
    ch === "e" ||
    ch === "i" ||
    ch === "o" ||
    ch === "u" ||
    ch === "y";
  function wordPhones(w) {
    if (EXC[w]) return excPhones(EXC[w]);
    // past tense "-ed": "tuned" → T uh N D, "wanted" keeps its vowel
    if (
      w.length > 3 &&
      w.endsWith("ed") &&
      !isV(w[w.length - 3]) &&
      !/[td]/.test(w[w.length - 3])
    ) {
      const st = wordPhones(
        w.slice(0, -2) +
          (isV(w[w.length - 4]) && !isV(w[w.length - 5] || "a") ? "e" : ""),
      );
      st.push({ k: "C", p: /[pkfsx]|ch|sh/.test(w.slice(-4, -2)) ? "T" : "D" });
      return st;
    }
    w = w.replace(/dge/g, "j").replace(/tch/g, "ch");
    if (w.length === 2 && w[1] === "e" && !isV(w[0]))
      return [
        { k: "C", p: { b: "B", h: "H", m: "M", w: "W", s: "SH" }[w[0]] || "D" },
        { k: "V", v: ["i"] },
      ];
    const out = [];
    const V = (v, v2) =>
      out.push(v2 ? { k: "D", v: [v, v2] } : { k: "V", v: [v] });
    const C = (p) => {
      if (out.length && out[out.length - 1].p === p) return;
      out.push({ k: "C", p });
    };
    const n = w.length;
    // silent final e (magic e): "make", "time", "home", "cute"
    const magic =
      n > 2 &&
      w[n - 1] === "e" &&
      !isV(w[n - 2]) &&
      isV(w[n - 3]) &&
      w[n - 3] !== "e";
    const end = magic ? n - 1 : n;
    for (let i = 0; i < end; i++) {
      const c = w[i],
        d = w[i + 1] || "",
        tri = w.substr(i, 3),
        di = c + d;
      const last = i === end - 1;
      if (isV(c) && !(c === "y" && i === 0)) {
        // vowel digraphs
        if (tri === "igh") {
          V("a", "i");
          i += 2;
          continue;
        }
        if (
          di === "ee" ||
          di === "ea" ||
          di === "ie" ||
          (di === "ey" && last === false)
        ) {
          V("i");
          i++;
          continue;
        }
        if (di === "oo") {
          V("oo");
          i++;
          continue;
        }
        if (di === "ou" || di === "ow") {
          V("a", "uu");
          i++;
          continue;
        }
        if (di === "ai" || di === "ay" || di === "ei") {
          V("e", "ih");
          i++;
          continue;
        }
        if (di === "oa" || di === "oe") {
          V("o", "uu");
          i++;
          continue;
        }
        if (di === "au" || di === "aw") {
          V("aw");
          i++;
          continue;
        }
        if (di === "oi" || di === "oy") {
          V("o", "ih");
          i++;
          continue;
        }
        if (di === "ue" || di === "ew") {
          V("ih", "oo");
          i++;
          continue;
        }
        // r-coloured
        if (
          d === "r" &&
          (c === "e" || c === "i" || c === "u") &&
          !isV(w[i + 2] || "")
        ) {
          V("er");
          i++;
          continue;
        }
        if (d === "r" && c === "a" && !isV(w[i + 2] || "")) {
          V("a");
          C("R");
          i++;
          continue;
        }
        if (d === "r" && c === "o" && !isV(w[i + 2] || "")) {
          V("o");
          C("R");
          i++;
          continue;
        }
        // magic-e long vowels (vowel + single consonant + final e)
        if (magic && i === n - 3) {
          if (c === "a") V("e", "ih");
          else if (c === "i" || c === "y") V("a", "ih");
          else if (c === "o") V("o", "uu");
          else if (c === "u") V("ih", "oo");
          else V("e");
          continue;
        }
        // short vowels
        if (c === "a") V(last && n > 1 ? "schwa" : "ae");
        else if (c === "e") {
          if (last && n > 2) continue;
          V(i > 0 && !last && n > 5 && !isV(d) ? "ih" : "e");
        } else if (c === "i") V("ih");
        else if (c === "o") V(last ? "o" : "a");
        else if (c === "u")
          V(i === 0 || w[i - 1] === "p" || w[i - 1] === "b" ? "uh" : "uh");
        else if (c === "y") V(last ? "i" : "ih");
        continue;
      }
      // consonant digraphs
      if (di === "sh") {
        C("SH");
        i++;
        continue;
      }
      if (di === "ch") {
        C("T");
        C("SH");
        i++;
        continue;
      }
      if (di === "th") {
        C(FUNC.has(w) ? "DH" : "TH");
        i++;
        continue;
      }
      if (di === "ph") {
        C("F");
        i++;
        continue;
      }
      if (di === "ng") {
        C("NG");
        i++;
        if (w[i + 1] === "g") i++;
        continue;
      }
      if (di === "ck") {
        C("K");
        i++;
        continue;
      }
      if (di === "qu") {
        C("K");
        C("W");
        i++;
        continue;
      }
      if (di === "wh") {
        C("W");
        i++;
        continue;
      }
      if (di === "gh") {
        i++;
        continue;
      }
      if (di === "kn" && i === 0) {
        C("N");
        i++;
        continue;
      }
      if (di === "wr" && i === 0) {
        C("R");
        i++;
        continue;
      }
      if (tri === "tio" || tri === "sio") {
        C("SH");
        V("schwa");
        C("N");
        i += w[i + 3] === "n" ? 3 : 2;
        continue;
      }
      if (c === d && c !== "e" && c !== "o") continue; // doubled consonant
      switch (c) {
        case "b":
          C("B");
          break;
        case "d":
          C("D");
          break;
        case "f":
          C("F");
          break;
        case "g":
          C(d === "e" || d === "i" || d === "y" ? "ZH" : "G");
          if (d === "e" || d === "i" || d === "y") {
            out[out.length - 1].p = "D";
            C("ZH");
          }
          break;
        case "h":
          C("H");
          break;
        case "j":
          C("D");
          C("ZH");
          break;
        case "k":
          C("K");
          break;
        case "l":
          C("L");
          break;
        case "m":
          C("M");
          break;
        case "n":
          C("N");
          break;
        case "p":
          C("P");
          break;
        case "q":
          C("K");
          break;
        case "r":
          C("R");
          break;
        case "t":
          C("T");
          break;
        case "v":
          C("V");
          break;
        case "w":
          C("W");
          break;
        case "x":
          C("K");
          C("S");
          break;
        case "y":
          C("Y");
          break;
        case "z":
          C("Z");
          break;
        case "c":
          C(d === "e" || d === "i" || d === "y" ? "S" : "K");
          break;
        case "s":
          C(
            i > 0 && isV(w[i - 1]) && isV(d)
              ? "Z"
              : last && i > 0 && !"ptkf".includes(w[i - 1])
                ? "Z"
                : "S",
          );
          break;
        default:
          break;
      }
    }
    if (!out.some((p) => p.k !== "C"))
      out.splice(out.length ? 1 : 0, 0, { k: "V", v: ["schwa"] }); // "Mr", "hmm"
    return out;
  }

  // ------------------------------------------------------------------
  // Text → phrases → timed segments
  // ------------------------------------------------------------------
  /**
   * Split text into intonation phrases: [{words:[..], end:'.'|'?'|'!'|','|'—'|'…', pause}]
   */
  // Non-verbal vocalisations the scripts may use: "[laugh]", "[chuckle]", "[whoop]" (Vinnie's "Whoo-ee!"),
  // "[sigh]", "[breath]". They are performed by VOX 2 and stripped from captions / TTS (S.vox.stripMarks).
  const VOCS = { laugh: 1, chuckle: 1, whoop: 1, sigh: 1, breath: 1 };
  function phrases(text) {
    const res = [];
    const clean = String(text)
      .replace(/(\d),(\d{3})/g, "$1$2")
      .replace(/[“”"()]/g, "")
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\*([^*]+?)([.,!?;:…]+)\*/g, "*$1*$2"); // "*roof,*" → "*roof*,"
    // split out the vocalisation marks first
    const parts = clean.split(/\[([a-z]+)\]/i);
    for (let pi = 0; pi < parts.length; pi++) {
      if (pi % 2 === 1) {
        const v = parts[pi].toLowerCase();
        if (VOCS[v]) res.push({ voc: v, words: [], emph: [], end: "v" });
        continue;
      }
      const part = parts[pi].trim();
      if (!part) continue;
      const re = /([^.,!?;:—…]+)([.,!?;:—…]+|$)/g;
      let m;
      while ((m = re.exec(part))) {
        if (!m[0]) {
          re.lastIndex++;
          if (re.lastIndex > part.length) break;
          continue;
        }
        // *word* = emphasis (the DJ leans on it: bigger pitch accent, longer, louder)
        const words = [],
          emph = [];
        let inEm = false;
        for (const tok of m[1].split(/\s+/)) {
          if (!tok) continue;
          if (!/[a-z0-9]/i.test(tok)) {
            if (tok.indexOf("*") >= 0) inEm = false;
            continue;
          }
          const open = tok[0] === "*",
            close = tok.length > 1 && /\*[^a-z0-9*]*$/i.test(tok);
          const em = inEm || open;
          if (open && !close) inEm = true;
          else if (close) inEm = false;
          const sub = tok
            .replace(/(\d+)/g, (x) => " " + spellNumber(x) + " ")
            .replace(/-/g, " ")
            .toLowerCase()
            .split(/\s+/)
            .map((w) => w.replace(/[^a-z']/g, ""))
            .filter((w) => /[a-z]/.test(w));
          for (const w of sub) {
            words.push(w);
            emph.push(em);
          }
        }
        const p = m[2] || ".";
        const end =
          p.indexOf("?") >= 0
            ? "?"
            : p.indexOf("!") >= 0
              ? "!"
              : p.indexOf("…") >= 0 || p.indexOf("..") >= 0
                ? "…"
                : p[0] === ","
                  ? ","
                  : p[0] === ";" || p[0] === ":" || p[0] === "—"
                    ? ";"
                    : ".";
        if (words.length) res.push({ words, emph, end });
        if (re.lastIndex >= part.length) break;
      }
    }
    return res;
  }
  /** Caption / TTS text: vocalisation marks and emphasis asterisks removed. */
  function stripMarks(text) {
    return String(text)
      .replace(/\s*\[(laugh|chuckle|whoop|sigh|breath)\]\s*/gi, " ")
      .replace(/\*([^*\s][^*]*?)\*/g, "$1")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  /**
   * Build the segment plan for one phrase. Each segment: {t, d, F:[4], v, a, fr:[f,q,amp]|null, burst, f0pts:[[t,mul]]}
   * times relative to phrase start (seconds). Returns {segs, dur, f0:[[t, mul]]}.
   */
  function planPhrase(ph, P, rnd, isFirst) {
    const segs = [],
      f0 = [];
    let t = 0,
      prevF = VF.schwa;
    const rate = P.rate;
    // syllable bookkeeping for intonation
    const sylls = [];
    ph.words.forEach((w, wi) => {
      const phones = wordPhones(w.replace(/'/g, ""));
      const func = FUNC.has(w) && ph.words.length > 1;
      let vi = 0;
      const nv = phones.filter((p) => p.k !== "C").length;
      phones.forEach((p, pi) => {
        if (p.k === "C") {
          const q = PH[p.p];
          if (!q) return;
          const next = phones.slice(pi + 1).find((x) => x.k !== "C");
          const nextF = next ? VF[next.v[0]] : prevF;
          let d = (q.d / rate) * (func ? 0.8 : 1);
          let F = q.F ? q.F.slice() : nextF.slice();
          if (!q.F && q.F2) {
            F = [
              Math.min(nextF[0], 350),
              q.F2 * 0.6 + nextF[1] * 0.4,
              nextF[2] * 0.96,
              nextF[3],
            ];
          }
          if (q.c === "P") {
            // closure (silence / voice bar) → burst → optional aspiration
            const cl = (q.cl / rate) * (func ? 0.75 : 1);
            segs.push({
              t,
              d: cl,
              F: [220, F[1], F[2], F[3]],
              v: q.v,
              a: 0,
              fr: null,
            });
            t += cl;
            segs.push({
              t,
              d: 0.012,
              F,
              v: q.v * 1.5,
              a: 0.1,
              fr: q.b,
              burst: true,
            });
            t += 0.012;
            if (q.asp) {
              const ad = q.asp / rate;
              segs.push({ t, d: ad, F: nextF, v: 0.05, a: 0.3, fr: null });
              t += ad;
            }
            return;
          }
          if (q.c === "H") {
            segs.push({ t, d, F: nextF, v: 0, a: q.a, fr: null });
            t += d;
            return;
          }
          segs.push({
            t,
            d,
            F,
            v: q.v,
            a: q.c === "F" ? 0.02 : 0,
            fr: q.fr || null,
            nasal: q.c === "N",
          });
          t += d;
          prevF = F;
          return;
        }
        // vowel / diphthong nucleus
        const stressed =
          !func &&
          (nv === 1
            ? true
            : vi === 0 ||
              (nv >= 3 &&
                vi === 1 &&
                /^(be|re|de|a|con|pro|com|in|un|en|ex|dis)/.test(w)));
        const finalSyl = wi === ph.words.length - 1 && vi === nv - 1;
        let d =
          ((stressed ? 0.13 : func ? 0.055 : 0.075) *
            (p.k === "D" ? 1.35 : 1)) /
          rate;
        if (finalSyl) d *= ph.end === "," ? 1.3 : 1.55; // phrase-final lengthening
        if (p.v[0] === "schwa" && !stressed) d *= 0.8;
        d *= 0.9 + rnd() * 0.22;
        const Fa = VF[p.v[0]] || VF.schwa,
          Fb = p.k === "D" ? VF[p.v[1]] || Fa : null;
        const seg = {
          t,
          d,
          F: Fa,
          F2: Fb,
          v: stressed ? 1 : func ? 0.72 : 0.85,
          a: P.breath,
          fr: null,
          syl: sylls.length,
        };
        segs.push(seg);
        sylls.push({ t, d, stressed, finalSyl, word: wi });
        t += d;
        prevF = Fb || Fa;
        vi++;
      });
      t += (func ? 0.008 : 0.02) / rate; // word juncture (connected speech)
    });
    // --- intonation: declination + pitch accents + boundary tone
    const N = sylls.length,
      R = P.range * P.accent;
    const emph = ph.end === "!" ? 1.45 : 1;
    let lastAcc = -1;
    for (let i = 0; i < N; i++) if (sylls[i].stressed) lastAcc = i;
    for (let i = 0; i < N; i++) {
      const s = sylls[i];
      const base =
        1.07 - 0.17 * (N > 1 ? i / (N - 1) : 0) + (isFirst ? 0.02 : 0);
      if (s.finalSyl) {
        const startM = base + (s.stressed ? R * 0.5 * emph : 0);
        let endM;
        if (ph.end === "?") endM = 1.08 + R * 1.3;
        else if (ph.end === "," || ph.end === ";" || ph.end === "…")
          endM = base + R * 0.25; // continuation rise
        else endM = 0.8 - R * 0.25; // declarative fall
        f0.push([s.t, startM], [s.t + s.d * 0.85, endM]);
        continue;
      }
      if (s.stressed) {
        const acc = R * (0.55 + rnd() * 0.6) * emph * (i === lastAcc ? 1.2 : 1);
        f0.push(
          [s.t, base + acc * 0.35],
          [s.t + s.d * 0.35, base + acc],
          [s.t + s.d, base + acc * 0.45],
        );
      } else f0.push([s.t, base - R * 0.08], [s.t + s.d, base - R * 0.12]);
    }
    const pause =
      ({ ".": 0.36, "!": 0.38, "?": 0.42, ",": 0.17, ";": 0.26, "…": 0.55 }[
        ph.end
      ] || 0.3) *
      P.pause *
      (0.85 + rnd() * 0.3);
    return { segs, f0, dur: t, pause, breath: ph.end !== "," && rnd() < 0.55 };
  }

  /** Plan a whole line (pure data — used by the live voice and by tests). */
  function plan(text, profileId, rnd) {
    const P = PROFILES[profileId] || PROFILES.announcer;
    rnd = rnd || Math.random;
    return phrases(text)
      .filter((ph) => !ph.voc)
      .map((ph, i) => planPhrase(ph, P, rnd, i === 0));
  }

  // ------------------------------------------------------------------
  // The synth
  // ------------------------------------------------------------------
  function bq(ctx, type, f, q, g) {
    const b = ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q;
    if (g !== undefined) b.gain.value = g;
    return b;
  }
  // Lowpass-biquad resonators: WebAudio's lowpass Q is the resonance peak in dB, so a formant of bandwidth B at F
  // is Q = 20·log10(F/B). Cascading them (Klatt's cascade branch) gives natural relative formant amplitudes.
  const BW = [70, 95, 150, 230];
  const NORM = 0.115; // calibrated: a line ≈ the loudness of a record through the same AM chain
  const qdb = (f, k) => Math.max(1, 20 * Math.log10(f / BW[k]));

  /**
   * Speak `text` on `dest` with a voice profile. opts: {start (ctx time), gain}.
   * Returns a controller: pump(untilTime) schedules phrases up to that time (call ~4×/s live;
   * pass Infinity offline), stop(fade), end (ctx time when the line is over — grows as phrases are planned),
   * plannedEnd (full estimate).
   */
  function say(ctx, dest, text, profileId, opts) {
    opts = opts || {};
    const P = PROFILES[profileId] || PROFILES.announcer;
    const rnd = opts.rng || Math.random;
    const t0 = Math.max(ctx.currentTime + 0.05, opts.start || 0);
    const plans = plan(text, profileId, rnd);
    const fs = P.fs * (opts.formantScale || 1);
    const pitch = (opts.pitch || 1) * P.f0 * (0.97 + rnd() * 0.06);
    const nodes = [];
    const mk = (n) => {
      nodes.push(n);
      return n;
    };
    // sources
    const osc = mk(ctx.createOscillator());
    osc.setPeriodicWave(S.wave(ctx, "glottal"));
    osc.frequency.value = pitch;
    const vib = mk(ctx.createOscillator());
    vib.frequency.value = 5.2 + rnd() * 0.8;
    const vibG = mk(ctx.createGain());
    vibG.gain.value = pitch * P.vib;
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    const jit = mk(ctx.createBufferSource());
    jit.buffer = S.noiseBufs.pink;
    jit.loop = true;
    jit.playbackRate.value = 0.3;
    const jitF = mk(bq(ctx, "lowpass", 40, 0.5));
    const jitG = mk(ctx.createGain());
    jitG.gain.value = pitch * 0.05;
    jit.connect(jitF);
    jitF.connect(jitG);
    jitG.connect(osc.frequency);
    const nz = mk(ctx.createBufferSource());
    nz.buffer = S.noiseBufs.white;
    nz.loop = true;
    const vG = mk(ctx.createGain());
    vG.gain.value = 0;
    const aG = mk(ctx.createGain());
    aG.gain.value = 0;
    const aHp = mk(bq(ctx, "highpass", 500, 0.5));
    osc.connect(vG);
    nz.connect(aHp);
    aHp.connect(aG);
    // cascade resonators
    const res = [];
    let prev = null;
    for (let k = 0; k < 4; k++) {
      const f = VF.schwa[k] * fs;
      const r = mk(bq(ctx, "lowpass", f, qdb(f, k)));
      res.push(r);
      if (prev) prev.connect(r);
      prev = r;
    }
    vG.connect(res[0]);
    aG.connect(res[0]);
    // frication branch (parallel)
    const frF = mk(bq(ctx, "bandpass", 5000, 2));
    const frG = mk(ctx.createGain());
    frG.gain.value = 0;
    nz.connect(frF);
    frF.connect(frG);
    // lip radiation (+6 dB/oct-ish) + mic warmth + presence, then the line gain
    const lipRad = mk(bq(ctx, "highshelf", 1200, 0.7, 7));
    const warm = mk(bq(ctx, "lowshelf", 220, 0.7, P.warmth));
    const hp = mk(bq(ctx, "highpass", 85, 0.7));
    const pres = mk(bq(ctx, "peaking", 2600, 1.2, 3));
    const line = mk(ctx.createGain());
    line.gain.value = 0;
    // NORM: the cascade has ~+20 dB of resonance gain; this brings a line to ≈ −20 dBFS RMS (record level at the chain)
    const out = mk(ctx.createGain());
    out.gain.value = (opts.gain === undefined ? 1 : opts.gain) * P.gain * NORM;
    res[3].connect(lipRad);
    frG.connect(lipRad);
    lipRad.connect(warm);
    warm.connect(hp);
    hp.connect(pres);
    pres.connect(line);
    line.connect(out);
    out.connect(dest);
    [osc, vib, jit, nz].forEach((s) =>
      s.start(t0 - 0.02, s === nz || s === jit ? rnd() * 2 : 0),
    );
    line.gain.setValueAtTime(0, t0 - 0.02);
    line.gain.linearRampToValueAtTime(1, t0 + 0.02);

    // --- phrase timing
    const starts = [];
    let cur = t0;
    for (const p of plans) {
      starts.push(cur);
      cur += p.dur + p.pause + (p.breath ? 0.18 * P.pause : 0);
    }
    const plannedEnd = cur;
    let next = 0;
    // JS-side mirror of the automated values (AudioParam.value is stale when scheduling ahead)
    const lastF = VF.schwa.map((f) => f * fs);
    let lastPitch = pitch;
    const setF = (Fv, tt, tr) => {
      for (let k = 0; k < 4; k++) {
        const f = Math.min(Fv[k] * fs, 4800);
        res[k].frequency.setValueAtTime(lastF[k], tt);
        res[k].frequency.linearRampToValueAtTime(f, tt + tr);
        res[k].Q.setValueAtTime(qdb(lastF[k], k), tt);
        res[k].Q.linearRampToValueAtTime(qdb(f, k), tt + tr);
        lastF[k] = f;
      }
    };
    function schedulePhrase(i) {
      const p = plans[i],
        T0 = starts[i];
      // anchor every automated param at the phrase start (continuity from the previous phrase)
      vG.gain.setValueAtTime(0, T0);
      aG.gain.setValueAtTime(0, T0);
      frG.gain.setValueAtTime(0, T0);
      for (const sg of p.segs) {
        const ts = T0 + sg.t,
          tr = Math.min(0.035, sg.d * 0.45),
          tail = ts + sg.d;
        setF(sg.F, ts, tr);
        if (sg.F2) setF(sg.F2, ts + sg.d * 0.45, sg.d * 0.5); // diphthong glide
        const va = sg.v * (sg.nasal ? 0.9 : 1);
        vG.gain.linearRampToValueAtTime(va, ts + (sg.burst ? 0.006 : 0.016));
        vG.gain.setValueAtTime(va, tail - 0.004);
        aG.gain.linearRampToValueAtTime(sg.a, ts + 0.012);
        aG.gain.setValueAtTime(sg.a, tail - 0.004);
        if (sg.fr) {
          frF.frequency.setValueAtTime(sg.fr[0] * Math.sqrt(fs), ts);
          frF.Q.setValueAtTime(sg.fr[1], ts);
          frG.gain.linearRampToValueAtTime(
            sg.fr[2],
            ts + (sg.burst ? 0.004 : 0.022),
          );
          frG.gain.linearRampToValueAtTime(
            sg.fr[2] * (sg.burst ? 0.35 : 1),
            tail - 0.004,
          );
        } else {
          frG.gain.linearRampToValueAtTime(0, ts + 0.012);
          frG.gain.setValueAtTime(0, tail - 0.004);
        }
      }
      const pe = T0 + p.dur;
      vG.gain.linearRampToValueAtTime(0, pe + 0.04);
      aG.gain.linearRampToValueAtTime(0, pe + 0.03);
      frG.gain.linearRampToValueAtTime(0, pe + 0.02);
      // intonation
      const fq = osc.frequency;
      fq.setValueAtTime(lastPitch, T0 - 0.01);
      for (const pt of p.f0) {
        lastPitch = pitch * pt[1];
        fq.linearRampToValueAtTime(lastPitch, T0 + pt[0]);
      }
      // phrase-final creak (vocal fry): the glottal pulse goes irregular as the pitch falls away
      if (P.fry && (p.end === "." || p.end === "…")) {
        const fs0 = Math.max(T0, pe - 0.16);
        jitG.gain.setValueAtTime(pitch * 0.05, fs0);
        jitG.gain.linearRampToValueAtTime(pitch * (0.05 + 0.13 * P.fry), pe);
        jitG.gain.linearRampToValueAtTime(pitch * 0.05, pe + 0.08);
      }
      // audible in-breath before the next sentence (studio mic)
      if (p.breath && i < plans.length - 1) {
        const bt = pe + p.pause * 0.55;
        for (let k = 0; k < 4; k++) {
          lastF[k] = VF.ae[k] * fs * (k ? 1.1 : 1);
          res[k].frequency.setValueAtTime(lastF[k], bt);
          res[k].Q.setValueAtTime(qdb(lastF[k], k), bt);
        }
        aG.gain.setValueAtTime(0, bt);
        aG.gain.linearRampToValueAtTime(0.09 + P.breath * 0.4, bt + 0.12);
        aG.gain.linearRampToValueAtTime(0, bt + 0.26);
      }
    }
    const ctl = {
      start: t0,
      plannedEnd,
      end: plannedEnd,
      stopped: false,
      /** Schedule every phrase that starts before `until` (ctx time). Returns true when all phrases are scheduled. */
      pump(until) {
        while (next < plans.length && starts[next] < until) {
          try {
            schedulePhrase(next);
          } catch (e) {
            G.reportError("sound:vox", e);
          }
          next++;
        }
        return next >= plans.length;
      },
      stop(fade) {
        if (ctl.stopped) return;
        ctl.stopped = true;
        const t = ctx.currentTime,
          f = fade === undefined ? 0.08 : fade;
        try {
          line.gain.cancelScheduledValues(t);
          line.gain.setValueAtTime(line.gain.value, t);
          line.gain.linearRampToValueAtTime(0, t + f);
        } catch (e) {
          /* */
        }
        [osc, vib, jit, nz].forEach((s) => {
          try {
            s.stop(t + f + 0.05);
          } catch (e) {
            /* */
          }
        });
        setTimeout(
          () => {
            nodes.forEach((n) => {
              try {
                n.disconnect();
              } catch (e) {
                /* */
              }
            });
          },
          (f + 0.3) * 1000,
        );
      },
    };
    // fade the line out at its natural end and free the graph
    line.gain.setValueAtTime(1, plannedEnd - 0.02);
    line.gain.linearRampToValueAtTime(0, plannedEnd + 0.05);
    [osc, vib, jit, nz].forEach((s) => s.stop(plannedEnd + 0.1));
    osc.onended = () => {
      if (!ctl.stopped) {
        ctl.stopped = true;
        nodes.forEach((n) => {
          try {
            n.disconnect();
          } catch (e) {
            /* */
          }
        });
      }
    };
    ctl.pump(t0 + 1.6);
    return ctl;
  }

  // ==================================================================
  // SINGING — the same formant tract, driven by a melody instead of an
  // intonation contour. The composers in 40_songs.js turn lyric lines into
  // sung syllables (syllables()), give every syllable a note, and call
  // singer.note() bar by bar, just ahead of the audio clock:
  //   · onset consonants are sung *before* the beat so the vowel lands on it,
  //   · the vowel is sustained for the note (pure vowel; a diphthong glides
  //     only at the very end, the way trained singers do),
  //   · crooner scoop into detached notes, portamento between legato ones,
  //   · delayed vibrato that blooms on held notes, a small swell, a jazz
  //     fall-off at phrase ends and an audible breath before each phrase,
  //   · coda consonants close the note.
  // A girl-group chorus is several singers (detuned, slightly late, with
  // different tract lengths) singing the same syllables.
  // ==================================================================
  const PREFIX = /^(be|re|de|a|con|pro|com|in|un|en|ex|dis)/;
  /** Lyric text → sung syllables [{on:[phone], v:[vowel(s)], co:[phone], stressed, word, wordEnd}] */
  function syllables(text) {
    const out = [];
    const words = String(text)
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/(\d+)/g, (x) => " " + spellNumber(x) + " ")
      .replace(/-/g, " ")
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z']/g, ""))
      .filter(Boolean);
    words.forEach((w, wi) => {
      const ph = singPhones(w);
      const func = FUNC.has(w) && words.length > 1;
      const nuc = [];
      ph.forEach((p, i) => {
        if (p.k !== "C") nuc.push(i);
      });
      const nv = nuc.length;
      let stressIdx = nuc.findIndex((i) => ph[i].st === 1);
      if (stressIdx < 0)
        stressIdx = nv >= 2 && PREFIX.test(w) && w.length > 4 ? 1 : 0;
      for (let s = 0; s < nv; s++) {
        const i = nuc[s],
          prevN = s ? nuc[s - 1] : -1,
          nextN = s < nv - 1 ? nuc[s + 1] : ph.length;
        // onset = consonants since the previous nucleus (a cluster of two or more gives its first one to the previous coda)
        const onStart = s > 0 && i - prevN - 1 >= 2 ? prevN + 2 : prevN + 1;
        const on = ph.slice(onStart, i).map((p) => p.p);
        const co =
          s === nv - 1
            ? ph.slice(i + 1).map((p) => p.p)
            : nextN - i - 1 >= 2
              ? [ph[i + 1].p]
              : [];
        out.push({
          on,
          v: ph[i].v,
          co,
          stressed: !func && s === stressIdx,
          word: wi,
          wordEnd: s === nv - 1,
        });
      }
    });
    return out;
  }

  const SING = {
    // a relaxed baritone crooner
    male: {
      fs: 1.0,
      breath: 0.035,
      vib: [5.3, 0.012],
      gain: 1.0,
      warmth: 5,
      scoop: 0.95,
    },
    // a bright alto / girl-group lead
    female: {
      fs: 1.17,
      breath: 0.05,
      vib: [5.8, 0.014],
      gain: 0.86,
      warmth: 2,
      scoop: 0.962,
    },
  };
  const SING_NORM = 0.72; // sustained vowels are denser than speech: keep a sung line level with a spoken one

  /** Consonant cluster → timed tract segments (the same model the speaking voice uses). */
  function consSegs(list, nextF) {
    const segs = [];
    for (const p of list) {
      const q = PH[p];
      if (!q) continue;
      let F = q.F ? q.F.slice() : nextF.slice();
      if (!q.F && q.F2)
        F = [
          Math.min(nextF[0], 350),
          q.F2 * 0.6 + nextF[1] * 0.4,
          nextF[2] * 0.96,
          nextF[3],
        ];
      if (q.c === "P") {
        segs.push({
          d: q.cl * 0.9,
          F: [220, F[1], F[2], F[3]],
          v: q.v,
          a: 0,
          fr: null,
        });
        segs.push({ d: 0.012, F, v: q.v * 1.5, a: 0.1, fr: q.b, burst: true });
        if (q.asp)
          segs.push({ d: q.asp * 0.8, F: nextF, v: 0.05, a: 0.3, fr: null });
        continue;
      }
      if (q.c === "H") {
        segs.push({ d: q.d, F: nextF, v: 0, a: q.a, fr: null });
        continue;
      }
      // sung nasals & liquids are held a touch longer (they carry pitch)
      segs.push({
        d: q.d * (q.c === "N" || q.c === "L" ? 1.15 : 0.95),
        F,
        v: q.v,
        a: q.c === "F" ? 0.02 : 0,
        fr: q.fr || null,
        nasal: q.c === "N",
      });
    }
    return segs;
  }

  /**
   * A singer living on `dest`. opts: {voice:'male'|'female', start, gain, detune (cents), delay (s), fs (tract scale ×)}.
   * singer.note(t, dur, midi, syl, vel, {legato, breath, fall}) schedules one sung syllable whose vowel starts at t.
   * Notes must be scheduled in time order (the composers do, bar by bar). dispose(fade) frees the graph.
   */
  function singer(ctx, dest, opts) {
    opts = opts || {};
    const V = SING[opts.voice] || SING.male;
    const fs = V.fs * (opts.fs || 1);
    const t0 = Math.max(ctx.currentTime + 0.02, opts.start || 0);
    const nodes = [];
    const mk = (n) => {
      nodes.push(n);
      return n;
    };
    const osc = mk(ctx.createOscillator());
    osc.setPeriodicWave(S.wave(ctx, "glottal"));
    osc.frequency.value = 220;
    osc.detune.value = opts.detune || 0;
    const vib = mk(ctx.createOscillator());
    vib.frequency.value = V.vib[0] * (0.96 + Math.random() * 0.08);
    const vibG = mk(ctx.createGain());
    vibG.gain.value = 0;
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    const jit = mk(ctx.createBufferSource());
    jit.buffer = S.noiseBufs.pink;
    jit.loop = true;
    jit.playbackRate.value = 0.3;
    const jitF = mk(bq(ctx, "lowpass", 30, 0.5));
    const jitG = mk(ctx.createGain());
    jitG.gain.value = 5;
    jit.connect(jitF);
    jitF.connect(jitG);
    jitG.connect(osc.frequency);
    const nz = mk(ctx.createBufferSource());
    nz.buffer = S.noiseBufs.white;
    nz.loop = true;
    const vG = mk(ctx.createGain());
    vG.gain.value = 0;
    const aG = mk(ctx.createGain());
    aG.gain.value = 0;
    const aHp = mk(bq(ctx, "highpass", 500, 0.5));
    osc.connect(vG);
    nz.connect(aHp);
    aHp.connect(aG);
    const res = [];
    let prev = null;
    for (let k = 0; k < 4; k++) {
      const f = VF.schwa[k] * fs;
      const r = mk(bq(ctx, "lowpass", f, qdb(f, k)));
      res.push(r);
      if (prev) prev.connect(r);
      prev = r;
    }
    vG.connect(res[0]);
    aG.connect(res[0]);
    const frF = mk(bq(ctx, "bandpass", 5000, 2));
    const frG = mk(ctx.createGain());
    frG.gain.value = 0;
    nz.connect(frF);
    frF.connect(frG);
    const lipRad = mk(bq(ctx, "highshelf", 1200, 0.7, 6));
    const warm = mk(bq(ctx, "lowshelf", 220, 0.7, V.warmth));
    const hp = mk(bq(ctx, "highpass", 90, 0.7));
    const pres = mk(bq(ctx, "peaking", 2800, 1.1, 4)); // singer's formant / ribbon-mic presence
    const out = mk(ctx.createGain());
    out.gain.value =
      (opts.gain === undefined ? 1 : opts.gain) * V.gain * NORM * SING_NORM;
    res[3].connect(lipRad);
    frG.connect(lipRad);
    lipRad.connect(warm);
    warm.connect(hp);
    hp.connect(pres);
    pres.connect(out);
    if (opts.delay) {
      const dl = mk(ctx.createDelay(0.2));
      dl.delayTime.value = opts.delay;
      out.connect(dl);
      dl.connect(dest);
    } else out.connect(dest);
    [osc, vib, jit, nz].forEach((s) =>
      s.start(t0, s === nz || s === jit ? Math.random() * 2 : 0),
    );

    const lastF = VF.schwa.map((f) => f * fs);
    let cursor = t0,
      lastPitch = 0,
      voiced = false,
      voicedUntil = 0,
      vibCursor = t0,
      disposed = false;
    const setF = (Fv, tt, tr) => {
      for (let k = 0; k < 4; k++) {
        const f = Math.min(Fv[k] * fs, 4800);
        res[k].frequency.setValueAtTime(lastF[k], tt);
        res[k].frequency.linearRampToValueAtTime(f, tt + tr);
        res[k].Q.setValueAtTime(qdb(lastF[k], k), tt);
        res[k].Q.linearRampToValueAtTime(qdb(f, k), tt + tr);
        lastF[k] = f;
      }
    };
    /** One consonant segment at ts lasting d (same automation as the speaking voice). */
    const seg = (sg, ts, d) => {
      const tr = Math.min(0.03, d * 0.45),
        tail = ts + d;
      setF(sg.F, ts, tr);
      const va = sg.v * (sg.nasal ? 0.9 : 1);
      vG.gain.linearRampToValueAtTime(
        va,
        ts + (sg.burst ? 0.006 : Math.min(0.016, d * 0.5)),
      );
      vG.gain.setValueAtTime(va, Math.max(ts + 0.002, tail - 0.004));
      aG.gain.linearRampToValueAtTime(sg.a, ts + Math.min(0.012, d * 0.5));
      aG.gain.setValueAtTime(sg.a, Math.max(ts + 0.002, tail - 0.004));
      if (sg.fr) {
        frF.frequency.setValueAtTime(sg.fr[0] * Math.sqrt(fs), ts);
        frF.Q.setValueAtTime(sg.fr[1], ts);
        frG.gain.linearRampToValueAtTime(
          sg.fr[2] * 0.85,
          ts + (sg.burst ? 0.004 : Math.min(0.02, d * 0.5)),
        );
        frG.gain.linearRampToValueAtTime(
          sg.fr[2] * (sg.burst ? 0.3 : 0.85),
          Math.max(ts + 0.005, tail - 0.004),
        );
      } else {
        frG.gain.linearRampToValueAtTime(0, ts + Math.min(0.012, d * 0.5));
        frG.gain.setValueAtTime(0, Math.max(ts + 0.002, tail - 0.004));
      }
    };
    const api = {
      start: t0,
      /** Sing one syllable. The vowel starts at t and the syllable (coda included) ends at t + dur. */
      note(t, dur, midi, syl, vel, o) {
        if (disposed || !syl) return;
        o = o || {};
        vel = vel === undefined ? 1 : vel;
        const f = S.mtof(midi);
        const floor = Math.max(cursor, ctx.currentTime + 0.01);
        if (t + dur <= floor + 0.05) return; // too late to sing this one
        const Fa = VF[syl.v[0]] || VF.schwa,
          Fb = syl.v.length > 1 ? VF[syl.v[1]] || null : null;
        const onS = consSegs(syl.on, Fa),
          coS = consSegs(syl.co, Fb || Fa);
        const onD = onS.reduce((a, s) => a + s.d, 0);
        let start = t - onD,
          k = 1;
        if (start < floor) {
          k =
            onD > 0 ? Math.max(0.35, Math.min(1, (t + 0.03 - floor) / onD)) : 1;
          start = floor;
        }
        const legato =
          voiced && start - voicedUntil < 0.07 && o.legato !== false;
        // anchors (continuity with what is already scheduled)
        const fq = osc.frequency;
        vG.gain.setValueAtTime(legato ? api._lastV || 0 : 0, start);
        aG.gain.setValueAtTime(0, start);
        frG.gain.setValueAtTime(0, start);
        // a quick in-breath before a phrase
        if (o.breath && !voiced && start - floor > 0.32) {
          const bt = start - 0.3;
          for (let q = 0; q < 4; q++) {
            lastF[q] = VF.ae[q] * fs * (q ? 1.1 : 1);
            res[q].frequency.setValueAtTime(lastF[q], bt);
            res[q].Q.setValueAtTime(qdb(lastF[q], q), bt);
          }
          aG.gain.setValueAtTime(0, bt);
          aG.gain.linearRampToValueAtTime(0.05 + V.breath, bt + 0.12);
          aG.gain.linearRampToValueAtTime(0, bt + 0.26);
          aG.gain.setValueAtTime(0, start);
        }
        // pitch: portamento between legato notes, a crooner's scoop into detached ones
        if (legato && lastPitch) {
          fq.setValueAtTime(lastPitch, start);
          fq.linearRampToValueAtTime(f, Math.max(start + 0.02, t + 0.06));
        } else {
          fq.setValueAtTime(f * (o.scoop === false ? 1 : V.scoop), start);
          fq.linearRampToValueAtTime(f, t + (o.scoop === false ? 0.02 : 0.09));
        }
        // onset consonants
        let tt = start;
        for (const sg of onS) {
          const d = sg.d * k;
          seg(sg, tt, d);
          tt += d;
        }
        // vowel
        const end = t + dur;
        const coD0 = coS.reduce((a, s) => a + s.d, 0);
        const kc = coD0 > 0 ? Math.min(1, (dur * 0.35) / coD0) : 1;
        const vs = Math.max(tt, t - 0.01),
          vEnd = Math.max(vs + 0.05, end - coD0 * kc);
        const vl = vEnd - vs;
        setF(Fa, vs, Math.min(0.05, vl * 0.3));
        if (Fb)
          setF(Fb, vEnd - Math.min(0.14, vl * 0.35), Math.min(0.12, vl * 0.3));
        const v1 = vel * (syl.stressed ? 1 : 0.9);
        vG.gain.linearRampToValueAtTime(v1, vs + 0.035);
        if (vl > 0.6)
          vG.gain.linearRampToValueAtTime(v1 * 1.1, vEnd - 0.05); // held notes swell a little
        else vG.gain.setValueAtTime(v1, Math.max(vs + 0.036, vEnd - 0.004));
        aG.gain.linearRampToValueAtTime(V.breath, vs + 0.03);
        aG.gain.setValueAtTime(V.breath, Math.max(vs + 0.031, vEnd - 0.004));
        frG.gain.linearRampToValueAtTime(0, vs + 0.012);
        // vibrato blooms late on held notes
        const vb = Math.max(vs, vibCursor);
        vibG.gain.setValueAtTime(0, vb);
        if (vl > 0.32) {
          vibG.gain.setValueAtTime(0, vb + 0.14);
          vibG.gain.linearRampToValueAtTime(
            f * V.vib[1] * (o.vib || 1),
            Math.max(vb + 0.15, Math.min(vEnd, vb + 0.55)),
          );
          vibG.gain.setValueAtTime(
            f * V.vib[1] * (o.vib || 1),
            Math.max(vb + 0.16, vEnd),
          );
        }
        vibG.gain.linearRampToValueAtTime(0, Math.max(vb + 0.17, vEnd + 0.05));
        vibCursor = Math.max(vb + 0.18, vEnd + 0.06);
        // coda consonants
        tt = vEnd;
        for (const sg of coS) {
          const d = sg.d * kc;
          seg(sg, tt, d);
          tt += d;
        }
        const last = coS.length ? coS[coS.length - 1] : null;
        api._lastV = last ? last.v : v1;
        if (o.legato) {
          voiced = true;
          voicedUntil = tt;
          cursor = tt;
        } else {
          // release: a short jazz fall-off at phrase ends, then silence
          if (o.fall) fq.linearRampToValueAtTime(f * 0.93, tt + 0.1);
          vG.gain.linearRampToValueAtTime(0, tt + 0.07);
          aG.gain.linearRampToValueAtTime(0, tt + 0.05);
          frG.gain.linearRampToValueAtTime(0, tt + 0.03);
          voiced = false;
          voicedUntil = tt;
          cursor = tt + 0.1;
          api._lastV = 0;
        }
        lastPitch = f;
      },
      /** Stop singing and free the graph. */
      dispose(fade) {
        if (disposed) return;
        disposed = true;
        const t = ctx.currentTime,
          f = fade === undefined ? 0.1 : fade;
        try {
          out.gain.cancelScheduledValues(t);
          out.gain.setValueAtTime(out.gain.value, t);
          out.gain.linearRampToValueAtTime(0, t + f);
        } catch (e) {
          /* */
        }
        [osc, vib, jit, nz].forEach((s) => {
          try {
            s.stop(t + f + 0.05);
          } catch (e) {
            /* */
          }
        });
        setTimeout(
          () => {
            nodes.forEach((n) => {
              try {
                n.disconnect();
              } catch (e) {
                /* */
              }
            });
          },
          (f + 0.4) * 1000,
        );
      },
    };
    return api;
  }

  /** How long a syllable's onset consonants take (the composer shortens the previous legato note by it). */
  function onsetDur(syl) {
    return syl
      ? consSegs(syl.on, VF[syl.v[0]] || VF.schwa).reduce(
          (a, sg) => a + sg.d,
          0,
        )
      : 0;
  }

  // ==================================================================
  // VOX 2 — a sample-level cascade/parallel formant synthesiser (Klatt
  // 1980 / KLGLOTT88 lineage) with a real phonetic front end:
  //   · pronouncing LEXICON (ARPAbet, ~1,500 on-air words) + suffix
  //     stripping + the old spelling rules as a fallback,
  //   · Klatt's segmental DURATION rules (phrase-final lengthening,
  //     polysyllabic / non-final / unstressed shortening, post-vocalic
  //     voicing, clusters) on inherent/minimum durations per phone,
  //   · locus-equation FORMANT TRANSITIONS (place-dependent coarticulation,
  //     abrupt nasal/stop boundaries, smooth glides, velar pinch, vowel
  //     nasalisation before nasals),
  //   · stops as closure (voice bar) → place-shaped burst → aspiration
  //     whose formants are already moving into the vowel (VOT),
  //   · a glottal-flow-derivative source with open quotient, spectral
  //     tilt, jitter/shimmer, pitch-synchronous breath and phrase-final fry.
  // Every line is planned in JS (5 ms parameter frames) and rendered in
  // short chunks cut at silent frames, just ahead of the audio clock
  // (≈ 0.5 ms of main-thread time per 100 ms of speech at 16 kHz), then
  // played as AudioBuffers through the same mic EQ → station AM chain.
  // ==================================================================
  const VSR = 16000,
    HOP = 80,
    FR = HOP / VSR; // 16 kHz render (the AM chain cuts at ~3.6 kHz), 5 ms frames
  const NP = 21;
  const iF0 = 0,
    iAV = 1,
    iAVS = 2,
    iAH = 3,
    iAF = 4,
    iF1 = 5,
    iF2 = 6,
    iF3 = 7,
    iF4 = 8,
    iB1 = 9,
    iB2 = 10,
    iB3 = 11,
    iFNZ = 12,
    iA2 = 13,
    iA3 = 14,
    iA4 = 15,
    iA5 = 16,
    iA6 = 17,
    iAB = 18,
    iTL = 19,
    iFRY = 20;

  // Phone table. c: V vowel, D diphthong, G glide/liquid, N nasal, F fricative, S stop, A affricate, H aspirate, X flap.
  // F/B: F1-F3 & bandwidths (adult male); F2t: diphthong end target; di/dm: inherent/minimum duration (ms);
  // pl: place (lab, den, alv, pal, vel, glot); vc: voiced; par: frication spectrum [A2,A3,A4,A5,A6,AB]; af: frication level.
  const KP = {
    IY: { c: "V", F: [310, 2020, 2960], B: [45, 200, 400], di: 155, dm: 55 },
    IH: { c: "V", F: [400, 1800, 2570], B: [50, 100, 140], di: 135, dm: 40 },
    EY: {
      c: "D",
      F: [480, 1720, 2520],
      F2t: [330, 2020, 2600],
      B: [70, 100, 200],
      di: 190,
      dm: 70,
    },
    EH: { c: "V", F: [530, 1680, 2500], B: [60, 90, 200], di: 150, dm: 70 },
    AE: { c: "V", F: [620, 1660, 2430], B: [70, 150, 320], di: 230, dm: 80 },
    AA: { c: "V", F: [700, 1220, 2600], B: [130, 70, 160], di: 240, dm: 100 },
    AO: { c: "V", F: [600, 990, 2570], B: [90, 100, 80], di: 240, dm: 100 },
    AH: { c: "V", F: [620, 1220, 2550], B: [80, 50, 140], di: 140, dm: 60 },
    AX: { c: "V", F: [500, 1400, 2450], B: [80, 60, 160], di: 120, dm: 60 },
    OW: {
      c: "D",
      F: [540, 1100, 2300],
      F2t: [450, 900, 2300],
      B: [80, 70, 70],
      di: 220,
      dm: 80,
    },
    UH: { c: "V", F: [450, 1100, 2350], B: [80, 100, 80], di: 160, dm: 60 },
    UW: {
      c: "D",
      F: [350, 1250, 2200],
      F2t: [320, 900, 2200],
      B: [65, 110, 140],
      di: 210,
      dm: 70,
    },
    ER: { c: "V", F: [470, 1270, 1540], B: [100, 60, 110], di: 180, dm: 80 },
    AXR: { c: "V", F: [460, 1300, 1640], B: [100, 60, 110], di: 120, dm: 60 },
    AY: {
      c: "D",
      F: [660, 1200, 2550],
      F2t: [400, 1880, 2500],
      B: [100, 70, 200],
      di: 250,
      dm: 150,
    },
    AW: {
      c: "D",
      F: [640, 1230, 2550],
      F2t: [420, 940, 2350],
      B: [80, 70, 140],
      di: 240,
      dm: 100,
    },
    OY: {
      c: "D",
      F: [550, 960, 2400],
      F2t: [360, 1820, 2450],
      B: [60, 50, 130],
      di: 280,
      dm: 150,
    },
    W: {
      c: "G",
      F: [290, 610, 2150],
      B: [50, 80, 60],
      di: 80,
      dm: 60,
      pl: "lab",
      vc: 1,
    },
    Y: {
      c: "G",
      F: [260, 2070, 3020],
      B: [40, 250, 500],
      di: 80,
      dm: 40,
      pl: "pal",
      vc: 1,
    },
    R: {
      c: "G",
      F: [310, 1060, 1380],
      B: [70, 100, 120],
      di: 80,
      dm: 30,
      pl: "pal",
      vc: 1,
    },
    L: {
      c: "G",
      F: [310, 1050, 2880],
      B: [50, 100, 280],
      di: 80,
      dm: 40,
      pl: "alv",
      vc: 1,
    },
    M: {
      c: "N",
      F: [480, 1270, 2130],
      B: [40, 200, 200],
      di: 70,
      dm: 60,
      pl: "lab",
      vc: 1,
    },
    N: {
      c: "N",
      F: [480, 1340, 2470],
      B: [40, 300, 300],
      di: 60,
      dm: 50,
      pl: "alv",
      vc: 1,
    },
    NG: {
      c: "N",
      F: [480, 2000, 2900],
      B: [160, 150, 200],
      di: 95,
      dm: 60,
      pl: "vel",
      vc: 1,
    },
    F: {
      c: "F",
      F: [340, 1100, 2080],
      B: [200, 120, 150],
      di: 100,
      dm: 80,
      pl: "lab",
      af: 0.4,
      par: [0, 0, 0.1, 0.2, 0.35, 0.55],
    },
    V: {
      c: "F",
      F: [220, 1100, 2080],
      B: [60, 90, 120],
      di: 60,
      dm: 40,
      pl: "lab",
      vc: 1,
      af: 0.35,
      par: [0, 0, 0.1, 0.2, 0.3, 0.45],
    },
    TH: {
      c: "F",
      F: [320, 1290, 2540],
      B: [200, 90, 200],
      di: 90,
      dm: 60,
      pl: "den",
      af: 0.35,
      par: [0, 0, 0.1, 0.25, 0.4, 0.45],
    },
    DH: {
      c: "F",
      F: [270, 1290, 2540],
      B: [60, 80, 170],
      di: 50,
      dm: 30,
      pl: "den",
      vc: 1,
      af: 0.3,
      par: [0, 0, 0.1, 0.2, 0.3, 0.35],
    },
    S: {
      c: "F",
      F: [320, 1390, 2530],
      B: [200, 80, 200],
      di: 105,
      dm: 60,
      pl: "alv",
      af: 1,
      par: [0, 0, 0.3, 0.6, 1, 0],
    },
    Z: {
      c: "F",
      F: [240, 1390, 2530],
      B: [70, 60, 180],
      di: 75,
      dm: 40,
      pl: "alv",
      vc: 1,
      af: 0.6,
      par: [0, 0, 0.25, 0.5, 0.9, 0],
    },
    SH: {
      c: "F",
      F: [300, 1840, 2750],
      B: [200, 100, 300],
      di: 105,
      dm: 80,
      pl: "pal",
      af: 1,
      par: [0, 1, 0.75, 0.55, 0.3, 0],
    },
    ZH: {
      c: "F",
      F: [290, 1840, 2750],
      B: [70, 60, 280],
      di: 70,
      dm: 40,
      pl: "pal",
      vc: 1,
      af: 0.7,
      par: [0, 0.9, 0.7, 0.5, 0.25, 0],
    },
    HH: { c: "H", di: 80, dm: 20, pl: "glot" },
    P: {
      c: "S",
      F: [200, 900, 2150],
      B: [300, 150, 220],
      di: 85,
      dm: 50,
      pl: "lab",
      burst: [0.35, 0.2, 0.15, 0.1, 0.1, 0.55],
    },
    B: {
      c: "S",
      F: [200, 900, 2150],
      B: [60, 110, 130],
      di: 85,
      dm: 60,
      pl: "lab",
      vc: 1,
      burst: [0.3, 0.15, 0.1, 0.05, 0.05, 0.4],
    },
    T: {
      c: "S",
      F: [200, 1700, 2600],
      B: [300, 150, 250],
      di: 75,
      dm: 50,
      pl: "alv",
      burst: [0, 0.2, 0.45, 0.8, 1, 0],
    },
    D: {
      c: "S",
      F: [200, 1700, 2600],
      B: [60, 100, 170],
      di: 75,
      dm: 50,
      pl: "alv",
      vc: 1,
      burst: [0, 0.2, 0.4, 0.6, 0.7, 0],
    },
    K: {
      c: "S",
      F: [200, 1850, 2350],
      B: [300, 150, 250],
      di: 80,
      dm: 60,
      pl: "vel",
      burst: [0.9, 0.7, 0.3, 0.15, 0.1, 0],
    },
    G: {
      c: "S",
      F: [200, 1850, 2350],
      B: [60, 100, 150],
      di: 80,
      dm: 60,
      pl: "vel",
      vc: 1,
      burst: [0.8, 0.6, 0.25, 0.1, 0.05, 0],
    },
    CH: {
      c: "A",
      F: [200, 1840, 2750],
      B: [300, 150, 250],
      di: 70,
      dm: 50,
      pl: "pal",
      af: 1,
      par: [0, 1, 0.75, 0.55, 0.3, 0],
      burst: [0, 1, 0.7, 0.5, 0.3, 0],
    },
    JH: {
      c: "A",
      F: [200, 1840, 2750],
      B: [60, 100, 170],
      di: 70,
      dm: 50,
      pl: "pal",
      vc: 1,
      af: 0.7,
      par: [0, 0.9, 0.7, 0.5, 0.25, 0],
      burst: [0, 0.8, 0.6, 0.4, 0.2, 0],
    },
    DX: {
      c: "X",
      F: [300, 1700, 2600],
      B: [60, 100, 170],
      di: 30,
      dm: 20,
      pl: "alv",
      vc: 1,
    },
  };
  const SON = { V: 1, D: 1, G: 1, X: 1 };
  // locus-equation slopes per place: boundary = locus + k·(vowel − locus)  [F1, F2, F3]
  const KLOC = {
    lab: [0.25, 0.65, 0.6],
    den: [0.25, 0.5, 0.5],
    alv: [0.25, 0.42, 0.5],
    pal: [0.3, 0.5, 0.55],
    vel: [0.25, 0.8, 0.6],
    glot: [1, 1, 1],
  };
  // ARPAbet → the singer's vowel names (so sung lyrics use the lexicon too)
  const ARPA_SING = {
    IY: ["i"],
    IH: ["ih"],
    EY: ["e", "ih"],
    EH: ["e"],
    AE: ["ae"],
    AA: ["a"],
    AO: ["aw"],
    AH: ["uh"],
    AX: ["schwa"],
    OW: ["o", "uu"],
    UH: ["uu"],
    UW: ["oo"],
    ER: ["er"],
    AXR: ["er"],
    AY: ["a", "ih"],
    AW: ["a", "uu"],
    OY: ["o", "ih"],
  };
  const OLD_V = {
    i: "IY",
    ih: "IH",
    e: "EH",
    ae: "AE",
    a: "AA",
    aw: "AO",
    o: "AO",
    uh: "AH",
    oo: "UW",
    uu: "UH",
    er: "ER",
    schwa: "AX",
  };
  const OLD_D = {
    "e-ih": "EY",
    "a-ih": "AY",
    "a-i": "AY",
    "a-uu": "AW",
    "o-uu": "OW",
    "o-ih": "OY",
    "o-uu ": "OW",
  };

  // ------------------------------------------------------------------
  // Pronunciation: lexicon → suffix stripping → spelling rules
  // ------------------------------------------------------------------
  let LEX = null;
  function lex() {
    if (LEX) return LEX;
    LEX = Object.create(null);
    const src = S.voxLexicon || "";
    for (const line of src.split("\n")) {
      const i = line.indexOf(" ");
      if (i < 1) continue;
      LEX[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    return LEX;
  }
  /** ARPAbet string ("HH AH0 L OW1") → [{p, st}] (st: -1 consonant, 0/1/2 vowel stress). AH0 → AX, ER0 → AXR. */
  function parseArpa(s) {
    return s
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => {
        const m = /^([A-Z]+)([012])?$/.exec(t.toUpperCase());
        if (!m) return null;
        let p = m[1];
        const st = m[2] === undefined ? -1 : +m[2];
        if (p === "AH" && st === 0) p = "AX";
        else if (p === "ER" && st === 0) p = "AXR";
        return KP[p]
          ? {
              p,
              st: KP[p].c === "V" || KP[p].c === "D" ? (st < 0 ? 1 : st) : -1,
            }
          : null;
      })
      .filter(Boolean);
  }
  /** Old spelling-rule phones → ARPAbet list (first nucleus stressed unless a prefix takes it). */
  function fromRules(w) {
    const ph = wordPhones(w),
      out = [];
    let nv = 0;
    const nvTot = ph.filter((p) => p.k !== "C").length;
    const stressIdx =
      nvTot >= 2 &&
      /^(be|re|de|a|con|pro|com|in|un|en|ex|dis)/.test(w) &&
      w.length > 4
        ? 1
        : 0;
    for (const p of ph) {
      if (p.k === "C") {
        out.push({ p: p.p === "H" ? "HH" : p.p, st: -1 });
        continue;
      }
      const st = nv === stressIdx ? 1 : 0;
      nv++;
      if (p.k === "D") {
        const key = p.v.join("-");
        if (key === "ih-oo") {
          out.push({ p: "Y", st: -1 });
          out.push({ p: "UW", st });
          continue;
        }
        out.push({ p: OLD_D[key] || OLD_V[p.v[0]] || "AX", st });
      } else
        out.push({
          p: st
            ? OLD_V[p.v[0]] || "AX"
            : p.v[0] === "schwa" || p.v[0] === "uh"
              ? "AX"
              : OLD_V[p.v[0]] || "AX",
          st,
        });
    }
    // unstressed short vowels reduce to schwa; silent h after a vowel ("sarah", "john"); "chr"/"chl" = K
    for (let i = 0; i < out.length; i++) {
      const x = out[i];
      if (
        x.st === 0 &&
        (x.p === "AE" ||
          x.p === "AA" ||
          x.p === "EH" ||
          x.p === "AH" ||
          x.p === "AO")
      )
        x.p = "AX";
      if (
        x.p === "HH" &&
        i > 0 &&
        out[i - 1].st >= 0 &&
        !(out[i + 1] && out[i + 1].st >= 0)
      ) {
        out.splice(i, 1);
        i--;
      }
    }
    if (/^ch[rl]/.test(w) && out[0] && out[0].p === "T")
      out.splice(0, 2, { p: "K", st: -1 });
    // fold T SH → CH, D ZH → JH
    for (let i = 0; i < out.length - 1; i++) {
      if (out[i].p === "T" && out[i + 1].p === "SH")
        out.splice(i, 2, { p: "CH", st: -1 });
      else if (out[i].p === "D" && out[i + 1].p === "ZH")
        out.splice(i, 2, { p: "JH", st: -1 });
    }
    return out;
  }
  const VOICELESS = {
    P: 1,
    T: 1,
    K: 1,
    F: 1,
    TH: 1,
    S: 1,
    SH: 1,
    CH: 1,
    HH: 1,
  };
  /** Word → [{p, st}] */
  function pron(word) {
    const L = lex();
    let w = word.toLowerCase().replace(/[^a-z']/g, "");
    if (!w) return [];
    if (L[w]) return parseArpa(L[w]);
    const w0 = w.replace(/'/g, "");
    if (L[w0]) return parseArpa(L[w0]);
    // contractions & suffixes on a known stem
    const tryStem = (stem, add) => {
      if (!stem || stem.length < 2) return null;
      const cands = [
        stem,
        stem + "e",
        stem.endsWith("i") ? stem.slice(0, -1) + "y" : null,
        stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]
          ? stem.slice(0, -1)
          : null,
      ];
      for (const c of cands)
        if (c && L[c]) {
          const b = parseArpa(L[c]);
          return add(b);
        }
      return null;
    };
    const last = (b) => (b.length ? b[b.length - 1].p : "");
    const sfx = [
      [
        "'s",
        (b) =>
          b.concat(
            sibil(last(b))
              ? [
                  { p: "IH", st: 0 },
                  { p: "Z", st: -1 },
                ]
              : [{ p: VOICELESS[last(b)] ? "S" : "Z", st: -1 }],
          ),
      ],
      [
        "n't",
        (b) =>
          b.concat([
            { p: "AX", st: 0 },
            { p: "N", st: -1 },
            { p: "T", st: -1 },
          ]),
      ],
      ["'ll", (b) => b.concat([{ p: "L", st: -1 }])],
      ["'re", (b) => b.concat([{ p: "R", st: -1 }])],
      ["'ve", (b) => b.concat([{ p: "V", st: -1 }])],
      ["'d", (b) => b.concat([{ p: "D", st: -1 }])],
      ["'m", (b) => b.concat([{ p: "M", st: -1 }])],
      ["ies", (b) => b.concat([{ p: "Z", st: -1 }])],
      [
        "es",
        (b) =>
          b.concat(
            sibil(last(b))
              ? [
                  { p: "IH", st: 0 },
                  { p: "Z", st: -1 },
                ]
              : [{ p: VOICELESS[last(b)] ? "S" : "Z", st: -1 }],
          ),
      ],
      [
        "s",
        (b) =>
          b.concat(
            sibil(last(b))
              ? [
                  { p: "IH", st: 0 },
                  { p: "Z", st: -1 },
                ]
              : [{ p: VOICELESS[last(b)] ? "S" : "Z", st: -1 }],
          ),
      ],
      [
        "ed",
        (b) =>
          b.concat(
            last(b) === "T" || last(b) === "D"
              ? [
                  { p: "IH", st: 0 },
                  { p: "D", st: -1 },
                ]
              : [{ p: VOICELESS[last(b)] ? "T" : "D", st: -1 }],
          ),
      ],
      [
        "ing",
        (b) =>
          b.concat([
            { p: "IH", st: 0 },
            { p: "NG", st: -1 },
          ]),
      ],
      [
        "in",
        (b) =>
          b.concat([
            { p: "IH", st: 0 },
            { p: "N", st: -1 },
          ]),
      ],
      [
        "ly",
        (b) =>
          b.concat([
            { p: "L", st: -1 },
            { p: "IY", st: 0 },
          ]),
      ],
      [
        "ily",
        (b) =>
          b.concat([
            { p: "IH", st: 0 },
            { p: "L", st: -1 },
            { p: "IY", st: 0 },
          ]),
      ],
      [
        "ers",
        (b) =>
          b.concat([
            { p: "AXR", st: 0 },
            { p: "Z", st: -1 },
          ]),
      ],
      ["er", (b) => b.concat([{ p: "AXR", st: 0 }])],
      [
        "est",
        (b) =>
          b.concat([
            { p: "IH", st: 0 },
            { p: "S", st: -1 },
            { p: "T", st: -1 },
          ]),
      ],
      [
        "ness",
        (b) =>
          b.concat([
            { p: "N", st: -1 },
            { p: "AX", st: 0 },
            { p: "S", st: -1 },
          ]),
      ],
      [
        "ful",
        (b) =>
          b.concat([
            { p: "F", st: -1 },
            { p: "AX", st: 0 },
            { p: "L", st: -1 },
          ]),
      ],
      [
        "less",
        (b) =>
          b.concat([
            { p: "L", st: -1 },
            { p: "AX", st: 0 },
            { p: "S", st: -1 },
          ]),
      ],
      [
        "ment",
        (b) =>
          b.concat([
            { p: "M", st: -1 },
            { p: "AX", st: 0 },
            { p: "N", st: -1 },
            { p: "T", st: -1 },
          ]),
      ],
      ["y", (b) => b.concat([{ p: "IY", st: 0 }])],
      [
        "able",
        (b) =>
          b.concat([
            { p: "AX", st: 0 },
            { p: "B", st: -1 },
            { p: "AX", st: 0 },
            { p: "L", st: -1 },
          ]),
      ],
    ];
    for (const [suf, add] of sfx) {
      if (w.length > suf.length + 1 && w.endsWith(suf)) {
        const r = tryStem(w.slice(0, -suf.length).replace(/'$/, ""), add);
        if (r) return r;
      }
    }
    // compounds: two known halves ("rooftop", "somebody", "gunfire")
    for (let i = 3; i <= w0.length - 3; i++) {
      const a = w0.slice(0, i),
        b = w0.slice(i);
      if (L[a] && L[b]) {
        const pb = parseArpa(L[b]).map((x) =>
          x.st === 1 ? { p: x.p, st: 2 } : x,
        );
        return parseArpa(L[a]).concat(pb);
      }
    }
    // names: common English name endings on a spelled stem, stress on the first syllable ("Pemberton", "Hollisville")
    for (const [suf, arpa] of PN_END) {
      if (w0.length >= suf.length + 3 && w0.endsWith(suf)) {
        const stem = w0.slice(0, -suf.length);
        const sp = L[stem] ? parseArpa(L[stem]) : fromRules(stem);
        if (sp.some((x) => x.st >= 0) || /[aeiouy]/.test(stem)) {
          let first = true;
          const r = sp
            .map((x) => {
              if (x.st < 0) return x;
              const o = { p: x.p, st: first ? 1 : x.st === 1 ? 2 : x.st };
              first = false;
              return o;
            })
            .concat(parseArpa(arpa));
          r.rules = true;
          return r;
        }
      }
    }
    const r = fromRules(w0);
    r.rules = true;
    return r;
  }
  const PN_END = [
    ["ington", "IH0 NG T AH0 N"],
    ["ton", "T AH0 N"],
    ["town", "T AW2 N"],
    ["ville", "V IH2 L"],
    ["son", "S AH0 N"],
    ["sen", "S AH0 N"],
    ["berg", "B ER0 G"],
    ["burg", "B ER0 G"],
    ["ford", "F ER0 D"],
    ["field", "F IY2 L D"],
    ["wood", "W UH2 D"],
    ["land", "L AH0 N D"],
    ["stein", "S T AY2 N"],
    ["man", "M AH0 N"],
    ["ley", "L IY0"],
    ["ski", "S K IY0"],
    ["sky", "S K IY0"],
    ["worth", "W ER0 TH"],
    ["shire", "SH ER0"],
    ["bury", "B EH2 R IY0"],
    ["dale", "D EY2 L"],
    ["more", "M AO2 R"],
    ["wick", "W IH0 K"],
    ["well", "W EH2 L"],
  ];
  /** Words of `text` the lexicon doesn't cover (they fall back to spelling rules): for coverage checks. */
  function unknownWords(text) {
    const out = new Set();
    for (const ph of phrases(text))
      for (const w of ph.words) {
        const r = pron(w);
        if (r.rules) out.add(w);
      }
    return Array.from(out);
  }
  function sibil(p) {
    return (
      p === "S" ||
      p === "Z" ||
      p === "SH" ||
      p === "ZH" ||
      p === "CH" ||
      p === "JH"
    );
  }

  // ------------------------------------------------------------------
  // Planning: text → segments with durations → 5 ms parameter frames
  // ------------------------------------------------------------------
  // Weak (reduced) forms of function words inside a phrase — what a fast announcer actually says.
  const WEAK = {
    a: "AH0",
    an: "AH0 N",
    and: "AH0 N",
    the: "DH AH0",
    to: "T AH0",
    of: "AH0 V",
    for: "F ER0",
    from: "F R AH0 M",
    at: "AH0 T",
    can: "K AH0 N",
    was: "W AH0 Z",
    are: "ER0",
    your: "Y ER0",
    you: "Y UH0",
    them: "DH AH0 M",
    have: "HH AH0 V",
    has: "HH AH0 Z",
    had: "HH AH0 D",
    will: "W AH0 L",
    but: "B AH0 T",
    or: "ER0",
    as: "AH0 Z",
    some: "S AH0 M",
    there: "DH ER0",
    been: "B IH0 N",
    could: "K UH0 D",
    would: "W UH0 D",
    should: "SH UH0 D",
    just: "JH AH0 S T",
    her: "HH ER0",
    us: "AH0 S",
    than: "DH AH0 N",
    do: "D UH0",
    does: "D AH0 Z",
    were: "W ER0",
    into: "IH0 N T UH0",
    my: "M AY0",
    by: "B AY0",
  };
  const WEAK_V = { and: "AH0 N D", the: "DH IY0", to: "T UH0" }; // before a vowel
  const WH = new Set([
    "what",
    "who",
    "where",
    "when",
    "why",
    "how",
    "which",
    "whose",
  ]);
  /** Build the segment list of one phrase (Klatt duration rules + connected-speech processes). */
  function segPhrase(ph, P, rnd) {
    let segs = [];
    const nw = ph.words.length;
    const emphW = ph.emph || [];
    const prons = ph.words.map((w) => pron(w));
    ph.words.forEach((w, wi) => {
      const func = FUNC.has(w.replace(/'/g, "'")) && nw > 1;
      let pr = prons[wi];
      // weak forms inside the phrase (never phrase-final or emphasised: "what are you *for*?")
      if (func && wi < nw - 1 && !emphW[wi] && WEAK[w]) {
        const nx = prons[wi + 1] && prons[wi + 1][0];
        const vNext = nx && nx.st >= 0;
        pr = parseArpa(vNext && WEAK_V[w] ? WEAK_V[w] : WEAK[w]);
      }
      const nuc = pr.filter((x) => x.st >= 0).length;
      let vi = 0;
      pr.forEach((x, pi) => {
        const k = KP[x.p];
        const isV = x.st >= 0;
        const st = isV ? (func ? 0 : x.st) : -1;
        segs.push({
          p: x.p,
          k,
          st,
          w: wi,
          func,
          emph: !!emphW[wi],
          wInit: pi === 0,
          wFin: pi === pr.length - 1,
          vi: isV ? vi : -1,
          nucW: nuc,
          lastWord: wi === nw - 1,
        });
        if (isV) vi++;
      });
    });
    // connected speech: geminates across a word boundary merge ("this sound", "big game")
    for (let i = 0; i < segs.length - 1; i++) {
      const s = segs[i],
        n = segs[i + 1];
      if (s.st < 0 && n.st < 0 && s.p === n.p && s.w !== n.w) {
        s.gem = true;
        s.wFin = true;
        segs.splice(i + 1, 1);
      }
    }
    // American flapping: t/d between a vowel (or r) and an unstressed vowel ("better", "got a", "city")
    for (let i = 1; i < segs.length - 1; i++) {
      const s = segs[i],
        pv = segs[i - 1],
        nx = segs[i + 1];
      if (
        (s.p === "T" || s.p === "D") &&
        (pv.st >= 0 || pv.p === "R") &&
        nx.st === 0 &&
        (!s.wInit || s.func) &&
        !(
          segs[i + 2] &&
          segs[i + 2].p === "N" &&
          segs[i + 2].w === nx.w &&
          segs[i + 2].wFin
        )
      ) {
        s.p = "DX";
        s.k = KP.DX;
      }
    }
    // syllable of each segment: consonants belong to the next nucleus in the word, trailing ones to the last
    let nucLeft = 0;
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i];
      if (s.st >= 0) nucLeft = s.vi;
      s.syl = s.st >= 0 ? s.vi : nucLeft;
    }
    // phrase-final syllable: from the last nucleus of the last word to the end
    let lastNuc = -1;
    for (let i = segs.length - 1; i >= 0; i--)
      if (segs[i].st >= 0 && segs[i].lastWord) {
        lastNuc = i;
        break;
      }
    const fast = P.patter ? 1 - P.patter : 1;
    // durations
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i],
        k = s.k,
        isV = s.st >= 0;
      const nx = segs[i + 1],
        pv = segs[i - 1];
      let pr = 1;
      const finalSyl =
        lastNuc >= 0 &&
        i >= lastNuc - 0 &&
        s.lastWord &&
        (isV ? i === lastNuc : i > lastNuc);
      if (finalSyl)
        pr *= ph.end === "," ? 1.25 : 1.4; // phrase-final lengthening
      else if (isV) pr *= 0.75; // non-final shortening (gentler than Klatt's 0.6: announcer pace)
      if (isV && s.nucW > 1 && s.vi < s.nucW - 1) pr *= 0.85; // non-word-final syllable
      if (isV && s.nucW > 1) pr *= 0.85; // polysyllabic shortening
      if (!isV && !s.wInit) pr *= 0.85; // non-initial consonant
      if (isV && s.st === 0) pr *= 0.55 * fast;
      else if (!isV && nx && nx.st === 0 && !s.wInit) pr *= 0.75; // unstressed (more so in patter)
      if (s.func) pr *= 0.8 * (P.patter ? fast : 1);
      if (s.emph) pr *= isV && s.st > 0 ? 1.3 : 1.1; // emphasis: the DJ leans on the word
      if (isV && nx && nx.w === s.w) {
        // post-vocalic context (same word)
        const c = nx.k.c;
        if (c === "S" || c === "A") pr *= nx.k.vc ? 1.1 : 0.72;
        else if (c === "F") pr *= nx.k.vc ? 1.2 : 0.9;
        else if (c === "N") pr *= 0.88;
      }
      if (!isV && nx && nx.st < 0 && pv && pv.st < 0)
        pr *= 0.7; // inside a consonant cluster
      else if (
        !isV &&
        ((nx && nx.st < 0 && nx.w === s.w) || (pv && pv.st < 0 && pv.w === s.w))
      )
        pr *= 0.82;
      if (s.gem) pr *= 1.5;
      let d = (k.dm + (k.di - k.dm) * pr) / 1000;
      if (!isV && pr < 0.75) d = Math.max(d * 0.95, (k.dm * 0.7) / 1000);
      s.d = (d / P.rate) * (0.94 + rnd() * 0.12);
      s.final = finalSyl;
    }
    return segs;
  }
  /** Non-verbal vocalisations as segments: laughs, chuckles, Vinnie's "Whoo-ee!", sighs, audible breaths. */
  function vocSegs(kind, P, rnd) {
    const segs = [],
      r = Math.sqrt(P.rate);
    const add = (p, d, o) =>
      segs.push(
        Object.assign(
          {
            p,
            k: KP[p],
            st: KP[p].c === "V" || KP[p].c === "D" ? 1 : -1,
            d: d / r,
            voc: kind,
            vi: 0,
            nucW: 1,
          },
          o || {},
        ),
      );
    if (kind === "laugh") {
      const n = 3 + ((rnd() * 3) | 0);
      for (let i = 0; i < n; i++) {
        add("HH", 0.04 + rnd() * 0.025);
        add(i % 2 ? "AH" : "AE", (i === n - 1 ? 0.14 : 0.07) + rnd() * 0.025, {
          av: 0.78 - i * 0.05,
          ah: 0.32,
          pulse: i,
          np: n,
        });
      }
      add("HH", 0.06, { ah: 0.3 });
    } else if (kind === "chuckle") {
      const n = 2 + ((rnd() * 2) | 0);
      for (let i = 0; i < n; i++) {
        add("HH", 0.035 + rnd() * 0.02);
        add("EH", 0.06 + rnd() * 0.02, {
          av: 0.5 - i * 0.06,
          ah: 0.22,
          pulse: i,
          np: n,
        });
      }
    } else if (kind === "whoop") {
      add("W", 0.07);
      add("UW", 0.15, { av: 1, pulse: 0, np: 2 });
      add("IY", 0.44, { av: 1.08, pulse: 1, np: 2 });
    } else if (kind === "sigh") {
      add("HH", 0.13, { ah: 0.4 });
      add("AA", 0.42, { av: 0.34, ah: 0.45, pulse: 0, np: 1 });
    } else if (kind === "breath") {
      segs.push({ p: "BR", k: { c: "BR" }, st: -1, d: 0.3 + rnd() * 0.1 });
    }
    return segs;
  }

  /** Expand stops/affricates into closure → burst → aspiration sub-segments and time everything. */
  function timeline(phrasesSegs, plans, rate) {
    const out = [];
    let t = 0;
    phrasesSegs.forEach((segs, pi) => {
      const pl = plans[pi];
      if (pl.breath) {
        out.push({ p: "BR", k: { c: "BR" }, t, d: pl.breath, st: -1 });
        t += pl.breath;
      }
      pl.t0 = t;
      segs.forEach((s, i) => {
        const k = s.k,
          nx = segs[i + 1],
          pv = segs[i - 1];
        if (k.c === "S" || k.c === "A") {
          const nxSon = nx && SON[nx.k.c] !== undefined;
          const afterS = pv && pv.p === "S" && pv.w === s.w;
          let asp = 0;
          if (
            !k.vc &&
            k.c === "S" &&
            nx &&
            (nxSon || nx.k.c === "G") &&
            !afterS
          )
            asp = nx.st > 0 ? 0.055 : 0.03;
          else if (k.vc) asp = 0.008;
          // "act", "big deal": the first stop is barely released; phrase-final stops are released (a clear
          // announcer's "that's that." — over AM the release is the only place cue left), a little softer
          const unreleased =
            nx && (s.wFin || nx.w === s.w) && (nx.k.c === "S" || nx.k.c === "A")
              ? 0.45
              : !nx
                ? 0.8
                : 0;
          const burst =
            k.c === "A"
              ? Math.max(0.05, s.d * 0.9)
              : k.pl === "vel"
                ? 0.016
                : k.pl === "alv"
                  ? 0.012
                  : 0.008;
          const cl = Math.max(0.03, s.d - (k.c === "A" ? burst * 0.4 : 0));
          out.push({ p: s.p, k, sub: "cl", t, d: cl, st: -1, src: s });
          t += cl;
          out.push({
            p: s.p,
            k,
            sub: "bu",
            t,
            d: burst,
            st: -1,
            src: s,
            weak: unreleased,
          });
          t += burst;
          if (asp) {
            asp /= rate;
            out.push({
              p: s.p,
              k,
              sub: "as",
              t,
              d: asp,
              st: -1,
              src: s,
              strong: nx && nx.st > 0,
            });
            t += asp;
          }
          return;
        }
        out.push(Object.assign({}, s, { t }));
        t += s.d;
      });
      pl.t1 = t;
      out.push({ p: "PAU", k: { c: "PAU" }, t, d: pl.pause, st: -1 });
      t += pl.pause;
    });
    return { segs: out, dur: t };
  }

  /** Piecewise-linear track builder: add(t, v) in time order; sample(frames) → Float32Array written with stride. */
  function Track() {
    this.t = [];
    this.v = [];
  }
  Track.prototype.add = function (t, v) {
    const n = this.t.length;
    if (n && t < this.t[n - 1]) t = this.t[n - 1];
    this.t.push(t);
    this.v.push(v);
  };
  Track.prototype.fill = function (arr, idx, nF, fa) {
    const T = this.t,
      V = this.v,
      n = T.length;
    let j = 0;
    fa = fa || 0;
    for (let f = fa; f < fa + nF; f++) {
      const t = f * FR;
      while (j < n - 1 && T[j + 1] <= t) j++;
      let v;
      if (!n) v = 0;
      else if (t <= T[0]) v = V[0];
      else if (j >= n - 1) v = V[n - 1];
      else {
        const a = T[j],
          b = T[j + 1];
        v = b > a ? V[j] + ((V[j + 1] - V[j]) * (t - a)) / (b - a) : V[j + 1];
      }
      arr[(f - fa) * NP + idx] = v;
    }
  };

  /** Formant, bandwidth, amplitude and frication tracks for a timed segment list (shared by speech and song). */
  function segTracks(segs, P, tr) {
    const F = [tr[iF1], tr[iF2], tr[iF3]],
      B = [tr[iB1], tr[iB2], tr[iB3]];
    // --- formant targets per segment
    // (speech) vowel undershoot: short unstressed vowels only get part-way to their target (s.red → schwa),
    // short diphthongs glide only part of the way (s.gk)
    const SCH = [500, 1450, 2500];
    const tgt = (s, end) => {
      const k = s.k;
      if (!k.F) return null;
      let T = k.F;
      if (end && k.F2t)
        T =
          s.gk !== undefined && s.gk < 1
            ? [0, 1, 2].map((q) => k.F[q] + (k.F2t[q] - k.F[q]) * s.gk)
            : k.F2t;
      if (s.red > 0) {
        const r = s.red;
        T = [
          T[0] + (SCH[0] - T[0]) * r,
          T[1] + (SCH[1] - T[1]) * r,
          T[2] + (SCH[2] - T[2]) * r * 0.5,
        ];
      }
      return T;
    };
    const nextSon = (i) => {
      for (let j = i + 1; j < segs.length && j < i + 4; j++) {
        const c = segs[j].k.c;
        if (SON[c]) return segs[j];
        if (c === "PAU") return null;
      }
      return null;
    };
    const prevSon = (i) => {
      for (let j = i - 1; j >= 0 && j > i - 4; j--) {
        const c = segs[j].k.c;
        if (SON[c]) return segs[j];
        if (c === "PAU") return null;
      }
      return null;
    };
    // velar locus is fronted before front vowels
    const locus = (s, v) => {
      const L = s.k.F.slice();
      if (s.k.pl === "vel" && v) {
        const f2 = v.k.F[1];
        L[1] = f2 > 1600 ? 2250 : 1500;
        L[2] = f2 > 1600 ? 2700 : 2100;
      }
      return L;
    };
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i],
        c = s.k.c,
        t0 = s.t,
        t1 = s.t + s.d;
      if (c === "PAU" || c === "BR") {
        if (c === "BR") {
          const v = KP.AE.F;
          for (let q = 0; q < 3; q++) {
            F[q].add(t0, v[q] * 1.08);
            F[q].add(t1, v[q] * 1.08);
            B[q].add(t0, 300);
            B[q].add(t1, 300);
          }
        }
        continue;
      }
      if (SON[c]) {
        const Ta = tgt(s, false),
          Tb = tgt(s, true);
        const pv = segs[i - 1],
          nx = segs[i + 1];
        // left boundary
        let tin = Math.min(0.05, s.d * 0.4);
        if (
          pv &&
          pv.k.F &&
          (pv.k.c === "N" ||
            pv.k.c === "F" ||
            pv.k.c === "S" ||
            pv.k.c === "A" ||
            pv.k.c === "X")
        ) {
          const src = pv.k.c === "S" || pv.k.c === "A" ? pv : pv;
          const L = locus(src, s),
            kk = KLOC[src.k.pl] || KLOC.alv;
          // stops: the transition starts at the release (burst/aspiration are transparent), others at the boundary
          const bt = pv.sub === "as" ? pv.t : pv.sub === "bu" ? pv.t : t0;
          for (let q = 0; q < 3; q++)
            F[q].add(bt, (L[q] + kk[q] * (Ta[q] - L[q])) * 1);
          tin = Math.min(
            pv.k.c === "S" || pv.k.c === "A"
              ? 0.05
              : pv.k.c === "N"
                ? 0.045
                : 0.04,
            s.d * 0.5,
          );
        } else if (pv && SON[pv.k.c]) {
          const Tp = tgt(pv, true),
            glide = c === "G" || pv.k.c === "G";
          const w = c === "G" ? 0.75 : pv.k.c === "G" ? 0.25 : 0.5;
          for (let q = 0; q < 3; q++) F[q].add(t0, Tp[q] * w + Ta[q] * (1 - w));
          tin = glide ? Math.min(0.07, s.d * 0.5) : Math.min(0.05, s.d * 0.4);
        } else if (pv && pv.k.c === "H") {
          tin = 0.012;
        }
        // targets (diphthongs glide from 30 % to 85 %)
        let tout = Math.min(0.05, s.d * 0.4);
        // VC transitions carry most of the place cue of a final stop/nasal ("pat/pack/pap", "sun/sum/sung"):
        // ≈ 60 ms into stops, 55 ms into nasals (measured on natural voices), shorter into fricatives
        if (
          nx &&
          (nx.k.c === "N" || nx.k.c === "F" || nx.k.c === "S" || nx.k.c === "A")
        )
          tout = Math.min(
            nx.k.c === "S" || nx.k.c === "A"
              ? 0.06
              : nx.k.c === "N"
                ? 0.055
                : 0.04,
            s.d * 0.5,
          );
        else if (nx && SON[nx.k.c])
          tout = Math.min(
            nx.k.c === "G" || c === "G" ? 0.06 : 0.05,
            s.d * 0.45,
          );
        if (c === "G") {
          tin = Math.min(tin, s.d * 0.35);
          tout = Math.min(tout, s.d * 0.35);
        }
        if (s.k.F2t) {
          const gl = s.glide || [0.3, 0.85],
            a = t0 + Math.max(tin, s.d * gl[0]),
            b = t0 + s.d * gl[1];
          for (let q = 0; q < 3; q++) {
            F[q].add(a, Ta[q]);
            F[q].add(Math.max(a, Math.min(b, t1 - tout * 0.3)), Tb[q]);
          }
        } else {
          const a = t0 + tin,
            b = Math.max(a, t1 - tout);
          for (let q = 0; q < 3; q++) {
            F[q].add(a, Ta[q]);
            F[q].add(b, Ta[q]);
          }
        }
        // right boundary into an obstruent/nasal: move toward its locus
        if (
          nx &&
          nx.k.F &&
          (nx.k.c === "N" ||
            nx.k.c === "F" ||
            nx.k.c === "S" ||
            nx.k.c === "A" ||
            nx.k.c === "X")
        ) {
          const L = locus(nx, s),
            kk = KLOC[nx.k.pl] || KLOC.alv;
          for (let q = 0; q < 3; q++)
            F[q].add(t1 - 0.0005, L[q] + kk[q] * (Tb[q] - L[q]));
        }
        const Bv = s.k.B;
        for (let q = 0; q < 3; q++) {
          B[q].add(t0 + 0.01, Bv[q]);
          B[q].add(t1 - 0.01, Bv[q]);
        }
        continue;
      }
      if (c === "H") {
        // HH: the voiceless onset of the next vowel
        const v = nextSon(i) || prevSon(i);
        const T = v ? tgt(v, false) : KP.AX.F;
        for (let q = 0; q < 3; q++) {
          F[q].add(t0, T[q]);
          F[q].add(t1, T[q]);
          B[q].add(t0, [300, 150, 200][q]);
          B[q].add(t1, [300, 150, 200][q]);
        }
        continue;
      }
      // obstruents & nasals hold their own (locus) values; the vowels carry the transitions
      if (s.sub === "as") {
        // aspiration: widened B1, formants gliding (the next vowel's left anchor sits at the release)
        B[0].add(t0, 250);
        B[0].add(t1, 250);
        B[1].add(t0, 150);
        B[2].add(t0, 220);
        continue;
      }
      if (s.sub === "bu") {
        B[0].add(t0, 250);
        continue;
      }
      const v = nextSon(i) || prevSon(i);
      const L = locus(s, v);
      // coarticulation: the tongue body is already on its way to the vowel during the consonant (anticipatory,
      // ≈ 20 %; nasals 15 %), and inside consonant clusters the tract glides from one consonant to the next
      // (15–20 ms ramps) instead of jumping — clusters like "str", "nd", "ks" no longer click or buzz
      const Vt = v ? tgt(v, false) : null;
      if (Vt) {
        const a = s.k.c === "N" ? 0.15 : 0.2;
        for (let q = 0; q < 3; q++) L[q] += a * (Vt[q] - L[q]);
      }
      const pc = segs[i - 1],
        inCl =
          pc &&
          pc.k &&
          pc.k.F &&
          !SON[pc.k.c] &&
          pc.k.c !== "PAU" &&
          pc.k.c !== "BR" &&
          pc.k.c !== "H" &&
          (pc.src === undefined || pc.src !== s.src);
      const rin = inCl ? Math.min(0.018, s.d * 0.45) : 0.0005;
      for (let q = 0; q < 3; q++) {
        F[q].add(t0 + rin, L[q]);
        F[q].add(Math.max(t0 + rin, t1 - 0.0005), L[q]);
      }
      for (let q = 0; q < 3; q++) {
        B[q].add(t0 + Math.max(0.003, rin), s.k.B[q]);
        B[q].add(t1 - 0.003, s.k.B[q]);
      }
    }
    // --- amplitudes & source parameters
    const AV = tr[iAV],
      AVS = tr[iAVS],
      AH = tr[iAH],
      AF = tr[iAF],
      FNZ = tr[iFNZ],
      TL = tr[iTL],
      FRY = tr[iFRY];
    const PAR = [tr[iA2], tr[iA3], tr[iA4], tr[iA5], tr[iA6], tr[iAB]];
    const setAmp = (trk, t0, t1, v, rin, rout) => {
      trk.add(t0 + Math.min(rin, (t1 - t0) * 0.5), v);
      trk.add(
        Math.max(
          t0 + Math.min(rin, (t1 - t0) * 0.5),
          t1 - Math.min(rout, (t1 - t0) * 0.5),
        ),
        v,
      );
    };
    const br = P.breath;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i],
        c = s.k.c,
        t0 = s.t,
        t1 = s.t + s.d;
      let av = 0,
        avs = 0,
        ah = 0,
        af = 0,
        par = null,
        fnz = 270,
        r = 0.012,
        avsDone = false;
      if (c === "PAU") {
        av = 0;
        r = 0.03;
      } else if (c === "BR") {
        ah = 0.05 + br * 0.5;
        r = 0.08;
      } else if (c === "V" || c === "D") {
        av = s.av !== undefined ? s.av : s.st > 0 ? 1 : s.func ? 0.72 : 0.8;
        ah = s.ah !== undefined ? s.ah : br * Math.min(1, av);
        if (s.final) av *= 0.92;
        if (s.emph && s.st > 0) av *= 1.12;
        FNZ.add(t0 + Math.min(0.03, s.d * 0.3), 270);
        const nx = segs[i + 1];
        if (nx && nx.k.c === "N") {
          FNZ.add(Math.max(t0, t1 - 0.06), 270);
          FNZ.add(t1, 400);
        }
      } else if (c === "G") {
        av = s.p === "W" || s.p === "Y" ? 0.78 : 0.82;
        ah = br * 0.5;
        // after a voiceless stop's release or a voiceless fricative in the same cluster ("play", "tree", "fly", "sweet")
        // the glide starts devoiced: aspiration carries its formants, voicing comes in part-way through
        const pv = segs[i - 1];
        if (
          pv &&
          ((pv.sub === "as" && pv.src && pv.src.w === s.w) ||
            (pv.k.c === "F" && !pv.k.vc && pv.w === s.w))
        ) {
          const tv = t0 + s.d * 0.45;
          AV.add(t0 + 0.003, av * 0.15);
          AV.add(tv, av);
          AV.add(Math.max(tv, t1 - r), av);
          AH.add(t0 + 0.003, 0.34);
          AH.add(tv, ah);
          AH.add(Math.max(tv, t1 - r), ah);
          setAmp(AVS, t0, t1, 0, 0.008, 0.01);
          setAmp(AF, t0, t1, 0, r, r);
          setAmp(FNZ, t0, t1, 270, 0.008, 0.008);
          continue;
        }
      } else if (c === "X") {
        av = 0.55;
        r = 0.006;
      } else if (c === "N") {
        av = 0.78;
        fnz = 450;
        r = 0.008;
      } else if (c === "H") {
        ah = 0.55;
        r = 0.015;
      } else if (c === "F") {
        av = s.k.vc ? 0.3 : 0;
        af = s.k.af;
        par = s.k.par;
        r = 0.02;
        // lip rounding before a rounded vowel/glide lowers the frication ("sue", "shoe", "swing"); spread lips raise it
        const v = nextSon(i);
        if (
          v &&
          (v.p === "UW" ||
            v.p === "OW" ||
            v.p === "UH" ||
            v.p === "AO" ||
            v.p === "W" ||
            v.p === "R" ||
            v.p === "OY")
        )
          par = [
            par[0],
            par[1] * 1.1,
            par[2] * 1.2,
            par[3] * 0.85,
            par[4] * 0.7,
            par[5] * 0.8,
          ];
        else if (v && (v.p === "IY" || v.p === "IH" || v.p === "EY"))
          par = [par[0], par[1], par[2] * 0.9, par[3], par[4] * 1.1, par[5]];
      } else if (c === "S" || c === "A") {
        if (s.sub === "cl") {
          r = 0.006;
          if (s.k.vc) {
            // English /b d g/: no prevoicing after a pause or a voiceless sound (short-lag stops — a long voice bar
            // there reads as a nasal murmur: "bed"→"med"/"wed"); after a sonorant the voice bar dies away within
            // ~50 ms (utterance-final "bad" no longer hums like "ban")
            const pv = segs[i - 1],
              pc = pv ? pv.k.c : "PAU";
            const voicedBefore =
              pv &&
              (SON[pc] ||
                pc === "N" ||
                (pv.k.vc && pc !== "PAU" && pc !== "BR"));
            if (voicedBefore) {
              const dk = Math.min(s.d, 0.055);
              AVS.add(t0 + 0.004, 0.42);
              AVS.add(t0 + dk, 0.1);
              AVS.add(t1 - 0.002, s.d > 0.07 ? 0.02 : 0.1);
              avsDone = true;
            }
          }
        } else if (s.sub === "bu") {
          av = s.k.vc ? 0.25 : 0;
          af = (s.k.c === "A" ? s.k.af : 0.9) * (s.weak || 1);
          par = s.k.c === "A" ? s.k.par : s.k.burst;
          r = 0.001;
          if (s.k.c !== "A") {
            // burst: sharp onset, fast decay
            AF.add(t0, 0);
            AF.add(t0 + 0.0015, af);
            AF.add(t1, af * 0.4);
            for (let q = 0; q < 6; q++) {
              PAR[q].add(t0, par[q]);
              PAR[q].add(t1, par[q]);
            }
            AV.add(t0, 0);
            AV.add(t1, av);
            AH.add(t0, 0);
            AH.add(t1, s.k.vc ? 0 : 0.3);
            AVS.add(t0, 0);
            AVS.add(t1, 0);
            FNZ.add(t0, 270);
            FNZ.add(t1, 270);
            continue;
          }
        } else if (s.sub === "as") {
          ah = s.strong ? 0.5 : 0.4;
          av = s.k.vc ? 0.4 : 0;
          r = 0.004;
        }
      }
      AV.add(t0 + Math.min(r, s.d * 0.4), av);
      AV.add(
        Math.max(t0 + Math.min(r, s.d * 0.4), t1 - Math.min(r, s.d * 0.4)),
        av,
      );
      if (!avsDone) setAmp(AVS, t0, t1, avs, 0.008, 0.01);
      setAmp(AH, t0, t1, ah, r, r);
      setAmp(AF, t0, t1, af, c === "F" ? 0.025 : r, c === "F" ? 0.02 : r);
      if (par)
        for (let q = 0; q < 6; q++)
          setAmp(PAR[q], t0, t1, par[q], 0.004, 0.004);
      if (c !== "V" && c !== "D") setAmp(FNZ, t0, t1, fnz, 0.008, 0.008);
    }
  }

  /** Plan a whole line into synth frames. Returns {m (render job), plans:[{t0,t1,text}], dur}. */
  function plan2(text, profileId, rnd, drop) {
    const P = PROFILES[profileId] || PROFILES.announcer;
    rnd = rnd || Math.random;
    const phs = phrases(text);
    const plans = [],
      segLists = [];
    phs.forEach((ph, i) => {
      if (ph.voc) {
        segLists.push(vocSegs(ph.voc, P, rnd));
        plans.push({
          end: "v",
          voc: ph.voc,
          pause: ph.voc === "breath" ? 0.04 : 0.1 + rnd() * 0.08,
          breath: 0,
          words: [],
        });
        return;
      }
      // tempo: a little drift phrase to phrase; the DJ's patter register runs long phrases and exclamations faster
      let rk = 1 + (rnd() - 0.5) * 0.08;
      if (P.patter) {
        rk *=
          1 + P.patter * Math.min(1, Math.max(0, (ph.words.length - 4) / 8));
        if (ph.end === "!") rk *= 1 + P.patter * 0.5;
      }
      const segs = segPhrase(
        ph,
        rk === 1 ? P : Object.assign({}, P, { rate: P.rate * rk }),
        rnd,
      );
      const pause =
        ({ ".": 0.38, "!": 0.4, "?": 0.44, ",": 0.16, ";": 0.26, "…": 0.55 }[
          ph.end
        ] || 0.3) *
        P.pause *
        (0.85 + rnd() * 0.3);
      const prev = phs[i - 1];
      const breath =
        i > 0 &&
        !(prev && prev.voc) &&
        ph.end !== "," &&
        prev.end !== "," &&
        rnd() < 0.5
          ? 0.2 * P.pause
          : 0;
      plans.push({ end: ph.end, pause, breath, words: ph.words });
      segLists.push(segs);
    });
    segLists.forEach((sl, pi) =>
      sl.forEach((sg) => {
        sg.ph = pi;
      }),
    );
    const tl = timeline(segLists, plans, P.rate);
    const segs = tl.segs;
    // vowel undershoot (needs the final durations): short unstressed vowels drift toward schwa, short diphthongs glide less
    for (const sg of segs) {
      const c = sg.k && sg.k.c;
      if ((c !== "V" && c !== "D") || sg.voc) continue;
      if (sg.st === 0) {
        if (sg.p !== "AX" && sg.p !== "AXR") {
          const r = Math.min(0.55, Math.max(0.1, 1 - (sg.d - 0.03) / 0.09));
          sg.red = sg.p === "IY" || sg.p === "IH" ? r * 0.6 : r;
        }
      } else if (sg.d < 0.08) sg.red = 0.1;
      if (c === "D") sg.gk = Math.min(1, Math.max(0.45, sg.d / 0.15));
    }
    // word spans (global word index over the whole line) — for caption sync and signal dropouts
    const wordBase = [];
    let wb = 0;
    plans.forEach((pl) => {
      wordBase.push(wb);
      wb += pl.words.length;
    });
    const words = [];
    for (const sg of segs) {
      const src = sg.src || sg;
      if (src.w === undefined || src.ph === undefined) continue;
      const gi = wordBase[src.ph] + src.w,
        e = words[gi] || (words[gi] = { t0: sg.t, t1: sg.t + sg.d });
      e.t0 = Math.min(e.t0, sg.t);
      e.t1 = Math.max(e.t1, sg.t + sg.d);
    }
    const fs = P.fs;
    const nF = Math.ceil((tl.dur + 0.06) / FR) + 1;
    const p = new Float32Array(nF * NP);
    const tr = [];
    for (let i = 0; i < NP; i++) tr.push(new Track());
    segTracks(segs, P, tr);
    const FRY = tr[iFRY],
      TL = tr[iTL],
      FNZ = tr[iFNZ];
    // --- F0 (intonation). Per intonation phrase: pitch accents on the primary-stressed syllables of content words
    // (and on *emphasised* words), each pre-nuclear accent a step lower than the last (downstep), the nuclear
    // (last) accent carrying the phrase's tune — H* L-L% fall for statements and wh-questions, L* H-H% rise for
    // yes/no questions, a continuation rise before commas; a declining baseline across the comma phrases of one
    // sentence with a reset at each new sentence; micro-prosody after voiceless/voiced onsets; creak at the end.
    const f0 = tr[iF0],
      base = P.f0 * (0.97 + rnd() * 0.06);
    let sentPos = 0;
    plans.forEach((pl, pi) => {
      const ss = segs.filter(
        (s) =>
          s.t >= pl.t0 - 1e-6 &&
          s.t < pl.t1 - 1e-6 &&
          (s.k.c === "V" || s.k.c === "D"),
      );
      if (pl.voc) {
        for (const s of ss) {
          const k = s.pulse || 0;
          let a = 1,
            b = 1,
            mid = 0;
          if (pl.voc === "laugh") {
            a = 1.55 - 0.07 * k;
            b = a * 0.86;
          } else if (pl.voc === "chuckle") {
            a = 1.12 - 0.05 * k;
            b = a * 0.92;
          } else if (pl.voc === "whoop") {
            if (k === 0) {
              a = 1.2;
              b = 1.55;
            } else {
              a = 1.65;
              mid = 2.15;
              b = 1.4;
            }
          } else if (pl.voc === "sigh") {
            a = 1.25;
            b = 0.78;
          }
          f0.add(s.t, base * a);
          if (mid) f0.add(s.t + s.d * 0.45, base * mid);
          f0.add(s.t + s.d, base * b);
          TL.add(s.t, P.tilt + (pl.voc === "whoop" ? -0.06 : 0.06));
          TL.add(s.t + s.d, P.tilt + (pl.voc === "whoop" ? -0.02 : 0.1));
        }
        return;
      }
      const N = ss.length,
        R = P.range * P.accent;
      const emphP = pl.end === "!" ? 1.3 : 1;
      const reset = 1 - 0.045 * sentPos;
      sentPos = pl.end === "," || pl.end === ";" ? sentPos + 1 : 0;
      const acc = ss.map(
        (s) => (s.st === 1 && !s.func) || (s.emph && s.st > 0),
      );
      let nuc = -1;
      for (let i = N - 1; i >= 0; i--)
        if (acc[i]) {
          nuc = i;
          break;
        }
      if (nuc < 0) {
        for (let i = N - 1; i >= 0; i--)
          if (ss[i].st > 0) {
            nuc = i;
            break;
          }
        if (nuc < 0) nuc = N - 1;
        acc[nuc] = true;
      }
      const question = pl.end === "?" && !WH.has(pl.words[0]);
      const cont = pl.end === "," || pl.end === ";" || pl.end === "…";
      const low = 0.8 - R * 0.2;
      f0.add(pl.t0, base * reset * (1.04 + (pi === 0 ? 0.03 : 0)));
      let k = 0;
      ss.forEach((s, i) => {
        const decl = reset * (1.06 - 0.14 * (N > 1 ? i / (N - 1) : 0));
        const onset = segs[segs.indexOf(s) - 1];
        const micro =
          onset && onset.k && (VOICELESS[onset.p] || onset.sub === "as")
            ? 1.04
            : onset && onset.k && onset.k.vc && onset.k.c !== "G"
              ? 0.97
              : 1;
        const t0 = s.t,
          t1 = s.t + s.d;
        const em = s.emph ? 1.6 : 1;
        let tilt = P.tilt + (s.st === 0 ? 0.05 : 0);
        if (i === nuc) {
          const h = R * (0.85 + rnd() * 0.3) * em * emphP;
          tilt -= 0.05;
          if (question) {
            f0.add(t0, base * (decl - R * 0.1) * micro);
            f0.add(t0 + s.d * 0.4, base * (decl - R * 0.12));
            f0.add(t1, base * (i === N - 1 ? 1.1 + R * 1.3 : decl + R * 0.3));
          } else if (cont) {
            f0.add(t0, base * (decl + h * 0.3) * micro);
            f0.add(t0 + s.d * 0.4, base * (decl + h * 0.6));
            f0.add(t1, base * (i === N - 1 ? decl + R * 0.35 : decl + h * 0.3));
          } else {
            f0.add(t0, base * (decl + h * 0.4) * micro);
            f0.add(t0 + s.d * 0.33, base * (decl + h));
            f0.add(t1, base * (i === N - 1 ? low : decl + h * 0.15));
          }
        } else if (i > nuc) {
          // post-nuclear stretch follows the boundary tone
          const u = N - 1 > nuc ? (i - nuc) / (N - 1 - nuc) : 1;
          let v;
          if (question) v = decl + (1.1 + R * 1.3 - decl) * u;
          else if (cont) v = decl + R * 0.35 * u;
          else v = low + 0.07 * (1 - u); // after H* L- the voice stays down
          f0.add(t0, base * v * micro);
          f0.add(
            t1,
            base *
              (i === N - 1
                ? question
                  ? 1.1 + R * 1.3
                  : cont
                    ? decl + R * 0.35
                    : low
                : v),
          );
        } else if (acc[i]) {
          const h =
            R *
            (k === 0 ? 1 : Math.pow(0.8, k)) *
            (0.8 + rnd() * 0.35) *
            em *
            emphP;
          k++;
          tilt -= 0.04;
          f0.add(t0, base * (decl + h * 0.25) * micro);
          f0.add(t0 + s.d * 0.45, base * (decl + h));
          f0.add(t1, base * (decl + h * 0.55));
        } else if (s.st > 0) {
          f0.add(t0, base * (decl + R * 0.04) * micro);
          f0.add(t1, base * (decl + R * 0.02));
        } else {
          f0.add(t0, base * (decl - R * 0.06) * micro);
          f0.add(t1, base * (decl - R * 0.12));
        }
        if (s.final) {
          if (P.fry && (pl.end === "." || pl.end === "…")) {
            FRY.add(t0 + s.d * 0.5, 0);
            FRY.add(t1, P.fry * 0.8);
            FRY.add(t1 + 0.05, 0);
          }
          TL.add(t0, tilt);
          TL.add(t1, Math.min(0.92, P.tilt + 0.15));
        } else {
          TL.add(t0, tilt);
          TL.add(t1, tilt);
        }
      });
    });
    tr[iF4].add(0, 3300);
    FNZ.add(0, 270);
    for (let i = 0; i < NP; i++) tr[i].fill(p, i, nF);
    // dropped words (weak signal): the voice sinks under the static for exactly those words
    const drops = [];
    if (drop && drop.size) {
      drop.forEach((gi) => {
        const w = words[gi];
        if (w) drops.push({ t0: w.t0, t1: w.t1 });
      });
      for (const d of drops) {
        for (
          let f = Math.max(0, Math.floor((d.t0 - 0.03) / FR));
          f < nF && f * FR < d.t1 + 0.03;
          f++
        ) {
          const t = f * FR,
            k = t < d.t0 ? (d.t0 - t) / 0.03 : t > d.t1 ? (t - d.t1) / 0.03 : 0,
            g = 0.06 + 0.94 * Math.min(1, k);
          const o = f * NP;
          p[o + iAV] *= g;
          p[o + iAVS] *= g;
          p[o + iAH] *= g;
          p[o + iAF] *= g;
        }
      }
    }
    // formant scale (tract length) and sanity
    for (let f = 0; f < nF; f++) {
      const o = f * NP;
      p[o + iF1] *= fs;
      p[o + iF2] *= fs;
      p[o + iF3] *= fs;
      p[o + iF4] = 3300 * fs;
      if (!(p[o + iF0] > 40)) p[o + iF0] = base;
      if (!(p[o + iB1] > 20)) p[o + iB1] = 80;
      if (!(p[o + iB2] > 20)) p[o + iB2] = 100;
      if (!(p[o + iB3] > 20)) p[o + iB3] = 150;
      if (!(p[o + iFNZ] > 100)) p[o + iFNZ] = 270;
      if (!(p[o + iTL] > 0)) p[o + iTL] = P.tilt;
    }
    return {
      m: {
        sr: VSR,
        hop: HOP,
        np: NP,
        n: nF,
        p,
        f5: 3750 * fs,
        f6: 4700 * Math.sqrt(fs),
        oq: P.oq,
        jitter: P.jitter,
        shimmer: P.shimmer,
        gain: P.gain * (P.norm || 1),
        ta: P.ta,
        pe: P.pe,
      },
      plans: plans.map((pl) => ({ t0: pl.t0, t1: pl.t1, end: pl.end })),
      segs: segs.map((s) => ({ p: s.p, sub: s.sub, t: s.t, d: s.d, st: s.st })),
      words,
      drops,
      dur: tl.dur,
    };
  }

  // ------------------------------------------------------------------
  // The sample synthesiser (resumable: render frames [f0, f1) per call)
  // ------------------------------------------------------------------
  function klattState(m, seed) {
    return {
      f: 0,
      seed: seed >>> 0 || 0x9e3779b9,
      ph: 1,
      T: 100,
      amp: 1,
      alt: 1,
      c: new Float64Array(24), // cascade & parallel filter states
      tl: 0,
      vb: 0,
      dc1: 0,
      dc2: 0,
      p6a: 0,
      p6b: 0,
      cp: 0,
      ret: 0,
    };
  }
  /** Render frames [st.f, f1) of job m into a Float32Array. */
  function klattRender(m, st, f1) {
    const sr = m.sr,
      hop = m.hop,
      np = m.np,
      P = m.p;
    const off = m.off || 0; // m.p may hold a window of the timeline starting at frame `off`
    f1 = Math.min(f1, off + m.n - 1);
    const n0 = st.f;
    if (f1 <= n0) return new Float32Array(0);
    const out = new Float32Array((f1 - n0) * hop);
    const TWO_PI_T = (2 * Math.PI) / sr;
    const c = st.c;
    let seed = st.seed,
      ph = st.ph,
      T = st.T,
      amp = st.amp,
      alt = st.alt,
      tl = st.tl,
      vb = st.vb,
      dc1 = st.dc1,
      dc2 = st.dc2,
      cp = st.cp,
      ret = st.ret || 0;
    const TA = m.ta || 0; // glottal return phase (s): the closure is an exponential return, not a step (LF model)
    const PE = m.pe === undefined ? 1.6 : m.pe; // presence pre-emphasis (≈ +4 dB at 2 kHz, +7 dB at 3 kHz)
    const oq = m.oq || 0.6,
      jit = m.jitter || 0.01,
      shim = m.shimmer || 0.05,
      G0 = (m.gain || 1) * 0.068;
    // resonator coefficient helpers
    const res = (F, Bw, o) => {
      const r = Math.exp((-Math.PI * Bw) / sr);
      const C = -r * r,
        Bc = 2 * r * Math.cos(TWO_PI_T * F);
      o[0] = 1 - Bc - C;
      o[1] = Bc;
      o[2] = C;
    };
    const bpc = (F, Bw, o) => {
      const w = TWO_PI_T * Math.min(F, sr * 0.45),
        q = Math.max(0.5, F / Bw),
        al = Math.sin(w) / (2 * q),
        a0 = 1 + al;
      o[0] = al / a0;
      o[1] = (-2 * Math.cos(w)) / a0;
      o[2] = (1 - al) / a0;
    };
    const k1 = [0, 0, 0],
      k2 = [0, 0, 0],
      k3 = [0, 0, 0],
      k4 = [0, 0, 0],
      k5 = [0, 0, 0],
      knp = [0, 0, 0],
      knz = [0, 0, 0];
    const p2 = [0, 0, 0],
      p3 = [0, 0, 0],
      p4 = [0, 0, 0],
      p5 = [0, 0, 0],
      p6 = [0, 0, 0];
    res(m.f5, 250, k5);
    res(270, 100, knp);
    bpc(m.f5, 300, p5);
    bpc(m.f6, 500, p6);
    let o = 0;
    const BLK = 16;
    for (let f = n0; f < f1; f++) {
      const a = (f - off) * np,
        b = a + np;
      for (let s0 = 0; s0 < hop; s0 += BLK) {
        const u = (s0 + BLK * 0.5) / hop,
          iu = 1 - u;
        const lerp = (i) => P[a + i] * iu + P[b + i] * u;
        const F1 = lerp(iF1),
          F2 = lerp(iF2),
          F3 = lerp(iF3),
          F4 = lerp(iF4);
        res(F1, lerp(iB1), k1);
        res(F2, lerp(iB2), k2);
        res(F3, lerp(iB3), k3);
        res(F4, 250, k4);
        const fnz = lerp(iFNZ);
        res(fnz, 100, knz);
        const nzA = 1 / knz[0],
          nzB = -knz[1] / knz[0],
          nzC = -knz[2] / knz[0];
        bpc(F2, 250, p2);
        bpc(F3, 300, p3);
        bpc(F4, 350, p4);
        const f0 = P[a + iF0] * iu + P[b + iF0] * u;
        const tlt = Math.min(0.95, Math.max(0, lerp(iTL))),
          fry = lerp(iFRY);
        // louder phonation closes a little faster (brighter), soft voice slower (the "vocal effort" tilt)
        const rdec =
          TA > 0
            ? Math.exp(-1 / (TA * sr * (1.3 - 0.4 * Math.min(1, lerp(iAV)))))
            : 0;
        for (let s = 0; s < BLK; s++) {
          const w = (s0 + s) / hop,
            iw = 1 - w;
          const av = P[a + iAV] * iw + P[b + iAV] * w,
            avs = P[a + iAVS] * iw + P[b + iAVS] * w;
          const ah = P[a + iAH] * iw + P[b + iAH] * w,
            af = P[a + iAF] * iw + P[b + iAF] * w;
          // --- glottal source (flow derivative, KLGLOTT88-like)
          ph += 1 / T;
          if (ph >= 1) {
            ph -= 1;
            const jj = jit + fry * 0.12;
            T =
              (sr / Math.max(40, f0 * (1 - fry * 0.25))) *
              (1 +
                ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296 -
                  0.5) *
                  2 *
                  jj);
            amp =
              1 +
              ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296 -
                0.5) *
                2 *
                (shim + fry * 0.5);
            alt = fry > 0.05 ? (alt > 0 ? -1 : 1) : 1;
          }
          let g = 0;
          if (ph < oq) {
            const x = ph / oq;
            g = (2 * x - 3 * x * x) * amp * (alt < 0 ? 1 - fry * 0.6 : 1);
            ret = g;
          } else {
            ret *= rdec;
            g = ret;
          }
          seed = (seed * 1664525 + 1013904223) >>> 0;
          const noise = seed / 2147483648 - 1;
          // spectral tilt (one-pole low-pass on the source)
          tl = g * (1 - tlt) + tl * tlt;
          vb = tl * 0.08 + vb * 0.92; // voice bar: heavily low-passed voicing
          const asp = noise * ah * (av > 0.05 ? (ph < oq ? 1 : 0.45) : 1) * 1.3;
          let x = tl * av * 3.2 + vb * avs * 1.6 + asp;
          // --- cascade: nasal pole → nasal zero → F5 → F4 → F3 → F2 → F1
          let y = knp[0] * x + knp[1] * c[0] + knp[2] * c[1];
          c[1] = c[0];
          c[0] = y;
          x = y;
          y = nzA * x + nzB * c[2] + nzC * c[3];
          c[3] = c[2];
          c[2] = x;
          x = y;
          y = k5[0] * x + k5[1] * c[4] + k5[2] * c[5];
          c[5] = c[4];
          c[4] = y;
          x = y;
          y = k4[0] * x + k4[1] * c[6] + k4[2] * c[7];
          c[7] = c[6];
          c[6] = y;
          x = y;
          y = k3[0] * x + k3[1] * c[8] + k3[2] * c[9];
          c[9] = c[8];
          c[8] = y;
          x = y;
          y = k2[0] * x + k2[1] * c[10] + k2[2] * c[11];
          c[11] = c[10];
          c[10] = y;
          x = y;
          y = k1[0] * x + k1[1] * c[12] + k1[2] * c[13];
          c[13] = c[12];
          c[12] = y;
          const casc = y;
          // --- parallel frication branch (band-passes on F2..F6 + bypass)
          let par = 0;
          if (af > 1e-4 || c[14] !== 0) {
            const fn = noise * af;
            const A2 = P[a + iA2] * iw + P[b + iA2] * w,
              A3 = P[a + iA3] * iw + P[b + iA3] * w,
              A4 = P[a + iA4] * iw + P[b + iA4] * w;
            const A5 = P[a + iA5] * iw + P[b + iA5] * w,
              A6 = P[a + iA6] * iw + P[b + iA6] * w,
              AB = P[a + iAB] * iw + P[b + iAB] * w;
            // direct-form biquad band-pass: y = b0 (x − x2) − a1 y1 − a2 y2 ; shared input history in c[14], c[15]
            const x1 = c[14],
              x2 = c[15];
            let yy;
            yy = p2[0] * (fn - x2) - p2[1] * c[16] - p2[2] * c[17];
            c[17] = c[16];
            c[16] = yy;
            par += A2 * yy;
            yy = p3[0] * (fn - x2) - p3[1] * c[18] - p3[2] * c[19];
            c[19] = c[18];
            c[18] = yy;
            par -= A3 * yy;
            yy = p4[0] * (fn - x2) - p4[1] * c[20] - p4[2] * c[21];
            c[21] = c[20];
            c[20] = yy;
            par += A4 * yy;
            yy = p5[0] * (fn - x2) - p5[1] * c[22] - p5[2] * c[23];
            c[23] = c[22];
            c[22] = yy;
            par -= A5 * yy;
            yy = p6[0] * (fn - x2) - p6[1] * st.p6a - p6[2] * st.p6b;
            st.p6b = st.p6a;
            st.p6a = yy;
            par += A6 * yy;
            par += AB * (fn - x1) * 0.35;
            c[15] = x1;
            c[14] = fn;
            if (
              af <= 1e-4 &&
              Math.abs(fn) < 1e-9 &&
              Math.abs(c[16]) + Math.abs(c[18]) + Math.abs(c[22]) < 1e-6
            ) {
              c[14] = 0;
              c[15] = 0;
            }
          }
          // --- output: DC block, gain
          const v = casc + PE * (casc - cp) + par * 4;
          cp = casc;
          const hp = v - dc1 + 0.995 * dc2;
          dc1 = v;
          dc2 = hp;
          out[o++] = hp * G0;
        }
      }
    }
    st.f = f1;
    st.seed = seed;
    st.ph = ph;
    st.T = T;
    st.amp = amp;
    st.alt = alt;
    st.tl = tl;
    st.vb = vb;
    st.dc1 = dc1;
    st.dc2 = dc2;
    st.cp = cp;
    st.ret = ret;
    return out;
  }
  function cloneSt(st) {
    const o = Object.assign({}, st);
    o.c = new Float64Array(st.c);
    return o;
  }
  const XF = 2; // chunk crossfade (frames): every chunk carries a 10 ms faded tail rendered from a copy of the state,
  //               the next chunk (same state → identical samples) fades in over it, so chunk seams are inaudible.
  function renderXF(m, st, f1, fadeIn) {
    const main = klattRender(m, st, f1);
    const tail = klattRender(m, cloneSt(st), f1 + XF);
    const n = main.length,
      nt = tail.length,
      out = new Float32Array(n + nt),
      W = XF * m.hop;
    out.set(main);
    out.set(tail, n);
    if (fadeIn) for (let i = 0; i < W && i < out.length; i++) out[i] *= i / W;
    for (let i = 0; i < nt; i++) out[n + i] *= 1 - i / W;
    return out;
  }
  /** Next good chunk end ≥ `from` frames: a run of ≥ 3 silent frames (no voicing/noise), else `max`. */
  function cutFrame(m, from, max) {
    const P = m.p,
      np = m.np;
    max = Math.min(max, m.n - 1);
    let run = 0;
    for (let f = from; f < max; f++) {
      const o = f * np;
      if (
        P[o + iAV] < 0.01 &&
        P[o + iAVS] < 0.01 &&
        P[o + iAH] < 0.01 &&
        P[o + iAF] < 0.01
      ) {
        if (++run >= 3) return f;
      } else run = 0;
    }
    return max;
  }

  // ------------------------------------------------------------------
  // Render worker. Sample synthesis runs off the main thread: the first
  // ≈ 0.45 s of a line is rendered synchronously (zero start latency), the
  // state is handed to a dedicated Worker that renders the rest of the line
  // (and every sung note) as fast as it can and posts crossfaded chunks
  // back; the main thread only schedules AudioBuffers on the audio clock at
  // their frame times. A main-thread stall after a line started no longer
  // starves the voice (the whole line is usually scheduled within ~50 ms).
  // Falls back to the lazy main-thread pump when Workers are unavailable
  // and for OfflineAudioContext renders.
  // ------------------------------------------------------------------
  function voxWorkerMain() {
    const jobs = [],
      cancelled = new Set(),
      sing = new Map();
    let busy = false;
    function step() {
      const t = Date.now();
      while (jobs.length && Date.now() - t < 12) {
        const j = jobs[0];
        if (cancelled.has(j.id)) {
          jobs.shift();
          continue;
        }
        if (j.kind === "line") {
          const m = j.m,
            st = j.st,
            last = m.n - 1;
          if (st.f >= last) {
            jobs.shift();
            self.postMessage({ id: j.id, done: true });
            continue;
          }
          const from = st.f,
            cut = cutFrame(m, Math.min(last, from + 30), from + 120);
          const data = renderXF(m, st, cut, from > 0);
          if (!data.length) {
            jobs.shift();
            self.postMessage({ id: j.id, done: true });
            continue;
          }
          self.postMessage({ id: j.id, from, data }, [data.buffer]);
          if (jobs.length > 1) jobs.push(jobs.shift()); // round robin: sung notes interleave with long speeches
        } else {
          jobs.shift();
          const sg = sing.get(j.id);
          if (!sg) continue;
          const q = j.q,
            m = sg.m,
            st = sg.st;
          if (st.f < q.fa) {
            const s2 = klattState(m, st.seed);
            s2.f = q.fa;
            Object.assign(st, s2);
            st.fresh = true;
          }
          m.p = q.p;
          m.off = q.pa;
          m.n = q.pn;
          const data = renderXF(m, st, q.fb, !st.fresh && q.fa > 0);
          st.fresh = false;
          self.postMessage({ id: j.id, from: q.startF, data }, [data.buffer]);
        }
      }
      if (jobs.length) setTimeout(step, 0);
      else busy = false;
    }
    self.onmessage = (ev) => {
      const d = ev.data;
      if (d.op === "line") {
        d.st.c = new Float64Array(d.st.c);
        jobs.push({ kind: "line", id: d.id, m: d.m, st: d.st });
      } else if (d.op === "singer")
        sing.set(d.id, { m: d.m, st: klattState(d.m, d.seed) });
      else if (d.op === "note") jobs.push({ kind: "note", id: d.id, q: d.q });
      else if (d.op === "cancel") {
        cancelled.add(d.id);
        sing.delete(d.id);
      }
      if (!busy && jobs.length) {
        busy = true;
        setTimeout(step, 0);
      }
    };
  }
  const VW = { w: null, failed: false, h: new Map(), id: 0, chunks: 0 };
  function voxWorker() {
    if (VW.failed) return null;
    if (VW.w) return VW.w;
    try {
      if (!window.Worker || !window.Blob || !window.URL)
        throw new Error("no Worker");
      const src = [
        '"use strict";',
        "const NP = " + NP + ", XF = " + XF + ";",
        "const iF0 = 0, iAV = 1, iAVS = 2, iAH = 3, iAF = 4, iF1 = 5, iF2 = 6, iF3 = 7, iF4 = 8, iB1 = 9, iB2 = 10, iB3 = 11, iFNZ = 12, iA2 = 13, iA3 = 14, iA4 = 15, iA5 = 16, iA6 = 17, iAB = 18, iTL = 19, iFRY = 20;",
        klattState.toString(),
        klattRender.toString(),
        cloneSt.toString(),
        renderXF.toString(),
        cutFrame.toString(),
        "(" + voxWorkerMain.toString() + ")();",
      ].join("\n");
      const url = URL.createObjectURL(
        new Blob([src], { type: "text/javascript" }),
      );
      const w = new Worker(url);
      w.onmessage = (ev) => {
        const d = ev.data,
          h = VW.h.get(d.id);
        if (h) h(d);
      };
      w.onerror = (e) => {
        VW.failed = true;
        VW.w = null;
        try {
          w.terminate();
        } catch (x) {
          /* */
        }
        console.warn(
          "[sound] VOX render worker failed, rendering on the main thread:",
          e && e.message,
        );
        VW.h.forEach((h) => {
          try {
            h({ failed: true });
          } catch (x) {
            /* */
          }
        });
        VW.h.clear();
      };
      VW.w = w;
      return w;
    } catch (e) {
      VW.failed = true;
      return null;
    }
  }
  const isOffline = (ctx) => typeof ctx.startRendering === "function";

  const NORM2 = 1.0; // the renderer is calibrated to ≈ −20 dBFS RMS over active speech (record level at the chain)
  /**
   * VOX 2 speaker — same controller contract as the legacy formant voice:
   * {start, plannedEnd, end, stopped, pump(untilCtxTime), stop(fade)}.
   * Rendering: first ≈ 0.45 s on the main thread, the rest in the VOX worker (see above); without a worker,
   * pump() renders the next chunks (cut at silent frames) ~2 s ahead of the audio clock.
   */
  function say2(ctx, dest, text, profileId, opts) {
    opts = opts || {};
    const P = PROFILES[profileId] || PROFILES.announcer;
    const rnd = opts.rng || Math.random;
    const pl = plan2(text, profileId, rnd, opts.drop);
    const m = pl.m;
    if (opts.pitch && opts.pitch !== 1)
      for (let f = 0; f < m.n; f++) m.p[f * NP + iF0] *= opts.pitch;
    const st = klattState(m, (rnd() * 4294967296) >>> 0);
    const t0 = Math.max(ctx.currentTime + 0.05, opts.start || 0);
    const nodes = [];
    const mk = (n) => {
      nodes.push(n);
      return n;
    };
    const warm = mk(bq(ctx, "lowshelf", 220, 0.7, P.warmth * 0.6));
    const hp = mk(bq(ctx, "highpass", 80, 0.7));
    const pres = mk(bq(ctx, "peaking", 2500, 1.1, 5.5)); // ribbon-mic presence (consonant clarity through the AM band)
    const out = mk(ctx.createGain());
    out.gain.value = (opts.gain === undefined ? 1 : opts.gain) * P.gain * NORM2;
    warm.connect(hp);
    hp.connect(pres);
    pres.connect(out);
    out.connect(dest);
    const plannedEnd = t0 + pl.dur;
    const srcs = new Set();
    let freed = false,
      wid = 0,
      wDone = false,
      wTo = 0;
    const free = () => {
      if (freed) return;
      freed = true;
      if (wid) VW.h.delete(wid);
      srcs.forEach((s) => {
        try {
          s.disconnect();
        } catch (e) {
          /* */
        }
      });
      nodes.forEach((n) => {
        try {
          n.disconnect();
        } catch (e) {
          /* */
        }
      });
    };
    const last = m.n - 1;
    const maybeFree = () => {
      if ((wid ? wDone : st.f >= last) && !srcs.size && !ctl.stopped) {
        ctl.stopped = true;
        free();
      }
    };
    const sched = (data, from) => {
      const at = t0 + from * FR,
        now = ctx.currentTime;
      if (at + data.length / VSR <= now + 0.01) return; // hopelessly late (suspended tab): skip
      const buf = ctx.createBuffer(1, data.length, VSR);
      if (buf.copyToChannel) buf.copyToChannel(data, 0);
      else buf.getChannelData(0).set(data);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(warm);
      if (at < now) src.start(now, now - at);
      else src.start(at);
      srcs.add(src);
      src.onended = () => {
        srcs.delete(src);
        try {
          src.disconnect();
        } catch (e) {
          /* */
        }
        maybeFree();
      };
    };
    const renderSync = (until, budgetFrames) => {
      const want = Math.min(last, Math.ceil((until - t0) / FR));
      const all = until - ctx.currentTime > 30,
        hard = Math.ceil((ctx.currentTime - t0 + 0.6) / FR),
        f00 = st.f;
      let guard = 0;
      while (
        st.f < want &&
        guard++ < 400 &&
        (all || st.f - f00 < budgetFrames || st.f < hard)
      ) {
        const from = st.f;
        const cut = cutFrame(m, Math.min(last, from + 30), from + 120); // 150 … 600 ms chunks, preferably cut in silence
        const data = renderXF(m, st, cut, from > 0);
        if (!data.length) break;
        sched(data, from);
      }
    };
    const ctl = {
      start: t0,
      plannedEnd,
      end: plannedEnd,
      stopped: false,
      phrases: pl.plans.map((p) => ({ t0: t0 + p.t0, t1: t0 + p.t1 })),
      drops: pl.drops.map((d) => ({ t0: t0 + d.t0, t1: t0 + d.t1 })),
      words: pl.words.map((w) => (w ? { t0: t0 + w.t0, t1: t0 + w.t1 } : null)),
      pump(until) {
        if (ctl.stopped) return true;
        if (wid) return wDone;
        renderSync(until + 2.0, 140); // no worker: keep ≈ 2 s rendered ahead, ≈ 0.7 s of speech per call
        return st.f >= last;
      },
      stop(fade) {
        if (ctl.stopped) return;
        ctl.stopped = true;
        if (wid && VW.w) {
          try {
            VW.w.postMessage({ op: "cancel", id: wid });
          } catch (e) {
            /* */
          }
        }
        const t = ctx.currentTime,
          f = fade === undefined ? 0.08 : fade;
        try {
          out.gain.cancelScheduledValues(t);
          out.gain.setValueAtTime(out.gain.value, t);
          out.gain.linearRampToValueAtTime(0, t + f);
        } catch (e) {
          /* */
        }
        srcs.forEach((s) => {
          try {
            s.stop(t + f + 0.02);
          } catch (e) {
            /* */
          }
        });
        setTimeout(free, (f + 0.3) * 1000);
      },
    };
    // head of the line on the main thread (plays immediately), the rest in the worker
    renderSync(t0 + (opts.head || 0.45), 1e9); // opts.head: a shorter synchronous head (NPC barks start a little later)
    const w = !isOffline(ctx) && st.f < last ? voxWorker() : null;
    if (w) {
      wid = ++VW.id;
      VW.h.set(wid, (d) => {
        if (ctl.stopped) return;
        if (d.failed) {
          // worker died: finish on the main thread from the last delivered frame
          wid = 0;
          const s2 = klattState(m, st.seed);
          s2.f = Math.max(st.f, wTo);
          Object.assign(st, s2);
          renderSync(ctx.currentTime + 2, 1e9);
          return;
        }
        if (d.done) {
          wDone = true;
          maybeFree();
          return;
        }
        VW.chunks++;
        wTo = Math.max(wTo, d.from + Math.round(d.data.length / HOP) - XF);
        sched(d.data, d.from);
      });
      const mm = Object.assign({}, m); // structured clone of the frame table + scalars
      const s2 = cloneSt(st);
      s2.c = s2.c.buffer.slice(0);
      w.postMessage({ op: "line", id: wid, m: mm, st: s2 });
    }
    return ctl;
  }
  /** For each space-separated token of `text`, how many VOX words it becomes (numbers are spelled out, hyphens split). */
  function tokenWords(text) {
    return String(text)
      .split(" ")
      .map(
        (tok) =>
          tok
            .replace(/(\d),(\d{3})/g, "$1$2")
            .replace(/[“”"()]/g, "")
            .replace(/[’']/g, "'")
            .replace(/(\d+)/g, (x) => " " + spellNumber(x) + " ")
            .replace(/-/g, " ")
            .toLowerCase()
            .split(/\s+/)
            .map((w) => w.replace(/[^a-z']/g, ""))
            .filter((w) => /[a-z]/.test(w)).length,
      );
  }
  /** Offline helper for tests: render a whole line to a Float32Array at VSR. */
  function renderLine(text, profileId, seed, chunked) {
    let a = seed >>> 0 || 7;
    const rnd = () => {
      a = (a * 1664525 + 1013904223) >>> 0;
      return a / 4294967296;
    };
    const pl = plan2(text, profileId, rnd);
    const st = klattState(pl.m, 12345);
    if (!chunked)
      return { data: klattRender(pl.m, st, pl.m.n), sr: VSR, plan: pl };
    // same path as live playback: crossfaded chunks overlap-added at their frame offsets
    const m = pl.m,
      outA = new Float32Array((m.n + XF) * HOP);
    while (st.f < m.n - 1) {
      const from = st.f,
        cut = cutFrame(m, Math.min(m.n - 1, from + 30), from + 120),
        d = renderXF(m, st, cut, from > 0);
      for (let i = 0; i < d.length && from * HOP + i < outA.length; i++)
        outA[from * HOP + i] += d[i];
    }
    return { data: outA, sr: VSR, plan: pl };
  }
  // ------------------------------------------------------------------
  // SINGER 2 — the VOX 2 synthesiser driven by a melody. Same contract as
  // the legacy singer (note(t, dur, midi, syl, vel, o) in time order;
  // dispose(fade)). Each sung syllable becomes segments (onset consonants
  // sung ahead of the beat, sustained pure vowel with a late diphthong
  // glide, coda consonants) on one continuous frame timeline; the pitch
  // track carries the crooner's scoop / legato portamento, a delayed
  // vibrato that blooms on held notes, the swell and the jazz fall-off.
  // Rendering is lazy (a shared ~100 ms pump renders ≈ 0.5 s ahead), in
  // crossfaded chunks, so a bar of notes never stalls the main thread.
  // ------------------------------------------------------------------
  // Round 1 revision (singing pass): breathier, warmer sources (higher open quotient, more aspiration, darker tilt),
  // sung-vowel formant tuning (f1k: a more open jaw; F1 follows f0 on high notes), a singer's-formant cluster for the
  // crooner (sf: F3/F4/F5 pulled together near 2.6–3.4 kHz), vibrato that develops (delay → S-curve onset, rate
  // settling upward, per-note depth, coupled amplitude vibrato), slow pitch wander, smooth portamento, audible
  // breath intakes, a plate/echo-chamber send and (girl-group doubles) an ensemble chorus.
  const SING2 = {
    male: {
      f0: 110,
      tilt: 0.36,
      oq: 0.63,
      jitter: 0.005,
      shimmer: 0.028,
      breath: 0.058,
      vib: [5.4, 0.016],
      gain: 0.86,
      warmth: 5,
      scoop: 0.95,
      fs: 1.0,
      f1k: 1.05,
      sf: 1,
      plate: 0.2,
      pres: 2.5,
    },
    female: {
      f0: 220,
      tilt: 0.38,
      oq: 0.68,
      jitter: 0.004,
      shimmer: 0.024,
      breath: 0.078,
      vib: [5.9, 0.018],
      gain: 0.8,
      warmth: 2,
      scoop: 0.962,
      fs: 1.17,
      f1k: 1.07,
      sf: 0,
      plate: 0.24,
      pres: 3.5,
    },
  };
  // Shared plate / echo-chamber reverb per destination (the station chain input): 1950s records put the singer in an
  // echo chamber, the band mostly dry. One ConvolverNode per chain, IR generated once (≈ 1.4 s, darkening tail).
  const PLATES = typeof WeakMap !== "undefined" ? new WeakMap() : null;
  function vocalPlate(ctx, dest) {
    let cv = PLATES && PLATES.get(dest);
    if (cv) return cv;
    const sr = ctx.sampleRate,
      len = Math.floor(sr * 1.4),
      pre = Math.floor(sr * 0.014),
      ir = ctx.createBuffer(2, len, sr);
    let a = 0x2545f491;
    const rnd = () => {
      a ^= a << 13;
      a ^= a >>> 17;
      a ^= a << 5;
      return ((a >>> 0) / 4294967296) * 2 - 1;
    };
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = pre; i < len; i++) {
        const tt = (i - pre) / sr,
          k = Math.exp((-tt * 3.9) / 1.1); // RT60 ≈ 1.1 s
        const c = 0.55 - 0.4 * Math.min(1, tt / 1.0); // the tail darkens
        lp += c * (rnd() - lp);
        d[i] = lp * k * (tt < 0.004 ? tt / 0.004 : 1);
      }
    }
    cv = ctx.createConvolver();
    cv.buffer = ir;
    const g = ctx.createGain();
    g.gain.value = 0.9;
    const hp = bq(ctx, "highpass", 300, 0.7);
    cv.connect(hp);
    hp.connect(g);
    g.connect(dest);
    if (PLATES) PLATES.set(dest, cv);
    return cv;
  }
  const OLD2K = { H: "HH" };
  const oldV2K = (v) =>
    v.length > 1
      ? OLD_D[v.join("-")] || OLD_V[v[0]] || "AX"
      : OLD_V[v[0]] || "AX";
  const live2 = new Set();
  let pumpTimer = 0;
  function pumpAll() {
    live2.forEach((sg) => {
      try {
        sg._pump();
      } catch (e) {
        G.reportError && G.reportError("sound:singer", e);
        live2.delete(sg);
      }
    });
    if (!live2.size && pumpTimer) {
      clearInterval(pumpTimer);
      pumpTimer = 0;
    }
  }
  function singer2(ctx, dest, opts) {
    opts = opts || {};
    const V = SING2[opts.voice] || SING2.male;
    const fs = V.fs * (opts.fs || 1),
      det = Math.pow(2, (opts.detune || 0) / 1200);
    const P = { rate: 1, breath: V.breath * (opts.breath || 1), tilt: V.tilt };
    const vibRateK = opts.vibRate || 0.96 + Math.random() * 0.08; // every singer of a group has her own vibrato
    // frame timeline anchored on the context's sample grid
    const t0 =
      Math.ceil(
        Math.max(ctx.currentTime + 0.02, opts.start || 0) * ctx.sampleRate,
      ) / ctx.sampleRate;
    const m = {
      sr: VSR,
      hop: HOP,
      np: NP,
      n: 0,
      off: 0,
      p: new Float32Array(0),
      f5: (V.sf ? 3350 : 3750) * fs,
      f6: 4700 * Math.sqrt(fs),
      oq: V.oq,
      jitter: V.jitter,
      shimmer: V.shimmer,
      gain: 1,
      pe: 1.8,
      ta: 0.00016,
    };
    const st = klattState(m, (Math.random() * 4294967296) >>> 0);
    const nodes = [];
    const mk = (n) => {
      nodes.push(n);
      return n;
    };
    const warm = mk(bq(ctx, "lowshelf", 220, 0.7, V.warmth * 0.6));
    const hp = mk(bq(ctx, "highpass", 90, 0.7));
    const pres = mk(bq(ctx, "peaking", 2800, 1.1, V.pres)); // ribbon-mic presence (the crooner's own singer's formant does the rest)
    const out = mk(ctx.createGain());
    out.gain.value =
      (opts.gain === undefined ? 1 : opts.gain) * V.gain * SING_NORM;
    warm.connect(hp);
    hp.connect(pres);
    pres.connect(out);
    const oscs = [];
    if (opts.ensemble) {
      // ensemble chorus for doubled parts: a slowly modulated 10–18 ms copy (two throats never sit on one pitch/time)
      const cd = mk(ctx.createDelay(0.05));
      cd.delayTime.value = 0.011 + Math.random() * 0.006;
      const lfo = mk(ctx.createOscillator());
      lfo.frequency.value = 0.3 + Math.random() * 0.4;
      const lg = mk(ctx.createGain());
      lg.gain.value = 0.0024;
      lfo.connect(lg);
      lg.connect(cd.delayTime);
      const cg = mk(ctx.createGain());
      cg.gain.value = 0.5;
      pres.connect(cd);
      cd.connect(cg);
      cg.connect(out);
      try {
        lfo.start();
        oscs.push(lfo);
      } catch (e) {
        /* */
      }
    }
    if (opts.delay) {
      const dl = mk(ctx.createDelay(0.2));
      dl.delayTime.value = opts.delay;
      out.connect(dl);
      dl.connect(dest);
    } else out.connect(dest);
    // echo-chamber send (shared per destination)
    const plateK = opts.plate === undefined ? V.plate : opts.plate;
    if (plateK > 0) {
      try {
        const sd = mk(ctx.createGain());
        sd.gain.value = plateK;
        out.connect(sd);
        sd.connect(vocalPlate(ctx, dest));
      } catch (e) {
        /* no convolver: dry */
      }
    }
    const srcs = new Set();
    const queue = []; // planned notes waiting to be rendered: {fa, fb, p (frames fa..fb+XF)}
    let cursor = t0,
      lastPitch = 0,
      voiced = false,
      voicedUntil = 0,
      disposed = false,
      prevSeg = null,
      lastV = 0,
      vibPh = 0,
      planF = 0,
      wob = 0;
    const sched = (data, fa, fadeIn) => {
      const at = t0 + fa * FR,
        now = ctx.currentTime;
      if (at + data.length / VSR <= now + 0.01) return;
      const buf = ctx.createBuffer(1, data.length, VSR);
      if (buf.copyToChannel) buf.copyToChannel(data, 0);
      else buf.getChannelData(0).set(data);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(warm);
      if (at < now) src.start(now, now - at);
      else src.start(at);
      srcs.add(src);
      src.onended = () => {
        srcs.delete(src);
        try {
          src.disconnect();
        } catch (e) {
          /* */
        }
      };
    };
    // sung notes render in the VOX worker (continuous synth state per singer there); main-thread pump as fallback
    let sid = 0;
    const wk = !isOffline(ctx) ? voxWorker() : null;
    if (wk) {
      sid = ++VW.id;
      VW.h.set(sid, (d) => {
        if (disposed) return;
        if (d.failed) {
          sid = 0;
          return;
        }
        if (d.data) sched(d.data, d.from, false);
      });
      const mm = Object.assign({}, m);
      mm.p = new Float32Array(0);
      wk.postMessage({ op: "singer", id: sid, m: mm, seed: st.seed });
    }
    const api = {
      start: t0,
      _pump(until) {
        if (disposed) return;
        const lim = until === undefined ? ctx.currentTime + 0.5 : until;
        while (queue.length && t0 + queue[0].fa * FR < lim) {
          const q = queue.shift();
          if (st.f < q.fa) {
            // a long silence between phrases: start fresh there (the tract has rung out)
            const s2 = klattState(m, st.seed);
            s2.f = q.fa;
            Object.assign(st, s2);
            st.fresh = true;
          }
          m.p = q.p;
          m.off = q.pa;
          m.n = q.pn;
          const data = renderXF(m, st, q.fb, !st.fresh && q.fa > 0);
          st.fresh = false;
          sched(data, q.startF, false);
        }
      },
      /** Sing one syllable. The vowel starts at t and the syllable (coda included) ends at t + dur. */
      note(t, dur, midi, syl, vel, o) {
        if (disposed || !syl) return;
        o = o || {};
        vel = vel === undefined ? 1 : vel;
        const f = S.mtof(midi) * det;
        const floor = Math.max(cursor, ctx.currentTime + 0.01);
        if (t + dur <= floor + 0.05) return;
        // onset / coda timing exactly as the composer expects (legacy onsetDur), phones from the lexicon
        const Fa = VF[syl.v[0]] || VF.schwa;
        const onOld = consSegs(syl.on, Fa),
          coOld = consSegs(syl.co, VF[syl.v[syl.v.length - 1]] || Fa);
        const onD = onOld.reduce((a, s) => a + s.d, 0);
        let start = t - onD,
          k = 1;
        if (start < floor) {
          k =
            onD > 0 ? Math.max(0.35, Math.min(1, (t + 0.03 - floor) / onD)) : 1;
          start = floor;
        }
        const legato =
          voiced && start - voicedUntil < 0.07 && o.legato !== false;
        const end = t + dur;
        const coD0 = coOld.reduce((a, s) => a + s.d, 0);
        const kc = coD0 > 0 ? Math.min(1, (dur * 0.35) / coD0) : 1;
        // segments (times relative to t0)
        const segs = [];
        if (prevSeg && legato) segs.push(prevSeg);
        // an audible breath before a phrase (when there's room): the singer fills her lungs
        const brD =
          o.breath && !legato && start - 0.26 > floor
            ? 0.2 + Math.random() * 0.05
            : 0;
        if (brD) {
          start -= brD + 0.02;
          segs.push({ p: "BR", k: { c: "BR" }, t: start - t0, d: brD, st: -1 });
        }
        let tt = start - t0 + (brD ? brD + 0.02 : 0);
        const pushC = (list, scale) => {
          for (const ph of list) {
            const kp = KP[OLD2K[ph] || ph];
            if (!kp) continue;
            const d0 = (kp.di / 1000) * 0.75 * scale;
            if (kp.c === "S" || kp.c === "A") {
              const bd = kp.pl === "vel" ? 0.014 : 0.01,
                asp = kp.vc ? 0.006 : 0.025 * scale;
              const cl = Math.max(0.02, d0 - bd - asp);
              segs.push({ p: ph, k: kp, sub: "cl", t: tt, d: cl, st: -1 });
              tt += cl;
              segs.push({ p: ph, k: kp, sub: "bu", t: tt, d: bd, st: -1 });
              tt += bd;
              segs.push({
                p: ph,
                k: kp,
                sub: "as",
                t: tt,
                d: asp,
                st: -1,
                strong: true,
              });
              tt += asp;
            } else {
              segs.push({ p: OLD2K[ph] || ph, k: kp, t: tt, d: d0, st: -1 });
              tt += d0;
            }
          }
        };
        // fit the onset exactly into [start, t)
        const onPh = [].concat(syl.on);
        const onNominal = onPh.reduce((a, ph) => {
          const kp = KP[OLD2K[ph] || ph];
          return a + (kp ? (kp.di / 1000) * 0.75 : 0);
        }, 0);
        pushC(
          onPh,
          onNominal > 0
            ? Math.max(0.2, (t - start - (brD ? brD + 0.02 : 0)) / onNominal)
            : 1,
        );
        const vs = Math.max(tt, t - t0 - 0.01);
        const coPh = [].concat(syl.co);
        const coNominal = coPh.reduce((a, ph) => {
          const kp = KP[OLD2K[ph] || ph];
          return a + (kp ? (kp.di / 1000) * 0.75 : 0);
        }, 0);
        const coLen = coD0 * kc;
        const vEnd = Math.max(vs + 0.05, end - t0 - coLen);
        const vk = KP[oldV2K(syl.v)] || KP.AX;
        const vl = vEnd - vs;
        const vSeg = {
          p: oldV2K(syl.v),
          k: vk,
          t: vs,
          d: vl,
          st: syl.stressed ? 1 : 0,
          av: vel * (syl.stressed ? 1 : 0.9),
          glide: vk.F2t
            ? [Math.max(0.05, 1 - Math.min(0.14, vl * 0.35) / vl - 0.02), 0.97]
            : null,
        };
        segs.push(vSeg);
        tt = vEnd;
        pushC(coPh, coNominal > 0 ? Math.max(0.2, coLen / coNominal) : 1);
        const segEnd = tt;
        if (!o.legato)
          segs.push({ p: "PAU", k: { c: "PAU" }, t: segEnd, d: 0.12, st: -1 });
        // frames for this note: [fa, fb) + XF tail frames
        const prevFb = queue.length
          ? queue[queue.length - 1].fb
          : Math.max(st.f, planF);
        let fa = Math.max(prevFb, Math.round((start - t0) / FR));
        const bridge = fa - prevFb <= 40 && prevFb > 0; // short rests are rendered (continuous state), long ones skipped
        if (bridge) fa = prevFb;
        const fb = Math.max(
          fa + 2,
          Math.round((o.legato ? segEnd : segEnd + 0.09) / FR),
        );
        const pa = fa,
          pn = fb - fa + XF + 2;
        const tr = [];
        for (let i = 0; i < NP; i++) tr.push(new Track());
        if (!legato)
          [iAV, iAVS, iAH, iAF].forEach((i) => tr[i].add(fa * FR, 0)); // a detached note starts from silence
        segTracks(segs, P, tr);
        tr[iFNZ].add(0, 270);
        const p = new Float32Array(pn * NP);
        for (let i = 0; i < NP; i++) if (i !== iF0) tr[i].fill(p, i, pn, pa);
        // pitch: portamento between legato notes, scoop into detached ones, delayed vibrato, swell, fall-off
        const tS = start - t0 + (brD ? brD + 0.02 : 0),
          tV = vs,
          tE = vEnd,
          scoopEnd = t - t0 + (o.scoop === false ? 0.02 : 0.09);
        const pStart =
          legato && lastPitch
            ? lastPitch
            : f * (o.scoop === false ? 1 : V.scoop);
        const vibD = f * V.vib[1] * (o.vib || 1) * (0.85 + Math.random() * 0.3),
          vibRate = V.vib[0] * vibRateK;
        // vibrato develops: none for ~160 ms, an S-curve bloom over ~300 ms, the rate settling up from 90 %
        const vDel = 0.16,
          vGrow = Math.max(0.12, Math.min(0.32, vl * 0.45));
        const sstep = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
        for (let i = 0; i < pn; i++) {
          const tf = (pa + i) * FR,
            q = i * NP;
          let pf = f;
          if (tf < scoopEnd)
            pf =
              pStart +
              (f - pStart) * sstep((tf - tS) / Math.max(0.02, scoopEnd - tS)); // smooth portamento / scoop
          if (o.fall && tf > tE) pf *= 1 - 0.07 * Math.min(1, (tf - tE) / 0.1);
          let env = vl > 0.3 ? sstep((tf - tV - vDel) / vGrow) : 0;
          if (tf > tE) env *= Math.max(0, 1 - (tf - tE) / 0.05);
          vibPh += 2 * Math.PI * vibRate * (0.9 + 0.1 * env) * FR;
          wob = wob * 0.96 + (Math.random() - 0.5) * 0.0011; // slow pitch wander (a human never holds dead-still)
          const sv = Math.sin(vibPh);
          p[q + iF0] = pf * (1 + wob) + vibD * env * sv;
          // held notes swell a little; amplitude vibrato rides with the pitch vibrato (source-formant interaction)
          if (vl > 0.6 && tf > tV && tf < tE)
            p[q + iAV] *= 1 + (0.1 * (tf - tV)) / vl;
          if (env > 0) p[q + iAV] *= 1 + 0.06 * env * sv;
          // sung-vowel formants: open jaw (F1↑), F1 tuned above f0 on high notes, singer's-formant cluster (crooner)
          const voicedV = tf >= tV && tf <= tE;
          p[q + iF1] *= fs * (voicedV ? V.f1k : 1);
          p[q + iF2] *= fs;
          p[q + iF3] *= fs;
          if (voicedV && p[q + iF1] < pf * 1.1) p[q + iF1] = pf * 1.1;
          if (V.sf && voicedV && p[q + iF3] < 2550 * fs)
            p[q + iF3] += (2550 * fs - p[q + iF3]) * 0.4;
          p[q + iF4] = (V.sf ? 2950 : 3300) * fs;
          if (!(p[q + iB1] > 20)) p[q + iB1] = 80;
          if (!(p[q + iB2] > 20)) p[q + iB2] = 100;
          if (!(p[q + iB3] > 20)) p[q + iB3] = 150;
          if (!(p[q + iFNZ] > 100)) p[q + iFNZ] = 270;
          if (!(p[q + iTL] > 0)) p[q + iTL] = V.tilt;
          p[q + iFRY] = 0;
        }
        // the tail frames hold the last values (the crossfade blends them with whatever comes next)
        for (let i = fb - pa; i < pn; i++)
          p.copyWithin(i * NP, (fb - pa - 1) * NP, (fb - pa) * NP);
        const qn = { fa, fb, pa, pn, p, startF: fa };
        planF = fb;
        if (sid && VW.w) {
          try {
            VW.w.postMessage({ op: "note", id: sid, q: qn }, [p.buffer]);
          } catch (e) {
            sid = 0;
            queue.push(qn);
          }
        } else queue.push(qn);
        prevSeg = segs.filter((s) => s.k.c !== "PAU").pop() || null;
        if (o.legato) {
          voiced = true;
          voicedUntil = segEnd + t0;
          cursor = segEnd + t0;
        } else {
          voiced = false;
          voicedUntil = segEnd + t0;
          cursor = segEnd + t0 + 0.1;
          prevSeg = null;
        }
        lastPitch = f;
        if (queue.length) {
          live2.add(api);
          if (!pumpTimer) pumpTimer = setInterval(pumpAll, 100);
          if (t0 + fa * FR < ctx.currentTime + 0.25) api._pump();
        }
      },
      /** Render everything planned (offline renders). */
      flush() {
        api._pump(Infinity);
      },
      /** Stop singing and free the graph. */
      dispose(fade) {
        if (disposed) return;
        disposed = true;
        live2.delete(api);
        queue.length = 0;
        if (sid) {
          VW.h.delete(sid);
          if (VW.w) {
            try {
              VW.w.postMessage({ op: "cancel", id: sid });
            } catch (e) {
              /* */
            }
          }
        }
        const t = ctx.currentTime,
          f = fade === undefined ? 0.1 : fade;
        try {
          out.gain.cancelScheduledValues(t);
          out.gain.setValueAtTime(out.gain.value, t);
          out.gain.linearRampToValueAtTime(0, t + f);
        } catch (e) {
          /* */
        }
        srcs.forEach((s) => {
          try {
            s.stop(t + f + 0.05);
          } catch (e) {
            /* */
          }
        });
        oscs.forEach((s) => {
          try {
            s.stop(t + f + 0.3);
          } catch (e) {
            /* */
          }
        });
        setTimeout(
          () => {
            srcs.forEach((s) => {
              try {
                s.disconnect();
              } catch (e) {
                /* */
              }
            });
            nodes.forEach((n) => {
              try {
                n.disconnect();
              } catch (e) {
                /* */
              }
            });
          },
          (f + 0.4) * 1000,
        );
      },
    };
    return api;
  }

  /** Word → the singer's phone format (lexicon-driven), with stress. */
  function singPhones(w) {
    const pr = pron(w),
      out = [];
    const MAP = { HH: ["H"], CH: ["T", "SH"], JH: ["D", "ZH"], DX: ["D"] };
    for (const x of pr) {
      if (x.st >= 0) {
        const v = ARPA_SING[x.p] || ["schwa"];
        out.push({ k: v.length > 1 ? "D" : "V", v: v.slice(), st: x.st });
      } else (MAP[x.p] || [x.p]).forEach((p) => out.push({ k: "C", p }));
    }
    return out;
  }

  S.vox = {
    say: say2,
    sayFormant: say,
    tokenWords,
    plan,
    plan2,
    renderLine,
    pron,
    phrases,
    wordPhones,
    PROFILES,
    syllables,
    singer: singer2,
    singerFormant: singer,
    onsetDur,
    stripMarks,
    unknownWords,
    lexiconSize: () => Object.keys(lex()).length,
    workerStats: () => ({
      worker: !!VW.w,
      failed: VW.failed,
      chunks: VW.chunks,
      live: VW.h.size,
      lexicon: Object.keys(lex()).length,
    }),
  };
  // ------------------------------------------------------------------
  // Pronouncing lexicon (ARPAbet, stress 1/2/0) for every word the radio
  // scripts, lyrics and quest news use, plus common English. Inflections
  // (-s, -ed, -ing, -er, -ly, 's, n't …) and compounds resolve on the stem.
  // ------------------------------------------------------------------
  S.voxLexicon = `
a AH0
aaron EH1 R AH0 N
ab AE1 B
abigail AE1 B AH0 G EY2 L
able EY1 B AH0 L
about AH0 B AW1 T
above AH0 B AH1 V
accept AE0 K S EH1 P T
accordance AH0 K AO1 R D AH0 N S
across AH0 K R AO1 S
acting AE1 K T IH0 NG
action AE1 K SH AH0 N
activity AE0 K T IH1 V AH0 T IY0
actual AE1 K CH UW0 AH0 L
actually AE1 K CH UW0 AH0 L IY0
adagio AH0 D AA1 ZH IY0 OW2
adam AE1 D AH0 M
add AE1 D
address AE1 D R EH2 S
admire AE0 D M AY1 ER0
advice AE0 D V AY1 S
afraid AH0 F R EY1 D
after AE1 F T ER0
afternoon AE2 F T ER0 N UW1 N
again AH0 G EH1 N
against AH0 G EH1 N S T
age EY1 JH
ago AH0 G OW1
ahh AA1
ain't EY1 N T
air EH1 R
albrecht AE1 L B R EH0 K T
aldous AO1 L D AH0 S
alex AE1 L AH0 K S
alexander AE2 L AH0 G Z AE1 N D ER0
algonquin AE0 L G AA1 NG K W IH0 N
alice AE1 L AH0 S
alive AH0 L AY1 V
all AO1 L
almost AO1 L M OW2 S T
alone AH0 L OW1 N
along AH0 L AO1 NG
already AO0 L R EH1 D IY0
alright AO2 L R AY1 T
also AO1 L S OW0
although AO2 L DH OW1
always AO1 L W EY2 Z
am AE1 M
amanda AH0 M AE1 N D AH0
america AH0 M EH1 R AH0 K AH0
american AH0 M EH1 R AH0 K AH0 N
americans AH0 M EH1 R AH0 K AH0 N Z
among AH0 M AH1 NG
amplifier AE1 M P L AH0 F AY2 ER0
amused AH0 M Y UW1 Z D
amy EY1 M IY0
an AE1 N
and AE1 N D
andrew AE1 N D R UW2
andy AE1 N D IY0
angela AE1 N JH AH0 L AH0
angry AE1 NG G R IY0
anna AE1 N AH0
anne AE1 N
announcement AH0 N AW1 N S M AH0 N T
another AH0 N AH1 DH ER0
answer AE1 N S ER0
answers AE1 N S ER0 Z
antenna AE0 N T EH1 N AH0
anthony AE1 N TH AH0 N IY0
anton AE1 N T AA0 N
any EH1 N IY0
anybody EH1 N IY0 B AA2 D IY0
anymore EH2 N IY0 M AO1 R
anyone EH1 N IY0 W AH2 N
anything EH1 N IY0 TH IH2 NG
anyway EH1 N IY0 W EY2
anywhere EH1 N IY0 W EH2 R
apple AE1 P AH0 L
applicants AE1 P L IH0 K AH0 N T S
archives AA1 R K AY2 V Z
are AA1 R
area EH1 R IY0 AH0
armor AA1 R M ER0
army AA1 R M IY0
around ER0 AW1 N D
arrives ER0 AY1 V Z
art AA1 R T
artie AA1 R T IY0
artist AA1 R T IH0 S T
as AE1 Z
ashley AE1 SH L IY0
ask AE1 S K
asked AE1 S K T
asking AE1 S K IH0 NG
asks AE1 S K S
assigned AH0 S AY1 N D
astoria AH0 S T AO1 R IY0 AH0
asylum AH0 S AY1 L AH0 M
at AE1 T
ate EY1 T
atom AE1 T AH0 M
atomettes AE2 T AH0 M EH1 T S
atomic AH0 T AA1 M IH0 K
atrium EY1 T R IY0 AH0 M
attended AH0 T EH1 N D IH0 D
attention AH0 T EH1 N SH AH0 N
aurelio AO0 R EH1 L IY0 OW0
authority AH0 TH AO1 R AH0 T IY0
automat AO1 T AH0 M AE2 T
automatic AO2 T AH0 M AE1 T IH0 K
avenue AE1 V AH0 N UW2
away AH0 W EY1
baby B EY1 B IY0
back B AE1 K
bad B AE1 D
ballad B AE1 L AH0 D
ballroom B AO1 L R UW2 M
band B AE1 N D
bartender B AA1 R T EH2 N D ER0
barter B AA1 R T ER0
bartholomew B AA0 R TH AA1 L AH0 M Y UW2
basement B EY1 S M AH0 N T
basically B EY1 S IH0 K L IY0
bathe B EY1 DH
battery B AE1 T ER0 IY0
bb B IY1 B IY1
be B IY1
beans B IY1 N Z
bear B EH1 R
beautiful B Y UW1 T AH0 F AH0 L
became B IH0 K EY1 M
because B IH0 K AO1 Z
been B IH1 N
beer B IH1 R
before B IH0 F AO1 R
began B IH0 G AE1 N
begins B IH0 G IH1 N Z
behind B IH0 HH AY1 N D
believe B IH0 L IY1 V
bell B EH1 L
bellevue B EH1 L V Y UW2
belong B IH0 L AO1 NG
below B IH0 L OW1
belt B EH1 L T
ben B EH1 N
beneath B IH0 N IY1 TH
benedetti B EH2 N AH0 D EH1 T IY0
benjamin B EH1 N JH AH0 M AH0 N
beside B IH0 S AY1 D
best B EH1 S T
beth B EH1 TH
bethesda B AH0 TH EH1 Z D AH0
better B EH1 T ER0
betty B EH1 T IY0
between B IH0 T W IY1 N
beyond B IH0 AA1 N D
bible B AY1 B AH0 L
big B IH1 G
bill B IH1 L
billy B IH1 L IY0
bird B ER1 D
bit B IH1 T
bixby B IH1 K S B IY0
black B L AE1 K
bless B L EH1 S
blinking B L IH1 NG K IH0 NG
blue B L UW1
bob B AA1 B
body B AA1 D IY0
bomb B AA1 M
boogie B UH1 G IY0
book B UH1 K
bop B AA1 P
borough B ER1 OW0
borrow B AA1 R OW0
bos B IY1 OW1 EH1 S
boss B AO1 S
both B OW1 TH
bottle B AA1 T AH0 L
bought B AO1 T
boulevard B UH1 L AH0 V AA2 R D
bowery B AW1 ER0 IY0
bowl B OW1 L
box B AA1 K S
boy B OY1
brady B R EY1 D IY0
brand B R AE1 N D
brass B R AE1 S
breach B R IY1 CH
breath B R EH1 TH
brennan B R EH1 N AH0 N
brewing B R UW1 IH0 NG
brian B R AY1 AH0 N
brick B R IH1 K
bridge B R IH1 JH
bridgemarket B R IH1 JH M AA2 R K IH0 T
brief B R IY1 F
bright B R AY1 T
bring B R IH1 NG
broadcast B R AO1 D K AE2 S T
broadcasting B R AO1 D K AE2 S T IH0 NG
broadway B R AO1 D W EY2
broke B R OW1 K
bronx B R AA1 NG K S
brooklyn B R UH1 K L IH0 N
brought B R AO1 T
brown B R AW1 N
bruno B R UW1 N OW0
buddy B AH1 D IY0
build B IH1 L D
built B IH1 L T
bulletin B UH1 L AH0 T AH0 N
bullets B UH1 L AH0 T S
burn B ER1 N
bury B EH1 R IY0
business B IH1 Z N AH0 S
but B AH1 T
buy B AY1
by B AY1
c S IY1
cake K EY1 K
call K AO1 L
calmly K AA1 M L IY0
came K EY1 M
campaign K AE0 M P EY1 N
can K AE1 N
can't K AE1 N T
canal K AH0 N AE1 L
cannot K AE1 N AA0 T
cap K AE1 P
car K AA1 R
caravan K EH1 R AH0 V AE2 N
caravans K EH1 R AH0 V AE2 N Z
card K AA1 R D
care K EH1 R
carefully K EH1 R F AH0 L IY0
carl K AA1 R L
carnegie K AA1 R N AH0 G IY0
carol K EH1 R AH0 L
carried K EH1 R IY0 D
carrow K EH1 R OW0
carts K AA1 R T S
case K EY1 S
castellano K AE2 S T AH0 L AA1 N OW0
cellar S EH1 L ER0
centaur S EH1 N T AO2 R
center S EH1 N T ER0
central S EH1 N T R AH0 L
certain S ER1 T AH0 N
certainly S ER1 T AH0 N L IY0
champion CH AE1 M P IY0 AH0 N
championship CH AE1 M P IY0 AH0 N SH IH2 P
chance CH AE1 N S
change CH EY1 N JH
charged CH AA1 R JH D
charging CH AA1 R JH IH0 NG
charles CH AA1 R L Z
charlie CH AA1 R L IY0
charlotte SH AA1 R L AH0 T
chase CH EY1 S
check CH EH1 K
chelsea CH EH1 L S IY0
child CH AY1 L D
children CH IH1 L D R AH0 N
chinatown CH AY1 N AH0 T AW2 N
chinese CH AY0 N IY1 Z
chloe K L OW1 IY0
choice CH OY1 S
choked CH OW1 K T
choose CH UW1 Z
chorus K AO1 R AH0 S
chose CH OW1 Z
chris K R IH1 S
christina K R IH0 S T IY1 N AH0
christine K R IH0 S T IY1 N
christopher K R IH1 S T AH0 F ER0
chrysler K R AY1 S L ER0
chum CH AH1 M
church CH ER1 CH
cinnamon S IH1 N AH0 M AH0 N
citizen S IH1 T AH0 Z AH0 N
city S IH1 T IY0
civic S IH1 V IH0 K
civil S IH1 V AH0 L
civilization S IH2 V AH0 L AH0 Z EY1 SH AH0 N
claire K L EH1 R
clapped K L AE1 P T
clara K L EH1 R AH0
clarified K L EH1 R AH0 F AY2 D
clarinet K L EH2 R AH0 N EH1 T
class K L AE1 S
classical K L AE1 S IH0 K AH0 L
clean K L IY1 N
clear K L IH1 R
cleared K L IH1 R D
clearer K L IH1 R ER0
clicks K L IH1 K S
close K L OW1 S
closed K L OW1 Z D
closer K L OW1 S ER0
closing K L OW1 Z IH0 NG
cloud K L AW1 D
cloudy K L AW1 D IY0
coats K OW1 T S
coffee K AO1 F IY0
cola K OW1 L AH0
cold K OW1 L D
collective K AH0 L EH1 K T IH0 V
collectors K AH0 L EH1 K T ER0 Z
college K AA1 L IH0 JH
colonel K ER1 N AH0 L
columbia K AH0 L AH1 M B IY0 AH0
come K AH1 M
commerce K AA1 M ER0 S
commodore K AA1 M AH0 D AO2 R
communist K AA1 M Y AH0 N IH0 S T
communists K AA1 M Y AH0 N IH0 S T S
community K AH0 M Y UW1 N AH0 T IY0
company K AH1 M P AH0 N IY0
complained K AH0 M P L EY1 N D
computer K AH0 M P Y UW1 T ER0
concrete K AA1 N K R IY0 T
conductor K AH0 N D AH1 K T ER0
congratulations K AH0 N G R AE2 CH AH0 L EY1 SH AH0 N Z
conscience K AA1 N SH AH0 N S
consider K AH0 N S IH1 D ER0
consort K AA1 N S AO0 R T
contains K AH0 N T EY1 N Z
continue K AH0 N T IH1 N Y UW0
control K AH0 N T R OW1 L
coolant K UW1 L AH0 N T
cooperation K OW0 AA2 P ER0 EY1 SH AH0 N
cootie K UW1 T IY0
copies K AA1 P IY0 Z
corner K AO1 R N ER0
cost K AO1 S T
could K UH1 D
counted K AW1 N T IH0 D
counter K AW1 N T ER0
counting K AW1 N T IH0 NG
couple K AH1 P AH0 L
courier K ER1 IY0 ER0
course K AO1 R S
court K AO1 R T
cousin K AH1 Z AH0 N
cover K AH1 V ER0
crabs K R AE1 B Z
crackle K R AE1 K AH0 L
cram K R AE1 M
crane K R EY1 N
crayon K R EY1 AA0 N
credits K R EH1 D IH0 T S
crew K R UW1
critic K R IH1 T IH0 K
croke K R OW1 K
crowe K R OW1
crunch K R AH1 N CH
crust K R AH1 S T
cry K R AY1
crypt K R IH1 P T
crystal K R IH1 S T AH0 L
cue K Y UW1
culture K AH1 L CH ER0
current K ER1 AH0 N T
cut K AH1 T
d D IY1
damp D AE1 M P
dance D AE1 N S
dangerous D EY1 N JH ER0 AH0 S
daniel D AE1 N Y AH0 L
danny D AE1 N IY0
dare D EH1 R
dark D AA1 R K
darling D AA1 R L IH0 NG
data D EY1 T AH0
dave D EY1 V
david D EY1 V IH0 D
dawn D AO1 N
day D EY1
days D EY1 Z
dead D EH1 D
deal D IY1 L
dean D IY1 N
dear D IH1 R
death D EH1 TH
decade D EH1 K EY2 D
deceased D IH0 S IY1 S T
decided D IH0 S AY1 D IH0 D
decision D IH0 S IH1 ZH AH0 N
deck D EH1 K
declared D IH0 K L EH1 R D
dedications D EH2 D IH0 K EY1 SH AH0 N Z
deed D IY1 D
deep D IY1 P
defense D IH0 F EH1 N S
definitely D EH1 F AH0 N AH0 T L IY0
delacroix D EH1 L AH0 K R W AA2
delano D EH1 L AH0 N OW2
delicious D IH0 L IH1 SH AH0 S
delighted D IH0 L AY1 T IH0 D
delmonico D EH0 L M AA1 N IH0 K OW2
desk D EH1 S K
destroyed D IH0 S T R OY1 D
detonator D EH1 T AH0 N EY2 T ER0
detour D IY1 T UH2 R
development D IH0 V EH1 L AH0 P M AH0 N T
dial D AY1 AH0 L
diamond D AY1 M AH0 N D
diana D AY0 AE1 N AH0
did D IH1 D
didn D IH1 D AH0 N
died D AY1 D
difference D IH1 F ER0 AH0 N S
different D IH1 F ER0 AH0 N T
dignified D IH1 G N AH0 F AY2 D
dignity D IH1 G N AH0 T IY0
director D ER0 EH1 K T ER0
disc D IH1 S K
discipline D IH1 S AH0 P L AH0 N
distress D IH0 S T R EH1 S
district D IH1 S T R IH0 K T
dj D IY1 JH EY2
do D UW1
doc D AA1 K
doctor D AA1 K T ER0
does D AH1 Z
doesn D AH1 Z AH0 N
dog D AO1 G
don D OW1 N
don't D OW1 N T
done D AH1 N
door D AO1 R
dorothy D AO1 R AH0 TH IY0
dot D AA1 T
dotty D AA1 T IY0
down D AW1 N
downtown D AW1 N T AW1 N
drank D R AE1 NG K
dream D R IY1 M
drink D R IH1 NG K
driver D R AY1 V ER0
dropping D R AA1 P IH0 NG
drove D R OW1 V
drug D R AH1 G
duck D AH1 K
during D UH1 R IH0 NG
dust D AH1 S T
duvall D UW0 V AE1 L
dweller D W EH1 L ER0
e IY1
each IY1 CH
earl ER1 L
easier IY1 Z IY0 ER0
east IY1 S T
eastern IY1 S T ER0 N
easy IY1 Z IY0
eat IY1 T
eaten IY1 T AH0 N
eb IY1 B IY1
ed EH1 D
eden IY1 D AH0 N
education EH2 JH AH0 K EY1 SH AH0 N
edward EH1 D W ER0 D
effect IH0 F EH1 K T
effort EH1 F ER0 T
eight EY1 T
eighteen EY1 T IY1 N
eighth EY1 T TH
eighty EY1 T IY0
either IY1 DH ER0
elder EH1 L D ER0
election IH0 L EH1 K SH AH0 N
electron IH0 L EH1 K T R AA0 N
elegy EH1 L AH0 JH IY0
elevators EH1 L AH0 V EY2 T ER0 Z
eleven IH0 L EH1 V AH0 N
elizabeth IH0 L IH1 Z AH0 B AH0 TH
ella EH1 L AH0
ellie EH1 L IY0
ellis EH1 L IH0 S
em EH1 M
emergency IH0 M ER1 JH AH0 N S IY0
emily EH1 M AH0 L IY0
emma EH1 M AH0
empire EH1 M P AY0 ER0
empty EH1 M P T IY0
end EH1 N D
endure EH0 N D UH1 R
engines EH1 N JH AH0 N Z
enough IH0 N AH1 F
eric EH1 R IH0 K
escorted EH0 S K AO1 R T IH0 D
eternal IH0 T ER1 N AH0 L
ethan IY1 TH AH0 N
eva IY1 V AH0
even IY1 V IH0 N
evening IY1 V N IH0 NG
event IH0 V EH1 N T
ever EH1 V ER0
every EH1 V R IY0
everybody EH1 V R IY0 B AA2 D IY0
everyone EH1 V R IY0 W AH2 N
everything EH1 V R IY0 TH IH2 NG
everywhere EH1 V R IY0 W EH2 R
evidence EH1 V AH0 D AH0 N S
evil IY1 V AH0 L
exactly IH0 G Z AE1 K T L IY0
exchange IH0 K S CH EY1 N JH
excuse IH0 K S K Y UW1 Z
expectancy IH0 K S P EH1 K T AH0 N S IY0
experience IH0 K S P IH1 R IY0 AH0 N S
extra EH1 K S T R AH0
eye AY1
f EH1 F
face F EY1 S
fact F AE1 K T
faction F AE1 K SH AH0 N
fade F EY1 D
faith F EY1 TH
fall F AO1 L
far F AA1 R
fat F AE1 T
father F AA1 DH ER0
favorite F EY1 V ER0 IH0 T
favourite F EY1 V ER0 IH0 T
fay F EY1
fears F IH1 R Z
fee F IY1
feelings F IY1 L IH0 NG Z
fell F EH1 L
fella F EH1 L AH0
fellas F EH1 L AH0 Z
fellow F EH1 L OW0
felt F EH1 L T
female F IY1 M EY2 L
feral F EH1 R AH0 L
ferry F EH1 R IY0
few F Y UW1
fewer F Y UW1 ER0
field F IY1 L D
fifteen F IH1 F T IY1 N
fifth F IH1 F TH
fifty F IH1 F T IY0
fight F AY1 T
figure F IH1 G Y ER0
film F IH1 L M
final F AY1 N AH0 L
finally F AY1 N AH0 L IY0
finch F IH1 N CH
find F AY1 N D
finest F AY1 N AH0 S T
finish F IH1 N IH0 SH
fire F AY1 ER0
first F ER1 S T
fish F IH1 SH
fission F IH1 SH AH0 N
fitting F IH1 T IH0 NG
five F AY1 V
fix F IH1 K S
flag F L AE1 G
flaky F L EY1 K IY0
flare F L EH1 R
flash F L AE1 SH
flat F L AE1 T
flatiron F L AE1 T AY2 ER0 N
flew F L UW1
flicker F L IH1 K ER0
flooded F L AH1 D IH0 D
floor F L AO1 R
flowers F L AW1 ER0 Z
folks F OW1 K S
fontaine F AA0 N T EY1 N
food F UW1 D
foot F UH1 T
for F AO1 R
force F AO1 R S
forever F ER0 EH1 V ER0
forget F ER0 G EH1 T
forgot F ER0 G AA1 T
forty F AO1 R T IY0
fought F AO1 T
found F AW1 N D
four F AO1 R
fourteen F AO1 R T IY1 N
fourth F AO1 R TH
frame F R EY1 M
frank F R AE1 NG K
frankie F R AE1 NG K IY0
fred F R EH1 D
free F R IY1
freedom F R IY1 D AH0 M
frequency F R IY1 K W AH0 N S IY0
friedrich F R IY1 D R IH0 K
friend F R EH1 N D
friends F R EH1 N D Z
from F R AH1 M
front F R AH1 N T
full F UH1 L
furious F Y UH1 R IY0 AH0 S
further F ER1 DH ER0
fusion F Y UW1 ZH AH0 N
future F Y UW1 CH ER0
g JH IY1
gaines G EY1 N Z
gal G AE1 L
gals G AE1 L Z
game G EY1 M
gang G AE1 NG
gangs G AE1 NG Z
garden G AA1 R D AH0 N
gary G EH1 R IY0
gate G EY1 T
gateway G EY1 T W EY2
gave G EY1 V
gear G IH1 R
geiger G AY1 G ER0
generator JH EH1 N ER0 EY2 T ER0
gentleman JH EH1 N T AH0 L M AH0 N
gentlemen JH EH1 N T AH0 L M IH0 N
george JH AO1 R JH
get G EH1 T
gift G IH1 F T
girl G ER1 L
give G IH1 V
given G IH1 V AH0 N
glow G L OW1
go G OW1
god G AA1 D
goes G OW1 Z
gold G OW1 L D
gone G AO1 N
gonna G AA1 N AH0
good G UH1 D
goodbye G UH2 D B AY1
got G AA1 T
gotham G AA1 TH AH0 M
gotta G AA1 T AH0
government G AH1 V ER0 N M AH0 N T
grace G R EY1 S
grand G R AE1 N D
grandmother G R AE1 N M AH2 DH ER0
gratitude G R AE1 T AH0 T UW2 D
grave G R EY1 V
great G R EY1 T
green G R IY1 N
greenwich G R EH1 N IH0 CH
greg G R EH1 G
grew G R UW1
ground G R AW1 N D
group G R UW1 P
guai G W AY1
guards G AA1 R D Z
guggenheim G UW1 G AH0 N HH AY2 M
guide G AY1 D
gun G AH1 N
gunfire G AH1 N F AY2 ER0
gutenberg G UW1 T AH0 N B ER0 G
guy G AY1
had HH AE1 D
hair HH EH1 R
hairdo HH EH1 R D UW2
half HH AE1 F
hall HH AO1 L
hamilton HH AE1 M AH0 L T AH0 N
hamlet HH AE1 M L AH0 T
hand HH AE1 N D
hangs HH AE1 NG Z
hannah HH AE1 N AH0
happen HH AE1 P AH0 N
happened HH AE1 P AH0 N D
happening HH AE1 P AH0 N IH0 NG
happens HH AE1 P AH0 N Z
happiness HH AE1 P IY0 N AH0 S
happy HH AE1 P IY0
harbor HH AA1 R B ER0
harbour HH AA1 R B ER0
hard HH AA1 R D
harlem HH AA1 R L AH0 M
harriet HH EH1 R IY0 AH0 T
harry HH EH1 R IY0
has HH AE1 Z
hatch HH AE1 CH
hatted HH AE1 T IH0 D
have HH AE1 V
he HH IY1
head HH EH1 D
health HH EH1 L TH
hear HH IH1 R
heard HH ER1 D
heart HH AA1 R T
heavy HH EH1 V IY0
held HH EH1 L D
helen HH EH1 L AH0 N
hello HH AH0 L OW1
help HH EH1 L P
helped HH EH1 L P T
helpfully HH EH1 L P F AH0 L IY0
henry HH EH1 N R IY0
her HH ER1
here HH IH1 R
hero HH IH1 R OW0
heroes HH IH1 R OW0 Z
herself HH ER0 S EH1 L F
hey HH EY1
hid HH IH1 D
hide HH AY1 D
high HH AY1
him HH IH1 M
himself HH IH0 M S EH1 L F
hinges HH IH1 N JH IH0 Z
his HH IH1 Z
history HH IH1 S T ER0 IY0
hit HH IH1 T
hits HH IH1 T S
hmm HH M
hoboken HH OW1 B OW0 K AH0 N
hold HH OW1 L D
holed HH OW1 L D
hollis HH AA1 L IH0 S
home HH OW1 M
honey HH AH1 N IY0
hospital HH AA1 S P IH2 T AH0 L
host HH OW1 S T
hot HH AA1 T
hour AW1 ER0
hours AW1 ER0 Z
house HH AW1 S
how HH AW1
however HH AW0 EH1 V ER0
hudson HH AH1 D S AH0 N
humming HH AH1 M IH0 NG
hundred HH AH1 N D R AH0 D
hung HH AH1 NG
hurry HH ER1 IY0
hurt HH ER1 T
i AY1
i'd AY1 D
i'll AY1 L
i'm AY1 M
i've AY1 V
idea AY0 D IY1 AH0
idiot IH1 D IY0 AH0 T
if IH1 F
iggy IH1 G IY0
iguana IH0 G W AA1 N AH0
illusion IH0 L UW1 ZH AH0 N
image IH1 M IH0 JH
important IH0 M P AO1 R T AH0 N T
impressed IH0 M P R EH1 S T
in IH1 N
indoors IH0 N D AO1 R Z
industries IH1 N D AH0 S T R IY0 Z
industry IH1 N D AH0 S T R IY0
inform IH0 N F AO1 R M
information IH2 N F ER0 M EY1 SH AH0 N
inside IH0 N S AY1 D
intend IH0 N T EH1 N D
interest IH1 N T R AH0 S T
into IH1 N T UW0
irradiated IH0 R EY1 D IY0 EY2 T IH0 D
is IH1 Z
isaac AY1 Z AH0 K
isabella IH2 Z AH0 B EH1 L AH0
island AY1 L AH0 N D
isn IH1 Z AH0 N
isn't IH1 Z AH0 N T
issue IH1 SH UW0
issuing IH1 SH UW0 IH0 NG
it IH1 T
it's IH1 T S
itself IH0 T S EH1 L F
jack JH AE1 K
jacob JH EY1 K AH0 B
jake JH EY1 K
james JH EY1 M Z
jane JH EY1 N
jason JH EY1 S AH0 N
jeff JH EH1 F
jennifer JH EH1 N AH0 F ER0
jenny JH EH1 N IY0
jersey JH ER1 Z IY0
jessica JH EH1 S IH0 K AH0
jet JH EH1 T
jim JH IH1 M
jingle JH IH1 NG G AH0 L
job JH AA1 B
jockey JH AA1 K IY0
joe JH OW1
john JH AA1 N
johnny JH AA1 N IY0
jonathan JH AA1 N AH0 TH AH0 N
jones JH OW1 N Z
josef JH OW1 S AH0 F
joseph JH OW1 S AH0 F
josh JH AA1 SH
joshua JH AA1 SH UW0 AH0
judge JH AH1 JH
julia JH UW1 L IY0 AH0
julie JH UW1 L IY0
jump JH AH1 M P
junk JH AH1 NG K
just JH AH1 S T
justin JH AH1 S T IH0 N
karen K EH1 R AH0 N
katherine K AE1 TH R IH0 N
kathy K AE1 TH IY0
katie K EY1 T IY0
keep K IY1 P
kelly K EH1 L IY0
kept K EH1 P T
kessler K EH1 S L ER0
kevin K EH1 V IH0 N
kick K IH1 K
kid K IH1 D
kiddo K IH1 D OW0
kill K IH1 L
killed K IH1 L D
kim K IH1 M
kind K AY1 N D
kinda K AY1 N D AH0
king K IH1 NG
kiss K IH1 S
knew N UW1
knight N AY1 T
know N OW1
kong K AO1 NG
lab L AE1 B
ladies L EY1 D IY0 Z
lady L EY1 D IY0
laid L EY1 D
lake L EY1 K
lamp L AE1 M P
lana L AA1 N AH0
land L AE1 N D
landing L AE1 N D IH0 NG
larder L AA1 R D ER0
large L AA1 R JH
laser L EY1 Z ER0
last L AE1 S T
late L EY1 T
laura L AO1 R AH0
lauren L AO1 R AH0 N
law L AO1
lawful L AO1 F AH0 L
lay L EY1
lead L IY1 D
leader L IY1 D ER0
leaking L IY1 K IH0 NG
lean L IY1 N
learning L ER1 N IH0 NG
least L IY1 S T
leave L IY1 V
led L EH1 D
left L EH1 F T
lehrer L EH1 R ER0
lent L EH1 N T
leo L IY1 OW0
less L EH1 S
let L EH1 T
let's L EH1 T S
level L EH1 V AH0 L
lexington L EH1 K S IH0 NG T AH0 N
liam L IY1 AH0 M
liberty L IH1 B ER0 T IY0
library L AY1 B R EH2 R IY0
life L AY1 F
light L AY1 T
lighthouse L AY1 T HH AW2 S
lightnin L AY1 T N IH0 N
like L AY1 K
lily L IH1 L IY0
limbs L IH1 M Z
limited L IH1 M AH0 T IH0 D
lincoln L IH1 NG K AH0 N
linda L IH1 N D AH0
lindqvist L IH1 N D K V IH0 S T
line L AY1 N
lips L IH1 P S
lisa L IY1 S AH0
list L IH1 S T
listen L IH1 S AH0 N
listener L IH1 S AH0 N ER0
listeners L IH1 S AH0 N ER0 Z
lit L IH1 T
literally L IH1 T ER0 AH0 L IY0
little L IH1 T AH0 L
live L IH1 V
lives L IH1 V Z
ll AH0 L
located L OW1 K EY2 T IH0 D
lock L AA1 K
logan L OW1 G AH0 N
lone L OW1 N
lonely L OW1 N L IY0
lonesome L OW1 N S AH0 M
long L AO1 NG
look L UH1 K
looping L UW1 P IH0 NG
loose L UW1 S
lost L AO1 S T
lot L AA1 T
lou L UW1
loud L AW1 D
lounge L AW1 N JH
love L AH1 V
low L OW1
lucas L UW1 K AH0 S
lucky L AH1 K IY0
lucy L UW1 S IY0
luke L UW1 K
lulu L UW1 L UW0
lyceum L AY0 S IY1 AH0 M
lyrics L IH1 R IH0 K S
m EH1 M
made M EY1 D
madison M AE1 D IH0 S AH0 N
mae M EY1
major M EY1 JH ER0
make M EY1 K
male M EY1 L
malone M AH0 L OW1 N
mama M AA1 M AH0
mambo M AA1 M B OW0
man M AE1 N
management M AE1 N IH0 JH M AH0 N T
manhattan M AE0 N HH AE1 T AH0 N
manholes M AE1 N HH OW2 L Z
maniac M EY1 N IY0 AE2 K
maniacs M EY1 N IY0 AE2 K S
mannequin M AE1 N AH0 K IH0 N
march M AA1 R CH
margaret M AA1 R G R AH0 T
maria M AH0 R IY1 AH0
marjorie M AA1 R JH ER0 IY0
mark M AA1 R K
market M AA1 R K AH0 T
marlow M AA1 R L OW0
martin M AA1 R T AH0 N
mary M EH1 R IY0
mason M EY1 S AH0 N
matt M AE1 T
matter M AE1 T ER0
matthew M AE1 TH Y UW0
max M AE1 K S
maxwell M AE1 K S W EH0 L
may M EY1
maybe M EY1 B IY0
mayday M EY1 D EY2
mayor M EY1 ER0
me M IY1
mean M IY1 N
meant M EH1 N T
measured M EH1 ZH ER0 D
mechanism M EH1 K AH0 N IH2 Z AH0 M
meet M IY1 T
megan M EH1 G AH0 N
mel M EH1 L
melissa M AH0 L IH1 S AH0
member M EH1 M B ER0
menu M EH1 N Y UW0
mercenaries M ER1 S AH0 N EH2 R IY0 Z
mercenary M ER1 S AH0 N EH2 R IY0
merchandise M ER1 CH AH0 N D AY2 Z
merchant M ER1 CH AH0 N T
mercury M ER1 K Y ER0 IY0
merged M ER1 JH D
message M EH1 S AH0 JH
met M EH1 T
metropolitan M EH2 T R AH0 P AA1 L AH0 T AH0 N
mia M IY1 AH0
michael M AY1 K AH0 L
michelle M IH0 SH EH1 L
middle M IH1 D AH0 L
midnight M IH1 D N AY2 T
midtown M IH1 D T AW2 N
might M AY1 T
mike M AY1 K
mildew M IH1 L D UW2
mile M AY1 L
milk M IH1 L K
million M IH1 L Y AH0 N
mind M AY1 N D
mine M AY1 N
mini M IH1 N IY0
minor M AY1 N ER0
minute M IH1 N AH0 T
minutes M IH1 N AH0 T S
miracle M IH1 R AH0 K AH0 L
miss M IH1 S
missile M IH1 S AH0 L
mister M IH1 S T ER0
mm M
mob M AA1 B
model M AA1 D AH0 L
modern M AA1 D ER0 N
module M AA1 JH UW0 L
moment M OW1 M AH0 N T
money M AH1 N IY0
monroe M AH0 N R OW1
monsters M AA1 N S T ER0 Z
month M AH1 N TH
montoya M AA0 N T OY1 AH0
moon M UW1 N
more M AO1 R
morgan M AO1 R G AH0 N
morning M AO1 R N IH0 NG
mort M AO1 R T
most M OW1 S T
mostly M OW1 S T L IY0
mother M AH1 DH ER0
move M UW1 V
movement M UW1 V M AH0 N T
movie M UW1 V IY0
mq EH1 M K Y UW1
much M AH1 CH
mulligan M AH1 L IH0 G AH0 N
museum M Y UW0 Z IY1 AH0 M
mushroom M AH1 SH R UW0 M
music M Y UW1 Z IH0 K
mutant M Y UW1 T AH0 N T
mutants M Y UW1 T AH0 N T S
mutations M Y UW0 T EY1 SH AH0 N Z
mute M Y UW1 T
mutt M AH1 T
my M AY1
myself M AY0 S EH1 L F
mysterious M IH0 S T IH1 R IY0 AH0 S
n EH1 N
name N EY1 M
nancy N AE1 N S IY0
nat N AE1 T
nathan N EY1 TH AH0 N
nation N EY1 SH AH0 N
navy N EY1 V IY0
near N IH1 R
need N IY1 D
needle N IY1 D AH0 L
neighbors N EY1 B ER0 Z
neither N IY1 DH ER0
nell N EH1 L
neon N IY1 AA0 N
nesting N EH1 S T IH0 NG
nets N EH1 T S
neutral N UW1 T R AH0 L
never N EH1 V ER0
new N UW1
news N UW1 Z
next N EH1 K S T
nice N AY1 S
nick N IH1 K
nicole N IH0 K OW1 L
night N AY1 T
nine N AY1 N
nineteen N AY1 N T IY1 N
ninety N AY1 N T IY0
no N OW1
noah N OW1 AH0
nobody N OW1 B AA2 D IY0
nocturne N AA1 K T ER0 N
nodding N AA1 D IH0 NG
noise N OY1 Z
none N AH1 N
north N AO1 R TH
not N AA1 T
note N OW1 T
nothing N AH1 TH IH0 NG
now N AW1
nowhere N OW1 W EH2 R
nuclear N UW1 K L IY0 ER0
nuke N UW1 K
number N AH1 M B ER0
numbers N AH1 M B ER0 Z
nyc EH1 N W AY1 S IY1
observation AA2 B Z ER0 V EY1 SH AH0 N
obsessive AH0 B S EH1 S IH0 V
octagon AA1 K T AH0 G AA2 N
of AH1 V
off AO1 F
office AO1 F AH0 S
officer AO1 F AH0 S ER0
official AH0 F IH1 SH AH0 L
often AO1 F AH0 N
oh OW1
oil OY1 L
okafor OW0 K AA1 F AO0 R
okay OW2 K EY1
old OW1 L D
oliver AA1 L IH0 V ER0
olivia OW0 L IH1 V IY0 AH0
on AA1 N
once W AH1 N S
one W AH1 N
onion AH1 N Y AH0 N
only OW1 N L IY0
open OW1 P AH0 N
or AO1 R
orchestra AO1 R K AH0 S T R AH0
order AO1 R D ER0
organization AO2 R G AH0 N AH0 Z EY1 SH AH0 N
oscar AA1 S K ER0
ossie AA1 S IY0
other AH1 DH ER0
our AW1 ER0
ourselves AW0 ER0 S EH1 L V Z
out AW1 T
outcast AW1 T K AE2 S T
outcasts AW1 T K AE2 S T S
outside AW1 T S AY1 D
over OW1 V ER0
overdue OW2 V ER0 D UW1
own OW1 N
paid P EY1 D
painter P EY1 N T ER0
painting P EY1 N T IH0 NG
pal P AE1 L
paladin P AE1 L AH0 D IH0 N
pale P EY1 L
paper P EY1 P ER0
parent P EH1 R AH0 N T
park P AA1 R K
part P AA1 R T
party P AA1 R T IY0
pass P AE1 S
passenger P AE1 S AH0 N JH ER0
past P AE1 S T
patience P EY1 SH AH0 N S
patient P EY1 SH AH0 N T
patrick P AE1 T R IH0 K
patriots P EY1 T R IY0 AH0 T S
patrons P EY1 T R AH0 N Z
paul P AO1 L
pays P EY1 Z
peace P IY1 S
peaceful P IY1 S F AH0 L
pemberton P EH1 M B ER0 T AH0 N
pending P EH1 N D IH0 NG
people P IY1 P AH0 L
perhaps P ER0 HH AE1 P S
permanently P ER1 M AH0 N AH0 N T L IY0
person P ER1 S AH0 N
pete P IY1 T
peter P IY1 T ER0
philharmonic F IH2 L HH AA0 R M AA1 N IH0 K
phone F OW1 N
pick P IH1 K
picture P IH1 K CH ER0
pie P AY1
piece P IY1 S
pieces P IY1 S IH0 Z
pier P IH1 R
pinch P IH1 N CH
pirates P AY1 R AH0 T S
pit P IH1 T
pizza P IY1 T S AH0
place P L EY1 S
plan P L AE1 N
play P L EY1
plaza P L AA1 Z AH0
please P L IY1 Z
point P OY1 N T
poisoning P OY1 Z AH0 N IH0 NG
police P AH0 L IY1 S
policy P AA1 L AH0 S IY0
polite P AH0 L AY1 T
poor P UH1 R
population P AA2 P Y AH0 L EY1 SH AH0 N
pork P AO1 R K
port P AO1 R T
position P AH0 Z IH1 SH AH0 N
possible P AA1 S AH0 B AH0 L
post P OW1 S T
pot P AA1 T
pour P AO1 R
power P AW1 ER0
practice P R AE1 K T IH0 S
pre P R IY1
premiered P R IH0 M IH1 R D
prepared P R IY0 P EH1 R D
president P R EH1 Z IH0 D AH0 N T
presses P R EH1 S IH0 Z
pretty P R IH1 T IY0
price P R AY1 S
prices P R AY1 S IH0 Z
pride P R AY1 D
prize P R AY1 Z
probably P R AA1 B AH0 B L IY0
proceed P R AH0 S IY1 D
process P R AA1 S EH2 S
product P R AA1 D AH0 K T
profile P R OW1 F AY2 L
program P R OW1 G R AE2 M
project P R AA1 JH EH0 K T
promenade P R AA2 M AH0 N EY1 D
promise P R AA1 M AH0 S
proper P R AA1 P ER0
proposed P R AH0 P OW1 Z D
protocol P R OW1 T AH0 K AO2 L
proud P R AW1 D
psycho S AY1 K OW0
pumps P AH1 M P S
pup P AH1 P
pure P Y UH1 R
purified P Y UH1 R AH0 F AY2 D
purity P Y UH1 R AH0 T IY0
put P UH1 T
quartet K W AO0 R T EH1 T
queens K W IY1 N Z
queensboro K W IY1 N Z B ER0 OW0
quest K W EH1 S T
question K W EH1 S CH AH0 N
quiet K W AY1 AH0 T
quintet K W IH0 N T EH1 T
quite K W AY1 T
quote K W OW1 T
rachel R EY1 CH AH0 L
rad R AE1 D
radiation R EY2 D IY0 EY1 SH AH0 N
radio R EY1 D IY0 OW2
radioactive R EY2 D IY0 OW0 AE1 K T IH0 V
radium R EY1 D IY0 AH0 M
rads R AE1 D Z
raider R EY1 D ER0
ran R AE1 N
rang R AE1 NG
range R EY1 N JH
ransom R AE1 N S AH0 M
rate R EY1 T
rather R AE1 DH ER0
rats R AE1 T S
re R IY1
reaching R IY1 CH IH0 NG
reactive R IY0 AE1 K T IH0 V
read R IY1 D
real R IY1 L
really R IH1 L IY0
reason R IY1 Z AH0 N
reasonable R IY1 Z AH0 N AH0 B AH0 L
rebecca R AH0 B EH1 K AH0
receipts R IH0 S IY1 T S
receive R IH0 S IY1 V
recommends R EH2 K AH0 M EH1 N D Z
record R EH1 K ER0 D
recorded R IH0 K AO1 R D IH0 D
records R EH1 K ER0 D Z
refuses R IH0 F Y UW1 Z IH0 Z
regrets R IH0 G R EH1 T S
regulators R EH1 G Y AH0 L EY2 T ER0 Z
relationship R IH0 L EY1 SH AH0 N SH IH2 P
remain R IH0 M EY1 N
remember R IH0 M EH1 M B ER0
remind R IY0 M AY1 N D
repeat R IH0 P IY1 T
report R IH0 P AO1 R T
reportedly R IH0 P AO1 R T IH0 D L IY0
reports R IH0 P AO1 R T S
requests R IH0 K W EH1 S T S
rescued R EH1 S K Y UW0 D
research R IY1 S ER0 CH
reservations R EH2 Z ER0 V EY1 SH AH0 N Z
reservoir R EH1 Z ER0 V W AA2 R
residence R EH1 Z IH0 D AH0 N S
residents R EH1 Z IH0 D AH0 N T S
resolution R EH2 Z AH0 L UW1 SH AH0 N
respond R IH0 S P AA1 N D
responsibility R IY0 S P AA2 N S AH0 B IH1 L AH0 T IY0
rest R EH1 S T
restored R IH0 S T AO1 R D
result R IH0 Z AH1 L T
return R IH0 T ER1 N
reverend R EH1 V ER0 AH0 N D
review R IY2 V Y UW1
reyes R EY1 AH0 S
rhumba R AH1 M B AH0
rhythm R IH1 DH AH0 M
rich R IH1 CH
richard R IH1 CH ER0 D
rick R IH1 K
riding R AY1 D IH0 NG
rifle R AY1 F AH0 L
right R AY1 T
rings R IH1 NG Z
rise R AY1 Z
river R IH1 V ER0
road R OW1 D
roaring R AO1 R IH0 NG
rob R AA1 B
robbery R AA1 B ER0 IY0
robert R AA1 B ER0 T
robes R OW1 B Z
robot R OW1 B AA2 T
rock R AA1 K
rockefeller R AA1 K AH0 F EH2 L ER0
rockette R AA0 K EH1 T
rode R OW1 D
role R OW1 L
rolled R OW1 L D
room R UW1 M
roosevelt R OW1 Z AH0 V EH2 L T
rosa R OW1 Z AH0
rose R OW1 Z
rounds R AW1 N D Z
ruby R UW1 B IY0
ruin R UW1 IH0 N
ruiz R UW0 IY1 Z
rule R UW1 L
rumor R UW1 M ER0
rumour R UW1 M ER0
run R AH1 N
rust R AH1 S T
rusty R AH1 S T IY0
ryan R AY1 AH0 N
s EH1 S
sad S AE1 D
safe S EY1 F
safer S EY1 F ER0
safety S EY1 F T IY0
said S EH1 D
sailed S EY1 L D
sailing S EY1 L IH0 NG
saints S EY1 N T S
salvage S AE1 L V IH0 JH
sam S AE1 M
samantha S AH0 M AE1 N TH AH0
same S EY1 M
samuel S AE1 M Y UW0 AH0 L
sanctuary S AE1 NG K CH UW0 EH2 R IY0
sang S AE1 NG
sank S AE1 NG K
sarah S EH1 R AH0
sat S AE1 T
saturday S AE1 T ER0 D EY2
sauce S AO1 S
save S EY1 V
saved S EY1 V D
saw S AO1
sax S AE1 K S
say S EY1
says S EH1 Z
scale S K EY1 L
scared S K EH1 R D
scavengers S K AE1 V AH0 N JH ER0 Z
schedule S K EH1 JH UH0 L
scientist S AY1 AH0 N T IH0 S T
scientists S AY1 AH0 N T IH0 S T S
scotch S K AA1 CH
scott S K AA1 T
scratch S K R AE1 CH
screwdriver S K R UW1 D R AY2 V ER0
scribe S K R AY1 B
sea S IY1
seaboard S IY1 B AO2 R D
seal S IY1 L
sean SH AO1 N
seaport S IY1 P AO2 R T
searchlights S ER1 CH L AY2 T S
seawall S IY1 W AO2 L
second S EH1 K AH0 N D
sections S EH1 K SH AH0 N Z
sector S EH1 K T ER0
securing S IH0 K Y UH1 R IH0 NG
sedatives S EH1 D AH0 T IH0 V Z
see S IY1
seemed S IY1 M D
seems S IY1 M Z
seen S IY1 N
sell S EH1 L
sends S EH1 N D Z
sense S EH1 N S
sentinels S EH1 N T AH0 N AH0 L Z
sentry S EH1 N T R IY0
serenade S EH2 R AH0 N EY1 D
service S ER1 V AH0 S
set S EH1 T
settlement S EH1 T AH0 L M AH0 N T
settlers S EH1 T L ER0 Z
seven S EH1 V AH0 N
seventeen S EH1 V AH0 N T IY1 N
seventy S EH1 V AH0 N T IY0
several S EH1 V R AH0 L
sextet S EH0 K S T EH1 T
shaking SH EY1 K IH0 NG
shark SH AA1 R K
she SH IY1
shelter SH EH1 L T ER0
sheriff SH EH1 R AH0 F
shine SH AY1 N
shiny SH AY1 N IY0
ship SH IH1 P
shook SH UH1 K
shop SH AA1 P
shore SH AO1 R
short SH AO1 R T
shortcut SH AO1 R T K AH2 T
shot SH AA1 T
shotguns SH AA1 T G AH2 N Z
should SH UH1 D
shoulder SH OW1 L D ER0
shout SH AW1 T
show SH OW1
showed SH OW1 D
shuffle SH AH1 F AH0 L
shut SH AH1 T
sick S IH1 K
sickly S IH1 K L IY0
side S AY1 D
sightings S AY1 T IH0 NG Z
signal S IH1 G N AH0 L
signing S AY1 N IH0 NG
silence S AY1 L AH0 N S
silver S IH1 L V ER0
simple S IH1 M P AH0 L
since S IH1 N S
sing S IH1 NG
siren S AY1 R AH0 N
sirens S AY1 R AH0 N Z
site S AY1 T
situation S IH2 CH UW0 EY1 SH AH0 N
six S IH1 K S
sixteen S IH1 K S T IY1 N
sixty S IH1 K S T IY0
sky S K AY1
slaver S L EY1 V ER0
slavers S L EY1 V ER0 Z
sleep S L IY1 P
slept S L EH1 P T
slid S L IH1 D
slow S L OW1
small S M AO1 L
smaller S M AO1 L ER0
smallpox S M AO1 L P AA2 K S
smells S M EH1 L Z
smile S M AY1 L
so S OW1
society S AH0 S AY1 AH0 T IY0
soft S AO1 F T
soho S OW1 HH OW0
sold S OW1 L D
soldier S OW1 L JH ER0
soldiers S OW1 L JH ER0 Z
some S AH1 M
somebody S AH1 M B AA2 D IY0
somehow S AH1 M HH AW2
someone S AH1 M W AH2 N
something S AH1 M TH IH0 NG
sometimes S AH1 M T AY2 M Z
somewhere S AH1 M W EH2 R
son S AH1 N
sonata S AH0 N AA1 T AH0
sonatina S AA2 N AH0 T IY1 N AH0
song S AO1 NG
songs S AO1 NG Z
soon S UW1 N
sophia S OW0 F IY1 AH0
sophie S OW1 F IY0
sorry S AA1 R IY0
soul S OW1 L
sound S AW1 N D
source S AO1 R S
south S AW1 TH
space S P EY1 S
sparky S P AA1 R K IY0
speak S P IY1 K
special S P EH1 SH AH0 L
speech S P IY1 CH
split S P L IH1 T
spoke S P OW1 K
spoon S P UW1 N
sports S P AO1 R T S
sprang S P R AE1 NG
square S K W EH1 R
squirrel S K W ER1 AH0 L
stage S T EY1 JH
stand S T AE1 N D
star S T AA1 R
stars S T AA1 R Z
start S T AA1 R T
state S T EY1 T
staten S T AE1 T AH0 N
station S T EY1 SH AH0 N
statue S T AE1 CH UW0
stay S T EY1
steady S T EH1 D IY0
steak S T EY1 K
steel S T IY1 L
step S T EH1 P
stephanie S T EH1 F AH0 N IY0
stephen S T IY1 V AH0 N
steve S T IY1 V
steven S T IY1 V AH0 N
still S T IH1 L
stirring S T ER1 IH0 NG
stock S T AA1 K
stole S T OW1 L
stolen S T OW1 L AH0 N
stone S T OW1 N
stood S T UH1 D
stop S T AA1 P
store S T AO1 R
strange S T R EY1 N JH
stranger S T R EY1 N JH ER0
strangers S T R EY1 N JH ER0 Z
street S T R IY1 T
strict S T R IH1 K T
strings S T R IH1 NG Z
strong S T R AO1 NG
struck S T R AH1 K
studio S T UW1 D IY0 OW2
study S T AH1 D IY0
stuff S T AH1 F
stumble S T AH1 M B AH0 L
subway S AH1 B W EY2
such S AH1 CH
suddenly S AH1 D AH0 N L IY0
sugar SH UH1 G ER0
suit S UW1 T
sun S AH1 N
sung S AH1 NG
super S UW1 P ER0
support S AH0 P AO1 R T
sure SH UH1 R
survival S ER0 V AY1 V AH0 L
survivor S ER0 V AY1 V ER0
susan S UW1 Z AH0 N
swam S W AE1 M
sweet S W IY1 T
sweetheart S W IY1 T HH AA2 R T
swim S W IH1 M
swing S W IH1 NG
switched S W IH1 CH T
swore S W AO1 R
symphony S IH1 M F AH0 N IY0
system S IH1 S T AH0 M
t T IY1
table T EY1 B AH0 L
take T EY1 K
taken T EY1 K AH0 N
talk T AO1 K
talked T AO1 K T
talking T AO1 K IH0 NG
tall T AO1 L
talon T AE1 L AH0 N
tammany T AE1 M AH0 N IY0
tape T EY1 P
taught T AO1 T
tax T AE1 K S
teacher T IY1 CH ER0
team T IY1 M
tear T EH1 R
tec T EH1 K
technology T EH0 K N AA1 L AH0 JH IY0
tell T EH1 L
ten T EH1 N
terrace T EH1 R AH0 S
terrifying T EH1 R AH0 F AY2 IH0 NG
test T EH1 S T
tex T EH1 K S
than DH AE1 N
thank TH AE1 NG K
thanks TH AE1 NG K S
that DH AE1 T
that's DH AE1 T S
the DH AH0
theater TH IY1 AH0 T ER0
theatre TH IY1 AH0 T ER0
theatrical TH IY0 AE1 T R IH0 K AH0 L
their DH EH1 R
them DH EH1 M
themselves DH EH0 M S EH1 L V Z
then DH EH1 N
there DH EH1 R
there's DH EH1 R Z
these DH IY1 Z
they DH EY1
they're DH EH1 R
thing TH IH1 NG
think TH IH1 NG K
third TH ER1 D
thirteen TH ER1 T IY1 N
thirty TH ER1 T IY0
this DH IH1 S
thomas T AA1 M AH0 S
those DH OW1 Z
though DH OW1
thought TH AO1 T
thousand TH AW1 Z AH0 N D
three TH R IY1
threw TH R UW1
through TH R UW1
thumb TH AH1 M
tickets T IH1 K AH0 T S
tide T AY1 D
tight T AY1 T
till T IH1 L
tim T IH1 M
time T AY1 M
times T AY1 M Z
timothy T IH1 M AH0 TH IY0
tin T IH1 N
tip T IH1 P
tired T AY1 ER0 D
tissue T IH1 SH UW0
title T AY1 T AH0 L
tito T IY1 T OW0
to T UW1
today T AH0 D EY1
toe T OW1
toes T OW1 Z
together T AH0 G EH1 DH ER0
told T OW1 L D
toll T OW1 L
tom T AA1 M
tomas T OW0 M AA1 S
tomorrow T AH0 M AA1 R OW2
tongue T AH1 NG
tonight T AH0 N AY1 T
tony T OW1 N IY0
too T UW1
took T UH1 K
tooth T UW1 TH
top T AA1 P
torch T AO1 R CH
touch T AH1 CH
toward T AH0 W AO1 R D
towel T AW1 AH0 L
town T AW1 N
toy T OY1
trade T R EY1 D
traders T R EY1 D ER0 Z
traffic T R AE1 F IH0 K
trail T R EY1 L
train T R EY1 N
travelers T R AE1 V AH0 L ER0 Z
tree T R IY1
tribeca T R AY0 B EH1 K AH0
trick T R IH1 K
trinity T R IH1 N AH0 T IY0
trio T R IY1 OW0
trouble T R AH1 B AH0 L
trumpet T R AH1 M P AH0 T
trusting T R AH1 S T IH0 NG
truth T R UW1 TH
try T R AY1
tubes T UW1 B Z
tull T AH1 L
tune T UW1 N
tuned T UW1 N D
tunes T UW1 N Z
tunnel T AH1 N AH0 L
tunnels T AH1 N AH0 L Z
turn T ER1 N
turret T ER1 AH0 T
turrets T ER1 AH0 T S
twelve T W EH1 L V
twenty T W EH1 N T IY0
two T UW1
type T AY1 P
u Y UW1
unbecoming AH2 N B IH0 K AH1 M IH0 NG
unbelievable AH2 N B AH0 L IY1 V AH0 B AH0 L
unbowed AH0 N B AW1 D
under AH1 N D ER0
underneath AH2 N D ER0 N IY1 TH
understand AH2 N D ER0 S T AE1 N D
understood AH2 N D ER0 S T UH1 D
underwater AH1 N D ER0 W AO2 T ER0
unidentified AH2 N AY0 D EH1 N T AH0 F AY2 D
united Y UW0 N AY1 T IH0 D
unkind AH0 N K AY1 N D
unless AH0 N L EH1 S
until AH0 N T IH1 L
unusual AH0 N Y UW1 ZH UW0 AH0 L
up AH1 P
update AH1 P D EY2 T
upon AH0 P AA1 N
uptown AH1 P T AW2 N
us AH1 S
use Y UW1 Z
used Y UW1 Z D
using Y UW1 Z IH0 NG
usually Y UW1 ZH UW0 AH0 L IY0
value V AE1 L Y UW0
vance V AE1 N S
vandermeer V AE1 N D ER0 M IH2 R
variety V ER0 AY1 AH0 T IY0
ve V
vendor V EH1 N D ER0
vera V EH1 R AH0
very V EH1 R IY0
via V AY1 AH0
vibes V AY1 B Z
victoria V IH0 K T AO1 R IY0 AH0
victory V IH1 K T ER0 IY0
view V Y UW1
vigil V IH1 JH AH0 L
village V IH1 L IH0 JH
villain V IH1 L AH0 N
vodka V AA1 D K AH0
voice V OY1 S
wailing W EY1 L IH0 NG
wait W EY1 T
waldorf W AO1 L D AO2 R F
walk W AO1 K
wall W AO1 L
walter W AO1 L T ER0
waltz W AO1 L T S
wanna W AA1 N AH0
want W AA1 N T
war W AO1 R
warm W AO1 R M
warn W AO1 R N
was W AA1 Z
wash W AA1 SH
washington W AA1 SH IH0 NG T AH0 N
wasn't W AA1 Z AH0 N T
wastes W EY1 S T S
watch W AA1 CH
water W AO1 T ER0
wave W EY1 V
way W EY1
we W IY1
we're W IH1 R
weak W IY1 K
wear W EH1 R
weather W EH1 DH ER0
webster W EH1 B S T ER0
wedding W EH1 D IH0 NG
week W IY1 K
weeks W IY1 K S
welcome W EH1 L K AH0 M
welfare W EH1 L F EH2 R
well W EH1 L
wendell W EH1 N D AH0 L
went W EH1 N T
wept W EH1 P T
were W ER1
wexler W EH1 K S L ER0
what W AH1 T
what's W AH1 T S
whatever W AH0 T EH1 V ER0
when W EH1 N
where W EH1 R
wherever W EH0 R EH1 V ER0
whether W EH1 DH ER0
which W IH1 CH
whichever W IH0 CH EH1 V ER0
while W AY1 L
whiskey W IH1 S K IY0
whisper W IH1 S P ER0
whitaker W IH1 T AH0 K ER0
white W AY1 T
who HH UW1
whoever HH UW0 EH1 V ER0
whole HH OW1 L
whose HH UW1 Z
why W AY1
wide W AY1 D
wife W AY1 F
wiggle W IH1 G AH0 L
will W IH1 L
william W IH1 L Y AH0 M
williamsburg W IH1 L Y AH0 M Z B ER0 G
wind W IH1 N D
window W IH1 N D OW0
wine W AY1 N
wiped W AY1 P T
wisely W AY1 Z L IY0
wish W IH1 SH
with W IH1 DH
woke W OW1 K
woman W UH1 M AH0 N
women W IH1 M AH0 N
won W AH1 N
won't W OW1 N T
wonderful W AH1 N D ER0 F AH0 L
woods W UH1 D Z
word W ER1 D
wore W AO1 R
work W ER1 K
world W ER1 L D
worse W ER1 S
worst W ER1 S T
worth W ER1 TH
would W UH1 D
wound W UW1 N D
write R AY1 T
written R IH1 T AH0 N
wrote R OW1 T
xavier Z EY1 V IY0 ER0
yao Y AW1
yard Y AA1 R D
yeah Y AE1
year Y IH1 R
years Y IH1 R Z
yelled Y EH1 L D
yellow Y EH1 L OW0
yes Y EH1 S
yesterday Y EH1 S T ER0 D EY2
yet Y EH1 T
york Y AO1 R K
you Y UW1
you'll Y UW1 L
you're Y UH1 R
you've Y UW1 V
young Y AH1 NG
your Y AO1 R
yourself Y ER0 S EH1 L F
yourselves Y ER0 S EH1 L V Z
z Z IY1
zero Z IH1 R OW0
zoe Z OW1 IY0
assembly AH0 S EH1 M B L IY0
bank B AE1 NG K
barely B EH1 R L IY0
beats B IY1 T S
belvedere B EH1 L V AH0 D IH2 R
bid B IH1 D
bottom B AA1 T AH0 M
bow B OW1
bryant B R AY1 AH0 N T
bunker B AH1 NG K ER0
busy B IH1 Z IY0
castle K AE1 S AH0 L
celebrate S EH1 L AH0 B R EY2 T
christmas K R IH1 S M AH0 S
circle S ER1 K AH0 L
citadel S IH1 T AH0 D EH2 L
cleverest K L EH1 V ER0 AH0 S T
co K OW1
columbus K AH0 L AH1 M B AH0 S
commodity K AH0 M AA1 D AH0 T IY0
complicated K AA1 M P L AH0 K EY2 T IH0 D
craters K R EY1 T ER0 Z
crooner K R UW1 N ER0
cruelest K R UW1 AH0 L AH0 S T
dakota D AH0 K OW1 T AH0
dedicated D EH1 D AH0 K EY2 T IH0 D
default D IH0 F AO1 L T
delivered D IH0 L IH1 V ER0 D
domino D AA1 M AH0 N OW2
centre S EH1 N T ER0
drydock D R AY1 D AA2 K
ducts D AH1 K T S
ear IH1 R
enjoy EH0 N JH OY1
exist IH0 G Z IH1 S T
fanning F AE1 N IH0 NG
federal F EH1 D ER0 AH0 L
feet F IY1 T
fraunces F R AO1 N S IH0 Z
general JH EH1 N ER0 AH0 L
harlan HH AA1 R L AH0 N
headache HH EH1 D EY2 K
headquarters HH EH1 D K W AO2 R T ER0 Z
hike HH AY1 K
hope HH OW1 P
hotel HH OW0 T EH1 L
huh HH AH1
immigration IH2 M AH0 G R EY1 SH AH0 N
interior IH0 N T IH1 R IY0 ER0
joined JH OY1 N D
kitchen K IH1 CH AH0 N
known N OW1 N
laguardia L AH0 G W AA1 R D IY0 AH0
lend L EH1 N D
lifestyle L AY1 F S T AY2 L
lobby L AA1 B IY0
lord L AO1 R D
lying L AY1 IH0 NG
marquee M AA0 R K IY1
master M AE1 S T ER0
misty M IH1 S T IY0
mole M OW1 L
natural N AE1 CH ER0 AH0 L
nd EH1 N D
nyse EH1 N W AY1 EH1 S IY1
pearl P ER1 L
pedestal P EH1 D AH0 S T AH0 L
pennsylvania P EH2 N S AH0 L V EY1 N Y AH0
personal P ER1 S AH0 N AH0 L
pigeons P IH1 JH AH0 N Z
pins P IH1 N Z
pocket P AA1 K AH0 T
pretend P R IY0 T EH1 N D
pruitt P R UW1 IH0 T
public P AH1 B L IH0 K
rat R AE1 T
refinery R IH0 F AY1 N ER0 IY0
registry R EH1 JH IH0 S T R IY0
remnant R EH1 M N AH0 N T
request R IH0 K W EH1 S T
reserve R IH0 Z ER1 V
respects R IH0 S P EH1 K T S
rig R IH1 G
rope R OW1 P
rotunda R OW0 T AH1 N D AH0
saint S EY1 N T
shaped SH EY1 P T
sinner S IH1 N ER0
slightly S L AY1 T L IY0
smell S M EH1 L
stick S T IH1 K
storm S T AO1 R M
tabs T AE1 B Z
tavern T AE1 V ER0 N
technically T EH1 K N IH0 K L IY0
teletype T EH1 L AH0 T AY2 P
terminal T ER1 M AH0 N AH0 L
terrified T EH1 R AH0 F AY2 D
th T IY1 EY1 CH
thinning TH IH1 N IH0 NG
tiffany T IH1 F AH0 N IY0
toaster T OW1 S T ER0
tollbooth T OW1 L B UW2 TH
tombs T UW1 M Z
tower T AW1 ER0
transmitter T R AE0 N S M IH1 T ER0
transverse T R AE0 N S V ER1 S
tuxedo T AH0 K S IY1 D OW0
twice T W AY1 S
ugly AH1 G L IY0
umbrella AH0 M B R EH1 L AH0
un Y UW1 EH1 N
union Y UW1 N Y AH0 N
vanguard V AE1 N G AA2 R D
vinyl V AY1 N AH0 L
weird W IH1 R D
woolworth W UH1 L W ER0 TH
x EH1 K S
zeke Z IY1 K
cardio K AA1 R D IY0 OW2
notice N OW1 T AH0 S
quick K W IH1 K
roof R UW1 F
single S IH1 NG G AH0 L
toilet T OY1 L AH0 T
trim T R IH1 M
sent S EH1 N T
bent B EH1 N T
dent D EH1 N T
tent T EH1 N T
rent R EH1 N T
fold F OW1 L D
pat P AE1 T
pad P AE1 D
pan P AE1 N
path P AE1 TH
pack P AE1 K
lane L EY1 N
lace L EY1 S
lame L EY1 M
kit K IH1 T
fit F IH1 T
wit W IH1 T
sit S IH1 T
must M AH1 S T
bust B AH1 S T
gust G AH1 S T
lust L AH1 S T
teak T IY1 K
teal T IY1 L
teach T IY1 CH
tease T IY1 Z
din D IH1 N
dill D IH1 L
dim D IH1 M
dig D IH1 G
dip D IH1 P
bed B EH1 D
fed F EH1 D
red R EH1 D
wed W EH1 D
pin P IH1 N
sin S IH1 N
fin F IH1 N
win W IH1 N
dug D AH1 G
dung D AH1 NG
dud D AH1 D
dub D AH1 B
dun D AH1 N
sum S AH1 M
sup S AH1 P
sub S AH1 B
sud S AH1 D
seep S IY1 P
seem S IY1 M
seek S IY1 K
tot T AA1 T
vest V EH1 S T
west W EH1 S T
nest N EH1 S T
pig P IH1 G
pill P IH1 L
bath B AE1 TH
bass B AE1 S
bat B AE1 T
ban B AE1 N
pay P EY1
gay G EY1
wig W IH1 G
fig F IH1 G
pace P EY1 S
page P EY1 JH
pane P EY1 N
pave P EY1 V
cane K EY1 N
cape K EY1 P
cave K EY1 V
mop M AA1 P
cop K AA1 P
hop HH AA1 P
pop P AA1 P
coil K OY1 L
soil S OY1 L
toil T OY1 L
boil B OY1 L
foil F OY1 L
tan T AE1 N
tang T AE1 NG
tap T AE1 P
tack T AE1 K
tam T AE1 M
tab T AE1 B
fib F IH1 B
fizz F IH1 Z
fill F IH1 L
tame T EY1 M
fame F EY1 M
peel P IY1 L
reel R IY1 L
feel F IY1 L
eel IY1 L
keel K IY1 L
heel HH IY1 L
hark HH AA1 R K
bark B AA1 R K
lark L AA1 R K
heave HH IY1 V
heat HH IY1 T
heal HH IY1 L
heap HH IY1 P
heath HH IY1 TH
cup K AH1 P
cud K AH1 D
cuff K AH1 F
cuss K AH1 S
cub K AH1 B
thaw TH AO1
raw R AO1
paw P AO1
jaw JH AO1
pen P EH1 N
hen HH EH1 N
men M EH1 N
den D EH1 N
puff P AH1 F
puck P AH1 K
pub P AH1 B
pus P AH1 S
pun P AH1 N
bean B IY1 N
beach B IY1 CH
beat B IY1 T
beak B IY1 K
bead B IY1 D
beam B IY1 M
neat N IY1 T
feat F IY1 T
seat S IY1 T
meat M IY1 T
sip S IH1 P
hip HH IH1 P
lip L IH1 P
rip R IH1 P
kin K IH1 N
hang HH AE1 NG
bang B AE1 NG
fang F AE1 NG
cook K UH1 K
hook HH UH1 K
mass M AE1 S
math M AE1 TH
map M AE1 P
mat M AE1 T
mad M AE1 D
ray R EY1
raze R EY1 Z
rave R EY1 V
rake R EY1 K
race R EY1 S
sale S EY1 L
sane S EY1 N
sake S EY1 K
hill HH IH1 L
sill S IH1 L
bale B EY1 L
gale G EY1 L
tale T EY1 L
wick W IH1 K
lick L IH1 K
tick T IH1 K
peas P IY1 Z
peak P IY1 K
peach P IY1 CH
peat P IY1 T
peal P IY1 L
bun B AH1 N
bus B AH1 S
bug B AH1 G
buck B AH1 K
buff B AH1 F
dad D AE1 D
nun N AH1 N
fun F AH1 N
butch B UH1 CH
deloria D AH0 L AO1 R IY0 AH0
burke B ER1 K
moira M OY1 R AH0
prime P R AY1 M
zbigniew Z B IH1 G N Y EH0 F
siobhan SH AH0 V AO1 N
nguyen W IH1 N
poughkeepsie P AH0 K IH1 P S IY0
weehawken W IY0 HH AO1 K AH0 N
yonkers Y AA1 NG K ER0 Z
flatbush F L AE1 T B UH2 SH
bushwick B UH1 SH W IH0 K
canarsie K AH0 N AA1 R S IY0
coney K OW1 N IY0
flushing F L AH1 SH IH0 NG
jamaica JH AH0 M EY1 K AH0
riverdale R IH1 V ER0 D EY2 L
inwood IH1 N W UH2 D
gramercy G R AE1 M ER0 S IY0
murray M ER1 IY0
kips K IH1 P S
hells HH EH1 L Z
bayonne B EY0 OW1 N
newark N UW1 ER0 K
paterson P AE1 T ER0 S AH0 N
montauk M AA1 N T AO0 K
hamptons HH AE1 M P T AH0 N Z
nassau N AE1 S AO0
suffolk S AH1 F AH0 K
westchester W EH1 S T CH EH2 S T ER0
scarsdale S K AA1 R Z D EY2 L
albany AO1 L B AH0 N IY0
schenectady S K AH0 N EH1 K T AH0 D IY0
rochester R AA1 CH EH2 S T ER0
syracuse S IH1 R AH0 K Y UW2 S
buffalo B AH1 F AH0 L OW2
ithaca IH1 TH AH0 K AH0
obrien OW0 B R AY1 AH0 N
murphy M ER1 F IY0
sullivan S AH1 L AH0 V AH0 N
walsh W AO1 L SH
fitzgerald F IH0 T S JH EH1 R AH0 L D
donnelly D AA1 N AH0 L IY0
mcgee M AH0 G IY1
russo R UW1 S OW0
esposito EH2 S P AH0 Z IY1 T OW0
romano R OW0 M AA1 N OW0
ricci R IY1 CH IY0
bianchi B IY0 AA1 NG K IY0
rossi R AO1 S IY0
marino M ER0 IY1 N OW0
colombo K AH0 L AH1 M B OW0
greco G R EH1 K OW0
goldberg G OW1 L D B ER0 G
cohen K OW1 AH0 N
levy L IY1 V IY0
katz K AE1 T S
rosen R OW1 Z AH0 N
schwartz SH W AO1 R T S
friedman F R IY1 D M AH0 N
shapiro SH AH0 P IH1 R OW0
kaplan K AE1 P L AH0 N
garcia G AA0 R S IY1 AH0
rodriguez R AA0 D R IY1 G EH0 Z
martinez M AA0 R T IY1 N EH0 Z
hernandez HH ER0 N AE1 N D EH0 Z
lopez L OW1 P EH0 Z
gonzalez G AA0 N Z AA1 L EH0 Z
perez P EH1 R EH0 Z
sanchez S AE1 N CH EH0 Z
ramirez R AH0 M IH1 R EH0 Z
torres T AO1 R EH0 Z
rivera R IH0 V EH1 R AH0
diaz D IY1 AA0 Z
cruz K R UW1 Z
ortiz AO0 R T IY1 Z
morales M ER0 AE1 L EH0 S
lee L IY1
chen CH EH1 N
wang W AA1 NG
li L IY1
zhang JH AA1 NG
liu L Y UW1
yang Y AE1 NG
huang HH W AA1 NG
wu W UW1
zhou JH OW1
tanaka T AH0 N AA1 K AH0
suzuki S UW0 Z UW1 K IY0
patel P AH0 T EH1 L
singh S IH1 NG
kowalski K AH0 W AA1 L S K IY0
nowak N OW1 W AE0 K
novak N OW1 V AE0 K
ivanov IY0 V AA1 N AO0 F
petrov P EH1 T R AO0 F
rivet R IH1 V AH0 T
lyons L AY1 AH0 N Z
sentinel S EH1 N T AH0 N AH0 L
initiate IH0 N IH1 SH IY0 AH0 T
knickerbocker N IH1 K ER0 B AA2 K ER0
lucius L UW1 SH AH0 S
ezra EH1 Z R AH0
hollowell HH AA1 L OW0 W EH2 L
ambrose AE1 M B R OW0 Z
kearns K ER1 N Z
caldwell K AO1 L D W EH0 L
dolores D AH0 L AO1 R AH0 S
hattie HH AE1 T IY0
gus G AH1 S
papadakis P AA2 P AH0 D AA1 K IH0 S
kwan K W AA1 N
delphine D EH0 L F IY1 N
marquez M AA1 R K EH0 Z
doyle D OY1 L
priya P R IY1 Y AH0
nandakumar N AA2 N D AH0 K UW1 M AA0 R
ruggiero R UW0 JH EH1 R OW0
mabel M EY1 B AH0 L
stroud S T R AW1 D
castillo K AE0 S T IY1 OW0
albright AO1 L B R AY2 T
augustus AO0 G AH1 S T AH0 S
rourke R AO1 R K
dunn D AH1 N
ingrid IH1 NG G R IH0 D
tobias T OW0 B AY1 AH0 S
vesper V EH1 S P ER0
hale HH EY1 L
amos EY1 M AH0 S
vell V EH1 L
pell P EH1 L
eddie EH1 D IY0
moss M AO1 S
rosalind R AA1 Z AH0 L IH0 N D
pike P AY1 K
maureen M AO0 R IY1 N
kells K EH1 L Z
dizzy D IH1 Z IY0
calhoun K AE0 L HH UW1 N
barnaby B AA1 R N AH0 B IY0
thistlewood TH IH1 S AH0 L W UH2 D
vivienne V IH1 V IY0 EH2 N
calloway K AE1 L AH0 W EY2
mortimer M AO1 R T AH0 M ER0
horace HH AO1 R AH0 S
varga V AA1 R G AH0
guastavino G W AA2 S T AH0 V IY1 N OW0
weintraub W AY1 N T R AW0 B
marchetti M AA0 R K EH1 T IY0
minh M IH1 N
tran T R AA1 N
augustine AO1 G AH0 S T IY2 N
kowalczyk K OW0 V AA1 L CH IH0 K
rosaria R OW0 Z AA1 R IY0 AH0
nadia N AA1 D IY0 AH0
osei OW0 S EY1
brandt B R AE1 N T
hayden HH EY1 D AH0 N
constance K AA1 N S T AH0 N S
ferdinand F ER1 D AH0 N AE2 N D
hortense HH AO0 R T EH1 N S
pennington P EH1 N IH0 NG T AH0 N
smythe S M AY1 DH
ashby AE1 SH B IY0
fairchild F EH1 R CH AY2 L D
winthrop W IH1 N TH R AH0 P
malloy M AH0 L OY1
ophelia OW0 F IY1 L Y AH0
hollister HH AA1 L IH0 S T ER0
maddox M AE1 D AH0 K S
delgado D EH0 L G AA1 D OW0
mbeki EH0 M B EH1 K IY0
elias IH0 L AY1 AH0 S
voss V AO1 S
leopold L IY1 AH0 P OW2 L D
fisk F IH1 S K
bellini B EH0 L IY1 N IY0
feldstein F EH1 L D S T AY2 N
moretti M ER0 EH1 T IY0
edna EH1 D N AH0
vukovich V UW1 K AH0 V IH0 CH
pershing P ER1 SH IH0 NG
dunmore D AH1 N M AO2 R
fulton F UH1 L T AH0 N
whitcomb W IH1 T K AH0 M
frick F R IH1 K
stokes S T OW1 K S
ansonia AE0 N S OW1 N IY0 AH0
adeline AE1 D AH0 L AY2 N
mercer M ER1 S ER0
halloway HH AE1 L AH0 W EY2
nia N IY1 AH0
birdie B ER1 D IY0
toby T OW1 B IY0
archibald AA1 R CH AH0 B AO2 L D
pembroke P EH1 M B R OW2 K
stanhope S T AE1 N HH OW2 P
kaminski K AH0 M IH1 N S K IY0
bertha B ER1 TH AH0
vasquez V AE1 S K EH0 Z
ottoline AA1 T AH0 L IY2 N
marsh M AA1 R SH
imre IH1 M R EY0
dalca D AA1 L K AH0
ferro F EH1 R OW0
harrow HH AE1 R OW0
oyelaran OW2 Y EH0 L AA1 R AH0 N
tamsin T AE1 M Z IH0 N
dray D R EY1
nate N EY1 T
oduya OW0 D UW1 Y AH0
dottie D AA1 T IY0
marisol M AE1 R IH0 S AO2 L
vega V EY1 G AH0
sparks S P AA1 R K S
adeyemi AA2 D EY0 Y EH1 M IY0
lorena L AO0 R EY1 N AH0
kellerman K EH1 L ER0 M AH0 N
francis F R AE1 N S IH0 S
evangeline IH0 V AE1 N JH AH0 L IY2 N
benchley B EH1 N CH L IY0
woolcott W UH1 L K AH0 T
irving ER1 V IH0 NG
hazel HH EY1 Z AH0 L
vey V EY1
pfeiffer F AY1 F ER0
ondine AA0 N D IY1 N
carla K AA1 R L AH0
grogan G R OW1 G AH0 N
hester HH EH1 S T ER0
obi OW1 B IY0
josiah JH OW0 S AY1 AH0
maggie M AE1 G IY0
lottie L AA1 T IY0
whitlock W IH1 T L AA2 K
drummond D R AH1 M AH0 N D
vane V EY1 N
sexton S EH1 K S T AH0 N
o'rourke OW0 R AO1 R K
finnegan F IH1 N AH0 G AH0 N
hewitt HH Y UW1 IH0 T
sully S AH1 L IY0
cooper K UW1 P ER0
tess T EH1 S
stanley S T AE1 N L IY0
harold HH AE1 R AH0 L D
annie AE1 N IY0
sal S AE1 L
moe M OW1
ruth R UW1 TH
sol S AA1 L
wanda W AA1 N D AH0
ike AY1 K
mickey M IH1 K IY0
flo F L OW1
walt W AO1 L T
rudy R UW1 D IY0
bunny B AH1 N IY0
rex R EH1 K S
chief CH IY1 F
sergeant S AA1 R JH AH0 N T
lieutenant L UW0 T EH1 N AH0 N T
superintendent S UW2 P ER0 IH0 N T EH1 N D AH0 N T
governor G AH1 V ER0 N ER0
deacon D IY1 K AH0 N
raiders R EY1 D ER0 Z
bayside B EY1 S AY2 D
broken B R OW1 K AH0 N
fizzo F IH1 Z OW0
shellback SH EH1 L B AE2 K
prussian P R AH1 SH AH0 N
corned K AO1 R N D
beef B IY1 F
starlite S T AA1 R L AY2 T
ration R AE1 SH AH0 N
scrip S K R IH1 P
chewing CH UW1 IH0 NG
gum G AH1 M
prayer P R EH1 R
champ CH AE1 M P
rocky R AA1 K IY0
ding D IH1 NG
airwaves EH1 R W EY2 V Z
pressure P R EH1 SH ER0
freight F R EY1 T
transponder T R AE0 N S P AA1 N D ER0
lancer L AE1 N S ER0
rask R AE1 S K
survey S ER1 V EY2
detail D IY1 T EY2 L
immobile IH0 M OW1 B AH0 L
bite B AY1 T
round R AW1 N D
ahead AH0 HH EH1 D
coast K OW1 S T
convoy K AA1 N V OY0
scorched S K AO1 R CH T
rougher R AH1 F ER0
iron AY1 ER0 N
covenant K AH1 V AH0 N AH0 N T
recover R IH0 K AH1 V ER0
recovering R IH0 K AH1 V ER0 IH0 NG
glowkeeper G L OW1 K IY2 P ER0
glowkeepers G L OW1 K IY2 P ER0 Z
med M EH1 D
continuity K AA2 N T AH0 N UW1 AH0 T IY0
burrow B ER1 OW0
country K AH1 N T R IY0
spent S P EH1 N T
russians R AH1 SH AH0 N Z
paris P EH1 R IH0 S
london L AH1 N D AH0 N
block B L AA1 K
hole HH OW1 L
neighborhood N EY1 B ER0 HH UH2 D
traveler T R AE1 V AH0 L ER0
chicago SH AH0 K AA1 G OW2
philly F IH1 L IY0
jukebox JH UW1 K B AA2 K S
appreciate AH0 P R IY1 SH IY0 EY2 T
drone D R OW1 N
buzzing B AH1 Z IH0 NG
herald HH EH1 R AH0 L D
pile P AY1 L
attentive AH0 T EH1 N T IH0 V
giant JH AY1 AH0 N T
roach R OW1 CH
roaches R OW1 CH IH0 Z
brute B R UW1 T
iodine AY1 AH0 D AY2 N
key K IY1
iceman AY1 S M AE2 N
municipal M Y UW0 N IH1 S AH0 P AH0 L
ring R IH1 NG
announcer AH0 N AW1 N S ER0
grey G R EY1
orange AO1 R AH0 N JH
collar K AA1 L ER0
exo EH1 K S OW0
arc AA1 R K
signed S AY1 N D
guess G EH1 S
pair P EH1 R
goggles G AA1 G AH0 L Z
jungle JH AH1 NG G AH0 L
guard G AA1 R D
legs L EH1 G Z
asleep AH0 S L IY1 P
icebox AY1 S B AA2 K S
continuous K AH0 N T IH1 N Y UW0 AH0 S
session S EH1 SH AH0 N
october AA0 K T OW1 B ER0
europe Y UH1 R AH0 P
moscow M AA1 S K AW2
capital K AE1 P AH0 T AH0 L
capitals K AE1 P AH0 T AH0 L Z
bled B L EH1 D
assure AH0 SH UH1 R
registered R EH1 JH AH0 S T ER0 D
rotorcraft R OW1 T ER0 K R AE2 F T
count K AW1 N T
inspect IH0 N S P EH1 K T
license L AY1 S AH0 N S
file F AY1 L
chair CH EH1 R
chosen CH OW1 Z AH0 N
device D IH0 V AY1 S
detonated D EH1 T AH0 N EY2 T IH0 D
entirely EH0 N T AY1 ER0 L IY0
normal N AO1 R M AH0 L
impulse IH1 M P AH0 L S
calendar K AE1 L AH0 N D ER0
autumn AO1 T AH0 M
spring S P R IH1 NG
lifted L IH1 F T IH0 D
legal L IY1 G AH0 L
tender T EH1 N D ER0
honor AA1 N ER0
reassure R IY2 AH0 SH UH1 R
reassured R IY2 AH0 SH UH1 R D
recall R IH0 K AO1 L
france F R AE1 N S
recent R IY1 S AH0 N T
confident K AA1 N F AH0 D AH0 N T
machinery M AH0 SH IY1 N ER0 IY0
property P R AA1 P ER0 T IY0
warden W AO1 R D AH0 N
wardens W AO1 R D AH0 N Z
regular R EH1 G Y AH0 L ER0
receipt R IH0 S IY1 T
mutation M Y UW0 T EY1 SH AH0 N
filed F AY1 L D
calm K AA1 M
volunteer V AA2 L AH0 N T IH1 R
volunteers V AA2 L AH0 N T IH1 R Z
winter W IH1 N T ER0
cryo K R AY1 OW0
unit Y UW1 N IH0 T
entrance EH1 N T R AH0 N S
spreads S P R EH1 D Z
panic P AE1 N IH0 K
coat K OW1 T
pamphlet P AE1 M F L AH0 T
await AH0 W EY1 T
instructions IH0 N S T R AH1 K SH AH0 N Z
follow F AA1 L OW0
facility F AH0 S IH1 L AH0 T IY0
pod P AA1 D
pods P AA1 D Z
sleeper S L IY1 P ER0
sleepers S L IY1 P ER0 Z
scorch S K AO1 R CH
kindled K IH1 N D AH0 L D
ripjaw R IH1 P JH AO2
ripjaws R IH1 P JH AO2 Z
gasfly G AE1 S F L AY2
stinger S T IH1 NG ER0
lurcher L ER1 CH ER0
oxen AA1 K S AH0 N
rotor R OW1 T ER0
oculus AA1 K Y AH0 L AH0 S
wayte W EY1 T
eli IY1 L AY0
biscuit B IH1 S K AH0 T
patrolman P AH0 T R OW1 L M AH0 N
valet V AE0 L EY1
reels R IY1 L Z
medallion M AH0 D AE1 L Y AH0 N
morphine M AO1 R F IY2 N
syrette S IH0 R EH1 T
bureau B Y UH1 R OW0
sept S EH1 T
covenant's K AH1 V AH0 N AH0 N T S
standing S T AE1 N D IH0 NG
zone Z OW1 N
ruins R UW1 AH0 N Z
mortar M AO1 R T ER0
`;
})();
