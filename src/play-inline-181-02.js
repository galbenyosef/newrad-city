// play-inline-181 02 — fillstyle
// Lines 22-362 of readable/play-inline-181.pretty.js (statement-aligned).
  const K = G.PMID.kit,
    F = K.f,
    T = K.T;
  const PI = Math.PI,
    HP = PI / 2;

  function art() {
    K.facade("bv_brick", {
      bays: 4,
      floors: 6,
      bayW: 3.2,
      floorH: 3.4,
      wall: "#8a4a36",
      brick: true,
      seed: 111,
      win: { x0: 0.3, x1: 0.7, y0: 0.2, y1: 0.82 },
      frame: "#d8d0bc",
      glass: "#1e2624",
      broken: 0.4,
      boarded: 0.2,
      mullions: 1,
      sill: "#d8ccb0",
      lintel: true,
      deco: (x, W, H, fy, y0, fh, bw) => {
        x.strokeStyle = "rgba(30,30,30,0.85)";
        x.lineWidth = 2;
        for (let b2 = 0; b2 < 4; b2++)
          for (let k = 1; k < 5; k++) {
            const xx = b2 * bw + bw * (0.3 + (0.4 * k) / 5);
            x.beginPath();
            x.moveTo(xx, y0 + fh * 0.18);
            x.lineTo(xx, y0 + fh * 0.8);
            x.stroke();
          }
      },
    });
    K.paint("bv_gate", 1024, 200, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      x.strokeStyle = "#1c1c1a";
      x.lineWidth = 10;
      x.beginPath();
      x.arc(w / 2, h * 3.2, h * 3.0, PI * 1.36, PI * 1.64);
      x.stroke();
      x.lineWidth = 5;
      x.beginPath();
      x.arc(w / 2, h * 3.2, h * 2.62, PI * 1.36, PI * 1.64);
      x.stroke();
      x.save();
      x.font = "bold 60px " + K.FONT;
      x.fillStyle = "#1c1c1a";
      x.textAlign = "center";
      const text = "BELLEVUE  HOSPITAL",
        R = h * 2.82;
      const total = x.measureText(text).width,
        a0 = -HP - total / R / 2;
      let a = a0;
      for (const ch of text) {
        const cw = x.measureText(ch).width;
        a += cw / R / 2;
        x.save();
        x.translate(w / 2 + Math.cos(a) * R, h * 3.2 + Math.sin(a) * R);
        x.rotate(a + HP);
        x.fillText(ch, 0, 20);
        x.restore();
        a += cw / R / 2;
      }
      x.restore();
      K.fitText(
        x,
        "PSYCHIATRIC  DIVISION",
        w / 2,
        h * 0.84,
        w * 0.5,
        34,
        "bold ",
        "#1c1c1a",
        null,
      );
    });
    K.paint("bv_nohumies", 512, 160, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      x.save();
      x.rotate(-0.04);
      K.fitText(
        x,
        "NO HUMIES",
        w / 2,
        h / 2 + 10,
        w - 30,
        120,
        "bold ",
        "rgba(150,20,14,0.9)",
        null,
      );
      x.restore();
      for (let i = 0; i < 12; i++) {
        x.fillStyle = "rgba(140,20,14,0.8)";
        x.fillRect(40 + i * 38, h * 0.72, 4, 20 + ((i * 13) % 30));
      }
    });
    K.paint("bv_admit", 900, 140, (x, w, h) => {
      x.fillStyle = "#e8e4d8";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#1e3a2a";
      x.lineWidth = 8;
      x.strokeRect(6, 6, w - 12, h - 12);
      K.fitText(
        x,
        "PSYCHIATRIC  ADMISSIONS",
        w / 2,
        h / 2,
        w - 60,
        70,
        "bold ",
        "#1e3a2a",
        null,
      );
      K.weather(x, w, h, 112, 1);
    });
    K.paint("bv_wardsign", 512, 110, (x, w, h) => {
      x.fillStyle = "#1e3a2a";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "WARD A — MEN",
        w / 2,
        h / 2,
        w - 30,
        60,
        "bold ",
        "#e8e4d8",
        null,
      );
    });
    K.paint("bv_wardsignB", 512, 110, (x, w, h) => {
      x.fillStyle = "#1e3a2a";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "WARD B — ISOLATION",
        w / 2,
        h / 2,
        w - 30,
        54,
        "bold ",
        "#e8e4d8",
        null,
      );
    });
    K.paint("bv_theatre", 512, 110, (x, w, h) => {
      x.fillStyle = "#1e2a3a";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "SURGICAL AMPHITHEATRE",
        w / 2,
        h / 2,
        w - 30,
        46,
        "bold ",
        "#e8e4d8",
        null,
      );
    });
    K.paint("bv_morgue", 512, 110, (x, w, h) => {
      x.fillStyle = "#2a2a2a";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "MORGUE ↓  AUTHORIZED ONLY",
        w / 2,
        h / 2,
        w - 30,
        44,
        "bold ",
        "#e8e4d8",
        null,
      );
    });
    K.paint("bv_pharmacy", 256, 96, (x, w, h) => {
      x.fillStyle = "#e8e4d8";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "PHARMACY",
        w / 2,
        h / 2,
        w - 20,
        44,
        "bold ",
        "#8a1a14",
        null,
      );
    });
    K.paint("bv_kesslerhaas", 512, 256, (x, w, h) => {
      x.fillStyle = "#d8d4c8";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#e0b020";
      for (let i = -h; i < w; i += 40) {
        x.beginPath();
        x.moveTo(i, h);
        x.lineTo(i + 20, h);
        x.lineTo(i + 20 + h * 0.18, h - h * 0.18);
        x.lineTo(i + h * 0.18, h - h * 0.18);
        x.fill();
      }
      K.fitText(
        x,
        "KESSLER-HAAS",
        w / 2,
        h * 0.28,
        w - 60,
        70,
        "bold ",
        "#1e2a4a",
        null,
      );
      K.fitText(
        x,
        "RESEARCH ANNEX B — BIOHAZARD LEVEL 4",
        w / 2,
        h * 0.52,
        w - 40,
        26,
        "bold ",
        "#8a1a14",
        null,
      );
      K.fitText(
        x,
        "IN PARTNERSHIP WITH CIVIL DEFENSE",
        w / 2,
        h * 0.68,
        w - 60,
        22,
        "bold ",
        "#1e2a4a",
        null,
      );
      K.weather(x, w, h, 113, 0.8);
    });
    K.paint("bv_scrawl", 512, 512, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      x.fillStyle = "rgba(40,30,24,0.8)";
      x.font = '34px "Comic Sans MS", cursive';
      [
        "THEY ARE IN THE WATER",
        "the doctor says",
        "I am GETTING BETTER",
        "GREEN GREEN GREEN",
        "dont drink it",
        "count the tanks: 1 2 3 4 5 6 7",
      ].forEach((t, i) => {
        x.save();
        x.translate(30 + (i % 2) * 60, 60 + i * 72);
        x.rotate(((i % 3) - 1) * 0.08);
        x.fillText(t, 0, 0);
        x.restore();
      });
      for (let i = 0; i < 40; i++) {
        x.fillStyle = "rgba(40,30,24,0.8)";
        x.fillRect(360 + (i % 8) * 16, 420 + Math.floor(i / 8) * 16, 3, 12);
      }
    });
    K.litPaint("bv_xray", 512, 256, (x, w, h) => {
      x.fillStyle = "#c8dce8";
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 3; i++) {
        const ox = 20 + i * 165;
        x.fillStyle = "#101820";
        x.fillRect(ox, 16, 150, h - 32);
        x.strokeStyle = "#d8e4ec";
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(ox + 75, 40);
        x.lineTo(ox + 75, h - 40);
        x.stroke();
        for (let k = 0; k < 7; k++) {
          x.lineWidth = 4;
          x.beginPath();
          x.ellipse(
            ox + 75,
            70 + k * 20,
            50 - Math.abs(k - 3) * 4,
            8,
            0,
            0,
            PI,
          );
          x.stroke();
        }
        if (i === 2) {
          x.fillStyle = "rgba(120,255,120,0.6)";
          x.beginPath();
          x.arc(ox + 90, 110, 24, 0, 7);
          x.fill();
        }
      }
    });
    K.litPaint("bv_tank", 128, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "#1a6a2a");
      g.addColorStop(0.5, "#7aff8a");
      g.addColorStop(1, "#1a6a2a");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) {
        x.fillStyle = "rgba(220,255,220,0.5)";
        x.beginPath();
        x.arc((i * 37) % w, (i * 71) % h, 2 + (i % 4), 0, 7);
        x.fill();
      }
      x.fillStyle = "rgba(10,40,14,0.9)";
      x.beginPath();
      x.ellipse(w / 2, h * 0.45, w * 0.22, h * 0.2, 0, 0, 7);
      x.fill(); // silhouette inside
      x.beginPath();
      x.arc(w / 2, h * 0.2, w * 0.14, 0, 7);
      x.fill();
      x.fillRect(w * 0.3, h * 0.6, w * 0.12, h * 0.3);
      x.fillRect(w * 0.58, h * 0.6, w * 0.12, h * 0.3);
    });
    K.litPaint("bv_tank_empty", 128, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "#1a5a2a");
      g.addColorStop(0.5, "#6ae07a");
      g.addColorStop(1, "#1a5a2a");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) {
        x.fillStyle = "rgba(220,255,220,0.4)";
        x.beginPath();
        x.arc((i * 29) % w, (i * 53) % h, 1 + (i % 3), 0, 7);
        x.fill();
      }
    });
  }

  // ------------------------------------------------------------------
  // EXTERIOR
  // ------------------------------------------------------------------
