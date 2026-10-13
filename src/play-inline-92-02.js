// play-inline-92 02 — range
// Lines 309-592 of readable/play-inline-92.pretty.js (statement-aligned).
  function statue(x, z, yaw, h, seated) {
    const y0 = SY,
      bg = M.buf("granite", x, z),
      bb = M.buf("metal_painted", x, z, "detail");
    const bronze = [0.34, 0.47, 0.41];
    M.box(bg, x - 1.7, y0, z - 1.7, x + 1.7, y0 + 0.35, z + 1.7, {
      s: 2,
      c: [0.7, 0.68, 0.64],
    });
    M.box(bg, x - 1.25, y0 + 0.35, z - 1.25, x + 1.25, y0 + h, z + 1.25, {
      s: 2,
      c: [0.74, 0.72, 0.67],
    });
    M.box(bg, x - 1.4, y0 + h, z - 1.4, x + 1.4, y0 + h + 0.25, z + 1.4, {
      s: 2,
      c: [0.78, 0.76, 0.7],
    });
    const top = y0 + h + 0.25,
      sx = Math.sin(yaw),
      sz = -Math.cos(yaw);
    if (seated) {
      M.obox(bb, x, top + 0.45, z, 1.1, 0.9, 1.2, yaw, {
        c: M.mulc(bronze, 0.8),
      }); // chair
      M.obox(bb, x + sx * 0.25, top + 1.25, z + sz * 0.25, 0.7, 0.9, 0.5, yaw, {
        c: bronze,
      }); // torso
      M.obox(
        bb,
        x + sx * 0.55,
        top + 0.75,
        z + sz * 0.55,
        0.7,
        0.25,
        0.7,
        yaw,
        { c: bronze },
      ); // lap
    } else {
      M.cyl(bb, x, top, z, 0.42, 0.3, 1.55, 8, { c: bronze }); // coat / legs
      M.cyl(bb, x, top + 1.55, z, 0.3, 0.26, 0.55, 8, { c: bronze }); // chest
      M.obox(
        bb,
        x - sz * 0.32,
        top + 1.7,
        z + sx * 0.32,
        0.14,
        0.14,
        0.6,
        yaw,
        { pitch: 0.5, c: bronze },
      ); // arm (spyglass)
    }
    M.cyl(
      bb,
      x + (seated ? sx * 0.25 : 0),
      top + (seated ? 1.7 : 2.1),
      z + (seated ? sz * 0.25 : 0),
      0.16,
      0.15,
      0.3,
      8,
      { c: bronze, capTop: true },
    );
    M.box3(x - 1.7, 0, z - 1.7, x + 1.7, top + 2.3, z + 1.7, {
      tag: "monument",
      surface: "concrete",
    });
  }

  function madisonSquare(o) {
    const r = M.rng("madison");
    const P = M.polyArea(o.poly) > 0 ? o.poly : o.poly.slice().reverse();
    const inner = M.insetPoly(P, 1.4),
      lawnP = M.insetPoly(P, 1.9);
    // hub of the path star: south-centre (the real park's central oval), fountain on it
    const hx = 165,
      hz = 63;
    // dead lawn over the whole park, stone-edged
    M.poly(M.buf("grass_dead", hx, hz), lawnP, SY + 0.03, {
      s: 4,
      c: [0.8, 0.75, 0.55],
      convex: true,
    });
    const pb = M.buf("sidewalk", hx, hz),
      y = SY + 0.05,
      pc = [0.82, 0.8, 0.75];
    // paths: to the 5th Ave / 26th St corner (Farragut), the Broadway / 23rd St corner (Seward — faces the Flatiron),
    // to Madison Ave (east), 26th St (north), 23rd St (south) and 5th Ave (west, towards Worth Square)
    const ends = [
      [134, 50.5],
      [138.2, 73.4],
      [188.5, hz],
      [hx, 47.5],
      [hx, 77.5],
      [130.5, 58],
      [188.5, 48.5],
      [188.5, 77],
    ];
    for (const [ex, ez] of ends) {
      const q = stripClip(
        inner,
        hx,
        hz,
        ex + (ex - hx) * 0.2,
        ez + (ez - hz) * 0.2,
        1.5,
      );
      if (q) M.poly(pb, q, y, { s: 4, c: pc, convex: true });
    }
    // central oval: granite ring + dry fountain basin
    M.cyl(M.buf("granite", hx, hz), hx, SY, hz, 6.5, 6.5, 0.07, 28, {
      capTop: true,
      c: [0.78, 0.76, 0.7],
    });
    const bf = M.buf("stone_limestone", hx, hz);
    M.cyl(bf, hx, SY, hz, 3.2, 3.2, 0.7, 20, { c: [0.8, 0.78, 0.72] });
    M.cyl(M.buf("dirt", hx, hz), hx, SY + 0.5, hz, 3.0, 3.0, 0.05, 20, {
      capTop: true,
      c: [0.45, 0.4, 0.32],
    });
    M.cyl(bf, hx, SY, hz, 0.5, 0.35, 2.2, 10, {
      c: [0.75, 0.73, 0.68],
      capTop: true,
    });
    M.ocol(hx, hz, 6.4, 6.4, 0, SY + 0.7, 0, { tag: "fountain" });
    // fence with openings at every path end
    gappedFence(
      M.insetPoly(P, 0.5),
      SY,
      ends.map(([ex, ez]) => [ex, ez]),
      3.2,
    );
    // monuments: Farragut (NW, 26th St & 5th) and Seward (SW, seated, on the Broadway / 23rd St corner, facing the prow)
    statue(135.5, 53.5, -Math.PI / 4 - Math.PI / 2 + Math.PI, 2.6, false);
    statue(141.5, 70.8, Math.PI + 0.62, 2.2, true);
    // dead plane trees in the lawns (clear of paths / hub / statues)
    const nearPath = (x, z) => {
      if (Math.hypot(x - hx, z - hz) < 8.5) return true;
      for (const [ex, ez] of ends)
        if (G.LAYOUT.distToSeg(x, z, hx, hz, ex, ez) < 3.2) return true;
      return M.distToPoly(x, z, inner) < 3;
    };
    let placed = 0;
    for (let i = 0; i < 60 && placed < 16; i++) {
      const x = r.range(o.x0 + 3, o.x1 - 3),
        z = r.range(o.z0 + 3, o.z1 - 3);
      if (
        !M.inPoly(x, z, lawnP) ||
        nearPath(x, z) ||
        Math.hypot(x - 135.5, z - 53.5) < 4 ||
        Math.hypot(x - 141.5, z - 70.8) < 4
      )
        continue;
      M.placeTree(x, z, r.int(0, 8), r() * 6, r.range(0.9, 1.3));
      placed++;
    }
    // benches along the paths, lamps at the path ends
    for (const [ex, ez] of ends.slice(0, 6)) {
      const dx = ex - hx,
        dz = ez - hz,
        l = Math.hypot(dx, dz),
        ux = dx / l,
        uz = dz / l;
      const t = Math.min(l * 0.55, l - 5);
      if (t < 9) continue;
      const bx = hx + ux * t - uz * 2.3,
        bz = hz + uz * t + ux * 2.3;
      if (M.inPoly(bx, bz, inner))
        M.parkBench(bx, bz, Math.atan2(ux, uz) + Math.PI / 2, r() < 0.3);
      const lx = hx + ux * (l - 3) + uz * 2.2,
        lz = hz + uz * (l - 3) - ux * 2.2;
      if (M.inPoly(lx, lz, inner)) M.parkLamp(lx, lz, r() < 0.25);
    }
    // leaves & trash
    for (let i = 0; i < 20; i++) {
      const x = r.range(o.x0 + 2, o.x1 - 2),
        z = r.range(o.z0 + 2, o.z1 - 2);
      if (M.inPoly(x, z, inner))
        M.decal(
          M.buf("my/markings", hx, hz, "fine"),
          x,
          SY + 0.06,
          z,
          r.range(2, 5),
          r.range(2, 5),
          r() * 6,
          r.pick([M.MARK.LEAVES, M.MARK.DIRT, M.MARK.LITTER]),
        );
    }
  }

  function plaza(o) {
    const r = M.rng(o.id);
    const cx = (o.x0 + o.x1) / 2,
      cz = (o.z0 + o.z1) / 2;
    const w = o.x1 - o.x0,
      d = o.z1 - o.z0;
    // planters with dead trees
    const pb = M.buf("concrete", cx, cz);
    const nP = Math.max(2, Math.floor(w / 14));
    for (let i = 0; i < nP; i++) {
      const x = o.x0 + ((i + 0.5) * w) / nP,
        z = o.z0 + (d > 18 ? 4 : 2.2);
      M.box(pb, x - 1.3, SY, z - 1.3, x + 1.3, SY + 0.7, z + 1.3, {
        s: 2,
        c: [0.72, 0.7, 0.66],
      });
      M.box(
        M.buf("dirt", x, z),
        x - 1.2,
        SY + 0.7,
        z - 1.2,
        x + 1.2,
        SY + 0.72,
        z + 1.2,
        { s: 1, c: [0.5, 0.42, 0.32] },
      );
      M.ocol(x, z, 2.6, 2.6, 0, SY + 0.7, 0, { tag: "planter" });
      if (r() < 0.8) M.placeTree(x, z, r.int(0, 4), r() * 6, 0.7);
    }
    // benches, a newsstand kiosk, rubble, lamps
    for (let i = 0; i < 3; i++)
      M.parkBench(
        r.range(o.x0 + 4, o.x1 - 4),
        r.range(o.z0 + 3, o.z1 - 3),
        r() < 0.5 ? 0 : Math.PI,
        r() < 0.4,
      );
    if (d > 18) {
      const kx = cx + r.range(-8, 8),
        kz = cz + 4;
      const kb = M.buf("metal_painted", kx, kz);
      M.box(kb, kx - 1.6, SY, kz - 1.1, kx + 1.6, SY + 2.5, kz + 1.1, {
        s: 1.5,
        c: [0.35, 0.45, 0.4],
      });
      M.box(kb, kx - 1.9, SY + 2.5, kz - 1.4, kx + 1.9, SY + 2.7, kz + 1.4, {
        s: 1.5,
        c: [0.3, 0.38, 0.34],
      });
      M.quad(
        M.buf("glass_dirty", kx, kz),
        [kx - 1.4, SY + 1.1, kz + 1.11],
        [kx + 1.4, SY + 1.1, kz + 1.11],
        [kx + 1.4, SY + 2.2, kz + 1.11],
        [kx - 1.4, SY + 2.2, kz + 1.11],
        [0, 0, 1],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.3, 0.3, 0.3],
      );
      M.box3(kx - 1.6, 0, kz - 1.1, kx + 1.6, SY + 2.7, kz + 1.1, {
        tag: "kiosk",
      });
    }
    M.rubblePile(
      r.range(o.x0 + 5, o.x1 - 5),
      r.range(o.z0 + 3, o.z1 - 3),
      r.range(1.5, 3),
      r.range(0.6, 1.2),
      r,
    );
    for (const [x, z] of [
      [o.x0 + 2, o.z0 + 2],
      [o.x1 - 2, o.z1 - 2],
    ])
      M.parkLamp(x, z, r() < 0.3);
    for (let i = 0; i < 12; i++)
      M.decal(
        M.buf("my/markings", cx, cz, "fine"),
        r.range(o.x0 + 2, o.x1 - 2),
        SY + 0.015,
        r.range(o.z0 + 2, o.z1 - 2),
        r.range(1.5, 4),
        r.range(1.5, 4),
        r() * 6,
        r.pick([M.MARK.CRACKS, M.MARK.LITTER, M.MARK.STAIN, M.MARK.DIRT]),
      );
  }

  /**
   * Columbus Circle: the rostral column & statue on the raised centre island of the LAYOUT roundabout
   * (8th Ave × 59th St; Broadway leaves on its own SSE arm). The island kerb/slab is a raised ground piece (05_grid).
   */
