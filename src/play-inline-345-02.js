// play-inline-345 02 — fillstyle
// Lines 31-293 of readable/play-inline-345.pretty.js (statement-aligned).
  const PC = G._pc;
  const K = PC.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const C = { x: 0, z: -15 },
    R = 9.5,
    A = R * Math.cos(PI / 8),
    HS = R * Math.sin(PI / 8);
  const GAL = 5,
    RH = 10,
    BY = -5;
  const WARM = [1, 0.78, 0.5],
    COOL = [0.72, 0.8, 0.9],
    SICK = [0.75, 0.95, 0.7];
  const CREAM = [0.86, 0.82, 0.72],
    GREEN_W = [0.62, 0.7, 0.6];

  // ------------------------------------------------------------------ art
  const seal = () =>
    K.paint("art", "pc_pd_seal", 256, 256, function (x, X, Y, W, H) {
      x.fillStyle = "#6a6458";
      x.fillRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H / 2;
      x.fillStyle = "#22324a";
      x.beginPath();
      x.arc(cx, cy, W * 0.47, 0, PI * 2);
      x.fill();
      x.fillStyle = "#c8a860";
      x.beginPath();
      x.arc(cx, cy, W * 0.42, 0, PI * 2);
      x.fill();
      x.fillStyle = "#22324a";
      x.beginPath();
      x.arc(cx, cy, W * 0.36, 0, PI * 2);
      x.fill();
      x.fillStyle = "#d8c080";
      for (let k = 0; k < 7; k++) {
        const a = -HP + (k * PI * 2) / 7;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(
          cx + Math.cos(a - 0.2) * W * 0.12,
          cy + Math.sin(a - 0.2) * W * 0.12,
        );
        x.lineTo(cx + Math.cos(a) * W * 0.32, cy + Math.sin(a) * W * 0.32);
        x.lineTo(
          cx + Math.cos(a + 0.2) * W * 0.12,
          cy + Math.sin(a + 0.2) * W * 0.12,
        );
        x.fill();
      }
      x.fillStyle = "#22324a";
      x.font = "bold 22px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("NYPD", cx, cy);
      x.fillStyle = "#22324a";
      x.font = "bold 13px Georgia, serif";
      const t = "FIDELIS AD MORTEM · CITY OF NEW YORK · ";
      for (let i = 0; i < t.length; i++) {
        const a = -PI + (i / t.length) * PI * 2;
        x.save();
        x.translate(cx + Math.cos(a) * W * 0.39, cy + Math.sin(a) * W * 0.39);
        x.rotate(a + HP);
        x.fillText(t[i], 0, 0);
        x.restore();
      }
      K.stains(x, X, Y, W, H, 12, 1601, 0.5, [40, 30, 20]);
    });
  const memorial = () =>
    K.paint("art", "pc_pd_memorial", 384, 512, function (x, X, Y, W, H) {
      x.fillStyle = "#4a3e2a";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#c8a860";
      x.font = "bold 26px Georgia, serif";
      x.textAlign = "center";
      x.fillText("IN MEMORIAM", X + W / 2, Y + 42);
      x.font = "15px Georgia, serif";
      x.fillText(
        "OFFICERS OF THE N.Y.P.D. WHO GAVE THEIR LIVES",
        X + W / 2,
        Y + 66,
      );
      const r = K.rng("memorial");
      const first = [
          "J.",
          "M.",
          "T.",
          "R.",
          "E.",
          "P.",
          "W.",
          "A.",
          "F.",
          "D.",
        ],
        last = [
          "O'BRIEN",
          "KOWALSKI",
          "RUSSO",
          "WASHINGTON",
          "GOLDBERG",
          "MURPHY",
          "DELGADO",
          "CHEN",
          "MORETTI",
          "KELLY",
          "NOVAK",
          "BRENNAN",
          "SULLIVAN",
          "ORTIZ",
          "FLYNN",
        ];
      x.font = "12px Georgia, serif";
      for (let i = 0; i < 26; i++) {
        x.textAlign = "left";
        x.fillText(
          r.pick(first) + " " + r.pick(last),
          X + 30,
          Y + 96 + i * 14.5,
        );
        x.textAlign = "right";
        x.fillText(
          "19" + (10 + ((r() * 67) | 0)),
          X + W / 2 - 16,
          Y + 96 + i * 14.5,
        );
        x.textAlign = "left";
        x.fillText(
          r.pick(first) + " " + r.pick(last),
          X + W / 2 + 12,
          Y + 96 + i * 14.5,
        );
        x.textAlign = "right";
        x.fillText(
          i > 20 ? "1967" : "20" + (10 + ((r() * 67) | 0)),
          X + W - 24,
          Y + 96 + i * 14.5,
        );
      }
      x.fillStyle = "rgba(200,168,96,0.9)";
      x.font = "italic 13px Georgia, serif";
      x.textAlign = "center";
      x.fillText(
        "(and 4,112 PATROLMAN UNITS, WHO ARE STILL ON DUTY)",
        X + W / 2,
        Y + H - 22,
      );
      K.stains(x, X, Y, W, H, 14, 1602, 0.45, [20, 15, 10]);
    });
  const wanted = () =>
    K.paint("art", "pc_pd_wanted", 512, 320, function (x, X, Y, W, H) {
      x.fillStyle = "#6a5a40";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#e8dcc0";
      x.font = 'bold 30px "Arial Black", sans-serif';
      x.textAlign = "center";
      x.fillText("MOST WANTED", X + W / 2, Y + 36);
      for (let i = 0; i < 6; i++) {
        const px = X + 16 + (i % 3) * 164,
          py = Y + 52 + Math.floor(i / 3) * 132;
        x.fillStyle = "#e0d6bc";
        x.fillRect(px, py, 150, 124);
        x.fillStyle = "#b8b0a0";
        x.fillRect(px + 8, py + 8, 70, 86);
        x.fillStyle = "#2a2520";
        x.beginPath();
        x.ellipse(px + 43, py + 42, 17, 20, 0, 0, 6.3);
        x.fill();
        x.beginPath();
        x.ellipse(px + 43, py + 92, 30, 24, 0, PI, 0);
        x.fill();
        x.fillStyle = "#2a2018";
        x.font = "bold 12px Arial";
        x.textAlign = "left";
        const L = [
          ["MAD DOG", "MCGEE", "ARSON"],
          ['"FIZZY"', "NICKY", "THEFT"],
          ["C. FINCH", "", "SEDITION"],
          ["UNKNOWN", "DRIFTER", "CURFEW"],
          ["THE", "COMMISSIONER", "??"],
          ["YOU", "", "CURFEW"],
        ][i];
        L.forEach((t, k) => x.fillText(t, px + 84, py + 24 + k * 18));
        x.fillStyle = "#9a1e16";
        x.font = "bold 13px Arial";
        x.fillText("REWARD", px + 84, py + 100);
      }
      K.stains(x, X, Y, W, H, 14, 1603, 0.45, [40, 30, 15]);
    });
  const chalkMap = () =>
    K.paint("art", "pc_pd_chalk", 512, 320, function (x, X, Y, W, H) {
      x.fillStyle = "#1e2a22";
      x.fillRect(X, Y, W, H);
      x.strokeStyle = "rgba(230,230,210,0.8)";
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(X + 180, Y + 20);
      x.lineTo(X + 230, Y + 40);
      x.lineTo(X + 250, Y + 150);
      x.lineTo(X + 225, Y + 290);
      x.lineTo(X + 190, Y + 300);
      x.lineTo(X + 160, Y + 170);
      x.closePath();
      x.stroke(); // Manhattan
      x.fillStyle = "rgba(220,60,40,0.45)";
      x.fillRect(X + 175, Y + 170, 60, 60);
      x.fillRect(X + 190, Y + 90, 50, 40);
      x.fillStyle = "rgba(230,230,210,0.9)";
      x.font = '16px "Comic Sans MS", cursive';
      x.textAlign = "left";
      x.fillText("CURFEW ZONES — 03/05/67", X + 280, Y + 40);
      x.fillText("RED = SHOOT ON SIGHT?", X + 280, Y + 70);
      x.fillText("(ASK LEGAL)", X + 300, Y + 94);
      x.fillText("PATROLMEN: 4,112", X + 280, Y + 140);
      x.fillText("OFFICERS: 212", X + 280, Y + 164);
      x.fillText("OFFICERS WHO SHOWED: 9", X + 280, Y + 188);
      x.fillText("DON'T PANIC", X + 300, Y + 260);
      K.stains(x, X, Y, W, H, 10, 1604, 0.3, [200, 200, 180]);
    });
  const portrait = () =>
    K.paint("pics", "pc_pd_commissioner", 192, 256, function (x, X, Y, W, H) {
      const g = x.createLinearGradient(0, Y, 0, Y + H);
      g.addColorStop(0, "#3a4a5a");
      g.addColorStop(1, "#1a2028");
      x.fillStyle = g;
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#22324a";
      x.beginPath();
      x.ellipse(X + W / 2, Y + H * 0.9, W * 0.42, H * 0.3, 0, PI, 0);
      x.fill();
      x.fillStyle = "#c8a860";
      x.fillRect(X + W / 2 - 3, Y + H * 0.66, 6, H * 0.3);
      for (let k = 0; k < 4; k++)
        x.fillRect(X + W * 0.3 + k * 6, Y + H * 0.7, 4, 4);
      x.fillStyle = "#d8b090";
      x.beginPath();
      x.ellipse(X + W / 2, Y + H * 0.42, W * 0.18, H * 0.16, 0, 0, 6.3);
      x.fill();
      x.fillStyle = "#22324a";
      x.fillRect(X + W * 0.3, Y + H * 0.22, W * 0.4, H * 0.1);
      x.fillRect(X + W * 0.25, Y + H * 0.3, W * 0.5, H * 0.03);
      x.fillStyle = "#c8a860";
      x.fillRect(X + W / 2 - 6, Y + H * 0.24, 12, 10);
      x.fillStyle = "#3a2a20";
      x.fillRect(X + W * 0.42, Y + H * 0.5, W * 0.16, 4);
      K.stains(x, X, Y, W, H, 8, 1605, 0.4, [60, 40, 20]);
    });

  // ------------------------------------------------------------------ helpers
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function sidePts(phi) {
    const a = phi - PI / 8,
      c = phi + PI / 8;
    return [
      [C.x + R * Math.cos(a), C.z + R * Math.sin(a)],
      [C.x + R * Math.cos(c), C.z + R * Math.sin(c)],
    ];
  }
  const tanYaw = (phi) => Math.atan2(-Math.cos(phi), -Math.sin(phi)); // three.js yaw whose local +x runs along the side tangent

