/* src/landmark_interiors/40_woolworth.js */
/* =====================================================================
 * NEW RAD CITY — landmark_interiors / 40_woolworth.js
 * WOOLWORTH BUILDING — "the Cathedral of Commerce", now the den of the
 * Five & Dime raiders.
 *
 * Cell 'woolworth_lobby' (origin 7000,0,1200). Local layout (+z south):
 *   CRUCIFORM LOBBY (y 0) : marble arcade under barrel vaults of gold glass
 *                           mosaic, gilded ribs, bronze elevator doors, the
 *                           carved grotesques (the founder counting nickels,
 *                           the architect cradling his tower), the raiders'
 *                           nickel hoard in the old five-and-dime counters
 *   GRAND STAIR → MEZZANINE (y 5.4): under the stained-glass laylight, the
 *                           allegorical murals "Labor" and "Commerce", a
 *                           gallery looking down into the arcade through
 *                           pointed arches; a raider tripwire on the stair
 *   OFFICE FLOOR (y 5.4)  : typing pool + the founder's "Empire Room"
 *   EXPRESS ELEVATOR → OBSERVATION CROWN (y 40): gothic lantern with lancet
 *                           windows over Lower Manhattan, the harbour and
 *                           the bridge; the raider queen Penny Dreadful's
 *                           nest; service stair back down (the loop)
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
  const KEY = "woolworth_lobby";

  function art() {
    const T = {};
    T.mosaic = LI.texMat(
      "ww_mosaic",
      LI.canvasTex("ww_mosaic", 1024, 1024, (x, W, H) => {
        const r = LI.rng(1913),
          n = 64,
          s = W / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const v = r();
            x.fillStyle =
              "rgb(" +
              Math.round(196 + v * 50) +
              "," +
              Math.round(146 + v * 44) +
              "," +
              Math.round(50 + v * 40) +
              ")";
            x.fillRect(i * s, j * s, s - 1, s - 1);
          }
        const tess = (cx, cy, R, col, R0) => {
          for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++) {
              const px = i * s + s / 2,
                py = j * s + s / 2,
                d = Math.hypot(px - cx, py - cy);
              if (d < R && d >= (R0 || 0)) {
                const v = r();
                x.fillStyle = col(v);
                x.fillRect(i * s, j * s, s - 1, s - 1);
              }
            }
        };
        const blue = (v) =>
          "rgb(" +
          Math.round(30 + v * 30) +
          "," +
          Math.round(60 + v * 40) +
          "," +
          Math.round(120 + v * 60) +
          ")";
        const green = (v) =>
          "rgb(" +
          Math.round(40 + v * 30) +
          "," +
          Math.round(100 + v * 40) +
          "," +
          Math.round(70 + v * 30) +
          ")";
        const red = (v) =>
          "rgb(" +
          Math.round(140 + v * 50) +
          "," +
          Math.round(40 + v * 30) +
          "," +
          Math.round(30 + v * 20) +
          ")";
        for (const [cx, cy] of [
          [256, 256],
          [768, 256],
          [256, 768],
          [768, 768],
        ]) {
          tess(cx, cy, 190, blue, 150);
          tess(cx, cy, 130, green, 90);
          tess(cx, cy, 40, red);
        }
        tess(512, 512, 110, blue, 70);
        tess(0, 512, 90, green, 50);
        tess(1024, 512, 90, green, 50);
        tess(512, 0, 90, green, 50);
        tess(512, 1024, 90, green, 50);
        // stars & birds in the medallions
        x.fillStyle = "#f8e8a0";
        for (const [cx, cy] of [
          [256, 256],
          [768, 256],
          [256, 768],
          [768, 768],
          [512, 512],
        ]) {
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * TAU;
            x.beginPath();
            x.moveTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30);
            x.lineTo(cx + Math.cos(a + 0.2) * 70, cy + Math.sin(a + 0.2) * 70);
            x.lineTo(cx + Math.cos(a - 0.2) * 70, cy + Math.sin(a - 0.2) * 70);
            x.fill();
          }
        }
        x.strokeStyle = "rgba(40,30,16,0.35)";
        x.lineWidth = 3;
        for (let k = 0; k < 4; k++) {
          x.beginPath();
          x.moveTo(0, k * 256 + 128);
          x.bezierCurveTo(
            256,
            k * 256,
            768,
            k * 256 + 256,
            1024,
            k * 256 + 128,
          );
          x.stroke();
        }
        LI.wear(x, W, H, 1913, 0.55);
      }),
      { metal: 0.45, rough: 0.35, emissive: 0.12 },
    );
    T.laylight = LI.texMat(
      "ww_laylight",
      LI.canvasTex(
        "ww_laylight",
        512,
        512,
        (x, W, H) => {
          const r = LI.rng(22);
          x.fillStyle = "#c89a38";
          x.fillRect(0, 0, W, H);
          for (let i = 0; i < 16; i++)
            for (let j = 0; j < 16; j++) {
              const v = r();
              x.fillStyle =
                v < 0.2
                  ? "#6a9a4a"
                  : v < 0.35
                    ? "#3a6a9a"
                    : v < 0.45
                      ? "#b83a2a"
                      : "rgb(" +
                        Math.round(220 + r() * 30) +
                        "," +
                        Math.round(170 + r() * 40) +
                        "," +
                        Math.round(70 + r() * 40) +
                        ")";
              x.fillRect(i * 32 + 2, j * 32 + 2, 28, 28);
            }
          x.strokeStyle = "#2a1a0a";
          x.lineWidth = 10;
          for (let k = 0; k < 4; k++) {
            x.beginPath();
            x.moveTo(k * 128 + 64, H);
            x.lineTo(k * 128 + 64, 150);
            x.quadraticCurveTo(k * 128 + 64, 40, k * 128 + 128, 20);
            x.quadraticCurveTo(k * 128 + 64 + 128, 40, k * 128 + 64 + 128, 150);
            x.stroke();
          }
          x.lineWidth = 16;
          x.strokeRect(0, 0, W, H);
          LI.wear(x, W, H, 9, 0.5);
        },
        { clamp: true },
      ),
      { emissive: 0.9, rough: 0.4 },
    );
    const mural = (id, seed, title, pal) =>
      LI.texMat(
        id,
        LI.canvasTex(
          id,
          512,
          768,
          (x, W, H) => {
            const r = LI.rng(seed);
            x.fillStyle = pal[0];
            x.fillRect(0, 0, W, H);
            x.fillStyle = pal[1];
            x.beginPath();
            x.moveTo(0, H);
            x.lineTo(0, H * 0.18);
            x.quadraticCurveTo(W / 2, -H * 0.05, W, H * 0.18);
            x.lineTo(W, H);
            x.fill();
            // robed allegorical figure
            const cx = W / 2,
              cy = H * 0.52;
            x.fillStyle = pal[2];
            x.beginPath();
            x.moveTo(cx - 90, H * 0.9);
            x.quadraticCurveTo(cx - 70, cy - 60, cx - 30, cy - 140);
            x.lineTo(cx + 30, cy - 140);
            x.quadraticCurveTo(cx + 80, cy - 40, cx + 100, H * 0.9);
            x.fill();
            x.fillStyle = "#e8c8a0";
            x.beginPath();
            x.ellipse(cx, cy - 175, 34, 42, 0, 0, TAU);
            x.fill();
            x.fillStyle = pal[3];
            x.beginPath();
            x.ellipse(cx, cy - 200, 40, 26, 0, Math.PI, TAU);
            x.fill();
            x.strokeStyle = pal[3];
            x.lineWidth = 10;
            if (seed % 2) {
              x.beginPath();
              x.moveTo(cx + 40, cy - 90);
              x.lineTo(cx + 150, cy - 230);
              x.stroke();
              x.beginPath();
              x.arc(cx + 150, cy - 250, 40, 0, TAU);
              x.stroke();
              for (let k = 0; k < 10; k++) {
                const a = (k / 10) * TAU;
                x.beginPath();
                x.moveTo(
                  cx + 150 + Math.cos(a) * 40,
                  cy - 250 + Math.sin(a) * 40,
                );
                x.lineTo(
                  cx + 150 + Math.cos(a) * 55,
                  cy - 250 + Math.sin(a) * 55,
                );
                x.stroke();
              }
            } else {
              x.beginPath();
              x.moveTo(cx - 40, cy - 90);
              x.lineTo(cx - 150, cy - 180);
              x.stroke();
              x.fillStyle = pal[3];
              x.beginPath();
              x.moveTo(cx - 200, cy - 190);
              x.lineTo(cx - 100, cy - 190);
              x.lineTo(cx - 120, cy - 150);
              x.lineTo(cx - 180, cy - 150);
              x.fill();
              x.fillRect(cx - 155, cy - 260, 6, 70);
              x.beginPath();
              x.moveTo(cx - 152, cy - 260);
              x.lineTo(cx - 110, cy - 215);
              x.lineTo(cx - 152, cy - 215);
              x.fill();
            }
            x.fillStyle = pal[3];
            x.font = "bold 44px Georgia, serif";
            x.textAlign = "center";
            x.fillText(title, cx, H * 0.96);
            for (let k = 0; k < 20; k++) {
              x.fillStyle = "rgba(255,230,160," + (r() * 0.3).toFixed(2) + ")";
              x.beginPath();
              x.arc(r() * W, r() * H * 0.4, 2 + r() * 4, 0, TAU);
              x.fill();
            }
            x.strokeStyle = "#c8a040";
            x.lineWidth = 18;
            x.strokeRect(0, 0, W, H);
            LI.wear(x, W, H, seed, 0.8);
          },
          { clamp: true },
        ),
        { rough: 0.9 },
      );
    T.labor = mural("ww_labor", 7, "LABOR", [
      "#1a2a3a",
      "#3a5a6a",
      "#8a4a2a",
      "#e0b858",
    ]);
    T.commerce = mural("ww_commerce", 8, "COMMERCE", [
      "#2a1a2a",
      "#5a3a4a",
      "#2a5a4a",
      "#e0b858",
    ]);
    // crown lancets look out over lower Manhattan (shared kit panorama): City Hall Park & the civic towers,
    // the harbour with Liberty to the south, the Brooklyn Bridge to the east
    T.pano = (id, seed, kind) =>
      LI.skylineMat(id, {
        W: 1536,
        H: 768,
        seed,
        horizon: kind === "harbor" ? 0.62 : 0.76,
        kind,
        water:
          kind === "harbor"
            ? [[0, 0.62]]
            : kind === "bridge"
              ? [[0.05, 0.95]]
              : [],
        park: kind === "city" && seed === 31 ? [[0.3, 0.55]] : [],
        marks:
          kind === "harbor"
            ? [{ u: 0.3, kind: "liberty" }]
            : kind === "bridge"
              ? [{ u: 0.5, kind: "bridge" }]
              : [{ u: 0.7, kind: "spire" }],
      });
    T.sign = (id, lines, st, w, h) =>
      LI.texMat("ww_sign_" + id, LI.signTex("ww_" + id, lines, st, w, h), {
        rough: 0.8,
      });
    T.portrait = LI.texMat(
      "ww_portrait",
      LI.canvasTex(
        "ww_portrait",
        256,
        384,
        (x, W, H) => {
          LI.portrait(x, 0, 0, W, H, 5);
          x.fillStyle = "#c8a040";
          x.font = "bold 18px Georgia";
          x.textAlign = "center";
          x.fillText("THE EMPEROR", W / 2, H - 14);
        },
        { clamp: true },
      ),
      { rough: 0.8 },
    );
    return T;
  }

  /** A grotesque corbel figure (tiny carved person) at (x,y,z) facing ry. */
  function grotesque(C, x, y, z, ry, kind) {
    const b = C.b;
    const P = (lx, ly, lz) => {
      const p = LI.rot(lx, lz, x, z, ry);
      return [p[0], y + ly, p[1]];
    };
    const k = "limestone";
    const c = P(0, 0, 0);
    b.obox(k, c[0], c[1] - 0.1, c[2], 0.7, 0.2, 0.5, ry);
    const bd = P(0, 0.3, 0.02);
    b.obox(k, bd[0], bd[1], bd[2], 0.38, 0.45, 0.3, ry);
    const hd = P(0, 0.64, 0);
    b.sphere(k, hd[0], hd[1], hd[2], 0.15, { ws: 8, hs: 6 });
    if (kind === "nickel") {
      const h = P(0.12, 0.35, -0.2);
      b.cyl("brass", h[0], h[1], h[2], 0.06, 0.06, 0.02, 8, {
        rx: Math.PI / 2,
      });
      const s = P(-0.1, 0.1, -0.2);
      b.obox("brass", s[0], s[1], s[2], 0.18, 0.12, 0.12, ry);
    } else {
      const m = P(0, 0.4, -0.22);
      b.obox(k, m[0], m[1], m[2], 0.08, 0.5, 0.08, ry);
      const t = P(0, 0.7, -0.22);
      b.cyl(k, t[0], t[1], t[2], 0.0, 0.05, 0.15, 4);
    }
  }

  function build() {
    const C = LI.cell(KEY);
    C.site = "woolworth";
    const b = C.b,
      T = art();
    b.ambient(0x2c2620, 1);
    // ------------- lights -------------
    for (const x of [-12, -4, 4, 12, 19])
      b.light(x, 9.5, 0, 0xffd8a0, 12, 0.75);
    for (const z of [-10, 10]) b.light(0, 9.5, z, 0xffd8a0, 11, 0.7);
    b.light(0, 11, 0, 0xffe8c0, 12, 0.7);
    b.light(-20, 10.5, 0, 0xffc870, 14, 1.0); // laylight
    for (const [x, z] of [
      [-3, -9],
      [2, -12],
    ])
      b.light(x, 1.2, z, 0xff9040, 7, 0.9); // raider fire barrels
    b.light(0, 3, 12, 0xffd090, 7, 0.6);
    for (const [x, z] of [
      [-14, -7.2],
      [-9, -7.2],
    ])
      b.light(x, 8.3, z, 0xffd8a0, 8, 0.6);
    for (const [x, z] of [
      [-23, -21],
      [-12, -21],
      [-12, -14],
    ])
      b.light(x, 8.2, z, 0xf0f4ff, 10, 0.75);
    b.light(-23, 8.6, -21, 0xffd090, 9, 0.6);
    // crown
    const CX = 68,
      CZ = 0,
      CY = 40;
    b.light(CX, CY + 6, CZ, 0xffe0b0, 12, 0.7);
    b.light(CX - 5, CY + 2.5, CZ, 0xd8e0c0, 8, 0.6);
    b.light(CX + 5, CY + 2.5, CZ, 0xd8e0c0, 8, 0.6);
    b.light(CX, CY + 1.2, CZ + 4.5, 0xff9040, 6, 0.9);

    // ==============================================================
    // CRUCIFORM LOBBY
    // ==============================================================
    const AX0 = -16,
      AX1 = 22,
      AW = 4.5,
      VS = 7.5,
      R = 4.5;
    A.floor(C, "marble_warm", AX0, -AW, AX1, AW, 0.02, {
      col: false,
      th: 0.05,
    });
    A.floor(C, "marble_warm", -AW, -14, AW, 14, 0.021, {
      col: false,
      th: 0.05,
    });
    for (let x = AX0 + 2; x < AX1; x += 4)
      b.box("marble_dark", x - 1.2, 0.03, -1.2, x + 1.2, 0.036, 1.2, {
        noAO: true,
      });
    for (let z = -12; z <= 12; z += 4)
      b.box("marble_dark", -1.2, 0.031, z - 1.2, 1.2, 0.037, z + 1.2, {
        noAO: true,
      });
    // arcade walls (marble to the spring line) with blind arcades, openings to the arms and the gallery arches (north)
    const galArches = [
      { a: -15.5, b: -12.5, sill: 6.2, top: VS - 0.2 },
      { a: -11.5, b: -8.5, sill: 6.2, top: VS - 0.2 },
    ];
    A.wall(
      C,
      "marble_warm",
      { x0: AX0, x1: -AW, z: -AW - 0.2 },
      0,
      VS,
      0.4,
      galArches,
    );
    A.wall(C, "marble_warm", { x0: AW, x1: AX1, z: -AW - 0.2 }, 0, VS, 0.4, []);
    A.wall(C, "marble_warm", { x0: AX0, x1: -AW, z: AW + 0.2 }, 0, VS, 0.4, []);
    A.wall(C, "marble_warm", { x0: AW, x1: AX1, z: AW + 0.2 }, 0, VS, 0.4, []);
    A.wall(
      C,
      "marble_warm",
      { z0: -14, z1: -AW, x: -AW - 0.2 },
      0,
      VS,
      0.4,
      [],
    );
    A.wall(C, "marble_warm", { z0: -14, z1: -AW, x: AW + 0.2 }, 0, VS, 0.4, []);
    A.wall(C, "marble_warm", { z0: AW, z1: 14, x: -AW - 0.2 }, 0, VS, 0.4, []);
    A.wall(C, "marble_warm", { z0: AW, z1: 14, x: AW + 0.2 }, 0, VS, 0.4, []);
    A.wall(C, "marble_warm", { x0: -AW, x1: AW, z: -14.2 }, 0, VS + R, 0.4, []);
    b.box("bronze", -1.3, 0, -14.02, 1.3, 2.7, -13.98);
    A.wall(C, "marble_warm", { x0: -AW, x1: AW, z: 14.2 }, 0, VS + R, 0.4, []);
    A.wall(
      C,
      "marble_warm",
      { z0: -AW, z1: AW, x: AX1 + 0.2 },
      0,
      VS + R,
      0.4,
      [],
    );
    b.box("bronze", AX1 - 0.02, 0, -1.7, AX1, 3.3, 1.7);
    b.quad("glass_dark", AX1 - 0.04, 1.55, 0, 3.0, 2.9, -Math.PI / 2);
    b.quad(
      "planks" in LI.MAT ? "planks" : "wood_rotten",
      AX1 - 0.06,
      1.6,
      0,
      2.6,
      2.6,
      -Math.PI / 2,
    );
    // west end: open to the stair hall (wall above only)
    b.box("marble_warm", AX0 - 0.4, 5.9, -AW, AX0, VS + R, AW);
    C.col(AX0 - 0.4, 5.9, -AW, AX0, VS + R, AW, { walkable: false });
    // barrel vaults (mosaic) + gilded ribs
    const barrelVault = (x0, x1, z0, z1, alongX) => {
      const L = alongX ? x1 - x0 : z1 - z0;
      const g = new THREE.CylinderGeometry(R, R, L, 28, 1, true, 0, Math.PI);
      if (alongX) g.rotateZ(Math.PI / 2);
      else {
        g.rotateZ(Math.PI / 2);
        g.rotateY(Math.PI / 2);
      }
      g.translate(alongX ? (x0 + x1) / 2 : 0, VS, alongX ? 0 : (z0 + z1) / 2);
      b.add(T.mosaic, g, {
        flip: true,
        keepUV: true,
        us: (Math.PI * R) / 4,
        vs: L / 4,
        noAO: true,
      });
    };
    barrelVault(AX0, AX1, 0, 0, true);
    barrelVault(0, 0, -14, 14, false);
    for (let x = AX0 + 2; x < AX1; x += 4) {
      if (Math.abs(x) < AW) continue;
      A.arch(C, "gold", x, VS, 0, 2 * R - 0.04, 0.3, 0.18, "z");
    }
    for (let z = -12; z <= 12; z += 4) {
      if (Math.abs(z) < AW) continue;
      A.arch(C, "gold", 0, VS, z, 2 * R - 0.04, 0.3, 0.18, "x");
    }
    b.box("gold", AX0, VS - 0.2, -AW + 0.02, AX1, VS, -AW + 0.14);
    b.box("gold", AX0, VS - 0.2, AW - 0.14, AX1, VS, AW - 0.02);
    b.box("gold", -AW + 0.02, VS - 0.2, -14, -AW + 0.14, VS, 14);
    b.box("gold", AW - 0.14, VS - 0.2, -14, AW - 0.02, VS, 14);
    // lanterns (bronze gothic)
    for (const [x, z] of [
      [-12, 0],
      [-4, 0],
      [4, 0],
      [12, 0],
      [19, 0],
      [0, -10],
      [0, 10],
      [0, 0],
    ]) {
      b.rod("bronze", [x, VS + 1, z], [x, VS + R, z], 0.02);
      b.cyl("bronze", x, VS - 0.2, z, 0.35, 0.25, 0.12, 6);
      b.cyl("lamp", x, VS - 0.1, z, 0.3, 0.3, 0.8, 6);
      b.cyl("bronze", x, VS + 0.7, z, 0.05, 0.38, 0.4, 6);
    }
    // blind arcade + bronze mail chute + directory on the arcade walls
    for (let x = AX0 + 2; x < AX1 - 1; x += 4) {
      if (Math.abs(x) < AW + 1) continue;
      for (const s of [-1, 1]) {
        const z = s * (AW - 0.02);
        b.box("marble_warm", x - 1.4, 0, z - s * 0.06, x + 1.4, 4.2, z, {
          c: 0xb89a6a,
        });
        b.box(
          "marble_green",
          x - 1.0,
          0.5,
          z - s * 0.09,
          x + 1.0,
          3.5,
          z - s * 0.05,
        );
        b.box("bronze", x - 1.4, 0, z - s * 0.1, x + 1.4, 0.25, z - s * 0.05);
        A.arch(C, "bronze", x, 4.2, z - s * 0.02, 2.8, 0.1, 0.12, "z");
      }
    }
    b.box("bronze", 10.7, 0.9, -AW + 0.02, 11.3, 6.2, -AW + 0.18);
    b.box("brass", 10.8, 1.0, -AW + 0.18, 11.2, 1.6, -AW + 0.24);
    const dir = T.sign(
      "dir",
      [
        "WOOLWORTH BUILDING",
        "EXECUTIVE OFFICES — MEZZANINE · OBSERVATION — 57TH FLOOR",
      ],
      { bg: "#1a120a", fg: "#e8c860", border: "#e8c860", size: 42 },
      1024,
      160,
    );
    b.quad(dir, 17, 2.4, AW - 0.04, 3.4, 0.54, Math.PI, { noAO: true });
    // grotesques on the corbels at the crossing
    grotesque(C, -AW + 0.25, VS - 0.8, -AW + 0.25, Math.PI * 0.25, "nickel");
    grotesque(C, AW - 0.25, VS - 0.8, -AW + 0.25, -Math.PI * 0.25, "architect");
    grotesque(C, -AW + 0.25, VS - 0.8, AW - 0.25, Math.PI * 0.75, "architect");
    grotesque(C, AW - 0.25, VS - 0.8, AW - 0.25, -Math.PI * 0.75, "nickel");
    // the Founder's memorial box under the nickel-counting grotesque (quest "Nothing Over Ten Cents")
    {
      const mx = -AW + 0.75,
        mz = -AW + 0.75;
      b.box("marble_dark", mx - 0.35, 0, mz - 0.35, mx + 0.35, 1.0, mz + 0.35);
      b.box(
        "marble_warm",
        mx - 0.42,
        1.0,
        mz - 0.42,
        mx + 0.42,
        1.08,
        mz + 0.42,
      );
      b.box("bronze", mx - 0.25, 1.08, mz - 0.2, mx + 0.25, 1.36, mz + 0.2);
      b.obox(
        "brass",
        mx + 0.13,
        1.37,
        mz + 0.13,
        0.12,
        0.012,
        0.03,
        Math.PI / 4,
      ); // the coin slot
      const plq = T.sign(
        "memorial",
        ["F. W. W. — 1852 · 1919", "DEPOSIT THE FIRST NICKEL"],
        { bg: "#3a2a14", fg: "#e8c860", border: "#e8c860", size: 40 },
        512,
        160,
      );
      b.quad(plq, mx, 0.72, mz + 0.36, 0.62, 0.2, 0);
      b.quad(plq, mx + 0.36, 0.72, mz, 0.62, 0.2, Math.PI / 2);
      C.col(mx - 0.42, 0, mz - 0.42, mx + 0.42, 1.36, mz + 0.42, {
        walkable: false,
      });
      C.anchor("memorial", mx + 0.5, 1.2, mz + 0.5, Math.PI / 4);
    }
    // elevator banks (south arm)
    for (const s of [-1, 1])
      for (const z of [7, 11]) {
        const x = s * (AW - 0.02);
        b.box("bronze", x - s * 0.1, 0, z - 1.1, x, 3.0, z + 1.1);
        for (let k = 0; k < 4; k++)
          b.box(
            "brass",
            x - s * 0.13,
            0.4 + k * 0.7,
            z - 0.9,
            x - s * 0.1,
            0.5 + k * 0.7,
            z + 0.9,
          );
        b.box(
          "lamp_amber",
          x - s * 0.12,
          3.15,
          z - 0.4,
          x - s * 0.1,
          3.35,
          z + 0.4,
        );
      }
    b.box("bronze", -1.3, 0, 13.98, 1.3, 2.9, 14.02);
    b.box("lamp", -0.7, 3.0, 13.96, 0.7, 3.2, 14.0);
    const obsSign = T.sign(
      "obs",
      ["EXPRESS · OBSERVATION", "FIFTY-SEVENTH FLOOR — ADMISSION 50¢"],
      { bg: "#1a120a", fg: "#e8c860", size: 44 },
      512,
      128,
    );
    b.quad(obsSign, 0, 3.6, 13.96, 2.4, 0.6, Math.PI);
    // raider den in the north arm: the old five-and-dime counters, the nickel hoard, bedding, fires
    for (const s of [-1, 1]) {
      b.box("wood_dark", s * 3.3 - 0.45, 0, -13, s * 3.3 + 0.45, 1.0, -7);
      b.box("glass", s * 3.3 - 0.4, 1.0, -12.9, s * 3.3 + 0.4, 1.02, -7.1);
      C.col(s * 3.3 - 0.45, 0, -13, s * 3.3 + 0.45, 1.0, -7, {
        walkable: false,
      });
    }
    for (let i = 0; i < 60; i++) {
      const r = LI.rng(i * 7 + 3);
      const a = r() * TAU,
        d = Math.sqrt(r()) * 1.1;
      b.cyl(
        "brass",
        0.2 + Math.cos(a) * d,
        0.03 + r() * 0.25 * (1 - d),
        -11.8 + Math.sin(a) * d,
        0.1,
        0.1,
        0.02,
        8,
        { rx: (r() - 0.5) * 0.6 },
      );
    }
    b.cyl("brass", 0.2, 0, -11.8, 1.1, 1.3, 0.2, 16);
    for (const [x, z, ry] of [
      [-2.2, -5.8, 0.2],
      [2.4, -6.2, -0.3],
      [-2.6, 6.2, 1.4],
    ])
      b.obox("fabric", x, 0.1, z, 0.9, 0.2, 1.9, ry, { c: 0x8a7a5a });
    C.prop("barrel", -3, 0, -9, 0, { burning: true });
    C.prop("barrel", 2, 0, -12.5, 0, { burning: true });
    const fdSign = T.sign(
      "fd",
      ["FIVE & DIME", "OF DEATH"],
      {
        bg: "#6a6456",
        fg: "#f2d64a",
        size: 70,
        font: "bold %spx Impact, sans-serif",
      },
      512,
      192,
    );
    b.quad(fdSign, 0, 5.2, -13.95, 4, 1.5, 0, { noAO: true });
    C.prop("footlocker", -3.6, 0, -13.4, 0, {
      loot: "raider_stash",
      owner: "raiders",
    });
    C.prop("scrip_stash", 3.4, 1.0, -12.3, 0, {});
    C.prop("skeleton", 3.6, 0, 12.8, Math.PI, {
      pose: "sitting",
      collide: false,
    });
    F.rubble(C, 14, 0, 2.6, 1.4, 41, {
      h: 0.5,
      col: true,
      n: 8,
      chunk: "marble_warm",
    });
    F.papers(C, 8, 0.04, 0, 3, 14, 404);

    // ==============================================================
    // GRAND STAIR (west) → MEZZANINE LANDING (y 5.4) under the laylight
    // ==============================================================
    const MY = 5.4;
    A.stairs(C, "marble_warm", AX0, 0, "w", 6, 0, MY, { nose: "bronze" });
    const SX1 = AX0 - 7.5; // stair top x (−23.5)
    for (const s of [-1, 1]) {
      A.balustrade(C, "bronze", [AX0, s * 3.1], [SX1, s * 3.1], 0, 1.0, {
        col: false,
      });
      b.box(
        "marble_warm",
        SX1,
        0,
        s * 3.05 - 0.05 * s,
        AX0,
        1.0,
        s * 3.1 + 0.2 * s,
      );
    }
    A.wall(
      C,
      "marble_warm",
      { x0: SX1 - 5, x1: AX0, z: -3.35 },
      0,
      MY,
      0.3,
      [],
    );
    A.wall(C, "marble_warm", { x0: SX1 - 5, x1: AX0, z: 3.35 }, 0, MY, 0.3, []);
    // landing & mezzanine hall (x -28.5..-23.5, z -10..10)
    const LX0 = SX1 - 5,
      LX1 = SX1;
    A.floor(C, "marble_warm", LX0, -10, LX1 + 0.05, 10, MY, { solid: true });
    A.floor(C, "marble_warm", LX1, -10, AX0 - 0.4, -3.35, MY, { solid: true });
    A.floor(C, "marble_warm", LX1, 3.35, AX0 - 0.4, 10, MY, { solid: true });
    const HY = MY + 7.2;
    A.wall(
      C,
      "marble_warm",
      { z0: -10, z1: 10, x: LX0 - 0.2 },
      MY,
      HY,
      0.4,
      [],
    );
    A.wall(C, "marble_warm", { x0: LX0, x1: AX0, z: 10.2 }, MY, HY, 0.4, []);
    A.wall(
      C,
      "marble_warm",
      { x0: LX0, x1: -6, z: -10.2 },
      MY,
      HY,
      0.4,
      [{ a: -27.2, b: -24.8, top: MY + 2.7 }],
      { casing: "bronze" },
    );
    A.wall(
      C,
      "marble_warm",
      { z0: 3.35, z1: 10, x: AX0 - 0.2 },
      0,
      HY,
      0.4,
      [],
    );
    A.ceil(C, "plaster_warm", LX0, -10, AX0, 10, HY);
    b.box("bronze", LX0 + 1, HY - 0.3, -6, AX0 - 1, HY - 0.02, 6);
    b.quad(
      T.laylight,
      (LX0 + AX0) / 2,
      HY - 0.35,
      0,
      AX0 - LX0 - 2.4,
      11.4,
      0,
      { rx: Math.PI / 2, noAO: true },
    );
    for (let x = LX0 + 1.5; x < AX0 - 1; x += 3.3)
      b.box("bronze", x - 0.06, HY - 0.36, -6, x + 0.06, HY - 0.3, 6);
    // the murals on the landing's end walls
    b.quad(T.commerce, LX0 + 0.01, MY + 3.4, 5.5, 3.6, 5.4, Math.PI / 2, {
      noAO: true,
    });
    b.quad(T.labor, LX0 + 0.01, MY + 3.4, -5.5, 3.6, 5.4, Math.PI / 2, {
      noAO: true,
    });
    for (const z of [-5.5, 5.5]) {
      b.box("gold", LX0, MY + 0.6, z - 1.95, LX0 + 0.08, MY + 6.2, z - 1.8);
      b.box("gold", LX0, MY + 0.6, z + 1.8, LX0 + 0.08, MY + 6.2, z + 1.95);
    }
    for (const s2 of [-1, 1])
      A.balustrade(
        C,
        "bronze",
        [LX1, s2 * 3.45],
        [AX0 - 0.4, s2 * 3.45],
        MY,
        1.0,
      );
    // gallery corridor north of the arcade (x -23.5..-6, z -10..-4.9) looking down through the pointed arches
    A.floor(C, "marble_warm", -23.5, -10, -6, -4.9, MY, { solid: true });
    A.ceil(C, "plaster_warm", -16, -10, -6, -4.9, MY + 3.2);
    A.wall(
      C,
      "marble_warm",
      { z0: -10, z1: -4.9, x: -5.8 },
      MY,
      MY + 3.2,
      0.4,
      [],
    );
    for (const [a0, a1] of [
      [-15.5, -12.5],
      [-11.5, -8.5],
    ]) {
      b.box("bronze", a0, MY, -4.8, a1, MY + 1.0, -4.6);
      C.col(a0, MY, -4.8, a1, MY + 1.0, -4.6, { walkable: false });
    }
    // tripwire on the stair (raider trap) — see gameplay below
    C.trap = {
      a: [AX0 - 3.0, MY * 0.4 + 0.25, -2.9],
      b: [AX0 - 3.0, MY * 0.4 + 0.25, 2.9],
    };
    b.rod("steel", C.trap.a, C.trap.b, 0.006);
    for (const s of [-1, 1]) {
      b.cyl("metal_olive", AX0 - 3.0, MY * 0.4, s * 2.9, 0.06, 0.06, 0.16, 8);
      b.sphere("metal_olive", AX0 - 3.0, MY * 0.4 + 0.25, s * 2.95, 0.05);
    }

    // ==============================================================
    // OFFICE FLOOR (y 5.4): typing pool (x -18..-6) + the Empire Room (x -28.5..-18)
    // ==============================================================
    const OZ0 = -26,
      OZ1 = -10.4,
      OH = MY + 3.6;
    A.floor(C, "wood", LX0, OZ0, -6, OZ1, MY, { solid: true });
    A.ceil(C, "plaster", -18, OZ0, -6, OZ1, OH);
    A.wall(C, "plaster", { x0: -18, x1: -6, z: OZ0 - 0.15 }, MY, OH, 0.3, []);
    A.wall(C, "plaster", { z0: OZ0, z1: OZ1, x: -5.85 }, MY, OH, 0.3, []);
    A.wall(
      C,
      "wood_dark",
      { z0: OZ0, z1: OZ1, x: -18 },
      MY,
      OH,
      0.3,
      [{ a: -22.2, b: -20.2, top: MY + 2.6 }],
      { casing: "gold" },
    );
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const x = -15.5 + c * 3.4,
          z = -23 + r * 4;
        F.desk(C, x, MY, z, 1.6, 0.8, 0, { key: "wood", col: true });
        F.chair(C, x, MY, z + 0.9, 0, {
          key: "wood_dark",
          toppled: (r + c) % 4 === 1,
        });
        b.box(
          "metal_dark",
          x - 0.25,
          MY + 0.77,
          z - 0.15,
          x + 0.25,
          MY + 0.95,
          z + 0.2,
        );
        b.box(
          "paper",
          x - 0.15,
          MY + 0.95,
          z - 0.12,
          x + 0.15,
          MY + 1.1,
          z - 0.1,
        );
      }
    for (const [x, z] of [
      [-12, -21],
      [-12, -14],
    ])
      A.tube(C, x, OH - 0.05, z, 0, 1.3, { light: false, dead: z === -14 });
    C.prop("file_cabinet", -6.6, MY, -25.4, -Math.PI / 2, {
      loot: "file_cabinet",
    });
    C.prop("file_cabinet", -6.6, MY, -24.5, -Math.PI / 2, {
      loot: "file_cabinet",
    });
    C.prop("skeleton", -12.2, MY, -18.2, 0.4, {
      pose: "seated",
      collide: false,
    });
    F.papers(C, -12, MY + 0.02, -17, 4, 30, 505);
    // Empire Room: green marble, gilt, the Emperor's portrait, the founder's desk
    const EX0 = LX0,
      EX1 = -18;
    A.ceil(C, "gold_leaf", EX0, OZ0, EX1, OZ1, OH + 0.6);
    A.wall(
      C,
      "marble_green",
      { x0: EX0, x1: EX1, z: OZ0 - 0.15 },
      MY,
      OH + 0.6,
      0.3,
      [],
    );
    A.wall(
      C,
      "marble_green",
      { z0: OZ0, z1: OZ1, x: EX0 - 0.15 },
      MY,
      OH + 0.6,
      0.3,
      [],
    );
    for (let x = EX0 + 1; x < EX1; x += 2.4)
      b.box("gold", x - 0.12, MY, OZ0 + 0.01, x + 0.12, OH + 0.5, OZ0 + 0.12);
    F.frame(C, T.portrait, -23, MY + 2.6, OZ0 + 0.1, 1.6, 2.4, 0, {});
    F.desk(C, -23, MY, -21, 2.6, 1.2, Math.PI, { key: "wood_dark" });
    F.chair(C, -23, MY, -22.2, Math.PI, {
      key: "wood_dark",
      seat: "fabric_green",
    });
    F.sofa(C, -26.8, MY, -15, 2.2, Math.PI / 2, { key: "fabric_green" });
    A.chandelier(C, -23, OH - 0.8, -18, OH + 0.6, 0.9, { light: false });
    C.prop("safe", -27.9, MY, -24.8, Math.PI / 2, {
      loot: "safe",
      locked: 0,
      lock: LI.LOCKS.ww_mezz_safe,
      owner: "raiders",
      name: "Petty Cash Safe",
    });
    C.prop("terminal", -24.1, MY + 0.77, -21.2, 0, {
      terminalId: "li_ww_office",
      mount: "bare",
    });
    const erSign = T.sign(
      "er",
      ["THE EMPIRE ROOM", "PRIVATE"],
      { bg: "#1a2a1e", fg: "#e8c860", size: 52 },
      512,
      128,
    );
    b.quad(erSign, -18.2, MY + 2.9, -21.2, 1.8, 0.45, -Math.PI / 2);

    // ==============================================================
    // OBSERVATION CROWN (x 61..75, z -7..7, floor 40)
    // ==============================================================
    const K0 = CX - 7,
      K1 = CX + 7,
      KH = CY + 7;
    C.col(K0 - 1, CY - 0.5, CZ - 8, K1 + 1, CY, CZ + 8, {});
    b.box("terrazzo", K0, CY - 0.3, CZ - 7, K1, CY, CZ + 7, { noAO: true });
    // walls with lancet windows on all four sides
    const lancets = (p, q, faceRy, pano) => {
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const gaps = [];
      for (let k = 0; k < 4; k++) {
        const c = ((k + 0.5) / 4) * L;
        gaps.push({ a: c - 1.1, b: c + 1.1, sill: CY + 0.9, top: CY + 4.6 });
      }
      A.wallLine(C, "limestone", p, q, CY, KH, 0.6, gaps, {});
      const ux = (q[0] - p[0]) / L,
        uz = (q[1] - p[1]) / L,
        nx = -uz,
        nz = ux;
      for (const g of gaps) {
        const c = (g.a + g.b) / 2,
          cx = p[0] + ux * c,
          cz = p[1] + uz * c;
        A.arch(
          C,
          "limestone",
          cx,
          CY + 4.6 - 0.02,
          cz,
          2.2,
          0.62,
          0.25,
          Math.abs(ux) > 0.5 ? "z" : "x",
        );
        b.obox(
          "limestone",
          cx + nx * 0.0,
          CY + 5.2,
          cz + nz * 0.0,
          1.0,
          1.1,
          0.6,
          Math.atan2(-uz, ux),
        );
        b.obox("iron", cx, CY + 2.75, cz, 0.06, 3.7, 0.06, Math.atan2(-uz, ux));
      }
      const mx = (p[0] + q[0]) / 2 - nx * 9,
        mz = (p[1] + q[1]) / 2 - nz * 9; // (left normal points into the room)
      b.quad(pano, mx, CY + 1.5, mz, 26, 13, faceRy, { noAO: true });
    };
    lancets([K0, CZ - 7], [K1, CZ - 7], 0, T.pano("ww_pano_n", 31, "city"));
    lancets(
      [K1, CZ + 7],
      [K0, CZ + 7],
      Math.PI,
      T.pano("ww_pano_s", 32, "harbor"),
    );
    lancets(
      [K1, CZ - 7],
      [K1, CZ + 7],
      -Math.PI / 2,
      T.pano("ww_pano_e", 33, "bridge"),
    );
    lancets(
      [K0, CZ + 7],
      [K0, CZ - 7],
      Math.PI / 2,
      T.pano("ww_pano_w", 34, "city"),
    );
    // ribbed gothic ceiling
    b.box("limestone", K0, KH - 0.2, CZ - 7, K1, KH, CZ + 7);
    for (const [a, c] of [
      [
        [K0, CZ - 7],
        [K1, CZ + 7],
      ],
      [
        [K1, CZ - 7],
        [K0, CZ + 7],
      ],
    ]) {
      const m = [(a[0] + c[0]) / 2, KH + 2.5, (a[1] + c[1]) / 2];
      b.beam("limestone", [a[0], KH, a[1]], m, 0.3, 0.3);
      b.beam("limestone", m, [c[0], KH, c[1]], 0.3, 0.3);
    }
    for (const [x0, z0, x1, z1] of [
      [K0, CZ - 7, K1, CZ - 7],
      [K1, CZ - 7, K1, CZ + 7],
      [K1, CZ + 7, K0, CZ + 7],
      [K0, CZ + 7, K0, CZ - 7],
    ]) {
      const tri = () =>
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x0, KH, z0),
          new THREE.Vector3(x1, KH, z1),
          new THREE.Vector3(CX, KH + 2.5, CZ),
        ]);
      b.add("plaster_warm", tri(), { noAO: true });
      b.add("plaster_warm", tri(), { flip: true, noAO: true });
    }
    // coin binoculars, souvenir counter, the raider queen's nest
    for (const [x, z, ry] of [
      [CX - 5.5, CZ - 5.5, 0.7],
      [CX + 5.5, CZ + 5.5, -2.4],
    ]) {
      b.cyl("steel", x, CY, z, 0.1, 0.14, 1.1, 8);
      b.obox("metal_painted", x, CY + 1.3, z, 0.5, 0.35, 0.4, ry, {
        c: 0x6a8a6a,
      });
      C.col(x - 0.2, CY, z - 0.2, x + 0.2, CY + 1.4, z + 0.2, {
        walkable: false,
      });
    }
    b.box("wood_dark", CX - 2, CY, CZ - 6.4, CX + 2, CY + 1.0, CZ - 5.8);
    C.col(CX - 2, CY, CZ - 6.4, CX + 2, CY + 1.0, CZ - 5.8, {
      walkable: false,
    });
    for (let k = 0; k < 6; k++)
      b.obox(
        "limestone",
        CX - 1.5 + k * 0.6,
        CY + 1.2,
        CZ - 6.1,
        0.12,
        0.35,
        0.12,
        0,
      );
    const souv = T.sign(
      "souv",
      ["SOUVENIRS", "MINIATURE TOWERS 10¢"],
      { bg: "#1a120a", fg: "#e8c860", size: 50 },
      512,
      128,
    );
    b.quad(souv, CX, CY + 2.2, CZ - 6.35, 2.2, 0.55, 0);
    F.sandbags(C, [K1 - 1.2, CZ + 2], [K1 - 1.2, CZ + 5.5], CY, 3);
    for (const [x, z, ry] of [
      [CX - 3, CZ + 4.5, 0.4],
      [CX - 4.6, CZ + 3.2, 1.9],
    ])
      b.obox("fabric_red", x, CY + 0.1, z, 1.2, 0.2, 2.0, ry);
    C.prop("barrel", CX, CY, CZ + 4.5, 0, { burning: true });
    C.prop("footlocker", CX + 4.8, CY, CZ - 5.2, Math.PI, {
      items: [
        ["li_gilbert_bowler", 1],
        ["scrip", 120],
        ["li_first_nickel", 1],
        ["rally_tonic", 2],
      ],
      owner: "raiders",
      locked: 0,
      lock: LI.LOCKS.ww_strongbox,
      name: "Penny's Strongbox",
    });
    C.prop("skeleton", CX - 6, CY, CZ, Math.PI / 2, {
      pose: "sitting",
      collide: false,
    });
    const ccSign = T.sign(
      "cc",
      ["SERVICE STAIR ▼", "EMPLOYEES ONLY"],
      { bg: "#2a2a26", fg: "#e8e0c8", size: 48 },
      512,
      128,
    );
    b.quad(ccSign, K0 + 0.32, CY + 2.9, CZ, 1.6, 0.4, Math.PI / 2);
    b.box("bronze", K0 + 0.28, CY, CZ - 0.9, K0 + 0.32, CY + 2.5, CZ + 0.9);
    b.box("bronze", K1 - 0.32, CY, CZ - 0.9, K1 - 0.28, CY + 2.5, CZ + 0.9);

    // ==============================================================
    // doors & anchors
    // ==============================================================
    // the Broadway portal (landmarks_b publishes it as woolworth.anchors.door: the door plane, facing +x / Broadway)
    // door-local frame from the published plane: u along the facade, v = metres OUT (toward Broadway for yaw −π/2)
    const WDR = LI.siteAnchor("woolworth", "door", {
      x: 3.1,
      y: 0,
      z: 605,
      yaw: -Math.PI / 2,
      w: 4.0,
      h: 3.2,
    });
    const wYaw = WDR.yaw === undefined ? -Math.PI / 2 : WDR.yaw;
    // landmarks_b's ground-floor limestone skin stands 0.12 m proud of the published plane (it hides the plane's planks),
    // so our opening is built on a face 0.09 m further out
    const WFO = 0.09,
      WF = A.frame(
        WDR.x - Math.sin(wYaw) * WFO,
        WDR.z - Math.cos(wYaw) * WFO,
        Math.cos(wYaw),
        -Math.sin(wYaw),
        true,
      );
    const wIn = WF.p(0, 0.45),
      wOut = WF.p(0, 2.3);
    C.door({
      pos: new THREE.Vector3(wIn[0], (WDR.y || 0) + 1.5, wIn[1]),
      label: "Woolworth Building",
      verb: "Enter",
      radius: 1.5,
      target: { x: C.O.x + 19, y: 0, z: C.O.z, yaw: Math.PI / 2 },
      id: "li_ww_in",
    });
    C.door({
      pos: C.W(AX1 - 0.25, 1.4, 0),
      label: "Broadway",
      verb: "Exit",
      radius: 1.5,
      target: { x: wOut[0], y: WDR.y || 0, z: wOut[1], yaw: wYaw },
      id: "li_ww_out",
    });
    C.door({
      pos: C.W(0, 1.4, 13.75),
      label: "Express Elevator — Observation Crown",
      verb: "Ride",
      radius: 1.3,
      target: { x: C.O.x + K1 - 1.6, y: CY, z: C.O.z + CZ, yaw: Math.PI / 2 },
      id: "li_ww_up",
    });
    C.door({
      pos: C.W(K1 - 0.5, CY + 1.3, CZ),
      label: "Express Elevator — Lobby",
      verb: "Ride",
      radius: 1.2,
      target: { x: C.O.x, y: 0, z: C.O.z + 11.8, yaw: 0 },
      id: "li_ww_down",
    });
    C.door({
      pos: C.W(K0 + 0.5, CY + 1.3, CZ),
      label: "Service Stair — Lobby",
      verb: "Descend",
      radius: 1.2,
      target: { x: C.O.x, y: 0, z: C.O.z - 12.2, yaw: Math.PI },
      id: "li_ww_stair",
    });
    C.door({
      pos: C.W(0, 1.3, -13.8),
      label: "Service Stair — Observation Crown",
      verb: "Climb",
      radius: 1.2,
      target: { x: C.O.x + K0 + 1.6, y: CY, z: C.O.z + CZ, yaw: -Math.PI / 2 },
      id: "li_ww_stair_up",
    });
    C.anchor("entrance", 19, 0, 0, Math.PI / 2);
    C.anchor("boss", -23, MY, -18.5, Math.PI);
    C.anchor("penny", CX - 2, CY, CZ + 2.5, Math.PI / 2);
    C.anchor("spawn1", 8, 0, 2, Math.PI / 2);
    C.anchor("spawn2", -1, 0, -9, Math.PI);
    C.anchor("spawn3", -26, MY, 0, -Math.PI / 2);
    C.anchor("spawn4", -12, MY, -16, 0);
    C.anchor("spawn5", CX + 3, CY, CZ - 2, 0);
    C.anchor("spawn6", 2, 0, 9, 0);
    C.anchor("loot1", -3.6, 0, -13.4);
    C.anchor("loot2", -27.9, MY, -24.8);
    C.anchor("loot3", CX + 4.8, CY, CZ - 5.2);
    C.pickup("li_note_cass", 1, -22.6, MY + 0.8, -21.2, 0.3);
    C.pickup("li_reel_dime", 1, -2.4, 1.02, -10, 0);
    C.pickup("souvenir_statue", 1, CX + 0.9, CY + 1.02, CZ - 6.1, 0);
    C.pickup("frag_grenade", 2, CX + 5.8, CY + 0.05, CZ + 3.4, 0);
    C.finish();

    // ==============================================================
    // WORLD: the raiders pried the boarded Broadway doors open
    // (landmarks_b's planks quad sits on the portal's door plane, anchor woolworth.door; we dress a dark gap over it)
    // ==============================================================
    const Wd = LI.cell("woolworth_world", { world: true });
    const wb = Wd.b;
    wb.ambient(0x000000, 0);
    // The pried gap is sized from the published door plane (w/h) and built in its frame, with real depth: splintered
    // plank boxing standing proud of the boards, a threshold, a matte-painted lobby (gold vaults, fire glow) set back
    // behind reveals, so it reads as an opening in daylight instead of a black sticker.
    const fy = WDR.y || 0,
      GW = LI.clamp((WDR.w || 4) * 0.58, 1.7, 2.6),
      GH = LI.clamp((WDR.h || 3.2) - 0.35, 2.4, 2.95);
    const nb = { noBake: true },
      wry = WF.ry;
    const wbx = (key, u0, u1, y0, y1, v0, v1, o) =>
      WF.box(
        Wd,
        key,
        u0,
        u1,
        v0,
        v1,
        fy + y0,
        fy + y1,
        Object.assign({}, nb, o || {}),
      );
    const wp = (u, v) => WF.p(u, v);
    const voidK = LI.texMat(
      "ww_void",
      LI.canvasTex(
        "ww_void",
        256,
        320,
        (x, W, H) => {
          // looking into the lobby: black depth, the gold-mosaic barrel ceiling catching firelight, a burning barrel far in
          const g = x.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#0a0806");
          g.addColorStop(0.55, "#140e08");
          g.addColorStop(1, "#2a1a0c");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          x.strokeStyle = "rgba(200,150,60,0.35)";
          x.lineWidth = 7;
          for (let k = 0; k < 3; k++) {
            x.beginPath();
            x.ellipse(
              W / 2,
              H * (0.34 + k * 0.05),
              W * (0.42 - k * 0.1),
              H * (0.24 - k * 0.04),
              0,
              Math.PI,
              0,
            );
            x.stroke();
          }
          x.fillStyle = "rgba(160,110,40,0.22)";
          for (let i = 0; i < 90; i++)
            x.fillRect(
              W * 0.15 + Math.random() * W * 0.7,
              H * 0.1 + Math.random() * H * 0.22,
              3,
              3,
            );
          for (const s2 of [-1, 1]) {
            x.fillStyle = "#0c0906";
            x.fillRect(W / 2 + s2 * W * 0.3 - 10, H * 0.3, 20, H * 0.6);
          }
          const f = x.createRadialGradient(
            W * 0.56,
            H * 0.84,
            2,
            W * 0.56,
            H * 0.84,
            W * 0.34,
          );
          f.addColorStop(0, "rgba(255,170,70,0.95)");
          f.addColorStop(0.3, "rgba(220,110,30,0.5)");
          f.addColorStop(1, "rgba(0,0,0,0)");
          x.fillStyle = f;
          x.fillRect(0, 0, W, H);
          x.fillStyle = "#1a120a";
          x.fillRect(W * 0.52, H * 0.84, W * 0.09, H * 0.12);
          const fl = x.createLinearGradient(0, H * 0.9, 0, H);
          fl.addColorStop(0, "rgba(90,60,30,0.6)");
          fl.addColorStop(1, "rgba(40,26,14,1)");
          x.fillStyle = fl;
          x.fillRect(0, H * 0.9, W, H * 0.1);
        },
        { clamp: true },
      ),
      { rough: 0.95, emissive: 0.35 },
    );
    wbx("black", -GW / 2 - 0.05, GW / 2 + 0.05, 0, GH + 0.05, 0.0, 0.035); // blocks the boards behind
    {
      const c = wp(0, 0.04);
      wb.quad(voidK, c[0], fy + GH / 2, c[1], GW, GH, wry + Math.PI, {
        noBake: true,
        noAO: true,
      });
    }
    // boxing: the raiders' plank frame stands 0.45 m proud of the boarded doors; its reveals give the gap depth
    for (const s2 of [-1, 1]) {
      wbx(
        "wood_rotten",
        (s2 * GW) / 2,
        s2 * (GW / 2 + 0.16),
        0,
        GH + 0.2,
        0.04,
        0.5,
      ); // jamb reveal
      wbx(
        "wood_dark",
        s2 * (GW / 2 + 0.16),
        s2 * (GW / 2 + 0.34),
        0,
        GH + 0.34,
        0.04,
        0.2,
      ); // outer post
      for (let k = 0; k < 3; k++) {
        // splintered plank stubs
        const yy = 0.5 + k * 0.95 + (s2 > 0 ? 0.2 : 0),
          c = wp(s2 * (GW / 2 - 0.12), 0.1);
        wb.obox(
          "wood_rotten",
          c[0],
          fy + yy,
          c[1],
          0.34,
          0.24,
          0.05,
          wry,
          Object.assign({ rz: s2 * (0.15 + k * 0.08) }, nb),
        );
      }
    }
    wbx("wood_rotten", -GW / 2 - 0.34, GW / 2 + 0.34, GH, GH + 0.34, 0.04, 0.5); // lintel
    wbx("marble_dark", -GW / 2, GW / 2, 0, 0.04, 0.04, 0.5); // worn threshold
    wbx(
      "bronze",
      -GW / 2 - 0.34,
      GW / 2 + 0.34,
      GH + 0.34,
      GH + 0.42,
      0.02,
      0.24,
    );
    // torn-off planks leaning on the jambs and lying on the sidewalk (off the walking line)
    {
      const c = wp(-GW / 2 - 0.55, 0.45);
      wb.obox(
        "wood_rotten",
        c[0],
        fy + 1.2,
        c[1],
        0.28,
        2.5,
        0.05,
        wry,
        Object.assign({ rx: -0.25 }, nb),
      );
    }
    {
      const c = wp(GW / 2 + 0.55, 0.4);
      wb.obox(
        "wood_rotten",
        c[0],
        fy + 1.1,
        c[1],
        0.26,
        2.3,
        0.05,
        wry,
        Object.assign({ rx: -0.3 }, nb),
      );
    }
    {
      const c = wp(-GW / 2 - 0.9, 1.3);
      wb.obox(
        "wood_rotten",
        c[0],
        fy + 0.04,
        c[1],
        0.26,
        0.05,
        2.6,
        wry + 0.5,
        nb,
      );
    }
    {
      const c = wp(GW / 2 + 1.0, 1.1);
      wb.obox(
        "wood_rotten",
        c[0],
        fy + 0.09,
        c[1],
        0.24,
        0.05,
        2.2,
        wry - 0.3,
        Object.assign({ rz: 0.04 }, nb),
      );
    }
    // (landmarks_b already hangs the raiders' "FIVE & DIME OF DEATH" board on the forecourt wall)
    // a string of tin cans across the top of the gap (a raider door alarm)
    {
      const a0 = wp(-GW / 2, 0.52),
        a1 = wp(0, 0.52),
        a2 = wp(GW / 2, 0.52);
      wb.rod(
        "iron",
        [a0[0], fy + GH - 0.1, a0[1]],
        [a1[0], fy + GH - 0.45, a1[1]],
        0.006,
        nb,
      );
      wb.rod(
        "iron",
        [a1[0], fy + GH - 0.45, a1[1]],
        [a2[0], fy + GH - 0.1, a2[1]],
        0.006,
        nb,
      );
      for (let k = 0; k < 6; k++) {
        const t = (k + 0.5) / 6,
          c = wp(-GW / 2 + GW * t, 0.52);
        wb.cyl(
          "steel",
          c[0],
          fy + GH - 0.1 - Math.sin(t * Math.PI) * 0.35 - 0.14,
          c[1],
          0.04,
          0.04,
          0.12,
          6,
          nb,
        );
      }
    }
    // caged work lamp on a bracket (a real pool of light at night), wired along the lintel
    {
      const lp = wp(-GW / 2 - 0.2, 0.75),
        br = wp(-GW / 2 - 0.2, 0.5);
      wb.rod(
        "iron",
        [br[0], fy + GH + 0.2, br[1]],
        [lp[0], fy + GH + 0.2, lp[1]],
        0.015,
        nb,
      );
      wb.rod(
        "iron",
        [lp[0], fy + GH + 0.2, lp[1]],
        [lp[0], fy + GH - 0.04, lp[1]],
        0.008,
        nb,
      );
      wb.cyl("rust", lp[0], fy + GH - 0.38, lp[1], 0.1, 0.12, 0.08, 8, nb);
      wb.cyl("lamp_amber", lp[0], fy + GH - 0.3, lp[1], 0.08, 0.09, 0.2, 8, nb);
      wb.cyl("rust", lp[0], fy + GH - 0.1, lp[1], 0.05, 0.1, 0.06, 8, nb);
      Wd.glow(lp[0], fy + GH - 0.2, lp[1], 0xffa040, 0.6, {
        fixture: true,
        intensity: 1.1,
        range: 7,
        flicker: 0.3,
        dayFactor: 0.3,
      });
    }
    Wd.finish();
    return C;
  }

  LI.addBuilder(KEY, 40, function () {
    LI.ww = build();
  });

  // ======================================================================
  // Gameplay: Penny Dreadful, the stair tripwire, items, terminal
  // ======================================================================
  LI.readyFns.push(function () {
    const C = LI.ww;
    if (!C) return;
    LI.defineItems([
      {
        id: "li_gilbert_bowler",
        type: "apparel",
        slot: "head",
        name: "Architect's Bowler",
        weight: 1,
        value: 260,
        dr: 1,
        attrs: { wits: 1 },
        skills: { mechanics: 10, electronics: 5 },
        mesh: "hat_bowler",
        unique: true,
        tags: ["apparel", "hat", "unique"],
        desc: "A black bowler with a tiny gothic spire drawn in pencil on the band — the same hat the lobby grotesque of the building's architect is carved wearing. Makes load-bearing thoughts come easier.",
      },
      {
        id: "li_first_nickel",
        type: "misc",
        name: "The First Nickel",
        weight: 0,
        value: 500,
        mesh: "token",
        tags: ["junk_valuable"],
        noSell: true, // (the memorial box needs it: selling it soft-locked the quest)
        desc: 'A worn 1879 five-cent piece mounted on a velvet card: "THE FIRST NICKEL TAKEN — UTICA STORE". The Five & Dime raiders fought over it for years without once suspecting it was worth more than five cents.',
      },
      {
        id: "li_note_cass",
        type: "note",
        name: "Letter on the Founder's Desk",
        title: "Woolworth Co. — Executive Offices, 1913 (framed copy)",
        learn: LI.LOCKS.ww_strongbox.id,
        text: '"Mr. Gilbert — I asked for a building that would advertise my stores around the world. You have given me a cathedral. I am told the carvers put my likeness in the lobby, counting nickels. Leave it. It is accurate."\n\n[Added underneath in grease pencil, much later:]\nPENNY — THE NICKELS ARE STILL IN THE COUNTERS. ALL OF THEM. WE COUNTED TWICE. — SQUINT\n\n[And under that, smaller:]\nNOTE TO SELF: SHE SET HER BOX TO THE YEAR ON HER LUCKY NICKEL. 1-8-7-9. DONT TELL HER I LOOKED. — SQUINT',
      },
      {
        id: "li_reel_dime",
        type: "tape",
        name: "Tape Reel: Five & Dime Orders",
        title: "Penny Dreadful — Standing Orders",
        learn: LI.LOCKS.ww_office_term.id,
        text: "[A woman's voice, bored, dangerous.]\n\nListen up, dimes. One: nobody touches my nickels. Two: the wire on the grand stair stays up. If you forget it's there, that's natural selection and I won't be sad. Three: Gutter doesn't come in the lobby. I don't care how much he paid Rook. Four: the elevator to the top still works, and the top is mine. Five: the word for the office teletype is CATHEDRAL. Squint, write it on your hand.\n\nQuestions? No? Good. Get out.",
      },
      {
        id: "li_ww_strongbox_key",
        type: "key",
        name: "Penny's Strongbox Key",
        desc: "A small brass key on a bootlace, warm from being worn around somebody's neck. It fits the strongbox in the Observation Crown.",
      },
    ]);
    LI.terminal("li_ww_office", {
      title: "F.W. WOOLWORTH CO. — EXECUTIVE OFFICE",
      header: 'WOOLWORTH CO. — ACCOUNTS TELETYPE\n"NOTHING OVER TEN CENTS"',
      lock: {
        id: LI.LOCKS.ww_office_term.id,
        passcode: LI.LOCKS.ww_office_term.passcode,
      },
      entries: [
        {
          title: "Store Count (1967)",
          text: "Stores in operation 03.04.1967: 4,211\nStores in operation 03.06.1967: [NO DATA]\n\nNote: the Manhattan flagship reports record lunch-counter sales for 10.23. The report was filed at 9:40 a.m.",
        },
        {
          title: "Building History",
          text: 'Completed 1913 at a cost of $13.5 million — paid in cash, in nickels and dimes, as the founder liked to remind visitors. The tallest building in the world until 1930. The lobby ceiling is Byzantine glass mosaic. The observation gallery on the 57th floor admitted visitors for fifty cents until the Civil Defense blackout of \'66 closed it "temporarily".',
        },
        {
          title: "Tenant Notice",
          text: "The tripwire on the grand staircase is NOT a building fixture. Management has asked the tenants in the lobby to remove it. The tenants have asked management to come down and do it himself.",
        },
        Object.assign(
          { title: "Petty Cash" },
          LI.codeText(
            "ww_mezz_safe",
            "Petty cash is kept in the mezzanine safe by the Empire Room. Combination: 0-4-2-4 (opening day, 24 April 1913). Nothing over ten cents is to be taken without a chit.",
          ),
        ),
      ],
    });
    // ---------- quest: Nothing Over Ten Cents ----------
    const QID = "li_ww_nickel";
    LI.defineItems([
      {
        id: "li_ww_capsule_letter",
        type: "note",
        name: "1913 Time Capsule Letter",
        title: "To Be Opened By Whoever Brings Back the First Nickel",
        text: '"April 24th, 1913. To my successor, whoever you are:\n\nThis building was paid for in cash — nickels and dimes, every one of them earned across a counter. I have sealed the first of them in this box because a man should be reminded where he started. If you have brought it back, you have done something difficult for something small, which is the whole of retail.\n\nThe contents are yours. Spend them in one of my stores.\n\n— F.W.W."\n\n[The stores are gone. The advice holds.]',
      },
    ]);
    const qTrack = () => {
      if (Q.done(QID)) return;
      if (!Q.started(QID))
        Q.start(QID, LI.has("li_first_nickel") ? "return" : "find");
      else if (Q.stage(QID) === "find" && LI.has("li_first_nickel"))
        Q.setStage(QID, "return");
    };
    Q.define({
      id: QID,
      name: "Nothing Over Ten Cents",
      giver: "The founder's letter",
      location: "Woolworth Building",
      desc: "The Woolworth lobby hides a memorial box beneath the carving of the founder counting his nickels. Its slot is marked for the very first nickel his first store ever took — which Penny Dreadful keeps in her strongbox at the top of the tower.",
      stages: [
        {
          id: "find",
          text: "Recover the First Nickel from Penny Dreadful's strongbox in the Observation Crown.",
          markers: () => [
            {
              x: C.anchors.loot3.x,
              z: C.anchors.loot3.z,
              label: "Penny's Strongbox",
              interior: true,
            },
          ],
        },
        {
          id: "return",
          text: "Deposit the First Nickel in the Founder's memorial box in the Woolworth lobby.",
          markers: () => [
            {
              x: C.anchors.memorial.x,
              z: C.anchors.memorial.z,
              label: "Memorial Box",
              interior: true,
            },
          ],
        },
        {
          id: "done",
          text: "The memorial box opened: the founder's 1913 time capsule was yours.",
          complete: true,
        },
      ],
      rewards: { xp: 150, standing: 5 },
    });
    G.events.on("itemAdded", (id) => {
      if (id === "li_first_nickel" || id === "li_note_cass") qTrack();
    });
    let capsuleOpen = false;
    LI.saveHooks.ww_capsule = {
      save: () => ({ open: capsuleOpen }),
      load(d) {
        capsuleOpen = !!(d && d.open);
      },
      reset() {
        capsuleOpen = false;
      },
    };
    LI.interact(
      C.anchors.memorial,
      "Founder's Memorial Box",
      () =>
        LI.has("li_first_nickel") ? "Deposit the First Nickel" : "Examine",
      () => {
        if (capsuleOpen) {
          LI.notify(
            "The memorial box is open and empty. Somebody spent it all.",
          );
          return;
        }
        if (!LI.has("li_first_nickel")) {
          LI.notify(
            'A bronze box with a single coin slot: "DEPOSIT THE FIRST NICKEL". The raiders have hammered on it for years. It has not noticed.',
          );
          qTrack();
          return;
        }
        LI.take("li_first_nickel", 1);
        capsuleOpen = true;
        LI.sfx("door_open", { pos: C.anchors.memorial, volume: 0.5 });
        LI.sfx("pickup_scrip");
        LI.giveScrip(260);
        LI.give("old_dollars", 4);
        LI.give("li_ww_capsule_letter", 1);
        LI.give("fizzo_blue", 1);
        LI.notify(
          "Clink. Somewhere inside the pedestal, a 1913 mechanism wakes up and opens.",
        );
        if (!Q.started(QID)) Q.start(QID, "return");
        Q.setStage(QID, "done");
      },
      { enabled: () => !capsuleOpen },
    );
    // tripwire: walking through it blows the trap; disarm it with a steady hand (Explosives)
    const T = C.trap;
    let armed = true;
    const tpos = C.W((T.a[0] + T.b[0]) / 2, T.a[1], 0);
    LI.saveHooks.ww = {
      save: () => ({ armed }),
      load(d) {
        armed = !(d && d.armed === false);
      },
      reset() {
        armed = true;
      },
    };
    LI.interact(
      tpos,
      "Tripwire",
      "Disarm",
      () => {
        if (!armed) return;
        armed = false;
        LI.sfx("ui_select");
        LI.give("frag_grenade", 2);
        LI.xp(15, "Trap disarmed");
        LI.notify("Tripwire disarmed.");
      },
      { enabled: () => armed, priority: 2 },
    );
    LI.animators.push({
      cell: C,
      fn() {
        if (!armed || !G.player) return;
        const P = G.player.pos,
          lx = C.O.x + T.a[0];
        if (
          Math.abs(P.x - lx) < 0.35 &&
          Math.abs(P.z - C.O.z) < 2.9 &&
          P.y < T.a[1] + 0.3 &&
          P.y > T.a[1] - 1.5
        ) {
          armed = false;
          try {
            if (!G.isStub("combat") && G.combat.explode)
              G.combat.explode(new THREE.Vector3(lx, T.a[1], P.z), 3.2, 45, {
                source: "trap",
                kind: "normal",
              });
            else {
              G.player.damage(35, { type: "explosive" });
              try {
                G.fx.explosion(new THREE.Vector3(lx, T.a[1], P.z), 3);
              } catch (e) {
                /* */
              }
            }
          } catch (e) {
            /* */
          }
        }
      },
    });
  });
  LI.spawnFns.push(function () {
    const C = LI.ww;
    if (!C) return;
    LI.spawnNPC(
      {
        id: "li_ww_penny",
        type: "human",
        name: "Penny Dreadful",
        outfit: "raider_heavy",
        gender: "f",
        faction: "raiders",
        ai: "guard",
        homeR: 4,
        hostile: true,
        noRespawn: true,
        level: 9,
        hp: 260,
        weapon: "hunting_rifle",
        voice: "raider",
        hair: "wild",
        inventory: [
          ["li_ww_strongbox_key", 1],
          ["scrip", 75],
          ["ammo_308", 20],
          ["rush", 1],
        ],
        barks: {
          idle: [
            "Five... ten... fifteen...",
            "Best view in the city, and it's MINE.",
          ],
          alert: [
            "Who let a customer up here?!",
            "You break it, you BOUGHT it!",
          ],
        },
      },
      C.anchors.penny,
    );
  });
})();
