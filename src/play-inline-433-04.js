// play-inline-433 04 — math
// Lines 563-884 of readable/play-inline-433.pretty.js (statement-aligned).
  K.chandelier = function (b, x, y, z, r, o) {
    o = o || {};
    const ceil = o.ceil !== undefined ? o.ceil : y + 1.2;
    const col = K.tint(o.color || [1, 0.82, 0.55]);
    const tiers = o.tiers || 2;
    const LB = o.litB || b;
    b.pipe("brass", x, y + 0.3, z, x, ceil, z, 0.018, 5, { grime: 0.2 });
    b.cyl("brass", x, ceil - 0.08, z, 0.18, 0.12, 0.08, 10, { grime: 0.2 });
    b.geo("brass", K.sphereGeo(), {
      x,
      y: y + 0.25,
      z,
      sx: 0.09,
      sy: 0.16,
      sz: 0.09,
      grime: 0.2,
    });
    for (let t = 0; t < tiers; t++) {
      const rr = r * (1 - t * 0.38),
        yy = y + t * 0.36;
      b.geo("brass", new THREE.TorusGeometry(rr, 0.02, 4, 18), {
        x,
        y: yy,
        z,
        rx: PI / 2,
        grime: 0.2,
      });
      const n = Math.max(6, Math.round(rr * 14));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * PI * 2,
          px = x + Math.cos(a) * rr,
          pz = z + Math.sin(a) * rr;
        b.pipe("brass", x, yy + 0.2, z, px, yy, pz, 0.008, 3);
        // crystal drops (pale, catch the light)
        b.geo("glass_clear", K.octGeo(), {
          x: px,
          y: yy - 0.12,
          z: pz,
          sx: 0.025,
          sy: 0.06,
          sz: 0.025,
          tint: [0.9, 0.92, 0.95],
          grime: 0,
        });
        if (i % 2 === 0) {
          b.cyl("ceramic", px, yy, pz, 0.018, 0.018, 0.08, 5, {
            tint: [0.92, 0.9, 0.84],
          });
          if (!o.dead)
            LB.geo("lamp", K.octGeo(), {
              x: px,
              y: yy + 0.11,
              z: pz,
              s: 0.035,
              tint: col,
            });
          else
            b.geo("glass", K.octGeo(), {
              x: px,
              y: yy + 0.11,
              z: pz,
              s: 0.035,
              tint: [0.5, 0.48, 0.45],
            });
        }
      }
      // festoons of crystal beads between the rings
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * PI * 2 + 0.25;
        b.pipe(
          "glass_clear",
          x + Math.cos(a) * rr * 0.9,
          yy - 0.05,
          z + Math.sin(a) * rr * 0.9,
          x + Math.cos(a + 0.5) * rr * 0.9,
          yy - 0.05,
          z + Math.sin(a + 0.5) * rr * 0.9,
          0.012,
          3,
          { tint: [0.9, 0.92, 0.95] },
        );
      }
    }
    b.geo("glass_clear", K.octGeo(), {
      x,
      y: y - 0.25,
      z,
      sx: 0.07,
      sy: 0.18,
      sz: 0.07,
      tint: [0.9, 0.92, 0.95],
      grime: 0,
    });
    if (!o.dead) {
      if (o.intensity !== 0)
        b.light(
          x,
          y - 0.1,
          z,
          col,
          o.intensity || 1.2,
          o.radius || 8,
          o.lightOpts,
        );
      LB.glow(
        x,
        y + 0.1,
        z,
        [col[0] * 0.8, col[1] * 0.72, col[2] * 0.55],
        o.glowSize || r * 3.2,
      );
    }
  };
  let _oct = null,
    _cone = null,
    _lantLo = null;
  K.lanternLoGeo = function () {
    if (_lantLo) return _lantLo;
    const pts = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5,
        a = (t - 0.5) * Math.PI;
      pts.push(
        new THREE.Vector2(
          Math.cos(a) * (0.7 + 0.3 * Math.cos(a)),
          Math.sin(a) * 0.8,
        ),
      );
    }
    return (_lantLo = new THREE.LatheGeometry(pts, 6));
  };
  K.octGeo = () => _oct || (_oct = new THREE.OctahedronGeometry(1, 0));
  K.coneGeo = () => _cone || (_cone = new THREE.ConeGeometry(1, 1, 8, 1, true));

  // ------------------------------------------------------------------
  // Lantern strings
  // ------------------------------------------------------------------
  /**
   * String of lanterns from A to B ([x,y,z]) with sag. Dark lanterns + cord go to b; lit lanterns to `lit` (may be null).
   * o: {n, sag, kind:'bulb'|'paper', color, glow, light:{i, r, box} (baked light into b, interior use)}
   */
  K.lanternRun = function (b, lit, A, B, o) {
    o = o || {};
    const n =
      o.n ||
      Math.max(3, Math.round(Math.hypot(B[0] - A[0], B[2] - A[2]) / 0.9));
    const sag = o.sag !== undefined ? o.sag : 0.6;
    const col = K.tint(o.color || [1, 0.74, 0.38]);
    const P = (t) => [
      A[0] + (B[0] - A[0]) * t,
      A[1] + (B[1] - A[1]) * t - Math.sin(t * PI) * sag,
      A[2] + (B[2] - A[2]) * t,
    ];
    for (let i = 0; i < n; i++) {
      const p = P(i / n),
        q = P((i + 1) / n);
      b.pipe("black_iron", p[0], p[1], p[2], q[0], q[1], q[2], 0.005, 3);
    }
    for (let i = 1; i < n; i++) {
      const p = P(i / n);
      if (o.kind === "paper") {
        const tt = [col[0] * 0.95, col[1] * 0.55, col[2] * 0.35];
        // paper lanterns in the Tavern's colours (ivory / red / amber), a dark wire cap and bottom ring on each
        const PAPER = [
          [0.9, 0.84, 0.68],
          [0.74, 0.2, 0.14],
          [0.86, 0.62, 0.3],
        ];
        b.geo("fabric", K.lanternLoGeo(), {
          x: p[0],
          y: p[1] - 0.2,
          z: p[2],
          s: 0.11,
          tint: PAPER[i % 3],
          grime: 0.12,
        });
        b.cyl("black_iron", p[0], p[1] - 0.11, p[2], 0.035, 0.035, 0.03, 6, {
          tint: [0.15, 0.14, 0.13],
        });
        b.pipe(
          "black_iron",
          p[0],
          p[1] - 0.1,
          p[2],
          p[0],
          p[1],
          p[2],
          0.004,
          3,
        );
        if (lit) {
          lit.geo("lamp", K.lanternLoGeo(), {
            x: p[0],
            y: p[1] - 0.2,
            z: p[2],
            s: 0.115,
            tint: tt,
          });
          lit.glow(
            p[0],
            p[1] - 0.2,
            p[2],
            [col[0] * 0.8, col[1] * 0.55, col[2] * 0.3],
            o.glow || 1.1,
          );
        }
      } else {
        b.geo("glass", K.octGeo(), {
          x: p[0],
          y: p[1] - 0.07,
          z: p[2],
          s: 0.05,
          tint: [0.55, 0.52, 0.45],
        });
        if (lit) {
          lit.geo("lamp", K.octGeo(), {
            x: p[0],
            y: p[1] - 0.07,
            z: p[2],
            s: 0.055,
            tint: col,
          });
          lit.glow(
            p[0],
            p[1] - 0.07,
            p[2],
            [col[0] * 0.75, col[1] * 0.62, col[2] * 0.35],
            o.glow || 0.8,
          );
        }
      }
      if (o.light && i % (o.light.every || 3) === 0)
        b.light(
          p[0],
          p[1] - 0.3,
          p[2],
          col,
          o.light.i || 0.35,
          o.light.r || 3.5,
          o.light.box ? { box: o.light.box } : undefined,
        );
    }
  };

  // ------------------------------------------------------------------
  // Central Park lamp post (cast iron, acorn globe)
  // ------------------------------------------------------------------
  K.parkLamp = function (b, lit, x, y, z, o) {
    o = o || {};
    const h = o.h || 3.6,
      t = [0.14, 0.15, 0.13];
    b.cyl("black_iron", x, y, z, 0.2, 0.16, 0.5, 8, { tint: t });
    b.cyl("black_iron", x, y + 0.5, z, 0.09, 0.06, h - 0.9, 8, { tint: t });
    for (let k = 0; k < 3; k++)
      b.cyl("black_iron", x, y + 0.9 + k * 0.9, z, 0.1, 0.1, 0.05, 8, {
        tint: t,
      });
    b.cyl("black_iron", x, y + h - 0.4, z, 0.07, 0.16, 0.15, 8, { tint: t });
    if (o.broken)
      b.cyl("glass", x, y + h - 0.25, z, 0.12, 0.05, 0.12, 8, {
        tint: [0.5, 0.52, 0.5],
      });
    else {
      b.geo("glass", K.sphereGeo(), {
        x,
        y: y + h - 0.02,
        z,
        sx: 0.2,
        sy: 0.27,
        sz: 0.2,
        tint: [0.62, 0.62, 0.56],
        grime: 0.4,
      });
      if (lit) {
        lit.geo("lamp", K.sphereGeo(), {
          x,
          y: y + h - 0.02,
          z,
          sx: 0.205,
          sy: 0.275,
          sz: 0.205,
          tint: o.color || [1, 0.8, 0.5],
        });
        lit.glow(x, y + h, z, [0.9, 0.66, 0.34], o.glow || 2.6);
      }
    }
    b.cyl("black_iron", x, y + h + 0.25, z, 0.05, 0.02, 0.18, 6, { tint: t });
    if (o.col !== false)
      b.col(x - 0.18, y, z - 0.18, x + 0.18, y + h, z + 0.18, {
        tag: "lamp",
        walkable: false,
        surface: "metal",
      });
  };

  // ------------------------------------------------------------------
  // Topiary wire armatures (the famous topiaries, 22 years later)
  // ------------------------------------------------------------------
  function ringPts(cx, cy, cz, rx, ry, plane, yaw, n) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw),
      out = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * PI * 2;
      let lx, ly, lz;
      if (plane === "xz") {
        lx = Math.cos(a) * rx;
        ly = 0;
        lz = Math.sin(a) * ry;
      } else if (plane === "yz") {
        lx = 0;
        ly = Math.sin(a) * ry;
        lz = Math.cos(a) * rx;
      } else {
        lx = Math.cos(a) * rx;
        ly = Math.sin(a) * ry;
        lz = 0;
      }
      out.push([cx + lx * c + lz * s, cy + ly, cz - lx * s + lz * c]);
    }
    return out;
  }
