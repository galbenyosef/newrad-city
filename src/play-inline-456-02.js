// play-inline-456 02 — dur
// Lines 32-376 of readable/play-inline-456.pretty.js (statement-aligned).
  const L = G.chars._lib;
  const clamp = L.clamp,
    lerp = L.lerp;

  // ------------------------------------------------------------------
  // Visemes: jaw (radians), wide / round (0..1), press (lips together), up (upper-lip raise)
  // ------------------------------------------------------------------
  const VIS = {
    rest: { jaw: 0.0, wide: 0, round: 0, press: 0, up: 0 },
    closed: { jaw: -0.01, wide: 0.05, round: 0, press: 1, up: 0 },
    open: { jaw: 0.16, wide: 0.15, round: 0, press: 0, up: 0.45 },
    wide: { jaw: 0.065, wide: 1, round: 0, press: 0, up: 0.55 },
    round: { jaw: 0.1, wide: -0.3, round: 1, press: 0, up: 0.15 },
    fv: { jaw: 0.035, wide: 0.2, round: 0, press: 0.25, up: 0.8 },
    th: { jaw: 0.07, wide: 0.45, round: 0, press: 0, up: 0.35 },
    mid: { jaw: 0.075, wide: 0.3, round: 0.1, press: 0, up: 0.3 },
    sh: { jaw: 0.06, wide: -0.1, round: 0.7, press: 0, up: 0.5 },
  };
  const LETTER = {
    a: "open",
    e: "wide",
    i: "wide",
    y: "wide",
    o: "round",
    u: "round",
    w: "round",
    q: "round",
    r: "round",
    m: "closed",
    b: "closed",
    p: "closed",
    f: "fv",
    v: "fv",
    s: "mid",
    z: "mid",
    t: "mid",
    d: "mid",
    n: "mid",
    c: "mid",
    k: "mid",
    g: "mid",
    j: "sh",
    x: "mid",
    h: "open",
    l: "th",
  };
  const VOWEL = { a: 1, e: 1, i: 1, o: 1, u: 1, y: 1 };
  const CPS = 14.5; // characters per second at speech rate 1

  /** Text → [{t, dur, v, w, ci}] viseme keys (+ total duration). */
  function visemeTrack(text, rate) {
    const keys = [];
    const s = String(text || "")
      .toLowerCase()
      .replace(/\*[^*]*\*/g, " ")
      .replace(/\[[^\]]*\]/g, " ");
    const base = 1 / (CPS * (rate || 1));
    let t = 0.06,
      stress = 1;
    for (let i = 0; i < s.length; i++) {
      const c = s[i],
        n = s[i + 1] || "";
      if (c === " " || c === "\n" || c === "\t") {
        keys.push({ t, dur: base * 0.6, v: "rest", w: 0.5, ci: i });
        t += base * 0.6;
        stress = 0.75 + Math.random() * 0.5;
        continue;
      }
      if (c === "," || c === ";" || c === ":" || c === "-" || c === "—") {
        keys.push({ t, dur: 0.24, v: "rest", w: 1, ci: i });
        t += 0.24;
        continue;
      }
      if (c === "." || c === "!" || c === "?") {
        keys.push({ t, dur: 0.4, v: "rest", w: 1, ci: i, stop: true });
        t += 0.4;
        continue;
      }
      let v = null,
        len = 1,
        dur = base;
      const dg = c + n;
      if (dg === "th") {
        v = "th";
        len = 2;
      } else if (dg === "sh" || dg === "ch") {
        v = "sh";
        len = 2;
      } else if (dg === "oo" || dg === "ou" || dg === "ow") {
        v = "round";
        len = 2;
        dur *= 1.6;
      } else if (dg === "ee" || dg === "ea") {
        v = "wide";
        len = 2;
        dur *= 1.6;
      } else v = LETTER[c] || null;
      if (!v) {
        if (/[0-9]/.test(c)) v = "mid";
        else continue;
      }
      if (VOWEL[c]) dur *= 1.35;
      else if (v === "closed" || v === "fv") dur *= 1.1;
      else dur *= 0.8;
      keys.push({
        t,
        dur,
        v,
        w: VOWEL[c] ? stress : 0.85,
        ci: i,
        vowel: !!VOWEL[c],
      });
      t += dur;
      i += len - 1;
    }
    // TIMING: speech runs at a roughly constant SYLLABLE rate, not a constant
    // letter rate ("strengths" ≈ "idea" in time). Re-time the articulated keys
    // so the line lasts syllables / 4.3 per second (× rate) + its pauses — the
    // clock used when the voice gives no word-boundary events (or no voice).
    let syl = 0,
      pause = 0,
      art = 0;
    const words = s.match(/[a-z']+/g) || [];
    for (const w of words) {
      const g = w.replace(/e$/, "").match(/[aeiouy]+/g);
      syl += Math.max(1, g ? g.length : 1);
    }
    for (const k of keys) {
      if (k.v === "rest" && k.w >= 1) pause += k.dur;
      else art += k.dur;
    }
    if (art > 0 && syl > 0) {
      const f = clamp(syl / (4.3 * (rate || 1)) / art, 0.6, 1.7);
      let tt = 0.06;
      for (const k of keys) {
        if (!(k.v === "rest" && k.w >= 1)) k.dur *= f;
        k.t = tt;
        tt += k.dur;
      }
      t = tt;
    }
    return { keys, dur: t + 0.1 };
  }
  L.visemeTrack = visemeTrack;

  // ------------------------------------------------------------------
  // Expression presets (unit-less; FaceCtl scales them by head size)
  //   cY/cX/cZ: mouth corners up / out / back · bY: brows up · bIn: brows
  //   pull together · bRot: inner brow DOWN (+) / up (−) · lidU: upper lids
  //   open (+) / squint (−) · lidLo: lower lids up · lipU: upper lip raise
  // ------------------------------------------------------------------
  const EMO = {
    neutral: {},
    happy: {
      cY: 1,
      cX: 0.7,
      cZ: 0.5,
      bY: 0.25,
      lidU: -0.06,
      lidLo: 0.16,
      jaw: 0.02,
      lipU: 0.25,
    },
    angry: {
      cY: -0.35,
      cX: -0.25,
      bY: -0.65,
      bIn: 0.8,
      bRot: 1,
      lidU: -0.1,
      lidLo: 0.12,
      lipU: 0.35,
    },
    afraid: {
      cY: -0.35,
      cX: 0.75,
      bY: 0.95,
      bIn: 0.45,
      bRot: -0.9,
      lidU: 0.22,
      lidLo: -0.04,
      jaw: 0.08,
    },
    sad: { cY: -0.85, cX: -0.1, bY: 0.2, bIn: 0.25, bRot: -1, lidU: -0.14 },
    surprised: { bY: 1.25, lidU: 0.28, jaw: 0.2, cX: -0.25 },
    disgust: {
      lipU: 0.9,
      cY: -0.45,
      bY: -0.4,
      bIn: 0.45,
      bRot: 0.4,
      lidLo: 0.18,
      lidU: -0.08,
    },
    pain: {
      bY: -0.25,
      bIn: 0.9,
      bRot: -0.55,
      lidU: -0.3,
      lidLo: 0.16,
      jaw: 0.12,
      cX: 0.8,
      cY: -0.35,
      lipU: 0.7,
    },
    maniac: {
      lipU: 1.1,
      cY: -0.5,
      cX: 0.6,
      bY: -0.6,
      bIn: 1,
      bRot: 1,
      lidU: 0.12,
      jaw: 0.1,
    },
    smug: { cY: 0.55, cX: 0.3, cZ: 0.3, bY: 0.1, lidU: -0.12, lidLo: 0.08 },
  };
  const EMO_KEYS = [
    "cY",
    "cX",
    "cZ",
    "bY",
    "bIn",
    "bRot",
    "lidU",
    "lidLo",
    "jaw",
    "lipU",
  ];
  const ALIAS = {
    joy: "happy",
    glad: "happy",
    friendly: "happy",
    smile: "happy",
    laugh: "happy",
    mad: "angry",
    hostile: "angry",
    rage: "angry",
    furious: "angry",
    fear: "afraid",
    scared: "afraid",
    nervous: "afraid",
    worried: "afraid",
    terrified: "afraid",
    sorrow: "sad",
    grief: "sad",
    upset: "sad",
    shock: "surprised",
    shocked: "surprised",
    surprise: "surprised",
    disgusted: "disgust",
    hurt: "pain",
    calm: "neutral",
    none: "neutral",
    default: "neutral",
    sly: "smug",
    cocky: "smug",
  };
  function emoName(n) {
    if (!n) return null;
    n = String(n).toLowerCase();
    n = ALIAS[n] || n;
    return EMO[n] ? n : null;
  }
  L.FACE_EMOTIONS = Object.keys(EMO);

  /** Cheap sentiment guess for dialogue lines with no explicit emotion. */
  function inferEmotion(text) {
    const s = String(text || "").toLowerCase();
    if (!s) return null;
    const has = (re) => re.test(s);
    if (
      has(
        /\b(kill|die|dead meat|shut up|get out|scram|beat it|idiot|moron|damn you|bastard|how dare|back off|last warning)\b/,
      )
    )
      return "angry";
    if (
      has(
        /\b(please|help|don't hurt|don't shoot|scared|afraid|oh god|run|they're coming|monsters?|hide)\b/,
      )
    )
      return "afraid";
    if (
      has(
        /\b(sorry|lost|gone|miss (him|her|them)|alone|funeral|passed away|dead now|nobody left|weep)\b/,
      )
    )
      return "sad";
    if (
      has(/\b(what\?!|really\?!|no way|impossible|you're kidding|holy)\b/) ||
      /\?!|!\?/.test(s)
    )
      return "surprised";
    if (
      has(
        /\b(ha(ha)+|thanks|thank you|great|wonderful|welcome|friend|glad|perfect|excellent|lovely|pleasure|swell|nifty|good to see)\b/,
      )
    )
      return "happy";
    if (has(/\b(disgusting|gross|smell|stink|filth|vile)\b/)) return "disgust";
    return null;
  }
  L.inferEmotion = inferEmotion;

  // ------------------------------------------------------------------
  // speechSynthesis: remember the last utterance so dialogueNode can bind
  // its word-boundary events to the speaker's mouth.
  // ------------------------------------------------------------------
  let lastUtt = null;
  (function hookSpeech() {
    try {
      const ss = window.speechSynthesis;
      if (!ss || ss.__fnyFaceHook) return;
      const orig = ss.speak;
      if (typeof orig !== "function") return;
      ss.speak = function (u) {
        try {
          lastUtt = { u, at: performance.now() };
        } catch (e) {
          /* ignore */
        }
        return orig.apply(ss, arguments);
      };
      ss.__fnyFaceHook = true;
    } catch (e) {
      /* speech is optional */
    }
  })();
  L.takeRecentUtterance = function (maxAgeMs) {
    if (!lastUtt || performance.now() - lastUtt.at > (maxAgeMs || 250))
      return null;
    const u = lastUtt.u;
    lastUtt = null;
    return u;
  };

  // ------------------------------------------------------------------
  // FaceCtl
  // ------------------------------------------------------------------
  const _m = new THREE.Matrix4(),
    _v = new THREE.Vector3(),
    _t = new THREE.Vector3();
  const rnd = (a, b) => a + Math.random() * (b - a);

