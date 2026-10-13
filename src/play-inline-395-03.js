// play-inline-395 03 — math
// Lines 353-687 of readable/play-inline-395.pretty.js (statement-aligned).
  K.bands = function (b, ax, az, bx, bz, nx, nz, ys, o) {
    o = o || {};
    const dep = o.depth || 0.08,
      h = o.h || 0.22,
      mat = o.mat || "limestone",
      t = o.tint || [0.9, 0.86, 0.76];
    for (const y of ys)
      b.beam(
        mat,
        ax + (nx * dep) / 2,
        y,
        az + (nz * dep) / 2,
        bx + (nx * dep) / 2,
        y,
        bz + (nz * dep) / 2,
        dep,
        h,
        { tint: t, grime: 0.35 },
      );
  };

  /**
   * Clock face cell. o: {lit (neon atlas, black bg → additive glow), hour, minute, roman (default true), ring colour, face colour, broken}
   */
  K.clockCell = function (key, o) {
    o = o || {};
    const lit = !!o.lit;
    return K.paint(
      lit ? "neon" : "art",
      "clock_" + key,
      256,
      256,
      function (x, X, Y, W, H) {
        const cx = X + W / 2,
          cy = Y + H / 2,
          R = W * 0.47;
        if (lit) {
          x.fillStyle = "#000";
          x.fillRect(X, Y, W, H);
        } else x.clearRect(X, Y, W, H);
        // dial
        const g = x.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
        if (lit) {
          g.addColorStop(0, o.glowIn || "#c8b070");
          g.addColorStop(1, o.glowOut || "#6a5020");
        } else {
          g.addColorStop(0, o.face || "#e8e0c8");
          g.addColorStop(1, "#b8ae94");
        }
        x.fillStyle = g;
        x.beginPath();
        x.arc(cx, cy, R, 0, PI * 2);
        x.fill();
        x.lineWidth = W * 0.035;
        x.strokeStyle = lit ? "#2a1c08" : o.ring || "#2a2620";
        x.beginPath();
        x.arc(cx, cy, R * 0.97, 0, PI * 2);
        x.stroke();
        x.lineWidth = W * 0.01;
        x.beginPath();
        x.arc(cx, cy, R * 0.72, 0, PI * 2);
        x.stroke();
        x.fillStyle = lit ? "#1a1204" : "#1e1a14";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.font = "bold " + Math.round(W * 0.085) + "px Georgia, serif";
        const ROM = [
          "XII",
          "I",
          "II",
          "III",
          "IIII",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
        ];
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * PI * 2 - PI / 2;
          if (o.roman !== false)
            x.fillText(
              ROM[i],
              cx + Math.cos(a) * R * 0.84,
              cy + Math.sin(a) * R * 0.84,
            );
          else {
            x.fillRect(
              cx + Math.cos(a) * R * 0.84 - 4,
              cy + Math.sin(a) * R * 0.84 - 10,
              8,
              20,
            );
          }
        }
        for (let i = 0; i < 60; i++) {
          const a = (i / 60) * PI * 2;
          x.fillRect(
            cx + Math.cos(a) * R * 0.93 - 1,
            cy + Math.sin(a) * R * 0.93 - 1,
            i % 5 ? 2 : 4,
            i % 5 ? 2 : 4,
          );
        }
        // hands (stopped at the moment the bombs fell unless told otherwise)
        const hr = o.hour !== undefined ? o.hour : 9,
          mn = o.minute !== undefined ? o.minute : 47;
        const ha = (((hr % 12) + mn / 60) / 12) * PI * 2 - PI / 2,
          ma = (mn / 60) * PI * 2 - PI / 2;
        x.strokeStyle = lit ? "#120c02" : "#14110c";
        x.lineCap = "round";
        x.lineWidth = W * 0.035;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(ha) * R * 0.45, cy + Math.sin(ha) * R * 0.45);
        x.stroke();
        x.lineWidth = W * 0.022;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(ma) * R * 0.66, cy + Math.sin(ma) * R * 0.66);
        x.stroke();
        x.fillStyle = lit ? "#120c02" : "#14110c";
        x.beginPath();
        x.arc(cx, cy, W * 0.03, 0, PI * 2);
        x.fill();
        if (o.broken) {
          // a shattered section of the glass dial
          const r = K.rng(key);
          x.fillStyle = lit ? "#000" : "rgba(0,0,0,0)";
          x.save();
          x.beginPath();
          x.moveTo(cx + R * 0.1, cy - R * 0.2);
          for (let k = 0; k < 7; k++) {
            const a = -0.3 + k * 0.28;
            x.lineTo(
              cx + Math.cos(a) * R * (0.6 + r() * 0.4),
              cy + Math.sin(a) * R * (0.6 + r() * 0.4),
            );
          }
          x.closePath();
          x.globalCompositeOperation = lit ? "source-over" : "destination-out";
          x.fill();
          x.restore();
        }
        if (!lit) {
          K.stains(x, X, Y, W, H, 8, 41, 0.35, [60, 45, 25]);
        }
      },
    );
  };

  // ------------------------------------------------------------------
  // Bedford's: framed book jackets of the regulars (fake, original titles & authors)
  // ------------------------------------------------------------------
  const BOOKS = [
    ["THE GREEN GLOW", "Harriet Vane-Smythe"],
    ["NIGHT COURT", "J. D. Pelham"],
    ["A DRINK ON BEDFORD", "Marcus Tolliver"],
    ["THE ATOMIC HEART", "Ruth Ainsley"],
    ["EIGHTY-SIX", "Frank Lowell"],
    ["MANHATTAN, UNDONE", "Celia March"],
    ["POEMS FOR A SHELTER", "O. P. Quade"],
    ["THE LAST STREETCAR", "Leo Brandeis"],
    ["BOWERY BLUES", "Dorothy Kaye"],
    ["SMOKE OVER THE HUDSON", "Wendell Price"],
    ["THE SPEAKEASY", "Ambrose Hallam"],
    ["CHROME & SORROW", "Iris Mandel"],
    ["CELLAR OF DREAMS", "Pauline Ashe"],
    ["A FIRE ESCAPE SUMMER", "Tom Carrow"],
    ["THE ROBOT WHO WEPT", "Gene Hollister"],
    ["NO SIGN ON THE DOOR", "L. S. Bedford"],
    ["GRANITE & GIN", "Walter Pickard"],
    ["THE BERLIN LETTERS", "Mae Donnelly"],
    ["ASHFALL SONNETS", "Bertrand Vail"],
    ["THE COURTHOUSE CLOCK", "Inez Ortega"],
    ["LIGHT ON 14th STREET", "Hugh Garrity"],
    ["BLACKOUT", "Sylvia Rourke"],
    ["GREENWICH RAIN", "Arthur Kell"],
    ["WHAT THE BARTENDER SAW", "Anon."],
  ];
  K.BOOKS = BOOKS;
  K.bookJacket = function (i) {
    const bk = BOOKS[i % BOOKS.length];
    return K.paint("pics", "v3_book_" + i, 96, 144, function (x, X, Y, W, H) {
      const r = K.rng("book" + i);
      const pal = [
        ["#7a2a1e", "#e8d8b0"],
        ["#1e3a5a", "#f0e0b8"],
        ["#2a4a2a", "#e8dcb0"],
        ["#d8c8a0", "#3a2014"],
        ["#1a1a1a", "#d8b050"],
        ["#6a4a8a", "#f0e8d0"],
        ["#b04a20", "#1a1410"],
        ["#e0d8c0", "#8a1a14"],
      ][(i * 5 + 3) % 8];
      x.fillStyle = pal[0];
      x.fillRect(X, Y, W, H);
      // graphic motif
      x.fillStyle = pal[1];
      x.globalAlpha = 0.35;
      const m = i % 4;
      if (m === 0) {
        x.beginPath();
        x.arc(X + W / 2, Y + H * 0.55, W * 0.28, 0, PI * 2);
        x.fill();
      } else if (m === 1) {
        for (let k = 0; k < 5; k++)
          x.fillRect(X, Y + H * (0.3 + k * 0.1), W, H * 0.04);
      } else if (m === 2) {
        x.beginPath();
        x.moveTo(X + W * 0.1, Y + H * 0.85);
        x.lineTo(X + W * 0.5, Y + H * 0.3);
        x.lineTo(X + W * 0.9, Y + H * 0.85);
        x.fill();
      } else {
        for (let k = 0; k < 7; k++) {
          x.fillRect(
            X + W * (0.1 + k * 0.12),
            Y + H * (0.45 + r() * 0.2),
            W * 0.08,
            H * 0.4,
          );
        }
      }
      x.globalAlpha = 1;
      x.fillStyle = pal[1];
      x.textAlign = "center";
      x.textBaseline = "middle";
      const words = bk[0].split(" ");
      let line = "",
        yy = Y + H * 0.14;
      const lines = [];
      for (const w of words) {
        if ((line + w).length > 10) {
          lines.push(line.trim());
          line = "";
        }
        line += w + " ";
      }
      lines.push(line.trim());
      x.font = "bold " + Math.round(W * 0.14) + "px Georgia, serif";
      for (const ln of lines) {
        x.fillText(ln, X + W / 2, yy, W * 0.9);
        yy += W * 0.16;
      }
      x.font = "italic " + Math.round(W * 0.1) + "px Georgia, serif";
      x.fillText(bk[1], X + W / 2, Y + H * 0.9, W * 0.9);
      K.stains(x, X, Y, W, H, 5, i + 11, 0.4, [60, 40, 20]);
      x.fillStyle = "rgba(150,110,50,0.15)";
      x.fillRect(X, Y, W, H);
    });
  };

  /** Wrought-iron spear fence from A to B at ground y. o: {h, step, col} */
  K.ironFence = function (b, ax, az, bx, bz, y, o) {
    o = o || {};
    const h = o.h || 1.6,
      step = o.step || 0.14,
      len = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.round(len / step));
    for (const yy of [y + 0.18, y + h - 0.2])
      b.beam("black_iron", ax, yy, az, bx, yy, bz, 0.04, 0.04, {
        tint: [0.18, 0.17, 0.16],
      });
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        px = ax + (bx - ax) * t,
        pz = az + (bz - az) * t;
      if (
        o.gapAt !== undefined &&
        Math.abs(t * len - o.gapAt) < (o.gapW || 1.2) / 2
      )
        continue;
      if (o.bent && (i * 7) % 11 === 0) {
        b.beam(
          "black_iron",
          px,
          y,
          pz,
          px + 0.15,
          y + h * 0.8,
          pz + 0.1,
          0.022,
          0.022,
          { tint: [0.18, 0.17, 0.16] },
        );
        continue;
      }
      b.beam("black_iron", px, y, pz, px, y + h, pz, 0.022, 0.022, {
        tint: [0.18, 0.17, 0.16],
      });
      b.cyl("black_iron", px, y + h, pz, 0.035, 0.0, 0.12, 4, {
        tint: [0.18, 0.17, 0.16],
      });
    }
    if (o.col !== false) {
      const minx = Math.min(ax, bx) - 0.06,
        maxx = Math.max(ax, bx) + 0.06,
        minz = Math.min(az, bz) - 0.06,
        maxz = Math.max(az, bz) + 0.06;
      if (o.gapAt === undefined)
        b.col(minx, y, minz, maxx, y + h, maxz, {
          tag: "fence",
          walkable: false,
          surface: "metal",
        });
      else {
        const ux = (bx - ax) / len,
          uz = (bz - az) / len,
          g0 = o.gapAt - (o.gapW || 1.2) / 2,
          g1 = o.gapAt + (o.gapW || 1.2) / 2;
        const seg = (t0, t1) => {
          const x0 = ax + ux * t0,
            z0 = az + uz * t0,
            x1 = ax + ux * t1,
            z1 = az + uz * t1;
          b.col(
            Math.min(x0, x1) - 0.06,
            y,
            Math.min(z0, z1) - 0.06,
            Math.max(x0, x1) + 0.06,
            y + h,
            Math.max(z0, z1) + 0.06,
            { tag: "fence", walkable: false, surface: "metal" },
          );
        };
        if (g0 > 0.05) seg(0, g0);
        if (g1 < len - 0.05) seg(g1, len);
      }
    }
  };

  /** Leafless tree. */
