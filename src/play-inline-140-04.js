// play-inline-140 04 — math
// Lines 510-1208 of readable/play-inline-140.pretty.js (statement-aligned).
  LB.addBuilder(
    "guggenheim",
    function (LB, site, root) {
      const b = LB.batch("guggenheim");
      const anchors = {};
      const CX = 150,
        CZ = -755;
      const t0 = LB.terrain(CX, CZ);
      b.ground = t0;
      b.aoH = 3;
      // ---- the inverted ziggurat: every band steps ~1.45 m further out than the one below ----
      const BANDS = 5,
        B0 = 3.4,
        BSTEP = 5.7,
        BH = 4.4,
        R0 = 12.0,
        DR = 1.45,
        FLARE = 0.8;
      const ROOF = B0 + (BANDS - 1) * BSTEP + BH; // 30.6 (local)
      const rBand = (i) => R0 + i * DR;
      const ENTRY_A = Math.PI; // entrance faces west (Fifth Avenue); angle a → (cos a, sin a)
      const ENTRY_W = 0.26; // half-angle of the entrance gap (radians)
      const cream = 0xfbf5e8;
      // exterior bands (flaring outward) with the recessed ribbon windows between them.
      // War damage: band DMG is blown open around angle DMID (south-west, facing the Fifth Avenue approach) with
      // jagged edges, exposed rebar and a sooted void; rust bleeds from the mullions, soot climbs from the breach.
      const DMG = 2,
        DMID = 2.33,
        BR_A = 0.3,
        BR_Y = 2.7;
      const angOf = (x, z) => Math.atan2(z - CZ, x - CX);
      const angDist = (a, b2) =>
        Math.abs(Math.atan2(Math.sin(a - b2), Math.cos(a - b2)));
      const stainBand = (g, yBase, yTop) => {
        if (!g || !g.attributes.color) return;
        const P = g.attributes.position,
          C = g.attributes.color;
        for (let k = 0; k < P.count; k++) {
          const x = P.getX(k),
            y = P.getY(k),
            z = P.getZ(k),
            a = angOf(x, z);
          const hRel = (y - yBase) / Math.max(0.1, yTop - yBase); // 0 bottom … 1 top of this band
          // rust bleed: thin vertical runs hanging from the top edge (under each iron mullion above)
          const run =
            Math.max(0, U.noise2(a * 46, 1.7) - 0.52) *
            3.2 *
            LB.smooth(0.0, 0.9, hRel);
          // soot plume above the breach (only on the damaged band and the ones above it), fading with angle & height
          const soot =
            yBase - t0 >= B0 + DMG * BSTEP - 0.1
              ? Math.max(0, 1 - angDist(a, DMID) / 0.75) *
                (0.55 + 0.45 * U.noise2(a * 9, y * 0.4))
              : 0;
          let scorch = 0; // blackened ring hugging the breach
          if (Math.abs(yBase - t0 - (B0 + DMG * BSTEP)) < 0.1) {
            const da =
                Math.atan2(Math.sin(a - DMID), Math.cos(a - DMID)) / BR_A,
              dy = (y - (yBase + BH * 0.5)) / BR_Y;
            const e = Math.sqrt(da * da + dy * dy);
            scorch =
              Math.max(0, 1 - (e - 0.9) / 0.9) *
              (0.7 + 0.3 * U.noise2(a * 30, y * 2));
          }
          const dk = Math.min(0.85, run * 0.5 + soot * 0.7 + scorch * 0.85);
          const rr = 1 - dk,
            rg = 1 - dk * (run > soot ? 1.12 : 1),
            rb = 1 - dk * (run > soot ? 1.3 : 1);
          C.setXYZ(k, C.getX(k) * rr, C.getY(k) * rg, C.getZ(k) * rb);
        }
        C.needsUpdate = true;
      };
      // irregular blast hole: drop every triangle whose centroid falls inside a noise-perturbed ellipse (angle × height)
      const inBreach = (a, y, yc) => {
        const da = Math.atan2(Math.sin(a - DMID), Math.cos(a - DMID)) / BR_A,
          dy = (y - yc) / BR_Y;
        const rm =
          1 +
          0.55 * (U.noise2(a * 11 + 3, y * 0.9) - 0.5) +
          0.25 * (U.noise2(a * 37, y * 2.7 + 5) - 0.5);
        return da * da + dy * dy < rm * rm;
      };
      const punchBreach = (g, yc) => {
        if (!g) return;
        const P = g.attributes.position,
          keep = [];
        for (let t = 0; t < P.count; t += 3) {
          const cx = (P.getX(t) + P.getX(t + 1) + P.getX(t + 2)) / 3,
            cy = (P.getY(t) + P.getY(t + 1) + P.getY(t + 2)) / 3,
            cz = (P.getZ(t) + P.getZ(t + 1) + P.getZ(t + 2)) / 3;
          if (!inBreach(angOf(cx, cz), cy, yc)) keep.push(t);
        }
        for (const name of Object.keys(g.attributes)) {
          const A = g.attributes[name],
            n = A.itemSize,
            out = new Float32Array(keep.length * 3 * n);
          let o = 0;
          for (const t of keep)
            for (let v = 0; v < 3; v++)
              for (let c = 0; c < n; c++) out[o++] = A.array[(t + v) * n + c];
          g.setAttribute(name, new THREE.BufferAttribute(out, n));
        }
      };
      for (let i = 0; i < BANDS; i++) {
        const y0 = B0 + i * BSTEP,
          y1 = y0 + BH,
          r0 = rBand(i),
          r1 = r0 + FLARE;
        const prof = [
          [r0 - 0.35, y0 - 0.02],
          [r0, y0],
        ];
        const NR = i === DMG ? 16 : 6; // the breached band gets a finer grid → ragged hole edge
        for (let k = 1; k <= NR; k++) {
          const t = k / NR;
          prof.push([
            r0 + FLARE * (t < 0.5 ? 0.7 * t : 0.35 + 1.3 * (t - 0.5)),
            y0 + BH * t,
          ]);
        }
        prof.push([r1 - 0.3, y1 + 0.02]);
        const gb = b.lathe("stucco", prof, i === DMG ? 320 : 144, CX, t0, CZ, {
          grime: 0.14,
          c: cream,
          aoH: 1.2,
          ground: t0 + y0,
        });
        stainBand(gb, t0 + y0, t0 + y1);
        const gs = b.lathe(
          "stucco",
          [
            [r0 - 1.0, y0 + 0.02],
            [r0 - 0.35, y0 - 0.02],
          ],
          72,
          CX,
          t0,
          CZ,
          { grime: 0.3, c: 0xd8d0bc },
        ); // soffit
        if (i === DMG) {
          punchBreach(gb, t0 + y0 + BH * 0.5);
          punchBreach(gs, t0 + y0 + BH * 0.5);
        }
        if (i < BANDS - 1) {
          const ys = y1 + 0.02,
            ye = y0 + BSTEP - 0.02;
          // ribbon glazing sits just outside the interior wall surface (rWall = band + FLARE - 0.55 here)
          b.lathe(
            "glass_dark",
            [
              [r0 + FLARE - 0.4, ys],
              [rBand(i + 1) - 0.3, ye],
            ],
            72,
            CX,
            t0,
            CZ,
            { grime: 0.05, noAO: true },
          );
          const rb = LB.rng("gugg_boards" + i);
          for (let k = 0; k < 48; k++) {
            const a = (k / 48) * TAU,
              rm = r0 + FLARE - 0.3;
            b.box(
              "iron",
              CX + Math.cos(a) * rm,
              t0 + ys,
              CZ + Math.sin(a) * rm,
              0.06,
              ye - ys,
              0.06,
              { seg: false, grime: 0.1 },
            );
            // boarded-up bays: two or three planks nailed across the ribbon window
            if (i < 2 && rb() < 0.12 && angDist(a + TAU / 96, DMID) > 0.5) {
              const am = a + TAU / 96,
                ry = Math.atan2(Math.cos(am), Math.sin(am)) + Math.PI / 2;
              for (let n = 0; n < 2 + (rb() < 0.5 ? 1 : 0); n++)
                b.box(
                  "rotten",
                  CX + Math.cos(am) * (rm + 0.08),
                  t0 + ys + 0.15 + n * 0.42,
                  CZ + Math.sin(am) * (rm + 0.08),
                  2.05,
                  0.26,
                  0.05,
                  { ry, rz: (rb() - 0.5) * 0.25, seg: false, grime: 0.5 },
                );
            }
          }
        }
      }
      // the breach in band DMG: sooted void behind, jagged stucco teeth on both edges, rebar, a hanging slab & debris
      {
        const y0 = B0 + DMG * BSTEP,
          y1 = y0 + BH,
          r0 = rBand(DMG),
          rv = r0 - 0.5;
        const rv2 = LB.rng("gugg_breach");
        const yc = y0 + BH * 0.5;
        b.lathe(
          "concrete_dark",
          [
            [rv, y0 - 0.4],
            [rv + 0.2, y1 + 0.3],
          ],
          12,
          CX,
          t0,
          CZ,
          {
            phiStart: Math.PI / 2 - (DMID + BR_A * 1.5),
            phiLen: BR_A * 3,
            c: 0x3c3934,
            grime: 0.9,
            noAO: true,
          },
        );
        // broken slab edges: chunks scattered along the (noisy) rim of the hole, sooted
        for (let k = 0; k < 22; k++) {
          const th = (k / 22) * TAU + rv2() * 0.2;
          let f = 1.2;
          while (
            f > 0.3 &&
            inBreach(
              DMID + Math.cos(th) * BR_A * f,
              t0 + yc + Math.sin(th) * BR_Y * f,
              t0 + yc,
            )
          )
            f -= 0.08;
          f += 0.06;
          if (rv2() < 0.25) continue;
          const aa = DMID + Math.cos(th) * BR_A * f,
            yy = yc + Math.sin(th) * BR_Y * f;
          if (yy < y0 - 0.2 || yy > y1 + 0.1) continue;
          const rr =
            r0 + FLARE * Math.max(0, Math.min(1, (yy - y0) / BH)) * 0.6;
          b.rock(
            "stucco",
            CX + Math.cos(aa) * rr,
            t0 + yy,
            CZ + Math.sin(aa) * rr,
            0.22 + rv2() * 0.3,
            { c: 0x9a948a, grime: 0.8, flat: 0.7, seed: k * 7 },
          );
        }
        for (let k = 0; k < 16; k++) {
          // exposed, bent reinforcing bars
          const aa = DMID + (rv2() - 0.5) * BR_A * 1.5,
            y = y0 + 0.4 + rv2() * (BH - 0.8),
            rr = r0 - 0.1;
          if (!inBreach(aa, t0 + y, t0 + yc)) continue;
          const p0 = V(CX + Math.cos(aa) * rr, t0 + y, CZ + Math.sin(aa) * rr);
          const p1 = V(
            CX + Math.cos(aa + (rv2() - 0.5) * 0.08) * (rr + 0.8 + rv2() * 0.9),
            t0 + y - rv2() * 1.2,
            CZ + Math.sin(aa + (rv2() - 0.5) * 0.08) * (rr + 0.8 + rv2() * 0.9),
          );
          b.beam("rust", p0, p1, 0.035, 0.035, { noAO: true });
        }
        // a band slab hinged down from the breach, and the debris cone on the pavement below
        const ah = DMID + 0.1,
          hr = 15.2;
        b.box(
          "stucco",
          CX + Math.cos(ah) * hr,
          t0 - 0.2,
          CZ + Math.sin(ah) * hr,
          2.8,
          3.2,
          0.45,
          {
            ry: Math.atan2(Math.cos(ah), Math.sin(ah)),
            rx: 1.05,
            rz: 0.15,
            seg: false,
            c: 0xc8c0ae,
            grime: 0.8,
          },
        ); // fallen band slab
        for (let k = 0; k < 14; k++) {
          const aa = DMID + (rv2() - 0.5) * 0.8,
            rr = 13.8 + rv2() * 4.5;
          b.rock(
            rv2() < 0.7 ? "stucco" : "rubble",
            CX + Math.cos(aa) * rr,
            t0 + 0.05,
            CZ + Math.sin(aa) * rr,
            0.35 + rv2() * 0.8,
            { c: 0xe0d8c4, flat: 0.55, seed: 90 + k },
          );
        }
        LB.fires.push(
          V(CX + Math.cos(DMID) * 15.5, t0 + 0.35, CZ + Math.sin(DMID) * 15.5),
        );
      }
      // ground floor: recessed glazing with the entrance gap, doors, base slab & plinth ring
      b.lathe(
        "glass_dark",
        [
          [11.2, 0.1],
          [11.2, B0],
        ],
        64,
        CX,
        t0,
        CZ,
        {
          grime: 0.1,
          noAO: true,
          phiStart: Math.PI / 2 - ENTRY_A + ENTRY_W,
          phiLen: TAU - 2 * ENTRY_W,
        },
      );
      for (let k = 0; k < 40; k++) {
        const a = ENTRY_A + ENTRY_W + (k / 40) * (TAU - 2 * ENTRY_W);
        b.box(
          "iron",
          CX + Math.cos(a) * 11.25,
          t0 + 0.1,
          CZ + Math.sin(a) * 11.25,
          0.08,
          B0 - 0.1,
          0.08,
          { seg: false, grime: 0.1 },
        );
      }
      b.cyl("concrete", CX, t0 - 0.4, CZ, 13.2, 13.4, 0.5, 64, {
        hSeg: 1,
        grime: 0.4,
      });
      // roof ring + glass skylight dome with ribs (half the panes gone)
      b.lathe(
        "stucco",
        [
          [7.6, 0],
          [rBand(BANDS - 1) + FLARE, 0],
          [rBand(BANDS - 1) + FLARE, 0.5],
          [7.6, 0.5],
          [7.6, 0],
        ],
        72,
        CX,
        t0 + ROOF,
        CZ,
        { grime: 0.45, c: cream },
      );
      b.lathe(
        "stucco",
        [
          [7.6, 0.5],
          [7.9, 1.3],
          [7.4, 1.4],
        ],
        48,
        CX,
        t0 + ROOF,
        CZ,
        { grime: 0.3, c: cream },
      );
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU,
          pts = [];
        for (let k = 0; k <= 6; k++) {
          const t = k / 6;
          pts.push(
            V(
              CX + Math.cos(a) * 7.4 * Math.cos((t * Math.PI) / 2),
              t0 + ROOF + 1.3 + Math.sin((t * Math.PI) / 2) * 3.2,
              CZ + Math.sin(a) * 7.4 * Math.cos((t * Math.PI) / 2),
            ),
          );
        }
        for (let k = 0; k < 6; k++)
          b.beam("iron", pts[k], pts[k + 1], 0.12, 0.12, { noAO: true });
      }
      b.sphere("glass_dark", CX, t0 + ROOF + 1.3, CZ, 7.3, {
        phiLen: Math.PI / 2,
        sy: 0.44,
        ws: 16,
        hs: 5,
        noAO: true,
        grime: 0,
      });
      // lettering band over the entrance canopy: individual metal letters bent around the drum; the blast knocked three
      // loose — two lie on the pavement, one hangs by a bolt.
      {
        const TEXT = "SOLOMON R. GUGGENHEIM MUSEUM",
          FS = 48,
          FONT =
            "bold " +
            FS +
            'px "Futura", "Century Gothic", "Trebuchet MS", sans-serif';
        const mc = document.createElement("canvas").getContext("2d");
        mc.font = FONT;
        const cw = [],
          cx = [];
        let tot = 0;
        for (const ch of TEXT) {
          const w = mc.measureText(ch).width;
          cx.push(tot);
          cw.push(w);
          tot += w + 6;
        }
        const TW = Math.ceil(tot);
        const tex = LB.canvasTex(
          "lb_gugg_letters",
          2048,
          64,
          (ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            ctx.font = FONT;
            ctx.textBaseline = "middle";
            const sc = w / TW;
            ctx.save();
            ctx.scale(sc, 1);
            for (let i = 0; i < TEXT.length; i++) {
              ctx.fillStyle = "#2e2a24";
              ctx.fillText(TEXT[i], cx[i], h / 2 + 2);
              ctx.fillStyle = "#6a604e";
              ctx.fillText(TEXT[i], cx[i] - 1, h / 2);
            }
            ctx.restore();
          },
          { clamp: true },
        );
        const lk = LB.texMat("gugg_letters", tex, {
          transparent: true,
          metal: 0.4,
          rough: 0.6,
        });
        const SW = 13.0,
          LH = 0.8,
          R = rBand(0) + 0.28,
          YL = t0 + B0 + 1.15;
        const loose = { 13: "fall", 18: "hang", 25: "fall" };
        let fallN = 0;
        for (let i = 0; i < TEXT.length; i++) {
          if (TEXT[i] === " " || TEXT[i] === ".") continue;
          const u0 = cx[i] / TW,
            u1 = (cx[i] + cw[i]) / TW,
            lw = (cw[i] / TW) * SW;
          const s0 = ((cx[i] + cw[i] / 2) / TW) * SW - SW / 2;
          const a = ENTRY_A - s0 / R,
            ry = Math.atan2(Math.cos(a), Math.sin(a));
          const px = CX + Math.cos(a) * R,
            pz = CZ + Math.sin(a) * R;
          const mode = loose[i];
          if (mode === "fall") {
            const fr = R + 2.2 + fallN * 1.3;
            fallN++;
            b.quad(
              lk,
              CX + Math.cos(a - 0.03) * fr,
              t0 + 0.04,
              CZ + Math.sin(a - 0.03) * fr,
              lw,
              LH,
              {
                ry: ry + 0.6 + fallN,
                rx: -Math.PI / 2,
                uvRect: [u0, 0, u1, 1],
                grime: 0.3,
              },
            );
          } else if (mode === "hang") {
            // pivot at the letter's top-left bolt, swung ~70° and dropped
            b.quad(
              lk,
              px + Math.sin(ry) * 0.02,
              YL - 0.45,
              pz + Math.cos(ry) * 0.02,
              lw,
              LH,
              { ry, rz: -1.2, uvRect: [u0, 0, u1, 1], grime: 0.3 },
            );
          } else {
            b.quad(lk, px, YL, pz, lw, LH, {
              ry,
              uvRect: [u0, 0, u1, 1],
              grime: 0.2,
            });
          }
        }
        // raider tags on the ground-floor glazing piers and the annex
        const g1 = LB.texMat(
          "gugg_graf1",
          LB.graffitiTex("gugg1", ["SPIRAL", "KINGS"], 512, 256, {
            color: "#c8321e",
            outline: "rgba(20,14,10,0.6)",
            tag: "skull",
          }),
          { transparent: true },
        );
        const g2 = LB.texMat(
          "gugg_graf2",
          LB.graffitiTex("gugg2", ["ART IS DEAD", "SO ARE YOU"], 512, 256, {
            color: "#e0c030",
          }),
          { transparent: true },
        );
        b.quad(g1, CX - 12.4, t0 + 1.6, CZ + 5.4, 3.0, 1.5, {
          ry: -Math.PI / 2 - 0.45,
        });
        b.quad(g2, 172.5, t0 + 3.2, -765.06, 5.2, 2.6, { ry: Math.PI });
      }
      // entrance canopy slab + door frames
      b.boxMM(
        "stucco",
        CX - 16.2,
        t0 + 3.05,
        CZ - 3.4,
        CX - 11.2,
        t0 + 3.45,
        CZ + 3.4,
        { seg: false, c: cream, grime: 0.3 },
      );
      for (const dz of [-2.9, 2.9])
        b.box("stucco", CX - 11.4, t0, CZ + dz, 0.5, 3.05, 0.5, {
          seg: false,
          c: cream,
        });
      for (let k = 0; k < 3; k++)
        b.quad(
          k === 1 ? "glass_broken" : "glass_dark",
          CX - 11.18,
          t0 + 1.3,
          CZ - 1.6 + k * 1.6,
          1.4,
          2.4,
          { ry: -Math.PI / 2, noAO: true },
        );

      // ---- the "monitor" annex: a smaller drum-ended slab kept inside the site (x ≤ 188) ----
      const ax0 = 166,
        ax1 = 180,
        az0 = -765,
        az1 = -749,
        AH = 10.5,
        AR = (az1 - az0) / 2,
        azc = (az0 + az1) / 2;
      b.boxMM("stucco", ax0, t0, az0, ax1, t0 + AH, az1, {
        grime: 0.3,
        c: cream,
        segLen: 4,
      });
      b.cyl("stucco", ax1, t0, azc, AR, AR, AH, 32, {
        hSeg: 3,
        thetaStart: 0,
        thetaLen: Math.PI,
        c: cream,
        grime: 0.3,
      });
      b.boxMM(
        "stucco",
        ax0 - 0.2,
        t0 + AH,
        az0 - 0.2,
        ax1,
        t0 + AH + 0.5,
        az1 + 0.2,
        { seg: false, c: cream },
      );
      b.cyl("stucco", ax1, t0 + AH, azc, AR + 0.2, AR + 0.2, 0.5, 32, {
        hSeg: 1,
        thetaStart: 0,
        thetaLen: Math.PI,
        c: cream,
      });
      for (let k = 0; k < 4; k++) {
        b.quad(
          "glass_dark",
          ax0 + 1.8 + k * 3.2,
          t0 + 7.4,
          az0 - 0.03,
          2.4,
          1.3,
          { ry: Math.PI, noAO: true },
        );
        b.quad(
          "glass_broken",
          ax0 + 1.8 + k * 3.2,
          t0 + 7.4,
          az1 + 0.03,
          2.4,
          1.3,
          { noAO: true },
        );
      }
      for (let k = 0; k < 9; k++) {
        const a = -Math.PI / 2 + ((k + 0.5) / 9) * Math.PI;
        b.quad(
          k % 3 === 1 ? "glass_broken" : "glass_dark",
          ax1 + Math.cos(a) * (AR + 0.03),
          t0 + 7.4,
          azc + Math.sin(a) * (AR + 0.03),
          1.8,
          1.3,
          { ry: Math.atan2(Math.cos(a), Math.sin(a)), noAO: true },
        );
      }
      LB.colMM(ax0, t0, az0, ax1, t0 + AH, az1, { walkable: false });
      for (let k = 0; k < 6; k++) {
        const a = -Math.PI / 2 + ((k + 0.5) / 6) * Math.PI;
        LB.col(
          ax1 + Math.cos(a) * AR * 0.5,
          azc + Math.sin(a) * AR * 0.5,
          AR * 0.95,
          2 * AR * Math.sin(Math.PI / 12) + 0.6,
          t0,
          t0 + AH,
          -a,
          { walkable: false },
        );
      }
      LB.billboard(
        b,
        "first_journal",
        173,
        t0 + AH + 0.5,
        azc,
        -Math.PI / 2,
        11,
        4.8,
        1.2,
      );

      // ---- interior: lobby, reflecting pool, the walkable spiral ramp + top landing (50_uptown_interior.js) ----
      const ix = {
        root,
        anchors,
        CX,
        CZ,
        t0,
        B0,
        BSTEP,
        BH,
        BANDS,
        R0,
        DR,
        FLARE,
        ROOF,
        rBand,
        ENTRY_A,
        ENTRY_W,
      };
      LB.interiorPart("guggenheim", "ramp", ix);
      // outer shell colliders following the bands (entrance gap at ground level only)
      for (let i = 0; i < 32; i++) {
        const a = ((i + 0.5) / 32) * TAU,
          ry = -a + Math.PI / 2;
        const da = Math.abs(
          Math.atan2(Math.sin(a - ENTRY_A), Math.cos(a - ENTRY_A)),
        );
        LB.col(
          CX + Math.cos(a) * 11.45,
          CZ + Math.sin(a) * 11.45,
          2 * 11.45 * Math.sin(Math.PI / 32) + 0.3,
          0.6,
          da < ENTRY_W - 0.04 ? t0 + 3.0 : t0,
          t0 + B0,
          ry,
          { walkable: false },
        );
        for (let k = 0; k < BANDS; k++) {
          const y0 = B0 + k * BSTEP,
            r = rBand(k) + FLARE * 0.5;
          LB.col(
            CX + Math.cos(a) * r,
            CZ + Math.sin(a) * r,
            2 * r * Math.sin(Math.PI / 32) + 0.4,
            1.4,
            t0 + y0,
            t0 + y0 + BSTEP + 0.1,
            ry,
            { walkable: false },
          );
        }
      }
      // anchors
      anchors.entrance = LB.anchor(CX - 15, t0, CZ, -Math.PI / 2);
      // exhibits on the ramp, the wrecked Valet docent, lobby clutter + the interior anchors (50_uptown_interior.js)
      LB.interiorPart("guggenheim", "exhibits", ix);
      anchors.spawn3 = LB.anchor(CX - 18, t0, CZ + 8);
      const g = b.build(root);
      g.name = "guggenheim";
      ix.g = g;
      LB.interiorPart("guggenheim", "finish", ix); // the lit interior batch under the landmark, loot at initDone
      LB.register("guggenheim", g, anchors);
      LB.plaque(
        V(CX - 16, t0 + 1.4, CZ + 3.6),
        "Guggenheim Plaque",
        '"Designed by Frank Lloyd Wright, 1959. Visitors are encouraged to begin at the top and descend. Visitors pursued by Valet units are encouraged to descend faster."',
      );
    },
    51,
  );
