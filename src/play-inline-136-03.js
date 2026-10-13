// play-inline-136 03 — math
// Lines 23-1609 of readable/play-inline-136.pretty.js (statement-aligned).
  LB.addBuilder(
    "brooklyn_bridge",
    function (LB, site, root) {
      const ZC = (site.z0 + site.z1) / 2; // 640
      const D = site.deckY || 24; // deck height
      const Z0 = ZC - 12,
        Z1 = ZC + 12; // deck edges 628..652
      const XM0 = 142,
        XAM0 = 236,
        XAM1 = 262,
        XT1 = 300,
        XT2 = 440,
        XAB0 = 486,
        XAB1 = 512,
        XB1 = 598;
      const TW = 6; // tower half-thickness (x)
      const TZ0 = ZC - 14,
        TZ1 = ZC + 14; // tower width (z) 626..654
      const GAP0 = 356,
        GAP1 = 371,
        GAPZ = ZC + 1; // collapse zone: south of GAPZ missing
      const SADDLE = 77,
        SAG_MIN = D + 1.6;
      const CABLE_Z = [Z0 + 0.8, ZC - 2.6, ZC + 2.6, Z1 - 0.8];
      const b = LB.batch("brooklyn_bridge");
      b.ground = -1.2;
      b.aoH = 4;
      const anchors = {};
      const V = (x, y, z) => new THREE.Vector3(x, y, z);

      // ---------------- height profile of the walking surface ----------------
      function deckH(x) {
        if (x <= XM0) return 0;
        if (x < XAM0) return (D * (x - XM0)) / (XAM0 - XM0);
        if (x <= XAB1) return D;
        if (x < XB1) return (D * (XB1 - x)) / (XB1 - XAB1);
        return 0;
      }

      // ---------------- approach viaducts (masonry, extruded with arches) -----
      function viaduct(x0, x1, up, arches) {
        const sh = new THREE.Shape();
        const top0 = up ? 0 : D,
          top1 = up ? D : 0;
        sh.moveTo(x0, -0.6);
        sh.lineTo(x1, -0.6);
        sh.lineTo(x1, top1 - 0.35);
        sh.lineTo(x0, top0 - 0.35);
        sh.closePath();
        for (const a of arches) {
          const h = new THREE.Path();
          const rise = a.rise,
            spring = a.spring,
            half = (a.x1 - a.x0) / 2,
            cx = (a.x0 + a.x1) / 2;
          const R = (half * half + rise * rise) / (2 * rise); // segmental arch radius
          const cy = spring + rise - R;
          const ang = Math.asin(half / R);
          h.moveTo(a.x0, 0);
          h.lineTo(a.x1, 0);
          h.lineTo(a.x1, spring);
          h.absarc(cx, cy, R, Math.PI / 2 - ang, Math.PI / 2 + ang, false);
          h.lineTo(a.x0, 0);
          sh.holes.push(h);
        }
        const g = new THREE.ExtrudeGeometry(sh, {
          depth: Z1 - Z0 - 1.2,
          bevelEnabled: false,
          curveSegments: 10,
        });
        b.add("granite_block", g, {
          m: LB.m4(0, 0, Z0 + 0.6),
          grime: 0.85,
          aoH: 3,
          ground: 0,
        });
        // masonry rhythm on both long faces: a rusticated plinth, pilasters every 10 m, all in coursed granite
        const inArchX = (x, pad) =>
          arches.some((a) => x > a.x0 - pad && x < a.x1 + pad);
        for (const [zf, dz] of [
          [Z0 + 0.6, -1],
          [Z1 - 0.6, 1],
        ]) {
          let xs = x0;
          const plinthTo = (xe) => {
            if (xe - xs > 0.5)
              b.boxMM(
                "granite_dark",
                xs,
                -0.6,
                zf + (dz < 0 ? -0.14 : 0),
                xe,
                1.1,
                zf + (dz < 0 ? 0 : 0.14),
                { grime: 0.9, seg: false, c: 0xb0aca4 },
              );
          };
          for (const a of arches) {
            plinthTo(a.x0 - 0.9);
            xs = a.x1 + 0.9;
          }
          plinthTo(x1);
          for (let x = x0 + 5; x < x1 - 2; x += 10) {
            const top = deckH(x) - 1.15;
            if (top < 2.5 || inArchX(x, 2)) continue;
            b.boxMM(
              "granite_block",
              x - 0.6,
              -0.6,
              zf + (dz < 0 ? -0.3 : 0),
              x + 0.6,
              top,
              zf + (dz < 0 ? 0 : 0.3),
              { grime: 0.8, seg: false },
            );
            b.boxMM(
              "limestone",
              x - 0.75,
              top,
              zf + (dz < 0 ? -0.4 : 0),
              x + 0.75,
              top + 0.3,
              zf + (dz < 0 ? 0 : 0.4),
              { seg: false, grime: 0.5 },
            );
          }
        }
        // arch voussoir trim on both faces
        for (const a of arches) {
          const half = (a.x1 - a.x0) / 2,
            cx = (a.x0 + a.x1) / 2;
          const R = (half * half + a.rise * a.rise) / (2 * a.rise),
            cy = a.spring + a.rise - R,
            ang = Math.asin(half / R);
          for (let i = 0; i <= 12; i++) {
            const t = Math.PI / 2 - ang + (2 * ang * i) / 12;
            const px = cx + Math.cos(t) * (R + 0.4),
              py = cy + Math.sin(t) * (R + 0.4);
            for (const zz of [Z0 + 0.45, Z1 - 0.45])
              b.box("limestone", px, py - 0.45, zz, 0.9, 0.9, 0.35, {
                rz: t - Math.PI / 2,
                seg: false,
                grime: 0.4,
              });
          }
          for (const zz of [Z0 + 0.45, Z1 - 0.45])
            for (const xx of [a.x0 - 0.6, a.x1 + 0.6])
              b.box("limestone", xx, 0, zz, 1.2, a.spring, 0.35, {
                seg: false,
              });
        }
        // sloped paving + parapets
        const len = Math.hypot(x1 - x0, D),
          ang = Math.atan2(D, x1 - x0) * (up ? 1 : -1);
        const mid = (x0 + x1) / 2;
        b.add(
          "asphalt",
          new THREE.BoxGeometry(len, 0.35, Z1 - Z0 - 1.2, 10, 1, 2),
          {
            m: LB.m4(mid, D / 2 - 0.15, ZC, 0, 0, ang),
            grime: 0.6,
            noAO: true,
          },
        );
        for (const zz of [Z0 + 0.3, Z1 - 0.3]) {
          b.add(
            "granite_block",
            new THREE.BoxGeometry(len, 1.2, 0.6, 10, 1, 1),
            {
              m: LB.m4(mid, D / 2 + 0.55, zz, 0, 0, ang),
              grime: 0.6,
              noAO: true,
            },
          );
          b.add("limestone", new THREE.BoxGeometry(len, 0.15, 0.8, 10, 1, 1), {
            m: LB.m4(mid, D / 2 + 1.2, zz, 0, 0, ang),
            grime: 0.4,
            noAO: true,
          });
        }
        // cornice band under the parapet
        for (const zz of [Z0 + 0.1, Z1 - 0.1])
          b.add("limestone", new THREE.BoxGeometry(len, 0.4, 0.4, 10, 1, 1), {
            m: LB.m4(mid, D / 2 - 0.9, zz, 0, 0, ang),
            grime: 0.5,
            noAO: true,
          });
        // colliders: steps (solid unless over an arch) + parapets
        const n = Math.ceil(D / 0.3),
          run = (x1 - x0) / n;
        for (let i = 0; i < n; i++) {
          const xa = x0 + i * run,
            xb = xa + run,
            xc = (xa + xb) / 2;
          const top = Math.max(deckH(xa + 0.001), deckH(xb - 0.001));
          const inArch = arches.some((a) => xc > a.x0 - 0.5 && xc < a.x1 + 0.5);
          LB.col(
            xc,
            ZC,
            run + 0.04,
            Z1 - Z0,
            inArch ? top - 1.4 : -0.5,
            top,
            0,
            { surface: "concrete" },
          );
          if (i % 2 === 0)
            for (const zz of [Z0 + 0.3, Z1 - 0.3])
              LB.col(
                xc + run / 2,
                zz,
                run * 2 + 0.05,
                0.6,
                top - 0.3,
                top + 1.3,
                0,
                { walkable: false },
              );
        }
      }
      viaduct(XM0, XAM0, true, [{ x0: 189, x1: 211, spring: 5.5, rise: 3 }]);
      viaduct(XAB1, XB1, false, [{ x0: 546, x1: 562, spring: 4.5, rise: 2.5 }]);
      // street-level entry plazas (paving + lamp posts + signs)
      b.boxMM("sidewalk", XM0 - 8, 0, Z0 - 1, XM0 + 0.5, 0.12, Z1 + 1, {
        grime: 0.6,
      });
      b.boxMM("sidewalk", XB1 - 0.5, 0, Z0 - 1, XB1 + 6, 0.12, Z1 + 1, {
        grime: 0.6,
      });
      LB.lampPost(b, XM0 - 2, 0, Z0 - 0.5, false);
      LB.lampPost(b, XM0 - 2, 0, Z1 + 0.5, false);
      LB.lampPost(b, XB1 + 2, 0, Z0 - 0.5, false);
      LB.lampPost(b, XB1 + 2, 0, Z1 + 0.5, true);
      LB.billboard(
        b,
        "fizzo_blue",
        XB1 + 12,
        0,
        ZC + 22,
        -Math.PI / 2 - 0.4,
        14,
        6,
        6,
      );
      // ramp dressing: cast-iron lamp standards on the parapets, rubble, bones, an outer sandbag checkpoint, and
      // enamel direction signs at both feet so the approach reads from the street
      function dressRamp(x0, x1, seed) {
        const r = LB.rng(seed);
        for (let x = x0 + 9; x < x1 - 4; x += 15) {
          const y = deckH(x) + 1.27;
          for (const zz of [Z0 + 0.3, Z1 - 0.3])
            LB.lampPost(b, x, y, zz, r() < 0.2);
        }
        // cast-iron lattice fence on top of the parapets (the promenade's criss-cross railing), a few panels torn out
        const STEP = 2.4;
        for (const zz of [Z0 + 0.3, Z1 - 0.3])
          for (let x = x0 + 1; x < x1 - 1.2; x += STEP) {
            if (r() < 0.07) continue;
            const xa = x,
              xb = Math.min(x1 - 1, x + STEP),
              ya = deckH(xa) + 1.27,
              yb = deckH(xb) + 1.27;
            b.beam("iron", V(xa, ya, zz), V(xa, ya + 1.0, zz), 0.07, 0.07, {
              noAO: true,
              grime: 0.3,
            });
            b.beam(
              "iron",
              V(xa, ya + 1.0, zz),
              V(xb, yb + 1.0, zz),
              0.06,
              0.08,
              { noAO: true, grime: 0.3 },
            );
            b.beam(
              "iron",
              V(xa, ya + 0.05, zz),
              V(xb, yb + 0.95, zz),
              0.035,
              0.035,
              { noAO: true, grime: 0.2 },
            );
            b.beam(
              "iron",
              V(xa, ya + 0.95, zz),
              V(xb, yb + 0.05, zz),
              0.035,
              0.035,
              { noAO: true, grime: 0.2 },
            );
          }
        for (let i = 0; i < 9; i++) {
          const x = x0 + 6 + r() * (x1 - x0 - 12),
            z = ZC + (r() - 0.5) * (Z1 - Z0 - 4),
            y = deckH(x);
          if (r() < 0.3) LB.skeleton(b, x, y + 0.05, z, r() * 6);
          else
            b.rock("rubble", x, y - 0.1, z, 0.35 + r() * 0.45, {
              flat: 0.5,
              seed: i + seed,
            });
        }
      }
      dressRamp(XM0, XAM0, 71);
      dressRamp(XAB1, XB1, 72);
      {
        const xs = 226,
          y = deckH(xs);
        LB.sandbags(b, xs, Z0 + 1.2, xs, ZC - 3.2, 3, { y });
        LB.sandbags(b, xs, ZC + 3.2, xs, Z1 - 1.2, 3, { y });
        LB.barrel(b, xs + 1.5, deckH(xs + 1.5), ZC - 4.5, { fire: true });
      }
      const bbSign = (x, face, lines, key) => {
        const k = LB.texMat(
          key,
          LB.signTex(key, lines, "enamel", 768, 192, {
            bg: "#1d3b56",
            fg: "#ecdcb4",
          }),
        );
        for (const dz of [-2.6, 2.6])
          b.box("iron", x, 0.12, ZC + dz, 0.16, 4.4, 0.16, { seg: false });
        b.box("iron", x, 4.2, ZC, 0.12, 0.12, 5.6, { seg: false });
        b.quad(k, x + face * 0.09, 3.4, ZC, 5.2, 1.3, {
          ry: (face * Math.PI) / 2,
        });
        LB.col(x, ZC - 2.6, 0.3, 0.3, 0, 4.4, 0, { walkable: false });
        LB.col(x, ZC + 2.6, 0.3, 0.3, 0, 4.4, 0, { walkable: false });
      };
      bbSign(
        XM0 - 5.5,
        -1,
        ["BROOKLYN BRIDGE", "TOLL AHEAD — HAVE SCRIP READY"],
        "bb_sign_w",
      );
      bbSign(XB1 + 4.5, 1, ["BROOKLYN BRIDGE", "TO MANHATTAN"], "bb_sign_e");

      // ---------------- anchorages -----------------------------------------
      function anchorage(xa, xb, brand) {
        const TZ0 = xa < 300 ? Z0 + 0.5 : ZC - 14; // Manhattan side stays clear of Chambers Street's roadway
        b.boxMM("granite_block", xa, -0.5, TZ0, xb, D - 0.3, TZ1, {
          grime: 0.85,
          segLen: 4,
          ground: 0,
        });
        b.boxMM(
          "granite_dark",
          xa - 0.15,
          -0.5,
          TZ0 - 0.15,
          xb + 0.15,
          1.6,
          TZ1 + 0.15,
          { seg: false, grime: 0.9, c: 0xa8a49c },
        ); // plinth
        b.boxMM(
          "limestone",
          xa - 0.4,
          D - 2.2,
          TZ0 - 0.4,
          xb + 0.4,
          D - 1.4,
          TZ1 + 0.4,
          { seg: false, grime: 0.5 },
        );
        // arched blind recesses on the long faces
        // deep arched recesses with voussoirs, jambs & keystones on the long faces (the anchorage cellar openings)
        const archSh = new THREE.Shape();
        archSh.moveTo(-2.5, 0);
        archSh.lineTo(2.5, 0);
        archSh.lineTo(2.5, 9);
        archSh.absarc(0, 9, 2.5, 0, Math.PI, false);
        archSh.lineTo(-2.5, 0);
        for (const zz of [TZ0, TZ1])
          for (let k = 0; k < 3; k++) {
            const cx = xa + ((xb - xa) * (k + 0.5)) / 3,
              face = zz < ZC ? -1 : 1,
              ryF = face < 0 ? Math.PI : 0;
            const FM = LB.m4(cx, 2.2, zz + face * 0.03, ryF);
            b.add("granite_dark", new THREE.ShapeGeometry(archSh, 10), {
              m: FM,
              c: 0x55524e,
              grime: 0.9,
              noAO: true,
            });
            for (let i = 0; i <= 10; i++) {
              // voussoirs
              const t = (Math.PI * i) / 10;
              b.box(
                "limestone",
                Math.cos(t) * 2.95,
                9 + Math.sin(t) * 2.95 - 0.45,
                0.12,
                i === 5 ? 1.0 : 0.72,
                i === 5 ? 1.25 : 0.9,
                0.3,
                { m: FM, rz: t - Math.PI / 2, seg: false, grime: 0.55 },
              );
            }
            for (const jx of [-2.95, 2.95])
              b.box("limestone", jx, 0, 0.12, 0.8, 9, 0.28, {
                m: FM,
                seg: false,
                grime: 0.6,
              });
            b.box("limestone", 0, -0.3, 0.16, 6.9, 0.35, 0.38, {
              m: FM,
              seg: false,
              grime: 0.6,
            }); // sill
          }
        // string course & cornice banding along the long faces
        for (const zz of [TZ0, TZ1])
          for (const [yy, hh, dd] of [
            [15.4, 0.45, 0.3],
            [D - 5.2, 0.6, 0.45],
          ]) {
            const face = zz < ZC ? -1 : 1;
            b.boxMM(
              "limestone",
              xa - 0.2,
              yy,
              zz + (face < 0 ? -dd : 0),
              xb + 0.2,
              yy + hh,
              zz + (face < 0 ? 0 : dd),
              { seg: false, grime: 0.5 },
            );
          }
        // cable anchor housings on the deck (river end of the anchorage)
        const xr = xa < 300 ? xb : xa,
          dir = xa < 300 ? -1 : 1;
        for (const cz of CABLE_Z) {
          const x0 = Math.min(xr, xr + dir * 6),
            x1 = Math.max(xr, xr + dir * 6);
          b.boxMM("granite", x0, D, cz - 1.1, x1, D + 3.6, cz + 1.1, {
            grime: 0.6,
            ground: D,
            seg: false,
          });
          b.boxMM(
            "limestone",
            x0 - 0.2,
            D + 3.6,
            cz - 1.3,
            x1 + 0.2,
            D + 4.0,
            cz + 1.3,
            { seg: false },
          );
          LB.colMM(x0, D, cz - 1.1, x1, D + 4.0, cz + 1.1, { walkable: false });
        }
        // low parapets along the outer edges
        for (const zz of [TZ0 + 0.4, TZ1 - 0.4]) {
          b.boxMM("granite", xa, D, zz - 0.4, xb, D + 1.2, zz + 0.4, {
            seg: false,
            grime: 0.5,
          });
          LB.colMM(xa, D, zz - 0.4, xb, D + 1.3, zz + 0.4, { walkable: false });
        }
        LB.colMM(xa, -0.5, TZ0, xb, D, TZ1);
        // pay-off: brand billboard on struts above the anchorage, facing traffic
        if (brand) {
          const face = xa < 300 ? -1 : 1; // face away from the river
          const bx = face < 0 ? xa + 3 : xb - 3;
          // gantry over the roadway: posts at the parapets, advert panel above head height
          for (const zz of [TZ0 + 0.4, TZ1 - 0.4]) {
            b.box("rust", bx, D, zz, 0.45, 12, 0.45, { seg: false });
            LB.col(bx, zz, 0.5, 0.5, D, D + 12, 0, { walkable: false });
          }
          b.box("rust", bx, D + 11.6, ZC, 0.5, 0.4, TZ1 - TZ0, { seg: false });
          b.box("rust", bx, D + 5.2, ZC, 0.3, 6.3, 14.2, {
            seg: false,
            grime: 0.6,
          });
          for (let k = -2; k <= 2; k++)
            b.beam(
              "rust",
              V(bx, D + 5.2, ZC + k * 3.4),
              V(bx, D + 11.6, ZC + k * 3.4 + 1.5),
              0.12,
              0.12,
            );
          b.quad(
            LB.brandMat(brand),
            bx + face * 0.17,
            D + 8.35,
            ZC,
            13.6,
            6.0,
            { ry: (face * Math.PI) / 2, grime: 0.25 },
          );
        }
      }
      anchorage(XAM0, XAM1, "fizzo_cola");
      anchorage(XAB0, XAB1, "long_winter");

      // ---------------- towers ---------------------------------------------
      const ARCH_Z = [
        [ZC - 9, ZC - 1.6],
        [ZC + 1.6, ZC + 9],
      ]; // openings (z ranges) 631..638.4 & 641.6..649
      const SPRING = D + 20,
        TOPW = 74;
      function tower(X) {
        // caisson & base in the river
        b.boxMM(
          "granite_dark",
          X - TW - 2.5,
          -7,
          TZ0 - 2.5,
          X + TW + 2.5,
          1.2,
          TZ1 + 2.5,
          { grime: 0.9, ground: -1.2, aoH: 2.5 },
        );
        b.boxMM(
          "granite",
          X - TW - 1.2,
          1.2,
          TZ0 - 1.2,
          X + TW + 1.2,
          3.0,
          TZ1 + 1.2,
          { seg: false, grime: 0.6 },
        );
        // lower solid block up to the deck
        b.boxMM("limestone", X - TW, 3.0, TZ0, X + TW, D, TZ1, {
          grime: 0.6,
          ground: 1.2,
          aoH: 6,
          segLen: 4,
        });
        // middle section with two pointed arches (extruded shape in the z-y plane)
        const sh = new THREE.Shape();
        const u = (z) => -(z - ZC);
        sh.moveTo(u(TZ0), D);
        sh.lineTo(u(TZ0), TOPW);
        sh.lineTo(u(TZ1), TOPW);
        sh.lineTo(u(TZ1), D);
        sh.closePath();
        // shape is built in (u, y) with u = -(z - ZC)
        for (const [za, zb] of ARCH_Z) {
          const ua = Math.min(u(za), u(zb)),
            ub = Math.max(u(za), u(zb)),
            w = ub - ua;
          const h = new THREE.Path();
          h.moveTo(ua, D);
          h.lineTo(ub, D);
          h.lineTo(ub, SPRING);
          h.absarc(ua, SPRING, w, 0, Math.PI / 3, false);
          h.absarc(ub, SPRING, w, (Math.PI * 2) / 3, Math.PI, false);
          h.lineTo(ua, D);
          sh.holes.push(h);
        }
        const g = new THREE.ExtrudeGeometry(sh, {
          depth: TW * 2,
          bevelEnabled: false,
          curveSegments: 10,
        });
        const M = new THREE.Matrix4().set(
          0,
          0,
          1,
          X - TW,
          0,
          1,
          0,
          0,
          -1,
          0,
          0,
          ZC,
          0,
          0,
          0,
          1,
        );
        b.add("limestone", g, { m: M, grime: 0.55, aoH: 6, ground: D });
        // arch mouldings (voussoirs) on both river faces
        for (const [za, zb] of ARCH_Z) {
          const w = zb - za;
          for (const face of [-1, 1]) {
            const xf = X + face * (TW + 0.15);
            for (let i = 0; i <= 8; i++) {
              // left & right arcs
              const t1 = Math.PI - ((Math.PI / 3) * i) / 8;
              const pz1 = zb + Math.cos(t1) * (w + 0.5),
                py1 = SPRING + Math.sin(t1) * (w + 0.5);
              b.box("granite", xf, py1 - 0.5, pz1, 0.4, 1.0, 1.0, {
                rx: -(t1 - Math.PI / 2),
                seg: false,
                grime: 0.4,
              });
              const t2 = ((Math.PI / 3) * i) / 8;
              const pz2 = za + Math.cos(t2) * (w + 0.5),
                py2 = SPRING + Math.sin(t2) * (w + 0.5);
              b.box("granite", xf, py2 - 0.5, pz2, 0.4, 1.0, 1.0, {
                rx: -(t2 - Math.PI / 2),
                seg: false,
                grime: 0.4,
              });
            }
            for (const zz of [za - 0.6, zb + 0.6])
              b.box("granite", xf, D, zz, 0.4, SPRING - D, 1.2, {
                seg: false,
                grime: 0.4,
              });
          }
        }
        // vertical pilaster strips + string courses
        for (const face of [-1, 1]) {
          const xf = X + face * (TW + 0.2);
          for (const zz of [TZ0 + 0.6, ZC, TZ1 - 0.6])
            b.box(
              "limestone",
              xf,
              3,
              zz,
              0.45,
              TOPW - 3,
              zz === ZC ? 2.2 : 1.2,
              { grime: 0.5, segLen: 6 },
            );
          for (const yy of [D - 0.6, SPRING + 12.5])
            b.box("limestone", xf, yy, ZC, 0.5, 0.6, TZ1 - TZ0 + 0.6, {
              seg: false,
            });
          // blind gothic lancets above the arches
          for (const zz of [ZC - 5.3, ZC + 5.3]) {
            b.quad(
              "granite_dark",
              xf + face * 0.25,
              SPRING + 8.6,
              zz,
              1.6,
              3.6,
              { ry: (face * Math.PI) / 2, uv: "box", grime: 0.7 },
            );
          }
        }
        // cornice & crown (stepped, with the saddle housings)
        b.boxMM(
          "limestone",
          X - TW - 0.8,
          TOPW,
          TZ0 - 0.8,
          X + TW + 0.8,
          TOPW + 1.2,
          TZ1 + 0.8,
          { seg: false, grime: 0.4 },
        );
        b.boxMM(
          "limestone",
          X - TW - 0.3,
          TOPW + 1.2,
          TZ0 - 0.3,
          X + TW + 0.3,
          TOPW + 2.4,
          TZ1 + 0.3,
          { seg: false, grime: 0.4 },
        );
        for (const cz of CABLE_Z)
          b.boxMM(
            "granite_dark",
            X - 3,
            TOPW + 2.4,
            cz - 1.1,
            X + 3,
            SADDLE + 0.6,
            cz + 1.1,
            { seg: false, grime: 0.6 },
          );
        // raider crow's nest on the Manhattan tower top
        if (X === XT1) {
          LB.scrapWall(b, X - 5, TZ0 + 3, X + 5, TZ0 + 3, 1.8, {
            y: TOPW + 2.4,
            noCollide: true,
            seed: 3,
          });
          b.box("corrugated", X + 2, TOPW + 2.4, TZ0 + 6, 3, 2.6, 3, {
            seg: false,
            rz: 0.04,
          });
          b.cyl("iron", X - 4, TOPW + 2.4, TZ1 - 4, 0.05, 0.05, 6, 4, {
            hSeg: 1,
          });
        }
        // colliders
        LB.colMM(X - TW - 2.5, -7, TZ0 - 2.5, X + TW + 2.5, 3.0, TZ1 + 2.5);
        LB.colMM(X - TW, 3.0, TZ0, X + TW, D, TZ1);
        LB.colMM(X - TW, D, TZ0, X + TW, TOPW + 2.4, ARCH_Z[0][0], {
          walkable: false,
        });
        LB.colMM(X - TW, D, ARCH_Z[0][1], X + TW, TOPW + 2.4, ARCH_Z[1][0], {
          walkable: false,
        });
        LB.colMM(X - TW, D, ARCH_Z[1][1], X + TW, TOPW + 2.4, TZ1, {
          walkable: false,
        });
        LB.colMM(X - TW, SPRING + 3, TZ0, X + TW, TOPW + 2.4, TZ1, {
          walkable: false,
        });
      }
      tower(XT1);
      tower(XT2);

      // ---------------- deck: roadways, promenade, trusses -------------------
      const spans = [
        [XAM1, XT1 - TW],
        [XT1 + TW, XT2 - TW],
        [XT2 + TW, XAB0],
      ];
      const addDeckSeg = (xa, xb, zs, ze) => {
        if (xb - xa < 0.1) return;
        b.boxMM("asphalt", xa, D - 0.35, zs, xb, D, ze, {
          grime: 0.6,
          noAO: true,
          uvScale: 8,
        });
        LB.colMM(xa, D - 1.2, zs, xb, D, ze, { surface: "concrete" });
      };
      for (const [xa, xb] of spans) {
        const cuts =
          xa < GAP0 && xb > GAP1
            ? [
                [xa, GAP0],
                [GAP0, GAP1],
                [GAP1, xb],
              ]
            : [[xa, xb]];
        for (const [ca, cb] of cuts) {
          const broken = ca === GAP0;
          addDeckSeg(ca, cb, Z0, ZC - 2.5); // north roadway
          addDeckSeg(ca, cb, ZC - 2.5, broken ? GAPZ : ZC + 2.5); // promenade strip
          if (!broken) addDeckSeg(ca, cb, ZC + 2.5, Z1); // south roadway
          // plank promenade on top of the central strip
          b.boxMM(
            "planks",
            ca,
            D,
            ZC - 2.4,
            cb,
            D + 0.08,
            broken ? GAPZ : ZC + 2.4,
            { grime: 0.5, noAO: true, uvScale: 2.5 },
          );
        }
        // steel under-structure (box girder) with cross beams
        b.boxMM("rust", xa, D - 2.4, Z0 + 0.3, xb, D - 0.35, Z0 + 1.1, {
          grime: 0.6,
        });
        b.boxMM("rust", xa, D - 2.4, Z1 - 1.1, xb, D - 0.35, Z1 - 0.3, {
          grime: 0.6,
        });
        for (let x = xa + 1; x < xb; x += 4) {
          if (x > GAP0 && x < GAP1) {
            b.box("rust", x, D - 1.9, (Z0 + GAPZ) / 2, 0.35, 1.5, GAPZ - Z0, {
              seg: false,
            });
            continue;
          }
          b.box("rust", x, D - 1.9, ZC, 0.35, 1.5, Z1 - Z0 - 0.6, {
            seg: false,
            grime: 0.7,
          });
        }
        // outer stiffening trusses above the deck (top chord, posts, diagonals)
        for (const zz of [Z0 + 0.35, Z1 - 0.35]) {
          const brokenSide = zz > ZC;
          let prev = null;
          for (let x = xa; x <= xb + 0.01; x += 2.6) {
            if (brokenSide && x > GAP0 - 1 && x < GAP1 + 1) {
              prev = null;
              continue;
            }
            b.box("steel", x, D, zz, 0.18, 1.8, 0.18, {
              seg: false,
              grime: 0.4,
            });
            if (prev !== null) {
              b.beam(
                "steel",
                V(prev, D + 1.8, zz),
                V(x, D + 1.8, zz),
                0.22,
                0.22,
                { grime: 0.3 },
              );
              b.beam(
                "steel",
                V(prev, D + 0.05, zz),
                V(x, D + 1.8, zz),
                0.1,
                0.1,
                { grime: 0.3 },
              );
              b.beam(
                "steel",
                V(prev, D + 1.8, zz),
                V(x, D + 0.05, zz),
                0.1,
                0.1,
                { grime: 0.3 },
              );
            }
            prev = x;
          }
          // collider (parapet) along the truss
          if (!brokenSide)
            LB.colMM(xa, D, zz - 0.3, xb, D + 1.9, zz + 0.3, {
              walkable: false,
              surface: "metal",
            });
          else {
            LB.colMM(
              xa,
              D,
              zz - 0.3,
              Math.min(xb, GAP0 - 1),
              D + 1.9,
              zz + 0.3,
              { walkable: false },
            );
            if (xb > GAP1 + 1)
              LB.colMM(
                Math.max(xa, GAP1 + 1),
                D,
                zz - 0.3,
                xb,
                D + 1.9,
                zz + 0.3,
                { walkable: false },
              );
          }
        }
        // inner pipe railings (roadway | promenade) with gaps to cross over
        for (const zz of [ZC - 2.5, ZC + 2.5]) {
          for (let x = xa; x < xb - 1; x += 24) {
            const xe = Math.min(xb, x + 20);
            if (zz > ZC && xe > GAP0 && x < GAP1) continue;
            LB.railing(
              b,
              [
                [x, zz],
                [xe, zz],
              ],
              D,
              1.0,
              "iron",
              { postStep: 2.5 },
            );
          }
        }
        // promenade lamp posts
        for (let x = xa + 8; x < xb; x += 26)
          LB.lampPost(b, x, D + 0.08, ZC, false);
      }
      // deck over the anchorages (paving)
      for (const [xa, xb] of [
        [XAM0, XAM1],
        [XAB0, XAB1],
      ]) {
        b.boxMM("asphalt", xa, D - 0.3, Z0, xb, D, Z1, {
          grime: 0.6,
          noAO: true,
        });
        b.boxMM("planks", xa, D, ZC - 2.4, xb, D + 0.08, ZC + 2.4, {
          grime: 0.5,
          noAO: true,
        });
      }

      // ---------------- collapse: jagged edges, hanging plates, debris ---------
      {
        const r = LB.rng("bb_gap");
        for (let i = 0; i < 9; i++) {
          const x = GAP0 + 0.5 + i * 1.6;
          b.box(
            "asphalt",
            x,
            D - 1.4 - r() * 1.5,
            GAPZ + 0.6 + r() * 2,
            1.5,
            0.3,
            2.2 + r() * 2,
            {
              rx: 0.6 + r() * 0.6,
              rz: (r() - 0.5) * 0.4,
              seg: false,
              grime: 0.7,
            },
          );
        }
        for (const x of [GAP0, GAP1]) {
          for (let k = 0; k < 4; k++)
            b.box(
              "rust",
              x + (x === GAP0 ? 0.6 : -0.6),
              D - 3 - k * 0.9,
              ZC + 3 + k * 2,
              0.4,
              3.5,
              0.3,
              { rx: 0.4 + k * 0.2, seg: false },
            );
          b.box(
            "asphalt",
            x + (x === GAP0 ? 1.5 : -1.5),
            D - 2.3,
            ZC + 6,
            3,
            0.35,
            7,
            { rz: x === GAP0 ? -0.5 : 0.5, seg: false, grime: 0.6 },
          );
        }
        // wreckage sticking out of the river below
        b.box("asphalt", (GAP0 + GAP1) / 2, -4, ZC + 7, 12, 0.5, 9, {
          rx: 0.35,
          rz: 0.2,
          seg: false,
          grime: 0.8,
        });
        b.box("rust", (GAP0 + GAP1) / 2 + 3, -4, ZC + 10, 0.6, 7, 0.6, {
          rz: 0.5,
          seg: false,
        });
        // a car teetering over the edge
        LB.car(b, GAP0 - 1.2, D - 0.2, ZC + 5.5, Math.PI / 2 + 0.2, {
          tilt: -0.35,
          seed: 91,
          noCollide: true,
        });
        LB.col(GAP0 - 2.6, ZC + 5.5, 4.2, 2, D, D + 1.4, 0, {
          surface: "metal",
        });
        // warning barricade before the gap (raider humour)
        const warnK = LB.texMat(
          "bb_warn",
          LB.signTex(
            "bb_warn",
            ["MIND THE GAP", "NO REFUNDS"],
            "raider",
            512,
            192,
          ),
        );
        for (const x of [GAP0 - 5, GAP1 + 5]) {
          b.box("planks", x, D + 0.6, ZC + 7, 0.12, 0.35, 8, {
            seg: false,
            grime: 0.5,
          });
          for (const zz of [ZC + 3.4, ZC + 10.5])
            b.box("planks", x, D, zz, 0.12, 1.1, 0.12, { seg: false, rx: 0.2 });
          b.quad(
            warnK,
            x + (x < GAP0 ? -0.08 : 0.08),
            D + 1.5,
            ZC + 7,
            3,
            1.1,
            { ry: x < GAP0 ? -Math.PI / 2 : Math.PI / 2 },
          );
        }
      }

      // ---------------- cables: main, suspenders, stays ------------------------
      const cableY = (x) => {
        if (x >= XT1 && x <= XT2) {
          const m = (XT1 + XT2) / 2,
            h = (XT2 - XT1) / 2;
          const t = (x - m) / h;
          return SAG_MIN + (SADDLE - SAG_MIN) * t * t;
        }
        if (x < XT1) {
          const t = (x - (XAM1 - 2)) / (XT1 - (XAM1 - 2));
          return D + 3 + (SADDLE - D - 3) * t - 5 * 4 * t * (1 - t) * 0.5;
        }
        const t = (x - XT2) / (XAB0 + 2 - XT2);
        return SADDLE + (D + 3 - SADDLE) * t - 5 * 4 * t * (1 - t) * 0.5;
      };
      const cableRanges = [
        [XAM1 - 2, XT1],
        [XT1, XT2],
        [XT2, XAB0 + 2],
      ];
      for (const cz of CABLE_Z) {
        for (const [xa, xb] of cableRanges) {
          const pts = [];
          const n = Math.max(8, Math.round((xb - xa) / 3));
          for (let i = 0; i <= n; i++) {
            const x = xa + ((xb - xa) * i) / n;
            pts.push(V(x, cableY(x), cz));
          }
          const curve = new THREE.CatmullRomCurve3(pts);
          b.add("steel", new THREE.TubeGeometry(curve, n * 2, 0.42, 6, false), {
            grime: 0.3,
            noAO: true,
          });
        }
        // vertical suspenders every 2.2 m (not in the collapse)
        for (let x = XAM1 + 1; x < XAB0; x += 2.2) {
          if (Math.abs(x - XT1) < TW + 1 || Math.abs(x - XT2) < TW + 1)
            continue;
          const top = cableY(x);
          if (top - (D + 1.8) < 0.6) continue;
          if (cz > ZC && x > GAP0 && x < GAP1) {
            // snapped suspenders dangling
            b.beam(
              "steel",
              V(x, top, cz),
              V(x + 0.8, top - 6 - (x % 3) * 2, cz + 0.4),
              0.07,
              0.07,
              { noAO: true, grime: 0.2 },
            );
            continue;
          }
          b.beam("steel", V(x, top, cz), V(x, D + 1.8, cz), 0.07, 0.07, {
            noAO: true,
            grime: 0.2,
          });
        }
        // diagonal stays radiating from the tower tops (the iconic web)
        for (const X of [XT1, XT2])
          for (const dir of [-1, 1]) {
            const reach =
              dir < 0 && X === XT1
                ? XT1 - XAM1 - 8
                : dir > 0 && X === XT2
                  ? XAB0 - XT2 - 8
                  : 62;
            for (let k = 1; k <= 9; k++) {
              const xe = X + dir * (TW + 2 + (k * reach) / 9);
              if (cz > ZC && xe > GAP0 && xe < GAP1) continue;
              b.beam(
                "steel",
                V(X + dir * (TW + 0.5), SADDLE - 1.5 - k * 0.35, cz),
                V(xe, D + 1.8, cz),
                0.09,
                0.09,
                { noAO: true, grime: 0.2 },
              );
            }
          }
      }

      // ---------------- wrecks, raider toll gate, clutter -----------------------
      const r = LB.rng("bb_cars");
      const carSpots = [];
      for (let i = 0; i < 18; i++) {
        const x = XAM1 + 4 + r() * (XAB0 - XAM1 - 8);
        if (
          Math.abs(x - XT1) < TW + 4 ||
          Math.abs(x - XT2) < TW + 4 ||
          (x > GAP0 - 6 && x < GAP1 + 6)
        )
          continue;
        if (x > 263 && x < 285) continue; // toll gate zone
        const north = r() < 0.55;
        const z = north
          ? ZC - 7.5 + (r() - 0.5) * 3
          : ZC + 7.5 + (r() - 0.5) * 3;
        if (
          carSpots.some((c) => Math.abs(c[0] - x) < 6 && Math.abs(c[1] - z) < 3)
        )
          continue;
        carSpots.push([x, z]);
        LB.car(
          b,
          x,
          D,
          z,
          Math.PI / 2 + (r() - 0.5) * 0.9 + (r() < 0.5 ? Math.PI : 0),
          { seed: i * 13 + 5, flipped: r() < 0.12 },
        );
      }
      // Fizzo Cola delivery truck jack-knifed on the main span
      {
        const tx = 400,
          tz = ZC - 6.5,
          ry = Math.PI / 2 + 0.25;
        b.box("paint_red", tx, D + 0.5, tz, 2.4, 2.8, 7.2, {
          ry,
          seg: false,
          grime: 0.6,
        });
        b.box(
          "paint_cream",
          tx + Math.sin(ry) * 4.4,
          D + 0.4,
          tz + Math.cos(ry) * 4.4,
          2.3,
          2.0,
          2.2,
          { ry, seg: false, grime: 0.6 },
        );
        const bm = LB.brandMat("fizzo_cola");
        for (const s of [-1, 1])
          b.quad(
            bm,
            tx + Math.cos(ry) * s * 1.22,
            D + 1.95,
            tz - Math.sin(ry) * s * 1.22,
            6.6,
            2.4,
            { ry: ry + (s * Math.PI) / 2 },
          );
        for (const s of [-1, 1])
          for (const k of [-2.6, 0, 2.6, 4.6]) {
            const w = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 10);
            w.rotateZ(Math.PI / 2);
            b.add("tire", w, {
              m: LB.m4(
                tx + Math.sin(ry) * k + Math.cos(ry) * s * 1.1,
                D + 0.45,
                tz + Math.cos(ry) * k - Math.sin(ry) * s * 1.1,
                ry,
              ),
            });
          }
        LB.col(
          tx + Math.sin(ry) * 1.2,
          tz + Math.cos(ry) * 1.2,
          2.5,
          10,
          D,
          D + 3.3,
          ry,
          { surface: "metal" },
        );
        anchors.truck = V(tx - 4, D, tz + 2.5);
      }
      // --- The toll gate (Manhattan side span, x ≈ 268..280) ---
      const TX = 272;
      LB.scrapWall(b, TX, Z0 + 0.6, TX, ZC - 5.5, 3.0, { y: D, seed: 11 }); // north roadway: gate gap at ZC-5.5..ZC-2.5
      LB.scrapWall(b, TX, ZC + 2.6, TX, Z1 - 0.6, 3.0, { y: D, seed: 12 }); // south roadway closed
      // boom-barrier post + counterweight housing (the striped pole itself is animated, see below)
      b.box("paint_red", TX, D, ZC - 5.7, 0.35, 1.25, 0.35, {
        seg: false,
        grime: 0.6,
      });
      b.box("iron", TX, D + 1.25, ZC - 5.7, 0.5, 0.25, 0.5, { seg: false });
      b.box("iron", TX, D, ZC - 2.25, 0.18, 1.05, 0.18, { seg: false }); // rest fork on the far side
      // toll booth shack on the promenade
      b.boxMM(
        "corrugated",
        TX - 1.8,
        D + 0.08,
        ZC - 2.2,
        TX + 1.8,
        D + 2.8,
        ZC + 2.2,
        { grime: 0.7 },
      );
      b.boxMM(
        "rust",
        TX - 2.1,
        D + 2.8,
        ZC - 2.5,
        TX + 2.1,
        D + 3.0,
        ZC + 2.5,
        { seg: false },
      );
      b.quad("glass_broken", TX + 1.82, D + 1.6, ZC - 0.8, 1.6, 1.0, {
        ry: Math.PI / 2,
      });
      b.quad("glass_broken", TX - 1.82, D + 1.6, ZC - 0.8, 1.6, 1.0, {
        ry: -Math.PI / 2,
      });
      for (const sx of [-1, 1])
        b.box("planks", TX + sx * 1.95, D + 1.02, ZC - 0.8, 0.35, 0.06, 1.7, {
          seg: false,
        }); // pay-window ledges
      LB.colMM(TX - 1.8, D, ZC - 2.2, TX + 1.8, D + 3.0, ZC + 2.2, {
        walkable: false,
        surface: "metal",
      });
      const tollK = LB.texMat(
        "bb_toll",
        LB.signTex(
          "bb_toll",
          ["TOLL: 20 SCRIP", "PAY OR PLUNGE"],
          "raider",
          512,
          256,
          { bg: "#5f5b4e" },
        ),
      );
      b.quad(tollK, TX + 1.9, D + 4.3, ZC, 4.6, 2.3, { ry: Math.PI / 2 });
      b.quad(tollK, TX - 1.9, D + 4.3, ZC, 4.6, 2.3, { ry: -Math.PI / 2 });
      b.box("rust", TX, D + 3.0, ZC, 0.2, 2.3, 0.2, { seg: false });
      // skulls on spikes, fire barrels, mattresses, a raider flag
      for (const zz of [ZC - 5.8, ZC - 2.2]) {
        b.box("rust", TX + 0.8, D, zz, 0.08, 2.4, 0.08, { seg: false });
        b.sphere("bone", TX + 0.8, D + 2.5, zz, 0.16, {
          sx: 1,
          sy: 1.1,
          sz: 1.2,
        });
      }
      LB.barrel(b, TX + 3.5, D, ZC - 8.5, { fire: true });
      LB.barrel(b, TX - 3, D, ZC - 9, { fire: true });
      LB.barrel(b, TX - 3.5, D, ZC + 4, {});
      for (let i = 0; i < 3; i++)
        b.box(
          "fabric",
          TX - 8 - i * 2.4,
          D + 0.08,
          ZC - 9 + (i % 2),
          1.0,
          0.22,
          2.0,
          { ry: 0.3 * i, seg: false, c: 0xb8a888 },
        );
      anchors.toll = LB.anchor(TX + 3, D, ZC - 4.2, -Math.PI / 2); // the pay window, facing Brooklyn-bound traffic... from Manhattan
      anchors.toll_boss = LB.anchor(TX - 2.5, D, ZC - 3.5, Math.PI / 2); // Tony stands on the Manhattan side of the gate, facing west
      anchors.toll_guard1 = LB.anchor(TX - 2.2, D, ZC - 7.2, Math.PI / 2);
      anchors.toll_guard2 = LB.anchor(TX - 2.4, D, ZC + 0.3, Math.PI / 2);
      anchors.footlocker = LB.anchor(TX - 7, D + 0.1, ZC - 5.2, 0);
      // raider sandbag nest facing Brooklyn at the tower arches
      LB.sandbags(b, XT1 - TW - 5, ZC - 9.5, XT1 - TW - 5, ZC - 6.5, 3, {
        y: D,
      });
      // hanging cage from the main cable over the collapse
      {
        const cx = GAP0 + 6,
          cz = CABLE_Z[1] - 0.2,
          top = cableY(cx);
        b.beam("iron", V(cx, top, cz), V(cx, D - 4, cz), 0.05, 0.05, {
          noAO: true,
        });
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          b.beam(
            "iron",
            V(cx + Math.cos(a) * 0.7, D - 6.4, cz + Math.sin(a) * 0.7),
            V(cx + Math.cos(a) * 0.7, D - 4, cz + Math.sin(a) * 0.7),
            0.04,
            0.04,
            { noAO: true },
          );
        }
        b.cyl("iron", cx, D - 6.5, cz, 0.75, 0.75, 0.1, 8, { hSeg: 1 });
        b.cyl("iron", cx, D - 4.05, cz, 0.3, 0.75, 0.3, 8, { hSeg: 1 });
        LB.skeleton(b, cx, D - 6.4, cz - 0.1, 0.4);
      }
      // dead promenade: litter, skeletons, sandbags
      const r2 = LB.rng("bb_litter");
      for (let i = 0; i < 14; i++) {
        const x = XAM1 + r2() * (XAB0 - XAM1);
        if (x > GAP0 - 2 && x < GAP1 + 2) continue;
        if (Math.abs(x - XT1) < TW + 1 || Math.abs(x - XT2) < TW + 1) continue;
        if (r2() < 0.4)
          LB.skeleton(b, x, D + 0.1, ZC + (r2() - 0.5) * 3, r2() * 6);
        else
          b.rock("rubble", x, D, ZC + (r2() < 0.5 ? -7 : 7), 0.5 + r2() * 0.5, {
            flat: 0.4,
            seed: i,
          });
      }

      // anchors along the bridge
      anchors.manhattan_ramp = V(XM0 - 3, 0, ZC);
      anchors.brooklyn_ramp = V(XB1 + 3, 0, ZC);
      anchors.entrance = anchors.manhattan_ramp.clone();
      anchors.tower_manhattan = V(XT1, D, ZC - 5);
      anchors.tower_brooklyn = V(XT2, D, ZC - 5);
      anchors.deck_mid = V((XT1 + XT2) / 2, D, ZC - 4);
      anchors.gap_edge = V(GAP0 - 3, D, ZC - 2);
      anchors.boss = anchors.toll_boss.clone();
      anchors.spawn1 = V(TX + 6, D, ZC - 7);
      anchors.spawn2 = V(TX + 8, D, ZC + 1);
      anchors.spawn3 = V(XT1 - TW - 6, D, ZC - 6);
      anchors.spawn4 = V(330, D, ZC - 7);
      anchors.spawn5 = V(345, D, ZC);
      anchors.spawn6 = V(415, D, ZC - 1);

      const group = b.build(root);
      group.name = "brooklyn_bridge";
      const entry = LB.register("brooklyn_bridge", group, anchors);

      // ---------------- the toll: pay, talk your way through, or force it ----------------
      // Integrates with the quests module's Tollbooth Tony (flags toll_paid / bridge_legit / bridge_paid / bridge_hostile):
      // the boom barrier across the north-roadway gap only lifts once one of those is set, Tony is dead, or the player
      // pays / forces it at a booth window. Events: 'bridgeTollPaid', 'bridgeTollRefused', 'bridgeBarrier'(open).
      const TOLL = 20,
        GAP_Z0 = ZC - 5.5,
        GAP_Z1 = ZC - 2.5;
      let localPaid = false,
        forced = false,
        barrierCol = null,
        open = false,
        lift = 0;
      const qflag = (n) => {
        try {
          return !G.isStub("quests") && G.quests.flag
            ? !!G.quests.flag(n)
            : false;
        } catch (e) {
          return false;
        }
      };
      const setQFlag = (n) => {
        try {
          if (!G.isStub("quests") && G.quests.setFlag)
            G.quests.setFlag(n, true);
        } catch (e) {
          /* optional */
        }
      };
      const tonyDead = () => {
        try {
          if (G.isStub("actors") || !G.actors.get) return false;
          const a = G.actors.get("bb_tony");
          return !!(a && a.dead);
        } catch (e) {
          return false;
        }
      };
      const isOpen = () =>
        localPaid ||
        forced ||
        qflag("toll_paid") ||
        qflag("bridge_legit") ||
        qflag("bridge_paid") ||
        qflag("bridge_hostile") ||
        tonyDead();
      const scrip = () => {
        try {
          return G.inventory.scrip
            ? G.inventory.scrip()
            : G.inventory.count("scrip");
        } catch (e) {
          return 0;
        }
      };
      function setBarrier(o) {
        if (o === open && (o || barrierCol)) return;
        open = o;
        if (!open && !barrierCol)
          barrierCol = LB.col(
            TX,
            (GAP_Z0 + GAP_Z1) / 2,
            0.5,
            GAP_Z1 - GAP_Z0 + 0.2,
            D,
            D + 1.3,
            0,
            { walkable: false, surface: "metal" },
          );
        if (open && barrierCol) {
          try {
            G.world.removeCollider(barrierCol);
          } catch (e) {
            /* core */
          }
          barrierCol = null;
        }
        G.events.emit("bridgeBarrier", open);
      }
      function pay() {
        if (isOpen()) return true;
        if (scrip() < TOLL) {
          G.notify("You need " + TOLL + " scrip to pay the toll.");
          try {
            G.sfx.play("ui_error");
          } catch (e) {
            /* */
          }
          return false;
        }
        try {
          if (G.inventory.addScrip) G.inventory.addScrip(-TOLL);
          else G.inventory.remove("scrip", TOLL);
        } catch (e) {
          /* */
        }
        localPaid = true;
        setQFlag("toll_paid");
        G.notify(
          "Toll paid (" +
            TOLL +
            ' scrip). "Pleasure doin\' business! Keep to the right."',
        );
        try {
          G.sfx.play("barter_trade");
        } catch (e) {
          /* */
        }
        G.events.emit("bridgeTollPaid", TOLL);
        return true;
      }
      function refuse() {
        if (isOpen()) return;
        forced = true;
        setQFlag("bridge_hostile");
        for (const id of ["bb_tony", "bb_knuckles", "bb_deedee"]) {
          try {
            const a = G.actors.get(id);
            if (a && !a.dead && a.setHostile) a.setHostile(true);
          } catch (e) {
            /* */
          }
        }
        G.notify(
          "You shove the barrier up. The toll collectors take it personally.",
        );
        try {
          G.sfx.play("alarm", { pos: new THREE.Vector3(TX, D + 1, ZC) });
        } catch (e) {
          /* */
        }
        G.events.emit("bridgeTollRefused");
      }
      // Who handles the pay-or-fight choice: with the quests module and a living Tollbooth Tony it is his dialogue
      // (pay, persuade or fight), otherwise the booth itself offers "Pay" and a separate, confirmed "Force" option.
      const tony = () => {
        try {
          return G.isStub("actors") || !G.actors.get
            ? null
            : G.actors.get("bb_tony");
        } catch (e) {
          return null;
        }
      };
      const tonyTalks = () => {
        if (
          G.isStub("quests") ||
          G.isStub("dialogue") ||
          !G.dialogue ||
          typeof G.dialogue.start !== "function"
        )
          return false;
        const a = tony();
        return !!(a && !a.dead && !(a.hostile && a.hostile()));
      };
      for (const sx of [-1, 1]) {
        try {
          G.world.addInteractable({
            pos: new THREE.Vector3(TX + sx * 2.0, D + 1.4, ZC - 0.8),
            radius: 0.9,
            range: 2.6,
            priority: 2,
            label: "Toll Booth",
            verb: () =>
              tonyTalks()
                ? "Talk to Tollbooth Tony"
                : "Pay Toll (" + TOLL + " scrip)",
            enabled: () => !isOpen(),
            onInteract() {
              if (tonyTalks()) {
                try {
                  G.dialogue.start("dlg_bb_tony", tony());
                  return;
                } catch (e) {
                  /* fall through to paying */
                }
              }
              pay();
            },
          });
        } catch (e) {
          /* core missing */
        }
      }
      // Forcing the boom (no quests / no Tony): needs a second press within 4 s — you are told it means a fight.
      let forceArmed = -1;
      try {
        G.world.addInteractable({
          pos: new THREE.Vector3(TX, D + 1.1, ZC - 4.6),
          radius: 0.8,
          range: 2.4,
          priority: 1,
          label: "Boom Barrier",
          verb: () =>
            forceArmed > 0
              ? "Force it (confirm — they WILL shoot)"
              : "Force the Barrier",
          enabled: () => !isOpen() && !tonyTalks(),
          onInteract() {
            if (forceArmed > 0) {
              forceArmed = -1;
              refuse();
              return;
            }
            forceArmed = 4;
            G.notify(
              "The toll collectors are watching you. Forcing the barrier means a fight — press again to do it.",
            );
            try {
              G.sfx.play("ui_click");
            } catch (e) {
              /* */
            }
          },
        });
      } catch (e) {
        /* core missing */
      }
      entry.toll = {
        price: TOLL,
        isOpen,
        pay,
        refuse,
        reset() {
          localPaid = false;
          forced = false;
          forceArmed = -1;
        },
      };
      // the striped boom pole (pivot on the post, lies across the gap when closed)
      const boom = new THREE.Group();
      {
        const stripes = LB.canvasTex("lb_boom", 256, 16, (ctx, w, h) => {
          for (let i = 0; i < 8; i++) {
            ctx.fillStyle = i % 2 ? "#d8d0c0" : "#a8281e";
            ctx.fillRect((i * w) / 8, 0, w / 8, h);
          }
        });
        const pm = new THREE.MeshStandardMaterial({
          map: stripes,
          roughness: 0.7,
        });
        pm.userData.shared = true;
        const pg = new THREE.BoxGeometry(0.14, 0.14, GAP_Z1 - GAP_Z0 + 0.5);
        pg.translate(0, 0, (GAP_Z1 - GAP_Z0 + 0.5) / 2);
        const pole = new THREE.Mesh(pg, pm);
        pole.castShadow = true;
        const cw = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.3, 0.6),
          LB.mat("iron"),
        );
        cw.position.z = -0.35;
        boom.add(pole, cw);
        boom.position.set(TX, D + 1.05, ZC - 5.7);
        root.add(boom);
      }
      setBarrier(false);
      LB.animate(new THREE.Vector3(TX, D, ZC), 160, (t, dt) => {
        const want = isOpen();
        if (want !== open) setBarrier(want);
        if (forceArmed > 0) forceArmed -= dt;
        lift += ((open ? 1 : 0) - lift) * Math.min(1, dt * 2.5);
        boom.rotation.x = -1.35 * lift;
      });
      // lifecycle: session state is cleared on reset (new game / before a load) and persisted in the save
      const clearToll = () => {
        localPaid = false;
        forced = false;
        forceArmed = -1;
      };
      LB.onReset.push(clearToll);
      LB.onNewGame.push(clearToll);
      LB.saveHooks.toll = {
        save: () => ({ paid: localPaid, forced }),
        load: (d) => {
          localPaid = !!(d && d.paid);
          forced = !!(d && d.forced);
        },
      };

      LB.onReady.push(() => {
        LB.spawnProp("footlocker", {
          x: anchors.footlocker.x,
          y: anchors.footlocker.y,
          z: anchors.footlocker.z,
          yaw: 0,
          loot: "raider_stash",
          owner: "raiders",
        });
        LB.spawnProp("ammo_box", {
          x: TX + 2.7,
          y: D + 0.1,
          z: ZC + 1.6,
          yaw: 0,
          name: "Toll Box",
          loot: "scrip_stash",
          lootFallback: "raider_stash",
          owner: "raiders",
        });
      });
    },
    20,
  );
