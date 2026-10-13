// play-inline-128 04 — hold
// Lines 423-1146 of readable/play-inline-128.pretty.js (statement-aligned).
  function build(rec) {
    const b = K.builder("sterlings_shell", { grime: 0.5 });
    const d = K.builder("sterlings_detail", { grime: 0.5 });
    const glows = K.glowSet("sterlings");
    const green = K.glowSet("sterlings_glow");
    const P = K.parts;
    b.burn(-10, 30, FZ, 8, 0.6)
      .burn(BLD.x1, 12, -70, 6, 0.6)
      .burn(8, 3, FZ, 5, 0.6);
    const LIME = 0xd8ccb4;

    // ---- shell: brick upper floors on a limestone base (L-shaped around the holdout), hollow sales floor ----
    b.boxMM("fac_sterlings", BLD.x0, 7, BLD.z0, HOLD.x0, BLD.h, BLD.z1, {
      faces: "nsewt",
    });
    b.boxMM("fac_sterlings", HOLD.x0, 7, HOLD.z1, BLD.x1, BLD.h, BLD.z1, {
      faces: "nset",
    });
    for (const r of [
      [BLD.x0, BLD.z0, HOLD.x0, BLD.z1],
      [HOLD.x0, HOLD.z1, BLD.x1, BLD.z1],
    ]) {
      b.boxMM(
        "limestone",
        r[0] - 0.5,
        BLD.h - 1.2,
        r[1] - 0.5,
        r[2] + 0.5,
        BLD.h,
        r[3] + 0.5,
        { faces: "nsewtb", tint: LIME },
      );
      b.boxMM(
        "limestone",
        r[0] - 0.35,
        6.6,
        r[1] - 0.35,
        r[2] + 0.35,
        7.3,
        r[3] + 0.35,
        { faces: "nsewtb", tint: LIME },
      );
    }
    // limestone base: west (7th Ave) and south (32nd St) solid faces
    b.boxMM(
      "limestone",
      BLD.x0 - 0.3,
      0,
      BLD.z0 + 0.3,
      BLD.x0 + 0.9,
      7,
      BLD.z1 + 0.3,
      { faces: "wt", tint: LIME, grime: 0.6 },
    );
    b.boxMM(
      "limestone",
      BLD.x0 - 0.3,
      0,
      BLD.z1 - 0.9,
      BLD.x1 + 0.3,
      7,
      BLD.z1 + 0.3,
      { faces: "st", tint: LIME, grime: 0.6 },
    );
    // north (34th St) base wall: 3 revolving-door openings + display windows
    const sOps = DOORS.map((x) => ({ at: x - BLD.x0 + 0.3, w: 3.2, h: 4.2 }));
    const dispOps = [];
    for (let x = BLD.x0 + 3; x < HOLD.x0 - 2.4; x += 5.6)
      if (!DOORS.some((dx) => Math.abs(dx - x) < (dx === DOORS[1] ? 4.8 : 3.4)))
        dispOps.push({ at: x - BLD.x0 + 0.3, w: 3.6, h: 3.4, y: 0.8 });
    b.wall(
      "limestone",
      BLD.x0 - 0.3,
      FZ + 0.3,
      HOLD.x0,
      FZ + 0.3,
      0,
      7,
      1.2,
      sOps.concat(dispOps),
      { tint: LIME },
    );
    // east (Herald Square) base wall south of the holdout, display windows
    const eOps = [];
    for (let z = HOLD.z1 + 3; z < BLD.z1 - 2; z += 5.6)
      eOps.push({ at: z - HOLD.z1, w: 3.6, h: 3.4, y: 0.8 });
    b.wall(
      "limestone",
      BLD.x1 - 0.3,
      HOLD.z1,
      BLD.x1 - 0.3,
      BLD.z1 + 0.3,
      0,
      7,
      1.2,
      eOps,
      { tint: LIME },
    );
    // colliders: the rest of the mass around the sales floor
    K.colBox(BLD.x0, 0, BLD.z0, FL.x0, BLD.h, BLD.z1); // west slab
    K.colBox(FL.x1, 0, HOLD.z1, BLD.x1, BLD.h, BLD.z1); // east slab (behind the Herald Sq windows)
    K.colBox(FL.x0, 0, FL.z1, FL.x1, BLD.h, BLD.z1); // south slab (32nd St)
    K.colBox(FL.x0, FL.h, BLD.z0, HOLD.x0, BLD.h, FL.z1); // upper floors (open sky above the holdout)
    K.colBox(HOLD.x0, FL.h, HOLD.z1, BLD.x1, BLD.h, FL.z1);
    K.colBox(HOLD.x0, 0, HOLD.z0, BLD.x1, HOLD.h, HOLD.z1); // holdout
    K.colBox(FL.x1, 0, BLD.z0 + 1.2, HOLD.x0, FL.h, HOLD.z1); // gap wall between the store and the holdout
    // display windows: glass fronts, backdrops, mannequins
    K.defineMat("sterlings_glass", {
      color: 0x9fb4b2,
      rough: 0.06,
      metal: 0.4,
      transparent: true,
      opacity: 0.3,
      noShadow: true,
    });
    // 34th St display windows, each a different state: smashed out / lit Spring Preview / lit Easter Parade / boarded (keys 'fall'/'xmas' kept)
    const spill = K.spillSet("sterlings");
    const KIND = ["smashed", "fall", "xmas", "boarded"];
    let winN = 0;
    for (const op of dispOps) {
      const cx = BLD.x0 - 0.3 + op.at,
        kind = KIND[winN % KIND.length];
      winN++;
      d.box("wood", cx, 0, FZ + 2.2, 3.8, 0.6, 2.4, { grime: 0.5 });
      K.colBox(cx - 1.9, 0, FZ + 1.0, cx + 1.9, 0.6, FZ + 3.4, {
        surface: "wood",
      });
      if (kind === "fall" || kind === "xmas") {
        d.panel("atlas_paint_glow", cx, 2.4, FZ + 3.33, 3.8, 3.6, PI, {
          rect: K.paint(
            kind === "xmas" ? "sterlings_disp_xmas" : "sterlings_disp_fall",
            256,
            256,
          ),
        });
        d.panel("sterlings_glass", cx, 2.5, FZ + 0.9, 3.6, 3.4, PI, {
          grime: 0.3,
        });
        d.box("lit_warm", cx, 4.05, FZ + 1.5, 3.2, 0.06, 0.12, {
          tint: 0xfff0c8,
        });
        glows.add(cx, 3.8, FZ + 1.4, 0xffd9a0, "m");
        glows.add(cx - 1.1, 3.8, FZ + 1.4, 0xffd9a0, "s");
        glows.add(cx + 1.1, 3.8, FZ + 1.4, 0xffd9a0, "s");
        spill.add(cx, FZ + 2.2, 0xffd0a0, 2.2, {
          y: 0.62,
          i: 0.6,
          sx: 3.6,
          sz: 2.2,
        });
        spill.add(cx, FZ - 1.7, 0xffc080, 3.0, {
          y: 0.14,
          i: 0.42,
          sx: 4.4,
          sz: 2.8,
        });
        for (let k = -1; k <= 1; k++)
          mannequin(
            d,
            cx + k * 1.15,
            0.6,
            FZ + 2.0 + (k === 0 ? 0.5 : 0),
            R(k * 0.35),
            false,
          );
        if (kind === "xmas") {
          // a giant papier-mâché Easter egg on a gilt stand (the Easter Parade window)
          d.geo("paint_white", K.T.sphereLo, {
            x: cx + 1.3,
            y: 1.45,
            z: FZ + 2.8,
            sx: 0.55,
            sy: 0.78,
            sz: 0.55,
            tint: 0xf0c8d8,
            grime: 0.6,
          });
          d.cyl("gold", cx + 1.3, 0.6, FZ + 2.8, 0.3, 0.22, 0.14, 8, {
            grime: 0.4,
          });
          for (let g = 0; g < 4; g++)
            d.box(
              ["paint_red", "paint_blue", "paint_yellow", "paint_white"][g],
              cx - 1.3 + g * 0.45,
              0.6,
              FZ + 1.35 + (g % 2) * 0.3,
              0.32,
              0.28,
              0.32,
              { yaw: g, grime: 0.5 },
            );
        } else {
          for (let g = 0; g < 3; g++)
            d.box(
              "fabric",
              cx - 1.2 + g * 1.2,
              0.6,
              FZ + 1.25,
              0.5,
              0.06,
              0.4,
              { yaw: g * 0.7, tint: [0x8a3a1a, 0xc8a050, 0x5a2a1a][g] },
            );
        }
      } else if (kind === "smashed") {
        // the glass is gone: jagged shards still in the frame, a toppled mannequin, glass and debris spilled on the pavement
        d.boxMM("limestone", cx - 1.9, 0, FZ + 3.35, cx + 1.9, 4.0, FZ + 3.45, {
          tint: 0x7a6e5a,
          grime: 0.8,
        });
        const zf = FZ + 0.88,
          x0 = cx - 1.8,
          x1 = cx + 1.8,
          y0 = 0.8,
          y1 = 4.2;
        for (const t of [
          [
            [x0, y0],
            [x0 + 1.3, y0],
            [x0, y0 + 1.6],
          ],
          [
            [x1, y1],
            [x1 - 1.6, y1],
            [x1, y1 - 1.1],
          ],
          [
            [x1 - 0.5, y0],
            [x1, y0],
            [x1, y0 + 2.1],
          ],
          [
            [x0, y1],
            [x0 + 0.9, y1],
            [x0, y1 - 0.8],
          ],
        ])
          d.quad(
            "glass_broken",
            [t[0][0], t[0][1], zf],
            [t[1][0], t[1][1], zf],
            [t[2][0], t[2][1], zf],
            [t[2][0], t[2][1], zf],
            { double: true },
          );
        mannequin(d, cx - 0.6, 0.6, FZ + 2.3, R(0.3), true);
        mannequin(d, cx + 0.4, 0.02, FZ - 1.3, R(1.9), true); // pitched out onto the pavement
        const r = K.rng(Math.round(cx * 11));
        for (let k = 0; k < 16; k++)
          d.box(
            "glass",
            cx + (r() - 0.5) * 4.2,
            0.12,
            FZ - 0.5 - r() * 2.2,
            0.1 + r() * 0.25,
            0.015,
            0.08 + r() * 0.2,
            { yaw: r() * 3 },
          );
        P.rubblePile(d, cx - 1.2, FZ - 0.9, 0.9, 0.45, { seed: 951 });
      } else {
        // boarded up: rough planks nailed over the opening, spray-painted warning
        d.boxMM("limestone", cx - 1.9, 0, FZ + 3.35, cx + 1.9, 4.0, FZ + 3.45, {
          tint: 0x7a6e5a,
          grime: 0.8,
        });
        const r = K.rng(Math.round(cx * 13));
        for (let k = 0; k < 6; k++)
          d.geo("wood_rotten", K.T.box, {
            x: cx + (r() - 0.5) * 0.2,
            y: 1.1 + k * 0.56,
            z: FZ - 0.38,
            rz: (r() - 0.5) * 0.12,
            sx: 4.1,
            sy: 0.42,
            sz: 0.06,
          });
        for (const sx of [-1.4, 1.4])
          d.geo("wood_rotten", K.T.box, {
            x: cx + sx,
            y: 2.5,
            z: FZ - 0.44,
            rz: (r() - 0.5) * 0.08,
            sx: 0.3,
            sy: 3.6,
            sz: 0.06,
          });
        d.panel("atlas_paint", cx, 2.5, FZ - 0.49, 3.8, 1.9, PI, {
          rect: K.paint("sterlings_graf", 512, 256),
        });
      }
    }
    // the warning board by the east door and a scavenger crew's barricade
    P.signBoard(
      d,
      "atlas_paint",
      K.paint("sterlings_warn", 512, 192),
      DOORS[2] + 2.9,
      2.0,
      FZ - 0.5,
      2.4,
      0.9,
      PI,
      { backMat: "wood_dark" },
    );
    P.sandbags(d, DOORS[2] + 4.4, FZ - 0.9, DOORS[2] + 4.4, FZ - 3.0, 2, {
      seed: 952,
    });
    let eN = 0;
    for (const op of eOps) {
      const cz = HOLD.z1 + op.at;
      if (eN++ === 1) {
        b.panel("atlas_paint_glow", BLD.x1 - 1.2, 2.5, cz, 3.6, 3.4, PI / 2, {
          rect: K.paint("sterlings_disp_fall", 256, 256),
        });
        glows.add(BLD.x1 + 0.8, 3.6, cz, 0xffd9a0, "m");
        spill.add(BLD.x1 + 1.8, cz, 0xffc080, 2.8, { y: 0.14, i: 0.4 });
      } else b.panel("glass_broken", BLD.x1 - 1.2, 2.5, cz, 3.6, 3.4, PI / 2); // dark back of the shallow window box
      d.panel("sterlings_glass", BLD.x1 + 0.31, 2.5, cz, 3.6, 3.4, PI / 2, {
        grime: 0.3,
      });
      mannequin(
        d,
        BLD.x1 - 0.6,
        0.8,
        cz + (Math.round(cz) % 2 ? 0.6 : -0.6),
        PI / 2 + 0.3,
        Math.round(cz) % 3 === 0,
      );
      d.box("wood", BLD.x1 - 0.6, 0, cz, 1.3, 0.8, 3.6, { grime: 0.5 });
    }
    // revolving doors (bronze drums with vanes) + the lit marquee canopy over the main entrance
    for (const dx of DOORS) {
      const dz = FZ - 0.6;
      d.cyl("bronze", dx, 0, dz, 1.5, 1.5, 0.1, 12, {});
      d.cyl("bronze", dx, 3.4, dz, 1.55, 1.55, 0.4, 12, { bottom: true });
      d.cyl("glass_broken", dx, 0.1, dz, 1.5, 1.5, 3.3, 12, {
        arc0: 0.4,
        arc: 1.8,
        top: false,
      });
      d.cyl("glass_broken", dx, 0.1, dz, 1.5, 1.5, 3.3, 12, {
        arc0: 3.54,
        arc: 1.8,
        top: false,
      });
      d.geo("bronze", K.T.box, {
        x: dx,
        y: 1.8,
        z: dz,
        ry: 0.7,
        sx: 2.9,
        sy: 3.3,
        sz: 0.06,
      });
      if (dx !== DOORS[1])
        d.panel("atlas_paint", dx, 5.2, FZ - 0.32, 3, 1.5, PI, {
          rect: K.paint("sterlings_sign", 1024, 256),
        });
    }
    {
      const cx = DOORS[1],
        cw = 7.2,
        cd = 3.2,
        cy = 4.5;
      d.boxMM(
        "bronze",
        cx - cw / 2,
        cy,
        FZ - cd,
        cx + cw / 2,
        cy + 0.9,
        FZ - 0.2,
        { grime: 0.5 },
      );
      d.boxMM(
        "plaster",
        cx - cw / 2 + 0.1,
        cy - 0.02,
        FZ - cd + 0.1,
        cx + cw / 2 - 0.1,
        cy,
        FZ - 0.3,
        { faces: "b", tint: 0xe0d4b8, grime: 0.4 },
      );
      for (const s of [-1, 1])
        d.beam(
          "black_metal",
          cx + s * (cw / 2 - 0.4),
          cy + 0.9,
          FZ - cd + 0.3,
          cx + s * (cw / 2 - 0.4),
          8.4,
          FZ - 0.2,
          0.05,
        );
      const nslot = K.atlases.neon.slots.sterlings_neon;
      d.panel(
        "atlas_neon",
        cx,
        cy + 1.9,
        FZ - cd + 0.25,
        5.2,
        (5.2 * nslot.h) / nslot.w,
        PI,
        { rect: nslot.rect, off: 0.02 },
      );
      d.box("black_metal", cx, cy + 0.9, FZ - cd + 0.4, 5.6, 2.1, 0.1, {
        grime: 0.4,
      });
      glows.add(cx - 1.5, cy + 2.0, FZ - cd - 0.4, 0xff3030, "l");
      glows.add(cx + 1.5, cy + 2.0, FZ - cd - 0.4, 0xff3030, "l");
      // soffit bulbs (a few dead)
      for (let i = 0; i < 7; i++)
        for (const zz of [FZ - cd + 0.5, FZ - 1.2]) {
          const bx = cx - cw / 2 + 0.7 + (i * (cw - 1.4)) / 6;
          if ((i * 3 + (zz > FZ - 2 ? 1 : 0)) % 5 === 0) continue;
          d.geo("lit_warm", K.T.sphereLo, {
            x: bx,
            y: cy - 0.08,
            z: zz,
            s: 0.09,
          });
          if (i % 2 === 0) glows.add(bx, cy - 0.15, zz, 0xffd9a0, "s");
        }
    }
    // warm light pooling in front of the revolving doors, the 34th St clock over the canopy, flagpoles over the entrance
    for (const dx of DOORS)
      spill.add(dx, FZ - 2.2, 0xffc890, 3.2, {
        y: 0.14,
        i: dx === DOORS[1] ? 0.55 : 0.3,
        sx: 4,
        sz: 3,
      });
    {
      const ckx = DOORS[1],
        cky = 11.4,
        ckz = FZ - 0.42;
      d.geo("bronze", K.T.torusThick, {
        x: ckx,
        y: cky,
        z: ckz - 0.05,
        s: 1.15,
      });
      d.panel("atlas_paint_glow", ckx, cky, ckz, 2.2, 2.2, PI, {
        rect: K.paint("sterlings_clock", 256, 256),
      });
      d.box("bronze", ckx, cky - 1.9, ckz + 0.05, 0.6, 0.7, 0.2, {
        grime: 0.4,
      });
      glows.add(ckx, cky, ckz - 0.9, 0xfff0d0, "m");
      for (const fx of [-11, -7, 1, 5]) {
        d.beam("metal", fx, 10.2, FZ - 0.3, fx, 12.0, FZ - 3.0, 0.07, {
          round: 6,
        });
        d.geo("gold", K.T.sphereLo, { x: fx, y: 12.05, z: FZ - 3.08, s: 0.12 });
        d.face(
          "flags_static",
          fx,
          10.3,
          FZ - 0.9,
          0,
          0,
          -1,
          0,
          1,
          0,
          1.9,
          1.2,
          {
            uv: "rect",
            rect: K.flag(fx < 0 ? "usa" : "usa", null),
            su: 1,
            sv: 1,
            grime: 0.35,
          },
        );
      }
    }
    // awnings over the display windows (north front + Herald Square front)
    const aw = K.paint("awning_stripe", 256, 256);
    for (const op of dispOps) {
      const cx = BLD.x0 - 0.3 + op.at;
      d.face(
        "atlas_paint",
        cx + 2.1,
        4.9,
        FZ - 1.9,
        -1,
        0,
        0,
        0,
        0.55,
        0.83,
        4.2,
        2.1,
        { uv: "rect", rect: aw, su: 1, sv: 1, grime: 0.4 },
      );
    }
    for (const op of eOps) {
      const cz = HOLD.z1 + op.at;
      d.face(
        "atlas_paint",
        BLD.x1 + 1.9,
        4.9,
        cz + 2.1,
        0,
        0,
        -1,
        -0.83,
        0.55,
        0,
        4.2,
        2.1,
        { uv: "rect", rect: aw, su: 1, sv: 1, grime: 0.4 },
      );
    }
    // big crown sign + store bands
    b.panel("atlas_paint", -4, 33, FZ - 0.35, 22, 5.5, PI, {
      rect: K.paint("sterlings_sign", 1024, 256),
    });
    b.panel("atlas_paint", -4, 8.3, FZ - 0.37, 26, 2.4, PI, {
      rect: K.paint("sterlings_band", 1024, 96),
    });
    d.panel(
      "atlas_paint",
      BLD.x1 + 0.37,
      8.3,
      (HOLD.z1 + BLD.z1) / 2,
      17,
      1.6,
      PI / 2,
      { rect: K.paint("sterlings_band", 1024, 96) },
    );
    b.panel("atlas_paint", BLD.x1 + 0.35, 31, -70, 16, 4, PI / 2, {
      rect: K.paint("sterlings_sign", 1024, 256),
    });
    // floodlights on the big north sign (dead-ish by day)
    for (let k = -2; k <= 2; k++) {
      d.beam(
        "black_metal",
        -4 + k * 4.4,
        29.6,
        FZ - 0.2,
        -4 + k * 4.4,
        29.9,
        FZ - 1.4,
        0.05,
      );
      glows.add(-4 + k * 4.4, 29.9, FZ - 1.5, 0xfff0d0, "m");
    }

    // ---- the holdout at 34th & Broadway: 4-storey brick wedge under a giant shopping-bag billboard ----
    {
      b.boxMM(
        "fac_sterlings_hold",
        HOLD.x0,
        0,
        HOLD.z0,
        HOLD.x1,
        HOLD.h,
        HOLD.z1,
        { faces: "net" },
      );
      b.boxMM(
        "limestone_dark",
        HOLD.x0 - 0.35,
        HOLD.h - 0.6,
        HOLD.z0 - 0.35,
        HOLD.x1 + 0.35,
        HOLD.h,
        HOLD.z1 + 0.35,
        { faces: "nsewtb" },
      );
      b.panel(
        "shopfront",
        (HOLD.x0 + HOLD.x1) / 2,
        2.2,
        HOLD.z0 - 0.03,
        4.2,
        3.6,
        PI,
        { rect: K.shopRect(1) },
      );
      b.panel(
        "shopfront",
        HOLD.x1 + 0.03,
        2.2,
        (HOLD.z0 + HOLD.z1) / 2,
        4.2,
        3.6,
        PI / 2,
        { rect: K.shopRect(4) },
      );
      const bag = K.paint("sterlings_bag", 512, 640);
      const bw = HOLD.x1 - HOLD.x0 - 0.8,
        bh = bw * 1.25;
      d.box(
        "black_metal",
        (HOLD.x0 + HOLD.x1) / 2,
        4.3,
        HOLD.z0 - 0.35,
        bw + 0.3,
        bh + 0.3,
        0.2,
        { grime: 0.4 },
      );
      d.panel(
        "atlas_paint",
        (HOLD.x0 + HOLD.x1) / 2,
        4.45 + bh / 2,
        HOLD.z0 - 0.47,
        bw,
        bh,
        PI,
        { rect: bag },
      );
      d.box(
        "black_metal",
        HOLD.x1 + 0.35,
        4.3,
        (HOLD.z0 + HOLD.z1) / 2,
        0.2,
        bh + 0.3,
        bw + 0.3,
        { grime: 0.4 },
      );
      d.panel(
        "atlas_paint",
        HOLD.x1 + 0.47,
        4.45 + bh / 2,
        (HOLD.z0 + HOLD.z1) / 2,
        bw,
        bh,
        PI / 2,
        { rect: K.paint("sterlings_parade", 512, 640) },
      );
      for (let k = -1; k <= 1; k++) {
        glows.add(
          (HOLD.x0 + HOLD.x1) / 2 + k * 2.6,
          4.1,
          HOLD.z0 - 1.4,
          0xfff0d0,
          "m",
        );
        d.beam(
          "black_metal",
          (HOLD.x0 + HOLD.x1) / 2 + k * 2.6,
          4.0,
          HOLD.z0 - 0.4,
          (HOLD.x0 + HOLD.x1) / 2 + k * 2.6,
          4.1,
          HOLD.z0 - 1.4,
          0.05,
        );
      }
      K.parts.waterTower(d, HOLD.x0 + 3.2, HOLD.h - 0.3, HOLD.z1 - 3.4, 1.7);
    }
    // 32nd St: loading dock (shutters, dock lip, a dead delivery truck bay)
    for (const sx of [-14, -6, 4]) {
      b.panel("shopfront", sx, 2.2, BLD.z1 + 0.34, 3.8, 3.8, 0, {
        rect: K.shopRect(4),
      });
      d.boxMM(
        "concrete",
        sx - 2.3,
        0,
        BLD.z1 + 0.3,
        sx + 2.3,
        1.1,
        BLD.z1 + 0.35,
        { grime: 0.8 },
      );
    }
    // rooftop water tower + ventilators
    K.parts.waterTower(d, -18, BLD.h, -69, 2.8);
    for (const v of [
      [4, -65],
      [12, -79],
      [-8, -81],
    ])
      d.box("metal", v[0], BLD.h, v[1], 2.2, 1.4, 1.6, { grime: 0.6 });

    // ---- sales floor: 95_sterlings_interior.js ----
    K.interior("sterlings", {
      rec,
      b,
      d,
      glows,
      green,
      P,
      LIME,
      mannequin,
      Z,
      R,
      PI,
      BLD,
      FL,
    });
    // exterior: wrecks, rubble and lamps along 34th St
    P.car(d, 31.5, -94, 1.4, { seed: 96 });
    P.rubblePile(d, -26, FZ - 1.4, 1.5, 1.0, { seed: 97 });
    for (const lp of [
      [-22, FZ - 2.2],
      [5, FZ - 2.2],
      [18.5, FZ - 2.2],
    ])
      P.lampPost(d, glows, lp[0], lp[1], 4.2, { broken: lp[0] === 5 });

    // ---- anchors ----
    rec.anchor("entrance", DOORS[1], 0, FZ - 2.6, PI);
    rec.anchor("entrance_west", DOORS[0], 0, FZ - 2.6, PI);
    rec.anchor("entrance_east", DOORS[2], 0, FZ - 2.6, PI);
    rec.anchor("window1", DOORS[0] + 5.6, 0, FZ - 2, PI);
    rec.anchor("display", DOORS[0] + 5.6, 0, FZ - 2, 0);
    rec.anchor("holdout", (HOLD.x0 + HOLD.x1) / 2, 0, HOLD.z0 - 2, PI);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 260 });
    glows.finish(rec.root, { dayOpacity: 0.5 });
    green.finish(rec.root, { dayOpacity: 0.7, nightOpacity: 1, flicker: 0.2 });
    spill.finish(rec.root, { day: 0.05, night: 1 });
  }

