// play-inline-44 01 — opts
// Lines 8-349 of readable/play-inline-44.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;

  // ------------------------------------------------------------------
  // Volumes (persisted per browser)
  // ------------------------------------------------------------------
  function loadVolumes() {
    try {
      const d = JSON.parse(S.lsGet("audio") || "null");
      if (d)
        for (const k in S.vol)
          if (typeof d[k] === "number") S.vol[k] = S.clamp(d[k], 0, 1);
    } catch (e) {
      /* */
    }
  }
  function saveVolumes() {
    S.lsSet("audio", JSON.stringify(S.vol));
  }
  function applyVol(key, busName) {
    if (!S.ctx || !S.bus) return;
    const node = S.bus[busName];
    if (!node) return;
    node.gain.setTargetAtTime(
      key === "radio"
        ? S.radioGain()
        : S.vol[key] * (key === "ambience" && S.paused ? 0.12 : 1),
      S.ctx.currentTime,
      0.05,
    );
    if (key === "music") applyVol("radio", "radio"); // the music slider also scales the radio ("score and radio music")
  }
  function setVol(key, busName, v) {
    v = S.clamp(Number(v), 0, 1);
    if (v !== v) v = 0;
    if (S.vol[key] === v) return;
    S.vol[key] = v;
    applyVol(key, busName);
    saveVolumes();
    G.events.emit("volumeChanged", key, v);
  }

  /**
   * Near-miss side: the bullet's travel direction (opts.dir, else from the shot fired in this tick to the pass point)
   * against the listener's right vector → bullet_whiz_lr (passes left→right) / bullet_whiz_rl; the sweep is baked
   * in stereo, so the voice plays head-relative (pos dropped). No direction → random side.
   */
  function whizSide(opts, p) {
    let dx = 0,
      dz = 0;
    if (opts.dir && isFinite(opts.dir.x)) {
      dx = opts.dir.x;
      dz = opts.dir.z;
    } else if (p && S.lastShot && performance.now() - S.lastShot.t < 40) {
      dx = p.x - S.lastShot.x;
      dz = p.z - S.lastShot.z;
    }
    const cam = G.camera;
    if ((!dx && !dz) || !cam || !cam.matrixWorld) return "bullet_whiz";
    const e = cam.matrixWorld.elements; // column 0 = the camera's right vector
    const side = dx * e[0] + dz * e[2];
    if (Math.abs(side) < 1e-4 * (Math.abs(dx) + Math.abs(dz) + 1e-6))
      return "bullet_whiz";
    return side > 0 ? "bullet_whiz_lr" : "bullet_whiz_rl";
  }
  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  G.sfx = {
    /**
     * Play a sound. opts: {pos:Vector3 (positional), volume, pitch, loop, delay, distant, noOcclusion, bus:'world'|'ui'|'amb'}
     * Returns a handle {stop(fade), setVolume(v), setPosition(v), setPitch(p)}; unknown names are no-ops (warned once).
     */
    play(name, opts) {
      // sanitize: a non-finite position/volume/pitch would throw inside WebAudio (seen with NaN corpses)
      if (opts) {
        const p = opts.pos;
        if (p && !(isFinite(p.x) && isFinite(p.y) && isFinite(p.z)))
          return S.NULL_HANDLE;
        if (opts.volume !== undefined && !isFinite(opts.volume))
          opts.volume = 1;
        if (opts.pitch !== undefined && !isFinite(opts.pitch)) opts.pitch = 1;
        // BRIDGE (66_reload_foley.js): the weapons module's pitch-marked generic 'reload' steps (and the quiet 'ricochet'
        // it uses as the mag hitting the floor) → one short phase sound per step for the equipped weapon's class
        if ((name === "reload" || name === "ricochet") && !p && S.reloadFoley) {
          const rn = S.reloadFoley(name, opts);
          if (rn) {
            const v = opts.volume === undefined ? 0.7 : opts.volume;
            opts = Object.assign({}, opts, {
              pitch: 1,
              volume: Math.min(1, name === "ricochet" ? v * 8 : v * 1.15),
              _exact: true,
            });
            name = rn;
          }
        }
        // TEMPORARY BRIDGE (remove once combat calls 'bullet_whiz' itself — request in NOTES.md): combat's near-miss
        // cue is a high-pitched 'ricochet' (pitch 1.4) placed on the shot line right by the player's head. Only that
        // exact signature is upgraded to the real flyby; genuine ricochets (impacts, pitch ≤ 1.3, or away from the
        // head) are untouched. Works with THREE.Vector3 and plain {x,y,z} positions.
        if (
          name === "ricochet" &&
          !S.combatWhiz &&
          opts.pitch >= 1.35 &&
          opts.pitch <= 1.45 &&
          p &&
          G.player &&
          G.player.eye
        ) {
          const e = G.player.eye,
            dx = p.x - e.x,
            dy = p.y - e.y,
            dz = p.z - e.z;
          // (combat plays the shooter's report, then traces the shot synchronously: S.lastShot gives the direction)
          if (dx * dx + dy * dy + dz * dz < 9) {
            name = "bullet_whiz";
            opts = Object.assign({}, opts, {
              pitch: 1,
              volume: Math.min(1, (opts.volume || 0.35) * 1.6),
              _bridged: true,
            });
          }
        }
        // once any module plays 'bullet_whiz' itself, the bridge switches itself off for good
        if (name === "bullet_whiz" && !opts._bridged) S.combatWhiz = true;
        if (name === "bullet_whiz") {
          name = whizSide(opts, p);
          if (name !== "bullet_whiz") {
            opts = Object.assign({}, opts);
            delete opts.pos;
          }
        }
        // remember where the last gun went off (the near-miss that follows travels from there)
        else if (p) {
          const rn = S.resolve(name);
          if (S.R[rn] && S.R[rn].tail)
            S.lastShot = { x: p.x, y: p.y, z: p.z, t: performance.now() };
        }
        // creature vocal sets: combat's one generic name per species → idle / alert / pain / death of that actor
        if (p && S.creatureVoice && !opts._exact)
          name = S.creatureVoice(name, p);
      }
      try {
        return S.play(name, opts);
      } catch (e) {
        G.reportError("sfx:" + name, e);
        return S.NULL_HANDLE;
      }
    },
    has(name) {
      return !!S.R[S.resolve(name)];
    },
    /** Creature vocalisation by state: kind = a creature kind of 12_recipes_voices.js, state ∈ idle|alert|pain|death. */
    creature(kind, state, opts) {
      const set =
        S.CREATURE_SETS &&
        (S.CREATURE_SETS[kind] ||
          S.CREATURE_SETS[
            S.CREATURE_KIND_ALIAS && S.CREATURE_KIND_ALIAS[kind]
          ]);
      const n = set && (set[state] || set.idle);
      return n
        ? G.sfx.play(n, Object.assign({}, opts, { _exact: true }))
        : S.NULL_HANDLE;
    },
    /** Hint that these sounds will be needed soon (bakes rare/long recipes ahead of first use). */
    preload(names) {
      (Array.isArray(names) ? names : [names]).forEach((n) => S.hintBake(n));
    },
    /** NPC/creature footstep helper: surface ∈ concrete|metal|grass|dirt|wood|water|carpet|rubble. */
    footstep(surface, opts) {
      return S.play("footstep_" + (S.SURF[surface] || "concrete"), opts);
    },
    names() {
      return Object.keys(S.R).concat(Object.keys(S.alias)).sort();
    },
    /**
     * Silence every transient sound (one-shots, scheduled bursts, UI loops). World state is kept: ambience beds and
     * managed positional loops (fires, generators, neon hum) stay registered and re-realise on the next loop pass.
     */
    stopAll(fade) {
      const owned = new Set();
      for (const h of S.loops) if (h.real) owned.add(h.real);
      S.voices.slice().forEach((v) => {
        if (owned.has(v) || (v.loop && v.name.indexOf("amb_") === 0)) return;
        v.stop(fade);
      });
    },
    setMasterVolume(v) {
      setVol("master", "master", v);
    },
    setSfxVolume(v) {
      setVol("sfx", "sfx", v);
    },
    setMusicVolume(v) {
      setVol("music", "music", v);
    },
    setRadioVolume(v) {
      setVol("radio", "radio", v);
    },
    setAmbienceVolume(v) {
      setVol("ambience", "amb", v);
    },
    setUiVolume(v) {
      setVol("ui", "ui", v);
    },
    getVolumes() {
      return Object.assign({}, S.vol);
    },
    /** Resume the AudioContext (call from a user gesture if you want to be explicit). */
    unlock() {
      if (S.ctx && S.ctx.state !== "running") {
        try {
          S.ctx.resume();
        } catch (e) {
          /* */
        }
      }
    },
    isUnlocked() {
      return !!(S.ctx && S.ctx.state === "running");
    },
    get context() {
      return S.ctx;
    },
    /** Force a reverb environment ('outdoor','canyon','open','room','cryo','hall','tunnel','stone') or null for automatic. */
    setEnvironment(name) {
      S.setEnvironmentOverride(name);
    },
    environment() {
      return S.env.name;
    },
    /** Explosion-style muffle (0..1) for `dur` seconds; ringing ears. */
    shellShock(amount, dur) {
      S.shellShock(amount, dur || 2);
    },
    tinnitus(amount, dur) {
      S.tinnitus(amount || 0.6, dur || 4);
    },
    /** Speak a line with the radio voices ('dj'|'president'|'ebs'|'classical'|'announcer'); emits radioText (station 'goggles'). */
    speak(text, profile, done) {
      const pr = profile || "announcer",
        T = S.radioText || {};
      const who =
        {
          dj: T.djName || "Rocky Delgado",
          president: "Acting President Marsh",
          ebs: T.ebsSpeaker || "Civil Defense",
          classical: "Classical NYC",
          announcer: "Announcer",
        }[pr] || pr;
      S.radioSay("goggles", who, pr, String(text), done);
    },
    /**
     * A record on a phonograph in the world (68_story_cues.js): record('Two Bits and a Kiss', {pos, loop=true, volume})
     * → {stop(fade), setPosition(p), isPlaying(), title} or null. Any record of the radio library by (partial) title.
     */
    record(title, opts) {
      return S.recordPlay ? S.recordPlay(title, opts) : null;
    },
    /** NPC barks voiced by VOX from the speaker's head (default on; persisted). The bark captions are unaffected. */
    setNpcVoices(on) {
      if (S.setNpcVoices) S.setNpcVoices(on);
    },
    npcVoices() {
      return S.npcVoices ? S.npcVoices() : false;
    },
    /** Perform a line from an actor (e.g. a scripted shout): positional VOX, follows the actor. → false if not voiced. */
    voiceLine(actor, text) {
      try {
        return S.voiceBark ? S.voiceBark(actor, text) : false;
      } catch (e) {
        G.reportError("sfx:voiceLine", e);
        return false;
      }
    },
    /** The Neon soundscape state (debug): crowd pockets, sign hums, jukebox. */
    neonStats() {
      const N = S.neon;
      return N
        ? {
            near: N.near,
            busy: N.busy,
            pockets: N.chat.length,
            signs: N.buzz.length,
            barks: N.barks.length,
            jukebox: S.jukeboxPresence ? S.jukeboxPresence() : 0,
          }
        : null;
    },
    stats() {
      return Object.assign(
        {
          voices: S.voices.length,
          loops: S.loops.length,
          hrtf: S.voices.filter((v) => v.hrtf).length,
          state: S.ctx ? S.ctx.state : "none",
          env: S.env.name,
          bakeQueue: Object.values(S.bakeState).filter((x) => x !== "done")
            .length,
          recipes: Object.keys(S.R).length,
          vox: S.vox && S.vox.workerStats ? S.vox.workerStats() : null,
        },
        S.stats,
      );
    },
  };

  // ------------------------------------------------------------------
  // Bake policy: rare / long one-shots are lazy (baked on hint or first use); a few low-frequency-heavy
  // recipes render at a lower sample rate (they carry little energy above 10 kHz) to save memory.
  // ------------------------------------------------------------------
  [
    "explosion_nuke",
    "gun_recoilless",
    "gun_missile",
    "gun_flamer",
    "thunder",
    "siren_distant",
    "cryo_door",
    "cryo_alarm",
    "buoy_bell",
    "ripjaw_roar",
    "ripjaw_attack",
    "shellback_click",
    "skyeye_chatter",
    "alarm",
    // situational ambience beds: generated in the worker when the ambience system (or a prop loop) first needs them
    "amb_water",
    "amb_crickets",
    "amb_cryo",
    "amb_room",
    "amb_tunnel",
    "amb_rain",
    "amb_storm",
    "amb_hum_generator",
  ].forEach((n) => {
    n = S.resolve(n);
    if (S.R[n]) S.R[n].lazy = true;
  });
  // (creature voices and UI jingles carry little above 10 kHz; wind/whistle beds are noise shaped well below 8 kHz)
