// play-inline-305 05 — math
// Lines 541-885 of readable/play-inline-305.pretty.js (statement-aligned).
  function rotunda(S) {
    const b = S.b;
    const N = 40,
      seg = TAU / N,
      chord = 2 * RR * Math.sin(seg / 2) + 0.12;
    for (let i = 0; i < N; i++) {
      const a = i * seg;
      let op = null;
      for (const o of OPENINGS) {
        const ha = Math.asin(o.w / 2 / RR);
        if (Math.abs(wrap(a - o.a)) < ha + seg * 0.25) op = o;
      }
      const [cx, cz] = atR(a, RR + 0.22);
      const yb = op ? op.h : 0;
      if (yb < 4.2)
        b.boxC("black_marble", cx, yb, cz, chord, 4.2 - yb, 0.44, {
          ry: a,
          seg: false,
        });
      b.boxC(
        "plaster_cream",
        cx,
        Math.max(4.2, yb),
        cz,
        chord,
        RH - Math.max(4.2, yb),
        0.44,
        { ry: a, seg: false },
      );
      S.colR(cx, cz, chord, 0.44, yb, RH, a, { walkable: false });
      // bronze dado band + skirting
      if (!op) {
        const [bx, bz] = atR(a, RR - 0.02);
        b.boxC("brass", bx, 4.15, bz, chord, 0.14, 0.06, {
          ry: a,
          seg: false,
          noAO: true,
        });
        b.boxC("brass", bx, 0, bz, chord, 0.16, 0.05, {
          ry: a,
          seg: false,
          noAO: true,
        });
      }
    }
    // opening frames: bronze architraves on the real (segment-quantized) opening edges
    for (const o of OPENINGS) {
      let edge = 0;
      for (let i = 0; i < N; i++) {
        const a = i * seg,
          d = Math.abs(wrap(a - o.a));
        if (d < Math.asin(o.w / 2 / RR) + seg * 0.25)
          edge = Math.max(edge, d + seg / 2);
      }
      for (const s of [-1, 1]) {
        const ea = o.a + s * edge;
        const [px, pz] = atR(ea, RR + 0.05);
        b.boxC("brass", px, 0, pz, 0.3, o.h + 0.25, 0.62, {
          ry: ea,
          seg: false,
        });
      }
      const hw = RR * Math.sin(edge);
      const [cx, cz] = atR(o.a, RR * Math.cos(edge) - 0.05);
      b.boxC("brass", cx, o.h, cz, hw * 2 + 0.3, 0.32, 0.4, {
        ry: o.a,
        seg: false,
      });
    }
    // bronze torcheres between the openings (warm fill on the lower walls)
    for (const a of [PI / 4, -PI / 4, (3 * PI) / 4, (-3 * PI) / 4]) {
      const [px, pz] = atR(a, RR - 0.9);
      b.cyl("brass", px, 0, pz, 0.18, 0.26, 0.12, 10);
      b.cyl("brass", px, 0.1, pz, 0.04, 0.05, 2.1, 6);
      b.cyl("brass", px, 2.2, pz, 0.42, 0.12, 0.3, 12, { open: true });
      b.cyl("lamp", px, 2.35, pz, 0.36, 0.36, 0.05, 12);
      S.light(px, 2.9, pz, 0xffd8a0, 8.5, 0.9);
      S.glow(px, 2.5, pz, 0xffd8a0, 1.0);
    }
    // cornice ring + cove lamp strip
    b.torus("brass", RC.x, RH - 0.05, RC.z, RR - 0.08, 0.12, TAU, {
      rx: HP,
      ts: 64,
      rs: 5,
    });
    b.torus("lamp_cool", RC.x, RH - 0.3, RC.z, RR - 0.28, 0.05, TAU, {
      rx: HP,
      ts: 64,
      rs: 4,
    });
    // the black glass dome
    const dome = new THREE.SphereGeometry(RR + 0.3, 40, 10, 0, TAU, 0, HP);
    b.inside("black_glass", dome, P.m4(RC.x, RH, RC.z, 0, 0, 0, 1, 0.42, 1), {
      noAO: true,
      grime: 0.05,
    });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      let prev = null;
      for (let k = 0; k <= 8; k++) {
        const t = (k / 8) * HP * 0.98,
          rr = (RR + 0.15) * Math.cos(t),
          yy = RH + (RR + 0.15) * 0.42 * Math.sin(t);
        const p = [RC.x + Math.sin(a) * rr, yy, RC.z + Math.cos(a) * rr];
        if (prev) b.rod("brass", prev, p, 0.05, 4, { noAO: true });
        prev = p;
      }
    }
    b.cyl("lamp_cool", RC.x, RH + RR * 0.42 - 0.12, RC.z, 1.1, 1.1, 0.1, 20, {
      noAO: true,
    });
    b.torus("brass", RC.x, RH + RR * 0.42 - 0.12, RC.z, 1.15, 0.08, TAU, {
      rx: HP,
      ts: 24,
      rs: 4,
    });
    // baked lights: cove ring, oculus, well
    for (let i = 0; i < 8; i++) {
      const [lx, lz] = atR((i / 8) * TAU + 0.2, RR - 1.2);
      S.light(lx, RH - 0.6, lz, 0xe8e4d8, 10, 0.7);
    }
    S.light(RC.x, RH + 3.5, RC.z, 0xdce8ff, 14, 0.8);
    S.glow(RC.x, RH + RR * 0.42 - 0.3, RC.z, 0xdce8ff, 2.4);
    // ---- floor: compass rose ring + the well ----
    const ring = new THREE.RingGeometry(WELL, RR + 0.3, 64, 2).rotateX(-HP);
    b.geo(P.compassMat(), ring, P.m4(RC.x, 0.012, RC.z), {
      uv: "keep",
      noAO: true,
      grime: 0.1,
    });
    // floor colliders (leave a square hole inscribed in the well)
    const hh = 2.3;
    S.col(
      RC.x - RR - 0.5,
      -0.3,
      RC.z - RR - 0.5,
      RC.x + RR + 0.5,
      0,
      RC.z - hh,
    );
    S.col(
      RC.x - RR - 0.5,
      -0.3,
      RC.z + hh,
      RC.x + RR + 0.5,
      0,
      RC.z + RR + 0.5,
    );
    S.col(RC.x - RR - 0.5, -0.3, RC.z - hh, RC.x - hh, 0, RC.z + hh);
    S.col(RC.x + hh, -0.3, RC.z - hh, RC.x + RR + 0.5, 0, RC.z + hh);
    // radiating distance lines (bronze strips) toward the eight cities
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + PI / 8;
      const [x0, z0] = atR(a, WELL + 0.4),
        [x1, z1] = atR(a, RR - 0.3);
      b.rod("brass", [x0, 0.02, z0], [x1, 0.02, z1], 0.035, 4, {
        square: true,
        r2: 0.005,
        noAO: true,
      });
    }
    // the well (lit from below)
    b.inside(
      "marble_cream",
      new THREE.CylinderGeometry(WELL, WELL, 1.9, 40, 1, true),
      P.m4(RC.x, -0.95, RC.z),
      { noAO: true },
    );
    b.cyl("black_marble", RC.x, -2.0, RC.z, WELL, WELL, 0.1, 40, {
      noAO: true,
    });
    b.torus("well_glow", RC.x, -1.8, RC.z, WELL - 0.3, 0.07, TAU, {
      rx: HP,
      ts: 48,
      rs: 4,
    });
    b.torus("brass", RC.x, 0.02, RC.z, WELL + 0.05, 0.08, TAU, {
      rx: HP,
      ts: 48,
      rs: 4,
    });
    for (let i = 0; i < 4; i++) {
      const [lx, lz] = atR((i / 4) * TAU + PI / 4, 2.2);
      S.light(lx, -1.4, lz, 0x9ad0ff, 6.5, 1.25);
      S.glow(lx, -1.5, lz, 0x9ad0ff, 1.3);
    }
    // bronze railing around the well
    const RL = WELL + 0.2;
    b.torus("brass", RC.x, 1.0, RC.z, RL, 0.045, TAU, {
      rx: HP,
      ts: 56,
      rs: 5,
    });
    b.torus("brass", RC.x, 0.55, RC.z, RL, 0.025, TAU, {
      rx: HP,
      ts: 56,
      rs: 4,
    });
    for (let i = 0; i < 24; i++) {
      const [px, pz] = atR((i / 24) * TAU, RL);
      b.cyl("brass", px, 0, pz, 0.03, 0.04, 1.0, 5, { noAO: true });
    }
    for (let i = 0; i < 14; i++) {
      const a0 = (i / 14) * TAU,
        a1 = ((i + 1) / 14) * TAU;
      const [x0, z0] = atR(a0, RL),
        [x1, z1] = atR(a1, RL);
      S.colR(
        (x0 + x1) / 2,
        (z0 + z1) / 2,
        Math.hypot(x1 - x0, z1 - z0) + 0.05,
        0.15,
        0,
        1.1,
        -Math.atan2(z1 - z0, x1 - x0),
        { walkable: false },
      );
    }
    // ---- the GLOBE (separate mesh — it turns) ----
    const pivot = new THREE.Group();
    pivot.position.copy(S.W(RC.x, 0.35, RC.z));
    pivot.rotation.z = (23.4 / 180) * PI;
    const gmat = new THREE.MeshStandardMaterial({
      map: P.globeTex ? P.globeTex() : null,
      roughness: 0.5,
      metalness: 0.05,
      emissive: new THREE.Color(0x2a3634),
      emissiveIntensity: 0.9,
    });
    try {
      gmat.emissiveMap = gmat.map;
    } catch (e) {
      /* */
    }
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1.85, 64, 40), gmat);
    globe.name = "dn_globe";
    pivot.add(globe);
    const brassM = new THREE.MeshStandardMaterial({
      color: 0xb08840,
      metalness: 0.8,
      roughness: 0.35,
      emissive: 0x2a1a08,
      emissiveIntensity: 0.6,
    });
    const meridian = new THREE.Mesh(
      new THREE.TorusGeometry(2.02, 0.05, 6, 64, PI * 1.25),
      brassM,
    );
    meridian.rotation.z = -PI * 0.125 + HP;
    meridian.rotation.y = HP * 0.0;
    pivot.add(meridian);
    const axis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 4.3, 6),
      brassM,
    );
    pivot.add(axis);
    DN.globe = globe;
    DN.globePivot = pivot;
    S._extra = S._extra || [];
    S._extra.push(pivot);
    // globe stand (static)
    b.cyl("brass", RC.x, -2.0, RC.z, 0.5, 0.8, 0.3, 16);
    b.cyl("brass", RC.x, -1.7, RC.z, 0.12, 0.2, 0.6, 10);
    // ---- weather instruments on the wall ----
    const dialK = P.texMat("dn_dials", P.dialTex(), { rough: 0.5, vc: true });
    const dialAng = [
      PI / 4 - 0.16,
      PI / 4 + 0.16,
      -PI / 4 - 0.16,
      -PI / 4 + 0.16,
      (3 * PI) / 4 - 0.16,
      (3 * PI) / 4 + 0.16,
      (-3 * PI) / 4 - 0.16,
      (-3 * PI) / 4 + 0.16,
    ];
    const order = [0, 1, 2, 3, 4, 5, 6, 7];
    dialAng.forEach((a, i) => {
      const [px, pz] = atR(a, RR - 0.06);
      b.quad(dialK, px, 5.9, pz, 1.25, 1.25, {
        ry: a + PI,
        uvRect: P.dialRect(order[i]),
      });
      const [fx, fz] = atR(a, RR - 0.02);
      b.torus("brass", fx, 5.9, fz, 0.66, 0.05, TAU, {
        ry: a + PI,
        ts: 24,
        rs: 4,
      });
      const [lx, lz] = atR(a, RR - 1.2);
      S.light(lx, 5.2, lz, 0xffe8c0, 3.4, 0.4);
    });
    // thermometer columns (glass tube, red spirit) between the dial pairs
    for (const a of [(3 * PI) / 4, (-3 * PI) / 4]) {
      const [px, pz] = atR(a, RR - 0.18);
      b.boxC("brass", px, 1.0, pz, 0.34, 3.4, 0.08, { ry: a, seg: false });
      b.cyl(
        "glass",
        px - Math.sin(a) * 0.05,
        1.2,
        pz - Math.cos(a) * 0.05,
        0.05,
        0.05,
        3.0,
        8,
        { noAO: true },
      );
      b.cyl(
        "lamp_red",
        px - Math.sin(a) * 0.05,
        1.2,
        pz - Math.cos(a) * 0.05,
        0.03,
        0.03,
        a > 0 ? 1.7 : 2.3,
        6,
        { noAO: true },
      );
      b.sphere(
        "lamp_red",
        px - Math.sin(a) * 0.05,
        1.18,
        pz - Math.cos(a) * 0.05,
        0.09,
        { ws: 6, hs: 5 },
      );
    }
    // weather map panel + "WEATHER" lettering above the north arch
    const wmap = P.texMat(
      "dn_wmap",
      P.signTex(
        "dn_wmap",
        ["TODAY'S WEATHER", "MAR 5 1967: GREY, FLURRIES, THEN ASH"],
        "label",
        768,
        256,
        {},
      ),
      { rough: 0.8 },
    );
    {
      const [px, pz] = atR(PI, RR - 0.1);
      b.quad(wmap, px, 7.35, pz, 4.0, 1.3, { ry: 0 });
    }
  }

