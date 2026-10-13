// play-inline-544 04 — part
// Lines 1003-1348 of readable/play-inline-544.pretty.js (statement-aligned).
  function keyGeo() {
    const P = [];
    const flat = (g) => g.rotateX(PI / 2); // torus/disc lying flat
    P.push(
      part(
        flat(new THREE.TorusGeometry(0.034, 0.0068, 8, 28)),
        0.045,
        0,
        0,
        GOLD,
      ),
    ); // the bow ring
    for (const a of [PI / 2, PI, (3 * PI) / 2]) {
      // trefoil lobes round the bow
      P.push(
        part(
          flat(new THREE.TorusGeometry(0.012, 0.0042, 6, 16)),
          0.045 + Math.cos(a) * 0.044,
          0,
          Math.sin(a) * 0.044,
          GOLD,
        ),
      );
    }
    P.push(
      part(
        new THREE.CylinderGeometry(0.019, 0.019, 0.007, 20),
        0.045,
        0,
        0,
        GOLD_L,
      ),
    ); // the seal medallion
    P.push(
      part(
        new THREE.CylinderGeometry(0.012, 0.012, 0.009, 16),
        0.045,
        0,
        0,
        GOLD_D,
      ),
    ); // its raised centre
    for (let k = 0; k < 4; k++) {
      const a = (k * PI) / 2 + PI / 4;
      P.push(
        part(
          new THREE.BoxGeometry(0.018, 0.004, 0.004),
          0.045 + Math.cos(a) * 0.026,
          0,
          Math.sin(a) * 0.026,
          GOLD,
          -a,
        ),
      );
    }
    // collar: a ring, a bead, a second ring
    P.push(
      part(
        new THREE.CylinderGeometry(0.012, 0.012, 0.009, 14),
        0.087,
        0,
        0,
        GOLD_D,
        0,
        0,
        PI / 2,
      ),
    );
    P.push(part(new THREE.SphereGeometry(0.0105, 12, 8), 0.098, 0, 0, GOLD));
    P.push(
      part(
        new THREE.CylinderGeometry(0.0095, 0.0095, 0.007, 14),
        0.109,
        0,
        0,
        GOLD_D,
        0,
        0,
        PI / 2,
      ),
    );
    // shaft + tip
    P.push(
      part(
        new THREE.CylinderGeometry(0.0062, 0.0062, 0.165, 10),
        0.194,
        0,
        0,
        GOLD,
        0,
        0,
        PI / 2,
      ),
    );
    P.push(part(new THREE.SphereGeometry(0.0075, 10, 6), 0.278, 0, 0, GOLD_L));
    // the working bit (stepped wards)
    P.push(
      part(new THREE.BoxGeometry(0.038, 0.007, 0.026), 0.252, 0, -0.018, GOLD),
    );
    P.push(
      part(
        new THREE.BoxGeometry(0.009, 0.007, 0.013),
        0.239,
        0,
        -0.037,
        GOLD_D,
      ),
    );
    P.push(
      part(
        new THREE.BoxGeometry(0.009, 0.007, 0.009),
        0.262,
        0,
        -0.035,
        GOLD_D,
      ),
    );
    return G.util.mergeGeometries(P);
  }
  /** Red, white and blue ribbon through the bow: a loop and two tails lying on the velvet. */
  function ribbonGeo() {
    const P = [],
      cols = [0xb01e22, 0xf2eee4, 0x1e2f6a];
    for (const s of [-1, 1])
      for (let i = 0; i < 3; i++) {
        P.push(
          part(
            new THREE.BoxGeometry(0.11, 0.002, 0.0042),
            -0.03,
            -0.004,
            s * 0.008 + (i - 1) * 0.0042,
            cols[i],
            s * 0.32,
          ),
        );
      }
    P.push(
      part(
        new THREE.TorusGeometry(0.014, 0.004, 4, 10, PI),
        0.014,
        0.004,
        0,
        0xb01e22,
        0,
        PI / 2,
      ),
    );
    return G.util.mergeGeometries(P);
  }
  /** Open presentation box: navy leather shell, the lid hinged open at the back (velvet + brass plaque inside). */
  function keyBoxGeo() {
    const P = [],
      NAVY = 0x1c2440,
      NAVY_D = 0x121830;
    P.push(part(new THREE.BoxGeometry(0.36, 0.035, 0.15), 0, 0.0175, 0, NAVY)); // base
    for (const z of [-0.073, 0.073])
      P.push(
        part(new THREE.BoxGeometry(0.36, 0.012, 0.004), 0, 0.038, z, NAVY_D),
      );
    P.push(
      part(
        new THREE.BoxGeometry(0.36, 0.15, 0.012),
        0,
        0.105,
        -0.082,
        NAVY,
        0,
        -0.25,
      ),
    ); // lid (open)
    P.push(
      part(
        new THREE.BoxGeometry(0.012, 0.012, 0.012),
        -0.17,
        0.038,
        -0.07,
        0xc8a050,
      ),
    ); // hinges
    P.push(
      part(
        new THREE.BoxGeometry(0.012, 0.012, 0.012),
        0.17,
        0.038,
        -0.07,
        0xc8a050,
      ),
    );
    return G.util.mergeGeometries(P);
  }
  function keyVelvetGeo() {
    const P = [];
    P.push(
      part(new THREE.BoxGeometry(0.34, 0.006, 0.13), 0, 0.037, 0, 0x8a1420),
    ); // the bed
    P.push(
      part(
        new THREE.BoxGeometry(0.34, 0.13, 0.004),
        0,
        0.105,
        -0.0745,
        0x7a1018,
        0,
        -0.25,
      ),
    ); // lid lining
    return G.util.mergeGeometries(P);
  }
  // Furniture the key lies on. Each: local frame on the floor, front +z; the box sits at SETS[...].item.
  function caseGeo() {
    // museum display case: moulded pedestal (the vitrine glass is a separate mesh)
    const P = [],
      W = 0x4a2e1c,
      W_D = 0x2e1c10,
      BR = 0xb8903c;
    P.push(
      part(box(0.6, 0.08, 0.6), 0, 0.04, 0, W_D),
      part(box(0.52, 0.76, 0.52), 0, 0.46, 0, W),
      part(box(0.58, 0.07, 0.58), 0, 0.875, 0, W_D),
    );
    P.push(part(box(0.5, 0.02, 0.5), 0, 0.92, 0, 0x5a1018)); // velvet deck
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        P.push(part(box(0.012, 0.4, 0.012), sx * 0.248, 1.13, sz * 0.248, BR));
    P.push(part(box(0.51, 0.012, 0.51), 0, 1.335, 0, BR));
    P.push(part(box(0.2, 0.05, 0.004), 0, 0.72, 0.262, BR)); // caption plate
    return G.util.mergeGeometries(P);
  }
  function deskGeo() {
    // mahogany writing desk: top, apron, drawers, tapered legs, green blotter, inkstand
    const P = [],
      M_ = 0x5a2e1a,
      M_D = 0x3a1c10,
      BR = 0xc8a050;
    P.push(
      part(box(1.2, 0.04, 0.64), 0, 0.76, 0, M_),
      part(box(1.12, 0.1, 0.56), 0, 0.69, 0, M_D),
    );
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        P.push(
          part(cyl(0.025, 0.017, 0.64, 8), sx * 0.54, 0.32, sz * 0.25, M_D),
        );
    for (const sx of [-0.32, 0.32])
      P.push(
        part(box(0.3, 0.07, 0.01), sx, 0.69, 0.282, M_),
        part(box(0.04, 0.012, 0.012), sx, 0.69, 0.29, BR),
      );
    P.push(part(box(0.62, 0.006, 0.4), 0.06, 0.783, 0.02, 0x2a5a3a)); // blotter
    P.push(
      part(box(0.62, 0.008, 0.03), 0.06, 0.784, -0.18, M_D),
      part(box(0.62, 0.008, 0.03), 0.06, 0.784, 0.22, M_D),
    );
    P.push(
      part(box(0.2, 0.02, 0.1), -0.42, 0.79, -0.18, BR),
      part(cyl(0.025, 0.025, 0.04, 10), -0.46, 0.82, -0.18, 0x1a1a22),
      part(cyl(0.004, 0.004, 0.14, 4), -0.38, 0.85, -0.18, 0x1a1a1a, 0, 0.5),
    );
    P.push(
      part(cyl(0.05, 0.06, 0.02, 12), 0.47, 0.79, -0.2, BR),
      part(cyl(0.008, 0.008, 0.3, 6), 0.47, 0.95, -0.2, BR),
    ); // desk lamp stem
    return G.util.mergeGeometries(P);
  }
  function suiteGeo() {
    // hotel side table (round, pedestal) with a lamp and an ashtray
    const P = [],
      W = 0x6a3e22,
      W_D = 0x40241a,
      BR = 0xc8a050;
    P.push(
      part(cyl(0.34, 0.34, 0.03, 24), 0, 0.615, 0, W),
      part(cyl(0.35, 0.33, 0.02, 24), 0, 0.59, 0, W_D),
    );
    P.push(
      part(cyl(0.04, 0.06, 0.55, 10), 0, 0.31, 0, W_D),
      part(cyl(0.22, 0.25, 0.04, 16), 0, 0.02, 0, W_D),
    );
    P.push(
      part(cyl(0.07, 0.09, 0.04, 14), -0.2, 0.65, -0.12, BR),
      part(cyl(0.012, 0.012, 0.3, 6), -0.2, 0.8, -0.12, BR),
    ); // lamp base + stem
    P.push(part(cyl(0.05, 0.045, 0.015, 12), 0.2, 0.638, -0.16, 0xd8d8d0)); // ashtray
    return G.util.mergeGeometries(P);
  }
  function lecternGeo() {
    // City Hall presentation lectern: walnut, slanted top, the city seal on the front
    const P = [],
      W = 0x4a2a18,
      W_D = 0x2e1a10,
      BR = 0xc8a050;
    P.push(
      part(box(0.62, 0.06, 0.48), 0, 0.03, 0, W_D),
      part(box(0.5, 0.96, 0.36), 0, 0.54, -0.02, W),
    );
    P.push(part(box(0.62, 0.04, 0.5), 0, 1.06, 0, W_D, 0, -0.18)); // slanted reading top
    P.push(part(box(0.6, 0.03, 0.02), 0, 1.0, 0.245, BR)); // book ledge
    P.push(
      part(cyl(0.16, 0.16, 0.012, 24), 0, 0.62, 0.165, 0x1e2f6a, 0, PI / 2),
      part(cyl(0.17, 0.17, 0.008, 24), 0, 0.62, 0.162, BR, 0, PI / 2),
    ); // seal disc
    P.push(
      part(box(0.18, 0.018, 0.004), 0, 0.62, 0.174, BR),
      part(box(0.018, 0.18, 0.004), 0, 0.62, 0.174, BR),
    );
    return G.util.mergeGeometries(P);
  }
  /** A-frame sandwich board (two leaning panels + feet); the flyer is boardFaceGeo. */
  function boardGeo() {
    const P = [],
      W = 0x2a3a5a,
      W_D = 0x1a2438;
    for (const s of [-1, 1]) {
      P.push(part(box(0.62, 1.0, 0.03), 0, 0.5, s * 0.17, W, 0, s * 0.17));
      P.push(part(box(0.66, 0.05, 0.04), 0, 1.0, s * 0.09, W_D, 0, s * 0.17));
    }
    P.push(
      part(box(0.02, 0.02, 0.3), 0.3, 0.45, 0, 0x8a8a8a),
      part(box(0.02, 0.02, 0.3), -0.3, 0.45, 0, 0x8a8a8a),
    );
    return G.util.mergeGeometries(P);
  }
  function boardFaceGeo() {
    const a = new THREE.PlaneGeometry(0.5, 0.66);
    a.rotateX(-0.17);
    a.translate(0, 0.52, 0.19);
    const b = new THREE.PlaneGeometry(0.5, 0.66);
    b.rotateX(0.17);
    b.rotateY(PI);
    b.translate(0, 0.52, -0.19);
    return G.util.mergeGeometries([a, b]);
  }
  /** Merged miniature: lacquer base, gold band & plaque, felt top and the die-cast landmark (one draw). */
  function miniBodyGeo(id) {
    return G.util.mergeGeometries([
      G.util.paint(GEO.mBase.clone(), 0x2a1a10),
      G.util.paint(GEO.mBand.clone(), 0xc9a24a),
      G.util.paint(GEO.mPlaque.clone(), 0xd8b458),
      G.util.paint(GEO.mFelt.clone(), 0x7a1c1c),
      G.util.bake(miniGeo(id), { x: 0, y: 0.062, z: 0 }, 0, 1.35),
    ]);
  }

  // ------------------------------------------------------------------
  // Object builders
  // ------------------------------------------------------------------
