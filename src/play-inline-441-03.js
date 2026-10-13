// play-inline-441 03 — fillstyle
// Lines 631-951 of readable/play-inline-441.pretty.js (statement-aligned).
  R("poster_automaton", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#dfe6e8");
    c.fillStyle = "#1a3a4a";
    c.fillRect(0, 0, w, 30);
    txt(c, "AMERICAN AUTOMATON CO.", w / 2, 16, 12, "#f0ead8", {
      maxW: w - 24,
    });
    // the household robot: square head with a lamp visor on a column body, two jointed arms carrying a tray, wheeled base
    const cx = w / 2;
    c.fillStyle = "#8a9498";
    c.strokeStyle = "#2a3034";
    c.lineWidth = 3;
    c.fillRect(cx - 22, 44, 44, 32);
    c.strokeRect(cx - 22, 44, 44, 32);
    c.fillStyle = "#ffd890";
    c.fillRect(cx - 16, 54, 32, 8);
    c.fillStyle = "#b8c0c4";
    c.fillRect(cx - 28, 82, 56, 80);
    c.strokeRect(cx - 28, 82, 56, 80);
    c.fillStyle = "#2a3034";
    for (let i = 0; i < 4; i++) c.fillRect(cx - 18, 94 + i * 10, 36, 3);
    c.beginPath();
    c.moveTo(cx - 28, 94);
    c.lineTo(cx - 52, 120);
    c.lineTo(cx - 30, 140);
    c.moveTo(cx + 28, 94);
    c.lineTo(cx + 52, 120);
    c.lineTo(cx + 30, 140);
    c.stroke();
    c.fillStyle = "#d8d4c8";
    c.fillRect(cx - 40, 136, 80, 6);
    c.strokeRect(cx - 40, 136, 80, 6);
    c.fillStyle = "#5a6064";
    c.fillRect(cx - 34, 162, 68, 18);
    c.fillStyle = "#1a1a18";
    for (const dx of [-24, 0, 24]) {
      c.beginPath();
      c.arc(cx + dx, 186, 8, 0, X.TAU);
      c.fill();
    }
    txt(c, "THE VALET", w / 2, 212, 28, "#1a3a4a", { maxW: w - 20 });
    txt(c, "Built in America, to serve America.", w / 2, 236, 13, "#8a2a1a", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: w - 20,
    });
    txt(
      c,
      "It keeps the house. You keep the evening.",
      w / 2,
      256,
      10,
      "#2a3a44",
      { font: F_SERIF, weight: "italic", maxW: w - 76 },
    );
    weather(c, w, h, r, 0.8, { torn: true });
  });
  // Super Sergeant (Bowery Comics): a square-jawed sergeant in olive drab, steel helmet and sleeve chevrons
  R("poster_sergeant", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#f0d040");
    // speed lines behind the hero
    c.save();
    c.strokeStyle = "rgba(200,40,30,0.35)";
    c.lineWidth = 3;
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * X.TAU;
      c.beginPath();
      c.moveTo(w / 2 + Math.cos(a) * 30, 140 + Math.sin(a) * 30);
      c.lineTo(w / 2 + Math.cos(a) * 160, 140 + Math.sin(a) * 160);
      c.stroke();
    }
    c.restore();
    c.fillStyle = "#b8261c";
    c.fillRect(0, 0, w, 56);
    txt(c, "SUPER", w / 2, 16, 16, "#fff4d8", {
      stroke: "#4a0a06",
      maxW: w - 20,
    });
    txt(c, "SERGEANT", w / 2, 40, 30, "#fff4d8", {
      stroke: "#4a0a06",
      maxW: w - 16,
    });
    const cx = w / 2;
    // shoulders and chest in olive drab, a sleeve with three chevrons on each side
    c.fillStyle = "#5a6234";
    c.beginPath();
    c.moveTo(cx - 70, 206);
    c.quadraticCurveTo(cx - 66, 160, cx - 26, 152);
    c.lineTo(cx + 26, 152);
    c.quadraticCurveTo(cx + 66, 160, cx + 70, 206);
    c.closePath();
    c.fill();
    c.strokeStyle = "#2e3218";
    c.lineWidth = 2;
    c.stroke();
    c.strokeStyle = "#e8c040";
    c.lineWidth = 3;
    for (const s of [-1, 1])
      for (let k = 0; k < 3; k++) {
        const y = 168 + k * 7;
        c.beginPath();
        c.moveTo(cx + s * 44, y);
        c.lineTo(cx + s * 53, y + 7);
        c.lineTo(cx + s * 62, y);
        c.stroke();
      }
    c.fillStyle = "#4a5028";
    c.fillRect(cx - 8, 152, 16, 24); // collar
    // the head: a broad square jaw
    c.fillStyle = "#e0a878";
    c.beginPath();
    c.moveTo(cx - 26, 100);
    c.lineTo(cx + 26, 100);
    c.lineTo(cx + 25, 136);
    c.lineTo(cx + 15, 152);
    c.lineTo(cx - 15, 152);
    c.lineTo(cx - 25, 136);
    c.closePath();
    c.fill();
    c.strokeStyle = "#5a2a14";
    c.lineWidth = 2;
    c.stroke();
    c.fillStyle = "#2a1a10";
    c.fillRect(cx - 15, 114, 9, 3);
    c.fillRect(cx + 6, 114, 9, 3); // eyes under a set brow
    c.fillRect(cx - 17, 108, 13, 3);
    c.fillRect(cx + 4, 108, 13, 3);
    c.beginPath();
    c.moveTo(cx, 117);
    c.lineTo(cx - 3, 130);
    c.lineTo(cx + 2, 130);
    c.stroke(); // nose
    c.fillRect(cx - 9, 139, 18, 2); // firm mouth
    c.beginPath();
    c.moveTo(cx - 2, 146);
    c.lineTo(cx + 2, 146);
    c.stroke(); // cleft chin
    // steel helmet with a brim and chin strap
    c.fillStyle = "#626a3a";
    c.beginPath();
    c.ellipse(cx, 102, 34, 30, 0, Math.PI, 0);
    c.fill();
    c.fillStyle = "#4e5530";
    c.beginPath();
    c.ellipse(cx, 102, 40, 6, 0, 0, X.TAU);
    c.fill();
    c.strokeStyle = "#3a3018";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx - 27, 104);
    c.lineTo(cx - 20, 144);
    c.moveTo(cx + 27, 104);
    c.lineTo(cx + 20, 144);
    c.stroke();
    txt(c, "America's finest fighting man!", w / 2, 226, 14, "#b8261c", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: w - 16,
    });
    c.fillStyle = "#1a1a18";
    c.fillRect(0, 244, w, 44);
    txt(c, "BOWERY COMICS · 12¢", w / 2, 264, 14, "#f0d040", { maxW: w - 20 });
    weather(c, w, h, r, 0.9, { torn: true });
  });
  // civic poster: the peaceful atom (cooling tower under a rising sun)
  R("poster_atom", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#1a2a3a");
    c.fillStyle = "#ffb040";
    c.beginPath();
    c.arc(w / 2, 130, 46, Math.PI, 0);
    c.fill();
    rays(c, w / 2, 130, 12, 120, "rgba(255,200,90,0.15)");
    c.fillStyle = "#c8ccd0";
    c.beginPath();
    c.moveTo(w / 2 - 44, 190);
    c.quadraticCurveTo(w / 2 - 24, 140, w / 2 - 30, 96);
    c.lineTo(w / 2 + 30, 96);
    c.quadraticCurveTo(w / 2 + 24, 140, w / 2 + 44, 190);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(240,240,240,0.7)";
    c.beginPath();
    c.ellipse(w / 2 + 6, 84, 30, 12, 0, 0, X.TAU);
    c.fill();
    c.fillStyle = "#0e1822";
    c.fillRect(0, 186, w, 6);
    txt(c, "THE PEACEFUL ATOM", w / 2, 212, 19, "#ffd040", { maxW: w - 20 });
    txt(c, "Power for a growing city", w / 2, 238, 14, "#e8e0d0", {
      font: F_SCRIPT,
      weight: "normal",
    });
    txt(c, "CITY OF NEW YORK · 1966", w / 2, 264, 11, "#8ad0ff", {
      maxW: w - 20,
    });
    weather(c, w, h, r, 0.8, { torn: true });
  });
  // Freedom Flakes cereal (Brooklyn Sugar Works)
  R("poster_flakes", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#1e3f86");
    rays(c, w / 2, 150, 16, 170, "rgba(255,255,255,0.08)");
    // the box: red-and-white striped top band over a cream panel
    c.fillStyle = "#f6eedc";
    c.fillRect(46, 52, w - 92, 132);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = i % 2 ? "#f6eedc" : "#c42a22";
      c.fillRect(46, 52 + i * 5, w - 92, 5);
    }
    txt(c, "FREEDOM", w / 2, 98, 18, "#1e3f86", { maxW: w - 104 });
    txt(c, "FLAKES", w / 2, 118, 18, "#c42a22", { maxW: w - 104 });
    // a bowl of golden flakes
    c.fillStyle = "#e8e4d8";
    c.beginPath();
    c.ellipse(w / 2, 156, 36, 16, 0, 0, Math.PI);
    c.fill();
    for (let i = 0; i < 14; i++) {
      c.save();
      c.translate(
        w / 2 - 28 + (i % 7) * 9.5,
        150 - ((i / 7) | 0) * 6 + Math.sin(i * 1.7) * 2,
      );
      c.rotate(i * 0.9);
      c.fillStyle = ["#e8a848", "#d89030", "#f0c060"][i % 3];
      c.beginPath();
      c.ellipse(0, 0, 6, 3.5, 0, 0, X.TAU);
      c.fill();
      c.restore();
    }
    txt(c, "FREEDOM FLAKES", w / 2, 28, 24, "#fff4d8", {
      stroke: "#7a1410",
      maxW: w - 16,
    });
    txt(c, "The breakfast of a free nation.", w / 2, 214, 15, "#fff", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: w - 16,
    });
    txt(c, "Toasted golden in Brooklyn", w / 2, 240, 12, "#e0ecff", {
      maxW: w - 20,
    });
    txt(c, "BROOKLYN SUGAR WORKS", w / 2, 262, 10, "#f0d040", { maxW: w - 20 });
    weather(c, w, h, r, 0.8, { torn: true });
  });
  R("poster_protest", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#e8e4dc");
    c.fillStyle = "#111";
    txt(c, "NO MORE", w / 2, 60, 38, "#111", { font: F_SERIF });
    txt(c, "WAR!", w / 2, 120, 64, "#a01010", { font: F_SERIF });
    c.strokeStyle = "#111";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(w / 2, 200, 40, 0, X.TAU);
    c.moveTo(w / 2, 160);
    c.lineTo(w / 2, 240);
    c.moveTo(w / 2, 200);
    c.lineTo(w / 2 - 28, 228);
    c.moveTo(w / 2, 200);
    c.lineTo(w / 2 + 28, 228);
    c.stroke();
    txt(c, "RALLY · CITY HALL · SUNDAY", w / 2, 266, 11, "#111");
    weather(c, w, h, r, 1.0, { torn: true });
  });
  X.POSTERS = [
    "poster_longwinter",
    "poster_fizzo",
    "poster_fizzo_blue",
    "poster_wanted",
    "poster_missing",
    "poster_neighbor",
    "poster_automaton",
    "poster_sergeant",
    "poster_atom",
    "poster_flakes",
    "poster_protest",
  ];

  // ---------- Crate stencils ----------
  R("crate_fizzo", 128, 128, (c, w, h, r) => {
    woodFace(c, w, h, r);
    stencil(c, "FIZZO COLA", w / 2, 44, 18, "rgba(160,20,20,0.85)");
    stencil(c, "24 BTL", w / 2, 70, 18, "rgba(30,20,10,0.8)");
    stencil(c, "THIS SIDE UP ↑", w / 2, 100, 11, "rgba(30,20,10,0.7)");
    weather(c, w, h, r, 0.5);
  });
  R("crate_teletype", 128, 128, (c, w, h, r) => {
    woodFace(c, w, h, r);
    stencil(c, "HALCYON", w / 2, 44, 22, "rgba(20,40,80,0.85)");
    stencil(c, "TELEPRINTER", w / 2, 70, 13, "rgba(20,40,80,0.8)");
    stencil(c, "FRAGILE", w / 2, 100, 16, "rgba(160,30,20,0.8)");
    weather(c, w, h, r, 0.5);
  });
  R("crate_army", 128, 128, (c, w, h, r) => {
    c.fillStyle = "#56603e";
    c.fillRect(0, 0, w, h);
    woodLines(c, w, h, r, "rgba(0,0,0,0.25)");
    stencil(c, "U.S. ARMY", w / 2, 44, 20, "rgba(230,225,200,0.85)");
    stencil(c, "AMMUNITION", w / 2, 70, 14, "rgba(230,225,200,0.8)");
    stencil(c, "LOT 67-0419-B", w / 2, 96, 11, "rgba(230,225,200,0.7)");
    weather(c, w, h, r, 0.6);
  });
  R("crate_longwinter", 128, 128, (c, w, h, r) => {
    woodFace(c, w, h, r);
    winterMark(c, 38, 64, 22, "rgba(200,90,30,0.9)");
    stencil(c, "CIVIL", 90, 44, 17, "rgba(40,40,36,0.85)");
    stencil(c, "DEFENSE", 90, 64, 15, "rgba(40,40,36,0.85)");
    stencil(c, "O.C.D.", 90, 86, 14, "rgba(200,90,30,0.85)");
    weather(c, w, h, r, 0.5);
  });
  R("crate_plain", 128, 128, (c, w, h, r) => {
    woodFace(c, w, h, r);
    stencil(c, "NYC PORT AUTH.", w / 2, 60, 12, "rgba(30,20,10,0.6)");
    weather(c, w, h, r, 0.6);
  });
  function woodLines(c, w, h, r, col) {
    c.strokeStyle = col;
    for (let k = 1; k < 4; k++) {
      c.beginPath();
      c.moveTo(0, (k * h) / 4);
      c.lineTo(w, (k * h) / 4);
      c.stroke();
    }
  }
