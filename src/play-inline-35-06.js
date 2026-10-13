// play-inline-35 06 — the
// Lines 1733-2076 of readable/play-inline-35.pretty.js (statement-aligned).
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
