// play-inline-144 04 — math
// Lines 681-1013 of readable/play-inline-144.pretty.js (statement-aligned).
  LB.addBuilder(
    "bow_bridge",
    function (LB, site, root) {
      // Calvert Vaux's cast-iron Bow Bridge: a shallow bowed iron span (cream paint, flaking to rust) between granite
      // abutments, fascia of stacked rings between the arch rib and the deck, the interlaced-ring railing with its
      // urn planters. The lake here is wider than the real one, so granite causeways carry the approaches and the
      // iron bow keeps its real, readable proportion (≈38 m span, 2.6 m rise).
      const b = LB.batch("bow_bridge");
      const anchors = {};
      const X = -20,
        ZA = -582,
        ZB = -648,
        W = 3.6,
        RISE = 2.6;
      const hA = LB.terrain(X, ZA + 2),
        hB = LB.terrain(X, ZB - 2);
      const zS = ZA - 13,
        zN = ZB + 13; // abutment faces (south / north)
      const hS = Math.max(hA, hB, -0.2) + 0.55; // springing deck level
      b.ground = -1.2;
      b.aoH = 2;
      const deckAt = (z) => {
        if (z >= zS)
          return hA + (hS - hA) * LB.smooth(0, 1, (ZA - z) / (ZA - zS)) + 0.05;
        if (z <= zN)
          return hB + (hS - hB) * LB.smooth(0, 1, (z - ZB) / (zN - ZB)) + 0.05;
        return hS + RISE * Math.sin((Math.PI * (zS - z)) / (zS - zN)) + 0.05;
      };
      const ribAt = (z) =>
        hS - 1.8 + (RISE + 1.0) * Math.sin((Math.PI * (zS - z)) / (zS - zN));
      const inSpan = (z) => z < zS && z > zN;
      const L = ZA - ZB,
        N = 60,
        dz = L / N;
      const cream = "paint_cream";
      const r = LB.rng("bow_bridge");
      for (let i = 0; i < N; i++) {
        const z0 = ZA - dz * i,
          z1 = z0 - dz,
          zm = (z0 + z1) / 2;
        const y0 = deckAt(z0),
          y1 = deckAt(z1),
          ym = (y0 + y1) / 2;
        const ang = Math.atan2(y1 - y0, z0 - z1);
        b.add("planks", new THREE.BoxGeometry(W, 0.16, dz + 0.02), {
          m: LB.m4(X, ym - 0.08, zm, 0, ang),
          grime: 0.5,
          noAO: true,
        });
        if (inSpan(zm)) {
          for (const s of [-1, 1]) {
            // deck fascia girder + the bowed arch rib below it
            b.add(cream, new THREE.BoxGeometry(0.22, 0.62, dz + 0.02), {
              m: LB.m4(X + s * (W / 2 + 0.05), ym - 0.42, zm, 0, ang),
              grime: 0.55,
              noAO: true,
            });
            const ra = ribAt(Math.min(z0, zS)),
              rb = ribAt(Math.max(z1, zN));
            b.beam(
              cream,
              V(X + s * (W / 2 - 0.05), ra, Math.min(z0, zS)),
              V(X + s * (W / 2 - 0.05), rb, Math.max(z1, zN)),
              0.26,
              0.34,
              { noAO: true, grime: 0.6 },
            );
          }
          // cross girders under the deck
          if (i % 3 === 0)
            b.box("iron", X, ribAt(zm) + 0.1, zm, W - 0.2, 0.16, 0.16, {
              seg: false,
            });
        } else {
          // granite causeway under the approach deck
          const top = Math.min(y0, y1) - 0.17;
          b.boxMM(
            "granite",
            X - W / 2 - 0.55,
            -3,
            Math.min(z0, z1),
            X + W / 2 + 0.55,
            top,
            Math.max(z0, z1),
            { grime: 0.75, seg: false },
          );
          LB.colMM(
            X - W / 2 - 0.55,
            -3,
            Math.min(z0, z1),
            X + W / 2 + 0.55,
            top,
            Math.max(z0, z1),
            { walkable: false },
          );
          for (const s of [-1, 1])
            b.add("granite", new THREE.BoxGeometry(0.4, 0.3, dz + 0.02), {
              m: LB.m4(X + s * (W / 2 + 0.45), ym - 0.2, zm, 0, ang),
              grime: 0.6,
            });
        }
        // walkable deck slab (≤ 0.1 m rise per piece)
        LB.col(X, zm, W, dz + 0.05, Math.max(y0, y1) - 0.8, ym, 0, {
          surface: inSpan(zm) ? "metal" : "concrete",
        });
      }
      // fascia: stacked rings filling the spandrel between the arch rib and the deck girder (the bridge's signature)
      for (const s of [-1, 1]) {
        let z = zS - 0.2;
        while (z > zN + 0.2) {
          const gap = deckAt(z) - 0.73 - ribAt(z) - 0.17;
          const rr = Math.min(0.55, gap * 0.46);
          if (rr < 0.12) {
            z -= 0.4;
            continue;
          }
          const yc = ribAt(z) + 0.17 + gap / 2;
          b.add(cream, new THREE.TorusGeometry(rr, 0.045, 3, 12), {
            m: LB.m4(X + s * (W / 2 + 0.05), yc, z - rr, Math.PI / 2),
            grime: 0.5,
            noAO: true,
          });
          z -= rr * 2 + 0.06;
        }
      }
      // granite abutments at the springing (pier blocks with coping, cutwater nosing into the lake)
      for (const [zf, dir] of [
        [zS, 1],
        [zN, -1],
      ]) {
        b.boxMM(
          "granite",
          X - W / 2 - 1.1,
          -3,
          Math.min(zf, zf + dir * 2.4),
          X + W / 2 + 1.1,
          hS - 0.12,
          Math.max(zf, zf + dir * 2.4),
          { grime: 0.7 },
        );
        LB.colMM(
          X - W / 2 - 1.1,
          -3,
          Math.min(zf, zf + dir * 2.4),
          X + W / 2 + 1.1,
          hS - 0.12,
          Math.max(zf, zf + dir * 2.4),
          { walkable: false },
        );
        for (const s of [-1, 1]) {
          b.box(
            "granite",
            X + s * (W / 2 + 0.75),
            -3,
            zf + dir * 1.2,
            1.3,
            hS + 3 + 0.2,
            2.2,
            { seg: false, grime: 0.7 },
          );
          b.box(
            "granite",
            X + s * (W / 2 + 0.75),
            hS + 0.2,
            zf + dir * 1.2,
            1.5,
            0.22,
            2.4,
            { seg: false, grime: 0.5 },
          );
          // urn planter on the pier (dead shrub)
          b.lathe(
            cream,
            [
              [0.12, 0],
              [0.35, 0.12],
              [0.5, 0.5],
              [0.34, 0.72],
              [0.56, 0.84],
              [0.5, 0.9],
            ],
            10,
            X + s * (W / 2 + 0.75),
            hS + 0.42,
            zf + dir * 1.2,
            { grime: 0.6 },
          );
          b.rock(
            "dirt",
            X + s * (W / 2 + 0.75),
            hS + 1.22,
            zf + dir * 1.2,
            0.4,
            { flat: 0.4 },
          );
          for (let k = 0; k < 3; k++)
            b.rod(
              "bark",
              V(X + s * (W / 2 + 0.75), hS + 1.25, zf + dir * 1.2),
              V(
                X + s * (W / 2 + 0.75) + (r() - 0.5) * 0.8,
                hS + 1.9 + r() * 0.5,
                zf + dir * 1.2 + (r() - 0.5) * 0.8,
              ),
              0.03,
              4,
              { r2: 0.01 },
            );
          LB.col(
            X + s * (W / 2 + 0.75),
            zf + dir * 1.2,
            1.3,
            2.2,
            -3,
            hS + 1.4,
            0,
            { walkable: false },
          );
        }
      }
      // railings: posts with ball finials, top & bottom rails, interlaced rings between (cream paint over rust)
      for (const s of [-1, 1]) {
        const xs = X + s * (W / 2 + 0.05);
        const RN = Math.round(L / 0.44);
        for (let i = 0; i < RN; i++) {
          const za = ZA - (L * i) / RN,
            zb = ZA - (L * (i + 1)) / RN;
          const ya = deckAt(za),
            yb = deckAt(zb);
          b.beam(cream, V(xs, ya + 1.0, za), V(xs, yb + 1.0, zb), 0.08, 0.1, {
            noAO: true,
            grime: 0.5,
          });
          b.beam(
            cream,
            V(xs, ya + 0.14, za),
            V(xs, yb + 0.14, zb),
            0.06,
            0.06,
            { noAO: true, grime: 0.6 },
          );
          // two overlapping ring rows → the interlaced pattern
          const zm = (za + zb) / 2,
            ym = (ya + yb) / 2;
          if (!(r() < 0.04))
            b.add(cream, new THREE.TorusGeometry(0.3, 0.022, 3, 10), {
              m: LB.m4(xs, ym + 0.57, zm, Math.PI / 2),
              grime: 0.45,
              noAO: true,
            });
          if (i % 5 === 0) {
            b.box(cream, xs, ya, za, 0.12, 1.12, 0.12, {
              seg: false,
              grime: 0.5,
            });
            b.sphere(cream, xs, ya + 1.2, za, 0.08, { ws: 6, hs: 4 });
          }
        }
        // railing colliders (per deck piece)
        for (let i = 0; i < N; i++) {
          const z0 = ZA - dz * i,
            z1 = z0 - dz,
            y0 = deckAt(z0),
            y1 = deckAt(z1);
          LB.col(
            xs,
            (z0 + z1) / 2,
            0.25,
            dz + 0.05,
            Math.min(y0, y1) - 0.3,
            Math.max(y0, y1) + 1.05,
            0,
            { walkable: false },
          );
        }
        // end posts with urn planters on the banks
        for (const [z, y] of [
          [ZA, deckAt(ZA)],
          [ZB, deckAt(ZB)],
        ]) {
          b.box(cream, xs, y - 0.1, z, 0.5, 1.3, 0.5, {
            seg: false,
            grime: 0.6,
          });
          b.lathe(
            cream,
            [
              [0.1, 0],
              [0.35, 0.15],
              [0.45, 0.5],
              [0.3, 0.7],
              [0.5, 0.8],
            ],
            10,
            xs,
            y + 1.2,
            z,
            { grime: 0.6 },
          );
          b.rock("dirt", xs, y + 1.9, z, 0.35, { flat: 0.5 });
        }
      }
      // stone landings at both ends
      for (const [z, h] of [
        [ZA + 1.5, hA],
        [ZB - 1.5, hB],
      ]) {
        b.boxMM(
          "granite",
          X - W / 2 - 1,
          -3,
          z - 2,
          X + W / 2 + 1,
          h + 0.05,
          z + 2,
          { grime: 0.7, ground: -1.2 },
        );
        LB.colMM(X - W / 2 - 1, -3, z - 2, X + W / 2 + 1, h + 0.05, z + 2);
      }
      anchors.north_end = V(X, hB, ZB - 3);
      anchors.south_end = V(X, hA, ZA + 3);
      anchors.center = V(X, deckAt((ZA + ZB) / 2), (ZA + ZB) / 2);
      anchors.entrance = anchors.south_end.clone();
      const g = b.build(root, { noLOD: true });
      g.name = "bow_bridge";
      LB.register("bow_bridge", g, anchors);
    },
    61,
  );

  // =====================================================================
  // BELVEDERE CASTLE
  // =====================================================================
