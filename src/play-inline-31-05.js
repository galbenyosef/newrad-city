// play-inline-31 05 — bar
// Lines 1142-1457 of readable/play-inline-31.pretty.js (statement-aligned).
  BoogieGen.prototype.setupVocal = function (song) {
    const verses = song.lyrics.blues,
      seed = G.util.hashStr(song.title + "/vox");
    this.choruses = Math.max(this.choruses, 5);
    this.bars = 2 + this.choruses * 12 + 1;
    const map = [0, 1, -1, 2, 3];
    this.verseOf = (c) =>
      c < map.length && map[c] >= 0 && verses[map[c]] ? map[c] : -1;
    if (this.hooks) {
      const v0 = this.verseOf;
      this.verseOf = (c) => (c === 0 || c === 4 ? v0(c) : -1);
    } // hooks: first & last verse sung, the rest horn breaks
    let T = this.key + 12;
    while (T < 50) T += 12;
    const lo = T - 2,
      hi = T + 10,
      k = this.key;
    const chordFn = (beat) => {
      const bar = Math.floor(beat / 4);
      const bi = bar < 2 ? 10 + bar : (bar - 2) % 12;
      return [this.blues[bi], "7"];
    };
    this.vnotes = [];
    for (let c = 0; c < this.choruses; c++) {
      const v = this.verseOf(c);
      if (v < 0) continue;
      const [la, lb] = verses[v],
        at = (2 + c * 12) * 4;
      const sylA = S.vox.syllables(la),
        sylB = S.vox.syllables(lb || la);
      const opts = (p) => ({ set: BLUES, fall: true, pc: { p }, tight: true });
      const a1 = lyricPhrase(
        S.rng(seed + v * 13),
        chordFn,
        k,
        lo,
        hi,
        sylA,
        at,
        12,
        opts(T + 10),
      );
      const a2 = lyricPhrase(
        S.rng(seed + v * 13),
        chordFn,
        k,
        lo,
        hi,
        sylA,
        at + 16,
        12,
        opts(T + 10),
      );
      const b1 = lyricPhrase(
        S.rng(seed + v * 13 + 5),
        chordFn,
        k,
        lo,
        hi,
        sylB,
        at + 32,
        12,
        opts(T + 7),
      );
      for (const [ph, text] of [
        [a1, la],
        [a2, la],
        [b1, lb || la],
      ]) {
        if (!ph.length) continue;
        ph[0].text = text;
        ph.forEach((n) => {
          n.phrase = ph;
        });
        this.vnotes.push(...ph);
      }
    }
    for (let i = 0; i < this.vnotes.length; i++)
      this.vnotes[i].next = this.vnotes[i].last
        ? null
        : this.vnotes[i + 1] || null;
  };
  BoogieGen.prototype.dispose = SwingGen.prototype.dispose;
  BoogieGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx,
      r = this.r,
      b = this.beat,
      k = this.key;
    if (bar >= this.bars) {
      this.done = true;
      return this.barDur;
    }
    const last = bar === this.bars - 1;
    const bi = bar < 2 ? 10 + bar : (bar - 2) % 12,
      chorus = Math.max(0, Math.floor((bar - 2) / 12));
    const off = last ? 0 : this.blues[bi];
    const root = k + off;
    // drums: shuffle
    for (let q = 0; q < 4; q++) {
      I.drum(ctx, out, q % 2 ? "snare" : "kick", t + q * b, q % 2 ? 0.22 : 0.3);
      I.drum(ctx, out, "ride", t + q * b, 0.18);
      I.drum(ctx, out, "ride", t + this.t8(q + 0.5), 0.12);
    }
    if (last) {
      I.drum(ctx, out, "crash", t, 0.3);
    }
    // left hand boogie ostinato (root-3-5-6-b7-6-5-3)
    const lh = [0, 4, 7, 9, 10, 9, 7, 4];
    if (!last)
      lh.forEach((iv, i) =>
        I.sample(
          ctx,
          out,
          "piano",
          root - 12 + iv,
          t + this.t8(i / 2),
          b * 0.45,
          i % 2 ? 0.28 : 0.36,
        ),
      );
    else I.sample(ctx, out, "piano", root - 12, t, b * 3, 0.4);
    I.sample(
      ctx,
      out,
      "bass",
      root - 24 + (root - 24 < 31 ? 12 : 0),
      t,
      b * 1.8,
      0.4,
    );
    I.sample(
      ctx,
      out,
      "bass",
      root - 17 + (root - 17 < 31 ? 12 : 0),
      t + 2 * b,
      b * 1.8,
      0.35,
    );
    // vocal: sing this bar's syllables; the band answers at the end of each 4-bar line
    const sung = this.vocal && !last && bar >= 2 && this.verseOf(chorus) >= 0;
    if (sung) {
      if (!this.singers) this.singers = makeSingers(this.song, out, t);
      const b0 = bar * 4,
        at = (beat) => t + this.t8(beat - b0);
      if (this.singers)
        for (const n of this.vnotes) {
          if (n.beat < b0 || n.beat >= b0 + 4) continue;
          const tt = at(n.beat);
          let dur = at(n.beat + n.dur) - tt;
          if (n.next)
            dur = Math.max(0.07, dur - S.vox.onsetDur(n.next.syl) * 0.9);
          else dur *= 0.95;
          for (const sg of this.singers)
            sg.s.note(
              tt,
              dur,
              n.midi,
              n.syl,
              (n.syl.stressed ? 1 : 0.92) * (this.song.vocalGain || 1.3),
              { legato: !n.last, breath: n.first, fall: n.last, scoop: true },
            ); // a shouter rides over the horns
          lyricCue(this, n, tt, b, n.phrase || [n]);
        }
    }
    // right hand riffs / horn riffs
    const riff = this.riffs[chorus % 3];
    const half = bi % 2;
    const horns = this.vocal
      ? (!sung && bar >= 2) || (sung && bi % 4 === 3 && this.horns)
      : this.horns && chorus % 2 === 1;
    if (!(sung && bi % 4 < 3))
      for (const n of riff) {
        if (n.beat < half * 4 || n.beat >= half * 4 + 4) continue;
        const tt = t + this.t8(n.beat - half * 4);
        const m = k + 12 + n.iv + (off === 5 && n.iv === 4 ? -1 : 0);
        if (horns) {
          I.synth(ctx, out, "sax", m, tt, n.dur * b * 0.9, 0.22);
          I.synth(ctx, out, "trumpet", m + 12, tt, n.dur * b * 0.9, 0.16);
        } else {
          I.sample(ctx, out, "piano", m + 12, tt, n.dur * b, 0.3);
          if (r() < 0.5)
            I.sample(
              ctx,
              out,
              "piano",
              m + 12 + (n.iv % 12 === 3 ? 4 : 3),
              tt + 0.01,
              n.dur * b,
              0.18,
            );
        }
      }
    return last ? this.barDur * 1.5 : this.barDur;
  };

  // ------------------------------------------------------------------
  // RHUMBA
  // ------------------------------------------------------------------
  function RhumbaGen(song) {
    const r = S.rng(G.util.hashStr(song.title) ^ (song.seed || 0));
    this.r = r;
    this.tempo = song.tempo || 100 + r() * 20;
    this.beat = 60 / this.tempo;
    this.barDur = this.beat * 4;
    this.key = KEYS[song.key] || pick(r, [38, 43, 45, 40]);
    this.prog = pick(r, [
      [
        [0, "min"],
        [5, "min"],
        [7, "7"],
        [0, "min"],
      ],
      [
        [0, "min"],
        [10, "7"],
        [8, "maj7"],
        [7, "7"],
      ],
    ]);
    this.lead = pick(r, ["trumpet", "clarinet", "mute"]);
    const chordFn = (beat) => this.prog[Math.floor(beat / 4) % 4];
    this.melA = melody8(
      r,
      chordFn,
      this.key,
      60,
      76,
      [(r() * CELLS.length) | 0, 5],
      true,
      0,
    );
    this.bars = 4 + 8 * 6;
    this.done = false;
  }
  RhumbaGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx,
      r = this.r,
      b = this.beat,
      e = b / 2;
    if (bar >= this.bars) {
      this.done = true;
      return this.barDur;
    }
    const c = this.prog[bar % 4],
      root = this.key + c[0],
      q = Q[c[1]] || Q.min;
    // clave 3-2
    const clave = bar % 2 === 0 ? [0, 3, 6] : [2, 4];
    clave.forEach((s) => I.drum(ctx, out, "clave", t + s * e, 0.25));
    // bongos martillo & maracas
    for (let s = 0; s < 8; s++) {
      I.drum(ctx, out, "maracas", t + s * e, s % 2 ? 0.08 : 0.12);
      I.drum(
        ctx,
        out,
        s % 4 === 3 ? "bongo_lo" : "bongo_hi",
        t + s * e,
        s % 2 ? 0.1 : 0.16,
      );
    }
    // tumbao bass (anticipated)
    I.sample(
      ctx,
      out,
      "bass",
      root - 12 + (root - 12 < 31 ? 12 : 0) + 7,
      t + 3 * e,
      e * 2,
      0.4,
    );
    I.sample(
      ctx,
      out,
      "bass",
      root - 12 + (root - 12 < 31 ? 12 : 0),
      t + 7 * e,
      e * 2,
      0.45,
    );
    // piano montuno
    const mont = [0, 2, 3, 5, 6];
    mont.forEach((s, i) =>
      [q[1], q[2], 12].forEach((iv, j) =>
        I.sample(
          ctx,
          out,
          "piano",
          root + 12 + iv,
          t + s * e + j * 0.004,
          e * 0.9,
          i % 2 ? 0.16 : 0.22,
        ),
      ),
    );
    // melody from bar 4
    if (bar >= 4) {
      const bb = ((bar - 4) % 8) * 4;
      for (const n of this.melA)
        if (n.beat >= bb && n.beat < bb + 4)
          I.synth(
            ctx,
            out,
            this.lead,
            n.midi,
            t + (n.beat - bb) * b,
            n.dur * b * 0.9,
            0.26,
          );
    }
    return this.barDur;
  };

  // ------------------------------------------------------------------
  // CONTINUITY MARCHES
  // ------------------------------------------------------------------
