// play-inline-575 03 — math
// Lines 585-938 of readable/play-inline-575.pretty.js (statement-aligned).
  K.tent = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 150);
    const b = builder();
    const DS = { side: THREE.DoubleSide };
    const purple = tint(
        "qx_tent",
        0x4a1a4a,
        Object.assign({ roughness: 0.95 }, DS),
      ),
      gold = tint("qx_tent2", 0xa8842c, Object.assign({ roughness: 0.9 }, DS));
    const brass = tint("qx_zora_brass", 0x9a7a3a, {
        roughness: 0.35,
        metalness: 0.8,
      }),
      wood = mat("wood_planks", 0x5a3a20);
    const drape = tint("qx_zora_cloth", 0x5a1e4a, { roughness: 0.95 }),
      fringe = tint("qx_zora_fringe", 0xc8a040, { roughness: 0.8 });
    const wax = tint("qx_zora_wax", 0xe8e0c8, { roughness: 0.8 }),
      flame = tint("qx_zora_flame", 0xffb040, {
        emissive: 0xffa030,
        emissiveIntensity: 2.2,
      });
    const R = 1.85,
      H = 2.15,
      N = 12;
    // walls: 12 panels, alternating purple / gold, the front three left open (the opening is centred on +z)
    for (let i = 0; i < N; i++) {
      const a = ((i + 0.5) / N) * Math.PI * 2; // panel centre angle (0 = +z)
      if (Math.cos(a) > 0.72) continue; // the mouth
      const w = 2 * R * Math.sin(Math.PI / N) + 0.02;
      K.box(
        b,
        i % 2 ? gold : purple,
        w,
        H,
        0.03,
        Math.sin(a) * R,
        H / 2,
        Math.cos(a) * R,
        a,
      );
    }
    // flaps tied back either side of the mouth, with rope ties
    for (const s of [-1, 1]) {
      const a = s * 0.62;
      K.box(
        b,
        purple,
        0.75,
        H - 0.1,
        0.03,
        Math.sin(a) * (R + 0.28),
        (H - 0.1) / 2,
        Math.cos(a) * (R + 0.28) + 0.05,
        a + s * 0.9,
      );
      K.torus(
        b,
        gold,
        0.1,
        Math.sin(a) * (R + 0.3),
        1.05,
        Math.cos(a) * (R + 0.3) + 0.06,
        Math.PI / 2,
        0,
      );
    }
    // roof: purple cone + 6 gold gores, brass finial, pennant
    K.cone(b, purple, R + 0.12, 1.5, 0, H + 0.75, 0, N);
    K.cyl(b, brass, 0.03, 0.6, 0, H + 1.7, 0, 6);
    K.sphere(b, brass, 0.07, 0, H + 1.55, 0);
    K.box(b, gold, 0.02, 0.22, 0.42, 0, H + 1.86, 0.22);
    // scalloped valance round the eave (little gold tassels between purple scallops)
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      K.box(
        b,
        i % 2 ? gold : purple,
        0.5,
        0.2,
        0.02,
        Math.sin(a) * (R + 0.1),
        H - 0.02,
        Math.cos(a) * (R + 0.1),
        a,
      );
      if (i % 2)
        K.cone(
          b,
          fringe,
          0.035,
          0.14,
          Math.sin(a) * (R + 0.12),
          H - 0.2,
          Math.cos(a) * (R + 0.12),
          5,
        );
    }
    // centre pole and a hanging lantern
    K.cyl(b, brass, 0.09, 0.18, 0, 1.95, 0.25, 6);
    K.cyl(b, brass, 0.006, 1.2, 0, 2.64, 0.25, 4);
    // the draped table at the mouth (skirt + top + fringe)
    const TZ = 0.55;
    K.cyl(b, drape, 0.62, 0.7, 0, 0.35, TZ, 16);
    K.cyl(b, drape, 0.66, 0.05, 0, 0.72, TZ, 16);
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      K.box(
        b,
        fringe,
        0.02,
        0.1,
        0.02,
        Math.sin(a) * 0.665,
        0.65,
        TZ + Math.cos(a) * 0.665,
        a,
      );
    }
    K.cyl(b, brass, 0.1, 0.06, 0, 0.78, TZ - 0.05, 10); // crystal-ball stand
    for (const [cx, cz] of [
      [-0.42, TZ - 0.2],
      [0.44, TZ - 0.12],
    ]) {
      K.cyl(b, wax, 0.025, 0.16, cx, 0.83, cz, 6);
      K.cone(b, flame, 0.012, 0.04, cx, 0.935, cz, 5);
    }
    // the customer's stool and the teller's chair (high back)
    K.cyl(b, wood, 0.2, 0.05, 0, 0.45, TZ + 1.0, 10);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      K.cyl(
        b,
        wood,
        0.02,
        0.45,
        Math.sin(a) * 0.14,
        0.22,
        TZ + 1.0 + Math.cos(a) * 0.14,
        5,
      );
    }
    K.box(b, wood, 0.5, 0.05, 0.45, 0, 0.46, -1.0);
    K.box(b, drape, 0.5, 1.1, 0.05, 0, 1.0, -1.25);
    for (const sx of [-0.22, 0.22])
      K.box(b, wood, 0.04, 0.46, 0.04, sx, 0.23, -1.0);
    // easel sign out front, to the right of the mouth
    K.box(b, wood, 0.04, 1.7, 0.04, 1.75, 0.83, 2.25, 0, 0.18);
    K.box(b, wood, 0.04, 1.7, 0.04, 2.45, 0.83, 2.25, 0, 0.18);
    K.box(b, wood, 0.04, 1.6, 0.04, 2.1, 0.8, 2.0, 0, -0.3);
    K.box(b, wood, 0.8, 0.04, 0.06, 2.1, 0.62, 2.33, 0, 0.18);
    K.flush(b, g, false);
    // gold gores on the roof: six cone wedges a hair outside the purple cone, merged into one mesh
    const gores = [];
    for (let i = 0; i < 6; i++) {
      const cg = new THREE.ConeGeometry(
        R + 0.135,
        1.51,
        3,
        1,
        true,
        (i / 6) * Math.PI * 2,
        Math.PI / 6,
      );
      cg.translate(0, H + 0.755, 0);
      gores.push(cg);
    }
    const gm = new THREE.Mesh(G.util.mergeGeometries(gores), gold);
    g.add(gm);
    for (const cg of gores) cg.dispose();
    // crystal ball (own mesh: glassy + glowing)
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 18, 12),
      tint("qx_crystal", 0x9fe0ff, {
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: 0.8,
        emissive: 0x2a6a9a,
        emissiveIntensity: 1.0,
      }),
    );
    ball.position.set(0, 0.95, TZ - 0.05);
    g.add(ball);
    const bp = K.local(g, 0, TZ - 0.05);
    K.glow(bp.x, y + 0.97, bp.z, 0x70c0ff, 0.7);
    const lp = K.local(g, 0, 0.25);
    K.glow(lp.x, y + 1.9, lp.z, 0xffb050, 1.4);
    // painted cloth things: the all-seeing eye hanging, the rug, the tarot spread, the sign
    const paint = (w, h, fn) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      fn(c.getContext("2d"), w, h);
      const t = new THREE.CanvasTexture(c);
      if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const eye = paint(256, 320, (c, w, h) => {
      c.fillStyle = "#2a0e2a";
      c.fillRect(0, 0, w, h);
      c.strokeStyle = "#c8a040";
      c.lineWidth = 6;
      c.strokeRect(8, 8, w - 16, h - 16);
      c.fillStyle = "#c8a040";
      for (let i = 0; i < 40; i++) {
        const a = Math.random() * 6.28,
          r = 60 + Math.random() * 60;
        c.fillRect(w / 2 + Math.cos(a) * r, 150 + Math.sin(a) * r, 3, 3);
      }
      c.beginPath();
      c.moveTo(w / 2, 50);
      c.lineTo(w / 2 + 90, 210);
      c.lineTo(w / 2 - 90, 210);
      c.closePath();
      c.lineWidth = 5;
      c.stroke();
      c.beginPath();
      c.ellipse(w / 2, 158, 42, 22, 0, 0, 7);
      c.fillStyle = "#e8dcc0";
      c.fill();
      c.stroke();
      c.beginPath();
      c.arc(w / 2, 158, 13, 0, 7);
      c.fillStyle = "#3aa890";
      c.fill();
      c.beginPath();
      c.arc(w / 2, 158, 6, 0, 7);
      c.fillStyle = "#101010";
      c.fill();
      c.fillStyle = "#c8a040";
      c.font = "bold 26px Georgia, serif";
      c.textAlign = "center";
      c.fillText("ZORA", w / 2, 270);
      for (let i = 0; i < 12; i++) {
        c.beginPath();
        c.moveTo(20 + i * 20, h - 12);
        c.lineTo(30 + i * 20, h - 2);
        c.lineTo(40 + i * 20, h - 12);
        c.fill();
      }
    });
    const hang = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 1.25),
      new THREE.MeshStandardMaterial({
        map: eye,
        roughness: 0.95,
        side: THREE.DoubleSide,
      }),
    );
    hang.position.set(0, 1.25, -R + 0.08);
    g.add(hang);
    const rugT = paint(256, 256, (c, w) => {
      c.fillStyle = "#5a1a20";
      c.beginPath();
      c.arc(w / 2, w / 2, w / 2 - 2, 0, 7);
      c.fill();
      for (const [r, col] of [
        [110, "#c8a040"],
        [96, "#2a3a6a"],
        [70, "#c8a040"],
        [60, "#5a1a20"],
        [30, "#c8a040"],
      ]) {
        c.beginPath();
        c.arc(w / 2, w / 2, r, 0, 7);
        c.lineWidth = 6;
        c.strokeStyle = col;
        c.stroke();
      }
      c.globalAlpha = 0.25;
      c.fillStyle = "#1a1410";
      for (let i = 0; i < 300; i++)
        c.fillRect(Math.random() * w, Math.random() * w, 4, 2);
    });
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshStandardMaterial({
        map: rugT,
        transparent: true,
        alphaTest: 0.2,
        roughness: 1,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.015, -0.1);
    g.add(rug);
    const cards = paint(256, 64, (c) => {
      const names = ["THE TOWER", "THE STAR", "DEATH", "STRANGER", "THE SUN"];
      names.forEach((n, i) => {
        const x0 = i * 51 + 2;
        c.fillStyle = "#e8dcc0";
        c.fillRect(x0, 2, 47, 60);
        c.strokeStyle = "#8a6a2a";
        c.lineWidth = 2;
        c.strokeRect(x0 + 3, 5, 41, 54);
        c.fillStyle = ["#8a2a20", "#2a4a8a", "#1a1a1a", "#2a6a4a", "#c8901a"][
          i
        ];
        c.beginPath();
        c.arc(x0 + 23.5, 26, 11, 0, 7);
        c.fill();
        c.fillStyle = "#2a1a10";
        c.font = "bold 7px sans-serif";
        c.textAlign = "center";
        c.fillText(n, x0 + 23.5, 52);
      });
    });
    const cardMat = new THREE.MeshStandardMaterial({
      map: cards,
      roughness: 0.8,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.PlaneGeometry(0.09, 0.13);
      const uv = geo.attributes.uv;
      for (let v = 0; v < uv.count; v++) uv.setX(v, (i + uv.getX(v)) / 5);
      const m = new THREE.Mesh(geo, cardMat);
      m.rotation.set(-Math.PI / 2, 0, (i - 2) * 0.18);
      m.position.set((i - 2) * 0.11, 0.749, TZ + 0.3 - Math.abs(i - 2) * 0.03);
      g.add(m);
    }
    const sg = K.sign(
      "MADAME ZORA\nSEES ALL · TELLS SOME\nREADINGS 10 SCRIP",
      "wood",
      0.9,
      0.62,
      { fg: "#e8c870", bg: "#3a1030" },
    );
    sg.position.set(2.1, 1.15, 2.37);
    sg.rotation.x = -0.18;
    g.add(sg);
    // colliders: the walls (not the mouth), the table, the easel
    for (let i = 0; i < N; i++) {
      const a = ((i + 0.5) / N) * Math.PI * 2;
      if (Math.cos(a) > 0.72) continue;
      const p = K.local(g, Math.sin(a) * R, Math.cos(a) * R);
      K.collider(p.x, p.z, 1.0, 0.2, y, y + H, yaw + a, "wood");
    }
    const tp = K.local(g, 0, TZ);
    K.collider(tp.x, tp.z, 1.2, 1.2, y, y + 0.8, yaw, "wood");
    const ep = K.local(g, 2.1, 2.2);
    K.collider(ep.x, ep.z, 0.9, 0.5, y, y + 1.6, yaw, "wood");
    return {
      group: g,
      seat: K.local(g, 0, -0.42),
      front: K.local(g, 0, TZ + 1.6),
    };
  };

  /** Newsstand: sandwich board + bundles of papers. */
