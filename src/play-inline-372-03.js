// play-inline-372 03 — box
// Lines 267-1164 of readable/play-inline-372.pretty.js (statement-aligned).
  function buildExterior() {
    // The real club has its iron fence on the sidewalk line. Our SITES record ends 8 m short of 42nd St's sidewalk
    // (z -245 vs -237); if city_layout extends it (see NOTES "Requests"), the whole front moves south with it and the
    // houses get deeper (the rear wall stays on the site's north edge). Until then the strip is dressed as the
    // Jockeys' forecourt below.
    const site = P.safe("site", () => G.LAYOUT.getSite("club_52"));
    const DZ = site && site.z1 > -244.5 ? Math.min(8.5, site.z1 + 245) : 0;
    const BZ = BZ0 - DZ;
    const S = P.site("club52_ext", { grime: 0.55, oz: DZ });
    const b = S.b;
    const street =
      P.safe("street", () => G.LAYOUT.streetNameAt(64, -230)) || "42nd Street";
    const soot = P.sootMat();
    /** Window + a soot plume over it when it's broken (fire damage). */
    const win = (F, u, y, w, h, o) => {
      F.window(u, y, w, h, o);
      if (o.style === "broken")
        F.quad(soot, u, y + h + 0.95, w * 2.4, 2.2, 0.06, {
          uvRect: PLUME,
          noAO: true,
          grime: 0,
        });
    };
    // ground: sidewalk apron in the site + cellar areaway
    b.box("sidewalk", 51.05, 0, FZ, 76.95, 0.03, -245.05, {
      segLen: 6,
      grime: 0.7,
      noAO: true,
    });
    // ---------------- masses ----------------
    b.box("brownstone", X0, 0, BZ, XM, 4.2, FZ); // No. 21 ground storey
    b.box("brick_red", X0, 4.2, BZ, XM, H21, FZ);
    b.box("brownstone", XM, 0, BZ, X1, H19, FZ); // No. 19 brownstone
    S.col(X0, 0, BZ, XM, H21, FZ);
    S.col(XM, 0, BZ, X1, H19, FZ);
    // roofs
    b.box("roof_tar", X0 + 0.2, H21, BZ + 0.2, XM - 0.1, H21 + 0.08, FZ - 0.2, {
      grime: 0.8,
    });
    b.box("roof_tar", XM + 0.1, H19, BZ + 0.2, X1 - 0.2, H19 + 0.08, FZ - 0.2, {
      grime: 0.8,
    });
    // parapets
    for (const [xa, xb, h] of [
      [X0, XM, H21],
      [XM, 68.6],
      [71.8, X1],
    ].map((q) => [q[0], q[1], q[2] || H19])) {
      if (xa === X0) b.box("brick_red", xa, h, BZ, XM, h + 0.9, BZ + 0.3);
      else if (xa === XM) b.box("brick_red", XM, h, BZ, X1, h + 0.9, BZ + 0.3);
      b.box("brick_red", xa, h, FZ - 0.3, xb, h + 0.9, FZ);
      b.box(
        "limestone_dark",
        xa - 0.05,
        h + 0.9,
        FZ - 0.35,
        xb + 0.05,
        h + 1.02,
        FZ + 0.05,
        { seg: false },
      );
    }
    // the broken stretch: a few loose bricks left standing on the roof edge
    for (let k = 0; k < 5; k++)
      b.box(
        "brick_red",
        68.7 + k * 0.62,
        H19,
        FZ - 0.3,
        69.1 + k * 0.62,
        H19 + 0.25 + (k % 3) * 0.2,
        FZ - 0.02,
        { seg: false, rz: (k - 2) * 0.08, grime: 0.8 },
      );
    b.box("brick_red", X0, H21, BZ, X0 + 0.3, H21 + 0.9, FZ);
    b.box("brick_red", X1 - 0.3, H19, BZ, X1, H19 + 0.9, FZ);
    // ---------------- No. 21 front ----------------
    const F = P.face(S, "s", X0, XM, FZ);
    // rusticated ground storey: horizontal channels
    for (let y = 0.6; y < 4.0; y += 0.55)
      F.box("brownstone", 0, F.len, y, y + 0.06, -0.02, 0.04, {
        seg: false,
        c: 0x6a5a50,
      });
    F.box("limestone_dark", -0.1, F.len + 0.1, 0, 0.45, 0, 0.18, {
      seg: false,
    }); // water table
    // cornice over the ground storey = balcony slab (brownstone) on consoles
    const du = DOOR_X - X0;
    F.box("brownstone", -0.1, F.len + 0.1, 3.95, 4.25, 0, 1.35, { seg: false });
    for (let u = 0.8; u < F.len; u += 1.9)
      F.box("brownstone", u - 0.12, u + 0.12, 3.35, 3.95, 0, 0.9, {
        seg: false,
        rx: 0,
      });
    b.box("brownstone", X0 - 0.1, 4.25, FZ + 1.2, XM + 0.1, 4.3, FZ + 1.35, {
      seg: false,
    });
    S.col(X0, 3.95, FZ, XM, 4.25, FZ + 1.35, { surface: "concrete" });
    // entrance: brownstone surround (pilasters + arch), panelled red double door, fanlight
    for (const sx of [-1, 1])
      F.box(
        "brownstone",
        du + sx * 1.0 - 0.18,
        du + sx * 1.0 + 0.18,
        0,
        2.75,
        0,
        0.28,
        { seg: false, c: 0x5a4a40 },
      );
    F.box("paint_black", du - 0.95, du + 0.95, 0, 2.72, 0, 0.02, {
      seg: false,
    });
    F.box("paint_red", du - 0.85, du - 0.03, 0.05, 2.6, 0.02, 0.08, {
      seg: false,
    });
    F.box("paint_red", du + 0.03, du + 0.85, 0.05, 2.6, 0.02, 0.08, {
      seg: false,
    });
    for (const u of [du - 0.44, du + 0.44])
      for (const yy of [0.5, 1.5])
        F.box("paint_red", u - 0.28, u + 0.28, yy, yy + 0.8, 0.08, 0.11, {
          seg: false,
          c: 0x8a3a30,
        });
    F.box("gilt", du - 0.12, du - 0.06, 1.2, 1.36, 0.08, 0.13, { seg: false });
    F.box("gilt", du + 0.06, du + 0.12, 1.2, 1.36, 0.08, 0.13, { seg: false });
    F.halfDisc("glass_dark", du, 2.72, 0.95, 0.015);
    F.arch("brownstone", du, 2.72, 0.97, 0.22, 0, 0.28);
    F.box("limestone_dark", du - 0.14, du + 0.14, 3.45, 3.9, 0, 0.32, {
      seg: false,
    }); // keystone
    // canopy: iron frame + green canvas, "52" on the valance
    const cz0 = FZ,
      cz1 = FZ + 2.6,
      cy = 3.05;
    b.box(
      "canvas_green",
      DOOR_X - 1.2,
      cy,
      cz0 + 0.3,
      DOOR_X + 1.2,
      cy + 0.06,
      cz1,
      { rx: -0.08, seg: false, grime: 0.6 },
    );
    for (const sx of [-1, 1])
      b.box(
        "canvas_green",
        DOOR_X + sx * 1.2 - 0.02,
        cy - 0.35,
        cz0 + 0.3,
        DOOR_X + sx * 1.2 + 0.02,
        cy + 0.05,
        cz1,
        { seg: false, grime: 0.6 },
      );
    const v21 = P.texMat(
      "club52_valance",
      P.signTex("club52_valance", ['"52"'], "gilt", 256, 96, { bg: "#1e3220" }),
      { rough: 0.8 },
    );
    b.quad(v21, DOOR_X, cy - 0.18, cz1 + 0.025, 2.4, 0.4, { ry: 0 });
    for (const sx of [-1, 1])
      b.rod(
        "iron",
        [DOOR_X + sx * 1.15, 0, cz1 - 0.05],
        [DOOR_X + sx * 1.15, cy, cz1 - 0.05],
        0.035,
        6,
      );
    // ground-floor windows (barred) either side
    for (const u of [2.4, 12.9]) {
      F.window(u, 1.0, 1.4, 1.9, {
        style: "dark",
        frame: "paint_black",
        sill: "limestone_dark",
        mull: true,
        hood: "flat",
        hoodKey: "brownstone",
      });
      for (let k = 0; k < 6; k++)
        F.box(
          "iron",
          u - 0.7 + k * 0.28,
          u - 0.66 + k * 0.28,
          0.95,
          2.95,
          0.14,
          0.18,
          { seg: false },
        );
    }
    // piano nobile: four tall French windows opening onto the balcony
    const PN = [2.3, 5.9, 9.6, 13.2];
    PN.forEach((u, i) =>
      win(F, u, 4.4, 1.3, 2.9, {
        style: i === 1 ? "lit" : i === 3 ? "broken" : "dark",
        frame: "frame_dirty",
        sill: "limestone_dark",
        hood: "cornice",
        hoodKey: "limestone_dark",
        ft: 0.09,
      }),
    );
    // third floor + fourth (attic) floor
    PN.forEach((u, i) =>
      win(F, u, 8.3, 1.2, 2.1, {
        style: i === 2 ? "boarded" : i === 0 ? "broken" : "dark",
        frame: "frame_dirty",
        sill: "limestone_dark",
        hood: "flat",
        hoodKey: "limestone_dark",
      }),
    );
    F.band("limestone_dark", 7.75, 7.95, 0, 0.15);
    F.cornice("paint_black", H21 - 1.5, 0.55, { step: 0.7 });
    // painted '52' CLUB fascia between the balcony and the cornice band
    const fas = P.texMat(
      "club52_fascia",
      P.signTex("club52_fascia", ['THE \"52\" CLUB'], "gilt", 1024, 96, {
        bg: "#161410",
      }),
      { rough: 0.6 },
    );
    F.box(
      "paint_black",
      F.len / 2 - 4.9,
      F.len / 2 + 4.9,
      10.85,
      11.65,
      0,
      0.08,
      { seg: false },
    );
    F.quad(fas, F.len / 2, 11.25, 9.4, 0.72, 0.1);
    // little brass uplights under the fascia (three still wired to the Jockeys' generator)
    for (let k = 0; k < 5; k++) {
      const u = F.len / 2 - 4.0 + k * 2.0,
        on = k !== 1 && k !== 4;
      F.box("bronze", u - 0.15, u + 0.15, 10.55, 10.75, 0, 0.35, {
        seg: false,
      });
      F.box(
        on ? "lamp_amber" : "glass_dark",
        u - 0.1,
        u + 0.1,
        10.75,
        10.8,
        0.1,
        0.3,
        { seg: false },
      );
      if (on) {
        const p = F.pt(u, 0.3);
        S.glow(p[0], 11.2, p[1], 0xffb050, 0.9, { dayFactor: 0.05 });
        S.light(p[0], 10.9, p[1] + 0.3, 0xffc070, 3.5, 0.9);
      }
    }
    // ---- the balcony railing + the jockeys ----
    const RZ = FZ + 1.25;
    S.rail(
      "iron",
      [
        [X0 + 0.2, RZ],
        [XM - 0.2, RZ],
      ],
      4.25,
      1.0,
      { r: 0.035, step: 0.16 },
    );
    S.rail(
      "iron",
      [
        [X0 + 0.2, FZ + 0.05],
        [X0 + 0.2, RZ],
      ],
      4.25,
      1.0,
      { r: 0.035, step: 0.16 },
    );
    S.rail(
      "iron",
      [
        [XM - 0.2, FZ + 0.05],
        [XM - 0.2, RZ],
      ],
      4.25,
      1.0,
      { r: 0.035, step: 0.16 },
    );
    // scrollwork panels in the railing (iron S-scrolls)
    for (let x = X0 + 0.9; x < XM - 0.6; x += 1.2)
      b.torus("iron", x, 4.72, RZ, 0.18, 0.012, TAU, { ts: 12, rs: 3 });
    // jockeys on the rail posts (one every ~1 m), a few raider-skulled, one lantern-bearer lit
    let ji = 0;
    for (let x = X0 + 0.55; x < XM - 0.3; x += 1.02, ji++) {
      b.box("iron", x - 0.16, 5.25, RZ - 0.16, x + 0.16, 5.3, RZ + 0.16, {
        seg: false,
      });
      P.jockey(b, x, 5.3, RZ, ((ji % 3) - 1) * 0.12, {
        silk: SILKS[ji % SILKS.length],
        silk2: SILKS[(ji * 3 + 2) % SILKS.length],
        s: 1.35,
        skull: ji % 5 === 3,
        lantern: ji === 7,
        lit: true,
        pose: ji % 6 === 1 ? "salute" : "ring",
      });
    }
    S.light(X0 + 0.55 + 7 * 1.02 + 0.25, 6.3, RZ + 0.3, 0xffb060, 5, 0.8);
    S.glow(X0 + 0.55 + 7 * 1.02 + 0.24, 6.3, RZ + 0.3, 0xffa040, 0.5);
    // ---- the sidewalk fence + gate with "52" medallions; jockeys on the gateposts ----
    const fz = -245.35;
    const gate0 = DOOR_X - 1.3,
      gate1 = DOOR_X + 1.3;
    S.rail(
      "iron",
      [
        [X0 + 0.1, fz],
        [gate0, fz],
      ],
      0,
      1.3,
      { r: 0.03, step: 0.13 },
    );
    S.rail(
      "iron",
      [
        [gate1, fz],
        [XM + 0.4, fz],
      ],
      0,
      1.3,
      { r: 0.03, step: 0.13 },
    );
    for (const x of [X0 + 0.1, gate0, gate1, XM + 0.4]) {
      b.box("brownstone", x - 0.26, 0, fz - 0.26, x + 0.26, 1.45, fz + 0.26, {
        seg: false,
      });
      b.box("brownstone", x - 0.3, 1.45, fz - 0.3, x + 0.3, 1.55, fz + 0.3, {
        seg: false,
      });
      S.col(x - 0.26, 0, fz - 0.26, x + 0.26, 1.55, fz + 0.26, {
        walkable: false,
      });
    }
    // gatepost jockeys hold lit lanterns (the Jockeys keep them burning: the silhouettes read across the street at night)
    const GJ = [
      [gate0, 0.15, "silk_red", "silk_white", false],
      [gate1, -0.15, "silk_green", "silk_yellow", true],
      [X0 + 0.1, 0.4, "silk_blue", "silk_white", false],
      [XM + 0.4, -0.3, "silk_purple", "silk_orange", true],
    ];
    for (const [x, ry, s1, s2, sk] of GJ) {
      P.jockey(b, x, 1.55, fz, ry, {
        silk: s1,
        silk2: s2,
        s: 1.35,
        lantern: true,
        lit: true,
        skull: sk,
      });
      const hx = x + Math.cos(ry) * 0.18 * 1.35 + Math.sin(ry) * 0.22 * 1.35,
        hz = fz + Math.cos(ry) * 0.22 * 1.35 - Math.sin(ry) * 0.18 * 1.35;
      S.light(hx, 2.6, hz + 0.2, 0xffb060, 4, 0.7);
      S.glow(hx, 2.5, hz, 0xffa040, 0.55, { dayFactor: 0.1 });
    }
    // gate leaves swung open inward against the forecourt + gilt "52" medallions
    const med = P.texMat(
      "club52_medal",
      P.signTex("club52_medal", ["52"], "gilt", 128, 128, { bg: "#141210" }),
      { rough: 0.4, metal: 0.3 },
    );
    for (const sx of [-1, 1]) {
      const hx = sx < 0 ? gate0 + 0.3 : gate1 - 0.3;
      b.box("iron", hx - 0.02, 0.05, fz - 1.05, hx + 0.02, 1.25, fz - 0.05, {
        seg: false,
      });
      for (let k = 0; k < 7; k++)
        b.rod(
          "iron",
          [hx, 0.05, fz - 0.1 - k * 0.14],
          [hx, 1.35, fz - 0.1 - k * 0.14],
          0.012,
          3,
        );
      b.cyl(med, hx + sx * -0.03, 0.72, fz - 0.55, 0.19, 0.19, 0.03, 16, {
        rz: HP,
      });
    }
    // ---------------- No. 19 front: stoop, boarded door, areaway + cellar hatch ----------------
    const F9 = P.face(S, "s", XM, X1, FZ);
    F9.box("limestone_dark", -0.05, F9.len + 0.05, 0, 0.35, 0, 0.12, {
      seg: false,
    });
    const su = 2.3; // stoop at the west side of No. 19
    for (let k = 0; k < 7; k++)
      F9.box(
        "brownstone",
        su - 1.0,
        su + 1.0,
        k * 0.23,
        (k + 1) * 0.23,
        0,
        2.3 - k * 0.3,
        { seg: false, grime: 0.6 },
      );
    for (const sx of [-1, 1]) {
      F9.box(
        "brownstone",
        su + sx * 1.0 - 0.14,
        su + sx * 1.0 + 0.14,
        0,
        1.0,
        0.2,
        2.35,
        { seg: false },
      );
    }
    for (let k = 0; k < 7; k++)
      S.col(
        XM + su - 1.0,
        0,
        FZ,
        XM + su + 1.0,
        (k + 1) * 0.23,
        FZ + 2.3 - k * 0.3,
        { surface: "concrete" },
      );
    F9.box("brownstone", su - 1.1, su + 1.1, 1.61, 4.8, 0, 0.3, {
      seg: false,
      c: 0x6a5a50,
    });
    F9.box("wood_rotten", su - 0.75, su + 0.75, 1.61, 4.2, -0.2, -0.12, {
      seg: false,
    });
    for (let k = 0; k < 5; k++)
      F9.box(
        "wood_rotten",
        su - 0.95,
        su + 0.95,
        1.9 + k * 0.5,
        2.1 + k * 0.5,
        -0.1,
        -0.02,
        { seg: false, rz: k % 2 ? 0.06 : -0.05 },
      );
    F9.window(6.8, 0.6, 1.1, 1.4, {
      style: "boarded",
      frame: "paint_black",
      sill: "limestone_dark",
      mull: false,
    });
    for (const [y, h] of [
      [2.2, 2.3],
      [5.6, 2.2],
      [8.9, 1.8],
    ])
      for (const u of [2.3, 6.8]) {
        if (y === 2.2 && u === 2.3) continue;
        win(F9, u, y, 1.2, h, {
          style: (u + y) % 3 < 1 ? "broken" : "dark",
          frame: "frame_cream_dirty",
          sill: "brownstone",
          hood: "pediment",
          hoodKey: "brownstone",
        });
      }
    // No. 19's cornice: a 3 m stretch over the stoop has come down (rubble on the steps and in the areaway)
    {
      const Fa = P.face(S, "s", XM, 68.6, FZ),
        Fb = P.face(S, "s", 71.8, X1, FZ);
      Fa.cornice("brownstone", 10.9, 0.6, { step: 0.8, ext: 0.1 });
      Fb.cornice("brownstone", 10.9, 0.6, { step: 0.8, ext: 0.1 });
    }
    for (let k = 0; k < 3; k++)
      b.box(
        "brownstone",
        68.7 + k * 1.0,
        10.9,
        FZ,
        69.3 + k * 1.0,
        11.2 - k * 0.1,
        FZ + 0.3 + k * 0.1,
        { seg: false, rz: 0.2 * (k - 1), grime: 0.8 },
      );
    F9.quad(soot, 3.6, 9.4, 4.2, 3.2, 0.05, {
      uvRect: [0.5, 0, 1, 1],
      noAO: true,
      grime: 0,
    });
    {
      const rr = P.rng("c21_fall");
      for (let k = 0; k < 9; k++) {
        const top = k < 4;
        b.rock(
          "brownstone",
          top ? 67.4 + rr() * 1.4 : 69.4 + rr() * 2.4,
          top ? 1.64 : 0.05,
          top ? FZ + 0.2 + rr() * 0.25 : FZ + 0.4 + rr() * 1.6,
          top ? 0.13 + rr() * 0.1 : 0.18 + rr() * 0.25,
          { flat: 0.7 },
        );
      }
    }
    for (let k = 0; k < 3; k++)
      b.box(
        "brownstone",
        69.8 + k * 0.5,
        0,
        FZ + 0.6 + k * 0.4,
        70.6 + k * 0.5,
        0.35,
        FZ + 0.95 + k * 0.4,
        { seg: false, ry: k * 0.7, rz: 0.25, grime: 0.8 },
      );
    // areaway: low iron railing around the hatch, the steel bulkhead doors
    S.rail(
      "iron",
      [
        [XM + 3.6, -245.35],
        [72.0, -245.35],
      ],
      0,
      0.95,
      { r: 0.028, step: 0.14 },
    );
    S.rail(
      "iron",
      [
        [74.4, -245.35],
        [X1 - 0.1, -245.35],
      ],
      0,
      0.95,
      { r: 0.028, step: 0.14 },
    );
    S.rail(
      "iron",
      [
        [XM + 3.6, FZ],
        [XM + 3.6, -245.35],
      ],
      0,
      0.95,
      { r: 0.028, step: 0.14 },
    );
    b.box(
      "concrete_dark",
      HATCH_X - 0.9,
      0.0,
      FZ + 0.4,
      HATCH_X + 0.9,
      0.28,
      FZ + 1.9,
      { seg: false, grime: 0.8 },
    );
    for (const sx of [-1, 1])
      b.box(
        "rust",
        HATCH_X + (sx < 0 ? -0.85 : 0.02),
        0.28,
        FZ + 0.45,
        HATCH_X + (sx < 0 ? -0.02 : 0.85),
        0.33,
        FZ + 1.85,
        { seg: false, rz: sx * 0.03, grime: 0.9 },
      );
    S.col(HATCH_X - 0.9, 0, FZ + 0.4, HATCH_X + 0.9, 0.33, FZ + 1.9, {
      surface: "metal",
    });
    b.box(
      "iron",
      HATCH_X - 0.4,
      0.33,
      FZ + 1.0,
      HATCH_X + 0.4,
      0.37,
      FZ + 1.08,
      { seg: false },
    );
    const ht = P.texMat(
      "club52_hatch",
      P.signTex("club52_hatch", ["DELIVERIES", "NO. 19"], "engraved", 256, 96, {
        bg: "#5a4e40",
      }),
      { rough: 0.8 },
    );
    b.quad(ht, HATCH_X, 0.9, FZ + 0.02, 0.8, 0.3, { ry: 0 });
    // ---------------- 6th Avenue flank: party wall, painted ghost ad, fire escape ----------------
    const ad = P.canvasTex(
      "m3_club52_ghostad_" + street.replace(/\W+/g, ""),
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("ghost21");
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(190,170,130,0.55)";
        ctx.fillRect(10, 10, w - 20, h - 20);
        ctx.fillStyle = "rgba(120,30,24,0.8)";
        ctx.font = "bold 170px " + P.FONTS.SERIF;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText('"52"', w / 2, h * 0.36);
        ctx.fillStyle = "rgba(30,40,30,0.8)";
        ctx.font = "bold 40px " + P.FONTS.DECO;
        ctx.fillText("JACK & CHARLIE'S", w / 2, h * 0.62);
        ctx.font = "italic 30px " + P.FONTS.SERIF;
        ctx.fillText("Dinner · Dancing · Since 1929", w / 2, h * 0.74);
        ctx.font = "bold 26px " + P.FONTS.SANS;
        ctx.fillText(("Entrance on " + street).toUpperCase(), w / 2, h * 0.86);
        // weathering: brick shows through
        ctx.globalCompositeOperation = "destination-out";
        for (let i = 0; i < 900; i++) {
          ctx.fillStyle = "rgba(0,0,0," + (0.2 + r() * 0.6) + ")";
          ctx.fillRect(r() * w, r() * h, 3 + r() * 16, 2 + r() * 5);
        }
        ctx.globalCompositeOperation = "source-over";
      },
      { clamp: true },
    );
    const adk = P.texMat("club52_ghostad", ad, {
      transparent: true,
      alphaTest: 0.05,
      rough: 0.95,
    });
    b.quad(adk, X0 - 0.03, 8.2, -261.2, 7.0, 7.0, { ry: -HP });
    const FWs = P.face(S, "w", BZ, FZ, X0);
    for (const [u, y] of [
      [10.8, 4.8],
      [10.8, 8.4],
      [14.2, 4.8],
      [14.2, 8.4],
    ])
      win(FWs, u, y, 1.1, 1.8, {
        style: (u + y) % 2 < 1 ? "broken" : "dark",
        frame: "paint_black",
        sill: "limestone_dark",
        mull: false,
      });
    FWs.cornice("paint_black", H21 - 0.5, 0.35, { mods: false });
    // fire escape on the flank (landings at 4.4 / 8.0 / 11.4, ladders between)
    const fex = X0 - 0.05;
    for (const y of [4.35, 7.95, 11.35]) {
      b.box("iron", fex - 1.2, y, -257.0, fex, y + 0.06, -250.6, {
        seg: false,
      });
      for (let z = -256.9; z <= -250.7; z += 0.15)
        b.rod(
          "iron",
          [fex - 1.18, y + 0.06, z],
          [fex - 1.18, y + 0.95, z],
          0.008,
          3,
        );
      b.rod(
        "iron",
        [fex - 1.18, y + 0.95, -257.0],
        [fex - 1.18, y + 0.95, -250.6],
        0.02,
        4,
      );
      b.rod("iron", [fex - 1.1, y, -257], [fex, y - 1.0, -257], 0.03, 4);
      b.rod("iron", [fex - 1.1, y, -250.6], [fex, y - 1.0, -250.6], 0.03, 4);
    }
    for (const [y0, y1, za, zb] of [
      [4.4, 8.0, -251.2, -254.6],
      [8.0, 11.4, -256.4, -253.0],
    ]) {
      for (const s of [0, 0.7])
        b.rod(
          "iron",
          [fex - 0.95 + s, y0, za],
          [fex - 0.95 + s, y1, zb],
          0.02,
          4,
        );
      for (let k = 1; k < 12; k++) {
        const t = k / 12;
        b.box(
          "iron",
          fex - 0.95,
          y0 + (y1 - y0) * t - 0.01,
          za + (zb - za) * t - 0.04,
          fex - 0.25,
          y0 + (y1 - y0) * t + 0.01,
          za + (zb - za) * t + 0.04,
          { seg: false },
        );
      }
    }
    // rear wall (courtyard side): windows + a rusted exhaust duct from the kitchen
    const FN = P.face(S, "n", X0, X1, BZ);
    for (let u = 2.0; u < FN.len - 1; u += 3.4)
      for (const y of [1.2, 4.8, 8.4])
        FN.window(u, y, 1.1, 1.8, {
          style: (u * 3 + y) % 4 < 1 ? "boarded" : "dark",
          frame: "paint_black",
          sill: "brick_red",
          mull: false,
        });
    b.box("rust", 60.4, 2.0, BZ - 0.7, 61.2, H21 + 1.8, BZ - 0.1, {
      seg: false,
    });
    FN.band("limestone_dark", H19 - 0.1, H19 + 0.1, 0, 0.1);
    // east party wall + rooftop clutter: No. 19's water tower, chimneys, a vent
    const wt = [72.5, -261.0];
    for (const [dx, dz] of [
      [-1.1, -1.1],
      [1.1, -1.1],
      [-1.1, 1.1],
      [1.1, 1.1],
    ])
      b.rod(
        "iron",
        [wt[0] + dx, H19, wt[1] + dz],
        [wt[0] + dx * 0.9, H19 + 3.0, wt[1] + dz * 0.9],
        0.07,
        5,
      );
    b.box(
      "iron",
      wt[0] - 1.4,
      H19 + 3.0,
      wt[1] - 1.4,
      wt[0] + 1.4,
      H19 + 3.15,
      wt[1] + 1.4,
      { seg: false },
    );
    b.cyl("wood_rotten", wt[0], H19 + 3.15, wt[1], 1.35, 1.4, 3.4, 14, {
      grime: 0.6,
    });
    for (const y of [0.6, 1.6, 2.6])
      b.torus("rust", wt[0], H19 + 3.15 + y, wt[1], 1.42, 0.03, TAU, {
        rx: HP,
        ts: 18,
        rs: 3,
      });
    b.lathe(
      "wood_rotten",
      [
        [1.45, 0],
        [1.0, 0.7],
        [0.3, 1.1],
        [0.001, 1.15],
      ],
      14,
      wt[0],
      H19 + 6.55,
      wt[1],
    );
    for (const [x, z] of [
      [54, -264],
      [64.5, -264.5],
      [69, -252],
    ])
      b.box(
        "brick_red",
        x - 0.5,
        x > 67 ? H19 : H21,
        z - 0.4,
        x + 0.5,
        (x > 67 ? H19 : H21) + 2.2,
        z + 0.4,
        { seg: false },
      );
    b.box("panel", 57, H21 + 0.08, -258, 59.2, H21 + 1.1, -256.4, {
      seg: false,
    });
    // ---------------- the Jockeys' dressing ----------------
    const sh = P.texMat(
      "club52_sheet",
      P.sheetTex("club52_sheet", ["THE JOCKEYS", "PLACE YOUR BETS"], "#b0180e"),
      { transparent: true, alphaTest: 0.3, double: true, rough: 1 },
    );
    b.quad(sh, 61.6, 5.05, RZ + 0.08, 4.4, 2.1, { ry: 0, ws: 4, hs: 2 });
    b.rod("rust", [59.3, 6.05, RZ + 0.06], [63.9, 6.05, RZ + 0.06], 0.015, 3);
    // scrap barricade across the east half of the fence line (leaves the gate clear)
    const rn = P.rng("club52_scrap");
    for (let k = 0; k < 6; k++) {
      const x = 62.4 + k * 0.72;
      b.boxC(
        rn() < 0.4 ? "rust" : rn() < 0.5 ? "corrugated" : "panel",
        x,
        0,
        -245.75,
        0.78,
        1.7 + rn() * 0.7,
        0.07,
        { ry: (rn() - 0.5) * 0.2, seg: false, grime: 0.85 },
      );
    }
    S.col(62, 0, -246.0, 66.6, 1.8, -245.5, { walkable: false });
    // skull pikes by the gate
    for (const x of [gate0 - 0.6, gate1 + 0.6]) {
      b.cyl("rust", x, 0, -245.7, 0.035, 0.05, 2.4, 5);
      b.sphere("bone", x, 2.48, -245.7, 0.12, { sy: 1.15 });
    }
    // tote board for the giant roach derby (sandwich board on the sidewalk)
    const tote = P.canvasTex(
      "m3_club52_tote",
      256,
      320,
      (ctx, w, h) => {
        const r = P.rng("tote");
        ctx.fillStyle = "#1c2a22";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#6a5030";
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, w - 10, h - 10);
        ctx.fillStyle = "#e8e4d8";
        ctx.textAlign = "center";
        ctx.font = "bold 30px " + P.FONTS.DECO;
        ctx.fillText("ROACH DERBY", w / 2, 44);
        ctx.font = "18px " + P.FONTS.SANS;
        ctx.fillText("TONITE — 5 RACES", w / 2, 70);
        ctx.textAlign = "left";
        ctx.font = "bold 20px " + P.FONTS.SANS;
        const runners = [
          ["1 BIG SAL", "3-1"],
          ["2 LIL SAL", "5-1"],
          ["3 SIX LEGS", "2-1"],
          ["4 GLOWIE", "9-1"],
          ["5 TENPENNY", "20-1"],
        ];
        runners.forEach((ru, i) => {
          ctx.fillText(ru[0], 20, 110 + i * 34);
          ctx.textAlign = "right";
          ctx.fillText(ru[1], w - 20, 110 + i * 34);
          ctx.textAlign = "left";
        });
        ctx.fillStyle = "#e0b030";
        ctx.font = "bold 18px " + P.FONTS.SANS;
        ctx.textAlign = "center";
        ctx.fillText("NO WELCHERS", w / 2, h - 26);
        P.speckle(ctx, w, h, r, 900, 0.3, 0.1);
      },
      { clamp: true },
    );
    const tk = P.texMat("club52_tote", tote, { rough: 0.9 });
    for (const sgn of [-1, 1]) {
      b.box(
        "wood_rotten",
        54.2 - 0.55,
        0,
        -246.4 + sgn * 0.2 - 0.02,
        54.2 + 0.55,
        1.2,
        -246.4 + sgn * 0.2 + 0.02,
        { rx: sgn * 0.18, seg: false },
      );
    }
    b.quad(tk, 54.2, 0.72, -246.16, 0.95, 1.1, { rx: -0.18, ry: 0 });
    S.prop("barrel", 56.6, 0, -246.4, 0, { burning: true });
    S.prop("barrel", 61.4, 0, -246.4, 0, { burning: true });
    S.light(56.6, 1.6, -246.4, 0xff8a30, 7, 0.9);
    S.light(61.4, 1.6, -246.4, 0xff8a30, 7, 0.9);
    // lamp either side of the door (one dead)
    for (const sx of [-1, 1]) {
      F.box(
        "iron",
        du + sx * 1.6 - 0.05,
        du + sx * 1.6 + 0.05,
        2.3,
        2.9,
        0,
        0.35,
        { seg: false },
      );
      F.box(
        sx < 0 ? "lamp_amber" : "glass_dark",
        du + sx * 1.6 - 0.12,
        du + sx * 1.6 + 0.12,
        2.35,
        2.75,
        0.3,
        0.5,
        { seg: false },
      );
    }
    S.glow(DOOR_X - 1.6, 2.55, FZ + 0.42, 0xffa050, 0.5);
    if (!DZ) buildForecourt(S, soot);
    S.anchor("exterior_entrance", DOOR_X, 0, -246.2, PI);
    S.anchor("cellar_hatch", HATCH_X, 0, -245.9, PI);
    S.anchor("balcony", 61, 4.25, FZ + 0.7, PI);
    S.build({ shadow: true, lod: 240 });
    return { S, DOOR_X, FZ, HATCH_X, DZ, street };
  }

  /**
   * The 8 m of open pavement between the fence and 42nd St's sidewalk (outside the SITES record): the Jockeys'
   * forecourt — a plywood betting window, a sandbag chicane funnelling visitors to the gate, a lawn jockey knocked off
   * its post, a burnt-out car nosed into the kerb. Light dressing only (props + a small shack), nothing structural.
   */
