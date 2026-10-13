// play-inline-23 06 — real
// Lines 1640-1962 of readable/play-inline-23.pretty.js (statement-aligned).
  S.setEnvironment = function (name) {
    if (!S.ctx || !S.bus || S.bus._revName === name || !S.ENVS[name]) return;
    S.env.wanted = name;
    let E = S.convs[name];
    if (!E) {
      // not built yet: eager presets are built in idle slots; lazy ones (interior acoustics) are built here once their
      // IR has arrived from the worker — the ambience system retries every 0.5 s meanwhile
      const ir = S.getIR(name);
      if (!ir || !S.ENVS[name].lazy) return;
      E = buildConv(name, ir);
      if (!E) return;
    }
    const t = S.ctx.currentTime,
      B = S.bus;
    // release lazy convolvers that have been idle for a minute (their FFT partitions are the expensive part)
    const nowMs = performance.now();
    for (const n in S.convs) {
      const C = S.convs[n];
      if (
        n === name ||
        n === B._revName ||
        !S.ENVS[n] ||
        !S.ENVS[n].lazy ||
        C.connected ||
        !C.offAt ||
        nowMs - C.offAt < 60000
      )
        continue;
      try {
        C.conv.disconnect();
        C.gain.disconnect();
      } catch (e) {
        /* */
      }
      delete S.convs[n];
    }
    const old = B._revName && S.convs[B._revName];
    clearTimeout(E.offTimer);
    if (!E.connected) {
      B.revSend.connect(E.conv);
      E.connected = true;
    }
    E.gain.gain.cancelScheduledValues(t);
    E.gain.gain.setValueAtTime(E.gain.gain.value, t);
    E.gain.gain.linearRampToValueAtTime(1, t + 1.2);
    if (old) {
      old.gain.gain.cancelScheduledValues(t);
      old.gain.gain.setValueAtTime(old.gain.gain.value, t);
      old.gain.gain.linearRampToValueAtTime(0, t + 1.2);
      old.offTimer = setTimeout(() => {
        if (B._revName !== name || !old.connected) return;
        try {
          B.revSend.disconnect(old.conv);
        } catch (e) {
          /* */
        }
        old.connected = false;
        old.offAt = performance.now();
      }, 5000);
    }
    B._revName = name;
    S.env.name = name;
    S.env.wet = S.ENVS[name].wet;
  };

  /** Smoothly set an AudioParam. */
  S.ramp = function (param, v, time, tau) {
    if (!S.ctx) return;
    const t = S.ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setTargetAtTime(v, t, tau || time / 3 || 0.05);
  };
  /** Dip a bus gain (sidechain-style): to `level` in `a`, hold, recover over `r`. */
  S.duck = function (param, level, a, hold, r) {
    if (!S.ctx) return;
    const t = S.ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
    param.linearRampToValueAtTime(level, t + a);
    param.setValueAtTime(level, t + a + hold);
    param.linearRampToValueAtTime(1, t + a + hold + r);
  };

  // ------------------------------------------------------------------
  // Voice playback
  // ------------------------------------------------------------------
  const NULL_HANDLE = Object.freeze({
    stop() {},
    setVolume() {},
    setPosition() {},
    setPitch() {},
    playing: false,
    isNull: true,
  });
  S.NULL_HANDLE = NULL_HANDLE;
  const lastPlay = {};
  const lastVariant = {};

  function removeVoice(v) {
    const i = S.voices.indexOf(v);
    if (i >= 0) S.voices.splice(i, 1);
    v.playing = false;
    try {
      v.nodes.forEach((n) => n.disconnect());
    } catch (e) {
      /* already */
    }
  }
  // ------------------------------------------------------------------
  // Virtualised positional loops: a positional loop (burning barrel, humming
  // generator, buzzing gasfly) only owns real audio nodes while it is
  // audible; out of range it becomes "virtual" (just data) and is realised
  // again when the listener approaches. The caller's handle stays valid.
  // ------------------------------------------------------------------
  S.loops = [];
  function managedLoop(name, opts) {
    const rec = S.R[name];
    const h = {
      name,
      managed: true,
      playing: true,
      real: null,
      isNull: false,
      opts: Object.assign({}, opts, { _raw: true, loop: true }),
      stop(f) {
        h.playing = false;
        if (h.real) {
          h.real.stop(f);
          h.real = null;
        }
        const i = S.loops.indexOf(h);
        if (i >= 0) S.loops.splice(i, 1);
      },
      setVolume(v, t) {
        h.opts.volume = v;
        if (h.real) h.real.setVolume(v, t);
      },
      setPosition(p) {
        h.opts.pos = p;
        if (h.real) h.real.setPosition(p);
      },
      setPitch(p) {
        h.opts.pitch = p;
        if (h.real) h.real.setPitch(p);
      },
      audibility() {
        const p = h.opts.pos,
          L = S.listenerPos;
        if (!p) return 1;
        const d = Math.hypot(p.x - L.x, (p.y || 0) - L.y, p.z - L.z),
          ref = h.opts.ref || rec.ref;
        return (
          ((h.opts.volume === undefined ? 1 : h.opts.volume) * rec.gain * ref) /
          (ref + rec.rolloff * Math.max(0, d - ref))
        );
      },
    };
    S.loops.push(h);
    if (!S.cache[name]) S.requestBake(name, -1);
    S.updateLoops(true, h);
    return h;
  }
  /**
   * Realise / virtualise managed loops (called 4×/s by the module update). Loops are ranked by audibility and
   * only the S.MAX_REAL_LOOPS loudest own real voices (with a little hysteresis so ranks don't flap); a street
   * full of burning barrels costs a dozen voices, not forty. Real loops re-check occlusion about once a second.
   */
  let occT = 0,
    evT = 0;
  function realise(h) {
    h.real = S.play(h.name, Object.assign({}, h.opts, { randomStart: true }));
    if (h.real.isNull) h.real = null;
  }
  S.updateLoops = function (force, only) {
    if (only) {
      // a freshly started loop: realise straight away if it would make the cut
      if (!only.playing || only.real || !S.cache[only.name]) return;
      let real = 0;
      for (const h of S.loops) if (h.real) real++;
      if (real < S.MAX_REAL_LOOPS && only.audibility() > 0.02) realise(only);
      return;
    }
    const act = [];
    for (const h of S.loops) {
      if (!h.playing) continue;
      if (h.real && !h.real.playing) h.real = null; // its voice was stopped/stolen from outside: re-realise below
      h._a = h.audibility();
      act.push(h);
    }
    act.sort((a, b) => b._a - a._a);
    const recheck = (occT = (occT + 1) % 4) === 0;
    if (++evT >= 20) {
      evT = 0;
      S.evictIdle();
    } // every ~5 s
    for (let rank = 0; rank < act.length; rank++) {
      const h = act[rank],
        a = h._a;
      const want = a > 0.02 && rank < S.MAX_REAL_LOOPS;
      const keep = a > 0.01 && rank < S.MAX_REAL_LOOPS + 3;
      if (!h.real) {
        if (want && S.cache[h.name]) realise(h);
      } else if (!keep) {
        h.real.stop(0.4);
        h.real = null;
      } else if (h.opts.pos) {
        if (h.real.setPosition) h.real.setPosition(h.opts.pos); // follow moving emitters
        if (recheck && h.real.refreshOcclusion) h.real.refreshOcclusion();
      }
    }
    S.stats.realLoops = act.filter((h) => h.real).length;
    S.stats.virtualLoops = act.length - S.stats.realLoops;
    // long positional one-shots (explosion tails, roars, the cryo hatch, a nuke blast) re-test their line of sight
    // twice a second, so ducking behind / stepping out from a wall mid-sound muffles / opens it up
    if (occT % 2 === 0) {
      const now = S.ctx ? S.ctx.currentTime : 0;
      for (const v of S.voices) {
        if (v.loop || !v.pos || !v.refreshOcclusion || v.t0 > now) continue;
        const rec = S.R[v.name];
        if (!rec || rec.dur < 1.5) continue;
        v.refreshOcclusion();
      }
    }
  };

  /** Handle for a looping sound whose buffer is still being generated: binds to the real voice when ready. */
  function deferredVoice(name, opts) {
    let on = true;
    const h = {
      name,
      deferred: true,
      real: null,
      isNull: false,
      opts: Object.assign({}, opts),
      /** false once stopped — or once the bound voice was stopped from outside (G.sfx.stopAll, stealing). */
      get playing() {
        return on && (!h.real || h.real.isNull || h.real.playing !== false);
      },
      stop(f) {
        on = false;
        if (h.real) h.real.stop(f);
      },
      setVolume(v, t) {
        h.opts.volume = v;
        if (h.real) h.real.setVolume(v, t);
      },
      setPosition(p) {
        h.opts.pos = p;
        if (h.real) h.real.setPosition(p);
      },
      setPitch(p) {
        h.opts.pitch = p;
        if (h.real) h.real.setPitch(p);
      },
    };
    S.requestBake(name, -1);
    const tryBind = () => {
      if (!on) return;
      if (S.cache[name]) {
        h.real = S.play(name, h.opts);
        if (h.real.isNull && S.bakeState[name] !== "failed")
          setTimeout(tryBind, 500);
      } else if (S.bakeState[name] !== "failed") setTimeout(tryBind, 200);
    };
    setTimeout(tryBind, 30);
    return h;
  }
  /**
   * Make room for a new voice. Only voices that are already sounding are candidates: a shot scheduled for
   * later (burst fire, a distant firefight) is never killed before it plays. Returns false when the new voice
   * must be refused (every slot is taken by loops or by scheduled-but-not-started voices).
   */
  function stealFor(name, rec) {
    const now = S.ctx.currentTime;
    let same = 0,
      oldest = null;
    for (const v of S.voices) {
      if (v.name !== name || v.loop || v.t0 > now + 0.02) continue;
      same++;
      if (!oldest || v.t0 < oldest.t0) oldest = v;
    }
    if (same >= rec.maxVoices && oldest) oldest.stop(0.03);
    if (S.voices.length >= S.MAX_VOICES) {
      // steal the oldest, quietest sounding one-shot
      let victim = null,
        score = 1e9;
      for (const v of S.voices) {
        if (v.loop || v.t0 > now) continue;
        const s = v.t0 + v.vol * 2;
        if (s < score) {
          score = s;
          victim = v;
        }
      }
      if (!victim) return false;
      victim.stop(0.02);
    }
    return true;
  }
  const _o = { x: 0, y: 0, z: 0 },
    _d = { x: 0, y: 0, z: 0 };
  function occluded(pos, dist) {
    try {
      if (!G.world || !G.world.raycast || dist < 3 || dist > 90) return false;
      const L = S.listenerPos;
      _o.x = L.x;
      _o.y = L.y;
      _o.z = L.z;
      _d.x = (pos.x - L.x) / dist;
      _d.y = ((pos.y || 0) + 0.5 - L.y) / dist;
      _d.z = (pos.z - L.z) / dist;
      const h = G.world.raycast(_o, _d, dist - 1.0, {
        ignoreTags: ["actor", "interactable_self", "prop_small"],
      });
      return !!(h && h.collider && h.dist < dist - 1.2);
    } catch (e) {
      return false;
    }
  }

  /**
   * Core play. opts: {pos, volume, pitch, loop, distant (bool: heavy air absorption), noOcclusion, delay (s), bus}
   */
