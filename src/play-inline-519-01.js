// play-inline-519 01 — three
// Lines 18-364 of readable/play-inline-519.pretty.js (statement-aligned).
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
