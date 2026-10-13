// play-inline-82 03 — range
// Lines 591-940 of readable/play-inline-82.pretty.js (statement-aligned).
  function roadPoint(r) {
    // random point on a road (weighted by length)
    const R = M.roads;
    if (!R._w) {
      R._w = [];
      let acc = 0;
      for (const a of R.avenues) {
        acc += a.z1 - a.z0;
        R._w.push([acc, "a", a]);
      }
      for (const s of R.streets) {
        acc += s.x1 - s.x0;
        R._w.push([acc, "s", s]);
      }
      R._tot = acc;
    }
    const k = r() * R._tot;
    for (const e of R._w)
      if (k <= e[0]) {
        if (e[1] === "a") {
          const a = e[2];
          return [
            a.x + r.range(-a.road / 2 + 0.6, a.road / 2 - 0.6),
            r.range(a.z0, a.z1),
            "a",
            a,
          ];
        }
        const s = e[2];
        return [
          r.range(s.x0, s.x1),
          s.z + r.range(-s.road / 2 + 0.6, s.road / 2 - 0.6),
          "s",
          s,
        ];
      }
    return [0, 0, "a", R.avenues[0]];
  }
  function buildDamage() {
    const L = G.LAYOUT;
    const r = M.rng("roaddamage");
    const decalCells = [
      MK.CRACKS,
      MK.CRACKS,
      MK.POTHOLE,
      MK.STAIN,
      MK.STAIN,
      MK.PUDDLE,
      MK.DIRT,
      MK.LITTER,
      MK.GRIME,
    ];
    for (let i = 0; i < 1500; i++) {
      const [x, z] = roadPoint(r);
      if (L.siteAt(x, z, 0) && L.siteAt(x, z, 0).closesStreets) continue;
      const cell = r.pick(decalCells);
      const s = cell === MK.POTHOLE ? r.range(0.8, 2.2) : r.range(1.5, 5);
      M.decal(
        M.buf("my/markings", x, z, "fine"),
        x,
        Y_MARK + 0.002,
        z,
        s * r.range(0.8, 1.4),
        s,
        r() * 6,
        cell,
        M.mulc([1, 1, 1], r.range(0.7, 1)),
      );
    }
    // sidewalk grime/cracks/litter on raised pieces
    for (let i = 0; i < 1400; i++) {
      const [x, z, kind, rd] = roadPoint(r);
      let px = x,
        pz = z;
      if (kind === "a")
        px =
          rd.x +
          (r() < 0.5 ? -1 : 1) * r.range(rd.road / 2 + 0.6, rd.width / 2 - 0.4);
      else
        pz =
          rd.z +
          (r() < 0.5 ? -1 : 1) * r.range(rd.road / 2 + 0.6, rd.width / 2 - 0.4);
      if (M.rasterAt(px, pz) !== M.RC.RAISED) continue;
      const cell = r.pick([
        MK.CRACKS,
        MK.STAIN,
        MK.LITTER,
        MK.DIRT,
        MK.LEAVES,
        MK.GRIME,
      ]);
      M.decal(
        M.buf("my/markings", px, pz, "fine"),
        px,
        SY + 0.012,
        pz,
        r.range(1.2, 3),
        r.range(1.2, 3),
        r() * 6,
        cell,
        M.mulc([1, 1, 1], r.range(0.7, 1)),
      );
    }
    // manholes
    const mb = (x, z) => M.buf("metal_panel", x, z, "detail");
    for (let i = 0; i < 360; i++) {
      const [x, z] = roadPoint(r);
      if (L.siteAt(x, z, 1)) continue;
      M.cyl(mb(x, z), x, -0.02, z, 0.42, 0.42, 0.045, 12, {
        capTop: true,
        c: [0.45, 0.4, 0.36],
        cy: [0.55, 0.5, 0.45],
      });
      M.cyl(mb(x, z), x, -0.02, z, 0.5, 0.5, 0.03, 12, {
        capTop: true,
        c: [0.35, 0.34, 0.32],
      });
      M.manholes.push({ x, y: 0.03, z, steam: r() < 0.22 });
    }
    // uplifted / broken asphalt slabs (small obstacles) along roads
    for (let i = 0; i < 90; i++) {
      const [x, z, kind] = roadPoint(r);
      if (L.siteAt(x, z, 2)) continue;
      brokenSlabs(x, z, r.range(3, 6), r, kind === "a" ? 0 : Math.PI / 2);
    }
    // bomb craters (a few radioactive)
    for (let i = 0; i < 26; i++) {
      const [x, z] = roadPoint(r);
      if (L.siteAt(x, z, 8)) continue;
      crater(x, z, r.range(3.5, 7), r, i % 5 === 0);
    }
    // rubble drifts on sidewalks & in the gutter
    for (let i = 0; i < 160; i++) {
      const [x, z, kind, rd] = roadPoint(r);
      let px = x,
        pz = z;
      if (kind === "a")
        px =
          rd.x +
          (r() < 0.5 ? -1 : 1) * r.range(rd.road / 2 - 1.5, rd.width / 2 - 0.5);
      else
        pz =
          rd.z +
          (r() < 0.5 ? -1 : 1) * r.range(rd.road / 2 - 1.2, rd.width / 2 - 0.5);
      if (L.siteAt(px, pz, 2)) continue;
      M.rubblePile(px, pz, r.range(1.2, 2.6), r.range(0.4, 1.1), r, {
        layer: "detail",
        noCollide: true,
      });
    }
  }
  function brokenSlabs(x, z, size, r, yaw) {
    const b = M.buf("asphalt", x, z, "main");
    const bd = M.buf("dirt", x, z, "detail");
    M.decal(
      M.buf("my/markings", x, z, "fine"),
      x,
      Y_MARK + 0.004,
      z,
      size * 1.4,
      size * 1.2,
      r() * 6,
      MK.DIRT,
    );
    const n = r.int(2, 4);
    for (let i = 0; i < n; i++) {
      const px = x + r.range(-size / 2, size / 2),
        pz = z + r.range(-size / 2, size / 2);
      const w = r.range(1.2, 2.6),
        d = r.range(1.2, 2.4);
      const tilt = r.range(0.15, 0.45);
      M.obox(
        b,
        px,
        0.1 + Math.sin(tilt) * w * 0.3,
        pz,
        w,
        0.28,
        d,
        yaw + r.range(-0.6, 0.6),
        {
          roll: tilt * (r() < 0.5 ? 1 : -1),
          pitch: r.range(-0.2, 0.2),
          s: 3,
          c: [0.85, 0.85, 0.82],
        },
      );
      M.obox(bd, px, 0.02, pz, w * 0.8, 0.2, d * 0.8, r() * 3, {
        s: 2,
        c: [0.7, 0.6, 0.5],
      });
      if (tilt > 0.3)
        M.box3(
          px - w * 0.4,
          0,
          pz - d * 0.4,
          px + w * 0.4,
          0.5 + Math.sin(tilt) * w * 0.5,
          pz + d * 0.4,
          { tag: "rubble", surface: "rubble" },
        );
    }
  }
  function crater(x, z, rds, r, hot) {
    M.craters.push({ x, z, r: rds, hot });
    M.decal(
      M.buf("my/markings", x, z, "detail"),
      x,
      Y_MARK + 0.006,
      z,
      rds * 2.6,
      rds * 2.6,
      r() * 6,
      MK.SCORCH,
      [1, 1, 1],
    );
    M.decal(
      M.buf("my/markings", x, z, "detail"),
      x,
      Y_MARK + 0.008,
      z,
      rds * 1.4,
      rds * 1.4,
      r() * 6,
      MK.POTHOLE,
      [0.8, 0.8, 0.8],
    );
    // rim of uplifted asphalt plates
    const b = M.buf("asphalt", x, z, "main");
    const n = Math.round(rds * 2.2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r.range(-0.2, 0.2);
      const d = rds * r.range(0.8, 1.05);
      const px = x + Math.cos(a) * d,
        pz = z + Math.sin(a) * d;
      const w = r.range(1.2, 2.4);
      // plate tilted outward (like a peeled rim)
      M.obox(b, px, 0.25, pz, w, 0.3, r.range(1, 1.8), -a + Math.PI / 2, {
        pitch: 0,
        roll: 0,
        s: 3,
        c: [0.8, 0.8, 0.78],
      });
      M.obox(
        b,
        px + Math.cos(a) * 0.3,
        0.3,
        pz + Math.sin(a) * 0.3,
        r.range(0.8, 1.6),
        0.25,
        w,
        Math.atan2(Math.cos(a), Math.sin(a)),
        { pitch: -r.range(0.3, 0.7), s: 3, c: [0.75, 0.75, 0.72] },
      );
    }
    // dirt bowl
    const bd = M.buf("dirt", x, z, "main");
    M.cyl(bd, x, -0.1, z, rds * 0.95, rds * 0.4, 0.15, 12, {
      capTop: true,
      c: [0.55, 0.45, 0.35],
      cy: [0.45, 0.38, 0.3],
    });
    M.rubblePile(x + r.range(-1, 1), z + r.range(-1, 1), rds * 0.35, 0.5, r, {
      layer: "detail",
      noCollide: true,
    });
    // rim collider ring (low; walkable)
    if (hot) {
      G.world.addRadSource({ x, y: 0.5, z, radius: rds * 1.6, strength: 2.5 });
      // glowing puddle of irradiated goo
      M.disc(
        M.buf("neon_green@lampg", x, z, "main"),
        x + r.range(-0.5, 0.5),
        0.06,
        z + r.range(-0.5, 0.5),
        rds * 0.25,
        10,
        1,
        [1, 1, 1],
        2,
      );
    }
  }
  M.crater = crater;

  // -------------------------------------------------------------------
  // Street name signs
  // -------------------------------------------------------------------
  function signPole(x, z, aveName, stName, r, fallen) {
    const b = M.buf("metal_painted", x, z, "detail");
    const pc = [0.25, 0.32, 0.27];
    const H = 3.4;
    if (fallen) {
      const a = r() * 6;
      M.pipe(
        b,
        x,
        0.2,
        z,
        x + Math.cos(a) * H,
        0.25,
        z + Math.sin(a) * H,
        0.05,
        6,
        { c: pc },
      );
      return;
    }
    const lean = r() < 0.2 ? r.range(0.05, 0.18) : 0;
    const la = r() * 6;
    const tx = x + Math.cos(la) * Math.sin(lean) * H,
      tz = z + Math.sin(la) * Math.sin(lean) * H,
      ty = SY + Math.cos(lean) * H;
    M.pipe(b, x, SY, z, tx, ty, tz, 0.045, 6, { c: pc });
    M.cyl(b, x, SY, z, 0.1, 0.08, 0.3, 6, { c: pc });
    const sb = M.buf("my/streetsigns", x, z, "detail");
    const blade = (name, y, alongX, twist) => {
      const uv = M.streetSignUV(name);
      const L2 = 1.25,
        h = 0.2;
      const dx = alongX ? Math.cos(twist) : Math.sin(twist),
        dz = alongX ? Math.sin(twist) : Math.cos(twist);
      const nx = -dz,
        nz = dx;
      const p0 = [tx - (dx * L2) / 2, y, tz - (dz * L2) / 2],
        p1 = [tx + (dx * L2) / 2, y, tz + (dz * L2) / 2];
      // both faces (text readable from both sides)
      M.quad(
        sb,
        [p0[0] + nx * 0.012, y, p0[2] + nz * 0.012],
        [p1[0] + nx * 0.012, y, p1[2] + nz * 0.012],
        [p1[0] + nx * 0.012, y + h, p1[2] + nz * 0.012],
        [p0[0] + nx * 0.012, y + h, p0[2] + nz * 0.012],
        [nx, 0, nz],
        [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
      );
      M.quad(
        sb,
        [p0[0] - nx * 0.012, y, p0[2] - nz * 0.012],
        [p1[0] - nx * 0.012, y, p1[2] - nz * 0.012],
        [p1[0] - nx * 0.012, y + h, p1[2] - nz * 0.012],
        [p0[0] - nx * 0.012, y + h, p0[2] - nz * 0.012],
        [-nx, 0, -nz],
        [uv[2], uv[1], uv[0], uv[1], uv[0], uv[3], uv[2], uv[3]],
      );
    };
    const tw = r() < 0.2 ? r.range(-0.4, 0.4) : 0;
    blade(stName, ty - 0.25, true, tw);
    blade(aveName, ty - 0.02, false, r() < 0.2 ? r.range(-0.5, 0.5) : 0);
  }
