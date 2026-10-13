// play-inline-544 03 — part
// Lines 694-1002 of readable/play-inline-544.pretty.js (statement-aligned).
  function miniGeo(id) {
    const P = [];
    const STONE = 0xd8cfb8,
      CREAM = 0xe6dcc0,
      SILVER = 0xe0e4e8,
      COPPER = 0x7fb8a0,
      GOLD = 0xd8b048,
      GREEN = 0x3e7a3a;
    switch (id) {
      case "empire":
        P.push(
          part(box(0.05, 0.04, 0.036), 0, 0.02, 0, STONE),
          part(box(0.04, 0.03, 0.028), 0, 0.055, 0, STONE),
          part(box(0.03, 0.02, 0.02), 0, 0.08, 0, STONE),
          part(box(0.018, 0.012, 0.012), 0, 0.096, 0, STONE),
          part(cyl(0.004, 0.006, 0.012), 0, 0.108, 0, SILVER),
          part(cyl(0.0012, 0.002, 0.02), 0, 0.124, 0, SILVER),
        );
        break;
      case "chrysler":
        P.push(
          part(box(0.04, 0.05, 0.04), 0, 0.025, 0, STONE),
          part(box(0.03, 0.022, 0.03), 0, 0.061, 0, STONE),
          part(cone(0.022, 0.034, 4), 0, 0.089, 0, SILVER, Math.PI / 4),
          part(cyl(0.0008, 0.002, 0.022), 0, 0.117, 0, SILVER),
        );
        break;
      case "liberty":
        P.push(
          part(box(0.046, 0.032, 0.046), 0, 0.016, 0, STONE),
          part(cyl(0.012, 0.018, 0.05, 10), 0, 0.057, 0, COPPER),
          part(new THREE.SphereGeometry(0.0075, 10, 8), 0, 0.088, 0, COPPER),
          part(cone(0.009, 0.007, 7), 0, 0.097, 0, COPPER),
          part(cyl(0.0028, 0.0028, 0.03), 0.009, 0.1, 0, COPPER, 0, 0, -0.2),
          part(cone(0.0045, 0.01, 6), 0.012, 0.118, 0, GOLD),
        );
        break;
      case "bridge":
        P.push(
          part(box(0.012, 0.075, 0.016), -0.03, 0.0375, 0, STONE),
          part(box(0.012, 0.075, 0.016), 0.03, 0.0375, 0, STONE),
          part(box(0.12, 0.004, 0.016), 0, 0.03, 0, 0x8a8478),
          part(
            box(0.004, 0.002, 0.052),
            -0.047,
            0.052,
            0,
            0x9aa0a8,
            Math.PI / 2,
            0,
            0.9,
          ),
          part(
            box(0.004, 0.002, 0.052),
            0.047,
            0.052,
            0,
            0x9aa0a8,
            Math.PI / 2,
            0,
            -0.9,
          ),
          part(box(0.06, 0.0015, 0.002), 0, 0.064, 0.006, 0x9aa0a8),
          part(box(0.06, 0.0015, 0.002), 0, 0.064, -0.006, 0x9aa0a8),
        );
        break;
      case "grand_central":
        P.push(
          part(box(0.085, 0.036, 0.03), 0, 0.018, 0, CREAM),
          part(box(0.05, 0.012, 0.026), 0, 0.042, 0, CREAM),
          part(
            cyl(0.008, 0.008, 0.004, 14),
            0,
            0.03,
            0.016,
            GOLD,
            0,
            Math.PI / 2,
          ),
          part(cone(0.006, 0.016, 6), 0, 0.056, 0, COPPER),
          part(box(0.012, 0.022, 0.002), -0.025, 0.016, 0.0155, 0x5a4a3a),
          part(box(0.012, 0.022, 0.002), 0, 0.012, 0.0155, 0x5a4a3a),
          part(box(0.012, 0.022, 0.002), 0.025, 0.016, 0.0155, 0x5a4a3a),
        );
        break;
      case "flatiron":
        P.push(
          part(cyl(0.04, 0.04, 0.07, 3), 0, 0.035, 0, 0xd9cdb5, Math.PI / 6),
          part(cyl(0.041, 0.041, 0.006, 3), 0, 0.072, 0, 0xb8ab93, Math.PI / 6),
        );
        break;
      case "times_square":
        P.push(
          part(box(0.02, 0.08, 0.02), 0, 0.04, 0, STONE),
          part(box(0.022, 0.018, 0.003), 0, 0.06, 0.011, 0xd23b2a),
          part(box(0.024, 0.055, 0.02), -0.03, 0.0275, 0.004, 0x8c8478),
          part(box(0.022, 0.02, 0.003), -0.03, 0.04, 0.015, 0xe8c040),
          part(box(0.024, 0.045, 0.02), 0.03, 0.0225, -0.004, 0x8c8478),
          part(box(0.022, 0.022, 0.003), 0.03, 0.03, 0.007, 0x3a6fd0),
          part(new THREE.SphereGeometry(0.005, 8, 6), 0, 0.087, 0, 0xf0f0f0),
        );
        break;
      default: // central_park — Angel of the Waters
        P.push(
          part(cyl(0.036, 0.04, 0.01, 18), 0, 0.005, 0, STONE),
          part(cyl(0.028, 0.028, 0.004, 18), 0, 0.011, 0, 0x6aa8c8),
          part(cyl(0.004, 0.006, 0.03), 0, 0.028, 0, STONE),
          part(cone(0.008, 0.022, 8), 0, 0.052, 0, COPPER),
          part(box(0.028, 0.009, 0.002), 0, 0.062, -0.002, COPPER),
          part(new THREE.SphereGeometry(0.004, 8, 6), 0, 0.066, 0, COPPER),
          part(cone(0.012, 0.04, 8), -0.048, 0.02, -0.01, GREEN),
          part(cone(0.011, 0.034, 8), 0.05, 0.017, 0.006, GREEN),
          part(cone(0.009, 0.028, 8), 0.02, 0.014, -0.045, GREEN),
        );
    }
    return G.util.mergeGeometries(P);
  }

  // ------------------------------------------------------------------
  // Set dressing: street-vendor souvenir cart (miniatures), the furniture the
  // Keys to the City lie on, the flyer board. Built once, shared by every spot.
  // ------------------------------------------------------------------
  function cartGeo() {
    const P = [];
    const STEEL = 0x9ba3a7,
      STEEL_D = 0x656d71,
      TOP = 0xb9bec0,
      RUB = 0x1d1d1d,
      WOOD = 0x7a5a3a,
      WOOD_D = 0x5e4430;
    const LIB = 0x6fa58f,
      MUG = 0xe6e0d0,
      TAXI = 0xd6a91c,
      PEN = 0xa8322a;
    P.push(part(box(1.3, 0.6, 0.66), 0, 0.66, 0, STEEL)); // body
    P.push(part(box(1.24, 0.05, 0.6), 0, 0.345, 0, STEEL_D)); // lower frame
    P.push(part(box(1.36, 0.04, 0.74), 0, 0.98, 0, TOP)); // counter
    P.push(
      part(box(1.36, 0.07, 0.02), 0, 1.03, -0.36, TOP),
      part(box(0.02, 0.07, 0.74), -0.67, 1.03, 0, TOP),
      part(box(0.02, 0.07, 0.74), 0.67, 1.03, 0, TOP),
    );
    P.push(
      part(box(1.32, 0.02, 0.02), 0, 0.95, 0.335, STEEL_D),
      part(box(1.32, 0.02, 0.02), 0, 0.38, 0.335, STEEL_D),
    ); // panel trim
    for (const z of [-0.36, 0.36]) {
      // spoked wheels
      P.push(
        part(cyl(0.2, 0.2, 0.06, 16), -0.42, 0.2, z, RUB, 0, PI / 2),
        part(cyl(0.07, 0.07, 0.075, 8), -0.42, 0.2, z, STEEL_D, 0, PI / 2),
      );
      for (let k = 0; k < 3; k++)
        P.push(
          part(
            box(0.3, 0.015, 0.02),
            -0.42,
            0.2,
            z,
            STEEL_D,
            0,
            0,
            (k * PI) / 3,
          ),
        );
    }
    P.push(part(cyl(0.02, 0.02, 0.76, 6), -0.42, 0.2, 0, STEEL_D, 0, PI / 2)); // axle
    for (const z of [-0.27, 0.27])
      P.push(part(box(0.05, 0.36, 0.05), 0.55, 0.18, z, STEEL_D)); // legs
    P.push(
      part(cyl(0.018, 0.018, 0.64, 6), 0.8, 0.93, 0, STEEL_D, 0, PI / 2), // push handle
      part(box(0.18, 0.03, 0.03), 0.72, 0.93, -0.3, STEEL_D),
      part(box(0.18, 0.03, 0.03), 0.72, 0.93, 0.3, STEEL_D),
    );
    P.push(
      part(cyl(0.017, 0.017, 1.5, 6), -0.52, 1.72, -0.2, STEEL_D, 0, 0, 0.09),
    ); // umbrella pole (leaning)
    P.push(
      part(box(0.86, 0.12, 0.2), 0.16, 1.06, -0.23, WOOD),
      part(box(0.86, 0.24, 0.12), 0.16, 1.12, -0.31, WOOD_D),
    ); // stepped display rack
    for (let i = 0; i < 4; i++) {
      // Liberty statuettes (one toppled)
      const x = -0.18 + i * 0.2;
      if (i === 2) {
        P.push(
          part(cyl(0.017, 0.024, 0.1, 6), x, 1.135, -0.2, LIB, 0.4, 0, PI / 2),
        );
        continue;
      }
      P.push(
        part(box(0.045, 0.02, 0.045), x, 1.13, -0.22, LIB),
        part(cyl(0.015, 0.022, 0.1, 6), x, 1.19, -0.22, LIB),
        part(new THREE.SphereGeometry(0.013, 6, 5), x, 1.252, -0.22, LIB),
        part(
          cyl(0.004, 0.004, 0.05, 4),
          x + 0.016,
          1.262,
          -0.22,
          LIB,
          0,
          0,
          -0.35,
        ),
        part(cone(0.008, 0.016, 5), x + 0.024, 1.292, -0.22, 0xd8b048),
      );
    }
    for (let i = 0; i < 5; i++)
      P.push(
        part(
          cyl(0.028, 0.026, 0.07, 8),
          -0.16 + i * 0.16,
          1.275,
          -0.31,
          i === 3 ? PEN : MUG,
        ),
      ); // mugs
    P.push(
      part(box(0.1, 0.035, 0.045), 0.46, 1.018, 0.2, TAXI, 0.5),
      part(box(0.05, 0.02, 0.04), 0.46, 1.045, 0.2, TAXI, 0.5),
    ); // toy taxi
    P.push(
      part(box(0.14, 0.004, 0.09), -0.42, 1.002, 0.16, 0xd9cfa8, 0.2),
      part(box(0.14, 0.004, 0.09), -0.38, 1.006, 0.2, 0xc4d0d8, -0.3),
    ); // postcards
    // pennant string between pole and rack
    P.push(
      part(cyl(0.008, 0.008, 0.34, 4), 0.57, 1.4, -0.34, STEEL_D), // pennant post on the rack
      part(
        cyl(0.004, 0.004, 1.14, 4),
        0.015,
        1.555,
        -0.34,
        0x2a2a2a,
        0,
        0,
        PI / 2 - 0.04,
      ),
    ); // string from the umbrella pole
    for (let i = 0; i < 5; i++)
      P.push(
        part(
          cone(0.03, 0.12, 3),
          -0.4 + i * 0.22,
          1.5 + (i - 2) * 0.01 * -1,
          -0.34,
          i % 2 ? PEN : 0x2c4f86,
          0,
          PI,
          0,
        ),
      );
    // spilled stock on the pavement
    P.push(
      part(cyl(0.028, 0.026, 0.07, 8), 0.35, 0.03, 0.55, MUG, 0.3, PI / 2),
      part(box(0.14, 0.004, 0.09), 0.1, 0.004, 0.62, 0xd9cfa8, 0.9),
      part(box(0.14, 0.004, 0.09), -0.25, 0.004, 0.5, 0xc4d0d8, 2.1),
      part(cyl(0.017, 0.024, 0.1, 6), 0.62, 0.024, -0.5, LIB, 1.2, 0, PI / 2),
    );
    return G.util.mergeGeometries(P);
  }
  /** Tattered vendor umbrella: striped cone, one panel torn away, slight droop. */
  function canopyGeo() {
    const segs = 12,
      g = new THREE.ConeGeometry(0.98, 0.34, segs, 1, true).toNonIndexed();
    const pos = g.attributes.position,
      n = pos.count,
      keep = [],
      col = [];
    const A = new THREE.Color(0xc9a53e),
      B = new THREE.Color(0x2c5783);
    for (let t = 0; t < n; t += 3) {
      const cx = (pos.getX(t) + pos.getX(t + 1) + pos.getX(t + 2)) / 3,
        cz = (pos.getZ(t) + pos.getZ(t + 1) + pos.getZ(t + 2)) / 3;
      const seg =
        Math.floor(((Math.atan2(cz, cx) + PI) / (2 * PI)) * segs) % segs;
      if (seg === 4) continue; // torn panel
      const c = seg % 2 ? A : B;
      for (let k = 0; k < 3; k++) {
        const i = t + k;
        let y = pos.getY(i);
        const x = pos.getX(i),
          z = pos.getZ(i);
        if (y < 0) y -= 0.05 * (0.5 + 0.5 * Math.sin(Math.atan2(z, x) * 3)); // droopy hem
        keep.push(x, y, z);
        col.push(c.r * 0.82, c.g * 0.82, c.b * 0.82);
      }
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(keep, 3));
    out.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    out.computeVertexNormals();
    return G.util.bake(out, { x: -0.587, y: 2.44, z: -0.2 }, 0, 1, 0, 0.09);
  }
  function cartSignGeo() {
    const a = new THREE.PlaneGeometry(1.18, 0.5);
    a.translate(0, 0.66, 0.332);
    const b = new THREE.PlaneGeometry(1.18, 0.5);
    b.rotateY(PI);
    b.translate(0, 0.66, -0.332);
    return G.util.mergeGeometries([a, b]);
  }
  // ------------------------------------------------------------------
  // The Key to the City. Local frame: lying flat (thickness along y), the bow
  // at the origin end, the shaft along +x, the bit hanging toward -z; ~0.3 m.
  // ------------------------------------------------------------------
  const GOLD = 0xe2b04a,
    GOLD_D = 0xa87828,
    GOLD_L = 0xf4d27a;
