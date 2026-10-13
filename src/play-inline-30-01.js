// play-inline-30 01 — ctx
// Lines 24-342 of readable/play-inline-30.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;
  const I = S.inst;
  const mtof = S.mtof;

  const MODES = {
    aeolian: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    harmonic: [0, 2, 3, 5, 7, 8, 11],
    ionian: [0, 2, 4, 5, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
  };
  S.MODES = MODES;
  /** midi of scale degree d (can exceed 7 / be negative) */
  function deg(root, mode, d) {
    const m = MODES[mode];
    const o = Math.floor(d / 7);
    const i = ((d % 7) + 7) % 7;
    return root + o * 12 + m[i];
  }
  S.deg = deg;
  function chordTones(root, mode, d, n) {
    const out = [];
    for (let i = 0; i < (n || 3); i++) out.push(deg(root, mode, d + i * 2));
    return out;
  }

  // ------------------------------------------------------------------
  // Cue: a generator hosted on its own gain stage (fade + level)
  // ------------------------------------------------------------------
  function Cue(id, gen, opts) {
    const ctx = S.ctx;
    this.id = id;
    this.gen = gen;
    this.opts = opts || {};
    this.fade = ctx.createGain();
    this.level = ctx.createGain();
    this.fade.gain.value = 0;
    this.out = ctx.createGain(); // generators connect here
    this.out.connect(this.fade);
    this.fade.connect(this.level);
    this.level.connect(this.opts.dest || S.bus.musicIn);
    this.send = ctx.createGain();
    this.send.gain.value =
      this.opts.reverb === undefined ? 0.5 : this.opts.reverb;
    this.level.connect(this.send);
    this.send.connect(this.opts.revDest || S.bus.musicRevSend);
    this.nextT = 0;
    this.bar = 0;
    this.stopped = false;
    this.done = false;
  }
  Cue.prototype.start = function (t, fadeIn) {
    this.nextT = t;
    this.startT = t;
    this.fade.gain.setValueAtTime(0.0001, t);
    this.fade.gain.linearRampToValueAtTime(1, t + (fadeIn || 1.5));
  };
  Cue.prototype.tick = function (now, horizon) {
    if (this.stopped) return;
    if (this.nextT < now - 0.05) this.nextT = now + 0.05; // recovered from a stall
    let guard = 0;
    while (this.nextT < horizon && !this.gen.done && guard++ < 4) {
      const d = this.gen.nextBar(this.nextT, this.out, this.bar);
      this.bar++;
      this.nextT += d;
    }
    if (this.gen.done && now > this.nextT) this.stop(0.5);
  };
  Cue.prototype.stop = function (fade) {
    if (this.stopped) return;
    this.stopped = true;
    const ctx = S.ctx,
      t = ctx.currentTime,
      f = fade === undefined ? 2.5 : fade;
    this.fade.gain.cancelScheduledValues(t);
    this.fade.gain.setValueAtTime(this.fade.gain.value, t);
    this.fade.gain.linearRampToValueAtTime(0.0001, t + f);
    this.endT = t + f;
    const self = this;
    setTimeout(
      () => {
        try {
          self.level.disconnect();
          self.send.disconnect();
          if (self.gen.dispose) self.gen.dispose();
        } catch (e) {
          /* */
        }
        self.done = true;
      },
      (f + 6) * 1000,
    );
  };
  /** Join the arrangement at `bar` (radio tune-in mid-record). Generators with internal cursors expose seek(bar). */
  Cue.prototype.seek = function (bar) {
    this.bar = Math.max(0, bar | 0);
    if (this.gen.seek) {
      try {
        this.gen.seek(this.bar);
      } catch (e) {
        /* */
      }
    }
  };
  Cue.prototype.setLevel = function (v, tau) {
    const t = S.ctx.currentTime;
    this.level.gain.setTargetAtTime(v, t, tau || 0.6);
  };
  S.Cue = Cue;

  // ------------------------------------------------------------------
  // Generators
  // ------------------------------------------------------------------
  const pick = (r, arr) => arr[(r() * arr.length) | 0];

  /** EXPLORE — spacious modal score. */
  function ExploreGen(seed, o) {
    const r = S.rng(seed);
    o = o || {};
    const night = !!o.night;
    this.mode =
      o.mode ||
      pick(
        r,
        night
          ? ["phrygian", "aeolian", "harmonic"]
          : ["aeolian", "dorian", "aeolian", "phrygian", "harmonic"],
      );
    this.root = o.root || 36 + ((r() * 8) | 0);
    this.barDur = o.barDur || 4.6 + r() * 0.8;
    const progs = {
      aeolian: [
        [0, 5, 3, 4],
        [0, 6, 5, 6],
        [0, 3, 5, 4],
        [0, 5, 6, 4],
      ],
      dorian: [
        [0, 3, 0, 6],
        [0, 1, 3, 0],
      ],
      phrygian: [
        [0, 1, 0, 6],
        [0, 1, 5, 1],
      ],
      harmonic: [
        [0, 5, 1, 4],
        [0, 3, 4, 0],
      ],
      ionian: [
        [0, 5, 3, 4],
        [0, 3, 0, 4],
      ],
      mixolydian: [[0, 6, 3, 0]],
      lydian: [[0, 1, 0, 4]],
    };
    this.prog = pick(r, progs[this.mode] || progs.aeolian);
    this.lead =
      o.lead ||
      pick(r, ["cello", "duduk", "piano", "clarinet", "cello", "piano"]);
    this.bars = o.bars || 12 + ((r() * 10) | 0);
    this.melodyChance =
      o.melodyChance === undefined ? (night ? 0.4 : 0.6) : o.melodyChance;
    this.r = r;
    this.done = false;
    this.brightPad = o.brightPad || (night ? 700 : 1000);
    this.intensity = o.intensity || 1;
  }
  ExploreGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx,
      r = this.r,
      B = this.barDur,
      root = this.root,
      mode = this.mode;
    if (bar >= this.bars) {
      this.done = true;
      return B;
    }
    const chordIdx = Math.floor(bar / 2) % this.prog.length,
      d = this.prog[chordIdx];
    const newChord = bar % 2 === 0;
    const fadeOut = bar >= this.bars - 2 ? 0.6 : 1;
    if (newChord) {
      // pad voicing (open, with a 9th sometimes)
      const tones = chordTones(root + 12, mode, d, r() < 0.4 ? 4 : 3).map(
        (m) => (m < root + 14 ? m + 12 : m),
      );
      // lower voices: warm pad; upper voices: bowed string section (vibrato) — reads as an orchestra, not a synth
      tones.forEach((m, i) => {
        if (i < 2)
          I.synth(
            ctx,
            out,
            "pad",
            m,
            t + i * 0.08,
            B * 2 + 0.6,
            0.2 * fadeOut,
            { bright: this.brightPad, att: 1.8, rel: 3 },
          );
        else
          I.synth(
            ctx,
            out,
            "strings",
            m,
            t + i * 0.12,
            B * 2 + 0.4,
            0.3 * fadeOut,
            { att: 1.6, rel: 2.6, bright: this.brightPad * 1.7 },
          );
      });
      // drone on the chord root (low)
      I.synth(
        ctx,
        out,
        "drone",
        deg(root, mode, d) - (deg(root, mode, d) > root + 5 ? 12 : 0),
        t,
        B * 2 + 0.3,
        0.2 * fadeOut,
        { att: 2.2, rel: 3.5, bright: 260 },
      );
      // lonely melodic phrase
      if (bar > 0 && r() < this.melodyChance && bar < this.bars - 2)
        this.phrase(t + B * (0.1 + r() * 0.4), out, d, B * 1.3);
      // distant timpani/taiko at phrase starts
      if (bar % 8 === 0 && r() < 0.7) {
        I.timpani(ctx, out, root, t + 0.02, 0.35);
        if (r() < 0.4) I.drum(ctx, out, "taiko", t + 0.02, 0.18);
      }
    }
    // sparkles & textures
    if (r() < 0.3) {
      const n = 1 + ((r() * 3) | 0);
      for (let i = 0; i < n; i++)
        I.sample(
          ctx,
          out,
          "piano",
          deg(root + 36, mode, d + pick(r, [0, 2, 4, 6, 7])),
          t + r() * B,
          3,
          0.1 * fadeOut,
        );
    }
    if (r() < 0.22)
      I.synth(
        ctx,
        out,
        "bowedmetal",
        deg(root + 36, mode, d + pick(r, [0, 4])),
        t + r() * B * 0.5,
        B * 1.2,
        0.14 * fadeOut,
        { att: 1.5, rel: 2.5 },
      );
    return B;
  };
  ExploreGen.prototype.phrase = function (t, out, d, span) {
    const ctx = S.ctx,
      r = this.r,
      n = 3 + ((r() * 4) | 0);
    let pos = d + pick(r, [0, 2, 4]) + 14; // two octaves up in scale degrees
    let tt = t;
    const durs = [0.55, 0.8, 1.1, 1.5, 2.0];
    for (let i = 0; i < n && tt < t + span; i++) {
      const last = i === n - 1;
      const dur = last ? 2.2 + r() * 1.5 : pick(r, durs);
      const m = deg(this.root, this.mode, pos);
      if (this.lead === "piano") I.sample(ctx, out, "piano", m, tt, dur, 0.36);
      else
        I.synth(
          ctx,
          out,
          this.lead,
          m - (this.lead === "cello" ? 12 : 0),
          tt,
          dur * 0.95,
          this.lead === "clarinet" ? 0.22 : 0.28,
          { glide: i > 0 && r() < 0.3 ? m - 2 : null },
        );
      tt += dur;
      pos += r() < 0.7 ? pick(r, [-1, 1, -1, -2]) : pick(r, [2, 3, -3]);
    }
  };

  /** COMBAT — driving percussion & ostinati. */
  const TAIKO = [
    [1, 0, 0, 0.5, 0, 0, 0.8, 0, 1, 0, 0.5, 0, 0.8, 0, 0.6, 0],
    [1, 0, 0.4, 0, 0.8, 0, 0, 0.5, 1, 0, 0.4, 0, 0.8, 0.5, 0.6, 0.5],
    [1, 0, 0, 0.6, 0, 0.6, 0, 0, 1, 0, 0, 0.6, 0, 0.6, 0.8, 0.8],
  ];
  const OSTI = [
    [0, 0, 12, 0, 7, 0, 12, 0, 0, 0, 12, 0, 8, 0, 7, 0],
    [0, 12, 0, 0, 12, 0, 1, 0, 0, 12, 0, 0, 7, 0, 5, 3],
    [0, 0, 7, 0, 0, 8, 0, 7, 0, 0, 7, 0, 12, 10, 8, 7],
  ];
  function CombatGen(seed) {
    const r = S.rng(seed);
    this.r = r;
    this.tempo = 110 + r() * 18;
    this.root = 38 + ((r() * 5) | 0);
    this.step = 60 / this.tempo / 4;
    this.barDur = this.step * 16;
    this.prog = pick(r, [
      [0, 8, 10, 0],
      [0, 5, 1, 7],
      [0, 8, 5, 7],
      [0, 3, 8, 7],
    ]);
    this.taiko = pick(r, TAIKO);
    this.osti = pick(r, OSTI);
    this.done = false;
  }
