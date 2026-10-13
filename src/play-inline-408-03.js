// play-inline-408 03 — fillstyle
// Lines 338-601 of readable/play-inline-408.pretty.js (statement-aligned).
  K.chandelier = function (b, x, y, z, ceil, o) {
    o = o || {};
    const col = K.tint(o.color || [1, 0.82, 0.55]),
      R = o.r || 0.9;
    b.pipe("brass", x, y + 0.3, z, x, ceil, z, 0.02, 4);
    b.cyl("brass", x, y - 0.05, z, 0.12, 0.2, 0.35, 8, { bottom: true });
    b.cyl("brass", x, y + 0.05, z, R, R, 0.04, 16, { top: true });
    const n = o.arms || 8;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * PI * 2,
        px = x + Math.cos(a) * R,
        pz = z - Math.sin(a) * R;
      b.pipe("brass", x, y + 0.02, z, px, y + 0.1, pz, 0.012, 3);
      b.cyl("brass", px, y + 0.1, pz, 0.05, 0.04, 0.06, 6);
      if (!o.dead) {
        b.geo("lamp", K.sphereGeo(), {
          x: px,
          y: y + 0.2,
          z: pz,
          s: 0.04,
          tint: col,
        });
        b.glow(
          px,
          y + 0.2,
          pz,
          col.map((v) => v * 0.5),
          0.5,
        );
      }
      // crystal drops
      for (let d = 0; d < 3; d++)
        b.geo("crystal", K.sphereGeo(), {
          x: x + Math.cos(a + 0.2) * R * (0.4 + d * 0.3),
          y: y - 0.12 - d * 0.06,
          z: z - Math.sin(a + 0.2) * R * (0.4 + d * 0.3),
          sx: 0.02,
          sy: 0.05,
          sz: 0.02,
          tint: o.dead ? [0.35, 0.35, 0.38] : [0.55, 0.5, 0.42],
        });
    }
    for (let k = 0; k < 8; k++)
      b.geo("crystal", K.sphereGeo(), {
        x,
        y: y - 0.3 - k * 0.07,
        z,
        sx: 0.035,
        sy: 0.04,
        sz: 0.035,
        tint: o.dead ? [0.35, 0.35, 0.38] : [0.6, 0.55, 0.45],
      });
    if (!o.dead) {
      b.light(
        x,
        y - 0.2,
        z,
        col,
        o.intensity || 1.2,
        o.radius || 9,
        o.lightOpts,
      );
      b.glow(
        x,
        y,
        z,
        col.map((v) => v * 0.6),
        o.glowSize || 2.2,
      );
    }
  };

  /** Silver cloche on a plate (dining). */
  K.cloche = function (b, x, y, z, s) {
    s = s || 1;
    b.cyl("silver", x, y, z, 0.2 * s, 0.2 * s, 0.015, 12);
    K.dome(b, "silver", x, y + 0.015, z, 0.16 * s, 0.13 * s, 0, 10, 3, false, {
      grime: 0.1,
      uRep: 1,
      vRep: 1,
    });
    b.geo("silver", K.sphereGeo(), { x, y: y + 0.15 * s, z, s: 0.02 * s });
  };

  // ------------------------------------------------------------------
  // Atlas painters
  // ------------------------------------------------------------------
  /** Ruined Manhattan skyline panorama (for window plates in high rooms). variant = seed. */
  K.skyline = function (variant, w, h) {
    w = w || 512;
    h = h || 256;
    return K.paint(
      "pics",
      "pf3_skyline_" + variant,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng("sky" + variant);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#8e9a78");
        g.addColorStop(0.55, "#c4b98c");
        g.addColorStop(0.8, "#a89a70");
        g.addColorStop(1, "#5a5444");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        // sun haze
        const sg = x.createRadialGradient(
          X + W * 0.7,
          Y + H * 0.35,
          0,
          X + W * 0.7,
          Y + H * 0.35,
          H * 0.5,
        );
        sg.addColorStop(0, "rgba(255,240,190,0.55)");
        sg.addColorStop(1, "rgba(255,240,190,0)");
        x.fillStyle = sg;
        x.fillRect(X, Y, W, H);
        // three layers of towers, far → near (darker, taller, more broken)
        for (let layer = 0; layer < 3; layer++) {
          const base = Y + H * (0.62 + layer * 0.12),
            shade = 150 - layer * 45;
          let px = X - 10;
          while (px < X + W) {
            const bw = 10 + r() * (18 + layer * 10),
              bh = H * (0.12 + r() * (0.3 + layer * 0.12));
            x.fillStyle =
              "rgb(" +
              ((shade * 0.85) | 0) +
              "," +
              ((shade * 0.88) | 0) +
              "," +
              ((shade * 0.78) | 0) +
              ")";
            x.beginPath();
            x.moveTo(px, base);
            x.lineTo(px, base - bh);
            if (r() < 0.35) {
              const k = r() * bw;
              x.lineTo(px + k, base - bh - r() * 12);
              x.lineTo(px + k + 3, base - bh + r() * 20);
            } // broken top
            else if (r() < 0.2) {
              x.lineTo(px + bw / 2, base - bh - bh * 0.25);
            } // spire
            x.lineTo(px + bw, base - bh);
            x.lineTo(px + bw, base);
            x.fill();
            if (layer === 2) {
              x.fillStyle = "rgba(20,20,15,0.5)";
              for (let k = 0; k < 6; k++)
                x.fillRect(
                  px + 2 + r() * (bw - 4),
                  base - bh + 4 + r() * (bh - 8),
                  2,
                  3,
                );
            }
            px += bw + r() * 4;
          }
        }
        // dust & smoke columns
        for (let k = 0; k < 3; k++) {
          const sx = X + r() * W;
          const sg2 = x.createLinearGradient(sx, Y + H * 0.2, sx, Y + H * 0.7);
          sg2.addColorStop(0, "rgba(70,65,55,0)");
          sg2.addColorStop(1, "rgba(70,65,55,0.35)");
          x.fillStyle = sg2;
          x.fillRect(sx - 12, Y + H * 0.2, 24, H * 0.5);
        }
        K.grain(x, X, Y, W, H, 25, 700 + variant);
      },
    );
  };

  /** Tattered flag / banner with alpha holes. kind: 'us' | 'us_upside' | 'raider' */
  K.flagCell = function (kind, w, h) {
    w = w || 256;
    h = h || 160;
    return K.paint("art", "pf3_flag_" + kind, w, h, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      x.save();
      if (kind === "us_upside") {
        x.translate(X + W / 2, Y + H / 2);
        x.rotate(PI);
        x.translate(-(X + W / 2), -(Y + H / 2));
      }
      if (kind === "raider") {
        x.fillStyle = "#6e1e16";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#e8dcc0";
        x.font =
          "bold " + Math.round(H * 0.2) + "px Impact, Arial Black, sans-serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("THE CONGRESS", X + W / 2, Y + H * 0.18, W * 0.9);
        // skull with a tricorn hat
        const cx = X + W / 2,
          cy = Y + H * 0.58;
        x.beginPath();
        x.arc(cx, cy, H * 0.17, 0, PI * 2);
        x.fill();
        x.fillRect(cx - H * 0.09, cy + H * 0.1, H * 0.18, H * 0.12);
        x.fillStyle = "#6e1e16";
        x.beginPath();
        x.arc(cx - H * 0.065, cy, H * 0.045, 0, PI * 2);
        x.arc(cx + H * 0.065, cy, H * 0.045, 0, PI * 2);
        x.fill();
        x.fillStyle = "#1a1410";
        x.beginPath();
        x.moveTo(cx - H * 0.28, cy - H * 0.1);
        x.lineTo(cx, cy - H * 0.32);
        x.lineTo(cx + H * 0.28, cy - H * 0.1);
        x.closePath();
        x.fill();
        x.fillStyle = "#e8dcc0";
        x.font =
          "bold " + Math.round(H * 0.11) + "px Impact, Arial Black, sans-serif";
        x.fillText("IN SESSION", X + W / 2, Y + H * 0.9, W * 0.8);
      } else {
        const sh = H / 13;
        for (let i = 0; i < 13; i++) {
          x.fillStyle = i % 2 ? "#e4dccb" : "#8e2a22";
          x.fillRect(X, Y + i * sh, W, sh + 0.5);
        }
        x.fillStyle = "#23305a";
        x.fillRect(X, Y, W * 0.4, sh * 7);
        x.fillStyle = "#e4dccb";
        for (let j = 0; j < 9; j++)
          for (let i = 0; i < (j % 2 ? 5 : 6); i++) {
            x.beginPath();
            x.arc(
              X + W * 0.4 * ((i + (j % 2 ? 1 : 0.5)) / 6.2),
              Y + sh * 7 * ((j + 0.7) / 9.6),
              1.8,
              0,
              PI * 2,
            );
            x.fill();
          }
      }
      x.restore();
      // grime + burn holes + frayed fly end
      K.stains(x, X, Y, W, H, 10, 7 + kind.length, 0.5, [40, 30, 20]);
      const r = K.rng("flag" + kind);
      x.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 9; k++) {
        x.beginPath();
        x.arc(X + W * (0.2 + r() * 0.8), Y + r() * H, 3 + r() * 12, 0, PI * 2);
        x.fill();
      }
      for (let k = 0; k < 14; k++) {
        const yy = Y + r() * H;
        x.beginPath();
        x.moveTo(X + W, yy);
        x.lineTo(X + W - 10 - r() * 40, yy + 4);
        x.lineTo(X + W, yy + 10);
        x.fill();
      }
      x.globalCompositeOperation = "source-over";
    });
  };

  /** Round floor medallion (compass star / eagle seal) with alpha. */
