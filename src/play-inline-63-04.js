// play-inline-63 04 — color
// Lines 592-840 of readable/play-inline-63.pretty.js (statement-aligned).
  FX.impact = function (pos, normal, surface, opts) {
    if (!ready() || !pos) return;
    opts = opts || {};
    const p = toV(pos, _ip),
      n = dirOf(normal, _in);
    const kind = opts.kind || "bullet";
    const sc = opts.scale || (kind === "shotgun" ? 0.6 : 1);
    const S = SURF[surface] || SURF.concrete;
    if (S.flesh) {
      FX.blood(p, n, sc, opts.color);
      return;
    }
    if (S.water) {
      FX.splash(p, sc * (kind === "melee" ? 0.5 : 1));
      return;
    }
    // energy impacts
    if (kind === "laser") {
      const col = A.color(
        opts.color !== undefined ? opts.color : 0xff3018,
        _ic,
      );
      A.psAdd.spawn({
        pos: p,
        size: 0.6 * sc,
        size1: 0.2,
        life: 0.18,
        color: col,
        intensity: 5,
        frame: FR.GLOW,
        fadeIn: 0.01,
      });
      A.psAdd.spawn({
        pos: p,
        size: 0.45 * sc,
        size1: 0.1,
        life: 0.08,
        color: 0xffffff,
        intensity: 4,
        frame: FR.STAR,
        fadeIn: 0.01,
      });
      const cnt = 7;
      for (let i = 0; i < cnt; i++) {
        A.coneDir(n, 1.1, _d);
        const sp = rr(2, 7);
        A.psAdd.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp,
          vz: _d.z * sp,
          size: 0.025,
          life: rr(0.2, 0.5),
          color: col,
          intensity: 5,
          frame: kind === "plasma" ? FR.GLOW : FR.STREAK,
          stretch: kind === "plasma" ? 0 : 0.03,
          grav: kind === "plasma" ? 0.8 : 0.6,
          bounce: true,
          drag: 1,
        });
      }
      A.psAlpha.spawn({
        pos: p,
        vx: n.x * 0.4,
        vy: n.y * 0.4 + 0.3,
        vz: n.z * 0.4,
        size: 0.12,
        size1: 0.6,
        life: 1.1,
        color: 0x3a3632,
        alpha: 0.3,
        frame: FR.SMOKE3,
        drag: 1.5,
        wind: 0.5,
      });
      FX.flash(p, col, 1.5, 0.1, { range: 6 });
      if (opts.decal !== false) FX.decal(p, n, "laser", { size: 0.22 });
      return;
    }
    // dust puff
    const dustN = S.soft ? 3 : 2;
    for (let i = 0; i < dustN; i++) {
      A.coneDir(n, 0.6, _d);
      const sp = rr(0.5, 1.8);
      A.psAlpha.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.12 * sc,
        size1: rr(0.5, 0.9) * sc,
        life: rr(0.7, 1.4),
        color: S.dust,
        alpha: S.soft ? 0.5 : 0.4,
        frame: FR.DUST,
        drag: 3,
        wind: 0.4,
        grav: -0.02,
        rotv: rr(-1, 1),
        fadeIn: 0.03,
        fadeOut: 0.35,
      });
    }
    // directional JET: a fast, tight burst of pulverised material shot out along the normal
    // that brakes hard and hangs — reads as the hit even at 40 m (the slow puffs above are the haze)
    const jetN = S.soft ? 3 : 2;
    for (let i = 0; i < jetN; i++) {
      A.coneDir(n, S.soft ? 0.28 : 0.2, _d);
      const sp = rr(5, 9.5);
      A.psAlpha.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp + (S.soft ? 1.2 : 0),
        vz: _d.z * sp,
        size: 0.05 * sc,
        size1: rr(0.3, 0.5) * sc,
        life: rr(0.35, 0.65),
        color: S.dust,
        alpha: S.soft ? 0.62 : 0.5,
        frame: FR.DUST,
        drag: 7.5,
        wind: 0.3,
        grav: S.soft ? 0.25 : 0,
        rotv: rr(-2, 2),
        fadeIn: 0.005,
        fadeOut: 0.55,
        lit: 1,
      });
    }
    // chips / splinters / dirt clods
    const chipN = S.soft ? 9 : S.splinter ? 7 : 6;
    for (let i = 0; i < chipN; i++) {
      A.coneDir(n, S.soft ? 0.5 : 0.9, _d);
      const sp = rr(2.5, S.soft ? 6 : 8);
      A.psAlpha.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: rr(0.02, 0.05) * sc,
        life: rr(0.5, 1.1),
        color: S.chip,
        alpha: 1,
        frame: S.splinter ? FR.STREAK : FR.DEBRIS,
        stretch: S.splinter ? 0.01 : 0,
        grav: 1.1,
        bounce: true,
        rotv: rr(-12, 12),
        fadeIn: 0.001,
        fadeOut: 0.8,
        lit: 1,
      });
    }
    if (S.grass)
      for (let i = 0; i < 5; i++) {
        A.coneDir(n, 0.6, _d);
        const sp = rr(1.5, 4);
        A.psAlpha.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp,
          vz: _d.z * sp,
          size: 0.05,
          life: rr(0.8, 1.4),
          color: 0x6a6a38,
          frame: FR.FLAKE,
          grav: 0.35,
          drag: 1.5,
          rotv: rr(-8, 8),
          bounce: true,
        });
      }
    // sparks
    const sparkN = Math.round(
      (S.metal ? 10 : 4) * S.sparks * (0.6 + Math.random() * 0.8),
    );
    for (let i = 0; i < sparkN; i++) {
      A.coneDir(n, 0.8, _d);
      const sp = rr(4, S.metal ? 14 : 9);
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.02,
        life: rr(0.15, S.metal ? 0.6 : 0.3),
        color: 0xffb860,
        intensity: 6,
        color1: 0xff5010,
        intensity1: 3,
        frame: FR.STREAK,
        stretch: 0.025,
        grav: 1,
        bounce: true,
        drag: 0.8,
      });
    }
    if (S.metal) {
      A.psAdd.spawn({
        pos: p,
        size: 0.25 * sc,
        life: 0.05,
        color: 0xffd090,
        intensity: 5,
        frame: FR.STAR,
        fadeIn: 0.01,
      });
      if (Math.random() < 0.5) FX.flash(p, 0xffb060, 1.2, 0.06, { range: 5 });
    }
    if (S.glass)
      for (let i = 0; i < 8; i++) {
        A.coneDir(n, 0.9, _d);
        const sp = rr(2, 6);
        A.psAdd.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp,
          vz: _d.z * sp,
          size: 0.03,
          life: rr(0.4, 0.9),
          color: 0xd8f0ff,
          intensity: 1.2,
          frame: FR.FLAKE,
          grav: 1,
          bounce: true,
          rotv: rr(-15, 15),
          flicker: true,
        });
      }
    if (opts.decal !== false && S.decal)
      FX.decal(p, n, S.decal, kind === "shotgun" ? { size: 0.11 } : undefined);
  };

  // ------------------------------------------------------------------
  // Blood & gore
  // ------------------------------------------------------------------
  const BLOOD = {
    red: { c: 0x6a0a06, mist: 0x5a0a08, decal: "blood" },
    green: { c: 0x4a7a12, mist: 0x5a8a1a, decal: "blood_green" },
    violet: { c: 0x4a1a4a, mist: 0x3a1a3a, decal: "blood" }, // Brutes, Colossus, some creatures
    blue: { c: 0x1e3c86, mist: 0x2a4a8a, decal: "oil" }, // Shellbacks (copper-based blood)
    shellback: { c: 0x1e3c86, mist: 0x2a4a8a, decal: "oil" },
    glowing: { c: 0x6aff3a, mist: 0x6aff3a, decal: "goo", glow: true },
    oil: { c: 0x0e0c0a, mist: 0x2a2826, decal: "oil", robot: true },
    robot: { c: 0x0e0c0a, mist: 0x2a2826, decal: "oil", robot: true },
  };
  const _down = new THREE.Vector3(0, -1, 0);
  /** Blood spray at pos travelling along dir. amount ~1 per hit (2–4 for dismemberment). color: red|green|violet|blue|oil|glowing|hex */
