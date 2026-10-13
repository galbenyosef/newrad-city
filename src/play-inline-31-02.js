// play-inline-31 02 — song
// Lines 359-709 of readable/play-inline-31.pretty.js (statement-aligned).
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
