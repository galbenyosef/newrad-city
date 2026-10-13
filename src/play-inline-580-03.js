// play-inline-580 03 — math
// Lines 561-1367 of readable/play-inline-580.pretty.js (statement-aligned).
  QX.hook("world", function () {
    const V = QX.c4;
    if (!V || !V.root) return;
    const root = V.root,
      O = V.origin(),
      k = K();
    const col = (lx, lz, w, d, y0, y1, surface) =>
      G.world.addCollider(O.x + lx, O.z + lz, w, d, y0, y1, 0, {
        tag: "qx_c4",
        surface: surface || "metal",
      });
    const plane = (mat, w, h, x, y, z, ry, rx) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.position.set(x, y, z);
      m.rotation.set(rx || 0, ry || 0, 0, "YXZ");
      root.add(m);
      return m;
    };
    const mats = QX.live("mats") ? G.mats : null;

    // ================================================================
    // 1. THE FLOOD — ripple surface, scum film, drip rings, debris
    // ================================================================
    D.normal = rippleNormal();
    D.waterMat = new THREE.MeshStandardMaterial({
      color: 0x15211a,
      roughness: 0.05,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      normalMap: D.normal,
      normalScale: new THREE.Vector2(0.16, 0.16),
      envMap: roomEnv(),
      envMapIntensity: 1.2,
    });
    const scumT = scumTex();
    D.scumMat = new THREE.MeshStandardMaterial({
      map: scumT,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      roughness: 0.85,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    for (const w of V.water) {
      const g = w.geometry;
      const p = g.parameters || {};
      const uv = g.attributes.uv;
      const su = (p.width || 4) / 3.5,
        sv = (p.height || 4) / 3.5;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
      uv.needsUpdate = true;
      w.material = D.waterMat;
      // scum film, a hair above the water, follows it down when drained
      const s = new THREE.Mesh(g, D.scumMat);
      s.renderOrder = 3;
      s.position.z = 0.004; // plane-local +z = up (sheet is rotated -90° on x)
      w.add(s);
      D.scum.push(s);
    }
    // drip rings under the leaking overhead pipes and the ceiling seams
    const rt = ringTex();
    const DRIPS = [
      [-9, 30],
      [9, 36.5],
      [-9, 41],
      [0.6, 12],
      [-0.8, 17],
      [-18.5, 29],
      [6.2, 24.5],
      [-3.5, 26.5],
    ];
    DRIPS.forEach((d, i) => {
      const m = new THREE.MeshBasicMaterial({
        map: rt,
        transparent: true,
        depthWrite: false,
        opacity: 0,
        color: 0xcfe0d4,
      });
      const r = plane(m, 1, 1, d[0], 0.43, d[1], 0, -Math.PI / 2);
      r.renderOrder = 4;
      D.rings.push({
        mesh: r,
        t: rnd() * 2,
        period: 1.4 + rnd() * 1.6,
        sheet: d[1] < 21 ? 0 : d[0] < -12 ? 2 : 1,
      });
    });
    // falling drops (one tiny streak per ring, drawn only while falling)
    const dropMat = new THREE.MeshBasicMaterial({
      color: 0xd8e8dc,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    for (const r of D.rings) {
      const dm = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.09, 0.012),
        dropMat,
      );
      dm.position.set(r.mesh.position.x, 3, r.mesh.position.z);
      dm.visible = false;
      root.add(dm);
      r.drop = dm;
    }

    // floating debris — merged into one group per flooded sheet so it can ride the water level
    const debrisSet = [
      {
        sheet: 1,
        items: [
          ["plank", -4.2, 30.5, 0.4],
          ["plank", 5.3, 34.2, 1.9],
          ["paper", -2.8, 36.2, 0.2],
          ["paper", 3.2, 29.4, 1.1],
          ["paper", -8.4, 27.2, 2.5],
          ["paper", 8.6, 42.0, 0.8],
          ["bottle", -5.6, 41.5, 0.3],
          ["bottle", 2.2, 38.8, 2.2],
          ["lunchbox", 4.6, 31.2, 0.6],
          ["tray", -9.8, 35.4, 0.9],
          ["chair", 7.8, 30.1, 0.4],
          ["bear", -3.9, 24.4, 1.4],
          ["plank", -10.2, 43.4, 0.1],
          ["cushion", 9.2, 38.2, 0.7],
        ],
      },
      {
        sheet: 0,
        items: [
          ["paper", 0.3, 7.5, 0.4],
          ["plank", -0.6, 13.8, 1.45],
          ["bottle", 0.8, 18.2, 2.1],
        ],
      },
      {
        sheet: 2,
        items: [
          ["paper", -16.2, 28.6, 0.5],
          ["paper", -14.0, 38.2, 2.0],
          ["cushion", -17.6, 36.5, 1.2],
          ["comic", -15.1, 31.4, 0.3],
          ["bottle", -19.8, 33.1, 1.0],
        ],
      },
    ];
    const DM = {
      wood: k.mat("wood_rotten", 0x5a4028),
      paper: k.tint("qx_c4_paper", 0xb8b098, { roughness: 1 }),
      glass: k.tint("qx_c4_bottle", 0x3a5a3a, {
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0.8,
      }),
      orange: k.tint("qx_c4_orange", 0xd8641e, { roughness: 0.6 }),
      white: k.tint("qx_c4_white", 0xe8eef0, { roughness: 0.5 }),
      fab: k.tint("qx_c4_fabric_r", 0x6a3a30, { roughness: 1 }),
      metal: k.mat("metal_painted", 0x55606a),
      bear: k.tint("qx_c4_bear", 0x7a5a3a, { roughness: 1 }),
      comic: k.tint("qx_c4_comic", 0xb04030, { roughness: 0.9 }),
    };
    const WY = 0.42;
    for (const set of debrisSet) {
      const g = new THREE.Group();
      root.add(g);
      const b = k.builder();
      for (const [kind, x, z, a] of set.items) {
        if (kind === "plank")
          k.box(
            b,
            DM.wood,
            1.6 + rnd() * 0.8,
            0.05,
            0.18,
            x,
            WY,
            z,
            a,
            0.02,
            0.03,
          );
        else if (kind === "paper")
          k.box(
            b,
            DM.paper,
            0.22,
            0.004,
            0.3,
            x,
            WY + 0.004,
            z,
            a,
            0.05 * (rnd() - 0.5),
            0.05 * (rnd() - 0.5),
          );
        else if (kind === "bottle") {
          k.cyl(b, DM.glass, 0.035, 0.2, x, WY + 0.01, z, 8, Math.PI / 2, 0, a);
          k.cyl(
            b,
            DM.glass,
            0.014,
            0.08,
            x + Math.sin(a) * 0.13,
            WY + 0.01,
            z + Math.cos(a) * 0.13,
            6,
            Math.PI / 2,
            0,
            a,
          );
        } else if (kind === "lunchbox") {
          k.box(b, DM.white, 0.3, 0.16, 0.12, x, WY + 0.03, z, a, 0.15);
          k.box(b, DM.orange, 0.31, 0.03, 0.13, x, WY + 0.08, z, a, 0.15);
        } else if (kind === "tray")
          k.box(b, DM.metal, 0.46, 0.025, 0.34, x, WY + 0.005, z, a, 0.04);
        else if (kind === "chair") {
          k.box(
            b,
            DM.orange,
            0.42,
            0.42,
            0.06,
            x,
            WY + 0.05,
            z,
            a,
            Math.PI / 2 - 0.2,
          );
          k.box(
            b,
            DM.orange,
            0.42,
            0.06,
            0.4,
            x + Math.sin(a) * 0.25,
            WY + 0.12,
            z + Math.cos(a) * 0.25,
            a,
            -0.3,
          );
        } else if (kind === "bear") {
          k.sphere(b, DM.bear, 0.11, x, WY + 0.04, z);
          k.sphere(b, DM.bear, 0.075, x + 0.14, WY + 0.05, z + 0.02);
          k.sphere(b, DM.bear, 0.03, x + 0.16, WY + 0.1, z + 0.07);
          k.sphere(b, DM.bear, 0.03, x + 0.16, WY + 0.1, z - 0.04);
        } else if (kind === "cushion")
          k.box(b, DM.fab, 0.44, 0.08, 0.44, x, WY + 0.02, z, a, 0.06);
        else if (kind === "comic")
          k.box(b, DM.comic, 0.2, 0.01, 0.28, x, WY + 0.005, z, a, 0.02);
      }
      k.flush(b, g, false);
      D.debris.push({ group: g, sheet: set.sheet, ph: rnd() * 6 });
    }

    // ================================================================
    // 2. FLOOR SEAL (under the water) + posters + stains
    // ================================================================
    const em = new THREE.MeshStandardMaterial({
      map: emblemTex(),
      transparent: true,
      depthWrite: false,
      roughness: 0.55,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    });
    plane(em, 9.5, 9.5, 0, 0.012, 33, 0, -Math.PI / 2);
    {
      const PT = {};
      const poster = (kind, x, y, z, ry, s) =>
        QX.safe("poster", () => {
          const m =
            PT[kind] ||
            (PT[kind] = new THREE.MeshStandardMaterial({
              map: posterTex(kind),
              roughness: 0.92,
              metalness: 0,
              side: THREE.DoubleSide,
            }));
          plane(m, 0.8 * (s || 1), 1.2 * (s || 1), x, y, z, ry);
        });
      poster("lw", -3.8, 2.6, 44.84, Math.PI, 1.3); // pod-hall south wall, beside the pump room
      poster("fizzo", 7.5, 2.5, 44.84, Math.PI, 1.1);
      poster("crew", 11.84, 2.5, 26.4, -Math.PI / 2, 1.1); // pod-hall east wall
      poster("ocd", -11.84, 2.7, 25.0, Math.PI / 2, 1.1); // pod-hall west wall
      poster("comic", -12.16, 2.0, 38.6, -Math.PI / 2, 1.0); // quarters (east wall, inside)
      poster("fizzo", -18.8, 2.0, 40.84, Math.PI, 0.9); // quarters south wall
      poster("lw", 19.0, 2.0, 27.16, 0, 1.0); // office north wall
      poster("ocd", 4.84, 2.6, 51.5, -Math.PI / 2, 1.0); // pump room east wall
    }
    if (mats && mats.decal) {
      const decal = (name, w, h, x, y, z, ry, rx) =>
        QX.safe("decal", () => {
          const m = mats.decal(name);
          if (m) plane(m, w, h, x, y, z, ry, rx);
        });
      // rust bleeding down from the ceiling seams and water stains at the old tide line
      for (const [x, z, ry] of [
        [9.0, 21.04, 0],
        [4.0, 21.04, 0],
        [8.5, 44.96, Math.PI],
        [-8.2, 44.96, Math.PI],
        [11.96, 25.5, -Math.PI / 2],
        [-11.96, 40.6, Math.PI / 2],
      ])
        decal("rust_stain", 1.4, 3.2, x, 6.2, z, ry);
      for (const [x, z, ry] of [
        [5.5, 21.04, 0],
        [6.5, 44.96, Math.PI],
        [11.96, 41.5, -Math.PI / 2],
        [-11.96, 24.2, Math.PI / 2],
        [-1.66, 10, -Math.PI / 2],
        [1.66, 15, Math.PI / 2],
      ])
        decal("water_stain", 2.4, 1.6, x, 1.6, z, ry);
      for (const [x, z, ry] of [
        [-11.96, 29, Math.PI / 2],
        [11.96, 36.2, -Math.PI / 2],
        [-23.96, 29, Math.PI / 2],
        [4.96, 48, -Math.PI / 2],
      ])
        decal("moss", 2.0, 1.2, x, 0.9, z, ry);
      plane(
        new THREE.MeshStandardMaterial({ map: drawingTex(), roughness: 0.95 }),
        0.7,
        0.7,
        -22.4,
        1.7,
        40.96,
        Math.PI,
      ); // a child's drawing on the quarters wall
      decal("cracks", 2.2, 2.2, 6.0, 7.96, 33, 0, Math.PI / 2);
      decal("cracks", 2.2, 2.2, -5.0, 7.96, 29.5, 0.8, Math.PI / 2);
      decal("blood_smear", 1.0, 0.9, -2.3, 1.1, 44.96, Math.PI); // someone tried the pump-room door the hard way
    }

    // ================================================================
    // 3. ROOMS
    // ================================================================
    const b = k.builder();
    const M = {
      metal: k.mat("metal_painted", 0x55606a),
      dark: k.tint("qx_c4_dark", 0x14171a, { roughness: 0.9 }),
      rust: k.mat("rust", 0x5a3a22),
      orange: k.tint("qx_c4_orange", 0xd8641e, { roughness: 0.6 }),
      white: k.tint("qx_c4_white", 0xe8eef0, { roughness: 0.5 }),
      wood: k.mat("wood_planks", 0x6a4a2a),
      desk: k.tint("qx_c4_desk", 0x5d6a6a, { roughness: 0.5, metalness: 0.55 }),
      chrome: k.tint("qx_c4_chrome", 0xb8bcbc, {
        roughness: 0.25,
        metalness: 0.9,
      }),
      leather: k.tint("qx_c4_leather", 0x3a2418, { roughness: 0.6 }),
      fab: k.mat("fabric", 0x6a6a5a),
      paper: DM.paper,
      book: k.tint("qx_c4_books", 0x6a3226, { roughness: 0.9 }),
      book2: k.tint("qx_c4_books2", 0x2a4a5a, { roughness: 0.9 }),
      crt: k.tint("qx_c4_crt", 0x3a2408, {
        emissive: 0xffa020,
        emissiveIntensity: 0.9,
      }),
      red: k.tint("qx_c4_red", 0x801810, {
        emissive: 0xff2a10,
        emissiveIntensity: 1.4,
      }),
      amber: k.tint("qx_c4_amber", 0x7a5010, {
        emissive: 0xffa020,
        emissiveIntensity: 1.2,
      }),
      cage: k.tint("qx_c4_cage", 0x2a2e2e, { roughness: 0.6, metalness: 0.7 }),
      rug: k.tint("qx_c4_rug", 0x5a2a24, { roughness: 1 }),
      valve: k.tint("qx_c4_valve", 0x8a1c14, {
        roughness: 0.55,
        metalness: 0.4,
      }),
      plast: k.tint("qx_c4_plastic", 0x8aa8b0, {
        roughness: 0.3,
        transparent: true,
        opacity: 0.55,
      }),
    };

    // ---- caged fixtures round every fluorescent tube (the tubes themselves are in 35) ----
    const TUBES = [
      [0, 7.2, 0],
      [0, 3.0, 8],
      [0, 3.0, 16],
      [-6, 7.7, 27],
      [6, 7.7, 27],
      [-6, 7.7, 39],
      [6, 7.7, 39],
      [-18, 3.3, 30],
      [-18, 3.3, 37],
      [16.5, 3.3, 31],
      [0, 4.8, 51],
    ];
    for (const [x, y, z] of TUBES) {
      k.box(b, M.metal, 1.5, 0.08, 0.34, x, y + 0.07, z); // housing
      for (const s of [-1, 1])
        k.box(b, M.cage, 1.5, 0.12, 0.02, x, y - 0.02, z + s * 0.16); // side lips
      for (let i = -2; i <= 2; i++)
        k.box(b, M.cage, 0.015, 0.015, 0.34, x + i * 0.34, y - 0.08, z); // cage wires
      if (y > 4)
        k.cyl(b, M.cage, 0.008, 7.95 - y - 0.1, x, (y + 7.95) / 2 + 0.05, z, 4); // suspension rods in the tall rooms
    }

    // ---- Director's office (x 12..21, z 27..37, h 3.4) ----
    // Civil Defense desk kit: the old wooden desk from 35 gets a steel modesty panel, chrome trim, blotter, papers, lamp, mug, the Director's nameplate
    const dx = 16.5,
      dz = 33.6;
    k.box(b, M.desk, 2.24, 0.06, 1.04, dx, 0.85, dz);
    k.box(b, M.chrome, 2.26, 0.03, 0.03, dx, 0.83, dz - 0.52);
    k.box(b, M.desk, 2.1, 0.7, 0.04, dx, 0.42, dz - 0.46);
    k.box(b, M.leather, 0.9, 0.01, 0.55, dx + 0.1, 0.885, dz); // blotter
    for (let i = 0; i < 5; i++)
      k.box(
        b,
        M.paper,
        0.22,
        0.004,
        0.3,
        dx - 0.65 + rnd() * 0.25,
        0.884 + i * 0.004,
        dz + 0.05 + rnd() * 0.2,
        rnd() * 0.6 - 0.3,
      );
    k.cyl(b, M.metal, 0.08, 0.02, dx + 0.85, 0.89, dz + 0.25, 10);
    k.cyl(b, M.metal, 0.012, 0.36, dx + 0.85, 1.06, dz + 0.25, 5); // desk lamp
    k.cone(b, M.orange, 0.1, 0.12, dx + 0.85, 1.25, dz + 0.18, 10);
    k.box(b, M.amber, 0.06, 0.02, 0.06, dx + 0.85, 1.19, dz + 0.18);
    k.cyl(b, M.fab, 0.04, 0.09, dx - 0.9, 0.93, dz - 0.18, 8); // mug
    k.box(b, M.white, 0.34, 0.08, 0.02, dx, 0.93, dz - 0.4, 0, -0.35); // nameplate
    // swivel chair behind the desk (south side, pushed back as if she just stood up)
    const cx = dx - 0.5,
      cz = dz + 0.9;
    k.cyl(b, M.chrome, 0.28, 0.03, cx, 0.06, cz, 5);
    k.cyl(b, M.chrome, 0.03, 0.4, cx, 0.26, cz, 6);
    k.box(b, M.leather, 0.5, 0.1, 0.48, cx, 0.5, cz, 0.25);
    k.box(
      b,
      M.leather,
      0.48,
      0.55,
      0.08,
      cx + 0.06,
      0.86,
      cz + 0.24,
      0.25,
      -0.12,
    );
    col(cx, cz, 0.55, 0.55, 0, 0.9, "metal");
    // filing cabinets + bookshelf on the north wall, the O.C.D. pennant on the south wall, a stopped clock over the door
    for (let i = 0; i < 3; i++) {
      const fx = 12.75 + i * 0.62;
      k.box(b, M.desk, 0.58, 1.32, 0.62, fx, 0.66, 27.35);
      for (let d = 0; d < 4; d++) {
        k.box(b, M.metal, 0.5, 0.27, 0.02, fx, 0.2 + d * 0.31, 27.67);
        k.box(b, M.chrome, 0.12, 0.025, 0.03, fx, 0.29 + d * 0.31, 27.69);
      }
    }
    k.box(b, M.desk, 0.58, 0.02, 0.62, 13.37, 1.33, 27.35);
    k.sphere(b, M.book2, 0.17, 12.9, 1.52, 27.35);
    k.cyl(b, M.chrome, 0.012, 0.36, 12.9, 1.52, 27.35, 5, 0.4); // desk globe on the cabinet
    col(13.37, 27.35, 1.9, 0.66, 0, 1.35);
    k.box(b, M.wood, 1.8, 2.2, 0.36, 16.2, 1.1, 27.2);
    for (let s = 0; s < 4; s++) {
      k.box(b, M.wood, 1.72, 0.03, 0.32, 16.2, 0.35 + s * 0.5, 27.22);
      let bx = 15.4;
      while (bx < 16.95) {
        const w = 0.04 + rnd() * 0.05,
          h = 0.26 + rnd() * 0.14;
        if (rnd() > 0.12)
          k.box(
            b,
            rnd() > 0.5 ? M.book : M.book2,
            w,
            h,
            0.24,
            bx,
            0.37 + s * 0.5 + h / 2,
            27.24,
            0,
            0,
            rnd() > 0.85 ? 0.25 : 0,
          );
        bx += w + 0.012;
      }
    }
    col(16.2, 27.2, 1.8, 0.4, 0, 2.2, "wood");
    k.box(b, M.rug, 3.0, 0.012, 2.0, dx, 0.006, dz + 0.2);
    const flag = k.plate("OFFICE OF\nCIVIL\nDEFENSE\n— C-4 —", 0.9, 1.3, {
      fg: "#f4f4f0",
      bg: "#c4561a",
    });
    flag.position.set(15.2, 2.1, 36.84);
    flag.rotation.y = Math.PI;
    root.add(flag);
    k.cyl(b, M.chrome, 0.012, 1.1, 15.2, 2.78, 36.8, 5, 0, Math.PI / 2);
    const clockT = canvasTex(128, 128, (x, w) => {
      x.fillStyle = "#e8e2cc";
      x.beginPath();
      x.arc(64, 64, 60, 0, 7);
      x.fill();
      x.lineWidth = 6;
      x.strokeStyle = "#2a2a28";
      x.stroke();
      x.fillStyle = "#2a2a28";
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        x.fillRect(64 + Math.sin(a) * 48 - 2, 64 - Math.cos(a) * 48 - 5, 4, 10);
      }
      x.lineCap = "round";
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(64, 64);
      x.lineTo(64 + Math.sin(2.6) * 28, 64 - Math.cos(2.6) * 28);
      x.stroke(); // 9:47 — day nine
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(64, 64);
      x.lineTo(64 + Math.sin(4.92) * 44, 64 - Math.cos(4.92) * 44);
      x.stroke();
      x.fillStyle = "rgba(90,70,40,0.3)";
      x.beginPath();
      x.arc(80, 90, 30, 0, 7);
      x.fill();
    });
    plane(
      new THREE.MeshStandardMaterial({ map: clockT, roughness: 0.4 }),
      0.36,
      0.36,
      12.16,
      2.95,
      34.4,
      Math.PI / 2,
    );
    // (the tally-mark wall is in 35)

    // ---- crew quarters (x -24..-12, z 25..41, h 3.4) ----
    // mess table with a checkers game abandoned mid-move; benches
    const tx = -16.8,
      tz = 33.2;
    k.box(b, M.desk, 1.9, 0.05, 0.9, tx, 0.76, tz);
    for (const sx of [-0.8, 0.8])
      for (const sz of [-0.35, 0.35])
        k.cyl(b, M.chrome, 0.025, 0.74, tx + sx, 0.37, tz + sz, 6);
    for (const sz of [-0.75, 0.75]) {
      k.box(b, M.orange, 1.7, 0.05, 0.32, tx, 0.45, tz + sz);
      for (const sx of [-0.7, 0.7])
        k.box(b, M.chrome, 0.04, 0.44, 0.04, tx + sx, 0.22, tz + sz);
    }
    col(tx, tz, 1.9, 1.9, 0, 0.8, "metal");
    const chk = canvasTex(128, 128, (x) => {
      for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++) {
          x.fillStyle = (i + j) % 2 ? "#1a1a1a" : "#b83020";
          x.fillRect(i * 16, j * 16, 16, 16);
        }
      const pc = [
        [1, 0, "#e0d8c0"],
        [3, 0, "#e0d8c0"],
        [0, 1, "#e0d8c0"],
        [4, 3, "#e0d8c0"],
        [6, 1, "#e0d8c0"],
        [2, 5, "#303030"],
        [5, 6, "#303030"],
        [7, 6, "#303030"],
        [3, 4, "#303030"],
        [1, 6, "#303030"],
      ];
      for (const [i, j, c] of pc) {
        if ((i + j) % 2 === 0) continue;
        x.fillStyle = c;
        x.beginPath();
        x.arc(i * 16 + 8, j * 16 + 8, 6, 0, 7);
        x.fill();
      }
    });
    plane(
      new THREE.MeshStandardMaterial({ map: chk, roughness: 0.6 }),
      0.42,
      0.42,
      tx + 0.3,
      0.79,
      tz,
      0.2,
      -Math.PI / 2,
    );
    k.cyl(b, M.metal, 0.05, 0.1, tx - 0.5, 0.84, tz + 0.2, 8);
    k.box(b, M.paper, 0.2, 0.004, 0.14, tx - 0.4, 0.786, tz - 0.25, 0.4);
    // finish the bunks from 35: second pair of posts, head/foot boards, side rails, pillows, blankets, a ladder
    const blanket = [
      k.tint("qx_c4_blanket_a", 0x3a4a6a, { roughness: 1 }),
      k.tint("qx_c4_blanket_b", 0x5a5a48, { roughness: 1 }),
    ];
    const pillow = k.tint("qx_c4_pillow", 0xb8b4a0, { roughness: 1 });
    for (let i = 0; i < 4; i++) {
      const bz = 27 + i * 3.4;
      for (const px of [-23.75, -21.85])
        k.box(b, M.metal, 0.06, 2.0, 0.06, px, 1.0, bz + 0.44);
      k.box(b, M.white, 0.05, 1.9, 0.9, -23.8, 1.0, bz); // headboard
      for (const lvl of [0.45, 1.6]) {
        k.box(b, M.orange, 0.05, 0.36, 0.9, -21.8, lvl + 0.16, bz); // footboard
        k.box(b, M.metal, 1.9, 0.04, 0.03, -22.8, lvl + 0.08, bz + 0.46); // side rail
        k.box(b, pillow, 0.34, 0.1, 0.55, -23.5, lvl + 0.25, bz, 0.08);
        const messy = (i + (lvl > 1 ? 1 : 0)) % 2;
        if (messy)
          k.box(
            b,
            blanket[i % 2],
            1.2,
            0.05,
            0.88,
            -22.35,
            lvl + 0.22,
            bz + 0.03,
            0.06,
            0.04,
          ); // thrown back
        else
          k.box(b, blanket[(i + 1) % 2], 0.4, 0.1, 0.8, -22.1, lvl + 0.25, bz); // folded at the foot
      }
      for (let r = 0; r < 4; r++)
        k.box(b, M.chrome, 0.03, 0.03, 0.34, -21.78, 0.55 + r * 0.33, bz - 0.2); // ladder rungs
    }
    // footlockers at the bunk ends, a water cooler, a laundry basket
    for (let i = 0; i < 3; i++) {
      const bz = 27 + i * 3.4;
      k.box(b, i % 2 ? M.white : M.desk, 0.5, 0.36, 0.8, -21.45, 0.18, bz);
      k.box(b, M.orange, 0.51, 0.04, 0.81, -21.45, 0.3, bz);
      col(-21.45, bz, 0.5, 0.8, 0, 0.36);
    }
    k.box(b, M.metal, 0.38, 1.0, 0.38, -12.6, 0.5, 39.8);
    k.cyl(b, M.plast, 0.16, 0.42, -12.6, 1.22, 39.8, 12);
    col(-12.6, 39.8, 0.42, 0.42, 0, 1.4);
    k.cyl(b, M.wood, 0.25, 0.4, -14.2, 0.2, 40.3, 10);
    k.box(b, M.fab, 0.4, 0.1, 0.4, -14.2, 0.42, 40.3, 0.5);
    // a ceiling pipe run over the bunks
    k.cyl(b, M.metal, 0.09, 16, -23.5, 3.05, 33, 8, Math.PI / 2);
    k.cyl(b, M.rust, 0.06, 16, -23.2, 3.18, 33, 8, Math.PI / 2);

    // ---- pump room (x -5..5, z 45..57, h 5) ----
    for (const px of [-2.6, 2.6]) {
      k.torus(
        b,
        M.valve,
        0.34,
        px + (px < 0 ? 1.05 : -1.05),
        1.5,
        49,
        0,
        Math.PI / 2,
      ); // valve wheels (facing the aisle)
      k.cyl(
        b,
        M.metal,
        0.03,
        0.3,
        px + (px < 0 ? 0.95 : -0.95),
        1.5,
        49,
        6,
        0,
        Math.PI / 2,
      );
      k.box(b, M.metal, 2.1, 0.2, 2.1, px, 0.1, 49); // plinths
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        k.cyl(
          b,
          M.chrome,
          0.04,
          0.12,
          px + Math.cos(a) * 0.95,
          2.62,
          49 + Math.sin(a) * 0.95,
          6,
        );
      } // flange bolts
      k.cyl(b, M.metal, 0.22, 3.5, px, 3.85, 46.8, 10, Math.PI / 2); // discharge pipe → atrium
    }
    // gauge board on the east wall + the notorious Pump 2 fuse box on the west wall
    k.box(b, M.desk, 0.1, 1.2, 2.2, 4.9, 1.6, 48.8);
    for (let i = 0; i < 3; i++) {
      k.cyl(
        b,
        M.chrome,
        0.16,
        0.06,
        4.83,
        1.85,
        48.1 + i * 0.7,
        14,
        0,
        Math.PI / 2,
      );
      k.cyl(
        b,
        M.paper,
        0.13,
        0.065,
        4.82,
        1.85,
        48.1 + i * 0.7,
        14,
        0,
        Math.PI / 2,
      );
      k.box(
        b,
        M.red,
        0.01,
        0.11,
        0.01,
        4.78,
        1.88,
        48.1 + i * 0.7 + 0.02,
        0,
        (i - 1) * 0.9,
      );
    }
    for (let i = 0; i < 4; i++)
      k.box(
        b,
        i === 2 ? M.red : M.amber,
        0.03,
        0.06,
        0.06,
        4.84,
        1.3,
        48.0 + i * 0.5,
      );
    k.box(b, M.desk, 0.26, 0.9, 0.7, -4.85, 1.6, 50.2);
    k.box(b, M.orange, 0.02, 0.2, 0.2, -4.71, 1.85, 50.2);
    k.box(b, M.dark, 0.02, 0.5, 0.5, -4.7, 1.45, 50.2, 0, 0, 0.35); // blown door hanging off
    for (let i = 0; i < 3; i++)
      k.box(
        b,
        M.dark,
        0.3,
        0.02,
        0.08,
        -4.6,
        2.1 + i * 0.05,
        49.5 - i * 0.2,
        0.3,
        0,
        -0.5 + i * 0.3,
      ); // scorch streaks
    // hazard stripes round the pump plinths
    for (const sx of [-1.45, 1.45])
      for (let i = 0; i < 18; i++)
        k.box(
          b,
          i % 2 ? M.orange : M.dark,
          0.12,
          0.012,
          0.4,
          sx,
          0.006,
          45.6 + i * 0.4,
        );
    k.flush(b, root, false);

    // stencils
    const st = (t, x, y, z, ry, w) => {
      const s = k.plate(t, w || 1.0, (w || 1.0) * 0.3, {
        fg: "#1c1c1a",
        bg: "#d8641e",
      });
      s.position.set(x, y, z);
      s.rotation.y = ry;
      root.add(s);
    };
    st("PUMP 1", -2.6, 2.9, 47.95, Math.PI, 0.8);
    st("PUMP 2", 2.6, 2.9, 47.95, Math.PI, 0.8);
    st("DANGER — 480 V\nDO NOT TOUCH, CHO", -4.7, 2.35, 50.2, Math.PI / 2, 0.8);
    st("DIRECTOR'S OFFICE →", 11.84, 2.45, 28.4, -Math.PI / 2, 1.1);
    st("CREW QUARTERS →", -11.84, 2.45, 37.2, Math.PI / 2, 1.1);

    // an interactable for the fuse box (flavour; ties the maintenance log together)
    QX.interact({
      pos: QX.V3(O.x - 4.6, 1.6, O.z + 50.2),
      radius: 0.6,
      label: "Pump 2 Fuse Box",
      verb: "Examine",
      priority: 1,
      onInteract: () =>
        QX.notify(
          QX.flag("c4_pumps")
            ? "Somebody has jammed a bent spoon across the blown fuse. It is holding. It should not be holding."
            : 'Blackened, blown, and bone dry for the first time in twenty-two years. A grease-pencil note on the lid: "NOBODY. — Maintenance."',
        ),
    });
  });

  // ------------------------------------------------------------------
  // Animation (only while inside the facility)
  // ------------------------------------------------------------------
