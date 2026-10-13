// play-inline-441 04 — fillstyle
// Lines 952-1288 of readable/play-inline-441.pretty.js (statement-aligned).
  function woodFace(c, w, h, r) {
    c.fillStyle = "#a88258";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      c.strokeStyle = "rgba(70,45,20," + (0.08 + r() * 0.12) + ")";
      c.beginPath();
      const y = r() * h;
      c.moveTo(0, y);
      c.lineTo(w, y + (r() - 0.5) * 6);
      c.stroke();
    }
    woodLines(c, w, h, r, "rgba(40,25,10,0.5)");
    c.strokeStyle = "rgba(50,32,15,0.9)";
    c.lineWidth = 10;
    c.strokeRect(5, 5, w - 10, h - 10);
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(8, 8);
    c.lineTo(w - 8, h - 8);
    c.stroke();
    c.fillStyle = "#b89268";
    c.fillRect(14, 14, w - 28, h - 28);
    for (let i = 0; i < 20; i++) {
      c.strokeStyle = "rgba(70,45,20," + (0.08 + r() * 0.12) + ")";
      c.beginPath();
      const y = 14 + r() * (h - 28);
      c.moveTo(14, y);
      c.lineTo(w - 14, y);
      c.stroke();
    }
  }

  // ---------- vehicle livery ----------
  R("plate", 64, 32, (c, w, h, r) => {
    c.fillStyle = "#e8c850";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#222";
    c.lineWidth = 2;
    c.strokeRect(2, 2, w - 4, h - 4);
    txt(c, "NEW YORK", w / 2, 8, 7, "#1a2a60");
    txt(c, 100 + ((r() * 899) | 0) + "-RAD", w / 2, 21, 12, "#1a2a60", {
      font: '"Courier New", monospace',
    });
    weather(c, w, h, r, 0.8);
  });
  /** Big Apple Motor Cab roundel: a red apple with a leaf on a cream disc. */
  function appleMark(ctx, cx, cy, rr) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "#f4ecd8";
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, X.TAU);
    ctx.fill();
    ctx.strokeStyle = "#151515";
    ctx.lineWidth = Math.max(1.5, rr * 0.1);
    ctx.stroke();
    const a = rr * 0.62;
    ctx.fillStyle = "#c8201a";
    ctx.beginPath();
    ctx.moveTo(0, -a * 0.55);
    ctx.bezierCurveTo(
      a * 0.6,
      -a * 1.0,
      a * 1.15,
      -a * 0.3,
      a * 0.85,
      a * 0.45,
    );
    ctx.bezierCurveTo(a * 0.65, a * 1.0, a * 0.2, a * 1.0, 0, a * 0.85);
    ctx.bezierCurveTo(
      -a * 0.2,
      a * 1.0,
      -a * 0.65,
      a * 1.0,
      -a * 0.85,
      a * 0.45,
    );
    ctx.bezierCurveTo(-a * 1.15, -a * 0.3, -a * 0.6, -a * 1.0, 0, -a * 0.55);
    ctx.fill();
    ctx.strokeStyle = "#4a2a10";
    ctx.lineWidth = Math.max(1, rr * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -a * 0.5);
    ctx.lineTo(a * 0.1, -a * 0.95);
    ctx.stroke();
    ctx.fillStyle = "#3a8a2a";
    ctx.beginPath();
    ctx.ellipse(a * 0.35, -a * 0.85, a * 0.28, a * 0.12, -0.5, 0, X.TAU);
    ctx.fill();
    ctx.restore();
  }
  // Big Apple Motor Cab: roof sign, door panel and the checker stripe
  R("taxi_sign", 128, 48, (c, w, h, r) => {
    c.fillStyle = "#e8c030";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#151515";
    c.lineWidth = 3;
    c.strokeRect(2, 2, w - 4, h - 4);
    appleMark(c, 22, h / 2, 16);
    txt(c, "BIG APPLE", 82, h / 2 + 1, 22, "#111", { maxW: 80 });
    weather(c, w, h, r, 0.8);
  });
  R("taxi_door", 256, 60, (c, w, h, r) => {
    c.fillStyle = "#e0b020";
    c.fillRect(0, 0, w, h);
    appleMark(c, 30, h / 2, 24);
    txt(c, "BIG APPLE MOTOR CAB", 150, 20, 20, "#151515", { maxW: 186 });
    txt(c, "Just get in already!", 150, 44, 16, "#8a1a10", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: 180,
    });
    weather(c, w, h, r, 0.6);
  });
  R("taxi_stripe", 256, 32, (c, w, h) => {
    c.fillStyle = "#e0b828";
    c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16)
      for (let y = 0; y < 2; y++) {
        if ((x / 16 + y) % 2) {
          c.fillStyle = "#151515";
          c.fillRect(x, 6 + y * 10, 16, 10);
        }
      }
  });
  R("police_door", 256, 96, (c, w, h, r) => {
    c.fillStyle = "#f0ece0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#1a2a50";
    c.beginPath();
    c.moveTo(20, 10);
    c.lineTo(60, 10);
    c.lineTo(60, 60);
    c.quadraticCurveTo(40, 86, 20, 60);
    c.closePath();
    c.fill();
    txt(c, "★", 40, 36, 24, "#e8c040");
    txt(c, "POLICE", 158, 40, 40, "#1a2a50");
    txt(c, "N.Y.P.D.  CAR 467", 158, 76, 14, "#1a2a50");
    weather(c, w, h, r, 0.7);
  });
  R("fizzo_truck", 512, 160, (c, w, h, r) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#d01a20");
    g.addColorStop(1, "#8a1014");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#f4ecd8";
    c.beginPath();
    c.moveTo(0, 110);
    c.bezierCurveTo(150, 60, 330, 170, w, 100);
    c.lineTo(w, 130);
    c.bezierCurveTo(330, 190, 150, 90, 0, 140);
    c.fill();
    fizzoMark(c, 200, 58, 80, "#fff", { stroke: "#5a0808", strokeW: 5 });
    fizzoBottle(c, 448, 70, 0.95, "#3a0c08");
    txt(
      c,
      "DELIVERY · REACH FOR AN ICE COLD FIZZO!",
      w / 2,
      150,
      14,
      "#fff4d8",
      { maxW: w - 30 },
    );
    weather(c, w, h, r, 0.9);
  });
  R("bus_ad_0", 512, 96, (c, w, h, r) => {
    c.fillStyle = "#dcdad0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#e0702a";
    c.fillRect(0, 0, w, 10);
    c.fillRect(0, h - 10, w, 10);
    winterMark(c, 52, h / 2, 34, "#e0702a");
    txt(c, "CIVIL DEFENSE ENROLMENT", 290, 38, 36, "#2a2a28", { maxW: 400 });
    txt(
      c,
      "Know your shelter. Carry your card.  — Office of Civil Defense",
      290,
      70,
      15,
      "#5a3a1a",
      { maxW: 400 },
    );
    weather(c, w, h, r, 0.9);
  });
  R("bus_ad_1", 512, 96, (c, w, h, r) => {
    c.fillStyle = "#ead8a8";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#7a3a18";
    c.fillRect(0, 0, 150, h);
    txt(c, "Prairie", 75, 38, 40, "#f4e4b8", { font: F_SCRIPT });
    txt(c, "ROOT BEER", 75, 74, 18, "#f4e4b8");
    txt(c, "OLD-TIME FLAVOR, POURED COLD.", 330, 48, 20, "#5a2a10", {
      maxW: 340,
    });
    weather(c, w, h, r, 0.9);
  });
  R("bus_ad_2", 512, 96, (c, w, h, r) => {
    c.fillStyle = "#f0e8d0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#2a4a6a";
    c.fillRect(0, 0, 150, h);
    txt(c, "HALCYON", 75, 46, 30, "#ffd890");
    txt(c, "TELEPRINTERS — EVERY OFFICE ON THE WIRE", 330, 36, 16, "#222", {
      maxW: 340,
    });
    txt(c, "Clack, clack, connected. Ask your dealer.", 330, 66, 14, "#555", {
      maxW: 340,
    });
    weather(c, w, h, r, 0.9);
  });
  R("bus_ad_3", 512, 96, (c, w, h, r) => {
    // Liberty Jetliner
    c.fillStyle = "#f2eee2";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#1c2f5c";
    c.fillRect(0, 0, 160, h);
    c.fillStyle = "#b8261c";
    c.fillRect(160, h - 14, w - 160, 6);
    c.fillRect(160, h - 24, w - 160, 4);
    c.save();
    c.translate(80, 34);
    c.fillStyle = "#f2eee2";
    c.fillRect(-46, -4, 92, 8);
    c.beginPath();
    c.moveTo(-8, 0);
    c.lineTo(12, -24);
    c.lineTo(20, -24);
    c.lineTo(12, 0);
    c.lineTo(20, 24);
    c.lineTo(12, 24);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(-46, 0);
    c.lineTo(-52, -14);
    c.lineTo(-44, -14);
    c.lineTo(-36, 0);
    c.fill();
    c.restore();
    txt(c, "LIBERTY JETLINER", 80, 74, 17, "#f2eee2", { maxW: 148 });
    txt(c, "Fly the flag. Fly Liberty.", 336, 36, 30, "#1c2f5c", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: 330,
    });
    txt(
      c,
      "NONSTOP JET SERVICE · IDLEWILD TO THE WORLD",
      336,
      64,
      13,
      "#3a3a3a",
      { maxW: 330 },
    );
    weather(c, w, h, r, 0.9);
  });
  R("bus_ad_4", 512, 96, (c, w, h, r) => {
    // Silver Torch cigarettes
    const g = c.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "#1a2a3a");
    g.addColorStop(1, "#3a4a5a");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.save();
    c.translate(56, h / 2);
    c.fillStyle = "#c8ccd0";
    c.fillRect(-6, -8, 12, 40);
    c.fillStyle = "#9aa0a8";
    c.fillRect(-12, -14, 24, 8);
    c.fillStyle = "#ffd070";
    c.beginPath();
    c.moveTo(0, -40);
    c.quadraticCurveTo(14, -24, 8, -14);
    c.lineTo(-8, -14);
    c.quadraticCurveTo(-14, -24, 0, -40);
    c.fill();
    c.restore();
    txt(c, "SILVER TORCH", 270, 36, 36, "#e8eaee", {
      maxW: 360,
      stroke: "rgba(0,0,0,0.4)",
    });
    txt(c, "Light up like the lady in the harbor.", 270, 70, 18, "#d8c890", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: 360,
    });
    weather(c, w, h, r, 0.9);
  });
  X.BUS_ADS = 5;
  R("bus_dest", 256, 40, (c, w, h) => {
    c.fillStyle = "#111";
    c.fillRect(0, 0, w, h);
    txt(c, "M42  CROSSTOWN", w / 2, h / 2, 24, "#f0c040", {
      font: F_MONO,
      weight: "normal",
    });
  });

  // ---------- street furniture faces ----------
  R("mailbox", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#23457a";
    c.fillRect(0, 0, w, h);
    txt(c, "U.S. MAIL", w / 2, 24, 22, "#f0ece0");
    c.fillStyle = "#f0ece0";
    c.beginPath();
    c.moveTo(w / 2, 44);
    c.lineTo(w / 2 + 26, 62);
    c.lineTo(w / 2 + 16, 92);
    c.lineTo(w / 2 - 16, 92);
    c.lineTo(w / 2 - 26, 62);
    c.closePath();
    c.fill();
    c.fillStyle = "#23457a";
    c.beginPath();
    c.arc(w / 2, 68, 8, 0, X.TAU);
    c.fill();
    txt(c, "POSTAL SERVICE", w / 2, 110, 11, "#f0ece0");
    weather(c, w, h, r, 0.9);
  });
  R("phone_sign", 256, 40, (c, w, h, r) => {
    c.fillStyle = "#e8e0cc";
    c.fillRect(0, 0, w, h);
    txt(c, "PUBLIC TELEPHONE", w / 2, h / 2, 24, "#1a3a8a");
    weather(c, w, h, r, 0.7);
  });
  R("bus_stop", 96, 128, (c, w, h, r) => {
    c.fillStyle = "#f0ece0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#1a4a9a";
    c.fillRect(0, 0, w, 44);
    txt(c, "BUS", w / 2, 22, 28, "#fff");
    txt(c, "STOP", w / 2, 66, 26, "#1a4a9a");
    txt(c, "M42 · M5", w / 2, 100, 16, "#222");
    weather(c, w, h, r, 0.8);
  });
