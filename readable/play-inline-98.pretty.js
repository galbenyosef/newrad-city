/* src/map/55_dungeon_kit_interior.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 55 DUNGEON KIT — INTERIOR
 * A procedural interior kit for "clear the building"
 * dungeons (built in 56_dungeons_interior.js; signage atlas: 55_dungeon_kit.js):
 *   - rooms on a metre grid: floor / ceiling (optional collapsed hole with
 *     a shaft to the storey above) / walls with door gaps, wainscot,
 *     baseboards, door casings, jambs & lintels; colliders for everything
 *   - raised floors (upper storeys) and stair runs between them
 *   - fixtures: fluorescent tubes (live / dead / flickering), bare bulbs,
 *     caged wall lamps, red emergency lamps — emissive geometry + additive
 *     fake light cones & pools (+ a few real borrowed lights via atmos)
 *   - furniture & dressing: desks, office chairs, cubicles, file cabinets,
 *     shelving with stock, bookcases, beds, sofas, kitchenettes, restroom
 *     stalls / toilets / sinks / mirrors, sewing tables, dress forms,
 *     garment racks, boilers, pumps, pipe runs, crates, pallets, rubble
 *     mounds with rebar, fallen ceiling tiles, gore, cages …
 *   - container / terminal / skeleton / note placement records (spawned by
 *     90_module_interior.js on newGame / loaded, notes & terminals on initDone)
 * Everything is emitted in LOCAL cell coordinates under a pushXF of the
 * cell origin into the cell's own layer ('int_<key>' → one root per cell).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  const T = 0.18; // wall thickness (each room draws its half)
  const PI = Math.PI;
  // shared signage atlas (55_dungeon_kit.js)
  const DSIGNS = M.DSIGNS,
    SIGN_COLS = M.DSIGN_COLS,
    SIGN_ROWS = M.DSIGN_ROWS;

  // -------------------------------------------------------------------
  // Kit factory
  // -------------------------------------------------------------------
  /**
   * K = M.dungeonKit(key, origin, seed): every helper below works in local
   * cell coordinates (y = 0 is the cell floor). K.finish() pops the transform.
   */
  M.dungeonKit = function (key, O, seed) {
    const layer = "int_" + key;
    const r = M.rng("dng:" + key + ":" + (seed || 0));
    const K = {
      key,
      O,
      layer,
      r,
      rooms: [],
      doors: [],
      lootList: [],
      anchors: {},
      fixtures: [],
      notes: [],
      terminals: [],
    };
    const b = (mat) => M.buf(mat, 0, 0, layer);
    K.b = b;
    M.pushXF(M.mtx(O.x, O.y || 0, O.z, 0));
    K.finish = () => M.popXF();
    // ---- colliders (world coords) ----
    K.col = function (x0, y0, z0, x1, y1, z1, o) {
      return M.box3(
        O.x + Math.min(x0, x1),
        (O.y || 0) + Math.min(y0, y1),
        O.z + Math.min(z0, z1),
        O.x + Math.max(x0, x1),
        (O.y || 0) + Math.max(y0, y1),
        O.z + Math.max(z0, z1),
        Object.assign({ tag: "dungeon", surface: "concrete" }, o || {}),
      );
    };
    K.ocol = (cx, cz, w, d, y0, y1, yaw, o) =>
      M.ocol(
        O.x + cx,
        O.z + cz,
        w,
        d,
        (O.y || 0) + y0,
        (O.y || 0) + y1,
        yaw,
        Object.assign({ tag: "dungeon", surface: "concrete" }, o || {}),
      );
    // ---- primitive shortcuts ----
    K.box = (mat, x0, y0, z0, x1, y1, z1, c, s, skip) =>
      M.box(
        b(mat),
        Math.min(x0, x1),
        Math.min(y0, y1),
        Math.min(z0, z1),
        Math.max(x0, x1),
        Math.max(y0, y1),
        Math.max(z0, z1),
        {
          s: s || M.sc(mat.split("@")[0]),
          c: c || M.WHITE,
          skip: skip === undefined ? 0 : skip,
        },
      );
    K.obox = (mat, cx, cy, cz, sx, sy, sz, yaw, o) =>
      M.obox(
        b(mat),
        cx,
        cy,
        cz,
        sx,
        sy,
        sz,
        yaw || 0,
        Object.assign({ s: M.sc(mat.split("@")[0]) }, o || {}),
      );
    K.cyl = (mat, x, y, z, r0, r1, h, seg, o) =>
      M.cyl(b(mat), x, y, z, r0, r1, h, seg, o);
    K.pipe = (mat, ax, ay, az, bx, by, bz, rds, seg, o) =>
      M.pipe(b(mat), ax, ay, az, bx, by, bz, rds, seg, o);
    K.beam = (mat, ax, ay, az, bx, by, bz, w, h, o) =>
      M.beam(b(mat), ax, ay, az, bx, by, bz, w, h, o);
    K.decal = (x, y, z, w, d, yaw, cell, c) =>
      M.decal(b("my/markings"), x, y, z, w, d, yaw, cell, c);
    /** Vertical quad on the plane facing (nx,nz), centred (cx,cy,cz), size w×h, atlas uv rect. */
    K.plate = function (mat, cx, cy, cz, nx, nz, w, h, uv, c) {
      const rx = nz,
        rz = -nx,
        hw = w / 2,
        hh = h / 2,
        o = 0.012;
      M.quad(
        b(mat),
        [cx - rx * hw + nx * o, cy - hh, cz - rz * hw + nz * o],
        [cx + rx * hw + nx * o, cy - hh, cz + rz * hw + nz * o],
        [cx + rx * hw + nx * o, cy + hh, cz + rz * hw + nz * o],
        [cx - rx * hw + nx * o, cy + hh, cz - rz * hw + nz * o],
        [nx, 0, nz],
        uv
          ? [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]]
          : [0, 0, w / 2, 0, w / 2, h / 2, 0, h / 2],
        c || M.WHITE,
      );
    };
    K.sign = function (text, cx, cy, cz, nx, nz, w) {
      const i = Math.max(0, DSIGNS.indexOf(text));
      K.plate(
        "my/dngsigns",
        cx,
        cy,
        cz,
        nx,
        nz,
        w,
        w / 4,
        M.cellUV(i, SIGN_COLS, SIGN_ROWS),
      );
    };
    /** Big painted brand poster (billboard atlas) on a wall. */
    K.poster = function (brand, cx, cy, cz, nx, nz, w, h) {
      if (!M.billboardUV) return;
      const uv = M.billboardUV(brand);
      K.plate(
        "my/billboards",
        cx,
        cy,
        cz,
        nx,
        nz,
        w,
        h,
        uv,
        M.mulc(M.WHITE, 0.55 + r() * 0.25),
      );
    };
    // ---- gameplay records ----
    K.anchor = (name, x, y, z, yaw) => {
      K.anchors[name] = [x, y, z, yaw || 0];
    };
    /** Container / prop spawned on newGame (G.props.spawn type). */
    K.loot = (type, x, y, z, yaw, o) => {
      K.lootList.push(Object.assign({ type, x, y, z, yaw: yaw || 0 }, o || {}));
    };
    K.skel = (x, y, z, yaw, pose) =>
      K.lootList.push({
        type: "skeleton",
        x,
        y,
        z,
        yaw: yaw || 0,
        pose: pose || "lying",
        noContainer: true,
      });
    K.note = (id, x, y, z, def) =>
      K.notes.push(Object.assign({ id, x, y, z }, def));
    K.terminal = (id, x, y, z, yaw, def, mount) => {
      K.terminals.push({ id, def });
      K.lootList.push({
        type: "terminal",
        x,
        y,
        z,
        yaw: yaw || 0,
        terminalId: id,
        mount: mount || "bare",
        noContainer: true,
      });
    };

    // ---------------------------------------------------------------
    // Rooms & doors
    // ---------------------------------------------------------------
    /**
     * Room: {x0,z0,x1,z1, y=0, h=3.4, floor, wall, ceil, wain (lower wall material), wainH, fc, wc, cc (colours),
     *        hole:{x0,z0,x1,z1} (collapsed ceiling), open:{n,e,s,w} (sides without walls), type, surface}
     */
    K.room = function (o) {
      const R = Object.assign(
        {
          y: 0,
          h: 3.4,
          floor: "tile_floor",
          wall: "plaster_stained",
          ceil: "concrete",
          fc: [0.7, 0.68, 0.64],
          wc: [0.78, 0.75, 0.68],
          cc: [0.55, 0.54, 0.5],
          surface: "concrete",
          open: {},
        },
        o,
      );
      K.rooms.push(R);
      return R;
    };
    /** Doorway at (x,z) on a room wall, width w, bottom y, height h. */
    K.door = function (x, z, w, y, h, o) {
      const d = Object.assign(
        { x, z, w: w || 1.4, y: y || 0, h: h || 2.3 },
        o || {},
      );
      K.doors.push(d);
      return d;
    };

    const sideDefs = (R) => [
      // side, fixed coord, t-axis range, inner normal
      { s: "n", line: R.z0, a: R.x0, bnd: R.x1, nx: 0, nz: 1, alongX: true },
      { s: "s", line: R.z1, a: R.x0, bnd: R.x1, nx: 0, nz: -1, alongX: true },
      { s: "w", line: R.x0, a: R.z0, bnd: R.z1, nx: 1, nz: 0, alongX: false },
      { s: "e", line: R.x1, a: R.z0, bnd: R.z1, nx: -1, nz: 0, alongX: false },
    ];
    function doorsOn(R, sd) {
      const out = [];
      for (const d of K.doors) {
        const onLine = sd.alongX
          ? Math.abs(d.z - sd.line) < 0.06
          : Math.abs(d.x - sd.line) < 0.06;
        if (!onLine) continue;
        const t = sd.alongX ? d.x : d.z;
        if (t - d.w / 2 < sd.a - 0.01 || t + d.w / 2 > sd.bnd + 0.01) continue;
        if (d.y < R.y - 0.3 || d.y > R.y + R.h - 1) continue;
        out.push({
          t0: t - d.w / 2,
          t1: t + d.w / 2,
          y0: d.y,
          y1: d.y + d.h,
          d,
        });
      }
      return out.sort((p, q) => p.t0 - q.t0);
    }
    /** Point on side sd at along-coordinate t, offset `off` into the room. */
    const PT = (sd, t, off) =>
      sd.alongX ? [t, sd.line + sd.nz * off] : [sd.line + sd.nx * off, t];
    function wallQuad(mat, sd, t0, t1, y0, y1, cb, ct, off) {
      if (t1 - t0 < 0.005 || y1 - y0 < 0.005) return;
      const A = PT(sd, t0, off),
        B = PT(sd, t1, off);
      const s = M.sc(mat.split("@")[0]);
      M.quad(
        b(mat),
        [A[0], y0, A[1]],
        [B[0], y0, B[1]],
        [B[0], y1, B[1]],
        [A[0], y1, A[1]],
        [sd.nx, 0, sd.nz],
        [t0 / s, y0 / s, t1 / s, y0 / s, t1 / s, y1 / s, t0 / s, y1 / s],
        cb,
        ct,
      );
    }
    function emitWall(R, sd) {
      const gaps = doorsOn(R, sd);
      const Y0 = R.y,
        Y1 = R.y + R.h;
      const off = T / 2;
      const wainH = R.wain ? R.wainH || 1.1 : 0;
      const segs = [];
      let t = sd.a;
      for (const g of gaps) {
        if (g.t0 > t) segs.push([t, g.t0, Y0, Y1]);
        segs.push([g.t0, g.t1, Math.min(Y1, g.y1), Y1]);
        if (g.y0 > Y0 + 0.02) segs.push([g.t0, g.t1, Y0, g.y0]); // door on an upper landing: wall below the sill
        t = g.t1;
      }
      if (t < sd.bnd) segs.push([t, sd.bnd, Y0, Y1]);
      const wcLo = M.mulc(R.wc, 0.62),
        wc = R.wc;
      for (const [a, c, ya, yb] of segs) {
        if (yb - ya < 0.01) continue;
        if (wainH && ya < Y0 + wainH) {
          wallQuad(
            R.wain,
            sd,
            a,
            c,
            ya,
            Y0 + wainH,
            M.mulc(R.wainC || wc, 0.6),
            R.wainC || wc,
            off,
          );
          wallQuad(R.wall, sd, a, c, Y0 + wainH, yb, M.mulc(wc, 0.8), wc, off);
          // chair rail
          const P0 = PT(sd, a, off + 0.02),
            P1 = PT(sd, c, off + 0.02);
          M.beam(
            b("wood_planks"),
            P0[0],
            Y0 + wainH,
            P0[1],
            P1[0],
            Y0 + wainH,
            P1[1],
            0.05,
            0.07,
            { c: [0.45, 0.36, 0.28] },
          );
        } else {
          wallQuad(
            R.wall,
            sd,
            a,
            c,
            ya,
            yb,
            ya <= Y0 + 0.01 ? wcLo : M.mulc(wc, 0.85),
            wc,
            off,
          );
        }
        // baseboard
        if (ya <= Y0 + 0.01) {
          const P0 = PT(sd, a, off + 0.02),
            P1 = PT(sd, c, off + 0.02);
          M.beam(
            b("wood_rotten"),
            P0[0],
            Y0 + 0.07,
            P0[1],
            P1[0],
            Y0 + 0.07,
            P1[1],
            0.04,
            0.14,
            { c: [0.35, 0.3, 0.25] },
          );
        }
        // collider (full thickness on the line)
        const L0 = PT(sd, a, 0),
          L1 = PT(sd, c, 0);
        if (sd.alongX)
          K.col(L0[0], ya, L0[1] - T / 2, L1[0], yb, L1[1] + T / 2, {
            tag: "wall",
          });
        else
          K.col(L0[0] - T / 2, ya, L0[1], L1[0] + T / 2, yb, L1[1], {
            tag: "wall",
          });
      }
      // jambs, header underside & casing for each opening
      for (const g of gaps) {
        const jc = M.mulc(wc, 0.7);
        for (const [tt, dir] of [
          [g.t0, 1],
          [g.t1, -1],
        ]) {
          const A = PT(sd, tt, 0),
            B = PT(sd, tt, off);
          const n = sd.alongX ? [dir, 0, 0] : [0, 0, dir];
          M.quad(
            b(R.wall),
            [A[0], g.y0, A[1]],
            [B[0], g.y0, B[1]],
            [B[0], Math.min(g.y1, Y1), B[1]],
            [A[0], Math.min(g.y1, Y1), A[1]],
            n,
            [0, 0, 0.1, 0, 0.1, 1, 0, 1],
            jc,
          );
        }
        if (g.y1 < Y1) {
          const A = PT(sd, g.t0, 0),
            B = PT(sd, g.t1, 0),
            C = PT(sd, g.t1, off),
            D = PT(sd, g.t0, off);
          M.quad(
            b(R.wall),
            [A[0], g.y1, A[1]],
            [B[0], g.y1, B[1]],
            [C[0], g.y1, C[1]],
            [D[0], g.y1, D[1]],
            [0, -1, 0],
            [0, 0, 1, 0, 1, 0.1, 0, 0.1],
            jc,
          );
        }
        // casing (thin trim proud of the inner face)
        const cas = R.casing || "wood_planks",
          cc = R.casingC || [0.42, 0.34, 0.26];
        const top = Math.min(g.y1, Y1 - 0.02);
        const c0 = PT(sd, g.t0 - 0.06, off + 0.03),
          c1 = PT(sd, g.t1 + 0.06, off + 0.03);
        const cL = PT(sd, g.t0 - 0.03, off + 0.03),
          cR = PT(sd, g.t1 + 0.03, off + 0.03);
        M.beam(b(cas), cL[0], g.y0, cL[1], cL[0], top, cL[1], 0.07, 0.05, {
          c: cc,
        });
        M.beam(b(cas), cR[0], g.y0, cR[1], cR[0], top, cR[1], 0.07, 0.05, {
          c: cc,
        });
        if (g.y1 < Y1 - 0.05)
          M.beam(
            b(cas),
            c0[0],
            top + 0.04,
            c0[1],
            c1[0],
            top + 0.04,
            c1[1],
            0.1,
            0.05,
            { c: cc },
          );
      }
    }
    function emitRoom(R) {
      const { x0, z0, x1, z1, y, h } = R;
      const fs = M.sc(R.floor.split("@")[0]);
      // floor (with slight colour mottling via 4 quads of different tones)
      const fc = R.fc;
      const mx = (x0 + x1) / 2,
        mz = (z0 + z1) / 2;
      const fq = (a0, b0, a1, b1, k) =>
        M.quad(
          b(R.floor),
          [a0, y, b1],
          [a1, y, b1],
          [a1, y, b0],
          [a0, y, b0],
          [0, 1, 0],
          [
            a0 / fs,
            b1 / fs,
            a1 / fs,
            b1 / fs,
            a1 / fs,
            b0 / fs,
            a0 / fs,
            b0 / fs,
          ],
          M.mulc(fc, k),
          M.mulc(fc, k * 0.93),
        );
      fq(x0, z0, mx, mz, 0.96 + r() * 0.08);
      fq(mx, z0, x1, mz, 0.9 + r() * 0.08);
      fq(x0, mz, mx, z1, 0.9 + r() * 0.08);
      fq(mx, mz, x1, z1, 0.96 + r() * 0.08);
      // floor collider (surface for footsteps; solid block under raised rooms)
      K.col(x0, y > 0.3 ? 0 : y - 0.2, z0, x1, y, z1, {
        tag: "floor",
        surface: R.surface,
      });
      // ceiling (optionally with a collapsed hole)
      if (!R.noCeil) {
        const cy = y + h,
          cs = M.sc(R.ceil.split("@")[0]);
        const cq = (a0, b0, a1, b1) => {
          if (a1 - a0 < 0.01 || b1 - b0 < 0.01) return;
          M.quad(
            b(R.ceil),
            [a0, cy, b0],
            [a1, cy, b0],
            [a1, cy, b1],
            [a0, cy, b1],
            [0, -1, 0],
            [
              a0 / cs,
              b0 / cs,
              a1 / cs,
              b0 / cs,
              a1 / cs,
              b1 / cs,
              a0 / cs,
              b1 / cs,
            ],
            R.cc,
          );
        };
        const H = R.hole;
        if (H) {
          cq(x0, z0, x1, H.z0);
          cq(x0, H.z1, x1, z1);
          cq(x0, H.z0, H.x0, H.z1);
          cq(H.x1, H.z0, x1, H.z1);
          collapseShaft(R, H);
        } else cq(x0, z0, x1, z1);
      }
      for (const sd of sideDefs(R)) if (!R.open[sd.s]) emitWall(R, sd);
    }
    /** The storey above seen through a collapsed ceiling: slab edge, broken joists, a dark void, dust. */
    function collapseShaft(R, H) {
      const cy = R.y + R.h,
        top = cy + 3.2;
      const slab = "concrete";
      // slab thickness around the hole (jagged by alternating depths)
      const edge = [
        [H.x0, H.z0, H.x1, H.z0, 0, 1],
        [H.x1, H.z1, H.x0, H.z1, 0, -1],
        [H.x0, H.z1, H.x0, H.z0, 1, 0],
        [H.x1, H.z0, H.x1, H.z1, -1, 0],
      ];
      for (const [ax, az, bx, bz, nx, nz] of edge) {
        M.quad(
          b(slab),
          [ax, cy, az],
          [bx, cy, bz],
          [bx, cy + 0.35, bz],
          [ax, cy + 0.35, az],
          [nx, 0, nz],
          [0, 0, 2, 0, 2, 0.2, 0, 0.2],
          [0.45, 0.44, 0.42],
        );
        // the room above: wall faces rising into darkness
        M.quad(
          b("plaster_stained"),
          [ax, cy + 0.35, az],
          [bx, cy + 0.35, bz],
          [bx, top, bz],
          [ax, top, az],
          [nx, 0, nz],
          [0, 0, 2, 0, 2, 1, 0, 1],
          [0.32, 0.3, 0.28],
          [0.06, 0.06, 0.06],
        );
      }
      M.quad(
        b("concrete_dark"),
        [H.x0, top, H.z0],
        [H.x1, top, H.z0],
        [H.x1, top, H.z1],
        [H.x0, top, H.z1],
        [0, -1, 0],
        [0, 0, 2, 0, 2, 2, 0, 2],
        [0.04, 0.04, 0.04],
      );
      // snapped joists & dangling rebar / conduit / ceiling tiles
      for (let i = 0; i < 5; i++) {
        const along = r() < 0.5;
        const t = along
          ? r.range(H.x0 + 0.3, H.x1 - 0.3)
          : r.range(H.z0 + 0.3, H.z1 - 0.3);
        const ax = along ? t : H.x0 - 0.2,
          az = along ? H.z0 - 0.2 : t;
        const len = r.range(1, 2.6);
        const ex = along ? t + r.range(-0.4, 0.4) : ax + len,
          ez = along ? az + len : t + r.range(-0.4, 0.4);
        K.beam(
          "rust",
          ax,
          cy + 0.15,
          az,
          ex,
          cy - r.range(0.4, 1.6),
          ez,
          0.14,
          0.2,
          { c: [0.6, 0.48, 0.38] },
        );
      }
      for (let i = 0; i < 9; i++) {
        const x = r.range(H.x0, H.x1),
          z = r() < 0.5 ? H.z0 + r.range(-0.1, 0.1) : H.z1 + r.range(-0.1, 0.1);
        K.pipe(
          "rust",
          x,
          cy + 0.2,
          z,
          x + r.range(-0.5, 0.5),
          cy - r.range(0.3, 1.4),
          z + r.range(-0.4, 0.4),
          0.012,
          3,
          { c: [0.55, 0.4, 0.3] },
        );
      }
      // dust hanging in the light from above (fake: a pale additive column)
      M.lightCone(
        b("my/lightfx"),
        (H.x0 + H.x1) / 2,
        top - 0.5,
        (H.z0 + H.z1) / 2,
        (H.x0 + H.x1) / 2,
        R.y + 0.05,
        (H.z0 + H.z1) / 2,
        Math.min(H.x1 - H.x0, H.z1 - H.z0) * 0.3,
        Math.min(H.x1 - H.x0, H.z1 - H.z0) * 0.45,
        [0.05, 0.05, 0.045],
      );
      // debris mound under the hole (walkable, rubble surface)
      K.rubbleMound(
        (H.x0 + H.x1) / 2,
        R.y,
        (H.z0 + H.z1) / 2,
        Math.max(H.x1 - H.x0, H.z1 - H.z0) * 0.7,
        1.1,
      );
    }
    K.build = function () {
      for (const R of K.rooms) emitRoom(R);
    };

    // ---------------------------------------------------------------
    // Stairs
    // ---------------------------------------------------------------
    /**
     * Straight flight from (x0..x1) wide, running along axis 'z' (or 'x') from t0 (at y0) to t1 (at y1).
     * Steps are solid boxes with colliders (rise ≤ 0.3 m so groundHeight climbs them).
     */
    K.stairs = function (x0, x1, t0, t1, y0, y1, axis, o) {
      o = o || {};
      const n = Math.max(2, Math.ceil(Math.abs(y1 - y0) / 0.28));
      const rise = (y1 - y0) / n,
        run = (t1 - t0) / n;
      const mat = o.mat || "concrete",
        c = o.c || [0.62, 0.6, 0.56];
      for (let i = 0; i < n; i++) {
        const ta = t0 + run * i,
          tb = t0 + run * (i + 1);
        const top = y0 + rise * (i + 1);
        const lo = Math.min(y0, y1) - 0.05;
        const top2 = Math.max(top, y0 + rise * i);
        if (axis === "x") {
          K.box(mat, ta, lo, x0, tb, top2, x1, c, 1.5, 8);
          K.col(Math.min(ta, tb), lo, x0, Math.max(ta, tb), top2, x1, {
            tag: "stairs",
            surface: o.surface || "concrete",
          });
        } else {
          K.box(mat, x0, lo, ta, x1, top2, tb, c, 1.5, 8);
          K.col(x0, lo, Math.min(ta, tb), x1, top2, Math.max(ta, tb), {
            tag: "stairs",
            surface: o.surface || "concrete",
          });
        }
        // nosing strip
        const nt = y1 > y0 ? tb : ta;
        if (axis === "x")
          K.box(
            "metal_panel",
            nt - 0.03,
            top2 - 0.02,
            x0 + 0.05,
            nt + 0.03,
            top2 + 0.005,
            x1 - 0.05,
            [0.5, 0.5, 0.46],
            1,
            8,
          );
        else
          K.box(
            "metal_panel",
            x0 + 0.05,
            top2 - 0.02,
            nt - 0.03,
            x1 - 0.05,
            top2 + 0.005,
            nt + 0.03,
            [0.5, 0.5, 0.46],
            1,
            8,
          );
      }
      // railing on the open side
      if (o.rail) {
        const rx = o.rail === "hi" ? x1 : x0;
        const P = (t, y) => (axis === "x" ? [t, y, rx] : [rx, y, t]);
        const A = P(t0, y0 + 0.95),
          B = P(t1, y1 + 0.95);
        K.beam(
          "metal_painted",
          A[0],
          A[1],
          A[2],
          B[0],
          B[1],
          B[2],
          0.05,
          0.05,
          { c: [0.25, 0.28, 0.25] },
        );
        for (let i = 0; i <= n; i += 3) {
          const tt = t0 + run * i,
            yy = y0 + rise * i;
          const p = P(tt, yy),
            q = P(tt, yy + 0.95);
          K.beam(
            "metal_painted",
            p[0],
            p[1],
            p[2],
            q[0],
            q[1],
            q[2],
            0.03,
            0.03,
            { c: [0.25, 0.28, 0.25] },
          );
        }
        const a2 = axis === "x" ? [Math.min(t0, t1), Math.max(t0, t1)] : null;
        if (axis === "x")
          K.col(
            a2[0],
            Math.min(y0, y1),
            rx - 0.05,
            a2[1],
            Math.max(y0, y1) + 1.0,
            rx + 0.05,
            { tag: "railing", surface: "metal" },
          );
        else
          K.col(
            rx - 0.05,
            Math.min(y0, y1) + 0.5,
            Math.min(t0, t1),
            rx + 0.05,
            Math.max(y0, y1) + 1.0,
            Math.max(t0, t1),
            { tag: "railing", surface: "metal" },
          );
      }
    };
    /** Raised landing slab (walkable) with an optional guard rail along one edge. */
    K.landing = function (x0, z0, x1, z1, y, o) {
      o = o || {};
      K.box(
        o.mat || "concrete",
        x0,
        y - 0.3,
        z0,
        x1,
        y,
        z1,
        o.c || [0.6, 0.58, 0.55],
        2,
        0,
      );
      K.col(x0, y - 0.3, z0, x1, y, z1, {
        tag: "floor",
        surface: o.surface || "concrete",
      });
      if (o.support)
        for (const [px, pz] of [
          [x0 + 0.2, z0 + 0.2],
          [x1 - 0.2, z0 + 0.2],
          [x0 + 0.2, z1 - 0.2],
          [x1 - 0.2, z1 - 0.2],
        ]) {
          K.box(
            "metal_painted",
            px - 0.1,
            0,
            pz - 0.1,
            px + 0.1,
            y - 0.3,
            pz + 0.1,
            [0.3, 0.32, 0.3],
            1,
          );
          K.col(px - 0.1, 0, pz - 0.1, px + 0.1, y - 0.3, pz + 0.1, {
            surface: "metal",
          });
        }
      for (const e of o.rails || []) {
        const [ax, az, bx, bz] = e;
        K.beam("metal_painted", ax, y + 1.0, az, bx, y + 1.0, bz, 0.05, 0.05, {
          c: [0.25, 0.28, 0.25],
        });
        K.beam("metal_painted", ax, y + 0.5, az, bx, y + 0.5, bz, 0.03, 0.03, {
          c: [0.25, 0.28, 0.25],
        });
        const L = Math.hypot(bx - ax, bz - az),
          n = Math.max(1, Math.round(L / 1.2));
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          K.beam(
            "metal_painted",
            ax + (bx - ax) * t,
            y,
            az + (bz - az) * t,
            ax + (bx - ax) * t,
            y + 1.0,
            az + (bz - az) * t,
            0.04,
            0.04,
            { c: [0.25, 0.28, 0.25] },
          );
        }
        K.col(
          Math.min(ax, bx) - 0.05,
          y,
          Math.min(az, bz) - 0.05,
          Math.max(ax, bx) + 0.05,
          y + 1.05,
          Math.max(az, bz) + 0.05,
          { tag: "railing", surface: "metal" },
        );
      }
    };

    // ---------------------------------------------------------------
    // Light fixtures (emissive geometry + additive fake light; a few real lights)
    // ---------------------------------------------------------------
    const fx = () => b("my/lightfx");
    /** kind: tube | tubes2 | bulb | cage | red | dead. y = ceiling height at the fixture. */
    K.light = function (kind, x, y, z, o) {
      o = o || {};
      const floorY = o.floor !== undefined ? o.floor : 0;
      const alive =
        kind !== "dead" && (o.alive !== undefined ? o.alive : r() < 0.78);
      if (kind === "tube" || kind === "tubes2" || kind === "dead") {
        const along = o.alongX === false ? false : true;
        const L = 1.25,
          W = kind === "tubes2" ? 0.42 : 0.22;
        const hx = along ? L / 2 : W / 2,
          hz = along ? W / 2 : L / 2;
        const drop = o.drop || 0.05;
        K.box(
          "metal_painted",
          x - hx - 0.04,
          y - drop - 0.08,
          z - hz - 0.04,
          x + hx + 0.04,
          y - drop,
          z + hz + 0.04,
          [0.34, 0.34, 0.32],
          1,
        );
        K.box(
          alive ? "emissive_window@lampw" : "glass_dirty",
          x - hx,
          y - drop - 0.12,
          z - hz,
          x + hx,
          y - drop - 0.08,
          z + hz,
          [0.35, 0.35, 0.33],
          1,
        );
        if (o.drop)
          for (const s of [-1, 1])
            K.pipe(
              "metal_painted",
              x + (along ? s * L * 0.35 : 0),
              y,
              z + (along ? 0 : s * L * 0.35),
              x + (along ? s * L * 0.35 : 0),
              y - drop,
              z + (along ? 0 : s * L * 0.35),
              0.012,
              3,
              { c: [0.2, 0.2, 0.2] },
            );
        if (alive) {
          const cc = [0.06, 0.07, 0.066];
          M.lightCone(
            fx(),
            x,
            y - drop - 0.12,
            z,
            x,
            floorY + 0.03,
            z,
            0.55,
            1.9,
            cc,
          );
          M.lightPool(fx(), x, floorY + 0.03, z, 2.8, 2.8, [0.15, 0.16, 0.15]);
          if (o.real || (o.flicker && r() < 0.8))
            K.fixtures.push({
              p: [x, y - drop - 0.2, z],
              color: 0xd8f0ff,
              opts: {
                flicker: o.flicker ? 0.6 : 0,
                range: 9,
                intensity: 1.0,
                glowSize: 1.0,
              },
            });
        } else if (r() < 0.35) {
          // dangling from one chain
          K.obox("metal_painted", x + 0.3, y - 0.7, z, 0.25, 1.2, 0.08, 0, {
            roll: 0.9,
            c: [0.3, 0.3, 0.28],
          });
        }
      } else if (kind === "bulb") {
        K.pipe("metal_painted", x, y, z, x, y - 0.5, z, 0.01, 3, {
          c: [0.15, 0.15, 0.15],
        });
        K.cyl(
          alive ? "emissive_window@lamp" : "glass_dirty",
          x,
          y - 0.62,
          z,
          0.05,
          0.07,
          0.12,
          6,
          { capTop: true, c: [0.5, 0.5, 0.45] },
        );
        K.cyl("metal_painted", x, y - 0.58, z, 0.22, 0.04, 0.12, 8, {
          c: [0.3, 0.32, 0.28],
        });
        if (alive) {
          M.lightPool(fx(), x, floorY + 0.03, z, 2.4, 2.4, [0.16, 0.13, 0.08]);
          M.lightCone(
            fx(),
            x,
            y - 0.6,
            z,
            x,
            floorY + 0.03,
            z,
            0.15,
            1.4,
            [0.06, 0.05, 0.03],
          );
          if (o.real)
            K.fixtures.push({
              p: [x, y - 0.7, z],
              color: 0xffd8a0,
              opts: { range: 8, intensity: 0.9, glowSize: 0.8 },
            });
        }
      } else if (kind === "cage" || kind === "red") {
        const nx = o.nx || 0,
          nz = o.nz || 0;
        const red = kind === "red";
        K.box(
          "metal_painted",
          x - 0.14,
          y - 0.2,
          z - 0.14,
          x + 0.14,
          y + 0.2,
          z + 0.14,
          [0.25, 0.25, 0.23],
          1,
        );
        K.box(
          red
            ? "neon_red@lampr"
            : alive
              ? "emissive_window@lamp"
              : "glass_dirty",
          x - 0.1 + nx * 0.1,
          y - 0.14,
          z - 0.1 + nz * 0.1,
          x + 0.1 + nx * 0.1,
          y + 0.12,
          z + 0.1 + nz * 0.1,
          [0.5, 0.5, 0.45],
          1,
        );
        if (red || alive) {
          const c = red ? [0.12, 0.015, 0.01] : [0.08, 0.065, 0.04];
          M.lightCone(
            fx(),
            x + nx * 0.2,
            y,
            z + nz * 0.2,
            x + nx * 1.6,
            floorY + 0.03,
            z + nz * 1.6,
            0.2,
            1.4,
            c,
            false,
          );
          M.lightPool(
            fx(),
            x + nx * 1.7,
            floorY + 0.03,
            z + nz * 1.7,
            2,
            2,
            red ? [0.16, 0.02, 0.01] : [0.12, 0.1, 0.07],
          );
          if (o.real)
            K.fixtures.push({
              p: [x + nx * 0.3, y, z + nz * 0.3],
              color: red ? 0xff3020 : 0xffd090,
              opts: { range: 7, intensity: red ? 0.8 : 0.9, glowSize: 0.6 },
            });
        }
      }
    };

    // ---------------------------------------------------------------
    // Furniture & dressing (static geometry + colliders)
    // ---------------------------------------------------------------
    const rot = (x, z, yaw, lx, lz) => [
      x + lx * Math.cos(yaw) + lz * Math.sin(yaw),
      z - lx * Math.sin(yaw) + lz * Math.cos(yaw),
    ];
    K.rot = rot;
    /** Steel office desk; returns its top height. yaw = the direction the sitter looks (sitter on the local +z side, modesty panel at -z). */
    K.desk = function (x, y, z, yaw, o) {
      o = o || {};
      const W = o.w || 1.5,
        D = o.d || 0.75,
        H = 0.76;
      const mat = o.wood ? "wood_planks" : "metal_painted",
        c = o.wood
          ? [0.5, 0.38, 0.28]
          : r.pick([
              [0.42, 0.46, 0.42],
              [0.5, 0.48, 0.42],
              [0.36, 0.4, 0.44],
            ]);
      K.obox(mat, x, y + H - 0.02, z, W, 0.04, D, yaw, {
        c: M.mulc(c, 1.1),
        s: 1,
      });
      const [px, pz] = rot(x, z, yaw, W / 2 - 0.22, 0);
      K.obox(mat, px, y + (H - 0.04) / 2, pz, 0.42, H - 0.04, D - 0.06, yaw, {
        c,
        s: 1,
      });
      const [qx, qz] = rot(x, z, yaw, -W / 2 + 0.03, 0);
      K.obox(mat, qx, y + (H - 0.04) / 2, qz, 0.04, H - 0.04, D - 0.06, yaw, {
        c,
        s: 1,
      });
      const [mx, mz] = rot(x, z, yaw, 0, -D / 2 + 0.03);
      K.obox(mat, mx, y + H * 0.55, mz, W - 0.1, H * 0.8, 0.03, yaw, {
        c: M.mulc(c, 0.85),
        s: 1,
      }); // modesty panel (visitor side)
      K.ocol(x, z, W, D, y, y + H, yaw, {
        tag: "furniture",
        surface: o.wood ? "wood" : "metal",
      });
      // clutter on top
      if (o.clutter !== false) {
        const n = r.int(1, 3);
        for (let i = 0; i < n; i++) {
          const [ax, az] = rot(
            x,
            z,
            yaw,
            r.range(-W / 2 + 0.2, W / 2 - 0.2),
            r.range(-D / 2 + 0.15, D / 2 - 0.15),
          );
          K.obox(
            r() < 0.6 ? "paper" : "cardboard",
            ax,
            y + H + 0.01,
            az,
            r.range(0.2, 0.35),
            0.015 + r() * 0.04,
            r.range(0.25, 0.3),
            yaw + r.range(-0.4, 0.4),
            { c: [0.85, 0.82, 0.72], s: 0.5 },
          );
        }
        if (r() < 0.5) {
          const [ax, az] = rot(x, z, yaw, -W / 2 + 0.3, -D / 2 + 0.25);
          K.cyl("metal_painted", ax, y + H, az, 0.12, 0.05, 0.03, 6, {
            c: [0.25, 0.25, 0.25],
          });
          K.pipe(
            "metal_painted",
            ax,
            y + H,
            az,
            ax,
            y + H + 0.35,
            az + 0.1,
            0.012,
            3,
            { c: [0.25, 0.25, 0.25] },
          );
          K.cyl(
            "metal_painted",
            ax,
            y + H + 0.3,
            az + 0.14,
            0.1,
            0.05,
            0.12,
            6,
            { c: [0.3, 0.4, 0.3] },
          );
        }
      }
      if (o.monitor) {
        const [mx2, mz2] = rot(
          x,
          z,
          yaw,
          o.monitor === "left" ? -0.35 : 0.25,
          -0.12,
        );
        K.monitor(mx2, mz2, y + H, yaw + PI);
      } // screen faces the sitter (+z side)
      return y + H;
    };
    /** Boxy teletype console with a dead CRT (static). */
    K.monitor = function (x, z, y, yaw) {
      K.obox("metal_painted", x, y + 0.2, z, 0.42, 0.38, 0.4, yaw, {
        c: [0.55, 0.52, 0.45],
        s: 1,
      });
      const [fx2, fz2] = rot(x, z, yaw, 0, -0.205);
      K.obox("glass_dirty", fx2, y + 0.21, fz2, 0.32, 0.26, 0.01, yaw, {
        c: [0.08, 0.12, 0.09],
        s: 1,
      });
      const [kx, kz] = rot(x, z, yaw, 0, -0.42);
      K.obox("metal_painted", kx, y + 0.02, kz, 0.4, 0.035, 0.15, yaw, {
        c: [0.5, 0.48, 0.42],
        s: 1,
      });
    };
    K.chair = function (x, y, z, yaw, o) {
      o = o || {};
      const c =
        o.c ||
        r.pick([
          [0.3, 0.22, 0.18],
          [0.25, 0.28, 0.3],
          [0.4, 0.3, 0.2],
        ]);
      if (o.knocked) {
        K.obox("fabric", x, y + 0.25, z, 0.5, 0.08, 0.48, yaw, {
          pitch: 1.4,
          c,
          s: 0.5,
        });
        K.obox("fabric", x, y + 0.08, z + 0.2, 0.46, 0.5, 0.08, yaw, {
          pitch: 1.4,
          c,
          s: 0.5,
        });
        return;
      }
      K.cyl("metal_painted", x, y, z, 0.3, 0.3, 0.05, 5, {
        c: [0.2, 0.2, 0.2],
      });
      K.pipe("metal_painted", x, y + 0.05, z, x, y + 0.45, z, 0.03, 4, {
        c: [0.25, 0.25, 0.25],
      });
      K.obox("fabric", x, y + 0.48, z, 0.48, 0.08, 0.46, yaw, { c, s: 0.5 });
      const [bx, bz] = rot(x, z, yaw, 0, 0.22);
      K.obox("fabric", bx, y + 0.8, bz, 0.44, 0.5, 0.07, yaw, {
        pitch: -0.1,
        c,
        s: 0.5,
      });
    };
    K.fileCabinet = function (x, y, z, yaw, o) {
      o = o || {};
      const c =
        o.c ||
        r.pick([
          [0.45, 0.47, 0.42],
          [0.52, 0.5, 0.44],
          [0.38, 0.4, 0.42],
        ]);
      const H = o.h || 1.32;
      K.obox("metal_painted", x, y + H / 2, z, 0.45, H, 0.62, yaw, { c, s: 1 });
      const n = Math.round(H / 0.33);
      for (let i = 0; i < n; i++) {
        const [dx, dz] = rot(x, z, yaw, 0, -0.315);
        K.obox(
          "metal_panel",
          dx,
          y + 0.18 + i * (H / n),
          dz,
          0.38,
          H / n - 0.05,
          0.02,
          yaw,
          { c: M.mulc(c, 0.9), s: 1 },
        );
        const [hx, hz] = rot(x, z, yaw, 0, -0.335);
        K.obox(
          "chrome",
          hx,
          y + 0.28 + i * (H / n),
          hz,
          0.12,
          0.02,
          0.02,
          yaw,
          { c: [0.7, 0.7, 0.65], s: 1 },
        );
      }
      if (o.open) {
        const [dx, dz] = rot(x, z, yaw, 0, -0.55);
        K.obox("metal_panel", dx, y + 0.6, dz, 0.38, 0.28, 0.5, yaw, {
          c: M.mulc(c, 0.85),
          s: 1,
        });
      }
      K.ocol(x, z, 0.45, 0.62, y, y + H, yaw, {
        tag: "furniture",
        surface: "metal",
      });
    };
    /** Cubicle partition run from (ax,az) to (bx,bz), height h. */
    K.partition = function (ax, az, bx, bz, y, h, c) {
      h = h || 1.45;
      c = c || [0.46, 0.44, 0.38];
      const L = Math.hypot(bx - ax, bz - az);
      if (L < 0.1) return;
      const yaw = Math.atan2(bx - ax, bz - az);
      K.obox(
        "fabric",
        (ax + bx) / 2,
        y + h / 2,
        (az + bz) / 2,
        0.06,
        h,
        L,
        yaw,
        { c, s: 0.6 },
      );
      K.obox(
        "metal_painted",
        (ax + bx) / 2,
        y + h + 0.015,
        (az + bz) / 2,
        0.07,
        0.03,
        L,
        yaw,
        { c: [0.5, 0.5, 0.48], s: 1 },
      );
      K.ocol((ax + bx) / 2, (az + bz) / 2, 0.08, L, y, y + h, yaw, {
        tag: "furniture",
        surface: "wood",
      });
    };
    /** Shelving unit along local x (length L), depth 0.5, with stock on each shelf. goods: 'cans'|'boxes'|'books'|'bottles'|'parts'|'empty' */
    K.shelf = function (x, y, z, yaw, L, goods, o) {
      o = o || {};
      const H = o.h || 2.0,
        D = o.d || 0.5,
        levels = o.levels || 4;
      const c = o.c || [0.42, 0.44, 0.4];
      for (const s of [-1, 1]) {
        const [px, pz] = rot(x, z, yaw, s * (L / 2 - 0.03), 0);
        K.obox("metal_painted", px, y + H / 2, pz, 0.05, H, D, yaw, {
          c,
          s: 1,
        });
      }
      if (o.back !== false) {
        const [bx, bz] = rot(x, z, yaw, 0, D / 2 - 0.02);
        K.obox("metal_panel", bx, y + H / 2, bz, L, H, 0.02, yaw, {
          c: M.mulc(c, 0.8),
          s: 1,
        });
      }
      const tilt = o.collapsed ? r.range(-0.25, 0.25) : 0;
      for (let i = 0; i < levels; i++) {
        const sy = y + 0.12 + (i * (H - 0.2)) / (levels - 1);
        K.obox("metal_painted", x, sy, z, L - 0.04, 0.03, D, yaw, {
          c: M.mulc(c, 1.05),
          s: 1,
          roll: i === levels - 2 ? tilt : 0,
        });
        if (goods === "empty" || (i === levels - 1 && goods !== "books"))
          continue;
        let t = -L / 2 + 0.12;
        while (t < L / 2 - 0.12) {
          if (r() < 0.3) {
            t += r.range(0.15, 0.5);
            continue;
          } // looted gaps
          const [gx, gz] = rot(x, z, yaw, t, r.range(-0.08, 0.08));
          if (goods === "cans") {
            const h2 = r.range(0.1, 0.16);
            K.cyl("metal_painted", gx, sy + 0.015, gz, 0.045, 0.045, h2, 6, {
              capTop: true,
              c: r.pick([
                [0.75, 0.3, 0.2],
                [0.8, 0.7, 0.35],
                [0.35, 0.5, 0.7],
                [0.6, 0.6, 0.55],
                [0.3, 0.55, 0.35],
              ]),
            });
            t += 0.1;
          } else if (goods === "bottles") {
            K.cyl("glass_dirty", gx, sy + 0.015, gz, 0.04, 0.03, 0.2, 6, {
              c: r.pick([
                [0.3, 0.5, 0.35],
                [0.55, 0.35, 0.2],
                [0.6, 0.62, 0.6],
              ]),
            });
            t += 0.09;
          } else if (goods === "books") {
            const w = r.range(0.03, 0.07),
              h2 = r.range(0.2, 0.3);
            K.obox("fabric", gx, sy + 0.015 + h2 / 2, gz, w, h2, 0.2, yaw, {
              c: r.pick([
                [0.5, 0.2, 0.15],
                [0.2, 0.3, 0.45],
                [0.25, 0.4, 0.25],
                [0.55, 0.5, 0.35],
                [0.3, 0.25, 0.2],
              ]),
              s: 0.3,
              roll: r() < 0.15 ? 0.3 : 0,
            });
            t += w + 0.005;
          } else if (goods === "parts") {
            const s = r.range(0.12, 0.3);
            K.obox(
              r() < 0.5 ? "rust" : "metal_painted",
              gx,
              sy + 0.015 + s * 0.3,
              gz,
              s,
              s * 0.6,
              s,
              yaw + r(),
              { c: [0.55, 0.5, 0.45], s: 1 },
            );
            t += s + 0.05;
          } else {
            const w = r.range(0.2, 0.45),
              h2 = r.range(0.15, 0.35);
            K.obox(
              "cardboard",
              gx,
              sy + 0.015 + h2 / 2,
              gz,
              w,
              h2,
              r.range(0.25, 0.4),
              yaw + r.range(-0.1, 0.1),
              {
                c: r.pick([
                  [0.8, 0.7, 0.5],
                  [0.7, 0.6, 0.45],
                  [0.85, 0.8, 0.65],
                  [0.7, 0.3, 0.25],
                ]),
                s: 0.8,
              },
            );
            t += w + 0.04;
          }
        }
      }
      K.ocol(x, z, L, D, y, y + H, yaw, { tag: "furniture", surface: "metal" });
    };
    K.bookcase = function (x, y, z, yaw, L) {
      K.shelf(x, y, z, yaw, L || 1.2, "books", {
        h: 2.1,
        d: 0.35,
        levels: 5,
        c: [0.42, 0.3, 0.2],
      });
    };
    K.counter = function (x0, z0, x1, z1, y, o) {
      o = o || {};
      const H = o.h || 1.0,
        c = o.c || [0.5, 0.42, 0.34];
      K.box(o.mat || "wood_planks", x0, y, z0, x1, y + H - 0.05, z1, c, 1.2);
      K.box(
        o.top || "marble",
        x0 - 0.04,
        y + H - 0.05,
        z0 - 0.04,
        x1 + 0.04,
        y + H,
        z1 + 0.04,
        o.topC || [0.8, 0.78, 0.72],
        1,
      );
      K.col(x0, y, z0, x1, y + H, z1, { tag: "furniture", surface: "wood" });
      return y + H;
    };
    K.table = function (x, y, z, yaw, w, d, o) {
      o = o || {};
      const c = o.c || [0.5, 0.4, 0.3],
        H = o.h || 0.76;
      K.obox(o.mat || "wood_planks", x, y + H - 0.03, z, w, 0.05, d, yaw, {
        c,
        s: 1,
        roll: o.tip || 0,
      });
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ]) {
        const [lx, lz] = rot(
          x,
          z,
          yaw,
          sx * (w / 2 - 0.08),
          sz * (d / 2 - 0.08),
        );
        K.obox(
          o.mat || "wood_planks",
          lx,
          y + (H - 0.05) / 2,
          lz,
          0.06,
          H - 0.05,
          0.06,
          yaw,
          { c: M.mulc(c, 0.8), s: 1 },
        );
      }
      K.ocol(x, z, w, d, y, y + H, yaw, { tag: "furniture", surface: "wood" });
      return y + H;
    };
    K.bed = function (x, y, z, yaw, o) {
      o = o || {};
      const W = o.double ? 1.45 : 0.95,
        L = 2.0;
      K.obox("metal_painted", x, y + 0.2, z, W, 0.12, L, yaw, {
        c: [0.3, 0.3, 0.3],
        s: 1,
      });
      K.obox("fabric", x, y + 0.34, z, W - 0.05, 0.18, L - 0.05, yaw, {
        c: r.pick([
          [0.62, 0.58, 0.48],
          [0.55, 0.5, 0.42],
          [0.5, 0.44, 0.4],
        ]),
        s: 0.6,
      });
      const [hx, hz] = rot(x, z, yaw, 0, -L / 2 + 0.03);
      K.obox("metal_painted", hx, y + 0.5, hz, W, 1.0, 0.05, yaw, {
        c: [0.28, 0.28, 0.28],
        s: 1,
      });
      const [px, pz] = rot(x, z, yaw, 0, -L / 2 + 0.3);
      K.obox("fabric", px, y + 0.47, pz, W * 0.7, 0.1, 0.35, yaw, {
        c: [0.7, 0.68, 0.6],
        s: 0.5,
      });
      if (o.blanket !== false) {
        const [bx, bz] = rot(x, z, yaw, 0.1, 0.3);
        K.obox("fabric", bx, y + 0.45, bz, W + 0.1, 0.05, 1.1, yaw + 0.1, {
          c: r.pick([
            [0.4, 0.25, 0.2],
            [0.25, 0.3, 0.4],
            [0.45, 0.4, 0.25],
          ]),
          s: 0.5,
        });
      }
      K.ocol(x, z, W, L, y, y + 0.45, yaw, {
        tag: "furniture",
        surface: "wood",
      });
    };
    K.sofa = function (x, y, z, yaw, o) {
      o = o || {};
      const L = o.len || 2.0,
        c =
          o.c ||
          r.pick([
            [0.45, 0.3, 0.2],
            [0.3, 0.35, 0.3],
            [0.5, 0.42, 0.3],
          ]);
      K.obox("fabric", x, y + 0.25, z, L, 0.3, 0.85, yaw, {
        c: M.mulc(c, 0.8),
        s: 0.6,
      });
      K.obox("fabric", x, y + 0.45, z, L - 0.3, 0.12, 0.7, yaw, { c, s: 0.6 });
      const [bx, bz] = rot(x, z, yaw, 0, 0.35);
      K.obox("fabric", bx, y + 0.65, bz, L, 0.55, 0.18, yaw, {
        c: M.mulc(c, 0.9),
        s: 0.6,
      });
      for (const s of [-1, 1]) {
        const [ax, az] = rot(x, z, yaw, s * (L / 2 - 0.1), 0);
        K.obox("fabric", ax, y + 0.5, az, 0.2, 0.3, 0.85, yaw, {
          c: M.mulc(c, 0.85),
          s: 0.6,
        });
      }
      // stuffing bursting out
      if (r() < 0.6) {
        const [sx, sz] = rot(x, z, yaw, r.range(-0.5, 0.5), -0.1);
        K.obox("fabric", sx, y + 0.53, sz, 0.3, 0.06, 0.25, yaw + 0.5, {
          c: [0.8, 0.76, 0.62],
          s: 0.3,
        });
      }
      K.ocol(x, z, L, 0.85, y, y + 0.6, yaw, {
        tag: "furniture",
        surface: "wood",
      });
    };
    /** Restroom: row of stalls along a wall (x0..x1 at z=wallZ, stalls go toward +dir). */
    K.stalls = function (x0, x1, wallZ, dir, y, n) {
      const w = (x1 - x0) / n,
        D = 1.5,
        H = 1.9;
      const c = r.pick([
        [0.45, 0.5, 0.48],
        [0.55, 0.45, 0.35],
        [0.5, 0.48, 0.44],
      ]);
      for (let i = 0; i <= n; i++) {
        const x = x0 + i * w;
        K.box(
          "metal_painted",
          x - 0.025,
          y + 0.2,
          Math.min(wallZ, wallZ + dir * D),
          x + 0.025,
          y + H,
          Math.max(wallZ, wallZ + dir * D),
          c,
          1,
        );
        K.col(
          x - 0.03,
          y,
          Math.min(wallZ, wallZ + dir * D),
          x + 0.03,
          y + H,
          Math.max(wallZ, wallZ + dir * D),
          { tag: "furniture", surface: "metal" },
        );
      }
      for (let i = 0; i < n; i++) {
        const cx = x0 + (i + 0.5) * w,
          fz = wallZ + dir * D;
        // stall door: open (swung in), shut, or torn off lying on the floor
        const k = r();
        if (k < 0.4)
          K.obox(
            "metal_painted",
            cx - w * 0.2,
            y + 1.05,
            fz - dir * 0.35,
            0.03,
            1.6,
            w * 0.7,
            0.6 * dir,
            { c, s: 1 },
          );
        else if (k < 0.8) {
          K.box(
            "metal_painted",
            cx - w / 2 + 0.05,
            y + 0.25,
            fz - 0.02,
            cx + w / 2 - 0.05,
            y + H - 0.1,
            fz + 0.02,
            c,
            1,
          );
        } else
          K.obox(
            "metal_painted",
            cx + 0.3,
            y + 0.03,
            fz + dir * 0.8,
            w * 0.8,
            0.03,
            1.6,
            0.4,
            { c, s: 1 },
          );
        // toilet
        const tz = wallZ + dir * 0.45;
        K.box(
          "tile_floor",
          cx - 0.2,
          y,
          tz - 0.3,
          cx + 0.2,
          y + 0.42,
          tz + 0.3,
          [0.85, 0.84, 0.8],
          0.5,
        );
        K.cyl("tile_floor", cx, y + 0.42, tz + dir * 0.1, 0.22, 0.2, 0.06, 8, {
          c: [0.8, 0.8, 0.76],
          capTop: true,
        });
        K.box(
          "tile_floor",
          cx - 0.22,
          y + 0.42,
          wallZ + dir * 0.02,
          cx + 0.22,
          y + 0.85,
          wallZ + dir * 0.2,
          [0.82, 0.82, 0.78],
          0.5,
        );
        if (r() < 0.4)
          K.decal(
            cx,
            y + 0.012,
            tz + dir * 0.5,
            0.9,
            0.9,
            r() * 6,
            M.MARK.STAIN,
          );
      }
    };
    /** Row of sinks under a mirror strip on a wall (z = wallZ facing dir). */
    K.sinks = function (x0, x1, wallZ, dir, y) {
      const n = Math.max(1, Math.floor((x1 - x0) / 0.9));
      K.box(
        "marble",
        x0,
        y + 0.8,
        Math.min(wallZ, wallZ + dir * 0.55),
        x1,
        y + 0.86,
        Math.max(wallZ, wallZ + dir * 0.55),
        [0.78, 0.76, 0.7],
        1,
      );
      K.col(
        x0,
        y,
        Math.min(wallZ, wallZ + dir * 0.55),
        x1,
        y + 0.86,
        Math.max(wallZ, wallZ + dir * 0.55),
        { tag: "furniture" },
      );
      for (let i = 0; i < n; i++) {
        const cx = x0 + ((i + 0.5) * (x1 - x0)) / n;
        K.box(
          "tile_floor",
          cx - 0.25,
          y + 0.66,
          wallZ + dir * 0.1,
          cx + 0.25,
          y + 0.8,
          wallZ + dir * 0.48,
          [0.8, 0.8, 0.76],
          0.5,
        );
        K.pipe(
          "chrome",
          cx,
          y + 0.86,
          wallZ + dir * 0.06,
          cx,
          y + 1.0,
          wallZ + dir * 0.2,
          0.015,
          4,
          { c: [0.6, 0.6, 0.58] },
        );
        K.pipe(
          "rust",
          cx,
          y + 0.66,
          wallZ + dir * 0.1,
          cx,
          y,
          wallZ + dir * 0.1,
          0.02,
          4,
          { c: [0.45, 0.35, 0.28] },
        );
      }
      // mirror strip (cracked dark glass)
      M.quad(
        b("glass_dirty@gloss"),
        [x0, y + 1.1, wallZ + dir * 0.1],
        [x1, y + 1.1, wallZ + dir * 0.1],
        [x1, y + 2.0, wallZ + dir * 0.1],
        [x0, y + 2.0, wallZ + dir * 0.1],
        [0, 0, dir],
        [0, 0, 2, 0, 2, 1, 0, 1],
        [0.45, 0.48, 0.47],
      );
    };
    K.urinals = function (x0, x1, wallZ, dir, y) {
      for (let x = x0 + 0.4; x < x1 - 0.2; x += 0.8) {
        K.box(
          "tile_floor",
          x - 0.2,
          y + 0.45,
          wallZ + dir * 0.02,
          x + 0.2,
          y + 1.1,
          wallZ + dir * 0.35,
          [0.82, 0.82, 0.78],
          0.5,
        );
        K.col(
          x - 0.2,
          y,
          Math.min(wallZ, wallZ + dir * 0.35),
          x + 0.2,
          y + 1.1,
          Math.max(wallZ, wallZ + dir * 0.35),
          { tag: "furniture" },
        );
      }
    };
    K.crate = function (x, y, z, yaw, s, o) {
      s = s || 0.8;
      o = o || {};
      K.obox(
        o.mat || "crate_wood",
        x,
        y + s * 0.4,
        z,
        s,
        s * 0.8,
        s * 0.9,
        yaw,
        { c: o.c || M.mulc([0.8, 0.72, 0.58], 0.8 + r() * 0.3), s: 1 },
      );
      if (o.collide !== false)
        K.ocol(x, z, s, s * 0.9, y, y + s * 0.8, yaw, {
          tag: "furniture",
          surface: "wood",
        });
      return y + s * 0.8;
    };
    K.pallet = function (x, y, z, yaw, o) {
      o = o || {};
      K.obox("wood_rotten", x, y + 0.07, z, 1.2, 0.14, 1.0, yaw, {
        c: [0.6, 0.5, 0.38],
        s: 1,
      });
      let top = y + 0.14;
      if (o.load !== false) {
        const n = r.int(1, 3);
        for (let i = 0; i < n; i++) {
          const [cx, cz] = rot(
            x,
            z,
            yaw,
            r.range(-0.25, 0.25),
            r.range(-0.2, 0.2),
          );
          K.obox(
            "cardboard",
            cx,
            top + 0.25,
            cz,
            r.range(0.5, 0.9),
            0.5,
            r.range(0.5, 0.8),
            yaw + r.range(-0.2, 0.2),
            { c: M.mulc([0.8, 0.7, 0.5], 0.75 + r() * 0.3), s: 0.8 },
          );
          top += 0.5;
        }
      }
      K.ocol(x, z, 1.2, 1.0, y, top, yaw, {
        tag: "furniture",
        surface: "wood",
      });
    };
    K.barrel = function (x, y, z, o) {
      o = o || {};
      K.cyl("rust", x, y, z, 0.3, 0.3, 0.9, 10, {
        capTop: true,
        c:
          o.c ||
          r.pick([
            [0.55, 0.4, 0.3],
            [0.35, 0.4, 0.3],
            [0.6, 0.5, 0.2],
          ]),
      });
      for (const hy of [0.2, 0.7])
        K.cyl("rust", x, y + hy, z, 0.31, 0.31, 0.04, 10, {
          c: [0.35, 0.3, 0.25],
        });
      if (o.fire) {
        K.cyl("emissive_window@lamp", x, y + 0.9, z, 0.22, 0.1, 0.25, 6, {
          c: [1, 0.6, 0.3],
        });
        M.lightPool(fx(), x, y + 0.03, z, 3, 3, [0.2, 0.1, 0.04]);
        K.fixtures.push({
          p: [x, y + 1.3, z],
          color: 0xff9a50,
          opts: { flicker: 0.8, range: 8, intensity: 1.1, glowSize: 1.2 },
        });
      }
      K.col(x - 0.3, y, z - 0.3, x + 0.3, y + 0.9, z + 0.3, {
        tag: "furniture",
        surface: "metal",
      });
    };
    /** Pipe run along a wall/ceiling path of points [[x,y,z],...]. */
    K.pipeRun = function (pts, rds, o) {
      o = o || {};
      const mat = o.mat || "rust",
        c = o.c || [0.5, 0.42, 0.35];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i],
          c2 = pts[i + 1];
        K.pipe(mat, a[0], a[1], a[2], c2[0], c2[1], c2[2], rds, 8, { c });
        const L = Math.hypot(c2[0] - a[0], c2[1] - a[1], c2[2] - a[2]);
        for (let t = 1.5; t < L; t += 2.5) {
          const f = t / L;
          K.pipe(
            mat,
            a[0] + (c2[0] - a[0]) * f - ((c2[0] - a[0]) / L) * 0.04,
            a[1] + (c2[1] - a[1]) * f - ((c2[1] - a[1]) / L) * 0.04,
            a[2] + (c2[2] - a[2]) * f - ((c2[2] - a[2]) / L) * 0.04,
            a[0] + (c2[0] - a[0]) * f + ((c2[0] - a[0]) / L) * 0.04,
            a[1] + (c2[1] - a[1]) * f + ((c2[1] - a[1]) / L) * 0.04,
            a[2] + (c2[2] - a[2]) * f + ((c2[2] - a[2]) / L) * 0.04,
            rds * 1.25,
            8,
            { c: M.mulc(c, 0.8) },
          );
        }
      }
    };
    /** Interior rubble mound (walkable low hump + slabs + rebar). */
    K.rubbleMound = function (x, y, z, rds, h) {
      const g = moundGeo();
      M.geom(
        b("rubble"),
        g,
        M.mtx(x, y - 0.05, z, r() * 6, 0, 0, [rds, h, rds * r.range(0.7, 1)]),
        { c: M.mulc([0.78, 0.75, 0.7], r.range(0.8, 1)), us: rds / 2 },
      );
      const n = Math.round(4 + rds * 2);
      for (let i = 0; i < n; i++) {
        const a = r() * PI * 2,
          d = Math.sqrt(r()) * rds * 0.85;
        const px = x + Math.cos(a) * d,
          pz = z + Math.sin(a) * d;
        const py =
          y + h * Math.sqrt(Math.max(0, 1 - (d / rds) * (d / rds))) * 0.8;
        const s = r.range(0.3, 1.1);
        K.obox(
          r() < 0.6 ? "concrete" : r() < 0.5 ? "plaster_stained" : "brick_red",
          px,
          py,
          pz,
          s * r.range(1, 2.2),
          s * r.range(0.15, 0.4),
          s * r.range(0.7, 1.4),
          r() * 6,
          {
            pitch: r.range(-0.6, 0.6),
            roll: r.range(-0.6, 0.6),
            s: 2,
            c: M.mulc([0.8, 0.78, 0.74], r.range(0.7, 1)),
          },
        );
      }
      for (let i = 0; i < 3; i++) {
        const a = r() * 6,
          d = r() * rds * 0.5;
        const px = x + Math.cos(a) * d,
          pz = z + Math.sin(a) * d;
        K.beam(
          "rust",
          px,
          y + h * 0.4,
          pz,
          px + r.range(-1.2, 1.2),
          y + h + r.range(0.2, 1.2),
          pz + r.range(-1.2, 1.2),
          0.035,
          0.035,
          { c: [0.65, 0.48, 0.38] },
        );
      }
      // walkable stepped collider (two tiers so the player can climb it)
      K.col(
        x - rds * 0.6,
        y,
        z - rds * 0.6,
        x + rds * 0.6,
        y + h * 0.35,
        z + rds * 0.6,
        { tag: "rubble", surface: "rubble" },
      );
      K.col(
        x - rds * 0.3,
        y,
        z - rds * 0.3,
        x + rds * 0.3,
        y + h * 0.65,
        z + rds * 0.3,
        { tag: "rubble", surface: "rubble" },
      );
      K.decal(x, y + 0.015, z, rds * 2.6, rds * 2.6, r() * 6, M.MARK.DIRT);
    };
    let _mound = null;
    function moundGeo() {
      if (_mound) return _mound;
      const g = new THREE.SphereGeometry(1, 10, 5, 0, PI * 2, 0, PI / 2);
      const p = g.attributes.position,
        rr = M.rng("dngmound");
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        const k = y > 0.02 ? 0.8 + rr() * 0.35 : 1;
        p.setXYZ(i, p.getX(i) * k, y * (0.7 + rr() * 0.4), p.getZ(i) * k);
      }
      g.computeVertexNormals();
      _mound = g;
      return g;
    }
    /** Fallen ceiling tiles / paper litter / stains scattered over a rect. */
    K.litter = function (x0, z0, x1, z1, y, n, o) {
      o = o || {};
      for (let i = 0; i < n; i++) {
        const x = r.range(x0 + 0.4, x1 - 0.4),
          z = r.range(z0 + 0.4, z1 - 0.4);
        const k = r();
        if (k < 0.25 && o.tiles !== false)
          K.obox("plaster_stained", x, y + 0.03, z, 0.6, 0.02, 0.6, r() * 6, {
            pitch: r.range(-0.15, 0.15),
            c: [0.7, 0.68, 0.62],
            s: 1,
          });
        else
          K.decal(
            x,
            y + 0.012 + i * 0.0004,
            z,
            r.range(0.8, 2.2),
            r.range(0.8, 2.2),
            r() * 6,
            r.pick(
              o.cells || [
                M.MARK.LITTER,
                M.MARK.DIRT,
                M.MARK.STAIN,
                M.MARK.CRACKS,
                M.MARK.GRIME,
              ],
            ),
          );
      }
    };
    /** Dress form (mannequin torso on a stand). */
    K.dressForm = function (x, y, z, yaw, fallen) {
      const c = r.pick([
        [0.75, 0.68, 0.55],
        [0.3, 0.3, 0.3],
        [0.6, 0.55, 0.5],
      ]);
      if (fallen) {
        K.obox("fabric", x, y + 0.2, z, 0.4, 0.35, 0.7, yaw, {
          roll: 1.5,
          c,
          s: 0.5,
        });
        K.pipe(
          "metal_painted",
          x - 0.3,
          y + 0.05,
          z,
          x + 0.9,
          y + 0.05,
          z + 0.3,
          0.02,
          4,
          { c: [0.3, 0.3, 0.3] },
        );
        return;
      }
      K.cyl("metal_painted", x, y, z, 0.25, 0.25, 0.04, 6, {
        c: [0.25, 0.25, 0.25],
      });
      K.pipe("metal_painted", x, y, z, x, y + 1.0, z, 0.02, 4, {
        c: [0.3, 0.3, 0.3],
      });
      K.cyl("fabric", x, y + 1.0, z, 0.17, 0.2, 0.3, 8, { c });
      K.cyl("fabric", x, y + 1.3, z, 0.2, 0.15, 0.3, 8, { c });
      K.cyl("fabric", x, y + 1.6, z, 0.15, 0.05, 0.12, 8, { c, capTop: true });
      K.col(x - 0.2, y, z - 0.2, x + 0.2, y + 1.7, z + 0.2, {
        tag: "furniture",
        surface: "wood",
      });
    };
    /** Garment rack with hanging (rotted) clothes. */
    K.garmentRack = function (x, y, z, yaw, L) {
      L = L || 1.6;
      for (const s of [-1, 1]) {
        const [px, pz] = rot(x, z, yaw, (s * L) / 2, 0);
        K.pipe("chrome", px, y, pz, px, y + 1.6, pz, 0.02, 4, {
          c: [0.6, 0.6, 0.58],
        });
      }
      const [ax, az] = rot(x, z, yaw, -L / 2, 0),
        [bx, bz] = rot(x, z, yaw, L / 2, 0);
      K.pipe("chrome", ax, y + 1.6, az, bx, y + 1.6, bz, 0.018, 4, {
        c: [0.6, 0.6, 0.58],
      });
      for (let t = -L / 2 + 0.15; t < L / 2 - 0.1; t += r.range(0.12, 0.3)) {
        if (r() < 0.25) continue;
        const [gx, gz] = rot(x, z, yaw, t, 0);
        const len = r.range(0.6, 1.1);
        K.obox("fabric", gx, y + 1.58 - len / 2, gz, 0.06, len, 0.45, yaw, {
          c: r.pick([
            [0.35, 0.3, 0.25],
            [0.2, 0.25, 0.35],
            [0.45, 0.2, 0.18],
            [0.5, 0.45, 0.35],
            [0.25, 0.3, 0.22],
          ]),
          s: 0.5,
        });
      }
    };
    /** Industrial sewing table with machines. */
    K.sewingTable = function (x, y, z, yaw, n) {
      n = n || 3;
      const L = n * 1.1;
      K.table(x, y, z, yaw, L, 0.8, {
        mat: "metal_painted",
        c: [0.4, 0.42, 0.38],
      });
      for (let i = 0; i < n; i++) {
        const t = -L / 2 + 0.55 + i * 1.1;
        if (r() < 0.2) continue; // machine gone
        const [mx, mz] = rot(x, z, yaw, t, 0.05);
        const c = r.pick([
          [0.2, 0.22, 0.2],
          [0.25, 0.3, 0.28],
          [0.5, 0.48, 0.4],
        ]);
        K.obox("metal_painted", mx, y + 0.8, mz, 0.45, 0.08, 0.22, yaw, {
          c,
          s: 1,
        });
        const [ax, az] = rot(x, z, yaw, t + 0.18, 0.05);
        K.obox("metal_painted", ax, y + 0.95, az, 0.09, 0.28, 0.16, yaw, {
          c,
          s: 1,
        });
        const [hx, hz] = rot(x, z, yaw, t - 0.05, 0.05);
        K.obox("metal_painted", hx, y + 1.08, hz, 0.4, 0.08, 0.14, yaw, {
          c,
          s: 1,
        });
        const [px, pz] = rot(x, z, yaw, t - 0.2, 0.05);
        K.obox("metal_painted", px, y + 0.95, pz, 0.05, 0.22, 0.05, yaw, {
          c: [0.5, 0.5, 0.48],
          s: 1,
        });
        if (r() < 0.5) {
          const [fx2, fz2] = rot(x, z, yaw, t + r.range(-0.3, 0.3), -0.2);
          K.obox(
            "fabric",
            fx2,
            y + 0.79,
            fz2,
            0.5,
            0.01,
            0.4,
            yaw + r.range(-0.5, 0.5),
            {
              c: r.pick([
                [0.5, 0.2, 0.2],
                [0.3, 0.35, 0.5],
                [0.6, 0.55, 0.45],
              ]),
              s: 0.3,
            },
          );
        }
        if (r() < 0.6) {
          const [cx, cz] = rot(x, z, yaw, t, -0.75);
          K.chair(cx, y, cz, yaw + PI + r.range(-0.4, 0.4), {
            knocked: r() < 0.25,
          });
        }
      }
    };
    K.fabricBolts = function (x, y, z, yaw, n) {
      for (let i = 0; i < n; i++) {
        const [bx, bz] = rot(x, z, yaw, 0, (i - n / 2) * 0.32);
        K.pipe(
          "fabric",
          bx - 0.7,
          y + 0.15 + (i % 2) * 0.28,
          bz,
          bx + 0.7,
          y + 0.15 + (i % 2) * 0.28,
          bz,
          0.14,
          8,
          {
            c: r.pick([
              [0.55, 0.2, 0.18],
              [0.2, 0.3, 0.5],
              [0.6, 0.55, 0.4],
              [0.3, 0.4, 0.3],
              [0.5, 0.45, 0.5],
            ]),
          },
        );
      }
      K.ocol(x, z, 1.5, n * 0.32, y, y + 0.6, yaw, {
        tag: "furniture",
        surface: "wood",
      });
    };
    /** Horizontal boiler with firebox, gauges and flue. */
    K.boiler = function (x, y, z, yaw, L) {
      L = L || 5;
      const [ax, az] = rot(x, z, yaw, 0, -L / 2),
        [bx, bz] = rot(x, z, yaw, 0, L / 2);
      K.pipe("rust", ax, y + 1.5, az, bx, y + 1.5, bz, 1.2, 14, {
        c: [0.45, 0.38, 0.32],
      });
      K.obox("brick_red", x, y + 0.4, z, 2.6, 0.8, L - 0.4, yaw, {
        c: [0.6, 0.45, 0.38],
        s: 2.7,
      });
      const [fx2, fz2] = rot(x, z, yaw, 0, -L / 2 - 0.05);
      K.obox("metal_painted", fx2, y + 1.5, fz2, 2.3, 2.3, 0.1, yaw, {
        c: [0.25, 0.22, 0.2],
        s: 1,
      });
      const [dx, dz] = rot(x, z, yaw, 0, -L / 2 - 0.1);
      K.obox("rust", dx, y + 1.0, dz, 0.7, 0.5, 0.06, yaw, {
        c: [0.35, 0.28, 0.22],
        s: 1,
      });
      for (const s of [-0.5, 0.5]) {
        const [gx, gz] = rot(x, z, yaw, s, -L / 2 - 0.12);
        K.cyl("chrome", gx, y + 2.2, gz, 0.12, 0.12, 0.06, 8, {
          c: [0.7, 0.68, 0.6],
        });
      }
      const [cx, cz] = rot(x, z, yaw, 0, L / 2 - 0.6);
      K.pipe("rust", cx, y + 2.6, cz, cx, y + 5.5, cz, 0.35, 8, {
        c: [0.35, 0.3, 0.27],
      });
      K.ocol(x, z, 2.6, L + 0.3, y, y + 2.8, yaw, {
        tag: "machine",
        surface: "metal",
      });
    };
    /** Big vertical pump with motor, flanges and a pipe elbow into the floor. */
    K.pump = function (x, y, z, s) {
      s = s || 1;
      K.cyl("metal_painted", x, y, z, 1.6 * s, 1.6 * s, 0.4, 14, {
        capTop: true,
        c: [0.3, 0.38, 0.34],
      });
      K.cyl("metal_painted", x, y + 0.4, z, 1.1 * s, 1.25 * s, 2.2 * s, 14, {
        c: [0.32, 0.4, 0.36],
      });
      for (let k = 0; k < 3; k++)
        K.cyl(
          "metal_painted",
          x,
          y + 0.6 + k * 0.7 * s,
          z,
          1.3 * s,
          1.3 * s,
          0.1,
          14,
          { c: [0.25, 0.3, 0.28] },
        );
      K.cyl(
        "metal_painted",
        x,
        y + 0.4 + 2.2 * s,
        z,
        0.7 * s,
        0.7 * s,
        1.8 * s,
        12,
        { capTop: true, c: [0.28, 0.35, 0.32] },
      );
      K.cyl("rust", x, y + 0.4 + 4.0 * s, z, 0.25 * s, 0.1, 0.5 * s, 8, {
        capTop: true,
        c: [0.4, 0.33, 0.28],
      });
      K.pipe(
        "rust",
        x + 1.2 * s,
        y + 1.2 * s,
        z,
        x + 4 * s,
        y + 1.2 * s,
        z,
        0.55 * s,
        12,
        { c: [0.45, 0.35, 0.28] },
      );
      K.pipe(
        "rust",
        x + 4 * s,
        y + 1.2 * s,
        z,
        x + 4 * s,
        y - 0.1,
        z,
        0.55 * s,
        12,
        { c: [0.45, 0.35, 0.28] },
      );
      K.col(
        x - 1.6 * s,
        y,
        z - 1.6 * s,
        x + 1.6 * s,
        y + 4.4 * s,
        z + 1.6 * s,
        { tag: "machine", surface: "metal" },
      );
      K.col(
        x + 1.2 * s,
        y,
        z - 0.6 * s,
        x + 4.6 * s,
        y + 1.8 * s,
        z + 0.6 * s,
        { tag: "machine", surface: "metal" },
      );
    };
    /** Standing water sheet (slightly above the floor) — puddles in flooded rooms. */
    K.water = function (x0, z0, x1, z1, y) {
      M.quad(
        b("water@gloss"),
        [x0, y, z1],
        [x1, y, z1],
        [x1, y, z0],
        [x0, y, z0],
        [0, 1, 0],
        [x0 / 6, z1 / 6, x1 / 6, z1 / 6, x1 / 6, z0 / 6, x0 / 6, z0 / 6],
        [0.55, 0.62, 0.5],
      );
    };
    /** Hanging meat sack (Brute larder) from the ceiling at y. */
    K.meatSack = function (x, y, z) {
      const len = r.range(0.9, 1.4);
      K.pipe("rust", x, y, z, x, y - 0.9, z, 0.01, 3, { c: [0.3, 0.25, 0.2] });
      K.cyl("burlap", x, y - 0.9 - len, z, 0.18, 0.3, len, 8, {
        capTop: true,
        c: [0.55, 0.28, 0.2],
      });
      K.decal(x, 0.012, z, 1, 1, r() * 6, M.MARK.BLOOD);
    };
    K.cage = function (x, y, z, s) {
      s = s || 1.6;
      const h = 2.2;
      for (let i = 0; i <= 8; i++) {
        const t = -s / 2 + (s * i) / 8;
        for (const [ax, az] of [
          [t, -s / 2],
          [t, s / 2],
          [-s / 2, t],
          [s / 2, t],
        ])
          K.pipe("rust", x + ax, y, z + az, x + ax, y + h, z + az, 0.015, 3, {
            c: [0.45, 0.35, 0.28],
          });
      }
      K.box(
        "rust",
        x - s / 2,
        y + h,
        z - s / 2,
        x + s / 2,
        y + h + 0.05,
        z + s / 2,
        [0.4, 0.3, 0.25],
        1,
      );
      K.col(x - s / 2, y, z - s / 2, x + s / 2, y + h, z + s / 2, {
        tag: "furniture",
        surface: "metal",
      });
    };
    K.lockers = function (x, y, z, yaw, n) {
      const w = 0.45;
      for (let i = 0; i < n; i++) {
        const [lx, lz] = rot(x, z, yaw, (i - (n - 1) / 2) * w, 0);
        const c = r.pick([
          [0.35, 0.45, 0.4],
          [0.45, 0.48, 0.5],
          [0.5, 0.42, 0.3],
        ]);
        K.obox("metal_painted", lx, y + 0.95, lz, w - 0.02, 1.9, 0.5, yaw, {
          c,
          s: 1,
        });
        if (r() < 0.35) {
          const [dx, dz] = rot(x, z, yaw, (i - (n - 1) / 2) * w - 0.12, -0.45);
          K.obox("metal_panel", dx, y + 0.95, dz, 0.02, 1.8, 0.42, yaw + 1.1, {
            c,
            s: 1,
          });
        }
      }
      K.ocol(x, z, n * w, 0.5, y, y + 1.9, yaw, {
        tag: "furniture",
        surface: "metal",
      });
    };
    /** Floor grate strip (maintenance tunnels). */
    K.grate = function (x0, z0, x1, z1, y) {
      K.box(
        "metal_diamond",
        x0,
        y - 0.02,
        z0,
        x1,
        y + 0.01,
        z1,
        [0.5, 0.48, 0.44],
        1,
        8,
      );
    };
    /** Graffiti tag on a wall (reuses the map's graffiti decals when present) — a simple painted scrawl otherwise. */
    K.scrawl = function (x, y, z, nx, nz, w) {
      const cols = [
        [0.7, 0.15, 0.1],
        [0.85, 0.8, 0.75],
        [0.2, 0.2, 0.2],
      ];
      const c = r.pick(cols);
      const rx = nz,
        rz = -nx;
      for (let i = 0; i < 5; i++) {
        const a = r.range(-w / 2, w / 2),
          bY = y + r.range(-0.3, 0.3),
          c2 = r.range(-w / 2, w / 2),
          dY = y + r.range(-0.4, 0.4);
        K.beam(
          "paint_red",
          x + rx * a + nx * 0.02,
          bY,
          z + rz * a + nz * 0.02,
          x + rx * c2 + nx * 0.02,
          dY,
          z + rz * c2 + nz * 0.02,
          0.07,
          0.01,
          { c },
        );
      }
    };
    return K;
  };
  M.DUNGEON_T = T;
})();
