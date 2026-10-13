// play-inline-373 02 — three
// Lines 32-260 of readable/play-inline-373.pretty.js (statement-aligned).
  const P = G._m3,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  const UY = 4.6,
    BY = -4;

  /** A toy hanging from the ceiling on a wire (local batch coords). kind: plane|truck|helmet|bat|racket|zeppelin|rotorcraft|fizzo_truck|puck|boat */
  function toy(b, kind, x, y, z, ry, r, ceil) {
    const M = P.m4(x, y, z, ry);
    const g = (k, geo, m) => {
      const sk = P.silkKey(k);
      return b.geo(sk[0], geo, m ? M.clone().multiply(m) : M.clone(), {
        noAO: true,
        grime: 0.35,
        c: sk[1],
      });
    };
    const col = [
      "paint_red",
      "paint_blue",
      "paint_green",
      "paint_cream",
      "silk_yellow",
      "paint_white",
      "chrome",
    ][Math.floor(r() * 7)];
    const top = (ceil || 4.15) - y;
    b.rod("iron", [x, y + 0.05, z], [x, y + top, z], 0.004, 3, { noAO: true });
    if (kind === "plane") {
      g(col, new THREE.CylinderGeometry(0.05, 0.035, 0.7, 7).rotateX(HP));
      g(col, new THREE.BoxGeometry(0.9, 0.015, 0.14).translate(0, 0.01, -0.06));
      g(col, new THREE.BoxGeometry(0.3, 0.012, 0.08).translate(0, 0.03, 0.3));
      g(col, new THREE.BoxGeometry(0.012, 0.12, 0.08).translate(0, 0.08, 0.31));
      g("iron", new THREE.BoxGeometry(0.18, 0.02, 0.01).translate(0, 0, -0.36));
    } else if (kind === "truck" || kind === "fizzo_truck") {
      const c2 = kind === "fizzo_truck" ? "paint_red" : col;
      g(c2, new THREE.BoxGeometry(0.2, 0.18, 0.42).translate(0, 0.09, 0.06));
      g(
        kind === "fizzo_truck" ? "paint_white" : "chrome",
        new THREE.BoxGeometry(0.19, 0.14, 0.14).translate(0, 0.07, -0.22),
      );
      for (const sx of [-1, 1])
        for (const sz of [-0.22, 0.16])
          g(
            "rubber",
            new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8)
              .rotateZ(HP)
              .translate(sx * 0.11, -0.02, sz),
          );
    } else if (kind === "helmet") {
      g(
        col,
        new THREE.SphereGeometry(0.13, 8, 6, 0, TAU, 0, HP * 1.15).scale(
          1,
          1,
          1.15,
        ),
      );
      for (let k = 0; k < 3; k++)
        g(
          "chrome",
          new THREE.TorusGeometry(0.1, 0.006, 3, 8, PI)
            .rotateY(HP)
            .translate(0, -0.03 - k * 0.03, 0.08),
        );
    } else if (kind === "bat") {
      g("wood", new THREE.CylinderGeometry(0.03, 0.012, 0.8, 6).rotateZ(1.2));
    } else if (kind === "racket") {
      g(
        "wood",
        new THREE.TorusGeometry(0.12, 0.012, 4, 12)
          .scale(1, 1.3, 1)
          .translate(0, 0.2, 0),
      );
      g(
        "wood",
        new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4).translate(0, -0.1, 0),
      );
    } else if (kind === "zeppelin") {
      g("paint_cream", new THREE.SphereGeometry(0.1, 10, 6).scale(1, 1, 3.0));
      g("iron", new THREE.BoxGeometry(0.08, 0.06, 0.2).translate(0, -0.16, 0));
    } else if (kind === "rotorcraft") {
      // tandem twin-rotor helicopter: fuselage, two masts, two rotor discs fore and aft
      g(
        "continuity_black",
        new THREE.CylinderGeometry(0.07, 0.07, 0.6, 8).rotateX(HP),
      );
      for (const sz of [-1, 1]) {
        g(
          "continuity_black",
          new THREE.CylinderGeometry(0.015, 0.015, 0.1, 5).translate(
            0,
            0.11,
            sz * 0.24,
          ),
        );
        g(
          "continuity_black",
          new THREE.CylinderGeometry(0.22, 0.22, 0.008, 12).translate(
            0,
            0.16,
            sz * 0.24,
          ),
        );
      }
    } else if (kind === "boat") {
      g(col, new THREE.BoxGeometry(0.16, 0.08, 0.6).translate(0, 0, 0));
      g(
        "paint_white",
        new THREE.BoxGeometry(0.1, 0.1, 0.18).translate(0, 0.09, -0.05),
      );
      g(
        "paint_black",
        new THREE.CylinderGeometry(0.025, 0.025, 0.12, 5).translate(
          0,
          0.2,
          -0.05,
        ),
      );
    } else {
      g("rubber", new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10));
    }
  }

  /** Bottle rack (wine) against a wall: lattice + bottle ends. Along x (wall at z, facing +z if dir>0). */
  function rackX(b, x0, x1, y, z, dir, h, r) {
    const d = 0.45 * dir;
    b.box(
      "wood_dark",
      Math.min(x0, x1),
      y,
      Math.min(z, z + d),
      Math.max(x0, x1),
      y + 0.06,
      Math.max(z, z + d),
      { seg: false },
    );
    for (let yy = y + 0.3; yy < y + h; yy += 0.3)
      b.box(
        "wood_dark",
        Math.min(x0, x1),
        yy,
        Math.min(z, z + d),
        Math.max(x0, x1),
        yy + 0.025,
        Math.max(z, z + d),
        { seg: false, noAO: true },
      );
    for (let xx = x0; xx <= x1 + 1e-3; xx += 0.3)
      b.box(
        "wood_dark",
        xx - 0.02,
        y,
        Math.min(z, z + d),
        xx + 0.02,
        y + h,
        Math.max(z, z + d),
        { seg: false, noAO: true },
      );
    for (let xx = x0 + 0.15; xx < x1; xx += 0.3)
      for (let yy = y + 0.15; yy < y + h - 0.1; yy += 0.3) {
        if (r() < 0.22) continue;
        b.cyl(
          r() < 0.55 ? "glass_dark" : "glass",
          xx,
          yy,
          z + d * 0.55,
          0.04,
          0.04,
          0.34,
          6,
          { rx: HP, noAO: true, grime: 0.6 },
        );
      }
  }
  function rackZ(b, z0, z1, y, x, dir, h, r) {
    const d = 0.45 * dir;
    b.box(
      "wood_dark",
      Math.min(x, x + d),
      y,
      Math.min(z0, z1),
      Math.max(x, x + d),
      y + 0.06,
      Math.max(z0, z1),
      { seg: false },
    );
    for (let yy = y + 0.3; yy < y + h; yy += 0.3)
      b.box(
        "wood_dark",
        Math.min(x, x + d),
        yy,
        Math.min(z0, z1),
        Math.max(x, x + d),
        yy + 0.025,
        Math.max(z0, z1),
        { seg: false, noAO: true },
      );
    for (let zz = z0; zz <= z1 + 1e-3; zz += 0.3)
      b.box(
        "wood_dark",
        Math.min(x, x + d),
        y,
        zz - 0.02,
        Math.max(x, x + d),
        y + h,
        zz + 0.02,
        { seg: false, noAO: true },
      );
    for (let zz = z0 + 0.15; zz < z1; zz += 0.3)
      for (let yy = y + 0.15; yy < y + h - 0.1; yy += 0.3) {
        if (r() < 0.22) continue;
        b.cyl(
          r() < 0.55 ? "glass_dark" : "glass",
          x + d * 0.55,
          yy,
          zz,
          0.04,
          0.04,
          0.34,
          6,
          { rz: HP, noAO: true, grime: 0.6 },
        );
      }
  }

