// play-inline-25 07 — gain
// Lines 1864-2210 of readable/play-inline-25.pretty.js (statement-aligned).
  D("ricochet", {
    dur: 0.8,
    variants: 4,
    gain: 0.45,
    ref: 6,
    maxVoices: 3,
    priority: 3,
    dedupe: 0.05,
    channels: 2,
    build(k) {
      const f0 = k.rr(2600, 4300),
        f1 = f0 * k.rr(0.45, 0.6);
      const o = k.osc("sine", f0, 0, 0.6);
      k.env(o.frequency, [
        [0, f0],
        [0.55, f1],
      ]);
      const v = k.osc("sine", k.rr(25, 40), 0, 0.6),
        vg = k.gain(f0 * 0.02);
      k.chain(v, vg, o.frequency);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.01, 0.6],
        [0.55, 0.0001],
      ]);
      const p = k.pan(0);
      k.env(p.pan, [
        [0, k.rr(-0.6, 0.6)],
        [0.5, k.rr(-1, 1), "l"],
      ]);
      k.chain(o, g, p, k.out);
      k.burst({ a: 0.0002, d: 0.01, peak: 0.9, type: "highpass", f: 3000 });
      k.burst({
        start: 0.005,
        a: 0.01,
        d: 0.3,
        peak: 0.25,
        type: "bandpass",
        f: 3000,
        f2: 1500,
        fT: 0.3,
        q: 3,
      });
    },
  });
  // Near-miss flyby: the supersonic "crack" (a sharp N-wave) + a Doppler "zzip" of turbulent air, panned across the head.
  // bullet_whiz_lr / _rl travel left→right / right→left (G.sfx.play picks one from the bullet's direction relative to
  // the listener — opts.dir, or the shot that was just fired); plain bullet_whiz picks a random side.
  const whiz = (fixed) => ({
    dur: 0.35,
    variants: fixed ? 3 : 4,
    gain: 0.5,
    ref: 3,
    maxVoices: 3,
    priority: 3,
    dedupe: 0.03,
    channels: 2,
    pitchVar: 0.08,
    build(k) {
      const side = fixed || (k.rr(0, 1) < 0.5 ? -1 : 1);
      const p = k.pan(0);
      k.env(p.pan, [
        [0, -0.7 * side],
        [0.09, 0.8 * side, "l"],
        [0.3, 0.9 * side, "l"],
      ]);
      const g = k.gain(1);
      k.chain(g, p, k.out);
      k.burst({
        a: 0.0001,
        d: 0.004,
        peak: 1,
        type: "highpass",
        f: 2200,
        dest: g,
      }); // crack
      k.burst({
        start: 0.001,
        a: 0.0001,
        d: 0.003,
        peak: 0.6,
        type: "bandpass",
        f: 1200,
        q: 0.8,
        dest: g,
      }); // N-wave tail
      const f0 = k.rr(3600, 4800);
      k.burst({
        start: 0.003,
        a: 0.018,
        d: 0.11,
        peak: 0.55,
        type: "bandpass",
        f: f0,
        f2: f0 * 0.45,
        fT: 0.12,
        q: 5,
        dest: g,
      }); // zzip (Doppler fall)
      k.burst({
        start: 0.01,
        a: 0.03,
        d: 0.18,
        peak: 0.12,
        type: "lowpass",
        f: 900,
        dest: g,
      }); // air wake
    },
  });
  D("bullet_whiz", whiz(0));
  D("bullet_whiz_lr", whiz(1));
  D("bullet_whiz_rl", whiz(-1));
  D("laser_impact", {
    dur: 0.45,
    variants: 2,
    gain: 0.5,
    ref: 4,
    maxVoices: 4,
    priority: 2,
    dedupe: 0,
    build(k) {
      k.grains({
        start: 0,
        span: 0.25,
        n: 26,
        f: 5000,
        q: 0.8,
        gain: 0.6,
        len: 0.003,
        skew: 1.5,
      });
      k.tone({
        type: "sine",
        f: 1800,
        f2: 300,
        glide: 0.1,
        a: 0.001,
        d: 0.1,
        peak: 0.5,
      });
      k.burst({ a: 0.005, d: 0.3, peak: 0.3, type: "highpass", f: 3500 });
    },
  });
  // ------------------------------------------------------------------
  // Grenades / mines / minigun extras
  // ------------------------------------------------------------------
  D("grenade_pin", {
    dur: 0.35,
    variants: 1,
    gain: 0.4,
    ref: 3,
    priority: 5,
    build(k) {
      clack(k, 0.0, 2200, 0.4);
      k.tone({
        type: "sine",
        start: 0.03,
        f: 3400,
        a: 0.001,
        d: 0.25,
        peak: 0.15,
      });
    },
  });
  D("grenade_throw", {
    dur: 0.45,
    variants: 2,
    gain: 0.45,
    ref: 3,
    priority: 5,
    dedupe: 0.1,
    build(k) {
      const n = k.noise("white", 0, 0.35),
        f = k.filt("bandpass", 600, 2);
      k.env(f.frequency, [
        [0, 500],
        [0.15, 1500],
        [0.32, 600],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.14, 0.7],
        [0.32, 0.0001],
      ]);
      k.chain(n, f, g, k.out);
      k.voice({
        start: 0.02,
        dur: 0.18,
        f0: [
          [0, 150],
          [0.18, 120],
        ],
        vowels: [[0, "uh"]],
        breath: 0.6,
        gain: 0.25,
      });
    },
  });
  D("grenade_bounce", {
    dur: 0.3,
    variants: 3,
    gain: 0.45,
    ref: 5,
    maxVoices: 4,
    priority: 4,
    dedupe: 0,
    pitchVar: 0.12,
    build(k) {
      clack(k, 0, k.rr(700, 1000), 0.6);
    },
  });
  D("mine_beep", {
    dur: 0.2,
    variants: 1,
    gain: 0.35,
    ref: 4,
    maxVoices: 4,
    priority: 5,
    dedupe: 0,
    pitchVar: 0,
    build(k) {
      k.tone({
        type: "square",
        f: 2350,
        a: 0.002,
        d: 0.08,
        peak: 0.5,
        filter: ["lowpass", 4000],
      });
    },
  });
  D("minigun_spinup", {
    dur: 0.9,
    variants: 1,
    gain: 0.55,
    ref: 10,
    priority: 4,
    build(k) {
      const o = k.osc("sawtooth", 60, 0, 0.9);
      k.env(o.frequency, [
        [0, 50],
        [0.8, 420],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.0001],
        [0.3, 0.4],
        [0.85, 0.5],
        [0.9, 0.0001],
      ]);
      k.chain(o, k.filt("bandpass", 900, 1.5), g, k.out);
      const r = k.noise("white", 0, 0.9),
        rf = k.filt("bandpass", 1600, 2),
        rg = k.gain(0);
      k.env(rg.gain, [
        [0, 0.0001],
        [0.8, 0.25],
        [0.9, 0.0001],
      ]);
      k.chain(r, rf, rg, k.out);
    },
  });
  D("minigun_spindown", {
    dur: 1.3,
    variants: 1,
    gain: 0.5,
    ref: 10,
    priority: 4,
    build(k) {
      const o = k.osc("sawtooth", 420, 0, 1.3);
      k.env(o.frequency, [
        [0, 420],
        [1.2, 40],
      ]);
      const g = k.gain(0);
      k.env(g.gain, [
        [0, 0.5],
        [1.25, 0.0001],
      ]);
      k.chain(o, k.filt("bandpass", 800, 1.5), g, k.out);
      k.grains({
        start: 0.05,
        span: 1.0,
        n: 10,
        f: 2500,
        q: 3,
        gain: 0.25,
        len: 0.006,
        skew: 0.7,
      });
    },
  });
  D("minigun_spin", {
    dur: 2,
    loop: true,
    gain: 0.45,
    ref: 10,
    sr: 32000,
    priority: 5,
    gen(d, sr, r, n) {
      const a = d[0],
        f = 420;
      let ph = 0,
        lp = 0;
      for (let i = 0; i < n; i++) {
        ph += f / sr;
        if (ph > 1) ph -= 1;
        const saw = ph * 2 - 1,
          rot = 0.6 + 0.4 * Math.sin((2 * Math.PI * 42 * i) / sr);
        lp += (r() * 2 - 1 - lp) * 0.3;
        a[i] = (saw * 0.35 + lp * 0.25) * rot;
      }
    },
  });
  // aliases so weapon defs with slightly different naming still work
  [
    ["gun_10mm", "gun_pistol"],
    ["gun_32", "gun_pistol"],
    ["gun_44", "gun_magnum"],
    ["gun_revolver", "gun_magnum"],
    ["gun_assault", "gun_rifle"],
    ["gun_assault_rifle", "gun_rifle"],
    ["gun_combat_shotgun", "gun_shotgun"],
    ["gun_sawedoff", "gun_shotgun"],
    ["gun_launcher", "gun_missile"],
    ["gun_missile_launcher", "gun_missile"],
    ["gun_recoilless_rifle", "gun_recoilless"],
    ["gun_bbgun", "gun_bb"],
    ["gun_gyrojet_pistol", "gun_gyrojet"],
    ["gun_gyrojet_carbine", "gun_gyrojet"],
    ["gun_rivet_gun", "gun_rivet"],
    ["gun_sniper_rifle", "gun_sniper"],
    ["gun_hunting_rifle", "gun_hunting"],
    ["flamer", "gun_flamer"],
    ["impact", "bullet_impact"],
    ["impact_metal", "bullet_impact_metal"],
    ["swing", "melee_swing"],
    ["reload_pistol", "reload"],
    ["reload_rifle", "reload"],
    ["draw", "weapon_draw"],
    ["holster", "weapon_holster"],
    ["throw", "grenade_throw"],
  ].forEach((a) => S.aliasOf(a[0], a[1]));
  // report → environment tail class (S.play layers gtail_<env>_<class> under it); ray emitters / rockets get a lighter tail
