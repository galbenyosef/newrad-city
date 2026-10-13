// play-inline-519 03 — math
// Lines 707-1054 of readable/play-inline-519.pretty.js (statement-aligned).
  function clearBirds() {
    for (let i = 0; i < N; i++) {
      if (mode[i] !== M_FREE) freeBird(i);
    }
    activeBirds = 0;
    for (const f of FLOCKS) {
      f.active = false;
      f.members.length = 0;
    }
    corpses.length = 0;
    if (meshBody) {
      for (let i = 0; i < N; i++) {
        meshBody.setMatrixAt(i, _zero);
        meshWL.setMatrixAt(i, _zero);
        meshWR.setMatrixAt(i, _zero);
        dirty[i] = 0;
      }
      meshBody.visible = meshWL.visible = meshWR.visible = false;
    }
  }

  // ==================================================================
  // RATS
  // ==================================================================
  const R = K.CFG.RATS_MAX;
  const R_FREE = 0,
    R_RUN = 1,
    R_PAUSE = 2,
    R_EXIT = 3;
  const rx = new Float32Array(R),
    ry = new Float32Array(R),
    rz = new Float32Array(R),
    ryaw = new Float32Array(R);
  const rtx = new Float32Array(R),
    rtz = new Float32Array(R),
    rspd = new Float32Array(R),
    rt = new Float32Array(R),
    rlife = new Float32Array(R),
    rscale = new Float32Array(R);
  const rmode = new Uint8Array(R),
    rdirty = new Uint8Array(R);
  const rtan = new Float32Array(R * 2);
  let meshRat = null,
    activeRats = 0,
    nextRatT = 0;
  const _o = new THREE.Vector3(),
    _dir = new THREE.Vector3();

  function buildRatMesh() {
    const parts = [];
    parts.push(
      K.part(
        new THREE.SphereGeometry(1, 8, 6),
        0x4a3c33,
        [0, 0.05, 0.01],
        null,
        [0.048, 0.042, 0.1],
        0.2,
        3,
      ),
    );
    parts.push(
      K.part(
        new THREE.ConeGeometry(0.03, 0.08, 6),
        0x55463b,
        [0, 0.052, -0.115],
        [-Math.PI / 2, 0, 0],
      ),
    );
    parts.push(
      K.part(
        new THREE.SphereGeometry(0.008, 4, 3),
        0xc08a8a,
        [0, 0.05, -0.157],
      ),
    );
    parts.push(
      K.part(
        new THREE.SphereGeometry(0.016, 5, 4),
        0x8a6a64,
        [0.022, 0.078, -0.085],
        null,
        [1, 1, 0.4],
      ),
    );
    parts.push(
      K.part(
        new THREE.SphereGeometry(0.016, 5, 4),
        0x8a6a64,
        [-0.022, 0.078, -0.085],
        null,
        [1, 1, 0.4],
      ),
    );
    parts.push(
      K.part(
        new THREE.CylinderGeometry(0.004, 0.008, 0.17, 4),
        0x9a7a70,
        [0, 0.03, 0.18],
        [Math.PI / 2 + 0.25, 0, 0],
      ),
    );
    for (const sx of [-1, 1])
      for (const sz of [-0.05, 0.06])
        parts.push(
          K.part(new THREE.BoxGeometry(0.012, 0.03, 0.02), 0x3a2e27, [
            sx * 0.03,
            0.012,
            sz,
          ]),
        );
    meshRat = new THREE.InstancedMesh(
      K.merge(parts),
      K.vcMat("amb_rat", { roughness: 0.95 }),
      R,
    );
    meshRat.name = "amb_rats";
    meshRat.frustumCulled = false;
    meshRat.castShadow = false;
    meshRat.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < R; i++) meshRat.setMatrixAt(i, _zero);
    meshRat.visible = false;
    G.scene.add(meshRat);
  }

  /** Same-floor ground height (rats never change floors). */
  function ratGround(x, z, yRef) {
    const y = G.world.groundHeight(x, z, yRef + 0.3, 0.05);
    if (Math.abs(y - yRef) > 0.35) return null;
    if (!K.isInterior(x) && !G.LAYOUT.isLand(x, z)) return null;
    return y;
  }
  /** Walkable straight run from (x,z) along (dx,dz) up to maxLen — returns the length that stays clear. */
  function clearRun(x, y, z, dx, dz, maxLen) {
    let len = 0;
    for (let s = 0.5; s <= maxLen; s += 0.5) {
      const qx = x + dx * s,
        qz = z + dz * s;
      const gy = ratGround(qx, qz, y);
      if (gy === null || K.blocked(qx, y, qz, 0.12)) break;
      len = s;
    }
    return len;
  }
  function spawnRat() {
    const P = G.player;
    const i = (() => {
      for (let k = 0; k < R; k++) if (rmode[k] === R_FREE) return k;
      return -1;
    })();
    if (i < 0) return false;
    for (let tries = 0; tries < 6; tries++) {
      const a = Math.random() * 6.28,
        d = K.rand(6, 16);
      const x = P.pos.x + Math.sin(a) * d,
        z = P.pos.z + Math.cos(a) * d;
      const y = ratGround(x, z, P.pos.y);
      if (y === null || K.blocked(x, y, z, 0.15)) continue;
      // find a wall to run along (rats hug walls)
      const wa = Math.random() * 6.28;
      let hit = null;
      for (let k = 0; k < 4 && !hit; k++) {
        const aa = wa + (k * Math.PI) / 2;
        _dir.set(Math.sin(aa), 0, Math.cos(aa));
        _o.set(x, y + 0.2, z);
        const h = G.world.raycast(_o, _dir, 3.0);
        if (h && h.normal && Math.abs(h.normal.y) < 0.5) hit = h;
      }
      if (!hit) continue;
      const sx = hit.point.x + hit.normal.x * 0.22,
        sz = hit.point.z + hit.normal.z * 0.22;
      const sy = ratGround(sx, sz, y);
      if (sy === null || K.blocked(sx, sy, sz, 0.12)) continue;
      let tgx = -hit.normal.z,
        tgz = hit.normal.x;
      if (Math.random() < 0.5) {
        tgx = -tgx;
        tgz = -tgz;
      }
      const len = clearRun(sx, sy, sz, tgx, tgz, K.rand(4, 11));
      if (len < 1.5) continue;
      rmode[i] = R_RUN;
      rx[i] = sx;
      ry[i] = sy;
      rz[i] = sz;
      rtx[i] = sx + tgx * len;
      rtz[i] = sz + tgz * len;
      rtan[i * 2] = tgx;
      rtan[i * 2 + 1] = tgz;
      rspd[i] = K.rand(2.2, 3.4);
      rt[i] = 0;
      rlife[i] = K.rand(7, 20);
      rscale[i] = 1;
      ryaw[i] = Math.atan2(-tgx, -tgz);
      activeRats++;
      if (Math.random() < 0.35) {
        _p.set(sx, sy, sz);
        K.sfx("rat_scurry", {
          pos: _p,
          volume: 0.32,
          pitch: 1.0 + Math.random() * 0.25,
        });
      }
      return true;
    }
    return false;
  }
  function freeRat(i) {
    if (rmode[i] === R_FREE) return;
    rmode[i] = R_FREE;
    rdirty[i] = 1;
    activeRats--;
  }
  function simRat(i, dt, t) {
    const P = G.player;
    rt[i] += dt;
    rlife[i] -= dt;
    const dP = Math.hypot(P.pos.x - rx[i], P.pos.z - rz[i]);
    if (dP > 45 || Math.abs(P.pos.y - ry[i]) > 3) {
      freeRat(i);
      return;
    }
    if (rmode[i] === R_EXIT) {
      rscale[i] -= dt * 2.5;
      rx[i] += Math.sin(-ryaw[i]) * dt * 0.8;
      rz[i] += -Math.cos(ryaw[i]) * dt * 0.8;
      if (rscale[i] <= 0.05) {
        freeRat(i);
        return;
      }
    } else {
      // flee from the player
      if (dP < 3.2 && rmode[i] !== R_RUN) {
        let ax = rx[i] - P.pos.x,
          az = rz[i] - P.pos.z;
        const l = Math.hypot(ax, az) || 1;
        ax /= l;
        az /= l;
        const len = clearRun(rx[i], ry[i], rz[i], ax, az, 5);
        if (len > 0.8) {
          rtx[i] = rx[i] + ax * len;
          rtz[i] = rz[i] + az * len;
          rmode[i] = R_RUN;
          rspd[i] = 4.2;
          rlife[i] = Math.min(rlife[i], 1.6);
          if (Math.random() < 0.5) {
            _p.set(rx[i], ry[i], rz[i]);
            K.sfx("rat_scurry", { pos: _p, volume: 0.35, pitch: 1.2 });
          }
        } else {
          rmode[i] = R_EXIT;
        }
      }
      if (rmode[i] === R_RUN) {
        const dx = rtx[i] - rx[i],
          dz = rtz[i] - rz[i],
          d = Math.hypot(dx, dz);
        if (d < 0.1) {
          rmode[i] = rlife[i] > 0 ? R_PAUSE : R_EXIT;
          rt[i] = 0;
        } else {
          const st = Math.min(d, rspd[i] * dt);
          rx[i] += (dx / d) * st;
          rz[i] += (dz / d) * st;
          const ny = Math.atan2(-dx, -dz);
          ryaw[i] += K.wrap(ny - ryaw[i]) * Math.min(1, dt * 12);
        }
      } else if (rmode[i] === R_PAUSE) {
        ryaw[i] += Math.sin(t * 9 + i) * dt * 1.5; // sniffing
        if (rt[i] > 0.5 + (i % 3) * 0.6) {
          if (rlife[i] <= 0) rmode[i] = R_EXIT;
          else {
            // continue along the wall (or turn back)
            let tgx = rtan[i * 2],
              tgz = rtan[i * 2 + 1];
            if (Math.random() < 0.35) {
              tgx = -tgx;
              tgz = -tgz;
              rtan[i * 2] = tgx;
              rtan[i * 2 + 1] = tgz;
            }
            const len = clearRun(rx[i], ry[i], rz[i], tgx, tgz, K.rand(2, 7));
            if (len > 1) {
              rtx[i] = rx[i] + tgx * len;
              rtz[i] = rz[i] + tgz * len;
              rmode[i] = R_RUN;
              rspd[i] = K.rand(2.2, 3.4);
            } else rmode[i] = R_EXIT;
          }
        }
      }
    }
    const run = rmode[i] === R_RUN;
    const bob = run ? Math.abs(Math.sin(t * 22 + i)) * 0.012 : 0;
    _e.set(run ? Math.sin(t * 22 + i) * 0.06 : 0, ryaw[i], 0, "YXZ");
    _q.setFromEuler(_e);
    _p.set(rx[i], ry[i] + bob, rz[i]);
    const s = Math.max(0.01, rscale[i]) * 1.15;
    _s.set(s, s, s);
    _m.compose(_p, _q, _s);
    meshRat.setMatrixAt(i, _m);
  }
  function updateRats(dt) {
    if (!meshRat) return;
    const t = K.now();
    if (dt > 0 && K.playerOk() && G.state === "play" && t > nextRatT) {
      nextRatT = t + 1;
      const inside = K.isInterior(G.player.pos.x);
      const cap = inside ? 6 : 5;
      const p = inside
        ? 0.22
        : (K.isDark() ? 0.16 : 0.06) * (K.isRainy() ? 0.4 : 1);
      if (
        activeRats < cap &&
        Math.random() < p &&
        !(
          K.friendlyLocAt(G.player.pos.x, G.player.pos.z, 0) &&
          Math.random() < 0.6
        )
      )
        spawnRat();
    }
    if (dt > 0)
      for (let i = 0; i < R; i++) if (rmode[i] !== R_FREE) simRat(i, dt, t);
    for (let i = 0; i < R; i++)
      if (rdirty[i]) {
        rdirty[i] = 0;
        if (rmode[i] === R_FREE) meshRat.setMatrixAt(i, _zero);
      }
    meshRat.visible = activeRats > 0;
    if (activeRats > 0 || dt > 0) meshRat.instanceMatrix.needsUpdate = true;
  }
  function clearRats() {
    for (let i = 0; i < R; i++) {
      rmode[i] = R_FREE;
      rdirty[i] = 0;
      if (meshRat) meshRat.setMatrixAt(i, _zero);
    }
    activeRats = 0;
    if (meshRat) {
      meshRat.visible = false;
      meshRat.instanceMatrix.needsUpdate = true;
    }
  }

  // ==================================================================
  // System
  // ==================================================================
