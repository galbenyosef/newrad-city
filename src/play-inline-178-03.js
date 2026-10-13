// play-inline-178 03 — tint
// Lines 328-886 of readable/play-inline-178.pretty.js (statement-aligned).
  function buildExterior(rec) {
    const s = K.site("penn_station");
    const b = K.builder("penn_ext", { grime: 0.6 });
    const glows = K.glowSet("penn_ext");
    const X0 = s.x0,
      X1 = s.x1,
      Z0 = s.z0,
      Z1 = s.z1; // -110..-50, -134..-56
    const cz = (Z0 + Z1) / 2,
      FX = X1;
    const stone = 0xd0bcac;
    const pr = K.paint("penn_prr", 256, 256);
    // base block
    K.block(b, "penn_stone", X0 + 2, Z0 + 2, FX, Z1 - 2, 0, 13.2, {
      roof: "concrete_dark",
      col: false,
    });
    K.colBox(X0 + 2, 0, Z0 + 2, FX, 13.2, Z1 - 2, { surface: "concrete" });
    K.band(b, "limestone", X0 + 2, Z0 + 2, FX, Z1 - 2, 12.4, 1.0, 0.45, {
      tint: stone,
    });
    K.band(b, "granite", X0 + 2, Z0 + 2, FX, Z1 - 2, 0, 1.0, 0.25, {
      tint: 0xb8a898,
      faces: "nsewt",
    });
    // --- Seventh Avenue colonnade ---
    const CX = FX + 2.6;
    K.slab(b, "granite", FX, Z0 + 3, FX + 4.2, Z1 - 3, 0.35, {
      th: 0.35,
      tint: 0xa89888,
      faces: "tnsew",
    });
    for (let k = 0; k < 10; k++)
      for (const sgn of [-1, 1]) {
        const z = cz + sgn * (1.65 + 3.3 * k);
        if (sgn < 0 && k >= 8) {
          // two columns toppled at the north end
          b.cyl("limestone", CX, 0.35, z, 0.68, 0.64, 3.6 - (k - 8) * 1.4, 16, {
            tint: stone,
          });
          for (let d = 0; d < 3; d++)
            b.geo("limestone", T.cyl12, {
              x: CX + 3 + d * 1.6,
              y: 0.62,
              z: z + 1.2 - d * 0.9,
              sx: 0.64,
              sy: 1.3,
              sz: 0.64,
              rz: HP,
              ry: 0.3 + d * 0.4,
              tint: stone,
            });
          K.colBox(CX + 2, 0, z - 2, CX + 7.5, 1.3, z + 2, {
            surface: "concrete",
          });
          continue;
        }
        F.column(b, CX, 0.35, z, 0.66, 11.2, {
          style: "doric",
          mat: "marble_t",
          tint: 0xe0cfc0,
        });
      }
    // entablature (architrave, triglyph frieze, cornice) — broken over the fallen columns
    const EZ0 = Z0 + 9.5,
      EZ1 = Z1 - 3;
    b.box("limestone", CX - 0.4, 11.55, (EZ0 + EZ1) / 2, 3.9, 0.9, EZ1 - EZ0, {
      tint: stone,
      faces: "nsewtb",
    });
    b.box("limestone", CX - 0.4, 12.45, (EZ0 + EZ1) / 2, 4.0, 0.8, EZ1 - EZ0, {
      tint: 0xc4b0a0,
      faces: "nsewt",
    });
    for (let z = EZ0 + 0.6; z < EZ1; z += 1.65)
      b.box("limestone", CX + 1.62, 12.5, z, 0.08, 0.7, 0.35, {
        tint: 0xa89484,
      });
    b.box(
      "limestone",
      CX - 0.3,
      13.25,
      (EZ0 + EZ1) / 2,
      4.6,
      0.45,
      EZ1 - EZ0 + 0.6,
      { tint: stone, faces: "nsewtb" },
    );
    b.geo("limestone", T.box, {
      x: CX,
      y: 12.2,
      z: EZ0 - 2.2,
      sx: 3.6,
      sy: 1.6,
      sz: 4.2,
      rx: 0.5,
      rz: 0.2,
      tint: stone,
    }); // broken end hanging down
    // --- central pavilion: attic with clock, name, eagles ---
    const PZ0 = cz - 11,
      PZ1 = cz + 11;
    b.box("limestone", FX + 1.6, 13.7, cz, 3.4, 6.2, PZ1 - PZ0, {
      tint: stone,
    });
    b.box("limestone", FX + 1.7, 19.9, cz, 3.8, 0.6, PZ1 - PZ0 + 0.6, {
      tint: 0xc4b0a0,
      faces: "nsewtb",
    });
    const nm = K.paint("penn_name", 1600, 140);
    b.panel("atlas_paint", FX + 3.32, 12.95, cz, 18, 0.95, HP, {
      rect: nm,
      grime: 0.3,
    });
    b.cyl("limestone", FX + 3.3, 15.6, cz, 2.2, 2.2, 0.4, 20, {
      rx: 0,
      tint: 0xb8a898,
    });
    b.geo("limestone", T.torusThick, {
      x: FX + 3.35,
      y: 16.9,
      z: cz,
      ry: HP,
      s: 1.7,
      tint: 0xb8a898,
    });
    const cd = K.litPaint("penn_clockdial", 256, 256);
    b.panel("atlas_lit", FX + 3.42, 16.9, cz, 2.8, 2.8, HP, {
      rect: cd,
      grime: 0,
    });
    // allegorical figures flanking the clock (stylised draped figures)
    for (const sgn of [-1, 1]) {
      const z = cz + sgn * 3.6;
      b.geo("limestone", T.cone8, {
        x: FX + 3.2,
        y: 15.3,
        z,
        sx: 0.8,
        sy: 3.2,
        sz: 0.7,
        tint: 0xb8aca0,
      });
      b.geo("limestone", T.sphereLo, {
        x: FX + 3.2,
        y: 17.2,
        z,
        s: 0.34,
        tint: 0xb8aca0,
      });
      b.beam(
        "limestone",
        FX + 3.2,
        16.4,
        z,
        FX + 3.4,
        16.9,
        cz + sgn * 2.3,
        0.22,
        { tint: 0xb8aca0 },
      );
    }
    eagle(b, FX + 2.4, 20.5, PZ0 + 1.2, -HP, 1.2);
    eagle(b, FX + 2.4, 20.5, PZ1 - 1.2, -HP, 1.2);
    eagle(b, FX + 2.4, 13.7, Z0 + 5, -HP, 1.0);
    eagle(b, FX + 2.4, 13.7, Z1 - 5, -HP, 1.0);
    // engaged Doric pilasters on the bay boundaries + 3D window surrounds (sills, hoods, jambs) on the
    // 31st St / 33rd St / Eighth Avenue faces; cornice band over the pilasters
    const pmx = (X0 + 2 + FX) / 2; // carriage-drive portal centre (x) on the side streets
    const pmz = cz; // Eighth Avenue portal centre (z)
    const skipPortal = (x, z, y, f) =>
      f === "n" || f === "s"
        ? Math.abs(x - pmx) < 6.2
        : f === "w" && Math.abs(z - pmz) < 6.2;
    K.reveals(b, "penn_stone", X0 + 2, Z0 + 2, FX, Z1 - 2, 0, 13.2, {
      faces: "nsw",
      tint: 0xd8c6b4,
      proj: 0.16,
      hood: "cornice",
      maxY: 12.6,
      skip: skipPortal,
      piers: {
        mat: "limestone",
        tint: stone,
        w: 1.1,
        d: 0.5,
        y0: 1.0,
        y1: 11.6,
        skip: (x, z, f) => skipPortal(x, z, 5, f),
      },
    });
    for (const zf of [Z0 + 2, Z1 - 2]) {
      const sgn = zf < cz ? -1 : 1;
      b.box(
        "limestone",
        (X0 + FX) / 2,
        11.6,
        zf + sgn * 0.3,
        FX - X0 - 4,
        1.0,
        0.6,
        { tint: 0xc4b0a0 },
      );
    }
    b.box("limestone", X0 + 1.7, 11.6, cz, 0.6, 1.0, Z1 - Z0 - 4, {
      tint: 0xc4b0a0,
    });
    // CARRIAGE-DRIVE PORTALS (31st & 33rd St, and the Eighth Avenue front): the station's triumphal-arch
    // motif — a deep coffered arch between paired Doric columns, attic tablet with the Pennsylvania keystone.
    const portal = (px, pz, yaw) => {
      const R = (lx, lz) => F.rot(px, pz, yaw, lx, lz);
      const nrm = F.rot(0, 0, yaw, 0, 1); // outward normal (x,z)
      // frame block + arch surround
      for (const sx of [-1, 1]) {
        const p = R(sx * 4.6, 0.55);
        b.box("limestone", p[0], 0, p[1], 2.6, 12.2, 1.1, { yaw, tint: stone });
      }
      const at = R(0, 0.55);
      b.box("limestone", at[0], 9.2, at[1], 12, 3.2, 1.1, {
        yaw,
        tint: stone,
        faces: "nsewtb",
      });
      // spandrels (face of the arch block, with the semicircle cut out) + archivolt moulding + intrados
      const sp = new THREE.Shape();
      sp.moveTo(-3.3, 5.4);
      sp.lineTo(-3.3, 9.2);
      sp.lineTo(3.3, 9.2);
      sp.lineTo(3.3, 5.4);
      sp.absarc(0, 5.4, 3.3, 0, PI, false);
      const spg = new THREE.ShapeGeometry(sp, 10);
      const sf = R(0, 1.1);
      b.geo("limestone", spg, {
        x: sf[0],
        y: 0,
        z: sf[1],
        ry: yaw,
        tint: stone,
      });
      spg.dispose();
      b.geo("limestone", new THREE.TorusGeometry(3.45, 0.3, 5, 16, PI), {
        x: at[0] + nrm[0] * 0.58,
        y: 5.4,
        z: at[1] + nrm[1] * 0.58,
        ry: yaw,
        sz: 1.9,
        tint: 0xc4b0a0,
      });
      for (let i = 0; i < 10; i++) {
        const a0 = (PI * i) / 10,
          a1 = (PI * (i + 1)) / 10;
        const A0 = R(3.3 * Math.cos(a0), 0.02),
          A1 = R(3.3 * Math.cos(a1), 0.02),
          B0 = R(3.3 * Math.cos(a0), 1.1),
          B1 = R(3.3 * Math.cos(a1), 1.1);
        b.quad(
          "limestone",
          [A0[0], 5.4 + 3.3 * Math.sin(a0), A0[1]],
          [A1[0], 5.4 + 3.3 * Math.sin(a1), A1[1]],
          [B1[0], 5.4 + 3.3 * Math.sin(a1), B1[1]],
          [B0[0], 5.4 + 3.3 * Math.sin(a0), B0[1]],
          { tint: 0x9a8a7a, grime: 0.5, double: true, rect: [0, 0, 0.4, 0.3] },
        );
      }
      // the opening: dark depth + a coffered soffit hint + iron gate half torn off
      const dp = R(0, 0.02);
      b.box("black", dp[0], 0, dp[1], 6.6, 5.4, 0.04, {
        yaw,
        faces: "s",
        grime: 0,
      });
      b.geo("black", new THREE.CircleGeometry(3.3, 16, 0, PI), {
        x: dp[0] + nrm[0] * 0.03,
        y: 5.4,
        z: dp[1] + nrm[1] * 0.03,
        ry: yaw,
        grime: 0,
      });
      for (let k = 0; k < 4; k++) {
        const cp = R(0, 0.2 + k * 0.25);
        b.geo("limestone", new THREE.TorusGeometry(3.3, 0.06, 3, 12, PI), {
          x: cp[0],
          y: 5.4,
          z: cp[1],
          ry: yaw,
          tint: 0x9a8a7a,
        });
      }
      for (let k = 0; k < 7; k++) {
        const gp = R(-3 + k * 0.5, 0.35 + (k > 3 ? (k - 3) * 0.35 : 0));
        b.beam(
          "black_metal",
          gp[0],
          0,
          gp[1],
          gp[0],
          k > 3 ? 3.2 - (k - 3) * 0.5 : 4.6,
          gp[1],
          0.05,
        );
      }
      // paired Doric columns either side of the arch
      for (const sx of [-1, 1])
        for (const dx of [0, 1.35]) {
          const cp = R(sx * (4.05 + dx), 1.15);
          F.column(b, cp[0], 0.35, cp[1], 0.42, 8.8, {
            style: "doric",
            mat: "marble_t",
            tint: 0xe0cfc0,
          });
        }
      const en = R(0, 1.15);
      b.box("limestone", en[0], 9.15, en[1], 12.2, 1.0, 1.2, {
        yaw,
        tint: 0xc4b0a0,
        faces: "nsewtb",
      });
      // attic tablet with the name + PRR keystone disc
      const tb = R(0, 1.12);
      b.panel("atlas_paint", tb[0], 10.75, tb[1], 9.4, 0.62, yaw, {
        rect: nmS,
        grime: 0.3,
      });
      const ks = R(0, 1.77);
      b.panel("atlas_paint", ks[0], 9.65, ks[1], 0.9, 0.9, yaw, {
        rect: pr,
        grime: 0.3,
      });
      // steps
      const st = R(0, 1.2);
      b.box("granite", st[0], 0, st[1], 8, 0.35, 1.6, { yaw, tint: 0xa89888 });
      K.colRot(st[0], st[1], 8, 1.6, 0, 0.35, yaw, { surface: "concrete" });
      for (const sx of [-1, 1])
        for (const dx of [0, 1.35]) {
          const cp = R(sx * (4.05 + dx), 1.15);
          K.colRot(cp[0], cp[1], 0.9, 0.9, 0, 9, 0, { surface: "concrete" });
        }
    };
    const nmS = K.paint("penn_name_s", 1100, 90, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      K.fitText(
        x,
        "PENNSYLVANIA  STATION",
        w / 2,
        h / 2 + 3,
        w - 30,
        74,
        "bold ",
        "#2e241c",
        "#e8dccc",
        2,
      );
    });
    portal(pmx, Z1 - 2, 0); // 31st Street (south)
    portal(pmx, Z0 + 2, PI); // 33rd Street (north)
    portal(X0 + 2, pmz, -HP); // Eighth Avenue (west)
    // PRR keystones over the side doors
    for (const sgn of [-1, 1])
      b.panel("atlas_paint", FX + 0.2, 8.4, cz + sgn * 14, 1.6, 1.6, HP, {
        rect: pr,
        grime: 0.3,
      });
    // entrance doors behind the colonnade
    for (let k = -2; k <= 2; k++) {
      const z = cz + k * 3.3;
      b.box("black", FX + 0.02, 0.35, z, 0.05, 6.2, 2.4, {
        faces: "e",
        grime: 0,
      });
      b.box("bronze", FX + 0.1, 0.35, z, 0.12, 0.2, 2.6, { tint: 0x6a5030 });
      b.box("bronze", FX + 0.1, 6.55, z, 0.2, 0.3, 2.8, { tint: 0x6a5030 });
      if (k !== 0)
        b.box("wood_rotten", FX + 0.18, 0.4, z, 0.08, 3.4, 2.3, {
          tint: 0x6a5642,
        });
    }
    // --- waiting room block with thermal windows ---
    const WX0 = X0 + 12,
      WX1 = FX - 12,
      WZ0 = Z0 + 16,
      WZ1 = Z1 - 16;
    K.block(b, "penn_stone", WX0, WZ0, WX1, WZ1, 13.2, 26, {
      roof: "concrete_dark",
      col: true,
      seg: 6,
    });
    K.band(b, "limestone", WX0, WZ0, WX1, WZ1, 25.2, 1.2, 0.6, { tint: stone });
    const tw = K.litPaint("penn_thermal", 512, 256);
    // low hipped roof in weathered lead (short ridge N-S over the 36 × 46 m block), with a skylight strip and a broken patch
    b.box(
      "limestone",
      (WX0 + WX1) / 2,
      26.0,
      (WZ0 + WZ1) / 2,
      WX1 - WX0 + 1.4,
      0.5,
      WZ1 - WZ0 + 1.4,
      { faces: "nsewtb", tint: stone },
    );
    K.hipRoof(
      b,
      "slate",
      WX0 - 0.2,
      WZ0 - 0.2,
      WX1 + 0.2,
      WZ1 + 0.2,
      26.5,
      5.5,
      { axis: "z", tint: 0x6a726c, grime: 0.6 },
    );
    b.box("black", (WX0 + WX1) / 2 + 6, 28.6, (WZ0 + WZ1) / 2 - 8, 5, 0.05, 4, {
      faces: "t",
      grime: 0,
    }); // hole
    for (let k = 0; k < 4; k++)
      b.beam(
        "rust",
        (WX0 + WX1) / 2 + 4 + k * 1.3,
        29.6 - k * 0.3,
        (WZ0 + WZ1) / 2 - 10,
        (WX0 + WX1) / 2 + 4.5 + k * 1.3,
        28.2,
        (WZ0 + WZ1) / 2 - 6,
        0.16,
      );
    // three thermal (Diocletian) windows on each long face too — the silhouette everyone remembers
    for (const zf of [WZ0, WZ1]) {
      const nz = zf === WZ1 ? 1 : -1,
        yaw = nz > 0 ? 0 : PI;
      for (let i = 0; i < 3; i++) {
        const xc = WX0 + 6 + i * 12;
        const geo = new THREE.CircleGeometry(4.9, 20, 0, PI);
        b.geo("atlas_lit", geo, {
          x: xc,
          y: 17.6,
          z: zf + nz * 0.05,
          ry: yaw,
          uv: "rect",
          rect: tw,
        });
        geo.dispose();
        b.geo("limestone", new THREE.TorusGeometry(5.2, 0.4, 5, 16, PI), {
          x: xc,
          y: 17.6,
          z: zf + nz * 0.12,
          ry: yaw,
          tint: 0xb8a898,
        });
        for (const dx of [-1.65, 1.65])
          b.box(
            "limestone",
            xc + dx,
            17.6,
            zf + nz * 0.1,
            0.35,
            Math.sqrt(4.9 * 4.9 - dx * dx),
            0.3,
            { tint: 0xb8a898 },
          );
        b.box("limestone", xc, 17.2, zf + nz * 0.2, 10.6, 0.45, 0.5, {
          tint: 0xb8a898,
        });
      }
    }
    for (const x of [WX0, WX1])
      for (const zc of [WZ0 + 11, WZ1 - 11]) {
        const nx = x === WX1 ? 1 : -1;
        const geo = new THREE.CircleGeometry(6.2, 24, 0, PI);
        b.geo("atlas_lit", geo, {
          x: x + nx * 0.04,
          y: 15.2,
          z: zc,
          ry: nx > 0 ? HP : -HP,
          uv: "rect",
          rect: tw,
        });
        geo.dispose();
        b.geo("limestone", new THREE.TorusGeometry(6.5, 0.45, 5, 18, PI), {
          x: x + nx * 0.1,
          y: 15.2,
          z: zc,
          ry: HP,
          tint: 0xb8a898,
        });
        for (const dz of [-2.1, 2.1])
          b.box(
            "limestone",
            x + nx * 0.1,
            15.2,
            zc + dz,
            0.3,
            Math.sqrt(6.2 * 6.2 - dz * dz),
            0.4,
            { tint: 0xb8a898 },
          );
        b.box("limestone", x + nx * 0.2, 14.8, zc, 0.5, 0.5, 13.6, {
          tint: 0xb8a898,
        });
      }
    // --- glass concourse vaults (Eighth Avenue side) ---
    const GX = X0 + 6.5,
      GR = 4.4;
    const sky = K.litPaint("penn_sky", 256, 256);
    for (let i = 0; i < 10; i++) {
      const a0 = (PI * i) / 10,
        a1 = (PI * (i + 1)) / 10;
      const p0 = [GX + Math.cos(a0) * GR, 13.2 + Math.sin(a0) * GR],
        p1 = [GX + Math.cos(a1) * GR, 13.2 + Math.sin(a1) * GR];
      for (let z = Z0 + 3; z < Z1 - 3; z += 4) {
        if ((i * 7 + z) % 5 === 0) continue; // missing panes
        b.quad(
          "glass_dirty",
          [p0[0], p0[1], z + 4],
          [p0[0], p0[1], z],
          [p1[0], p1[1], z],
          [p1[0], p1[1], z + 4],
          { tint: 0x6a7a70, grime: 0.3, double: true },
        );
      }
    }
    for (let z = Z0 + 3; z <= Z1 - 3; z += 4)
      for (let i = 0; i < 10; i++) {
        const a0 = (PI * i) / 10,
          a1 = (PI * (i + 1)) / 10;
        b.beam(
          "black_metal",
          GX + Math.cos(a0) * GR,
          13.2 + Math.sin(a0) * GR,
          z,
          GX + Math.cos(a1) * GR,
          13.2 + Math.sin(a1) * GR,
          z,
          0.14,
        );
      }
    void sky;
    // rubble & scorching
    F.debris(b, FX + 8, 0, cz - 26, 3, 16, { mound: true, col: true, colH: 1 });
    b.burn(FX, 8, cz + 20, 7, 0.7);
    b.burn(WX1, 20, WZ0 + 5, 8, 0.6);
    // sidewalk signage
    b.box("black_metal", FX + 5.2, 0, cz + 6, 0.1, 2.6, 0.1);
    b.panel("atlas_lit", FX + 5.3, 2.7, cz + 6, 1.5, 0.38, HP, {
      rect: K.litPaint("penn_tracks", 512, 128),
      grime: 0,
    });
    glows.add(FX + 3.3, 16.9, cz, 0xfff0d0, "m");
    b.finish(rec.root, { lod: 1200 });
    glows.finish(rec.root, { dayOpacity: 0.2, nightOpacity: 0.8 });
    rec.anchor("entrance", FX + 5, 0, cz, HP);
    return {
      doorPos: new THREE.Vector3(FX + 0.3, 1.6, cz),
      outside: { x: FX + 5.5, y: 0.35, z: cz, yaw: -HP },
    }; // face 7th Avenue (away from the door)
  }

  // ------------------------------------------------------------------
  // INTERIOR
  // ------------------------------------------------------------------
