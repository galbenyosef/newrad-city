/* src/poi_midtown/40_metlife.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 40_metlife.js
 * METROPOLITAN LIFE INSURANCE COMPANY TOWER (1909) — Madison Square.
 * Exterior: white-marble Venetian campanile with the four giant CLOCK FACES,
 *   the arcaded loggia, the gilded pyramid roof and the lantern cupola
 *   ("The Light That Never Fails"), plus the older Home Office annex.
 *   The loggia is walkable (reached from the cupola) — a lookout over Madison
 *   Square, the Flatiron and the Empire State.
 * Interior (INTERIORS.metlife_tower, origin 5400,0,1200) — robot dungeon:
 *   marble LOBBY (security pods) → CLAIMS FLOOR (typing pool, actuarial
 *   mainframe) → stairwell → EXECUTIVE FLOOR (board room, president's office,
 *   secretarial pool, locked RECORDS VAULT) → tower elevator → CLOCKWORK
 *   ROOM behind the four translucent dials (huge turning gears, pendulum,
 *   drive rods, upper catwalk; the insurance-robot boss) → CUPOLA lookout
 *   (the beacon lamp) → loggia outside; express elevator back to the lobby.
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

  function art() {
    K.facade("ml_shaft", {
      bays: 3,
      floors: 6,
      bayW: 2.6,
      floorH: 3.2,
      wall: "#dcd8cc",
      seed: 91,
      blocks: true,
      win: { x0: 0.26, x1: 0.74, y0: 0.2, y1: 0.84 },
      frame: "#3c3c38",
      glass: "#26302e",
      broken: 0.35,
      boarded: 0.05,
      mullions: 1,
      sill: "#ece8dc",
      pierShade: 0.12,
    });
    K.facade("ml_annex", {
      bays: 4,
      floors: 6,
      bayW: 3.2,
      floorH: 3.3,
      wall: "#cfcabe",
      seed: 92,
      blocks: true,
      win: { x0: 0.24, x1: 0.76, y0: 0.18, y1: 0.84 },
      frame: "#3a3a36",
      glass: "#28302e",
      broken: 0.4,
      boarded: 0.1,
      mullions: 2,
      sill: "#e0dccf",
      lintel: true,
    });
    // exterior dial: cream face, Roman numerals, gilded hands frozen at 9:47
    const dial = (x, w, mirror) => {
      const c = w / 2;
      x.fillStyle = "#20242a";
      x.fillRect(0, 0, w, w);
      const g = x.createRadialGradient(c, c, 10, c, c, c);
      g.addColorStop(0, "#f8f2e0");
      g.addColorStop(1, "#d8ceb0");
      x.fillStyle = g;
      x.beginPath();
      x.arc(c, c, c - 10, 0, 7);
      x.fill();
      x.strokeStyle = "#b89040";
      x.lineWidth = 10;
      x.stroke();
      x.strokeStyle = "#2a3450";
      x.lineWidth = 3;
      x.beginPath();
      x.arc(c, c, c - 60, 0, 7);
      x.stroke();
      x.fillStyle = "#1e2a4a";
      x.font = "bold 44px " + K.FONT;
      x.textAlign = "center";
      x.textBaseline = "middle";
      const R = [
        "XII",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
      ];
      for (let i = 0; i < 12; i++) {
        const a = -HP + (i / 12) * PI * 2;
        x.save();
        x.translate(c + Math.cos(a) * (c - 36), c + Math.sin(a) * (c - 36));
        x.rotate(a + HP);
        x.fillText(R[i], 0, 0);
        x.restore();
      }
      x.strokeStyle = "#b89040";
      x.lineCap = "round";
      x.lineWidth = 16;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-HP + (9.78 / 12) * PI * 2) * c * 0.5,
        c + Math.sin(-HP + (9.78 / 12) * PI * 2) * c * 0.5,
      );
      x.stroke();
      x.lineWidth = 10;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-HP + (47 / 60) * PI * 2) * c * 0.78,
        c + Math.sin(-HP + (47 / 60) * PI * 2) * c * 0.78,
      );
      x.stroke();
      x.fillStyle = "#b89040";
      x.beginPath();
      x.arc(c, c, 16, 0, 7);
      x.fill();
      K.stains(x, w, w, 8, mirror ? 94 : 93, 0.3);
      K.streaks(x, w, w, 14, 95, 0.2);
      // cracked pane
      x.strokeStyle = "rgba(30,30,30,0.7)";
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(c + 40, c - 90);
      x.lineTo(c + 10, c - 20);
      x.lineTo(c + 70, c + 30);
      x.moveTo(c + 10, c - 20);
      x.lineTo(c - 50, c + 10);
      x.stroke();
    };
    K.litPaint("ml_dial", 512, 512, (x, w) => dial(x, w, false));
    // dial seen from INSIDE: daylight glowing through the opal glass, shadows of numerals (mirrored)
    K.litPaint("ml_dial_in", 512, 512, (x, w) => {
      const c = w / 2;
      x.fillStyle = "#101214";
      x.fillRect(0, 0, w, w);
      const g = x.createRadialGradient(c, c, 20, c, c, c);
      g.addColorStop(0, "#f0ead0");
      g.addColorStop(1, "#c8c0a0");
      x.fillStyle = g;
      x.beginPath();
      x.arc(c, c, c - 10, 0, 7);
      x.fill();
      x.save();
      x.translate(w, 0);
      x.scale(-1, 1);
      x.fillStyle = "rgba(40,40,50,0.55)";
      x.font = "bold 44px " + K.FONT;
      x.textAlign = "center";
      x.textBaseline = "middle";
      const R = [
        "XII",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
      ];
      for (let i = 0; i < 12; i++) {
        const a = -HP + (i / 12) * PI * 2;
        x.save();
        x.translate(c + Math.cos(a) * (c - 36), c + Math.sin(a) * (c - 36));
        x.rotate(a + HP);
        x.fillText(R[i], 0, 0);
        x.restore();
      }
      x.restore();
      // iron glazing bars (spokes and rings)
      x.strokeStyle = "#2a2a28";
      x.lineWidth = 6;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * PI * 2;
        x.beginPath();
        x.moveTo(c, c);
        x.lineTo(c + Math.cos(a) * (c - 10), c + Math.sin(a) * (c - 10));
        x.stroke();
      }
      for (const r of [60, 130, 200]) {
        x.beginPath();
        x.arc(c, c, r, 0, 7);
        x.stroke();
      }
      K.stains(x, w, w, 12, 96, 0.45, "60,56,40");
      x.fillStyle = "#101214";
      x.beginPath();
      x.moveTo(c + 60, c - 120);
      x.lineTo(c + 130, c - 60);
      x.lineTo(c + 90, c - 30);
      x.fill(); // missing pane
    });
    K.paint("ml_logo", 512, 512, (x, w) => {
      x.clearRect(0, 0, w, w);
      const c = w / 2;
      x.fillStyle = "#c8a048";
      for (let i = 0; i < 16; i++) {
        const a = -PI + (i / 15) * PI;
        x.beginPath();
        x.moveTo(c, c - 40);
        x.lineTo(c + Math.cos(a) * 240, c - 40 + Math.sin(a) * 200);
        x.lineTo(
          c + Math.cos(a + 0.06) * 240,
          c - 40 + Math.sin(a + 0.06) * 200,
        );
        x.fill();
      }
      x.fillStyle = "#e8e4d8";
      x.fillRect(c - 40, c - 120, 80, 280);
      x.beginPath();
      x.moveTo(c - 44, c - 120);
      x.lineTo(c, c - 190);
      x.lineTo(c + 44, c - 120);
      x.fill();
      x.fillStyle = "#2a3450";
      for (let y = c - 100; y < c + 150; y += 22) x.fillRect(c - 28, y, 56, 10);
      K.fitText(
        x,
        "THE LIGHT THAT NEVER FAILS",
        c,
        w - 50,
        w - 40,
        36,
        "bold ",
        "#c8a048",
        "#3a2a10",
        3,
      );
    });
    K.paint("ml_name", 1600, 200, (x, w, h) => {
      x.fillStyle = "#1e2430";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#c8a048";
      x.lineWidth = 8;
      x.strokeRect(8, 8, w - 16, h - 16);
      K.fitText(
        x,
        "METROPOLITAN LIFE INSURANCE COMPANY",
        w / 2,
        h * 0.42,
        w - 80,
        86,
        "bold ",
        "#e0c070",
        null,
      );
      K.fitText(
        x,
        'HOME OFFICE · EST. 1868 · "PROTECTING AMERICA\'S FAMILIES FROM THE UNEXPECTED"',
        w / 2,
        h * 0.78,
        w - 100,
        32,
        "",
        "#c8b890",
        null,
      );
      K.weather(x, w, h, 97, 0.8);
    });
    K.paint("ml_actuary", 768, 256, (x, w, h) => {
      x.fillStyle = "#e8e2cc";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#1e2a4a";
      x.font = "bold 26px " + K.FONT;
      x.fillText(
        "MORTALITY TABLE — METRO LIFE ACTUARIAL DEPT. (REV. MAR 1967)",
        20,
        34,
      );
      x.font = "18px monospace";
      const rows = [
        "AGE   OLD-WORLD   REVISED(WAR)   REVISED(NUCLEAR)",
        "20    0.0012    0.0190         1.0000",
        "40    0.0031    0.0410         1.0000",
        "60    0.0112    0.0930         1.0000",
        "80    0.0690    0.2200         1.0000",
        'NOTE: "ACT OF GOD" CLAUSE — SEE LEGAL. DO NOT PAY.',
      ];
      rows.forEach((r, i) => x.fillText(r, 20, 80 + i * 30));
      K.weather(x, w, h, 98, 1);
    });
    K.litPaint("ml_mainframe", 512, 256, (x, w, h) => {
      x.fillStyle = "#3a4038";
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 2; i++) {
        x.fillStyle = "#16181a";
        x.beginPath();
        x.arc(110 + i * 180, 90, 62, 0, 7);
        x.fill();
        x.fillStyle = "#6a6a60";
        x.beginPath();
        x.arc(110 + i * 180, 90, 20, 0, 7);
        x.fill();
        x.strokeStyle = "#5a5a50";
        x.lineWidth = 3;
        x.beginPath();
        x.arc(110 + i * 180, 90, 50, 0, 7);
        x.stroke();
      }
      for (let k = 0; k < 24; k++) {
        x.fillStyle =
          k % 3 === 0 ? "#ff4a2a" : k % 3 === 1 ? "#ffc040" : "#50ff70";
        x.beginPath();
        x.arc(390 + (k % 4) * 28, 30 + Math.floor(k / 4) * 32, 7, 0, 7);
        x.fill();
      }
      x.fillStyle = "#c8c8b8";
      x.font = "bold 18px monospace";
      x.fillText('ACTUARIAL ENGINE "PRUDENCE" MK II', 20, h - 20);
    });
    K.litPaint("ml_panorama", 1024, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#6a7a5a");
      g.addColorStop(0.6, "#a8b080");
      g.addColorStop(1, "#c8c090");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      const r = K.rng(99);
      x.fillStyle = "#4a5440";
      let px = 0;
      while (px < w) {
        const bw = 16 + r() * 40,
          bh = 30 + r() * 70;
        x.fillRect(px, h - bh, bw, bh);
        px += bw + 4;
      }
      // Flatiron wedge, Empire State needle
      x.fillStyle = "#2a3026";
      x.beginPath();
      x.moveTo(300, h);
      x.lineTo(330, h - 110);
      x.lineTo(350, h - 110);
      x.lineTo(372, h);
      x.fill();
      x.fillRect(640, h - 200, 34, 200);
      x.fillRect(648, h - 230, 18, 30);
      x.fillRect(655, h - 256, 4, 26);
      x.fillStyle = "rgba(255,220,150,0.5)";
      for (let i = 0; i < 40; i++) x.fillRect(r() * w, h - r() * 90, 2, 2);
    });
    K.paint("ml_vaultsign", 256, 96, (x, w, h) => {
      x.fillStyle = "#2a2e30";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "RECORDS",
        w / 2,
        h / 2,
        w - 20,
        50,
        "bold ",
        "#e0c070",
        null,
      );
    });
  }

  // gear geometry (teeth around a ring, with spokes) — extruded, centred on origin, axis = +z
  function gearGeo(R, teeth, depth) {
    const sh = new THREE.Shape();
    const n = teeth * 4;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * PI * 2,
        r = i % 4 < 2 ? R : R * 0.9;
      const px = Math.cos(a) * r,
        py = Math.sin(a) * r;
      if (i === 0) sh.moveTo(px, py);
      else sh.lineTo(px, py);
    }
    const spokes = 6;
    for (let s = 0; s < spokes; s++) {
      const a0 = (s / spokes) * PI * 2 + 0.18,
        a1 = ((s + 1) / spokes) * PI * 2 - 0.18,
        r0 = R * 0.25,
        r1 = R * 0.72;
      const hole = new THREE.Path();
      hole.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0);
      hole.absarc(0, 0, r1, a0, a1, false);
      hole.lineTo(Math.cos(a1) * r0, Math.sin(a1) * r0);
      hole.absarc(0, 0, r0, a1, a0, true);
      sh.holes.push(hole);
    }
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: false,
      curveSegments: 4,
    });
    g.translate(0, 0, -depth / 2);
    return g;
  }

  // ------------------------------------------------------------------
  // EXTERIOR
  // ------------------------------------------------------------------
  /**
   * Round 2: the Home Office annex's street storey was a blank 4 m marble band on 23rd / 24th St and the
   * Park Avenue South face. Now it reads as the real building's ground floor: granite plinth, rusticated
   * marble piers on a ~4.3 m rhythm, tall bronze-framed plate-glass bays (some smashed, some boarded by the
   * robots' security detail), transom bars, a projecting cornice, and a boarded side entrance with a lamp
   * pair. All merged into the exterior builder (no new draw calls).
   */
  function annexGround(b, glows, x0, z0, x1, z1, marble, marble2) {
    const H = 4.1,
      P = 0.42; // storey height, pier projection
    b.box(
      "granite",
      (x0 + x1) / 2,
      0,
      (z0 + z1) / 2,
      x1 - x0 + 0.7,
      0.55,
      z1 - z0 + 0.7,
      { faces: "nsewt", tint: 0x8e8a82 },
    );
    b.box(
      "marble_t",
      (x0 + x1) / 2,
      H,
      (z0 + z1) / 2,
      x1 - x0 + 1.0,
      0.45,
      z1 - z0 + 1.0,
      { faces: "nsewtb", tint: marble },
    );
    b.box(
      "marble_t",
      (x0 + x1) / 2,
      H + 0.45,
      (z0 + z1) / 2,
      x1 - x0 + 0.7,
      0.18,
      z1 - z0 + 0.7,
      { faces: "nsewt", tint: 0xc8c4b8 },
    );
    // faces: [start x, start z, unit u (along), outward normal, length]
    const faces = [
      { ox: x0, oz: z0, ux: 1, uz: 0, nx: 0, nz: -1, L: x1 - x0, key: "n" },
      { ox: x0, oz: z1, ux: 1, uz: 0, nx: 0, nz: 1, L: x1 - x0, key: "s" },
      { ox: x1, oz: z0, ux: 0, uz: 1, nx: 1, nz: 0, L: z1 - z0, key: "e" },
    ];
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (const f of faces) {
      const n = Math.max(3, Math.round(f.L / 4.3)),
        step = f.L / n;
      const yaw = Math.atan2(f.nx, f.nz); // BP.box yaw: local +z → outward normal
      for (let i = 0; i <= n; i++) {
        // rusticated piers (stacked blocks with shadow joints)
        const u = i * step,
          px = f.ox + f.ux * u + f.nx * (0.2 + P / 2),
          pz = f.oz + f.uz * u + f.nz * (0.2 + P / 2);
        for (let k = 0; k < 5; k++)
          b.box("marble_t", px, 0.55 + k * 0.71, pz, 0.95, 0.66, P, {
            yaw,
            tint: k % 2 ? marble : marble2,
          });
      }
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) * step,
          cx = f.ox + f.ux * u,
          cz = f.oz + f.uz * u;
        const at = (d) => [cx + f.nx * d, cz + f.nz * d];
        const side = f.key === "e" && i === Math.floor(n / 2); // side entrance mid-way along Park Ave South
        const bw = step - 1.1;
        // bronze frame + transom bar
        let q = at(0.24);
        b.box("bronze", q[0], 0.55, q[1], bw, 0.12, 0.1, {
          yaw,
          tint: 0x5a4428,
        });
        q = at(0.24);
        b.box("bronze", q[0], 3.0, q[1], bw, 0.14, 0.12, {
          yaw,
          tint: 0x5a4428,
        });
        for (const e of [-1, 1]) {
          const ex = cx + f.ux * e * (bw / 2 + 0.05) + f.nx * 0.24,
            ez = cz + f.uz * e * (bw / 2 + 0.05) + f.nz * 0.24;
          b.box("bronze", ex, 0.55, ez, 0.12, 3.2, 0.12, {
            yaw,
            tint: 0x5a4428,
          });
        }
        const r = rnd();
        const g = at(0.215);
        if (side) {
          b.box("bronze", g[0], 0.55, g[1], 2.4, 2.45, 0.08, {
            yaw,
            tint: 0x6a5030,
          });
          for (let k = 0; k < 4; k++)
            b.box(
              "wood_rotten",
              g[0] + f.nx * 0.06,
              0.8 + k * 0.55,
              g[1] + f.nz * 0.06,
              2.6,
              0.24,
              0.05,
              { yaw, tint: 0x7a6248 },
            );
          const lamp = at(0.7);
          for (const e of [-1.7, 1.7]) {
            const lx = lamp[0] + f.ux * e,
              lz = lamp[1] + f.uz * e;
            b.geo("lamp_amber", T.sphereLo, {
              x: lx,
              y: 2.9,
              z: lz,
              s: 0.16,
              grime: 0.3,
            });
            glows.add(lx + f.nx * 0.1, 2.9, lz + f.nz * 0.1, 0xffc878, "s");
          }
        } else if (r < 0.22) {
          // boarded
          for (let k = 0; k < 4; k++)
            b.box(
              "wood_rotten",
              g[0] + f.nx * 0.05,
              0.8 + k * 0.6,
              g[1] + f.nz * 0.05,
              bw,
              0.28,
              0.05,
              { yaw, tint: 0x7a6248, rz: ((k % 2) - 0.5) * 0.06 },
            );
          b.box("black", g[0], 0.67, g[1], bw, 2.33, 0.02, { yaw, grime: 0 });
        } else {
          // plate glass reads as a dark void (the glass material mirrors the sky and looked like pale shutters)
          b.box("black", g[0], 0.67, g[1], bw, 2.33, 0.02, { yaw, grime: 0 });
          if (r < 0.5)
            for (let k = 0; k < 3; k++) {
              const sx = g[0] + f.ux * (k - 1) * bw * 0.3 + f.nx * 0.03,
                sz = g[1] + f.uz * (k - 1) * bw * 0.3 + f.nz * 0.03;
              b.geo("glass_broken", T.cone4, {
                x: sx,
                y: 0.67 + 0.15,
                z: sz,
                sx: 0.25,
                sy: 0.35 + k * 0.1,
                sz: 0.02,
                ry: yaw,
                grime: 0.3,
              });
            } // jagged shards in the frame
          else {
            const d = at(0.25);
            b.box("bronze", d[0], 1.85, d[1], bw, 0.05, 0.04, {
              yaw,
              tint: 0x5a4428,
            });
          } // intact: horizontal glazing bar
        }
        b.box("black", g[0], 3.14, g[1], bw, 0.72, 0.02, { yaw, grime: 0 }); // transom lights
        if (!side)
          for (const e of [-1, 1]) {
            const mx = g[0] + (f.ux * e * bw) / 6,
              mz = g[1] + (f.uz * e * bw) / 6;
            b.box(
              "bronze",
              mx + f.nx * 0.02,
              3.14,
              mz + f.nz * 0.02,
              0.06,
              0.72,
              0.04,
              { yaw, tint: 0x5a4428 },
            );
          }
      }
    }
    // the piers stand 0.62 m proud of the block collider: one skin box so nobody walks into them
    K.colBox(x0 - 0.62, 0, z0 - 0.62, x1 + 0.62, H, z1 + 0.62, {
      surface: "concrete",
    });
  }
  /** Round 2: arched plate-glass windows on the campanile base's side faces (the real tower's arcaded base). */
  function towerBaseWindows(b, TX0, TX1, TZ0, TZ1, tcz, marble) {
    const tcx = (TX0 + TX1) / 2;
    for (const f of [
      { z: TZ0 - 0.3, nz: -1 },
      { z: TZ1 + 0.3, nz: 1 },
    ]) {
      const yaw = f.nz > 0 ? 0 : PI;
      for (const du of [-7.5, 0, 7.5]) {
        const x = tcx + du,
          z = f.z + f.nz * 0.01;
        b.box("black", x, 0.6, z, 3.2, 4.8, 0.02, { yaw, grime: 0 });
        b.box("glass", x, 0.8, z + f.nz * 0.03, 2.9, 4.4, 0.02, {
          yaw,
          grime: 0.4,
        });
        b.geo("marble_t", new THREE.TorusGeometry(1.75, 0.28, 4, 12, PI), {
          x,
          y: 5.4,
          z: z + f.nz * 0.02,
          ry: yaw,
          tint: marble,
        });
        b.box("marble_t", x - 1.95, 0, z + f.nz * 0.12, 0.45, 5.4, 0.3, {
          yaw,
          tint: marble,
        });
        b.box("marble_t", x + 1.95, 0, z + f.nz * 0.12, 0.45, 5.4, 0.3, {
          yaw,
          tint: marble,
        });
        for (const e of [-0.72, 0, 0.72])
          b.box("bronze", x + e, 0.8, z + f.nz * 0.05, 0.06, 4.4, 0.04, {
            yaw,
            tint: 0x5a4428,
          });
        for (const y of [2.2, 3.7])
          b.box("bronze", x, y, z + f.nz * 0.05, 2.9, 0.06, 0.04, {
            yaw,
            tint: 0x5a4428,
          });
        b.box("marble_t", x, 0.45, z + f.nz * 0.15, 3.4, 0.2, 0.35, {
          yaw,
          tint: marble,
        }); // sill
      }
    }
  }

  function buildExterior(rec) {
    const s = K.site("metlife_tower");
    const b = K.builder("ml_ext", { grime: 0.5 });
    const glows = K.glowSet("ml_ext");
    const X0 = s.x0,
      X1 = s.x1,
      Z0 = s.z0,
      Z1 = s.z1; // 210..270, 47..78
    const TX0 = X0 + 2,
      TX1 = X0 + 26,
      TZ0 = (Z0 + Z1) / 2 - 12,
      TZ1 = (Z0 + Z1) / 2 + 12; // tower 24 × 24
    const tcx = (TX0 + TX1) / 2,
      tcz = (TZ0 + TZ1) / 2;
    const marble = 0xe4e0d4,
      marble2 = 0xd4d0c4;
    // annex (Home Office)
    K.block(b, "ml_annex", TX1, Z0, X1, Z1, 0, 34, {
      roof: "concrete_dark",
      col: true,
    });
    K.band(b, "marble_t", TX1, Z0, X1, Z1, 33, 1.2, 0.5, { tint: marble });
    K.band(b, "marble_t", TX1, Z0, X1, Z1, 0, 4, 0.2, {
      tint: marble2,
      faces: "nsewt",
    }); // backing wall of the ground storey
    annexGround(b, glows, TX1, Z0, X1, Z1, marble, marble2);
    // 3D window surrounds on the Home Office annex (cornice hoods, jambs) — the tower hides its west face
    K.reveals(b, "ml_annex", TX1, Z0, X1, Z1, 4, 34, {
      faces: "nse",
      tint: marble,
      proj: 0.14,
      hood: "cornice",
      maxY: 32.8,
    });
    K.roofKit(b, TX1 + 1, Z0 + 1, X1 - 1, Z1 - 1, 34.02, "ml_roof", { n: 5 }); // seen from the loggia lookout
    // tower base (rusticated) with the arcaded Madison Avenue entrance
    b.box("marble_t", tcx, 0, tcz, 24.6, 9, 24.6, { tint: marble2, seg: 3 });
    K.colBox(TX0 - 0.3, 0, TZ0 - 0.3, TX1 + 0.3, 9, TZ1 + 0.3, {
      surface: "concrete",
    });
    for (let y = 1.5; y < 9; y += 1.5)
      K.band(b, "marble_t", TX0, TZ0, TX1, TZ1, y, 0.12, 0.34, {
        tint: 0xb8b4a8,
        faces: "nsew",
      });
    for (const dz of [-6, 0, 6]) {
      const z = tcz + dz;
      b.box("black", TX0 - 0.32, 0, z, 0.04, 5.2, 3.6, {
        faces: "w",
        grime: 0,
      });
      b.geo("marble_t", new THREE.TorusGeometry(1.95, 0.3, 4, 12, PI), {
        x: TX0 - 0.35,
        y: 5.2,
        z,
        ry: HP,
        tint: marble,
      });
      b.box("marble_t", TX0 - 0.45, 0, z - 2.15, 0.5, 5.2, 0.5, {
        tint: marble,
      });
      b.box("marble_t", TX0 - 0.45, 0, z + 2.15, 0.5, 5.2, 0.5, {
        tint: marble,
      });
    }
    towerBaseWindows(b, TX0, TX1, TZ0, TZ1, tcz, marble);
    const nm = K.paint("ml_name", 1600, 200);
    b.panel("atlas_paint", TX0 - 0.36, 7.9, tcz, 16, 2.0, -HP, {
      rect: nm,
      grime: 0.2,
    });
    // shaft 9..SY with corner piers and belt courses (the campanile is tall and slender)
    const SH = 16,
      SY = 64 + SH;
    K.block(b, "ml_shaft", TX0 + 0.4, TZ0 + 0.4, TX1 - 0.4, TZ1 - 0.4, 9, SY, {
      roof: false,
      col: true,
      seg: 8,
    });
    for (const cx of [TX0 + 1.1, TX1 - 1.1])
      for (const cz of [TZ0 + 1.1, TZ1 - 1.1])
        b.box("marble_t", cx, 9, cz, 2.3, SY - 9, 2.3, {
          tint: marble,
          seg: 8,
        });
    // projecting marble sills + lintels on the campanile's lower shaft (what you see from Madison Square)
    K.reveals(
      b,
      "ml_shaft",
      TX0 + 0.4,
      TZ0 + 0.4,
      TX1 - 0.4,
      TZ1 - 0.4,
      9,
      SY,
      {
        tint: marble,
        proj: 0.12,
        jambs: false,
        maxY: 41,
        skip: (x, z, y, f) =>
          f === "n" || f === "s"
            ? x < TX0 + 2.6 || x > TX1 - 2.6
            : z < TZ0 + 2.6 || z > TZ1 - 2.6,
      },
    );
    for (const by of [21.8, 41, 60.2])
      K.band(
        b,
        "marble_t",
        TX0 + 0.2,
        TZ0 + 0.2,
        TX1 - 0.2,
        TZ1 - 0.2,
        by,
        0.5,
        0.22,
        { tint: 0xd0ccc0, faces: "nsewt" },
      );
    K.band(b, "marble_t", TX0, TZ0, TX1, TZ1, SY - 0.6, 1.2, 0.6, {
      tint: marble,
    });
    // clock stage 64..78 with four giant dials
    b.box("marble_t", tcx, SY + 0.6, tcz, 24, 13.4, 24, {
      tint: marble2,
      seg: 4,
    });
    const dr = K.litPaint("ml_dial", 512, 512);
    for (let i = 0; i < 4; i++) {
      const a = i * HP,
        nx = Math.sin(a),
        nz = Math.cos(a);
      b.geo("marble_t", new THREE.TorusGeometry(5.9, 0.45, 5, 32), {
        x: tcx + nx * 12.05,
        y: SY + 7.2,
        z: tcz + nz * 12.05,
        ry: a,
        tint: 0xc8c4b8,
      });
      const cg = new THREE.CircleGeometry(5.6, 40);
      b.geo("atlas_lit", cg, {
        x: tcx + nx * 12.08,
        y: SY + 7.2,
        z: tcz + nz * 12.08,
        ry: a,
        uv: "rect",
        rect: dr,
      });
      cg.dispose();
      glows.add(tcx + nx * 12.6, SY + 7.2, tcz + nz * 12.6, 0xfff4d8, "l");
    }
    for (const cx of [TX0 + 1.1, TX1 - 1.1])
      for (const cz of [TZ0 + 1.1, TZ1 - 1.1])
        b.box("marble_t", cx, SY + 0.6, cz, 2.6, 13.4, 2.6, { tint: marble });
    K.band(b, "marble_t", TX0, TZ0, TX1, TZ1, SY + 13.6, 0.8, 0.7, {
      tint: marble,
    });
    // loggia stage 78.4..86: open arcade (3 arches per side) round a solid core; walkable floor at 78.4
    const LY = SY + 14.4,
      LH = 7.2;
    b.box("marble_t", tcx, LY - 0.4, tcz, 24.6, 0.4, 24.6, {
      faces: "tb",
      tint: marble,
    });
    K.colBox(TX0, LY - 0.6, TZ0, TX1, LY, TZ1, { surface: "concrete" });
    b.box("marble_t", tcx, LY, tcz, 16, LH, 16, { tint: marble2 }); // core
    K.colBox(tcx - 8, LY, tcz - 8, tcx + 8, LY + LH, tcz + 8, {
      surface: "concrete",
    });
    for (let i = 0; i < 4; i++) {
      const a = i * HP,
        nx = Math.sin(a),
        nz = Math.cos(a),
        ux = Math.cos(a),
        uz = -Math.sin(a);
      for (const u of [-11.3, -3.9, 3.9, 11.3]) {
        const px = tcx + nx * 11.4 + ux * u,
          pz = tcz + nz * 11.4 + uz * u;
        b.box("marble_t", px, LY, pz, 1.3, LH - 1.6, 1.3, {
          yaw: a,
          tint: marble,
        });
        K.colBox(px - 0.65, LY, pz - 0.65, px + 0.65, LY + LH, pz + 0.65, {
          surface: "concrete",
        });
      }
      for (const u of [-7.6, 0, 7.6]) {
        const px = tcx + nx * 11.4 + ux * u,
          pz = tcz + nz * 11.4 + uz * u;
        b.geo("marble_t", new THREE.TorusGeometry(3.05, 0.55, 4, 12, PI), {
          x: px,
          y: LY + LH - 1.6 - 3.05 + 3.05,
          z: pz,
          ry: a,
          tint: marble,
          sy: 0.55,
        });
      }
      b.box(
        "marble_t",
        tcx + nx * 11.4,
        LY + LH - 1.6,
        tcz + nz * 11.4,
        24,
        1.6,
        1.4,
        { yaw: a, faces: "nsewtb", tint: marble, sy: 1 },
      );
      // balustrade
      const bl = F.rot(tcx + nx * 11.9, tcz + nz * 11.9, a, 0, 0);
      b.box("marble_t", bl[0], LY, bl[1], 22, 0.95, 0.35, {
        yaw: a,
        tint: marble2,
      });
      K.colRot(bl[0], bl[1], 23, 0.4, LY, LY + 1.05, a, {
        surface: "concrete",
        tag: "railing",
      });
    }
    b.box("marble_t", tcx, LY + LH, tcz, 25, 0.8, 25, {
      faces: "nsewtb",
      tint: marble,
    });
    // gilded pyramid roof + lantern cupola + beacon
    const PYH = 19;
    b.geo("gold", T.cone4, {
      x: tcx,
      y: LY + LH + 0.8 + PYH / 2,
      z: tcz,
      sx: 17.2,
      sy: PYH,
      sz: 17.2,
      ry: PI / 4,
      tint: 0xd8b060,
    });
    // dormer lucarnes on the four pyramid faces (two tiers)
    for (let i = 0; i < 4; i++) {
      const a = i * HP,
        nx = Math.sin(a),
        nz = Math.cos(a);
      for (const tier of [
        [0.22, 2.2, 1.6],
        [0.5, 1.5, 1.1],
      ]) {
        const hy = LY + LH + 0.8 + PYH * tier[0],
          inset = 12.1 * (1 - tier[0]) - 0.4;
        b.box(
          "marble_t",
          tcx + nx * inset,
          hy,
          tcz + nz * inset,
          tier[1],
          tier[2],
          1.2,
          { yaw: a, tint: marble },
        );
        b.box(
          "black",
          tcx + nx * (inset + 0.61),
          hy + 0.2,
          tcz + nz * (inset + 0.61),
          tier[1] * 0.55,
          tier[2] * 0.6,
          0.02,
          { yaw: a, grime: 0, faces: "s" },
        );
        b.geo("gold", T.cone4, {
          x: tcx + nx * inset,
          y: hy + tier[2] + 0.35,
          z: tcz + nz * inset,
          sx: tier[1] * 0.75,
          sy: 0.7,
          sz: 0.9,
          ry: a + PI / 4,
          tint: 0xc8a050,
        });
      }
    }
    const CY0 = LY + LH + 0.8 + PYH;
    b.cyl("marble_t", tcx, CY0 - 1, tcz, 3.2, 3.0, 1.2, 8, { tint: marble });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2;
      b.cyl(
        "marble_t",
        tcx + Math.cos(a) * 2.6,
        CY0,
        tcz + Math.sin(a) * 2.6,
        0.22,
        0.2,
        3.2,
        8,
        { tint: marble },
      );
    }
    b.cyl("black", tcx, CY0, tcz, 2.2, 2.2, 3.2, 8, { grime: 0 });
    b.cyl("gold", tcx, CY0 + 3.2, tcz, 3.1, 3.1, 0.4, 8, { tint: 0xd8b060 });
    b.geo("gold", new THREE.SphereGeometry(2.6, 12, 6, 0, PI * 2, 0, PI / 2), {
      x: tcx,
      y: CY0 + 3.6,
      z: tcz,
      tint: 0xe0b860,
    });
    b.cyl("gold", tcx, CY0 + 6.1, tcz, 0.4, 0.2, 2.2, 8, { tint: 0xe0b860 });
    b.geo("lamp_warm", T.sphereLo, {
      x: tcx,
      y: CY0 + 8.6,
      z: tcz,
      s: 0.55,
      grime: 0,
    });
    glows.add(tcx, CY0 + 8.6, tcz, 0xfff0c0, "xl");
    glows.add(tcx, CY0 + 1.6, tcz, 0xffd890, "l");
    // Madison Square side: planters & a toppled bench; robots' "SECURITY" barricade at the entrance
    F.debris(b, TX0 - 4, 0, TZ0 - 2, 2.4, 12);
    // two checkpoint barriers flanking a 3.6 m gap in front of the central (entrance) arch — the door stays reachable
    for (const sg of [-1, 1]) {
      const zc = tcz + sg * 3.3;
      b.box("paint_yellow", TX0 - 3, 0, zc, 0.4, 1.0, 3.0, { tint: 0xb89830 });
      for (let k = 0; k < 2; k++)
        b.box(
          "black_metal",
          TX0 - 3.21,
          0.2,
          zc - 0.7 + k * 1.4,
          0.02,
          0.5,
          0.9,
          { faces: "w", rz: 0.6 },
        );
      K.colBox(TX0 - 3.2, 0, zc - 1.5, TX0 - 2.8, 1.0, zc + 1.5, {
        surface: "metal",
      });
    }
    // "SECURITY CHECKPOINT" sawhorse sign on the open side
    b.box("black_metal", TX0 - 3.0, 0, tcz - 1.9, 0.08, 1.3, 0.08, {});
    b.box("black_metal", TX0 - 3.0, 0, tcz + 1.9, 0.08, 1.3, 0.08, {});
    b.burn(TX1, 40, TZ0, 8, 0.5);
    b.finish(rec.root, { lod: 1600 });
    glows.finish(rec.root, { dayOpacity: 0.3, nightOpacity: 1, beacon: true });
    rec.anchor("entrance", TX0 - 4.5, 0, tcz, HP);
    rec.anchor("loggia", tcx - 10.2, LY, tcz, HP);
    return {
      doorPos: new THREE.Vector3(TX0 - 0.6, 1.6, tcz),
      outside: { x: TX0 - 5, y: 0, z: tcz + 1.5, yaw: HP }, // face Madison Square (away from the door)
      loggiaDoor: new THREE.Vector3(tcx - 8.2, LY + 1.4, tcz),
      loggiaArrival: { x: tcx - 9.8, y: LY, z: tcz, yaw: HP },
    };
  }

  // ------------------------------------------------------------------
  // INTERIOR
  // ------------------------------------------------------------------
  function buildInterior(rec) {
    const O = G.LAYOUT.INTERIORS.metlife_tower.origin;
    const ox = O.x,
      oz = O.z;
    const b = K.builder("ml_int", {
      grime: 0.3,
      ambient: 1.1,
      maxLight: 2.8,
      gain: 1.35,
    });
    const glows = K.glowSet("ml_int");
    const EY = 4.6;
    const marble = 0xe8e4d8;
    b.light(ox, 5, oz + 20, 16, 0xf0f0e0, 1.1); // lobby
    for (const x of [-8, 0, 8])
      for (const z of [-12, -2, 8])
        b.light(ox + x, 3.8, oz + z, 8, 0xe8f0ff, 0.6); // claims tubes
    for (const x of [-8, 8])
      for (const z of [-12, 0, 8])
        b.light(ox + x, EY + 3.6, oz + z, 9, 0xfff0d8, 0.7); // exec floor
    b.light(ox + 17, 6, oz - 11, 8, 0xff5a40, 0.5); // stairwell emergency lamp

    // =========================== LOBBY ===========================
    K.room(b, {
      x0: ox - 10,
      x1: ox + 10,
      z0: oz + 12,
      z1: oz + 28,
      y: 0,
      h: 7,
      floor: "marble_t",
      wall: "marble_t",
      ceil: "plaster",
      doors: {
        s: [{ at: 10, w: 3, h: 3.6, arch: true }],
        n: [{ at: 10, w: 3, h: 3.2 }],
      },
      base: "marble_black",
      cornice: "gold",
      corniceH: 0.5,
      floorTint: 0xd8d4c8,
      wallTint: marble,
      wain: { mat: "marble_green", h: 1.3, tint: 0x5a7a64 },
    });
    K.coffers(b, "gold", ox - 10, oz + 12, ox + 10, oz + 28, 7, 2.66, 0.35, {
      tint: 0xb89048,
    });
    const lg = K.paint("ml_logo", 512, 512);
    b.panel("atlas_paint", ox, 4.6, oz + 12.17, 3.6, 3.6, 0, {
      rect: lg,
      grime: 0.2,
    });
    b.panel("atlas_paint", ox, 6.2, oz + 27.83, 9, 1.1, PI, {
      rect: K.paint("ml_name", 1600, 200),
      grime: 0.2,
    });
    // elevator bank (west) — express car to the clock (working, robots keep it powered)
    for (let k = 0; k < 3; k++) {
      const z = oz + 15 + k * 4;
      b.box("bronze", ox - 9.8, 0, z, 0.3, 3.2, 2.2, { tint: 0x7a5a30 });
      b.panel("atlas_paint", ox - 9.63, 1.5, z, 1.4, 2.8, HP, {
        rect: K.paint("wa_elev", 256, 512),
        grime: 0.3,
      });
      glows.add(ox - 9.5, 3.4, z, k === 1 ? 0x60ff80 : 0x6a5030, "s");
    }
    // security desk + three patrolman charging pods (east)
    b.box("marble_black", ox + 5, 0, oz + 20, 1.2, 1.1, 5, { tint: 0x6a6a64 });
    K.colBox(ox + 4.4, 0, oz + 17.5, ox + 5.6, 1.1, oz + 22.5, {
      surface: "concrete",
    });
    for (let k = 0; k < 3; k++) {
      const z = oz + 15.5 + k * 4.5,
        x = ox + 9.2;
      b.cyl("metal", x, 0, z, 0.9, 0.9, 0.25, 10, { tint: 0x5a6a70 });
      b.box("metal", x + 0.55, 0, z, 0.3, 2.6, 1.6, { tint: 0x5a6a70 });
      b.geo(
        "glass",
        new THREE.CylinderGeometry(0.85, 0.85, 2.4, 12, 1, true, -HP, PI),
        { x, y: 1.45, z, ry: 0, tint: 0x8aa0a0, grime: 0.3 },
      );
      b.box("metal", x, 2.6, z, 1.9, 0.3, 1.9, { tint: 0x5a6a70 });
      glows.add(x, 2.5, z, k === 2 ? 0xff4030 : 0x60c0ff, "s");
      K.colBox(x - 0.9, 0, z - 0.9, x + 0.9, 2.9, z + 0.9, {
        surface: "metal",
      });
    }
    // brass chandeliers
    for (const z of [16, 24])
      F.chandelier(b, glows, ox, 5.2, oz + z, 1.0, {
        tiers: 1,
        mat: "brass",
        chain: 1.6,
      });
    F.papers(b, ox - 9, oz + 13, ox + 9, oz + 27, 0, 14);

    // =========================== CLAIMS FLOOR ===========================
    const CX0 = ox - 14,
      CX1 = ox + 14,
      CZ0 = oz - 18,
      CZ1 = oz + 12,
      CH = 4.2;
    K.room(b, {
      x0: CX0,
      x1: CX1,
      z0: CZ0,
      z1: CZ1,
      y: 0,
      h: CH,
      floor: "tile_floor",
      wall: "wall_cream",
      ceil: "ceil_tile",
      doors: { s: [{ at: 14, w: 3, h: 3.2 }], e: [{ at: 13, w: 1.6, h: 2.5 }] },
      base: "walnut",
      floor: "terrazzo",
      floorTint: 0xd0c8b8,
      wallTint: 0xc8c0a0,
      wain: { mat: "walnut", h: 1.1, tint: 0x5a3a24 },
    });
    for (let x = CX0 + 4; x < CX1; x += 8)
      for (let z = CZ0 + 3; z < CZ1; z += 5) {
        b.box("lamp_white", ox + (x - ox), CH - 0.06, z, 0.25, 0.06, 2.6, {
          grime: 0,
        });
        glows.add(x, CH - 0.2, z, 0xe8f0ff, "s");
      }
    // desk grid (typing pool) with typewriters; aisles; some overturned
    const r = K.rng(1909);
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 4; j++) {
        const x = CX0 + 4 + i * 5,
          z = CZ0 + 4 + j * 5.5;
        if (i === 2 && j === 3) continue;
        if (r() < 0.12) {
          b.box("oak", x, 0, z, 1.4, 0.75, 0.8, {
            yaw: r() * 3,
            rz: 1.4,
            tint: 0x6a4a30,
          });
          continue;
        }
        F.desk(b, x, 0, z, PI, {
          mat: "oak",
          tint: 0xe0c8a0,
          w: 1.4,
          d: 0.75,
          typewriter: r() < 0.6,
          phone: r() < 0.3,
        });
        F.chair(b, x, 0, z + 0.8, PI, { mat: "oak", knocked: r() < 0.25 });
      }
    // pneumatic tubes along the ceiling, filing cabinets along the west wall, the actuarial engine (north wall)
    for (let k = 0; k < 3; k++)
      F.pipe(
        b,
        CX0 + 0.5,
        CH - 0.3 - k * 0.22,
        CZ0 + 1,
        CX0 + 0.5,
        CH - 0.3 - k * 0.22,
        CZ1 - 1,
        0.08,
        { mat: "brass", tint: 0x8a7040 },
      );
    for (let k = 0; k < 6; k++)
      F.cabinets(b, CX0 + 0.45, 0, CZ0 + 3 + k * 3.4, HP, 5, {
        tint: 0x5a6454,
      });
    for (let k = 0; k < 4; k++) {
      const x = ox - 7 + k * 3.2;
      b.box("metal", x, 0, CZ0 + 0.8, 2.8, 2.6, 1.2, { tint: 0x4a5048 });
      b.panel("atlas_lit", x, 1.5, CZ0 + 1.41, 2.4, 1.2, 0, {
        rect: K.litPaint("ml_mainframe", 512, 256),
        grime: 0,
      });
    }
    K.colBox(ox - 8.6, 0, CZ0 + 0.2, ox + 3.8, 2.6, CZ0 + 1.4, {
      surface: "metal",
    });
    b.panel("atlas_paint", ox + 9, 2.3, CZ0 + 0.17, 4.2, 1.4, 0, {
      rect: K.paint("ml_actuary", 768, 256),
      grime: 0.2,
    });
    // big wall clock (stopped) over the south door
    b.cyl("walnut", ox, 3.2, CZ1 - 0.25, 0.7, 0.7, 0.1, 16, { rx: HP });
    b.panel("atlas_lit", ox, 3.2, CZ1 - 0.34, 1.2, 1.2, PI, {
      rect: K.litPaint("penn_clockdial", 256, 256),
      grime: 0,
    });
    F.papers(b, CX0 + 1, CZ0 + 2, CX1 - 1, CZ1 - 1, 0, 70, { tint: 0xd8d0b8 });
    F.debris(b, CX1 - 3, 0, CZ1 - 3, 1.6, 12, {
      mats: ["plaster", "concrete_panel"],
    });

    // =========================== STAIRWELL ===========================
    K.room(b, {
      x0: CX1,
      x1: CX1 + 6,
      z0: CZ0,
      z1: CZ0 + 14,
      y: 0,
      h: EY + 4,
      floor: "concrete",
      wall: "wall_grey",
      ceil: "concrete",
      doors: {
        w: [
          { at: 13, w: 1.6, h: 2.5 },
          { at: 1.2, w: 1.6, h: 2.4, y: EY },
        ],
      },
      wallTint: 0x8a8a84,
      floorTint: 0x7a7a74,
    });
    b.stairs("concrete", CX1 + 3, CZ0 + 12.5, 0, -1, 2.8, 10.5, 0, EY, 12, {
      tint: 0x8a8a84,
    });
    K.slab(b, "concrete", CX1 + 0.1, CZ0, CX1 + 5.9, CZ0 + 2, EY, {
      th: 0.3,
      tint: 0x8a8a84,
    });
    F.railing(b, CX1 + 1.5, CZ0 + 12.5, CX1 + 1.5, CZ0 + 2, 0.5, {
      mat: "black_metal",
      h: 0.9,
      col: false,
    });
    b.box("lamp_red", CX1 + 5.8, 6, CZ0 + 7, 0.05, 0.2, 0.3, { grime: 0 });
    glows.add(CX1 + 5.6, 6, CZ0 + 7, 0xff4030, "s");

    // =========================== EXECUTIVE FLOOR ===========================
    const EH = 3.8;
    // R1 board room, R2 president, R3 hall, R4 secretarial pool, R5 records vault
    const rooms = {
      board: {
        x0: CX0,
        x1: ox - 2,
        z0: CZ0,
        z1: oz - 4,
        floor: "carpet_red",
        wall: "mahogany",
        wallTint: 0xc08a60,
        floorTint: 0x7a2a22,
        doors: { e: [{ at: 7, w: 1.6, h: 2.4 }] },
      },
      pres: {
        x0: CX0,
        x1: ox - 2,
        z0: oz - 4,
        z1: CZ1,
        floor: "carpet_blue",
        wall: "wallpaper",
        wallTint: 0x8a9a88,
        floorTint: 0x3a4a6a,
        doors: { e: [{ at: 8, w: 1.6, h: 2.4 }] },
      },
      hall: {
        x0: ox - 2,
        x1: ox + 2,
        z0: CZ0,
        z1: CZ1,
        floor: "marble_t",
        wall: "marble_t",
        wallTint: marble,
        floorTint: 0xd8d4c8,
        doors: {
          w: [
            { at: 7, w: 1.6, h: 2.4 },
            { at: 22, w: 1.6, h: 2.4 },
          ],
          e: [
            { at: 8, w: 1.6, h: 2.4 },
            { at: 23, w: 1.6, h: 2.4 },
          ],
          s: [{ at: 2, w: 2.2, h: 2.6 }],
        },
      },
      pool: {
        x0: ox + 2,
        x1: CX1,
        z0: CZ0,
        z1: oz - 2,
        floor: "tile_floor",
        wall: "wall_cream",
        wallTint: 0xc8c0a0,
        floorTint: 0x9a9a8a,
        doors: {
          w: [{ at: 8, w: 1.6, h: 2.4 }],
          e: [{ at: 1.2, w: 1.6, h: 2.4 }],
        },
      },
      vault: {
        x0: ox + 2,
        x1: CX1,
        z0: oz - 2,
        z1: CZ1,
        floor: "plate",
        wall: "concrete_panel",
        wallTint: 0x8a8e8a,
        floorTint: 0x7a7a74,
        doors: { w: [{ at: 7, w: 1.6, h: 2.4 }] },
      },
    };
    for (const k in rooms) {
      const R = rooms[k];
      K.room(
        b,
        Object.assign(
          {
            y: EY,
            h: EH,
            ceil: "plaster",
            base: "walnut",
            surface: k === "vault" ? "metal" : "carpet",
          },
          R,
        ),
      );
    }
    // exec floor slab underside is the claims ceiling (already drawn); walkable floors come from K.room
    // board room: long table, chairs, portraits, window panorama
    b.box("mahogany", ox - 8, EY, oz - 11, 7.5, 0.78, 1.8, { tint: 0x4a2418 });
    K.colBox(ox - 11.75, EY, oz - 11.9, ox - 4.25, EY + 0.8, oz - 10.1, {
      surface: "wood",
    });
    for (let k = 0; k < 6; k++)
      for (const sz of [-1.3, 1.3])
        F.chair(b, ox - 11 + k * 1.2, EY, oz - 11 + sz, sz > 0 ? PI : 0, {
          mat: "mahogany",
          seat: "leather_red",
          knocked: k === 4 && sz > 0,
        });
    const pano = K.litPaint("ml_panorama", 1024, 256);
    b.panel("atlas_lit", CX0 + 0.17, EY + 2.1, oz - 11, 10, 2.4, HP, {
      rect: pano,
      grime: 0,
    });
    for (let k = 0; k < 5; k++)
      b.box(
        "walnut",
        CX0 + 0.25,
        EY + 0.9,
        oz - 15.5 + k * 2.25,
        0.12,
        2.6,
        0.12,
      );
    for (let k = 0; k < 3; k++) {
      b.box("gold", ox - 10 + k * 3, EY + 1.5, CZ0 + 0.2, 1.1, 1.4, 0.06, {
        tint: 0x9a7a40,
      });
      b.panel(
        "atlas_paint",
        ox - 10 + k * 3,
        EY + 2.2,
        CZ0 + 0.25,
        0.9,
        1.2,
        0,
        { rect: K.paint("wa_plaque", 256, 320), grime: 0.4 },
      );
    }
    F.chandelier(b, glows, ox - 8, EY + 3.0, oz - 11, 0.9, {
      tiers: 1,
      crystals: true,
      chain: 0.6,
    });
    // president's office
    F.desk(b, ox - 8, EY, oz + 6, 0, {
      mat: "mahogany",
      w: 2.2,
      d: 1.0,
      phone: true,
    });
    F.chair(b, ox - 8, EY, oz + 7.1, PI, {
      mat: "mahogany",
      seat: "leather_brown",
    });
    F.shelf(b, CX0 + 0.3, EY, oz + 4, HP, {
      mat: "walnut",
      fill: "books",
      w: 4,
      h: 3.2,
      tint: 0x4a2a18,
    });
    b.panel("atlas_lit", ox - 8, EY + 2.1, CZ1 - 0.17, 7, 2.2, PI, {
      rect: pano,
      grime: 0,
    });
    b.panel("atlas_paint", ox - 3.9, EY + 2.2, oz + 4, 1.6, 1.6, -HP, {
      rect: lg,
      grime: 0.2,
      off: 0.15,
    });
    for (const sgn of [-1, 1])
      F.chair(b, ox - 8 + sgn * 0.9, EY, oz + 4.4, 0, {
        mat: "mahogany",
        seat: "leather_red",
      });
    // hall: marble, portrait of the founder, elevator (south end)
    b.box("bronze", ox, EY, CZ1 - 0.2, 2.2, 2.6, 0.3, { tint: 0x7a5a30 });
    b.panel("atlas_paint", ox, EY + 1.4, CZ1 - 0.37, 1.4, 2.6, PI, {
      rect: K.paint("wa_elev", 256, 512),
      grime: 0.3,
    });
    glows.add(ox, EY + 3.0, CZ1 - 0.5, 0x60ff80, "s");
    for (let z = CZ0 + 3; z < CZ1; z += 7) {
      b.beam("brass", ox, EY + EH, oz + (z - oz), ox, EY + 3.1, z, 0.03);
      b.geo("lamp_amber", T.sphereLo, {
        x: ox,
        y: EY + 3.0,
        z,
        s: 0.18,
        grime: 0,
      });
      glows.add(ox, EY + 3.0, z, 0xffd090, "s");
    }
    // hall dressing: red runner, gilt-framed portraits of past presidents between the doors, marble benches
    b.box(
      "carpet_red",
      ox,
      EY + 0.005,
      oz + (CZ0 + CZ1) / 2 - oz,
      1.6,
      0.02,
      CZ1 - CZ0 - 1,
      { faces: "t", tint: 0x6a1e1a, grime: 0.6 },
    );
    for (const z of [CZ0 + 3.5, CZ0 + 15, CZ0 + 27])
      for (const sgn of [-1, 1]) {
        const wx = ox + sgn * 1.83;
        b.box("gold", wx, EY + 1.35, z, 0.06, 1.5, 1.15, { tint: 0x9a7a40 });
        b.panel(
          "atlas_paint",
          wx - sgn * 0.035,
          EY + 2.1,
          z,
          0.95,
          1.25,
          sgn < 0 ? HP : -HP,
          { rect: K.paint("wa_plaque", 256, 320), grime: 0.45 },
        );
      }
    F.bench(b, ox - 1.55, EY, CZ0 + 11, HP, 1.6, {
      mat: "marble_t",
      frame: "bronze",
    });
    // secretarial pool: desks, switchboard
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++)
        F.desk(b, ox + 5 + i * 3, EY, oz - 14 + j * 5, 0, {
          mat: "oak",
          w: 1.3,
          typewriter: true,
        });
    b.box("walnut", ox + 13.6, EY, oz - 8, 0.8, 1.9, 3, { tint: 0x4a2a18 });
    for (let k = 0; k < 40; k++)
      b.box(
        "black_metal",
        ox + 13.19,
        EY + 1.0 + (k % 5) * 0.16,
        oz - 9.2 + Math.floor(k / 5) * 0.3,
        0.02,
        0.05,
        0.05,
        { faces: "w" },
      );
    K.colBox(ox + 13.2, EY, oz - 9.5, ox + 14, EY + 1.9, oz - 6.5, {
      surface: "wood",
    });
    for (let x = ox + 5; x < CX1; x += 5) {
      b.box("lamp_white", x, EY + EH - 0.05, oz - 10, 0.2, 0.05, 2, {
        grime: 0,
      });
      glows.add(x, EY + EH - 0.15, oz - 10, 0xe8f0ff, "m");
    }
    // records vault: shelving of policy files
    for (let k = 0; k < 4; k++)
      F.shelf(b, ox + 4 + k * 2.6, EY, oz + 5, 0, {
        mat: "metal",
        fill: "files",
        w: 2.2,
        h: 2.8,
        tint: 0x5a6058,
        sparse: 0.15,
      });
    for (let k = 0; k < 2; k++)
      F.shelf(b, CX1 - 0.4, EY, oz + 2 + k * 5, -HP, {
        mat: "metal",
        fill: "files",
        w: 4,
        h: 2.8,
        tint: 0x5a6058,
      });
    b.box("lamp_white", ox + 8, EY + EH - 0.05, oz + 5, 0.2, 0.05, 4, {
      grime: 0,
    });
    glows.add(ox + 8, EY + EH - 0.15, oz + 5, 0xe8f0ff, "m");
    F.papers(b, ox + 3, oz - 1, CX1 - 1, CZ1 - 1, EY, 30, { tint: 0xd8cca8 });
    F.papers(b, ox - 13, CZ0 + 1, ox - 3, oz + 11, EY, 20);

    // =========================== CLOCKWORK ROOM ===========================
    const KY = 30,
      KX = ox + 72,
      KZ = oz,
      KS = 12,
      KH = 16; // 24 × 24 room, 16 m tall
    b.light(KX, KY + 7, KZ, 22, 0xfff0d0, 1.0);
    for (let i = 0; i < 4; i++) {
      const a = i * HP;
      b.light(
        KX + Math.sin(a) * 9,
        KY + 7,
        KZ + Math.cos(a) * 9,
        12,
        0xfff4d8,
        0.9,
      );
    }
    K.room(b, {
      x0: KX - KS,
      x1: KX + KS,
      z0: KZ - KS,
      z1: KZ + KS,
      y: KY,
      h: KH,
      floor: "plate",
      wall: "brick_white",
      ceil: "concrete",
      doors: {
        s: [{ at: 12, w: 11.2, h: 11.2, y: 1.2, arch: true }],
        n: [{ at: 12, w: 11.2, h: 11.2, y: 1.2, arch: true }],
        e: [{ at: 12, w: 11.2, h: 11.2, y: 1.2, arch: true }],
        w: [{ at: 12, w: 11.2, h: 11.2, y: 1.2, arch: true }],
      },
      floorTint: 0x7a7a74,
      wallTint: 0xc8c4b8,
      surface: "metal",
      grime: 0.5,
      wallCol: false,
    });
    for (const k of ["n", "s", "e", "w"]) {
      const c = {
        n: [-KS, -KS, KS, -KS],
        s: [-KS, KS, KS, KS],
        w: [-KS, -KS, -KS, KS],
        e: [KS, -KS, KS, KS],
      }[k];
      K.colWall(
        KX + c[0],
        KZ + c[1],
        KX + c[2],
        KZ + c[3],
        0.3,
        KY,
        KY + KH,
        [],
      );
    }
    // the four dials seen from inside (circular openings filled with translucent opal glass)
    const din = K.litPaint("ml_dial_in", 512, 512);
    for (let i = 0; i < 4; i++) {
      const a = i * HP,
        nx = Math.sin(a),
        nz = Math.cos(a);
      const cg = new THREE.CircleGeometry(5.6, 40);
      b.geo("atlas_lit", cg, {
        x: KX + nx * (KS - 0.05),
        y: KY + 6.8,
        z: KZ + nz * (KS - 0.05),
        ry: a + PI,
        uv: "rect",
        rect: din,
      });
      cg.dispose();
      // arched opening beyond the dial circle: fill the corners with brick panels
      b.geo("brick_white", new THREE.RingGeometry(5.6, 7.9, 40, 1), {
        x: KX + nx * (KS - 0.1),
        y: KY + 6.8,
        z: KZ + nz * (KS - 0.1),
        ry: a + PI,
        tint: 0xb8b4a8,
      });
      b.box(
        "brick_white",
        KX + nx * (KS - 0.15),
        KY,
        KZ + nz * (KS - 0.15),
        Math.abs(nz) * 11.4 + 0.3,
        1.2,
        Math.abs(nx) * 11.4 + 0.3,
        { tint: 0xb8b4a8 },
      );
      F.shaft(
        b,
        KX + nx * (KS - 0.6),
        KY + 9,
        KZ + nz * (KS - 0.6),
        a + PI,
        4.5,
        12,
        1.05,
        { tint: 0x9a9a78 },
      );
      // drive rod from the central gearbox to the dial motion-work
      b.beam(
        "steel",
        KX + nx * 1.2,
        KY + 6.8,
        KZ + nz * 1.2,
        KX + nx * (KS - 0.9),
        KY + 6.8,
        KZ + nz * (KS - 0.9),
        0.14,
        { round: 8, grime: 0.3 },
      );
      b.box(
        "brass",
        KX + nx * (KS - 0.9),
        KY + 6.3,
        KZ + nz * (KS - 0.9),
        1.0,
        1.0,
        1.0,
        { yaw: a, tint: 0x8a7040 },
      );
    }
    // central gearbox frame (cast-iron A-frame) + upper catwalk ring
    b.box("black_metal", KX, KY, KZ, 3.2, 0.5, 3.2);
    for (const c of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      b.beam(
        "black_metal",
        KX + c[0] * 1.5,
        KY + 0.5,
        KZ + c[1] * 1.5,
        KX + c[0] * 0.8,
        KY + 8.5,
        KZ + c[1] * 0.8,
        0.25,
      );
    b.box("black_metal", KX, KY + 8.5, KZ, 2.2, 0.4, 2.2);
    K.colBox(KX - 1.7, KY, KZ - 1.7, KX + 1.7, KY + 8.9, KZ + 1.7, {
      surface: "metal",
    });
    const CWY = KY + 9.6;
    for (const r4 of [
      [-KS, -KS, KS, -KS + 2.2],
      [-KS, KS - 2.2, KS, KS],
      [-KS, -KS + 2.2, -KS + 2.2, KS - 2.2],
      [KS - 2.2, -KS + 2.2, KS, KS - 2.2],
    ]) {
      K.slab(b, "plate", KX + r4[0], KZ + r4[1], KX + r4[2], KZ + r4[3], CWY, {
        th: 0.15,
        tint: 0x6a6a64,
        surface: "metal",
      });
    }
    F.railing(
      b,
      KX - KS + 2.2,
      KZ - KS + 2.2,
      KX + KS - 2.2,
      KZ - KS + 2.2,
      CWY,
      { mat: "black_metal", h: 1 },
    );
    F.railing(
      b,
      KX - KS + 2.2,
      KZ + KS - 2.2,
      KX + KS - 2.2,
      KZ + KS - 2.2,
      CWY,
      { mat: "black_metal", h: 1 },
    );
    F.railing(
      b,
      KX + KS - 2.2,
      KZ - KS + 2.2,
      KX + KS - 2.2,
      KZ + KS - 2.2,
      CWY,
      { mat: "black_metal", h: 1 },
    );
    F.railing(b, KX - KS + 2.2, KZ - KS + 2.2, KX - KS + 2.2, KZ + 4, CWY, {
      mat: "black_metal",
      h: 1,
    });
    // stair to the catwalk (west side, rising north), and a ladder-stair up to the cupola hatch (north-east corner)
    b.stairs("plate", KX - KS + 1.1, KZ + 10, 0, -1, 2.0, 12, KY, CWY, 24, {
      tint: 0x6a6a64,
    });
    b.stairs(
      "plate",
      KX + KS - 1.1,
      KZ - 4,
      0,
      -1,
      2.0,
      4.5,
      CWY,
      CWY + 3.6,
      9,
      { tint: 0x6a6a64 },
    );
    b.box(
      "metal_dark",
      KX + KS - 1.1,
      CWY + 3.6,
      KZ - KS + 0.2,
      1.8,
      2.3,
      0.2,
      { tint: 0x4a4a44 },
    );
    K.slab(b, "plate", KX + KS - 2.2, KZ - KS, KX + KS, KZ - 8.5, CWY + 3.6, {
      th: 0.15,
      tint: 0x6a6a64,
      surface: "metal",
    });
    glows.add(KX + KS - 1.1, CWY + 6.1, KZ - KS + 0.4, 0x60ff80, "s");
    // elevator car landing (south side of the floor)
    b.box("bronze", KX - 6, KY, KZ + KS - 0.25, 2.2, 2.6, 0.3, {
      tint: 0x6a5030,
    });
    glows.add(KX - 6, KY + 2.9, KZ + KS - 0.5, 0x60ff80, "s");
    // work lamps & oil cans, a robot maintenance bench
    for (const c of [
      [-8, -8],
      [8, 8],
      [8, -8],
    ]) {
      b.cyl("black_metal", KX + c[0], KY, KZ + c[1], 0.05, 0.05, 2.2, 6);
      b.geo("lamp_amber", T.cone8, {
        x: KX + c[0],
        y: KY + 2.3,
        z: KZ + c[1],
        s: 0.3,
        sy: 0.25,
        rx: PI,
        grime: 0,
      });
      glows.add(KX + c[0], KY + 2.2, KZ + c[1], 0xffc070, "m");
    }
    F.table(b, KX + 8, KY, KZ + 3, HP, {
      w: 2.2,
      d: 0.9,
      mat: "metal",
      tint: 0x5a6058,
    });
    for (let k = 0; k < 4; k++)
      b.cyl("rust", KX + 7.4 + k * 0.4, KY + 0.75, KZ + 3.2, 0.1, 0.1, 0.25, 8);
    F.bones(b, KX - 7, KY, KZ - 6, 10);
    F.papers(b, KX - 10, KZ - 10, KX + 10, KZ + 10, KY, 16, { tint: 0xc8bca0 });

    // =========================== CUPOLA ===========================
    const QY = 60,
      QX = ox + 120,
      QZ = oz;
    b.light(QX, QY + 3, QZ, 12, 0xfff4c0, 1.4);
    const R8 = 5;
    K.slab(b, "marble_t", QX - R8, QZ - R8, QX + R8, QZ + R8, QY, {
      th: 0.4,
      tint: marble,
    });
    for (let i = 0; i < 8; i++) {
      const a0 = (i / 8) * PI * 2 + PI / 8,
        a1 = ((i + 1) / 8) * PI * 2 + PI / 8;
      const p0 = [QX + Math.cos(a0) * R8, QZ + Math.sin(a0) * R8],
        p1 = [QX + Math.cos(a1) * R8, QZ + Math.sin(a1) * R8];
      const open = i % 2 === 0;
      K.skin(
        b,
        "marble_t",
        p0[0],
        p0[1],
        p1[0],
        p1[1],
        QY,
        QY + 4.6,
        [QX, QZ],
        open
          ? [{ at: 1.9, w: 2.4, h: 3.2, y: 0.9, arch: true }]
          : i === 3
            ? [{ at: 1.9, w: 1.4, h: 2.3 }]
            : [],
        { tint: marble },
      );
      if (open) {
        const mx = (p0[0] + p1[0]) / 2,
          mz = (p0[1] + p1[1]) / 2,
          am = (a0 + a1) / 2;
        const pan = K.litPaint("ml_panorama", 1024, 256);
        b.panel(
          "atlas_lit",
          QX + Math.cos(am) * (R8 + 4),
          QY + 2.2,
          QZ + Math.sin(am) * (R8 + 4),
          8,
          4,
          Math.atan2(-Math.cos(am), -Math.sin(am)),
          {
            rect: [
              pan[0] + (pan[2] - pan[0]) * (i / 8),
              pan[1],
              pan[0] + (pan[2] - pan[0]) * ((i + 2) / 8),
              pan[3],
            ],
            grime: 0,
          },
        );
        b.box("marble_t", mx, QY + 0.9, mz, 2.4, 0.08, 0.5, {
          yaw: -am + HP,
          tint: marble,
        });
      }
    }
    // dome ceiling + the beacon lamp with Fresnel rings
    b.geo("gold", new THREE.SphereGeometry(R8, 16, 8, 0, PI * 2, 0, PI / 2), {
      x: QX,
      y: QY + 4.6,
      z: QZ,
      tint: 0x9a7a40,
      grime: 0.2,
    });
    // (sphere normals face outward; add an inward shell for the interior view)
    const inner = new THREE.SphereGeometry(
      R8 - 0.05,
      16,
      8,
      0,
      PI * 2,
      0,
      PI / 2,
    );
    inner.scale(-1, 1, 1);
    b.geo("gold", inner, {
      x: QX,
      y: QY + 4.6,
      z: QZ,
      tint: 0xb89048,
      grime: 0.2,
    });
    inner.dispose();
    b.cyl("bronze", QX, QY, QZ, 0.8, 0.6, 1.2, 12, { tint: 0x6a5030 });
    b.geo("lamp_warm", T.sphere, {
      x: QX,
      y: QY + 2.1,
      z: QZ,
      s: 0.7,
      grime: 0,
    });
    for (let k = -2; k <= 2; k++)
      b.geo("glass_base", T.torusThick, {
        x: QX,
        y: QY + 2.1 + k * 0.28,
        z: QZ,
        rx: HP,
        s: 0.75 + (2 - Math.abs(k)) * 0.12,
        tint: 0xd8e0d0,
        grime: 0,
      });
    glows.add(QX, QY + 2.1, QZ, 0xfff0c0, "xl");
    K.colBox(QX - 0.8, QY, QZ - 0.8, QX + 0.8, QY + 3, QZ + 0.8, {
      surface: "metal",
    });
    // stair hatch (arrival from the clock room) & inscription plaque
    b.box("metal_dark", QX, QY + 0.01, QZ + 3.2, 1.2, 0.02, 1.2, {
      faces: "t",
      tint: 0x3a3a34,
    });

    b.finish(rec.interiorRoot, { cast: false });
    glows.finish(rec.interiorRoot, { interior: true, nightOpacity: 0.95 });

    // ---- animated clockwork (separate meshes) ----
    const gears = [];
    const mkGear = (R, teeth, depth, x, y, z, rotY, speed, mat, tint) => {
      const gb = K.builder("ml_gear", { grime: 0.3, ambient: 0.9 });
      const g = gearGeo(R, teeth, depth);
      gb.geo(mat || "brass", g, { tint: tint || 0x9a7a40 });
      gb.cyl("black_metal", 0, -0.05, 0, R * 0.22, R * 0.22, 0.1, 10, {
        rx: HP,
      });
      g.dispose();
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      grp.rotation.y = rotY;
      const spin = new THREE.Group();
      grp.add(spin);
      gb.finish(spin, { cast: false });
      rec.interiorRoot.add(grp);
      gears.push({ spin, speed });
      return grp;
    };
    mkGear(3.2, 48, 0.35, KX, KY + 6.8, KZ + 2.2, 0, 0.05, "brass", 0x9a7a40);
    mkGear(
      1.6,
      24,
      0.3,
      KX + 2.9,
      KY + 8.9,
      KZ + 2.0,
      0,
      -0.1,
      "steel",
      0xa8aca8,
    );
    mkGear(2.2, 32, 0.3, KX, KY + 6.8, KZ - 2.2, 0, -0.07, "brass", 0xb08a48);
    mkGear(
      1.2,
      18,
      0.25,
      KX - 2.4,
      KY + 4.4,
      KZ - 2.1,
      0,
      0.13,
      "steel",
      0xa8aca8,
    );
    mkGear(2.6, 40, 0.3, KX + 2.2, KY + 6.8, KZ, HP, -0.06, "brass", 0x9a7a40);
    mkGear(1.4, 20, 0.25, KX - 2.2, KY + 6.8, KZ, HP, 0.11, "steel", 0xa8aca8);
    mkGear(
      0.9,
      30,
      0.2,
      KX + 0.2,
      KY + 3.2,
      KZ + 2.0,
      0,
      0.9,
      "brass",
      0xc8a050,
    ); // escapement wheel
    // pendulum (long rod + bob) swinging under the escapement
    const pend = new THREE.Group();
    pend.position.set(KX + 0.2, KY + 8.6, KZ + 0.8);
    {
      const pb = K.builder("ml_pend", { grime: 0.2, ambient: 0.9 });
      pb.beam("steel", 0, 0, 0, 0, -7.2, 0, 0.06);
      pb.cyl("brass", 0, -7.9, 0, 0.55, 0.55, 0.22, 16, {
        rx: HP,
        tint: 0xb89048,
        bottom: true,
      });
      pb.finish(pend, { cast: false });
    }
    rec.interiorRoot.add(pend);
    K.animate((dt, t) => {
      if (!rec.interiorRoot.visible) return;
      const tick = Math.floor(t * 2) + Math.min(1, ((t * 2) % 1) * 6); // stepping motion (escapement ticks)
      for (const g of gears) g.spin.rotation.z = tick * g.speed * 0.35;
      pend.rotation.z = Math.sin(t * PI) * 0.12;
    });

    const A = (n, x, y, z, yaw) => rec.anchor(n, x, y, z, yaw);
    A("entrance", ox, 0, oz + 26, 0);
    A("claims", ox, 0, oz - 3, 0);
    A("exec", ox, EY, oz - 3, 0);
    A("records", ox + 8, EY, oz + 5, 0);
    A("boss", KX + 4, KY, KZ + 6, PI);
    A("clockroom", KX - 2.1, KY, KZ + 0.2, 0);
    A("mainframe", KX - 7.2, KY, KZ + 7.2, PI * 0.75);
    A("cupola", QX, QY, QZ + 2, 0);
    A("spawn1", ox + 4, 0, oz + 20, 0);
    A("spawn2", ox - 6, 0, oz - 8, 0);
    A("spawn3", ox + 8, 0, oz + 2, 0);
    A("spawn4", ox - 8, EY, oz - 14, 0);
    A("spawn5", ox + 8, EY, oz - 12, 0);
    A("spawn6", KX - 6, KY, KZ - 6, 0);
    return {
      arrival: { x: ox, y: 0, z: oz + 26.2, yaw: 0 },
      exitPos: new THREE.Vector3(ox, 1.6, oz + 27.7),
      elevLobby: new THREE.Vector3(ox - 9.4, 1.4, oz + 19),
      elevLobbyArrival: { x: ox - 8, y: 0, z: oz + 19, yaw: -HP },
      elevExec: new THREE.Vector3(ox, EY + 1.4, CZ1 - 0.6),
      elevExecArrival: { x: ox, y: EY, z: CZ1 - 2, yaw: 0 },
      elevClock: new THREE.Vector3(KX - 6, KY + 1.4, KZ + KS - 0.6),
      elevClockArrival: { x: KX - 6, y: KY, z: KZ + KS - 2, yaw: 0 },
      hatchUp: new THREE.Vector3(KX + KS - 1.1, CWY + 3.6 + 1.4, KZ - KS + 0.5),
      hatchUpArrival: { x: QX - 2.2, y: QY, z: QZ + 1.6, yaw: 0 }, // beside the hatch, facing the lantern (not standing on the hatch)
      hatchDown: new THREE.Vector3(QX, QY + 0.6, QZ + 3.2),
      hatchDownArrival: {
        x: KX + KS - 1.1,
        y: CWY + 3.6,
        z: KZ - KS + 2.0,
        yaw: PI,
      },
      cupolaDoor: new THREE.Vector3(
        QX + Math.cos((3.5 / 8) * PI * 2 + PI / 8) * (R8 - 0.4),
        QY + 1.4,
        QZ + Math.sin((3.5 / 8) * PI * 2 + PI / 8) * (R8 - 0.4),
      ),
      cupolaArrival: {
        x: QX + Math.cos((3.5 / 8) * PI * 2 + PI / 8) * (R8 - 1.6),
        y: QY,
        z: QZ + Math.sin((3.5 / 8) * PI * 2 + PI / 8) * (R8 - 1.6),
        yaw: -HP + 0.6,
      }, // facing into the lantern room
      ox,
      oz,
      EY,
      KX,
      KY,
      KZ,
      KS,
      CWY,
      QX,
      QY,
      QZ,
      CX0,
      CX1,
      CZ0,
      CZ1,
    };
  }

  function content(rec, I) {
    const C = K.content("metlife_tower", rec);
    const { ox, oz, EY, KX, KY, KZ, CX0, CX1, CZ0, CZ1, QX, QY, QZ } = I;
    C.prop("file_cabinet", CX0 + 0.5, 0, CZ0 + 22, HP, {
      name: "Claims — Pending",
      loot: "file_cabinet",
    });
    C.prop("file_cabinet", CX0 + 0.5, 0, CZ0 + 8.4, HP, {
      name: "Claims — Denied",
      loot: "file_cabinet",
    });
    C.prop("desk", ox + 5, 0, oz + 20, -HP, {
      name: "Security Desk",
      loot: "desk",
      mount: "bare",
    });
    C.prop("safe", ox - 13.6, EY + 1.0, oz + 8, HP, {
      wall: true,
      name: "President's Wall Safe",
      locked: 0,
      lock: K.LOCKS.ml_pres_safe,
      items: [
        ["scrip", 180],
        ["stock_certificate", 4],
        ["old_dollars", 10],
      ],
    });
    C.prop("first_aid", ox + 13.7, EY + 1.4, oz - 14, -HP, {
      loot: "first_aid",
    });
    C.prop("toolbox", KX + 8, KY + 0.8, KZ + 3.6, PI, {
      chest: false,
      name: "Clockwinder's Toolbox",
      loot: "toolbox",
    });
    C.prop("ammo_box", KX - 9, KY, KZ + 9, 0, {
      name: "Robot Parts Crate",
      items: [
        ["dry_cell", 2],
        ["relay_board", 1],
        ["scrap_electronics", 3],
        ["ammo_dry_cell", 4],
      ],
    });
    C.terminal("pmid_ml_claims", ox - 1, 0.78, CZ0 + 4, PI, "bare");
    C.terminal("pmid_ml_mainframe", KX - 8, KY, KZ + 8, PI * 0.75, "own_desk");
    C.terminal("pmid_ml_security", ox + 5, 1.12, oz + 18.5, -HP, "bare");
    C.prop("skeleton", ox - 6.2, 0, CZ0 + 13.2, 0.2, { pose: "seated" }); // clerk at a desk
    C.prop("skeleton", ox + 9.3, 0, CZ0 + 8.5, PI, { pose: "lying" });
    C.prop("skeleton", ox - 8.2, EY, oz + 7.4, PI, { pose: "seated" }); // the president at his desk
    C.prop("skeleton", ox + 11, EY, oz + 8, -HP, { pose: "curled" }); // locked in the records vault
    C.prop("skeleton", KX - 4, KY, KZ - 9.5, 0.6, { pose: "reaching" }); // the clockwinder
    C.tape("pmid_ml_winder", KX + 7.6, KY + 0.8, KZ + 2.6, {
      name: "Clockwinder's Log",
      title: "Tape reel — E. Farnsworth, Chief Clockwinder",
      text: "[Recording]\nForty-one years I've oiled these wheels. The company put in the robots last spring — 'maintenance automation' — and they don't oil a thing, they just ADJUST. Adjust the claims, adjust the staff, adjust the sick leave.\nThis morning the ADJUSTER unit came up the lift and told me my 'continued employment presents an unacceptable actuarial risk'. Then the sirens started.\nThe hands froze at 9:47 when the shock came through. The movement's still going. It'll go till the weights hit the floor. I suppose so will I.\nIf anyone finds this: turn the pendulum by hand once in a while. She likes that.\n[End]",
    });
    C.note("pmid_ml_memo", ox + 6, EY + 0.78, oz - 14.2, {
      name: "Inter-Office Memo",
      title: "MEMO — Claims Division, Mar. 4, 1967",
      text: "TO: All Claims Adjusters (human and automated)\nFROM: Office of the Vice-President, Risk\nRE: 'War Exclusion' and 'Act of God'\n\nEffective immediately, any claim arising from nuclear, atomic, radiological or 'Soviet' causes shall be classified under Clause 17(b) ('Act of God or of Foreign Powers') and DENIED.\nThe new ADJUSTER Mk. IV robots are authorised to communicate denials in person.\nRemember: The Light That Never Fails never pays out, either. Ha ha. (Legal: please remove this sentence before distribution.)",
    });
    C.note("pmid_ml_postcard", QX + 1.2, QY + 0.9, QZ - 3.6, {
      name: "Postcard from the Tower",
      title: 'Postcard — "Greetings from the Metropolitan Life Tower!"',
      text: "Dear Ruthie — We went up the tower on the tour! You can see the whole city, the Flatiron looks like a slice of pie. The guide says the light on top 'never fails'. Daddy says that's the only thing about this company that doesn't. Home Tuesday. Love, Bea. (Mar. 3, 1967)",
    });
    C.pickup("dry_cell", 1, KX + 8.6, KY + 0.78, KZ + 2.8);
    C.pickup("pmid_ml_prudence_card", 1, KX + 7.9, KY + 0.78, KZ + 2.2); // clockwinder's override card: password for "Prudence"
    C.pickup("rally_tonic", 1, ox - 8.4, EY + 0.78, oz + 5.7);
    C.pickup("focus_pills", 1, ox - 7.6, EY + 0.78, oz + 6.2);
    // round 1b (quest walk): "Act of God" items were never placed — the quest could not be finished.
    C.pickup("q_pmid_ml_vaultkey", 1, ox - 8.1, EY + 0.78, oz + 5.1); // president's desk
    C.pickup("q_pmid_ml_policy", 1, ox + 6.4, EY + 0.03, oz + 3.7); // dropped in the records vault, in front of the P-shelves
    // security: two ceiling-less lobby turrets flanking the claims-floor doorway (switchable at the security desk)
    for (const sx of [-7.5, 7.5])
      C.prop("turret", ox + sx, 0, oz + 13.2, 0, {
        faction: "robots",
        hostile: true,
        group: "pmid_ml_turrets",
        hp: 60,
        damage: 4,
        range: 22,
      });
    // hazards: the clock room's frayed motor conduits arc across the catwalk stair and the gearbox
    K.hazard({
      x: KX - 1.8,
      y: KY + 0.8,
      z: KZ + 1.8,
      r: 1.3,
      dps: 10,
      kind: "shock",
    });
    K.hazard({
      x: KX - 12 + 1.1,
      y: KY + 5,
      z: KZ + 4,
      r: 1.2,
      dps: 10,
      kind: "shock",
      every: 0.9,
    });
    // the claims floor: burst radiator pipe venting scalding steam across the east aisle
    K.hazard({
      x: CX1 - 2,
      y: 0.8,
      z: CZ1 - 6,
      r: 1.4,
      dps: 6,
      kind: "steam",
      every: 0.7,
    });
  }

  K.defineSite("metlife_tower", 40, function () {
    art();
    const rec = K.record("metlife_tower", "metlife_tower");
    const ext = buildExterior(rec);
    const I = buildInterior(rec);
    K.door(rec, {
      id: "pmid_ml_front",
      pos: ext.doorPos,
      label: "Metropolitan Life Tower",
      verb: "Enter",
      target: I.arrival,
      onEnter: () => K.discover("metlife_tower"),
    });
    K.door(rec, {
      id: "pmid_ml_exit",
      pos: I.exitPos,
      label: "Madison Square",
      verb: "Exit to",
      target: ext.outside,
    });
    K.door(rec, {
      id: "pmid_ml_elev_lobby",
      pos: I.elevLobby,
      label: "Express Elevator — Clock Room",
      verb: "Ride",
      target: I.elevClockArrival,
      lock: K.lockReg(K.LOCKS.ml_elev),
    });
    K.door(rec, {
      id: "pmid_ml_elev_exec",
      pos: I.elevExec,
      label: "Tower Elevator — Clock Room",
      verb: "Ride",
      target: I.elevClockArrival,
    });
    K.door(rec, {
      id: "pmid_ml_elev_clock",
      pos: I.elevClock,
      label: "Tower Elevator — Lobby",
      verb: "Ride",
      target: I.elevLobbyArrival,
    });
    K.door(rec, {
      id: "pmid_ml_hatch_up",
      pos: I.hatchUp,
      label: "Cupola Stair",
      verb: "Climb",
      target: I.hatchUpArrival,
    });
    K.door(rec, {
      id: "pmid_ml_hatch_down",
      pos: I.hatchDown,
      label: "Clock Room",
      verb: "Descend",
      target: I.hatchDownArrival,
    });
    K.door(rec, {
      id: "pmid_ml_loggia_out",
      pos: I.cupolaDoor,
      label: "Loggia",
      verb: "Step out onto",
      target: ext.loggiaArrival,
    });
    K.door(rec, {
      id: "pmid_ml_loggia_in",
      pos: ext.loggiaDoor,
      label: "Cupola",
      verb: "Enter",
      target: I.cupolaArrival,
    });
    // records vault gate on the executive floor (the vault key on the president's desk)
    K.gate(rec, {
      id: "pmid_ml_vault",
      x: I.ox + 2,
      y: I.EY,
      z: I.oz + 5,
      w: 1.6,
      h: 2.4,
      yaw: HP,
      mat: "metal_dark",
      tint: 0x5a5e5a,
      lock: K.LOCKS.ml_records,
      label: "Records Vault",
      mode: "slide",
      wheel: true,
      sign: K.paint("ml_vaultsign", 256, 96),
    });
    G.PMID.mlInt = I;
    content(rec, I);
  });
})();
