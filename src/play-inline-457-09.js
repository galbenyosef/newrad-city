// play-inline-457 09 — add
// Lines 1765-2223 of readable/play-inline-457.pretty.js (statement-aligned).
  H.hat = function (R, b, kind, color, color2) {
    const hs = b.headS,
      C = HC(b);
    const top = C[1] + 0.07 * hs;
    switch (kind) {
      case "fedora": {
        R.add(
          "head",
          P.xf(P.cyl(0.155 * hs, 0.16 * hs, 0.012 * hs, 18), C[0], top, C[2]),
          cloth(color, { region: "leather", rough: 0.9 }),
        );
        const crown = P.lathe(
          [
            [0.001, 0.105],
            [0.06, 0.1],
            [0.085, 0.085],
            [0.095, 0.03],
            [0.1, 0],
          ].map((p) => [p[0] * hs, p[1] * hs]),
          16,
        );
        P.deform(crown, (v) => {
          if (v.y > 0.08 * hs && Math.abs(v.x) < 0.03 * hs) v.y -= 0.02 * hs;
        }); // pinch
        R.add(
          "head",
          P.xf(crown, C[0], top, C[2]),
          cloth(color, { region: "leather" }),
        );
        R.add(
          "head",
          P.xf(
            P.cyl(0.101 * hs, 0.101 * hs, 0.02 * hs, 16, true),
            C[0],
            top + 0.018 * hs,
            C[2],
          ),
          cloth(color2 || 0x1a1612),
        );
        break;
      }
      case "cowboy": {
        const brim = P.lathe(
          [
            [0.19, 0.03],
            [0.15, 0.0],
            [0.09, 0.005],
          ].map((p) => [p[0] * hs, p[1] * hs]),
          20,
        );
        R.add(
          "head",
          P.xf(brim, C[0], top - 0.005 * hs, C[2]),
          leatherM(color),
        );
        R.add(
          "head",
          P.xf(
            P.lathe(
              [
                [0.001, 0.11],
                [0.07, 0.1],
                [0.095, 0.02],
                [0.1, 0],
              ].map((p) => [p[0] * hs, p[1] * hs]),
              16,
            ),
            C[0],
            top,
            C[2],
          ),
          leatherM(color),
        );
        break;
      }
      case "cap": {
        // newsboy / work cap
        R.add(
          "head",
          P.xf(
            P.sphere(
              0.105 * hs,
              0.06 * hs,
              0.11 * hs,
              14,
              8,
              0,
              PI * 2,
              0,
              PI / 2,
            ),
            C[0],
            top - 0.02 * hs,
            C[2] + 0.005 * hs,
          ),
          cloth(color),
        );
        R.add(
          "head",
          P.xf(
            P.box(0.13 * hs, 0.01 * hs, 0.075 * hs, 0.004 * hs),
            C[0],
            top - 0.02 * hs,
            C[2] - 0.12 * hs,
            -0.18,
            0,
            0,
          ),
          cloth(L.shade(color, 0.8)),
        );
        break;
      }
      case "hardhat": {
        R.add(
          "head",
          P.xf(
            P.sphere(
              0.112 * hs,
              0.085 * hs,
              0.12 * hs,
              16,
              8,
              0,
              PI * 2,
              0,
              PI / 2,
            ),
            C[0],
            top - 0.03 * hs,
            C[2],
          ),
          { color: color || 0xd8a820, rough: 0.5, noise: 0.15 },
        );
        R.add(
          "head",
          P.xf(
            P.cyl(0.14 * hs, 0.14 * hs, 0.01 * hs, 18),
            C[0],
            top - 0.03 * hs,
            C[2] - 0.005 * hs,
          ),
          { color: color || 0xd8a820, rough: 0.5 },
        );
        break;
      }
      case "beret": {
        R.add(
          "head",
          P.xf(
            P.sphere(0.11 * hs, 0.035 * hs, 0.11 * hs, 14, 6),
            C[0] + 0.02 * hs,
            top + 0.01 * hs,
            C[2],
            0,
            0,
            -0.2,
          ),
          cloth(color || 0x2a2a30),
        );
        break;
      }
      case "helmet": {
        // army / combat helmet
        const g = P.sphere(
          0.12 * hs,
          0.1 * hs,
          0.128 * hs,
          18,
          10,
          0,
          PI * 2,
          0,
          PI * 0.55,
        );
        R.add(
          "head",
          P.xf(g, C[0], C[1] + 0.012 * hs, C[2]),
          metalM(color || PAL.olive, { metal: 0.3, rough: 0.6 }),
        );
        R.add(
          "head",
          P.xf(
            P.torus(0.121 * hs, 0.008 * hs, 4, 20),
            C[0],
            C[1] + 0.0 * hs,
            C[2],
            PI / 2,
            0,
            0,
            1,
            1.06,
            1,
          ),
          metalM(L.shade(color || PAL.olive, 0.7), { metal: 0.3 }),
        );
        R.add(
          "head",
          P.xf(
            P.box(0.02 * hs, 0.06 * hs, 0.01 * hs, 0.003),
            C[0] - 0.1 * hs,
            C[1] - 0.04 * hs,
            C[2] + 0.01 * hs,
          ),
          leatherM(0x2a2016),
        );
        R.add(
          "head",
          P.xf(
            P.box(0.02 * hs, 0.06 * hs, 0.01 * hs, 0.003),
            C[0] + 0.1 * hs,
            C[1] - 0.04 * hs,
            C[2] + 0.01 * hs,
          ),
          leatherM(0x2a2016),
        );
        break;
      }
      case "bandana": {
        R.add(
          "head",
          P.xf(
            P.sphere(
              0.097 * hs,
              0.088 * hs,
              0.108 * hs,
              16,
              8,
              0,
              PI * 2,
              0,
              PI * 0.5,
            ),
            C[0],
            C[1] + 0.02 * hs,
            C[2] + 0.004 * hs,
          ),
          cloth(color || 0x8e1d17, { paint: dotPaint }),
        );
        R.add(
          "head",
          P.sweep(
            [
              [0, C[1] + 0.02 * hs, C[2] + 0.1 * hs],
              [0.02 * hs, C[1] - 0.03 * hs, C[2] + 0.13 * hs],
              [0.04 * hs, C[1] - 0.07 * hs, C[2] + 0.12 * hs],
            ],
            0.012 * hs,
            { seg: 4, rs: 5 },
          ),
          cloth(color || 0x8e1d17),
        );
        break;
      }
      case "hood": {
        const rings = [
          {
            y: C[1] - 0.16 * hs,
            rx: 0.15 * hs,
            rz: 0.14 * hs,
            oz: C[2] + 0.03 * hs,
            n: 2,
          },
          {
            y: C[1] - 0.05 * hs,
            rx: 0.115 * hs,
            rz: 0.13 * hs,
            oz: C[2] + 0.015 * hs,
            n: 2,
          },
          {
            y: C[1] + 0.06 * hs,
            rx: 0.112 * hs,
            rz: 0.125 * hs,
            oz: C[2] + 0.012 * hs,
            n: 2,
          },
          {
            y: C[1] + 0.12 * hs,
            rx: 0.085 * hs,
            rz: 0.1 * hs,
            oz: C[2] + 0.02 * hs,
            n: 2,
          },
          {
            y: C[1] + 0.145 * hs,
            rx: 0.03 * hs,
            rz: 0.04 * hs,
            oz: C[2] + 0.04 * hs,
            n: 2,
          },
        ];
        R.add(
          "head",
          P.loft(rings, {
            seg: 18,
            a0: PI * 0.22,
            a1: PI * 1.78,
            capTop: true,
          }),
          cloth(color),
        );
        break;
      }
      case "knit": {
        // close-fitting knit watch cap with a folded cuff
        const rib = (x, y, z, nx, ny, nz, out) => {
          if (Math.abs(Math.sin(Math.atan2(x, z) * 28)) < 0.3) {
            out[0] *= 0.82;
            out[1] *= 0.82;
            out[2] *= 0.82;
          }
        };
        const crown = P.sphere(
          0.098 * hs,
          0.1 * hs,
          0.11 * hs,
          18,
          10,
          0,
          PI * 2,
          0,
          PI * 0.54,
        );
        P.deform(crown, (v) => {
          if (v.y > 0.06 * hs) v.y += (v.y - 0.06 * hs) * 0.3;
        }); // a slightly peaked, slouchy top
        R.add(
          "head",
          P.xf(crown, C[0], C[1] + 0.05 * hs, C[2] + 0.01 * hs),
          cloth(color, { region: "rags", paint: rib }),
        );
        const cuff = P.cyl(0.1 * hs, 0.102 * hs, 0.03 * hs, 20, true);
        cuff.scale(1, 1, 1.1);
        R.add(
          "head",
          P.xf(cuff, C[0], C[1] + 0.062 * hs, C[2] + 0.008 * hs, -0.12, 0, 0),
          cloth(L.shade(color, 0.86), { region: "rags", paint: rib }),
        );
        break;
      }
      case "wrap": {
        // cloth head wrap: a wound band round the brow over a cloth cap, knot at the back
        R.add(
          "head",
          P.xf(
            P.sphere(
              0.098 * hs,
              0.1 * hs,
              0.11 * hs,
              16,
              8,
              0,
              PI * 2,
              0,
              PI * 0.52,
            ),
            C[0],
            C[1] + 0.05 * hs,
            C[2] + 0.008 * hs,
          ),
          cloth(color, { region: "rags" }),
        );
        for (let i = 0; i < 3; i++) {
          const band = P.torus(0.1 * hs, 0.011 * hs, 5, 22);
          band.scale(1, 1, 1.1);
          R.add(
            "head",
            P.xf(
              band,
              C[0],
              C[1] + (0.06 + i * 0.019) * hs,
              C[2] + 0.008 * hs,
              PI / 2 - 0.14 + i * 0.08,
              0,
              (i - 1) * 0.05,
            ),
            cloth(L.shade(color, 0.9 + i * 0.06), { region: "rags" }),
          );
        }
        R.add(
          "head",
          P.xf(
            P.sphere(0.03 * hs, 0.026 * hs, 0.024 * hs, 8, 6),
            C[0] + 0.02 * hs,
            C[1] + 0.03 * hs,
            C[2] + 0.118 * hs,
          ),
          cloth(L.shade(color, 0.85), { region: "rags" }),
        );
        R.add(
          "head",
          P.xf(
            P.box(0.03 * hs, 0.09 * hs, 0.008 * hs, 0.003 * hs),
            C[0] + 0.03 * hs,
            C[1] - 0.025 * hs,
            C[2] + 0.125 * hs,
            -0.15,
            0,
            0.12,
          ),
          cloth(color, { region: "rags" }),
        );
        break;
      }
      case "headphones": {
        R.add(
          "head",
          P.xf(
            P.torus(0.108 * hs, 0.009 * hs, 5, 18, PI),
            C[0],
            C[1] + 0.005 * hs,
            C[2] + 0.005 * hs,
            0,
            PI / 2,
            0,
          ),
          metalM(0x2a2a2a, { metal: 0.3 }),
        );
        for (const sg of [-1, 1])
          R.add(
            "head",
            P.xf(
              P.cyl(0.035 * hs, 0.035 * hs, 0.028 * hs, 12),
              C[0] + sg * 0.1 * hs,
              C[1] - 0.005 * hs,
              C[2] + 0.005 * hs,
              0,
              0,
              PI / 2,
            ),
            leatherM(0x1a1a1a),
          );
        R.add(
          "head",
          P.sweep(
            [
              [-0.11 * hs, C[1] - 0.02 * hs, C[2]],
              [-0.09 * hs, C[1] - 0.06 * hs, C[2] - 0.07 * hs],
              [-0.03 * hs, C[1] - 0.06 * hs, C[2] - 0.11 * hs],
            ],
            0.004 * hs,
            { seg: 6, rs: 4 },
          ),
          metalM(0x303030),
        );
        R.add(
          "head",
          P.xf(
            P.sphere(0.012 * hs, 0.012 * hs, 0.012 * hs, 8, 6),
            -0.03 * hs,
            C[1] - 0.06 * hs,
            C[2] - 0.11 * hs,
          ),
          leatherM(0x111111),
        );
        break;
      }
    }
  };
