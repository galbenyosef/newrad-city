// play-inline-337 04 — tint
// Lines 1059-2961 of readable/play-inline-337.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "tam_int",
      off: O,
      lit: true,
      amb: [0.1, 0.085, 0.07],
      floors: [0, U2, CY, 1.2],
      grime: 0.55,
    });
    const r = K.rng("tam_int");
    const warm = [1, 0.75, 0.45],
      fire = [1, 0.5, 0.2],
      cream = [0.9, 0.84, 0.7],
      panel = [0.4, 0.24, 0.14];
    const HALL = [-14.1, -0.3, -37.1, 14.1, 10, -8.9];

    // ---------------------------------------------- gaps
    K.gap(ctx, 0, 0, 2.2, 0, 3.2); // front doors
    K.gap(ctx, 0, -9, 3.2, 0, 3.4); // lobby → the Wigwam
    K.gap(ctx, -14, -4.5, 1.8, 0, 2.7); // lobby ↔ ward office
    K.gap(ctx, 14, -4.5, 1.8, 0, 2.7); // lobby ↔ grand stair
    K.gap(ctx, -19, -12, 1.4, 0, 2.4); // ward office ↔ patronage office
    K.gap(ctx, -19, -24, 1.4, 0, 2.4); // patronage office ↔ records room (west door into the hall)
    K.gap(ctx, -14, -30, 1.6, 0, 2.6); // records room ↔ hall
    K.gap(ctx, 17, -12, 1.6, 0, 2.6); // grand stair ↔ Tiger Club
    K.gap(ctx, 14, -24, 1.8, 0, 2.7); // Tiger Club ↔ hall
    K.gap(ctx, 14, -11, 1.4, U2, 2.4); // upstairs landing ↔ east gallery
    K.gap(ctx, 14, -30, 1.4, U2, 2.4); // Boss's office ↔ east gallery ("the Boss's box")
    K.gap(ctx, -14, -16, 1.4, U2, 2.4); // west gallery ↔ council room
    K.gap(ctx, 17, -12, 1.4, U2, 2.4); // upstairs landing ↔ secretary (different storey from the ground gap on this line)
    K.gap(ctx, 19, -24, 1.4, U2, 2.4); // secretary ↔ Boss's office
    K.gap(ctx, -19, -20, 1.4, U2, 2.4); // council room ↔ archive
    K.gap(ctx, 14, -31.5, 1.6, CY, 2.4); // coal room ↔ ballot room
    K.gap(ctx, 0, -26, 1.6, CY, 2.4); // ballot room ↔ cells
    K.gap(ctx, -14, -18, 1.6, CY, 2.4); // cells ↔ west stair foot
    K.gap(ctx, VAULT.x, VAULT.z, 1.6, CY, 2.3, { casing: false }); // west stair foot ↔ VAULT

    // ================================================= LOBBY
    const LB = [-14.1, -0.3, -9.1, 14.1, GH, 0.1];
    K.room(b, ctx, {
      x0: -14,
      z0: -9,
      x1: 14,
      z1: 0,
      y: 0,
      h: GH,
      floor: "marble",
      fc: [0.82, 0.8, 0.76],
      wall: "plaster",
      wc: cream,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.3,
      ceil: "tin",
      cc: [0.6, 0.55, 0.46],
      cornice: true,
    });
    for (const cx of [-8, -4, 4, 8]) {
      K.column(b, cx, 0, -4.5, 0.3, GH, {
        kind: "doric",
        mat: "marble",
        tint: [0.78, 0.76, 0.72],
      });
      b.col(cx - 0.35, 0, -4.85, cx + 0.35, GH, -4.15, {});
    }
    b.hplate(
      "art",
      0,
      0.012,
      -4.5,
      3.6,
      3.6,
      0,
      K.paint("art", "tam_seal", 384, 384, function (x, X, Y, Wd, Hd) {
        x.fillStyle = "#b8ae98";
        x.fillRect(X, Y, Wd, Hd);
        const cx = X + Wd / 2,
          cy = Y + Hd / 2;
        x.fillStyle = "#1e2e52";
        x.beginPath();
        x.arc(cx, cy, Wd * 0.46, 0, 6.3);
        x.fill();
        x.fillStyle = "#c8a050";
        x.beginPath();
        x.arc(cx, cy, Wd * 0.4, 0, 6.3);
        x.fill();
        x.fillStyle = "#1e2e52";
        x.font = "bold 34px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("SOCIETY OF", cx, cy - 60);
        x.fillText("TAMMANY", cx, cy - 18);
        x.font = "bold 26px Georgia, serif";
        x.fillText("1789", cx, cy + 30);
        x.font = "italic 20px Georgia, serif";
        x.fillText('"Honest Graft"', cx, cy + 70);
        K.stains(x, X, Y, Wd, Hd, 16, 41, 0.5, [50, 40, 25]);
      }),
    );
    // coat check counter, portraits of the Grand Sachems, the raider barricade of ballot boxes
    b.boxMM("mahogany", 9.5, 0, -8.8, 13.9, 1.1, -7.6, {
      tint: [0.45, 0.22, 0.14],
    });
    b.col(9.5, 0, -8.8, 13.9, 1.1, -7.6, {});
    b.plate(
      "art",
      11.7,
      2.6,
      -8.86,
      0,
      1,
      1.8,
      0.4,
      K.signCell("tam_coat", "COAT CHECK", 256, 56, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    for (let k = 0; k < 6; k++) {
      const x = -11.5 + k * 4.6;
      if (Math.abs(x) < 2) continue;
      K.framed(
        b,
        x,
        2.9,
        -8.88,
        0,
        1,
        0.9,
        1.15,
        K.painting(2 + (k % 4) * 8, 128, 160),
        { frame: "gold" },
      );
    }
    for (let k = 0; k < 14; k++)
      b.box(
        "wood",
        -3 + (k % 7) * 0.9 + r() * 0.2,
        Math.floor(k / 7) * 0.55,
        -1.8 + (r() - 0.5) * 0.3,
        0.6,
        0.55,
        0.45,
        { yaw: (r() - 0.5) * 0.3, tint: [0.62, 0.5, 0.34] },
      );
    b.col(-3.4, 0, -2.2, 3.4, 1.1, -1.4, {});
    b.plate(
      "decal",
      0,
      0.8,
      -1.35,
      0,
      1,
      3.4,
      0.6,
      K.tag("BALLOT BOX WALL", "#f0e040", 384, 72),
    );
    // a voting booth with its last voter
    b.boxMM("metal", -12.6, 0, -3.2, -11.2, 2.2, -1.6, {
      tint: [0.5, 0.52, 0.5],
      faces: "nwet",
    });
    b.quad(
      "cloth_red",
      [-12.55, 0.4, -1.6],
      [-11.25, 0.4, -1.6],
      [-11.25, 2.1, -1.6],
      [-12.55, 2.1, -1.6],
      { tint: [0.5, 0.18, 0.14] },
    );
    b.col(-12.6, 0, -3.2, -11.2, 2.2, -2.9, {});
    K.skel(ctx, -11.9, 0, -2.5, 0, "lying");
    K.note(ctx, "pev_note_tam_ballot", -11.6, 0.02, -2.1, {
      name: "Unmarked Ballot",
      title: "Fourth Ward — Official Ballot (1967)",
      text: 'FOR ALDERMAN, FOURTH WARD (vote for one):\n\n[X] A. CROKE (Tammany)\n[ ] (no other candidates)\n\nThe X was pre-printed.\n\nIn pencil, in the margin: "I came in here to write in my own name. Took me forty minutes to find the booth. The sirens started while I was still looking for a pencil. Figures."',
    });
    for (const lx of [-8, 8])
      K.lamp(b, lx, 3.9, -2, "globe", warm, 0.7, 8, {
        ceil: GH,
        size: 0.16,
        glowSize: 0.7,
        lightOpts: { box: LB },
      });
    b.light(0, 2.2, -1, fire, 0.8, 6, { box: LB });
    K.litter(b, -13.5, -8.5, 13.5, -0.5, 0, 24, 601);

    // ================================================= THE WIGWAM (meeting hall)
    K.room(b, ctx, {
      x0: -14,
      z0: -37,
      x1: 14,
      z1: -9,
      y: 0,
      h: 10,
      floor: "parquet",
      fc: [0.62, 0.5, 0.38],
      wall: "plaster",
      wc: [0.86, 0.8, 0.66],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.4,
      ceil: "tin",
      cc: [0.62, 0.56, 0.46],
      cornice: true,
      surface: "wood",
    });
    // galleries (horseshoe at y = U2) on slender columns
    const galY = U2;
    b.boxMM("wood_dark", -14, galY - 0.35, -34, -10.5, galY, -9, {
      tint: panel,
      faces: "nsewtb",
    });
    b.boxMM("wood_dark", 10.5, galY - 0.35, -34, 14, galY, -9, {
      tint: panel,
      faces: "nsewtb",
    });
    b.boxMM("wood_dark", -10.5, galY - 0.35, -12.5, 10.5, galY, -9, {
      tint: panel,
      faces: "nsewtb",
    });
    b.face("carpet", -14, galY + 0.005, -9, 1, 0, 0, 0, 0, -1, 3.5, 25, {
      uv: "top",
      tint: [0.6, 0.3, 0.26],
    });
    b.face("carpet", 10.5, galY + 0.005, -9, 1, 0, 0, 0, 0, -1, 3.5, 25, {
      uv: "top",
      tint: [0.6, 0.3, 0.26],
    });
    b.face("carpet", -10.5, galY + 0.005, -9, 1, 0, 0, 0, 0, -1, 21, 3.5, {
      uv: "top",
      tint: [0.6, 0.3, 0.26],
    });
    b.col(-14, galY - 0.35, -34, -10.5, galY, -9, {
      tag: "floor",
      surface: "carpet",
    });
    b.col(10.5, galY - 0.35, -34, 14, galY, -9, {
      tag: "floor",
      surface: "carpet",
    });
    b.col(-10.5, galY - 0.35, -12.5, 10.5, galY, -9, {
      tag: "floor",
      surface: "carpet",
    });
    // gallery fronts: panelled parapet + brass rail
    const gf = (ax, az, bx, bz) => {
      b.boxMM(
        "wood_dark",
        Math.min(ax, bx) - 0.06,
        galY - 0.6,
        Math.min(az, bz) - 0.06,
        Math.max(ax, bx) + 0.06,
        galY + 0.95,
        Math.max(az, bz) + 0.06,
        { tint: [0.45, 0.28, 0.17] },
      );
      b.beam("brass", ax, galY + 1.0, az, bx, galY + 1.0, bz, 0.08, 0.06);
      b.col(
        Math.min(ax, bx) - 0.08,
        galY,
        Math.min(az, bz) - 0.08,
        Math.max(ax, bx) + 0.08,
        galY + 1.05,
        Math.max(az, bz) + 0.08,
        { walkable: false },
      );
    };
    gf(-10.5, -34, -10.5, -12.5);
    gf(10.5, -34, 10.5, -12.5);
    gf(-10.5, -12.5, 10.5, -12.5);
    gf(-14, -34, -10.5, -34);
    gf(10.5, -34, 14, -34);
    for (let z = -32; z <= -14; z += 6)
      for (const x of [-10.8, 10.8]) {
        K.column(b, x, 0, z, 0.16, galY - 0.35, {
          kind: "iron",
          mat: "cast_iron",
          tint: [0.7, 0.62, 0.45],
          base: false,
        });
        b.col(x - 0.2, 0, z - 0.2, x + 0.2, galY, z + 0.2, {});
      }
    for (const x of [-6, 0, 6]) {
      K.column(b, x, 0, -12.8, 0.16, galY - 0.35, {
        kind: "iron",
        mat: "cast_iron",
        tint: [0.7, 0.62, 0.45],
        base: false,
      });
      b.col(x - 0.2, 0, -13, x + 0.2, galY, -12.6, {});
    }
    // gallery bunting & banners
    for (let k = 0; k < 7; k++) {
      const za = -33 + k * 3,
        zb = za + 3;
      for (const sx of [-1, 1])
        b.quadN(
          "fabric",
          [sx * 10.42, galY + 0.8, za],
          [sx * 10.42, galY + 0.8, zb],
          [sx * 10.46, galY - 0.1, zb - 0.9],
          [sx * 10.46, galY - 0.1, za + 0.9],
          [-sx, 0, 0],
          {
            tint:
              k % 3 === 0
                ? [0.6, 0.15, 0.12]
                : k % 3 === 1
                  ? [0.85, 0.82, 0.74]
                  : [0.16, 0.22, 0.4],
            grime: 0.3,
          },
        );
    }
    // the rostrum
    b.boxMM("wood_dark", -9, 0, -37, 9, 1.2, -31, {
      tint: panel,
      faces: "nsewt",
    });
    b.boxMM("parquet", -9, 1.2, -37, 9, 1.21, -31, {
      tint: [0.6, 0.48, 0.36],
      faces: "t",
    });
    b.col(-9, 0, -37, 9, 1.2, -31, { tag: "floor", surface: "wood" });
    K.stairs(b, -1.8, -31, 1.8, -29.2, 0, 1.2, "-z", {
      mat: "wood",
      tint: [0.5, 0.34, 0.22],
      rail: "both",
      railMat: "brass",
      handMat: "brass",
    });
    b.boxMM("mahogany", -0.8, 1.2, -33.3, 0.8, 2.4, -32.6, {
      tint: [0.45, 0.22, 0.14],
    });
    b.col(-0.8, 1.2, -33.3, 0.8, 2.4, -32.6, {});
    b.plate("art", 0, 1.9, -32.58, 0, 1, 1.0, 0.8, tigerCell());
    // giant tiger banner behind the rostrum, flanked by flags; the tally board
    b.quad(
      "art",
      [-4, 2.4, -36.85],
      [4, 2.4, -36.85],
      [4, 9.4, -36.85],
      [-4, 9.4, -36.85],
      { rect: tigerCell(), tint: [0.95, 0.95, 0.95] },
    );
    b.beam("brass", -4.3, 9.5, -36.8, 4.3, 9.5, -36.8, 0.06, 0.06);
    const fl = K.paint("art", "tam_flag", 256, 160, function (x, X, Y, Wd, Hd) {
      for (let i = 0; i < 13; i++) {
        x.fillStyle = i % 2 ? "#e8e0d0" : "#8a2a22";
        x.fillRect(X, Y + (i * Hd) / 13, Wd, Hd / 13 + 1);
      }
      x.fillStyle = "#1e2e52";
      x.fillRect(X, Y, Wd * 0.42, (Hd * 7) / 13);
      K.stains(x, X, Y, Wd, Hd, 8, 51, 0.5);
    });
    for (const s of [-1, 1]) {
      b.pipe("brass", s * 6.5, 1.2, -36, s * 6.5, 5.6, -36, 0.03, 5);
      b.quad(
        "fabric",
        [s * 6.5, 3.8, -36],
        [s * 6.5 - s * 1.8, 3.6, -35.9],
        [s * 6.5 - s * 1.8, 4.9, -35.9],
        [s * 6.5, 5.3, -36],
        { rect: fl, tint: [0.9, 0.88, 0.84] },
      );
    }
    b.boxMM("wood_dark", 5, 1.4, -36.95, 8.8, 3.9, -36.85, { tint: panel });
    b.plate("art", 6.9, 2.65, -36.84, 0, 1, 3.6, 2.3, tallyBoard());
    b.quad(
      "art",
      [-13.86, 6.4, -18],
      [-13.86, 6.4, -30],
      [-13.86, 8.4, -30],
      [-13.86, 8.4, -18],
      {
        rect: voteBanner(
          "tam_ban3",
          "BOSS CROKE FOR ALDERMAN",
          "the only name you need to know",
        ),
        tint: [0.85, 0.85, 0.85],
      },
    );
    b.quad(
      "art",
      [13.86, 6.4, -30],
      [13.86, 6.4, -18],
      [13.86, 8.4, -18],
      [13.86, 8.4, -30],
      {
        rect: voteBanner(
          "tam_ban4",
          "A VOTE FOR CROKE",
          "is a vote you already cast",
        ),
        tint: [0.85, 0.85, 0.85],
      },
    );
    // folding chairs in rows, many kicked over; a raider camp in the middle
    for (let row = 0; row < 8; row++)
      for (let i = 0; i < 12; i++) {
        const x = -8.8 + i * 1.6 + (i >= 6 ? 0.8 : 0),
          z = -28 + row * 1.9;
        if (Math.abs(x) < 3 && z > -20 && z < -14) continue;
        K.chair(b, x, 0, z, (r() - 0.5) * 0.4, {
          mat: "metal",
          seatMat: "wood",
          tint: [0.4, 0.4, 0.38],
          fallen: r() < 0.3,
        });
      }
    // the camp: burning barrel (prop), mattresses, a stolen voting machine used as a table
    b.boxMM("metal_dark", -1.2, 0, -18.4, 1.2, 1.0, -17.2, {
      tint: [0.3, 0.32, 0.3],
    });
    b.col(-1.2, 0, -18.4, 1.2, 1.0, -17.2, {});
    for (let k = 0; k < 10; k++)
      b.box(
        "flat",
        -1.1 + (k % 5) * 0.45,
        1.0,
        -18.2 + Math.floor(k / 5) * 0.5,
        0.35,
        0.02,
        0.3,
        { tint: [0.9, 0.88, 0.8] },
      );
    b.light(0, 1.6, -15.5, fire, 1.3, 9, { box: HALL });
    b.glow(0, 1.2, -15.5, [1, 0.5, 0.2], 2.4);
    // the fallen chandelier
    b.cyl("brass", -6, 0.1, -24, 1.5, 1.5, 0.08, 18, { top: false });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2;
      b.pipe(
        "brass",
        -6,
        1.4,
        -24,
        -6 + Math.cos(a) * 1.4,
        0.15,
        -24 + Math.sin(a) * 1.4,
        0.015,
        3,
      );
    }
    K.rubble(b, -6, 0, -24, 1.8, 0.5, { seed: 61 });
    b.pipe("black_iron", -6, 10, -24, -5.5, 7.5, -24.3, 0.02, 4);
    // lighting: the remaining chandelier, footlights on the rostrum, fire light
    b.pipe("black_iron", 4, 8.2, -22, 4, 10, -22, 0.02, 4);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2,
        x = 4 + Math.cos(a) * 1.3,
        z = -22 + Math.sin(a) * 1.3;
      b.pipe("brass", 4, 8.3, -22, x, 7.9, z, 0.012, 3);
      if (i % 4)
        b.geo("lamp", K.sphereGeo(), { x, y: 7.95, z, s: 0.06, tint: warm });
    }
    b.cyl("brass", 4, 7.85, -22, 1.35, 1.35, 0.06, 18, { top: false });
    b.light(4, 7.5, -22, warm, 0.9, 14, { box: HALL });
    b.glow(4, 7.9, -22, [0.8, 0.55, 0.3], 3.5);
    for (let k = 0; k < 7; k++) {
      const x = -7.5 + k * 2.5;
      b.geo("lamp", K.sphereGeo(), {
        x,
        y: 1.25,
        z: -31.1,
        s: 0.05,
        tint: k % 3 ? warm : [0.3, 0.3, 0.3],
      });
    }
    b.light(0, 2.5, -33, warm, 1.0, 7, { box: HALL });
    for (const sx of [-1, 1])
      for (const z of [-30, -20]) {
        b.light(sx * 12, galY + 2.5, z, warm, 0.5, 6, { box: HALL });
        b.glow(sx * 13.8, galY + 2.6, z, [0.7, 0.5, 0.3], 0.8);
        b.box("brass", sx * 13.85, galY + 2.4, z, 0.12, 0.3, 0.12, {});
      }
    K.litter(b, -13.5, -30, 13.5, -9.5, 0, 34, 602);
    for (let k = 0; k < 8; k++)
      b.hplate(
        "decal",
        -12 + r() * 24,
        0.012 + k * 0.0004,
        -30 + r() * 20,
        1.2,
        1.2,
        r() * 6,
        K.decal(k % 3 ? "grime" : "blood", 90 + k),
      );

    // ================================================= WEST WING (ground): ward office, patronage office, records room + west stair
    const WB = [-24.1, -0.3, -37.1, -13.9, GH, 0.1];
    K.room(b, ctx, {
      x0: -24,
      z0: -12,
      x1: -14,
      z1: 0,
      y: 0,
      h: GH,
      floor: "wood",
      fc: [0.55, 0.42, 0.3],
      wall: "wallpaper_green",
      wc: [0.7, 0.72, 0.58],
      wain: "wood_dark",
      wainC: panel,
      ceil: "tin",
      cc: [0.55, 0.5, 0.42],
      surface: "wood",
    });
    for (let k = 0; k < 3; k++) {
      const z = -2.5 - k * 3.4;
      const t = K.table(b, -21.5, 0, z, 1.6, 0.9, { mat: "wood_dark" });
      K.chair(b, -21.5, 0, z + 0.8, 0, { mat: "wood_dark", fallen: k === 1 });
      b.box("flat", -21.2, t, z, 0.3, 0.02, 0.4, { tint: [0.9, 0.88, 0.8] });
    }
    b.plate(
      "art",
      -14.12,
      3.0,
      -8,
      -1,
      0,
      3.4,
      0.6,
      K.signCell("tam_ward", "FOURTH WARD · SEE YOUR CAPTAIN", 512, 90, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    b.plate(
      "art",
      -23.88,
      2.2,
      -6,
      1,
      0,
      2.0,
      1.4,
      K.paint("art", "tam_wardmap", 256, 180, function (x, X, Y, Wd, Hd) {
        x.fillStyle = "#e8dcc0";
        x.fillRect(X, Y, Wd, Hd);
        x.strokeStyle = "#6a4a2a";
        x.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          x.beginPath();
          x.moveTo(X + 10 + i * 30, Y + 10);
          x.lineTo(X + 10 + i * 30, Y + Hd - 10);
          x.stroke();
        }
        for (let j = 0; j < 6; j++) {
          x.beginPath();
          x.moveTo(X + 10, Y + 10 + j * 30);
          x.lineTo(X + Wd - 10, Y + 10 + j * 30);
          x.stroke();
        }
        x.fillStyle = "rgba(160,30,20,0.6)";
        x.fillRect(X + 70, Y + 40, 120, 90);
        x.fillStyle = "#2a1a0a";
        x.font = "bold 16px Georgia";
        x.fillText("4th WARD — ALL CROKE", X + 40, Y + Hd - 12);
      }),
    );
    K.lamp(b, -19, 3.9, -6, "pendant", warm, 0.75, 7, {
      ceil: GH,
      shade: "paint_green",
      lightOpts: { box: WB },
    });
    K.loot(ctx, "file_cabinet", -23.5, 0, -11.2, HP, {
      loot: "file_cabinet",
      name: "Voter Rolls",
    });
    K.room(b, ctx, {
      x0: -24,
      z0: -24,
      x1: -14,
      z1: -12,
      y: 0,
      h: GH,
      noFloor: true,
      floor: "wood",
      wall: "wallpaper_green",
      wc: [0.68, 0.7, 0.56],
      wain: "wood_dark",
      wainC: panel,
      ceil: "tin",
      cc: [0.55, 0.5, 0.42],
      surface: "wood",
    });
    // patronage office floor with the west stair hole (x −24..−21, z −21.5..−13)
    b.face("wood", -21, 0, -12, 1, 0, 0, 0, 0, -1, 7, 12, {
      uv: "top",
      tint: [0.55, 0.42, 0.3],
    });
    b.face("wood", -24, 0, -21.5, 1, 0, 0, 0, 0, -1, 3, 2.5, {
      uv: "top",
      tint: [0.55, 0.42, 0.3],
    });
    b.face("wood", -24, 0, -12, 1, 0, 0, 0, 0, -1, 3, 1, {
      uv: "top",
      tint: [0.55, 0.42, 0.3],
    });
    b.col(-21, -0.3, -24, -14, 0, -12, { tag: "floor", surface: "wood" });
    b.col(-24, -0.3, -24, -21, 0, -21.5, { tag: "floor", surface: "wood" });
    b.col(-24, -0.3, -13, -21, 0, -12, { tag: "floor", surface: "wood" });
    K.railing(b, -21, -21.5, -21, -13, 0, {
      h: 1.0,
      mat: "black_iron",
      handMat: "mahogany",
    });
    K.railing(b, -24, -13, -21, -13, 0, {
      h: 1.0,
      mat: "black_iron",
      handMat: "mahogany",
    });
    K.stairs(b, -23.9, -21.5, -21.1, -13, CY, 0, "-z", {
      mat: "concrete",
      tint: [0.55, 0.52, 0.48],
      rail: "r",
      railMat: "black_iron",
      handMat: "mahogany",
    });
    const pdesk = K.table(b, -17.5, 0, -18, 2.4, 1.2, { mat: "mahogany" });
    K.chair(b, -17.5, 0, -18.9, PI, {
      mat: "leather",
      tint: [0.3, 0.18, 0.12],
    });
    for (let k = 0; k < 6; k++)
      b.box(
        "flat",
        -18.3 + k * 0.3,
        pdesk,
        -17.8 + (r() - 0.5) * 0.3,
        0.22,
        0.05 + r() * 0.1,
        0.3,
        { yaw: r() * 0.4, tint: [0.88, 0.85, 0.75] },
      );
    K.terminal(
      ctx,
      "pev_term_tam_patronage",
      -16.6,
      pdesk,
      -18.2,
      0,
      termPatronage(),
      "bare",
    );
    b.plate(
      "art",
      -14.12,
      3.0,
      -18,
      -1,
      0,
      3.4,
      0.6,
      K.signCell("tam_patronage", "PATRONAGE · JOBS · FAVORS", 512, 90, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, -17.5, 3.9, -18, "pendant", warm, 0.8, 7, {
      ceil: GH,
      shade: "paint_green",
      lightOpts: { box: WB },
    });
    K.skel(ctx, -15.4, 0, -22.8, 2.3, "seated");
    K.loot(ctx, "safe", -14.6, 0, -13, -HP, {
      wall: false,
      loot: "safe",
      name: "Patronage Safe",
      lock: K.regLock({
        id: "pev_lk_tam_patronage_safe",
        label: "Patronage Safe",
        kind: "safe",
        code: "1868",
        hint: "The patronage office teletype keeps the safe combination.",
      }),
    });
    K.room(b, ctx, {
      x0: -24,
      z0: -37,
      x1: -14,
      z1: -24,
      y: 0,
      h: GH,
      floor: "wood",
      fc: [0.5, 0.4, 0.3],
      wall: "plaster_stained",
      wc: [0.7, 0.62, 0.5],
      ceil: "plaster",
      cc: [0.5, 0.46, 0.4],
      surface: "wood",
    });
    for (let k = 0; k < 4; k++)
      K.shelf(b, -23.7, 0, -26 - k * 2.6, HP, 2.4, {
        mat: "metal",
        h: 2.4,
        items: ["box", "box", "book"],
        seed: 70 + k,
      });
    K.lamp(b, -19, 3.9, -31, "bulb", warm, 0.6, 7, {
      ceil: GH,
      lightOpts: { box: WB },
    });
    b.plate(
      "decal",
      -14.12,
      1.6,
      -34,
      -1,
      0,
      2.6,
      0.8,
      K.tag("BRAVES ONLY", "#e04030", 256, 96),
    );
    K.loot(ctx, "file_cabinet", -15, 0, -36.4, 0, {
      loot: "file_cabinet",
      name: "Election Records",
    });
    K.loot(ctx, "footlocker", -22, 0, -36.2, 0, {
      loot: "raider_stash",
      name: "Brave's Footlocker",
    });

    // ================================================= EAST WING (ground): grand stair hall, the Tiger Club
    const EB = [13.9, -0.3, -37.1, 24.1, GH, 0.1];
    K.room(b, ctx, {
      x0: 14,
      z0: -12,
      x1: 24,
      z1: 0,
      y: 0,
      h: GH,
      noCeil: true,
      floor: "marble",
      fc: [0.8, 0.78, 0.74],
      wall: "plaster",
      wc: cream,
      wain: "wood_dark",
      wainC: panel,
      ceil: "tin",
    });
    b.face("tin", 14, GH, -12, 1, 0, 0, 0, 0, 1, 7, 12, {
      uv: "top",
      tint: [0.55, 0.5, 0.42],
    });
    b.face("tin", 21, GH, -12, 1, 0, 0, 0, 0, 1, 3, 1.5, {
      uv: "top",
      tint: [0.55, 0.5, 0.42],
    });
    K.stairs(b, 21.1, -10.5, 23.85, -0.5, 0, U2, "-z", {
      mat: "marble",
      tint: [0.8, 0.78, 0.74],
      rail: "r",
      railMat: "brass",
      handMat: "mahogany",
      nosing: "brass",
    });
    K.framed(b, 14.12, 2.6, -8, 1, 0, 1.4, 1.8, K.painting(26, 160, 200), {
      frame: "gold",
    });
    K.lamp(b, 17.5, 3.8, -6, "globe", warm, 0.7, 8, {
      ceil: GH,
      size: 0.18,
      lightOpts: { box: EB },
    });
    K.room(b, ctx, {
      x0: 14,
      z0: -37,
      x1: 24,
      z1: -12,
      y: 0,
      h: GH,
      noFloor: true,
      floor: "carpet",
      wall: "wallpaper",
      wc: [0.65, 0.3, 0.24],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.2,
      ceil: "tin",
      cc: [0.45, 0.4, 0.32],
      surface: "carpet",
    });
    // club floor with the east (cellar) stair hole x 21..24, z −34..−26
    b.face("carpet", 14, 0, -12, 1, 0, 0, 0, 0, -1, 7, 25, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.face("carpet", 21, 0, -12, 1, 0, 0, 0, 0, -1, 3, 14, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.face("carpet", 21, 0, -34, 1, 0, 0, 0, 0, -1, 3, 3, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.col(14, -0.3, -37, 21, 0, -12, { tag: "floor", surface: "carpet" });
    b.col(21, -0.3, -26, 24, 0, -12, { tag: "floor", surface: "carpet" });
    b.col(21, -0.3, -37, 24, 0, -34, { tag: "floor", surface: "carpet" });
    K.railing(b, 21, -34, 21, -26, 0, {
      h: 1.0,
      mat: "brass",
      handMat: "mahogany",
    });
    K.railing(b, 21, -34, 23.9, -34, 0, {
      h: 1.0,
      mat: "brass",
      handMat: "mahogany",
    });
    K.stairs(b, 21.1, -34, 23.9, -26, CY, 0, "+z", {
      mat: "concrete",
      tint: [0.5, 0.48, 0.45],
      rail: "l",
      railMat: "black_iron",
      handMat: "mahogany",
    });
    // the Tiger Club: bar, billiard table, poker table, a stuffed-looking tiger rug
    b.boxMM("mahogany", 14.2, 0, -35.6, 18.6, 1.1, -34.8, {
      tint: [0.45, 0.22, 0.14],
    });
    b.col(14.2, 0, -35.6, 18.6, 1.1, -34.8, { tag: "counter" });
    b.boxMM("mahogany", 14.1, 0, -36.9, 18.6, 2.6, -36.4, {
      tint: [0.36, 0.18, 0.1],
    });
    for (let k = 0; k < 18; k++)
      b.cyl(
        "glass",
        14.4 + k * 0.23,
        1.3 + (k % 2) * 0.6,
        -36.6,
        0.04,
        0.04,
        0.24,
        6,
        {
          tint: r.pick([
            [0.3, 0.45, 0.25],
            [0.5, 0.3, 0.12],
            [0.75, 0.7, 0.5],
          ]),
        },
      );
    for (const yy of [1.25, 1.85])
      b.boxMM("mahogany", 14.1, yy, -36.9, 18.6, yy + 0.04, -36.3, {
        tint: [0.4, 0.2, 0.12],
      });
    b.boxMM("wood_dark", 16.2, 0.75, -24.9, 19.8, 0.95, -23.1, {
      tint: [0.38, 0.22, 0.12],
    });
    b.boxMM("felt", 16.35, 0.95, -24.75, 19.65, 0.97, -23.25, {
      tint: [0.2, 0.42, 0.24],
    });
    for (const [lx, lz] of [
      [16.4, -24.8],
      [19.6, -24.8],
      [16.4, -23.2],
      [19.6, -23.2],
    ])
      b.box("wood_dark", lx, 0, lz, 0.18, 0.75, 0.18, {
        tint: [0.35, 0.2, 0.12],
      });
    for (let k = 0; k < 7; k++)
      b.geo("flat", K.sphereGeo(), {
        x: 17 + r() * 2.2,
        y: 1.0,
        z: -24.5 + r() * 1.1,
        s: 0.03,
        tint: r.pick([
          [0.9, 0.85, 0.2],
          [0.7, 0.1, 0.1],
          [0.1, 0.2, 0.6],
          [0.9, 0.9, 0.85],
        ]),
      });
    b.col(16.2, 0, -24.9, 19.8, 0.97, -23.1, { tag: "furniture" });
    K.lamp(b, 18, 1.8, -24, "pendant", warm, 0.9, 5, {
      ceil: GH,
      shade: "paint_green",
      lightOpts: { box: EB },
    });
    const pk = K.roundTable(b, 17.5, 0, -17, 0.8, {
      mat: "wood_dark",
      cloth: [0.2, 0.42, 0.24],
    });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * PI * 2;
      K.chair(
        b,
        17.5 + Math.cos(a) * 1.3,
        0,
        -17 + Math.sin(a) * 1.3,
        -a - HP,
        { mat: "wood_dark" },
      );
    }
    for (let k = 0; k < 12; k++)
      b.box(
        "flat",
        17.5 + (r() - 0.5) * 1,
        pk,
        -17 + (r() - 0.5) * 1,
        0.06,
        0.02,
        0.09,
        { yaw: r() * 3, tint: [0.9, 0.9, 0.85] },
      );
    b.hplate("art", 20, 0.013, -18.5, 2.6, 1.8, 0.3, tigerCell());
    K.framed(b, 23.88, 2.6, -20, -1, 0, 1.2, 1.6, K.painting(10, 160, 200), {
      frame: "gold",
    });
    K.lamp(b, 17.5, 2.6, -17, "pendant", warm, 0.85, 6, {
      ceil: GH,
      shade: "paint_green",
      lightOpts: { box: EB },
    });
    b.light(16.4, 2.2, -35.5, warm, 0.7, 5, { box: EB });
    K.loot(ctx, "cash_register", 17.8, 1.1, -35.2, 0, {
      loot: "cash_register",
      name: "Club Till",
    });
    K.loot(ctx, "fridge", 23.4, 0, -35.8, -HP, {
      loot: "drinks",
      name: "Club Icebox",
    });

    // ================================================= SECOND FLOOR
    const UB = [-24.1, U2 - 0.3, -37.1, 24.1, U2 + 4, 0.1];
    // east: landing (stair hole), secretary, Boss's office
    K.room(b, ctx, {
      x0: 14,
      z0: -12,
      x1: 24,
      z1: 0,
      y: U2,
      h: 3.8,
      noFloor: true,
      floor: "carpet",
      wall: "wallpaper",
      wc: [0.7, 0.62, 0.5],
      wain: "wood_dark",
      wainC: panel,
      ceil: "plaster",
      cc: [0.55, 0.5, 0.44],
      surface: "carpet",
    });
    b.face("carpet", 14, U2, 0, 1, 0, 0, 0, 0, -1, 7, 12, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.face("carpet", 21, U2, -10.5, 1, 0, 0, 0, 0, -1, 3, 1.5, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.face("carpet", 21, U2, 0, 1, 0, 0, 0, 0, -1, 3, 0.5, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.col(14, U2 - 0.3, -12, 21, U2, 0, { tag: "floor", surface: "carpet" });
    b.col(21, U2 - 0.3, -12, 24, U2, -10.5, {
      tag: "floor",
      surface: "carpet",
    });
    b.col(21, U2 - 0.3, -0.5, 24, U2, 0, { tag: "floor", surface: "carpet" });
    K.railing(b, 21, -10.5, 21, -0.5, U2, {
      h: 1.0,
      mat: "brass",
      handMat: "mahogany",
    });
    K.lamp(b, 18, U2 + 3.2, -6, "globe", warm, 0.6, 7, {
      ceil: U2 + 3.8,
      size: 0.16,
      lightOpts: { box: UB },
    });
    b.plate(
      "art",
      14.12,
      U2 + 2.0,
      -6,
      1,
      0,
      2.6,
      0.5,
      K.signCell("tam_boss_arrow", "THE BOSS WILL SEE YOU →", 512, 90, {
        bg: "#1a1410",
        fg: "#d8701c",
        font: "Georgia, serif",
      }),
    );
    // secretary / anteroom
    K.room(b, ctx, {
      x0: 14,
      z0: -24,
      x1: 24,
      z1: -12,
      y: U2,
      h: 3.8,
      floor: "carpet",
      fc: [0.5, 0.22, 0.2],
      wall: "wallpaper",
      wc: [0.72, 0.64, 0.52],
      wain: "wood_dark",
      wainC: panel,
      ceil: "plaster",
      cc: [0.55, 0.5, 0.44],
      surface: "carpet",
    });
    const sd = K.table(b, 19, U2, -18, 2.0, 1.0, { mat: "mahogany" });
    b.box("paint_black", 18.6, sd, -18, 0.5, 0.25, 0.4, {
      tint: [0.15, 0.15, 0.15],
    }); // typewriter
    K.terminal(
      ctx,
      "pev_term_tam_secretary",
      19.7,
      sd,
      -18.1,
      0,
      termSecretary(),
      "bare",
    );
    // Mrs. Kelly's desk blotter: the appointments teletype passcode, underlined twice
    K.scrawlAt(
      K.world(ctx, 18.9, sd + 0.1, -18.6),
      "Secretary's Blotter",
      'Doodles of tigers. In the corner, underlined twice: "NEW TELETYPE WORD — WIGWAM. The Boss says I may not write it down. — M.K."',
      "pev_lk_tam_secretary",
    );
    K.anchor(ctx, "vault_key", 18.2, sd + 0.02, -17.7);
    for (let k = 0; k < 4; k++)
      K.chair(b, 15, U2, -14 - k * 1.2, HP, {
        mat: "leather",
        tint: [0.35, 0.2, 0.14],
      });
    b.plate(
      "art",
      15.5,
      U2 + 2.2,
      -23.88,
      0,
      1,
      2.4,
      0.5,
      K.signCell("tam_waiting", "PETITIONERS WAIT HERE", 384, 80, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, 19, U2 + 2.4, -18, "pendant", warm, 0.8, 6, {
      ceil: U2 + 3.8,
      shade: "paint_green",
      lightOpts: { box: UB },
    });
    K.skel(ctx, 15.1, U2, -15.2, HP, "seated");
    // THE BOSS'S OFFICE
    const BO = [13.9, U2 - 0.3, -37.1, 24.1, U2 + 4, -23.9];
    K.room(b, ctx, {
      x0: 14,
      z0: -37,
      x1: 24,
      z1: -24,
      y: U2,
      h: 3.8,
      floor: "parquet",
      fc: [0.6, 0.45, 0.32],
      wall: "wallpaper_green",
      wc: [0.6, 0.64, 0.5],
      wain: "mahogany",
      wainC: [0.45, 0.22, 0.14],
      wainH: 1.3,
      ceil: "tin",
      cc: [0.6, 0.55, 0.45],
      cornice: true,
      surface: "wood",
    });
    const bd = K.table(b, 20.5, U2, -32.5, 3.2, 1.5, { mat: "mahogany" });
    b.boxMM("mahogany", 19, U2, -33.2, 22, U2 + 0.72, -33.1, {
      tint: [0.42, 0.2, 0.12],
    });
    K.chair(b, 20.5, U2, -33.6, PI, { mat: "leather", tint: [0.4, 0.14, 0.1] });
    b.box("brass", 21.6, bd, -32.4, 0.14, 0.34, 0.14, {});
    b.geo("green_paint", K.sphereGeo(), {
      x: 21.6,
      y: bd + 0.38,
      z: -32.4,
      sx: 0.28,
      sy: 0.08,
      sz: 0.12,
      tint: [0.2, 0.5, 0.3],
    });
    b.light(21.4, bd + 0.4, -32.2, [1, 0.9, 0.65], 0.9, 5, { box: BO });
    b.glow(21.6, bd + 0.3, -32.4, [0.6, 0.5, 0.3], 0.9);
    b.cyl("glass", 19.6, bd, -32.2, 0.05, 0.05, 0.14, 8, {
      tint: [0.35, 0.2, 0.08],
    });
    b.cyl("glass", 19.8, bd, -32.3, 0.05, 0.05, 0.14, 8, {
      tint: [0.35, 0.2, 0.08],
    }); // two darks — Deck's
    b.cyl("ceramic", 19.3, bd, -32.6, 0.12, 0.1, 0.03, 10);
    b.pipe("flat", 19.3, bd + 0.05, -32.6, 19.45, bd + 0.05, -32.5, 0.012, 4, {
      tint: [0.5, 0.35, 0.2],
    }); // ashtray + cigar
    K.terminal(
      ctx,
      "pev_term_tam_boss",
      19.9,
      bd,
      -32.8,
      0,
      termBoss(),
      "bare",
    );
    b.hplate("art", 20.5, U2 + 0.013, -30, 3.0, 2.0, 0, tigerCell());
    K.framed(
      b,
      20.5,
      U2 + 2.4,
      -36.88,
      0,
      1,
      1.6,
      2.0,
      K.painting(18, 160, 200),
      { frame: "gold" },
    );
    for (const x of [16, 25 - 1.2])
      K.framed(
        b,
        x,
        U2 + 2.3,
        -36.88,
        0,
        1,
        0.8,
        1.0,
        K.painting(34 + ((x | 0) % 3), 128, 160),
        { frame: "gold" },
      );
    b.cyl("wood_dark", 15.2, U2, -35.8, 0.2, 0.28, 0.8, 8);
    b.geo("flat", K.sphereGeo(), {
      x: 15.2,
      y: U2 + 1.15,
      z: -35.8,
      s: 0.33,
      tint: [0.55, 0.62, 0.5],
    });
    K.shelf(b, 23.7, U2, -30, -HP, 4, {
      mat: "mahogany",
      h: 2.6,
      items: ["book", "book", "box"],
      seed: 88,
    });
    K.sofa(b, 16, U2, -27, 2.4, HP, { mat: "leather", tint: [0.4, 0.14, 0.1] });
    // the window over the Wigwam (the Boss's box): opening in the west wall to the east gallery
    K.lamp(b, 19, U2 + 3.2, -28, "globe", warm, 0.6, 8, {
      ceil: U2 + 3.8,
      size: 0.2,
      lightOpts: { box: BO },
    });
    K.anchor(ctx, "boss", 20.5, U2, -31.2);
    K.anchor(ctx, "bodyguard", 16.2, U2, -29.5);
    K.loot(ctx, "safe", 23.4, U2, -36.3, -HP, {
      loot: "safe",
      name: "The Boss's Personal Safe",
      tag: "bosssafe",
      lock: K.regLock({
        id: "pev_lk_tam_boss_safe",
        label: "The Boss's Personal Safe",
        kind: "safe",
        code: "1102",
        hint: "The Boss's own teletype opens it — and names Election Day.",
      }),
    });
    // west: council room + archive (reached via the west gallery)
    K.room(b, ctx, {
      x0: -24,
      z0: -20,
      x1: -14,
      z1: 0,
      y: U2,
      h: 3.8,
      floor: "parquet",
      fc: [0.55, 0.42, 0.3],
      wall: "wallpaper",
      wc: [0.7, 0.62, 0.5],
      wain: "wood_dark",
      wainC: panel,
      ceil: "tin",
      cc: [0.55, 0.5, 0.42],
      cornice: true,
      surface: "wood",
    });
    const ct = K.table(b, -19, U2, -10, 1.6, 12, { mat: "mahogany" });
    for (let k = 0; k < 6; k++)
      for (const s of [-1, 1])
        K.chair(b, -19 + s * 1.1, U2, -15 + k * 2, s > 0 ? HP : -HP, {
          mat: "leather",
          tint: [0.4, 0.14, 0.1],
          fallen: r() < 0.15,
        });
    K.chair(b, -19, U2, -16.6, PI, { mat: "leather", tint: [0.5, 0.12, 0.08] });
    for (let k = 0; k < 8; k++)
      K.framed(
        b,
        -23.88,
        U2 + 2.2,
        -2 - k * 2.2,
        1,
        0,
        0.8,
        1.0,
        K.painting(2 + k * 8, 128, 160),
        { frame: "gold" },
      );
    b.plate(
      "art",
      -19,
      U2 + 3.1,
      -0.14,
      0,
      -1,
      4.4,
      0.5,
      K.signCell(
        "tam_sachems",
        "THE GRAND SACHEMS OF THE SOCIETY OF TAMMANY",
        768,
        80,
        { bg: "#1a1410", fg: "#c8a050", font: "Georgia, serif" },
      ),
    );
    for (let k = 0; k < 5; k++)
      b.box("flat", -19 + (r() - 0.5) * 1, ct, -14 + k * 2.2, 0.3, 0.02, 0.4, {
        yaw: r(),
        tint: [0.9, 0.88, 0.8],
      });
    K.lamp(b, -19, U2 + 3.0, -6, "globe", warm, 0.6, 8, {
      ceil: U2 + 3.8,
      size: 0.16,
      lightOpts: { box: UB },
    });
    K.lamp(b, -19, U2 + 3.0, -14, "globe", warm, 0.5, 7, {
      ceil: U2 + 3.8,
      size: 0.16,
      lightOpts: { box: UB },
    });
    K.room(b, ctx, {
      x0: -24,
      z0: -37,
      x1: -14,
      z1: -20,
      y: U2,
      h: 3.8,
      floor: "wood",
      fc: [0.5, 0.4, 0.3],
      wall: "plaster_stained",
      wc: [0.7, 0.62, 0.5],
      ceil: "plaster",
      cc: [0.5, 0.46, 0.4],
      surface: "wood",
    });
    for (let k = 0; k < 5; k++)
      K.shelf(b, -23.7, U2, -22.5 - k * 2.8, HP, 2.6, {
        mat: "wood_dark",
        h: 3.0,
        items: ["book", "box", "book"],
        seed: 90 + k,
      });
    b.boxMM("cast_iron", -18.5, U2, -33.5, -16.5, U2 + 1.6, -31.5, {
      tint: [0.3, 0.28, 0.26],
    });
    b.cyl("cast_iron", -17.5, U2 + 1.6, -32.5, 0.5, 0.5, 0.3, 12);
    b.col(-18.5, U2, -33.5, -16.5, U2 + 1.9, -31.5, {}); // ballot printing press
    b.plate(
      "art",
      -14.12,
      U2 + 2.2,
      -29,
      -1,
      0,
      2.4,
      0.6,
      K.signCell("tam_archive", "ARCHIVE — ELECTIONS 1854–1967", 384, 90, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, -19, U2 + 3.0, -28, "bulb", warm, 0.6, 7, {
      ceil: U2 + 3.8,
      lightOpts: { box: UB },
    });
    K.note(ctx, "pev_note_tam_plunkitt", -17.2, U2 + 1.62, -32.3, {
      name: "Printing Plate Proof",
      title: "Proof sheet, Fourth Ward ballot (1967)",
      text: 'PROOF — PLEASE CHECK BEFORE PRINTING 40,000 COPIES\n\n[X] CROKE\n\nNote from the printer: "Mr. Croke, the X is already printed on the ballot. Is that... legal?"\nReply, in blue pencil: "It\'s efficient. Print it."\nSecond note: "There are more ballots than people in the ward."\nReply: "There are more people in the ward than you think. Some of them are in Green-Wood Cemetery. They vote very reliably."',
    });
    K.loot(ctx, "file_cabinet", -15, U2, -36.4, 0, {
      loot: "file_cabinet",
      name: "Sealed Election Returns",
    });

    // ================================================= CELLAR
    const CB = [-24.1, CY - 0.2, -37.1, 24.1, -0.2, -11.9];
    // coal room (east stair foot) + chute
    K.room(b, ctx, {
      x0: 14,
      z0: -37,
      x1: 24,
      z1: -26,
      y: CY,
      h: 3.7,
      noFloor: true,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.5, 0.36, 0.3],
      ceil: "concrete",
      cc: [0.3, 0.28, 0.26],
      noCeil: true,
      trim: false,
    });
    b.face("concrete", 14, CY, -26, 1, 0, 0, 0, 0, -1, 7, 11, {
      uv: "top",
      tint: [0.3, 0.28, 0.26],
    });
    b.face("concrete", 21, CY, -34, 1, 0, 0, 0, 0, -1, 3, 3, {
      uv: "top",
      tint: [0.3, 0.28, 0.26],
    });
    b.col(14, CY - 0.3, -37, 21, CY, -26, { tag: "floor" });
    b.col(21, CY - 0.3, -37, 24, CY, -34, { tag: "floor" });
    b.face("concrete", 14, -0.3, -37, 1, 0, 0, 0, 0, 1, 7, 11, {
      uv: "top",
      tint: [0.3, 0.28, 0.26],
    });
    for (let k = 0; k < 30; k++)
      b.geo("paint_black", K.sphereGeo(), {
        x: 15.5 + r() * 3,
        y: CY + r() * 0.8,
        z: -35.5 + r() * 3,
        s: 0.1 + r() * 0.15,
        tint: [0.08, 0.08, 0.08],
      });
    b.col(15, CY, -36.5, 19, CY + 0.9, -32, {});
    b.boxMM("metal_dark", 23.4, CY + 1.4, -30.5, 24, CY + 3.4, -28.5, {
      tint: [0.3, 0.28, 0.26],
    });
    b.quad(
      "rust",
      [23.4, CY + 1.4, -28.5],
      [23.4, CY + 1.4, -30.5],
      [21.8, CY + 0.2, -30.5],
      [21.8, CY + 0.2, -28.5],
      { tint: [0.5, 0.4, 0.3] },
    ); // chute slide
    b.plate(
      "decal",
      23.88,
      CY + 2.2,
      -27,
      -1,
      0,
      1.6,
      0.6,
      K.tag("COAL CHUTE ↑", "#e8e8e0", 192, 72),
    );
    K.lamp(b, 18, CY + 3.2, -30, "cage", warm, 0.6, 7, {
      ceil: -0.3,
      lightOpts: { box: CB },
    });
    // ballot room (under the hall, north)
    K.room(b, ctx, {
      x0: -14,
      z0: -37,
      x1: 14,
      z1: -26,
      y: CY,
      h: 3.7,
      floor: "concrete",
      fc: [0.45, 0.42, 0.38],
      wall: "brick_red",
      wc: [0.55, 0.4, 0.34],
      ceil: "concrete",
      cc: [0.34, 0.32, 0.3],
      trim: false,
    });
    for (let k = 0; k < 18; k++) {
      const x = -12 + (k % 9) * 2.6,
        z = k < 9 ? -35.8 : -33.6;
      b.box("wood", x, CY, z, 1.1, 0.8 + (k % 3) * 0.4, 0.9, {
        yaw: (r() - 0.5) * 0.2,
        tint: [0.6, 0.5, 0.34],
      });
      b.plate(
        "art",
        x,
        CY + 0.5,
        z + 0.46,
        0,
        1,
        0.8,
        0.3,
        K.signCell("tam_crate", "BALLOTS (MARKED)", 192, 64, {
          bg: "#c8b890",
          fg: "#8a1a10",
          font: "Arial, sans-serif",
        }),
      );
    }
    b.col(-13, CY, -36.5, 11, CY + 1.6, -33, {});
    for (let k = 0; k < 40; k++)
      b.hplate(
        "flat",
        -12 + r() * 24,
        CY + 0.012 + k * 0.0002,
        -32 + r() * 5,
        0.2,
        0.3,
        r() * 6,
        null,
        { tint: [0.88, 0.85, 0.75] },
      );
    b.boxMM("metal_dark", 2, CY, -29.5, 5, CY + 1.3, -27.5, {
      tint: [0.3, 0.32, 0.3],
    });
    b.col(2, CY, -29.5, 5, CY + 1.3, -27.5, {});
    b.plate(
      "art",
      3.5,
      CY + 1.6,
      -27.48,
      0,
      1,
      2.2,
      0.4,
      K.signCell("tam_vm", 'VOTING MACHINE — "ADJUSTED"', 384, 70, {
        bg: "#1a1a1a",
        fg: "#e8d8b0",
        font: "Arial, sans-serif",
      }),
    );
    for (const x of [-8, 0, 8])
      K.lamp(b, x, CY + 3.2, -31, "bulb", warm, 0.6, 7, {
        ceil: CY + 3.7,
        lightOpts: { box: CB },
      });
    // holding cells (for "uncooperative voters")
    K.room(b, ctx, {
      x0: -14,
      z0: -26,
      x1: 14,
      z1: -12,
      y: CY,
      h: 3.7,
      floor: "concrete",
      fc: [0.42, 0.4, 0.37],
      wall: "celltile",
      wc: [0.7, 0.72, 0.62],
      ceil: "concrete",
      cc: [0.34, 0.32, 0.3],
      trim: false,
    });
    // cells along the south wall (z −16..−12), bars at z = −16
    for (let k = 0; k < 5; k++) {
      const cx0 = -12 + k * 5.2,
        cx1 = cx0 + 4.4;
      K.segWall(b, cx1, -16, cx1, -12, CY, CY + 3.7, 1, {
        mat: "celltile",
        tint: [0.6, 0.62, 0.54],
        trim: false,
        both: true,
      });
      const doorX = cx0 + 3.4;
      for (let x = cx0 + 0.1; x < cx1; x += 0.22) {
        if (Math.abs(x - doorX) < 0.55) continue;
        b.pipe("black_iron", x, CY, -16, x, CY + 2.8, -16, 0.018, 4);
      }
      b.beam("black_iron", cx0, CY + 2.8, -16, cx1, CY + 2.8, -16, 0.1, 0.08);
      b.beam("black_iron", cx0, CY + 0.1, -16, cx1, CY + 0.1, -16, 0.08, 0.06);
      b.col(cx0, CY, -16.1, doorX - 0.55, CY + 2.9, -15.9, { walkable: false });
      b.col(doorX + 0.55, CY, -16.1, cx1, CY + 2.9, -15.9, { walkable: false });
      b.boxMM("metal", cx0 + 0.2, CY, -13, cx0 + 2.2, CY + 0.45, -12.2, {
        tint: [0.4, 0.4, 0.38],
      });
      if (k !== 3)
        K.skel(
          ctx,
          cx0 + 1.2,
          CY + 0.45,
          -12.6,
          r() * 3,
          k % 2 ? "curled" : "lying",
        );
    }
    K.anchor(ctx, "captive", -12 + 3 * 5.2 + 1.8, CY, -13.6);
    ctx.harrietCellX = -12 + 3 * 5.2 + 3.4;
    b.plate(
      "art",
      0,
      CY + 3.0,
      -25.88,
      0,
      1,
      4.4,
      0.5,
      K.signCell(
        "tam_cells",
        "UNCOOPERATIVE VOTERS — PLEASE RECONSIDER",
        768,
        80,
        { bg: "#1a1410", fg: "#d8701c", font: "Arial, sans-serif" },
      ),
    );
    for (const x of [-8, 0, 8])
      K.lamp(b, x, CY + 3.2, -19, "cage", [0.85, 0.9, 0.8], 0.55, 7, {
        ceil: CY + 3.7,
        lightOpts: { box: CB },
      });
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -12 + r() * 24,
        CY + 0.012 + k * 0.0004,
        -24 + r() * 7,
        1.1,
        1.1,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", 110 + k),
      );
    // west stair foot (strongroom antechamber)
    K.room(b, ctx, {
      x0: -24,
      z0: -24,
      x1: -14,
      z1: -12,
      y: CY,
      h: -CY,
      noFloor: true,
      noCeil: true,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.5, 0.36, 0.3],
      trim: false,
    });
    b.face("concrete", -24, CY, -12, 1, 0, 0, 0, 0, -1, 10, 12, {
      uv: "top",
      tint: [0.42, 0.4, 0.37],
    });
    b.col(-24, CY - 0.3, -24, -14, CY, -12, { tag: "floor" });
    b.face("concrete", -21, -0.3, -24, 1, 0, 0, 0, 0, 1, 7, 12, {
      uv: "top",
      tint: [0.3, 0.28, 0.26],
    });
    K.lamp(b, -17, CY + 3.2, -19, "cage", [1, 0.3, 0.15], 0.6, 6, {
      ceil: -0.3,
      lightOpts: { box: CB },
    });
    b.plate(
      "art",
      -18,
      CY + 2.8,
      -23.86,
      0,
      1,
      3.0,
      0.45,
      K.signCell("tam_vault_sign", "THE WIGWAM VAULT — BOSS ONLY", 512, 76, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    K.terminal(
      ctx,
      "pev_term_tam_vault",
      -15.8,
      CY + 1.3,
      -23.86,
      0,
      termVault(),
      "wall",
    );
    // THE VAULT (reward room)
    const VB = [-24.1, CY - 0.2, -37.1, -13.9, -0.2, -23.9];
    K.room(b, ctx, {
      x0: -24,
      z0: -37,
      x1: -14,
      z1: -24,
      y: CY,
      h: 3.4,
      floor: "marble",
      fc: [0.6, 0.58, 0.54],
      wall: "metal",
      wc: [0.55, 0.58, 0.56],
      ceil: "metal",
      cc: [0.4, 0.42, 0.4],
      trim: false,
      surface: "metal",
    });
    b.boxMM("mahogany", -19.6, CY, -35.2, -18.4, CY + 1.2, -34.4, {
      tint: [0.45, 0.22, 0.14],
    });
    b.quad(
      "mahogany",
      [-19.7, CY + 1.2, -34.3],
      [-18.3, CY + 1.2, -34.3],
      [-18.3, CY + 1.45, -35.2],
      [-19.7, CY + 1.45, -35.2],
      { tint: [0.42, 0.2, 0.12] },
    );
    b.col(-19.6, CY, -35.2, -18.4, CY + 1.2, -34.4, {});
    K.anchor(ctx, "ledger", -19, CY + 1.36, -34.8);
    b.light(-19, CY + 3.0, -34.5, [1, 0.85, 0.55], 1.1, 5, { box: VB });
    b.glow(-19, CY + 3.2, -34.5, [0.8, 0.6, 0.3], 1.2);
    b.cyl("black_iron", -19, CY + 3.1, -34.5, 0.3, 0.1, 0.3, 8, { top: false });
    for (let k = 0; k < 8; k++)
      b.box(
        "gold",
        -23 + (k % 4) * 0.35,
        CY + 0.9 + Math.floor(k / 4) * 0.12,
        -30,
        0.3,
        0.1,
        0.14,
        { tint: [0.95, 0.75, 0.3] },
      );
    b.boxMM("metal", -23.9, CY, -31, -21.5, CY + 0.9, -29, {
      tint: [0.5, 0.52, 0.5],
    });
    b.col(-23.9, CY, -31, -21.5, CY + 0.9, -29, {});
    for (let k = 0; k < 12; k++)
      b.box(
        "flat",
        -16 + (k % 4) * 0.4,
        CY + 0.9 + Math.floor(k / 4) * 0.08,
        -35.5,
        0.34,
        0.07,
        0.16,
        { tint: [0.55, 0.65, 0.5] },
      ); // old-world money bricks
    b.boxMM("metal", -16.8, CY, -36.2, -14.2, CY + 0.9, -34.8, {
      tint: [0.5, 0.52, 0.5],
    });
    b.col(-16.8, CY, -36.2, -14.2, CY + 0.9, -34.8, {});
    for (let k = 0; k < 20; k++) {
      const x = -23.7 + (k % 5) * 0.5,
        z = -26 - Math.floor(k / 5) * 0.4;
      b.boxMM(
        "metal_dark",
        x,
        CY + 1.2 + (k % 3) * 0.5,
        -24.2,
        x + 0.45,
        CY + 1.6 + (k % 3) * 0.5,
        -24.12,
        { tint: [0.4, 0.42, 0.4] },
      );
      void z;
    } // deposit boxes
    b.boxMM("metal", -21.5, CY + 2.2, -36.95, -16.5, CY + 2.9, -36.9, {
      tint: [0.6, 0.55, 0.4],
    });
    b.plate(
      "art",
      -19,
      CY + 2.55,
      -36.88,
      0,
      1,
      4.6,
      0.55,
      K.signCell(
        "tam_plunkitt",
        '"I SEEN MY OPPORTUNITIES AND I TOOK \'EM."',
        768,
        90,
        { bg: "#1a1410", fg: "#c8a050", font: "Georgia, serif" },
      ),
    );
    K.loot(ctx, "safe", -14.6, CY, -36.2, -HP, {
      loot: "safe",
      name: "Slush Fund",
      lock: K.regLock({
        id: "pev_lk_tam_slush",
        label: "Slush Fund",
        kind: "safe",
        code: "1789",
        hint: "A Brave scratched the combination into the coal-room brick.",
      }),
    });
    K.scrawlAt(
      K.world(ctx, -13.8, CY + 1.4, -35.4),
      "Scratched Brick",
      'Scratched into the whitewash with a nail: "SLUSH = YEAR WE WAS FOUNDED. 1789. Don\'t tell Kelly." Somebody has added, in better handwriting: "Kelly knows."',
      "pev_lk_tam_slush",
    );
    K.loot(ctx, "ammo_box", -23.3, CY, -33.5, HP, {
      large: true,
      loot: "weapon_crate",
      name: "Braves' Armory",
    });
    K.loot(ctx, "crate", -22.5, CY, -36.2, 0.2, {
      kind: "military",
      loot: "weapon_crate",
      name: "Election Day Supplies",
    });

    // ================================================= doors, anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    // arrival beside the ballot-box barricade (x ±3.4, z −2.2..−1.4, right behind the doors), facing into the lobby
    K.door(ctx, {
      id: "pev_tam_in",
      pos: new THREE.Vector3(X0 - 0.3, 2.2, DOOR_Z),
      label: "Tammany Hall",
      verb: "Enter",
      target: { x: OX - 4.4, y: OY, z: OZ - 1.2, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("tammany_hall")),
    });
    K.door(ctx, {
      id: "pev_tam_out",
      pos: new THREE.Vector3(OX, OY + 1.4, OZ - 0.3),
      label: "Union Square East",
      verb: "Leave",
      target: { x: X0 - 3.4, y: 0.9, z: DOOR_Z, yaw: HP },
    });
    // the coal chute: padlocked from the street (a coal-man's tag gives the combination); climbing out from inside unlocks it
    K.door(ctx, {
      id: "pev_tam_chute_in",
      pos: new THREE.Vector3(CHUTE.x, 1.1, Z1 + 1.0),
      label: "Tammany Coal Chute",
      verb: "Climb In",
      lock: K.regLock({
        id: "pev_lk_tam_chute",
        label: "Tammany Coal Chute",
        kind: "door",
        code: "4140",
        hint: "The coal company's delivery tag wired to the hatch.",
      }),
      target: { x: OX + 20.5, y: OY + CY, z: OZ - 29.5, yaw: HP },
    });
    K.scrawlAt(
      new THREE.Vector3(CHUTE.x + 0.7, 0.6, Z1 + 1.2),
      "Coal Delivery Tag",
      'A tin tag wired to the hatch: "CONSOLIDATED COAL — DELIVERIES MON & THU — PADLOCK 4-1-4-0 — RETURN TAG TO DRIVER." Nobody returned the tag.',
      "pev_lk_tam_chute",
    );
    K.door(ctx, {
      id: "pev_tam_chute_out",
      pos: new THREE.Vector3(OX + 23.3, OY + CY + 1.6, OZ - 29.5),
      label: "Coal Chute (14th Street)",
      verb: "Climb Out",
      target: { x: CHUTE.x, y: 0, z: Z1 + 2.6, yaw: PI },
      onEnter: () =>
        K.safe("chute unlock", () => {
          if (!G.isStub("locks") && G.locks.unlock)
            G.locks.unlock("pev_lk_tam_chute");
        }),
    });
    K.anchor(ctx, "entrance", -4.4, 0, -1.2); // = the arrival spot (the centre is the ballot-box barricade)
    K.anchor(ctx, "rostrum", 0, 1.2, -34.2); // behind the lectern (z −33.3..−32.6), not inside it
    K.anchor(ctx, "strongroom", VAULT.x, CY, VAULT.z + 1.5);
    [
      [-6, 0, -4],
      [-5, 0, -22],
      [7, 0, -17],
      [18, 0, -20],
      [-18.5, 0, -8],
      [0, CY, -31],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", -19, CY, -34);
    K.anchor(ctx, "loot2", 23.4, U2, -36.3);
    K.anchor(ctx, "loot3", -14.6, 0, -13);
    ctx.combatBoss = new THREE.Vector3(OX - 17, OY + CY, OZ - 18); // the "precinct captain" combat puts on the strongroom
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_tammany_int";

    // ---- the strongroom door (round, swings open) + Harriet's cell door: separate so they can move ----
    const vb = K.builder({
      name: "tam_vaultdoor",
      off: { x: 0, y: 0, z: 0 },
      lit: true,
      amb: [0.2, 0.2, 0.2],
      grime: 0.3,
    });
    vb.light(0.8, 2.4, 2.0, [1, 0.5, 0.3], 0.9, 6);
    vb.geo("steel", K.unitCyl(24), {
      x: 0.8,
      y: 1.15,
      z: 0,
      sx: 1.2,
      sy: 0.35,
      sz: 1.2,
      rx: HP,
      tint: [0.62, 0.64, 0.62],
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      vb.geo("steel", K.unitCyl(8), {
        x: 0.8 + Math.cos(a) * 1.0,
        y: 1.15 + Math.sin(a) * 1.0,
        z: 0.2,
        sx: 0.07,
        sy: 0.12,
        sz: 0.07,
        rx: HP,
        tint: [0.5, 0.52, 0.5],
      });
    }
    vb.geo("brass", K.unitCyl(6), {
      x: 0.8,
      y: 1.15,
      z: 0.25,
      sx: 0.08,
      sy: 0.25,
      sz: 0.08,
      rx: HP,
    });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * PI * 2;
      vb.beam(
        "brass",
        0.8,
        1.15,
        0.35,
        0.8 + Math.cos(a) * 0.45,
        1.15 + Math.sin(a) * 0.45,
        0.35,
        0.05,
        0.05,
      );
    }
    const vdoor = vb.finish(null);
    const pivot = new THREE.Group();
    pivot.position.set(O.x + VAULT.x - 0.8, O.y + CY, O.z + VAULT.z + 0.2);
    pivot.add(vdoor);
    ctx.intRoot.add(pivot);
    ctx.vaultDoor = { pivot, col: null, t: 0, opening: false };
    const cb = K.builder({
      name: "tam_celldoor",
      off: { x: 0, y: 0, z: 0 },
      lit: true,
      amb: [0.2, 0.2, 0.2],
      grime: 0.3,
    });
    cb.light(0.5, 2.2, 1.5, [0.85, 0.9, 0.8], 0.7, 5);
    for (let x = 0.05; x <= 1.06; x += 0.2)
      cb.pipe("black_iron", x, 0, 0, x, 2.8, 0, 0.018, 4);
    cb.beam("black_iron", 0, 1.4, 0, 1.1, 1.4, 0, 0.06, 0.05);
    cb.beam("black_iron", 0, 2.75, 0, 1.1, 2.75, 0, 0.06, 0.05);
    cb.box("brass", 1.0, 1.2, 0.04, 0.12, 0.2, 0.08, {});
    const cdoor = cb.finish(null);
    const cpivot = new THREE.Group();
    cpivot.position.set(O.x + ctx.harrietCellX - 0.55, O.y + CY, O.z - 16);
    cpivot.add(cdoor);
    ctx.intRoot.add(cpivot);
    ctx.cellDoor = { pivot: cpivot, col: null };
    // interactables: strongroom door & Harriet's cell door
    K.safe("vaultint", () =>
      G.world.addInteractable({
        pos: new THREE.Vector3(
          O.x + VAULT.x,
          O.y + CY + 1.2,
          O.z + VAULT.z + 0.4,
        ),
        radius: 1.0,
        label: "Tammany Strongroom",
        verb: "Open",
        priority: 1,
        locked: () => (EV.flag("tam_vault_open") ? null : "Locked"),
        enabled: () => !EV.flag("tam_vault_open"),
        onInteract: () => tryVault(ctx),
      }),
    );
    K.safe("cellint", () =>
      G.world.addInteractable({
        pos: new THREE.Vector3(
          O.x + ctx.harrietCellX,
          O.y + CY + 1.2,
          O.z - 15.8,
        ),
        radius: 0.8,
        label: "Cell Door",
        verb: "Open",
        priority: 1,
        locked: () => (EV.flag("harriet_cell_open") ? null : "Locked"),
        enabled: () => !EV.flag("harriet_cell_open"),
        onInteract: () => tryCell(ctx),
      }),
    );
  }

  // ------------------------------------------------------------------ movable doors
