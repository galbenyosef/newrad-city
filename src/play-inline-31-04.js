// play-inline-31 04 — out
// Lines 815-1141 of readable/play-inline-31.pretty.js (statement-aligned).
  SwingGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx,
      r = this.r,
      b = this.beat;
    if (bar >= this.plan.length) {
      this.done = true;
      return this.barDur;
    }
    const P = this.plan[bar];
    let barIdx = P.sec === "intro" ? 28 + P.i : P.i; // intro = last 4 bars (turnaround)
    if (P.sec === "tag") barIdx = 31;
    const humanize = () => (r() - 0.5) * 0.012;
    // ------------------------------------ drums
    const fin = P.sec === "tag" && P.i === 1;
    if (fin) {
      I.drum(ctx, out, "crash", t, 0.3);
      I.drum(ctx, out, "kick", t, 0.3);
      I.drum(ctx, out, "ride", t, 0.3);
    } else {
      for (let q = 0; q < 4; q++) {
        const tq = t + q * b;
        if (this.brushes) {
          I.drum(
            ctx,
            out,
            "brush_swish",
            tq + humanize(),
            this.ballad ? 0.2 : 0.16,
          );
          if (q % 2 === 1) I.drum(ctx, out, "brush_tap", tq + humanize(), 0.28);
        } else {
          I.drum(ctx, out, "ride", tq + humanize(), q % 2 ? 0.32 : 0.26);
          if (q % 2 === 1) {
            I.drum(ctx, out, "ride", t + this.t8(q + 0.5) + humanize(), 0.16);
            I.drum(ctx, out, "hat", tq + humanize(), 0.25);
          }
          if (r() < 0.12)
            I.drum(ctx, out, "snare", t + this.t8(q + 0.5), 0.07 + r() * 0.06); // comping
        }
        I.drum(ctx, out, "kick", tq, 0.07); // feathered
      }
      if (P.i % 8 === 7 && !this.ballad && r() < 0.8) {
        // fill into next section
        for (let k = 0; k < 3; k++)
          I.drum(ctx, out, "snare", t + 3 * b + (k * b) / 3, 0.12 + k * 0.05);
      }
      if (P.i % 8 === 0 && P.sec !== "intro" && r() < 0.5)
        I.drum(ctx, out, "crash", t, 0.12);
    }
    // ------------------------------------ bass
    const c1 = this.chord(barIdx, false),
      c2 = this.chord(barIdx, true),
      nextC = this.chord((barIdx + 1) % 32, false);
    const k = this.key;
    const rootOf = (c) => {
      let m = k - 12 + c[0];
      while (m < 31) m += 12;
      while (m > 45) m -= 12;
      return m;
    };
    if (fin) I.sample(ctx, out, "bass", rootOf([0, "6"]), t, b * 3, 0.5);
    else if (this.ballad || (P.sec === "head" && P.i < 16 && !this.brushes)) {
      // two-feel
      I.sample(ctx, out, "bass", rootOf(c1), t, b * 1.8, 0.5);
      I.sample(
        ctx,
        out,
        "bass",
        c2 !== c1 ? rootOf(c2) : rootOf(c1) + 7,
        t + 2 * b,
        b * 1.8,
        0.42,
      );
    } else {
      // walking bass
      const walk = [];
      const cA = c1,
        cB = c2;
      const rA = rootOf(cA),
        rB = rootOf(cB),
        rN = rootOf(nextC);
      if (cA !== cB) {
        walk.push(rA, rA + (Q[cA[1]][1] || 4), rB, rN + (r() < 0.5 ? 1 : -1));
      } else {
        const q = Q[cA[1]] || Q.maj;
        const mid = r() < 0.5 ? [rA + q[1], rA + q[2]] : [rA + 2, rA + q[1]];
        walk.push(
          rA,
          mid[0],
          mid[1],
          rN +
            (r() < 0.6
              ? rN > mid[1]
                ? -1
                : 1
              : 7 - 12 * (rN + 7 > 47 ? 1 : 0)),
        );
      }
      walk.forEach((m, i) =>
        I.sample(
          ctx,
          out,
          "bass",
          clamp(m, 28, 52),
          t + i * b + humanize(),
          b * 0.95,
          i === 0 ? 0.55 : 0.45,
        ),
      );
    }
    // ------------------------------------ piano comping (rootless voicings, voice-led)
    const comp = (c, tt, dur, vel) => {
      const q = Q[c[1]] || Q.maj;
      const croot = k + c[0];
      const tones = [
        q[1],
        q[3] !== undefined ? q[3] : q[2],
        q[2] + (r() < 0.4 ? 2 : 0),
        q[4] !== undefined ? q[4] : 14,
      ];
      const v = tones.map((iv, i) => {
        let m = croot + iv;
        while (m < this.voicing[i] - 6) m += 12;
        while (m > this.voicing[i] + 6) m -= 12;
        return m;
      });
      v.sort((a, bb) => a - bb);
      this.voicing = v;
      v.forEach((m, i) =>
        I.sample(
          ctx,
          out,
          "piano",
          m,
          tt + i * 0.004,
          dur,
          vel * (i === 3 ? 0.7 : 1),
        ),
      );
    };
    if (P.sec !== "solo" || this.soloist !== "piano") {
      if (fin) comp([0, "6"], t, b * 3.5, 0.3);
      else if (this.ballad) {
        // arpeggiated / sustained
        const q = Q[c1[1]] || Q.maj;
        comp(c1, t, b * 2, 0.22);
        for (let i = 0; i < 4; i++)
          if (r() < 0.6)
            I.sample(
              ctx,
              out,
              "piano",
              k + 12 + c1[0] + q[i % q.length] + 12,
              t + this.t8(1 + i * 0.5),
              b,
              0.12,
            );
        if (c2 !== c1) comp(c2, t + 2 * b, b * 2, 0.2);
      } else {
        // Charleston-ish: 1 and "and of 2", sometimes anticipate
        comp(c1, t + humanize(), b * 0.6, 0.28 + r() * 0.08);
        if (r() < 0.8)
          comp(c2, t + this.t8(1.5) + humanize(), b * 0.45, 0.22 + r() * 0.08);
        if (r() < 0.25) comp(nextC, t + this.t8(3.5), b * 0.5, 0.18);
      }
    }
    // Freddie-Green rhythm guitar
    if (this.guitar && !this.ballad && !fin) {
      const q = Q[c1[1]] || Q.maj,
        gr = k + c1[0] - 12 + (k + c1[0] - 12 < 40 ? 12 : 0);
      for (let i = 0; i < 4; i++)
        [0, q[1], q[3] !== undefined ? q[3] : q[2]].forEach((iv, j) =>
          I.sample(
            ctx,
            out,
            "guitar",
            gr + iv + (j ? 12 : 0),
            t + i * b + j * 0.006,
            b * 0.35,
            0.09,
          ),
        );
    }
    // ------------------------------------ lead melody / solo
    const barStartBeat = barIdx * 4;
    const playLine = (notes, inst, vel, octave) => {
      for (const n of notes) {
        if (n.beat < barStartBeat || n.beat >= barStartBeat + 4) continue;
        const tt = t + this.t8(n.beat - barStartBeat) + humanize();
        const dur = Math.max(0.15, n.dur * b * 0.92);
        const m = n.midi + (octave || 0);
        if (inst === "piano")
          I.sample(ctx, out, "piano", m + 12, tt, dur, vel * 1.3);
        else if (inst === "vibes")
          I.sample(ctx, out, "vibes", m + 12, tt, dur, vel * 1.4);
        else
          I.synth(ctx, out, inst, m, tt, dur, vel, {
            vowel: n.beat % 8 < 4 ? "oo" : "a",
          });
      }
    };
    if (P.sec === "head" || P.sec === "out") {
      if (this.vocal && this.hooks && P.sec === "head" && P.i < 24)
        playLine(
          this.vocHead.notes,
          this.fillInst === "piano" || this.fillInst === "vibes"
            ? "clarinet"
            : this.fillInst,
          0.32,
        ); // hooks: the band carries the tune
      else if (this.vocal)
        this.singBar(t, out, P.sec, barIdx, (beat) =>
          chordAtBeat(this.chorus, beat),
        );
      else playLine(this.head, this.lead, 0.32);
      // backing choir: girl groups throughout, crooner ballads on the bridge and the out-chorus
      if (
        this.choir &&
        !fin &&
        (this.song.vocal === "group" ||
          P.sec === "out" ||
          (P.i >= 16 && P.i < 24) ||
          !this.vocal)
      ) {
        const bridge = P.i >= 16 && P.i < 24;
        this.choirBar(
          t,
          out,
          c1,
          c2,
          bridge ? "a" : "oo",
          this.song.vocal === "group" ? 0.055 : this.vocal ? 0.05 : 0.04,
        );
      }
      // horn backgrounds behind the last A of the out-chorus
      if (P.sec === "out" && P.i >= 24 && !this.ballad) {
        const q = Q[c1[1]] || Q.maj;
        [q[1], q[3] !== undefined ? q[3] : q[2]].forEach((iv, j) =>
          I.synth(
            ctx,
            out,
            j ? "clarinet" : "sax",
            k + 12 + c1[0] + iv,
            t,
            this.barDur * 0.95,
            0.08,
          ),
        );
      }
    } else if (P.sec === "solo") {
      playLine(this.solo, this.soloist, 0.28);
    } else if (P.sec === "intro") {
      // piano pickup figure
      const q = Q[c1[1]] || Q.maj;
      for (let i = 0; i < 4; i++)
        I.sample(
          ctx,
          out,
          "piano",
          k + 24 + c1[0] + q[(i + P.i) % q.length],
          t + this.t8(i),
          b * 0.8,
          0.2,
        );
    } else if (fin) {
      I.synth(
        ctx,
        out,
        this.lead === "piano" || this.lead === "vibes" ? "clarinet" : this.lead,
        k + 24 + (r() < 0.5 ? 9 : 4),
        t,
        b * 3.5,
        0.3,
      );
    }
    return fin ? this.barDur * 1.6 : this.barDur;
  };

  // ------------------------------------------------------------------
  // BOOGIE-WOOGIE / JUMP BLUES (12-bar)
  // ------------------------------------------------------------------
  function BoogieGen(song) {
    const r = S.rng(G.util.hashStr(song.title) ^ (song.seed || 0));
    this.r = r;
    this.song = song;
    this.tempo = song.tempo || 150 + r() * 40;
    this.beat = 60 / this.tempo;
    this.barDur = this.beat * 4;
    this.swing = 0.64;
    this.key = KEYS[song.key] || pick(r, [36, 41, 43, 46]);
    this.horns = song.horns !== undefined ? song.horns : r() < 0.6;
    this.blues = [0, 0, 0, 0, 5, 5, 0, 0, 7, 5, 0, 7];
    this.choruses = 5 + ((r() * 2) | 0);
    this.riffs = [0, 1, 2].map(() => {
      const n = [];
      let b = 0;
      while (b < 8) {
        const d = pick(r, [0.5, 0.5, 1, 1.5]);
        if (r() < 0.8)
          n.push({ beat: b, dur: d, iv: pick(r, [0, 3, 4, 7, 10, 12, 15]) });
        b += d;
      }
      return n;
    });
    this.done = false;
    this.bars = 2 + this.choruses * 12 + 1;
    // jump-blues vocal: AAB verses (line, line again, answer line), call-and-response with the band
    this.vocal =
      !!(
        song.vocal &&
        song.lyrics &&
        song.lyrics.blues &&
        S.vox &&
        S.vox.syllables
      ) && S.vocalMode !== "off";
    this.hooks = this.vocal && S.vocalMode === "hooks";
    if (this.vocal) {
      try {
        this.setupVocal(song);
      } catch (e) {
        G.reportError("sound:vocal", e);
        this.vocal = false;
      }
    }
  }
  BoogieGen.prototype.t8 = SwingGen.prototype.t8;
  /** Choruses 1, 2, 4, 5 are sung (verses 1–4); chorus 3 and any extra are the horn/piano break. */
