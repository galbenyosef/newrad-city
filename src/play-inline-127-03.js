// play-inline-127 03 — foy
// Lines 104-439 of readable/play-inline-127.pretty.js (statement-aligned).
  K.defineInterior("radio_city", function (ctx) {
    const { rec, b, d, glows, P, FOY, MEZ } = ctx;
    // ---- Grand Foyer ----
    b.tiledQuad(
      "atlas_paint",
      FOY.x0,
      FOY.z0,
      FOY.x1,
      FOY.z1,
      0.04,
      3.5,
      K.paint("rc_carpet", 256, 256),
      { grime: 0.4 },
    );
    for (const w of [
      [FOY.x0, FOY.z0, FOY.x1, FOY.z0 + 0.02, "s"],
      [FOY.x0, FOY.z1 - 0.02, FOY.x1, FOY.z1, "n"],
      [FOY.x0, FOY.z0, FOY.x0 + 0.02, FOY.z1, "e"],
    ])
      b.boxMM("marble_warm", w[0], 0, w[1], w[2], FOY.h, w[3], {
        faces: w[4],
        tint: 0xa06a4a,
        grime: 0.4,
      });
    b.boxMM("marble_warm", FOY.x1 - 0.02, 0, FOY.z0, FOY.x1, FOY.h, -343, {
      faces: "w",
      tint: 0xa06a4a,
    });
    b.boxMM("marble_warm", FOY.x1 - 0.02, 0, -336, FOY.x1, FOY.h, FOY.z1, {
      faces: "w",
      tint: 0xa06a4a,
    });
    b.boxMM("marble_warm", FOY.x1 - 0.02, 4.2, -343, FOY.x1, FOY.h, -336, {
      faces: "w",
      tint: 0xa06a4a,
    });
    b.boxMM("gold", FOY.x0, FOY.h - 0.1, FOY.z0, FOY.x1, FOY.h, FOY.z1, {
      faces: "b",
      tint: 0x8a6a3a,
      grime: 0.3,
    });
    for (let x = FOY.x0 + 2.5; x < FOY.x1; x += 3)
      b.box(
        "gold",
        x,
        FOY.h - 0.6,
        (FOY.z0 + FOY.z1) / 2,
        0.25,
        0.5,
        FOY.z1 - FOY.z0,
        { grime: 0.2 },
      );
    // mural on the west wall
    b.panel("atlas_paint", FOY.x0 + 0.05, 8.5, -342, 18, 9, Math.PI / 2, {
      rect: K.paint("rc_mural", 1024, 512),
    });
    // gold pilasters + mirrors
    for (let x = FOY.x0 + 3; x < FOY.x1 - 1; x += 4)
      for (const z of [FOY.z0 + 0.2, FOY.z1 - 0.2]) {
        if (z > -340 && x > 12 && x < 22) continue;
        b.box("gold", x, 0, z, 0.6, FOY.h - 1, 0.4, { grime: 0.3 });
        b.panel(
          "glass",
          x + 2,
          3.5,
          z + (z < -342 ? 0.21 : -0.21),
          2.4,
          4,
          z < -342 ? 0 : Math.PI,
        );
      }
    // mezzanine + balustrade + grand staircase
    d.boxMM("marble_warm", FOY.x0, MEZ.y - 0.5, MEZ.z0, FOY.x1, MEZ.y, MEZ.z1, {
      tint: 0x8a5a3a,
      faces: "nsewtb",
    });
    K.colBox(FOY.x0, MEZ.y - 0.5, MEZ.z0, 11, MEZ.y, MEZ.z1);
    K.colBox(17, MEZ.y - 0.5, MEZ.z0, FOY.x1, MEZ.y, MEZ.z1);
    K.colBox(11, MEZ.y - 0.5, MEZ.z0, 17, MEZ.y, MEZ.z1 - 0.1);
    d.tiledQuad(
      "atlas_paint",
      FOY.x0,
      MEZ.z0,
      FOY.x1,
      MEZ.z1,
      MEZ.y + 0.02,
      3.5,
      K.paint("rc_carpet", 256, 256),
      { grime: 0.4 },
    );
    for (const seg of [
      [FOY.x0, 11],
      [17, FOY.x1],
    ]) {
      d.boxMM(
        "brass",
        seg[0],
        MEZ.y + 1.0,
        MEZ.z1 - 0.1,
        seg[1],
        MEZ.y + 1.08,
        MEZ.z1 + 0.05,
        {},
      );
      for (let x = seg[0] + 0.2; x < seg[1]; x += 0.35)
        d.beam(
          "brass",
          x,
          MEZ.y,
          MEZ.z1 - 0.02,
          x,
          MEZ.y + 1.0,
          MEZ.z1 - 0.02,
          0.03,
        );
      K.colBox(
        seg[0],
        MEZ.y,
        MEZ.z1 - 0.15,
        seg[1],
        MEZ.y + 1.1,
        MEZ.z1 + 0.05,
        { walkable: false },
      );
    }
    d.stairs("marble_warm", 14, -341, 0, -1, 6, 8.5, 0, MEZ.y, 12, {
      solid: true,
      tint: 0x9a6040,
    });
    for (const sx of [11, 17]) {
      d.beam("brass", sx, 1.0, -341, sx, MEZ.y + 1.0, MEZ.z1, 0.06);
      K.colRot(sx, (-341 + MEZ.z1) / 2, 0.2, 8.5, 0, MEZ.y + 1.1, 0, {
        walkable: false,
      });
    }
    // chandeliers
    for (const c of [
      [9, -340],
      [21, -340],
    ]) {
      d.beam("brass", c[0], FOY.h, c[1], c[0], FOY.h - 2.2, c[1], 0.05);
      for (let k = 0; k < 3; k++) {
        const r = 1.6 - k * 0.45,
          y = FOY.h - 2.4 - k * 0.8;
        d.geo("brass", K.T.torus, {
          x: c[0],
          y,
          z: c[1],
          rx: Math.PI / 2,
          s: r,
        });
        for (let j = 0; j < 10 - k * 2; j++) {
          const a = (j / (10 - k * 2)) * Math.PI * 2;
          d.cyl(
            "lit_warm",
            c[0] + Math.cos(a) * r,
            y - 0.35,
            c[1] + Math.sin(a) * r,
            0.05,
            0.05,
            0.35,
            5,
            {},
          );
          glows.add(
            c[0] + Math.cos(a) * r,
            y - 0.1,
            c[1] + Math.sin(a) * r,
            0xffd8a0,
            "s",
          );
        }
      }
      glows.add(c[0], FOY.h - 3.5, c[1], 0xffd0a0, "xl");
    }

    // ---- DJ booth (raised platform against the south wall) ----
    const dx = 17,
      dz = -333;
    d.boxMM("wood_dark", 12.5, 0, -335.5, 21.5, 0.6, FOY.z1, { grime: 0.4 });
    K.colBox(12.5, 0, -335.5, 21.5, 0.6, FOY.z1, { surface: "wood" });
    d.stairs("wood_dark", dx, -337, 0, 1, 2.5, 1.5, 0, 0.6, 2, { solid: true });
    const dy = 0.6;
    // desk
    d.boxMM("wood", dx - 2.2, dy, dz - 1.6, dx + 2.2, dy + 0.9, dz - 0.9, {
      grime: 0.3,
    });
    d.boxMM(
      "wood_dark",
      dx - 2.3,
      dy + 0.9,
      dz - 1.7,
      dx + 2.3,
      dy + 0.95,
      dz - 0.8,
      {},
    );
    K.colBox(dx - 2.2, dy, dz - 1.6, dx + 2.2, dy + 0.95, dz - 0.9, {
      surface: "wood",
    });
    // turntables, mixer, mic on boom
    for (const tx of [dx - 1.4, dx + 1.4]) {
      d.box("black_metal", tx, dy + 0.95, dz - 1.25, 0.7, 0.12, 0.6, {});
      d.cyl("rubber", tx, dy + 1.07, dz - 1.25, 0.26, 0.26, 0.02, 16, {});
      d.cyl("paint_red", tx, dy + 1.09, dz - 1.25, 0.07, 0.07, 0.01, 8, {});
    }
    d.box("metal_dark", dx, dy + 0.95, dz - 1.25, 0.9, 0.1, 0.5, {});
    for (let k = 0; k < 6; k++)
      glows.add(
        dx - 0.35 + k * 0.14,
        dy + 1.08,
        dz - 1.1,
        [0x40ff60, 0xffd040, 0xff4040][k % 3],
        "s",
      );
    d.beam(
      "black_metal",
      dx + 0.6,
      dy + 0.95,
      dz - 1.6,
      dx + 0.6,
      dy + 1.8,
      dz - 1.6,
      0.03,
    );
    d.beam(
      "black_metal",
      dx + 0.6,
      dy + 1.8,
      dz - 1.6,
      dx,
      dy + 1.5,
      dz - 1.25,
      0.025,
    );
    d.geo("chrome", K.T.cyl8, {
      x: dx,
      y: dy + 1.45,
      z: dz - 1.2,
      sx: 0.06,
      sy: 0.16,
      sz: 0.06,
      rx: 0.5,
    });
    // amp racks, reel-to-reels, speakers
    for (const rx of [dx - 3.5, dx + 3.5]) {
      d.box("metal_dark", rx, dy, dz + 0.4, 1.1, 2.3, 0.7, { grime: 0.4 });
      for (let k = 0; k < 5; k++) {
        d.box(
          k % 2 ? "lit_green" : "lit_warm",
          rx,
          dy + 0.4 + k * 0.4,
          dz + 0.02,
          0.9,
          0.05,
          0.02,
          { tint: k % 2 ? 0x40ff60 : 0xffa040 },
        );
        glows.add(
          rx,
          dy + 0.42 + k * 0.4,
          dz - 0.1,
          k % 2 ? 0x40ff60 : 0xffa040,
          "s",
        );
      }
      K.colBox(rx - 0.55, dy, dz + 0.05, rx + 0.55, dy + 2.3, dz + 0.75);
      d.cyl("metal", rx - 0.25, dy + 2.3, dz + 0.3, 0.2, 0.2, 0.05, 12, {});
      d.cyl("metal", rx + 0.25, dy + 2.3, dz + 0.3, 0.2, 0.2, 0.05, 12, {});
    }
    for (const sp of [
      [12.9, -331.2],
      [21.1, -331.2],
    ]) {
      d.box("wood_dark", sp[0], dy, sp[1], 0.9, 1.6, 0.8, {});
      d.cyl("rubber", sp[0], dy + 0.5, sp[1] - 0.41, 0.3, 0.3, 0.02, 12, {});
    }
    d.box("atlas_paint", 14.3, dy, -333.8, 0.8, 0.5, 0.8, {
      uv: "rect",
      rect: K.paint("rc_records", 256, 256),
    });
    P.chair(d, dx, dy, dz - 0.3, Math.PI, { mat: "carpet" });
    // ON AIR sign + RFM neon over the booth
    d.panel("atlas_neon", dx, 4.6, FOY.z1 - 0.1, 2.2, 0.8, Math.PI, {
      rect: K.atlases.neon.slots.rc_onair.rect,
    });
    d.panel("atlas_neon", dx, 6.0, FOY.z1 - 0.1, 7, 1.1, Math.PI, {
      rect: K.atlases.neon.slots.rc_rfm.rect,
    });
    glows.add(dx, 4.6, FOY.z1 - 0.6, 0xff2020, "l");
    // cables snaking up the wall
    for (let k = 0; k < 3; k++)
      d.cable(
        "rubber",
        dx - 3.5 + k * 0.2,
        dy + 2.3,
        dz + 0.5,
        12.2 + k * 0.2,
        FOY.h,
        FOY.z1 - 0.3,
        0.6,
        0.04,
        6,
      );
    // settler clutter: bedrolls, crates, a guard post by the doors
    for (const m of [
      [5, -333, 0],
      [5, -336.5, 0.2],
      [24.5, -352, 1.5],
    ])
      P.mattress(d, m[0], 0.05, m[1], m[2]);
    P.crate(d, 25.5, 0, -333, 0.9, 0.3);
    P.crate(d, 25.4, 0.9, -333.1, 0.7, 0.8);
    P.sandbags(d, 24.8, -345.5, 24.8, -343.5, 3, { seed: 71 });
    P.barrel(d, 6, 0, -345, "fire", { glows, collide: true });
    P.table(d, 8, 0, -333.5, 0.2, {});
    P.chair(d, 8.9, 0, -333.5, -1.5);
    P.chair(d, 7.1, 0, -333.6, 1.5);

    // ---- foyer anchors ----
    rec.anchor("radio_dj", dx, dy, dz - 0.4, 0);
    rec.anchor("dj_booth", dx, dy, dz - 2.2, Math.PI);
    rec.anchor("foyer", 16, 0, -342, 0);
    rec.anchor("lobby", 16, 0, -342, 0);
    rec.anchor("stage", dx, 0, dz - 4.5, Math.PI);
    rec.anchor("console", dx + 1.8, dy + 0.95, dz - 1.2, Math.PI);
    rec.anchor("mezzanine", 20, MEZ.y, -352, Math.PI);
    rec.anchor("guard3", 25.5, 0, -344.5, -Math.PI / 2);
    rec.anchor("settler1", 7, 0, -338, 0);
    rec.anchor("settler2", 22, MEZ.y, -351.5, 0);
    rec.anchor("settler3", 10, 0, -348, 0);
    rec.anchor("merchant1", 25.5, 0, -334.8, -Math.PI / 2);
    rec.anchor("terminal", dx + 1.8, dy + 0.95, dz - 1.2, Math.PI);
    rec.anchor("loot1", 25.4, 0, -331.6, 0);
    rec.anchor("loot2", 3.5, MEZ.y, -352.8, 0);
  });
