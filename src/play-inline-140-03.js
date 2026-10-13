// play-inline-140 03 — the
// Lines 25-509 of readable/play-inline-140.pretty.js (statement-aligned).
  LB.addBuilder(
    "met",
    function (LB, site, root) {
      const K = LB.kit;
      const b = LB.batch("met");
      b.ground = 0;
      b.aoH = 3;
      const anchors = {};
      const XF = 103.5; // central facade plane (east)
      const XW = 99; // wings facade plane
      const XB = 58; // back of building
      const PZ0 = -672,
        PZ1 = -638; // central pavilion
      const ZM = (PZ0 + PZ1) / 2; // -655
      const Z0 = site.z0 + 1,
        Z1 = site.z1 - 1;
      const POD = 2.4; // podium height (Great Hall floor)
      const t0 = LB.terrain(106, -655);
      b.ground = t0;
      // ---- podium + grand steps (8 × 0.3 m); they stop short of the park's perimeter wall (x≈109.3)
      b.boxMM("limestone", XB, t0 - 1, Z0, XF + 0.5, t0 + POD, Z1, {
        grime: 0.6,
      });
      LB.colMM(XB, t0 - 1, Z0, XF + 0.5, t0 + POD, Z1);
      for (let i = 0; i < 8; i++) {
        const x1 = XF + 0.5 + (8 - i) * 0.6;
        b.boxMM(
          "limestone",
          XF + 0.4,
          t0 - 0.5,
          PZ0 - 10 + i * 0.4,
          x1,
          t0 + 0.3 * (i + 1),
          PZ1 + 10 - i * 0.4,
          { seg: false, grime: 0.55 },
        );
        LB.colMM(
          XF + 0.4,
          t0 - 0.5,
          PZ0 - 10 + i * 0.4,
          x1,
          t0 + 0.3 * (i + 1),
          PZ1 + 10 - i * 0.4,
        );
      }
      // fountain basins flanking the steps (dry, scummy)
      for (const zc of [PZ0 - 17, PZ1 + 17]) {
        b.boxMM("limestone", XF - 2, t0, zc - 5, XF + 5, t0 + 0.7, zc + 5, {
          seg: false,
        });
        b.boxMM(
          "goo",
          XF - 1.5,
          t0 + 0.2,
          zc - 4.5,
          XF + 4.5,
          t0 + 0.6,
          zc + 4.5,
          { seg: false, noAO: true },
        );
        LB.colMM(XF - 2, t0, zc - 5, XF + 5, t0 + 0.7, zc + 5);
      }
      // gate piers + lanterns framing the park-wall opening onto Fifth Avenue (z −640…−630)
      for (const zz of [-640.6, -629.4]) {
        b.box("limestone", 108.7, t0, zz, 0.9, 2.3, 0.9, {
          seg: false,
          grime: 0.5,
        });
        b.box("limestone", 108.7, t0 + 2.3, zz, 1.1, 0.25, 1.1, { seg: false });
        b.sphere("lamp", 108.7, t0 + 2.85, zz, 0.28, {
          ws: 10,
          hs: 8,
          noAO: true,
          grime: 0,
        });
        LB.glows.push({
          pos: V(108.7, t0 + 2.85, zz),
          color: 0xffd9a0,
          size: 2.0,
        });
        LB.col(108.7, zz, 0.9, 0.9, t0, t0 + 2.6, 0, { walkable: false });
      }
      const gateK = LB.texMat(
        "met_gate",
        LB.signTex(
          "met_gate",
          ["MUSEUM ENTRANCE", "ADMISSION BY DONATION"],
          "enamel",
          512,
          160,
          { bg: "#1f2a3a", fg: "#e8dcbc" },
        ),
      );
      b.box("iron", 108.6, t0, -642.6, 0.08, 2.0, 0.08, { seg: false });
      b.quad(gateK, 108.66, t0 + 1.7, -642.6, 1.5, 0.47, { ry: Math.PI / 2 });
      const FY = t0 + POD;
      // ---- wings (solid): pilasters, arched windows, balustraded cornice
      const wingH = 16;
      const DX1 = 76; // the north wing's west end is the north (Dendur) glass hall — see 55_met_park.js
      for (const [za, zb] of [
        [Z0, PZ0],
        [PZ1, Z1],
      ]) {
        const xw0 = za === Z0 ? DX1 : XB;
        b.boxMM("met_ashlar", xw0, FY, za, XW, FY + wingH, zb, {
          grime: 0.5,
          segLen: 4,
        });
        LB.colMM(xw0, FY, za, XW, FY + wingH, zb, { walkable: false });
        const n = Math.floor((zb - za) / 5.5);
        for (let k = 0; k < n; k++) {
          const z = za + ((k + 0.5) * (zb - za)) / n;
          b.quad(
            k % 3 === 2 ? "glass_broken" : "glass_dark",
            XW + 0.03,
            FY + 6.5,
            z,
            2.2,
            7.5,
            { ry: Math.PI / 2, uv: "box", noAO: true },
          );
          b.add(
            "limestone",
            new THREE.RingGeometry(1.1, 1.6, 10, 1, 0, Math.PI),
            { m: LB.m4(XW + 0.05, FY + 10.25, z, Math.PI / 2), grime: 0.3 },
          );
          b.box(
            "limestone",
            XW + 0.25,
            FY,
            z - (zb - za) / n / 2,
            0.5,
            wingH - 1.2,
            1.0,
            { seg: false, grime: 0.4 },
          );
          for (const dy of [4.3, 6.5, 8.7])
            b.box("iron", XW + 0.07, FY + dy, z, 0.06, 0.08, 2.2, {
              seg: false,
              grime: 0.2,
            });
          b.box("iron", XW + 0.07, FY + 2.75, z, 0.06, 7.5, 0.08, {
            seg: false,
            grime: 0.2,
          });
          b.box("limestone", XW + 0.15, FY + 2.55, z, 0.3, 0.2, 2.8, {
            seg: false,
          });
        }
        b.boxMM(
          "limestone",
          XW - 0.2,
          FY + wingH - 1.2,
          za,
          XW + 0.6,
          FY + wingH,
          zb,
          { seg: false },
        );
        K.balustrade(
          b,
          "limestone",
          [
            [XW + 0.3, za],
            [XW + 0.3, zb],
          ],
          FY + wingH,
          1.0,
          {},
        );
      }
      // ---- central pavilion shell (hall walls rise to the roof; the roof is a thin slab so the domes fit beneath)
      const CH = 24,
        CEIL = FY + 19.5;
      K.room(
        b,
        "limestone",
        80,
        PZ0,
        XF,
        PZ1,
        FY,
        FY + CH,
        1.2,
        [{ side: "e", c: ZM, w: 4.5, h: 6.5 }],
        { grime: 0.45 },
      );
      b.boxMM("limestone", 80, FY + CH - 0.6, PZ0, XF, FY + CH, PZ1, {
        grime: 0.4,
      });
      LB.colMM(80, CEIL, PZ0, XF, FY + CH, PZ1, { walkable: false });
      // (the rear of the central pavilion, x 56…80, is the unfinished centre pavilion + the 1880 brick block: LB.metParkSide)
      // three great arched openings on the facade (glazed, the centre one is the entrance)
      const arches = [PZ0 + 6, ZM, PZ1 - 6];
      arches.forEach((z, i) => {
        b.quad(
          i === 1 ? "glass_broken" : "glass_dark",
          XF + 0.04,
          FY + 7.5 + (i === 1 ? 1.5 : 0),
          z,
          5.2,
          i === 1 ? 5.5 : 9,
          { ry: Math.PI / 2, uv: "box", noAO: true },
        );
        b.add(
          i === 1 ? "glass_broken" : "glass_dark",
          new THREE.CircleGeometry(2.6, 14, 0, Math.PI),
          {
            m: LB.m4(XF + 0.04, FY + 12, z, Math.PI / 2),
            uv: "box",
            noAO: true,
            grime: 0.1,
          },
        );
        for (let m = 1; m < 5; m++)
          b.box("iron", XF + 0.08, FY + 3 + m * 1.8, z, 0.08, 0.08, 5.2, {
            seg: false,
          });
        for (const dz of [-1.3, 0, 1.3])
          b.box(
            "iron",
            XF + 0.08,
            FY + (i === 1 ? 6.5 : 3),
            z + dz,
            0.08,
            i === 1 ? 5.5 + 2.4 : 9 + 2.4 - Math.abs(dz) * 0.6,
            0.08,
            { seg: false },
          );
        // archivolt on the thickened front (the reveal is 1 m deep), keystone with a cartouche, impost blocks
        b.add(
          "limestone",
          new THREE.RingGeometry(2.6, 3.25, 16, 1, 0, Math.PI),
          { m: LB.m4(XF + 1.03, FY + 12, z, Math.PI / 2), grime: 0.3 },
        );
        b.box("limestone", XF + 1.15, FY + 14.25, z, 0.36, 1.3, 0.9, {
          seg: false,
          grime: 0.35,
        });
        for (const sd of [-1, 1])
          b.box(
            "limestone",
            XF + 1.1,
            FY + 11.6,
            z + sd * 2.95,
            0.24,
            0.42,
            0.9,
            { seg: false, grime: 0.35 },
          );
      });
      // the pavilion front is a deep screen: a 1 m thick masonry skin with the three great arched openings cut
      // through it, so the glazing and the doors sit back in real reveals (with soffits) between the column pairs
      {
        const sh = new THREE.Shape();
        const zA = PZ0 - 0.3,
          zB = PZ1 + 0.3,
          yT = FY + 18;
        sh.moveTo(-zB, FY);
        sh.lineTo(-zA, FY);
        sh.lineTo(-zA, yT);
        sh.lineTo(-zB, yT);
        sh.closePath();
        arches.forEach((z, i) => {
          const y0 = i === 1 ? FY : FY + 3,
            hp = new THREE.Path();
          hp.moveTo(-z - 2.6, y0);
          hp.lineTo(-z - 2.6, FY + 12);
          hp.absarc(-z, FY + 12, 2.6, Math.PI, 0, true);
          hp.lineTo(-z + 2.6, y0);
          hp.closePath();
          sh.holes.push(hp);
        });
        const skin = new THREE.ExtrudeGeometry(sh, {
          depth: 1.0,
          bevelEnabled: false,
          curveSegments: 12,
        });
        b.add("limestone", skin, {
          m: LB.m4(XF, 0, 0, Math.PI / 2),
          grime: 0.5,
        });
        // rustication joints across the lower screen, soot licking out of the centre arch
        for (let y = FY + 0.9; y < FY + 9; y += 0.9)
          for (const [za, zb] of [
            [PZ0 - 0.3, arches[0] - 2.6],
            [arches[0] + 2.6, ZM - 2.6],
            [ZM + 2.6, arches[2] - 2.6],
            [arches[2] + 2.6, PZ1 + 0.3],
          ])
            b.boxMM(
              "concrete_dark",
              XF + 1.0,
              y - 0.04,
              za,
              XF + 1.02,
              y + 0.04,
              zb,
              { seg: false, grime: 0.2 },
            );
        b.quad("concrete_dark", XF + 1.03, FY + 16.2, ZM, 4.6, 3.2, {
          ry: Math.PI / 2,
          grime: 0.9,
          noAO: false,
        });
        // colliders: the four piers and the sills under the side arches
        for (const [za, zb] of [
          [PZ0 - 0.3, arches[0] - 2.6],
          [arches[0] + 2.6, ZM - 2.6],
          [ZM + 2.6, arches[2] - 2.6],
          [arches[2] + 2.6, PZ1 + 0.3],
        ])
          LB.colMM(XF, FY, za, XF + 1.0, yT, zb, { walkable: false });
        for (const z of [arches[0], arches[2]])
          LB.colMM(XF, FY, z - 2.6, XF + 1.0, FY + 3, z + 2.6, {
            walkable: false,
          });
      }
      // paired Corinthian columns on pedestals + the famous never-carved sculpture blocks on top
      const pairs = [PZ0 + 1.5, PZ0 + 11.0, PZ1 - 11.0, PZ1 - 1.5];
      for (const pz of pairs)
        for (const dz of [-1.3, 1.3]) {
          b.box("limestone", XF + 1.4, t0, pz + dz, 2.0, POD + 2.0, 2.0, {
            seg: false,
          });
          K.column(b, "limestone", XF + 1.4, FY + 2.0, pz + dz, 16, 0.65, {
            collide: true,
          });
        }
      for (const pz of pairs) {
        b.boxMM(
          "limestone",
          XF + 0.2,
          FY + 18,
          pz - 2.6,
          XF + 2.6,
          FY + 19.3,
          pz + 2.6,
          { seg: false },
        );
        b.boxMM(
          "limestone",
          XF + 0.6,
          FY + 19.3,
          pz - 1.9,
          XF + 2.4,
          FY + 23.1,
          pz + 1.9,
          { seg: false, grime: 0.6 },
        );
      }
      b.boxMM("limestone", XF - 0.2, FY + 18, PZ0, XF + 1.0, FY + 19.3, PZ1, {
        seg: false,
      });
      b.boxMM(
        "limestone",
        XF - 0.3,
        FY + CH - 0.8,
        PZ0 - 0.3,
        XF + 1.2,
        FY + CH,
        PZ1 + 0.3,
        { seg: false },
      );
      const metK = LB.texMat(
        "met_name",
        LB.signTex(
          "met_name",
          ["THE METROPOLITAN MUSEUM OF ART"],
          "engraved",
          1024,
          80,
          { size: 50 },
        ),
      );
      b.quad(metK, XF + 1.05, FY + 18.65, ZM, 11, 0.9, { ry: Math.PI / 2 });
      // exhibit banners hanging between the column pairs
      const banners = [
        ["SPACE AGE", "THE ART OF", "TOMORROW", "#8e2b25", "#e8dcbc"],
        ["CIVIL DEFENSE", "PRESENTS:", "LONG WINTER", "#2a3a4a", "#f0a050"],
        ["ARMS OF THE", "ANCIENTS", "", "#2c5a4a", "#eadcbc"],
      ];
      const bannerKey = (bn, i) =>
        LB.texMat(
          "met_banner_" + i,
          LB.signTex("met_banner_" + i, bn.slice(0, 3), "banner", 256, 768, {
            bg: bn[3],
            fg: bn[4],
            size: 40,
            emblem: (ctx, w, h) => {
              ctx.strokeStyle = bn[4];
              ctx.lineWidth = 6;
              ctx.beginPath();
              ctx.arc(w / 2, h * 0.68, 60, 0, TAU);
              ctx.stroke();
              ctx.lineWidth = 4;
              for (let a = 0; a < 4; a++) {
                const an = (a * Math.PI) / 4;
                ctx.beginPath();
                ctx.moveTo(
                  w / 2 - Math.cos(an) * 48,
                  h * 0.68 - Math.sin(an) * 48,
                );
                ctx.lineTo(
                  w / 2 + Math.cos(an) * 48,
                  h * 0.68 + Math.sin(an) * 48,
                );
                ctx.stroke();
              }
            },
          }),
          { side: THREE.DoubleSide, noShadow: true },
        );
      banners.forEach((bn, i) => {
        b.quad(bannerKey(bn, i), XF + 2.0, FY + 13.2, arches[i], 3.2, 9.4, {
          ry: Math.PI / 2,
          grime: 0.05,
          noAO: true,
        });
        b.box("iron", XF + 2.0, FY + 17.9, arches[i], 0.1, 0.1, 3.6, {
          seg: false,
        });
      });

      // =================================================================
      // THE GREAT HALL (walk-in, baked lamp light, balcony, armoury, Long Winter exhibit, hall anchors):
      // 50_uptown_interior.js
      // =================================================================
      const ix = {
        root,
        anchors,
        XF,
        PZ0,
        PZ1,
        ZM,
        FY,
        CEIL,
        banners,
        bannerKey,
      };
      LB.interiorPart("met", "hall", ix);
      // anchors
      anchors.entrance = LB.anchor(XF + 5, t0 + 0.3, ZM, Math.PI / 2);
      anchors.steps = LB.anchor(XF + 2.5, t0 + 1.5, ZM + 6, Math.PI / 2);
      LB.interiorPart("met", "hallAnchors", ix);
      anchors.spawn3 = LB.anchor(106, t0, -690);
      anchors.spawn4 = LB.anchor(106, t0, -620);
      // Central Park side: north glass hall + Temple of Dendur (walk-in via a breach), the centre pavilion, classical wings
      // (overrides spawn3 → a Patrolman robot patrols the Dendur hall; adds dendur / dendur_breach / breach / dendur_loot)
      if (typeof LB.metParkSide === "function") {
        try {
          LB.metParkSide(b, root, {
            XB,
            XW,
            Z0,
            Z1,
            PZ0,
            PZ1,
            FY,
            t0,
            wingH,
            DX1,
            anchors,
          });
        } catch (e) {
          G.reportError("landmarks_b:met_park", e);
        }
      }
      const g = b.build(root);
      g.name = "met";
      ix.g = g;
      LB.interiorPart("met", "finish", ix); // hall anchors, the lit hall batch under the landmark, props at initDone
      LB.register("met", g, anchors);
      LB.plaque(
        V(XF + 3.5, t0 + 3.5, PZ0 - 5),
        "Museum Notice",
        '"The Metropolitan Museum of Art is CLOSED for the duration of the emergency. Collections have been secured by automated docents of the American Automaton Co. Please do not touch the exhibits. The exhibits may touch you."',
      );
    },
    50,
  );

  // =====================================================================
  // GUGGENHEIM
  // =====================================================================
