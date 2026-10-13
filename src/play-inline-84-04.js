// play-inline-84 04 — math
// Lines 788-1092 of readable/play-inline-84.pretty.js (statement-aligned).
  function buildBandshell() {
    const P = PIECES.bandshell,
      x = P.x,
      z = P.z,
      r = M.rng("bandshell");
    const st = M.buf("stone_limestone", x, z, "main"),
      cn = M.buf("concrete", x, z, "main");
    const LC = [0.86, 0.83, 0.76];
    const SY = 1.3; // stage top
    const bx = x + 5.5; // back of the shell (dome centre plane at x = bx - R)
    // stage: stone plinth, rotten plank floor, steps down to the Mall on the west
    M.box(st, x - 3.5, 0, z - 8, x + 6.5, SY, z + 8, {
      s: 3,
      c: M.mulc(LC, 0.85),
      skip: 8,
    });
    const wb = M.buf("wood_rotten", x, z, "main");
    M.box(wb, x - 3.4, SY, z - 7.9, x + 6.4, SY + 0.05, z + 7.9, {
      s: 2,
      c: [0.62, 0.55, 0.45],
      skip: 8 + 1 + 2 + 16 + 32,
    });
    for (let i = 0; i < 4; i++)
      M.box(
        st,
        x - 3.5 - (i + 1) * 0.45,
        0,
        z - 4,
        x - 3.5 - i * 0.45,
        (SY * (4 - i)) / 4.5,
        z + 4,
        { s: 2, c: M.mulc(LC, 0.8), skip: 8 },
      );
    // the half-dome: quarter sphere opening west, radius R, thickness 0.5; a bite blown out of the upper north side
    const R = 6.2,
      T = 0.5,
      cx = bx - 0.3,
      cy = SY,
      cz = z;
    const NA = 12,
      NB = 8;
    const hole = (ia, ib) => ia >= 7 && ia <= 9 && ib >= 4 && ib <= 6;
    const dir = (ia, ib) => {
      const th = -Math.PI / 2 + (Math.PI * ia) / NA,
        ph = ((Math.PI / 2) * ib) / NB;
      return [
        Math.cos(ph) * Math.cos(th),
        Math.sin(ph),
        Math.cos(ph) * Math.sin(th),
      ];
    };
    for (let ia = 0; ia < NA; ia++)
      for (let ib = 0; ib < NB; ib++) {
        if (hole(ia, ib)) continue;
        const d00 = dir(ia, ib),
          d10 = dir(ia + 1, ib),
          d11 = dir(ia + 1, ib + 1),
          d01 = dir(ia, ib + 1);
        const Pt = (d, rr) => [cx + d[0] * rr, cy + d[1] * rr, cz + d[2] * rr];
        const dm = v3n([
          (d00[0] + d11[0]) / 2,
          (d00[1] + d11[1]) / 2,
          (d00[2] + d11[2]) / 2,
        ]);
        // coffers: every other cell recessed-dark on the inside, the ribs stay pale
        const coffer = (ia + ib) % 2 === 0;
        const ci = coffer ? M.mulc(LC, 0.62) : M.mulc(LC, 0.9 - ib * 0.02);
        M.quad(
          st,
          Pt(d00, R),
          Pt(d10, R),
          Pt(d11, R),
          Pt(d01, R),
          [-dm[0], -dm[1], -dm[2]],
          [
            ia / 3,
            ib / 3,
            (ia + 1) / 3,
            ib / 3,
            (ia + 1) / 3,
            (ib + 1) / 3,
            ia / 3,
            (ib + 1) / 3,
          ],
          ci,
        );
        M.quad(
          st,
          Pt(d00, R + T),
          Pt(d01, R + T),
          Pt(d11, R + T),
          Pt(d10, R + T),
          dm,
          [
            ia / 3,
            ib / 3,
            ia / 3,
            (ib + 1) / 3,
            (ia + 1) / 3,
            (ib + 1) / 3,
            (ia + 1) / 3,
            ib / 3,
          ],
          M.mulc(LC, 0.8 + 0.08 * r()),
        );
        // broken edges round the bite
        const edge = [
          [ia - 1, ib],
          [ia + 1, ib],
          [ia, ib - 1],
          [ia, ib + 1],
        ].some(([a, b2]) => hole(a, b2));
        if (edge)
          M.quad(
            st,
            Pt(d10, R),
            Pt(d10, R + T),
            Pt(d11, R + T),
            Pt(d11, R),
            [d10[2], 0, -d10[0]],
            [0, 0, 0.2, 0, 0.2, 1, 0, 1],
            M.mulc(LC, 0.55),
          );
      }
    // proscenium arch: flat semicircular band on the opening plane (x = cx), 0.9 m wide, with a keystone
    for (let ia = 0; ia < NA; ia++) {
      const a0 = (Math.PI * ia) / NA,
        a1 = (Math.PI * (ia + 1)) / NA;
      const Q = (a, rr) => [
        cx - 0.02,
        cy + Math.sin(a) * rr,
        cz - Math.cos(a) * rr,
      ];
      M.quad(
        st,
        Q(a0, R),
        Q(a0, R + 0.95),
        Q(a1, R + 0.95),
        Q(a1, R),
        [-1, 0, 0],
        [0, 0, 1, 0, 1, 0.3, 0, 0.3],
        M.mulc(LC, 0.95),
      );
      if (ia === NA / 2 - 1 || ia === NA / 2)
        M.box(
          st,
          cx - 0.35,
          cy + R + 0.1,
          cz - 0.4,
          cx + 0.05,
          cy + R + 1.3,
          cz + 0.4,
          { s: 1, c: LC },
        );
    }
    // rubble from the bite, a toppled light rig, the upright piano, a mic stand, sandbags (someone made a stand here)
    M.rubblePile(cx - 1.2, z + 3.2, 1.8, 0.7, r, { y: SY });
    const mb = M.buf("metal_painted", x, z, "detail");
    M.obox(
      M.buf("wood_rotten", x, z, "detail"),
      x + 2.8,
      SY + 0.65,
      z - 3.2,
      0.7,
      1.3,
      1.6,
      0.25,
      { c: [0.3, 0.2, 0.16], s: 1 },
    );
    M.obox(
      M.buf("wood_rotten", x, z, "detail"),
      x + 2.3,
      SY + 0.75,
      z - 3.1,
      0.5,
      0.08,
      1.4,
      0.25,
      { c: [0.85, 0.82, 0.72], s: 1 },
    ); // keys
    M.pipe(mb, x - 1.8, SY, z + 0.4, x - 1.7, SY + 1.5, z + 0.35, 0.02, 4, {
      c: [0.3, 0.3, 0.3],
    });
    M.beam(
      mb,
      x + 0.5,
      SY + 0.2,
      z + 5.5,
      x + 3.5,
      SY + 0.8,
      z + 6.4,
      0.12,
      0.12,
      { c: [0.25, 0.25, 0.24] },
    );
    const sb = M.buf("fabric", x, z, "detail");
    for (let i = 0; i < 7; i++)
      M.obox(
        sb,
        x - 3.0 + (i % 4) * 0.02,
        SY + 0.18 + Math.floor(i / 4) * 0.34,
        z - 2.4 + (i % 4) * 0.9,
        0.5,
        0.36,
        0.86,
        0.05 * ((i % 3) - 1),
        { c: [0.58, 0.53, 0.4], s: 1 },
      );
    // rows of rotten benches facing the stage (some toppled, some missing)
    const bb = M.buf("wood_rotten", x, z, "detail");
    for (let row = 0; row < 3; row++)
      for (let k = -1; k <= 1; k++) {
        if (r() < 0.25) continue;
        const bxp = x - 9 - row * 2.6,
          bzp = z + k * 4.2,
          tip = r() < 0.2;
        M.obox(bb, bxp, tip ? 0.2 : 0.45, bzp, 0.45, 0.06, 3.2, 0, {
          c: [0.5, 0.42, 0.34],
          s: 1,
          roll: tip ? 1.3 : 0,
        });
        if (!tip) {
          M.obox(bb, bxp + 0.24, 0.75, bzp, 0.06, 0.4, 3.2, 0, {
            c: [0.45, 0.38, 0.3],
            s: 1,
          });
          for (const e of [-1.4, 1.4])
            M.box(
              mb,
              bxp - 0.2,
              0,
              bzp + e - 0.03,
              bxp + 0.2,
              0.45,
              bzp + e + 0.03,
              { s: 1, c: [0.2, 0.2, 0.2] },
            );
        }
      }
    // colliders: stage (walkable), steps, shell back
    M.box3(x - 3.5, 0, z - 8, x + 6.5, SY, z + 8, {
      tag: "stage",
      surface: "wood",
    });
    for (let i = 0; i < 4; i++)
      M.box3(
        x - 3.5 - (i + 1) * 0.45,
        0,
        z - 4,
        x - 3.5 - i * 0.45,
        (SY * (4 - i)) / 4.5,
        z + 4,
        { tag: "stairs", surface: "concrete" },
      );
    M.box3(cx + R * 0.72, SY, z - R - 0.5, cx + R + 0.6, SY + R, z + R + 0.5, {
      tag: "bandshell",
      walkable: false,
    });
    M.box3(cx - 0.3, SY, z - R - 1, cx + R * 0.72, SY + 4, z - R + 0.2, {
      tag: "bandshell",
      walkable: false,
    });
    M.box3(cx - 0.3, SY, z + R - 0.2, cx + R * 0.72, SY + 4, z + R + 1, {
      tag: "bandshell",
      walkable: false,
    });
  }

  // -------------------------------------------------------------------
  // 4. The Carousel
  // -------------------------------------------------------------------
  function horse(b, px, py, pz, yaw, col, pitch) {
    M.pushXF(M.mtx(px, py, pz, yaw, pitch || 0, 0));
    const c = col,
      cd = M.mulc(col, 0.7);
    M.obox(b, 0, 0, 0, 0.36, 0.42, 1.1, 0, { c, s: 1 }); // barrel
    M.obox(b, 0, 0.32, -0.55, 0.22, 0.6, 0.28, 0, { c, s: 1, pitch: -0.6 }); // neck
    M.obox(b, 0, 0.58, -0.8, 0.2, 0.22, 0.46, 0, { c, s: 1, pitch: 0.35 }); // head
    M.obox(b, 0, 0.62, -0.55, 0.06, 0.34, 0.3, 0, {
      c: [0.2, 0.18, 0.16],
      s: 1,
      pitch: -0.5,
    }); // mane
    for (const [lx, lz, a] of [
      [-0.12, -0.42, -0.7],
      [0.12, -0.42, -0.4],
      [-0.12, 0.42, 0.6],
      [0.12, 0.42, 0.9],
    ])
      M.obox(b, lx, -0.38, lz + Math.sin(a) * 0.12, 0.09, 0.55, 0.09, 0, {
        c: cd,
        s: 1,
        pitch: a,
      });
    M.obox(b, 0, 0.12, 0.6, 0.06, 0.1, 0.4, 0, {
      c: [0.2, 0.18, 0.16],
      s: 1,
      pitch: 0.9,
    }); // tail
    M.obox(b, 0, 0.23, -0.05, 0.4, 0.06, 0.45, 0, {
      c: [0.5, 0.18, 0.14],
      s: 1,
    }); // saddle
    M.popXF();
  }
