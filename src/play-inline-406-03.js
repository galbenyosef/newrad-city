// play-inline-406 03 — fillstyle
// Lines 313-640 of readable/play-inline-406.pretty.js (statement-aligned).
  K.photo = function (subject, i, w, h) {
    w = w || 128;
    h = h || 160;
    return K.paint(
      "pics",
      "photo_" + subject + "_" + i,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng(subject + i);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#6e6250");
        g.addColorStop(1, "#2e281e");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#1a1510";
        if (subject === "mug") {
          // mugshot with height chart
          x.fillStyle = "#b8b0a0";
          x.fillRect(X, Y, W, H);
          x.strokeStyle = "#333";
          for (let k = 0; k < 8; k++) {
            x.beginPath();
            x.moveTo(X, Y + (k * H) / 8);
            x.lineTo(X + W * 0.25, Y + (k * H) / 8);
            x.stroke();
          }
          x.fillStyle = "#2a2520";
        }
        // figure: head + shoulders
        const cx = X + W * (0.4 + r() * 0.2);
        x.beginPath();
        x.ellipse(cx, Y + H * 0.36, W * 0.13, H * 0.12, 0, 0, 6.3);
        x.fill();
        x.beginPath();
        x.ellipse(cx, Y + H * 0.85, W * 0.32, H * 0.28, 0, Math.PI, 0);
        x.fill();
        if (subject === "jazz") {
          // instrument
          const t = r();
          x.strokeStyle = "#c8a860";
          x.lineWidth = W * 0.05;
          if (t < 0.4) {
            x.beginPath();
            x.moveTo(cx + W * 0.05, Y + H * 0.45);
            x.quadraticCurveTo(
              cx + W * 0.25,
              Y + H * 0.75,
              cx + W * 0.1,
              Y + H * 0.9,
            );
            x.stroke();
            x.beginPath();
            x.arc(cx + W * 0.1, Y + H * 0.88, W * 0.07, 0, 6.3);
            x.stroke();
          } else if (t < 0.7) {
            x.beginPath();
            x.moveTo(cx - W * 0.02, Y + H * 0.42);
            x.lineTo(cx + W * 0.35, Y + H * 0.38);
            x.stroke();
            x.beginPath();
            x.arc(cx + W * 0.38, Y + H * 0.38, W * 0.06, 0, 6.3);
            x.fill();
          } else {
            x.fillStyle = "#4a3020";
            x.beginPath();
            x.ellipse(
              cx + W * 0.15,
              Y + H * 0.8,
              W * 0.16,
              H * 0.2,
              0.2,
              0,
              6.3,
            );
            x.fill();
            x.fillRect(cx + W * 0.13, Y + H * 0.2, W * 0.03, H * 0.45);
          }
          x.fillStyle = "rgba(255,240,200,0.25)";
          x.beginPath();
          x.arc(X + W * 0.8, Y + H * 0.15, W * 0.25, 0, 6.3);
          x.fill();
        }
        if (subject === "deli") {
          x.fillStyle = "#e8e0d0";
          x.fillRect(X + W * 0.05, Y + H * 0.05, W * 0.9, H * 0.08);
          x.fillStyle = "#1a1510";
          x.font = "bold " + ((H * 0.06) | 0) + "px Georgia";
          x.textAlign = "center";
          x.fillText(
            r.pick([
              "To Katz — Love!",
              "Best pastrami!",
              "xoxo",
              "Thanks Irv!",
              "Worth the wait",
            ]),
            X + W / 2,
            Y + H * 0.11,
          );
        }
        // sepia + border
        x.fillStyle = "rgba(160,120,60,0.22)";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#e8e0cc";
        x.lineWidth = W * 0.05;
        x.strokeRect(X + W * 0.025, Y + W * 0.025, W - W * 0.05, H - W * 0.05);
        K.stains(
          x,
          X,
          Y,
          W,
          H,
          4,
          (i * 7 + subject.length) | 0,
          0.4,
          [60, 40, 20],
        );
      },
    );
  };
  /** Decals with alpha: 'blood', 'puddle', 'crack', 'scorch', 'grime', 'rad' (glowing green puddle), 'paint' (splatter), 'tag' (graffiti text). */
  K.decal = function (kind, i) {
    i = i || 0;
    return K.paint(
      "art",
      "decal_" + kind + "_" + i,
      128,
      128,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const r = K.rng(kind + i);
        const cx = X + W / 2,
          cy = Y + H / 2;
        const blob = (col, n, rad) => {
          for (let k = 0; k < n; k++) {
            const a = r() * 6.3,
              d = r() * rad;
            const g = x.createRadialGradient(
              cx + Math.cos(a) * d,
              cy + Math.sin(a) * d,
              0,
              cx + Math.cos(a) * d,
              cy + Math.sin(a) * d,
              rad * (0.3 + r() * 0.5),
            );
            g.addColorStop(0, col(0.8));
            g.addColorStop(1, col(0));
            x.fillStyle = g;
            x.fillRect(X, Y, W, H);
          }
        };
        if (kind === "blood") {
          blob((a) => "rgba(90,10,8," + a + ")", 10, W * 0.3);
          for (let k = 0; k < 20; k++) {
            x.fillStyle = "rgba(80,8,6,0.8)";
            x.beginPath();
            x.arc(
              cx + (r() - 0.5) * W * 0.9,
              cy + (r() - 0.5) * H * 0.9,
              1 + r() * 4,
              0,
              6.3,
            );
            x.fill();
          }
        } else if (kind === "puddle")
          blob((a) => "rgba(20,25,20," + a * 0.8 + ")", 8, W * 0.3);
        else if (kind === "rad")
          blob((a) => "rgba(90,255,60," + a * 0.7 + ")", 9, W * 0.3);
        else if (kind === "scorch")
          blob((a) => "rgba(10,8,6," + a + ")", 12, W * 0.32);
        else if (kind === "grime")
          blob((a) => "rgba(50,40,25," + a * 0.7 + ")", 14, W * 0.35);
        else if (kind === "paint") {
          const cols = [
            "220,40,30",
            "30,80,200",
            "240,200,40",
            "30,160,90",
            "240,240,230",
          ];
          for (let k = 0; k < 5; k++) {
            const c = cols[(k + i) % 5];
            blob((a) => "rgba(" + c + "," + a + ")", 2, W * 0.2);
          }
        } else if (kind === "crack") {
          x.strokeStyle = "rgba(15,12,10,0.8)";
          x.lineWidth = 1.5;
          for (let k = 0; k < 6; k++) {
            x.beginPath();
            let px = cx,
              py = cy;
            x.moveTo(px, py);
            for (let s = 0; s < 6; s++) {
              px += (r() - 0.5) * 40;
              py += (r() - 0.5) * 40;
              x.lineTo(px, py);
            }
            x.stroke();
          }
        } else if (kind === "roach") {
          // egg sacs & slime
          blob((a) => "rgba(120,110,40," + a * 0.7 + ")", 10, W * 0.35);
          for (let k = 0; k < 18; k++) {
            x.fillStyle = "rgba(220,200,140,0.85)";
            x.beginPath();
            x.ellipse(
              cx + (r() - 0.5) * W * 0.6,
              cy + (r() - 0.5) * H * 0.6,
              3 + r() * 4,
              2 + r() * 2,
              r() * 3,
              0,
              6.3,
            );
            x.fill();
          }
        }
      },
    );
  };
  /** Graffiti text decal (alpha) */
  K.tag = function (text, color, w, h, o) {
    o = o || {};
    return K.paint(
      "art",
      "tag_" + text + color,
      w || 256,
      h || 96,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        x.save();
        x.translate(X + W / 2, Y + H / 2);
        x.rotate(o.rot || -0.05);
        x.font =
          "bold " +
          Math.round(H * (o.size || 0.55)) +
          "px " +
          (o.font || "Impact, Arial Black, sans-serif");
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.lineWidth = H * 0.06;
        x.strokeStyle = "rgba(0,0,0,0.6)";
        x.strokeText(text, 0, 0, W * 0.95);
        x.fillStyle = color || "#d02020";
        x.fillText(text, 0, 0, W * 0.95);
        // drips
        const r = K.rng(text);
        for (let k = 0; k < 8; k++) {
          const px = (r() - 0.5) * W * 0.8;
          x.fillRect(px, H * 0.1, 2, H * (0.1 + r() * 0.3));
        }
        x.restore();
      },
    );
  };

  // ------------------------------------------------------------------
  // Framed picture on a wall (local coords): (x,y,z) wall surface point, facing (nx,nz)
  // ------------------------------------------------------------------
  K.framed = function (b, x, y, z, nx, nz, w, h, rect, o) {
    o = o || {};
    const fm = o.frame || "gold";
    const rx = nz,
      rz = -nx,
      t = o.fw || 0.06,
      d = o.depth || 0.04;
    const P = (u, v, dd) => [x + rx * u + nx * dd, y + v, z + rz * u + nz * dd];
    // canvas
    const c0 = P(-w / 2, -h / 2, d),
      c1 = P(w / 2, -h / 2, d),
      c2 = P(w / 2, h / 2, d),
      c3 = P(-w / 2, h / 2, d);
    b.quad("art", c0, c1, c2, c3, {
      rect,
      grime: 0,
      tint: o.tint || [0.95, 0.92, 0.85],
    });
    if (o.frame === false) return;
    // frame bars
    const bar = (u0, v0, u1, v1) => {
      const a = P(u0, v0, d / 2),
        bb = P(u1, v1, d / 2);
      b.beam(fm, a[0], a[1], a[2], bb[0], bb[1], bb[2], t, d + 0.02, {
        grime: 0.2,
        tint: o.frameTint,
      });
    };
    bar(-w / 2 - t / 2, -h / 2 - t / 2, w / 2 + t / 2, -h / 2 - t / 2);
    bar(-w / 2 - t / 2, h / 2 + t / 2, w / 2 + t / 2, h / 2 + t / 2);
    bar(-w / 2 - t / 2, -h / 2 - t, -w / 2 - t / 2, h / 2 + t);
    bar(w / 2 + t / 2, -h / 2 - t, w / 2 + t / 2, h / 2 + t);
    if (o.tilt) {
      /* tilted frames handled by caller */
    }
  };
  /** A salon-hang cluster of paintings filling a wall span. */
  K.salonWall = function (b, x0, x1, y0, y1, fixed, nx, nz, seed, o) {
    o = o || {};
    const r = K.rng(seed);
    // fixed: the wall line coordinate (z for walls facing ±z, x for walls facing ±x)
    let t = x0 + 0.3;
    while (t < x1 - 0.5) {
      const w = 0.5 + r() * 1.1;
      if (t + w > x1 - 0.2) break;
      let yy = y0 + 0.2;
      while (yy < y1 - 0.5) {
        const h = 0.45 + r() * 0.9;
        if (yy + h > y1 - 0.15) break;
        if (r() < (o.density || 0.8)) {
          const rect =
            r() < 0.12 && o.photos
              ? K.photo(o.photos, (r() * 12) | 0)
              : K.painting((r() * 40) | 0, 128, 160);
          const cx = t + w / 2,
            cy = yy + h / 2;
          const px = nz !== 0 ? cx : fixed,
            pz = nz !== 0 ? fixed : cx;
          K.framed(b, px, cy, pz, nx, nz, w - 0.12, h - 0.12, rect, {
            frame: r.pick(["gold", "wood_dark", "black_iron", "gold"]),
          });
        }
        yy += h + 0.12 + r() * 0.15;
      }
      t += w + 0.1 + r() * 0.2;
    }
  };
