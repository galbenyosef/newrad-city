// play-inline-232 02 — math
// Lines 28-376 of readable/play-inline-232.pretty.js (statement-aligned).
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

