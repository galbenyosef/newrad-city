// play-inline-227 03 — fillstyle
// Lines 59-690 of readable/play-inline-227.pretty.js (statement-aligned).
  function art() {
    const T = {};
    T.emblem = LI.texMat(
      "un_emblem",
      LI.canvasTex(
        "un_emblem",
        1024,
        1024,
        (x, W, H) => {
          x.clearRect(0, 0, W, H);
          const cx = W / 2,
            cy = H / 2 - 10,
            gold = x.createLinearGradient(0, 0, W, H);
          gold.addColorStop(0, "#fbe7a0");
          gold.addColorStop(0.5, "#d9a93e");
          gold.addColorStop(1, "#a8781e");
          x.strokeStyle = gold;
          x.fillStyle = gold;
          x.lineCap = "round";
          // azimuthal grid
          x.lineWidth = 9;
          for (let i = 1; i <= 5; i++) {
            x.beginPath();
            x.arc(cx, cy, 64 * i, 0, TAU);
            x.stroke();
          }
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU;
            x.beginPath();
            x.moveTo(cx, cy);
            x.lineTo(cx + Math.cos(a) * 320, cy + Math.sin(a) * 320);
            x.stroke();
          }
          // stylised continents (blobs around the pole)
          const r = LI.rng(41);
          for (let c = 0; c < 7; c++) {
            const a0 = (c / 7) * TAU + r() * 0.4,
              d0 = 90 + r() * 170;
            x.beginPath();
            for (let k = 0; k <= 14; k++) {
              const t = (k / 14) * TAU,
                rr = 34 + r() * 46;
              const px =
                  cx +
                  Math.cos(a0) * d0 +
                  Math.cos(t) * rr * (1.2 + Math.sin(a0)),
                py = cy + Math.sin(a0) * d0 + Math.sin(t) * rr * 0.8;
              k ? x.lineTo(px, py) : x.moveTo(px, py);
            }
            x.closePath();
            x.globalAlpha = 0.9;
            x.fill();
            x.globalAlpha = 1;
          }
          // olive branches (wreath open at the top, crossed stems below)
          for (const s of [-1, 1]) {
            x.lineWidth = 12;
            x.beginPath();
            x.arc(
              cx,
              cy,
              395,
              Math.PI / 2 + s * 0.12,
              Math.PI / 2 + s * 2.55,
              s < 0,
            );
            x.stroke();
            for (let k = 0; k < 16; k++) {
              const a = Math.PI / 2 + s * (0.3 + k * 0.145),
                px = cx + Math.cos(a) * 395,
                py = cy + Math.sin(a) * 395;
              for (const side of [-1, 1]) {
                x.save();
                x.translate(px, py);
                x.rotate(a + side * 0.9 + (s < 0 ? Math.PI : 0));
                x.beginPath();
                x.ellipse(40, 0, 44, 14, 0, 0, TAU);
                x.fill();
                x.restore();
              }
            }
          }
          x.lineWidth = 12;
          x.beginPath();
          x.moveTo(cx - 60, cy + 470);
          x.lineTo(cx + 40, cy + 380);
          x.moveTo(cx + 60, cy + 470);
          x.lineTo(cx - 40, cy + 380);
          x.stroke();
          // tarnish
          x.globalCompositeOperation = "source-atop";
          LI.wear(x, W, H, 5, 0.5);
          x.globalCompositeOperation = "source-over";
        },
        { clamp: true },
      ),
      { transparent: true, metal: 0.6, rough: 0.35, emissive: 0.35 },
    );
    const mural = (id, seed, pal) =>
      LI.texMat(
        id,
        LI.canvasTex(id, 1024, 512, (x, W, H) => {
          x.fillStyle = "#e4dcc8";
          x.fillRect(0, 0, W, H);
          const r = LI.rng(seed);
          for (let i = 0; i < 9; i++) {
            x.fillStyle = pal[i % pal.length];
            x.beginPath();
            const cx = r() * W,
              cy = r() * H,
              rx = 60 + r() * 180,
              ry = 40 + r() * 140;
            if (i % 3 === 0) x.ellipse(cx, cy, rx, ry, r() * 3, 0, TAU);
            else {
              x.moveTo(cx, cy);
              for (let k = 0; k < 5; k++)
                x.quadraticCurveTo(
                  cx + (r() - 0.5) * 500,
                  cy + (r() - 0.5) * 400,
                  cx + (r() - 0.5) * 360,
                  cy + (r() - 0.5) * 300,
                );
            }
            x.fill();
          }
          x.strokeStyle = "#1a1a1a";
          x.lineWidth = 11;
          x.lineCap = "round";
          for (let i = 0; i < 6; i++) {
            x.beginPath();
            x.moveTo(r() * W, r() * H);
            for (let k = 0; k < 4; k++)
              x.bezierCurveTo(
                r() * W,
                r() * H,
                r() * W,
                r() * H,
                r() * W,
                r() * H,
              );
            x.stroke();
          }
          LI.wear(x, W, H, seed + 1, 0.8);
          x.fillStyle = "rgba(40,30,20,0.25)";
          x.fillRect(0, H * 0.8, W, H * 0.2);
        }),
        { rough: 0.9 },
      );
    T.muralW = mural("un_mural_w", 11, [
      "#2a5aa8",
      "#e8b020",
      "#c83a28",
      "#f0ece0",
      "#3a8a58",
    ]);
    T.muralE = mural("un_mural_e", 23, [
      "#d8402a",
      "#2a4a9a",
      "#f0d040",
      "#1a1a1a",
      "#ece4d0",
    ]);
    T.backdrop = LI.texMat(
      "un_backdrop",
      LI.canvasTex(
        "un_backdrop",
        1024,
        512,
        (x, W, H) => {
          const g = x.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#6f7a58");
          g.addColorStop(0.55, "#b8b48a");
          g.addColorStop(1, "#4a4a3a");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          x.fillStyle = "rgba(40,44,36,0.9)";
          x.fillRect(W * 0.34, H * 0.02, W * 0.22, H * 0.66); // the Secretariat slab
          x.fillStyle = "rgba(70,90,86,0.7)";
          for (let i = 0; i < 26; i++)
            x.fillRect(W * 0.345, H * 0.03 + i * H * 0.025, W * 0.21, 3);
          x.fillStyle = "rgba(30,30,28,0.95)";
          x.fillRect(0, H * 0.68, W, H * 0.32);
          for (let i = 0; i < 18; i++) {
            x.fillRect(20 + i * 56, H * 0.36, 3, H * 0.34);
            x.fillStyle = ["#a01c26", "#e8e4d8", "#2a4a8a", "#3a7a3a"][i % 4];
            x.fillRect(23 + i * 56, H * 0.37, 26, 14);
            x.fillStyle = "rgba(30,30,28,0.95)";
          }
          LI.wear(x, W, H, 9, 0.5);
        },
        { clamp: true },
      ),
      { emissive: 0.55, rough: 1 },
    );
    T.glass = LI.texMat(
      "un_chagall",
      LI.canvasTex(
        "un_chagall",
        512,
        768,
        (x, W, H) => {
          const r = LI.rng(77);
          x.fillStyle = "#123a8a";
          x.fillRect(0, 0, W, H);
          for (let i = 0; i < 220; i++) {
            const b = [
              "#1a4aaa",
              "#2a6ad0",
              "#0e2a6a",
              "#3a86e0",
              "#5aa0f0",
              "#1a2a5a",
              "#e8d060",
              "#c83a3a",
              "#e8e8f0",
            ][(r() * (i < 200 ? 6 : 9)) | 0];
            x.fillStyle = b;
            x.beginPath();
            const cx = r() * W,
              cy = r() * H;
            x.moveTo(cx, cy);
            for (let k = 0; k < 4; k++)
              x.lineTo(cx + (r() - 0.5) * 90, cy + (r() - 0.5) * 90);
            x.fill();
          }
          x.strokeStyle = "rgba(245,240,255,0.55)";
          x.lineWidth = 5;
          for (let k = 0; k < 6; k++) {
            x.beginPath();
            x.arc(
              W * (0.25 + r() * 0.5),
              H * (0.15 + k * 0.14),
              30 + r() * 40,
              0,
              TAU,
            );
            x.stroke();
          }
          x.strokeStyle = "#141414";
          x.lineWidth = 4;
          for (let i = 0; i < 70; i++) {
            x.beginPath();
            x.moveTo(r() * W, r() * H);
            x.lineTo(r() * W, r() * H);
            x.stroke();
          }
          x.lineWidth = 14;
          x.strokeRect(0, 0, W, H);
        },
        { clamp: true },
      ),
      { emissive: 0.9, rough: 0.3 },
    );
    T.phoenix = LI.texMat(
      "un_phoenix",
      LI.canvasTex("un_phoenix", 1024, 576, (x, W, H) => {
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#6a4a2a");
        g.addColorStop(1, "#2a1a10");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        const r = LI.rng(19);
        // ash below, city of figures around, the bird rising in the middle
        x.fillStyle = "#1a1410";
        x.fillRect(0, H * 0.82, W, H * 0.18);
        for (let i = 0; i < 26; i++) {
          const fx = ((i + 0.5) / 26) * W,
            fh = 60 + r() * 70;
          if (Math.abs(fx - W / 2) < 150) continue;
          x.fillStyle = ["#c8a070", "#8a6a48", "#d8c8a0", "#6a8aa0"][i % 4];
          x.fillRect(fx - 10, H * 0.82 - fh, 20, fh);
          x.beginPath();
          x.arc(fx, H * 0.82 - fh - 12, 12, 0, TAU);
          x.fill();
        }
        const cx = W / 2,
          cy = H * 0.45;
        const fire = x.createRadialGradient(cx, cy, 10, cx, cy, 260);
        fire.addColorStop(0, "rgba(255,220,120,0.9)");
        fire.addColorStop(0.5, "rgba(230,110,40,0.55)");
        fire.addColorStop(1, "rgba(120,40,10,0)");
        x.fillStyle = fire;
        x.fillRect(0, 0, W, H);
        x.fillStyle = "#f4c850";
        for (const s of [-1, 1]) {
          x.beginPath();
          x.moveTo(cx, cy);
          for (let k = 0; k <= 6; k++)
            x.lineTo(cx + s * (60 + k * 38), cy - 150 + k * 18 + (k % 2) * 30);
          x.lineTo(cx + s * 40, cy + 40);
          x.fill();
        }
        x.beginPath();
        x.ellipse(cx, cy, 34, 80, 0, 0, TAU);
        x.fill();
        x.beginPath();
        x.arc(cx, cy - 96, 22, 0, TAU);
        x.fill();
        x.beginPath();
        x.moveTo(cx - 20, cy + 60);
        x.lineTo(cx, cy + 190);
        x.lineTo(cx + 20, cy + 60);
        x.fill();
        LI.wear(x, W, H, 20, 0.9);
      }),
      { rough: 0.95 },
    );
    T.tapestry = LI.texMat(
      "un_tapestry",
      LI.canvasTex("un_tapestry", 256, 512, (x, W, H) => {
        x.fillStyle = "#2a4a78";
        x.fillRect(0, 0, W, H);
        x.fillStyle = "#c8a850";
        for (let y = 0; y < H; y += 64)
          for (let xx = 0; xx < W; xx += 64) {
            const k = ((xx + y) / 64) % 3;
            if (k === 0) {
              x.beginPath();
              x.arc(xx + 32, y + 24, 12, 0, TAU);
              x.fill();
              x.fillRect(xx + 30, y + 30, 4, 24);
              x.fillRect(xx + 20, y + 50, 24, 4);
            } // anchor
            else if (k === 1) {
              for (let j = 0; j < 5; j++) {
                x.beginPath();
                x.ellipse(
                  xx + 28 + (j % 2) * 8,
                  y + 14 + j * 8,
                  4,
                  7,
                  0.5,
                  0,
                  TAU,
                );
                x.fill();
              }
              x.fillRect(xx + 31, y + 10, 2, 44);
            } // wheat
            else {
              x.beginPath();
              x.moveTo(xx + 32, y + 50);
              x.bezierCurveTo(xx + 8, y + 30, xx + 16, y + 10, xx + 32, y + 22);
              x.bezierCurveTo(
                xx + 48,
                y + 10,
                xx + 56,
                y + 30,
                xx + 32,
                y + 50,
              );
              x.fill();
            } // heart
          }
        LI.wear(x, W, H, 31, 0.7);
      }),
      { rough: 0.95 },
    );
    T.banner = LI.texMat(
      "un_enc_banner",
      LI.canvasTex(
        "un_enc_banner",
        256,
        768,
        (x, W, H) => {
          x.fillStyle = "#18213a";
          x.fillRect(0, 0, W, H);
          x.fillStyle = "#b08a3a";
          x.fillRect(0, 0, W, 30);
          x.fillRect(0, H - 30, W, 30);
          LI.continuityEmblem(x, W / 2, H * 0.3, 92, "#e2d6b4");
          x.fillStyle = "#e2d6b4";
          x.textAlign = "center";
          LI.fitText(
            x,
            "CONTINUITY",
            W / 2,
            H * 0.6,
            W * 0.9,
            44,
            "bold %spx Georgia, serif",
          );
          x.font = "italic 22px Georgia, serif";
          x.fillText("The Republic Endures", W / 2, H * 0.66);
          for (let i = 0; i < 3; i++) {
            x.fillStyle = "#b08a3a";
            x.fillRect(40, H * 0.72 + i * 40, W - 80, 6);
          }
          LI.wear(x, W, H, 44, 0.5);
        },
        { clamp: true },
      ),
      { rough: 0.95, double: true },
    );
    // desk placards (real member-state names, 4 × 24 atlas)
    const NAMES = [
      "AFGHANISTAN",
      "ALBANIA",
      "ALGERIA",
      "ARGENTINA",
      "AUSTRALIA",
      "AUSTRIA",
      "BELGIUM",
      "BOLIVIA",
      "BRAZIL",
      "BULGARIA",
      "BURMA",
      "CANADA",
      "CEYLON",
      "CHILE",
      "CHINA",
      "COLOMBIA",
      "COSTA RICA",
      "CUBA",
      "DENMARK",
      "ECUADOR",
      "EGYPT",
      "EL SALVADOR",
      "ETHIOPIA",
      "FINLAND",
      "FRANCE",
      "GHANA",
      "GREECE",
      "GUATEMALA",
      "HAITI",
      "HONDURAS",
      "ICELAND",
      "INDIA",
      "INDONESIA",
      "IRAN",
      "IRAQ",
      "IRELAND",
      "ISRAEL",
      "ITALY",
      "JAPAN",
      "JORDAN",
      "LEBANON",
      "LIBERIA",
      "LUXEMBOURG",
      "MEXICO",
      "MOROCCO",
      "NEPAL",
      "NETHERLANDS",
      "NEW ZEALAND",
      "NICARAGUA",
      "NORWAY",
      "PAKISTAN",
      "PANAMA",
      "PARAGUAY",
      "PERU",
      "PHILIPPINES",
      "POLAND",
      "PORTUGAL",
      "ROMANIA",
      "SAUDI ARABIA",
      "SPAIN",
      "SUDAN",
      "SWEDEN",
      "SYRIA",
      "THAILAND",
      "TUNISIA",
      "TURKEY",
      "UKRAINE",
      "UNITED KINGDOM",
      "URUGUAY",
      "VENEZUELA",
      "YEMEN",
      "YUGOSLAVIA",
      "CANADA",
      "MEXICO",
      "UNITED STATES",
      "COMMONWEALTH",
      "CHINA",
      "U.S.S.R.",
      "GUINEA",
      "LAOS",
      "CAMBODIA",
      "LIBYA",
      "KENYA",
      "SENEGAL",
      "NIGERIA",
      "GHANA",
      "MALAYA",
      "NEPAL",
      "TOGO",
      "MALI",
      "CHAD",
      "NIGER",
      "GABON",
      "CONGO",
      "CYPRUS",
      "OBSERVER",
    ];
    T.placardUV = (i) => {
      const c = i % 4,
        r = Math.floor(i / 4) % 24;
      return [c / 4, 1 - (r + 1) / 24, (c + 1) / 4, 1 - r / 24];
    };
    T.placard = LI.texMat(
      "un_placards",
      LI.canvasTex(
        "un_placards",
        1024,
        768,
        (x, W, H) => {
          x.fillStyle = "#e8e4d8";
          x.fillRect(0, 0, W, H);
          x.fillStyle = "#1a1a1a";
          x.textAlign = "center";
          x.textBaseline = "middle";
          for (let i = 0; i < 96; i++) {
            const c = i % 4,
              r = Math.floor(i / 4);
            LI.fitText(
              x,
              NAMES[i % NAMES.length],
              c * 256 + 128,
              r * 32 + 17,
              236,
              22,
              "bold %spx Arial, sans-serif",
            );
            x.fillRect(c * 256, r * 32, 256, 1);
          }
          LI.wear(x, W, H, 3, 0.5);
        },
        { clamp: true },
      ),
      { rough: 0.8 },
    );
    T.map = LI.texMat(
      "un_warmap",
      LI.canvasTex(
        "un_warmap",
        1024,
        1024,
        (x, W, H) => {
          const M = LI.manhattanMap(x, W, H, {
            sea: "#1c2a2e",
            land: "#8a8468",
            park: "#5a6a40",
          });
          const pin = (X, Z, col, label) => {
            x.fillStyle = col;
            x.beginPath();
            x.arc(M.px(X), M.pz(Z), 9, 0, TAU);
            x.fill();
            x.fillStyle = "#e8e4d8";
            x.font = "bold 18px monospace";
            x.fillText(label, M.px(X) + 12, M.pz(Z) + 6);
          };
          pin(313, -320, "#a01c26", "FWD CMD");
          pin(-420, 1250, "#a01c26", "TORCH / ARRAY");
          pin(80, -320, "#3a6ad0", "COVENANT");
          pin(80, -72, "#d8a020", "CORE 2 (BRUTES)");
          pin(240, -230, "#e8e4d8", "MARKET");
          pin(0, 828, "#d8a020", "RAIDERS");
          x.strokeStyle = "#a01c26";
          x.lineWidth = 4;
          x.setLineDash([12, 8]);
          x.beginPath();
          x.moveTo(M.px(313), M.pz(-320));
          x.lineTo(M.px(-420), M.pz(1250));
          x.stroke();
          x.setLineDash([]);
          x.fillStyle = "#e8e4d8";
          x.font = "bold 30px Georgia, serif";
          x.fillText("PROJECT KNICKERBOCKER", 30, 50);
          LI.wear(x, W, H, 17, 0.6);
        },
        { clamp: true },
      ),
      { rough: 0.9 },
    );
    T.rose = LI.texMat(
      "un_rose",
      LI.canvasTex(
        "un_rose",
        512,
        512,
        (x, W, H) => {
          x.fillStyle = "#2a2a2c";
          x.fillRect(0, 0, W, H);
          x.strokeStyle = "#c8a850";
          x.fillStyle = "#c8a850";
          x.lineWidth = 3;
          for (let i = 1; i <= 4; i++) {
            x.beginPath();
            x.arc(W / 2, H / 2, i * 58, 0, TAU);
            x.stroke();
          }
          for (let i = 0; i < 36; i++) {
            const a = (i / 36) * TAU;
            x.beginPath();
            x.moveTo(W / 2 + Math.cos(a) * 200, H / 2 + Math.sin(a) * 200);
            x.lineTo(W / 2 + Math.cos(a) * 240, H / 2 + Math.sin(a) * 240);
            x.stroke();
          }
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU;
            x.beginPath();
            x.moveTo(W / 2, H / 2);
            x.lineTo(
              W / 2 + Math.cos(a + 0.1) * 60,
              H / 2 + Math.sin(a + 0.1) * 60,
            );
            x.lineTo(
              W / 2 + Math.cos(a) * (i % 2 ? 150 : 225),
              H / 2 + Math.sin(a) * (i % 2 ? 150 : 225),
            );
            x.lineTo(
              W / 2 + Math.cos(a - 0.1) * 60,
              H / 2 + Math.sin(a - 0.1) * 60,
            );
            x.fill();
          }
          LI.wear(x, W, H, 8, 0.6);
        },
        { clamp: true },
      ),
      { rough: 0.5, metal: 0.3 },
    );
    T.sign = (id, lines, st, w, h) =>
      LI.texMat("un_sign_" + id, LI.signTex("un_" + id, lines, st, w, h), {
        rough: 0.7,
      });
    return T;
  }

  // ==================================================================
  // Build
  // ==================================================================
