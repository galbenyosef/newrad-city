// play-inline-519 02 — math
// Lines 365-706 of readable/play-inline-519.pretty.js (statement-aligned).
  function simBird(i, dt, t) {
    const S = SPECIES[spc[i]];
    const f = flockOf[i] >= 0 ? FLOCKS[flockOf[i]] : null;
    const m = mode[i];
    let flapping = true;
    if (m === M_GROUND) {
      // pecking: hop to a nearby spot now and then, bob the head (pitch)
      tmr[i] -= dt;
      if (tmr[i] <= 0) {
        tmr[i] = 0.6 + Math.random() * 2.2;
        if (Math.random() < 0.55 && f) {
          const a = Math.random() * 6.28,
            d = Math.random() * 2.8;
          const nx = f.cx + Math.sin(a) * d,
            nz = f.cz + Math.cos(a) * d;
          if (Math.hypot(nx - px[i], nz - pz[i]) < 1.6) {
            tx[i] = nx;
            tz[i] = nz;
            yaw[i] = Math.atan2(-(nx - px[i]), -(nz - pz[i]));
          }
        } else yaw[i] += (Math.random() - 0.5) * 1.5;
      }
      const dx = tx[i] - px[i],
        dz = tz[i] - pz[i],
        d = Math.hypot(dx, dz);
      if (d > 0.02) {
        const st = Math.min(d, 0.9 * dt);
        px[i] += (dx / d) * st;
        pz[i] += (dz / d) * st;
      }
      pitch[i] =
        -0.35 * Math.max(0, Math.sin(t * 7 + i * 1.7)) * (d > 0.02 ? 0.3 : 1);
      bank[i] = 0;
      flapping = false;
    } else if (m === M_FLEE) {
      tmr[i] += dt;
      // accelerate toward the escape heading, climb, then level off
      const k = Math.min(1, dt * 1.6);
      vx[i] += (tx[i] - vx[i]) * k;
      vz[i] += (tz[i] - vz[i]) * k;
      const climb = py[i] - ang[i] < hgt[i] ? 3.2 : 0.2;
      vy[i] += (climb - vy[i]) * Math.min(1, dt * 1.2);
      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;
      pz[i] += vz[i] * dt;
      const P = G.player.pos;
      if (tmr[i] > 25 || Math.hypot(px[i] - P.x, pz[i] - P.z) > 115) {
        freeBird(i);
        return;
      }
      flapK[i] = tmr[i] < 1.5 ? 1.35 : 1;
    } else if (m === M_CIRCLE && f) {
      const sp = S.speed;
      ang[i] += (sp / Math.max(4, orb[i])) * dt * f.dir;
      const wob = Math.sin(t * 0.37 + i * 2.1);
      const gx = f.cx + Math.sin(ang[i]) * orb[i] * (1 + 0.15 * wob),
        gz = f.cz + Math.cos(ang[i]) * orb[i];
      const gy = f.cy + hgt[i] + Math.sin(t * 0.5 + i) * 2.2;
      let dvx = gx - px[i],
        dvy = gy - py[i],
        dvz = gz - pz[i];
      const dl = Math.hypot(dvx, dvy, dvz) || 1;
      const want = Math.min(sp * 1.25, dl * 1.4 + sp * 0.4);
      dvx = (dvx / dl) * want;
      dvy = (dvy / dl) * want * 0.6;
      dvz = (dvz / dl) * want;
      const k = Math.min(1, dt * 1.8);
      vx[i] += (dvx - vx[i]) * k;
      vy[i] += (dvy - vy[i]) * k;
      vz[i] += (dvz - vz[i]) * k;
      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;
      pz[i] += vz[i] * dt;
      // flap / glide cycle
      glideT[i] -= dt;
      if (glideT[i] <= 0) {
        flapK[i] = flapK[i] > 0.5 ? 0 : 1;
        glideT[i] = flapK[i]
          ? 0.6 + Math.random() * 1.0
          : (1 + Math.random() * 3) * (0.5 + S.glide);
      }
      flapping = flapK[i] > 0.5 || vy[i] > 1.2;
    } else {
      freeBird(i);
      return;
    }
    if (m !== M_GROUND) {
      const h = Math.hypot(vx[i], vz[i]);
      if (h > 0.2) {
        const ny = Math.atan2(-vx[i], -vz[i]);
        const dy = K.wrap(ny - yaw[i]);
        yaw[i] = ny;
        const turnRate = dt > 0 ? dy / dt : 0;
        bank[i] +=
          (K.clamp(-turnRate * 0.45, -0.8, 0.8) - bank[i]) *
          Math.min(1, dt * 4);
      }
      pitch[i] = K.clamp(Math.atan2(vy[i], Math.max(0.5, h)), -0.6, 0.7);
    }
    // Wings
    let wa;
    if (m === M_GROUND) wa = -0.05;
    else if (flapping) {
      phase[i] += dt * S.flapHz * 6.283 * (flapK[i] || 1);
      wa = Math.sin(phase[i]) * 0.95 + 0.15;
    } else wa = 0.12 + Math.sin(t * 2 + i) * 0.04; // glide: slight dihedral
    compose(i, wa, m === M_GROUND);
  }

  function compose(i, wingAngle, folded) {
    const S = SPECIES[spc[i]];
    _e.set(pitch[i], yaw[i], bank[i], "YXZ");
    _q.setFromEuler(_e);
    _p.set(px[i], py[i], pz[i]);
    _s.set(S.scale, S.scale, S.scale);
    _m.compose(_p, _q, _s);
    meshBody.setMatrixAt(i, _m);
    // wings: hinge offset + flap about the body's long axis (Z)
    const fold = folded ? 0.4 : 1;
    _s.set(fold, 1, 1);
    _el.set(0, folded ? 0.25 : 0, wingAngle);
    _ql.setFromEuler(_el);
    _ml.compose(_hingeR, _ql, _s);
    _mw.multiplyMatrices(_m, _ml);
    meshWR.setMatrixAt(i, _mw);
    _el.set(0, folded ? -0.25 : 0, -wingAngle);
    _ql.setFromEuler(_el);
    _ml.compose(_hingeL, _ql, _s);
    _mw.multiplyMatrices(_m, _ml);
    meshWL.setMatrixAt(i, _mw);
  }

  // ------------------------------------------------------------------
  // Flock director (1 Hz)
  // ------------------------------------------------------------------
  const corpses = []; // recent outdoor kills {x,y,z,t}
  let nextFlockT = 0,
    lastPigeonT = -99,
    lastCrowT = -99,
    lastGullT = -99;
  function flockOfKind(kind) {
    for (const f of FLOCKS) if (f.active && f.kind === kind) return f;
    return null;
  }
  function freeSlots() {
    return N - activeBirds;
  }

  function nearWater(x, z) {
    const Ly = G.LAYOUT;
    let best = null,
      bd = 1e9;
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * 6.283;
      for (const r of [45, 80]) {
        const wx = x + Math.sin(a) * r,
          wz = z + Math.cos(a) * r;
        if (Ly.isWater(wx, wz) && r < bd) {
          bd = r;
          best = { x: wx, z: wz };
        }
      }
    }
    return best;
  }

  function directFlocks() {
    const P = G.player,
      t = K.now();
    const outdoors = K.playerOutdoors();
    const dark = K.isDark(),
      storm = K.isStormy(),
      rain = K.isRainy();
    for (const f of FLOCKS) {
      if (!f.active) continue;
      // prune members that finished
      let n = 0;
      for (const i of f.members)
        if (mode[i] !== M_FREE && flockOf[i] === f.idx) f.members[n++] = i;
      f.members.length = n;
      if (!n) {
        f.active = false;
        continue;
      }
      if (f.leaving) continue;
      const d = Math.hypot(f.cx - P.pos.x, f.cz - P.pos.z);
      if (!outdoors || d > 240) {
        disbandFlock(f, false);
        continue;
      }
      if ((dark || storm) && f.kind !== "pigeon") {
        disbandFlock(f, true);
        continue;
      }
      if ((rain || storm || dark) && f.kind === "pigeon" && !f.scared) {
        scareFlock(f, P.pos.x, P.pos.z);
        continue;
      }
      // calls
      if (t > f.nextCall && f.kind !== "pigeon" && d < 160) {
        f.nextCall =
          t + K.rand(f.kind === "crow" ? 3 : 4, f.kind === "crow" ? 9 : 12);
        const i = f.members[Math.floor(Math.random() * f.members.length)];
        _p.set(px[i], py[i], pz[i]);
        K.sfx(f.kind === "crow" ? "crow" : "gull", {
          pos: _p,
          volume: f.kind === "crow" ? 0.55 : 0.45,
          pitch: 0.9 + Math.random() * 0.25,
        });
      }
      // crows drift over to a fresh corpse
      if (f.kind === "crow" && corpses.length) {
        const c = corpses[corpses.length - 1];
        if (
          t - c.t > 15 &&
          t - c.t < 240 &&
          Math.hypot(c.x - f.cx, c.z - f.cz) > 5
        ) {
          f.cx += (c.x - f.cx) * 0.05;
          f.cz += (c.z - f.cz) * 0.05;
          f.cy += (c.y + 16 - f.cy) * 0.05;
        }
      }
    }
    if (!outdoors || !K.playerOk() || t < nextFlockT) return;
    nextFlockT = t + 1;
    // pigeons on the pavement (day, dry)
    if (
      !dark &&
      !rain &&
      !storm &&
      !flockOfKind("pigeon") &&
      t - lastPigeonT > 25 &&
      Math.random() < 0.12 &&
      freeSlots() >= 6
    ) {
      const s = K.streetSpot(P.pos.x, P.pos.z, 16, 34, {
        road: true,
        clear: 1.6,
        tries: 20,
      });
      // prefer sidewalks and plazas over the roadway itself
      if (s && (!G.LAYOUT.isRoad(s.x, s.z, true) || Math.random() < 0.5)) {
        if (spawnFlock("pigeon", s.x, s.y, s.z, K.randInt(5, 10)))
          lastPigeonT = t;
      }
    }
    // crows circling (day; over a recent corpse if there is one)
    if (
      !dark &&
      !storm &&
      !flockOfKind("crow") &&
      t - lastCrowT > 40 &&
      Math.random() < 0.08 &&
      freeSlots() >= 5
    ) {
      let cx, cz, cy;
      const c = corpses.length ? corpses[corpses.length - 1] : null;
      if (
        c &&
        t - c.t < 200 &&
        Math.hypot(c.x - P.pos.x, c.z - P.pos.z) < 150
      ) {
        cx = c.x;
        cz = c.z;
        cy = c.y + K.rand(14, 22);
      } else {
        const a = Math.random() * 6.28,
          d = K.rand(45, 120);
        cx = P.pos.x + Math.sin(a) * d;
        cz = P.pos.z + Math.cos(a) * d;
        cy = K.rand(28, 52);
      }
      if (
        G.LAYOUT.isLand(cx, cz) &&
        spawnFlock("crow", cx, cy, cz, K.randInt(5, 9), { r: K.rand(10, 22) })
      )
        lastCrowT = t;
    }
    // gulls over the rivers
    if (
      !dark &&
      !storm &&
      !flockOfKind("gull") &&
      t - lastGullT > 30 &&
      Math.random() < 0.15 &&
      freeSlots() >= 4
    ) {
      const w = nearWater(P.pos.x, P.pos.z);
      if (
        w &&
        spawnFlock("gull", w.x, K.rand(14, 26), w.z, K.randInt(4, 7), {
          r: K.rand(14, 26),
        })
      )
        lastGullT = t;
    }
  }

  function scareNear(x, z, r) {
    for (const f of FLOCKS)
      if (
        f.active &&
        f.kind === "pigeon" &&
        !f.scared &&
        Math.hypot(f.cx - x, f.cz - z) < r
      )
        scareFlock(f, x, z);
  }

  function updateBirds(dt) {
    if (!meshBody) return;
    const t = K.now();
    if (dt > 0) {
      directFlocks();
      // pigeons get spooked by the player
      const P = G.player;
      for (const f of FLOCKS) {
        if (!f.active || f.kind !== "pigeon" || f.scared) continue;
        const d = Math.hypot(P.pos.x - f.cx, P.pos.z - f.cz);
        const r = P.sneaking ? 3.5 : P.sprinting ? 13 : 7.5;
        if (d < r) scareFlock(f, P.pos.x, P.pos.z);
      }
      for (let i = 0; i < N; i++) if (mode[i] !== M_FREE) simBird(i, dt, t);
    }
    for (let i = 0; i < N; i++)
      if (dirty[i]) {
        dirty[i] = 0;
        if (mode[i] === M_FREE) {
          meshBody.setMatrixAt(i, _zero);
          meshWL.setMatrixAt(i, _zero);
          meshWR.setMatrixAt(i, _zero);
        }
      }
    const vis = activeBirds > 0 && !K.isInterior(G.player.pos.x);
    meshBody.visible = meshWL.visible = meshWR.visible = vis;
    if (vis || dt > 0) {
      meshBody.instanceMatrix.needsUpdate = true;
      meshWL.instanceMatrix.needsUpdate = true;
      meshWR.instanceMatrix.needsUpdate = true;
    }
  }
