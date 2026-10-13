// play-inline-422 04 — tint
// Lines 1173-1419 of readable/play-inline-422.pretty.js (statement-aligned).
  function ferryModel(fb, o) {
    const L = WH.FERRY.len,
      B = WH.FERRY.beam,
      DK = WH.FERRY.deck;
    const hu = K.hull(fb, "hull_orange", {
      cx: 0,
      cz: 0,
      len: L,
      beam: B,
      deck: DK,
      keel: -3.4,
      sheer: 0.5,
      kind: "double",
      nu: 12,
      nv: 26,
      boot: -1.0,
      deckMat: "deck",
      rub: "rubber",
    });
    void hu;
    const or = [1, 1, 1],
      cr = [0.94, 0.9, 0.8];
    // cabin decks (main + saloon) with window bands
    const cabin = (y0, h, hw, z0, z1, winY, winH, nWin) => {
      fb.boxMM("hull_orange", -hw, y0, z0, hw, y0 + h, z1, {
        tint: or,
        faces: "nsewt",
      });
      for (const s of [-1, 1]) {
        for (let k = 0; k < nWin; k++) {
          const z = z0 + 0.8 + ((k + 0.5) * (z1 - z0 - 1.6)) / nWin,
            w = (z1 - z0 - 1.6) / nWin - 0.35;
          const broken = K.rng("fw" + y0 + k + s)() < 0.25;
          fb.quadN(
            broken ? "paint_black" : "glass",
            [s * (hw + 0.02), y0 + winY, z - w / 2],
            [s * (hw + 0.02), y0 + winY, z + w / 2],
            [s * (hw + 0.02), y0 + winY + winH, z + w / 2],
            [s * (hw + 0.02), y0 + winY + winH, z - w / 2],
            [s, 0, 0],
            {
              tint: broken ? [0.05, 0.05, 0.05] : [0.34, 0.4, 0.4],
              grime: 0.4,
            },
          );
          fb.box(
            "cream_paint",
            s * (hw + 0.03),
            y0 + winY - 0.08,
            z,
            0.06,
            0.08,
            w + 0.14,
            { tint: cr },
          );
          fb.box(
            "cream_paint",
            s * (hw + 0.03),
            y0 + winY + winH,
            z,
            0.06,
            0.08,
            w + 0.14,
            { tint: cr },
          );
        }
      }
      // end walls: windows + doors
      for (const e of [-1, 1]) {
        const z = e < 0 ? z0 : z1;
        for (let k = -1; k <= 1; k++)
          if (k !== 0)
            fb.quadN(
              "glass",
              [k * 1.6 - 0.6, y0 + winY, z + e * 0.02],
              [k * 1.6 + 0.6, y0 + winY, z + e * 0.02],
              [k * 1.6 + 0.6, y0 + winY + winH, z + e * 0.02],
              [k * 1.6 - 0.6, y0 + winY + winH, z + e * 0.02],
              [0, 0, e],
              { tint: [0.34, 0.4, 0.4] },
            );
        fb.quadN(
          "cream_paint",
          [-0.6, y0, z + e * 0.03],
          [0.6, y0, z + e * 0.03],
          [0.6, y0 + 2.05, z + e * 0.03],
          [-0.6, y0 + 2.05, z + e * 0.03],
          [0, 0, e],
          { tint: [0.8, 0.76, 0.66] },
        );
      }
    };
    cabin(DK, 2.8, B / 2 - 0.55, -12.5, 12.5, 0.95, 1.2, 12);
    cabin(DK + 2.8, 2.6, B / 2 - 0.75, -11, 11, 0.9, 1.1, 11);
    // deck overhangs (promenade roofs) + rails on the saloon-deck ends
    fb.boxMM(
      "cream_paint",
      -B / 2 + 0.3,
      DK + 2.8,
      -14,
      B / 2 - 0.3,
      DK + 3.0,
      14,
      { tint: [0.86, 0.82, 0.72], faces: "nsewtb" },
    );
    fb.boxMM(
      "cream_paint",
      -B / 2 + 0.5,
      DK + 5.4,
      -12.5,
      B / 2 - 0.5,
      DK + 5.6,
      12.5,
      { tint: [0.86, 0.82, 0.72], faces: "nsewtb" },
    );
    for (const e of [-1, 1]) {
      K.railing(fb, -B / 2 + 0.5, e * 12.3, B / 2 - 0.5, e * 12.3, DK + 5.6, {
        h: 1.0,
        mat: "cream_paint",
        handMat: "cream_paint",
        col: false,
      });
      for (const s of [-1, 1])
        K.railing(
          fb,
          s * (B / 2 - 0.45),
          e * 12.3,
          s * (B / 2 - 0.45),
          e * 5,
          DK + 5.6,
          { h: 1.0, mat: "cream_paint", handMat: "cream_paint", col: false },
        );
      // pilothouse at each end
      const pz = e * 9.5;
      fb.boxMM(
        "hull_orange",
        -1.7,
        DK + 5.6,
        pz - 1.3,
        1.7,
        DK + 7.9,
        pz + 1.3,
        { tint: or },
      );
      for (const s of [-1, 1])
        fb.quadN(
          "glass",
          [s * 1.72, DK + 6.6, pz - 1.1],
          [s * 1.72, DK + 6.6, pz + 1.1],
          [s * 1.72, DK + 7.6, pz + 1.1],
          [s * 1.72, DK + 7.6, pz - 1.1],
          [s, 0, 0],
          { tint: [0.3, 0.36, 0.36] },
        );
      fb.quadN(
        "glass",
        [-1.5, DK + 6.6, pz + e * 1.32],
        [1.5, DK + 6.6, pz + e * 1.32],
        [1.5, DK + 7.6, pz + e * 1.32],
        [-1.5, DK + 7.6, pz + e * 1.32],
        [0, 0, e],
        { tint: [0.3, 0.36, 0.36] },
      );
      fb.boxMM(
        "cream_paint",
        -2.0,
        DK + 7.9,
        pz - 1.6,
        2.0,
        DK + 8.1,
        pz + 1.6,
        { tint: [0.86, 0.82, 0.72], faces: "nsewtb" },
      );
      fb.cyl("chrome", 0, DK + 8.1, pz + e * 0.9, 0.18, 0.2, 0.3, 8); // searchlight
      // open car-deck end: bumper, chain gate, bollards
      fb.boxMM(
        "rubber",
        -3,
        DK + 0.1,
        e * 15.2 - 0.25,
        3,
        DK + 0.7,
        e * 15.2 + 0.25,
        { tint: [0.15, 0.15, 0.15] },
      );
      for (const s of [-1, 1]) K.bollard(fb, s * 2.8, DK + 0.25, e * 13.8);
      fb.pipe(
        "rust",
        -2.4,
        DK + 0.9,
        e * 13.2,
        2.4,
        DK + 0.75,
        e * 13.2,
        0.03,
        4,
      );
    }
    // funnel + mast + horn
    fb.geo("hull_orange", K.unitCyl(14), {
      x: 0,
      y: DK + 5.6 + 2.6,
      z: 0,
      sx: 1.1,
      sy: 5.2,
      sz: 1.6,
      tint: or,
    });
    fb.geo("paint_black", K.unitCyl(14), {
      x: 0,
      y: DK + 5.6 + 5.0,
      z: 0,
      sx: 1.13,
      sy: 0.9,
      sz: 1.63,
    });
    fb.pipe("rust", 0, DK + 5.6, 3.5, 0, DK + 12.5, 3.5, 0.12, 6);
    fb.beam("rust", -1.4, DK + 11.2, 3.5, 1.4, DK + 11.2, 3.5, 0.1, 0.1);
    fb.cyl("brass_old", 0.5, DK + 10.2, 3.5, 0.12, 0.25, 0.5, 8);
    // lifeboats on the saloon roof
    for (const s of [-1, 1]) {
      fb.geo("hull_orange", K.sphereGeo(), {
        x: s * 2.6,
        y: DK + 6.2,
        z: -4,
        sx: 0.8,
        sy: 0.5,
        sz: 2.8,
        tint: [1, 0.72, 0.4],
      });
      for (const zz of [-5.8, -2.2])
        fb.pipe("rust", s * 3.1, DK + 5.6, zz, s * 2.7, DK + 7.1, zz, 0.05, 4);
    }
    // rust bleeding under the scuppers
    for (let k = 0; k < 10; k++)
      fb.box(
        "rust",
        (k % 2 ? 1 : -1) * (B / 2 - 0.04),
        DK - 1.6,
        -13 + k * 2.9,
        0.04,
        1.4,
        0.35,
        { tint: [0.7, 0.4, 0.25] },
      );
    void o;
  }
