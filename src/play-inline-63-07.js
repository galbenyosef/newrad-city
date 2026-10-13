// play-inline-63 07 — opts
// Lines 1526-1601 of readable/play-inline-63.pretty.js (statement-aligned).
  FX.steam = function (pos, scale, opts) {
    opts = opts || {};
    if (!A.addEmitter) return null;
    const s0 = scale || 1;
    return A.addEmitter({
      pos: toV(pos),
      rate: opts.rate || 5 * s0,
      lod: opts.lod || 90,
      scale: s0,
      spawn(p, em) {
        const s = em.scale;
        A.psAlpha.spawn({
          x: p.x + rr(-0.35, 0.35) * s,
          y: p.y + 0.05,
          z: p.z + rr(-0.35, 0.35) * s,
          vx: rr(-0.15, 0.15),
          vy: rr(0.9, 1.6) * s,
          vz: rr(-0.15, 0.15),
          size: 0.5 * s,
          size1: rr(2.2, 3.4) * s,
          life: rr(2.2, 3.6),
          color: 0xd8dcd0,
          alpha: 0.2,
          frame: FR.SMOKE1 + ((Math.random() * 3) | 0),
          drag: 0.5,
          wind: 0.45,
          rotv: rr(-0.4, 0.4),
          fadeIn: 0.15,
          fadeOut: 0.4,
        });
      },
    });
  };
  /** Stop every emitter (debug). */
  FX.stopAllEmitters = function () {
    for (const e of A.emitters.slice()) e.stop();
  };
  /** Clear transient effects (particles, beams, decals). */
  FX.clear = function () {
    for (const s of A.systems)
      if (
        s.reset &&
        (s.name === "particles" ||
          s.name === "beams" ||
          s.name === "lights_decals" ||
          s.name === "explosions")
      ) {
        try {
          s.reset();
        } catch (e) {
          /* ignore */
        }
      }
  };
  FX.stats = () => ({
    add: A.psAdd ? A.psAdd.n : 0,
    alpha: A.psAlpha ? A.psAlpha.n : 0,
    emitters: A.emitters ? A.emitters.length : 0,
    glows: A.glowCount ? A.glowCount() : 0,
  });

  A.addSystem({
    name: "effects",
    order: 61,
    init() {
      initViewFlash();
    },
    update(dt, realDt) {
      updateBolts(dt);
      updateViewFlash(dt, realDt);
    },
    reset() {
      boltHandles.length = 0;
      if (VM.grp) VM.grp.visible = false;
    },
  });
