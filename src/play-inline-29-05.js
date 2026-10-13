// play-inline-29 05 — ctx
// Lines 962-1149 of readable/play-inline-29.pretty.js (statement-aligned).
  I.radioChain = function (ctx, dest, o) {
    o = o || {};
    const input = ctx.createGain();
    const hp = bq(ctx, "highpass", o.hp || 230, 0.8),
      lp = bq(ctx, "lowpass", o.lp || 3600, 1.1),
      lp2 = bq(ctx, "lowpass", (o.lp || 3600) * 1.3, 0.7);
    const pres = bq(ctx, "peaking", 1400, 1.2, 4);
    const sh = ctx.createWaveShaper();
    sh.curve = S.curve(1.2, "tube");
    sh.oversample = "2x";
    const pre = ctx.createGain();
    pre.gain.value = 0.9;
    const wow = ctx.createDelay(0.1);
    wow.delayTime.value = 0.012;
    const wl = ctx.createOscillator();
    wl.frequency.value = 0.55;
    const wg = ctx.createGain();
    wg.gain.value = 0.0009;
    const fl = ctx.createOscillator();
    fl.frequency.value = 7.3;
    const fg = ctx.createGain();
    fg.gain.value = 0.00012;
    wl.connect(wg);
    wg.connect(wow.delayTime);
    fl.connect(fg);
    fg.connect(wow.delayTime);
    wl.start();
    fl.start();
    const output = ctx.createGain();
    output.gain.value = o.out === undefined ? 0.62 : o.out;
    // broadcast limiter (1940s stations rode everything hard) + DC blocker after the asymmetric tube stage
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22;
    comp.knee.value = 8;
    comp.ratio.value = 4;
    comp.attack.value = 0.008;
    comp.release.value = 0.25;
    const mk = ctx.createGain();
    mk.gain.value = 1.1;
    const dcb = bq(ctx, "highpass", 35, 0.7);
    // word-exact signal dropouts (VOX): a duck on the programme + a burst of the static, automated on the audio clock
    const duck = ctx.createGain();
    input.connect(duck);
    duck.connect(hp);
    hp.connect(lp);
    lp.connect(lp2);
    lp2.connect(comp);
    comp.connect(mk);
    mk.connect(pres);
    pres.connect(pre);
    pre.connect(sh);
    sh.connect(dcb);
    dcb.connect(wow);
    wow.connect(output);
    // vinyl crackle + hiss
    const cr = ctx.createBufferSource();
    cr.buffer = S.noiseBufs.crackle;
    cr.loop = true;
    cr.playbackRate.value = 0.7;
    const crf = bq(ctx, "highpass", 900, 0.7),
      crg = ctx.createGain();
    crg.gain.value = o.crackle === undefined ? 0.35 : o.crackle;
    cr.connect(crf);
    crf.connect(crg);
    crg.connect(output);
    cr.start(0, Math.random() * 2);
    const hs = ctx.createBufferSource();
    hs.buffer = S.noiseBufs.pink;
    hs.loop = true;
    const hsf = bq(ctx, "bandpass", 2400, 0.5),
      hsg = ctx.createGain();
    hsg.gain.value = o.hiss === undefined ? 0.012 : o.hiss;
    hs.connect(hsf);
    hsf.connect(hsg);
    hsg.connect(output);
    hs.start(0, Math.random() * 2);
    // tunable static (signal strength)
    const st = ctx.createBufferSource();
    st.buffer = S.noiseBufs.white;
    st.loop = true;
    const stf = bq(ctx, "bandpass", 1800, 0.6),
      stg = ctx.createGain();
    stg.gain.value = 0;
    const stAm = ctx.createOscillator();
    stAm.frequency.value = 0.37;
    const stAmG = ctx.createGain();
    stAmG.gain.value = 0;
    stAm.connect(stAmG);
    stAmG.connect(stg.gain);
    stAm.start();
    st.connect(stf);
    stf.connect(stg);
    stg.connect(output);
    st.start(0, Math.random() * 2);
    const dropG = ctx.createGain();
    dropG.gain.value = 0;
    stf.connect(dropG);
    dropG.connect(output);
    const hold = (prm, t) => {
      if (prm.cancelAndHoldAtTime) prm.cancelAndHoldAtTime(t);
      else {
        prm.cancelScheduledValues(t);
        prm.setValueAtTime(prm.value, t);
      }
    };
    // speech bed: while the DJ talks (speechSynthesis can't be routed into WebAudio) a faint studio room tone +
    // mains hum runs through the same AM chain, so the voice sits "inside" the radio instead of on top of it.
    const rt = ctx.createBufferSource();
    rt.buffer = S.noiseBufs.brown;
    rt.loop = true;
    const rtf = bq(ctx, "lowpass", 700, 0.7),
      rtg = ctx.createGain();
    rtg.gain.value = 0;
    const hum = ctx.createOscillator();
    hum.frequency.value = 120;
    const humg = ctx.createGain();
    humg.gain.value = 0;
    const hum2 = ctx.createOscillator();
    hum2.frequency.value = 180;
    hum2.connect(humg);
    rt.connect(rtf);
    rtf.connect(rtg);
    rtg.connect(input);
    hum.connect(humg);
    humg.connect(input);
    rt.start(0, Math.random() * 2);
    hum.start();
    hum2.start();
    output.connect(dest);
    return {
      input,
      output,
      speechBed(v) {
        const t = ctx.currentTime;
        rtg.gain.setTargetAtTime(v * 0.09, t, v ? 0.15 : 0.4);
        humg.gain.setTargetAtTime(v * 0.012, t, v ? 0.15 : 0.4);
      },
      setStatic(v, tau) {
        const t = ctx.currentTime,
          k = tau || 0.3;
        stg.gain.setTargetAtTime(v * 0.18, t, k);
        stAmG.gain.setTargetAtTime(v * 0.1, t, k);
        input.gain.setTargetAtTime(1 - v * 0.5, t, k);
      },
      crackle(v) {
        crg.gain.setTargetAtTime(v, ctx.currentTime, 0.2);
      },
      /** Static bursts over exact ctx-time spans [{t0, t1}] (the words lost to a weak signal); level 0..1. */
      scheduleDrops(spans, level) {
        const now = ctx.currentTime;
        for (const d of spans) {
          const a = Math.max(now, d.t0 - 0.03),
            b = Math.max(a + 0.04, d.t1 + 0.03);
          dropG.gain.setTargetAtTime(level * 0.2, a, 0.008);
          dropG.gain.setTargetAtTime(0, b, 0.04);
          duck.gain.setTargetAtTime(0.45, a, 0.008);
          duck.gain.setTargetAtTime(1, b, 0.05);
        }
      },
      /** Cancel pending dropouts (the line was stopped). */
      clearDrops(fade) {
        const t = ctx.currentTime,
          f = fade || 0.1;
        try {
          hold(dropG.gain, t);
          hold(duck.gain, t);
          dropG.gain.setTargetAtTime(0, t, f / 3);
          duck.gain.setTargetAtTime(1, t, f / 3);
        } catch (e) {
          /* */
        }
      },
      dispose() {
        [wl, fl, cr, hs, st, stAm, rt, hum, hum2].forEach((s) => {
          try {
            s.stop();
          } catch (e) {
            /* */
          }
        });
        try {
          output.disconnect();
        } catch (e) {
          /* */
        }
      },
    };
  };
