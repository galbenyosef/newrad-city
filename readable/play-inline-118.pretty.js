/* src/landmarks_a/41_neon_interior.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 41_neon_interior.js
 * THE NEON (Times Square) — INTERIOR (interior stream): the enterable
 * places of TIMES_SQUARE_PLAN.md, all in the shared interior cell
 * G.LAYOUT.INTERIORS.neon_interiors (origin x 11000, z 0), one closed
 * room per place on a 45 m grid, each with its own builder (lamp-lit
 * material twins), glow / light-pool sets, borrowed fixture lights and
 * the street↔interior door pair (G.world.addDoor) at the façade built by
 * 41_neon_town.js:
 *   Doc Broadway's Clinic · Ammo Annie's Shooting Gallery · Radio Repair
 *   & Robo-Shop · The Pawn Palace · The Neon Opry (auditorium, stage,
 *   backstage) · The Ticker Oracle · The Mayor's Office · The Neon Power
 *   Plant · the Freight Depot warehouse · The Bunkhouse Hotel (lobby +
 *   16 beds) · Guard Barracks & Armory · The Cinder Club · The
 *   Subway Speakeasy (+ the rooftop snipers' nest service stairs).
 * Every lock here (clinic cabinet, pawn safe, Mayor's desk + safe, depot
 * strongbox, armory crate, speakeasy gate) is a G.locks key / code; each
 * unlock is placed in these rooms or on the street outside (LOCKS below).
 * Only the room the camera is in is visible (the whole cell is hidden
 * from the street), so a room costs ~12–20 draw calls while you're in it.
 * Plan anchors (clinic_doctor, gallery_range, opry_seat_1..12, bunk_1..16,
 * power_generator, speakeasy_bar, …) are registered on
 * G.landmarks.times_square (see NOTES_INTERIOR.md).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.LMA) return;
  const K = G.LMA.kit;
  const PI = Math.PI;
  const T = K.T;
  const nrm = (a) => {
    while (a > PI) a -= 2 * PI;
    while (a <= -PI) a += 2 * PI;
    return a;
  };
  const AY = (f) => nrm(f + PI); // actor yaw for a three.js facing yaw
  // The Speakeasy's street gate (42nd St): a keypad code, chalked on the tiles beside the gate (41_neon_town.js builds the
  // scrawl + its Read interaction, which learns this code; the matchbook inside repeats the knock).
  K.neonSpeakLock = K.neonSpeakLock || {
    id: "lma_neon_speakeasy_gate",
    label: "Speakeasy Gate (42 St subway)",
    code: "20142",
    hint: "Chalk scrawl on the tiles beside the 42nd St subway gate",
    learnedFrom: "Chalk scrawl beside the 42nd St subway gate (Read)",
  };

  // ------------------------------------------------------------------
  // Materials: lamp-lit twins of the base set + a few canvas surfaces
  // ------------------------------------------------------------------
  const WARM = 0xffb878;
  const REMAP = {};
  function materials() {
    if (K.MATDEF.nx_paper) return;
    const twin = (base, key, i, col) => {
      K.litTwin(base, key, col || WARM, i);
      REMAP[base] = key;
    };
    twin("concrete", "nx_concrete", 0.2);
    twin("wood", "nx_wood", 0.3);
    twin("wood_rotten", "nx_woodr", 0.26);
    twin("metal", "nx_metal", 0.26);
    twin("metal_dark", "nx_metald", 0.36);
    twin("rust", "nx_rust", 0.24);
    twin("fabric", "nx_fabric", 0.32);
    twin("plaster_base", "nx_plaster", 0.22);
    twin("brass_base", "nx_brass", 0.45, 0xffc880);
    twin("steel", "nx_steel", 0.26);
    twin("corrugated", "nx_corr", 0.22);
    twin("brick_red", "nx_brick", 0.2);
    twin("brick_brown", "nx_brickb", 0.2);
    twin("marble", "nx_marble", 0.22);
    twin("granite", "nx_granite", 0.2);
    twin("limestone", "nx_lime", 0.2);
    twin("dirt", "nx_dirt", 0.18);
    twin("rubble", "nx_rubble", 0.18);
    const cm = (key, w, h, draw, o) => {
      const c = K.canvas(w, h),
        x = c.getContext("2d");
      draw(x, w, h);
      const t = K.texFromCanvas(c);
      K.defineMat(
        key,
        Object.assign(
          {
            color: 0xffffff,
            map: t,
            emissiveMap: t,
            emissiveColor: 0xffc890,
            emissiveIntensity: 0.2,
            emissiveVC: true,
            rough: 0.8,
            custom: true,
            tile: [2, 2],
          },
          o || {},
        ),
      );
    };
    cm(
      "nx_paper",
      256,
      256,
      (x, W, H) => {
        x.fillStyle = "#d2c4a4";
        x.fillRect(0, 0, W, H);
        x.fillStyle = "rgba(120,90,60,0.28)";
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            const cx = i * 64 + (j % 2) * 32 + 16,
              cy = j * 64 + 32;
            x.beginPath();
            x.moveTo(cx, cy - 24);
            x.quadraticCurveTo(cx + 16, cy, cx, cy + 24);
            x.quadraticCurveTo(cx - 16, cy, cx, cy - 24);
            x.fill();
            x.beginPath();
            x.arc(cx, cy, 4, 0, 7);
            x.fill();
          }
        x.fillStyle = "rgba(90,60,40,0.18)";
        for (let i = 0; i < W; i += 32) x.fillRect(i, 0, 2, H);
        K.stains(x, W, H, 10, 5101, 0.45);
        K.streaks(x, W, H, 16, 5102, 0.25);
        K.grain(x, W, H, 18, 5103);
      },
      { tile: [1.8, 1.8], emissiveIntensity: 0.24 },
    );
    cm(
      "nx_tile",
      256,
      256,
      (x, W, H) => {
        x.fillStyle = "#6a665c";
        x.fillRect(0, 0, W, H);
        const r = K.rng(5111);
        for (let j = 0; j < 16; j++)
          for (let i = 0; i < 8; i++) {
            const off = (j % 2) * 16,
              v = (205 + r() * 25) | 0;
            x.fillStyle =
              r() < 0.04
                ? "#4a4840"
                : "rgb(" + v + "," + (v - 4) + "," + (v - 18) + ")";
            x.fillRect(i * 32 + off + 1, j * 16 + 1, 30, 14);
            x.fillRect(i * 32 + off + 1 - W, j * 16 + 1, 30, 14);
          }
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(40,36,28,0.1)");
        g.addColorStop(1, "rgba(40,36,28,0.4)");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        K.streaks(x, W, H, 24, 5112, 0.3);
        K.stains(x, W, H, 8, 5113, 0.3);
      },
      { tile: [1.3, 1.3], rough: 0.35, emissiveIntensity: 0.2 },
    );
    cm(
      "nx_checker",
      256,
      256,
      (x, W, H) => {
        for (let i = 0; i < 8; i++)
          for (let j = 0; j < 8; j++) {
            x.fillStyle = (i + j) % 2 ? "#22201c" : "#c4b89c";
            x.fillRect(i * 32, j * 32, 32, 32);
          }
        K.stains(x, W, H, 14, 5121, 0.55);
        K.grain(x, W, H, 24, 5122);
      },
      { tile: [2.4, 2.4], rough: 0.4, emissiveIntensity: 0.12 },
    );
    cm(
      "nx_tin",
      128,
      128,
      (x, W, H) => {
        x.fillStyle = "#6a6258";
        x.fillRect(0, 0, W, H);
        x.strokeStyle = "rgba(230,210,170,0.3)";
        x.lineWidth = 3;
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            x.strokeRect(i * 32 + 4, j * 32 + 4, 24, 24);
            x.beginPath();
            x.arc(i * 32 + 16, j * 32 + 16, 6, 0, 7);
            x.stroke();
          }
        K.stains(x, W, H, 8, 5131, 0.5);
      },
      { tile: [1.2, 1.2], rough: 0.55, metal: 0.3, emissiveIntensity: 0.14 },
    );
    cm(
      "nx_carpet",
      256,
      256,
      (x, W, H) => {
        x.fillStyle = "#6a1418";
        x.fillRect(0, 0, W, H);
        x.strokeStyle = "rgba(210,160,70,0.5)";
        x.lineWidth = 3;
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            const cx = i * 64 + 32,
              cy = j * 64 + 32;
            x.beginPath();
            x.moveTo(cx, cy - 22);
            x.lineTo(cx + 22, cy);
            x.lineTo(cx, cy + 22);
            x.lineTo(cx - 22, cy);
            x.closePath();
            x.stroke();
            x.beginPath();
            x.arc(cx, cy, 5, 0, 7);
            x.stroke();
          }
        K.stains(x, W, H, 14, 5141, 0.55);
        K.grain(x, W, H, 26, 5142);
      },
      { tile: [1.6, 1.6], rough: 1, emissiveIntensity: 0.16 },
    );
    cm(
      "nx_velvet",
      256,
      256,
      (x, W, H) => {
        for (let i = 0; i < W; i++) {
          const f =
            0.5 +
            0.5 * Math.sin((i / W) * PI * 2 * 9 + Math.sin(i * 0.05) * 0.6);
          x.fillStyle =
            "rgb(" +
            Math.round(70 + 100 * f) +
            "," +
            Math.round(10 + 18 * f) +
            "," +
            Math.round(16 + 16 * f) +
            ")";
          x.fillRect(i, 0, 1, H);
        }
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(0,0,0,0.55)");
        g.addColorStop(0.6, "rgba(0,0,0,0.05)");
        g.addColorStop(1, "rgba(255,190,110,0.3)");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        K.stains(x, W, H, 6, 5151, 0.3);
        K.grain(x, W, H, 14, 5152);
      },
      {
        tile: [8, 6],
        rough: 0.95,
        emissiveIntensity: 0.6,
        side: THREE.DoubleSide,
      },
    );
    cm(
      "nx_backdrop",
      1024,
      512,
      (x, W, H) => {
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#1a1438");
        g.addColorStop(0.55, "#7a2a5a");
        g.addColorStop(1, "#f09a4a");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        x.fillStyle = "#fff4d0";
        x.beginPath();
        x.arc(W * 0.78, H * 0.28, 46, 0, 7);
        x.fill();
        const r = K.rng(5161);
        for (let i = 0; i < 26; i++) {
          const bw = 20 + r() * 60,
            bh = 90 + r() * 280,
            bx = i * 40 + r() * 10;
          x.fillStyle = "#140c1c";
          x.fillRect(bx, H - bh, bw, bh);
          x.fillStyle = "rgba(255,210,120,0.7)";
          for (let k = 0; k < 14; k++)
            if (r() < 0.5)
              x.fillRect(
                bx + 4 + r() * (bw - 10),
                H - bh + 8 + r() * (bh - 16),
                4,
                5,
              );
        }
        x.fillStyle = "#140c1c";
        x.fillRect(W * 0.44, H - 430, 44, 430);
        x.beginPath();
        x.moveTo(W * 0.44, H - 430);
        x.lineTo(W * 0.44 + 22, H - 500);
        x.lineTo(W * 0.44 + 44, H - 430);
        x.fill(); // the ESB
        x.fillStyle = "rgba(255,240,200,0.9)";
        x.font = "italic bold 64px Georgia, serif";
        x.textAlign = "center";
        x.fillText("Neon Nights", W / 2, 90);
        K.stains(x, W, H, 16, 5162, 0.45);
        K.grain(x, W, H, 20, 5163);
      },
      { tile: [1, 1], emissiveIntensity: 0.55, rough: 1 },
    );
    cm(
      "nx_velvet_purple",
      256,
      256,
      (x, W, H) => {
        x.fillStyle = "#2a0e2e";
        x.fillRect(0, 0, W, H);
        x.fillStyle = "rgba(200,90,190,0.18)";
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            const cx = i * 64 + (j % 2) * 32 + 16,
              cy = j * 64 + 32;
            x.beginPath();
            x.moveTo(cx, cy - 22);
            x.lineTo(cx + 12, cy);
            x.lineTo(cx, cy + 22);
            x.lineTo(cx - 12, cy);
            x.fill();
          }
        K.stains(x, W, H, 8, 5171, 0.4);
        K.grain(x, W, H, 14, 5172);
      },
      { tile: [2, 2], emissiveColor: 0xff90e0, emissiveIntensity: 0.35 },
    );
  }

  // ------------------------------------------------------------------
  // Signs & posters (tsx atlases from 41_neon_town.js)
  // ------------------------------------------------------------------
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
  function shell(r, o) {
    const { x0, x1, z0, z1, h } = r,
      b = r.b;
    b.boxMM(o.floor, x0, -0.2, z0, x1, 0, z1, {
      faces: "t",
      grime: o.floorGrime !== undefined ? o.floorGrime : 0.4,
      tint: o.floorTint,
    });
    // o.split = {z: world z, h2}: south of z the ceiling steps up to h2 (a stair hall over an entrance landing)
    const sp = o.split,
      zc = sp ? sp.z : z1,
      h2 = sp ? sp.h2 : h,
      H = Math.max(h, h2);
    b.boxMM(o.ceil || "nx_tin", x0, h, z0, x1, h + 0.2, zc, {
      faces: "b",
      grime: 0.25,
      tint: o.ceilTint,
    });
    if (sp) {
      b.boxMM(o.ceil || "nx_tin", x0, h2, zc, x1, h2 + 0.2, z1, {
        faces: "b",
        grime: 0.25,
        tint: o.ceilTint,
      });
      b.boxMM(o.wall, x0, h, zc - 0.2, x1, h2, zc, {
        faces: "s",
        grime: 0.35,
        tint: o.wallTint,
      });
    }
    const wall = o.wall,
      dado = o.dado,
      dh = o.dadoH || 1.1,
      wt = o.wallTint,
      dt = o.dadoTint;
    const W = (fx0, fz0, fx1, fz1, face, hh) => {
      if (dado) {
        b.boxMM(dado, fx0, 0, fz0, fx1, dh, fz1, {
          faces: face,
          grime: 0.45,
          tint: dt,
        });
        b.boxMM(wall, fx0, dh, fz0, fx1, hh, fz1, {
          faces: face,
          grime: 0.3,
          tint: wt,
        });
      } else
        b.boxMM(wall, fx0, 0, fz0, fx1, hh, fz1, {
          faces: face,
          grime: 0.35,
          tint: wt,
        });
    };
    W(x0, z0 - 0.2, x1, z0, "s", h);
    W(x0, z1, x1, z1 + 0.2, "n", h2);
    W(x0 - 0.2, z0, x0, zc, "e", h);
    W(x1, z0, x1 + 0.2, zc, "w", h);
    if (sp) {
      W(x0 - 0.2, zc, x0, z1, "e", h2);
      W(x1, zc, x1 + 0.2, z1, "w", h2);
    }
    const trim = o.trim || "wood_dark";
    if (dado && o.rail !== false) {
      b.boxMM(
        o.railMat || "brass",
        x0,
        dh - 0.03,
        z0,
        x1,
        dh + 0.04,
        z0 + 0.04,
        {},
      );
      b.boxMM(
        o.railMat || "brass",
        x0,
        dh - 0.03,
        z1 - 0.04,
        x1,
        dh + 0.04,
        z1,
        {},
      );
      b.boxMM(
        o.railMat || "brass",
        x0,
        dh - 0.03,
        z0,
        x0 + 0.04,
        dh + 0.04,
        z1,
        {},
      );
      b.boxMM(
        o.railMat || "brass",
        x1 - 0.04,
        dh - 0.03,
        z0,
        x1,
        dh + 0.04,
        z1,
        {},
      );
    }
    if (o.cornice !== false) {
      b.boxMM(trim, x0, h - 0.22, z0, x1, h, z0 + 0.12, { faces: "sb" });
      b.boxMM(trim, x0, h - 0.22, z1 - 0.12, x1, h, z1, { faces: "nb" });
      b.boxMM(trim, x0, h - 0.22, z0, x0 + 0.12, h, z1, { faces: "eb" });
      b.boxMM(trim, x1 - 0.12, h - 0.22, z0, x1, h, z1, { faces: "wb" });
      b.boxMM(trim, x0, 0, z0, x1, 0.14, z0 + 0.03, { faces: "s" });
      b.boxMM(trim, x0, 0, z1 - 0.03, x1, 0.14, z1, { faces: "n" });
      b.boxMM(trim, x0, 0, z0, x0 + 0.03, 0.14, z1, { faces: "e" });
      b.boxMM(trim, x1 - 0.03, 0, z0, x1, 0.14, z1, { faces: "w" });
    }
    K.colBox(x0 - 0.5, 0, z0 - 0.5, x1 + 0.5, H, z0);
    K.colBox(x0 - 0.5, 0, z1, x1 + 0.5, H, z1 + 0.5);
    K.colBox(x0 - 0.5, 0, z0, x0, H, z1);
    K.colBox(x1, 0, z0, x1 + 0.5, H, z1);
    // entrance door on the south wall (on the entrance landing when r.entryY > 0): frame, leaf, push plate, kick plate,
    // a lit EXIT sign over it and a warm light pool in front, so the way out reads at a glance
    const dx = r.doorX,
      dw = o.doorW || 1.4,
      dhh = o.doorH || 2.4,
      ey = r.entryY;
    b.boxMM(
      o.doorFrame || "wood_dark",
      dx - dw / 2 - 0.14,
      ey,
      z1 - 0.1,
      dx - dw / 2,
      ey + dhh + 0.14,
      z1,
      {},
    );
    b.boxMM(
      o.doorFrame || "wood_dark",
      dx + dw / 2,
      ey,
      z1 - 0.1,
      dx + dw / 2 + 0.14,
      ey + dhh + 0.14,
      z1,
      {},
    );
    b.boxMM(
      o.doorFrame || "wood_dark",
      dx - dw / 2 - 0.14,
      ey + dhh,
      z1 - 0.1,
      dx + dw / 2 + 0.14,
      ey + dhh + 0.14,
      z1,
      {},
    );
    b.panel(o.doorLeaf || "wood", dx, ey + dhh / 2, z1 - 0.03, dw, dhh, PI, {
      tint: o.doorTint,
    });
    b.boxMM(
      "brass",
      dx + dw / 2 - 0.22,
      ey + 1.0,
      z1 - 0.09,
      dx + dw / 2 - 0.12,
      ey + 1.1,
      z1 - 0.05,
      {},
    );
    b.boxMM(
      "brass",
      dx - dw / 2 + 0.05,
      ey + 0.02,
      z1 - 0.06,
      dx + dw / 2 - 0.05,
      ey + 0.26,
      z1 - 0.04,
      { grime: 0.6 },
    );
    const ex = K.atlases.tsx_neon.slots.x_exit;
    b.box("black_metal", dx, ey + dhh + 0.22, z1 - 0.06, 0.72, 0.42, 0.08, {});
    b.panel(
      "tsxn",
      dx,
      ey + dhh + 0.45,
      z1 - 0.11,
      0.62,
      (0.62 * ex.h) / ex.w,
      PI,
      { rect: ex.rect },
    );
    r.g.add(dx, ey + dhh + 0.45, z1 - 0.3, 0xff3020, "s");
    r.sp.add(dx, z1 - 1.1, 0xff6040, 1.4, { y: ey + 0.03, i: 0.28 });
  }
  /** Hanging lamp: shade + bulb + glow + light pool (+ a borrowed real light for the big ones). */
  function lamp(r, x, z, o) {
    o = o || {};
    const y = o.y || r.h - 0.9,
      col = o.col || 0xffd29a,
      b = r.b;
    b.beam("black_metal", x, o.ceil || r.h, z, x, y + 0.2, z, 0.012);
    if (o.kind === "bulb") {
      b.box("black_metal", x, y + 0.12, z, 0.08, 0.1, 0.08, {});
      b.geo("lit_warm", T.sphereLo, { x, y, z, s: 0.07, tint: col });
      r.g.add(x, y, z, col, "m");
    } else if (o.kind === "cage") {
      b.geo("black_metal", T.cyl6, {
        x,
        y: y + 0.05,
        z,
        sx: 0.16,
        sy: 0.3,
        sz: 0.16,
      });
      b.geo("lit_warm", T.sphereLo, { x, y, z, s: 0.1, tint: col });
      r.g.add(x, y, z, col, "m");
    } else if (o.kind === "chandelier") {
      b.cyl("brass", x, y - 0.2, z, 0.1, 0.5, 0.5, 8, {});
      for (let k = 0; k < 8; k++) {
        const a = (k * PI) / 4,
          px = x + Math.cos(a) * 0.9,
          pz = z + Math.sin(a) * 0.9;
        b.beam("brass", x, y, z, px, y - 0.25, pz, 0.025);
        b.geo("lit_warm", T.sphereLo, {
          x: px,
          y: y - 0.18,
          z: pz,
          s: 0.08,
          tint: col,
        });
        r.g.add(px, y - 0.18, pz, col, "s");
      }
      for (let k = 0; k < 14; k++) {
        const a = k * 0.45,
          rr2 = 0.4 + (k % 3) * 0.2;
        b.geo("glass", T.cone4, {
          x: x + Math.cos(a) * rr2,
          y: y - 0.45 - (k % 2) * 0.15,
          z: z + Math.sin(a) * rr2,
          sx: 0.04,
          sy: 0.18,
          sz: 0.04,
          rx: PI,
        });
      }
      r.g.add(x, y - 0.2, z, col, "l");
    } else if (o.kind === "fluor") {
      const L = o.len || 1.3,
        yaw = o.yaw || 0,
        c = Math.cos(yaw),
        s = Math.sin(yaw);
      // troffer: steel housing on two chains, twin tubes, a frosted diffuser strip; three small halos along the tube
      // (two big 'm' halos read as a pair of orbs, not a strip light)
      b.box("metal", x, y + 0.06, z, 0.26, 0.07, L, { yaw });
      for (const e of [-0.42, 0.42])
        b.beam(
          "black_metal",
          x + s * L * e,
          r.h,
          z + c * L * e,
          x + s * L * e,
          y + 0.13,
          z + c * L * e,
          0.008,
        );
      for (const o2 of [-0.05, 0.05])
        b.geo("lit_white", T.cyl6, {
          x: x + c * o2,
          y: y + 0.02,
          z: z - s * o2,
          rx: PI / 2,
          ry: yaw,
          sx: 0.028,
          sy: L * 0.95,
          sz: 0.028,
        });
      b.box("lit_white", x, y - 0.02, z, 0.2, 0.012, L * 0.96, {
        yaw,
        tint: 0xd8e0e8,
      });
      for (const e of [-0.33, 0, 0.33])
        r.g.add(x + s * L * e, y - 0.05, z + c * L * e, col, "s");
    } else {
      // enamel shade
      b.cyl(o.shade || "paint_green", x, y, z, 0.34, 0.1, 0.24, 10, {
        top: true,
        grime: 0.3,
      });
      b.geo("lit_warm", T.sphereLo, { x, y: y - 0.02, z, s: 0.1, tint: col });
      r.g.add(x, y - 0.06, z, col, "m");
    }
    r.sp.add(x, z, col, o.pool || 3.2, {
      y: (o.fy || 0) + 0.03,
      i: o.i || 0.42,
    });
    if (o.light)
      r.fix.push([
        x,
        y - 0.2,
        z,
        col,
        { intensity: o.light, range: o.range || 9 },
      ]);
  }
  function poster(r, key, x, y, z, w, h, f) {
    const s = K.atlases.tsx_paint.slots[key];
    if (!s) return;
    r.b.panel("tsxi", x, y, z, w, h, f, { rect: s.rect, off: 0.02 });
  }
  function neonSign(r, key, x, y, z, w, f, col, cls) {
    const s = K.atlases.tsx_neon.slots[key];
    if (!s) return;
    const h = (w * s.h) / s.w;
    r.b.box(
      "black_metal",
      x - Math.sin(f) * 0.05,
      y - h / 2 - 0.05,
      z - Math.cos(f) * 0.05,
      w + 0.12,
      h + 0.1,
      0.06,
      { yaw: f },
    );
    r.b.panel("tsxn", x, y, z, w, h, f, { rect: s.rect, off: 0.02 });
    r.g.add(x + Math.sin(f) * 0.4, y, z + Math.cos(f) * 0.4, col, cls || "m");
    r.sp.add(x + Math.sin(f) * 1.4, z + Math.cos(f) * 1.4, col, 2.4, {
      y: 0.03,
      i: 0.3,
    });
  }
  function board(r, key, x, y, z, w, h, f) {
    const s = K.atlases.tsx_paint.slots[key];
    if (!s) return;
    P.signBoard(r.b, "tsxi", s.rect, x, y, z, w, h, f, {
      backMat: "wood_dark",
    });
  }
  /** Shelf unit (face f = the side you take things from), with goods. */
  function shelf(r, x, z, f, w, h, o) {
    o = o || {};
    const b = r.b,
      rr = K.rng(o.seed || Math.round(x * 13 + z * 7));
    const c = Math.cos(f),
      s = Math.sin(f),
      W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    b.box(o.mat || "wood", x, 0, z, w, h, 0.45, {
      yaw: f,
      faces: "nsewt",
      grime: 0.5,
    });
    const levels = Math.max(2, Math.floor(h / 0.5));
    for (let k = 1; k <= levels; k++) {
      const y = (k * h) / (levels + 1);
      const p = W(0, 0.2);
      b.box(o.mat || "wood", p[0], y, p[1], w, 0.03, 0.06, { yaw: f });
      for (let i = 0; i < Math.floor(w / 0.22); i++) {
        if (rr() < 0.25) continue;
        const q = W(-w / 2 + 0.12 + i * 0.22 + rr() * 0.04, 0.12 + rr() * 0.06);
        const kind = o.goods || "mixed",
          t = [0x8a3a2a, 0x3a5a7a, 0xc8a040, 0x5a7a3a, 0xd8d0c0, 0x6a4a8a][
            Math.floor(rr() * 6)
          ];
        if (kind === "bottles" || (kind === "mixed" && rr() < 0.4))
          b.cyl(
            rr() < 0.3 ? "lit_warm" : "glass",
            q[0],
            y + 0.03,
            q[1],
            0.035,
            0.03,
            0.26,
            6,
            { tint: rr() < 0.3 ? 0x8a5a2a : t },
          );
        else if (kind === "radios") {
          b.box("wood_dark", q[0], y + 0.03, q[1], 0.2, 0.16, 0.12, { yaw: f });
          const dq = W(-w / 2 + 0.12 + i * 0.22, 0.2);
          b.geo("lit_warm", T.sphereLo, {
            x: dq[0],
            y: y + 0.11,
            z: dq[1],
            s: 0.025,
            tint: 0xffa040,
          });
        } else if (kind === "cans")
          b.cyl("metal", q[0], y + 0.03, q[1], 0.05, 0.05, 0.12, 6, {
            tint: t,
          });
        else
          b.box(
            rr() < 0.5 ? "fabric" : "metal",
            q[0],
            y + 0.03,
            q[1],
            0.14 + rr() * 0.08,
            0.1 + rr() * 0.18,
            0.14,
            { yaw: f + rr() * 0.4, tint: t, grime: 0.4 },
          );
      }
    }
    K.colRot(x, z, w, 0.45, 0, h, f, { surface: "wood" });
  }
  function cot(r, x, z, yaw, o) {
    o = o || {};
    const b = r.b,
      c = Math.cos(yaw),
      s = Math.sin(yaw),
      W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    b.box("metal_dark", x, 0.32, z, 0.9, 0.06, 1.95, { yaw });
    for (const q of [
      [-0.42, -0.92],
      [0.42, -0.92],
      [-0.42, 0.92],
      [0.42, 0.92],
    ]) {
      const p = W(q[0], q[1]);
      b.beam(
        "metal_dark",
        p[0],
        0,
        p[1],
        p[0],
        q[1] < 0 ? 0.75 : 0.5,
        p[1],
        0.035,
      );
    }
    b.box("fabric", x, 0.38, z, 0.84, 0.12, 1.86, {
      yaw,
      tint: o.tint || 0xb8a888,
      grime: 0.7,
    });
    const pl = W(0, -0.72);
    b.box("fabric", pl[0], 0.5, pl[1], 0.55, 0.1, 0.32, {
      yaw,
      tint: 0xd8d0c0,
      grime: 0.5,
    });
    const bl = W(0, 0.3);
    b.box("fabric", bl[0], 0.5, bl[1], 0.88, 0.05, 1.1, {
      yaw: yaw + 0.04,
      tint: o.blanket || 0x5a4a6a,
      grime: 0.5,
    });
    K.colRot(x, z, 0.9, 1.95, 0, 0.5, yaw, { surface: "carpet" });
  }
  function locker(r, x, z, f, n, o) {
    o = o || {};
    const b = r.b,
      c = Math.cos(f),
      s = Math.sin(f),
      W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    for (let i = 0; i < n; i++) {
      const p = W((i - (n - 1) / 2) * 0.46, 0);
      b.box(o.mat || "paint_green", p[0], 0, p[1], 0.44, 1.9, 0.45, {
        yaw: f,
        grime: 0.5,
        tint: o.tint,
      });
      const q = W((i - (n - 1) / 2) * 0.46, 0.23);
      for (let k = 0; k < 3; k++)
        b.box("black_metal", q[0], 1.5 + k * 0.08, q[1], 0.26, 0.02, 0.02, {
          yaw: f,
        });
      if (i % 3 === 1) {
        const dd = W((i - (n - 1) / 2) * 0.46 + 0.1, 0.4);
        b.box(o.mat || "paint_green", dd[0], 0.05, dd[1], 0.42, 1.8, 0.03, {
          yaw: f + 0.9,
          tint: o.tint,
        });
      }
    }
    K.colRot(x, z, n * 0.46, 0.45, 0, 1.9, f, { surface: "metal" });
  }
  function sofa(r, x, z, f, w, col) {
    const b = r.b,
      c = Math.cos(f),
      s = Math.sin(f),
      W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    b.box("fabric", x, 0, z, w, 0.45, 0.85, { yaw: f, tint: col, grime: 0.5 });
    const bk = W(0, -0.35);
    b.box("fabric", bk[0], 0.45, bk[1], w, 0.5, 0.2, {
      yaw: f,
      tint: col,
      grime: 0.5,
    });
    for (const sd of [-1, 1]) {
      const a = W(sd * (w / 2 - 0.1), 0);
      b.box("fabric", a[0], 0.45, a[1], 0.2, 0.22, 0.85, {
        yaw: f,
        tint: col,
        grime: 0.5,
      });
    }
    K.colRot(x, z, w, 0.85, 0, 0.45, f, { surface: "carpet" });
  }
  // lived-in floors: litter drifts, stains and scuffs in free floor spots (never on the way in / out), corner junk
  const CLUTTER = {
    clinic: 0.45,
    gallery: 1,
    robo: 1.2,
    pawn: 0.35,
    opry: 0.7,
    oracle: 0.3,
    mayor: 0.35,
    power: 1.3,
    depot: 1.3,
    bunk: 1.0,
    barracks: 0.6,
    club: 0.15,
    speak: 1.0,
  };
  function clutter(r) {
    const k = CLUTTER[r.key] !== undefined ? CLUTTER[r.key] : 0.6;
    if (!k || !K.dclGround) return;
    const Wd = G.world,
      rr = K.rng(r.key.length * 131 + Math.round(r.cx));
    const free = (x, z, rds) => {
      for (const c of Wd.query(
        x - rds - 0.5,
        z - rds - 0.5,
        x + rds + 0.5,
        z + rds + 0.5,
      ))
        if (c.maxY > 0.15 && c.minY < 2.0 && Wd.pointInCollider(c, x, z, rds))
          return false;
      return true;
    };
    const nearDoor = (x, z) => Math.hypot(x - r.doorX, z - (r.z1 - 1.2)) < 2.2;
    const area = (r.x1 - r.x0) * (r.z1 - r.z0),
      n = Math.round((area / 7) * k);
    let placed = 0;
    for (let i = 0; i < n * 4 && placed < n; i++) {
      const x = r.x0 + 0.5 + rr() * (r.x1 - r.x0 - 1),
        z = r.z0 + 0.5 + rr() * (r.z1 - r.z0 - 1);
      if (
        nearDoor(x, z) ||
        !free(x, z, 0.25) ||
        Wd.groundHeight(x, z, 0.4, 0) > 0.05
      )
        continue;
      const q = rr();
      if (q < 0.55)
        K.dclGround(
          r.b,
          rr() < 0.5 ? "litter1" : "litter2",
          x,
          z,
          0.6 + rr() * 0.6,
          0.6 + rr() * 0.6,
          rr() * 6.3,
          { y: 0.012 + (placed % 5) * 0.002 },
        );
      else
        K.dclGround(
          r.b,
          q < 0.8 ? "stain" : "crack",
          x,
          z,
          0.8 + rr() * 1.4,
          0.8 + rr() * 1.4,
          rr() * 6.3,
          { y: 0.01 + (placed % 5) * 0.002 },
        );
      placed++;
    }
    // junk in two corners: a squashed carton, a bottle, a scatter of paper
    for (const c of [
      [r.x0 + 0.45, r.z0 + 0.45],
      [r.x1 - 0.45, r.z0 + 0.45],
    ]) {
      if (rr() > k || !free(c[0], c[1], 0.3)) continue;
      r.b.box("wood", c[0], 0, c[1], 0.45, 0.28, 0.35, {
        yaw: rr() * 3,
        tint: 0xb89a70,
        grime: 0.7,
      });
      r.b.cyl("glass", c[0] + 0.3, 0, c[1] + 0.1, 0.04, 0.04, 0.24, 6, {
        tint: 0x5a7a3a,
      });
    }
  }
  function finish(r) {
    try {
      clutter(r);
    } catch (e) {
      G.reportError("landmarks_a:neon_clutter_" + r.key, e);
    }
    r.b.finish(r.grp, { cast: false });
    r.g.finish(r.grp, { interior: true, nightOpacity: 0.9, dayOpacity: 0.9 });
    r.sp.finish(r.grp, { interior: true, night: 1 });
    try {
      if (!G.isStub("atmos") && G.atmos && G.atmos.addFixtureLight)
        for (const f of r.fix)
          G.atmos.addFixtureLight(
            new THREE.Vector3(f[0], f[1], f[2]),
            f[3],
            f[4],
          );
    } catch (e) {
      G.reportError("landmarks_a:neon_fixtures", e);
    }
  }
  let P = null;

  // ------------------------------------------------------------------
  // Containers & story beats bound to OUR furniture.
  // props turns every loot* / safe / desk / locker / … anchor into a NEW container prop, which put a second safe, desk or
  // duffle bag inside the safes and desks these rooms already model. Those anchors are now registered NON-enumerable
  // (G.landmarks.getAnchor still finds them; props' anchor scan skips them) and the container is created on our own
  // geometry (model:false) once the rpg module is up. Terminals / notes / tape reels / keys / workbenches: same timing.
  //
  // LOCKS (G.locks; registered at build and again at initDone, the unlock is always in these rooms or on the street):
  //   lma_neon_clinic_chems     code 3186  — clinic intake terminal, "Inventory (restricted)"
  //   lma_neon_pawn_safe        code 7041  — bar napkin on a card table in the Speakeasy
  //   lma_neon_mayor_desk       key lma_neon_mayor_desk_key — on top of the Mayor's filing cabinets
  //   lma_neon_mayor_safe       code 1927  — Crowe's memo inside the Mayor's desk
  //   lma_neon_depot_strongbox  code 5509  — freight depot terminal, "Memo — Guard Escort Rates"
  //   lma_neon_armory_ammo      code 2618  — barracks terminal, "Standing Orders"
  //   lma_neon_speakeasy_gate   code 20142 — chalk scrawl beside the 42nd St gate (41_neon_town.js, Read)
  // ------------------------------------------------------------------
  const CONTAINERS = [],
    STORY = [],
    LOCKS = [];
  /** Declare a lock (audit + cheat menu); kept so it can be re-registered once the locks module is up. */
  function lock(spec) {
    LOCKS.push(spec);
    K.lockReg(spec);
    return spec;
  }
  /** A code / passcode the player has just read or heard. */
  const learn = (id) => K.lockLearn(id);
  function hiddenAnchor(rec, name, x, y, z, yaw) {
    const v = new THREE.Vector3(x, y, z);
    v.yaw = yaw || 0;
    Object.defineProperty(rec.anchors, name, {
      value: v,
      enumerable: false,
      configurable: true,
      writable: true,
    });
    return v;
  }
  /** o: {id, name, kind, loot, lock?:{G.locks spec}, items?, x, y (interaction height), z, anchor?:[name, yaw]} (world coords). */
  function addContainer(rec, o) {
    if (o.anchor) hiddenAnchor(rec, o.anchor[0], o.x, 0, o.z, o.anchor[1] || 0);
    if (o.lock) lock(o.lock);
    CONTAINERS.push(o);
  }
  /** Items that only live inside our containers (defined before the containers are filled). */
  const INNER_ITEMS = [];
  function defineItem(d) {
    try {
      if (!G.isStub("items") && G.items.define && !G.items.get(d.id))
        G.items.define(d);
    } catch (e) {
      G.reportError("landmarks_a:neon_item_" + d.id, e);
    }
  }
  function spawnWorldBits() {
    for (const l of LOCKS) K.lockReg(l);
    for (const d of INNER_ITEMS) defineItem(d);
    if (!G.isStub("containers") && G.containers && G.containers.create) {
      for (const c of CONTAINERS) {
        if (c.made) continue;
        c.made = true;
        // (owner: the shared faction id of the Neon's townsfolk, the settlers)
        try {
          G.containers.create({
            id: c.id,
            name: c.name,
            kind: c.kind,
            loot: c.loot,
            items: c.items,
            locked: 0,
            lock: c.lock || null,
            owner: c.owner === undefined ? "settlers" : c.owner,
            pos: { x: c.x, y: c.y - 0.4, z: c.z },
            model: false,
            radius: c.r || 0.7,
          });
        } catch (e) {
          G.reportError("landmarks_a:neon_container", e);
        }
      }
    }
    for (const s of STORY) {
      if (s.made) continue;
      try {
        if (s.kind === "terminal") {
          if (G.isStub("props") || !G.props.spawn) continue;
          if (!G.isStub("terminals") && G.terminals.register)
            G.terminals.register(s.tid, s.def);
          // (props models face local −z, i.e. the player-yaw convention: our three.js facing yaw + π)
          G.props.spawn("terminal", {
            x: s.x,
            y: s.y,
            z: s.z,
            yaw: s.yaw + PI,
            terminalId: s.tid,
            mount: "bare",
            id: "lma:" + s.tid,
            persistent: true,
          });
        } else if (s.kind === "workbench" || s.kind === "radio") {
          if (G.isStub("props") || !G.props.spawn) continue;
          G.props.spawn(s.kind, {
            x: s.x,
            y: s.y,
            z: s.z,
            yaw: s.yaw + PI,
            id: "lma:" + s.id,
            persistent: true,
          });
        } else if (s.kind === "note" || s.kind === "tape" || s.kind === "key") {
          if (G.isStub("items") || !G.items.define || !G.items.spawnPickup)
            continue;
          const base =
            s.kind === "key"
              ? {
                  type: "key",
                  weight: 0,
                  value: 0,
                  tags: ["key"],
                  mesh: "key",
                  noLoot: true,
                }
              : { type: s.kind, weight: 0, value: 0 };
          if (!G.items.get(s.item.id))
            G.items.define(Object.assign(base, s.item));
          G.items.spawnPickup(
            s.item.id,
            1,
            { x: s.x, y: s.y, z: s.z },
            { static: true, yaw: s.yaw || 0 },
          );
        }
        s.made = true;
      } catch (e) {
        s.made = true;
        G.reportError(
          "landmarks_a:neon_story_" + (s.tid || s.id || (s.item && s.item.id)),
          e,
        );
      }
    }
  }
  if (G.events) {
    G.events.on("initDone", spawnWorldBits);
    G.events.on("newGame", spawnWorldBits);
    G.events.on("loaded", spawnWorldBits);
  }
  /** Terminal on one of our desks (world coords; y = desk top; yaw = the direction the screen faces, three.js). */
  function terminal(tid, x, y, z, yaw, def) {
    STORY.push({ kind: "terminal", tid, x, y, z, yaw, def });
  }
  function note(id, x, y, z, item, kind) {
    STORY.push({
      kind: kind || "note",
      x,
      y,
      z,
      item: Object.assign({ id }, item),
    });
  }
  /** A key item lying on our furniture. */
  function keyItem(id, x, y, z, item) {
    STORY.push({ kind: "key", x, y, z, item: Object.assign({ id }, item) });
  }

  // ------------------------------------------------------------------
  // Doors (street façade ↔ room entrance)
  // ------------------------------------------------------------------
  function doors(rec, r, e, label, o) {
    o = o || {};
    const nx = Math.sin(e.f),
      nz = Math.cos(e.f);
    // arrival inside: 1.5 m in from the door on the entrance landing, facing into the room (r.entryYaw); back on the street:
    // 1.7 m out from the façade door, facing away from it (the exact spot is validated by DOOR_AUDIT in shot/smoke runs)
    const inT = { x: r.doorX, y: r.entryY, z: r.z1 - 1.5, yaw: r.entryYaw };
    const outT = {
      x: e.x + nx * (e.out || 1.7),
      y: 0,
      z: e.z + nz * (e.out || 1.7),
      yaw: AY(e.f),
    };
    const def = {
      pos: new THREE.Vector3(e.x + nx * 0.35, 1.5, e.z + nz * 0.35),
      radius: 1.3,
      label,
      verb: "Enter",
      target: inT,
      sound: o.sound || "door_open",
    };
    if (o.lock) {
      def.lock = lock(o.lock);
      def.id = o.lock.id;
    }
    G.world.addDoor(def);
    G.world.addDoor({
      pos: new THREE.Vector3(r.doorX, r.entryY + 1.5, r.z1 - 0.35),
      radius: 1.3,
      label: o.exitLabel || "Times Square",
      verb: "Exit to",
      target: outT,
      sound: o.sound || "door_open",
    });
    rec.anchor(r.key + "_entrance", inT.x, inT.y, inT.z, inT.yaw);
    DOOR_AUDIT.push({
      key: r.key,
      label,
      room: r,
      street: { x: e.x, z: e.z, f: e.f },
      inT,
      outT,
    });
  }
  const DOOR_AUDIT = [];

  // ------------------------------------------------------------------
  // THE PLACES
  // ------------------------------------------------------------------
  function clinic(rec, O) {
    const r = Room("clinic", O.x - 70, O.z - 70, 14, 10, 3.6, { doorAt: -3.0 });
    shell(r, {
      floor: "nx_checker",
      floorTint: 0xd8e8d8,
      wall: "nx_paper",
      wallTint: 0xd8e4dc,
      dado: "nx_tile",
      dadoH: 1.4,
      trim: "wood_dark",
      doorLeaf: "glass",
      doorFrame: "brass",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // reception — the old box-office counter with a brass grille, the doctor behind it
    r.bx("wood_dark", 1.2, 0, 1.2, 6.8, 1.1, 1.8, {});
    r.bx("marble", 1.1, 1.1, 1.1, 6.9, 1.16, 1.9, {});
    r.col(1.2, 0, 1.2, 6.8, 1.16, 1.8);
    for (let k = 0; k < 16; k++)
      r.b.beam(
        "brass",
        r.X(1.35 + k * 0.35),
        1.16,
        r.Z(1.45),
        r.X(1.35 + k * 0.35),
        2.3,
        r.Z(1.45),
        0.015,
      );
    r.bx("brass", 1.2, 2.3, 1.35, 6.8, 2.38, 1.55, {});
    r.bx("nx_plaster", 0.5, 0, -0.45, 7, 3.6, -0.3, { tint: 0xd8e4dc });
    r.col(0.5, 0, -0.45, 7, 3.6, -0.3); // back of the box office
    for (const lx of [2.2, 4.8])
      r.bx("black_metal", lx - 0.4, 1.16, 1.3, lx + 0.4, 1.19, 1.6, {
        tint: 0x222222,
      }); // ticket slots
    r.b.box("metal_dark", r.X(5.8), 1.16, r.Z(1.5), 0.45, 0.3, 0.35, {}); // register
    poster(r, "q_price", r.X(3.5), 2.05, r.Z(-0.28), 1.4, 0.93, 0);
    poster(r, "q_tonic", r.X(5.8), 1.95, r.Z(-0.28), 0.7, 0.92, 0);
    A("clinic_doctor", 3.4, 0.4, PI); // behind the counter, facing the waiting room (south)
    // partition between the waiting room and the surgery (curtained doorway)
    r.bx("nx_plaster", -7, 0, -0.55, -2.6, 3.6, -0.4, { tint: 0xd8e4dc });
    r.bx("nx_plaster", -0.9, 0, -0.55, 0.5, 3.6, -0.4, { tint: 0xd8e4dc });
    r.bx("nx_plaster", -2.6, 2.3, -0.55, -0.9, 3.6, -0.4, { tint: 0xd8e4dc });
    r.col(-7, 0, -0.55, -2.6, 3.6, -0.4);
    r.col(-0.9, 0, -0.55, 0.5, 3.6, -0.4);
    // tiled partition skirting + a frosted SURGERY panel so the wall reads as a real partition, not a paper screen
    r.bx("nx_tile", -7, 0, -0.38, -2.6, 1.2, -0.36, { tint: 0xc8d8d0 });
    r.bx("nx_tile", -0.9, 0, -0.38, 0.5, 1.2, -0.36, { tint: 0xc8d8d0 });
    r.bx("wood_dark", -7, 1.2, -0.39, -2.6, 1.26, -0.35, {});
    r.bx("wood_dark", -0.9, 1.2, -0.39, 0.5, 1.26, -0.35, {});
    r.b.panel("glass", r.X(-4.8), 2.0, r.Z(-0.36), 2.4, 0.9, 0, {
      tint: 0xc0d8d0,
    });
    r.b.beam(
      "chrome",
      r.X(-2.6),
      2.25,
      r.Z(-0.48),
      r.X(-0.9),
      2.25,
      r.Z(-0.48),
      0.02,
    );
    r.bx("fabric", -2.6, 0.35, -0.5, -2.1, 2.2, -0.46, { tint: 0xe8e4d8 });
    // waiting room: benches along the west wall, magazines, a dead ficus, posters
    for (const lz of [1.5, 3.4]) {
      r.bx("wood", -6.8, 0.42, lz - 0.8, -6.3, 0.48, lz + 0.8, {});
      r.bx("wood", -6.95, 0.48, lz - 0.8, -6.85, 1.0, lz + 0.8, {});
      r.b.beam(
        "black_metal",
        r.X(-6.55),
        0,
        r.Z(lz - 0.7),
        r.X(-6.55),
        0.42,
        r.Z(lz - 0.7),
        0.04,
      );
      r.b.beam(
        "black_metal",
        r.X(-6.55),
        0,
        r.Z(lz + 0.7),
        r.X(-6.55),
        0.42,
        r.Z(lz + 0.7),
        0.04,
      );
      r.col(-6.95, 0, lz - 0.8, -6.3, 0.48, lz + 0.8, { surface: "wood" });
    }
    A("clinic_waiting_1", -6.55, 1.2, -PI / 2);
    A("clinic_waiting_2", -6.55, 3.6, -PI / 2);
    r.b.cyl("nx_brick", r.X(-6.4), 0, r.Z(4.5), 0.25, 0.2, 0.45, 8, {
      tint: 0x8a4a2a,
    });
    P.deadTree &&
      P.deadTree(r.b, r.X(-6.4), r.Z(4.5), 1.6, { seed: 77, y: 0.45 });
    poster(r, "q_tonic", r.X(-6.98), 2.2, r.Z(2.5), 0.8, 1.05, PI / 2);
    poster(r, "q_purge", r.X(-4.2), 2.2, r.Z(4.98), 0.8, 1.05, PI);
    // the surgery: operating table under a big surgical lamp, instrument cart, IV stand, autoclave, sink
    r.bx("nx_tile", -7, 0.01, -5, 0.3, 0.02, -0.55, {
      faces: "t",
      tint: 0xe8f0ec,
    });
    const ot = [-3.8, -2.9];
    r.bx(
      "chrome",
      ot[0] - 0.12,
      0,
      ot[1] - 0.12,
      ot[0] + 0.12,
      0.8,
      ot[1] + 0.12,
      {},
    );
    r.bx(
      "metal",
      ot[0] - 0.4,
      0.8,
      ot[1] - 1.0,
      ot[0] + 0.4,
      0.92,
      ot[1] + 1.0,
      { tint: 0x9aa8a0 },
    );
    r.bx(
      "fabric",
      ot[0] - 0.36,
      0.92,
      ot[1] - 0.95,
      ot[0] + 0.36,
      0.97,
      ot[1] + 0.95,
      { tint: 0xd8e4dc, grime: 0.6 },
    );
    r.b.burn(r.X(ot[0]), 0.95, r.Z(ot[1]), 0.6, 0.35);
    r.col(ot[0] - 0.4, 0, ot[1] - 1.0, ot[0] + 0.4, 0.97, ot[1] + 1.0, {
      surface: "metal",
    });
    r.b.beam(
      "black_metal",
      r.X(ot[0]),
      3.6,
      r.Z(ot[1]),
      r.X(ot[0]),
      2.6,
      r.Z(ot[1]),
      0.04,
    );
    r.b.cyl("paint_white", r.X(ot[0]), 2.3, r.Z(ot[1]), 0.62, 0.3, 0.3, 14, {
      top: true,
    });
    for (let k = 0; k < 6; k++) {
      const a = (k * PI) / 3;
      r.b.geo("lit_white", T.sphereLo, {
        x: r.X(ot[0] + Math.cos(a) * 0.35),
        y: 2.28,
        z: r.Z(ot[1] + Math.sin(a) * 0.35),
        s: 0.08,
      });
    }
    r.g.add(r.X(ot[0]), 2.2, r.Z(ot[1]), 0xf0faff, "l");
    r.sp.add(r.X(ot[0]), r.Z(ot[1]), 0xf0faff, 2.6, { y: 0.03, i: 0.6 });
    r.fix.push([
      r.X(ot[0]),
      2.1,
      r.Z(ot[1]),
      0xeef8ff,
      { intensity: 1.6, range: 8 },
    ]);
    r.bx("chrome", -2.4, 0, -4.2, -1.8, 0.85, -3.8, {});
    for (let k = 0; k < 5; k++)
      r.b.box("chrome", r.X(-2.3 + k * 0.1), 0.86, r.Z(-4.0), 0.02, 0.01, 0.2, {
        yaw: k * 0.3,
      });
    r.b.beam(
      "chrome",
      r.X(-4.9),
      0,
      r.Z(-2.2),
      r.X(-4.9),
      1.9,
      r.Z(-2.2),
      0.02,
    );
    r.b.geo("glass", T.sphereLo, {
      x: r.X(-4.9),
      y: 1.75,
      z: r.Z(-2.1),
      sx: 0.1,
      sy: 0.16,
      sz: 0.06,
      tint: 0xc03020,
    });
    r.bx("steel", -6.8, 0, -4.8, -5.8, 1.0, -4.2, {});
    r.bx("steel", -6.8, 1.0, -4.8, -5.8, 1.02, -4.2, {});
    r.col(-6.8, 0, -4.8, -5.8, 1.02, -4.2); // sink / autoclave bench
    A("clinic_nurse", -2.6, -2.9, PI / 2);
    // the chem cabinet (east wall, glass front, glowing bottles) = loot2 (props container)
    const cx0 = 5.4,
      cz0 = -4.55;
    r.bx("paint_white", cx0 - 1.0, 0, cz0 - 0.4, cx0 + 1.0, 2.1, cz0 + 0.35, {
      grime: 0.5,
    });
    r.col(cx0 - 1.0, 0, cz0 - 0.4, cx0 + 1.0, 2.1, cz0 + 0.35);
    r.b.panel("glass", r.X(cx0), 1.35, r.Z(cz0 + 0.37), 1.8, 1.3, 0, {});
    for (let i = 0; i < 3; i++)
      for (let k = 0; k < 7; k++) {
        r.b.cyl(
          "lit_warm",
          r.X(cx0 - 0.8 + k * 0.26),
          0.8 + i * 0.44,
          r.Z(cz0 + 0.1),
          0.05,
          0.05,
          0.2,
          6,
          { tint: [0xff6030, 0x60c0ff, 0x80ff80, 0xffd040][(i + k) % 4] },
        );
      }
    r.g.add(r.X(cx0), 1.4, r.Z(cz0 + 0.6), 0x9ad8ff, "m");
    addContainer(rec, {
      id: "lma_neon_clinic_chems",
      name: "Drug Cabinet",
      kind: "medical_cabinet",
      loot: "medical_cabinet",
      lock: {
        id: "lma_neon_clinic_chems",
        label: "Clinic Drug Cabinet",
        code: "3186",
        hint: 'Clinic intake terminal, "Inventory (restricted)"',
        learnedFrom: 'Clinic intake terminal, "Inventory (restricted)"',
      },
      x: r.X(cx0),
      y: 1.3,
      z: r.Z(cz0 + 0.45),
      anchor: ["loot2", PI],
    });
    // recovery: two beds with a curtain rail
    cot(r, r.X(2.3), r.Z(-3.6), 0, { blanket: 0xc8d8d0 });
    cot(r, r.X(0.8), r.Z(-3.6), 0, { blanket: 0xc8d8d0 });
    A("clinic_bed_1", 2.3, -3.6, 0);
    A("clinic_bed_2", 0.8, -3.6, 0);
    r.b.beam(
      "chrome",
      r.X(1.55),
      2.3,
      r.Z(-4.9),
      r.X(1.55),
      2.3,
      r.Z(-2.3),
      0.02,
    );
    r.bx("fabric", 1.52, 0.4, -4.9, 1.58, 2.28, -3.2, { tint: 0xd8e8dc });
    // red cross on the surgery wall + a painted one in the waiting room
    r.bx("paint_red", -4.3, 2.2, -4.99, -3.3, 2.5, -4.96, {});
    r.bx("paint_red", -3.95, 1.85, -4.99, -3.65, 2.85, -4.96, {});
    poster(r, "q_eyes", r.X(6.98), 2.0, r.Z(3.2), 0.7, 0.92, -PI / 2);
    for (const q of [
      [-4, 2.5],
      [3.5, 3.0],
      [-3.5, -2.6],
      [2.0, -2.8],
    ])
      lamp(r, r.X(q[0]), r.Z(q[1]), {
        kind: "fluor",
        y: 3.45,
        col: 0xeaf6ff,
        len: 1.3,
        pool: 3.4,
        i: 0.45,
      });
    r.fix.push([
      r.X(3.5),
      3.2,
      r.Z(2.8),
      0xfff0d8,
      { intensity: 1.0, range: 8 },
    ]);
    // story: the intake teletype on the box-office counter, Doc's surgical tape reel on the instrument cart
    terminal("lma_neon_clinic", r.X(6.3), 1.16, r.Z(1.45), 0, {
      title: "BROADWAY MEDICAL · PATIENT INTAKE",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK · BROADWAY MEDICAL (ONCE THE SHUBERT BOX OFFICE)",
      entries: [
        {
          title: "Welcome, Patient!",
          text: 'Please take a number. Numbers are on the floor, where the last patient dropped them.\n\nDoc Broadway sees locals and topsiders alike. Payment in scrip, meds, or anything that still works. We do NOT accept pack oxen, IOUs or "I know the Mayor".',
        },
        {
          title: "Price Schedule",
          text: "PATCH-UP ........ 30\nRAD FLUSH ....... 60\nBURN GRAFT ...... 80\nADDICTION ....... 90\nTHE WORKS ...... ASK\n\nGrafts are done in the order you arrive. Bring your own clean cloth.",
        },
        {
          title: "Doc's Notes — Maniacs",
          text: 'Third patient this month asking if "going Maniac" is catching. It is not. It is radiation sickness that got into the head: hot water, hot food, hot ground, year after year. Boil your water. Take your Prussian Blue. Come to the Opry, argue with the Mayor, buy a book from Goldie. Stay a person.\n\n— B.',
        },
        {
          title: "Inventory (restricted)",
          text: () => {
            learn("lma_neon_clinic_chems");
            return 'Rally Tonic: 14 bottles (2 gone flat, do not tell Nurse Ivy)\nPrussian Blue: 9\nMorphine syrettes: 6 — locked in the chem cabinet\nBull tabs: confiscated from the Guard, pending an argument\nBandages: see "curtains, old".\n\nCABINET COMBINATION: 3-1-8-6. Ivy — stop writing it on your hand.';
          },
        },
      ],
    });
    note(
      "lma_neon_reel_surgery",
      r.X(-2.1),
      0.87,
      r.Z(-4.0),
      {
        name: "Tape Reel: Surgical Log #212",
        title: "Surgical Log #212",
        value: 5,
        text: '[Recording. Clatter of instruments.]\n\nLog two-twelve. Patient: male, sixty-one, old burn scarring from \'67, the usual. Complaint: left arm came out of its socket at the Rad Room. Patient insists it was "a clean break". It was not.\n\nPut back with a knee, a strap and faith. Prognosis: he will wave funny for a month. Advised to stop arm-wrestling the bartender.\n\n[Pause.] Ivy, where is my good scalpel? No, the OTHER good scalpel.\n\n[Recording ends.]',
      },
      "tape",
    );
    finish(r);
    return r;
  }

  function gallery(rec, O) {
    const r = Room("gallery", O.x - 25, O.z - 70, 8, 20, 4.2, { doorAt: 0 });
    shell(r, {
      floor: "nx_wood",
      wall: "nx_paper",
      wallTint: 0xc86a4a,
      dado: "nx_wood",
      dadoTint: 0x6a3a1e,
      trim: "wood_dark",
      doorLeaf: "wood",
      doorTint: 0x9a2a1a,
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // the counter with rifle rests across the room, a gap for Annie at the east end
    r.bx("wood_dark", -4, 0, 5.4, 2.6, 1.05, 6.0, {});
    r.bx("wood", -4, 1.05, 5.3, 2.6, 1.12, 6.1, {});
    r.col(-4, 0, 5.4, 2.6, 1.12, 6.0, { surface: "wood" });
    for (const lx of [-2.6, 0, 2.2]) {
      r.b.box("black_metal", r.X(lx), 1.12, r.Z(5.7), 0.3, 0.12, 0.2, {});
      r.b.beam(
        "chrome",
        r.X(lx - 0.6),
        1.17,
        r.Z(5.6),
        r.X(lx - 0.6),
        1.17,
        r.Z(4.6),
        0.03,
      );
    }
    r.bx("wood_dark", 3.2, 0, 5.4, 4, 1.05, 6.0, {});
    r.col(3.2, 0, 5.4, 4, 1.05, 6.0);
    A("gallery_range", 0, 6.8, 0);
    A("gallery_owner", 2.9, 6.6, 1.2);
    // lanes: floor strips, dividers (low), the back wall painted as a raider camp, three rows of tin targets on rails
    for (const lx of [-1.35, 1.35])
      r.bx("wood_dark", lx - 0.05, 0, -9.5, lx + 0.05, 0.9, 5.2, {});
    r.bx("wood", -4, 0.01, -10, 4, 0.02, 5.2, { faces: "t", tint: 0x8a6a4a });
    r.bx("nx_plaster", -3.9, 0, -9.9, 3.9, 4.1, -9.8, {
      tint: 0xc89a6a,
      grime: 0.8,
    });
    const rr = K.rng(3131);
    for (let k = 0; k < 60; k++)
      r.b.box(
        "black_metal",
        r.X(-3.6 + rr() * 7.2),
        0.5 + rr() * 2.8,
        r.Z(-9.79),
        0.05,
        0.05,
        0.01,
        { tint: 0x111111 },
      ); // bullet holes
    for (let row = 0; row < 3; row++) {
      const y = 0.8 + row * 0.9,
        lz = -9.2 + row * 0.2;
      r.b.beam("chrome", r.X(-3.8), y, r.Z(lz), r.X(3.8), y, r.Z(lz), 0.025);
      for (let k = 0; k < 7; k++) {
        const lx = -3.3 + k * 1.1 + (row % 2) * 0.4,
          t = rr();
        if (row === 1) {
          r.b.cyl("metal", r.X(lx), y + 0.02, r.Z(lz), 0.12, 0.12, 0.28, 8, {
            tint: [0xc02a22, 0xd8c040, 0x3a6a9a][k % 3],
          });
        } else if (row === 0) {
          r.b.box("metal", r.X(lx), y, r.Z(lz), 0.34, 0.5, 0.02, {
            tint: 0x9a9a8a,
          });
          r.b.geo("metal", T.sphereLo, {
            x: r.X(lx),
            y: y + 0.62,
            z: r.Z(lz),
            s: 0.13,
            tint: 0x9a9a8a,
          });
        } else {
          r.b.box("paint_yellow", r.X(lx), y, r.Z(lz), 0.42, 0.26, 0.02, {});
          r.b.geo("paint_yellow", T.cone4, {
            x: r.X(lx + 0.24),
            y: y + 0.16,
            z: r.Z(lz),
            rz: -PI / 2,
            sx: 0.08,
            sy: 0.14,
            sz: 0.02,
          });
        }
        void t;
      }
    }
    A("gallery_targets", 0, -9.0, PI, 1.2);
    // prizes: shelf of bears and bottles, bunting, bulbs over the lanes, the ANNIE'S board
    shelf(r, r.X(3.75), r.Z(3.6), -PI / 2, 1.6, 2.0, {
      goods: "mixed",
      seed: 3141,
    });
    for (let k = 0; k < 4; k++)
      r.b.geo("fabric", T.sphereLo, {
        x: r.X(3.5),
        y: 2.25,
        z: r.Z(2.9 + k * 0.45),
        s: 0.16,
        tint: [0x8a5a3a, 0xd8a0b0, 0x6a8ab0, 0xd8d0b0][k],
      });
    for (const lz of [-7, -3, 1]) {
      const pts = r.b.cable(
        "rust",
        r.X(-3.9),
        3.6,
        r.Z(lz),
        r.X(3.9),
        3.6,
        r.Z(lz),
        0.3,
        0.012,
        10,
      );
      for (let i = 1; i < pts.length - 1; i++)
        r.b.quad(
          "fabric",
          [pts[i][0] - 0.18, pts[i][1], pts[i][2]],
          [pts[i][0] + 0.18, pts[i][1], pts[i][2]],
          [pts[i][0], pts[i][1] - 0.35, pts[i][2]],
          [pts[i][0], pts[i][1] - 0.35, pts[i][2]],
          { double: true, tint: [0xc02a22, 0xf0d040, 0x2a6ac0][i % 3] },
        );
    }
    for (const lx of [-2.7, 0, 2.7])
      for (const lz of [-8.6, -4.5])
        lamp(r, r.X(lx), r.Z(lz), {
          kind: "bulb",
          y: 3.3,
          col: 0xffe0a0,
          pool: 2.2,
          i: 0.5,
        });
    lamp(r, r.X(0), r.Z(7.5), {
      kind: "enamel",
      y: 3.2,
      shade: "paint_red",
      light: 1.0,
    });
    r.fix.push([
      r.X(0),
      3.0,
      r.Z(-8.0),
      0xffe8c0,
      { intensity: 1.4, range: 10 },
    ]);
    board(r, "b_gallery", r.X(0), 3.2, r.Z(5.2), 3.2, 0.55, PI);
    neonSign(r, "x_target", r.X(-3.9), 2.4, r.Z(8.0), 0.9, PI / 2, 0xff4040);
    note("lma_neon_note_scorecard", r.X(-3.3), 1.13, r.Z(5.7), {
      name: "Annie's High Scores",
      title: "Ammo Annie's — High Scores",
      value: 1,
      text: "HIGH SCORES (30 SECONDS, 5 SCRIP)\n\n1. ANNIE ......... 48 (house record, do not ask for a rematch)\n2. KINCAID ....... 41\n3. 'DEADEYE' DOYLE . 37 (disputed — shot the duck rail)\n4. SMILEY ........ 12 (shot the lamp)\n5. MAYOR CROWE .... 3 (ran for office instead)\n\nBEAT ANNIE, WIN THE BEAR.\nNobody has won the bear.",
    });
    finish(r);
    return r;
  }

  function robo(rec, O) {
    const r = Room("robo", O.x + 20, O.z - 70, 12, 9, 3.6, { doorAt: 2.0 });
    shell(r, {
      floor: "nx_concrete",
      floorTint: 0x8a8a80,
      wall: "nx_brick",
      wallTint: 0xb0a090,
      dado: "nx_metald",
      dadoTint: 0x3a5a5a,
      dadoH: 1.0,
      trim: "metal_dark",
      rail: false,
      ceil: "nx_concrete",
      doorLeaf: "metal",
      doorTint: 0x3a6a6a,
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // counter + register + a disassembled radio on it
    r.bx("metal_dark", -5.8, 0, 1.4, 0.8, 1.0, 2.0, { tint: 0x3a5a5a });
    r.bx("wood", -5.9, 1.0, 1.3, 0.9, 1.06, 2.1, {});
    r.col(-5.8, 0, 1.4, 0.8, 1.06, 2.0);
    r.b.box("metal_dark", r.X(-4.8), 1.06, r.Z(1.7), 0.45, 0.3, 0.35, {});
    r.b.box("wood_dark", r.X(-2.2), 1.06, r.Z(1.7), 0.6, 0.35, 0.3, {});
    r.b.geo("lit_warm", T.sphereLo, {
      x: r.X(-2.2),
      y: 1.25,
      z: r.Z(1.86),
      s: 0.05,
      tint: 0xffa040,
    });
    A("robo_owner", -2.8, 0.7, PI);
    // radio wall (west) — shelves full of sets with glowing dials
    shelf(r, r.X(-5.75), r.Z(-1.9), PI / 2, 2.6, 2.4, {
      goods: "radios",
      seed: 4101,
    });
    // workbenches along the north wall: a Patrolman torso under repair, an oscilloscope, tools, a tube tester
    r.bx("wood", -4.5, 0.9, -4.4, 3.5, 0.96, -3.5, {});
    r.col(-4.5, 0, -4.4, 3.5, 0.96, -3.5);
    for (const lx of [-4.3, -0.5, 3.3])
      r.bx("metal_dark", lx - 0.06, 0, -4.35, lx + 0.06, 0.9, -3.55, {});
    const tb = [-2.0, -4.0];
    r.b.box("paint_yellow", r.X(tb[0]), 0.96, r.Z(tb[1]), 0.7, 0.8, 0.5, {
      grime: 0.6,
    });
    r.b.box("paint_yellow", r.X(tb[0]), 1.82, r.Z(tb[1]), 0.5, 0.36, 0.42, {
      grime: 0.5,
    }); // square head, off its neck
    r.b.box(
      "lit_red",
      r.X(tb[0]),
      1.97,
      r.Z(tb[1] + 0.21),
      0.36,
      0.05,
      0.02,
      {},
    ); // visor slit
    r.b.beam(
      "rubber",
      r.X(tb[0] + 0.35),
      1.4,
      r.Z(tb[1]),
      r.X(tb[0] + 1.2),
      0.96,
      r.Z(tb[1] + 0.2),
      0.03,
    );
    r.b.box("metal_dark", r.X(1.2), 0.96, r.Z(-4.1), 0.5, 0.4, 0.35, {});
    r.b.panel("lit_green", r.X(1.2), 1.2, r.Z(-3.92), 0.3, 0.22, 0, {
      tint: 0x40ff60,
    });
    r.g.add(r.X(1.2), 1.2, r.Z(-3.6), 0x60ff80, "s");
    r.b.box("wood_dark", r.X(2.6), 0.96, r.Z(-4.0), 0.6, 0.3, 0.4, {});
    for (let k = 0; k < 4; k++)
      r.b.cyl(
        "lit_warm",
        r.X(2.4 + k * 0.13),
        1.26,
        r.Z(-4.0),
        0.03,
        0.025,
        0.12,
        6,
        { tint: 0xff8a30 },
      );
    for (let k = 0; k < 8; k++)
      r.b.box(
        "metal",
        r.X(-4.2 + k * 0.4),
        1.8 + (k % 2) * 0.1,
        r.Z(-4.48),
        0.06,
        0.4,
        0.02,
        { tint: 0x8a8a80 },
      ); // tools on a pegboard
    r.bx("wood", -4.5, 1.4, -4.5, 3.5, 2.6, -4.47, { tint: 0x8a7a5a });
    // a whole Patrolman in the NE corner (for show) + American Automaton Valet shells hanging on chains
    const px = 4.9,
      pz = -3.6;
    r.b.box("metal_dark", r.X(px), 0, r.Z(pz), 0.7, 0.2, 0.7, {});
    for (const s of [-0.18, 0.18])
      r.b.cyl("paint_yellow", r.X(px + s), 0.2, r.Z(pz), 0.1, 0.12, 0.8, 8, {});
    r.b.box("paint_yellow", r.X(px), 1.0, r.Z(pz), 0.62, 0.7, 0.42, {
      grime: 0.5,
    });
    r.b.box("paint_yellow", r.X(px), 1.7, r.Z(pz), 0.44, 0.42, 0.4, {
      grime: 0.5,
    }); // square head with a visor slit
    r.b.box("lit_red", r.X(px), 1.88, r.Z(pz + 0.2), 0.34, 0.06, 0.02, {});
    for (const s of [-1, 1])
      r.b.beam(
        "paint_yellow",
        r.X(px + s * 0.36),
        1.6,
        r.Z(pz),
        r.X(px + s * 0.45),
        1.0,
        r.Z(pz + 0.2),
        0.09,
      );
    r.col(px - 0.4, 0, pz - 0.4, px + 0.4, 2.2, pz + 0.4);
    A("robo_handy", 3.9, -2.6, 0.6);
    for (const q of [
      [-0.6, -1.2],
      [2.2, -0.6],
    ]) {
      r.b.beam(
        "black_metal",
        r.X(q[0]),
        3.6,
        r.Z(q[1]),
        r.X(q[0]),
        3.2,
        r.Z(q[1]),
        0.015,
      );
      r.b.box("chrome", r.X(q[0]), 2.6, r.Z(q[1]), 0.42, 0.55, 0.32, {}); // boxy torso
      r.b.box("chrome", r.X(q[0]), 3.15, r.Z(q[1]), 0.26, 0.2, 0.24, {}); // head block
      for (const sd of [-1, 1])
        r.b.beam(
          "chrome",
          r.X(q[0] + sd * 0.22),
          3.0,
          r.Z(q[1]),
          r.X(q[0] + sd * 0.3),
          2.45,
          r.Z(q[1] + 0.12),
          0.03,
        ); // two arms
    }
    board(r, "b_robo", r.X(-2.4), 2.9, r.Z(-4.46), 2.8, 0.5, 0);
    neonSign(r, "x_radio", r.X(5.95), 2.3, r.Z(1.2), 0.9, -PI / 2, 0xffb040);
    for (const q of [
      [-3, 0],
      [2.5, 0.5],
      [-1, -2.8],
    ])
      lamp(r, r.X(q[0]), r.Z(q[1]), {
        kind: "cage",
        y: 2.9,
        col: 0xffd8a0,
        pool: 3.0,
      });
    r.fix.push([
      r.X(-1),
      2.7,
      r.Z(-2.8),
      0xffe0b0,
      { intensity: 1.2, range: 8 },
    ]);
    STORY.push({
      kind: "workbench",
      id: "neon_robo_bench",
      x: r.X(5.2),
      y: 0,
      z: r.Z(-0.6),
      yaw: -PI / 2,
    });
    note("lma_neon_note_repair", r.X(-3.4), 1.07, r.Z(1.75), {
      name: "Repair Ticket #88",
      title: "Repair Ticket #88",
      value: 1,
      text: "SPROCKET'S WORKSHOP — REPAIR TICKET #88\n\nItem: Valet, Series Four (American Automaton Co.), 'Marquee'\nComplaint: sings show tunes at 3 AM, cannot be stopped, knows all the words.\nDiagnosis: nothing wrong. That is how they come.\nWork done: removed the blowtorch arm. Put the blowtorch arm back (customer insisted).\nBalance due: 45 scrip OR one (1) working vacuum tube, 6SN7.",
    });
    finish(r);
    return r;
  }

  function pawn(rec, O) {
    const r = Room("pawn", O.x + 65, O.z - 70, 10, 8, 3.4, { doorAt: 0 });
    shell(r, {
      floor: "nx_carpet",
      floorTint: 0x7a6a3a,
      wall: "nx_paper",
      wallTint: 0xe0b860,
      dado: "nx_wood",
      dadoTint: 0x4a2a14,
      trim: "gold",
      railMat: "gold",
      doorLeaf: "wood",
      doorTint: 0x4a2a14,
      doorFrame: "gold",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // U of glass display counters, lit inside
    const caseAt = (lx0, lz0, lx1, lz1) => {
      r.bx("wood_dark", lx0, 0, lz0, lx1, 0.55, lz1, {});
      r.bx(
        "lit_warm",
        lx0 + 0.05,
        0.55,
        lz0 + 0.05,
        lx1 - 0.05,
        0.58,
        lz1 - 0.05,
        { tint: 0x6a5020 },
      );
      r.bx("glass", lx0, 0.55, lz0, lx1, 1.0, lz1, { faces: "nsewt" });
      r.bx("gold", lx0, 1.0, lz0, lx1, 1.03, lz1, { faces: "nsew" });
      const rr = K.rng(Math.round(lx0 * 31 + lz0 * 17));
      for (let k = 0; k < 6; k++) {
        const x = lx0 + 0.2 + rr() * (lx1 - lx0 - 0.4),
          z = lz0 + 0.15 + rr() * (lz1 - lz0 - 0.3);
        r.b.box(
          rr() < 0.5 ? "gold_bright" : "chrome",
          r.X(x),
          0.58,
          r.Z(z),
          0.12 + rr() * 0.1,
          0.05 + rr() * 0.08,
          0.1,
          { yaw: rr() * 3 },
        );
      }
      r.col(lx0, 0, lz0, lx1, 1.03, lz1, { surface: "wood" });
      r.g.add(r.X((lx0 + lx1) / 2), 0.8, r.Z((lz0 + lz1) / 2), 0xffd890, "s");
    };
    caseAt(-2.8, -1.5, 2.8, -0.9);
    caseAt(-3.4, -1.5, -2.8, 1.4);
    caseAt(2.8, -1.5, 3.4, 1.4);
    A("pawn_owner", 0, -2.3, PI);
    // wire cages along both side walls with the stuff nobody bought back
    for (const sd of [-1, 1]) {
      const lx = sd * 4.3;
      for (let k = 0; k <= 8; k++)
        r.b.beam(
          "metal",
          r.X(lx),
          0,
          r.Z(-3.6 + k * 0.85),
          r.X(lx),
          2.6,
          r.Z(-3.6 + k * 0.85),
          0.02,
        );
      for (const y of [0.1, 1.3, 2.6])
        r.b.beam("metal", r.X(lx), y, r.Z(-3.6), r.X(lx), y, r.Z(3.2), 0.025);
      for (let k = 0; k < 14; k++) {
        const z = -3.4 + (k % 7) * 0.9,
          y = k < 7 ? 0 : 1.3;
        r.b.box(
          ["wood_dark", "metal", "fabric", "paint_red", "brass"][k % 5],
          r.X(lx + sd * 0.35),
          y + 0.02,
          r.Z(z),
          0.4,
          0.2 + (k % 3) * 0.15,
          0.35,
          {
            yaw: k,
            tint: [0xffffff, 0x8a8a7a, 0x6a4a8a, 0xffffff, 0xffffff][k % 5],
          },
        );
      }
      r.col(lx - 0.05, 0, -3.6, lx + sd * 0.7, 2.6, 3.2);
    }
    // the big safe (loot), a gold-framed painting, a chandelier
    r.bx("metal_dark", -3.5, 0, -3.95, -2.5, 1.4, -3.1, { tint: 0x3a3a34 });
    r.b.cyl("chrome", r.X(-3.0), 0.9, r.Z(-3.08), 0.14, 0.14, 0.05, 12, {});
    r.col(-3.5, 0, -3.95, -2.5, 1.4, -3.1);
    addContainer(rec, {
      id: "lma_neon_pawn_safe",
      name: "Pawn Palace Safe",
      kind: "safe",
      loot: "safe",
      lock: {
        id: "lma_neon_pawn_safe",
        label: "Pawn Palace Safe",
        code: "7041",
        hint: "A bar napkin on a card table in the Speakeasy",
        learnedFrom: "A bar napkin on a card table in the Speakeasy",
      },
      x: r.X(-3.0),
      y: 0.9,
      z: r.Z(-3.0),
      anchor: ["pawn_safe", 0],
    });
    note("lma_neon_note_pawnticket", r.X(1.1), 1.04, r.Z(-1.2), {
      name: "Pawn Ticket #4471",
      title: "Pawn Ticket #4471",
      value: 1,
      text: "THE PAWN PALACE — NO REFUNDS · NO QUESTIONS\n\nTicket #4471\nItem: wedding ring, gold (real), inscribed 'H. & M. — forever, 1961'\nAdvanced: 20 scrip\nRedeem by: last Tuesday\n\nOn the back, in pencil: 'She'll come back for it. Hold it one more week. — G.'",
    });
    r.bx("gold", -1.1, 1.6, -3.99, 1.1, 2.9, -3.93, {});
    r.b.panel("atlas_ads", r.X(0), 2.25, r.Z(-3.92), 1.9, 1.1, 0, {
      rect: K.ad("chocolate_zeppelin", 1),
    });
    board(r, "b_pawn", r.X(0), 1.25, r.Z(-3.95), 2.4, 0.4, 0);
    neonSign(r, "x_pawn", r.X(0), 2.7, r.Z(3.95), 2.6, PI, 0xffc83a);
    lamp(r, r.X(0), r.Z(0.4), {
      kind: "chandelier",
      y: 3.05,
      col: 0xffe0a0,
      light: 1.3,
      pool: 4.2,
      i: 0.5,
    });
    lamp(r, r.X(-3.9), r.Z(2.8), {
      kind: "enamel",
      y: 2.6,
      shade: "gold",
      pool: 2.2,
    });
    finish(r);
    return r;
  }

  function opry(rec, O) {
    const r = Room("opry", O.x - 70, O.z - 18, 22, 38, 9, { doorAt: 0 });
    shell(r, {
      floor: "nx_carpet",
      wall: "nx_paper",
      wallTint: 0xa03a3a,
      dado: "nx_wood",
      dadoTint: 0x3a1a10,
      dadoH: 1.3,
      trim: "gold",
      railMat: "gold",
      ceil: "nx_tin",
      ceilTint: 0xc09a60,
      doorW: 2.6,
      doorLeaf: "wood",
      doorTint: 0x5a1a10,
      doorFrame: "gold",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    const SZ0 = -12.0,
      SZ1 = -5.0,
      SH = 1.2,
      BZ = -13.2; // stage front at -5, backdrop wall at -13.2, backstage -19..-13.2
    // stage: boards, lip, apron edge; stairs at both front corners
    r.bx("nx_wood", -11, 0, -19, 11, SH, SZ1, { tint: 0x8a6a4a });
    r.col(-11, 0, -19, 11, SH, SZ1, { surface: "wood" }); // stage + backstage deck
    r.bx("black_metal", -11, 0, SZ1 - 0.02, 11, SH, SZ1 + 0.02, { faces: "s" });
    r.bx("gold", -11, SH - 0.06, SZ1, 11, SH, SZ1 + 0.05, {});
    for (const sd of [-1, 1]) {
      r.b.stairs(
        "nx_wood",
        r.X(sd * 7.3),
        r.Z(SZ1 + 1.9),
        0,
        -1,
        1.2,
        1.9,
        0,
        SH,
        5,
        {},
      );
    }
    // proscenium: gold frame + pilasters + a painted arch band
    for (const sd of [-1, 1]) {
      r.bx(
        "gold",
        sd * 8.6 - 0.5,
        SH,
        SZ1 - 0.6,
        sd * 8.6 + 0.5,
        7.6,
        SZ1 - 0.2,
        {},
      );
      r.bx("nx_paper", sd * 11, 0, SZ1 - 0.6, sd * 9.1, 9, SZ1 - 0.2, {
        tint: 0x7a2a2a,
      });
      r.col(
        Math.min(sd * 11, sd * 9.1),
        0,
        SZ1 - 0.6,
        Math.max(sd * 11, sd * 9.1),
        9,
        SZ1 - 0.2,
      );
    }
    r.bx("gold", -9.1, 7.2, SZ1 - 0.6, 9.1, 7.9, SZ1 - 0.15, {});
    r.bx("nx_paper", -11, 7.9, SZ1 - 0.6, 11, 9, SZ1 - 0.2, { tint: 0x7a2a2a });
    // curtains: legs bunched either side, the valance, the painted backdrop (Neon Nights skyline)
    for (const sd of [-1, 1])
      for (let k = 0; k < 6; k++)
        r.b.geo("nx_velvet", T.cyl6, {
          x: r.X(sd * (8.0 - k * 0.32)),
          y: SH + 3.1,
          z: r.Z(SZ1 - 0.9),
          sx: 0.2,
          sy: 6.2,
          sz: 0.2,
          grime: 0,
        });
    r.bx("nx_velvet", -8.6, 6.4, SZ1 - 1.0, 8.6, 7.2, SZ1 - 0.8, { grime: 0 });
    // backdrop wall with the two wings passages (x ±8.2..±9.6) through to backstage
    for (const sd of [-1, 1]) {
      r.bx("nx_paper", sd * 9.6, SH, BZ - 0.2, sd * 11, 9, BZ, {
        tint: 0x5a2a20,
      });
      r.bx("nx_paper", sd * 8.2, SH + 2.6, BZ - 0.2, sd * 9.6, 9, BZ, {
        tint: 0x5a2a20,
      });
      r.col(
        Math.min(sd * 9.6, sd * 11),
        SH,
        BZ - 0.2,
        Math.max(sd * 9.6, sd * 11),
        9,
        BZ,
      );
      r.bx(
        "nx_velvet",
        sd * 8.2,
        SH,
        BZ - 0.12,
        sd * 8.5,
        SH + 2.6,
        BZ - 0.08,
        {},
      );
    }
    r.bx("nx_paper", -8.2, 7.2, BZ - 0.2, 8.2, 9, BZ, { tint: 0x5a2a20 });
    r.b.panel(
      "nx_backdrop",
      r.X(0),
      SH + 3.0,
      r.Z(BZ + 0.02),
      16.4,
      6.0 - SH + 1.2,
      0,
      { rect: [0, 0, 1, 1] },
    );
    r.col(-8.2, SH, BZ - 0.2, 8.2, 7.2, BZ);
    // footlights, the mic, a spot bar
    for (let k = 0; k < 16; k++) {
      const lx = -8 + k * 1.07;
      r.b.box("black_metal", r.X(lx), SH, r.Z(SZ1 - 0.25), 0.3, 0.12, 0.18, {});
      r.b.geo("lit_warm", T.sphereLo, {
        x: r.X(lx),
        y: SH + 0.14,
        z: r.Z(SZ1 - 0.28),
        s: 0.07,
        tint: 0xffb070,
      });
      if (k % 2 === 0)
        r.g.add(r.X(lx), SH + 0.2, r.Z(SZ1 - 0.5), 0xffb070, "s");
    }
    r.sp.add(r.X(0), r.Z(SZ1 - 3.5), 0xffa060, 6.0, {
      y: SH + 0.03,
      i: 0.5,
      sx: 9,
      sz: 3.5,
    });
    r.b.beam(
      "black_metal",
      r.X(0),
      SH,
      r.Z(-7.0),
      r.X(0),
      SH + 1.6,
      r.Z(-7.0),
      0.02,
    );
    r.b.geo("chrome", T.sphereLo, {
      x: r.X(0),
      y: SH + 1.65,
      z: r.Z(-7.0),
      s: 0.07,
    });
    r.b.cyl("black_metal", r.X(0), SH, r.Z(-7.0), 0.18, 0.2, 0.03, 8, {});
    r.b.beam(
      "black_metal",
      r.X(-8),
      7.0,
      r.Z(-3.5),
      r.X(8),
      7.0,
      r.Z(-3.5),
      0.08,
    );
    for (let k = 0; k < 6; k++) {
      const lx = -6.5 + k * 2.6;
      r.b.cyl("black_metal", r.X(lx), 6.4, r.Z(-3.5), 0.16, 0.24, 0.5, 8, {
        top: true,
      });
      r.g.add(r.X(lx), 6.35, r.Z(-3.6), 0xfff0d0, "m");
    }
    r.sp.add(r.X(0), r.Z(-7.2), 0xfff0d8, 2.6, { y: SH + 0.03, i: 0.7 });
    r.fix.push([
      r.X(0),
      5.5,
      r.Z(-6.5),
      0xffe8c8,
      { intensity: 2.0, range: 14 },
    ]);
    A("opry_stage", 0, -7.6, PI, SH);
    A("opry_director", -6.2, -6.2, AY(PI / 2 + 0.6), SH);
    A("opry_wings", 7.5, -10.5, -PI / 2, SH);
    // backstage (on the stage deck, y = SH): dressing tables with bulb mirrors, a costume rack, a trunk
    const Y = SH;
    for (let k = 0; k < 4; k++) {
      const lx = -6.3 + k * 4.2;
      r.bx("wood", lx - 0.8, Y + 0.75, -18.9, lx + 0.8, Y + 0.8, -18.3, {});
      r.bx("wood_dark", lx - 0.8, Y, -18.9, lx - 0.7, Y + 0.75, -18.3, {});
      r.bx("wood_dark", lx + 0.7, Y, -18.9, lx + 0.8, Y + 0.75, -18.3, {});
      r.b.panel("glass", r.X(lx), Y + 1.5, r.Z(-18.97), 1.2, 0.9, 0, {
        tint: 0x8a9aa0,
      });
      for (let i = 0; i < 6; i++) {
        const bx2 = lx - 0.65 + (i / 5) * 1.3;
        r.b.geo("lit_warm", T.sphereLo, {
          x: r.X(bx2),
          y: Y + 2.02,
          z: r.Z(-18.95),
          s: 0.05,
        });
      }
      for (let i = 0; i < 4; i++) {
        r.b.geo("lit_warm", T.sphereLo, {
          x: r.X(lx - 0.68),
          y: Y + 1.1 + i * 0.27,
          z: r.Z(-18.95),
          s: 0.05,
        });
        r.b.geo("lit_warm", T.sphereLo, {
          x: r.X(lx + 0.68),
          y: Y + 1.1 + i * 0.27,
          z: r.Z(-18.95),
          s: 0.05,
        });
      }
      r.g.add(r.X(lx), Y + 1.6, r.Z(-18.6), 0xffe0a8, "m");
      r.sp.add(r.X(lx), r.Z(-18.2), 0xffd8a0, 1.6, { y: Y + 0.03, i: 0.45 });
      P.chair(r.b, r.X(lx), Y, r.Z(-17.7), PI);
      r.col(lx - 0.8, Y, -18.9, lx + 0.8, Y + 0.8, -18.3);
    }
    r.b.beam(
      "chrome",
      r.X(-9.9),
      Y + 1.8,
      r.Z(-14.2),
      r.X(-9.9),
      Y + 1.8,
      r.Z(-17.0),
      0.025,
    );
    for (let k = 0; k < 7; k++)
      r.bx(
        "fabric",
        -9.95,
        Y + 0.7,
        -14.4 - k * 0.36,
        -9.85,
        Y + 1.78,
        -14.25 - k * 0.36,
        {
          tint: [
            0xc02a4a, 0x2a4a8a, 0xe0c040, 0x6a2a8a, 0xf0e0d0, 0x2a8a5a,
            0x1a1a1a,
          ][k],
        },
      );
    r.bx("wood_dark", 8.6, Y, -17.8, 10.0, Y + 0.7, -16.9, { tint: 0x6a3a1a });
    r.col(8.6, Y, -17.8, 10.0, Y + 0.7, -16.9);
    A("opry_backstage", 0, -16.4, 0, Y);
    note("lma_neon_note_setlist", r.X(-6.0), Y + 0.81, r.Z(-18.6), {
      name: "Velvet's Setlist",
      title: '"Neon Nights" — Running Order',
      value: 1,
      text: "NEON NIGHTS — RUNNING ORDER (Velvet's copy)\n\n1. Overture (Maestro, if sober)\n2. 'Glow, Little Glowworm, Glow' — full company\n3. The Mayor's Monologue (keep it SHORT, Lucius)\n4. 'Twenty-Two Years Young' — Velvet\n5. Intermission (sell the popcorn, whatever it is)\n6. Tap number (CUT — Rex's knee went again)\n7. 'Crossroads of the World' — full company, bows\n\nNote to self: find the good wig. Somebody took the good wig.",
    });
    lamp(r, r.X(-3), r.Z(-16.2), {
      kind: "bulb",
      y: Y + 3.0,
      col: 0xffd8a0,
      pool: 3.0,
      fy: Y,
    });
    lamp(r, r.X(4), r.Z(-16.2), {
      kind: "bulb",
      y: Y + 3.0,
      col: 0xffd8a0,
      pool: 3.0,
      fy: Y,
    });
    // the house: rows of red plush seats with a centre aisle; some broken, a few missing
    const rr = K.rng(7071);
    let seatN = 0;
    for (let row = 0; row < 14; row++) {
      const lz = -2.6 + row * 1.15;
      for (const sd of [-1, 1])
        for (let k = 0; k < 8; k++) {
          const lx = sd * (1.4 + k * 0.62);
          if (Math.abs(lx) > 10.2) continue;
          const q = rr();
          if (q < 0.05) continue;
          const broken = q < 0.12;
          r.b.box("nx_fabric", r.X(lx), 0.4, r.Z(lz), 0.54, 0.1, 0.48, {
            tint: 0x8a1a1a,
            grime: 0.5,
          });
          if (!broken)
            r.b.box(
              "nx_fabric",
              r.X(lx),
              0.45,
              r.Z(lz + 0.26),
              0.54,
              0.62,
              0.08,
              { tint: 0x7a1414, grime: 0.5 },
            );
          else
            r.b.geo("nx_fabric", T.box, {
              x: r.X(lx),
              y: 0.55,
              z: r.Z(lz + 0.4),
              rx: 1.2,
              sx: 0.54,
              sy: 0.62,
              sz: 0.08,
              tint: 0x6a1010,
            });
          r.b.box(
            "black_metal",
            r.X(lx - 0.29),
            0,
            r.Z(lz + 0.05),
            0.04,
            0.68,
            0.5,
            {},
          );
          if (row < 3 && !broken && seatN < 12 && k % 2 === 0) {
            seatN++;
            A("opry_seat_" + seatN, lx, lz - 0.05, 0);
          }
        }
      for (const sd of [-1, 1])
        r.col(
          sd > 0 ? 1.1 : -6.1,
          0,
          lz - 0.25,
          sd > 0 ? 6.1 : -1.1,
          0.5,
          lz + 0.35,
          { surface: "carpet" },
        );
    }
    // side boxes (theatre boxes): a slab on a gilded corbel, a bowed gilt parapet with a velvet rail, two chairs, a lamp,
    // velvet drapes tied back under a swagged valance; the north-east box has lost half its front (debris in the seats below)
    for (const sd of [-1, 1])
      for (const lz of [2, 9]) {
        const broken = sd > 0 && lz === 2,
          BY = 3.5,
          fx = sd * 9.35;
        r.bx("nx_wood", fx, BY - 0.16, lz - 1.8, sd * 11, BY, lz + 1.8, {
          tint: 0x6a3a22,
        });
        r.bx(
          "gold",
          fx,
          BY - 0.42,
          lz - 1.8,
          fx + sd * 0.12,
          BY - 0.12,
          lz + 1.8,
          {},
        );
        for (let k = 0; k < 4; k++)
          r.b.geo("gold", T.cone4, {
            x: r.X(sd * (10.3 - k * 0.2)),
            y: BY - 0.62 - k * 0.12,
            z: r.Z(lz),
            rx: PI,
            sx: 0.8 - k * 0.16,
            sy: 0.3,
            sz: 1.2 - k * 0.2,
          });
        const segs = 7,
          R = 1.8,
          bulge = 0.55;
        for (let k = 0; k < segs; k++) {
          if (broken && k >= 3) continue;
          const a0 = -PI / 2 + (k * PI) / segs,
            a1 = a0 + PI / segs;
          const q0 = [fx - sd * Math.cos(a0) * bulge, lz + Math.sin(a0) * R],
            q1 = [fx - sd * Math.cos(a1) * bulge, lz + Math.sin(a1) * R];
          const px = (q0[0] + q1[0]) / 2,
            pz = (q0[1] + q1[1]) / 2,
            len = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) + 0.04;
          const yaw = Math.atan2(q1[0] - q0[0], q1[1] - q0[1]); // local +z along the chord
          r.b.box("gold", r.X(px), BY, r.Z(pz), 0.1, 0.95, len, {
            yaw,
            grime: 0.35,
          });
          r.b.box("nx_velvet", r.X(px), BY + 0.95, r.Z(pz), 0.16, 0.08, len, {
            yaw,
          });
        }
        if (!broken)
          K.colRot(r.X(fx - sd * 0.3), r.Z(lz), 0.6, R * 2, BY, BY + 1.05, 0, {
            walkable: false,
          });
        r.bx(
          "nx_velvet",
          sd * 10.9,
          BY,
          lz - 1.8,
          sd * 11,
          BY + 3.2,
          lz + 1.8,
          { tint: 0x8a2a2a },
        );
        for (const s2 of [-1, 1]) {
          // tied-back drapes + the swag
          r.b.geo("nx_velvet", T.cyl6, {
            x: r.X(fx + sd * 0.2),
            y: BY + 1.6,
            z: r.Z(lz + s2 * 1.7),
            sx: 0.22,
            sy: 3.2,
            sz: 0.22,
          });
          r.b.geo("gold", T.sphereLo, {
            x: r.X(fx + sd * 0.1),
            y: BY + 1.2,
            z: r.Z(lz + s2 * 1.62),
            s: 0.08,
          });
        }
        r.bx(
          "nx_velvet",
          fx,
          BY + 2.9,
          lz - 1.8,
          fx + sd * 0.25,
          BY + 3.3,
          lz + 1.8,
          {},
        );
        r.bx(
          "gold",
          fx - sd * 0.02,
          BY + 2.86,
          lz - 1.8,
          fx + sd * 0.02,
          BY + 2.92,
          lz + 1.8,
          {},
        );
        if (!broken) {
          for (const cz of [-0.6, 0.6])
            P.chair(r.b, r.X(sd * 10.2), BY, r.Z(lz + cz), (-sd * PI) / 2);
        } else {
          P.chair(r.b, r.X(sd * 10.4), BY, r.Z(lz + 0.8), (-sd * PI) / 2 + 0.4);
          // the rest of the front lies in the stalls below: gilt chunks, a velvet rail, plaster
          for (let k = 0; k < 7; k++)
            r.b.box(
              k % 3 ? "gold" : "nx_plaster",
              r.X(sd * (8.6 - (k % 3) * 0.7)),
              0.45 + (k % 2) * 0.12,
              r.Z(lz - 0.4 + k * 0.35),
              0.5 + (k % 2) * 0.3,
              0.14,
              0.4,
              { yaw: k * 0.9, grime: 0.8 },
            );
          r.b.box(
            "nx_velvet",
            r.X(sd * 8.9),
            0.55,
            r.Z(lz + 1.0),
            0.14,
            0.08,
            1.8,
            { yaw: 0.5 },
          );
        }
        const lp = r.X(fx - sd * 0.45);
        r.b.cyl("gold", lp, BY + 0.95, r.Z(lz), 0.05, 0.07, 0.25, 6, {});
        r.b.geo("lit_warm", T.sphereLo, {
          x: lp,
          y: BY + 1.25,
          z: r.Z(lz),
          s: 0.08,
          tint: 0xffc890,
        });
        if (!broken) r.g.add(lp, BY + 1.25, r.Z(lz), 0xffd8a0, "s");
      }
    // ruin in the house: fallen plaster from a hole in the ceiling rose over the back rows, trash in the aisle
    {
      const rr2 = K.rng(7073);
      r.bx("black_metal", -1.6, 8.98, 11.0, 1.8, 9.0, 13.2, { tint: 0x050505 });
      for (let k = 0; k < 16; k++)
        r.b.box(
          k % 4 ? "nx_plaster" : "nx_wood",
          r.X(-1.6 + rr2() * 3.4),
          0.5 + rr2() * 0.25,
          r.Z(10.8 + rr2() * 2.6),
          0.2 + rr2() * 0.5,
          0.08 + rr2() * 0.1,
          0.2 + rr2() * 0.4,
          { yaw: rr2() * 3, grime: 0.8, tint: 0xd8c8a8 },
        );
      for (let k = 0; k < 22; k++)
        r.b.box(
          "paint_white",
          r.X((rr2() - 0.5) * 2.2),
          0.012,
          r.Z(-3 + rr2() * 20),
          0.16,
          0.004,
          0.22,
          { yaw: rr2() * 3, tint: [0xd8ccb0, 0xc8a8a0, 0xa8b8c0][k % 3] },
        );
      r.sp.add(r.X(0), r.Z(12), 0x9ab0c8, 2.4, { y: 0.9, i: 0.25 });
    }
    for (const sd of [-1, 1])
      for (const lz of [-1, 5.5, 13]) {
        r.b.cyl("gold", r.X(sd * 10.9), 2.6, r.Z(lz), 0.08, 0.16, 0.24, 8, {});
        r.b.geo("lit_warm", T.sphereLo, {
          x: r.X(sd * 10.85),
          y: 2.92,
          z: r.Z(lz),
          s: 0.09,
        });
        r.g.add(r.X(sd * 10.6), 2.95, r.Z(lz), 0xffc880, "m");
        r.sp.add(r.X(sd * 9.8), r.Z(lz), 0xffc080, 2.6, { y: 0.03, i: 0.3 });
      }
    lamp(r, r.X(0), r.Z(5), {
      kind: "chandelier",
      y: 7.6,
      col: 0xffe0a8,
      light: 1.6,
      range: 16,
      pool: 6,
      i: 0.35,
    });
    poster(r, "q_show", r.X(-2.2), 1.9, r.Z(18.97), 1.1, 1.45, PI);
    poster(r, "q_show", r.X(2.2), 1.9, r.Z(18.97), 1.1, 1.45, PI);
    neonSign(r, "x_opry", r.X(0), 8.35, r.Z(SZ1 - 0.12), 5.0, 0, 0xff5ab4, "l");
    finish(r);
    return r;
  }

  function oracle(rec, O) {
    const r = Room("oracle", O.x - 25, O.z - 25, 4.4, 4.4, 3.0, {
      doorAt: 0.8,
      grime: 0.4,
      zExt: 0.8,
    }); // (+0.8 m vestibule behind the bead curtain)
    shell(r, {
      floor: "nx_wood",
      floorTint: 0x6a4a3a,
      wall: "nx_velvet_purple",
      trim: "gold",
      ceil: "nx_tin",
      ceilTint: 0x3a2a4a,
      doorW: 1.1,
      doorLeaf: "metal_dark",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // the fortune machine: carved cabinet, glass booth with the turbaned automaton (a cracked plaster face), ticker spout
    const mz = -1.7;
    r.bx("wood_dark", -0.8, 0, mz - 0.45, 0.8, 1.0, mz + 0.45, {
      tint: 0x5a2a3a,
    });
    r.bx("gold", -0.85, 1.0, mz - 0.5, 0.85, 1.06, mz + 0.5, {});
    r.bx("wood_dark", -0.8, 2.4, mz - 0.45, 0.8, 2.7, mz + 0.45, {
      tint: 0x5a2a3a,
    });
    r.bx("gold", -0.9, 2.7, mz - 0.55, 0.9, 2.78, mz + 0.55, {});
    for (const sd of [-1, 1])
      r.bx(
        "gold",
        sd * 0.8 - 0.04,
        1.06,
        mz + 0.4,
        sd * 0.8 + 0.04,
        2.4,
        mz + 0.48,
        {},
      );
    r.b.panel("glass", r.X(0), 1.73, r.Z(mz + 0.46), 1.56, 1.34, 0, {});
    r.bx("lit_green", -0.75, 1.06, mz - 0.44, 0.75, 1.08, mz + 0.4, {
      tint: 0x2a6a3a,
    });
    r.b.box("nx_fabric", r.X(0), 1.08, r.Z(mz - 0.1), 0.62, 0.42, 0.34, {
      tint: 0x6a1a5a,
    });
    r.b.geo("nx_plaster", T.sphere, {
      x: r.X(0),
      y: 1.72,
      z: r.Z(mz - 0.05),
      sx: 0.17,
      sy: 0.21,
      sz: 0.17,
      tint: 0x8a8682,
    });
    r.b.geo("nx_fabric", T.sphereLo, {
      x: r.X(0),
      y: 1.93,
      z: r.Z(mz - 0.05),
      sx: 0.22,
      sy: 0.13,
      sz: 0.22,
      tint: 0xe0d8c0,
    });
    r.b.geo("gold_bright", T.sphereLo, {
      x: r.X(0),
      y: 1.97,
      z: r.Z(mz + 0.15),
      s: 0.04,
    });
    for (const sd of [-1, 1])
      r.b.geo("lit_warm", T.sphereLo, {
        x: r.X(sd * 0.06),
        y: 1.75,
        z: r.Z(mz + 0.1),
        s: 0.025,
        tint: 0xff8a30,
      });
    r.b.geo("glass", T.sphere, {
      x: r.X(0),
      y: 1.3,
      z: r.Z(mz + 0.15),
      s: 0.14,
      tint: 0x60ff90,
    }); // crystal ball
    r.g.add(r.X(0), 1.35, r.Z(mz + 0.2), 0x60ff90, "m");
    r.g.add(r.X(0), 1.9, r.Z(mz + 0.3), 0x9a7aff, "m");
    r.bx("brass", -0.12, 0.7, mz + 0.45, 0.12, 0.84, mz + 0.56, {}); // coin slot / ticker spout
    for (let k = 0; k < 18; k++) {
      const a = k * 0.9;
      r.b.box(
        "paint_white",
        r.X(Math.cos(a) * (0.3 + k * 0.03)),
        0.01 + k * 0.004,
        r.Z(mz + 0.9 + Math.sin(a) * 0.35),
        0.5,
        0.005,
        0.04,
        { yaw: a },
      );
    }
    r.col(-0.85, 0, mz - 0.55, 0.85, 2.78, mz + 0.55);
    A("oracle_booth", 0, mz + 1.05, 0);
    neonSign(
      r,
      "x_oracle2",
      r.X(2.18),
      2.2,
      r.Z(-0.4),
      1.6,
      -PI / 2,
      0x6aff9a,
      "s",
    );
    board(r, "b_oracle", r.X(-2.18), 1.8, r.Z(0.4), 1.8, 0.35, PI / 2);
    // bead curtain by the door, a stool, candles
    for (let k = 0; k < 10; k++)
      r.b.beam(
        "fabric",
        r.X(0.25 + k * 0.12),
        2.35,
        r.Z(2.1),
        r.X(0.25 + k * 0.12),
        0.3,
        r.Z(2.1),
        0.012,
        { tint: [0xd84a8a, 0x6a4ad8, 0xd8c04a][k % 3] },
      );
    r.b.cyl("wood_dark", r.X(-1.4), 0, r.Z(0.9), 0.2, 0.2, 0.6, 8, {});
    for (const q of [
      [1.8, -1.9],
      [-1.8, -1.9],
    ]) {
      r.b.cyl("lit_warm", r.X(q[0]), 0, r.Z(q[1]), 0.05, 0.05, 0.3, 6, {
        tint: 0xffa040,
      });
      r.g.add(r.X(q[0]), 0.4, r.Z(q[1]), 0xffa040, "s");
    }
    lamp(r, r.X(0), r.Z(0.3), {
      kind: "enamel",
      y: 2.4,
      shade: "nx_velvet",
      col: 0xc8a0ff,
      pool: 2.4,
      light: 0.8,
      range: 5,
    });
    finish(r);
    return r;
  }

  function mayor(rec, O) {
    const r = Room("mayor", O.x + 20, O.z - 25, 9, 7, 3.2, { doorAt: 0 });
    shell(r, {
      floor: "nx_wood",
      floorTint: 0x8a6a4a,
      wall: "nx_paper",
      wallTint: 0xc8d0b8,
      dado: "nx_wood",
      dadoTint: 0x5a3a20,
      trim: "wood_dark",
      doorLeaf: "glass",
      doorFrame: "chrome",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // the Mayor's desk: big old-world oak, a terminal, papers, the chair; flags either side
    r.bx("wood_dark", -1.6, 0, -2.2, 1.6, 0.76, -1.3, {});
    r.bx("wood", -1.7, 0.76, -2.3, 1.7, 0.8, -1.2, {});
    r.col(-1.7, 0, -2.3, 1.7, 0.8, -1.2, { surface: "wood" });
    for (let k = 0; k < 5; k++)
      r.b.box(
        "paint_white",
        r.X(-1.2 + k * 0.28),
        0.8 + k * 0.004,
        r.Z(-1.6),
        0.21,
        0.004,
        0.3,
        { yaw: k * 0.3 - 0.4 },
      );
    r.b.box("fabric", r.X(0), 0, r.Z(-2.9), 0.6, 0.5, 0.6, { tint: 0x3a1a10 });
    r.b.box("fabric", r.X(0), 0.5, r.Z(-3.15), 0.6, 0.8, 0.12, {
      tint: 0x3a1a10,
    });
    A("mayor", 0, -2.75, PI);
    A("terminal", 1.05, -1.75, PI, 0.8);
    A("mayor_office", 0.9, 0.2, 0);
    addContainer(rec, {
      id: "lma_neon_mayor_desk",
      name: "Mayor's Desk",
      kind: "desk",
      loot: "desk",
      items: [["lma_neon_note_crowe_memo", 1]],
      lock: {
        id: "lma_neon_mayor_desk",
        label: "Mayor's Desk",
        key: "lma_neon_mayor_desk_key",
        hint: "The desk key lies on top of the Mayor's filing cabinets",
      },
      x: r.X(-0.9),
      y: 0.65,
      z: r.Z(-1.75),
      anchor: ["mayor_desk", 0],
    });
    for (const sd of [-1, 1]) {
      const lx = sd * 2.5;
      r.b.cyl("brass", r.X(lx), 0, r.Z(-3.1), 0.2, 0.22, 0.06, 10, {});
      r.b.cyl("wood_dark", r.X(lx), 0, r.Z(-3.1), 0.035, 0.035, 2.5, 6, {});
      r.b.geo("gold", T.sphereLo, {
        x: r.X(lx),
        y: 2.55,
        z: r.Z(-3.1),
        s: 0.07,
      });
      r.bx("fabric", lx - 0.02, 1.4, -3.1, lx + 0.02, 2.4, -2.2, {
        tint: sd < 0 ? 0xb02a22 : 0x2a8a4a,
        grime: 0.3,
      });
    }
    // filing cabinets (west), the big map (east), recruiting posters, a sofa for visitors, the safe (loot1)
    for (let k = 0; k < 3; k++) {
      r.bx(
        "paint_green",
        -4.45,
        0,
        -3.2 + k * 0.62,
        -3.85,
        1.35,
        -2.62 + k * 0.62,
        { tint: 0x5a6a5a },
      );
      for (let d2 = 0; d2 < 3; d2++)
        r.bx(
          "chrome",
          -3.87,
          0.3 + d2 * 0.42,
          -3.0 + k * 0.62,
          -3.83,
          0.34 + d2 * 0.42,
          -2.82 + k * 0.62,
          {},
        );
    }
    r.col(-4.45, 0, -3.2, -3.85, 1.35, -1.36);
    keyItem("lma_neon_mayor_desk_key", r.X(-4.15), 1.36, r.Z(-1.8), {
      name: "Mayor's Desk Key",
      desc: 'A small brass key on a paper tag: "L.C. — DESK. Do not lend to Wendell."',
    });
    INNER_ITEMS.push({
      id: "lma_neon_note_crowe_memo",
      type: "note",
      weight: 0,
      value: 1,
      name: "Memo: Note to Self",
      title: "Note to Self — L. Crowe",
      text: "NOTE TO SELF (do not leave on desk — you have left it on the desk)\n\n1. Speech for the Ball: shorter. Much shorter.\n2. Tell Kincaid the gate lamps are NOT optional.\n3. The office safe is 1-9-2-7, the year I first stood on a stage. Nobody here is old enough to guess it. Except Wendell. Change it if Wendell asks about my career.\n\n— L.C.",
    });
    K.learnFromItem("lma_neon_note_crowe_memo", "lma_neon_mayor_safe");
    poster(r, "q_map", r.X(4.46), 1.9, r.Z(-0.6), 2.4, 1.8, -PI / 2);
    poster(r, "q_enlist", r.X(-4.46), 2.0, r.Z(1.4), 0.9, 1.2, PI / 2);
    poster(r, "q_enlist", r.X(-2.2), 2.0, r.Z(3.46), 0.9, 1.2, PI);
    board(r, "b_mayor", r.X(0), 2.55, r.Z(-3.46), 2.0, 0.42, 0);
    sofa(r, r.X(2.9), r.Z(1.8), -PI / 2, 2.0, 0x5a3a2a);
    r.bx("wood", 1.2, 0.4, 1.2, 2.0, 0.45, 2.4, {});
    r.col(1.2, 0, 1.2, 2.0, 0.45, 2.4);
    r.bx("metal_dark", 3.6, 0, -3.45, 4.45, 1.1, -2.7, { tint: 0x3a3a34 });
    r.b.cyl("chrome", r.X(4.0), 0.7, r.Z(-2.68), 0.12, 0.12, 0.05, 12, {});
    r.col(3.6, 0, -3.45, 4.45, 1.1, -2.7);
    addContainer(rec, {
      id: "lma_neon_mayor_safe",
      name: "Office Safe",
      kind: "safe",
      loot: "safe",
      lock: {
        id: "lma_neon_mayor_safe",
        label: "Mayor's Office Safe",
        code: "1927",
        hint: "Crowe's memo inside the Mayor's desk",
        learnedFrom: "Crowe's memo inside the Mayor's desk",
      },
      x: r.X(4.0),
      y: 0.7,
      z: r.Z(-2.65),
      anchor: ["loot1", 0],
    });
    r.b.beam(
      "wood_dark",
      r.X(-3.9),
      0,
      r.Z(3.0),
      r.X(-3.9),
      1.8,
      r.Z(3.0),
      0.04,
    );
    for (let k = 0; k < 3; k++)
      r.b.beam(
        "wood_dark",
        r.X(-3.9),
        1.7,
        r.Z(3.0),
        r.X(-3.9 + Math.cos(k * 2.1) * 0.25),
        1.6,
        r.Z(3.0 + Math.sin(k * 2.1) * 0.25),
        0.02,
      );
    r.b.geo("fabric", T.sphereLo, {
      x: r.X(-3.9),
      y: 1.55,
      z: r.Z(3.0),
      sx: 0.25,
      sy: 0.4,
      sz: 0.18,
      tint: 0x2a2a3a,
    });
    lamp(r, r.X(0), r.Z(-1.4), {
      kind: "enamel",
      y: 2.5,
      shade: "paint_green",
      light: 1.1,
      pool: 3.0,
      i: 0.5,
    });
    lamp(r, r.X(0), r.Z(1.8), {
      kind: "fluor",
      y: 3.05,
      col: 0xf4f0e0,
      len: 1.3,
      pool: 3.2,
    });
    r.b.cyl("brass", r.X(1.35), 0.8, r.Z(-2.05), 0.08, 0.08, 0.03, 8, {});
    r.b.beam(
      "brass",
      r.X(1.35),
      0.8,
      r.Z(-2.05),
      r.X(1.35),
      1.2,
      r.Z(-2.05),
      0.015,
    );
    r.b.cyl(
      "paint_green",
      r.X(1.35),
      1.15,
      r.Z(-2.05),
      0.16,
      0.08,
      0.12,
      8,
      {},
    );
    r.g.add(r.X(1.35), 1.1, r.Z(-2.05), 0xffd8a0, "s");
    finish(r);
    return r;
  }

  function power(rec, O) {
    const r = Room("power", O.x + 65, O.z - 25, 18, 14, 6, {
      doorAt: 6.0,
      grime: 0.5,
      entryY: 3.0,
      entryYaw: PI / 2,
    });
    shell(r, {
      floor: "nx_concrete",
      floorTint: 0x7a7a70,
      wall: "nx_brick",
      wallTint: 0x8a7a6a,
      dado: "nx_concrete",
      dadoTint: 0x8a8a80,
      dadoH: 1.2,
      rail: false,
      trim: "metal_dark",
      ceil: "nx_concrete",
      ceilTint: 0x5a5a54,
      doorLeaf: "metal",
      doorTint: 0x3a4a3a,
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // three generators on plinths: body, radiator fins, flywheel, exhaust up through the ceiling
    for (let k = 0; k < 3; k++) {
      const lz = -5.8 + k * 4.4,
        lx = -3.5; // (pushed north: a 1.2 m walkway runs between the south generator and the stair)
      r.bx("concrete", lx - 3.0, 0, lz - 1.1, lx + 3.0, 0.35, lz + 1.1, {
        grime: 0.7,
      });
      r.b.geo("paint_green", T.cyl12, {
        x: r.X(lx),
        y: 1.25,
        z: r.Z(lz),
        rz: PI / 2,
        sx: 0.85,
        sy: 4.2,
        sz: 0.85,
        grime: 0.7,
        tint: 0x5a6a4a,
      });
      for (let f = 0; f < 10; f++)
        r.b.box(
          "metal_dark",
          r.X(lx - 1.9 + f * 0.42),
          0.35,
          r.Z(lz),
          0.05,
          1.8,
          1.9,
          {},
        );
      r.b.geo("metal_dark", T.cyl12, {
        x: r.X(lx + 2.6),
        y: 1.25,
        z: r.Z(lz),
        rz: PI / 2,
        sx: 0.95,
        sy: 0.3,
        sz: 0.95,
      });
      r.b.cyl("rust", r.X(lx - 1.2), 2.0, r.Z(lz), 0.16, 0.16, 4.0, 8, {
        top: false,
      });
      r.b.box(
        "metal_dark",
        r.X(lx + 1.2),
        2.1,
        r.Z(lz + 0.2),
        0.5,
        0.4,
        0.3,
        {},
      );
      r.b.geo("lit_red", T.sphereLo, {
        x: r.X(lx + 1.2),
        y: 2.3,
        z: r.Z(lz + 0.38),
        s: 0.04,
      });
      r.g.add(r.X(lx + 1.2), 2.3, r.Z(lz + 0.5), 0xff4020, "s");
      r.col(lx - 3.0, 0, lz - 1.1, lx + 3.0, 2.2, lz + 1.1, {
        surface: "metal",
      });
      r.b.burn(r.X(lx - 1.2), 2.2, r.Z(lz), 1.2, 0.5);
    }
    // the main breaker panel (east wall): cabinet row, knife switches, glowing gauges
    const PX = 8.8;
    r.bx("metal_dark", PX - 0.5, 0, -4.2, PX + 0.2, 2.6, 1.0, {
      tint: 0x4a5a5a,
    });
    r.col(PX - 0.5, 0, -4.2, PX + 0.2, 2.6, 1.0);
    for (let k = 0; k < 6; k++) {
      const lz = -3.7 + k * 0.85;
      r.b.box("black_metal", r.X(PX - 0.52), 1.2, r.Z(lz), 0.05, 0.6, 0.5, {});
      r.b.beam(
        "chrome",
        r.X(PX - 0.56),
        1.5,
        r.Z(lz),
        r.X(PX - 0.85),
        1.75 - (k % 3 === 1 ? 0.5 : 0),
        r.Z(lz),
        0.03,
      );
      r.b.cyl(
        "paint_white",
        r.X(PX - 0.53),
        2.1,
        r.Z(lz),
        0.12,
        0.12,
        0.02,
        12,
        {},
      );
      r.b.geo(k % 2 ? "lit_green" : "lit_warm", T.sphereLo, {
        x: r.X(PX - 0.55),
        y: 2.35,
        z: r.Z(lz),
        s: 0.04,
      });
      r.g.add(r.X(PX - 0.7), 2.35, r.Z(lz), k % 2 ? 0x60ff60 : 0xffa040, "s");
    }
    board(r, "b_power", r.X(PX - 0.53), 2.9, r.Z(-1.35), 3.0, 0.5, -PI / 2);
    P.signBoard(
      r.b,
      "tsxi",
      K.atlases.tsx_paint.slots.p_danger.rect,
      r.X(PX - 0.53),
      1.45,
      r.Z(0.75),
      0.5,
      0.5,
      -PI / 2,
      { backMat: "metal_dark" },
    );
    A("power_generator", PX - 1.4, -1.35, -PI / 2);
    A("power_panel", PX - 1.4, -1.35, -PI / 2);
    // cable trays + fat cables to the ceiling (the lines up the billboards), fuel drums, a work desk, dry-cell batteries
    r.b.beam("metal", r.X(-8.8), 5.2, r.Z(-6.4), r.X(8.8), 5.2, r.Z(-6.4), 0.3);
    for (let k = 0; k < 4; k++) {
      r.b.beam(
        "rubber",
        r.X(PX - 0.2),
        2.6,
        r.Z(-3.6 + k * 1.3),
        r.X(PX - 0.3),
        5.9,
        r.Z(-6.2 + k * 0.2),
        0.07,
      );
      r.b.beam(
        "rubber",
        r.X(-8.5 + k * 0.3),
        5.25,
        r.Z(-6.35),
        r.X(8.5),
        5.25 + k * 0.05,
        r.Z(-6.35),
        0.05,
      );
    }
    for (let k = 0; k < 7; k++)
      P.barrel(
        r.b,
        r.X(-8.3 + (k % 4) * 0.7),
        0,
        r.Z(5.2 + Math.floor(k / 4) * 0.7),
        k === 3 ? "hazard" : "rust",
        { glows: r.g },
      );
    r.col(-8.7, 0, 4.8, -5.6, 0.9, 6.6);
    // the engineer's bench (battery charging rack) under the landing's edge
    r.bx("wood", 4.0, 0.9, 2.6, 6.4, 0.95, 3.6, {});
    r.bx("metal_dark", 4.05, 0, 2.65, 4.15, 0.9, 3.55, {});
    r.bx("metal_dark", 6.25, 0, 2.65, 6.35, 0.9, 3.55, {});
    r.col(4.0, 0, 2.6, 6.4, 0.95, 3.6);
    for (let k = 0; k < 4; k++) {
      r.b.cyl(
        "metal",
        r.X(4.3 + k * 0.4),
        0.95,
        r.Z(3.25),
        0.09,
        0.09,
        0.22,
        8,
        { tint: 0x8a9a8a },
      );
      r.b.geo("lit_green", T.sphereLo, {
        x: r.X(4.3 + k * 0.4),
        y: 1.19,
        z: r.Z(3.25),
        s: 0.03,
      });
    }
    A("power_engineer", 5.0, 2.0, PI);
    terminal("lma_neon_power", r.X(5.9), 0.95, r.Z(3.0), PI, {
      title: "NEON POWER & LIGHT · LOAD CONTROL",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK · NEON POWER & LIGHT (HELLINGER THEATRE, SUB-BASEMENT)",
      entries: [
        {
          title: "Generator Status",
          text: 'GEN 1 ..... ONLINE  (runs hot, do not lean on it)\nGEN 2 ..... ONLINE  (knocks at 40% load — Wilbur says "character")\nGEN 3 ..... STANDBY (fuel line patched with a boot)\n\nFUEL ON HAND: 11 drums. At current draw: 9 days. At current draw WITH the Ball: 6 days.',
        },
        {
          title: "Load-Shedding Order",
          text: "In a brown-out, cut in THIS order:\n1. The Ball\n2. Billboards (east side)\n3. Billboards (west side)\n4. The Cinder Club's mirror ball\n5. The Opry (they will complain)\n6. The Crossroads Screen\n\nNEVER CUT: the clinic, the gate lamps, the sniper spotlights.",
        },
        {
          title: "Maintenance Log",
          text: '02/11 — replaced breaker 3 with a fork. Temporary.\n02/19 — breaker 3 still a fork.\n03/02 — somebody opened the panel at night. Nothing missing, cables moved, a new splice running down toward the subway side. Somebody scratched a little sun inside the door, twelve rays. Told Kincaid. Kincaid said "rats". Rats do not use screwdrivers.\n03/03 — padlocked the panel. Padlock gone by 03/05.',
        },
      ],
    });
    // ---- the entrance landing (steel grating on posts, 3 m up) and the stair down to the generator floor
    {
      const LY = r.entryY,
        lx0 = 3.4,
        lx1 = 8.95,
        lz0 = 4.6,
        lz1 = 6.98;
      r.bx("metal_dark", lx0, LY - 0.16, lz0, lx1, LY, lz1, {
        tint: 0x5a5e58,
        grime: 0.6,
      });
      r.col(lx0, LY - 0.25, lz0, lx1, LY, lz1, { surface: "metal" });
      for (let k = 0; k < 12; k++)
        r.bx(
          "black_metal",
          lx0 + 0.2 + k * 0.46,
          LY + 0.001,
          lz0 + 0.05,
          lx0 + 0.24 + k * 0.46,
          LY + 0.004,
          lz1 - 0.05,
          {},
        ); // grating bars
      for (const px of [lx0 + 0.1, 6.2, lx1 - 0.1]) {
        r.bx(
          "metal_dark",
          px - 0.08,
          0,
          lz0 + 0.02,
          px + 0.08,
          LY - 0.16,
          lz0 + 0.18,
          {},
        );
        r.col(px - 0.08, 0, lz0 + 0.02, px + 0.08, LY - 0.16, lz0 + 0.18);
      }
      r.b.beam(
        "metal_dark",
        r.X(lx0 + 0.1),
        0.2,
        r.Z(lz0 + 0.1),
        r.X(6.2),
        LY - 0.3,
        r.Z(lz0 + 0.1),
        0.04,
      );
      r.b.beam(
        "metal_dark",
        r.X(6.2),
        0.2,
        r.Z(lz0 + 0.1),
        r.X(lx1 - 0.1),
        LY - 0.3,
        r.Z(lz0 + 0.1),
        0.04,
      );
      // handrail round the landing's open edge (north) + down the stair's open side
      r.b.beam(
        "paint_yellow",
        r.X(lx0 + 0.3),
        LY + 1.0,
        r.Z(lz0 + 0.04),
        r.X(lx1),
        LY + 1.0,
        r.Z(lz0 + 0.04),
        0.035,
      );
      r.b.beam(
        "paint_yellow",
        r.X(lx0 + 0.3),
        LY + 0.5,
        r.Z(lz0 + 0.04),
        r.X(lx1),
        LY + 0.5,
        r.Z(lz0 + 0.04),
        0.025,
      );
      for (let x = lx0 + 0.3; x <= lx1 + 0.01; x += 1.1)
        r.b.beam(
          "paint_yellow",
          r.X(x),
          LY,
          r.Z(lz0 + 0.04),
          r.X(x),
          LY + 1.0,
          r.Z(lz0 + 0.04),
          0.03,
        );
      r.col(lx0 + 0.3, LY, lz0 - 0.02, lx1, LY + 1.05, lz0 + 0.08, {
        walkable: false,
      });
      // west edge of the landing beside the stair head
      r.b.beam(
        "paint_yellow",
        r.X(lx0 + 0.04),
        LY + 1.0,
        r.Z(lz0 + 0.04),
        r.X(lx0 + 0.04),
        LY + 1.0,
        r.Z(5.36),
        0.035,
      );
      r.b.beam(
        "paint_yellow",
        r.X(lx0 + 0.04),
        LY,
        r.Z(lz0 + 0.3),
        r.X(lx0 + 0.04),
        LY + 1.0,
        r.Z(lz0 + 0.3),
        0.03,
      );
      r.col(lx0 - 0.02, LY, lz0, lx0 + 0.08, LY + 1.05, 5.36, {
        walkable: false,
      });
      // stair: bottom at x -2.6, rising east to the landing (15 steps of 20 cm), 1.6 m wide against the south wall
      const sz = 6.18,
        sw = 1.6;
      r.b.stairs("metal_dark", r.X(-2.6), r.Z(sz), 1, 0, sw, 6.0, 0, LY, 15, {
        tint: 0x5a5e58,
        grime: 0.55,
      });
      r.bx(
        "metal_dark",
        -2.6,
        0,
        sz - sw / 2 - 0.06,
        lx0,
        0.12,
        sz - sw / 2,
        {},
      ); // stringer
      // open-side rail from where the drop gets real (the bottom 1.4 m of the flight can be stepped off sideways)
      r.b.beam(
        "paint_yellow",
        r.X(-1.2),
        0.7 + 1.0,
        r.Z(sz - sw / 2 - 0.04),
        r.X(lx0 + 0.3),
        LY + 1.0,
        r.Z(sz - sw / 2 - 0.04),
        0.035,
      );
      for (let k = 0; k <= 4; k++) {
        const x = -1.2 + k * 1.15,
          y = (LY * (x + 2.6)) / 6.0;
        r.b.beam(
          "paint_yellow",
          r.X(x),
          y,
          r.Z(sz - sw / 2 - 0.04),
          r.X(x),
          y + 1.0,
          r.Z(sz - sw / 2 - 0.04),
          0.03,
        );
      }
      K.colRot(
        r.X(1.1),
        r.Z(sz - sw / 2 - 0.04),
        4.6,
        0.08,
        0.7,
        LY + 1.05,
        0,
        { walkable: false },
      );
      for (let k = 0; k < 7; k++)
        r.bx(
          "paint_yellow",
          3.5 + k * 0.8,
          LY + 0.001,
          lz1 - 0.14,
          3.9 + k * 0.8,
          LY + 0.006,
          lz1 - 0.02,
          {},
        ); // hazard edge at the door
      board(r, "b_power", r.X(-0.2), 4.4, r.Z(6.96), 3.0, 0.5, PI);
      lamp(r, r.X(6.2), r.Z(6.1), {
        kind: "cage",
        y: LY + 2.3,
        col: 0xffd8a0,
        pool: 2.4,
        i: 0.5,
        fy: LY,
      });
      lamp(r, r.X(0.4), r.Z(6.1), {
        kind: "cage",
        y: 4.8,
        col: 0xffd8a0,
        pool: 3.0,
        i: 0.45,
        fy: 1.5,
      });
      P.signBoard(
        r.b,
        "tsxi",
        K.atlases.tsx_paint.slots.p_danger.rect,
        r.X(lx1 - 0.6),
        LY + 1.5,
        r.Z(6.96),
        0.5,
        0.5,
        PI,
        { backMat: "metal_dark" },
      );
    }
    poster(r, "q_purge", r.X(-5.2), 2.0, r.Z(6.96), 0.7, 0.92, PI);
    // hazard stripes on the floor round the generators, caged bulbs (one flickering), steam
    for (let k = 0; k < 14; k++)
      r.b.box(
        k % 2 ? "paint_yellow" : "black_metal",
        r.X(-7 + k * 0.5),
        0.005,
        r.Z(-6.8),
        0.5,
        0.01,
        0.12,
        {},
      );
    for (const q of [
      [-3.5, -5.8],
      [-3.5, -1.4],
      [-3.5, 3.0],
      [5.5, -2.0],
      [5.5, 3.0],
    ])
      lamp(r, r.X(q[0]), r.Z(q[1]), {
        kind: "cage",
        y: 4.6,
        col: 0xffd8a0,
        pool: 4.0,
        i: 0.4,
      });
    r.fix.push([
      r.X(2),
      4.2,
      r.Z(-1),
      0xffd8a8,
      { intensity: 1.4, range: 12, flicker: 0.3 },
    ]);
    r.fix.push([
      r.X(PX - 1.2),
      2.4,
      r.Z(-1.35),
      0x9ad8ff,
      { intensity: 0.9, range: 6 },
    ]);
    finish(r);
    return r;
  }

  function depot(rec, O) {
    const r = Room("depot", O.x - 70, O.z + 28, 16, 12, 6, {
      doorAt: -1.0,
      grime: 0.45,
    });
    shell(r, {
      floor: "nx_concrete",
      floorTint: 0x8a8070,
      wall: "nx_brickb",
      wallTint: 0xa08a70,
      trim: "wood_dark",
      ceil: "nx_corr",
      ceilTint: 0x7a6a5a,
      doorLeaf: "wood",
      doorTint: 0x6a4a2a,
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // pallet racks (west + north), crates on them and on the floor
    const rack = (lx0, lz0, lx1, lz1) => {
      for (const p of [
        [lx0, lz0],
        [lx1, lz0],
        [lx0, lz1],
        [lx1, lz1],
      ])
        r.bx(
          "paint_blue",
          p[0] - 0.05,
          0,
          p[1] - 0.05,
          p[0] + 0.05,
          4.2,
          p[1] + 0.05,
          { tint: 0x3a5a8a },
        );
      for (const y of [0.15, 1.5, 2.9]) {
        r.bx("paint_red", lx0, y, lz0, lx1, y + 0.1, lz0 + 0.08, {
          tint: 0xc05a20,
        });
        r.bx("paint_red", lx0, y, lz1 - 0.08, lx1, y + 0.1, lz1, {
          tint: 0xc05a20,
        });
        r.bx("wood", lx0, y + 0.1, lz0, lx1, y + 0.14, lz1, {});
      }
      const rr = K.rng(Math.round(lx0 * 7 + lz0 * 3));
      for (const y of [0.24, 1.64, 3.04])
        for (let k = 0; k < 3; k++)
          if (rr() < 0.8) {
            const s = 0.6 + rr() * 0.4;
            P.crate(
              r.b,
              r.X(lx0 + ((lx1 - lx0) * (k + 0.5)) / 3),
              y,
              r.Z((lz0 + lz1) / 2),
              s,
              rr() * 0.3,
              { tint: [0xffffff, 0x8a9a6a, 0xb8a080][k] },
            );
          }
      r.col(lx0, 0, lz0, lx1, 4.2, lz1);
    };
    rack(-7.8, -5.8, -1.0, -4.6);
    rack(-7.8, -3.0, -6.6, 3.2);
    for (const c of [
      [-3.5, -1.5, 0.3],
      [-2.6, -1.3, 1.0],
      [-3.1, -1.4, 0.6, 0.9],
      [1.8, -2.8, 0.2],
      [2.7, -3.0, 0.8],
    ])
      P.crate(r.b, r.X(c[0]), c[3] || 0, r.Z(c[1]), 0.9, c[2]);
    r.col(-4.0, 0, -2.0, -2.1, 1.8, -0.9);
    r.col(1.3, 0, -3.5, 3.2, 0.9, -2.3);
    // feed sacks, tack on pegs, lanterns, a freight scale, the chalkboard of routes
    for (let k = 0; k < 8; k++)
      r.b.geo("nx_fabric", T.sphereLo, {
        x: r.X(5.0 + (k % 4) * 0.55),
        y: 0.28 + Math.floor(k / 4) * 0.4,
        z: r.Z(-5.2),
        sx: 0.32,
        sy: 0.24,
        sz: 0.24,
        tint: 0xc8b078,
        grime: 0.5,
      });
    r.col(4.6, 0, -5.8, 7.4, 0.8, -4.7);
    for (let k = 0; k < 5; k++) {
      r.b.beam(
        "wood_dark",
        r.X(7.95),
        2.0,
        r.Z(-2 + k * 0.7),
        r.X(7.7),
        2.0,
        r.Z(-2 + k * 0.7),
        0.03,
      );
      r.b.geo("fabric", T.torusThick, {
        x: r.X(7.75),
        y: 1.75,
        z: r.Z(-2 + k * 0.7),
        ry: PI / 2,
        s: 0.25,
        tint: 0x5a3a1a,
      });
    }
    r.bx("metal", 3.0, 0, 2.0, 4.4, 0.12, 3.4, { tint: 0x6a6a60 });
    r.b.beam("metal", r.X(4.3), 0.12, r.Z(2.7), r.X(4.3), 1.4, r.Z(2.7), 0.06);
    r.b.cyl("paint_white", r.X(4.3), 1.4, r.Z(2.7), 0.22, 0.22, 0.08, 14, {});
    poster(r, "q_routes", r.X(7.96), 2.3, r.Z(2.6), 2.2, 1.4, -PI / 2);
    // the freight office: a plywood cubicle with a window and a desk (the clerk), strongbox
    r.bx("wood", 3.4, 0, -1.0, 7.95, 2.4, -0.9, { tint: 0xb89a70 });
    r.bx("wood", 3.4, 0, -1.0, 3.5, 2.4, 1.2, { tint: 0xb89a70 });
    r.b.panel("glass", r.X(5.6), 1.6, r.Z(-0.88), 1.6, 0.8, PI, {});
    r.col(3.4, 0, -1.0, 7.95, 2.4, -0.9);
    r.col(3.4, 0, -1.0, 3.5, 2.4, 0.2);
    r.bx("wood", 5.0, 0.75, 0.2, 7.2, 0.8, 1.0, {});
    r.col(5.0, 0, 0.2, 7.2, 0.8, 1.0);
    board(r, "b_depot", r.X(5.6), 2.2, r.Z(-0.86), 2.4, 0.4, PI);
    A("depot_clerk", 6.1, -0.35, PI);
    for (const q of [
      [5.1, 0.25],
      [7.1, 0.25],
      [5.1, 0.95],
      [7.1, 0.95],
    ])
      r.bx(
        "wood_dark",
        q[0] - 0.04,
        0,
        q[1] - 0.04,
        q[0] + 0.04,
        0.75,
        q[1] + 0.04,
        {},
      );
    addContainer(rec, {
      id: "lma_neon_depot_desk",
      name: "Freight Office Desk",
      kind: "desk",
      loot: "desk",
      x: r.X(5.6),
      y: 0.6,
      z: r.Z(0.6),
      anchor: ["depot_desk", 0],
    });
    r.bx("metal_dark", 7.2, 0, -0.7, 7.8, 0.5, -0.2, { tint: 0x3a3a30 });
    r.b.box("brass", r.X(7.5), 0.3, r.Z(-0.19), 0.12, 0.08, 0.02, {});
    r.col(7.2, 0, -0.7, 7.8, 0.5, -0.2);
    addContainer(rec, {
      id: "lma_neon_depot_strongbox",
      name: "Freight Strongbox",
      kind: "safe",
      loot: "trade_wagon",
      lock: {
        id: "lma_neon_depot_strongbox",
        label: "Freight Depot Strongbox",
        code: "5509",
        hint: 'Freight depot terminal, "Memo — Guard Escort Rates"',
        learnedFrom: 'Freight depot terminal, "Memo — Guard Escort Rates"',
      },
      x: r.X(7.5),
      y: 0.55,
      z: r.Z(-0.1),
      anchor: ["depot_safe", 0],
    });
    terminal("lma_neon_depot", r.X(6.5), 0.8, r.Z(0.55), PI, {
      title: "NEON FREIGHT · MANIFESTS",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK · NEON FREIGHT DEPOT, TIMES SQUARE",
      entries: [
        {
          title: "Routes This Week",
          text: 'GRAND CENTRAL MARKET ..... MON / THU (Eustace)\nRADIO CITY ............... TUE / FRI\nCARNEGIE HALL ............ SAT (armed escort ONLY)\n\nNo riders past dusk. No riders past Bryant Park after the burrow rats. No riders who "know a shortcut".',
        },
        {
          title: "Manifest #0412",
          text: 'OUT: 6 jugs purified water, 2 crates iodine tabs, 1 crate "misc. screws", 1 jukebox (broken, for Radio City, do NOT ask why)\nIN: 40 lbs ox jerky, 12 dry-cell batteries (3 dead), a crate of old-world records, one (1) accordion.\n\nNote: the accordion was not ordered. Nobody will claim the accordion.',
        },
        {
          title: "Lost & Found",
          text: 'FOUND: one pack ox, one horn, answers to "Gerald" and, on Sundays, to "Mister Gerald".\nLOST: the Carnegie run\'s second wagon. Last seen on 57th. Driver Hank says "the dogs got it". The dogs say nothing.',
        },
        {
          title: "Memo — Guard Escort Rates",
          text: () => {
            learn("lma_neon_depot_strongbox");
            return "Kincaid wants 30 scrip a guard a run. We counter-offered 20 and a hot meal. He counter-countered with a look. We are paying 30.\n\nThe escort money goes in the strongbox. Combination this quarter: 5-5-0-9. Do NOT chalk it on the routes board again, Eustace.";
          },
        },
      ],
    });
    for (const q of [
      [-4, -1],
      [2, -1.5],
      [0, 3.5],
      [5.8, 0.4],
    ])
      lamp(r, r.X(q[0]), r.Z(q[1]), {
        kind: q[0] > 5 ? "bulb" : "cage",
        y: q[0] > 5 ? 2.2 : 4.4,
        col: 0xffc880,
        pool: 3.6,
      });
    r.fix.push([r.X(0), 4.0, r.Z(0), 0xffd8a8, { intensity: 1.3, range: 12 }]);
    finish(r);
    return r;
  }

  function bunk(rec, O) {
    const r = Room("bunk", O.x - 25, O.z + 25, 18, 16, 3.4, { doorAt: 0 });
    shell(r, {
      floor: "nx_wood",
      floorTint: 0x7a5a3a,
      wall: "nx_paper",
      wallTint: 0xa8b8c8,
      dado: "nx_wood",
      dadoTint: 0x4a3020,
      trim: "wood_dark",
      ceil: "nx_tin",
      doorLeaf: "glass",
      doorFrame: "brass",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // lobby (south): the front desk + key rack + bell, a sofa, a rug, the blocked stair
    r.bx("wood_dark", 3.0, 0, 3.4, 7.0, 1.1, 4.0, {});
    r.bx("marble", 2.9, 1.1, 3.3, 7.1, 1.16, 4.1, {});
    r.col(3.0, 0, 3.4, 7.0, 1.16, 4.0, { surface: "wood" });
    r.b.geo("brass", T.sphereLo, {
      x: r.X(4.0),
      y: 1.2,
      z: r.Z(3.6),
      sx: 0.08,
      sy: 0.05,
      sz: 0.08,
    });
    r.bx("wood", 3.5, 1.4, 1.02, 6.5, 2.6, 1.08, { tint: 0x6a4a2a });
    for (let k = 0; k < 16; k++) {
      const lx = 3.7 + (k % 8) * 0.36,
        y = 2.3 - Math.floor(k / 8) * 0.45;
      r.b.box("brass", r.X(lx), y, r.Z(1.1), 0.02, 0.08, 0.02, {});
      if (k % 3)
        r.b.box("brass", r.X(lx), y - 0.14, r.Z(1.12), 0.05, 0.08, 0.01, {});
    }
    A("bunk_keeper", 5.0, 2.6, PI);
    board(r, "b_bunk", r.X(5.0), 2.95, r.Z(1.1), 3.0, 0.4, PI);
    // wait — the key rack hangs on a partition behind the desk
    r.bx("wood", 2.5, 0, 0.9, 8.95, 3.4, 1.0, { tint: 0x8a6a4a });
    r.col(2.5, 0, 0.9, 8.95, 3.4, 1.0);
    sofa(r, r.X(-5.5), r.Z(5.9), PI, 2.4, 0x3a4a6a);
    r.bx("fabric", -7.2, 0.005, 3.6, -3.4, 0.015, 6.4, {
      tint: 0x6a2a2a,
      faces: "t",
    });
    r.bx("wood", -6.1, 0.4, 4.2, -4.9, 0.45, 4.9, {});
    r.col(-6.1, 0, 4.2, -4.9, 0.45, 4.9);
    P.rubblePile(r.b, r.X(-7.8), r.Z(1.5), 1.2, 1.4, { seed: 881 });
    r.col(-8.9, 0, 0.3, -6.8, 1.4, 2.6);
    r.b.stairs("nx_wood", r.X(-8.2), r.Z(3.6), 0, -1, 1.4, 2.4, 0, 1.4, 6, {});
    poster(r, "q_fizzo", r.X(-8.97), 2.1, r.Z(5.2), 0.8, 1.05, PI / 2);
    // the dorm (north): plywood cubicles along both walls, two cots in each, lockers at the end of the aisle
    let n = 0;
    for (const sd of [-1, 1])
      for (let k = 0; k < 4; k++) {
        const lz0 = -7.8 + k * 2.1,
          lz1 = lz0 + 2.0;
        const xa = sd * 1.5,
          xb = sd * 8.95;
        r.bx(
          "wood",
          Math.min(xa, xb),
          0,
          lz1 - 0.05,
          Math.max(xa, xb),
          2.1,
          lz1 + 0.05,
          { tint: 0x9a7a5a, grime: 0.5 },
        );
        r.col(
          Math.min(xa, xb),
          0,
          lz1 - 0.05,
          Math.max(xa, xb),
          2.1,
          lz1 + 0.05,
          { surface: "wood" },
        );
        r.b.beam(
          "chrome",
          r.X(xa),
          2.05,
          r.Z(lz0 + 0.1),
          r.X(xa),
          2.05,
          r.Z(lz1 - 0.1),
          0.015,
        );
        r.bx(
          "fabric",
          sd > 0 ? xa - 0.02 : xa - 0.02,
          0.3,
          lz0 + 0.1,
          xa + 0.02,
          2.0,
          lz0 + 0.8,
          { tint: [0x8a3a3a, 0x3a5a7a, 0x6a6a3a, 0x5a3a6a][k] },
        );
        for (let c = 0; c < 2; c++) {
          const lx = sd * (4.3 + c * 3.0),
            lz = lz0 + 1.0;
          cot(r, r.X(lx), r.Z(lz), PI / 2, {
            blanket: [0x5a4a6a, 0x6a3a2a, 0x3a5a4a, 0x6a6a5a][(k + c) % 4],
          });
          n++;
          A("bunk_" + n, lx, lz, sd > 0 ? PI / 2 : -PI / 2);
        }
        r.b.box(
          "wood_dark",
          r.X(sd * 2.2),
          0,
          r.Z(lz0 + 0.5),
          0.45,
          0.6,
          0.4,
          {},
        );
        r.b.cyl(
          "lit_warm",
          r.X(sd * 2.2),
          0.6,
          r.Z(lz0 + 0.5),
          0.05,
          0.05,
          0.14,
          6,
          { tint: 0xffa040 },
        );
        r.g.add(r.X(sd * 2.2), 0.75, r.Z(lz0 + 0.5), 0xffa040, "s");
      }
    locker(r, r.X(0), r.Z(-7.7), 0, 6, { tint: 0x5a6a7a });
    hiddenAnchor(rec, "bunk_locker", r.X(0), 0, r.Z(-6.8), 0);
    note("lma_neon_note_houserules", r.X(6.2), 1.17, r.Z(3.7), {
      name: "Bunkhouse House Rules",
      title: "Bunkhouse House Rules",
      value: 1,
      text: "THE BUNKHOUSE HOTEL — HOUSE RULES\n\n1. Beds are 20 scrip. Checkout is whenever you wake up.\n2. One sleeper per cot. Pack oxen are not 'a sleeper'.\n3. No shooting in the dorm. No shooting AT the dorm.\n4. The stairs are closed. There is nothing upstairs. Stop asking about upstairs.\n5. If you lose your mind in the night, please do it quietly.\n\n— The Management (Mrs. Pettibone)",
    });
    for (const lz of [-6.5, -3.5, -0.5])
      lamp(r, r.X(0), r.Z(lz), {
        kind: "bulb",
        y: 2.9,
        col: 0xffd8a0,
        pool: 3.0,
        i: 0.45,
      });
    lamp(r, r.X(5.0), r.Z(3.6), {
      kind: "enamel",
      y: 2.6,
      shade: "paint_green",
      light: 1.1,
      pool: 3.0,
    });
    lamp(r, r.X(-4), r.Z(4.5), {
      kind: "chandelier",
      y: 2.8,
      col: 0xffe0a8,
      pool: 3.6,
      i: 0.4,
    });
    r.fix.push([
      r.X(0),
      2.6,
      r.Z(-3.5),
      0xffd8a8,
      { intensity: 1.0, range: 9 },
    ]);
    finish(r);
    return r;
  }

  function barracks(rec, O) {
    const r = Room("barracks", O.x + 20, O.z + 25, 16, 10, 3.4, {
      doorAt: -4.0,
    });
    shell(r, {
      floor: "nx_concrete",
      floorTint: 0x7a7a70,
      wall: "nx_tile",
      dado: "nx_tile",
      dadoTint: 0x9a8a6a,
      dadoH: 0.9,
      rail: false,
      trim: "paint_green",
      ceil: "nx_concrete",
      ceilTint: 0x6a6a64,
      doorLeaf: "metal_dark",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // mosaic band + "42" tablets, a row of green I-beam columns down the middle
    r.bx("paint_red", -8, 2.4, -4.99, 8, 2.55, -4.96, { tint: 0x6a1a18 });
    for (const lx of [-5.5, 0, 5.5])
      poster(r, "q_mosaic", r.X(lx), 2.9, r.Z(-4.97), 0.6, 0.6, 0);
    for (const lx of [-4, 0, 4]) {
      r.bx("paint_green", lx - 0.12, 0, -0.12, lx + 0.12, 3.4, 0.12, {
        tint: 0x3a6a4a,
      });
      r.col(lx - 0.12, 0, -0.12, lx + 0.12, 3.4, 0.12);
    }
    // bunks (double) + footlockers along the west half
    const bunkBed = (lx, lz) => {
      cot(r, r.X(lx), r.Z(lz), 0, { blanket: 0x4a5a3a });
      for (const q of [
        [-0.45, -0.95],
        [0.45, -0.95],
        [-0.45, 0.95],
        [0.45, 0.95],
      ])
        r.b.beam(
          "metal_dark",
          r.X(lx + q[0]),
          0,
          r.Z(lz + q[1]),
          r.X(lx + q[0]),
          1.9,
          r.Z(lz + q[1]),
          0.035,
        );
      r.bx(
        "metal_dark",
        lx - 0.45,
        1.4,
        lz - 0.97,
        lx + 0.45,
        1.46,
        lz + 0.97,
        {},
      );
      r.bx("fabric", lx - 0.42, 1.46, lz - 0.93, lx + 0.42, 1.56, lz + 0.93, {
        tint: 0x6a6a4a,
        grime: 0.6,
      });
      r.b.box("wood_dark", r.X(lx), 0, r.Z(lz + 1.3), 0.8, 0.45, 0.45, {
        tint: 0x4a5a3a,
      });
    };
    let n = 0;
    for (const lx of [-7.2, -5.6])
      for (const lz of [-3.6, 1.8]) {
        bunkBed(lx, lz);
        n++;
        A("barracks_bunk_" + n, lx, lz, 0);
      }
    // the armory cage (NE): chain link, weapon racks, ammo crates, a workbench
    const cx0 = 3.0,
      cx1 = 7.95,
      cz0 = -4.95,
      cz1 = -1.4;
    for (let k = 0; k <= 10; k++) {
      const lx = cx0 + ((cx1 - cx0) * k) / 10;
      r.b.beam("metal", r.X(lx), 0, r.Z(cz1), r.X(lx), 2.6, r.Z(cz1), 0.02);
    }
    for (let k = 0; k <= 6; k++) {
      const lz = cz0 + ((cz1 - cz0) * k) / 6;
      r.b.beam("metal", r.X(cx0), 0, r.Z(lz), r.X(cx0), 2.6, r.Z(lz), 0.02);
    }
    for (const y of [0.1, 1.3, 2.6]) {
      r.b.beam("metal", r.X(cx0), y, r.Z(cz1), r.X(cx1), y, r.Z(cz1), 0.03);
      r.b.beam("metal", r.X(cx0), y, r.Z(cz0), r.X(cx0), y, r.Z(cz1), 0.03);
    }
    r.col(cx0, 0, cz1 - 0.05, cx1 - 1.3, 2.6, cz1 + 0.05);
    r.col(cx0 - 0.05, 0, cz0, cx0 + 0.05, 2.6, cz1);
    for (let k = 0; k < 9; k++) {
      const lx = 3.5 + k * 0.45;
      r.b.beam(
        "wood_dark",
        r.X(lx),
        0.25,
        r.Z(-4.75),
        r.X(lx + 0.05),
        1.55,
        r.Z(-4.85),
        0.05,
      );
      r.b.beam(
        "black_metal",
        r.X(lx),
        0.9,
        r.Z(-4.7),
        r.X(lx + 0.02),
        1.5,
        r.Z(-4.72),
        0.03,
      );
    }
    r.bx("wood_dark", 3.3, 0.2, -4.95, 7.6, 0.28, -4.5, {});
    // ammo crates stacked in the NE corner (the cage gate is the 1.3 m gap at its SE corner — keep the way in clear)
    for (const c of [
      [7.3, -3.35, 0.1],
      [7.35, -3.4, 0.5, 0.7],
    ])
      P.crate(r.b, r.X(c[0]), c[3] || 0, r.Z(c[1]), 0.7, c[2], {
        tint: 0x6a7a4a,
      });
    r.col(6.9, 0, -3.9, 7.9, 1.4, -2.9);
    addContainer(rec, {
      id: "lma_neon_armory_ammo",
      name: "Armory Ammo Crate",
      kind: "ammo_box",
      loot: "ammo_box",
      lock: {
        id: "lma_neon_armory_ammo",
        label: "Neon Guard Armory Crate",
        code: "2618",
        hint: 'Barracks duty-roster terminal, "Standing Orders"',
        learnedFrom: 'Barracks duty-roster terminal, "Standing Orders"',
      },
      x: r.X(7.2),
      y: 0.75,
      z: r.Z(-2.85),
    });
    // the cage door, swung open against the front mesh, with a padlock hanging off the hasp
    r.b.box("metal", r.X(6.0), 0.05, r.Z(-1.3), 1.25, 2.5, 0.04, {
      yaw: 0.25,
      tint: 0x9a9a8a,
    });
    r.b.box("brass", r.X(6.66), 1.1, r.Z(-1.36), 0.08, 0.12, 0.06, {});
    A("armory", 4.6, -2.6, AY(0));
    // duty desk against the south wall with the roster terminal (faces the room)
    r.bx("metal_dark", 2.2, 0, 4.25, 3.8, 0.76, 4.95, { tint: 0x4a5a4a });
    r.bx("wood", 2.15, 0.76, 4.2, 3.85, 0.8, 4.98, {});
    r.col(2.15, 0, 4.2, 3.85, 0.8, 4.98);
    P.chair(r.b, r.X(3.0), 0, r.Z(3.7), 0);
    terminal("lma_neon_barracks", r.X(2.7), 0.8, r.Z(4.6), PI, {
      title: "NEON GUARD · DUTY ROSTER",
      header: "MERIDIAN TELETYPE CO. — TELELINK · NEON GUARD, 42ND ST BARRACKS",
      entries: [
        {
          title: "Standing Orders",
          text: () => {
            learn("lma_neon_armory_ammo");
            return "1. Holster check at every gate. Strangers get ONE warning. Our own get one warning and a look.\n2. Nobody fires inside the square. If somebody fires inside the square, everybody fires at them.\n3. Snipers on the roof rotate every six hours. Bring water. Bring a hat. The sun is still up there.\n4. The Ball is not a target.\n5. Armory crate combination is 2-6-1-8. Learn it. Do not shout it across the square.\n\n— Capt. Kincaid";
          },
        },
        {
          title: "Roster — This Week",
          text: 'GATE N ...... Haskins, Dray\nGATE S ...... Mags, "Two-Tone"\nGATE E ...... Petrakis, Lum\nGATE W ...... Osei, the new kid (name TBD)\nROOF ........ Vera, Sully\nNIGHT WATCH . whoever lost at cards',
        },
        {
          title: "Incident Log",
          text: "02/12 — Giant roach in the armory. Dealt with.\n02/13 — Second giant roach in the armory. Dealt with. Armory declared \"a roach situation\".\n02/15 — Somebody painted a mustache on the Mayor's poster. Suspect: everybody.\n02/17 — Sprocket's Valet, Marquee, sang outside the barracks until 0400. Nobody could find the off switch. There is no off switch.",
        },
      ],
    });
    board(r, "b_armory", r.X(5.4), 2.95, r.Z(-4.95), 2.6, 0.42, 0);
    // map table + the bounty board by the door, sandbags inside the entrance
    r.bx("wood", -1.2, 0.85, 1.6, 1.6, 0.9, 3.4, {});
    for (const q of [
      [-1.1, 1.7],
      [1.5, 1.7],
      [-1.1, 3.3],
      [1.5, 3.3],
    ])
      r.bx(
        "wood_dark",
        q[0] - 0.05,
        0,
        q[1] - 0.05,
        q[0] + 0.05,
        0.85,
        q[1] + 0.05,
        {},
      );
    r.b.quad(
      "tsxi",
      [r.X(-1.0), 0.905, r.Z(3.3)],
      [r.X(1.4), 0.905, r.Z(3.3)],
      [r.X(1.4), 0.905, r.Z(1.7)],
      [r.X(-1.0), 0.905, r.Z(1.7)],
      { rect: K.atlases.tsx_paint.slots.q_map.rect },
    );
    r.col(-1.2, 0, 1.6, 1.6, 0.9, 3.4);
    A("barracks_sergeant", 0.2, 1.1, PI);
    for (const q of [
      ["q_wanted1", -1.6],
      ["q_wanted2", -0.7],
      ["q_wanted3", 0.2],
    ])
      poster(r, q[0], r.X(q[1]), 1.9, r.Z(4.97), 0.7, 0.92, PI);
    A("bounty_board", -0.7, 4.0, 0);
    P.sandbags(r.b, r.X(-6.4), r.Z(4.2), r.X(-5.2), r.Z(3.4), 2, { seed: 991 });
    P.sandbags(r.b, r.X(-1.6), r.Z(4.2), r.X(-2.8), r.Z(3.4), 2, { seed: 992 });
    for (const q of [
      [-5, -2],
      [-5, 2.5],
      [0, -2.5],
      [4.8, -3.2],
      [4, 2.5],
    ])
      lamp(r, r.X(q[0]), r.Z(q[1]), {
        kind: q[0] > 4 ? "cage" : "fluor",
        y: 3.2,
        col: 0xeef4e8,
        len: 1.2,
        yaw: PI / 2,
        pool: 3.4,
        i: 0.45,
      });
    r.fix.push([r.X(0), 3.0, r.Z(0), 0xf0f4e8, { intensity: 1.1, range: 10 }]);
    finish(r);
    return r;
  }

  function club(rec, O) {
    const r = Room("club", O.x + 65, O.z + 25, 14, 12, 4.5, {
      doorAt: 0,
      grime: 0.25,
    });
    shell(r, {
      floor: "nx_checker",
      floorTint: 0xd8c8e8,
      wall: "nx_velvet_purple",
      dado: "nx_wood",
      dadoTint: 0x2a0a1a,
      trim: "chrome",
      railMat: "chrome",
      ceil: "nx_tin",
      ceilTint: 0x2a1a2a,
      doorLeaf: "fabric",
      doorTint: 0x5a1030,
      doorFrame: "chrome",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // the little stage (NW) with a mic in a spot, the Cinder Club neon behind, a piano
    r.bx("wood_dark", -7, 0, -6, -1.5, 0.45, -3.2, { tint: 0x3a1a2a });
    r.col(-7, 0, -6, -1.5, 0.45, -3.2, { surface: "wood" });
    r.bx("chrome", -7, 0.42, -3.24, -1.5, 0.47, -3.18, {});
    r.b.beam(
      "black_metal",
      r.X(-4.2),
      0.45,
      r.Z(-4.2),
      r.X(-4.2),
      1.95,
      r.Z(-4.2),
      0.02,
    );
    r.b.geo("chrome", T.sphereLo, {
      x: r.X(-4.2),
      y: 2.0,
      z: r.Z(-4.2),
      s: 0.07,
    });
    neonSign(r, "x_cinder", r.X(-4.2), 2.9, r.Z(-5.95), 3.4, 0, 0xff6ad0, "l");
    r.sp.add(r.X(-4.2), r.Z(-4.2), 0xffe0f0, 1.8, { y: 0.48, i: 0.8 });
    r.b.beam(
      "black_metal",
      r.X(-4.2),
      4.5,
      r.Z(-2.4),
      r.X(-4.2),
      4.0,
      r.Z(-2.4),
      0.02,
    );
    r.b.cyl("black_metal", r.X(-4.2), 3.7, r.Z(-2.4), 0.16, 0.24, 0.4, 8, {});
    r.g.add(r.X(-4.2), 3.65, r.Z(-2.5), 0xfff0f8, "m");
    r.bx("wood_dark", -6.9, 0.45, -5.95, -5.5, 1.75, -5.3, { tint: 0x1a1a1a });
    r.col(-6.9, 0.45, -5.95, -5.5, 1.75, -5.3);
    A("club_host", -4.2, -4.6, PI, 0.45);
    A("club_stage", -4.2, -4.6, PI, 0.45);
    // the bar (east wall): padded front, chrome top, mirrored back bar with glowing bottles, stools
    r.bx("fabric", 4.6, 0, -4.8, 5.4, 1.1, 2.4, { tint: 0x5a1030 });
    r.bx("chrome", 4.5, 1.1, -4.9, 5.5, 1.15, 2.5, {});
    r.col(4.6, 0, -4.8, 5.4, 1.15, 2.4, { surface: "wood" });
    r.b.panel("glass", r.X(6.95), 2.0, r.Z(-1.2), 5.8, 1.6, -PI / 2, {
      tint: 0xa0a0c0,
    });
    for (let i = 0; i < 2; i++) {
      r.bx("glass", 6.5, 1.3 + i * 0.6, -4.0, 6.95, 1.33 + i * 0.6, 1.6, {});
      for (let k = 0; k < 16; k++)
        r.b.cyl(
          "lit_warm",
          r.X(6.7),
          1.33 + i * 0.6,
          r.Z(-3.8 + k * 0.34),
          0.04,
          0.035,
          0.26,
          6,
          { tint: [0xff60c0, 0x60c0ff, 0xffc040, 0x80ff80][(k + i) % 4] },
        );
    }
    r.g.add(r.X(6.4), 1.7, r.Z(-1.2), 0xff80d0, "l");
    neonSign(
      r,
      "x_cocktail",
      r.X(6.95),
      3.4,
      r.Z(-1.2),
      2.6,
      -PI / 2,
      0xff9a3a,
    );
    for (let k = 0; k < 5; k++) {
      const lz = -4.0 + k * 1.4;
      r.b.cyl("chrome", r.X(4.1), 0, r.Z(lz), 0.04, 0.04, 0.75, 6, {});
      r.b.cyl("fabric", r.X(4.1), 0.75, r.Z(lz), 0.2, 0.2, 0.08, 10, {
        tint: 0xd84080,
      });
    }
    A("club_bar", 6.0, -1.2, PI / 2);
    // round booths with tables, a mirror ball, pink tubes along the ceiling
    const booth = (lx, lz, f) => {
      for (let k = 0; k < 7; k++) {
        const a = f - PI / 2 + (k * PI) / 6;
        r.b.box(
          "fabric",
          r.X(lx + Math.sin(a) * 1.0),
          0,
          r.Z(lz + Math.cos(a) * 1.0),
          0.55,
          0.45,
          0.5,
          { yaw: a, tint: 0xa01a5a },
        );
        r.b.box(
          "fabric",
          r.X(lx + Math.sin(a) * 1.25),
          0.45,
          r.Z(lz + Math.cos(a) * 1.25),
          0.6,
          0.55,
          0.15,
          { yaw: a, tint: 0x8a1450 },
        );
      }
      r.b.cyl("chrome", r.X(lx), 0, r.Z(lz), 0.05, 0.05, 0.72, 6, {});
      r.b.cyl("black_metal", r.X(lx), 0.72, r.Z(lz), 0.5, 0.5, 0.04, 14, {});
      r.b.cyl("lit_warm", r.X(lx), 0.76, r.Z(lz), 0.05, 0.05, 0.1, 6, {
        tint: 0xff80c0,
      });
      r.g.add(r.X(lx), 0.95, r.Z(lz), 0xff80c0, "s");
      r.sp.add(r.X(lx), r.Z(lz), 0xff70c0, 1.8, { y: 0.03, i: 0.45 });
      r.col(lx - 0.55, 0, lz - 0.55, lx + 0.55, 0.75, lz + 0.55);
    };
    booth(-5.2, 1.0, -PI / 2);
    booth(-5.2, 4.2, -PI / 2);
    booth(0.5, -3.8, 0);
    A("club_patron_1", -4.3, 1.0, -PI / 2);
    A("club_patron_2", -4.3, 4.2, -PI / 2);
    A("club_patron_3", 0.5, -2.9, 0);
    A("club_patron_4", 4.1, 0.2, -PI / 2);
    r.b.beam(
      "black_metal",
      r.X(0.5),
      4.5,
      r.Z(1.0),
      r.X(0.5),
      3.6,
      r.Z(1.0),
      0.015,
    );
    r.b.geo("chrome", T.sphere, { x: r.X(0.5), y: 3.3, z: r.Z(1.0), s: 0.32 });
    const rr = K.rng(2121);
    for (let k = 0; k < 14; k++)
      r.g.add(
        r.X(0.5 + (rr() - 0.5) * 12),
        0.4 + rr() * 3.6,
        r.Z(1.0 + (rr() - 0.5) * 10),
        [0xffffff, 0xffa0e0, 0xa0c0ff][k % 3],
        "s",
      );
    for (const sd of [-1, 1]) {
      r.b.beam(
        "lit_warm",
        r.X(-6.8),
        4.3,
        r.Z(sd * 5.8),
        r.X(6.8),
        4.3,
        r.Z(sd * 5.8),
        0.04,
        { tint: 0xff6ad0 },
      );
      r.g.add(r.X(-3), 4.25, r.Z(sd * 5.6), 0xff6ad0, "m");
      r.g.add(r.X(3), 4.25, r.Z(sd * 5.6), 0xff6ad0, "m");
    }
    r.bx("nx_velvet", -1.4, 0, 5.8, -0.8, 3.2, 5.95, {});
    r.bx("nx_velvet", 0.8, 0, 5.8, 1.4, 3.2, 5.95, {});
    r.fix.push([r.X(-1), 3.6, r.Z(0), 0xff90d8, { intensity: 1.3, range: 11 }]);
    r.fix.push([
      r.X(-4.2),
      3.4,
      r.Z(-3.2),
      0xfff0f8,
      { intensity: 1.2, range: 6 },
    ]);
    finish(r);
    return r;
  }

  function speakeasy(rec, O) {
    // the street gate opens onto the top of a subway stair: a 3.8 m stair hall (landing 3 m up, 15 steps down east),
    // then through the tiled wall onto the old platform where the bar is
    const r = Room("speak", O.x - 25, O.z + 70, 16, 7, 3.6, {
      doorAt: -5.5,
      grime: 0.45,
      zExt: 3.8,
      entryY: 3.0,
      entryYaw: -PI / 2,
    });
    shell(r, {
      floor: "nx_concrete",
      floorTint: 0x6a6a60,
      wall: "nx_tile",
      wallTint: 0xe8dcc0,
      dado: "nx_tile",
      dadoTint: 0x8a3a2a,
      dadoH: 1.0,
      rail: false,
      trim: "wood_dark",
      ceil: "nx_tin",
      ceilTint: 0x4a4038,
      doorLeaf: "metal_dark",
      split: { z: r.Z(3.5), h2: 6.4 },
    });
    {
      const LY = r.entryY,
        WZ = 3.5,
        wz1 = 3.7,
        z1 = 7.3;
      // the tiled wall between the stair hall and the platform (opening at x 3.8..8 at the stair foot)
      r.bx("nx_tile", -8, 0, WZ, 3.8, 3.6, wz1, { tint: 0xe8dcc0 });
      r.col(-8, 0, WZ, 3.8, 3.6, wz1);
      r.bx("nx_tile", -8, 0, wz1, 3.8, 1.0, wz1 + 0.01, {
        tint: 0x8a3a2a,
        faces: "s",
      });
      r.bx("wood_dark", 3.8, 0, WZ - 0.05, 4.05, 3.6, wz1 + 0.05, {}); // opening jamb
      r.bx("paint_red", -8, 2.3, wz1, 3.8, 2.45, wz1 + 0.03, {
        tint: 0x6a1a18,
      });
      // the entrance landing (tiled masonry block) and the stair (bottom at x 3.8, rising west to the landing)
      r.bx("nx_tile", -8, 0, wz1, -4.2, LY, z1, { tint: 0xd8ccb0 });
      r.col(-8, 0, wz1, -4.2, LY, z1, { surface: "concrete" });
      r.bx("concrete", -8, LY - 0.02, wz1, -4.2, LY + 0.01, z1, {
        tint: 0x8a8578,
        grime: 0.6,
      });
      r.b.stairs(
        "concrete",
        r.X(3.8),
        r.Z((wz1 + z1) / 2),
        -1,
        0,
        z1 - wz1,
        8.0,
        0,
        LY,
        15,
        { tint: 0x9a9488, grime: 0.6, solid: true },
      );
      for (let k = 0; k < 15; k++) {
        const xf = 3.8 - (k * 8.0) / 15,
          top = (LY * (k + 1)) / 15;
        r.bx(
          "brass",
          xf - 0.07,
          top - 0.03,
          wz1 + 0.05,
          xf + 0.005,
          top + 0.006,
          z1 - 0.05,
          { grime: 0.7 },
        );
      } // brass nosings on each tread's front edge
      // brass handrails on both walls, following the flight
      for (const hz of [wz1 + 0.08, z1 - 0.08]) {
        r.b.beam(
          "brass",
          r.X(3.9),
          0.95,
          r.Z(hz),
          r.X(-4.2),
          LY + 0.95,
          r.Z(hz),
          0.03,
        );
        r.b.beam(
          "brass",
          r.X(-4.2),
          LY + 0.95,
          r.Z(hz),
          r.X(-7.8),
          LY + 0.95,
          r.Z(hz),
          0.03,
        );
      }
      // mosaics + the old token sign + an arrow down to the trains
      for (const lx of [-6, -1, 4])
        poster(
          r,
          "q_mosaic",
          r.X(lx),
          lx < -4 ? LY + 1.9 : 2.2 + (((3.8 - lx) * LY) / 8.0) * 0.9,
          r.Z(z1 - 0.02),
          0.55,
          0.55,
          PI,
        );
      board(r, "b_speak", r.X(-1.2), 2.3, r.Z(3.45), 2.6, 0.45, PI);
      board(r, "b_trains", r.X(-2.0), LY + 1.6, r.Z(wz1 + 0.02), 2.4, 0.42, 0);
      for (const lx of [-6.1, -1.0, 4.5])
        lamp(r, r.X(lx), r.Z(5.5), {
          kind: "cage",
          y: 5.9,
          ceil: 6.4,
          col: 0xffc080,
          pool: 3.0,
          i: 0.4,
          fy: lx < -4 ? LY : lx > 3.8 ? 0 : (LY * (3.8 - lx)) / 8.0,
        });
      // litter on the treads, a dead commuter, graffiti-marked turnstile stub at the foot
      const rr = K.rng(9707);
      for (let k = 0; k < 14; k++) {
        const x = -3.8 + rr() * 7.4,
          y = Math.max(0, (LY * (3.8 - x)) / 8.0);
        r.b.box(
          "paint_white",
          r.X(x),
          y + 0.01,
          r.Z(wz1 + 0.3 + rr() * 2.8),
          0.2,
          0.004,
          0.14,
          { yaw: rr() * 3, tint: 0xd8ccb0 },
        );
      }
      P.skeleton && P.skeleton(r.b, r.X(5.6), 0.02, r.Z(6.4), 1.9);
    }
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    r.bx("paint_red", -8, 2.3, -3.49, 8, 2.45, -3.46, { tint: 0x6a1a18 });
    for (const lx of [-6, 0, 6])
      poster(r, "q_mosaic", r.X(lx), 2.85, r.Z(-3.47), 0.55, 0.55, 0);
    // the bar: the old token booth (glass windows) with a counter run out of it; bottles; the bartender
    r.bx("wood_dark", 4.0, 0, -1.9, 7.9, 1.0, -1.4, { tint: 0x5a3a20 });
    r.bx("wood", 3.9, 1.0, -1.95, 7.95, 1.06, -1.35, {});
    r.col(4.0, 0, -1.9, 7.9, 1.06, -1.4, { surface: "wood" });
    r.bx("wood_dark", 5.4, 1.06, -3.45, 7.95, 2.6, -3.35, { tint: 0x3a2a18 });
    for (let i = 0; i < 2; i++) {
      r.bx("wood", 5.5, 1.5 + i * 0.5, -3.45, 7.8, 1.53 + i * 0.5, -3.25, {});
      for (let k = 0; k < 9; k++)
        r.b.cyl(
          "lit_warm",
          r.X(5.6 + k * 0.25),
          1.53 + i * 0.5,
          r.Z(-3.35),
          0.035,
          0.03,
          0.24,
          6,
          { tint: [0x8a5a1a, 0x3a6a2a, 0xb06a1a][k % 3] },
        );
    }
    r.bx("brass", 3.9, 0, -1.95, 4.0, 2.4, -1.85, {});
    r.bx("wood_dark", 3.9, 0, -3.5, 4.0, 1.0, -1.95, { tint: 0x5a3a20 });
    r.b.panel("glass", r.X(3.88), 1.75, r.Z(-2.7), 1.4, 1.3, -PI / 2, {});
    r.col(3.9, 0, -3.5, 4.0, 2.4, -1.85);
    neonSign(r, "x_bar", r.X(6.6), 3.0, r.Z(-3.45), 1.2, 0, 0x6ac8ff);
    A("speakeasy_bar", 6.2, -2.6, PI);
    note("lma_neon_note_matchbook", r.X(4.4), 1.07, r.Z(-1.65), {
      name: "Matchbook: The 42",
      title: 'Matchbook — "The 42"',
      value: 1,
      text: "A matchbook from 'THE 42 — Downstairs, Where the Trains Don't Run'. Three matches left.\n\nInside the flap, in lipstick: 'Knock twice, wait, knock once. Tell Lou that Whisper sent you. Do NOT order the Blast Radius.'",
    });
    note("lma_neon_note_napkin", r.X(-1.3), 0.775, r.Z(0.65), {
      name: "Bar Napkin",
      title: "Bar Napkin (gin-stained)",
      value: 0,
      text: "Pencil on a gin-stained napkin, in two different hands:\n\n'Goldie says the Pawn Palace safe is 7-0-4-1. She said it OUT LOUD. After the fourth gin.'\n\n'She'll change it tomorrow.'\n\n'She said that last month.'",
    });
    K.learnFromItem("lma_neon_note_napkin", "lma_neon_pawn_safe");
    STORY.push({
      kind: "radio",
      id: "neon_speak_radio",
      x: r.X(7.4),
      y: 1.06,
      z: r.Z(-1.75),
      yaw: PI,
    });
    A("speakeasy_bartender", 6.2, -2.6, PI);
    for (let k = 0; k < 3; k++) {
      r.b.cyl(
        "chrome",
        r.X(4.8 + k * 1.0),
        0,
        r.Z(-0.9),
        0.04,
        0.04,
        0.72,
        6,
        {},
      );
      r.b.cyl(
        "fabric",
        r.X(4.8 + k * 1.0),
        0.72,
        r.Z(-0.9),
        0.19,
        0.19,
        0.07,
        10,
        { tint: 0x6a1a18 },
      );
    }
    // card tables with lanterns, a turnstile row at the dead end, the "secret door"
    for (const t of [
      [-1.5, 0.5],
      [1.8, 1.2],
      [-3.8, -1.6],
    ]) {
      P.table(r.b, r.X(t[0]), 0, r.Z(t[1]), 0.3, { w: 1.0, d: 1.0 });
      P.chair(r.b, r.X(t[0] - 0.8), 0, r.Z(t[1]), PI / 2);
      P.chair(r.b, r.X(t[0] + 0.8), 0, r.Z(t[1]), -PI / 2);
      r.b.cyl("lit_warm", r.X(t[0]), 0.77, r.Z(t[1]), 0.06, 0.05, 0.16, 6, {
        tint: 0xffa040,
      });
      r.g.add(r.X(t[0]), 0.95, r.Z(t[1]), 0xffa040, "s");
      r.sp.add(r.X(t[0]), r.Z(t[1]), 0xffa050, 1.9, { y: 0.03, i: 0.5 });
      for (let k = 0; k < 4; k++)
        r.b.box(
          "paint_white",
          r.X(t[0] - 0.2 + k * 0.12),
          0.77,
          r.Z(t[1] + 0.1),
          0.06,
          0.004,
          0.09,
          { yaw: k * 0.5 },
        );
      r.col(t[0] - 0.5, 0, t[1] - 0.5, t[0] + 0.5, 0.78, t[1] + 0.5);
    }
    A("speakeasy_patron_1", -0.7, 0.5, PI / 2);
    A("speakeasy_patron_2", 1.0, 1.2, -PI / 2);
    A("speakeasy_patron_3", 5.8, -0.9, 0);
    for (let k = 0; k < 4; k++) {
      const lz = -2.6 + k * 1.4;
      r.bx("steel", -7.9, 0, lz - 0.1, -7.1, 0.95, lz + 0.1, {});
      for (let a = 0; a < 3; a++)
        r.b.beam(
          "chrome",
          r.X(-7.1),
          0.85,
          r.Z(lz),
          r.X(-6.6),
          0.85 + Math.sin(a * 2.1) * 0.3,
          r.Z(lz + Math.cos(a * 2.1) * 0.3),
          0.03,
        );
    }
    r.col(-7.9, 0, -3.5, -6.6, 1.0, 3.5);
    r.bx("nx_tile", -3.2, 0, -3.5, -2.0, 2.4, -3.38, { tint: 0xd8ccb0 });
    r.bx("black_metal", -2.02, 0, -3.5, -1.94, 2.4, -3.4, { tint: 0x050505 });
    for (const lx of [-5, -1, 3, 6.5])
      lamp(r, r.X(lx), r.Z(0), {
        kind: "cage",
        y: 3.0,
        col: 0xffc080,
        pool: 3.0,
        i: 0.4,
      });
    r.fix.push([
      r.X(5.5),
      2.8,
      r.Z(-2.0),
      0xffc890,
      { intensity: 1.1, range: 8 },
    ]);
    finish(r);
    return r;
  }

  // ------------------------------------------------------------------
  // Build + doors + visibility
  // ------------------------------------------------------------------
  K.defineInterior("times_square:neon_cell", function (ctx) {
    const rec = ctx.rec;
    P = ctx.P || K.parts;
    const E = K.neonEntrances;
    if (!E || !G.LAYOUT.INTERIORS || !G.LAYOUT.INTERIORS.neon_interiors) return;
    const O = G.LAYOUT.INTERIORS.neon_interiors.origin;
    K.tsxInit();
    materials();
    paints();
    CELL = new THREE.Group();
    CELL.name = "lma_neon_interiors";
    CELL.visible = false;
    G.scene.add(CELL);
    rec.interiorRoot = CELL;
    rec.interiorKey = "neon_interiors";
    const build = (fn, name) => {
      try {
        return fn(rec, O);
      } catch (e) {
        G.reportError("init:landmarks_a/neon_" + name, e);
        return null;
      }
    };
    const R = {
      clinic: build(clinic, "clinic"),
      gallery: build(gallery, "gallery"),
      robo: build(robo, "robo"),
      pawn: build(pawn, "pawn"),
      opry: build(opry, "opry"),
      oracle: build(oracle, "oracle"),
      mayor: build(mayor, "mayor"),
      power: build(power, "power"),
      depot: build(depot, "depot"),
      bunk: build(bunk, "bunk"),
      barracks: build(barracks, "barracks"),
      club: build(club, "club"),
      speak: build(speakeasy, "speak"),
    };
    const lab = {
      clinic: "Doc Broadway's Clinic",
      gallery: "Ammo Annie's Shooting Gallery",
      robo: "Radio Repair & Robo-Shop",
      pawn: "The Pawn Palace",
      opry: "The Neon Opry",
      oracle: "The Ticker Oracle",
      mayor: "Mayor's Office",
      power: "Neon Power Plant",
      depot: "Neon Freight Depot",
      bunk: "The Bunkhouse Hotel",
      barracks: "Neon Guard Barracks",
      club: "The Cinder Club",
      speak: "Subway — 42 St (closed)",
    };
    for (const k in R) {
      const r = R[k];
      if (!r || !E[k]) continue;
      try {
        if (k === "speak")
          doors(rec, r, E[k], lab[k], {
            lock: K.neonSpeakLock,
            exitLabel: "42nd Street",
          });
        else doors(rec, r, E[k], lab[k], {});
      } catch (e) {
        G.reportError("init:landmarks_a/neon_door_" + k, e);
      }
    }
    // club: the street door sits at the club_door anchor; quests gate it (Big Sal) — nothing else to do here
    // the snipers' nest service stairs (street ↔ roof, both in the world)
    try {
      const n = E.nest,
        nx = Math.sin(n.f),
        nz = Math.cos(n.f);
      G.world.addDoor({
        pos: new THREE.Vector3(n.x + nx * 0.35, 1.5, n.z + nz * 0.35),
        radius: 1.2,
        label: "Snipers' Nest (roof)",
        verb: "Climb to",
        target: { x: -66.6, y: 42.05, z: -264.5, yaw: -PI / 2 },
        sound: "door_open",
      });
      G.world.addDoor({
        pos: new THREE.Vector3(-67.5, 43.4, -264.5),
        radius: 1.2,
        label: "Marquee Market",
        verb: "Go down to",
        target: { x: n.x + nx * 1.7, y: 0, z: n.z + nz * 1.7, yaw: AY(n.f) },
        sound: "door_open",
      });
    } catch (e) {
      G.reportError("init:landmarks_a/neon_nest_doors", e);
    }
    // show only the room the camera is in (and nothing from the street)
    const IX = O.x - 150;
    let last = null;
    K.animate(() => {
      const cam = G.camera;
      if (!cam) return;
      const p = cam.getWorldPosition ? cam.getWorldPosition(_v) : cam.position;
      if (p.x < IX || p.x > O.x + 150 || Math.abs(p.z - O.z) > 150) {
        if (CELL.visible) CELL.visible = false;
        last = null;
        return;
      }
      CELL.visible = true;
      let cur = null;
      for (const r of ROOMS)
        if (
          p.x > r.x0 - 3 &&
          p.x < r.x1 + 3 &&
          p.z > r.z0 - 3 &&
          p.z < r.z1 + 3
        ) {
          cur = r;
          break;
        }
      if (cur === last) return;
      last = cur;
      for (const r of ROOMS) r.grp.visible = !cur || r === cur;
    });
    // walk audit routes (99_main.js, shot/smoke only): arrival → somewhere deep in each room; the two stair halls leg by leg
    const deep = {
      clinic: [-4.5, 2.5],
      gallery: [0, 6.6],
      robo: [0, -1.5],
      pawn: [0, 0.8],
      opry: [0, 1.0],
      oracle: [0, 0.1],
      mayor: [1.0, 0.6],
      depot: [0, 0],
      bunk: [0, -4.0],
      barracks: [-2.0, 0.8],
      club: [0, 0.2],
    };
    for (const k in R) {
      const r = R[k];
      if (!r) continue;
      const a = [r.doorX, r.entryY, r.z1 - 1.5];
      if (deep[k])
        K.walkChecks &&
          K.walkChecks.push({
            label: "Neon " + k + ": arrival → room",
            pts: [a, [r.X(deep[k][0]), 0, r.Z(deep[k][1])], a],
          });
    }
    if (R.speak) {
      const r = R.speak;
      K.walkChecks &&
        K.walkChecks.push({
          label: "Neon speak: landing → stair → platform → bar → back up",
          pts: [
            [r.doorX, 3, r.z1 - 1.5],
            [r.X(-4.4), 3, r.Z(5.4)],
            [r.X(4.6), 0, r.Z(5.4)],
            [r.X(5.9), 0, r.Z(2.6)],
            [r.X(5.8), 0, r.Z(-0.4)],
            [r.X(5.9), 0, r.Z(2.6)],
            [r.X(4.6), 0, r.Z(5.4)],
            [r.X(-4.6), 3, r.Z(5.4)],
            [r.doorX, 3, r.z1 - 1.5],
          ],
        });
    }
    if (R.power) {
      const r = R.power;
      K.walkChecks &&
        K.walkChecks.push({
          label:
            "Neon power: landing → stair → generator floor → panel → back up",
          pts: [
            [r.doorX, 3, r.z1 - 1.5],
            [r.X(3.8), 3, r.Z(6.2)],
            [r.X(-3.4), 0, r.Z(6.2)],
            [r.X(-2.0), 0, r.Z(4.7)],
            [r.X(0.5), 0, r.Z(4.7)],
            [r.X(0.5), 0, r.Z(1.0)],
            [r.X(7.0), 0, r.Z(1.6)],
            [r.X(7.4), 0, r.Z(-1.35)],
            [r.X(0.5), 0, r.Z(1.0)],
            [r.X(0.5), 0, r.Z(4.7)],
            [r.X(-2.0), 0, r.Z(4.7)],
            [r.X(-3.4), 0, r.Z(6.2)],
            [r.X(3.8), 3, r.Z(6.2)],
            [r.doorX, 3, r.z1 - 1.5],
          ],
        });
    }
    if (R.barracks) {
      const r = R.barracks;
      K.walkChecks &&
        K.walkChecks.push({
          label: "Neon barracks: into the armory cage",
          pts: [
            [r.doorX, 0, r.z1 - 1.5],
            [r.X(-3.0), 0, r.Z(0.9)],
            [r.X(6.9), 0, r.Z(0.9)],
            [r.X(7.3), 0, r.Z(-0.9)],
            [r.X(7.3), 0, r.Z(-2.2)],
            [r.X(4.6), 0, r.Z(-2.6)],
          ],
        });
    }
    K.neonRooms = R;
    // public room list (sound: per-room ambience; quests / ambient_life: "is the player inside place X")
    const ROOMLIST = Object.keys(R)
      .filter((k) => R[k])
      .map((k) => {
        const r = R[k];
        return {
          key: k,
          name: lab[k],
          x0: r.x0,
          x1: r.x1,
          z0: r.z0,
          z1: r.z1,
          h: Math.max(r.h, r.o.split ? r.o.split.h2 : 0),
          entrance: { x: r.doorX, y: r.entryY, z: r.z1 - 1.5, yaw: r.entryYaw },
        };
      });
    rec.neonRooms = () => ROOMLIST.slice();
    rec.neonRoomAt = (x, z) => {
      for (const q of ROOMLIST)
        if (x >= q.x0 && x <= q.x1 && z >= q.z0 && z <= q.z1) return q.key;
      return null;
    };
  });
  const _v = new THREE.Vector3();
})();
