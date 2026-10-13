// play-inline-119 05 — size
// Lines 754-1153 of readable/play-inline-119.pretty.js (statement-aligned).
  function signs() {
    const N = K.tsxNeon,
      B = K.tsxBoard;
    N("x_clinic", "DOC BROADWAY'S", 0xff3a3a, {
      font: "italic bold 72px Georgia, serif",
      h: 112,
    });
    K.tsxNeonDraw("x_cross", 200, 200, (x, W, H) => {
      const col = "#ff2a2a";
      x.strokeStyle = col;
      x.lineWidth = 10;
      x.shadowColor = col;
      x.shadowBlur = 18;
      x.beginPath();
      x.arc(W / 2, H / 2, 86, 0, 7);
      x.stroke();
      x.fillStyle = col;
      x.fillRect(W / 2 - 22, H / 2 - 62, 44, 124);
      x.fillRect(W / 2 - 62, H / 2 - 22, 124, 44);
      x.shadowBlur = 0;
      x.fillStyle = "rgba(255,230,220,0.75)";
      x.fillRect(W / 2 - 8, H / 2 - 52, 16, 104);
      x.fillRect(W / 2 - 52, H / 2 - 8, 104, 16);
    });
    N("x_gallery", "SHOOTING GALLERY", 0xffd23a, {
      font: 'bold 64px "Arial Black", sans-serif',
      h: 104,
      border: true,
    });
    K.tsxNeonDraw("x_target", 200, 200, (x, W, H) => {
      const cs = ["#ff3030", "#ffffff", "#ff3030", "#ffffff"];
      for (let i = 0; i < 4; i++) {
        x.strokeStyle = cs[i];
        x.lineWidth = 9;
        x.shadowColor = cs[i];
        x.shadowBlur = 14;
        x.beginPath();
        x.arc(W / 2, H / 2, 84 - i * 22, 0, 7);
        x.stroke();
      }
      x.fillStyle = "#ffd23a";
      x.beginPath();
      x.arc(W / 2, H / 2, 10, 0, 7);
      x.fill();
    });
    N("x_robo", "ROBO-SHOP", 0x5af0ff, {
      font: 'bold 70px "Arial Black", sans-serif',
      h: 108,
    });
    K.tsxNeonDraw("x_radio", 220, 180, (x, W, H) => {
      const col = "#ffb040";
      x.strokeStyle = col;
      x.lineWidth = 8;
      x.shadowColor = col;
      x.shadowBlur = 16;
      x.beginPath();
      x.moveTo(30, 170);
      x.lineTo(30, 70);
      x.quadraticCurveTo(110, 0, 190, 70);
      x.lineTo(190, 170);
      x.closePath();
      x.stroke();
      x.beginPath();
      x.arc(110, 95, 26, 0, 7);
      x.stroke();
      for (let k = 0; k < 4; k++) {
        x.beginPath();
        x.moveTo(55, 135 + k * 8);
        x.lineTo(165, 135 + k * 8);
        x.stroke();
      }
    });
    N("x_pawn", "PAWN PALACE", 0xffc83a, {
      font: "bold italic 76px Georgia, serif",
      h: 118,
      border: true,
    });
    N("x_opry", "THE NEON OPRY", 0xff5ab4, {
      font: 'bold 78px "Arial Black", Impact, sans-serif',
      h: 118,
    });
    const blade = (k, text, col) =>
      K.tsxNeonDraw(k, 120, 86 * text.length + 44, (x2, W, H2) => {
        const cc = K.hex(col);
        x2.strokeStyle = cc;
        x2.lineWidth = 5;
        x2.shadowColor = cc;
        x2.shadowBlur = 16;
        x2.strokeRect(8, 8, W - 16, H2 - 16);
        x2.font = 'bold 72px "Arial Black", Impact, sans-serif';
        x2.textAlign = "center";
        x2.textBaseline = "middle";
        for (let i = 0; i < text.length; i++) {
          x2.fillStyle = cc;
          x2.shadowBlur = 20;
          x2.fillText(text[i], W / 2, 62 + i * 86);
          x2.shadowBlur = 0;
          x2.fillStyle = "rgba(255,255,240,0.7)";
          x2.fillText(text[i], W / 2, 62 + i * 86);
        }
      });
    blade("x_b_opry", "OPRY", 0xffd060);
    blade("x_b_bunk", "HOTEL", 0x60d0ff);
    N("x_bunk", "BUNKHOUSE", 0x60d0ff, {
      font: 'bold 70px "Arial Black", sans-serif',
      h: 108,
    });
    N("x_vacancy", "VACANCY", 0xff4a4a, { h: 96, border: true });
    N("x_club", "Cinder Club", 0xff6ad0, {
      font: 'italic bold 84px "Brush Script MT", "Segoe Script", cursive',
      h: 124,
    });
    N("x_members", "MEMBERS ONLY", 0xb070ff, {
      font: 'bold 52px "Arial Black", sans-serif',
      h: 84,
    });
    N("x_oracle", "TICKER ORACLE", 0x6aff9a, {
      font: 'bold 60px "Arial Black", sans-serif',
      h: 100,
      border: true,
    });
    K.tsxNeonDraw("x_eye", 220, 140, (x, W, H) => {
      const col = "#9a7aff";
      x.strokeStyle = col;
      x.lineWidth = 8;
      x.shadowColor = col;
      x.shadowBlur = 16;
      x.beginPath();
      x.moveTo(12, 70);
      x.quadraticCurveTo(110, -10, 208, 70);
      x.quadraticCurveTo(110, 150, 12, 70);
      x.stroke();
      x.beginPath();
      x.arc(110, 70, 30, 0, 7);
      x.stroke();
      x.fillStyle = "#6aff9a";
      x.beginPath();
      x.arc(110, 70, 12, 0, 7);
      x.fill();
    });
    N("x_depot", "NEON FREIGHT", 0xff9a3a, {
      font: 'bold 70px "Arial Black", sans-serif',
      h: 108,
    });
    N("x_guard", "NEON GUARD", 0x7aff6a, {
      font: 'bold 64px "Arial Black", sans-serif',
      h: 104,
      border: true,
    });
    N("x_power", "POWER & LIGHT", 0x9ad8ff, {
      font: 'bold 60px "Arial Black", sans-serif',
      h: 100,
    });
    N("x_market", "MARQUEE MARKET", 0xffd23a, {
      font: 'bold 70px "Arial Black", Impact, sans-serif',
      h: 110,
      border: true,
    });
    K.tsxNeonDraw("x_flag", 300, 180, (x, W, H) => {
      for (let i = 0; i < 7; i++) {
        const c = i % 2 ? "#f4f0e8" : "#ff2a2a";
        x.strokeStyle = c;
        x.shadowColor = c;
        x.shadowBlur = 10;
        x.lineWidth = 7;
        x.beginPath();
        x.moveTo(i < 4 ? 118 : 14, 22 + i * 22);
        x.lineTo(286, 22 + i * 22);
        x.stroke();
      }
      x.strokeStyle = "#4a8aff";
      x.shadowColor = "#4a8aff";
      x.lineWidth = 6;
      x.strokeRect(14, 12, 96, 76);
      x.fillStyle = "#f4f0e8";
      x.shadowBlur = 6;
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 4; j++) {
          x.beginPath();
          x.arc(28 + j * 23, 28 + i * 22, 3.5, 0, 7);
          x.fill();
        }
    });
    // painted boards
    B("p_clinic", "CLINIC · SURGERY · RAD CURES", "#f2ecd8", "#a01818", {
      size: 50,
    });
    B("p_boxoffice", "BOX OFFICE", "#7a1414", "#f0c860", { size: 70 });
    B("p_prizes", "WIN SCRIP! 5 SCRIP A ROUND", "#f2d23a", "#8a1010", {
      size: 48,
    });
    B("p_robo", "RADIO REPAIR · ROBOTS FIXED", "#1a3a44", "#bff4ff", {
      size: 46,
    });
    B("p_pawn", "WE BUY ANYTHING · NO QUESTIONS", "#1a1410", "#e8c060", {
      size: 44,
    });
    B("p_opry1", "NOW PLAYING", "#f4efe0", "#1a1a1a", {
      size: 66,
      border: "#1a1a1a",
    });
    B("p_opry2", '"NEON NIGHTS" A BROADWAY REVUE', "#f4efe0", "#a0161a", {
      size: 46,
      border: "#1a1a1a",
    });
    B("p_opry3", "NIGHTLY 8 PM · 10 SCRIP", "#f4efe0", "#1a1a1a", {
      size: 56,
      border: "#1a1a1a",
    });
    B("p_power", "AUTHORIZED PERSONNEL ONLY", "#2a3a4a", "#f0f0e0", {
      size: 46,
    });
    K.tsxPaint("p_danger", 256, 256, (x, W, H) => {
      x.fillStyle = "#f0c820";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#111";
      x.beginPath();
      x.moveTo(W / 2, 24);
      x.lineTo(W - 20, H - 60);
      x.lineTo(20, H - 60);
      x.closePath();
      x.lineWidth = 12;
      x.strokeStyle = "#111";
      x.stroke();
      x.beginPath();
      x.moveTo(W / 2 + 12, 70);
      x.lineTo(W / 2 - 18, 132);
      x.lineTo(W / 2 + 6, 132);
      x.lineTo(W / 2 - 14, 176);
      x.lineTo(W / 2 + 26, 118);
      x.lineTo(W / 2 + 2, 118);
      x.lineTo(W / 2 + 22, 70);
      x.fill();
      x.font = 'bold 30px "Arial Black", sans-serif';
      x.textAlign = "center";
      x.fillText("HIGH VOLTAGE", W / 2, H - 22);
      K.stains(x, W, H, 6, 71, 0.35);
      K.grain(x, W, H, 14, 72);
    });
    B("p_barracks", "NEON GUARD · BARRACKS & ARMORY", "#2e3a2a", "#e8e0c0", {
      size: 42,
    });
    B("p_noweap", "WEAPONS AWAY PAST THIS POINT", "#e8e2cc", "#8a1a14", {
      size: 44,
    });
    B("p_halt", "HALT! NEON GUARD CHECKPOINT", "#f0c820", "#111111", {
      size: 44,
    });
    B("p_subway", "SUBWAY · TIMES SQ · 42 ST", "#111111", "#f4f4ec", {
      size: 50,
      border: "#f4f4ec",
    });
    B("p_closed", "CLOSED — NO ENTRY", "#b01a14", "#f4f0e0", { size: 52 });
    B(
      "p_depot",
      "NEON FREIGHT DEPOT · CONVOYS IN & OUT",
      "#3a2a1a",
      "#f0d8a0",
      { size: 38, w: 768 },
    );
    B("p_oxpen", "OX PEN · NO SMOKING", "#e8dcc0", "#5a2a10", { size: 46 });
    B(
      "p_recruit",
      "U.S. ARMED FORCES RECRUITING STATION",
      "#1a2a4a",
      "#f4f0e8",
      { size: 34, w: 768, border: "#c8a040" },
    );
    B("p_mayor", "OFFICE OF THE MAYOR · WALK IN", "#f4efe0", "#1a2a4a", {
      size: 44,
    });
    B("p_nest", "ROOF ACCESS · GUARDS ONLY", "#2e3a2a", "#f0e8c0", {
      size: 50,
    });
    B("p_armor", "ARMOR & DUDS", "#5a2a5a", "#f4e0f0", { size: 66 });
    B("p_junk", "SCRAPPER JOE'S JUNK", "#c8b890", "#2a2010", { size: 56 });
    B("p_booze", "WATER · BOOZE · FIZZO", "#1a4a6a", "#f0f0e0", { size: 56 });
    B("p_ammo", "BRASS AMMO CO.", "#b08a2a", "#1a1208", { size: 62 });
    B("p_grill", "BEV'S GRILL", "#e8e2cc", "#9a1a10", { size: 70 });
    B("p_chems", "CANDY'S PILLS", "#2a1a3a", "#e8a0ff", { size: 66 });
    B("p_guns", "TILLIE'S IRON", "#b0261c", "#f4d34a", { size: 70 });
    B("p_eats2", "HOT FOOD", "#2a6a4a", "#f0ead0", { size: 72 });
    B("p_trinkets", "OLD-WORLD TRINKETS", "#e8d8a0", "#3a2a5a", { size: 54 });
    // the Speakeasy's door code, chalked on the subway tiles beside the 42nd St gate (Read → G.locks.learn)
    K.tsxPaint("p_knock", 256, 192, (x, W, H) => {
      x.fillStyle = "#d8d2c0";
      x.fillRect(0, 0, W, H);
      x.strokeStyle = "rgba(90,80,64,0.35)";
      x.lineWidth = 2;
      for (let i = 0; i <= W; i += 32) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i, H);
        x.stroke();
      }
      for (let j = 0; j <= H; j += 24) {
        x.beginPath();
        x.moveTo(0, j);
        x.lineTo(W, j);
        x.stroke();
      }
      x.fillStyle = "rgba(250,250,245,0.92)";
      x.strokeStyle = "rgba(40,36,30,0.85)";
      x.lineWidth = 3;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = 'bold 26px "Comic Sans MS", "Marker Felt", cursive';
      x.strokeText("THE 42 — KNOCK", W / 2, 34);
      x.fillText("THE 42 — KNOCK", W / 2, 34);
      x.font = 'bold 50px "Comic Sans MS", "Marker Felt", cursive';
      x.strokeText("2 · 0 · 1 · 42", W / 2, 96);
      x.fillText("2 · 0 · 1 · 42", W / 2, 96);
      x.font = 'bold 22px "Comic Sans MS", "Marker Felt", cursive';
      x.strokeText("WHISPER SENT YOU", W / 2, 156);
      x.fillText("WHISPER SENT YOU", W / 2, 156);
      K.stains(x, W, H, 6, 4211, 0.3);
      K.grain(x, W, H, 14, 4212);
    });
    // notice board: a collage of bounty / job notes (the quests module adds the interaction)
    K.tsxPaint("p_notice", 384, 256, (x, W, H) => {
      x.fillStyle = "#5a3a22";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#a07a50";
      x.fillRect(10, 10, W - 20, H - 20);
      const r = K.rng(4711),
        cols = ["#efe6cc", "#f4efe0", "#e8dcb0", "#f0e0c8", "#ffd8d0"];
      const notes = [
        "WANTED",
        "JOBS",
        "BOUNTY",
        "LOST OX",
        "FUEL RUN",
        "WANTED",
        "ROOM 4 RENT",
        "SHOW TONITE",
      ];
      for (let i = 0; i < 9; i++) {
        const w = 70 + r() * 40,
          h = 80 + r() * 30,
          px = 18 + (i % 4) * 88 + r() * 8,
          py = 18 + Math.floor(i / 4) * 78 + r() * 12;
        x.save();
        x.translate(px + w / 2, py + h / 2);
        x.rotate((r() - 0.5) * 0.18);
        x.fillStyle = cols[i % cols.length];
        x.fillRect(-w / 2, -h / 2, w, h);
        x.fillStyle = "#2a1a10";
        x.font = 'bold 13px "Arial Black", sans-serif';
        x.textAlign = "center";
        x.fillText(notes[i % notes.length], 0, -h / 2 + 18);
        x.fillStyle = "rgba(40,30,20,0.55)";
        for (let k = 0; k < 5; k++)
          x.fillRect(-w / 2 + 8, -h / 2 + 28 + k * 10, w - 16 - r() * 20, 3);
        if (i % 3 === 0) {
          x.fillStyle = "#6a5a4a";
          x.fillRect(-14, -8, 28, 30);
        }
        x.fillStyle = "#c02020";
        x.beginPath();
        x.arc(0, -h / 2 + 5, 4, 0, 7);
        x.fill();
        x.restore();
      }
      K.stains(x, W, H, 8, 4712, 0.35);
      K.grain(x, W, H, 16, 4713);
    });
    // faded ghost sign on the exposed party wall over the freight yard
    K.tsxPaint("p_ghost", 512, 512, (x, W, H) => {
      x.fillStyle = "#6a4a3a";
      x.fillRect(0, 0, W, H);
      x.globalAlpha = 0.55;
      x.fillStyle = "#e8dcc0";
      x.fillRect(30, 40, W - 60, 120);
      x.fillStyle = "#b0261c";
      x.fillRect(30, 180, W - 60, 90);
      x.fillStyle = "#e8dcc0";
      x.fillRect(30, 290, W - 60, 170);
      x.globalAlpha = 0.7;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = "#3a2418";
      x.font = "bold 84px Georgia, serif";
      x.fillText("ASTOR", W / 2, 100);
      x.fillStyle = "#f0e0c0";
      x.font = 'bold 56px "Arial Black", sans-serif';
      x.fillText("STORAGE", W / 2, 226);
      x.fillStyle = "#3a2418";
      x.font = 'bold 44px "Arial Black", sans-serif';
      x.fillText("FIREPROOF", W / 2, 345);
      x.fillText("WAREHOUSE", W / 2, 405);
      x.globalAlpha = 1;
      K.stains(x, W, H, 16, 991, 0.55);
      K.streaks(x, W, H, 40, 992, 0.35);
      K.grain(x, W, H, 22, 993);
    });
  }

  // ------------------------------------------------------------------
  // Dynamic canvases: the Crossroads Screen (programmes + crawl) and the zipper
  // ------------------------------------------------------------------
