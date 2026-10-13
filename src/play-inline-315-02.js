// play-inline-315 02 — fillstyle
// Lines 20-321 of readable/play-inline-315.pretty.js (statement-aligned).
  const PH = G._ph;
  const K = PH.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const NY = PH.ny;
  const MY = NY.MEZ_Y,
    LH = NY.LOBBY_H;
  const BH = 8.4; // ballroom height
  const FH = 3.0; // 33rd floor room height
  const LAB = { x0: -18, x1: 18, z0: 34, z1: 70, h: 11 };
  const CAT_Y = 4.4; // lab catwalk
  const COILS = [
    [-7, 57],
    [7, 57],
    [0, 46.5],
  ];
  const COIL_TOP = 7.1; // toroid height
  const CAGE = { x0: -4.5, x1: 4.5, z0: 34.2, z1: 40 };

  // ==================================================================
  // ART CELLS
  // ==================================================================
  function skylineCell(i) {
    // night view from the 33rd floor: ruined Manhattan (additive: painted into the neon atlas)
    return K.paint(
      "neon",
      "ny_skyline_" + i,
      512,
      256,
      function (x, X, Y, W, H) {
        const r = K.rng("sky" + i);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#0a1418");
        g.addColorStop(0.55, "#24382e");
        g.addColorStop(1, "#4a5a34");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        // moon
        x.fillStyle = "rgba(220,235,200,0.9)";
        x.beginPath();
        x.arc(X + W * (0.15 + r() * 0.7), Y + H * 0.2, 9, 0, 6.3);
        x.fill();
        for (let k = 0; k < 40; k++) {
          x.fillStyle = "rgba(200,220,200," + (r() * 0.6).toFixed(2) + ")";
          x.fillRect(X + r() * W, Y + r() * H * 0.4, 1, 1);
        }
        // far towers
        for (let layer = 0; layer < 2; layer++) {
          let px = X - 10;
          while (px < X + W) {
            const w = 14 + r() * 34,
              h = H * (0.25 + r() * 0.45) * (layer ? 0.8 : 1);
            x.fillStyle = layer ? "#0d1311" : "#18201b";
            x.fillRect(px, Y + H - h, w, h);
            if (r() < 0.25) {
              x.beginPath();
              x.moveTo(px, Y + H - h);
              x.lineTo(px + w / 2, Y + H - h - 20 - r() * 30);
              x.lineTo(px + w, Y + H - h);
              x.fill();
            }
            if (r() < 0.3) {
              x.fillStyle = layer ? "#0d1311" : "#18201b";
              x.fillRect(px + w * 0.3, Y + H - h - 12, w * 0.4, 12);
            }
            // a few lit windows / fires
            for (let k = 0; k < 4; k++)
              if (r() < 0.35) {
                x.fillStyle =
                  r() < 0.2 ? "rgba(255,120,40,0.9)" : "rgba(230,200,120,0.55)";
                x.fillRect(
                  px + 3 + r() * (w - 6),
                  Y + H - h + 6 + r() * (h - 12),
                  2,
                  3,
                );
              }
            px += w + 2 + r() * 8;
          }
        }
        // the Empire State Building on the horizon, far
        if (i % 2 === 0) {
          const ex = X + W * 0.62;
          x.fillStyle = "#101814";
          x.fillRect(ex - 8, Y + H * 0.2, 16, H);
          x.fillRect(ex - 14, Y + H * 0.35, 28, H);
          x.fillRect(ex - 1.5, Y + H * 0.05, 3, H * 0.16);
          x.fillStyle = "rgba(255,60,40,0.9)";
          x.fillRect(ex - 1.5, Y + H * 0.05, 3, 3);
        }
        // green haze
        const h2 = x.createLinearGradient(0, Y + H * 0.6, 0, Y + H);
        h2.addColorStop(0, "rgba(90,120,60,0)");
        h2.addColorStop(1, "rgba(90,120,60,0.35)");
        x.fillStyle = h2;
        x.fillRect(X, Y, W, H);
      },
    );
  }
  function moonBackdrop() {
    return K.paint(
      "art",
      "ny_moon_backdrop",
      1024,
      512,
      function (x, X, Y, W, H) {
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#0b1230");
        g.addColorStop(1, "#2a1a40");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        const r = K.rng("moonb");
        for (let k = 0; k < 160; k++) {
          x.fillStyle =
            "rgba(255,240,200," + (0.3 + r() * 0.7).toFixed(2) + ")";
          x.fillRect(X + r() * W, Y + r() * H * 0.7, 2, 2);
        }
        const mg = x.createRadialGradient(
          X + W * 0.5,
          Y + H * 0.38,
          10,
          X + W * 0.5,
          Y + H * 0.38,
          H * 0.3,
        );
        mg.addColorStop(0, "#fff2c0");
        mg.addColorStop(0.8, "#e8c060");
        mg.addColorStop(1, "rgba(232,192,96,0)");
        x.fillStyle = mg;
        x.beginPath();
        x.arc(X + W * 0.5, Y + H * 0.38, H * 0.3, 0, 6.3);
        x.fill();
        x.fillStyle = "rgba(160,120,40,0.35)";
        for (const [a, b2, c] of [
          [0.47, 0.33, 22],
          [0.55, 0.42, 16],
          [0.5, 0.46, 12],
        ]) {
          x.beginPath();
          x.arc(X + W * a, Y + H * b2, c, 0, 6.3);
          x.fill();
        }
        // skyline silhouette along the bottom
        x.fillStyle = "#0a0a14";
        let px = X;
        while (px < X + W) {
          const w = 30 + r() * 60,
            h = 40 + r() * 120;
          x.fillRect(px, Y + H - h, w, h);
          if (r() < 0.3) {
            x.beginPath();
            x.moveTo(px, Y + H - h);
            x.lineTo(px + w / 2, Y + H - h - 40);
            x.lineTo(px + w, Y + H - h);
            x.fill();
          }
          px += w;
        }
        x.fillStyle = "#f0d890";
        x.font = "italic bold 64px Georgia, serif";
        x.textAlign = "center";
        x.fillText("Shamrock Ball", X + W / 2, Y + H * 0.82);
        K.stains(x, X, Y, W, H, 20, 3, 0.4, [30, 20, 10]);
      },
    );
  }
  function muralCell() {
    // gilded deco mural: "The Spirit of Manhattan" — skyline, sunrays, a winged figure with a lightning bolt
    return K.paint("pics", "ny_mural", 1024, 320, function (x, X, Y, W, H) {
      const g = x.createLinearGradient(0, Y, 0, Y + H);
      g.addColorStop(0, "#2a3a4a");
      g.addColorStop(1, "#6a5a3a");
      x.fillStyle = g;
      x.fillRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H * 0.95;
      for (let k = 0; k < 28; k++) {
        const a0 = PI + (k * PI) / 28,
          a1 = a0 + PI / 56;
        x.fillStyle =
          k % 2 ? "rgba(230,190,110,0.55)" : "rgba(200,150,80,0.25)";
        x.beginPath();
        x.moveTo(cx, cy);
        x.arc(cx, cy, H * 1.2, a0, a1);
        x.closePath();
        x.fill();
      }
      const r = K.rng("mural");
      let px = X + 10;
      while (px < X + W - 10) {
        const w = 24 + r() * 50,
          h = H * (0.25 + r() * 0.5) * (1 - (Math.abs(px - cx) / W) * 0.8);
        x.fillStyle = "#b8903c";
        x.fillRect(px, Y + H - h, w, h);
        x.fillStyle = "#7a5a20";
        for (let yy = Y + H - h + 6; yy < Y + H - 4; yy += 10)
          x.fillRect(px + 4, yy, w - 8, 3);
        if (r() < 0.4) {
          x.fillStyle = "#b8903c";
          x.beginPath();
          x.moveTo(px, Y + H - h);
          x.lineTo(px + w / 2, Y + H - h - 30);
          x.lineTo(px + w, Y + H - h);
          x.fill();
        }
        px += w + 4;
      }
      // winged figure holding a bolt (Tesla's "Spirit of Electricity")
      x.fillStyle = "#e8d8a8";
      x.beginPath();
      x.ellipse(cx, Y + H * 0.28, 14, 16, 0, 0, 6.3);
      x.fill();
      x.beginPath();
      x.moveTo(cx - 14, Y + H * 0.36);
      x.lineTo(cx + 14, Y + H * 0.36);
      x.lineTo(cx + 22, Y + H * 0.75);
      x.lineTo(cx - 22, Y + H * 0.75);
      x.fill();
      for (const s2 of [-1, 1]) {
        x.beginPath();
        x.moveTo(cx + s2 * 12, Y + H * 0.38);
        x.quadraticCurveTo(
          cx + s2 * 150,
          Y + H * 0.05,
          cx + s2 * 230,
          Y + H * 0.3,
        );
        x.quadraticCurveTo(
          cx + s2 * 130,
          Y + H * 0.35,
          cx + s2 * 20,
          Y + H * 0.55,
        );
        x.fill();
      }
      x.strokeStyle = "#f0f0ff";
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(cx + 20, Y + H * 0.05);
      x.lineTo(cx + 36, Y + H * 0.2);
      x.lineTo(cx + 26, Y + H * 0.22);
      x.lineTo(cx + 44, Y + H * 0.4);
      x.stroke();
      x.strokeStyle = "#c8a050";
      x.lineWidth = 8;
      x.strokeRect(X + 4, Y + 4, W - 8, H - 8);
      K.stains(x, X, Y, W, H, 26, 88, 0.45, [30, 25, 15]);
      K.streaks(x, X, Y, W, H, 30, 89, 0.25);
    });
  }
  function portraitCell() {
    return K.paint(
      "pics",
      "ny_tesla_portrait",
      192,
      256,
      function (x, X, Y, W, H) {
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#3a3a44");
        g.addColorStop(1, "#14141a");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        // a lean inventor in a dark suit: long face, centre-parted hair, moustache
        x.fillStyle = "#16161a";
        x.beginPath();
        x.ellipse(X + W / 2, Y + H * 0.95, W * 0.42, H * 0.34, 0, Math.PI, 0);
        x.fill();
        x.fillStyle = "#e8e4dc";
        x.beginPath();
        x.moveTo(X + W * 0.42, Y + H * 0.64);
        x.lineTo(X + W / 2, Y + H * 0.8);
        x.lineTo(X + W * 0.58, Y + H * 0.64);
        x.fill();
        x.fillStyle = "#c8a888";
        x.beginPath();
        x.ellipse(X + W / 2, Y + H * 0.42, W * 0.16, H * 0.18, 0, 0, 6.3);
        x.fill();
        x.fillStyle = "#1e1a18";
        x.beginPath();
        x.ellipse(X + W / 2, Y + H * 0.29, W * 0.17, H * 0.07, 0, Math.PI, 0);
        x.fill();
        x.fillRect(X + W / 2 - 1, Y + H * 0.24, 2, H * 0.05);
        x.fillStyle = "#2a2220";
        x.fillRect(X + W * 0.43, Y + H * 0.49, W * 0.14, H * 0.025);
        x.fillStyle = "#1a1614";
        x.fillRect(X + W * 0.43, Y + H * 0.39, W * 0.05, 3);
        x.fillRect(X + W * 0.52, Y + H * 0.39, W * 0.05, 3);
        // lightning in the background
        x.strokeStyle = "rgba(160,190,255,0.7)";
        x.lineWidth = 2;
        x.beginPath();
        x.moveTo(X + W * 0.1, Y);
        x.lineTo(X + W * 0.2, Y + H * 0.2);
        x.lineTo(X + W * 0.12, Y + H * 0.25);
        x.lineTo(X + W * 0.24, Y + H * 0.45);
        x.stroke();
        x.fillStyle = "rgba(160,120,60,0.2)";
        x.fillRect(X, Y, W, H);
        K.stains(x, X, Y, W, H, 6, 17, 0.4, [40, 30, 15]);
      },
    );
  }
