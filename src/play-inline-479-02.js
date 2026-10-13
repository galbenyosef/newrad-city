// play-inline-479 02 — fillstyle
// Lines 355-1299 of readable/play-inline-479.pretty.js (statement-aligned).
  const PAINT = {
    white(c, x, y) {
      c.fillStyle = "#ffffff";
      c.fillRect(x, y, CELL, CELL);
    },
    grime(c, x, y) {
      grime(c, x, y, "#e9e6de", 1, 11, 0.35);
    },
    grime_rust(c, x, y) {
      grime(c, x, y, "#e4dfd4", 1.2, 23, 0.4);
      rust(c, x, y, 5, 16);
    },
    grime_dark(c, x, y) {
      grime(c, x, y, "#cfcac0", 1.6, 37, 0.55);
      rust(c, x, y, 9, 6);
    },
    wood(c, x, y) {
      c.fillStyle = "#e8d8c0";
      c.fillRect(x, y, CELL, CELL);
      const r = rng(77);
      for (let i = 0; i < 60; i++) {
        c.strokeStyle = "rgba(90,60,30," + (0.08 + r() * 0.18) + ")";
        c.lineWidth = 1 + r() * 1.5;
        const yy = y + r() * CELL;
        c.beginPath();
        c.moveTo(x, yy);
        c.bezierCurveTo(
          x + 40,
          yy + r() * 6 - 3,
          x + 90,
          yy + r() * 6 - 3,
          x + CELL,
          yy,
        );
        c.stroke();
      }
      for (let i = 1; i < 4; i++) {
        c.fillStyle = "rgba(40,24,10,0.55)";
        c.fillRect(x, y + i * 32 - 1, CELL, 2);
      }
      for (let i = 0; i < 5; i++) {
        c.fillStyle = "rgba(60,36,14,0.5)";
        c.beginPath();
        c.ellipse(
          x + r() * CELL,
          y + r() * CELL,
          3 + r() * 4,
          1.5 + r() * 2,
          0,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
      grime(c, x, y, "rgba(0,0,0,0)", 0.5, 81, 0.35);
    },
    paper(c, x, y) {
      c.fillStyle = "#e6dcc2";
      c.fillRect(x, y, CELL, CELL);
      wear(c, x, y, 3, 1.3);
    },
    cardboard(c, x, y) {
      c.fillStyle = "#b8925e";
      c.fillRect(x, y, CELL, CELL);
      wear(c, x, y, 13, 1.2);
      c.fillStyle = "rgba(80,50,20,0.35)";
      c.fillRect(x, y + CELL / 2 - 6, CELL, 12);
      text(c, "THIS SIDE UP", x + 64, y + 96, 11, "rgba(60,30,10,0.7)", {
        weight: "bold",
      });
    },
    olive(c, x, y) {
      grime(c, x, y, "#dfe4d0", 1.2, 91, 0.45);
    },
    fizzo(c, x, y) {
      band(c, x, y, "#1f7a4a", (bx, by, w) => {
        c.fillStyle = "#f4f0e0";
        c.fillRect(bx, by + 34, w, 44);
        text(c, "Fizzo", bx + w / 2, by + 52, 20, "#c8281c", {
          italic: true,
          font: 'Georgia, "Times New Roman", serif',
          maxW: w - 8,
        });
        text(c, "COLA", bx + w / 2, by + 70, 9, "#1f7a4a", { maxW: w - 8 });
        c.fillStyle = "#e8c040";
        for (let i = 0; i < 4; i++)
          c.fillRect(bx + 4 + i * (w / 4), by + 96, w / 8, 4);
      });
      wear(c, x, y, 21, 0.8);
    },
    fizzo_blue(c, x, y) {
      band(c, x, y, "#14306a", (bx, by, w) => {
        c.fillStyle = "#7ad0ff";
        c.beginPath();
        c.arc(bx + w / 2, by + 30, 11, 0, Math.PI * 2);
        c.fill();
        text(c, "Fizzo", bx + w / 2, by + 60, 16, "#ffffff", {
          italic: true,
          font: "Georgia, serif",
          maxW: w - 8,
        });
        text(c, "BLUE", bx + w / 2, by + 80, 12, "#9fe0ff", { maxW: w - 8 });
      });
    },
    fizzo_lime(c, x, y) {
      band(c, x, y, "#6aa828", (bx, by, w) => {
        c.fillStyle = "#f4f0e0";
        c.fillRect(bx, by + 34, w, 44);
        text(c, "Fizzo", bx + w / 2, by + 50, 16, "#2a5a10", {
          italic: true,
          font: "Georgia, serif",
          maxW: w - 8,
        });
        text(c, "LIME", bx + w / 2, by + 68, 11, "#c8281c", { maxW: w - 8 });
      });
      wear(c, x, y, 22, 0.8);
    },
    rootbeer(c, x, y) {
      band(c, x, y, "#5a2a12", (bx, by, w) => {
        c.fillStyle = "#e8d098";
        c.fillRect(bx + 4, by + 28, w - 8, 60);
        c.fillStyle = "#5a2a12";
        c.beginPath();
        c.arc(bx + w / 2, by + 62, 14, Math.PI, 0);
        c.fill();
        c.fillRect(bx + w / 2 - 16, by + 62, 32, 6);
        c.fillStyle = "#e8d098";
        c.beginPath();
        c.arc(bx + w / 2 - 9, by + 70, 4, 0, Math.PI * 2);
        c.arc(bx + w / 2 + 9, by + 70, 4, 0, Math.PI * 2);
        c.fill();
        text(c, "PRAIRIE", bx + w / 2, by + 38, 9, "#5a2a12", { maxW: w - 10 });
        text(c, "ROOT BEER", bx + w / 2, by + 82, 7, "#5a2a12", {
          maxW: w - 10,
        });
      });
      wear(c, x, y, 23, 0.8);
    },
    water(c, x, y) {
      band(c, x, y, "#2e64b4", (bx, by, w) => {
        c.fillStyle = "#e8f0f8";
        c.fillRect(bx, by + 44, w, 30);
        text(c, "PURIFIED", bx + w / 2, by + 59, 11, "#2e64b4", {
          maxW: w - 6,
        });
        c.fillStyle = "#9fd0f0";
        for (let i = 0; i < 3; i++) {
          c.beginPath();
          c.arc(bx + 14 + i * 18, by + 26, 5, 0, Math.PI * 2);
          c.fill();
        }
      });
    },
    beer(c, x, y) {
      band(c, x, y, "#efe0b0", (bx, by, w) => {
        c.strokeStyle = "#7a1a14";
        c.lineWidth = 3;
        c.strokeRect(bx + 6, by + 26, w - 12, 68);
        text(c, "EMPIRE", bx + w / 2, by + 44, 15, "#7a1a14", {
          maxW: w - 16,
          font: "Georgia, serif",
        });
        text(c, "BREW HOUSE", bx + w / 2, by + 62, 8, "#5a4a2a", {
          maxW: w - 16,
        });
        text(c, "LAGER", bx + w / 2, by + 80, 11, "#7a1a14", { maxW: w - 16 });
      });
      wear(c, x, y, 24, 1);
    },
    whiskey(c, x, y) {
      c.fillStyle = "#e8dcb0";
      c.fillRect(x, y, CELL, CELL);
      c.strokeStyle = "#3a2410";
      c.lineWidth = 3;
      c.strokeRect(x + 10, y + 10, CELL - 20, CELL - 20);
      text(c, "OLD", x + 64, y + 40, 16, "#3a2410");
      text(c, "WHISKEY", x + 64, y + 68, 18, "#7a1a10", { maxW: 100 });
      text(c, "KENTUCKY", x + 64, y + 94, 10, "#3a2410");
      wear(c, x, y, 25, 1.2);
    },
    vodka(c, x, y) {
      band(c, x, y, "#f4f4f4", (bx, by, w) => {
        c.fillStyle = "#c02020";
        c.fillRect(bx, by + 40, w, 34);
        text(c, "VODKA", bx + w / 2, by + 57, 14, "#ffffff", { maxW: w - 8 });
      });
    },
    wine(c, x, y) {
      band(c, x, y, "#ece4cc", (bx, by, w) => {
        text(c, "Vin", bx + w / 2, by + 50, 16, "#5a0a14", {
          italic: true,
          font: "Georgia, serif",
        });
        c.fillStyle = "#5a0a14";
        c.fillRect(bx + 10, by + 68, w - 20, 3);
      });
      wear(c, x, y, 26, 1);
    },
    milk(c, x, y) {
      band(c, x, y, "#f6f6f0", (bx, by, w) => {
        c.fillStyle = "#d02020";
        c.fillRect(bx, by + 30, w, 8);
        text(c, "MILK", bx + w / 2, by + 64, 16, "#d02020", { maxW: w - 8 });
      });
    },
    tonic(c, x, y) {
      // Dr. Halloran's Rally Tonic: a cream paper label with a scalloped border, wrapped twice round the bottle
      band(c, x, y, "#efe2c0", (bx, by, w) => {
        c.strokeStyle = "#7a1a10";
        c.lineWidth = 2;
        c.strokeRect(bx + 3, by + 14, w - 6, 100);
        c.fillStyle = "#7a1a10";
        for (let i = 0; i < 6; i++) {
          c.beginPath();
          c.arc(bx + 6 + i * ((w - 12) / 5), by + 14, 3, 0, Math.PI * 2);
          c.fill();
        }
        text(c, "DR. HALLORAN'S", bx + w / 2, by + 26, 7, "#3a2410", {
          maxW: w - 10,
          font: "Georgia, serif",
        });
        text(c, "RALLY", bx + w / 2, by + 46, 16, "#b0281a", {
          maxW: w - 8,
          font: "Georgia, serif",
        });
        text(c, "TONIC", bx + w / 2, by + 64, 13, "#3a2410", {
          maxW: w - 10,
          font: "Georgia, serif",
        });
        text(c, "Doctor recommended!", bx + w / 2, by + 82, 6, "#7a1a10", {
          maxW: w - 8,
          italic: true,
          font: "Georgia, serif",
        });
        text(c, "22% ALC. · 4 FL. OZ.", bx + w / 2, by + 100, 5, "#3a2410", {
          maxW: w - 10,
          weight: "normal",
          font: "Arial, sans-serif",
        });
      });
      wear(c, x, y, 27, 1);
    },
    iodine(c, x, y) {
      band(c, x, y, "#f6f0dc", (bx, by, w) => {
        c.fillStyle = "#7a3a9a";
        c.fillRect(bx, by + 28, w, 20);
        text(c, "IODINE", bx + w / 2, by + 38, 10, "#ffffff", { maxW: w - 8 });
        text(c, "KI 130mg", bx + w / 2, by + 72, 9, "#7a3a9a", { maxW: w - 8 });
      });
    },
    bull(c, x, y) {
      band(c, x, y, "#2a2a2a", (bx, by, w) => {
        c.fillStyle = "#f0d040";
        c.beginPath();
        c.moveTo(bx + w / 2 - 16, by + 30);
        c.lineTo(bx + w / 2 - 6, by + 42);
        c.lineTo(bx + w / 2 + 6, by + 42);
        c.lineTo(bx + w / 2 + 16, by + 30);
        c.lineTo(bx + w / 2 + 10, by + 52);
        c.lineTo(bx + w / 2 - 10, by + 52);
        c.closePath();
        c.fill();
        text(c, "BULL", bx + w / 2, by + 74, 14, "#f0d040", { maxW: w - 8 });
      });
    },
    syrette(c, x, y) {
      band(c, x, y, "#e8e4d0", (bx, by, w) => {
        c.fillStyle = "#5a6a3a";
        c.fillRect(bx, by + 36, w, 40);
        text(c, "MORPHINE", bx + w / 2, by + 50, 8, "#ffffff", { maxW: w - 8 });
        text(c, "1/2 GR", bx + w / 2, by + 66, 9, "#f0e0b0", { maxW: w - 8 });
      });
    },
    focus(c, x, y) {
      c.fillStyle = "#e8eef4";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#1f6aa0";
      c.beginPath();
      c.arc(x + 64, y + 48, 28, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#e8eef4";
      c.beginPath();
      c.arc(x + 64, y + 48, 16, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#1f6aa0";
      c.beginPath();
      c.arc(x + 64, y + 48, 6, 0, Math.PI * 2);
      c.fill();
      text(c, "FOCUS", x + 64, y + 92, 20, "#1f6aa0");
      text(c, "PEPPERMINT", x + 64, y + 112, 9, "#c02a1a");
      wear(c, x, y, 28, 0.7);
    },
    rush(c, x, y) {
      band(c, x, y, "#e8701a", (bx, by, w) => {
        c.fillStyle = "#ffffff";
        for (let i = 0; i < 3; i++)
          c.fillRect(bx + 6, by + 40 + i * 9, w - 12 - i * 8, 4);
        text(c, "RUSH", bx + w / 2, by + 84, 16, "#ffffff", { maxW: w - 8 });
      });
    },
    rage(c, x, y) {
      band(c, x, y, "#1a1a1a", (bx, by, w) => {
        c.fillStyle = "#d02020";
        c.beginPath();
        c.moveTo(bx + w / 2, by + 26);
        c.lineTo(bx + w / 2 + 14, by + 56);
        c.lineTo(bx + w / 2, by + 50);
        c.lineTo(bx + w / 2 - 14, by + 56);
        c.closePath();
        c.fill();
        text(c, "RAGE", bx + w / 2, by + 78, 14, "#d02020", { maxW: w - 6 });
      });
    },
    prussian(c, x, y) {
      // Prussian Blue capsules: a white pharmacy label with a deep blue band and the Civil Defense triangle
      band(c, x, y, "#f4f2ea", (bx, by, w) => {
        c.fillStyle = "#123a7a";
        c.fillRect(bx, by + 22, w, 30);
        text(c, "PRUSSIAN", bx + w / 2, by + 31, 9, "#ffffff", { maxW: w - 6 });
        text(c, "BLUE", bx + w / 2, by + 44, 10, "#ffffff", { maxW: w - 6 });
        c.fillStyle = "#d02020";
        c.beginPath();
        c.moveTo(bx + w / 2, by + 60);
        c.lineTo(bx + w / 2 + 9, by + 75);
        c.lineTo(bx + w / 2 - 9, by + 75);
        c.closePath();
        c.fill();
        text(c, "500 mg CAPSULES", bx + w / 2, by + 86, 5, "#123a7a", {
          maxW: w - 8,
          weight: "normal",
          font: "Arial, sans-serif",
        });
        text(c, "O.C.D. STOCKPILE", bx + w / 2, by + 98, 5, "#3a3a3a", {
          maxW: w - 8,
          weight: "normal",
          font: "Arial, sans-serif",
        });
      });
      wear(c, x, y, 30, 0.7);
    },
    tonic_x(c, x, y) {
      // Rally Tonic Extra: black and gold, "EXTRA STRENGTH"
      band(c, x, y, "#1a1410", (bx, by, w) => {
        c.strokeStyle = "#d8b048";
        c.lineWidth = 2;
        c.strokeRect(bx + 3, by + 14, w - 6, 100);
        text(c, "DR. HALLORAN'S", bx + w / 2, by + 26, 7, "#d8b048", {
          maxW: w - 10,
          font: "Georgia, serif",
        });
        text(c, "RALLY", bx + w / 2, by + 46, 16, "#f0d070", {
          maxW: w - 8,
          font: "Georgia, serif",
        });
        c.fillStyle = "#b0281a";
        c.fillRect(bx + 4, by + 58, w - 8, 14);
        text(c, "EXTRA", bx + w / 2, by + 65, 10, "#ffffff", { maxW: w - 10 });
        text(c, "STRENGTH", bx + w / 2, by + 84, 7, "#d8b048", {
          maxW: w - 10,
        });
        text(c, "For the man who cannot", bx + w / 2, by + 98, 5, "#d8b048", {
          maxW: w - 8,
          italic: true,
          font: "Georgia, serif",
        });
        text(c, "afford to be laid up!", bx + w / 2, by + 106, 5, "#d8b048", {
          maxW: w - 8,
          italic: true,
          font: "Georgia, serif",
        });
      });
      wear(c, x, y, 31, 0.8);
    },
    wf_seal(c, x, y) {
      // the 1964 World's Fair seal: a steel globe in three orbit rings on midnight blue
      c.fillStyle = "#16244a";
      c.fillRect(x, y, CELL, CELL);
      c.strokeStyle = "#d8dce4";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(x + 64, y + 58, 30, 0, Math.PI * 2);
      c.stroke();
      c.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) {
        c.beginPath();
        c.ellipse(
          x + 64,
          y + 58,
          Math.abs(30 - Math.abs(i) * 9) || 2,
          30,
          0,
          0,
          Math.PI * 2,
        );
        c.stroke();
        c.beginPath();
        c.moveTo(x + 34, y + 58 + i * 11);
        c.lineTo(x + 94, y + 58 + i * 11);
        c.stroke();
      }
      c.strokeStyle = "#e8b040";
      c.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.ellipse(x + 64, y + 58, 46, 12, -0.5 + i * 0.5, 0, Math.PI * 2);
        c.stroke();
      }
      text(c, "WORLD'S FAIR", x + 64, y + 104, 13, "#e8b040", { maxW: 112 });
      text(c, "1964 · 1965", x + 64, y + 119, 9, "#d8dce4", { maxW: 100 });
      wear(c, x, y, 32, 0.6);
    },
    wf_ribbon(c, x, y) {
      // a hatband ribbon: orange and blue Fair stripes
      c.fillStyle = "#1e3a8a";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#f08a1a";
      for (let i = 0; i < CELL; i += 32) c.fillRect(x, y + i + 8, CELL, 12);
      c.fillStyle = "#f4f0e0";
      for (let i = 0; i < CELL; i += 32) c.fillRect(x, y + i + 22, CELL, 3);
    },
    jerky(c, x, y) {
      // Golden Plain beef jerky: kraft bag, oxblood crimp, sunset label
      c.fillStyle = "#c89a5a";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#7a2a12";
      c.fillRect(x, y, CELL, 20);
      c.fillStyle = "rgba(255,255,255,0.3)";
      for (let i = 1; i < 12; i++) c.fillRect(x + i * 11, y + 2, 2, 16);
      c.fillStyle = "#f4e6c0";
      c.beginPath();
      c.ellipse(x + 64, y + 66, 52, 34, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#e8902a";
      c.beginPath();
      c.arc(x + 64, y + 76, 14, Math.PI, 0);
      c.fill();
      c.fillStyle = "#7a3a12";
      c.fillRect(x + 22, y + 76, 84, 12);
      text(c, "GOLDEN PLAIN", x + 64, y + 50, 13, "#7a2a12", {
        maxW: 96,
        font: "Georgia, serif",
      });
      text(c, "BEEF JERKY", x + 64, y + 112, 12, "#3a1808", { maxW: 110 });
      wear(c, x, y, 29, 0.9);
    },
    beans(c, x, y) {
      band(c, x, y, "#c85a2a", (bx, by, w) => {
        c.fillStyle = "#f0e0b0";
        c.fillRect(bx, by + 30, w, 56);
        text(c, "FRANKS &", bx + w / 2, by + 46, 11, "#6a2a10", {
          maxW: w - 6,
        });
        text(c, "BEANS", bx + w / 2, by + 68, 15, "#6a2a10", { maxW: w - 6 });
      });
      wear(c, x, y, 30, 0.9);
    },
    dogfood(c, x, y) {
      band(c, x, y, "#3a6a3a", (bx, by, w) => {
        text(c, "DOG", bx + w / 2, by + 44, 15, "#f0e0b0", { maxW: w - 6 });
        text(c, "CHOW", bx + w / 2, by + 70, 15, "#f0e0b0", { maxW: w - 6 });
      });
      wear(c, x, y, 31, 1);
    },
    chowder(c, x, y) {
      band(c, x, y, "#c02a2a", (bx, by, w) => {
        c.fillStyle = "#f0ecd8";
        c.fillRect(bx, by + 40, w, 36);
        text(c, "CHOWDER", bx + w / 2, by + 58, 10, "#c02a2a", { maxW: w - 6 });
      });
      wear(c, x, y, 32, 0.9);
    },
    flakes(c, x, y) {
      // Freedom Flakes (Brooklyn Sugar Works)
      c.fillStyle = "#f6eee0";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#1e3a8a";
      c.fillRect(x, y, CELL, 52);
      c.fillStyle = "#ffffff";
      for (let i = 0; i < 7; i++) {
        c.beginPath();
        c.arc(x + 10 + i * 18, y + 7, 2.2, 0, Math.PI * 2);
        c.fill();
      }
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i % 2 ? "#f6eee0" : "#c8201a";
        c.fillRect(x, y + 52 + i * 5, CELL, 5);
      }
      text(c, "Freedom", x + 64, y + 24, 21, "#ffffff", {
        italic: true,
        maxW: 118,
      });
      text(c, "FLAKES", x + 64, y + 44, 15, "#f4c21e", { maxW: 118 });
      c.fillStyle = "#1e3a8a";
      c.beginPath();
      c.ellipse(x + 64, y + 96, 36, 16, 0, 0, Math.PI);
      c.fill();
      c.fillStyle = "#e8a83a";
      for (let i = 0; i < 9; i++) {
        c.beginPath();
        c.ellipse(
          x + 36 + (i % 5) * 14,
          y + 90 - Math.floor(i / 5) * 8,
          6,
          4,
          i,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
      text(c, "BROOKLYN SUGAR WORKS", x + 64, y + 120, 7, "#1e3a8a");
      wear(c, x, y, 33, 1);
    },
    zeppelin(c, x, y) {
      // Chocolate Zeppelin: silver foil wrapper print
      const g = c.createLinearGradient(x, y, x + CELL, y + CELL);
      g.addColorStop(0, "#8a949c");
      g.addColorStop(0.3, "#f4f8fa");
      g.addColorStop(0.6, "#a8b2ba");
      g.addColorStop(1, "#e8eef2");
      c.fillStyle = g;
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#5a2c12";
      c.beginPath();
      c.ellipse(x + 64, y + 72, 44, 15, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.moveTo(x + 24, y + 72);
      c.lineTo(x + 12, y + 58);
      c.lineTo(x + 30, y + 66);
      c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(x + 24, y + 72);
      c.lineTo(x + 12, y + 86);
      c.lineTo(x + 30, y + 78);
      c.closePath();
      c.fill();
      c.strokeStyle = "#fbf2dc";
      c.lineWidth = 2;
      c.beginPath();
      for (let i = 0; i <= 12; i++)
        c.lineTo(x + 34 + i * 5, y + 72 + Math.sin(i * 1.6) * 3);
      c.stroke();
      text(c, "Chocolate", x + 64, y + 26, 18, "#5a2c12", {
        italic: true,
        maxW: 116,
        font: "Georgia, serif",
      });
      text(c, "ZEPPELIN", x + 64, y + 46, 14, "#1e3a6a", { maxW: 116 });
      text(c, "LIGHTER THAN AIR", x + 64, y + 108, 9, "#5a2c12", { maxW: 116 });
      wear(c, x, y, 34, 0.6);
    },
    marinara(c, x, y) {
      // Mama Marinara's Instant Meatballs (can wrap)
      c.fillStyle = "#c8281e";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#f6ecd4";
      c.fillRect(x, y + 34, CELL, 44);
      c.fillStyle = "#2a7a3a";
      c.fillRect(x, y + 78, CELL, 6);
      text(c, "Mama", x + 64, y + 18, 22, "#f6ecd4", {
        italic: true,
        font: "Georgia, serif",
      });
      text(c, "MARINARA'S", x + 64, y + 48, 13, "#c8281e", { maxW: 116 });
      text(c, "INSTANT MEATBALLS", x + 64, y + 66, 8, "#2a7a3a", { maxW: 116 });
      c.fillStyle = "#6a3018";
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.arc(x + 25 + i * 26, y + 104, 9, 0, Math.PI * 2);
        c.fill();
      }
      wear(c, x, y, 35, 1);
    },
    frankbun(c, x, y) {
      // Forever Franks sticker on the Frank-in-a-Bun sleeve
      c.fillStyle = "#e8f0f4";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#c8201a";
      c.beginPath();
      c.arc(x + 64, y + 64, 58, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#fbf0d8";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(x + 64, y + 64, 50, 0, Math.PI * 2);
      c.stroke();
      text(c, "FOREVER", x + 64, y + 44, 14, "#fbf0d8", { maxW: 90 });
      text(c, "FRANKS", x + 64, y + 64, 18, "#f4c21e", { maxW: 90 });
      text(c, "MIRACLE-KEEP", x + 64, y + 86, 8, "#fbf0d8", { maxW: 86 });
    },
    astro(c, x, y) {
      // Astronaut Ice Cream foil pouch (Junior Rocketeer Co.)
      const g = c.createLinearGradient(x, y, x + CELL, y + CELL);
      g.addColorStop(0, "#7c868e");
      g.addColorStop(0.35, "#f4f8fa");
      g.addColorStop(0.7, "#9aa4ac");
      g.addColorStop(1, "#e8eef2");
      c.fillStyle = g;
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#0e1a44";
      c.fillRect(x + 12, y + 14, CELL - 24, CELL - 28);
      text(c, "ASTRONAUT", x + 64, y + 28, 12, "#ffffff", { maxW: 100 });
      text(c, "ICE CREAM", x + 64, y + 44, 12, "#ff9ab8", { maxW: 100 });
      const cols = ["#e88aa0", "#f6ecd0", "#6a3a1e"];
      for (let i = 0; i < 3; i++) {
        c.fillStyle = cols[i];
        c.fillRect(x + 30 + i * 23, y + 56, 23, 30);
      }
      text(c, "JUNIOR ROCKETEER", x + 64, y + 100, 8, "#f4d040", { maxW: 100 });
    },
    spare0(c, x, y) {
      c.fillStyle = "#ffffff";
      c.fillRect(x, y, CELL, CELL);
    },
    homeguard(c, x, y) {
      // Homeguard Cleanser canister wrap
      c.fillStyle = "#1e3a6a";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#c8201a";
      c.fillRect(x, y + 92, CELL, 8);
      c.fillStyle = "#f4f0e6";
      c.fillRect(x, y + 100, CELL, 5);
      c.fillStyle = "#f4f0e6";
      c.beginPath();
      c.moveTo(x + 48, y + 10);
      c.lineTo(x + 80, y + 10);
      c.lineTo(x + 80, y + 30);
      c.quadraticCurveTo(x + 80, y + 46, x + 64, y + 54);
      c.quadraticCurveTo(x + 48, y + 46, x + 48, y + 30);
      c.closePath();
      c.fill();
      text(c, "H", x + 64, y + 30, 22, "#c8201a");
      text(c, "HOMEGUARD", x + 64, y + 70, 18, "#f4f0e6", { maxW: 118 });
      text(c, "CLEANSER", x + 64, y + 116, 10, "#f4f0e6");
      wear(c, x, y, 39, 0.8);
    },
    noodle(c, x, y) {
      band(c, x, y, "#f0ece0", (bx, by, w) => {
        c.fillStyle = "#d02a2a";
        c.fillRect(bx, by + 28, w, 22);
        text(c, "NOODLES", bx + w / 2, by + 39, 10, "#ffffff", { maxW: w - 6 });
        text(c, "CHOW MEIN", bx + w / 2, by + 80, 12, "#d02a2a", {
          maxW: w - 8,
        });
      });
    },
    note(c, x, y) {
      c.fillStyle = "#e8e0c8";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "rgba(120,150,190,0.35)";
      for (let i = 0; i < 9; i++) c.fillRect(x, y + 20 + i * 12, CELL, 1);
      lines(c, x + 12, y + 14, 100, 104, 9, "rgba(30,30,60,0.75)", 5);
      c.fillStyle = "rgba(200,80,60,0.4)";
      c.fillRect(x + 8, y, 1, CELL);
      wear(c, x, y, 40, 1.2);
    },
    book(c, x, y) {
      c.fillStyle = "#5a2a1a";
      c.fillRect(x, y, CELL, CELL);
      c.strokeStyle = "#c8a040";
      c.lineWidth = 3;
      c.strokeRect(x + 10, y + 10, CELL - 20, CELL - 20);
      c.fillStyle = "#c8a040";
      c.fillRect(x + 24, y + 40, 80, 6);
      c.fillRect(x + 34, y + 54, 60, 4);
      c.fillRect(x + 30, y + 90, 68, 3);
      wear(c, x, y, 41, 1.4);
    },
    reel(c, x, y) {
      c.fillStyle = "#d8d0b8";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#c0a030";
      c.fillRect(x, y, CELL, 22);
      text(c, "TAPE REEL", x + 64, y + 11, 12, "#2a2a2a");
      lines(c, x + 14, y + 36, 100, 70, 5, "rgba(20,20,40,0.7)", 9);
      wear(c, x, y, 42, 1);
    },
    scrip_note(c, x, y) {
      c.fillStyle = "#d8dcc4";
      c.fillRect(x, y, CELL, CELL);
      c.strokeStyle = "#3a5a3a";
      c.lineWidth = 3;
      c.strokeRect(x + 8, y + 22, CELL - 16, CELL - 44);
      c.lineWidth = 1;
      c.strokeRect(x + 13, y + 27, CELL - 26, CELL - 54);
      text(c, "RATION SCRIP", x + 64, y + 42, 12, "#3a5a3a", {
        font: 'Georgia, "Times New Roman", serif',
        maxW: 100,
      });
      c.fillStyle = "#3a5a3a";
      c.beginPath();
      c.arc(x + 64, y + 68, 13, 0, Math.PI * 2);
      c.fill();
      text(c, "1", x + 64, y + 69, 16, "#d8dcc4", { font: "Georgia, serif" });
      text(c, "OFFICE OF CIVIL DEFENSE", x + 64, y + 94, 6, "#3a5a3a", {
        maxW: 100,
      });
      c.fillStyle = "rgba(60,80,60,0.18)";
      c.fillRect(x + 62, y, 4, CELL);
      wear(c, x, y, 43, 0.7);
    },
    ammo(c, x, y) {
      grime(c, x, y, "#5e6844", 1, 44, 0.45);
      c.strokeStyle = "rgba(240,210,90,0.9)";
      c.lineWidth = 3;
      c.strokeRect(x + 10, y + 34, CELL - 20, 60);
      text(c, "AMMUNITION", x + 64, y + 56, 13, "rgba(240,210,90,0.95)", {
        font: '"Courier New", monospace',
      });
      text(c, "CAL .308  M-2", x + 64, y + 78, 10, "rgba(240,210,90,0.9)", {
        font: '"Courier New", monospace',
      });
    },
    ammo_308(c, x, y) {
      grime(c, x, y, "#5e6844", 1, 45, 0.45);
      text(c, "10MM", x + 64, y + 50, 22, "rgba(240,210,90,0.95)", {
        font: '"Courier New", monospace',
      });
      text(c, "50 RDS", x + 64, y + 80, 14, "rgba(240,210,90,0.9)", {
        font: '"Courier New", monospace',
      });
    },
    redcross(c, x, y) {
      grime(c, x, y, "#f4f2ec", 0.6, 46, 0.3);
      c.fillStyle = "#c01a14";
      c.fillRect(x + 50, y + 22, 28, 84);
      c.fillRect(x + 22, y + 50, 84, 28);
      text(c, "FIRST AID", x + 64, y + 116, 10, "#c01a14");
    },
    fizzo_logo(c, x, y) {
      grime(c, x, y, "#efe8d8", 0.6, 47, 0.25);
      c.fillStyle = "#1f7a4a";
      c.beginPath();
      c.ellipse(x + 64, y + 64, 56, 36, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#e8c040";
      c.lineWidth = 4;
      c.beginPath();
      c.ellipse(x + 64, y + 64, 50, 30, 0, 0, Math.PI * 2);
      c.stroke();
      text(c, "Fizzo", x + 64, y + 62, 26, "#ffffff", {
        italic: true,
        font: "Georgia, serif",
        maxW: 90,
      });
      wear(c, x, y, 48, 0.8);
    },
    fridge_badge(c, x, y) {
      c.fillStyle = "#c8c8c0";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#2a2a2a";
      c.fillRect(x + 6, y + 40, CELL - 12, 48);
      text(c, "Frost-O-Matic", x + 64, y + 64, 16, "#e8e0c0", {
        italic: true,
        font: "Georgia, serif",
        maxW: 108,
      });
    },
    civdef(c, x, y) {
      c.fillStyle = "#e8e4d8";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#1e3a7a";
      c.beginPath();
      c.arc(x + 64, y + 52, 34, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.moveTo(x + 64, y + 26);
      c.lineTo(x + 88, y + 68);
      c.lineTo(x + 40, y + 68);
      c.closePath();
      c.fill();
      c.fillStyle = "#d02020";
      c.beginPath();
      c.moveTo(x + 64, y + 36);
      c.lineTo(x + 80, y + 63);
      c.lineTo(x + 48, y + 63);
      c.closePath();
      c.fill();
      text(c, "CIVIL DEFENSE", x + 64, y + 104, 12, "#1e3a7a", { maxW: 116 });
    },
    drycell(c, x, y) {
      band(c, x, y, "#6a6a60", (bx, by, w) => {
        c.fillStyle = "#e8c020";
        c.fillRect(bx, by + 36, w, 40);
        trefoil(c, bx + w / 2, by + 56, 14, "#1a1a1a", "#e8c020");
      });
    },
    paint(c, x, y) {
      band(c, x, y, "#d0c080", (bx, by, w) => {
        c.fillStyle = "#b02a1a";
        c.fillRect(bx, by + 20, w, 16);
        text(c, "PAINT", bx + w / 2, by + 70, 14, "#3a2a10", { maxW: w - 6 });
      });
      wear(c, x, y, 50, 1.5);
    },
    dial(c, x, y) {
      c.fillStyle = "#2a2c2e";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#b8b8b0";
      c.beginPath();
      c.arc(x + 64, y + 64, 56, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#2a2a2a";
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const l = i % 5 ? 8 : 16;
        c.save();
        c.translate(x + 64, y + 64);
        c.rotate(a);
        c.fillRect(-1, -54, 2, l);
        c.restore();
      }
      c.fillStyle = "#8a8a82";
      c.beginPath();
      c.arc(x + 64, y + 64, 24, 0, Math.PI * 2);
      c.fill();
    },
    vent(c, x, y) {
      grime(c, x, y, "#d8d8d0", 1, 51, 0.4);
      c.fillStyle = "rgba(15,15,15,0.85)";
      for (let i = 0; i < 6; i++)
        c.fillRect(x + 14, y + 16 + i * 17, CELL - 28, 7);
    },
    drawer(c, x, y) {
      grime(c, x, y, "#dcdcd4", 1, 52, 0.55);
      c.fillStyle = "#f0ecd8";
      c.fillRect(x + 44, y + 28, 40, 22);
      c.strokeStyle = "#6a6a60";
      c.lineWidth = 2;
      c.strokeRect(x + 44, y + 28, 40, 22);
      lines(c, x + 50, y + 34, 28, 12, 2, "rgba(30,30,30,0.6)", 3);
    },
    mail(c, x, y) {
      grime(c, x, y, "#2a4a8a", 1, 53, 0.45);
      c.fillStyle = "#f4f0e8";
      c.fillRect(x + 20, y + 30, 88, 40);
      text(c, "U.S. MAIL", x + 64, y + 50, 16, "#1a3a8a");
      c.fillStyle = "#c02020";
      c.fillRect(x + 20, y + 80, 88, 8);
    },
    register(c, x, y) {
      c.fillStyle = "#1a1a1a";
      c.fillRect(x, y, CELL, CELL);
      for (let r = 0; r < 4; r++)
        for (let q = 0; q < 5; q++) {
          c.fillStyle = (r + q) % 3 ? "#e8e0c8" : "#c83a2a";
          c.beginPath();
          c.arc(x + 18 + q * 23, y + 26 + r * 25, 8, 0, Math.PI * 2);
          c.fill();
        }
    },
    trash(c, x, y) {
      grime(c, x, y, "#6f746c", 1.8, 54, 0.5);
      rust(c, x, y, 55, 10);
      c.fillStyle = "rgba(20,20,20,0.35)";
      for (let i = 0; i < 8; i++) c.fillRect(x + i * 16 + 4, y, 4, CELL);
      text(c, "DSNY", x + 64, y + 60, 20, "rgba(250,250,250,0.85)");
    },
    spare9(c, x, y) {
      c.fillStyle = "#ffffff";
      c.fillRect(x, y, CELL, CELL);
    },
    stencil_no(c, x, y) {
      grime(c, x, y, "#e0dcd0", 1, 56, 0.45);
      text(c, "No. 7", x + 64, y + 64, 30, "rgba(30,30,30,0.85)", {
        font: '"Courier New", monospace',
      });
    },
    toolbox(c, x, y) {
      grime(c, x, y, "#a82818", 1.3, 57, 0.45);
      rust(c, x, y, 58, 6);
      text(c, "CRAFTSMAN", x + 64, y + 64, 14, "rgba(240,240,240,0.8)");
    },
    medallion(c, x, y) {
      c.fillStyle = "#6a4a20";
      c.fillRect(x, y, CELL, CELL);
      const g = c.createRadialGradient(x + 52, y + 50, 6, x + 64, y + 64, 58);
      g.addColorStop(0, "#f0c878");
      g.addColorStop(0.6, "#b07a30");
      g.addColorStop(1, "#6a4418");
      c.fillStyle = g;
      c.beginPath();
      c.arc(x + 64, y + 64, 56, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(70,40,10,0.8)";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(x + 64, y + 64, 40, 0, Math.PI * 2);
      c.stroke();
      c.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.ellipse(
          x + 64,
          y + 64,
          26,
          26 * Math.abs(Math.cos(i * 0.9)),
          0,
          0,
          Math.PI * 2,
        );
        c.stroke();
      }
      c.beginPath();
      c.moveTo(x + 38, y + 64);
      c.lineTo(x + 90, y + 64);
      c.stroke();
      text(c, "1964", x + 64, y + 112, 10, "rgba(70,40,10,0.9)");
    },
    teddy(c, x, y) {
      grime(c, x, y, "#e8d0b0", 2, 58, 0.3);
    },
    bloodpack(c, x, y) {
      c.fillStyle = "#8a0a0a";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#f0ece0";
      c.fillRect(x + 24, y + 24, 80, 50);
      text(c, "BLOOD", x + 64, y + 42, 14, "#8a0a0a");
      text(c, "TYPE O-", x + 64, y + 62, 12, "#2a2a2a");
    },
    goggles(c, x, y) {
      c.fillStyle = "#081016";
      c.fillRect(x, y, CELL, CELL);
      lines(c, x + 12, y + 16, 104, 96, 8, "rgba(207,238,250,0.75)", 7);
      c.strokeStyle = "rgba(150,220,240,0.6)";
      c.lineWidth = 2;
      c.strokeRect(x + 6, y + 6, CELL - 12, CELL - 12);
    },
    shade(c, x, y) {
      grime(c, x, y, "#cfd4cc", 1, 59, 0.4);
      c.fillStyle = "#2a2a2a";
      c.fillRect(x + 14, y + 52, CELL - 28, 30);
      text(c, "U.S. ARMY", x + 64, y + 36, 14, "#2a3a2a");
      text(c, "SHADE FIELD", x + 64, y + 67, 12, "#d8d8c8", { maxW: 96 });
      text(c, "XM-9", x + 64, y + 100, 12, "#2a3a2a");
    },
  };

  // ------------------------------------------------------------------
  // Skill-manual covers (original art and titles). One 128 px cell each.
  // ------------------------------------------------------------------
  /** Tiny pictograms drawn in a cover's art box (cx, cy centre, s = size). */
