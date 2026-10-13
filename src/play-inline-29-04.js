// play-inline-29 04 — ctx
// Lines 665-961 of readable/play-inline-29.pretty.js (statement-aligned).
  I.synth = function (ctx, dest, kind, midi, t, dur, vel, o) {
    o = o || {};
    const f = mtof(midi);
    let rel = 0.15,
      att = 0.03;
    const end = () => t + dur + rel * 3 + 0.1;
    let out;
    switch (kind) {
      case "clarinet": {
        att = 0.04;
        rel = 0.12;
        const os = oscW(ctx, "clarinet", f, t, end());
        vibrato(ctx, t, dur, os, f, 5, 0.004, 0.3);
        const lp = bq(ctx, "lowpass", Math.min(5000, f * 5), 0.7);
        out = ampEnv(ctx, t, dur, vel, att, rel);
        os.connect(lp);
        lp.connect(out);
        break;
      }
      case "mute":
      case "trumpet":
      case "tuba": {
        att = kind === "tuba" ? 0.05 : 0.03;
        rel = 0.1;
        const os = oscW(ctx, kind === "mute" ? "mute" : "trumpet", f, t, end());
        // jazz scoop into the note
        if (o.scoop !== false && kind !== "tuba") {
          os.frequency.setValueAtTime(f * 0.97, t);
          os.frequency.linearRampToValueAtTime(f, t + 0.06);
        }
        vibrato(ctx, t, dur, os, f, 5.6, 0.005, 0.35);
        const lp = bq(ctx, "lowpass", 600, 1.2);
        const top = kind === "tuba" ? 900 : kind === "mute" ? 2600 : 3800;
        lp.frequency.setValueAtTime(top * 0.3, t);
        lp.frequency.linearRampToValueAtTime(top * (0.6 + 0.4 * vel), t + 0.05);
        lp.frequency.setTargetAtTime(top * 0.55, t + 0.1, 0.3);
        let last = lp;
        os.connect(lp);
        if (kind === "mute") {
          const pk = bq(ctx, "peaking", 1600, 2, 9);
          lp.connect(pk);
          last = pk;
        }
        out = ampEnv(ctx, t, dur, vel, att, rel);
        last.connect(out);
        break;
      }
      case "sax": {
        att = 0.05;
        rel = 0.12;
        const os = oscW(ctx, "sax", f, t, end());
        os.frequency.setValueAtTime(f * 0.96, t);
        os.frequency.linearRampToValueAtTime(f, t + 0.08);
        vibrato(ctx, t, dur, os, f, 5, 0.006, 0.25);
        const lp = bq(ctx, "lowpass", 2400, 0.8),
          pk = bq(ctx, "peaking", 1100, 1.5, 5);
        out = ampEnv(ctx, t, dur, vel, att, rel);
        os.connect(lp);
        lp.connect(pk);
        pk.connect(out);
        // breath
        const n = ctx.createBufferSource();
        n.buffer = S.noiseBufs.white;
        n.loop = true;
        n.start(t, Math.random() * 2);
        n.stop(end());
        const nb = bq(ctx, "bandpass", f * 3, 2),
          ng = ctx.createGain();
        ng.gain.value = 0.06;
        n.connect(nb);
        nb.connect(ng);
        ng.connect(out);
        break;
      }
      case "croon": {
        // wordless crooner "ooh/aah" — glottal source + formant bank
        att = 0.12;
        rel = 0.3;
        const os = oscW(ctx, "glottal", f, t, end());
        vibrato(ctx, t, dur, os, f, 5.4, 0.009, 0.2);
        const v = S.VOWELS[o.vowel || "oo"];
        const mix = ctx.createGain();
        mix.gain.value = 1;
        [0, 1, 2].forEach((k) => {
          const bp = bq(ctx, "bandpass", v[k] * 1.08, v[k] / [70, 90, 130][k]);
          const g = ctx.createGain();
          g.gain.value = [1.2, 0.7, 0.3][k];
          os.connect(bp);
          bp.connect(g);
          g.connect(mix);
        });
        out = ampEnv(ctx, t, dur, vel * 1.4, att, rel);
        mix.connect(out);
        break;
      }
      case "flute":
      case "piccolo": {
        att = 0.05;
        rel = 0.1;
        const os = oscW(ctx, "flute", f, t, end());
        vibrato(ctx, t, dur, os, f, 5.2, 0.005, 0.2);
        out = ampEnv(ctx, t, dur, vel, att, rel);
        os.connect(out);
        const n = ctx.createBufferSource();
        n.buffer = S.noiseBufs.white;
        n.loop = true;
        n.start(t, Math.random() * 2);
        n.stop(end());
        const nb = bq(ctx, "bandpass", f * 2, 4),
          ng = ctx.createGain();
        ng.gain.value = 0.08;
        n.connect(nb);
        nb.connect(ng);
        ng.connect(out);
        break;
      }
      case "reed": {
        // harmonica / accordion
        att = 0.04;
        rel = 0.12;
        const os = oscW(ctx, "reed", f, t, end()),
          os2 = oscW(ctx, "reed", f, t, end());
        os2.detune.value = 12;
        const bp = bq(ctx, "bandpass", 1400, 0.5);
        out = ampEnv(ctx, t, dur, vel * 0.7, att, rel);
        os.connect(bp);
        os2.connect(bp);
        bp.connect(out);
        const trem = ctx.createOscillator();
        trem.frequency.value = 5.5;
        const tg = ctx.createGain();
        tg.gain.value = vel * 0.15;
        trem.connect(tg);
        tg.connect(out.gain);
        trem.start(t);
        trem.stop(end());
        break;
      }
      case "cello":
      case "duduk": {
        att = kind === "duduk" ? 0.12 : 0.18;
        rel = 0.5;
        const os = oscW(ctx, kind === "duduk" ? "reed" : "cello", f, t, end());
        if (o.glide) {
          os.frequency.setValueAtTime(mtof(o.glide), t);
          os.frequency.exponentialRampToValueAtTime(f, t + 0.12);
        }
        vibrato(ctx, t, dur, os, f, kind === "duduk" ? 4.8 : 5.2, 0.007, 0.35);
        const lp = bq(ctx, "lowpass", kind === "duduk" ? 1500 : 2200, 0.8);
        let last = lp;
        os.connect(lp);
        if (kind === "duduk") {
          const pk = bq(ctx, "peaking", 600, 2, 6);
          lp.connect(pk);
          last = pk;
        }
        out = ampEnv(ctx, t, dur, vel, att, rel);
        last.connect(out);
        break;
      }
      case "strings": {
        att = o.att || 0.25;
        rel = o.rel || 0.7;
        const lp = bq(ctx, "lowpass", o.bright || 2600, 0.6);
        const oss = [-11, 0, 9].map((d) => {
          const x = oscW(ctx, "sawtooth", f, t, end());
          x.detune.value = d + (Math.random() - 0.5) * 4;
          x.connect(lp);
          return x;
        });
        vibrato(ctx, t, dur, oss, f, 5.3, 0.004, 0.3);
        out = ampEnv(ctx, t, dur, vel * 0.4, att, rel);
        lp.connect(out);
        break;
      }
      case "brass": {
        att = 0.04;
        rel = 0.18;
        const lp = bq(ctx, "lowpass", 500, 1.4);
        const top = o.bright || 2800;
        lp.frequency.setValueAtTime(350, t);
        lp.frequency.linearRampToValueAtTime(top, t + 0.06);
        lp.frequency.setTargetAtTime(top * 0.5, t + 0.08, 0.25);
        [-7, 0, 8].forEach((d) => {
          const x = oscW(ctx, "sawtooth", f, t, end());
          x.detune.value = d;
          x.connect(lp);
        });
        out = ampEnv(ctx, t, dur, vel * 0.45, att, rel);
        lp.connect(out);
        break;
      }
      case "organ": {
        att = 0.01;
        rel = 0.08;
        const os = oscW(ctx, "organ", f, t, end());
        out = ampEnv(ctx, t, dur, vel * 0.6, att, rel);
        os.connect(out);
        const trem = ctx.createOscillator();
        trem.frequency.value = 6.3;
        const tg = ctx.createGain();
        tg.gain.value = vel * 0.1;
        trem.connect(tg);
        tg.connect(out.gain);
        trem.start(t);
        trem.stop(end());
        break;
      }
      case "pad": {
        att = o.att || 1.6;
        rel = o.rel || 2.5;
        const lp = bq(ctx, "lowpass", o.bright || 900, 0.8);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08 + Math.random() * 0.1;
        const lg = ctx.createGain();
        lg.gain.value = (o.bright || 900) * 0.35;
        lfo.connect(lg);
        lg.connect(lp.frequency);
        lfo.start(t);
        lfo.stop(end());
        [
          ["sawtooth", -8],
          ["sawtooth", 7],
          ["triangle", 1200],
        ].forEach((w) => {
          const x = oscW(ctx, w[0], f, t, end());
          x.detune.value = w[1];
          x.connect(lp);
        });
        out = ampEnv(ctx, t, dur, vel * 0.3, att, rel);
        lp.connect(out);
        break;
      }
      case "drone": {
        att = o.att || 2;
        rel = o.rel || 3;
        const lp = bq(ctx, "lowpass", o.bright || 320, 1.1);
        [
          ["sawtooth", -5],
          ["sawtooth", 6],
          ["sine", 0],
        ].forEach((w, i) => {
          const x = oscW(ctx, w[0], i === 2 ? f / 2 : f, t, end());
          x.detune.value = w[1];
          x.connect(lp);
        });
        out = ampEnv(ctx, t, dur, vel * 0.5, att, rel);
        lp.connect(out);
        break;
      }
      case "bowedmetal": {
        att = o.att || 1.2;
        rel = o.rel || 2;
        const n = ctx.createBufferSource();
        n.buffer = S.noiseBufs.pink;
        n.loop = true;
        n.start(t, Math.random() * 2);
        n.stop(end());
        out = ampEnv(ctx, t, dur, vel, att, rel);
        [1, 2.76, 5.4, 8.93].forEach((m, i) => {
          const b = bq(ctx, "bandpass", f * m, 120);
          const g = ctx.createGain();
          g.gain.value = 3 / (i + 1);
          n.connect(b);
          b.connect(g);
          g.connect(out);
        });
        break;
      }
      default: {
        // simple sine
        const os = oscW(ctx, "sine", f, t, end());
        out = ampEnv(ctx, t, dur, vel, att, rel);
        os.connect(out);
      }
    }
    out.connect(dest);
    setTimeout(
      () => {
        try {
          out.disconnect();
        } catch (e) {
          /* */
        }
      },
      Math.max(0, (end() - ctx.currentTime) * 1000 + 200),
    );
    return out;
  };

  // ------------------------------------------------------------------
  // Vintage radio / phonograph chain
  // ------------------------------------------------------------------
  /**
   * Build an AM-radio / 78rpm chain on ctx. Returns {input, output, setStatic(v), crackle(v), dispose()}.
   * input → HP 230 → LP 3600 → presence → tube saturation → wow/flutter delay → output; + crackle + hiss + static.
   */
