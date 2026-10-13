// play-inline-386 02 — math
// Lines 21-144 of readable/play-inline-386.pretty.js (statement-aligned).
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
