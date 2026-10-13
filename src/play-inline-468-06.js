// play-inline-468 06 — tpl
// Lines 3071-3397 of readable/play-inline-468.pretty.js (statement-aligned).
  GIBS.update = function (dt) {
    if (dt <= 0) return;
    const W = G.world;
    for (let i = GIBS.list.length - 1; i >= 0; i--) {
      const g = GIBS.list[i];
      g.age += dt;
      if (!g.keep && g.age > g.life) {
        // sink & shrink out
        g.obj.scale.multiplyScalar(Math.max(0, 1 - dt * 2));
        if (g.pool) {
          g.obj.updateMatrix();
          g.pool.mesh.setMatrixAt(g.slot, g.obj.matrix);
          g.pool.dirty = true;
        }
        if (g.age > g.life + 1.2) GIBS.remove(g);
        continue;
      }
      if (g.rest) continue;
      const o = g.obj;
      g.vel.y -= 16 * dt;
      o.position.addScaledVector(g.vel, dt);
      o.rotation.x += g.ang.x * dt;
      o.rotation.y += g.ang.y * dt;
      o.rotation.z += g.ang.z * dt;
      const gh =
        W && W.groundHeight
          ? W.groundHeight(o.position.x, o.position.z, o.position.y + 0.3)
          : 0;
      if (o.position.y - g.radius < gh) {
        o.position.y = gh + g.radius;
        if (g.vel.y < 0) g.vel.y *= -0.3;
        g.vel.x *= 0.55;
        g.vel.z *= 0.55;
        g.ang.multiplyScalar(0.5);
        if (g.bleed > 0 && !G.isStub("fx") && G.fx.decal) {
          try {
            G.fx.decal(
              new THREE.Vector3(o.position.x, gh + 0.01, o.position.z),
              new THREE.Vector3(0, 1, 0),
              "blood",
            );
          } catch (e) {
            /* optional */
          }
          g.bleed = 0;
        }
        if (Math.abs(g.vel.y) < 0.6 && g.vel.lengthSq() < 0.3) g.rest = true;
      }
      if (g.pool) {
        o.updateMatrix();
        g.pool.mesh.setMatrixAt(g.slot, o.matrix);
        g.pool.dirty = true;
      }
    }
    for (const k in pools) {
      const P = pools[k];
      if (P.dirty) {
        P.mesh.instanceMatrix.needsUpdate = true;
        P.dirty = false;
      }
    }
  };
  GIBS.clear = function () {
    for (const g of GIBS.list.slice()) {
      g.keep = false;
      GIBS.remove(g);
    }
  };

  // ------------------------------------------------------------------
  // PLAYER ARMS (first-person, for the weapons module)
  // ------------------------------------------------------------------
  /**
   * Returns {root, bones:{shoulderL/R, armL/R, forearmL/R, handL/R}, gripR, gripL,
   *          solve(rightGripWorld, leftGripWorld|null, weaponQuatWorld), mesh}
   * Arms are built along -Z from the root (camera space): padded grey-white cryo-suit sleeves with
   * orange cuffs, bare wrists (no wrist device: the VIGIL goggles are the hero's interface).
   */
  C.createPlayerArms = function (opts) {
    opts = opts || {};
    const H = L.human;
    const b = H.proportions(opts.gender || "m", { scale: 1 });
    // viewmodel arms are traditionally stretched so hands reach a weapon held in front of the camera
    const reach = opts.reach || 1.35;
    b.upper *= reach;
    b.fore *= reach;
    const R = new L.Rig("arms");
    R.bone("root", null, 0, 0, 0, "torso");
    for (const [S, sg, part] of [
      ["L", -1, "leftArm"],
      ["R", 1, "rightArm"],
    ]) {
      R.bone("arm" + S, "root", sg * 0.19, -0.22, 0.08, part);
      R.bone("forearm" + S, "arm" + S, 0, -b.upper, 0, part);
      R.bone("hand" + S, "forearm" + S, 0, -b.fore, 0, part);
      const outfit = opts.outfit || "cryo_suit";
      const sleeve =
        outfit === "cryo_suit" ? L.PAL.cryoGrey : opts.sleeveColor || 0x4a4234;
      H.arm(R, b, S, {
        sleeve: "long",
        sleeveColor: sleeve,
        skin: opts.skinTone || L.SKIN.fair,
        glove: opts.glove || null,
        cuff: outfit === "cryo_suit" ? L.PAL.cryoOrange : null,
      });
    }
    R.socket("gripR", "handR", 0, -0.075, -0.01, -PI / 2, 0, 0);
    R.socket("gripL", "handL", 0, -0.075, -0.01, -PI / 2, 0, 0);
    const tpl = R.build();
    const root = new THREE.Group();
    root.name = "playerArms";
    const bones = tpl.bones.map((d) => {
      const bn = new THREE.Bone();
      bn.name = d.name;
      bn.position.set(d.pos[0], d.pos[1], d.pos[2]);
      return bn;
    });
    tpl.bones.forEach((d, i) => {
      if (d.parent >= 0) bones[d.parent].add(bones[i]);
      else root.add(bones[i]);
    });
    root.updateMatrixWorld(true);
    const sk = new THREE.Skeleton(bones);
    const mat = L.makeMaterial();
    const mesh = new THREE.SkinnedMesh(tpl.geometry, mat);
    mesh.frustumCulled = false;
    root.add(mesh);
    mesh.bind(sk);
    const map = {};
    bones.forEach((bn) => (map[bn.name] = bn));
    const sockets = {};
    for (const k in tpl.sockets) {
      const s = tpl.sockets[k];
      const o = new THREE.Object3D();
      o.position.set(s.pos[0], s.pos[1], s.pos[2]);
      o.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
      bones[s.bone].add(o);
      sockets[k] = o;
    }
    // scratch objects reused by solve() every frame (no per-frame allocation)
    const aHq = new THREE.Quaternion(),
      aRq = new THREE.Quaternion(),
      aWrist = new THREE.Vector3(),
      aSh = new THREE.Vector3(),
      aPole = new THREE.Vector3(),
      aOff = new THREE.Vector3();
    const arms = {
      root,
      mesh,
      bones: map,
      gripR: sockets.gripR,
      gripL: sockets.gripL,
      material: mat,
      /** Place hands so the weapon grip (and optional support point) land on world targets. */
      solve(rightGrip, leftGrip, weaponQuat, poleR, poleL) {
        root.updateMatrixWorld(true);
        const side = (S, target, sock) => {
          if (!target) return;
          const A1 = map["arm" + S],
            B1 = map["forearm" + S],
            H1 = map["hand" + S];
          const hq = aHq;
          if (weaponQuat)
            hq.copy(weaponQuat).multiply(_q1.copy(sock.quaternion).invert());
          else root.getWorldQuaternion(hq);
          const wrist = aWrist.copy(sock.position).applyQuaternion(hq);
          wrist.subVectors(target, wrist);
          const sh = A1.getWorldPosition(aSh);
          const pole =
            (S === "R" ? poleR : poleL) ||
            aPole
              .copy(sh)
              .add(
                aOff
                  .set(S === "R" ? 0.4 : -0.4, -0.6, 0.2)
                  .applyQuaternion(root.getWorldQuaternion(aRq)),
              );
          L.solveIK2(
            A1,
            B1,
            wrist,
            pole,
            B1.position.length(),
            H1.position.length(),
            1,
          );
          A1.updateMatrixWorld(true);
          B1.getWorldQuaternion(_q2);
          H1.quaternion.copy(_q2.invert().multiply(hq));
          H1.updateMatrixWorld(true);
        };
        side("R", rightGrip, sockets.gripR);
        side("L", leftGrip, sockets.gripL);
      },
      dispose() {
        if (root.parent) root.parent.remove(root);
        mat.dispose();
        sk.dispose();
      },
    };
    return arms;
  };

  // ------------------------------------------------------------------
  // CROWD FAR TIER & SHADOW BUDGET (driven from the module's lateUpdate)
  // ------------------------------------------------------------------
  const FAR = (L.far = {
    budget: 24, // crowd members animated with full skinned rigs (nearest first)
    dist: 42, // beyond this a standing crowd member becomes a frozen instance
    shadows: 12, // characters casting shadows (nearest first, < 60 m)
    pools: new Map(),
    dirty: false,
    frame: 0,
  });
  const _fm = new THREE.Matrix4(),
    _fInv = new THREE.Matrix4(),
    _fv = new THREE.Vector3(),
    _fn = new THREE.Vector3(),
    _fc = new THREE.Color();
  /** Bake the character's CURRENT pose of its far LOD into a static root-space geometry. */
  function bakePose(ch) {
    const src = L.getLod(ch.tpl, 2);
    const pa = src.attributes.position,
      na = src.attributes.normal,
      si = src.attributes.skinIndex,
      sw = src.attributes.skinWeight;
    if (!pa || !si || !sw) return null;
    ch.root.updateMatrixWorld(true);
    ch.skeleton.update();
    _fInv
      .copy(ch.root.matrixWorld)
      .invert()
      .multiply(ch.mesh.matrixWorld)
      .multiply(ch.mesh.bindMatrixInverse);
    const nb = ch.bones.length,
      BM = new Float32Array(nb * 16),
      bm = ch.skeleton.boneMatrices;
    for (let i = 0; i < nb; i++) {
      _fm
        .fromArray(bm, i * 16)
        .premultiply(_fInv)
        .multiply(ch.mesh.bindMatrix);
      BM.set(_fm.elements, i * 16);
    }
    const n = pa.count,
      P3 = new Float32Array(n * 3),
      N3 = new Float32Array(n * 3),
      e = new Float32Array(16);
    for (let v = 0; v < n; v++) {
      e.fill(0);
      for (let j = 0; j < 4; j++) {
        const w = sw.getComponent(v, j);
        if (w <= 0) continue;
        const o = si.getComponent(v, j) * 16;
        for (let q = 0; q < 16; q++) e[q] += BM[o + q] * w;
      }
      const x = pa.getX(v),
        y = pa.getY(v),
        z = pa.getZ(v);
      P3[v * 3] = e[0] * x + e[4] * y + e[8] * z + e[12];
      P3[v * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
      P3[v * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
      const nx = na.getX(v),
        ny = na.getY(v),
        nz = na.getZ(v);
      _fn
        .set(
          e[0] * nx + e[4] * ny + e[8] * nz,
          e[1] * nx + e[5] * ny + e[9] * nz,
          e[2] * nx + e[6] * ny + e[10] * nz,
        )
        .normalize();
      N3[v * 3] = _fn.x;
      N3[v * 3 + 1] = _fn.y;
      N3[v * 3 + 2] = _fn.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(P3, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(N3, 3));
    for (const k of ["uv", "color", "pbr", "partId", "mcls"])
      if (src.attributes[k]) g.setAttribute(k, src.attributes[k].clone());
    if (src.index) g.setIndex(src.index.clone());
    g.computeBoundingSphere();
    return g;
  }
  // One BATCH per parent group (street scene, interior cell): every far crowd
  // member under that parent is merged into ONE static mesh (its template's
  // baked pose, moved to the member's place and tinted with its cloth tint),
  // so a whole distant market is a single draw call. Rebuilt only when the
  // membership changes or a member is moved/hidden.
  FAR.pool = function (ch) {
    const parent = ch.root.parent;
    let P = FAR.pools.get(parent.uuid);
    if (P && P.parent !== parent) P = null;
    if (!P) {
      P = {
        key: parent.uuid,
        parent,
        mesh: null,
        mat: null,
        members: [],
        idle: 0,
        dirty: true,
      };
      FAR.pools.set(P.key, P);
    }
    const tpl = ch.tpl;
    if (!tpl._farGeo) {
      tpl._farGeo = bakePose(ch);
      if (!tpl._farGeo) return null;
      tpl.users = (tpl.users || 0) + 1; // keep the template (and its bake) alive while in use
      tpl._farRefs = 0;
    }
    tpl._farRefs = (tpl._farRefs || 0) + 1;
    P.dirty = true;
    return P;
  };
  FAR.release = function (ch) {
    const tpl = ch.tpl;
    if (tpl && tpl._farGeo && --tpl._farRefs <= 0) {
      tpl._farGeo.dispose();
      tpl._farGeo = null;
      tpl.users = Math.max(0, (tpl.users || 1) - 1);
    }
  };
  const _bm = new THREE.Matrix4(),
    _bn = new THREE.Matrix3();
