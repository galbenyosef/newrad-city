// play-inline-31 07 — ctx
// Lines 1754-2000 of readable/play-inline-31.pretty.js (statement-aligned).
  ClassicalGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx,
      r = this.r,
      b = this.beat,
      m = this.meter;
    const total = this.len * 2; // play the period twice (second time varied)
    if (bar >= total + 1) {
      this.done = true;
      return this.barDur;
    }
    if (bar === total) {
      // final chord
      [0, 2, 4, 7].forEach((d) => {
        const mm = this.deg(d) - 12;
        if (this.form === "adagio")
          I.synth(ctx, out, "strings", mm, t, b * 4, 0.35, {
            att: 0.5,
            rel: 1.5,
          });
        else I.sample(ctx, out, "piano", mm, t, b * 4, 0.3);
      });
      I.sample(ctx, out, "piano", this.deg(-7), t, b * 4, 0.3);
      return this.barDur * 2;
    }
    const lb = bar % this.len,
      second = bar >= this.len;
    const d = this.chordAt(lb);
    const triad = [d, d + 2, d + 4].map((x) => this.deg(x));
    const bassN = this.deg(d) - 12;
    if (this.form === "sonata") {
      // Alberti bass: low-high-mid-high in 8ths
      const al = [triad[0] - 12, triad[2] - 12, triad[1] - 12, triad[2] - 12];
      for (let i = 0; i < 8; i++)
        I.sample(ctx, out, "piano", al[i % 4], t + (i * b) / 2, b / 2, 0.16);
    } else if (this.form === "nocturne") {
      const arp = [bassN, bassN + 7, triad[1], triad[2], triad[1], bassN + 12];
      for (let i = 0; i < 6; i++)
        I.sample(ctx, out, "piano", arp[i], t + i * b, b * 3, i ? 0.12 : 0.2);
    } else if (this.form === "waltz") {
      I.sample(ctx, out, "piano", bassN, t, b, 0.28);
      I.sample(ctx, out, "pizz", bassN, t, b, 0.3);
      [1, 2].forEach((q) =>
        triad.forEach((mm) =>
          I.synth(ctx, out, "strings", mm - 12, t + q * b, b * 0.6, 0.12, {
            att: 0.03,
            rel: 0.2,
          }),
        ),
      );
    } else {
      // adagio chorale: four voices voice-led to chord tones
      const tones = [this.deg(d) - 12, triad[0], triad[1], triad[2]];
      const v = this.voices.map((cur, i) => {
        if (i === 0) return tones[0] + (tones[0] - cur > 6 ? -12 : 0);
        let best = cur,
          bd = 99;
        for (const tt of tones)
          for (const o of [-12, 0, 12]) {
            const c = tt + o;
            if (Math.abs(c - cur) < bd) {
              bd = Math.abs(c - cur);
              best = c;
            }
          }
        return best;
      });
      this.voices = v;
      v.forEach((mm, i) =>
        I.synth(
          ctx,
          out,
          i === 0 ? "cello" : "strings",
          mm,
          t,
          this.barDur * 1.02,
          i === 0 ? 0.22 : 0.26,
          { att: 0.5, rel: 0.8, bright: 2200 },
        ),
      );
    }
    // melody
    const inst =
      this.form === "adagio"
        ? "strings"
        : this.form === "waltz"
          ? second
            ? "strings"
            : "piano"
          : "piano";
    for (const n of this.melody) {
      if (n.beat < lb * m || n.beat >= lb * m + m) continue;
      const tt = t + (n.beat - lb * m) * b + (r() - 0.5) * 0.01,
        dur = n.dur * b * 0.95;
      const mm =
        n.midi + (second && this.form !== "adagio" && r() < 0.15 ? 12 : 0);
      if (inst === "piano") I.sample(ctx, out, "piano", mm, tt, dur, 0.3);
      else
        I.synth(ctx, out, "strings", mm, tt, dur, 0.35, {
          att: 0.08,
          rel: 0.4,
          bright: 3500,
        });
    }
    return this.barDur;
  };

  // ------------------------------------------------------------------
  // EMERGENCY BROADCAST
  // ------------------------------------------------------------------
  function EbsGen() {
    this.done = false;
    this.barDur = 1;
    this.phase = 0;
  }
  EbsGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx;
    const cyc = bar % 40;
    if (cyc < 8) {
      // attention signal (two-tone)
      [853, 960].forEach((f) => {
        const o = ctx.createOscillator();
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(cyc === 0 ? 0 : 0.12, t);
        if (cyc === 0) g.gain.linearRampToValueAtTime(0.12, t + 0.05);
        g.gain.setValueAtTime(0.12, t + 0.99);
        if (cyc === 7) g.gain.linearRampToValueAtTime(0, t + 1);
        o.connect(g);
        g.connect(out);
        o.start(t);
        o.stop(t + 1.01);
      });
    } else if (cyc >= 30) {
      // data burst / identification beeps
      for (let i = 0; i < 4; i++)
        if (Math.random() < 0.7) {
          const o = ctx.createOscillator();
          o.type = "square";
          o.frequency.value = Math.random() < 0.5 ? 1200 : 2200;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.03, t + i * 0.25);
          g.gain.setValueAtTime(0, t + i * 0.25 + 0.12);
          o.connect(g);
          g.connect(out);
          o.start(t + i * 0.25);
          o.stop(t + i * 0.25 + 0.13);
        }
    }
    return 1;
  };

  // ------------------------------------------------------------------
  // Title theme — a slow vintage ballad heard through an old phonograph
  // ------------------------------------------------------------------
  function PhonoWrap(gen, chainOpts) {
    this.gen = gen;
    this.chainOpts = chainOpts;
    this.done = false;
    this.chain = null;
  }
  PhonoWrap.prototype.nextBar = function (t, out, bar) {
    if (!this.chain) this.chain = I.radioChain(S.ctx, out, this.chainOpts);
    const d = this.gen.nextBar(t, this.chain.input, bar);
    this.done = this.gen.done;
    return d;
  };
  PhonoWrap.prototype.dispose = function () {
    if (this.gen.dispose) this.gen.dispose();
    if (this.chain) this.chain.dispose();
  };
  const TITLE_SONGS = [
    {
      title: "Lanterns Over Liberty",
      style: "ballad",
      lead: "croon",
      key: "Eb",
      tempo: 66,
    },
    {
      title: "Goodnight, Old Manhattan",
      style: "ballad",
      lead: "croon",
      key: "Bb",
      tempo: 70,
    },
  ];
  let titleIdx = 0;
  /** Output trims so every record plays at a similar loudness (measured offline). */
  const STYLE_GAIN = {
    swing: 0.45,
    ballad: 0.9,
    boogie: 0.6,
    jump: 0.55,
    rhumba: 0.65,
    march: 0.42,
    ebs: 0.32,
    classical: { sonata: 1.7, nocturne: 1.7, adagio: 0.5, waltz: 1.3 },
  };
  S.songs = {
    gainFor(song) {
      const g = STYLE_GAIN[song.style || "swing"];
      return typeof g === "object" ? g[song.form] || 1 : g || 1;
    },
    SwingGen,
    BoogieGen,
    RhumbaGen,
    MarchGen,
    ClassicalGen,
    EbsGen,
    PhonoWrap,
    /** Length in bars of a generator's arrangement (no throwaway generator needed to find a join point). */
    lengthOf(gen) {
      return gen.plan
        ? gen.plan.length
        : gen.bars
          ? gen.bars
          : gen.len
            ? gen.len * 2
            : 32;
    },
    /** Create a generator for a song definition {title, style, ...}. */
    make(song) {
      switch (song.style) {
        case "boogie":
        case "jump":
          return new BoogieGen(song);
        case "rhumba":
          return new RhumbaGen(song);
        case "march":
          return new MarchGen(song);
        case "classical":
          return new ClassicalGen(song);
        case "ebs":
          return new EbsGen(song);
        default:
          return new SwingGen(song);
      }
    },
    titleGen() {
      const s = TITLE_SONGS[titleIdx++ % TITLE_SONGS.length];
      return new PhonoWrap(new SwingGen(s), {
        crackle: 0.45,
        lp: 4200,
        hp: 180,
      });
    },
  };
