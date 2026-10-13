// play-inline-35 01 — gender
// Lines 32-363 of readable/play-inline-35.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;
  const T = S.radioText;
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  const STATIONS = [
    {
      id: "rfm",
      name: "Radio Free Manhattan",
      freq: 97.3,
      chain: { crackle: 0.35, lp: 3600 },
    },
    {
      id: "continuity",
      name: "Continuity Radio",
      freq: 88.1,
      chain: { crackle: 0.12, lp: 4000 },
    },
    {
      id: "ebs",
      name: "Emergency Broadcast — Civil Defense",
      freq: 101.1,
      chain: { crackle: 0.05, lp: 3200 },
    },
    {
      id: "classical",
      name: "Classical NYC",
      freq: 104.5,
      chain: { crackle: 0.2, lp: 5500, hp: 120 },
    },
    // range-limited signals: on the dial only within `range` m of `src` (outdoors)
    {
      id: "sig_c4",
      name: "Cryo Unit C-4 Distress Signal",
      freq: 91.7,
      signal: "c4",
      gen: "beacon",
      src: { x: -75, z: 930 },
      range: 250,
      loc: "battery_park",
      chain: { crackle: 0.3, lp: 2900, hp: 320 },
    },
    {
      id: "sig_numbers",
      name: "Unidentified Signal",
      freq: 93.9,
      signal: "numbers",
      gen: "numbers",
      src: { x: 313, z: -330 },
      range: 250,
      loc: "un_hq",
      chain: { crackle: 0.12, lp: 3300, hp: 260 },
    },
    {
      id: "sig_ransom",
      name: "The Exchange — Closing Bell",
      freq: 99.5,
      signal: "ransom",
      gen: "dead",
      src: { x: 0, z: 845 },
      range: 250,
      loc: "wall_street",
      chain: { crackle: 0.45, lp: 3000, hp: 280 },
      live: () => !qFlag("betty_dead"),
    },
    // an Iron Covenant exo-rig's emergency transponder (Lancer Rask, pinned on 40th Street) — off once he is saved
    {
      id: "sig_covenant_distress",
      name: "Iron Covenant Distress Pulse",
      freq: 95.1,
      signal: "covenant",
      gen: "beacon",
      src: { x: -281, z: -197 },
      range: 220,
      pips: [
        [1760, 0, 0.07],
        [1760, 0.12, 0.07],
        [1175, 0.24, 0.2],
      ],
      chain: { crackle: 0.18, lp: 3400, hp: 300 },
      live: () => !qFlag("qx_rask_saved"),
    },
    // Sister Dawn's pirate "Dawn Hour" (05:47 game time, ~40 game minutes; text-only captions) — gated by 52_radio_story.js.
    // It sits just under Rocky's 97.3 and steps on his signal while it is on the air.
    {
      id: "dawn",
      name: "The Dawn Hour",
      freq: 97.1,
      story: "dawn",
      chain: { crackle: 0.22, lp: 2800, hp: 300 },
      live: () => !!(S.radioStory && S.radioStory.dawnLive()),
    },
  ];
  /** The quests module, when it is really running (not stubbed). */
  function questsLive() {
    try {
      return G.quests && !G.isStub("quests") && G.quests.flag ? G.quests : null;
    } catch (e) {
      return null;
    }
  }
  function qFlag(k) {
    const Q = questsLive();
    try {
      return Q ? Q.flag(k) : undefined;
    } catch (e) {
      return undefined;
    }
  }
  function qDone(id) {
    const Q = questsLive();
    try {
      return !!(Q && Q.isComplete && Q.isComplete(id));
    } catch (e) {
      return false;
    }
  }
  function qActive(id) {
    const Q = questsLive();
    try {
      return !!(Q && Q.isActive && Q.isActive(id));
    } catch (e) {
      return false;
    }
  }

  const R = (S.radio = {
    on: false,
    station: null,
    chain: null,
    cue: null,
    busy: false,
    nextAt: 0,
    speaking: false,
    speechTimer: null,
    newsQueue: [],
    progress: {},
    flags: {},
    kills: {},
    nowPlaying: null,
    lastText: null,
    playedRecent: [],
    startedAt: 0,
    sayId: 0,
    talk: null,
    pending: null,
    paused: false,
    lastStatic: 0,
    busySince: 0,
    recent: [],
    inRange: [],
    dropT: 3,
    dropping: false,
    sig: null,
  });
  for (const st of STATIONS)
    R.progress[st.id] = {
      count: 0,
      sinceTalk: 0,
      greeted: false,
      sinceSpeech: 0,
    };

  // ------------------------------------------------------------------
  // Speech
  // Lines are spoken sentence by sentence (Chrome cuts long utterances), each
  // chunk created only when the previous one ends, so volume / signal / pause
  // changes apply between sentences. Every say() carries an id: stale onend
  // callbacks from cancelled utterances can never finish a newer line.
  // An interrupted talk segment (dialogue, pause menu) is re-queued and
  // replayed from the interrupted line when the game resumes.
  // ------------------------------------------------------------------
  const VOICE_PROFILES = {
    dj: {
      rate: 1.07,
      pitch: 0.84,
      gender: "m",
      accent: "US",
      prefer: [
        "Guy",
        "Andrew",
        "Christopher",
        "Evan",
        "Tom",
        "Nathan",
        "Daniel",
        "Alex",
        "Aaron",
        "Fred",
        "David",
        "Mark",
        "Google US English",
      ],
    },
    president: {
      rate: 0.9,
      pitch: 0.72,
      gender: "m",
      accent: "US",
      prefer: [
        "Roger",
        "Davis",
        "Eric",
        "Alex",
        "Tom",
        "Evan",
        "Aaron",
        "David",
        "Ralph",
        "Daniel",
      ],
    },
    ebs: {
      rate: 0.94,
      pitch: 1.0,
      gender: "f",
      accent: "US",
      prefer: [
        "Aria",
        "Jenny",
        "Ava",
        "Allison",
        "Samantha",
        "Zoe",
        "Susan",
        "Victoria",
        "Karen",
        "Zira",
        "Google US English",
      ],
    },
    classical: {
      rate: 0.94,
      pitch: 0.95,
      gender: "m",
      accent: "GB",
      prefer: [
        "Ryan",
        "Oliver",
        "Arthur",
        "Daniel",
        "Thomas",
        "Google UK English Male",
      ],
    },
    announcer: {
      rate: 1.0,
      pitch: 0.9,
      gender: "m",
      accent: "US",
      prefer: [
        "Christopher",
        "Eric",
        "Evan",
        "Alex",
        "Tom",
        "David",
        "Google US English",
      ],
    },
    director: {
      rate: 0.88,
      pitch: 0.85,
      gender: "f",
      accent: "US",
      prefer: [
        "Allison",
        "Susan",
        "Ava",
        "Samantha",
        "Jenny",
        "Aria",
        "Victoria",
        "Google US English",
      ],
    },
    transponder: {
      rate: 0.85,
      pitch: 0.6,
      gender: "m",
      accent: "US",
      prefer: ["Fred", "Alex", "David", "Tom", "Google US English"],
    },
  };
  const QUALITY = /enhanced|premium|natural|neural|online|siri/i;
  const NOVELTY =
    /albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|zarvox|trinoids|whisper|jester|organ|superstar|good news|hysterical|junior|princess|deranged|pipe|grandma|grandpa|rocko|shelley|flo|sandy|eddy|reed/i;
  const MALE =
    /guy|andrew|christopher|eric|roger|steffan|brian|davis|tony|jason|evan|tom\b|nathan|alex\b|daniel|fred|aaron|arthur|oliver|ryan|david|mark|ralph|lee\b|gordon|thomas|george|james|william|male/i;
  const FEMALE =
    /aria|jenny|michelle|ava\b|zoe|samantha|allison|susan|karen|victoria|zira|emma|joelle|nicky|serena|moira|tessa|kate|catherine|female|hazel|libby|sonia|jane|nancy|sara|ana\b|emily/i;
  let voices = [];
  const chosen = {};
  function loadVoices() {
    try {
      voices = window.speechSynthesis
        ? window.speechSynthesis.getVoices() || []
        : [];
    } catch (e) {
      voices = [];
    }
    for (const k in chosen) delete chosen[k];
  }
  if (window.speechSynthesis) {
    loadVoices();
    try {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    } catch (e) {
      /* old API */
    }
  }
  /** Score every English voice for a profile: quality (neural/premium) ≫ preferred name > gender > accent. */
  function scoreVoice(v, p) {
    const n = v.name || "";
    if (!/^en/i.test(v.lang || "")) return -1e9;
    let s = 0;
    if (NOVELTY.test(n)) s -= 500;
    if (QUALITY.test(n)) s += 120;
    const idx = p.prefer.findIndex((x) => n.indexOf(x) >= 0);
    if (idx >= 0) s += 60 - idx * 2;
    if (p.gender === "m" && MALE.test(n)) s += 35;
    else if (p.gender === "f" && FEMALE.test(n)) s += 35;
    else if (
      (p.gender === "m" && FEMALE.test(n)) ||
      (p.gender === "f" && MALE.test(n))
    )
      s -= 40;
    if (new RegExp("en[-_]" + p.accent, "i").test(v.lang)) s += 12;
    if (v.localService) s += 3; // no network hiccups
    return s;
  }
