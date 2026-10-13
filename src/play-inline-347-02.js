// play-inline-347 02 — fillstyle
// Lines 31-197 of readable/play-inline-347.pretty.js (statement-aligned).
  const PC = G._pc;
  const K = PC.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const GAL = 5;
  const WARM = [1, 0.75, 0.45],
    FIRE = [1, 0.5, 0.2],
    COOL = [0.7, 0.78, 0.88],
    TUBE = [0.88, 0.98, 0.86];

  // ------------------------------------------------------------------ textures & art
  K.addCustom(
    "guastavino",
    function (x, S, r) {
      // herringbone terracotta vault tile
      x.fillStyle = "#6a4a36";
      x.fillRect(0, 0, S, S);
      const w = S / 16,
        l = w * 3;
      for (let j = -2; j < 22; j++)
        for (let i = -2; i < 12; i++) {
          const ox = i * l + (j % 2) * w * 1.5,
            oy = j * w * 1.5;
          for (const flip of [0, 1]) {
            x.save();
            x.translate(ox + flip * w * 1.5, oy);
            x.rotate(flip ? -PI / 4 : PI / 4);
            const v = 150 + r() * 50;
            x.fillStyle =
              "rgb(" +
              (v | 0) +
              "," +
              ((v * 0.72) | 0) +
              "," +
              ((v * 0.52) | 0) +
              ")";
            x.fillRect(0, 0, l, w - 2);
            x.restore();
          }
        }
      K.stains(x, 0, 0, S, S, 24, 1801, 0.45, [40, 25, 15]);
    },
    { tile: [2.4, 2.4], rough: 0.7 },
  );
  K.addCustom(
    "files",
    function (x, S, r) {
      // steel filing drawers with label cards
      x.fillStyle = "#3a3e38";
      x.fillRect(0, 0, S, S);
      const cols = 4,
        rows = 8,
        cw = S / cols,
        rh = S / rows;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const X = i * cw,
            Y = j * rh,
            v = 95 + r() * 30;
          const open = r() < 0.08;
          x.fillStyle = open
            ? "#121210"
            : "rgb(" +
              ((v * 0.9) | 0) +
              "," +
              (v | 0) +
              "," +
              ((v * 0.85) | 0) +
              ")";
          x.fillRect(X + 3, Y + 3, cw - 6, rh - 6);
          if (open) {
            x.fillStyle = "#d8d0b8";
            for (let k = 0; k < 6; k++)
              x.fillRect(X + 8 + (k * (cw - 16)) / 6, Y + 8, 3, rh - 14);
            continue;
          }
          x.fillStyle = "rgba(255,255,255,0.12)";
          x.fillRect(X + 3, Y + 3, cw - 6, 3);
          x.fillStyle = "#e0d8c0";
          x.fillRect(X + cw / 2 - 16, Y + 10, 32, 14); // label card
          x.fillStyle = "#3a3428";
          x.font = "9px monospace";
          x.textAlign = "center";
          x.fillText(
            String.fromCharCode(65 + ((i + j * 3) % 26)) +
              "-" +
              (((r() * 90) | 0) + 10),
            X + cw / 2,
            Y + 21,
          );
          x.fillStyle = "#8a8a82";
          x.fillRect(X + cw / 2 - 12, Y + rh - 22, 24, 6); // handle
        }
      K.stains(x, 0, 0, S, S, 26, 1802, 0.5, [60, 45, 25]);
      K.streaks(x, 0, 0, S, S, 20, 1803, 0.25);
    },
    { tile: [2.4, 2.4], rough: 0.55, metal: 0.3 },
  );

  const directory = () =>
    K.paint("art", "pc_mb_dir", 384, 512, function (x, X, Y, W, H) {
      x.fillStyle = "#141414";
      x.fillRect(X, Y, W, H);
      x.strokeStyle = "#b8903c";
      x.lineWidth = 6;
      x.strokeRect(X + 5, Y + 5, W - 10, H - 10);
      x.fillStyle = "#e8e0c8";
      x.font = "bold 22px Georgia, serif";
      x.textAlign = "center";
      x.fillText("DIRECTORY", X + W / 2, Y + 40);
      const L = [
        ["HALL OF RECORDS", "G"],
        ["MARRIAGE LICENSE BUREAU", "G"],
        ["VITAL STATISTICS", "2"],
        ["SURROGATE'S STRONGROOM", "2"],
        ["BUREAU OF FORMS", "3"],
        ["BUREAU OF FORMS (ANNEX)", "4"],
        ["DEPT. OF COMPLAINTS", "7"],
        ["DEPT. OF COMPLAINT FORMS", "8"],
        ["FEDERAL LIAISON", "12"],
        ["CIVIL DEFENSE", "19"],
        ["CIVIL DEFENSE SHELTER", "B"],
        ["MAYOR'S OFFICE", "25"],
      ];
      x.font = "15px monospace";
      L.forEach(([n, f], i) => {
        x.textAlign = "left";
        x.fillText(n, X + 22, Y + 80 + i * 33);
        x.textAlign = "right";
        x.fillText(f, X + W - 22, Y + 80 + i * 33);
      });
      x.fillStyle = "rgba(0,0,0,0.9)";
      x.fillRect(X + 20, Y + 80 + 10 * 33 - 16, W - 40, 20); // a missing letter row
      K.stains(x, X, Y, W, H, 10, 1804, 0.3, [80, 70, 50]);
    });
  const deedSign = () =>
    K.signCell(
      "pc_mb_hall",
      "HALL OF RECORDS\nCITY OF NEW YORK · DEPARTMENT OF RECORDS AND INFORMATION",
      1024,
      192,
      {
        bg: "#2a2620",
        fg: "#d8c088",
        font: "Georgia, serif",
        border: "#b8903c",
      },
    );

  // ------------------------------------------------------------------ helpers
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  /** Inward barrel vault along x (spanning z around zc, spring y, rise h). */
  function barrelX(b, x0, x1, zc, rz, y, h, mat, tint, seg) {
    K.vault(b, {
      axis: "x",
      from: x0,
      to: x1,
      c: zc,
      r: rz,
      y,
      h,
      mat,
      tint,
      seg: seg || 12,
    });
  }

