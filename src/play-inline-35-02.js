// play-inline-35 02 — the
// Lines 364-707 of readable/play-inline-35.pretty.js (statement-aligned).
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
