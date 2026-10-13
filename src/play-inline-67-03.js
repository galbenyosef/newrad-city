// play-inline-67 03 — job
// Lines 349-627 of readable/play-inline-67.pretty.js (statement-aligned).
  function finish(job) {
    const gy = A.groundAt(job.center.x, job.center.z, job.box.min.y + 0.6);
    job.obj.visible = false;
    for (const s of job.swaps) {
      s.o.material = s.orig;
      s.o.castShadow = s.cast;
    }
    for (const m of job.cache.values()) if (m && m.dispose) m.dispose();
    job.obj.userData._disintegrating = null;
    job.obj.userData.disintegrated = job.kind;
    const w = Math.max(job.size.x, job.size.z, job.size.y * 0.45);
    const pile = makePile(
      job.kind,
      new THREE.Vector3(job.center.x, gy, job.center.z),
      w,
    );
    job.pile = pile;
    FX.decal(
      new THREE.Vector3(job.center.x, gy, job.center.z),
      new THREE.Vector3(0, 1, 0),
      job.kind === "ash" ? "scorch_small" : "goo",
      { size: w * 1.6 },
    );
    G.events.emit("disintegrated", job.obj, job.kind, pile.pos);
    job.resolve(pile);
  }

  function update(dt) {
    if (dt <= 0) return;
    for (let i = jobs.length - 1; i >= 0; i--) {
      const j = jobs[i];
      if (!j.ready) {
        j.wait += dt;
        if (j.wait < 0.35) continue; // programs still compiling in parallel
        j.ready = true;
        for (const sw of j.swaps) sw.o.material = sw.dis;
      }
      j.t += dt;
      const u = Math.min(1, j.t / j.dur);
      // char/tint ramps in fast, dissolve follows
      j.uni.char.value = Math.min(1, u * 2.2);
      j.uni.prog.value = Math.max(0, (u - 0.18) / 0.82);
      // the body keeps following its actor (ragdoll / death anim): track the foot point
      if (j.obj.parent) {
        j.obj.updateWorldMatrix(true, false);
        j.obj.getWorldPosition(_p);
        j.uni.pivot.value.set(
          _p.x + j.pivotOff.x,
          j.uni.pivot.value.y,
          _p.z + j.pivotOff.z,
        );
      }
      if (j.kind === "goo") {
        const m = Math.max(0, (u - 0.2) / 0.8);
        const e = m * m * (3 - 2 * m);
        j.uni.squash.value.set(1 + e * 0.35, 1 - e * 0.78, 1 + e * 0.35);
      } else {
        const m = Math.max(0, (u - 0.5) / 0.5);
        j.uni.squash.value.set(1 + m * 0.06, 1 - m * 0.28, 1 + m * 0.06);
      }
      // the shadow pass doesn't dissolve: drop the body's shadow once it is mostly gone
      if (!j.shadowOff && u > 0.45) {
        j.shadowOff = true;
        for (const sw of j.swaps) sw.o.castShadow = false;
      }
      // particles
      j.emitT -= dt;
      if (j.emitT <= 0 && A.psAdd) {
        j.emitT = 0.016;
        for (let k = 0; k < 3; k++) {
          randomSurfacePoint(j, _p);
          if (j.kind === "ash") {
            A.psAlpha.spawn({
              pos: _p,
              vx: rr(-0.4, 0.4),
              vy: rr(0.3, 1.4),
              vz: rr(-0.4, 0.4),
              size: rr(0.03, 0.08),
              life: rr(1.5, 3),
              color: 0x1a1816,
              frame: FR.FLAKE,
              rotv: rr(-6, 6),
              drag: 1.2,
              wind: 0.9,
              grav: 0.05,
              lit: 1,
            });
            A.psAdd.spawn({
              pos: _p,
              vx: rr(-0.5, 0.5),
              vy: rr(0.5, 2),
              vz: rr(-0.5, 0.5),
              size: rr(0.025, 0.05),
              life: rr(0.6, 1.6),
              color: 0xff7a20,
              intensity: 5,
              frame: FR.GLOW,
              drag: 1,
              wind: 0.7,
              flicker: true,
            });
            if (Math.random() < 0.25)
              A.psAlpha.spawn({
                pos: _p,
                vy: rr(0.6, 1.2),
                size: 0.2,
                size1: rr(0.8, 1.4),
                life: rr(1.5, 2.5),
                color: 0x2a2624,
                alpha: 0.35,
                frame: FR.SMOKE3,
                wind: 0.6,
                drag: 0.8,
                rotv: rr(-1, 1),
              });
          } else {
            A.psAdd.spawn({
              pos: _p,
              vx: rr(-0.3, 0.3),
              vy: rr(-0.5, 0.3),
              vz: rr(-0.3, 0.3),
              size: rr(0.04, 0.09),
              life: rr(0.6, 1.2),
              color: 0x6aff3a,
              intensity: 3,
              frame: FR.DROP,
              grav: 0.8,
              stick: true,
              stretch: 0.04,
            });
            if (Math.random() < 0.3)
              A.psAdd.spawn({
                pos: _p,
                vy: rr(0.2, 0.8),
                size: rr(0.1, 0.25),
                size1: 0.02,
                life: rr(0.4, 0.9),
                color: 0x9aff6a,
                intensity: 2,
                frame: FR.GLOW,
                drag: 2,
              });
            if (Math.random() < 0.15)
              A.psAlpha.spawn({
                pos: _p,
                vy: rr(0.3, 0.8),
                size: 0.2,
                size1: rr(0.7, 1.2),
                life: rr(1, 2),
                color: 0x5a8a3a,
                alpha: 0.3,
                frame: FR.DUST,
                wind: 0.5,
                drag: 1,
              });
          }
        }
      }
      if (u >= 1) {
        jobs.splice(i, 1);
        finish(j);
      }
    }
    // piles: cool embers, bubble goo, smoke wisps
    for (let i = piles.length - 1; i >= 0; i--) {
      const p = piles[i];
      p.t += dt;
      const em = p.grp.userData.emissiveMat;
      if (p.kind === "ash") {
        if (em)
          em.emissiveIntensity =
            Math.max(0, 0.12 * (1 - p.t / 25)) *
            (0.7 + 0.3 * Math.sin(p.t * 5));
        if (p.glow) p.glow.glowIntensity = Math.max(0, 0.55 * (1 - p.t / 30));
        p.emitT -= dt;
        if (p.t < 20 && p.emitT <= 0 && A.psAlpha && A.camDist(p.pos) < 60) {
          p.emitT = 0.35;
          A.psAlpha.spawn({
            x: p.pos.x + rr(-0.2, 0.2),
            y: p.pos.y + 0.25,
            z: p.pos.z + rr(-0.2, 0.2),
            vy: rr(0.3, 0.7),
            size: 0.1,
            size1: rr(0.6, 1.1),
            life: rr(2, 3.5),
            color: 0x3a3634,
            alpha: 0.25 * (1 - p.t / 20),
            frame: FR.SMOKE3,
            wind: 0.5,
            drag: 0.4,
            rotv: rr(-0.5, 0.5),
          });
          if (Math.random() < 0.4)
            A.psAdd.spawn({
              x: p.pos.x + rr(-0.2, 0.2),
              y: p.pos.y + 0.2,
              z: p.pos.z + rr(-0.2, 0.2),
              vy: rr(0.5, 1.2),
              size: 0.03,
              life: rr(0.8, 1.6),
              color: 0xff7a20,
              intensity: 4,
              frame: FR.GLOW,
              wind: 0.7,
              flicker: true,
            });
        }
      } else {
        if (em)
          em.emissiveIntensity =
            0.18 +
            0.08 * Math.sin(p.t * 2.3) +
            0.25 * Math.max(0, 1 - p.t / 20);
        p.emitT -= dt;
        if (p.emitT <= 0 && A.psAdd && A.camDist(p.pos) < 40) {
          p.emitT = rr(0.25, 0.7);
          const a = rr(0, 6.28),
            r = rr(0, p.w * 0.35);
          A.psAdd.spawn({
            x: p.pos.x + Math.cos(a) * r,
            y: p.pos.y + 0.06,
            z: p.pos.z + Math.sin(a) * r,
            vy: 0.05,
            size: 0.02,
            size1: rr(0.07, 0.14),
            life: rr(0.5, 1.1),
            color: 0x9aff6a,
            intensity: 1.6,
            frame: FR.RING,
            fadeIn: 0.3,
            fadeOut: 0.8,
          });
        }
      }
    }
  }
  function reset() {
    // unfinished jobs: restore the body and settle their promises (null = no pile) so nobody
    // awaiting `.done` (combat's loot placement) hangs forever
    for (const j of jobs) {
      j.dead = true;
      for (const s of j.swaps) {
        s.o.material = s.orig;
        s.o.castShadow = s.cast;
      }
      for (const m of j.cache.values()) if (m && m.dispose) m.dispose();
      j.obj.userData._disintegrating = null;
      try {
        if (j.resolve) j.resolve(null);
      } catch (e) {
        /* ignore */
      }
    }
    jobs.length = 0;
    for (const p of piles) disposePile(p);
    piles.length = 0;
  }

  /** Laser disintegration → ash pile. Returns {done: Promise<pile>} or null. opts: {duration} */
  FX.ash = function (obj3d, opts) {
    return start(obj3d, "ash", opts);
  };
  /** Plasma disintegration → glowing goo puddle. Returns {done: Promise<pile>} or null. opts: {duration} */
  FX.goo = function (obj3d, opts) {
    return start(obj3d, "goo", opts);
  };
  FX.disintegrate = function (obj3d, kind, opts) {
    return start(
      obj3d,
      kind === "goo" || kind === "plasma" ? "goo" : "ash",
      opts,
    );
  };
  FX.piles = () => piles.map((p) => ({ kind: p.kind, pos: p.pos.clone() }));

  // ------------------------------------------------------------------
  // Prewarm pile programs (ash pile + bones + goo + bubbles) so the first
  // pile doesn't compile mid-fight; persist piles across save/load.
  // ------------------------------------------------------------------
