// play-inline-491 04 — bone
// Lines 759-1107 of readable/play-inline-491.pretty.js (statement-aligned).
  let handMat = null;
  /** The hands' skin material: atlas + bump + roughness map, wrap-lit, tone-independent nails/palms. */
  function getHandMat() {
    if (handMat) return handMat;
    const t = paintAtlas();
    const base = P.mat("skin");
    handMat = new THREE.MeshStandardMaterial({
      color: base.color.clone(),
      map: t.map,
      bumpMap: t.bump,
      bumpScale: 0.0045,
      roughnessMap: t.rough,
      roughness: 1,
      metalness: 0,
      vertexColors: true,
    });
    handMat.envMapIntensity = 0.35;
    handMat.userData.envK = 0.35;
    handMat.name = "wpn_skinHand";
    handMat.userData.shared = true;
    handMat.userData.wpnMat = "skinHand";
    P.skinPatch(handMat, true);
    if (P.addViewMat) P.addViewMat("skinHand", handMat);
    return handMat;
  }
  P.handMat = getHandMat;

  /**
   * Build a right hand (mirror = true -> left) as ONE SkinnedMesh (1 draw call):
   * every finger/thumb segment + nail is rigidly bound to its own bone; the
   * palm, pads, knuckles and wrist are bound to the root bone.
   * Returns {root, inner, fingers:[[bone x3] x4], thumb:[bone x3], pose, target}
   */
  function buildHand(mirror) {
    const root = new THREE.Group();
    root.name = mirror ? "handL" : "handR";
    const inner = new THREE.Group();
    root.add(inner);
    inner.position.set(0, 0.003, 0.03); // put the curled-finger wrap centre on the origin
    if (mirror) inner.scale.x = -1;
    const parts = []; // {geo, bone, fx:{nail, palm arrays|numbers}, ao, tint}
    const _m = new THREE.Matrix4(),
      _q = new THREE.Quaternion(),
      _e = new THREE.Euler(),
      _p = new THREE.Vector3(),
      _s = new THREE.Vector3();
    /** add a geometry: o = {p, s, r}, reg (atlas region), uvMode 'own' (keeps UV in 0..1 → region) */
    function push(geo, o, bone, reg, fx, ao, tint, skin) {
      o = o || {};
      _e.set(o.r ? o.r[0] : 0, o.r ? o.r[1] : 0, o.r ? o.r[2] : 0);
      _q.setFromEuler(_e);
      if (o.s === undefined) _s.set(1, 1, 1);
      else if (typeof o.s === "number") _s.setScalar(o.s);
      else _s.set(o.s[0], o.s[1], o.s[2]);
      _p.set(o.p ? o.p[0] : 0, o.p ? o.p[1] : 0, o.p ? o.p[2] : 0);
      geo.applyMatrix4(_m.compose(_p, _q, _s));
      if (!geo.attributes.normal) geo.computeVertexNormals();
      // UVs into the atlas region
      const uv = geo.attributes.uv,
        n = geo.attributes.position.count;
      const R = REG[reg];
      for (let i = 0; i < n; i++)
        uv.setXY(
          i,
          regU(R, Math.min(1, Math.max(0, uv.getX(i)))),
          regV(R, Math.min(1, Math.max(0, uv.getY(i)))),
        );
      // vertex colour = ambient occlusion × tint
      const col = new Float32Array(n * 3);
      const t = tint || [1, 1, 1];
      for (let i = 0; i < n; i++) {
        const a = ao ? (typeof ao === "number" ? ao : ao[i]) : 1;
        col[i * 3] = a * t[0];
        col[i * 3 + 1] = a * t[1];
        col[i * 3 + 2] = a * t[2];
      }
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      parts.push({ geo, bone, fx: fx || {}, n, skin: skin || null });
    }
    // ---- palm (root bone 0): rounded palm, thenar/hypothenar pads, knuckles, wrist
    const palm = palmGeo();
    push(
      palm.geo,
      { p: [0, PALM_Y, -0.002] },
      0,
      "palm",
      { palm: palm.fx },
      palm.ao,
    );
    push(
      GEO.sphere(1, 14, 10),
      { p: [-0.021, PALM_Y - 0.0075, 0.017], s: [0.0175, 0.012, 0.026] },
      0,
      "plain",
      { palm: 0.8 },
      1,
    ); // thenar (thumb muscle)
    push(
      GEO.sphere(1, 14, 10),
      { p: [0.022, PALM_Y - 0.0075, 0.014], s: [0.0135, 0.0095, 0.025] },
      0,
      "plain",
      { palm: 0.8 },
      1,
    ); // hypothenar
    push(
      GEO.sphere(1, 16, 8),
      { p: [0.0, PALM_Y - 0.0085, -0.028], s: [0.034, 0.0072, 0.011] },
      0,
      "plain",
      { palm: 1 },
      0.95,
    ); // pads under the knuckles
    for (const f of FINGERS)
      push(
        GEO.sphere(f.r * 1.02, 12, 8),
        { p: [f.x, PALM_Y + 0.0032, f.z + 0.003], s: [1, 0.85, 1.05] },
        0,
        "plain",
        { palm: 0 },
        1,
        [1.0, 0.9, 0.87],
      ); // knuckle bumps (a little redder)
    // wrist: tapers from the heel of the palm back into the sleeve cuff
    {
      const wg = GEO.lathe(
        [
          [0.03, 0.006],
          [0.0292, -0.014],
          [0.027, -0.034],
          [0.0255, -0.05],
          [0.02, -0.058],
        ],
        18,
      );
      push(
        wg,
        { p: [0, PALM_Y - 0.002, 0.03], s: [1.1, 0.74, 1] },
        0,
        "plain",
        { palm: 0 },
        1,
      );
    }
    // ---- bones (rest pose = no rotation, so segment rest positions are pure translations)
    const bones = [];
    const rootBone = new THREE.Bone();
    rootBone.name = "palm";
    bones.push(rootBone);
    const fingers = [];
    const REGS = ["prox", "mid", "dist"];
    FINGERS.forEach((f) => {
      const chain = [];
      let parent = rootBone,
        acc = 0;
      for (let s = 0; s < 3; s++) {
        const bone = new THREE.Bone();
        bone.position.set(
          s === 0 ? f.x : 0,
          s === 0 ? PALM_Y + 0.001 : 0,
          s === 0 ? f.z : -f.len[s - 1],
        );
        parent.add(bone);
        bones.push(bone);
        const bi = bones.length - 1;
        const pr = PHAL[s];
        const ph = phalanxGeo(f.len[s], f.r * pr.r0, f.r * pr.r1, {
          bulge: pr.bulge,
          tip: s === 2,
        });
        const z = f.z - acc;
        push(
          ph.geo,
          { p: [f.x, PALM_Y + 0.001, z] },
          bi,
          REGS[s],
          { palm: ph.fx },
          ph.ao,
          null,
          {
            z0: z,
            len: f.len[s],
            pb: s === 0 ? 0 : bi - 1,
            cb: s < 2 ? bi + 1 : -1,
            B: f.r * (s === 0 ? 1.1 : 0.95),
          },
        );
        if (s === 2)
          push(
            nailGeo(ph, f.len[s], f.r * pr.r1),
            { p: [f.x, PALM_Y + 0.001, z] },
            bi,
            "nail",
            { nail: 1 },
            1,
          );
        acc += f.len[s];
        chain.push(bone);
        parent = bone;
      }
      fingers.push(chain);
    });
    // thumb: metacarpal from the thenar pad
    const thumb = [];
    {
      const base = [-0.029, PALM_Y - 0.004, 0.022],
        lens = [0.042, 0.032, 0.026];
      const RR = [
        [0.0112, 0.0099, 0.04],
        [0.0098, 0.0089, 0.07],
        [0.0092, 0.008, 0.05],
      ];
      let parent = rootBone,
        acc = 0;
      for (let s = 0; s < 3; s++) {
        const bone = new THREE.Bone();
        if (s === 0) bone.position.set(base[0], base[1], base[2]);
        else bone.position.set(0, 0, -lens[s - 1]);
        parent.add(bone);
        bones.push(bone);
        const bi = bones.length - 1;
        const z = base[2] - acc;
        const ph = phalanxGeo(lens[s], RR[s][0], RR[s][1], {
          bulge: RR[s][2],
          tip: s === 2,
        });
        push(
          ph.geo,
          { p: [base[0], base[1], z] },
          bi,
          REGS[s],
          { palm: ph.fx },
          ph.ao,
          null,
          {
            z0: z,
            len: lens[s],
            pb: s === 0 ? 0 : bi - 1,
            cb: s < 2 ? bi + 1 : -1,
            B: RR[s][0] * (s === 0 ? 1.3 : 0.95),
          },
        );
        if (s === 2)
          push(
            nailGeo(ph, lens[s], RR[s][1]),
            { p: [base[0], base[1], z] },
            bi,
            "nail",
            { nail: 1 },
            1,
          );
        acc += lens[s];
        thumb.push(bone);
        parent = bone;
      }
    }
    // ---- merge + rigid skin weights + skin fx masks
    const geo = G.util.mergeGeometries(parts.map((p) => p.geo));
    const n = geo.attributes.position.count;
    const si = new Uint16Array(n * 4),
      sw = new Float32Array(n * 4),
      sfx = new Float32Array(n * 2);
    let o = 0;
    for (const p of parts) {
      const nail = p.fx.nail || 0,
        palmM = p.fx.palm;
      const pz = p.skin ? p.geo.attributes.position : null;
      for (let k = 0; k < p.n; k++) {
        si[(o + k) * 4] = p.bone;
        sw[(o + k) * 4] = 1;
        if (pz) {
          // smooth joints: skin near each knuckle blends with the neighbouring bone (50/50 on the joint
          // plane), so a bent finger folds as ONE continuous surface instead of two capsules meeting —
          // the old rigid binding was what read as "sausage" fingers
          const sk = p.skin,
            zl = pz.getZ(k) - sk.z0; // 0 at the base joint, -len at the far joint
          const wP = 1 - smooth(-1, 1, -zl / sk.B);
          const wC = sk.cb >= 0 ? 1 - smooth(-1, 1, (zl + sk.len) / sk.B) : 0;
          const wS = Math.max(0, 1 - wP - wC),
            tot = wP + wC + wS || 1;
          si[(o + k) * 4] = p.bone;
          sw[(o + k) * 4] = wS / tot;
          si[(o + k) * 4 + 1] = sk.pb;
          sw[(o + k) * 4 + 1] = wP / tot;
          si[(o + k) * 4 + 2] = sk.cb >= 0 ? sk.cb : 0;
          sw[(o + k) * 4 + 2] = wC / tot;
        }
        sfx[(o + k) * 2] = typeof nail === "number" ? nail : nail[k];
        sfx[(o + k) * 2 + 1] =
          palmM === undefined
            ? 0
            : typeof palmM === "number"
              ? palmM
              : palmM[k];
      }
      o += p.n;
    }
    parts.forEach((p) => p.geo.dispose());
    geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(si, 4));
    geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(sw, 4));
    geo.setAttribute("skinfx", new THREE.Float32BufferAttribute(sfx, 2));
    const mesh = new THREE.SkinnedMesh(geo, getHandMat());
    mesh.name = "handMesh";
    mesh.frustumCulled = false;
    mesh.add(rootBone);
    inner.add(mesh);
    root.updateMatrixWorld(true);
    mesh.bind(new THREE.Skeleton(bones));
    const pose = clonePose(POSES.relaxed);
    const hand = {
      root,
      inner,
      mesh,
      fingers,
      thumb,
      pose,
      target: clonePose(POSES.relaxed),
      mirror,
      overrides: null,
    };
    applyPose(hand);
    return hand;
  }
  function clonePose(p) {
    return { f: p.f.map((a) => a.slice()), s: p.s.slice(), t: p.t.slice() };
  }
  function applyPose(h) {
    const p = h.pose;
    for (let i = 0; i < 4; i++) {
      const ch = h.fingers[i];
      ch[0].rotation.set(p.f[i][0], p.s[i], 0, "YXZ");
      ch[1].rotation.set(p.f[i][1], 0, 0);
      ch[2].rotation.set(p.f[i][2], 0, 0);
    }
    // thumb: aim the first segment along t[0..2], roll about it, then curl
    _tv.set(p.t[0], p.t[1], p.t[2]);
    if (_tv.lengthSq() < 1e-6) _tv.set(0, 0, -1);
    _tv.normalize();
    _tm.lookAt(_t0, _tv, _tup);
    h.thumb[0].quaternion.setFromRotationMatrix(_tm);
    _tq.setFromAxisAngle(_tz, p.t[3]);
    h.thumb[0].quaternion.multiply(_tq);
    h.thumb[1].rotation.set(p.t[4], 0, 0);
    h.thumb[2].rotation.set(p.t[5], 0, 0);
  }
  const _tv = new THREE.Vector3(),
    _t0 = new THREE.Vector3(),
    _tup = new THREE.Vector3(0, 1, 0),
    _tz = new THREE.Vector3(0, 0, 1);
