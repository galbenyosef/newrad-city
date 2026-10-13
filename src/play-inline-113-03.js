// play-inline-113 03 — beginpath
// Lines 23-417 of readable/play-inline-113.pretty.js (statement-aligned).
  K.defineInterior("grand_central:textures", function () {
    // Zodiac ceiling (colour + star emission)
    const W = 2048,
      H = 1024;
    const zc = K.canvas(1536, 768),
      z = zc.getContext("2d");
    z.scale(0.75, 0.75);
    const ec = K.canvas(1024, 512),
      e = ec.getContext("2d");
    const gg = z.createLinearGradient(0, 0, 0, H);
    gg.addColorStop(0, "#3a767c");
    gg.addColorStop(0.5, "#4f9094");
    gg.addColorStop(1, "#3a767c");
    z.fillStyle = gg;
    z.fillRect(0, 0, W, H);
    e.fillStyle = "#000";
    e.fillRect(0, 0, 1024, 512);
    const rz = K.rng(1913);
    // background stars
    for (let i = 0; i < 700; i++) {
      const px = rz() * W,
        py = rz() * H,
        s = rz() < 0.9 ? 1.5 : 3;
      z.fillStyle = "rgba(240,210,130," + (0.4 + rz() * 0.6) + ")";
      z.beginPath();
      z.arc(px, py, s, 0, 7);
      z.fill();
    }
    // ecliptic + equator bands with graduation ticks
    const band = (y0, amp, col) => {
      z.strokeStyle = col;
      z.lineWidth = 5;
      const yAt = (px) => y0 + Math.sin((px / W) * Math.PI * 2) * amp;
      for (const off of [-22, 22]) {
        z.beginPath();
        for (let px = 0; px <= W; px += 16) z.lineTo(px, yAt(px) + off);
        z.stroke();
      }
      z.lineWidth = 2;
      for (let px = 0; px < W; px += 24) {
        const yy = yAt(px);
        z.beginPath();
        z.moveTo(px, yy - 22);
        z.lineTo(px, yy - 22 + (px % 96 === 0 ? 20 : 10));
        z.stroke();
      }
      return yAt;
    };
    const ecl = band(H * 0.5, H * 0.22, "rgba(226,190,110,0.9)");
    band(H * 0.5, -H * 0.08, "rgba(226,190,110,0.55)");
    // Milky Way haze
    z.globalAlpha = 0.18;
    z.fillStyle = "#e8e0c0";
    for (let i = 0; i < 60; i++) {
      const px = rz() * W,
        py = H * 0.2 + (px / W) * H * 0.6 + (rz() - 0.5) * 120;
      z.beginPath();
      z.ellipse(px, py, 60 + rz() * 80, 20 + rz() * 30, 0.4, 0, 7);
      z.fill();
    }
    z.globalAlpha = 1;
    // twelve zodiac figures along the ecliptic (gold line art + constellation stars)
    const gold = "#e6c27a";
    const figs = [
      "ram",
      "bull",
      "twins",
      "crab",
      "lion",
      "maiden",
      "scales",
      "scorpion",
      "archer",
      "goat",
      "bearer",
      "fish",
    ];
    figs.forEach((f, i) => {
      const px = ((i + 0.5) * W) / 12,
        py = ecl(px) + (i % 2 ? 150 : -150);
      z.save();
      z.translate(px, py);
      z.scale(1.6, 1.6);
      z.strokeStyle = gold;
      z.fillStyle = gold;
      z.lineWidth = 3;
      z.globalAlpha = 0.85;
      const L = (pts) => {
        z.beginPath();
        pts.forEach((p, k) =>
          k ? z.lineTo(p[0], p[1]) : z.moveTo(p[0], p[1]),
        );
        z.stroke();
      };
      const C = (cx, cy, rr, a0, a1) => {
        z.beginPath();
        z.arc(cx, cy, rr, a0 || 0, a1 || 7);
        z.stroke();
      };
      switch (f) {
        case "ram":
          L([
            [-60, 20],
            [40, 20],
            [55, -10],
          ]);
          C(60, -25, 18, 0.5, 5.5);
          L([
            [-60, 20],
            [-60, 50],
          ]);
          L([
            [30, 20],
            [30, 50],
          ]);
          break;
        case "bull":
          L([
            [-70, 10],
            [30, 10],
            [50, -15],
          ]);
          C(50, -15, 16);
          L([
            [40, -30],
            [30, -60],
          ]);
          L([
            [60, -30],
            [75, -58],
          ]);
          L([
            [-50, 10],
            [-50, 45],
          ]);
          L([
            [20, 10],
            [20, 45],
          ]);
          break;
        case "twins":
          for (const s of [-25, 25]) {
            C(s, -50, 12);
            L([
              [s, -38],
              [s, 20],
              [s - 15, 60],
            ]);
            L([
              [s, 20],
              [s + 15, 60],
            ]);
            L([
              [s - 25, -15],
              [s + 25, -15],
            ]);
          }
          break;
        case "crab":
          z.beginPath();
          z.ellipse(0, 0, 40, 25, 0, 0, 7);
          z.stroke();
          C(-60, -30, 18, 3.6, 7);
          C(60, -30, 18, 2.2, 5.9);
          for (let k = -1; k <= 1; k++) {
            L([
              [-35, k * 10],
              [-70, 20 + k * 12],
            ]);
            L([
              [35, k * 10],
              [70, 20 + k * 12],
            ]);
          }
          break;
        case "lion":
          z.beginPath();
          z.ellipse(0, 10, 55, 22, 0, 0, 7);
          z.stroke();
          C(60, -15, 24);
          L([
            [-40, 30],
            [-45, 60],
          ]);
          L([
            [30, 30],
            [35, 60],
          ]);
          L([
            [-55, 5],
            [-85, -25],
          ]);
          break;
        case "maiden":
          C(0, -60, 13);
          L([
            [0, -47],
            [0, 10],
          ]);
          L([
            [-35, 70],
            [0, 10],
            [35, 70],
            [-35, 70],
          ]);
          L([
            [0, -30],
            [45, -50],
          ]);
          L([
            [45, -50],
            [50, -70],
          ]);
          break;
        case "scales":
          L([
            [0, -60],
            [0, 50],
          ]);
          L([
            [-60, -40],
            [60, -40],
          ]);
          C(-60, -10, 22, 0, Math.PI);
          C(60, -10, 22, 0, Math.PI);
          L([
            [-30, 50],
            [30, 50],
          ]);
          break;
        case "scorpion":
          L([
            [-70, 20],
            [-10, 20],
          ]);
          z.beginPath();
          z.moveTo(-10, 20);
          z.bezierCurveTo(40, 20, 70, -10, 50, -50);
          z.stroke();
          L([
            [50, -50],
            [38, -40],
          ]);
          C(-80, 15, 12);
          break;
        case "archer":
          z.beginPath();
          z.arc(0, 0, 55, -1.2, 1.2);
          z.stroke();
          L([
            [20, -52],
            [20, 52],
          ]);
          L([
            [-40, 0],
            [70, 0],
          ]);
          L([
            [70, 0],
            [58, -8],
          ]);
          L([
            [70, 0],
            [58, 8],
          ]);
          break;
        case "goat":
          C(-30, -30, 18);
          L([
            [-40, -45],
            [-55, -70],
          ]);
          z.beginPath();
          z.moveTo(-15, -20);
          z.bezierCurveTo(20, 10, 40, 40, 80, 20);
          z.stroke();
          L([
            [80, 20],
            [95, 0],
          ]);
          L([
            [80, 20],
            [95, 35],
          ]);
          break;
        case "bearer":
          C(0, -55, 12);
          L([
            [0, -43],
            [0, 15],
            [-20, 60],
          ]);
          L([
            [0, 15],
            [20, 60],
          ]);
          z.beginPath();
          z.ellipse(40, -20, 16, 20, 0, 0, 7);
          z.stroke();
          for (let k = 0; k < 3; k++) {
            z.beginPath();
            z.moveTo(40, 0 + k * 10);
            z.bezierCurveTo(60, 20 + k * 10, 70, 40 + k * 10, 90, 45 + k * 10);
            z.stroke();
          }
          break;
        case "fish":
          for (const s of [-1, 1]) {
            z.beginPath();
            z.ellipse(s * 45, s * 25, 30, 13, s * 0.4, 0, 7);
            z.stroke();
            L([
              [s * 75, s * 25 - 12],
              [s * 90, s * 25],
              [s * 75, s * 25 + 12],
            ]);
          }
          L([
            [-20, -25],
            [20, 25],
          ]);
          break;
        default:
          break;
      }
      // constellation stars along the figure
      for (let k = 0; k < 7; k++) {
        const sx = (rz() - 0.5) * 150,
          sy = (rz() - 0.5) * 120;
        z.globalAlpha = 1;
        z.fillStyle = "#fff2c8";
        z.beginPath();
        z.arc(sx, sy, 5, 0, 7);
        z.fill();
        e.fillStyle = "#fff4d0";
        e.beginPath();
        e.arc((px + sx) / 2, (py + sy) / 2, 3.5, 0, 7);
        e.fill();
      }
      z.restore();
    });
    for (let i = 0; i < 160; i++) {
      e.fillStyle = "rgba(255,240,200," + (0.3 + rz() * 0.7) + ")";
      e.fillRect(rz() * 1024, rz() * 512, 2, 2);
    }
    const drawBaseGlow = () => {
      e.save();
      e.globalCompositeOperation = "lighter";
      e.globalAlpha = 0.6;
      e.drawImage(zc, 0, 0, 1024, 512);
      e.restore();
    };
    // a century of water damage, then two decades of soot and cracks
    K.stains(z, W, H, 40, 1914, 0.55, "40,36,24");
    K.streaks(z, W, H, 90, 1915, 0.25);
    z.strokeStyle = "rgba(20,20,16,0.6)";
    z.lineWidth = 2;
    for (let k = 0; k < 14; k++) {
      z.beginPath();
      let px = rz() * W,
        py = rz() * H;
      z.moveTo(px, py);
      for (let j = 0; j < 8; j++) {
        px += (rz() - 0.5) * 140;
        py += (rz() - 0.5) * 90;
        z.lineTo(px, py);
      }
      z.stroke();
    }
    // scorched area around the hole (u ≈ 0.68..0.8, v ≈ 0.58..0.8)
    const hg = z.createRadialGradient(
      W * 0.74,
      H * 0.68,
      20,
      W * 0.74,
      H * 0.68,
      360,
    );
    hg.addColorStop(0, "rgba(10,8,5,0.95)");
    hg.addColorStop(1, "rgba(10,8,5,0)");
    z.fillStyle = hg;
    z.fillRect(0, 0, W, H);
    K.grain(z, W, H, 18, 1916);
    drawBaseGlow();
    K.defineMat("zodiac", {
      map: K.texFromCanvas(zc),
      color: 0xffffff,
      rough: 0.9,
      emissiveMap: K.texFromCanvas(ec),
      emissiveColor: 0xffe6a0,
      emissiveIntensity: 0.9,
      tile: [1, 1],
    });
  });

