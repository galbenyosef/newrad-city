// play-inline-349 02 — rad
// Lines 29-185 of readable/play-inline-349.pretty.js (statement-aligned).
  const PC = G._pc;
  const K = PC.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const NH = 14,
    VR = 19.5,
    LOFT = 5.5,
    SAN = 0.6,
    BY = -5;
  const CANDLE = [1, 0.62, 0.28],
    CRYPT = [0.55, 0.62, 0.7],
    RAD = [0.45, 1, 0.35];

  K.addCustom(
    "starvault",
    function (x, S, r) {
      // blue-painted vault with gilt stars
      x.fillStyle = "#243a5a";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 40; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 40 + r() * 100,
          g = x.createRadialGradient(px, py, 0, px, py, rad);
        g.addColorStop(0, "rgba(20,30,50,0.4)");
        g.addColorStop(1, "rgba(20,30,50,0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      x.fillStyle = "#d8b060";
      for (let j = 0; j < 6; j++)
        for (let i = 0; i < 6; i++) {
          const cx = ((i + (j % 2) * 0.5) * S) / 6 + S / 12,
            cy = (j * S) / 6 + S / 12;
          x.beginPath();
          for (let k = 0; k < 10; k++) {
            const a = -HP + (k * PI) / 5,
              rr = k % 2 ? 5 : 12;
            x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
          }
          x.closePath();
          x.fill();
        }
      // water damage: peeled plaster patches
      for (let i = 0; i < 10; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 20 + r() * 60,
          g = x.createRadialGradient(px, py, rad * 0.5, px, py, rad);
        g.addColorStop(0, "rgba(170,160,140,0.85)");
        g.addColorStop(1, "rgba(170,160,140,0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      K.streaks(x, 0, 0, S, S, 40, 2001, 0.35);
    },
    { tile: [4, 4], rough: 0.8 },
  );

  const plaque = (i) => {
    i = ((i % 8) + 8) % 8;
    return K.signCell(
      "pc_sp_plq" + i,
      [
        "KIERNAN\nREQUIESCANT IN PACE",
        "BYRNE · 1831",
        "DOLAN FAMILY\nMDCCCXLII",
        "O'CONNELL\nPRAY FOR US",
        "McGRATH · 1867",
        "DELANEY\nIN CHRISTO",
        "THE SEXTON'S VAULT",
        "FLANAGAN · 1849",
      ][i],
      256,
      128,
      { bg: "#d8d2c0", fg: "#3a342a", font: "Georgia, serif" },
    );
  };
  const reredosArt = () =>
    K.paint("art", "pc_sp_reredos", 512, 512, function (x, X, Y, W, H) {
      x.fillStyle = "#6a4a20";
      x.fillRect(X, Y, W, H);
      const g = x.createLinearGradient(X, Y, X + W, Y + H);
      g.addColorStop(0, "#d8b060");
      g.addColorStop(0.5, "#a07830");
      g.addColorStop(1, "#d8b060");
      for (let i = 0; i < 5; i++) {
        const px = X + 12 + (i * (W - 24)) / 5,
          pw = (W - 24) / 5 - 10,
          top = Y + (i === 2 ? 20 : 80);
        x.fillStyle = g;
        x.beginPath();
        x.moveTo(px, Y + H - 20);
        x.lineTo(px, top + 60);
        x.lineTo(px + pw / 2, top);
        x.lineTo(px + pw, top + 60);
        x.lineTo(px + pw, Y + H - 20);
        x.fill();
        x.fillStyle = "#2a2a4a";
        x.beginPath();
        x.moveTo(px + 10, Y + H - 40);
        x.lineTo(px + 10, top + 70);
        x.lineTo(px + pw / 2, top + 22);
        x.lineTo(px + pw - 10, top + 70);
        x.lineTo(px + pw - 10, Y + H - 40);
        x.fill();
        x.fillStyle = "#e8dcc0";
        x.beginPath();
        x.ellipse(px + pw / 2, Y + H * 0.62, pw * 0.18, H * 0.2, 0, 0, PI * 2);
        x.fill();
        x.beginPath();
        x.arc(px + pw / 2, Y + H * 0.38, pw * 0.1, 0, PI * 2);
        x.fill();
        x.strokeStyle = "#f0d080";
        x.lineWidth = 3;
        x.beginPath();
        x.arc(px + pw / 2, Y + H * 0.38, pw * 0.16, 0, PI * 2);
        x.stroke();
      }
      K.stains(x, X, Y, W, H, 14, 2002, 0.45, [30, 20, 10]);
    });

  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  /** Brick barrel vaults (continuous UVs via K.vault). */
  function vaultZ(b, x0, x1, y, z0, z1, h, tint) {
    K.vault(b, {
      axis: "z",
      from: z0,
      to: z1,
      c: (x0 + x1) / 2,
      r: (x1 - x0) / 2 - 0.1,
      y,
      h,
      mat: "crypt_brick",
      tint,
      seg: 8,
    });
  }
  function vaultX(b, z0, z1, y, x0, x1, h, tint) {
    K.vault(b, {
      axis: "x",
      from: x0,
      to: x1,
      c: (z0 + z1) / 2,
      r: (z1 - z0) / 2 - 0.1,
      y,
      h,
      mat: "crypt_brick",
      tint,
      seg: 8,
    });
  }
  function vaultPt(x0, x1, y, yA, t, s) {
    const q = K.ptArc(t);
    return [(x0 + x1) / 2 + s * q[0] * (x1 - x0), y + (yA - y) * q[1]];
  }

