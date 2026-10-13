// play-inline-385 07 — fillstyle
// Lines 1407-1753 of readable/play-inline-385.pretty.js (statement-aligned).
  K.eagleCell = function () {
    return K.paint("art", "ppn_eagle", 128, 128, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H / 2;
      x.fillStyle = "#e8e2d0";
      x.beginPath();
      x.arc(cx, cy, W * 0.46, 0, 6.3);
      x.fill();
      x.strokeStyle = "#1e2c4a";
      x.lineWidth = 5;
      x.beginPath();
      x.arc(cx, cy, W * 0.42, 0, 6.3);
      x.stroke();
      // eagle: body, spread wings, head
      x.fillStyle = "#1e2c4a";
      x.beginPath();
      x.moveTo(cx, cy - 8);
      for (let k = 0; k <= 6; k++) {
        const a = PI + (k * PI) / 6;
        x.lineTo(
          cx + Math.cos(a) * 40,
          cy + Math.sin(a) * 26 - 4 + (k % 2) * 7,
        );
      }
      x.closePath();
      x.fill();
      x.beginPath();
      x.ellipse(cx, cy + 6, 10, 20, 0, 0, 6.3);
      x.fill();
      x.beginPath();
      x.moveTo(cx - 10, cy + 22);
      x.lineTo(cx, cy + 38);
      x.lineTo(cx + 10, cy + 22);
      x.fill();
      x.fillStyle = "#e8e2d0";
      x.beginPath();
      x.arc(cx + 2, cy - 18, 7, 0, 6.3);
      x.fill();
      x.fillStyle = "#c8a040";
      x.beginPath();
      x.moveTo(cx + 7, cy - 19);
      x.lineTo(cx + 14, cy - 16);
      x.lineTo(cx + 7, cy - 15);
      x.fill();
      x.fillStyle = "#8e2a22";
      for (let k = 0; k < 4; k++) x.fillRect(cx - 7 + k * 4, cy + 2, 2, 12);
      K.grain(x, X, Y, W, H, 40, 91);
      K.stains(x, X, Y, W, H, 3, 92, 0.3);
    });
  };
  /** Pigeonhole grid with letters poking out (sorting case front). */
  K.pigeonCell = function (v) {
    return K.paint("art", "ppn_pigeon" + v, 256, 192, function (x, X, Y, W, H) {
      const r = K.rng("pig" + v);
      x.fillStyle = "#5a4630";
      x.fillRect(X, Y, W, H);
      const cols = 8,
        rows = 5,
        cw = W / cols,
        ch = H / rows;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const px = X + i * cw + 3,
            py = Y + j * ch + 3;
          x.fillStyle = "#1c150e";
          x.fillRect(px, py, cw - 6, ch - 6);
          const n = r() < 0.2 ? 0 : 1 + Math.floor(r() * 5);
          for (let k = 0; k < n; k++) {
            const lw = cw - 10 - r() * 6,
              lh = 4 + r() * 5,
              ly = py + ch - 8 - k * 5 - lh;
            x.fillStyle = r.pick([
              "#d8d2c0",
              "#c8bc9c",
              "#e2dccc",
              "#b8c0c8",
              "#d8c8a0",
            ]);
            x.fillRect(px + 2 + r() * 3, ly, lw, lh);
            if (r() < 0.3) {
              x.fillStyle = "#8e2a22";
              x.fillRect(px + 4, ly, lw * 0.3, 2);
            }
          }
          x.fillStyle = "#c8bc98";
          x.fillRect(px + cw * 0.3, py + ch - 6, cw * 0.35, 3); // brass label
        }
      K.grain(x, X, Y, W, H, 30, 300 + v);
      K.stains(x, X, Y, W, H, 5, 310 + v, 0.35);
    });
  };
  /** Wall of brass post office boxes (with a few opened, a few letters). */
  K.poBoxCell = function () {
    return K.paint("art", "ppn_poboxes", 512, 256, function (x, X, Y, W, H) {
      const r = K.rng("pob");
      x.fillStyle = "#3a2e1c";
      x.fillRect(X, Y, W, H);
      const cols = 16,
        rows = 8,
        cw = W / cols,
        ch = H / rows;
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const px = X + i * cw + 2,
            py = Y + j * ch + 2,
            open = r() < 0.12;
          if (open) {
            x.fillStyle = "#0e0a06";
            x.fillRect(px, py, cw - 4, ch - 4);
            if (r() < 0.5) {
              x.fillStyle = "#d0c8b0";
              x.fillRect(px + 3, py + ch - 12, cw - 12, 5);
            }
            continue;
          }
          const g = x.createLinearGradient(px, py, px + cw, py + ch);
          g.addColorStop(0, "#b8924a");
          g.addColorStop(1, "#6a5028");
          x.fillStyle = g;
          x.fillRect(px, py, cw - 4, ch - 4);
          x.fillStyle = "#2a2014";
          x.fillRect(px + 4, py + 5, cw - 12, (ch - 4) * 0.35); // glass window
          x.fillStyle = "rgba(200,190,160,0.25)";
          x.fillRect(px + 5, py + 6, 3, (ch - 4) * 0.3);
          x.fillStyle = "#e8dcb8";
          x.font = "bold 7px Arial";
          x.fillText(String(1000 + j * cols + i), px + 4, py + ch - 7);
          x.fillStyle = "#3a2a14";
          x.beginPath();
          x.arc(px + cw - 10, py + ch * 0.66, 3, 0, 6.3);
          x.fill();
        }
      K.grain(x, X, Y, W, H, 26, 331);
      K.stains(x, X, Y, W, H, 8, 332, 0.4, [30, 40, 25]);
    });
  };
  /** Postal / period posters. kind: 'rounds'|'anchorage'|'robot'|'xmas'|'wanted'|'zip' */
  K.posterCell = function (kind) {
    return K.paint(
      "art",
      "ppn_poster_" + kind,
      192,
      256,
      function (x, X, Y, W, H) {
        const r = K.rng(kind);
        const bg =
          {
            rounds: "#d8ccaa",
            anchorage: "#c8b890",
            robot: "#d8d0b8",
            xmas: "#c8d0b8",
            wanted: "#d8ccb0",
            zip: "#e0d4b4",
            band: "#1c1a2a",
            rooms: "#d8ccb0",
            rad: "#d8c890",
          }[kind] || "#d8ccaa";
        x.fillStyle = bg;
        x.fillRect(X, Y, W, H);
        x.textAlign = "center";
        x.textBaseline = "middle";
        const T = (t, y, s, c, f) => {
          x.fillStyle = c;
          x.font =
            "bold " + s + "px " + (f || "Impact, Arial Black, sans-serif");
          x.fillText(t, X + W / 2, Y + y, W * 0.9);
        };
        if (kind === "rounds") {
          x.fillStyle = "#24385e";
          x.fillRect(X, Y, W, 60);
          T("U.S. MAIL", 30, 30, "#e8dcb8");
          x.fillStyle = "#24385e";
          x.beginPath();
          x.arc(X + W / 2, Y + 125, 44, 0, 6.3);
          x.fill();
          x.fillStyle = "#e8dcb8";
          x.fillRect(X + W / 2 - 22, Y + 110, 44, 30);
          x.strokeStyle = "#24385e";
          x.lineWidth = 2;
          x.beginPath();
          x.moveTo(X + W / 2 - 22, Y + 110);
          x.lineTo(X + W / 2, Y + 128);
          x.lineTo(X + W / 2 + 22, Y + 110);
          x.stroke();
          T("THROUGH SNOW,", 190, 17, "#24385e");
          T("RAIN AND", 210, 17, "#24385e");
          T("ATOMIC FIRE", 232, 19, "#8e2a22");
        } else if (kind === "anchorage") {
          x.fillStyle = "#8e2a22";
          x.fillRect(X, Y, W, H * 0.18);
          T("WRITE TO", 22, 22, "#e8dcb8");
          x.fillStyle = "#3a4a3a";
          for (let k = 0; k < 5; k++) {
            x.beginPath();
            x.moveTo(X + 20 + k * 38, Y + 160);
            x.lineTo(X + 38 + k * 38, Y + 70 + r() * 20);
            x.lineTo(X + 56 + k * 38, Y + 160);
            x.fill();
          }
          x.fillStyle = "#f0f0f0";
          for (let k = 0; k < 5; k++) {
            x.beginPath();
            x.moveTo(X + 30 + k * 38, Y + 100);
            x.lineTo(X + 38 + k * 38, Y + 80);
            x.lineTo(X + 46 + k * 38, Y + 100);
            x.fill();
          }
          T("OUR BOYS IN", 186, 18, "#2a2a2a");
          T("ICELAND!", 212, 26, "#8e2a22");
          T("V-MAIL IS FREE", 240, 12, "#2a2a2a", "Courier New");
        } else if (kind === "robot") {
          T("NOW 100%", 26, 22, "#24385e");
          T("AUTOMATED!", 50, 26, "#8e2a22");
          x.fillStyle = "#6a7a8a";
          x.fillRect(X + 70, Y + 80, 52, 70);
          x.beginPath();
          x.arc(X + 96, Y + 78, 22, PI, 0);
          x.fill();
          x.fillStyle = "#f0c040";
          x.beginPath();
          x.arc(X + 88, Y + 72, 4, 0, 6.3);
          x.arc(X + 104, Y + 72, 4, 0, 6.3);
          x.fill();
          x.fillStyle = "#24385e";
          x.fillRect(X + 60, Y + 150, 20, 40);
          x.fillRect(X + 112, Y + 150, 20, 40);
          x.fillStyle = "#e8dcb8";
          x.fillRect(X + 124, Y + 96, 30, 20);
          x.strokeStyle = "#24385e";
          x.strokeRect(X + 124, Y + 96, 30, 20);
          T("AMERICAN AUTOMATON CO.", 204, 11, "#24385e", "Arial");
          T("POSTAL PATROLMEN", 219, 12, "#24385e", "Arial");
          T('"NEITHER RAIN NOR RIOT"', 237, 12, "#2a2a2a", "Georgia");
        } else if (kind === "xmas") {
          x.fillStyle = "#2a5a3a";
          x.fillRect(X, Y, W, 70);
          T("MAIL EARLY", 26, 26, "#e8dcb8");
          T("FOR CHRISTMAS 1967", 54, 14, "#e8c060", "Arial");
          x.fillStyle = "#8e2a22";
          for (let k = 0; k < 3; k++) {
            x.fillRect(X + 30 + k * 48, Y + 110 + (k % 2) * 20, 36, 36);
            x.fillStyle = k % 2 ? "#8e2a22" : "#2a5a3a";
          }
          x.fillStyle = "#e8c060";
          x.fillRect(X + 30, Y + 126, 132, 4);
          T("Every card a little", 208, 14, "#2a2a2a", "Georgia");
          T("piece of Normalcy!", 228, 14, "#2a2a2a", "Georgia");
        } else if (kind === "wanted") {
          T("FBI • WANTED", 24, 20, "#1a1a1a");
          x.fillStyle = "#8a8070";
          x.fillRect(X + 50, Y + 44, 92, 100);
          x.fillStyle = "#4a4238";
          x.beginPath();
          x.arc(X + 96, Y + 80, 22, 0, 6.3);
          x.fill();
          x.fillRect(X + 66, Y + 104, 60, 40);
          T("CHINESE AGENT", 164, 16, "#8e2a22");
          T('"THE TAILOR"', 186, 14, "#1a1a1a", "Georgia");
          x.fillStyle = "#2a2a2a";
          for (let k = 0; k < 4; k++)
            x.fillRect(X + 20, Y + 202 + k * 10, W - 40 - r() * 40, 3);
        } else if (kind === "zip") {
          T("USE ZONE", 30, 24, "#24385e");
          T("NUMBERS!", 58, 26, "#8e2a22");
          x.fillStyle = "#f0c040";
          x.beginPath();
          x.arc(X + 96, Y + 128, 40, 0, 6.3);
          x.fill();
          x.fillStyle = "#1a1a1a";
          x.beginPath();
          x.arc(X + 82, Y + 120, 5, 0, 6.3);
          x.arc(X + 110, Y + 120, 5, 0, 6.3);
          x.fill();
          x.strokeStyle = "#1a1a1a";
          x.lineWidth = 3;
          x.beginPath();
          x.arc(X + 96, Y + 132, 18, 0.2, PI - 0.2);
          x.stroke();
          T("It's the Patriotic", 196, 14, "#2a2a2a", "Georgia");
          T("Thing to Do!", 216, 14, "#2a2a2a", "Georgia");
        } else if (kind === "band") {
          x.fillStyle = "#8e2a22";
          x.fillRect(X + 8, Y + 8, W - 16, H - 16);
          x.fillStyle = "#1c1a2a";
          x.fillRect(X + 14, Y + 14, W - 28, H - 28);
          T("TONIGHT IN THE", 36, 14, "#e8c060", "Georgia");
          T("CAFÉ ROUGE", 66, 28, "#e04030", "Georgia");
          x.fillStyle = "#e8c060";
          for (let k = 0; k < 7; k++) {
            x.beginPath();
            x.moveTo(X + 96, Y + 150);
            x.lineTo(
              X + 96 + Math.cos(k * 0.9) * 60,
              Y + 150 - Math.abs(Math.sin(k * 0.9)) * 50,
            );
            x.lineTo(
              X + 96 + Math.cos(k * 0.9 + 0.12) * 60,
              Y + 150 - Math.abs(Math.sin(k * 0.9 + 0.12)) * 50,
            );
            x.fill();
          }
          T("JOHNNY STARR", 180, 20, "#f0e0c0");
          T("& HIS STARDUST ORCHESTRA", 204, 11, "#e8c060", "Arial");
          T("SUN. MAR 5 • 8 PM", 230, 13, "#f0e0c0", "Arial");
        } else if (kind === "rooms") {
          T("HOTEL", 30, 22, "#8e2a22", "Georgia");
          T("PENNSYLVANIA", 58, 22, "#1c1a2a", "Georgia");
          x.fillStyle = "#6a5a48";
          x.fillRect(X + 40, Y + 80, 112, 90);
          for (let j = 0; j < 6; j++)
            for (let i = 0; i < 5; i++) {
              x.fillStyle = r() < 0.4 ? "#e8c060" : "#2a2418";
              x.fillRect(X + 48 + i * 21, Y + 86 + j * 14, 12, 8);
            }
          T("2,200 ROOMS", 196, 18, "#1c1a2a");
          T("2,200 BATHS", 220, 18, "#8e2a22");
          T("Opposite Penna. Station", 244, 11, "#2a2a2a", "Georgia");
        } else if (kind === "rad") {
          x.fillStyle = "#e0b020";
          x.fillRect(X, Y, W, H);
          x.fillStyle = "#1a1a1a";
          const cx = X + W / 2,
            cy = Y + 100;
          x.beginPath();
          x.arc(cx, cy, 12, 0, 6.3);
          x.fill();
          for (let k = 0; k < 3; k++) {
            const a = -PI / 2 + (k * PI * 2) / 3;
            x.beginPath();
            x.moveTo(cx, cy);
            x.arc(cx, cy, 58, a - 0.52, a + 0.52);
            x.fill();
          }
          T("PUBLIC SHELTER", 196, 18, "#1a1a1a", "Arial Black");
          T("CAPACITY: 400", 226, 16, "#1a1a1a", "Arial");
        }
        K.grain(x, X, Y, W, H, 40, U32(kind));
        K.stains(x, X, Y, W, H, 7, U32(kind) + 1, 0.45, [80, 60, 30]);
        K.streaks(x, X, Y, W, H, 8, U32(kind) + 2, 0.25);
      },
    );
  };
  function U32(s) {
    return G.util.hashStr(s) % 997;
  }
  /** Hotel key/mail cubbies behind the front desk. */
