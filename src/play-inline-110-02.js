// play-inline-110 02 — addcolorstop
// Lines 18-184 of readable/play-inline-110.pretty.js (statement-aligned).
  const K = G.LMA.kit;
  const U = G.util;

  const DECK_Y = 163;

  function textures() {
    K.facade("fac_esb", {
      bays: 8,
      floors: 8,
      bayW: 2.8,
      floorH: 3.6,
      wall: "#d2c8b0",
      spandrel: "#4a5054",
      glass: "#1e2624",
      frame: "#6a7074",
      win: { x0: 0.32, x1: 0.68, y0: 0.24, y1: 0.86 },
      broken: 0.2,
      boarded: 0.03,
      pierShade: 0.3,
      mullions: 1,
      seed: 1931,
      // aluminium spandrel strips: brushed-metal highlight + deco chevrons between the windows
      deco: (x, W, H, fy, y0, fh, bw) => {
        for (let bx = 0; bx < 8; bx++) {
          const sx0 = bx * bw + bw * 0.32,
            sw = bw * 0.36;
          const g = x.createLinearGradient(sx0, 0, sx0 + sw, 0);
          g.addColorStop(0, "rgba(210,218,224,0.55)");
          g.addColorStop(0.5, "rgba(120,128,134,0.1)");
          g.addColorStop(1, "rgba(20,24,26,0.45)");
          x.fillStyle = g;
          x.fillRect(sx0, y0, sw, fh * 0.12);
          x.fillRect(sx0, y0 + fh * 0.78, sw, fh * 0.22);
          x.strokeStyle = "rgba(200,206,210,0.5)";
          x.lineWidth = 1.5;
          x.beginPath();
          x.moveTo(sx0 + 2, y0 + fh * 0.96);
          x.lineTo(sx0 + sw / 2, y0 + fh * 0.82);
          x.lineTo(sx0 + sw - 2, y0 + fh * 0.96);
          x.stroke();
        }
      },
    });
    K.facade("fac_esb_low", {
      bays: 6,
      floors: 3,
      bayW: 3.2,
      floorH: 4.2,
      wall: "#bfb6a0",
      glass: "#2a3230",
      frame: "#4a4a44",
      win: { x0: 0.2, x1: 0.8, y0: 0.18, y1: 0.86 },
      broken: 0.4,
      boarded: 0.18,
      mullions: 2,
      sill: "#a89f8a",
      lintel: true,
      seed: 1930,
    });
    K.paint("esb_sign", 1024, 128, (x, W, H) => {
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#3a2e1c");
      g.addColorStop(1, "#1e170e");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      x.font = 'bold 84px Georgia, "Times New Roman", serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      try {
        x.letterSpacing = "18px";
      } catch (e) {
        /* ignore */
      }
      const tg = x.createLinearGradient(0, 20, 0, 110);
      tg.addColorStop(0, "#fff0b0");
      tg.addColorStop(0.5, "#d4a63c");
      tg.addColorStop(1, "#8a6420");
      x.fillStyle = tg;
      x.fillText("EMPIRE STATE", W / 2, H / 2 + 4);
      try {
        x.letterSpacing = "0px";
      } catch (e) {
        /* ignore */
      }
      K.stains(x, W, H, 6, 71, 0.4);
      K.streaks(x, W, H, 20, 72, 0.3);
    });
    K.paint("esb_sunburst", 256, 256, (x, W, H) => {
      x.save();
      x.translate(W / 2, H);
      for (let i = 0; i < 17; i++) {
        const a = Math.PI + (i * Math.PI) / 16;
        x.fillStyle = i % 2 ? "#e0b44a" : "#9a7424";
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(Math.cos(a - 0.05) * 250, Math.sin(a - 0.05) * 250);
        x.lineTo(Math.cos(a + 0.05) * 250, Math.sin(a + 0.05) * 250);
        x.fill();
      }
      x.fillStyle = "#f0cc6a";
      x.beginPath();
      x.arc(0, 0, 60, Math.PI, 0);
      x.fill();
      x.restore();
    });
    K.interior("empire_state:paints"); // lobby paints (esb_relief, esb_ceiling) — see 10_empire_state_interior.js
    K.paint("elevator_door", 256, 320, (x, W, H) => {
      const g = x.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, "#6a4a26");
      g.addColorStop(0.5, "#a8804a");
      g.addColorStop(1, "#6a4a26");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#2a1a0c";
      x.fillRect(W / 2 - 2, 0, 4, H);
      x.strokeStyle = "#e0bc6a";
      x.lineWidth = 3;
      for (const sx of [W * 0.25, W * 0.75]) {
        x.beginPath();
        x.moveTo(sx, H * 0.15);
        x.lineTo(sx - 40, H * 0.45);
        x.lineTo(sx, H * 0.75);
        x.lineTo(sx + 40, H * 0.45);
        x.closePath();
        x.stroke();
        for (let k = 0; k < 5; k++) {
          x.beginPath();
          x.moveTo(sx, H * 0.45);
          x.lineTo(sx - 40 + k * 20, H * 0.9);
          x.stroke();
        }
      }
      K.stains(x, W, H, 5, 93, 0.4);
    });
    K.paint("brute_sign", 256, 128, (x, W, H) => {
      x.fillStyle = "#5a4a36";
      x.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) {
        x.fillStyle = "rgba(0,0,0,0.25)";
        x.fillRect(0, i * 32, W, 2);
      }
      x.fillStyle = "#8a1a10";
      x.font = 'bold 44px Impact, "Arial Black", sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.save();
      x.translate(W / 2, H / 2);
      x.rotate(-0.06);
      x.fillText("NO HUMANS", 0, 0);
      x.restore();
      x.fillStyle = "rgba(120,20,10,0.8)";
      for (let i = 0; i < 6; i++) x.fillRect(40 + i * 30, 80, 3, 20 + i * 4);
    });
    K.paint("observatory_sign", 512, 96, (x, W, H) =>
      K.signText(x, W, H, "86TH FLOOR OBSERVATORY", {
        bg: "#1c1c20",
        fg: "#d8c890",
        border: "#b8903a",
        size: 40,
        font: "Georgia, serif",
      }),
    );
  }

  // ------------------------------------------------------------------
  // Exterior
  // ------------------------------------------------------------------
