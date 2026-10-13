// play-inline-175 04 — tint
// Lines 542-990 of readable/play-inline-175.pretty.js (statement-aligned).
  function buildExterior(rec) {
    const s = K.site("waldorf");
    const b = K.builder("waldorf_ext", { grime: 0.55 });
    const glows = K.glowSet("waldorf_ext");
    const X0 = s.x0,
      X1 = s.x1,
      Z0 = s.z0,
      Z1 = s.z1; // 210..270, -359..-326
    const cz = (Z0 + Z1) / 2;
    // --- podium: limestone base 0..8.4, brick 8.4..24 ---
    K.block(b, "wa_stone", X0, Z0, X1, Z1, 0, 8.4, { roof: false, col: false });
    K.block(b, "wa_brick", X0 + 0.4, Z0 + 0.4, X1 - 0.4, Z1 - 0.4, 8.4, 24, {
      roof: "concrete_dark",
      col: false,
    });
    K.colBox(X0, 0, Z0, X1, 24, Z1, { surface: "concrete" });
    K.band(b, "limestone", X0, Z0, X1, Z1, 8.2, 0.6, 0.35);
    K.band(
      b,
      "limestone",
      X0 + 0.4,
      Z0 + 0.4,
      X1 - 0.4,
      Z1 - 0.4,
      23.4,
      0.8,
      0.3,
    );
    // rusticated plinth
    K.band(b, "granite", X0, Z0, X1, Z1, 0, 1.2, 0.2, { faces: "nsewt" });
    // deco piers on the brick podium — on the bay BOUNDARIES of the window grid (never across a window) —
    // and real 3D window surrounds on the limestone base (hood + keystone) and the brick podium (sill + lintel)
    const portalSkip = (x, z, y, f) =>
      (f === "w" && Math.abs(z - cz) < 8.2 && y < 12) ||
      ((f === "n" || f === "s") && Math.abs(x - 240) < 4 && y < 5);
    K.reveals(b, "wa_stone", X0, Z0, X1, Z1, 0, 8.4, {
      tint: 0xe0d8c4,
      proj: 0.18,
      hood: "cornice",
      keystone: true,
      skip: portalSkip,
    });
    K.reveals(b, "wa_brick", X0 + 0.4, Z0 + 0.4, X1 - 0.4, Z1 - 0.4, 8.4, 24, {
      tint: 0xd8ccb0,
      proj: 0.12,
      maxY: 23.4,
      skip: portalSkip,
      piers: {
        mat: "brick_tan",
        tint: 0xc8b08a,
        w: 0.5,
        d: 0.5,
        y0: 8.8,
        y1: 23.4,
        skip: (x, z, f) => f === "w" && Math.abs(z - cz) < 7,
      },
    });
    // --- slab (setback 1) 24..44 ---
    K.block(b, "wa_brick", X0 + 6, Z0 + 3.5, X1 - 4, Z1 - 3.5, 24, 44, {
      roof: "concrete_dark",
    });
    K.reveals(b, "wa_brick", X0 + 6, Z0 + 3.5, X1 - 4, Z1 - 3.5, 24, 44, {
      tint: 0xd8ccb0,
      proj: 0.1,
      maxY: 43.4,
      jambs: false,
    });
    K.band(b, "limestone", X0 + 6, Z0 + 3.5, X1 - 4, Z1 - 3.5, 43.4, 0.7, 0.25);
    // --- central shaft 44..72 ---
    K.block(b, "wa_brick", X0 + 14, Z0 + 6, X1 - 8, Z1 - 6, 44, 72, {
      roof: "concrete_dark",
    });
    K.band(b, "limestone", X0 + 14, Z0 + 6, X1 - 8, Z1 - 6, 71.3, 0.8, 0.3);
    // vertical deco ribs on the shaft (the Waldorf's strong verticals)
    K.reveals(b, "wa_brick", X0 + 14, Z0 + 6, X1 - 8, Z1 - 6, 44, 72, {
      maxY: 0,
      faces: "nsw",
      piers: {
        mat: "brick_tan",
        tint: 0xd0b890,
        w: 0.55,
        d: 0.6,
        y0: 44,
        y1: 71.4,
      },
    });
    // --- low link block between the towers 72..78 (kept low so the TWIN towers read as two from Park Ave) ---
    K.block(b, "wa_brick", X0 + 20, Z0 + 13.5, X1 - 16, Z1 - 13.5, 72, 78, {
      roof: "concrete_dark",
    });
    K.band(
      b,
      "limestone",
      X0 + 20,
      Z0 + 13.5,
      X1 - 16,
      Z1 - 13.5,
      77.5,
      0.5,
      0.25,
    );
    // --- TWIN TOWERS (north & south): 72..94 shaft with setback, octagonal lantern, copper cap, spire ---
    const towers = [
      [245, Z0 + 9.8],
      [245, Z1 - 9.8],
    ];
    const TY = 94; // top of the square shaft
    for (const tw of towers) {
      const tx = tw[0],
        tz = tw[1];
      K.block(
        b,
        "wa_brick",
        tx - 5.2,
        tz - 3.8,
        tx + 5.2,
        tz + 3.8,
        72,
        TY - 6,
        { roof: "concrete_dark" },
      );
      K.block(
        b,
        "wa_brick",
        tx - 4.2,
        tz - 3.1,
        tx + 4.2,
        tz + 3.1,
        TY - 6,
        TY,
        { roof: "concrete_dark", col: false },
      );
      // chamfered corners (setback piers) and vertical deco ribs
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
          b.box(
            "limestone",
            tx + sx * 4.8,
            72,
            tz + sz * 3.4,
            1.2,
            TY - 6 - 72 + 0.4,
            1.2,
            { tint: 0xd8ccb0 },
          );
          b.box(
            "limestone",
            tx + sx * 3.9,
            TY - 6,
            tz + sz * 2.8,
            1.0,
            6.4,
            1.0,
            { tint: 0xd8ccb0 },
          );
        }
      K.reveals(
        b,
        "wa_brick",
        tx - 5.2,
        tz - 3.8,
        tx + 5.2,
        tz + 3.8,
        72,
        TY - 6,
        {
          maxY: 0,
          faces: "ns",
          piers: {
            mat: "brick_tan",
            tint: 0xd0b890,
            w: 0.45,
            d: 0.3,
            y0: 72,
            y1: TY - 6,
          },
        },
      );
      K.band(
        b,
        "limestone",
        tx - 5.2,
        tz - 3.8,
        tx + 5.2,
        tz + 3.8,
        TY - 6.4,
        0.6,
        0.35,
      );
      K.band(
        b,
        "limestone",
        tx - 4.2,
        tz - 3.1,
        tx + 4.2,
        tz + 3.1,
        TY - 0.4,
        0.7,
        0.35,
      );
      // octagonal stages
      const OY = TY + 0.3;
      b.cyl("limestone", tx, OY, tz, 3.5, 3.25, 3.6, 8, {
        yaw: PI / 8,
        tint: 0xd8ccb0,
      });
      b.cyl("bronze", tx, OY + 3.6, tz, 3.35, 3.35, 0.5, 8, { yaw: PI / 8 });
      // lantern with arched openings: 8 piers + dark core
      b.cyl("black", tx, OY + 4.1, tz, 2.4, 2.4, 5.0, 8, {
        yaw: PI / 8,
        grime: 0,
      });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * PI * 2;
        b.box(
          "limestone",
          tx + Math.cos(a) * 2.75,
          OY + 4.1,
          tz + Math.sin(a) * 2.75,
          0.7,
          5.0,
          0.7,
          { yaw: -a, tint: 0xd0c4a8 },
        );
      }
      b.cyl("bronze", tx, OY + 9.1, tz, 3.2, 3.0, 0.7, 8, { yaw: PI / 8 });
      // copper / bronze cap: stepped octagonal dome + spire (verdigris green)
      b.cyl("copper", tx, OY + 9.8, tz, 2.9, 1.8, 2.6, 8, {
        yaw: PI / 8,
        tint: 0x7aa890,
      });
      b.cyl("copper", tx, OY + 12.4, tz, 1.8, 0.7, 2.6, 8, {
        yaw: PI / 8,
        tint: 0x7aa890,
      });
      b.cyl("bronze", tx, OY + 15.0, tz, 0.8, 0.45, 1.2, 8, { yaw: PI / 8 });
      b.cyl("bronze", tx, OY + 16.2, tz, 0.32, 0.04, 6.5, 6);
      b.geo("gold", T.sphereLo, { x: tx, y: OY + 17.5, z: tz, s: 0.42 });
      glows.add(tx, OY + 22.8, tz, 0xff4030, "s"); // aircraft warning lamp (still on — Continuity power)
      // lit lantern windows (Continuity generators) — faint warm glow inside the lantern
      glows.add(tx, OY + 6.6, tz, 0xffb060, "l");
    }
    // Continuity antenna farm on the upper block roof
    for (let i = 0; i < 5; i++) {
      const ax = X0 + 22 + i * 4.2,
        az = cz + (i % 2 ? 2.5 : -2.5),
        hh = 10 + (i % 3) * 5;
      b.beam("black_metal", ax, 78, az, ax, 78 + hh, az, 0.18);
      for (let k = 1; k < 4; k++)
        b.beam(
          "black_metal",
          ax - 0.9,
          78 + (hh * k) / 4,
          az,
          ax + 0.9,
          78 + (hh * k) / 4,
          az,
          0.06,
        );
      b.cable("black_metal", ax, 78 + hh, az, ax + 3, 78, az + 3, 0.2, 0.03, 4);
      glows.add(ax, 78 + hh + 0.2, az, 0xff3020, "s");
    }
    // radar dish
    b.cyl("black_metal", X0 + 42, 78, cz, 0.3, 0.3, 3, 8);
    b.geo(
      "metal",
      new THREE.SphereGeometry(2.2, 12, 6, 0, PI * 2, 0, PI / 2.6),
      { x: X0 + 42, y: 82.5, z: cz, rx: -1.1, ry: 0.6, tint: 0xd0d4d0 },
    );
    // --- PARK AVENUE PORTAL (west face, x = X0) ---
    const px = X0,
      pz = cz;
    // recessed entrance bay: dark vestibule + limestone frame
    b.box("limestone", px - 0.9, 0, pz, 1.8, 11.2, 15, {
      faces: "nsewt",
      tint: 0xe0d8c4,
    });
    b.box("black", px - 1.82, 0, pz, 0.04, 8.2, 10.4, { faces: "w", grime: 0 });
    for (const sz of [-1, 0, 1]) {
      // bronze doors (three arched bays)
      const dz = pz + sz * 3.5;
      b.box("bronze", px - 1.9, 0, dz, 0.12, 4.2, 2.6, { tint: 0x9a7040 });
      b.box("glass", px - 1.98, 1.1, dz, 0.04, 2.8, 2.1, {
        grime: 0.2,
        faces: "w",
      });
      b.box("bronze", px - 1.99, 4.2, dz, 0.1, 3.4, 2.9, { tint: 0x7a5a30 });
      for (let k = 0; k < 7; k++)
        b.beam(
          "gold",
          px - 2.05,
          4.3,
          dz,
          px - 2.05,
          4.3 + Math.sin((k / 6) * PI) * 3,
          dz + Math.cos((k / 6) * PI) * 1.4,
          0.05,
          { grime: 0.2 },
        );
    }
    // gold lettering above the portal
    const tr = K.paint("wa_title", 1400, 160);
    b.panel("atlas_paint", px - 1.84, 9.3, pz, 13.2, 1.5, -HP, {
      rect: tr,
      grime: 0,
    });
    // Spirit of Achievement figure (stylised bronze): torso, raised arms, wings of drapery
    const fx = px - 1.9,
      fy = 11.2;
    b.box("limestone", fx + 0.3, fy, pz, 1.4, 0.6, 2.2, { tint: 0xd8ccb0 });
    b.geo("bronze", T.cone8, {
      x: fx,
      y: fy + 1.6,
      z: pz,
      sx: 0.55,
      sy: 2.2,
      sz: 0.5,
      rx: PI,
      tint: 0x6a8a70,
    });
    b.geo("bronze", T.sphereLo, {
      x: fx,
      y: fy + 2.9,
      z: pz,
      s: 0.3,
      tint: 0x6a8a70,
    });
    for (const sgn of [-1, 1]) {
      b.beam(
        "bronze",
        fx,
        fy + 2.5,
        pz + sgn * 0.3,
        fx - 0.2,
        fy + 3.9,
        pz + sgn * 0.9,
        0.16,
        { tint: 0x6a8a70 },
      );
      b.quad(
        "bronze",
        [fx + 0.1, fy + 0.4, pz + sgn * 0.3],
        [fx + 0.1, fy + 0.8, pz + sgn * 1.6],
        [fx + 0.1, fy + 3.4, pz + sgn * 1.1],
        [fx + 0.1, fy + 2.6, pz + sgn * 0.35],
        { tint: 0x5a7a60, double: true },
      );
    }
    // marquee canopy over the sidewalk (bent, one support collapsed)
    b.box("bronze", px - 3.6, 4.6, pz, 3.6, 0.45, 12, { tint: 0x5a4a30 });
    b.box("black_metal", px - 3.6, 4.55, pz, 3.5, 0.05, 11.8, { faces: "b" });
    for (let k = -5; k <= 5; k += 2)
      glows.add(px - 3.8, 4.45, pz + k, 0xffc070, "s");
    const ts = K.paint("wa_title_small", 900, 120);
    b.panel("atlas_paint", px - 5.42, 4.85, pz, 8.5, 0.42, -HP, {
      rect: ts,
      grime: 0,
    });
    b.beam("black_metal", px - 5.2, 0, pz + 5.6, px - 5.2, 4.6, pz + 5.6, 0.12);
    b.beam("black_metal", px - 5.2, 0, pz - 5.6, px - 4.4, 3.1, pz - 6.2, 0.12);
    K.colBox(px - 5.35, 0, pz + 5.45, px - 5.05, 4.6, pz + 5.75, {
      surface: "metal",
    });
    // Continuity banners hanging from the podium cornice, flanking the portal
    const fr = K.flag("wa_continuity", 256, 500);
    for (const dz of [-10.5, 10.5, -21, 21]) {
      const z = pz + dz;
      if (z < Z0 + 1 || z > Z1 - 1) continue;
      b.quad(
        "flags",
        [X0 - 0.35, 12.5, z - 1.4],
        [X0 - 0.35, 12.5, z + 1.4],
        [X0 - 0.35, 22.8, z + 1.4],
        [X0 - 0.35, 22.8, z - 1.4],
        { rect: [fr[0], fr[1], fr[2], fr[3]], double: true },
      );
      b.beam(
        "black_metal",
        X0 - 0.4,
        22.9,
        z - 1.6,
        X0 - 0.4,
        22.9,
        z + 1.6,
        0.08,
      );
    }
    for (const dz of [-8, 8]) {
      const z = pz + dz;
      b.quad(
        "flags",
        [X0 + 5.6, 26, z - 1.2],
        [X0 + 5.6, 26, z + 1.2],
        [X0 + 5.6, 34, z + 1.2],
        [X0 + 5.6, 34, z - 1.2],
        { rect: [fr[0], fr[1], fr[2], fr[3]], double: true },
      );
    }
    // Continuity checkpoint: sandbag horseshoe + barrier arm across the Park Avenue sidewalk
    F.sandbags(b, px - 7.5, 0, pz - 7.5, HP, 4, 3);
    F.sandbags(b, px - 7.5, 0, pz + 7.5, HP, 4, 3);
    F.sandbags(b, px - 9.2, 0, pz - 5.2, 0, 3, 3);
    b.box("paint_white", px - 8.2, 1.0, pz + 1, 0.12, 0.12, 6.5, {
      tint: 0xe0dcd0,
      grime: 0.4,
    });
    for (let k = 0; k < 6; k++)
      b.box("paint_red", px - 8.2, 1.0, pz - 1.8 + k * 1.1, 0.13, 0.13, 0.5, {
        grime: 0.3,
      });
    b.box("black_metal", px - 8.2, 0, pz - 2.4, 0.3, 1.1, 0.3);
    // rubble, collapsed north-east podium corner, scorched windows
    F.debris(b, X1 - 4, 0, Z0 + 1, 3.5, 18, {
      mound: true,
      col: true,
      colH: 1.2,
    });
    b.box("brick_tan", X1 - 5, 24, Z0 + 3.5, 5, 1.6, 4, {
      yaw: 0.3,
      tint: 0x9a8a70,
    });
    b.burn(X0, 16, pz + 18, 8, 0.8);
    b.burn(X1, 40, Z0 + 10, 10, 0.7);
    for (const z of [Z0 + 3, Z1 - 3]) F.debris(b, X0 - 1.5, 0, z, 2.2, 8);
    // south & north side entrances (49th / 50th St): boarded
    for (const z of [Z0, Z1]) {
      const sgn = z === Z0 ? -1 : 1;
      b.box("wood_rotten", 240, 0, z + sgn * 0.1, 5, 4, 0.2, {
        tint: 0x7a6248,
      });
      b.box("limestone", 240, 4, z + sgn * 0.3, 6.5, 0.8, 0.6, {
        tint: 0xd8ccb0,
      });
    }
    b.finish(rec.root, { lod: 1400 });
    glows.finish(rec.root, { dayOpacity: 0.3, nightOpacity: 1, flicker: 0.1 });
    // anchors (exterior)
    rec.anchor("entrance", px - 3.5, 0, pz, -HP);
    rec.anchor("checkpoint", px - 8, 0, pz + 3, -HP);
    rec.anchor("roof", 245, 78, cz, 0);
    return {
      doorPos: new THREE.Vector3(px - 2.3, 1.6, pz),
      outside: { x: px - 4.2, y: 0, z: pz, yaw: HP },
    };
  }

  // ------------------------------------------------------------------
  // INTERIOR
  // ------------------------------------------------------------------
