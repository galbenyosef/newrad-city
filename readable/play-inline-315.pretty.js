/* src/poi_herald/11_newyorker_int.js */
/* =====================================================================
 * NEW RAD CITY — poi_herald / 11_newyorker_int.js
 * HOTEL NEW YORKER — interior (cell hotel_new_yorker) + content.
 * See 10_newyorker.js for the level overview. Local coords (origin O):
 *   LOBBY        x −16..16, z −24..0     y 0      (h 8.4, mezzanine at 5.2)
 *   STAFF / FREIGHT ELEVATOR  x −22..−16, z −6..0
 *   BALLROOM     x −16..16, z −52..−24   y 5.2    (h 8.4)
 *   TERRACE BAR  x 16..26,  z −40..−26   y 5.2
 *   SERVICE HALL x −28..−16, z −50..−46 → STAIR LANDING x −32..−28
 *   33rd FLOOR   corridor x −30..30, z 78..82 (y 0), rooms north & south
 *   ROOM 3327    parlor x −14..−6, bedroom x −6..2 (z 70..78)
 *   TESLA LAB    x −18..18, z 34..70 (h 11), catwalk + booth east side
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
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
  function schematicCell(i) {
    return K.paint("pics", "ny_schem_" + i, 256, 192, function (x, X, Y, W, H) {
      x.fillStyle = "#1c3a6a";
      x.fillRect(X, Y, W, H);
      x.strokeStyle = "rgba(210,230,255,0.85)";
      x.lineWidth = 1.5;
      x.strokeRect(X + 6, Y + 6, W - 12, H - 12);
      const r = K.rng("schem" + i);
      if (i % 3 === 0) {
        // Wardenclyffe tower
        const cx = X + W / 2;
        x.beginPath();
        x.moveTo(cx - 30, Y + H - 20);
        x.lineTo(cx - 12, Y + 60);
        x.lineTo(cx + 12, Y + 60);
        x.lineTo(cx + 30, Y + H - 20);
        x.stroke();
        x.beginPath();
        x.ellipse(cx, Y + 55, 45, 22, 0, Math.PI, 0);
        x.stroke();
        x.beginPath();
        x.moveTo(cx - 45, Y + 55);
        x.lineTo(cx + 45, Y + 55);
        x.stroke();
        for (let k = 0; k < 6; k++) {
          x.beginPath();
          x.moveTo(cx - 28 + k * 3, Y + H - 20 - k * 16);
          x.lineTo(cx + 28 - k * 3, Y + H - 20 - k * 16);
          x.stroke();
        }
      } else if (i % 3 === 1) {
        // coil
        const cx = X + W / 2;
        for (let k = 0; k < 14; k++) {
          x.beginPath();
          x.ellipse(cx, Y + 50 + k * 8, 18, 3, 0, 0, 6.3);
          x.stroke();
        }
        x.beginPath();
        x.ellipse(cx, Y + 40, 40, 12, 0, 0, 6.3);
        x.stroke();
        x.beginPath();
        x.moveTo(cx + 40, Y + 40);
        for (let k = 0; k < 6; k++)
          x.lineTo(cx + 50 + k * 10, Y + 30 + (k % 2) * 16);
        x.stroke();
      } else {
        // circuit
        for (let k = 0; k < 18; k++) {
          const a = X + 12 + r() * (W - 24),
            b = Y + 12 + r() * (H - 24);
          x.beginPath();
          x.moveTo(a, b);
          x.lineTo(a + (r() - 0.5) * 80, b);
          x.lineTo(a + (r() - 0.5) * 80, b + (r() - 0.5) * 50);
          x.stroke();
          x.beginPath();
          x.arc(a, b, 3, 0, 6.3);
          x.stroke();
        }
      }
      x.fillStyle = "rgba(210,230,255,0.85)";
      x.font = "10px monospace";
      x.fillText(
        ["WARDENCLYFFE — ELEV.", "MAGNIFYING TX — SEC.", "TELEFORCE — FIG. 7"][
          i % 3
        ],
        X + 12,
        Y + H - 10,
      );
      K.stains(x, X, Y, W, H, 8, 23 + i, 0.4, [60, 50, 30]);
    });
  }
  function plaqueCell(key, text, w, h) {
    return K.signCell(key, text, w || 512, h || 160, {
      bg: "#2e2410",
      fg: "#e0c070",
      font: "Georgia, serif",
      border: "#c8a050",
    });
  }
  function roomNo(n) {
    return K.signCell("ny_room_" + n, String(n), 128, 64, {
      bg: "#2a1c10",
      fg: "#d8b060",
      font: "Georgia, serif",
      border: "#b08a40",
    });
  }
  function inlayCell() {
    return K.paint("art", "ny_inlay", 512, 512, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H / 2;
      x.fillStyle = "rgba(40,26,18,0.9)";
      x.beginPath();
      x.arc(cx, cy, W * 0.46, 0, 6.3);
      x.fill();
      for (let k = 0; k < 16; k++) {
        const a = (k * Math.PI) / 8,
          L = k % 2 ? W * 0.3 : W * 0.44;
        x.fillStyle = k % 4 === 0 ? "#c8a050" : k % 2 ? "#e8e0c8" : "#8a2a1e";
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(
          cx + Math.cos(a - 0.12) * W * 0.08,
          cy + Math.sin(a - 0.12) * W * 0.08,
        );
        x.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L);
        x.lineTo(
          cx + Math.cos(a + 0.12) * W * 0.08,
          cy + Math.sin(a + 0.12) * W * 0.08,
        );
        x.fill();
      }
      x.strokeStyle = "#c8a050";
      x.lineWidth = 6;
      x.beginPath();
      x.arc(cx, cy, W * 0.46, 0, 6.3);
      x.stroke();
      x.fillStyle = "#c8a050";
      x.font = "bold 34px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("NY", cx, cy);
      K.stains(x, X, Y, W, H, 10, 5, 0.35, [40, 30, 20]);
    });
  }

  // ==================================================================
  // FURNITURE / DRESSING HELPERS (deco)
  // ==================================================================
  /** Tiered deco chandelier: rings of glass beads, a crown, a chain. */
  function chandelier(b, x, y, z, s, ceil, col, inten, rad, box, dead) {
    b.pipe("brass", x, y + 0.9 * s, z, x, ceil, z, 0.02, 4);
    for (let t = 0; t < 3; t++) {
      const rr = (1.1 - t * 0.3) * s,
        yy = y + t * 0.32 * s;
      b.cyl("brass", x, yy, z, rr, rr, 0.07, 18, { top: false });
      b.cyl("brass", x, yy - 0.001, z, rr - 0.05, rr - 0.05, 0.07, 18, {
        top: false,
      });
      const n = Math.round(10 + rr * 8);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * PI * 2;
        b.pipe(
          "glass",
          x + Math.cos(a) * rr,
          yy - 0.02,
          z + Math.sin(a) * rr,
          x + Math.cos(a) * rr,
          yy - 0.34 * s,
          z + Math.sin(a) * rr,
          0.02,
          3,
          { tint: [0.85, 0.9, 0.9] },
        );
        if (!dead && k % 3 === 0)
          b.geo("lamp", K.sphereGeo(), {
            x: x + Math.cos(a) * rr,
            y: yy + 0.08,
            z: z + Math.sin(a) * rr,
            s: 0.05,
            tint: col,
          });
      }
    }
    b.cyl("glass", x, y - 0.5 * s, z, 0.05, 0.35 * s, 0.5 * s, 10, {
      tint: [0.8, 0.85, 0.85],
    });
    b.cyl("brass", x, ceil - 0.12, z, 0.35 * s, 0.25 * s, 0.12, 12, {
      tint: [0.7, 0.55, 0.3],
    });
    for (let k = 0; k < 4; k++) {
      const a = k * HP + 0.4;
      b.pipe(
        "brass",
        x,
        y + 0.9 * s,
        z,
        x + Math.cos(a) * 1.1 * s,
        y + 0.02,
        z + Math.sin(a) * 1.1 * s,
        0.012,
        3,
      );
    }
    if (!dead) {
      b.light(x, y - 0.2, z, col, inten, rad, { box });
      b.glow(
        x,
        y + 0.2 * s,
        z,
        [col[0] * 0.6, col[1] * 0.55, col[2] * 0.45],
        2.6 * s,
      );
    }
  }
  /** Fallen chandelier wreck on the floor. */
  function fallenChandelier(b, x, y, z, s, r) {
    for (let t = 0; t < 3; t++) {
      const rr = (1.1 - t * 0.3) * s;
      b.cyl(
        "brass",
        x + (r() - 0.5) * 0.6,
        y + 0.02 + t * 0.05,
        z + (r() - 0.5) * 0.6,
        rr,
        rr,
        0.06,
        18,
        { top: false, tint: [0.7, 0.6, 0.45] },
      );
    }
    for (let k = 0; k < 40; k++) {
      const a = r() * 6.28,
        d = r() * 2.6 * s;
      b.box(
        "glass",
        x + Math.cos(a) * d,
        y,
        z + Math.sin(a) * d,
        0.05 + r() * 0.08,
        0.02,
        0.1 + r() * 0.2,
        { yaw: r() * 3, tint: [0.8, 0.85, 0.85] },
      );
    }
    b.pipe("brass", x, y + 0.05, z, x + 2.6, y + 0.05, z - 1.4, 0.02, 4);
    b.hplate("decal", x, y + 0.012, z, 4 * s, 4 * s, 0.4, K.decal("crack", 3));
  }
  /** Potted dead palm. */
  function deadPalm(b, x, y, z, r) {
    b.cyl("bronze", x, y, z, 0.38, 0.3, 0.7, 12, { tint: [0.5, 0.38, 0.22] });
    b.cyl("dirt", x, y + 0.6, z, 0.34, 0.34, 0.04, 10);
    b.cyl("wood_rotten", x, y + 0.6, z, 0.06, 0.04, 1.4, 5, {
      tint: [0.45, 0.38, 0.28],
    });
    for (let k = 0; k < 6; k++) {
      const a = r() * 6.28,
        L = 0.7 + r() * 0.5;
      b.beam(
        "wood_rotten",
        x,
        y + 1.95,
        z,
        x + Math.cos(a) * L,
        y + 1.3 + r() * 0.5,
        z + Math.sin(a) * L,
        0.12,
        0.015,
        { tint: [0.5, 0.42, 0.26] },
      );
    }
  }
  /** Brass luggage cart with suitcases. */
  function luggageCart(b, x, y, z, yaw, r, tipped) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    const P = (lx, ly, lz) => [
      x + lx * c + lz * s,
      y + ly,
      z - lx * s + lz * c,
    ];
    if (tipped) {
      b.box("brass", x, y + 0.1, z, 1.6, 0.06, 0.8, {
        yaw: yaw + 0.3,
        tint: [0.6, 0.5, 0.3],
      });
    } else {
      b.box("bronze", x, y + 0.3, z, 1.5, 0.06, 0.7, {
        yaw,
        tint: [0.4, 0.3, 0.18],
      });
      for (const lx of [-0.72, 0.72]) {
        const a = P(lx, 0.3, -0.32),
          a2 = P(lx, 1.9, -0.32),
          bb = P(lx, 0.3, 0.32),
          b2 = P(lx, 1.9, 0.32);
        b.pipe("brass", a[0], a[1], a[2], a2[0], a2[1], a2[2], 0.02, 5);
        b.pipe("brass", bb[0], bb[1], bb[2], b2[0], b2[1], b2[2], 0.02, 5);
      }
      const t0 = P(-0.72, 1.9, 0),
        t1 = P(0.72, 1.9, 0);
      b.pipe("brass", t0[0], t0[1], t0[2], t1[0], t1[1], t1[2], 0.025, 6);
      for (let k = 0; k < 3; k++) {
        const p = P(-0.4 + k * 0.4, 0.33 + k * 0.12, (r() - 0.5) * 0.2);
        b.box(
          "leather",
          p[0],
          p[1],
          p[2],
          0.5 + r() * 0.2,
          0.3 + r() * 0.2,
          0.6,
          {
            yaw: yaw + (r() - 0.5) * 0.4,
            tint: r.pick([
              [0.5, 0.3, 0.2],
              [0.3, 0.3, 0.35],
              [0.6, 0.5, 0.35],
            ]),
          },
        );
      }
      for (const lx of [-0.6, 0.6])
        for (const lz of [-0.28, 0.28]) {
          const p = P(lx, 0.1, lz);
          b.cyl("rubber", p[0], p[1] - 0.1, p[2], 0.1, 0.1, 0.06, 8);
        }
      b.ocol(x, z, 1.5, 0.7, y, y + 1.2, yaw, {
        tag: "furniture",
        walkable: false,
      });
    }
  }
  function armchair(b, x, y, z, yaw, tint) {
    K.sofa(b, x, y, z, 1.0, yaw, {
      mat: "velvet",
      tint: tint || [0.55, 0.25, 0.2],
      d: 0.85,
    });
  }
  /** Elevator door (deco): bronze frame, sunburst leaves, floor dial. open = dark shaft. */
  function elevatorDoor(b, x, y, z, nx, nz, open, label) {
    const rx = nz,
      rz = -nx;
    const P = (u, v, d) => [x + rx * u + nx * d, y + v, z + rz * u + nz * d];
    const yaw = Math.atan2(-rz, rx);
    const box = (u, v, W, H, D, mat, tint) => {
      const c = P(u, v, D / 2);
      b.box(mat, c[0], c[1], c[2], W, H, D, { yaw, tint });
    };
    box(-0.95, 0, 0.3, 3.0, 0.22, "bronze", [0.55, 0.4, 0.22]);
    box(0.95, 0, 0.3, 3.0, 0.22, "bronze", [0.55, 0.4, 0.22]);
    box(0, 2.8, 2.2, 0.5, 0.24, "bronze", [0.55, 0.4, 0.22]);
    if (open) {
      b.plate(
        "paint_black",
        P(0, 1.35, 0.01)[0],
        y + 1.35,
        P(0, 1.35, 0.01)[2],
        nx,
        nz,
        1.6,
        2.7,
        null,
        { tint: [0.02, 0.02, 0.02] },
      );
      box(-0.62, 0, 0.36, 2.7, 0.05, "bronze", [0.4, 0.3, 0.18]); // leaf pried half open
      b.plate(
        "art",
        P(-0.62, 1.35, 0.06)[0],
        y + 1.35,
        P(-0.62, 1.35, 0.06)[2],
        nx,
        nz,
        0.34,
        2.6,
        NY.sunburstCell(),
        { tint: [0.7, 0.6, 0.4] },
      );
    } else {
      b.plate(
        "art",
        P(-0.4, 1.35, 0.03)[0],
        y + 1.35,
        P(-0.4, 1.35, 0.03)[2],
        nx,
        nz,
        0.8,
        2.7,
        NY.sunburstCell(),
        { tint: [0.85, 0.75, 0.55] },
      );
      b.plate(
        "art",
        P(0.4, 1.35, 0.03)[0],
        y + 1.35,
        P(0.4, 1.35, 0.03)[2],
        nx,
        nz,
        0.8,
        2.7,
        NY.sunburstCell(),
        { tint: [0.85, 0.75, 0.55] },
      );
    }
    // floor indicator dial above
    const d = P(0, 3.35, 0.05);
    b.cyl("brass", d[0], d[1] - 0.25, d[2], 0.28, 0.28, 0.04, 14, {
      tint: [0.7, 0.55, 0.3],
    });
    if (label)
      b.plate(
        "art",
        P(0, 3.35, 0.26)[0],
        y + 3.35,
        P(0, 3.35, 0.26)[2],
        nx,
        nz,
        0.44,
        0.22,
        label,
        { off: 0.01 },
      );
  }
  /** Round banquet table with cloth, plates, glasses, candle; returns top y. */
  function banquetTable(b, x, y, z, r, rr) {
    K.roundTable(b, x, y, z, r, { mat: "wood_dark", cloth: [0.82, 0.78, 0.7] });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * PI * 2 + rr() * 0.2,
        px = x + Math.cos(a) * (r - 0.25),
        pz = z + Math.sin(a) * (r - 0.25);
      if (rr() < 0.8) b.cyl("ceramic", px, y + 0.76, pz, 0.13, 0.11, 0.02, 10);
      if (rr() < 0.6)
        b.cyl("glass", px + 0.15, y + 0.76, pz, 0.03, 0.03, 0.15, 6, {
          tint: [0.8, 0.85, 0.85],
        });
      const cx = x + Math.cos(a) * (r + 0.45),
        cz = z + Math.sin(a) * (r + 0.45);
      K.chair(b, cx, y, cz, -a + HP, {
        mat: "gold",
        seatMat: "velvet",
        seatTint: [0.55, 0.15, 0.15],
        fallen: rr() < 0.18,
      });
    }
    b.cyl("brass", x, y + 0.76, z, 0.06, 0.04, 0.3, 8);
    b.cyl("ceramic", x, y + 1.06, z, 0.02, 0.02, 0.08, 5, {
      tint: [0.9, 0.85, 0.7],
    });
    return y + 0.76;
  }

  /** Deco coffered ceiling: a grid of gilded beams under a plaster ceiling at height y. */
  function coffers(b, x0, z0, x1, z1, y, step, mat, tint) {
    for (let x = x0 + step; x < x1 - 0.1; x += step)
      b.boxMM(mat, x - 0.14, y - 0.32, z0, x + 0.14, y, z1, {
        tint,
        faces: "nsewb",
        grime: 0.25,
      });
    for (let z = z0 + step; z < z1 - 0.1; z += step)
      b.boxMM(mat, x0, y - 0.3, z - 0.14, x1, y - 0.02, z + 0.14, {
        tint,
        faces: "nsewb",
        grime: 0.25,
      });
    for (let x = x0 + step / 2; x < x1; x += step)
      for (let z = z0 + step / 2; z < z1; z += step)
        b.cyl(mat, x, y - 0.06, z, 0.3, 0.18, 0.06, 8, {
          tint,
          bottom: true,
          top: false,
        });
  }
  /** Frame bars only (no canvas) around a wall rectangle. */
  function frameOnly(b, x, y, z, nx, nz, w, h, mat, t) {
    const rx = nz,
      rz = -nx,
      d = 0.05;
    const P = (u, v) => [x + rx * u + nx * d, y + v, z + rz * u + nz * d];
    const bar = (u0, v0, u1, v1) => {
      const a = P(u0, v0),
        c = P(u1, v1);
      b.beam(mat, a[0], a[1], a[2], c[0], c[1], c[2], t, 0.08, { grime: 0.2 });
    };
    bar(-w / 2 - t / 2, -h / 2 - t / 2, w / 2 + t / 2, -h / 2 - t / 2);
    bar(-w / 2 - t / 2, h / 2 + t / 2, w / 2 + t / 2, h / 2 + t / 2);
    bar(-w / 2 - t / 2, -h / 2 - t, -w / 2 - t / 2, h / 2 + t);
    bar(w / 2 + t / 2, -h / 2 - t, w / 2 + t / 2, h / 2 + t);
  }
  function droppingsCell(i) {
    return K.paint(
      "art",
      "ny_droppings_" + i,
      128,
      128,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const r = K.rng("drop" + i);
        for (let k = 0; k < 60; k++) {
          const px = X + W / 2 + (r() - 0.5) * W * 0.9,
            py = Y + H / 2 + (r() - 0.5) * H * 0.9;
          x.fillStyle =
            "rgba(" +
            ((200 + r() * 40) | 0) +
            "," +
            ((200 + r() * 40) | 0) +
            "," +
            ((190 + r() * 40) | 0) +
            "," +
            (0.5 + r() * 0.5).toFixed(2) +
            ")";
          x.beginPath();
          x.ellipse(px, py, 1 + r() * 4, 1 + r() * 3, r() * 3, 0, 6.3);
          x.fill();
        }
        for (let k = 0; k < 8; k++) {
          x.fillStyle = "rgba(60,60,55,0.5)";
          x.fillRect(X + r() * W, Y + r() * H, 2, 2);
        }
      },
    );
  }

  // ==================================================================
  // INTERIOR BUILD
  // ==================================================================
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "ny_int",
      off: O,
      lit: true,
      amb: [0.1, 0.092, 0.08],
      floors: [0, MY],
      grime: 0.45,
    });
    const r = K.rng("ny_int");
    ctx.dyn = {};
    const cream = [0.86, 0.8, 0.66];

    // ------------------------------------------------------------------
    // LOBBY
    // ------------------------------------------------------------------
    const LB = [-16.1, -0.3, -24.1, 16.1, LH + 0.2, 0.1];
    K.gap(ctx, 0, -24, 3.2, MY, 3.2); // mezzanine → ballroom
    K.gap(ctx, -16, -3, 1.4, 0, 2.4); // lobby → staff room
    K.room(b, ctx, {
      x0: -16,
      z0: -24,
      x1: 16,
      z1: 0,
      y: 0,
      h: LH,
      floor: "marble",
      fc: [0.86, 0.8, 0.72],
      wall: "plaster",
      wc: cream,
      wain: "deco_wall",
      wainC: [0.95, 0.85, 0.8],
      wainH: 2.6,
      ceil: "plaster",
      cc: [0.8, 0.74, 0.6],
      cornice: true,
      corniceMat: "brass",
      trimMat: "bronze",
    });
    coffers(b, -16, -24, 16, 0, LH, 4, "gold", [0.75, 0.6, 0.35]);
    // floor inlay + terrazzo border
    b.hplate("decal", 0, 0.012, -4.5, 6, 6, 0, inlayCell());
    for (const z of [-0.6, -23.4])
      b.hplate("flat", 0, 0.008, z, 31.6, 0.5, 0, null, {
        tint: [0.35, 0.2, 0.14],
      });
    // entrance: bronze & glass doors on the south wall (the way out)
    for (const dx of [-1.9, 0, 1.9]) {
      b.boxMM("bronze", dx - 0.85, 0, -0.16, dx + 0.85, 3.4, -0.1, {
        tint: [0.5, 0.36, 0.2],
      });
      b.plate("glass_dark", dx, 1.9, -0.17, 0, -1, 1.2, 2.4, null, {
        tint: [0.35, 0.38, 0.36],
      });
      b.light(dx, 2, -0.8, [0.55, 0.62, 0.5], 0.35, 5, { box: LB });
    }
    b.plate("art", 0, 5.3, -0.12, 0, -1, 5.6, 2.6, NY.sunburstCell(), {
      tint: [0.8, 0.7, 0.5],
    });
    // deco columns
    for (const cx of [-10, 10])
      for (const cz of [-6, -15]) {
        b.boxMM("deco_wall", cx - 0.6, 0, cz - 0.6, cx + 0.6, LH, cz + 0.6, {
          tint: [0.9, 0.8, 0.75],
        });
        b.boxMM("bronze", cx - 0.7, 0, cz - 0.7, cx + 0.7, 0.3, cz + 0.7, {
          tint: [0.5, 0.36, 0.2],
        });
        for (let k = 0; k < 3; k++)
          b.boxMM(
            "brass",
            cx - 0.7 - k * 0.12,
            LH - 1.2 + k * 0.35,
            cz - 0.7 - k * 0.12,
            cx + 0.7 + k * 0.12,
            LH - 1.05 + k * 0.35,
            cz + 0.7 + k * 0.12,
            { tint: [0.7, 0.55, 0.3] },
          );
        b.col(cx - 0.6, 0, cz - 0.6, cx + 0.6, LH, cz + 0.6, {});
      }
    // FRONT DESK (west): marble counter with bronze band, key cubbies behind
    b.boxMM("marble", -13.4, 0, -19, -12.2, 1.1, -7, {
      tint: [0.75, 0.62, 0.55],
    });
    b.boxMM("bronze", -12.22, 0.2, -19, -12.16, 0.35, -7, {
      tint: [0.6, 0.45, 0.25],
    });
    b.boxMM("marble", -13.5, 1.1, -19.1, -12.1, 1.18, -6.9, {
      tint: [0.35, 0.3, 0.3],
    });
    b.col(-13.5, 0, -19.1, -12.1, 1.18, -6.9, { tag: "counter" });
    b.plate(
      "art",
      -12.15,
      0.72,
      -13,
      1,
      0,
      4.5,
      0.5,
      K.signCell("ny_reception", "R E C E P T I O N", 512, 64, {
        bg: "#1c140c",
        fg: "#d8b060",
        font: "Georgia, serif",
      }),
    );
    // key wall: wooden cubbies with brass keys
    b.boxMM("wood_dark", -15.9, 1.3, -18, -15.5, 3.6, -8, {
      tint: [0.5, 0.32, 0.2],
    });
    for (let j = 0; j < 7; j++)
      for (let i = 0; i < 24; i++) {
        const zz = -17.8 + i * 0.4,
          yy = 1.4 + j * 0.3;
        b.boxMM("paint_black", -15.51, yy, zz, -15.49, yy + 0.24, zz + 0.34, {
          tint: [0.08, 0.06, 0.05],
        });
        if (r() < 0.55) {
          b.box("brass", -15.46, yy + 0.05, zz + 0.17, 0.04, 0.14, 0.03, {
            tint: [0.8, 0.65, 0.35],
          });
        }
      }
    b.plate(
      "art",
      -15.45,
      4.3,
      -13,
      1,
      0,
      1.2,
      1.2,
      K.paint("art", "ny_clock", 128, 128, (x, X, Y, W, H) => {
        x.fillStyle = "#e8dcc0";
        x.beginPath();
        x.arc(X + W / 2, Y + H / 2, W * 0.46, 0, 6.3);
        x.fill();
        x.strokeStyle = "#2a1a0c";
        x.lineWidth = 5;
        x.stroke();
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(X + W / 2, Y + H / 2);
        x.lineTo(X + W / 2 + 18, Y + H / 2 - 30);
        x.moveTo(X + W / 2, Y + H / 2);
        x.lineTo(X + W / 2 - 26, Y + H / 2 + 8);
        x.stroke();
        for (let k = 0; k < 12; k++) {
          const a = (k * PI) / 6;
          x.fillStyle = "#2a1a0c";
          x.fillRect(
            X + W / 2 + Math.cos(a) * 50 - 2,
            Y + H / 2 + Math.sin(a) * 50 - 2,
            4,
            4,
          );
        }
      }),
      {},
    );
    b.cyl("brass", -12.8, 1.18, -9, 0.07, 0.09, 0.08, 10); // desk bell
    K.terminal(
      ctx,
      "ph_ny_term_desk",
      -12.85,
      1.18,
      -14.2,
      -HP,
      termDesk(),
      "bare",
    );
    K.skel(ctx, -14.4, 0, -12.5, HP, "seated");
    b.box("wood_dark", -14.4, 0, -12.5, 0.5, 0.45, 0.5, {}); // stool under him
    // lamps on the desk
    for (const z of [-17.5, -8.5]) {
      b.cyl("bronze", -12.8, 1.18, z, 0.1, 0.06, 0.4, 8);
      b.cyl("glass", -12.8, 1.58, z, 0.12, 0.2, 0.22, 10, {
        tint: [0.9, 0.8, 0.55],
      });
      b.light(-12.8, 1.7, z, [1, 0.75, 0.45], 0.8, 4.5, { box: LB });
      b.glow(-12.8, 1.7, z, [0.8, 0.55, 0.3], 0.9);
    }
    // ELEVATOR BANK (east wall)
    const elevLabel = K.signCell("ny_elev_3", "CAR 3 · 33", 128, 64, {
      bg: "#1c140c",
      fg: "#d8b060",
      font: "Georgia, serif",
    });
    for (const [z, open] of [
      [-20, false],
      [-15, true],
      [-10, false],
      [-5, false],
    ])
      elevatorDoor(b, 15.9, 0, z, -1, 0, open, z === -10 ? elevLabel : null);
    b.plate(
      "art",
      15.88,
      4.4,
      -12.5,
      -1,
      0,
      4.0,
      0.5,
      K.signCell("ny_elev_sign", "ELEVATORS", 512, 64, {
        bg: "#1c140c",
        fg: "#d8b060",
        font: "Georgia, serif",
      }),
    );
    b.light(14.6, 3.6, -10, [1, 0.25, 0.15], 0.6, 4, { box: LB });
    b.glow(15.6, 3.35, -10, [1, 0.2, 0.1], 0.6); // car 3 red call light
    // grand staircase to the mezzanine (x −4.5..4.5, rising north)
    K.stairs(b, -4.5, -21, 4.5, -8.6, 0, MY, "-z", {
      mat: "marble",
      tint: [0.8, 0.74, 0.66],
      rail: "both",
      railMat: "bronze",
      handMat: "brass",
    });
    {
      // red carpet runner on the stair
      const n = Math.ceil(MY / 0.24),
        run = 12.4 / n;
      for (let i = 0; i < n; i++) {
        const top = (MY * (i + 1)) / n,
          z1 = -8.6 - run * i;
        b.boxMM(
          "carpet",
          -2.2,
          top - MY / n,
          z1 - run,
          2.2,
          top + 0.015,
          z1 + 0.012,
          { tint: [0.9, 0.5, 0.45], grime: 0.3, faces: "st" },
        );
      }
    }
    // newel lamps
    for (const x of [-4.4, 4.4]) {
      b.cyl("bronze", x, 0, -8.4, 0.18, 0.14, 1.4, 10, {
        tint: [0.5, 0.36, 0.2],
      });
      b.geo("lamp", K.sphereGeo(), {
        x,
        y: 1.6,
        z: -8.4,
        s: 0.2,
        tint: [1, 0.85, 0.6],
      });
      b.light(x, 1.8, -8.2, [1, 0.8, 0.55], 0.6, 5, { box: LB });
      b.glow(x, 1.6, -8.4, [0.8, 0.6, 0.35], 1.1);
    }
    // MEZZANINE gallery
    b.boxMM("marble", -16, MY - 0.35, -24, 16, MY, -21, {
      tint: [0.78, 0.72, 0.64],
      faces: "nsewtb",
    });
    b.col(-16, MY - 0.35, -24, 16, MY, -21, { tag: "floor" });
    for (let x = -15.5; x < 16; x += 1.2)
      b.boxMM("brass", x, MY - 0.55, -21.05, x + 0.9, MY - 0.4, -20.95, {
        tint: [0.6, 0.45, 0.25],
      }); // fascia fret
    K.railing(b, -16, -21, -4.5, -21, MY, {
      h: 1.05,
      mat: "bronze",
      handMat: "brass",
    });
    K.railing(b, 4.5, -21, 16, -21, MY, {
      h: 1.05,
      mat: "bronze",
      handMat: "brass",
    });
    b.hplate("carpet", 0, MY + 0.01, -22.5, 31.6, 2.8, 0, null, {
      tint: [0.8, 0.45, 0.4],
    });
    b.plate(
      "art",
      0,
      MY + 3.7,
      -23.88,
      0,
      1,
      5.2,
      0.55,
      K.signCell("ny_ballroom_sign", "GRAND BALLROOM", 512, 64, {
        bg: "#1c140c",
        fg: "#d8b060",
        font: "Georgia, serif",
      }),
    );
    b.light(0, MY + 2.4, -22.5, [1, 0.7, 0.45], 0.5, 7, { box: LB });
    // lobby lounge: sofas, armchairs, palms, luggage
    K.sofa(b, 8, 0, -1.4, 3.0, 0, { mat: "velvet", tint: [0.5, 0.22, 0.2] });
    armchair(b, 5.6, 0, -5.2, -HP);
    armchair(b, 10.4, 0, -5.4, HP + 0.3);
    K.table(b, 8, 0, -5.3, 1.4, 0.7, { mat: "mahogany", h: 0.45 });
    K.sofa(b, -8, 0, -1.4, 3.0, 0, { mat: "velvet", tint: [0.5, 0.22, 0.2] });
    armchair(b, -5.6, 0, -5.4, HP, [0.3, 0.3, 0.4]);
    K.skel(ctx, -8.3, 0.45, -1.6, 0, "seated");
    K.note(ctx, "ph_ny_note_complaint", -7.4, 0.47, -1.5, {
      name: "Guest Complaint (Room 3324)",
      title: "Letter to the Management — Hotel New Yorker",
      text: 'To the Management,\n\nI have now stayed at your fine hotel for eleven nights and must register three complaints.\n\n1. Pigeons. There are pigeons in the corridor of the 33rd floor. There are pigeons in the ICE MACHINE.\n2. My hair stands on end every evening at nine o\'clock precisely. So does my wife\'s. So does the cat\'s, and the cat is bald.\n3. The "Tesla Suite" next door is supposedly a museum exhibit and closed to guests. Then who is humming? Who is feeding the pigeons? Why does my radio play only one note?\n\nYour bellhop, a Mr. Pembroke, told me "not to worry about the gentleman in 3327." The gentleman in 3327 has been dead since 1943.\n\nP.S. The Foundation men shout "PIGEON POST" at the robot by the 33rd-floor teletype and it lets them by. I have tried it. It does not let ME by.\n\nRespectfully,\nH. Voorhees, Room 3324\n\n(stamped: RECEIVED — MAR 4 1967 — NO ACTION)',
      learn: "ph_ny_term_security",
    });
    deadPalm(b, -14.5, 0, -1.4, r);
    deadPalm(b, 14.5, 0, -1.4, r);
    deadPalm(b, -14.5, 0, -22.5, r);
    deadPalm(b, 14.5, 0, -22.5, r);
    luggageCart(b, 3.2, 0, -2.2, 0.4, r, false);
    luggageCart(b, -6.5, 0, -18.5, 1.2, r, true);
    for (let k = 0; k < 5; k++)
      b.box("leather", -6 + r() * 2.5, 0, -19.5 + r() * 2, 0.6, 0.3, 0.45, {
        yaw: r() * 3,
        tint: r.pick([
          [0.5, 0.3, 0.2],
          [0.3, 0.3, 0.35],
        ]),
      });
    // bell captain's podium with the lockbox
    b.boxMM("mahogany", 11.6, 0, -1.6, 12.6, 1.2, -0.9, {});
    b.col(11.6, 0, -1.6, 12.6, 1.2, -0.9, {});
    b.plate(
      "art",
      12.1,
      1.35,
      -1.62,
      0,
      -1,
      0.9,
      0.22,
      K.signCell("ny_bellcap", "BELL CAPTAIN", 256, 64, {
        bg: "#1c140c",
        fg: "#d8b060",
      }),
    );
    K.loot(ctx, "safe", 13.2, 0, -1.3, 0, {
      name: "Bell Captain's Lockbox",
      locked: 0,
      lock: PH.LOCKS.ny_lockbox,
      items: [
        ["ph_ny_elev_key", 1],
        ["scrip", 35],
        ["scrap_metal", 3],
      ],
    });
    // Patrolman bellhop pod (empty — its occupant wandered off)
    b.cyl("metal_dark", 14.2, 0, -21, 0.9, 0.9, 0.2, 14, {
      tint: [0.3, 0.32, 0.34],
    });
    b.cyl("glass_clear", 14.2, 0.2, -21, 0.85, 0.85, 2.6, 14, {
      top: false,
      tint: [0.7, 0.8, 0.8],
    });
    b.cyl("metal_dark", 14.2, 2.8, -21, 0.95, 0.7, 0.35, 14, {
      tint: [0.3, 0.32, 0.34],
    });
    b.plate(
      "art",
      14.2,
      3.4,
      -20.1,
      0,
      1,
      1.3,
      0.3,
      K.signCell("ny_pod", "MERIDIAN BELLHOP", 256, 64, {
        bg: "#10202a",
        fg: "#80d0ff",
        font: "Arial, sans-serif",
      }),
    );
    b.light(14.2, 2.5, -21, [0.3, 0.6, 1.0], 0.5, 3.5, { box: LB });
    b.glow(14.2, 2.9, -21, [0.2, 0.45, 0.8], 1.2);
    b.col(13.3, 0, -21.9, 15.1, 3.1, -20.1, {});
    // newsstand
    b.boxMM("wood_dark", -3.2, 0, -1.4, -1.8, 1.1, -0.4, {
      tint: [0.5, 0.34, 0.2],
    });
    for (let k = 0; k < 6; k++)
      b.hplate(
        "flat",
        -2.5 + (r() - 0.5) * 1,
        1.11 + k * 0.004,
        -0.9 + (r() - 0.5) * 0.5,
        0.35,
        0.45,
        r() * 0.6,
        null,
        { tint: [0.8, 0.78, 0.7] },
      );
    b.plate(
      "art",
      -2.5,
      1.5,
      -1.42,
      0,
      -1,
      1.2,
      0.35,
      K.signCell(
        "ny_news",
        'THE FIRST JOURNAL — "REDS DENY EVERYTHING"',
        512,
        96,
        { bg: "#e8e0cc", fg: "#1a1a1a", font: "Georgia, serif" },
      ),
    );
    b.col(-3.2, 0, -1.4, -1.8, 1.1, -0.4, {});
    // chandeliers (one dead) + wall sconces
    chandelier(b, -8, 6.2, -12, 1.0, LH, [1, 0.78, 0.5], 1.2, 12, LB, false);
    chandelier(b, 8, 6.2, -12, 1.0, LH, [1, 0.78, 0.5], 0, 0, LB, true);
    chandelier(b, 0, 6.6, -3.5, 0.8, LH, [1, 0.8, 0.55], 1.0, 10, LB, false);
    for (const z of [-4, -20])
      for (const [x, nx] of [
        [-15.85, 1],
        [15.85, -1],
      ]) {
        b.cyl("brass", x + nx * 0.1, 3.4, z, 0.12, 0.2, 0.4, 8, {
          tint: [0.7, 0.55, 0.3],
        });
        b.light(x + nx * 0.4, 3.6, z, [1, 0.7, 0.4], 0.5, 4, { box: LB });
        b.glow(x + nx * 0.15, 3.7, z, [0.8, 0.55, 0.3], 0.8);
      }
    // debris
    K.litter(b, -15, -23, 15, -1, 0, 36, 3);
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -12 + r() * 24,
        0.014 + k * 0.0004,
        -22 + r() * 20,
        1 + r() * 1.5,
        1 + r() * 1.5,
        r() * 6,
        K.decal(k % 3 === 0 ? "puddle" : "grime", k + 3),
      );
    b.hplate("decal", 12.5, 0.016, -10, 2.2, 1.6, 0.3, K.decal("scorch", 2)); // laser scorch
    b.plate("decal", 15.88, 1.5, -12.5, -1, 0, 2.0, 1.2, K.decal("scorch", 4));
    b.plate(
      "decal",
      -15.88,
      3.2,
      -3.2,
      1,
      0,
      2.6,
      0.9,
      K.tag("33 = DEATH", "#e03a2a", 256, 96),
    );

    // ---- staff room / freight elevator (x −22..−16, z −6..0) ----
    const SB = [-22.1, -0.3, -6.1, -15.9, 3.3, 0.1];
    K.room(b, ctx, {
      x0: -22,
      z0: -6,
      x1: -16,
      z1: 0,
      y: 0,
      h: 3.0,
      floor: "concrete",
      fc: [0.6, 0.58, 0.54],
      wall: "plaster_stained",
      wc: [0.7, 0.68, 0.6],
      ceil: "concrete",
      cc: [0.5, 0.48, 0.45],
      trim: false,
    });
    b.boxMM("metal_dark", -21.95, 0, -4.2, -21.85, 2.8, -1.8, {
      tint: [0.4, 0.4, 0.38],
    }); // freight gate
    for (let k = 0; k < 8; k++)
      b.boxMM(
        "metal",
        -21.84,
        0.1,
        -4.1 + k * 0.3,
        -21.8,
        2.7,
        -4.05 + k * 0.3,
        { tint: [0.5, 0.5, 0.46] },
      );
    b.plate(
      "art",
      -21.82,
      3.0,
      -3,
      1,
      0,
      1.6,
      0.3,
      K.signCell("ny_freight", "FREIGHT — STAFF ONLY", 384, 64, {
        bg: "#2a2a20",
        fg: "#e0d080",
        font: "Arial, sans-serif",
      }),
    );
    K.lamp(b, -19, 2.6, -3, "cage", [1, 0.7, 0.4], 0.7, 5, {
      ceil: 3.0,
      lightOpts: { box: SB },
    });
    K.shelf(b, -19, 0, -5.7, 0, 3.4, {
      mat: "metal",
      items: ["box", "can", "box"],
      seed: 51,
    });
    K.loot(ctx, "locker", -16.6, 0, -5.2, HP, {
      loot: "locker",
      name: "Staff Locker",
    });
    K.note(ctx, "ph_ny_note_pembroke", -19.2, 1.02, -5.5, {
      name: "Bellhop Schedule",
      title: "Bellhop Roster — Night Shift, Mar. 4–9, 1967",
      text: "PEMBROKE, A. — Floors 30–35. Room service to 3327 at 9 PM sharp (seed, NOT crackers — see memo).\nDIAZ, R. — Ballroom setup, Shamrock Ball.\nKOWALSKI, T. — sick (radiation? he says sunburn).\n\nMEMO: Staff are reminded that the Tesla Suite is an EXHIBIT maintained by the Stanhope Foundation. Staff are NOT to enter, are NOT to feed the pigeons, and are NOT to ask about the humming. Pembroke, this means you.\n\nNIGHT CODES: front-desk teletype password MOONBALL. Bell captain's lockbox 1-9-3-0 (the year we opened). Stair B fire door keypad 3-3-0-0.",
      learn: ["ph_ny_term_desk", "ph_ny_lockbox", "ph_ny_stairs"],
    });

    // ------------------------------------------------------------------
    // GRAND BALLROOM (y 5.2)
    // ------------------------------------------------------------------
    const BB = [-16.1, MY - 0.3, -52.1, 16.1, MY + BH + 0.2, -23.9];
    K.gap(ctx, -16, -48, 1.4, MY, 2.4); // → service hall
    K.gap(ctx, 16, -33, 2.0, MY, 2.6); // → terrace bar
    K.room(b, ctx, {
      x0: -16,
      z0: -52,
      x1: 16,
      z1: -24,
      y: MY,
      h: BH,
      floor: "carpet",
      fc: [0.45, 0.4, 0.55],
      wall: "plaster",
      wc: [0.8, 0.74, 0.64],
      wain: "wood_dark",
      wainC: [0.5, 0.32, 0.22],
      wainH: 1.2,
      ceil: "plaster",
      cc: [0.78, 0.72, 0.62],
      cornice: true,
      corniceMat: "gold",
    });
    coffers(b, -16, -52, 16, -24, MY + BH, 4, "gold", [0.8, 0.62, 0.35]);
    // parquet dance floor
    b.boxMM("parquet", -8, MY, -42, 8, MY + 0.03, -28, {
      tint: [0.9, 0.8, 0.7],
      faces: "nsewt",
    });
    // pilasters + mirrors + side boxes
    for (let z = -48; z <= -28; z += 5)
      for (const [x, nx] of [
        [-15.9, 1],
        [15.9, -1],
      ]) {
        b.boxMM(
          "deco_wall",
          x - (nx < 0 ? 0.5 : 0),
          MY,
          z - 0.4,
          x + (nx > 0 ? 0.5 : 0),
          MY + BH,
          z + 0.4,
          { tint: [0.85, 0.8, 0.75] },
        );
        b.boxMM(
          "gold",
          x - (nx < 0 ? 0.6 : 0),
          MY + BH - 1.0,
          z - 0.5,
          x + (nx > 0 ? 0.6 : 0),
          MY + BH - 0.7,
          z + 0.5,
          { tint: [0.8, 0.6, 0.3] },
        );
      }
    for (let z = -45.5; z <= -30; z += 5)
      for (const [x, nx] of [
        [-15.88, 1],
        [15.88, -1],
      ]) {
        if (nx < 0 && Math.abs(z - -33) < 2) continue;
        b.plate("glass", x, MY + 2.9, z, nx, 0, 2.6, 3.2, null, {
          tint: [0.45, 0.48, 0.5],
          off: 0.02,
        });
        frameOnly(b, x, MY + 2.9, z, nx, 0, 2.6, 3.2, "gold", 0.12);
        // opera box above
        b.boxMM(
          "gold",
          x + (nx > 0 ? 0 : -1.4),
          MY + 4.8,
          z - 1.4,
          x + (nx > 0 ? 1.4 : 0),
          MY + 5.3,
          z + 1.4,
          { tint: [0.7, 0.55, 0.3] },
        );
        b.boxMM(
          "velvet",
          x + (nx > 0 ? 1.3 : -1.4),
          MY + 5.3,
          z - 1.4,
          x + (nx > 0 ? 1.4 : -1.3),
          MY + 6.2,
          z + 1.4,
          { tint: [0.6, 0.18, 0.15] },
        );
      }
    // stage (x −9..9, z −52..−45.5, top MY+1)
    const ST = MY + 1.0;
    b.boxMM("wood_dark", -9, MY, -52, 9, ST, -45.5, {
      tint: [0.45, 0.3, 0.2],
      faces: "nsewt",
    });
    b.col(-9, MY, -52, 9, ST, -45.5, { tag: "stage", surface: "wood" });
    for (let k = 0; k < 4; k++) {
      const top = MY + (k + 1) * 0.25;
      b.boxMM(
        "wood_dark",
        -2.5,
        MY,
        -45.5 + (3 - k) * 0.32,
        2.5,
        top,
        -45.5 + (4 - k) * 0.32,
        { tint: [0.45, 0.3, 0.2] },
      );
      b.col(
        -2.5,
        MY,
        -45.5 + (3 - k) * 0.32,
        2.5,
        top,
        -45.5 + (4 - k) * 0.32,
        { tag: "stairs", surface: "wood" },
      );
    }
    // proscenium + moon backdrop + curtains
    b.boxMM("gold", -9.6, MY, -45.7, -8.8, MY + BH - 0.5, -45.2, {
      tint: [0.7, 0.55, 0.3],
    });
    b.boxMM("gold", 8.8, MY, -45.7, 9.6, MY + BH - 0.5, -45.2, {
      tint: [0.7, 0.55, 0.3],
    });
    b.boxMM("gold", -9.6, MY + BH - 1.4, -45.7, 9.6, MY + BH - 0.5, -45.2, {
      tint: [0.7, 0.55, 0.3],
    });
    b.plate("art", 0, ST + 3.2, -51.88, 0, 1, 16, 6.2, moonBackdrop(), {
      tint: [1.1, 1.1, 1.1],
    });
    for (const sx of [-1, 1])
      for (let k = 0; k < 7; k++) {
        const x = sx * (8.6 - k * 0.32);
        b.box("velvet", x, ST, -46 - k * 0.05, 0.36, BH - 2.4, 0.2, {
          tint: [0.55, 0.12, 0.1],
        });
      }
    b.boxMM("velvet", -9, MY + BH - 2.2, -46.2, 9, MY + BH - 1.4, -45.9, {
      tint: [0.55, 0.12, 0.1],
    });
    // bandstand: piano, drums, bass, mic — and the band
    b.boxMM("paint_black", 3.5, ST, -50.5, 6.5, ST + 1.0, -49, {
      tint: [0.06, 0.05, 0.05],
    });
    b.quad(
      "paint_black",
      [3.5, ST + 1.0, -49],
      [6.5, ST + 1.0, -49],
      [6.5, ST + 2.0, -50.4],
      [3.5, ST + 2.0, -50.4],
      { tint: [0.06, 0.05, 0.05] },
    );
    b.boxMM("ceramic", 3.6, ST + 0.75, -49.05, 6.4, ST + 0.85, -48.8, {
      tint: [0.9, 0.88, 0.8],
    });
    b.col(3.5, ST, -50.5, 6.5, ST + 1.0, -48.8, {});
    for (const [dx, dz, rr2] of [
      [-4, -50, 0.35],
      [-3.3, -49.6, 0.25],
      [-4.6, -49.4, 0.22],
    ]) {
      b.cyl("paint_red", dx, ST, dz, rr2, rr2, 0.4, 12, {
        tint: [0.6, 0.12, 0.1],
      });
      b.cyl("ceramic", dx, ST + 0.4, dz, rr2, rr2, 0.01, 12);
    }
    b.cyl("brass", -3.7, ST + 0.9, -50.2, 0.3, 0.3, 0.01, 12);
    b.pipe("chrome", -3.7, ST, -50.2, -3.7, ST + 0.9, -50.2, 0.01, 4);
    b.geo("wood", K.sphereGeo(), {
      x: -1.2,
      y: ST + 0.8,
      z: -50.3,
      sx: 0.35,
      sy: 0.6,
      sz: 0.2,
      tint: [0.55, 0.3, 0.15],
    });
    b.pipe("wood_dark", -1.2, ST + 1.2, -50.3, -1.2, ST + 2.0, -50.3, 0.03, 4);
    b.pipe("chrome", 0, ST, -46.8, 0, ST + 1.6, -46.8, 0.012, 4);
    b.geo("chrome", K.sphereGeo(), { x: 0, y: ST + 1.65, z: -46.8, s: 0.06 });
    K.skel(ctx, 5, ST, -48.2, PI, "seated");
    K.skel(ctx, -3.9, ST, -49.0, PI, "seated");
    K.skel(ctx, 0.5, ST, -47.2, 0.4, "lying");
    b.plate("pics", 0, MY + 5.6, -24.12, 0, -1, 22, 4.2, muralCell(), {
      tint: [1.05, 1.0, 0.95],
    });
    frameOnly(b, 0, MY + 5.6, -24.12, 0, -1, 22, 4.2, "gold", 0.2);
    b.light(0, MY + 5.0, -26.5, [1, 0.8, 0.5], 0.9, 10, { box: BB });
    b.plate(
      "art",
      0,
      MY + BH - 0.95,
      -45.1,
      0,
      1,
      12,
      0.8,
      K.signCell(
        "ny_hmb",
        "SHAMROCK BALL · MARCH 5, 1967 · DANCING TILL DAWN",
        1024,
        80,
        {
          bg: "#1c1030",
          fg: "#f0d890",
          font: "Georgia, serif",
          border: "#c8a050",
        },
      ),
    );
    // stage footlights
    for (let x = -8; x <= 8; x += 1)
      b.glow(x, ST + 0.08, -45.7, [0.6, 0.45, 0.25], r() < 0.3 ? 0.2 : 0.5);
    b.light(0, ST + 1.5, -47, [0.5, 0.45, 0.9], 1.2, 9, { box: BB });
    b.light(0, ST + 4, -50, [0.9, 0.75, 0.45], 0.8, 8, { box: BB });
    b.light(0, ST + 3.5, -47, [0.75, 0.75, 1.0], 1.3, 9, { box: BB });
    // banquet tables around the dance floor
    for (const x of [-12.2, 12.2])
      for (let z = -43; z <= -28; z += 5) {
        if (x > 0 && Math.abs(z - -33) < 2.5) continue;
        banquetTable(b, x, MY, z, 0.9, r);
        b.glow(x, MY + 1.1, z, [0.8, 0.5, 0.25], 0.45);
        b.light(x, MY + 1.2, z, [1, 0.6, 0.3], 0.35, 3, { box: BB });
      }
    for (const [x, z] of [
      [-4.5, -26],
      [4.5, -26],
    ])
      banquetTable(b, x, MY, z, 0.8, r);
    // chandeliers: two up, one crashed onto the dance floor
    chandelier(
      b,
      0,
      MY + 6.0,
      -30,
      1.5,
      MY + BH,
      [0.95, 0.8, 0.55],
      1.1,
      14,
      BB,
      false,
    );
    chandelier(
      b,
      0,
      MY + 6.0,
      -44,
      1.5,
      MY + BH,
      [0.95, 0.8, 0.55],
      0,
      0,
      BB,
      true,
    );
    fallenChandelier(b, 1.2, MY + 0.03, -37, 1.5, r);
    b.pipe("brass", 0, MY + 4.5, -37, 0, MY + BH, -37, 0.02, 4); // snapped chain
    b.light(0, MY + 6, -37, [0.45, 0.5, 0.9], 0.5, 12, { box: BB }); // cold "moonlight" fill
    // the last dance: a couple on the floor, and a waiter
    K.skel(ctx, -3.2, MY + 0.03, -35.5, 0.6, "lying");
    K.skel(ctx, -2.6, MY + 0.03, -35.1, 3.7, "lying");
    K.skel(ctx, 6.5, MY, -41, 2.4, "reaching");
    K.note(ctx, "ph_ny_note_dancecard", -3.0, MY + 0.05, -34.4, {
      name: "Dance Card (Shamrock Ball)",
      title: 'Dance card — "Miss D. Ferraro"',
      text: "1. Foxtrot — Tommy\n2. Waltz — Tommy\n3. Lindy — Tommy (he insists)\n4. Rumba — Mr. Pembroke (the bellhop!! he's cute)\n5. Slow dance — ???\n\n(scrawled across the bottom in a shaking hand:)\nThey told us to stay put. Tommy says the band will play till the all-clear. The band is still playing. There is no all-clear. Tommy won't let go and I don't want him to. Last dance, then.",
    });
    for (let k = 0; k < 10; k++)
      b.hplate(
        "decal",
        -14 + r() * 28,
        MY + 0.035 + k * 0.0004,
        -50 + r() * 24,
        1 + r() * 1.4,
        1 + r() * 1.4,
        r() * 6,
        K.decal(k % 4 === 0 ? "scorch" : "grime", k + 11),
      );
    K.litter(b, -15, -45, 15, -25, MY, 30, 9);
    K.loot(ctx, "cash_register", 14.3, MY + 1.1, -46.6, PI, {
      loot: "cash_register",
      name: "Coat Check Till",
    });
    b.boxMM("mahogany", 12.8, MY, -50, 15.9, MY + 1.1, -46, {
      tint: [0.5, 0.3, 0.2],
    });
    b.col(12.8, MY, -50, 15.9, MY + 1.1, -46, {});
    b.plate(
      "art",
      14.3,
      MY + 2.4,
      -50.1,
      0,
      1,
      1.8,
      0.35,
      K.signCell("ny_coat", "COAT CHECK", 256, 64, {
        bg: "#1c140c",
        fg: "#d8b060",
      }),
    );
    for (let k = 0; k < 8; k++)
      b.box("fabric", 13.2 + (k % 4) * 0.7, MY + 1.2, -50.8, 0.5, 1.3, 0.25, {
        tint: r.pick([
          [0.2, 0.2, 0.25],
          [0.4, 0.3, 0.25],
          [0.5, 0.2, 0.2],
        ]),
      });

    // ---- service hall (x −28..−16, z −50..−46) + stair landing (x −32..−28) ----
    const SH = [-32.1, MY - 0.3, -52.1, -15.9, MY + 3.4, -43.9];
    K.gap(ctx, -28, -48, 1.6, MY, 2.4);
    K.room(b, ctx, {
      x0: -28,
      z0: -50,
      x1: -16,
      z1: -46,
      y: MY,
      h: 3.0,
      floor: "checker",
      fc: [0.6, 0.58, 0.54],
      wall: "subway_tile",
      wc: [0.8, 0.8, 0.74],
      ceil: "plaster",
      cc: [0.5, 0.48, 0.45],
    });
    K.room(b, ctx, {
      x0: -32,
      z0: -52,
      x1: -28,
      z1: -44,
      y: MY,
      h: 3.2,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "concrete",
      wc: [0.6, 0.58, 0.54],
      ceil: "concrete",
      cc: [0.4, 0.38, 0.36],
      trim: false,
    });
    // decorative stair flights in the shaft (up into darkness, down into rubble)
    K.stairs(b, -31.8, -51.8, -30.2, -46.8, MY, MY + 1.9, "+z", {
      mat: "concrete",
      rail: "l",
      railMat: "rust",
      handMat: "rust",
      tint: [0.55, 0.53, 0.5],
    });
    K.rubble(b, -30.8, MY, -45.2, 1.1, 1.0, { seed: 12 });
    b.boxMM("metal_dark", -31.95, MY, -48.8, -31.85, MY + 2.3, -47.2, {
      tint: [0.35, 0.36, 0.3],
    }); // fire door
    b.plate(
      "art",
      -31.83,
      MY + 2.6,
      -48,
      1,
      0,
      1.2,
      0.3,
      K.signCell("ny_stair33", "STAIR B · FLOORS 3–40", 256, 64, {
        bg: "#2a2a20",
        fg: "#e0d080",
        font: "Arial, sans-serif",
      }),
    );
    b.plate("lamp", -30, MY + 2.9, -44.12, 0, -1, 0.6, 0.2, null, {
      tint: [0.9, 0.2, 0.15],
    });
    b.plate(
      "neon",
      -30,
      MY + 2.9,
      -44.14,
      0,
      -1,
      0.6,
      0.2,
      K.neonCell("ny_exit", "EXIT", 128, 48, { color: "#ff3020" }),
    );
    K.lamp(b, -22, MY + 2.6, -48, "bulb", [1, 0.7, 0.4], 0.6, 6, {
      ceil: MY + 3.0,
      lightOpts: { box: SH },
    });
    K.lamp(b, -30, MY + 2.8, -48, "cage", [1, 0.3, 0.2], 0.5, 5, {
      ceil: MY + 3.2,
      lightOpts: { box: SH },
    });
    for (const x of [-25, -19]) {
      b.boxMM("steel", x - 0.5, MY, -49.8, x + 0.5, MY + 0.9, -49.2, {
        tint: [0.7, 0.7, 0.7],
      });
      b.cyl("ceramic", x, MY + 0.9, -49.5, 0.2, 0.2, 0.15, 10);
      b.col(x - 0.5, MY, -49.8, x + 0.5, MY + 0.9, -49.2, {});
    } // room-service carts
    K.skel(ctx, -21.5, MY, -47.2, 1.2, "lying");
    b.hplate(
      "decal",
      -21.5,
      MY + 0.013,
      -47.4,
      1.8,
      1.4,
      0.4,
      K.decal("blood", 6),
    );
    K.loot(ctx, "locker", -17, MY, -49.6, PI, {
      loot: "locker",
      name: "Linen Locker",
    });
    K.loot(ctx, "first_aid", -24, MY + 1.3, -46.15, 0, { loot: "first_aid" });

    // ---- terrace bar (x 16..26, z −40..−26) ----
    const TB = [15.9, MY - 0.3, -40.1, 26.1, MY + 3.8, -25.9];
    K.room(b, ctx, {
      x0: 16,
      z0: -40,
      x1: 26,
      z1: -26,
      y: MY,
      h: 3.6,
      floor: "checker",
      fc: [0.5, 0.45, 0.42],
      wall: "wallpaper_green",
      wc: [0.55, 0.6, 0.5],
      wain: "wood_dark",
      wainC: [0.45, 0.28, 0.18],
      ceil: "tin",
      cc: [0.6, 0.5, 0.35],
    });
    b.boxMM("mahogany", 22.8, MY, -38.5, 23.8, MY + 1.1, -28, {
      tint: [0.5, 0.3, 0.2],
    });
    b.boxMM("brass", 22.7, MY + 1.1, -38.6, 23.9, MY + 1.16, -27.9, {
      tint: [0.7, 0.55, 0.3],
    });
    b.col(22.7, MY, -38.6, 23.9, MY + 1.16, -27.9, { tag: "counter" });
    K.shelf(b, 25.7, MY, -33, -HP, 6, {
      mat: "wood_dark",
      items: ["bottle", "bottle", "bottle", "jar"],
      seed: 61,
      h: 2.4,
    });
    b.plate("glass", 25.88, MY + 2.2, -33, -1, 0, 5.6, 1.2, null, {
      tint: [0.5, 0.5, 0.55],
    });
    for (let z = -37.5; z <= -29; z += 1.4) {
      b.cyl("chrome", 22.1, MY, z, 0.05, 0.05, 0.75, 6);
      b.cyl("vinyl_red", 22.1, MY + 0.75, z, 0.22, 0.22, 0.08, 10);
    }
    for (const z of [-38.6, -35.2]) {
      K.sofa(b, 16.6, MY, z + 1.2, 1.6, -HP, { mat: "leather_red", d: 0.7 });
      K.table(b, 18.2, MY, z + 1.2, 0.7, 1.3, { mat: "mahogany" });
    }
    b.plate(
      "neon",
      20.8,
      MY + 2.6,
      -39.88,
      0,
      1,
      3.6,
      0.8,
      K.neonCell("ny_terrace", "Terrace Room", 512, 110, {
        color: "#40e0ff",
        font: "Georgia, serif",
        italic: true,
      }),
    );
    b.glow(20.8, MY + 2.6, -39.4, [0.2, 0.6, 0.8], 3);
    b.light(20.8, MY + 2.4, -38.5, [0.3, 0.8, 1.0], 0.7, 6, { box: TB });
    K.lamp(b, 23.3, MY + 2.8, -33, "pendant", [1, 0.75, 0.45], 0.7, 6, {
      ceil: MY + 3.6,
      shade: "paint_green",
      lightOpts: { box: TB },
    });
    K.loot(ctx, "cash_register", 23.3, MY + 1.16, -30, -HP, {
      loot: "cash_register",
      name: "Bar Till",
    });
    K.loot(ctx, "fridge", 25.4, MY, -27, HP, {
      loot: "fridge",
      name: "Ice Box",
      items: [
        ["beer", 2],
        ["whiskey", 1],
        ["fizzo_cola", 1],
      ],
    });
    K.skel(ctx, 17.4, MY + 0.45, -37.4, HP, "seated");

    // ------------------------------------------------------------------
    // 33rd FLOOR
    // ------------------------------------------------------------------
    const F33 = [-36.1, -0.3, 69.9, 30.1, FH + 0.2, 90.1];
    const wallp = {
      floor: "carpet_deco",
      fc: [0.8, 0.7, 0.66],
      wall: "wallpaper",
      wc: [0.82, 0.76, 0.66],
      wain: "wood_dark",
      wainC: [0.45, 0.3, 0.2],
      wainH: 0.9,
      ceil: "plaster",
      cc: [0.6, 0.58, 0.54],
      h: FH,
      y: 0,
    };
    // doors from the corridor
    const NDOORS = { 3323: -26, 3325: -18, 3327: -10, 3333: 24 };
    const SDOORS = { 3322: -25, linen: -7, lift: 0, 3326: 9, 3330: 26 };
    for (const k in NDOORS) K.gap(ctx, NDOORS[k], 78, 1.2, 0, 2.3);
    for (const k in SDOORS)
      K.gap(ctx, SDOORS[k], 82, k === "lift" ? 4 : 1.2, 0, 2.3);
    K.gap(ctx, -30, 80, 1.6, 0, 2.3); // corridor → stairwell
    K.gap(ctx, -6, 74.5, 1.1, 0, 2.3); // parlor → bedroom
    K.gap(ctx, -2, 70, 1.3, 0, 2.3); // bedroom → LAB (hidden by the wardrobe)
    K.room(b, ctx, Object.assign({ x0: -30, z0: 78, x1: 30, z1: 82 }, wallp));
    // closed doors (plates) with numbers + corridor dressing
    const doorPlate = (x, z, nz, n, state) => {
      b.boxMM(
        "wood_dark",
        x - 0.6,
        0,
        z + nz * 0.1,
        x + 0.6,
        2.25,
        z + nz * 0.14,
        { tint: state === "boarded" ? [0.35, 0.28, 0.2] : [0.5, 0.33, 0.22] },
      );
      b.cyl("brass", x + 0.42, 1.0, z + nz * 0.17, 0.04, 0.04, 0.05, 6);
      if (state === "boarded")
        for (let k = 0; k < 3; k++)
          b.beam(
            "wood_rotten",
            x - 0.9,
            0.6 + k * 0.6,
            z + nz * 0.2,
            x + 0.9,
            0.8 + k * 0.55,
            z + nz * 0.2,
            0.18,
            0.04,
          );
      if (n)
        b.plate("art", x, 2.5, z + nz * 0.11, 0, nz, 0.36, 0.18, roomNo(n));
    };
    for (const [n, x] of [
      [3329, 6],
      [3331, 14],
    ])
      doorPlate(x, 78, 1, n, n === 3331 ? "boarded" : "closed");
    for (const [n, x] of [
      [3324, -15],
      [3328, 18],
    ])
      doorPlate(x, 82, -1, n, "closed");
    for (const n in NDOORS)
      if (n !== "3327")
        b.plate(
          "art",
          NDOORS[n] + 0.9,
          1.9,
          78.12,
          0,
          1,
          0.36,
          0.18,
          roomNo(n),
        );
    for (const n of ["3322", "3326", "3330"])
      b.plate("art", SDOORS[n] + 0.9, 1.9, 81.88, 0, -1, 0.36, 0.18, roomNo(n));
    b.plate(
      "art",
      -10,
      2.6,
      78.12,
      0,
      1,
      1.6,
      0.4,
      plaqueCell("ny_suite_door", "THE TESLA SUITE · 3327", 512, 128),
    );
    // velvet rope stanchions at the suite door
    for (const dx of [-0.9, 0.9]) {
      b.cyl("brass", -10 + dx, 0, 79.1, 0.12, 0.12, 0.05, 10);
      b.pipe("brass", -10 + dx, 0, 79.1, -10 + dx, 1.0, 79.1, 0.03, 6);
      b.geo("brass", K.sphereGeo(), { x: -10 + dx, y: 1.04, z: 79.1, s: 0.05 });
    }
    b.beam("velvet", -10.9, 0.9, 79.1, -10.4, 0.55, 79.1, 0.05, 0.05, {
      tint: [0.6, 0.12, 0.1],
    });
    // corridor lights (sconces, flickery), pigeons' mess, the downed cable
    for (let x = -26; x <= 26; x += 6.5) {
      const dead = r() < 0.35;
      b.cyl("brass", x, 2.2, 78.15, 0.1, 0.15, 0.3, 8, {
        tint: [0.65, 0.5, 0.3],
      });
      if (!dead) {
        b.light(x, 2.3, 79, [1, 0.72, 0.42], 0.7, 5.5, { box: F33 });
        b.glow(x, 2.35, 78.3, [0.8, 0.55, 0.3], 0.7);
      }
    }
    b.light(28, 2.3, 80, [1, 0.25, 0.15], 0.6, 6, { box: F33 }); // red emergency lamp by the far end
    b.glow(29.8, 2.6, 80, [1, 0.2, 0.1], 0.8);
    for (let k = 0; k < 16; k++)
      b.hplate(
        "decal",
        -29 + r() * 58,
        0.012 + k * 0.0004,
        78.4 + r() * 3.2,
        0.5 + r() * 0.8,
        0.5 + r() * 0.8,
        r() * 6,
        K.decal(k % 5 === 0 ? "blood" : "grime", k + 40),
      );
    for (let k = 0; k < 30; k++)
      b.box(
        "ceramic",
        -28 + r() * 56,
        0.01,
        78.3 + r() * 3.4,
        0.08,
        0.01,
        0.05,
        { yaw: r() * 3, tint: [0.9, 0.9, 0.88] },
      ); // feathers
    K.litter(b, -29, 78.3, 29, 81.7, 0, 18, 33);
    // the sparking cable (hazard) hanging from a broken ceiling panel by 3329
    b.boxMM("paint_black", 3.4, FH - 0.02, 79.2, 5.2, FH, 80.8, {
      tint: [0.03, 0.03, 0.03],
      faces: "b",
    });
    b.pipe("rubber", 4.3, FH, 80, 4.1, 1.2, 80.3, 0.03, 5);
    b.pipe("rubber", 4.1, 1.2, 80.3, 3.6, 0.05, 80.9, 0.03, 5);
    ctx.dyn.spark = { x: 3.6, y: 0.2, z: 80.9 };
    b.hplate("decal", 3.7, 0.014, 80.8, 1.4, 1.4, 0, K.decal("scorch", 8));
    // stairwell (x −36..−30, z 76..84)
    K.room(b, ctx, {
      x0: -36,
      z0: 76,
      x1: -30,
      z1: 84,
      y: 0,
      h: 3.2,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "concrete",
      wc: [0.6, 0.58, 0.54],
      ceil: "concrete",
      cc: [0.4, 0.38, 0.36],
      trim: false,
    });
    K.stairs(b, -35.8, 76.2, -34.2, 81.5, 0, 1.9, "-z", {
      mat: "concrete",
      rail: "r",
      railMat: "rust",
      handMat: "rust",
      tint: [0.55, 0.53, 0.5],
    });
    b.boxMM("metal_dark", -35.95, 0, 82.2, -35.85, 2.3, 83.8, {
      tint: [0.35, 0.36, 0.3],
    });
    b.plate(
      "art",
      -35.83,
      2.6,
      83,
      1,
      0,
      1.2,
      0.3,
      K.signCell("ny_stairb33", "STAIR B · 33", 256, 64, {
        bg: "#2a2a20",
        fg: "#e0d080",
        font: "Arial, sans-serif",
      }),
    );
    b.plate(
      "art",
      -30.12,
      2.4,
      77.4,
      -1,
      0,
      0.8,
      0.8,
      K.signCell("ny_33", "33", 128, 128, {
        bg: "#2a2a20",
        fg: "#e0d080",
        font: "Arial Black, sans-serif",
      }),
    );
    K.lamp(b, -33, 2.8, 80, "cage", [1, 0.3, 0.2], 0.6, 5, {
      ceil: 3.2,
      lightOpts: { box: [-36.1, -0.3, 75.9, -29.9, 3.4, 84.1] },
    });
    // window plates (skyline) for south rooms
    const skyWin = (x, z, w) => {
      b.plate("paint_black", x, 1.7, z - 0.11, 0, -1, w, 1.7, null, {
        tint: [0.02, 0.02, 0.02],
        off: 0.005,
      });
      b.plate(
        "neon",
        x,
        1.7,
        z - 0.12,
        0,
        -1,
        w - 0.05,
        1.65,
        skylineCell(((x * 7) | 0) & 3),
        { tint: [0.85, 0.85, 0.85], off: 0.006 },
      );
      b.boxMM(
        "paint_cream",
        x - w / 2 - 0.08,
        0.8,
        z - 0.2,
        x + w / 2 + 0.08,
        0.86,
        z - 0.1,
        { tint: [0.7, 0.65, 0.55] },
      );
      b.boxMM(
        "paint_cream",
        x - 0.03,
        0.86,
        z - 0.16,
        x + 0.03,
        2.55,
        z - 0.12,
        { tint: [0.7, 0.65, 0.55] },
      );
      b.light(x, 1.8, z - 1.2, [0.4, 0.55, 0.5], 0.45, 4.5, { box: F33 });
    };
    // ---- 3322 (x −30..−20, z 82..90): the treasure hunter's camp ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: -30, z0: 82, x1: -20, z1: 90 }, wallp, {
        wc: [0.7, 0.72, 0.6],
      }),
    );
    skyWin(-27, 90, 1.6);
    skyWin(-23, 90, 1.6);
    K.bed(b, -28.3, 0, 85, -HP, { w: 1.4, l: 2.0 });
    K.table(b, -21.4, 0, 88.6, 1.0, 0.6, { mat: "wood_dark" });
    b.box("cloth_green", -23.2, 0, 84, 1.8, 0.1, 0.8, {
      yaw: 0.2,
      tint: [0.4, 0.5, 0.3],
    }); // bedroll
    b.cyl("rust", -24.5, 0, 85.5, 0.25, 0.25, 0.3, 8);
    b.glow(-24.5, 0.4, 85.5, [0.8, 0.4, 0.15], 0.6);
    b.light(-24.5, 0.6, 85.5, [1, 0.5, 0.2], 0.6, 4, { box: F33 }); // camp stove
    K.skel(ctx, -22.8, 0, 85.2, 2.6, "curled");
    K.note(ctx, "ph_ny_reel_vance", -21.3, 0.78, 88.5, {
      type: "tape",
      name: "Tape reel: Vance's Notes",
      title: 'Vance Obi — "The Tesla Job"',
      text: "Entry one. Room 3322, 33rd floor, Hotel New Yorker. Everybody in Grand Central knows the story: old Tesla lived next door till '43, and somebody kept working in there after he died. Death ray. Wireless power. Every scavver's dream.\n\nEntry four. The suite's an exhibit — velvet ropes, a plaque, bird cages. Too clean. The floorboards by the wardrobe are worn in a half-circle. Wardrobes don't move. This one does.\n\nEntry five. The big robot on this floor patrols corridor, corridor, suite, corridor. I can hear something humming behind the wall. Every forty seconds the lights dim like something big is breathing in.\n\nEntry six. It saw me. Leg's bad. If anyone finds this: the wardrobe in the BEDROOM. Push it. And whatever you do, don't stand near the coils when they sing.",
    });
    K.loot(ctx, "duffle_bag", -21.2, 0, 86.5, 0.4, {
      loot: "skeleton",
      name: "Vance's Pack",
      items: [
        ["rally_tonic", 1],
        ["ammo_gyrojet", 12],
        ["scrap_metal", 4],
      ],
    });
    K.lamp(b, -25, 2.5, 86, "bulb", [1, 0.75, 0.45], 0.4, 5, {
      ceil: FH,
      dead: false,
      lightOpts: { box: [-30.1, -0.3, 81.9, -19.9, 3.2, 90.1] },
    });
    // ---- linen closet / ice machine (x −10..−4) ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: -10, z0: 82, x1: -4, z1: 90 }, wallp, {
        floor: "checker",
        fc: [0.6, 0.58, 0.54],
        wall: "subway_tile",
        wc: [0.8, 0.8, 0.74],
        wain: null,
      }),
    );
    K.shelf(b, -9.7, 0, 86, HP, 5, {
      mat: "metal",
      items: ["box", "box", "box"],
      seed: 71,
    });
    b.boxMM("stainless", -5.8, 0, 88.6, -4.2, 1.6, 89.9, {
      tint: [0.85, 0.88, 0.9],
    });
    b.plate(
      "art",
      -5,
      1.35,
      88.58,
      0,
      -1,
      1.2,
      0.3,
      K.signCell("ny_ice", "ICE", 128, 48, {
        bg: "#1a3a6a",
        fg: "#e8f0ff",
        font: "Arial Black, sans-serif",
      }),
    );
    b.col(-5.8, 0, 88.6, -4.2, 1.6, 89.9, {});
    for (let k = 0; k < 6; k++) {
      const px = -5 + (r() - 0.5) * 1.2,
        pz = 87.8 + (r() - 0.5) * 1;
      b.geo("ceramic", K.sphereGeo(), {
        x: px,
        y: 0.09,
        z: pz,
        sx: 0.12,
        sy: 0.08,
        sz: 0.2,
        tint: [0.75, 0.75, 0.72],
      });
    } // pigeons (dead, dusty)
    K.lamp(b, -7, 2.7, 86, "tube", [0.8, 0.9, 1.0], 0.5, 5, {
      ceil: FH,
      len: 1.2,
      lightOpts: { box: [-10.1, -0.3, 81.9, -3.9, 3.2, 90.1] },
    });
    K.loot(ctx, "footlocker", -8.6, 0, 89.2, 0, {
      loot: "footlocker",
      name: "Housekeeping Chest",
    });
    // ---- elevator lobby (x −4..4, z 82..90) ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: -4, z0: 82, x1: 4, z1: 90 }, wallp, {
        floor: "marble",
        fc: [0.75, 0.7, 0.64],
        wain: "deco_wall",
        wainC: [0.85, 0.75, 0.7],
        wainH: 1.4,
      }),
    );
    elevatorDoor(
      b,
      -1.6,
      0,
      89.9,
      0,
      -1,
      false,
      K.signCell("ny_elev_33", "33", 128, 64, { bg: "#1c140c", fg: "#d8b060" }),
    );
    elevatorDoor(b, 1.6, 0, 89.9, 0, -1, true, null);
    b.light(0, 2.6, 86, [1, 0.7, 0.45], 0.8, 6, {
      box: [-4.1, -0.3, 81.9, 4.1, 3.2, 90.1],
    });
    b.glow(0, 2.9, 86, [0.8, 0.6, 0.35], 1.0);
    b.cyl("brass", 0, 2.95, 86, 0.3, 0.15, 0.05, 12);
    b.plate(
      "decal",
      3.88,
      1.5,
      86,
      -1,
      0,
      1.6,
      0.8,
      K.tag("TURN BACK", "#e04030", 256, 96),
    );
    // ---- 3326 (x 4..14): collapsed ceiling ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: 4, z0: 82, x1: 14, z1: 90 }, wallp, {
        wc: [0.75, 0.66, 0.6],
        noCeil: true,
      }),
    );
    b.face("plaster", 4, FH, 82, 1, 0, 0, 0, 0, 1, 5, 8, {
      uv: "top",
      tint: [0.6, 0.58, 0.54],
    });
    b.face("plaster", 9, FH, 82, 1, 0, 0, 0, 0, 1, 5, 3, {
      uv: "top",
      tint: [0.6, 0.58, 0.54],
    });
    b.boxMM("paint_black", 9, FH + 1.5, 85, 14, FH + 1.6, 90, {
      tint: [0.03, 0.03, 0.03],
      faces: "b",
    });
    K.rubble(b, 11.2, 0, 87.2, 2.2, 1.4, { seed: 21 });
    for (let k = 0; k < 4; k++)
      b.beam(
        "rust",
        9.2 + k * 1.2,
        FH + 0.3,
        85.2,
        10 + k * 1.1,
        0.3,
        88 + r(),
        0.12,
        0.2,
      );
    skyWin(6.2, 90, 1.6);
    K.bed(b, 6, 0, 84.5, -HP, { w: 1.4, l: 2.0 });
    K.loot(ctx, "desk", 5, 0, 88.9, 0, { loot: "desk" });
    b.light(8, 2.2, 86, [0.5, 0.6, 0.55], 0.5, 6, {
      box: [3.9, -0.3, 81.9, 14.1, 4.8, 90.1],
    });
    // ---- 3330 (x 22..30): robots' charging bay ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: 22, z0: 82, x1: 30, z1: 90 }, wallp, {
        wall: "metal",
        wc: [0.55, 0.6, 0.6],
        wain: null,
        floor: "metal",
        fc: [0.5, 0.52, 0.5],
      }),
    );
    for (const x of [24, 27.5]) {
      b.boxMM("metal_dark", x - 0.9, 0, 89.2, x + 0.9, 2.6, 89.9, {
        tint: [0.35, 0.38, 0.4],
      });
      b.plate("lamp", x, 2.2, 89.18, 0, -1, 1.2, 0.12, null, {
        tint: [0.3, 0.9, 0.4],
      });
      b.glow(x, 2.2, 89, [0.2, 0.7, 0.3], 0.8);
      b.light(x, 1.6, 88.2, [0.3, 0.9, 0.4], 0.5, 4, {
        box: [21.9, -0.3, 81.9, 30.1, 3.2, 90.1],
      });
      b.pipe("rubber", x, 1.2, 89.2, x + 0.4, 0.05, 87.8, 0.03, 5);
    }
    b.plate(
      "art",
      26,
      2.6,
      82.12,
      0,
      1,
      2.2,
      0.35,
      K.signCell("ny_meridian_bay", "MERIDIAN SECURITY — CHARGING", 384, 64, {
        bg: "#10202a",
        fg: "#80d0ff",
        font: "Arial, sans-serif",
      }),
    );
    K.terminal(
      ctx,
      "ph_ny_term_security",
      29.3,
      0,
      85.6,
      HP,
      termSecurity(),
      "own_desk",
    );
    K.loot(ctx, "toolbox", 23, 0, 83, PI, { loot: "toolbox" });
    K.loot(ctx, "ammo_box", 29.3, 0, 83.2, HP, {
      loot: "ammo_box",
      name: "Battery Crate",
      items: [
        ["ammo_dry_cell", 6],
        ["ammo_gyrojet", 12],
        ["dry_cell", 1],
      ],
    });
    // ---- 3323 (x −30..−22, z 70..78): stripped room ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: -30, z0: 70, x1: -22, z1: 78 }, wallp, {
        wc: [0.6, 0.62, 0.55],
      }),
    );
    K.bed(b, -28.5, 0, 72.2, -HP, {});
    K.loot(ctx, "desk", -23, 0, 71, PI, { loot: "dresser", name: "Dresser" });
    b.plate("art", -26, 1.6, 70.12, 0, 1, 1.4, 1.0, K.painting(3, 128, 96), {});
    K.lamp(b, -26, 2.5, 74, "bulb", [1, 0.7, 0.4], 0.45, 5, {
      ceil: FH,
      lightOpts: { box: [-30.1, -0.3, 69.9, -21.9, 3.2, 78.1] },
    });
    // ---- 3325 (x −22..−14): pigeon roost ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: -22, z0: 70, x1: -14, z1: 78 }, wallp, {
        wc: [0.72, 0.7, 0.6],
      }),
    );
    for (let k = 0; k < 40; k++)
      b.hplate(
        "decal",
        -21.5 + r() * 7,
        0.012 + k * 0.0003,
        70.5 + r() * 7,
        0.4 + r() * 0.6,
        0.4 + r() * 0.6,
        r() * 6,
        droppingsCell(k % 3),
      );
    for (let k = 0; k < 18; k++) {
      const px = -21 + r() * 6,
        pz = 71 + r() * 6;
      b.geo("ceramic", K.sphereGeo(), {
        x: px,
        y: 0.1,
        z: pz,
        sx: 0.12,
        sy: 0.08,
        sz: 0.2,
        ry: r() * 6,
        tint: r() < 0.3 ? [0.9, 0.9, 0.88] : [0.5, 0.52, 0.55],
      });
    }
    K.bed(b, -20.6, 0, 72.2, -HP, { tint: [0.6, 0.6, 0.55] });
    K.lamp(b, -18, 2.5, 74, "bulb", [1, 0.7, 0.4], 0, 0, {
      ceil: FH,
      dead: true,
    });
    b.light(-18, 2.0, 76, [0.6, 0.55, 0.45], 0.35, 5, {
      box: [-22.1, -0.3, 69.9, -13.9, 3.2, 78.1],
    });
    K.loot(ctx, "file_cabinet", -14.6, 0, 71.2, HP, { loot: "file_cabinet" });
    // ---- 3333 (x 18..30, z 70..78): security office ----
    K.room(
      b,
      ctx,
      Object.assign({ x0: 18, z0: 70, x1: 30, z1: 78 }, wallp, {
        wall: "plaster_stained",
        wc: [0.65, 0.62, 0.55],
        wain: null,
        floor: "concrete",
        fc: [0.55, 0.53, 0.5],
      }),
    );
    for (let k = 0; k < 4; k++) {
      b.boxMM(
        "metal_dark",
        19 + k * 1.4,
        1.2,
        70.12,
        20.2 + k * 1.4,
        2.2,
        70.6,
        { tint: [0.3, 0.32, 0.3] },
      );
      b.plate("lamp", 19.6 + k * 1.4, 1.7, 70.62, 0, 1, 1.0, 0.75, null, {
        tint: k === 2 ? [0.05, 0.05, 0.05] : [0.25, 0.5, 0.35],
      });
    }
    b.light(22, 1.8, 72, [0.3, 0.8, 0.5], 0.6, 5, {
      box: [17.9, -0.3, 69.9, 30.1, 3.2, 78.1],
    });
    K.table(b, 22, 0, 71.6, 4, 0.8, { mat: "metal", tint: [0.5, 0.52, 0.5] });
    K.chair(b, 22, 0, 72.6, 0, { mat: "metal" });
    K.loot(ctx, "locker", 29.6, 0, 74, HP, {
      loot: "locker",
      name: "Security Locker",
      locked: 0,
      lock: PH.LOCKS.ny_sec_locker,
      items: [
        ["ph_ny_elev_key", 1],
        ["rally_tonic", 2],
        ["ammo_10mm", 24],
      ],
    });
    K.lamp(b, 26, 2.6, 75, "tube", [0.8, 0.9, 1.0], 0.5, 5, {
      ceil: FH,
      len: 1.2,
      lightOpts: { box: [17.9, -0.3, 69.9, 30.1, 3.2, 78.1] },
    });
    b.plate("decal", 29.88, 1.4, 76, -1, 0, 1.8, 1.0, K.decal("scorch", 12));

    // ---- THE TESLA SUITE: parlor (x −14..−6) ----
    const PB = [-14.1, -0.3, 69.9, -5.9, 3.2, 78.1];
    K.room(
      b,
      ctx,
      Object.assign({ x0: -14, z0: 70, x1: -6, z1: 78 }, wallp, {
        wall: "wallpaper_green",
        wc: [0.62, 0.66, 0.52],
        floor: "wood",
        fc: [0.6, 0.45, 0.32],
        cornice: true,
      }),
    );
    b.hplate("carpet", -10, 0.012, 74, 5, 3.6, 0, null, {
      tint: [0.6, 0.35, 0.3],
    });
    // pigeon cages along the west wall (three tiers)
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 4; i++) {
        const cz = 71 + i * 1.6,
          cy = 0.1 + j * 0.85;
        b.boxMM("wood_dark", -13.95, cy, cz - 0.7, -13.1, cy + 0.06, cz + 0.7, {
          tint: [0.5, 0.35, 0.22],
        });
        for (let k = 0; k <= 6; k++)
          b.pipe(
            "brass",
            -13.15,
            cy,
            cz - 0.7 + k * 0.23,
            -13.15,
            cy + 0.75,
            cz - 0.7 + k * 0.23,
            0.006,
            3,
            { tint: [0.6, 0.5, 0.3] },
          );
        b.boxMM(
          "brass",
          -13.95,
          cy + 0.74,
          cz - 0.7,
          -13.1,
          cy + 0.78,
          cz + 0.7,
          { tint: [0.6, 0.5, 0.3] },
        );
        if (r() < 0.5)
          b.geo("ceramic", K.sphereGeo(), {
            x: -13.5,
            y: cy + 0.14,
            z: cz + (r() - 0.5) * 0.6,
            sx: 0.12,
            sy: 0.08,
            sz: 0.2,
            tint: [0.85, 0.85, 0.82],
          });
      }
    b.col(-14, 0, 70.2, -13.1, 2.7, 77.8, {});
    for (let k = 0; k < 3; k++)
      b.box("fabric", -12.6, 0, 76.9 - k * 0.6, 0.5, 0.5, 0.4, {
        tint: [0.75, 0.66, 0.48],
        yaw: r() * 0.4,
      }); // seed sacks
    b.plate(
      "art",
      -12.6,
      0.3,
      76.69,
      0,
      -1,
      0.4,
      0.12,
      K.signCell("ny_seed", "HEMP SEED", 128, 40, {
        bg: "#d8c8a0",
        fg: "#4a3020",
      }),
    );
    // Tesla's writing desk + chair, papers, a bulb held in a stand
    const dy = K.table(b, -9.6, 0, 71.0, 1.8, 0.8, { mat: "mahogany" });
    K.chair(b, -9.6, 0, 72.0, 0, {
      mat: "mahogany",
      seatMat: "velvet",
      seatTint: [0.4, 0.15, 0.12],
    });
    for (let k = 0; k < 7; k++)
      b.hplate(
        "flat",
        -9.6 + (r() - 0.5) * 1.4,
        dy + 0.004 + k * 0.001,
        71 + (r() - 0.5) * 0.5,
        0.21,
        0.29,
        r() * 0.8,
        null,
        { tint: [0.85, 0.82, 0.72] },
      );
    b.cyl("brass", -10.2, dy, 70.7, 0.08, 0.06, 0.25, 8);
    b.geo("lamp", K.sphereGeo(), {
      x: -10.2,
      y: dy + 0.35,
      z: 70.7,
      s: 0.09,
      tint: [0.7, 0.85, 1.0],
    });
    b.light(-10.2, dy + 0.4, 71, [0.6, 0.8, 1.0], 0.8, 4, { box: PB });
    b.glow(-10.2, dy + 0.35, 70.7, [0.4, 0.55, 0.8], 0.7); // the bulb still glows — wirelessly
    K.note(ctx, "ph_ny_note_tesla", -9.2, dy + 0.01, 70.9, {
      name: "Letter in a Spidery Hand",
      title: "A letter, never sent (dated 1942)",
      text: "My dear Kenneth,\n\nYou ask why an old man spends his last dollars on bird seed. You would not understand; the young never do. There is a white one who comes to my window every night. When she is ill I know it before she does. When she flies, the whole room hums like a transformer.\n\nThey call me finished. They say the Tower is scrap and the ray a fantasy. Let them. Everything I have designed is in the notebook, and the notebook is where no bank and no general will find it — behind the clothes a man no longer needs.\n\nIf I am gone when you come, feed her.\n\n— N.T.",
    });
    // portrait, exhibit cases, velvet rope, plaque
    K.framed(b, -6.12, 1.8, 74, -1, 0, 1.0, 1.35, portraitCell(), {
      frame: "gold",
      fw: 0.08,
    });
    b.plate(
      "art",
      -6.1,
      0.85,
      74,
      -1,
      0,
      1.0,
      0.32,
      plaqueCell(
        "ny_plaque",
        "NIKOLA TESLA · 1856–1943\nResided in this suite 1933–1943",
        512,
        160,
      ),
    );
    for (const [x, z] of [
      [-11.5, 76.6],
      [-8, 76.6],
    ]) {
      b.boxMM("wood_dark", x - 0.5, 0, z - 0.4, x + 0.5, 0.9, z + 0.4, {
        tint: [0.45, 0.3, 0.2],
      });
      b.boxMM("glass_clear", x - 0.48, 0.9, z - 0.38, x + 0.48, 1.4, z + 0.38, {
        tint: [0.7, 0.8, 0.8],
      });
      b.geo("glass", K.sphereGeo(), {
        x,
        y: 1.02,
        z,
        s: 0.1,
        tint: [0.8, 0.85, 0.7],
      });
      b.cyl("brass", x, 0.9, z, 0.04, 0.04, 0.08, 6);
      b.col(x - 0.5, 0, z - 0.4, x + 0.5, 1.4, z + 0.4, {});
    }
    b.plate(
      "art",
      -9.75,
      1.2,
      77.2,
      0,
      -1,
      0.9,
      0.22,
      K.signCell("ny_exh1", "ORIGINAL AC MOTOR PATENT BULB", 256, 64, {
        bg: "#e8e0c8",
        fg: "#2a2a2a",
      }),
    );
    b.plate("pics", -13.1, 1.9, 72.2, 1, 0, 0.9, 0.68, schematicCell(0), {});
    b.plate("pics", -9.6, 1.9, 70.12, 0, 1, 1.1, 0.82, schematicCell(1), {});
    K.lamp(b, -10, 2.6, 74.5, "globe", [1, 0.8, 0.55], 0.6, 5.5, {
      ceil: FH,
      size: 0.2,
      lightOpts: { box: PB },
    });
    K.loot(ctx, "safe", -6.6, 0, 71.2, HP, {
      loot: "safe",
      locked: 0,
      lock: PH.LOCKS.ny_exhibit_safe,
      name: "Exhibit Safe",
      items: [
        ["scrip", 120],
        ["ph_ny_pigeon_feather", 1],
        ["focus_pills", 1],
      ],
    });
    // ---- bedroom (x −6..2) ----
    const BR = [-6.1, -0.3, 69.9, 2.1, 3.2, 78.1];
    K.room(
      b,
      ctx,
      Object.assign({ x0: -6, z0: 70, x1: 2, z1: 78 }, wallp, {
        wall: "wallpaper_green",
        wc: [0.6, 0.64, 0.5],
        floor: "wood",
        fc: [0.6, 0.45, 0.32],
      }),
    );
    K.bed(b, 0.6, 0, 75.5, HP, {
      w: 1.0,
      l: 2.0,
      frame: "brass",
      tint: [0.75, 0.72, 0.65],
    });
    b.geo("ceramic", K.sphereGeo(), {
      x: 1.15,
      y: 0.66,
      z: 75.5,
      sx: 0.05,
      sy: 0.01,
      sz: 0.14,
      tint: [0.95, 0.95, 0.95],
    }); // white feather on the pillow
    b.boxMM("mahogany", 1.3, 0, 77, 1.9, 0.6, 77.8, {});
    b.col(1.3, 0, 77, 1.9, 0.6, 77.8, {});
    b.boxMM("ceramic", -5.9, 0.8, 76.4, -5.4, 0.95, 77.6, {
      tint: [0.9, 0.9, 0.86],
    });
    b.col(-5.9, 0, 76.4, -5.4, 0.95, 77.6, {}); // washbasin
    b.plate("glass", -5.88, 1.6, 77, 1, 0, 0.5, 0.7, null, {
      tint: [0.5, 0.52, 0.55],
    });
    // worn half-circle on the floor in front of the wardrobe (Vance's clue)
    b.hplate("decal", -2, 0.013, 71.2, 2.6, 1.4, 0, K.decal("grime", 77), {
      tint: [0.9, 0.85, 0.8],
    });
    K.lamp(b, -2, 2.6, 74, "globe", [1, 0.8, 0.55], 0.55, 5, {
      ceil: FH,
      size: 0.18,
      lightOpts: { box: BR },
    });
    // the secret: a hole knocked through the wall behind the wardrobe (lab side)
    for (let k = 0; k < 8; k++)
      b.box(
        "brick_red",
        -2 + (r() - 0.5) * 1.8,
        0,
        69.6 - r() * 0.8,
        0.25,
        0.12,
        0.12,
        { yaw: r() * 3 },
      );

    // ------------------------------------------------------------------
    // TESLA'S LABORATORY
    // ------------------------------------------------------------------
    const LBX = [
      LAB.x0 - 0.1,
      -0.3,
      LAB.z0 - 0.1,
      LAB.x1 + 0.1,
      LAB.h + 0.2,
      LAB.z1 + 0.1,
    ];
    K.room(b, ctx, {
      x0: LAB.x0,
      z0: LAB.z0,
      x1: LAB.x1,
      z1: LAB.z1,
      y: 0,
      h: LAB.h,
      floor: "concrete",
      fc: [0.55, 0.55, 0.56],
      wall: "brick_brown",
      wc: [0.55, 0.5, 0.46],
      ceil: "metal_dark",
      cc: [0.3, 0.3, 0.32],
      trim: false,
      surface: "concrete",
    });
    // copper ground rings around each coil + rubber mats
    for (const [cx, cz] of COILS) {
      b.cyl("copper", cx, 0.005, cz, 3.2, 3.2, 0.02, 32, {
        tint: [0.8, 0.5, 0.3],
      });
      b.cyl("concrete", cx, 0.01, cz, 3.0, 3.0, 0.02, 32, {
        tint: [0.45, 0.45, 0.46],
      });
      coil(b, cx, cz, r);
      // safety rail (octagon) with a gap facing the centre
      for (let k = 0; k < 8; k++) {
        const a0 = (k / 8) * PI * 2,
          a1 = ((k + 1) / 8) * PI * 2;
        if (k === 3) continue;
        const R2 = 3.6;
        K.railing(
          b,
          cx + Math.cos(a0) * R2,
          cz + Math.sin(a0) * R2,
          cx + Math.cos(a1) * R2,
          cz + Math.sin(a1) * R2,
          0,
          { h: 1.0, mat: "paint_yellow", handMat: "paint_yellow", col: true },
        );
      }
      b.plate(
        "art",
        cx,
        0.7,
        cz + 3.62,
        0,
        1,
        0.8,
        0.5,
        K.signCell("ny_danger", "DANGER\n1,000,000 VOLTS", 256, 160, {
          bg: "#e8c020",
          fg: "#1a1a1a",
          font: "Arial Black, sans-serif",
        }),
      );
      b.light(cx, COIL_TOP, cz, [0.45, 0.6, 1.0], 2.2, 14, { box: LBX });
      b.light(cx, 1.5, cz, [0.4, 0.5, 1.0], 0.8, 6, { box: LBX });
      b.glow(cx, COIL_TOP, cz, [0.35, 0.45, 0.9], 5);
      for (let k = 0; k < 4; k++) {
        const a = k * HP + 0.4,
          gx = cx + Math.cos(a) * 3.4,
          gz = cz + Math.sin(a) * 3.4;
        b.pipe("copper", gx, 0, gz, gx, 2.4, gz, 0.04, 6);
        b.geo("copper", K.sphereGeo(), { x: gx, y: 2.45, z: gz, s: 0.1 });
      }
      b.hplate(
        "decal",
        cx + 1.5,
        0.03,
        cz - 1.2,
        2.2,
        2.2,
        r() * 6,
        K.decal("scorch", (30 + cx) | 0),
      );
    }
    // cables from the dynamos to each coil
    for (const [cx, cz] of COILS) {
      b.pipe(
        "rubber",
        -15.5,
        0.06,
        cz < 50 ? 44 : 58,
        cx - 2.2,
        0.06,
        cz,
        0.07,
        6,
      );
    }
    // dynamos along the west wall
    for (const z of [42, 50, 58, 65]) {
      b.boxMM("metal_dark", -17.8, 0, z - 1.8, -14.2, 0.4, z + 1.8, {
        tint: [0.25, 0.26, 0.24],
      });
      b.geo("paint_green", K.unitCyl(18), {
        x: -16,
        y: 1.6,
        z,
        sx: 1.2,
        sy: 2.8,
        sz: 1.2,
        rz: HP,
        tint: [0.25, 0.35, 0.28],
      });
      b.geo("copper", K.unitCyl(18), {
        x: -16,
        y: 1.6,
        z,
        sx: 1.25,
        sy: 1.2,
        sz: 1.25,
        rz: HP,
        tint: [0.7, 0.45, 0.28],
      });
      b.geo("black_iron", K.unitCyl(20), {
        x: -14.1,
        y: 1.6,
        z,
        sx: 1.0,
        sy: 0.12,
        sz: 1.0,
        rz: HP,
      }); // flywheel
      b.pipe("steel", -17.6, 1.6, z, -13.8, 1.6, z, 0.08, 8);
      b.col(-17.8, 0, z - 1.8, -14, 2.9, z + 1.8, {});
      b.plate(
        "art",
        -14.19,
        0.8,
        z - 1.2,
        1,
        0,
        0.7,
        0.25,
        K.signCell("ny_dyn", "WESTINGHOUSE", 256, 64, {
          bg: "#2a2a20",
          fg: "#d8c890",
        }),
      );
      b.glow(-14.4, 2.8, z + 1.2, [1, 0.3, 0.15], 0.4);
    }
    // bus bars on the ceiling trusses
    for (let z = 38; z <= 68; z += 6)
      b.beam("rust", LAB.x0, LAB.h - 0.6, z, LAB.x1, LAB.h - 0.6, z, 0.3, 0.5, {
        tint: [0.45, 0.35, 0.28],
      });
    for (const x of [-10, 0, 10])
      b.pipe("copper", x, LAB.h - 1.0, LAB.z0, x, LAB.h - 1.0, LAB.z1, 0.06, 6);
    // high clerestory windows (north wall) — night skyline
    for (const x of [-12, -6, 6, 12]) {
      b.plate("paint_black", x, 8.6, LAB.z0 + 0.11, 0, 1, 3, 1.6, null, {
        tint: [0.02, 0.02, 0.02],
      });
      b.plate(
        "neon",
        x,
        8.6,
        LAB.z0 + 0.12,
        0,
        1,
        2.95,
        1.55,
        skylineCell(x & 3),
        { tint: [0.7, 0.7, 0.7] },
      );
    }
    // workbenches (east floor), oscilloscopes, Wardenclyffe model
    for (const z of [62, 66]) {
      const ty = K.table(b, 11.5, 0, z, 3.0, 1.0, {
        mat: "wood",
        tint: [0.6, 0.48, 0.35],
      });
      for (let k = 0; k < 2; k++) {
        const x = 10.6 + k * 1.6;
        b.boxMM(
          "metal_dark",
          x - 0.3,
          ty,
          z - 0.35,
          x + 0.3,
          ty + 0.4,
          z + 0.1,
          { tint: [0.3, 0.3, 0.28] },
        );
        b.plate("lamp", x, ty + 0.22, z - 0.36, 0, -1, 0.4, 0.26, null, {
          tint: [0.2, 0.9, 0.4],
        });
        b.glow(x, ty + 0.22, z - 0.5, [0.1, 0.6, 0.25], 0.4);
      }
      for (let k = 0; k < 5; k++)
        b.hplate(
          "flat",
          11.5 + (r() - 0.5) * 2.4,
          ty + 0.003 + k * 0.001,
          z + 0.2 + (r() - 0.5) * 0.3,
          0.21,
          0.29,
          r(),
          null,
          { tint: [0.85, 0.82, 0.72] },
        );
      b.light(11.5, ty + 1.2, z - 0.4, [0.3, 0.9, 0.5], 0.4, 3.5, { box: LBX });
    }
    // Wardenclyffe tower model on a plinth (NW)
    {
      const mx = -9.5,
        mz = 38.5;
      b.boxMM("wood_dark", mx - 1.2, 0, mz - 1.2, mx + 1.2, 0.9, mz + 1.2, {
        tint: [0.45, 0.3, 0.2],
      });
      b.col(mx - 1.2, 0, mz - 1.2, mx + 1.2, 0.9, mz + 1.2, {});
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * PI * 2;
        b.beam(
          "wood",
          mx + Math.cos(a) * 0.9,
          0.9,
          mz + Math.sin(a) * 0.9,
          mx + Math.cos(a) * 0.3,
          2.9,
          mz + Math.sin(a) * 0.3,
          0.04,
          0.04,
          { tint: [0.7, 0.55, 0.35] },
        );
      }
      for (const y of [1.4, 1.9, 2.4])
        b.cyl(
          "wood",
          mx,
          y,
          mz,
          0.9 - (y - 0.9) * 0.3,
          0.9 - (y - 0.9) * 0.3,
          0.03,
          8,
          { top: false, tint: [0.7, 0.55, 0.35] },
        );
      b.geo("copper", K.sphereGeo(), {
        x: mx,
        y: 3.05,
        z: mz,
        sx: 0.8,
        sy: 0.35,
        sz: 0.8,
        tint: [0.75, 0.5, 0.3],
      });
      b.plate(
        "art",
        mx,
        0.6,
        mz + 1.22,
        0,
        1,
        1.4,
        0.3,
        plaqueCell("ny_wardenclyffe", "WARDENCLYFFE — 1:40", 384, 80),
      );
    }
    // blueprint wall (south)
    for (let k = 0; k < 6; k++)
      b.plate(
        "pics",
        -14 + k * 2.2,
        2.4 + (k % 2) * 0.3,
        LAB.z1 - 0.12,
        0,
        -1,
        1.7,
        1.25,
        schematicCell(k + 3),
        {},
      );
    b.plate(
      "art",
      6,
      3.8,
      LAB.z1 - 0.12,
      0,
      -1,
      7,
      0.8,
      K.signCell(
        "ny_lab_banner",
        "STANHOPE FOUNDATION — PROJECT TELEFORCE",
        1024,
        96,
        { bg: "#1a2230", fg: "#c8d8f0", font: "Arial, sans-serif" },
      ),
    );
    // CATWALK + stairs + control booth (east side)
    K.stairs(b, 15.6, 58, 17.9, 68.5, 0, CAT_Y, "-z", {
      mat: "metal",
      tint: [0.45, 0.46, 0.44],
      rail: "l",
      railMat: "paint_yellow",
      handMat: "paint_yellow",
      solid: false,
      thick: 0.2,
      surface: "metal",
    });
    b.boxMM("metal", 12.6, CAT_Y - 0.15, 34.2, 17.95, CAT_Y, 58, {
      tint: [0.42, 0.43, 0.42],
      faces: "nsewtb",
    });
    b.col(12.6, CAT_Y - 0.15, 34.2, 17.95, CAT_Y, 58, {
      tag: "floor",
      surface: "metal",
    });
    K.railing(b, 12.6, 44, 12.6, 58, CAT_Y, {
      h: 1.05,
      mat: "paint_yellow",
      handMat: "paint_yellow",
    });
    K.railing(b, 12.6, 58, 15.5, 58, CAT_Y, {
      h: 1.05,
      mat: "paint_yellow",
      handMat: "paint_yellow",
    });
    for (let z = 36; z <= 56; z += 5)
      b.pipe("rust", 12.7, 0, z, 12.7, CAT_Y - 0.15, z, 0.07, 6);
    // booth: glass-fronted room on the catwalk (x 12.6..18, z 34..44)
    const BO = [12.5, CAT_Y - 0.2, 34, 18.1, CAT_Y + 3.2, 44.2];
    b.boxMM("metal_dark", 12.6, CAT_Y, 34.2, 12.75, CAT_Y + 0.9, 44, {
      tint: [0.3, 0.32, 0.3],
    });
    b.boxMM("glass_clear", 12.62, CAT_Y + 0.9, 34.2, 12.68, CAT_Y + 2.6, 44, {
      tint: [0.6, 0.75, 0.8],
    });
    b.boxMM("metal_dark", 12.6, CAT_Y + 2.6, 34.2, 18, CAT_Y + 2.9, 44, {
      tint: [0.3, 0.32, 0.3],
      faces: "nsewtb",
    });
    b.boxMM("metal_dark", 12.6, CAT_Y, 43.9, 16.2, CAT_Y + 2.6, 44.05, {
      tint: [0.3, 0.32, 0.3],
    });
    b.col(12.55, CAT_Y, 34.2, 12.8, CAT_Y + 2.6, 44, { tag: "wall" });
    b.col(12.6, CAT_Y, 43.9, 16.2, CAT_Y + 2.6, 44.05, { tag: "wall" });
    const cty = K.table(b, 15.2, CAT_Y, 35.2, 4.2, 1.0, {
      mat: "metal",
      tint: [0.4, 0.42, 0.4],
    });
    for (let k = 0; k < 5; k++) {
      b.plate("lamp", 13.6 + k * 0.8, cty + 0.5, 34.35, 0, 1, 0.6, 0.4, null, {
        tint: k === 2 ? [0.4, 0.6, 1.0] : [0.2, 0.8, 0.35],
      });
    }
    b.boxMM("metal_dark", 13.2, cty, 34.25, 17.4, cty + 0.9, 34.4, {
      tint: [0.25, 0.27, 0.25],
    });
    b.light(15.2, cty + 1.0, 36, [0.3, 0.9, 0.5], 0.9, 5, { box: BO });
    b.glow(15.2, cty + 0.5, 34.6, [0.15, 0.6, 0.3], 1.4);
    K.terminal(ctx, "ph_ny_term_lab", 14.4, cty, 35.4, PI, termLab(), "bare");
    K.anchor(ctx, "notebook", 16.4, cty + 0.02, 35.6);
    K.anchor(ctx, "booth", 15.2, CAT_Y, 38.5);
    K.chair(b, 14.4, CAT_Y, 36.4, 0, { mat: "metal" });
    K.skel(ctx, 16.8, CAT_Y, 38, 2.2, "lying");
    K.note(ctx, "ph_ny_reel_stanhope", 17.0, CAT_Y + 0.02, 38.8, {
      type: "tape",
      name: "Tape reel: Dr. Stanhope, Final Log",
      title: "Dr. Marguerite Stanhope — Project Teleforce, log 211",
      text: "March fifth. The sirens started at 9:41. The coils are at full charge — I had the whole 33rd floor humming for tonight's demonstration. The Army liaison never arrived. Nobody is coming to see the ray.\n\nFor the record, since there will be no other record: Nikola was right. The Teleforce works. It works beautifully. I have spent eleven years proving that a dead man was right, in a hotel room, feeding his pigeons.\n\nI've set the security robots to guard the floor until the Foundation sends someone with the discharge code. The code is on the booth terminal. The notebook stays on my desk, where it belongs.\n\nIf you are not from the Foundation: please don't touch the coils. Please feed the birds. And please — please tell someone he was right.",
    });
    // FARADAY CAGE with the TELEFORCE pedestal (north centre)
    {
      const { x0, x1, z0, z1 } = CAGE;
      for (let x = x0; x <= x1 + 0.01; x += 0.3)
        if (Math.abs(x) > 1.0)
          b.pipe("steel", x, 0, z1, x, 3.6, z1, 0.02, 4, {
            tint: [0.6, 0.62, 0.64],
          });
      for (let z = z0; z <= z1; z += 0.3) {
        b.pipe("steel", x0, 0, z, x0, 3.6, z, 0.02, 4, {
          tint: [0.6, 0.62, 0.64],
        });
        b.pipe("steel", x1, 0, z, x1, 3.6, z, 0.02, 4, {
          tint: [0.6, 0.62, 0.64],
        });
      }
      for (const y of [0.05, 1.2, 2.4, 3.6]) {
        b.beam("steel", x0, y, z1, -1.0, y, z1, 0.05, 0.05);
        b.beam("steel", 1.0, y, z1, x1, y, z1, 0.05, 0.05);
        b.beam("steel", x0, y, z0, x0, y, z1, 0.05, 0.05);
        b.beam("steel", x1, y, z0, x1, y, z1, 0.05, 0.05);
      }
      b.boxMM("steel", x0, 3.6, z0, x1, 3.7, z1, { tint: [0.55, 0.57, 0.6] });
      b.col(x0 - 0.05, 0, z1 - 0.05, -1.0, 3.7, z1 + 0.05, { walkable: false });
      b.col(1.0, 0, z1 - 0.05, x1 + 0.05, 3.7, z1 + 0.05, { walkable: false });
      b.col(x0 - 0.05, 0, z0, x0 + 0.05, 3.7, z1, { walkable: false });
      b.col(x1 - 0.05, 0, z0, x1 + 0.05, 3.7, z1, { walkable: false });
      // pedestal
      b.cyl("marble", 0, 0, 36.6, 0.45, 0.35, 1.05, 12, {
        tint: [0.85, 0.82, 0.78],
      });
      b.cyl("brass", 0, 1.05, 36.6, 0.55, 0.55, 0.06, 14);
      b.col(-0.4, 0, 36.2, 0.4, 1.1, 37.0, {});
      b.light(0, 2.6, 37.5, [0.5, 0.7, 1.0], 1.2, 5, {
        box: [x0, -0.3, z0, x1, 3.8, z1],
      });
      b.glow(0, 1.5, 36.6, [0.3, 0.45, 0.9], 1.6);
      // the white pigeon in her gilded cage, beside the Teleforce
      b.cyl("gold", 2.6, 0, 36.2, 0.2, 0.2, 1.2, 8, { tint: [0.8, 0.65, 0.3] });
      b.cyl("gold", 2.6, 1.2, 36.2, 0.3, 0.3, 0.04, 12);
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * PI * 2;
        b.pipe(
          "gold",
          2.6 + Math.cos(a) * 0.3,
          1.2,
          36.2 + Math.sin(a) * 0.3,
          2.6 + Math.cos(a) * 0.1,
          1.85,
          36.2 + Math.sin(a) * 0.1,
          0.006,
          3,
          { tint: [0.8, 0.65, 0.3] },
        );
      }
      b.geo("ceramic", K.sphereGeo(), {
        x: 2.6,
        y: 1.34,
        z: 36.2,
        sx: 0.1,
        sy: 0.08,
        sz: 0.16,
        tint: [0.97, 0.97, 0.95],
      });
      b.geo("ceramic", K.sphereGeo(), {
        x: 2.6,
        y: 1.43,
        z: 36.08,
        s: 0.05,
        tint: [0.97, 0.97, 0.95],
      });
      b.plate(
        "art",
        0,
        0.55,
        37.06,
        0,
        1,
        0.7,
        0.2,
        plaqueCell("ny_ped", "TELEFORCE — PROTOTYPE 7", 384, 80),
      );
      K.anchor(ctx, "teleforce", 0, 1.12, 36.6);
      K.anchor(ctx, "boss", 0, 0, 52);
    }
    // freight elevator (NW corner): steel gate on the west wall
    b.boxMM("metal_dark", LAB.x0 + 0.05, 0, 35.2, LAB.x0 + 0.15, 3.2, 38.8, {
      tint: [0.4, 0.4, 0.38],
    });
    for (let k = 0; k < 11; k++)
      b.boxMM(
        "metal",
        LAB.x0 + 0.16,
        0.1,
        35.3 + k * 0.33,
        LAB.x0 + 0.2,
        3.1,
        35.36 + k * 0.33,
        { tint: [0.5, 0.5, 0.46] },
      );
    b.plate(
      "art",
      LAB.x0 + 0.22,
      3.6,
      37,
      1,
      0,
      1.8,
      0.35,
      K.signCell("ny_freight2", "FREIGHT — LOBBY", 384, 64, {
        bg: "#2a2a20",
        fg: "#e0d080",
        font: "Arial, sans-serif",
      }),
    );
    b.glow(LAB.x0 + 0.4, 3.1, 38.8, [0.2, 0.9, 0.3], 0.5);
    // shelves & crates under the catwalk
    K.shelf(b, 17.6, 0, 40, -HP, 4, {
      mat: "metal",
      items: ["box", "jar", "can"],
      seed: 81,
    });
    K.loot(ctx, "ammo_box", 16.8, 0, 46, HP, {
      loot: "ammo_box",
      name: "Rocket Crate",
      items: [
        ["ammo_gyrojet", 30],
        ["ammo_dry_cell", 4],
      ],
    });
    K.loot(ctx, "first_aid", 17.9, 1.3, 50, HP, { loot: "first_aid" });
    K.loot(ctx, "file_cabinet", -17.5, 0, 36, -HP, {
      loot: "file_cabinet",
      name: "Foundation Files",
    });
    K.loot(ctx, "toolbox", 9.5, 0, 68.8, 0, { loot: "toolbox" });
    // burnt scientist near coil 3 + lab lighting
    K.skel(ctx, 3.8, 0, 49.8, 0.9, "reaching");
    b.hplate("decal", 3.6, 0.03, 49.6, 2.4, 2.4, 0, K.decal("scorch", 44));
    for (const [x, z] of [
      [-10, 66],
      [10, 40],
      [-4, 64],
    ])
      K.lamp(b, x, 6.5, z, "pendant", [1, 0.8, 0.55], 0.7, 9, {
        ceil: LAB.h,
        shade: "paint_green",
        lightOpts: { box: LBX },
      });
    b.light(0, 5, 52, [0.3, 0.35, 0.6], 0.6, 20, { box: LBX });
    K.litter(b, -16, 36, 16, 69, 0, 30, 101);

    // ------------------------------------------------------------------
    // DOORS & ANCHORS
    // ------------------------------------------------------------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const W = (x, y, z) => new THREE.Vector3(OX + x, OY + y, OZ + z);
    const disc = () => K.safe("disc", () => G.discover("hotel_new_yorker"));
    K.door(ctx, {
      id: "ph_ny_in",
      pos: new THREE.Vector3(NY.X1 + 1.2, 1.3, NY.DOOR_Z),
      label: "Hotel New Yorker",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.8, yaw: 0 },
      onEnter: disc,
    });
    K.door(ctx, {
      id: "ph_ny_out",
      pos: W(0, 1.3, -0.4),
      label: "8th Avenue",
      verb: "Leave",
      target: { x: NY.X1 + 3.2, y: 0, z: NY.DOOR_Z, yaw: -HP },
    });
    // elevator car 3 ⇄ 33rd floor (locked until power is restored or the key is used)
    ctx.elevDoor = K.door(ctx, {
      id: "ph_ny_elev_up",
      pos: W(15.6, 1.3, -10),
      label: "Elevator Car 3 — 33rd Floor",
      verb: "Ride",
      lock: PH.lockReg(PH.LOCKS.ny_elev),
      sound: "door_open",
      target: { x: OX, y: OY, z: OZ + 88.6, yaw: 0 },
      onEnter: () => PH.nyOnFloor33(),
    });
    K.door(ctx, {
      id: "ph_ny_elev_down",
      pos: W(-1.6, 1.3, 89.6),
      label: "Elevator Car 3 — Lobby",
      verb: "Ride",
      target: { x: OX + 14.2, y: OY, z: OZ - 10, yaw: HP },
    });
    // emergency stairs (ballroom landing ⇄ 33) — the long way up, jammed fire door
    K.door(ctx, {
      id: "ph_ny_stairs_up",
      pos: W(-31.6, MY + 1.3, -48),
      label: "Stair B — 33rd Floor",
      verb: "Climb",
      lock: PH.lockReg(PH.LOCKS.ny_stairs),
      target: { x: OX - 33, y: OY, z: OZ + 80, yaw: -HP },
      onEnter: () => PH.nyOnFloor33(),
    });
    K.door(ctx, {
      id: "ph_ny_stairs_down",
      pos: W(-35.6, 1.3, 83),
      label: "Stair B — Mezzanine",
      verb: "Descend",
      target: { x: OX - 29.5, y: OY + MY, z: OZ - 48, yaw: -HP },
    });
    // freight elevator lab ⇄ lobby staff room (lobby side opens once used from above)
    K.door(ctx, {
      id: "ph_ny_freight_down",
      pos: W(LAB.x0 + 0.5, 1.4, 37),
      label: "Freight Elevator — Lobby",
      verb: "Ride",
      target: { x: OX - 20.5, y: OY, z: OZ - 3, yaw: -HP },
      onEnter: () => {
        PH.setFlag("ny_freight", true);
        if (ctx.freightUp) ctx.freightUp.unbar(true);
      },
    });
    // one-way: the freight car is called from the lab only, until it has been ridden down once (not a lock)
    ctx.freightUp = PH.barDoor(
      K.door(ctx, {
        id: "ph_ny_freight_up",
        pos: W(-21.5, 1.4, -3),
        label: "Freight Elevator — 33",
        verb: "Ride",
        target: { x: OX + LAB.x0 + 2, y: OY, z: OZ + 37, yaw: -HP },
      }),
      {
        lockText: "Called from above only",
        message: "The freight car is parked upstairs. The call button is dead.",
      },
    );

    K.anchor(ctx, "entrance", 0, 0, -1.8);
    K.anchor(ctx, "mezzanine", 0, MY, -22.5);
    K.anchor(ctx, "ballroom", 0, MY, -36);
    K.anchor(ctx, "floor33", 0, 0, 80);
    K.anchor(ctx, "suite", -10, 0, 74);
    K.anchor(ctx, "wardrobe", -2, 0, 71.5);
    K.anchor(ctx, "lab", 0, 0, 60);
    const sp = [
      [24, 0, 80],
      [0, MY, -40],
      [-20, 0, 80],
      [10, MY, -30],
      [21, MY, -33],
      [8, 0, -14],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 13.2, 0, -1.3);
    K.anchor(ctx, "loot2", -6.6, 0, 71.2);
    K.anchor(ctx, "loot3", 16.8, 0, 46);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_newyorker_int";
    ctx.labLocal = LAB;
    // dynamic pieces: the wardrobe (slides aside), the cage gate, the arcs
    buildWardrobe(ctx);
    buildCageGate(ctx);
    buildArcs(ctx);
  }

  /** One Tesla coil (static): base, primary spiral, secondary, toroid. */
  function coil(b, cx, cz, r) {
    b.cyl("bakelite", cx, 0, cz, 1.7, 1.6, 0.5, 18, {
      tint: [0.35, 0.22, 0.14],
    });
    b.cyl("black_iron", cx, 0.5, cz, 1.62, 1.62, 0.05, 18);
    for (let k = 0; k < 5; k++)
      b.cyl(
        "copper",
        cx,
        0.56 + k * 0.035,
        cz,
        0.7 + k * 0.18,
        0.7 + k * 0.18,
        0.03,
        20,
        { top: false, tint: [0.85, 0.55, 0.32] },
      );
    const h = COIL_TOP - 0.9;
    for (let k = 0; k < 28; k++)
      b.cyl("copper", cx, 0.6 + (k * h) / 28, cz, 0.42, 0.42, h / 28, 14, {
        top: false,
        tint: k % 2 ? [0.95, 0.62, 0.36] : [0.72, 0.44, 0.24],
      });
    b.cyl("steel", cx, COIL_TOP - 0.3, cz, 0.44, 0.2, 0.3, 12);
    b.geo("steel", new THREE.TorusGeometry(1.25, 0.4, 10, 28), {
      x: cx,
      y: COIL_TOP,
      z: cz,
      rx: HP,
      tint: [0.78, 0.8, 0.84],
    });
    b.col(cx - 1.7, 0, cz - 1.7, cx + 1.7, COIL_TOP + 0.4, cz + 1.7, {});
    void r;
  }

  // ---- the secret wardrobe (separate lit group so it can slide) ----
  function buildWardrobe(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "ny_wardrobe",
      off: { x: 0, y: 0, z: 0 },
      lit: true,
      amb: [0.18, 0.16, 0.14],
      grime: 0.3,
    });
    b.boxMM("mahogany", -0.8, 0, -0.33, 0.8, 2.3, 0.33, {
      tint: [0.5, 0.3, 0.2],
    });
    b.boxMM("mahogany", -0.86, 2.3, -0.38, 0.86, 2.42, 0.38, {
      tint: [0.45, 0.28, 0.18],
    });
    b.boxMM("gold", -0.03, 0.2, 0.33, 0.03, 2.1, 0.35, {
      tint: [0.6, 0.45, 0.25],
    });
    for (const x of [-0.15, 0.15])
      b.cyl("brass", x, 1.15, 0.36, 0.025, 0.025, 0.08, 6);
    b.plate("glass", -0.4, 1.4, 0.34, 0, 1, 0.55, 1.2, null, {
      tint: [0.5, 0.52, 0.55],
    });
    const g = b.finish(null);
    g.position.set(O.x - 2, O.y, O.z + 70.45);
    ctx.intRoot.add(g);
    ctx.dyn.wardrobe = { obj: g, base: g.position.x, open: 0, target: 0 };
    ctx.dyn.wardrobeCol = G.world.addBox(
      O.x - 2.8,
      O.y,
      O.z + 70.1,
      O.x - 1.2,
      O.y + 2.4,
      O.z + 70.8,
      { tag: "ph_wardrobe" },
    );
    ctx.dyn.wardrobeInt = G.world.addInteractable({
      pos: new THREE.Vector3(O.x - 2, O.y + 1.3, O.z + 70.9),
      radius: 1.0,
      label: "Wardrobe",
      priority: 0.5,
      verb: () => (PH.flag("ny_wardrobe") ? "Examine" : "Search"),
      enabled: () => !PH.flag("ny_wardrobe") && ctx.inside,
      onInteract() {
        openWardrobe(ctx, false);
      },
    });
  }
  function openWardrobe(ctx, instant) {
    if (!PH.flag("ny_wardrobe")) {
      PH.setFlag("ny_wardrobe", true);
      K.notify(
        "The back of the wardrobe gives way. There is a room behind it — and it is humming.",
      );
      K.sfx("door_open", ctx.dyn.wardrobe.obj.position, { pitch: 0.6 });
      K.xp(40, "Found Tesla's laboratory");
      PH.nyQuestTo("lab");
    }
    const w = ctx.dyn.wardrobe;
    w.target = 1;
    if (instant) {
      w.open = 1;
      w.obj.position.x = w.base + 1.35;
    }
    if (ctx.dyn.wardrobeCol) {
      G.world.removeCollider(ctx.dyn.wardrobeCol);
      ctx.dyn.wardrobeCol = null;
    }
    const O = ctx.O;
    if (!ctx.dyn.wardrobeCol2)
      ctx.dyn.wardrobeCol2 = G.world.addBox(
        O.x - 1.45,
        O.y,
        O.z + 70.1,
        O.x + 0.15,
        O.y + 2.4,
        O.z + 70.8,
        { tag: "ph_wardrobe" },
      );
  }
  function closeWardrobe(ctx) {
    const w = ctx.dyn.wardrobe;
    if (!w) return;
    w.target = 0;
    w.open = 0;
    w.obj.position.x = w.base;
    const O = ctx.O;
    if (ctx.dyn.wardrobeCol2) {
      G.world.removeCollider(ctx.dyn.wardrobeCol2);
      ctx.dyn.wardrobeCol2 = null;
    }
    if (!ctx.dyn.wardrobeCol)
      ctx.dyn.wardrobeCol = G.world.addBox(
        O.x - 2.8,
        O.y,
        O.z + 70.1,
        O.x - 1.2,
        O.y + 2.4,
        O.z + 70.8,
        { tag: "ph_wardrobe" },
      );
  }
  // ---- the Faraday cage gate ----
  function buildCageGate(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "ny_gate",
      lit: true,
      amb: [0.3, 0.32, 0.4],
      grime: 0.2,
    });
    for (let x = -0.95; x <= 0.96; x += 0.3)
      b.pipe("steel", x, 0, 0, x, 3.6, 0, 0.022, 4, {
        tint: [0.6, 0.62, 0.64],
      });
    for (const y of [0.05, 1.2, 2.4, 3.55])
      b.beam("steel", -1.0, y, 0, 1.0, y, 0, 0.06, 0.06, {
        tint: [0.6, 0.62, 0.64],
      });
    b.plate(
      "art",
      0,
      1.6,
      0.03,
      0,
      1,
      0.8,
      0.4,
      K.signCell("ny_cage_lock", "INTERLOCK — COILS LIVE", 256, 128, {
        bg: "#8a1a10",
        fg: "#f0e0c0",
        font: "Arial Black, sans-serif",
      }),
    );
    const g = b.finish(null);
    g.position.set(O.x, O.y, O.z + CAGE.z1);
    ctx.intRoot.add(g);
    ctx.dyn.gate = { obj: g, open: 0, target: 0 };
    ctx.dyn.gateCol = G.world.addBox(
      O.x - 1.0,
      O.y,
      O.z + CAGE.z1 - 0.06,
      O.x + 1.0,
      O.y + 3.7,
      O.z + CAGE.z1 + 0.06,
      { tag: "ph_gate", walkable: false },
    );
    G.world.addInteractable({
      pos: new THREE.Vector3(O.x, O.y + 1.4, O.z + CAGE.z1 + 0.2),
      radius: 0.9,
      label: "Faraday Cage",
      verb: "Open",
      priority: 0.4,
      enabled: () => ctx.inside && !PH.flag("ny_gate"),
      onInteract() {
        if (!PH.flag("ny_coils_off")) {
          const sci = K.skill("electronics");
          if (sci >= 70) {
            K.notify(
              "[Electronics 70] You bridge the interlock with a length of copper wire.",
            );
            setCoilsOff(ctx, true);
            openGate(ctx);
            return;
          }
          K.sfx("door_locked");
          K.notify(
            "The cage interlock won't release while the coils are live. (Control booth, or Electronics 70)",
          );
          return;
        }
        openGate(ctx);
      },
    });
  }
  function openGate(ctx) {
    PH.setFlag("ny_gate", true);
    ctx.dyn.gate.target = 1;
    if (ctx.dyn.gateCol) {
      G.world.removeCollider(ctx.dyn.gateCol);
      ctx.dyn.gateCol = null;
    }
    K.sfx("door_open", ctx.dyn.gate.obj.position, { pitch: 0.8 });
  }
  function closeGate(ctx) {
    const O = ctx.O;
    if (!ctx.dyn.gate) return;
    ctx.dyn.gate.target = 0;
    ctx.dyn.gate.open = 0;
    ctx.dyn.gate.obj.position.y = O.y;
    if (!ctx.dyn.gateCol)
      ctx.dyn.gateCol = G.world.addBox(
        O.x - 1.0,
        O.y,
        O.z + CAGE.z1 - 0.06,
        O.x + 1.0,
        O.y + 3.7,
        O.z + CAGE.z1 + 0.06,
        { tag: "ph_gate", walkable: false },
      );
  }

  // ==================================================================
  // TESLA ARCS (dynamic: two instanced meshes, core + halo)
  // ==================================================================
  const NB = 9,
    NS = 8; // bolts × segments
  function buildArcs(ctx) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mCore = new THREE.MeshBasicMaterial({
      color: 0xd8ecff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    });
    const mHalo = new THREE.MeshBasicMaterial({
      color: 0x4a6cff,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    });
    const core = new THREE.InstancedMesh(geo, mCore, NB * NS),
      halo = new THREE.InstancedMesh(geo, mHalo, NB * NS);
    core.frustumCulled = false;
    halo.frustumCulled = false;
    core.renderOrder = 4;
    halo.renderOrder = 4;
    core.name = "ph_arcs";
    halo.name = "ph_arcs_halo";
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < NB * NS; i++) {
      core.setMatrixAt(i, zero);
      halo.setMatrixAt(i, zero);
    }
    ctx.intRoot.add(core);
    ctx.intRoot.add(halo);
    ctx.arcs = { core, halo, bolts: [], t: 0, flashT: 1, crackT: 0.5, zapT: 0 };
    for (let i = 0; i < NB; i++) ctx.arcs.bolts.push({ life: 0, pts: null });
  }
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _s = new THREE.Vector3(),
    _p = new THREE.Vector3(),
    _d = new THREE.Vector3(),
    _up = new THREE.Vector3(0, 1, 0);
  function makeBolt(a, bpt, jag) {
    // midpoint displacement → NS+1 points
    const pts = [a.clone()];
    for (let i = 1; i < NS; i++) {
      const t = i / NS,
        p = a.clone().lerp(bpt, t);
      const amp = jag * Math.sin(t * PI);
      p.x += (Math.random() - 0.5) * amp;
      p.y += (Math.random() - 0.5) * amp * 0.8;
      p.z += (Math.random() - 0.5) * amp;
      pts.push(p);
    }
    pts.push(bpt.clone());
    return pts;
  }
  function writeBolt(ctx, i, pts, fade) {
    const A = ctx.arcs;
    for (let s = 0; s < NS; s++) {
      const idx = i * NS + s;
      if (!pts) {
        _m.makeScale(0, 0, 0);
        A.core.setMatrixAt(idx, _m);
        A.halo.setMatrixAt(idx, _m);
        continue;
      }
      const a = pts[s],
        c = pts[s + 1];
      _d.subVectors(c, a);
      const len = _d.length();
      if (len < 1e-4) continue;
      _d.divideScalar(len);
      _q.setFromUnitVectors(_up, _d);
      _p.addVectors(a, c).multiplyScalar(0.5);
      _s.set(0.045 * fade, len, 0.045 * fade);
      _m.compose(_p, _q, _s);
      A.core.setMatrixAt(idx, _m);
      _s.set(0.3 * fade, len, 0.3 * fade);
      _m.compose(_p, _q, _s);
      A.halo.setMatrixAt(idx, _m);
    }
  }
  function coilsLive() {
    return !PH.flag("ny_coils_off");
  }
  function updateArcs(ctx, dt) {
    const A = ctx.arcs;
    if (!A) return;
    const P = G.player && G.player.pos;
    if (!P) return;
    const O = ctx.O;
    const lx = P.x - O.x,
      lz = P.z - O.z;
    const inLab =
      ctx.inside &&
      lz > LAB.z0 - 6 &&
      lz < LAB.z1 + 10 &&
      lx > LAB.x0 - 4 &&
      lx < LAB.x1 + 4;
    const live = coilsLive();
    A.core.visible = A.halo.visible = inLab && live;
    // ambient hum
    if (inLab && live) {
      if (!A.hum)
        A.hum = K.sfx(
          "hum_electric",
          new THREE.Vector3(O.x, O.y + 4, O.z + 52),
          { loop: true, volume: 0.8 },
        );
    } else if (A.hum) {
      K.safe("hum", () => A.hum.stop && A.hum.stop());
      A.hum = null;
    }
    if (!inLab || !live) return;
    const tops = COILS.map(
      ([cx, cz]) => new THREE.Vector3(O.x + cx, O.y + COIL_TOP, O.z + cz),
    );
    for (let i = 0; i < NB; i++) {
      const bo = A.bolts[i];
      bo.life -= dt;
      if (bo.life <= 0) {
        if (Math.random() < 0.55) {
          const ci = i % 3,
            top = tops[ci];
          const ang = Math.random() * PI * 2;
          const a = new THREE.Vector3(
            top.x + Math.cos(ang) * 1.3,
            top.y + (Math.random() - 0.5) * 0.3,
            top.z + Math.sin(ang) * 1.3,
          );
          let target,
            jag = 1.2;
          const k = Math.random();
          const pd = Math.hypot(
            P.x - (O.x + COILS[ci][0]),
            P.z - (O.z + COILS[ci][1]),
          );
          if (pd < 5.5 && Math.random() < 0.45) {
            target = new THREE.Vector3(P.x, P.y + 1.2, P.z);
            jag = 0.9;
            zapPlayer(ctx, pd);
          } else if (k < 0.3) {
            const o = tops[(ci + 1 + (Math.random() < 0.5 ? 1 : 0)) % 3];
            target = o
              .clone()
              .add(
                new THREE.Vector3(
                  (Math.random() - 0.5) * 1.5,
                  0,
                  (Math.random() - 0.5) * 1.5,
                ),
              );
            jag = 2.0;
          } else if (k < 0.65) {
            const g = ang + (Math.random() - 0.5) * 0.8;
            target = new THREE.Vector3(
              O.x + COILS[ci][0] + Math.cos(g) * 3.4,
              O.y + 2.45,
              O.z + COILS[ci][1] + Math.sin(g) * 3.4,
            );
            jag = 0.9;
          } else {
            target = a
              .clone()
              .add(
                new THREE.Vector3(
                  Math.cos(ang) * (1 + Math.random() * 2),
                  (Math.random() - 0.3) * 2.2,
                  Math.sin(ang) * (1 + Math.random() * 2),
                ),
              );
            jag = 0.8;
          }
          bo.pts = makeBolt(a, target, jag);
          bo.life = 0.05 + Math.random() * 0.12;
          bo.max = bo.life;
          if (Math.random() < 0.06)
            K.safe("sparks", () => {
              if (!G.isStub("fx") && G.fx.sparks) G.fx.sparks(target);
            });
        } else {
          bo.pts = null;
          bo.life = 0.04 + Math.random() * 0.15;
          bo.max = bo.life;
        }
      }
      writeBolt(
        ctx,
        i,
        bo.pts,
        bo.pts ? 0.6 + 0.4 * (bo.life / (bo.max || 1)) : 1,
      );
    }
    A.core.instanceMatrix.needsUpdate = true;
    A.halo.instanceMatrix.needsUpdate = true;
    A.flashT -= dt;
    A.crackT -= dt;
    if (A.flashT <= 0) {
      A.flashT = 0.35 + Math.random() * 0.9;
      const t = tops[(Math.random() * 3) | 0];
      K.safe("flash", () => {
        if (!G.isStub("fx") && G.fx.flash) G.fx.flash(t, 0x8aa8ff, 2.2, 0.09);
      });
    }
    if (A.crackT <= 0) {
      A.crackT = 0.25 + Math.random() * 0.6;
      K.sfx("laser_impact", tops[(Math.random() * 3) | 0], {
        volume: 0.35,
        pitch: 0.6 + Math.random() * 0.6,
      });
    }
  }
  function zapPlayer(ctx, dist) {
    const A = ctx.arcs;
    if (A.zapT > 0 || !G.player || !G.player.alive) return;
    A.zapT = 0.6;
    const dmg = Math.round(6 + (5.5 - dist) * 3);
    K.safe("zap", () => {
      G.player.damage(dmg, { type: "energy", source: "tesla_coil" });
      if (G.player.shake) G.player.shake(0.4, 0.25);
    });
    K.sfx("hurt_player", null, { volume: 0.6 });
  }
  function setCoilsOff(ctx, silent) {
    if (PH.flag("ny_coils_off")) return;
    PH.setFlag("ny_coils_off", true);
    if (!silent)
      K.notify(
        "Discharge sequence complete. The coils wind down with a long, dying whine.",
      );
    K.sfx("terminal_success");
    K.xp(75, "Shut down the Teleforce coils");
    PH.nyQuestTo("notebook");
  }

  // ==================================================================
  // TERMINALS
  // ==================================================================
  function termDesk() {
    return {
      title: "HOTEL NEW YORKER — FRONT DESK",
      header:
        'MERIDIAN TELELINK · HOSPITALITY SUITE 4.1\n"2,500 ROOMS — A RADIO IN EVERY ROOM"',
      lock: PH.LOCKS.ny_term_desk,
      entries: [
        {
          title: "Guest Register — Floor 33",
          text: "3321  Mr. & Mrs. Delacroix (honeymoon)\n3322  Mr. V. Obi — NOTE: registered 2 days AFTER the bombs? (system error)\n3324  Mr. H. Voorhees — complaint on file (pigeons, static, radio)\n3325  VACANT — pigeons\n3327  ** THE TESLA SUITE ** — EXHIBIT. Not for let. Maintained by the Stanhope Foundation. Staff access prohibited.\n3329–3335  Stanhope Foundation (long-term block booking, paid through 1989)",
        },
        {
          title: "Memo: The Tesla Suite",
          text: 'From the General Manager:\n\nThe Stanhope Foundation has again asked that the 33rd floor be "left alone." They pay for eleven rooms they never sleep in. They bring their own robots. They reinforce our floors. They drain enough current each evening at nine to dim the Times Square signs.\n\nThey also pay in cash. Leave them alone.',
        },
        {
          title: "Memo: Shamrock Ball",
          text: 'Grand Ballroom, Sunday, March 5th, 8 PM till dawn (St. Patrick\'s week starts early at the New Yorker). The Stanhope Foundation has "requested" that the ballroom lights be kept low from 9 PM, when they will be "running a demonstration" upstairs. Tell the band to play louder.',
        },
        {
          title: "Elevator Service — Car 3",
          cond: () => !PH.flag("ny_elev"),
          text: "CAR 3 (express to 33): LOCKED OUT — Foundation request.\nMaintenance override available.",
          action: () => restoreElevator(),
        },
        {
          title: "Elevator Service — Car 3",
          cond: () => !!PH.flag("ny_elev"),
          text: "CAR 3: IN SERVICE. Express to floor 33. Please mind the pigeons.",
        },
      ],
    };
  }
  function restoreElevator() {
    if (PH.flag("ny_elev")) return;
    PH.setFlag("ny_elev", true);
    PH.safe("unlock", () => {
      if (PH.locksLive()) G.locks.unlock(PH.LOCKS.ny_elev.id);
    });
    K.notify("Elevator car 3 grinds back to life.");
    K.sfx("terminal_success");
  }
  function termSecurity() {
    return {
      title: "MERIDIAN SECURITY — FLOOR 33",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK PROTOCOL\nSECURITY DETAIL: STANHOPE FOUNDATION",
      lock: PH.LOCKS.ny_term_security,
      entries: [
        {
          title: "Access Codes",
          learn: ["ph_ny_sec_locker", "ph_ny_term_lab"],
          text: "SECURITY LOCKER (spare car-3 key): 7-6-3-3.\nCOIL ROOM TELETYPE: password SMILJAN (the founder's birthplace — Dr. Stanhope is sentimental).",
        },
        {
          title: "Standing Orders",
          text: 'PRIORITY 1: Guard floor 33. No entry to the Tesla Suite without Foundation credentials.\nPRIORITY 2: Maintain coil room security until the discharge code is entered.\nPRIORITY 3: Feed the birds at 21:00. (Order issued by Dr. Stanhope. Rationale: "sentiment." Complied.)',
        },
        {
          title: "Unit Log",
          text: 'UNIT 7 (Sentry): 76,511 patrol loops completed. 1 intruder neutralised (room 3322). Birds fed: 0 (supply exhausted 1969).\nUNIT 9 (Valet-M): requests permission to "go outside and shoot something." DENIED.',
        },
        {
          title: "Set Security Detail to PASSIVE",
          cond: () => !PH.flag("ny_bots_passive"),
          text: "Credential override accepted. All floor-33 units stand down.",
          action: () => pacifyRobots(),
        },
      ],
    };
  }
  function pacifyRobots() {
    PH.setFlag("ny_bots_passive", true);
    const ctx = PH.nyCtx;
    if (!ctx || G.isStub("actors") || !G.actors.list) return;
    let n = 0;
    K.safe("pacify", () => {
      for (const a of G.actors.list()) {
        if (!a || a.dead) continue;
        if (
          Math.abs(a.pos.x - ctx.O.x) > 150 ||
          Math.abs(a.pos.z - ctx.O.z) > 150
        )
          continue;
        const info =
          !G.isStub("chars") && G.chars.info ? G.chars.info(a.type) : null;
        if ((info && info.isRobot) || a.faction === "robots") {
          if (a.setHostile) a.setHostile(false);
          n++;
        }
      }
    });
    K.notify(
      n
        ? "The hotel's security robots power down to PASSIVE."
        : "Security detail set to PASSIVE.",
    );
    K.xp(50, "Robot security overridden");
  }
  function termLab() {
    return {
      title: "PROJECT TELEFORCE — CONTROL",
      header:
        "STANHOPE FOUNDATION · MAGNIFYING TRANSMITTER CONTROL\nCOIL BANK: 3 × 1.1 MV   STATUS: " +
        "▮▮▮ CHARGED",
      lock: PH.LOCKS.ny_term_lab,
      entries: [
        {
          title: "Exhibit Safe",
          learn: "ph_ny_exhibit_safe",
          text: "The exhibit safe holds the founder's papers and the feather. Combination: his birthday, 0-7-1-0.",
        },
        {
          title: "Log: Year One",
          text: 'The notebook is real. Everything the old man claimed — resonant transmission, the charged-particle "Teleforce" beam — is in it, in a hand so small I need a loupe. He hid it behind his own clothes. The hotel thinks we run a museum.',
        },
        {
          title: "Log: Year Nine",
          text: "Prototype 7 fires. A beam of charged tungsten particles that drops a target like a pole-axed steer and leaves the air smelling of thunder. The Army wants a demonstration. I want to publish. We compromise: they fund, I stay silent.",
        },
        {
          title: "Log: The Pigeons",
          text: "A white pigeon has started coming to the lab window. The robots have been instructed to feed her. I am aware of the irony. I have decided not to be embarrassed by it.",
        },
        {
          title: "Discharge Coils (Safe Mode)",
          cond: () => !PH.flag("ny_coils_off"),
          text: "DISCHARGE SEQUENCE INITIATED.\nBleeding 3.3 MV to ground... Interlock released: FARADAY ENCLOSURE.",
          action: () => {
            const c = PH.nyCtx;
            if (c) setCoilsOff(c);
          },
        },
        {
          title: "Coil Status",
          cond: () => !!PH.flag("ny_coils_off"),
          text: "COIL BANK DISCHARGED. Enclosure interlock: RELEASED.",
        },
      ],
    };
  }

  // ==================================================================
  // DATA (items, quest) — initDone
  // ==================================================================
  function data(ctx) {
    K.defineItem({
      id: "ph_ny_elev_key",
      type: "key",
      name: "Bell Captain's Elevator Key",
      weight: 0,
      value: 0,
      desc: 'A brass key on a red tassel, stamped "CAR 3 — EXPRESS". The tassel smells of pigeon.',
    });
    K.defineItem({
      id: "ph_ny_q_notebook",
      type: "misc",
      name: "Tesla's Last Notebook",
      weight: 0.5,
      value: 0,
      quest: true,
      desc: "Oilcloth cover, rubber band, two hundred pages of microscopic handwriting: resonance, wireless power, the Teleforce. A single white feather pressed between the last pages.",
    });
    K.defineItem({
      id: "ph_ny_pigeon_feather",
      type: "misc",
      name: "White Pigeon Feather",
      weight: 0,
      value: 5,
      desc: "Snow white. It crackles faintly with static when you hold it.",
    });
    // unique gyrojet, cloned from the gyrojet carbine
    K.safe("teleforce", () => {
      if (G.isStub("items") || !G.items.get || K.itemExists("ph_ny_teleforce"))
        return;
      const base = G.items.get("gyrojet_carbine");
      const w =
        base && base.weapon
          ? JSON.parse(
              JSON.stringify(base.weapon, (k, v) =>
                typeof v === "function" ? undefined : v,
              ),
            )
          : {
              skill: "firearms",
              rof: 2.0,
              magSize: 10,
              ammo: "ammo_gyrojet",
              reloadTime: 2.6,
              spread: 0.014,
              adsSpread: 0.0025,
              range: 300,
              sound: "gun_missile",
              viewmodel: "gyrojet_carbine",
              damageType: "ballistic",
              reloadType: "mag",
              flash: "gyro",
              customProj: "gyro",
              projectileSpeed: 300,
            };
      Object.assign(w, {
        damage: 48,
        rof: 2.0,
        magSize: 12,
        critMult: 2.5,
        critChance: 2,
        gyro: { min: 1, full: 1, over: 0.1 },
        sfxPitch: 0.7,
        condDecay: 0.0008,
      });
      G.items.define({
        id: "ph_ny_teleforce",
        type: "weapon",
        name: "Teleforce",
        weight: 9,
        value: 3500,
        unique: true,
        desc: "Prototype 7 of a projectile gun Nikola Tesla sketched in 1934, finished thirty-three years later in a hotel room on 34th Street around a gyrojet carbine. A coil in the barrel throws each rocket out already at full speed: no weak first metres. Smells like a thunderstorm.",
        weapon: w,
      });
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph_room_3327",
        name: "The Pigeon Man of Room 3327",
        giver: "Archibald Pembroke",
        location: "Hotel New Yorker",
        desc: 'Archibald Pembroke, who was a bellhop at the Hotel New Yorker on the day the bombs fell, swears the "gentleman in 3327" kept working long after he died — and that the Stanhope Foundation hid something on the 33rd floor. Robots still guard it.',
        stages: [
          // inside the lobby the marker moves to Car 3, the express to 33 (its key is in the Bell Captain's lockbox; Stair B off the mezzanine is the long way)
          {
            id: "find",
            text: "Reach the 33rd floor of the Hotel New Yorker (8th Avenue & 34th Street).",
            markers: [
              () => {
                const c = PH.nyCtx,
                  d = c && c.inside && c.elevDoor,
                  p = d && d.def && d.def.pos;
                return p
                  ? {
                      x: p.x,
                      y: p.y - 1.3,
                      z: p.z,
                      label: "Elevator Car 3 — 33rd Floor",
                    }
                  : nyMarker("entrance", "Hotel New Yorker");
              },
            ],
          },
          {
            id: "suite",
            text: "Search Room 3327, the Tesla Suite.",
            markers: [() => nyMarker("suite", "Room 3327")],
          },
          {
            id: "lab",
            text: "Find the laboratory hidden behind the Tesla Suite.",
            markers: [() => nyMarker("wardrobe", "Wardrobe")],
          },
          {
            id: "coils",
            text: "Shut down the Tesla coils from the control booth.",
            markers: [() => nyMarker("booth", "Control Booth")],
          },
          {
            id: "notebook",
            text: "Take Tesla's last notebook from Dr. Stanhope's desk.",
            markers: [() => nyMarker("notebook", "Tesla's Notebook")],
          },
          {
            id: "tf",
            text: "(Optional) Claim the Teleforce from the Faraday cage.",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.active("ph_room_3327"),
            doneIf: () => !!PH.flag("ny_teleforce"),
          },
          {
            id: "return",
            text: "Bring Tesla's notebook to Pembroke at the Penny & Price Automat.",
            markers: [{ npc: "ph_pembroke", label: "Pembroke" }],
          },
        ],
        rewards: { xp: 400 },
      });
    }
  }
  function nyMarker(name, label) {
    const a = PH.anchor("hotel_new_yorker", name);
    return a ? { x: a.x, y: a.y, z: a.z, label } : null;
  }
  const ORDER = ["find", "suite", "lab", "coils", "notebook", "return"];
  /** Advance the quest forward to `st` (never backwards); start it if needed. */
  PH.nyQuestTo = function (st) {
    const id = "ph_room_3327";
    if (K.q.done(id)) return;
    if (!K.q.active(id)) {
      K.q.start(id, { stage: st });
      if (K.q.active(id) && K.q.stage(id) !== st) K.q.set(id, st);
      return;
    }
    const cur = ORDER.indexOf(K.q.stage(id)),
      nxt = ORDER.indexOf(st);
    if (nxt > cur) K.q.set(id, st);
  };
  PH.nyOnFloor33 = function () {
    PH.setFlag("ny_f33", true);
    if (K.q.active("ph_room_3327")) PH.nyQuestTo("suite");
  };

  // ==================================================================
  // SPAWN (newGame / loaded)
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    applyState(ctx);
    if (!PH.flag("ny_boss_dead")) {
      const boss = PH.spawnActor(ctx, {
        id: "ph_ny_sentinel",
        type: "bulwark",
        name: "Teleforce Sentinel",
        faction: "robots",
        level: 11,
        hostile: true,
        pos: v(A.boss),
        yaw: PI,
        ai: "guard",
        home: "here",
        homeR: 9,
        noRespawn: true,
        hp: 420,
        xp: 260,
        aggroRange: 26,
        inventory: [
          ["ammo_gyrojet", 18],
          ["dry_cell", 2],
          ["relay_board", 1],
        ],
        onDeath: () => {
          PH.setFlag("ny_boss_dead", true);
          K.notify("The Teleforce Sentinel grinds to a halt.");
        },
      });
      if (boss && PH.flag("ny_bots_passive") && boss.setHostile)
        boss.setHostile(false);
    }
    // notebook + Teleforce pickups (quest-state gated)
    if (!PH.flag("ny_notebook") && !K.has("ph_ny_q_notebook"))
      K.safe("nb", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("ph_ny_q_notebook", 1, v(A.notebook), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    if (!PH.flag("ny_teleforce"))
      K.safe("tf", () => {
        if (
          !G.isStub("items") &&
          G.items.spawnPickup &&
          K.itemExists("ph_ny_teleforce")
        )
          G.items.spawnPickup("ph_ny_teleforce", 1, v(A.teleforce), {
            static: false,
            keepY: true,
            noSave: true,
            yaw: HP,
          });
      });
  }
  function applyState(ctx) {
    if (ctx.freightUp && PH.flag("ny_freight")) ctx.freightUp.unbar(true);
    if (PH.flag("ny_wardrobe")) openWardrobe(ctx, true);
    else closeWardrobe(ctx);
    if (PH.flag("ny_gate")) {
      ctx.dyn.gate.target = 1;
      ctx.dyn.gate.open = 1;
      ctx.dyn.gate.obj.position.y = ctx.O.y + 3.4;
      if (ctx.dyn.gateCol) {
        G.world.removeCollider(ctx.dyn.gateCol);
        ctx.dyn.gateCol = null;
      }
    } else closeGate(ctx);
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  G.events.on("itemAdded", (id) => {
    if (id === "ph_ny_q_notebook") {
      PH.setFlag("ny_notebook", true);
      PH.nyQuestTo("return");
    }
    if (id === "ph_ny_teleforce") {
      PH.setFlag("ny_teleforce", true);
      K.xp(100, "Claimed the Teleforce");
    }
    if (
      id === "ph_ny_elev_key" &&
      PH.nyCtx &&
      PH.nyCtx.elevDoor &&
      !PH.flag("ny_elev")
    ) {
      /* the key opens car 3 when used */
    }
  });

  // ==================================================================
  // UPDATE
  // ==================================================================
  function update(dt, realDt, ctx) {
    if (!ctx.inside) {
      if (ctx.arcs && ctx.arcs.hum) {
        K.safe("hum", () => ctx.arcs.hum.stop());
        ctx.arcs.hum = null;
      }
      if (ctx.arcs) ctx.arcs.core.visible = ctx.arcs.halo.visible = false;
      return;
    }
    if (!dt) return;
    const P = G.player.pos,
      O = ctx.O;
    const lx = P.x - O.x,
      lz = P.z - O.z;
    // wardrobe slide / gate lift animation
    const w = ctx.dyn.wardrobe;
    if (w && w.open !== w.target) {
      w.open = Math.min(1, w.open + dt * 0.8);
      w.obj.position.x = w.base + 1.35 * w.open;
    }
    const g = ctx.dyn.gate;
    if (g && g.open !== g.target) {
      g.open = Math.min(1, g.open + dt * 0.6);
      g.obj.position.y = O.y + 3.4 * g.open;
    }
    if (ctx.arcs) {
      ctx.arcs.zapT -= dt;
      updateArcs(ctx, dt);
    }
    // the sparking cable in the corridor
    ctx.sparkT = (ctx.sparkT || 0) - dt;
    const sp = ctx.dyn.spark;
    if (sp && lz > 60 && ctx.sparkT <= 0) {
      ctx.sparkT = 0.4 + Math.random() * 1.2;
      const wp = new THREE.Vector3(O.x + sp.x, O.y + sp.y, O.z + sp.z);
      K.safe("spark", () => {
        if (!G.isStub("fx")) {
          if (G.fx.sparks) G.fx.sparks(wp);
          if (G.fx.flash && Math.random() < 0.4)
            G.fx.flash(wp, 0xa0c0ff, 1.2, 0.06);
        }
      });
      if (Math.hypot(lx - sp.x, lz - sp.z) < 1.3 && P.y - O.y < 1.5)
        K.safe("shock", () => {
          G.player.damage(5, { type: "energy", source: "live_wire" });
        });
    }
    // quest progression by position
    if (lz > 60 && lz < 92 && lx > -37 && lx < 31) {
      if (!PH.flag("ny_f33")) PH.nyOnFloor33();
      if (
        lx > -14 &&
        lx < 2 &&
        lz > 70 &&
        lz < 78 &&
        K.q.active("ph_room_3327")
      )
        PH.nyQuestTo("lab");
    }
    if (lz > LAB.z0 && lz < LAB.z1 - 0.5 && lx > LAB.x0 && lx < LAB.x1) {
      if (!PH.flag("ny_lab_seen")) {
        PH.setFlag("ny_lab_seen", true);
        PH.nyQuestTo(PH.flag("ny_coils_off") ? "notebook" : "coils");
      }
    }
  }

  function reset(ctx) {
    if (ctx.arcs && ctx.arcs.hum) {
      K.safe("hum", () => ctx.arcs.hum.stop());
      ctx.arcs.hum = null;
    }
    if (ctx.dyn && ctx.dyn.wardrobe) closeWardrobe(ctx);
    if (ctx.dyn && ctx.dyn.gate) closeGate(ctx);
    if (ctx.freightUp) ctx.freightUp.rebar();
  }

  PH.define({
    id: "hotel_new_yorker",
    name: "Hotel New Yorker",
    interior: "hotel_new_yorker",
    order: 10,
    build(ctx) {
      PH.nyCtx = ctx;
      PH.nyExterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
    reset,
    loaded: applyState,
  });
})();
