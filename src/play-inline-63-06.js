// play-inline-63 06 — opts
// Lines 1177-1525 of readable/play-inline-63.pretty.js (statement-aligned).
  FX.tracer = function (from, to, color, opts) {
    if (!A.addBeam || !from || !to) return;
    opts = opts || {};
    const a = toV(from),
      b = toV(to);
    const dist = a.distanceTo(b);
    if (dist < 0.5) return;
    const dir = b.clone().sub(a).divideScalar(dist);
    const speed = opts.speed || 380,
      len = opts.length || Math.min(9, 2 + dist * 0.18);
    const col = color !== undefined ? color : 0xffd890;
    // start a little ahead of the muzzle so it doesn't smear across the screen
    const start = Math.min(1.2, dist * 0.2);
    A.addBeam({
      a,
      b: a.clone(),
      width: opts.width || 0.022,
      color: col,
      intensity: opts.intensity || 4,
      life: (dist - start) / speed + len / speed + 0.02,
      kind: "tracer",
      fade: 0.05,
      update(bm) {
        const head = Math.min(dist, start + bm.age * speed),
          tail = Math.max(start, head - len);
        bm.b.copy(a).addScaledVector(dir, head);
        bm.a.copy(a).addScaledVector(dir, tail);
        if (tail >= dist - 0.01) return false;
        return true;
      },
    });
  };
  /** Laser beam (AER9 red by default). color: 'red'|'green'|'blue'|hex. opts: {width, life} */
  FX.laserBeam = function (from, to, color, opts) {
    if (!A.addBeam || !from || !to) return;
    opts = opts || {};
    const a = toV(from),
      b = toV(to);
    const col = A.color(color || "red");
    A.addBeam({
      a,
      b,
      width: opts.width || 0.045,
      color: col,
      intensity: 5,
      life: opts.life || 0.24,
      kind: "laser",
      fade: 0.6,
    });
    A.addBeam({
      a,
      b,
      width: (opts.width || 0.045) * 4,
      color: col,
      intensity: 0.6,
      life: (opts.life || 0.24) * 0.8,
      kind: "laser",
      fade: 0.8,
    });
    if (ready()) {
      A.psAdd.spawn({
        pos: b,
        size: 0.5,
        size1: 0.15,
        life: 0.2,
        color: col,
        intensity: 4,
        frame: FR.GLOW,
        fadeIn: 0.01,
      });
      A.psAdd.spawn({
        pos: a,
        size: 0.25,
        life: 0.08,
        color: col,
        intensity: 4,
        frame: FR.GLOW,
        fadeIn: 0.01,
      });
      // a few motes drifting off the beam
      for (let i = 0; i < 5; i++) {
        _v.lerpVectors(a, b, Math.random());
        A.psAdd.spawn({
          pos: _v,
          vx: rr(-0.3, 0.3),
          vy: rr(0, 0.5),
          vz: rr(-0.3, 0.3),
          size: 0.03,
          life: rr(0.2, 0.5),
          color: col,
          intensity: 3,
          frame: FR.GLOW,
        });
      }
    }
  };
  const boltHandles = [];
  function updateBolts(dt) {
    for (let i = boltHandles.length - 1; i >= 0; i--) {
      const b = boltHandles[i];
      b.h.age += dt;
      if (!b.h.alive || b.h.age > b.h.life) {
        boltHandles.splice(i, 1);
        continue;
      }
      if (dt > 0) b.tick();
    }
  }

  // ------------------------------------------------------------------
  // Continuous emitters: fire, smoke, steam
  // ------------------------------------------------------------------
  let fireSounds = 0;
  /**
   * Fire (burning barrel, car fire, campfire, burning debris). Returns handle {stop(), setPos(), setScale(), pos, glow}.
   * opts: {smoke=true, glow=true, sound=true, embers=true, light=false (steal a flash light while close), lod}
   */
  FX.fire = function (pos, scale, opts) {
    opts = opts || {};
    if (!A.addEmitter) return null;
    const s0 = scale || 1;
    // procedural flame volume (57_fx_flames.js): the body of the fire. The atlas sprites below are
    // only small licks / sparks for motion on top of it (or the whole fire if the card system is off).
    const card =
      A.flameCard && opts.card !== false
        ? A.flameCard(pos, s0, { lod: Math.min(opts.lod || 160, 220) })
        : null;
    // halo: with a flame card it is only the soft light around the fire (a big bright disc washed the
    // flame's lower half out to a pale blob)
    const glow =
      opts.glow !== false && FX.glowSprite
        ? FX.glowSprite(
            toV(pos).add(new THREE.Vector3(0, 0.6 * s0, 0)),
            0xff7a28,
            (card ? 1.9 : 2.3) * s0,
            { intensity: card ? 0.55 : 1.0, dayFactor: 0.3, flicker: 0.35 },
          )
        : null;
    let snd = null,
      lightT = 0,
      lightH = null;
    const e = A.addEmitter({
      pos: toV(pos),
      rate: (card ? 7 : 16) * Math.sqrt(s0),
      lod: opts.lod || 160,
      scale: s0,
      spawn(p, em) {
        const s = em.scale;
        const a = Math.random() * Math.PI * 2,
          r = Math.random() * 0.35 * s;
        if (card)
          A.psAdd.spawn({
            x: p.x + Math.cos(a) * r,
            y: p.y + 0.25 * s,
            z: p.z + Math.sin(a) * r,
            vx: rr(-0.25, 0.25),
            vy: rr(1.6, 3.0) * Math.sqrt(s),
            vz: rr(-0.25, 0.25),
            size: rr(0.18, 0.32) * s,
            size1: 0.05 * s,
            life: rr(0.3, 0.55),
            color: 0xffb060,
            intensity: 1.5,
            color1: 0x901404,
            intensity1: 0.6,
            frame: FR.FLAME,
            rot: rr(-0.3, 0.3),
            rotv: rr(-1.5, 1.5),
            wind: 0.5,
            fadeIn: 0.15,
            fadeOut: 0.5,
          });
        else
          A.psAdd.spawn({
            x: p.x + Math.cos(a) * r,
            y: p.y + 0.05,
            z: p.z + Math.sin(a) * r,
            vx: rr(-0.2, 0.2),
            vy: rr(1.2, 2.4) * Math.sqrt(s),
            vz: rr(-0.2, 0.2),
            size: rr(0.45, 0.75) * s,
            size1: 0.12 * s,
            life: rr(0.55, 0.95),
            color: 0xffd890,
            intensity: 3.2,
            color1: 0xc01e04,
            intensity1: 1.2,
            frame: FR.FLAME,
            rot: rr(-0.3, 0.3),
            rotv: rr(-1, 1),
            wind: 0.4,
            fadeIn: 0.12,
            fadeOut: 0.45,
          });
        if (opts.embers !== false && Math.random() < 0.18)
          A.psAdd.spawn({
            x: p.x + rr(-0.2, 0.2) * s,
            y: p.y + 0.4 * s,
            z: p.z + rr(-0.2, 0.2) * s,
            vx: rr(-0.6, 0.6),
            vy: rr(1.5, 3.5),
            vz: rr(-0.6, 0.6),
            size: 0.035,
            life: rr(1, 2.5),
            color: 0xffa040,
            intensity: 5,
            frame: FR.GLOW,
            drag: 0.6,
            wind: 0.8,
            flicker: true,
          });
        if (opts.smoke !== false && Math.random() < 0.22)
          A.psAlpha.spawn({
            x: p.x,
            y: p.y + 0.9 * s,
            z: p.z,
            vx: rr(-0.2, 0.2),
            vy: rr(1.0, 1.8) * Math.sqrt(s),
            vz: rr(-0.2, 0.2),
            size: 0.5 * s,
            size1: rr(2.5, 4) * s,
            life: rr(3, 5.5),
            color: 0x2c2824,
            alpha: 0.42,
            frame: FR.SMOKE1 + ((Math.random() * 3) | 0),
            drag: 0.35,
            wind: 0.35,
            rotv: rr(-0.5, 0.5),
            fadeIn: 0.1,
            fadeOut: 0.5,
          });
      },
      onUpdate(dt, em) {
        if (glow)
          glow.position.set(em.pos.x, em.pos.y + 0.6 * em.scale, em.pos.z);
        if (card) {
          card.pos.copy(em.pos);
          card.scale = em.scale;
          card.vis = !em.paused;
        }
        const d = A.camDist(em.pos);
        // positional crackle for the nearest fires only
        if (opts.sound !== false && G.worldRunning()) {
          if (!snd && d < 20 && fireSounds < 3) {
            try {
              snd = G.sfx.play("fire_loop", {
                pos: em.pos,
                loop: true,
                volume: Math.min(1, 0.4 + 0.3 * em.scale),
              });
            } catch (er) {
              snd = null;
            }
            if (snd) fireSounds++;
            else snd = { stop() {}, fake: true };
          } else if (snd && d > 28) {
            try {
              snd.stop && snd.stop();
            } catch (er) {
              /* ignore */
            }
            if (!snd.fake) fireSounds--;
            snd = null;
          }
        }
        // optional real light: lowest priority (combat flashes always win the slot), and it keeps
        // refreshing ITS OWN slot rather than grabbing a new one every tick
        if (opts.light && d < 35) {
          lightT -= dt;
          if (lightT <= 0) {
            lightT = 0.25;
            const lp = A.tmpV3.copy(em.pos).setY(em.pos.y + 1);
            if (!(lightH && lightH.alive() && lightH.extend(0.3, lp)))
              lightH = FX.flash(lp, 0xff7a30, 1.4 * em.scale, 0.3, {
                range: 9 * em.scale,
                flicker: 0.5,
                curve: "hold",
                priority: 0,
              });
          }
        }
      },
    });
    e.glow = glow;
    if (glow && opts.light) glow.noLight = true; // it already has its own flickering light
    e.card = card;
    e.onStop = () => {
      if (card) card.remove();
      if (lightH) {
        lightH.stop();
        lightH = null;
      }
      if (glow) glow.dispose();
      if (snd) {
        try {
          snd.stop && snd.stop();
        } catch (er) {
          /* ignore */
        }
        if (!snd.fake) fireSounds--;
        snd = null;
      }
    };
    return e;
  };
  /**
   * Smoke column (burning cars, chimneys, smouldering ruins). opts: {color, alpha, rate, rise, lod, dark}
   * Returns handle {stop(), setPos(), setScale()}.
   */
  FX.smoke = function (pos, scale, opts) {
    opts = opts || {};
    if (!A.addEmitter) return null;
    const s0 = scale || 1;
    const col =
      opts.color !== undefined
        ? opts.color
        : opts.dark === false
          ? 0x9a968c
          : 0x2e2a26;
    return A.addEmitter({
      pos: toV(pos),
      rate: opts.rate || 3.2 * Math.sqrt(s0),
      lod: opts.lod || 320,
      scale: s0,
      spawn(p, em) {
        const s = em.scale;
        A.psAlpha.spawn({
          x: p.x + rr(-0.3, 0.3) * s,
          y: p.y,
          z: p.z + rr(-0.3, 0.3) * s,
          vx: rr(-0.2, 0.2),
          vy: rr(1.2, 2.2) * (opts.rise || 1) * Math.sqrt(s),
          vz: rr(-0.2, 0.2),
          size: 0.6 * s,
          size1: rr(4, 7) * s,
          life: rr(6, 9),
          color: col,
          alpha: opts.alpha || 0.4,
          frame: FR.SMOKE1 + ((Math.random() * 3) | 0),
          drag: 0.15,
          wind: 0.22,
          rotv: rr(-0.3, 0.3),
          fadeIn: 0.08,
          fadeOut: 0.45,
        });
      },
    });
  };
  /** Steam vent (manholes, broken pipes). */
