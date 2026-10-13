// play-inline-257 04 — grime
// Lines 616-939 of readable/play-inline-257.pretty.js (statement-aligned).
  function tower(b, T) {
    const top = M.tTop;
    for (const lz of M.legs) {
      // tapering built-up leg in five banded stages
      const stages = 6,
        y0 = 12,
        y1 = top - 2;
      for (let i = 0; i < stages; i++) {
        const ya = y0 + ((y1 - y0) * i) / stages,
          yb = y0 + ((y1 - y0) * (i + 1)) / stages,
          k = i / stages;
        const wx = 3.4 - k * 0.8,
          wz = 4.4 - k * 0.8;
        b.box("mb_blue", T, ya, lz, wx, yb - ya, wz, {
          seg: false,
          grime: 0.45,
        });
        b.box("mb_blue_dk", T, yb - 0.5, lz, wx + 0.25, 0.5, wz + 0.25, {
          seg: false,
          grime: 0.5,
        }); // band
        for (const s of [-1, 1])
          b.box("mb_blue_dk", T + (s * wx) / 2, ya, lz, 0.2, yb - ya, 0.6, {
            seg: false,
          }); // vertical ribs
        for (const s of [-1, 1])
          b.box("mb_blue_dk", T, ya, lz + (s * wz) / 2, 0.6, yb - ya, 0.2, {
            seg: false,
          });
      }
      // saddle housing + globe finial
      b.box("mb_blue", T, y1, lz, 3.2, 3.0, 4.4, { seg: false, grime: 0.4 });
      b.box("mb_blue_dk", T, y1 + 3.0, lz, 3.6, 0.5, 4.8, { seg: false });
      b.cyl("mb_blue", T, y1 + 3.5, lz, 0.9, 1.3, 1.6, 12, { hSeg: 1 });
      b.sphere("mb_blue", T, y1 + 6.1, lz, 1.2, { ws: 14, hs: 10 });
      b.cyl("mb_blue_dk", T, y1 + 7.2, lz, 0.05, 0.25, 1.4, 8, { hSeg: 1 });
      PF.col(T, lz, 3.6, 4.6, 12, top, 0, {
        walkable: false,
        surface: "metal",
      });
    }
    // X-bracing between the legs (below the deck and above the traffic portal)
    const zi0 = M.legs[0] + 2.0,
      zi1 = M.legs[1] - 2.0;
    const lv = [12.5, 19, 30, 40, 50, 58];
    for (let i = 0; i < lv.length - 1; i++) {
      if (lv[i] === 19) continue; // keep the roadway portal open
      for (const dx of [-1.2, 1.2]) {
        BK.laced(
          b,
          "mb_blue",
          V3(T + dx, lv[i], zi0),
          V3(T + dx, lv[i + 1], zi1),
          0.8,
          0.6,
          BK.perpUp(V3(T, lv[i], zi0), V3(T, lv[i + 1], zi1), XA),
          { flange: 0.16, laceKey: "mb_blue_dk" },
        );
        BK.laced(
          b,
          "mb_blue",
          V3(T + dx, lv[i], zi1),
          V3(T + dx, lv[i + 1], zi0),
          0.8,
          0.6,
          BK.perpUp(V3(T, lv[i], zi1), V3(T, lv[i + 1], zi0), XA),
          { flange: 0.16, laceKey: "mb_blue_dk" },
        );
      }
    }
    for (const y of [12.5, 30, 40, 50, 58])
      for (const dx of [-1.2, 1.2])
        BK.beamOriented(
          b,
          "mb_blue_dk",
          V3(T + dx, y, zi0),
          V3(T + dx, y, zi1),
          1.0,
          0.7,
          UP,
          0.5,
        );
    // arched crown: two arch ribs (x faces) springing from the legs, cornice across the top
    for (const dx of [-1.3, 1.3]) {
      let prev = null;
      for (let k = 0; k <= 14; k++) {
        const t = k / 14,
          z = zi0 + (zi1 - zi0) * t,
          y = 58 + Math.sin(t * PI) * 8.5;
        const p = V3(T + dx, y, z);
        if (prev)
          BK.beamOriented(
            b,
            "mb_blue",
            prev,
            p,
            1.4,
            0.8,
            UP.clone().cross(ZA).lengthSq() ? BK.perpUp(prev, p, XA) : UP,
            0.45,
          );
        prev = p;
      }
      // spandrel lattice between the arch and the cornice
      for (let k = 1; k < 8; k++) {
        const t = k / 8,
          z = zi0 + (zi1 - zi0) * t,
          y = 58 + Math.sin(t * PI) * 8.5;
        b.beam(
          "mb_blue_dk",
          V3(T + dx, y, z),
          V3(T + dx, top - 2, z),
          0.25,
          0.25,
          {},
        );
      }
    }
    b.boxMM(
      "mb_blue",
      T - 2.0,
      top - 2.6,
      zi0 - 1,
      T + 2.0,
      top - 0.8,
      zi1 + 1,
      { seg: false, grime: 0.4 },
    );
    b.boxMM(
      "mb_blue_dk",
      T - 2.3,
      top - 0.8,
      zi0 - 1.3,
      T + 2.3,
      top - 0.3,
      zi1 + 1.3,
      { seg: false },
    );
    // three small globe finials along the crown
    for (const z of [M.zc - 5, M.zc, M.zc + 5]) {
      b.cyl("mb_blue", T, top - 0.3, z, 0.4, 0.6, 0.8, 10, { hSeg: 1 });
      b.sphere("mb_blue", T, top + 1.0, z, 0.6, { ws: 12, hs: 8 });
    }
    // granite pier
    b.boxMM("pier_stone", T - 7, -6, 558.5, T + 7, 10.6, 587.5, {
      grime: 0.6,
      segLen: 3,
    });
    b.boxMM("granite_block", T - 7.5, 10.6, 558, T + 7.5, 12, 588, {
      seg: false,
      grime: 0.5,
    });
    for (const zz of [558.5, 587.5])
      b.cyl("pier_stone", T, -6, zz, 7, 7, 16.6, 16, {
        thetaStart: zz < 570 ? PI / 2 : -PI / 2,
        thetaLen: PI,
        sz: 0.4,
        hSeg: 2,
        grime: 0.6,
      });
    PF.colMM(T - 7, -6, 558.5, T + 7, 12, 587.5, {});
  }

  // =================================================================
  // Deck, stiffening trusses, subway level, cables & suspenders
  // =================================================================
  function deck(b) {
    const d = M.deck,
      R = M.road;
    // centre roadway: Manhattan saddle → Brooklyn saddle; outer walkways between the housings' faces
    BK.deckSlab(b, M.ancM.saddle0, M.ancB.saddle1, R.z0, R.z1, d, {
      lanes: [M.zc],
    });
    BK.deckSlab(b, M.ancM.x1, M.ancB.x0, M.z0, R.z0, d, {});
    BK.deckSlab(b, M.ancM.x1, M.ancB.x0, R.z1, M.z1, d, {});
    // outer railings + small collars where the tower legs pierce the walkways
    for (const zz of [M.z0 + 0.15, M.z1 - 0.15])
      BK.rail(
        b,
        [
          [M.ancM.x1 + 0.3, zz, d],
          [M.ancB.x0 - 0.3, zz, d],
        ],
        { post: 2.5 },
      );
    // stiffening trusses under each cable (y 13..20) + lower level
    const x0 = M.ancM.x1,
      x1 = M.ancB.x0;
    for (const zt of M.cables) {
      b.boxMM("mb_blue", x0, d - 1.4, zt - 0.35, x1, d - 0.6, zt + 0.35, {
        grime: 0.5,
        segLen: 8,
      });
      b.boxMM("mb_blue", x0, M.lo, zt - 0.35, x1, M.lo + 0.8, zt + 0.35, {
        grime: 0.55,
        segLen: 8,
      });
      for (let x = x0; x < x1 - 0.1; x += 5) {
        b.box(
          "mb_blue_dk",
          x,
          M.lo + 0.8,
          zt,
          0.35,
          d - 1.4 - M.lo - 0.8,
          0.5,
          { seg: false, grime: 0.5 },
        );
        const xa = x,
          xb = Math.min(x1, x + 5),
          up = ((x - x0) / 5) % 2 === 0;
        b.beam(
          "mb_blue_dk",
          V3(xa, up ? M.lo + 0.8 : d - 1.4, zt),
          V3(xb, up ? d - 1.4 : M.lo + 0.8, zt),
          0.3,
          0.3,
          { grime: 0.5 },
        );
      }
    }
    // floor beams, lower level slab, subway tracks (north + south outer bays)
    for (let x = x0; x < x1; x += 5)
      b.boxMM(
        "mb_blue_dk",
        x - 0.3,
        M.lo - 0.4,
        M.z0,
        x + 0.3,
        M.lo + 0.2,
        M.z1,
        { seg: false, grime: 0.6 },
      );
    b.boxMM(
      "concrete_dark",
      x0,
      M.lo + 0.2,
      M.cables[1] + 0.4,
      x1,
      M.lo + 0.45,
      M.cables[2] - 0.4,
      { grime: 0.7, segLen: 8 },
    );
    for (const [za, zb] of [
      [M.cables[0] + 0.4, M.cables[1] - 0.4],
      [M.cables[2] + 0.4, M.cables[3] - 0.4],
    ]) {
      const zc = (za + zb) / 2;
      for (let x = x0; x < x1; x += 0.9)
        b.boxMM(
          "sleeper",
          x,
          M.lo + 0.2,
          za + 0.1,
          x + 0.28,
          M.lo + 0.4,
          zb - 0.1,
          { seg: false, grime: 0.6 },
        );
      for (const dz of [-0.72, 0.72])
        b.boxMM(
          "rail",
          x0,
          M.lo + 0.4,
          zc + dz - 0.05,
          x1,
          M.lo + 0.55,
          zc + dz + 0.05,
          { seg: false, grime: 0.3 },
        );
    }
    // lateral wind bracing under the lower level
    for (let x = x0; x < x1 - 5; x += 10) {
      b.beam(
        "mb_blue_dk",
        V3(x, M.lo - 0.6, M.z0),
        V3(x + 10, M.lo - 0.6, M.z1),
        0.25,
        0.25,
        {},
      );
      b.beam(
        "mb_blue_dk",
        V3(x, M.lo - 0.6, M.z1),
        V3(x + 10, M.lo - 0.6, M.z0),
        0.25,
        0.25,
        {},
      );
    }
  }
  function cables(b) {
    const d = M.deck;
    for (const zc of M.cables) {
      let prev = null;
      for (let x = 272; x <= 480.01; x += 2.5) {
        const p = V3(x, cableY(x), zc);
        if (prev) b.rod("cable", prev, p, 0.42, 8, { grime: 0.3 });
        prev = p;
      }
      // cable bands + suspenders over the deck
      for (let x = M.ancM.x1 + 2; x < M.ancB.x0 - 1; x += 5) {
        const y = cableY(x);
        if (y < d + 1.2) continue;
        if (Math.abs(x - M.t1) < 2.5 || Math.abs(x - M.t2) < 2.5) continue;
        b.cyl("iron", x, y - 0.35, zc, 0.52, 0.52, 0.7, 8, { rz: HP, hSeg: 1 });
        b.beam("cable", V3(x, d - 0.6, zc), V3(x, y - 0.3, zc), 0.12, 0.12, {
          noAO: true,
          grime: 0.2,
        });
        PF.col(x, zc, 0.35, 0.35, d, d + 3, 0, {
          walkable: false,
          surface: "metal",
        });
      }
    }
    // splay castings where the cables dive into the anchorage housings
    for (const zc of M.cables)
      for (const x of [273, 479])
        b.cyl("mb_blue_dk", x, cableY(x) - 1.2, zc, 0.5, 1.4, 2.4, 10, {
          rz: x < 300 ? -0.75 : 0.75,
          hSeg: 1,
        });
  }
