/* src/poi_penn/09_detail.js */
/* =====================================================================
 * NEW RAD CITY — poi_penn / 09_detail.js   (round 2)
 * Detail helpers added in loop round 2:
 *   K.shaftCell / K.shaft   additive dusty light shafts (two crossed tapered quads) — replace the
 *                           "floating orb" glow motes under broken skylights and tall windows
 *   K.awningCell            striped canvas with a torn, rotted hem (alpha-tested 'art' atlas)
 *   K.shopfront             a real old-world storefront bay on a façade: bronze bulkhead, display
 *                           window (clear dirty glass over a dark shop with goods), mullions,
 *                           transom lights, tattered awning; states glass / broken / boarded
 *   K.barberPole            the striped pole (helix of red/blue bands) with chrome finials
 *   K.suitcase / K.trunk    luggage that reads as luggage (straps, corner guards, handle, labels)
 *   K.bunting               faded Civil Defense Week bunting swags between two points
 *   K.stairRunner           a continuous carpet runner draped over a flight (treads + risers)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._ppn;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // ------------------------------------------------------------------
  // Light shafts
  // ------------------------------------------------------------------
  K.shaftCell = function () {
    return K.paint("neon", "ppn_shaft", 64, 256, function (x, X, Y, W, H) {
      const img = x.createImageData(W, H),
        d = img.data,
        r = K.rng("shaft");
      const streak = [];
      for (let i = 0; i < W; i++)
        streak.push(
          0.75 + 0.25 * Math.sin(i * 0.61 + r() * 2) * Math.sin(i * 0.23),
        );
      for (let j = 0; j < H; j++) {
        const v = j / (H - 1); // 0 = top (at the opening)
        const fv = Math.min(1, v * 14) * Math.pow(1 - v, 1.35);
        for (let i = 0; i < W; i++) {
          const u = i / (W - 1),
            fh = Math.pow(Math.sin(PI * u), 1.6);
          const val = Math.round(255 * fv * fh * streak[i]);
          const o = (j * W + i) * 4;
          d[o] = val;
          d[o + 1] = val;
          d[o + 2] = val;
          d[o + 3] = 255;
        }
      }
      x.putImageData(img, X, Y);
    });
  };
  /**
   * Dusty light shaft from a top opening (tx,ty,tz) down to (bx,by,bz): two crossed quads (reads from any side).
   * wTop / wBot widths, col additive colour (keep it low: 0.06..0.2).
   */
  K.shaft = function (b, tx, ty, tz, bx, by, bz, wTop, wBot, col) {
    const rect = K.shaftCell();
    for (const [sx, sz] of [
      [1, 0],
      [0, 1],
    ]) {
      const a = wTop / 2,
        c = wBot / 2;
      b.quad(
        "neon",
        [bx - sx * c, by, bz - sz * c],
        [bx + sx * c, by, bz + sz * c],
        [tx + sx * a, ty, tz + sz * a],
        [tx - sx * a, ty, tz - sz * a],
        { rect, tint: col, grime: 0 },
      );
    }
  };

  // ------------------------------------------------------------------
  // Awning canvas: stripes, sun-bleach, rot holes along the hem (alpha-tested)
  // ------------------------------------------------------------------
  K.awningCell = function (key, c1, c2) {
    return K.paint(
      "art",
      "ppn_awning_" + key,
      256,
      128,
      function (x, X, Y, W, H) {
        const r = K.rng("aw" + key);
        x.clearRect(X, Y, W, H);
        const n = 9,
          sw = W / n;
        for (let i = 0; i < n; i++) {
          x.fillStyle = i % 2 ? c2 : c1;
          x.fillRect(X + i * sw, Y, sw + 1, H);
        }
        // sun-bleach toward the top (outer slope), grime toward the hem
        let g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "rgba(235,225,200,0.35)");
        g.addColorStop(0.6, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(30,22,14,0.45)");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        K.stains(x, X, Y, W, H, 14, 700 + key.length, 0.4, [40, 30, 18]);
        K.grain(x, X, Y, W, H, 26, 701);
        // scalloped / torn hem: cut out below a ragged line; a few rot holes
        x.globalCompositeOperation = "destination-out";
        x.beginPath();
        x.moveTo(X, Y + H);
        for (let i = 0; i <= 32; i++) {
          const px = X + (i * W) / 32;
          const t =
            r() < 0.18 ? H * (0.35 + r() * 0.3) : H * (0.08 + r() * 0.08);
          x.lineTo(px, Y + H - t);
        }
        x.lineTo(X + W, Y + H);
        x.closePath();
        x.fill();
        for (let k = 0; k < 5; k++) {
          x.beginPath();
          x.ellipse(
            X + r() * W,
            Y + H * (0.3 + r() * 0.4),
            4 + r() * 10,
            3 + r() * 7,
            r() * 3,
            0,
            6.3,
          );
          x.fill();
        }
        x.globalCompositeOperation = "source-over";
      },
    );
  };

  // ------------------------------------------------------------------
  // Storefront bay on an axis-aligned façade (outward normal nx,nz; facade plane through cx,cz)
  // ------------------------------------------------------------------
  /**
   * o: {state:'glass'|'broken'|'boarded'|'dark', goods:'hats'|'news'|'barber'|'flowers'|'travel'|'fizzo'|'none',
   *     awning:[c1,c2]|null, depth (0.45), h (3.2), seed}
   * The bay protrudes `depth` from the façade (bulkhead + display box), gets its own collider.
   */
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
  K.clockCell = function (h, m) {
    return K.paint(
      "art",
      "ppn_clock_" + h + "_" + m,
      128,
      128,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const cx = X + W / 2,
          cy = Y + H / 2;
        x.fillStyle = "#b8924a";
        x.beginPath();
        x.arc(cx, cy, 62, 0, 6.3);
        x.fill();
        x.fillStyle = "#e8e0c8";
        x.beginPath();
        x.arc(cx, cy, 54, 0, 6.3);
        x.fill();
        x.fillStyle = "#1a1208";
        x.font = "bold 11px Georgia";
        x.textAlign = "center";
        x.textBaseline = "middle";
        for (let k = 1; k <= 12; k++) {
          const a = (k / 12) * PI * 2 - HP;
          x.fillText(
            [
              "I",
              "II",
              "III",
              "IV",
              "V",
              "VI",
              "VII",
              "VIII",
              "IX",
              "X",
              "XI",
              "XII",
            ][k - 1],
            cx + Math.cos(a) * 44,
            cy + Math.sin(a) * 44,
          );
        }
        x.strokeStyle = "#1a1208";
        x.lineWidth = 4;
        const ha = ((h + m / 60) / 12) * PI * 2 - HP,
          ma = (m / 60) * PI * 2 - HP;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(ha) * 26, cy + Math.sin(ha) * 26);
        x.stroke();
        x.lineWidth = 2.5;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(ma) * 38, cy + Math.sin(ma) * 38);
        x.stroke();
        x.fillStyle = "#1a1208";
        x.font = "bold 6px Arial";
        x.fillText("U.S. POST OFFICE", cx, cy + 16);
        x.strokeStyle = "rgba(40,30,20,0.6)";
        x.lineWidth = 1;
        x.beginPath();
        x.moveTo(cx - 40, cy - 20);
        x.lineTo(cx + 10, cy + 40);
        x.stroke();
        K.grain(x, X, Y, W, H, 24, 5021);
      },
    );
  };

  /** Continuous runner over a straight flight (dir '-z'|'+z'|'-x'|'+x' as K.stairs): tread tops + riser faces. */
  K.stairRunner = function (b, x0, z0, x1, z1, y0, y1, dir, w, o) {
    o = o || {};
    const rise = y1 - y0,
      n = Math.max(1, Math.ceil(Math.abs(rise) / (o.maxRise || 0.24)));
    const along = dir === "+x" || dir === "-x",
      len = along ? x1 - x0 : z1 - z0,
      run = len / n,
      hw = w / 2;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2,
      mat = o.mat || "carpet",
      tint = o.tint || [0.62, 0.2, 0.16];
    for (let i = 0; i < n; i++) {
      const top = y0 + (rise * (i + 1)) / n,
        bot = y0 + (rise * i) / n,
        e = 0.006;
      if (dir === "-z") {
        const zf = z1 - run * i,
          zb = zf - run;
        b.face(mat, cx - hw, top + e, zf, 1, 0, 0, 0, 0, -1, w, run, {
          uv: "top",
          tint,
        });
        b.face(mat, cx - hw, bot, zf + e, 1, 0, 0, 0, 1, 0, w, top - bot, {
          tint: tint.map((v) => v * 0.85),
        });
      } else if (dir === "+z") {
        const zf = z0 + run * i;
        b.face(mat, cx - hw, top + e, zf + run, 1, 0, 0, 0, 0, -1, w, run, {
          uv: "top",
          tint,
        });
        b.face(mat, cx + hw, bot, zf - e, -1, 0, 0, 0, 1, 0, w, top - bot, {
          tint: tint.map((v) => v * 0.85),
        });
      } else if (dir === "-x") {
        const xf = x1 - run * i;
        b.face(mat, xf - run, top + e, cz + hw, 1, 0, 0, 0, 0, -1, run, w, {
          uv: "top",
          tint,
        });
        b.face(mat, xf + e, bot, cz + hw, 0, 0, -1, 0, 1, 0, w, top - bot, {
          tint: tint.map((v) => v * 0.85),
        });
      } else {
        const xf = x0 + run * i;
        b.face(mat, xf, top + e, cz + hw, 1, 0, 0, 0, 0, -1, run, w, {
          uv: "top",
          tint,
        });
        b.face(mat, xf - e, bot, cz - hw, 0, 0, 1, 0, 1, 0, w, top - bot, {
          tint: tint.map((v) => v * 0.85),
        });
      }
      if (o.rods) {
        const yy = bot + 0.02;
        if (dir === "-z")
          b.pipe(
            "brass",
            cx - hw - 0.05,
            yy,
            z1 - run * i - 0.03,
            cx + hw + 0.05,
            yy,
            z1 - run * i - 0.03,
            0.012,
            4,
            { tint: [0.9, 0.9, 0.9] },
          );
      }
    }
  };
})();
