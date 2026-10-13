// play-inline-23 07 — voice
// Lines 1963-2311 of readable/play-inline-23.pretty.js (statement-aligned).
  S.play = function (name, opts) {
    opts = opts || {};
    name = S.resolve(name);
    const rec = S.R[name];
    if (!rec) {
      S.warnOnce("unk:" + name, 'unknown sfx "' + name + '" (no-op)');
      return NULL_HANDLE;
    }
    const ctx = S.ctx;
    if (!ctx || !S.bus) return NULL_HANDLE;
    const loop = !!(opts.loop || rec.loop);
    if (loop && opts.pos && !opts._raw) return managedLoop(name, opts);
    if (ctx.state !== "running" && !loop) return NULL_HANDLE;
    const now = ctx.currentTime;
    const pos = opts.pos || null;
    // de-duplicate identical non-positional triggers in a short window (several modules may react to one event)
    if (
      !pos &&
      !loop &&
      rec.dedupe &&
      lastPlay[name] !== undefined &&
      now - lastPlay[name] < rec.dedupe
    )
      return NULL_HANDLE;
    let vol = (opts.volume === undefined ? 1 : opts.volume) * rec.gain;
    let dist = 0;
    if (pos) {
      const L = S.listenerPos;
      dist = Math.hypot(pos.x - L.x, (pos.y || 0) - L.y, pos.z - L.z);
      const ref = opts.ref || rec.ref,
        ro = rec.rolloff;
      const est = (vol * ref) / (ref + ro * Math.max(0, dist - ref));
      if (est < 0.006 && !loop) {
        S.stats.culled++;
        return NULL_HANDLE;
      }
    }
    // gun reports: pick the environment tail (indoor slap / outdoor street-canyon roll / far-off boom) for this shot
    let tailPlan = null;
    if (rec.tail && !opts._tail && !loop && (opts.bus || rec.bus) === "world") {
      const indoor = !!INDOOR_ENV[S.env.name];
      const far = !!pos && !indoor && dist > 110,
        mid = !!pos && dist > 30;
      if (far) vol *= 0.3; // the crack and body are mostly gone at that range
      tailPlan = {
        name: "gtail_" + (indoor ? "in" : "out") + "_" + rec.tail,
        k: (mid ? 1.35 : 1) * (rec.tailGain || 1),
        far,
      };
    }
    if (!stealFor(name, rec)) {
      S.stats.refused++;
      return NULL_HANDLE;
    }
    lastPlay[name] = now;
    lastUse[name] = performance.now();
    // pick a variant (avoid immediate repeats)
    const bufs = S.cache[name];
    let vi = 0;
    if (rec.variants > 1) {
      vi = (Math.random() * rec.variants) | 0;
      if (vi === lastVariant[name]) vi = (vi + 1) % rec.variants;
    }
    lastVariant[name] = vi;
    const buf = bufs && bufs[vi];
    if (!bufs) {
      if (rec.gen) S.bakeNow(name);
      else S.requestBake(name, -1);
    }
    const buf2 = buf || (S.cache[name] && S.cache[name][vi]);
    if (!buf2 && loop) return deferredVoice(name, opts);
    // pitch
    let rate =
      (opts.pitch || 1) * (1 + (Math.random() - 0.5) * 2 * rec.pitchVar);
    if (
      rec.bus === "world" &&
      G.timeScale < 0.5 &&
      G.timeScale > 0 &&
      !opts.noSlowmo
    )
      rate *= 0.62;
    const t0 = now + (opts.delay || 0) + 0.004;
    const nodes = [];
    const g = ctx.createGain();
    nodes.push(g);
    g.gain.value = vol;
    let src = null;
    if (buf2) {
      src = ctx.createBufferSource();
      src.buffer = buf2;
      src.playbackRate.value = rate;
      src.loop = loop;
      src.connect(g);
      nodes.push(src);
      src.start(
        t0,
        loop && opts.randomStart ? Math.random() * buf2.duration : 0,
      );
    } else if (rec.build && !loop && !opts.bakedOnly) {
      // live synthesis fallback while the bake is pending
      S.stats.live++;
      const lg = ctx.createGain();
      lg.gain.value = rec._norm || normHints[name] || 0.6;
      lg.connect(g);
      nodes.push(lg);
      try {
        rec.build(new Kit(ctx, lg, t0, Math.random), vi, Math.random, {
          live: true,
        });
      } catch (e) {
        G.reportError("sfx:" + name, e);
      }
    } else {
      return NULL_HANDLE; // loop still baking
    }
    // routing
    const busName = opts.bus || rec.bus;
    const dest =
      opts.dest ||
      (busName === "ui"
        ? S.bus.ui
        : busName === "amb"
          ? S.bus.amb
          : busName === "music"
            ? S.bus.musicIn
            : busName === "radio"
              ? S.bus.radioDuck
              : S.bus.world);
    let tail = g;
    let panner = null,
      air = null,
      occK = 1,
      hrtf = false;
    const airFc = (d, occ) =>
      clamp(
        Math.min(
          20000 * Math.exp(-d / (opts.distant ? 70 : 170)),
          occ ? 900 : 20000,
        ),
        350,
        20000,
      );
    const canOcc = !opts.noOcclusion && busName === "world";
    if (pos) {
      air = ctx.createBiquadFilter();
      air.type = "lowpass";
      nodes.push(air);
      if (canOcc && occluded(pos, dist)) {
        occK = 0.5;
        g.gain.value = vol * occK;
      }
      air.frequency.value = airFc(dist, occK < 1);
      panner = ctx.createPanner();
      nodes.push(panner);
      // HRTF for a limited number of one-shots; loops and the overflow use cheap equal-power panning
      if (!loop) {
        let n = 0;
        for (const v of S.voices) if (v.hrtf) n++;
        hrtf = n < S.MAX_HRTF;
      }
      panner.panningModel = hrtf ? "HRTF" : "equalpower";
      panner.distanceModel = "inverse";
      panner.refDistance = opts.ref || rec.ref;
      panner.rolloffFactor = rec.rolloff;
      panner.maxDistance = 10000;
      setPannerPos(panner, pos);
      tail.connect(air);
      air.connect(panner);
      tail = panner;
    }
    tail.connect(dest);
    // reverb send (world sounds only)
    if (busName === "world" && rec.wet > 0) {
      const send = ctx.createGain();
      nodes.push(send);
      send.gain.value =
        S.env.wet * rec.wet * clamp(1 + dist / 35, 1, opts.distant ? 3.5 : 2.2);
      tail.connect(send);
      send.connect(S.bus.revSend);
    }
    S.stats.played++;
    const voice = {
      name,
      t0,
      loop,
      vol,
      nodes,
      src,
      gain: g,
      playing: true,
      hrtf,
      pos,
      stop(fade) {
        if (!voice.playing) return;
        const t = ctx.currentTime,
          f = fade === undefined ? 0.06 : fade;
        try {
          g.gain.cancelScheduledValues(t);
          g.gain.setValueAtTime(g.gain.value, t);
          g.gain.linearRampToValueAtTime(0, t + f);
        } catch (e) {
          /* */
        }
        voice.playing = false;
        const i = S.voices.indexOf(voice);
        if (i >= 0) S.voices.splice(i, 1); // frees the slot immediately
        setTimeout(
          () => {
            try {
              if (src) src.stop();
            } catch (e) {
              /* */
            }
            removeVoice(voice);
          },
          (f + 0.05) * 1000,
        );
      },
      setVolume(v, time) {
        if (!voice.playing) return;
        const t = ctx.currentTime;
        voice.vol = v * rec.gain;
        g.gain.cancelScheduledValues(t);
        g.gain.setTargetAtTime(voice.vol * occK, t, time || 0.05);
      },
      setPitch(p) {
        voice.baseRate = p;
        voice.dop = 1;
        if (src) src.playbackRate.setTargetAtTime(p, ctx.currentTime, 0.05);
      },
      setPosition(p) {
        if (
          !panner ||
          !p ||
          !(isFinite(p.x) && isFinite(p.z) && isFinite(p.y || 0))
        )
          return;
        voice.pos = p;
        setPannerPos(panner, p);
        const L = S.listenerPos,
          d = Math.hypot(p.x - L.x, (p.y || 0) - L.y, p.z - L.z),
          t = ctx.currentTime;
        if (air) air.frequency.setTargetAtTime(airFc(d, occK < 1), t, 0.1);
        // Doppler for moving emitters (drones, robots, vehicles): the EMITTER's own velocity (wall-clock time between
        // position updates, not the audio clock's callback-quantised currentTime), projected on the listener→emitter
        // axis → playback rate, smoothed & clamped (0.8–1.25: rotorcraft/projectile flybys). The listener's smoothed
        // velocity is subtracted (relative motion); it is zeroed on any > 5 m frame jump, so teleports, fast travel and
        // doors never read as a sudden approach; an emitter jumping > 10 m in one update resets it.
        if (src && isFinite(d) && d > 0.01) {
          const tn = performance.now() / 1000,
            pp = voice.pPrev;
          if (!pp) {
            voice.pPrev = { x: p.x, y: p.y || 0, z: p.z };
            voice.pT = tn;
          } else {
            const dt = tn - voice.pT;
            if (dt >= 0.03) {
              const mx = p.x - pp.x,
                my = (p.y || 0) - pp.y,
                mz = p.z - pp.z,
                moved = Math.hypot(mx, my, mz);
              let k = 1;
              if (moved <= 10 && dt < 0.5) {
                // relative radial speed: emitter velocity minus the (smoothed, teleport-safe) listener velocity
                const LV = S.listenerVel,
                  rx = mx / dt - LV.x,
                  ry = my / dt - LV.y,
                  rz = mz / dt - LV.z;
                const vr = clamp(
                  (rx * (p.x - L.x) +
                    ry * ((p.y || 0) - L.y) +
                    rz * (p.z - L.z)) /
                    d,
                  -90,
                  90,
                ); // + = receding
                k = clamp(343 / (343 + vr), 0.8, 1.25);
                voice.dop = (voice.dop || 1) * 0.7 + k * 0.3;
              } else voice.dop = 1; // jumped (respawn/teleport) or stale: no pitch bend
              if (Math.abs(voice.dop - 1) > 0.002 || voice.dopOn) {
                voice.dopOn = Math.abs(voice.dop - 1) > 0.002;
                src.playbackRate.setTargetAtTime(
                  (voice.baseRate || rate) * voice.dop,
                  t,
                  0.08,
                );
              }
              pp.x = p.x;
              pp.y = p.y || 0;
              pp.z = p.z;
              voice.pT = tn;
            }
          }
        }
      },
      /** Re-test the line of sight (long-lived positional voices) and glide the muffle in/out. */
      refreshOcclusion() {
        if (!voice.playing || !air || !canOcc || !voice.pos) return;
        const p = voice.pos,
          L = S.listenerPos,
          d = Math.hypot(p.x - L.x, (p.y || 0) - L.y, p.z - L.z);
        if (!isFinite(d)) return;
        const k = occluded(p, d) ? 0.5 : 1;
        if (k === occK) return;
        occK = k;
        const t = ctx.currentTime;
        air.frequency.setTargetAtTime(airFc(d, k < 1), t, 0.25);
        g.gain.cancelScheduledValues(t);
        g.gain.setTargetAtTime(voice.vol * k, t, 0.25);
      },
    };
    S.voices.push(voice);
    if (tailPlan) playTail(tailPlan, opts, now);
    if (src)
      src.onended = () => {
        if (voice.playing || S.voices.includes(voice)) removeVoice(voice);
      };
    else
      setTimeout(
        () => removeVoice(voice),
        (rec.dur / rate + 0.2 + (opts.delay || 0)) * 1000,
      );
    if (rec.onPlay) {
      try {
        rec.onPlay(opts, dist, voice);
      } catch (e) {
        G.reportError("sfx:onPlay:" + name, e);
      }
    }
    return voice;
  };
  const INDOOR_ENV = {
    room: 1,
    cryo: 1,
    hall: 1,
    tunnel: 1,
    stone: 1,
    small: 1,
    office: 1,
    gallery: 1,
    cathedral: 1,
    concourse: 1,
    auditorium: 1,
    hull: 1,
    bunker: 1,
    industrial: 1,
  };
  const lastTail = {};
  /** The environment layer of a gunshot (see gtail_* in 10_recipes_weapons.js). Automatic fire: ≤ 1 tail / 90 ms. */
