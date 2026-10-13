/* src/map/60_subway_interior.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 60 SUBWAY (Times Sq – 42 St) — INTERIOR
 * (Street entrances, stairwells & the shared tile/sign atlases: 60_subway.js.)
 * Interior (INTERIORS.subway.origin): mezzanine with token booth and
 * turnstiles above an island platform, two track beds with rails & third
 * rail, tiled walls with "TIMES SQ – 42 ST" mosaic tablets, hanging
 * direction signs, I-beam columns, a derailed train (one car enterable),
 * dark tunnels ending in cave-ins, and a maintenance room. Anchors for
 * spawns (Maniacs) & quests.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const LAYER = "subway";
  let S = { x: 4000, y: 0, z: 400 };
  const A = {};
  M.anchors = M.anchors || {};
  const ssign = M.subwaySign; // shared sign emitter (60_subway.js; default layer 'subway')

  // -------------------------------------------------------------------
  // Interior helpers (local coords; the S transform is active)
  // -------------------------------------------------------------------
  const b = (key) => M.buf(key, 0, 0, LAYER);
  function CB(x0, y0, z0, x1, y1, z1, opts) {
    return M.box3(
      S.x + Math.min(x0, x1),
      y0,
      S.z + Math.min(z0, z1),
      S.x + Math.max(x0, x1),
      y1,
      S.z + Math.max(z0, z1),
      Object.assign({ tag: "subway", surface: "concrete" }, opts || {}),
    );
  }
  /** Tiled wall quad between (ax,az)→(bx,bz), y0..y1, facing n. */
  function tileWall(ax, az, bx, bz, y0, y1, nx, nz, dark) {
    const len = Math.hypot(bx - ax, bz - az);
    // (over-bright vertex colours: the station is lit only by a few fixtures, the tiles must still read)
    const c0 = dark ? [0.36, 0.36, 0.34] : [0.82, 0.8, 0.74],
      c1 = dark ? [0.6, 0.58, 0.55] : [1.25, 1.22, 1.12];
    // '@emis': the glazed tiles faintly return the light of the few live fixtures (the atmosphere's subway mood is very dark)
    M.quad(
      b(dark ? "my/subwaytile@emis" : "my/subwaytile@emis2"),
      [ax, y0, az],
      [bx, y0, bz],
      [bx, y1, bz],
      [ax, y1, az],
      [nx, 0, nz],
      [0, y0 / 2, len / 2, y0 / 2, len / 2, y1 / 2, 0, y1 / 2],
      c0,
      c1,
    );
  }
  function concreteBox(x0, y0, z0, x1, y1, z1, c, key) {
    M.box(b(key || "concrete@emis"), x0, y0, z0, x1, y1, z1, {
      s: 3,
      c: c || [0.6, 0.6, 0.57],
    });
  }

  /** A 1950s subway car (R-type look) in local coords; enterable if o.open. */
  function subwayCar(cx, cz, yaw, o) {
    o = o || {};
    const L2 = 16,
      W = 3.0,
      FL = 1.25,
      H = 2.5; // floor at FL (platform height), body height
    const m = M.mtx(cx, o.dy || 0, cz, yaw, o.pitch || 0, o.roll || 0);
    M.pushXF(m);
    const body = b("corrugated"),
      dark = b("glass_dirty"),
      trim = b("metal_painted");
    const cBody = [0.78, 0.8, 0.82],
      cRed = [0.6, 0.18, 0.15];
    // undercarriage & trucks
    M.box(
      b("rust"),
      -W / 2 + 0.2,
      0.3,
      -L2 / 2 + 0.5,
      W / 2 - 0.2,
      FL - 0.1,
      L2 / 2 - 0.5,
      { s: 2, c: [0.4, 0.35, 0.3] },
    );
    for (const tz of [-L2 / 2 + 2.5, L2 / 2 - 2.5]) {
      M.box(b("rust"), -1.1, 0.1, tz - 1.3, 1.1, 0.7, tz + 1.3, {
        s: 1,
        c: [0.3, 0.28, 0.25],
      });
      for (const wz of [-0.8, 0.8])
        for (const wx of [-0.75, 0.75])
          M.pipe(
            b("rust"),
            wx - 0.05,
            0.45,
            tz + wz,
            wx + 0.05,
            0.45,
            tz + wz,
            0.42,
            10,
            { c: [0.35, 0.32, 0.3] },
          );
    }
    // floor
    M.box(trim, -W / 2, FL - 0.1, -L2 / 2, W / 2, FL, L2 / 2, {
      s: 2,
      c: [0.45, 0.42, 0.38],
    });
    // side walls with window band & door openings (doors at 3 positions)
    const doors = [-5, 0, 5];
    const dw = 1.3;
    for (const sd of [-1, 1]) {
      const x = (sd * W) / 2;
      const openSide = o.open && sd === (o.openSide || 1);
      let z = -L2 / 2;
      const segs = [];
      for (const dz of doors) {
        segs.push([z, dz - dw / 2]);
        z = dz + dw / 2;
      }
      segs.push([z, L2 / 2]);
      for (const [za, zb] of segs) {
        M.quad(
          body,
          [x, FL, za],
          [x, FL, zb],
          [x, FL + 1.0, zb],
          [x, FL + 1.0, za],
          [sd, 0, 0],
          [0, 0, (zb - za) / 2, 0, (zb - za) / 2, 0.5, 0, 0.5],
          cBody,
        );
        M.quad(
          dark,
          [x + sd * 0.01, FL + 1.0, za + 0.2],
          [x + sd * 0.01, FL + 1.0, zb - 0.2],
          [x + sd * 0.01, FL + 1.9, zb - 0.2],
          [x + sd * 0.01, FL + 1.9, za + 0.2],
          [sd, 0, 0],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.12, 0.13, 0.13],
        );
        M.quad(
          body,
          [x, FL + 1.9, za],
          [x, FL + 1.9, zb],
          [x, FL + H, zb],
          [x, FL + H, za],
          [sd, 0, 0],
          [0, 0, (zb - za) / 2, 0, (zb - za) / 2, 0.3, 0, 0.3],
          cBody,
        );
        // window posts
        for (let pz = za + 0.2; pz < zb - 0.1; pz += 1.1)
          M.box(
            trim,
            x - 0.03,
            FL + 1.0,
            pz - 0.05,
            x + 0.03,
            FL + 1.9,
            pz + 0.05,
            { s: 1, c: cBody },
          );
      }
      for (const dz of doors) {
        const open = openSide || (o.brokenDoors && Math.abs(dz) === 5);
        if (!open)
          M.quad(
            body,
            [x, FL, dz - dw / 2],
            [x, FL, dz + dw / 2],
            [x, FL + 2.05, dz + dw / 2],
            [x, FL + 2.05, dz - dw / 2],
            [sd, 0, 0],
            [0, 0, 1, 0, 1, 1, 0, 1],
            M.mulc(cBody, 0.85),
          );
        M.quad(
          body,
          [x, FL + 2.05, dz - dw / 2],
          [x, FL + 2.05, dz + dw / 2],
          [x, FL + H, dz + dw / 2],
          [x, FL + H, dz - dw / 2],
          [sd, 0, 0],
          [0, 0, 1, 0, 1, 0.3, 0, 0.3],
          cBody,
        );
      }
      // red belt line
      M.box(
        b("paint_red"),
        x - 0.02,
        FL + 0.9,
        -L2 / 2,
        x + 0.02,
        FL + 1.0,
        L2 / 2,
        { s: 1, c: cRed },
      );
    }
    // ends with windows
    for (const sd of [-1, 1]) {
      const z = (sd * L2) / 2;
      M.quad(
        body,
        [-W / 2, FL - 0.1, z],
        [W / 2, FL - 0.1, z],
        [W / 2, FL + H, z],
        [-W / 2, FL + H, z],
        [0, 0, sd],
        [0, 0, 1.5, 0, 1.5, 1.3, 0, 1.3],
        M.mulc(cBody, 0.9),
      );
      M.quad(
        dark,
        [-0.9, FL + 1.1, z + sd * 0.01],
        [0.9, FL + 1.1, z + sd * 0.01],
        [0.9, FL + 1.9, z + sd * 0.01],
        [-0.9, FL + 1.9, z + sd * 0.01],
        [0, 0, sd],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.1, 0.1, 0.1],
      );
      M.quad(
        b("my/subwaysigns"),
        [-0.9, FL + 2.0, z + sd * 0.02],
        [0.9, FL + 2.0, z + sd * 0.02],
        [0.9, FL + 2.4, z + sd * 0.02],
        [-0.9, FL + 2.4, z + sd * 0.02],
        [0, 0, sd],
        (() => {
          const uv = M.cellUV(10, 2, 8);
          return sd > 0
            ? [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]]
            : [uv[2], uv[1], uv[0], uv[1], uv[0], uv[3], uv[2], uv[3]];
        })(),
      );
      // bumper/coupler
      M.box(b("rust"), -0.25, 0.6, z, 0.25, 0.9, z + sd * 0.6, {
        s: 1,
        c: [0.35, 0.3, 0.28],
      });
    }
    // curved roof (3 facets)
    const rC = [0.65, 0.66, 0.68];
    M.quad(
      body,
      [-W / 2, FL + H, -L2 / 2],
      [-W / 2, FL + H, L2 / 2],
      [-0.8, FL + H + 0.35, L2 / 2],
      [-0.8, FL + H + 0.35, -L2 / 2],
      [-0.5, 0.85, 0],
      [0, 0, 8, 0, 8, 0.5, 0, 0.5],
      rC,
    );
    M.quad(
      body,
      [-0.8, FL + H + 0.35, -L2 / 2],
      [-0.8, FL + H + 0.35, L2 / 2],
      [0.8, FL + H + 0.35, L2 / 2],
      [0.8, FL + H + 0.35, -L2 / 2],
      [0, 1, 0],
      [0, 0, 8, 0, 8, 1, 0, 1],
      rC,
    );
    M.quad(
      body,
      [0.8, FL + H + 0.35, -L2 / 2],
      [0.8, FL + H + 0.35, L2 / 2],
      [W / 2, FL + H, L2 / 2],
      [W / 2, FL + H, -L2 / 2],
      [0.5, 0.85, 0],
      [0, 0, 8, 0, 8, 0.5, 0, 0.5],
      rC,
    );
    if (o.open) {
      // interior: inside faces, seats, poles, straps, litter
      const inn = b("metal_panel");
      const ic = [0.62, 0.6, 0.55];
      for (const sd of [-1, 1])
        M.quad(
          inn,
          [sd * (W / 2 - 0.04), FL, sd > 0 ? L2 / 2 : -L2 / 2],
          [sd * (W / 2 - 0.04), FL, sd > 0 ? -L2 / 2 : L2 / 2],
          [sd * (W / 2 - 0.04), FL + 1.0, sd > 0 ? -L2 / 2 : L2 / 2],
          [sd * (W / 2 - 0.04), FL + 1.0, sd > 0 ? L2 / 2 : -L2 / 2],
          [-sd, 0, 0],
          [0, 0, 8, 0, 8, 0.5, 0, 0.5],
          ic,
        );
      M.quad(
        inn,
        [-W / 2, FL + H - 0.05, L2 / 2],
        [W / 2, FL + H - 0.05, L2 / 2],
        [W / 2, FL + H - 0.05, -L2 / 2],
        [-W / 2, FL + H - 0.05, -L2 / 2],
        [0, -1, 0],
        [0, 0, 1.5, 0, 1.5, 8, 0, 8],
        [0.7, 0.68, 0.62],
      );
      for (const sd of [-1, 1]) {
        const z0e = (sd * L2) / 2 - sd * 0.04;
        M.quad(
          inn,
          [W / 2, FL, z0e],
          [-W / 2, FL, z0e],
          [-W / 2, FL + H, z0e],
          [W / 2, FL + H, z0e],
          [0, 0, -sd],
          [0, 0, 1.5, 0, 1.5, 1.3, 0, 1.3],
          ic,
        );
      }
      const seat = b("fabric");
      for (const [za, zb] of [
        [-7.6, -5.8],
        [-4.2, -0.8],
        [0.8, 4.2],
        [5.8, 7.6],
      ])
        for (const sd of [-1, 1]) {
          M.box(
            seat,
            sd > 0 ? W / 2 - 0.55 : -W / 2 + 0.05,
            FL + 0.42,
            za,
            sd > 0 ? W / 2 - 0.05 : -W / 2 + 0.55,
            FL + 0.52,
            zb,
            { s: 1, c: [0.55, 0.4, 0.25] },
          );
          M.box(
            seat,
            sd > 0 ? W / 2 - 0.15 : -W / 2 + 0.05,
            FL + 0.52,
            za,
            sd > 0 ? W / 2 - 0.05 : -W / 2 + 0.15,
            FL + 1.0,
            zb,
            { s: 1, c: [0.5, 0.38, 0.24] },
          );
        }
      for (const z of [-6.5, -2.5, 2.5, 6.5])
        M.pipe(b("chrome"), 0, FL, z, 0, FL + H, z, 0.03, 6, {
          c: [0.8, 0.8, 0.78],
        });
      for (let z = -7; z < 7.5; z += 0.9)
        for (const sd of [-0.6, 0.6]) {
          M.pipe(
            b("chrome"),
            sd,
            FL + H - 0.05,
            z,
            sd,
            FL + H - 0.35,
            z,
            0.01,
            3,
            { c: [0.7, 0.7, 0.68] },
          );
          M.cyl(b("fabric"), sd, FL + H - 0.45, z, 0.07, 0.07, 0.1, 6, {
            c: [0.8, 0.75, 0.6],
          });
        }
      const db = M.buf("my/markings", 0, 0, LAYER);
      M.decal(db, 0, FL + 0.01, -3, 1.6, 3, 0.2, M.MARK.LITTER);
      M.decal(db, 0.3, FL + 0.012, 4, 1.4, 2.4, 1.2, M.MARK.BLOOD);
    }
    M.popXF();
  }

  // -------------------------------------------------------------------
  // Interior build
  // -------------------------------------------------------------------
  const PF = 1.2; // platform height
  const TOP = 5.2; // track-level ceiling
  const MZ = 5.5; // mezzanine floor
  const MTOP = 9.0; // mezzanine ceiling
  const T61_X = 80; // east tunnel north wall (z -8) around x 80 is reserved for the lair's T-61 bulkhead: keep it clear
  function buildInterior() {
    const r = M.rng("subway");
    // ---------------- track level box: x -45..45, z -8..16 ----------------
    // floor (track bed), ballast strips, rails & third rail
    M.quad(
      b("rubble"),
      [-95, 0, 16],
      [95, 0, 16],
      [95, 0, -8],
      [-95, 0, -8],
      [0, 1, 0],
      [-30, 5, 30, 5, 30, -3, -30, -3],
      [0.55, 0.52, 0.48],
    );
    for (const tz of [-3.5, 11.5]) {
      for (const rz of [-0.72, 0.72])
        M.box(b("rust"), -95, 0.12, tz + rz - 0.04, 95, 0.28, tz + rz + 0.04, {
          s: 2,
          c: [0.75, 0.62, 0.5],
        });
      M.box(b("wood_rotten"), -95, 0, tz - 1.2, 95, 0.12, tz + 1.2, {
        s: 1.2,
        c: [0.45, 0.38, 0.3],
      });
      M.box(b("metal_painted"), -95, 0.2, tz + 1.55, 95, 0.38, tz + 1.7, {
        s: 2,
        c: [0.35, 0.33, 0.3],
      }); // third rail
      M.box(b("wood_planks"), -95, 0.38, tz + 1.5, 95, 0.42, tz + 1.75, {
        s: 2,
        c: [0.5, 0.42, 0.3],
      }); // cover board
    }
    // island platform z -1..9
    concreteBox(-45, 0, -1, 45, PF, 9, [0.62, 0.6, 0.56]);
    CB(-45, 0, -1, 45, PF, 9, { surface: "concrete" });
    // yellow warning strips at the edges
    for (const ez of [-0.95, 8.35])
      M.box(b("cryo_orange"), -45, PF, ez, 45, PF + 0.01, ez + 0.6, {
        s: 2,
        c: [0.9, 0.85, 0.7],
      });
    // outer tiled walls (z=-8 facing +z, z=16 facing -z) and station ends (x=±45) above the tunnels
    tileWall(45, -8, -45, -8, 0, TOP, 0, 1);
    tileWall(-45, 16, 45, 16, 0, TOP, 0, -1);
    // north wall colliders leave a doorway to the maintenance room (x -62..-60)
    CB(-95, 0, -8.4, -62, TOP, -8);
    CB(-60, 0, -8.4, 95, TOP, -8);
    CB(-62, 2.7, -8.4, -60, TOP, -8);
    CB(-95, 0, 16, 95, TOP, 16.4);
    // mosaic band & name tablets
    for (const [z, nz] of [
      [-7.98, 1],
      [15.98, -1],
    ]) {
      for (let x = -40; x <= 40; x += 13)
        ssign("TIMES SQ — 42 ST", x, 2.9, z, 0, nz, 3.2);
      for (let x = -46; x <= 46; x += 13)
        ssign("42", x + 6.5, 2.9, z, 0, nz, 1.2);
      const band = b("paint_teal");
      M.box(
        band,
        -45,
        3.9,
        nz > 0 ? z - 0.02 : z - 0.03,
        45,
        4.1,
        nz > 0 ? z + 0.03 : z + 0.02,
        { s: 1, c: [0.6, 0.85, 0.75] },
      );
    }
    // ceiling (track level) outside the mezzanine
    const ceil = b("concrete@emis2");
    const ceilQ = (x0, z0, x1, z1) =>
      M.quad(
        ceil,
        [x0, TOP, z0],
        [x1, TOP, z0],
        [x1, TOP, z1],
        [x0, TOP, z1],
        [0, -1, 0],
        [x0 / 4, z0 / 4, x1 / 4, z0 / 4, x1 / 4, z1 / 4, x0 / 4, z1 / 4],
        [0.5, 0.5, 0.47],
      );
    // (leave the stair opening x 3.5..6.5, z 0.5..8 open)
    ceilQ(-95, -8, 3.5, 16);
    ceilQ(6.5, -8, 95, 16);
    ceilQ(3.5, -8, 6.5, 0.5);
    ceilQ(3.5, 8, 6.5, 16);
    // column rows along the platform edges and between tracks outside the platform
    const colB = b("metal_painted");
    for (let x = -42; x <= 42; x += 5)
      for (const z of [0.1, 7.9]) {
        M.box(colB, x - 0.15, PF, z - 0.2, x + 0.15, TOP, z + 0.2, {
          s: 1,
          c: [0.28, 0.35, 0.3],
        });
        M.box(colB, x - 0.3, PF, z - 0.05, x + 0.3, TOP, z + 0.05, {
          s: 1,
          c: [0.3, 0.37, 0.32],
        });
        CB(x - 0.3, PF, z - 0.2, x + 0.3, TOP, z + 0.2, { surface: "metal" });
      }
    // hanging fluorescent fixtures (some dead, some flickering) & direction signs; each live tube throws a soft
    // additive light cone and a pool on the platform (fake light — the atmosphere module lends real lights to the nearest)
    const fx = b("my/lightfx");
    const flick = [];
    for (let x = -40; x <= 40; x += 6) {
      const k = r(),
        alive = k < 0.72;
      M.box(
        b(alive ? "emissive_window@lampw" : "glass_dirty"),
        x - 0.9,
        TOP - 0.5,
        3.9,
        x + 0.9,
        TOP - 0.42,
        4.1,
        { s: 1, c: [0.35, 0.35, 0.33] },
      );
      M.box(
        b("metal_painted"),
        x - 0.95,
        TOP - 0.42,
        3.82,
        x + 0.95,
        TOP - 0.36,
        4.18,
        { s: 1, c: [0.3, 0.32, 0.3] },
      );
      M.pipe(
        b("metal_painted"),
        x - 0.7,
        TOP,
        4,
        x - 0.7,
        TOP - 0.42,
        4,
        0.015,
        3,
        { c: [0.2, 0.2, 0.2] },
      );
      M.pipe(
        b("metal_painted"),
        x + 0.7,
        TOP,
        4,
        x + 0.7,
        TOP - 0.42,
        4,
        0.015,
        3,
        { c: [0.2, 0.2, 0.2] },
      );
      if (alive) {
        const cc = [0.07, 0.085, 0.08];
        M.lightCone(fx, x, TOP - 0.5, 4, x, PF + 0.02, 4, 0.9, 2.2, cc);
        M.lightPool(fx, x, PF + 0.03, 4, 3.2, 2.6, [0.16, 0.18, 0.16]);
        if (k > 0.6) flick.push([x, TOP - 0.6, 4]);
      }
    }
    // caged wall lamps along both outer walls & the track bed, and red emergency lamps by the stairs
    for (let x = -42; x <= 42; x += 9)
      for (const [z, nz] of [
        [-7.9, 1],
        [15.9, -1],
      ]) {
        const alive = r() < 0.7;
        M.box(
          b("metal_painted"),
          x - 0.18,
          3.25,
          nz > 0 ? z : z - 0.25,
          x + 0.18,
          3.65,
          nz > 0 ? z + 0.25 : z,
          { s: 1, c: [0.25, 0.25, 0.23] },
        );
        M.box(
          b(alive ? "emissive_window@lamp" : "glass_dirty"),
          x - 0.12,
          3.3,
          nz > 0 ? z + 0.05 : z - 0.3,
          x + 0.12,
          3.55,
          nz > 0 ? z + 0.3 : z - 0.05,
          { s: 1, c: [0.5, 0.5, 0.45] },
        );
        if (alive) {
          M.lightCone(
            fx,
            x,
            3.3,
            z + nz * 0.3,
            x,
            0.02,
            z + nz * 1.6,
            0.25,
            1.6,
            [0.08, 0.065, 0.04],
            false,
          );
          M.lightPool(fx, x, 0.03, z + nz * 1.8, 2.2, 2.2, [0.12, 0.1, 0.07]);
        }
      }
    for (const [x, z] of [
      [3.2, 8.4],
      [6.8, 0.2],
      [-2.6, -7.8],
    ]) {
      M.box(
        b("neon_red@lampr"),
        x - 0.12,
        PF + 3.2,
        z - 0.12,
        x + 0.12,
        PF + 3.45,
        z + 0.12,
        { s: 1 },
      );
    }
    M.subwayFlicker = flick.map(
      (p) => new THREE.Vector3(S.x + p[0], (S.y || 0) + p[1], S.z + p[2]),
    );
    for (const x of [-30, 20]) {
      ssign("UPTOWN & THE BRONX", x, TOP - 0.9, 1.6, 0, -1, 2.8);
      ssign("DOWNTOWN & BROOKLYN", x, TOP - 0.9, 6.4, 0, 1, 2.8);
    }
    // benches, trash, newsstand
    const wb = b("wood_planks");
    for (const x of [-35, -20, 25, 38]) {
      M.box(wb, x - 1.2, PF + 0.42, 3.4, x + 1.2, PF + 0.47, 4.6, {
        s: 1,
        c: [0.55, 0.42, 0.3],
      });
      M.box(wb, x - 1.2, PF + 0.47, 4.5, x + 1.2, PF + 0.95, 4.6, {
        s: 1,
        c: [0.5, 0.4, 0.28],
      });
      CB(x - 1.2, PF, 3.4, x + 1.2, PF + 0.5, 4.6, { surface: "wood" });
    }
    M.box(wb, 28, PF, 2.2, 32, PF + 2.6, 5.8, {
      s: 1.5,
      c: [0.55, 0.45, 0.32],
    });
    M.box(b("fabric"), 27.8, PF + 2.6, 2.0, 32.2, PF + 2.75, 6.0, {
      s: 1,
      c: [0.5, 0.2, 0.15],
    });
    M.box(b("glass_dirty"), 27.98, PF + 1.1, 2.6, 28.0, PF + 2.2, 5.4, {
      s: 1,
      c: [0.3, 0.3, 0.3],
    });
    CB(28, PF, 2.2, 32, PF + 2.6, 5.8, { surface: "wood" });
    for (const x of [-10, 12, 35]) {
      M.cyl(b("metal_panel"), x, PF, 1.2, 0.3, 0.28, 0.9, 8, {
        c: [0.35, 0.4, 0.35],
        capTop: true,
      });
      CB(x - 0.3, PF, 0.9, x + 0.3, PF + 0.9, 1.5);
    }
    // posters on the walls
    const brands = [
      "fizzo_cola",
      "long_winter",
      "lonly_tv",
      "prairie_root_beer",
      "super_sergeant",
      "silver_torch",
      "homeguard",
      "burger_brigade",
      "hi_octane",
      "liberty_jetliner",
      "junior_rocketeer",
      "miracle_mane",
      "excalibur_gardens",
      "chocolate_zeppelin",
    ]; // 14 platform posters, no repeats
    let bi = 0;
    for (let x = -38; x <= 38; x += 13) {
      M.adPanel(
        brands[bi++ % brands.length],
        x + 6.5,
        2.0,
        -7.95,
        0,
        1,
        2.4,
        1.2,
        { layer: LAYER },
      );
      M.adPanel(
        brands[bi++ % brands.length],
        x + 6.5,
        2.0,
        15.95,
        0,
        -1,
        2.4,
        1.2,
        { layer: LAYER },
      );
    }
    // platform grime
    const db = M.buf("my/markings", 0, 0, LAYER);
    for (let i = 0; i < 40; i++)
      M.decal(
        db,
        r.range(-44, 44),
        PF + 0.012,
        r.range(0, 8),
        r.range(1, 3),
        r.range(1, 3),
        r() * 6,
        r.pick([
          M.MARK.LITTER,
          M.MARK.STAIN,
          M.MARK.PUDDLE,
          M.MARK.DIRT,
          M.MARK.CRACKS,
          M.MARK.BLOOD,
        ]),
      );
    for (let i = 0; i < 24; i++)
      M.decal(
        db,
        r.range(-90, 90),
        0.02,
        r.pick([-3.5, 11.5]) + r.range(-1.5, 1.5),
        r.range(1, 3),
        r.range(1, 3),
        r() * 6,
        r.pick([M.MARK.PUDDLE, M.MARK.LITTER, M.MARK.STAIN]),
      );

    // ---------------- mezzanine above: x -14..14, z -8..16, y 5.5..9 ----------------
    // floor slab with the stair opening at x 3.5..6.5, z 0.5..8
    const slab = (x0, z0, x1, z1) => {
      concreteBox(x0, TOP, z0, x1, MZ, z1, [0.62, 0.6, 0.56]);
      M.quad(
        b("tile_cryo"),
        [x0, MZ + 0.005, z1],
        [x1, MZ + 0.005, z1],
        [x1, MZ + 0.005, z0],
        [x0, MZ + 0.005, z0],
        [0, 1, 0],
        [x0 / 2, z1 / 2, x1 / 2, z1 / 2, x1 / 2, z0 / 2, x0 / 2, z0 / 2],
        [0.7, 0.68, 0.62],
      );
      CB(x0, TOP, z0, x1, MZ, z1);
    };
    slab(-14, -8, 3.5, 16);
    slab(6.5, -8, 14, 16);
    slab(3.5, -8, 6.5, 0.5);
    slab(3.5, 8, 6.5, 16);
    // mezzanine walls & ceiling
    tileWall(14, -8, 2.5, -8, MZ, MTOP, 0, 1);
    tileWall(-2.5, -8, -14, -8, MZ, MTOP, 0, 1);
    tileWall(-14, 16, 14, 16, MZ, MTOP, 0, -1);
    tileWall(-14, -8, -14, 16, MZ, MTOP, 1, 0);
    tileWall(14, 16, 14, -8, MZ, MTOP, -1, 0);
    CB(-14.4, MZ, -8, -14, MTOP, 16);
    CB(14, MZ, -8, 14.4, MTOP, 16);
    M.quad(
      b("concrete@emis2"),
      [-14, MTOP, -8],
      [14, MTOP, -8],
      [14, MTOP, 16],
      [-14, MTOP, 16],
      [0, -1, 0],
      [0, 0, 8, 0, 8, 8, 0, 8],
      [0.55, 0.55, 0.52],
    );
    // street stair opening in the north wall (x -2.5..2.5) — cut a hole by overlaying a dark stairwell
    // stairwell box going up to the (sealed) street gate
    const sx0 = -2.5,
      sx1 = 2.5;
    const nS = 12;
    for (let i = 0; i < nS; i++) {
      const y = MZ + (4.2 * (i + 1)) / nS,
        z1 = -8 - i * 0.55,
        z0 = z1 - 0.55;
      M.box(b("concrete"), sx0, MZ, z0, sx1, y, z1, {
        s: 1.5,
        c: [0.6, 0.58, 0.54],
        skip: 8,
      });
      CB(sx0, MZ, z0, sx1, y, z1);
    }
    tileWall(sx0, -14.6, sx0, -8, MZ, MTOP + 4, 1, 0);
    tileWall(sx1, -8, sx1, -14.6, MZ, MTOP + 4, -1, 0);
    CB(sx0 - 0.4, MZ, -15, sx0, MTOP + 4, -8);
    CB(sx1, MZ, -15, sx1 + 0.4, MTOP + 4, -8);
    M.quad(
      b("concrete_dark"),
      [sx0, MTOP + 4, -14.6],
      [sx1, MTOP + 4, -14.6],
      [sx1, MTOP + 4, -8],
      [sx0, MTOP + 4, -8],
      [0, -1, 0],
      [0, 0, 2, 0, 2, 3, 0, 3],
      [0.3, 0.3, 0.3],
    );
    // sealed gate at the top + daylight leaking through, spilling a shaft of dusty light down the stairs
    const gb = b("rust");
    for (let x = sx0 + 0.1; x < sx1; x += 0.2)
      M.beam(gb, x, MZ + 4.2, -14.55, x, MZ + 7.2, -14.55, 0.03, 0.03, {
        c: [0.5, 0.35, 0.28],
      });
    M.quad(
      b("emissive_window@lamp"),
      [sx1, MZ + 4.2, -14.62],
      [sx0, MZ + 4.2, -14.62],
      [sx0, MZ + 7.2, -14.62],
      [sx1, MZ + 7.2, -14.62],
      [0, 0, 1],
      [0, 0, 1, 0, 1, 1, 0, 1],
    );
    {
      const fx2 = b("my/lightfx"),
        uv = M.lightUV(0),
        sc = [0.22, 0.21, 0.16];
      // slanted shaft from the gate down onto the mezzanine floor (two layers for depth)
      for (const k of [0, 1]) {
        const w = 2.3 - k * 0.5,
          zf = -6 + k * 1.5;
        M.quad(
          fx2,
          [-w, MZ + 0.05, zf],
          [w, MZ + 0.05, zf],
          [w, MZ + 7.0, -14.5],
          [-w, MZ + 7.0, -14.5],
          [0, 0.6, 0.8],
          [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
          sc,
          sc,
        );
      }
      M.lightPool(fx2, 0, MZ + 0.03, -5, 2.6, 2.4, [0.2, 0.19, 0.15]);
    }
    CB(sx0, MZ + 4.2, -15, sx1, MZ + 8, -14.5);
    // mezzanine north wall pieces around the stair opening are the tile wall above (the opening is the gap between sx0/sx1)
    ssign("EXIT TO 42 ST", 0, MZ + 3.0, -7.95, 0, 1, 2.6);
    // token booth (centre) & turnstile line (z = 4)
    const bb = b("metal_painted");
    M.box(bb, -3, MZ, -1, 1, MZ + 1.1, 2, { s: 1.5, c: [0.4, 0.5, 0.45] });
    M.box(b("glass_dirty"), -3, MZ + 1.1, -1, 1, MZ + 2.4, 2, {
      s: 2,
      c: [0.55, 0.62, 0.6],
    });
    M.box(bb, -3.1, MZ + 2.4, -1.1, 1.1, MZ + 2.6, 2.1, {
      s: 1,
      c: [0.3, 0.35, 0.32],
    });
    ssign("TOKENS", -1, MZ + 2.9, -1.1, 0, -1, 2);
    CB(-3, MZ, -1, 1, MZ + 2.6, 2);
    for (let x = -12; x <= 12; x += 1.4) {
      if (x > 2.5 && x < 7.5) continue; // stair opening side
      if (Math.abs(x - 0) < 1.3 || Math.abs(x + 8) < 0.8) continue; // open gaps (broken turnstiles)
      M.box(b("chrome"), x - 0.25, MZ, 4.3, x + 0.25, MZ + 0.95, 4.7, {
        s: 1,
        c: [0.65, 0.65, 0.62],
      });
      M.cyl(b("chrome"), x, MZ + 0.95, 4.5, 0.18, 0.18, 0.12, 8, {
        capTop: true,
        c: [0.7, 0.7, 0.68],
      });
      CB(x - 0.25, MZ, 4.3, x + 0.25, MZ + 0.95, 4.7);
    }
    // stair railing around the opening in the mezzanine floor
    const rl = b("metal_painted");
    for (const [ax, az, bx2, bz] of [
      [3.5, 0.5, 3.5, 8],
      [6.5, 0.5, 6.5, 8],
      [3.5, 8, 6.5, 8],
    ]) {
      M.beam(rl, ax, MZ + 1, az, bx2, MZ + 1, bz, 0.05, 0.05, {
        c: [0.3, 0.35, 0.3],
      });
      CB(
        Math.min(ax, bx2) - 0.05,
        MZ,
        Math.min(az, bz) - 0.05,
        Math.max(ax, bx2) + 0.05,
        MZ + 1.05,
        Math.max(az, bz) + 0.05,
        { tag: "railing" },
      );
    }
    // stairs down to the platform (x 3.5..6.5, from z 0.5 (top, MZ) to z 8 (bottom, PF))
    const nD = 13;
    for (let i = 0; i < nD; i++) {
      const y = MZ - ((MZ - PF) * (i + 1)) / nD,
        z0 = 0.5 + (7.5 * i) / nD,
        z1 = z0 + 7.5 / nD;
      M.box(b("concrete"), 3.6, PF, z0, 6.4, y + (MZ - PF) / nD, z1, {
        s: 1.5,
        c: [0.62, 0.6, 0.56],
        skip: 8,
      });
      CB(3.6, PF, z0, 6.4, y + (MZ - PF) / nD, z1);
    }
    // mezzanine lights & dressing
    for (const [x, z] of [
      [-9, -2],
      [-9, 10],
      [9, -2],
      [9, 10],
      [0, 12],
      [-4, 5],
    ]) {
      const alive = r() < 0.75;
      M.box(
        b(alive ? "emissive_window@lampw" : "glass_dirty"),
        x - 0.8,
        MTOP - 0.1,
        z - 0.2,
        x + 0.8,
        MTOP - 0.02,
        z + 0.2,
        { s: 1, c: [0.3, 0.3, 0.3] },
      );
      if (alive) {
        M.lightCone(
          b("my/lightfx"),
          x,
          MTOP - 0.1,
          z,
          x,
          MZ + 0.02,
          z,
          0.8,
          2.0,
          [0.06, 0.07, 0.065],
        );
        M.lightPool(
          b("my/lightfx"),
          x,
          MZ + 0.03,
          z,
          2.8,
          2.8,
          [0.14, 0.15, 0.14],
        );
      }
    }
    ssign("TO ALL TRAINS", 5, MZ + 2.6, 15.95, 0, -1, 2.6);
    ssign("SHELTER — CAPACITY 200", -8, MZ + 2.4, 15.95, 0, -1, 3.2);
    for (let i = 0; i < 10; i++)
      M.decal(
        db,
        r.range(-13, 13),
        MZ + 0.015,
        r.range(-7, 15),
        r.range(1, 2.5),
        r.range(1, 2.5),
        r() * 6,
        r.pick([M.MARK.LITTER, M.MARK.STAIN, M.MARK.DIRT]),
      );
    // makeshift camp in the mezzanine (mattresses, crates) — survivors once sheltered here
    M.box(b("fabric"), -12, MZ, 8, -10, MZ + 0.25, 10, {
      s: 1,
      c: [0.55, 0.5, 0.4],
    });
    M.box(b("fabric"), -12, MZ, 11, -10, MZ + 0.25, 13, {
      s: 1,
      c: [0.5, 0.45, 0.38],
    });
    M.box(b("wood_planks"), -9, MZ, 13.5, -8, MZ + 0.8, 14.5, {
      s: 1,
      c: [0.65, 0.55, 0.4],
    });
    CB(-9, MZ, 13.5, -8, MZ + 0.8, 14.5, { surface: "wood" });

    // ---------------- tunnels beyond the station (x ±45..95) ----------------
    for (const sd of [-1, 1]) {
      const xa = sd * 45,
        xb = sd * 95;
      // tunnel walls: separate tubes around each track with a column line between
      if (sd > 0) tileWall(xa, -8, xb, -8, 0, TOP, 0, 1, true);
      else {
        tileWall(-95, -8, -62, -8, 0, TOP, 0, 1, true);
        tileWall(-60, -8, -45, -8, 0, TOP, 0, 1, true);
        tileWall(-62, -8, -60, -8, 2.7, TOP, 0, 1, true);
      }
      tileWall(Math.max(xa, xb), 16, Math.min(xa, xb), 16, 0, TOP, 0, -1, true);
      // the platform end wall
      M.quad(
        b("concrete"),
        [xa, 0, 9],
        [xa, 0, -1],
        [xa, PF, -1],
        [xa, PF, 9],
        [sd, 0, 0],
        [0, 0, 3, 0, 3, 0.4, 0, 0.4],
        [0.5, 0.5, 0.48],
      );
      // centre wall between the tracks (with arch openings suggested by columns)
      for (let x = xa + sd * 2; sd > 0 ? x < xb : x > xb; x += sd * 3.5) {
        M.box(colB, x - 0.25, 0, 3.4, x + 0.25, TOP, 4.6, {
          s: 1,
          c: [0.3, 0.3, 0.28],
        });
        CB(x - 0.25, 0, 3.4, x + 0.25, TOP, 4.6, { surface: "metal" });
      }
      // cave-in at the end
      const cz = [-3.5, 11.5];
      for (const z of cz) {
        const ex = xb - sd * 4;
        for (let k = 0; k < 14; k++) {
          const px = ex + sd * r.range(-3, 3),
            pz = z + r.range(-2.2, 2.2);
          M.obox(
            b(r() < 0.5 ? "concrete" : "rubble"),
            px,
            r.range(0.3, 3.5),
            pz,
            r.range(1, 2.5),
            r.range(0.6, 1.5),
            r.range(1, 2.2),
            r() * 6,
            {
              pitch: r.range(-0.6, 0.6),
              roll: r.range(-0.6, 0.6),
              s: 2,
              c: [0.55, 0.53, 0.5],
            },
          );
        }
        M.beam(
          b("rust"),
          ex - sd * 3,
          0,
          z - 1.5,
          ex + sd * 1,
          4.8,
          z + 1.2,
          0.3,
          0.4,
          { c: [0.6, 0.5, 0.4] },
        );
      }
      CB(xb - sd * 7 - 0.01, 0, -8, xb, TOP, 16, { walkable: false });
      M.quad(
        b("rubble"),
        [xb - sd * 6.5, 0, sd > 0 ? 16 : -8],
        [xb - sd * 6.5, 0, sd > 0 ? -8 : 16],
        [xb - sd * 6.5, TOP, sd > 0 ? -8 : 16],
        [xb - sd * 6.5, TOP, sd > 0 ? 16 : -8],
        [-sd, 0, 0],
        [0, 0, 8, 0, 8, 2, 0, 2],
        [0.4, 0.38, 0.35],
      );
      // red signal lamps (east tunnel: the north wall at local x 77..83 stays bare: the lair's T-61 bulkhead hatch, src/lair/30_entrances.js)
      for (
        let x = xa + sd * 12;
        sd > 0 ? x < xb - 8 : x > xb + 8;
        x += sd * 14
      ) {
        if (sd > 0 && Math.abs(x - T61_X) < 3) continue;
        M.box(b("metal_painted"), x - 0.2, 2.2, -7.9, x + 0.2, 3.0, -7.6, {
          s: 1,
          c: [0.2, 0.2, 0.2],
        });
        const red = r() < 0.5;
        M.box(
          b(red ? "neon_red@lampr" : "neon_green@lampg"),
          x - 0.1,
          2.6,
          -7.6,
          x + 0.1,
          2.8,
          -7.55,
          { s: 1 },
        );
        M.lightPool(
          b("my/lightfx"),
          x,
          0.04,
          -6.6,
          1.4,
          1.4,
          red ? [0.12, 0.02, 0.01] : [0.02, 0.1, 0.03],
        );
      }
      // caged work lights along the tunnel walls (most dead): pools of light you can see from the platform
      for (
        let x = xa + sd * 7;
        sd > 0 ? x < xb - 8 : x > xb + 8;
        x += sd * 10
      ) {
        if (r() < 0.45) continue;
        M.box(
          b("emissive_window@lamp"),
          x - 0.15,
          3.6,
          15.6,
          x + 0.15,
          3.85,
          15.9,
          { s: 1 },
        );
        M.lightCone(
          b("my/lightfx"),
          x,
          3.6,
          15.6,
          x,
          0.02,
          13.2,
          0.25,
          1.8,
          [0.07, 0.06, 0.04],
          false,
        );
        M.lightPool(
          b("my/lightfx"),
          x,
          0.04,
          13.4,
          2.4,
          2.2,
          [0.1, 0.085, 0.06],
        );
      }
      A["tunnel_" + (sd > 0 ? "e" : "w")] = [sd * 70, 0, -3.5];
      if (sd > 0) A.t61_bulkhead = [T61_X, 0, -6];
    }
    // ---------------- maintenance room off the west tunnel ----------------
    // opening in the north tunnel wall at x -62..-60 (tile walls are just quads; collider gap)
    const mx0 = -68,
      mx1 = -54,
      mz0 = -16,
      mz1 = -8;
    M.quad(
      b("concrete"),
      [mx0, 0.01, mz1],
      [mx1, 0.01, mz1],
      [mx1, 0.01, mz0],
      [mx0, 0.01, mz0],
      [0, 1, 0],
      [0, 0, 5, 0, 5, 3, 0, 3],
      [0.5, 0.5, 0.48],
    );
    M.quad(
      b("concrete_dark"),
      [mx0, 3.4, mz0],
      [mx1, 3.4, mz0],
      [mx1, 3.4, mz1],
      [mx0, 3.4, mz1],
      [0, -1, 0],
      [0, 0, 5, 0, 5, 3, 0, 3],
      [0.35, 0.35, 0.33],
    );
    tileWall(mx1, mz0, mx0, mz0, 0, 3.4, 0, 1, true);
    tileWall(mx0, mz0, mx0, mz1, 0, 3.4, 1, 0, true);
    tileWall(mx1, mz1, mx1, mz0, 0, 3.4, -1, 0, true);
    CB(mx0, 0, mz0 - 0.4, mx1, 3.4, mz0);
    CB(mx0 - 0.4, 0, mz0, mx0, 3.4, mz1);
    CB(mx1, 0, mz0, mx1 + 0.4, 3.4, mz1);
    // doorway frame & sign
    M.box(b("metal_painted"), -62.3, 0, -8.3, -62, 2.4, -7.9, {
      s: 1,
      c: [0.3, 0.3, 0.28],
    });
    M.box(b("metal_painted"), -60, 0, -8.3, -59.7, 2.4, -7.9, {
      s: 1,
      c: [0.3, 0.3, 0.28],
    });
    M.box(b("metal_painted"), -62.3, 2.4, -8.3, -59.7, 2.7, -7.9, {
      s: 1,
      c: [0.3, 0.3, 0.28],
    });
    ssign("MAINTENANCE — KEEP OUT", -61, 3.3, -7.95, 0, 1, 2.6);
    // the tunnel wall quad covers the doorway: draw a dark doorway panel just in front of it? instead render the inner room visible through a gap:
    // (the long tunnel tile wall is split around the doorway)
    // contents: workbench, generator, lockers, shelves
    M.box(b("wood_planks"), -67.5, 0, -15.5, -63, 0.95, -14.5, {
      s: 1,
      c: [0.55, 0.45, 0.32],
    });
    CB(-67.5, 0, -15.5, -63, 0.95, -14.5, { surface: "wood" });
    M.box(b("metal_painted"), -58, 0, -15.6, -55, 1.6, -13.4, {
      s: 1,
      c: [0.55, 0.45, 0.25],
    });
    M.cyl(b("metal_painted"), -56.5, 1.6, -14.5, 0.3, 0.3, 1.2, 8, {
      c: [0.3, 0.3, 0.3],
    });
    CB(-58, 0, -15.6, -55, 1.6, -13.4);
    M.box(b("emissive_window@lamp"), -61.5, 3.3, -12.2, -60.5, 3.38, -11.8, {
      s: 1,
    });
    A.maintenance = [-61, 0, -12];
    A.maintenance_loot = [-66, 0, -13];

    // ---------------- the derailed train ----------------
    // car A: on the north track inside the station, doors open to the platform (enterable)
    subwayCar(-3.5, -2.6, Math.PI / 2, { open: true, openSide: -1, dy: -0.05 });
    // (car local +X side faces the platform: yaw π/2 maps local x→ world -z? handled by openSide)
    // car B: jackknifed off the rails, nose buried against the platform edge
    subwayCar(-26, -4.2, Math.PI / 2 + 0.12, {
      roll: 0.12,
      brokenDoors: true,
      dy: -0.1,
    });
    // car C: in the east tunnel, tipped on its side
    subwayCar(62, 11.2, Math.PI / 2 - 0.05, {
      roll: 1.35,
      dy: 1.2,
      brokenDoors: true,
    });
    // colliders for the cars (approximate footprints)
    // car A walls: sides at world z = -3.5 ± 1.5, x from -11.5..4.5 ; enterable via the door gaps on the platform side (z = -2)
    const carA = { x0: -11.5, x1: 4.5, z0: -4.1, z1: -1.1 };
    CB(carA.x0, 0, carA.z0 - 0.1, carA.x1, 4, carA.z0 + 0.1, {
      surface: "metal",
    }); // far side wall
    CB(carA.x0 - 0.1, 0, carA.z0, carA.x0 + 0.1, 4, carA.z1, {
      surface: "metal",
    }); // end walls
    CB(carA.x1 - 0.1, 0, carA.z0, carA.x1 + 0.1, 4, carA.z1, {
      surface: "metal",
    });
    CB(carA.x0, 0, carA.z0, carA.x1, PF, carA.z1, { surface: "metal" }); // floor at platform height
    CB(carA.x0, 3.8, carA.z0, carA.x1, 4.3, carA.z1, { surface: "metal" }); // roof
    // platform-side wall pieces between the three door openings (doors at local z -5,0,5 → world x -8.5, -3.5, 1.5)
    const dcs = [-3.5 - 5, -3.5, -3.5 + 5];
    let xa2 = carA.x0;
    for (const dx of dcs) {
      CB(xa2, PF, carA.z1 - 0.1, dx - 0.65, 4, carA.z1 + 0.1, {
        surface: "metal",
      });
      xa2 = dx + 0.65;
    }
    CB(xa2, PF, carA.z1 - 0.1, carA.x1, 4, carA.z1 + 0.1, { surface: "metal" });
    CB(-34.5, 0, -6.2, -17.5, 4, -2.1, { surface: "metal" });
    CB(53, 0, 9.5, 71, 3.4, 14.2, { surface: "metal" });
    A.train = [-3.5, PF, -3.5];
    A.train_b = [-26, 0, -6];
    // spawn points
    A.platform = [0, PF, 4];
    A.mezzanine = [-6, MZ, 8];
    A.booth = [-1, MZ, 0.5];
    A.spawn1 = [-20, PF, 5];
    A.spawn2 = [15, PF, 3];
    A.spawn3 = [36, PF, 6];
    A.spawn4 = [-40, 0, 11.5];
    A.spawn5 = [55, 0, -3.5];
    A.spawn6 = [-70, 0, 11.5];
    A.arrival = [0, MZ, -7];
    A.loot = A.maintenance_loot;
    A.core = [-3.5, PF, -2.6];
    A.car = [-3.5, PF, -2.6];
  }

  M.buildSubway = function () {
    const L = G.LAYOUT;
    const I = L.INTERIORS && L.INTERIORS.subway;
    if (I) S = I.origin;
    if (M.buildSubwayEntrances) M.buildSubwayEntrances(); // street stairwells (60_subway.js)
    M.pushXF(M.mtx(S.x, S.y || 0, S.z, 0));
    buildInterior();
    M.popXF();
    const W = {};
    for (const k in A)
      W[k] = new THREE.Vector3(
        S.x + A[k][0],
        (S.y || 0) + A[k][1],
        S.z + A[k][2],
      );
    M.anchors.subway = W;
    // doors: each street entrance → mezzanine; the mezzanine exit returns to the entrance the player came
    // down (the exit target is re-aimed on every entry; after a load inside the station it is the first one)
    const e0 = M.subwayEntrances[0];
    const exitTarget = {
      x: e0.outside.x,
      y: e0.outside.y,
      z: e0.outside.z,
      yaw: -Math.PI / 2,
    };
    for (const e of M.subwayEntrances) {
      G.world.addDoor({
        pos: e.door,
        label: "42nd Street Subway",
        verb: "Enter",
        radius: 1.3,
        target: {
          x: W.arrival.x,
          y: W.arrival.y,
          z: W.arrival.z,
          yaw: Math.PI,
        },
        sound: "door_open",
        onEnter: () => {
          exitTarget.x = e.outside.x;
          exitTarget.y = e.outside.y;
          exitTarget.z = e.outside.z;
        },
      });
    }
    G.world.addDoor({
      pos: new THREE.Vector3(W.arrival.x, W.arrival.y + 1.2, W.arrival.z - 1.2),
      label: "42nd Street (Times Square)",
      verb: "Exit to",
      radius: 1.6,
      target: exitTarget,
      sound: "door_open",
    });
    // entrance anchors on the street
    M.anchors.subway.entrance = e0.outside.clone();
  };

  // -------------------------------------------------------------------
  // Token booth safe (G.locks). The interior runtime spawns the booth safe at anchor 'booth' and should give it
  // `lock: M.SUBWAY_BOOTH_LOCK`; the code is on the token clerk's tally card on the mezzanine floor (learn on pickup).
  // -------------------------------------------------------------------
  M.SUBWAY_BOOTH_LOCK = {
    id: "map_subway_booth_safe",
    label: "Times Sq – 42 St token booth safe",
    code: "1904",
    hint: "The token clerk's tally card, on the mezzanine floor in front of the booth.",
  };
  const TALLY = {
    id: "map_note_token_tally",
    name: "Token Clerk's Tally Card",
    title: "N.Y.C. TRANSIT AUTHORITY — BOOTH R-151 DAILY TALLY",
    text: "MAR 5 1967 — booth opened 6:40 A.M. Tokens on hand: 1,200.\nSafe combination changed per Supervisor memo: 1-9-0-4 (the year the line opened — he thinks he is clever).\n9:52 — tunnel doors sealed by order. Riders demanding refunds.\nNo refunds.\n\n(below, shakier:)\nStill in the booth. They keep knocking on the glass. Not opening it.",
    at: [-1.2, MZ, 2.7],
  };
  G.on("initDone", () => {
    try {
      if (G.locks && !G.isStub("locks") && G.locks.register)
        G.locks.register(M.SUBWAY_BOOTH_LOCK);
      if (G.isStub("items") || !G.items.define) return;
      if (!(G.items.get && G.items.get(TALLY.id))) {
        G.items.define({
          id: TALLY.id,
          type: "note",
          name: TALLY.name,
          title: TALLY.title,
          text: TALLY.text,
          weight: 0,
          value: 0,
          learn: M.SUBWAY_BOOTH_LOCK.id,
          onRead: () => {
            try {
              if (G.locks && !G.isStub("locks") && G.locks.learn)
                G.locks.learn(M.SUBWAY_BOOTH_LOCK.id, TALLY.name);
            } catch (e) {
              /* optional */
            }
          },
        });
      }
      if (G.items.spawnPickup)
        G.items.spawnPickup(
          TALLY.id,
          1,
          new THREE.Vector3(
            S.x + TALLY.at[0],
            (S.y || 0) + TALLY.at[1] + 0.02,
            S.z + TALLY.at[2],
          ),
          { static: true, keepY: true, yaw: 0.6 },
        );
    } catch (e) {
      G.reportError("map:subway booth note", e);
    }
  });
})();
