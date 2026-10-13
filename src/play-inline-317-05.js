// play-inline-317 05 — gain
// Lines 1492-1566 of readable/play-inline-317.pretty.js (statement-aligned).
  const JB = { on: false, t: 0, beat: 0, next: 0, gain: null, ctx: null };
  const MEL = [
    67, 69, 71, 74, 76, 74, 71, 69, 67, 64, 67, 69, 71, -1, 69, 67, 72, 71, 69,
    67, 64, 62, 64, 67, 69, 67, 64, 62, 60, -1, -1, -1,
  ];
  const BASS = [48, 52, 55, 57, 53, 57, 60, 57, 48, 52, 55, 57, 55, 59, 62, 59];
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function jbAudio() {
    const S = G._snd,
      ac = S && S.ctx;
    if (!ac || ac.state !== "running") return null;
    if (JB.ctx !== ac) {
      JB.ctx = ac;
      JB.gain = ac.createGain();
      JB.gain.gain.value = 0;
      const lp = ac.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2600; // old speaker
      JB.gain.connect(lp);
      lp.connect(
        (S.bus && (S.bus.world || S.bus.sfx || S.bus.master)) || ac.destination,
      );
      JB.next = ac.currentTime + 0.1;
    }
    return ac;
  }
  function jbNote(ac, t, f, dur, type, vol) {
    const o = ac.createOscillator(),
      g = ac.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(JB.gain);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function jbUpdate(ctx) {
    const ac = jbAudio();
    if (!ac) return;
    const P = G.player.pos,
      j = ctx.anchors.jukebox;
    const d = Math.hypot(P.x - j.x, P.z - j.z);
    const target = JB.on && ctx.inside ? Math.max(0, 0.22 * (1 - d / 26)) : 0;
    JB.gain.gain.setTargetAtTime(target, ac.currentTime, 0.2);
    if (!JB.on || !ctx.inside) {
      JB.next = ac.currentTime + 0.1;
      return;
    }
    const spb = 60 / 132 / 2; // swung eighths at 132 bpm
    while (JB.next < ac.currentTime + 0.25) {
      const i = JB.beat,
        t = JB.next + (i % 2 ? spb * 0.18 : 0);
      const m = MEL[i % MEL.length];
      if (m > 0) jbNote(ac, t, mtof(m + 12), spb * 1.6, "square", 0.05);
      if (i % 2 === 0) {
        const bm = BASS[(i / 2) % BASS.length];
        jbNote(ac, t, mtof(bm - 12), spb * 1.8, "triangle", 0.14);
      }
      if (i % 4 === 2)
        jbNote(ac, t, 1800 + Math.random() * 400, 0.04, "square", 0.015); // brushed snare-ish tick
      JB.beat++;
      JB.next += spb;
      if (JB.beat >= MEL.length * 4) {
        JB.on = false;
        break;
      }
    }
  }

  // ==================================================================
  // DATA: items, quest, dialogue
  // ==================================================================
