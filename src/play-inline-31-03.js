// play-inline-31 03 — beat
// Lines 710-814 of readable/play-inline-31.pretty.js (statement-aligned).
  SwingGen.prototype.singBar = function (t, out, sec, barIdx, chordNow) {
    const src = sec === "head" ? this.vocHead : this.vocOut;
    if (!src) return;
    if (!this.singers) this.singers = makeSingers(this.song, out, t);
    if (!this.singers) return;
    const b0 = barIdx * 4,
      b = this.beat;
    const at = (beat) => t + this.t8(beat - b0);
    for (const n of src.notes) {
      if (n.beat < b0 || n.beat >= b0 + 4) continue;
      const tt = at(n.beat);
      let dur = at(n.beat + n.dur) - tt;
      if (n.next)
        dur = Math.max(0.08, dur - S.vox.onsetDur(n.next.syl) * 0.9); // the next syllable's consonants start early
      else dur *= 0.97;
      const o = {
        legato: !n.last,
        breath: n.first,
        fall: n.last && !this.ballad && (n.beat * 7) % 3 === 0,
      };
      const vel = this.vocalVel * (n.last ? 0.95 : 1);
      for (const sg of this.singers) {
        if (sg.part === "harmony") {
          if (n.beat < 64) continue; // the girls come in on the bridge and the last A
          const ch = chordNow(n.beat),
            q = Q[ch[1]] || Q.maj;
          let m = nearestIn(q, (this.key + ch[0]) % 12, n.midi - 4);
          if (m >= n.midi - 1) m -= 3;
          sg.s.note(tt, dur, m, n.syl, vel * 0.9, o);
        } else
          sg.s.note(
            tt + (sg.part === "double" ? 0.004 : 0),
            dur,
            n.midi,
            n.syl,
            vel,
            o,
          );
      }
      lyricCue(this, n, tt, b, n.phrase || [n]);
    }
    // instrumental answers in the rests (octave-up for the male crooner's register)
    for (const f of src.fills) {
      if (f.beat < b0 || f.beat >= b0 + 4) continue;
      const tt = at(f.beat),
        d = Math.max(0.12, f.dur * b * 0.9),
        inst = this.fillInst;
      if (inst === "piano")
        I.sample(S.ctx, out, "piano", f.midi + 12, tt, d, 0.3);
      else if (inst === "vibes")
        I.sample(S.ctx, out, "vibes", f.midi + 12, tt, d, 0.34);
      else I.synth(S.ctx, out, inst, f.midi, tt, d, 0.22);
    }
  };
  /** "Ooh / aah" backing choir: three soft voices, voice-led chord tones, sustained under the bar. */
  SwingGen.prototype.choirBar = function (t, out, c1, c2, vowel, vel) {
    const pad = (c, tt, dur) => {
      const q = Q[c[1]] || Q.maj,
        croot = this.key + c[0];
      const tones = [q[1], q[2], q[3] !== undefined ? q[3] : 12];
      const v = tones.map((iv, i) => {
        let m = croot + iv;
        while (m < this.choirV[i] - 6) m += 12;
        while (m > this.choirV[i] + 6) m -= 12;
        return m;
      });
      v.sort((a, b) => a - b);
      this.choirV = v;
      v.forEach((m, i) =>
        I.synth(
          S.ctx,
          out,
          "croon",
          m,
          tt + i * 0.012,
          dur,
          vel * (i === 1 ? 0.85 : 1),
          { vowel },
        ),
      );
    };
    if (c2 !== c1) {
      pad(c1, t, this.barDur * 0.5);
      pad(c2, t + this.barDur * 0.5, this.barDur * 0.5);
    } else pad(c1, t, this.barDur * 0.98);
  };
  SwingGen.prototype.dispose = function () {
    if (this.singers) {
      this.singers.forEach((x) => x.s.dispose(0.2));
      this.singers = null;
    }
  };
  /** Arrangements are bar-indexed; only the comping voice-leading carries over, so a join restarts it cleanly. */
  SwingGen.prototype.seek = function () {
    this.voicing = [52, 56, 59, 62];
  };
  SwingGen.prototype.t8 = function (beat) {
    const b = Math.floor(beat),
      f = beat - b;
    return (b + (f === 0.5 ? this.swing : f)) * this.beat;
  };
  SwingGen.prototype.chord = function (barIdx, half) {
    const cs = this.chorus[barIdx % 32];
    return half && cs.length > 1 ? cs[1] : cs[0];
  };
