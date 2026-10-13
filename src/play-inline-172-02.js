// play-inline-172 02 — grime
// Lines 20-360 of readable/play-inline-172.pretty.js (statement-aligned).
  const K = G.PMID.kit;
  const T = K.T;
  const PI = Math.PI,
    HP = PI / 2;
  const F = (K.f = {});

  // ------------------------------------------------------------------
  // Interior shells
  // ------------------------------------------------------------------
  const _d = new THREE.Vector3(),
    _up = new THREE.Vector3(0, 1, 0),
    _n = new THREE.Vector3(),
    _m = new THREE.Matrix4();
  /**
   * Inner face of a wall from A to B (xz) between y0..y1, facing the point `toward` [x,z].
   * The face sits `t/2` inside the boundary line; openings [{at (m from A), w, h, y?, arch?, pointed?}]
   * are cut out and get half-depth reveals (the neighbouring room adds the other half).
   * o: {t=0.3, tint, grime, reveal=true, revealMat, col=true (collider along the boundary), colOpts}
   */
  K.skin = function (b, mat, ax, az, bx, bz, y0, y1, toward, openings, o) {
    o = o || {};
    const t = o.t !== undefined ? o.t : 0.3;
    let L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) return;
    let dx = (bx - ax) / L,
      dz = (bz - az) / L;
    // desired inward normal
    let nx = -dz,
      nz = dx;
    const tx = toward[0] - ax,
      tz = toward[1] - az;
    let flip = nx * tx + nz * tz < 0;
    let sx = ax,
      sz = az;
    const ops = (openings || []).map((op) => Object.assign({}, op));
    if (flip) {
      sx = bx;
      sz = bz;
      dx = -dx;
      dz = -dz;
      nx = -dz;
      nz = dx;
      for (const op of ops) op.at = L - op.at;
    }
    const h = y1 - y0;
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(L, 0);
    sh.lineTo(L, h);
    sh.lineTo(0, h);
    sh.lineTo(0, 0);
    for (const op of ops) {
      const hw = op.w / 2,
        sy = op.y || 0,
        top = Math.min(h - 0.02, op.h + sy);
      const p = new THREE.Path();
      if (op.arch) {
        const springY = top - hw;
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, springY);
        p.absarc(op.at, springY, hw, 0, PI, false);
        p.lineTo(op.at - hw, sy);
      } else {
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, top);
        p.lineTo(op.at - hw, top);
        p.lineTo(op.at - hw, sy);
      }
      sh.holes.push(p);
    }
    const g = new THREE.ShapeGeometry(sh, 10);
    const off = t / 2;
    _d.set(dx, 0, dz);
    _n.set(nx, 0, nz);
    _m.makeBasis(_d, _up, _n).setPosition(sx + nx * off, y0, sz + nz * off);
    b.geo(mat, g, { matrix: _m.clone(), tint: o.tint, grime: o.grime });
    g.dispose();
    // reveals: jambs + soffit, half the wall depth (from the face back to the boundary line)
    if (o.reveal !== false) {
      const rm = o.revealMat || mat;
      for (const op of ops) {
        const hw = op.w / 2,
          sy = op.y || 0,
          top = Math.min(h - 0.02, op.h + sy);
        const cx = sx + dx * op.at + (nx * off) / 2,
          cz = sz + dz * op.at + (nz * off) / 2;
        const yaw = Math.atan2(dx, dz) - HP; // local x along the wall
        const jambH = op.arch ? top - hw - sy : top - sy;
        for (const sgn of [-1, 1])
          b.box(
            rm,
            cx + dx * hw * sgn + dx * 0.01 * sgn,
            y0 + sy,
            cz + dz * hw * sgn + dz * 0.01 * sgn,
            0.02,
            jambH,
            off,
            { yaw, tint: o.tint, grime: o.grime, faces: "ew" },
          );
        if (!op.arch)
          b.box(rm, cx, y0 + top, cz, op.w, 0.02, off, {
            yaw,
            tint: o.tint,
            grime: o.grime,
            faces: "b",
          });
        else {
          const segs = 10;
          for (let i = 0; i < segs; i++) {
            const a0 = (PI * i) / segs,
              a1 = (PI * (i + 1)) / segs;
            const u0 = Math.cos(a0) * hw,
              v0 = Math.sin(a0) * hw,
              u1 = Math.cos(a1) * hw,
              v1 = Math.sin(a1) * hw;
            const spring = y0 + top - hw;
            const P = (u, v, k) => [
              cx + dx * u + ((nx * off) / 2) * k,
              spring + v,
              cz + dz * u + ((nz * off) / 2) * k,
            ];
            b.quad(
              rm,
              P(u0, v0, -1),
              P(u1, v1, -1),
              P(u1, v1, 1),
              P(u0, v0, 1),
              { tint: o.tint, grime: 0, double: true },
            );
          }
        }
      }
    }
    if (o.col !== false)
      K.colWall(ax, az, bx, bz, t, y0, y1, openings, o.colOpts);
  };

  /**
   * Room shell. r: {x0,x1,z0,z1, y=0, h, floor, wall, ceil (null = none), walls:'nsew', doors:{n:[...],s:[...],e:[...],w:[...]},
   *   t, floorTint, wallTint, ceilTint, base (baseboard mat), baseTint, cornice (mat), corniceTint, wain {mat,h,tint},
   *   surface, noFloorCol, grime, floorGrime, wallCol (false = no colliders)}
   * Door lists use `at` measured from x0 (n/s walls) or z0 (e/w walls).
   */
  K.room = function (b, r) {
    const y = r.y || 0,
      h = r.h || 3.2,
      t = r.t !== undefined ? r.t : 0.3;
    const x0 = r.x0,
      x1 = r.x1,
      z0 = r.z0,
      z1 = r.z1;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2,
      w = x1 - x0,
      d = z1 - z0;
    const walls = r.walls === undefined ? "nsew" : r.walls;
    const doors = r.doors || {};
    if (r.floor) {
      b.box(r.floor, cx, y - 0.25, cz, w, 0.25, d, {
        faces: "t",
        tint: r.floorTint,
        grime: r.floorGrime !== undefined ? r.floorGrime : r.grime,
        seg: 3,
      });
      if (!r.noFloorCol)
        K.colBox(x0 - t / 2, y - 0.6, z0 - t / 2, x1 + t / 2, y, z1 + t / 2, {
          surface: r.surface || "concrete",
        });
    }
    if (r.ceil)
      b.box(r.ceil, cx, y + h, cz, w, 0.2, d, {
        faces: "b",
        tint: r.ceilTint,
        grime: r.grime,
        seg: 3,
      });
    const sides = {
      n: [x0, z0, x1, z0],
      s: [x0, z1, x1, z1],
      w: [x0, z0, x0, z1],
      e: [x1, z0, x1, z1],
    };
    for (const k of "nsew") {
      if (walls.indexOf(k) < 0) continue;
      const s = sides[k];
      const ops = doors[k] || [];
      K.skin(b, r.wall, s[0], s[1], s[2], s[3], y, y + h, [cx, cz], ops, {
        t,
        tint: r.wallTint,
        grime: r.grime,
        col: r.wallCol !== false,
        colOpts: r.colOpts,
      });
      const len = Math.hypot(s[2] - s[0], s[3] - s[1]);
      // baseboard / wainscot / cornice strips, broken at door openings
      const strip = (mat, yb, hh, depth, tint) => {
        if (!mat) return;
        let a = 0;
        const cuts = ops
          .filter((op) => (op.y || 0) < yb + hh)
          .map((op) => [op.at - op.w / 2, op.at + op.w / 2])
          .sort((p, q) => p[0] - q[0]);
        const segs = [];
        for (const c of cuts) {
          if (c[0] > a) segs.push([a, c[0]]);
          a = Math.max(a, c[1]);
        }
        if (a < len) segs.push([a, len]);
        const dx = (s[2] - s[0]) / len,
          dz = (s[3] - s[1]) / len;
        let nx = -dz,
          nz = dx;
        if (nx * (cx - s[0]) + nz * (cz - s[1]) < 0) {
          nx = -nx;
          nz = -nz;
        }
        const yaw = Math.atan2(dx, dz) - HP;
        for (const sg of segs) {
          const m = (sg[0] + sg[1]) / 2,
            L = sg[1] - sg[0];
          if (L < 0.05) continue;
          b.box(
            mat,
            s[0] + dx * m + nx * (t / 2 + depth / 2),
            yb,
            s[1] + dz * m + nz * (t / 2 + depth / 2),
            L,
            hh,
            depth,
            { yaw, tint, grime: r.grime, faces: "nsewt" },
          );
        }
      };
      if (r.wain) strip(r.wain.mat, y, r.wain.h || 1.1, 0.04, r.wain.tint);
      strip(r.base, y, 0.16, 0.05, r.baseTint);
      if (r.cornice)
        strip(
          r.cornice,
          y + h - (r.corniceH || 0.3),
          r.corniceH || 0.3,
          0.14,
          r.corniceTint,
        );
    }
    return { x0, x1, z0, z1, y, h, cx, cz };
  };

  /** Walkable floor plate (visible top + optional underside) with collider. */
  K.slab = function (b, mat, x0, z0, x1, z1, y, o) {
    o = o || {};
    const th = o.th || 0.3;
    b.box(mat, (x0 + x1) / 2, y - th, (z0 + z1) / 2, x1 - x0, th, z1 - z0, {
      faces: o.faces || "tb",
      tint: o.tint,
      grime: o.grime,
      seg: 3,
    });
    if (o.edge)
      b.box(
        o.edge,
        (x0 + x1) / 2,
        y - th,
        (z0 + z1) / 2,
        x1 - x0,
        th,
        z1 - z0,
        { faces: "nsew", tint: o.edgeTint, grime: o.grime },
      );
    if (o.col !== false)
      K.colBox(x0, y - th - 0.2, z0, x1, y, z1, {
        surface: o.surface || "concrete",
      });
  };

  /** Coffered ceiling: beams in a grid hanging below y (the ceiling plane). */
  K.coffers = function (b, mat, x0, z0, x1, z1, y, step, depth, o) {
    o = o || {};
    const bw = o.bw || 0.35;
    for (let x = x0 + step; x < x1 - 0.01; x += step)
      b.box(mat, x, y - depth, (z0 + z1) / 2, bw, depth, z1 - z0, {
        faces: "ewb",
        tint: o.tint,
        grime: o.grime,
      });
    for (let z = z0 + step; z < z1 - 0.01; z += step)
      b.box(mat, (x0 + x1) / 2, y - depth, z, x1 - x0, depth, bw, {
        faces: "nsb",
        tint: o.tint,
        grime: o.grime,
      });
    if (o.rosette)
      for (let x = x0 + step / 2; x < x1; x += step)
        for (let z = z0 + step / 2; z < z1; z += step)
          b.cyl(o.rosette, x, y - 0.12, z, step * 0.16, step * 0.1, 0.12, 8, {
            tint: o.rosetteTint,
            grime: 0,
            top: false,
            bottom: true,
          });
  };

  /** Barrel vault (half cylinder along z) with optional coffers: centre x, spring height ys, radius R, from z0 to z1. */
  K.vault = function (b, mat, cx, ys, R, z0, z1, o) {
    o = o || {};
    const segs = o.segs || 16;
    const L = z1 - z0;
    for (let i = 0; i < segs; i++) {
      const a0 = (PI * i) / segs,
        a1 = (PI * (i + 1)) / segs;
      const p0 = [cx + Math.cos(a0) * R, ys + Math.sin(a0) * R],
        p1 = [cx + Math.cos(a1) * R, ys + Math.sin(a1) * R];
      // inside face (normal points to axis)
      b.quad(
        mat,
        [p1[0], p1[1], z0],
        [p0[0], p0[1], z0],
        [p0[0], p0[1], z1],
        [p1[0], p1[1], z1],
        {
          tint: o.tint,
          grime: o.grime || 0,
          rect: [0, 0, L / (o.tile || 4), ((a1 - a0) * R) / (o.tile || 4)],
        },
      );
      if (o.ribMat && i % (o.ribEvery || 2) === 0) {
        for (let z = z0; z <= z1 + 0.01; z += o.ribStep || 4)
          b.beam(o.ribMat, p0[0], p0[1], z, p1[0], p1[1], z, o.ribW || 0.3, {
            d: o.ribD || 0.3,
            tint: o.ribTint,
            grime: 0,
          });
      }
    }
  };

  // ------------------------------------------------------------------
  // Exterior massing
  // ------------------------------------------------------------------
  /** Façade-textured block (four sides with the facade atlas, flat roof). o: {roof, roofTint, faces, uo, tint, cornice, corniceMat, corniceTint} */
