/* src/poi_midtown/10_waldorf.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 10_waldorf.js
 * THE WALDORF-ASTORIA (1931) — Park Avenue, 49th–50th.
 * Exterior: limestone base, tan-brick art-deco slab with setbacks and the
 *   famous TWIN TOWERS capped by bronze/copper lanterns and spires; the Park
 *   Avenue portal with bronze doors, gold lettering and the "Spirit of
 *   Achievement" figure; Continuity banners, sandbags, antenna farm on the crown.
 * Interior (INTERIORS.waldorf, origin 5400,0,0):
 *   Park Avenue foyer → steps → MAIN LOBBY (World's Fair clock, Wheel of Life
 *   mosaic, black-marble columns, reception, brass elevators) → PEACOCK ALLEY
 *   (bar, booths, peacock murals) → GRAND BALLROOM (two tiers of balconies,
 *   stage with a Continuity rally set, the last gala's skeletons) → balcony
 *   "Towers Staircase" → PRESIDENTIAL SUITE, 35th floor: Continuity forward
 *   command (war table, radio room, exo-rig armory, the Major's study)
 *   → service elevator shortcut down to the KITCHEN (loop back to the lobby).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.PMID) return;
  const K = G.PMID.kit,
    F = K.f,
    T = K.T;
  const PI = Math.PI,
    HP = PI / 2;

  // ------------------------------------------------------------------
  // Art (atlas slots)
  // ------------------------------------------------------------------
  function art() {
    K.facade("wa_brick", {
      bays: 4,
      floors: 6,
      bayW: 3.2,
      floorH: 3.4,
      wall: "#bba58a",
      brick: true,
      seed: 31,
      win: { x0: 0.3, x1: 0.7, y0: 0.18, y1: 0.86 },
      frame: "#3c3a34",
      glass: "#2a3434",
      broken: 0.3,
      boarded: 0.06,
      lit: 0.0,
      mullions: 1,
      pierShade: 0.16,
      sill: "#d8ccb0",
    });
    K.facade("wa_stone", {
      bays: 4,
      floors: 2,
      bayW: 3.5,
      floorH: 4.2,
      wall: "#d4ccb8",
      seed: 32,
      blocks: true,
      win: { x0: 0.22, x1: 0.78, y0: 0.12, y1: 0.9 },
      frame: "#4a3a24",
      glass: "#1e2a28",
      broken: 0.45,
      boarded: 0.2,
      mullions: 2,
      sill: "#e8e0cc",
      lintel: true,
    });
    K.paint("wa_title", 1400, 160, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      K.fitText(
        x,
        "THE  WALDORF-ASTORIA",
        w / 2,
        h / 2 + 6,
        w - 40,
        120,
        "bold ",
        "#e2b64e",
        "#4a3208",
        5,
      );
    });
    K.paint("wa_title_small", 900, 120, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      K.fitText(
        x,
        "WALDORF-ASTORIA",
        w / 2,
        h / 2 + 4,
        w - 30,
        90,
        "bold ",
        "#d8a840",
        "#3a2606",
        4,
      );
    });
    // Continuity banner (original emblem: stars in a ring over a stylised eagle chevron)
    K.flag("wa_continuity", 256, 500, (x, w, h) => {
      x.fillStyle = "#16181c";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#e8e4d8";
      x.fillRect(10, 10, w - 20, 6);
      x.fillRect(10, h - 16, w - 20, 6);
      const cx = w / 2,
        cy = h * 0.38;
      for (let i = 0; i < 13; i++) {
        const a = -PI / 2 + (i / 13) * PI * 2;
        K.star(
          x,
          cx + Math.cos(a) * 78,
          cy + Math.sin(a) * 78,
          11,
          4.5,
          "#e8e4d8",
        );
      }
      x.fillStyle = "#b8b4a8";
      x.beginPath();
      x.moveTo(cx, cy - 40);
      x.lineTo(cx + 46, cy + 30);
      x.lineTo(cx + 18, cy + 30);
      x.lineTo(cx, cy + 4);
      x.lineTo(cx - 18, cy + 30);
      x.lineTo(cx - 46, cy + 30);
      x.closePath();
      x.fill();
      x.fillStyle = "#e8e4d8";
      x.font = "bold 40px " + K.SANS;
      x.textAlign = "center";
      x.fillText("CONTINUITY", cx, h * 0.72);
      x.font = "bold 18px " + K.SANS;
      x.fillText("ORDER · STRENGTH · AMERICA", cx, h * 0.8);
      K.grain(x, w, h, 14, 5);
      x.clearRect(0, h - 4, w, 4);
    });
    // Clock dial (World's Fair clock, cream enamel + gold numerals)
    K.litPaint("wa_dial", 256, 256, (x, w) => {
      const c = w / 2;
      x.fillStyle = "#3a2a10";
      x.fillRect(0, 0, w, w);
      const g = x.createRadialGradient(c, c, 10, c, c, c);
      g.addColorStop(0, "#f4ecd0");
      g.addColorStop(1, "#c8b890");
      x.fillStyle = g;
      x.beginPath();
      x.arc(c, c, c - 8, 0, 7);
      x.fill();
      x.strokeStyle = "#b08830";
      x.lineWidth = 8;
      x.stroke();
      x.fillStyle = "#5a3a10";
      x.font = "bold 26px " + K.FONT;
      x.textAlign = "center";
      x.textBaseline = "middle";
      const R = [
        "XII",
        "I",
        "II",
        "III",
        "IIII",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
      ];
      for (let i = 0; i < 12; i++) {
        const a = -PI / 2 + (i / 12) * PI * 2;
        x.save();
        x.translate(c + Math.cos(a) * (c - 36), c + Math.sin(a) * (c - 36));
        x.rotate(a + HP);
        x.fillText(R[i], 0, 0);
        x.restore();
      }
      x.strokeStyle = "#2a1a08";
      x.lineCap = "round";
      x.lineWidth = 9;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-PI / 2 + (9.7 / 12) * PI * 2) * 60,
        c + Math.sin(-PI / 2 + (9.7 / 12) * PI * 2) * 60,
      );
      x.stroke(); // 9:47 (the bombs)
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-PI / 2 + (47 / 60) * PI * 2) * 92,
        c + Math.sin(-PI / 2 + (47 / 60) * PI * 2) * 92,
      );
      x.stroke();
      x.fillStyle = "#b08830";
      x.beginPath();
      x.arc(c, c, 9, 0, 7);
      x.fill();
      K.stains(x, w, w, 4, 8, 0.25);
    });
    // Clock base plaque (bronze relief medallion — an original "portrait" silhouette)
    K.paint("wa_plaque", 256, 320, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#8a6030");
      g.addColorStop(0.5, "#c89a50");
      g.addColorStop(1, "#6a4420");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#3a2410";
      x.lineWidth = 10;
      x.strokeRect(10, 10, w - 20, h - 20);
      x.fillStyle = "#5a3818";
      x.beginPath();
      x.ellipse(w / 2, h * 0.42, 70, 86, 0, 0, 7);
      x.fill();
      x.fillStyle = "#d8b068";
      x.beginPath();
      x.ellipse(w / 2 + 6, h * 0.36, 30, 36, 0, 0, 7);
      x.fill();
      x.fillRect(w / 2 - 34, h * 0.48, 80, 40);
      x.fillStyle = "#3a2410";
      x.font = "bold 22px " + K.FONT;
      x.textAlign = "center";
      x.fillText("MCMXXXIX", w / 2, h * 0.84);
      K.grain(x, w, h, 20, 9);
    });
    // "Wheel of Life" floor mosaic (original radial design)
    K.paint("wa_mosaic", 1024, 1024, (x, w) => {
      const c = w / 2;
      x.fillStyle = "#d8ceb4";
      x.fillRect(0, 0, w, w);
      const ring = (r0, r1, n, cols) => {
        for (let i = 0; i < n; i++) {
          const a0 = (i / n) * PI * 2,
            a1 = ((i + 1) / n) * PI * 2;
          x.fillStyle = cols[i % cols.length];
          x.beginPath();
          x.arc(c, c, r1, a0, a1);
          x.arc(c, c, r0, a1, a0, true);
          x.closePath();
          x.fill();
        }
      };
      ring(440, 505, 64, ["#1e3a34", "#c8a048"]);
      ring(360, 440, 12, ["#6a2a1e", "#e0d4b0", "#2a4a5a", "#e0d4b0"]);
      ring(250, 360, 24, ["#d8c890", "#b89858", "#8a6a3a"]);
      ring(120, 250, 8, ["#1e3a34", "#6a2a1e"]);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * PI * 2 + PI / 8;
        x.save();
        x.translate(c + Math.cos(a) * 185, c + Math.sin(a) * 185);
        x.rotate(a + HP);
        x.fillStyle = "#e8d8a8";
        x.beginPath();
        x.moveTo(0, -46);
        x.lineTo(22, 20);
        x.lineTo(-22, 20);
        x.closePath();
        x.fill();
        x.restore();
      }
      K.star(x, c, c, 118, 48, "#c8a048");
      K.star(x, c, c, 60, 26, "#6a2a1e");
      x.strokeStyle = "rgba(30,20,10,0.25)";
      x.lineWidth = 1;
      for (let i = 0; i < w; i += 9) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i, w);
        x.stroke();
        x.beginPath();
        x.moveTo(0, i);
        x.lineTo(w, i);
        x.stroke();
      }
      K.stains(x, w, w, 14, 11, 0.35);
      K.grain(x, w, w, 18, 12);
      // a scorched crack across the wheel
      x.strokeStyle = "rgba(20,14,8,0.8)";
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(90, 300);
      x.lineTo(380, 520);
      x.lineTo(520, 480);
      x.lineTo(900, 760);
      x.stroke();
    });
    // Peacock mural panel (Peacock Alley)
    K.paint("wa_peacock", 512, 768, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#1e3a3a");
      g.addColorStop(1, "#0e2224");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#c8a048";
      x.lineWidth = 10;
      x.strokeRect(12, 12, w - 24, h - 24);
      const cx = w / 2,
        cy = h * 0.46;
      for (let i = 0; i < 17; i++) {
        const a = -PI * 0.95 + (i / 16) * PI * 0.9;
        const ex = cx + Math.cos(a) * 210,
          ey = cy + Math.sin(a) * 250;
        x.strokeStyle = "#3a8a6a";
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(cx, cy + 120);
        x.quadraticCurveTo((cx + ex) / 2, (cy + ey) / 2 + 30, ex, ey);
        x.stroke();
        x.fillStyle = "#2a7a8a";
        x.beginPath();
        x.ellipse(ex, ey, 20, 26, a + HP, 0, 7);
        x.fill();
        x.fillStyle = "#d8b050";
        x.beginPath();
        x.ellipse(ex, ey, 10, 13, a + HP, 0, 7);
        x.fill();
        x.fillStyle = "#1a2a6a";
        x.beginPath();
        x.arc(ex, ey, 5, 0, 7);
        x.fill();
      }
      x.fillStyle = "#2a5aa0";
      x.beginPath();
      x.ellipse(cx, cy + 150, 34, 70, 0, 0, 7);
      x.fill();
      x.beginPath();
      x.ellipse(cx + 6, cy + 70, 14, 20, 0.3, 0, 7);
      x.fill();
      x.fillStyle = "#d8b050";
      x.beginPath();
      x.moveTo(cx + 18, cy + 66);
      x.lineTo(cx + 34, cy + 72);
      x.lineTo(cx + 18, cy + 76);
      x.fill();
      K.weather(x, w, h, 13, 1.1);
    });
    // Deco elevator doors (brass sunburst)
    K.paint("wa_elev", 256, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "#7a5a28");
      g.addColorStop(0.5, "#d8b060");
      g.addColorStop(1, "#7a5a28");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.save();
      x.translate(w / 2, h * 0.3);
      for (let i = 0; i < 18; i++) {
        const a = PI + (i / 17) * PI;
        x.strokeStyle = i % 2 ? "#fff0c0" : "#5a3a10";
        x.lineWidth = 5;
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(Math.cos(a) * 140, -Math.sin(a) * 140);
        x.stroke();
      }
      x.restore();
      x.fillStyle = "#3a2408";
      x.fillRect(w / 2 - 3, 0, 6, h);
      for (let y = h * 0.5; y < h - 20; y += 40) {
        x.strokeStyle = "#5a3a10";
        x.lineWidth = 3;
        x.strokeRect(24, y, w / 2 - 36, 30);
        x.strokeRect(w / 2 + 12, y, w / 2 - 36, 30);
      }
      K.weather(x, w, h, 17, 0.8);
    });
    // Continuity war table: tactical map of Manhattan (original)
    K.paint("wa_warmap", 768, 512, (x, w, h) => {
      x.fillStyle = "#20302a";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "rgba(120,200,150,0.25)";
      x.lineWidth = 1;
      for (let i = 0; i < w; i += 32) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i, h);
        x.stroke();
      }
      for (let i = 0; i < h; i += 32) {
        x.beginPath();
        x.moveTo(0, i);
        x.lineTo(w, i);
        x.stroke();
      }
      x.fillStyle = "#6a7a5a";
      x.beginPath();
      x.moveTo(90, 30);
      x.lineTo(210, 20);
      x.lineTo(560, 210);
      x.lineTo(700, 330);
      x.lineTo(720, 380);
      x.lineTo(640, 470);
      x.lineTo(560, 480);
      x.lineTo(500, 420);
      x.lineTo(200, 200);
      x.lineTo(80, 90);
      x.closePath();
      x.fill();
      x.fillStyle = "#4a6a3a";
      x.fillRect(150, 70, 110, 40);
      const pin = (px, py, col, t) => {
        x.fillStyle = col;
        x.beginPath();
        x.arc(px, py, 9, 0, 7);
        x.fill();
        x.fillStyle = "#e8e4d8";
        x.font = "bold 15px " + K.SANS;
        x.fillText(t, px + 12, py + 5);
      };
      pin(330, 160, "#d02a20", "BoS — ROCKEFELLER");
      pin(390, 170, "#e8e4d8", "WALDORF (FWD CMD)");
      pin(430, 190, "#e8e4d8", "UN PLAZA");
      pin(250, 130, "#d0a020", "RADIO CITY — JAM");
      pin(360, 260, "#d02a20", "MUTANTS — ESB");
      pin(640, 440, "#e8e4d8", "LIBERTY");
      pin(300, 330, "#d0a020", "BELLEVUE — K-agent?");
      x.strokeStyle = "#d0a020";
      x.lineWidth = 3;
      x.setLineDash([8, 6]);
      x.beginPath();
      x.moveTo(390, 170);
      x.lineTo(300, 330);
      x.stroke();
      x.setLineDash([]);
      x.fillStyle = "#e8e4d8";
      x.font = "bold 22px " + K.SANS;
      x.fillText("OPERATION PARK AVENUE — EYES ONLY", 24, h - 24);
      K.grain(x, w, h, 16, 21);
    });
    // Presidential seal rug (original: eagle-less star seal, "SEAL OF THE PRESIDENT OF THE WALDORF")
    K.paint("wa_seal", 512, 512, (x, w) => {
      const c = w / 2;
      x.fillStyle = "#1e2a4a";
      x.fillRect(0, 0, w, w);
      x.fillStyle = "#c8a048";
      x.beginPath();
      x.arc(c, c, c - 20, 0, 7);
      x.fill();
      x.fillStyle = "#1e2a4a";
      x.beginPath();
      x.arc(c, c, c - 34, 0, 7);
      x.fill();
      for (let i = 0; i < 50; i++) {
        const a = (i / 50) * PI * 2;
        K.star(
          x,
          c + Math.cos(a) * (c - 62),
          c + Math.sin(a) * (c - 62),
          8,
          3.4,
          "#e8e0c8",
        );
      }
      K.star(x, c, c, 110, 44, "#c8a048");
      x.fillStyle = "#e8e0c8";
      x.font = "bold 20px " + K.FONT;
      x.textAlign = "center";
      x.fillText("SUITE 35-A", c, c + 150);
      K.stains(x, w, w, 8, 23, 0.4);
      K.grain(x, w, w, 20, 24);
    });
    // Radio rack faceplates (self-lit dials and VU meters)
    K.litPaint("wa_radio", 512, 256, (x, w, h) => {
      x.fillStyle = "#20241f";
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) {
        const ox = 20 + i * 122;
        x.fillStyle = "#0a0c0a";
        x.fillRect(ox, 20, 110, 70);
        const g = x.createLinearGradient(ox, 20, ox, 90);
        g.addColorStop(0, "#f0d890");
        g.addColorStop(1, "#a88040");
        x.fillStyle = g;
        x.fillRect(ox + 6, 26, 98, 58);
        x.strokeStyle = "#2a1a08";
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(ox + 55, 84);
        x.lineTo(ox + 30 + i * 14, 36);
        x.stroke();
        for (let k = 0; k < 3; k++) {
          x.fillStyle =
            (i + k) % 3 === 0
              ? "#ff3a2a"
              : (i + k) % 3 === 1
                ? "#3aff6a"
                : "#ffb03a";
          x.beginPath();
          x.arc(ox + 20 + k * 35, 120, 8, 0, 7);
          x.fill();
        }
        x.fillStyle = "#9aa894";
        x.beginPath();
        x.arc(ox + 55, 180, 26, 0, 7);
        x.fill();
        x.fillStyle = "#2a2e28";
        x.beginPath();
        x.arc(ox + 55, 180, 18, 0, 7);
        x.fill();
      }
      x.fillStyle = "#6aff8a";
      x.font = "bold 16px monospace";
      x.fillText("JAM 97.3 MHz  ▮▮▮▮▮▮▮ ACTIVE", 20, h - 14);
    });
    // Skyline panorama for the suite windows (dusk, original silhouette art)
    K.litPaint("wa_skyline", 1024, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#3a4a34");
      g.addColorStop(0.55, "#8a9a6a");
      g.addColorStop(1, "#b8b07a");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      const r = K.rng(77);
      for (let layer = 0; layer < 2; layer++) {
        x.fillStyle = layer ? "#1e241c" : "#4a5440";
        let px = 0;
        while (px < w) {
          const bw = 20 + r() * 50,
            bh = (layer ? 60 : 90) + r() * (layer ? 120 : 80);
          x.fillRect(px, h - bh, bw, bh);
          if (r() < 0.2) x.fillRect(px + bw / 2 - 2, h - bh - 30, 4, 30);
          px += bw + (layer ? 2 : 6);
        }
      }
      // Chrysler-like crown and a broken spire in the distance
      x.fillStyle = "#1e241c";
      x.beginPath();
      x.moveTo(600, 70);
      x.lineTo(612, 20);
      x.lineTo(624, 70);
      x.fill();
      x.fillStyle = "rgba(255,220,140,0.6)";
      for (let i = 0; i < 60; i++) x.fillRect(r() * w, h - r() * 120, 2, 3);
    });
  }

  // ------------------------------------------------------------------
  // EXTERIOR
  // ------------------------------------------------------------------
  function buildExterior(rec) {
    const s = K.site("waldorf");
    const b = K.builder("waldorf_ext", { grime: 0.55 });
    const glows = K.glowSet("waldorf_ext");
    const X0 = s.x0,
      X1 = s.x1,
      Z0 = s.z0,
      Z1 = s.z1; // 210..270, -359..-326
    const cz = (Z0 + Z1) / 2;
    // --- podium: limestone base 0..8.4, brick 8.4..24 ---
    K.block(b, "wa_stone", X0, Z0, X1, Z1, 0, 8.4, { roof: false, col: false });
    K.block(b, "wa_brick", X0 + 0.4, Z0 + 0.4, X1 - 0.4, Z1 - 0.4, 8.4, 24, {
      roof: "concrete_dark",
      col: false,
    });
    K.colBox(X0, 0, Z0, X1, 24, Z1, { surface: "concrete" });
    K.band(b, "limestone", X0, Z0, X1, Z1, 8.2, 0.6, 0.35);
    K.band(
      b,
      "limestone",
      X0 + 0.4,
      Z0 + 0.4,
      X1 - 0.4,
      Z1 - 0.4,
      23.4,
      0.8,
      0.3,
    );
    // rusticated plinth
    K.band(b, "granite", X0, Z0, X1, Z1, 0, 1.2, 0.2, { faces: "nsewt" });
    // deco piers on the brick podium — on the bay BOUNDARIES of the window grid (never across a window) —
    // and real 3D window surrounds on the limestone base (hood + keystone) and the brick podium (sill + lintel)
    const portalSkip = (x, z, y, f) =>
      (f === "w" && Math.abs(z - cz) < 8.2 && y < 12) ||
      ((f === "n" || f === "s") && Math.abs(x - 240) < 4 && y < 5);
    K.reveals(b, "wa_stone", X0, Z0, X1, Z1, 0, 8.4, {
      tint: 0xe0d8c4,
      proj: 0.18,
      hood: "cornice",
      keystone: true,
      skip: portalSkip,
    });
    K.reveals(b, "wa_brick", X0 + 0.4, Z0 + 0.4, X1 - 0.4, Z1 - 0.4, 8.4, 24, {
      tint: 0xd8ccb0,
      proj: 0.12,
      maxY: 23.4,
      skip: portalSkip,
      piers: {
        mat: "brick_tan",
        tint: 0xc8b08a,
        w: 0.5,
        d: 0.5,
        y0: 8.8,
        y1: 23.4,
        skip: (x, z, f) => f === "w" && Math.abs(z - cz) < 7,
      },
    });
    // --- slab (setback 1) 24..44 ---
    K.block(b, "wa_brick", X0 + 6, Z0 + 3.5, X1 - 4, Z1 - 3.5, 24, 44, {
      roof: "concrete_dark",
    });
    K.reveals(b, "wa_brick", X0 + 6, Z0 + 3.5, X1 - 4, Z1 - 3.5, 24, 44, {
      tint: 0xd8ccb0,
      proj: 0.1,
      maxY: 43.4,
      jambs: false,
    });
    K.band(b, "limestone", X0 + 6, Z0 + 3.5, X1 - 4, Z1 - 3.5, 43.4, 0.7, 0.25);
    // --- central shaft 44..72 ---
    K.block(b, "wa_brick", X0 + 14, Z0 + 6, X1 - 8, Z1 - 6, 44, 72, {
      roof: "concrete_dark",
    });
    K.band(b, "limestone", X0 + 14, Z0 + 6, X1 - 8, Z1 - 6, 71.3, 0.8, 0.3);
    // vertical deco ribs on the shaft (the Waldorf's strong verticals)
    K.reveals(b, "wa_brick", X0 + 14, Z0 + 6, X1 - 8, Z1 - 6, 44, 72, {
      maxY: 0,
      faces: "nsw",
      piers: {
        mat: "brick_tan",
        tint: 0xd0b890,
        w: 0.55,
        d: 0.6,
        y0: 44,
        y1: 71.4,
      },
    });
    // --- low link block between the towers 72..78 (kept low so the TWIN towers read as two from Park Ave) ---
    K.block(b, "wa_brick", X0 + 20, Z0 + 13.5, X1 - 16, Z1 - 13.5, 72, 78, {
      roof: "concrete_dark",
    });
    K.band(
      b,
      "limestone",
      X0 + 20,
      Z0 + 13.5,
      X1 - 16,
      Z1 - 13.5,
      77.5,
      0.5,
      0.25,
    );
    // --- TWIN TOWERS (north & south): 72..94 shaft with setback, octagonal lantern, copper cap, spire ---
    const towers = [
      [245, Z0 + 9.8],
      [245, Z1 - 9.8],
    ];
    const TY = 94; // top of the square shaft
    for (const tw of towers) {
      const tx = tw[0],
        tz = tw[1];
      K.block(
        b,
        "wa_brick",
        tx - 5.2,
        tz - 3.8,
        tx + 5.2,
        tz + 3.8,
        72,
        TY - 6,
        { roof: "concrete_dark" },
      );
      K.block(
        b,
        "wa_brick",
        tx - 4.2,
        tz - 3.1,
        tx + 4.2,
        tz + 3.1,
        TY - 6,
        TY,
        { roof: "concrete_dark", col: false },
      );
      // chamfered corners (setback piers) and vertical deco ribs
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
          b.box(
            "limestone",
            tx + sx * 4.8,
            72,
            tz + sz * 3.4,
            1.2,
            TY - 6 - 72 + 0.4,
            1.2,
            { tint: 0xd8ccb0 },
          );
          b.box(
            "limestone",
            tx + sx * 3.9,
            TY - 6,
            tz + sz * 2.8,
            1.0,
            6.4,
            1.0,
            { tint: 0xd8ccb0 },
          );
        }
      K.reveals(
        b,
        "wa_brick",
        tx - 5.2,
        tz - 3.8,
        tx + 5.2,
        tz + 3.8,
        72,
        TY - 6,
        {
          maxY: 0,
          faces: "ns",
          piers: {
            mat: "brick_tan",
            tint: 0xd0b890,
            w: 0.45,
            d: 0.3,
            y0: 72,
            y1: TY - 6,
          },
        },
      );
      K.band(
        b,
        "limestone",
        tx - 5.2,
        tz - 3.8,
        tx + 5.2,
        tz + 3.8,
        TY - 6.4,
        0.6,
        0.35,
      );
      K.band(
        b,
        "limestone",
        tx - 4.2,
        tz - 3.1,
        tx + 4.2,
        tz + 3.1,
        TY - 0.4,
        0.7,
        0.35,
      );
      // octagonal stages
      const OY = TY + 0.3;
      b.cyl("limestone", tx, OY, tz, 3.5, 3.25, 3.6, 8, {
        yaw: PI / 8,
        tint: 0xd8ccb0,
      });
      b.cyl("bronze", tx, OY + 3.6, tz, 3.35, 3.35, 0.5, 8, { yaw: PI / 8 });
      // lantern with arched openings: 8 piers + dark core
      b.cyl("black", tx, OY + 4.1, tz, 2.4, 2.4, 5.0, 8, {
        yaw: PI / 8,
        grime: 0,
      });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * PI * 2;
        b.box(
          "limestone",
          tx + Math.cos(a) * 2.75,
          OY + 4.1,
          tz + Math.sin(a) * 2.75,
          0.7,
          5.0,
          0.7,
          { yaw: -a, tint: 0xd0c4a8 },
        );
      }
      b.cyl("bronze", tx, OY + 9.1, tz, 3.2, 3.0, 0.7, 8, { yaw: PI / 8 });
      // copper / bronze cap: stepped octagonal dome + spire (verdigris green)
      b.cyl("copper", tx, OY + 9.8, tz, 2.9, 1.8, 2.6, 8, {
        yaw: PI / 8,
        tint: 0x7aa890,
      });
      b.cyl("copper", tx, OY + 12.4, tz, 1.8, 0.7, 2.6, 8, {
        yaw: PI / 8,
        tint: 0x7aa890,
      });
      b.cyl("bronze", tx, OY + 15.0, tz, 0.8, 0.45, 1.2, 8, { yaw: PI / 8 });
      b.cyl("bronze", tx, OY + 16.2, tz, 0.32, 0.04, 6.5, 6);
      b.geo("gold", T.sphereLo, { x: tx, y: OY + 17.5, z: tz, s: 0.42 });
      glows.add(tx, OY + 22.8, tz, 0xff4030, "s"); // aircraft warning lamp (still on — Continuity power)
      // lit lantern windows (Continuity generators) — faint warm glow inside the lantern
      glows.add(tx, OY + 6.6, tz, 0xffb060, "l");
    }
    // Continuity antenna farm on the upper block roof
    for (let i = 0; i < 5; i++) {
      const ax = X0 + 22 + i * 4.2,
        az = cz + (i % 2 ? 2.5 : -2.5),
        hh = 10 + (i % 3) * 5;
      b.beam("black_metal", ax, 78, az, ax, 78 + hh, az, 0.18);
      for (let k = 1; k < 4; k++)
        b.beam(
          "black_metal",
          ax - 0.9,
          78 + (hh * k) / 4,
          az,
          ax + 0.9,
          78 + (hh * k) / 4,
          az,
          0.06,
        );
      b.cable("black_metal", ax, 78 + hh, az, ax + 3, 78, az + 3, 0.2, 0.03, 4);
      glows.add(ax, 78 + hh + 0.2, az, 0xff3020, "s");
    }
    // radar dish
    b.cyl("black_metal", X0 + 42, 78, cz, 0.3, 0.3, 3, 8);
    b.geo(
      "metal",
      new THREE.SphereGeometry(2.2, 12, 6, 0, PI * 2, 0, PI / 2.6),
      { x: X0 + 42, y: 82.5, z: cz, rx: -1.1, ry: 0.6, tint: 0xd0d4d0 },
    );
    // --- PARK AVENUE PORTAL (west face, x = X0) ---
    const px = X0,
      pz = cz;
    // recessed entrance bay: dark vestibule + limestone frame
    b.box("limestone", px - 0.9, 0, pz, 1.8, 11.2, 15, {
      faces: "nsewt",
      tint: 0xe0d8c4,
    });
    b.box("black", px - 1.82, 0, pz, 0.04, 8.2, 10.4, { faces: "w", grime: 0 });
    for (const sz of [-1, 0, 1]) {
      // bronze doors (three arched bays)
      const dz = pz + sz * 3.5;
      b.box("bronze", px - 1.9, 0, dz, 0.12, 4.2, 2.6, { tint: 0x9a7040 });
      b.box("glass", px - 1.98, 1.1, dz, 0.04, 2.8, 2.1, {
        grime: 0.2,
        faces: "w",
      });
      b.box("bronze", px - 1.99, 4.2, dz, 0.1, 3.4, 2.9, { tint: 0x7a5a30 });
      for (let k = 0; k < 7; k++)
        b.beam(
          "gold",
          px - 2.05,
          4.3,
          dz,
          px - 2.05,
          4.3 + Math.sin((k / 6) * PI) * 3,
          dz + Math.cos((k / 6) * PI) * 1.4,
          0.05,
          { grime: 0.2 },
        );
    }
    // gold lettering above the portal
    const tr = K.paint("wa_title", 1400, 160);
    b.panel("atlas_paint", px - 1.84, 9.3, pz, 13.2, 1.5, -HP, {
      rect: tr,
      grime: 0,
    });
    // Spirit of Achievement figure (stylised bronze): torso, raised arms, wings of drapery
    const fx = px - 1.9,
      fy = 11.2;
    b.box("limestone", fx + 0.3, fy, pz, 1.4, 0.6, 2.2, { tint: 0xd8ccb0 });
    b.geo("bronze", T.cone8, {
      x: fx,
      y: fy + 1.6,
      z: pz,
      sx: 0.55,
      sy: 2.2,
      sz: 0.5,
      rx: PI,
      tint: 0x6a8a70,
    });
    b.geo("bronze", T.sphereLo, {
      x: fx,
      y: fy + 2.9,
      z: pz,
      s: 0.3,
      tint: 0x6a8a70,
    });
    for (const sgn of [-1, 1]) {
      b.beam(
        "bronze",
        fx,
        fy + 2.5,
        pz + sgn * 0.3,
        fx - 0.2,
        fy + 3.9,
        pz + sgn * 0.9,
        0.16,
        { tint: 0x6a8a70 },
      );
      b.quad(
        "bronze",
        [fx + 0.1, fy + 0.4, pz + sgn * 0.3],
        [fx + 0.1, fy + 0.8, pz + sgn * 1.6],
        [fx + 0.1, fy + 3.4, pz + sgn * 1.1],
        [fx + 0.1, fy + 2.6, pz + sgn * 0.35],
        { tint: 0x5a7a60, double: true },
      );
    }
    // marquee canopy over the sidewalk (bent, one support collapsed)
    b.box("bronze", px - 3.6, 4.6, pz, 3.6, 0.45, 12, { tint: 0x5a4a30 });
    b.box("black_metal", px - 3.6, 4.55, pz, 3.5, 0.05, 11.8, { faces: "b" });
    for (let k = -5; k <= 5; k += 2)
      glows.add(px - 3.8, 4.45, pz + k, 0xffc070, "s");
    const ts = K.paint("wa_title_small", 900, 120);
    b.panel("atlas_paint", px - 5.42, 4.85, pz, 8.5, 0.42, -HP, {
      rect: ts,
      grime: 0,
    });
    b.beam("black_metal", px - 5.2, 0, pz + 5.6, px - 5.2, 4.6, pz + 5.6, 0.12);
    b.beam("black_metal", px - 5.2, 0, pz - 5.6, px - 4.4, 3.1, pz - 6.2, 0.12);
    K.colBox(px - 5.35, 0, pz + 5.45, px - 5.05, 4.6, pz + 5.75, {
      surface: "metal",
    });
    // Continuity banners hanging from the podium cornice, flanking the portal
    const fr = K.flag("wa_continuity", 256, 500);
    for (const dz of [-10.5, 10.5, -21, 21]) {
      const z = pz + dz;
      if (z < Z0 + 1 || z > Z1 - 1) continue;
      b.quad(
        "flags",
        [X0 - 0.35, 12.5, z - 1.4],
        [X0 - 0.35, 12.5, z + 1.4],
        [X0 - 0.35, 22.8, z + 1.4],
        [X0 - 0.35, 22.8, z - 1.4],
        { rect: [fr[0], fr[1], fr[2], fr[3]], double: true },
      );
      b.beam(
        "black_metal",
        X0 - 0.4,
        22.9,
        z - 1.6,
        X0 - 0.4,
        22.9,
        z + 1.6,
        0.08,
      );
    }
    for (const dz of [-8, 8]) {
      const z = pz + dz;
      b.quad(
        "flags",
        [X0 + 5.6, 26, z - 1.2],
        [X0 + 5.6, 26, z + 1.2],
        [X0 + 5.6, 34, z + 1.2],
        [X0 + 5.6, 34, z - 1.2],
        { rect: [fr[0], fr[1], fr[2], fr[3]], double: true },
      );
    }
    // Continuity checkpoint: sandbag horseshoe + barrier arm across the Park Avenue sidewalk
    F.sandbags(b, px - 7.5, 0, pz - 7.5, HP, 4, 3);
    F.sandbags(b, px - 7.5, 0, pz + 7.5, HP, 4, 3);
    F.sandbags(b, px - 9.2, 0, pz - 5.2, 0, 3, 3);
    b.box("paint_white", px - 8.2, 1.0, pz + 1, 0.12, 0.12, 6.5, {
      tint: 0xe0dcd0,
      grime: 0.4,
    });
    for (let k = 0; k < 6; k++)
      b.box("paint_red", px - 8.2, 1.0, pz - 1.8 + k * 1.1, 0.13, 0.13, 0.5, {
        grime: 0.3,
      });
    b.box("black_metal", px - 8.2, 0, pz - 2.4, 0.3, 1.1, 0.3);
    // rubble, collapsed north-east podium corner, scorched windows
    F.debris(b, X1 - 4, 0, Z0 + 1, 3.5, 18, {
      mound: true,
      col: true,
      colH: 1.2,
    });
    b.box("brick_tan", X1 - 5, 24, Z0 + 3.5, 5, 1.6, 4, {
      yaw: 0.3,
      tint: 0x9a8a70,
    });
    b.burn(X0, 16, pz + 18, 8, 0.8);
    b.burn(X1, 40, Z0 + 10, 10, 0.7);
    for (const z of [Z0 + 3, Z1 - 3]) F.debris(b, X0 - 1.5, 0, z, 2.2, 8);
    // south & north side entrances (49th / 50th St): boarded
    for (const z of [Z0, Z1]) {
      const sgn = z === Z0 ? -1 : 1;
      b.box("wood_rotten", 240, 0, z + sgn * 0.1, 5, 4, 0.2, {
        tint: 0x7a6248,
      });
      b.box("limestone", 240, 4, z + sgn * 0.3, 6.5, 0.8, 0.6, {
        tint: 0xd8ccb0,
      });
    }
    b.finish(rec.root, { lod: 1400 });
    glows.finish(rec.root, { dayOpacity: 0.3, nightOpacity: 1, flicker: 0.1 });
    // anchors (exterior)
    rec.anchor("entrance", px - 3.5, 0, pz, -HP);
    rec.anchor("checkpoint", px - 8, 0, pz + 3, -HP);
    rec.anchor("roof", 245, 78, cz, 0);
    return {
      doorPos: new THREE.Vector3(px - 2.3, 1.6, pz),
      outside: { x: px - 4.2, y: 0, z: pz, yaw: HP },
    };
  }

  // ------------------------------------------------------------------
  // INTERIOR
  // ------------------------------------------------------------------
  function buildInterior(rec, door) {
    const O = G.LAYOUT.INTERIORS.waldorf.origin;
    const ox = O.x,
      oz = O.z;
    const b = K.builder("waldorf_int", {
      grime: 0.3,
      ambient: 1.1,
      maxLight: 3.0,
      gain: 1.4,
    });
    const glows = K.glowSet("waldorf_int");
    const P = (x, z) => [ox + x, oz + z];
    const YL = 1.5; // lobby level

    // ---- lights (baked) ----
    b.light(ox, YL + 7.2, oz + 21, 26, 0xffc880, 1.5); // lobby chandelier
    for (let i = 0; i < 4; i++)
      b.light(
        ox + Math.sin(i * HP) * 3.2,
        YL + 2.6,
        oz + 21 + Math.cos(i * HP) * 3.2,
        5,
        0xffe8c0,
        0.8,
      ); // clock pools
    for (const sx of [-12, 12])
      for (const z of [9, 33])
        b.light(ox + sx, YL + 3.6, oz + z, 7, 0xffc070, 0.8); // sconces
    b.light(ox, 4, oz + 42, 12, 0xffd8a0, 1.0);
    for (const sx of [-6.5, 6.5])
      b.light(ox + sx, 2.6, oz + 38, 6, 0xffc070, 0.9); // foyer
    b.light(ox, YL + 3.5, oz - 12, 18, 0x80d8c0, 0.8); // peacock alley (teal)
    b.light(ox + 3, YL + 2.5, oz - 4, 8, 0xffb060, 0.8); // bar lamps
    b.light(ox, YL + 9, oz - 45, 30, 0xffc070, 1.4);
    for (const sx of [-13, 13])
      b.light(ox + sx, YL + 7, oz - 40, 12, 0xffb060, 0.6); // ballroom chandelier
    b.light(ox, YL + 4, oz - 56, 14, 0xff4a3a, 1.0); // stage (red rally light)
    b.light(ox + 10, YL + 3, oz - 4, 10, 0xd8e8ff, 0.6); // kitchen fluorescents
    b.light(ox + 10, YL + 3, oz - 19, 7, 0xff6040, 0.5); // service stair emergency

    // =========================== FOYER (Park Ave) ===========================
    K.room(b, {
      x0: ox - 8,
      x1: ox + 8,
      z0: oz + 36,
      z1: oz + 48,
      y: 0,
      h: 5.2,
      floor: "marble_cream",
      wall: "marble_t",
      ceil: "plaster",
      walls: "sew",
      doors: { s: [{ at: 8, w: 3.2, h: 3.6 }] },
      base: "marble_black",
      cornice: "gold",
      floorTint: 0xe8dcc0,
      wallTint: 0xe8dcc8,
    });
    // north side: wide opening onto the stair (walls left & right of the stair)
    K.skin(
      b,
      "marble_t",
      ox - 8,
      oz + 36,
      ox + 8,
      oz + 36,
      0,
      5.2 + YL,
      [ox, oz + 42],
      [{ at: 8, w: 9, h: 5.0 }],
      { tint: 0xe8dcc8 },
    );
    // revolving door (exit) visual
    b.cyl("bronze", ox, 0, oz + 47.6, 1.4, 1.4, 3.2, 16, {
      top: true,
      tint: 0x8a6a3a,
      arc: PI,
      arc0: 0,
    });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * PI * 2 + 0.4;
      b.box(
        "glass",
        ox + Math.cos(a) * 0.65,
        0.05,
        oz + 47.6 - Math.sin(a) * 0.65,
        1.3,
        3,
        0.04,
        { yaw: a, grime: 0.3 },
      );
    }
    b.box("bronze", ox, 3.2, oz + 47.6, 3.2, 0.5, 0.6);
    // stair up to the lobby (4 × 0.375)
    b.stairs("marble_t", ox, oz + 40, 0, -1, 9, 4, 0, YL, 4, {
      tint: 0xe8dcc8,
    });
    for (const sx of [-4.6, 4.6])
      F.railing(b, ox + sx, oz + 40, ox + sx, oz + 36.2, 0.4, {
        mat: "brass",
        h: 1.0,
      });
    // foyer dressing: bronze torchère lamps, a toppled luggage cart, Continuity checkpoint desk
    for (const sx of [-6.5, 6.5]) {
      b.cyl("bronze", ox + sx, 0, oz + 38, 0.12, 0.1, 2.4, 8);
      b.geo("lamp_amber", T.cone8, {
        x: ox + sx,
        y: 2.55,
        z: oz + 38,
        s: 0.35,
        sy: 0.3,
        rx: PI,
        grime: 0,
      });
      glows.add(ox + sx, 2.6, oz + 38, 0xffc070, "m");
    }
    F.desk(b, ox + 5.5, 0, oz + 44, -HP, { mat: "continuity_black", w: 1.8 });
    F.sandbags(b, ox - 5.5, 0, oz + 42, HP * 0.5, 3, 2);
    b.box("brass", ox - 5, 0.1, oz + 45.5, 1.6, 0.06, 0.8, { yaw: 0.4 });
    for (const s of [-0.7, 0.7])
      b.beam(
        "brass",
        ox - 5 + s,
        0.1,
        oz + 45.5,
        ox - 5 + s,
        1.8,
        oz + 45.2,
        0.05,
      );
    b.box("leather_brown", ox - 4.6, 0.16, oz + 45.4, 0.7, 0.45, 0.3, {
      yaw: 0.3,
    });

    // =========================== MAIN LOBBY ===========================
    const LX0 = ox - 15,
      LX1 = ox + 15,
      LZ0 = oz + 6,
      LZ1 = oz + 36,
      LH = 9;
    K.room(b, {
      x0: LX0,
      x1: LX1,
      z0: LZ0,
      z1: LZ1,
      y: YL,
      h: LH,
      floor: "marble_t",
      wall: "marble_rose",
      ceil: "plaster",
      doors: {
        s: [{ at: 15, w: 9, h: 5 }],
        n: [
          { at: 15, w: 6, h: 5, arch: true },
          { at: 25, w: 2.2, h: 2.6 },
        ],
      },
      base: "marble_black",
      cornice: "gold",
      corniceH: 0.6,
      floorTint: 0xf0e8dc,
      wallTint: 0xf4dccc,
      wain: { mat: "marble_black", h: 1.4, tint: 0x6a6a64 },
    });
    // coffered gold ceiling
    K.coffers(b, "gold", LX0, LZ0, LX1, LZ1, YL + LH, 3.75, 0.6, {
      tint: 0xb89048,
      rosette: "gold",
      rosetteTint: 0xd8b060,
    });
    // the Wheel of Life mosaic at the centre
    const mr = K.paint("wa_mosaic", 1024, 1024);
    b.quad(
      "atlas_paint",
      [ox - 5, YL + 0.01, oz + 26],
      [ox + 5, YL + 0.01, oz + 26],
      [ox + 5, YL + 0.01, oz + 16],
      [ox - 5, YL + 0.01, oz + 16],
      { rect: mr, grime: 0.3 },
    );
    // eight black-marble deco columns with nickel capitals
    for (const sx of [-9, 9])
      for (const z of [11, 17, 25, 31])
        F.column(b, ox + sx, YL, oz + z, 0.55, LH, {
          style: "deco",
          mat: "marble_black",
          tint: 0x8a8a84,
          capMat: "nickel",
        });
    // ---- the World's Fair clock (octagonal bronze-and-mahogany base, four dials, Liberty finial) ----
    const cx = ox,
      cz = oz + 21;
    b.cyl("marble_black", cx, YL, cz, 1.35, 1.35, 0.35, 8, {
      yaw: PI / 8,
      tint: 0x6a6a64,
    });
    b.cyl("mahogany", cx, YL + 0.35, cz, 1.05, 1.0, 1.9, 8, {
      yaw: PI / 8,
      tint: 0xc07a50,
    });
    const pr = K.paint("wa_plaque", 256, 320);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2 + PI / 8 + PI / 8;
      const nx = Math.cos(a),
        nz = -Math.sin(a);
      b.panel(
        "atlas_paint",
        cx + nx * 0.93,
        YL + 1.3,
        cz + nz * 0.93,
        0.62,
        0.78,
        Math.atan2(nx, nz),
        { rect: pr, grime: 0.2, off: 0.01 },
      );
    }
    b.cyl("gold", cx, YL + 2.25, cz, 1.15, 0.95, 0.3, 8, {
      yaw: PI / 8,
      tint: 0xd8a860,
    });
    b.cyl("gold", cx, YL + 2.55, cz, 0.7, 0.62, 1.3, 4, {
      yaw: PI / 4,
      tint: 0xc89850,
    });
    const dr = K.litPaint("wa_dial", 256, 256);
    for (let i = 0; i < 4; i++) {
      const a = i * HP;
      b.panel(
        "atlas_lit",
        cx + Math.sin(a) * 0.53,
        YL + 3.2,
        cz + Math.cos(a) * 0.53,
        0.64,
        0.64,
        a,
        { rect: dr, grime: 0 },
      );
      glows.add(
        cx + Math.sin(a) * 0.7,
        YL + 3.2,
        cz + Math.cos(a) * 0.7,
        0xfff0d0,
        "s",
      );
    }
    b.cyl("gold", cx, YL + 3.85, cz, 0.75, 0.2, 0.55, 8, {
      yaw: PI / 8,
      tint: 0xd8a860,
    });
    // Liberty finial (tiny statue)
    b.cyl("verdigris", cx, YL + 4.4, cz, 0.12, 0.09, 0.5, 6);
    b.geo("verdigris", T.sphereLo, { x: cx, y: YL + 4.98, z: cz, s: 0.09 });
    b.beam("verdigris", cx + 0.05, YL + 4.8, cz, cx + 0.1, YL + 5.3, cz, 0.04);
    glows.add(cx + 0.1, YL + 5.33, cz, 0xffc060, "s");
    K.colBox(cx - 1.3, YL, cz - 1.3, cx + 1.3, YL + 4.5, cz + 1.3, {
      surface: "wood",
    });
    // grand chandelier above the clock
    F.chandelier(b, glows, cx, YL + LH - 2.2, cz, 2.6, {
      tiers: 3,
      crystals: true,
      chain: 2.0,
    });
    // reception desk (east) with key-cubby wall
    b.box("mahogany", ox + 11.5, YL, oz + 21, 1.2, 1.15, 12, {
      tint: 0x6a3020,
    });
    b.box("marble_black", ox + 11.5, YL + 1.15, oz + 21, 1.4, 0.08, 12.2, {
      tint: 0x5a5a54,
    });
    K.colBox(ox + 10.9, YL, oz + 15, ox + 12.1, YL + 1.2, oz + 27, {
      surface: "wood",
    });
    for (let k = 0; k < 12; k++)
      for (let j = 0; j < 5; j++)
        b.box(
          "walnut",
          ox + 14.72,
          YL + 1.2 + j * 0.34,
          oz + 17.4 + k * 0.6,
          0.12,
          0.3,
          0.55,
          { faces: "w", tint: (k + j) % 4 ? 0x3a2418 : 0x1a1008 },
        );
    b.box("brass", ox + 11.3, YL + 1.23, oz + 18, 0.2, 0.2, 0.2, {
      grime: 0.1,
    }); // service bell
    // elevator bank (west wall): four brass deco doors, one pried open onto a dark shaft
    const er = K.paint("wa_elev", 256, 512);
    for (let k = 0; k < 4; k++) {
      const z = oz + 12.5 + k * 4.5;
      b.box("bronze", LX0 + 0.2, YL, z, 0.3, 3.5, 2.3, { tint: 0x7a5a30 });
      if (k === 2) {
        b.box("black", LX0 + 0.37, YL, z, 0.02, 2.9, 1.4, {
          faces: "e",
          grime: 0,
        });
        b.panel("atlas_paint", LX0 + 0.4, YL + 1.45, z - 1.05, 0.5, 2.9, HP, {
          rect: er,
          grime: 0.3,
        });
      } else
        b.panel("atlas_paint", LX0 + 0.37, YL + 1.45, z, 1.4, 2.9, HP, {
          rect: er,
          grime: 0.3,
        });
      b.box("gold", LX0 + 0.37, YL + 3.1, z, 0.06, 0.25, 0.8, { faces: "e" });
      glows.add(LX0 + 0.45, YL + 3.22, z, k === 1 ? 0xff5030 : 0x806040, "s");
    }
    // lobby sconces & wall lighting
    for (const z of [9, 33])
      for (const x of [-12, 12])
        F.sconce(
          b,
          glows,
          ox + x,
          YL + 3.6,
          oz + z + (z < 20 ? -2.7 : 2.7),
          z < 20 ? 0 : PI,
          {},
        );
    // lounge furniture: club chairs & low tables, some knocked over, a skeleton guest vignette
    for (const p of [
      [-5.5, 11],
      [5.5, 11],
      [-5.5, 31],
      [5.5, 31],
    ]) {
      F.table(b, ox + p[0], YL, oz + p[1], 0, {
        round: true,
        r: 0.5,
        mat: "walnut",
        h: 0.5,
      });
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * PI * 2;
        F.chair(
          b,
          ox + p[0] + Math.cos(a) * 1.1,
          YL,
          oz + p[1] + Math.sin(a) * 1.1,
          HP - a,
          { mat: "walnut", seat: "velvet_red", knocked: k === 1 && p[1] > 20 },
        );
      }
    }
    // potted dead palms
    for (const p of [
      [-13.5, 8],
      [13.5, 8],
      [-13.5, 34],
      [13.5, 34],
    ]) {
      b.cyl("bronze", ox + p[0], YL, oz + p[1], 0.45, 0.35, 0.7, 10, {
        tint: 0x7a5a30,
      });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * PI * 2;
        b.beam(
          "wood_rotten",
          ox + p[0],
          YL + 0.7,
          oz + p[1],
          ox + p[0] + Math.cos(a) * 0.9,
          YL + 1.6 + (k % 2) * 0.4,
          oz + p[1] + Math.sin(a) * 0.9,
          0.04,
        );
      }
    }
    // collapse: a section of coffered ceiling fell into the NE corner
    F.debris(b, ox + 8, YL, oz + 9, 3.2, 26, {
      mound: true,
      col: true,
      colH: 1.0,
      mats: ["plaster", "gold", "rubble"],
    });
    b.box("plaster", ox + 7, YL + 0.6, oz + 10, 3.6, 0.35, 3.8, {
      yaw: 0.5,
      rx: 0.2,
      tint: 0xb8a888,
    });
    F.shaft(b, ox + 8, YL + LH - 0.1, oz + 9, 0.3, 3.2, 9, 0.12, {
      tint: 0x8a9a7a,
    });
    F.papers(b, ox - 12, oz + 8, ox + 12, oz + 34, YL, 40);
    F.papers(b, ox + 10, oz + 15, ox + 14, oz + 27, YL, 12);

    // =========================== PEACOCK ALLEY ===========================
    const AX0 = ox - 5,
      AX1 = ox + 5,
      AZ0 = oz - 30,
      AZ1 = oz + 6;
    K.room(b, {
      x0: AX0,
      x1: AX1,
      z0: AZ0,
      z1: AZ1,
      y: YL,
      h: 5.2,
      floor: "carpet_green",
      wall: "wall_green",
      ceil: "gold",
      doors: {
        e: [{ at: 26, w: 1.6, h: 2.4 }],
        s: [{ at: 5, w: 6, h: 5, arch: true }],
        n: [{ at: 5, w: 6, h: 4.2, arch: true }],
      },
      base: "walnut",
      cornice: "gold",
      ceilTint: 0x8a7040,
      wain: { mat: "walnut", h: 1.2, tint: 0x5a3a24 },
      floorTint: 0x5a7a60,
      surface: "carpet",
    });
    K.coffers(b, "gold", AX0, AZ0, AX1, AZ1, YL + 5.2, 2.5, 0.25, {
      tint: 0x9a7a40,
    });
    const pk = K.paint("wa_peacock", 512, 768);
    for (let z = AZ0 + 3; z < AZ1 - 2; z += 6)
      b.panel(
        "atlas_paint",
        AX0 + 0.18,
        YL + 3.0,
        oz + (z - oz),
        2.0,
        3.0,
        HP,
        { rect: pk, grime: 0.3, off: 0.01 },
      );
    for (let z = AZ0 + 3; z < AZ1 - 2; z += 6)
      F.sconce(b, glows, AX1 - 0.16, YL + 3.2, z + 1.5, -HP, {
        lamp: "lamp_green",
        color: 0x70e0b0,
      });
    // booths along the west wall
    for (let z = AZ0 + 1.8; z < AZ1 - 2; z += 3.1) {
      F.booth(b, AX0 + 0.75, YL, z, -HP, 2.2, { mat: "leather_red" });
      F.table(b, AX0 + 1.9, YL, z, 0, {
        w: 0.7,
        d: 1.4,
        mat: "walnut",
        cloth: "cloth_white",
      });
    }
    // Peacock Alley bar (east wall, north half): counter, back bar with bottles & mirror
    b.box("mahogany", AX1 - 1.4, YL, oz - 17, 0.8, 1.1, 12, { tint: 0x5a2a1a });
    b.box("marble_black", AX1 - 1.4, YL + 1.1, oz - 17, 1.0, 0.07, 12.2);
    b.box("brass", AX1 - 1.85, YL + 0.15, oz - 17, 0.06, 0.06, 12);
    K.colBox(AX1 - 1.8, YL, oz - 23, AX1 - 1.0, YL + 1.2, oz - 11, {
      surface: "wood",
    });
    b.box("glass", AX1 - 0.17, YL + 1.4, oz - 17, 0.02, 1.5, 11, {
      faces: "w",
      grime: 0.5,
      tint: 0x6a7a74,
    });
    for (let k = 0; k < 3; k++)
      b.box(
        "mahogany",
        AX1 - 0.35,
        YL + 1.1 + k * 0.55,
        oz - 17,
        0.35,
        0.04,
        11,
        { faces: "nsewt" },
      );
    {
      const r = K.rng(51);
      for (let k = 0; k < 40; k++) {
        const z = oz - 22.4 + r() * 10.8,
          yy = YL + 1.14 + Math.floor(r() * 3) * 0.55;
        if (r() < 0.35) continue;
        b.cyl("glass_base", AX1 - 0.3, yy, z, 0.04, 0.035, 0.28, 6, {
          tint: [0x3a6a3a, 0x8a5a2a, 0x2a3a6a, 0xa8a898][k % 4],
          grime: 0.2,
        });
      }
    }
    for (let z = oz - 21; z < oz - 12; z += 1.6) {
      b.cyl("chrome", AX1 - 2.6, YL, z, 0.05, 0.05, 0.75, 6);
      b.cyl("leather_red", AX1 - 2.6, YL + 0.75, z, 0.22, 0.22, 0.08, 10);
    }
    glows.add(AX1 - 1.4, YL + 2.6, oz - 20, 0xffb060, "m");
    glows.add(AX1 - 1.4, YL + 2.6, oz - 14, 0xffb060, "m");
    for (const z of [-20, -14]) {
      b.beam(
        "brass",
        AX1 - 1.4,
        YL + 5.2,
        oz + z,
        AX1 - 1.4,
        YL + 2.8,
        oz + z,
        0.03,
      );
      b.geo("lamp_amber", T.cone8, {
        x: AX1 - 1.4,
        y: YL + 2.75,
        z: oz + z,
        s: 0.28,
        sy: 0.22,
        rx: PI,
        grime: 0,
      });
    }
    // skeleton bartender slumped behind the bar is a prop (see content); a Continuity "requisition" crate stack at the south end
    F.crate(b, AX1 - 1.2, YL, oz + 3.5, 0.2, 0.9, {
      mat: "continuity_black",
      tint: 0x2a2c2e,
      bandTint: 0x6a6a64,
    });
    F.crate(b, AX1 - 1.3, YL + 0.72, oz + 3.4, -0.1, 0.8, {
      mat: "continuity_black",
      tint: 0x2a2c2e,
      bandTint: 0x6a6a64,
      col: false,
    });
    F.papers(b, AX0, AZ0, AX1, AZ1, YL, 22);

    // =========================== KITCHEN + SERVICE ===========================
    const KX0 = ox + 5,
      KX1 = ox + 16,
      KZ0 = oz - 14,
      KZ1 = oz + 6;
    K.room(b, {
      x0: KX0,
      x1: KX1,
      z0: KZ0,
      z1: KZ1,
      y: YL,
      h: 4,
      floor: "tile_floor",
      wall: "tile_white",
      ceil: "ceil_tile",
      doors: {
        s: [{ at: 5, w: 2.2, h: 2.6 }],
        n: [{ at: 5.5, w: 1.6, h: 2.3 }],
        w: [{ at: 10, w: 1.6, h: 2.4 }],
      },
      floorTint: 0xc8c8c0,
      wallTint: 0xd8dcd0,
      base: "tile_green",
    });
    // steel counters, range hoods, pots, a walk-in cooler door
    b.box("chrome", ox + 10.5, YL, oz - 4, 1.2, 0.92, 9, { tint: 0xb8bcb8 });
    K.colBox(ox + 9.9, YL, oz - 8.5, ox + 11.1, YL + 0.95, oz + 0.5, {
      surface: "metal",
    });
    b.box("black_metal", KX1 - 0.9, YL, oz - 6, 1.2, 0.9, 6, {
      tint: 0x2a2a2a,
    });
    K.colBox(KX1 - 1.5, YL, oz - 9, KX1 - 0.3, YL + 0.95, oz - 3, {
      surface: "metal",
    });
    b.box("chrome", KX1 - 1.0, YL + 2.2, oz - 6, 1.4, 0.8, 6.4, {
      tint: 0x9a9e9a,
    });
    for (let k = 0; k < 6; k++)
      b.cyl(
        "chrome",
        ox + 10.5 + (k % 2 ? 0.3 : -0.3),
        YL + 0.92,
        oz - 7.5 + k * 1.4,
        0.22,
        0.2,
        0.28,
        8,
        { tint: 0x8a8a84 },
      );
    b.box("chrome", KX0 + 0.3, YL, oz - 10, 0.4, 2.4, 2.2, { tint: 0xa8aca8 }); // walk-in cooler door
    for (let x = ox + 7; x < KX1; x += 4) {
      b.box("lamp_white", x, YL + 3.95, oz - 4, 0.25, 0.05, 2.4, { grime: 0 });
      glows.add(x, YL + 3.85, oz - 4, 0xe0ecff, "m");
    }
    F.papers(b, KX0, KZ0, KX1, KZ1, YL, 10, { tint: 0xb8b09a });
    F.debris(b, ox + 14, YL, oz + 3, 1.2, 8, {
      mats: ["tile_white", "rubble"],
    });
    // service stair hall (north of kitchen) with the service elevator
    const SZ0 = oz - 24;
    K.room(b, {
      x0: KX0,
      x1: KX1,
      z0: SZ0,
      z1: KZ0,
      y: YL,
      h: 3.4,
      floor: "concrete",
      wall: "wall_grey",
      ceil: "concrete",
      doors: { s: [{ at: 5.5, w: 1.6, h: 2.3 }] },
      floorTint: 0x8a8a84,
      wallTint: 0x9a9a90,
    });
    b.box("metal_dark", ox + 10.5, YL, SZ0 + 0.3, 2.2, 2.8, 0.25, {
      tint: 0x4a4a44,
    }); // elevator door
    b.box("black_metal", ox + 10.5, YL + 2.8, SZ0 + 0.35, 2.6, 0.3, 0.2);
    glows.add(ox + 12, YL + 2.6, SZ0 + 0.5, 0xff4030, "s");
    b.geo("lamp_red", T.sphereLo, {
      x: ox + 12,
      y: YL + 2.6,
      z: SZ0 + 0.45,
      s: 0.1,
      grime: 0,
    });
    F.crate(b, ox + 6.5, YL, SZ0 + 2, 0.3, 1.0);
    F.crate(b, ox + 6.4, YL + 0.8, SZ0 + 2.1, -0.2, 0.8, { col: false });
    F.cabinets(b, KX1 - 0.5, YL, SZ0 + 5, -HP, 3, { tint: 0x5a6058 });

    // =========================== GRAND BALLROOM ===========================
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++)
        b.light(
          ox - 9 + i * 6,
          YL + 1.5,
          oz - 62 + 13 + j * 5.2,
          4.5,
          0xffb060,
          0.7,
        );
    const BX0 = ox - 16,
      BX1 = ox + 16,
      BZ0 = oz - 62,
      BZ1 = oz - 30,
      BH = 13.5;
    K.room(b, {
      x0: BX0,
      x1: BX1,
      z0: BZ0,
      z1: BZ1,
      y: YL,
      h: BH,
      floor: "oak",
      wall: "wall_cream",
      ceil: "plaster",
      doors: { s: [{ at: 16, w: 6, h: 4.2, arch: true }], n: [], e: [], w: [] },
      base: "walnut",
      cornice: "gold",
      corniceH: 0.7,
      floorTint: 0xd8b890,
      wallTint: 0xf0e0c4,
      surface: "wood",
    });
    K.coffers(b, "gold", BX0, BZ0, BX1, BZ1, YL + BH, 4, 0.8, {
      tint: 0xa88848,
      rosette: "gold",
      rosetteTint: 0xd0a850,
    });
    // gilded pilasters and tall mirror panels on the side walls below the balconies
    for (let z = BZ0 + 9; z < BZ1 - 3; z += 6)
      for (const sgn of [-1, 1]) {
        const x = sgn < 0 ? BX0 + 0.22 : BX1 - 0.22;
        b.box("gold", x, YL, z - 2.6, 0.14, 5.3, 0.5, { tint: 0xc8a050 });
        b.panel(
          "glass",
          x - sgn * 0.02,
          YL + 2.6,
          z,
          2.2,
          3.6,
          sgn < 0 ? HP : -HP,
          { tint: 0x8a8a78, grime: 0.4 },
        );
        b.box("gold", x, YL + 4.4, z, 0.1, 0.12, 2.5, { tint: 0xc8a050 });
      }
    // corner walls between alley and ballroom (the alley's north end is the ballroom door)
    // balcony tiers: tier 1 (+5.5) runs the full length of the W & E walls; tier 2 (+9.5) only the northern half.
    const T1 = YL + 5.5,
      T2 = YL + 9.5,
      D1 = 3.2,
      D2 = 2.6,
      T2Z = BZ0 + 22;
    const gild = { solid: "gold", tint: 0xb89048, mat: "brass", h: 1.0 };
    for (const sgn of [-1, 1]) {
      const wx = sgn < 0 ? BX0 : BX1; // wall line
      const ex1 = wx - sgn * D1,
        ex2 = wx - sgn * D2; // balcony edges
      K.slab(
        b,
        "carpet_red",
        Math.min(wx, ex1),
        BZ0 + 6,
        Math.max(wx, ex1),
        BZ1,
        T1,
        { th: 0.5, edge: "gold", edgeTint: 0xc8a048, surface: "carpet" },
      );
      K.slab(
        b,
        "carpet_red",
        Math.min(wx, ex2),
        BZ0 + 6,
        Math.max(wx, ex2),
        T2Z,
        T2,
        { th: 0.5, edge: "gold", edgeTint: 0xc8a048, surface: "carpet" },
      );
      F.railing(b, ex1, BZ0 + 6, ex1, BZ1 - 3.3, T1, gild); // tier-1 parapet (open at the grand-stair landing)
      F.railing(b, wx, BZ0 + 6, ex1, BZ0 + 6, T1, { mat: "brass" });
      F.railing(b, ex2, BZ0 + 6, ex2, T2Z, T2, gild); // tier-2 parapet
      F.railing(b, wx, BZ0 + 6, ex2, BZ0 + 6, T2, { mat: "brass" });
      // tier 1 → tier 2 flight along the wall (rises northward, lands on the tier-2 balcony's south edge)
      b.stairs(
        "carpet_red",
        wx - sgn * 1.3,
        T2Z + 8,
        0,
        -1,
        2.4,
        8,
        T1,
        T2,
        10,
        { tint: 0xa84040 },
      );
      F.railing(
        b,
        wx - sgn * 2.55,
        T2Z + 8,
        wx - sgn * 2.55,
        T2Z + 0.2,
        T1 + 0.5,
        { mat: "brass", h: 1.0, col: false },
      );
      // gilded brackets under the balconies
      for (let z = BZ0 + 8; z < BZ1 - 2; z += 4)
        b.box("gold", ex1 + sgn * 0.3, T1 - 1.4, z, 0.3, 0.9, 0.3, {
          tint: 0xa88040,
        });
      for (let z = BZ0 + 8; z < T2Z; z += 4)
        b.box("gold", ex2 + sgn * 0.3, T2 - 1.4, z, 0.3, 0.9, 0.3, {
          tint: 0xa88040,
        });
      // grand stair: floor → tier 1 along the south wall, rising outward from the centre, landing on the balcony's south end
      b.stairs(
        "marble_t",
        ox + sgn * 3.0,
        BZ1 - 1.6,
        sgn,
        0,
        2.9,
        9.8,
        YL,
        T1,
        14,
        { tint: 0xe0d8c8, solid: true },
      );
      b.beam(
        "brass",
        ox + sgn * 3.0,
        YL + 1.0,
        BZ1 - 3.1,
        ox + sgn * 12.8,
        T1 + 1.0,
        BZ1 - 3.1,
        0.07,
        { grime: 0.2 },
      );
      for (let k = 0; k <= 8; k++) {
        const t = k / 8,
          x = ox + sgn * (3.0 + 9.8 * t),
          y = YL + (T1 - YL) * t;
        b.beam("brass", x, y, BZ1 - 3.1, x, y + 1.0, BZ1 - 3.1, 0.04, {
          grime: 0.2,
        });
      }
    }
    // stage (north) with Continuity rally set
    const SY = YL + 1.2;
    K.slab(b, "oak", BX0 + 4, BZ0, BX1 - 4, BZ0 + 6, SY, {
      th: 1.2,
      edge: "walnut",
      edgeTint: 0x4a2a18,
      surface: "wood",
      faces: "t",
    });
    b.stairs("oak", ox, BZ0 + 8.4, 0, -1, 4, 2.4, YL, SY, 3, {
      tint: 0x8a6a48,
    });
    const vc = 0x5a1a14;
    b.box("velvet_red", BX0 + 4, YL, BZ0 + 0.4, 0.8, BH - 1, 1.5, { tint: vc });
    b.box("velvet_red", BX1 - 4, YL, BZ0 + 0.4, 0.8, BH - 1, 1.5, { tint: vc });
    b.box("velvet_red", ox, YL + BH - 2.4, BZ0 + 6.2, 24, 1.6, 0.3, {
      tint: vc,
    });
    // giant Continuity banner backdrop + podium + microphone
    const fr = K.flag("wa_continuity", 256, 500);
    b.quad(
      "flags",
      [ox - 3.5, SY + 0.5, BZ0 + 0.35],
      [ox + 3.5, SY + 0.5, BZ0 + 0.35],
      [ox + 3.5, SY + 10.5, BZ0 + 0.35],
      [ox - 3.5, SY + 10.5, BZ0 + 0.35],
      { rect: fr },
    );
    for (const sx of [-8, 8])
      b.quad(
        "flags",
        [ox + sx - 1.6, SY + 3, BZ0 + 0.35],
        [ox + sx + 1.6, SY + 3, BZ0 + 0.35],
        [ox + sx + 1.6, SY + 9.4, BZ0 + 0.35],
        [ox + sx - 1.6, SY + 9.4, BZ0 + 0.35],
        { rect: fr },
      );
    b.box("continuity_black", ox, SY, BZ0 + 4.2, 1.2, 1.2, 0.7, {
      tint: 0x22262a,
    });
    b.beam("chrome", ox, SY + 1.2, BZ0 + 4.2, ox, SY + 1.7, BZ0 + 4.5, 0.03);
    b.geo("black_metal", T.sphereLo, {
      x: ox,
      y: SY + 1.75,
      z: BZ0 + 4.5,
      s: 0.06,
    });
    K.colBox(ox - 0.6, SY, BZ0 + 3.85, ox + 0.6, SY + 1.2, BZ0 + 4.55, {
      surface: "metal",
    });
    for (const sx of [-6, 6]) {
      b.cyl("black_metal", ox + sx, SY, BZ0 + 5, 0.08, 0.08, 2.4, 6);
      b.box("black_metal", ox + sx, SY + 2.4, BZ0 + 5, 0.6, 0.45, 0.45, {
        yaw: 0.3 * Math.sign(sx),
      });
      b.geo("lamp_red", T.cyl8, {
        x: ox + sx,
        y: SY + 2.62,
        z: BZ0 + 5.23,
        s: 0.18,
        sy: 0.02,
        rx: HP,
        grime: 0,
      });
      glows.add(ox + sx, SY + 2.6, BZ0 + 5.4, 0xff5040, "m");
    }
    // the last gala: round tables with cloths, place settings, skeleton guests (props) — some tables overturned
    const tr = K.rng(1931);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++) {
        const x = ox - 9 + i * 6,
          z = BZ0 + 13 + j * 5.2;
        if (i === 2 && j === 1) {
          F.debris(b, x, YL, z, 1.5, 10, {
            mats: ["gold", "glass_base", "plaster"],
          });
          continue;
        }
        if (tr() < 0.25) {
          b.cyl("cloth_white", x, YL, z, 0.9, 0.9, 0.08, 14, {
            tint: 0xc8c0b0,
            rz: 0,
          });
          b.box("walnut", x + 0.3, YL, z - 0.2, 1.8, 0.08, 0.1, {
            yaw: tr() * 3,
          });
          continue;
        }
        F.table(b, x, YL, z, 0, {
          round: true,
          r: 0.95,
          cloth: "cloth_white",
          clothTint: 0xd8d0c0,
          mat: "walnut",
        });
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * PI * 2 + tr() * 0.3;
          F.chair(
            b,
            x + Math.cos(a) * 1.35,
            YL,
            z + Math.sin(a) * 1.35,
            HP - a + PI,
            {
              mat: "gold",
              seat: "velvet_red",
              tint: 0xb89048,
              knocked: tr() < 0.2,
            },
          );
          b.cyl(
            "hosp_white",
            x + Math.cos(a) * 0.7,
            YL + 0.75,
            z + Math.sin(a) * 0.7,
            0.13,
            0.13,
            0.01,
            10,
            { grime: 0.3 },
          );
        }
        b.cyl("glass_base", x, YL + 0.75, z, 0.06, 0.1, 0.4, 6, {
          tint: 0xa8b0a8,
        });
        b.cyl("gold", x, YL + 0.75, z, 0.08, 0.05, 0.6, 6);
        glows.add(x, YL + 1.42, z, 0xffa050, "s");
      }
    // the ballroom chandelier (partly fallen: one crashed onto the dance floor)
    F.chandelier(b, glows, ox, YL + BH - 3.2, oz - 44, 3.2, {
      tiers: 3,
      crystals: true,
      chain: 2.8,
      broken: true,
    });
    F.debris(b, ox + 6, YL, oz - 38, 2.0, 16, {
      mats: ["gold", "glass_base", "brass"],
      scale: 0.6,
    });
    b.geo("gold", T.torus, {
      x: ox + 6,
      y: YL + 0.3,
      z: oz - 38,
      rx: HP + 0.2,
      s: 2.2,
    });
    // tall windows (blind arches) on the east & west walls above tier 2, with dim green sky light
    for (let z = BZ0 + 8; z < BZ1 - 3; z += 6)
      for (const x of [BX0 + 0.16, BX1 - 0.16]) {
        b.panel("glass_broken", x, YL + 12, z, 2.2, 2.4, x < ox ? HP : -HP, {
          tint: 0x6a7a5a,
          grime: 0.2,
        });
        F.shaft(
          b,
          x + (x < ox ? 0.2 : -0.2),
          YL + 12.8,
          z,
          x < ox ? HP : -HP,
          2.0,
          9,
          0.5,
          { tint: 0x6a7a5a },
        );
      }
    F.papers(b, BX0 + 4, BZ0 + 8, BX1 - 4, BZ1 - 4, YL, 34);
    // Continuity supply cache at the stage foot
    for (let k = 0; k < 3; k++)
      F.crate(b, BX1 - 6 - k * 1.2, YL, BZ0 + 7.5, 0.1 * k, 1.0, {
        mat: "continuity_black",
        tint: 0x26282a,
        bandTint: 0x7a7a74,
      });
    // towers staircase door (tier 2, north end of the west balcony)
    b.box("walnut", BX0 + 0.2, YL + 9.5, BZ0 + 7.4, 0.3, 2.6, 1.8, {
      tint: 0x5a3a20,
    });
    b.box("gold", BX0 + 0.36, YL + 12.1, BZ0 + 7.4, 0.04, 0.4, 2.2, {
      faces: "e",
    });
    glows.add(BX0 + 0.5, YL + 12.3, BZ0 + 7.4, 0x60ff80, "s");

    // =========================== PRESIDENTIAL SUITE (35th floor) ===========================
    const SY0 = 40,
      SX = ox + 70,
      SZ = oz - 10; // suite block origin
    b.light(SX + 10, SY0 + 3.2, SZ - 2, 16, 0xffc890, 1.1); // command room chandelier
    for (const p of [
      [2, -8],
      [2, 4],
      [20, -8],
      [20, 4],
      [11, 7],
    ])
      b.light(SX + p[0], SY0 + 2.4, SZ + p[1], 6, 0xffc070, 0.8); // sconces
    b.light(SX + 29, SY0 + 2.5, SZ - 3, 8, 0x80ff9a, 0.7); // radio room green
    b.light(SX + 6, SY0 + 3, SZ - 22, 12, 0xd8e4ff, 1.1); // armory work lights
    b.light(SX + 6, SY0 + 2, SZ - 27, 7, 0xff5040, 0.5); // armory: red visor wash
    b.light(SX + 22, SY0 + 3, SZ - 22, 11, 0xffd0a0, 0.8); // study
    b.light(SX + 10, SY0 + 3, SZ + 13, 7, 0xffd0a0, 0.6); // arrival hall
    // arrival hall (towers stair landing)
    K.room(b, {
      x0: SX + 5,
      x1: SX + 15,
      z0: SZ + 8,
      z1: SZ + 18,
      y: SY0,
      h: 3.6,
      floor: "marble_cream",
      wall: "wallpaper",
      ceil: "plaster",
      doors: { n: [{ at: 5, w: 2.4, h: 2.8 }] },
      base: "walnut",
      cornice: "gold",
      wallTint: 0x9aa880,
    });
    b.box("walnut", SX + 10, SY0, SZ + 17.7, 1.6, 2.6, 0.2, { tint: 0x5a3a20 });
    F.table(b, SX + 7, SY0, SZ + 13, HP, {
      w: 1.2,
      d: 0.5,
      mat: "walnut",
      h: 0.9,
    });
    b.cyl("glass_base", SX + 7, SY0 + 0.9, SZ + 13, 0.12, 0.08, 0.3, 8, {
      tint: 0x7a8a70,
    });
    F.sandbags(b, SX + 12, SY0, SZ + 10, 0, 3, 2);
    // command room (living room)
    K.room(b, {
      x0: SX,
      x1: SX + 22,
      z0: SZ - 12,
      z1: SZ + 8,
      y: SY0,
      h: 4.2,
      floor: "oak",
      wall: "wallpaper",
      ceil: "plaster",
      doors: {
        s: [{ at: 10, w: 2.4, h: 2.8 }],
        n: [
          { at: 6, w: 2.0, h: 2.6 },
          { at: 16, w: 2.0, h: 2.6 },
        ],
        e: [{ at: 10, w: 2.0, h: 2.6 }],
        w: [],
      },
      base: "walnut",
      cornice: "gold",
      corniceH: 0.4,
      wallTint: 0xe0d0a0,
      floorTint: 0xb08a60,
      surface: "wood",
      wain: { mat: "walnut", h: 1.0, tint: 0x8a5a38 },
    });
    const sealR = K.paint("wa_seal", 512, 512);
    b.quad(
      "atlas_paint",
      [SX + 7, SY0 + 0.01, SZ + 3],
      [SX + 13, SY0 + 0.01, SZ + 3],
      [SX + 13, SY0 + 0.01, SZ - 3],
      [SX + 7, SY0 + 0.01, SZ - 3],
      { rect: sealR, grime: 0.3 },
    );
    // war table with the Manhattan tactical map
    const wm = K.paint("wa_warmap", 768, 512);
    b.box("walnut", SX + 10, SY0, SZ, 4.6, 0.85, 2.8, { tint: 0x4a2a18 });
    b.quad(
      "atlas_paint",
      [SX + 7.8, SY0 + 0.86, SZ + 1.3],
      [SX + 12.2, SY0 + 0.86, SZ + 1.3],
      [SX + 12.2, SY0 + 0.86, SZ - 1.3],
      [SX + 7.8, SY0 + 0.86, SZ - 1.3],
      { rect: wm, grime: 0.1 },
    );
    K.colBox(SX + 7.7, SY0, SZ - 1.4, SX + 12.3, SY0 + 0.9, SZ + 1.4, {
      surface: "wood",
    });
    for (let k = 0; k < 6; k++)
      b.cyl(
        k % 2 ? "paint_red" : "black_metal",
        SX + 8.5 + k * 0.6,
        SY0 + 0.86,
        SZ + ((k % 3) - 1) * 0.6,
        0.05,
        0.05,
        0.12,
        6,
        { grime: 0.2 },
      );
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        F.chair(b, SX + 10 + sx * 1.6, SY0, SZ + sz * 2.0, sz > 0 ? PI : 0, {
          mat: "walnut",
          seat: "leather_brown",
        });
    F.chandelier(b, glows, SX + 10, SY0 + 3.1, SZ, 1.2, {
      tiers: 2,
      crystals: true,
      chain: 0.9,
    });
    // fireplace (west wall) with Continuity flag above and a portrait of a old-world President (original silhouette)
    b.box("marble_t", SX + 0.4, SY0, SZ - 2, 0.8, 1.5, 3.0, { tint: 0xe8e0d0 });
    b.box("black", SX + 0.81, SY0 + 0.2, SZ - 2, 0.02, 0.9, 1.6, {
      faces: "e",
      grime: 0,
    });
    b.box("marble_t", SX + 0.55, SY0 + 1.5, SZ - 2, 1.0, 0.12, 3.3, {
      tint: 0xe8e0d0,
    });
    glows.add(SX + 0.9, SY0 + 0.45, SZ - 2, 0xff7020, "m");
    b.quad(
      "flags",
      [SX + 0.2, SY0 + 1.9, SZ - 3.2],
      [SX + 0.2, SY0 + 1.9, SZ - 0.8],
      [SX + 0.2, SY0 + 3.9, SZ - 0.8],
      [SX + 0.2, SY0 + 3.9, SZ - 3.2],
      {
        rect: [
          fr[0],
          fr[1] + (fr[3] - fr[1]) * 0.25,
          fr[2],
          fr[3] - (fr[3] - fr[1]) * 0.2,
        ],
      },
    );
    for (const p of [
      [0.25, -8, HP],
      [0.25, 4, HP],
      [21.75, 4, -HP],
      [11, 7.75, PI],
    ])
      F.sconce(b, glows, SX + p[0], SY0 + 2.4, SZ + p[1], p[2], {});
    // sofas + comm consoles
    F.booth(b, SX + 3.2, SY0, SZ + 5.5, PI, 2.6, {
      mat: "leather_brown",
      frame: "walnut",
    });
    for (let k = 0; k < 3; k++) {
      b.box(
        "continuity_black",
        SX + 21.3,
        SY0,
        SZ - 8 + k * 2.2,
        1.0,
        1.9,
        1.8,
        { tint: 0x2a2e30 },
      );
      b.panel(
        "atlas_lit",
        SX + 20.79,
        SY0 + 1.35,
        SZ - 8 + k * 2.2,
        1.4,
        0.7,
        -HP,
        { rect: K.litPaint("wa_radio", 512, 256), grime: 0 },
      );
    }
    K.colBox(SX + 20.8, SY0, SZ - 9, SX + 21.8, SY0 + 1.9, SZ - 2.5, {
      surface: "metal",
    });
    // windows (east side of the south wall → painted skyline behind glass)
    const sk = K.litPaint("wa_skyline", 1024, 256);
    b.panel("atlas_lit", SX + 16, SY0 + 2.1, SZ + 7.83, 9, 2.2, PI, {
      rect: sk,
      grime: 0,
    });
    for (let k = 0; k < 4; k++)
      b.box(
        "walnut",
        SX + 11.8 + k * 2.8,
        SY0 + 1.0,
        SZ + 7.75,
        0.12,
        2.4,
        0.12,
      );
    // radio room (east)
    K.room(b, {
      x0: SX + 22,
      x1: SX + 32,
      z0: SZ - 12,
      z1: SZ + 4,
      y: SY0,
      h: 3.6,
      floor: "plate",
      wall: "wall_grey",
      ceil: "ceil_tile",
      doors: { w: [{ at: 10, w: 2.0, h: 2.6 }] },
      floorTint: 0x7a7a74,
      wallTint: 0x7a7a70,
      surface: "metal",
    });
    for (let k = 0; k < 5; k++) {
      const z = SZ - 10.5 + k * 3;
      b.box("continuity_black", SX + 31.2, SY0, z, 1.2, 2.6, 2.4, {
        tint: 0x2c3032,
      });
      b.panel("atlas_lit", SX + 30.59, SY0 + 1.5, z, 2.0, 1.0, -HP, {
        rect: K.litPaint("wa_radio", 512, 256),
        grime: 0,
      });
      glows.add(
        SX + 30.5,
        SY0 + 2.3,
        z - 0.6,
        [0xff3020, 0x40ff70, 0xffb030][k % 3],
        "s",
      );
    }
    K.colBox(SX + 30.6, SY0, SZ - 12, SX + 32, SY0 + 2.6, SZ + 2.5, {
      surface: "metal",
    });
    F.desk(b, SX + 26, SY0, SZ - 4, -HP, {
      mat: "continuity_black",
      w: 2.2,
      phone: true,
    });
    F.chair(b, SX + 24.9, SY0, SZ - 4, -HP, {
      mat: "black_metal",
      seat: "leather_brown",
    });
    for (let k = 0; k < 6; k++)
      F.pipe(
        b,
        SX + 22.4 + k * 1.5,
        SY0 + 3.4,
        SZ - 12,
        SX + 22.4 + k * 1.5,
        SY0 + 3.4,
        SZ + 4,
        0.06,
        { mat: "black_metal" },
      );
    b.cable(
      "black_metal",
      SX + 31,
      SY0 + 2.6,
      SZ - 6,
      SX + 26,
      SY0 + 0.8,
      SZ - 4,
      0.6,
      0.04,
      6,
    );
    // armory (bedroom converted): exo-rig racks
    K.room(b, {
      x0: SX,
      x1: SX + 12,
      z0: SZ - 30,
      z1: SZ - 12,
      y: SY0,
      h: 3.8,
      floor: "carpet_blue",
      wall: "wallpaper",
      ceil: "plaster",
      doors: {
        s: [{ at: 6, w: 2.0, h: 2.6 }],
        e: [{ at: 12, w: 2.0, h: 2.6 }],
      },
      base: "walnut",
      wallTint: 0xb8c4cc,
      floorTint: 0x7a8aa8,
      surface: "carpet",
    });
    for (let k = 0; k < 4; k++) {
      const x = SX + 1.8 + k * 2.6,
        z = SZ - 28.4;
      b.box("black_metal", x, SY0, z, 1.6, 0.2, 1.2, {});
      b.box("black_metal", x, SY0 + 0.2, z - 0.5, 0.2, 2.6, 0.2, {});
      b.box("black_metal", x, SY0 + 2.2, z - 0.5, 1.4, 0.15, 0.3, {});
      if (k === 3) continue; // empty rack — somebody suited up
      // Mk II-style suit on the frame (black armour plates, glowing visor)
      b.box("continuity_black", x, SY0 + 1.0, z, 0.75, 0.9, 0.55, {
        tint: 0x1e2224,
      });
      b.box("continuity_black", x, SY0 + 1.95, z, 0.95, 0.35, 0.6, {
        tint: 0x26292c,
      });
      for (const sx of [-0.25, 0.25]) {
        b.box("continuity_black", x + sx, SY0 + 0.2, z, 0.28, 0.85, 0.34, {
          tint: 0x1e2224,
        });
        b.box(
          "continuity_black",
          x + sx * 2.2,
          SY0 + 1.05,
          z,
          0.24,
          0.85,
          0.26,
          { tint: 0x1e2224 },
        );
      }
      b.geo("continuity_black", T.sphereLo, {
        x,
        y: SY0 + 2.45,
        z: z + 0.02,
        sx: 0.24,
        sy: 0.27,
        sz: 0.28,
        tint: 0x16181a,
      });
      for (const sx of [-1, 1]) {
        b.geo("continuity_black", T.sphereLo, {
          x: x + sx * 0.5,
          y: SY0 + 2.02,
          z,
          sx: 0.28,
          sy: 0.24,
          sz: 0.3,
          tint: 0x24272a,
        });
        b.box(
          "lamp_red",
          x + sx * 0.08,
          SY0 + 2.48,
          z + 0.27,
          0.09,
          0.05,
          0.02,
          { grime: 0 },
        );
      }
      b.box("continuity_black", x, SY0 + 1.3, z - 0.42, 0.7, 0.8, 0.3, {
        tint: 0x2a2d30,
      }); // rig-battery backpack
      b.box("black_metal", x, SY0 + 2.3, z + 0.27, 0.16, 0.12, 0.06, {
        tint: 0x3a3a3a,
      }); // respirator grille
      glows.add(x, SY0 + 2.46, z + 0.3, 0xff3020, "s");
      K.colBox(x - 0.6, SY0, z - 0.6, x + 0.6, SY0 + 2.6, z + 0.6, {
        surface: "metal",
      });
    }
    // armory work table with gyrojet carbines & rocket boxes, crate stack, flag
    F.table(b, SX + 6, SY0, SZ - 17, 0, {
      w: 3,
      d: 1.1,
      mat: "black_metal",
      tint: 0x3a3c3e,
    });
    for (let k = 0; k < 3; k++) {
      b.box(
        "black_metal",
        SX + 5 + k * 0.9,
        SY0 + 0.77,
        SZ - 17,
        0.14,
        0.12,
        0.9,
        { yaw: 0.1 * k },
      );
      b.box(
        "lamp_red",
        SX + 5 + k * 0.9,
        SY0 + 0.85,
        SZ - 17.42,
        0.05,
        0.04,
        0.04,
        { grime: 0 },
      );
    }
    for (let k = 0; k < 5; k++)
      b.cyl(
        "lamp_green",
        SX + 7.4 + (k % 3) * 0.12,
        SY0 + 0.77,
        SZ - 16.8 + Math.floor(k / 3) * 0.14,
        0.04,
        0.04,
        0.12,
        6,
        { grime: 0 },
      );
    for (let k = 0; k < 3; k++)
      F.crate(b, SX + 10.6, SY0 + k * 0.72, SZ - 13.2, 0.1 * k, 0.9, {
        mat: "continuity_black",
        tint: 0x26282a,
        bandTint: 0x7a7a74,
        col: k === 0,
      });
    b.quad(
      "flags",
      [SX + 11.8, SY0 + 0.6, SZ - 24],
      [SX + 11.8, SY0 + 0.6, SZ - 21.6],
      [SX + 11.8, SY0 + 3.4, SZ - 21.6],
      [SX + 11.8, SY0 + 3.4, SZ - 24],
      { rect: fr, double: true },
    );
    // gun racks + workbench
    for (let k = 0; k < 6; k++)
      b.beam(
        "black_metal",
        SX + 0.4,
        SY0 + 0.4,
        SZ - 22 + k * 0.5,
        SX + 0.4,
        SY0 + 1.7,
        SZ - 22.1 + k * 0.5,
        0.07,
      );
    b.box("walnut", SX + 0.35, SY0 + 1.1, SZ - 20.8, 0.2, 0.1, 3.4);
    for (let x = SX + 3; x < SX + 12; x += 4) {
      b.box("lamp_white", x, SY0 + 3.75, SZ - 20, 0.2, 0.05, 2.2, { grime: 0 });
      glows.add(x, SY0 + 3.65, SZ - 20, 0xe0ecff, "m");
    }
    // study (the Major's office)
    K.room(b, {
      x0: SX + 12,
      x1: SX + 32,
      z0: SZ - 30,
      z1: SZ - 12,
      y: SY0,
      h: 3.8,
      floor: "oak",
      wall: "mahogany",
      ceil: "plaster",
      doors: {
        e: [{ at: 4, w: 1.6, h: 2.4 }],
        s: [{ at: 4, w: 2.0, h: 2.6 }],
        w: [{ at: 12, w: 2.0, h: 2.6 }],
      },
      base: "walnut",
      cornice: "gold",
      wallTint: 0x6a4028,
      floorTint: 0x8a6a48,
      surface: "wood",
    });
    b.box("mahogany", SX + 22, SY0, SZ - 25.5, 2.8, 0.8, 1.4, {
      tint: 0x5a2a18,
    });
    b.box("leather_brown", SX + 22, SY0 + 0.8, SZ - 25.5, 2.4, 0.02, 1.1, {
      tint: 0x3a5a3a,
    });
    K.colBox(SX + 20.6, SY0, SZ - 26.2, SX + 23.4, SY0 + 0.85, SZ - 24.8, {
      surface: "wood",
    });
    F.chair(b, SX + 22, SY0, SZ - 27, 0, {
      mat: "walnut",
      seat: "leather_red",
    });
    for (const x of [SX + 13.5, SX + 30.5])
      F.shelf(b, x, SY0, SZ - 21, x < SX + 20 ? -HP : HP, {
        mat: "walnut",
        fill: "books",
        w: 3.2,
        h: 3.0,
        tint: 0x4a2a18,
      });
    b.panel("atlas_lit", SX + 22, SY0 + 2.2, SZ - 29.83, 7, 1.8, 0, {
      rect: sk,
      grime: 0,
    });
    b.quad(
      "flags",
      [SX + 17.5, SY0 + 0.4, SZ - 29.7],
      [SX + 18.5, SY0 + 0.4, SZ - 29.7],
      [SX + 18.5, SY0 + 3.3, SZ - 29.7],
      [SX + 17.5, SY0 + 3.3, SZ - 29.7],
      { rect: fr },
    );
    b.cyl("gold", SX + 18, SY0, SZ - 29.4, 0.03, 0.03, 3.5, 6);
    F.papers(b, SX + 13, SZ - 29, SX + 31, SZ - 13, SY0, 18);
    F.papers(b, SX + 1, SZ - 11, SX + 21, SZ + 7, SY0, 16);
    // service elevator (study east door leads into a tiny vestibule)
    K.room(b, {
      x0: SX + 32,
      x1: SX + 36,
      z0: SZ - 28,
      z1: SZ - 24,
      y: SY0,
      h: 3,
      floor: "concrete",
      wall: "wall_grey",
      ceil: "concrete",
      doors: { w: [{ at: 2, w: 1.6, h: 2.4 }] },
      wallTint: 0x8a8a84,
    });
    b.box("metal_dark", SX + 35.7, SY0, SZ - 26, 0.25, 2.6, 2.0, {
      tint: 0x4a4a44,
    });
    glows.add(SX + 35.4, SY0 + 2.7, SZ - 26, 0x60ff80, "s");

    b.finish(rec.interiorRoot, { cast: false });
    glows.finish(rec.interiorRoot, { interior: true, nightOpacity: 0.95 });

    // ---- anchors ----
    const A = (n, x, y, z, yaw) => rec.anchor(n, x, y, z, yaw);
    A("entrance", ox, 0, oz + 44, 0);
    A("lobby", ox, YL, oz + 16, 0);
    A("clock", ox, YL, oz + 21, 0);
    A("alley", ox, YL, oz - 12, 0);
    A("ballroom", ox, YL, oz - 44, 0);
    A("stage", ox, SY, oz - 58, PI);
    A("suite", SX + 10, SY0, SZ + 4, 0);
    A("boss", SX + 22, SY0, SZ - 22, 0);
    A("radio", SX + 26, SY0, SZ - 6, -HP);
    A("spawn1", ox - 6, YL, oz + 14, 0);
    A("spawn2", ox + 2, YL, oz - 18, PI);
    A("spawn3", ox - 8, YL, oz - 40, 0);
    A("spawn4", ox + 13.4, YL + 5.5, oz - 45.2, -HP);
    A("spawn5", SX + 16, SY0, SZ - 4, PI);
    A("spawn6", SX + 6, SY0, SZ - 18, 0);
    for (let i = 1; i <= 6; i++) {
      const a = rec.anchors["spawn" + i];
      if (a) a.interior = "waldorf";
    }
    return {
      arrival: { x: ox, y: 0, z: oz + 45.2, yaw: 0 },
      exitPos: new THREE.Vector3(ox, 1.6, oz + 47.5),
      towersDoor: new THREE.Vector3(BX0 + 0.6, YL + 9.5 + 1.4, BZ0 + 7.4),
      towersTarget: { x: BX0 + 1.4, y: YL + 9.5, z: BZ0 + 8.6, yaw: PI }, // look down the tier-2 balcony
      suiteArrival: { x: SX + 10, y: SY0, z: SZ + 16, yaw: 0 },
      suiteStairDoor: new THREE.Vector3(SX + 10, SY0 + 1.4, SZ + 17.5),
      svcUpperDoor: new THREE.Vector3(SX + 35.5, SY0 + 1.4, SZ - 26),
      svcUpperArrival: { x: SX + 33.8, y: SY0, z: SZ - 26, yaw: HP },
      svcLowerDoor: new THREE.Vector3(ox + 10.5, YL + 1.4, SZ0 + 0.6),
      svcLowerArrival: { x: ox + 10.5, y: YL, z: SZ0 + 2.2, yaw: PI },
      ox,
      oz,
      YL,
      SX,
      SZ,
      SY0,
      BX0,
      BZ0,
      BZ1,
    };
  }

  // ------------------------------------------------------------------
  // Content (props, notes, terminals) — spawned on initDone by 05_content
  // ------------------------------------------------------------------
  function content(rec, I) {
    const C = K.content("waldorf", rec);
    const { ox, oz, YL, SX, SZ, SY0, BZ0 } = I;
    // loot
    C.prop("desk", ox + 5.5, 0, oz + 44, -HP, {
      name: "Continuity Checkpoint Desk",
      loot: "continuity",
    });
    C.prop("cash_register", ox + 11.4, YL + 1.2, oz + 23, -HP, {
      name: "Front Desk Register",
      mount: "bare",
    });
    C.prop("safe", ox + 14.6, YL + 0.9, oz + 26.5, -HP, {
      wall: true,
      name: "Front Desk Safe",
      locked: 0,
      lock: K.LOCKS.wa_desk_safe,
      loot: "safe",
    });
    C.prop("first_aid", ox - 14.7, YL + 1.4, oz + 30, HP, {
      name: "Lobby First Aid",
      loot: "first_aid",
    });
    C.prop("fridge", ox + 6, YL, oz - 12.5, HP, {
      name: "Kitchen Refrigerator",
    });
    C.prop("file_cabinet", ox + 15.4, YL, oz - 19, -HP, {
      name: "Service Ledger Cabinet",
    });
    C.prop("ammo_box", ox + 5.5, YL, oz - 29, 0, {
      large: true,
      name: "Continuity Ammo Crate",
      loot: "continuity_crate",
    });
    C.prop("crate", ox + 9, YL, oz - 54.5, 0.3, {
      kind: "army",
      name: "Continuity Supply Crate",
      loot: "continuity_crate",
      container: true,
    });
    C.prop("footlocker", ox + 14.2, YL + 5.5, oz - 34, -HP, {
      name: "Balcony Footlocker",
      loot: "footlocker",
    });
    C.prop("footlocker", SX + 11, SY0, SZ - 14, PI, {
      name: "Exo-rig Spares",
      loot: "continuity_crate",
      locked: 0,
      lock: K.LOCKS.wa_spares,
    });
    C.prop("locker", SX + 0.6, SY0, SZ - 16, HP, {
      count: 3,
      name: "Continuity Locker",
      loot: "continuity",
    });
    C.prop("ammo_box", SX + 8, SY0, SZ - 14, 0, {
      large: true,
      name: "Gyrojet Rocket Crate",
      items: [
        ["ammo_gyrojet", 40],
        ["riot_gas_grenade", 2],
      ],
    });
    C.prop("safe", SX + 31.6, SY0 + 1.0, SZ - 27, -HP, {
      wall: true,
      name: "Major Vale's Safe",
      locked: 0,
      lock: K.LOCKS.wa_vale_safe,
      items: [
        ["scrip", 350],
        ["continuity_officer_cap", 1],
        ["exo_rig_mk3_helmet", 1],
        ["q_pmid_wa_codes", 1],
      ],
    });
    C.prop("first_aid", SX + 0.6, SY0 + 1.4, SZ - 26, HP, {
      name: "Field Medkit",
      loot: "first_aid",
    });
    // Continuity auto-turrets: one guarding the command room from the stair hall, one on the ballroom stage
    C.prop("turret", SX + 18.5, SY0, SZ + 5.5, PI * 0.75, {
      continuity: true,
      faction: "continuity",
      hostile: true,
      group: "pmid_wa_turrets",
      hp: 90,
      damage: 6,
      range: 26,
    });
    C.prop("turret", ox + 5.5, YL + 1.2, oz - 57.5, 0, {
      continuity: true,
      faction: "continuity",
      hostile: true,
      group: "pmid_wa_turrets",
      hp: 90,
      damage: 6,
      range: 30,
    });
    // hazard: the radio room's overloaded jammer bus bars arc behind the consoles
    K.hazard({
      x: SX + 29.8,
      y: SY0 + 1.2,
      z: SZ - 1,
      r: 1.1,
      dps: 12,
      kind: "shock",
      every: 0.8,
    });
    // terminals
    C.terminal("pmid_wa_command", SX + 26, SY0 + 0.77, SZ - 3.3, -HP, "bare");
    C.terminal("pmid_wa_major", SX + 21.2, SY0 + 0.8, SZ - 25.5, PI, "bare");
    C.terminal(
      "pmid_wa_frontdesk",
      ox + 11.5,
      YL + 1.2,
      oz + 18.5,
      -HP,
      "bare",
    );
    // skeleton vignettes (FO-style storytelling)
    C.prop("skeleton", ox + 3.8, YL, oz - 18, -HP, { pose: "sitting" }); // bartender slumped behind the bar
    C.prop("skeleton", ox - 3.6, YL, oz + 19.8, 0.4, { pose: "reaching" }); // reaching for the clock
    C.prop("skeleton", ox - 9, YL, oz - 44.5, 0.2, { pose: "seated" }); // gala guests
    C.prop("skeleton", ox + 3, YL, oz - 38.6, -2.5, { pose: "seated" });
    C.prop("skeleton", ox - 3, YL, oz - 49.2, 1.2, { pose: "lying" });
    C.prop("skeleton", ox + 12.5, YL, oz + 30.5, PI, { pose: "curled" }); // behind the reception desk
    C.prop("skeleton", SX + 23.8, SY0, SZ - 26.6, 0, { pose: "lying" }); // a old-world Secret Service man still in the study
    // notes & tape reels
    C.note("pmid_wa_gala_menu", ox - 3.2, YL + 0.78, oz - 44.5, {
      name: "Winter Gala Menu",
      title: "The Waldorf-Astoria — Winter Gala Breakfast, March 5th, 1967",
      text: "THE WALDORF-ASTORIA\nWinter Gala Breakfast in Honour of the Civil Defense Board of Directors\nSunday, March the Fifth, 1967, at Nine O\'Clock\n\n— Oeufs Bénédictine\n— Terrine of Pack oxen-Fed Veal (Imported from California!)\n— Lobster Thermidor, Atomic Style\n— The Waldorf Salad (the original, since 1896)\n— Fizzo Cola Sorbet with Gold Leaf\n\nDancing to the Lester Kane Orchestra from 10:00 A.M.\nGuests are kindly reminded that civil defence drills will NOT interrupt the champagne course.",
    });
    C.note("pmid_wa_bellhop", ox + 12.8, YL + 1.23, oz + 25, {
      name: "Bellhop's Note",
      title: "Note left on the front desk",
      text: "Mr. Garrity —\nThe gentlemen from Suite 35-A (the ones with the black cars and no luggage) say the Towers staircase is 'off limits to civilian staff, effective immediately'. They also took the master keys, the switchboard, and Mrs. Hopkins' radio.\nI said we'd have to bill them. The tall one laughed. I don't think they're from the State Department.\n— Eddie, Bell Captain\n\nP.S. Front desk safe is 1-9-3-1, same as ever.",
      learn: "pmid_wa_desk_safe",
    });
    C.tape("pmid_wa_log1", ox + 11.2, YL + 0.95, oz - 4.6, {
      name: "Continuity Tape reel: Kitchen Duty",
      title: "Continuity field log — Pvt. Oduya",
      text: "[Recording]\nDay 41 at the hotel. They have us boiling giant roach in a kitchen built for three thousand covers. Sergeant says the Major wants 'morale'. Morale is a sorbet machine that still works.\nThe jammer on the roof hums all night. You can hear the Radio City DJ trying to punch through — the Major calls it 'the frequency problem'.\nI hum along with him when nobody's listening. Don't tell the Major.\n[End of recording]",
    });
    C.tape("pmid_wa_log2", SX + 23.5, SY0 + 0.82, SZ - 25.2, {
      name: "Major Vale's Orders",
      title: "Operation PARK AVENUE — orders of the day",
      text: "[Recording — Major Constance Vale, Continuity Forward Command, Suite 35-A]\nPriority one: maintain the jamming screen on 97.3. The settlers at Grand Central must not organise around that disc jockey.\nPriority two: retrieve the Kessler-Haas material from the Bellevue sub-basement. The Brutes took the east wards. I want the K-agent stock intact and the 'Resilience' data on my desk. No survivors, no witnesses.\nPriority three: the Covenant at Rockefeller is not to be engaged until Liberty Station says so.\nPersonal: my teletype word is ROUGHRIDER. If you are not me, stop listening.\nGod bless the Continuity, and God bless America. Vale out.",
      learn: "pmid_wa_major",
    });
    C.pickup("rally_tonic", 2, SX + 8.2, SY0 + 0.86, SZ - 0.8);
    C.pickup("pmid_wa_dray_card", 1, SX + 7.4, SY0 + 0.86, SZ - 1.0); // Lt. Dray's signals card: password for the command terminal
    C.pickup("fizzo_cola", 1, ox + 7.2, YL + 1.23, oz - 16);
    C.pickup("whiskey", 1, ox + 3.7, YL + 1.2, oz - 20.5);
    C.pickup("ammo_gyrojet", 12, ox + 9.4, YL + 0.3, oz - 53.8);
    C.bobble("CHA", SX + 22.6, SY0 + 0.84, SZ - 25.4);
  }

  // ------------------------------------------------------------------
  K.defineSite("waldorf", 10, function () {
    art();
    const rec = K.record("waldorf", "waldorf");
    const ext = buildExterior(rec);
    const I = buildInterior(rec);
    // doors
    K.door(rec, {
      id: "pmid_wa_front",
      pos: ext.doorPos,
      label: "Waldorf-Astoria",
      verb: "Enter",
      target: I.arrival,
      onEnter: () => {
        K.discover("waldorf");
        if (K.startDeadAir) K.startDeadAir();
      },
    });
    K.door(rec, {
      id: "pmid_wa_exit",
      pos: I.exitPos,
      label: "Park Avenue",
      verb: "Exit to",
      target: ext.outside,
    });
    K.door(rec, {
      id: "pmid_wa_towers",
      pos: I.towersDoor,
      label: "Towers Staircase — 35th Floor",
      verb: "Climb",
      target: I.suiteArrival,
    });
    K.door(rec, {
      id: "pmid_wa_towers_down",
      pos: I.suiteStairDoor,
      label: "Towers Staircase — Grand Ballroom",
      verb: "Descend",
      target: I.towersTarget,
    });
    // one-way: the service car is parked on 35 until the player rides it down once (not a lock)
    const lower = K.barDoor(
      K.door(rec, {
        id: "pmid_wa_svc_low",
        pos: I.svcLowerDoor,
        label: "Service Elevator — 35th Floor",
        verb: "Ride",
        target: I.svcUpperArrival,
      }),
      {
        lockText: "Called from the 35th floor only",
        message:
          "The service car is parked on the 35th floor. The call button is dead.",
      },
    );
    K.door(rec, {
      id: "pmid_wa_svc_up",
      pos: I.svcUpperDoor,
      label: "Service Elevator — Kitchen",
      verb: "Ride",
      target: I.svcLowerArrival,
      onEnter: () => {
        if (lower && lower.unbar) lower.unbar(true);
      },
    });
    content(rec, I);
  });
})();
