// play-inline-127 02 — beginpath
// Lines 20-103 of readable/play-inline-127.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  K.defineInterior("radio_city:neon", function () {
    K.neon("rc_onair", "ON AIR", 0xff2020, { h: 110, border: true });
    K.neon("rc_rfm", "RADIO FREE MANHATTAN", 0x40c0ff, {
      font: "italic bold 70px Georgia, serif",
      h: 110,
    });
  });

  K.defineInterior("radio_city:paints", function () {
    K.paint("rc_mural", 1024, 512, (x, W, H) => {
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#e0b060");
      g.addColorStop(1, "#7a4a2a");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      // mountain, sun rays, procession of figures towards a spring (original)
      x.fillStyle = "#5a3a2a";
      x.beginPath();
      x.moveTo(W * 0.55, H * 0.15);
      x.lineTo(W * 0.9, H * 0.85);
      x.lineTo(W * 0.2, H * 0.85);
      x.fill();
      x.strokeStyle = "rgba(255,240,180,0.5)";
      x.lineWidth = 6;
      for (let i = 0; i < 14; i++) {
        const a = -Math.PI + (i * Math.PI) / 13;
        x.beginPath();
        x.moveTo(W * 0.55, H * 0.15);
        x.lineTo(W * 0.55 + Math.cos(a) * W, H * 0.15 + Math.sin(a) * W);
        x.stroke();
      }
      for (let i = 0; i < 9; i++) {
        const px = W * (0.08 + i * 0.1),
          py = H * 0.82;
        x.fillStyle = ["#8a2a1a", "#2a4a6a", "#e0d0a0"][i % 3];
        x.beginPath();
        x.arc(px, py - 70, 14, 0, 7);
        x.fill();
        x.fillRect(px - 12, py - 56, 24, 70);
      }
      x.fillStyle = "#6ab0c0";
      x.beginPath();
      x.ellipse(W * 0.55, H * 0.9, 120, 26, 0, 0, 7);
      x.fill();
      K.stains(x, W, H, 16, 62, 0.45);
      K.streaks(x, W, H, 30, 63, 0.3);
    });
    K.paint("rc_carpet", 256, 256, (x, W, H) => {
      x.fillStyle = "#6a1a1a";
      x.fillRect(0, 0, W, H);
      x.strokeStyle = "#c8903a";
      x.lineWidth = 3;
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          x.beginPath();
          x.arc(i * 64 + 32, j * 64 + 32, 22, 0, 7);
          x.stroke();
          x.beginPath();
          x.moveTo(i * 64 + 32, j * 64 + 6);
          x.lineTo(i * 64 + 32, j * 64 + 58);
          x.stroke();
        }
      K.stains(x, W, H, 10, 64, 0.5);
    });
  });

  K.defineInterior("radio_city:records", function () {
    K.paint("rc_records", 256, 256, (x, W, H) => {
      for (let i = 0; i < 16; i++) {
        x.fillStyle = ["#b01a1a", "#1a4a8a", "#e0c040", "#2a6a3a", "#e8e0d0"][
          i % 5
        ];
        x.fillRect((i % 4) * 64 + 2, Math.floor(i / 4) * 64 + 2, 60, 60);
        x.fillStyle = "#111";
        x.beginPath();
        x.arc((i % 4) * 64 + 32, Math.floor(i / 4) * 64 + 32, 18, 0, 7);
        x.fill();
      }
      K.stains(x, W, H, 6, 67, 0.4);
    });
  });

