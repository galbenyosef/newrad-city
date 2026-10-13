// play-inline-207 03 — tz0
// Lines 115-874 of readable/play-inline-207.pretty.js (statement-aligned).
  function buildExterior(site, root) {
    const b = PF.batch("fraunces_ext");
    b.ground = 0;
    b.aoH = 3.5;
    const r = PF.rng("fraunces");
    const anchors = {};
    // sidewalks (brick pavers) and courtyard ground
    b.boxMM("brick_brown", site.x0, -0.1, site.z0, site.x1, 0.07, TZ0 + 0.4, {
      grime: 0.5,
      segLen: 5,
    });
    b.boxMM("cobble", site.x0, -0.1, TZ1, site.x1, 0.05, site.z1, {
      grime: 0.55,
      segLen: 5,
    });
    b.boxMM("brick_brown", TX1, -0.1, TZ0, site.x1, 0.07, TZ1, { grime: 0.5 });

    // ---------------- the tavern ----------------
    const poly = [
      [TX0, TZ0],
      [TX1, TZ0],
      [TX1, TZ1],
      [TX0, TZ1],
    ];
    b.boxMM(
      "granite_dark",
      TX0 - 0.2,
      0,
      TZ0 - 0.2,
      TX1 + 0.2,
      0.7,
      TZ1 + 0.2,
      { grime: 0.6 },
    );
    K.prismBands(b, "brick_fed", poly, 0.7, EAVE, 3.6, { grime: 0.45 });
    PF.colMM(TX0 - 0.25, 0, TZ0 - 0.25, TX1 + 0.25, EAVE, TZ1 + 0.25, {
      walkable: false,
    });
    // belt courses (white stone) between floors
    for (const y of [4.2, 8.1])
      b.boxMM(
        "limestone",
        TX0 - 0.06,
        y,
        TZ0 - 0.06,
        TX1 + 0.06,
        y + 0.22,
        TZ1 + 0.06,
        { seg: false, grime: 0.4 },
      );
    // dentil cornice
    b.boxMM(
      "white_paint",
      TX0 - 0.45,
      EAVE - 0.5,
      TZ0 - 0.45,
      TX1 + 0.45,
      EAVE,
      TZ1 + 0.45,
      { seg: false, grime: 0.45 },
    );
    b.boxMM(
      "white_paint",
      TX0 - 0.6,
      EAVE,
      TZ0 - 0.6,
      TX1 + 0.6,
      EAVE + 0.2,
      TZ1 + 0.6,
      { seg: false, grime: 0.45 },
    );
    for (const [a0, a1, fixed, axis, out] of [
      [TX0, TX1, TZ0 - 0.46, "x", -1],
      [TX0, TX1, TZ1 + 0.46, "x", 1],
      [TZ0, TZ1, TX1 + 0.46, "z", 1],
      [TZ0, TZ1, TX0 - 0.46, "z", -1],
    ]) {
      for (let a = a0 + 0.2; a < a1; a += 0.34)
        b.box(
          "white_paint",
          axis === "x" ? a : fixed,
          EAVE - 0.72,
          axis === "x" ? fixed : a,
          0.14,
          0.2,
          0.14,
          { seg: false },
        );
      void out;
    }
    // hipped roof (slate) — a frustum from the eave rectangle to a short ridge
    {
      const ex0 = TX0 - 0.55,
        ex1 = TX1 + 0.55,
        ez0 = TZ0 - 0.55,
        ez1 = TZ1 + 0.55,
        cz = (ez0 + ez1) / 2;
      const inset = (ez1 - ez0) / 2 - 0.3;
      const g = new THREE.BufferGeometry();
      const y0 = EAVE + 0.2,
        y1 = RIDGE;
      const v = [
        ex0,
        y0,
        ez0,
        ex1,
        y0,
        ez0,
        ex1 - inset,
        y1,
        cz,
        ex0 + inset,
        y1,
        cz, // north face
        ex1,
        y0,
        ez1,
        ex0,
        y0,
        ez1,
        ex0 + inset,
        y1,
        cz,
        ex1 - inset,
        y1,
        cz, // south face
        ex1,
        y0,
        ez0,
        ex1,
        y0,
        ez1,
        ex1 - inset,
        y1,
        cz,
        ex1 - inset,
        y1,
        cz, // east hip
        ex0,
        y0,
        ez1,
        ex0,
        y0,
        ez0,
        ex0 + inset,
        y1,
        cz,
        ex0 + inset,
        y1,
        cz, // west hip
      ];
      const idx = [];
      for (let f = 0; f < 4; f++) {
        const o = f * 4;
        idx.push(o, o + 2, o + 1, o, o + 3, o + 2);
      }
      g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      b.add("slate", g, { grime: 0.5 });
      // ridge cap
      b.boxMM(
        "iron",
        ex0 + inset - 0.1,
        y1 - 0.05,
        cz - 0.08,
        ex1 - inset + 0.1,
        y1 + 0.1,
        cz + 0.08,
        { seg: false },
      );
      // dormers: 3 north, 3 south, 2 east
      const dorm = (x, z, ry) => {
        const c = Math.cos(ry),
          s = Math.sin(ry);
        b.box(
          "white_paint",
          x - s * 0.7,
          EAVE + 0.2,
          z - c * 0.7,
          1.15,
          1.45,
          1.4,
          { ry, seg: false, grime: 0.4 },
        );
        K.pediment(
          b,
          "slate",
          x - s * 0.7,
          EAVE + 1.65,
          z - c * 0.7,
          1.35,
          0.6,
          1.45,
          ry,
          {},
        );
        b.quad(
          "glass_dark",
          x + s * 0.02,
          EAVE + 0.95,
          z + c * 0.02,
          0.7,
          0.9,
          { ry, noAO: true },
        );
        for (const yy of [0.75, 1.05])
          b.box(
            "white_paint",
            x + s * 0.04,
            EAVE + yy + 0.2,
            z + c * 0.04,
            0.7,
            0.03,
            0.03,
            { ry, seg: false },
          );
      };
      for (const x of [95.5, 100, 104.5]) {
        dorm(x, TZ0 + 0.2, PI);
        dorm(x, TZ1 - 0.2, 0);
      }
      for (const z of [862.5, 867.5]) dorm(TX1 - 0.2, z, HP);
      // chimneys
      for (const [x, z] of [
        [TX0 + 1.0, TZ0 + 3.5],
        [TX0 + 1.0, TZ1 - 3.5],
        [TX1 - 1.2, TZ1 - 1.2],
      ]) {
        b.box("brick_fed", x, EAVE - 1, z, 1.3, RIDGE - EAVE + 2.6, 0.9, {
          seg: false,
          grime: 0.6,
        });
        b.box("limestone", x, RIDGE + 1.6, z, 1.45, 0.18, 1.05, { seg: false });
        for (const dx of [-0.3, 0.3])
          b.cyl("rust", x + dx, RIDGE + 1.78, z, 0.12, 0.14, 0.4, 6, {
            hSeg: 1,
          });
      }
      PF.smokeAt = V3(TX0 + 1.0, RIDGE + 2.2, TZ0 + 3.5);
    }
    // windows: north (Broad St) 5 bays, east (Pearl St) 4 bays, 3 floors
    const floorsY = [1.3, 5.1, 8.9];
    for (let f = 0; f < 3; f++) {
      for (const x of [94.2, 97.1, 100, 102.9, 105.8]) {
        if (f === 0 && Math.abs(x - 100) < 0.5) continue; // door bay
        sash(b, x, floorsY[f], TZ0 - 0.02, PI, 1.1, f === 2 ? 1.7 : 2.1, {
          shutters: f === 0,
          shutOpen: true,
          lit: f === 0 || (f === 1 && x > 101),
          broken: f === 2 && x < 95,
        });
      }
      for (const z of [860.5, 863.8, 867.1, 870.4])
        sash(b, TX1 + 0.02, floorsY[f], z, HP, 1.1, f === 2 ? 1.7 : 2.1, {
          shutters: f === 0,
          lit: f === 0 && z < 866,
        });
      for (const x of [95, 99.5, 104.5])
        sash(b, x, floorsY[f], TZ1 + 0.02, 0, 1.1, 1.9, { broken: r() < 0.4 });
    }
    // the doorcase: fluted pilasters, fanlight, pediment, stone steps
    {
      const dx = 100,
        dz = TZ0 - 0.02;
      b.box("oak", dx, 0.7, dz - 0.02, 1.4, 2.5, 0.12, {
        seg: false,
        grime: 0.4,
        c: 0x6a3a22,
      });
      for (const sg of [-1, 1]) {
        b.box("white_paint", dx + sg * 0.95, 0.7, dz - 0.1, 0.32, 2.9, 0.2, {
          seg: false,
          grime: 0.3,
        });
        for (let k = 0; k < 3; k++)
          b.box(
            "limestone",
            dx + sg * 0.95 + (k - 1) * 0.08,
            0.9,
            dz - 0.21,
            0.03,
            2.5,
            0.02,
            { seg: false },
          );
      }
      b.add(
        "lamp_warm",
        PF.shapeGeo(
          (() => {
            const sh = new THREE.Shape();
            sh.moveTo(-0.7, 0);
            sh.lineTo(0.7, 0);
            sh.absarc(0, 0, 0.7, 0, PI, false);
            return sh;
          })(),
          10,
        ),
        { m: PF.m4(dx, 3.2, dz - 0.03, PI), uv: "keep", noAO: true },
      );
      for (let k = 0; k < 7; k++) {
        const a = (k / 6) * PI;
        b.beam(
          "white_paint",
          V3(dx, 3.2, dz - 0.06),
          V3(dx + Math.cos(a) * 0.7, 3.2 + Math.sin(a) * 0.7, dz - 0.06),
          0.03,
          0.03,
          {},
        );
      }
      b.box("white_paint", dx, 3.95, dz - 0.15, 2.4, 0.2, 0.35, { seg: false });
      K.pediment(b, "white_paint", dx, 4.15, dz - 0.18, 2.6, 0.8, 0.35, PI, {});
      for (let k = 0; k < 3; k++) {
        b.box(
          "granite",
          dx,
          0,
          dz - 0.5 - k * 0.32,
          2.4,
          0.7 - k * 0.23,
          0.34,
          { seg: false, grime: 0.5 },
        );
        PF.col(dx, dz - 0.5 - k * 0.32, 2.4, 0.34, 0, 0.7 - k * 0.23, 0, {
          surface: "concrete",
        });
      }
      // lanterns
      for (const sg of [-1, 1]) {
        b.beam(
          "iron",
          V3(dx + sg * 1.45, 2.6, dz),
          V3(dx + sg * 1.45, 2.6, dz - 0.5),
          0.05,
          0.05,
          {},
        );
        b.cyl(
          "lamp_warm",
          dx + sg * 1.45,
          2.05,
          dz - 0.5,
          0.13,
          0.11,
          0.42,
          6,
          { hSeg: 1, noAO: true },
        );
        b.cyl("iron", dx + sg * 1.45, 2.47, dz - 0.5, 0.02, 0.17, 0.14, 6, {
          hSeg: 1,
        });
        PF.glow(V3(dx + sg * 1.45, 2.3, dz - 0.5), 0xffc070, 1.5, null, {
          intensity: 1.3,
          flicker: 0.25,
        });
      }
      anchors.door = PF.anchor(dx, 0, dz - 1.8, 0); // facing the street, away from the doorcase
    }
    // hanging sign on an iron bracket at the corner + the 13-star flag
    {
      const sx = TX1 + 0.05,
        sz = TZ0 + 1.2;
      b.beam("iron", V3(sx, 5.9, sz), V3(sx + 1.9, 5.9, sz), 0.07, 0.07, {});
      b.beam("iron", V3(sx, 5.2, sz), V3(sx + 1.2, 5.85, sz), 0.05, 0.05, {});
      const sk = PF.texMat(
        "ft_sign",
        PF.canvasTex(
          "pf_ft_sign",
          512,
          384,
          (ctx, w, h) => {
            ctx.fillStyle = "#1e3a2a";
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = "#c8a050";
            ctx.lineWidth = 10;
            ctx.strokeRect(12, 12, w - 24, h - 24);
            ctx.fillStyle = "#e8d8a8";
            ctx.textAlign = "center";
            ctx.font = "bold 64px Georgia, serif";
            ctx.fillText("FRAUNCES", w / 2, 120);
            ctx.fillText("TAVERN", w / 2, 200);
            ctx.font = "italic 40px Georgia, serif";
            ctx.fillStyle = "#c8a050";
            ctx.fillText("Est. 1762", w / 2, 270);
            ctx.font = "bold 26px Georgia";
            ctx.fillText("ALE · GROG · ROOMS · RUMOURS", w / 2, 330);
            for (let i = 0; i < 60; i++) {
              ctx.fillStyle = "rgba(20,14,8," + Math.random() * 0.3 + ")";
              ctx.beginPath();
              ctx.arc(
                Math.random() * w,
                Math.random() * h,
                2 + Math.random() * 14,
                0,
                TAU,
              );
              ctx.fill();
            }
          },
          { clamp: true },
        ),
        { rough: 0.8 },
      );
      b.box("oak", sx + 1.2, 4.35, sz, 1.5, 1.1, 0.08, { seg: false });
      b.quad(sk, sx + 1.2, 4.9, sz + 0.045, 1.4, 1.05, { ry: 0 });
      b.quad(sk, sx + 1.2, 4.9, sz - 0.045, 1.4, 1.05, { ry: PI });
      for (const dx of [0.65, 1.75])
        b.beam(
          "iron",
          V3(sx + dx, 5.9, sz),
          V3(sx + dx, 5.45, sz),
          0.02,
          0.02,
          {},
        );
      // flagpole from the north facade, 2nd floor
      const fx = 97.1,
        fz = TZ0 - 0.1;
      b.beam(
        "white_paint",
        V3(fx, 7.4, fz),
        V3(fx, 9.6, fz - 2.3),
        0.07,
        0.07,
        {},
      );
      const flagK = PF.texMat("ft_flag", PF.flagTex(0), {
        rough: 0.9,
        side: THREE.DoubleSide,
      });
      b.quad(flagK, fx + 0.9, 8.75, fz - 1.8, 1.8, 1.05, {
        ry: -HP * 0.2,
        rz: -0.25,
        grime: 0.3,
      });
    }
    // sidewalk dressing: chalkboard, barrels, hitching post, bench
    const chalk = PF.texMat(
      "ft_chalk",
      PF.signTex(
        "ft_chalk",
        ["TONIGHT:", "FIDDLE & GROG", "NO ROBOTS*", "*except George"],
        "engraved",
        256,
        320,
        { bg: "#1c201c", fg: "#e8e8e0" },
      ),
    );
    b.box("oak", 102.4, 0, TZ0 - 1.3, 0.7, 1.1, 0.05, { rx: -0.2, seg: false });
    b.quad(chalk, 102.4, 0.62, TZ0 - 1.35, 0.6, 0.78, { ry: PI, rx: 0.2 });
    PF.barrel(b, 95, 0, TZ0 - 1.0, {});
    PF.barrel(b, 95.7, 0, TZ0 - 1.3, {});
    PF.bench(b, 106, 0, TZ0 - 1.4, PI);
    anchors.guard = PF.anchor(98.2, 0, TZ0 - 2.2, PI);

    // ---------------- the rest of the block: four row buildings ----------------
    const rowB = [
      { x0: 56, x1: 65, h: 16, key: "brick_brown", trim: "limestone" },
      { x0: 65, x1: 73, h: 13, key: "brick_tan", trim: "white_paint" },
      { x0: 73, x1: 83, h: 18.5, key: "brick", trim: "limestone" },
      { x0: 83, x1: 89.5, h: 12.5, key: "brick_white", trim: "paint_teal" },
    ];
    for (const rb of rowB) {
      const p = [
        [rb.x0, TZ0],
        [rb.x1, TZ0],
        [rb.x1, TZ1],
        [rb.x0, TZ1],
      ];
      K.prismBands(b, rb.key, p, 0, rb.h, 4.5, { grime: 0.55 });
      PF.colMM(rb.x0, 0, TZ0 - 0.1, rb.x1, rb.h, TZ1, { walkable: false });
      b.boxMM(
        rb.trim,
        rb.x0 - 0.1,
        rb.h - 0.7,
        TZ0 - 0.55,
        rb.x1 + 0.1,
        rb.h,
        TZ0,
        { seg: false, grime: 0.5 },
      );
      for (let x = rb.x0 + 0.4; x < rb.x1; x += 0.8)
        b.box(rb.trim, x, rb.h - 1.0, TZ0 - 0.35, 0.18, 0.3, 0.3, {
          seg: false,
        });
      K.polyWindows(b, p, {
        y0: 5.0,
        floors: Math.floor((rb.h - 5.5) / 3.2),
        floorH: 3.2,
        w: 1.0,
        h: 1.9,
        spacing: 2.3,
        frameKey: rb.trim,
        sill: true,
        lintel: true,
        broken: 0.3,
        boarded: 0.12,
        seed: rb.x0,
        skipEdge: (i) => i !== 0 && i !== 2,
        margin: 1.0,
      });
      // shopfront: cast-iron piers, boarded display windows, awning ribs
      b.boxMM(
        "iron",
        rb.x0 + 0.2,
        0,
        TZ0 - 0.25,
        rb.x1 - 0.2,
        0.5,
        TZ0 - 0.05,
        { seg: false },
      );
      for (const x of [rb.x0 + 0.3, rb.x1 - 0.3])
        b.box("iron", x, 0, TZ0 - 0.2, 0.4, 4.0, 0.3, { seg: false });
      b.boxMM(
        "iron",
        rb.x0 + 0.2,
        3.8,
        TZ0 - 0.3,
        rb.x1 - 0.2,
        4.4,
        TZ0 - 0.05,
        { seg: false },
      );
      b.quad(
        r() < 0.5 ? "planks" : "glass_broken",
        (rb.x0 + rb.x1) / 2,
        2.2,
        TZ0 - 0.06,
        rb.x1 - rb.x0 - 1.2,
        3.1,
        { ry: PI, uv: "box", noAO: true },
      );
      for (let x = rb.x0 + 1; x < rb.x1 - 0.5; x += 1.4)
        b.beam(
          "rust",
          V3(x, 3.6, TZ0 - 0.1),
          V3(x, 3.1, TZ0 - 1.6),
          0.04,
          0.04,
          {},
        );
    }
    const shops = [
      ["FRAUNCES MARKET — COURTYARD →", "#1e3a2a", "#e8d8a8", 60.5],
      ["PEARL ST. CHANDLERY", "#3a1e1a", "#e0c8a0", 69],
      ["BROAD STREET SAVINGS", "#1c2230", "#c8c8b0", 78],
      ["HOT COFFEE 5¢", "#5a1a14", "#f0e0c0", 86.2],
    ];
    for (const [t, bg, fg, x] of shops) {
      const k = PF.texMat(
        "ft_shop_" + x,
        PF.signTex("ft_shop_" + x, [t], "enamel", 512, 96, { bg, fg }),
      );
      b.quad(k, x, 4.1, TZ0 - 0.33, 5.0, 0.55, { ry: PI });
    }
    // fire escapes on the tallest one
    for (let f = 0; f < 4; f++) {
      const y = 5.0 + f * 3.2 - 0.3;
      b.boxMM("iron", 74, y, TZ0 - 1.3, 82, y + 0.08, TZ0 - 0.05, {
        seg: false,
      });
      PF.railing(
        b,
        [
          [74, TZ0 - 1.3],
          [82, TZ0 - 1.3],
        ],
        y,
        0.9,
        "iron",
      );
      if (f < 3)
        b.beam(
          "iron",
          V3(75, y, TZ0 - 1.0),
          V3(77.5, y + 3.2, TZ0 - 1.0),
          0.5,
          0.06,
          {},
        );
    }

    // ---------------- alley + back courtyard (the settlement) ----------------
    // alley between the row and the tavern (x 89.5..92)
    b.boxMM("cobble", 89.5, 0, TZ0, 92, 0.06, TZ1, { grime: 0.6 });
    D.papers(b, 90.7, 0.06, 862, 1.0, 10, 88);
    PF.barrel(b, 90.2, 0, 866.5, {});
    const arrow = PF.texMat(
      "ft_alley",
      PF.signTex(
        "ft_alley",
        ["MARKET & WATER", "THROUGH HERE ↓"],
        "raider",
        512,
        192,
        { bg: "#d8d0b8", fg: "#1e3a2a" },
      ),
    );
    b.quad(arrow, 89.47, 2.6, 859.5, 1.4, 0.52, { ry: HP });
    // courtyard walls (brick) with a south gate onto the street
    const CZ0 = TZ1,
      CZ1 = site.z1 - 0.4;
    for (const [x0, z0, x1, z1] of [
      [site.x0 + 0.3, CZ1, 76, CZ1],
      [81, CZ1, site.x1 - 0.3, CZ1],
      [site.x0 + 0.3, CZ0, site.x0 + 0.3, CZ1],
      [site.x1 - 0.3, CZ0, site.x1 - 0.3, CZ1],
    ]) {
      const len = Math.hypot(x1 - x0, z1 - z0),
        ry = Math.atan2(-(z1 - z0), x1 - x0);
      b.box("brick_fed", (x0 + x1) / 2, 0, (z0 + z1) / 2, len, 2.6, 0.5, {
        ry,
        seg: false,
        grime: 0.6,
      });
      b.box(
        "limestone",
        (x0 + x1) / 2,
        2.6,
        (z0 + z1) / 2,
        len + 0.1,
        0.15,
        0.62,
        { ry, seg: false },
      );
      PF.colWall(x0, z0, x1, z1, 0.5, 0, 2.8, { walkable: false });
    }
    // scrap-metal gate leaves
    PF.scrapWall(b, 76, CZ1 - 0.1, 77.2, CZ1 - 1.2, 2.3, {
      noCollide: true,
      noClutter: true,
      seed: 5,
    });
    // stalls, purifier, still, tables, string lights, coop, laundry
    D.stall(b, 62, 877.5, PI, 3.4, 2.2, {
      goods: "bottles",
      sign: "GROG & WATER",
      seed: 1,
    });
    D.stall(b, 70, 877.5, PI, 3.4, 2.2, {
      goods: "junk",
      sign: "SCRAP & SUNDRIES",
      seed: 2,
    });
    D.stall(b, 104.5, 882, -HP, 3.0, 2.2, {
      goods: "cans",
      sign: "NAN'S PANTRY",
      seed: 3,
    });
    // water purifier: big tank + pipes + pump
    b.cyl("rust", 60, 0, 885, 1.3, 1.3, 3.2, 12, { hSeg: 2 });
    b.cyl("rust", 60, 3.2, 885, 0.1, 1.35, 0.6, 12, { hSeg: 1 });
    b.beam("iron", V3(61.2, 2.5, 885), V3(64, 2.5, 885), 0.14, 0.14);
    b.beam("iron", V3(64, 2.5, 885), V3(64, 0, 885), 0.14, 0.14);
    b.box("panel", 64.8, 0, 885, 1.2, 1.4, 1.0, { seg: false });
    b.sphere("lamp_green", 64.8, 1.5, 885.2, 0.07, { ws: 5, hs: 4 });
    PF.col(60, 885, 2.6, 2.6, 0, 3.8, 0, { walkable: false });
    PF.col(64.8, 885, 1.2, 1.0, 0, 1.4, 0, { walkable: false });
    // copper still
    b.cyl("copper", 86, 0, 885.5, 0.8, 0.9, 1.4, 12, { hSeg: 1 });
    b.sphere("copper", 86, 1.5, 885.5, 0.75, { ws: 10, hs: 6, phiLen: PI / 2 });
    b.rod("copper", V3(86, 2.1, 885.5), V3(87.6, 1.6, 885.5), 0.08, 6);
    b.cyl("rotten", 88, 0, 885.5, 0.45, 0.45, 1.1, 10, { hSeg: 1 });
    b.box("fire", 86, 0.05, 884.7, 0.6, 0.25, 0.1, { seg: false });
    PF.col(86.8, 885.5, 3, 1.8, 0, 1.8, 0, { walkable: false });
    // picnic tables & benches
    for (const [x, z] of [
      [76, 879],
      [83, 879.5],
      [95, 880],
      [91, 884.5],
    ]) {
      b.box("rotten", x, 0.72, z, 2.2, 0.07, 0.9, { seg: false, grime: 0.5 });
      for (const sg of [-1, 1]) {
        b.box("rotten", x, 0.42, z + sg * 0.75, 2.2, 0.06, 0.3, { seg: false });
        b.box("iron", x + sg * 0.9, 0, z, 0.06, 0.72, 1.6, { seg: false });
      }
      PF.col(x, z, 2.2, 1.8, 0, 0.75, 0, { walkable: false });
      if (r() < 0.7)
        b.cyl(
          "chrome",
          x + (r() - 0.5),
          0.79,
          z + (r() - 0.5) * 0.4,
          0.05,
          0.05,
          0.14,
          6,
          { hSeg: 1 },
        );
    }
    D.stringLights(
      b,
      V3(site.x0 + 1, 3.2, 874),
      V3(88, 3.4, 887),
      0.6,
      18,
      0xffd090,
    );
    D.stringLights(
      b,
      V3(TX0, 4.2, TZ1 + 0.3),
      V3(66, 3.4, 887.5),
      0.7,
      16,
      0xffd090,
    );
    PF.barrel(b, 80, 0, 883, { fire: true });
    // chicken coop & laundry
    b.boxMM("rotten", 97.5, 0, 884.5, 100.5, 1.4, 887.5, {
      seg: false,
      grime: 0.7,
    });
    b.box("corrugated", 99, 1.4, 886, 3.4, 0.08, 3.4, { rz: 0.15, seg: false });
    PF.colMM(97.5, 0, 884.5, 100.5, 1.4, 887.5, { walkable: false });
    for (let i = 0; i < 6; i++)
      b.box(
        r() < 0.5 ? "linen" : "fabric",
        72 + i * 1.1,
        1.9,
        886.8,
        0.8,
        0.9,
        0.03,
        { seg: false, c: [0xd8d0c0, 0x8a6a4a, 0x6a7a9a][i % 3] },
      );
    b.beam("rope", V3(70.5, 2.5, 886.8), V3(79, 2.5, 886.8), 0.02, 0.02);
    // cellar bulkhead doors against the tavern's back wall (the smugglers' tunnel exit)
    b.box("oak", 99, 0, TZ1 + 0.9, 1.8, 0.7, 1.6, {
      rx: -0.45,
      seg: false,
      grime: 0.6,
    });
    b.box("iron", 99, 0.45, TZ1 + 0.85, 0.08, 0.06, 1.5, {
      rx: -0.45,
      seg: false,
    });
    PF.col(99, TZ1 + 0.8, 1.9, 1.6, 0, 0.6, 0, { surface: "wood" });
    anchors.bulkhead = PF.anchor(99, 0, TZ1 + 2.6, PI);
    anchors.court = PF.anchor(83, 0, 881, 0);
    anchors.merchant2 = PF.anchor(62, 0, 879.4, 0);
    anchors.npc_court1 = PF.anchor(95, 0, 881.5, PI);
    anchors.guard2 = PF.anchor(78.5, 0, CZ1 - 1.2, 0);
    D.crates(b, 66, 0, 884.5, 3, 7, true);
    D.crates(b, 67.1, 0, 885.3, 2, 8, true);
    courtyardSettlement(b, site, anchors, CZ1);
    b.build(root);
    return anchors;
  }

  // ===================================================================
  // FRAUNCES MARKET — the settlement proper (a walled trading yard):
  // scrap gate arch, NE watchtower with stairs + searchlight, bunk shacks
  // against the row-house backs, potato / plum garden fed by the purifier,
  // a cook-fire with a roasting spit, the jobs board, a rooftop water tower.
  // Everything merges into the exterior batch (no new materials but 2 signs).
  // ===================================================================
