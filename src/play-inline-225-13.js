// play-inline-225 13 — fillrect
// Lines 3442-3761 of readable/play-inline-225.pretty.js (statement-aligned).
  LI.skylineMat = function (id, opts) {
    opts = opts || {};
    const Wd = opts.W || 2048,
      Hd = opts.H || 512,
      HZ = opts.horizon || 0.74,
      kind = opts.kind || "city";
    const key = LI.texMat(
      id,
      LI.canvasTex(
        id,
        Wd,
        Hd,
        (x, W, H) => {
          const r = LI.rng(opts.seed || 7),
            hy = H * HZ;
          const sky = x.createLinearGradient(0, 0, 0, hy);
          sky.addColorStop(0, "#46584a");
          sky.addColorStop(0.5, "#8e9270");
          sky.addColorStop(0.86, "#cfc08a");
          sky.addColorStop(1, "#e2cc92");
          x.fillStyle = sky;
          x.fillRect(0, 0, W, hy + 2);
          x.globalAlpha = 0.18;
          x.fillStyle = "#eee4c0"; // cloud streaks
          for (let i = 0; i < 26; i++) {
            x.beginPath();
            x.ellipse(
              r() * W,
              hy * (0.12 + r() * 0.55),
              80 + r() * 260,
              5 + r() * 14,
              0,
              0,
              TAU,
            );
            x.fill();
          }
          x.globalAlpha = 0.14;
          x.fillStyle = "#2e3a30";
          for (let i = 0; i < 12; i++) {
            x.beginPath();
            x.ellipse(
              r() * W,
              hy * (0.08 + r() * 0.3),
              120 + r() * 300,
              8 + r() * 16,
              0,
              0,
              TAU,
            );
            x.fill();
          }
          x.globalAlpha = 1;
          const ground = x.createLinearGradient(0, hy, 0, H);
          ground.addColorStop(0, "#6a6450");
          ground.addColorStop(1, "#2a2820");
          x.fillStyle = ground;
          x.fillRect(0, hy, W, H - hy);
          const inBands = (u, list) =>
            (list || []).some((b2) => u >= b2[0] && u <= b2[1]);
          for (const b2 of opts.water || []) {
            const g = x.createLinearGradient(0, hy - 4, 0, H);
            g.addColorStop(0, "#9aa08a");
            g.addColorStop(0.2, "#4c5a52");
            g.addColorStop(1, "#232a26");
            x.fillStyle = g;
            x.fillRect(b2[0] * W, hy - 3, (b2[1] - b2[0]) * W, H - hy + 3);
          }
          for (const b2 of opts.park || []) {
            x.fillStyle = "#4e5436";
            x.fillRect(b2[0] * W, hy - 6, (b2[1] - b2[0]) * W, 10);
            for (let i = 0; i < 40; i++) {
              x.fillStyle = r() < 0.5 ? "#3c4228" : "#5a5a38";
              x.beginPath();
              x.arc(
                W * (b2[0] + r() * (b2[1] - b2[0])),
                hy - 6 + r() * 4,
                3 + r() * 6,
                0,
                TAU,
              );
              x.fill();
            }
          }
          const HAZE = [226, 204, 146];
          const mix = (c, k) =>
            "rgb(" +
            c.map((v, i) => Math.round(v + (HAZE[i] - v) * k)).join(",") +
            ")";
          // one tower: box with optional broken top, setbacks, window grid, rooftop water tank / antenna
          const tower = (cx, w, h, base, col, haze, o) => {
            const y0 = base - h;
            x.fillStyle = mix(col, haze);
            if (o.broken) {
              x.beginPath();
              x.moveTo(cx - w / 2, base);
              x.lineTo(cx - w / 2, y0 + h * 0.12);
              const n = 5;
              for (let i = 1; i < n; i++)
                x.lineTo(cx - w / 2 + (w * i) / n, y0 + h * (0.02 + r() * 0.3));
              x.lineTo(cx + w / 2, y0 + h * 0.2);
              x.lineTo(cx + w / 2, base);
              x.closePath();
              x.fill();
            } else {
              x.fillRect(cx - w / 2, y0, w, h);
              if (o.setback) {
                x.fillRect(
                  cx - w * 0.33,
                  y0 - h * 0.12,
                  w * 0.66,
                  h * 0.12 + 1,
                );
                x.fillRect(cx - w * 0.18, y0 - h * 0.2, w * 0.36, h * 0.08 + 1);
              }
              if (o.tank) {
                x.fillRect(cx + w * 0.1, y0 - 9, 8, 7);
                x.fillRect(cx + w * 0.1 + 1, y0 - 2, 1, 3);
                x.fillRect(cx + w * 0.1 + 6, y0 - 2, 1, 3);
              }
              if (o.mast) x.fillRect(cx - 1, y0 - h * 0.25, 2, h * 0.25);
            }
            if (o.windows && haze < 0.5) {
              // window grid
              const cw = Math.max(3, w / 9),
                ch = Math.max(4, cw * 1.3);
              for (let yy = y0 + ch; yy < base - ch; yy += ch)
                for (
                  let xx = cx - w / 2 + cw * 0.6;
                  xx < cx + w / 2 - cw * 0.6;
                  xx += cw
                ) {
                  const q = r();
                  x.fillStyle =
                    q < 0.015
                      ? "rgba(255,200,110,0.85)"
                      : q < 0.3
                        ? "rgba(0,0,0,0.35)"
                        : "rgba(200,190,150," + (0.08 + haze * 0.1) + ")";
                  x.fillRect(xx, yy, cw * 0.5, ch * 0.45);
                }
            }
          };
          const layer = (n, hMin, hMax, wMin, wMax, col, haze, opt) => {
            for (let i = 0; i < n; i++) {
              const u = r();
              if (inBands(u, opts.water) || inBands(u, opts.park)) continue;
              if (kind === "harbor" && u < 0.5) continue;
              const w = wMin + r() * (wMax - wMin),
                h = ((hMin + r() * (hMax - hMin)) * H) / 512;
              tower(u * W, (w * W) / 2048, h, hy + 2, col, haze, {
                broken: r() < opt.broken,
                setback: r() < 0.2,
                tank: r() < 0.3,
                mast: r() < 0.08,
                windows: opt.windows,
              });
            }
          };
          layer(160, 20, 70, 12, 34, [120, 122, 104], 0.62, { broken: 0.15 });
          layer(110, 40, 130, 18, 50, [80, 82, 70], 0.38, {
            broken: 0.3,
            windows: true,
          });
          // landmarks (same depth as the mid layer so they read against the haze)
          for (const m of opts.marks || []) {
            const cx = m.u * W,
              s2 = H / 512,
              c = mix([66, 68, 58], 0.3);
            x.fillStyle = c;
            if (m.kind === "esb") {
              x.fillRect(cx - 26 * s2, hy - 200 * s2, 52 * s2, 202 * s2);
              x.fillRect(cx - 17 * s2, hy - 236 * s2, 34 * s2, 40 * s2);
              x.fillRect(cx - 10 * s2, hy - 262 * s2, 20 * s2, 30 * s2);
              x.fillRect(cx - 5 * s2, hy - 290 * s2, 10 * s2, 30 * s2);
              x.fillRect(cx - 1.5 * s2, hy - 340 * s2, 3 * s2, 52 * s2);
            } else if (m.kind === "chrysler") {
              x.fillRect(cx - 18 * s2, hy - 170 * s2, 36 * s2, 172 * s2);
              for (let k = 0; k < 5; k++) {
                x.beginPath();
                x.arc(
                  cx,
                  hy - (170 + k * 14) * s2,
                  (18 - k * 3.2) * s2,
                  Math.PI,
                  0,
                );
                x.fill();
              }
              x.beginPath();
              x.moveTo(cx - 3 * s2, hy - 236 * s2);
              x.lineTo(cx, hy - 290 * s2);
              x.lineTo(cx + 3 * s2, hy - 236 * s2);
              x.fill();
            } else if (m.kind === "spire") {
              x.fillRect(cx - 14 * s2, hy - 150 * s2, 28 * s2, 152 * s2);
              x.beginPath();
              x.moveTo(cx - 14 * s2, hy - 150 * s2);
              x.lineTo(cx, hy - 205 * s2);
              x.lineTo(cx + 14 * s2, hy - 150 * s2);
              x.fill();
            } else if (m.kind === "liberty") {
              x.fillStyle = mix([70, 100, 86], 0.35);
              x.fillRect(cx - 12 * s2, hy - 26 * s2, 24 * s2, 26 * s2);
              x.fillRect(cx - 4 * s2, hy - 64 * s2, 8 * s2, 40 * s2);
              x.fillRect(cx + 2 * s2, hy - 84 * s2, 3 * s2, 24 * s2);
              x.beginPath();
              x.arc(cx + 3.5 * s2, hy - 88 * s2, 4 * s2, 0, TAU);
              x.fill();
            } else if (m.kind === "bridge") {
              x.strokeStyle = c;
              x.lineWidth = 2;
              for (const t of [-1, 1])
                x.fillRect(
                  cx + t * 120 * s2 - 7 * s2,
                  hy - 90 * s2,
                  14 * s2,
                  92 * s2,
                );
              x.beginPath();
              x.moveTo(cx - 260 * s2, hy - 10 * s2);
              x.quadraticCurveTo(
                cx - 180 * s2,
                hy - 30 * s2,
                cx - 120 * s2,
                hy - 88 * s2,
              );
              x.quadraticCurveTo(cx, hy - 20 * s2, cx + 120 * s2, hy - 88 * s2);
              x.quadraticCurveTo(
                cx + 180 * s2,
                hy - 30 * s2,
                cx + 260 * s2,
                hy - 10 * s2,
              );
              x.stroke();
              x.fillRect(cx - 260 * s2, hy - 12 * s2, 520 * s2, 4 * s2);
            }
          }
          layer(34, 90, 230, 36, 90, [42, 44, 38], 0.14, {
            broken: 0.45,
            windows: true,
          });
          const hz2 = x.createLinearGradient(0, hy - H * 0.12, 0, hy + 6);
          hz2.addColorStop(0, "rgba(226,204,146,0)");
          hz2.addColorStop(1, "rgba(226,204,146,0.55)");
          x.fillStyle = hz2;
          x.fillRect(0, hy - H * 0.12, W, H * 0.12 + 6);
          LI.wear(x, W, H, (opts.seed || 7) + 3, 0.25);
        },
        { clamp: !opts.wrap },
      ),
      { emissive: 0.75, rough: 1 },
    );
    LI.skyCards.push(key);
    return key;
  };

  // =====================================================================
  // Painted art helpers (all original)
  // =====================================================================
  /** Stylised bust portrait in an oval (for "forgotten mayors / governors"). */
  LI.portrait = function (x, X, Y, W, H, seed) {
    const r = LI.rng(seed);
    const bg = x.createRadialGradient(
      X + W / 2,
      Y + H * 0.4,
      5,
      X + W / 2,
      Y + H / 2,
      W * 0.8,
    );
    bg.addColorStop(0, ["#6a5a40", "#4a4a3a", "#5a3a2a", "#3a4a4a"][seed % 4]);
    bg.addColorStop(1, "#1a1410");
    x.fillStyle = bg;
    x.fillRect(X, Y, W, H);
    const cx = X + W / 2,
      cy = Y + H * 0.42;
    x.fillStyle = ["#1a1a20", "#2a2018", "#101418"][seed % 3]; // coat
    x.beginPath();
    x.moveTo(X + W * 0.12, Y + H);
    x.quadraticCurveTo(cx, cy + H * 0.12, X + W * 0.88, Y + H);
    x.fill();
    x.fillStyle = "#e8e0d0";
    x.beginPath();
    x.moveTo(cx - W * 0.08, cy + H * 0.2);
    x.lineTo(cx, cy + H * 0.36);
    x.lineTo(cx + W * 0.08, cy + H * 0.2);
    x.fill();
    x.fillStyle = ["#c89a78", "#b88a68", "#d8b090", "#9a7050"][seed % 4];
    x.beginPath();
    x.ellipse(cx, cy, W * 0.15, H * 0.14, 0, 0, TAU);
    x.fill();
    x.fillStyle = ["#3a2a1a", "#8a8078", "#1a1410", "#c8c0b0"][(seed >> 1) % 4];
    x.beginPath();
    x.ellipse(cx, cy - H * 0.08, W * 0.16, H * 0.08, 0, Math.PI, TAU);
    x.fill();
    if (r() < 0.5) {
      x.fillRect(cx - W * 0.13, cy + H * 0.02, W * 0.26, H * 0.06);
    }
    x.fillStyle = "rgba(20,14,8,0.6)";
    x.fillRect(cx - W * 0.07, cy - H * 0.01, W * 0.04, H * 0.015);
    x.fillRect(cx + W * 0.03, cy - H * 0.01, W * 0.04, H * 0.015);
    const v = x.createRadialGradient(
      cx,
      Y + H / 2,
      W * 0.3,
      cx,
      Y + H / 2,
      W * 0.75,
    );
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.7)");
    x.fillStyle = v;
    x.fillRect(X, Y, W, H);
    x.strokeStyle = "#8a6a30";
    x.lineWidth = 6;
    x.strokeRect(X + 3, Y + 3, W - 6, H - 6);
  };
  /** The Iron Covenant's mark (original): a heater shield outline with an anvil, a single upright hammer over it
   *  and three rank bars below (Acolyte · Lancer · Warden). */
