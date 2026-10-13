// play-inline-433 05 — ring
// Lines 885-1136 of readable/play-inline-433.pretty.js (statement-aligned).
  K.wireFrame = function (b, kind, x, y, z, yaw, s, o) {
    o = o || {};
    const mat = "rust",
      t = o.tint || [0.5, 0.36, 0.26];
    const c = Math.cos(yaw),
      sn = Math.sin(yaw);
    const W = (lx, ly, lz) => [
      x + (lx * c + lz * sn) * s,
      y + ly * s,
      z + (-lx * sn + lz * c) * s,
    ];
    const ring = (lx, ly, lz, rx, ry, plane) => {
      const p0 = W(lx, ly, lz);
      const pts = ringPts(p0[0], p0[1], p0[2], rx * s, ry * s, plane, yaw, 12);
      for (let i = 0; i < pts.length - 1; i++)
        b.pipe(
          mat,
          pts[i][0],
          pts[i][1],
          pts[i][2],
          pts[i + 1][0],
          pts[i + 1][1],
          pts[i + 1][2],
          0.012 * Math.max(1, s * 0.5),
          3,
          { tint: t, grime: 0.3 },
        );
    };
    const rod = (a, bb) => {
      const p = W(a[0], a[1], a[2]),
        q = W(bb[0], bb[1], bb[2]);
      b.pipe(
        mat,
        p[0],
        p[1],
        p[2],
        q[0],
        q[1],
        q[2],
        0.015 * Math.max(1, s * 0.5),
        3,
        { tint: t, grime: 0.3 },
      );
    };
    if (kind === "kong") {
      // King Kong beating his chest: legs, barrel body, raised fists, head
      for (const e of [-1, 1]) {
        for (let k = 0; k < 3; k++)
          ring(e * 0.28, 0.15 + k * 0.28, 0, 0.16, 0.14, "xz");
        rod([e * 0.28, 0, 0], [e * 0.3, 0.8, 0]);
      }
      for (let k = 0; k < 4; k++)
        ring(0, 0.9 + k * 0.28, 0, 0.5 - Math.abs(k - 1.5) * 0.06, 0.34, "xz");
      for (const e of [-1, 1]) {
        ring(e * 0.62, 1.55, -0.1, 0.12, 0.12, "xz");
        rod([e * 0.45, 1.65, 0], [e * 0.72, 1.9, -0.15]);
        rod([e * 0.72, 1.9, -0.15], [e * 0.6, 2.3, -0.2]);
        ring(e * 0.6, 2.35, -0.2, 0.13, 0.13, "xy");
      }
      ring(0, 2.05, -0.05, 0.22, 0.2, "xz");
      ring(0, 2.2, -0.05, 0.24, 0.22, "yz");
      ring(0, 2.2, -0.05, 0.2, 0.22, "xy");
      for (const e of [-1, 1]) rod([e * 0.4, 0.8, 0], [e * 0.45, 1.7, 0]);
      rod([0, 0.85, 0.34], [0, 1.9, 0.3]);
      rod([0, 0.85, -0.34], [0, 1.9, -0.3]);
    } else if (kind === "elephant") {
      for (let k = 0; k < 5; k++)
        ring(0, 1.1, -0.6 + k * 0.3, 0.42, 0.45, "xy");
      for (const [lx, lz] of [
        [-0.25, -0.5],
        [0.25, -0.5],
        [-0.25, 0.5],
        [0.25, 0.5],
      ]) {
        ring(lx, 0.3, lz, 0.12, 0.12, "xz");
        rod([lx, 0, lz], [lx, 0.8, lz]);
      }
      ring(0, 1.35, -0.95, 0.28, 0.3, "xy");
      for (const e of [-1, 1]) ring(e * 0.3, 1.35, -0.9, 0.22, 0.25, "yz");
      rod([0, 1.2, -1.15], [0, 0.8, -1.3]);
      rod([0, 0.8, -1.3], [0, 0.5, -1.2]);
      rod([-0.42, 1.1, -0.6], [-0.42, 1.1, 0.6]);
      rod([0.42, 1.1, -0.6], [0.42, 1.1, 0.6]);
      rod([0, 1.55, -0.6], [0, 1.55, 0.6]);
    } else {
      // rabbit
      for (let k = 0; k < 3; k++)
        ring(0, 0.3 + k * 0.2, 0, 0.3 - k * 0.04, 0.25, "xz");
      ring(0, 0.95, -0.05, 0.17, 0.17, "xz");
      for (const e of [-1, 1]) {
        ring(e * 0.07, 1.3, 0, 0.05, 0.2, "xy");
      }
    }
    if (o.base !== false)
      b.cyl("concrete", x, y - 0.02, z, 0.8 * s, 0.85 * s, 0.25, 10, {
        tint: [0.55, 0.5, 0.42],
      });
    // dead ivy strands clinging to the frame
    const r = K.rng((x * 17 + z * 5) | 0);
    for (let i = 0; i < 6; i++) {
      const a = r() * PI * 2,
        h0 = r() * 1.2;
      const p = [Math.cos(a) * 0.35, h0, Math.sin(a) * 0.35];
      rod(p, [
        p[0] + (r() - 0.5) * 0.3,
        h0 + 0.5 + r() * 0.5,
        p[2] + (r() - 0.5) * 0.3,
      ]);
    }
    if (o.col !== false) {
      const p = W(0, 0, 0);
      b.col(
        p[0] - 0.55 * s,
        y,
        p[2] - 0.55 * s,
        p[0] + 0.55 * s,
        y + 2 * s,
        p[2] + 0.55 * s,
        { tag: "topiary", walkable: false, surface: "metal" },
      );
    }
  };

  // ------------------------------------------------------------------
  // Patio umbrella
  // ------------------------------------------------------------------
  K.umbrella = function (b, x, y, z, r, o) {
    o = o || {};
    const tint = o.tint || [0.25, 0.42, 0.3],
      h = o.h || 2.3;
    b.pipe("steel", x, y, z, x, y + h + 0.1, z, 0.025, 5, {
      tint: [0.6, 0.6, 0.58],
    });
    const tilt = o.tilt || 0;
    b.geo("fabric", K.coneGeo(), {
      x: x + tilt * 0.3,
      y: y + h - 0.2,
      z,
      sx: r,
      sy: 0.55,
      sz: r,
      rz: tilt,
      tint,
      grime: 0.5,
    });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2;
      b.pipe(
        "steel",
        x,
        y + h + 0.05,
        z,
        x + Math.cos(a) * r,
        y + h - 0.47,
        z + Math.sin(a) * r,
        0.008,
        3,
        { tint: [0.5, 0.5, 0.48] },
      );
    }
  };

  // ------------------------------------------------------------------
  // Painted cells
  // ------------------------------------------------------------------
  /** "Through the glass" backdrop: the lantern garden at night. */
  K.nightGarden = function (i, atlas) {
    return K.paint(
      atlas || "pics",
      "ppk_nightgarden_" + i,
      256,
      320,
      function (x, X, Y, W, H) {
        const r = K.rng("ng" + i);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#0a0f14");
        g.addColorStop(0.55, "#141c1c");
        g.addColorStop(1, "#1e2218");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        // tree silhouettes
        x.strokeStyle = "#05080a";
        x.lineCap = "round";
        for (let k = 0; k < 3; k++) {
          const bx = X + W * (0.15 + k * 0.35 + (r() - 0.5) * 0.1),
            by = Y + H;
          const br = (px, py, a, len, w, d) => {
            const ex = px + Math.cos(a) * len,
              ey = py - Math.sin(a) * len;
            x.lineWidth = w;
            x.beginPath();
            x.moveTo(px, py);
            x.lineTo(ex, ey);
            x.stroke();
            if (d > 0) {
              br(
                ex,
                ey,
                a + 0.5 + (r() - 0.5) * 0.4,
                len * 0.7,
                w * 0.62,
                d - 1,
              );
              br(
                ex,
                ey,
                a - 0.5 + (r() - 0.5) * 0.4,
                len * 0.7,
                w * 0.62,
                d - 1,
              );
            }
          };
          br(bx, by, PI / 2 + (r() - 0.5) * 0.2, H * 0.32, 10, 4);
        }
        // string lights draped through the branches
        for (let k = 0; k < 5; k++) {
          const y0 = Y + H * (0.2 + r() * 0.4),
            sag = H * 0.06;
          for (let j = 0; j < 14; j++) {
            const t = j / 13,
              px = X + W * t,
              py = y0 + Math.sin(t * PI) * sag + (r() - 0.5) * 4;
            const gg = x.createRadialGradient(px, py, 0, px, py, 7);
            gg.addColorStop(0, "rgba(255,220,150,0.95)");
            gg.addColorStop(0.4, "rgba(255,170,80,0.35)");
            gg.addColorStop(1, "rgba(255,150,60,0)");
            x.fillStyle = gg;
            x.fillRect(px - 7, py - 7, 14, 14);
          }
        }
        // reflection haze on the glass
        const hz = x.createLinearGradient(X, Y, X + W, Y + H);
        hz.addColorStop(0, "rgba(255,255,255,0.06)");
        hz.addColorStop(0.5, "rgba(255,255,255,0)");
        hz.addColorStop(1, "rgba(255,255,255,0.04)");
        x.fillStyle = hz;
        x.fillRect(X, Y, W, H);
        K.stains(x, X, Y, W, H, 6, i + 3, 0.25, [60, 70, 50]);
      },
    );
  };

  /** WPA-style mural panel (sepia-green): i selects the scene. */
  const MURAL_SCENES = [
    "soldiers",
    "animals",
    "skaters",
    "builders",
    "parade",
    "sheep",
  ];
