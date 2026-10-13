// play-inline-445 04 — color
// Lines 772-1116 of readable/play-inline-445.pretty.js (statement-aligned).
  D("newsstand", (k, r, v) => {
    v = v % 2;
    const green = {
      color: pick(r, [0x3e6e4a, 0x44744e, 0x386646]),
      rust: 0.45,
      grime: 0.38,
    };
    const dark = { color: 0x1c1c1a, rust: 0.3 };
    const W = 3.0,
      Dp = 1.6,
      H = 2.45;
    // shell: back, sides, roof with overhang, base kick plate
    k.boxB("metal", W, H, 0.06, 0, 0, Dp / 2 - 0.03, green);
    for (const s of [-1, 1])
      k.boxB("metal", 0.06, H, Dp, s * (W / 2 - 0.03), 0, 0, green);
    k.boxB(
      "metal",
      W + 0.3,
      0.1,
      Dp + 0.45,
      0,
      H,
      -0.12,
      Object.assign({}, green, { color: 0x2e5038 }),
    );
    k.boxB("metal", W, 0.18, 0.06, 0, 0, -Dp / 2 + 0.03, dark);
    // sign band front + both sides
    k.quad("newsstand_sign", W + 0.2, 0.28, 0, H - 0.08, -Dp / 2 - 0.365, {
      ry: PI,
      mat: "trim",
    });
    k.boxB("metal", W + 0.3, 0.34, 0.04, 0, H - 0.25, -Dp / 2 - 0.34, {
      color: 0x2e5038,
      rust: 0.45,
    });
    // pasted-up posters on the back (the side facing the street traffic), a roof lip
    for (let i = 0; i < 2; i++)
      k.quad(
        pick(r, X.POSTERS || ["poster_fizzo"]),
        0.62,
        0.9,
        -0.75 + i * 1.3 + (r() - 0.5) * 0.2,
        1.35 + (r() - 0.5) * 0.15,
        Dp / 2 + 0.005,
        { rz: (r() - 0.5) * 0.1, grime: 0.35 },
      );
    k.box("metal", W + 0.34, 0.05, 0.06, 0, H + 0.12, -Dp / 2 - 0.36, {
      color: 0x1a2a20,
      rust: 0.6,
    });
    // corner angle posts, a riveted kick plate all round, a louvred vent on each side, roof-edge drip strip
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.box(
          "metal",
          0.07,
          H,
          0.07,
          sx * (W / 2 - 0.01),
          H / 2,
          sz * (Dp / 2 - 0.01),
          { color: 0x2a4a34, rust: 0.55, grime: 0.4 },
        );
    for (const sx of [-1, 1]) {
      k.box("metal", 0.02, 0.2, Dp - 0.1, sx * (W / 2 + 0.02), 0.12, 0, {
        color: 0x3a3a34,
        rust: 0.7,
      });
      for (let i = 0; i < 5; i++)
        k.box(
          "metal",
          0.03,
          0.02,
          0.36,
          sx * (W / 2 + 0.035),
          2.0 + i * 0.05,
          -0.45,
          { color: 0x1e2e22, rust: 0.4 },
        );
    }
    k.box("metal", W, 0.2, 0.02, 0, 0.12, Dp / 2 + 0.02, {
      color: 0x3a3a34,
      rust: 0.7,
    });
    for (let i = 0; i < 9; i++)
      k.sphere(
        "metal",
        0.012,
        -W / 2 + 0.15 + (i * (W - 0.3)) / 8,
        0.2,
        Dp / 2 + 0.035,
        { wseg: 4, hseg: 3, color: 0x5a5a50 },
      );
    k.box("metal", W + 0.34, 0.05, 0.05, 0, H + 0.02, Dp / 2 + 0.12, {
      color: 0x1a2a20,
      rust: 0.6,
    });
    // magazine racks on the sides (outside, the way they hung them)
    for (const s of [-1, 1]) {
      k.quad("mag_rack", 1.2, 0.75, s * (W / 2 + 0.035), 1.25, 0.05, {
        ry: (s * PI) / 2,
        mat: "trim",
        grime: 0.3,
      });
      for (let i = 0; i < 3; i++)
        k.box(
          "metal",
          0.04,
          0.02,
          1.25,
          s * (W / 2 + 0.07),
          0.95 + i * 0.25,
          0.05,
          dark,
        );
    }
    if (v === 0) {
      // shutter down and wired shut (a twist of wire through the hasp; nobody got in)
      k.quad("shutter", W - 0.14, 1.9, 0, 1.45, -Dp / 2 + 0.02, {
        ry: PI,
        mat: "trim",
        grime: 0.2,
      });
      k.boxB("metal", W - 0.1, 0.34, 0.06, 0, 0.12, -Dp / 2 + 0.03, green);
      k.box("metal", 0.08, 0.1, 0.04, 0.2, 0.55, -Dp / 2 - 0.03, {
        color: 0x8a7a3a,
        rust: 0.6,
      });
      k.torus("metal", 0.03, 0.006, 0.2, 0.6, -Dp / 2 - 0.02, {
        rseg: 3,
        tseg: 8,
        color: 0x8a8a80,
      });
      k.meta.container = {
        name: "Newsstand",
        loot: "props_newsstand_shut",
        defLoot: "newspaper_box",
      };
    } else {
      // serving counter + magazine shelves inside, the shutter jammed half-up
      k.boxB("metal", W - 0.12, 0.95, 0.4, 0, 0, -Dp / 2 + 0.24, green);
      k.boxB("wood", W - 0.1, 0.05, 0.5, 0, 0.95, -Dp / 2 + 0.22, {
        color: 0x5a4a38,
        grime: 0.5,
      });
      k.quad("shutter", W - 0.14, 0.4, 0, H - 0.4, -Dp / 2 + 0.02, {
        ry: PI,
        mat: "trim",
        grime: 0.2,
      });
      k.box("plain", W - 0.14, 1.0, 0.02, 0, 1.5, Dp / 2 - 0.08, {
        color: 0x151513,
        ao: [1, 1],
      }); // dark interior
      k.quad("mag_rack", W - 0.3, 0.9, 0, 1.55, Dp / 2 - 0.1, {
        ry: PI,
        mat: "trim",
        grime: 0.4,
      });
      // stacks of bundled newspapers, some spilled on the counter & pavement
      for (let i = 0; i < 4; i++)
        k.boxB(
          "fabric",
          0.42,
          0.18 + r() * 0.12,
          0.3,
          -1.0 + i * 0.62,
          1.0,
          -Dp / 2 + 0.24,
          {
            ry: (r() - 0.5) * 0.3,
            color: pick(r, [0xb8b098, 0xa8a088, 0xc4bca4]),
            grime: 0.6,
          },
        );
      for (let i = 0; i < 5; i++)
        k.box(
          "fabric",
          0.34,
          0.01,
          0.26,
          (r() - 0.5) * 2.4,
          0.012,
          -Dp / 2 - 0.4 - r() * 0.7,
          { ry: r() * 6, color: 0xb0a890, grime: 0.6 },
        );
      k.meta.container = {
        name: "Newsstand",
        loot: "props_newsstand",
        defLoot: "newspaper_box",
      };
    }
    k.meta.collider = { w: W, d: Dp, h: H };
    k.meta.interactY = 1.0;
    k.meta.surface = "metal";
    k.meta.tier = "large";
  });

  // ------------------------------------------------------------------
  // FDNY FIRE-ALARM CALL BOX: fluted red post, box head, globe lamp.
  // ------------------------------------------------------------------
  D("call_box", (k, r, v) => {
    const red = { color: C.hydrantRed, rust: 0.5 + r() * 0.2, grime: 0.35 };
    const B = new X.Kit(61);
    B.cyl(
      "metal",
      0.16,
      0.2,
      0.12,
      0,
      0.06,
      0,
      Object.assign({ seg: 10 }, red),
    );
    B.cyl(
      "metal",
      0.07,
      0.09,
      1.05,
      0,
      0.63,
      0,
      Object.assign({ seg: 8 }, red),
    );
    for (let i = 0; i < 3; i++)
      B.torus("metal", 0.085, 0.015, 0, 0.3 + i * 0.32, 0, {
        rx: PI / 2,
        rseg: 4,
        tseg: 10,
        color: C.hydrantRed,
        rust: 0.6,
      });
    B.cbox(
      "metal",
      0.3,
      0.42,
      0.22,
      0,
      1.36,
      0,
      Object.assign({ bevel: 0.03 }, red),
    );
    B.quad("fire_alarm", 0.2, 0.3, 0, 1.36, -0.115, { ry: PI, grime: 0.25 });
    B.cyl(
      "metal",
      0.14,
      0.12,
      0.06,
      0,
      1.6,
      0,
      Object.assign({ seg: 10 }, red),
    );
    B.sphere("glass", 0.12, 0, 1.72, 0, {
      wseg: 10,
      hseg: 7,
      color: v === 1 ? 0x6a2a20 : 0xb04030,
    });
    B.cyl("metal", 0.03, 0.05, 0.08, 0, 1.86, 0, { seg: 8, color: 0x2a1a14 });
    if (v === 1) {
      k.include(B, { y: 0.12, z: 0.95, rx: -PI / 2 + 0.06 });
      k.box("concrete", 0.3, 0.06, 0.3, 0, 0.03, 0.95, {
        color: 0x6a6a64,
        rx: 0.2,
      }); // torn-up footing
      k.meta.collider = { w: 0.4, d: 1.9, h: 0.35, cz: 0 };
    } else {
      k.include(B, {});
      k.meta.collider = { w: 0.35, d: 0.35, h: 1.9 };
    }
    k.meta.surface = "metal";
    k.meta.tier = "small";
  });

  // ------------------------------------------------------------------
  // BODY BAGS & the ARMY TRIAGE TENT they came out of.
  // ------------------------------------------------------------------
  function bodyBag(k, r, x, y, z, ry, open) {
    const col = pick(r, [0x3e4230, 0x353a2a, 0x2a2a26]);
    const b = { color: col, grime: 0.5, ao: [0.7, 0.3] };
    k.cbox(
      "fabric",
      0.55,
      0.2,
      1.8,
      x,
      y + 0.1,
      z,
      Object.assign({ ry, bevel: 0.09 }, b),
    );
    const c = Math.cos(ry),
      s = Math.sin(ry);
    // head bump + zipper line + toe tag
    k.sphere(
      "fabric",
      0.17,
      x - s * 0.72,
      y + 0.14,
      z - c * 0.72,
      Object.assign({ wseg: 7, hseg: 5, s: [1.1, 0.7, 1] }, b),
    );
    k.box(
      "metal",
      0.02,
      0.012,
      open ? 0.9 : 1.6,
      x + c * 0.08 + s * (open ? -0.35 : 0),
      y + 0.205,
      z - s * 0.08 + c * (open ? -0.35 : 0),
      { ry, color: 0x8a8a80 },
    );
    k.quad("toe_tag", 0.1, 0.05, x + s * 0.95, y + 0.1, z + c * 0.95, {
      ry: ry + PI / 2,
      rx: -0.4,
    });
    if (open) {
      // flap folded back: a skull and ribs show
      k.box(
        "fabric",
        0.3,
        0.02,
        0.8,
        x + c * 0.3 - s * 0.35,
        y + 0.13,
        z - s * 0.3 - c * 0.35,
        { ry, rz: 0.5, color: col, grime: 0.5 },
      );
      k.sphere("plain", 0.1, x - s * 0.62, y + 0.2, z - c * 0.62, {
        wseg: 8,
        hseg: 6,
        s: [1, 0.9, 1.15],
        color: C.bone,
      });
      for (let i = 0; i < 4; i++)
        k.torus(
          "plain",
          0.12,
          0.012,
          x - s * (0.35 - i * 0.08),
          y + 0.19,
          z - c * (0.35 - i * 0.08),
          { ry, arc: PI, rseg: 3, tseg: 8, color: C.bone },
        );
    }
  }
