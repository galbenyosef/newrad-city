/* src/sound/66_reload_foley.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 66_reload_foley.js
 * WEAPON HANDLING FOLEY — per-weapon, per-phase reload sounds.
 *
 * The weapons module plays the generic 'reload' at EVERY step of its reload
 * animation (mag out, mag in, charging handle; cylinder open/insert/close;
 * bolt open, each round, bolt close), marking the step with a pitch. That
 * fired the whole 1.35 s mag-out/mag-in/charge sequence two or three times
 * over itself. Now one short sound is synced to each step:
 *
 *   - phase recipes per weapon class: pistol (mag out / in / slide), rifle &
 *     SMG (mag out / in / charging handle), heavy (minigun ammo box, drum),
 *     revolver (crane open + ejector + brass, speedloader, close + ratchet),
 *     bolt/single (bolt open, round in, bolt close), launcher (recoilless,
 *     missile), break-action, battery / fuel canister (latch + ready chirp), lever;
 *     the dropped magazine and the revolver's brass hitting the floor.
 *   - BRIDGE (90_main.js → S.reloadFoley): a non-positional 'reload' (and the
 *     quiet 'ricochet' the reload uses as a mag drop) is resolved to the
 *     phase recipe from the equipped weapon's reloadType/viewmodel and the
 *     step's pitch marker. Weapons can call the rl_* names directly instead
 *     (request in NOTES.md); the bridge then never triggers.
 * ===================================================================== */
