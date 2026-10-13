// play-inline-63 05 — color
// Lines 841-1176 of readable/play-inline-63.pretty.js (statement-aligned).
  FX.blood = function (pos, dir, amount, color) {
    if (!ready() || !pos) return;
    amount = amount === undefined ? 1 : Math.max(0.2, Math.min(5, amount));
    let B = BLOOD.red;
    if (typeof color === "string" && BLOOD[color]) B = BLOOD[color];
    else if (
      color !== undefined &&
      color !== null &&
      typeof color !== "string"
    ) {
      const c = A.color(color);
      B = {
        c: c.getHex(),
        mist: c.getHex(),
        decal: c.g > c.r ? "blood_green" : "blood",
      };
    }
    const p = toV(pos, _bp),
      d = dirOf(dir || _bd.set(0, 0, 1), _bd);
    // mist
    for (let i = 0; i < 2; i++) {
      A.coneDir(d, 0.7, _d);
      const sp = rr(0.5, 2);
      A.psAlpha.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp + 0.2,
        vz: _d.z * sp,
        size: 0.15 * amount,
        size1: rr(0.5, 0.9) * Math.sqrt(amount),
        life: rr(0.35, 0.7),
        color: B.mist,
        alpha: 0.55,
        frame: FR.DUST,
        drag: 4,
        fadeIn: 0.02,
      });
    }
    // droplets
    const n = Math.round(7 * amount);
    for (let i = 0; i < n; i++) {
      A.coneDir(d, 0.55, _d);
      const sp = rr(1.5, 5.5);
      if (B.glow)
        A.psAdd.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp + 1,
          vz: _d.z * sp,
          size: rr(0.03, 0.07),
          life: rr(0.6, 1.2),
          color: B.c,
          intensity: 2.5,
          frame: FR.DROP,
          grav: 1,
          stick: true,
          stretch: 0.03,
        });
      else
        A.psAlpha.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp + 1,
          vz: _d.z * sp,
          size: rr(0.03, 0.07),
          life: rr(0.6, 1.2),
          color: B.c,
          alpha: 1,
          frame: FR.DROP,
          grav: 1,
          stick: true,
          stretch: 0.03,
          lit: 0.7,
          fadeOut: 0.8,
        });
    }
    if (B.robot) {
      FX.sparks(p, { count: 6 + ((4 * amount) | 0), dir: d });
      A.psAlpha.spawn({
        pos: p,
        vy: 0.8,
        size: 0.3,
        size1: 1.4,
        life: 1.6,
        color: 0x2a2826,
        alpha: 0.5,
        frame: FR.SMOKE2,
        wind: 0.5,
        drag: 1,
      });
    }
    // decals: splatter on the wall behind and a pool on the ground
    try {
      const hitW = G.world.raycast(p, d, 2.6, {
        ignoreTags: ["actor", "interactable_self"],
      });
      if (hitW)
        FX.decal(hitW.point, hitW.normal, B.decal, {
          size: rr(0.5, 0.9) * Math.sqrt(amount),
        });
      _v.copy(p).addScaledVector(d, rr(0.3, 1.2));
      _v.y = p.y + 0.2;
      const hitG = G.world.raycast(_v, _down, 4, {
        ignoreTags: ["actor", "interactable_self"],
      });
      if (hitG && hitG.normal.y > 0.5)
        FX.decal(
          hitG.point,
          hitG.normal,
          amount > 1.5 && Math.random() < 0.4
            ? B.decal === "blood"
              ? "blood_smear"
              : B.decal
            : B.decal,
          { size: rr(0.5, 1.0) * Math.sqrt(amount) },
        );
    } catch (e) {
      /* ignore */
    }
  };
  /** Gibs (chunks) for dismemberment/explosions. */
  FX.gibs = function (pos, count, color) {
    if (!ready() || !pos) return;
    const p = toV(pos);
    const B = (typeof color === "string" && BLOOD[color]) || BLOOD.red;
    for (let i = 0; i < (count || 8); i++) {
      A.randDir(_d);
      _d.y = Math.abs(_d.y) + 0.4;
      const sp = rr(3, 8);
      A.psAlpha.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: rr(0.08, 0.18),
        life: rr(2, 4),
        color: B.robot ? 0x3a3834 : 0x5a1410,
        frame: FR.DEBRIS,
        grav: 1.1,
        bounce: true,
        rotv: rr(-10, 10),
        fadeOut: 0.85,
        lit: 1,
      });
    }
    FX.blood(p, UP, 3, color);
  };

  // ------------------------------------------------------------------
  // Small generic effects
  // ------------------------------------------------------------------
  /** Spark shower. opts: {count, color, dir, speed, spread} */
  FX.sparks = function (pos, opts) {
    if (!ready() || !pos) return;
    opts = opts || {};
    const p = toV(pos),
      d = dirOf(opts.dir || UP, new THREE.Vector3());
    const col = opts.color !== undefined ? opts.color : 0xffc070;
    const n = opts.count || 14,
      spd = opts.speed || 7;
    for (let i = 0; i < n; i++) {
      A.coneDir(d, opts.spread || 1.2, _d);
      const sp = rr(0.4, 1.2) * spd;
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.022,
        life: rr(0.25, 0.8),
        color: col,
        intensity: 6,
        color1: 0xff4a10,
        intensity1: 2,
        frame: FR.STREAK,
        stretch: 0.03,
        grav: 1,
        bounce: true,
        drag: 0.6,
      });
    }
    A.psAdd.spawn({
      pos: p,
      size: 0.5,
      life: 0.06,
      color: col,
      intensity: 4,
      frame: FR.STAR,
      fadeIn: 0.01,
    });
    if (opts.light !== false) FX.flash(p, col, 1.4, 0.08, { range: 6 });
  };
  /** Electric arc crackle (robots, broken power lines). */
  FX.arc = function (pos, opts) {
    if (!ready() || !pos) return;
    opts = opts || {};
    const p = toV(pos),
      col = opts.color !== undefined ? opts.color : 0x9ad8ff;
    for (let i = 0; i < (opts.count || 3); i++) {
      A.randDir(_d);
      A.psAdd.spawn({
        pos: p.clone().addScaledVector(_d, 0.2),
        size: rr(0.3, 0.7) * (opts.scale || 1),
        life: rr(0.05, 0.12),
        color: col,
        intensity: 5,
        frame: FR.ARC,
        rot: rr(0, 6.28),
        fadeIn: 0.01,
      });
    }
    A.psAdd.spawn({
      pos: p,
      size: 1.2 * (opts.scale || 1),
      life: 0.1,
      color: col,
      intensity: 1.5,
      frame: FR.GLOW,
      fadeIn: 0.01,
    });
    if (Math.random() < 0.5) FX.flash(p, col, 1.2, 0.07, { range: 6 });
  };
  /** Dust puff (footfalls of big creatures, falling debris, landing). opts: {scale, color, count} */
  FX.dust = function (pos, opts) {
    if (!ready() || !pos) return;
    opts = typeof opts === "number" ? { scale: opts } : opts || {};
    const p = toV(pos),
      sc = opts.scale || 1;
    const col = opts.color !== undefined ? opts.color : 0xa89c84;
    const n = opts.count || 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rr(-0.3, 0.3),
        sp = rr(0.8, 2.2) * sc;
      A.psAlpha.spawn({
        x: p.x,
        y: p.y + 0.1,
        z: p.z,
        vx: Math.cos(a) * sp,
        vy: rr(0.2, 0.8) * sc,
        vz: Math.sin(a) * sp,
        size: 0.3 * sc,
        size1: rr(1.2, 2.0) * sc,
        life: rr(1.2, 2.2),
        color: col,
        alpha: 0.4,
        frame: FR.DUST,
        drag: 2.2,
        wind: 0.5,
        rotv: rr(-0.8, 0.8),
        fadeIn: 0.05,
      });
    }
  };
  /** Water splash (bullets, bodies, grenades in water). */
  FX.splash = function (pos, scale) {
    if (!ready() || !pos) return;
    const p = toV(pos),
      sc = scale || 1;
    const wl =
      G.world && G.world.waterLevel !== undefined ? G.world.waterLevel : -1.2;
    if (Math.abs(p.y - wl) < 1.5 && G.LAYOUT && G.LAYOUT.isWater(p.x, p.z))
      p.y = wl + 0.02;
    for (let i = 0; i < Math.round(12 * sc); i++) {
      const a = Math.random() * Math.PI * 2,
        r = rr(0.3, 1.6) * sc;
      A.psAlpha.spawn({
        pos: p,
        vx: Math.cos(a) * r,
        vy: rr(2.5, 5.5) * Math.sqrt(sc),
        vz: Math.sin(a) * r,
        size: rr(0.04, 0.09) * sc,
        life: rr(0.5, 1.0),
        color: 0xb8c0b0,
        alpha: 0.85,
        frame: FR.DROP,
        grav: 1,
        stretch: 0.04,
        lit: 1,
        fadeOut: 0.7,
      });
    }
    A.psAlpha.spawn({
      pos: p,
      vy: 1.2 * sc,
      size: 0.3 * sc,
      size1: 1.4 * sc,
      life: 0.8,
      color: 0xc8d0c0,
      alpha: 0.45,
      frame: FR.DUST,
      drag: 3,
    });
    A.psAlpha.spawn({
      x: p.x,
      y: p.y + 0.03,
      z: p.z,
      size: 0.4 * sc,
      size1: 2.2 * sc,
      life: 0.9,
      color: 0xd8e0d0,
      alpha: 0.6,
      frame: FR.SPLASH,
      rot: 0,
      fadeIn: 0.02,
    });
  };
  /** Ejected shell casing (brass) from the viewmodel/world; dir = ejection direction. */
  FX.shell = function (pos, dir, opts) {
    if (!ready() || !pos) return;
    opts = opts || {};
    const p = toV(pos),
      d = dirOf(dir || { x: 1, y: 0.6, z: 0 }, new THREE.Vector3());
    const sp = rr(2, 3.5);
    A.psAlpha.spawn({
      pos: p,
      vx: d.x * sp,
      vy: d.y * sp + 1.5,
      vz: d.z * sp,
      size: opts.shotgun ? 0.05 : 0.03,
      life: 1.6,
      color: opts.shotgun ? 0xa02010 : 0xc8a040,
      alpha: 1,
      frame: FR.STREAK,
      stretch: 0.004,
      grav: 1.2,
      bounce: true,
      rotv: rr(-20, 20),
      lit: 1,
      fadeOut: 0.85,
    });
  };

  // ------------------------------------------------------------------
  // Tracers, laser beams
  // ------------------------------------------------------------------
  /** Bullet tracer streaking from → to. color default warm yellow. opts: {speed, width, length} */
