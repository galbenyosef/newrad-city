// play-inline-386 04 — tint
// Lines 615-902 of readable/play-inline-386.pretty.js (statement-aligned).
  K.barberPole = function (b, x, y, z, nx, nz) {
    const px = x + nx * 0.28,
      pz = z + nz * 0.28,
      h = 1.2;
    b.beam("chrome", x, y + h * 0.5, z, px, y + h * 0.5, pz, 0.04, 0.04, {});
    b.cyl("chrome", px, y - 0.12, pz, 0.1, 0.13, 0.12, 12);
    b.cyl("chrome", px, y + h, pz, 0.13, 0.08, 0.16, 12);
    b.geo("chrome", K.sphereGeo(), { x: px, y: y + h + 0.2, z: pz, s: 0.08 });
    b.cyl("glass_clear", px, y, pz, 0.1, 0.1, h, 12, { tint: [0.8, 0.8, 0.8] });
    b.cyl("paint_white", px, y, pz, 0.075, 0.075, h, 10, {
      tint: [0.85, 0.83, 0.78],
    });
    const N = 22;
    for (let k = 0; k < N; k++) {
      for (const [ph, mat] of [
        [0, "paint_red"],
        [PI, "paint_blue"],
      ]) {
        const a0 = ph + k * 0.55,
          a1 = a0 + 0.55,
          y0 = y + (k * h) / N,
          y1 = y0 + h / N;
        b.beam(
          mat,
          px + Math.cos(a0) * 0.078,
          y0,
          pz + Math.sin(a0) * 0.078,
          px + Math.cos(a1) * 0.078,
          y1,
          pz + Math.sin(a1) * 0.078,
          0.035,
          0.012,
          { tint: [0.9, 0.9, 0.9] },
        );
      }
    }
  };

  /** A suitcase lying (or standing) — leather/canvas body, straps, corner guards, handle, a torn travel label. */
  K.suitcase = function (b, x, y, z, yaw, o) {
    o = o || {};
    const r = K.rng("case" + ((x * 7 + z * 13) | 0));
    const w = o.w || 0.72,
      h = o.h || 0.22,
      d = o.d || 0.46,
      stand = !!o.stand;
    const col =
      o.tint ||
      r.pick([
        [0.62, 0.42, 0.26],
        [0.45, 0.3, 0.2],
        [0.55, 0.5, 0.4],
        [0.35, 0.36, 0.42],
        [0.6, 0.2, 0.16],
      ]);
    const Lc = K.L(x, z, yaw);
    const W = stand ? w : w,
      Hh = stand ? d : h,
      Dd = stand ? h : d;
    b.box(o.mat || "leather", x, y, z, W, Hh, Dd, {
      yaw,
      tint: col,
      faces: "nsewt",
    });
    // straps
    for (const u of [-W * 0.28, W * 0.28]) {
      const p = Lc(u, 0);
      b.box("leather", p[0], y - 0.005, p[1], 0.045, Hh + 0.012, Dd + 0.012, {
        yaw,
        tint: [0.3, 0.2, 0.12],
      });
    }
    // corner guards
    for (const u of [-1, 1])
      for (const v of [-1, 1]) {
        const p = Lc(u * (W / 2 - 0.02), v * (Dd / 2 - 0.02));
        b.box("brass", p[0], y + Hh - 0.03, p[1], 0.05, 0.035, 0.05, {
          yaw,
          tint: [0.8, 0.8, 0.8],
        });
      }
    // handle on the top (lying) or top edge (standing)
    {
      const p = Lc(0, stand ? 0 : Dd / 2 - 0.06);
      b.box("leather", p[0], y + Hh, p[1], 0.16, 0.04, 0.03, {
        yaw,
        tint: [0.28, 0.18, 0.1],
      });
    }
    // a travel label
    if (r() < 0.6) {
      const p = Lc(W * 0.12, 0);
      b.box("flat", p[0], y + Hh + 0.001, p[1], 0.14, 0.002, 0.1, {
        yaw: yaw + (r() - 0.5) * 0.6,
        tint: r.pick([
          [0.85, 0.8, 0.6],
          [0.7, 0.3, 0.2],
          [0.35, 0.5, 0.7],
        ]),
      });
    }
  };
  /** Steamer trunk (standing on end, half open, or closed). */
  K.trunk = function (b, x, y, z, yaw, o) {
    o = o || {};
    const Lc = K.L(x, z, yaw),
      w = 1.0,
      h = 0.62,
      d = 0.58;
    b.box("canvas", x, y, z, w, h, d, {
      yaw,
      tint: o.tint || [0.55, 0.42, 0.28],
      faces: "nsewt",
    });
    for (const u of [-0.45, -0.15, 0.15, 0.45]) {
      const p = Lc(u, 0);
      b.box("wood_dark", p[0], y - 0.005, p[1], 0.05, h + 0.012, d + 0.012, {
        yaw,
        tint: [0.45, 0.3, 0.2],
      });
    }
    for (const yy of [0.05, h - 0.08])
      b.box("brass", x, y + yy, z, w + 0.012, 0.04, d + 0.012, {
        yaw,
        tint: [0.7, 0.7, 0.7],
      });
    {
      const p = Lc(0, d / 2 + 0.005);
      b.box("brass", p[0], y + h - 0.2, p[1], 0.1, 0.12, 0.02, { yaw });
    }
    b.ocol(x, z, w, d, y, y + h, yaw, { tag: "furniture" });
  };

  /** Faded Civil Defense Week bunting swag from A to B (sagging), fan of red/white/blue triangles. */
  K.bunting = function (b, ax, ay, az, bx, by, bz, o) {
    o = o || {};
    const n =
        o.n || Math.max(6, Math.round(Math.hypot(bx - ax, bz - az) / 0.45)),
      sag = o.sag || 0.8;
    const cols = [
      [0.62, 0.22, 0.18],
      [0.82, 0.8, 0.72],
      [0.24, 0.3, 0.48],
    ];
    const at = (t) => [
      ax + (bx - ax) * t,
      ay + (by - ay) * t - sag * 4 * t * (1 - t),
      az + (bz - az) * t,
    ];
    let prev = at(0);
    for (let k = 1; k <= n; k++) {
      const p = at(k / n);
      b.pipe(
        "cloth_white",
        prev[0],
        prev[1],
        prev[2],
        p[0],
        p[1],
        p[2],
        0.006,
        3,
        { tint: [0.7, 0.68, 0.6] },
      );
      prev = p;
    }
    for (let k = 0; k < n; k++) {
      if (o.torn && (k * 7) % 5 === 1) continue;
      const p0 = at(k / n),
        p1 = at((k + 0.9) / n),
        m = at((k + 0.45) / n);
      b.quad(
        "flat",
        p0,
        p1,
        [m[0], m[1] - 0.32, m[2]],
        [m[0], m[1] - 0.32, m[2]],
        { tint: cols[k % 3], grime: 0.3 },
      );
      b.quad(
        "flat",
        p1,
        p0,
        [m[0], m[1] - 0.32, m[2]],
        [m[0], m[1] - 0.32, m[2]],
        { tint: cols[k % 3].map((v) => v * 0.8), grime: 0.3 },
      );
    }
  };

  // ------------------------------------------------------------------
  // Drifts of dead letters: a painted canvas of overlapping envelopes on a lumpy displaced dome
  // ------------------------------------------------------------------
  K.customPaint.letters = function (x, S, r) {
    x.fillStyle = "#b8b09a";
    x.fillRect(0, 0, S, S);
    const cols = [
      "#e8e2d0",
      "#f0ece0",
      "#d8c8a0",
      "#e0d8c4",
      "#cfc6ae",
      "#ece8dc",
    ];
    for (let k = 0; k < 340; k++) {
      const cx = r() * S,
        cy = r() * S,
        w = 64 + r() * 34,
        h = w * (0.42 + r() * 0.12),
        a = r() * PI * 2;
      for (const [ox, oy] of [
        [0, 0],
        [S, 0],
        [-S, 0],
        [0, S],
        [0, -S],
      ]) {
        const px = cx + ox,
          py = cy + oy;
        if (px < -w || px > S + w || py < -w || py > S + w) continue;
        x.save();
        x.translate(px, py);
        x.rotate(a);
        x.fillStyle = "rgba(20,16,10,0.35)";
        x.fillRect(-w / 2 + 2, -h / 2 + 3, w, h); // contact shadow
        const c = cols[(r() * cols.length) | 0];
        x.fillStyle = c;
        x.fillRect(-w / 2, -h / 2, w, h);
        if (r() < 0.22) {
          for (let i = -w / 2; i < w / 2; i += 8) {
            x.fillStyle = (i / 8) % 2 ? "#b83a30" : "#2c4a8a";
            x.fillRect(i, -h / 2, 4, 3);
            x.fillRect(i + 2, h / 2 - 3, 4, 3);
          }
        } // airmail border
        x.fillStyle = r() < 0.5 ? "#9a3a30" : "#3a5a8a";
        x.fillRect(w / 2 - 14, -h / 2 + 4, 10, 12); // stamp
        x.strokeStyle = "rgba(40,40,40,0.5)";
        x.lineWidth = 1;
        x.beginPath();
        x.arc(w / 2 - 16, -h / 2 + 10, 7, 0, 6.3);
        x.stroke(); // postmark
        x.fillStyle = "rgba(30,30,40,0.55)";
        for (let l = 0; l < 3; l++)
          x.fillRect(-w * 0.18, -2 + l * 5, w * (0.3 + r() * 0.2), 1.6); // address
        if (r() < 0.12) {
          x.fillStyle = "#a02a20";
          x.font = "bold 7px Arial";
          x.fillText("RETURN TO SENDER", -w / 2 + 3, h / 2 - 4);
        }
        x.restore();
      }
    }
    K.grain(x, 0, 0, S, S, 18, 5301);
    K.stains(x, 0, 0, S, S, 16, 5302, 0.35, [60, 50, 30]);
  };
  K.MATDEF.letters = { custom: "letters", tile: [1.5, 1.5], rough: 0.95 };
  const _mounds = {};
  /** Low lumpy dome (unit radius, height 1) — displaced so drifts don't read as cones. */
  K.moundGeo = function (seed) {
    seed = seed || 0;
    if (_mounds[seed]) return _mounds[seed];
    const g = new THREE.SphereGeometry(1, 18, 7, 0, PI * 2, 0, PI / 2),
      p = g.attributes.position,
      r = K.rng("mound" + seed);
    const ph = [r() * 6, r() * 6, r() * 6];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i),
        a = Math.atan2(z, x),
        rr = Math.hypot(x, z);
      const lump =
        1 +
        0.16 * Math.sin(a * 3 + ph[0]) +
        0.1 * Math.sin(a * 5 + ph[1]) +
        0.07 * Math.sin(a * 9 + ph[2]);
      const yy =
        y *
        (0.75 + 0.35 * Math.sin(a * 2 + ph[1]) * rr) *
        (1 + 0.12 * Math.sin(x * 7 + z * 5));
      p.setXYZ(i, x * lump, Math.max(0, yy), z * lump);
    }
    g.computeVertexNormals();
    return (_mounds[seed] = g);
  };

  /** Clock face stopped at h:m (cream dial, brass ring, a crack across the glass). */
