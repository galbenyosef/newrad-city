// play-inline-107 07 — fillstyle
// Lines 1902-2265 of readable/play-inline-107.pretty.js (statement-aligned).
  K.shopfronts = function () {
    if (K.MATDEF.shopfront) return;
    const W = 1024,
      H = 512,
      S = 256;
    const c = K.canvas(W, H),
      x = c.getContext("2d"),
      ec = K.canvas(W, H),
      e = ec.getContext("2d");
    x.fillStyle = "#222";
    x.fillRect(0, 0, W, H);
    e.fillStyle = "#000";
    e.fillRect(0, 0, W, H);
    const r = K.rng(8080);
    const frame = (ox, oy, col) => {
      // bronze / black shop frame, transom bar, kick plate
      x.fillStyle = col || "#2a2520";
      x.fillRect(ox, oy, S, 12);
      x.fillRect(ox, oy + S - 30, S, 30);
      x.fillRect(ox, oy, 12, S);
      x.fillRect(ox + S - 12, oy, 12, S);
      x.fillRect(ox, oy + 58, S, 7);
      x.fillRect(ox + S / 2 - 3, oy + 65, 6, S - 95);
      x.fillStyle = "rgba(255,230,180,0.18)";
      x.fillRect(ox + 2, oy + 2, S - 4, 2);
      x.fillRect(ox + 2, oy + 58, S - 4, 1);
      x.fillStyle = "rgba(0,0,0,0.35)";
      x.fillRect(ox, oy + S - 30, S, 3);
      e.fillStyle = "#000";
      e.fillRect(ox, oy, S, 12);
      e.fillRect(ox, oy + S - 30, S, 30);
      e.fillRect(ox, oy, 12, S);
      e.fillRect(ox + S - 12, oy, 12, S);
      e.fillRect(ox, oy + 58, S, 7);
      e.fillRect(ox + S / 2 - 3, oy + 65, 6, S - 95);
    };
    const reflections = (ox, oy, a) => {
      x.save();
      x.beginPath();
      x.rect(ox + 12, oy + 12, S - 24, S - 42);
      x.clip();
      for (let k = 0; k < 3; k++) {
        const px = ox + r() * S;
        const g = x.createLinearGradient(px, oy, px + 60, oy + S);
        g.addColorStop(0, "rgba(200,210,215,0)");
        g.addColorStop(0.5, "rgba(200,210,215," + a + ")");
        g.addColorStop(1, "rgba(200,210,215,0)");
        x.fillStyle = g;
        x.beginPath();
        x.moveTo(px, oy);
        x.lineTo(px + 40 + r() * 30, oy);
        x.lineTo(px + 110, oy + S);
        x.lineTo(px + 60, oy + S);
        x.fill();
      }
      x.restore();
    };
    const shelves = (ox, oy, col, n) => {
      for (let k = 0; k < 3; k++) {
        const y = oy + 110 + k * 36;
        x.fillStyle = col;
        x.fillRect(ox + 20, y, S - 40, 4);
        for (let j = 0; j < n; j++) {
          x.fillStyle = ["#6a3a2a", "#3a4a5a", "#8a7a3a", "#5a5a52"][
            Math.floor(r() * 4)
          ];
          const w = 6 + r() * 14,
            h = 8 + r() * 18;
          x.fillRect(ox + 24 + r() * (S - 60), y - h, w, h);
        }
      }
    };
    const grime = (ox, oy) => {
      x.save();
      x.beginPath();
      x.rect(ox, oy, S, S);
      x.clip();
      x.translate(ox, oy);
      K.stains(x, S, S, 5, Math.floor(r() * 999), 0.35);
      K.streaks(x, S, S, 10, Math.floor(r() * 999), 0.25);
      x.restore();
    };
    const cell = (i, fn) => {
      const ox = (i % 4) * S,
        oy = Math.floor(i / 4) * S;
      x.save();
      fn(ox, oy);
      x.restore();
    };
    // 0 dirty plate glass
    cell(0, (ox, oy) => {
      const g = x.createLinearGradient(0, oy, 0, oy + S);
      g.addColorStop(0, "#2a3230");
      g.addColorStop(1, "#141816");
      x.fillStyle = g;
      x.fillRect(ox, oy, S, S);
      shelves(ox, oy, "#3a3a34", 6);
      x.fillStyle = "rgba(120,130,120,0.25)";
      x.fillRect(ox, oy, S, S);
      reflections(ox, oy, 0.22);
      x.fillStyle = "rgba(210,190,120,0.55)";
      x.font = "bold 30px Georgia, serif";
      x.textAlign = "center";
      x.fillText("DRY GOODS", ox + S / 2, oy + 45);
      frame(ox, oy, "#3a2e22");
      grime(ox, oy);
    });
    // 1 boarded plywood + posters
    cell(1, (ox, oy) => {
      for (let k = 0; k < 6; k++) {
        x.fillStyle = K.shadeHex(0x9a7a52, 0.75 + r() * 0.35);
        x.fillRect(ox, oy + k * 43, S, 42);
        x.fillStyle = "rgba(40,25,10,0.5)";
        x.fillRect(ox, oy + k * 43 + 41, S, 2);
        for (let j = 0; j < 4; j++) {
          x.fillStyle = "#2a2a2a";
          x.fillRect(ox + 20 + j * 70, oy + k * 43 + 18, 3, 3);
        }
      }
      x.fillStyle = "#e8dcc0";
      x.fillRect(ox + 30, oy + 40, 80, 110);
      x.fillStyle = "#b01a1a";
      x.fillRect(ox + 36, oy + 48, 68, 30);
      x.fillStyle = "#1a1a1a";
      x.font = "bold 16px Impact, sans-serif";
      x.textAlign = "center";
      x.fillText("WANTED", ox + 70, oy + 100);
      x.fillText("ALIVE", ox + 70, oy + 120);
      x.fillStyle = "#d8c890";
      x.fillRect(ox + 150, oy + 70, 70, 95);
      x.fillStyle = "#2a4a8a";
      x.beginPath();
      x.arc(ox + 185, oy + 110, 22, 0, 7);
      x.fill();
      x.strokeStyle = "rgba(210,40,40,0.85)";
      x.lineWidth = 7;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(ox + 40, oy + 200);
      x.bezierCurveTo(
        ox + 90,
        oy + 170,
        ox + 130,
        oy + 230,
        ox + 220,
        oy + 185,
      );
      x.stroke();
      x.fillStyle = "rgba(240,150,40,0.85)";
      x.font = "bold 34px Impact, sans-serif";
      x.fillText("KEEP OUT", ox + 128, oy + 238);
      grime(ox, oy);
    });
    // 2 LIT diner / bar
    const litInterior = (ox, oy, c0, c1, glowA) => {
      const g = x.createRadialGradient(
        ox + S / 2,
        oy + 80,
        10,
        ox + S / 2,
        oy + 120,
        S * 0.8,
      );
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      x.fillStyle = g;
      x.fillRect(ox, oy, S, S);
      const ge = e.createRadialGradient(
        ox + S / 2,
        oy + 80,
        10,
        ox + S / 2,
        oy + 120,
        S * 0.8,
      );
      ge.addColorStop(0, glowA);
      ge.addColorStop(1, "rgba(0,0,0,1)");
      e.fillStyle = ge;
      e.fillRect(ox, oy, S, S);
    };
    cell(2, (ox, oy) => {
      litInterior(ox, oy, "#ffcf7a", "#6a3a18", "rgb(255,190,110)");
      x.fillStyle = "#2a1a10";
      x.fillRect(ox + 12, oy + 160, S - 24, 30);
      for (let k = 0; k < 5; k++) {
        x.fillRect(ox + 30 + k * 45, oy + 190, 6, 36);
        x.beginPath();
        x.ellipse(ox + 33 + k * 45, oy + 188, 14, 5, 0, 0, 7);
        x.fill();
      }
      x.fillStyle = "#1a100a";
      x.beginPath();
      x.arc(ox + 80, oy + 125, 13, 0, 7);
      x.fill();
      x.fillRect(ox + 68, oy + 137, 24, 30);
      x.beginPath();
      x.arc(ox + 175, oy + 120, 12, 0, 7);
      x.fill();
      x.fillRect(ox + 164, oy + 131, 22, 34);
      x.fillStyle = "#ff5a8a";
      x.font = 'bold 26px "Arial Black", sans-serif';
      x.textAlign = "center";
      x.shadowColor = "#ff5a8a";
      x.shadowBlur = 10;
      x.fillText("OPEN", ox + S / 2, oy + 45);
      x.shadowBlur = 0;
      e.fillStyle = "#ff5a8a";
      e.font = 'bold 26px "Arial Black", sans-serif';
      e.textAlign = "center";
      e.fillText("OPEN", ox + S / 2, oy + 45);
      reflections(ox, oy, 0.08);
      frame(ox, oy, "#2a2018");
      grime(ox, oy);
    });
    // 3 smashed glass into darkness
    cell(3, (ox, oy) => {
      x.fillStyle = "#0c0e0d";
      x.fillRect(ox, oy, S, S);
      x.fillStyle = "rgba(90,100,96,0.5)";
      for (let k = 0; k < 9; k++) {
        x.beginPath();
        const ex = ox + 12 + r() * (S - 24),
          ey = oy + 65 + r() * 20;
        x.moveTo(ex, oy + 65);
        x.lineTo(ex + 20 + r() * 30, oy + 65);
        x.lineTo(ex + 10, ey + 20 + r() * 50);
        x.fill();
      }
      for (let k = 0; k < 7; k++) {
        x.beginPath();
        const ex = ox + 12 + r() * (S - 24);
        x.moveTo(ex, oy + S - 30);
        x.lineTo(ex + 25 + r() * 25, oy + S - 30);
        x.lineTo(ex + 12, oy + S - 60 - r() * 60);
        x.fill();
      }
      x.strokeStyle = "rgba(200,210,210,0.35)";
      x.lineWidth = 1;
      for (let k = 0; k < 14; k++) {
        x.beginPath();
        x.moveTo(ox + 20 + r() * 220, oy + 70 + r() * 150);
        x.lineTo(ox + 20 + r() * 220, oy + 70 + r() * 150);
        x.stroke();
      }
      frame(ox, oy, "#231e1a");
      grime(ox, oy);
    });
    // 4 roll-down shutter
    cell(4, (ox, oy) => {
      for (let k = 0; k < S; k += 8) {
        x.fillStyle = K.shadeHex(0x7a7c78, 0.8 + 0.25 * Math.sin(k));
        x.fillRect(ox, oy + k, S, 7);
        x.fillStyle = "rgba(0,0,0,0.4)";
        x.fillRect(ox, oy + k + 7, S, 1);
      }
      K.stains(x, S, S, 0, 1, 0);
      x.fillStyle = "rgba(130,70,30,0.45)";
      for (let k = 0; k < 12; k++) {
        x.beginPath();
        x.ellipse(
          ox + r() * S,
          oy + r() * S,
          8 + r() * 30,
          4 + r() * 10,
          0,
          0,
          7,
        );
        x.fill();
      }
      x.fillStyle = "rgba(60,160,230,0.9)";
      x.font = "bold 44px Impact, sans-serif";
      x.textAlign = "center";
      x.save();
      x.translate(ox + S / 2, oy + 120);
      x.rotate(-0.12);
      x.fillText("COUNT ME", 0, 0);
      x.fillStyle = "rgba(240,210,60,0.9)";
      x.fillText("OUT!", 0, 46);
      x.restore();
      frame(ox, oy, "#1e1c1a");
      grime(ox, oy);
    });
    // 5 LIT junk shop
    cell(5, (ox, oy) => {
      litInterior(ox, oy, "#ffe0a0", "#4a3a24", "rgb(230,190,120)");
      shelves(ox, oy, "#3a2a1a", 9);
      x.strokeStyle = "#2a2016";
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(ox + S / 2, oy + 12);
      x.lineTo(ox + S / 2, oy + 70);
      x.stroke();
      x.fillStyle = "#fff4d0";
      x.beginPath();
      x.arc(ox + S / 2, oy + 76, 7, 0, 7);
      x.fill();
      e.fillStyle = "#fff4d0";
      e.beginPath();
      e.arc(ox + S / 2, oy + 76, 9, 0, 7);
      e.fill();
      x.fillStyle = "rgba(40,20,10,0.8)";
      x.font = "bold 22px Georgia, serif";
      x.textAlign = "center";
      x.fillText("BUY · SELL · SWAP", ox + S / 2, oy + 44);
      reflections(ox, oy, 0.07);
      frame(ox, oy, "#2a2018");
      grime(ox, oy);
    });
    // 6 LIT chem clinic (white-blue)
    cell(6, (ox, oy) => {
      litInterior(ox, oy, "#d8f0ff", "#1a2a3a", "rgb(170,215,240)");
      x.fillStyle = "#e8f0e0";
      x.fillRect(ox + 40, oy + 150, 90, 40);
      x.fillStyle = "#c02a2a";
      x.fillRect(ox + 80, oy + 156, 10, 28);
      x.fillRect(ox + 71, oy + 165, 28, 10);
      x.fillStyle = "#123018";
      for (let k = 0; k < 8; k++)
        x.fillRect(
          ox + 150 + (k % 4) * 18,
          oy + 110 + Math.floor(k / 4) * 40,
          10,
          26,
        );
      x.fillStyle = "#e02a2a";
      x.font = 'bold 24px "Arial Black", sans-serif';
      x.textAlign = "center";
      x.fillText("+ MEDS", ox + S / 2, oy + 45);
      e.fillStyle = "#ff3a3a";
      e.font = 'bold 24px "Arial Black", sans-serif';
      e.textAlign = "center";
      e.fillText("+ MEDS", ox + S / 2, oy + 45);
      reflections(ox, oy, 0.07);
      frame(ox, oy, "#202420");
      grime(ox, oy);
    });
    // 7 cinder-block infill
    cell(7, (ox, oy) => {
      for (let row = 0; row < 12; row++)
        for (let col = -1; col < 6; col++) {
          x.fillStyle = K.shadeHex(0x8a8680, 0.8 + r() * 0.3);
          x.fillRect(ox + col * 52 + (row % 2) * 26, oy + row * 22, 50, 20);
        }
      x.fillStyle = "rgba(30,28,24,0.6)";
      x.fillRect(ox + 100, oy + 90, 40, 30);
      frame(ox, oy, "#2a2622");
      grime(ox, oy);
    });
    K.grain(x, W, H, 14, 8081);
    const map = K.texFromCanvas(c, { clamp: true }),
      emap = K.texFromCanvas(ec, { clamp: true });
    K.defineMat("shopfront", {
      map,
      emissiveMap: emap,
      emissiveColor: 0xffffff,
      emissiveIntensity: 0.25,
      color: 0xffffff,
      rough: 0.55,
      metal: 0.05,
    });
    K.nightEmissive("shopfront", 0.25, 1.25);
  };
  /** Painted sign with text (weathered). */
