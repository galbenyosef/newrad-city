// play-inline-381 02 — fillstyle
// Lines 18-342 of readable/play-inline-381.pretty.js (statement-aligned).
  const PV = G._ppn;
  const K = PV.kit;
  const P = K.customPaint;
  const rgba = K.rgba;

  P.coffer = function (x, S, r) {
    x.fillStyle = "#cfc6b0";
    x.fillRect(0, 0, S, S);
    const n = 4,
      c = S / n;
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const X = i * c,
          Y = j * c;
        // stepped recess: three nested frames getting darker
        for (let k = 0; k < 3; k++) {
          const in0 = c * (0.1 + k * 0.08);
          x.fillStyle = rgba(190 - k * 30, 180 - k * 30, 160 - k * 30, 1);
          x.fillRect(X + in0, Y + in0, c - in0 * 2, c - in0 * 2);
        }
        // shadow side (light from below-left in the dome)
        x.fillStyle = "rgba(40,30,20,0.25)";
        x.fillRect(X + c * 0.1, Y + c * 0.1, c * 0.8, c * 0.06);
        x.fillRect(X + c * 0.1, Y + c * 0.1, c * 0.06, c * 0.8);
        // rosette
        const cx = X + c / 2,
          cy = Y + c / 2;
        x.fillStyle = "#b89a5a";
        for (let k = 0; k < 8; k++) {
          const a = (k * Math.PI) / 4;
          x.beginPath();
          x.ellipse(
            cx + Math.cos(a) * c * 0.07,
            cy + Math.sin(a) * c * 0.07,
            c * 0.06,
            c * 0.025,
            a,
            0,
            Math.PI * 2,
          );
          x.fill();
        }
        x.fillStyle = "#d8c080";
        x.beginPath();
        x.arc(cx, cy, c * 0.04, 0, Math.PI * 2);
        x.fill();
      }
    K.stains(x, 0, 0, S, S, 14, 611, 0.35, [60, 45, 25]);
    K.streaks(x, 0, 0, S, S, 20, 612, 0.2);
  };

  P.tower = function (x, S, r) {
    // granite piers & spandrels
    x.fillStyle = "#b7b3aa";
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 1400; i++) {
      const v = 150 + r() * 60;
      x.fillStyle = rgba(v, v * 0.98, v * 0.93, 0.35);
      x.fillRect(r() * S, r() * S, 1 + r() * 3, 1 + r() * 2);
    }
    const n = 4,
      cw = S / n,
      ch = S / n;
    x.strokeStyle = "rgba(70,65,60,0.35)";
    x.lineWidth = 1;
    for (let j = 0; j <= n * 3; j++) {
      x.beginPath();
      x.moveTo(0, (j * ch) / 3);
      x.lineTo(S, (j * ch) / 3);
      x.stroke();
    } // stone courses
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const X = i * cw + cw * 0.24,
          Y = j * ch + ch * 0.18,
          W = cw * 0.52,
          H = ch * 0.6;
        const u = r();
        // reveal
        x.fillStyle = "#5c5953";
        x.fillRect(X - 3, Y - 3, W + 6, H + 6);
        if (u < 0.16) {
          x.fillStyle = "#0c0c0c";
          x.fillRect(X, Y, W, H);
          for (let k = 0; k < 4; k++) {
            x.fillStyle = "rgba(150,170,170,0.5)";
            x.beginPath();
            x.moveTo(X + r() * W, Y);
            x.lineTo(X + r() * W, Y + r() * H * 0.6);
            x.lineTo(X + r() * W, Y);
            x.fill();
          }
        } else if (u < 0.24) {
          x.fillStyle = "#6a5a44";
          x.fillRect(X, Y, W, H);
          x.fillStyle = "rgba(40,30,20,0.6)";
          for (let k = 0; k < 4; k++) x.fillRect(X, Y + (k * H) / 4 + 2, W, 2);
        } else {
          const g = x.createLinearGradient(X, Y, X + W, Y + H);
          g.addColorStop(0, "#2c3434");
          g.addColorStop(0.55, "#46514f");
          g.addColorStop(1, "#1e2322");
          x.fillStyle = g;
          x.fillRect(X, Y, W, H);
          x.fillStyle = "rgba(200,215,210,0.10)";
          x.fillRect(X + W * 0.1, Y, W * 0.12, H); // sky glint
          if (u > 0.965) {
            x.fillStyle = "rgba(255,190,110,0.55)";
            x.fillRect(X + 2, Y + 2, W - 4, H - 4);
          } // a squatter's lamp
        }
        x.fillStyle = "#8c8880";
        x.fillRect(X + W / 2 - 1.5, Y, 3, H);
        x.fillRect(X, Y + H * 0.55, W, 3); // mullion / transom
        x.fillStyle = "#d2cec4";
        x.fillRect(X - 5, Y + H + 3, W + 10, 4); // sill
      }
    K.stains(x, 0, 0, S, S, 20, 621, 0.35, [40, 36, 30]);
    K.streaks(x, 0, 0, S, S, 60, 622, 0.28);
  };

  P.deposit = function (x, S, r) {
    x.fillStyle = "#3a3226";
    x.fillRect(0, 0, S, S);
    const cols = 8,
      rows = 10,
      cw = S / cols,
      ch = S / rows;
    x.font = "bold " + Math.round(ch * 0.22) + "px Georgia, serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const X = i * cw + 2,
          Y = j * ch + 2,
          W = cw - 4,
          H = ch - 4;
        const v = 0.8 + r() * 0.35,
          open = r() < 0.08;
        const g = x.createLinearGradient(X, Y, X, Y + H);
        g.addColorStop(0, rgba(196 * v, 158 * v, 88 * v, 1));
        g.addColorStop(1, rgba(130 * v, 98 * v, 50 * v, 1));
        x.fillStyle = open ? "#0d0b08" : g;
        x.fillRect(X, Y, W, H);
        if (open) continue;
        x.strokeStyle = "rgba(60,40,15,0.8)";
        x.lineWidth = 1.5;
        x.strokeRect(X + 2, Y + 2, W - 4, H - 4);
        x.fillStyle = "#231a0c";
        x.beginPath();
        x.arc(X + W * 0.3, Y + H * 0.55, H * 0.1, 0, Math.PI * 2);
        x.fill();
        x.fillRect(X + W * 0.3 - 1, Y + H * 0.55, 2, H * 0.2);
        x.beginPath();
        x.arc(X + W * 0.7, Y + H * 0.55, H * 0.1, 0, Math.PI * 2);
        x.fill();
        x.fillRect(X + W * 0.7 - 1, Y + H * 0.55, 2, H * 0.2);
        x.fillStyle = "rgba(40,25,5,0.85)";
        x.fillText(String(1000 + j * cols + i), X + W / 2, Y + H * 0.24);
      }
    K.stains(x, 0, 0, S, S, 10, 631, 0.35, [20, 15, 8]);
  };

  P.damask_red = function (x, S, r) {
    x.fillStyle = "#5e1c1a";
    x.fillRect(0, 0, S, S);
    x.fillStyle = "rgba(150,60,50,0.45)";
    for (let j = 0; j < 4; j++)
      for (let i = 0; i < 4; i++) {
        const cx = (i * S) / 4 + ((j % 2) * S) / 8 + S / 8,
          cy = (j * S) / 4 + S / 8;
        x.beginPath();
        x.ellipse(cx, cy, S / 26, S / 11, 0, 0, Math.PI * 2);
        x.fill();
        for (const s of [-1, 1]) {
          x.beginPath();
          x.ellipse(
            cx + (s * S) / 20,
            cy + S / 26,
            S / 44,
            S / 20,
            s * 0.7,
            0,
            Math.PI * 2,
          );
          x.fill();
          x.beginPath();
          x.ellipse(
            cx + (s * S) / 30,
            cy - S / 16,
            S / 60,
            S / 34,
            s * 0.4,
            0,
            Math.PI * 2,
          );
          x.fill();
        }
      }
    x.fillStyle = "rgba(220,170,90,0.10)";
    for (let i = 0; i < S; i += S / 16) x.fillRect(i, 0, 1.5, S);
    K.stains(x, 0, 0, S, S, 10, 641, 0.3, [30, 10, 8]);
    K.grain(x, 0, 0, S, S, 20, 642);
  };

  P.subway = function (x, S, r) {
    x.fillStyle = "#9a968c";
    x.fillRect(0, 0, S, S);
    const rows = 16,
      h = S / rows,
      w = h * 2;
    for (let j = 0; j < rows; j++)
      for (let i = -1; i < S / w + 1; i++) {
        const X = i * w + ((j % 2) * w) / 2,
          v = 225 + r() * 25,
          dirty = r() < 0.05;
        const g = x.createLinearGradient(0, j * h, 0, j * h + h);
        g.addColorStop(0, rgba(v, v, v * 0.97, 1));
        g.addColorStop(1, rgba(v * 0.88, v * 0.88, v * 0.85, 1));
        x.fillStyle = dirty ? "#b8b09a" : g;
        x.fillRect(X + 1.5, j * h + 1.5, w - 3, h - 3);
      }
    K.stains(x, 0, 0, S, S, 12, 651, 0.3, [80, 70, 50]);
  };

  P.ashlar = function (x, S, r) {
    x.fillStyle = "#cfcabd";
    x.fillRect(0, 0, S, S);
    const rows = 4,
      h = S / rows;
    for (let j = 0; j < rows; j++) {
      const w = S / 2,
        off = ((j % 2) * w) / 2;
      for (let i = -1; i < 3; i++) {
        const v = 0.92 + r() * 0.1;
        x.fillStyle = rgba(214 * v, 208 * v, 194 * v, 1);
        x.fillRect(i * w + off + 2, j * h + 2, w - 4, h - 4);
        // faint veining
        x.strokeStyle = "rgba(150,140,125,0.25)";
        x.lineWidth = 1;
        x.beginPath();
        let px = i * w + off + r() * w,
          py = j * h;
        x.moveTo(px, py);
        for (let k = 0; k < 5; k++) {
          px += (r() - 0.5) * 40;
          py += h / 5;
          x.lineTo(px, py);
        }
        x.stroke();
      }
      x.fillStyle = "rgba(90,85,75,0.5)";
      x.fillRect(0, j * h, S, 2);
    }
    K.grain(x, 0, 0, S, S, 18, 661);
    K.stains(x, 0, 0, S, S, 16, 662, 0.38, [60, 55, 40]);
    K.streaks(x, 0, 0, S, S, 40, 663, 0.3);
  };

  /** Statue bronze: dark oiled bronze with verdigris only where rain runs (vertical drips), rubbed-bright spots. */
  P.statue_bronze = function (x, S, r) {
    x.fillStyle = "#3c3326";
    x.fillRect(0, 0, S, S);
    for (let k = 0; k < 60; k++) {
      const v = 0.8 + r() * 0.4;
      x.fillStyle = rgba(64 * v, 54 * v, 38 * v, 0.35);
      x.fillRect(r() * S, r() * S, 6 + r() * 30, 4 + r() * 20);
    }
    // verdigris drips (vertical: v runs with world height on vertical faces)
    for (let k = 0; k < 26; k++) {
      const px = r() * S,
        w = 2 + r() * 7,
        len = S * (0.2 + r() * 0.7),
        py = r() * S;
      const g = x.createLinearGradient(0, py, 0, py + len);
      g.addColorStop(0, "rgba(92,140,112,0.0)");
      g.addColorStop(0.25, "rgba(92,140,112,0.55)");
      g.addColorStop(1, "rgba(70,110,88,0.0)");
      x.fillStyle = g;
      x.fillRect(px, py, w, len);
      if (py + len > S) x.fillRect(px, py - S, w, len);
    }
    for (let k = 0; k < 8; k++) {
      x.fillStyle = "rgba(160,130,80,0.18)";
      x.beginPath();
      x.arc(r() * S, r() * S, 4 + r() * 10, 0, 6.3);
      x.fill();
    }
    K.grain(x, 0, 0, S, S, 14, 771);
  };

  const M = K.MATDEF;
  M.statue_bronze = {
    custom: "statue_bronze",
    tile: [1.4, 1.4],
    rough: 0.5,
    metal: 0.55,
  };
  M.coffer = { custom: "coffer", tile: [3.2, 3.2], rough: 0.9 };
  M.tower = { custom: "tower", tile: [12, 14], rough: 0.7 };
  M.deposit = { custom: "deposit", tile: [2.4, 2.4], rough: 0.4, metal: 0.55 };
  M.damask_red = { custom: "damask_red", tile: [1.4, 1.4], rough: 0.9 };
  M.subway = { custom: "subway", tile: [1.2, 1.2], rough: 0.35 };
  M.ashlar = { custom: "ashlar", tile: [3.6, 2.4], rough: 0.85 };

  const A = K.ALIAS;
  Object.assign(A, {
    marble_white: ["marble", 0xece8e0],
    marble_green: ["marble", 0x6f8a74],
    marble_red: ["marble", 0x8a4a3e],
    marble_black: ["marble", 0x3a3836],
    granite_pale: ["granite", 0xd2cec6],
    granite_dark: ["granite", 0x6a6660],
    patina: ["flat", 0x55705f],
    silver: ["shiny", 0xc4c8cc],
    crystal: ["lamp", 0xfff0d8],
    paint_olive: ["flat", 0x4a5236],
    raider_cloth: ["fabric", 0x7a3024],
    cloth_blue: ["fabric", 0x2a3a64],
    cloth_gold: ["fabric", 0xb08a3a],
    walnut: ["wood", 0x4a2e1c],
    oxblood: ["flat", 0x4a1210],
    ivory: ["flat", 0xe8e0c8],
    vault_steel: ["shiny", 0x9aa0a4],
  });
