// play-inline-118 10 — sz1
// Lines 2319-2853 of readable/play-inline-118.pretty.js (statement-aligned).
  function opry(rec, O) {
    const r = Room("opry", O.x - 70, O.z - 18, 22, 38, 9, { doorAt: 0 });
    shell(r, {
      floor: "nx_carpet",
      wall: "nx_paper",
      wallTint: 0xa03a3a,
      dado: "nx_wood",
      dadoTint: 0x3a1a10,
      dadoH: 1.3,
      trim: "gold",
      railMat: "gold",
      ceil: "nx_tin",
      ceilTint: 0xc09a60,
      doorW: 2.6,
      doorLeaf: "wood",
      doorTint: 0x5a1a10,
      doorFrame: "gold",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    const SZ0 = -12.0,
      SZ1 = -5.0,
      SH = 1.2,
      BZ = -13.2; // stage front at -5, backdrop wall at -13.2, backstage -19..-13.2
    // stage: boards, lip, apron edge; stairs at both front corners
    r.bx("nx_wood", -11, 0, -19, 11, SH, SZ1, { tint: 0x8a6a4a });
    r.col(-11, 0, -19, 11, SH, SZ1, { surface: "wood" }); // stage + backstage deck
    r.bx("black_metal", -11, 0, SZ1 - 0.02, 11, SH, SZ1 + 0.02, { faces: "s" });
    r.bx("gold", -11, SH - 0.06, SZ1, 11, SH, SZ1 + 0.05, {});
    for (const sd of [-1, 1]) {
      r.b.stairs(
        "nx_wood",
        r.X(sd * 7.3),
        r.Z(SZ1 + 1.9),
        0,
        -1,
        1.2,
        1.9,
        0,
        SH,
        5,
        {},
      );
    }
    // proscenium: gold frame + pilasters + a painted arch band
    for (const sd of [-1, 1]) {
      r.bx(
        "gold",
        sd * 8.6 - 0.5,
        SH,
        SZ1 - 0.6,
        sd * 8.6 + 0.5,
        7.6,
        SZ1 - 0.2,
        {},
      );
      r.bx("nx_paper", sd * 11, 0, SZ1 - 0.6, sd * 9.1, 9, SZ1 - 0.2, {
        tint: 0x7a2a2a,
      });
      r.col(
        Math.min(sd * 11, sd * 9.1),
        0,
        SZ1 - 0.6,
        Math.max(sd * 11, sd * 9.1),
        9,
        SZ1 - 0.2,
      );
    }
    r.bx("gold", -9.1, 7.2, SZ1 - 0.6, 9.1, 7.9, SZ1 - 0.15, {});
    r.bx("nx_paper", -11, 7.9, SZ1 - 0.6, 11, 9, SZ1 - 0.2, { tint: 0x7a2a2a });
    // curtains: legs bunched either side, the valance, the painted backdrop (Neon Nights skyline)
    for (const sd of [-1, 1])
      for (let k = 0; k < 6; k++)
        r.b.geo("nx_velvet", T.cyl6, {
          x: r.X(sd * (8.0 - k * 0.32)),
          y: SH + 3.1,
          z: r.Z(SZ1 - 0.9),
          sx: 0.2,
          sy: 6.2,
          sz: 0.2,
          grime: 0,
        });
    r.bx("nx_velvet", -8.6, 6.4, SZ1 - 1.0, 8.6, 7.2, SZ1 - 0.8, { grime: 0 });
    // backdrop wall with the two wings passages (x ±8.2..±9.6) through to backstage
    for (const sd of [-1, 1]) {
      r.bx("nx_paper", sd * 9.6, SH, BZ - 0.2, sd * 11, 9, BZ, {
        tint: 0x5a2a20,
      });
      r.bx("nx_paper", sd * 8.2, SH + 2.6, BZ - 0.2, sd * 9.6, 9, BZ, {
        tint: 0x5a2a20,
      });
      r.col(
        Math.min(sd * 9.6, sd * 11),
        SH,
        BZ - 0.2,
        Math.max(sd * 9.6, sd * 11),
        9,
        BZ,
      );
      r.bx(
        "nx_velvet",
        sd * 8.2,
        SH,
        BZ - 0.12,
        sd * 8.5,
        SH + 2.6,
        BZ - 0.08,
        {},
      );
    }
    r.bx("nx_paper", -8.2, 7.2, BZ - 0.2, 8.2, 9, BZ, { tint: 0x5a2a20 });
    r.b.panel(
      "nx_backdrop",
      r.X(0),
      SH + 3.0,
      r.Z(BZ + 0.02),
      16.4,
      6.0 - SH + 1.2,
      0,
      { rect: [0, 0, 1, 1] },
    );
    r.col(-8.2, SH, BZ - 0.2, 8.2, 7.2, BZ);
    // footlights, the mic, a spot bar
    for (let k = 0; k < 16; k++) {
      const lx = -8 + k * 1.07;
      r.b.box("black_metal", r.X(lx), SH, r.Z(SZ1 - 0.25), 0.3, 0.12, 0.18, {});
      r.b.geo("lit_warm", T.sphereLo, {
        x: r.X(lx),
        y: SH + 0.14,
        z: r.Z(SZ1 - 0.28),
        s: 0.07,
        tint: 0xffb070,
      });
      if (k % 2 === 0)
        r.g.add(r.X(lx), SH + 0.2, r.Z(SZ1 - 0.5), 0xffb070, "s");
    }
    r.sp.add(r.X(0), r.Z(SZ1 - 3.5), 0xffa060, 6.0, {
      y: SH + 0.03,
      i: 0.5,
      sx: 9,
      sz: 3.5,
    });
    r.b.beam(
      "black_metal",
      r.X(0),
      SH,
      r.Z(-7.0),
      r.X(0),
      SH + 1.6,
      r.Z(-7.0),
      0.02,
    );
    r.b.geo("chrome", T.sphereLo, {
      x: r.X(0),
      y: SH + 1.65,
      z: r.Z(-7.0),
      s: 0.07,
    });
    r.b.cyl("black_metal", r.X(0), SH, r.Z(-7.0), 0.18, 0.2, 0.03, 8, {});
    r.b.beam(
      "black_metal",
      r.X(-8),
      7.0,
      r.Z(-3.5),
      r.X(8),
      7.0,
      r.Z(-3.5),
      0.08,
    );
    for (let k = 0; k < 6; k++) {
      const lx = -6.5 + k * 2.6;
      r.b.cyl("black_metal", r.X(lx), 6.4, r.Z(-3.5), 0.16, 0.24, 0.5, 8, {
        top: true,
      });
      r.g.add(r.X(lx), 6.35, r.Z(-3.6), 0xfff0d0, "m");
    }
    r.sp.add(r.X(0), r.Z(-7.2), 0xfff0d8, 2.6, { y: SH + 0.03, i: 0.7 });
    r.fix.push([
      r.X(0),
      5.5,
      r.Z(-6.5),
      0xffe8c8,
      { intensity: 2.0, range: 14 },
    ]);
    A("opry_stage", 0, -7.6, PI, SH);
    A("opry_director", -6.2, -6.2, AY(PI / 2 + 0.6), SH);
    A("opry_wings", 7.5, -10.5, -PI / 2, SH);
    // backstage (on the stage deck, y = SH): dressing tables with bulb mirrors, a costume rack, a trunk
    const Y = SH;
    for (let k = 0; k < 4; k++) {
      const lx = -6.3 + k * 4.2;
      r.bx("wood", lx - 0.8, Y + 0.75, -18.9, lx + 0.8, Y + 0.8, -18.3, {});
      r.bx("wood_dark", lx - 0.8, Y, -18.9, lx - 0.7, Y + 0.75, -18.3, {});
      r.bx("wood_dark", lx + 0.7, Y, -18.9, lx + 0.8, Y + 0.75, -18.3, {});
      r.b.panel("glass", r.X(lx), Y + 1.5, r.Z(-18.97), 1.2, 0.9, 0, {
        tint: 0x8a9aa0,
      });
      for (let i = 0; i < 6; i++) {
        const bx2 = lx - 0.65 + (i / 5) * 1.3;
        r.b.geo("lit_warm", T.sphereLo, {
          x: r.X(bx2),
          y: Y + 2.02,
          z: r.Z(-18.95),
          s: 0.05,
        });
      }
      for (let i = 0; i < 4; i++) {
        r.b.geo("lit_warm", T.sphereLo, {
          x: r.X(lx - 0.68),
          y: Y + 1.1 + i * 0.27,
          z: r.Z(-18.95),
          s: 0.05,
        });
        r.b.geo("lit_warm", T.sphereLo, {
          x: r.X(lx + 0.68),
          y: Y + 1.1 + i * 0.27,
          z: r.Z(-18.95),
          s: 0.05,
        });
      }
      r.g.add(r.X(lx), Y + 1.6, r.Z(-18.6), 0xffe0a8, "m");
      r.sp.add(r.X(lx), r.Z(-18.2), 0xffd8a0, 1.6, { y: Y + 0.03, i: 0.45 });
      P.chair(r.b, r.X(lx), Y, r.Z(-17.7), PI);
      r.col(lx - 0.8, Y, -18.9, lx + 0.8, Y + 0.8, -18.3);
    }
    r.b.beam(
      "chrome",
      r.X(-9.9),
      Y + 1.8,
      r.Z(-14.2),
      r.X(-9.9),
      Y + 1.8,
      r.Z(-17.0),
      0.025,
    );
    for (let k = 0; k < 7; k++)
      r.bx(
        "fabric",
        -9.95,
        Y + 0.7,
        -14.4 - k * 0.36,
        -9.85,
        Y + 1.78,
        -14.25 - k * 0.36,
        {
          tint: [
            0xc02a4a, 0x2a4a8a, 0xe0c040, 0x6a2a8a, 0xf0e0d0, 0x2a8a5a,
            0x1a1a1a,
          ][k],
        },
      );
    r.bx("wood_dark", 8.6, Y, -17.8, 10.0, Y + 0.7, -16.9, { tint: 0x6a3a1a });
    r.col(8.6, Y, -17.8, 10.0, Y + 0.7, -16.9);
    A("opry_backstage", 0, -16.4, 0, Y);
    note("lma_neon_note_setlist", r.X(-6.0), Y + 0.81, r.Z(-18.6), {
      name: "Velvet's Setlist",
      title: '"Neon Nights" — Running Order',
      value: 1,
      text: "NEON NIGHTS — RUNNING ORDER (Velvet's copy)\n\n1. Overture (Maestro, if sober)\n2. 'Glow, Little Glowworm, Glow' — full company\n3. The Mayor's Monologue (keep it SHORT, Lucius)\n4. 'Twenty-Two Years Young' — Velvet\n5. Intermission (sell the popcorn, whatever it is)\n6. Tap number (CUT — Rex's knee went again)\n7. 'Crossroads of the World' — full company, bows\n\nNote to self: find the good wig. Somebody took the good wig.",
    });
    lamp(r, r.X(-3), r.Z(-16.2), {
      kind: "bulb",
      y: Y + 3.0,
      col: 0xffd8a0,
      pool: 3.0,
      fy: Y,
    });
    lamp(r, r.X(4), r.Z(-16.2), {
      kind: "bulb",
      y: Y + 3.0,
      col: 0xffd8a0,
      pool: 3.0,
      fy: Y,
    });
    // the house: rows of red plush seats with a centre aisle; some broken, a few missing
    const rr = K.rng(7071);
    let seatN = 0;
    for (let row = 0; row < 14; row++) {
      const lz = -2.6 + row * 1.15;
      for (const sd of [-1, 1])
        for (let k = 0; k < 8; k++) {
          const lx = sd * (1.4 + k * 0.62);
          if (Math.abs(lx) > 10.2) continue;
          const q = rr();
          if (q < 0.05) continue;
          const broken = q < 0.12;
          r.b.box("nx_fabric", r.X(lx), 0.4, r.Z(lz), 0.54, 0.1, 0.48, {
            tint: 0x8a1a1a,
            grime: 0.5,
          });
          if (!broken)
            r.b.box(
              "nx_fabric",
              r.X(lx),
              0.45,
              r.Z(lz + 0.26),
              0.54,
              0.62,
              0.08,
              { tint: 0x7a1414, grime: 0.5 },
            );
          else
            r.b.geo("nx_fabric", T.box, {
              x: r.X(lx),
              y: 0.55,
              z: r.Z(lz + 0.4),
              rx: 1.2,
              sx: 0.54,
              sy: 0.62,
              sz: 0.08,
              tint: 0x6a1010,
            });
          r.b.box(
            "black_metal",
            r.X(lx - 0.29),
            0,
            r.Z(lz + 0.05),
            0.04,
            0.68,
            0.5,
            {},
          );
          if (row < 3 && !broken && seatN < 12 && k % 2 === 0) {
            seatN++;
            A("opry_seat_" + seatN, lx, lz - 0.05, 0);
          }
        }
      for (const sd of [-1, 1])
        r.col(
          sd > 0 ? 1.1 : -6.1,
          0,
          lz - 0.25,
          sd > 0 ? 6.1 : -1.1,
          0.5,
          lz + 0.35,
          { surface: "carpet" },
        );
    }
    // side boxes (theatre boxes): a slab on a gilded corbel, a bowed gilt parapet with a velvet rail, two chairs, a lamp,
    // velvet drapes tied back under a swagged valance; the north-east box has lost half its front (debris in the seats below)
    for (const sd of [-1, 1])
      for (const lz of [2, 9]) {
        const broken = sd > 0 && lz === 2,
          BY = 3.5,
          fx = sd * 9.35;
        r.bx("nx_wood", fx, BY - 0.16, lz - 1.8, sd * 11, BY, lz + 1.8, {
          tint: 0x6a3a22,
        });
        r.bx(
          "gold",
          fx,
          BY - 0.42,
          lz - 1.8,
          fx + sd * 0.12,
          BY - 0.12,
          lz + 1.8,
          {},
        );
        for (let k = 0; k < 4; k++)
          r.b.geo("gold", T.cone4, {
            x: r.X(sd * (10.3 - k * 0.2)),
            y: BY - 0.62 - k * 0.12,
            z: r.Z(lz),
            rx: PI,
            sx: 0.8 - k * 0.16,
            sy: 0.3,
            sz: 1.2 - k * 0.2,
          });
        const segs = 7,
          R = 1.8,
          bulge = 0.55;
        for (let k = 0; k < segs; k++) {
          if (broken && k >= 3) continue;
          const a0 = -PI / 2 + (k * PI) / segs,
            a1 = a0 + PI / segs;
          const q0 = [fx - sd * Math.cos(a0) * bulge, lz + Math.sin(a0) * R],
            q1 = [fx - sd * Math.cos(a1) * bulge, lz + Math.sin(a1) * R];
          const px = (q0[0] + q1[0]) / 2,
            pz = (q0[1] + q1[1]) / 2,
            len = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) + 0.04;
          const yaw = Math.atan2(q1[0] - q0[0], q1[1] - q0[1]); // local +z along the chord
          r.b.box("gold", r.X(px), BY, r.Z(pz), 0.1, 0.95, len, {
            yaw,
            grime: 0.35,
          });
          r.b.box("nx_velvet", r.X(px), BY + 0.95, r.Z(pz), 0.16, 0.08, len, {
            yaw,
          });
        }
        if (!broken)
          K.colRot(r.X(fx - sd * 0.3), r.Z(lz), 0.6, R * 2, BY, BY + 1.05, 0, {
            walkable: false,
          });
        r.bx(
          "nx_velvet",
          sd * 10.9,
          BY,
          lz - 1.8,
          sd * 11,
          BY + 3.2,
          lz + 1.8,
          { tint: 0x8a2a2a },
        );
        for (const s2 of [-1, 1]) {
          // tied-back drapes + the swag
          r.b.geo("nx_velvet", T.cyl6, {
            x: r.X(fx + sd * 0.2),
            y: BY + 1.6,
            z: r.Z(lz + s2 * 1.7),
            sx: 0.22,
            sy: 3.2,
            sz: 0.22,
          });
          r.b.geo("gold", T.sphereLo, {
            x: r.X(fx + sd * 0.1),
            y: BY + 1.2,
            z: r.Z(lz + s2 * 1.62),
            s: 0.08,
          });
        }
        r.bx(
          "nx_velvet",
          fx,
          BY + 2.9,
          lz - 1.8,
          fx + sd * 0.25,
          BY + 3.3,
          lz + 1.8,
          {},
        );
        r.bx(
          "gold",
          fx - sd * 0.02,
          BY + 2.86,
          lz - 1.8,
          fx + sd * 0.02,
          BY + 2.92,
          lz + 1.8,
          {},
        );
        if (!broken) {
          for (const cz of [-0.6, 0.6])
            P.chair(r.b, r.X(sd * 10.2), BY, r.Z(lz + cz), (-sd * PI) / 2);
        } else {
          P.chair(r.b, r.X(sd * 10.4), BY, r.Z(lz + 0.8), (-sd * PI) / 2 + 0.4);
          // the rest of the front lies in the stalls below: gilt chunks, a velvet rail, plaster
          for (let k = 0; k < 7; k++)
            r.b.box(
              k % 3 ? "gold" : "nx_plaster",
              r.X(sd * (8.6 - (k % 3) * 0.7)),
              0.45 + (k % 2) * 0.12,
              r.Z(lz - 0.4 + k * 0.35),
              0.5 + (k % 2) * 0.3,
              0.14,
              0.4,
              { yaw: k * 0.9, grime: 0.8 },
            );
          r.b.box(
            "nx_velvet",
            r.X(sd * 8.9),
            0.55,
            r.Z(lz + 1.0),
            0.14,
            0.08,
            1.8,
            { yaw: 0.5 },
          );
        }
        const lp = r.X(fx - sd * 0.45);
        r.b.cyl("gold", lp, BY + 0.95, r.Z(lz), 0.05, 0.07, 0.25, 6, {});
        r.b.geo("lit_warm", T.sphereLo, {
          x: lp,
          y: BY + 1.25,
          z: r.Z(lz),
          s: 0.08,
          tint: 0xffc890,
        });
        if (!broken) r.g.add(lp, BY + 1.25, r.Z(lz), 0xffd8a0, "s");
      }
    // ruin in the house: fallen plaster from a hole in the ceiling rose over the back rows, trash in the aisle
    {
      const rr2 = K.rng(7073);
      r.bx("black_metal", -1.6, 8.98, 11.0, 1.8, 9.0, 13.2, { tint: 0x050505 });
      for (let k = 0; k < 16; k++)
        r.b.box(
          k % 4 ? "nx_plaster" : "nx_wood",
          r.X(-1.6 + rr2() * 3.4),
          0.5 + rr2() * 0.25,
          r.Z(10.8 + rr2() * 2.6),
          0.2 + rr2() * 0.5,
          0.08 + rr2() * 0.1,
          0.2 + rr2() * 0.4,
          { yaw: rr2() * 3, grime: 0.8, tint: 0xd8c8a8 },
        );
      for (let k = 0; k < 22; k++)
        r.b.box(
          "paint_white",
          r.X((rr2() - 0.5) * 2.2),
          0.012,
          r.Z(-3 + rr2() * 20),
          0.16,
          0.004,
          0.22,
          { yaw: rr2() * 3, tint: [0xd8ccb0, 0xc8a8a0, 0xa8b8c0][k % 3] },
        );
      r.sp.add(r.X(0), r.Z(12), 0x9ab0c8, 2.4, { y: 0.9, i: 0.25 });
    }
    for (const sd of [-1, 1])
      for (const lz of [-1, 5.5, 13]) {
        r.b.cyl("gold", r.X(sd * 10.9), 2.6, r.Z(lz), 0.08, 0.16, 0.24, 8, {});
        r.b.geo("lit_warm", T.sphereLo, {
          x: r.X(sd * 10.85),
          y: 2.92,
          z: r.Z(lz),
          s: 0.09,
        });
        r.g.add(r.X(sd * 10.6), 2.95, r.Z(lz), 0xffc880, "m");
        r.sp.add(r.X(sd * 9.8), r.Z(lz), 0xffc080, 2.6, { y: 0.03, i: 0.3 });
      }
    lamp(r, r.X(0), r.Z(5), {
      kind: "chandelier",
      y: 7.6,
      col: 0xffe0a8,
      light: 1.6,
      range: 16,
      pool: 6,
      i: 0.35,
    });
    poster(r, "q_show", r.X(-2.2), 1.9, r.Z(18.97), 1.1, 1.45, PI);
    poster(r, "q_show", r.X(2.2), 1.9, r.Z(18.97), 1.1, 1.45, PI);
    neonSign(r, "x_opry", r.X(0), 8.35, r.Z(SZ1 - 0.12), 5.0, 0, 0xff5ab4, "l");
    finish(r);
    return r;
  }

