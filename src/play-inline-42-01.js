// play-inline-42 01 — clack
// Lines 25-362 of readable/play-inline-42.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;
  const D = S.define;

  // ------------------------------------------------------------------
  // Foley building blocks
  // ------------------------------------------------------------------
  function click(k, t, f, pk) {
    const m = k.metal(1, [f * 0.92, f * 1.63, f * 2.41], 30);
    k.chain(m.output, k.gain(0.7), k.out);
    k.burst({
      start: t,
      a: 0.0002,
      d: 0.003,
      peak: pk,
      type: "highpass",
      f: f * 0.6,
      dest: m.input,
    });
    k.burst({
      start: t,
      a: 0.0002,
      d: 0.004,
      peak: pk * 0.6,
      type: "bandpass",
      f,
      q: 1.5,
    });
  }
  function clack(k, t, base, pk) {
    const m = k.metal(
      1,
      [base, base * 2.13, base * 3.41, base * 5.2],
      18,
      [1, 0.6, 0.35, 0.15],
    );
    k.chain(m.output, k.gain(0.8), k.out);
    k.burst({
      start: t,
      a: 0.0004,
      d: 0.012,
      peak: pk,
      type: "highpass",
      f: 700,
      dest: m.input,
    });
    k.burst({
      start: t,
      a: 0.0004,
      d: 0.022,
      peak: pk * 0.65,
      type: "bandpass",
      f: base * 2.5,
      q: 1.2,
    });
  }
  /** The weight of the gun in the hands taking the impact. */
  function thump(k, t, pk) {
    k.tone({
      type: "sine",
      start: t,
      f: 150,
      f2: 70,
      glide: 0.035,
      a: 0.001,
      d: 0.05,
      peak: pk * 0.5,
    });
  }
  /** Metal sliding on metal: a swept band of noise roughened by micro-grains. */
  function scrape(k, t, d, f0, f1, pk) {
    k.burst({
      start: t,
      a: d * 0.3,
      d,
      peak: pk,
      type: "bandpass",
      f: f0,
      f2: f1,
      fT: d,
      q: 1.6,
    });
    k.grains({
      start: t,
      span: d,
      n: Math.max(3, Math.round(d * 160)),
      f: (f0 + f1) * 0.6,
      q: 1,
      gain: pk * 0.35,
      len: 0.002,
    });
  }
  /** A spring being compressed/stretched: faint metallic zing under a scrape. */
  function spring(k, t, d, f0, f1, pk) {
    const o = k.osc("sawtooth", f0 / 8, t, d + 0.05);
    k.env(o.frequency, [
      [t, f0 / 8],
      [t + d, f1 / 8, "l"],
    ]);
    const bp = k.filt("bandpass", f0, 9);
    k.env(bp.frequency, [
      [t, f0],
      [t + d, f1, "l"],
    ]);
    const g = k.gain(0);
    k.env(g.gain, [
      [t, 0.0001],
      [t + d * 0.3, pk],
      [t + d, 0.0001],
    ]);
    k.chain(o, bp, g, k.out);
  }
  /** Cartridges shifting inside a magazine / belt. */
  function rattle(k, t, span, n, f, pk) {
    const m = k.metal(1, [f, f * 1.71, f * 2.93], 25);
    k.chain(m.output, k.gain(0.6), k.out);
    k.grains({
      start: t,
      span,
      n,
      f: f * 1.2,
      q: 1,
      gain: pk,
      len: 0.003,
      dest: m.input,
    });
  }
  /** One brass casing hitting the floor and bouncing. */
  function casing(k, t, f, pk) {
    const m = k.metal(1, [f, f * 2.76, f * 5.4], 70, [1, 0.5, 0.25]);
    k.chain(m.output, k.gain(0.7), k.out);
    k.burst({
      start: t,
      a: 0.0002,
      d: 0.002,
      peak: pk,
      type: "highpass",
      f: 2000,
      dest: m.input,
    });
    const b = k.rr(0.07, 0.14);
    k.burst({
      start: t + b,
      a: 0.0002,
      d: 0.002,
      peak: pk * 0.4,
      type: "highpass",
      f: 2000,
      dest: m.input,
    });
    k.burst({
      start: t + b + k.rr(0.04, 0.07),
      a: 0.0002,
      d: 0.002,
      peak: pk * 0.15,
      type: "highpass",
      f: 2000,
      dest: m.input,
    });
  }

  const RL = {
    sr: 24000,
    variants: 2,
    gain: 0.55,
    ref: 4,
    bus: "world",
    wet: 0.35,
    maxVoices: 3,
    priority: 4,
    dedupe: 0.04,
    pitchVar: 0.04,
    lazy: true,
  };
  const R = (name, dur, build, extra) =>
    D(name, Object.assign({}, RL, { dur, build }, extra || {}));

  // --- pistol (10mm, service pistol, gyrojet, rivet gun)
  R("rl_pistol_out", 0.45, (k) => {
    click(k, 0.01, 4200, 0.7);
    thump(k, 0.015, 0.3);
    scrape(k, 0.03, 0.07, 1800, 2600, 0.35);
    rattle(k, 0.04, 0.05, 3, 3000, 0.3);
  });
  R("rl_pistol_in", 0.45, (k) => {
    scrape(k, 0, 0.06, 1500, 2300, 0.35);
    clack(k, 0.07, 1250, 1);
    thump(k, 0.07, 0.6);
    click(k, 0.078, 3800, 0.35);
  });
  R("rl_pistol_slide", 0.5, (k) => {
    scrape(k, 0, 0.06, 2400, 3600, 0.4);
    spring(k, 0, 0.06, 2800, 4200, 0.12);
    clack(k, 0.065, 1700, 0.45);
    scrape(k, 0.12, 0.025, 3600, 2400, 0.3);
    clack(k, 0.15, 1500, 1);
    thump(k, 0.15, 0.5);
  });
  // --- rifle / SMG (assault rifles, Chinese AR, sniper, SMG)
  R("rl_rifle_out", 0.6, (k) => {
    click(k, 0.01, 3000, 0.7);
    clack(k, 0.03, 900, 0.4);
    scrape(k, 0.05, 0.12, 1200, 2000, 0.4);
    rattle(k, 0.06, 0.12, 6, 2600, 0.4);
  });
  R("rl_rifle_in", 0.6, (k, v) => {
    scrape(k, 0, 0.09, 1100, 1900, 0.4);
    rattle(k, 0.02, 0.08, 4, 2600, 0.3);
    clack(k, 0.1, 950, 1);
    thump(k, 0.1, 0.7);
    if (v === 1) {
      k.burst({
        kind: "pink",
        start: 0.22,
        a: 0.001,
        d: 0.03,
        peak: 0.4,
        type: "lowpass",
        f: 800,
      });
      clack(k, 0.22, 820, 0.45);
    } // palm slap to seat it
  });
  R("rl_rifle_charge", 0.6, (k) => {
    click(k, 0, 2800, 0.4);
    scrape(k, 0.02, 0.08, 2000, 3200, 0.45);
    spring(k, 0.02, 0.08, 2200, 3600, 0.15);
    clack(k, 0.1, 1100, 0.6);
    scrape(k, 0.18, 0.03, 3200, 2000, 0.3);
    clack(k, 0.21, 1000, 1);
    thump(k, 0.21, 0.8);
  });
  // --- heavy (minigun ammo box, combat shotgun drum)
  R("rl_heavy_out", 0.8, (k) => {
    clack(k, 0.02, 600, 0.8);
    thump(k, 0.02, 0.6);
    scrape(k, 0.08, 0.2, 700, 1300, 0.45);
    rattle(k, 0.1, 0.25, 12, 1800, 0.5);
  });
  R("rl_heavy_in", 0.8, (k) => {
    scrape(k, 0, 0.15, 700, 1200, 0.45);
    clack(k, 0.17, 550, 1);
    thump(k, 0.17, 1);
    click(k, 0.3, 2600, 0.6);
    clack(k, 0.3, 900, 0.6);
    rattle(k, 0.32, 0.1, 6, 1800, 0.35);
  });
  // --- revolver (.32, .44, Closing Bell)
  R("rl_revolver_open", 0.6, (k) => {
    click(k, 0.01, 3500, 0.6);
    scrape(k, 0.03, 0.06, 2000, 1400, 0.3);
    clack(k, 0.09, 1700, 0.6);
    scrape(k, 0.2, 0.05, 1500, 2500, 0.3);
    rattle(k, 0.24, 0.1, 8, 3800, 0.5);
  });
  R("rl_revolver_in", 0.4, (k) => {
    scrape(k, 0, 0.05, 2500, 1800, 0.3);
    for (let i = 0; i < 6; i++)
      click(k, 0.05 + i * k.rr(0.006, 0.012), 3000 + k.rr(-200, 200), 0.35);
    click(k, 0.15, 2200, 0.5);
    k.burst({
      kind: "pink",
      start: 0.2,
      a: 0.002,
      d: 0.04,
      peak: 0.25,
      type: "bandpass",
      f: 900,
      q: 0.8,
    });
  });
  R("rl_revolver_close", 0.7, (k) => {
    clack(k, 0.01, 1600, 1);
    thump(k, 0.01, 0.6);
    let t = 0.05,
      g = 0.5,
      dt = 0.02; // the cylinder spun: pawl ratchet running down
    for (let i = 0; i < 11 && t < 0.6; i++) {
      click(k, t, 3200, g);
      t += dt;
      dt *= 1.14;
      g *= 0.85;
    }
  });
  // --- bolt / single-shot (hunting rifle, .32 bolt rifle, BB gun)
  R("rl_bolt_open", 0.45, (k) => {
    click(k, 0, 2600, 0.5);
    clack(k, 0.01, 1300, 0.5);
    scrape(k, 0.06, 0.09, 1800, 2800, 0.4);
    clack(k, 0.15, 1400, 0.6);
  });
  R(
    "rl_round_in",
    0.3,
    (k) => {
      scrape(k, 0, 0.04, 2600, 3400, 0.35);
      click(k, 0.045, 3000, 0.6);
      casing(k, 0.05, 5200, 0.12);
    },
    { variants: 3 },
  );
  R("rl_bolt_close", 0.45, (k) => {
    scrape(k, 0, 0.07, 2800, 1800, 0.4);
    clack(k, 0.08, 1250, 0.8);
    clack(k, 0.14, 1500, 0.9);
    thump(k, 0.14, 0.6);
  });
  // --- launchers (missile launcher, recoilless rifle)
  R("rl_launcher_open", 0.7, (k) => {
    clack(k, 0.02, 450, 1);
    thump(k, 0.02, 0.9);
    k.tone({
      type: "sawtooth",
      start: 0.08,
      f: 420,
      f2: 330,
      glide: 0.18,
      a: 0.02,
      d: 0.18,
      peak: 0.05,
      filter: ["bandpass", 1800, 4],
    });
    scrape(k, 0.1, 0.12, 900, 600, 0.35);
  });
  R("rl_launcher_load", 0.75, (k) => {
    scrape(k, 0, 0.25, 500, 900, 0.5);
    rattle(k, 0.05, 0.2, 6, 1400, 0.3);
    clack(k, 0.28, 400, 1);
    thump(k, 0.28, 1);
  });
  R("rl_launcher_close", 0.6, (k) => {
    clack(k, 0.02, 500, 1);
    thump(k, 0.02, 1);
    click(k, 0.1, 2000, 0.7);
    clack(k, 0.1, 1100, 0.4);
  });
  // --- break action (sawed-off)
