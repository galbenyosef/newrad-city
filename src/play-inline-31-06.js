// play-inline-31 06 — bar
// Lines 1458-1753 of readable/play-inline-31.pretty.js (statement-aligned).
  function MarchGen(song) {
    const r = S.rng(G.util.hashStr(song.title) ^ (song.seed || 0));
    this.r = r;
    this.tempo = song.tempo || 112 + r() * 12;
    this.beat = 60 / this.tempo;
    this.barDur = this.beat * 2; // 2/4
    this.key = KEYS[song.key] || pick(r, [46, 39, 41]);
    // strains: A (16 bars) I/V; B (16) with relative motion; Trio in IV
    const I_ = [0, "maj"],
      V7 = [7, "7"],
      IV = [5, "maj"],
      ii = [2, "min"],
      vi = [9, "min"],
      V_V = [2, "7"];
    const A = [I_, I_, V7, V7, V7, V7, I_, I_, I_, I_, IV, IV, I_, V7, I_, I_];
    const B = [
      vi,
      vi,
      V_V,
      V_V,
      V7,
      V7,
      I_,
      I_,
      IV,
      IV,
      I_,
      vi,
      ii,
      V7,
      I_,
      I_,
    ];
    const T = A.map((c) => [c[0] + 5, c[1]]);
    this.strains = [
      ["intro", 4],
      ["A", 16],
      ["A", 16],
      ["B", 16],
      ["T", 16],
      ["T", 16],
    ];
    this.harm = { A, B, T, intro: [V7, V7, V7, V7] };
    const mk = (name, chs) => {
      const fn = (beat) => chs[Math.floor(beat / 2) % chs.length];
      // march cells in 2/4: dotted figures & fanfare triplets (units: beats, 2 per bar)
      const cells = [
        [
          [0, 0.75],
          [0.75, 0.25],
          [1, 1],
        ],
        [
          [0, 1],
          [1, 0.5],
          [1.5, 0.5],
        ],
        [
          [0, 0.5],
          [0.5, 0.5],
          [1, 1],
        ],
        [[0, 2]],
        [
          [0, 0.33],
          [0.33, 0.33],
          [0.67, 0.33],
          [1, 1],
        ],
      ];
      const out = [];
      let p = this.key + 24 + pick(r, [4, 7]);
      for (let bar = 0; bar < 16; bar++) {
        const cell =
          bar % 4 === 3
            ? cells[3]
            : cells[(bar * 7 + name.length + ((r() * 2) | 0)) % 5];
        for (const n of cell) {
          const beat = bar * 2 + n[0],
            ch = fn(beat),
            croot = this.key + ch[0];
          const strong = n[0] === 0;
          let tgt = p + pick(r, [-2, -1, 1, 2, 3, 4, -3]);
          tgt = clamp(tgt, this.key + 19, this.key + 36);
          p = strong
            ? nearestIn(Q[ch[1]] || Q.maj, croot % 12, tgt)
            : nearestIn(SCALE_FOR.maj, this.key % 12, tgt);
          out.push({ beat, dur: n[1], midi: p });
        }
      }
      return out;
    };
    this.mel = { A: mk("A", A), B: mk("B", B), T: mk("T", T) };
    this.plan = [];
    for (const s of this.strains)
      for (let i = 0; i < s[1]; i++)
        this.plan.push({ s: s[0], i, first: i === 0 });
    this.plan.push({ s: "end", i: 0 });
    this.done = false;
  }
  MarchGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx,
      r = this.r,
      b = this.beat;
    if (bar >= this.plan.length) {
      this.done = true;
      return this.barDur;
    }
    const P = this.plan[bar];
    if (P.s === "end") {
      I.drum(ctx, out, "crash", t, 0.4);
      I.drum(ctx, out, "bass_march", t, 0.6);
      [0, 4, 7, 12].forEach((iv) =>
        I.synth(ctx, out, "brass", this.key + 12 + iv, t, b * 3, 0.4, {
          bright: 3200,
        }),
      );
      I.synth(
        ctx,
        out,
        "tuba",
        this.key - 12 + (this.key < 40 ? 12 : 0),
        t,
        b * 3,
        0.45,
      );
      return this.barDur * 2;
    }
    const chs = this.harm[P.s] || this.harm.A,
      c = chs[P.i % chs.length];
    const root = this.key + c[0],
      q = Q[c[1]] || Q.maj;
    const trio = P.s === "T";
    const loud = !(trio && bar < this.plan.length - 17);
    // drums: bass drum on 1, cymbal "crash" with it on strong bars, snare 8ths with rolls
    I.drum(ctx, out, "bass_march", t, loud ? 0.5 : 0.35);
    if (P.i % 2 === 0 && loud) I.drum(ctx, out, "crash", t, 0.12);
    I.drum(ctx, out, "bass_march", t + b, 0.3);
    const roll = P.i % 4 === 3;
    for (let s = 0; s < 4; s++)
      I.drum(
        ctx,
        out,
        "snare_march",
        t + (s * b) / 2,
        (s % 2 ? 0.14 : 0.22) * (loud ? 1 : 0.6),
      );
    if (roll)
      for (let s = 0; s < 8; s++)
        I.drum(ctx, out, "snare_march", t + b + (s * b) / 8, 0.1 + s * 0.012);
    // oom-pah: tuba on beats, horns on offbeats
    let tr = root - 12;
    while (tr < 34) tr += 12;
    while (tr > 46) tr -= 12;
    I.synth(ctx, out, "tuba", tr, t, b * 0.5, 0.45);
    I.synth(
      ctx,
      out,
      "tuba",
      tr + 7 - (tr + 7 > 48 ? 12 : 0),
      t + b,
      b * 0.5,
      0.4,
    );
    [q[1], q[2], 12].forEach((iv) => {
      I.synth(ctx, out, "brass", root + iv, t + b / 2, b * 0.3, 0.2, {
        bright: 2000,
      });
      I.synth(ctx, out, "brass", root + iv, t + b * 1.5, b * 0.3, 0.2, {
        bright: 2000,
      });
    });
    // melody: trumpets (+ piccolo obbligato in the final trio)
    const mel = this.mel[P.s];
    if (mel) {
      const bb = P.i * 2;
      for (const n of mel) {
        if (n.beat < bb || n.beat >= bb + 2) continue;
        const tt = t + (n.beat - bb) * b,
          d = n.dur * b * 0.88;
        I.synth(ctx, out, "trumpet", n.midi, tt, d, loud ? 0.3 : 0.2, {
          scoop: false,
        });
        if (loud)
          I.synth(ctx, out, "brass", n.midi - 12, tt, d, 0.18, {
            bright: 2600,
          });
        if (trio && loud && bar >= this.plan.length - 17)
          I.synth(
            ctx,
            out,
            "piccolo",
            n.midi + 12 + (r() < 0.3 ? 2 : 0),
            tt,
            d * 0.7,
            0.1,
          );
      }
    } else if (P.s === "intro") {
      [0, 4, 7].forEach((iv) =>
        I.synth(ctx, out, "brass", root + 12 + iv, t, b * 1.8, 0.3, {
          bright: 3000,
        }),
      );
    }
    return this.barDur;
  };

  // ------------------------------------------------------------------
  // CLASSICAL
  // ------------------------------------------------------------------
  function ClassicalGen(song) {
    const r = S.rng(G.util.hashStr(song.title) ^ (song.seed || 0));
    this.r = r;
    this.song = song;
    this.form = song.form || pick(r, ["sonata", "nocturne", "adagio", "waltz"]);
    const minor = song.minor !== undefined ? song.minor : r() < 0.45;
    this.mode = minor ? "harmonic" : "ionian";
    this.key = (KEYS[song.key] || pick(r, [36, 38, 40, 41, 43])) + 12;
    this.tempo =
      song.tempo ||
      { sonata: 100, nocturne: 62, adagio: 52, waltz: 150 }[this.form] +
        r() * 12;
    this.meter = this.form === "waltz" ? 3 : this.form === "nocturne" ? 6 : 4;
    this.beat = (60 / this.tempo) * (this.form === "nocturne" ? 0.5 : 1);
    this.barDur = this.beat * this.meter;
    // 8-bar periods: antecedent (half cadence) + consequent (authentic cadence), sequences
    const periods = minor
      ? [
          [0, 3, 4, 4, 0, 5, 4, 0],
          [0, 5, 3, 4, 0, 3, 4, 0],
          [5, 1, 4, 0, 5, 3, 4, 0],
        ]
      : [
          [0, 3, 4, 4, 0, 3, 4, 0],
          [0, 5, 1, 4, 0, 3, 4, 0],
          [0, 4, 5, 2, 3, 0, 4, 0],
        ];
    this.periods = [pick(r, periods), pick(r, periods)];
    this.len = song.bars || (this.form === "adagio" ? 24 : 32);
    this.melody = this.makeMelody();
    this.done = false;
    this.voices = [this.key - 12, this.key - 5, this.key, this.key + 4];
  }
  ClassicalGen.prototype.deg = function (d) {
    return S.deg(this.key, this.mode, d);
  };
  ClassicalGen.prototype.chordAt = function (bar) {
    const p = this.periods[Math.floor(bar / 8) % 2];
    return p[bar % 8];
  };
  ClassicalGen.prototype.makeMelody = function () {
    const r = this.r,
      notes = [],
      m = this.meter;
    let pos = 7 + pick(r, [2, 4]);
    for (let bar = 0; bar < this.len; bar++) {
      const d = this.chordAt(bar);
      const cad = bar % 8 === 7;
      const rhythm = cad
        ? [m]
        : m === 3
          ? pick(r, [[2, 1], [1, 1, 1], [3]])
          : m === 6
            ? pick(r, [
                [3, 3],
                [2, 1, 3],
                [1, 1, 1, 3],
              ])
            : pick(r, [
                [1, 1, 1, 1],
                [2, 1, 1],
                [1.5, 0.5, 2],
                [0.5, 0.5, 1, 2],
                [2, 2],
              ]);
      let b = 0;
      rhythm.forEach((dur, i) => {
        const strong = i === 0;
        if (strong) {
          const ct = [d, d + 2, d + 4].map((x) => x + 7);
          let best = ct[0];
          ct.forEach((x) => {
            for (const o of [-7, 0, 7])
              if (Math.abs(x + o - pos) < Math.abs(best - pos)) best = x + o;
          });
          pos = best;
        } else pos += pick(r, [-1, 1, 1, -1, 2, -2]);
        pos = clamp(pos, 5, 16);
        if (cad && bar % 16 === 15) pos = 7;
        notes.push({ beat: bar * m + b, dur, midi: this.deg(pos) });
        b += dur;
      });
    }
    return notes;
  };
