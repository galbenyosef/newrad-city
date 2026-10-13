// play-inline-80 05 — beam
// Lines 1127-1441 of readable/play-inline-80.pretty.js (statement-aligned).
  function buildPiers() {
    const L = G.LAYOUT,
      man = L.MANHATTAN;
    M.piers = M.piers || [];
    const west = [
      [-840, 70, 16, true],
      [-560, 80, 18, true],
      [-330, 95, 18, false],
      [-120, 75, 18, true],
      [140, 85, 20, true],
      [360, 70, 16, false],
      [560, 80, 18, true],
      [760, 55, 14, false],
    ];
    for (let i = 0; i < west.length; i++) {
      const [z, len, w, shed] = west[i];
      const x = M.shoreX(man, z, -1);
      if (x === null) continue;
      if (L.siteAt(x, z, 10)) continue;
      M.piers.push(
        pier(x + 0.5, z, -1, 0, len, w, {
          shed,
          broken: i === 5 || i === 7,
          key: "w" + i,
        }),
      );
    }
    const east = [
      [-800, 55, 14, true],
      [-560, 60, 16, false],
      [60, 55, 16, true],
      [250, 60, 14, true],
      [470, 50, 14, false],
      [780, 45, 16, false],
    ];
    for (let i = 0; i < east.length; i++) {
      const [z, len, w, shed] = east[i];
      const x = M.shoreX(man, z, 1);
      if (x === null) continue;
      if (L.siteAt(x, z, 10)) continue;
      M.piers.push(
        pier(x - 0.5, z, 1, 0, len, w, { shed, broken: i === 4, key: "e" + i }),
      );
    }
    // Brooklyn waterfront piers
    for (const [z, len] of [
      [430, 60],
      [700, 70],
      [930, 50],
    ]) {
      const x = M.shoreX(L.BROOKLYN, z, -1);
      if (x === null) continue;
      if (L.siteAt(x, z, 10)) continue;
      M.piers.push(
        pier(x + 0.5, z, -1, 0, len, 16, { shed: z === 430, key: "b" + z }),
      );
    }
  }

  // -------------------------------------------------------------------
  // Hull generator (boats, carrier, freighter)
  // -------------------------------------------------------------------
  /**
   * Lofted hull in local space: length along +Z (bow at +len/2), beam along X,
   * keel at y=-depth, deck at y=0. mat buffer b.
   */
  function hull(b, len, beam, depth, o) {
    o = o || {};
    const N = 10,
      c = o.c || [0.7, 0.4, 0.3],
      cTop = o.ct || c;
    const sections = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N; // 0 = stern, 1 = bow
      const z = -len / 2 + len * t;
      let wk = 1;
      if (t > 0.65) wk = Math.cos((((t - 0.65) / 0.35) * Math.PI) / 2); // taper to bow
      if (t < 0.1) wk = 0.85 + 0.15 * (t / 0.1);
      const hw = Math.max(0.05, (beam / 2) * wk);
      const keel = -depth * (t > 0.85 ? 1 - ((t - 0.85) / 0.15) * 0.5 : 1);
      sections.push([z, hw, keel]);
    }
    // each section: points around U: deck-left, bilge-left, keel, bilge-right, deck-right
    const ring = (s) => [
      [-s[1], 0.4],
      [-s[1] * 0.92, s[2] * 0.6],
      [0, s[2]],
      [s[1] * 0.92, s[2] * 0.6],
      [s[1], 0.4],
    ];
    for (let i = 0; i < N; i++) {
      const A = sections[i],
        B = sections[i + 1];
      const ra = ring(A),
        rb = ring(B);
      for (let k = 0; k < 4; k++) {
        const p0 = [ra[k][0], ra[k][1], A[0]],
          p1 = [ra[k + 1][0], ra[k + 1][1], A[0]],
          p2 = [rb[k + 1][0], rb[k + 1][1], B[0]],
          p3 = [rb[k][0], rb[k][1], B[0]];
        const mx = (p0[0] + p1[0] + p2[0] + p3[0]) / 4,
          my = (p0[1] + p1[1] + p2[1] + p3[1]) / 4 + depth * 0.3;
        const nl = Math.hypot(mx, my) || 1;
        M.quad(
          b,
          p0,
          p3,
          p2,
          p1,
          [mx / nl, my / nl, 0],
          [
            A[0] / 3,
            ra[k][1] / 3,
            B[0] / 3,
            ra[k][1] / 3,
            B[0] / 3,
            ra[k + 1][1] / 3,
            A[0] / 3,
            ra[k + 1][1] / 3,
          ],
          k < 2 ? c : cTop,
          k < 2 ? cTop : c,
        );
      }
      // deck
      if (!o.noDeck)
        M.quad(
          b,
          [-A[1], 0.4, A[0]],
          [A[1], 0.4, A[0]],
          [B[1], 0.4, B[0]],
          [-B[1], 0.4, B[0]],
          [0, 1, 0],
          [
            -A[1] / 3,
            A[0] / 3,
            A[1] / 3,
            A[0] / 3,
            B[1] / 3,
            B[0] / 3,
            -B[1] / 3,
            B[0] / 3,
          ],
          o.cd || c,
        );
    }
    // transom (stern plate)
    const S = sections[0],
      rs = ring(S);
    for (let k = 1; k < 4; k++)
      M.tri(
        b,
        [rs[0][0], rs[0][1], S[0]],
        [rs[k][0], rs[k][1], S[0]],
        [rs[k + 1][0], rs[k + 1][1], S[0]],
        [0, 0, -1],
        [0, 0, 1, 0, 1, 1],
        c,
      );
    return sections;
  }
  M.hull = hull;

  // -------------------------------------------------------------------
  // "USS Intrepid"-style aircraft carrier at the Hell's Kitchen pier
  // -------------------------------------------------------------------
  function buildIntrepid() {
    const L = G.LAYOUT;
    const pierX = M.shoreX(L.MANHATTAN, -330, -1);
    if (pierX === null) return;
    const cx = pierX - 58,
      cz = -357,
      yaw = -Math.PI / 2; // bow pointing west (local +Z → world -X)
    const LEN = 110,
      BEAM = 17,
      DEPTH = 9,
      FD = 6.5; // flight deck height above water line
    const b = M.buf("metal_painted", cx, cz, "mid");
    M.setXF(M.mtx(cx, -1.2 + 0.2, cz, yaw, 0, 0.035));
    hull(b, LEN, BEAM, DEPTH, {
      c: [0.8, 0.84, 0.88],
      ct: [0.95, 1.0, 1.04],
      cd: [0.7, 0.7, 0.7],
    });
    // hangar deck walls up to the flight deck
    M.box(
      b,
      -BEAM / 2 + 0.3,
      0.4,
      -LEN / 2 + 4,
      BEAM / 2 - 0.3,
      FD,
      LEN / 2 - 16,
      { s: 3, c: [0.88, 0.92, 0.96], skip: 8 },
    );
    // flight deck overhang (wood planking top)
    const fw = M.buf("wood_planks", cx, cz, "mid");
    M.box(
      fw,
      -BEAM / 2 - 4.5,
      FD,
      -LEN / 2 - 2,
      BEAM / 2 + 3,
      FD + 0.6,
      LEN / 2 - 4,
      { s: 3, c: [0.95, 0.9, 0.82], cy: [1.0, 0.95, 0.88], skip: 0 },
    );
    // runway markings (white dashes)
    const bm = M.buf("my/markings", cx, cz, "detail");
    for (let z = -LEN / 2 + 4; z < LEN / 2 - 10; z += 7)
      M.decal(bm, -1, FD + 0.62, z, 0.6, 3.5, 0, M.MARK.WHITE, null);
    // island superstructure (starboard = local +X side)
    const is = M.buf("metal_painted", cx, cz, "mid");
    M.box(is, BEAM / 2 - 1.5, FD + 0.6, -6, BEAM / 2 + 2.5, FD + 9, 10, {
      s: 3,
      c: [0.9, 0.94, 0.98],
    });
    M.box(is, BEAM / 2 - 1, FD + 9, -3, BEAM / 2 + 2, FD + 13, 6, {
      s: 3,
      c: [0.86, 0.9, 0.94],
    });
    M.box(is, BEAM / 2 - 0.6, FD + 13, -1, BEAM / 2 + 1.6, FD + 16, 4, {
      s: 3,
      c: [0.4, 0.42, 0.44],
    });
    M.cyl(is, BEAM / 2 + 0.5, FD + 16, 1.5, 0.25, 0.1, 9, 6, {
      c: [0.35, 0.35, 0.35],
    });
    const bgl = M.buf("glass_dirty", cx, cz);
    M.box(
      bgl,
      BEAM / 2 - 1.05,
      FD + 11,
      -3.05,
      BEAM / 2 + 2.05,
      FD + 12.2,
      6.05,
      { s: 3, c: [0.5, 0.55, 0.5], skip: 12 },
    );
    // wrecked aircraft on deck
    const pl = M.buf("metal_painted", cx, cz, "detail");
    for (const [px, pz, ry, broken] of [
      [-3, 25, 0.3, false],
      [3, 5, -0.2, true],
      [-5, -20, 2.9, false],
      [2, -35, 3.3, false],
    ]) {
      const m = M.mtx(cx, 0, cz, yaw).multiply(
        M.mtx(px, -1.2 + 0.2 + FD + 0.6 + 1.1, pz, ry, 0, broken ? 0.25 : 0),
      );
      const pc = [0.55, 0.62, 0.66];
      M.setXF(m);
      M.pipe(pl, 0, 0, -4.5, 0, 0, 4.5, 0.7, 8, { c: pc, r1: 0.45 }); // fuselage
      M.box(pl, -5.5, -0.1, -0.5, broken ? 0 : 5.5, 0.08, 1.8, { s: 2, c: pc }); // wings (one torn off)
      M.box(pl, -2, 0, -4.4, 2, 0.06, -3.4, { s: 2, c: pc }); // tailplane
      M.box(pl, -0.06, 0, -4.4, 0.06, 1.8, -3.3, { s: 2, c: pc }); // fin
      M.box(pl, -0.4, 0.5, 0.5, 0.4, 1.0, 2.5, { s: 2, c: [0.2, 0.25, 0.25] }); // canopy
      M.cyl(pl, 0, -0.35, 4.6, 0.35, 0.2, 0.3, 6, { c: [0.25, 0.25, 0.25] }); // prop hub
      M.setXF(null);
    }
    M.setXF(null);
    // colliders: hull (not walkable from the side), flight deck walkable
    M.ocol(cx, cz, BEAM + 7.5, LEN + 4, -8, -1.2 + 0.2 + FD + 0.6, yaw, {
      tag: "ship",
      surface: "metal",
    });
    // island superstructure blocks the deck (local x 7..11.5, z -6..10)
    {
      const ix = cx - 2,
        iz = cz + 9.25;
      M.ocol(ix, iz, 16, 4.5, 0, 25, 0, { tag: "ship", surface: "metal" });
    }
    // gangway stairs from the pier deck (y=0) up to the flight deck (~6.1)
    const topY = -1.2 + 0.2 + FD + 0.6;
    const gx = pierX - 30; // on the pier, heading north toward the carrier
    const steps = Math.ceil(topY / 0.45);
    const gs = M.buf("metal_panel", gx, -345);
    for (let s = 0; s < steps; s++) {
      const y = ((s + 1) * topY) / steps;
      const z0 = -338.6 - s * 0.55;
      M.box(gs, gx - 1.1, y - 0.12, z0 - 0.55, gx + 1.1, y, z0, {
        s: 2,
        c: [0.6, 0.6, 0.58],
      });
      M.box3(gx - 1.1, y - 0.4, z0 - 0.55, gx + 1.1, y, z0, {
        tag: "stairs",
        surface: "metal",
      });
    }
    const zTop = -338.6 - steps * 0.55;
    const gr = M.buf("rust", gx, -345, "detail");
    for (const sd of [-1.15, 1.15]) {
      M.beam(gr, gx + sd, 1.0, -338.6, gx + sd, topY + 1.0, zTop, 0.05, 0.05, {
        c: [0.6, 0.55, 0.5],
      });
      M.beam(gr, gx + sd, 0, -338.6, gx + sd, topY, zTop, 0.14, 0.3, {
        c: [0.5, 0.45, 0.4],
      });
      M.ocol(
        gx + sd * 1.1,
        (zTop - 338.6) / 2,
        0.15,
        Math.abs(zTop + 338.6),
        0,
        topY + 1.2,
        0,
        { tag: "railing" },
      );
    }
    M.intrepid = { x: cx, z: cz, deckY: topY, gangway: { x: gx, z: -336 } };
  }

  // -------------------------------------------------------------------
  // Brooklyn Navy Yard: gantry cranes, freighter, container stacks
  // -------------------------------------------------------------------
