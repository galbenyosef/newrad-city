// play-inline-445 05 — color
// Lines 1117-1318 of readable/play-inline-445.pretty.js (statement-aligned).
  D("body_bag", (k, r, v) => {
    v = v % 3;
    if (v === 2) {
      for (let i = 0; i < 3; i++)
        bodyBag(
          k,
          r,
          (i - 1) * 0.7,
          0,
          (r() - 0.5) * 0.25,
          (r() - 0.5) * 0.12,
          i === 1 && r() < 0.5,
        );
      k.meta.collider = { w: 2.1, d: 1.9, h: 0.25 };
    } else {
      bodyBag(k, r, 0, 0, 0, 0, v === 1);
      k.meta.collider = { w: 0.6, d: 1.9, h: 0.25 };
    }
    k.meta.surface = "fabric";
    k.meta.tier = "small";
  });

  function cot(k, r, x, z, ry, bag) {
    const S = new X.Kit(71);
    const fr = { color: 0x3e4430, rust: 0.5 };
    for (const s of [-1, 1])
      S.box("metal", 0.03, 0.03, 1.9, s * 0.33, 0.42, 0, fr);
    for (const e of [-0.9, 0.9])
      for (const s of [-1, 1])
        S.seg(
          "metal",
          [s * 0.33, 0.42, e],
          [s * 0.3, 0, e + (e > 0 ? -0.08 : 0.08)],
          0.015,
          fr,
        );
    S.box("fabric", 0.64, 0.02, 1.8, 0, 0.42, 0, {
      color: 0x6a6a4e,
      grime: 0.55,
    });
    if (bag) bodyBag(S, r, 0, 0.43, 0, 0, bag === 2);
    else
      S.box("fabric", 0.6, 0.06, 0.9, 0.02, 0.46, 0.35, {
        ry: 0.2,
        color: 0x5a4a3a,
        grime: 0.6,
      }); // a rumpled blanket
    k.include(S, { x, z, ry });
  }
  D("triage_tent", (k, r, v) => {
    const W = 4.2,
      L = 5.0,
      Hw = 1.55,
      Hr = 2.65;
    const can = {
      color: pick(r, [0x5a5c40, 0x55583c, 0x606246]),
      grime: 0.55,
      ao: [0.7, 1.4],
    };
    const pole = { color: 0x3a3a30, rust: 0.6 };
    // roof: two sloped planes from the eaves to the ridge
    const slope = Math.atan2(Hr - Hw, W / 2),
      rl = Math.hypot(Hr - Hw, W / 2);
    for (const s of [-1, 1]) {
      k.box(
        "fabric",
        rl + 0.12,
        0.03,
        L + 0.3,
        (s * W) / 4,
        (Hr + Hw) / 2,
        0,
        Object.assign({ rz: -s * slope }, can),
      );
      k.boxB("fabric", 0.03, Hw, L, (s * W) / 2, 0, 0, can);
      k.quad("red_cross", 0.9, 0.9, s * (W / 2 + 0.02), Hw * 0.55, 0.4, {
        ry: (s * PI) / 2,
        grime: 0.3,
        mat: "trim",
      });
    }
    // roof red crosses (flat on the slopes)
    for (const s of [-1, 1]) {
      const g = new X.Kit(73);
      g.quad("red_cross", 1.1, 1.1, 0, 0.02, 0, {
        rx: -PI / 2,
        mat: "trim",
        grime: 0.3,
      });
      k.include(g, {
        x: (s * W) / 4,
        y: (Hr + Hw) / 2,
        z: -0.6,
        rz: -s * slope,
      });
    }
    // back wall with gable, front gable; the front is open, flaps rolled up (one torn and hanging)
    k.boxB("fabric", W, Hw, 0.03, 0, 0, L / 2, can);
    for (const zz of [L / 2, -L / 2])
      k.extrude(
        "fabric",
        [
          [-W / 2, Hw],
          [W / 2, Hw],
          [0, Hr],
        ],
        0.03,
        Object.assign({ z: zz }, can),
      );
    k.quad("red_cross", 0.6, 0.6, 0, Hw + 0.4, -L / 2 - 0.02, {
      ry: PI,
      mat: "trim",
      grime: 0.3,
    });
    for (const s of [-1, 1])
      k.cyl(
        "fabric",
        0.1,
        0.1,
        1.2,
        s * (W / 2 - 0.65),
        Hw - 0.05,
        -L / 2 - 0.05,
        { rz: PI / 2, seg: 7, color: can.color, grime: 0.6 },
      );
    k.box("fabric", 0.9, 1.2, 0.02, W / 2 - 0.55, Hw - 0.6, -L / 2 - 0.08, {
      rz: 0.2,
      rx: 0.12,
      color: can.color,
      grime: 0.6,
    });
    // poles, ridge, guy ropes & stakes
    for (const zz of [-L / 2, 0, L / 2])
      k.seg("metal", [0, 0, zz], [0, Hr, zz], 0.035, pole);
    k.seg("metal", [0, Hr, -L / 2 - 0.1], [0, Hr, L / 2 + 0.1], 0.03, pole);
    // guy lines can't be staked into asphalt: short lines down to sandbag weights hugging the walls
    for (const s of [-1, 1])
      for (const zz of [-L / 2 + 0.3, 0, L / 2 - 0.3]) {
        k.seg(
          "fabric",
          [(s * W) / 2, Hw, zz],
          [s * (W / 2 + 0.42), 0.18, zz],
          0.008,
          { color: 0x8a7a5a },
        );
        k.sphere("fabric", 0.2, s * (W / 2 + 0.45), 0.09, zz, {
          s: [0.9, 0.5, 1.3],
          color: 0x8a7a58,
          wseg: 7,
          hseg: 4,
          grime: 0.45,
        });
      }
    // inside: three cots (two bagged), an IV stand, a medical footlocker, a bucket
    cot(k, r, -1.2, 0.6, 0.02, 1);
    cot(k, r, 0.25, 0.9, -0.05, v === 1 ? 2 : 1);
    cot(k, r, 1.45, 0.4, 0.08, 0);
    bodyBag(k, r, -1.1, 0, -1.6, PI / 2 + (r() - 0.5) * 0.2, false);
    k.seg("metal", [0.9, 0, -0.4], [0.9, 1.7, -0.4], 0.012, {
      color: 0x9a9a90,
    });
    k.seg("metal", [0.75, 1.65, -0.4], [1.05, 1.65, -0.4], 0.01, {
      color: 0x9a9a90,
    });
    k.cbox("glass", 0.1, 0.16, 0.04, 0.8, 1.52, -0.4, {
      color: 0x8a9a8a,
      bevel: 0.02,
    });
    for (let i = 0; i < 3; i++) {
      const a = (i * X.TAU) / 3;
      k.seg(
        "metal",
        [0.9, 0.05, -0.4],
        [0.9 + Math.cos(a) * 0.25, 0, -0.4 + Math.sin(a) * 0.25],
        0.01,
        { color: 0x9a9a90 },
      );
    }
    k.cyl("metal", 0.14, 0.11, 0.26, 1.6, 0.13, -1.5, {
      seg: 10,
      color: 0x6a6a60,
      rust: 0.7,
      open: false,
    });
    k.meta.colliders = [
      { w: 0.12, d: L, h: Hw, cx: -W / 2 },
      { w: 0.12, d: L, h: Hw, cx: W / 2 },
      { w: W, d: 0.12, h: Hw, cz: L / 2 },
      { w: 0.8, d: 1.9, h: 0.5, cx: -1.2, cz: 0.6 },
      { w: 0.8, d: 1.9, h: 0.5, cx: 0.25, cz: 0.9 },
      { w: 0.8, d: 1.9, h: 0.5, cx: 1.45, cz: 0.4 },
    ];
    k.meta.surface = "fabric";
    k.meta.tier = "large";
  });
  // ------------------------------------------------------------------
  // SIDEWALK SOUVENIR VENDOR: a folding table under a sun-rotted cloth,
  // little Unisphere globes and World's Fair medallion cards, green Statues
  // of Liberty, a board of knock-off watches, sunglasses on a spinner, a cardboard "$1" sign, a lawn
  // chair and the vendor's stock boxes. v1: table collapsed, stock spilled.
  // Front (-Z) = the customer side (the walkway).
  // ------------------------------------------------------------------
