// play-inline-180 03 — fillstyle
// Lines 29-376 of readable/play-inline-180.pretty.js (statement-aligned).
  function art() {
    K.facade("ml_shaft", {
      bays: 3,
      floors: 6,
      bayW: 2.6,
      floorH: 3.2,
      wall: "#dcd8cc",
      seed: 91,
      blocks: true,
      win: { x0: 0.26, x1: 0.74, y0: 0.2, y1: 0.84 },
      frame: "#3c3c38",
      glass: "#26302e",
      broken: 0.35,
      boarded: 0.05,
      mullions: 1,
      sill: "#ece8dc",
      pierShade: 0.12,
    });
    K.facade("ml_annex", {
      bays: 4,
      floors: 6,
      bayW: 3.2,
      floorH: 3.3,
      wall: "#cfcabe",
      seed: 92,
      blocks: true,
      win: { x0: 0.24, x1: 0.76, y0: 0.18, y1: 0.84 },
      frame: "#3a3a36",
      glass: "#28302e",
      broken: 0.4,
      boarded: 0.1,
      mullions: 2,
      sill: "#e0dccf",
      lintel: true,
    });
    // exterior dial: cream face, Roman numerals, gilded hands frozen at 9:47
    const dial = (x, w, mirror) => {
      const c = w / 2;
      x.fillStyle = "#20242a";
      x.fillRect(0, 0, w, w);
      const g = x.createRadialGradient(c, c, 10, c, c, c);
      g.addColorStop(0, "#f8f2e0");
      g.addColorStop(1, "#d8ceb0");
      x.fillStyle = g;
      x.beginPath();
      x.arc(c, c, c - 10, 0, 7);
      x.fill();
      x.strokeStyle = "#b89040";
      x.lineWidth = 10;
      x.stroke();
      x.strokeStyle = "#2a3450";
      x.lineWidth = 3;
      x.beginPath();
      x.arc(c, c, c - 60, 0, 7);
      x.stroke();
      x.fillStyle = "#1e2a4a";
      x.font = "bold 44px " + K.FONT;
      x.textAlign = "center";
      x.textBaseline = "middle";
      const R = [
        "XII",
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
      ];
      for (let i = 0; i < 12; i++) {
        const a = -HP + (i / 12) * PI * 2;
        x.save();
        x.translate(c + Math.cos(a) * (c - 36), c + Math.sin(a) * (c - 36));
        x.rotate(a + HP);
        x.fillText(R[i], 0, 0);
        x.restore();
      }
      x.strokeStyle = "#b89040";
      x.lineCap = "round";
      x.lineWidth = 16;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-HP + (9.78 / 12) * PI * 2) * c * 0.5,
        c + Math.sin(-HP + (9.78 / 12) * PI * 2) * c * 0.5,
      );
      x.stroke();
      x.lineWidth = 10;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-HP + (47 / 60) * PI * 2) * c * 0.78,
        c + Math.sin(-HP + (47 / 60) * PI * 2) * c * 0.78,
      );
      x.stroke();
      x.fillStyle = "#b89040";
      x.beginPath();
      x.arc(c, c, 16, 0, 7);
      x.fill();
      K.stains(x, w, w, 8, mirror ? 94 : 93, 0.3);
      K.streaks(x, w, w, 14, 95, 0.2);
      // cracked pane
      x.strokeStyle = "rgba(30,30,30,0.7)";
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(c + 40, c - 90);
      x.lineTo(c + 10, c - 20);
      x.lineTo(c + 70, c + 30);
      x.moveTo(c + 10, c - 20);
      x.lineTo(c - 50, c + 10);
      x.stroke();
    };
    K.litPaint("ml_dial", 512, 512, (x, w) => dial(x, w, false));
    // dial seen from INSIDE: daylight glowing through the opal glass, shadows of numerals (mirrored)
    K.litPaint("ml_dial_in", 512, 512, (x, w) => {
      const c = w / 2;
      x.fillStyle = "#101214";
      x.fillRect(0, 0, w, w);
      const g = x.createRadialGradient(c, c, 20, c, c, c);
      g.addColorStop(0, "#f0ead0");
      g.addColorStop(1, "#c8c0a0");
      x.fillStyle = g;
      x.beginPath();
      x.arc(c, c, c - 10, 0, 7);
      x.fill();
      x.save();
      x.translate(w, 0);
      x.scale(-1, 1);
      x.fillStyle = "rgba(40,40,50,0.55)";
      x.font = "bold 44px " + K.FONT;
      x.textAlign = "center";
      x.textBaseline = "middle";
      const R = [
        "XII",
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
      ];
      for (let i = 0; i < 12; i++) {
        const a = -HP + (i / 12) * PI * 2;
        x.save();
        x.translate(c + Math.cos(a) * (c - 36), c + Math.sin(a) * (c - 36));
        x.rotate(a + HP);
        x.fillText(R[i], 0, 0);
        x.restore();
      }
      x.restore();
      // iron glazing bars (spokes and rings)
      x.strokeStyle = "#2a2a28";
      x.lineWidth = 6;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * PI * 2;
        x.beginPath();
        x.moveTo(c, c);
        x.lineTo(c + Math.cos(a) * (c - 10), c + Math.sin(a) * (c - 10));
        x.stroke();
      }
      for (const r of [60, 130, 200]) {
        x.beginPath();
        x.arc(c, c, r, 0, 7);
        x.stroke();
      }
      K.stains(x, w, w, 12, 96, 0.45, "60,56,40");
      x.fillStyle = "#101214";
      x.beginPath();
      x.moveTo(c + 60, c - 120);
      x.lineTo(c + 130, c - 60);
      x.lineTo(c + 90, c - 30);
      x.fill(); // missing pane
    });
    K.paint("ml_logo", 512, 512, (x, w) => {
      x.clearRect(0, 0, w, w);
      const c = w / 2;
      x.fillStyle = "#c8a048";
      for (let i = 0; i < 16; i++) {
        const a = -PI + (i / 15) * PI;
        x.beginPath();
        x.moveTo(c, c - 40);
        x.lineTo(c + Math.cos(a) * 240, c - 40 + Math.sin(a) * 200);
        x.lineTo(
          c + Math.cos(a + 0.06) * 240,
          c - 40 + Math.sin(a + 0.06) * 200,
        );
        x.fill();
      }
      x.fillStyle = "#e8e4d8";
      x.fillRect(c - 40, c - 120, 80, 280);
      x.beginPath();
      x.moveTo(c - 44, c - 120);
      x.lineTo(c, c - 190);
      x.lineTo(c + 44, c - 120);
      x.fill();
      x.fillStyle = "#2a3450";
      for (let y = c - 100; y < c + 150; y += 22) x.fillRect(c - 28, y, 56, 10);
      K.fitText(
        x,
        "THE LIGHT THAT NEVER FAILS",
        c,
        w - 50,
        w - 40,
        36,
        "bold ",
        "#c8a048",
        "#3a2a10",
        3,
      );
    });
    K.paint("ml_name", 1600, 200, (x, w, h) => {
      x.fillStyle = "#1e2430";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#c8a048";
      x.lineWidth = 8;
      x.strokeRect(8, 8, w - 16, h - 16);
      K.fitText(
        x,
        "METROPOLITAN LIFE INSURANCE COMPANY",
        w / 2,
        h * 0.42,
        w - 80,
        86,
        "bold ",
        "#e0c070",
        null,
      );
      K.fitText(
        x,
        'HOME OFFICE · EST. 1868 · "PROTECTING AMERICA\'S FAMILIES FROM THE UNEXPECTED"',
        w / 2,
        h * 0.78,
        w - 100,
        32,
        "",
        "#c8b890",
        null,
      );
      K.weather(x, w, h, 97, 0.8);
    });
    K.paint("ml_actuary", 768, 256, (x, w, h) => {
      x.fillStyle = "#e8e2cc";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#1e2a4a";
      x.font = "bold 26px " + K.FONT;
      x.fillText(
        "MORTALITY TABLE — METRO LIFE ACTUARIAL DEPT. (REV. MAR 1967)",
        20,
        34,
      );
      x.font = "18px monospace";
      const rows = [
        "AGE   OLD-WORLD   REVISED(WAR)   REVISED(NUCLEAR)",
        "20    0.0012    0.0190         1.0000",
        "40    0.0031    0.0410         1.0000",
        "60    0.0112    0.0930         1.0000",
        "80    0.0690    0.2200         1.0000",
        'NOTE: "ACT OF GOD" CLAUSE — SEE LEGAL. DO NOT PAY.',
      ];
      rows.forEach((r, i) => x.fillText(r, 20, 80 + i * 30));
      K.weather(x, w, h, 98, 1);
    });
    K.litPaint("ml_mainframe", 512, 256, (x, w, h) => {
      x.fillStyle = "#3a4038";
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 2; i++) {
        x.fillStyle = "#16181a";
        x.beginPath();
        x.arc(110 + i * 180, 90, 62, 0, 7);
        x.fill();
        x.fillStyle = "#6a6a60";
        x.beginPath();
        x.arc(110 + i * 180, 90, 20, 0, 7);
        x.fill();
        x.strokeStyle = "#5a5a50";
        x.lineWidth = 3;
        x.beginPath();
        x.arc(110 + i * 180, 90, 50, 0, 7);
        x.stroke();
      }
      for (let k = 0; k < 24; k++) {
        x.fillStyle =
          k % 3 === 0 ? "#ff4a2a" : k % 3 === 1 ? "#ffc040" : "#50ff70";
        x.beginPath();
        x.arc(390 + (k % 4) * 28, 30 + Math.floor(k / 4) * 32, 7, 0, 7);
        x.fill();
      }
      x.fillStyle = "#c8c8b8";
      x.font = "bold 18px monospace";
      x.fillText('ACTUARIAL ENGINE "PRUDENCE" MK II', 20, h - 20);
    });
    K.litPaint("ml_panorama", 1024, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#6a7a5a");
      g.addColorStop(0.6, "#a8b080");
      g.addColorStop(1, "#c8c090");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      const r = K.rng(99);
      x.fillStyle = "#4a5440";
      let px = 0;
      while (px < w) {
        const bw = 16 + r() * 40,
          bh = 30 + r() * 70;
        x.fillRect(px, h - bh, bw, bh);
        px += bw + 4;
      }
      // Flatiron wedge, Empire State needle
      x.fillStyle = "#2a3026";
      x.beginPath();
      x.moveTo(300, h);
      x.lineTo(330, h - 110);
      x.lineTo(350, h - 110);
      x.lineTo(372, h);
      x.fill();
      x.fillRect(640, h - 200, 34, 200);
      x.fillRect(648, h - 230, 18, 30);
      x.fillRect(655, h - 256, 4, 26);
      x.fillStyle = "rgba(255,220,150,0.5)";
      for (let i = 0; i < 40; i++) x.fillRect(r() * w, h - r() * 90, 2, 2);
    });
    K.paint("ml_vaultsign", 256, 96, (x, w, h) => {
      x.fillStyle = "#2a2e30";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "RECORDS",
        w / 2,
        h / 2,
        w - 20,
        50,
        "bold ",
        "#e0c070",
        null,
      );
    });
  }

  // gear geometry (teeth around a ring, with spokes) — extruded, centred on origin, axis = +z
