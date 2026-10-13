// play-inline-180 05 — tcz
// Lines 648-1000 of readable/play-inline-180.pretty.js (statement-aligned).
  function buildExterior(rec) {
    const s = K.site("metlife_tower");
    const b = K.builder("ml_ext", { grime: 0.5 });
    const glows = K.glowSet("ml_ext");
    const X0 = s.x0,
      X1 = s.x1,
      Z0 = s.z0,
      Z1 = s.z1; // 210..270, 47..78
    const TX0 = X0 + 2,
      TX1 = X0 + 26,
      TZ0 = (Z0 + Z1) / 2 - 12,
      TZ1 = (Z0 + Z1) / 2 + 12; // tower 24 × 24
    const tcx = (TX0 + TX1) / 2,
      tcz = (TZ0 + TZ1) / 2;
    const marble = 0xe4e0d4,
      marble2 = 0xd4d0c4;
    // annex (Home Office)
    K.block(b, "ml_annex", TX1, Z0, X1, Z1, 0, 34, {
      roof: "concrete_dark",
      col: true,
    });
    K.band(b, "marble_t", TX1, Z0, X1, Z1, 33, 1.2, 0.5, { tint: marble });
    K.band(b, "marble_t", TX1, Z0, X1, Z1, 0, 4, 0.2, {
      tint: marble2,
      faces: "nsewt",
    }); // backing wall of the ground storey
    annexGround(b, glows, TX1, Z0, X1, Z1, marble, marble2);
    // 3D window surrounds on the Home Office annex (cornice hoods, jambs) — the tower hides its west face
    K.reveals(b, "ml_annex", TX1, Z0, X1, Z1, 4, 34, {
      faces: "nse",
      tint: marble,
      proj: 0.14,
      hood: "cornice",
      maxY: 32.8,
    });
    K.roofKit(b, TX1 + 1, Z0 + 1, X1 - 1, Z1 - 1, 34.02, "ml_roof", { n: 5 }); // seen from the loggia lookout
    // tower base (rusticated) with the arcaded Madison Avenue entrance
    b.box("marble_t", tcx, 0, tcz, 24.6, 9, 24.6, { tint: marble2, seg: 3 });
    K.colBox(TX0 - 0.3, 0, TZ0 - 0.3, TX1 + 0.3, 9, TZ1 + 0.3, {
      surface: "concrete",
    });
    for (let y = 1.5; y < 9; y += 1.5)
      K.band(b, "marble_t", TX0, TZ0, TX1, TZ1, y, 0.12, 0.34, {
        tint: 0xb8b4a8,
        faces: "nsew",
      });
    for (const dz of [-6, 0, 6]) {
      const z = tcz + dz;
      b.box("black", TX0 - 0.32, 0, z, 0.04, 5.2, 3.6, {
        faces: "w",
        grime: 0,
      });
      b.geo("marble_t", new THREE.TorusGeometry(1.95, 0.3, 4, 12, PI), {
        x: TX0 - 0.35,
        y: 5.2,
        z,
        ry: HP,
        tint: marble,
      });
      b.box("marble_t", TX0 - 0.45, 0, z - 2.15, 0.5, 5.2, 0.5, {
        tint: marble,
      });
      b.box("marble_t", TX0 - 0.45, 0, z + 2.15, 0.5, 5.2, 0.5, {
        tint: marble,
      });
    }
    towerBaseWindows(b, TX0, TX1, TZ0, TZ1, tcz, marble);
    const nm = K.paint("ml_name", 1600, 200);
    b.panel("atlas_paint", TX0 - 0.36, 7.9, tcz, 16, 2.0, -HP, {
      rect: nm,
      grime: 0.2,
    });
    // shaft 9..SY with corner piers and belt courses (the campanile is tall and slender)
    const SH = 16,
      SY = 64 + SH;
    K.block(b, "ml_shaft", TX0 + 0.4, TZ0 + 0.4, TX1 - 0.4, TZ1 - 0.4, 9, SY, {
      roof: false,
      col: true,
      seg: 8,
    });
    for (const cx of [TX0 + 1.1, TX1 - 1.1])
      for (const cz of [TZ0 + 1.1, TZ1 - 1.1])
        b.box("marble_t", cx, 9, cz, 2.3, SY - 9, 2.3, {
          tint: marble,
          seg: 8,
        });
    // projecting marble sills + lintels on the campanile's lower shaft (what you see from Madison Square)
    K.reveals(
      b,
      "ml_shaft",
      TX0 + 0.4,
      TZ0 + 0.4,
      TX1 - 0.4,
      TZ1 - 0.4,
      9,
      SY,
      {
        tint: marble,
        proj: 0.12,
        jambs: false,
        maxY: 41,
        skip: (x, z, y, f) =>
          f === "n" || f === "s"
            ? x < TX0 + 2.6 || x > TX1 - 2.6
            : z < TZ0 + 2.6 || z > TZ1 - 2.6,
      },
    );
    for (const by of [21.8, 41, 60.2])
      K.band(
        b,
        "marble_t",
        TX0 + 0.2,
        TZ0 + 0.2,
        TX1 - 0.2,
        TZ1 - 0.2,
        by,
        0.5,
        0.22,
        { tint: 0xd0ccc0, faces: "nsewt" },
      );
    K.band(b, "marble_t", TX0, TZ0, TX1, TZ1, SY - 0.6, 1.2, 0.6, {
      tint: marble,
    });
    // clock stage 64..78 with four giant dials
    b.box("marble_t", tcx, SY + 0.6, tcz, 24, 13.4, 24, {
      tint: marble2,
      seg: 4,
    });
    const dr = K.litPaint("ml_dial", 512, 512);
    for (let i = 0; i < 4; i++) {
      const a = i * HP,
        nx = Math.sin(a),
        nz = Math.cos(a);
      b.geo("marble_t", new THREE.TorusGeometry(5.9, 0.45, 5, 32), {
        x: tcx + nx * 12.05,
        y: SY + 7.2,
        z: tcz + nz * 12.05,
        ry: a,
        tint: 0xc8c4b8,
      });
      const cg = new THREE.CircleGeometry(5.6, 40);
      b.geo("atlas_lit", cg, {
        x: tcx + nx * 12.08,
        y: SY + 7.2,
        z: tcz + nz * 12.08,
        ry: a,
        uv: "rect",
        rect: dr,
      });
      cg.dispose();
      glows.add(tcx + nx * 12.6, SY + 7.2, tcz + nz * 12.6, 0xfff4d8, "l");
    }
    for (const cx of [TX0 + 1.1, TX1 - 1.1])
      for (const cz of [TZ0 + 1.1, TZ1 - 1.1])
        b.box("marble_t", cx, SY + 0.6, cz, 2.6, 13.4, 2.6, { tint: marble });
    K.band(b, "marble_t", TX0, TZ0, TX1, TZ1, SY + 13.6, 0.8, 0.7, {
      tint: marble,
    });
    // loggia stage 78.4..86: open arcade (3 arches per side) round a solid core; walkable floor at 78.4
    const LY = SY + 14.4,
      LH = 7.2;
    b.box("marble_t", tcx, LY - 0.4, tcz, 24.6, 0.4, 24.6, {
      faces: "tb",
      tint: marble,
    });
    K.colBox(TX0, LY - 0.6, TZ0, TX1, LY, TZ1, { surface: "concrete" });
    b.box("marble_t", tcx, LY, tcz, 16, LH, 16, { tint: marble2 }); // core
    K.colBox(tcx - 8, LY, tcz - 8, tcx + 8, LY + LH, tcz + 8, {
      surface: "concrete",
    });
    for (let i = 0; i < 4; i++) {
      const a = i * HP,
        nx = Math.sin(a),
        nz = Math.cos(a),
        ux = Math.cos(a),
        uz = -Math.sin(a);
      for (const u of [-11.3, -3.9, 3.9, 11.3]) {
        const px = tcx + nx * 11.4 + ux * u,
          pz = tcz + nz * 11.4 + uz * u;
        b.box("marble_t", px, LY, pz, 1.3, LH - 1.6, 1.3, {
          yaw: a,
          tint: marble,
        });
        K.colBox(px - 0.65, LY, pz - 0.65, px + 0.65, LY + LH, pz + 0.65, {
          surface: "concrete",
        });
      }
      for (const u of [-7.6, 0, 7.6]) {
        const px = tcx + nx * 11.4 + ux * u,
          pz = tcz + nz * 11.4 + uz * u;
        b.geo("marble_t", new THREE.TorusGeometry(3.05, 0.55, 4, 12, PI), {
          x: px,
          y: LY + LH - 1.6 - 3.05 + 3.05,
          z: pz,
          ry: a,
          tint: marble,
          sy: 0.55,
        });
      }
      b.box(
        "marble_t",
        tcx + nx * 11.4,
        LY + LH - 1.6,
        tcz + nz * 11.4,
        24,
        1.6,
        1.4,
        { yaw: a, faces: "nsewtb", tint: marble, sy: 1 },
      );
      // balustrade
      const bl = F.rot(tcx + nx * 11.9, tcz + nz * 11.9, a, 0, 0);
      b.box("marble_t", bl[0], LY, bl[1], 22, 0.95, 0.35, {
        yaw: a,
        tint: marble2,
      });
      K.colRot(bl[0], bl[1], 23, 0.4, LY, LY + 1.05, a, {
        surface: "concrete",
        tag: "railing",
      });
    }
    b.box("marble_t", tcx, LY + LH, tcz, 25, 0.8, 25, {
      faces: "nsewtb",
      tint: marble,
    });
    // gilded pyramid roof + lantern cupola + beacon
    const PYH = 19;
    b.geo("gold", T.cone4, {
      x: tcx,
      y: LY + LH + 0.8 + PYH / 2,
      z: tcz,
      sx: 17.2,
      sy: PYH,
      sz: 17.2,
      ry: PI / 4,
      tint: 0xd8b060,
    });
    // dormer lucarnes on the four pyramid faces (two tiers)
    for (let i = 0; i < 4; i++) {
      const a = i * HP,
        nx = Math.sin(a),
        nz = Math.cos(a);
      for (const tier of [
        [0.22, 2.2, 1.6],
        [0.5, 1.5, 1.1],
      ]) {
        const hy = LY + LH + 0.8 + PYH * tier[0],
          inset = 12.1 * (1 - tier[0]) - 0.4;
        b.box(
          "marble_t",
          tcx + nx * inset,
          hy,
          tcz + nz * inset,
          tier[1],
          tier[2],
          1.2,
          { yaw: a, tint: marble },
        );
        b.box(
          "black",
          tcx + nx * (inset + 0.61),
          hy + 0.2,
          tcz + nz * (inset + 0.61),
          tier[1] * 0.55,
          tier[2] * 0.6,
          0.02,
          { yaw: a, grime: 0, faces: "s" },
        );
        b.geo("gold", T.cone4, {
          x: tcx + nx * inset,
          y: hy + tier[2] + 0.35,
          z: tcz + nz * inset,
          sx: tier[1] * 0.75,
          sy: 0.7,
          sz: 0.9,
          ry: a + PI / 4,
          tint: 0xc8a050,
        });
      }
    }
    const CY0 = LY + LH + 0.8 + PYH;
    b.cyl("marble_t", tcx, CY0 - 1, tcz, 3.2, 3.0, 1.2, 8, { tint: marble });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2;
      b.cyl(
        "marble_t",
        tcx + Math.cos(a) * 2.6,
        CY0,
        tcz + Math.sin(a) * 2.6,
        0.22,
        0.2,
        3.2,
        8,
        { tint: marble },
      );
    }
    b.cyl("black", tcx, CY0, tcz, 2.2, 2.2, 3.2, 8, { grime: 0 });
    b.cyl("gold", tcx, CY0 + 3.2, tcz, 3.1, 3.1, 0.4, 8, { tint: 0xd8b060 });
    b.geo("gold", new THREE.SphereGeometry(2.6, 12, 6, 0, PI * 2, 0, PI / 2), {
      x: tcx,
      y: CY0 + 3.6,
      z: tcz,
      tint: 0xe0b860,
    });
    b.cyl("gold", tcx, CY0 + 6.1, tcz, 0.4, 0.2, 2.2, 8, { tint: 0xe0b860 });
    b.geo("lamp_warm", T.sphereLo, {
      x: tcx,
      y: CY0 + 8.6,
      z: tcz,
      s: 0.55,
      grime: 0,
    });
    glows.add(tcx, CY0 + 8.6, tcz, 0xfff0c0, "xl");
    glows.add(tcx, CY0 + 1.6, tcz, 0xffd890, "l");
    // Madison Square side: planters & a toppled bench; robots' "SECURITY" barricade at the entrance
    F.debris(b, TX0 - 4, 0, TZ0 - 2, 2.4, 12);
    // two checkpoint barriers flanking a 3.6 m gap in front of the central (entrance) arch — the door stays reachable
    for (const sg of [-1, 1]) {
      const zc = tcz + sg * 3.3;
      b.box("paint_yellow", TX0 - 3, 0, zc, 0.4, 1.0, 3.0, { tint: 0xb89830 });
      for (let k = 0; k < 2; k++)
        b.box(
          "black_metal",
          TX0 - 3.21,
          0.2,
          zc - 0.7 + k * 1.4,
          0.02,
          0.5,
          0.9,
          { faces: "w", rz: 0.6 },
        );
      K.colBox(TX0 - 3.2, 0, zc - 1.5, TX0 - 2.8, 1.0, zc + 1.5, {
        surface: "metal",
      });
    }
    // "SECURITY CHECKPOINT" sawhorse sign on the open side
    b.box("black_metal", TX0 - 3.0, 0, tcz - 1.9, 0.08, 1.3, 0.08, {});
    b.box("black_metal", TX0 - 3.0, 0, tcz + 1.9, 0.08, 1.3, 0.08, {});
    b.burn(TX1, 40, TZ0, 8, 0.5);
    b.finish(rec.root, { lod: 1600 });
    glows.finish(rec.root, { dayOpacity: 0.3, nightOpacity: 1, beacon: true });
    rec.anchor("entrance", TX0 - 4.5, 0, tcz, HP);
    rec.anchor("loggia", tcx - 10.2, LY, tcz, HP);
    return {
      doorPos: new THREE.Vector3(TX0 - 0.6, 1.6, tcz),
      outside: { x: TX0 - 5, y: 0, z: tcz + 1.5, yaw: HP }, // face Madison Square (away from the door)
      loggiaDoor: new THREE.Vector3(tcx - 8.2, LY + 1.4, tcz),
      loggiaArrival: { x: tcx - 9.8, y: LY, z: tcz, yaw: HP },
    };
  }

  // ------------------------------------------------------------------
  // INTERIOR
  // ------------------------------------------------------------------
