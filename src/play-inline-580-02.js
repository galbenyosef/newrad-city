// play-inline-580 02 — txt
// Lines 346-560 of readable/play-inline-580.pretty.js (statement-aligned).
  function posterTex(kind) {
    return canvasTex(256, 384, (x, w, h) => {
      const txt = (t, y, size, col, font) => {
        x.fillStyle = col;
        x.font = (font || "bold ") + size + 'px "Courier New", monospace';
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText(t, w / 2, y, w - 20);
      };
      if (kind === "lw" || kind === "crew") {
        x.fillStyle = "#dfe3e2";
        x.fillRect(0, 0, w, h);
        x.fillStyle = "#d8641e";
        x.fillRect(0, 0, w, 54);
        x.fillRect(0, h - 40, w, 40);
        txt("PROJECT", 20, 18, "#f4f4f0");
        txt("LONG WINTER", 40, 22, "#f4f4f0");
        x.strokeStyle = "#3a4a52";
        x.lineWidth = 6;
        x.lineCap = "round";
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          x.beginPath();
          x.moveTo(w / 2, 150);
          x.lineTo(w / 2 + Math.sin(a) * 62, 150 - Math.cos(a) * 62);
          x.stroke();
        }
        x.fillStyle = "#d8641e";
        x.beginPath();
        x.arc(w / 2, 150, 16, 0, 7);
        x.fill();
        if (kind === "lw") {
          txt("SLEEP TODAY.", 250, 24, "#1c1c1a");
          txt("WAKE TO TOMORROW.", 282, 20, "#1c1c1a");
          txt("A civil-service volunteer program", 322, 11, "#3a3a38", "");
        } else {
          txt("WATCH CREW:", 246, 24, "#1c1c1a");
          txt("CHECK THE SEALS", 278, 20, "#1c1c1a");
          txt("EVERY SHIFT · EVERY POD", 310, 14, "#3a3a38");
        }
        txt("OFFICE OF CIVIL DEFENSE", h - 20, 13, "#f4f4f0");
      } else if (kind === "ocd") {
        x.fillStyle = "#e8e2cc";
        x.fillRect(0, 0, w, h);
        x.fillStyle = "#1c1c1a";
        x.fillRect(14, 14, w - 28, 70);
        txt("KNOW YOUR", 36, 22, "#e8e2cc");
        txt("SHELTER", 66, 30, "#e8e2cc");
        x.strokeStyle = "#1c1c1a";
        x.lineWidth = 5;
        x.strokeRect(70, 110, 116, 116);
        x.beginPath();
        x.moveTo(70, 168);
        x.lineTo(186, 168);
        x.moveTo(128, 110);
        x.lineTo(128, 226);
        x.stroke();
        x.fillStyle = "#c4561a";
        x.beginPath();
        x.moveTo(128, 120);
        x.lineTo(176, 208);
        x.lineTo(80, 208);
        x.closePath();
        x.fill();
        txt("1. GO DOWN", 262, 17, "#1c1c1a");
        txt("2. STAY DOWN", 288, 17, "#1c1c1a");
        txt("3. WAIT FOR THE ALL-CLEAR", 314, 13, "#1c1c1a");
        txt("O.C.D. BULLETIN 14 — 1966", h - 24, 11, "#5a5048");
      } else if (kind === "fizzo") {
        x.fillStyle = "#b8241c";
        x.fillRect(0, 0, w, h);
        x.fillStyle = "#f4f0e6";
        for (let i = 0; i < 9; i++) x.fillRect(0, 120 + i * 26, w, 6);
        // the tall ribbed bottle
        x.fillStyle = "#2a1a14";
        x.beginPath();
        x.moveTo(118, 70);
        x.lineTo(138, 70);
        x.lineTo(140, 120);
        x.quadraticCurveTo(162, 150, 158, 200);
        x.lineTo(160, 320);
        x.lineTo(96, 320);
        x.lineTo(98, 200);
        x.quadraticCurveTo(94, 150, 116, 120);
        x.closePath();
        x.fill();
        x.strokeStyle = "rgba(255,255,255,0.35)";
        x.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
          x.beginPath();
          x.moveTo(104 + i * 10, 210);
          x.lineTo(104 + i * 10, 312);
          x.stroke();
        }
        x.fillStyle = "#f4f0e6";
        x.fillRect(102, 236, 52, 30);
        txt("FIZZO", 251, 14, "#b8241c");
        txt("FIZZO COLA", 34, 30, "#f4f0e6");
        txt("THE TALL COOL ONE", h - 30, 16, "#f4f0e6");
      } else {
        x.fillStyle = "#e8c860";
        x.fillRect(0, 0, w, h);
        // Super Sergeant (Bowery Comics): his steel helmet over the triple-chevron insignia
        x.fillStyle = "#1c3a6a";
        x.fillRect(0, 0, w, 64);
        txt("SUPER", 22, 22, "#f4f0e6");
        txt("SERGEANT", 48, 26, "#e84a2a");
        x.fillStyle = "#5e6e3a";
        x.beginPath();
        x.arc(128, 150, 62, Math.PI, 0);
        x.lineTo(196, 158);
        x.lineTo(60, 158);
        x.closePath();
        x.fill();
        x.fillStyle = "#3e4a26";
        x.fillRect(56, 152, 144, 10);
        x.fillStyle = "#f2c43a";
        x.beginPath();
        x.arc(128, 212, 44, 0, 7);
        x.fill();
        x.strokeStyle = "#b8241c";
        x.lineWidth = 10;
        x.lineCap = "round";
        x.lineJoin = "round";
        for (let i = 0; i < 3; i++) {
          x.beginPath();
          x.moveTo(100, 206 + i * 15);
          x.lineTo(128, 187 + i * 15);
          x.lineTo(156, 206 + i * 15);
          x.stroke();
        }
        x.strokeStyle = "#f2c43a";
        x.lineWidth = 6;
        for (let i = 0; i < 2; i++) {
          x.beginPath();
          x.moveTo(108, 126 + i * 12);
          x.lineTo(128, 112 + i * 12);
          x.lineTo(148, 126 + i * 12);
          x.stroke();
        }
        txt("AMERICA'S FINEST FIGHTING MAN!", 274, 11, "#1c1c1a");
        txt("#12 — OPERATION DEEP FREEZE", 300, 12, "#1c1c1a");
        txt("BOWERY COMICS · 12¢", 340, 16, "#1c1c1a");
      }
      for (let i = 0; i < 120; i++) {
        x.fillStyle = "rgba(60,50,30," + (rnd() * 0.12).toFixed(2) + ")";
        x.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 20, 1 + rnd() * 8);
      }
    });
  }
  /** A child's crayon drawing taped to the quarters wall: a family, the sun, and the word HOME. */
  function drawingTex() {
    return canvasTex(256, 256, (x) => {
      x.fillStyle = "#ece6d4";
      x.fillRect(8, 8, 240, 240);
      x.lineWidth = 4;
      x.lineCap = "round";
      x.strokeStyle = "#e0a020";
      x.beginPath();
      x.arc(200, 54, 22, 0, 7);
      x.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        x.beginPath();
        x.moveTo(200 + Math.cos(a) * 28, 54 + Math.sin(a) * 28);
        x.lineTo(200 + Math.cos(a) * 40, 54 + Math.sin(a) * 40);
        x.stroke();
      }
      const fig = (fx, s, col) => {
        x.strokeStyle = col;
        x.beginPath();
        x.arc(fx, 150 - 30 * s, 10 * s, 0, 7);
        x.moveTo(fx, 160 - 20 * s);
        x.lineTo(fx, 190);
        x.moveTo(fx - 14 * s, 172 - 10 * s);
        x.lineTo(fx + 14 * s, 172 - 10 * s);
        x.moveTo(fx, 190);
        x.lineTo(fx - 10, 214);
        x.moveTo(fx, 190);
        x.lineTo(fx + 10, 214);
        x.stroke();
      };
      fig(60, 1.2, "#c4561a");
      fig(104, 1.15, "#3a6a9a");
      fig(140, 0.8, "#7a3a8a");
      fig(170, 0.7, "#2a7a3a");
      x.fillStyle = "#c4261a";
      x.font = 'bold 34px "Comic Sans MS", "Courier New", monospace';
      x.textAlign = "center";
      x.fillText("HOME", 110, 60);
      x.fillStyle = "#5a5048";
      x.font = '14px "Courier New", monospace';
      x.fillText("by Lulu B. (age 6)", 128, 238);
    });
  }
  /** Checkers board / clock face / fuse panel / gauge board labels. */
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const D = (QX.c4dress = {
    rings: [],
    debris: [],
    waterMat: null,
    scumMat: null,
    scum: [],
    normal: null,
  });

