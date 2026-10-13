/* src/poi_harbor2/20_pier_a.js */
/* =====================================================================
 * NEW RAD CITY — poi_harbor2 / 20_pier_a.js
 * PIER A — the 1886 fireboat station on the Hudson at the Battery: a long
 * cream-and-green pier shed with a three-storey head house on the land end
 * and the slender WWI memorial CLOCK TOWER at the river end, its hands
 * stopped at 9:47. Home of FDNY Marine Company 1 until the bombs; home of
 * shellbacks ever since.
 *
 * EXTERIOR (site −253..−213 × 887..903, over the water): timber pier deck on
 * piles (holes, rope, bollards, reels), head house with hipped slate roof,
 * dormers and PIER A lettering; the shed with arched apparatus doors and a
 * roof monitor; the clock tower (four dials, open belfry, copper pyramid).
 * Moored on the north side: the fireboat PATRICK DUGGAN, sunk by the stern
 * at her berth, bow up, listing — deck walkable, wheelhouse, water cannons,
 * the engine hatch (the pump governor for "Slack Water"). Shellback nests
 * on the apron; two more come up out of the water when you board the wreck.
 * INTERIOR → 21_pier_a_interior.js (watch room, harbour master, the flooded
 * boathouse slip, tower stair, clock room).
 * Misc quest: "Nine Forty-Seven" — wind the tower clock again.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const PA = (PV.pa = {
    PY: 0.35,
    PF: 0.75, // deck top, building floor
    DX0: -255.5,
    DX1: -206,
    DZ0: 884.5,
    DZ1: 905.5,
    HX0: -224,
    HX1: -214,
    BZ0: 889,
    BZ1: 901, // head house x, building z
    SX0: -245, // shed west end
    TX: -248,
    TZ: 895,
    TW: 6, // tower centre/width
    BOAT: {
      x: -233,
      z: 878.6,
      y: -0.95,
      pitch: -0.13,
      roll: 0.06,
      len: 24,
      beam: 6.6,
      deck: 1.2,
    },
  });

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function exterior(ctx) {
    const root = new THREE.Group();
    root.name = "ph2_pier_a_ext";
    ctx.extRoot = root;
    const b = K.builder({ name: "pa_ext", grime: 0.4 });
    const d = K.builder({ name: "pa_detail", grime: 0.45 });
    const { PY, PF, DX0, DX1, DZ0, DZ1, HX0, HX1, BZ0, BZ1, SX0, TX, TZ, TW } =
      PA;
    const cream = [1.12, 1.1, 1.02],
      green = [0.66, 0.84, 0.72],
      slate = [0.62, 0.64, 0.66];
    const r = K.rng("pa_ext");

    // ---------------- the pier deck ----------------
    const holes = [
      [-236, 886.2, 2.2, 1.2],
      [-252.5, 901.5, 1.6, 2.4],
      [-229, 904.2, 3.0, 1.0],
    ];
    // deck in strips so the holes are real (you can see / fall into the water)
    const inHole = (x0, z0, x1, z1) =>
      holes.some(
        ([hx, hz, hw, hd]) =>
          x0 < hx + hw / 2 &&
          x1 > hx - hw / 2 &&
          z0 < hz + hd / 2 &&
          z1 > hz - hd / 2,
      );
    for (let x = DX0; x < DX1 - 0.01; x += 2.2)
      for (let z = DZ0; z < DZ1 - 0.01; z += 3.0) {
        const x1 = Math.min(DX1, x + 2.2),
          z1 = Math.min(DZ1, z + 3.0);
        if (inHole(x, z, x1, z1)) continue;
        b.face("deck", x, PY, z1, 1, 0, 0, 0, 0, -1, x1 - x, z1 - z, {
          uv: "top",
          tint: [0.92, 0.9, 0.84],
          grime: 0.5,
        });
        b.col(x, PY - 1.0, z, x1, PY, z1, { tag: "deck", surface: "wood" });
      }
    for (const [hx, hz, hw, hd] of holes) {
      // splintered plank ends around each hole
      for (let k = 0; k < 6; k++) {
        const e = k % 2 ? 1 : -1;
        b.box(
          "wood_rotten",
          hx + (r() - 0.5) * hw,
          PY - 0.35 - r() * 0.3,
          hz + (e * hd) / 2,
          0.22,
          0.06,
          0.6 + r() * 0.5,
          { yaw: (r() - 0.5) * 0.8, tint: [0.5, 0.44, 0.38] },
        );
      }
      b.hplate(
        "decal",
        hx,
        PY + 0.012,
        hz,
        hw + 1.4,
        hd + 1.4,
        r() * 3,
        K.decal("grime", 30 + ((hx | 0) % 5)),
      );
    }
    // fascia, piles, bracing, fenders
    for (const [ax, az, bx, bz] of [
      [DX0, DZ0, DX1, DZ0],
      [DX0, DZ1, DX1, DZ1],
      [DX0, DZ0, DX0, DZ1],
    ])
      b.boxMM(
        "wood_rotten",
        Math.min(ax, bx) - 0.2,
        PY - 0.6,
        Math.min(az, bz) - 0.2,
        Math.max(ax, bx) + 0.2,
        PY + 0.05,
        Math.max(az, bz) + 0.2,
        { tint: [0.46, 0.42, 0.36], faces: "nsewtb" },
      );
    K.piles(b, DX0, DZ0, DX1 - 6, DZ1, PY, 2.8, { edgeOnly: true, seed: 31 });
    for (let x = DX0 + 1; x < DX1 - 6; x += 2.8)
      for (const z of [DZ0, DZ1])
        b.beam("wood_rotten", x, -1.1, z, x + 2.8, PY - 0.5, z, 0.12, 0.08, {
          tint: [0.48, 0.42, 0.36],
        });
    for (let x = DX0 + 2; x < DX1 - 6; x += 4.5) {
      K.tireFender(b, x, PY - 0.7, DZ0 - 0.2, 0, -1);
      K.tireFender(b, x + 2, PY - 0.7, DZ1 + 0.2, 0, 1);
    }
    for (let x = DX0 + 1.5; x < DX1 - 4; x += 6) {
      K.bollard(b, x, PY, DZ0 + 0.55);
      K.bollard(b, x + 3, PY, DZ1 - 0.55);
    }
    K.bollard(b, DX0 + 0.6, PY, 890);
    K.bollard(b, DX0 + 0.6, PY, 900);
    // steps down to the Battery at the land end
    for (let k = 0; k < 2; k++) {
      b.boxMM(
        "granite",
        DX1,
        0,
        DZ0 + 2,
        DX1 + 0.4 + (1 - k) * 0.4,
        PY - k * 0.17,
        DZ1 - 2,
        { tint: [0.72, 0.7, 0.66] },
      );
    }
    b.col(DX1, 0, DZ0 + 2, DX1 + 0.8, PY - 0.17, DZ1 - 2, { tag: "stairs" });
    // swimmers' stairs at the west end
    for (let k = 0; k < 5; k++) {
      const dd = 0.3 + (4 - k) * 0.34,
        y = -1.55 + k * 0.37;
      b.boxMM(
        "planks_iron",
        DX0 - dd - 0.17,
        y - 0.08,
        897.5,
        DX0 - dd + 0.17,
        y,
        898.5,
        { tint: [0.6, 0.52, 0.44], faces: "nsewtb" },
      );
      b.col(DX0 - dd - 0.17, y - 0.3, 897.5, DX0 - dd + 0.17, y, 898.5, {
        tag: "stairs",
        surface: "wood",
      });
    }

    // ---------------- building massing ----------------
    const H1 = PF + 4.2,
      H2 = PF + 8.4,
      H3 = PF + 12.4; // head house floors (3 storeys)
    const SH = PF + 8.4; // shed eaves
    b.boxMM("granite", SX0 - 0.2, PY, BZ0 - 0.2, HX1 + 0.2, PF, BZ1 + 0.2, {
      tint: [0.7, 0.68, 0.64],
    });
    // head house walls
    const clap = (ax, az, bx, bz, y0, h, nx, nz) =>
      K.fwall(b, "clapboard", ax, az, bx, bz, y0, h, nx, nz, { tint: cream });
    clap(HX0, BZ0, HX1, BZ0, PF, H3 - PF, 0, -1);
    clap(HX0, BZ1, HX1, BZ1, PF, H3 - PF, 0, 1);
    clap(HX1, BZ0, HX1, BZ1, PF, H3 - PF, 1, 0);
    // shed walls (north/south), west gable to the tower
    clap(SX0, BZ0, HX0, BZ0, PF, SH - PF, 0, -1);
    clap(SX0, BZ1, HX0, BZ1, PF, SH - PF, 0, 1);
    clap(SX0, BZ0, SX0, BZ1, PF, SH - PF, -1, 0);
    // head-house flank above the shed roof line (west face)
    clap(HX0, BZ0, HX0, BZ1, SH, H3 - SH, -1, 0);
    b.col(SX0, PY, BZ0, HX1, H3, BZ1, { tag: "building" });
    // corner boards, floor bands, window trim in dark green
    const band = (x0, x1, y, h) => {
      b.boxMM("ferry_green", x0 - 0.12, y, BZ0 - 0.12, x1 + 0.12, y + h, BZ0, {
        tint: green,
      });
      b.boxMM("ferry_green", x0 - 0.12, y, BZ1, x1 + 0.12, y + h, BZ1 + 0.12, {
        tint: green,
      });
    };
    band(HX0, HX1, H1 - 0.15, 0.3);
    band(HX0, HX1, H2 - 0.15, 0.3);
    band(SX0, HX0, PF + 4.3, 0.25);
    b.boxMM(
      "ferry_green",
      HX1,
      H1 - 0.15,
      BZ0 - 0.12,
      HX1 + 0.12,
      H1 + 0.15,
      BZ1 + 0.12,
      { tint: green },
    );
    b.boxMM(
      "ferry_green",
      HX1,
      H2 - 0.15,
      BZ0 - 0.12,
      HX1 + 0.12,
      H2 + 0.15,
      BZ1 + 0.12,
      { tint: green },
    );
    for (const [x, z] of [
      [HX1, BZ0],
      [HX1, BZ1],
      [HX0, BZ0],
      [HX0, BZ1],
      [SX0, BZ0],
      [SX0, BZ1],
    ])
      b.box("ferry_green", x, PF, z, 0.36, (x === SX0 ? SH : H3) - PF, 0.36, {
        tint: green,
      });
    for (let x = SX0 + 3.5; x < HX0; x += 3.5)
      for (const z of [BZ0, BZ1])
        b.box("ferry_green", x, PF, z, 0.28, SH - PF, 0.3, { tint: green });
    // eaves: brackets + gutters
    for (const [x0, x1, y] of [
      [HX0, HX1, H3],
      [SX0, HX0, SH],
    ])
      for (const [z, nz] of [
        [BZ0, -1],
        [BZ1, 1],
      ]) {
        b.boxMM(
          "ferry_green",
          x0 - 0.4,
          y - 0.1,
          Math.min(z, z + nz * 0.7),
          x1 + 0.4,
          y + 0.12,
          Math.max(z, z + nz * 0.7),
          { tint: green, faces: "nsewtb" },
        );
        for (let x = x0 + 0.6; x < x1; x += 1.2)
          b.box("ferry_green", x, y - 0.55, z + nz * 0.25, 0.12, 0.45, 0.5, {
            tint: green,
          });
      }
    // ---- roofs: hipped slate on the head house (with dormers), long gable on the shed with a monitor ----
    const hip = (x0, x1, z0, z1, y, h, rx) => {
      // ridge along x from x0+rx to x1-rx at y+h
      const zm = (z0 + z1) / 2;
      b.quadN(
        "slate",
        [x0, y, z0],
        [x1, y, z0],
        [x1 - rx, y + h, zm],
        [x0 + rx, y + h, zm],
        [0, 1, -1],
        { tint: slate },
      );
      b.quadN(
        "slate",
        [x1, y, z1],
        [x0, y, z1],
        [x0 + rx, y + h, zm],
        [x1 - rx, y + h, zm],
        [0, 1, 1],
        { tint: slate },
      );
      if (rx > 0) {
        K.tri(
          b,
          "slate",
          [x0, y, z1],
          [x0, y, z0],
          [x0 + rx, y + h, zm],
          [-1, 1, 0],
          { tint: slate },
        );
        K.tri(
          b,
          "slate",
          [x1, y, z0],
          [x1, y, z1],
          [x1 - rx, y + h, zm],
          [1, 1, 0],
          { tint: slate },
        );
      }
      b.beam(
        "patina",
        x0 + rx,
        y + h + 0.05,
        zm,
        x1 - rx,
        y + h + 0.05,
        zm,
        0.22,
        0.18,
      );
      for (const s of [-1, 1])
        for (const e of [-1, 1])
          if (rx > 0)
            b.beam(
              "patina",
              e < 0 ? x0 : x1,
              y + 0.05,
              s < 0 ? z0 : z1,
              e < 0 ? x0 + rx : x1 - rx,
              y + h + 0.05,
              zm,
              0.16,
              0.14,
            );
    };
    hip(HX0 - 0.4, HX1 + 0.4, BZ0 - 0.7, BZ1 + 0.7, H3 + 0.1, 3.6, 3.4);
    hip(SX0 - 0.4, HX0, BZ0 - 0.7, BZ1 + 0.7, SH + 0.1, 3.0, 0);
    // shed gable end (west) closed by the tower; monitor along the ridge
    K.tri(
      b,
      "clapboard",
      [SX0, SH + 0.1, BZ1 + 0.7],
      [SX0, SH + 0.1, BZ0 - 0.7],
      [SX0, SH + 3.1, 895],
      [-1, 0, 0],
      { tint: cream },
    );
    b.boxMM("ferry_green", SX0 + 3, SH + 2.5, 893.8, HX0 - 3, SH + 3.9, 896.2, {
      tint: green,
    });
    for (let x = SX0 + 3.6; x < HX0 - 3.2; x += 1.3)
      for (const [z, nz] of [
        [893.78, -1],
        [896.22, 1],
      ])
        b.quadN(
          r() < 0.3 ? "paint_black" : "glass",
          [x - 0.5, SH + 2.8, z],
          [x + 0.5, SH + 2.8, z],
          [x + 0.5, SH + 3.6, z],
          [x - 0.5, SH + 3.6, z],
          [0, 0, nz],
          { tint: [0.3, 0.36, 0.36] },
        );
    b.quadN(
      "slate",
      [SX0 + 2.8, SH + 3.9, 893.6],
      [HX0 - 2.8, SH + 3.9, 893.6],
      [HX0 - 2.8, SH + 4.5, 895],
      [SX0 + 2.8, SH + 4.5, 895],
      [0, 1, -1],
      { tint: slate },
    );
    b.quadN(
      "slate",
      [HX0 - 2.8, SH + 3.9, 896.4],
      [SX0 + 2.8, SH + 3.9, 896.4],
      [SX0 + 2.8, SH + 4.5, 895],
      [HX0 - 2.8, SH + 4.5, 895],
      [0, 1, 1],
      { tint: slate },
    );
    // dormers on the head-house roof
    for (const [x, z, nz] of [
      [-219, BZ0 + 0.6, -1],
      [-219, BZ1 - 0.6, 1],
    ]) {
      b.boxMM(
        "clapboard",
        x - 1,
        H3 + 0.2,
        Math.min(z, z - nz * 1.4),
        x + 1,
        H3 + 2.0,
        Math.max(z, z - nz * 1.4),
        { tint: cream },
      );
      K.sash(b, x, H3 + 0.5, z + nz * 0.01, 0, nz, 1.1, 1.2, {
        state: nz > 0 ? "broken" : "glass",
        frame: "ferry_green",
        surround: "ferry_green",
        surroundTint: green,
        cols: 2,
        rows: 2,
        lintel: 0.15,
      });
      b.quadN(
        "slate",
        [x - 1.2, H3 + 2.0, z + nz * 0.2],
        [x + 1.2, H3 + 2.0, z + nz * 0.2],
        [x + 1.2, H3 + 2.6, z - nz * 1.4],
        [x - 1.2, H3 + 2.6, z - nz * 1.4],
        [0, 1, nz],
        { tint: slate },
      );
    }
    // shed roof: a collapsed hole (you can look down into the boathouse)
    b.burn(-236, SH + 1.5, 891, 3, 0.6);
    for (let k = 0; k < 4; k++)
      b.beam(
        "wood_rotten",
        -238 + k * 1.3,
        SH + 1.2,
        890.2,
        -237.5 + k * 1.2,
        SH - 0.8,
        892.5,
        0.15,
        0.2,
        { tint: [0.4, 0.34, 0.28] },
      );
    b.quadN(
      "paint_black",
      [-239, SH + 0.35, 890],
      [-233.5, SH + 0.35, 890],
      [-233.5, SH + 1.9, 892.6],
      [-239, SH + 1.9, 892.6],
      [0, 1, -1],
      { tint: [0.03, 0.03, 0.03] },
    );
    // chimney + vents
    b.boxMM("brick_red", -217.5, H3, 897, -216.3, H3 + 5.2, 898.2, {
      tint: [0.7, 0.5, 0.42],
    });
    b.boxMM("concrete_dark", -217.7, H3 + 5.2, 896.8, -216.1, H3 + 5.45, 898.4);

    // ---- head house east face (the land end): door, windows, PIER A ----
    const sashE = (z, y, st) =>
      K.sash(b, HX1, y, z, 1, 0, 1.25, 2.2, {
        state: st,
        frame: "ferry_green",
        surround: "ferry_green",
        surroundTint: green,
        cols: 2,
        rows: 3,
        lintel: 0.22,
      });
    [
      [891.8, "glass"],
      [898.2, "boarded"],
    ].forEach(([z, st]) => sashE(z, PF + 1.1, st));
    for (const [z, st] of [
      [891.8, "broken"],
      [895, "glass"],
      [898.2, "dark"],
    ]) {
      sashE(z, H1 + 0.8, st);
      sashE(z, H2 + 0.7, st === "glass" ? "broken" : "glass");
    }
    // double doors with a transom and a pediment hood
    b.boxMM("ferry_green", HX1 + 0.01, PF, 893.9, HX1 + 0.12, PF + 2.9, 896.1, {
      tint: [0.52, 0.66, 0.56],
    });
    b.boxMM("glass", HX1 + 0.13, PF + 3.0, 894, HX1 + 0.14, PF + 3.6, 896, {
      tint: [0.3, 0.34, 0.34],
    });
    b.boxMM("ferry_green", HX1, PF + 3.7, 893.5, HX1 + 0.5, PF + 3.95, 896.5, {
      tint: green,
      faces: "nsewtb",
    });
    for (const z of [893.6, 896.4])
      b.box("ferry_green", HX1 + 0.3, PF + 2.9, z, 0.2, 0.8, 0.14, {
        tint: green,
      });
    K.letters(b, HX1 + 0.05, H3 - 0.9, 895, 1, 0, 5.2, 1.2, "PIER  A", {
      fg: "#e8e0c0",
      font: "Georgia, serif",
      off: 0.06,
    });
    b.plate(
      "art",
      HX1 + 0.08,
      PF + 4.4,
      895,
      1,
      0,
      3.6,
      0.55,
      K.signCell(
        "pa_fdny",
        "FIRE DEPT. CITY OF NEW YORK\nMARINE COMPANY 1",
        512,
        96,
        {
          bg: "#7a1a14",
          fg: "#f0d890",
          font: "Georgia, serif",
          border: "#d8b060",
        },
      ),
      { off: 0.0 },
    );
    b.plate(
      "art",
      HX1 + 0.08,
      PF + 1.4,
      897.4,
      1,
      0,
      0.9,
      1.2,
      K.signCell(
        "pa_warn",
        "DANGER\nSHELLBACKS\nKEEP OUT\n\n— Whitehall\nCaravan Guild",
        192,
        256,
        { bg: "#d8c890", fg: "#6a1010", font: "Arial Black, sans-serif" },
      ),
      { off: 0.0 },
    );
    b.plate(
      "decal",
      HX1 + 0.1,
      PF + 2.0,
      892.1,
      1,
      0,
      2.2,
      0.9,
      K.tag("LURKS", "#2a2a2a", 256, 96),
      { off: 0.03 },
    );
    for (const z of [893.2, 896.8]) {
      b.box("ferry_green", HX1 + 0.18, PF + 3.0, z, 0.1, 0.35, 0.1);
      K.lamp(d, HX1 + 0.35, PF + 2.8, z, "cage", [1, 0.78, 0.5], 0, 0, {
        ceil: PF + 3.1,
        dead: z > 895,
        glowSize: 1.1,
      });
    }

    // ---- long faces (north / south): apparatus doors below, paired windows above ----
    for (const [z, nz] of [
      [BZ0, -1],
      [BZ1, 1],
    ]) {
      [-241.5, -234.5, -227.5].forEach((x, i) => {
        // tall round-arched apparatus / boat doors
        const st = (i + (nz > 0 ? 1 : 0)) % 3;
        K.archWin(b, x, PF, z, 0, nz, 3.0, 4.0, {
          state: st === 0 ? "boarded" : "dark",
          surround: "ferry_green",
          surroundTint: green,
          fw: 0.22,
          depth: 0.2,
          mullion: false,
          sill: false,
          keystone: true,
        });
        if (st === 1) {
          // one leaf fallen outward on the deck
          b.quadN(
            "wood_rotten",
            [x - 1.5, PY + 0.05, z + nz * 0.3],
            [x, PY + 0.05, z + nz * 0.3],
            [x - 0.1, PY + 0.2, z + nz * 3.0],
            [x - 1.5, PY + 0.15, z + nz * 3.0],
            [0, 1, 0],
            { tint: [0.46, 0.56, 0.48] },
          );
          b.quadN(
            "ferry_green",
            [x, PF, z + nz * 0.08],
            [x + 1.5, PF, z + nz * 0.08],
            [x + 1.5, PF + 3.2, z + nz * 0.08],
            [x, PF + 3.2, z + nz * 0.08],
            [0, 0, nz],
            { tint: [0.46, 0.6, 0.5] },
          );
        }
        for (const e of [-1, 1])
          K.sash(b, x + e * 0.9, PF + 5.0, z, 0, nz, 1.0, 1.8, {
            state:
              (i + e + (nz > 0 ? 2 : 0)) % 4 === 0
                ? "broken"
                : (i + e) % 3 === 0
                  ? "dark"
                  : "glass",
            frame: "ferry_green",
            surround: "ferry_green",
            surroundTint: green,
            cols: 2,
            rows: 3,
            lintel: 0.18,
          });
      });
      for (const [x, st] of [
        [-221.5, "glass"],
        [-216.5, "broken"],
      ]) {
        K.sash(b, x, PF + 1.1, z, 0, nz, 1.2, 2.2, {
          state: st,
          frame: "ferry_green",
          surround: "ferry_green",
          surroundTint: green,
          cols: 2,
          rows: 3,
          lintel: 0.2,
        });
        K.sash(b, x, H1 + 0.8, z, 0, nz, 1.2, 2.2, {
          state: nz > 0 ? "boarded" : "glass",
          frame: "ferry_green",
          surround: "ferry_green",
          surroundTint: green,
          cols: 2,
          rows: 3,
          lintel: 0.2,
        });
        K.sash(b, x, H2 + 0.7, z, 0, nz, 1.2, 2.2, {
          state: "dark",
          frame: "ferry_green",
          surround: "ferry_green",
          surroundTint: green,
          cols: 2,
          rows: 3,
          lintel: 0.2,
        });
      }
      K.lifebuoy(b, -230.9, PF + 2.6, z + nz * 0.02, 0, nz);
      b.plate(
        "decal",
        -238,
        PF + 1.2,
        z + nz * 0.04,
        0,
        nz,
        4,
        1.8,
        K.decal("grime", 40 + (nz > 0 ? 1 : 0)),
        { off: 0.02 },
      );
    }
    // hose reel + hydrant standpipe on the north apron
    b.cyl("fdny_red", -226, PY, 887.2, 0.14, 0.14, 1.0, 8, {
      tint: [0.9, 0.3, 0.2],
    });
    b.cyl("fdny_red", -226, PY + 1.0, 887.2, 0.22, 0.18, 0.2, 8);
    for (const e of [-1, 1])
      b.box("fdny_red", -226 + e * 0.2, PY + 0.6, 887.2, 0.14, 0.12, 0.12);
    b.geo("fdny_red", K.torusGeo(), {
      x: -228.3,
      y: PY + 0.75,
      z: 886.9,
      s: 0.62,
      sz: 0.9,
      ry: 0,
      tint: [0.8, 0.3, 0.22],
    });
    b.box("rust", -228.3, PY, 886.9, 0.9, 0.8, 0.08);
    b.geo("rubber", K.torusGeo(), {
      x: -228.3,
      y: PY + 0.75,
      z: 886.9,
      s: 0.5,
      sz: 1.6,
      tint: [0.35, 0.32, 0.26],
    });

    // ---------------- the clock tower ----------------
    const T0 = TX - TW / 2,
      T1 = TX + TW / 2,
      Z0 = TZ - TW / 2,
      Z1 = TZ + TW / 2;
    const TS = PF + 13.6,
      TC = TS + 3.6,
      TB = TC + 2.8; // shaft top, clock stage top, belfry top
    for (const [ax, az, bx2, bz, nx, nz] of [
      [T0, Z0, T1, Z0, 0, -1],
      [T0, Z1, T1, Z1, 0, 1],
      [T0, Z0, T0, Z1, -1, 0],
      [T1, Z0, T1, Z1, 1, 0],
    ]) {
      K.fwall(b, "clapboard", ax, az, bx2, bz, PF, TS - PF, nx, nz, {
        tint: cream,
      });
    }
    b.boxMM("clapboard", T0 - 0.25, TS, Z0 - 0.25, T1 + 0.25, TC, Z1 + 0.25, {
      tint: cream,
      faces: "nsewb",
    });
    b.col(T0, PY, Z0, T1, TB, Z1, { tag: "tower" });
    // corner pilasters, bands, the memorial window, lancet slits
    for (const [x, z] of [
      [T0, Z0],
      [T1, Z0],
      [T1, Z1],
      [T0, Z1],
    ]) {
      b.box("ferry_green", x, PF, z, 0.45, TS - PF, 0.45, { tint: green });
      b.box("ferry_green", x, TS, z, 0.6, TC - TS, 0.6, { tint: green });
    }
    for (const y of [PF + 4.3, SH + 0.2, TS - 0.3])
      b.boxMM(
        "ferry_green",
        T0 - 0.2,
        y,
        Z0 - 0.2,
        T1 + 0.2,
        y + 0.3,
        Z1 + 0.2,
        { tint: green },
      );
    K.archWin(b, T0, PF + 5.4, TZ, -1, 0, 1.4, 3.2, {
      state: "broken",
      surround: "ferry_green",
      surroundTint: green,
      frame: "ferry_green",
      fw: 0.18,
      depth: 0.18,
    });
    for (const [nx, nz] of [
      [0, -1],
      [0, 1],
    ])
      K.archWin(b, TX, SH + 1.2, TZ + (nz * TW) / 2, nx, nz, 0.8, 2.2, {
        state: "dark",
        surround: "ferry_green",
        surroundTint: green,
        fw: 0.14,
        depth: 0.14,
        mullion: false,
      });
    // tower door (west): barred from inside (one-way shortcut, see interior)
    b.boxMM(
      "ferry_green",
      T0 - 0.12,
      PF,
      TZ - 0.8,
      T0 - 0.02,
      PF + 2.5,
      TZ + 0.8,
      { tint: [0.5, 0.62, 0.54] },
    );
    b.plate(
      "art",
      T0 - 0.14,
      PF + 3.0,
      TZ,
      -1,
      0,
      1.6,
      0.9,
      K.signCell(
        "pa_memorial",
        'IN MEMORY OF THE\nMEN OF THE MERCHANT MARINE\n1917 · 1918\n"THE SEA SHALL GIVE UP ITS DEAD"',
        384,
        216,
        {
          bg: "#5a4a30",
          fg: "#e8d8a0",
          font: "Georgia, serif",
          border: "#b89048",
        },
      ),
      { off: 0.01 },
    );
    // four clock dials at 9:47 (hands animated once the clock is wound: separate group)
    const dial = K.paint("art", "ph2_pa_dial", 256, 256, (x, X, Y, W, Hh) => {
      const cx = X + W / 2,
        cy = Y + Hh / 2,
        R = W * 0.48;
      x.fillStyle = "#e8e2cc";
      x.beginPath();
      x.arc(cx, cy, R, 0, 6.3);
      x.fill();
      x.strokeStyle = "#26332a";
      x.lineWidth = 6;
      x.stroke();
      x.fillStyle = "#26332a";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = "bold 24px Georgia, serif";
      const RN = [
        "XII",
        "I",
        "II",
        "III",
        "IIII",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
      ];
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2 - Math.PI / 2;
        x.fillText(
          RN[k],
          cx + Math.cos(a) * R * 0.78,
          cy + Math.sin(a) * R * 0.78,
        );
      }
      K.stains(x, X, Y, W, Hh, 12, 4501, 0.5, [60, 50, 30]);
      K.streaks(x, X, Y, W, Hh, 10, 4502, 0.45);
      x.fillStyle = "rgba(20,20,15,0.8)";
      x.beginPath();
      x.moveTo(cx + R * 0.3, cy - R * 0.2);
      x.lineTo(cx + R * 0.55, cy - R * 0.1);
      x.lineTo(cx + R * 0.42, cy + R * 0.12);
      x.fill(); // a bullet-cracked pane
    });
    PA.dials = [];
    const DY = (TS + TC) / 2;
    for (const [nx, nz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const cx = TX + nx * (TW / 2 + 0.26),
        cz = TZ + nz * (TW / 2 + 0.26);
      b.plate("art", cx, DY, cz, nx, nz, 2.6, 2.6, dial, { off: 0.02 });
      b.geo("brass_old", K.torusGeo(), {
        x: cx + nx * 0.03,
        y: DY,
        z: cz + nz * 0.03,
        s: 1.33,
        sz: 0.45,
        ry: Math.atan2(nx, nz),
        tint: [0.8, 0.7, 0.45],
      });
      PA.dials.push({ x: cx + nx * 0.06, y: DY, z: cz + nz * 0.06, nx, nz });
    }
    // belfry: four open arches on posts, bell, copper pyramid + finial
    for (const [x, z] of [
      [T0, Z0],
      [T1, Z0],
      [T1, Z1],
      [T0, Z1],
    ])
      b.box("ferry_green", x, TC, z, 0.5, TB - TC, 0.5, { tint: green });
    b.boxMM(
      "ferry_green",
      T0 - 0.3,
      TC,
      Z0 - 0.3,
      T1 + 0.3,
      TC + 0.2,
      Z1 + 0.3,
      { tint: green, faces: "nsewtb" },
    );
    b.boxMM(
      "ferry_green",
      T0 - 0.35,
      TB - 0.3,
      Z0 - 0.35,
      T1 + 0.35,
      TB,
      Z1 + 0.35,
      { tint: green, faces: "nsewtb" },
    );
    for (const [nx, nz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ])
      for (let k = 0; k < 6; k++) {
        const a0 = (PI * k) / 6,
          a1 = (PI * (k + 1)) / 6,
          R = 2.3,
          yb = TB - 2.6;
        const ux = nz,
          uz = -nx,
          cx = TX + (nx * TW) / 2,
          cz = TZ + (nz * TW) / 2;
        b.beam(
          "ferry_green",
          cx + ux * Math.cos(a0) * R,
          yb + 0.3 + Math.sin(a0) * 1.8,
          cz + uz * Math.cos(a0) * R,
          cx + ux * Math.cos(a1) * R,
          yb + 0.3 + Math.sin(a1) * 1.8,
          cz + uz * Math.cos(a1) * R,
          0.2,
          0.3,
          { tint: green },
        );
      }
    K.dome(b, "brass_old", TX, TC + 0.6, TZ, 0.7, 1.1, 0.12, 12, 4, false, {
      tint: [0.55, 0.5, 0.36],
    }); // bell
    b.cyl("brass_old", TX, TC + 0.3, TZ, 0.72, 0.8, 0.3, 12, {
      tint: [0.5, 0.46, 0.34],
    });
    b.beam("rust", T0 + 0.2, TC + 1.75, TZ, T1 - 0.2, TC + 1.75, TZ, 0.2, 0.2);
    // pyramid roof (copper)
    const pk = [TX, TB + 4.2, TZ];
    for (const [a, c2, n] of [
      [
        [T0 - 0.5, TB, Z0 - 0.5],
        [T1 + 0.5, TB, Z0 - 0.5],
        [0, 0.6, -1],
      ],
      [
        [T1 + 0.5, TB, Z1 + 0.5],
        [T0 - 0.5, TB, Z1 + 0.5],
        [0, 0.6, 1],
      ],
      [
        [T0 - 0.5, TB, Z1 + 0.5],
        [T0 - 0.5, TB, Z0 - 0.5],
        [-1, 0.6, 0],
      ],
      [
        [T1 + 0.5, TB, Z0 - 0.5],
        [T1 + 0.5, TB, Z1 + 0.5],
        [1, 0.6, 0],
      ],
    ])
      K.tri(b, "patina", a, c2, pk, n, { tint: [0.55, 0.74, 0.62] });
    b.pipe("brass_old", TX, TB + 4.1, TZ, TX, TB + 6.6, TZ, 0.06, 6);
    b.geo("brass_old", K.sphereGeo(), { x: TX, y: TB + 4.35, z: TZ, s: 0.22 });
    b.beam(
      "brass_old",
      TX - 0.6,
      TB + 6.0,
      TZ,
      TX + 0.6,
      TB + 6.0,
      TZ,
      0.05,
      0.05,
    ); // weather vane arms
    b.quadN(
      "brass_old",
      [TX, TB + 6.3, TZ],
      [TX + 0.9, TB + 6.3, TZ],
      [TX + 0.9, TB + 6.6, TZ],
      [TX, TB + 6.6, TZ],
      [0, 0, 1],
      { tint: [0.6, 0.54, 0.34] },
    );
    PA.clockY = DY;

    // ---------------- shellback country: nests, shells, bones on the west apron ----------------
    K.nest(d, -252.2, PY, 888.3, 1.3, 9, { seed: 61 });
    K.nest(d, -241.5, PY, 903.3, 1.1, 6, { seed: 62 });
    K.nest(d, -253.5, PY, 895, 0.9, 5, { seed: 63 });
    for (let k = 0; k < 10; k++) {
      const x = -254 + r() * 14,
        z = 885.5 + r() * 19;
      if (z > 888.5 && z < 901.5 && x > -251) continue;
      d.box("shell", x, PY, z, 0.5 + r() * 0.5, 0.08, 0.4, {
        yaw: r() * 3,
        tint: [0.55, 0.38, 0.26],
      });
    }
    d.hplate("decal", -247, PY + 0.012, 886.8, 8, 3.2, 0, K.decal("roach", 5));
    // rope coils, crates, oil drums, a harbour-patrol skiff hauled out on the apron
    for (const [x, z] of [
      [-223.5, 886.2],
      [-212.5, 903.5],
      [-249.8, 904],
    ])
      for (let k = 0; k < 4; k++)
        d.geo("rope", K.torusGeo(), {
          x,
          y: PY + 0.06 + k * 0.08,
          z,
          sx: 0.5 - k * 0.06,
          sy: 0.5 - k * 0.06,
          sz: 0.4,
          rx: HP,
          tint: [0.7, 0.6, 0.42],
        });
    K.crates(d, -216.5, PY, 903.6, 0.3, 3, { col: true });
    K.crates(d, -210, PY, 886.5, -0.2, 2, { col: true });
    for (const [x, z] of [
      [-212.2, 888.4],
      [-211.2, 889.5],
    ]) {
      d.cyl("rust", x, PY, z, 0.3, 0.3, 0.9, 10, { tint: [0.6, 0.3, 0.2] });
    }
    // a harbour-patrol skiff hauled out on chocks by the land end
    K.hull(d, "hull_red", {
      cx: -209,
      cz: 901.6,
      len: 5,
      beam: 1.8,
      deck: PY + 1.0,
      keel: PY + 0.2,
      sheer: 0.25,
      kind: "bow",
      nu: 8,
      nv: 10,
      boot: PY + 0.45,
      bootTint: [0.9, 0.88, 0.82],
      deckMat: "wood_rotten",
      rub: "rubber",
    });
    for (const z of [900.2, 903])
      d.box("wood_rotten", -209, PY, z, 1.6, 0.25, 0.3, {
        tint: [0.5, 0.42, 0.34],
      });
    d.ocol(-209, 901.6, 1.8, 5, PY, PY + 1.0, 0, {
      tag: "boat",
      surface: "metal",
      walkable: false,
    });
    // lamp posts on the pier
    for (const [x, z] of [
      [-230, 885.2],
      [-218, 904.8],
      [-250, 904.8],
    ]) {
      d.cyl("cast_iron", x, PY, z, 0.08, 0.06, 3.8, 6);
      d.box("cast_iron", x, PY + 3.8, z, 0.5, 0.08, 0.08);
      K.lamp(d, x + 0.22, PY + 3.55, z, "globe", [1, 0.8, 0.55], 0, 0, {
        ceil: PY + 3.8,
        size: 0.13,
        dead: x < -240,
        glowSize: 1.4,
      });
    }

    // ---------------- the fireboat PATRICK DUGGAN (sunk at her berth) ----------------
    fireboat(ctx, root, b);

    b.finish(root);
    const det = d.finish(root);
    G.world.addLOD(det, 170, new THREE.Vector3(-232, 2, 895));
    // clock hands: separate group (turned by update when the clock runs)
    const hands = new THREE.Group();
    hands.name = "ph2_pa_hands";
    const mat = K.mat("paint_black");
    const hg = new THREE.BoxGeometry(0.1, 0.8, 0.04);
    hg.translate(0, 0.4, 0);
    const mg = new THREE.BoxGeometry(0.07, 1.1, 0.04);
    mg.translate(0, 0.55, 0);
    PA.handMeshes = [];
    for (const dl of PA.dials) {
      const g = new THREE.Group();
      g.position.set(dl.x, dl.y, dl.z);
      g.rotation.y = Math.atan2(dl.nx, dl.nz);
      const h = new THREE.Mesh(hg, mat),
        m = new THREE.Mesh(mg, mat);
      g.add(h);
      g.add(m);
      hands.add(g);
      PA.handMeshes.push({ h, m });
    }
    root.add(hands);
    PA.setHands(9 + 47 / 60);
    G.scene.add(root);
    ctx.anchors.door = new THREE.Vector3(HX1 + 0.35, PF + 1.3, 895);
    ctx.anchors.towerDoor = new THREE.Vector3(T0 - 0.35, PF + 1.2, TZ);
  }
  /** Set every dial to an hour (float, 0..24). */
  PA.setHands = function (hour) {
    if (!PA.handMeshes) return;
    const hh = ((hour % 12) / 12) * PI * 2,
      mm = (hour % 1) * PI * 2;
    for (const p of PA.handMeshes) {
      p.h.rotation.z = -hh;
      p.m.rotation.z = -mm;
    }
  };

  // ------------------------------------------------------------------
  // Fireboat: hull (bow/transom), wheelhouse, deckhouse, monitor tower, masts
  // built in boat-local coords (length along z, bow +z), placed by a pitched/rolled group
  // ------------------------------------------------------------------
  function fireboat(ctx, root, b) {
    const B = PA.BOAT,
      fb = K.builder({ name: "pa_boat", grime: 0.45 });
    const L = B.len,
      hb = B.beam / 2,
      DK = B.deck;
    K.hull(fb, "hull_dark", {
      cx: 0,
      cz: 0,
      len: L,
      beam: B.beam,
      deck: DK,
      keel: -2.4,
      sheer: 0.7,
      kind: "bow",
      nu: 12,
      nv: 22,
      boot: -0.2,
      bootTint: [0.55, 0.16, 0.12],
      deckMat: "deck",
      rub: "rubber",
      tint: [0.7, 0.68, 0.64],
    });
    // red sheer strake + white boot line
    for (const s of [-1, 1])
      fb.box(
        "hull_red",
        s * (hb - 0.05),
        DK - 0.45,
        -1.5,
        0.1,
        0.45,
        L * 0.72,
        { tint: [1, 0.9, 0.85] },
      );
    // bulwark rail
    for (const s of [-1, 1])
      for (let k = 0; k < 10; k++) {
        const z = -L / 2 + 1 + k * 2.2;
        fb.pipe(
          "rust",
          s * (hb - 0.25),
          DK,
          z,
          s * (hb - 0.25),
          DK + 0.9,
          z,
          0.035,
          5,
        );
      }
    for (const s of [-1, 1])
      fb.pipe(
        "fdny_red",
        s * (hb - 0.25),
        DK + 0.9,
        -L / 2 + 1,
        s * (hb - 0.25),
        DK + 0.9,
        L / 2 - 4,
        0.045,
        6,
      );
    // wheelhouse (forward) with windows all round, deckhouse aft of it
    const WZ0 = 3.2,
      WZ1 = 7.0;
    fb.boxMM("hull_red", -2.1, DK, WZ0, 2.1, DK + 2.5, WZ1, {
      tint: [0.95, 0.9, 0.85],
    });
    for (const s of [-1, 1])
      for (let k = 0; k < 3; k++)
        fb.quadN(
          k === 1 && s > 0 ? "paint_black" : "glass",
          [s * 2.12, DK + 1.35, WZ0 + 0.4 + k * 1.15],
          [s * 2.12, DK + 1.35, WZ0 + 1.3 + k * 1.15],
          [s * 2.12, DK + 2.2, WZ0 + 1.3 + k * 1.15],
          [s * 2.12, DK + 2.2, WZ0 + 0.4 + k * 1.15],
          [s, 0, 0],
          { tint: [0.28, 0.34, 0.34] },
        );
    for (let k = 0; k < 4; k++)
      fb.quadN(
        "glass",
        [-1.9 + k * 0.95, DK + 1.35, WZ1 + 0.02],
        [-1.1 + k * 0.95, DK + 1.35, WZ1 + 0.02],
        [-1.1 + k * 0.95, DK + 2.25, WZ1 + 0.02],
        [-1.9 + k * 0.95, DK + 2.25, WZ1 + 0.02],
        [0, 0, 1],
        { tint: [0.28, 0.34, 0.34] },
      );
    fb.quadN(
      "paint_black",
      [1.95, DK, WZ0 + 0.5],
      [1.95, DK, WZ0 + 1.4],
      [1.95, DK + 2.0, WZ0 + 1.4],
      [1.95, DK + 2.0, WZ0 + 0.5],
      [1, 0, 0],
      { tint: [0.03, 0.03, 0.03] },
    ); // open door (starboard)
    fb.boxMM(
      "cream_paint",
      -2.4,
      DK + 2.5,
      WZ0 - 0.2,
      2.4,
      DK + 2.7,
      WZ1 + 0.4,
      { tint: [0.85, 0.82, 0.74], faces: "nsewtb" },
    );
    fb.cyl("chrome", 0.9, DK + 2.7, WZ1 - 0.3, 0.2, 0.2, 0.35, 8);
    fb.pipe(
      "brass_old",
      -0.9,
      DK + 2.7,
      WZ1 - 0.5,
      -0.9,
      DK + 3.6,
      WZ1 - 0.5,
      0.05,
      5,
    ); // searchlight, horn
    fb.boxMM("hull_red", -1.8, DK, -4.5, 1.8, DK + 2.0, 0.5, {
      tint: [0.95, 0.9, 0.85],
    });
    for (const s of [-1, 1])
      for (let k = 0; k < 3; k++)
        fb.geo("glass", K.unitCyl(10), {
          x: s * 1.81,
          y: DK + 1.3,
          z: -3.8 + k * 1.7,
          sx: 0.22,
          sy: 0.04,
          sz: 0.22,
          rz: HP,
          tint: [0.3, 0.34, 0.34],
        }); // portholes
    // water-cannon monitor tower (lattice) + nozzles, the forward deck monitor
    K.lattice(fb, 0, -2.2, 1.2, 1.2, DK + 2.0, 5.2, {
      mat: "fdny_red",
      tint: [0.9, 0.35, 0.28],
      col: false,
      bay: 1.3,
      t: 0.1,
    });
    fb.boxMM("fdny_red", -0.9, DK + 7.2, -3.1, 0.9, DK + 7.35, -1.3, {
      tint: [0.9, 0.35, 0.28],
    });
    for (const [x, a] of [
      [-0.5, 0.4],
      [0.5, -0.3],
    ]) {
      fb.cyl("brass_old", x, DK + 7.35, -2.2, 0.12, 0.12, 0.4, 8);
      fb.pipe(
        "brass_old",
        x,
        DK + 7.65,
        -2.2,
        x + Math.sin(a) * 1.4,
        DK + 8.1,
        -2.2 + Math.cos(a) * 1.4,
        0.08,
        8,
      );
    }
    fb.cyl("brass_old", 0, DK, 9.2, 0.2, 0.2, 0.7, 8);
    fb.pipe("brass_old", 0, DK + 0.7, 9.2, 0, DK + 1.2, 10.4, 0.1, 8);
    // mast + radar + ensign
    fb.pipe("rust", 0, DK + 2.7, 5.2, 0, DK + 9.4, 5.2, 0.08, 6);
    fb.beam("rust", -1.1, DK + 7.6, 5.2, 1.1, DK + 7.6, 5.2, 0.06, 0.06);
    // stern (under water): hatch coaming, bollards
    fb.boxMM("rust", -1.1, DK, -9.5, 1.1, DK + 0.4, -7.5, {
      tint: [0.6, 0.45, 0.35],
    });
    for (const s of [-1, 1]) {
      K.bollard(fb, s * 2.2, DK, 8.8);
      K.bollard(fb, s * 2.2, DK, -10.2);
    }
    // name on the bows
    const nm = K.paint("art", "ph2_name_duggan", 1024, 96, (x, X, Y, W, Hh) => {
      x.clearRect(X, Y, W, Hh);
      x.fillStyle = "#e8e2d0";
      x.font = "bold 70px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("PATRICK DUGGAN", X + W / 2, Y + Hh / 2 + 3);
      for (let k = 0; k < 300; k++)
        x.clearRect(X + Math.random() * W, Y + Math.random() * Hh, 3, 2);
    });
    for (const s of [-1, 1])
      fb.quadN(
        "art",
        [s * (hb * 0.72), DK - 0.25, 6.0 - s * 3.6],
        [s * (hb * 0.72), DK - 0.25, 6.0 + s * 3.6],
        [s * (hb * 0.72), DK + 0.35, 6.0 + s * 3.6],
        [s * (hb * 0.72), DK + 0.35, 6.0 - s * 3.6],
        [s, 0, 0],
        { rect: nm, grime: 0 },
      );
    // weed & algae hanging off the submerged stern
    for (let k = 0; k < 12; k++) {
      const r = K.rng("weed" + k);
      fb.quadN(
        "slime",
        [(r() - 0.5) * 5, DK - 0.2, -8 - r() * 3],
        [(r() - 0.5) * 5 + 0.3, DK - 0.2, -8 - r() * 3],
        [(r() - 0.5) * 5 + 0.2, DK - 1.4, -8 - r() * 3],
        [(r() - 0.5) * 5, DK - 1.4, -8 - r() * 3],
        [0, 0, 1],
        { tint: [0.5, 0.6, 0.4] },
      );
    }
    const g = fb.finish(null);
    // placement: outer = position + yaw (bow → east), inner = pitch (stern down) + roll (list to port/north)
    const outer = new THREE.Group();
    outer.name = "ph2_fireboat";
    outer.position.set(B.x, B.y, B.z);
    outer.rotation.y = HP;
    const inner = new THREE.Group();
    inner.rotation.set(B.pitch, 0, B.roll);
    inner.add(g);
    outer.add(inner);
    root.add(outer);
    outer.updateMatrixWorld(true);
    // walkable deck colliders: stepped boxes along the length where the deck is above water
    const P = new THREE.Vector3();
    const toWorld = (lx, ly, lz) => {
      P.set(lx, ly, lz);
      return inner.localToWorld(P.clone());
    };
    PA.boatDeck = [];
    for (let z = -6; z < 10.5; z += 1.1) {
      const w = z > 8 ? 3.2 : 5.4;
      const c = toWorld(
        0,
        DK + (z > 6 ? 0.7 * Math.pow((z - 6) / 6, 2) : 0),
        z + 0.55,
      );
      if (c.y < -0.9) continue;
      // blocks under the wheelhouse / deckhouse become walls
      const zc = z + 0.55,
        house = (zc > -4.5 && zc < 0.5) || (zc > WZ0 && zc < WZ1);
      b.col(c.x - 0.55, c.y - 1.2, c.z - w / 2, c.x + 0.55, c.y, c.z + w / 2, {
        tag: "deck",
        surface: "metal",
      });
      if (house)
        b.col(
          c.x - 0.56,
          c.y,
          c.z - (zc < WZ0 ? 1.8 : 2.1),
          c.x + 0.56,
          c.y + 2.6,
          c.z + (zc < WZ0 ? 1.8 : 2.1),
          { tag: "ship", surface: "metal", walkable: false },
        );
      PA.boatDeck.push(c);
    }
    // gangplank from the pier's north edge onto the boat, starboard side amidships-forward
    const gp0 = new THREE.Vector3(-230.6, PA.PY, PA.DZ0 + 0.2),
      gp1 = toWorld(-(hb - 0.6), DK, 1.6);
    b.beam(
      "wood_rotten",
      gp0.x,
      gp0.y + 0.05,
      gp0.z,
      gp1.x,
      gp1.y + 0.05,
      gp1.z,
      0.9,
      0.08,
      { tint: [0.6, 0.52, 0.42] },
    );
    for (const e of [-0.45, 0.45])
      b.pipe(
        "rope",
        gp0.x + e,
        gp0.y + 0.9,
        gp0.z,
        gp1.x + e,
        gp1.y + 0.9,
        gp1.z,
        0.02,
        4,
      );
    const n = 5;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n,
        x = gp0.x + (gp1.x - gp0.x) * t,
        y = gp0.y + (gp1.y - gp0.y) * t,
        z = gp0.z + (gp1.z - gp0.z) * t;
      b.col(x - 0.5, y - 0.3, z - 0.45, x + 0.5, y + 0.02, z + 0.45, {
        tag: "deck",
        surface: "wood",
      });
    }
    // hull side (non-walkable) so swimmers bump into it rather than into air
    b.col(
      B.x - L / 2 + 1,
      -4,
      B.z - hb + 0.4,
      B.x + L / 2 - 1.5,
      -0.9,
      B.z + hb - 0.4,
      { tag: "ship", surface: "metal", walkable: false },
    );
    // anchors for gameplay: engine hatch (quest), wheelhouse locker, captain
    ctx.anchors.hatch = toWorld(0.7, DK + 0.4, 1.9);
    ctx.anchors.locker = toWorld(-2.4, DK, 2.75);
    ctx.anchors.boat = toWorld(0, DK, 0);
    ctx.anchors.ambush1 = new THREE.Vector3(B.x - 13, -1.4, B.z - 3.5);
    ctx.anchors.ambush2 = new THREE.Vector3(B.x - 9, -1.4, B.z - 6.5);
    // the hatch itself (lifted cover) drawn in world coords on the main builder
    const hc = ctx.anchors.hatch;
    b.boxMM(
      "rust",
      hc.x - 0.6,
      hc.y - 0.42,
      hc.z - 0.5,
      hc.x + 0.6,
      hc.y - 0.3,
      hc.z + 0.5,
      { tint: [0.55, 0.42, 0.34] },
    );
    b.boxMM(
      "paint_black",
      hc.x - 0.45,
      hc.y - 0.3,
      hc.z - 0.38,
      hc.x + 0.45,
      hc.y - 0.29,
      hc.z + 0.38,
      { tint: [0.02, 0.03, 0.03] },
    );
    b.quadN(
      "rust",
      [hc.x - 0.6, hc.y - 0.3, hc.z + 0.5],
      [hc.x + 0.6, hc.y - 0.3, hc.z + 0.5],
      [hc.x + 0.6, hc.y + 0.7, hc.z + 0.75],
      [hc.x - 0.6, hc.y + 0.7, hc.z + 0.75],
      [0, 0.25, -1],
      { tint: [0.5, 0.4, 0.32] },
    );
  }

  // ==================================================================
  // DATA
  // ==================================================================
  function data() {
    K.defineItem({
      id: "ph2_clock_key",
      type: "key",
      name: "Pier A Clock Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: "A heavy brass winding crank with a square socket, tagged MEMORIAL CLOCK — HARBOR MASTER ONLY. Wound once a week, every week, from 1919 to 1967.",
    });
    K.defineItem({
      id: "ph2_fdny_helmet",
      type: "misc",
      name: "Marine Company 1 Helmet",
      weight: 2,
      value: 90,
      tags: ["valuable", "unique"],
      desc: "A leather fire helmet with the brass front piece MARINE 1 — F.D.N.Y. The inside band has twelve names scratched into it, each one crossed out but the last.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph2_947",
        name: "Nine Forty-Seven",
        giver: "Harbor Master's log",
        location: "Pier A",
        desc: "The memorial clock on Pier A stopped at 9:47 on the morning of the Bombing. The harbor master's log says it was wound every Sunday for nearly fifty years before that, since the memorial was dedicated in 1919. Somebody should wind it again.",
        stages: [
          {
            id: "key",
            text: "Find the clock key (the harbor master kept it) — or force the mechanism.",
            markers: [
              () => {
                const a = PV.anchor("pier_a", "keysafe");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Harbor master's office",
                      interior: "pier_a",
                    }
                  : null;
              },
            ],
          },
          {
            id: "wind",
            text: "Wind the clock in the Pier A tower.",
            markers: [
              () => {
                const a = PV.anchor("pier_a", "crank");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Clock mechanism",
                      interior: "pier_a",
                    }
                  : null;
              },
            ],
          },
        ],
        rewards: { xp: 150 },
      });
    }
    // Stage sync: picking up the clock key (safe, or the harbor master's body in the boathouse slip) moves the quest
    // to 'wind' — starting it if the player found the key before reading the log.
    const keySync = () =>
      K.safe("947 sync", () => {
        if (!K.has("ph2_clock_key") || PV.flag("pa_clock_wound")) return;
        const q = K.q;
        if (!q.started("ph2_947")) {
          if (!G.isStub("quests")) G.quests.start("ph2_947", { stage: "wind" });
          return;
        }
        if (q.active("ph2_947") && q.stage("ph2_947") === "key")
          q.set("ph2_947", "wind");
      });
    G.events.on("itemAdded", (id) => {
      if (id === "ph2_clock_key") keySync();
    });
    G.events.on("questStarted", (v) => {
      if (v && v.id === "ph2_947") setTimeout(keySync, 0);
    });
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors,
      S = PV;
    // shellbacks basking on the west apron (outside the interior population)
    [
      ["ph2_pa_lurk1", -250.5, 890.5],
      ["ph2_pa_lurk2", -243, 903.2],
    ].forEach(([id, x, z], i) => {
      if (S.flag("pa_dead_" + id)) return;
      PV.spawnActor(ctx, {
        id,
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        level: 5 + i,
        pos: { x, y: PA.PY, z },
        yaw: i ? PI : 0,
        ai: "guard",
        home: { x, z, r: 6 },
        noRespawn: true,
        onDeath: () => S.setFlag("pa_dead_" + id, true),
      });
    });
    // the interior boss (Old Barnacle), if not already dead
    if (A.boss && !S.flag("pa_boss_dead")) {
      PV.spawnActor(ctx, {
        id: "ph2_pa_boss",
        type: "shellback",
        name: "Old Barnacle",
        faction: "creatures",
        level: 12,
        hp: 420,
        scale: 1.45,
        pos: { x: A.boss.x, y: A.boss.y, z: A.boss.z },
        yaw: -HP,
        ai: "guard",
        home: { x: A.boss.x, z: A.boss.z, r: 7 },
        noRespawn: true,
        inventory: [
          ["ph2_fdny_helmet", 1],
          ["shellback_meat", 3],
        ],
        onDeath: () => {
          S.setFlag("pa_boss_dead", true);
          K.xp(120, "Old Barnacle");
        },
      });
    }
  }
  function ambush(ctx) {
    if (PV.flag("pa_ambush")) return;
    PV.setFlag("pa_ambush", true);
    K.notify("Something heavy stirs in the water beside the fireboat...");
    [
      ["ph2_pa_amb1", "ambush1"],
      ["ph2_pa_amb2", "ambush2"],
    ].forEach(([id, an], i) => {
      const a = ctx.anchors[an];
      if (!a) return;
      const act = PV.spawnActor(ctx, {
        id,
        type: "shellback",
        name: i ? "Shellback" : "Shellback Hunter",
        faction: "creatures",
        level: 6 + i * 2,
        hp: i ? undefined : 150,
        scale: i ? 1 : 1.15,
        pos: { x: a.x, y: a.y, z: a.z },
        yaw: HP,
        ai: "guard",
        home: { x: a.x + 6, z: a.z + 4, r: 10 },
        noRespawn: true,
      });
      K.safe("aggro", () => {
        if (act && act.setHostile) act.setHostile(true);
      });
    });
    K.sfx("shellback_click", ctx.anchors.ambush1);
  }

  // ==================================================================
  // UPDATE: clock hands, the ambush trigger
  // ==================================================================
  let chk = 0;
  function update(dt, realDt, ctx) {
    if (PV.flag("pa_clock_wound") && G.time && PA.handMeshes)
      PA.setHands(G.time.hour || 0);
    chk -= realDt;
    if (chk > 0) return;
    chk = 0.5;
    const p = G.player && G.player.pos;
    if (!p || p.x > G.LAYOUT.INTERIOR_X_MIN) return;
    const bt = ctx.anchors.boat;
    if (
      bt &&
      !PV.flag("pa_ambush") &&
      Math.hypot(p.x - bt.x, p.z - bt.z) < 9 &&
      p.y > -0.5
    )
      ambush(ctx);
  }

  PV.define({
    id: "pier_a",
    name: "Pier A",
    interior: "pier_a",
    order: 20,
    build(ctx) {
      exterior(ctx);
      if (PV.paInterior) PV.paInterior(ctx);
      const A = ctx.anchors;
      // engine hatch: the pump governor (quest item) — take it any time
      ctx.interactables.push(
        G.world.addInteractable({
          pos: A.hatch,
          radius: 1.0,
          label: "Fireboat Engine Hatch",
          verb: "Search",
          priority: 1,
          enabled: () => !PV.flag("pa_governor"),
          onInteract: () => {
            PV.setFlag("pa_governor", true);
            K.give("ph2_pump_governor", 1);
            K.notify(
              "You reach into the flooded engine room and unbolt the pump governor.",
            );
            K.sfx("pickup_metal", A.hatch);
            const q = K.q;
            if (q.active("ph2_slack_water")) q.set("ph2_slack_water", "return");
            K.xp(40, "Salvaged the pump governor");
            const c = PV.ctxs && PV.ctxs.find((x) => x.id === "pier_a");
            if (c) ambush(c);
          },
        }),
      );
      K.loot(ctx, "locker", A.locker.x, A.locker.y, A.locker.z, HP, {
        world: true,
        loot: "locker",
        name: "FDNY Gear Locker",
      });
      K.loot(
        ctx,
        "skeleton",
        A.boat.x - 2,
        A.boat.y + 0.05,
        A.boat.z + 1.2,
        0.6,
        { world: true, pose: "lying", container: true, loot: "skeleton" },
      );
      K.loot(ctx, "first_aid", -214.2, PA.PF + 1.4, 890.2, 0, {
        world: true,
        loot: "first_aid",
      });
      K.loot(ctx, "barrel", -249, PA.PY, 885.6, 0, {
        world: true,
        container: false,
        radioactive: false,
        tipped: true,
      });
      K.note(
        ctx,
        "ph2_note_pa_duggan",
        A.boat.x + 1.2,
        A.boat.y + 0.1,
        A.boat.z + 2.6,
        {
          type: "note",
          name: "Waterlogged Logbook Page",
          title: "F/B Patrick Duggan — deck log",
          text: 'Mar 5. 0931. Recall from Governors Island drill, all hands.\n0940. Radio says air raid. Capt. says "drill."\n0946. Capt. says it is not a drill.\n0947. —\n\n[The rest of the page is ink and salt.]\n\n[On the back, in pencil:] Engine room flooding. Pumps holding. Got the governor rebuilt last week, God bless Worthington. If anybody finds this — she can still pump. She could put out the whole city if anyone was left to ask.',
        },
        { world: true },
      );
    },
    data,
    spawn,
    update,
  });
})();
