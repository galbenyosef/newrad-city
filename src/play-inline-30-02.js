// play-inline-30 02 — ctx
// Lines 343-633 of readable/play-inline-30.pretty.js (statement-aligned).
  CombatGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx,
      r = this.r,
      st = this.step,
      root = this.root;
    const off = this.prog[bar % 4],
      cr = root + off;
    const minorChord =
      off === 0 || off === 5 || off === 7 ? [0, 3, 7] : [0, 4, 7];
    const lvl = Math.min(1, 0.55 + bar * 0.05);
    for (let s = 0; s < 16; s++) {
      const tt = t + s * st;
      const tv = this.taiko[s];
      if (tv)
        I.drum(ctx, out, s % 8 === 0 ? "taiko" : "tom_lo", tt, tv * 0.55 * lvl);
      if (bar >= 1 && (s === 4 || s === 12))
        I.drum(ctx, out, "snare_march", tt, 0.22 * lvl);
      if (bar >= 6 && s % 2 === 1) I.drum(ctx, out, "hat", tt, 0.08);
      // ostinato: pizzicato strings doubled an octave apart
      const o = this.osti[s];
      if (o !== null && o !== undefined) {
        const acc = s % 4 === 0 ? 1 : 0.65;
        I.sample(ctx, out, "pizz", cr + 12 + o, tt, st * 1.5, 0.38 * acc * lvl);
        if (bar >= 2)
          I.sample(ctx, out, "pizz", cr + 24 + o, tt, st, 0.18 * acc * lvl);
      }
    }
    // brass stabs & swells
    if (bar >= 2) {
      minorChord.forEach((iv) =>
        I.synth(ctx, out, "brass", cr + 12 + iv, t, st * 3, 0.45 * lvl, {
          bright: 2400,
        }),
      );
      if (bar % 2 === 1)
        minorChord.forEach((iv) =>
          I.synth(
            ctx,
            out,
            "brass",
            cr + 12 + iv,
            t + st * 10,
            st * 2,
            0.35 * lvl,
            { bright: 2000 },
          ),
        );
      I.synth(ctx, out, "brass", cr, t, this.barDur * 0.95, 0.35 * lvl, {
        bright: 900,
      });
    }
    // high strings line after escalation
    if (bar >= 8)
      I.synth(
        ctx,
        out,
        "strings",
        cr + 36 + pick(r, minorChord),
        t,
        this.barDur * 0.9,
        0.3,
        { att: 0.3, rel: 0.4, bright: 3500 },
      );
    if (bar % 2 === 1 && r() < 0.7)
      I.drum(ctx, out, "metal_hit", t + st * 12, 0.3 * lvl, 0.8 + r() * 0.4);
    if (bar % 4 === 3) this.riser(t, out);
    if (bar % 4 === 0 && bar > 0) I.drum(ctx, out, "crash", t, 0.25);
    return this.barDur;
  };
  CombatGen.prototype.riser = function (t, out) {
    const ctx = S.ctx,
      d = this.barDur;
    const n = ctx.createBufferSource();
    n.buffer = S.noiseBufs.white;
    n.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 2;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(5000, t + d);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + d * 0.97);
    g.gain.linearRampToValueAtTime(0, t + d);
    n.connect(f);
    f.connect(g);
    g.connect(out);
    n.start(t, Math.random());
    n.stop(t + d + 0.05);
  };

  /** DANGER — tension bed for hostile places. */
  function DangerGen(seed) {
    const r = S.rng(seed);
    this.r = r;
    this.root = 36 + ((r() * 6) | 0);
    this.barDur = 3.8;
    this.bars = 20 + ((r() * 10) | 0);
    this.done = false;
  }
  DangerGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx,
      r = this.r,
      B = this.barDur,
      root = this.root;
    if (bar >= this.bars) {
      this.done = true;
      return B;
    }
    // heartbeat pulse
    I.drum(ctx, out, "kick", t, 0.3);
    I.drum(ctx, out, "kick", t + 0.28, 0.18);
    I.drum(ctx, out, "kick", t + B / 2, 0.24);
    I.drum(ctx, out, "kick", t + B / 2 + 0.28, 0.14);
    if (bar % 2 === 0) {
      const cl = r() < 0.5 ? [12, 13, 19] : [12, 18, 19];
      cl.forEach((iv) =>
        I.synth(ctx, out, "pad", root + iv, t, B * 2 + 0.5, 0.18, {
          bright: 650,
          att: 2,
          rel: 3,
        }),
      );
      I.synth(ctx, out, "drone", root, t, B * 2 + 0.4, 0.3, {
        att: 1.5,
        rel: 3,
      });
    }
    if (bar % 4 === 1)
      I.synth(
        ctx,
        out,
        "strings",
        root + 36 + pick(r, [1, 0, 6]),
        t,
        B * 2,
        0.12,
        { att: 1.5, rel: 1.5, bright: 5000 },
      );
    if (r() < 0.3)
      I.synth(
        ctx,
        out,
        "bowedmetal",
        root + pick(r, [42, 43, 49]),
        t + r() * B,
        B,
        0.12,
        { att: 1, rel: 2 },
      );
    if (r() < 0.25)
      I.sample(
        ctx,
        out,
        "piano",
        root + pick(r, [0, 1, 12, 13]),
        t + r() * B,
        2.5,
        0.3,
      );
    if (r() < 0.12) I.drum(ctx, out, "metal_hit", t + r() * B, 0.14, 0.6);
    return B;
  };

  /** CRYO — clean, optimistic-but-sterile civil-defense pastel (the Long Winter facility). */
  function CryoGen(seed) {
    const r = S.rng(seed);
    this.r = r;
    this.tempo = 80 + r() * 10;
    this.beat = 60 / this.tempo;
    this.barDur = this.beat * 4;
    this.root = 53 + ((r() * 5) | 0);
    this.prog = pick(r, [
      [
        [0, "maj7"],
        [9, "m7"],
        [5, "maj7"],
        [7, "7sus"],
      ],
      [
        [0, "maj7"],
        [5, "maj7"],
        [2, "m7"],
        [7, "7"],
      ],
      [
        [0, "maj9"],
        [4, "m7"],
        [5, "maj7"],
        [7, "7sus"],
      ],
    ]);
    this.bars = 16 + ((r() * 8) | 0);
    this.done = false;
  }
  const Q = {
    maj7: [0, 4, 7, 11],
    maj9: [0, 4, 7, 11, 14],
    m7: [0, 3, 7, 10],
    7: [0, 4, 7, 10],
    "7sus": [0, 5, 7, 10],
    m6: [0, 3, 7, 9],
    6: [0, 4, 7, 9],
    dim7: [0, 3, 6, 9],
    m7b5: [0, 3, 6, 10],
    9: [0, 4, 7, 10, 14],
    m9: [0, 3, 7, 10, 14],
    aug: [0, 4, 8],
    maj: [0, 4, 7],
    min: [0, 3, 7],
  };
  S.CHORD_Q = Q;
  CryoGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx,
      r = this.r,
      b = this.beat;
    if (bar >= this.bars) {
      this.done = true;
      return this.barDur;
    }
    const ch = this.prog[bar % 4],
      cr = this.root + ch[0],
      q = Q[ch[1]];
    const fade = bar >= this.bars - 2 ? 0.5 : 1;
    // vibraphone arpeggio in 8ths (up & down)
    const arp = q.concat([12]).map((x) => cr + x);
    const seq = bar % 2 ? arp.slice().reverse() : arp;
    for (let i = 0; i < 8; i++)
      if (r() < 0.9)
        I.sample(
          ctx,
          out,
          "vibes",
          seq[i % seq.length] + (i >= seq.length ? 12 : 0),
          t + (i * b) / 2,
          b * 1.5,
          0.22 * fade * (i % 2 ? 0.7 : 1),
        );
    q.forEach((x) =>
      I.synth(ctx, out, "pad", cr + x - 12, t, this.barDur + 0.3, 0.14 * fade, {
        bright: 1400,
        att: 0.8,
        rel: 1.5,
      }),
    );
    I.sample(ctx, out, "bass", cr - 24, t, b * 1.8, 0.4 * fade);
    I.sample(ctx, out, "bass", cr - 17, t + b * 2, b * 1.8, 0.3 * fade);
    if (bar % 4 === 2 && r() < 0.6)
      I.synth(
        ctx,
        out,
        "flute",
        cr + 12 + pick(r, q),
        t + b,
        b * 2.5,
        0.12 * fade,
      );
    return this.barDur;
  };

  /** SETTLEMENT — warm fingerpicked Americana. */
  function SettlementGen(seed) {
    const r = S.rng(seed);
    this.r = r;
    this.tempo = 84 + r() * 12;
    this.beat = 60 / this.tempo;
    this.barDur = this.beat * 4;
    this.root = 43 + ((r() * 5) | 0);
    this.prog = pick(r, [
      [
        [0, "maj"],
        [5, "maj"],
        [9, "min"],
        [7, "maj"],
      ],
      [
        [0, "maj"],
        [10, "maj"],
        [5, "maj"],
        [0, "maj"],
      ],
      [
        [9, "min"],
        [5, "maj"],
        [0, "maj"],
        [7, "maj"],
      ],
    ]);
    this.bars = 16 + ((r() * 8) | 0);
    this.done = false;
  }
