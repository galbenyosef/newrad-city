// play-inline-372 04 — grime
// Lines 1165-1297 of readable/play-inline-372.pretty.js (statement-aligned).
  function buildForecourt(S, soot) {
    const b = S.b;
    const gy = (x, z) => {
      const h = P.safe("gy", () => G.world.groundHeight(x, z, 3));
      return typeof h === "number" && h > -0.5 && h < 0.5 ? h : 0.12;
    };
    // betting window shack (west end, by 6th Ave)
    const x0 = 51.8,
      x1 = 55.0,
      z0 = -243.6,
      z1 = -241.0,
      y = gy(53.4, -242.3);
    b.box("wood_rotten", x0, y, z0, x1, y + 2.4, z0 + 0.08, {
      seg: false,
      grime: 0.8,
    });
    b.box("wood_rotten", x0, y, z0, x0 + 0.08, y + 2.4, z1, {
      seg: false,
      grime: 0.8,
    });
    b.box("wood_rotten", x1 - 0.08, y, z0, x1, y + 2.4, z1, {
      seg: false,
      grime: 0.8,
    });
    b.box("wood_rotten", x0, y, z1 - 0.08, x1, y + 1.05, z1, {
      seg: false,
      grime: 0.8,
    });
    b.box("wood_rotten", x0, y + 1.95, z1 - 0.08, x1, y + 2.4, z1, {
      seg: false,
      grime: 0.8,
    });
    b.box(
      "wood_dark",
      x0 - 0.05,
      y + 1.05,
      z1 - 0.1,
      x1 + 0.05,
      y + 1.12,
      z1 + 0.35,
      { seg: false },
    );
    for (let k = 0; k < 6; k++)
      b.rod(
        "iron",
        [x0 + 0.5 + k * 0.45, y + 1.12, z1 - 0.04],
        [x0 + 0.5 + k * 0.45, y + 1.95, z1 - 0.04],
        0.012,
        3,
      );
    b.box(
      "corrugated",
      x0 - 0.2,
      y + 2.4,
      z0 - 0.2,
      x1 + 0.2,
      y + 2.48,
      z1 + 0.9,
      { rx: -0.08, seg: false, grime: 0.85 },
    );
    const bw = P.texMat(
      "club52_betwin",
      P.signTex(
        "club52_betwin",
        ["BETTING WINDOW", "PAY THE KING"],
        "raider",
        512,
        160,
        { fg: "#e8d020" },
      ),
      { transparent: true },
    );
    b.quad(bw, (x0 + x1) / 2, y + 2.15, z1 + 0.02, 2.6, 0.5, { ry: 0 });
    for (let k = 0; k < 12; k++)
      b.cyl(
        "chrome",
        x0 + 0.6 + (k % 6) * 0.35,
        y + 1.12,
        z1 + 0.1 + Math.floor(k / 6) * 0.1,
        0.012,
        0.012,
        0.01,
        6,
        { noAO: true },
      );
    S.col(x0, y, z0, x1, y + 2.4, z1, { walkable: false });
    S.light((x0 + x1) / 2, y + 1.9, z1 + 0.6, 0xffb060, 5, 0.6);
    b.cyl("lamp_amber", (x0 + x1) / 2, y + 2.05, z1 + 0.5, 0.06, 0.08, 0.14, 6);
    S.glow((x0 + x1) / 2, y + 2.1, z1 + 0.5, 0xffa040, 0.45, {
      dayFactor: 0.1,
    });
    // sandbag chicane → the gate
    S.prop("sandbags", 57.0, gy(57, -241.2), -241.2, 0.35, {});
    S.prop("sandbags", 61.8, gy(61.8, -242.8), -242.8, -0.3, {});
    S.prop("sandbags", 64.6, gy(64.6, -240.4), -240.4, 0.1, {});
    // a lawn jockey knocked off its post, face down
    P.jockey(b, 66.8, gy(66.8, -243.6) + 0.14, -243.6, 1.1, {
      silk: "silk_yellow",
      silk2: "silk_blue",
      s: 1.35,
      rz: HP * 0.97,
      grime: 0.8,
    });
    b.box(
      "brownstone",
      67.4,
      gy(67.4, -244.2),
      -244.5,
      67.9,
      gy(67.4, -244.2) + 0.5,
      -244.0,
      { seg: false, rz: 0.4, grime: 0.8 },
    );
    // the burnt-out car nosed into the kerb
    S.prop("car", 72.4, gy(72.4, -239.8), -239.8, 1.35, {});
    D.rubble(S, 74.8, gy(74.8, -241.5), -241.5, 1.0, { n: 8 });
    b.quad(soot, 72.4, gy(72.4, -239.8) + 0.02, -239.8, 5.0, 3.2, {
      rx: -HP,
      uvRect: [0.05, 0.02, 0.45, 0.3],
      noAO: true,
      grime: 0,
    });
    S.prop("barrel", 75.6, gy(75.6, -243.4), -243.4, 0, { burning: true });
    S.light(75.6, 1.6, -243.4, 0xff8a30, 7, 0.9);
  }

  P.addBuilder(
    "club_52",
    function () {
      P.finishSite("club_52", buildExterior());
    },
    10,
  );
