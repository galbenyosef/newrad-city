// play-inline-441 02 — txt
// Lines 315-630 of readable/play-inline-441.pretty.js (statement-aligned).
  function fizzoFront(c, w, h, r, variant) {
    c.fillStyle = "#ece6d6";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c8191e";
    c.fillRect(0, 0, w, 112);
    c.beginPath();
    c.moveTo(0, 112);
    c.bezierCurveTo(w * 0.35, 142, w * 0.62, 96, w, 124);
    c.lineTo(w, 110);
    c.lineTo(0, 110);
    c.closePath();
    c.fill();
    fizzoMark(c, w / 2 - 18, 52, 60, "#fff", {
      stroke: "#6a0a0c",
      strokeW: 3,
      maxW: w - 80,
    });
    txt(
      c,
      variant ? "NOW IN FIZZO BLUE!" : "FIZZ UP, AMERICA!",
      w / 2,
      96,
      17,
      "#fff4d8",
      { maxW: w - 40 },
    );
    const wx = 16,
      wy = 146,
      ww = w - 80,
      wh = 272;
    c.fillStyle = "#16100c";
    rrect(c, wx, wy, ww, wh, 6);
    c.fill();
    for (let s = 0; s < 4; s++) {
      const sy = wy + 62 + s * 66;
      for (let i = 0; i < 5; i++)
        fizzoBottle(
          c,
          wx + 18 + i * 34,
          sy - 28,
          0.42,
          variant && (i + s) % 3 === 1 ? "#1a70a0" : "#4a140c",
        );
      c.fillStyle = "#9a968c";
      c.fillRect(wx + 4, sy + 2, ww - 8, 4);
    }
    const gg = c.createLinearGradient(wx, wy, wx + ww, wy + wh);
    gg.addColorStop(0, "rgba(255,255,255,0.22)");
    gg.addColorStop(0.4, "rgba(255,255,255,0.02)");
    gg.addColorStop(1, "rgba(255,255,255,0.1)");
    c.fillStyle = gg;
    c.fillRect(wx, wy, ww, wh);
    c.strokeStyle = "#b8b4aa";
    c.lineWidth = 5;
    rrect(c, wx, wy, ww, wh, 6);
    c.stroke();
    const px = w - 56;
    c.fillStyle = "#c8191e";
    c.fillRect(px, wy, 44, wh);
    c.fillStyle = "#1a1a18";
    c.fillRect(px + 16, wy + 14, 12, 28);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = "#f0ece0";
      c.fillRect(px + 8, wy + 60 + i * 30, 28, 20);
      c.fillStyle = variant && i === 2 ? "#1a70a0" : "#8a1014";
      c.fillRect(px + 12, wy + 64 + i * 30, 20, 12);
    }
    txt(c, "10¢", px + 22, wy + wh - 18, 16, "#fff4d8");
    c.fillStyle = "#121210";
    rrect(c, 36, 438, w - 72, 46, 6);
    c.fill();
    txt(c, "LIFT FLAP", w / 2, 498, 12, "#6a0a0c");
    weather(c, w, h, r, 0.8);
  }
  R("fizzo_front", 256, 512, (c, w, h, r) => fizzoFront(c, w, h, r, 0));
  R("fizzo_front_b", 256, 512, (c, w, h, r) => fizzoFront(c, w, h, r, 1));

  // Office of Civil Defense recruiting kiosk (Project Long Winter): grey-white enamel with orange bands
  R("ocd_kiosk", 256, 512, (c, w, h, r) => {
    c.fillStyle = "#d8d6cc";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#e0702a";
    c.fillRect(0, 0, w, 12);
    c.fillRect(0, 98, w, 8);
    c.fillRect(0, h - 44, w, 44);
    winterMark(c, 46, 56, 32, "#e0702a");
    txt(c, "OFFICE OF", 156, 34, 18, "#2a2a28", { maxW: 176 });
    txt(c, "CIVIL DEFENSE", 156, 60, 24, "#2a2a28", { maxW: 176 });
    txt(c, "RECRUITING STATION", 156, 84, 13, "#6a4a2a", { maxW: 176 });
    c.fillStyle = "#120a02";
    rrect(c, 24, 118, w - 48, 170, 10);
    c.fill();
    c.strokeStyle = "#8a8a80";
    c.lineWidth = 6;
    c.stroke();
    [
      "OFFICE OF CIVIL DEFENSE",
      "SHELTER INFORMATION",
      "",
      "> KNOW YOUR SHELTER",
      "> CARRY YOUR CARD",
      "> ENROLMENT: OPEN",
    ].forEach((l, i) =>
      txt(c, l, 38, 144 + i * 24, 17, "#ffb347", {
        font: F_MONO,
        weight: "normal",
        align: "left",
        maxW: w - 76,
      }),
    );
    // the cryo capsule, drawn like a technical illustration (no figures)
    c.save();
    c.translate(w / 2, 384);
    c.strokeStyle = "#3a3a36";
    c.lineWidth = 4;
    c.fillStyle = "#eeeeea";
    rrect(c, -40, -70, 80, 140, 38);
    c.fill();
    c.stroke();
    c.fillStyle = "#9ab8c8";
    rrect(c, -24, -52, 48, 70, 20);
    c.fill();
    c.stroke();
    c.strokeStyle = "#e0702a";
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(-40, 34);
    c.lineTo(40, 34);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.8)";
    c.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(-18 + i * 10, -46);
      c.lineTo(-8 + i * 10, -20);
      c.stroke();
    }
    c.restore();
    txt(c, "SERVE · SLEEP · SURVIVE", w / 2, h - 22, 16, "#fff", {
      maxW: w - 20,
    });
    weather(c, w, h, r, 0.9);
  });

  // Newspaper boxes (three mastheads; The First Journal is the city's big daily). [top line, masthead, box colour, headline, slogan]
  const PAPERS = [
    [
      "THE FIRST",
      "JOURNAL",
      "#1e3a66",
      "PARIS RECALLS ENVOY",
      "You heard it here first.",
    ],
    ["DAILY", "ATOM", "#3a6ab0", "RATIONING EXPANDS"],
    ["NEW YORK", "COURIER", "#b03a2a", "RED SCARE: 3 HELD"],
  ];
  PAPERS.forEach((p, i) =>
    R("news_" + i, 128, 160, (c, w, h, r) => {
      c.fillStyle = p[2];
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#f0ead8";
      c.fillRect(8, 8, w - 16, 36);
      txt(c, p[0], w / 2, 18, 11, "#222", { maxW: w - 20 });
      txt(c, p[1], w / 2, 34, 17, "#111", { font: F_SERIF, maxW: w - 20 });
      // window with folded newspaper
      c.fillStyle = "#2a2a26";
      c.fillRect(10, 52, w - 20, 74);
      c.fillStyle = "#d8d0b8";
      c.fillRect(18, 58, w - 36, 64);
      txt(c, p[3], w / 2, 70, 10, "#111", { font: F_SERIF, maxW: w - 44 });
      for (let k = 0; k < (p[4] ? 4 : 6); k++) {
        c.fillStyle = "rgba(40,40,40,0.5)";
        c.fillRect(22, 82 + k * 6, w - 44, 2);
      }
      if (p[4])
        txt(c, p[4], w / 2, 112, 9, "#1e3a66", {
          font: F_SERIF,
          weight: "italic bold",
          maxW: w - 40,
        });
      c.fillStyle = "rgba(200,220,220,0.18)";
      c.fillRect(10, 52, w - 20, 74);
      c.fillStyle = "#222";
      c.fillRect(w / 2 - 14, 134, 28, 8);
      txt(c, "10¢", w / 2, 152, 12, "#f0ead8");
      weather(c, w, h, r, 0.8);
    }),
  );

  // ---------- Posters ----------
  const posterBase = (c, w, h, bg) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(0,0,0,0.3)";
    c.lineWidth = 6;
    c.strokeRect(6, 6, w - 12, h - 12);
  };
  R("poster_longwinter", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#e6e2d6");
    c.fillStyle = "#e0702a";
    c.fillRect(0, 0, w, 64);
    txt(c, "ENROL NOW", w / 2, 24, 28, "#fff", { maxW: w - 20 });
    txt(c, "CIVIL DEFENSE 1967", w / 2, 50, 16, "#2a2a28", { maxW: w - 20 });
    winterMark(c, w / 2, 146, 62, "#3a5a7a", "#dfe8ee");
    txt(c, "YOUR CARD IS YOUR RATION", w / 2, 232, 14, "#2a2a28", {
      maxW: w - 20,
    });
    txt(c, "Office of Civil Defense", w / 2, 260, 14, "#8a3a10", {
      font: F_SERIF,
      weight: "normal",
      maxW: w - 20,
    });
    weather(c, w, h, r, 0.9, { torn: true });
  });
  R("poster_fizzo", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#c01a1e");
    rays(c, w / 2, 150, 14, 170, "rgba(255,230,190,0.16)");
    fizzoBottle(c, w / 2, 150, 1.2, "#3a0c08");
    fizzoMark(c, w / 2 - 14, 36, 44, "#fff", {
      stroke: "#6a0a0c",
      maxW: w - 60,
    });
    txt(c, "FIZZ UP, AMERICA!", w / 2, 248, 19, "#fff4d8", {
      stroke: "#6a0a0c",
      maxW: w - 20,
    });
    weather(c, w, h, r, 0.9, { torn: true });
  });
  R("poster_fizzo_blue", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#0c2a4a");
    rays(c, w / 2, 150, 18, 200, "rgba(110,210,255,0.14)");
    fizzoBottle(c, w / 2, 150, 1.2, "#1a8ad0", "#e8f8ff");
    txt(c, "FIZZO BLUE", w / 2, 34, 32, "#8ae8ff", {
      stroke: "#082040",
      maxW: w - 20,
    });
    txt(c, "THE ELECTRIC REFRESHER!", w / 2, 238, 14, "#e8f8ff", {
      maxW: w - 20,
    });
    txt(c, "Now with extra sparkle", w / 2, 262, 14, "#8ae8ff", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: w - 20,
    });
    weather(c, w, h, r, 0.8, { torn: true });
  });
  R("poster_wanted", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#d8c8a0");
    txt(c, "WANTED", w / 2, 34, 40, "#2a1a10", { font: F_SERIF });
    c.fillStyle = "#6a5a44";
    c.fillRect(36, 60, w - 72, 110);
    c.fillStyle = "#2a2018";
    c.beginPath();
    c.ellipse(w / 2, 110, 28, 34, 0, 0, X.TAU);
    c.fill();
    c.fillRect(w / 2 - 40, 140, 80, 30);
    txt(c, '"MAD DOG" MALONE', w / 2, 190, 16, "#2a1a10", {
      font: F_SERIF,
      maxW: w - 24,
    });
    txt(c, "RAIDER · MURDERER", w / 2, 212, 12, "#5a2a10", { font: F_SERIF });
    txt(c, "REWARD", w / 2, 238, 20, "#8a1a10", { font: F_SERIF });
    txt(c, "500 SCRIP", w / 2, 262, 22, "#2a1a10", { font: F_SERIF });
    weather(c, w, h, r, 1.0, { torn: true });
  });
  R("poster_missing", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#ece6d6");
    txt(c, "MISSING", w / 2, 34, 34, "#111", { font: F_SERIF });
    c.fillStyle = "#9a9488";
    c.fillRect(40, 60, w - 80, 100);
    c.fillStyle = "#5a564c";
    c.beginPath();
    c.ellipse(w / 2, 100, 22, 26, 0, 0, X.TAU);
    c.fill();
    c.fillRect(w / 2 - 30, 124, 60, 36);
    [
      "Have you seen our boy",
      "TOMMY? Age 9. Last seen",
      "at 42nd St station",
      "Mar 5. Please — ANY",
      "news. Apt 4C, W 51st.",
    ].forEach((l, i) =>
      txt(c, l, w / 2, 180 + i * 18, 12, "#222", {
        font: F_SERIF,
        weight: "normal",
        maxW: w - 24,
      }),
    );
    weather(c, w, h, r, 1.0, { torn: true });
  });
  R("poster_neighbor", 192, 288, (c, w, h, r) => {
    posterBase(c, w, h, "#e0d4b0");
    c.fillStyle = "#b01010";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(w, 0);
    c.lineTo(w, 140);
    c.lineTo(0, 190);
    c.closePath();
    c.fill();
    c.fillStyle = "#2a0a08";
    c.beginPath();
    c.moveTo(20, 170);
    c.quadraticCurveTo(w / 2, 20, w - 20, 120);
    c.lineTo(w - 20, 150);
    c.quadraticCurveTo(w / 2, 70, 20, 190);
    c.fill();
    txt(c, "IS YOUR NEIGHBOR", w / 2, 212, 15, "#2a1a10", { maxW: w - 16 });
    txt(c, "A COMMUNIST?", w / 2, 238, 24, "#b01010", { maxW: w - 16 });
    txt(c, "Report suspicious activity!", w / 2, 264, 12, "#2a1a10", {
      font: F_SERIF,
      weight: "normal",
    });
    weather(c, w, h, r, 0.9, { torn: true });
  });
  // American Automaton Co. ad for the Valet household robot
