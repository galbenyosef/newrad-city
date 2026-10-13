// play-inline-65 04 — math
// Lines 702-995 of readable/play-inline-65.pretty.js (statement-aligned).
  function spawnPuff(o) {
    let i = PF.n;
    if (i >= PUFF_CAP) {
      // full: recycle the most-aged puff
      let best = 0,
        bt = -1;
      for (let k = 0; k < PUFF_CAP; k++) {
        const t = PF.age[k] / PF.life[k];
        if (t > bt) {
          bt = t;
          best = k;
        }
      }
      i = best;
    } else PF.n++;
    const p = o.pos;
    PF.px[i] = p ? p.x : o.x;
    PF.py[i] = p ? p.y : o.y;
    PF.pz[i] = p ? p.z : o.z;
    PF.vx[i] = o.vx || 0;
    PF.vy[i] = o.vy || 0;
    PF.vz[i] = o.vz || 0;
    PF.age[i] = -(o.delay || 0);
    PF.life[i] = o.life || 2;
    PF.s0[i] = o.size || 1;
    PF.s1[i] = o.size1 || PF.s0[i] * 2;
    PF.T0[i] = o.T || 0;
    PF.hold[i] = o.hold || 0;
    PF.cool[i] = o.cool || 0.4;
    PF.a0[i] = o.alpha !== undefined ? o.alpha : 1;
    PF.rot[i] = Math.random() * 6.283;
    PF.rotv[i] = o.rotv !== undefined ? o.rotv : rr(-0.6, 0.6);
    PF.seed[i] = Math.random() * 10;
    PF.drag[i] = o.drag || 0;
    PF.buoy[i] = o.buoy || 0;
    PF.wind[i] = o.wind || 0;
    PF.ramp[i] = o.ramp || 0;
    PF.tone[i] = o.tone !== undefined ? o.tone : Math.random();
    PF.e0[i] = o.erode || 0;
    PF.gy[i] = A.groundAt(PF.px[i], PF.pz[i], PF.py[i] + 0.5);
  }
  function killPuff(i) {
    const j = --PF.n;
    if (i !== j)
      for (let k = 0; k < PF_KEYS.length; k++) {
        const a = PF[PF_KEYS[k]];
        a[i] = a[j];
      }
  }
  const _pfFwd = new THREE.Vector3();
  function updatePuffs(dt) {
    if (!PF.mesh) return;
    const wx = G.atmos.wind.x,
      wz = G.atmos.wind.z;
    if (dt > 0) {
      for (let i = 0; i < PF.n; i++) {
        const age = (PF.age[i] += dt);
        if (age >= PF.life[i]) {
          killPuff(i);
          i--;
          continue;
        }
        if (age < 0) continue;
        const k = Math.exp(-PF.drag[i] * dt);
        let vx = PF.vx[i] * k,
          vy = PF.vy[i] * k,
          vz = PF.vz[i] * k;
        vy += PF.buoy[i] * dt * Math.exp(-age * 0.5);
        const wk = Math.min(1, PF.wind[i] * dt);
        vx += (wx - vx) * wk;
        vz += (wz - vz) * wk;
        PF.px[i] += vx * dt;
        PF.py[i] += vy * dt;
        PF.pz[i] += vz * dt;
        // puffs roll along the street instead of sinking into it
        const minY =
          PF.gy[i] +
          (PF.s0[i] + (PF.s1[i] - PF.s0[i]) * Math.min(1, age / PF.life[i])) *
            0.28;
        if (PF.py[i] < minY) {
          PF.py[i] = minY;
          if (vy < 0) vy = 0;
        }
        PF.vx[i] = vx;
        PF.vy[i] = vy;
        PF.vz[i] = vz;
        PF.rot[i] += PF.rotv[i] * dt;
      }
    }
    PF.mat.uniforms.uTime.value = A.animTime % 1000;
    // depth sort far → near (premultiplied "over")
    const n = PF.n;
    let vis = 0;
    if (n) {
      G.camera.getWorldDirection(_pfFwd);
      const cx = A.camPos.x,
        cy = A.camPos.y,
        cz = A.camPos.z;
      for (let i = 0; i < n; i++) {
        if (PF.age[i] < 0) continue;
        PF.depth[i] =
          (PF.px[i] - cx) * _pfFwd.x +
          (PF.py[i] - cy) * _pfFwd.y +
          (PF.pz[i] - cz) * _pfFwd.z;
        PF.order[vis++] = i;
      }
      const ord = Array.prototype.slice
        .call(PF.order, 0, vis)
        .sort((a, b) => PF.depth[b] - PF.depth[a]);
      const P4 = PF.aPos.array,
        Pp = PF.aP.array,
        Pq = PF.aQ.array;
      for (let k = 0; k < vis; k++) {
        const i = ord[k],
          age = PF.age[i],
          t = age / PF.life[i],
          o = k * 4;
        const size =
          PF.s0[i] + (PF.s1[i] - PF.s0[i]) * (1 - Math.pow(1 - t, 2.6));
        const T =
          PF.T0[i] * Math.exp(-Math.max(0, age - PF.hold[i]) / PF.cool[i]);
        let a = PF.a0[i] * Math.min(1, age / 0.05);
        if (t > 0.5) {
          const u = (t - 0.5) / 0.5;
          a *= 1 - u * u * (3 - 2 * u);
        }
        P4[o] = PF.px[i];
        P4[o + 1] = PF.py[i];
        P4[o + 2] = PF.pz[i];
        P4[o + 3] = size;
        Pp[o] = T;
        Pp[o + 1] = a;
        Pp[o + 2] = PF.seed[i];
        Pp[o + 3] = PF.rot[i];
        Pq[o] = PF.ramp[i];
        Pq[o + 1] = t;
        Pq[o + 2] = PF.tone[i];
        Pq[o + 3] = PF.e0[i] + Math.pow(t, 1.4) * 0.95;
      }
      for (const at of [PF.aPos, PF.aP, PF.aQ]) {
        if (!vis) break;
        at.updateRange.offset = 0;
        at.updateRange.count = vis * 4;
        at.needsUpdate = true;
      }
    }
    PF.mesh.geometry.instanceCount = vis;
    PF.mesh.visible = vis > 0;
    if (vis && G.camera)
      PF.mat.uniforms.uSunV.value
        .copy(A.env.lightDir)
        .transformDirection(G.camera.matrixWorldInverse);
  }
  /**
   * A fireball as a cluster of hot puffs that roll out, stall, rise and cool into sooty,
   * grey-brown smoke, followed by a slower, bigger smoke column.
   */
  function puffExplosion(p, R, ramp, opts) {
    opts = opts || {};
    const k = Math.sqrt(R / 3);
    const nFire = opts.nFire || (ramp ? 10 : 16);
    for (let i = 0; i < nFire; i++) {
      A.randDir(_d);
      _d.y = _d.y * 0.7 + 0.25;
      _d.normalize();
      const r0 = R * rr(0.0, 0.45),
        sp = rr(3, 11) * k;
      spawnPuff({
        x: p.x + _d.x * r0,
        y: p.y + _d.y * r0 * 0.7,
        z: p.z + _d.z * r0,
        vx: _d.x * sp,
        vy: _d.y * sp + 1.2 * k,
        vz: _d.z * sp,
        delay: i < 4 ? 0 : rr(0, 0.07),
        life: rr(1.2, 2.1) * (ramp ? 0.7 : 1),
        size: R * rr(0.28, 0.55),
        size1: R * rr(0.8, 1.5),
        T: i % 3 === 2 ? rr(0.35, 0.55) : rr(0.85, 1.1),
        hold: rr(0.22, 0.45),
        cool: rr(0.28, 0.42),
        alpha: 0.96,
        drag: rr(3.2, 4.5),
        buoy: 2.6 * k,
        wind: 0.15,
        ramp,
        tone: rr(0, 0.45),
        erode: 0,
        rotv: rr(-1.2, 1.2),
      });
    }
    if (opts.smoke === false) return;
    const nSm = opts.nSmoke || (ramp ? 5 : 11);
    for (let i = 0; i < nSm; i++) {
      A.randDir(_d);
      _d.y = Math.abs(_d.y) * 0.5 + 0.2;
      _d.normalize();
      const r0 = R * rr(0.15, 0.55),
        sp = rr(0.8, 2.2) * k;
      spawnPuff({
        x: p.x + _d.x * r0,
        y: p.y + R * rr(0.1, 0.5),
        z: p.z + _d.z * r0,
        vx: _d.x * sp,
        vy: rr(1.4, 3.2) * k,
        vz: _d.z * sp,
        delay: rr(0.12, 0.55),
        life: rr(3.5, 6.5) * (ramp ? 0.6 : 1),
        size: R * rr(0.55, 0.8),
        size1: R * rr(1.9, 2.8),
        T: rr(0.25, 0.5),
        hold: 0.05,
        cool: 0.35,
        alpha: rr(0.5, 0.68),
        drag: 1.1,
        buoy: 0.9 * k,
        wind: 0.35,
        ramp,
        tone: rr(0.35, 1),
        erode: 0.08,
        rotv: rr(-0.4, 0.4),
      });
    }
    if (ramp || opts.column === false) return;
    // lingering column: dark, oily smoke keeps boiling up from the blast site for ~10 s, leaning with the wind
    const nCol = opts.nColumn || 7;
    for (let i = 0; i < nCol; i++) {
      const f = i / nCol;
      spawnPuff({
        x: p.x + rr(-0.3, 0.3) * R,
        y: p.y + R * 0.2,
        z: p.z + rr(-0.3, 0.3) * R,
        vx: rr(-0.4, 0.4),
        vy: rr(2.2, 3.4) * k,
        vz: rr(-0.4, 0.4),
        delay: 0.5 + f * 2.6 + rr(0, 0.3),
        life: rr(8, 12),
        size: R * rr(0.5, 0.75),
        size1: R * rr(2.6, 3.8),
        T: i < 2 ? 0.32 : 0.12,
        hold: 0.1,
        cool: 0.5,
        alpha: rr(0.5, 0.64),
        drag: 0.8,
        buoy: 0.55 * k,
        wind: 0.25,
        ramp: 0,
        tone: rr(0.0, 0.25),
        erode: 0.12,
        rotv: rr(-0.3, 0.3),
      });
    }
  }

  // ------------------------------------------------------------------
  // Explosion building blocks
  // ------------------------------------------------------------------
  function shockRing(pos, maxR, dur, color, alpha) {
    const mat = ringMatBase.clone();
    mat.uniforms.uColor.value.copy(A.color(color || 0xffc890));
    const mesh = new THREE.Mesh(geoRing, mat);
    mesh.position.copy(pos);
    mesh.position.y += 0.15;
    mesh.renderOrder = 26;
    addPiece(mesh, dur, (t) => {
      const u = t / dur,
        e = 1 - Math.pow(1 - u, 2.2);
      mesh.scale.setScalar(Math.max(0.01, maxR * e));
      mat.uniforms.uAlpha.value = (alpha || 1.5) * (1 - u) * (1 - u);
    });
  }
  function blastShell(pos, maxR, dur, color, amp) {
    const mat = shellMatBase.clone();
    mat.uniforms.uColor.value.copy(A.color(color || 0xffe0b0));
    const mesh = new THREE.Mesh(geoShell, mat);
    mesh.position.copy(pos);
    mesh.renderOrder = 27;
    addPiece(mesh, dur, (t) => {
      const u = t / dur;
      mesh.scale.setScalar(Math.max(0.01, maxR * (1 - Math.pow(1 - u, 3))));
      mat.uniforms.uAlpha.value = (amp || 1.4) * (1 - u) * (1 - u); // gone well before 0.35 s
    });
  }
  function cameraKick(pos, R, strength) {
    const P = G.player;
    if (!P || !P.shake) return;
    const d = A.camDist(pos);
    const k = clamp((R * 6 - d) / (R * 6), 0, 1) * (strength || 1);
    if (k > 0.01) P.shake(Math.min(1.5, 0.25 + k * 1.1), 0.35 + k * 0.6);
  }

  // ------------------------------------------------------------------
  // Explosion kinds
  // ------------------------------------------------------------------
