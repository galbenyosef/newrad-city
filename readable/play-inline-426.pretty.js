/* src/poi_harbor2/30_empire.js */
/* =====================================================================
 * NEW RAD CITY — poi_harbor2 / 30_empire.js
 * EMPIRE STORES — the Civil-War-era brick warehouses on the Brooklyn
 * waterfront, wedged between the Manhattan and Brooklyn bridges. Coffee,
 * sugar and hides once; now the EMPIRE STORES MARKET — the biggest
 * scavenger market on the East River, run by Hattie "Scales" Szabo from
 * the old Scale House, where every trade is weighed on a certified scale.
 *
 * EXTERIOR (site 472..528 × 591..619): five joined five-storey units in
 * dark red-brown brick, each a slightly different height and tone:
 * brownstone base, segmental-arched openings with green iron shutters
 * (shut / swung open / hanging / missing), stacked hoist doors with hoist
 * beams and hooks, iron tie-rod stars, corbelled cornices, a painted ghost
 * sign on the river gable. Unit 4 is a gutted, roofless shell — THE YARD,
 * the market's ox pen, entered through a carriage arch. Rooftop
 * garden, water tower, sniper nest. South: the market street in the
 * shadow of the Brooklyn Bridge (stalls, string lights, neon, barricades);
 * north: the loading dock under the Manhattan Bridge.
 * INTERIOR → 31_empire_interior.js.
 * Quest: "Honest Weight" (Hattie Szabo): somebody is lifting from the
 *   market cellar; the lock was never picked.
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

  const ES = (PV.es = {
    X0: 472,
    X1: 528,
    Z0: 591,
    Z1: 619,
    UW: 11.2,
    H: [18.2, 20.2, 18.2, 19.2, 20.6],
    // brick tints (×brick_brown): warm Brooklyn common brick, one tone per unit — lifted in round 2 (the block read as a black
    // silhouette at noon)
    TINT: [
      [1.4, 1.02, 0.84],
      [1.28, 0.93, 0.78],
      [1.46, 1.08, 0.88],
      [1.18, 0.9, 0.78],
      [1.34, 0.99, 0.83],
    ],
    FL: [0, 4.4, 7.4, 10.4, 13.4], // floor levels
    YARD: 3, // gutted unit index
  });
  ES.ux = (i) => ES.X0 + i * ES.UW;

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function exterior(ctx) {
    const root = new THREE.Group();
    root.name = "ph2_empire_ext";
    ctx.extRoot = root;
    const b = K.builder({ name: "es_ext", grime: 0.45 });
    const d = K.builder({ name: "es_detail", grime: 0.45 });
    const { X0, X1, Z0, Z1, UW, H, TINT, FL } = ES;
    const r = K.rng("es_ext");
    const trim = [0.72, 0.56, 0.44],
      shut = [0.9, 1, 0.92];

    /** An opening with iron shutters: centre (x,z) on a face with outward normal (nx,nz), bottom y, w×h, state. */
    const opening = (bb, x, y, z, nx, nz, w, h, st, tint) => {
      const ux = nz,
        uz = -nx,
        P = (u, v, dd) => [x + ux * u + nx * dd, y + v, z + uz * u + nz * dd],
        n = [nx, 0, nz];
      const yaw = Math.atan2(nx, nz);
      // dark void (or, in the roofless yard, the sunlit far wall seen through the hole)
      if (st === "yardvoid")
        bb.quadN(
          "brick_brown",
          P(-w / 2, 0, 0.012),
          P(w / 2, 0, 0.012),
          P(w / 2, h, 0.012),
          P(-w / 2, h, 0.012),
          n,
          { tint: [0.42, 0.34, 0.3] },
        );
      else
        bb.quadN(
          "paint_black",
          P(-w / 2, 0, 0.012),
          P(w / 2, 0, 0.012),
          P(w / 2, h, 0.012),
          P(-w / 2, h, 0.012),
          n,
          { tint: [0.03, 0.03, 0.03] },
        );
      // brownstone sill, segmental brick arch (soldier course) above
      const s = P(0, -0.1, 0.08);
      bb.box("brownstone", s[0], s[1], s[2], w + 0.3, 0.12, 0.22, {
        yaw,
        tint: trim,
      });
      const N = 6,
        R = w * 0.62,
        rise = 0.28;
      for (let k = 0; k < N; k++) {
        const t0 = -1 + (2 * k) / N,
          t1 = -1 + (2 * (k + 1)) / N;
        const a = P(t0 * (w / 2 + 0.12), h + rise * (1 - t0 * t0), 0.05),
          c = P(t1 * (w / 2 + 0.12), h + rise * (1 - t1 * t1), 0.05);
        bb.beam(
          "brick_dark",
          a[0],
          a[1] + 0.12,
          a[2],
          c[0],
          c[1] + 0.12,
          c[2],
          0.26,
          0.1,
          { tint: tint.map((v) => v * 0.8) },
        );
      }
      void R;
      // jamb reveals
      for (const e of [-1, 1]) {
        const j = P(e * (w / 2 + 0.06), 0, 0.06);
        bb.box("brick_dark", j[0], y, j[2], 0.12, h, 0.12, {
          yaw,
          tint: tint.map((v) => v * 0.85),
        });
      }
      if (st === "void" || st === "yardvoid") return;
      if (st === "shut") {
        bb.quadN(
          "shutter",
          P(-w / 2, 0, 0.03),
          P(w / 2, 0, 0.03),
          P(w / 2, h, 0.03),
          P(-w / 2, h, 0.03),
          n,
          { tint: shut, tile: [w, h] },
        );
        return;
      }
      // leaves swung open flat against the wall either side (or one hanging askew)
      for (const e of [-1, 1]) {
        if (st === "hanging" && e > 0) {
          const a = P(w / 2 - 0.05, 0.1, 0.05),
            c = P(w / 2 + 0.1, h * 0.55, 0.45);
          bb.quadN(
            "shutter",
            [a[0], a[1], a[2]],
            [c[0], a[1] + 0.3, c[2]],
            [c[0], c[1] + h * 0.45, c[2]],
            [a[0], h + y - 0.1, a[2]],
            n,
            { tint: shut },
          );
          continue;
        }
        const i0 = P(e * (w / 2 + 0.14), 0, 0.05),
          i1 = P(e * (w / 2 + 0.14 + w / 2), 0, 0.05);
        const q = e < 0 ? [i1, i0] : [i0, i1];
        bb.quadN(
          "shutter",
          [q[0][0], y, q[0][2]],
          [q[1][0], y, q[1][2]],
          [q[1][0], y + h, q[1][2]],
          [q[0][0], y + h, q[0][2]],
          n,
          { tint: shut },
        );
      }
    };
    const star = (bb, x, y, z, nx, nz) => {
      const yaw = Math.atan2(nx, nz),
        ux = nz,
        uz = -nx;
      bb.geo("cast_iron", K.unitCyl(8), {
        x: x + nx * 0.05,
        y,
        z: z + nz * 0.05,
        sx: 0.08,
        sy: 0.06,
        sz: 0.08,
        rx: HP,
        ry: yaw,
        tint: [0.3, 0.28, 0.26],
      });
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * PI * 2 + PI / 2;
        bb.beam(
          "cast_iron",
          x + nx * 0.05,
          y,
          z + nz * 0.05,
          x + nx * 0.05 + ux * Math.cos(a) * 0.32,
          y + Math.sin(a) * 0.32,
          z + nz * 0.05 + uz * Math.cos(a) * 0.32,
          0.07,
          0.03,
          { tint: [0.3, 0.28, 0.26] },
        );
      }
    };

    for (let i = 0; i < 5; i++) {
      const x0 = ES.ux(i),
        x1 = x0 + UW,
        xm = (x0 + x1) / 2,
        h = H[i],
        tint = TINT[i],
        yard = i === ES.YARD;
      // walls (long faces) + gable ends on the outer units
      for (const [z, nz] of [
        [Z0, -1],
        [Z1, 1],
      ]) {
        if (yard && nz > 0) {
          // the carriage arch: wall split around a 5.2 m opening
          for (const [a, c] of [
            [x0, xm - 2.6],
            [xm + 2.6, x1],
          ]) {
            K.fwall(b, "brownstone", a, z, c, z, 0, 0.9, 0, nz, {
              tint: [0.72, 0.56, 0.46],
            });
            K.fwall(b, "brick_brown", a, z, c, z, 0.9, h - 0.9, 0, nz, {
              tint,
            });
          }
          K.fwall(
            b,
            "brick_brown",
            xm - 2.6,
            z,
            xm + 2.6,
            z,
            5.6,
            h - 5.6,
            0,
            nz,
            { tint },
          );
          continue;
        }
        K.fwall(b, "brownstone", x0, z, x1, z, 0, 0.9, 0, nz, {
          tint: [0.72, 0.56, 0.46],
        });
        K.fwall(b, "brick_brown", x0, z, x1, z, 0.9, h - 0.9, 0, nz, { tint });
      }
      if (i === 0) {
        K.fwall(b, "brownstone", X0, Z0, X0, Z1, 0, 0.9, -1, 0, {
          tint: [0.72, 0.56, 0.46],
        });
        K.fwall(b, "brick_brown", X0, Z0, X0, Z1, 0.9, h - 0.9, -1, 0, {
          tint,
        });
      }
      if (i === 4) {
        K.fwall(b, "brownstone", X1, Z0, X1, Z1, 0, 0.9, 1, 0, {
          tint: [0.72, 0.56, 0.46],
        });
        K.fwall(b, "brick_brown", X1, Z0, X1, Z1, 0.9, h - 0.9, 1, 0, { tint });
      }
      // stepped party-wall ends where a neighbour is lower (the exposed upper wall)
      if (i > 0 && H[i - 1] < h)
        K.fwall(
          b,
          "brick_brown",
          x0,
          Z0,
          x0,
          Z1,
          H[i - 1],
          h - H[i - 1],
          -1,
          0,
          { tint },
        );
      if (i < 4 && H[i + 1] < h)
        K.fwall(
          b,
          "brick_brown",
          x1,
          Z0,
          x1,
          Z1,
          H[i + 1],
          h - H[i + 1],
          1,
          0,
          { tint },
        );
      // roof (tar) unless gutted
      if (!yard) {
        b.face(
          "concrete_dark",
          x0,
          h - 0.9,
          Z1,
          1,
          0,
          0,
          0,
          0,
          -1,
          UW,
          Z1 - Z0,
          { uv: "top", tint: [0.34, 0.33, 0.32] },
        );
        b.col(x0, 0, Z0, x1, h, Z1, { tag: "building" });
      }
      // corbelled cornice (3 stepped courses) + coping, both long faces
      for (const [z, nz] of [
        [Z0, -1],
        [Z1, 1],
      ]) {
        for (let k = 0; k < 3; k++)
          b.boxMM(
            "brick_dark",
            x0,
            h - 1.5 + k * 0.18,
            Math.min(z, z + nz * (0.1 + k * 0.1)),
            x1,
            h - 1.32 + k * 0.18,
            Math.max(z, z + nz * (0.1 + k * 0.1)),
            { tint: tint.map((v) => v * 0.9), faces: "nsewtb" },
          );
        for (let x = x0 + 0.3; x < x1 - 0.2; x += 0.55)
          b.box("brick_dark", x, h - 1.9, z + nz * 0.08, 0.22, 0.4, 0.16, {
            tint: tint.map((v) => v * 0.85),
          }); // dentil corbels
        b.boxMM(
          "brownstone",
          x0,
          h - 0.12,
          Math.min(z, z + nz * 0.2),
          x1,
          h,
          Math.max(z, z + nz * 0.2),
          { tint: [0.66, 0.54, 0.46], faces: "nsewtb" },
        );
      }
      b.boxMM("brownstone", x0, h - 0.12, Z0, x1, h, Z0 + 0.35, {
        tint: [0.66, 0.54, 0.46],
      });
      b.boxMM("brownstone", x0, h - 0.12, Z1 - 0.35, x1, h, Z1, {
        tint: [0.66, 0.54, 0.46],
      });
      for (const [x, nx] of [
        [x0, -1],
        [x1, 1],
      ])
        if ((i === 0 && nx < 0) || (i === 4 && nx > 0))
          b.boxMM(
            "brownstone",
            Math.min(x, x + nx * 0.2),
            h - 0.12,
            Z0,
            Math.max(x, x + nx * 0.2),
            h,
            Z1,
            { tint: [0.66, 0.54, 0.46], faces: "nsewtb" },
          );

      // ---- openings on both long faces ----
      for (const [z, nz] of [
        [Z0, -1],
        [Z1, 1],
      ]) {
        // ground storey: 3 bays (centre loading door, flanking arched windows) — the south face of the
        // yard gets the carriage arch, the market door is unit 1 south
        const bays = [xm - 3.6, xm, xm + 3.6];
        bays.forEach((x, k) => {
          if (yard && nz > 0 && k === 1) return; // carriage arch drawn below
          if (i === 1 && nz > 0 && k === 1) return; // market doors drawn below
          const st =
            k === 1
              ? nz < 0
                ? "shut"
                : r.pick(["shut", "open"])
              : r.pick(["shut", "shut", "open", "void", "hanging"]);
          opening(
            b,
            x,
            0.95,
            z,
            0,
            nz,
            k === 1 ? 2.6 : 1.8,
            k === 1 ? 3.2 : 2.6,
            yard ? "yardvoid" : st,
            tint,
          );
        });
        // upper storeys: 3 windows + the hoist door column (centre)
        for (let f = 1; f < FL.length; f++) {
          const y = FL[f] + 0.7;
          if (y + 1.6 > h - 1.95) break;
          for (const x of [x0 + 1.9, x0 + 3.9, x1 - 3.9, x1 - 1.9]) {
            const st = yard
              ? "yardvoid"
              : r.pick(["shut", "shut", "shut", "open", "void", "hanging"]);
            opening(b, x, y, z, 0, nz, 1.0, 1.6, st, tint);
          }
          opening(
            b,
            xm,
            FL[f] + 0.3,
            z,
            0,
            nz,
            1.3,
            2.2,
            yard ? "yardvoid" : f % 2 ? "shut" : r.pick(["open", "shut"]),
            tint,
          );
          for (const x of [x0 + 2.9, x1 - 2.9])
            star(b, x, FL[f] - 0.1, z, 0, nz);
        }
        // hoist beam + pulley + hook at the top of the hoist column
        if (!yard) {
          const hy = h - 2.0;
          b.beam(
            "wood_dark",
            xm,
            hy,
            z - nz * 0.4,
            xm,
            hy,
            z + nz * 1.4,
            0.26,
            0.3,
            { tint: [0.4, 0.32, 0.24] },
          );
          b.geo("rust", K.torusGeo(), {
            x: xm,
            y: hy - 0.3,
            z: z + nz * 1.2,
            s: 0.22,
            sz: 0.5,
            ry: HP,
          });
          const drop = 2 + r() * 5;
          b.pipe(
            "rust",
            xm,
            hy - 0.4,
            z + nz * 1.2,
            xm,
            hy - drop,
            z + nz * 1.2,
            0.02,
            4,
          );
          b.box("rust", xm, hy - drop - 0.25, z + nz * 1.2, 0.08, 0.25, 0.2);
        }
      }
      // ---- the yard: a gutted shell (inner faces of its walls, joist pockets, charred beams, sky) ----
      if (yard) {
        const ix0 = x0 + 0.6,
          ix1 = x1 - 0.6,
          iz0 = Z0 + 0.6,
          iz1 = Z1 - 0.6;
        K.fwall(b, "brick_brown", ix0, iz0, ix1, iz0, 0, h - 0.3, 0, 1, {
          tint: tint.map((v) => v * 0.78),
        });
        for (const [a, c] of [
          [ix0, xm - 2.6],
          [xm + 2.6, ix1],
        ])
          K.fwall(b, "brick_brown", a, iz1, c, iz1, 0, h - 0.3, 0, -1, {
            tint: tint.map((v) => v * 0.78),
          });
        K.fwall(
          b,
          "brick_brown",
          xm - 2.6,
          iz1,
          xm + 2.6,
          iz1,
          5.6,
          h - 5.9,
          0,
          -1,
          { tint: tint.map((v) => v * 0.78) },
        );
        for (const e of [-1, 1])
          b.quadN(
            "brick_dark",
            [xm + e * 2.6, 0, iz1],
            [xm + e * 2.6, 0, Z1],
            [xm + e * 2.6, 5.6, Z1],
            [xm + e * 2.6, 5.6, iz1],
            [-e, 0, 0],
            { tint: tint.map((v) => v * 0.7) },
          );
        K.fwall(b, "brick_brown", ix0, iz0, ix0, iz1, 0, h - 0.3, 1, 0, {
          tint: tint.map((v) => v * 0.72),
        });
        K.fwall(b, "brick_brown", ix1, iz0, ix1, iz1, 0, h - 0.3, -1, 0, {
          tint: tint.map((v) => v * 0.72),
        });
        // wall tops
        b.boxMM("brownstone", x0, h - 0.3, Z0, x1, h, iz0, {
          tint: [0.6, 0.5, 0.42],
        });
        b.boxMM("brownstone", x0, h - 0.3, iz1, x1, h, Z1, {
          tint: [0.6, 0.5, 0.42],
        });
        // colliders: 4 walls, with the carriage arch in the south wall
        b.col(x0, 0, Z0, x1, h, iz0, { tag: "building" });
        b.col(x0, 0, iz0, ix0, h, iz1, { tag: "building" });
        b.col(ix1, 0, iz0, x1, h, iz1, { tag: "building" });
        b.col(x0, 0, iz1, xm - 2.6, h, Z1, { tag: "building" });
        b.col(xm + 2.6, 0, iz1, x1, h, Z1, { tag: "building" });
        b.col(xm - 2.6, 5.6, iz1, xm + 2.6, h, Z1, { tag: "building" });
        // window holes seen from inside (sky light through) + joist pockets at each floor
        for (let f = 1; f < FL.length; f++) {
          for (const x of [x0 + 1.9, x0 + 3.9, x1 - 3.9, x1 - 1.9, xm])
            for (const [z, nz] of [
              [iz0, 1],
              [iz1, -1],
            ])
              b.quadN(
                "lamp",
                [x - 0.5, FL[f] + 0.7, z + nz * 0.01],
                [x + 0.5, FL[f] + 0.7, z + nz * 0.01],
                [x + 0.5, FL[f] + 2.3, z + nz * 0.01],
                [x - 0.5, FL[f] + 2.3, z + nz * 0.01],
                [0, 0, nz],
                { tint: [0.5, 0.53, 0.5] },
              );
          for (let z = iz0 + 0.6; z < iz1; z += 0.9)
            for (const [x, nx] of [
              [ix0, 1],
              [ix1, -1],
            ])
              b.box(
                "paint_black",
                x + nx * 0.02,
                FL[f] - 0.35,
                z,
                0.04,
                0.3,
                0.25,
                { tint: [0.05, 0.04, 0.04] },
              );
          b.boxMM(
            "brick_dark",
            ix0,
            FL[f] - 0.08,
            iz0,
            ix1,
            FL[f] - 0.02,
            iz0 + 0.12,
            { tint: [0.2, 0.18, 0.16] },
          ); // soot line
        }
        // charred joists still hanging from the walls, a fallen beam, rubble drifts
        for (let k = 0; k < 6; k++) {
          const z = iz0 + 2 + k * 4.2,
            f = 1 + (k % 3);
          b.beam(
            "wood_dark",
            ix0,
            FL[f] - 0.2,
            z,
            ix0 + 1.5 + r() * 3,
            FL[f] - 1.5 - r() * 2,
            z + (r() - 0.5),
            0.22,
            0.3,
            { tint: [0.16, 0.13, 0.11] },
          );
        }
        b.beam(
          "wood_dark",
          ix1,
          FL[2] - 0.2,
          iz0 + 6,
          ix1 - 6,
          0.2,
          iz0 + 9,
          0.3,
          0.35,
          { tint: [0.18, 0.14, 0.11] },
        );
        K.rubble(b, ix1 - 1.6, 0, iz0 + 2, 1.6, 1.0, {
          seed: 701,
          tint: [0.62, 0.48, 0.42],
          col: true,
        });
        K.rubble(b, ix0 + 1.4, 0, iz0 + 3.5, 1.2, 0.7, {
          seed: 702,
          tint: [0.62, 0.48, 0.42],
          col: true,
        });
        b.burn(xm, 6, (iz0 + iz1) / 2, 9, 0.5);
        // ground: packed dirt + hay
        b.face(
          "dirt",
          ix0,
          0.02,
          iz1,
          1,
          0,
          0,
          0,
          0,
          -1,
          ix1 - ix0,
          iz1 - iz0,
          { uv: "top", tint: [0.72, 0.64, 0.5] },
        );
        ES.yard = { x0: ix0, x1: ix1, z0: iz0, z1: iz1, xm, h };
      }
    }

    // ---- the market doors (unit 1 south) + the yard carriage arch ----
    const mx = ES.ux(1) + UW / 2,
      yx = ES.ux(ES.YARD) + UW / 2;
    // market: big segmental-arched loading door, doors folded open, lit interior beyond
    // the open doorway shows the lamplit market hall (painted, additive) instead of a flat glowing sheet
    b.quadN(
      "paint_black",
      [mx - 1.7, 0, Z1 + 0.012],
      [mx + 1.7, 0, Z1 + 0.012],
      [mx + 1.7, 3.6, Z1 + 0.012],
      [mx - 1.7, 3.6, Z1 + 0.012],
      [0, 0, 1],
      { tint: [0.03, 0.025, 0.02] },
    );
    b.quad(
      "neon",
      [mx - 1.7, 0, Z1 + 0.02],
      [mx + 1.7, 0, Z1 + 0.02],
      [mx + 1.7, 3.6, Z1 + 0.02],
      [mx - 1.7, 3.6, Z1 + 0.02],
      {
        rect: K.roomView("market", 1, 256, 272),
        grime: 0,
        tint: [1.1, 1.0, 0.9],
      },
    );
    b.boxMM("brownstone", mx - 2.1, 0, Z1, mx - 1.7, 3.6, Z1 + 0.25, {
      tint: [0.72, 0.56, 0.46],
    });
    b.boxMM("brownstone", mx + 1.7, 0, Z1, mx + 2.1, 3.6, Z1 + 0.25, {
      tint: [0.72, 0.56, 0.46],
    });
    for (let k = 0; k < 7; k++) {
      const t0 = -1 + (2 * k) / 7,
        t1 = -1 + (2 * (k + 1)) / 7;
      b.beam(
        "brownstone",
        mx + t0 * 2.0,
        3.75 + 0.45 * (1 - t0 * t0),
        Z1 + 0.12,
        mx + t1 * 2.0,
        3.75 + 0.45 * (1 - t1 * t1),
        Z1 + 0.12,
        0.4,
        0.26,
        { tint: [0.7, 0.56, 0.46] },
      );
    }
    for (const e of [-1, 1])
      b.quadN(
        "shutter",
        [mx + e * 1.8, 0, Z1 + 0.05],
        [mx + e * 3.4, 0, Z1 + 0.05],
        [mx + e * 3.4, 3.5, Z1 + 0.05],
        [mx + e * 1.8, 3.5, Z1 + 0.05],
        [0, 0, 1],
        { tint: shut },
      );
    const sign = K.signCell("es_market", "EMPIRE STORES MARKET", 1024, 128, {
      bg: "#2a1a12",
      fg: "#f0d8a0",
      font: "Georgia, serif",
      border: "#c8a050",
    });
    b.plate("art", mx, 5.1, Z1 + 0.06, 0, 1, 7.6, 0.95, sign, { off: 0.02 });
    b.plate(
      "art",
      mx,
      4.35,
      Z1 + 0.06,
      0,
      1,
      5.2,
      0.45,
      K.signCell(
        "es_fair",
        "EVERY TRADE WEIGHED — FAIR WEIGHT OR YOUR SCRIP BACK",
        1024,
        88,
        { bg: "#e0d0a8", fg: "#3a1a10", font: "Georgia, serif" },
      ),
      { off: 0.03 },
    );
    const neon = K.neonCell("es_neon", "MARKET", 512, 128, {
      color: "#40ffd0",
      font: "Arial Black, sans-serif",
    });
    b.plate("neon", mx, 6.3, Z1 + 0.12, 0, 1, 3.2, 0.8, neon, { off: 0.02 });
    d.glow(mx, 6.3, Z1 + 0.4, [0.15, 0.7, 0.55], 4.5);
    for (const e of [-1, 1]) {
      b.box("black_iron", mx + e * 2.6, 3.9, Z1 + 0.3, 0.08, 0.08, 0.6);
      K.lamp(d, mx + e * 2.6, 3.7, Z1 + 0.55, "cage", [1, 0.76, 0.46], 0, 0, {
        ceil: 3.95,
        glowSize: 1.4,
      });
    }
    ES.door = new THREE.Vector3(mx, 1.3, Z1 + 0.4);
    // yard carriage arch (open, 5.2 × 5.6)
    for (let k = 0; k < 9; k++) {
      const t0 = -1 + (2 * k) / 9,
        t1 = -1 + (2 * (k + 1)) / 9;
      b.beam(
        "brownstone",
        yx + t0 * 2.75,
        5.0 + 0.7 * (1 - t0 * t0),
        Z1 + 0.14,
        yx + t1 * 2.75,
        5.0 + 0.7 * (1 - t1 * t1),
        Z1 + 0.14,
        0.5,
        0.3,
        { tint: [0.68, 0.54, 0.44] },
      );
    }
    for (const e of [-1, 1]) {
      b.boxMM(
        "brownstone",
        yx + e * 2.6 - 0.25,
        0,
        Z1 - 0.62,
        yx + e * 2.6 + 0.25,
        5.0,
        Z1 + 0.28,
        { tint: [0.7, 0.55, 0.45] },
      );
      b.quadN(
        "shutter",
        [yx + e * 2.9, 0.1, Z1 + 0.3],
        [yx + e * 2.9, 0.1, Z1 + 2.6],
        [yx + e * 2.9, 4.6, Z1 + 2.6],
        [yx + e * 2.9, 4.6, Z1 + 0.3],
        [e, 0, 0],
        { tint: shut },
      );
    }
    b.quadN(
      "paint_black",
      [yx - 2.6, 5.0, Z1 - 0.6],
      [yx + 2.6, 5.0, Z1 - 0.6],
      [yx + 2.6, 5.0, Z1 + 0.1],
      [yx - 2.6, 5.0, Z1 + 0.1],
      [0, -1, 0],
      { tint: [0.1, 0.08, 0.07] },
    );
    b.plate(
      "art",
      yx,
      6.4,
      Z1 + 0.06,
      0,
      1,
      3.6,
      0.6,
      K.signCell("es_yard", "THE YARD — OXEN · FEED · WATER", 512, 80, {
        bg: "#e0d0a8",
        fg: "#3a1a10",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );

    // ---- painted ghost sign on the river gable (unit 0 west face) ----
    const ghost = K.paint(
      "art",
      "ph2_es_ghost",
      1024,
      512,
      (x, X, Y, W, Hh) => {
        x.clearRect(X, Y, W, Hh);
        x.fillStyle = "rgba(236,228,206,0.82)";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.font = "bold 150px Georgia, serif";
        x.fillText("EMPIRE", X + W / 2, Y + 110, W * 0.94);
        x.font = "bold 150px Georgia, serif";
        x.fillText("STORES", X + W / 2, Y + 270, W * 0.94);
        x.fillRect(X + 60, Y + 350, W - 120, 8);
        x.font = "bold 56px Georgia, serif";
        x.fillText(
          "COFFEE · SUGAR · HIDES · WOOL",
          X + W / 2,
          Y + 420,
          W * 0.9,
        );
        const r2 = K.rng("ghost");
        for (let k = 0; k < 2600; k++)
          x.clearRect(X + r2() * W, Y + r2() * Hh, 2 + r2() * 12, 1 + r2() * 6);
      },
    );
    b.plate("decal", X0 - 0.02, 12.2, (Z0 + Z1) / 2, -1, 0, 16, 8, ghost, {
      off: 0.03,
    });
    for (let f = 1; f < FL.length; f++)
      for (const z of [Z0 + 4, Z0 + 10, Z1 - 10, Z1 - 4]) {
        if (f >= 2 && Math.abs(z - (Z0 + Z1) / 2) < 9) continue;
        opening(
          b,
          X0,
          FL[f] + 0.7,
          z,
          -1,
          0,
          1.0,
          1.6,
          r.pick(["shut", "shut", "void"]),
          TINT[0],
        );
      }
    for (const z of [Z0 + 4, Z1 - 4])
      opening(b, X0, 0.95, z, -1, 0, 1.8, 2.6, "shut", TINT[0]);
    for (let f = 1; f < FL.length; f++)
      for (const z of [Z0 + 5, Z1 - 5])
        opening(
          b,
          X1,
          FL[f] + 0.7,
          z,
          1,
          0,
          1.0,
          1.6,
          r.pick(["shut", "void", "open"]),
          TINT[4],
        );

    // ---- rooftops: water tower (unit 4), garden (unit 2), sniper nest (unit 1) ----
    {
      const wx = ES.ux(4) + 7,
        wz = 600,
        hy = H[4] - 0.9;
      for (const [dx, dz] of [
        [-1.3, -1.3],
        [1.3, -1.3],
        [1.3, 1.3],
        [-1.3, 1.3],
      ])
        b.beam(
          "rust",
          wx + dx,
          hy,
          wz + dz,
          wx + dx * 0.9,
          hy + 3.2,
          wz + dz * 0.9,
          0.14,
          0.14,
        );
      b.cyl("wood_rotten", wx, hy + 3.2, wz, 1.9, 1.9, 3.4, 14, {
        tint: [0.58, 0.48, 0.38],
      });
      for (let k = 0; k < 3; k++)
        b.cyl("black_iron", wx, hy + 3.6 + k * 1.1, wz, 1.93, 1.93, 0.07, 14, {
          top: false,
        });
      K.dome(
        b,
        "wood_rotten",
        wx,
        hy + 6.6,
        wz,
        1.95,
        1.1,
        0.05,
        14,
        3,
        false,
        { tint: [0.5, 0.42, 0.34] },
      );
    }
    {
      const gx0 = ES.ux(2) + 1,
        gx1 = ES.ux(3) - 1,
        hy = H[2] - 0.9;
      for (let z = Z0 + 3; z < Z1 - 3; z += 3.2) {
        d.boxMM("wood_rotten", gx0, hy, z, gx1, hy + 0.5, z + 1.4, {
          tint: [0.5, 0.42, 0.34],
        });
        d.face(
          "dirt",
          gx0,
          hy + 0.5,
          z + 1.4,
          1,
          0,
          0,
          0,
          0,
          -1,
          gx1 - gx0,
          1.4,
          { uv: "top", tint: [0.5, 0.42, 0.32] },
        );
        for (let x = gx0 + 0.4; x < gx1; x += 0.7) {
          const hh = 0.3 + r() * 0.6;
          d.geo("canvas_green", K.sphereGeo(), {
            x,
            y: hy + 0.5 + hh * 0.5,
            z: z + 0.7,
            sx: 0.28,
            sy: hh * 0.6,
            sz: 0.28,
            tint: r.pick([
              [0.42, 0.52, 0.26],
              [0.5, 0.48, 0.24],
              [0.36, 0.46, 0.22],
            ]),
          });
        }
      }
      K.stringLights(
        d,
        [
          [gx0, hy + 2.2, Z0 + 2],
          [gx1, hy + 2.2, Z1 - 2],
        ],
        { sag: 0.4 },
      );
      for (const [x, z] of [
        [gx0, Z0 + 2],
        [gx1, Z1 - 2],
      ])
        d.cyl("wood_rotten", x, hy, z, 0.06, 0.06, 2.3, 5);
    }
    {
      const sx = ES.ux(1) + 3,
        sz = Z1 - 2.2,
        hy = H[1] - 0.9;
      K.sandbags(d, sx - 1.6, sz + 1.2, sx + 1.6, sz + 1.2, hy, 0.9, {
        seed: 91,
      });
      K.sandbags(d, sx - 1.6, sz - 1.2, sx - 1.6, sz + 1.2, hy, 0.9, {
        seed: 92,
      });
      d.quadN(
        "corrugated",
        [sx - 1.8, hy + 2.3, sz + 1.4],
        [sx + 1.8, hy + 2.3, sz + 1.4],
        [sx + 1.8, hy + 2.0, sz - 1.4],
        [sx - 1.8, hy + 2.0, sz - 1.4],
        [0, 1, 0],
        { tint: [0.62, 0.5, 0.4] },
      );
      for (const [dx, dz] of [
        [-1.6, 1.3],
        [1.6, 1.3],
        [-1.6, -1.3],
        [1.6, -1.3],
      ])
        d.cyl("wood_rotten", sx + dx, hy, sz + dz, 0.05, 0.05, 2.2, 5);
      ES.sniper = new THREE.Vector3(sx, hy, sz);
    }
    b.cyl("rust", ES.ux(1) + 8, H[1] - 0.9, Z0 + 4, 0.05, 0.05, 6, 5); // antenna

    // ---------------- market street (south) ----------------
    const MZ = Z1 + 2.8;
    K.stall(d, 477.5, 0, MZ, PI, 3.6, 2.2, {
      tarp: "canvas_red",
      tarpTint: [0.66, 0.3, 0.22],
      sign: K.signCell("es_st_junk", "MOTH'S JUNK", 256, 64, {
        bg: "#e0d6bc",
        fg: "#3a1e14",
        font: "Impact, sans-serif",
      }),
      items: ["box", "can", "box"],
      seed: 81,
    });
    K.stall(d, 482.3, 0, MZ, PI, 3.2, 2.2, {
      tarp: "canvas_tarp",
      tarpTint: [0.72, 0.64, 0.46],
      sign: K.signCell("es_st_fish", "FISH · CLAMS · LURK", 256, 64, {
        bg: "#e0d6bc",
        fg: "#1a3a44",
        font: "Impact, sans-serif",
      }),
      items: ["jar", "can"],
      seed: 82,
    });
    K.stall(d, 499, 0, MZ, PI, 3.4, 2.2, {
      tarp: "canvas_green",
      tarpTint: [0.42, 0.52, 0.36],
      sign: K.signCell("es_st_veg", "POTATOES · GNARLBERRIES", 256, 64, {
        bg: "#e0d6bc",
        fg: "#2a4a1a",
        font: "Impact, sans-serif",
      }),
      items: ["jar", "box"],
      seed: 83,
    });
    K.stall(d, 522, 0, MZ, PI, 3.4, 2.2, {
      tarp: "canvas_blue",
      tarpTint: [0.36, 0.44, 0.58],
      sign: K.signCell("es_st_cloth", "COATS & BOOTS", 256, 64, {
        bg: "#e0d6bc",
        fg: "#1a2a44",
        font: "Impact, sans-serif",
      }),
      items: ["box", "box"],
      seed: 84,
    });
    // string lights across the street from the facade to poles
    for (const x of [476, 494, 504, 520]) {
      d.cyl("wood_rotten", x, 0, MZ + 3.6, 0.1, 0.09, 4.6, 6, {
        tint: [0.5, 0.42, 0.34],
      });
    }
    K.stringLights(
      d,
      [
        [474, 4.6, Z1 + 0.3],
        [476, 4.4, MZ + 3.6],
        [485, 4.9, Z1 + 0.3],
        [494, 4.4, MZ + 3.6],
        [504, 4.4, MZ + 3.6],
        [512, 5.6, Z1 + 0.3],
        [520, 4.4, MZ + 3.6],
        [527, 4.8, Z1 + 0.3],
      ],
      { sag: 0.55, deadEvery: 6 },
    );
    // barricades at both street ends with a guard post
    K.sandbags(d, 468.5, Z1 + 1, 468.5, Z1 + 3.2, 0, 1.1, { seed: 95 });
    K.sandbags(d, 531.5, Z1 + 1, 531.5, Z1 + 3.2, 0, 1.1, { seed: 96 });
    for (const x of [468.5, 531.5]) {
      d.box("rust", x, 0, Z1 + 6.4, 0.7, 1.1, 2.6, {
        tint: [0.55, 0.45, 0.38],
      });
      d.col(x - 0.35, 0, Z1 + 5.1, x + 0.35, 1.1, Z1 + 7.7, {
        tag: "barricade",
        surface: "metal",
      });
    }
    for (const [x, z] of [
      [488, MZ + 2.2],
      [509, MZ + 2.4],
    ]) {
      d.cyl("rust", x, 0, z, 0.3, 0.3, 0.9, 10, { tint: [0.55, 0.42, 0.32] });
    }
    // hand-painted rules board + the price board by the door
    const rules = K.signCell(
      "es_rules",
      "MARKET LAW\n\nWEIGH IT OR LEAVE IT\nNO SLAVERS\nNO RAIDER SCRIP\nFIGHTS OUTSIDE\n\n— H. SZABO, SCALES",
      256,
      320,
      {
        bg: "#e0d6bc",
        fg: "#3a1e14",
        font: "Georgia, serif",
        border: "#6a2a1a",
      },
    );
    b.plate("art", mx - 3.2, 2.2, Z1 + 0.06, 0, 1, 1.1, 1.4, rules, {
      off: 0.03,
    });
    b.plate(
      "decal",
      ES.ux(4) + 5,
      2.2,
      Z1 + 0.05,
      0,
      1,
      4,
      1.4,
      K.tag("UNDER THE BRIDGE", "#e8d040", 256, 96),
      { off: 0.03 },
    );
    b.plate(
      "decal",
      ES.ux(0) + 6,
      2.0,
      Z1 + 0.05,
      0,
      1,
      3,
      1.1,
      K.tag("NO SLAVERS", "#c02a20", 256, 96),
      { off: 0.03 },
    );
    d.hplate("decal", 490, 0.02, MZ + 1, 12, 6, 0.1, K.decal("grime", 50));
    d.hplate("decal", 512, 0.02, MZ + 1.5, 10, 5, 0.3, K.decal("grime", 51));

    // ---------------- the yard dressing (pen, troughs, hay, feed) ----------------
    if (ES.yard) {
      const Y = ES.yard;
      K.fence(d, Y.x0 + 1, 605, Y.x1 - 1, 605, 0, { h: 1.3, seed: 11 });
      K.fence(d, Y.x0 + 1, 605, Y.x0 + 1, Y.z1 - 3.5, 0, { h: 1.3, seed: 12 });
      K.fence(d, Y.x1 - 1, 605, Y.x1 - 1, Y.z1 - 3.5, 0, { h: 1.3, seed: 13 });
      d.box("wood", Y.xm - 2, 0, 606.2, 3.2, 0.55, 0.7, {
        tint: [0.5, 0.42, 0.3],
      });
      d.cyl("wood_rotten", Y.x1 - 2.2, 0, 612, 0.5, 0.5, 0.55, 10, {
        tint: [0.55, 0.45, 0.35],
      });
      for (let k = 0; k < 6; k++)
        d.box(
          "flat",
          Y.x0 + 1.4 + (k % 3) * 1.05,
          k > 2 ? 0.5 : 0,
          594 + (k % 2) * 0.1,
          1.0,
          0.5,
          0.6,
          { tint: [0.72, 0.62, 0.34], yaw: 0.05 * k },
        );
      for (let k = 0; k < 30; k++)
        d.box(
          "flat",
          Y.x0 + 0.5 + r() * (Y.x1 - Y.x0 - 1),
          0.03,
          605.5 + r() * 11,
          0.6,
          0.01,
          0.1,
          { yaw: r() * 3, tint: [0.75, 0.66, 0.4] },
        );
      K.crates(d, Y.x1 - 1.6, 0, 595, 0.2, 3, { col: true });
      d.cyl("rust", Y.x0 + 2.5, 0, 600.5, 0.1, 0.1, 1.2, 6);
      d.beam(
        "rust",
        Y.x0 + 2.5,
        1.2,
        600.5,
        Y.x0 + 3.1,
        1.0,
        600.5,
        0.05,
        0.05,
      ); // hand pump
      d.cyl("wood_rotten", Y.x0 + 2.5, 0, 601.3, 0.4, 0.4, 0.4, 10, {
        tint: [0.5, 0.42, 0.34],
      });
      K.lamp(d, Y.xm, 3.2, 605, "cage", [1, 0.78, 0.5], 0, 0, {
        ceil: 5.2,
        glowSize: 1.6,
      });
      d.pipe("rust", Y.x0, 5.2, 605, Y.x1, 5.2, 605, 0.02, 4);
    }

    // ---------------- loading dock (north, under the Manhattan Bridge) ----------------
    const DZ = Z0 - 2.4;
    b.boxMM("wood_rotten", X0 + 2, 0, DZ, ES.ux(3) - 1, 1.1, Z0, {
      tint: [0.52, 0.44, 0.36],
      faces: "nsewt",
    });
    b.col(X0 + 2, 0, DZ, ES.ux(3) - 1, 1.1, Z0, {
      tag: "dock",
      surface: "wood",
    });
    for (let x = X0 + 3; x < ES.ux(3) - 1; x += 3)
      K.tireFender(b, x, 0.55, DZ, 0, -1);
    for (let k = 0; k < 5; k++)
      b.boxMM(
        "concrete",
        X0 - 0.6 + k * 0.52,
        0,
        DZ,
        X0 + 2 + k * 0.0,
        0.22 * (k + 1),
        Z0,
        { tint: [0.6, 0.58, 0.54], faces: "nsewt" },
      );
    for (let k = 0; k < 5; k++)
      b.col(X0 - 0.6 + k * 0.52, 0, DZ, X0 + 2, 0.22 * (k + 1), Z0, {
        tag: "stairs",
      });
    K.crates(d, 486, 1.1, DZ + 1.1, 0.1, 3, { col: true });
    K.crates(d, 497, 1.1, DZ + 1.0, -0.3, 2, { col: true });
    d.plate(
      "art",
      490,
      3.2,
      Z0 - 0.06,
      0,
      -1,
      3.2,
      0.6,
      K.signCell("es_dock", "DOCK 2 — NO LOITERING", 512, 96, {
        bg: "#e0d6bc",
        fg: "#3a1e14",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.03 },
    );

    b.finish(root);
    const det = d.finish(root);
    G.world.addLOD(det, 180, new THREE.Vector3(500, 3, 610));
    G.scene.add(root);
    ctx.anchors.door = ES.door.clone();
  }

  // ==================================================================
  // DATA: items, quest, dialogue
  // ==================================================================
  function data() {
    K.keyFrom(
      "ph2_es_vault_key",
      'Hattie Szabo — "An Honest Weight" (given on accepting)',
    );
    K.defineItem({
      id: "ph2_es_vault_key",
      type: "key",
      name: "Empire Stores Cellar Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: "A long iron key on a loop of red cord. Hattie Szabo has worn it round her neck for eleven years.",
    });
    K.defineItem({
      id: "ph2_es_goods",
      type: "misc",
      name: "Stolen Market Goods",
      weight: 4,
      value: 0,
      quest: true,
      tags: ["quest"],
      desc: "A sack of tagged goods from the Empire Stores cellar: each bundle still wears Hattie's brass weight tag.",
    });
    K.defineItem({
      id: "ph2_es_coffee",
      type: "aid",
      name: "Empire Roast",
      weight: 0.3,
      value: 14,
      tags: ["drink"],
      mesh: "bottle_water",
      sound: "drink",
      effects: { stamina: 20, attrs: { senses: 1 }, duration: 240 },
      desc: 'Roasted "coffee" from the Empire Roastery: chicory, burnt potato, a few real beans from a sealed 1967 sack, and a lot of optimism.',
    });
    K.defineItem({
      id: "ph2_es_scale_weight",
      type: "misc",
      name: "Certified Brass Weight (1 lb)",
      weight: 1,
      value: 60,
      tags: ["valuable", "unique"],
      desc: "A brass pound weight stamped N.Y.C. DEPT. OF WEIGHTS & MEASURES — CERTIFIED 1961. In a world with no honest anything, this is honest.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph2_honest_weight",
        name: "Honest Weight",
        giver: "Hattie Szabo",
        location: "Empire Stores",
        desc: "Goods keep vanishing from the Empire Stores market cellar — and its lock has never been picked. Hattie Szabo wants the thief found before the traders stop trusting her scale.",
        stages: [
          {
            id: "cellar",
            text: "Search the market cellar below the Empire Stores.",
            markers: [
              () => {
                const a = PV.anchor("empire_stores", "cellar");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Market cellar",
                      interior: "empire_stores",
                    }
                  : null;
              },
            ],
          },
          {
            id: "confront",
            text: "Confront Gaffney, the night watchman.",
            markers: [{ npc: "ph2_pike", label: "Gaffney" }],
          },
          {
            id: "report",
            text: "Tell Hattie Szabo what you found.",
            markers: [{ npc: "ph2_hattie", label: "Hattie" }],
          },
        ],
        rewards: { xp: 300 },
      });
    }
    // Stage sync (quest audit): the cache may be found — or Gaffney killed / talked round — before or out of order
    // with Hattie's quest. Bring the stage up to what the player has already done so it can always be finished.
    PV.esSync = function () {
      const q = K.q,
        id = "ph2_honest_weight";
      if (!q.active(id)) return;
      if (q.stage(id) === "cellar" && PV.flag("es_cache"))
        q.set(id, "confront");
      if (
        q.stage(id) === "confront" &&
        (PV.flag("es_pike_dead") || PV.flag("es_pike_confessed"))
      )
        q.set(id, "report");
    };
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q,
      S = PV;
    G.dialogue.register("ph2_dlg_hattie", {
      start: () => {
        if (q.done("ph2_honest_weight"))
          return S.flag("es_cut") ? "fooled" : "after";
        if (q.active("ph2_honest_weight"))
          return q.stage("ph2_honest_weight") === "report" ? "report" : "wait";
        return S.flag("es_met_hattie") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Hattie Szabo",
          onEnter: () => S.setFlag("es_met_hattie", true),
          text: "[A lean grey-haired woman in a leather apron, sleeves rolled, a brass weight on a chain around her neck. She is adjusting the counterpoise of an enormous platform scale.] Welcome to the Empire Stores. Everything that changes hands in this building gets weighed on that scale — certified, 1961, by the City of New York. You want to trade, you trade honest.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Why does weight matter so much?", next: "why" },
            { text: "You look worried.", next: "worry" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Hattie Szabo",
          text: "Scale's balanced. What do you need?",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            {
              text: "Anything I can help with?",
              next: "worry",
              cond: () => !q.started("ph2_honest_weight"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        why: {
          speaker: "Hattie Szabo",
          text: "Because scrip is just paper and everybody lies. A pound is a pound. Traders come from Whitehall and the Bronx and the Jersey flats because in this building, a pound of meat is a pound of meat. Take that away and we're just another raider camp with nicer bricks.",
          responses: [{ text: "Makes sense.", next: "again" }],
        },
        worry: {
          speaker: "Hattie Szabo",
          text: "[She lowers her voice.] Things are going missing from the cellar downstairs. Consignments. A crate of Rally Tonic, forty pounds of jerky, a gold wristwatch — somebody's grandfather's watch. The lock's never been touched. Only key is round my neck. If the traders find out the cellar leaks, the scale means nothing.",
          responses: [
            { text: "I'll find your thief.", next: "yes" },
            {
              text: "[Senses 7] Only key's round your neck... or only door is locked?",
              check: { attr: "senses", value: 7 },
              next: "door",
              failNext: "yes",
            },
            { text: "Not my business.", end: true },
          ],
        },
        door: {
          speaker: "Hattie Szabo",
          text: "[She stops.] ...The cellar's an old coffee store. There's drains. Old coal chutes. Huh. Here — take the key. Look at the floor, not the door.",
          responses: [{ text: "On it.", next: "yes" }],
        },
        yes: {
          speaker: "Hattie Szabo",
          learn: "ph2_lk_es_ledger",
          text: "Here. [She lifts the key over her head and holds it out, and doesn't let go right away.] The cellar's down the stairs in the west bay. My ledger in the scale house answers to TOLERANCE, if you want the losses in black and white. Bring me a name. Bring me proof. There's two hundred scrip and my thanks in it — and my thanks weighs more.",
          onEnter: () => {
            if (!K.has("ph2_es_vault_key")) K.give("ph2_es_vault_key", 1);
            q.start("ph2_honest_weight");
            PV.esSync();
          },
          responses: [{ text: "I'll be back.", end: true }],
        },
        wait: {
          speaker: "Hattie Szabo",
          text: "Anything? Don't tell me it's ghosts. I don't charge ghosts rent.",
          responses: [
            { text: "Still looking.", end: true },
            { text: "Let's trade while I'm here.", barter: true, end: true },
          ],
        },
        report: {
          speaker: "Hattie Szabo",
          text: () =>
            S.flag("es_pike_confessed")
              ? "Gaffney told me. Came up here with his hat in his hands and the goods in a sack. Eleven years he's walked these floors for me. [She is quiet a while.] You did right. So did he, in the end."
              : S.flag("es_pike_dead")
                ? "Gaffney. Gaffney, of all people. [She looks at the sack of tagged goods, then away.] I heard the shots. Well. The scale is honest again."
                : "You found it? Show me.",
          responses: [
            {
              text: "Here are your goods.",
              next: "paid",
              cond: () => K.has("ph2_es_goods") || S.flag("es_pike_confessed"),
            },
            {
              text: "Not yet.",
              end: true,
              cond: () =>
                !(K.has("ph2_es_goods") || S.flag("es_pike_confessed")),
            },
          ],
        },
        paid: {
          speaker: "Hattie Szabo",
          text: "Two hundred scrip, as promised. And this — [she unclips one of the brass weights from her chain] — certified, 1961. Anyone in the Ruins asks if you're honest, show them that. And you get the trader's rate in my market from now on.",
          onEnter: () => {
            if (!q.active("ph2_honest_weight")) return;
            if (K.has("ph2_es_goods"))
              K.take("ph2_es_goods", K.has("ph2_es_goods") ? 1 : 0);
            K.scrip(200);
            K.give("ph2_es_scale_weight", 1);
            K.standing(25, "Honest Weight");
            S.setFlag("es_discount", true);
            q.complete("ph2_honest_weight");
          },
          responses: [{ text: "Thanks, Hattie.", end: true }],
        },
        after: {
          speaker: "Hattie Szabo",
          text: "Scale's honest, cellar's dry, and the traders are back. Trader's rate for you, friend.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        fooled: {
          speaker: "Hattie Szabo",
          text: "Whatever it was, it stopped. Ghosts, I suppose. [She doesn't look at you when she says it.]",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
    G.dialogue.register("ph2_dlg_pike", {
      start: () => {
        if (S.flag("es_pike_confessed")) return "after";
        if (q.done("ph2_honest_weight") && S.flag("es_cut")) return "hello";
        if (
          (q.active("ph2_honest_weight") &&
            q.stage("ph2_honest_weight") === "confront") ||
          (!q.done("ph2_honest_weight") && K.has("ph2_es_goods"))
        )
          return "caught";
        return "hello";
      },
      nodes: {
        hello: {
          speaker: "Gaffney",
          text: "[A heavyset man in a watchman's coat, lantern at his belt, yawning.] Night watch. Sleep days, walk nights. Walk the cellar, walk the yard, walk the roof. Nothing ever happens. That's the job.",
          responses: [{ text: "Sounds peaceful.", end: true }],
        },
        caught: {
          speaker: "Gaffney",
          text: "[He sees the tagged bundles — or the look on your face — and sits down heavily on his bunk.] ...You found the drain.",
          responses: [
            { text: "Why, Gaffney?", next: "why" },
            {
              text: "[Persuasion 50] Hattie trusts you. Put it back and tell her yourself.",
              check: { skill: "persuasion", value: 50 },
              next: "confess",
              failNext: "confess_fail",
            },
            {
              text: "[Trade 40] Or... you cut me in and I never saw a thing.",
              check: { skill: "trade", value: 40 },
              next: "cut",
              failNext: "cut_fail",
            },
            { text: "Thief. [Attack]", next: "fight" },
          ],
        },
        why: {
          speaker: "Gaffney",
          text: "My girl's in Whitehall. Doc Ferris says her lungs are going — dust, rads, who knows. He's got medicine, real old-world, costs more than I make in a year of walking. So I walked a little further. Down the drain. Just a little each week. Nobody weighs what's already gone.",
          responses: [
            {
              text: "[Persuasion 50] Then tell Hattie. She'd help.",
              check: { skill: "persuasion", value: 50 },
              next: "confess",
              failNext: "confess_fail",
            },
            { text: "That's not my problem.", next: "fight" },
            { text: "I'll think about it.", end: true },
          ],
        },
        confess: {
          speaker: "Gaffney",
          text: "[A long breath.] Yeah. Yeah, she would. That's the worst part. [He stands, takes his hat.] I'll bring it all up. Every pound. You tell her I came on my own feet, alright?",
          onEnter: () => {
            S.setFlag("es_pike_confessed", true);
            K.standing(20, "Gaffney confessed");
            K.xp(100, "Talked Gaffney into confessing");
            if (!q.started("ph2_honest_weight")) q.start("ph2_honest_weight");
            if (q.active("ph2_honest_weight"))
              q.set("ph2_honest_weight", "report");
          },
          responses: [{ text: "I will.", end: true }],
        },
        confess_fail: {
          speaker: "Gaffney",
          text: "Tell her? And lose the job, and the bunk, and the medicine? No. No, I don't think so.",
          responses: [
            { text: "Then I will.", end: true },
            { text: "Wrong answer. [Attack]", next: "fight" },
          ],
        },
        cut: {
          speaker: "Gaffney",
          text: "[He looks at you for a long moment, then digs under the mattress.] Hundred scrip. And you never saw the drain. We never met.",
          onEnter: () => {
            S.setFlag("es_cut", true);
            K.scrip(100);
            K.standing(-30, "Took Gaffney's hush money");
            if (K.has("ph2_es_goods")) K.take("ph2_es_goods", 1);
            if (q.active("ph2_honest_weight")) q.complete("ph2_honest_weight");
          },
          responses: [{ text: "Never met.", end: true }],
        },
        cut_fail: {
          speaker: "Gaffney",
          text: "Cut you in? I'm barely cutting ME in. Get out of my bunk.",
          responses: [{ text: "Fine.", end: true }],
        },
        fight: {
          speaker: "Gaffney",
          text: "Eleven years. Eleven years and nobody ever looked at the floor. [He reaches for his rifle.]",
          onEnter: () => {
            const a = G.actors.get && G.actors.get("ph2_pike");
            if (a && a.setHostile) a.setHostile(true);
          },
          responses: [{ text: "[Fight]", end: true }],
        },
        after: {
          speaker: "Gaffney",
          text: "Hattie docked me half pay and gave my girl the medicine anyway. Out of her own share. [He shakes his head.] Honest weight.",
          responses: [{ text: "Take care, Gaffney.", end: true }],
        },
      },
    });
    G.dialogue.register("ph2_dlg_bean", {
      start: () => "hello",
      nodes: {
        hello: {
          speaker: "Bean Okonkwo",
          text: "[A tall man with a burn-scarred forearm, feeding the roaster drum from a burlap sack. The whole bay smells of scorched chicory.] Welcome to the Empire Roastery. This building held more coffee than anywhere in America once. Now it holds me, and the last forty pounds of real beans in New York. Want a cup?",
          responses: [
            { text: "Pour me one.", barter: true, end: true },
            { text: "Real coffee? Where from?", next: "beans" },
            { text: "Later.", end: true },
          ],
        },
        beans: {
          speaker: "Bean Okonkwo",
          text: "Sealed sacks in the back of the coffee cellar — nitrogen-packed, 1967 stamp, Brazilian. Found 'em behind a false wall the week I got here. I cut every pound with chicory and potato so they last. When the beans run out... [He shrugs.] Then it's potato. Everything is always potato eventually.",
          responses: [{ text: "I'll take a cup.", barter: true, end: true }],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  function spawn(ctx) {
    const A = ctx.anchors,
      S = PV,
      disc = S.flag("es_discount") ? 0.85 : 1.0;
    const general = K.stock(
      [
        ["scrap_metal", 12],
        ["duct_tape", 4],
        ["tuff_bond", 2],
        ["scrap_electronics", 4],
        ["dry_cell", 2],
      ],
      "merchant_general",
      5,
    );
    const junk = K.stock(
      [
        ["tin_can", 6],
        ["scrap_metal", 8],
        ["gas_igniter", 2],
        ["relay_board", 1],
        ["vacuum_tube", 3],
      ],
      "junk_valuable",
      4,
    );
    const arms = K.stock(
      [
        ["ammo_10mm", 50],
        ["ammo_12ga", 24],
        ["ammo_556", 30],
        ["ammo_308", 16],
        ["sawed_off_shotgun", 1],
        ["hunting_rifle", 1],
        ["lead_pipe", 1],
        ["combat_knife", 1],
      ],
      "merchant_arms",
      5,
    );
    const cloth = K.stock(
      [
        ["leather_armor", 1],
        ["merc_outfit", 1],
        ["drifter_coat", 2],
        ["biker_leathers", 1],
      ],
      "apparel_common",
      4,
    );
    const bar = K.stock(
      [
        ["ph2_es_coffee", 8],
        ["beer", 6],
        ["purified_water", 5],
        ["shellback_cakes", 4],
        ["ox_meat", 3],
        ["fizzo_cola", 4],
      ],
      "merchant_food",
      4,
    );
    if (A.hattie)
      PV.spawnActor(ctx, {
        id: "ph2_hattie",
        type: "human",
        gender: "f",
        outfit: "merchant",
        hair: "bun",
        hairColor: 0x9a968e,
        name: "Hattie Szabo",
        faction: "settlers",
        level: 12,
        essential: true,
        age: 0.75,
        pos: v(A.hattie),
        yaw: A.hattie.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.2,
        dialogue: "ph2_dlg_hattie",
        merchant: {
          scrip: 1100,
          stock: general,
          restock: 2,
          priceMult: 1.0 * disc,
        },
        barks: [
          "Weigh it or leave it.",
          "A pound is a pound.",
          "Scale's balanced.",
          "No raider scrip in my market.",
        ],
      });
    if (A.moth)
      PV.spawnActor(ctx, {
        id: "ph2_moth",
        type: "human",
        gender: "m",
        outfit: "survivor",
        hair: "mohawk",
        name: "Moth",
        faction: "settlers",
        level: 5,
        pos: v(A.moth),
        yaw: A.moth.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.0,
        merchant: {
          scrip: 300,
          stock: junk,
          restock: 2,
          priceMult: 1.05 * disc,
        },
        barks: [
          "Junk's just treasure that hasn't met the right person.",
          "Every screw has a story.",
          "Don't touch the toaster. It knows things.",
        ],
      });
    if (A.boomer)
      PV.spawnActor(ctx, {
        id: "ph2_boomer",
        type: "human",
        gender: "m",
        outfit: "combat_armor",
        hair: "buzz",
        beard: "full",
        name: '"Boomer" Reyes',
        faction: "settlers",
        level: 9,
        pos: v(A.boomer),
        yaw: A.boomer.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.0,
        merchant: {
          scrip: 600,
          stock: arms,
          restock: 2,
          priceMult: 1.1 * disc,
        },
        barks: [
          "Guns, ammo, bad advice.",
          "That rifle's older than your grandma's grandma. Shoots straighter too.",
          "No live fire in the market.",
        ],
      });
    if (A.dolores)
      PV.spawnActor(ctx, {
        id: "ph2_dolores",
        type: "human",
        gender: "f",
        outfit: "leather_armor",
        hair: "long",
        name: "Dolores Fisk",
        faction: "settlers",
        level: 7,
        pos: v(A.dolores),
        yaw: A.dolores.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.0,
        merchant: {
          scrip: 450,
          stock: cloth,
          restock: 2,
          priceMult: 1.05 * disc,
        },
        barks: [
          "Oxhide, double-stitched.",
          "That coat's got holes. Bullet holes. Yours, I hope not.",
          "Try it on. Mirror's cracked, you look great.",
        ],
      });
    if (A.bean)
      PV.spawnActor(ctx, {
        id: "ph2_bean",
        type: "human",
        gender: "m",
        outfit: "settler",
        hair: "short",
        name: "Bean Okonkwo",
        faction: "settlers",
        level: 6,
        skinTone: 0.85,
        pos: v(A.bean),
        yaw: A.bean.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.2,
        dialogue: "ph2_dlg_bean",
        merchant: { scrip: 350, stock: bar, restock: 1, priceMult: 1.0 * disc },
        barks: [
          "Fresh roast!",
          "Chicory, potato and hope.",
          "Mind the drum, it's hot.",
        ],
      });
    if (A.pike && !S.flag("es_pike_dead"))
      PV.spawnActor(ctx, {
        id: "ph2_pike",
        type: "human",
        gender: "m",
        outfit: "survivor",
        hair: "balding",
        beard: "full",
        name: "Gaffney",
        faction: "settlers",
        level: 8,
        pos: v(A.pike),
        yaw: A.pike.yaw || 0,
        ai: "sit",
        home: "here",
        homeR: 0.5,
        dialogue: "ph2_dlg_pike",
        weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
        noRespawn: true,
        onDeath: () => {
          S.setFlag("es_pike_dead", true);
          if (
            K.q.active("ph2_honest_weight") &&
            K.q.stage("ph2_honest_weight") !== "cellar"
          )
            K.q.set("ph2_honest_weight", "report");
          else if (PV.esSync) PV.esSync();
        },
        barks: [
          "Sleep days, walk nights.",
          "Nothing ever happens.",
          "[snoring]",
        ],
      });
    // guards: street, door, roof
    [
      ["ph2_es_guard1", "guard1", "Market Guard", "m"],
      ["ph2_es_guard2", "guard2", "Market Guard", "f"],
      ["ph2_es_guard3", "guard3", "Roof Watch", "m"],
    ].forEach(([id, an, name, g], i) => {
      const a = A[an];
      if (!a) return;
      PV.spawnActor(ctx, {
        id,
        type: "human",
        gender: g,
        outfit: i === 2 ? "combat_armor" : "leather_armor",
        hair: "short",
        name,
        faction: "settlers",
        level: 8,
        pos: v(a),
        yaw: a.yaw || 0,
        ai: i === 2 ? "static" : "guard",
        home: "here",
        homeR: i === 2 ? 0.5 : 5,
        weapon: K.itemExists(i === 2 ? "hunting_rifle" : "10mm_pistol")
          ? i === 2
            ? "hunting_rifle"
            : "10mm_pistol"
          : undefined,
        barks: [
          "Fights outside the barricade.",
          "Market's open.",
          "Hattie's in the Scale House.",
          "Watch your pockets. Watch everybody's pockets.",
        ],
      });
    });
    // shoppers / idlers
    [
      ["ph2_es_s1", "shop1", "Scavenger", "f"],
      ["ph2_es_s2", "shop2", "Scavenger", "m"],
      ["ph2_es_s3", "shop3", "Settler", "m"],
    ].forEach(([id, an, name, g]) => {
      const a = A[an];
      if (!a) return;
      PV.spawnActor(ctx, {
        id,
        type: "human",
        gender: g,
        outfit: g === "f" ? "settler" : "survivor",
        hair: g === "f" ? "ponytail" : "short",
        name,
        faction: "settlers",
        level: 4,
        pos: v(a),
        yaw: a.yaw || 0,
        ai: an === "shop3" ? "sit" : "wander",
        home: "here",
        homeR: an === "shop3" ? 0.4 : 5,
        barks: [
          "How much for the toaster?",
          "Hattie's scale is honest, they say.",
          "Bridge is out again.",
          "Smells like coffee in here. Real coffee.",
        ],
      });
    });
  }

  PV.define({
    id: "empire_stores",
    name: "Empire Stores",
    interior: "empire_stores",
    order: 30,
    build(ctx) {
      exterior(ctx);
      const Z1 = ES.Z1;
      const wa = (name, x, y, z, yaw) => {
        const p = new THREE.Vector3(x, y, z);
        p.yaw = yaw || 0;
        ctx.anchors[name] = p;
        return p;
      };
      wa("guard1", 486, 0, Z1 + 3.2, PI);
      wa("guard2", 530, 0, Z1 + 2.4, -HP);
      if (ES.sniper) wa("guard3", ES.sniper.x, ES.sniper.y, ES.sniper.z, PI);
      wa("shop1", 480, 0, Z1 + 5.5, 0);
      wa("shop2", 500, 0, Z1 + 5.2, 0);
      if (PV.esInterior) PV.esInterior(ctx);
      const wl = (type, x, y, z, yaw, o) =>
        K.loot(
          ctx,
          type,
          x,
          y,
          z,
          yaw || 0,
          Object.assign({ world: true }, o || {}),
        );
      wl("barrel", 488, 0, Z1 + 5, 0, { burning: true, container: false });
      wl("barrel", 509, 0, Z1 + 5.2, 0, { burning: true, container: false });
      wl("fizzo_machine", 495.6, 0, Z1 + 0.5, 0);
      wl("dumpster", 474.5, 0, ES.Z0 - 4, PI, { loot: "dumpster" });
      wl("crate", ES.yard ? ES.yard.x1 - 1.4 : 515, 0, 598, 0.3, {
        kind: "plain",
        loot: "crate",
      });
    },
    data,
    spawn,
  });
})();
