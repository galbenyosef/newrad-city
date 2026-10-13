// play-inline-344 04 — tint
// Lines 1985-2323 of readable/play-inline-344.pretty.js (statement-aligned).
  function patrolmanPod(b, x, y, z, yaw, lit) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    b.cyl("metal_dark", x, y, z, 0.85, 0.9, 0.3, 14, {
      tint: [0.3, 0.32, 0.34],
    });
    b.box("metal", x - 0.62 * s, y + 0.3, z - 0.62 * c, 1.5, 2.5, 0.25, {
      yaw,
      tint: [0.45, 0.5, 0.52],
    });
    b.cyl("glass_clear", x, y + 0.3, z, 0.75, 0.75, 2.4, 14, {
      top: false,
      arc0: -yaw - 0.1,
      arc: PI + 0.2,
      tint: [0.65, 0.8, 0.85],
    });
    b.cyl("metal_dark", x, y + 2.7, z, 0.9, 0.8, 0.35, 14, {
      tint: [0.3, 0.32, 0.34],
    });
    b.geo("lamp", K.sphereGeo(), {
      x,
      y: y + 3.1,
      z,
      s: 0.14,
      tint: lit ? [1, 0.6, 0.15] : [0.2, 0.18, 0.15],
    });
    if (lit) b.glow(x, y + 3.1, z, [1, 0.5, 0.1], 1.2);
    b.plate(
      "art",
      x - 0.5 * s + 0.0,
      y + 2.45,
      z - 0.49 * c,
      -s,
      -c,
      1.0,
      0.18,
      K.signCell("pc_pd_pod", "PATROLMAN · CHARGING", 256, 40, {
        bg: "#1a1a1a",
        fg: "#f0c040",
      }),
    );
    b.col(x - 0.9, y, z - 0.9, x + 0.9, y + 2.9, z + 0.9, { tag: "pod" });
  }
  K.patrolmanPod = patrolmanPod;

  // ------------------------------------------------------------------ DISTANT PROXY
  // Façade band painted to match the near geometry (rustication, round-headed ground windows, three
  // window rows, cornices); one bay per tile so the far windows sit where the near ones are.
  K.addCustom(
    "pd_far",
    function (x, S, r) {
      const Y = (m) => S * (1 - m / ROOF),
        W = (m) => (S * m) / 4.4;
      x.fillStyle = "#cfc5ae";
      x.fillRect(0, 0, S, S);
      x.fillStyle = "#bdb29a";
      x.fillRect(0, Y(G1), S, Y(1.2) - Y(G1));
      x.fillStyle = "rgba(70,60,45,0.45)";
      for (let m = 1.2; m < G1; m += 0.8) x.fillRect(0, Y(m), S, 3);
      x.fillStyle = "#8a857c";
      x.fillRect(0, Y(1.2), S, S - Y(1.2));
      x.fillStyle = "#b3a890";
      for (const m of [G1, G2, G2 + 0.6, ROOF - 0.3])
        x.fillRect(0, Y(m) - 5, S, 10);
      const cx = S / 2,
        win = (w, y0, y1, arch) => {
          x.fillStyle = "#d8ceb6";
          x.fillRect(
            cx - W(w / 2 + 0.12),
            Y(y1 + 0.12),
            W(w + 0.24),
            Y(y0 - 0.12) - Y(y1 + 0.12),
          );
          x.fillStyle = "#1d1f1e";
          x.fillRect(
            cx - W(w / 2),
            Y(arch ? y1 - w / 2 : y1),
            W(w),
            Y(y0) - Y(arch ? y1 - w / 2 : y1),
          );
          if (arch) {
            x.beginPath();
            x.ellipse(
              cx,
              Y(y1 - w / 2),
              W(w / 2),
              Y(y1 - w / 2) - Y(y1),
              0,
              PI,
              0,
            );
            x.fill();
          }
          x.fillStyle = "rgba(160,170,165,0.18)";
          x.fillRect(cx - W(w / 2), Y(y1) + 2, W(w * 0.4), Y(y0) - Y(y1) - 4);
        };
      win(1.7, 2.2, 6.0, true);
      win(1.6, 8.6, 11.6);
      win(1.5, 13.1, 15.5);
      win(1.1, 18.2, 19.4);
      x.fillStyle = "rgba(235,228,210,0.55)";
      x.fillRect(0, Y(G2), W(0.45), Y(G1) - Y(G2));
      x.fillRect(S - W(0.45), Y(G2), W(0.45), Y(G1) - Y(G2));
      K.stains(x, 0, 0, S, S, 20, 1511, 0.3, [60, 50, 35]);
      K.streaks(x, 0, 0, S, S, 30, 1512, 0.25);
    },
    { tile: [4.4, ROOF], rough: 0.85, size: 256 },
  );

  function farProxy(ctx) {
    const b = K.builder({
      name: "pd_far",
      grime: 0.35,
      seg: 60,
      shadows: false,
    });
    // faces tiled one bay per tile (uo shifts so each window sits on its near-geometry bay centre)
    const fw = (ax, az, ux, uz, len, n, y1) =>
      b.face("pd_far", ax, 0, az, ux, 0, uz, 0, 1, 0, len, y1 || ROOF, {
        tile: [len / n, ROOF],
        seg: 60,
      });
    fw(X0, ZW, 1, 0, PX0 - X0, 4);
    fw(PX1, ZW, 1, 0, X1 - PX1, 4);
    fw(X0, ZBW, 0, 1, ZW - ZBW, 4);
    fw(X1, ZW, 0, -1, ZW - ZB, 6);
    fw(X1, ZB, BU[0], BU[1], BL, 12);
    // central pavilion block with the loggia as a dark recess
    b.face("limestone", PX0, 0, ZW, 0, 0, 1, 0, 1, 0, ZF - ZW, ROOF + 2.2, {
      tint: LIME,
      seg: 60,
    });
    b.face("limestone", PX1, 0, ZF, 0, 0, -1, 0, 1, 0, ZF - ZW, ROOF + 2.2, {
      tint: LIME,
      seg: 60,
    });
    b.face("rustic", PX0, 0, ZF, 1, 0, 0, 0, 1, 0, PX1 - PX0, G1, {
      tint: RUST_T,
      seg: 60,
    });
    b.face(
      "limestone",
      PX0,
      G1,
      ZF,
      1,
      0,
      0,
      0,
      1,
      0,
      PX1 - PX0,
      ROOF + 2.2 - G1,
      { tint: LIME, seg: 60 },
    );
    for (let i = 0; i < 3; i++) {
      const cx =
        LX0 + 1.3 + (LX1 - LX0 - 5.2) / 6 + i * ((LX1 - LX0 - 5.2) / 3 + 1.3);
      b.face(
        "paint_black",
        cx - 1.8,
        LY,
        ZF + 0.03,
        1,
        0,
        0,
        0,
        1,
        0,
        3.6,
        4.6,
        { tint: [0.06, 0.06, 0.06] },
      );
    }
    for (let k = 0; k < 6; k++)
      b.cyl(
        "limestone",
        PX0 + 1.4 + (k * (PX1 - PX0 - 2.8)) / 5,
        G1,
        ZF + 0.6,
        0.45,
        0.45,
        G2 - G1,
        6,
        { tint: LIME, rows: 1, top: false },
      );
    b.boxMM("limestone", PX0 - 0.3, G2, ZW, PX1 + 0.3, ROOF + 2.2, ZF + 1.2, {
      tint: LIME_D,
      faces: "swet",
    });
    b.boxMM(
      "limestone",
      X0 - 0.5,
      G2 + 0.25,
      ZBW - 0.5,
      X1 + 0.5,
      G2 + 0.75,
      ZW + 0.5,
      { tint: LIME_D, faces: "nsewb" },
    );
    b.box(
      "limestone",
      (X0 + X1) / 2 + BN[0] * 0.2,
      G2 + 0.25,
      (ZB + ZBW) / 2 + BN[1] * 0.2,
      BL + 1,
      0.5,
      1.0,
      { tint: LIME_D, yaw: BYAW, faces: "nsewb" },
    );
    b.quad(
      "concrete_dark",
      [X0, ROOF, ZW],
      [X1, ROOF, ZW],
      [X1, ROOF, ZB],
      [X0, ROOF, ZBW],
      { tint: [0.45, 0.43, 0.4] },
    );
    // corner pavilions
    const CP = 8.6;
    for (const [cx0, cz0] of [
      [X1 - CP, ZW - CP],
      [X1 - CP, ZB],
    ])
      b.boxMM(
        "limestone",
        cx0 - 0.3,
        ROOF,
        cz0 - 0.3,
        cx0 + CP + 0.3,
        ROOF + 3.7,
        cz0 + CP + 0.3,
        { tint: LIME, faces: "nsewt" },
      );
    // prow pavilion + its low dome
    b.boxMM(
      "limestone",
      X0 - 0.35,
      ROOF,
      ZBW - 0.35,
      X0 + CP + 0.35,
      ROOF + 3.85,
      ZW + 0.35,
      { tint: LIME, faces: "nsewt" },
    );
    b.cyl(
      "limestone",
      X0 + CP / 2,
      ROOF + 3.85,
      (ZBW + ZW) / 2,
      3.4,
      3.4,
      1.85,
      12,
      { tint: LIME, rows: 1, top: false },
    );
    K.dome(b, X0 + CP / 2, ROOF + 5.7, (ZBW + ZW) / 2, 3.45, 2.5, {
      mat: "patina",
      seg: 12,
      rows: 4,
    });
    // the dome
    const DY = ROOF,
      DR = 6.8,
      DRUM0 = DY + 4.0,
      DRUM1 = DRUM0 + 7.0,
      DOME0 = DRUM1 + 2.05,
      LT0 = DOME0 + 6.2;
    b.boxMM(
      "limestone",
      DC.x - 8.6,
      DY,
      DC.z - 8.6,
      DC.x + 8.6,
      DRUM0,
      DC.z + 8.6,
      { tint: LIME, faces: "nsewt" },
    );
    b.cyl("paint_black", DC.x, DRUM0, DC.z, DR, DR, DRUM1 - DRUM0, 12, {
      tint: [0.2, 0.19, 0.18],
      rows: 1,
      top: false,
    });
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * PI * 2;
      b.cyl(
        "limestone",
        DC.x + Math.cos(a) * (DR + 0.85),
        DRUM0,
        DC.z + Math.sin(a) * (DR + 0.85),
        0.32,
        0.32,
        DRUM1 - DRUM0,
        4,
        { tint: LIME, rows: 1, top: false },
      );
    }
    b.cyl("limestone", DC.x, DRUM1, DC.z, DR + 1.4, DR + 0.3, 2.05, 16, {
      tint: LIME_D,
      rows: 1,
    });
    K.dome(b, DC.x, DOME0, DC.z, DR + 0.1, 6.4, {
      mat: "patina",
      seg: 16,
      rows: 5,
    });
    b.cyl("paint_black", DC.x, LT0, DC.z, 1.3, 1.2, 2.7, 6, {
      tint: [0.08, 0.08, 0.07],
      rows: 1,
    });
    b.cyl("gold", DC.x, LT0 + 2.7, DC.z, 1.6, 0.2, 2.2, 8, {
      tint: [0.75, 0.58, 0.28],
      rows: 1,
    });
    b.glow(DC.x, LT0 + 1.4, DC.z, [0.5, 0.35, 0.18], 3);
    // radio mast + beacon (a long-range landmark at night)
    const mx = 181,
      mz = 548,
      m0 = ROOF + 2.8,
      m1 = m0 + 13;
    b.cyl("rust", mx, m0, mz, 0.8, 0.15, m1 - m0 + 3, 4, {
      tint: [0.6, 0.35, 0.25],
      rows: 1,
      top: false,
    });
    b.glow(mx, m1 + 3.1, mz, [1, 0.12, 0.08], 3.5);
    return b.finish(null);
  }

  PC.define({
    id: "police_hq",
    name: "Police Headquarters",
    interior: "police_hq",
    order: 10,
    lod: 1100,
    detail: 260,
    lift: 5,
  }); // lift: the basement (y −5) must stay ≥ 0
  PC.part("police_hq", { ext: exterior, far: farProxy });
