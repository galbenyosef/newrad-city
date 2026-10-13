// play-inline-30 03 — ctx
// Lines 634-964 of readable/play-inline-30.pretty.js (statement-aligned).
  SettlementGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx,
      r = this.r,
      b = this.beat;
    if (bar >= this.bars) {
      this.done = true;
      return this.barDur;
    }
    const ch = this.prog[bar % 4],
      cr = this.root + ch[0],
      q = Q[ch[1]];
    const fade = bar >= this.bars - 2 ? 0.5 : 1;
    // Travis picking: thumb alternates root/5th on beats, fingers on offbeats
    const lowR = cr - (cr > 47 ? 12 : 0);
    for (let i = 0; i < 4; i++) {
      I.sample(
        ctx,
        out,
        "guitar",
        i % 2 ? lowR + 7 : lowR,
        t + i * b,
        b * 1.2,
        0.3 * fade,
      );
      if (r() < 0.9)
        I.sample(
          ctx,
          out,
          "guitar",
          cr + 12 + q[(i + 1) % q.length],
          t + i * b + b / 2 + (r() - 0.5) * 0.02,
          b * 1.5,
          0.2 * fade,
        );
      if (i % 2 === 1 && r() < 0.5)
        I.sample(ctx, out, "guitar", cr + 12 + q[2], t + i * b, b, 0.14 * fade);
    }
    I.sample(ctx, out, "bass", lowR - 12, t, b * 1.8, 0.3 * fade);
    I.sample(ctx, out, "bass", lowR - 5, t + b * 2, b * 1.8, 0.22 * fade);
    if (bar % 2 === 0)
      q.forEach((x) =>
        I.synth(ctx, out, "pad", cr + x, t, this.barDur * 2, 0.08 * fade, {
          bright: 1200,
          att: 1,
          rel: 2,
        }),
      );
    // harmonica phrase every 8 bars (pentatonic)
    if (bar % 8 === 4) {
      const pent = [0, 2, 4, 7, 9, 12];
      let tt = t,
        p = (r() * 3) | 0;
      for (let i = 0; i < 6; i++) {
        const d = pick(r, [b / 2, b, b * 1.5]);
        I.synth(
          ctx,
          out,
          "reed",
          this.root + 12 + pent[p],
          tt,
          d * 0.9,
          0.18 * fade,
        );
        tt += d;
        p = Math.max(0, Math.min(5, p + pick(r, [-1, 1, 1, -2])));
      }
    }
    if (r() < 0.4)
      for (let i = 0; i < 4; i++)
        I.drum(ctx, out, "maracas", t + i * b + b / 2, 0.06);
    return this.barDur;
  };

  S.musicGens = { ExploreGen, CombatGen, DangerGen, CryoGen, SettlementGen };

  // ------------------------------------------------------------------
  // Engine
  // ------------------------------------------------------------------
  const M = (S.music = {
    cue: null,
    mood: "none",
    forced: null,
    inCombat: false,
    lastCombatActivity: -1e9,
    restUntil: 0,
    suppressUntil: 0,
    radioOn: false,
    seed: (Date.now() & 0xffff) ^ 0x5a5a,
  });
  function makeGen(track) {
    const seed = ++M.seed * 7919;
    const night =
      G.atmos && !G.isStub("atmos") && G.atmos.isNight
        ? !!G.atmos.isNight()
        : G.time.hour < 6 || G.time.hour > 20;
    switch (track) {
      case "explore":
        return new ExploreGen(seed, { night });
      case "combat":
        return new CombatGen(seed);
      case "danger":
        return new DangerGen(seed);
      case "cryo":
        return new CryoGen(seed);
      case "settlement":
        return new SettlementGen(seed);
      case "ending":
        return new ExploreGen(seed, {
          mode: "ionian",
          lead: "piano",
          bars: 40,
          melodyChance: 0.9,
          brightPad: 1500,
          barDur: 4,
        });
      case "title":
        return S.songs && S.songs.titleGen
          ? S.songs.titleGen()
          : new ExploreGen(seed, { mode: "aeolian", lead: "piano", bars: 64 });
      default:
        return null;
    }
  }
  const TRACK_GAIN = {
    explore: 0.65,
    combat: 0.6,
    danger: 0.75,
    cryo: 1.1,
    settlement: 1.9,
    title: 0.65,
    ending: 0.7,
  };
  const NEEDS = {
    explore: ["piano", "drums"],
    combat: ["drums", "pizz"],
    danger: ["drums", "piano"],
    cryo: ["vibes", "bass"],
    settlement: ["guitar", "bass", "drums"],
    ending: ["piano", "drums"],
    title: ["piano", "bass", "drums"],
  };
  function startTrack(track, fadeIn) {
    if (!S.ctx || !S.bus) return;
    const gen = makeGen(track);
    if (!gen) return;
    const c = new Cue(track, gen, {
      reverb: track === "combat" ? 0.25 : track === "title" ? 0.15 : 0.55,
    });
    c.out.gain.value = TRACK_GAIN[track] || 1;
    c.start(S.ctx.currentTime + 0.1, fadeIn);
    M.cue = c;
    applyLevels(true);
  }
  function stopCurrent(fade) {
    if (M.cue) {
      M.cue.stop(fade);
      M.cue = null;
    }
  }
  /** Level of the current cue given radio state. */
  function applyLevels(instant) {
    if (!M.cue) return;
    const radio =
      G.radio &&
      G.radio.isOn &&
      !G.isStub("radio") &&
      G.radio.isOn() &&
      (!S.radioPresence || S.radioPresence() > 0.08);
    let v = 1;
    if (radio) v = M.cue.id === "combat" ? 0.55 : 0;
    // a jukebox playing nearby (the Rad Room) takes the place of the score, like a radio set
    else if (
      S.jukeboxPresence &&
      M.cue.id !== "combat" &&
      M.cue.id !== "title" &&
      S.jukeboxPresence() > 0.12
    )
      v = 0;
    if (M.cue.id === "title" && stateCat() !== "menu")
      v = M.forced === "title" ? 1 : 0;
    M.cue.setLevel(v, instant ? 0.05 : 0.8);
  }

  /** Stingers straight into the music bus. */
  M.stinger = function (name) {
    const ctx = S.ctx;
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime + 0.03,
      out = S.bus.musicIn;
    const root = 38;
    if (name === "combat_start") {
      I.drum(ctx, out, "taiko", t, 0.9);
      I.drum(ctx, out, "crash", t, 0.35);
      I.drum(ctx, out, "metal_hit", t, 0.4);
      [0, 3, 7, 12].forEach((iv) =>
        I.synth(ctx, out, "brass", root + 12 + iv, t, 0.6, 0.55, {
          bright: 3000,
        }),
      );
      I.synth(ctx, out, "brass", root, t, 0.9, 0.5, { bright: 900 });
    } else if (name === "combat_end") {
      I.timpani(ctx, out, root, t, 0.5);
      [0, 7, 15].forEach((iv) =>
        I.synth(ctx, out, "strings", root + 12 + iv, t, 3, 0.35, {
          att: 0.6,
          rel: 2,
        }),
      );
    } else if (name === "death") {
      I.timpani(ctx, out, root - 2, t, 0.8);
      I.drum(ctx, out, "taiko", t, 0.6);
      [0, 1, 6].forEach((iv) =>
        I.synth(ctx, out, "brass", root + iv, t, 2.5, 0.45, { bright: 800 }),
      );
      [12, 13].forEach((iv) =>
        I.synth(ctx, out, "strings", root + 24 + iv, t + 0.5, 3.5, 0.25, {
          att: 1.5,
          rel: 2.5,
        }),
      );
    } else if (name === "discover") {
      I.timpani(ctx, out, root, t, 0.3);
    }
  };

  function nearestInterior(p) {
    const L = G.LAYOUT;
    let best = null,
      bd = 1e9;
    for (const k in L.INTERIORS) {
      const o = L.INTERIORS[k].origin;
      const d = Math.hypot(p.x - o.x, p.z - o.z);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best;
  }
  M.nearestInterior = nearestInterior;
  // interiors whose owning location is not linked through LOCATIONS[].interior
  const INTERIOR_LOC = {
    empire_lobby: "empire_state",
    liberty_pedestal: "liberty",
  };
  /**
   * Mood for an interior cell: Cryo Unit C-9 → cryo; otherwise the owning LOCATIONS entry decides (hostile → danger,
   * settlement → settlement). Flags on the INTERIORS entry itself (hostile/type/mood, e.g. set by quests for their
   * spare cells) win. Unknown / friendly interiors → explore (never tense music in a safe room).
   */
  function interiorMood(key) {
    if (S.isStartLab(key)) return "cryo";
    const L = G.LAYOUT,
      def = (L.INTERIORS && L.INTERIORS[key]) || {};
    if (def.mood) return def.mood;
    if (def.hostile === true) return "danger";
    if (def.type === "settlement" || def.hostile === false)
      return def.type === "settlement" ? "settlement" : "explore";
    const loc =
      (L.LOCATIONS || []).find(
        (l) => l.interior === key || l.id === INTERIOR_LOC[key],
      ) || (L.LOCATIONS || []).find((l) => l.id === key);
    if (loc)
      return loc.hostile
        ? "danger"
        : loc.type === "settlement"
          ? "settlement"
          : "explore";
    return "explore";
  }
  M.interiorMood = interiorMood;
  function detectMood() {
    const st = G.state;
    if (st === "title" || st === "chargen" || st === "loading") return "title";
    if (st === "dead") return "none";
    const now = G.time.real;
    if (M.inCombat && now - M.lastCombatActivity > 50) M.inCombat = false; // safety timeout
    if (M.inCombat) return "combat";
    // fallback: enemies actively hunting the player ([DANGER]) even if no combatStart was emitted
    try {
      if (
        G.combat &&
        !G.isStub("combat") &&
        G.combat.detection &&
        G.combat.detection() === "danger"
      ) {
        M.dangerT = (M.dangerT || 0) + 0.5;
        if (M.dangerT >= 1.5) return "combat";
      } else M.dangerT = 0;
    } catch (e) {
      M.dangerT = 0;
    }
    const p = G.player && G.player.pos;
    if (!p || !G.LAYOUT) return "explore";
    if (G.LAYOUT.isInterior(p.x)) return interiorMood(nearestInterior(p));
    const loc = G.LAYOUT.locationAt(p.x, p.z);
    if (loc) {
      if (!loc.hostile && loc.type === "settlement") return "settlement";
      if (loc.hostile && loc.type !== "landmark") return "danger";
    }
    return "explore";
  }
  M.detectMood = detectMood;
  function stateCat() {
    const s = G.state;
    return s === "title" || s === "chargen" || s === "loading"
      ? "menu"
      : "world";
  }
  M.clearForced = function () {
    M.forced = null;
    M.forcedHard = false;
  };
  function restFor(mood) {
    const r = Math.random();
    switch (mood) {
      case "explore":
        return 25 + r * 50;
      case "danger":
        return 15 + r * 20;
      case "cryo":
      case "settlement":
        return 12 + r * 15;
      case "title":
        return 2.5;
      default:
        return 4;
    }
  }

  let tickAcc = 0;
