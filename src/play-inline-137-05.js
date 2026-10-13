// play-inline-137 05 — the
// Lines 983-1172 of readable/play-inline-137.pretty.js (statement-aligned).
  LB.addBuilder(
    "flatiron",
    function (LB, site, root) {
      const K = LB.kit,
        D = LB.dress;
      const b = LB.batch("flatiron");
      b.ground = 0;
      b.aoH = 3.5;
      const anchors = {};
      // footprint: rounded prow at the north, base on the south street
      const P = [
        [133.4, 93.0],
        [135.2, 93.7],
        [174, 149],
        [131, 149],
        [131, 95.3],
        [131.9, 93.8],
      ];
      const inner = K.offsetPoly(P, -0.7);
      const H_BASE = 4.6,
        H_RUST = 13.6,
        H_SHAFT = 51,
        H_TOP = 57;
      // 21st Street (z≈126…134) runs straight through the footprint in the layout, so the Trading Post is a covered
      // market street: big openings on the west (Fifth Ave / Broadway) and on the diagonal east face line it up.
      const doors = {
        1: [[38.9, 49.6, 3.8]],
        2: [[18, 22, 3.4]],
        3: [
          [14.4, 23.6, 3.8],
          [45, 49.5, 3.6],
        ],
      }; // edge index → gaps (t0,t1,h)
      for (let i = 0; i < inner.length; i++) {
        const p = P[i],
          q = P[(i + 1) % P.length];
        gappedWall(b, "limestone", p, q, 0, H_BASE, 0.7, doors[i] || [], {
          grime: 0.6,
        });
      }
      // exterior skin (rounded prow, storefronts, portals, framed windows, shaft grid, oriels, crown, cornice)
      flatironSkin(b, P, doors, { H_BASE, H_RUST, H_SHAFT, H_TOP });
      LB.fillPoly(P, 0, 0, 0, H_BASE, H_TOP + 3, 2.0, { walkable: false });
      LB.fillPoly(inner, 0, 0, 0, -0.5, 0.05, 2.5, { surface: "concrete" });
      // ---- roof: water tower + billboard + settlers' lookout
      const wtx = 152,
        wtz = 136,
        RY = H_TOP + 3.1; // roof deck = top of the attic storey
      for (const [dx, dz] of [
        [-1.6, -1.6],
        [1.6, -1.6],
        [-1.6, 1.6],
        [1.6, 1.6],
      ])
        b.box("iron", wtx + dx, RY, wtz + dz, 0.2, 4.2, 0.2, { seg: false });
      b.box("iron", wtx, RY + 3.0, wtz, 3.6, 0.15, 3.6, { seg: false });
      b.cyl("rotten", wtx, RY + 4.2, wtz, 2.1, 2.2, 4.6, 16, {
        hSeg: 3,
        grime: 0.5,
      });
      for (let y = RY + 4.6; y < RY + 8.6; y += 1.0)
        b.add("iron", new THREE.TorusGeometry(2.18, 0.04, 3, 18), {
          m: LB.m4(wtx, y, wtz, 0, Math.PI / 2),
        });
      b.cyl("rust", wtx, RY + 8.8, wtz, 0.05, 2.35, 1.6, 16, { hSeg: 1 });
      const bbx = 150,
        bbz = 124;
      for (const dx of [-5, 5])
        b.box("rust", bbx + dx, RY, bbz, 0.3, 9, 0.3, { seg: false });
      b.box("rust", bbx, RY + 3.2, bbz, 12.6, 5.6, 0.25, {
        seg: false,
        grime: 0.6,
      });
      b.quad(
        LB.brandMat("prairie_root_beer"),
        bbx,
        RY + 6.0,
        bbz - 0.14,
        12,
        5.2,
        { ry: Math.PI, grime: 0.3 },
      );
      b.frame(null);
      LB.sandbags(b, 132.4, 97, 134.8, 96, 2, { y: RY, noCollide: true });
      const flag = LB.makeFlag ? LB.makeFlag(LB.flagTex(1), 3, 1.7) : null;
      b.cyl("iron", 133.8, RY, 97.6, 0.05, 0.07, 6, 6, { hSeg: 1 });
      if (flag) {
        flag.position.set(133.8, RY + 6, 97.6);
        flag.rotation.y = Math.PI / 2;
        root.add(flag);
      }
      // ---- entrance: neon sign, scrap barricade + gate, guard post (north door on Fifth Ave)
      const neonK = LB.texMat(
        "flatiron_neon",
        LB.signTex(
          "flatiron_neon",
          ["FLATIRON", "TRADING POST"],
          "neon",
          512,
          256,
          { fg: "#ff9a3a" },
        ),
        { emissive: 1.6, noShadow: true },
      );
      b.box("iron", 130.25, 5.05, 102, 0.3, 3.3, 7.2, { seg: false }); // sits on the ground-floor cornice (face x 130.14)
      b.quad(neonK, 130.07, 6.7, 102, 7, 3.3, {
        ry: -Math.PI / 2,
        grime: 0,
        noAO: true,
      });
      LB.glows.push({ pos: V(129.5, 6.7, 102), color: 0xff9040, size: 7 });
      const scripK = LB.texMat(
        "flatiron_scrip",
        LB.signTex(
          "flatiron_scrip",
          ["SCRIP ACCEPTED", "NO GUNS DRAWN"],
          "raider",
          512,
          192,
          { bg: "#50584a", fg: "#e8d8a0" },
        ),
      );
      b.quad(scripK, 130.28, 3.7, 111, 3.0, 1.1, { ry: -Math.PI / 2 });
      // settlers' forecourt barricade on the sidewalk (the Fifth Ave / Broadway roadway at x < 126 stays open)
      LB.scrapWall(b, 126.6, 96, 126.6, 100.5, 2.6, { seed: 21 });
      LB.scrapWall(b, 126.6, 108, 126.6, 113.6, 2.6, { seed: 22 });
      LB.scrapWall(b, 126.6, 113.6, 130.3, 113.6, 2.6, { seed: 23 });
      LB.scrapWall(b, 126.6, 96, 130.3, 94.8, 2.4, { seed: 24 });
      LB.sandbags(b, 127.6, 100.6, 127.6, 102.8, 3);
      LB.barrel(b, 128.2, 0, 107.5, { fire: true });
      anchors.guard1 = LB.anchor(127.9, 0, 104.4, Math.PI / 2);
      anchors.guard2 = LB.anchor(128.4, 0, 111.6, Math.PI / 2);
      anchors.entrance = LB.anchor(129.2, 0, 103.6, -Math.PI / 2);
      // market-street arch signs on both 21st Street openings
      const mkK = LB.texMat(
        "flatiron_market",
        LB.signTex(
          "flatiron_market",
          ["MARKET STREET", "CONVOYS WELCOME"],
          "enamel",
          512,
          160,
          { bg: "#3a2a1a", fg: "#f0c870" },
        ),
      );
      b.quad(mkK, 130.45, 2.9, 129.6, 3.6, 1.1, { ry: -Math.PI / 2 }); // hung under the portal's I-beam (2.35 m clear)
      {
        const t = 43.6,
          p = P[1],
          q = P[2],
          len = Math.hypot(q[0] - p[0], q[1] - p[1]),
          ux = (q[0] - p[0]) / len,
          uz = (q[1] - p[1]) / len;
        b.quad(
          mkK,
          p[0] + ux * t + uz * 0.45,
          2.9,
          p[1] + uz * t - ux * 0.45,
          3.6,
          1.1,
          { ry: Math.atan2(uz, -ux) },
        );
      }

      // INTERIOR: the Trading Post — the covered market lane on the ground floor (lit batch, stalls, bar, clinic,
      // workshop, merchant anchors) is built by 30_downtown_interior.js
      const ix = { root, anchors, P, inner, doors, H_BASE };
      LB.interiorPart("flatiron", "market", ix);
      anchors.rooftop = LB.anchor(152, RY, 128);
      const g = b.build(root);
      g.name = "flatiron";
      ix.g = g;
      LB.interiorPart("flatiron", "finish", ix); // market spawn anchors, the lit batch under the landmark, props at initDone
      LB.register("flatiron", g, anchors);
      b.box("bronze_patina", 130.3, 1.05, 107, 0.05, 0.62, 0.85, {
        seg: false,
        grime: 0.4,
      });
      LB.plaque(
        V(130.3, 1.4, 107),
        "Fuller Building Plaque",
        "\"Constructed 1902. Declared 'structurally optimistic' by the 1966 City Survey. The management is not responsible for drafts, falls, or triangular geometry.\"",
      );
    },
    30,
  );

  // =====================================================================
  // WOOLWORTH BUILDING — neo-gothic "Cathedral of Commerce"
  // =====================================================================
