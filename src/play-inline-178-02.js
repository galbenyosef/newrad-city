// play-inline-178 02 — fillstyle
// Lines 24-327 of readable/play-inline-178.pretty.js (statement-aligned).
  const K = G.PMID.kit,
    F = K.f,
    T = K.T;
  const PI = Math.PI,
    HP = PI / 2;

  function art() {
    // McKim, Mead & White's granite: two monumental storeys per 13.2 m, tall multi-light windows between Doric pilasters
    K.facade("penn_stone", {
      bays: 4,
      floors: 2,
      bayW: 3.3,
      floorH: 6.6,
      wall: "#c9b4a4",
      seed: 71,
      blocks: true,
      win: { x0: 0.25, x1: 0.75, y0: 0.1, y1: 0.84 },
      frame: "#2e2a26",
      glass: "#1c2426",
      broken: 0.5,
      boarded: 0.2,
      mullions: 2,
      sill: "#dccab8",
      lintel: true,
    });
    K.paint("penn_name", 1600, 140, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      K.fitText(
        x,
        "PENNSYLVANIA  STATION",
        w / 2,
        h / 2 + 4,
        w - 40,
        116,
        "bold ",
        "#2e241c",
        "#e8dccc",
        3,
      );
    });
    K.litPaint("penn_clockdial", 256, 256, (x, w) => {
      const c = w / 2;
      x.fillStyle = "#2a241e";
      x.fillRect(0, 0, w, w);
      x.fillStyle = "#e8e2d0";
      x.beginPath();
      x.arc(c, c, c - 6, 0, 7);
      x.fill();
      x.strokeStyle = "#2a241e";
      x.lineWidth = 4;
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * PI * 2,
          r0 = i % 5 ? c - 18 : c - 30;
        x.beginPath();
        x.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
        x.lineTo(c + Math.cos(a) * (c - 10), c + Math.sin(a) * (c - 10));
        x.stroke();
      }
      x.lineCap = "round";
      x.lineWidth = 9;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-HP + (9.78 / 12) * PI * 2) * 58,
        c + Math.sin(-HP + (9.78 / 12) * PI * 2) * 58,
      );
      x.stroke();
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-HP + (47 / 60) * PI * 2) * 92,
        c + Math.sin(-HP + (47 / 60) * PI * 2) * 92,
      );
      x.stroke();
      K.stains(x, w, w, 5, 72, 0.3);
    });
    // Diocletian window: daylight seen through grimy panes with lead cames (self-lit)
    K.litPaint("penn_thermal", 512, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#c8d0a0");
      g.addColorStop(1, "#8a9a6a");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      K.stains(x, w, h, 20, 73, 0.5, "60,70,40");
      x.strokeStyle = "#2a2a22";
      x.lineWidth = 3;
      for (let i = 0; i < w; i += 32) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i, h);
        x.stroke();
      }
      for (let j = 0; j < h; j += 40) {
        x.beginPath();
        x.moveTo(0, j);
        x.lineTo(w, j);
        x.stroke();
      }
      x.fillStyle = "#1a1c16";
      for (let i = 0; i < 16; i++)
        x.fillRect(((i * 157) % 16) * 32 + 2, ((i * 71) % 6) * 40 + 2, 28, 36); // missing panes
    });
    K.litPaint("penn_sky", 256, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#b8c490");
      g.addColorStop(1, "#94a070");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      K.stains(x, w, h, 12, 74, 0.45, "50,60,30");
      x.strokeStyle = "#1e201a";
      x.lineWidth = 4;
      x.strokeRect(0, 0, w, h);
      x.beginPath();
      x.moveTo(w / 2, 0);
      x.lineTo(w / 2, h);
      x.moveTo(0, h / 2);
      x.lineTo(w, h / 2);
      x.stroke();
    });
    K.litPaint("penn_board", 1024, 512, (x, w, h) => {
      x.fillStyle = "#0c0e10";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#e8e0c8";
      x.font = "bold 34px " + K.SANS;
      x.textAlign = "left";
      x.fillText("PENNSYLVANIA RAILROAD  —  DEPARTURES", 30, 52);
      x.fillStyle = "#8a8a80";
      x.fillRect(30, 66, w - 60, 3);
      const rows = [
        ["9:40", "THE BROADWAY LIMITED", "CHICAGO", "CANCELLED"],
        ["9:45", "THE CONGRESSIONAL", "WASHINGTON", "CANCELLED"],
        ["9:50", "KEYSTONE EXPRESS", "PHILADELPHIA", "BOARDING  TRK 3"],
        ["9:55", "THE SPIRIT OF ST. LOUIS", "ST. LOUIS", "CANCELLED"],
        [
          "10:05",
          "CIVIL DEFENSE EXTRA",
          "SHELTER TRAIN (CIVIL DEF.)",
          "SEE AGENT",
        ],
        ["10:10", "THE PAN-AMERICAN", "MIAMI", "—  —  —"],
      ];
      rows.forEach((r, i) => {
        const y = 110 + i * 62;
        x.fillStyle = "#1a1c1e";
        x.fillRect(24, y - 34, w - 48, 50);
        x.font = "bold 28px monospace";
        x.fillStyle = "#ffd060";
        x.fillText(r[0], 36, y);
        x.fillStyle = "#e8e8e0";
        x.fillText(r[1], 140, y);
        x.fillText(r[2], 560, y);
        x.fillStyle = r[3].indexOf("CANC") >= 0 ? "#ff5a3a" : "#6aff7a";
        x.fillText(r[3], 800, y);
      });
      x.fillStyle = "#ff5a3a";
      x.font = "bold 24px monospace";
      x.fillText(
        "*** CIVIL DEFENSE: PROCEED CALMLY TO NEAREST SHELTER ***",
        60,
        h - 20,
      );
    });
    const shops = [
      "NEWS · CIGARS",
      "DRUGS",
      "SHOE SHINE",
      "LUNCHEONETTE",
      "FLOWERS",
      "BARBER",
      "TRAVEL AGENT",
      "FIZZO COLA BAR",
    ];
    shops.forEach((t, i) =>
      K.paint("penn_shop" + i, 512, 96, (x, w, h) => {
        x.fillStyle = ["#1e3a2a", "#3a1e1a", "#1a2a3a", "#3a321a"][i % 4];
        x.fillRect(0, 0, w, h);
        x.strokeStyle = "#c8a860";
        x.lineWidth = 5;
        x.strokeRect(4, 4, w - 8, h - 8);
        K.fitText(x, t, w / 2, h / 2 + 2, w - 40, 56, "bold ", "#e8d8a8", null);
        K.weather(x, w, h, 80 + i, 1);
      }),
    );
    K.litPaint("penn_tracks", 512, 128, (x, w, h) => {
      x.fillStyle = "#12161a";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "TRACKS 1 · 2 · 3 · 4",
        w / 2,
        h / 2,
        w - 40,
        60,
        "bold ",
        "#f0e8d0",
        null,
      );
    });
    K.paint("penn_prr", 256, 256, (x, w) => {
      x.clearRect(0, 0, w, w);
      x.fillStyle = "#b8a060";
      x.beginPath();
      x.moveTo(w * 0.15, w * 0.1);
      x.lineTo(w * 0.85, w * 0.1);
      x.lineTo(w * 0.8, w * 0.55);
      x.lineTo(w * 0.5, w * 0.92);
      x.lineTo(w * 0.2, w * 0.55);
      x.closePath();
      x.fill();
      x.strokeStyle = "#3a2a10";
      x.lineWidth = 8;
      x.stroke();
      K.fitText(
        x,
        "PRR",
        w / 2,
        w * 0.45,
        w * 0.5,
        64,
        "bold ",
        "#3a2a10",
        null,
      );
    });
    K.paint("penn_coachside", 1024, 128, (x, w, h) => {
      x.fillStyle = "#5a2418";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#c8a860";
      x.fillRect(0, 10, w, 4);
      x.fillRect(0, h - 14, w, 4);
      K.fitText(
        x,
        "P E N N S Y L V A N I A",
        w / 2,
        h / 2 + 2,
        w * 0.7,
        54,
        "bold ",
        "#d8b868",
        null,
      );
      K.weather(x, w, h, 90, 1.4);
    });
  }

  // ------------------------------------------------------------------
  // EXTERIOR
  // ------------------------------------------------------------------
  function eagle(b, x, y, z, yaw, s) {
    const m = "limestone",
      tint = 0xb8aca0;
    b.box(m, x, y, z, 1.6 * s, 0.6 * s, 1.2 * s, { yaw, tint });
    b.geo(m, T.sphereLo, {
      x,
      y: y + 1.2 * s,
      z,
      sx: 0.5 * s,
      sy: 0.8 * s,
      sz: 0.45 * s,
      ry: yaw,
      tint,
    });
    const f = F.rot(x, z, yaw, 0, 0.35 * s);
    b.geo(m, T.sphereLo, {
      x: f[0],
      y: y + 2.05 * s,
      z: f[1],
      s: 0.26 * s,
      tint,
    });
    const bk = F.rot(x, z, yaw, 0, 0.62 * s);
    b.geo(m, T.cone4, {
      x: bk[0],
      y: y + 1.98 * s,
      z: bk[1],
      s: 0.1 * s,
      sy: 0.3 * s,
      rx: HP,
      ry: yaw,
      tint,
    });
    for (const sgn of [-1, 1]) {
      const a = F.rot(x, z, yaw, sgn * 0.3 * s, 0),
        w1 = F.rot(x, z, yaw, sgn * 1.9 * s, -0.2 * s),
        w2 = F.rot(x, z, yaw, sgn * 1.4 * s, -0.1 * s);
      b.quad(
        m,
        [a[0], y + 0.9 * s, a[1]],
        [w1[0], y + 1.6 * s, w1[1]],
        [w1[0], y + 2.9 * s, w1[1]],
        [a[0], y + 1.9 * s, a[1]],
        { tint, double: true, grime: 0.5 },
      );
      b.quad(
        m,
        [a[0], y + 0.7 * s, a[1]],
        [w2[0], y + 0.9 * s, w2[1]],
        [w1[0], y + 1.6 * s, w1[1]],
        [a[0], y + 0.9 * s, a[1]],
        { tint: 0xa89c90, double: true, grime: 0.5 },
      );
    }
  }
