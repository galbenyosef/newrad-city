// play-inline-109 02 — math
// Lines 17-343 of readable/play-inline-109.pretty.js (statement-aligned).
  const K = G.LMA.kit;
  const T = K.T;
  const P = (K.parts = {});

  /** Local→world transform helper for yawed placements (three.js yaw). */
  function frame(x, y, z, yaw, s) {
    const c = Math.cos(yaw || 0),
      sn = Math.sin(yaw || 0);
    s = s || 1;
    return {
      p(lx, ly, lz) {
        return [
          x + (lx * c + lz * sn) * s,
          y + ly * s,
          z + (-lx * sn + lz * c) * s,
        ];
      },
      yaw: yaw || 0,
      s,
    };
  }
  P.frame = frame;

  // ------------------------------------------------------------------
  // Fortifications
  // ------------------------------------------------------------------
  /** Unit "pillow" (squashed superellipsoid): a filled sack with rounded seams, spanning [-0.5, 0.5]³. */
  let pillowGeo = null;
  function pillow() {
    if (pillowGeo) return pillowGeo;
    const g = new THREE.SphereGeometry(1, 8, 5);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const sx = Math.sign(x) * Math.pow(Math.abs(x), 0.45),
        sy = Math.sign(y) * Math.pow(Math.abs(y), 0.8),
        sz = Math.sign(z) * Math.pow(Math.abs(z), 0.5);
      // tied ends pinch in slightly
      const pinch = 1 - 0.18 * Math.pow(Math.abs(sx), 6);
      p.setXYZ(i, sx * 0.5, sy * 0.5 * pinch, sz * 0.5 * pinch);
    }
    g.computeVertexNormals();
    pillowGeo = g;
    return g;
  }
  K.T.pillow = pillow;
  /** Sandbag wall from A to B, `rows` high: overlapping khaki sacks, slumped and jittered. */
  P.sandbags = function (b, ax, az, bx, bz, rows, o) {
    o = o || {};
    rows = rows || 3;
    const L = Math.hypot(bx - ax, bz - az),
      dx = (bx - ax) / L,
      dz = (bz - az) / L;
    const yaw = Math.atan2(dx, dz) + Math.PI / 2; // local x along wall
    const r = K.rng(o.seed || ax * 13 + az * 7);
    const bagL = 0.66,
      bagH = 0.26,
      bagD = 0.44,
      y0 = o.y || 0,
      geo = pillow();
    const khaki = [0xc2ae82, 0xb4a076, 0xa89468, 0xc8b88e, 0x9c8a62];
    for (let row = 0; row < rows; row++) {
      const off = (row % 2) * bagL * 0.5;
      const n = Math.floor((L - off) / (bagL * 0.9));
      for (let i = 0; i < n; i++) {
        const t = off + bagL * 0.9 * (i + 0.5);
        const nOff = (r() - 0.5) * 0.06;
        const c = new THREE.Color(
          khaki[Math.floor(r() * khaki.length)],
        ).multiplyScalar(0.92 + r() * 0.14);
        b.geo("sandbag", geo, {
          x: ax + dx * t - dz * nOff,
          y: y0 + row * bagH * 0.86 + bagH * 0.5,
          z: az + dz * t + dx * nOff,
          ry: yaw + (r() - 0.5) * 0.18,
          rz: (r() - 0.5) * 0.08,
          rx: (r() - 0.5) * 0.06,
          sx: bagL * (0.95 + r() * 0.1),
          sy: bagH * (0.9 + r() * 0.2),
          sz: bagD * (0.9 + r() * 0.15),
          tint: c,
          grime: 0.12,
        });
      }
    }
    if (o.collide !== false)
      K.colRot(
        (ax + bx) / 2,
        (az + bz) / 2,
        L,
        bagD,
        y0,
        y0 + rows * bagH * 0.86 + 0.05,
        -Math.atan2(bz - az, bx - ax),
        { surface: "dirt", tag: "cover" },
      );
    return b;
  };

  /** Scrap-metal barricade A→B of height h (sheets, posts, spikes). */
  P.scrapWall = function (b, ax, az, bx, bz, h, o) {
    o = o || {};
    const L = Math.hypot(bx - ax, bz - az),
      dx = (bx - ax) / L,
      dz = (bz - az) / L;
    const yaw = Math.atan2(dx, dz) + Math.PI / 2;
    const r = K.rng(o.seed || ax * 3.1 + az * 5.7);
    let t = 0;
    const mats = o.mats || [
      "corrugated",
      "rust",
      "corrugated",
      "metal",
      "wood_rotten",
    ];
    const y0 = o.y || 0; // base height (e.g. a parapet on a platform)
    while (t < L) {
      const w = Math.min(L - t, 1.1 + r() * 1.6);
      if (w < 0.3) break;
      const m = mats[Math.floor(r() * mats.length)];
      const hh = h * (0.75 + r() * 0.35),
        tilt = (r() - 0.5) * 0.12;
      const cx = ax + dx * (t + w / 2),
        cz = az + dz * (t + w / 2);
      const nOff = (r() - 0.5) * 0.12;
      b.geo(m, T.box, {
        x: cx - dz * nOff,
        y: y0 + hh / 2 - 0.05,
        z: cz + dx * nOff,
        ry: yaw,
        rz: tilt,
        sx: w * 1.05,
        sy: hh,
        sz: 0.06,
        grime: 0.6,
      });
      t += w * 0.92;
    }
    // posts
    for (let s = 0; s <= L; s += 2.4)
      b.beam(
        "rust",
        ax + dx * s,
        y0,
        az + dz * s,
        ax + dx * s,
        y0 + h + 0.3,
        az + dz * s,
        0.12,
        { grime: 0.5 },
      );
    // top spikes / rebar
    if (o.spikes !== false)
      for (let s = 0.4; s < L; s += 0.9 + r() * 0.8) {
        const px = ax + dx * s,
          pz = az + dz * s,
          top = h * (0.9 + r() * 0.3);
        b.beam(
          "rust",
          px,
          y0 + top - 0.3,
          pz,
          px + (r() - 0.5) * 0.3,
          y0 + top + 0.5 + r() * 0.5,
          pz + (r() - 0.5) * 0.3,
          0.035,
        );
      }
    if (o.collide !== false)
      K.colRot(
        (ax + bx) / 2,
        (az + bz) / 2,
        L,
        0.5,
        y0,
        y0 + h,
        -Math.atan2(bz - az, bx - ax),
        { surface: "metal" },
      );
    return b;
  };

  /** Concrete jersey barrier segment. */
  P.jersey = function (b, x, z, yaw, o) {
    o = o || {};
    const f = frame(x, 0, z, yaw);
    const pts = [
      [-0.3, 0],
      [0.3, 0],
      [0.12, 0.3],
      [0.1, 0.82],
      [-0.1, 0.82],
      [-0.12, 0.3],
    ];
    const sh = new THREE.Shape();
    pts.forEach((p, i) => (i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])));
    b.extrude(o.mat || "concrete", sh, 3, {
      x,
      y: 0,
      z,
      ry: yaw + Math.PI / 2,
      tint: o.tint,
      grime: 0.7,
    });
    if (o.collide !== false)
      K.colRot(x, z, 3, 0.6, 0, 0.82, yaw, { tag: "cover" });
    void f;
    return b;
  };

  // ------------------------------------------------------------------
  // Shacks & stalls
  // ------------------------------------------------------------------
  /**
   * Scrap shack. Door on local +z side. o: {door:true, roofMat, seed, windows, sign}
   * Returns the door world position.
   */
  P.shack = function (b, x, z, w, d, h, yaw, o) {
    o = o || {};
    const r = K.rng(o.seed || x * 7 + z * 3);
    const f = frame(x, 0, z, yaw);
    const wallMats = o.mats || [
      "corrugated",
      "corrugated",
      "rust",
      "wood_rotten",
      "metal",
    ];
    const pick = () => wallMats[Math.floor(r() * wallMats.length)];
    const y0 = o.y || 0;
    // walls: back, left, right (panels), front with door gap
    const panelWall = (lx0, lz0, lx1, lz1, hh, gapAt, gapW) => {
      const L = Math.hypot(lx1 - lx0, lz1 - lz0);
      const ux = (lx1 - lx0) / L,
        uz = (lz1 - lz0) / L;
      let t = 0;
      while (t < L - 0.05) {
        const pw = Math.min(L - t, 0.9 + r() * 1.3);
        const mid = t + pw / 2;
        if (
          gapAt === undefined ||
          Math.abs(mid - gapAt) > gapW / 2 + pw / 2 - 0.05
        ) {
          const p = f.p(lx0 + ux * mid, 0, lz0 + uz * mid);
          const wy = yaw + Math.atan2(ux, uz) + Math.PI / 2;
          b.geo(pick(), T.box, {
            x: p[0],
            y: y0 + hh / 2,
            z: p[2],
            ry: wy,
            rz: (r() - 0.5) * 0.05,
            sx: pw * 1.04,
            sy: hh * (0.97 + r() * 0.06),
            sz: 0.05,
            grime: 0.55,
          });
        }
        t += pw;
      }
    };
    panelWall(-w / 2, -d / 2, w / 2, -d / 2, h + 0.35); // back (taller: lean roof)
    panelWall(-w / 2, -d / 2, -w / 2, d / 2, h + 0.1);
    panelWall(w / 2, -d / 2, w / 2, d / 2, h + 0.1);
    const doorW = o.door === false ? 0 : 1.2;
    panelWall(
      -w / 2,
      d / 2,
      w / 2,
      d / 2,
      h,
      o.door === false ? undefined : w * (o.doorAt || 0.5),
      doorW,
    );
    if (o.door !== false) {
      // door frame + hanging curtain / plank
      const dp = f.p(-w / 2 + w * (o.doorAt || 0.5), 0, d / 2);
      b.box("wood", dp[0], y0 + 2.05, dp[2], 1.4, 0.12, 0.12, {
        yaw,
        grime: 0.4,
      });
    }
    // lean-to roof
    const rp = f.p(0, 0, 0);
    b.geo(o.roofMat || "corrugated", T.box, {
      x: rp[0],
      y: y0 + h + 0.25,
      z: rp[2],
      ry: yaw,
      rx: -0.09,
      sx: w + 0.5,
      sy: 0.06,
      sz: d + 0.6,
      grime: 0.7,
    });
    // roof junk: tyre, stones
    if (r() < 0.6) {
      const tp = f.p((r() - 0.5) * w * 0.6, 0, (r() - 0.5) * d * 0.5);
      P.tire(b, tp[0], y0 + h + 0.32, tp[2], true);
    }
    // stovepipe
    if (r() < 0.5) {
      const sp = f.p(w * 0.3, 0, -d * 0.3);
      b.cyl("rust", sp[0], y0 + h, sp[2], 0.12, 0.12, 1.4, 6, { top: false });
    }
    // colliders (4 walls with door gap)
    if (o.collide !== false) {
      const c = (lx0, lz0, lx1, lz1) => {
        const a = f.p(lx0, 0, lz0),
          e = f.p(lx1, 0, lz1);
        K.colWall(a[0], a[2], e[0], e[2], 0.2, y0, y0 + h, []);
      };
      c(-w / 2, -d / 2, w / 2, -d / 2);
      c(-w / 2, -d / 2, -w / 2, d / 2);
      c(w / 2, -d / 2, w / 2, d / 2);
      if (o.door === false) c(-w / 2, d / 2, w / 2, d / 2);
      else {
        const da = w * (o.doorAt || 0.5);
        c(-w / 2, d / 2, -w / 2 + da - 0.65, d / 2);
        c(-w / 2 + da + 0.65, d / 2, w / 2, d / 2);
      }
    }
    return f.p(-w / 2 + w * (o.doorAt || 0.5), 0, d / 2 + 0.8);
  };

  /** Market stall: counter facing local +z, posts, fabric awning, goods. Returns the customer-side position. */
