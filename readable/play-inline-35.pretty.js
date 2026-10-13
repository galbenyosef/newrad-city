/* src/sound/50_radio.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 50_radio.js
 * The goggle radio (G.radio).
 *
 * Stations (all original content):
 *   Radio Free Manhattan  — DJ "Rocky" Delgado at Radio City: procedurally
 *                           composed 1940s/50s swing, ballads, boogie &
 *                           rhumba records (ten of them SUNG, with original
 *                           lyrics), DJ patter that follows the story (the
 *                           sleeper from Cryo Unit C-9, standing title,
 *                           faction choice, Kong), PSAs and news bulletins
 *                           with a teletype sting (G.radio.addNews + reactive
 *                           news written here). Weak & dropping out until
 *                           MQ03's amplifier is delivered, then loud and
 *                           clear. Signal weakens far from Radio City & indoors.
 *   Continuity Radio      — band marches + Acting President Marsh's addresses.
 *   Emergency Broadcast   — Office of Civil Defense attention tone + message loop.
 *   Classical NYC         — procedural sonatas, nocturnes, adagios, waltzes.
 *   + four range-limited signals that only appear on the dial within ~220–250 m
 *     of their source (Cryo Unit C-4 distress tape at Battery Park, a numbers
 *     station by the U.N., Bear Market Betty's ransom "closing bell" at the
 *     Exchange). First tune-in marks the location and emits radioSignalFound.
 * Everything plays through an AM-radio chain (band-limit, tube warmth,
 * wow/flutter, crackle, signal static). Spoken lines are subtitles by
 * default (voice mode 'subtitles'); 'radioText' events always carry them.
 * Emits: radioChanged(stationId|null), radioText({station, speaker, text}),
 *        radioSong({station, title, artist, vocal}), radioSignalFound({id, name,
 *        location, x, z}), radioStationsChanged([ids]), radioNews({text}).
 * ===================================================================== */
