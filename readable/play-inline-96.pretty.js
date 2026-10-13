/* src/map/50_cryo_interior.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 50 CRYO UNIT C-9 — INTERIOR
 * (Shared signs / emblem / street door / skeletons: 50_cryo.js.)
 *
 * Project Long Winter's secret cryo sub-basement forty feet under the
 * Manhattan Municipal Building (INTERIORS.cryo_c9.origin). The facility is
 * dying: frost on everything, half the ceiling tubes dead, amber and red
 * status lamps, coolant puddles, the reel-to-reel mainframe CUSTODIAN still
 * clicking. Local layout (metres, +z = south):
 *
 *   stairwell  x -2.5..2.5  z -40..-24.6  (flight up to the y 6 landing,
 *              EXIT door → Chambers Street arch)
 *   blast door z -24.3 (two leaves sliding into wall pockets; keypad lock
 *              'q_cryo_blast_door', code learnable from the Director's logs)
 *   corridor   x -2..2      z -24..0     → Director's office (E), security (E),
 *                                          computer room (W)
 *   pod bay    x -9..9      z 0..30      12 upright pods (1–6 west, 7–12 east;
 *              the hero's is pod 7, Zeke's pod 9 stands open and empty)
 *   suit prep  x 9..19      z 14..25     lockers, the VIGIL charging cradle
 *   infirmary  x -19..-9    z 14..25
 *   maintenance x -8..8     z 30..42     boilers, coolant pumps (roach nest)
 *
 * Public API (G.map, see 90_module_interior.js): blast door open/close/lock,
 * anchors `G.map.getAnchor('cryo_c9', name)` / `G.map.cryoAnchors`.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  const LAYER = "cryo";
  let O = { x: 4000, y: 0, z: 0 };
  const A = (M.cryoAnchors = M.cryoAnchors || {}); // anchors (local coords, converted to world at the end; ext_* are world)
  M.anchors = M.anchors || {};
  const slideDoors = [];
  M.slideDoors = slideDoors;
  const LOCK_ID = "q_cryo_blast_door";
  M.CRYO_LOCK_ID = LOCK_ID;

  // Materials / colours: painted concrete, steel, enamel; cool light, orange hazard accents
  const WALL = "cryo_wall",
    FLOOR = "tile_cryo",
    CEIL = "metal_panel";
  const C_WALL = [0.98, 1.02, 1.06],
    C_WALL_LOW = [0.5, 0.56, 0.6],
    C_FLOOR = [0.62, 0.66, 0.68],
    C_CEIL = [0.55, 0.58, 0.62];
  const C_ORANGE = [1.25, 0.55, 0.22],
    C_STEEL = [0.62, 0.64, 0.66],
    C_DARK = [0.22, 0.24, 0.26],
    C_FROST = [0.74, 0.8, 0.86];

  const b = (key) => M.buf(key, 0, 0, LAYER);
  /** Collider in local cell coordinates. */
  function CB(x0, y0, z0, x1, y1, z1, opts) {
    return M.box3(
      O.x + Math.min(x0, x1),
      (O.y || 0) + y0,
      O.z + Math.min(z0, z1),
      O.x + Math.max(x0, x1),
      (O.y || 0) + y1,
      O.z + Math.max(z0, z1),
      Object.assign({ tag: "cryo", surface: "metal" }, opts || {}),
    );
  }
  const sign = (t, x, y, z, nx, nz, w) =>
    M.cryoSign(t, x, y, z, nx, nz, w, LAYER);
  const logo = (x, y, z, nx, ny, nz, s) =>
    M.cryoLogo(x, y, z, nx, ny, nz, s, LAYER);

  // -------------------------------------------------------------------
  // Room builder (local coords). doors: [{side, a, b, h, y, frame}]
  // (a/b along x for n/s walls, along z for e/w walls)
  // -------------------------------------------------------------------
  function room(x0, z0, x1, z1, y0, h, o) {
    o = o || {};
    const doors = o.doors || [];
    const wall = o.wall || WALL,
      floor = o.floor || FLOOR,
      ceil = o.ceil || CEIL;
    const sW = M.sc(wall);
    if (o.noFloor !== true) {
      M.quad(
        b(floor),
        [x0, y0, z1],
        [x1, y0, z1],
        [x1, y0, z0],
        [x0, y0, z0],
        [0, 1, 0],
        [x0 / 2, z1 / 2, x1 / 2, z1 / 2, x1 / 2, z0 / 2, x0 / 2, z0 / 2],
        o.floorC || C_FLOOR,
      );
      if (y0 > 0.01) CB(x0, y0 - 0.3, z0, x1, y0, z1, { surface: "concrete" });
    }
    if (o.noCeil !== true)
      M.quad(
        b(ceil),
        [x0, y0 + h, z0],
        [x1, y0 + h, z0],
        [x1, y0 + h, z1],
        [x0, y0 + h, z1],
        [0, -1, 0],
        [
          x0 / 2.5,
          z0 / 2.5,
          x1 / 2.5,
          z0 / 2.5,
          x1 / 2.5,
          z1 / 2.5,
          x0 / 2.5,
          z1 / 2.5,
        ],
        o.ceilC || C_CEIL,
      );
    const sides = {
      n: [x0, z0, x1, z0, 0, 1],
      s: [x1, z1, x0, z1, 0, -1],
      w: [x0, z1, x0, z0, 1, 0],
      e: [x1, z0, x1, z1, -1, 0],
    };
    for (const k of ["n", "s", "w", "e"]) {
      if (o.skip && o.skip.includes(k)) continue;
      const [ax, az, bx, bz, nx, nz] = sides[k];
      const len = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / len,
        uz = (bz - az) / len;
      const gaps = doors
        .filter((d) => d.side === k)
        .map((d) => {
          const ta =
            k === "n"
              ? d.a - x0
              : k === "s"
                ? x1 - d.b
                : k === "w"
                  ? z1 - d.b
                  : d.a - z0;
          return {
            t0: ta,
            t1: ta + (d.b - d.a),
            h: d.h || 2.6,
            y: d.y || y0,
            frame: d.frame !== false,
          };
        })
        .sort((p, q) => p.t0 - q.t0);
      let t = 0;
      const segs = [];
      for (const g of gaps) {
        if (g.t0 > t) segs.push([t, g.t0, y0, y0 + h]);
        if (g.y > y0) segs.push([g.t0, g.t1, y0, g.y]);
        if (g.y + g.h < y0 + h) segs.push([g.t0, g.t1, g.y + g.h, y0 + h]);
        t = g.t1;
      }
      if (t < len) segs.push([t, len, y0, y0 + h]);
      const wb = b(wall);
      for (const [s0, s1, ya, yb] of segs) {
        const px = ax + ux * s0,
          pz = az + uz * s0,
          qx = ax + ux * s1,
          qz = az + uz * s1;
        const dx = qx - px,
          dz = qz - pz;
        const fl = dz * nx + -dx * nz;
        const cL = ya <= y0 + 0.01 ? C_WALL_LOW : C_WALL;
        if (fl > 0)
          M.wall(
            wb,
            px,
            pz,
            qx,
            qz,
            ya,
            yb,
            s0 / sW,
            s1 / sW,
            (ya - y0) / sW,
            (yb - y0) / sW,
            cL,
            C_WALL,
          );
        else
          M.wall(
            wb,
            qx,
            qz,
            px,
            pz,
            ya,
            yb,
            s1 / sW,
            s0 / sW,
            (ya - y0) / sW,
            (yb - y0) / sW,
            cL,
            C_WALL,
          );
        const cx0 = Math.min(px, qx) - (nx > 0 ? 0.3 : 0),
          cx1 = Math.max(px, qx) + (nx < 0 ? 0.3 : 0);
        const cz0 = Math.min(pz, qz) - (nz > 0 ? 0.3 : 0),
          cz1 = Math.max(pz, qz) + (nz < 0 ? 0.3 : 0);
        if (!o.noColl) CB(cx0, ya, cz0, cx1, yb, cz1, { surface: "concrete" });
        if (ya <= y0 + 0.01) {
          // dark wainscot band + kick plate (1960s institutional two-tone)
          const bb = b("metal_painted");
          M.quad(
            bb,
            [px + nx * 0.05, y0, pz + nz * 0.05],
            [qx + nx * 0.05, y0, qz + nz * 0.05],
            [qx + nx * 0.05, y0 + 0.2, qz + nz * 0.05],
            [px + nx * 0.05, y0 + 0.2, pz + nz * 0.05],
            [nx, 0, nz],
            [0, 0, (s1 - s0) / 2, 0, (s1 - s0) / 2, 0.1, 0, 0.1],
            C_DARK,
          );
          M.quad(
            bb,
            [px + nx * 0.05, y0 + 0.2, pz + nz * 0.05],
            [qx + nx * 0.05, y0 + 0.2, qz + nz * 0.05],
            [qx, y0 + 0.2, qz],
            [px, y0 + 0.2, pz],
            [0, 1, 0],
            [0, 0, 1, 0, 1, 0.05, 0, 0.05],
            C_DARK,
          );
          const stripe = Math.min(yb, y0 + 1.25);
          M.quad(
            b("metal_painted"),
            [px + nx * 0.02, stripe - 0.08, pz + nz * 0.02],
            [qx + nx * 0.02, stripe - 0.08, qz + nz * 0.02],
            [qx + nx * 0.02, stripe, qz + nz * 0.02],
            [px + nx * 0.02, stripe, pz + nz * 0.02],
            [nx, 0, nz],
            [0, 0, 1, 0, 1, 1, 0, 1],
            C_ORANGE,
          );
          if (!o.noRibs)
            for (
              let rt = Math.ceil(s0 / 3.6) * 3.6 + 1.8;
              rt < s1 - 0.3;
              rt += 3.6
            ) {
              const rx = ax + ux * rt,
                rz = az + uz * rt;
              M.box(bb, rx - 0.12, y0, rz - 0.12, rx + 0.12, yb, rz + 0.12, {
                s: 1,
                c: [0.5, 0.54, 0.58],
                skip: 8,
              });
            }
        }
      }
      for (const g of gaps) {
        if (!g.frame) continue;
        const fb = b("metal_painted");
        const pA = [ax + ux * g.t0, az + uz * g.t0],
          pB = [ax + ux * g.t1, az + uz * g.t1];
        const th = 0.28;
        for (const P of [pA, pB]) {
          M.box(
            fb,
            P[0] - th / 2,
            g.y,
            P[1] - th / 2,
            P[0] + th / 2,
            g.y + g.h + 0.25,
            P[1] + th / 2,
            { s: 1, c: C_STEEL },
          );
          M.box(
            fb,
            P[0] - th / 2 - 0.02,
            g.y + 0.15,
            P[1] - th / 2 - 0.02,
            P[0] + th / 2 + 0.02,
            g.y + 0.45,
            P[1] + th / 2 + 0.02,
            { s: 1, c: C_ORANGE },
          );
        }
        M.box(
          fb,
          Math.min(pA[0], pB[0]) - th / 2,
          g.y + g.h,
          Math.min(pA[1], pB[1]) - th / 2,
          Math.max(pA[0], pB[0]) + th / 2,
          g.y + g.h + 0.3,
          Math.max(pA[1], pB[1]) + th / 2,
          { s: 1, c: C_STEEL },
        );
      }
    }
    // ceiling tubes — a dying facility: a share of them are dead (dark housings only)
    if (!o.noLights && o.noCeil !== true) {
      const rr = M.rng("c9lights" + x0 + "," + z0);
      const step = o.lightStep || 4;
      for (let x = x0 + step / 2; x < x1; x += step)
        for (let z = z0 + step / 2; z < z1; z += step) {
          if (x1 - x0 < 5 && Math.abs(x - (x0 + x1) / 2) > 0.5) continue;
          const dead =
            rr() < (o.deadLights === undefined ? 0.35 : o.deadLights);
          if (!dead)
            M.box(
              b("emissive_window@lampw"),
              x - 0.6,
              y0 + h - 0.08,
              z - 0.12,
              x + 0.6,
              y0 + h - 0.01,
              z + 0.12,
              { s: 1, skip: 4 },
            );
          M.box(
            b("metal_painted"),
            x - 0.7,
            y0 + h - 0.05,
            z - 0.2,
            x + 0.7,
            y0 + h,
            z + 0.2,
            { s: 1, c: C_DARK, skip: 4 + 8 },
          );
        }
    }
    if (o.pipes) {
      const pb = b("metal_painted");
      const L1 = x1 - x0 > z1 - z0;
      for (const k of [0, 1]) {
        const off = 0.22 + k * 0.2,
          yy = y0 + h - 0.28 - k * 0.18;
        const col = k ? C_ORANGE : C_STEEL;
        if (L1) {
          M.pipe(pb, x0, yy, z0 + off, x1, yy, z0 + off, 0.07, 6, { c: col });
          M.pipe(pb, x0, yy, z1 - off, x1, yy, z1 - off, 0.07, 6, {
            c: k ? [0.55, 0.72, 0.85] : C_STEEL,
          });
        } else {
          M.pipe(pb, x0 + off, yy, z0, x0 + off, yy, z1, 0.07, 6, { c: col });
          M.pipe(pb, x1 - off, yy, z0, x1 - off, yy, z1, 0.07, 6, {
            c: k ? [0.55, 0.72, 0.85] : C_STEEL,
          });
        }
      }
    }
  }
  M.cryoRoom = room;

  // -------------------------------------------------------------------
  // Sliding doors (separate meshes, animated in update; open for the
  // player and for actors)
  // -------------------------------------------------------------------
  function slideDoor(cx, cz, w, h, alongX, y0) {
    const g = new M.GeoBuf();
    const T = 0.14;
    const sx = alongX ? w : T,
      sz = alongX ? T : w;
    M.box(g, -sx / 2, 0, -sz / 2, sx / 2, h, sz / 2, {
      s: 1.5,
      c: [0.55, 0.58, 0.6],
      skip: 0,
    });
    M.box(
      g,
      -sx / 2 - 0.01,
      h * 0.48,
      -sz / 2 - 0.01,
      sx / 2 + 0.01,
      h * 0.54,
      sz / 2 + 0.01,
      { s: 1, c: [0.95, 0.45, 0.18] },
    );
    const geo = g.toGeometry();
    const mat = new THREE.MeshStandardMaterial({
      map: M.mat("metal_painted").map || null,
      vertexColors: true,
      roughness: 0.55,
      metalness: 0.35,
    });
    mat.userData.shared = true;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(O.x + cx, (O.y || 0) + (y0 || 0), O.z + cz);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    M.roots.cryoDyn = M.roots.cryoDyn || new THREE.Group();
    M.roots.cryoDyn.add(mesh);
    const d = {
      mesh,
      cx: O.x + cx,
      cz: O.z + cz,
      w,
      h,
      alongX,
      open: 0,
      target: 0,
      col: null,
      y0: (O.y || 0) + (y0 || 0),
    };
    d.addCol = () => {
      if (!d.col)
        d.col = G.world.addBox(
          d.cx - (alongX ? w / 2 : 0.1),
          d.y0,
          d.cz - (alongX ? 0.1 : w / 2),
          d.cx + (alongX ? w / 2 : 0.1),
          d.y0 + h,
          d.cz + (alongX ? 0.1 : w / 2),
          { tag: "door", surface: "metal" },
        );
    };
    d.remCol = () => {
      if (d.col) {
        G.world.removeCollider(d.col);
        d.col = null;
      }
    };
    d.addCol();
    slideDoors.push(d);
    return d;
  }
  let actorScan = 0,
    actorPts = [];
  M.updateSlideDoors = function (dt) {
    const p = G.player.pos;
    if (Math.abs(p.x - O.x) > 220 || Math.abs(p.z - O.z) > 220) return;
    actorScan -= dt;
    if (actorScan <= 0) {
      actorScan = 0.25;
      actorPts = [];
      try {
        if (!G.isStub("actors") && G.actors.list)
          for (const a of G.actors.list()) {
            if (!a || a.dead || !a.pos) continue;
            if (Math.abs(a.pos.x - O.x) < 200 && Math.abs(a.pos.z - O.z) < 200)
              actorPts.push(a.pos);
          }
      } catch (e) {
        actorPts = [];
      }
    }
    for (const d of slideDoors) {
      const dist = Math.hypot(p.x - d.cx, p.z - d.cz);
      let near = dist < 3.0 && Math.abs(p.y - d.y0) < 2;
      let nearA = false;
      for (const q of actorPts)
        if (Math.hypot(q.x - d.cx, q.z - d.cz) < 2.4) {
          nearA = true;
          break;
        }
      near = near || nearA;
      if (near && d.target === 0) {
        d.target = 1;
        d.remCol();
        try {
          G.sfx.play("door_open", {
            pos: d.mesh.position,
            volume: 0.45,
            pitch: 1.25,
          });
        } catch (e) {
          /* ignore */
        }
      }
      if (!near && d.target === 1 && dist > 3.4 && !nearA) d.target = 0;
      const before = d.open;
      d.open = M.clamp(d.open + (d.target ? 1 : -1) * dt * 2.4, 0, 1);
      if (d.open !== before) {
        const off = d.open * (d.w - 0.1);
        if (d.alongX) d.mesh.position.x = d.cx + off;
        else d.mesh.position.z = d.cz + off;
      }
      if (d.open <= 0.001 && d.target === 0) d.addCol();
    }
  };

  // -------------------------------------------------------------------
  // Furniture kit (local coords)
  // -------------------------------------------------------------------
  /** Box footprint collider for something rotated by yaw (w along local x, d along local z). */
  function footCB(x, z, yaw, w, d, h, y, opts) {
    const c = Math.abs(Math.cos(yaw)),
      s = Math.abs(Math.sin(yaw));
    const hw = (c * w) / 2 + (s * d) / 2,
      hd = (s * w) / 2 + (c * d) / 2;
    CB(x - hw, y || 0, z - hd, x + hw, (y || 0) + h, z + hd, opts);
  }
  function locker(x, z, yaw, n, y, tint) {
    y = y || 0;
    M.pushXF(M.mtx(x, y, z, yaw));
    const lb = b("metal_painted");
    for (let i = 0; i < (n || 1); i++) {
      const ox = (i - ((n || 1) - 1) / 2) * 0.62;
      M.box(lb, ox - 0.3, 0, -0.28, ox + 0.3, 1.95, 0.28, {
        s: 1,
        c: tint || [0.7, 0.72, 0.72],
      });
      for (let k = 0; k < 4; k++)
        M.box(
          lb,
          ox - 0.18,
          1.55 + k * 0.06,
          0.281,
          ox + 0.18,
          1.58 + k * 0.06,
          0.29,
          { s: 1, c: C_DARK },
        ); // vents
      M.box(lb, ox + 0.18, 0.9, 0.281, ox + 0.22, 1.1, 0.3, {
        s: 1,
        c: C_STEEL,
      });
      M.box(lb, ox - 0.12, 1.25, 0.281, ox + 0.12, 1.36, 0.292, {
        s: 1,
        c: [0.95, 0.93, 0.85],
      }); // name card
    }
    M.popXF();
    footCB(x, z, yaw, 0.62 * (n || 1), 0.56, 1.95, y);
  }
  function table(x, z, w, d, h, yaw) {
    M.pushXF(M.mtx(x, 0, z, yaw || 0));
    const tb = b("metal_painted");
    M.box(tb, -w / 2, h - 0.05, -d / 2, w / 2, h, d / 2, {
      s: 1,
      c: [0.8, 0.8, 0.76],
    });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        M.box(
          tb,
          sx * (w / 2 - 0.06) - 0.03,
          0,
          sz * (d / 2 - 0.06) - 0.03,
          sx * (w / 2 - 0.06) + 0.03,
          h - 0.05,
          sz * (d / 2 - 0.06) + 0.03,
          { s: 1, c: C_STEEL },
        );
    M.popXF();
    footCB(x, z, yaw || 0, w, d, h);
  }
  function chair(x, z, yaw, y, c) {
    const bb = b("metal_painted");
    M.pushXF(M.mtx(x, y || 0, z, yaw));
    M.box(bb, -0.22, 0.42, -0.22, 0.22, 0.47, 0.22, {
      s: 1,
      c: c || [0.55, 0.32, 0.2],
    });
    M.box(bb, -0.22, 0.47, 0.18, 0.22, 0.92, 0.23, {
      s: 1,
      c: c || [0.55, 0.32, 0.2],
    });
    for (const sx of [-0.18, 0.18])
      for (const sz of [-0.18, 0.18])
        M.box(bb, sx - 0.02, 0, sz - 0.02, sx + 0.02, 0.42, sz + 0.02, {
          s: 1,
          c: C_STEEL,
        });
    M.popXF();
  }
  function desk(x, z, yaw, w, y) {
    w = w || 1.6;
    y = y || 0;
    M.pushXF(M.mtx(x, y, z, yaw));
    const db = b("wood_planks");
    M.box(db, -w / 2, 0.72, -0.4, w / 2, 0.78, 0.4, {
      s: 1,
      c: [0.62, 0.48, 0.34],
    });
    M.box(b("metal_painted"), -w / 2, 0, -0.38, -w / 2 + 0.45, 0.72, 0.38, {
      s: 1,
      c: [0.55, 0.6, 0.58],
    });
    M.box(b("metal_painted"), w / 2 - 0.45, 0, -0.38, w / 2, 0.72, 0.38, {
      s: 1,
      c: [0.55, 0.6, 0.58],
    });
    M.popXF();
    footCB(x, z, yaw, w, 0.8, 0.8, y, { surface: "wood" });
  }
  function fileCabinet(x, z, yaw, n) {
    M.pushXF(M.mtx(x, 0, z, yaw));
    const fb = b("metal_painted");
    for (let i = 0; i < (n || 1); i++) {
      const ox = (i - ((n || 1) - 1) / 2) * 0.52;
      M.box(fb, ox - 0.25, 0, -0.32, ox + 0.25, 1.35, 0.32, {
        s: 1,
        c: [0.5, 0.55, 0.5],
      });
      for (let k = 0; k < 4; k++)
        M.box(
          fb,
          ox - 0.08,
          0.2 + k * 0.32,
          0.321,
          ox + 0.08,
          0.24 + k * 0.32,
          0.335,
          { s: 1, c: C_STEEL },
        );
    }
    M.popXF();
    footCB(x, z, yaw, 0.52 * (n || 1), 0.64, 1.35);
  }
  function crateStack(x, z, n) {
    const cb = b("wood_planks");
    for (let i = 0; i < n; i++)
      M.box(
        cb,
        x - 0.45 + (i % 2) * 0.1,
        i * 0.7,
        z - 0.45,
        x + 0.45 + (i % 2) * 0.1,
        i * 0.7 + 0.7,
        z + 0.45,
        { s: 1, c: [0.68, 0.6, 0.46] },
      );
    CB(x - 0.5, 0, z - 0.5, x + 0.6, n * 0.7, z + 0.5, { surface: "wood" });
  }
  function bed(x, z, yaw) {
    M.pushXF(M.mtx(x, 0, z, yaw));
    const fb = b("metal_painted"),
      mb = b("fabric");
    M.box(fb, -0.45, 0.45, -1.0, 0.45, 0.55, 1.0, { s: 1, c: C_STEEL });
    M.box(mb, -0.42, 0.55, -0.95, 0.42, 0.68, 0.95, {
      s: 1,
      c: [0.82, 0.82, 0.78],
    });
    M.box(mb, -0.32, 0.68, -0.9, 0.32, 0.78, -0.58, {
      s: 1,
      c: [0.92, 0.92, 0.88],
    });
    for (const sx of [-0.42, 0.42])
      for (const sz of [-0.95, 0.95])
        M.box(fb, sx - 0.03, 0, sz - 0.03, sx + 0.03, 0.55, sz + 0.03, {
          s: 1,
          c: C_STEEL,
        });
    M.popXF();
    footCB(x, z, yaw, 0.95, 2.05, 0.75);
  }
  /** Coolant puddle with a frost rim (floor decal-ish quads). */
  function puddle(x, z, r, y) {
    const n = 10,
      yy = (y || 0) + 0.012;
    const pb = b("glass_dirty@window");
    const rr = M.rng("pud" + x + z);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2,
        k = r * rr.range(0.7, 1.15);
      pts.push([x + Math.cos(a) * k, z + Math.sin(a) * k]);
    }
    for (let i = 0; i < n; i++) {
      const p = pts[i],
        q = pts[(i + 1) % n];
      M.tri(
        pb,
        [x, yy, z],
        [p[0], yy, p[1]],
        [q[0], yy, q[1]],
        [0, 1, 0],
        [0.5, 0.5, 0, 0, 1, 0],
        [0.6, 0.75, 0.85],
      );
    }
  }
  /** Frost crust on a floor patch (pale, slightly raised). */
  function frost(x, z, w, d, y) {
    M.box(
      b("concrete"),
      x - w / 2,
      y || 0,
      z - d / 2,
      x + w / 2,
      (y || 0) + 0.015,
      z + d / 2,
      { s: 2, c: C_FROST, skip: 8 + 1 + 2 + 16 + 32 },
    );
  }

  // -------------------------------------------------------------------
  // A Long Winter pod: upright capsule on a plinth, steel back shell,
  // frosted glass front, orange collar ring, coolant lines to the ceiling,
  // status lamp. Front faces +z of the local frame (rotated by yaw).
  // opts: open (front door swung aside), empty, dead (red lamp, dark frost),
  // cracked (leaking: puddle + broken glass), ceilY
  // -------------------------------------------------------------------
  function cryoPod(x, z, yaw, opts) {
    opts = opts || {};
    const R = 0.62,
      H = 2.35,
      Y0 = 0.32;
    M.pushXF(M.mtx(x, 0, z, yaw));
    const steel = b("metal_painted"),
      steelDS = b("metal_painted@ds");
    // plinth
    M.cyl(steel, 0, 0, 0, 0.82, 0.78, Y0, 16, {
      capTop: true,
      c: [0.42, 0.45, 0.47],
    });
    // back shell (half cylinder, behind: local -z side → angles π..2π) + dome
    M.cyl(steelDS, 0, Y0, 0, R, R, H, 14, {
      a0: Math.PI,
      a1: Math.PI * 2,
      c: [0.78, 0.8, 0.8],
    });
    M.cyl(steel, 0, Y0 + H, 0, R, 0.18, 0.42, 14, {
      capTop: true,
      c: [0.72, 0.74, 0.74],
    });
    // inner padding (grey-white, quilted look by vertex tint) and a head rest
    M.cyl(b("fabric@ds"), 0, Y0 + 0.1, -0.02, R - 0.06, R - 0.06, H - 0.2, 10, {
      a0: Math.PI * 1.08,
      a1: Math.PI * 1.92,
      c: [0.78, 0.8, 0.82],
    });
    M.box(b("fabric"), -0.2, Y0 + 1.75, -0.5, 0.2, Y0 + 2.0, -0.38, {
      s: 1,
      c: [0.85, 0.86, 0.88],
    });
    // orange collar ring + side rails
    M.cyl(steel, 0, Y0 + H - 0.22, 0, R + 0.04, R + 0.04, 0.16, 18, {
      c: C_ORANGE,
    });
    M.cyl(steel, 0, Y0 + 0.02, 0, R + 0.05, R + 0.05, 0.12, 18, {
      c: C_ORANGE,
    });
    for (const sx of [-1, 1])
      M.box(steel, sx * R - 0.05, Y0, -0.05, sx * R + 0.05, Y0 + H, 0.05, {
        s: 1,
        c: C_STEEL,
      });
    // front glass (half cylinder, +z side → angles 0..π); open pods have it swung 100° aside
    const glass = b(opts.dead ? "glass_dirty" : "glass_dirty@window");
    const gc = opts.dead ? [0.62, 0.7, 0.74] : [0.85, 0.95, 1.0];
    if (opts.open) {
      M.pushXF(M.mtx(R, 0, 0, -1.75));
      M.cyl(glass, -R, Y0 + 0.05, 0, R - 0.02, R - 0.02, H - 0.1, 12, {
        a0: 0.12,
        a1: Math.PI - 0.12,
        c: gc,
      });
      M.popXF();
    } else if (opts.cracked) {
      M.cyl(glass, 0, Y0 + 0.05, 0, R - 0.02, R - 0.02, H * 0.45, 12, {
        a0: 0.12,
        a1: Math.PI - 0.12,
        c: gc,
      });
    } else {
      M.cyl(glass, 0, Y0 + 0.05, 0, R - 0.02, R - 0.02, H - 0.1, 12, {
        a0: 0.12,
        a1: Math.PI - 0.12,
        c: gc,
      });
      // frost bloom on the inside of the glass (pale plate, upper half)
      M.cyl(
        b("concrete@ds"),
        0,
        Y0 + 1.1 + (opts.dead ? -0.4 : 0.3),
        0,
        R - 0.05,
        R - 0.05,
        opts.dead ? 1.0 : 0.6,
        10,
        { a0: 0.3, a1: Math.PI - 0.3, c: C_FROST },
      );
    }
    // the sleeper inside (closed, dead pods): a dark shape behind the frost
    if (!opts.empty && !opts.open) {
      const fb = b("fabric");
      M.cyl(fb, 0, Y0 + 0.15, -0.12, 0.17, 0.2, 1.3, 8, {
        c: [0.32, 0.34, 0.36],
      });
      M.cyl(fb, 0, Y0 + 1.45, -0.12, 0.2, 0.14, 0.3, 8, {
        c: [0.32, 0.34, 0.36],
      });
      M.cyl(b("bone"), 0, Y0 + 1.75, -0.14, 0.11, 0.1, 0.24, 8, {
        capTop: true,
        c: opts.dead ? [0.55, 0.53, 0.5] : [0.7, 0.62, 0.55],
      });
    }
    // control box with the status lamp at the foot, coolant lines up the back
    M.box(steel, -0.28, Y0, 0.62, 0.28, Y0 + 0.55, 0.8, {
      s: 1,
      c: [0.4, 0.43, 0.45],
    });
    M.box(
      b(opts.dead ? "neon_red@lampr" : "emissive_window@lamp"),
      -0.07,
      Y0 + 0.38,
      0.801,
      0.07,
      Y0 + 0.48,
      0.81,
      { s: 1 },
    );
    M.box(
      b("emissive_window@lampw"),
      -0.2,
      Y0 + 0.12,
      0.801,
      0.0,
      Y0 + 0.28,
      0.81,
      { s: 1 },
    );
    const top = (opts.ceilY || 5.5) - 0.02;
    for (const sx of [-0.25, 0.25])
      M.pipe(
        b("metal_painted"),
        sx,
        Y0 + H + 0.2,
        -0.45,
        sx * 1.6,
        top,
        -0.75,
        0.05,
        6,
        { c: sx < 0 ? [0.55, 0.72, 0.85] : C_ORANGE },
      );
    // number stencil on the plinth front
    M.box(steel, -0.15, 0.08, 0.79, 0.15, 0.24, 0.8, {
      s: 1,
      c: [0.92, 0.9, 0.82],
    });
    M.popXF();
    // collider: closed pods are solid; open pods keep the back shell + side rails (you can stand in the doorway)
    if (opts.open) {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      const L2W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
      const pts = [L2W(0, -0.45), L2W(-0.62, -0.05), L2W(0.62, -0.05)];
      for (const [px, pz] of pts)
        CB(px - 0.22, 0, pz - 0.22, px + 0.22, Y0 + H, pz + 0.22);
      CB(x - 0.82, 0, z - 0.82, x + 0.82, Y0 - 0.02, z + 0.82, {
        surface: "metal",
      }); // the plinth step (walkable)
    } else {
      footCB(x, z, yaw, 1.5, 1.5, Y0 + H + 0.4);
    }
    if (opts.cracked) {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      puddle(x + s * 1.3, z + c * 1.3, 1.1);
      const gb = b("glass_dirty");
      const rr = M.rng("shards" + x + z);
      for (let i = 0; i < 9; i++) {
        const px = x + s * rr.range(0.8, 1.8) + rr.range(-0.6, 0.6),
          pz = z + c * rr.range(0.8, 1.8) + rr.range(-0.6, 0.6);
        M.box(gb, px - 0.1, 0.005, pz - 0.06, px + 0.1, 0.02, pz + 0.06, {
          s: 1,
          c: [0.8, 0.9, 0.95],
        });
      }
    }
  }

  // -------------------------------------------------------------------
  // Mainframe bank: tall cabinet with two tape reels behind glass and
  // rows of indicator lamps (CUSTODIAN)
  // -------------------------------------------------------------------
  function mainframe(x, z, yaw, rr) {
    M.pushXF(M.mtx(x, 0, z, yaw));
    const mb = b("metal_painted");
    M.box(mb, -0.55, 0, -0.4, 0.55, 2.3, 0.4, { s: 1, c: [0.72, 0.72, 0.68] });
    M.box(mb, -0.5, 1.15, 0.401, 0.5, 2.15, 0.41, {
      s: 1,
      c: [0.12, 0.13, 0.14],
    }); // smoked window
    for (const rx of [-0.24, 0.24]) {
      M.pushXF(M.mtx(rx, 1.65, 0.42, 0, Math.PI / 2));
      M.cyl(mb, 0, 0, 0, 0.2, 0.2, 0.03, 16, {
        capTop: true,
        capBot: true,
        c: [0.55, 0.56, 0.58],
      });
      M.cyl(mb, 0, 0.03, 0, 0.06, 0.06, 0.02, 8, {
        capTop: true,
        c: [0.2, 0.2, 0.2],
      });
      M.popXF();
    }
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 8; i++) {
        const k = rr();
        const key =
          k < 0.12
            ? "neon_red@lampr"
            : k < 0.5
              ? "emissive_window@lamp"
              : k < 0.75
                ? "emissive_window@lampw"
                : null;
        if (key)
          M.box(
            b(key),
            -0.42 + i * 0.12,
            0.72 + row * 0.12,
            0.401,
            -0.36 + i * 0.12,
            0.78 + row * 0.12,
            0.412,
            { s: 1 },
          );
      }
    M.box(mb, -0.5, 0.15, 0.401, 0.5, 0.6, 0.41, { s: 1, c: [0.5, 0.52, 0.5] }); // kick panel
    M.popXF();
    footCB(x, z, yaw, 1.1, 0.8, 2.3);
  }

  // -------------------------------------------------------------------
  // The blast door: two steel leaves (separate meshes) that slide apart
  // into wall pockets. Keypad lock via G.locks ('q_cryo_blast_door').
  // -------------------------------------------------------------------
  const BD = { z: -24.3, w: 1.8, h: 3.0, T: 0.32 };
  const blast = {
    state: "closed",
    t: 0,
    leaves: [],
    cols: [],
    locked: false,
    message: "",
    sndT: -1,
  };
  M.blastDoor = blast;
  function buildBlastDoor() {
    for (const side of [-1, 1]) {
      const g = new M.GeoBuf();
      const w = BD.w,
        h = BD.h,
        T = BD.T;
      M.box(g, -w / 2, 0, -T / 2, w / 2, h, T / 2, {
        s: 1.5,
        c: [0.52, 0.54, 0.55],
        skip: 0,
      });
      // raised panels + rivet rows on both faces
      for (const fz of [-1, 1]) {
        const zz = fz * (T / 2 + 0.01);
        for (const [y0, y1] of [
          [0.15, 1.35],
          [1.65, 2.85],
        ])
          M.box(
            g,
            -w / 2 + 0.12,
            y0,
            Math.min(zz, zz + fz * 0.04),
            w / 2 - 0.12,
            y1,
            Math.max(zz, zz + fz * 0.04),
            { s: 1, c: [0.46, 0.48, 0.49] },
          );
        // hazard chevrons along the meeting edge (orange / black)
        const ex = side < 0 ? w / 2 : -w / 2,
          dir = side < 0 ? -1 : 1;
        for (let i = 0; i < 10; i++) {
          const y0 = i * 0.3,
            col = i % 2 ? [0.08, 0.08, 0.08] : C_ORANGE;
          M.quad(
            g,
            [ex, y0, zz + fz * 0.05],
            [ex + dir * 0.35, y0 + 0.15, zz + fz * 0.05],
            [ex + dir * 0.35, y0 + 0.45, zz + fz * 0.05],
            [ex, y0 + 0.3, zz + fz * 0.05],
            [0, 0, fz],
            [0, 0, 1, 0, 1, 1, 0, 1],
            col,
          );
        }
        // stencilled "C-9" band
        M.box(
          g,
          -w / 2 + 0.2,
          1.42,
          Math.min(zz, zz + fz * 0.03),
          w / 2 - 0.2,
          1.58,
          Math.max(zz, zz + fz * 0.03),
          { s: 1, c: [0.85, 0.83, 0.76] },
        );
      }
      const mat = new THREE.MeshStandardMaterial({
        map: M.mat("metal_painted").map || null,
        vertexColors: true,
        roughness: 0.5,
        metalness: 0.45,
      });
      mat.userData.shared = true;
      const mesh = new THREE.Mesh(g.toGeometry(), mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      M.roots.cryoDyn = M.roots.cryoDyn || new THREE.Group();
      M.roots.cryoDyn.add(mesh);
      blast.leaves.push({ mesh, side });
    }
    applyBlastPose(0);
    blast.addCol = () => {
      if (blast.cols.length) return;
      blast.cols.push(
        G.world.addBox(
          O.x - BD.w,
          O.y || 0,
          O.z + BD.z - BD.T / 2,
          O.x + BD.w,
          (O.y || 0) + BD.h,
          O.z + BD.z + BD.T / 2,
          { tag: "blast_door", surface: "metal" },
        ),
      );
    };
    blast.remCol = () => {
      for (const c of blast.cols) G.world.removeCollider(c);
      blast.cols.length = 0;
    };
    blast.addCol();
  }
  function applyBlastPose(t) {
    const k = M.smooth(0, 1, t);
    for (const L of blast.leaves)
      L.mesh.position.set(
        O.x + L.side * (BD.w / 2 + k * (BD.w - 0.05)),
        O.y || 0,
        O.z + BD.z,
      );
  }
  const blastSndPos = () =>
    new THREE.Vector3(O.x, (O.y || 0) + 1.5, O.z + BD.z);
  M.openBlastDoor = function (instant, o) {
    const d = blast,
      silent = !!(o && o.silent);
    if (instant) {
      d.sndT = -1;
      d.remCol();
      d.state = "open";
      d.t = 1;
      applyBlastPose(1);
      return;
    }
    if (d.state === "open" || d.state === "opening") return;
    d.state = "opening";
    if (!silent) {
      try {
        G.sfx.play("alarm", { pos: blastSndPos(), volume: 0.5 });
      } catch (e) {
        /* */
      }
      d.sndT = 0.5;
    }
    try {
      if (G.player && G.player.shake) G.player.shake(0.12, 0.8);
    } catch (e) {
      /* */
    }
    G.emit("blastDoor", "opening");
  };
  M.closeBlastDoor = function (instant) {
    const d = blast;
    if (instant) {
      d.sndT = -1;
      d.state = "closed";
      d.t = 0;
      applyBlastPose(0);
      d.addCol();
      return;
    }
    if (d.state === "closed" || d.state === "closing") return;
    d.state = "closing";
    d.sndT = -1;
    d.addCol();
    try {
      G.sfx.play("door_open", { pos: blastSndPos(), volume: 0.9, pitch: 0.6 });
    } catch (e) {
      /* */
    }
    G.emit("blastDoor", "closing");
  };
  M.updateBlastDoor = function (dt) {
    const d = blast;
    if (!(dt > 0)) return;
    if (d.sndT > 0) {
      d.sndT -= dt;
      if (d.sndT <= 0) {
        d.sndT = -1;
        try {
          G.sfx.play("door_open", {
            pos: blastSndPos(),
            volume: 1,
            pitch: 0.55,
          });
        } catch (e) {
          /* */
        }
      }
    }
    if (d.state === "opening") {
      d.t = Math.min(1, d.t + dt / 3.2);
      applyBlastPose(d.t);
      if (d.t > 0.6) d.remCol();
      if (d.t >= 1) {
        d.state = "open";
        G.emit("blastDoor", "open");
      }
    } else if (d.state === "closing") {
      d.t = Math.max(0, d.t - dt / 3.2);
      applyBlastPose(d.t);
      if (d.t <= 0) {
        d.state = "closed";
        d.addCol();
        G.emit("blastDoor", "closed");
      }
    }
  };
  /** Keypad use: quest hold → message; else the G.locks keypad (code 0220) → open. */
  function useKeypad() {
    const d = blast;
    if (d.state === "open" || d.state === "opening") {
      G.notify("The blast door is open.");
      return;
    }
    if (d.state !== "closed") return;
    if (d.locked) {
      try {
        G.sfx.play("ui_error");
      } catch (e) {
        /* */
      }
      G.notify(
        d.message || "The keypad is dark. No power to the door circuit.",
      );
      return;
    }
    const K = G.locks;
    if (K && !G.isStub("locks") && K.open) {
      if (K.isOpen && K.isOpen(LOCK_ID)) {
        M.openBlastDoor(false);
        return;
      }
      K.open(LOCK_ID, () => M.openBlastDoor(false), {
        label: "Cryo Unit C-9 — Blast Door",
      });
      return;
    }
    M.openBlastDoor(false); // no lock registry loaded: the door simply opens
  }
  M.useBlastKeypad = useKeypad;
  /** Register the keypad lock (the registry lives in ui_interact, order 70 → after map init). */
  function registerLock() {
    const K = G.locks;
    if (!K || G.isStub("locks") || !K.register) return;
    try {
      K.register({
        id: LOCK_ID,
        label: "Cryo Unit C-9 Blast Door",
        code: "0220",
        hint: "Director Calloway's office: her last log entry and the note on her desk.",
      });
    } catch (e) {
      G.reportError("map:cryoLock", e);
    }
  }
  G.on("initDone", registerLock);
  /**
   * The story route out: the landing's EXIT door climbs into the Municipal Building's service corridor
   * (poi_civic: anchor 'cryo_arrive', the C-9 blast door there at 'cryo_access'), and that door leads back
   * down to our landing. Without poi_civic the EXIT door keeps going straight out to LAYOUT.cryoExit.
   */
  function linkMunicipal() {
    try {
      const P = G.pois;
      if (!P || G.isStub("pois") || typeof P.setCryoAccessTarget !== "function")
        return;
      const A2 = M.anchors.cryo_c9;
      if (!A2 || !M.cryoExitDoor) return;
      const get = (n) =>
        (P.getAnchor &&
          (P.getAnchor("municipal_building", n) ||
            P.getAnchor("municipal", n))) ||
        null;
      const arrive = get("cryo_arrive") || new THREE.Vector3(9422, 0, -6.1);
      P.setCryoAccessTarget({
        x: A2.stair_top.x,
        y: A2.stair_top.y,
        z: A2.stair_top.z,
        yaw: Math.PI,
      });
      const d = M.cryoExitDoor.def;
      d.target = { x: arrive.x, y: arrive.y || 0, z: arrive.z, yaw: Math.PI };
      d.label = "Municipal Building";
      d.verb = "Climb up to";
      if (M.cryoExitDoor.label !== undefined) M.cryoExitDoor.label = d.label;
      if (M.cryoExitDoor.verb !== undefined) M.cryoExitDoor.verb = d.verb;
      M.cryoViaMunicipal = true;
    } catch (e) {
      G.reportError("map:cryoLink", e);
    }
  }
  G.on("initDone", linkMunicipal);

  // -------------------------------------------------------------------
  // Interior build
  // -------------------------------------------------------------------
  const BAY_H = 5.5;
  const POD_Z = [4, 8, 12, 16, 23, 27];
  function buildInterior() {
    const rr = M.rng("cryoC9");
    // ================= STAIRWELL (up to the Municipal Building sub-basement) =================
    room(-2.5, -40, 2.5, -24.6, 0, 9.5, {
      wall: "concrete",
      floor: "concrete",
      lightStep: 4,
      deadLights: 0.5,
      noRibs: true,
      doors: [{ side: "s", a: -1.8, b: 1.8, h: 3, frame: false }],
    });
    // threshold between the two rooms under the blast door
    M.box(b("metal_panel"), -1.8, 0, -24.6, 1.8, 0.02, -24.0, {
      s: 1,
      c: [0.55, 0.57, 0.6],
      skip: 8,
    });
    // the flight: 24 steps × 0.25 m from z -25.2 to the landing at z -37 (y 6)
    const steps = 24,
      z0s = -25.2,
      run = (37 - 25.2) / steps;
    for (let i = 0; i < steps; i++) {
      const y = (6 * (i + 1)) / steps,
        za = z0s - i * run,
        zb = za - run;
      M.box(b("concrete"), -2.2, y - 0.25, zb, 2.2, y, za, {
        s: 1.5,
        c: [0.7, 0.7, 0.68],
      });
      M.box(b("metal_painted"), -2.2, y - 0.03, za - 0.06, 2.2, y + 0.005, za, {
        s: 1,
        c: C_ORANGE,
      }); // nosing
      CB(-2.2, 0, zb, 2.2, y, za, { surface: "concrete" });
    }
    // landing at y 6, z -40..-37
    M.box(b("concrete"), -2.5, 5.7, -40, 2.5, 6, -37, {
      s: 2,
      c: [0.66, 0.66, 0.64],
    });
    CB(-2.5, 5.7, -40, 2.5, 6, -37, { surface: "concrete" });
    // handrails along both walls
    for (const sx of [-2.38, 2.38]) {
      M.pipe(b("metal_painted"), sx, 1.0, -25, sx, 7.0, -37, 0.035, 6, {
        c: C_STEEL,
      });
      M.pipe(b("metal_painted"), sx, 7.0, -37, sx, 7.0, -39.8, 0.035, 6, {
        c: C_STEEL,
      });
    }
    // the exit door on the landing (north wall)
    M.box(b("metal_painted"), -0.75, 6, -39.98, 0.75, 8.2, -39.88, {
      s: 1,
      c: [0.42, 0.45, 0.44],
    });
    M.box(b("metal_painted"), -0.92, 6, -39.99, 0.92, 8.38, -39.95, {
      s: 1,
      c: C_DARK,
    });
    M.box(b("rust"), -0.5, 7.0, -39.88, 0.5, 7.06, -39.84, {
      s: 1,
      c: [0.8, 0.7, 0.6],
    });
    sign("EXIT", 0, 8.75, -39.95, 0, 1, 1.2);
    sign("MUNICIPAL BLDG · SUB-BASEMENT 3", 0, 9.1, -24.66, 0, -1, 3.6);
    sign("SERVICE STAIR", 1.6, 3.6, -24.66, 0, -1, 1.6);
    M.box(b("emissive_window@lamp"), -0.15, 8.6, -39.6, 0.15, 8.7, -39.3, {
      s: 1,
    });
    A.stair_bottom = [0, 0, -25.6];
    A.stair_top = [0, 6, -38.4];
    A.exit_door = [0, 7.2, -39.6];

    // ================= BLAST DOOR + CORRIDOR =================
    room(-2, -24, 2, 0, 0, 3.4, {
      pipes: true,
      lightStep: 3,
      doors: [
        { side: "s", a: -2, b: 2, h: 3, frame: false },
        { side: "n", a: -1.8, b: 1.8, h: 3, frame: false },
        { side: "e", a: -14, b: -12.5, h: 2.5 },
        { side: "e", a: -5, b: -3.5, h: 2.5 },
        { side: "w", a: -14, b: -12.5, h: 2.5 },
      ],
    });
    // heavy frame around the blast door (corridor side)
    const fr = b("metal_painted");
    M.box(fr, -2, 0, -24.0, -1.8, 3.0, -23.7, { s: 1, c: C_STEEL });
    M.box(fr, 1.8, 0, -24.0, 2, 3.0, -23.7, { s: 1, c: C_STEEL });
    M.box(fr, -2, 3.0, -24.0, 2, 3.4, -23.7, { s: 1, c: C_STEEL });
    for (let i = 0; i < 8; i++)
      M.quad(
        b("metal_painted"),
        [-1.8 + i * 0.45, 0.012, -23.7],
        [-1.8 + i * 0.45 + 0.22, 0.012, -23.7],
        [-1.8 + i * 0.45 + 0.42, 0.012, -22.9],
        [-1.8 + i * 0.45 + 0.2, 0.012, -22.9],
        [0, 1, 0],
        [0, 0, 1, 0, 1, 1, 0, 1],
        C_ORANGE,
      );
    sign("BLAST DOOR", 0, 3.2, -23.68, 0, 1, 2.4);
    // keypad on the east wall beside the door (corridor) + a twin on the stair side
    const kp = b("metal_painted");
    M.box(kp, 1.84, 1.05, -22.9, 2.0, 1.6, -22.35, {
      s: 1,
      c: [0.35, 0.37, 0.38],
    });
    M.box(b("emissive_window@lampw"), 1.835, 1.42, -22.82, 1.84, 1.54, -22.43, {
      s: 1,
    });
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 3; c++)
        M.box(
          kp,
          1.825,
          1.12 + r * 0.07,
          -22.78 + c * 0.11,
          1.84,
          1.17 + r * 0.07,
          -22.71 + c * 0.11,
          { s: 1, c: [0.82, 0.8, 0.72] },
        );
    M.box(kp, 2.05, 1.05, -24.85, 2.45, 1.6, -24.65, {
      s: 1,
      c: [0.35, 0.37, 0.38],
    });
    M.box(b("emissive_window@lampw"), 2.12, 1.42, -24.86, 2.38, 1.54, -24.85, {
      s: 1,
    });
    A.blast_door = [0, 0, -23.2];
    A.door_keypad = [1.75, 1.3, -22.6];
    A.door_keypad_stair = [2.25, 1.3, -25.0];
    for (const x of [-1.55, 1.55])
      M.cyl(b("neon_red@lampr"), x, 3.05, -23.6, 0.1, 0.1, 0.18, 8, {
        capTop: true,
      });
    A.corridor = [0, 0, -12];
    // corridor dressing: a fallen ceiling panel, frost creeping up from the bay, a wheelchair
    M.obox(b("metal_panel"), -0.8, 0.15, -7.5, 1.2, 0.05, 1.8, 0.35, {
      s: 1,
      c: C_CEIL,
    });
    frost(0, -1.5, 3.8, 3, 0);
    frost(0.4, -4, 2.6, 2, 0);
    sign("PROJECT LONG WINTER", 0, 2.7, -0.05, 0, -1, 2.8);
    sign("DIRECTOR'S OFFICE", 1.96, 2.85, -13.25, -1, 0, 1.6);
    sign("SECURITY", 1.96, 2.85, -4.25, -1, 0, 1.4);
    sign("COMPUTER ROOM", -1.96, 2.85, -13.25, 1, 0, 1.6);

    // ================= DIRECTOR'S OFFICE ================= x 2..13, z -20..-9
    room(2, -20, 13, -9, 0, 3.2, {
      floor: "wood_planks",
      floorC: [0.55, 0.45, 0.36],
      lightStep: 3.6,
      deadLights: 0.5,
      doors: [{ side: "w", a: -14, b: -12.5, h: 2.5 }],
    });
    slideDoor(2, -13.25, 1.5, 2.5, false, 0);
    desk(8.5, -16.2, 0, 2.2);
    chair(8.5, -17.1, 0, 0, [0.4, 0.22, 0.14]);
    M.box(b("fabric"), 5, 0.005, -18.5, 11.5, 0.02, -12.5, {
      s: 2,
      c: [0.42, 0.2, 0.16],
    }); // rug
    fileCabinet(12.55, -15, -Math.PI / 2, 3);
    // bookcase + framed map of the five boroughs, the Long Winter emblem
    M.box(b("wood_planks"), 12.6, 0, -19.6, 12.95, 2.2, -17.2, {
      s: 1,
      c: [0.45, 0.33, 0.24],
    });
    for (let y = 0.4; y < 2.2; y += 0.45)
      for (let i = 0; i < 5; i++)
        M.box(
          b("fabric"),
          12.62,
          y,
          -19.5 + i * 0.46,
          12.9,
          y + 0.36,
          -19.15 + i * 0.46,
          {
            s: 1,
            c: [
              [0.5, 0.2, 0.15],
              [0.2, 0.3, 0.45],
              [0.3, 0.38, 0.25],
              [0.6, 0.55, 0.4],
              [0.35, 0.3, 0.3],
            ][i],
          },
        );
    CB(12.6, 0, -19.6, 12.95, 2.2, -17.2);
    logo(7.5, 2.0, -19.95, 0, 0, 1, 1.4);
    M.box(b("wood_planks"), 3.5, 1.2, -19.97, 6.0, 2.6, -19.92, {
      s: 1,
      c: [0.3, 0.22, 0.16],
    });
    M.box(b("plaster_stained"), 3.6, 1.3, -19.92, 5.9, 2.5, -19.9, {
      s: 1,
      c: [0.9, 0.86, 0.72],
    });
    // the armchair in the corner where Ruth Calloway sat out the last winter before she left
    const ac = b("fabric");
    M.box(ac, 3.0, 0, -19.5, 4.4, 0.45, -18.1, { s: 1, c: [0.45, 0.32, 0.22] });
    M.box(ac, 3.0, 0.45, -19.5, 4.4, 1.15, -19.2, {
      s: 1,
      c: [0.45, 0.32, 0.22],
    });
    for (const sx of [3.0, 4.15])
      M.box(ac, sx, 0.45, -19.5, sx + 0.25, 0.75, -18.1, {
        s: 1,
        c: [0.42, 0.3, 0.2],
      });
    CB(3.0, 0, -19.5, 4.4, 0.45, -18.1, { surface: "fabric" });
    // (her chair is empty: her last log entry says she walked out into the city)
    A.director_office = [7.5, 0, -14];
    A.director_desk = [8.5, 0.78, -16.2];
    A.director_terminal = [11.4, 0, -19.1];
    A.director_body = [3.7, 0, -18.4];
    A.director_chair = [8.5, 0, -17.1];

    // ================= SECURITY ================= x 2..10, z -8..-1
    room(2, -8, 10, -1, 0, 3.2, {
      pipes: true,
      lightStep: 3.6,
      deadLights: 0.4,
      doors: [{ side: "w", a: -5, b: -3.5, h: 2.5 }],
    });
    desk(5.5, -6.8, 0, 1.8);
    chair(5.5, -6.0, Math.PI, 0);
    locker(9.6, -3, -Math.PI / 2, 2, 0, [0.42, 0.48, 0.44]);
    // gun rack (empty pegs) + monitors showing snow
    M.box(b("wood_planks"), 3.0, 1.0, -7.97, 4.8, 2.2, -7.85, {
      s: 1,
      c: [0.4, 0.3, 0.22],
    });
    for (let i = 0; i < 4; i++)
      M.box(
        b("metal_painted"),
        3.2 + i * 0.42,
        1.3,
        -7.85,
        3.25 + i * 0.42,
        1.36,
        -7.7,
        { s: 1, c: C_DARK },
      );
    for (let i = 0; i < 3; i++) {
      M.box(
        b("metal_painted"),
        6.2 + i * 0.9,
        1.6,
        -7.95,
        6.95 + i * 0.9,
        2.2,
        -7.6,
        { s: 1, c: [0.5, 0.48, 0.42] },
      );
      if (i !== 1)
        M.box(
          b("emissive_window@lampw"),
          6.28 + i * 0.9,
          1.68,
          -7.59,
          6.87 + i * 0.9,
          2.12,
          -7.58,
          { s: 1 },
        );
    }
    A.security = [6, 0, -4.5];
    A.security_locker = [9.35, 0, -6.4];
    A.security_desk = [5.5, 0.8, -6.8];

    // ================= COMPUTER ROOM (CUSTODIAN) ================= x -16..-2, z -22..-6
    room(-16, -22, -2, -6, 0, 4, {
      floor: "metal_panel",
      floorC: [0.5, 0.52, 0.55],
      pipes: true,
      lightStep: 4,
      deadLights: 0.6,
      doors: [{ side: "e", a: -14, b: -12.5, h: 2.5 }],
    });
    slideDoor(-2, -13.25, 1.5, 2.5, false, 0);
    const mr = M.rng("custodian");
    for (let i = 0; i < 6; i++) mainframe(-14.5 + i * 1.75, -21.35, 0, mr);
    for (let i = 0; i < 4; i++)
      mainframe(-15.45, -18 + i * 1.6, Math.PI / 2, mr);
    for (let i = 0; i < 3; i++)
      mainframe(-4.6 + 0, -19.2 + i * 1.5, -Math.PI / 2, mr);
    // the operator console + teletype in the middle of the room
    M.pushXF(M.mtx(-8.5, 0, -11.5, Math.PI));
    M.box(b("metal_painted"), -1.6, 0, -0.45, 1.6, 0.85, 0.45, {
      s: 1,
      c: [0.6, 0.62, 0.6],
    });
    M.obox(b("metal_painted"), 0, 0.95, 0.05, 3.2, 0.24, 0.7, 0, {
      pitch: 0.45,
      c: [0.55, 0.57, 0.56],
    });
    for (let i = 0; i < 14; i++)
      M.box(
        b(i % 5 === 0 ? "neon_red@lampr" : "emissive_window@lamp"),
        -1.4 + i * 0.2,
        1.06,
        0.08,
        -1.34 + i * 0.2,
        1.1,
        0.14,
        { s: 1 },
      );
    M.box(b("emissive_window@lampw"), -0.45, 1.2, -0.35, 0.45, 1.75, -0.3, {
      s: 1,
    }); // the one screen still lit
    M.box(b("metal_painted"), -0.55, 0.85, -0.42, 0.55, 1.85, -0.3, {
      s: 1,
      c: [0.45, 0.45, 0.42],
      skip: 16,
    });
    M.popXF();
    footCB(-8.5, -11.5, Math.PI, 3.2, 0.9, 1.1);
    chair(-8.5, -10.4, Math.PI, 0, [0.3, 0.32, 0.36]);
    // speaker grille high on the north wall
    M.box(b("metal_painted"), -9.6, 2.6, -21.98, -8.4, 3.4, -21.9, {
      s: 1,
      c: [0.3, 0.3, 0.3],
    });
    for (let i = 0; i < 6; i++)
      M.box(
        b("metal_painted"),
        -9.5,
        2.7 + i * 0.12,
        -21.9,
        -8.5,
        2.74 + i * 0.12,
        -21.87,
        { s: 1, c: C_DARK },
      );
    // cable bundles across the floor
    for (let i = 0; i < 5; i++)
      M.pipe(
        b("rubber"),
        -12 + i * 0.6,
        0.04,
        -20.5,
        -9.5 + i * 0.3,
        0.04,
        -12.2,
        0.04,
        5,
        { c: [0.1, 0.1, 0.1] },
      );
    sign("COMPUTER ROOM", -9, 3.55, -6.04, 0, -1, 2.2);
    A.computer_core = [-9, 0, -16];
    A.computer_terminal = [-8.5, 0, -10.6];
    A.custodian_speaker = [-9, 3.0, -21.6];

    // ================= POD BAY ================= x -9..9, z 0..30, h 5.5
    room(-9, 0, 9, 30, 0, BAY_H, {
      floor: "tile_cryo",
      floorC: [0.52, 0.56, 0.6],
      lightStep: 4.5,
      deadLights: 0.45,
      pipes: true,
      doors: [
        { side: "n", a: -2, b: 2, h: 3, frame: false },
        { side: "e", a: 18.5, b: 20.5, h: 2.6 },
        { side: "w", a: 18.5, b: 20.5, h: 2.6 },
        { side: "s", a: -1.5, b: 1.5, h: 2.6 },
      ],
    });
    // pods: west row 1–6 (front faces east), east row 7–12 (front faces west).
    // 7 = the hero's (open, alive), 9 = Zeke's (open, empty, thawed weeks ago); 3 and 11 cracked & leaking.
    POD_Z.forEach((z, i) => {
      const nW = i + 1,
        nE = i + 7;
      cryoPod(-7.4, z, Math.PI / 2, {
        dead: true,
        cracked: nW === 3,
        ceilY: BAY_H,
      });
      const eOpts =
        nE === 7
          ? { open: true, empty: true, ceilY: BAY_H }
          : nE === 9
            ? { open: true, empty: true, dead: true, ceilY: BAY_H }
            : { dead: true, cracked: nE === 11, ceilY: BAY_H };
      cryoPod(7.4, z, -Math.PI / 2, eOpts);
      A["pod_" + nW] = [-7.4, 0, z];
      A["pod_" + nE] = [7.4, 0, z];
    });
    // frost on the floor in front of the rows, coolant puddles
    for (const z of POD_Z) {
      frost(-5.9, z, 1.4, 2.2, 0);
      frost(5.9, z, 1.4, 2.2, 0);
    }
    puddle(5.2, 4.6, 0.9);
    puddle(-2.5, 14, 1.4);
    puddle(3.5, 25.5, 1.0);
    // central control island + coolant manifold
    M.box(b("metal_painted"), -1.4, 0, 13.2, 1.4, 1.0, 16.8, {
      s: 1,
      c: [0.55, 0.58, 0.6],
    });
    M.obox(b("metal_painted"), 0, 1.1, 15, 2.6, 0.2, 3.4, 0, {
      c: [0.48, 0.5, 0.52],
    });
    for (let i = 0; i < 12; i++)
      M.box(
        b(i === 6 ? "emissive_window@lamp" : "neon_red@lampr"),
        -1.1 + (i % 6) * 0.42,
        1.22,
        13.6 + Math.floor(i / 6) * 2.6,
        -0.98 + (i % 6) * 0.42,
        1.26,
        13.75 + Math.floor(i / 6) * 2.6,
        { s: 1 },
      );
    CB(-1.4, 0, 13.2, 1.4, 1.2, 16.8);
    M.cyl(b("metal_painted"), 0, 1.2, 15, 0.35, 0.35, BAY_H - 1.2, 10, {
      c: [0.6, 0.62, 0.64],
    });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + 0.4;
      M.pipe(
        b("metal_painted"),
        0,
        BAY_H - 0.6,
        15,
        Math.cos(a) * 6.5,
        BAY_H - 0.3,
        15 + Math.sin(a) * 9,
        0.09,
        6,
        { c: k % 2 ? C_ORANGE : [0.55, 0.72, 0.85] },
      );
    }
    if (M.skeleton) M.skeleton(-1.8, 17.4, 0.6, M.rng("tech"), false, LAYER, 0); // a technician who never made it out (local coords)
    sign("POD BAY", 0, 4.4, 0.06, 0, 1, 2.6);
    sign("SLEEP SAFE. WAKE STRONG.", 0, 4.4, 29.94, 0, -1, 4.2);
    sign("SUIT PREP", 8.94, 2.95, 19.5, -1, 0, 1.6);
    sign("INFIRMARY", -8.94, 2.95, 19.5, 1, 0, 1.6);
    sign("MAINTENANCE", 0, 2.95, 29.94, 0, -1, 1.8);
    sign("DANGER · COOLANT", 0, 3.6, 29.94, 0, -1, 2.0);
    logo(0, 0.02, 22, 0, 1, 0, 3.2);
    logo(0, 3.6, 0.06, 0, 0, 1, 1.4);
    // red emergency beacons along the bay
    for (const z of [6, 14, 22])
      for (const x of [-8.85, 8.85])
        M.cyl(
          b("neon_red@lampr"),
          x - Math.sign(x) * 0.1,
          4.6,
          z,
          0.09,
          0.09,
          0.2,
          8,
          { capTop: true },
        );
    A.pod_bay = [0, 0, 15];
    A.player_pod = A.pod_7;
    A.zeke_pod = A.pod_9;
    A.player_start = [6.35, 0, POD_Z[0]]; // standing in pod 7's doorway, facing the bay (west)

    // ================= SUIT PREP ================= x 9..19, z 14..25
    room(9, 14, 19, 25, 0, 3.2, {
      floor: "concrete",
      lightStep: 3.5,
      deadLights: 0.3,
      doors: [{ side: "w", a: 18.5, b: 20.5, h: 2.6 }],
    });
    slideDoor(9, 19.5, 2, 2.6, false, 0);
    // suit lockers on the north and south walls; a gap on the south wall for Zeke's locker (quest prop)
    for (let i = 0; i < 7; i++)
      locker(10.2 + i * 1.25, 14.35, 0, 2, 0, [0.72, 0.74, 0.74]);
    for (let i = 0; i < 6; i++) {
      const x = 10.2 + i * 1.25;
      if (Math.abs(x - 16.45) < 0.7) continue;
      locker(x, 24.65, Math.PI, 2, 0, [0.72, 0.74, 0.74]);
    }
    // benches down the middle
    for (const z of [17.4, 21.6]) {
      M.box(b("wood_planks"), 11, 0.42, z - 0.22, 17, 0.48, z + 0.22, {
        s: 1,
        c: [0.6, 0.48, 0.34],
      });
      M.box(b("metal_painted"), 11.2, 0, z - 0.05, 16.8, 0.42, z + 0.05, {
        s: 1,
        c: C_STEEL,
      });
      CB(11, 0, z - 0.22, 17, 0.48, z + 0.22, { surface: "wood" });
    }
    // spare cryo suits on hooks (grey-white with the orange collar ring)
    for (let i = 0; i < 4; i++) {
      const x = 18.85,
        z = 15.6 + i * 0.7;
      M.box(b("fabric"), x - 0.12, 0.6, z - 0.22, x - 0.02, 1.7, z + 0.22, {
        s: 1,
        c: [0.82, 0.83, 0.84],
      });
      M.box(b("fabric"), x - 0.13, 1.6, z - 0.2, x - 0.01, 1.68, z + 0.2, {
        s: 1,
        c: C_ORANGE,
      });
    }
    // the VIGIL charging cradle: a wall shelf with a cyan-lit bracket (the goggles themselves are a quest pickup)
    M.box(b("metal_painted"), 18.55, 1.0, 21.5, 18.98, 1.06, 23.1, {
      s: 1,
      c: [0.4, 0.42, 0.44],
    });
    M.box(b("emissive_window@lampw"), 18.6, 1.06, 21.7, 18.9, 1.09, 22.9, {
      s: 1,
    });
    M.box(b("metal_painted"), 18.9, 1.06, 21.6, 18.98, 1.6, 23.0, {
      s: 1,
      c: [0.35, 0.37, 0.4],
    });
    logo(18.95, 1.95, 22.3, -1, 0, 0, 0.7);
    CB(18.55, 0.95, 21.5, 18.98, 1.06, 23.1);
    // a mirror over a steel sink
    M.box(b("metal_painted"), 9.05, 0.8, 23.2, 9.6, 0.95, 24.2, {
      s: 1,
      c: [0.75, 0.77, 0.78],
    });
    M.box(b("chrome"), 9.02, 1.25, 23.2, 9.05, 2.1, 24.2, {
      s: 1,
      c: [0.85, 0.88, 0.9],
    });
    CB(9.05, 0, 23.2, 9.6, 0.95, 24.2);
    A.prep_room = [14, 0, 19.5];
    A.goggles_cradle = [18.65, 1.1, 22.3];
    A.zeke_locker = [16.45, 0, 24.3];
    A.lockers = [13, 0, 15.2];

    // ================= INFIRMARY ================= x -19..-9, z 14..25
    room(-19, 14, -9, 25, 0, 3.2, {
      floorC: [0.82, 0.84, 0.85],
      lightStep: 3.5,
      deadLights: 0.4,
      doors: [{ side: "e", a: 18.5, b: 20.5, h: 2.6 }],
    });
    slideDoor(-9, 19.5, 2, 2.6, false, 0);
    bed(-17.6, 16.2, Math.PI / 2);
    bed(-17.6, 19.6, Math.PI / 2);
    bed(-17.6, 23.0, Math.PI / 2);
    // a sheet over the middle bed's occupant
    M.box(b("fabric"), -18.5, 0.78, 19.25, -16.7, 0.98, 19.95, {
      s: 1,
      c: [0.88, 0.88, 0.86],
    });
    for (let i = 0; i < 3; i++) {
      M.box(
        b("metal_painted"),
        -14 + i * 1.2,
        0,
        14.05,
        -13.1 + i * 1.2,
        1.9,
        14.5,
        { s: 1, c: [0.9, 0.9, 0.88] },
      );
      M.box(
        b("neon_red@lampr"),
        -13.62 + i * 1.2,
        1.45,
        14.51,
        -13.48 + i * 1.2,
        1.52,
        14.52,
        { s: 1 },
      );
      M.box(
        b("neon_red@lampr"),
        -13.58 + i * 1.2,
        1.41,
        14.51,
        -13.52 + i * 1.2,
        1.56,
        14.52,
        { s: 1 },
      );
    }
    CB(-14, 0, 14.05, -10.5, 1.9, 14.5);
    table(-12, 22.8, 1.8, 0.8, 0.9, 0);
    M.cyl(b("metal_painted"), -15, 0, 21, 0.25, 0.25, 0.04, 8, {
      capTop: true,
      c: C_STEEL,
    });
    M.pipe(b("metal_painted"), -15, 0, 21, -15, 1.8, 21, 0.02, 4, {
      c: C_STEEL,
    }); // IV stand
    A.infirmary = [-13.5, 0, 19.5];
    A.infirmary_cabinet = [-12.5, 0, 14.9];

    // ================= MAINTENANCE / BOILERS ================= x -8..8, z 30..42
    room(-8, 30, 8, 42, 0, 4.5, {
      wall: "concrete",
      floor: "concrete",
      floorC: [0.45, 0.46, 0.46],
      pipes: true,
      lightStep: 4,
      deadLights: 0.6,
      noRibs: true,
      doors: [{ side: "n", a: -1.5, b: 1.5, h: 2.6 }],
    });
    slideDoor(0, 30, 3, 2.6, true, 0);
    // two boilers, the coolant pumps, the compressor
    for (const [x, z] of [
      [5, 34],
      [5, 39],
    ]) {
      M.cyl(b("metal_painted"), x, 0, z, 1.4, 1.4, 3.2, 18, {
        capTop: true,
        c: [0.55, 0.5, 0.45],
      });
      for (const y of [0.6, 1.6, 2.6])
        M.cyl(b("rust"), x, y, z, 1.43, 1.43, 0.12, 18, {
          c: [0.7, 0.55, 0.45],
        });
      M.pipe(b("metal_painted"), x, 3.2, z, x - 2, 4.3, z, 0.18, 8, {
        c: [0.6, 0.55, 0.5],
      });
      CB(x - 1.4, 0, z - 1.4, x + 1.4, 3.3, z + 1.4);
    }
    for (let i = 0; i < 3; i++) {
      const x = -6.2,
        z = 33 + i * 3;
      M.box(b("metal_painted"), x - 0.9, 0, z - 0.7, x + 0.9, 1.2, z + 0.7, {
        s: 1,
        c: [0.45, 0.55, 0.62],
      });
      M.cyl(b("metal_painted"), x, 1.2, z, 0.4, 0.4, 0.5, 10, {
        capTop: true,
        c: C_ORANGE,
      });
      M.pipe(b("metal_painted"), x, 1.7, z, x, 4.3, z, 0.12, 6, {
        c: [0.55, 0.72, 0.85],
      });
      CB(x - 0.9, 0, z - 0.7, x + 0.9, 1.7, z + 0.7);
    }
    crateStack(-1.5, 40.8, 2);
    crateStack(-0.4, 41.2, 1);
    puddle(1, 36, 1.6);
    puddle(-3.5, 39.5, 1.1);
    // the roaches' nest: rotten crates and filth in the south-west corner
    M.box(b("wood_rotten"), -7.6, 0, 40.4, -5.6, 0.5, 41.8, {
      s: 1,
      c: [0.45, 0.38, 0.3],
    });
    CB(-7.6, 0, 40.4, -5.6, 0.5, 41.8, { surface: "wood" });
    A.maintenance = [0, 0, 35];
    A.roach_nest = [-4.5, 0, 39];
    A.boiler = [3, 0, 36.5];
    // the cell's radiation: none (a cold, clean place); only the coolant hums
  }

  // -------------------------------------------------------------------
  M.buildCryo = function () {
    const L = G.LAYOUT;
    const I = L.INTERIORS && L.INTERIORS.cryo_c9;
    if (I) O = I.origin;
    M.pushXF(M.mtx(O.x, O.y || 0, O.z, 0));
    buildInterior();
    M.popXF();
    buildBlastDoor();
    if (M.buildCryoStreetDoor) M.buildCryoStreetDoor(); // 50_cryo.js (world coords)
    // --- anchors to world ---
    const W = {};
    for (const k in A) {
      const a = A[k];
      if (k.startsWith("ext_")) W[k] = new THREE.Vector3(a[0], a[1], a[2]);
      else W[k] = new THREE.Vector3(O.x + a[0], (O.y || 0) + a[1], O.z + a[2]);
    }
    const EX = L.cryoExit;
    W.exterior = new THREE.Vector3(EX.x, 0, EX.z);
    M.anchors.cryo_c9 = W;
    // --- player start: in pod 7's doorway, facing west across the bay ---
    L.playerStart = {
      x: W.player_start.x,
      y: O.y || 0,
      z: W.player_start.z,
      yaw: Math.PI / 2,
    };
    // --- doors: landing exit ⇄ Chambers Street arch ---
    M.cryoExitDoor = G.world.addDoor({
      pos: W.exit_door.clone(),
      label: "Chambers Street",
      verb: "Climb out to",
      radius: 1.4,
      target: { x: EX.x, y: 0, z: EX.z, yaw: EX.yaw },
      sound: "door_open",
    });
    const SD = M.cryoStreetDoor;
    M.cryoStreetEntry = G.world.addDoor({
      pos: new THREE.Vector3(SD.x + 0.15, 1.2, SD.z),
      label: "Cryo Unit C-9 (service stair)",
      verb: "Enter",
      radius: 1.3,
      target: {
        x: W.stair_top.x,
        y: W.stair_top.y,
        z: W.stair_top.z,
        yaw: Math.PI,
      },
      sound: "door_open",
    });
    // --- keypads (both sides of the blast door) ---
    const keypadLabel = () =>
      blast.state === "open" || blast.state === "opening"
        ? "Blast Door (Open)"
        : blast.locked
          ? "Blast Door Keypad (No Power)"
          : "Blast Door Keypad";
    for (const k of ["door_keypad", "door_keypad_stair"]) {
      const p = W[k];
      G.world.addInteractable({
        pos: p.clone(),
        radius: 0.8,
        priority: 2,
        label: keypadLabel,
        verb: "Use",
        onInteract: useKeypad,
      });
    }
  };
})();
