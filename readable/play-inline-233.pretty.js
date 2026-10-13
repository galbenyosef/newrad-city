/* src/landmark_interiors/50_city_hall.js */
/* =====================================================================
 * NEW RAD CITY — landmark_interiors / 50_city_hall.js
 * CITY HALL — the grand rotunda and the second floor, still run by the
 * municipal robots that never got the memo.
 *
 * Cell 'city_hall_rotunda' (origin 7000,0,1600). Local layout (+z south):
 *   THE ROTUNDA        : twin cantilevered marble stairs curving up the wall
 *                        to a horseshoe gallery ringed by Corinthian columns,
 *                        a coffered dome with a glowing oculus; the Municipal
 *                        Services kiosk (Form V-27, "Red Tape")
 *   GOVERNOR'S ROOM    : portrait gallery, the first president's desk under
 *                        glass, velvet ropes — a Patrolman docent
 *   THE BLUE ROOM      : the mayor's press room: city seal, podium, flags —
 *                        Deputy Mayor Pemberton-9 (a Valet unit) presides;
 *                        the Mayor's safe (the Key to the City; code on the Mayor's tape reel)
 *   COUNCIL CHAMBER    : horseshoe of council desks, the Speaker's rostrum,
 *                        public pews, an allegorical ceiling tondo; its floor
 *                        has given way (hazard) into …
 *   RECORDS ROOM (y 0) : basement stacks under the chamber, a door back into
 *                        the rotunda (the loop)
 * Entrance: the base of landmarks_b's cantilevered stair in the ground-floor
 * rotunda in the world ("Climb to the second floor").
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._li) return;
  const LI = G._li,
    A = LI.arch,
    F = LI.furn,
    Q = LI.q,
    TAU = Math.PI * 2;
  const KEY = "city_hall_rotunda";
  const D2R = Math.PI / 180;

  function art() {
    const T = {};
    T.coffers = LI.texMat(
      "ch_coffers",
      LI.canvasTex("ch_coffers", 256, 256, (x, W, H) => {
        x.fillStyle = "#e8e0cc";
        x.fillRect(0, 0, W, H);
        for (let k = 0; k < 5; k++) {
          const i = 18 + k * 14;
          x.fillStyle = ["#d4ccb6", "#c8bea6", "#bcb298", "#b0a68a", "#a8a088"][
            k
          ];
          x.fillRect(i, i, W - 2 * i, H - 2 * i);
        }
        x.fillStyle = "#c8a050";
        x.beginPath();
        x.arc(W / 2, H / 2, 26, 0, TAU);
        x.fill();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * TAU;
          x.beginPath();
          x.ellipse(
            W / 2 + Math.cos(a) * 30,
            H / 2 + Math.sin(a) * 30,
            12,
            6,
            a,
            0,
            TAU,
          );
          x.fill();
        }
        x.strokeStyle = "#8a7a5a";
        x.lineWidth = 3;
        x.strokeRect(1, 1, W - 2, H - 2);
        LI.wear(x, W, H, 12, 0.5);
      }),
      { rough: 0.85 },
    );
    T.portraits = LI.texMat(
      "ch_portraits",
      LI.canvasTex(
        "ch_portraits",
        1024,
        512,
        (x, W, H) => {
          for (let i = 0; i < 8; i++)
            LI.portrait(
              x,
              (i % 4) * 256,
              Math.floor(i / 4) * 256,
              256,
              256,
              40 + i * 5,
            );
        },
        { clamp: true },
      ),
      { rough: 0.8 },
    );
    T.tondo = LI.texMat(
      "ch_tondo",
      LI.canvasTex(
        "ch_tondo",
        1024,
        1024,
        (x, W, H) => {
          const cx = W / 2,
            cy = H / 2,
            r = LI.rng(64);
          const g = x.createRadialGradient(cx, cy, 20, cx, cy, 500);
          g.addColorStop(0, "#e8d8a8");
          g.addColorStop(0.6, "#a8b8c8");
          g.addColorStop(1, "#4a5a6a");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          // the city enthroned, receiving tribute (original allegory)
          x.fillStyle = "#e0c898";
          x.beginPath();
          x.ellipse(cx, cy - 40, 60, 80, 0, 0, TAU);
          x.fill();
          x.fillStyle = "#6a2a2a";
          x.beginPath();
          x.moveTo(cx - 110, cy + 180);
          x.quadraticCurveTo(cx - 60, cy - 20, cx, cy + 10);
          x.quadraticCurveTo(cx + 60, cy - 20, cx + 110, cy + 180);
          x.fill();
          x.fillStyle = "#d8b050";
          for (let k = 0; k < 7; k++) {
            const a = -Math.PI / 2 + (k - 3) * 0.28;
            x.beginPath();
            x.moveTo(cx + Math.cos(a) * 60, cy - 130 + Math.sin(a) * 60);
            x.lineTo(cx + Math.cos(a) * 100, cy - 130 + Math.sin(a) * 100);
            x.lineTo(
              cx + Math.cos(a + 0.08) * 60,
              cy - 130 + Math.sin(a + 0.08) * 60,
            );
            x.fill();
          }
          for (let k = 0; k < 10; k++) {
            const a = (k / 10) * TAU,
              px = cx + Math.cos(a) * 330,
              py = cy + Math.sin(a) * 330;
            x.fillStyle = ["#8a5a3a", "#3a5a7a", "#5a7a3a", "#7a3a5a"][k % 4];
            x.beginPath();
            x.ellipse(px, py, 40, 70, a + Math.PI / 2, 0, TAU);
            x.fill();
            x.fillStyle = "#d8b890";
            x.beginPath();
            x.arc(px - Math.cos(a) * 60, py - Math.sin(a) * 60, 22, 0, TAU);
            x.fill();
          }
          x.strokeStyle = "#c8a050";
          x.lineWidth = 30;
          x.beginPath();
          x.arc(cx, cy, 495, 0, TAU);
          x.stroke();
          LI.wear(x, W, H, 64, 0.8);
        },
        { clamp: true },
      ),
      { rough: 0.9 },
    );
    T.seal = LI.texMat(
      "ch_seal",
      LI.canvasTex(
        "ch_seal",
        512,
        512,
        (x, W, H) => {
          x.clearRect(0, 0, W, H);
          const cx = W / 2,
            cy = H / 2;
          x.fillStyle = "#1c2c5a";
          x.beginPath();
          x.arc(cx, cy, 250, 0, TAU);
          x.fill();
          x.strokeStyle = "#d8b050";
          x.lineWidth = 12;
          x.beginPath();
          x.arc(cx, cy, 238, 0, TAU);
          x.stroke();
          x.beginPath();
          x.arc(cx, cy, 170, 0, TAU);
          x.stroke();
          x.fillStyle = "#e8d8a0";
          x.font = "bold 30px Georgia, serif";
          x.textAlign = "center";
          const txt = "· SEAL OF THE CITY OF NEW YORK · 1625 ·";
          for (let i = 0; i < txt.length; i++) {
            const a = -Math.PI * 0.95 + (i / txt.length) * Math.PI * 1.9;
            x.save();
            x.translate(cx + Math.cos(a) * 205, cy + Math.sin(a) * 205);
            x.rotate(a + Math.PI / 2);
            x.fillText(txt[i], 0, 10);
            x.restore();
          }
          // shield with windmill sails, two supporters, eagle (stylised, original)
          x.fillStyle = "#e8d8a0";
          x.beginPath();
          x.moveTo(cx - 70, cy - 80);
          x.lineTo(cx + 70, cy - 80);
          x.lineTo(cx + 70, cy + 20);
          x.quadraticCurveTo(cx, cy + 110, cx - 70, cy + 20);
          x.fill();
          x.strokeStyle = "#1c2c5a";
          x.lineWidth = 10;
          for (let k = 0; k < 4; k++) {
            const a = (k / 4) * TAU + Math.PI / 4;
            x.beginPath();
            x.moveTo(cx, cy - 20);
            x.lineTo(cx + Math.cos(a) * 60, cy - 20 + Math.sin(a) * 60);
            x.stroke();
          }
          x.fillStyle = "#e8d8a0";
          for (const s of [-1, 1]) {
            x.beginPath();
            x.ellipse(cx + s * 115, cy + 10, 26, 80, 0, 0, TAU);
            x.fill();
            x.beginPath();
            x.arc(cx + s * 115, cy - 85, 20, 0, TAU);
            x.fill();
          }
          x.beginPath();
          x.moveTo(cx, cy - 150);
          x.lineTo(cx - 60, cy - 110);
          x.lineTo(cx + 60, cy - 110);
          x.fill();
        },
        { clamp: true },
      ),
      { transparent: true, rough: 0.5, metal: 0.3 },
    );
    T.park = LI.texMat(
      "ch_park",
      LI.canvasTex(
        "ch_park",
        1024,
        512,
        (x, W, H) => {
          const g = x.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#7a8a62");
          g.addColorStop(0.55, "#b8b088");
          g.addColorStop(0.56, "#5a5a44");
          g.addColorStop(1, "#3a3a2e");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          const r = LI.rng(3);
          x.strokeStyle = "rgba(40,36,28,0.9)";
          for (let i = 0; i < 14; i++) {
            const tx = r() * W,
              th = 80 + r() * 90;
            x.lineWidth = 6;
            x.beginPath();
            x.moveTo(tx, H * 0.56);
            x.lineTo(tx, H * 0.56 - th);
            x.stroke();
            x.lineWidth = 2;
            for (let k = 0; k < 6; k++) {
              x.beginPath();
              x.moveTo(tx, H * 0.56 - th * (0.4 + k * 0.1));
              x.lineTo(tx + (r() - 0.5) * 90, H * 0.56 - th * (0.7 + k * 0.08));
              x.stroke();
            }
          }
          x.fillStyle = "rgba(80,76,64,0.9)";
          x.fillRect(W * 0.7, H * 0.2, W * 0.3, H * 0.36);
          LI.wear(x, W, H, 4, 0.4);
        },
        { clamp: true },
      ),
      { emissive: 0.7, rough: 1 },
    );
    T.sign = (id, lines, st, w, h) =>
      LI.texMat("ch_sign_" + id, LI.signTex("ch_" + id, lines, st, w, h), {
        rough: 0.8,
      });
    return T;
  }

  function build() {
    const C = LI.cell(KEY);
    C.site = "city_hall";
    const b = C.b,
      T = art();
    b.ambient(0x2e2c28, 1);
    const RW = 9.3,
      GY = 6,
      DY = 13,
      P = (a, r) => [r * Math.sin(a), -r * Math.cos(a)];
    // ------------- lights -------------
    b.light(0, 18, 0, 0xfff4dc, 22, 1.1);
    b.light(0, 8, 0, 0xfff0d8, 12, 0.6);
    for (let i = 0; i < 6; i++) {
      const p = P((i / 6) * TAU, 8);
      b.light(p[0], 4, p[1], 0xffd8a0, 7, 0.45);
    }
    for (const x of [-24, -16]) b.light(x, GY + 4.5, -2, 0xffe0b0, 10, 0.8);
    b.light(-20, GY + 3, 2.5, 0xd8e0c8, 8, 0.6);
    b.light(0, GY + 4.4, -19, 0xc8d8ff, 12, 0.9);
    b.light(0, GY + 2, -24, 0xffe0b0, 6, 0.6);
    b.light(22, GY + 5.5, 0, 0xffe0b0, 14, 0.9);
    b.light(29, GY + 3, 0, 0xffd8a0, 8, 0.6);
    b.light(15, GY + 3, 0, 0xffd8a0, 8, 0.5);
    b.light(24.3, 4.8, 4, 0xc8d0b8, 9, 1.0); // light through the collapsed floor
    for (const [x, z] of [
      [16, -5],
      [28, -5],
      [16, 6],
      [28, 6],
    ])
      b.light(x, 3.6, z, 0xe8f0ff, 7, 0.55);
    for (const sd of [-1, 1])
      b.light(sd * 9.8, GY + 2.4, -4.8, 0xffd8a0, 6, 0.5);
    b.light(10.8, 2.2, 0, 0xffd8a0, 5, 0.5);

    // ==============================================================
    // THE ROTUNDA
    // ==============================================================
    b.cyl("marble", 0, 0, 0, RW, RW, 0.02, 40);
    b.flat(T.seal, 0, 0.025, 0, 4.2, 4.2, 0);
    for (let k = 1; k <= 3; k++)
      b.torus("marble_dark", 0, 0.03, 0, 2.2 + k * 2.2, 0.08, {
        ts: 48,
        rs: 3,
        sy: 0.3,
      });
    // wall facets (36) with openings: ground S (decor door), ground E (records), gallery W / N / E
    const NWF = 36;
    const doorAt = (a) => {
      const d = (deg) =>
        Math.abs(((((a / D2R - deg) % 360) + 540) % 360) - 180) < 6;
      return { gS: d(180), gE: d(90), uW: d(300), uN: d(0), uE: d(60) };
    };
    for (let i = 0; i < NWF; i++) {
      const a0 = (i / NWF) * TAU,
        a1 = ((i + 1) / NWF) * TAU,
        am = (a0 + a1) / 2,
        L = 2 * (RW + 0.35) * Math.sin(Math.PI / NWF) + 0.05,
        c = P(am, RW + 0.18),
        ry = -am;
      const dd = doorAt(am),
        segs = [];
      if (dd.gE) segs.push([2.8, GY]);
      else if (!dd.gS) segs.push([0, GY]);
      else segs.push([3.0, GY]);
      if (dd.uW || dd.uN || dd.uE) segs.push([GY + 3.0, DY]);
      else segs.push([GY, DY]);
      for (const [y0, y1] of segs) {
        b.obox(
          "plaster_warm",
          c[0],
          (y0 + y1) / 2,
          c[1],
          L,
          y1 - y0,
          0.36,
          ry,
          { fy: y0 < GY ? 0 : GY },
        );
        C.colRot(c[0], c[1], L, 0.36, y0, y1, ry, { walkable: false });
      }
      if (dd.gS) {
        const cd = P(am, RW + 0.02);
        b.obox("bronze", cd[0], 1.5, cd[1], L, 3.0, 0.1, ry);
        C.colRot(c[0], c[1], L, 0.36, 0, 3.0, ry, { walkable: false });
      }
      if (i % 3 === 0 && !doorAt(a0).gS) {
        const pp = P(a0, RW - 0.02);
        b.box(
          "marble",
          pp[0] - 0.22,
          0,
          pp[1] - 0.22,
          pp[0] + 0.22,
          GY - 0.3,
          pp[1] + 0.22,
        );
      } // (no pilaster in the middle of the exit doors)
    }
    // the exit: bronze double doors with glass lights, push plates, a marble architrave and a lettered transom
    {
      const ry = Math.PI,
        zc = RW - 0.08;
      for (const s2 of [-1, 1]) {
        b.obox("glass_dark", s2 * 0.8, 1.9, zc - 0.03, 0.9, 1.5, 0.02, ry);
        b.obox("brass", s2 * 0.22, 1.15, zc - 0.05, 0.1, 0.4, 0.03, ry);
        b.obox("marble", s2 * 1.75, 1.6, zc - 0.1, 0.3, 3.2, 0.2, ry);
      }
      b.obox("bronze", 0, 1.5, zc - 0.02, 0.06, 3.0, 0.06, ry);
      b.obox("marble", 0, 3.3, zc - 0.1, 3.8, 0.3, 0.2, ry);
      b.quad(
        T.sign(
          "exit",
          ["CITY HALL PARK", "EXIT · BROADWAY ▸"],
          { bg: "#1c2c5a", fg: "#e8d8a0", size: 44 },
          512,
          128,
        ),
        0,
        3.75,
        zc - 0.12,
        2.2,
        0.55,
        ry,
      );
      A.sconce(C, -2.2, 2.6, zc - 0.12, ry, { r: 5, i: 0.6 });
      A.sconce(C, 2.2, 2.6, zc - 0.12, ry, { r: 5, i: 0.6 });
    }
    b.cyl("marble", 0, GY - 0.35, 0, RW + 0.2, RW + 0.2, 0.35, 40, {
      open: true,
    });
    b.cyl("marble", 0, DY - 0.6, 0, RW + 0.2, RW + 0.2, 0.6, 40, {
      open: true,
    });
    b.torus("gold", 0, DY - 0.62, 0, RW - 0.05, 0.08, { ts: 64, rs: 4 });
    // coffered dome + oculus lantern
    const OC = 2.1,
      ph0 = Math.asin(OC / RW);
    const dome = new THREE.SphereGeometry(
      RW + 0.05,
      40,
      12,
      0,
      TAU,
      ph0,
      Math.PI / 2 - ph0,
    );
    b.add(T.coffers, dome, {
      m: LI.M4(0, DY, 0),
      flip: true,
      keepUV: true,
      us: 14,
      vs: 5,
      noAO: true,
    });
    const oy = DY + Math.cos(ph0) * RW;
    b.cyl("plaster_warm", 0, oy, 0, OC, OC, 2.2, 24, {
      open: true,
      flip: true,
    });
    b.cyl("lamp_cool", 0, oy + 2.2, 0, OC, OC, 0.05, 24);
    b.torus("gold", 0, oy, 0, OC, 0.1, { ts: 32 });
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(OC * 0.95, OC * 1.6, oy + 2, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfff4d8,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    shaft.position.set(0, (oy + 2) / 2, 0);
    C.root.add(shaft);
    // horseshoe gallery (north, −84°..84°)
    const GA = 84 * D2R,
      NG = 14;
    for (let j = 0; j < NG; j++) {
      const a0 = -GA + (j / NG) * 2 * GA,
        a1 = a0 + (2 * GA) / NG,
        am = (a0 + a1) / 2,
        ri = 6.8,
        ro = RW,
        L = 2 * ro * Math.sin((a1 - a0) / 2) + 0.05,
        c = P(am, (ri + ro) / 2);
      b.obox("marble", c[0], GY - 0.15, c[1], L, 0.3, ro - ri, -am, { fy: GY });
      b.obox(
        "carpet_red",
        c[0],
        GY + 0.005,
        c[1],
        L - 0.02,
        0.01,
        ro - ri - 0.3,
        -am,
        { noAO: true },
      );
      C.colRot(c[0], c[1], L, ro - ri, GY - 0.3, GY, -am, {
        surface: "marble",
      });
      const e0 = P(a0, 6.85),
        e1 = P(a1, 6.85);
      A.balustrade(C, "marble", e0, e1, GY, 1.0);
    }
    // Corinthian columns on the gallery carrying the dome ring
    for (let k = -3; k <= 3; k++) {
      const p = P(k * 24 * D2R, 7.4);
      A.column(C, "marble", p[0], GY, p[1], DY - 0.6 - GY, 0.32, { col: true });
    }
    // twin cantilevered stairs (27 floating steps each, hugging the wall)
    const NS = 27,
      SR0 = 7.3,
      SR1 = 9.15,
      span = 76 * D2R,
      rise = GY / NS;
    for (const side of [-1, 1]) {
      const aStart = Math.PI + side * 20 * D2R; // bottom (south)
      for (let k = 0; k < NS; k++) {
        const a0 = aStart + ((side * k) / NS) * span,
          a1 = aStart + ((side * (k + 1)) / NS) * span,
          am = (a0 + a1) / 2,
          top = (k + 1) * rise;
        const L = 2 * SR1 * Math.sin(span / NS / 2) + 0.04,
          c = P(am, (SR0 + SR1) / 2);
        b.obox("marble", c[0], top - 0.1, c[1], L, 0.2, SR1 - SR0, -am, {
          fy: top,
        });
        b.obox(
          "marble_dark",
          c[0],
          top - 0.35,
          c[1],
          L,
          0.3,
          SR1 - SR0 - 0.3,
          -am,
          { fy: top },
        );
        C.colRot(c[0], c[1], L, SR1 - SR0, Math.max(0, top - 0.45), top, -am, {
          surface: "marble",
        });
        const i0 = P(a0, SR0 + 0.04),
          i1 = P(a1, SR0 + 0.04);
        b.beam(
          "bronze",
          [i0[0], top + 0.95, i0[1]],
          [i1[0], top + 0.95 + rise, i1[1]],
          0.06,
          0.05,
        );
        b.box(
          "bronze",
          i0[0] - 0.02,
          top,
          i0[1] - 0.02,
          i0[0] + 0.02,
          top + 0.95,
          i0[1] + 0.02,
        );
        C.colRot(
          (i0[0] + i1[0]) / 2,
          (i0[1] + i1[1]) / 2,
          L,
          0.12,
          top,
          top + 1.0,
          -am,
          { walkable: false },
        );
      }
    }
    // kiosk (Municipal Services) + benches on the ground floor
    b.box("wood_dark", -1.2, 0, -4.1, 1.2, 1.1, -3.4);
    b.box("marble", -1.3, 1.1, -4.15, 1.3, 1.16, -3.35);
    C.col(-1.3, 0, -4.15, 1.3, 1.16, -3.35, { walkable: false });
    C.prop("terminal", 0, 1.16, -3.75, 0, {
      terminalId: "li_ch_kiosk",
      mount: "bare",
    });
    const kSign = T.sign(
      "kiosk",
      ["MUNICIPAL SERVICES", "PERMITS · PASSES · COMPLAINTS"],
      { bg: "#1c2c5a", fg: "#e8d8a0", size: 44 },
      512,
      128,
    );
    b.quad(kSign, 0, 2.2, -3.3, 2.4, 0.6, 0);
    b.box("bronze", -0.05, 1.16, -4.1, 0.05, 2.5, -4.0);
    for (const s of [-1, 1]) {
      b.box("wood_dark", s * 4.2 - 0.3, 0.42, -2, s * 4.2 + 0.3, 0.5, 2);
      C.col(s * 4.2 - 0.3, 0, -2, s * 4.2 + 0.3, 0.5, 2, {
        walkable: false,
        surface: "wood",
      });
    }
    C.prop("skeleton", 3.9, 0.5, 1, -Math.PI / 2, {
      pose: "seated",
      collide: false,
    });
    F.papers(C, 0, 0.03, 1, 5, 30, 606);

    // gallery exits: short vestibules through the rotunda wall at −60° (west) and +60° (east)
    for (const sd of [-1, 1]) {
      const x0 = sd < 0 ? -12.3 : 7.2,
        x1 = sd < 0 ? -7.2 : 12.3;
      A.floor(C, "marble", x0, -6, x1, -3.6, GY, { solid: false, th: 0.3 });
      A.ceil(C, "plaster_warm", x0, -6, x1, -3.6, GY + 3.2);
      A.wall(C, "plaster_warm", { x0, x1, z: -6.15 }, GY, GY + 3.2, 0.3, []);
      A.wall(C, "plaster_warm", { x0, x1, z: -3.45 }, GY, GY + 3.2, 0.3, []);
    }

    // ==============================================================
    // GOVERNOR'S ROOM (x -28..-12, z -8..4, floor 6)
    // ==============================================================
    const GX0 = -28,
      GX1 = -12,
      GZ0 = -8,
      GZ1 = 4,
      GH = GY + 5.6,
      GCX = (GX0 + GX1) / 2,
      GCZ = (GZ0 + GZ1) / 2;
    C.col(GX0, 0, GZ0, GX1, GY, GZ1, {});
    A.floor(C, "wood", GX0, GZ0, GX1, GZ1, GY + 0.01, { col: false, th: 0.05 });
    A.ceil(C, "plaster_warm", GX0, GZ0, GX1, GZ1, GH);
    for (let x = GX0 + 2; x < GX1; x += 3)
      b.box("gold", x - 0.1, GH - 0.3, GZ0, x + 0.1, GH, GZ1);
    A.wall(
      C,
      "plaster_warm",
      { x0: GX0, x1: GX1, z: GZ0 - 0.15 },
      GY,
      GH,
      0.3,
      [{ a: -21, b: -19, top: GY + 2.6 }],
      { casing: "gold" },
    );
    const gWin = [
      [-25, -22.6],
      [-17.8, -15.4],
    ];
    A.wall(
      C,
      "plaster_warm",
      { x0: GX0, x1: GX1, z: GZ1 + 0.15 },
      GY,
      GH,
      0.3,
      gWin.map((w) => ({ a: w[0], b: w[1], sill: GY + 1, top: GH - 1 })),
    );
    A.wall(
      C,
      "plaster_warm",
      { z0: GZ0, z1: GZ1, x: GX0 - 0.15 },
      GY,
      GH,
      0.3,
      [],
    );
    A.wall(
      C,
      "plaster_warm",
      { z0: GZ0, z1: GZ1, x: GX1 + 0.15 },
      GY,
      GH,
      0.3,
      [{ a: -6, b: -3.6, top: GY + 3.0 }],
      { casing: "gold" },
    );
    for (const [a0, a1] of gWin) {
      b.quad(
        "glass",
        (a0 + a1) / 2,
        GY + 1 + (GH - 2 - GY) / 2,
        GZ1 + 0.15,
        a1 - a0,
        GH - 2 - GY,
        Math.PI,
        { double: true },
      );
      b.quad(T.park, (a0 + a1) / 2, GY + 2.6, GZ1 + 2.5, 6, 4, Math.PI, {
        noAO: true,
      });
      for (const s2 of [-1, 1])
        b.obox(
          "fabric_red",
          (a0 + a1) / 2 + s2 * 1.5,
          GY + 2.6,
          GZ1 - 0.1,
          0.5,
          4.8,
          0.12,
          0,
        );
    }
    b.box("black", GX0, GY - 1, GZ1 + 2.6, GX1, GY + 6, GZ1 + 2.8, {
      noBake: true,
    });
    b.box("wood_dark", GX0, GY, GZ0 + 0.01, GX1, GY + 1.0, GZ0 + 0.06);
    b.box("wood_dark", GX0, GY, GZ1 - 0.06, GX1, GY + 1.0, GZ1 - 0.01);
    for (let i = 0; i < 8; i++) {
      const onN = i < 5,
        x = onN ? GX0 + 1.6 + i * 3.1 : GX0 + 3 + (i - 5) * 4.6,
        z = onN ? GZ0 + 0.1 : GZ1 - 0.1;
      if (onN && x > -21.9 && x < -18.1) continue;
      if (!onN && ((x > -25.8 && x < -21.8) || (x > -18.6 && x < -14.6)))
        continue;
      F.frame(C, T.portraits, x, GY + 2.9, z, 1.3, 1.6, onN ? 0 : Math.PI, {
        uvRect: [
          (i % 4) * 0.25,
          1 - (Math.floor(i / 4) + 1) * 0.5,
          ((i % 4) + 1) * 0.25,
          1 - Math.floor(i / 4) * 0.5,
        ],
      });
    }
    for (let k = 0; k < 3; k++)
      F.frame(
        C,
        T.portraits,
        GX0 + 0.1,
        GY + 2.9,
        GZ0 + 2.5 + k * 3.5,
        1.3,
        1.6,
        Math.PI / 2,
        { uvRect: [(k % 4) * 0.25, 0, ((k % 4) + 1) * 0.25, 0.5] },
      );
    // the first president's writing desk under a glass case, velvet ropes
    const DX = GCX,
      DZ = GCZ;
    b.box("wood_dark", DX - 1.1, GY, DZ - 0.6, DX + 1.1, GY + 0.8, DZ + 0.6);
    b.box(
      "wood_dark",
      DX - 1.0,
      GY + 0.8,
      DZ + 0.2,
      DX + 1.0,
      GY + 1.3,
      DZ + 0.55,
    );
    b.box("glass", DX - 1.3, GY + 0.8, DZ - 0.8, DX + 1.3, GY + 1.9, DZ + 0.8);
    C.col(DX - 1.3, GY, DZ - 0.8, DX + 1.3, GY + 1.9, DZ + 0.8, {
      walkable: false,
    });
    const rp = [
      [DX - 2.1, DZ - 1.6],
      [DX + 2.1, DZ - 1.6],
      [DX + 2.1, DZ + 1.6],
      [DX - 2.1, DZ + 1.6],
    ];
    for (const [x, z] of rp) {
      b.cyl("brass", x, GY, z, 0.05, 0.12, 0.95, 8);
      b.sphere("brass", x, GY + 0.98, z, 0.07);
    }
    for (let k = 0; k < 4; k++) {
      const p = rp[k],
        q = rp[(k + 1) % 4];
      b.rod(
        "fabric_red",
        [p[0], GY + 0.85, p[1]],
        [q[0], GY + 0.85, q[1]],
        0.03,
      );
    }
    const gSign = T.sign(
      "gov",
      ["THE GOVERNOR'S ROOM", "PLEASE DO NOT TOUCH THE PRESIDENTS"],
      { bg: "#1c2c5a", fg: "#e8d8a0", size: 44 },
      512,
      128,
    );
    b.quad(gSign, DX, GY + 1.5, DZ - 1.8, 1.4, 0.35, Math.PI, { rx: -0.3 });
    for (const x of [GX0 + 4, GX1 - 4])
      A.chandelier(C, x, GH - 1.4, GCZ, GH, 0.9, { light: false });
    C.prop("terminal", GX0 + 0.8, GY, GZ1 - 1.4, Math.PI / 2, {
      terminalId: "li_ch_art",
    });
    // corridor north to the Blue Room
    A.floor(C, "carpet_blue", -21.2, -22, -18.8, GZ0, GY, { solid: true });
    A.ceil(C, "plaster", -21.2, -22, -18.8, GZ0, GY + 3.2);
    A.wall(
      C,
      "plaster_warm",
      { z0: -22, z1: GZ0, x: -21.35 },
      GY,
      GY + 3.2,
      0.3,
      [],
    );
    A.wall(
      C,
      "plaster_warm",
      { z0: -18, z1: GZ0, x: -18.65 },
      GY,
      GY + 3.2,
      0.3,
      [],
    );
    A.wall(
      C,
      "plaster_warm",
      { x0: -21.5, x1: -8, z: -22.15 },
      GY,
      GY + 3.2,
      0.3,
      [],
    );
    A.floor(C, "carpet_blue", -18.8, -22, -8, -18, GY, { solid: true });
    A.ceil(C, "plaster", -18.8, -22, -8, -18, GY + 3.2);
    A.wall(
      C,
      "plaster_warm",
      { x0: -18.8, x1: -8, z: -17.85 },
      GY,
      GY + 3.2,
      0.3,
      [],
    );
    A.sconce(C, -21.05, GY + 2.2, -14, Math.PI / 2, { light: false });
    A.sconce(C, -13, GY + 2.2, -18.1, Math.PI, { light: false });
    b.light(-20, GY + 2.4, -14, 0xffd8a0, 6, 0.5);
    b.light(-13, GY + 2.4, -19.5, 0xffd8a0, 6, 0.5);

    // ==============================================================
    // THE BLUE ROOM (x -8..8, z -26..-12, floor 6) — the mayor's press room
    // ==============================================================
    const BX0 = -8,
      BX1 = 8,
      BZ0 = -26,
      BZ1 = -12,
      BH = GY + 5;
    C.col(BX0, 0, BZ0, BX1, GY, BZ1, {});
    A.floor(C, "carpet_blue", BX0, BZ0, BX1, BZ1, GY + 0.01, {
      col: false,
      th: 0.05,
    });
    A.ceil(C, "plaster", BX0, BZ0, BX1, BZ1, BH);
    A.wall(
      C,
      "plaster_blue",
      { x0: BX0, x1: BX1, z: BZ0 - 0.15 },
      GY,
      BH,
      0.3,
      [],
    );
    A.wall(
      C,
      "plaster_blue",
      { z0: BZ0, z1: BZ1, x: BX0 - 0.15 },
      GY,
      BH,
      0.3,
      [{ a: -21, b: -19, top: GY + 2.6 }],
      { casing: "gold" },
    );
    A.wall(
      C,
      "plaster_blue",
      { z0: BZ0, z1: BZ1, x: BX1 + 0.15 },
      GY,
      BH,
      0.3,
      [{ a: -21, b: -19, top: GY + 2.6 }],
      { casing: "gold" },
    );
    A.wall(
      C,
      "plaster_blue",
      { x0: BX0, x1: BX1, z: BZ1 + 0.15 },
      GY,
      BH,
      0.3,
      [{ a: -1.2, b: 1.2, top: GY + 2.8 }],
      { casing: "gold" },
    );
    // vestibule from the gallery (north door of the rotunda)
    A.floor(C, "marble", -1.5, BZ1, 1.5, -RW + 0.1, GY, { solid: true });
    A.ceil(C, "plaster", -1.5, BZ1, 1.5, -RW + 0.1, GY + 3);
    A.wall(
      C,
      "plaster_warm",
      { z0: BZ1, z1: -RW + 0.1, x: -1.65 },
      GY,
      GY + 3,
      0.3,
      [],
    );
    A.wall(
      C,
      "plaster_warm",
      { z0: BZ1, z1: -RW + 0.1, x: 1.65 },
      GY,
      GY + 3,
      0.3,
      [],
    );
    b.quad(T.seal, 0, GY + 3.2, BZ0 + 0.02, 2.6, 2.6, 0, { noAO: true });
    for (const s2 of [-1, 1]) {
      b.cyl("brass", s2 * 2.2, GY, BZ0 + 0.6, 0.03, 0.05, 3.2, 8);
      b.obox(
        s2 < 0 ? "fabric_blue" : "fabric_red",
        s2 * 2.2 + 0.55,
        GY + 2.6,
        BZ0 + 0.6,
        1.0,
        1.4,
        0.02,
        0,
        { rz: -s2 * 0.05 },
      );
    }
    b.box("wood_dark", -0.6, GY, BZ0 + 2.2, 0.6, GY + 1.15, BZ0 + 2.8);
    b.quad(T.seal, 0, GY + 0.7, BZ0 + 2.82, 0.6, 0.6, 0);
    for (const s2 of [-1, 1])
      b.rod(
        "chrome",
        [s2 * 0.2, GY + 1.15, BZ0 + 2.4],
        [s2 * 0.1, GY + 1.5, BZ0 + 2.8],
        0.012,
      );
    C.col(-0.6, GY, BZ0 + 2.2, 0.6, GY + 1.2, BZ0 + 2.8, { walkable: false });
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 6; c++)
        F.chair(C, -3.75 + c * 1.5, GY, BZ0 + 6 + r * 1.6, Math.PI, {
          key: "metal_dark",
          seat: "fabric_blue",
          toppled: (r * 6 + c) % 5 === 2,
        });
    for (const [x, z] of [
      [-5, -16.5],
      [5, -16.5],
    ]) {
      b.cyl("metal_dark", x, GY, z, 0.04, 0.06, 1.6, 6);
      b.obox("metal", x, GY + 1.7, z, 0.5, 0.35, 0.6, 0.3);
    }
    C.prop("safe", BX1 - 0.6, GY, BZ0 + 0.6, -Math.PI / 2, {
      items: [
        ["li_key_to_city", 1],
        ["scrip", 150],
        ["old_dollars", 4],
      ],
      locked: 0,
      lock: LI.LOCKS.ch_mayor_safe,
      owner: "robots",
      name: "The Mayor's Safe",
    });
    const brSign = T.sign(
      "blue",
      ["THE BLUE ROOM", "PRESS CONFERENCE IN PROGRESS"],
      { bg: "#1c2c5a", fg: "#e8d8a0", size: 44 },
      512,
      128,
    );
    b.quad(brSign, 0, GY + 2.6, BZ1 - 0.02, 2.2, 0.55, Math.PI);
    A.chandelier(C, 0, BH - 1.3, -19, BH, 1.0, { light: false });
    // corridor east from the Blue Room to the Council Chamber's north door
    A.floor(C, "carpet_blue", BX1, -22, 15.2, -18, GY, { solid: true });
    A.floor(C, "carpet_blue", 12.8, -18, 15.2, -10, GY, { solid: true });
    A.ceil(C, "plaster", BX1, -22, 15.2, -18, GY + 3.2);
    A.ceil(C, "plaster", 12.8, -18, 15.2, -10, GY + 3.2);
    A.wall(
      C,
      "plaster_warm",
      { x0: BX1, x1: 15.4, z: -22.15 },
      GY,
      GY + 3.2,
      0.3,
      [],
    );
    A.wall(
      C,
      "plaster_warm",
      { x0: BX1, x1: 12.8, z: -17.85 },
      GY,
      GY + 3.2,
      0.3,
      [],
    );
    A.wall(
      C,
      "plaster_warm",
      { z0: -22, z1: -10, x: 15.35 },
      GY,
      GY + 3.2,
      0.3,
      [],
    );
    A.wall(
      C,
      "plaster_warm",
      { z0: -18, z1: -10, x: 12.65 },
      GY,
      GY + 3.2,
      0.3,
      [],
    );
    b.light(11, GY + 2.4, -20, 0xffd8a0, 6, 0.5);
    b.light(14, GY + 2.4, -14, 0xffd8a0, 6, 0.5);
    C.prop("file_cabinet", 14.7, GY, -21.4, -Math.PI / 2, {
      loot: "file_cabinet",
    });

    // ==============================================================
    // COUNCIL CHAMBER (x 12..32, z -10..10, floor 6, collapsed patch) + RECORDS ROOM below (y 0)
    // ==============================================================
    const CX0 = 12,
      CX1 = 32,
      CZ0 = -10,
      CZ1 = 10,
      CH = GY + 7,
      CCX = 22;
    const hole = { x0: 22.6, x1: 26, z0: 2.3, z1: 5.7 };
    for (const [x0, z0, x1, z1] of [
      [CX0, CZ0, CX1, hole.z0],
      [CX0, hole.z1, CX1, CZ1],
      [CX0, hole.z0, hole.x0, hole.z1],
      [hole.x1, hole.z0, CX1, hole.z1],
    ]) {
      b.box("wood", x0, GY - 0.35, z0, x1, GY, z1, { fy: GY });
      C.col(x0, GY - 0.35, z0, x1, GY, z1, { surface: "wood" });
    }
    b.box("carpet_red", CX0, GY + 0.005, CZ0, hole.x0 - 0.2, GY + 0.012, CZ1, {
      noAO: true,
    });
    for (let k = 0; k < 7; k++) {
      const r = LI.rng(k + 80);
      b.obox(
        "wood",
        24.3 + (r() - 0.5) * 3,
        GY - 0.8 + r() * 0.6,
        4 + (r() - 0.5) * 3,
        0.2,
        0.05,
        1.4 + r(),
        r() * 3,
        { rx: 0.6 + r() * 0.5 },
      );
    }
    A.ceil(C, "plaster_warm", CX0, CZ0, CX1, CZ1, CH);
    b.quad(T.tondo, CCX, CH - 0.03, 0, 11, 11, 0, {
      rx: Math.PI / 2,
      noAO: true,
    });
    b.torus("gold", CCX, CH - 0.05, 0, 5.55, 0.15, { ts: 48 });
    for (let x = CX0 + 2; x < CX1; x += 4) {
      b.box("gold", x - 0.12, CH - 0.5, CZ0, x + 0.12, CH, CZ0 + 0.3);
      b.box("gold", x - 0.12, CH - 0.5, CZ1 - 0.3, x + 0.12, CH, CZ1);
    }
    const cWin = [
      [19.3, 23.3],
      [25.3, 29.3],
    ];
    A.wall(
      C,
      "plaster_warm",
      { x0: CX0, x1: CX1, z: CZ0 - 0.15 },
      0,
      CH,
      0.3,
      [{ a: 13, b: 15, top: GY + 2.6, sill: GY }].concat(
        cWin.map((w) => ({ a: w[0], b: w[1], sill: GY + 1.2, top: CH - 1.2 })),
      ),
      { casing: "gold" },
    );
    A.wall(
      C,
      "plaster_warm",
      { x0: CX0, x1: CX1, z: CZ1 + 0.15 },
      0,
      CH,
      0.3,
      cWin.map((w) => ({ a: w[0], b: w[1], sill: GY + 1.2, top: CH - 1.2 })),
    );
    A.wall(
      C,
      "plaster_warm",
      { z0: CZ0, z1: CZ1, x: CX1 + 0.15 },
      0,
      CH,
      0.3,
      [],
    );
    A.wall(
      C,
      "plaster_warm",
      { z0: CZ0, z1: CZ1, x: CX0 - 0.15 },
      GY - 0.35,
      CH,
      0.3,
      [{ a: -6, b: -3.6, top: GY + 3.0 }],
      { casing: "gold" },
    );
    for (const zz of [CZ0 - 2.6, CZ1 + 2.6])
      for (const [a0, a1] of cWin)
        b.quad(
          T.park,
          (a0 + a1) / 2,
          GY + 3.6,
          zz,
          7,
          5,
          zz < 0 ? 0 : Math.PI,
          { noAO: true },
        );
    for (const zz of [CZ0 - 0.15, CZ1 + 0.15])
      for (const [a0, a1] of cWin)
        b.quad(
          "glass",
          (a0 + a1) / 2,
          (GY + 1.2 + CH - 1.2) / 2,
          zz,
          a1 - a0,
          CH - 2.4 - GY,
          0,
          { double: true },
        );
    b.box("black", CX0, 0, CZ0 - 2.8, CX1, CH, CZ0 - 2.7, { noBake: true });
    b.box("black", CX0, 0, CZ1 + 2.7, CX1, CH, CZ1 + 2.8, { noBake: true });
    // Speaker's rostrum (east) + council desks in a horseshoe + public pews (west)
    b.box("wood_dark", 29, GY, -2.5, 31.8, GY + 0.6, 2.5);
    C.col(29, GY, -2.5, 31.8, GY + 0.6, 2.5, { surface: "wood" });
    b.box("wood_dark", 29.2, GY + 0.6, -1.8, 29.8, GY + 1.7, 1.8);
    C.col(29.2, GY + 0.6, -1.8, 29.8, GY + 1.7, 1.8, { walkable: false });
    A.stairs(C, "wood_dark", 28.3, 3.2, "e", 1.2, GY, GY + 0.6, {});
    b.quad(T.seal, CX1 - 0.02, GY + 3.6, 0, 2.2, 2.2, -Math.PI / 2, {
      noAO: true,
    });
    for (let j = 0; j < 9; j++) {
      const a = Math.PI / 2 + (j - 4) * 0.3,
        r = 6.2,
        x = 28 - Math.sin(a) * r,
        z = Math.cos(a) * r;
      if (
        x > hole.x0 - 0.8 &&
        x < hole.x1 + 0.8 &&
        z > hole.z0 - 0.8 &&
        z < hole.z1 + 0.8
      )
        continue;
      F.desk(C, x, GY, z, 1.6, 0.7, a + Math.PI / 2, { key: "wood_dark" });
      F.chair(
        C,
        x - Math.sin(a) * 0.8,
        GY,
        z + Math.cos(a) * 0.8,
        a - Math.PI / 2,
        { key: "wood_dark", seat: "leather", toppled: j === 2 },
      );
    }
    for (let r = 0; r < 4; r++) {
      b.box(
        "wood_dark",
        13.2 + r * 1.3,
        GY,
        -1.5,
        13.7 + r * 1.3,
        GY + 0.45,
        8.5,
      );
      b.box(
        "wood_dark",
        13.6 + r * 1.3,
        GY + 0.45,
        -1.5,
        13.7 + r * 1.3,
        GY + 1.0,
        8.5,
      );
      C.col(13.2 + r * 1.3, GY, -1.5, 13.7 + r * 1.3, GY + 1.0, 8.5, {
        walkable: false,
        surface: "wood",
      });
    }
    A.chandelier(C, CCX, CH - 1.8, 0, CH, 1.4, { light: false });
    // grey daylight spilling in through the tall windows, gilt sconces between them, flags at the rostrum
    for (const zz of [CZ0 + 1.6, CZ1 - 1.6])
      for (const [a0, a1] of cWin)
        b.light((a0 + a1) / 2, GY + 3.2, zz, 0xd8e0e8, 9, 0.75);
    for (const zz of [CZ0 + 0.12, CZ1 - 0.12])
      for (const x of [16.3, 24.3, 30.6])
        A.sconce(C, x, GY + 2.6, zz, zz < 0 ? 0 : Math.PI, { r: 6, i: 0.7 });
    for (const [z, col] of [
      [-3.4, 0x2a4a9a],
      [3.4, 0xd8762a],
    ]) {
      b.cyl("brass", 31.2, GY, z, 0.03, 0.04, 3.0, 6);
      b.sphere("gold", 31.2, GY + 3.05, z, 0.07, { ws: 6, hs: 5 });
      b.obox(
        "fabric",
        31.2,
        GY + 2.2,
        z + (z < 0 ? 0.45 : -0.45),
        0.03,
        1.4,
        0.85,
        0,
        { c: col, rz: 0.03 },
      );
    }
    // name placards on the council desks, a gavel and a water pitcher on the rostrum
    b.box("wood_dark", 29.35, GY + 1.7, -0.3, 29.65, GY + 1.76, 0.3);
    b.cyl("glass", 29.5, GY + 1.7, 1.2, 0.07, 0.06, 0.24, 8);
    b.cyl("wood", 29.5, GY + 1.74, -1.0, 0.035, 0.035, 0.22, 6, {
      rx: Math.PI / 2,
    });
    const ccSign = T.sign(
      "cc",
      ["CITY COUNCIL", "IN SESSION — QUORUM NOT PRESENT"],
      { bg: "#1c2c5a", fg: "#e8d8a0", size: 44 },
      512,
      128,
    );
    b.quad(ccSign, CX0 + 0.17, GY + 2.9, -8, 2.4, 0.6, Math.PI / 2);
    C.prop("terminal", 30.6, GY + 0.6, 2.2, -Math.PI / 2, {
      terminalId: "li_ch_council",
      mount: "bare",
    });
    // records room (y 0 .. 5.65) under the chamber; passage west into the rotunda (ground E door)
    A.floor(C, "concrete", CX0, CZ0, CX1, CZ1, 0.02, { col: false });
    A.wall(
      C,
      "concrete",
      { z0: CZ0, z1: CZ1, x: CX0 - 0.15 },
      0,
      GY - 0.35,
      0.3,
      [{ a: -1.2, b: 1.2, top: 2.6 }],
    );
    A.floor(C, "concrete", RW - 0.2, -1.2, CX0, 1.2, 0.02, { col: false });
    A.ceil(C, "concrete", RW - 0.2, -1.4, CX0, 1.4, 2.8);
    A.wall(C, "concrete", { x0: RW - 0.3, x1: CX0, z: -1.35 }, 0, 2.8, 0.3, []);
    A.wall(C, "concrete", { x0: RW - 0.3, x1: CX0, z: 1.35 }, 0, 2.8, 0.3, []);
    for (let x = 14; x < 31; x += 2.4)
      for (const [z0, z1] of [
        [-9.2, -3],
        [3, 9.2],
      ]) {
        if (x > hole.x0 - 1.4 && x < hole.x1 + 0.4 && z0 > 0) continue;
        F.bookshelf(C, x, 0, (z0 + z1) / 2, z1 - z0, 2.4, Math.PI / 2, {
          key: "metal_olive",
          seed: ((x * 10) | 0) + z0,
          gaps: 0.3,
        });
      }
    for (const [x, z] of [
      [16, -5],
      [28, -5],
      [16, 6],
      [28, 6],
    ]) {
      A.tube(C, x, GY - 0.4, z, 0, 1.3, {
        light: false,
        dead: x === 28 && z > 0,
      });
    }
    F.rubble(C, 24.3, 0, 4, 2.0, 91, {
      h: 0.6,
      col: true,
      n: 12,
      chunk: "wood",
    });
    C.prop("file_cabinet", 31.4, 0, -8, -Math.PI / 2, { loot: "file_cabinet" });
    C.prop("file_cabinet", 31.4, 0, -7.1, -Math.PI / 2, {
      loot: "file_cabinet",
    });
    C.prop("skeleton", 29.5, 0, 8.5, -2.2, { pose: "sitting", collide: false });
    C.prop("first_aid", CX0 + 0.1, 1.4, 5, Math.PI / 2, {});
    const rrSign = T.sign(
      "rec",
      ["MUNICIPAL RECORDS", "BASEMENT — AUTHORIZED STAFF"],
      { bg: "#2a2a26", fg: "#e8e0c8", size: 44 },
      512,
      128,
    );
    b.quad(rrSign, CX0 + 0.02, 3.0, 0, 2.2, 0.55, Math.PI / 2);

    // ==============================================================
    // doors & anchors
    // ==============================================================
    const WS = { x: 74.45, y: 1.2, z: 604.7 }; // base of the world rotunda's cantilevered stair
    C.door({
      pos: new THREE.Vector3(WS.x, WS.y + 1.0, WS.z),
      label: "Grand Staircase — Second Floor",
      verb: "Climb",
      radius: 1.3,
      target: { x: C.O.x + 0, y: 0, z: C.O.z + 6.6, yaw: 0 },
      id: "li_ch_in",
    });
    C.door({
      pos: C.W(0, 1.4, RW - 0.25),
      label: "City Hall — Ground Floor",
      verb: "Exit",
      radius: 1.4,
      target: { x: 76.2, y: 1.2, z: 606.4, yaw: -2.4 },
      id: "li_ch_out",
    });
    C.anchor("entrance", 0, 0, 6.6, 0);
    C.anchor("boss", 0, GY, -20.5, 0);
    C.anchor("deputy", 0, GY, -21.8, 0);
    C.anchor("spawn1", -4, 0, -1, 0);
    C.anchor("spawn2", -20, GY, -5.5, 0);
    C.anchor("spawn3", 4, GY, -17, 0);
    C.anchor("spawn4", 19, GY, -5, -Math.PI / 2);
    C.anchor("spawn5", 18, 0, 0, -Math.PI / 2);
    C.anchor("spawn6", 5, GY, -7.8, 0);
    C.anchor("loot1", 7.4, GY, -25.4);
    C.anchor("loot2", 31.4, 0, -8);
    C.anchor("pod", -3, 0, 3, 0);
    C.pickup("li_note_council", 1, 29.5, GY + 1.72, 0.4, 0.2);
    C.pickup("li_reel_mayor", 1, 0.2, GY + 1.17, BZ0 + 2.5, 0);
    C.pickup("li_note_docent", 1, -20.6, GY + 0.02, 0.4, 0.4);
    C.pickup("rally_tonic", 1, 30.9, 1.25, 6.2, 0);
    C.finish();

    // ==============================================================
    // WORLD: landmarks_b's rotunda (ground floor, FY 1.2) — make the way up readable: the velvet rope at the foot of
    // the cantilevered stair unhooked and dropped, an easel sign facing the south doors, a brass floor directory,
    // and a dormant Patrolman greeter pod against the west wall (the robots upstairs are the same model).
    // ==============================================================
    const Wc = LI.cell("city_hall_world", { world: true });
    const wb = Wc.b;
    wb.ambient(0x000000, 0);
    const FY = WS.y,
      nb = { noBake: true };
    // stanchions either side of the stair foot; the rope hangs from one and lies on the marble
    const st1 = [73.05, 605.0],
      st2 = [75.35, 604.2];
    for (const [x, z] of [st1, st2]) {
      wb.cyl("brass", x, FY, z, 0.16, 0.18, 0.04, 12, nb);
      wb.cyl("brass", x, FY + 0.04, z, 0.03, 0.03, 0.9, 8, nb);
      wb.sphere("brass", x, FY + 0.97, z, 0.05, nb);
      Wc.col(x - 0.12, FY, z - 0.12, x + 0.12, FY + 1.0, z + 0.12, {
        walkable: false,
        surface: "metal",
      });
    }
    wb.rod(
      "fabric_red",
      [st1[0], FY + 0.9, st1[1]],
      [st1[0] + 0.25, FY + 0.45, st1[1] + 0.1],
      0.025,
      nb,
    );
    wb.rod(
      "fabric_red",
      [st1[0] + 0.25, FY + 0.45, st1[1] + 0.1],
      [st1[0] + 0.55, FY + 0.03, st1[1] + 0.3],
      0.025,
      nb,
    );
    wb.rod(
      "fabric_red",
      [st1[0] + 0.55, FY + 0.03, st1[1] + 0.3],
      [st1[0] + 1.3, FY + 0.03, st1[1] + 0.55],
      0.025,
      nb,
    );
    wb.cyl(
      "brass",
      st1[0] + 1.33,
      FY + 0.01,
      st1[1] + 0.56,
      0.035,
      0.035,
      0.08,
      6,
      Object.assign({ rz: Math.PI / 2 }, nb),
    );
    // easel sign facing the south doors
    const es = [73.6, 606.3],
      ery = Math.atan2(80 - es[0], 611 - es[1]);
    const easel = LI.texMat(
      "ch_easel",
      LI.canvasTex(
        "ch_easel",
        256,
        384,
        (x, W, H) => {
          x.fillStyle = "#1c2c5a";
          x.fillRect(0, 0, W, H);
          x.strokeStyle = "#c8a860";
          x.lineWidth = 6;
          x.strokeRect(10, 10, W - 20, H - 20);
          x.fillStyle = "#e8d8a0";
          x.textAlign = "center";
          x.textBaseline = "middle";
          LI.fitText(
            x,
            "CITY HALL",
            W / 2,
            58,
            W * 0.8,
            36,
            "bold %spx Georgia, serif",
          );
          x.fillRect(40, 84, W - 80, 2);
          LI.fitText(
            x,
            "SECOND FLOOR",
            W / 2,
            124,
            W * 0.8,
            26,
            "bold %spx Georgia, serif",
          );
          const lines = [
            "GOVERNOR'S ROOM",
            "BLUE ROOM",
            "COUNCIL CHAMBER",
            "MUNICIPAL SERVICES",
          ];
          lines.forEach((l, i) =>
            LI.fitText(
              x,
              l,
              W / 2,
              170 + i * 34,
              W * 0.82,
              18,
              "%spx Georgia, serif",
            ),
          );
          LI.fitText(
            x,
            "▲  VIA GRAND STAIRCASE",
            W / 2,
            322,
            W * 0.84,
            18,
            "bold %spx Georgia, serif",
          );
          LI.wear(x, W, H, 71, 0.55);
        },
        { clamp: true },
      ),
      { rough: 0.7 },
    );
    {
      const s = Math.sin(ery),
        c = Math.cos(ery);
      wb.obox(easel, es[0], FY + 1.25, es[1], 0.62, 0.92, 0.03, ery, {
        rx: -0.12,
        keepUV: true,
        noBake: true,
      });
      for (const k of [-1, 1])
        wb.obox(
          "wood_dark",
          es[0] + c * k * 0.26 - s * 0.05,
          FY + 0.8,
          es[1] - s * k * 0.26 - c * 0.05,
          0.04,
          1.65,
          0.04,
          ery,
          { rx: -0.12, noBake: true },
        );
      wb.obox(
        "wood_dark",
        es[0] - s * 0.35,
        FY + 0.75,
        es[1] - c * 0.35,
        0.04,
        1.5,
        0.04,
        ery,
        { rx: 0.25, noBake: true },
      );
      Wc.col(
        es[0] - 0.35,
        FY,
        es[1] - 0.35,
        es[0] + 0.35,
        FY + 1.6,
        es[1] + 0.35,
        { walkable: false, surface: "wood" },
      );
    }
    // brass floor directory on the west wall by the stair
    const dir = LI.texMat(
      "ch_dir",
      LI.signTex(
        "ch_dir",
        ["SECOND FLOOR ▲", "GOVERNOR'S ROOM · COUNCIL CHAMBER"],
        { bg: "#6a5028", fg: "#f0dca0", size: 44, border: "#f0dca0" },
        512,
        160,
      ),
      { rough: 0.45, metal: 0.5 },
    );
    wb.quad(dir, 72.86, FY + 1.75, 605.6, 1.1, 0.34, Math.PI / 2, nb);
    // dormant Patrolman greeter pod (west wall, clear of the stair's arc)
    const PX = 73.25,
      PZ = 596.2;
    wb.box("metal_olive", 72.8, FY, PZ - 0.62, 73.75, FY + 0.18, PZ + 0.62, nb);
    wb.box(
      "metal_olive",
      72.8,
      FY + 0.18,
      PZ - 0.62,
      72.95,
      FY + 2.5,
      PZ + 0.62,
      nb,
    );
    for (const k of [-1, 1])
      wb.box(
        "metal_olive",
        72.8,
        FY + 0.18,
        PZ + k * 0.62 - 0.05,
        73.75,
        FY + 2.5,
        PZ + k * 0.62 + 0.05,
        nb,
      );
    wb.box(
      "metal_olive",
      72.8,
      FY + 2.5,
      PZ - 0.67,
      73.8,
      FY + 2.66,
      PZ + 0.67,
      nb,
    );
    wb.cyl("glass", 73.2, FY + 0.18, PZ, 0.56, 0.56, 2.3, 16, {
      t0: Math.PI * 0.08,
      tl: Math.PI * 0.84,
      open: true,
      noBake: true,
    });
    wb.box(
      "led_green",
      73.77,
      FY + 2.28,
      PZ - 0.35,
      73.8,
      FY + 2.34,
      PZ - 0.25,
      nb,
    );
    const podSign = LI.texMat(
      "ch_pod",
      LI.signTex(
        "ch_pod",
        ["PATROLMAN", "CIVIC GREETER · UNIT 3"],
        { bg: "#2a3222", fg: "#e8e0b8", size: 40 },
        512,
        128,
      ),
      { rough: 0.6 },
    );
    wb.quad(podSign, 73.81, FY + 2.58, PZ, 1.1, 0.14, Math.PI / 2, nb);
    Wc.col(72.8, FY, PZ - 0.67, 73.8, FY + 2.66, PZ + 0.67, {
      walkable: false,
      surface: "metal",
    });
    // dormant robot inside (static silhouette): treads, barrel torso, a squared-off helmet head with a dead visor bar
    wb.cyl("metal_dark", PX, FY + 0.18, PZ, 0.22, 0.26, 0.5, 10, nb);
    wb.cyl("metal_olive", PX, FY + 0.68, PZ, 0.3, 0.24, 0.8, 12, nb);
    wb.box(
      "metal_olive",
      PX - 0.19,
      FY + 1.42,
      PZ - 0.2,
      PX + 0.19,
      FY + 1.8,
      PZ + 0.2,
      nb,
    );
    wb.box(
      "metal_dark",
      PX - 0.21,
      FY + 1.8,
      PZ - 0.22,
      PX + 0.21,
      FY + 1.85,
      PZ + 0.22,
      nb,
    );
    wb.box(
      "glass_dark",
      PX + 0.19,
      FY + 1.58,
      PZ - 0.15,
      PX + 0.21,
      FY + 1.65,
      PZ + 0.15,
      nb,
    );
    for (const k of [-1, 1])
      wb.cyl(
        "metal_dark",
        PX,
        FY + 1.05,
        PZ + k * 0.36,
        0.06,
        0.06,
        0.45,
        8,
        Object.assign({ rx: 0.2 * k }, nb),
      );
    Wc.glow(73.8, FY + 2.31, PZ - 0.3, 0x40ff70, 0.2, { dayFactor: 1 });
    Wc.finish();
    LI.chWorld = Wc;
    return C;
  }

  LI.addBuilder(KEY, 50, function () {
    LI.ch = build();
  });

  // ======================================================================
  // Gameplay: "Red Tape" — Form V-27 visitor pass pacifies the robots;
  // Deputy Mayor Pemberton-9 (the Key to the City)
  // ======================================================================
  const QID = "li_ch_redtape";
  const hasPass = () => LI.has("li_visitor_pass");
  LI.readyFns.push(function () {
    const C = LI.ch;
    if (!C) return;
    LI.defineItems([
      {
        id: "li_visitor_pass",
        type: "key",
        name: "Municipal Visitor Pass (Form V-27)",
        desc: "A laminated pass, still warm from the kiosk printer: VISITOR — ALL FLOORS — VALID UNTIL THE END OF THE CURRENT ADMINISTRATION. Municipal robots are programmed to respect it. Mostly.",
      },
      {
        id: "li_key_to_city",
        type: "misc",
        name: "The Key to the City",
        weight: 1,
        value: 750,
        mesh: "key",
        unique: true,
        tags: ["junk_valuable"],
        desc: 'A foot-long ceremonial key of gilded bronze in a velvet case. It opens nothing. It never did. Presented "for outstanding service to the City of New York" — the recipient\'s name has been scratched off and "YOU" scratched in.',
      },
      {
        id: "li_note_council",
        type: "note",
        name: "Council Agenda, 5 Mar 1967",
        title: "CITY COUNCIL — EMERGENCY SUNDAY SESSION — AGENDA",
        learn: LI.LOCKS.ch_council_term.id,
        text: '1. Roll call.\n2. Resolution renaming the IRT Lexington Avenue Line "the Freedom Line". (Tabled.)\n3. Resolution to fund public bomb shelters in all five boroughs. (Referred to committee — 19th time.)\n4. Resolution honouring the Office of Civil Defense for "keeping New Yorkers safe". (Adopted by acclamation.)\n5. Public comment. [A pencil note in the margin: "public comment cancelled — sirens"]\n\n[Another pencil note, at the bottom: "Speaker\'s teletype — QUORUM. Ha."]',
      },
      {
        id: "li_reel_mayor",
        type: "tape",
        name: "Tape Reel: Mayor's Address (unaired)",
        title: "Office of the Mayor — Draft Address, 5 March 1967",
        learn: LI.LOCKS.ch_mayor_safe.id,
        text: "[A man clears his throat. Paper rustles.]\n\nMAYOR: My fellow New Yorkers. Remain calm. Proceed in an orderly fashion to your assigned — [aside] — do we even HAVE assigned shelters? [muffled] We have ONE? For whom? [pause] ...For the Council.\n\n[Long silence.]\n\nMAYOR: Scratch that. Leave the doors open. Leave all the doors open. Tell the robots to let everybody in. [aside] And somebody get the Charter out of my safe — one, eight, oh, three, the year they laid the cornerstone — before—\n\n[A click. The robots, it seems, never got the second part.]",
      },
      {
        id: "li_note_docent",
        type: "note",
        name: "Docent Script (Patrolman Unit GR-2)",
        title: "GOVERNOR'S ROOM — DOCENT SCRIPT v4",
        text: 'WELCOME TO THE GOVERNOR\'S ROOM. THE DESK BEFORE YOU WAS USED BY THE FIRST PRESIDENT OF THE UNITED STATES. PLEASE DO NOT TOUCH THE DESK. PLEASE DO NOT TOUCH THE PRESIDENT.\n\nIF A VISITOR TOUCHES THE DESK: ISSUE WARNING.\nIF A VISITOR TOUCHES THE DESK TWICE: ISSUE CITATION.\nIF A VISITOR DOES NOT PRESENT A VISITOR PASS: SEE SUBROUTINE "REMOVAL".',
      },
    ]);
    LI.terminal("li_ch_kiosk", {
      title: "MUNICIPAL SERVICES KIOSK",
      header:
        'CITY OF NEW YORK — DEPARTMENT OF CITIZEN SERVICES\n"WE\'RE HERE TO HELP (DURING OFFICE HOURS)"',
      entries: [
        {
          title: "Office Hours",
          text: "City Hall is open to the public Monday–Friday, 9 a.m.–5 p.m. All visitors must display a valid Visitor Pass (Form V-27). Security robots will assist visitors without passes in leaving the building.",
        },
        {
          title: "Current Wait Time",
          text: "Your number: 71,204,118\nNow serving: 000\nEstimated wait: [OVERFLOW]",
        },
        {
          title: "Complaints",
          text: "To file a complaint about the security robots, please complete Form C-1 and present it to the security robots.",
        },
        {
          title: ">> Apply for Visitor Pass (Form V-27)",
          cond: () => !hasPass(),
          action: () => {
            if (!Q.started(QID)) Q.start(QID);
            if (
              LI.skill("electronics") >= 35 ||
              LI.skill("persuasion") >= 45 ||
              Q.flag("li_ch_forms")
            ) {
              LI.give("li_visitor_pass", 1);
              LI.sfx("terminal_success");
              Q.setStage(QID, "deputy");
            } else {
              Q.set("li_ch_forms");
              LI.notify(
                "APPLICATION REJECTED: incomplete. Please resubmit. (Try again.)",
              );
            }
          },
        },
      ],
    });
    LI.terminal("li_ch_art", {
      title: "GOVERNOR'S ROOM — COLLECTION",
      header: "CITY OF NEW YORK ART COMMISSION\nCOLLECTION MANAGEMENT",
      entries: [
        {
          title: "The Portraits",
          text: "The Governor's Room holds one of the finest collections of American portraiture — governors, mayors and at least one general who never paid for his sitting. Portraits are dusted by Patrolman GR-2 on a 30-minute cycle. GR-2 has now dusted each portrait approximately 3.8 million times.",
        },
        {
          title: "The Desk",
          text: "The writing desk under glass was used by the first President when the city was the nation's capital. Condition: excellent. Glass condition: excellent. Visitor condition: see GR-2 incident log.",
        },
      ],
    });
    LI.terminal("li_ch_council", {
      title: "CITY COUNCIL — SPEAKER'S TELETYPE",
      header: "COUNCIL OF THE CITY OF NEW YORK\nLEGISLATIVE RECORD",
      lock: {
        id: LI.LOCKS.ch_council_term.id,
        passcode: LI.LOCKS.ch_council_term.passcode,
      },
      entries: [
        {
          title: "Last Vote",
          text: 'Resolution 1967-0305-4 (honouring Civil Defense): AYES 51, NAYS 0.\nResolution 1967-0305-3 (public shelters): REFERRED.\n\nThe chamber floor has been reported "soft" near desk 12. Facilities requests 3,114 through 3,120 are pending.',
        },
        {
          title: "Deputy Mayor (Robotic) Pemberton-9",
          text: "In the event of the Mayor's absence, executive authority passes to the Deputy Mayor, a Valet unit programmed with the City Charter, Robert's Rules of Order and a very firm handshake. The Deputy Mayor may not be removed from office except by a two-thirds vote of the Council. The Council has not met since 1967.",
        },
      ],
    });
    LI.dialogue("dlg_li_deputy", {
      start: () =>
        hasPass() ? (Q.flag("li_ch_key_given") ? "after" : "pass") : "nopass",
      nodes: {
        nopass: {
          speaker: "Deputy Mayor Pemberton-9",
          text: "Citizen! You are not displaying a valid Form V-27. This press conference is for accredited visitors only. Please proceed to the Municipal Services kiosk in the rotunda. Security has been notified. Good day!",
          responses: [{ text: "On my way." }],
        },
        pass: {
          speaker: "Deputy Mayor Pemberton-9",
          text: "A Form V-27! Laminated! Oh, it has been SO long since anyone followed procedure. Welcome, welcome, esteemed visitor, to the Office of the Mayor. As acting Mayor for the past twenty-two... [whirr] ...and some years, it is my privilege to hear your concerns.",
          responses: [
            { text: "Where is everyone?", next: "where" },
            {
              text: "[Persuasion 50] I'd like to be recognised for outstanding service to the city.",
              check: { skill: "persuasion", value: 50 },
              next: "key",
              failNext: "form",
            },
            {
              text: "I'd like to make a civic contribution. (100 scrip)",
              cond: () => LI.scrip() >= 100,
              next: "key",
              action: () => {
                LI.giveScrip(-100);
              },
            },
            { text: "Goodbye, Deputy Mayor." },
          ],
        },
        where: {
          speaker: "Deputy Mayor Pemberton-9",
          text: 'The Mayor left to "check on the shelter" at 9:48 a.m. on March the 5th. The Council is in recess. The public has not come in for some time; I assume the lines are simply very long. Security continues to remove unaccredited visitors with great efficiency. It is the one department that has never missed a quota.',
          responses: [{ text: "I see.", next: "pass" }],
        },
        form: {
          speaker: "Deputy Mayor Pemberton-9",
          text: "Commendations require Form K-2, three letters of support and a vote of the Council. The Council is in recess. Is there anything else?",
          responses: [{ text: "Never mind." }],
        },
        key: {
          speaker: "Deputy Mayor Pemberton-9",
          text: "Splendid! By the authority vested in me by the Charter and a surprisingly flexible reading of it, I present you with THE KEY TO THE CITY! [A drawer shoots open. A velvet box rises on a little platform.] Please do not attempt to use it in any lock. It opens nothing. That is rather the point.",
          onEnter() {
            Q.set("li_ch_key_given");
            LI.give("li_key_to_city", 1);
            Q.setStage(QID, "done");
            const d = LI.npc("li_ch_deputy");
            if (d && Array.isArray(d.inventory))
              d.inventory = d.inventory.filter(
                (e) => e[0] !== "li_key_to_city",
              );
          },
          responses: [{ text: "Thank you, Deputy Mayor." }],
        },
        after: {
          speaker: "Deputy Mayor Pemberton-9",
          text: "The city thanks you, esteemed visitor. Please mind the Council Chamber floor. Facilities has been notified. Three thousand times.",
          responses: [{ text: "Goodbye." }],
        },
      },
    });
    Q.define({
      id: QID,
      name: "Red Tape",
      giver: "Municipal Services Kiosk",
      location: "City Hall",
      desc: 'City Hall\'s security robots are still removing "unaccredited visitors". The kiosk in the rotunda issues Form V-27 visitor passes — if you can get the application through.',
      stages: [
        {
          id: "pass",
          text: "Obtain a Visitor Pass (Form V-27) from the Municipal Services kiosk in the rotunda.",
          markers: () => [
            {
              x: C.O.x,
              z: C.O.z - 3.75,
              label: "Municipal Services",
              interior: true,
            },
          ],
        },
        {
          id: "deputy",
          text: "Present yourself to the acting Mayor, Deputy Mayor Pemberton-9, in the Blue Room.",
          markers: () => {
            const a = LI.npc("li_ch_deputy");
            return a
              ? [
                  {
                    x: a.pos.x,
                    z: a.pos.z,
                    label: "Deputy Mayor",
                    interior: true,
                  },
                ]
              : [];
          },
        },
        {
          id: "done",
          text: "The acting Mayor of New York presented you with the Key to the City. It opens nothing.",
          complete: true,
        },
      ],
      rewards: { xp: 200 },
    });
    // the patrolman pods by the kiosk (charging, arcing)
  });
  LI.spawnFns.push(function () {
    const C = LI.ch;
    if (!C) return;
    LI.spawnNPC(
      {
        id: "li_ch_deputy",
        type: "valet",
        name: "Deputy Mayor Pemberton-9",
        faction: "robots",
        ai: "guard",
        homeR: 3,
        hostile: !hasPass(),
        level: 8,
        hp: 240,
        noRespawn: true,
        dialogue: "dlg_li_deputy",
        voice: "valet_m",
        inventory: [
          ["scrip", 60],
          ["dry_cell", 1],
          ["relay_board", 1],
        ].concat(Q.flag("li_ch_key_given") ? [] : [["li_key_to_city", 1]]),
        barks: {
          idle: [
            "The city thanks you for your patience.",
            "Your call is important to us.",
            "Now serving: zero zero zero.",
          ],
          alert: [
            "Unaccredited visitor! Commencing removal!",
            "Please remain calm while you are escorted out. Permanently.",
          ],
        },
      },
      C.anchors.deputy,
    );
  });
  // Pemberton-9 is hostile until you hold a pass, so he is often scrapped first: the Key to the City is in his
  // drawer (his inventory) — looting it closes "Red Tape" instead of leaving it stuck at 'deputy'.
  G.events.on("itemAdded", (id) => {
    if (id !== "li_key_to_city" || Q.flag("li_ch_key_given")) return;
    Q.set("li_ch_key_given");
    if (!Q.started(QID)) Q.start(QID, "done");
    else Q.setStage(QID, "done");
  });
  // with a pass, municipal robots in the cell stand down (unless the player attacks them)
  let pt = 0;
  LI.animators.push({
    cell: null,
    fn(dt) {
      pt -= dt;
      if (pt > 0) return;
      pt = 1;
      const C = LI.ch;
      if (!C || !C.active || G.isStub("actors")) return;
      const pass = hasPass();
      for (const a of G.actors.list()) {
        if (!a || a.dead || a.faction !== "robots" || !LI.inCell(C, a.pos))
          continue;
        if (pass && !a.__liPass && !a.__liAttacked) {
          a.__liPass = true;
          try {
            a.setHostile(false);
          } catch (e) {
            /* */
          }
        } else if (!pass && a.__liPass) {
          delete a.__liPass;
          try {
            a.setHostile(true);
          } catch (e) {
            /* */
          }
        }
      }
    },
  });
  G.events.on("actorDamaged", (a, amt, info) => {
    try {
      if (!a || a.faction !== "robots" || !LI.ch || !LI.inCell(LI.ch, a.pos))
        return;
      if (info && (info.source === "player" || info.source === G.player)) {
        a.__liAttacked = true;
        if (a.__liPass) {
          delete a.__liPass;
          a.setHostile(true);
        }
      }
    } catch (e) {
      /* */
    }
  });
})();
