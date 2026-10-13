// play-inline-255 05 — the
// Lines 846-1105 of readable/play-inline-255.pretty.js (statement-aligned).
  function deck(b) {
    const d = Q.deck;
    BK.deckSlab(b, Q.x0, Q.brk, -440.5, -429.5, d, { lanes: [-435] });
    BK.deckSlab(b, Q.ramp.x1, Q.brk, -445.8, -440.5, d, {
      fascia: "concrete_dark",
    });
    BK.deckSlab(b, Q.x0, Q.stair.xA - Q.stair.ld, -429.5, -424.2, d, {});
    BK.deckSlab(b, Q.stair.xB + Q.stair.ld, Q.brk, -429.5, -424.2, d, {});
    // lower (subway/roadway) level between the trusses — visual only
    b.boxMM(
      "concrete_dark",
      312,
      Q.lo + 0.3,
      -439.6,
      Q.brk,
      Q.lo + 0.6,
      -430.4,
      { grime: 0.7, segLen: 8 },
    );
    // floor beams at every panel point (lower + upper)
    for (const x of panels([312, 346, 388, 428, Q.brk])) {
      b.boxMM(
        "qb_steel_dk",
        x - 0.35,
        Q.lo - 0.7,
        -446,
        x + 0.35,
        Q.lo + 0.3,
        -424,
        { grime: 0.6, seg: false },
      );
      b.boxMM(
        "qb_steel_dk",
        x - 0.3,
        d - 1.4,
        x < Q.ramp.x1 ? -440.5 : -445.8,
        x + 0.3,
        d - 0.6,
        -424.2,
        { grime: 0.6, seg: false },
      );
      // hangers between the levels at the outer lanes
      for (const zz of [-445.4, -424.6])
        if (!(zz < -441 && x < Q.ramp.x1))
          b.box(
            "qb_steel_dk",
            x,
            Q.lo + 0.3,
            zz,
            0.25,
            d - 1.4 - Q.lo - 0.3,
            0.25,
            { seg: false },
          );
    }
    // railings: lattice parapets on the outer edges
    BK.rail(
      b,
      [
        [Q.x0 + 0.2, -424.35, d],
        [Q.stair.xA - Q.stair.ld, -424.35, d],
      ],
      { lattice: true, post: 3 },
    );
    BK.rail(
      b,
      [
        [Q.stair.xB + Q.stair.ld, -424.35, d],
        [Q.brk - 1.5, -424.35, d],
      ],
      { lattice: true, post: 3 },
    );
    BK.rail(
      b,
      [
        [Q.ramp.x1 - 0.5, -445.65, d],
        [Q.brk - 1.5, -445.65, d],
      ],
      { lattice: true, post: 3 },
    );
    BK.rail(
      b,
      [
        [Q.x0 + 0.2, -440.35, d],
        [Q.ramp.x1 - 3, -440.35, d],
      ],
      { lattice: true, post: 3 },
    );
    // west parapet at the abutment (the old approach beyond is gone)
    b.boxMM("granite_block", Q.x0, d, -440.5, Q.x0 + 0.6, d + 1.1, -424.2, {
      grime: 0.6,
      seg: false,
    });
    PF.colMM(Q.x0, d - 0.5, -440.5, Q.x0 + 0.6, d + 1.1, -424.2, {
      walkable: false,
    });
    // stairwell guard at the top of the island stair (lane 0 is open air above flight 2)
    const st = Q.stair;
    b.beam(
      "iron",
      V3(st.xA + 0.05, d + 1.05, st.lanes[0] - st.w / 2),
      V3(st.xA + 0.05, d + 1.05, st.lanes[0] + st.w / 2),
      0.07,
      0.07,
      {},
    );
    PF.colMM(
      st.xA - 0.05,
      d - 0.2,
      st.lanes[0] - st.w / 2 - 0.1,
      st.xA + 0.15,
      d + 1.1,
      st.lanes[0] + st.w / 2,
      { walkable: false, surface: "metal" },
    );
    // stairwell side railings on the deck edge of the gap
    BK.rail(
      b,
      [
        [st.xA, -429.45, d],
        [st.xB + st.ld, -429.45, d],
      ],
      { post: 2 },
    );
  }
  function ramp(b) {
    const R = Q.ramp,
      len = R.x1 - R.x0,
      rise = Q.deck,
      w = R.z1 - R.z0,
      zc = (R.z0 + R.z1) / 2;
    const ang = Math.atan2(rise, len),
      L = Math.hypot(len, rise);
    const slab = new THREE.BoxGeometry(L, 0.5, w, 16, 1, 1);
    b.add("asphalt", slab, {
      m: PF.m4(
        (R.x0 + R.x1) / 2,
        rise / 2 - 0.25 * Math.cos(ang),
        zc,
        0,
        0,
        ang,
      ),
      grime: 0.6,
    });
    for (const zz of [R.z0 + 0.1, R.z1 - 0.1])
      b.add("concrete_dark", new THREE.BoxGeometry(L, 0.9, 0.3, 16, 1, 1), {
        m: PF.m4((R.x0 + R.x1) / 2, rise / 2 - 0.6, zz, 0, 0, ang),
        grime: 0.7,
      });
    // step colliders (≤ 0.25 m) under the sloped surface
    PF.stepPath(R.x0, zc, HP, w, len, (t) => t * rise, {
      maxRise: 0.25,
      thick: 0.8,
      maxLen: 1.2,
    });
    // bents
    for (let x = R.x0 + 8; x < R.x1 - 2; x += 9) {
      const y = ((x - R.x0) / len) * rise - 0.6;
      const yb = G.LAYOUT.isLand(x, zc) ? 0 : -6;
      for (const zz of [R.z0 + 0.4, R.z1 - 0.4]) {
        b.box("qb_steel_dk", x, yb, zz, 0.5, y - yb, 0.5, {
          seg: false,
          grime: 0.6,
        });
        PF.col(x, zz, 0.55, 0.55, yb, y, 0, {
          walkable: false,
          surface: "metal",
        });
      }
      b.boxMM("qb_steel_dk", x - 0.3, y - 0.7, R.z0, x + 0.3, y, R.z1, {
        seg: false,
        grime: 0.6,
      });
      b.beam(
        "qb_steel_dk",
        V3(x, yb + 0.5, R.z0 + 0.4),
        V3(x, y - 0.7, R.z1 - 0.4),
        0.15,
        0.15,
        {},
      );
    }
    // railings, sampled every 8 m so each collider hugs the slope
    const pts = (z) => {
      const o = [];
      for (let x = R.x0; x <= R.x1 + 0.01; x += 8)
        o.push([x, z, ((x - R.x0) / len) * rise]);
      if (o[o.length - 1][0] < R.x1) o.push([R.x1, z, rise]);
      return o;
    };
    BK.rail(b, pts(R.z0 + 0.15), { lattice: true, post: 3 });
    BK.rail(b, pts(R.z1 - 0.15), { lattice: true, post: 3 });
  }

  // =================================================================
  // Broken span: C's arm ends in twisted steel; the suspended span in the river; orphaned tower D
  // =================================================================
  function brokenSpan(b) {
    BK.debris(b, "qb_steel", Q.brk, Q.lo, [Q.zN, Q.zS], 1, 71);
    BK.debris(
      b,
      "qb_steel_dk",
      Q.brk - 1,
      Q.deck - 0.8,
      [-445, -438, -432, -426],
      1,
      72,
    );
    // jagged deck ends
    const r = PF.rng(4901);
    for (let z = -445.5; z < -424.5; z += 1.6) {
      const l = 0.5 + r() * 2.6;
      b.boxMM(
        "asphalt",
        Q.brk,
        Q.deck - 0.6,
        z,
        Q.brk + l,
        Q.deck - 0.1 - r() * 0.3,
        z + 1.5,
        { seg: false, rz: -r() * 0.2, grime: 0.8 },
      );
    }
    // the fallen suspended span lying tilted in the river
    const M = PF.m4(525, -3, -435, 0.08, 0.05, 0.12);
    const add = (a, c, w) =>
      b.beam(
        "qb_steel",
        a.clone().applyMatrix4(M),
        c.clone().applyMatrix4(M),
        w,
        w,
        { grime: 0.7 },
      );
    for (const z0 of [-5, 5]) {
      for (let x = -24; x < 24; x += 6) {
        add(V3(x, 0, z0), V3(x + 6, 0, z0), 1.1);
        add(V3(x, 9, z0), V3(x + 6, 9, z0), 0.9);
        add(V3(x, 0, z0), V3(x, 9, z0), 0.7);
        add(V3(x, 9, z0), V3(x + 6, 0, z0), 0.6);
      }
    }
    for (let x = -24; x <= 24; x += 6) add(V3(x, 0, -5), V3(x, 0, 5), 0.6);
    // tower D arms (x 560..684): trusses + deck, visual only
    const xsD = panels([560, 622, 684]);
    for (const z0 of [Q.zN, Q.zS]) trussPlane(b, z0, xsD, { collide: false });
    b.boxMM("asphalt", 560, Q.deck - 0.6, -440.5, 684, Q.deck, -429.5, {
      grime: 0.8,
      segLen: 10,
    });
    BK.debris(b, "qb_steel", 560, Q.lo, [Q.zN, Q.zS], -1, 73);
    BK.debris(b, "qb_steel", 684, Q.lo, [Q.zN, Q.zS], 1, 74);
    tower(b, 622, {});
    pier(b, 622, -6, { northNose: true });
  }

  // =================================================================
  // Dressing: kiosk (roof stair), barricades, wrecks, lamps, signs
  // =================================================================
