// play-inline-457 11 — out
// Lines 2475-2784 of readable/play-inline-457.pretty.js (statement-aligned).
  H.mask = function (R, b, kind, color, color2) {
    const hs = b.headS,
      C = HC(b);
    if (kind === "hockey") {
      const g = P.shell(
        0.097 * hs,
        0.12 * hs,
        0.104 * hs,
        16,
        12,
        PI * 0.78,
        PI * 0.12,
        PI * 0.62,
      );
      P.xf(g, C[0], C[1] - 0.005 * hs, C[2] - 0.008 * hs);
      R.add("head", g, {
        color: color || 0xd8d2c0,
        rough: 0.4,
        noise: 0.25,
        paint: (x, y, z, nx, ny, nz, out) => {
          if (
            Math.abs(y - C[1] - 0.012 * hs) < 0.012 * hs &&
            Math.abs(Math.abs(x) - 0.033 * hs) < 0.017 * hs
          ) {
            out[0] = out[1] = out[2] = 0.02;
          }
          if (L.hash3(x * 900, y * 900, z * 900) > 0.93) {
            out[0] *= 0.2;
            out[1] *= 0.2;
            out[2] *= 0.2;
          }
          if (Math.abs(x + 0.02 * hs) < 0.005 * hs && y < C[1]) {
            out[0] = 0.5;
            out[1] = 0.08;
            out[2] = 0.05;
          }
        },
      });
    } else if (kind === "gasmask") {
      const g = P.shell(
        0.099 * hs,
        0.112 * hs,
        0.108 * hs,
        18,
        12,
        PI * 0.95,
        PI * 0.2,
        PI * 0.62,
      );
      P.xf(g, C[0], C[1] - 0.01 * hs, C[2] - 0.004 * hs);
      R.add("head", g, {
        color: 0x2e3029,
        region: "rubber",
        rough: 0.8,
        noise: 0.1,
      });
      // head straps
      for (const yy of [0.03, -0.045])
        R.add(
          "head",
          P.xf(
            P.torus(0.101 * hs, 0.005 * hs, 4, 20, PI * 1.1),
            C[0],
            C[1] + yy * hs,
            C[2] + 0.004 * hs,
            PI / 2,
            0,
            PI * 0.95 + PI,
          ),
          { color: 0x262622, region: "rubber", rough: 0.85 },
        );
      for (const sg of [-1, 1])
        R.add(
          "head",
          P.xf(
            P.cyl(0.024 * hs, 0.024 * hs, 0.012 * hs, 14),
            sg * 0.036 * hs,
            C[1] + 0.014 * hs,
            C[2] - 0.1 * hs,
            PI / 2,
            0,
            0,
          ),
          { color: 0x7a8a70, rough: 0.05, metal: 0.4, emis: 0.05 },
        );
      R.add(
        "head",
        P.xf(
          P.cyl(0.03 * hs, 0.036 * hs, 0.05 * hs, 12),
          0,
          C[1] - 0.06 * hs,
          C[2] - 0.11 * hs,
          PI / 2 + 0.3,
          0,
          0,
        ),
        metalM(0x4a4a44),
      );
      R.add(
        "head",
        P.xf(
          P.cyl(0.037 * hs, 0.037 * hs, 0.006 * hs, 12),
          0,
          C[1] - 0.068 * hs,
          C[2] - 0.135 * hs,
          PI / 2 + 0.3,
          0,
          0,
        ),
        { color: 0x151515, region: "grille" },
      );
    } else if (kind === "respirator") {
      // industrial half-mask: rubber cup over nose & mouth, two small side cartridges, one strap
      const g = P.shell(
        0.1 * hs,
        0.07 * hs,
        0.11 * hs,
        16,
        8,
        PI * 0.75,
        PI * 0.58,
        PI * 0.3,
      );
      P.xf(g, C[0], C[1] - 0.03 * hs, C[2] - 0.006 * hs);
      R.add("head", g, {
        color: color || 0x3a3632,
        region: "rubber",
        rough: 0.75,
        noise: 0.12,
      });
      for (const sg of [-1, 1]) {
        R.add(
          "head",
          P.xf(
            P.cyl(0.022 * hs, 0.022 * hs, 0.022 * hs, 12),
            sg * 0.05 * hs,
            C[1] - 0.06 * hs,
            C[2] - 0.085 * hs,
            PI / 2,
            sg * 0.6,
            0,
          ),
          metalM(0x8a7a5a, { rough: 0.5, metal: 0.4 }),
        );
        R.add(
          "head",
          P.xf(
            P.cyl(0.018 * hs, 0.018 * hs, 0.004 * hs, 12),
            sg * 0.058 * hs,
            C[1] - 0.06 * hs,
            C[2] - 0.096 * hs,
            PI / 2,
            sg * 0.6,
            0,
          ),
          { color: 0xd8d0b8, region: "rags", rough: 0.95 },
        );
      }
      R.add(
        "head",
        P.xf(
          P.torus(0.102 * hs, 0.005 * hs, 4, 20, PI * 1.1),
          C[0],
          C[1] - 0.04 * hs,
          C[2] + 0.004 * hs,
          PI / 2,
          0,
          PI * 0.95 + PI,
        ),
        { color: 0x262622, region: "rubber", rough: 0.85 },
      );
    } else if (kind === "bandit") {
      const g = P.shell(
        0.101 * hs,
        0.085 * hs,
        0.112 * hs,
        16,
        8,
        PI * 1.05,
        PI * 0.55,
        PI * 0.36,
      );
      P.xf(g, C[0], C[1] - 0.012 * hs, C[2] - 0.002 * hs);
      R.add("head", g, cloth(color || 0x6a2a20, { paint: dotPaint }));
      R.add(
        "head",
        P.xf(
          P.cone(0.05 * hs, 0.08 * hs, 8),
          0,
          C[1] - 0.105 * hs,
          C[2] - 0.085 * hs,
          PI,
          0,
          0,
          1,
          1,
          0.4,
        ),
        cloth(color || 0x6a2a20),
      );
    } else if (kind === "scarf") {
      // cloth scarf wound round the neck and pulled up over the nose & mouth (plain weave, coloured bands)
      const band = (x, y, z, nx, ny, nz, out) => {
        if (Math.abs(Math.sin(((y - C[1]) / hs) * 160)) < 0.22) {
          out[0] *= 0.8;
          out[1] *= 0.8;
          out[2] *= 0.8;
        }
      };
      const g = P.shell(
        0.104 * hs,
        0.1 * hs,
        0.118 * hs,
        18,
        9,
        PI * 2,
        PI * 0.54,
        PI * 0.42,
      );
      P.deform(g, (v) => {
        const f = Math.max(0, -v.z / (0.118 * hs));
        v.z -= f * 0.008 * hs;
        v.x *= 1 + (L.noise3(v.x * 90, v.y * 90, v.z * 90) - 0.5) * 0.06;
      });
      P.xf(g, C[0], C[1] - 0.004 * hs, C[2] + 0.002 * hs);
      R.add(
        "head",
        g,
        cloth(color || 0x8e4e34, { region: "rags", paint: band }),
      );
      R.add(
        "head",
        P.xf(
          P.torus(0.098 * hs, 0.018 * hs, 6, 18),
          C[0],
          C[1] - 0.105 * hs,
          C[2] + 0.006 * hs,
          PI / 2 + 0.12,
          0,
          0,
          1,
          1.14,
          1,
        ),
        cloth(L.shade(color || 0x8e4e34, 0.9), { region: "rags" }),
      );
    } else if (kind === "bandage") {
      // linen bandage strips wound across the face: brow band, one diagonal over an eye, one under the jaw
      const lin = cloth(color || 0xcfc6b0, { region: "rags", rough: 1 });
      const strip = (t0, tl, rz, dy) => {
        const g = P.shell(
          0.099 * hs,
          0.121 * hs,
          0.116 * hs,
          18,
          2,
          PI * 1.25,
          t0,
          tl,
        );
        P.xf(g, 0, 0, 0, 0, 0, rz);
        P.xf(g, C[0], C[1] + (dy || 0) * hs, C[2] - 0.002 * hs);
        R.add("head", g, lin);
      };
      strip(PI * 0.3, PI * 0.075, 0.04);
      strip(PI * 0.42, PI * 0.07, color2Side(color2) * 0.42, 0.004);
      strip(PI * 0.63, PI * 0.085, -0.06);
      for (const sg of [-1, 1])
        R.add(
          "head",
          P.xf(
            P.box(0.02 * hs, 0.05 * hs, 0.006 * hs, 0.002 * hs),
            sg * 0.07 * hs,
            C[1] - 0.02 * hs,
            C[2] - 0.06 * hs,
            0,
            sg * 0.9,
            sg * 0.3,
          ),
          lin,
        ); // loose ends
    } else if (kind === "sack") {
      const g = P.sphere(0.104 * hs, 0.132 * hs, 0.112 * hs, 14, 10);
      P.deform(g, (v) => {
        v.x += (L.noise3(v.x * 90, v.y * 90, v.z * 90) - 0.5) * 0.008 * hs;
      });
      P.xf(g, C[0], C[1], C[2]);
      R.add(
        "head",
        g,
        cloth(0x9a8a64, {
          region: "rags",
          paint: (x, y, z, nx, ny, nz, out) => {
            if (
              nz < -0.5 &&
              Math.abs(y - C[1] - 0.012 * hs) < 0.013 * hs &&
              Math.abs(Math.abs(x) - 0.035 * hs) < 0.013 * hs
            ) {
              out[0] = out[1] = out[2] = 0.02;
            }
          },
        }),
      );
    }
  };

  H.hat = narrowHead(H.hat);
  H.mask = narrowHead(H.mask);

  /** Belt with buckle and optional pouches (on hips bone). */
