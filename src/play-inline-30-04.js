// play-inline-30 04 — cue
// Lines 965-1101 of readable/play-inline-30.pretty.js (statement-aligned).
  M.update = function (realDt) {
    const ctx = S.ctx;
    if (!ctx || !S.bus) return;
    if (ctx.state !== "running") return;
    const now = ctx.currentTime;
    // scheduling
    if (M.cue) M.cue.tick(now, now + 1.2);
    tickAcc += realDt;
    if (tickAcc < 0.5) return;
    tickAcc = 0;
    // mood logic. Overrides: play() holds until the game switches between menu and world (or stop()/newGame);
    // setMood() is a *hint* that lasts until the automatically detected mood changes (or 4 minutes pass).
    const auto = G.time.real < M.suppressUntil ? "none" : detectMood();
    if (M.forced) {
      if (M.forcedHard) {
        if (stateCat() !== M.forcedCat) M.forced = null;
      } else if (auto !== M.forcedAuto || G.time.real > M.forcedUntil)
        M.forced = null;
    }
    // combat always pre-empts a forced track (except the title theme and the ending); the forced track
    // comes back after the fight (combat_end stinger, a short rest, then the forced cue restarts)
    const combatOverride =
      auto === "combat" &&
      M.forced &&
      M.forced !== "title" &&
      M.forced !== "ending";
    const want = combatOverride ? "combat" : M.forced || auto;
    const have = M.cue ? M.cue.id : "none";
    if (want !== M.mood) {
      const prev = M.mood;
      M.mood = want;
      if (prev === "combat" && want !== "combat") {
        M.stinger("combat_end");
        stopCurrent(3);
        M.restUntil = G.time.real + 6 + Math.random() * 8;
      } else if (want === "combat") {
        M.stinger("combat_start");
        stopCurrent(1.2);
        startTrack("combat", 0.4);
      } else if (want === "none") stopCurrent(prev === "title" ? 2.5 : 3);
      else {
        stopCurrent(prev === "title" ? 2 : 4);
        M.restUntil =
          G.time.real + (prev === "title" ? 4 : want === "explore" ? 3 : 1);
      }
    }
    // a cue that ended by itself leaves a stretch of silence before the next one
    if (M.cue && M.cue.stopped) {
      if (M.cue.gen.done) M.restUntil = G.time.real + restFor(want);
      M.cue = null;
    }
    if (!M.cue && want !== "none" && G.time.real >= M.restUntil) {
      if (NEEDS[want] && !I.allReady(NEEDS[want])) {
        NEEDS[want].forEach(I.ensure);
        return;
      }
      startTrack(want, want === "explore" ? 6 : want === "combat" ? 0.4 : 2.5);
    }
    void have;
    applyLevels(false);
  };
  M.combatActivity = function () {
    M.lastCombatActivity = G.time.real;
  };

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  const TRACKS = [
    "title",
    "explore",
    "combat",
    "cryo",
    "settlement",
    "danger",
    "ending",
  ];
  G.music = {
    /** Force a track: 'title'|'explore'|'combat'|'cryo'|'settlement'|'danger'|'ending'. */
    play(trackId) {
      if (!TRACKS.includes(trackId)) {
        S.warnOnce("mtrack:" + trackId, "unknown music track " + trackId);
        return;
      }
      M.forced = trackId;
      M.forcedHard = true;
      M.forcedCat = stateCat();
      M.restUntil = 0;
      M.suppressUntil = 0;
      if (M.mood === "combat" && trackId !== "title" && trackId !== "ending")
        return; // takes over after the fight
      if (M.cue && M.cue.id !== trackId) stopCurrent(2);
      M.mood = trackId;
      if (!M.cue || M.cue.stopped) {
        M.cue = null;
        if (S.ctx && S.ctx.state === "running") startTrack(trackId, 2);
      }
    },
    /** Stop the music (automatic music resumes after a short while). */
    stop() {
      M.clearForced();
      stopCurrent(2.5);
      M.suppressUntil = G.time.real + 20;
      M.mood = "none";
    },
    /** 'explore'|'combat'|'cryo'|'settlement'|'title'|'danger' forces a mood; 'auto'/null returns to automatic. */
    setMood(m) {
      if (!m || m === "auto") {
        M.clearForced();
        return;
      }
      if (!TRACKS.includes(m)) return;
      if (M.forcedHard && M.forced === m) return;
      M.forced = m;
      M.forcedHard = false;
      M.forcedAuto = detectMood();
      M.forcedUntil = G.time.real + 240;
      if (m !== M.mood) M.restUntil = 0;
    },
    mood() {
      return M.mood;
    },
    current() {
      return {
        track: M.cue ? M.cue.id : null,
        mood: M.mood,
        forced: M.forced,
        inCombat: M.inCombat,
      };
    },
    stinger(name) {
      M.stinger(name);
    },
    tracks() {
      return TRACKS.slice();
    },
  };
