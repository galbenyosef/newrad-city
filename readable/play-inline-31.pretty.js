/* src/sound/40_songs.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 40_songs.js
 * Procedural composers for the goggle radio (and the title theme).
 * Every "record" is generated from its title's seed, so a given song
 * always sounds the same, and nothing is a real, copyrighted tune.
 *
 *  SwingGen   — 1940s/50s small-band swing & crooner ballads: AABA 32-bar
 *               form, functional jazz harmony, walking (or two-feel) bass,
 *               brushes & ride, rootless piano comping, motif-based lead
 *               melody (clarinet / muted trumpet / sax / wordless crooner
 *               / vibes), improvised solo chorus, horn backgrounds, tag.
 *               Sung records (song.vocal + lyrics): the head is SUNG by the
 *               formant singer (48_radio_voice.js) to a melody composed from
 *               the lyric; the lead answers in the rests; girl-group double +
 *               harmony; "ooh/aah" backing choir on ballads & girl groups.
 *  BoogieGen  — 12-bar boogie-woogie / jump blues with piano left-hand
 *               ostinato, right-hand riffs, optional horn section riffs.
 *               Sung jump blues: AAB verses with band answers.
 *  RhumbaGen  — latin number: clave, bongos, maracas, tumbao, montuno.
 *  MarchGen   — Continuity Radio patriotic band marches (strains + trio).
 *  ClassicalGen — sonata (Alberti bass), nocturne, string adagio, waltz.
 *  EbsGen     — Office of Civil Defense emergency broadcast attention tone & data.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = G._snd;
  const I = S.inst;
  const Q = S.CHORD_Q;
  const pick = (r, arr) => arr[(r() * arr.length) | 0];
  const clamp = S.clamp;
  const SCALE_FOR = {
    maj7: [0, 2, 4, 5, 7, 9, 11],
    maj9: [0, 2, 4, 5, 7, 9, 11],
    6: [0, 2, 4, 5, 7, 9, 11],
    maj: [0, 2, 4, 5, 7, 9, 11],
    7: [0, 2, 4, 5, 7, 9, 10],
    9: [0, 2, 4, 5, 7, 9, 10],
    "7sus": [0, 2, 4, 5, 7, 9, 10],
    m7: [0, 2, 3, 5, 7, 9, 10],
    m6: [0, 2, 3, 5, 7, 9, 10],
    min: [0, 2, 3, 5, 7, 8, 10],
    m9: [0, 2, 3, 5, 7, 9, 10],
    m7b5: [0, 1, 3, 5, 6, 8, 10],
    dim7: [0, 2, 3, 5, 6, 8, 9, 11],
    aug: [0, 2, 4, 6, 8, 10],
  };
  /** Nearest midi to `target` whose pitch class (relative to root pc) is in `set`. */
  function nearestIn(set, rootPc, target) {
    let best = target,
      bd = 99;
    for (let m = target - 6; m <= target + 6; m++) {
      const pc = (((m - rootPc) % 12) + 12) % 12;
      if (set.includes(pc) && Math.abs(m - target) < bd) {
        bd = Math.abs(m - target);
        best = m;
      }
    }
    return best;
  }
  S.nearestIn = nearestIn;

  // ------------------------------------------------------------------
  // Harmony templates (semitone offset from key, quality). One or two chords per bar.
  // ------------------------------------------------------------------
  const A_TEMPLATES = [
    [
      [[0, "6"]],
      [[9, "m7"]],
      [[2, "m7"]],
      [[7, "7"]],
      [[0, "6"]],
      [[5, "7"]],
      [
        [2, "m7"],
        [7, "7"],
      ],
      [[0, "6"]],
    ],
    [
      [[0, "maj7"]],
      [[0, "7"]],
      [[5, "maj7"]],
      [[5, "m6"]],
      [[4, "m7"]],
      [[9, "7"]],
      [[2, "m7"]],
      [[7, "7"]],
    ],
    [
      [[0, "6"]],
      [[1, "dim7"]],
      [[2, "m7"]],
      [[7, "7"]],
      [[4, "m7"]],
      [[9, "7"]],
      [
        [2, "m7"],
        [7, "7"],
      ],
      [[0, "6"]],
    ],
    [
      [[0, "maj7"]],
      [[9, "m7"]],
      [[2, "m7"]],
      [[7, "9"]],
      [
        [4, "m7"],
        [3, "dim7"],
      ],
      [[2, "m7"]],
      [[7, "7"]],
      [[0, "6"]],
    ],
    [
      [[0, "6"]],
      [[4, "7"]],
      [[9, "7"]],
      [[9, "7"]],
      [[2, "7"]],
      [[2, "7"]],
      [
        [2, "m7"],
        [7, "7"],
      ],
      [[0, "6"]],
    ],
  ];
  const B_TEMPLATES = [
    [
      [[4, "7"]],
      [[4, "7"]],
      [[9, "7"]],
      [[9, "7"]],
      [[2, "7"]],
      [[2, "7"]],
      [[7, "7"]],
      [[7, "7"]],
    ],
    [
      [[5, "maj7"]],
      [[5, "maj7"]],
      [[5, "m6"]],
      [[5, "m6"]],
      [[4, "m7"]],
      [[9, "7"]],
      [[2, "m7"]],
      [[7, "7"]],
    ],
    [
      [[0, "7"]],
      [[0, "7"]],
      [[5, "maj7"]],
      [[5, "maj7"]],
      [[2, "7"]],
      [[2, "7"]],
      [[2, "m7"]],
      [[7, "7"]],
    ],
    [
      [[9, "m7"]],
      [[2, "7"]],
      [[7, "maj7"]],
      [[7, "maj7"]],
      [[11, "m7b5"]],
      [[4, "7"]],
      [[2, "m7"]],
      [[7, "7"]],
    ],
  ];
  // melody rhythm cells (beats within 2 bars; x.5 = swung 8th offbeat). [start, dur]
  const CELLS = [
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 3],
    ],
    [
      [0, 1.5],
      [1.5, 0.5],
      [2, 2],
      [4, 1],
      [5, 1],
      [6, 2],
    ],
    [
      [0.5, 0.5],
      [1, 0.5],
      [1.5, 0.5],
      [2, 2],
      [5, 0.5],
      [5.5, 0.5],
      [6, 2],
    ],
    [
      [1, 0.5],
      [1.5, 0.5],
      [2, 0.5],
      [2.5, 1.5],
      [4, 3],
    ],
    [
      [0, 0.5],
      [0.5, 0.5],
      [1, 1],
      [2.5, 0.5],
      [3, 1],
      [4, 2],
      [6, 1.5],
    ],
    [
      [0, 3],
      [3, 0.5],
      [3.5, 0.5],
      [4, 2.5],
    ],
    [
      [0, 0.5],
      [0.5, 1],
      [1.5, 0.5],
      [2, 1],
      [3.5, 0.5],
      [4, 4],
    ],
  ];
  const CADENCE_CELLS = [
    [
      [0, 1],
      [1, 1],
      [2, 6],
    ],
    [
      [0, 0.5],
      [0.5, 0.5],
      [1, 1],
      [2, 5],
    ],
    [
      [0, 2],
      [2, 6],
    ],
  ];

  /** Build a flat per-bar chord list for the whole song (AABA). */
  function buildForm(r) {
    const A = pick(r, A_TEMPLATES),
      B = pick(r, B_TEMPLATES);
    // A1 ends in a turnaround, A2/A3 resolve
    const A1 = A.slice(0, 7).concat([
      [
        [2, "m7"],
        [7, "7"],
      ],
    ]);
    const A2 = A.slice(0, 7).concat([[[0, "6"]]]);
    return { A1, A2, B, bars: [].concat(A1, A2, B, A2) };
  }

  /** Chord (key-relative) at absolute beat within a 32-bar chorus. */
  function chordAtBeat(chorus, beat) {
    const bar = Math.floor(beat / 4) % chorus.length,
      cs = chorus[bar];
    const b = beat % 4;
    return cs.length > 1 && b >= 2 ? cs[1] : cs[0];
  }

  /**
   * Generate a melody over 8 bars (list of {beat, dur, midi}) from rhythm cells.
   * chordFn(beatAbs) → [rootOffset, quality]; key = key root midi pc base.
   */
  function melody8(r, chordFn, key, lo, hi, cellsIdx, cadence, startBeat) {
    const notes = [];
    let p = clamp(key + 12 + pick(r, [4, 7, 9]), lo, hi);
    let dir = r() < 0.5 ? 1 : -1;
    for (let ph = 0; ph < 4; ph++) {
      const cell =
        ph === 3 && cadence
          ? pick(r, CADENCE_CELLS)
          : CELLS[cellsIdx[ph % cellsIdx.length]];
      if (ph === 2) dir = -dir;
      for (let i = 0; i < cell.length; i++) {
        const beat = startBeat + ph * 8 + cell[i][0];
        const ch = chordFn(beat),
          croot = key + ch[0],
          q = Q[ch[1]] || Q.maj;
        const strong =
          cell[i][0] % 1 === 0 && (cell[i][0] % 2 === 0 || cell[i][1] >= 1.5);
        let target =
          p + dir * (strong ? pick(r, [1, 2, 3, 4]) : pick(r, [1, 2]));
        if (target > hi) {
          dir = -1;
          target = p - 2;
        }
        if (target < lo) {
          dir = 1;
          target = p + 2;
        }
        const last = ph === 3 && i === cell.length - 1 && cadence;
        if (last) p = nearestIn([0, 4, 7], key % 12, target);
        else if (strong) p = nearestIn(q, croot % 12, target);
        else
          p = nearestIn(SCALE_FOR[ch[1]] || SCALE_FOR.maj, croot % 12, target);
        notes.push({ beat, dur: cell[i][1], midi: clamp(p, lo - 2, hi + 2) });
        if (r() < 0.25) dir = -dir;
      }
    }
    return notes;
  }

  /** Improvised solo line over n bars. */
  function soloLine(r, chordFn, key, lo, hi, startBeat, bars, density) {
    const notes = [];
    let beat = startBeat,
      p = clamp(key + 14, lo, hi),
      dir = 1;
    const end = startBeat + bars * 4;
    while (beat < end) {
      // phrase of 4-12 eighths, then rest
      const len = 4 + ((r() * 9) | 0);
      for (let i = 0; i < len && beat < end; i++) {
        const ch = chordFn(beat),
          croot = key + ch[0];
        const onBeat = beat % 1 === 0;
        let tgt = p + dir * (r() < 0.8 ? pick(r, [1, 2]) : pick(r, [3, 4, 5]));
        if (tgt > hi) dir = -1;
        if (tgt < lo) dir = 1;
        tgt = clamp(tgt, lo, hi);
        p = onBeat
          ? nearestIn(Q[ch[1]] || Q.maj, croot % 12, tgt)
          : r() < 0.15
            ? tgt
            : nearestIn(SCALE_FOR[ch[1]] || SCALE_FOR.maj, croot % 12, tgt);
        const d = r() < density ? 0.5 : pick(r, [1, 1.5]);
        notes.push({ beat, dur: d, midi: p });
        beat += d;
        if (r() < 0.18) dir = -dir;
      }
      beat += pick(r, [1, 1.5, 2, 3]);
    }
    return notes;
  }

  // ------------------------------------------------------------------
  // VOCALS — sung melody composed FROM the lyric: the words set the rhythm
  // (stressed syllables on longer values, unstressed on swung eighths, the
  // phrase's last syllable held), the harmony sets the pitches (chord tones
  // on strong beats, scale tones between), and each phrase gets an arch
  // contour. The same random stream is reused for every A section, so the
  // A melody comes back recognisably with new words.
  // ------------------------------------------------------------------
  /**
   * One sung phrase. syls = S.vox.syllables(text). Returns [{beat, dur, midi, syl, first, last}] from startBeat, fitting `span`
   * beats (the held last note ends half a beat before the span so the singer can breathe).
   * o: {cadence (end on the tonic triad), pc {p}, set (fixed pitch-class set rel. key, e.g. blues), fall (descending line)}
   */
  function lyricPhrase(r, chordFn, key, lo, hi, syls, startBeat, span, o) {
    o = o || {};
    const n = syls.length;
    if (!n) return [];
    let units = syls.map((s, i) => (i === n - 1 ? 0 : s.stressed ? 1 : 0.5));
    let U = units.reduce((a, b) => a + b, 0);
    const room = span - 2;
    if (U > room) {
      units = units.map((u, i) => (i === n - 1 ? 0 : 0.5));
      U = (n - 1) * 0.5;
    }
    if (U > span - 1.5) {
      const k = (span - 1.5) / U;
      units = units.map((u) => u * k);
      U = span - 1.5;
    } else if (U <= room * 0.5 && !o.tight) {
      units = units.map((u) => u * 2);
      U *= 2;
    } // few words: broad, lyrical values
    // lay back: start on the "and of one" when there's room (a crooner never rushes)
    let beat =
      startBeat +
      (U <= room - 1.5 && r() < 0.5
        ? 1
        : U <= room - 0.5 && r() < 0.5
          ? 0.5
          : 0);
    const endBeat = startBeat + span - 0.5;
    const notes = [];
    const pc = o.pc || { p: clamp(key + 12 + 4, lo, hi) };
    const peak = Math.max(1, Math.floor(n * (0.35 + r() * 0.3)));
    for (let i = 0; i < n; i++) {
      const last = i === n - 1;
      const dur = last ? Math.max(1, endBeat - beat) : units[i];
      const ch = chordFn(beat),
        croot = key + ch[0],
        q = Q[ch[1]] || Q.maj;
      const strong = beat % 1 === 0 || syls[i].stressed || last;
      const dir = o.fall ? (i < 1 ? 1 : -1) : i < peak ? 1 : -1;
      let target =
        pc.p +
        dir *
          (strong
            ? pick(r, [1, 2, 3]) + (syls[i].stressed ? 1 : 0)
            : pick(r, [0, 1, 2]));
      if (target > hi) target = pc.p - 2;
      if (target < lo) target = pc.p + 2;
      let m;
      if (o.set) m = nearestIn(o.set, key % 12, target);
      else if (last && o.cadence)
        m = nearestIn([0, 4, 7], key % 12, clamp(target, lo, hi - 3));
      else if (strong) m = nearestIn(q, croot % 12, target);
      else m = nearestIn(SCALE_FOR[ch[1]] || SCALE_FOR.maj, croot % 12, target);
      m = clamp(m, lo - 1, hi + 1);
      pc.p = m;
      notes.push({ beat, dur, midi: m, syl: syls[i], first: i === 0, last });
      beat += units[i];
    }
    return notes;
  }
  const BLUES = [0, 3, 5, 7, 10];
  /** Fill figure for an instrument in a singer's rest: 2–4 chord tones stepping down onto a chord tone. */
  function answerFill(r, chordFn, key, lo, hi, fromBeat, toBeat) {
    const out = [],
      len = toBeat - fromBeat;
    if (len < 1.5) return out;
    const k = len >= 3 ? 4 : len >= 2 ? 3 : 2;
    let p = clamp(key + 12 + pick(r, [7, 9, 12]), lo, hi),
      b = toBeat - k * 0.5;
    for (let i = 0; i < k; i++, b += 0.5) {
      const ch = chordFn(b),
        q = Q[ch[1]] || Q.maj;
      p = nearestIn(
        i === k - 1 ? q : SCALE_FOR[ch[1]] || SCALE_FOR.maj,
        (key + ch[0]) % 12,
        p - pick(r, [1, 2]),
      );
      out.push({ beat: b, dur: i === k - 1 ? 1 : 0.5, midi: clamp(p, lo, hi) });
    }
    return out;
  }
  // Vocal-record mode (G.radio.setVocals): 'full' | 'hooks' | 'off'. Persisted; read when a record is composed.
  S.vocalMode = "full";
  {
    const vm = S.lsGet("radio_vocals");
    if (vm === "hooks" || vm === "off") S.vocalMode = vm;
  }
  S.setVocalMode = function (m) {
    if (m !== "full" && m !== "hooks" && m !== "off") return;
    S.vocalMode = m;
    S.lsSet("radio_vocals", m);
  };
  /** Singers for a vocal record: lead (+ double and a harmony part for a girl group). */
  function makeSingers(song, out, t) {
    const V = S.vox;
    if (!V || !V.singer) return null;
    const ctx = S.ctx,
      g = song.vocal === "group" ? "female" : song.vocal;
    const list = [
      {
        s: V.singer(ctx, out, {
          voice: g,
          start: t - 0.5,
          gain: song.vocal === "group" ? 1.1 : 1,
        }),
        part: "lead",
      },
    ]; // levels re-measured after the singing pass
    if (song.vocal === "group") {
      // the other two girls: own formant scale, vibrato rate and breath; an ensemble chorus thickens each into a section
      list.push({
        s: V.singer(ctx, out, {
          voice: "female",
          start: t - 0.5,
          gain: 0.46,
          detune: 9,
          delay: 0.017,
          fs: 1.04,
          ensemble: true,
          vibRate: 1.06,
          breath: 1.2,
        }),
        part: "double",
      });
      list.push({
        s: V.singer(ctx, out, {
          voice: "female",
          start: t - 0.5,
          gain: 0.42,
          detune: -6,
          delay: 0.009,
          fs: 0.95,
          ensemble: true,
          vibRate: 0.93,
          breath: 1.1,
        }),
        part: "harmony",
      });
    }
    return list;
  }
  /** Vocal range per singer type (midi). */
  const VOCAL_RANGE = { male: [48, 64], female: [57, 74], group: [58, 74] };
  /** Lyric caption hook: gen.onLyric(text, ctxTime, durSec) is set by the radio. */
  function lyricCue(gen, n, tt, secPerBeat, phraseNotes) {
    if (!n.first || !gen.onLyric || !n.text) return;
    const lastN = phraseNotes[phraseNotes.length - 1] || n;
    try {
      gen.onLyric(n.text, tt, (lastN.beat + lastN.dur - n.beat) * secPerBeat);
    } catch (e) {
      /* */
    }
  }

  // ------------------------------------------------------------------
  // SWING / BALLAD
  // ------------------------------------------------------------------
  const KEYS = { F: 41, Bb: 46, Eb: 39, Ab: 44, C: 36, G: 43, D: 38 };
  function SwingGen(song) {
    const r = S.rng(G.util.hashStr(song.title) ^ (song.seed || 0));
    this.song = song;
    this.r = r;
    const ballad = song.style === "ballad";
    this.ballad = ballad;
    this.tempo = song.tempo || (ballad ? 64 + r() * 14 : 138 + r() * 50);
    this.beat = 60 / this.tempo;
    this.barDur = this.beat * 4;
    this.swing = ballad ? 0.6 : 0.66;
    this.key = KEYS[song.key] || pick(r, [41, 46, 39, 44, 36, 43]);
    const form = buildForm(r);
    this.chorus = form.bars;
    this.lead =
      song.lead ||
      pick(
        r,
        ballad
          ? ["croon", "sax", "clarinet", "croon"]
          : ["clarinet", "mute", "sax", "vibes", "croon", "trumpet"],
      );
    this.soloist =
      song.solo ||
      pick(
        r,
        ["piano", "sax", "clarinet", "mute", "vibes"].filter(
          (x) => x !== this.lead,
        ),
      );
    this.guitar = song.guitar !== undefined ? song.guitar : r() < 0.5;
    this.brushes = ballad || r() < 0.55;
    const range = {
      croon: [55, 72],
      clarinet: [58, 79],
      mute: [58, 77],
      sax: [51, 70],
      vibes: [60, 81],
      trumpet: [58, 77],
      piano: [60, 82],
    };
    const lr = range[this.lead] || [58, 77],
      sr = range[this.soloist] || [58, 77];
    // compose: A melody (reused), B melody, solo chorus
    const chorusFn = (beat) => chordAtBeat(this.chorus, beat);
    const cellsA = [(r() * CELLS.length) | 0, (r() * CELLS.length) | 0];
    const cellsB = [(r() * CELLS.length) | 0, (r() * CELLS.length) | 0];
    this.melA1 = melody8(r, chorusFn, this.key, lr[0], lr[1], cellsA, false, 0);
    // A2 = A1 with cadence ending (same first 6 bars)
    const cad = melody8(
      S.rng(G.util.hashStr(song.title) + 5),
      chorusFn,
      this.key,
      lr[0],
      lr[1],
      cellsA,
      true,
      32,
    );
    this.melA2 = this.melA1
      .filter((n) => n.beat < 24)
      .map((n) => ({ beat: n.beat + 32, dur: n.dur, midi: n.midi }))
      .concat(cad.filter((n) => n.beat >= 56));
    this.melB = melody8(
      r,
      chorusFn,
      this.key,
      lr[0] + 2,
      lr[1] + 2,
      cellsB,
      false,
      64,
    );
    this.melA3 = this.melA2.map((n) => ({
      beat: n.beat + 64,
      dur: n.dur,
      midi: n.midi,
    }));
    this.head = [].concat(this.melA1, this.melA2, this.melB, this.melA3);
    this.solo = soloLine(
      r,
      chorusFn,
      this.key,
      sr[0],
      sr[1],
      0,
      32,
      ballad ? 0.35 : 0.7,
    );
    // song plan: intro(4) + head(32) + solo(32 or 16 for ballads) + B+A head out (16) + tag (2)
    this.intro = 4;
    this.plan = [];
    for (let i = 0; i < this.intro; i++) this.plan.push({ sec: "intro", i });
    for (let i = 0; i < 32; i++) this.plan.push({ sec: "head", i });
    const soloBars = ballad ? 16 : 32;
    for (let i = 0; i < soloBars; i++) this.plan.push({ sec: "solo", i });
    for (let i = 16; i < 32; i++) this.plan.push({ sec: "out", i });
    this.plan.push({ sec: "tag", i: 0 }, { sec: "tag", i: 1 });
    this.done = false;
    this.voicing = [52, 56, 59, 62];
    this.bassP = this.key - 12 + (this.key < 40 ? 12 : 0);
    this.duration = this.plan.length * this.barDur;
    // sung records: the lyric drives the head melody; the lead instrument answers in the singer's rests
    this.vocal =
      !!(song.vocal && song.lyrics && S.vox && S.vox.syllables) &&
      S.vocalMode !== "off";
    this.hooks = this.vocal && S.vocalMode === "hooks";
    this.choir =
      (ballad && (this.vocal || this.lead === "croon")) ||
      song.vocal === "group";
    this.choirV = [55, 59, 62];
    if (this.vocal) {
      try {
        this.setupVocal(song, chorusFn, lr);
      } catch (e) {
        G.reportError("sound:vocal", e);
        this.vocal = false;
      }
    }
  }
  /** Compose the sung head (A1 A2 B A3) and the sung out-chorus (B A3, or B2 A4 when written) from the lyrics. */
  SwingGen.prototype.setupVocal = function (song, chorusFn, lr) {
    const L = song.lyrics,
      seed = G.util.hashStr(song.title + "/vox");
    const vr = VOCAL_RANGE[song.vocal] || VOCAL_RANGE.male;
    const startP = nearestIn(
      [0, 4, 7],
      this.key % 12,
      Math.round(vr[0] + (vr[1] - vr[0]) * 0.4),
    );
    this.fillInst =
      this.lead === "croon" ? (this.ballad ? "sax" : "clarinet") : this.lead;
    const build = (secs) => {
      const notes = [],
        fills = [];
      for (const [name, at] of secs) {
        const lines = L[name] || L[name.replace(/\d$/, "1")] || L.A1;
        if (!lines) continue;
        const isB = name[0] === "B";
        const pc = { p: isB ? startP + 3 : startP };
        for (let j = 0; j < 4; j++) {
          const text = lines[j];
          if (!text) continue;
          const r = S.rng(seed + (isB ? 1000 : 0) + j * 31);
          const ph = lyricPhrase(
            r,
            chorusFn,
            this.key,
            vr[0],
            vr[1],
            S.vox.syllables(text),
            at + j * 8,
            8,
            { cadence: j === 3 && !isB, pc },
          );
          if (!ph.length) continue;
          ph[0].text = text;
          ph.forEach((n) => {
            n.phrase = ph;
          });
          notes.push(...ph);
          const lastN = ph[ph.length - 1];
          fills.push(
            ...answerFill(
              S.rng(seed + 77 + j + at),
              chorusFn,
              this.key,
              lr[0],
              lr[1],
              lastN.beat + Math.min(lastN.dur, 1.5),
              at + j * 8 + 8,
            ),
          );
        }
      }
      for (let i = 0; i < notes.length; i++)
        notes[i].next = notes[i].last ? null : notes[i + 1] || null;
      return { notes, fills };
    };
    this.vocHead = build([
      ["A1", 0],
      ["A2", 32],
      ["B", 64],
      ["A3", 96],
    ]);
    this.vocOut = build([
      [L.B2 ? "B2" : "B", 64],
      [L.A4 ? "A4" : "A3", 96],
    ]);
    // girl groups: vocal bumps up the band a notch; crooners sit in front of a softer band
    this.vocalVel =
      song.vocalGain || (this.ballad && song.vocal !== "group" ? 0.85 : 1); // measured: solo ballad voice ≈ +4 dB over the band, girl groups ≈ +3.6 dB
  };
  /** Sing (and answer) one bar of the head or out-chorus. */
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
})();
