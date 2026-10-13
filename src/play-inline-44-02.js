// play-inline-44 02 — events
// Lines 350-604 of readable/play-inline-44.pretty.js (statement-aligned).
  [
    ["explosion", 24000],
    ["ripjaw_roar", 24000],
    ["brute_roar", 24000],
    ["moan", 16000],
    ["door_open", 24000],
    ["debris", 24000],
    ["maniac_idle", 24000],
    ["maniac_scream", 24000],
    ["death_human", 24000],
    ["hurt_human", 24000],
    ["brute_death", 24000],
    ["dog_bark", 24000],
    ["crow", 24000],
    ["howl", 16000],
    ["robot_death", 24000],
    ["discover_location", 24000],
    ["quest_start", 24000],
    ["quest_complete", 24000],
    ["levelup", 24000],
    ["low_health", 22050],
    ["amb_whistle", 16000],
    ["amb_wind", 16000],
    ["wind_gust", 16000],
    ["creak", 16000],
    ["siren_distant", 16000],
    ["thunder", 16000],
    ["cryo_door", 24000],
  ].forEach((p) => {
    const n = S.resolve(p[0]);
    if (S.R[n] && S.R[n].sr > p[1]) S.R[n].sr = p[1];
  });
  // common world sounds bake before the background pre-bake reaches the memory budget
  [
    "door_close",
    "door_metal",
    "fire_loop",
    "hum_electric",
    "low_health",
    "death_player",
    "splash",
  ].forEach((n) => {
    if (S.R[n]) S.R[n].priority = Math.min(S.R[n].priority, 2);
  });
  // equipping a weapon pre-bakes its report & reload
  G.events.on("weaponEquipped", () => {
    try {
      const w =
        !G.isStub("weapons") && G.weapons.current && G.weapons.current();
      const d = w && (w.def || w.weapon);
      if (d && d.sound) {
        S.hintBake(d.sound, 0);
        // the equipped weapon's report is never evicted from memory
        S.pinned.clear();
        S.pinned.add(S.resolve(d.sound));
      }
      if (
        d &&
        /mortar|nuke/i.test((d.name || "") + (d.id || "") + (w.id || ""))
      )
        S.hintBake("explosion_nuke", 1);
      if (
        d &&
        /missile|rocket/i.test((d.name || "") + (d.id || "") + (w.id || ""))
      )
        S.hintBake("explosion", 1);
    } catch (e) {
      /* weapons still a stub */
    }
  });

  // ------------------------------------------------------------------
  // Event wiring (automatic behaviour)
  // ------------------------------------------------------------------
  const M = () => S.music;
  G.events.on("combatStart", () => {
    M().inCombat = true;
    M().combatActivity();
  });
  G.events.on("combatEnd", () => {
    M().inCombat = false;
  });
  ["weaponFired", "actorDamaged", "playerDamaged"].forEach((ev) =>
    G.events.on(ev, () => {
      if (M().inCombat) M().combatActivity();
    }),
  );
  G.events.on("playerDied", () => {
    M().stinger("death");
    G.music.stop();
    M().inCombat = false;
  });

  // Pause menu: the frozen world falls silent (world sfx, loops and reverb tails fade out, sounds scheduled for
  // later — burst fire, distant firefights — are cancelled, ambience drops to a faint bed); the score keeps playing
  // and the radio is held/ducked (50_radio.js).
  function worldDuck(level, ambK, tau) {
    if (!S.ctx || !S.bus) return;
    const t = S.ctx.currentTime;
    S.bus.world.gain.setTargetAtTime(level, t, tau);
    S.bus.revSend.gain.setTargetAtTime(level, t, tau);
    S.bus.amb.gain.setTargetAtTime(S.vol.ambience * ambK, t, tau);
  }
  function cancelScheduled() {
    if (!S.ctx) return;
    const now = S.ctx.currentTime;
    S.voices.slice().forEach((v) => {
      if (!v.loop && v.t0 > now + 0.01) v.stop(0);
    });
  }
  G.events.on("state", (s, prev) => {
    if (s === "paused" && prev !== "paused") {
      S.paused = true;
      cancelScheduled();
      worldDuck(0, 0.12, 0.08);
    } else if (prev === "paused" && s !== "paused") {
      S.paused = false;
      worldDuck(1, 1, 0.2);
    }
    if (s === "goggles" && prev !== "goggles") G.sfx.play("goggles_open");
    if (prev === "goggles" && s !== "goggles") G.sfx.play("goggles_close");
    if (s === "title") {
      M().inCombat = false;
    }
  });
  G.events.on("levelUp", () => G.sfx.play("levelup"));
  G.events.on("questStarted", () => G.sfx.play("quest_start"));
  G.events.on("questCompleted", () => G.sfx.play("quest_complete"));
  G.events.on("questUpdated", () => G.sfx.play("quest_update"));
  G.events.on("questFailed", () => G.sfx.play("standing_down"));
  G.events.on("xpGained", () => G.sfx.play("xp_gain", { volume: 0.8 }));
  G.events.on("locationDiscovered", (l) => {
    if (l && !S.isStartLab(l.id)) G.sfx.play("discover_location");
  });
  let lastStanding = null;
  G.events.on("standingChanged", (k) => {
    if (typeof k !== "number") return;
    if (lastStanding !== null && Math.abs(k - lastStanding) >= 5)
      G.sfx.play(k > lastStanding ? "standing_up" : "standing_down");
    lastStanding = k;
  });
  G.events.on("reset", () => {
    lastStanding = null;
    M().inCombat = false;
    S.voices.slice().forEach((v) => {
      if (!v.loop) v.stop(0.05);
    });
  });
  G.events.on("newGame", () => {
    M().restUntil = 0;
    M().suppressUntil = 0;
    M().clearForced();
  });
  G.events.on("loaded", () => {
    M().clearForced();
    M().suppressUntil = 0;
    M().inCombat = false;
  });

  // ------------------------------------------------------------------
  // Save / load (radio state + news flags; volumes live in localStorage)
  // ------------------------------------------------------------------
  G.save.register("sound", {
    save: () => ({ radio: S.radioSave ? S.radioSave() : null }),
    load: (d) => {
      if (d && S.radioLoad) S.radioLoad(d.radio);
    },
  });

  // ------------------------------------------------------------------
  // Module
  // ------------------------------------------------------------------
  let lastUpdate = 0,
    loopT = 0;
  function tickSchedulers(realDt) {
    try {
      S.music.update(realDt);
    } catch (e) {
      G.reportError("update:sound:music", e);
    }
    try {
      S.radio.update(realDt);
    } catch (e) {
      G.reportError("update:sound:radio", e);
    }
    try {
      if (S.skyeye) S.skyeye.update(realDt);
    } catch (e) {
      G.reportError("update:sound:skyeye", e);
    }
    try {
      if (S.story && S.story.update) S.story.update(realDt);
    } catch (e) {
      G.reportError("update:sound:story", e);
    }
  }
  G.registerModule({
    name: "sound",
    order: 12,
    init() {
      loadVolumes();
      S.init();
      if (!S.ctx) return;
      S.installUnlock();
      S.onUnlock(() => {
        S.amb.startBeds();
      });
      // background work once the heavy world building is over
      G.events.once("initDone", () => {
        setTimeout(() => {
          S.inst.ensureAll();
          S.prepareIRs();
          S.prepareConvolvers();
          S.bakeAll();
          // beds that play almost everywhere + the always-needed UI loops; the other beds (cryo, water, crickets, room,
          // tunnel, rain…) are generated in the worker the moment the ambience system first asks for them
          [
            "amb_wind",
            "amb_city",
            "amb_whistle",
            "geiger",
            "goggles_hum",
          ].forEach((n) => S.task(() => S.bakeNow(n)));
        }, 50);
      });
      // keep the music/radio schedulers alive when rAF is throttled (background tab)
      setInterval(() => {
        if (performance.now() - lastUpdate > 300) tickSchedulers(0.25);
      }, 250);
    },
    update(dt, realDt) {
      if (!S.ctx) return;
      lastUpdate = performance.now();
      tickSchedulers(realDt);
      S.amb.update(dt, realDt);
      if (S.neon) {
        try {
          S.neon.update(dt, realDt);
        } catch (e) {
          G.reportError("update:sound:neon", e);
        }
      }
      if (S.subsUpdate) S.subsUpdate();
      if (S.skyeye) S.skyeye.follow();
      loopT -= realDt;
      if (loopT <= 0) {
        loopT = 0.25;
        S.updateLoops();
      }
    },
    lateUpdate() {
      if (!S.ctx) return;
      S.syncListener();
    },
  });
