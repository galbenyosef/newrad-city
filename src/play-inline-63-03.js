// play-inline-63 03 — size
// Lines 271-591 of readable/play-inline-63.pretty.js (statement-aligned).
  FX.muzzleFlash = function (pos, dir, kind, opts) {
    if (!ready() || !pos) return;
    opts = opts || {};
    const P = MUZ[kind] || MUZ[MUZ_ALIAS[kind]] || MUZ.rifle;
    const p = toV(pos, _mp),
      d = dirOf(dir || _md.set(0, 0, -1), _md);
    const sc = opts.scale || 1;
    const col = A.color(opts.color !== undefined ? opts.color : P.col, _mc);
    const nearCam = A.camDist(p) < 2.2;
    const isView = opts.view || nearCam;
    // the weapons module draws its own first-person flash + light; ours is only a fallback
    const ownView = opts.view || G.isStub("weapons");
    // flash core (world)
    // World flash (NPC / third-person guns). HDR is kept moderate: the old core (7) + glow + 4 tongues (5
    // each) stacked to ~30× in the red channel, which the tone map / grade rolled into a pale BLUE-WHITE
    // disc inside a big soft orb — the "coloured dot in the muzzle flash" the player reported. Now: a
    // hot, slightly desaturated star core, a small tight glow, and a directional flame cone along the
    // barrel (side-on, flashes read petal/cone shaped, not as round bokeh balls).
    if (!isView && P.size > 0) {
      const hot = _mc2.copy(col).lerp(_white, P.energy ? 0.2 : 0.35);
      A.psAdd.spawn({
        pos: p,
        size: P.size * 0.85 * sc,
        size1: P.size * 1.15 * sc,
        life: 0.05,
        color: hot,
        intensity: 3.2,
        frame: FR.STAR,
        rot: Math.random() * 6.28,
        fadeIn: 0.004,
        fadeOut: 0.35,
      });
      A.psAdd.spawn({
        pos: p,
        size: P.size * 1.5 * sc,
        life: 0.06,
        color: col,
        intensity: 0.5,
        frame: FR.GLOW,
        fadeIn: 0.004,
        fadeOut: 0.25,
      });
      if (!P.energy) {
        // the flash cone: a short, fat streak along the barrel just in front of the muzzle
        _v.copy(p).addScaledVector(d, P.size * 0.35 * sc);
        A.psAdd.spawn({
          pos: _v,
          vx: d.x * 6,
          vy: d.y * 6,
          vz: d.z * 6,
          size: P.size * 0.55 * sc,
          life: 0.045,
          color: col,
          intensity: 2.4,
          frame: FR.FLAME_SIDE,
          stretch: 0.11 * sc,
          drag: 30,
          fadeIn: 0.004,
          fadeOut: 0.35,
        });
      }
    }
    if (isView && ownView && P.size > 0)
      viewMuzzle(p, d, col, P.size * 0.55 * sc, P.energy ? 0.07 : 0.05);
    // forward flame tongues
    for (let i = 0; i < P.flames; i++) {
      A.coneDir(d, 0.12, _d);
      const sp = rr(9, 16) * sc;
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: P.size * 0.36 * sc,
        life: rr(0.03, 0.055),
        color: col,
        intensity: 2.2,
        frame: FR.FLAME_SIDE,
        stretch: 0.012,
        fadeIn: 0.004,
        fadeOut: 0.3,
      });
    }
    // muzzle-brake side jets
    if (P.brake) {
      _v2.crossVectors(d, UP);
      if (_v2.lengthSq() < 1e-4) _v2.set(1, 0, 0);
      _v2.normalize();
      for (const s of [-1, 1])
        A.psAdd.spawn({
          pos: p,
          vx: _v2.x * s * 7,
          vy: _v2.y * s * 7 + 0.5,
          vz: _v2.z * s * 7,
          size: P.size * 0.3,
          life: 0.04,
          color: col,
          intensity: 4,
          frame: FR.FLAME_SIDE,
          stretch: 0.015,
          fadeIn: 0.01,
        });
    }
    // sparks / unburnt powder
    for (let i = 0; i < P.sparks; i++) {
      A.coneDir(d, 0.35, _d);
      const sp = rr(6, 18);
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.018,
        life: rr(0.08, 0.2),
        color: col,
        intensity: 4,
        frame: FR.STREAK,
        stretch: 0.02,
        grav: 0.4,
      });
    }
    // energy weapons: charged glow + motes
    if (P.energy) {
      A.psAdd.spawn({
        pos: p,
        size: 0.42 * sc,
        size1: 0.18,
        life: 0.12,
        color: col,
        intensity: 1.5,
        frame: FR.GLOW,
        fadeIn: 0.006,
      });
      for (let i = 0; i < 4; i++) {
        A.randDir(_d);
        A.psAdd.spawn({
          pos: p,
          vx: _d.x,
          vy: _d.y + 0.5,
          vz: _d.z,
          size: 0.03,
          life: rr(0.15, 0.35),
          color: col,
          intensity: 4,
          frame: FR.GLOW,
          drag: 3,
        });
      }
    }
    // smoke puff (lingers, drifts with wind)
    if (P.smoke > 0) {
      const n = Math.ceil(P.smoke * 2);
      for (let i = 0; i < n; i++) {
        A.coneDir(d, 0.4, _d);
        const sp = rr(0.6, 2.2) * P.smoke;
        _v.copy(p).addScaledVector(d, isView ? 0.35 : 0.05);
        A.psAlpha.spawn({
          pos: _v,
          vx: _d.x * sp,
          vy: _d.y * sp + 0.25,
          vz: _d.z * sp,
          size: 0.12 * P.smoke,
          size1: rr(0.6, 1.0) * P.smoke,
          life: rr(0.9, 1.8),
          color: 0xb8b4a8,
          alpha: 0.22,
          frame: FR.SMOKE1 + (i % 3),
          drag: 2.5,
          wind: 0.6,
          rotv: rr(-1, 1),
          fadeIn: 0.05,
          fadeOut: 0.3,
        });
      }
    }
    // missile launcher / recoilless rifle backblast
    if (P.backblast) {
      for (let i = 0; i < 10; i++) {
        A.coneDir(_v3.copy(d).negate(), 0.5, _d);
        const sp = rr(3, 9);
        A.psAlpha.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp + 0.5,
          vz: _d.z * sp,
          size: 0.4,
          size1: rr(1.5, 2.6),
          life: rr(1.2, 2.2),
          color: 0xa8a49a,
          alpha: 0.35,
          frame: FR.SMOKE1 + (i % 3),
          drag: 2,
          wind: 0.5,
          rotv: rr(-1, 1),
        });
      }
    }
    if (P.flamer) FX.flamer(p, d, { scale: sc });
    if (!opts.noLight && P.light > 0) {
      FX.flash(p, col, P.light * sc, P.energy ? 0.09 : 0.06, {
        range: 8 + P.light * 2,
      });
      if (isView && ownView && A.viewFlash)
        A.viewFlash(col, P.light * 0.6, 0.06);
    }
  };

  /** Flamethrower stream burst from pos along dir (call every frame while firing). */
  FX.flamer = function (pos, dir, opts) {
    if (!ready()) return;
    opts = opts || {};
    const p = toV(pos),
      d = dirOf(dir, _v3.set(0, 0, -1)).clone();
    const sc = opts.scale || 1;
    for (let i = 0; i < 6; i++) {
      A.coneDir(d, 0.09, _d);
      const sp = rr(13, 18);
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.15 * sc,
        size1: rr(1.2, 2.2) * sc,
        life: rr(0.45, 0.7),
        color: 0xffe0a0,
        intensity: 3.5,
        color1: 0xff3a08,
        intensity1: 1.2,
        frame: FR.FLAME,
        rot: rr(0, 6.28),
        rotv: rr(-3, 3),
        drag: 2.2,
        grav: -0.35,
        fadeIn: 0.05,
        fadeOut: 0.5,
      });
    }
    if (Math.random() < 0.4)
      A.psAlpha.spawn({
        pos: p.clone().addScaledVector(d, 6),
        vx: d.x * 4,
        vy: 1.5,
        vz: d.z * 4,
        size: 0.6,
        size1: 2.8,
        life: 1.6,
        color: 0x2a2622,
        alpha: 0.35,
        frame: FR.SMOKE2,
        drag: 1.4,
        wind: 0.6,
        rotv: rr(-1, 1),
      });
    if (Math.random() < 0.3)
      FX.flash(p.clone().addScaledVector(d, 3), 0xff8a30, 2.5, 0.12, {
        range: 14,
        flicker: 0.4,
      });
  };

  // ------------------------------------------------------------------
  // Bullet / energy impacts
  // ------------------------------------------------------------------
  const SURF = {
    concrete: { dust: 0xb0a898, chip: 0x8a867c, sparks: 0.25, decal: "bullet" },
    stone: { dust: 0xb8b0a0, chip: 0x9a9284, sparks: 0.3, decal: "bullet" },
    brick: { dust: 0xa87858, chip: 0x8a4a36, sparks: 0.15, decal: "bullet" },
    asphalt: { dust: 0x8c8880, chip: 0x3a3836, sparks: 0.2, decal: "bullet" },
    rubble: { dust: 0xa8a090, chip: 0x7a7468, sparks: 0.15, decal: "bullet" },
    metal: {
      dust: 0x807c78,
      chip: 0x5a5854,
      sparks: 1,
      decal: "bullet_metal",
      metal: true,
    },
    wood: {
      dust: 0x9a7e5a,
      chip: 0x6e5030,
      sparks: 0,
      decal: "bullet_wood",
      splinter: true,
    },
    dirt: {
      dust: 0x8a7658,
      chip: 0x4a3a26,
      sparks: 0,
      decal: "dirt",
      soft: true,
    },
    grass: {
      dust: 0x8a8060,
      chip: 0x4a4a26,
      sparks: 0,
      decal: null,
      soft: true,
      grass: true,
    },
    sand: {
      dust: 0xb8a47c,
      chip: 0x8a7a58,
      sparks: 0,
      decal: null,
      soft: true,
    },
    carpet: { dust: 0x9a8c80, chip: 0x6a5a50, sparks: 0, decal: "bullet" },
    glass: {
      dust: 0xc8d0d0,
      chip: 0xb0c4c8,
      sparks: 0.2,
      decal: "crack",
      glass: true,
    },
    water: { water: true },
    flesh: { flesh: true },
  };
  /**
   * Impact effect. surface: concrete|metal|wood|dirt|grass|water|glass|carpet|rubble|brick|asphalt|flesh.
   * opts: {kind:'bullet'|'laser'|'shotgun'|'melee', scale, decal:false, color}
   */
