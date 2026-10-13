/* src/poi_midtown/04_parts.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 04_parts.js
 * Reusable construction parts for the five Midtown POIs:
 *   - interior shells: K.skin (inner wall face with arched/rect openings
 *     + half-depth reveals), K.room (floor/ceiling/4 skins + colliders),
 *     K.slab (walkable floor plate), K.coffers (coffered ceilings)
 *   - exterior massing: K.block (façade-textured box with roof/cornice)
 *   - furniture & clutter merged into the builder (desks, chairs, benches,
 *     beds, booths, shelves, cabinets, columns, chandeliers, railings,
 *     debris, papers, sandbags, crates, pipes, bones)
 * Every helper takes the Builder `b` first and adds colliders where the
 * player could bump into the thing. Yaw is the three.js convention.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.PMID) return;
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
  K.block = function (b, mat, x0, z0, x1, z1, y0, y1, o) {
    o = o || {};
    b.box(mat, (x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, {
      faces: o.faces || "nsew",
      tint: o.tint,
      grime: o.grime,
      seg: o.seg || 7,
    });
    if (o.roof !== false)
      b.box(
        o.roof || "concrete_dark",
        (x0 + x1) / 2,
        y1,
        (z0 + z1) / 2,
        x1 - x0,
        0.01,
        z1 - z0,
        { faces: "t", tint: o.roofTint },
      );
    if (o.cornice) {
      const c = o.cornice,
        m = o.corniceMat || "limestone";
      b.box(
        m,
        (x0 + x1) / 2,
        y1 - c.h,
        (z0 + z1) / 2,
        x1 - x0 + c.d * 2,
        c.h,
        z1 - z0 + c.d * 2,
        { faces: "nsewtb", tint: o.corniceTint },
      );
    }
    if (o.col !== false)
      K.colBox(x0, y0, z0, x1, y1, z1, { surface: "concrete" });
  };
  /**
   * 3D window surrounds for a K.block that uses a K.facade material: the painted window grid gets a real
   * projecting stone sill, a lintel / hood (optionally with a keystone), and two jamb strips, so the façade
   * reads with depth and casts contact shadows instead of looking like wallpaper. Positions are derived from
   * the façade spec exactly the way BP.face lays out its UVs (u from each face's start corner, v = world y),
   * so every surround frames its painted window. Everything merges into the builder's existing batches
   * (no new draw calls; ~30 tris per window).
   * o: {faces:'nsew', mat, tint, maxY, minY, proj, keystone, jambs=true, hood:'flat'|'cornice',
   *     skip(x, z, yBottom, face) → true to leave a window bare (doors, portals),
   *     piers:{mat, tint, w, d, y0, y1} → pilasters on the bay boundaries (never across a window)}
   */
  K.reveals = function (b, key, x0, z0, x1, z1, y0, y1, o) {
    const s = K.facadeSpecs && K.facadeSpecs[key];
    if (!s) return 0;
    o = o || {};
    const w = s.win || { x0: 0.25, x1: 0.75, y0: 0.2, y1: 0.8 };
    const bw = s.bayW,
      fh = s.floorH;
    const mat = o.mat || "limestone",
      tint = o.tint === undefined ? 0xd4c8b0 : o.tint;
    const pr = o.proj || 0.14;
    const yMax = Math.min(y1, o.maxY === undefined ? 36 : o.maxY),
      yMin = Math.max(y0, o.minY || 0);
    const hw = ((w.x1 - w.x0) * bw) / 2,
      cu = ((w.x0 + w.x1) / 2) * bw;
    const FD = {
      s: { ox: x0, oz: z1, ux: 1, uz: 0, nx: 0, nz: 1, L: x1 - x0, back: "n" },
      n: {
        ox: x1,
        oz: z0,
        ux: -1,
        uz: 0,
        nx: 0,
        nz: -1,
        L: x1 - x0,
        back: "s",
      },
      e: { ox: x1, oz: z1, ux: 0, uz: -1, nx: 1, nz: 0, L: z1 - z0, back: "w" },
      w: { ox: x0, oz: z0, ux: 0, uz: 1, nx: -1, nz: 0, L: z1 - z0, back: "e" },
    };
    const all = "nsewtb";
    const without = (str, ch) =>
      str
        .split("")
        .filter((c) => ch.indexOf(c) < 0)
        .join("");
    // box helper: centre on the face at along-distance a, height y..y+h, length len along the face, depth d out of the wall
    const put = (F, m, a, y, h, len, d, faces, tn) => {
      const cx = F.ox + F.ux * a + (F.nx * d) / 2,
        cz = F.oz + F.uz * a + (F.nz * d) / 2;
      if (F.nx === 0) b.box(m, cx, y, cz, len, h, d, { faces, tint: tn });
      else b.box(m, cx, y, cz, d, h, len, { faces, tint: tn });
    };
    let n = 0;
    for (const f of o.faces || "nsew") {
      const F = FD[f];
      if (!F) continue;
      const fb = without(all, F.back);
      for (let k = Math.floor(yMin / fh); k * fh < yMax; k++) {
        const wb = k * fh + fh * w.y0,
          wt = k * fh + fh * w.y1;
        if (wb < yMin - 0.01 || wt > yMax + 0.01) continue;
        for (let a = cu; a + hw <= F.L - 0.25; a += bw) {
          if (a - hw < 0.25) continue;
          const wx = F.ox + F.ux * a,
            wz = F.oz + F.uz * a;
          if (o.skip && o.skip(wx, wz, wb, f)) continue;
          // sill: deeper than the rest, slight drip overhang
          put(F, mat, a, wb - 0.13, 0.13, hw * 2 + 0.34, pr + 0.08, fb, tint);
          // lintel / hood
          if (o.hood === "cornice") {
            put(F, mat, a, wt, 0.12, hw * 2 + 0.3, pr, fb, tint);
            put(F, mat, a, wt + 0.12, 0.1, hw * 2 + 0.46, pr + 0.07, fb, tint);
          } else put(F, mat, a, wt, 0.2, hw * 2 + 0.24, pr, fb, tint);
          if (o.keystone)
            put(F, mat, a, wt - 0.08, 0.36, 0.3, pr + 0.05, fb, tint);
          if (o.jambs !== false)
            for (const sg of [-1, 1])
              put(
                F,
                mat,
                a + sg * (hw + 0.05),
                wb,
                wt - wb,
                0.1,
                pr * 0.6,
                without(fb, "tb"),
                tint,
              );
          n++;
        }
      }
      // pilasters on the bay boundaries (between windows), full height of the band
      if (o.piers) {
        const P = o.piers,
          py0 = P.y0 === undefined ? y0 : P.y0,
          py1 = P.y1 === undefined ? y1 : P.y1;
        for (let a = bw; a < F.L - 0.3; a += bw) {
          const wx = F.ox + F.ux * a,
            wz = F.oz + F.uz * a;
          if (P.skip && P.skip(wx, wz, f)) continue;
          put(
            F,
            P.mat || mat,
            a,
            py0,
            py1 - py0,
            P.w || 0.5,
            P.d || 0.3,
            without(fb, "b"),
            P.tint === undefined ? tint : P.tint,
          );
        }
      }
    }
    return n;
  };
  /**
   * Hipped roof over a rectangle (ridge along the longer side unless o.axis 'x'|'z'), eaves at y, ridge at y+h.
   * o: {eave (overhang, m), tint, grime, tile} — tiled UVs (the roof texture keeps its texel density).
   */
  K.hipRoof = function (b, mat, x0, z0, x1, z1, y, h, o) {
    o = o || {};
    const ev = o.eave || 0;
    x0 -= ev;
    z0 -= ev;
    x1 += ev;
    z1 += ev;
    const axis = o.axis || (x1 - x0 >= z1 - z0 ? "x" : "z");
    const tile = o.tile || K.tile(mat)[0];
    // work in (u along ridge, v across); P maps back to world
    const U0 = axis === "x" ? x0 : z0,
      U1 = axis === "x" ? x1 : z1,
      V0 = axis === "x" ? z0 : x0,
      V1 = axis === "x" ? z1 : x1;
    const half = (V1 - V0) / 2,
      vc = (V0 + V1) / 2,
      Y = y + h;
    let r0 = U0 + half,
      r1 = U1 - half;
    if (r0 > r1) r0 = r1 = (U0 + U1) / 2; // forced short-axis ridge → pyramid
    const P = (u, yy, v) => (axis === "x" ? [u, yy, v] : [v, yy, u]);
    const slope = Math.hypot(half, h);
    const q = (a, bq, c, d, len) => {
      // keep CCW-from-outside winding in world space: the x↔z swap mirrors, so flip the order for axis 'z'
      const rect = [0, 0, len / tile, slope / tile];
      if (axis === "x")
        b.quad(mat, a, bq, c, d, {
          rect,
          tint: o.tint,
          grime: o.grime === undefined ? 0.5 : o.grime,
        });
      else
        b.quad(mat, bq, a, d, c, {
          rect,
          tint: o.tint,
          grime: o.grime === undefined ? 0.5 : o.grime,
        });
    };
    q(P(U0, y, V1), P(U1, y, V1), P(r1, Y, vc), P(r0, Y, vc), U1 - U0); // +v slope
    q(P(U1, y, V0), P(U0, y, V0), P(r0, Y, vc), P(r1, Y, vc), U1 - U0); // -v slope
    q(P(U1, y, V1), P(U1, y, V0), P(r1, Y, vc), P(r1, Y, vc), V1 - V0); // +u hip
    q(P(U0, y, V0), P(U0, y, V1), P(r0, Y, vc), P(r0, Y, vc), V1 - V0); // -u hip
    return { ridgeY: Y, r0, r1, vc, axis };
  };
  /**
   * NYC rooftop water tank: cedar-stave tub on a riveted steel stand, iron hoops, conical cap with a finial,
   * access ladder. (x,y,z) = roof point under the tank centre. o: {r, lean, broken}
   */
  K.waterTower = function (b, x, y, z, o) {
    o = o || {};
    const r = o.r || 2.1,
      legH = 3.2,
      tankH = 3.8,
      lean = o.lean || 0;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2,
        lx = x + Math.cos(a) * r * 0.85,
        lz = z + Math.sin(a) * r * 0.85;
      b.beam("rust", lx, y, lz, lx + lean * 0.5, y + legH, lz, 0.16);
    }
    for (let i = 0; i < 6; i++) {
      // cross bracing
      const a0 = (i / 6) * PI * 2,
        a1 = ((i + 1) / 6) * PI * 2,
        R0 = r * 0.85;
      b.beam(
        "rust",
        x + Math.cos(a0) * R0,
        y + 0.3,
        z + Math.sin(a0) * R0,
        x + Math.cos(a1) * R0 + lean * 0.45,
        y + legH - 0.3,
        z + Math.sin(a1) * R0,
        0.05,
      );
    }
    b.cyl(
      "rust",
      x + lean * 0.5,
      y + legH - 0.2,
      z,
      r + 0.15,
      r + 0.15,
      0.25,
      12,
      { top: true, tint: 0x6a5a4a },
    );
    const tx = x + lean * 0.5,
      ty = y + legH;
    b.cyl("wood_rotten", tx, ty, z, r, r * 0.94, tankH, 16, {
      tint: 0x7a6450,
      bottom: true,
    });
    for (let k = 0; k < 5; k++)
      b.cyl(
        "black_metal",
        tx,
        ty + 0.35 + (k * (tankH - 0.6)) / 4,
        z,
        r * (1.012 - k * 0.012) + 0.03,
        r * (1.012 - k * 0.012) + 0.03,
        0.08,
        16,
        { grime: 0.3 },
      );
    b.cyl("wood_dark", tx, ty + tankH, z, r * 1.02, 0.12, 1.5, 12, {
      tint: 0x5a4a3a,
    });
    b.geo("rust", T.sphereLo, { x: tx, y: ty + tankH + 1.55, z, s: 0.14 });
    // ladder up the stand and the tub
    const lx = tx + r + 0.12;
    for (const dz of [-0.22, 0.22])
      b.beam("black_metal", lx, y, z + dz, lx, ty + tankH + 0.3, z + dz, 0.04);
    for (let h = 0.4; h < legH + tankH; h += 0.4)
      b.beam("black_metal", lx, y + h, z - 0.22, lx, y + h, z + 0.22, 0.03);
    if (o.broken) {
      // a burst stave and a rust streak
      b.box("black", tx, ty + 0.9, z + r * 0.97, 0.5, 1.6, 0.02, {
        faces: "s",
        grime: 0,
      });
      b.box("wood_rotten", tx + 0.6, y, z + r + 0.6, 0.18, 0.05, 2.2, {
        yaw: 0.7,
        tint: 0x6a5642,
      });
    }
  };
  /**
   * Ruin-dense rooftop dressing inside a rectangle at roof height y: HVAC housings, vent stacks with
   * rain hoods, a stair bulkhead, skylight frame with broken panes, tar patches, a satellite of junk.
   * Deterministic by seed; stays `margin` metres from the edges. o: {tower:true|false, bulkhead, n}
   */
  K.roofKit = function (b, x0, z0, x1, z1, y, seed, o) {
    o = o || {};
    const r = K.rng(seed || 7),
      m = o.margin || 1.6;
    const W = x1 - x0 - 2 * m,
      D = z1 - z0 - 2 * m;
    if (W < 4 || D < 4) return;
    const at = (fx, fz) => [x0 + m + W * fx, z0 + m + D * fz];
    // tar patches (dark, slightly raised so they never z-fight the roof)
    for (let i = 0; i < 5; i++) {
      const p = at(r(), r());
      b.box(
        "slate",
        p[0],
        y + 0.015,
        p[1],
        1.5 + r() * 3,
        0.01,
        1 + r() * 2.5,
        { faces: "t", yaw: r() * PI, tint: 0x2a2a28, grime: 0.2 },
      );
    }
    if (o.tower !== false) {
      const p = at(0.25 + r() * 0.5, 0.2 + r() * 0.2);
      K.waterTower(b, p[0], y, p[1], {
        r: 1.8 + r() * 0.5,
        lean: r() < 0.3 ? 0.35 : 0,
        broken: r() < 0.5,
      });
    }
    if (o.bulkhead !== false) {
      // stair bulkhead with a door
      const p = at(0.1 + r() * 0.2, 0.65 + r() * 0.25);
      b.box("brick_brown", p[0], y, p[1], 3.2, 3.0, 2.6, { tint: 0x8a6a54 });
      b.box("slate", p[0], y + 3.0, p[1], 3.5, 0.2, 2.9, {
        faces: "nsewtb",
        tint: 0x3a3a38,
      });
      b.box("rust", p[0] + 0.5, y, p[1] + 1.31, 1.0, 2.1, 0.05, {
        tint: 0x5a4a3a,
      });
    }
    const n = o.n || 4;
    for (let i = 0; i < n; i++) {
      // HVAC housings with fan grilles
      const p = at(0.5 + r() * 0.45, r()),
        w = 1.4 + r() * 1.4,
        d = 1.2 + r(),
        h = 1.0 + r() * 0.8,
        yaw = Math.round(r() * 2) * HP;
      b.box("metal", p[0], y, p[1], w, h, d, { yaw, tint: 0x8a8a80 });
      b.cyl(
        "black_metal",
        p[0],
        y + h,
        p[1],
        Math.min(w, d) * 0.32,
        Math.min(w, d) * 0.32,
        0.12,
        10,
        { top: true },
      );
      for (let k = 0; k < 2; k++) {
        const q = F.rot(p[0], p[1], yaw, (k ? 1 : -1) * w * 0.3, d / 2 + 0.4);
        b.beam("rust", p[0], y + h * 0.5, p[1], q[0], y + 0.25, q[1], 0.18);
      }
    }
    for (let i = 0; i < 5; i++) {
      // vent stacks
      const p = at(r(), r()),
        hh = 0.8 + r() * 1.6;
      b.cyl("metal", p[0], y, p[1], 0.14, 0.14, hh, 8, { tint: 0x7a7a72 });
      b.cyl("metal", p[0], y + hh + 0.12, p[1], 0.32, 0.05, 0.22, 8, {
        tint: 0x6a6a62,
        bottom: true,
      });
    }
    // skylight frame with a few panes gone
    const sp = at(0.3 + r() * 0.4, 0.45 + r() * 0.1);
    b.box("black_metal", sp[0], y, sp[1], 3.2, 0.5, 2.2, { tint: 0x3a3a38 });
    for (let k = 0; k < 4; k++)
      b.box(
        r() < 0.4 ? "black" : "glass_dirty",
        sp[0] - 1.2 + k * 0.8,
        y + 0.5,
        sp[1],
        0.7,
        0.02,
        2.0,
        { faces: "t", tint: 0x6a7a70, grime: 0.3 },
      );
    F.debris(b, at(r(), r())[0], y, at(r(), r())[1], 1.2, 6);
  };
  /** Horizontal band/cornice around a rectangle. */
  K.band = function (b, mat, x0, z0, x1, z1, y, h, d, o) {
    o = o || {};
    b.box(
      mat,
      (x0 + x1) / 2,
      y,
      (z0 + z1) / 2,
      x1 - x0 + d * 2,
      h,
      z1 - z0 + d * 2,
      { faces: o.faces || "nsewtb", tint: o.tint, grime: o.grime },
    );
  };

  // ------------------------------------------------------------------
  // Furniture & clutter (merged)
  // ------------------------------------------------------------------
  const col = (x, z, w, d, y0, y1, yaw, surface) =>
    K.colRot(x, z, w, d, y0, y1, yaw || 0, {
      surface: surface || "wood",
      tag: "furniture",
    });
  F.col = col;
  const rot = (x, z, yaw, lx, lz) => [
    x + lx * Math.cos(yaw) + lz * Math.sin(yaw),
    z - lx * Math.sin(yaw) + lz * Math.cos(yaw),
  ];
  F.rot = rot;

  /** Office / hotel writing desk. o: {mat, w, d, h, tint, papers, lamp:glowSet} */
  F.desk = function (b, x, y, z, yaw, o) {
    o = o || {};
    const w = o.w || 1.5,
      d = o.d || 0.75,
      h = o.h || 0.76,
      m = o.mat || "walnut";
    b.box(m, x, y + h - 0.05, z, w, 0.05, d, {
      yaw,
      tint: o.tint,
      faces: "nsewtb",
    });
    for (const s of [-1, 1]) {
      const p = rot(x, z, yaw, s * (w / 2 - 0.22), 0);
      b.box(m, p[0], y, p[1], 0.42, h - 0.05, d - 0.06, { yaw, tint: o.tint });
    }
    const bp = rot(x, z, yaw, 0, d / 2 - 0.04);
    b.box(m, bp[0], y + 0.25, bp[1], w - 0.9, h - 0.3, 0.03, {
      yaw,
      tint: o.tint,
    });
    if (o.papers !== false) {
      const r = K.rng(Math.round(x * 13 + z * 7));
      for (let i = 0; i < 3; i++) {
        const p = rot(x, z, yaw, (r() - 0.5) * w * 0.7, (r() - 0.5) * d * 0.5);
        b.box("paper", p[0], y + h, p[1], 0.22, 0.004, 0.3, {
          yaw: yaw + (r() - 0.5),
          tint: 0xd8d0b8,
          grime: 0.3,
        });
      }
    }
    if (o.phone) {
      const p = rot(x, z, yaw, w * 0.32, -0.1);
      b.box("black_metal", p[0], y + h, p[1], 0.2, 0.08, 0.22, { yaw });
    }
    if (o.typewriter) {
      const p = rot(x, z, yaw, -0.1, 0);
      b.box("black_metal", p[0], y + h, p[1], 0.45, 0.14, 0.35, { yaw });
      b.box("paper", p[0], y + h + 0.14, p[1] + 0.05, 0.3, 0.2, 0.01, {
        yaw: yaw - 0.2,
        grime: 0.2,
      });
    }
    col(x, z, w, d, y, y + h, yaw);
  };
  /** Chair (wood or upholstered). o: {mat, seat, knocked} */
  F.chair = function (b, x, y, z, yaw, o) {
    o = o || {};
    const m = o.mat || "walnut";
    if (o.knocked) {
      b.box(m, x, y, z, 0.45, 0.45, 0.06, { yaw, tint: o.tint });
      b.box(o.seat || m, x, y + 0.02, z + 0.25, 0.45, 0.06, 0.45, {
        yaw: yaw + 0.3,
        tint: o.seatTint,
      });
      return;
    }
    b.box(o.seat || m, x, y + 0.42, z, 0.46, 0.06, 0.44, {
      yaw,
      tint: o.seatTint,
    });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const p = rot(x, z, yaw, sx * 0.19, sz * 0.18);
        b.box(m, p[0], y, p[1], 0.04, 0.42, 0.04, { yaw, tint: o.tint });
      }
    const bp = rot(x, z, yaw, 0, 0.2);
    b.box(o.seat || m, bp[0], y + 0.48, bp[1], 0.44, 0.5, 0.05, {
      yaw,
      tint: o.seatTint,
    });
  };
  /** Table (rect or round). o: {round, w, d, h, cloth: mat, mat} */
  F.table = function (b, x, y, z, yaw, o) {
    o = o || {};
    const h = o.h || 0.75,
      m = o.mat || "walnut";
    if (o.round) {
      const r = o.r || 0.7;
      b.cyl(o.cloth || m, x, y + h - 0.04, z, r, r, 0.04, 14, {
        tint: o.clothTint,
        grime: 0.2,
        bottom: true,
      });
      if (o.cloth)
        b.cyl(o.cloth, x, y + h - 0.35, z, r + 0.02, r, 0.33, 14, {
          tint: o.clothTint,
          top: false,
          grime: 0.3,
        });
      b.cyl(m, x, y, z, 0.06, 0.06, h - 0.04, 6, { tint: o.tint });
      b.cyl(m, x, y, z, 0.3, 0.2, 0.05, 8, { tint: o.tint });
      col(x, z, r * 1.5, r * 1.5, y, y + h, 0);
    } else {
      const w = o.w || 1.4,
        d = o.d || 0.8;
      b.box(o.cloth || m, x, y + h - 0.04, z, w, 0.04, d, {
        yaw,
        tint: o.clothTint,
        faces: "nsewtb",
      });
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
          const p = rot(x, z, yaw, sx * (w / 2 - 0.06), sz * (d / 2 - 0.06));
          b.box(m, p[0], y, p[1], 0.06, h - 0.04, 0.06, { yaw, tint: o.tint });
        }
      col(x, z, w, d, y, y + h, yaw);
    }
  };
  /** Slatted wooden bench (waiting room / locker room). */
  F.bench = function (b, x, y, z, yaw, len, o) {
    o = o || {};
    const m = o.mat || "oak";
    for (let i = 0; i < 4; i++) {
      const p = rot(x, z, yaw, 0, -0.18 + i * 0.12);
      b.box(m, p[0], y + 0.42, p[1], len, 0.03, 0.09, { yaw, tint: o.tint });
    }
    if (o.back !== false)
      for (let i = 0; i < 3; i++) {
        const p = rot(x, z, yaw, 0, 0.26);
        b.box(m, p[0], y + 0.55 + i * 0.14, p[1], len, 0.09, 0.03, {
          yaw,
          tint: o.tint,
        });
      }
    const n = Math.max(2, Math.round(len / 1.6) + 1);
    for (let i = 0; i < n; i++) {
      const p = rot(x, z, yaw, -len / 2 + 0.1 + (i * (len - 0.2)) / (n - 1), 0);
      b.box(o.frame || "black_metal", p[0], y, p[1], 0.06, 0.42, 0.5, { yaw });
      if (o.back !== false)
        b.box(
          o.frame || "black_metal",
          rot(x, z, yaw, -len / 2 + 0.1 + (i * (len - 0.2)) / (n - 1), 0.28)[0],
          y + 0.42,
          rot(x, z, yaw, -len / 2 + 0.1 + (i * (len - 0.2)) / (n - 1), 0.28)[1],
          0.05,
          0.5,
          0.04,
          { yaw },
        );
    }
    col(x, z, len, 0.6, y, y + 0.5, yaw);
  };
  /** Hospital / hotel bed. o: {hospital, sheet, mat, restraints, blood} */
  F.bed = function (b, x, y, z, yaw, o) {
    o = o || {};
    const L = 2.0,
      W = o.double ? 1.5 : 0.95;
    const fm = o.mat || (o.hospital ? "hosp_white" : "walnut");
    b.box(o.sheet || "cloth_white", x, y + 0.45, z, W, 0.18, L - 0.1, {
      yaw,
      tint: o.sheetTint,
      grime: 0.6,
    });
    b.box(fm, x, y + 0.3, z, W + 0.04, 0.15, L, { yaw });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const p = rot(x, z, yaw, (sx * W) / 2, (sz * L) / 2);
        b.box(fm, p[0], y, p[1], 0.05, sz < 0 ? 1.05 : 0.7, 0.05, { yaw });
      }
    const hp = rot(x, z, yaw, 0, -L / 2);
    b.box(fm, hp[0], y + 0.5, hp[1], W, o.hospital ? 0.45 : 0.6, 0.04, { yaw });
    const pp = rot(x, z, yaw, 0, -L / 2 + 0.3);
    b.box(
      o.sheet || "cloth_white",
      pp[0],
      y + 0.63,
      pp[1],
      W * 0.6,
      0.1,
      0.35,
      { yaw, tint: o.sheetTint, grime: 0.5 },
    );
    if (o.restraints)
      for (const sz of [-0.5, 0.1, 0.6]) {
        const p = rot(x, z, yaw, 0, sz);
        b.box("leather_brown", p[0], y + 0.6, p[1], W + 0.08, 0.04, 0.09, {
          yaw,
        });
      }
    if (o.blood) {
      const p = rot(x, z, yaw, 0.1, 0.2);
      b.box("flesh", p[0], y + 0.635, p[1], 0.5, 0.005, 0.7, {
        yaw: yaw + 0.4,
        tint: 0x5a1a14,
        grime: 0,
      });
    }
    col(x, z, W, L, y, y + 0.6, yaw, "metal");
  };
  /** Restaurant booth / banquette: seat + high back, facing +z local. */
  F.booth = function (b, x, y, z, yaw, len, o) {
    o = o || {};
    const m = o.mat || "leather_red",
      fr = o.frame || "mahogany";
    b.box(fr, x, y, z, len, 0.42, 0.55, { yaw });
    b.box(m, x, y + 0.42, z, len, 0.1, 0.55, { yaw, tint: o.tint, grime: 0.5 });
    const bp = rot(x, z, yaw, 0, -0.3);
    b.box(m, bp[0], y + 0.5, bp[1], len, 0.75, 0.14, {
      yaw,
      tint: o.tint,
      grime: 0.5,
    });
    b.box(fr, bp[0], y + 1.25, bp[1], len + 0.04, 0.08, 0.2, { yaw });
    col(x, z - 0.05, len, 0.7, y, y + 1.2, yaw);
  };
  /** Wall shelf unit / bookcase. o: {mat, h, w, d, fill: 'books'|'boxes'|'files'|'jars'|null, sparse} */
  F.shelf = function (b, x, y, z, yaw, o) {
    o = o || {};
    const w = o.w || 1.8,
      h = o.h || 2.1,
      d = o.d || 0.4,
      m = o.mat || "metal",
      n = o.n || 5;
    for (const s of [-1, 1]) {
      const p = rot(x, z, yaw, (s * w) / 2, 0);
      b.box(m, p[0], y, p[1], 0.04, h, d, { yaw, tint: o.tint });
    }
    const bp = rot(x, z, yaw, 0, -d / 2 + 0.01);
    b.box(m, bp[0], y, bp[1], w, h, 0.02, { yaw, tint: o.tint, faces: "s" });
    const r = K.rng(Math.round(x * 31 + z * 17 + y));
    for (let i = 0; i < n; i++) {
      const sy = y + 0.08 + (i * (h - 0.1)) / (n - 1);
      b.box(m, x, sy, z, w, 0.03, d, { yaw, tint: o.tint, faces: "nsewtb" });
      if (!o.fill || i === n - 1) continue;
      let u = -w / 2 + 0.06;
      while (u < w / 2 - 0.1) {
        const bw =
          o.fill === "books"
            ? 0.04 + r() * 0.05
            : o.fill === "files"
              ? 0.3
              : 0.2 + r() * 0.2;
        if (r() < (o.sparse || 0.25)) {
          u += bw + r() * 0.2;
          continue;
        }
        const bh =
          o.fill === "books"
            ? 0.2 + r() * 0.12
            : o.fill === "files"
              ? 0.28
              : 0.12 + r() * 0.2;
        const p = rot(x, z, yaw, u + bw / 2, 0);
        const tint =
          o.fill === "books"
            ? [0x6a2a1e, 0x2a3a5a, 0x3a4a2a, 0x8a6a3a, 0x4a2a3a][
                Math.floor(r() * 5)
              ]
            : o.fill === "files"
              ? 0xb0a070
              : o.fill === "jars"
                ? 0x6a8a60
                : 0x8a7a5a;
        b.box(
          o.fill === "jars" ? "glass_base" : "fabric",
          p[0],
          sy + 0.03,
          p[1],
          bw,
          Math.min(bh, (h - 0.1) / (n - 1) - 0.06),
          d * 0.8,
          { yaw: yaw + (r() - 0.5) * 0.08, tint, grime: 0.4 },
        );
        u += bw + 0.01;
      }
    }
    col(x, z, w, d, y, y + h, yaw, "metal");
  };
  /** Filing cabinet bank (visual only; loot comes from props). */
  F.cabinets = function (b, x, y, z, yaw, n, o) {
    o = o || {};
    for (let i = 0; i < n; i++) {
      const p = rot(x, z, yaw, (i - (n - 1) / 2) * 0.5, 0);
      b.box(o.mat || "metal", p[0], y, p[1], 0.48, 1.32, 0.62, {
        yaw,
        tint: o.tint || 0x6a7064,
      });
      for (let k = 0; k < 4; k++) {
        const q = rot(p[0], p[1], yaw, 0, 0.315);
        b.box("chrome", q[0], y + 0.25 + k * 0.32, q[1], 0.14, 0.03, 0.02, {
          yaw,
          grime: 0.2,
        });
      }
    }
    col(x, z, n * 0.5, 0.62, y, y + 1.32, yaw, "metal");
  };
  /** Classical column. style: 'doric' | 'ionic' | 'corinthian' | 'deco' | 'iron' */
  F.column = function (b, x, y, z, r, h, o) {
    o = o || {};
    const m = o.mat || "limestone",
      st = o.style || "doric";
    if (st === "iron") {
      b.cyl(m, x, y, z, r, r * 0.9, h, 10, { tint: o.tint });
      b.cyl(m, x, y, z, r * 1.6, r * 1.6, 0.3, 10, { tint: o.tint });
      b.cyl(m, x, y + h - 0.4, z, r * 0.9, r * 1.7, 0.4, 10, { tint: o.tint });
    } else if (st === "deco") {
      b.box(m, x, y, z, r * 2.3, 0.5, r * 2.3, { tint: o.baseTint || o.tint });
      b.cyl(m, x, y + 0.5, z, r, r, h - 1.1, 12, { tint: o.tint, uvScale: 1 });
      for (let i = 0; i < 3; i++)
        b.cyl(
          o.capMat || "nickel",
          x,
          y + h - 0.6 + i * 0.18,
          z,
          r * (1.08 + i * 0.12),
          r * (1.08 + i * 0.12),
          0.12,
          12,
          { tint: o.capTint, grime: 0.2 },
        );
      b.box(o.capMat || "nickel", x, y + h - 0.06, z, r * 2.8, 0.06, r * 2.8, {
        tint: o.capTint,
        grime: 0.2,
      });
    } else {
      // shaft with entasis + flutes suggested by 16-sided smooth cylinder
      b.box(
        o.baseMat || m,
        x,
        y,
        z,
        r * 2.5,
        st === "doric" ? 0.12 : 0.35,
        r * 2.5,
        { tint: o.tint },
      );
      if (st !== "doric")
        b.cyl(m, x, y + 0.35, z, r * 1.15, r * 1.1, 0.2, 16, { tint: o.tint });
      b.cyl(
        m,
        x,
        y + (st === "doric" ? 0.12 : 0.55),
        z,
        r,
        r * 0.86,
        h - (st === "doric" ? 0.6 : 1.35),
        16,
        { tint: o.tint, rows: 3 },
      );
      if (st === "doric") {
        b.cyl(m, x, y + h - 0.48, z, r * 0.86, r * 1.18, 0.28, 16, {
          tint: o.tint,
        });
        b.box(m, x, y + h - 0.2, z, r * 2.5, 0.2, r * 2.5, {
          tint: o.tint,
          faces: "nsewtb",
        });
      } else if (st === "ionic") {
        b.box(m, x, y + h - 0.6, z, r * 2.6, 0.3, r * 1.9, {
          tint: o.tint,
          faces: "nsewtb",
        });
        for (const s of [-1, 1])
          b.geo(m, T.torusThick, {
            x: x + s * r * 1.05,
            y: y + h - 0.62,
            z,
            ry: HP,
            s: r * 0.35,
            tint: o.tint,
          });
        b.box(m, x, y + h - 0.2, z, r * 2.6, 0.2, r * 2.6, {
          tint: o.tint,
          faces: "nsewtb",
        });
      } else {
        // corinthian: bell of leaves + abacus
        b.cyl(m, x, y + h - 0.8, z, r * 0.9, r * 1.3, 0.62, 12, {
          tint: o.tint,
        });
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * PI * 2;
          b.geo(m, T.cone4, {
            x: x + Math.cos(a) * r * 1.05,
            y: y + h - 0.45,
            z: z + Math.sin(a) * r * 1.05,
            s: (0.18 * r) / 0.5,
            rz: Math.cos(a) * 0.5,
            rx: -Math.sin(a) * 0.5,
            tint: o.tint,
          });
        }
        b.box(m, x, y + h - 0.18, z, r * 2.7, 0.18, r * 2.7, {
          tint: o.tint,
          faces: "nsewtb",
        });
      }
    }
    if (o.col !== false)
      K.colBox(x - r, y, z - r, x + r, y + h, z + r, {
        surface: "concrete",
        tag: "column",
      });
  };
  /** Chandelier / pendant lamp: tiers of arms + bulbs (lamp material → auto fixture lights) + glow points. */
  F.chandelier = function (b, glows, x, y, z, r, o) {
    o = o || {};
    const m = o.mat || "brass",
      lamp = o.lamp || "lamp_amber";
    b.beam(m, x, y + (o.chain || 2), z, x, y + 0.4, z, 0.04, { grime: 0.2 });
    b.cyl(m, x, y, z, r * 0.25, r * 0.12, 0.5, 8, { grime: 0.2, bottom: true });
    const tiers = o.tiers || 2;
    for (let t = 0; t < tiers; t++) {
      const rr = r * (1 - t * 0.35),
        yy = y + 0.1 + t * 0.35,
        n = 8 - t * 2;
      b.geo(m, T.torus, { x, y: yy, z, rx: HP, s: rr, grime: 0.2 });
      for (let i = 0; i < n; i++) {
        const a = (i / n) * PI * 2,
          px = x + Math.cos(a) * rr,
          pz = z + Math.sin(a) * rr;
        if (o.broken && (i + t) % 3 === 0) continue;
        b.cyl(m, px, yy, pz, 0.04, 0.05, 0.1, 6, { grime: 0.2 });
        b.geo(lamp, T.sphereLo, {
          x: px,
          y: yy + 0.16,
          z: pz,
          s: 0.07,
          grime: 0,
        });
        if (o.crystals)
          b.geo("glass_base", T.cone4, {
            x: px,
            y: yy - 0.15,
            z: pz,
            s: 0.05,
            sy: 0.18,
            rx: PI,
            tint: 0xd8e0e0,
            grime: 0,
          });
        if (glows && i % 2 === 0)
          glows.add(px, yy + 0.16, pz, o.glowColor || 0xffc070, "s");
      }
    }
    if (glows)
      glows.add(x, y + 0.2, z, o.glowColor || 0xffc070, o.glowSize || "l");
  };
  /** Wall sconce facing direction yaw (the lamp sits 0.2 m off the wall). */
  F.sconce = function (b, glows, x, y, z, yaw, o) {
    o = o || {};
    const p = rot(x, z, yaw, 0, 0.12);
    b.box(o.mat || "brass", x, y - 0.2, z, 0.14, 0.4, 0.04, {
      yaw,
      grime: 0.2,
    });
    b.geo(o.lamp || "lamp_amber", T.cone6, {
      x: p[0],
      y: y + 0.08,
      z: p[1],
      s: 0.1,
      sy: 0.18,
      rx: PI,
      grime: 0,
    });
    if (glows && !o.dead)
      glows.add(p[0], y + 0.05, p[1], o.color || 0xffc070, o.size || "m");
  };
  /** Railing between two points at deck height y (balusters + handrail), with collider. */
  F.railing = function (b, ax, az, bx, bz, y, o) {
    o = o || {};
    const h = o.h || 1.0,
      m = o.mat || "brass",
      L = Math.hypot(bx - ax, bz - az);
    b.beam(m, ax, y + h, az, bx, y + h, bz, o.w || 0.06, { grime: 0.2 });
    if (o.solid) {
      const yaw = Math.atan2(bx - ax, bz - az) - HP;
      b.box(o.solid, (ax + bx) / 2, y, (az + bz) / 2, L, h, 0.12, {
        yaw,
        tint: o.tint,
      });
    } else {
      const n = Math.max(2, Math.round(L / (o.step || 0.25)));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        b.beam(
          m,
          ax + (bx - ax) * t,
          y,
          az + (bz - az) * t,
          ax + (bx - ax) * t,
          y + h,
          az + (bz - az) * t,
          i % 8 === 0 ? 0.07 : 0.025,
          { grime: 0.2 },
        );
      }
      b.beam(m, ax, y + 0.08, az, bx, y + 0.08, bz, 0.05, { grime: 0.2 });
    }
    if (o.col !== false)
      K.colRot(
        (ax + bx) / 2,
        (az + bz) / 2,
        L,
        0.15,
        y,
        y + h + 0.1,
        Math.atan2(bx - ax, bz - az) - HP,
        { surface: "metal", tag: "railing" },
      );
  };

  /**
   * Round 2 — New-York cast-iron fire escape bolted to a façade (merged, ~600 tris per landing).
   * (x,z) = centre on the wall face, (nx,nz) = outward normal, w = landing width, ys = landing heights
   * (bottom first). Landings with slatted decks, top rails + balusters, under-brackets, switch-back
   * stairs between landings, and a counterweighted drop ladder hanging from the lowest one.
   * Visual only (it sits above head height, out of reach — the lowest landing is ≥ 3.5 m up).
   */
  F.fireEscape = function (b, x, z, nx, nz, w, ys, o) {
    o = o || {};
    const m = o.mat || "black_metal",
      D = o.depth || 1.25,
      tint = o.tint || 0x2a2622;
    const ux = -nz,
      uz = nx; // along the wall
    const yaw = Math.atan2(nx, nz);
    const P = (u, d) => [x + ux * u + nx * d, z + uz * u + nz * d];
    for (let i = 0; i < ys.length; i++) {
      const y = ys[i],
        c = P(0, D / 2 + 0.05);
      // deck: slats
      for (let k = 0; k < 6; k++) {
        const q = P(0, 0.12 + (k * (D - 0.1)) / 6);
        b.box(m, q[0], y - 0.04, q[1], w, 0.04, 0.12, { yaw, tint });
      }
      b.box(m, c[0], y - 0.12, c[1], w, 0.08, D, { yaw, tint, faces: "nsew" }); // edge frame
      // rails: outer + two ends, balusters
      const a = P(-w / 2, D),
        bb = P(w / 2, D),
        a0 = P(-w / 2, 0.05),
        b0 = P(w / 2, 0.05);
      for (const r of [
        [a, bb],
        [a0, a],
        [b0, bb],
      ]) {
        b.beam(
          m,
          r[0][0],
          y + 0.95,
          r[0][1],
          r[1][0],
          y + 0.95,
          r[1][1],
          0.04,
          { tint },
        );
        b.beam(
          m,
          r[0][0],
          y + 0.45,
          r[0][1],
          r[1][0],
          y + 0.45,
          r[1][1],
          0.025,
          { tint },
        );
        const L = Math.hypot(r[1][0] - r[0][0], r[1][1] - r[0][1]),
          n = Math.max(2, Math.round(L / 0.35));
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          b.beam(
            m,
            r[0][0] + (r[1][0] - r[0][0]) * t,
            y,
            r[0][1] + (r[1][1] - r[0][1]) * t,
            r[0][0] + (r[1][0] - r[0][0]) * t,
            y + 0.95,
            r[0][1] + (r[1][1] - r[0][1]) * t,
            0.018,
            { tint },
          );
        }
      }
      // diagonal brackets under the deck
      for (const u of [-w / 2 + 0.2, w / 2 - 0.2]) {
        const p0 = P(u, 0.02),
          p1 = P(u, D - 0.1);
        b.beam(m, p0[0], y - 0.9, p0[1], p1[0], y - 0.12, p1[1], 0.05, {
          tint,
        });
      }
      // switch-back stair up to the next landing (alternating direction)
      if (i < ys.length - 1) {
        const y1 = ys[i + 1],
          dir = i % 2 ? -1 : 1,
          s0 = P(-dir * (w / 2 - 0.3), D * 0.55),
          s1 = P(dir * (w / 2 - 0.5), D * 0.55);
        const n = Math.max(6, Math.round((y1 - y) / 0.22));
        for (const side of [-0.33, 0.33])
          b.beam(
            m,
            s0[0] + nx * side,
            y,
            s0[1] + nz * side,
            s1[0] + nx * side,
            y1,
            s1[1] + nz * side,
            0.05,
            { tint },
          );
        for (let k = 1; k < n; k++) {
          const t = k / n;
          const q = [s0[0] + (s1[0] - s0[0]) * t, s0[1] + (s1[1] - s0[1]) * t];
          b.box(m, q[0], y + (y1 - y) * t - 0.03, q[1], 0.22, 0.03, 0.66, {
            yaw,
            tint,
          });
        }
        b.beam(
          m,
          s0[0] + nx * 0.36,
          y + 0.95,
          s0[1] + nz * 0.36,
          s1[0] + nx * 0.36,
          y1 + 0.95,
          s1[1] + nz * 0.36,
          0.03,
          { tint },
        );
      }
    }
    // drop ladder (retracted) below the first landing
    const l = P(w / 2 - 0.5, D - 0.2),
      y0 = ys[0];
    for (const e of [-0.22, 0.22])
      b.beam(
        m,
        l[0] + ux * e,
        y0 - 2.4,
        l[1] + uz * e,
        l[0] + ux * e,
        y0 + 0.9,
        l[1] + uz * e,
        0.035,
        { tint },
      );
    for (let k = 0; k < 11; k++)
      b.beam(
        m,
        l[0] - ux * 0.22,
        y0 - 2.3 + k * 0.3,
        l[1] - uz * 0.22,
        l[0] + ux * 0.22,
        y0 - 2.3 + k * 0.3,
        l[1] + uz * 0.22,
        0.02,
        { tint },
      );
    // a few window-sill clutter bits on the landings (plant pot, crate) for life
    if (o.clutter !== false)
      for (let i = 1; i < ys.length; i += 2) {
        const q = P(-w / 2 + 0.4, 0.4);
        b.box(
          i % 4 === 1 ? "brick_red" : "wood_rotten",
          q[0],
          ys[i],
          q[1],
          0.35,
          0.3,
          0.35,
          { yaw, tint: 0x8a5a3a },
        );
      }
  };
  /** Rubble / plaster debris pile around (x,z) radius r. */
  F.debris = function (b, x, y, z, r, n, o) {
    o = o || {};
    const rr = K.rng(Math.round(x * 7 + z * 3 + n));
    const mats = o.mats || ["rubble", "concrete_dark", "plaster"];
    for (let i = 0; i < n; i++) {
      const a = rr() * PI * 2,
        d = Math.sqrt(rr()) * r,
        s = (0.15 + rr() * 0.45) * (o.scale || 1) * (1 - (d / r) * 0.5);
      b.geo(mats[i % mats.length], rr() < 0.5 ? T.dodeca : T.ico, {
        x: x + Math.cos(a) * d,
        y: y + s * 0.25,
        z: z + Math.sin(a) * d,
        sx: s * (0.8 + rr() * 0.8),
        sy: s * (0.4 + rr() * 0.4),
        sz: s,
        ry: rr() * 6,
        rx: rr() * 0.6,
        tint: o.tint,
        grime: 0.6,
      });
    }
    if (o.mound)
      b.geo(mats[0], T.sphereLo, {
        x,
        y: y - r * 0.25,
        z,
        sx: r * 0.9,
        sy: r * 0.45,
        sz: r * 0.8,
        tint: o.tint,
        grime: 0.7,
      });
    if (o.col)
      K.colBox(
        x - r * 0.6,
        y,
        z - r * 0.6,
        x + r * 0.6,
        y + (o.colH || r * 0.3),
        z + r * 0.6,
        { surface: "rubble" },
      );
  };
  /** Scattered paper sheets on a floor area. */
  F.papers = function (b, x0, z0, x1, z1, y, n, o) {
    o = o || {};
    const r = K.rng(Math.round(x0 * 3 + z0 * 5 + n));
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0),
        z = z0 + r() * (z1 - z0);
      b.box(
        "paper",
        x,
        y + 0.005 + i * 0.0004,
        z,
        0.21 + r() * 0.1,
        0.003,
        0.28,
        {
          yaw: r() * 6,
          tint: o.tint || [0xd8d0b8, 0xc8bc98, 0xe0d8c8][i % 3],
          grime: 0.5,
          faces: "t",
        },
      );
    }
  };
  /** Sandbag wall along yaw. */
  F.sandbags = function (b, x, y, z, yaw, len, rows, o) {
    o = o || {};
    rows = rows || 3;
    const r = K.rng(Math.round(x * 11 + z * 13));
    for (let j = 0; j < rows; j++) {
      const n = Math.round(len / 0.62);
      for (let i = 0; i < n; i++) {
        const u = -len / 2 + ((i + (j % 2) * 0.5 + 0.5) * len) / n;
        if (u > len / 2) continue;
        const p = rot(x, z, yaw, u, (r() - 0.5) * 0.06);
        b.geo("sandbag", T.sphereLo, {
          x: p[0],
          y: y + 0.13 + j * 0.24,
          z: p[1],
          sx: 0.33,
          sy: 0.14,
          sz: 0.24,
          ry: yaw + (r() - 0.5) * 0.2,
          tint: o.tint || 0x9a8a62,
          grime: 0.6,
        });
      }
    }
    K.colRot(x, z, len, 0.55, y, y + rows * 0.24 + 0.05, yaw, {
      surface: "dirt",
      tag: "sandbags",
    });
  };
  /** Wooden / military crate (visual; use props for lootable ones). */
  F.crate = function (b, x, y, z, yaw, s, o) {
    o = o || {};
    s = s || 0.8;
    b.box(o.mat || "wood", x, y, z, s, s * 0.8, s * 0.9, { yaw, tint: o.tint });
    for (const sy of [0.05, s * 0.8 - 0.1])
      b.box(o.mat || "wood", x, y + sy, z, s + 0.03, 0.07, s * 0.9 + 0.03, {
        yaw,
        tint: o.bandTint || 0x6a5238,
      });
    if (o.col !== false)
      K.colRot(x, z, s, s * 0.9, y, y + s * 0.8, yaw, {
        surface: "wood",
        tag: "crate",
      });
  };
  /** Pipe run between points (round). */
  F.pipe = function (b, ax, ay, az, bx, by, bz, r, o) {
    o = o || {};
    b.beam(o.mat || "rust", ax, ay, az, bx, by, bz, r * 2, {
      round: 8,
      tint: o.tint,
      grime: 0.4,
    });
  };
  /** Scattered bones & a skull (merged; cheap alternative to prop skeletons). */
  F.bones = function (b, x, y, z, n, o) {
    o = o || {};
    const r = K.rng(Math.round(x * 5 + z * 9));
    for (let i = 0; i < n; i++)
      b.beam(
        "bone",
        x + (r() - 0.5) * 0.8,
        y + 0.03,
        z + (r() - 0.5) * 0.8,
        x + (r() - 0.5) * 0.8,
        y + 0.03,
        z + (r() - 0.5) * 0.8,
        0.035,
        { round: 6, grime: 0.4 },
      );
    if (o.skull !== false)
      b.geo("bone", T.sphereLo, {
        x: x + 0.2,
        y: y + 0.09,
        z: z - 0.1,
        sx: 0.1,
        sy: 0.12,
        sz: 0.13,
        ry: r() * 6,
        grime: 0.5,
      });
  };
  /** Stretch of torn wallpaper / plaster damage: dark patches on a wall plane (quad). */
  F.stain = function (b, x, y, z, yaw, w, h, o) {
    o = o || {};
    b.panel(o.mat || "concrete_dark", x, y, z, w, h, yaw, {
      off: o.off || 0.02,
      tint: o.tint || 0x3a3228,
      grime: 0.8,
    });
  };
  /** Light shaft (additive quad) from (x,y,z) downward/along dir, width w, length len, facing yaw. */
  /**
   * Volumetric spotlight cone (additive 'shaft' material) from a lamp at (x,y,z) down to a pool centred at
   * (tx,ty,tz) with radius rb. rt = radius at the lamp. Bright at the lamp, fading toward the floor.
   */
  F.cone = function (b, x, y, z, tx, ty, tz, rt, rb, o) {
    o = o || {};
    const dx = tx - x,
      dy = ty - y,
      dz = tz - z,
      len = Math.hypot(dx, dy, dz);
    const g = new THREE.CylinderGeometry(rt, rb, len, o.seg || 14, 1, true);
    g.translate(0, -len / 2, 0); // top (lamp end, uv.y = 1) at the origin, pointing down −Y
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(dx / len, dy / len, dz / len),
    );
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      q,
      new THREE.Vector3(1, 1, 1),
    );
    b.geo("shaft", g, {
      matrix: m,
      uv: "rect",
      rect: [0.28, 0, 0.72, 1],
      tint: o.tint || 0xffffff,
      grime: 0,
    });
    g.dispose();
  };
  F.shaft = function (b, x, y, z, yaw, w, len, tilt, o) {
    o = o || {};
    const dx = Math.sin(yaw) * Math.sin(tilt),
      dz = Math.cos(yaw) * Math.sin(tilt),
      dy = -Math.cos(tilt);
    const ux = Math.cos(yaw),
      uz = -Math.sin(yaw);
    const hw = w / 2;
    const p0 = [x - ux * hw, y, z - uz * hw],
      p1 = [x + ux * hw, y, z + uz * hw];
    const p2 = [p1[0] + dx * len, y + dy * len, p1[2] + dz * len],
      p3 = [p0[0] + dx * len, y + dy * len, p0[2] + dz * len];
    b.quad("shaft", p3, p2, p1, p0, {
      rect: [0, 0, 1, 1],
      tint: o.tint || 0xffffff,
      double: true,
    });
  };
})();
