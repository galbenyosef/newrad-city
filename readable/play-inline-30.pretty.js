/* src/sound/30_music.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 30_music.js
 * Adaptive, fully generative score (G.music).
 *
 * Moods / tracks:
 *   explore    — sparse, eerie score for the Ruins:
 *                modal string pads, low drones, lonely duduk/cello/piano
 *                phrases, bowed-metal textures, distant timpani. Plays for
 *                a minute or two, then leaves long silences.
 *   combat     — driving taiko ostinato, pizzicato/brass figures, metal
 *                hits, risers; escalates the longer the fight lasts.
 *   danger     — hostile locations & dungeons: heartbeat pulse, clusters,
 *                high string tension.
 *   cryo       — Project Long Winter retro-future: vibraphone arpeggios, soft pads.
 *   settlement — warm fingerpicked guitar, upright bass, harmonica.
 *   title      — a vintage 1940s-style ballad through a phonograph chain.
 *   ending     — elegiac piano & strings.
 * Mood is chosen automatically (game state, combat events, location,
 * interior) unless forced via G.music.play()/setMood(). The goggle
 * radio mutes non-combat music.
 * ===================================================================== */
(function () {
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
  SettlementGen.prototype.nextBar = function (t, out, bar) {
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
    // Travis picking: thumb alternates root/5th on beats, fingers on offbeats
    const lowR = cr - (cr > 47 ? 12 : 0);
    for (let i = 0; i < 4; i++) {
      I.sample(
        ctx,
        out,
        "guitar",
        i % 2 ? lowR + 7 : lowR,
        t + i * b,
        b * 1.2,
        0.3 * fade,
      );
      if (r() < 0.9)
        I.sample(
          ctx,
          out,
          "guitar",
          cr + 12 + q[(i + 1) % q.length],
          t + i * b + b / 2 + (r() - 0.5) * 0.02,
          b * 1.5,
          0.2 * fade,
        );
      if (i % 2 === 1 && r() < 0.5)
        I.sample(ctx, out, "guitar", cr + 12 + q[2], t + i * b, b, 0.14 * fade);
    }
    I.sample(ctx, out, "bass", lowR - 12, t, b * 1.8, 0.3 * fade);
    I.sample(ctx, out, "bass", lowR - 5, t + b * 2, b * 1.8, 0.22 * fade);
    if (bar % 2 === 0)
      q.forEach((x) =>
        I.synth(ctx, out, "pad", cr + x, t, this.barDur * 2, 0.08 * fade, {
          bright: 1200,
          att: 1,
          rel: 2,
        }),
      );
    // harmonica phrase every 8 bars (pentatonic)
    if (bar % 8 === 4) {
      const pent = [0, 2, 4, 7, 9, 12];
      let tt = t,
        p = (r() * 3) | 0;
      for (let i = 0; i < 6; i++) {
        const d = pick(r, [b / 2, b, b * 1.5]);
        I.synth(
          ctx,
          out,
          "reed",
          this.root + 12 + pent[p],
          tt,
          d * 0.9,
          0.18 * fade,
        );
        tt += d;
        p = Math.max(0, Math.min(5, p + pick(r, [-1, 1, 1, -2])));
      }
    }
    if (r() < 0.4)
      for (let i = 0; i < 4; i++)
        I.drum(ctx, out, "maracas", t + i * b + b / 2, 0.06);
    return this.barDur;
  };

  S.musicGens = { ExploreGen, CombatGen, DangerGen, CryoGen, SettlementGen };

  // ------------------------------------------------------------------
  // Engine
  // ------------------------------------------------------------------
  const M = (S.music = {
    cue: null,
    mood: "none",
    forced: null,
    inCombat: false,
    lastCombatActivity: -1e9,
    restUntil: 0,
    suppressUntil: 0,
    radioOn: false,
    seed: (Date.now() & 0xffff) ^ 0x5a5a,
  });
  function makeGen(track) {
    const seed = ++M.seed * 7919;
    const night =
      G.atmos && !G.isStub("atmos") && G.atmos.isNight
        ? !!G.atmos.isNight()
        : G.time.hour < 6 || G.time.hour > 20;
    switch (track) {
      case "explore":
        return new ExploreGen(seed, { night });
      case "combat":
        return new CombatGen(seed);
      case "danger":
        return new DangerGen(seed);
      case "cryo":
        return new CryoGen(seed);
      case "settlement":
        return new SettlementGen(seed);
      case "ending":
        return new ExploreGen(seed, {
          mode: "ionian",
          lead: "piano",
          bars: 40,
          melodyChance: 0.9,
          brightPad: 1500,
          barDur: 4,
        });
      case "title":
        return S.songs && S.songs.titleGen
          ? S.songs.titleGen()
          : new ExploreGen(seed, { mode: "aeolian", lead: "piano", bars: 64 });
      default:
        return null;
    }
  }
  const TRACK_GAIN = {
    explore: 0.65,
    combat: 0.6,
    danger: 0.75,
    cryo: 1.1,
    settlement: 1.9,
    title: 0.65,
    ending: 0.7,
  };
  const NEEDS = {
    explore: ["piano", "drums"],
    combat: ["drums", "pizz"],
    danger: ["drums", "piano"],
    cryo: ["vibes", "bass"],
    settlement: ["guitar", "bass", "drums"],
    ending: ["piano", "drums"],
    title: ["piano", "bass", "drums"],
  };
  function startTrack(track, fadeIn) {
    if (!S.ctx || !S.bus) return;
    const gen = makeGen(track);
    if (!gen) return;
    const c = new Cue(track, gen, {
      reverb: track === "combat" ? 0.25 : track === "title" ? 0.15 : 0.55,
    });
    c.out.gain.value = TRACK_GAIN[track] || 1;
    c.start(S.ctx.currentTime + 0.1, fadeIn);
    M.cue = c;
    applyLevels(true);
  }
  function stopCurrent(fade) {
    if (M.cue) {
      M.cue.stop(fade);
      M.cue = null;
    }
  }
  /** Level of the current cue given radio state. */
  function applyLevels(instant) {
    if (!M.cue) return;
    const radio =
      G.radio &&
      G.radio.isOn &&
      !G.isStub("radio") &&
      G.radio.isOn() &&
      (!S.radioPresence || S.radioPresence() > 0.08);
    let v = 1;
    if (radio) v = M.cue.id === "combat" ? 0.55 : 0;
    // a jukebox playing nearby (the Rad Room) takes the place of the score, like a radio set
    else if (
      S.jukeboxPresence &&
      M.cue.id !== "combat" &&
      M.cue.id !== "title" &&
      S.jukeboxPresence() > 0.12
    )
      v = 0;
    if (M.cue.id === "title" && stateCat() !== "menu")
      v = M.forced === "title" ? 1 : 0;
    M.cue.setLevel(v, instant ? 0.05 : 0.8);
  }

  /** Stingers straight into the music bus. */
  M.stinger = function (name) {
    const ctx = S.ctx;
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime + 0.03,
      out = S.bus.musicIn;
    const root = 38;
    if (name === "combat_start") {
      I.drum(ctx, out, "taiko", t, 0.9);
      I.drum(ctx, out, "crash", t, 0.35);
      I.drum(ctx, out, "metal_hit", t, 0.4);
      [0, 3, 7, 12].forEach((iv) =>
        I.synth(ctx, out, "brass", root + 12 + iv, t, 0.6, 0.55, {
          bright: 3000,
        }),
      );
      I.synth(ctx, out, "brass", root, t, 0.9, 0.5, { bright: 900 });
    } else if (name === "combat_end") {
      I.timpani(ctx, out, root, t, 0.5);
      [0, 7, 15].forEach((iv) =>
        I.synth(ctx, out, "strings", root + 12 + iv, t, 3, 0.35, {
          att: 0.6,
          rel: 2,
        }),
      );
    } else if (name === "death") {
      I.timpani(ctx, out, root - 2, t, 0.8);
      I.drum(ctx, out, "taiko", t, 0.6);
      [0, 1, 6].forEach((iv) =>
        I.synth(ctx, out, "brass", root + iv, t, 2.5, 0.45, { bright: 800 }),
      );
      [12, 13].forEach((iv) =>
        I.synth(ctx, out, "strings", root + 24 + iv, t + 0.5, 3.5, 0.25, {
          att: 1.5,
          rel: 2.5,
        }),
      );
    } else if (name === "discover") {
      I.timpani(ctx, out, root, t, 0.3);
    }
  };

  function nearestInterior(p) {
    const L = G.LAYOUT;
    let best = null,
      bd = 1e9;
    for (const k in L.INTERIORS) {
      const o = L.INTERIORS[k].origin;
      const d = Math.hypot(p.x - o.x, p.z - o.z);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best;
  }
  M.nearestInterior = nearestInterior;
  // interiors whose owning location is not linked through LOCATIONS[].interior
  const INTERIOR_LOC = {
    empire_lobby: "empire_state",
    liberty_pedestal: "liberty",
  };
  /**
   * Mood for an interior cell: Cryo Unit C-9 → cryo; otherwise the owning LOCATIONS entry decides (hostile → danger,
   * settlement → settlement). Flags on the INTERIORS entry itself (hostile/type/mood, e.g. set by quests for their
   * spare cells) win. Unknown / friendly interiors → explore (never tense music in a safe room).
   */
  function interiorMood(key) {
    if (S.isStartLab(key)) return "cryo";
    const L = G.LAYOUT,
      def = (L.INTERIORS && L.INTERIORS[key]) || {};
    if (def.mood) return def.mood;
    if (def.hostile === true) return "danger";
    if (def.type === "settlement" || def.hostile === false)
      return def.type === "settlement" ? "settlement" : "explore";
    const loc =
      (L.LOCATIONS || []).find(
        (l) => l.interior === key || l.id === INTERIOR_LOC[key],
      ) || (L.LOCATIONS || []).find((l) => l.id === key);
    if (loc)
      return loc.hostile
        ? "danger"
        : loc.type === "settlement"
          ? "settlement"
          : "explore";
    return "explore";
  }
  M.interiorMood = interiorMood;
  function detectMood() {
    const st = G.state;
    if (st === "title" || st === "chargen" || st === "loading") return "title";
    if (st === "dead") return "none";
    const now = G.time.real;
    if (M.inCombat && now - M.lastCombatActivity > 50) M.inCombat = false; // safety timeout
    if (M.inCombat) return "combat";
    // fallback: enemies actively hunting the player ([DANGER]) even if no combatStart was emitted
    try {
      if (
        G.combat &&
        !G.isStub("combat") &&
        G.combat.detection &&
        G.combat.detection() === "danger"
      ) {
        M.dangerT = (M.dangerT || 0) + 0.5;
        if (M.dangerT >= 1.5) return "combat";
      } else M.dangerT = 0;
    } catch (e) {
      M.dangerT = 0;
    }
    const p = G.player && G.player.pos;
    if (!p || !G.LAYOUT) return "explore";
    if (G.LAYOUT.isInterior(p.x)) return interiorMood(nearestInterior(p));
    const loc = G.LAYOUT.locationAt(p.x, p.z);
    if (loc) {
      if (!loc.hostile && loc.type === "settlement") return "settlement";
      if (loc.hostile && loc.type !== "landmark") return "danger";
    }
    return "explore";
  }
  M.detectMood = detectMood;
  function stateCat() {
    const s = G.state;
    return s === "title" || s === "chargen" || s === "loading"
      ? "menu"
      : "world";
  }
  M.clearForced = function () {
    M.forced = null;
    M.forcedHard = false;
  };
  function restFor(mood) {
    const r = Math.random();
    switch (mood) {
      case "explore":
        return 25 + r * 50;
      case "danger":
        return 15 + r * 20;
      case "cryo":
      case "settlement":
        return 12 + r * 15;
      case "title":
        return 2.5;
      default:
        return 4;
    }
  }

  let tickAcc = 0;
  M.update = function (realDt) {
    const ctx = S.ctx;
    if (!ctx || !S.bus) return;
    if (ctx.state !== "running") return;
    const now = ctx.currentTime;
    // scheduling
    if (M.cue) M.cue.tick(now, now + 1.2);
    tickAcc += realDt;
    if (tickAcc < 0.5) return;
    tickAcc = 0;
    // mood logic. Overrides: play() holds until the game switches between menu and world (or stop()/newGame);
    // setMood() is a *hint* that lasts until the automatically detected mood changes (or 4 minutes pass).
    const auto = G.time.real < M.suppressUntil ? "none" : detectMood();
    if (M.forced) {
      if (M.forcedHard) {
        if (stateCat() !== M.forcedCat) M.forced = null;
      } else if (auto !== M.forcedAuto || G.time.real > M.forcedUntil)
        M.forced = null;
    }
    // combat always pre-empts a forced track (except the title theme and the ending); the forced track
    // comes back after the fight (combat_end stinger, a short rest, then the forced cue restarts)
    const combatOverride =
      auto === "combat" &&
      M.forced &&
      M.forced !== "title" &&
      M.forced !== "ending";
    const want = combatOverride ? "combat" : M.forced || auto;
    const have = M.cue ? M.cue.id : "none";
    if (want !== M.mood) {
      const prev = M.mood;
      M.mood = want;
      if (prev === "combat" && want !== "combat") {
        M.stinger("combat_end");
        stopCurrent(3);
        M.restUntil = G.time.real + 6 + Math.random() * 8;
      } else if (want === "combat") {
        M.stinger("combat_start");
        stopCurrent(1.2);
        startTrack("combat", 0.4);
      } else if (want === "none") stopCurrent(prev === "title" ? 2.5 : 3);
      else {
        stopCurrent(prev === "title" ? 2 : 4);
        M.restUntil =
          G.time.real + (prev === "title" ? 4 : want === "explore" ? 3 : 1);
      }
    }
    // a cue that ended by itself leaves a stretch of silence before the next one
    if (M.cue && M.cue.stopped) {
      if (M.cue.gen.done) M.restUntil = G.time.real + restFor(want);
      M.cue = null;
    }
    if (!M.cue && want !== "none" && G.time.real >= M.restUntil) {
      if (NEEDS[want] && !I.allReady(NEEDS[want])) {
        NEEDS[want].forEach(I.ensure);
        return;
      }
      startTrack(want, want === "explore" ? 6 : want === "combat" ? 0.4 : 2.5);
    }
    void have;
    applyLevels(false);
  };
  M.combatActivity = function () {
    M.lastCombatActivity = G.time.real;
  };

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  const TRACKS = [
    "title",
    "explore",
    "combat",
    "cryo",
    "settlement",
    "danger",
    "ending",
  ];
  G.music = {
    /** Force a track: 'title'|'explore'|'combat'|'cryo'|'settlement'|'danger'|'ending'. */
    play(trackId) {
      if (!TRACKS.includes(trackId)) {
        S.warnOnce("mtrack:" + trackId, "unknown music track " + trackId);
        return;
      }
      M.forced = trackId;
      M.forcedHard = true;
      M.forcedCat = stateCat();
      M.restUntil = 0;
      M.suppressUntil = 0;
      if (M.mood === "combat" && trackId !== "title" && trackId !== "ending")
        return; // takes over after the fight
      if (M.cue && M.cue.id !== trackId) stopCurrent(2);
      M.mood = trackId;
      if (!M.cue || M.cue.stopped) {
        M.cue = null;
        if (S.ctx && S.ctx.state === "running") startTrack(trackId, 2);
      }
    },
    /** Stop the music (automatic music resumes after a short while). */
    stop() {
      M.clearForced();
      stopCurrent(2.5);
      M.suppressUntil = G.time.real + 20;
      M.mood = "none";
    },
    /** 'explore'|'combat'|'cryo'|'settlement'|'title'|'danger' forces a mood; 'auto'/null returns to automatic. */
    setMood(m) {
      if (!m || m === "auto") {
        M.clearForced();
        return;
      }
      if (!TRACKS.includes(m)) return;
      if (M.forcedHard && M.forced === m) return;
      M.forced = m;
      M.forcedHard = false;
      M.forcedAuto = detectMood();
      M.forcedUntil = G.time.real + 240;
      if (m !== M.mood) M.restUntil = 0;
    },
    mood() {
      return M.mood;
    },
    current() {
      return {
        track: M.cue ? M.cue.id : null,
        mood: M.mood,
        forced: M.forced,
        inCombat: M.inCombat,
      };
    },
    stinger(name) {
      M.stinger(name);
    },
    tracks() {
      return TRACKS.slice();
    },
  };
})();
