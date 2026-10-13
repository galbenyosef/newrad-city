// play-inline-212 02 — math
// Lines 13-341 of readable/play-inline-212.pretty.js (statement-aligned).
  const PH = G._pharbor;
  const U = G.util;
  const TAU = Math.PI * 2;

  // extra surface materials (textures-module surfaces, tinted)
  Object.assign(PH.MAT_DEFS, {
    grass: { src: "grass_dead", uv: 5 },
    soil: { src: "dirt", uv: 3, tint: 0x8a7866 },
    bark: { src: "wood_rotten", uv: 1.5, tint: 0x6a5c4e },
    foliage: { color: 0x5e6a38, rough: 0.95, plain: true },
    fruit: {
      color: 0x9a6a2a,
      emissive: 0x3a2206,
      emissiveIntensity: 0.25,
      rough: 0.7,
      plain: true,
      noShadow: true,
    },
  });

  /** Rectangle ∩ disk as a polygon (boundary points outside the disk are projected onto it). */
  PH.clipRectDisk = function (x0, z0, x1, z1, cx, cz, R, step) {
    step = step || 1.0;
    const raw = [];
    const edge = (ax, az, bx, bz) => {
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / step));
      for (let i = 0; i < n; i++)
        raw.push([ax + ((bx - ax) * i) / n, az + ((bz - az) * i) / n]);
    };
    edge(x0, z0, x1, z0);
    edge(x1, z0, x1, z1);
    edge(x1, z1, x0, z1);
    edge(x0, z1, x0, z0);
    const out = [];
    for (const p of raw) {
      const dx = p[0] - cx,
        dz = p[1] - cz,
        d = Math.hypot(dx, dz);
      const q = d > R ? [cx + (dx / d) * R, cz + (dz / d) * R] : p;
      const l = out[out.length - 1];
      if (!l || Math.hypot(l[0] - q[0], l[1] - q[1]) > 0.05) out.push(q);
    }
    return out;
  };

  /** Flat (or slightly raised, `opts.thick`) ground polygon at height y. pts: [[x,z],...] (world). */
  PH.groundPoly = function (b, key, pts, y, opts) {
    opts = opts || {};
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], -p[1])));
    let geo;
    if (opts.thick) {
      geo = new THREE.ExtrudeGeometry(sh, {
        depth: opts.thick,
        bevelEnabled: false,
        curveSegments: 1,
      });
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, y - opts.thick, 0);
    } else {
      geo = new THREE.ShapeGeometry(sh);
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, y, 0);
    }
    return b.add(key, geo, Object.assign({ grime: 0.35, noAO: true }, opts));
  };

  /** Curb stones along a polyline (closed by default). */
  PH.curb = function (b, pts, key, w, h, opts) {
    opts = opts || {};
    const n = pts.length,
      closed = opts.closed !== false;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = pts[i],
        c = pts[(i + 1) % n];
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      if (len < 0.05) continue;
      const ry = Math.atan2(-(c[1] - a[1]), c[0] - a[0]);
      b.box(
        key || "granite",
        (a[0] + c[0]) / 2,
        opts.y || 0,
        (a[1] + c[1]) / 2,
        len + 0.02,
        h || 0.18,
        w || 0.22,
        { ry, seg: false, grime: 0.55 },
      );
    }
  };

  /** Bare dead tree (trunk + two orders of branches). Returns nothing; adds a trunk collider. */
  PH.deadTree = function (b, x, y, z, h, seed, opts) {
    opts = opts || {};
    const r = PH.rng("tree" + (seed === undefined ? x * 7 + z * 3 : seed));
    const key = opts.key || "bark";
    const rad = opts.r || h * 0.035 + 0.08;
    const lean = [(r() - 0.5) * 0.18, (r() - 0.5) * 0.18];
    // trunk in 3 kinked segments
    let p = PH.v3(x, y - 0.2, z),
      rr = rad;
    const pts = [p.clone()];
    for (let i = 1; i <= 3; i++) {
      const q = PH.v3(
        x + (lean[0] * h * i) / 3 + (r() - 0.5) * 0.3,
        y + (h * 0.62 * i) / 3,
        z + (lean[1] * h * i) / 3 + (r() - 0.5) * 0.3,
      );
      b.rod(key, p, q, rr, 7, { r2: rr * 0.8 });
      p = q;
      rr *= 0.8;
      pts.push(q.clone());
    }
    // root flare
    b.cyl(key, x, y - 0.1, z, rad * 1.1, rad * 1.8, 0.5, 7, { hSeg: 1 });
    // main branches
    const nb = 3 + ((r() * 3) | 0);
    for (let k = 0; k < nb; k++) {
      const from = pts[1 + ((r() * 3) | 0)] || p;
      const a = r() * TAU,
        up = 0.45 + r() * 0.5,
        len = h * (0.22 + r() * 0.2);
      const q = PH.v3(
        from.x + Math.cos(a) * len * (1 - up * 0.5),
        from.y + len * up,
        from.z + Math.sin(a) * len * (1 - up * 0.5),
      );
      const br = rad * (0.45 + r() * 0.2);
      b.rod(key, from, q, br, 5, { r2: br * 0.45 });
      // twigs
      const nt = 2 + ((r() * 3) | 0);
      for (let t = 0; t < nt; t++) {
        const a2 = a + (r() - 0.5) * 1.6,
          l2 = len * (0.35 + r() * 0.35);
        const s = PH.v3(
          from.x + (q.x - from.x) * (0.5 + r() * 0.5),
          from.y + (q.y - from.y) * (0.5 + r() * 0.5),
          from.z + (q.z - from.z) * (0.5 + r() * 0.5),
        );
        b.rod(
          key,
          s,
          PH.v3(
            s.x + Math.cos(a2) * l2,
            s.y + l2 * (0.2 + r() * 0.6),
            s.z + Math.sin(a2) * l2,
          ),
          br * 0.4,
          4,
          { r2: 0.015 },
        );
      }
    }
    if (opts.collide !== false)
      PH.col(x, z, rad * 2.4, rad * 2.4, y, y + h * 0.6, 0, {
        walkable: false,
      });
  };

  /** Dry-weed alpha texture + material. */
  let weedKey = null;
  PH.weedMat = function () {
    if (weedKey) return weedKey;
    const tex = PH.canvasTex("ph_weeds", 256, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const r = PH.rng("weeds");
      for (let i = 0; i < 150; i++) {
        const x = 12 + r() * (w - 24),
          top = h * (0.08 + r() * 0.55),
          bend = (r() - 0.5) * 50;
        const c = [
          [150, 132, 82],
          [120, 110, 66],
          [96, 92, 52],
          [170, 150, 96],
          [88, 80, 50],
        ][(r() * 5) | 0];
        ctx.strokeStyle = "rgb(" + c.join(",") + ")";
        ctx.lineWidth = 1.5 + r() * 2.2;
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.quadraticCurveTo(x + bend * 0.3, (h + top) / 2, x + bend, top);
        ctx.stroke();
        if (r() < 0.2) {
          ctx.fillStyle = "rgb(" + c.map((v) => v + 20).join(",") + ")";
          ctx.beginPath();
          ctx.ellipse(x + bend, top, 3, 9, bend * 0.01, 0, TAU);
          ctx.fill();
        }
      }
    });
    weedKey = PH.texMat("ph_weeds", tex, {
      double: true,
      transparent: true,
      rough: 1,
    });
    return weedKey;
  };
  /** A clump of weeds (two crossed alpha quads). */
  PH.tuft = function (b, x, y, z, s, seed) {
    const k = PH.weedMat();
    const a =
      U.hash2(Math.floor(x * 3.1), Math.floor(z * 2.7) + (seed || 0)) * Math.PI;
    const w = 1.1 * s,
      hh = 0.7 * s;
    b.quad(k, x, y + hh / 2 - 0.02, z, w, hh, { ry: a });
    b.quad(k, x, y + hh / 2 - 0.02, z, w, hh, { ry: a + Math.PI / 2 });
  };
  /** Scatter tufts inside a polygon (rejection sampling), density per m². */
  PH.tuftsIn = function (b, pts, y, density, seed, scale) {
    let x0 = 1e9,
      x1 = -1e9,
      z0 = 1e9,
      z1 = -1e9;
    for (const p of pts) {
      x0 = Math.min(x0, p[0]);
      x1 = Math.max(x1, p[0]);
      z0 = Math.min(z0, p[1]);
      z1 = Math.max(z1, p[1]);
    }
    const r = PH.rng("tufts" + seed);
    const n = Math.round((x1 - x0) * (z1 - z0) * density);
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0),
        z = z0 + r() * (z1 - z0);
      if (!PH.inPoly(x, z, pts)) continue;
      PH.tuft(b, x, y, z, (scale || 1) * (0.6 + r() * 0.8), i);
    }
  };
  PH.inPoly = function (x, z, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i],
        c = pts[j];
      if (
        a[1] > z !== c[1] > z &&
        x < ((c[0] - a[0]) * (z - a[1])) / (c[1] - a[1] + 1e-9) + a[0]
      )
        inside = !inside;
    }
    return inside;
  };

  /** Scrap shack: corrugated/rust walls, lean-to roof, a doorway on local -Z (front). Local frame (x,z,ry). */
  PH.shack = function (b, x, z, ry, w, d, h, opts) {
    opts = opts || {};
    const r = PH.rng("shack" + x + z);
    const P = (lx, lz) => PH.rot(x, z, ry, lx, lz);
    const keys = ["corrugated", "rust", "panel", "rotten", "metal"];
    const panel = (lx0, lz0, lx1, lz1, hh) => {
      const [ax, az] = P(lx0, lz0),
        [cx, cz] = P(lx1, lz1);
      const len = Math.hypot(cx - ax, cz - az),
        a = Math.atan2(-(cz - az), cx - ax);
      const n = Math.max(1, Math.round(len / 1.1));
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        b.box(
          keys[(r() * keys.length) | 0],
          ax + (cx - ax) * t,
          0,
          az + (cz - az) * t,
          len / n + 0.12,
          hh * (0.94 + r() * 0.1),
          0.07,
          {
            ry: a + (r() - 0.5) * 0.05,
            seg: false,
            c: [0xffffff, 0xd0c0a8, 0xa89c88][(r() * 3) | 0],
          },
        );
      }
    };
    const hf = h,
      hb = h * 0.78;
    // back, sides, front with a door gap
    panel(-w / 2, d / 2, w / 2, d / 2, hb);
    panel(-w / 2, -d / 2, -w / 2, d / 2, hb);
    panel(w / 2, -d / 2, w / 2, d / 2, hb);
    panel(-w / 2, -d / 2, -0.55, -d / 2, hf);
    panel(0.55, -d / 2, w / 2, -d / 2, hf);
    const [lx, lz] = P(0, -d / 2);
    b.box("rust", lx, 2.0, lz, 1.2, hf - 2.0, 0.07, { ry, seg: false });
    // corner posts
    for (const [px, pz] of [
      [-w / 2, -d / 2],
      [w / 2, -d / 2],
      [-w / 2, d / 2],
      [w / 2, d / 2],
    ]) {
      const [qx, qz] = P(px, pz);
      b.box("rotten", qx, 0, qz, 0.14, (pz < 0 ? hf : hb) + 0.1, 0.14, {
        ry,
        seg: false,
      });
    }
    // lean-to roof (slopes to the back)
    const [rx, rz] = P(0, 0);
    const pitch = Math.atan2(hf - hb, d);
    b.box(
      "corrugated",
      rx,
      (hf + hb) / 2 - 0.02,
      rz,
      w + 0.6,
      0.06,
      Math.hypot(d, hf - hb) + 0.7,
      { ry, rx: -pitch, seg: false, c: 0xb8a890 },
    );
    for (let i = 0; i < 3; i++) {
      const [tx, tz] = P((r() - 0.5) * w, (r() - 0.5) * d);
      b.box("rubber", tx, (hf + hb) / 2 + 0.03, tz, 0.6, 0.12, 0.6, {
        ry: r() * 3,
        seg: false,
      });
    } // tyres holding the roof down
    // colliders (walls; the doorway stays open)
    const colW = (lx0, lz0, lx1, lz1, hh) => {
      const [ax, az] = P(lx0, lz0),
        [cx, cz] = P(lx1, lz1);
      PH.colWall(ax, az, cx, cz, 0.2, 0, hh);
    };
    colW(-w / 2, d / 2, w / 2, d / 2, hb);
    colW(-w / 2, -d / 2, -w / 2, d / 2, hb);
    colW(w / 2, -d / 2, w / 2, d / 2, hb);
    colW(-w / 2, -d / 2, -0.6, -d / 2, hf);
    colW(0.6, -d / 2, w / 2, -d / 2, hf);
  };

  /** Row of tilled soil with gnarlberry / potato plants. */
