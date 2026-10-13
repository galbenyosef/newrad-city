// play-inline-94 01 — range
// Lines 1-908 of readable/play-inline-94.pretty.js (statement-aligned).
/* src/map/49_ruins.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 49 LARGE-SCALE RUINS
 * Set-piece destruction that reads from far away: skyscraper shafts that
 * toppled across avenues and came to rest on the buildings opposite, with
 * debris fans, exposed floor plates and girder stubs; plus a few burnt-out
 * blocks marked by scorch fields. Colliders keep the fallen towers solid
 * where the player can reach them (you can walk underneath the raised end).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  /**
   * A fallen tower shaft: base at (bx,bz) on the ground, lying toward heading
   * `yaw` (THREE convention: local +Z = (sin yaw, cos yaw)), length len, cross
   * section w×w, raised at the far end to height topY (resting on a roof).
   */
  function fallenTower(bx, bz, yaw, len, w, topY, seed) {
    const r = M.rng("fallen" + seed);
    const pitch = -Math.asin(M.clamp(topY / len, 0, 0.9));
    const dirx = Math.sin(yaw),
      dirz = Math.cos(yaw);
    const cx = bx + ((dirx * len) / 2) * Math.cos(pitch),
      cz = bz + ((dirz * len) / 2) * Math.cos(pitch);
    const cy = topY / 2 + w * 0.35;
    const style = r() < 0.5 ? "artdeco" : "office";
    const fmat = "facade/" + style + "/" + (1 + r.int(0, 2));
    const tile = M.facadeTile();
    const m = M.mtx(cx, cy, cz, yaw, pitch, r.range(-0.06, 0.06));
    M.pushXF(m);
    // shaft: four façade walls running along local Z (the tower's former height axis)
    const b = M.buf(fmat, cx, cz, "mid");
    const hw = w / 2,
      hl = len / 2;
    const tint = [0.85, 0.83, 0.78],
      dark = [0.55, 0.53, 0.5];
    // walls: (u along the width, v along the length)
    const walls = [
      [
        [-hw, -hw, -hl],
        [hw, -hw, -hl],
        [hw, -hw, hl],
        [-hw, -hw, hl],
        [0, -1, 0],
      ],
      [
        [hw, hw, -hl],
        [-hw, hw, -hl],
        [-hw, hw, hl],
        [hw, hw, hl],
        [0, 1, 0],
      ],
      [
        [hw, -hw, -hl],
        [hw, hw, -hl],
        [hw, hw, hl],
        [hw, -hw, hl],
        [1, 0, 0],
      ],
      [
        [-hw, hw, -hl],
        [-hw, -hw, -hl],
        [-hw, -hw, hl],
        [-hw, hw, hl],
        [-1, 0, 0],
      ],
    ];
    for (const [p0, p1, p2, p3, n] of walls)
      M.quad(
        b,
        p0,
        p1,
        p2,
        p3,
        n,
        [0, 0, w / tile.w, 0, w / tile.w, len / tile.h, 0, len / tile.h],
        dark,
        tint,
      );
    // snapped base: jagged broken end with floor plates and girders
    const bs = M.buf("concrete", cx, cz, "mid");
    M.quad(
      bs,
      [-hw, -hw, -hl],
      [hw, -hw, -hl],
      [hw, hw, -hl],
      [-hw, hw, -hl],
      [0, 0, -1],
      [0, 0, 3, 0, 3, 3, 0, 3],
      [0.25, 0.25, 0.24],
    );
    // floor plates sticking out of the snapped end (floors are perpendicular to the old height axis)
    for (let k = 1; k < 5; k++) {
      const zz = -hl - r.range(0.3, 2.8);
      M.box(
        bs,
        -hw + 0.3,
        -hw + 0.3,
        zz,
        hw - 0.3 - r.range(0, w * 0.45),
        hw - 0.3 - r.range(0, w * 0.3),
        zz + 0.3,
        { s: 3, c: [0.5, 0.48, 0.45], skip: 0 },
      );
    }
    const gb = M.buf("rust", cx, cz, "mid");
    for (let i = 0; i < 9; i++) {
      const gx = r.range(-hw, hw),
        gy = r.range(-hw, hw);
      M.beam(
        gb,
        gx,
        gy,
        -hl + 0.2,
        gx + r.range(-0.8, 0.8),
        gy + r.range(-0.8, 0.8),
        -hl - r.range(1.5, 4.5),
        0.3,
        0.3,
        { c: [0.75, 0.62, 0.52] },
      );
    }
    // crushed top end (the crown folded against the building it hit)
    M.quad(
      bs,
      [hw, -hw, hl],
      [-hw, -hw, hl],
      [-hw, hw, hl],
      [hw, hw, hl],
      [0, 0, 1],
      [0, 0, 3, 0, 3, 3, 0, 3],
      [0.45, 0.43, 0.4],
    );
    // blown-out windows / gashes along the underside
    for (let i = 0; i < 6; i++) {
      const z0 = r.range(-hl + 4, hl - 8),
        l = r.range(3, 8);
      M.quad(
        M.buf("glass_dirty", cx, cz, "mid"),
        [-hw * 0.7, hw + 0.03, z0],
        [hw * 0.7, hw + 0.03, z0],
        [hw * 0.7, hw + 0.03, z0 + l],
        [-hw * 0.7, hw + 0.03, z0 + l],
        [0, 1, 0],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.05, 0.05, 0.05],
      );
    }
    M.popXF();
    // debris fan at the base and under the resting end
    const tipx = bx + dirx * len * Math.cos(pitch),
      tipz = bz + dirz * len * Math.cos(pitch);
    M.rubblePile(bx, bz, w * 0.9, 3.5, r);
    M.rubblePile(
      bx - dirx * 6 + dirz * 5,
      bz - dirz * 6 - dirx * 5,
      w * 0.5,
      2,
      r,
    );
    M.rubblePile(tipx - dirx * 4, tipz - dirz * 4, w * 0.6, 2.2, r, {
      noCollide: true,
    });
    // scorch marks & rubble decals on the street below
    for (let i = 0; i < 6; i++) {
      const t = r.range(0.1, 0.8);
      M.decal(
        M.buf("my/markings", bx, bz, "detail"),
        bx + dirx * len * t + r.range(-6, 6),
        0.02,
        bz + dirz * len * t + r.range(-6, 6),
        r.range(4, 9),
        r.range(4, 9),
        r() * 6,
        r.pick([M.MARK.SCORCH, M.MARK.DIRT, M.MARK.GRIME]),
      );
    }
    // colliders along the shaft wherever its underside is low enough to matter (< 5 m)
    const steps = Math.ceil(len / 6);
    for (let i = 0; i < steps; i++) {
      const t0 = i / steps,
        t1 = (i + 1) / steps,
        tm = (t0 + t1) / 2;
      const yUnder = cy - (0.5 - tm) * len * Math.sin(-pitch) - hw;
      const yTop = yUnder + w;
      if (yUnder > 4.5) continue;
      const px = bx + dirx * len * tm * Math.cos(pitch),
        pz = bz + dirz * len * tm * Math.cos(pitch);
      M.ocol(px, pz, w, len / steps + 0.5, Math.max(-1, yUnder), yTop, yaw, {
        tag: "ruin",
        surface: "concrete",
      });
    }
    M.fallenTowers = M.fallenTowers || [];
    M.fallenTowers.push({ x: bx, z: bz, tipx, tipz, yaw, len, w });
  }
  M.fallenTower = fallenTower;

  /** Pick a few avenue-facing towers to topple (called by buildCity before building lots). */
  M.planFallenTowers = function (lots) {
    const cands = lots.filter(
      (l) =>
        l.kind === "tower" &&
        (l.front.e || l.front.w) &&
        l.x1 - l.x0 >= 18 &&
        (l.district === "midtown_south" ||
          l.district === "midtown" ||
          l.district === "financial_district") &&
        !(M.HEIGHT_CAPS || []).some(
          (c) =>
            (l.x0 + l.x1) / 2 > c.x0 - 30 &&
            (l.x0 + l.x1) / 2 < c.x1 + 30 &&
            (l.z0 + l.z1) / 2 > c.z0 - 30 &&
            (l.z0 + l.z1) / 2 < c.z1 + 30,
        ),
    );
    const picked = [];
    const r = M.rng("fallenpick");
    const order = cands
      .map((l) => [r(), l])
      .sort((a, b) => a[0] - b[0])
      .map((e) => e[1]);
    for (const l of order) {
      if (picked.length >= 5) break;
      const cz = (l.z0 + l.z1) / 2;
      if (picked.some((p) => Math.abs((p.z0 + p.z1) / 2 - cz) < 210)) continue; // spread them out
      l.fallen = l.front.e ? "e" : "w";
      picked.push(l);
    }
    return picked;
  };
  /** Debris barricades partly blocking a few side streets (routing & cover). */
  function streetBarricades() {
    const L = G.LAYOUT;
    const r = M.rng("barricades");
    const segs = M.intersections || [];
    let n = 0;
    for (let k = 0; k < 400 && n < 8; k++) {
      const q = segs[Math.floor(r() * segs.length)];
      if (!q) break;
      // midpoint of the street block east of this intersection
      const s = q.s;
      const x = q.x + 40;
      if (x > s.x1 - 10 || s.extra) continue;
      if (
        L.siteAt(x, s.z, 12) ||
        M.OPEN_SPACES.some(
          (o) =>
            x > o.x0 - 10 &&
            x < o.x1 + 10 &&
            s.z > o.z0 - 12 &&
            s.z < o.z1 + 12,
        )
      )
        continue;
      if (Math.abs(s.z) < 60 && Math.abs(x) < 60) continue;
      const left = r() < 0.5;
      const z0 = s.z - s.width / 2 + 0.5,
        z1 = s.z + s.width / 2 - 0.5;
      const za = left ? z0 : z0 + 4,
        zb = left ? z1 - 4 : z1; // 4 m gap on one side
      M.rubbleWall(
        x + r.range(-3, 3),
        za,
        x + r.range(-3, 3),
        zb,
        r.range(2.2, 3.4),
        "bar" + k,
      );
      n++;
    }
    M.barricades = n;
  }
  // -------------------------------------------------------------------
  // Street blockades: bus barricades, wreck piles, fallen
  // billboards, military checkpoints — each leaves a gap to squeeze through
  // -------------------------------------------------------------------
  M.blockades = [];
  const WRECK_PAINT = [
    [0.55, 0.7, 0.62],
    [0.78, 0.55, 0.5],
    [0.82, 0.78, 0.62],
    [0.45, 0.52, 0.62],
    [0.6, 0.3, 0.26],
    [0.35, 0.36, 0.34],
  ];
  /** Crude 1950s car hulk (static world geometry): body, cabin, glass, wheels (or rims), collider. */
  function carHulk(x, y, z, yaw, r, o) {
    o = o || {};
    const burnt = o.burnt !== undefined ? o.burnt : r() < 0.4;
    const paint = burnt ? [0.28, 0.24, 0.22] : r.pick(WRECK_PAINT);
    // o.roll: rotation about the car's length axis (π/2 = on its side, π = on its roof); o.pitch: nose up/down
    M.pushXF(M.mtx(x, y, z, yaw, o.roll || 0, o.pitch || 0));
    const b = M.buf(burnt ? "rust" : "metal_painted", x, z),
      g = M.buf("glass_dirty", x, z, "detail"),
      wb = M.buf("metal_painted", x, z, "detail");
    M.box(b, -2.35, 0.35, -0.9, 2.35, 0.95, 0.9, { s: 2, c: paint }); // body
    M.box(b, -2.45, 0.45, -0.85, -2.3, 0.8, 0.85, {
      s: 1,
      c: M.mulc(paint, 0.8),
    }); // bumpers
    M.box(b, 2.3, 0.45, -0.85, 2.45, 0.8, 0.85, {
      s: 1,
      c: M.mulc(paint, 0.8),
    });
    M.obox(b, -0.2, 1.22, 0, 2.2, 0.55, 1.55, 0, {
      s: 2,
      c: M.mulc(paint, 0.95),
    }); // cabin
    for (const sd of [-1, 1])
      M.quad(
        g,
        [-1.2, 1.0, sd * 0.79],
        [0.9, 1.0, sd * 0.79],
        [0.85, 1.45, sd * 0.79],
        [-1.1, 1.45, sd * 0.79],
        [0, 0, sd],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.08, 0.09, 0.09],
      );
    for (const wx of [-1.45, 1.45])
      for (const wz of [-0.82, 0.82]) {
        if (burnt || r() < 0.3)
          M.pipe(
            M.buf("rust", x, z, "detail"),
            wx,
            0.28,
            wz - 0.08,
            wx,
            0.28,
            wz + 0.08,
            0.24,
            6,
            { c: [0.35, 0.28, 0.24] },
          );
        else
          M.pipe(wb, wx, 0.33, wz - 0.12, wx, 0.33, wz + 0.12, 0.33, 8, {
            c: [0.18, 0.18, 0.17],
          });
      }
    M.popXF();
    const onSide = Math.abs(o.roll || 0) > 1;
    M.ocol(x, z, 4.8, onSide ? 1.6 : 1.9, y, y + (onSide ? 1.9 : 1.6), yaw, {
      tag: "wreck",
      surface: "metal",
    });
  }
  M.carHulk = carHulk;
  /** City bus lying on its side across the road (or upright, gutted). */
  function busWreck(x, z, yaw, r, onSide) {
    const L2 = 11,
      W = 2.5,
      H = 2.9;
    const y = onSide ? W / 2 : 0;
    M.pushXF(M.mtx(x, y, z, yaw, 0, onSide ? Math.PI / 2 : 0));
    const yo = onSide ? -W / 2 : 0;
    const paint = r.pick([
      [0.72, 0.74, 0.7],
      [0.8, 0.66, 0.35],
      [0.55, 0.62, 0.7],
    ]);
    const b = M.buf("metal_painted", x, z),
      g = M.buf("glass_dirty", x, z),
      k = M.buf("rust", x, z, "detail");
    M.box(b, -W / 2, yo + 0.5, -L2 / 2, W / 2, yo + 1.4, L2 / 2, {
      s: 2,
      c: M.mulc(paint, 0.85),
    });
    M.box(
      g,
      -W / 2 - 0.01,
      yo + 1.4,
      -L2 / 2 + 0.4,
      W / 2 + 0.01,
      yo + 2.3,
      L2 / 2 - 0.4,
      { s: 2, c: [0.08, 0.09, 0.09], skip: 4 + 8 },
    );
    M.box(b, -W / 2, yo + 2.3, -L2 / 2, W / 2, yo + H, L2 / 2, {
      s: 2,
      c: paint,
    });
    M.box(
      M.buf("paint_red", x, z),
      -W / 2 - 0.02,
      yo + 1.35,
      -L2 / 2,
      W / 2 + 0.02,
      yo + 1.45,
      L2 / 2,
      { s: 1, c: [0.7, 0.2, 0.18], skip: 4 + 8 },
    );
    for (const wz of [-3.6, 3.4])
      for (const wx of [-1.05, 1.05])
        M.pipe(k, wx - 0.12, yo + 0.5, wz, wx + 0.12, yo + 0.5, wz, 0.5, 8, {
          c: [0.25, 0.22, 0.2],
        });
    // rust streaks & a scorched roof patch
    M.box(
      M.buf("rust", x, z),
      -W / 2 + 0.2,
      yo + H,
      -2,
      W / 2 - 0.2,
      yo + H + 0.02,
      1.5,
      { s: 1, c: [0.45, 0.32, 0.25] },
    );
    M.popXF();
    M.ocol(x, z, onSide ? H : W, L2, 0, onSide ? W + 0.2 : H, yaw, {
      tag: "wreck",
      surface: "metal",
    });
  }
  /** A rooftop billboard that came down: frame + face lying tilted on a rubble heap. */
  function fallenBillboard(x, z, yaw, r) {
    const w = r.range(9, 12),
      h = w * 0.5;
    const tilt = r.range(0.3, 0.55); // angle above the ground: it lies back on the heap
    M.pushXF(M.mtx(x, 0, z, yaw, -(Math.PI / 2 - tilt), r.range(-0.08, 0.08)));
    const uv = M.billboardUV
      ? M.billboardUV(r.pick(M.brandList ? M.brandList() : G.LAYOUT.BRANDS))
      : [0, 0, 1, 1];
    const c = [0.62, 0.6, 0.56];
    M.quad(
      M.buf("my/billboards", x, z),
      [w / 2, 0.3, 0.05],
      [-w / 2, 0.3, 0.05],
      [-w / 2, 0.3 + h, 0.05],
      [w / 2, 0.3 + h, 0.05],
      [0, 0, 1],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
      c,
      c,
    );
    const bb = M.buf("metal_painted", x, z);
    M.quad(
      bb,
      [-w / 2, 0.3, -0.1],
      [w / 2, 0.3, -0.1],
      [w / 2, 0.3 + h, -0.1],
      [-w / 2, 0.3 + h, -0.1],
      [0, 0, -1],
      [0, 0, 3, 0, 3, 2, 0, 2],
      [0.45, 0.45, 0.42],
    );
    const fr = M.buf("rust", x, z);
    for (const yy of [0.2, 0.3 + h + 0.1])
      M.beam(fr, -w / 2, yy, 0, w / 2, yy, 0, 0.18, 0.18, {
        c: [0.5, 0.4, 0.34],
      });
    for (let t = -w / 2; t <= w / 2 + 0.01; t += w / 3)
      M.beam(
        fr,
        t,
        0.2,
        -0.3,
        t + r.range(-0.5, 0.5),
        0.3 + h + r.range(0, 2.5),
        -0.4 - r.range(0, 1.5),
        0.16,
        0.16,
        { c: [0.5, 0.4, 0.34] },
      );
    M.popXF();
    M.rubblePile(x, z, w * 0.3, 1.2, r, { noCollide: true });
    const hc = h * Math.cos(tilt);
    M.ocol(
      x - (Math.sin(yaw) * hc) / 2,
      z - (Math.cos(yaw) * hc) / 2,
      w,
      hc + 0.5,
      0,
      Math.max(1.4, h * Math.sin(tilt) * 0.6),
      yaw,
      { tag: "wreck", surface: "metal" },
    );
  }
  /** Military checkpoint line: jersey barriers, sandbags, barbed wire. */
  function checkpoint(x, z, yaw, len, r) {
    const ca = Math.cos(yaw),
      sa = Math.sin(yaw);
    const cb = M.buf("concrete", x, z),
      sb = M.buf("fabric", x, z, "detail"),
      wb = M.buf("rust", x, z, "detail");
    for (let t = -len / 2; t < len / 2 - 1; t += 3.1) {
      if (r() < 0.12) continue;
      const px = x + ca * (t + 1.5),
        pz = z - sa * (t + 1.5);
      const yw = yaw + r.range(-0.15, 0.15);
      M.obox(cb, px, 0.4, pz, 3.0, 0.8, 0.6, yw, {
        s: 3,
        c: [0.72, 0.7, 0.66],
      });
      M.obox(cb, px, 0.08, pz, 3.0, 0.16, 0.8, yw, {
        s: 3,
        c: [0.65, 0.63, 0.6],
      });
      M.ocol(px, pz, 3.0, 0.7, 0, 0.85, yw, {
        tag: "barrier",
        surface: "concrete",
      });
      if (r() < 0.5)
        for (let i = 0; i < 4; i++) {
          const q = t + 0.4 + i * 0.7;
          M.pipe(
            sb,
            x + ca * q - sa * 0.9,
            0.2 + (i % 2) * 0.05,
            z - sa * q - ca * 0.9,
            x + ca * (q + 0.6) - sa * 0.9,
            0.2,
            z - sa * (q + 0.6) - ca * 0.9,
            0.2,
            6,
            { c: [0.55, 0.5, 0.38] },
          );
        }
      // barbed-wire coil on top
      for (let k = 0; k < 6; k++) {
        const q = t + k * 0.5;
        M.pipe(
          wb,
          x + ca * q,
          0.85 + (k % 2) * 0.25,
          z - sa * q,
          x + ca * (q + 0.5),
          0.85 + ((k + 1) % 2) * 0.25,
          z - sa * (q + 0.5),
          0.01,
          3,
          { c: [0.35, 0.3, 0.26] },
        );
      }
    }
    // a sign: MILITARY CHECKPOINT (reuses the road decal atlas' paint only as a stain; the wreck sells it)
    carHulk(x + sa * 4, 0, z + ca * 4, yaw + 0.3, r, { burnt: false });
  }
  function streetBlockades() {
    const L = G.LAYOUT;
    const r = M.rng("blockades");
    const segs = M.intersections || [];
    const kinds = [
      "bus",
      "cars",
      "billboard",
      "cars",
      "checkpoint",
      "bus",
      "cars",
      "billboard",
      "rubble",
      "cars",
      "checkpoint",
      "cars",
      "bus",
      "billboard",
    ];
    let n = 0;
    const used = [];
    for (let k = 0; k < 900 && n < kinds.length; k++) {
      const q = segs[Math.floor(r() * segs.length)];
      if (!q) break;
      const s = q.s;
      const x = q.x + r.range(24, 56);
      if (x > s.x1 - 10 || s.extra) continue;
      if (
        L.siteAt(x, s.z, 16) ||
        L.locationAt(x, s.z) ||
        M.OPEN_SPACES.some(
          (o) =>
            x > o.x0 - 12 &&
            x < o.x1 + 12 &&
            s.z > o.z0 - 14 &&
            s.z < o.z1 + 14,
        )
      )
        continue;
      if (Math.abs(s.z) < 70 && Math.abs(x) < 70) continue;
      if (L.inPark(x, s.z) || !L.isManhattan(x, s.z)) continue;
      // never on a Broadway crossing / roundabout (the gap would not line up with the diagonal)
      if (
        L.onBroadway(x, s.z) ||
        L.onBroadway(x - 9, s.z) ||
        L.onBroadway(x + 9, s.z) ||
        (L.circleAt && L.circleAt(x, s.z))
      )
        continue;
      if (L.cryoExit && Math.hypot(x - L.cryoExit.x, s.z - L.cryoExit.z) < 120)
        continue; // keep the start area outside the Municipal Building clear
      if (
        (M.subwayEntrances || []).some(
          (e) => Math.hypot(e.cx - x, e.cz - s.z) < 30,
        )
      )
        continue;
      if (used.some((u) => Math.hypot(u[0] - x, u[1] - s.z) < 110)) continue;
      const kind = kinds[n];
      const left = r() < 0.5;
      const z0 = s.z - s.width / 2 + 0.6,
        z1 = s.z + s.width / 2 - 0.6;
      // leave a 3.5–4.5 m gap on one side
      const gap = r.range(3.5, 4.5);
      const za = left ? z0 + gap : z0,
        zb = left ? z1 : z1 - gap;
      const zc = (za + zb) / 2,
        span = zb - za;
      if (kind === "bus") busWreck(x, zc, r.range(-0.25, 0.25), r, r() < 0.6);
      else if (kind === "cars") {
        // a shoved-together wreck pile: 3–5 hulks, some on their roofs / sides, one stacked
        const cnt = r.int(3, 5);
        for (let i = 0; i < cnt; i++) {
          const t = za + ((i + 0.5) * span) / cnt;
          const roll =
            r() < 0.25 ? Math.PI : r() < 0.2 ? Math.PI / 2 : r.range(-0.1, 0.1);
          carHulk(
            x + r.range(-1.5, 1.5),
            Math.abs(roll) > 1 && Math.abs(roll) < 2
              ? 0.95
              : roll > 3
                ? 1.6
                : 0,
            t,
            r.range(-0.45, 0.45) + (r() < 0.5 ? 0 : Math.PI),
            r,
            { roll },
          );
        }
        if (r() < 0.6)
          carHulk(
            x + r.range(-0.5, 0.5),
            1.62,
            zc + r.range(-1, 1),
            r.range(0, Math.PI),
            r,
            { roll: r.range(-0.3, 0.3), pitch: r.range(-0.2, 0.2) },
          );
        M.rubblePile(x + 2.5, zc, span * 0.25, 0.8, r, { noCollide: true });
      } else if (kind === "billboard")
        fallenBillboard(x, zc, r.range(-0.3, 0.3) + (left ? 0 : Math.PI), r);
      else if (kind === "checkpoint") checkpoint(x, zc, Math.PI / 2, span, r);
      else
        M.rubbleWall(
          x + r.range(-3, 3),
          za,
          x + r.range(-3, 3),
          zb,
          r.range(2.2, 3.4),
          "blk" + k,
        );
      // scorch & oil on the asphalt around it
      for (let i = 0; i < 4; i++)
        M.decal(
          M.buf("my/markings", x, s.z, "detail"),
          x + r.range(-7, 7),
          0.02,
          s.z + r.range(-4, 4),
          r.range(3, 6),
          r.range(3, 6),
          r() * 6,
          r.pick([M.MARK.SCORCH, M.MARK.STAIN, M.MARK.DIRT]),
        );
      M.blockades.push({ x, z: s.z, kind, gapSide: left ? "n" : "s" });
      used.push([x, s.z]);
      n++;
    }
  }
  /**
   * Collapsed façades: in front of ruined street fronts a whole slab of façade has peeled off and lies
   * slumped against the rubble, spilling brick & rebar over the sidewalk and into the gutter.
   * Burnt lots get scorch bands on the pavement.
   */
  function facadeSpills() {
    const r = M.rng("spills");
    let n = 0;
    for (const lot of M.lots || []) {
      const fr = {
        n: lot.front.n || !!lot.faceN,
        s: lot.front.s || !!lot.faceS,
        e: lot.front.e,
        w: lot.front.w,
      };
      if (lot.burnt) {
        for (const k of ["n", "s", "e", "w"]) {
          if (!fr[k] || r() < 0.5) continue;
          const alongX = k === "n" || k === "s";
          const span = alongX ? lot.x1 - lot.x0 : lot.z1 - lot.z0;
          for (let t = r.range(1, 3); t < span - 2; t += r.range(4, 8)) {
            const x = alongX
                ? lot.x0 + t
                : k === "e"
                  ? lot.x1 + 1.2
                  : lot.x0 - 1.2,
              z = alongX
                ? k === "s"
                  ? lot.z1 + 1.2
                  : lot.z0 - 1.2
                : lot.z0 + t;
            M.decal(
              M.buf("my/markings", x, z, "fine"),
              x,
              M.SIDEWALK_Y + 0.016,
              z,
              r.range(2, 3.5),
              r.range(2.5, 4),
              alongX ? Math.PI / 2 : 0,
              M.MARK.SCORCH,
              M.mulc(M.WHITE, r.range(0.7, 1)),
            );
          }
        }
      }
      if (
        !lot.ruined ||
        lot.kind === "collapsed" ||
        lot.fallen ||
        r() > 0.55 ||
        n > 160
      )
        continue;
      const sides = ["n", "s", "e", "w"].filter((k) => fr[k]);
      if (!sides.length) continue;
      const k = r.pick(sides);
      const alongX = k === "n" || k === "s";
      const nx = k === "e" ? 1 : k === "w" ? -1 : 0,
        nz = k === "s" ? 1 : k === "n" ? -1 : 0;
      const span = alongX ? lot.x1 - lot.x0 : lot.z1 - lot.z0;
      if (span < 7) continue;
      const w = Math.min(span - 2, r.range(5, 10)),
        hh = r.range(5, 9);
      const t = r.range(w / 2 + 0.5, span - w / 2 - 0.5);
      const bx = alongX ? lot.x0 + t : k === "e" ? lot.x1 : lot.x0,
        bz = alongX ? (k === "s" ? lot.z1 : lot.z0) : lot.z0 + t;
      if (G.LAYOUT.siteAt(bx + nx * 3, bz + nz * 3, 4)) continue;
      // the slab: leaning out from the wall base at ~35–55°, its top resting in the gutter
      const lean = r.range(0.6, 0.95);
      const out = Math.sin(lean) * hh,
        up = Math.cos(lean) * hh;
      const rx = nz,
        rz = -nx;
      const P = (u, o2, y) => [bx + rx * u + nx * o2, y, bz + rz * u + nz * o2];
      const style =
        lot.district === "brooklyn"
          ? "warehouse"
          : r() < 0.6
            ? "apartment"
            : "office";
      const fm =
        "facade/" +
        style +
        "/" +
        (M.chunkVariant ? M.chunkVariant(style, bx, bz) : 1);
      const tile = M.facadeTile();
      const fb = M.buf(fm, bx, bz);
      const c0 = [0.62, 0.6, 0.56],
        c1 = [0.8, 0.77, 0.72];
      const p0 = P(-w / 2, 0.4, 0.3),
        p1 = P(w / 2, 0.4, 0.3),
        p2 = P(w / 2 + r.range(-0.8, 0.8), 0.4 + out, 0.3 + up * 0.35),
        p3 = P(-w / 2 + r.range(-0.8, 0.8), 0.4 + out, 0.3 + up * 0.35);
      const n2 = [nx * Math.cos(lean), Math.sin(lean), nz * Math.cos(lean)];
      M.quad(
        fb,
        p0,
        p1,
        p2,
        p3,
        n2,
        [0, 0, w / tile.w, 0, w / tile.w, hh / tile.h, 0, hh / tile.h],
        c0,
        c1,
      );
      // slab thickness & broken underside
      const cb = M.buf("concrete", bx, bz);
      M.quad(
        cb,
        [p0[0], p0[1] - 0.35, p0[2]],
        [p1[0], p1[1] - 0.35, p1[2]],
        [p2[0], p2[1] - 0.35, p2[2]],
        [p3[0], p3[1] - 0.35, p3[2]],
        [-n2[0], -n2[1], -n2[2]],
        [0, 0, 2, 0, 2, 2, 0, 2],
        [0.35, 0.34, 0.32],
      );
      for (const [a2, b2] of [
        [p1, p2],
        [p3, p0],
      ])
        M.quad(
          cb,
          a2,
          b2,
          [b2[0], b2[1] - 0.35, b2[2]],
          [a2[0], a2[1] - 0.35, a2[2]],
          [a2 === p1 ? rx : -rx, 0, a2 === p1 ? rz : -rz],
          [0, 0, 2, 0, 2, 0.2, 0, 0.2],
          [0.4, 0.39, 0.36],
        );
      // rebar & brick spill at its foot, debris in the gutter
      const gb = M.buf("rust", bx, bz, "detail");
      for (let i = 0; i < 7; i++) {
        const u = r.range(-w / 2, w / 2);
        const q = P(u, 0.4 + out, 0.3 + up * 0.35);
        M.beam(
          gb,
          q[0],
          q[1],
          q[2],
          q[0] + nx * r.range(0.3, 1.2) + rx * r.range(-0.3, 0.3),
          q[1] + r.range(0.2, 1.1),
          q[2] + nz * r.range(0.3, 1.2) + rz * r.range(-0.3, 0.3),
          0.03,
          0.03,
          { c: [0.6, 0.45, 0.35] },
        );
      }
      const sp = P(0, out + 1.2, 0);
      M.rubblePile(sp[0], sp[2], Math.min(3.2, w * 0.4), r.range(0.6, 1.1), r, {
        noCollide: true,
      });
      M.debrisDrift &&
        M.debrisDrift(
          sp[0] + nx * 1.4,
          sp[2] + nz * 1.4,
          w * 0.9,
          1.6,
          0.35,
          alongX ? Math.PI / 2 : 0,
          r,
          {},
        );
      M.ocol(
        bx + nx * (out / 2 + 0.4),
        bz + nz * (out / 2 + 0.4),
        alongX ? w : out + 0.8,
        alongX ? out + 0.8 : w,
        0,
        Math.max(0.8, up * 0.3),
        0,
        { tag: "rubble", surface: "rubble" },
      );
      n++;
    }
    M.facadeSpillCount = n;
  }
  M.buildRuins = function () {
    const lots = M.lots || [];
    const r = M.rng("ruins");
    streetBarricades();
    try {
      streetBlockades();
    } catch (e) {
      G.reportError("map:blockades", e);
    }
    try {
      facadeSpills();
    } catch (e) {
      G.reportError("map:facadeSpills", e);
    }
    let i = 0;
    for (const l of lots) {
      if (!l.fallen) continue;
      const sgn = l.fallen === "e" ? 1 : -1;
      const bx = sgn > 0 ? l.x1 - 4 : l.x0 + 4,
        bz = (l.z0 + l.z1) / 2;
      const yaw = (sgn * Math.PI) / 2 + r.range(-0.22, 0.22);
      const len = r.range(62, 76),
        w = Math.min(16, l.z1 - l.z0 - 4, l.x1 - l.x0 - 2);
      const tipx = bx + Math.sin(yaw) * len,
        tipz = bz + Math.cos(yaw) * len;
      // rest the crown on whatever building stands at the landing spot (or on the street)
      let top = w * 0.5;
      for (const o of lots)
        if (
          o !== l &&
          tipx > o.x0 &&
          tipx < o.x1 &&
          tipz > o.z0 &&
          tipz < o.z1 &&
          o.h > 6
        ) {
          top = Math.min(o.h + w * 0.5, len * 0.55);
          break;
        }
      if (
        G.LAYOUT.rectOverlapsSite(
          Math.min(bx, tipx) - w,
          Math.min(bz, tipz) - w,
          Math.max(bx, tipx) + w,
          Math.max(bz, tipz) + w,
          2,
        )
      )
        continue;
      fallenTower(bx, bz, yaw, len, w, top, i++);
    }
  };
})();

/* ---------------------------------------------------------------------
 * Queensboro Bridge (59th Street Bridge) — visual skyline set piece over
 * the East River: stone piers, cantilever truss with pointed finials,
 * and a collapsed centre span. Far layer (no colliders: it spans water
 * beyond the playable shore and ends at the world edge in Queens).
 * ------------------------------------------------------------------- */
