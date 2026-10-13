// play-inline-229 03 — fillstyle
// Lines 37-388 of readable/play-inline-229.pretty.js (statement-aligned).
  function art() {
    const T = {};
    // Sert-like sepia allegory: toiling giants, gears, columns, rays (original composition)
    const sert = (id, seed, w, h) =>
      LI.texMat(
        id,
        LI.canvasTex(id, w, h, (x, W, H) => {
          const r = LI.rng(seed);
          const g = x.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#6a5438");
          g.addColorStop(0.5, "#4a3824");
          g.addColorStop(1, "#2a2014");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          // rays
          x.save();
          x.globalAlpha = 0.18;
          x.fillStyle = "#e8d0a0";
          for (let i = 0; i < 12; i++) {
            const a = -Math.PI / 2 + (i - 6) * 0.16;
            x.beginPath();
            x.moveTo(W / 2, -H * 0.2);
            x.lineTo(
              W / 2 + Math.cos(a - 0.04) * W,
              -H * 0.2 + Math.sin(a - 0.04) * -W,
            );
            x.lineTo(
              W / 2 + Math.cos(a + 0.04) * W,
              -H * 0.2 + Math.sin(a + 0.04) * -W,
            );
            x.fill();
          }
          x.restore();
          // columns & gears
          x.fillStyle = "rgba(30,22,12,0.55)";
          for (let i = 0; i < 5; i++) {
            const cx = W * (0.1 + i * 0.2);
            x.fillRect(cx - 14, H * 0.1, 28, H * 0.9);
          }
          for (let i = 0; i < 4; i++) {
            const cx = r() * W,
              cy = H * (0.2 + r() * 0.5),
              R = 30 + r() * 50;
            x.beginPath();
            for (let k = 0; k < 24; k++) {
              const a = (k / 24) * TAU,
                rr = k % 2 ? R : R * 0.82;
              x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
            }
            x.fill();
          }
          // giants: shaded bodies built from ellipses
          const fig = (cx, cy, s, lean) => {
            const shade = (col) => {
              x.fillStyle = col;
            };
            shade("#c8a878");
            x.beginPath();
            x.ellipse(cx, cy - 60 * s, 16 * s, 19 * s, 0, 0, TAU);
            x.fill();
            const gg = x.createLinearGradient(cx - 40 * s, 0, cx + 40 * s, 0);
            gg.addColorStop(0, "#d8b888");
            gg.addColorStop(1, "#5a4028");
            x.fillStyle = gg;
            x.beginPath();
            x.ellipse(
              cx + lean * 10 * s,
              cy,
              34 * s,
              48 * s,
              lean * 0.3,
              0,
              TAU,
            );
            x.fill();
            x.beginPath();
            x.ellipse(
              cx - 34 * s,
              cy - 18 * s,
              10 * s,
              40 * s,
              -0.8 - lean * 0.5,
              0,
              TAU,
            );
            x.fill();
            x.beginPath();
            x.ellipse(
              cx + 38 * s,
              cy - 30 * s,
              10 * s,
              42 * s,
              0.9 + lean * 0.4,
              0,
              TAU,
            );
            x.fill();
            x.beginPath();
            x.ellipse(cx - 14 * s, cy + 70 * s, 12 * s, 40 * s, 0.1, 0, TAU);
            x.fill();
            x.beginPath();
            x.ellipse(cx + 16 * s, cy + 72 * s, 12 * s, 40 * s, -0.25, 0, TAU);
            x.fill();
          };
          for (let i = 0; i < 6; i++)
            fig(
              W * (0.1 + i * 0.16 + r() * 0.04),
              H * (0.5 + r() * 0.12),
              (H / 330) * (0.8 + r() * 0.35),
              r() - 0.5,
            );
          // a beam carried on shoulders
          x.fillStyle = "#3a2a18";
          x.save();
          x.translate(W / 2, H * 0.3);
          x.rotate(-0.05);
          x.fillRect(-W * 0.45, -10, W * 0.9, 20);
          x.restore();
          LI.wear(x, W, H, seed, 0.9);
          const v = x.createRadialGradient(
            W / 2,
            H / 2,
            W * 0.2,
            W / 2,
            H / 2,
            W * 0.7,
          );
          v.addColorStop(0, "rgba(0,0,0,0)");
          v.addColorStop(1, "rgba(0,0,0,0.55)");
          x.fillStyle = v;
          x.fillRect(0, 0, W, H);
        }),
        { rough: 0.95 },
      );
    T.mural = sert("rock_mural", 5, 1024, 512);
    T.ceil = sert("rock_ceil", 9, 512, 512);
    T.elev = LI.texMat(
      "rock_elev",
      LI.canvasTex(
        "rock_elev",
        256,
        512,
        (x, W, H) => {
          const g = x.createLinearGradient(0, 0, W, 0);
          g.addColorStop(0, "#6a4a22");
          g.addColorStop(0.5, "#c8984a");
          g.addColorStop(1, "#6a4a22");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          x.strokeStyle = "#3a2410";
          x.lineWidth = 6;
          x.beginPath();
          x.moveTo(W / 2, 0);
          x.lineTo(W / 2, H);
          x.stroke();
          x.strokeStyle = "#f0c870";
          x.lineWidth = 4;
          for (let i = 0; i < 9; i++) {
            x.beginPath();
            x.moveTo(20, 60 + i * 44);
            x.lineTo(W / 2 - 10, 40 + i * 44);
            x.lineTo(W - 20, 60 + i * 44);
            x.stroke();
          }
          for (let i = 0; i < 11; i++) {
            const a = Math.PI + (i / 10) * Math.PI;
            x.beginPath();
            x.moveTo(W / 2, 470);
            x.lineTo(W / 2 + Math.cos(a) * 100, 470 + Math.sin(a) * 100);
            x.stroke();
          }
          LI.wear(x, W, H, 4, 0.6);
        },
        { clamp: true },
      ),
      { metal: 0.6, rough: 0.4 },
    );
    T.banner = LI.texMat(
      "rock_cov_banner",
      LI.canvasTex(
        "rock_cov_banner",
        256,
        768,
        (x, W, H) => {
          x.fillStyle = "#3c4044";
          x.fillRect(0, 0, W, H);
          x.fillStyle = "#1a1a1a";
          x.fillRect(0, 0, W, 40);
          x.fillRect(0, H - 60, W, 60);
          x.fillStyle = "#c87a3a";
          x.fillRect(12, 44, W - 24, 5);
          x.fillRect(12, H - 70, W - 24, 5);
          LI.covenantEmblem(x, W / 2, H * 0.36, 95, "#e4d8bc");
          x.fillStyle = "#e4d8bc";
          x.textAlign = "center";
          LI.fitText(
            x,
            "WHAT IS KEPT ENDURES",
            W / 2,
            H * 0.72,
            W * 0.9,
            27,
            "bold %spx Georgia, serif",
          );
          LI.wear(x, W, H, 42, 0.5);
        },
        { clamp: true },
      ),
      { rough: 0.95, double: true },
    );
    T.map = LI.texMat(
      "rock_map",
      LI.canvasTex(
        "rock_map",
        1024,
        1024,
        (x, W, H) => {
          const M = LI.manhattanMap(x, W, H, {
            sea: "#18242a",
            land: "#8a8a6a",
            park: "#56663e",
          });
          const tag = (X, Z, col, label) => {
            x.fillStyle = col;
            x.fillRect(M.px(X) - 8, M.pz(Z) - 8, 16, 16);
            x.fillStyle = "#f0e8d0";
            x.font = "bold 18px monospace";
            x.fillText(label, M.px(X) + 12, M.pz(Z) + 6);
          };
          tag(80, -320, "#c87a3a", "THE HOLD");
          tag(313, -320, "#2e4a86", "CONTINUITY FWD");
          tag(-420, 1250, "#2e4a86", "ARRAY?");
          tag(80, -72, "#8a6aa0", "BRUTES");
          tag(80, -162, "#c8a860", "LIBRARY (BOOKS)");
          tag(0, 828, "#d88a30", "RAIDERS");
          tag(160, -342, "#e0b040", "GLOWKEEPERS");
          x.strokeStyle = "#c8a860";
          x.lineWidth = 3;
          x.setLineDash([10, 6]);
          x.beginPath();
          x.moveTo(M.px(80), M.pz(-320));
          x.lineTo(M.px(-40), M.pz(950));
          x.lineTo(M.px(-420), M.pz(1250));
          x.stroke();
          x.setLineDash([]);
          x.fillStyle = "#e8d8b0";
          x.font = "bold 30px Georgia, serif";
          x.fillText("ROCKEFELLER HOLD — THEATRE OF OPERATIONS", 24, 44);
          LI.wear(x, W, H, 71, 0.6);
        },
        { clamp: true },
      ),
      { rough: 0.9 },
    );
    T.dance = LI.texMat(
      "rock_dance",
      LI.canvasTex(
        "rock_dance",
        1024,
        1024,
        (x, W, H) => {
          const cx = W / 2,
            cy = H / 2;
          x.fillStyle = "#3a2a1a";
          x.fillRect(0, 0, W, H);
          const cols = [
            "#8a3a2a",
            "#b8703a",
            "#c8a84a",
            "#5a8a4a",
            "#3a6a8a",
            "#5a4a8a",
          ];
          for (let i = 0; i < 48; i++) {
            const a0 = (i / 48) * TAU,
              a1 = a0 + TAU / 48;
            x.fillStyle = cols[i % 6];
            x.beginPath();
            x.moveTo(cx, cy);
            x.arc(cx, cy, 500, a0, a1);
            x.fill();
          }
          for (let r = 80; r < 500; r += 70) {
            x.strokeStyle = "rgba(240,220,170,0.55)";
            x.lineWidth = 5;
            x.beginPath();
            x.arc(cx, cy, r, 0, TAU);
            x.stroke();
          }
          x.fillStyle = "#d8b870";
          x.beginPath();
          x.arc(cx, cy, 70, 0, TAU);
          x.fill();
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * TAU;
            x.fillStyle = "#e8d8a8";
            x.beginPath();
            x.moveTo(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70);
            x.lineTo(
              cx + Math.cos(a + 0.1) * 150,
              cy + Math.sin(a + 0.1) * 150,
            );
            x.lineTo(
              cx + Math.cos(a - 0.1) * 150,
              cy + Math.sin(a - 0.1) * 150,
            );
            x.fill();
          }
          LI.wear(x, W, H, 55, 0.9);
        },
        { clamp: true },
      ),
      { rough: 0.35, metal: 0.1 },
    );
    // 65 floors up, looking out over ruined Midtown: the Empire State due south (u 0 = +z), the Chrysler to the SE,
    // the East River and Hudson either side, Central Park's dead canopy to the north (shared kit panorama)
    T.skyline = LI.skylineMat("rock_skyline2", {
      W: 3072,
      H: 640,
      seed: 88,
      horizon: 0.7,
      wrap: true,
      water: [
        [0.2, 0.3],
        [0.7, 0.8],
      ],
      park: [[0.44, 0.56]],
      marks: [
        { u: 0.015, kind: "esb" },
        { u: 0.177, kind: "chrysler" },
        { u: 0.33, kind: "spire" },
        { u: 0.9, kind: "spire" },
      ],
    });
    T.sign = (id, lines, st, w, h) =>
      LI.texMat("rock_sign_" + id, LI.signTex("rock_" + id, lines, st, w, h), {
        rough: 0.7,
      });
    T.dirSign = T.sign(
      "dir",
      [
        "ROCKEFELLER HOLD",
        "ARMORY ◂  ·  ▸ EXO-RIG BAYS  ·  LIBRARY ▲  ·  RAINBOW ROOM ⇧",
      ],
      { bg: "#1a1a1a", fg: "#e8d8b0", border: "#c8a860", size: 46 },
      1024,
      160,
    );
    return T;
  }

  /** Blocky Exo-rig Mk I frame (slit visor, no snout) standing at (x,y,z) facing ry (visual only). */
