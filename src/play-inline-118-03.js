// play-inline-118 03 — fillstyle
// Lines 336-677 of readable/play-inline-118.pretty.js (statement-aligned).
  function paints() {
    const P2 = K.tsxPaint,
      B = K.tsxBoard;
    if (!K.MATDEF.tsxi)
      K.defineMat("tsxi", {
        map: K.atlases.tsx_paint.tex,
        color: 0xffffff,
        rough: 0.8,
        alphaTest: 0.45,
        emissiveMap: K.atlases.tsx_paint.tex,
        emissiveColor: 0xffe0c0,
        emissiveIntensity: 0.32,
      });
    K.tsxNeon("x_exit", "EXIT", 0xff3020, { h: 90, border: true });
    const poster = (key, bg, draw) =>
      P2(key, 256, 336, (x, W, H) => {
        x.fillStyle = bg;
        x.fillRect(0, 0, W, H);
        draw(x, W, H);
        x.strokeStyle = "rgba(20,14,8,0.7)";
        x.lineWidth = 6;
        x.strokeRect(3, 3, W - 6, H - 6);
        K.stains(x, W, H, 8, key.length * 97, 0.4);
        K.grain(x, W, H, 16, key.length * 13);
      });
    const big = (x, t, y, size, col, font) => {
      x.fillStyle = col;
      x.font =
        "bold " + size + "px " + (font || '"Arial Black", Impact, sans-serif');
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText(t, 128, y);
    };
    poster("q_tonic", "#f0ead8", (x) => {
      x.fillStyle = "#c01a1a";
      x.fillRect(98, 60, 60, 160);
      x.fillRect(48, 110, 160, 60);
      big(x, "RALLY TONIC", 262, 30, "#1a1a1a");
      big(x, "DOCTOR RECOMMENDED!", 305, 17, "#c01a1a");
    });
    poster("q_prussian", "#e8c030", (x) => {
      x.fillStyle = "#1a1a1a";
      x.beginPath();
      x.arc(128, 140, 70, 0, 7);
      x.fill();
      x.fillStyle = "#e8c030";
      for (let k = 0; k < 3; k++) {
        x.beginPath();
        x.moveTo(128, 140);
        x.arc(128, 140, 62, k * 2.09 - 0.5, k * 2.09 + 0.5);
        x.fill();
      }
      big(x, "PRUSSIAN BLUE", 250, 26, "#1a1a1a");
      big(x, "WASH OUT THE RADS", 295, 22, "#1a1a1a");
    });
    poster("q_eyes", "#f4f2ea", (x) => {
      const rows = ["E", "F P", "T O Z", "L P E D", "P E C F D", "E D F C Z P"];
      rows.forEach((t, i) =>
        big(x, t, 50 + i * 46, 44 - i * 6, "#111", "bold Georgia, serif"),
      );
    });
    poster("q_enlist", "#1a2a4a", (x) => {
      x.fillStyle = "#c01a1a";
      for (let i = 0; i < 6; i++) x.fillRect(0, 170 + i * 16, 256, 8);
      x.fillStyle = "#f4f0e8";
      x.beginPath();
      x.moveTo(128, 40);
      x.lineTo(150, 100);
      x.lineTo(214, 100);
      x.lineTo(162, 136);
      x.lineTo(182, 196);
      x.lineTo(128, 160);
      x.lineTo(74, 196);
      x.lineTo(94, 136);
      x.lineTo(42, 100);
      x.lineTo(106, 100);
      x.fill();
      big(x, "DEFEND", 280, 44, "#f4f0e8");
      big(x, "LIBERTY — ENLIST!", 318, 22, "#e8c060");
    });
    poster("q_show", "#1a0a1e", (x) => {
      const g = x.createRadialGradient(128, 150, 5, 128, 150, 110);
      g.addColorStop(0, "rgba(255,230,180,0.9)");
      g.addColorStop(1, "rgba(255,230,180,0)");
      x.fillStyle = g;
      x.fillRect(0, 40, 256, 220);
      x.fillStyle = "#1a0a1e";
      x.beginPath();
      x.arc(128, 120, 26, 0, 7);
      x.fill();
      x.fillRect(104, 146, 48, 90);
      x.fillRect(96, 146, 64, 20);
      big(x, "NEON NIGHTS", 40, 34, "#ff5ab4");
      big(x, "VELVET MALONEY", 280, 26, "#f4e0a0");
      big(x, "NIGHTLY · 8 PM", 314, 22, "#f4e0a0");
    });
    poster("q_fizzo", "#b3261e", (x) => {
      // the tall ribbed Fizzo bottle
      x.fillStyle = "#fff4e0";
      x.beginPath();
      x.moveTo(119, 40);
      x.lineTo(137, 40);
      x.lineTo(138, 90);
      x.quadraticCurveTo(152, 100, 152, 120);
      x.lineTo(152, 250);
      x.lineTo(104, 250);
      x.lineTo(104, 120);
      x.quadraticCurveTo(104, 100, 118, 90);
      x.fill();
      x.fillStyle = "#b3261e";
      for (let k = 0; k < 5; k++) x.fillRect(110 + k * 9, 128, 3, 116);
      x.fillRect(104, 170, 48, 22);
      big(x, "FIZZO COLA", 290, 36, "#fff4e0", "italic bold Georgia, serif");
    });
    const wanted = (k, name, scrip, seed) =>
      poster(k, "#e8dcb8", (x) => {
        big(x, "WANTED", 36, 50, "#3a1a0a", "bold Georgia, serif");
        const r = K.rng(seed);
        x.fillStyle = "#5a4a3a";
        x.fillRect(68, 64, 120, 140);
        x.fillStyle = "#e8dcb8";
        x.beginPath();
        x.arc(128, 116, 32 + r() * 6, 0, 7);
        x.fill();
        x.fillRect(94, 150, 68, 54);
        x.fillStyle = "#5a4a3a";
        x.fillRect(110 + r() * 10, 108, 8, 6);
        x.fillRect(132 + r() * 6, 108, 8, 6);
        big(x, name, 232, 26, "#3a1a0a");
        big(x, scrip + " SCRIP", 276, 36, "#8a1010");
        big(x, "DEAD OR ALIVE", 314, 20, "#3a1a0a");
      });
    wanted("q_wanted1", "RUSTY HINGES", 150, 1);
    wanted("q_wanted2", "GRISTLE", 300, 2);
    wanted("q_wanted3", "NIGHT LIBRARIAN", 250, 3);
    P2("q_map", 512, 384, (x, W, H) => {
      x.fillStyle = "#e8dcb8";
      x.fillRect(0, 0, W, H);
      x.strokeStyle = "#3a2a1a";
      x.lineWidth = 3;
      x.fillStyle = "#b8a888";
      x.fillRect(70, 0, 60, H);
      x.fillRect(0, 110, W, 34);
      x.fillRect(0, 250, W, 34);
      x.save();
      x.translate(250, 190);
      x.rotate(-0.42);
      x.fillRect(-26, -260, 52, 520);
      x.restore();
      x.fillStyle = "#c01a1a";
      for (const p of [
        [200, 30],
        [320, 360],
        [470, 127],
        [20, 267],
      ]) {
        x.beginPath();
        x.arc(p[0], p[1], 10, 0, 7);
        x.fill();
      }
      x.fillStyle = "#1a2a4a";
      x.font = 'bold 26px "Arial Black", sans-serif';
      x.textAlign = "center";
      x.fillText("THE NEON", 360, 200);
      x.font = "bold 16px monospace";
      x.fillText("GATE N", 200, 60);
      x.fillText("GATE S", 320, 340);
      x.fillText("GATE E", 440, 160);
      x.fillText("GATE W", 60, 300);
      K.stains(x, W, H, 10, 5201, 0.4);
      K.grain(x, W, H, 14, 5202);
    });
    P2("q_routes", 512, 320, (x, W, H) => {
      x.fillStyle = "#1e2a22";
      x.fillRect(0, 0, W, H);
      x.strokeStyle = "#7a5a3a";
      x.lineWidth = 14;
      x.strokeRect(0, 0, W, H);
      x.fillStyle = "rgba(235,235,225,0.85)";
      x.font = '30px "Comic Sans MS", "Marker Felt", cursive';
      x.textAlign = "left";
      [
        "ROUTES — NEON FREIGHT",
        "GRAND CENTRAL ..... MON / THU",
        "RADIO CITY ........ TUE / FRI",
        "CARNEGIE HALL ..... SAT",
        "NO RIDERS PAST DUSK!",
        "GERALD STILL MISSING",
      ].forEach((t, i) => x.fillText(t, 26, 48 + i * 46));
      K.stains(x, W, H, 8, 5211, 0.3);
    });
    P2("q_mosaic", 256, 256, (x, W, H) => {
      x.fillStyle = "#6a1a18";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#e8d8b0";
      x.fillRect(16, 16, W - 32, H - 32);
      x.fillStyle = "#2a4a6a";
      x.fillRect(28, 28, W - 56, H - 56);
      x.fillStyle = "#f0e8d0";
      x.font = "bold 130px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("42", W / 2, H / 2 + 6);
      x.strokeStyle = "rgba(0,0,0,0.35)";
      x.lineWidth = 1;
      for (let i = 0; i < W; i += 8) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i, H);
        x.stroke();
        x.beginPath();
        x.moveTo(0, i);
        x.lineTo(W, i);
        x.stroke();
      }
      K.stains(x, W, H, 8, 5221, 0.35);
    });
    P2("q_price", 384, 256, (x, W, H) => {
      x.fillStyle = "#1a1a1a";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#f4f0e0";
      x.font = "bold 30px monospace";
      x.textAlign = "left";
      [
        "DOC BROADWAY — PRICES",
        "PATCH-UP ........ 30",
        "RAD FLUSH ....... 60",
        "BURN GRAFT ...... 80",
        "ADDICTION ....... 90",
        "THE WORKS ...... ASK",
      ].forEach((t, i) => x.fillText(t, 20, 40 + i * 40));
      K.grain(x, W, H, 12, 5231);
    });
    B("b_gallery", "ANNIE'S · 5 SCRIP · 30 SEC", "#8a1010", "#f4e070", {
      size: 46,
    });
    B("b_robo", "SPROCKET'S WORKSHOP", "#1a3a44", "#bff4ff", { size: 52 });
    B("b_pawn", "NO REFUNDS · NO QUESTIONS", "#1a1410", "#e8c060", {
      size: 46,
    });
    B("b_power", "CIRCUIT MAIN — DO NOT TOUCH", "#f0c820", "#111111", {
      size: 44,
    });
    B("b_bunk", "BEDS 20 SCRIP · CHECKOUT WHENEVER", "#1a2a4a", "#f4f0e0", {
      size: 40,
    });
    B("b_armory", "ARMORY — SIGN OUT YOUR IRON", "#2e3a2a", "#e8e0c0", {
      size: 42,
    });
    B("b_oracle", "KNOW YOUR FUTURE · 5 SCRIP", "#2a1a3a", "#c8ffd8", {
      size: 46,
    });
    B("b_depot", "NEON FREIGHT · WEIGH IN HERE", "#3a2a1a", "#f0d8a0", {
      size: 44,
    });
    B("b_mayor", "MAYOR LUCIUS CROWE", "#3a2a1a", "#e8c060", { size: 56 });
    B("b_speak", "THIS PLATFORM IS CLOSED", "#e8dcc0", "#3a1a10", { size: 48 });
    B(
      "b_trains",
      "TO TRAINS  \u2193  TIMES SQ \u2013 42 ST",
      "#111111",
      "#f4f4ec",
      { size: 44, border: "#f4f4ec" },
    );
    K.tsxNeon("x_cinder", "Cinder Club", 0xff6ad0, {
      font: 'italic bold 84px "Brush Script MT", "Segoe Script", cursive',
      h: 124,
    });
    K.tsxNeon("x_bar", "BAR", 0x6ac8ff, { h: 100, border: true });
    K.tsxNeon("x_oracle2", "THE ORACLE", 0x6aff9a, {
      font: "bold 60px Georgia, serif",
      h: 100,
    });
    K.tsxNeon("x_cocktail", "COCKTAILS", 0xff9a3a, {
      font: "italic bold 66px Georgia, serif",
      h: 104,
    });
  }

  // ------------------------------------------------------------------
  // Room kit
  // ------------------------------------------------------------------
  let CELL = null;
  const ROOMS = [];
  function Room(key, cx, cz, w, d, h, o) {
    o = o || {};
    // o.zExt: extra depth added on the south (entrance) side without moving the local frame (r.Z(lz) = cz + lz);
    // o.entryY / o.entryYaw: height of the entrance landing and the player's facing on arrival (default 0 / north)
    const r = {
      key,
      cx,
      cz,
      w,
      d,
      h,
      x0: cx - w / 2,
      x1: cx + w / 2,
      z0: cz - d / 2,
      z1: cz + d / 2 + (o.zExt || 0),
      doorX: cx + (o.doorAt || 0),
      o,
      entryY: o.entryY || 0,
      entryYaw: o.entryYaw || 0,
    };
    r.grp = new THREE.Group();
    r.grp.name = "lma_neon_" + key;
    CELL.add(r.grp);
    r.b = K.builder("nx_" + key, {
      grime: o.grime !== undefined ? o.grime : 0.32,
      remap: REMAP,
    });
    r.g = K.glowSet("nx_" + key);
    r.sp = K.spillSet("nx_" + key);
    r.fix = [];
    r.X = (lx) => cx + lx;
    r.Z = (lz) => cz + lz;
    r.bx = (mat, lx0, y0, lz0, lx1, y1, lz1, oo) =>
      r.b.boxMM(
        mat,
        cx + Math.min(lx0, lx1),
        Math.min(y0, y1),
        cz + Math.min(lz0, lz1),
        cx + Math.max(lx0, lx1),
        Math.max(y0, y1),
        cz + Math.max(lz0, lz1),
        oo || {},
      );
    r.col = (lx0, y0, lz0, lx1, y1, lz1, oo) =>
      K.colBox(
        cx + Math.min(lx0, lx1),
        Math.min(y0, y1),
        cz + Math.min(lz0, lz1),
        cx + Math.max(lx0, lx1),
        Math.max(y0, y1),
        cz + Math.max(lz0, lz1),
        oo || {},
      );
    r.anchor = null;
    ROOMS.push(r);
    return r;
  }
  /** Floor, ceiling, four inward-facing walls (dado + rail + cornice), wall colliders, entrance door (south wall). */
