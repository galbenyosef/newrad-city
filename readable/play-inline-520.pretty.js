/* src/ambient_life/20_oxen.js */
/* =====================================================================
 * NEW RAD CITY — AMBIENT LIFE — 20: pack oxen
 *
 * G.chars has no ox, so the rig is built here: a big working ox with a
 * dun hide covered in old healed scars, long swept horns, a leather
 * halter and a collar with a brass bell, four swinging legs with cloven
 * hooves, a swishing tail and (pack variants) a wooden sawbuck pack
 * saddle with crates, saddlebags, bedroll, pots and a jerry can.
 * 8 draw calls per ox, one shared vertex-coloured material.
 *
 * In the game an ox is a real combat actor (killable, searchable for ox
 * meat) whose body is borrowed from a bear-sized creature type (similar
 * size & hit capsules): the borrowed skinned mesh is hidden and this
 * model is parented to the actor's root and animated from its measured
 * speed. It belongs to its own neutral faction `amb_oxen` (never fights
 * on its own; shooting one makes its convoy turn on you), has a feeble
 * attack and no voice lines: it bellows now and then.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;

  const BODY_TYPE = "ash_bear"; // borrowed combat body (bear-sized capsules)
  const PACKS = [
    { blanket: 0x7a2a22, stripe: 0xd8c8a0 }, // oxblood
    { blanket: 0x2c4a6a, stripe: 0xe0d0a0 }, // faded navy
    { blanket: 0x5a6a2a, stripe: 0xc8a040 }, // olive
  ];
  let GEO = null; // shared geometries, built on first use

  // Dun hide with darker patches, a pale belly and old healed scars (thin pale streaks)
  function paintHide(geo, seed) {
    const p = geo.attributes.position,
      n = p.count,
      a = new Float32Array(n * 3);
    const U = G.util;
    const hide = new THREE.Color(0x8c6a4c),
      dark = new THREE.Color(0x4a3526),
      pale = new THREE.Color(0xb39478),
      scar = new THREE.Color(0xc9ab9c),
      c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const f = U.fbm2(x * 1.6 + seed, z * 1.4 + y * 1.2, 3);
      if (f > 0.64) c.copy(dark).lerp(hide, K.clamp((0.72 - f) * 6, 0, 1));
      else c.copy(hide);
      if (y < 0.85) c.lerp(pale, K.clamp((0.85 - y) * 2.5, 0, 0.7)); // pale belly
      const r = Math.abs(U.noise2(x * 1.7 + seed * 3, y * 12 + z * 2.4) - 0.5); // long thin ridges → scars
      if (r < 0.022 && y > 0.8) c.lerp(scar, 0.85);
      const ao = K.clamp(0.62 + (y - 0.55) * 0.55, 0.55, 1.05); // darker underside
      const grain = 0.94 + U.hash2(i * 7 + seed, i * 3) * 0.1;
      a[i * 3] = c.r * ao * grain;
      a[i * 3 + 1] = c.g * ao * grain;
      a[i * 3 + 2] = c.b * ao * grain;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(a, 3));
    return geo;
  }
  const S = (geo, pos, scale, rot) =>
    G.util.bake(
      geo,
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      rot ? rot[1] : 0,
      scale
        ? typeof scale === "number"
          ? scale
          : new THREE.Vector3(scale[0], scale[1], scale[2])
        : 1,
      rot ? rot[0] : 0,
      rot ? rot[2] : 0,
    );

  function buildGeometry() {
    const sph = (w, h) => new THREE.SphereGeometry(1, w || 16, h || 12);
    // ---- body (torso, withers, rump, belly, chest, hip points) ----
    const body = G.util.mergeGeometries([
      S(sph(18, 14), [0, 1.05, 0], [0.56, 0.52, 1.02]),
      S(sph(), [0, 1.27, -0.52], [0.46, 0.36, 0.44]), // withers
      S(sph(), [0, 1.12, 0.6], [0.51, 0.46, 0.46]), // rump
      S(sph(), [0, 0.85, 0.02], [0.46, 0.37, 0.72]), // belly
      S(sph(10, 8), [0, 1.16, -0.96], [0.35, 0.35, 0.25]), // chest / neck root
      S(sph(10, 8), [0, 0.86, -0.82], [0.21, 0.21, 0.16]), // brisket
      S(sph(8, 6), [0.36, 1.37, 0.56], [0.1, 0.08, 0.1]), // hip points
      S(sph(8, 6), [-0.36, 1.37, 0.56], [0.1, 0.08, 0.1]),
    ]);
    K.lump(body, 0.03, 3.0, 11);
    paintHide(body, 4.2);

    // ---- leg (hip at origin, hoof at y = -1.0) ----
    const leg = K.merge([
      K.part(
        new THREE.CylinderGeometry(0.16, 0.105, 0.54, 9),
        0x7e5e46,
        [0, -0.25, 0],
        null,
        null,
        0.12,
        5,
      ),
      K.part(new THREE.SphereGeometry(0.11, 8, 6), 0x6e523e, [0, -0.52, 0.015]),
      K.part(
        new THREE.CylinderGeometry(0.092, 0.08, 0.36, 8),
        0x5e4636,
        [0, -0.7, 0],
        null,
        null,
        0.1,
        6,
      ),
      K.part(new THREE.SphereGeometry(0.09, 7, 5), 0x4e3a2e, [0, -0.87, 0]),
      K.part(
        new THREE.SphereGeometry(1, 7, 5),
        0x3a2a20,
        [0, -0.83, 0.05],
        null,
        [0.075, 0.05, 0.06],
      ), // dewclaw tuft
      K.part(
        new THREE.CylinderGeometry(0.09, 0.108, 0.12, 9),
        0x231d19,
        [0, -0.94, -0.015],
      ),
      K.part(
        new THREE.BoxGeometry(0.02, 0.1, 0.12),
        0x120e0c,
        [0, -0.945, -0.08],
      ), // cloven split
    ]);

    // ---- neck + head (neck base at origin, looking -Z) ----
    const nd = -Math.PI / 2 + 0.55; // neck axis: forward & a little up
    const hornCurve = (sx) =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx * 0.09, 0.42, -0.47),
        new THREE.Vector3(sx * 0.27, 0.45, -0.46),
        new THREE.Vector3(sx * 0.43, 0.52, -0.53),
        new THREE.Vector3(sx * 0.5, 0.65, -0.64),
      ]);
    const halter = new THREE.TorusGeometry(0.115, 0.013, 5, 14);
    halter.rotateY(Math.PI / 2);
    halter.rotateZ(Math.PI / 2);
    const collar = new THREE.TorusGeometry(0.21, 0.03, 6, 16);
    collar.rotateX(Math.PI / 2 - 0.55);
    const headParts = [
      K.part(
        new THREE.CylinderGeometry(0.17, 0.21, 0.52, 10),
        0x86664c,
        [0, 0.12, -0.22],
        [nd, 0, 0],
        null,
        0.14,
        7,
      ),
      K.part(
        new THREE.SphereGeometry(1, 12, 10),
        0x8a684e,
        [0, 0.29, -0.55],
        [0.45, 0, 0],
        [0.14, 0.15, 0.24],
        0.12,
        8,
      ),
      K.part(
        new THREE.SphereGeometry(1, 10, 8),
        0x5a463e,
        [0, 0.18, -0.75],
        [0.35, 0, 0],
        [0.11, 0.095, 0.12],
        0.08,
        9,
      ), // dark muzzle
      K.part(
        new THREE.SphereGeometry(1, 8, 6),
        0x6a4e3c,
        [0, 0.12, -0.66],
        [0.2, 0, 0],
        [0.08, 0.04, 0.11],
      ), // lower jaw
      K.part(
        new THREE.SphereGeometry(1, 9, 7),
        0x7a5a44,
        [0, 0.0, -0.36],
        [0.3, 0, 0],
        [0.08, 0.13, 0.15],
        0.15,
        12,
      ), // dewlap
      K.part(
        new THREE.SphereGeometry(1, 7, 6),
        0x5e4434,
        [0, 0.43, -0.45],
        null,
        [0.13, 0.045, 0.09],
        0.2,
        14,
      ), // poll
      K.part(
        new THREE.SphereGeometry(1, 6, 4),
        0xc4a898,
        [0.06, 0.36, -0.66],
        [0, 0, 0.6],
        [0.015, 0.07, 0.012],
      ), // old scar across the face
      K.part(
        new THREE.SphereGeometry(0.02, 6, 4),
        0x1a1210,
        [0.04, 0.18, -0.86],
      ),
      K.part(
        new THREE.SphereGeometry(0.02, 6, 4),
        0x1a1210,
        [-0.04, 0.18, -0.86],
      ),
      K.part(
        new THREE.SphereGeometry(0.023, 6, 5),
        0x0c0808,
        [0.11, 0.33, -0.58],
      ),
      K.part(
        new THREE.SphereGeometry(0.023, 6, 5),
        0x0c0808,
        [-0.11, 0.33, -0.58],
      ),
      K.part(
        new THREE.SphereGeometry(1, 7, 5),
        0x7a5a44,
        [0.18, 0.36, -0.47],
        [0, 0.2, -0.2],
        [0.09, 0.025, 0.05],
      ), // ears
      K.part(
        new THREE.SphereGeometry(1, 7, 5),
        0x7a5a44,
        [-0.18, 0.36, -0.47],
        [0, -0.2, 0.2],
        [0.09, 0.025, 0.05],
      ),
      K.paint(
        new THREE.TubeGeometry(hornCurve(1), 10, 0.046, 7, false),
        0xd8cba8,
        0.12,
        3,
      ),
      K.paint(
        new THREE.TubeGeometry(hornCurve(-1), 10, 0.046, 7, false),
        0xd8cba8,
        0.12,
        4,
      ),
      K.part(
        new THREE.SphereGeometry(1, 7, 5),
        0xb0a080,
        [0.09, 0.42, -0.47],
        null,
        [0.065, 0.055, 0.065],
      ), // horn bases
      K.part(
        new THREE.SphereGeometry(1, 7, 5),
        0xb0a080,
        [-0.09, 0.42, -0.47],
        null,
        [0.065, 0.055, 0.065],
      ),
      K.part(
        new THREE.ConeGeometry(0.044, 0.1, 7),
        0x3a342a,
        [0.505, 0.69, -0.665],
        [-0.7, 0, -0.3],
      ), // dark horn tips
      K.part(
        new THREE.ConeGeometry(0.044, 0.1, 7),
        0x3a342a,
        [-0.505, 0.69, -0.665],
        [-0.7, 0, 0.3],
      ),
      K.part(halter, 0x3a2416, [0, 0.19, -0.72], [0.35, 0, 0]), // leather halter
      K.part(new THREE.BoxGeometry(0.3, 0.02, 0.03), 0x3a2416, [0, 0.44, -0.5]), // halter poll strap
      K.part(collar, 0x4a2c18, [0, 0.06, -0.14]), // neck collar
      K.part(
        new THREE.CylinderGeometry(0.035, 0.06, 0.11, 8),
        0xb08a3a,
        [0, -0.17, -0.2],
        null,
        null,
        0.1,
        15,
      ), // brass bell
    ];
    const head = G.util.mergeGeometries(headParts);

    // ---- tail ----
    const tail = K.merge([
      K.part(
        new THREE.CylinderGeometry(0.028, 0.016, 0.62, 6),
        0x6e5240,
        [0, -0.31, 0],
      ),
      K.part(
        new THREE.SphereGeometry(1, 6, 5),
        0x2e221a,
        [0, -0.64, 0],
        null,
        [0.05, 0.11, 0.05],
        0.2,
        2,
      ),
    ]);

    // ---- pack variants (sawbuck pack saddle) ----
    const packs = PACKS.map((pk, vi) => {
      const pp = [];
      const B = (w, h, d, c, pos, rot, n) =>
        pp.push(
          K.part(
            new THREE.BoxGeometry(w, h, d),
            c,
            pos,
            rot,
            null,
            n === undefined ? 0.12 : n,
            vi * 5 + pp.length,
          ),
        );
      B(1.1, 0.05, 1.12, pk.blanket, [0, 1.555, 0.04]);
      for (const sx of [-1, 1]) {
        B(
          0.04,
          0.44,
          1.04,
          new THREE.Color(pk.blanket).multiplyScalar(0.8).getHex(),
          [sx * 0.54, 1.34, 0.04],
        );
        B(0.045, 0.06, 1.05, pk.stripe, [sx * 0.545, 1.2, 0.04], null, 0.05);
        B(0.045, 0.03, 1.05, pk.stripe, [sx * 0.545, 1.45, 0.04], null, 0.05);
        // sawbuck: two crossed wooden bucks, front and back, plus side bars
        for (const z of [-0.36, 0.42])
          B(
            0.06,
            0.46,
            0.07,
            0x8a6a42,
            [sx * 0.1, 1.72, z],
            [0, 0, sx * 0.62],
            0.08,
          );
        B(0.07, 0.07, 0.95, 0x7a5a36, [sx * 0.3, 1.6, 0.03], null, 0.08);
        // crates with slats
        B(0.27, 0.4, 0.5, 0x7a5a3a, [sx * 0.72, 1.27, -0.12]);
        for (const y of [1.13, 1.27, 1.41])
          B(0.285, 0.035, 0.52, 0x5a4028, [sx * 0.72, y, -0.12], null, 0.05);
        B(0.29, 0.42, 0.04, 0x4e3824, [sx * 0.72, 1.27, -0.37], null, 0.05);
        B(0.29, 0.42, 0.04, 0x4e3824, [sx * 0.72, 1.27, 0.13], null, 0.05);
        // saddlebags
        B(0.2, 0.3, 0.3, 0x4a3322, [sx * 0.66, 1.23, 0.5], [0, 0, sx * 0.08]);
        B(
          0.21,
          0.08,
          0.31,
          0x3a2618,
          [sx * 0.665, 1.4, 0.5],
          [0, 0, sx * 0.08],
        );
        // girth straps
        B(
          0.03,
          0.82,
          0.07,
          0x2c2018,
          [sx * 0.5, 1.14, -0.3],
          [0, 0, sx * 0.1],
          0.05,
        );
        B(
          0.03,
          0.82,
          0.07,
          0x2c2018,
          [sx * 0.5, 1.14, 0.36],
          [0, 0, sx * 0.1],
          0.05,
        );
        // breeching strap round the rump
        B(
          0.03,
          0.06,
          0.62,
          0x2c2018,
          [sx * 0.5, 1.02, 0.78],
          [0, sx * 0.35, 0],
          0.05,
        );
      }
      B(0.62, 0.035, 0.07, 0x2c2018, [0, 0.565, -0.3], null, 0.05);
      B(0.62, 0.035, 0.07, 0x2c2018, [0, 0.565, 0.36], null, 0.05);
      B(0.86, 0.07, 0.04, 0x3a2618, [0, 1.06, -1.16], null, 0.05); // breast strap
      // bedroll + straps
      pp.push(
        K.part(
          new THREE.CylinderGeometry(0.13, 0.13, 0.86, 10),
          0x6b6a4e,
          [0, 1.74, 0.62],
          [0, 0, Math.PI / 2],
          null,
          0.15,
          vi,
        ),
      );
      for (const x of [-0.25, 0.25])
        pp.push(
          K.part(
            new THREE.CylinderGeometry(0.137, 0.137, 0.04, 10),
            0x2c2018,
            [x, 1.74, 0.62],
            [0, 0, Math.PI / 2],
          ),
        );
      // tarp bundle between the bucks, pots & jerry can
      B(0.5, 0.18, 0.5, 0x8a7d5c, [0, 1.68, 0.03], [0.05, 0, 0], 0.2);
      pp.push(
        K.part(
          new THREE.CylinderGeometry(0.11, 0.09, 0.14, 9),
          0x6d6d68,
          [0.9, 1.07, 0.3],
          null,
          null,
          0.2,
          2,
        ),
      );
      pp.push(
        K.part(
          new THREE.CylinderGeometry(0.08, 0.08, 0.1, 9),
          0x7a4a30,
          [0.9, 1.07, 0.08],
          null,
          null,
          0.25,
          3,
        ),
      );
      B(0.1, 0.3, 0.22, 0x55622e, [-0.9, 1.21, -0.14], null, 0.1);
      B(0.04, 0.05, 0.06, 0x2a2a2a, [-0.9, 1.39, -0.2], null, 0);
      const pg = G.util.mergeGeometries(pp);
      pg.scale(1.08, 1, 1);
      return pg;
    });
    GEO = { body, leg, head, tail, packs };
  }

  // ------------------------------------------------------------------
  // Model instance
  // ------------------------------------------------------------------
  const LEGS = [
    [-0.28, 1.0, -0.6, 0],
    [0.28, 1.0, -0.6, Math.PI],
    [-0.29, 1.02, 0.62, Math.PI],
    [0.29, 1.02, 0.62, 0],
  ]; // FL FR HL HR (+phase)
  function createModel(opts) {
    if (!GEO) buildGeometry();
    opts = opts || {};
    const mat = K.vcMat("amb_ox", { roughness: 0.9 });
    const root = new THREE.Group();
    root.name = "amb_ox";
    const tilt = new THREE.Group();
    tilt.position.y = 1.05;
    root.add(tilt);
    const body = new THREE.Group();
    body.position.y = -1.05;
    tilt.add(body);
    const mesh = (geo, parent, shadow) => {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = !!shadow;
      m.receiveShadow = false;
      parent.add(m);
      return m;
    };
    mesh(GEO.body, body, true);
    if (opts.pack !== false)
      mesh(GEO.packs[(opts.variant || 0) % GEO.packs.length], body, true);
    const legs = LEGS.map((l) => {
      const g = new THREE.Group();
      g.position.set(l[0], l[1], l[2]);
      body.add(g);
      mesh(GEO.leg, g, false);
      g.userData.ph = l[3];
      return g;
    });
    const neck = new THREE.Group();
    neck.position.set(0, 1.3, -0.98);
    neck.scale.setScalar(1.18);
    body.add(neck);
    mesh(GEO.head, neck, true);
    const tail = new THREE.Group();
    tail.position.set(0, 1.3, 1.02);
    tail.rotation.x = 0.18;
    body.add(tail);
    mesh(GEO.tail, tail, false);
    const sc = opts.scale || 0.95 + Math.random() * 0.12;
    root.scale.setScalar(sc);
    const M = {
      root,
      tilt,
      legs,
      neck,
      tail,
      ph: Math.random() * 6,
      t: Math.random() * 50,
      dead: false,
      deadT: 0,
      graze: 0,
      grazeT: K.rand(3, 9),
      seed: Math.random() * 10,
      /** Animate: speed in m/s along the ground. */
      update(dt, speed) {
        M.t += dt;
        const t = M.t;
        if (M.dead) {
          M.deadT = Math.min(1, M.deadT + dt / 0.85);
          const k = M.deadT * M.deadT;
          tilt.rotation.z = -1.52 * k + Math.sin(M.deadT * Math.PI) * 0.05;
          tilt.position.y = 1.05 - 0.55 * k;
          for (let i = 0; i < 4; i++)
            legs[i].rotation.x +=
              ((i < 2 ? -0.25 : 0.3) - legs[i].rotation.x) *
              Math.min(1, dt * 4);
          neck.rotation.x += (-0.35 - neck.rotation.x) * Math.min(1, dt * 3);
          tail.rotation.z *= 0.95;
          return;
        }
        const move = K.clamp(speed / 1.4, 0, 1.6);
        M.ph += ((dt * speed) / 1.2) * Math.PI;
        const amp = 0.42 * Math.min(1, move) + (move > 1 ? 0.12 : 0);
        for (const lg of legs)
          lg.rotation.x = Math.sin(M.ph + lg.userData.ph) * amp;
        tilt.position.y =
          1.05 + Math.abs(Math.sin(M.ph)) * 0.035 * Math.min(1, move);
        tilt.rotation.z = Math.sin(M.ph) * 0.025 * Math.min(1, move);
        tilt.rotation.x = Math.sin(M.ph * 2) * 0.01 * Math.min(1, move);
        // head: nods with the stride, looks around, grazes when standing
        M.grazeT -= dt;
        if (M.grazeT <= 0) {
          M.graze = move < 0.2 && M.graze === 0 && Math.random() < 0.6 ? 1 : 0;
          M.grazeT = M.graze ? K.rand(3, 7) : K.rand(4, 11);
        }
        const g = M.graze && move < 0.2;
        const wantX = g
          ? -0.78 + Math.sin(t * 7) * 0.035
          : -0.04 +
            Math.sin(t * 0.6 + M.seed) * 0.08 +
            Math.sin(M.ph * 2) * 0.06 * move;
        const wantY = g ? 0 : Math.sin(t * 0.27 + M.seed) * 0.32;
        neck.rotation.x += (wantX - neck.rotation.x) * Math.min(1, dt * 2.2);
        neck.rotation.y += (wantY - neck.rotation.y) * Math.min(1, dt * 1.5);
        tail.rotation.z =
          Math.sin(t * 1.7 + M.seed) * 0.22 +
          (Math.sin(t * 0.31) > 0.93 ? Math.sin(t * 13) * 0.3 : 0);
      },
      setDead(v) {
        if (v && !M.dead) {
          M.dead = true;
          M.deadT = 0;
        } else if (!v) {
          M.dead = false;
          tilt.rotation.set(0, 0, 0);
          tilt.position.y = 1.05;
        }
      },
      dispose() {
        if (root.parent) root.parent.remove(root);
      },
    };
    return M;
  }

  // ------------------------------------------------------------------
  // Actor attachment
  // ------------------------------------------------------------------
  const LIVE = [];
  const _pp = new THREE.Vector3();
  function attach(actor, opts) {
    const ch = actor && actor.char;
    if (!ch || !ch.root) return null;
    opts = opts || {};
    const hide = [];
    ch.root.traverse((o) => {
      if (o.isMesh || o.isSkinnedMesh || o.isPoints || o.isSprite || o.isLine)
        hide.push(o);
    });
    for (const o of hide) o.visible = false;
    ch.noFootIK = true;
    const model = createModel(opts);
    // the model faces -Z like every G.chars rig; undo any per-rig yaw offset
    model.root.rotation.y = -(ch.yawOffset || 0);
    ch.root.add(model.root);
    // An ox: no bear voice, no bite worth mentioning (shared type table untouched)
    try {
      if (actor.td)
        actor.td = Object.assign({}, actor.td, {
          sounds: null,
          name: "Ox",
          dormantChance: 0,
        });
    } catch (e) {
      /* ignore */
    }
    try {
      actor.natural = null;
    } catch (e) {
      /* ignore */
    }
    const h = {
      actor,
      model,
      hide,
      lx: actor.pos.x,
      lz: actor.pos.z,
      speed: 0,
      nextMoo: K.now() + K.rand(6, 25),
      pitch: 0.9 + Math.random() * 0.25,
    };
    actor._ambOx = h;
    LIVE.push(h);
    return h;
  }
  function tick(dt) {
    const P = G.player;
    for (let i = LIVE.length - 1; i >= 0; i--) {
      const h = LIVE[i],
        a = h.actor;
      if (!a || a.removed || a._ambGone) {
        h.model.dispose();
        LIVE.splice(i, 1);
        continue;
      }
      for (let k = 0; k < h.hide.length; k++)
        if (h.hide[k].visible) h.hide[k].visible = false;
      if (a.disintegrated) {
        h.model.root.visible = false;
        continue;
      }
      if (dt <= 0) continue;
      const dx = a.pos.x - h.lx,
        dz = a.pos.z - h.lz;
      h.lx = a.pos.x;
      h.lz = a.pos.z;
      const inst = Math.min(8, Math.hypot(dx, dz) / dt);
      h.speed += (inst - h.speed) * Math.min(1, dt * 6);
      if (a.dead) h.model.setDead(true);
      const d = P ? Math.hypot(P.pos.x - a.pos.x, P.pos.z - a.pos.z) : 0;
      if (d < 110 && a.char.root.visible !== false) h.model.update(dt, h.speed);
      // the odd bellow
      if (!a.dead && K.now() > h.nextMoo) {
        h.nextMoo = K.now() + K.rand(18, 55);
        if (d < 45) {
          _pp.set(a.pos.x, a.pos.y + 1.4, a.pos.z);
          K.synth.moo(_pp, h.pitch, Math.random() < 0.35);
        }
      }
    }
  }
  /** Pained bellow when an ox is hurt. */
  function onDamaged(actor) {
    const h = actor && actor._ambOx;
    if (!h || actor.dead) return;
    const t = K.now();
    if (h._hurtT && t - h._hurtT < 1.2) return;
    h._hurtT = t;
    _pp.set(actor.pos.x, actor.pos.y + 1.4, actor.pos.z);
    K.synth.moo(_pp, h.pitch * 1.35, false);
  }

  /** Spawn an ox actor. def: {pos:{x,y,z}, yaw, variant, pack, ai, follow(actor), name, home, level, hp} */
  function spawnActor(def) {
    const a = K.spawnActor({
      type: BODY_TYPE,
      name: def.name || "Pack Ox",
      faction: "amb_oxen",
      level: def.level || 3,
      hp: def.hp || 140,
      dr: 4,
      pos: def.pos,
      yaw: def.yaw || 0,
      ai: def.ai || "wander",
      home: def.home || { x: def.pos.x, z: def.pos.z, r: 4 },
      voice: "amb_none",
      damage: 0.05,
      aggroRange: 4,
      speed: 3.6,
      xp: 8,
      noRespawn: true,
      noLoot: true,
      inventory: K.stock([["ox_meat", 2]]),
      seed: Math.floor(Math.random() * 1e6),
    });
    if (!a) return null;
    if (!attach(a, { variant: def.variant || 0, pack: def.pack })) {
      K.removeActor(a);
      return null;
    }
    if (def.follow) {
      try {
        a.follow(def.follow);
      } catch (e) {
        /* ignore */
      }
    }
    return a;
  }

  K.oxen = {
    createModel,
    attach,
    spawnActor,
    live: () => LIVE.length,
    herds: () =>
      Array.from(herdLive.entries()).map(([h, a]) => h.loc + ":" + a.length),
  };

  // Hitched pack ox at the Flatiron Trading Post rail (landmarks_b left the rail empty "— yet")
  let hitched = null;
  function spawnHitched() {
    if (hitched && K.actorAlive(hitched)) return;
    if (G.isStub("landmarks") || !G.landmarks || !G.landmarks.flatiron) return;
    const y = G.world.groundHeight(141.1, 110, 0.6, 0.3);
    hitched = spawnActor({
      pos: { x: 141.1, y, z: 110 },
      yaw: Math.PI / 2,
      variant: 2,
      ai: "static",
      name: "Pack Ox",
      home: { x: 141.1, z: 110, r: 1 },
    });
  }

  // Settlement herds: a few unpacked oxen wander a pen by the farm-ish towns while the player is
  // near; they are plain actors, streamed in/out by distance.
  const HERDS = [
    { loc: "tavern_on_green", dx: 16, dz: -18, n: 3, r: 7 },
    { loc: "empire_stores", dx: 14, dz: -16, n: 2, r: 5 },
    { loc: "ellis_island", dx: 22, dz: -18, n: 3, r: 7 },
    { loc: "san_remo", dx: 28, dz: 14, n: 2, r: 5 },
  ];
  const herdLive = new Map(); // herd -> [actors]
  function updateHerds() {
    const P = G.player;
    if (!P || K.isInterior(P.pos.x)) {
      for (const [h, arr] of herdLive) {
        for (const a of arr) K.removeActor(a);
        herdLive.delete(h);
      }
      return;
    }
    for (const h of HERDS) {
      const L = G.LAYOUT.getLocation(h.loc);
      if (!L) continue;
      const cx = L.x + h.dx,
        cz = L.z + h.dz;
      const d = Math.hypot(P.pos.x - cx, P.pos.z - cz);
      const live = herdLive.get(h);
      if (live) {
        if (d > 240 || live.every((a) => !K.actorAlive(a))) {
          if (d > 240) for (const a of live) K.removeActor(a);
          herdLive.delete(h);
          h.cool = d > 240 ? 0 : K.gameHours() + 48;
        }
        continue;
      }
      if (
        d > 150 ||
        (h.cool && K.gameHours() < h.cool) ||
        (K.inView(cx, 1, cz, h.r, true) && d < 90)
      )
        continue;
      const arr = [];
      const y0 = G.world.terrainHeight ? G.world.terrainHeight(cx, cz) : 0;
      for (let i = 0; i < h.n; i++) {
        const sp = K.freeSpotNear(
          cx + (Math.random() - 0.5) * h.r,
          cz + (Math.random() - 0.5) * h.r,
          h.r * 0.6,
          14,
          y0,
        );
        if (!sp) continue;
        const b = spawnActor({
          pos: sp,
          yaw: Math.random() * 6.28,
          variant: i,
          pack: false,
          ai: "wander",
          name: "Ox",
          home: { x: cx, z: cz, r: h.r },
        });
        if (b) arr.push(b);
      }
      if (arr.length) herdLive.set(h, arr);
      else h.cool = K.gameHours() + 24;
    }
  }

  let herdT = 0;
  K.system({
    name: "oxen",
    order: 20,
    init() {
      G.events.on("actorDamaged", (a) => {
        try {
          onDamaged(a);
        } catch (e) {
          /* ignore */
        }
      });
    },
    newGame() {
      hitched = null;
      herdLive.clear();
      for (const h of HERDS) h.cool = 0;
    },
    loaded() {
      hitched = null;
      herdLive.clear();
    },
    reset() {
      for (const h of LIVE) h.model.dispose();
      LIVE.length = 0;
      hitched = null;
      herdLive.clear();
    },
    update(dt) {
      tick(dt);
      herdT += dt;
      if (herdT > 2 && K.playerOk() && G.state === "play") {
        herdT = 0;
        updateHerds();
      }
      // (re)hitch when the player is around the trading post
      if (
        dt > 0 &&
        K.playerOk() &&
        !hitched &&
        G.time.frame % 60 === 0 &&
        K.distToPlayer(141, 110) < 150 &&
        !K.isInterior(G.player.pos.x)
      )
        spawnHitched();
      if (hitched && (hitched.removed || hitched._ambGone)) hitched = null;
    },
  });
})();
