// play-inline-192 10 — math
// Lines 2785-2915 of readable/play-inline-192.pretty.js (statement-aligned).
  function schedule(ac) {
    const spb = 60 / 128; // 128 bpm swing
    while (M.next < ac.currentTime + 0.25) {
      const t = M.next,
        beat = M.beat,
        bar = Math.floor(beat / 4) % PROG.length,
        bb = beat % 4;
      const ch = PROG[bar];
      // walking bass (quarter notes)
      const bn =
        bb === 0
          ? ch[0]
          : bb === 2
            ? ch[2] - 12 + 12 * (Math.random() < 0.3 ? 1 : 0)
            : ch[(bb * 3 + ((Math.random() * 3) | 0)) % 4] - 12;
      note(ac, t, mtof(bn - 12), spb * 0.9, "triangle", 0.22, 0.01);
      // ride: ding ding-a ding
      hit(ac, t, 0.25, 0.05, 7000);
      if (bb % 2 === 1) hit(ac, t + spb * 0.66, 0.15, 0.035, 7500);
      // hi-hat foot on 2 & 4, brushes
      if (bb % 2 === 1) hit(ac, t, 0.06, 0.05, 4000);
      hit(ac, t, spb * 0.8, 0.012, 2500, "bandpass");
      // piano comping (Charleston-ish)
      if (
        bb === 0 ||
        (bb === 1 && Math.random() < 0.6) ||
        (bb === 2 && Math.random() < 0.3)
      ) {
        const off = bb === 1 ? spb * 0.66 : 0;
        for (const n of ch)
          note(ac, t + off, mtof(n + 12), 0.5, "triangle", 0.045, 0.005);
      }
      // piano right hand melody fragments
      if (Math.random() < 0.45) {
        const n =
          ch[(Math.random() * 4) | 0] + 24 + (Math.random() < 0.3 ? 2 : 0);
        note(
          ac,
          t + (Math.random() < 0.5 ? spb * 0.66 : 0),
          mtof(n),
          0.35,
          "sine",
          0.05,
          0.005,
        );
      }
      M.next += spb;
      M.beat++;
    }
  }
  // round 1b: the Tin Man Trio plays — sway & bob on the 128 bpm swing, the drummer strikes on 2 and 4,
  // Ivory 'comps' every other bar, Low Tide leans into the walking bass (arm one-shots + body motion).
  const BAND = { t: 0, last: -1 };
  function band(dt, ctx) {
    if (!dt || G.isStub("actors") || !G.actors.get) return;
    BAND.t += dt;
    const beatF = (BAND.t * 128) / 60,
      beat = Math.floor(beatF),
      ph = beatF - beat;
    const bots = [
      ["pv_hihat", 0.07, 0],
      ["pv_ivory", 0.04, 0.5],
      ["pv_lowtide", 0.06, 0.25],
    ];
    for (let i = 0; i < bots.length; i++) {
      const a = G.actors.get(bots[i][0]);
      if (!a || a.dead || !a.char || !a.char.root) continue;
      if (a.inCombat || (a.hostile && a.hostile())) {
        a.char.root.rotation.x = 0;
        a.char.root.rotation.z = 0;
        continue;
      }
      const sw = Math.sin((beatF / 2 + bots[i][2]) * Math.PI);
      a.char.root.rotation.z = sw * bots[i][1];
      a.char.root.rotation.x =
        Math.max(0, Math.sin(ph * Math.PI)) * bots[i][1] * 0.6;
      if (beat !== BAND.last) {
        const hit =
          (i === 0 && beat % 2 === 1) ||
          (i === 1 && beat % 8 === 2) ||
          (i === 2 && beat % 4 === 0);
        if (hit && Math.random() < 0.85) {
          try {
            a.oneShot("attack_melee");
          } catch (e) {
            /* */
          }
        }
      }
    }
    BAND.last = beat;
  }
  function update(dt, realDt, ctx) {
    const p = G.player && G.player.pos;
    if (!p) return;
    const inside = ctx.inside && G.state !== "title";
    if (inside) band(dt, ctx);
    const ac = inside ? audio() : M.ctx || null;
    if (!ac) return;
    const st = ctx.anchors.stage;
    const d = st ? Math.hypot(p.x - st.x, (p.y - st.y) * 1.5, p.z - st.z) : 99;
    // loud in the club, muffled up the stairs / in the back rooms, silent outside
    let vol = inside ? K.clamp(1.2 - d / 26, 0, 1) * 0.55 : 0;
    const inClub = inside && p.y < ctx.O.y - 3.5 && p.z - ctx.O.z < -10;
    try {
      M.lp.frequency.setTargetAtTime(inClub ? 6000 : 900, ac.currentTime, 0.2);
      M.gain.gain.setTargetAtTime(
        G.worldRunning && !G.worldRunning() ? vol * 0.3 : vol,
        ac.currentTime,
        0.3,
      );
    } catch (e) {
      /* */
    }
    if (vol > 0.01) schedule(ac);
    else M.next = ac.currentTime + 0.1;
  }

  PV.define({
    id: "vanguard",
    name: "Village Vanguard",
    interior: "village_vanguard",
    order: 20,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
  });
