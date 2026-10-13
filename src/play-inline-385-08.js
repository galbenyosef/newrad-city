// play-inline-385 08 — fillstyle
// Lines 1754-1949 of readable/play-inline-385.pretty.js (statement-aligned).
  K.cubbyCell = function () {
    return K.paint("art", "ppn_cubbies", 512, 256, function (x, X, Y, W, H) {
      const r = K.rng("cub");
      x.fillStyle = "#5a3a22";
      x.fillRect(X, Y, W, H);
      const cols = 14,
        rows = 8,
        cw = W / cols,
        ch = H / rows;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const px = X + i * cw + 2,
            py = Y + j * ch + 2;
          x.fillStyle = "#1e140c";
          x.fillRect(px, py, cw - 4, ch - 4);
          if (r() < 0.55) {
            x.fillStyle = "#b8924a";
            x.fillRect(px + cw * 0.45, py + 3, 3, ch * 0.45);
            x.beginPath();
            x.arc(px + cw * 0.45 + 1.5, py + ch * 0.55, 4, 0, 6.3);
            x.fill();
          }
          if (r() < 0.35) {
            x.fillStyle = r.pick(["#e0d8c4", "#d8ccaa", "#c8d0d8"]);
            x.fillRect(px + 3, py + ch - 14, cw - 10, 8);
          }
          x.fillStyle = "#d8c090";
          x.font = "7px Arial";
          x.fillText(String((18 - j) * 100 + i + 1), px + 2, py + ch - 3);
        }
      K.grain(x, X, Y, W, H, 26, 441);
      K.stains(x, X, Y, W, H, 6, 442, 0.4);
    });
  };
  /** Switchboard jack field: rows of jacks, designation strips, lamps. */
  K.jackCell = function () {
    return K.paint("art", "ppn_jacks", 512, 256, function (x, X, Y, W, H) {
      const r = K.rng("jack");
      x.fillStyle = "#2a1e14";
      x.fillRect(X, Y, W, H);
      for (let j = 0; j < 10; j++) {
        const py = Y + 10 + j * 24;
        x.fillStyle = "#d8ccaa";
        x.fillRect(X + 6, py, W - 12, 6);
        x.fillStyle = "#2a2418";
        x.font = "5px Arial";
        for (let i = 0; i < 20; i++)
          x.fillText(String(6500 + j * 20 + i), X + 8 + i * 25, py + 5);
        for (let i = 0; i < 20; i++) {
          const px = X + 14 + i * 25;
          x.fillStyle = "#0a0806";
          x.beginPath();
          x.arc(px, py + 13, 4, 0, 6.3);
          x.fill();
          x.strokeStyle = "#8a7040";
          x.lineWidth = 1.5;
          x.stroke();
          if (r() < 0.08) {
            x.fillStyle = "#f0a030";
            x.beginPath();
            x.arc(px + 8, py + 13, 2.5, 0, 6.3);
            x.fill();
          }
        }
      }
      x.fillStyle = "#c8a050";
      x.font = "bold 12px Georgia";
      x.textAlign = "center";
      x.fillText("PENNSYLVANIA 6-5000", X + W / 2, Y + H - 6);
      K.grain(x, X, Y, W, H, 24, 451);
      K.stains(x, X, Y, W, H, 5, 452, 0.35);
    });
  };
  /** Elevator floor-indicator dial (semicircle, needle). */
  K.dialCell = function (floor) {
    return K.paint(
      "art",
      "ppn_dial_" + floor,
      192,
      96,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const cx = X + W / 2,
          cy = Y + H - 6;
        x.fillStyle = "#b8924a";
        x.beginPath();
        x.arc(cx, cy, H - 8, PI, 0);
        x.fill();
        x.fillStyle = "#e8dcb8";
        x.beginPath();
        x.arc(cx, cy, H - 16, PI, 0);
        x.fill();
        x.fillStyle = "#2a2014";
        x.font = "bold 9px Georgia";
        x.textAlign = "center";
        const labels = [
          "L",
          "M",
          "2",
          "4",
          "6",
          "8",
          "10",
          "12",
          "14",
          "16",
          "18",
          "20",
          "22",
        ];
        labels.forEach((t, i) => {
          const a = PI + ((i + 0.5) / labels.length) * PI;
          x.fillText(
            t,
            cx + Math.cos(a) * (H - 26),
            cy + Math.sin(a) * (H - 26) + 3,
          );
        });
        const fi = Math.max(0, labels.indexOf(floor)),
          a = PI + ((fi + 0.5) / labels.length) * PI;
        x.strokeStyle = "#1a1208";
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(a) * (H - 20), cy + Math.sin(a) * (H - 20));
        x.stroke();
        K.grain(x, X, Y, W, H, 20, 461);
      },
    );
  };
  /** Carved inscription frieze band (opaque limestone with incised letters). */
  K.friezeCell = function (key, text, w, h, o) {
    o = o || {};
    return K.paint("art", "ppn_frieze_" + key, w, h, function (x, X, Y, W, H) {
      const r = K.rng(key);
      x.fillStyle = o.bg || "#cbc3b2";
      x.fillRect(X, Y, W, H);
      K.grain(x, X, Y, W, H, 22, 471);
      K.stains(x, X, Y, W, H, 14, 472, 0.28, [70, 64, 50]);
      K.streaks(x, X, Y, W, H, 36, 473, 0.3);
      x.textAlign = "center";
      x.textBaseline = "middle";
      const fs = Math.round(H * 0.56);
      x.font =
        (o.weight || "600") +
        " " +
        fs +
        'px "Trajan Pro", "Times New Roman", Georgia, serif';
      // incised: dark core, light lower-right lip
      const tx = X + W / 2,
        ty = Y + H / 2 + 2;
      x.fillStyle = "rgba(245,240,228,0.55)";
      x.fillText(text, tx + 1.5, ty + 2, W * 0.985);
      x.fillStyle = "#4a4236";
      x.fillText(text, tx, ty, W * 0.985);
      // weathering: chipped letters, soot drips from the cornice
      for (let k = 0; k < 60; k++) {
        x.fillStyle = rgba(200, 192, 176, (0.4 + r() * 0.5).toFixed(2));
        x.fillRect(X + r() * W, Y + r() * H, 2 + r() * 8, 2 + r() * 6);
      }
      for (let k = 0; k < 18; k++) {
        const px = X + r() * W,
          g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "rgba(30,26,20,0.45)");
        g.addColorStop(1, "rgba(30,26,20,0)");
        x.fillStyle = g;
        x.fillRect(px, Y, 3 + r() * 10, H * (0.4 + r() * 0.6));
      }
    });
  };
  /** Patterned hotel carpet runner (repeating medallions). */
  K.runnerCell = function () {
    return K.paint("art", "ppn_runner", 128, 512, function (x, X, Y, W, H) {
      x.fillStyle = "#5a1a16";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#b08a3a";
      x.fillRect(X + 6, Y, 5, H);
      x.fillRect(X + W - 11, Y, 5, H);
      for (let k = 0; k < 8; k++) {
        const cy = Y + 32 + k * 64;
        x.fillStyle = "#1c2a3a";
        x.beginPath();
        x.moveTo(X + W / 2, cy - 26);
        x.lineTo(X + W / 2 + 34, cy);
        x.lineTo(X + W / 2, cy + 26);
        x.lineTo(X + W / 2 - 34, cy);
        x.fill();
        x.fillStyle = "#c8a050";
        x.beginPath();
        x.arc(X + W / 2, cy, 9, 0, 6.3);
        x.fill();
      }
      K.grain(x, X, Y, W, H, 40, 481);
      K.stains(x, X, Y, W, H, 10, 482, 0.5, [30, 20, 10]);
    });
  };
