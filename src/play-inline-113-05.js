// play-inline-113 05 — cz0
// Lines 578-1592 of readable/play-inline-113.pretty.js (statement-aligned).
  K.defineInterior("grand_central:concourse", function (ctx) {
    const {
      rec,
      b,
      d,
      s,
      glows,
      P,
      shaft,
      X0,
      X1,
      IX0,
      IX1,
      CZ0,
      CZ1,
      CZC,
      SPRING,
      BAL_Y,
      BAYS,
      HOLE,
      vy,
      winOps,
    } = ctx;
    // track gates: closed grilles, signs and the dark platform tunnels behind the north wall
    const gates = [222, 231, 240, 249, 258];
    for (const g of gates) {
      // closed grille gates + a short dark platform tunnel behind (faces point inward, so the city never shows through)
      const TZ0 = -246,
        TZ1 = -253.5,
        gw = 2.1,
        th = 7.2;
      d.boxMM("black_metal", g - gw, 0, TZ1 - 0.1, g + gw, th, TZ1, {
        faces: "s",
        grime: 0.9,
        tint: 0x3a3a38,
      });
      d.boxMM("black_metal", g - gw - 0.1, 0, TZ1, g - gw, th, TZ0, {
        faces: "e",
        grime: 0.9,
        tint: 0x4a4844,
      });
      d.boxMM("black_metal", g + gw, 0, TZ1, g + gw + 0.1, th, TZ0, {
        faces: "w",
        grime: 0.9,
        tint: 0x4a4844,
      });
      d.boxMM("black_metal", g - gw, th, TZ1, g + gw, th + 0.1, TZ0, {
        faces: "b",
        grime: 0.9,
        tint: 0x2a2a28,
      });
      d.boxMM("concrete_dark", g - gw, -0.05, TZ1, g + gw, 0.02, TZ0, {
        faces: "t",
        grime: 0.9,
      });
      // platform edge + rails + a sleeper or two fading into the dark
      d.boxMM(
        "paint_yellow",
        g - gw,
        0.02,
        TZ0 - 0.2,
        g + gw,
        0.04,
        TZ0 - 0.05,
        { faces: "t", grime: 0.8 },
      );
      for (const rx of [-0.72, 0.72])
        d.beam("rust", g + rx, 0.06, TZ0 - 0.4, g + rx, 0.06, TZ1 + 0.2, 0.08);
      for (let z = TZ0 - 1.2; z > TZ1; z -= 1.4)
        d.box("wood_rotten", g, 0.02, z, 2.2, 0.06, 0.25, { grime: 0.8 });
      if (g === 240) {
        // a derailed commuter car nose peeking out of the dark
        d.box("rust", g + 0.3, 0.1, TZ1 + 1.9, 3.4, 3.6, 3.2, {
          yaw: 0.08,
          grime: 0.8,
        });
        d.panel("glass_broken", g + 0.3, 2.6, TZ1 + 3.52, 2.2, 1.0, 0.08);
        glows.add(g - 0.9, 1.1, TZ1 + 3.6, 0xffc070, "s");
      }
      glows.add(
        g + (g % 2 ? 1.2 : -1.2),
        5.6,
        TZ1 + 0.6,
        g === 231 ? 0x40ff60 : 0xff3020,
        "s",
      ); // signal lamp at the far end
      for (let k = -9; k <= 9; k++)
        d.beam(
          "rust",
          g + k * 0.22,
          0,
          -244.6,
          g + k * 0.22,
          g === 258 ? 2.2 : 5.2,
          -244.6,
          0.04,
        );
      d.beam("rust", g - 2.1, 2.5, -244.6, g + 2.1, 2.5, -244.6, 0.06);
      d.beam("rust", g - 2.1, 5.1, -244.6, g + 2.1, 5.1, -244.6, 0.06);
      d.panel("atlas_paint", g, 8.2, -244.45, 3.6, 0.7, 0, {
        rect: K.paint("gc_tracks", 512, 96),
      });
    }
    // floor
    b.boxMM("marble", IX0, -0.2, CZ0, IX1, 0.035, CZ1, {
      faces: "t",
      tint: 0xe0c0a8,
      grime: 0.5,
    });
    // zodiac barrel-vaulted ceiling: painted inner skin (with the blast hole)
    const nX = 14,
      nZ = 24;
    for (let i = 0; i < nX; i++)
      for (let j = 0; j < nZ; j++) {
        const xa = IX0 + ((IX1 - IX0) * i) / nX,
          xb = IX0 + ((IX1 - IX0) * (i + 1)) / nX;
        const za = CZ0 + ((CZ1 - CZ0) * j) / nZ,
          zb = CZ0 + ((CZ1 - CZ0) * (j + 1)) / nZ;
        const cx = (xa + xb) / 2,
          cz = (za + zb) / 2;
        const inHole =
          cx > HOLE.x0 && cx < HOLE.x1 && cz > HOLE.z0 && cz < HOLE.z1;
        if (inHole) continue;
        const ua = i / nX,
          ub = (i + 1) / nX,
          va = j / nZ,
          vb = (j + 1) / nZ;
        b.quad(
          "zodiac",
          [xa, vy(za), za],
          [xb, vy(za), za],
          [xb, vy(zb), zb],
          [xa, vy(zb), zb],
          { rect: [ua, va, ub, vb] },
        );
      }
    // blast hole: light shaft + rubble (the jagged roof girders are exterior)
    shaft(
      s,
      [(HOLE.x0 + HOLE.x1) / 2, 30, (HOLE.z0 + HOLE.z1) / 2],
      [-0.12, -1, 0.05],
      30,
      3,
      4.2,
      0xfff0d0,
    );
    P.rubblePile(d, 252.5, -219, 3.4, 2.6, { seed: 31, collide: true, n: 18 });
    d.box("concrete_dark", 250, 0, -216.5, 3, 0.5, 1.6, { yaw: 0.6 });
    // sun shafts through the east & west windows
    for (const o of winOps) {
      shaft(s, [X1 - 1, 20, o.z], [-1, -0.62, 0.12], 34, 3.2, 5, 0xfff0c8);
      shaft(s, [X0 + 1, 21, o.z], [1, -0.55, -0.08], 30, 2.6, 4.2, 0xd8e0c0);
    }
    // interior wall dressing: marble wainscot, pilasters, cornice at spring line, globe lamps
    for (const wz of [CZ0 + 0.02, CZ1 - 0.02])
      d.boxMM("marble", IX0, 0, wz - 0.02, IX1, 2.6, wz + 0.02, {
        faces: wz < CZC ? "s" : "n",
        tint: 0xd0b090,
      });
    b.boxMM("limestone_dark", IX0, SPRING - 0.8, CZ0, IX0 + 0.8, SPRING, CZ1, {
      faces: "ebt",
    });
    b.boxMM("limestone_dark", IX1 - 0.8, SPRING - 0.8, CZ0, IX1, SPRING, CZ1, {
      faces: "wbt",
    });
    b.boxMM("limestone_dark", IX0, SPRING - 0.8, CZ1 - 0.8, IX1, SPRING, CZ1, {
      faces: "nbt",
    });
    b.boxMM("limestone_dark", IX0, SPRING - 0.8, CZ0, IX1, SPRING, CZ0 + 0.8, {
      faces: "sbt",
    });
    // Pilasters sit BETWEEN openings: midway between the track gates on the north wall, and flanking the
    // three waiting-room arches on the south wall (never in front of a doorway).
    const pilN = [
      IX0 + 3,
      (222 + 231) / 2,
      (231 + 240) / 2,
      (240 + 249) / 2,
      (249 + 258) / 2,
      IX1 - 3,
    ];
    const pilS = [IX0 + 3];
    for (const c of BAYS) pilS.push(c - 4.1, c + 4.1);
    pilS.push(IX1 - 3);
    const pil = (x, wz) => {
      b.box("limestone", x, 0, wz, 1.4, SPRING - 0.8, 0.6, { grime: 0.35 });
      b.box("limestone_dark", x, 0, wz, 1.7, 1.2, 0.8, { grime: 0.5 }); // plinth
      b.box("limestone", x, SPRING - 2.2, wz, 1.8, 1.4, 0.9, { grime: 0.35 }); // capital block
      d.geo("lit_warm", K.T.sphereLo, {
        x,
        y: 12,
        z: wz + (wz < CZC ? 0.7 : -0.7),
        s: 0.4,
      });
      d.beam(
        "brass",
        x,
        12,
        wz + (wz < CZC ? 0.3 : -0.3),
        x,
        12,
        wz + (wz < CZC ? 0.62 : -0.62),
        0.06,
      );
      glows.add(x, 12, wz + (wz < CZC ? 0.9 : -0.9), 0xffd49a, "l");
    };
    for (const x of pilN) pil(x, CZ0 + 0.3);
    for (const x of pilS) pil(x, CZ1 - 0.3);

    // ---- balconies + grand staircases ----
    const balcony = (bx0, bx1, stairTop, dir) => {
      // slab (walkable) with gap for the stair head
      d.boxMM("limestone", bx0, BAL_Y - 0.5, CZ0 + 1.5, bx1, BAL_Y, CZ1 - 1.5, {
        faces: "nsewtb",
        grime: 0.4,
      });
      K.colBox(bx0, BAL_Y - 0.5, CZ0 + 1.5, bx1, BAL_Y, CZ1 - 1.5, {
        surface: "concrete",
      });
      d.boxMM("marble", bx0, BAL_Y, CZ0 + 1.5, bx1, BAL_Y + 0.02, CZ1 - 1.5, {
        faces: "t",
        tint: 0xd8b8a0,
      });
      const edgeX = dir > 0 ? bx1 : bx0;
      // arcade columns under the slab edge
      for (let z = CZ0 + 3; z < CZ1 - 1; z += 4.2) {
        if (Math.abs(z - CZC) < 5) continue;
        d.cyl("limestone", edgeX - dir * 0.5, 0, z, 0.4, 0.4, BAL_Y - 0.5, 10, {
          grime: 0.4,
        });
        K.colBox(
          edgeX - dir * 0.5 - 0.4,
          0,
          z - 0.4,
          edgeX - dir * 0.5 + 0.4,
          BAL_Y - 0.5,
          z + 0.4,
        );
      }
      // balustrade (with stair gap)
      for (const seg of [
        [CZ0 + 1.5, CZC - 4.2],
        [CZC + 4.2, CZ1 - 1.5],
      ]) {
        d.boxMM(
          "limestone",
          edgeX - 0.2,
          BAL_Y,
          seg[0],
          edgeX + 0.2,
          BAL_Y + 0.15,
          seg[1],
          { grime: 0.3 },
        );
        d.boxMM(
          "limestone",
          edgeX - 0.25,
          BAL_Y + 0.95,
          seg[0],
          edgeX + 0.25,
          BAL_Y + 1.1,
          seg[1],
          { grime: 0.3 },
        );
        for (let z = seg[0] + 0.3; z < seg[1]; z += 0.45)
          d.cyl("limestone", edgeX, BAL_Y + 0.15, z, 0.09, 0.12, 0.8, 6, {
            grime: 0.2,
          });
        K.colBox(
          edgeX - 0.25,
          BAL_Y,
          seg[0],
          edgeX + 0.25,
          BAL_Y + 1.1,
          seg[1],
        );
        // globe lamps on the balustrade
        for (const z of [seg[0] + 1, seg[1] - 1]) {
          d.cyl("brass", edgeX, BAL_Y + 1.1, z, 0.08, 0.08, 1.4, 6);
          d.geo("lit_warm", K.T.sphereLo, {
            x: edgeX,
            y: BAL_Y + 2.7,
            z,
            s: 0.32,
          });
          glows.add(edgeX, BAL_Y + 2.7, z, 0xffd49a, "l");
        }
      }
      // grand staircase: from floor (x = stairTop + dir*11) up to the balcony edge
      const bottomX = edgeX + dir * 11;
      d.stairs("marble", bottomX, CZC, -dir, 0, 8, 11, 0, BAL_Y, 14, {
        tint: 0xd8c0a8,
        solid: true,
      });
      // stair side balustrades (and colliders so you can't step off the sides)
      for (const sz of [CZC - 4.1, CZC + 4.1]) {
        d.beam("limestone", bottomX, 1.0, sz, edgeX, BAL_Y + 1.0, sz, 0.25, {
          d: 0.25,
        });
        d.beam("limestone", bottomX, 0, sz, edgeX, BAL_Y, sz, 0.3, { d: 0.3 });
        for (let k = 1; k < 11; k++) {
          const t = k / 11;
          d.cyl(
            "limestone",
            bottomX - dir * 11 * t,
            BAL_Y * t,
            sz,
            0.09,
            0.1,
            1.0,
            6,
          );
        }
        K.colRot((bottomX + edgeX) / 2, sz, 11, 0.3, 0, BAL_Y + 1.1, 0, {
          walkable: false,
        });
      }
      d.cyl("brass", bottomX + dir * 0.3, 0, CZC - 4.1, 0.25, 0.25, 1.4, 8);
      d.cyl("brass", bottomX + dir * 0.3, 0, CZC + 4.1, 0.25, 0.25, 1.4, 8);
      for (const sz of [CZC - 4.1, CZC + 4.1]) {
        d.geo("lit_warm", K.T.sphereLo, {
          x: bottomX + dir * 0.3,
          y: 1.8,
          z: sz,
          s: 0.35,
        });
        glows.add(bottomX + dir * 0.3, 1.8, sz, 0xffd49a, "l");
      }
      // under-balcony ceiling
      d.boxMM(
        "plaster",
        bx0,
        BAL_Y - 0.52,
        CZ0 + 1.5,
        bx1,
        BAL_Y - 0.5,
        CZ1 - 1.5,
        { faces: "b", tint: 0xb8a888 },
      );
    };
    balcony(IX0, 221.5, 221.5, 1); // west balcony; stairs descend east to x = 232.5
    balcony(258.5, IX1, 258.5, -1); // east balcony; stairs descend west to x = 247.5

    // ---- information booth + four-faced clock ----
    const bx = 240,
      bz = CZC + 3.2;
    d.cyl("marble", bx, 0, bz, 2.1, 2.1, 1.0, 8, {
      grime: 0.3,
      tint: 0xe8d8c0,
    });
    d.cyl("brass", bx, 1.0, bz, 2.05, 2.05, 1.4, 8, { top: false, grime: 0.2 });
    d.cyl("glass_broken", bx, 1.05, bz, 2.08, 2.08, 1.25, 8, { top: false });
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + Math.PI / 8;
      d.box(
        "brass",
        bx + Math.cos(a) * 2.07,
        1.0,
        bz - Math.sin(a) * 2.07,
        0.12,
        1.4,
        0.12,
        { grime: 0.1 },
      );
    }
    d.cyl("brass", bx, 2.4, bz, 2.3, 2.3, 0.22, 8, { grime: 0.2 });
    d.cyl("brass", bx, 2.62, bz, 1.9, 0.7, 0.7, 8, { grime: 0.2 });
    d.cyl("brass", bx, 3.3, bz, 0.3, 0.3, 1.2, 8);
    glows.add(bx, 2.0, bz, 0xffe0a0, "l");
    d.geo("brass", K.T.sphere, { x: bx, y: 5.2, z: bz, s: 0.95, grime: 0.2 });
    d.geo("gold", K.T.cone8, {
      x: bx,
      y: 6.4,
      z: bz,
      sx: 0.28,
      sy: 0.7,
      sz: 0.28,
    });
    d.geo("gold", K.T.sphereLo, { x: bx, y: 6.05, z: bz, s: 0.25 });
    const cf = K.paint("gc_clockface", 256, 256);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      d.panel(
        "atlas_paint_glow",
        bx + Math.sin(a) * 0.97,
        5.2,
        bz + Math.cos(a) * 0.97,
        1.2,
        1.2,
        a,
        { rect: cf },
      );
      glows.add(
        bx + Math.sin(a) * 1.3,
        5.2,
        bz + Math.cos(a) * 1.3,
        0xfff0c0,
        "m",
      );
    }
    K.colBox(bx - 2.1, 0, bz - 2.1, bx + 2.1, 3.6, bz + 2.1, {
      surface: "metal",
    });

    // ---- market stalls (north row faces south; south row faces north) ----
    const signFor = {
      m1: "gc_s_guns",
      m2: "gc_s_aid",
      m3: "gc_s_scrap",
      m4: "gc_s_eats",
    };
    const stallDefs = [
      ["merchant1", 224, CZ0 + 5.5, 0, "m1", 0x7a3a22],
      ["merchant2", 232.5, CZ0 + 5.5, 0, "m2", 0x2a5a3a],
      ["merchant3", 247.5, CZ0 + 5.5, 0, "m3", 0x5a5a5a],
      ["merchant4", 256, CZ0 + 5.5, 0, "m4", 0x8a2a1a],
    ];
    for (const sd of stallDefs) {
      const cust = P.stall(d, sd[1], sd[2], 4.2, sd[3], {
        seed: sd[1],
        color: sd[5],
      });
      const rct = K.paint(signFor[sd[4]], 512, 128);
      d.panel("atlas_paint", sd[1], 3.25, sd[2] - 1.0, 3.6, 0.9, 0, {
        rect: rct,
        both: true,
        off: 0.03,
      });
      rec.anchor(sd[0], sd[1], 0, sd[2] - 0.45, 0);
      rec.anchor(sd[0] + "_customer", cust[0], 0, cust[2], Math.PI);
    }
    for (const sd of [
      [233, CZ1 - 4.5, "gc_s_water", "vendor_water"],
      [247, CZ1 - 4.5, "gc_s_junk", "vendor_junk"],
    ]) {
      P.stall(d, sd[0], sd[1], 3.8, Math.PI, { seed: sd[0] * 3 });
      d.panel("atlas_paint", sd[0], 3.25, sd[1] + 1.0, 3.4, 0.85, Math.PI, {
        rect: K.paint(sd[2], 512, 128),
        both: true,
        off: 0.03,
      });
      rec.anchor(sd[3], sd[0], 0, sd[1] + 0.45, Math.PI);
    }
    // water purifier tank next to the water stall
    d.cyl("metal", 263.5, 0, CZC, 1.0, 1.0, 2.4, 12, {
      grime: 0.5,
      tint: 0x6a8aa0,
    });
    d.beam("rust", 263.5, 2.4, CZC, 262.5, 1.2, CZC + 2.5, 0.08, { round: 6 });
    K.colBox(262.5, 0, CZC - 1, 264.5, 2.4, CZC + 1);

    // ---- shacks under the balconies (homes) + clinic ----
    const shackSpots = [
      [217, CZ0 + 6, Math.PI / 2],
      [217, CZ1 - 6, Math.PI / 2],
      [263, CZ0 + 6, -Math.PI / 2],
    ];
    for (const sp of shackSpots)
      P.shack(d, sp[0], sp[1], 5.5, 4.2, 2.8, sp[2], { seed: sp[0] + sp[1] });
    const clinicDoor = P.shack(d, 263, CZ1 - 6, 5.5, 4.2, 2.8, -Math.PI / 2, {
      seed: 999,
      mats: ["metal", "paint_white", "metal"],
    });
    d.panel("atlas_paint", 260.2, 2.2, CZ1 - 6, 1.6, 1.6, -Math.PI / 2, {
      rect: K.paint("gc_clinic", 256, 256),
    });
    rec.anchor("doctor", 263.8, 0, CZ1 - 6, -Math.PI / 2);
    rec.anchor("clinic_door", clinicDoor[0], 0, clinicDoor[2], Math.PI / 2);
    d.box("paint_white", 264.5, 0, CZ1 - 7.2, 1.9, 0.6, 0.9, { grime: 0.5 }); // cot

    // ---- west balcony: THE WHISTLE STOP bar ----
    const barY = BAL_Y;
    d.boxMM("wood_dark", 217.2, barY, CZ0 + 3, 218.0, barY + 1.1, CZ0 + 10, {
      grime: 0.4,
    });
    d.boxMM(
      "brass",
      217.1,
      barY + 1.1,
      CZ0 + 3,
      218.1,
      barY + 1.16,
      CZ0 + 10,
      {},
    );
    K.colBox(217.2, barY, CZ0 + 3, 218.0, barY + 1.1, CZ0 + 10, {
      surface: "wood",
    });
    d.boxMM(
      "wood_dark",
      IX0,
      barY,
      CZ0 + 2.5,
      IX0 + 0.5,
      barY + 2.6,
      CZ0 + 10.5,
      { grime: 0.4 },
    );
    for (let k = 0; k < 24; k++) {
      const z = CZ0 + 3 + (k % 12) * 0.6,
        y = barY + 1.0 + Math.floor(k / 12) * 0.8;
      d.cyl(
        ["glass", "paint_green", "glass_broken", "paint_red"][k % 4],
        IX0 + 0.3,
        y,
        z,
        0.05,
        0.05,
        0.3,
        6,
        { grime: 0.1 },
      );
    }
    for (let k = 0; k < 4; k++) {
      const z = CZ0 + 3.8 + k * 1.8;
      d.cyl("metal", 218.9, barY, z, 0.05, 0.05, 0.75, 6);
      d.cyl("carpet", 218.9, barY + 0.75, z, 0.22, 0.22, 0.08, 10);
    }
    for (const t of [
      [219.5, CZ1 - 8],
      [219.5, CZ1 - 4.5],
      [217, CZ1 - 6.2],
    ]) {
      P.table(d, t[0], barY, t[1], 0.3, { w: 1, d: 1 });
      P.chair(d, t[0] + 0.8, barY, t[1], -Math.PI / 2);
      P.chair(d, t[0] - 0.8, barY, t[1] + 0.2, Math.PI / 2, {
        fallen: t[1] > CZ1 - 5,
      });
    }
    d.panel(
      "atlas_neon",
      IX0 + 0.55,
      barY + 3.6,
      CZ0 + 6.5,
      5.6,
      1.0,
      Math.PI / 2,
      { rect: K.atlases.neon.slots.gc_whistle.rect },
    );
    rec.anchor("bar", IX0 + 1.4, barY, CZ0 + 6, Math.PI / 2);
    rec.anchor("bar_patron1", 219, barY, CZ0 + 5, -Math.PI / 2);
    rec.anchor("bar_patron2", 219.5, barY, CZ1 - 7, -Math.PI / 2);

    // ---- east balcony: mayor's office ----
    d.boxMM(
      "wood_dark",
      262.2,
      BAL_Y,
      CZ0 + 5.5,
      263.4,
      BAL_Y + 0.85,
      CZ0 + 8.5,
      { grime: 0.3 },
    );
    d.boxMM(
      "wood",
      262.1,
      BAL_Y + 0.85,
      CZ0 + 5.4,
      263.5,
      BAL_Y + 0.9,
      CZ0 + 8.6,
      {},
    );
    K.colBox(262.2, BAL_Y, CZ0 + 5.5, 263.4, BAL_Y + 0.9, CZ0 + 8.5, {
      surface: "wood",
    });
    P.chair(d, 264.4, BAL_Y, CZ0 + 7, -Math.PI / 2, { mat: "carpet" });
    P.chair(d, 261, BAL_Y, CZ0 + 6.3, Math.PI / 2);
    P.chair(d, 261, BAL_Y, CZ0 + 7.7, Math.PI / 2);
    for (let k = 0; k < 3; k++) {
      d.box("metal", IX1 - 0.4, BAL_Y, CZ0 + 3 + k * 0.7, 0.6, 1.4, 0.6, {
        tint: 0x6a7a6a,
      });
    }
    d.panel(
      "atlas_paint",
      IX1 - 0.45,
      BAL_Y + 3.2,
      CZ0 + 7,
      3.6,
      0.7,
      -Math.PI / 2,
      { rect: K.paint("gc_mayor", 512, 96) },
    );
    P.flagpole(d, IX1 - 1.2, CZ0 + 10, 3.2, null, 0, { y: BAL_Y });
    d.face(
      "flags_static",
      IX1 - 1.2,
      BAL_Y + 1.6,
      CZ0 + 10,
      0,
      0,
      -1,
      0,
      1,
      0,
      1.6,
      1.4,
      { uv: "rect", rect: K.flag("settlers", null), su: 1, sv: 1, grime: 0 },
    );
    rec.anchor("mayor", 264.2, BAL_Y, CZ0 + 7, -Math.PI / 2);
    rec.anchor("mayor_terminal", 262.8, BAL_Y + 0.9, CZ0 + 8.1, -Math.PI / 2);

    // ---- giant tattered flag hanging over the south doorway + neon ----
    d.face("flags_static", 246, 13, CZ1 - 0.6, -1, 0, 0, 0, 1, 0, 12, 6.3, {
      uv: "rect",
      rect: K.flag("usa", null),
      su: 1,
      sv: 1,
      grime: 0.2,
    });
    d.panel("atlas_neon", 240, 10.2, CZ1 - 0.7, 9.6, 1.25, Math.PI, {
      rect: K.atlases.neon.slots.gc_neon.rect,
    });
    d.panel("atlas_neon", 253.5, 3.5, CZ0 + 5.0, 1.6, 0.8, 0, {
      rect: K.atlases.neon.slots.gc_open.rect,
    });

    // ---- string lights crisscrossing the concourse ----
    const warm = [0xffd9a0, 0xffc070, 0xfff0c0, 0xffb060];
    P.bulbs(
      d,
      glows,
      [
        [221.5, BAL_Y + 1.6, CZ0 + 4],
        [258.5, BAL_Y + 1.6, CZ0 + 4],
      ],
      { spacing: 1.3, sag: 1.6, colors: warm, broken: 0.1 },
    );
    P.bulbs(
      d,
      glows,
      [
        [221.5, BAL_Y + 1.6, CZ1 - 4],
        [258.5, BAL_Y + 1.6, CZ1 - 4],
      ],
      { spacing: 1.3, sag: 1.6, colors: warm, broken: 0.1 },
    );
    P.bulbs(
      d,
      glows,
      [
        [221.5, BAL_Y + 1.6, CZ0 + 4],
        [240, 7.0, bz],
        [258.5, BAL_Y + 1.6, CZ1 - 4],
      ],
      { spacing: 1.3, sag: 0.8, colors: warm, broken: 0.15 },
    );
    P.bulbs(
      d,
      glows,
      [
        [221.5, BAL_Y + 1.6, CZ1 - 4],
        [240, 7.0, bz],
        [258.5, BAL_Y + 1.6, CZ0 + 4],
      ],
      { spacing: 1.3, sag: 0.8, colors: warm, broken: 0.15 },
    );
    P.bulbs(
      d,
      glows,
      [
        [228, 10, CZ1 - 0.5],
        [228, 10, CZ0 + 0.5],
      ],
      { spacing: 1.4, sag: 2, colors: warm, broken: 0.2 },
    );
    P.bulbs(
      d,
      glows,
      [
        [252, 10, CZ1 - 0.5],
        [252, 10, CZ0 + 0.5],
      ],
      { spacing: 1.4, sag: 2, colors: warm, broken: 0.2 },
    );

    // ---- settlement clutter ----
    P.barrel(d, 236, 0, CZ0 + 9, "fire", { glows, collide: true });
    P.barrel(d, 244, 0, CZ1 - 9, "fire", { glows, collide: true });
    for (const c of [
      [222, CZ1 - 2],
      [258, CZ1 - 2.2],
      [235, CZ0 + 2],
      [244.5, CZ0 + 2.3],
      [214.5, CZ1 - 10.5],
    ]) {
      P.crate(d, c[0], 0, c[1], 0.9, c[0]);
      P.crate(d, c[0] + 0.3, 0.9, c[1] + 0.1, 0.7, c[0] * 2);
    }
    for (const c of [
      [229, CZ0 + 9],
      [251, CZ0 + 9],
      [236, CZ1 - 9],
      [224, CZC + 6],
    ]) {
      P.table(d, c[0], 0, c[1], c[0], {});
      P.chair(d, c[0] + 0.9, 0, c[1], -Math.PI / 2);
      P.chair(d, c[0] - 0.9, 0, c[1], Math.PI / 2);
    }
    P.barrel(d, 215, 0, CZC + 6, "blue", {});
    P.barrel(d, 215.7, 0, CZC + 6.5, "rust", {});
    P.barrel(d, 265, 0, CZC - 6, "red", {});

    // ================= INTERIOR ANCHORS =================
    rec.anchor("waiting_room", 240, 0, -199, Math.PI);
    rec.anchor("concourse", 240, 0, CZC - 4, 0);
    rec.anchor("clock", bx, 0, bz + 3.4, Math.PI);
    rec.anchor("info_booth", bx, 0, bz, 0);
    rec.anchor("guard3", 220.6, BAL_Y, CZ1 - 3.5, -Math.PI / 2);
    rec.anchor("guard4", 259.4, BAL_Y, CZ1 - 3.5, Math.PI / 2);
    rec.anchor("guards", 240, 0, -197, 0);
    rec.anchor("settler1", 230, 0, CZC + 1, 0);
    rec.anchor("settler2", 250, 0, CZC - 2, 0);
    rec.anchor("settler3", 222, 0, -200, 0);
    rec.anchor("settler4", 258, 0, -201, 0);
    rec.anchor("settler5", 236, 0, CZ1 - 8, 0);
    rec.anchor("settler6", 244, 0, CZ0 + 9, 0);
    rec.anchor("west_balcony", 217, BAL_Y, CZC, Math.PI / 2);
    rec.anchor("east_balcony", 263, BAL_Y, CZC, -Math.PI / 2);
    rec.anchor("loot1", 214.5, 0, CZ1 - 10.5, 0);
    rec.anchor("loot2", 265, 0, CZC - 6, 0);
    rec.anchor("loot3", 214.3, BAL_Y, CZ0 + 3, 0);
    rec.anchor("rubble", 252.5, 0, -219, 0);
    rec.anchor("lobby", 240, 0, -199, Math.PI);
    rec.anchor("center", 240, 0, CZC - 4, 0);
    rec.anchor("office", 263, BAL_Y, CZ0 + 7, -Math.PI / 2);
    rec.anchor("water_main", 263.5, 0, CZC + 1.6, -Math.PI / 2);
    rec.anchor("stationmaster", 264.2, BAL_Y, CZ0 + 7, -Math.PI / 2);

    // ================= MAIN STORY (outline v2) =================
    // ---- THE WHISPERING GALLERY: a Guastavino-tiled vaulted bay under the west balcony, at the foot of the grand
    // staircase (where Eli said goodbye to Nicole on 19 Feb 1967; mq02 / mq23). Arches on the N and S sides (a passage under the stair head),
    // the west side against the outer wall, a domical tile vault. Anchors: whispering_gallery (centre),
    // whisper_corner_a / whisper_corner_b (opposite corners: stand in one, you are heard in the other).
    const WG = {
      x0: 214.2,
      x1: 220.8,
      z0: CZC - 3.3,
      z1: CZC + 3.3,
      h: 4.9,
      spring: 2.5,
    };
    const wgx = (WG.x0 + WG.x1) / 2,
      wgz = (WG.z0 + WG.z1) / 2;
    const tileR = K.storyPaints.gc_tile();
    // arch walls (limestone-faced; colliders keep the piers solid and leave the arches open)
    d.wall(
      "limestone",
      WG.x0,
      WG.z0,
      WG.x1,
      WG.z0,
      0,
      WG.h,
      0.5,
      [{ at: (WG.x1 - WG.x0) / 2, w: 5.0, h: 4.3, arch: true }],
      { grime: 0.4 },
    );
    d.wall(
      "limestone",
      WG.x1,
      WG.z1,
      WG.x0,
      WG.z1,
      0,
      WG.h,
      0.5,
      [{ at: (WG.x1 - WG.x0) / 2, w: 5.0, h: 4.3, arch: true }],
      { grime: 0.4 },
    );
    d.wall("limestone", WG.x1, WG.z0, WG.x1, WG.z1, 0, WG.h, 0.5, [], {
      grime: 0.4,
    });
    d.panel(
      "storyp",
      WG.x1 - 0.27,
      2.2,
      wgz,
      WG.z1 - WG.z0 - 1.0,
      4.1,
      -Math.PI / 2,
      { rect: tileR },
    );
    // the west face: tile panel on the outer wall + a bench
    d.panel(
      "storyp",
      WG.x0 + 0.02,
      2.4,
      wgz,
      WG.z1 - WG.z0 - 0.6,
      4.6,
      Math.PI / 2,
      { rect: tileR },
    );
    d.box("wood_dark", WG.x0 + 0.45, 0, wgz, 0.6, 0.45, 3.4, { grime: 0.5 });
    K.colBox(WG.x0 + 0.15, 0, wgz - 1.7, WG.x0 + 0.75, 0.45, wgz + 1.7, {
      surface: "wood",
    });
    // domical tile vault: y(u,v) rises from the spring line at the edges to the crown in the middle
    {
      const n = 8,
        cx0 = WG.x0 + 0.25,
        cx1 = WG.x1 - 0.25,
        cz0 = WG.z0 + 0.25,
        cz1 = WG.z1 - 0.25;
      const vyW = (x, z) => {
        const u = (x - wgx) / ((cx1 - cx0) / 2),
          v = (z - wgz) / ((cz1 - cz0) / 2);
        const m = Math.min(
          1,
          Math.max(Math.abs(u), Math.abs(v)) * 0.55 + Math.hypot(u, v) * 0.45,
        );
        return WG.h + 0.6 - (WG.h + 0.6 - 4.3) * m * m;
      };
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const xa = cx0 + ((cx1 - cx0) * i) / n,
            xb = cx0 + ((cx1 - cx0) * (i + 1)) / n,
            za = cz0 + ((cz1 - cz0) * j) / n,
            zb = cz0 + ((cz1 - cz0) * (j + 1)) / n;
          d.quad(
            "storyp",
            [xa, vyW(xa, za), za],
            [xb, vyW(xb, za), za],
            [xb, vyW(xb, zb), zb],
            [xa, vyW(xa, zb), zb],
            { rect: tileR },
          );
        }
      // tile ribs along the diagonals (the "whisper" carries along them)
      d.beam("brick_tan", cx0, 4.3, cz0, wgx, WG.h + 0.6, wgz, 0.12);
      d.beam("brick_tan", cx1, 4.3, cz1, wgx, WG.h + 0.6, wgz, 0.12);
      d.beam("brick_tan", cx1, 4.3, cz0, wgx, WG.h + 0.6, wgz, 0.12);
      d.beam("brick_tan", cx0, 4.3, cz1, wgx, WG.h + 0.6, wgz, 0.12);
      // the vault's back (balcony underside above it is already plaster)
      d.boxMM("plaster", WG.x0, WG.h + 0.6, WG.z0, WG.x1, WG.h + 0.7, WG.z1, {
        faces: "t",
      });
    }
    // one hanging lamp in the crown, a brass plaque on the north-east pier
    d.beam("brass", wgx, WG.h + 0.6, wgz, wgx, WG.h - 0.4, wgz, 0.03);
    d.geo("lit_warm", K.T.sphereLo, {
      x: wgx,
      y: WG.h - 0.55,
      z: wgz,
      s: 0.22,
    });
    glows.add(wgx, WG.h - 0.55, wgz, 0xffd49a, "m");
    d.panel(
      "storyp",
      WG.x1 + 0.27,
      1.75,
      WG.z0 - 0.02,
      0.9,
      0.45,
      Math.PI / 2,
      { rect: K.storyPaints.gc_whisper_plaque() },
    );
    // a candle stub and a small chalked twelve-ray sun at the foot of the south-west pier (Somebody keeps the light on.)
    d.cyl("bone", WG.x0 + 0.55, 0.03, WG.z1 - 0.55, 0.045, 0.035, 0.09, 8, {
      grime: 0.2,
    });
    d.cyl("bone", WG.x0 + 0.62, 0.03, WG.z1 - 0.48, 0.08, 0.06, 0.025, 8, {
      grime: 0.6,
    });
    glows.add(WG.x0 + 0.55, 0.16, WG.z1 - 0.55, 0xffb050, "s");
    d.panel(
      "storyp",
      WG.x0 + 0.27,
      0.45,
      WG.z1 - 0.35,
      0.42,
      0.42,
      Math.PI / 2,
      { rect: K.storyPaints.chalk_sun() },
    );
    rec.anchor("whispering_gallery", wgx + 0.6, 0, wgz, -Math.PI / 2);
    rec.anchor("whisper_corner_a", WG.x1 - 0.75, 0, WG.z0 + 0.75, -Math.PI / 4); // north-east corner, facing into it
    rec.anchor(
      "whisper_corner_b",
      WG.x0 + 1.1,
      0,
      WG.z1 - 0.95,
      Math.PI * 0.75,
    ); // south-west corner (the candle), facing into it
    rec.anchor("oyster_bar_steps", 233.4, 0, CZC + 2.4, -Math.PI / 2); // foot of the west grand staircase (up to the bar)

    // ---- THE SEALED LOWER-LEVEL STAIR (mq09): an arched opening in the north wall west of Track 23, barred with an
    // iron grate, chained; behind it a landing and a stair going down into the dark, a wall of melted candles and a
    // chalk sun with twelve rays. The north wall's collider stays (nobody goes down; the lair has its own entrances).
    {
      const LX = 218.55,
        wz = -244.5,
        TZ = -250.5;
      // landing + the first steps down (inward-facing shell, dark)
      d.boxMM(
        "concrete_dark",
        LX - 0.9,
        -0.05,
        -246.6,
        LX + 0.9,
        0.02,
        -245.95,
        { faces: "t", grime: 0.9 },
      );
      for (let k = 0; k < 9; k++) {
        const z0 = -246.6 - k * 0.42,
          y = -0.22 * (k + 1);
        d.boxMM(
          "concrete_dark",
          LX - 0.9,
          y - 0.22,
          z0 - 0.42,
          LX + 0.9,
          y,
          z0,
          { faces: "tn", grime: 0.95 },
        );
      }
      d.boxMM("black_metal", LX - 1.0, -2.6, TZ - 0.1, LX + 1.0, 3.2, TZ, {
        faces: "s",
        grime: 0.9,
        tint: 0x141210,
      });
      d.boxMM("limestone_dark", LX - 1.0, -2.6, TZ, LX - 0.9, 3.2, -245.95, {
        faces: "e",
        grime: 0.95,
        tint: 0x5a5448,
      });
      d.boxMM("limestone_dark", LX + 0.9, -2.6, TZ, LX + 1.0, 3.2, -245.95, {
        faces: "w",
        grime: 0.95,
        tint: 0x5a5448,
      });
      d.boxMM("limestone_dark", LX - 1.0, 3.0, TZ, LX + 1.0, 3.1, -245.95, {
        faces: "b",
        grime: 0.95,
        tint: 0x3a3630,
      });
      // soot and wax runs on both side walls, the chalk sun on the east wall facing the grate
      d.panel("storyp", LX - 0.88, 1.0, -247.6, 3.0, 2.4, Math.PI / 2, {
        rect: K.storyPaints.soot(),
      });
      d.panel("storyp", LX + 0.88, 1.0, -247.6, 3.0, 2.4, -Math.PI / 2, {
        rect: K.storyPaints.soot(),
      });
      d.panel("storyg", LX + 0.87, 1.55, -247.1, 1.05, 1.05, -Math.PI / 2, {
        rect: K.storyPaints.chalk_sun(),
      });
      // the wall of candles: rows of melted stubs on the landing and the top steps, a few still lit
      const rc = K.rng(1105);
      for (let k = 0; k < 46; k++) {
        const row = k % 4,
          cx = LX - 0.8 + rc() * 1.6,
          cz = -246.0 - row * 0.42 - rc() * 0.3,
          cy = row === 0 ? 0.02 : -0.22 * row;
        const h = 0.03 + rc() * 0.14,
          r0 = 0.025 + rc() * 0.03;
        d.cyl("bone", cx, cy, cz, r0 * 1.5, r0, h, 6, {
          grime: 0.35 + rc() * 0.4,
        });
        if (rc() < 0.3)
          d.cyl("bone", cx + 0.03, cy, cz + 0.02, r0 * 2.6, r0 * 2.2, 0.02, 6, {
            grime: 0.5,
          }); // a puddle of wax
        if (rc() < 0.16) glows.add(cx, cy + h + 0.05, cz, 0xffb050, "s");
      }
      // the grate (bars + cross rails), a chain and padlock, a fallen candle box in front of it
      for (let k = -4; k <= 4; k++)
        d.beam(
          "rust",
          LX + k * 0.2,
          0,
          wz - 0.95,
          LX + k * 0.2,
          2.75,
          wz - 0.95,
          0.035,
        );
      for (const y of [0.15, 1.3, 2.45])
        d.beam("rust", LX - 0.9, y, wz - 0.95, LX + 0.9, y, wz - 0.95, 0.05);
      d.beam(
        "black_metal",
        LX - 0.25,
        1.15,
        wz - 0.9,
        LX + 0.25,
        1.05,
        wz - 0.9,
        0.025,
      );
      d.box("brass", LX + 0.05, 0.92, wz - 0.86, 0.12, 0.14, 0.05, {
        grime: 0.6,
      });
      d.box("wood", LX - 0.55, 0, wz + 0.45, 0.32, 0.12, 0.22, {
        yaw: 0.5,
        grime: 0.6,
      });
      // the order nailed beside the opening, the old enamel sign above it
      d.panel("storyp", LX + 1.55, 1.7, wz + 0.04, 0.9, 0.6, 0, {
        rect: K.storyPaints.gc_ocd_order(),
      });
      d.panel("storyp", LX, 3.65, wz + 0.04, 1.9, 0.48, 0, {
        rect: K.storyPaints.gc_lower_sign(),
      });
      rec.anchor("lower_stair", LX, 0, wz + 1.2, 0); // stand here, facing the grate (north)
      rec.anchor("lower_stair_grate", LX, 0, wz + 0.4, 0);
    }
    // ---- THE TRACK 61 BULKHEAD (mq13 / mq23 / mq35) is not in the concourse: it is the welded pressure hatch on the north
    // wall of the 42nd Street tunnels' east tunnel (the map's `subway` cell), the lair's `lair_bulkhead_in` door (src/lair).
    // Grand Central publishes it as `track61_bulkhead` (tunnel side, facing the hatch) so the story finds it under its site.
    rec.anchor("track61_bulkhead", 4080, 0, 393.5, 0);
  });
