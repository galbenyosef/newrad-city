// play-inline-175 03 — fillstyle
// Lines 32-541 of readable/play-inline-175.pretty.js (statement-aligned).
  function art() {
    K.facade("wa_brick", {
      bays: 4,
      floors: 6,
      bayW: 3.2,
      floorH: 3.4,
      wall: "#bba58a",
      brick: true,
      seed: 31,
      win: { x0: 0.3, x1: 0.7, y0: 0.18, y1: 0.86 },
      frame: "#3c3a34",
      glass: "#2a3434",
      broken: 0.3,
      boarded: 0.06,
      lit: 0.0,
      mullions: 1,
      pierShade: 0.16,
      sill: "#d8ccb0",
    });
    K.facade("wa_stone", {
      bays: 4,
      floors: 2,
      bayW: 3.5,
      floorH: 4.2,
      wall: "#d4ccb8",
      seed: 32,
      blocks: true,
      win: { x0: 0.22, x1: 0.78, y0: 0.12, y1: 0.9 },
      frame: "#4a3a24",
      glass: "#1e2a28",
      broken: 0.45,
      boarded: 0.2,
      mullions: 2,
      sill: "#e8e0cc",
      lintel: true,
    });
    K.paint("wa_title", 1400, 160, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      K.fitText(
        x,
        "THE  WALDORF-ASTORIA",
        w / 2,
        h / 2 + 6,
        w - 40,
        120,
        "bold ",
        "#e2b64e",
        "#4a3208",
        5,
      );
    });
    K.paint("wa_title_small", 900, 120, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      K.fitText(
        x,
        "WALDORF-ASTORIA",
        w / 2,
        h / 2 + 4,
        w - 30,
        90,
        "bold ",
        "#d8a840",
        "#3a2606",
        4,
      );
    });
    // Continuity banner (original emblem: stars in a ring over a stylised eagle chevron)
    K.flag("wa_continuity", 256, 500, (x, w, h) => {
      x.fillStyle = "#16181c";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#e8e4d8";
      x.fillRect(10, 10, w - 20, 6);
      x.fillRect(10, h - 16, w - 20, 6);
      const cx = w / 2,
        cy = h * 0.38;
      for (let i = 0; i < 13; i++) {
        const a = -PI / 2 + (i / 13) * PI * 2;
        K.star(
          x,
          cx + Math.cos(a) * 78,
          cy + Math.sin(a) * 78,
          11,
          4.5,
          "#e8e4d8",
        );
      }
      x.fillStyle = "#b8b4a8";
      x.beginPath();
      x.moveTo(cx, cy - 40);
      x.lineTo(cx + 46, cy + 30);
      x.lineTo(cx + 18, cy + 30);
      x.lineTo(cx, cy + 4);
      x.lineTo(cx - 18, cy + 30);
      x.lineTo(cx - 46, cy + 30);
      x.closePath();
      x.fill();
      x.fillStyle = "#e8e4d8";
      x.font = "bold 40px " + K.SANS;
      x.textAlign = "center";
      x.fillText("CONTINUITY", cx, h * 0.72);
      x.font = "bold 18px " + K.SANS;
      x.fillText("ORDER · STRENGTH · AMERICA", cx, h * 0.8);
      K.grain(x, w, h, 14, 5);
      x.clearRect(0, h - 4, w, 4);
    });
    // Clock dial (World's Fair clock, cream enamel + gold numerals)
    K.litPaint("wa_dial", 256, 256, (x, w) => {
      const c = w / 2;
      x.fillStyle = "#3a2a10";
      x.fillRect(0, 0, w, w);
      const g = x.createRadialGradient(c, c, 10, c, c, c);
      g.addColorStop(0, "#f4ecd0");
      g.addColorStop(1, "#c8b890");
      x.fillStyle = g;
      x.beginPath();
      x.arc(c, c, c - 8, 0, 7);
      x.fill();
      x.strokeStyle = "#b08830";
      x.lineWidth = 8;
      x.stroke();
      x.fillStyle = "#5a3a10";
      x.font = "bold 26px " + K.FONT;
      x.textAlign = "center";
      x.textBaseline = "middle";
      const R = [
        "XII",
        "I",
        "II",
        "III",
        "IIII",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
      ];
      for (let i = 0; i < 12; i++) {
        const a = -PI / 2 + (i / 12) * PI * 2;
        x.save();
        x.translate(c + Math.cos(a) * (c - 36), c + Math.sin(a) * (c - 36));
        x.rotate(a + HP);
        x.fillText(R[i], 0, 0);
        x.restore();
      }
      x.strokeStyle = "#2a1a08";
      x.lineCap = "round";
      x.lineWidth = 9;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-PI / 2 + (9.7 / 12) * PI * 2) * 60,
        c + Math.sin(-PI / 2 + (9.7 / 12) * PI * 2) * 60,
      );
      x.stroke(); // 9:47 (the bombs)
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-PI / 2 + (47 / 60) * PI * 2) * 92,
        c + Math.sin(-PI / 2 + (47 / 60) * PI * 2) * 92,
      );
      x.stroke();
      x.fillStyle = "#b08830";
      x.beginPath();
      x.arc(c, c, 9, 0, 7);
      x.fill();
      K.stains(x, w, w, 4, 8, 0.25);
    });
    // Clock base plaque (bronze relief medallion — an original "portrait" silhouette)
    K.paint("wa_plaque", 256, 320, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#8a6030");
      g.addColorStop(0.5, "#c89a50");
      g.addColorStop(1, "#6a4420");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#3a2410";
      x.lineWidth = 10;
      x.strokeRect(10, 10, w - 20, h - 20);
      x.fillStyle = "#5a3818";
      x.beginPath();
      x.ellipse(w / 2, h * 0.42, 70, 86, 0, 0, 7);
      x.fill();
      x.fillStyle = "#d8b068";
      x.beginPath();
      x.ellipse(w / 2 + 6, h * 0.36, 30, 36, 0, 0, 7);
      x.fill();
      x.fillRect(w / 2 - 34, h * 0.48, 80, 40);
      x.fillStyle = "#3a2410";
      x.font = "bold 22px " + K.FONT;
      x.textAlign = "center";
      x.fillText("MCMXXXIX", w / 2, h * 0.84);
      K.grain(x, w, h, 20, 9);
    });
    // "Wheel of Life" floor mosaic (original radial design)
    K.paint("wa_mosaic", 1024, 1024, (x, w) => {
      const c = w / 2;
      x.fillStyle = "#d8ceb4";
      x.fillRect(0, 0, w, w);
      const ring = (r0, r1, n, cols) => {
        for (let i = 0; i < n; i++) {
          const a0 = (i / n) * PI * 2,
            a1 = ((i + 1) / n) * PI * 2;
          x.fillStyle = cols[i % cols.length];
          x.beginPath();
          x.arc(c, c, r1, a0, a1);
          x.arc(c, c, r0, a1, a0, true);
          x.closePath();
          x.fill();
        }
      };
      ring(440, 505, 64, ["#1e3a34", "#c8a048"]);
      ring(360, 440, 12, ["#6a2a1e", "#e0d4b0", "#2a4a5a", "#e0d4b0"]);
      ring(250, 360, 24, ["#d8c890", "#b89858", "#8a6a3a"]);
      ring(120, 250, 8, ["#1e3a34", "#6a2a1e"]);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * PI * 2 + PI / 8;
        x.save();
        x.translate(c + Math.cos(a) * 185, c + Math.sin(a) * 185);
        x.rotate(a + HP);
        x.fillStyle = "#e8d8a8";
        x.beginPath();
        x.moveTo(0, -46);
        x.lineTo(22, 20);
        x.lineTo(-22, 20);
        x.closePath();
        x.fill();
        x.restore();
      }
      K.star(x, c, c, 118, 48, "#c8a048");
      K.star(x, c, c, 60, 26, "#6a2a1e");
      x.strokeStyle = "rgba(30,20,10,0.25)";
      x.lineWidth = 1;
      for (let i = 0; i < w; i += 9) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i, w);
        x.stroke();
        x.beginPath();
        x.moveTo(0, i);
        x.lineTo(w, i);
        x.stroke();
      }
      K.stains(x, w, w, 14, 11, 0.35);
      K.grain(x, w, w, 18, 12);
      // a scorched crack across the wheel
      x.strokeStyle = "rgba(20,14,8,0.8)";
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(90, 300);
      x.lineTo(380, 520);
      x.lineTo(520, 480);
      x.lineTo(900, 760);
      x.stroke();
    });
    // Peacock mural panel (Peacock Alley)
    K.paint("wa_peacock", 512, 768, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#1e3a3a");
      g.addColorStop(1, "#0e2224");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#c8a048";
      x.lineWidth = 10;
      x.strokeRect(12, 12, w - 24, h - 24);
      const cx = w / 2,
        cy = h * 0.46;
      for (let i = 0; i < 17; i++) {
        const a = -PI * 0.95 + (i / 16) * PI * 0.9;
        const ex = cx + Math.cos(a) * 210,
          ey = cy + Math.sin(a) * 250;
        x.strokeStyle = "#3a8a6a";
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(cx, cy + 120);
        x.quadraticCurveTo((cx + ex) / 2, (cy + ey) / 2 + 30, ex, ey);
        x.stroke();
        x.fillStyle = "#2a7a8a";
        x.beginPath();
        x.ellipse(ex, ey, 20, 26, a + HP, 0, 7);
        x.fill();
        x.fillStyle = "#d8b050";
        x.beginPath();
        x.ellipse(ex, ey, 10, 13, a + HP, 0, 7);
        x.fill();
        x.fillStyle = "#1a2a6a";
        x.beginPath();
        x.arc(ex, ey, 5, 0, 7);
        x.fill();
      }
      x.fillStyle = "#2a5aa0";
      x.beginPath();
      x.ellipse(cx, cy + 150, 34, 70, 0, 0, 7);
      x.fill();
      x.beginPath();
      x.ellipse(cx + 6, cy + 70, 14, 20, 0.3, 0, 7);
      x.fill();
      x.fillStyle = "#d8b050";
      x.beginPath();
      x.moveTo(cx + 18, cy + 66);
      x.lineTo(cx + 34, cy + 72);
      x.lineTo(cx + 18, cy + 76);
      x.fill();
      K.weather(x, w, h, 13, 1.1);
    });
    // Deco elevator doors (brass sunburst)
    K.paint("wa_elev", 256, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "#7a5a28");
      g.addColorStop(0.5, "#d8b060");
      g.addColorStop(1, "#7a5a28");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.save();
      x.translate(w / 2, h * 0.3);
      for (let i = 0; i < 18; i++) {
        const a = PI + (i / 17) * PI;
        x.strokeStyle = i % 2 ? "#fff0c0" : "#5a3a10";
        x.lineWidth = 5;
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(Math.cos(a) * 140, -Math.sin(a) * 140);
        x.stroke();
      }
      x.restore();
      x.fillStyle = "#3a2408";
      x.fillRect(w / 2 - 3, 0, 6, h);
      for (let y = h * 0.5; y < h - 20; y += 40) {
        x.strokeStyle = "#5a3a10";
        x.lineWidth = 3;
        x.strokeRect(24, y, w / 2 - 36, 30);
        x.strokeRect(w / 2 + 12, y, w / 2 - 36, 30);
      }
      K.weather(x, w, h, 17, 0.8);
    });
    // Continuity war table: tactical map of Manhattan (original)
    K.paint("wa_warmap", 768, 512, (x, w, h) => {
      x.fillStyle = "#20302a";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "rgba(120,200,150,0.25)";
      x.lineWidth = 1;
      for (let i = 0; i < w; i += 32) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i, h);
        x.stroke();
      }
      for (let i = 0; i < h; i += 32) {
        x.beginPath();
        x.moveTo(0, i);
        x.lineTo(w, i);
        x.stroke();
      }
      x.fillStyle = "#6a7a5a";
      x.beginPath();
      x.moveTo(90, 30);
      x.lineTo(210, 20);
      x.lineTo(560, 210);
      x.lineTo(700, 330);
      x.lineTo(720, 380);
      x.lineTo(640, 470);
      x.lineTo(560, 480);
      x.lineTo(500, 420);
      x.lineTo(200, 200);
      x.lineTo(80, 90);
      x.closePath();
      x.fill();
      x.fillStyle = "#4a6a3a";
      x.fillRect(150, 70, 110, 40);
      const pin = (px, py, col, t) => {
        x.fillStyle = col;
        x.beginPath();
        x.arc(px, py, 9, 0, 7);
        x.fill();
        x.fillStyle = "#e8e4d8";
        x.font = "bold 15px " + K.SANS;
        x.fillText(t, px + 12, py + 5);
      };
      pin(330, 160, "#d02a20", "BoS — ROCKEFELLER");
      pin(390, 170, "#e8e4d8", "WALDORF (FWD CMD)");
      pin(430, 190, "#e8e4d8", "UN PLAZA");
      pin(250, 130, "#d0a020", "RADIO CITY — JAM");
      pin(360, 260, "#d02a20", "MUTANTS — ESB");
      pin(640, 440, "#e8e4d8", "LIBERTY");
      pin(300, 330, "#d0a020", "BELLEVUE — K-agent?");
      x.strokeStyle = "#d0a020";
      x.lineWidth = 3;
      x.setLineDash([8, 6]);
      x.beginPath();
      x.moveTo(390, 170);
      x.lineTo(300, 330);
      x.stroke();
      x.setLineDash([]);
      x.fillStyle = "#e8e4d8";
      x.font = "bold 22px " + K.SANS;
      x.fillText("OPERATION PARK AVENUE — EYES ONLY", 24, h - 24);
      K.grain(x, w, h, 16, 21);
    });
    // Presidential seal rug (original: eagle-less star seal, "SEAL OF THE PRESIDENT OF THE WALDORF")
    K.paint("wa_seal", 512, 512, (x, w) => {
      const c = w / 2;
      x.fillStyle = "#1e2a4a";
      x.fillRect(0, 0, w, w);
      x.fillStyle = "#c8a048";
      x.beginPath();
      x.arc(c, c, c - 20, 0, 7);
      x.fill();
      x.fillStyle = "#1e2a4a";
      x.beginPath();
      x.arc(c, c, c - 34, 0, 7);
      x.fill();
      for (let i = 0; i < 50; i++) {
        const a = (i / 50) * PI * 2;
        K.star(
          x,
          c + Math.cos(a) * (c - 62),
          c + Math.sin(a) * (c - 62),
          8,
          3.4,
          "#e8e0c8",
        );
      }
      K.star(x, c, c, 110, 44, "#c8a048");
      x.fillStyle = "#e8e0c8";
      x.font = "bold 20px " + K.FONT;
      x.textAlign = "center";
      x.fillText("SUITE 35-A", c, c + 150);
      K.stains(x, w, w, 8, 23, 0.4);
      K.grain(x, w, w, 20, 24);
    });
    // Radio rack faceplates (self-lit dials and VU meters)
    K.litPaint("wa_radio", 512, 256, (x, w, h) => {
      x.fillStyle = "#20241f";
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) {
        const ox = 20 + i * 122;
        x.fillStyle = "#0a0c0a";
        x.fillRect(ox, 20, 110, 70);
        const g = x.createLinearGradient(ox, 20, ox, 90);
        g.addColorStop(0, "#f0d890");
        g.addColorStop(1, "#a88040");
        x.fillStyle = g;
        x.fillRect(ox + 6, 26, 98, 58);
        x.strokeStyle = "#2a1a08";
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(ox + 55, 84);
        x.lineTo(ox + 30 + i * 14, 36);
        x.stroke();
        for (let k = 0; k < 3; k++) {
          x.fillStyle =
            (i + k) % 3 === 0
              ? "#ff3a2a"
              : (i + k) % 3 === 1
                ? "#3aff6a"
                : "#ffb03a";
          x.beginPath();
          x.arc(ox + 20 + k * 35, 120, 8, 0, 7);
          x.fill();
        }
        x.fillStyle = "#9aa894";
        x.beginPath();
        x.arc(ox + 55, 180, 26, 0, 7);
        x.fill();
        x.fillStyle = "#2a2e28";
        x.beginPath();
        x.arc(ox + 55, 180, 18, 0, 7);
        x.fill();
      }
      x.fillStyle = "#6aff8a";
      x.font = "bold 16px monospace";
      x.fillText("JAM 97.3 MHz  ▮▮▮▮▮▮▮ ACTIVE", 20, h - 14);
    });
    // Skyline panorama for the suite windows (dusk, original silhouette art)
    K.litPaint("wa_skyline", 1024, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#3a4a34");
      g.addColorStop(0.55, "#8a9a6a");
      g.addColorStop(1, "#b8b07a");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      const r = K.rng(77);
      for (let layer = 0; layer < 2; layer++) {
        x.fillStyle = layer ? "#1e241c" : "#4a5440";
        let px = 0;
        while (px < w) {
          const bw = 20 + r() * 50,
            bh = (layer ? 60 : 90) + r() * (layer ? 120 : 80);
          x.fillRect(px, h - bh, bw, bh);
          if (r() < 0.2) x.fillRect(px + bw / 2 - 2, h - bh - 30, 4, 30);
          px += bw + (layer ? 2 : 6);
        }
      }
      // Chrysler-like crown and a broken spire in the distance
      x.fillStyle = "#1e241c";
      x.beginPath();
      x.moveTo(600, 70);
      x.lineTo(612, 20);
      x.lineTo(624, 70);
      x.fill();
      x.fillStyle = "rgba(255,220,140,0.6)";
      for (let i = 0; i < 60; i++) x.fillRect(r() * w, h - r() * 120, 2, 3);
    });
  }

  // ------------------------------------------------------------------
  // EXTERIOR
  // ------------------------------------------------------------------
