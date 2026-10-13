// play-inline-29 03 — ctx
// Lines 493-664 of readable/play-inline-29.pretty.js (statement-aligned).
  I.ensure = function (name) {
    if (I.ready[name] || I.pending[name]) return !!I.ready[name];
    I.pending[name] = true;
    if (SETS[name]) {
      const set = SETS[name];
      Promise.all(
        set.roots.map((m) =>
          genSample(set.expr, m, G.util.hashStr(name) + m, set.sr).then(
            (buf) => ({ midi: m, buf, loop: set.loop || null }),
          ),
        ),
      )
        .then((arr) => {
          I.samples[name] = arr.sort((a, b) => a.midi - b.midi);
          I.ready[name] = true;
        })
        .catch((e) => {
          I.pending[name] = false;
          G.reportError("sound:inst:" + name, e);
        });
    } else if (name === "drums") {
      Promise.all(
        DRUMS.map((d) =>
          genSample("drum('" + d + "', r)", 0, G.util.hashStr(d)).then(
            (buf) => [d, buf],
          ),
        ),
      )
        .then((arr) => {
          const o = {};
          arr.forEach((x) => (o[x[0]] = x[1]));
          I.samples.drums = o;
          I.ready.drums = true;
        })
        .catch((e) => {
          I.pending[name] = false;
          G.reportError("sound:inst:drums", e);
        });
    }
    return false;
  };
  /**
   * Register a sampled instrument set: {roots:[midi], expr:'fn(mtof(m), …, r)', sr?, loop?:[startSec, endSec]}.
   * `libs` = the generator functions (shipped to the worker, and kept for the main-thread fallback).
   */
  I.defineSet = function (name, set, libs) {
    SETS[name] = set;
    if (libs) {
      S.workerLib.apply(null, libs);
      libs.forEach((f) => {
        I.fallbackLibs[f.name] = f;
      });
    }
  };
  I.ensureAll = function () {
    ["drums", "bass", "piano", "guitar", "vibes", "pizz"].forEach(I.ensure);
  };
  I.allReady = function (names) {
    return names.every((n) => I.ready[n]);
  };

  /** Play a sampled pitched note. */
  I.sample = function (ctx, dest, name, midi, t, dur, vel, o) {
    const set = I.samples[name];
    if (!I.ready[name] || !set || !set.length) return null;
    let best = set[0];
    for (const s of set)
      if (Math.abs(s.midi - midi) < Math.abs(best.midi - midi)) best = s;
    const src = ctx.createBufferSource();
    src.buffer = best.buf;
    src.playbackRate.value = Math.pow(2, (midi - best.midi) / 12);
    if (o && o.detune) src.detune.value = o.detune;
    const g = ctx.createGain();
    const rel =
      (o && o.release) ||
      (name === "piano" ? 0.35 : name === "bass" ? 0.12 : 0.4);
    g.gain.setValueAtTime(vel, t);
    if (dur !== undefined && dur !== null) {
      g.gain.setValueAtTime(vel, t + dur);
      g.gain.setTargetAtTime(0, t + dur, rel / 3);
    }
    src.connect(g);
    g.connect(dest);
    src.start(t);
    src.stop(
      t +
        Math.min(
          best.buf.duration / src.playbackRate.value,
          (dur || 10) + rel * 2,
        ) +
        0.05,
    );
    src.onended = () => {
      try {
        g.disconnect();
      } catch (e) {
        /* */
      }
    };
    return g;
  };
  /** Play a drum hit. */
  I.drum = function (ctx, dest, name, t, vel, rate) {
    if (!I.ready.drums) return;
    const b = I.samples.drums[name];
    if (!b) return;
    const src = ctx.createBufferSource();
    src.buffer = b;
    if (rate) src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = vel;
    src.connect(g);
    g.connect(dest);
    src.start(t);
    src.onended = () => {
      try {
        g.disconnect();
      } catch (e) {
        /* */
      }
    };
  };
  /** Timpani is pitched: sample at MIDI 41. */
  I.timpani = function (ctx, dest, midi, t, vel) {
    I.drum(ctx, dest, "timpani", t, vel, Math.pow(2, (midi - 41) / 12));
  };

  // ------------------------------------------------------------------
  // Live synthesised voices
  // ------------------------------------------------------------------
  function vibrato(ctx, t, dur, osc, f, rate, depth, delay) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = rate;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.setValueAtTime(0, t + delay);
    g.gain.linearRampToValueAtTime(f * depth, t + delay + 0.3);
    lfo.connect(g);
    (Array.isArray(osc) ? osc : [osc]).forEach((o) => g.connect(o.frequency));
    lfo.start(t);
    lfo.stop(t + dur + 1);
  }
  function ampEnv(ctx, t, dur, vel, att, rel) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + att);
    g.gain.setValueAtTime(vel, t + Math.max(att, dur));
    g.gain.setTargetAtTime(0, t + Math.max(att, dur), rel / 3);
    return g;
  }
  function oscW(ctx, wave, f, t, end) {
    const o = ctx.createOscillator();
    if (["sine", "square", "sawtooth", "triangle"].includes(wave))
      o.type = wave;
    else o.setPeriodicWave(S.wave(ctx, wave));
    o.frequency.value = f;
    o.start(t);
    o.stop(end);
    return o;
  }
  function bq(ctx, type, f, q, gain) {
    const b = ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q || 0.7;
    if (gain !== undefined) b.gain.value = gain;
    return b;
  }

  /**
   * I.synth(ctx, dest, kind, midi, t, dur, vel, opts) — schedule one live note. opts: {vowel, bright, glide}
   */
