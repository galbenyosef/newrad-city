// play-inline-441 05 — fillstyle
// Lines 1289-1626 of readable/play-inline-441.pretty.js (statement-aligned).
  R("no_parking", 64, 96, (c, w, h, r) => {
    c.fillStyle = "#f0ece0";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#c01a1a";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(w / 2, 34, 22, 0, X.TAU);
    c.moveTo(w / 2 - 16, 18);
    c.lineTo(w / 2 + 16, 50);
    c.stroke();
    txt(c, "P", w / 2, 34, 24, "#111");
    txt(c, "NO PARKING", w / 2, 72, 9, "#c01a1a");
    txt(c, "ANY TIME", w / 2, 86, 9, "#111");
    weather(c, w, h, r, 0.8);
  });

  // ---------- terminals / electronics ----------
  R("term_screen", 160, 120, (c, w, h) => {
    c.fillStyle = "#120a02";
    c.fillRect(0, 0, w, h);
    const g = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, "rgba(255,170,60,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0.5)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    const lines = [
      "HALCYON TELEPRINTER 9",
      "OCD TELETYPE NET",
      "",
      "> READY",
      "> _",
    ];
    lines.forEach((l, i) =>
      txt(c, l, 8, 14 + i * 18, 15, "#ffb347", {
        font: F_MONO,
        weight: "normal",
        align: "left",
        maxW: w - 14,
      }),
    );
    for (let y = 0; y < h; y += 3) {
      c.fillStyle = "rgba(0,0,0,0.25)";
      c.fillRect(0, y, w, 1);
    }
  });
  // continuous-feed printout curling out of the teletype carriage (pale bars, typed lines)
  R("printout", 128, 192, (c, w, h, r) => {
    c.fillStyle = "#ece6d4";
    c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 24) {
      c.fillStyle = "rgba(200,170,120,0.25)";
      c.fillRect(0, y, w, 12);
    }
    c.fillStyle = "#bdb6a2";
    for (let y = 6; y < h; y += 12) {
      c.beginPath();
      c.arc(5, y, 2, 0, X.TAU);
      c.fill();
      c.beginPath();
      c.arc(w - 5, y, 2, 0, X.TAU);
      c.fill();
    }
    const L = [
      "OCD TELETYPE NET",
      "MSG 0412  PRIORITY",
      "TO: ALL STATIONS",
      "",
      "CONDITION RED",
      "REPEAT CONDITION",
      "RED. SEAL ALL",
      "SHELTERS. NO",
      "FURTHER TRAFFIC",
      "",
      "END END END",
    ];
    L.forEach((l, i) =>
      txt(c, l, 14, 12 + i * 16, 11, "#2a2620", {
        font: '"Courier New", monospace',
        weight: "bold",
        align: "left",
        maxW: w - 26,
      }),
    );
    weather(c, w, h, r, 0.5);
  });
  R("teletype_badge", 128, 28, (c, w, h, r) => {
    c.fillStyle = "#b8b09a";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#3a3628";
    c.lineWidth = 2;
    c.strokeRect(2, 2, w - 4, h - 4);
    txt(c, "HALCYON · OCD", w / 2, h / 2 + 1, 16, "#2a2620", {
      font: F_SERIF,
      maxW: w - 10,
    });
    weather(c, w, h, r, 0.5);
  });
  R("radio_dial", 128, 48, (c, w, h) => {
    c.fillStyle = "#e8d8a0";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#5a4a2a";
    for (let k = 0; k < 24; k++) {
      c.beginPath();
      c.moveTo(8 + k * 5, 26);
      c.lineTo(8 + k * 5, k % 4 ? 32 : 36);
      c.stroke();
    }
    txt(c, "55  70  90  110  140  170", w / 2, 14, 10, "#5a4a2a");
    c.fillStyle = "#c01a1a";
    c.fillRect(64, 20, 2, 22);
  });
  R("safe_dial", 64, 64, (c, w, h) => {
    c.fillStyle = "#3a3a38";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c8c4b8";
    c.beginPath();
    c.arc(w / 2, h / 2, 26, 0, X.TAU);
    c.fill();
    c.fillStyle = "#2a2a28";
    c.beginPath();
    c.arc(w / 2, h / 2, 14, 0, X.TAU);
    c.fill();
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * X.TAU;
      c.strokeStyle = "#222";
      c.beginPath();
      c.moveTo(w / 2 + Math.cos(a) * 18, h / 2 + Math.sin(a) * 18);
      c.lineTo(w / 2 + Math.cos(a) * 25, h / 2 + Math.sin(a) * 25);
      c.stroke();
    }
  });

  // ---------- hazard labels ----------
  R("rad_label", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#d8b020";
    c.fillRect(0, 0, w, h);
    trefoil(c, w / 2, 56, 36, null, "#1a1a1a");
    txt(c, "RADIOACTIVE", w / 2, 108, 15, "#1a1a1a");
    weather(c, w, h, r, 0.9);
  });
  R("flam_label", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#b81a14";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#f0ece0";
    c.beginPath();
    c.moveTo(w / 2, 20);
    c.quadraticCurveTo(w / 2 + 30, 50, w / 2 + 18, 80);
    c.quadraticCurveTo(w / 2, 92, w / 2 - 18, 80);
    c.quadraticCurveTo(w / 2 - 30, 50, w / 2, 20);
    c.fill();
    txt(c, "FLAMMABLE", w / 2, 108, 16, "#f0ece0");
    weather(c, w, h, r, 0.9);
  });
  R("firstaid", 64, 64, (c, w, h, r) => {
    c.fillStyle = "#ece8dc";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c01818";
    c.fillRect(24, 10, 16, 44);
    c.fillRect(10, 24, 44, 16);
    weather(c, w, h, r, 0.7);
  });
  R("ammo_stencil", 128, 64, (c, w, h, r) => {
    c.fillStyle = "#4e5838";
    c.fillRect(0, 0, w, h);
    stencil(c, "CARTRIDGES", w / 2, 20, 14, "#e8e0c0");
    stencil(c, "10MM · 5.56MM", w / 2, 40, 12, "#e8e0c0");
    c.fillStyle = "#e8c030";
    c.fillRect(8, 52, w - 16, 4);
    weather(c, w, h, r, 0.7);
  });
  R("fizzo_blue_label", 64, 128, (c, w, h) => {
    c.fillStyle = "#1a90d0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#fff";
    c.fillRect(4, 48, w - 8, 34);
    txt(c, "Fizzo", w / 2, 58, 13, "#c01018", { weight: "italic bold" });
    txt(c, "BLUE", w / 2, 74, 12, "#1a60a0");
  });
  R("longwinter_logo", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#d8d6cc";
    c.fillRect(0, 0, w, h);
    winterMark(c, w / 2, h / 2 - 10, 42, "#e0702a");
    txt(c, "CIVIL DEFENSE", w / 2, h - 14, 15, "#2a2a28", { maxW: w - 10 });
    weather(c, w, h, r, 0.4);
  });
  R("grate", 128, 128, (c, w, h) => {
    c.fillStyle = "#0a0a0a";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#5a5850";
    for (let x = 0; x < w; x += 10) c.fillRect(x, 0, 4, h);
    for (let y = 0; y < h; y += 32) c.fillRect(0, y, w, 4);
    c.strokeStyle = "#6a5a4a";
    c.lineWidth = 6;
    c.strokeRect(0, 0, w, h);
  });
  // yellowed, water-stained newsprint (kept dull so litter never reads as bright confetti)
  R("paper", 64, 64, (c, w, h, r) => {
    c.fillStyle = "#9a9078";
    c.fillRect(0, 0, w, h);
    // a sheet of The First Journal: masthead, rule, EXTRA! banner, columns
    txt(c, "THE FIRST JOURNAL", w / 2, 7, 7, "#2a2620", {
      font: F_SERIF,
      maxW: w - 8,
    });
    c.fillStyle = "rgba(40,36,30,0.7)";
    c.fillRect(4, 12, w - 8, 1);
    txt(c, "EXTRA!", w / 2, 18, 9, "#2a2620", { font: F_SERIF });
    for (let k = 0; k < 6; k++) {
      c.fillStyle = "rgba(40,36,30,0.55)";
      c.fillRect(6, 26 + k * 6, w - 12 - (k % 3) * 8, 2);
    }
    c.fillStyle = "rgba(60,50,40,0.5)";
    c.fillRect(8, 26, 18, 14); // photo
    for (let i = 0; i < 4; i++) {
      const g = c.createRadialGradient(
        r() * w,
        r() * h,
        1,
        r() * w,
        r() * h,
        10 + r() * 16,
      );
      g.addColorStop(0, "rgba(90,70,40,0.35)");
      g.addColorStop(1, "rgba(90,70,40,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    }
    weather(c, w, h, r, 1.0);
  });
  // ---------- grocery product labels (shop shelves) ----------
  const PRODUCTS = [
    ["FREEDOM", "FLAKES", "#1e3f86", "#f6eedc", "box"],
    ["CHOCOLATE", "ZEPPELIN", "#5a3420", "#e8e4dc", "box"],
    ["MAMA", "MARINARA'S", "#c42a1e", "#f6ead0", "can"],
    ["GOLDEN PLAIN", "JERKY", "#d8a838", "#4a2410", "box"],
    ["FRANKS &", "BEANS", "#8a3a1a", "#f0e0b0", "can"],
    ["FRANK-IN-", "A-BUN", "#c8281e", "#f0d040", "box"],
    ["HOMEGUARD", "CLEANSER", "#e8e4d8", "#1a3a6a", "can"],
    ["ASTRONAUT", "ICE CREAM", "#b8bcc4", "#1a2a5a", "box"],
    ["EMPIRE BREW", "LAGER", "#1a3a2a", "#e8c860", "can"],
  ];
  PRODUCTS.forEach((pd, i) =>
    R("prod_" + i, 48, 64, (c, w, h, r) => {
      c.fillStyle = pd[2];
      c.fillRect(0, 0, w, h);
      if (pd[4] === "can") {
        c.fillStyle = "rgba(255,255,255,0.18)";
        c.fillRect(0, 6, w, 3);
        c.fillRect(0, h - 9, w, 3);
      } else {
        c.fillStyle = "rgba(0,0,0,0.15)";
        c.fillRect(0, h - 14, w, 14);
        c.beginPath();
        c.fillStyle = "rgba(255,255,255,0.25)";
        c.arc(w * 0.7, h * 0.7, 9, 0, X.TAU);
        c.fill();
      }
      txt(c, pd[0], w / 2, 18, 12, pd[3], { maxW: w - 6 });
      if (pd[1]) txt(c, pd[1], w / 2, 34, 9, pd[3], { maxW: w - 6 });
      weather(c, w, h, r, 0.8);
    }),
  );
  X.PRODUCTS = PRODUCTS.map((p) => p[4]);
  // in-store signage
  R("sign_checkout", 192, 48, (c, w, h, r) => {
    c.fillStyle = "#b82a1e";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#f0e0c0";
    c.lineWidth = 3;
    c.strokeRect(4, 4, w - 8, h - 8);
    txt(c, "CHECKOUT", w / 2, h / 2 + 1, 28, "#f6ecd0");
    weather(c, w, h, r, 0.9);
  });
  R("sign_sale", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#f0d040";
    c.fillRect(0, 0, w, h);
    txt(c, "SALE!", w / 2, 30, 34, "#c01a14", {
      stroke: "#1a1a1a",
      strokeW: 2,
    });
    txt(c, "ATOMIC", w / 2, 60, 16, "#1a1a1a");
    txt(c, "SAVINGS", w / 2, 78, 16, "#1a1a1a");
    weather(c, w, h, r, 1, { torn: true });
  });
  R("sign_prices", 128, 96, (c, w, h, r) => {
    c.fillStyle = "#e8e0c8";
    c.fillRect(0, 0, w, h);
    txt(c, "TODAY'S PRICES", w / 2, 14, 12, "#8a1a10");
    [
      "JERKY ..... 15¢",
      "FREEDOM FLAKES 25¢",
      "FIZZO COLA .. 10¢",
      "CIGARETTES .. 20¢",
    ].forEach((l, i) =>
      txt(c, l, 8, 34 + i * 16, 11, "#222", {
        align: "left",
        font: F_MONO,
        weight: "normal",
        maxW: w - 14,
      }),
    );
    weather(c, w, h, r, 1);
  });
  R("sign_open", 96, 48, (c, w, h, r) => {
    c.fillStyle = "#1a1a1a";
    c.fillRect(0, 0, w, h);
    txt(c, "CLOSED", w / 2, h / 2, 24, "#e8e0d0");
    weather(c, w, h, r, 0.8);
  });

  // ---------- signs & boards ----------
  R("board_0", 128, 192, (c, w, h, r) => {
    c.fillStyle = "#1a2a1a";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#8a6a40";
    c.lineWidth = 10;
    c.strokeRect(0, 0, w, h);
    ["TODAY:", "MEATLOAF", "& JELL-O", "", "COFFEE 5¢", "OPEN 24H"].forEach(
      (l, i) =>
        txt(c, l, w / 2, 26 + i * 26, 18, "#e8e4d8", {
          font: F_SCRIPT,
          weight: "normal",
        }),
    );
    weather(c, w, h, r, 1);
  });
  R("board_1", 128, 192, (c, w, h, r) => {
    c.fillStyle = "#e0d8c0";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#6a4a2a";
    c.lineWidth = 10;
    c.strokeRect(0, 0, w, h);
    txt(c, "PUBLIC", w / 2, 40, 18, "#1a1a1a");
    txt(c, "SHELTER", w / 2, 64, 18, "#1a1a1a");
    trefoil(c, w / 2, 112, 28, "#e8c030", "#1a1a1a");
    txt(c, "→ DOWNSTAIRS", w / 2, 164, 13, "#8a1a10");
    weather(c, w, h, r, 1);
  });
