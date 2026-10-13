// play-inline-255 04 — grime
// Lines 421-845 of readable/play-inline-255.pretty.js (statement-aligned).
  function market(b, bLit, bGlass, anchors) {
    const M = Q.mk,
      A = Q.arch;
    const zf = M.z1 - 0.7; // facade wall back face
    // core mass behind the peek bays
    b.boxMM("granite_block", M.x0, 0, M.z0, M.x1, M.top - 1.2, M.z1 - 3.2, {
      grime: 0.55,
      segLen: 4,
    });
    PF.colMM(M.x0, 0, M.z0, M.x1, M.top - 0.8, M.z1, { surface: "concrete" });
    // south facade: solid piers between the openings + arched spandrels above each opening
    const edges = [M.x0]
      .concat(...Q.bays.map((cx) => [cx - A.w / 2, cx + A.w / 2]))
      .concat([M.x1]);
    for (let i = 0; i < edges.length; i += 2)
      b.boxMM(
        "granite_block",
        edges[i],
        0,
        zf,
        edges[i + 1],
        M.top - 1.2,
        zf + 0.7,
        { grime: 0.55, segLen: 4 },
      );
    for (const cx of Q.bays) {
      const sp = new THREE.Shape(),
        R = A.w / 2;
      sp.moveTo(-R, A.spring);
      sp.absarc(0, A.spring, R, PI, 0, true);
      sp.lineTo(R, M.top - 1.2);
      sp.lineTo(-R, M.top - 1.2);
      sp.closePath();
      const sg = new THREE.ExtrudeGeometry(sp, {
        depth: 0.7,
        bevelEnabled: false,
        curveSegments: 16,
      });
      b.add("granite_block", sg, { m: PF.m4(cx, 0, zf), grime: 0.55 });
    }
    // rusticated base course & pilasters between the bays
    const piers = [
      M.x0,
      Q.bays[0] - A.w / 2,
      Q.bays[0] + A.w / 2,
      Q.bays[1] - A.w / 2,
      Q.bays[1] + A.w / 2,
      Q.bays[2] - A.w / 2,
      Q.bays[2] + A.w / 2,
      Q.bays[3] - A.w / 2,
      Q.bays[3] + A.w / 2,
      M.x1,
    ];
    for (let i = 0; i < piers.length; i += 2) {
      const a = piers[i],
        c = piers[i + 1],
        cx = (a + c) / 2,
        w = c - a;
      for (let y = 0; y < 2.6; y += 0.65)
        b.box("pier_stone", cx, y, M.z1 + 0.18, w + 0.1, 0.6, 0.45, {
          seg: false,
          grime: 0.6,
        });
      b.box(
        "granite_block",
        cx,
        2.6,
        M.z1 + 0.15,
        Math.max(1.4, w - 0.9),
        10.6,
        0.4,
        { seg: false, grime: 0.5 },
      );
      b.box(
        "granite_block",
        cx,
        13.1,
        M.z1 + 0.2,
        Math.max(1.8, w - 0.5),
        0.6,
        0.55,
        { seg: false, grime: 0.45 },
      ); // capital
    }
    // voussoirs + keystones around each arch
    for (const cx of Q.bays) {
      const R = A.w / 2,
        n = 13;
      for (let k = 0; k <= n; k++) {
        const a = (k / n) * PI,
          rr = R + 0.55;
        const px = cx + Math.cos(a) * rr,
          py = A.spring + Math.sin(a) * rr;
        const key = k === Math.round(n / 2);
        b.box(
          "arch_stone",
          px,
          py - (key ? 0.75 : 0.55),
          M.z1 + 0.12,
          key ? 1.0 : 0.62,
          key ? 1.5 : 1.1,
          key ? 0.6 : 0.4,
          { rz: a - HP, seg: false, grime: 0.45 },
        );
      }
      // impost blocks
      for (const sg of [-1, 1])
        b.box(
          "arch_stone",
          cx + sg * (R + 0.35),
          A.spring - 0.45,
          M.z1 + 0.1,
          1.1,
          0.45,
          0.5,
          { seg: false, grime: 0.45 },
        );
      // round medallion in the spandrel
      b.cyl(
        "arch_stone",
        cx + R + 1.55,
        12.35,
        M.z1 + 0.05,
        0.5,
        0.5,
        0.3,
        12,
        { rx: HP, hSeg: 1 },
      );
    }
    // cornice, dentils, balustraded parapet
    b.boxMM(
      "arch_stone",
      M.x0 - 0.3,
      13.7,
      M.z1 - 0.2,
      M.x1 + 0.3,
      14.3,
      M.z1 + 0.85,
      { grime: 0.5, seg: false },
    );
    for (let x = M.x0; x < M.x1; x += 0.7)
      b.box("arch_stone", x + 0.2, 13.45, M.z1 + 0.55, 0.3, 0.25, 0.3, {
        seg: false,
        grime: 0.4,
      });
    K.balustrade(
      b,
      "arch_stone",
      [
        [M.x0, M.z1 + 0.2],
        [M.x1, M.z1 + 0.2],
      ],
      14.3,
      1.05,
      {},
    );
    b.boxMM("granite_block", M.x0, 14.3, M.z0, M.x1, 15.2, M.z1 - 0.6, {
      grime: 0.6,
      seg: false,
    }); // roof deck under the bridge
    // engraved dedication stone
    const inscr = PF.texMat(
      "qb_inscr",
      PF.signTex(
        "qb_inscr",
        ["QUEENSBORO BRIDGE · MDCCCCIX"],
        "engraved",
        1024,
        96,
        { bg: "#b8b2a2" },
      ),
      { rough: 0.9 },
    );
    b.quad(inscr, (M.x0 + M.x1) / 2, 13.95, M.z1 + 0.87, 22, 0.5, {
      grime: 0.2,
    });

    // ---- the peek bays behind the arches: floor, tile back wall, Guastavino barrel vault, stalls (lit) ----
    const pz0 = M.z1 - 3.2,
      pz1 = zf;
    bLit.setLights(
      Q.bays
        .map((cx) => ({
          x: cx,
          y: 7.5,
          z: pz0 + 1.6,
          color: 0xffc070,
          r: 9,
          i: 1.1,
        }))
        .concat(
          Q.bays.map((cx) => ({
            x: cx,
            y: 1.8,
            z: pz0 + 1.2,
            color: 0xff9a40,
            r: 4,
            i: 0.8,
          })),
        ),
      0x2a2018,
      0.9,
    );
    bLit.boxMM("quarry", M.x0 + 0.5, 0, pz0, M.x1 - 0.5, 0.05, pz1, {
      grime: 0.5,
    });
    bLit.boxMM("guastavino", M.x0 + 0.5, 0, pz0 - 0.2, M.x1 - 0.5, 13.6, pz0, {
      grime: 0.35,
    });
    // barrel vault (half-cylinder along x) in tile
    const vg = new THREE.CylinderGeometry(
      1.7,
      1.7,
      M.x1 - M.x0 - 1,
      16,
      1,
      true,
      0,
      PI,
    );
    vg.rotateZ(HP);
    bLit.add("guastavino", vg, {
      m: PF.m4((M.x0 + M.x1) / 2, 11.6, pz0 + 1.6, 0, 0, 0, 1, 1.25, 1),
      grime: 0.3,
    });
    for (const cx of Q.bays) {
      // cross arches (ribs) at the bay divisions, stalls, crates, a hanging lamp
      D.stall(bLit, cx - 1.2, pz0 + 1.4, 0, 3.2, 1.8, {
        seed: cx | 0,
        goods: ["cans", "bottles", "junk", "meds"][Q.bays.indexOf(cx)],
        y: 0,
      });
      D.crates(bLit, cx + 2.2, 0, pz0 + 0.6, 2, cx | 0, false);
      bLit.cyl("iron", cx, 9.4, pz0 + 1.6, 0.01, 0.01, 3.4, 4, { hSeg: 1 });
      bLit.sphere("lamp_warm", cx, 9.3, pz0 + 1.6, 0.25, {
        ws: 8,
        hs: 6,
        noAO: true,
      });
      PF.glow(V3(cx, 9.3, pz0 + 1.6), 0xffc070, 2.2, null, {
        intensity: 1.0,
        dayFactor: 0.3,
      });
    }
    D.stringLights(
      bLit,
      V3(M.x0 + 1, 10.6, pz0 + 2.6),
      V3(M.x1 - 1, 10.6, pz0 + 2.6),
      1.2,
      30,
      0xffd090,
    );

    // ---- glazing: transparent arch panes with iron mullions; boarded lower lights; door bay storefront ----
    Q.bays.forEach((cx, i) => {
      const door = i === Q.doorBay;
      const gz = M.z1 - 0.35;
      const g = PF.shapeGeo(archShape(A.w - 0.1, A.spring), 16);
      bGlass.add("glass_tr", g, {
        m: PF.m4(cx, door ? 0 : 0, gz),
        uv: "keep",
        noAO: true,
        grime: 0,
      });
      // mullions
      for (let k = 1; k < 6; k++) {
        const mx = cx - A.w / 2 + (k * A.w) / 6;
        const yTop =
          A.spring +
          Math.sqrt(Math.max(0, (A.w / 2) ** 2 - (mx - cx) ** 2)) -
          0.05;
        b.box(
          "iron",
          mx,
          door ? 4 : 0,
          gz + 0.05,
          0.1,
          yTop - (door ? 4 : 0),
          0.12,
          { seg: false, grime: 0.3 },
        );
      }
      for (let y = door ? 5.2 : 1.4; y < A.spring + 2.5; y += 1.4) {
        const half =
          y <= A.spring
            ? A.w / 2
            : Math.sqrt(Math.max(0, (A.w / 2) ** 2 - (y - A.spring) ** 2));
        if (half > 0.3)
          b.box("iron", cx, y, gz + 0.05, half * 2 - 0.05, 0.1, 0.12, {
            seg: false,
          });
      }
      if (door) {
        // storefront: steel frame, double doors, transom sign
        b.boxMM("steel", cx - A.w / 2, 0, gz - 0.1, cx - 1.6, 4, gz + 0.25, {
          grime: 0.6,
          seg: false,
        });
        b.boxMM("steel", cx + 1.6, 0, gz - 0.1, cx + A.w / 2, 4, gz + 0.25, {
          grime: 0.6,
          seg: false,
        });
        b.boxMM(
          "steel",
          cx - A.w / 2,
          3.6,
          gz - 0.1,
          cx + A.w / 2,
          4.1,
          gz + 0.3,
          { grime: 0.6, seg: false },
        );
        for (const sg of [-1, 1]) {
          b.boxMM(
            "paint_teal",
            cx + (sg < 0 ? -1.55 : 0.03),
            0,
            gz + 0.02,
            cx + (sg < 0 ? -0.03 : 1.55),
            3.55,
            gz + 0.12,
            { grime: 0.7, seg: false },
          );
          b.quad("glass_broken", cx + sg * 0.8, 2.5, gz + 0.14, 0.9, 1.0, {
            noAO: true,
          });
          b.box("chrome", cx + sg * 0.2, 1.3, gz + 0.2, 0.06, 0.6, 0.06, {
            seg: false,
          });
        }
        const sk = PF.texMat(
          "qb_market_neon",
          PF.signTex("qb_market_neon", ["BRIDGEMARKET"], "neon", 1024, 192, {
            fg: "#ffb040",
          }),
          { emissive: 1.6, rough: 0.6, noShadow: true },
        );
        b.boxMM("iron", cx - 3.3, 4.2, gz + 0.2, cx + 3.3, 5.5, gz + 0.45, {
          seg: false,
        });
        b.quad(sk, cx, 4.85, gz + 0.47, 6.4, 1.2, { noAO: true });
        PF.glow(V3(cx, 4.85, gz + 0.9), 0xffa040, 4.5, null, {
          intensity: 1.2,
          dayFactor: 0.25,
          flicker: 0.05,
        });
        anchors.market_door = PF.anchor(cx, 0, M.z1 + 2.2, PI);
        // steps / threshold
        b.boxMM(
          "granite_block",
          cx - 2.2,
          0,
          M.z1,
          cx + 2.2,
          0.15,
          M.z1 + 1.2,
          { seg: false },
        );
      } else {
        // lower lights boarded with scrap; sandbags outside
        b.boxMM(
          "planks",
          cx - A.w / 2 + 0.1,
          0,
          gz + 0.15,
          cx + A.w / 2 - 0.1,
          2.6,
          gz + 0.25,
          { grime: 0.8, seg: false },
        );
        for (let k = 0; k < 4; k++)
          b.box(
            k % 2 ? "corrugated" : "rust",
            cx - 2.2 + k * 1.45,
            0.3,
            gz + 0.3,
            1.3,
            1.6 + (k % 3) * 0.3,
            0.06,
            { rz: (k - 1.5) * 0.05, seg: false, grime: 0.7 },
          );
        PF.sandbags(b, cx - 2.8, M.z1 + 0.9, cx + 2.8, M.z1 + 0.9, 3, {
          noCollide: false,
        });
      }
    });
    // west face: blind arch + mural
    b.boxMM("granite_block", M.x0 - 0.3, 0, M.z0 + 2, M.x0, 2.4, M.z1 - 1, {
      grime: 0.6,
      seg: false,
    });
    const wg = PF.texMat(
      "qb_west_mural",
      PF.signTex(
        "qb_west_mural",
        ["BRIDGEMARKET", "TRADE · WATER · DOCTOR", "ENTRANCE ON 59TH →"],
        "raider",
        1024,
        512,
        { bg: "#5a5448", fg: "#e8d8a0" },
      ),
      { rough: 0.9 },
    );
    b.quad(wg, M.x0 - 0.33, 6.8, (M.z0 + M.z1) / 2, 11, 5.4, {
      ry: -HP,
      grime: 0.3,
    });
    // deck abutment above the market's west end
    b.boxMM(
      "granite_block",
      M.x0,
      M.top - 1.2,
      -440.5,
      M.x0 + 4,
      Q.deck - 0.6,
      -424.2,
      { grime: 0.6 },
    );
    PF.colMM(M.x0, M.top - 1.2, -440.5, M.x0 + 4, Q.deck - 0.6, -424.2, {});
  }

  // =================================================================
  // Deck, ramp, stair tower, railings
  // =================================================================
