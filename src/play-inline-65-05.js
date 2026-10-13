// play-inline-65 05 — isplasma
// Lines 996-1260 of readable/play-inline-65.pretty.js (statement-aligned).
  function explodeNormal(p, R, kind) {
    const isPlasma = kind === "plasma",
      isElec = kind === "electric",
      isFire = kind === "fire";
    const hot = isPlasma ? "plasma" : isElec ? "electric" : "fire";
    const lightCol = isPlasma ? 0x7aff4a : isElec ? 0x6ab8ff : 0xffa050;
    const gy = A.groundAt(p.x, p.z, p.y + 0.5);
    const nearGround = p.y - gy < R * 1.2;
    const gp = new THREE.Vector3(p.x, gy, p.z);
    FX.flash(p, lightCol, 7 + R, 0.55, { range: Math.max(14, R * 7) });
    // the burning fireball keeps lighting the street and façades for a second, flickering as it rolls up
    if (!isElec)
      A.after(0.12, () => {
        FX.flash(
          _v.set(p.x, p.y + R * 0.5, p.z),
          isPlasma ? 0x6aff40 : 0xff8434,
          2.6 + R * 0.35,
          1.5,
          {
            range: Math.max(12, R * 5.5),
            flicker: 0.35,
            curve: "linear",
            priority: 1,
          },
        );
      });
    // core flash sprites
    A.psAdd.spawn({
      pos: p,
      size: R * 2.4,
      size1: R * 3.6,
      life: 0.12,
      color: lightCol,
      intensity: 1.3,
      frame: FR.GLOW,
      fadeIn: 0.01,
      fadeOut: 0.2,
    });
    A.psAdd.spawn({
      pos: p,
      size: R * 1.6,
      life: 0.07,
      color: 0xffe8c0,
      intensity: 3,
      frame: FR.STAR,
      fadeIn: 0.01,
    });
    // volumetric fireball: a cluster of procedural fire/smoke puffs (no mesh → no facets, no "boulder")
    puffExplosion(
      p,
      R,
      isPlasma ? 1 : isElec ? 2 : 0,
      isElec ? { nFire: 8, smoke: false } : null,
    );
    // flame licks: a few small, short-lived tongues flicking out of the ball
    const nFl = isPlasma ? 6 : 10;
    for (let i = 0; i < nFl; i++) {
      A.randDir(_d);
      _d.y = Math.abs(_d.y) * 0.8 + 0.2;
      const sp = rr(2.5, 8) * R * 0.5;
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: R * rr(0.25, 0.45),
        size1: R * rr(0.45, 0.8),
        life: rr(0.2, 0.45),
        color: isPlasma ? 0xc8ffa0 : 0xffa048,
        intensity: 1.5,
        color1: isPlasma ? 0x208a10 : 0x901804,
        intensity1: 0.6,
        frame: isPlasma ? FR.GLOW : FR.FLAME,
        rot: rr(0, 6.28),
        rotv: rr(-2, 2),
        drag: 2.5,
        grav: -0.2,
        fadeIn: 0.02,
        fadeOut: 0.5,
      });
    }
    // sparks
    const nSp = isElec ? 40 : 28;
    for (let i = 0; i < nSp; i++) {
      A.randDir(_d);
      _d.y = Math.abs(_d.y) + 0.1;
      const sp = rr(6, 22) * Math.sqrt(R / 3);
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.035,
        life: rr(0.4, 1.3),
        color: isPlasma ? 0x9aff6a : isElec ? 0xa0d8ff : 0xffc070,
        intensity: 6,
        color1: 0xff4010,
        intensity1: 2,
        frame: FR.STREAK,
        stretch: 0.035,
        grav: 1,
        bounce: true,
        drag: 0.4,
      });
    }
    if (isElec)
      for (let i = 0; i < 6; i++) {
        A.randDir(_d);
        FX.arc(_v.copy(p).addScaledVector(_d, R * rr(0.3, 1)), {
          scale: R * 0.5,
          count: 2,
        });
      }
    // smoke column
    if (!isPlasma && !isElec) {
      // thin, lit wisps trailing off the smoke column (the body of the smoke is the puff cluster)
      for (let i = 0; i < 6; i++) {
        A.randDir(_d);
        _d.y = Math.abs(_d.y) * 0.6 + 0.3;
        const sp = rr(1, 3) * Math.sqrt(R);
        A.psAlpha.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp + 1.5,
          vz: _d.z * sp,
          size: R * 0.5,
          size1: R * rr(1.6, 2.4),
          life: rr(3, 5.5),
          color: 0x5a524a,
          alpha: 0.22,
          frame: FR.SMOKE1 + (i % 3),
          drag: 1.1,
          wind: 0.4,
          grav: -0.03,
          rotv: rr(-0.5, 0.5),
          fadeIn: 0.25,
          fadeOut: 0.4,
        });
      }
    } else {
      for (let i = 0; i < 10; i++) {
        A.randDir(_d);
        const sp = rr(2, 6);
        A.psAdd.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp + 1,
          vz: _d.z * sp,
          size: 0.15,
          life: rr(0.6, 1.4),
          color: lightCol,
          intensity: 4,
          frame: FR.GLOW,
          drag: 1.5,
          grav: 0.3,
        });
      }
      if (isPlasma) FX.blood(p, new THREE.Vector3(0, 1, 0), 2, "glowing");
    }
    // ground effects
    if (nearGround) {
      shockRing(gp, R * 4, 0.45, isPlasma ? 0x9aff7a : 0xffd8a0, 1.2);
      // dust-ring shockwave: a fast, ground-hugging ring of dust racing out, then a slower, taller skirt
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 + rr(-0.12, 0.12),
          sp = rr(9, 15) * Math.sqrt(R / 3);
        A.psAlpha.spawn({
          x: gp.x + Math.cos(a) * R * 0.3,
          y: gp.y + 0.2,
          z: gp.z + Math.sin(a) * R * 0.3,
          vx: Math.cos(a) * sp,
          vy: rr(0.1, 0.6),
          vz: Math.sin(a) * sp,
          size: R * 0.3,
          size1: R * rr(0.9, 1.4),
          life: rr(0.9, 1.6),
          color: 0x9a8e76,
          alpha: 0.34,
          frame: FR.DUST,
          drag: 3.2,
          wind: 0.3,
          rotv: rr(-0.6, 0.6),
          fadeIn: 0.02,
          fadeOut: 0.45,
          lit: 1,
        });
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + rr(-0.2, 0.2),
          sp = rr(4, 8) * Math.sqrt(R / 3);
        A.psAlpha.spawn({
          x: gp.x,
          y: gp.y + 0.4,
          z: gp.z,
          vx: Math.cos(a) * sp,
          vy: rr(0.8, 2.2),
          vz: Math.sin(a) * sp,
          size: R * 0.5,
          size1: R * rr(1.6, 2.4),
          life: rr(2.2, 3.6),
          color: 0x7e7462,
          alpha: 0.26,
          frame: FR.DUST,
          drag: 1.6,
          wind: 0.45,
          rotv: rr(-0.5, 0.5),
          fadeIn: 0.06,
          fadeOut: 0.4,
          lit: 1,
        });
      }
      if (!isElec) {
        spawnDebris(gp, Math.round(6 + R * 1.3), 6 + R * 0.9, {
          burn: isPlasma ? 0 : 0.7,
          scale: 0.6,
        });
        for (let i = 0; i < 16; i++) {
          A.randDir(_d);
          _d.y = Math.abs(_d.y) + 0.5;
          const sp = rr(4, 12);
          A.psAlpha.spawn({
            pos: gp,
            vx: _d.x * sp,
            vy: _d.y * sp,
            vz: _d.z * sp,
            size: rr(0.05, 0.14),
            life: rr(1, 2),
            color: 0x4a443c,
            frame: FR.DEBRIS,
            grav: 1,
            bounce: true,
            rotv: rr(-10, 10),
            lit: 1,
          });
        }
      }
      FX.decal(gp, new THREE.Vector3(0, 1, 0), isPlasma ? "plasma" : "scorch", {
        size: R * (isPlasma ? 1.4 : 1.7),
        heat: isPlasma ? 0.6 : 0.35,
      });
    }
    blastShell(p, R * 2.4, 0.26, isPlasma ? 0x9aff7a : 0xfff0d0, 0.8);
    if (isFire)
      for (let i = 0; i < 3; i++) {
        const f = FX.fire(
          new THREE.Vector3(
            gp.x + rr(-R, R) * 0.6,
            gp.y,
            gp.z + rr(-R, R) * 0.6,
          ),
          rr(0.6, 1.1),
        );
        if (f) f.expire(rr(6, 10));
      }
    cameraKick(p, R, 1);
    const d = A.camDist(p);
    if (d < R * 4 && G.atmos.screenFlash)
      G.atmos.screenFlash(
        0.25 * (1 - d / (R * 4)),
        isPlasma ? 0xb0ffa0 : 0xffe0b0,
        0.3,
      );
  }

  // ---- NUKE-CLASS BLAST ---------------------------------------------------------------------
