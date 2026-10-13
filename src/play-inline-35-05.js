// play-inline-35 05 — pos
// Lines 1384-1732 of readable/play-inline-35.pretty.js (statement-aligned).
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