(function () {
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
  R("rl_break_open", 0.6, (k) => {
    click(k, 0, 2400, 0.6);
    clack(k, 0.04, 700, 0.8);
    thump(k, 0.04, 0.5);
    k.tone({
      type: "sine",
      start: 0.13,
      f: 900,
      f2: 600,
      glide: 0.04,
      a: 0.001,
      d: 0.04,
      peak: 0.2,
    });
    scrape(k, 0.15, 0.05, 2000, 1500, 0.3);
    k.burst({
      kind: "pink",
      start: 0.35,
      a: 0.001,
      d: 0.03,
      peak: 0.3,
      type: "bandpass",
      f: 600,
      q: 1.2,
    });
    k.burst({
      kind: "pink",
      start: 0.43,
      a: 0.001,
      d: 0.03,
      peak: 0.22,
      type: "bandpass",
      f: 650,
      q: 1.2,
    });
  });
  R("rl_break_close", 0.4, (k) => {
    clack(k, 0.01, 800, 1);
    thump(k, 0.01, 1);
    click(k, 0.02, 3000, 0.5);
  });
  // --- battery / canister (siren horn's lantern battery; flamer fuel)
  R("rl_cell_in", 0.5, (k) => {
    scrape(k, 0, 0.06, 1600, 2200, 0.3);
    click(k, 0.07, 3200, 0.8);
    clack(k, 0.07, 1500, 0.5);
    k.tone({
      type: "square",
      start: 0.13,
      f: 1760,
      f2: 2350,
      glide: 0.02,
      a: 0.002,
      d: 0.05,
      peak: 0.1,
      filter: ["lowpass", 3000],
    });
    k.tone({
      type: "sine",
      start: 0.19,
      f: 3520,
      a: 0.002,
      d: 0.04,
      peak: 0.08,
    });
  });
  // --- lever action cycle (BB gun)
  R(
    "rl_lever",
    0.35,
    (k) => {
      scrape(k, 0, 0.05, 2000, 2800, 0.35);
      clack(k, 0.06, 1300, 0.8);
    },
    { variants: 3 },
  );
  // --- the floor
  R(
    "rl_mag_drop",
    0.7,
    (k) => {
      clack(k, 0, 1600, 0.8);
      clack(k, k.rr(0.1, 0.14), 1700, 0.4);
      scrape(k, 0.2, 0.08, 1400, 900, 0.2);
    },
    { wet: 0.8 },
  );
  R(
    "rl_brass_drop",
    1.2,
    (k) => {
      const n = 4 + ((k.r() * 3) | 0);
      for (let i = 0; i < n; i++)
        casing(k, k.rr(0, 0.35), k.rr(3000, 4600), k.rr(0.5, 1));
    },
    { wet: 0.8, gain: 0.4 },
  );

  // ------------------------------------------------------------------
  // Bridge: the weapons module's pitch-marked 'reload' steps → phase recipes
  // ------------------------------------------------------------------
  const CLASS_SETS = {
    pistol: ["rl_pistol_out", "rl_pistol_in", "rl_pistol_slide", "rl_mag_drop"],
    rifle: ["rl_rifle_out", "rl_rifle_in", "rl_rifle_charge", "rl_mag_drop"],
    heavy: ["rl_heavy_out", "rl_heavy_in", "rl_rifle_charge"],
    revolver: [
      "rl_revolver_open",
      "rl_revolver_in",
      "rl_revolver_close",
      "rl_brass_drop",
    ],
    bolt: ["rl_bolt_open", "rl_round_in", "rl_bolt_close", "rl_lever"],
    launcher: ["rl_launcher_open", "rl_launcher_load", "rl_launcher_close"],
    breakaction: ["rl_break_open", "rl_break_close"],
    cell: ["rl_cell_in"],
  };
  function weaponClass(cur) {
    const w = cur.weapon || {},
      rt = w.reloadType || "mag",
      vm = String(w.viewmodel || cur.id || "");
    if (rt === "melee" || rt === "throw") return null;
    if (rt === "revolver") return "revolver";
    if (rt === "breakaction") return "breakaction";
    if (rt === "cell") return "cell";
    if (rt === "single" || rt === "bb")
      return /missile|recoilless/.test(vm) ? "launcher" : "bolt";
    if (rt === "drum" || /minigun|belt_fed/.test(vm)) return "heavy";
    return /pistol|rivet/.test(vm) ? "pistol" : "rifle";
  }
  function current() {
    try {
      return !G.isStub("weapons") && G.weapons.current
        ? G.weapons.current()
        : null;
    } catch (e) {
      return null;
    }
  }
  /**
   * Resolve a player (non-positional) 'reload' / reload-time 'ricochet' to the phase recipe. Returns the recipe name
   * or null to leave the call alone. Pitch markers used by src/weapons/55_actions.js: mag 1.15 out · 0.92 in · 1.35
   * charge (jam: 1.2 charge); revolver 1.35 open · 0.95 in · 1.5 close; single 1.4 open · 1.25–1.35 round · 1.0 close;
   * break 1.2 open · 0.85 close; lever cycle 1.8 / 2.0.
   */
  S.reloadFoley = function (name, opts) {
    if (opts.pos || opts._exact) return null;
    const cur = current();
    if (!cur || !cur.weapon) return null;
    const cls = weaponClass(cur);
    if (!cls) return null;
    const p = opts.pitch || 1;
    let reloading = true;
    try {
      if (G.weapons.isReloading) reloading = !!G.weapons.isReloading();
    } catch (e) {
      /* */
    }
    if (name === "ricochet") {
      if (!reloading || (opts.volume === undefined ? 1 : opts.volume) > 0.2)
        return null;
      return cls === "revolver"
        ? "rl_brass_drop"
        : cls === "pistol" || cls === "rifle"
          ? "rl_mag_drop"
          : null;
    }
    if (name !== "reload") return null;
    if (cur.weapon.cycle === "lever" && p >= 1.7) return "rl_lever";
    switch (cls) {
      case "revolver":
        return p >= 1.45
          ? "rl_revolver_close"
          : p >= 1.2
            ? "rl_revolver_open"
            : "rl_revolver_in";
      case "bolt":
        return p >= 1.38
          ? "rl_bolt_open"
          : p >= 1.15
            ? "rl_round_in"
            : "rl_bolt_close";
      case "launcher":
        return p >= 1.38
          ? "rl_launcher_open"
          : p >= 1.15
            ? "rl_launcher_load"
            : "rl_launcher_close";
      case "breakaction":
        return p >= 1.05 ? "rl_break_open" : "rl_break_close";
      case "cell":
        return "rl_cell_in";
      default: {
        const set = CLASS_SETS[cls];
        if (!reloading || p >= 1.25)
          return cls === "pistol" ? "rl_pistol_slide" : "rl_rifle_charge"; // charging / jam clear
        return p >= 1.05 ? set[0] : set[1];
      }
    }
  };
  /** Bake the equipped weapon's handling set ahead of the first reload. */
  function hintFor(cur) {
    const cls = cur && weaponClass(cur),
      set = cls && CLASS_SETS[cls];
    if (set)
      for (const n of set) {
        S.hintBake(n, 1);
        S.pinned.add(n);
      }
  }
  G.events.on("weaponEquipped", () => {
    // unpin the previous weapon's set (the report pins are handled elsewhere); pin the new one
    for (const c in CLASS_SETS)
      for (const n of CLASS_SETS[c]) S.pinned.delete(n);
    setTimeout(() => hintFor(current()), 0);
  });
  S.RELOAD_SETS = CLASS_SETS;
})();
