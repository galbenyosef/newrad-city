// play-inline-281 04 — add
// Lines 700-868 of readable/play-inline-281.pretty.js (statement-aligned).
  K.bus = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry, 0, o.roll || 0);
    const L = 10.5,
      W = 2.5,
      H = 2.9,
      r = P.rng(x * 3 + z * 7);
    const paint = o.paint || "bus_paint",
      add = (k, g, op) =>
        b.geo(k, g, M, Object.assign({ noAO: true, grime: 0.55 }, op || {}));
    const sink = o.flat ? -0.18 : 0;
    // lower body + skirt
    add(paint, new THREE.BoxGeometry(W, 1.05, L).translate(0, 0.72 + sink, 0));
    add(
      "rust",
      new THREE.BoxGeometry(W + 0.04, 0.18, L + 0.02).translate(
        0,
        0.3 + sink,
        0,
      ),
    );
    add(
      "stainless",
      new THREE.BoxGeometry(W + 0.05, 0.08, L + 0.03).translate(
        0,
        1.22 + sink,
        0,
      ),
    );
    // window band: pillars + glass
    const nWin = 7;
    for (let i = 0; i <= nWin; i++) {
      const zz = -L / 2 + 0.6 + (i * (L - 1.4)) / nWin;
      for (const s of [-1, 1])
        add(
          paint,
          new THREE.BoxGeometry(0.08, 0.95, 0.16).translate(
            s * (W / 2 - 0.04),
            1.72 + sink,
            zz,
          ),
        );
    }
    for (let i = 0; i < nWin; i++) {
      const zz = -L / 2 + 0.6 + ((i + 0.5) * (L - 1.4)) / nWin;
      for (const s of [-1, 1])
        add(
          r() < 0.45 ? "glass_broken" : "glass_dark",
          new THREE.BoxGeometry(0.03, 0.8, (L - 1.4) / nWin - 0.16).translate(
            s * (W / 2 - 0.05),
            1.72 + sink,
            zz,
          ),
        );
    }
    // roof (rounded) + roof rim
    add(
      paint,
      new THREE.CylinderGeometry(W / 2, W / 2, L - 0.3, 12, 1, false, -HP, PI)
        .rotateX(HP)
        .scale(1, 0.34, 1)
        .translate(0, 2.2 + sink, 0),
    );
    add(
      "stainless",
      new THREE.BoxGeometry(W + 0.02, 0.06, L - 0.2).translate(
        0,
        2.2 + sink,
        0,
      ),
    );
    // front: windshield (split), destination box, bumper, headlights
    add(
      paint,
      new THREE.BoxGeometry(W, 2.0, 0.2).translate(0, 1.2 + sink, L / 2 - 0.05),
    );
    for (const s of [-1, 1])
      add(
        r() < 0.5 ? "glass_broken" : "glass_dark",
        new THREE.BoxGeometry(W / 2 - 0.15, 0.8, 0.04).translate(
          (s * W) / 4,
          1.72 + sink,
          L / 2 + 0.06,
        ),
      );
    add(
      o.destKey || "paint_black",
      new THREE.BoxGeometry(1.5, 0.28, 0.05).translate(
        0,
        2.3 + sink,
        L / 2 + 0.06,
      ),
    );
    add(
      "stainless",
      new THREE.BoxGeometry(W + 0.1, 0.18, 0.18).translate(
        0,
        0.42 + sink,
        L / 2 + 0.12,
      ),
    );
    for (const s of [-1, 1])
      add(
        "chrome",
        new THREE.CylinderGeometry(0.12, 0.12, 0.06, 10)
          .rotateX(HP)
          .translate(s * 0.85, 0.85 + sink, L / 2 + 0.07),
      );
    // rear: engine grille
    add(
      paint,
      new THREE.BoxGeometry(W, 2.0, 0.2).translate(
        0,
        1.2 + sink,
        -L / 2 + 0.05,
      ),
    );
    for (let k = 0; k < 6; k++)
      add(
        "iron",
        new THREE.BoxGeometry(1.6, 0.04, 0.03).translate(
          0,
          0.6 + k * 0.1 + sink,
          -L / 2 - 0.06,
        ),
      );
    add(
      "glass_dark",
      new THREE.BoxGeometry(1.4, 0.5, 0.04).translate(
        0,
        1.85 + sink,
        -L / 2 - 0.05,
      ),
    );
    // door (front right)
    add(
      "glass_dark",
      new THREE.BoxGeometry(0.04, 1.8, 0.9).translate(
        W / 2 + 0.01,
        1.2 + sink,
        L / 2 - 0.9,
      ),
    );
    // wheels (flat tyres sit lower)
    for (const zz of [L / 2 - 1.8, -L / 2 + 2.2])
      for (const s of [-1, 1]) {
        add(
          "rubber",
          new THREE.CylinderGeometry(0.5, 0.5, 0.32, 12)
            .rotateZ(HP)
            .translate(s * (W / 2 - 0.12), 0.5 + sink * 0.8, zz),
        );
        add(
          "rust",
          new THREE.CylinderGeometry(0.26, 0.26, 0.34, 8)
            .rotateZ(HP)
            .translate(s * (W / 2 - 0.1), 0.5 + sink * 0.8, zz),
        );
      }
    // stripe
    add(
      o.stripe || "paint_red",
      new THREE.BoxGeometry(W + 0.02, 0.14, L - 0.3).translate(
        0,
        1.0 + sink,
        0,
      ),
    );
  };
