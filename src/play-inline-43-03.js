// play-inline-43 03 — pos
// Lines 703-1036 of readable/play-inline-43.pretty.js (statement-aligned).
  D("clock_tock", {
    dur: 0.35,
    variants: 2,
    gain: 0.35,
    ref: 3,
    rolloff: 1.2,
    priority: 4,
    pitchVar: 0.01,
    wet: 0.9,
    build(k) {
      tickBody(k, 1050, 0.45);
    },
  });
  /** Tick-tock, one beat a second (2 s loop). */
  D("clock_tick_loop", {
    dur: 2,
    loop: true,
    sr: 24000,
    gain: 0.32,
    ref: 3,
    rolloff: 1.2,
    priority: 5,
    pitchVar: 0,
    wet: 0.9,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      const a = d[0];
      [
        [0.0, 1250],
        [1.0, 1050],
      ].forEach(([t0, f]) => {
        const i0 = (t0 * sr) | 0;
        for (let k = 0; k < sr * 0.3 && i0 + k < n; k++) {
          const t = k / sr;
          a[i0 + k] +=
            (k < 2 ? 0.5 : 0) +
            Math.sin(TAU * f * t) * Math.exp(-t * 60) * 0.4 +
            Math.sin(TAU * f * 2.71 * t) * Math.exp(-t * 90) * 0.15 +
            Math.sin(TAU * 420 * t) * Math.exp(-t * 40) * 0.12;
        }
      });
    },
  });
  /** The minute hand stepping on a station master clock: a solenoid clunk and a little spring buzz. */
  D("clock_minute", {
    dur: 0.9,
    variants: 1,
    gain: 0.45,
    ref: 4,
    rolloff: 1.1,
    priority: 5,
    pitchVar: 0,
    wet: 1,
    build(k) {
      k.burst({
        a: 0.0008,
        d: 0.05,
        peak: 1,
        type: "bandpass",
        f: 900,
        q: 1.2,
      });
      k.tone({ type: "sine", f: 140, f2: 90, a: 0.002, d: 0.12, peak: 0.6 });
      const m = k.metal(1, [880, 1760 * 1.03, 3300], 40, [0.5, 0.3, 0.15]);
      k.chain(m.output, k.gain(0.25), k.out);
      k.burst({
        start: 0.01,
        a: 0.0005,
        d: 0.01,
        peak: 1,
        type: "highpass",
        f: 800,
        dest: m.input,
      });
    },
  });

  // ------------------------------------------------------------------
  // Rose's handcar on the Park Avenue spur (mono loop): rail joints + lever creak
  // ------------------------------------------------------------------
  D("handcar_loop", {
    dur: 2.4,
    loop: true,
    sr: 22050,
    gain: 0.4,
    ref: 5,
    rolloff: 1.1,
    priority: 6,
    pitchVar: 0,
    wet: 0.8,
    lazy: true,
    gen(d, sr, r, n) {
      const TAU = 2 * Math.PI;
      const a = d[0],
        rumble = biquad("lp", 160, 0.7, sr),
        creak = biquad("bp", 700, 6, sr);
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          x = r() * 2 - 1;
        let v = rumble(x) * 1.6;
        const ph = t % 1.2; // two rail joints a cycle (clack-clack)
        if (ph < 0.03 || (ph > 0.18 && ph < 0.21))
          v += (r() * 2 - 1) * 0.7 * Math.exp(-((ph % 0.18) * 90));
        const lv = Math.sin((TAU * t) / 1.2); // pump lever, creaking at the ends of its stroke
        v += creak(x) * Math.pow(Math.abs(lv), 8) * 0.5;
        a[i] = v;
      }
    },
  });

  // ------------------------------------------------------------------
  // Positional record player: a procedural record from the radio library
  // through a phonograph chain, from a point in the world.
  // ------------------------------------------------------------------
  const players = new Set();
  function findSong(title) {
    const T = S.radioText;
    const all = [].concat(
      T.rfmSongs || [],
      T.continuityMarches || [],
      T.classicalPieces || [],
    );
    const k = String(title || "").toLowerCase();
    return (
      all.find((s) => s.title.toLowerCase() === k) ||
      all.find((s) => s.title.toLowerCase().indexOf(k) >= 0) ||
      (T.rfmSongs || []).find((s) => s.title === "Two Bits and a Kiss")
    );
  }
  /**
   * G.sfx.record(title, {pos:{x,y,z}, loop=true, volume=1}) → {stop(fade), setPosition(p), isPlaying(), title} | null.
   * Plays the named record (default 'Two Bits and a Kiss') on a phonograph at pos: needle drop, the record with
   * surface noise and wow, the run-out groove for a few turns, then (loop) the needle goes back to the start.
   */
  S.recordPlay = function (title, opts) {
    opts = opts || {};
    const ctx = S.ctx;
    if (!ctx || !S.bus || !S.songs) return null;
    const song = findSong(title);
    if (!song) return null;
    const pos = {
      x: opts.pos ? opts.pos.x : S.listenerPos.x,
      y: opts.pos ? opts.pos.y || 0 : S.listenerPos.y,
      z: opts.pos ? opts.pos.z : S.listenerPos.z,
    };
    const input = ctx.createGain();
    input.gain.value = (opts.volume === undefined ? 1 : opts.volume) * 1.2;
    const box = ctx.createBiquadFilter();
    box.type = "peaking";
    box.frequency.value = 700;
    box.Q.value = 0.9;
    box.gain.value = 4; // horn / cabinet
    const pan = ctx.createPanner();
    pan.panningModel = "equalpower";
    pan.distanceModel = "inverse";
    pan.refDistance = 2;
    pan.rolloffFactor = 1.4;
    pan.maxDistance = 10000;
    S.setPannerPos(pan, pos);
    const send = ctx.createGain();
    send.gain.value = Math.max(0.2, S.env.wet * 1.8);
    input.connect(box);
    box.connect(pan);
    pan.connect(S.bus.world);
    pan.connect(send);
    send.connect(S.bus.revSend);
    const chain = S.inst.radioChain(ctx, input, {
      crackle: 0.55,
      hiss: 0.02,
      lp: 4800,
      hp: 160,
      out: 0.75,
    });
    const h = {
      title: song.title,
      pos,
      cue: null,
      state: "needle",
      at: 0,
      stopped: false,
      runout: null,
    };
    function begin() {
      if (h.stopped) return;
      if (
        !S.inst.allReady(["piano", "bass", "drums", "guitar", "vibes", "pizz"])
      ) {
        ["piano", "bass", "drums", "guitar", "vibes", "pizz"].forEach(
          S.inst.ensure,
        );
        h.state = "wait";
        return;
      }
      S.play("record_needle", { pos, volume: 0.8 });
      const gen = S.songs.make(song);
      const cue = new S.Cue("record:" + song.title, gen, {
        dest: chain.input,
        reverb: 0,
      });
      cue.out.gain.value = S.songs.gainFor(song);
      cue.start(ctx.currentTime + 1.0, 0.2);
      h.cue = cue;
      h.state = "play";
    }
    h.tick = function () {
      if (h.stopped) return;
      const now = ctx.currentTime;
      if (h.state === "wait" || h.state === "needle") {
        begin();
        return;
      }
      if (h.state === "play" && h.cue) {
        h.cue.tick(now, now + 1.2);
        if (h.cue.stopped) {
          h.cue = null;
          h.state = "runout";
          h.at = G.time.real + 7;
          h.runout = S.play("record_runout", { pos, loop: true, volume: 0.9 });
        }
      } else if (h.state === "runout" && G.time.real > h.at) {
        if (h.runout) {
          h.runout.stop(0.3);
          h.runout = null;
        }
        if (opts.loop === false) {
          h.stop(0.5);
          return;
        }
        h.state = "needle";
      }
    };
    h.stop = function (fade) {
      if (h.stopped) return;
      h.stopped = true;
      players.delete(h);
      const f = fade === undefined ? 0.6 : fade;
      if (h.cue) h.cue.stop(f);
      if (h.runout) h.runout.stop(f);
      setTimeout(
        () => {
          try {
            chain.dispose();
            pan.disconnect();
            send.disconnect();
          } catch (e) {
            /* */
          }
        },
        (f + 0.5) * 1000,
      );
    };
    h.setPosition = function (p) {
      if (!p) return;
      pos.x = p.x;
      pos.y = p.y || 0;
      pos.z = p.z;
      S.setPannerPos(pan, pos);
    };
    h.isPlaying = function () {
      return !h.stopped;
    };
    players.add(h);
    return h;
  };
  S.recordStopAll = function (fade) {
    Array.from(players).forEach((p) => p.stop(fade));
  };
  S.story = S.story || {};
  S.story.update = function () {
    for (const p of players) {
      try {
        p.tick();
      } catch (e) {
        G.reportError("sound:record", e);
        p.stop(0);
      }
    }
  };
  G.events.on("reset", () => S.recordStopAll(0));

  // ------------------------------------------------------------------
  // Interior acoustics for the lair (64_spaces.js reads S.spaceArchetypes)
  // ------------------------------------------------------------------
  const ARCH_ADD = {
    // the Hall of Candles: a stone vault of candles, quiet, drips, wicks spitting
    candlehall: {
      fam: "stone",
      over: { 0: "stone", 1: "stone", 2: "gallery", 3: "cathedral" },
      def: "gallery",
      rain: 0,
      beds: { amb_candle_hall: 0.8, amb_tunnel: 0.15 },
      spots: [
        ["candle_gutter", 2.2, { wall: 1 }],
        ["drip", 2],
        ["distant_thud", 0.08, { far: 1 }],
      ],
    },
    // the M42 substation: concrete and dead iron, the firing set's whine is placed by the lair itself
    sunroom: {
      fam: "concrete",
      over: { 0: "bunker", 1: "hall", 2: "hall", 3: "tunnel" },
      def: "hall",
      rain: 0,
      beds: { amb_candle_hall: 0.45, amb_int_machine: 0.12, amb_room: 0.3 },
      spots: [
        ["candle_gutter", 1.2, { wall: 1 }],
        ["pipe_knock", 0.4],
        ["drip", 1.5],
        ["distant_thud", 0.1, { far: 1 }],
      ],
    },
    // the Track 61 platform: a long low tunnel with a dead train in it
    track61: {
      fam: "concrete",
      over: { 0: "tunnel", 1: "tunnel", 2: "tunnel" },
      def: "tunnel",
      rain: 0,
      beds: { amb_tunnel: 0.8, amb_candle_hall: 0.2, amb_int_water: 0.12 },
      spots: [
        ["drip", 4],
        ["rat_scurry", 0.6, { wall: 1 }],
        ["chain_rattle", 0.2],
        ["candle_gutter", 0.5, { wall: 1 }],
        ["distant_thud", 0.15, { far: 1 }],
      ],
    },
  };
  if (S.spaceArch) Object.assign(S.spaceArch, ARCH_ADD);
  if (S.spaceRules)
    S.spaceRules.unshift(
      [/hall of candles|candle hall|candles/i, "candlehall"],
      [/\bm42\b|sun room|substation|second sun/i, "sunroom"],
      [/track 61|track61|sixty-one|glowkeeper lair/i, "track61"],
    );
