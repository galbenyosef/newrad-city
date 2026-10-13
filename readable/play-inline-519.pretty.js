/* src/ambient_life/10_fauna.js */
/* =====================================================================
 * NEW RAD CITY — AMBIENT LIFE — 10: fauna (birds & vermin)
 *
 * Birds: one pool of ≤48 instanced birds (body + two wings = 3 draw
 * calls for every bird in the world), organised in up to three flocks:
 *   • pigeons pecking on sidewalks — burst into flight (wing-clatter) when
 *     you walk up, sprint, or anything goes bang nearby;
 *   • a "murder" of crows circling over a rooftop — or over the last
 *     corpse you left in the street — cawing;
 *   • gulls wheeling over the rivers when you're near the water.
 *   They go to roost at night and stay out of storms and rain.
 * Rats: ≤8 instanced rats (1 draw call) that scurry along walls near you
 *   (more at night and indoors), sniff, squeak, flee and vanish into cracks.
 * No per-frame allocations: typed-array state, preallocated matrices.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;

  // ==================================================================
  // BIRDS
  // ==================================================================
  const N = K.CFG.BIRDS_MAX;
  const SPECIES = [
    {
      id: "pigeon",
      scale: 1.0,
      color: [0.56, 0.58, 0.64],
      speed: 8.5,
      flapHz: 9.0,
      glide: 0.15,
    },
    {
      id: "crow",
      scale: 1.35,
      color: [0.085, 0.085, 0.095],
      speed: 7.2,
      flapHz: 5.2,
      glide: 0.55,
    },
    {
      id: "gull",
      scale: 1.7,
      color: [0.9, 0.9, 0.87],
      speed: 9.0,
      flapHz: 3.6,
      glide: 0.75,
    },
  ];
  const SP = { pigeon: 0, crow: 1, gull: 2 };
  const M_FREE = 0,
    M_GROUND = 1,
    M_FLEE = 2,
    M_CIRCLE = 3;

  const px = new Float32Array(N),
    py = new Float32Array(N),
    pz = new Float32Array(N);
  const vx = new Float32Array(N),
    vy = new Float32Array(N),
    vz = new Float32Array(N);
  const yaw = new Float32Array(N),
    pitch = new Float32Array(N),
    bank = new Float32Array(N);
  const phase = new Float32Array(N),
    flapK = new Float32Array(N),
    glideT = new Float32Array(N);
  const tmr = new Float32Array(N),
    tx = new Float32Array(N),
    tz = new Float32Array(N);
  const ang = new Float32Array(N),
    orb = new Float32Array(N),
    hgt = new Float32Array(N);
  const mode = new Uint8Array(N),
    spc = new Uint8Array(N),
    flockOf = new Int8Array(N).fill(-1);
  const dirty = new Uint8Array(N);

  // Up to three flocks at once (one per kind)
  const FLOCKS = [];
  for (let i = 0; i < 3; i++)
    FLOCKS.push({
      idx: i,
      active: false,
      kind: "pigeon",
      cx: 0,
      cy: 0,
      cz: 0,
      r: 12,
      dir: 1,
      members: [],
      t: 0,
      scared: false,
      nextCall: 0,
      leaving: false,
    });

  let meshBody = null,
    meshWL = null,
    meshWR = null;
  let activeBirds = 0;
  const _m = new THREE.Matrix4(),
    _mw = new THREE.Matrix4(),
    _ml = new THREE.Matrix4();
  const _q = new THREE.Quaternion(),
    _ql = new THREE.Quaternion(),
    _e = new THREE.Euler(0, 0, 0, "YXZ"),
    _el = new THREE.Euler();
  const _p = new THREE.Vector3(),
    _s = new THREE.Vector3(),
    _one = new THREE.Vector3(1, 1, 1),
    _hingeL = new THREE.Vector3(-0.045, 0.035, -0.03),
    _hingeR = new THREE.Vector3(0.045, 0.035, -0.03);
  const _zero = new THREE.Matrix4().makeScale(0, 0, 0);
  const _col = new THREE.Color();

  function buildBirdMeshes() {
    // Body: pigeon-sized (≈0.32 m); species scale via the instance matrix.
    const parts = [];
    parts.push(
      K.part(
        new THREE.SphereGeometry(1, 9, 7),
        0xbdbdbd,
        [0, 0, 0],
        null,
        [0.068, 0.062, 0.15],
      ),
    );
    parts.push(
      K.part(
        new THREE.SphereGeometry(1, 8, 6),
        0xa8a8a8,
        [0, 0.055, -0.125],
        null,
        [0.043, 0.045, 0.05],
      ),
    );
    parts.push(
      K.part(
        new THREE.ConeGeometry(0.014, 0.045, 5),
        0x3a3530,
        [0, 0.048, -0.185],
        [-Math.PI / 2, 0, 0],
      ),
    );
    parts.push(
      K.part(
        new THREE.BoxGeometry(0.075, 0.012, 0.11),
        0x8e8e8e,
        [0, 0.012, 0.16],
        [0.12, 0, 0],
      ),
    );
    parts.push(
      K.part(
        new THREE.SphereGeometry(0.009, 4, 3),
        0x101010,
        [0.03, 0.068, -0.15],
      ),
    );
    parts.push(
      K.part(
        new THREE.SphereGeometry(0.009, 4, 3),
        0x101010,
        [-0.03, 0.068, -0.15],
      ),
    );
    const body = K.merge(parts);
    // Wings: flat tapered blades hinged at the origin, extending +X (right) / -X (left)
    const wing = (s) => {
      const pts = [
        [0, -0.05],
        [0.09, -0.065],
        [0.2, -0.05],
        [0.29, -0.01],
        [0.3, 0.035],
        [0.2, 0.05],
        [0.1, 0.06],
        [0, 0.05],
      ];
      const pos = [],
        col = [];
      for (let i = 1; i < pts.length - 1; i++) {
        for (const k of [0, i, i + 1]) {
          const x = pts[k][0] * s,
            z = pts[k][1];
          pos.push(x, 0, z);
          const tip = Math.abs(pts[k][0]) / 0.3;
          const c = 0.78 - tip * 0.28;
          col.push(c, c, c);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      g.computeVertexNormals();
      return g;
    };
    const mat = K.vcMat("amb_bird", { roughness: 0.9 });
    const wmat = K.mat(
      "amb_bird_wing",
      () =>
        new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.9,
          side: THREE.DoubleSide,
        }),
    );
    meshBody = new THREE.InstancedMesh(body, mat, N);
    meshWL = new THREE.InstancedMesh(wing(-1), wmat, N);
    meshWR = new THREE.InstancedMesh(wing(1), wmat, N);
    for (const m of [meshBody, meshWL, meshWR]) {
      m.name = "amb_birds";
      m.frustumCulled = false;
      m.castShadow = false;
      m.receiveShadow = false;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let i = 0; i < N; i++) {
        m.setMatrixAt(i, _zero);
        m.setColorAt(i, _col.setRGB(1, 1, 1));
      }
      m.visible = false;
      G.scene.add(m);
    }
  }

  function allocBird() {
    for (let i = 0; i < N; i++) if (mode[i] === M_FREE) return i;
    return -1;
  }
  function freeBird(i) {
    if (mode[i] === M_FREE) return;
    mode[i] = M_FREE;
    flockOf[i] = -1;
    dirty[i] = 1;
    activeBirds--;
  }
  function setSpecies(i, s) {
    spc[i] = s;
    const c = SPECIES[s].color;
    const j = 0.9 + Math.random() * 0.2;
    _col.setRGB(c[0] * j, c[1] * j, c[2] * j);
    meshBody.setColorAt(i, _col);
    meshWL.setColorAt(i, _col);
    meshWR.setColorAt(i, _col);
    meshBody.instanceColor.needsUpdate = true;
    meshWL.instanceColor.needsUpdate = true;
    meshWR.instanceColor.needsUpdate = true;
  }

  function spawnFlock(kind, cx, cy, cz, count, opts) {
    if (!meshBody) return null;
    let f = null;
    for (const fl of FLOCKS)
      if (!fl.active) {
        f = fl;
        break;
      }
    if (!f) return null;
    opts = opts || {};
    f.active = true;
    f.kind = kind;
    f.cx = cx;
    f.cy = cy;
    f.cz = cz;
    f.t = 0;
    f.scared = false;
    f.leaving = false;
    f.r = opts.r || 12;
    f.dir = Math.random() < 0.5 ? -1 : 1;
    f.members.length = 0;
    f.nextCall = K.now() + K.rand(1, 5);
    const s = SP[kind];
    for (let k = 0; k < count; k++) {
      const i = allocBird();
      if (i < 0) break;
      activeBirds++;
      flockOf[i] = f.idx;
      f.members.push(i);
      setSpecies(i, s);
      phase[i] = Math.random() * 6.28;
      flapK[i] = 1;
      glideT[i] = Math.random() * 3;
      tmr[i] = Math.random() * 2;
      vx[i] = vy[i] = vz[i] = 0;
      bank[i] = 0;
      pitch[i] = 0;
      if (kind === "pigeon") {
        mode[i] = M_GROUND;
        const a = Math.random() * 6.28,
          d = Math.random() * 2.6;
        px[i] = cx + Math.sin(a) * d;
        pz[i] = cz + Math.cos(a) * d;
        py[i] = G.world.groundHeight(px[i], pz[i], cy + 0.5, 0.05);
        yaw[i] = Math.random() * 6.28;
        tx[i] = px[i];
        tz[i] = pz[i];
      } else {
        mode[i] = M_CIRCLE;
        ang[i] = Math.random() * 6.28;
        orb[i] = f.r * (0.7 + Math.random() * 0.6);
        hgt[i] = (Math.random() - 0.5) * 6;
        px[i] = cx + Math.sin(ang[i]) * orb[i];
        py[i] = cy + hgt[i];
        pz[i] = cz + Math.cos(ang[i]) * orb[i];
        const sp = SPECIES[s].speed;
        vx[i] = Math.cos(ang[i]) * sp * f.dir;
        vz[i] = -Math.sin(ang[i]) * sp * f.dir;
        vy[i] = 0;
        yaw[i] = Math.atan2(-vx[i], -vz[i]);
      }
    }
    if (!f.members.length) {
      f.active = false;
      return null;
    }
    return f;
  }
  function disbandFlock(f, flyAway) {
    if (!f.active) return;
    for (const i of f.members) {
      if (flyAway) startFlee(i, G.player.pos.x, G.player.pos.z, 1);
      else freeBird(i);
    }
    if (!flyAway) {
      f.members.length = 0;
      f.active = false;
    } else f.leaving = true;
  }
  function startFlee(i, fromX, fromZ, k) {
    if (mode[i] === M_FREE) return;
    mode[i] = M_FLEE;
    let dx = px[i] - fromX,
      dz = pz[i] - fromZ;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d;
    dz /= d;
    const a = (Math.random() - 0.5) * 1.4,
      c = Math.cos(a),
      s = Math.sin(a);
    const rx = dx * c - dz * s,
      rz = dx * s + dz * c;
    const sp = SPECIES[spc[i]].speed * (1 + Math.random() * 0.3);
    tx[i] = rx * sp;
    tz[i] = rz * sp; // desired horizontal velocity
    vy[i] = 2.5 + Math.random() * 2 * (k || 1);
    vx[i] += rx * 2.5;
    vz[i] += rz * 2.5;
    tmr[i] = 0;
    hgt[i] = 14 + Math.random() * 18; // climb-to height above start
    ang[i] = py[i]; // remember start height
  }
  function scareFlock(f, x, z) {
    if (!f.active || f.scared || f.kind !== "pigeon") return;
    f.scared = true;
    for (const i of f.members) startFlee(i, x, z, 1);
    _p.set(f.cx, f.cy + 0.5, f.cz);
    K.synth.flutter(_p, Math.min(1.4, 0.5 + f.members.length * 0.1));
  }

  /** Per-bird simulation. */
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
  K.system({
    name: "fauna",
    order: 10,
    init() {
      buildBirdMeshes();
      buildRatMesh();
      // Gunfire & explosions scatter ground birds; kills attract crows
      G.events.on("weaponFired", () => {
        if (K.playerOk()) scareNear(G.player.pos.x, G.player.pos.z, 75);
      });
      G.events.on("explosion", (pos) => {
        if (pos && pos.x !== undefined) scareNear(pos.x, pos.z, 120);
      });
      G.events.on("actorKilled", (a) => {
        try {
          if (!a || !a.pos || K.isInterior(a.pos.x)) return;
          corpses.push({ x: a.pos.x, y: a.pos.y, z: a.pos.z, t: K.now() });
          if (corpses.length > 4) corpses.shift();
        } catch (e) {
          /* ignore */
        }
      });
    },
    reset() {
      clearBirds();
      clearRats();
      nextFlockT = 0;
      lastPigeonT = lastCrowT = lastGullT = -99;
    },
    update(dt) {
      updateBirds(dt);
      updateRats(dt);
    },
  });

  // ------------------------------------------------------------------
  // Internal API (tests / other ambient files / debug)
  // ------------------------------------------------------------------
  K.fauna = {
    spawnFlock(kind, x, y, z, n, opts) {
      return spawnFlock(kind, x, y, z, n || 8, opts);
    },
    scare: scareNear,
    spawnRat,
    /** A rat swarm around (x,z): used by the "rat's nest" vignette. */
    swarm(n) {
      let k = 0;
      for (let i = 0; i < n; i++) if (spawnRat()) k++;
      return k;
    },
    stats: () => ({
      birds: activeBirds,
      flocks: FLOCKS.filter((f) => f.active).map(
        (f) => f.kind + ":" + f.members.length,
      ),
      rats: activeRats,
    }),
    clear() {
      clearBirds();
      clearRats();
    },
    birdPos: (i) => ({ x: px[i], y: py[i], z: pz[i], mode: mode[i] }),
  };
})();
