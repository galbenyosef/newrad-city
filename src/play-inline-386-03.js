// play-inline-386 03 — tint
// Lines 145-614 of readable/play-inline-386.pretty.js (statement-aligned).
  K.shopfront = function (b, cx, cz, nx, nz, w, o) {
    o = o || {};
    const r = K.rng("shop" + (o.seed || 0));
    const rx = nz,
      rz = -nx,
      D = o.depth || 0.45,
      H = o.h || 3.2,
      BH = 0.55,
      TR = 2.62;
    const P = (u, d) => [cx + rx * u + nx * d, cz + rz * u + nz * d];
    const boxUD = (mat, u0, d0, y0, u1, d1, y1, opt) => {
      const a = P(u0, d0),
        c = P(u1, d1);
      b.boxMM(mat, a[0], y0, a[1], c[0], y1, c[1], opt);
    };
    const hw = w / 2;
    const bronze = { tint: [0.42, 0.36, 0.24] };
    // dark shop interior behind the glass (back plate on the façade) + display floor
    {
      const c = P(0, 0.012);
      b.plate(
        "paint_black",
        c[0],
        BH + (TR - BH) / 2,
        c[1],
        nx,
        nz,
        w - 0.1,
        TR - BH,
        null,
        { tint: [0.05, 0.045, 0.04], off: 0 },
      );
    }
    boxUD("wood_dark", -hw, 0, BH - 0.04, hw, D - 0.05, BH, {
      tint: [0.4, 0.3, 0.22],
      faces: "t",
    });
    // bulkhead (bronze kick panel with two raised fields)
    boxUD("bronze", -hw, D - 0.08, 0, hw, D, BH, bronze);
    for (const s of [-1, 1])
      boxUD(
        "bronze",
        s * hw * 0.5 - hw * 0.42,
        D,
        0.12,
        s * hw * 0.5 + hw * 0.42,
        D + 0.02,
        BH - 0.1,
        { tint: [0.5, 0.42, 0.28] },
      );
    // side returns + head + transom bar
    for (const s of [-1, 1])
      boxUD("bronze", s * hw - 0.06, 0, 0, s * hw + 0.06, D + 0.02, H, bronze);
    boxUD("bronze", -hw, 0, TR, hw, D + 0.02, TR + 0.14, bronze);
    boxUD(
      "bronze",
      -hw - 0.06,
      0,
      H - 0.08,
      hw + 0.06,
      D + 0.06,
      H + 0.06,
      Object.assign({ faces: "nsewtb" }, bronze),
    );
    // transom lights (prism glass, dim) with a grille
    {
      const c = P(0, D - 0.02);
      b.plate(
        "glass",
        c[0],
        (TR + 0.14 + H - 0.08) / 2,
        c[1],
        nx,
        nz,
        w - 0.1,
        H - 0.08 - TR - 0.14,
        null,
        { tint: [0.55, 0.58, 0.5], off: 0 },
      );
    }
    for (let q = 1; q < 6; q++) {
      const a = P(-hw + (q * w) / 6, D);
      b.beam(
        "bronze",
        a[0],
        TR + 0.14,
        a[1],
        a[0],
        H - 0.08,
        a[1],
        0.025,
        0.025,
        bronze,
      );
    }
    // mullions (display window in three lights)
    for (const u of [-w / 6, w / 6]) {
      const a = P(u, D - 0.03);
      b.beam("bronze", a[0], BH, a[1], a[0], TR, a[1], 0.07, 0.05, bronze);
    }
    // goods on the display floor
    const G0 = (u, d) => P(u, 0.1 + d * (D - 0.25));
    const goods = o.goods || "none";
    if (o.state !== "boarded") {
      if (goods === "hats")
        for (let k = 0; k < 4; k++) {
          const p = G0(-hw + 0.35 + (k * (w - 0.7)) / 3, r());
          const hh = 0.9 + r() * 0.5;
          b.pipe("chrome", p[0], BH, p[1], p[0], BH + hh, p[1], 0.012, 4);
          if (k !== 2) {
            b.cyl("fabric", p[0], BH + hh, p[1], 0.19, 0.19, 0.012, 12, {
              tint: r.pick([
                [0.3, 0.26, 0.22],
                [0.5, 0.44, 0.36],
                [0.22, 0.22, 0.24],
              ]),
            });
            b.cyl("fabric", p[0], BH + hh + 0.012, p[1], 0.11, 0.1, 0.12, 12, {
              tint: [0.28, 0.24, 0.2],
            });
          }
        }
      else if (goods === "news") {
        for (let k = 0; k < 7; k++) {
          const p = G0(-hw + 0.3 + r() * (w - 0.6), r());
          b.box("flat", p[0], BH, p[1], 0.42, 0.04 + r() * 0.2, 0.3, {
            yaw: r() * 0.6,
            tint: [0.78, 0.76, 0.68],
          });
        }
        const p = G0(0, 0.2);
        b.plate(
          "art",
          p[0],
          BH + 1.1,
          p[1] - nz * 0.0,
          nx,
          nz,
          0.7,
          0.9,
          K.posterCell("wanted"),
          { off: 0.05 },
        );
      } else if (goods === "barber") {
        const p = G0(0, 0.5);
        b.cyl("ceramic", p[0], BH, p[1], 0.22, 0.26, 0.4, 10, {
          tint: [0.8, 0.78, 0.72],
        });
        b.box("leather_red", p[0], BH + 0.4, p[1], 0.55, 0.14, 0.5, {
          tint: [0.8, 0.9, 0.9],
        });
        const q = P(0, 0.2);
        b.plate("glass", q[0], BH + 1.35, q[1], nx, nz, 0.7, 0.9, null, {
          tint: [0.7, 0.72, 0.7],
          off: 0,
        });
      } else if (goods === "flowers")
        for (let k = 0; k < 5; k++) {
          const p = G0(-hw + 0.3 + (k * (w - 0.6)) / 4, r());
          b.cyl("rust", p[0], BH, p[1], 0.13, 0.11, 0.3, 8, {
            tint: [0.7, 0.6, 0.5],
          });
          for (let q = 0; q < 5; q++)
            b.pipe(
              "wood_rotten",
              p[0],
              BH + 0.28,
              p[1],
              p[0] + (r() - 0.5) * 0.4,
              BH + 0.55 + r() * 0.45,
              p[1] + (r() - 0.5) * 0.4,
              0.008,
              3,
              { tint: [0.45, 0.36, 0.22] },
            );
        }
      else if (goods === "travel") {
        for (const [u, kind] of [
          [-w / 3, "anchorage"],
          [0, "rooms"],
          [w / 3, "rad"],
        ]) {
          const p = G0(u, 0.3);
          b.plate(
            "art",
            p[0],
            BH + 1.05,
            p[1],
            nx,
            nz,
            0.6,
            0.8,
            K.posterCell(kind),
            { off: 0.0 },
          );
        }
        b.geo("paint_blue", K.sphereGeo(), {
          x: G0(0, 0.7)[0],
          y: BH + 0.3,
          z: G0(0, 0.7)[1],
          s: 0.26,
          tint: [0.7, 0.8, 0.9],
        });
      } else if (goods === "fizzo") {
        const p = P(0, D - 0.12);
        b.plate(
          "neon",
          p[0],
          BH + 1.5,
          p[1],
          nx,
          nz,
          1.5,
          0.42,
          K.neonCell("ppn_fizzo_win", "Fizzo Cola", 384, 110, {
            color: "#ff3030",
            font: "Georgia, serif",
            italic: true,
            broken: 1,
          }),
          { off: 0 },
        );
        for (let k = 0; k < 8; k++) {
          const q = G0(-hw + 0.25 + (k * (w - 0.5)) / 7, 0.3 + (k % 2) * 0.4);
          b.geo("glass_dark", K.unitCyl(8), {
            x: q[0],
            y: BH,
            z: q[1],
            sx: 0.04,
            sy: 0.24,
            sz: 0.04,
            tint: [0.3, 0.12, 0.08],
          });
        }
      }
    }
    // the front: glass (clear & dirty), broken glass (shards + a hole), or boards
    const st = o.state || "glass";
    const front = P(0, D - 0.03);
    if (st === "boarded") {
      b.plate(
        "wood_rotten",
        front[0],
        BH + (TR - BH) / 2,
        front[1],
        nx,
        nz,
        w - 0.08,
        TR - BH,
        null,
        { tint: [0.62, 0.52, 0.4], off: 0.02 },
      );
      for (let q = 0; q < 5; q++) {
        const y = BH + 0.2 + (q * (TR - BH - 0.4)) / 4 + (r() - 0.5) * 0.12,
          a = P(-hw + 0.05, D + 0.05),
          c = P(hw - 0.05, D + 0.05);
        b.beam(
          "wood_rotten",
          a[0],
          y,
          a[1],
          c[0],
          y + (r() - 0.5) * 0.25,
          c[1],
          0.16,
          0.03,
          { tint: [0.55, 0.46, 0.36] },
        );
      }
      if (o.tag) {
        const c = P(0, D + 0.08);
        b.plate(
          "decal",
          c[0],
          BH + 1.1,
          c[1],
          nx,
          nz,
          w * 0.8,
          0.7,
          K.tag(o.tag, "#e0d8c0", 384, 96, {}),
          { off: 0 },
        );
      }
    } else {
      const panes = [
        [-hw, -w / 6],
        [-w / 6, w / 6],
        [w / 6, hw],
      ];
      panes.forEach(([u0, u1], i) => {
        const c = P((u0 + u1) / 2, D - 0.03),
          pw = u1 - u0 - 0.06;
        if (st === "broken" && i === (o.seed || 0) % 3) {
          // jagged remnant along the bottom and one corner
          const a0 = P(u0 + 0.03, D - 0.03),
            a1 = P(u1 - 0.03, D - 0.03);
          b.quad(
            "glass_clear",
            [a0[0], BH, a0[1]],
            [a1[0], BH, a1[1]],
            [a1[0], BH + 0.35 + r() * 0.2, a1[1]],
            [
              a0[0] + (a1[0] - a0[0]) * 0.4,
              BH + 0.9,
              a0[1] + (a1[1] - a0[1]) * 0.4,
            ],
            { tint: [0.7, 0.75, 0.75] },
          );
          b.quad(
            "glass_clear",
            [a0[0], TR - 0.7, a0[1]],
            [
              a0[0] + (a1[0] - a0[0]) * 0.35,
              TR,
              a0[1] + (a1[1] - a0[1]) * 0.35,
            ],
            [a0[0], TR, a0[1]],
            [a0[0], TR - 0.05, a0[1]],
            { tint: [0.7, 0.75, 0.75] },
          );
          for (let q = 0; q < 10; q++) {
            const g = P(u0 + r() * (u1 - u0), D + 0.1 + r() * 0.9);
            b.box(
              "glass",
              g[0],
              0.02,
              g[1],
              0.06 + r() * 0.12,
              0.006,
              0.05 + r() * 0.1,
              { yaw: r() * 3, tint: [0.6, 0.66, 0.66] },
            );
          }
        } else {
          b.plate(
            "glass_clear",
            c[0],
            BH + (TR - BH) / 2,
            c[1],
            nx,
            nz,
            pw,
            TR - BH,
            null,
            { tint: [0.75, 0.78, 0.76], off: 0 },
          );
          if (st === "dark")
            b.plate(
              "paint_black",
              c[0],
              BH + (TR - BH) / 2,
              c[1],
              nx,
              nz,
              pw,
              TR - BH,
              null,
              { tint: [0.06, 0.06, 0.06], off: -0.02 },
            );
          // whitewash / soap scrawl on some panes
          if (r() < 0.3)
            b.plate(
              "decal",
              c[0],
              BH + 1.2,
              c[1],
              nx,
              nz,
              pw * 0.9,
              0.9,
              K.decal("grime", 400 + i),
              { off: 0.005 },
            );
        }
      });
    }
    // lettering on the glass (gilt, if a name is given)
    if (o.glassName && st !== "boarded") {
      const c = P(0, D - 0.01);
      b.plate(
        "art",
        c[0],
        BH + 1.95,
        c[1],
        nx,
        nz,
        w * 0.7,
        0.28,
        K.signCell("ppn_gl_" + o.glassName, o.glassName, 384, 52, {
          bg: null,
          fg: "#d8b050",
          font: "Georgia, serif",
        }),
        { off: 0.004 },
      );
    }
    // tattered awning on iron arms
    if (o.awning) {
      const rect = K.awningCell(o.awningKey || "a", o.awning[0], o.awning[1]);
      const ext = 1.3 + r() * 0.2,
        drop = 0.75,
        y0 = H + 0.3;
      const a0 = P(-hw - 0.1, 0.05),
        a1 = P(hw + 0.1, 0.05),
        e0 = P(-hw - 0.1, D + ext),
        e1 = P(hw + 0.1, D + ext);
      const sag = o.sag || 0;
      b.quadN(
        "art",
        [e0[0], y0 - drop - sag, e0[1]],
        [e1[0], y0 - drop, e1[1]],
        [a1[0], y0, a1[1]],
        [a0[0], y0, a0[1]],
        [nx, 0.8, nz],
        { rect, grime: 0.2 },
      );
      b.quadN(
        "art",
        [a0[0], y0, a0[1]],
        [a1[0], y0, a1[1]],
        [e1[0], y0 - drop, e1[1]],
        [e0[0], y0 - drop - sag, e0[1]],
        [-nx, -0.8, -nz],
        { rect, grime: 0.3, tint: [0.6, 0.6, 0.6] },
      );
      // valance
      b.quadN(
        "art",
        [e0[0], y0 - drop - sag - 0.3, e0[1]],
        [e1[0], y0 - drop - 0.3, e1[1]],
        [e1[0], y0 - drop, e1[1]],
        [e0[0], y0 - drop - sag, e0[1]],
        [nx, 0, nz],
        { rect, grime: 0.2 },
      );
      for (const s of [-1, 1]) {
        const w0 = P(s * (hw + 0.05), 0.02),
          w1 = P(s * (hw + 0.05), D + ext - 0.05);
        b.beam(
          "black_iron",
          w0[0],
          y0 - 0.9,
          w0[1],
          w1[0],
          y0 - drop - 0.02,
          w1[1],
          0.03,
          0.03,
          { tint: [0.3, 0.28, 0.26] },
        );
      }
    }
    // collider for the protruding bay
    {
      const a = P(-hw - 0.06, 0),
        c = P(hw + 0.06, D + 0.02);
      b.col(
        Math.min(a[0], c[0]),
        0,
        Math.min(a[1], c[1]),
        Math.max(a[0], c[0]),
        H,
        Math.max(a[1], c[1]),
        { tag: "building", surface: "metal" },
      );
    }
  };

  /** Barber pole on a wall bracket at (x,z) standing off a façade facing (nx,nz). */
