// play-inline-121 04 — math
// Lines 519-768 of readable/play-inline-121.pretty.js (statement-aligned).
  function bryant(rec) {
    const b = K.builder("bryant", { grime: 0.5 });
    const d = K.builder("bryant_detail", { grime: 0.5 });
    const glows = K.glowSet("bryant");
    const P = K.parts;
    const X0 = 50,
      X1 = 110,
      Z0 = -223,
      Z1 = -192;
    // ground: gravel walks, dead lawn
    b.boxMM("dirt", X0, -0.2, Z0, X1, 0.04, Z1, {
      faces: "t",
      tint: 0xb0a080,
      grime: 0.4,
    });
    b.boxMM("grass", 64, -0.2, -217.5, 100, 0.09, -197.5, {
      faces: "nsewt",
      grime: 0.5,
    });
    // raised stone border around the lawn
    for (const e of [
      [64, -217.5, 100, -217.5],
      [64, -197.5, 100, -197.5],
      [64, -217.5, 64, -197.5],
      [100, -217.5, 100, -197.5],
    ])
      b.beam("granite", e[0], 0.15, e[1], e[2], 0.15, e[3], 0.35, {
        d: 0.35,
        tint: 0x9a968c,
      });
    // balustrades (with gaps) along the long sides
    const balus = (x0, x1, z) => {
      b.boxMM("granite", x0, 0, z - 0.25, x1, 0.25, z + 0.25, {
        tint: 0xb0aca0,
      });
      b.boxMM("granite", x0, 0.75, z - 0.25, x1, 0.9, z + 0.25, {
        tint: 0xb0aca0,
      });
      for (let x = x0 + 0.25; x < x1; x += 0.5)
        b.cyl("granite", x, 0.25, z, 0.08, 0.1, 0.5, 6, { tint: 0xb0aca0 });
      K.colBox(x0, 0, z - 0.25, x1, 0.9, z + 0.25, { tag: "cover" });
    };
    balus(55, 78, -221);
    balus(86, 107, -221);
    balus(55, 78, -194);
    balus(86, 107, -194);
    // iron fence on the west end
    for (let z = Z0 + 1; z < Z1 - 1; z += 0.3) {
      if (Math.abs(z + 207.5) < 2.5) continue;
      d.beam("black_metal", X0 + 0.6, 0, z, X0 + 0.6, 1.3, z, 0.03);
    }
    d.beam("black_metal", X0 + 0.6, 1.2, Z0 + 1, X0 + 0.6, 1.2, Z1 - 1, 0.04);
    K.colBox(X0 + 0.4, 0, Z0 + 1, X0 + 0.8, 1.3, -210);
    K.colBox(X0 + 0.4, 0, -205, X0 + 0.8, 1.3, Z1 - 1);
    // dead plane trees in rows
    for (let x = 55; x <= 106; x += 5.2)
      for (const z of [-219.5, -195.5]) {
        if (x < 62 && z < -210) continue;
        P.deadTree(d, x, z, 9 + ((x * 7) % 3), {
          seed: Math.round(x * 13 + z),
          depth: 2,
        });
      }
    // Lowell fountain (west end)
    const fx = 57,
      fz = -207.5;
    b.cyl("granite", fx, 0, fz, 3.4, 3.4, 0.7, 20, {
      top: false,
      tint: 0x9a968c,
    });
    b.cyl("granite", fx, 0, fz, 3.1, 3.1, 0.3, 20, { tint: 0x4a4a40 });
    b.cyl("granite", fx, 0.3, fz, 0.6, 0.45, 1.6, 10, { tint: 0x9a968c });
    b.cyl("bronze", fx, 1.9, fz, 0.4, 1.6, 0.5, 14, { grime: 0.4 });
    b.cyl("bronze", fx, 2.4, fz, 0.2, 0.2, 0.7, 8, {});
    b.geo("bronze", K.T.sphereLo, { x: fx, y: 3.2, z: fz, s: 0.3 });
    for (let k = 0; k < 10; k++) {
      const a = (k * Math.PI) / 5,
        a2 = a + Math.PI / 5;
      K.colWall(
        fx + Math.cos(a) * 3.3,
        fz + Math.sin(a) * 3.3,
        fx + Math.cos(a2) * 3.3,
        fz + Math.sin(a2) * 3.3,
        0.35,
        0,
        0.7,
        [],
      );
    }
    // ruined carousel (south-west corner)
    const cx = 57,
      cz = -217.5;
    b.cyl("wood_rotten", cx, 0, cz, 3.8, 3.8, 0.45, 16, {});
    b.cyl("metal", cx, 0.45, cz, 0.35, 0.35, 3.6, 8, {});
    b.cyl("atlas_paint", cx, 4.0, cz, 4.2, 0.3, 1.3, 16, {
      tint: 0xffffff,
      grime: 0.2,
    });
    b.geo("atlas_paint", new THREE.ConeGeometry(4.2, 1.3, 16, 1), {
      x: cx,
      y: 4.65,
      z: cz,
      uv: "rect",
      rect: K.paint("carousel_top", 256, 256),
    });
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4,
        px = cx + Math.cos(a) * 3,
        pz = cz + Math.sin(a) * 3;
      d.beam("brass", px, 0.45, pz, px, 4.0, pz, 0.06);
      const hy = 1.1 + (k % 2) * 0.35;
      d.geo("paint_white", K.T.sphere, {
        x: px,
        y: hy,
        z: pz,
        ry: -a,
        sx: 0.22,
        sy: 0.25,
        sz: 0.55,
        tint: [0xe8dcc0, 0x8a5a3a, 0xc8c8c8][k % 3],
      });
      d.beam(
        "paint_white",
        px + Math.sin(-a) * 0,
        hy + 0.1,
        pz,
        px - Math.sin(a) * 0.45,
        hy + 0.55,
        pz + Math.cos(a) * 0.45,
        0.14,
        { tint: 0xe8dcc0 },
      );
      if (k % 3 === 0)
        d.geo("paint_white", K.T.sphere, {
          x: px,
          y: 0.6,
          z: pz + 0.4,
          ry: 1,
          rz: 1.4,
          sx: 0.22,
          sy: 0.25,
          sz: 0.55,
          tint: 0x8a5a3a,
        });
    }
    K.colBox(cx - 3.8, 0, cz - 3.8, cx + 3.8, 0.45, cz + 3.8, {
      surface: "wood",
    });
    K.colBox(cx - 0.4, 0, cz - 0.4, cx + 0.4, 4, cz + 0.4);
    // bistro chairs + tables scattered, kiosk, lamp posts, sign
    for (let k = 0; k < 22; k++) {
      const r = K.rng(700 + k);
      const x = 60 + r() * 45,
        z = r() < 0.5 ? -220 + r() * 2.5 : -196.5 + r() * 2.5;
      P.chair(d, x, 0, z, r() * 6, { mat: "paint_green", fallen: r() < 0.4 });
    }
    for (const t of [
      [68, -219.8],
      [92, -195.3],
      [98, -219.6],
    ])
      P.table(d, t[0], 0, t[1], 0.3, { mat: "paint_green", w: 0.7, d: 0.7 });
    b.box("corrugated", 104, 0, -207.5, 3.2, 2.6, 2.4, { grime: 0.7 });
    b.geo("paint_green", K.T.box, {
      x: 104,
      y: 2.8,
      z: -207.5,
      rx: 0.1,
      sx: 3.8,
      sy: 0.08,
      sz: 3.0,
    });
    K.colBox(102.4, 0, -208.7, 105.6, 2.6, -206.3);
    for (const lp of [
      [62, -221],
      [82, -221],
      [102, -221],
      [62, -194],
      [82, -194],
      [102, -194],
    ])
      P.lampPost(d, glows, lp[0], lp[1], 4.2, { broken: lp[0] === 82 });
    P.signBoard(
      d,
      "atlas_paint",
      K.paint("bp_sign", 512, 128),
      108.5,
      1.4,
      -207.5,
      3,
      0.75,
      Math.PI / 2,
      {},
    );
    d.beam("black_metal", 108.5, 0, -209, 108.5, 1.8, -209, 0.06);
    d.beam("black_metal", 108.5, 0, -206, 108.5, 1.8, -206, 0.06);
    // burrow-rat holes on the lawn
    const burrows = [
      [72, -212],
      [85, -203],
      [95, -214],
    ];
    for (const bw of burrows) {
      d.geo("dirt", K.T.sphere, {
        x: bw[0],
        y: -0.2,
        z: bw[1],
        sx: 1.6,
        sy: 0.7,
        sz: 1.3,
        grime: 0.3,
      });
      d.cyl("rubber", bw[0] + 0.3, 0.35, bw[1], 0.5, 0.5, 0.02, 10, {
        tint: 0x050505,
      });
      for (let k = 0; k < 5; k++) {
        const a = k * 1.3;
        d.geo("dirt", K.T.dodeca, {
          x: bw[0] + Math.cos(a) * 1.8,
          y: 0.05,
          z: bw[1] + Math.sin(a) * 1.5,
          s: 0.25 + (k % 2) * 0.15,
        });
      }
    }
    P.skeleton(d, 80, 0.09, -209, 1.1);
    P.car(d, 45, -215, 0.05, { seed: 91 });

    rec.anchor("entrance", 108, 0, -207.5, -Math.PI / 2);
    rec.anchor("fountain", fx + 4, 0, fz, -Math.PI / 2);
    rec.anchor("carousel", cx + 5, 0, cz, -Math.PI / 2);
    burrows.forEach((bw, i) =>
      rec.anchor("burrow" + (i + 1), bw[0], 0, bw[1], 0),
    );
    rec.anchor("spawn1", 75, 0, -205, 0);
    rec.anchor("spawn2", 90, 0, -209, 0);
    rec.anchor("spawn3", 70, 0, -195.8, Math.PI);
    rec.anchor("spawn4", 96, 0, -219.8, 0);
    rec.anchor("loot1", 104, 0, -205.8, 0);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 220 });
    glows.finish(rec.root, { dayOpacity: 0.3 });
  }

  K.defineSite("nypl", 60, function () {
    textures();
    nypl(K.record("nypl"));
    bryant(K.record("bryant_park"));
  });
