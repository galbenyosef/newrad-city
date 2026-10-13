// play-inline-35 04 — cue
// Lines 1040-1383 of readable/play-inline-35.pretty.js (statement-aligned).
  function startSong(song, midway) {
    const ctx = S.ctx;
    const gen = S.songs.make(song);
    // tuning in mid-record: join somewhere in the first half of the arrangement (on a bar line)
    const startBar = midway
      ? Math.floor(Math.random() * S.songs.lengthOf(gen) * 0.55)
      : 0;
    const cue = new S.Cue("radio:" + song.title, gen, {
      dest: R.chain.input,
      reverb: 0,
    });
    cue.out.gain.value = S.songs.gainFor(song);
    cue.start(ctx.currentTime + 0.15, startBar ? 1.2 : 0.3);
    if (startBar) cue.seek(startBar);
    R.cue = cue;
    const station = R.station;
    // sung records: lyric lines go to the captions as the singer reaches them
    gen.onLyric = (text, t, dur) => {
      if (R.cue === cue && R.station === station && S.subsLyric)
        S.subsLyric({
          station,
          speaker: song.artist,
          text,
          startIn: t - ctx.currentTime,
          dur,
        });
    };
    if (R.progress[station]) R.progress[station].lastWasSong = true;
    R.nowPlaying = {
      station,
      title: song.title,
      artist: song.artist,
      kind: "song",
      vocal: song.vocal || null,
    };
    G.events.emit("radioSong", {
      station,
      title: song.title,
      artist: song.artist,
      vocal: song.vocal || null,
    });
  }
  function runTalk(lines, then) {
    const station = R.station;
    const talk = (R.talk = { lines, i: 0, then, station });
    const next = () => {
      if (R.talk !== talk || !R.on || R.station !== station) return;
      R.busySince = G.time.real;
      if (talk.i >= lines.length) {
        R.talk = null;
        R.busy = false;
        R.nextAt = G.time.real + 0.6;
        if (then) R.pending = then;
        return;
      }
      const l = talk.lines[talk.i++];
      if (l[0] === "#mark") {
        try {
          if (S.radioStory) S.radioStory.mark(l[1], station);
        } catch (e) {
          /* */
        }
        next();
        return;
      }
      if (l[0] === "#sting") {
        // jingle through the station chain, then carry on
        const d = R.chain
          ? playSting(l[1], R.chain.input, S.ctx.currentTime + 0.05)
          : 0;
        setTimeout(next, d * 1000 + 120);
        return;
      }
      say(station, l[0], l[1], l[2], () => setTimeout(next, 450), l[3]);
    };
    R.busy = true;
    R.busySince = G.time.real;
    next();
  }
  function runItem(it, joinMidway) {
    if (!it) return;
    if (it.kind === "song") {
      const needs = ["piano", "bass", "drums", "guitar", "vibes", "pizz"];
      if (!S.inst.allReady(needs)) {
        needs.forEach(S.inst.ensure);
        R.pending = it;
        R.nextAt = G.time.real + 0.5;
        return;
      }
      startSong(it.song, !!joinMidway);
    } else if (it.kind === "talk") runTalk(it.lines, it.then);
    else if (it.kind === "signal") startSignal(it.station);
    else if (it.kind === "deadair") {
      // an open carrier: hiss, hum and the odd bump of a mic stand, forever
      const gen = new SignalGen("dead");
      const cue = new S.Cue("radio:dead:" + R.station, gen, {
        dest: R.chain.input,
        reverb: 0,
      });
      cue.out.gain.value = 1;
      cue.start(S.ctx.currentTime + 0.1, 0.3);
      R.cue = cue;
      R.nowPlaying = {
        station: R.station,
        title: "Dead air",
        artist: "",
        kind: "signal",
      };
    } else if (it.kind === "ebs") {
      const gen = new S.songs.EbsGen();
      const cue = new S.Cue("radio:ebs", gen, {
        dest: R.chain.input,
        reverb: 0,
      });
      cue.out.gain.value = S.songs.gainFor({ style: "ebs" });
      cue.start(S.ctx.currentTime + 0.1, 0.1);
      R.cue = cue;
      R.nowPlaying = {
        station: "ebs",
        title: "Emergency Broadcast",
        artist: "Office of Civil Defense",
        kind: "ebs",
      };
      R.ebsNext = G.time.real + 9;
    }
  }

  // ------------------------------------------------------------------
  // Range-limited signals: a looping program (beacon pips / interval chime +
  // Morse / dead air) with a voice message on a cycle.
  // ------------------------------------------------------------------
  const MORSE = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    0: "-----",
    1: ".----",
    2: "..---",
    3: "...--",
    4: "....-",
    5: ".....",
    6: "-....",
    7: "--...",
    8: "---..",
    9: "----.",
  };
  /** Text → [[on, units]] (dit = 1 unit, dah = 3, gaps 1 / 3 / 7). */
  function morseSeq(text) {
    const out = [];
    String(text || "")
      .toUpperCase()
      .split(" ")
      .forEach((word, wi) => {
        if (wi) out.push([false, 7]);
        word.split("").forEach((ch, ci) => {
          const code = MORSE[ch];
          if (!code) return;
          if (ci) out.push([false, 3]);
          code.split("").forEach((el, ei) => {
            if (ei) out.push([false, 1]);
            out.push([true, el === "." ? 1 : 3]);
          });
        });
      });
    return out;
  }
  function tone(out, f, t, d, g, type) {
    const ctx = S.ctx,
      o = ctx.createOscillator();
    o.type = type || "sine";
    o.frequency.value = f;
    const a = ctx.createGain();
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(g, t + 0.006);
    a.gain.setValueAtTime(g, t + Math.max(0.007, d - 0.008));
    a.gain.linearRampToValueAtTime(0, t + d);
    o.connect(a);
    a.connect(out);
    o.start(t);
    o.stop(t + d + 0.02);
  }
  /** Bar = 0.5 s. mode is driven by the radio: 'idle' | 'interval' (numbers-station chime) | 'morse'. */
  function SignalGen(kind, morse, pips) {
    this.kind = kind;
    this.pips = pips || null;
    this.mode = "idle";
    this.done = false;
    this.seq = morseSeq(morse);
    this.mi = 0;
    this.mt = 0;
    this.ci = 0;
  }
  SignalGen.prototype.nextBar = function (t, out, bar) {
    const ctx = S.ctx;
    if (this.kind === "beacon" && bar % 8 === 0) {
      // locator pips under everything (Long Winter by default; a station may bring its own)
      if (this.pips)
        for (const p of this.pips) tone(out, p[0], t + p[1], p[2], 0.09);
      else {
        tone(out, 1320, t, 0.16, 0.09);
        tone(out, 990, t + 0.2, 0.22, 0.09);
      }
    }
    if (this.kind === "dead" && Math.random() < 0.02) {
      // someone bumps the mic stand
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(90, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.2);
      const a = ctx.createGain();
      a.gain.setValueAtTime(0.35, t);
      a.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(a);
      a.connect(out);
      o.start(t);
      o.stop(t + 0.3);
    }
    if (this.mode === "interval") {
      // a tinny music-box interval signal, the same eight notes forever
      const tune = [79, 76, 72, 74, 76, 72, 67, 72];
      const m = tune[this.ci++ % tune.length];
      tone(out, S.mtof(m), t, 0.42, 0.06, "triangle");
      tone(out, S.mtof(m + 12), t, 0.18, 0.02, "sine");
    } else if (this.mode === "morse") {
      const u = 0.075;
      if (this.mt < t) this.mt = t;
      while (this.mt < t + 0.5 && this.mi < this.seq.length) {
        const [on, n] = this.seq[this.mi++];
        if (on) tone(out, 760, this.mt, n * u, 0.08);
        this.mt += n * u;
      }
      if (this.mi >= this.seq.length) {
        this.mode = "idle";
        this.mi = 0;
        this.morseDone = true;
      }
    }
    return 0.5;
  };
  function startSignal(st) {
    const gen = new SignalGen(
      st.gen,
      T.signals[st.signal] && T.signals[st.signal].morse,
      st.pips,
    );
    const cue = new S.Cue("radio:" + st.id, gen, {
      dest: R.chain.input,
      reverb: 0,
    });
    cue.out.gain.value = 1;
    cue.start(S.ctx.currentTime + 0.1, 0.2);
    R.cue = cue;
    const txt = T.signals[st.signal] || {};
    R.nowPlaying = {
      station: st.id,
      title: st.name,
      artist: txt.speaker || "",
      kind: "signal",
    };
    R.sig = {
      st,
      gen,
      phase: st.gen === "numbers" ? "interval" : "voice",
      at: G.time.real + (st.gen === "numbers" ? 6 : 1.5),
      line: 0,
    };
    if (st.gen === "numbers") gen.mode = "interval";
  }
  /** Signal program cycle: interval chime → voice → Morse → pause (numbers), voice → pause (tapes). */
  function signalTick(hold) {
    const sg = R.sig;
    if (!sg || R.cue == null || R.cue.gen !== sg.gen) return;
    const now = G.time.real,
      txt = T.signals[sg.st.signal];
    if (!txt || R.speaking || hold) return;
    if (sg.phase === "morse") {
      if (sg.gen.morseDone) {
        sg.gen.morseDone = false;
        sg.phase = "gap";
        sg.at = now + 4;
      }
      return;
    }
    if (now < sg.at) return;
    if (sg.phase === "interval" || sg.phase === "voice") {
      sg.gen.mode = "idle";
      const line = txt.lines[sg.line++ % txt.lines.length];
      sg.phase = "speaking";
      say(sg.st.id, txt.speaker, txt.profile, line, () => {
        if (R.sig !== sg) return;
        if (sg.st.gen === "numbers") {
          sg.phase = "morse";
          sg.gen.mode = "morse";
        } else {
          sg.phase = "gap";
          sg.at = G.time.real + (sg.st.gen === "beacon" ? 7 : 9);
        }
      });
    } else if (sg.phase === "gap") {
      if (sg.st.gen === "numbers") {
        sg.phase = "interval";
        sg.gen.mode = "interval";
        sg.at = now + 8;
      } else sg.phase = "voice";
    } else if (sg.phase === "speaking" && !R.speaking) {
      sg.phase = "gap";
      sg.at = now + 3;
    } // interrupted line
  }
  function sigDist(st) {
    const p = G.player && G.player.pos;
    if (!p || !G.LAYOUT) return Infinity;
    if (G.LAYOUT.isInterior && G.LAYOUT.isInterior(p.x)) return Infinity;
    return Math.hypot(p.x - st.src.x, p.z - st.src.z);
  }
  /** Is a range-limited station on the dial right now? (a tuned one keeps a little hysteresis) */
  function sigAvailable(st, tuned) {
    if (st.live && !st.live()) return false;
    if (!st.signal) return true;
    return sigDist(st) < st.range + (tuned ? 45 : 0);
  }
  /** Poll (1×/s): signals entering/leaving range; lose a tuned signal when walking out of range. */