(function () {
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
  function voiceFor(profileId) {
    if (chosen[profileId] !== undefined) return chosen[profileId];
    if (!voices.length) loadVoices();
    const p = VOICE_PROFILES[profileId] || VOICE_PROFILES.dj;
    // keep the DJ and the President on different voices when possible
    const avoid =
      profileId === "president"
        ? voiceFor("dj")
        : profileId === "announcer"
          ? voiceFor("president")
          : null;
    let best = null,
      bs = -1e9;
    for (const v of voices) {
      const sc = scoreVoice(v, p) - (avoid && v === avoid ? 45 : 0);
      if (sc > bs) {
        bs = sc;
        best = v;
      }
    }
    chosen[profileId] = best || voices[0] || null;
    return chosen[profileId];
  }
  // Voice mode (persisted per browser):
  //   'radio'     (default) — VOX, the procedural formant voice, performed INSIDE the WebAudio graph: through the
  //               station's AM chain, mixer, ducking and world-radio distance/panning; words in 'radioText' subtitles.
  //   'tts'       — the OS speechSynthesis voice (clearer words, but modern and outside the AM chain).
  //   'subtitles' — silent: subtitles only.
  const MODES = ["radio", "tts", "subtitles"];
  R.voiceMode = "subtitles"; // no spoken voice-overs by default (user preference): DJ/President/announcer lines are subtitles only
  {
    const m = S.lsGet("radio_voice3");
    if (MODES.includes(m)) R.voiceMode = m;
  }
  S.lsRemove("radio");
  S.lsRemove("radio_voice"); // legacy keys (old default was tts)
  S.speechOK = function () {
    return (
      !!(window.speechSynthesis && window.SpeechSynthesisUtterance) &&
      !G.SMOKE &&
      !G.SHOT &&
      R.voiceMode === "tts"
    );
  };
  S.voxOK = function () {
    return !!(
      S.vox &&
      S.ctx &&
      S.bus &&
      S.ctx.state === "running" &&
      R.voiceMode === "radio"
    );
  };
  /** Goggle speaker for scripted lines (G.sfx.speak): a small, clean AM-ish chain into the UI bus, built per line. */
  function goggleSpeaker() {
    const c = S.inst.radioChain(S.ctx, S.bus.ui, {
      crackle: 0.05,
      hiss: 0.004,
      lp: 3800,
      hp: 180,
      out: 0.8,
    });
    return c;
  }
  /** Standing title / tier from the progression module (title fallback 'Stranger'; tier 1 good … 3 feared). */
  function standingTitle() {
    try {
      const P = G.rpg && !G.isStub("rpg") ? G.rpg : null;
      const f = P && P.standingTitle;
      return (f && f.call(P)) || "Stranger";
    } catch (e) {
      return "Stranger";
    }
  }
  function standingTier() {
    try {
      const P = G.rpg && !G.isStub("rpg") ? G.rpg : null;
      const f = P && P.standingTier;
      return f ? f.call(P) : 2;
    } catch (e) {
      return 2;
    }
  }
  function fill(text, song) {
    const dj = T.djName || "Rocky Delgado";
    const hero = S.heroName();
    return text
      .replace(/\{name\}/g, hero)
      .replace(/\{first\}/g, String(hero).split(" ")[0])
      .replace(/\{title\}/g, song ? song.title : "that one")
      .replace(/\{artist\}/g, song ? song.artist : "the band")
      .replace(/\{standing\}/g, standingTitle)
      .replace(/\{djFirst\}/g, dj.split(" ")[0])
      .replace(/\{dj\}/g, dj);
  }
  /** Effective loudness of a speech utterance: radio volume × signal strength (speechSynthesis can't enter WebAudio). */
  function speechVolume(station) {
    const sig = station === "goggles" ? 0 : R.lastStatic || 0;
    const where =
      station !== "goggles" && R.emitter
        ? R.emitter.gainAt() * S.vol.sfx
        : S.radioGain();
    return S.clamp(S.vol.master * where * 1.15 * (1 - sig * 0.6), 0, 1);
  }
  /** Speak a line on the radio (or emit subtitles only). Calls done() when finished (never after a cancel). */
  function say(station, speaker, profileId, text, done, lineOpts) {
    if (R.speaking && station === "goggles") cancelSpeech(true); // a scripted line pre-empts (and later replays) the DJ
    const id = ++R.sayId;
    const textOnly = !!(lineOpts && lineOpts.textOnly); // never voiced in any mode (the Dawn Hour): captions only
    const voxText = fill(text);
    // performance marks ([laugh], [whoop], *emphasis*) are for VOX only: captions and TTS get the plain words
    text = S.vox && S.vox.stripMarks ? S.vox.stripMarks(voxText) : voxText;
    R.speaking = true;
    // before the amplifier, Radio Free Manhattan's words drop out under the static (captions too)
    // (news bulletins stay whole: the listener needs the story even on the weak transmitter)
    let shown = text,
      drop = null;
    if (
      station === "rfm" &&
      !ampOn() &&
      !(lineOpts && lineOpts.news) &&
      !textOnly
    ) {
      const g = garbleSync(text);
      shown = g.text;
      drop = g.drop;
    }
    R.lastText = { station, speaker, text: shown, t: G.time.real };
    G.events.emit("radioText", { station, speaker, text: shown });
    const finish = () => {
      if (id !== R.sayId || !R.speaking) return;
      R.speaking = false;
      clearTimeout(R.speechTimer);
      clearTimeout(R.chunkTimer);
      stopVox(0.05);
      R.busySince = G.time.real; // watchdog measures silence since the last line, not since the segment began
      if (R.chain && station !== "goggles") {
        R.chain.speechBed(0);
        S.play("radio_mic_click", {
          volume: 0.25,
          bus: "radio",
          dest: R.chain.input,
        });
      }
      if (done) done();
    };
    const est = 1.5 + text.split(/\s+/).length / 2.6;
    // studio presence: mic click + a faint room/carrier bed under the voice through the AM chain
    if (R.chain && station !== "goggles") {
      S.play("radio_mic_click", {
        volume: 0.35,
        bus: "radio",
        dest: R.chain.input,
      });
      R.chain.speechBed(1);
    }
    if (!textOnly && S.voxOK()) {
      try {
        const ctx = S.ctx;
        let spk = null,
          dest;
        if (station === "goggles" || !R.chain) {
          spk = goggleSpeaker();
          dest = spk.input;
        } else dest = R.chain.input;
        const ctl = S.vox.say(ctx, dest, voxText, profileId, {
          start: ctx.currentTime + 0.12,
          gain: station === "goggles" ? 0.9 : 1,
          drop,
        });
        R.vox = { ctl, spk, id, chain: null };
        // the words missing from the captions drop out of the audio too, under a burst of static — scheduled on the
        // audio clock at the words' exact times (sample-accurate, immune to timer jitter and main-thread stalls)
        if (
          ctl.drops &&
          ctl.drops.length &&
          R.chain &&
          R.chain.scheduleDrops &&
          station !== "goggles"
        ) {
          R.chain.scheduleDrops(ctl.drops, Math.min(0.95, R.lastStatic + 0.45));
          R.vox.chain = R.chain;
        }
        if (S.subsTiming)
          S.subsTiming(
            shown,
            ctl.start - ctx.currentTime,
            ctl.plannedEnd - ctl.start,
          );
        // lookahead pump: schedules phrase automation ~1.5 s ahead and finishes the line on the audio clock
        R.voxTimer = setInterval(() => {
          if (!R.vox || R.vox.id !== id) return;
          const now = ctx.currentTime;
          ctl.pump(now + 1.6);
          if (now >= ctl.plannedEnd + 0.15) finish();
        }, 200);
        R.speechTimer = setTimeout(
          finish,
          ((ctl.plannedEnd - ctx.currentTime) * 1.5 + 6) * 1000,
        ); // safety net (suspended context)
        return;
      } catch (e) {
        G.reportError("sound:vox", e);
        stopVox(0);
      }
    }
    if (!textOnly && S.speechOK()) {
      try {
        const ss = window.speechSynthesis,
          p = VOICE_PROFILES[profileId] || VOICE_PROFILES.dj;
        const v = voiceFor(profileId);
        // clause-sized chunks (≈ 2–4 s each): the volume of an utterance is fixed once spoken, so short chunks let
        // radio volume, signal and the distance to a world radio track the listener during a line
        const parts = text.match(
          /[^.!?,;:—]+[.!?,;:—]+["')]*\s*|[^.!?,;:—]+$/g,
        ) || [text];
        const chunks = [];
        for (const pt of parts) {
          if (chunks.length && (chunks[chunks.length - 1] + pt).length < 70)
            chunks[chunks.length - 1] += pt;
          else chunks.push(pt);
        }
        let ci = 0,
          cur = null;
        const speakNext = () => {
          if (id !== R.sayId || !R.speaking) return;
          clearTimeout(R.chunkTimer);
          if (ci >= chunks.length) {
            finish();
            return;
          }
          const my = ci,
            c = chunks[ci++].trim();
          const u = new window.SpeechSynthesisUtterance(c);
          if (v) u.voice = v;
          u.rate = p.rate;
          u.pitch = p.pitch;
          u.volume = speechVolume(station);
          cur = { u, my };
          const next = () => {
            if (my === ci - 1) {
              cur = null;
              setTimeout(speakNext, 40);
            }
          };
          u.onend = next;
          u.onerror = next;
          // safety net: some engines never fire onend
          R.chunkTimer = setTimeout(
            next,
            (1.2 + c.split(/\s+/).length / 2.2 / p.rate) * 1800 + 2500,
          );
          ss.speak(u);
        };
        // volume tracking: when the wanted level falls well below the chunk's level (walking away from a world
        // radio, turning the radio down), cut the chunk short and carry on at the new level
        clearInterval(R.ttsVolTimer);
        R.ttsVolTimer = setInterval(() => {
          if (id !== R.sayId || !R.speaking) {
            clearInterval(R.ttsVolTimer);
            return;
          }
          if (!cur) return;
          const want = speechVolume(station);
          if (
            cur.u.volume - want > 0.25 ||
            (want < 0.03 && cur.u.volume > 0.08)
          ) {
            try {
              ss.cancel();
            } catch (e) {
              /* */
            }
          }
        }, 250);
        speakNext();
        R.speechTimer = setTimeout(finish, (est * 2.2 + 8) * 1000); // global safety net
        return;
      } catch (e) {
        /* fall through to subtitle timing */
      }
    }
    R.speechTimer = setTimeout(finish, est * 1000);
  }
  /**
   * Stop any speech. requeue=true re-queues the interrupted talk segment (from the interrupted line) so it
   * plays again when the game resumes; otherwise the segment is dropped. Always leaves the station unblocked.
   */
  function stopVox(fade) {
    clearInterval(R.voxTimer);
    clearInterval(R.ttsVolTimer);
    const v = R.vox;
    R.vox = null;
    if (!v) return;
    if (v.chain && v.chain.clearDrops) v.chain.clearDrops(0.12);
    try {
      v.ctl.stop(fade);
    } catch (e) {
      /* */
    }
    if (v.spk) {
      const spk = v.spk;
      setTimeout(() => spk.dispose(), ((fade || 0) + 0.4) * 1000);
    }
  }
  function cancelSpeech(requeue) {
    R.sayId++;
    const was = R.speaking;
    R.speaking = false;
    clearTimeout(R.speechTimer);
    clearTimeout(R.chunkTimer);
    stopVox(0.08);
    if (R.chain) R.chain.speechBed(0);
    try {
      if (
        window.speechSynthesis &&
        (window.speechSynthesis.speaking || window.speechSynthesis.pending)
      )
        window.speechSynthesis.cancel();
    } catch (e) {
      /* */
    }
    const talk = R.talk;
    if (talk) {
      if (requeue && R.on && talk.station === R.station) {
        const from = Math.max(0, talk.i - (was ? 1 : 0));
        const rest = talk.lines.slice(from);
        R.pending = rest.length
          ? { kind: "talk", lines: rest, then: talk.then }
          : talk.then || null;
      } else if (talk.then && R.on && talk.station === R.station)
        R.pending = talk.then; // still play the record the DJ was introducing
      R.talk = null;
    }
    R.busy = false;
    R.nextAt = G.time.real + 1;
  }
  S.radioSay = say;

  // ------------------------------------------------------------------
  // Radio Free Manhattan state: the amplifier (MQ03), garbled weak signal,
  // lines that follow the story, stings
  // ------------------------------------------------------------------
  /** Has Rocky got his Signal Amplifier (MQ03 done)? Without a quests module the station is always at full power. */
  function ampOn() {
    if (R.flags.amp) return true;
    if (!questsLive()) return true;
    if (qDone("mq03")) {
      R.flags.amp = true;
      return true;
    }
    return false;
  }
  /** Captions of a weak broadcast: words lost in the static (never the first few). */
  /** Weak-signal dropouts, word-exact: returns the caption with the lost words and their VOX word indices. */
  function garbleSync(text) {
    const w = text.split(" ");
    const counts = S.vox && S.vox.tokenWords ? S.vox.tokenWords(text) : null;
    const drop = new Set();
    let lost = 0,
      gi = 0;
    for (let i = 0; i < w.length; i++) {
      const n = counts ? counts[i] : 1;
      if (
        i >= 3 &&
        n > 0 &&
        w[i] !== "—" &&
        Math.random() < 0.11 &&
        lost < w.length * 0.2
      ) {
        for (let k = 0; k < n; k++) drop.add(gi + k);
        w[i] = "—";
        lost++;
      }
      gi += n;
    }
    return {
      text: w
        .join(" ")
        .replace(/(— )+—/g, "—")
        .replace(/ — /g, " … "),
      drop: counts ? drop : null,
    };
  }
  /** Pick a line not heard recently (on-air repetition is what makes a radio feel canned). */
  function pickFresh(arr) {
    if (!arr || !arr.length) return "";
    const fresh = arr.filter((l) => !R.recent.includes(l));
    const l = pick(fresh.length ? fresh : arr);
    R.recent.push(l);
    if (R.recent.length > 24) R.recent.shift();
    return l;
  }
  /** Story gate for stock lines (52_radio_story.js: e.g. no Betty banter once she is dead). */
  function okLine(l) {
    try {
      return !S.radioStory || S.radioStory.allowed(l);
    } catch (e) {
      return true;
    }
  }
  function okLines(arr) {
    const f = arr.filter(okLine);
    return f.length ? f : arr;
  }
  function sleeperOut() {
    return !!(R.flags.sleeperOut || qFlag("left_cryo"));
  }
  /** Patter that reacts to what the hero has done: name & standing title, faction choice, Kong's fate. */
  function storyLines() {
    const out = [];
    if (sleeperOut() && T.djPlayer) {
      const tier = standingTier();
      out.push(
        ...(tier <= 1
          ? T.djPlayer.good
          : tier >= 3
            ? T.djPlayer.evil
            : T.djPlayer.neutral),
      );
    }
    if (questsLive()) {
      const fac = qFlag("mq_faction");
      if (fac && T.djFaction[fac])
        out.push(...T.djFaction[fac], ...T.djFaction[fac]); // weighted: it's the big news
      else if (qActive("mq04")) out.push(...T.djFaction.pending);
      const K = T.djKong;
      if (qFlag("kong_friend")) out.push(...K.friend);
      else if (qFlag("kong_dead")) out.push(...K.dead);
      else if (qFlag("kong_resolution") === "speech") out.push(...K.speech);
      else if (qFlag("kong_resolution") === "trick") out.push(...K.trick);
    }
    if (S.radioStory) {
      try {
        out.push(...S.radioStory.patter());
      } catch (e) {
        G.reportError("sound:radioStory", e);
      }
    }
    return out.filter((l) => !R.recent.includes(l) && okLine(l));
  }
  /**
   * On-air stings through the station chain. 'news' = teletype chatter + a three-note brass fanfare,
   * 'id' = the Radio Free Manhattan vibes chime. Returns the duration (s).
   */
  function playSting(kind, dest, t) {
    const ctx = S.ctx,
      I = S.inst;
    if (!ctx || !dest) return 0;
    if (kind === "pirate") {
      // another carrier walks onto the frequency: a heterodyne whistle sliding down to zero beat under a burst of
      // static, then three small handbell notes (the Dawn Hour's call)
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(2600, t);
      o.frequency.exponentialRampToValueAtTime(70, t + 1.5);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0, t);
      og.gain.linearRampToValueAtTime(0.16, t + 0.12);
      og.gain.setValueAtTime(0.16, t + 1.3);
      og.gain.linearRampToValueAtTime(0, t + 1.7);
      o.connect(og);
      og.connect(dest);
      o.start(t);
      o.stop(t + 1.8);
      const n = ctx.createBufferSource();
      n.buffer = S.noiseBufs.white;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1700;
      bp.Q.value = 0.7;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0, t);
      ng.gain.linearRampToValueAtTime(0.32, t + 0.05);
      ng.gain.exponentialRampToValueAtTime(0.002, t + 1.2);
      n.connect(bp);
      bp.connect(ng);
      ng.connect(dest);
      n.start(t, Math.random());
      n.stop(t + 1.3);
      [76, 72, 79].forEach((m, i) => {
        tone(dest, S.mtof(m), t + 1.8 + i * 0.42, 0.6, 0.07, "sine");
        tone(dest, S.mtof(m) * 2.76, t + 1.8 + i * 0.42, 0.25, 0.015, "sine");
      });
      return 3.4;
    }
    if (kind === "news") {
      // teletype: bursts of tiny filtered clicks
      let tt = t;
      while (tt < t + 1.25) {
        const src = ctx.createBufferSource();
        src.buffer = S.noiseBufs.white;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 2400 + Math.random() * 1600;
        bp.Q.value = 3;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, tt);
        g.gain.linearRampToValueAtTime(0.5, tt + 0.002);
        g.gain.exponentialRampToValueAtTime(0.001, tt + 0.03);
        src.connect(bp);
        bp.connect(g);
        g.connect(dest);
        src.start(tt, Math.random());
        src.stop(tt + 0.04);
        tt += Math.random() < 0.2 ? 0.14 : 0.045 + Math.random() * 0.03;
      }
      const f = t + 1.3;
      I.synth(ctx, dest, "trumpet", 67, f, 0.16, 0.34);
      I.synth(ctx, dest, "trumpet", 72, f + 0.2, 0.16, 0.34);
      I.synth(ctx, dest, "trumpet", 76, f + 0.4, 0.75, 0.38);
      [60, 64, 67].forEach((m) =>
        I.synth(ctx, dest, "brass", m, f + 0.4, 0.75, 0.2, { bright: 2600 }),
      );
      if (I.ready.drums) I.drum(ctx, dest, "crash", f + 0.4, 0.16);
      return 2.6;
    }
    // station ID chime
    [72, 76, 79, 84].forEach((m, i) => {
      if (I.ready.vibes) I.sample(ctx, dest, "vibes", m, t + i * 0.2, 0.8, 0.4);
      else I.synth(ctx, dest, "flute", m, t + i * 0.2, 0.3, 0.25);
    });
    return 1.3;
  }

  // ------------------------------------------------------------------
  // Station programming
  // ------------------------------------------------------------------
  function chooseSong(list) {
    const fresh = list.filter((s) => !R.playedRecent.includes(s.title));
    const s = pick(fresh.length ? fresh : list);
    R.playedRecent.push(s.title);
    if (R.playedRecent.length > Math.min(8, list.length - 1))
      R.playedRecent.shift();
    return s;
  }
  /** Returns next program item for station: {kind:'song', song, startBar?} | {kind:'talk', lines:[[speaker, profile, text]]} */
  function nextItem(id) {
    const P = R.progress[id];
    const prev =
      R.nowPlaying && R.nowPlaying.station === id ? R.nowPlaying : null;
    if (id === "rfm" && S.radioStory && S.radioStory.rfmDead())
      return { kind: "deadair" }; // off the air after the Second Sun
    if (id === "dawn")
      return S.radioStory ? S.radioStory.dawnItem() : { kind: "deadair" };
    if (id === "rfm") {
      const dj = T.djName,
        amp = ampOn();
      const outro = () =>
        prev && prev.kind === "song"
          ? [
              dj,
              "dj",
              fill(
                pickFresh(
                  prev.vocal && Math.random() < 0.7
                    ? T.djOutroVocal
                    : T.djOutro,
                ),
                prev,
              ),
            ]
          : null;
      const intro = (song) => [
        dj,
        "dj",
        fill(
          pickFresh(
            song.vocal && Math.random() < 0.6 ? T.djIntroVocal : T.djIntro,
          ),
          song,
        ),
      ];
      if (!P.greeted) {
        P.greeted = true;
        return {
          kind: "talk",
          lines: [
            ["#sting", "id"],
            [dj, "dj", pickFresh(amp ? T.djGreet : T.djGreetWeak)],
          ],
        };
      }
      // news bulletins go out right after the record that was playing when they came in (never more than 1–2 songs late)
      if (R.newsQueue.length && (P.lastWasSong || P.newsWait >= 1)) {
        P.lastWasSong = false;
        P.newsWait = 0;
        const items = R.newsQueue.splice(0, 2);
        const lines = [];
        const o = outro();
        if (o && Math.random() < 0.5) lines.push(o);
        lines.push(["#sting", "news"]);
        lines.push([
          dj,
          "dj",
          pickFresh(T.djNewsIntro) +
            items.join(" Also: ") +
            " " +
            pickFresh(T.djNewsOutro),
          { news: true },
        ]);
        G.events.emit("radioNews", { text: items.join(" ") });
        const song = chooseSong(T.rfmSongs);
        lines.push(intro(song));
        return { kind: "talk", lines, then: { kind: "song", song } };
      }
      if (R.newsQueue.length) P.newsWait = (P.newsWait || 0) + 1;
      if (P.lastWasSong && Math.random() < 0.65) {
        P.lastWasSong = false;
        const lines = [];
        const o = outro();
        if (o && Math.random() < 0.65) lines.push(o);
        const r = Math.random(),
          story = storyLines();
        if (story.length && r < 0.35) lines.push([dj, "dj", pickFresh(story)]);
        else if (!amp && r < 0.6)
          lines.push([dj, "dj", pickFresh(okLines(T.djBanterWeak))]);
        else if (r < 0.7)
          lines.push([dj, "dj", pickFresh(okLines(T.djBanter))]);
        else if (r < 0.88) lines.push([dj, "dj", pickFresh(T.djPSA)]);
        const song = chooseSong(T.rfmSongs);
        lines.push(intro(song));
        return { kind: "talk", lines, then: { kind: "song", song } };
      }
      return { kind: "song", song: chooseSong(T.rfmSongs) };
    }
    const st = STATIONS.find((x) => x.id === id);
    if (st && st.signal) return { kind: "signal", station: st };
    if (id === "continuity") {
      if (!P.greeted || (P.sinceSpeech >= 2 && Math.random() < 0.8)) {
        P.greeted = true;
        P.sinceSpeech = 0;
        const speeches = S.radioStory
          ? S.radioStory.continuitySpeeches()
          : T.continuitySpeeches;
        return {
          kind: "talk",
          lines: [
            ["Announcer", "announcer", pick(T.continuityAnnouncer)],
            [
              "Acting President Marsh",
              "president",
              pickFresh(speeches) + " " + pick(T.continuitySignoff),
            ],
          ],
        };
      }
      P.sinceSpeech++;
      return { kind: "song", song: chooseSong(T.continuityMarches) };
    }
    if (id === "ebs") return { kind: "ebs" };
    if (id === "classical") {
      if (!P.greeted || (P.lastWasSong && Math.random() < 0.5)) {
        P.greeted = true;
        P.lastWasSong = false;
        const song = chooseSong(T.classicalPieces);
        const lines = [];
        if (prev)
          lines.push([
            "Classical NYC",
            "classical",
            fill(pick(T.classicalOutro), prev),
          ]);
        lines.push([
          "Classical NYC",
          "classical",
          fill(pick(T.classicalIntro), song),
        ]);
        return { kind: "talk", lines, then: { kind: "song", song } };
      }
      P.lastWasSong = true;
      return { kind: "song", song: chooseSong(T.classicalPieces) };
    }
    return null;
  }

  function startSong(song, midway) {
    const ctx = S.ctx;
    const gen = S.songs.make(song);
    // tuning in mid-record: join somewhere in the first half of the arrangement (on a bar line)
    const startBar = midway
      ? Math.floor(Math.random() * S.songs.lengthOf(gen) * 0.55)
      : 0;
    const cue = new S.Cue("radio:" + song.title, gen, {
      dest: R.chain.input,
      reverb: 0,
    });
    cue.out.gain.value = S.songs.gainFor(song);
    cue.start(ctx.currentTime + 0.15, startBar ? 1.2 : 0.3);
    if (startBar) cue.seek(startBar);
    R.cue = cue;
    const station = R.station;
    // sung records: lyric lines go to the captions as the singer reaches them
    gen.onLyric = (text, t, dur) => {
      if (R.cue === cue && R.station === station && S.subsLyric)
        S.subsLyric({
          station,
          speaker: song.artist,
          text,
          startIn: t - ctx.currentTime,
          dur,
        });
    };
    if (R.progress[station]) R.progress[station].lastWasSong = true;
    R.nowPlaying = {
      station,
      title: song.title,
      artist: song.artist,
      kind: "song",
      vocal: song.vocal || null,
    };
    G.events.emit("radioSong", {
      station,
      title: song.title,
      artist: song.artist,
      vocal: song.vocal || null,
    });
  }
  function runTalk(lines, then) {
    const station = R.station;
    const talk = (R.talk = { lines, i: 0, then, station });
    const next = () => {
      if (R.talk !== talk || !R.on || R.station !== station) return;
      R.busySince = G.time.real;
      if (talk.i >= lines.length) {
        R.talk = null;
        R.busy = false;
        R.nextAt = G.time.real + 0.6;
        if (then) R.pending = then;
        return;
      }
      const l = talk.lines[talk.i++];
      if (l[0] === "#mark") {
        try {
          if (S.radioStory) S.radioStory.mark(l[1], station);
        } catch (e) {
          /* */
        }
        next();
        return;
      }
      if (l[0] === "#sting") {
        // jingle through the station chain, then carry on
        const d = R.chain
          ? playSting(l[1], R.chain.input, S.ctx.currentTime + 0.05)
          : 0;
        setTimeout(next, d * 1000 + 120);
        return;
      }
      say(station, l[0], l[1], l[2], () => setTimeout(next, 450), l[3]);
    };
    R.busy = true;
    R.busySince = G.time.real;
    next();
  }
  function runItem(it, joinMidway) {
    if (!it) return;
    if (it.kind === "song") {
      const needs = ["piano", "bass", "drums", "guitar", "vibes", "pizz"];
      if (!S.inst.allReady(needs)) {
        needs.forEach(S.inst.ensure);
        R.pending = it;
        R.nextAt = G.time.real + 0.5;
        return;
      }
      startSong(it.song, !!joinMidway);
    } else if (it.kind === "talk") runTalk(it.lines, it.then);
    else if (it.kind === "signal") startSignal(it.station);
    else if (it.kind === "deadair") {
      // an open carrier: hiss, hum and the odd bump of a mic stand, forever
      const gen = new SignalGen("dead");
      const cue = new S.Cue("radio:dead:" + R.station, gen, {
        dest: R.chain.input,
        reverb: 0,
      });
      cue.out.gain.value = 1;
      cue.start(S.ctx.currentTime + 0.1, 0.3);
      R.cue = cue;
      R.nowPlaying = {
        station: R.station,
        title: "Dead air",
        artist: "",
        kind: "signal",
      };
    } else if (it.kind === "ebs") {
      const gen = new S.songs.EbsGen();
      const cue = new S.Cue("radio:ebs", gen, {
        dest: R.chain.input,
        reverb: 0,
      });
      cue.out.gain.value = S.songs.gainFor({ style: "ebs" });
      cue.start(S.ctx.currentTime + 0.1, 0.1);
      R.cue = cue;
      R.nowPlaying = {
        station: "ebs",
        title: "Emergency Broadcast",
        artist: "Office of Civil Defense",
        kind: "ebs",
      };
      R.ebsNext = G.time.real + 9;
    }
  }

  // ------------------------------------------------------------------
  // Range-limited signals: a looping program (beacon pips / interval chime +
  // Morse / dead air) with a voice message on a cycle.
  // ------------------------------------------------------------------
  const MORSE = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    0: "-----",
    1: ".----",
    2: "..---",
    3: "...--",
    4: "....-",
    5: ".....",
    6: "-....",
    7: "--...",
    8: "---..",
    9: "----.",
  };
  /** Text → [[on, units]] (dit = 1 unit, dah = 3, gaps 1 / 3 / 7). */
  function morseSeq(text) {
    const out = [];
    String(text || "")
      .toUpperCase()
      .split(" ")
      .forEach((word, wi) => {
        if (wi) out.push([false, 7]);
        word.split("").forEach((ch, ci) => {
          const code = MORSE[ch];
          if (!code) return;
          if (ci) out.push([false, 3]);
          code.split("").forEach((el, ei) => {
            if (ei) out.push([false, 1]);
            out.push([true, el === "." ? 1 : 3]);
          });
        });
      });
    return out;
  }
  function tone(out, f, t, d, g, type) {
    const ctx = S.ctx,
      o = ctx.createOscillator();
    o.type = type || "sine";
    o.frequency.value = f;
    const a = ctx.createGain();
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(g, t + 0.006);
    a.gain.setValueAtTime(g, t + Math.max(0.007, d - 0.008));
    a.gain.linearRampToValueAtTime(0, t + d);
    o.connect(a);
    a.connect(out);
    o.start(t);
    o.stop(t + d + 0.02);
  }
  /** Bar = 0.5 s. mode is driven by the radio: 'idle' | 'interval' (numbers-station chime) | 'morse'. */
  function SignalGen(kind, morse, pips) {
    this.kind = kind;
    this.pips = pips || null;
    this.mode = "idle";
    this.done = false;
    this.seq = morseSeq(morse);
    this.mi = 0;
    this.mt = 0;
    this.ci = 0;
  }
  SignalGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx;
    if (this.kind === "beacon" && bar % 8 === 0) {
      // locator pips under everything (Long Winter by default; a station may bring its own)
      if (this.pips)
        for (const p of this.pips) tone(out, p[0], t + p[1], p[2], 0.09);
      else {
        tone(out, 1320, t, 0.16, 0.09);
        tone(out, 990, t + 0.2, 0.22, 0.09);
      }
    }
    if (this.kind === "dead" && Math.random() < 0.02) {
      // someone bumps the mic stand
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(90, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.2);
      const a = ctx.createGain();
      a.gain.setValueAtTime(0.35, t);
      a.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(a);
      a.connect(out);
      o.start(t);
      o.stop(t + 0.3);
    }
    if (this.mode === "interval") {
      // a tinny music-box interval signal, the same eight notes forever
      const tune = [79, 76, 72, 74, 76, 72, 67, 72];
      const m = tune[this.ci++ % tune.length];
      tone(out, S.mtof(m), t, 0.42, 0.06, "triangle");
      tone(out, S.mtof(m + 12), t, 0.18, 0.02, "sine");
    } else if (this.mode === "morse") {
      const u = 0.075;
      if (this.mt < t) this.mt = t;
      while (this.mt < t + 0.5 && this.mi < this.seq.length) {
        const [on, n] = this.seq[this.mi++];
        if (on) tone(out, 760, this.mt, n * u, 0.08);
        this.mt += n * u;
      }
      if (this.mi >= this.seq.length) {
        this.mode = "idle";
        this.mi = 0;
        this.morseDone = true;
      }
    }
    return 0.5;
  };
  function startSignal(st) {
    const gen = new SignalGen(
      st.gen,
      T.signals[st.signal] && T.signals[st.signal].morse,
      st.pips,
    );
    const cue = new S.Cue("radio:" + st.id, gen, {
      dest: R.chain.input,
      reverb: 0,
    });
    cue.out.gain.value = 1;
    cue.start(S.ctx.currentTime + 0.1, 0.2);
    R.cue = cue;
    const txt = T.signals[st.signal] || {};
    R.nowPlaying = {
      station: st.id,
      title: st.name,
      artist: txt.speaker || "",
      kind: "signal",
    };
    R.sig = {
      st,
      gen,
      phase: st.gen === "numbers" ? "interval" : "voice",
      at: G.time.real + (st.gen === "numbers" ? 6 : 1.5),
      line: 0,
    };
    if (st.gen === "numbers") gen.mode = "interval";
  }
  /** Signal program cycle: interval chime → voice → Morse → pause (numbers), voice → pause (tapes). */
  function signalTick(hold) {
    const sg = R.sig;
    if (!sg || R.cue == null || R.cue.gen !== sg.gen) return;
    const now = G.time.real,
      txt = T.signals[sg.st.signal];
    if (!txt || R.speaking || hold) return;
    if (sg.phase === "morse") {
      if (sg.gen.morseDone) {
        sg.gen.morseDone = false;
        sg.phase = "gap";
        sg.at = now + 4;
      }
      return;
    }
    if (now < sg.at) return;
    if (sg.phase === "interval" || sg.phase === "voice") {
      sg.gen.mode = "idle";
      const line = txt.lines[sg.line++ % txt.lines.length];
      sg.phase = "speaking";
      say(sg.st.id, txt.speaker, txt.profile, line, () => {
        if (R.sig !== sg) return;
        if (sg.st.gen === "numbers") {
          sg.phase = "morse";
          sg.gen.mode = "morse";
        } else {
          sg.phase = "gap";
          sg.at = G.time.real + (sg.st.gen === "beacon" ? 7 : 9);
        }
      });
    } else if (sg.phase === "gap") {
      if (sg.st.gen === "numbers") {
        sg.phase = "interval";
        sg.gen.mode = "interval";
        sg.at = now + 8;
      } else sg.phase = "voice";
    } else if (sg.phase === "speaking" && !R.speaking) {
      sg.phase = "gap";
      sg.at = now + 3;
    } // interrupted line
  }
  function sigDist(st) {
    const p = G.player && G.player.pos;
    if (!p || !G.LAYOUT) return Infinity;
    if (G.LAYOUT.isInterior && G.LAYOUT.isInterior(p.x)) return Infinity;
    return Math.hypot(p.x - st.src.x, p.z - st.src.z);
  }
  /** Is a range-limited station on the dial right now? (a tuned one keeps a little hysteresis) */
  function sigAvailable(st, tuned) {
    if (st.live && !st.live()) return false;
    if (!st.signal) return true;
    return sigDist(st) < st.range + (tuned ? 45 : 0);
  }
  /** Poll (1×/s): signals entering/leaving range; lose a tuned signal when walking out of range. */
  function rangeTick() {
    const ids = [];
    for (const st of STATIONS)
      if (
        (st.signal || st.live) &&
        sigAvailable(st, R.on && R.station === st.id)
      )
        ids.push(st.id);
    const changed = ids.join() !== R.inRange.join();
    const fresh = ids.filter((id) => !R.inRange.includes(id));
    R.inRange = ids;
    if (changed) G.events.emit("radioStationsChanged", ids.slice());
    for (const id of fresh) {
      const st = STATIONS.find((x) => x.id === id);
      if (!R.flags["heard_" + id] && G.state !== "title") {
        R.flags["heard_" + id] = true;
        try {
          G.notify("New radio signal: " + st.name);
        } catch (e) {
          /* */
        }
      }
    }
    if (
      R.on &&
      R.station &&
      (R.station.startsWith("sig_") || R.station === "dawn") &&
      !ids.includes(R.station)
    ) {
      const was = R.station;
      tune(null);
      try {
        G.notify(
          was === "dawn" ? "The Dawn Hour has signed off." : "Signal lost.",
        );
      } catch (e) {
        /* */
      }
    }
  }

  // ------------------------------------------------------------------
  // Signal strength & update
  // ------------------------------------------------------------------
  function signalStatic() {
    const p = G.player && G.player.pos;
    if (!p || !G.LAYOUT) return 0;
    const inside = G.LAYOUT.isInterior(p.x);
    const deep =
      inside &&
      S.music &&
      S.music.nearestInterior &&
      !S.isStartLab(S.music.nearestInterior(p));
    const st = STATIONS.find((x) => x.id === R.station);
    if (st && st.signal) {
      const d = sigDist(st);
      return d === Infinity
        ? 0.9
        : 0.08 + S.clamp((d - st.range * 0.35) / (st.range * 0.65), 0, 1) * 0.6;
    }
    switch (R.station) {
      case "rfm": {
        const d = inside ? 900 : Math.hypot(p.x - 0, p.z + 342);
        // before MQ03 the transmitter barely clears Midtown; with the amplifier it covers the island
        if (!ampOn())
          return 0.2 + S.clamp((d - 250) / 1300, 0, 0.42) + (deep ? 0.25 : 0);
        return S.clamp((d - 900) / 2400, 0, 0.32) + (deep ? 0.2 : 0);
      }
      case "continuity":
        return deep ? 0.3 : 0;
      case "classical":
        return 0.05 + (deep ? 0.25 : 0);
      case "ebs":
        return inside ? 0 : 0.1;
      default:
        return 0;
    }
  }
  let sigT = 0;
  R.update = function (realDt) {
    R.poll(realDt);
    const ctx = S.ctx;
    if (!ctx || !R.on || ctx.state !== "running") return;
    const now = ctx.currentTime;
    if (R.cue) {
      R.cue.tick(now, now + 1.2);
      if (R.cue.stopped) {
        if (R.cue.gen.done) {
          R.nextAt = G.time.real + 1.2;
        }
        R.cue = null;
      }
    }
    // talk is held while the game is paused / in dialogue (records keep spinning, ducked)
    const hold = R.paused || G.state === "dialogue" || G.state === "paused";
    // watchdog: a talk segment that stopped making progress (lost callbacks) never blocks the station
    if (R.busy && !R.speaking && G.time.real - R.busySince > 6) {
      R.talk = null;
      R.busy = false;
      R.nextAt = G.time.real + 0.5;
    }
    if (R.sig && R.station === R.sig.st.id) signalTick(hold);
    // weak Radio Free Manhattan: the signal fades and drops out under bursts of static
    if (R.station === "rfm" && R.chain && !ampOn() && !(R.speaking && R.vox)) {
      // (during VOX speech the dropouts follow the lost words)
      R.dropT -= realDt;
      if (R.dropT <= 0) {
        R.dropping = !R.dropping;
        if (R.dropping) {
          R.chain.setStatic(
            Math.min(0.95, R.lastStatic + 0.35 + Math.random() * 0.3),
            0.05,
          );
          R.dropT = 0.15 + Math.random() * 0.6;
        } else {
          R.chain.setStatic(R.lastStatic, 0.15);
          R.dropT = 1.5 + Math.random() * 5;
        }
      }
    } else if (R.dropping) {
      R.dropping = false;
      if (R.chain) R.chain.setStatic(R.lastStatic);
    }
    // EBS voice message every cycle
    if (
      R.station === "ebs" &&
      R.ebsNext &&
      G.time.real > R.ebsNext &&
      !R.speaking &&
      !hold
    ) {
      R.ebsNext = G.time.real + 40;
      say("ebs", T.ebsSpeaker, "ebs", pick(T.ebs));
    }
    if (!R.cue && !R.busy && !R.speaking && G.time.real >= R.nextAt) {
      const peek = R.pending || null;
      if (!(hold && (!peek || peek.kind === "talk"))) {
        const it = peek || nextItem(R.station);
        R.pending = null;
        if (hold && it && it.kind === "talk")
          R.pending = it; // generated a talk item while held: keep it for later
        else runItem(it, !!(it && it.midway));
      }
    }
    sigT -= realDt;
    if (sigT <= 0 && R.chain) {
      sigT = 1;
      R.lastStatic = signalStatic();
      if (!R.dropping) R.chain.setStatic(R.lastStatic);
    }
  };
  let rangeT = 0;
  /** Runs even with the radio off (signals appear on the dial as you approach them). */
  R.poll = function (realDt) {
    rangeT -= realDt;
    if (rangeT > 0) return;
    rangeT = 1;
    if (G.state === "title" || !G.player) return;
    try {
      if (S.radioStory) S.radioStory.tick();
    } catch (e) {
      G.reportError("sound:radioStory", e);
    }
    try {
      rangeTick();
    } catch (e) {
      G.reportError("sound:radioRange", e);
    }
  };

  // ------------------------------------------------------------------
  // World radios: G.radio.tune(id, {pos}) plays the station from a radio set in the world (small-speaker
  // tone, positional, in the room's reverb) instead of the goggles. Tuning without pos returns to the goggles.
  // ------------------------------------------------------------------
  function makeEmitter(pos) {
    const ctx = S.ctx;
    const input = ctx.createGain();
    input.gain.value = 1.4;
    const box = ctx.createBiquadFilter();
    box.type = "peaking";
    box.frequency.value = 900;
    box.Q.value = 1.1;
    box.gain.value = 5; // cabinet honk
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 4200;
    const pan = ctx.createPanner();
    pan.panningModel = "equalpower";
    pan.distanceModel = "inverse";
    pan.refDistance = 2.5;
    pan.rolloffFactor = 1.3;
    pan.maxDistance = 10000;
    S.setPannerPos(pan, pos);
    const send = ctx.createGain();
    send.gain.value = Math.max(0.15, S.env.wet * 1.6);
    input.connect(box);
    box.connect(lp);
    lp.connect(pan);
    pan.connect(S.bus.world);
    pan.connect(send);
    send.connect(S.bus.revSend);
    return {
      pos,
      input,
      gainAt() {
        const L = S.listenerPos,
          d = Math.hypot(pos.x - L.x, (pos.y || 0) - L.y, pos.z - L.z);
        return 2.5 / (2.5 + 1.3 * Math.max(0, d - 2.5));
      },
      dispose() {
        try {
          pan.disconnect();
          send.disconnect();
        } catch (e) {
          /* */
        }
      },
    };
  }
  function ensureChain(st) {
    if (R.chain) {
      R.chain.dispose();
      R.chain = null;
    }
    R.chain = S.inst.radioChain(
      S.ctx,
      R.emitter ? R.emitter.input : S.bus.radioDuck,
      st.chain,
    );
  }
  function tune(id, opts) {
    const ctx = S.ctx;
    if (id && !STATIONS.find((s) => s.id === id)) {
      S.warnOnce("station:" + id, "unknown radio station " + id);
      return;
    }
    if (
      id &&
      !sigAvailable(
        STATIONS.find((s) => s.id === id),
        false,
      )
    ) {
      S.warnOnce(
        "station-range:" + id,
        "radio station " + id + " is out of range",
      );
      return;
    }
    const pos =
      id && opts && opts.pos
        ? { x: opts.pos.x, y: opts.pos.y || 0, z: opts.pos.z }
        : null;
    const samePlace =
      (!pos && !R.emitter) ||
      (pos &&
        R.emitter &&
        Math.hypot(pos.x - R.emitter.pos.x, pos.z - R.emitter.pos.z) < 0.5);
    if ((id || null) === (R.on ? R.station : null) && samePlace) return;
    const prevPos = R.emitter ? R.emitter.pos : null;
    if (R.emitter) {
      const e = R.emitter;
      R.emitter = null;
      setTimeout(() => e.dispose(), 500);
    }
    if (pos && ctx && S.bus) R.emitter = makeEmitter(pos);
    if (id) R.lastStation = id;
    cancelSpeech();
    if (R.cue) {
      R.cue.stop(0.25);
      R.cue = null;
    }
    R.busy = false;
    R.pending = null;
    R.talk = null;
    R.sig = null;
    R.dropping = false;
    if (!id) {
      R.on = false;
      R.station = null;
      R.nowPlaying = null;
      if (R.chain) {
        const c = R.chain;
        R.chain = null;
        setTimeout(() => c.dispose(), 400);
      }
      if (ctx)
        S.play(
          prevPos ? "ui_click" : "goggles_tab",
          prevPos
            ? { volume: 1.2, pos: prevPos, bus: "world" }
            : { volume: 0.6 },
        );
    } else {
      R.on = true;
      R.station = id;
      R.nowPlaying = null;
      if (ctx && S.bus) {
        ensureChain(STATIONS.find((s) => s.id === id));
        S.play(
          "radio_tune",
          R.emitter ? { pos: R.emitter.pos, bus: "world" } : undefined,
        );
        S.inst.ensureAll();
      }
      R.nextAt = G.time.real + 0.8;
      const st = STATIONS.find((s) => s.id === id);
      if (st.signal) {
        // first tune-in: the source goes on the map, and quests can hook the discovery
        if (!R.flags["found_" + id]) {
          R.flags["found_" + id] = true;
          try {
            if (st.loc && G.discover) G.discover(st.loc);
          } catch (e) {
            /* */
          }
          G.events.emit("radioSignalFound", {
            id,
            name: st.name,
            location: st.loc,
            x: st.src.x,
            z: st.src.z,
          });
        }
      } else {
        // join a record in progress when tuning in (like a real station), except the very first greeting
        const P = R.progress[id];
        if (P.greeted && id !== "ebs" && !st.story && Math.random() < 0.7)
          R.pending = {
            kind: "song",
            song: chooseSong(
              id === "rfm"
                ? T.rfmSongs
                : id === "continuity"
                  ? T.continuityMarches
                  : T.classicalPieces,
            ),
            midway: true,
          };
      }
    }
    G.events.emit("radioChanged", R.on ? id : null);
  }

  // ------------------------------------------------------------------
  // Reactive news
  // ------------------------------------------------------------------
  const warnedWords = new Set();
  /** Coverage check: words VOX has to guess from spelling (add them to S.voxLexicon). Warned once per word. */
  function checkWords(text, where) {
    if (!S.vox || !S.vox.unknownWords) return [];
    const miss = S.vox
      .unknownWords(S.vox.stripMarks(text))
      .filter((w) => !warnedWords.has(w));
    if (miss.length) {
      miss.forEach((w) => warnedWords.add(w));
      console.warn(
        "[sound] VOX lexicon: " +
          where +
          " uses words spoken from spelling rules (add to S.voxLexicon): " +
          miss.slice(0, 20).join(", "),
      );
    }
    return miss;
  }
  S.voxCoverage = checkWords;
  function addNews(text, key) {
    if (key) {
      if (R.flags[key]) return;
      R.flags[key] = true;
    }
    checkWords(fill(text), "news");
    R.newsQueue.push(fill(text));
    if (R.newsQueue.length > 6) R.newsQueue.shift();
  }
  G.events.on("doorTransition", (def) => {
    try {
      if (
        def &&
        def.target &&
        !G.LAYOUT.isInterior(def.target.x) &&
        G.player &&
        !R.flags.sleeperOut
      )
        addNews(pick(T.news.sleeperOut), "sleeperOut");
    } catch (e) {
      /* */
    }
  });
  G.events.on("locationDiscovered", (l) => {
    if (!l) return;
    if (!S.isStartLab(l.id) && !R.flags.sleeperOut)
      addNews(pick(T.news.sleeperOut), "sleeperOut");
    if (questsLive()) return; // the quests module writes the DJ's location news itself
    if (l.id === "empire_state") addNews(pick(T.news.empire), "n_empire");
    if (l.id === "liberty") addNews(pick(T.news.liberty), "n_liberty");
    if (l.id === "brooklyn_bridge") addNews(pick(T.news.bridge), "n_bridge");
  });
  // MQ03: the Signal Amplifier reaches Radio City → Radio Free Manhattan comes in loud and clear
  G.events.on("questCompleted", (q) => {
    const id = q && (q.id || q);
    if (id !== "mq03" || R.flags.amp) return;
    R.flags.amp = true;
    if (R.on && R.station === "rfm" && R.chain) {
      R.dropping = false;
      R.lastStatic = signalStatic();
      R.chain.setStatic(R.lastStatic, 0.6);
    }
  });
  G.events.on("standingChanged", (k) => {
    if (typeof k !== "number") return;
    if (k >= 250) addNews(pick(T.news.standingGood), "k_good");
    if (k >= 750) addNews(pick(T.news.standingVeryGood), "k_vgood");
    if (k <= -250) addNews(pick(T.news.standingBad), "k_bad");
    if (k <= -750) addNews(pick(T.news.standingVeryBad), "k_vbad");
  });
  G.events.on("actorKilled", (actor, killer) => {
    if (
      !actor ||
      !(
        killer === "player" ||
        killer === G.player ||
        (killer && killer.isPlayer)
      )
    )
      return;
    const cat = actor.faction === "raiders" ? "raider" : S.kindOf(actor.type);
    if (!cat) return;
    R.kills[cat] = (R.kills[cat] || 0) + 1;
    if (cat === "ripjaw") addNews(pick(T.news.ripjaw), "n_ripjaw");
    if (cat === "brute" && R.kills[cat] >= 10)
      addNews(pick(T.news.killsBrutes), "n_brute");
    if (cat === "raider" && R.kills[cat] >= 10)
      addNews(pick(T.news.killsRaiders), "n_raid");
    if (cat === "maniac" && R.kills[cat] >= 15)
      addNews(pick(T.news.killsManiacs), "n_maniac");
  });
  // Dialogue & pause: interrupt the DJ (the segment replays afterwards), duck the record.
  function holdRadio(level) {
    R.paused = true;
    if (R.speaking || R.busy) cancelSpeech(true);
    if (S.bus) S.ramp(S.bus.radioDuck.gain, level, 0.3);
  }
  function releaseRadio() {
    if (!R.paused) return;
    R.paused = false;
    R.nextAt = Math.max(R.nextAt, G.time.real + 0.8);
    if (S.bus) S.ramp(S.bus.radioDuck.gain, 1, 0.8);
  }
  G.events.on("dialogueStart", () => holdRadio(0.3));
  G.events.on("dialogueEnd", () => {
    if (G.state !== "paused") releaseRadio();
  });
  G.events.on("state", (s, prev) => {
    if (s === "title" || s === "dead") {
      if (R.on) tune(null);
      R.paused = false;
      return;
    }
    if (s === "paused") holdRadio(0.45);
    else if (s === "dialogue") holdRadio(0.3);
    else if (prev === "paused" || prev === "dialogue") releaseRadio();
  });
  G.events.on("reset", () => {
    if (R.on) tune(null);
    R.newsQueue = [];
    R.flags = {};
    R.kills = {};
    R.recent = [];
    R.inRange = [];
    for (const k in R.progress)
      R.progress[k] = {
        count: 0,
        sinceTalk: 0,
        greeted: false,
        sinceSpeech: 0,
      };
  });

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  G.radio = {
    /** Stations on the dial right now (range-limited signals only near their source). */
    stations() {
      return STATIONS.filter((s) =>
        sigAvailable(s, R.on && R.station === s.id),
      ).map((s) => ({ id: s.id, name: s.name, freq: s.freq }));
    },
    /** Every station, including signals out of range: [{id, name, freq, signal, x, z, range}]. */
    allStations() {
      return STATIONS.map((s) => ({
        id: s.id,
        name: s.name,
        freq: s.freq,
        signal: !!s.signal,
        x: s.src ? s.src.x : null,
        z: s.src ? s.src.z : null,
        range: s.range || null,
      }));
    },
    /** Has Radio Free Manhattan got its amplifier (loud & clear)? */
    amplified() {
      return ampOn();
    },
    /** Tune the goggles (or, with {pos}, a radio set in the world) to a station; null switches off. */
    tune(id, opts) {
      tune(id || null, opts);
    },
    /** World position of the radio set playing the station, or null for the goggles. */
    emitter() {
      return R.emitter ? Object.assign({}, R.emitter.pos) : null;
    },
    current() {
      return R.on ? R.station : null;
    },
    isOn() {
      return R.on;
    },
    /** Queue a news bulletin for Radio Free Manhattan (read by the DJ between records). */
    addNews(text) {
      if (text) addNews(String(text));
    },
    /** Show sung lyrics in the radio captions (default on; they follow the subtitle setting). */
    setLyrics(on) {
      if (S.setLyrics) S.setLyrics(on);
    },
    lyrics() {
      return S.lyrics ? S.lyrics() : false;
    },
    /**
     * How much of the vocal records is sung (persisted; applies from the next record): 'full' (default: the whole
     * head and out-chorus), 'hooks' (the band plays the melody, the singer comes in for the last A and the
     * out-chorus — short sung hooks) or 'off' (instrumental takes; girl groups keep their wordless ooh/aah choir).
     */
    setVocals(m) {
      if (S.setVocalMode) S.setVocalMode(m);
    },
    vocals() {
      return S.vocalMode || "full";
    },
    /** {station, title, artist, kind} of what's playing, or null. */
    nowPlaying() {
      if (!R.on) return null;
      if (
        (R.speaking || R.talk) &&
        R.lastText &&
        R.lastText.station === R.station
      )
        return {
          station: R.station,
          kind: "talk",
          speaker: R.lastText.speaker,
          text: R.lastText.text,
        };
      return (
        R.nowPlaying || {
          station: R.station,
          kind: "tuning",
          title: "",
          artist: "",
        }
      );
    },
    /** Last spoken line (for subtitles): {station, speaker, text, t}. */
    lastText() {
      return R.lastText;
    },
    next() {
      if (!R.on) return;
      if (R.cue) R.cue.stop(0.4);
      R.cue = null;
      cancelSpeech(false);
      R.busy = false;
      R.nextAt = G.time.real + 0.3;
    },
    toggle() {
      tune(R.on ? null : R.lastStation || "rfm");
    },
    get djName() {
      return T.djName;
    },
    set djName(v) {
      if (v) T.djName = String(v);
    },
    /**
     * 'radio' (default: procedural period voice through the AM chain + subtitles), 'tts' (OS speechSynthesis voice)
     * or 'subtitles' (silent, subtitles only). Persisted. A line in progress finishes in the old mode.
     */
    setVoiceMode(m) {
      if (!MODES.includes(m) || m === R.voiceMode) return;
      R.voiceMode = m;
      S.lsSet("radio_voice3", m);
      if (m !== "tts") {
        try {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        } catch (e) {
          /* */
        }
      }
      if (m !== "radio") stopVox(0.1);
    },
    voiceMode() {
      return R.voiceMode;
    },
    /** Built-in radio captions (bottom centre, only while the radio is audible). A HUD with its own captions sets false. */
    setSubtitles(on) {
      if (S.setSubtitles) S.setSubtitles(on);
    },
    subtitles() {
      return S.subtitles ? S.subtitles() : false;
    },
    /** Names of the speechSynthesis voices picked for each on-air profile (diagnostics / settings UI). */
    voices() {
      const o = {};
      for (const k in VOICE_PROFILES) {
        const v = voiceFor(k);
        o[k] = v ? v.name : null;
      }
      return o;
    },
    /** Current output level of the radio (0..1 RMS-ish) — drive the goggle oscilloscope with it. */
    level() {
      return S.radioLevel ? S.radioLevel() : 0;
    },
    /** Fill `arr` (Float32Array/Uint8Array) with the live radio waveform (−1..1 / 0..255). Returns false when unavailable. */
    waveform(arr) {
      return S.radioWave ? S.radioWave(arr) : false;
    },
    /** Current signal quality 0..1 (1 = crystal clear). */
    signal() {
      return R.on ? S.clamp(1 - (R.lastStatic || 0) * 1.6, 0, 1) : 0;
    },
  };

  // smoke runs: every on-air text + location name must be in the VOX lexicon (warnings list the gaps)
  if (G.SMOKE)
    setTimeout(() => {
      try {
        const all = [],
          locs = [];
        const walk = (o) => {
          if (typeof o === "string") all.push(o.replace(/\{[a-zA-Z]+\}/g, " "));
          else if (Array.isArray(o)) o.forEach(walk);
          else if (o && typeof o === "object") Object.values(o).forEach(walk);
        };
        walk(T);
        // the station's own scripts are a hard gate (console.error → smoke fails): a new line with a word VOX can
        // only spell out must bring its lexicon entry along
        const miss =
          S.vox && S.vox.unknownWords
            ? S.vox.unknownWords(S.vox.stripMarks(all.join(". ")))
            : [];
        if (miss.length) {
          miss.forEach((w) => warnedWords.add(w));
          console.error(
            "[sound] VOX lexicon gate: radio scripts use words missing from S.voxLexicon: " +
              miss.slice(0, 30).join(", "),
          );
        }
        // other modules' text (location names; quest news is checked as it arrives) → warnings
        ((G.LAYOUT && G.LAYOUT.LOCATIONS) || []).forEach((l) => {
          if (l && l.name) locs.push(l.name);
        });
        checkWords(locs.join(". "), "location names");
      } catch (e) {
        G.reportError("sound:voxCoverage", e);
      }
    }, 0);
  // internals for the headless test harness
  Object.assign(R, {
    _nextItem: nextItem,
    _storyLines: storyLines,
    _ampOn: ampOn,
    _garble: (t) => garbleSync(t).text,
    _garbleFull: garbleSync,
    _stations: STATIONS,
    _tune: tune,
    _cancel: cancelSpeech,
    _addNews: addNews,
    _fill: fill,
    _qFlag: qFlag,
    _qDone: qDone,
    _qActive: qActive,
    _questsLive: questsLive,
  });
  S.radioSave = () => ({
    flags: R.flags,
    kills: R.kills,
    news: R.newsQueue.slice(0, 4),
    station: R.on ? R.station : null,
    at: R.emitter ? R.emitter.pos : null,
  });
  S.radioLoad = (d) => {
    if (!d) return;
    R.flags = d.flags || {};
    R.kills = d.kills || {};
    R.newsQueue = d.news || [];
    if (d.station)
      setTimeout(() => tune(d.station, d.at ? { pos: d.at } : null), 500);
  };
  /** How loud the radio is for the player right now (1 = goggles; a distant world radio → ~0). */
  S.radioPresence = () => (!R.on ? 0 : R.emitter ? R.emitter.gainAt() : 1);
})();
