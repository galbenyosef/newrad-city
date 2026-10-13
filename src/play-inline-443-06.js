// play-inline-443 06 — side
// Lines 1486-1650 of readable/play-inline-443.pretty.js (statement-aligned).
  X.buildSkeleton = function (k, pose, t) {
    t = t || {};
    const J = POSES[pose] || POSES.lying;
    const S = new X.Kit(91);
    const bone = { color: C.bone, grime: 0.4, seg: 5, ao: [0.8, 0.3] };
    const sb = (a, b, r) => S.seg("plain", J[a], J[b], r, bone);
    // skull facing along neck->head direction
    const hd = J.head,
      nk = J.neck;
    const fx = hd[0] - nk[0],
      fz = hd[2] - nk[2];
    const face = pose === "lying" ? 0 : Math.atan2(-fx, -fz);
    const skr = { color: C.bone, grime: 0.35, wseg: 8, hseg: 6 };
    if (pose === "lying") {
      S.sphere(
        "plain",
        0.1,
        hd[0],
        hd[1],
        hd[2],
        Object.assign({ s: [0.9, 1.1, 1.0] }, skr),
      );
      S.box(
        "plain",
        0.11,
        0.1,
        0.05,
        hd[0],
        hd[1] - 0.03,
        hd[2] - 0.08,
        Object.assign({}, skr),
      );
      for (const s2 of [-1, 1])
        S.sphere(
          "plain",
          0.025,
          hd[0] + s2 * 0.035,
          hd[1] + 0.08,
          hd[2] - 0.03,
          { color: 0x1a1410, wseg: 5, hseg: 4 },
        );
    } else X.skull(S, hd[0], hd[1], hd[2], 1, { ry: face });
    sb("neck", "chest", 0.022);
    sb("chest", "pelvis", 0.024);
    // ribcage: a few arcs around the chest, oriented by the spine
    const ch = J.chest,
      pv = J.pelvis;
    const sp = new THREE.Vector3(
      nk[0] - pv[0],
      nk[1] - pv[1],
      nk[2] - pv[2],
    ).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      sp,
    );
    const eul = new THREE.Euler().setFromQuaternion(q, "YXZ");
    for (let i = 0; i < 4; i++) {
      const off = (i - 1.5) * 0.06;
      S.torus(
        "plain",
        0.13 - Math.abs(i - 1.2) * 0.012,
        0.012,
        ch[0] + sp.x * off,
        ch[1] + sp.y * off,
        ch[2] + sp.z * off,
        {
          color: C.bone,
          grime: 0.35,
          s: [1, 0.75, 1],
          rx: eul.x,
          ry: eul.y,
          rz: eul.z,
          arc: PI * 1.6,
          tseg: 10,
          rseg: 3,
        },
      );
    }
    // pelvis
    S.torus("plain", 0.1, 0.03, pv[0], pv[1], pv[2], {
      color: C.bone,
      grime: 0.35,
      rx: eul.x + (PI / 2) * 0,
      ry: eul.y,
      rz: eul.z,
      s: [1.2, 0.7, 1],
      tseg: 8,
      rseg: 4,
    });
    for (const side of ["l", "r"]) {
      sb(side + "Sh", side + "El", 0.018);
      sb(side + "El", side + "Ha", 0.014);
      sb(side + "Hi", side + "Kn", 0.024);
      sb(side + "Kn", side + "Fo", 0.02);
      S.box(
        "plain",
        0.08,
        0.02,
        0.1,
        J[side + "Ha"][0],
        J[side + "Ha"][1],
        J[side + "Ha"][2],
        { color: C.bone, grime: 0.4 },
      );
      S.box(
        "plain",
        0.08,
        0.04,
        0.18,
        J[side + "Fo"][0],
        J[side + "Fo"][1],
        J[side + "Fo"][2] - 0.05,
        { color: C.bone, grime: 0.4 },
      );
    }
    sb("lSh", "rSh", 0.015);
    // rotted cloth scraps
    if (t.clothes !== false)
      S.box(
        "fabric",
        0.36,
        0.02,
        0.4,
        pv[0],
        pv[1] + 0.02,
        (pv[2] + ch[2]) / 2,
        {
          color: t.cloth || 0x4a4238,
          rx: pose === "sitting" || pose === "seated" ? -1.2 : 0,
          grime: 0.5,
        },
      );
    k.include(S, {
      x: t.x || 0,
      y: t.y || 0,
      z: t.z || 0,
      ry: t.ry || 0,
      s: t.s || 1,
    });
  };
  // skeleton prototypes: variants map to poses (+ a child-sized one)
  const SK_VARIANTS = [
    ["lying"],
    ["sitting"],
    ["reaching"],
    ["curled"],
    ["seated"],
    ["lying", 0.7],
    ["curled", 0.62],
  ];
  D("skeleton", (k, r, v) => {
    const sv = SK_VARIANTS[v % SK_VARIANTS.length];
    X.buildSkeleton(k, sv[0], {
      s: sv[1] || 1,
      cloth: [0x4a4238, 0x2a3a5a, 0x5a3a2a, 0x3a4a3a][(r() * 4) | 0],
    });
    if (sv[0] !== "seated" && r() < 0.5)
      k.cyl("glow", 0.45, 0.5, 0.004, 0, 0.004, 0, {
        seg: 10,
        color: 0x241a12,
        s: [1, 1, 1.6],
      }); // dark stain
    k.meta.tier = "small";
  });
