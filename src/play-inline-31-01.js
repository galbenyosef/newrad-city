// play-inline-31 01 — beat
// Lines 26-358 of readable/play-inline-31.pretty.js (statement-aligned).
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
