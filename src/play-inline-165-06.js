// play-inline-165 06 — math
// Lines 1224-1433 of readable/play-inline-165.pretty.js (statement-aligned).
  const _ray = new THREE.Raycaster();
  function ceilingAbove(cell, x, y, z) {
    const root = cell.ceilMeshes || cell.root;
    if (!root) return null;
    root.updateMatrixWorld(true);
    const meshes = [];
    root.traverse((o) => {
      if (!o.isMesh || !o.geometry || (o.material && o.material.transparent))
        return;
      const g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      const b = g.boundingBox; // kit meshes carry identity transforms (world-space vertices)
      if (
        x < b.min.x ||
        x > b.max.x ||
        z < b.min.z ||
        z > b.max.z ||
        b.max.y < y + 2
      )
        return;
      meshes.push(o);
    });
    _ray.set(new THREE.Vector3(x, y + 0.6, z), new THREE.Vector3(0, 1, 0));
    _ray.far = 16;
    const hits = _ray.intersectObjects(meshes, false);
    for (const h of hits) {
      if (h.distance < 1.8) return null;
      if (h.face && h.face.normal.y < -0.5) return y + 0.6 + h.distance;
      return null;
    }
    return null;
  }
  function collapse(cell, E, p, ceil, idx) {
    const r = E.rnd,
      W = G.world;
    const R = 1.3 + r() * 1.1,
      H = Math.min(1.5, 0.8 + R * 0.3),
      y = p.y,
      cx = p.x,
      cz = p.z;
    // mound
    const n = Math.round(26 + R * 16);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = Math.pow(r(), 0.7) * R,
        h = H * Math.pow(Math.max(0, 1 - d / R), 1.1);
      const s = 0.14 + r() * 0.34 * (0.5 + d / R);
      E.put(
        ROCK_ROLES[(r() * 4) | 0],
        rockGeo((r() * 5) | 0),
        M(
          cx + Math.cos(a) * d,
          y + Math.max(s * 0.2, h - s * 0.25),
          cz + Math.sin(a) * d,
          r() * 3,
          r() * 6,
          r() * 3,
          s,
          s * (0.55 + r() * 0.35),
          s,
        ),
      );
    }
    // leaning slabs (fallen ceiling)
    for (let i = 0; i < 3 + ((r() * 3) | 0); i++) {
      const a = r() * TAU,
        d = R * (0.35 + r() * 0.6),
        tilt = 0.35 + r() * 0.6,
        w = 0.9 + r() * 1.0,
        L = 0.8 + r() * 0.9;
      E.put(
        r() < 0.6 ? "concrete" : "plaster",
        box(),
        M(
          cx + Math.cos(a) * d,
          y + H * 0.35 + Math.sin(tilt) * L * 0.3,
          cz + Math.sin(a) * d,
          tilt,
          Math.atan2(Math.cos(a), Math.sin(a)) + Math.PI,
          (r() - 0.5) * 0.3,
          w,
          0.1 + r() * 0.06,
          L,
        ),
      );
    }
    // rebar sticking out of the mound
    for (let i = 0; i < 6 + ((r() * 5) | 0); i++) {
      const a = r() * TAU,
        d = r() * R * 0.7,
        L = 0.7 + r() * 1.3;
      E.put(
        "metal",
        cyl(),
        M(
          cx + Math.cos(a) * d,
          y + H * (1 - d / R) * 0.7 + L * 0.35,
          cz + Math.sin(a) * d,
          (r() - 0.5) * 1.6,
          r() * TAU,
          (r() - 0.5) * 1.6,
          0.024,
          L,
          0.024,
        ),
      );
    }
    for (let i = 0; i < 4; i++)
      EMIT.plank(E, {
        x: cx + (r() - 0.5) * R * 1.6,
        y: y + 0.05,
        z: cz + (r() - 0.5) * R * 1.6,
        wa: 0,
        wd: 9,
      });
    // dust fan around it
    E.decal("stain", cx, y, cz, r() * TAU, R * 3.4, R * 3.0, 0.9);
    E.decal("scraps", cx + R, y, cz - R * 0.5, r() * TAU, 1.4);
    // colliders: two walkable steps so the mound is climbable and never blocks a path
    W.addCollider(
      cx,
      cz,
      R * 1.15,
      R * 1.15,
      y - 0.2,
      y + Math.min(0.42, H * 0.35),
      r() * TAU,
      { tag: "poi_clutter", surface: "rubble" },
    );
    W.addCollider(
      cx,
      cz,
      R * 0.6,
      R * 0.6,
      y - 0.2,
      y + Math.min(0.84, H * 0.7),
      r() * TAU,
      { tag: "poi_clutter", surface: "rubble" },
    );
    // the hole in the ceiling (+ jagged rim, a hanging slab, lath & rebar)
    if (ceil) {
      const hr = R * 1.05,
        yc = ceil - 0.015;
      E.put(
        "dark",
        holeGeo(idx % 4),
        M(cx, yc, cz, 0, r() * TAU, 0, hr * 2, 1, hr * 2),
      );
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + r() * 0.3,
          d = hr * (0.72 + r() * 0.2);
        E.put(
          r() < 0.5 ? "plaster" : "concrete",
          box(),
          M(
            cx + Math.cos(a) * d,
            yc - 0.08 - r() * 0.12,
            cz + Math.sin(a) * d,
            (r() - 0.5) * 0.8,
            -a,
            (r() - 0.5) * 0.8,
            0.3 + r() * 0.4,
            0.07,
            0.2 + r() * 0.2,
          ),
        );
      }
      const ha = r() * TAU,
        hl = Math.min(ceil - y - 1.2, 1.3 + r() * 0.8);
      E.put(
        "concrete",
        box(),
        M(
          cx + Math.cos(ha) * hr * 0.55,
          yc - Math.sin(1.05) * hl * 0.5,
          cz + Math.sin(ha) * hr * 0.55,
          1.05,
          Math.atan2(Math.cos(ha), Math.sin(ha)),
          0,
          1.2,
          0.1,
          hl,
        ),
      );
      for (let i = 0; i < 7; i++) {
        const a = r() * TAU,
          d = hr * (0.5 + r() * 0.4),
          L = 0.4 + r() * 1.2;
        E.put(
          r() < 0.4 ? "wood" : "metal",
          r() < 0.4 ? box() : cyl(),
          M(
            cx + Math.cos(a) * d,
            yc - L / 2,
            cz + Math.sin(a) * d,
            (r() - 0.5) * 0.5,
            0,
            (r() - 0.5) * 0.5,
            r() < 0.4 ? 0.04 : 0.02,
            L,
            r() < 0.4 ? 0.02 : 0.02,
          ),
        );
      }
    }
  }

  // ------------------------------------------------------------------
  // vignettes (environmental stories)
  // ------------------------------------------------------------------
