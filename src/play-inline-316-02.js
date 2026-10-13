// play-inline-316 02 — fillstyle
// Lines 32-289 of readable/play-inline-316.pretty.js (statement-aligned).
  const PH = G._ph;
  const K = PH.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const AX0 = -16,
    AX1 = 16,
    AZ0 = 8,
    AZ1 = 32.4; // building (front at AZ1, facing +z)
  const FH = 13.4; // façade height (to sign band top)
  const HALL_H = 8.4,
    MEZ = 4.2,
    BY = -4.2;
  const FOODS = [
    { id: "ph_am_pie", label: "PIES", price: 6, col: "#c8843a" },
    { id: "ph_am_sandwich", label: "SANDWICHES", price: 8, col: "#d8c088" },
    {
      id: "chocolate_zeppelin",
      label: "CHOCOLATE ZEPPELIN",
      price: 7,
      col: "#6a3a24",
    },
    { id: "ph_am_beans", label: "BAKED BEANS", price: 5, col: "#8a3a1e" },
    { id: "fizzo_cola", label: "FIZZO COLA", price: 12, col: "#c81e1e" },
    { id: "ph_am_mac", label: "MAC & CHEESE", price: 6, col: "#f0c040" },
    { id: "cinnamon_bun", label: "SWEET ROLLS", price: 5, col: "#e0b070" },
    { id: "golden_plain_jerky", label: "BEEF JERKY", price: 4, col: "#8a4a2a" },
  ];

  // ==================================================================
  // ART
  // ==================================================================
  function stainedCell(atlas) {
    // leaded stained glass: deco sunrise over a coffee cup, geometric borders
    return K.paint(
      atlas,
      "am_stained_" + atlas,
      768,
      384,
      function (x, X, Y, W, H) {
        const neon = atlas === "neon";
        x.fillStyle = neon ? "#000" : "#1a1410";
        x.fillRect(X, Y, W, H);
        const r = K.rng("stained");
        const pal = [
          "#d8a030",
          "#e8d8a0",
          "#3a7a5a",
          "#a02a20",
          "#2a4a8a",
          "#c86a2a",
          "#f0e8c0",
        ];
        // panes: a grid of lead cames with radiating sunrise
        const cx = X + W / 2,
          cy = Y + H * 0.92;
        for (let k = 0; k < 18; k++) {
          const a0 = PI + (k * PI) / 18,
            a1 = a0 + PI / 18;
          for (let ring = 0; ring < 4; ring++) {
            const r0 = H * (0.18 + ring * 0.2),
              r1 = r0 + H * 0.2;
            x.fillStyle =
              pal[(k + ring * 2) % 3 === 0 ? 0 : (k + ring) % 2 ? 1 : 5];
            if (r() < 0.07) x.fillStyle = neon ? "#000" : "#050404"; // broken pane
            x.beginPath();
            x.arc(cx, cy, r1, a0, a1);
            x.arc(cx, cy, r0, a1, a0, true);
            x.closePath();
            x.fill();
          }
        }
        x.fillStyle = "#f0c040";
        x.beginPath();
        x.arc(cx, cy, H * 0.18, PI, 0);
        x.fill();
        // side borders: stepped deco panes
        for (let j = 0; j < 8; j++)
          for (const sx of [X + 8, X + W - 72]) {
            x.fillStyle = pal[(j + (sx > cx ? 1 : 0)) % 2 ? 2 : 4];
            x.fillRect(sx, Y + 8 + (j * (H - 16)) / 8, 64, (H - 16) / 8 - 4);
          }
        // lead cames
        x.strokeStyle = neon ? "#000" : "#141010";
        x.lineWidth = 4;
        for (let k = 0; k <= 18; k++) {
          const a = PI + (k * PI) / 18;
          x.beginPath();
          x.moveTo(cx, cy);
          x.lineTo(cx + Math.cos(a) * H, cy + Math.sin(a) * H);
          x.stroke();
        }
        for (let ring = 0; ring <= 4; ring++) {
          x.beginPath();
          x.arc(cx, cy, H * (0.18 + ring * 0.2), PI, 0);
          x.stroke();
        }
        x.lineWidth = 6;
        x.strokeRect(X + 3, Y + 3, W - 6, H - 6);
        // "H&H" monogram
        x.fillStyle = neon ? "#402000" : "#2a1a0c";
        x.font = "bold 44px Georgia, serif";
        x.textAlign = "center";
        x.fillText("H & H", cx, cy - H * 0.05);
        if (!neon) {
          K.stains(x, X, Y, W, H, 16, 91, 0.45, [20, 15, 10]);
        } else {
          x.fillStyle = "rgba(0,0,0,0.35)";
          x.fillRect(X, Y, W, H);
        }
      },
    );
  }
  function bandCell() {
    return K.paint("art", "am_band", 1024, 96, function (x, X, Y, W, H) {
      x.fillStyle = "#121212";
      x.fillRect(X, Y, W, H);
      x.strokeStyle = "#b8903c";
      x.lineWidth = 4;
      x.strokeRect(X + 6, Y + 6, W - 12, H - 12);
      const g = x.createLinearGradient(0, Y + 20, 0, Y + H - 20);
      g.addColorStop(0, "#f0d890");
      g.addColorStop(0.5, "#b8903c");
      g.addColorStop(1, "#7a5a20");
      x.fillStyle = g;
      x.font = "bold 62px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("PENNY  &  PRICE", X + W / 2, Y + H / 2 + 3, W * 0.9);
      K.stains(x, X, Y, W, H, 10, 92, 0.35, [60, 60, 50]);
    });
  }
  function foodCell(i) {
    // what sits behind each little glass door
    return K.paint("art", "am_food_" + i, 96, 96, function (x, X, Y, W, H) {
      x.fillStyle = "#e8e4d8";
      x.fillRect(X, Y, W, H);
      const g = x.createLinearGradient(0, Y, 0, Y + H);
      g.addColorStop(0, "rgba(255,255,255,0.3)");
      g.addColorStop(1, "rgba(0,0,0,0.25)");
      x.fillStyle = g;
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#f4f2ea";
      x.beginPath();
      x.ellipse(X + W / 2, Y + H * 0.78, W * 0.4, H * 0.1, 0, 0, 6.3);
      x.fill(); // plate
      const cx = X + W / 2,
        cy = Y + H * 0.6;
      switch (i % 8) {
        case 0:
          x.fillStyle = "#c8843a";
          x.beginPath();
          x.moveTo(cx - 28, cy + 10);
          x.lineTo(cx + 28, cy + 10);
          x.lineTo(cx + 14, cy - 18);
          x.closePath();
          x.fill();
          x.fillStyle = "#e8b870";
          x.fillRect(cx - 28, cy + 4, 56, 7);
          break; // pie
        case 1:
          x.fillStyle = "#d8c088";
          x.fillRect(cx - 26, cy - 8, 52, 18);
          x.fillStyle = "#8a3a2a";
          x.fillRect(cx - 24, cy - 1, 48, 5);
          x.fillStyle = "#6a9a3a";
          x.fillRect(cx - 24, cy - 4, 48, 3);
          break; // sandwich
        case 2:
          x.fillStyle = "#f8d0e0";
          x.fillRect(cx - 22, cy - 16, 44, 30);
          x.fillStyle = "#c83a6a";
          x.font = "bold 11px Arial";
          x.textAlign = "center";
          x.fillText("FANCY", cx, cy - 4);
          x.fillText("LADS", cx, cy + 8);
          break;
        case 3:
          x.fillStyle = "#e8e0d0";
          x.beginPath();
          x.ellipse(cx, cy, 24, 12, 0, 0, 6.3);
          x.fill();
          x.fillStyle = "#8a3a1e";
          x.beginPath();
          x.ellipse(cx, cy - 2, 20, 8, 0, 0, 6.3);
          x.fill();
          break; // beans crock
        case 4:
          x.fillStyle = "#3a1810";
          x.fillRect(cx - 8, cy - 30, 16, 40);
          x.fillRect(cx - 4, cy - 40, 8, 12);
          x.fillStyle = "#c81e1e";
          x.fillRect(cx - 8, cy - 14, 16, 12);
          break; // Fizzo bottle
        case 5:
          x.fillStyle = "#f0c040";
          x.beginPath();
          x.ellipse(cx, cy, 24, 12, 0, 0, 6.3);
          x.fill();
          x.fillStyle = "#d89a20";
          for (let k = 0; k < 8; k++)
            x.fillRect(cx - 18 + k * 5, cy - 4 + (k % 2) * 3, 4, 3);
          break; // mac
        case 6:
          x.fillStyle = "#e0b070";
          x.beginPath();
          x.arc(cx, cy, 18, 0, 6.3);
          x.fill();
          x.strokeStyle = "#a0703a";
          x.lineWidth = 3;
          x.beginPath();
          x.arc(cx, cy, 10, 0, 5);
          x.stroke();
          break; // roll
        default:
          x.fillStyle = "#6a8aa0";
          x.fillRect(cx - 18, cy - 14, 36, 24);
          x.fillStyle = "#e8e0c0";
          x.font = "bold 12px Arial";
          x.textAlign = "center";
          x.fillText("RATION", cx, cy + 2);
      }
      K.stains(x, X, Y, W, H, 4, 100 + i, 0.4, [60, 50, 30]);
    });
  }
  function menuCell() {
    return K.paint("art", "am_menu", 512, 384, function (x, X, Y, W, H) {
      x.fillStyle = "#16140f";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#f0e0a0";
      x.font = "bold 30px Georgia, serif";
      x.textAlign = "center";
      x.fillText("HOT DISHES", X + W / 2, Y + 40);
      const items = [
        ["BAKED BEANS & FRANKS", "5c"],
        ["CHICKEN POT PIE", "10c"],
        ["MACARONI AU GRATIN", "6c"],
        ["CREAMED SPINACH", "4c"],
        ["SALISBURY STEAK", "12c"],
        ["RICE PUDDING", "3c"],
        ["CUP OF COFFEE", "5c"],
        ["BURROW RATS HASH (NEW!)", "4c"],
      ];
      x.font = "21px Arial, sans-serif";
      items.forEach(([n, p], i) => {
        x.textAlign = "left";
        x.fillStyle = i === 7 ? "#ffb070" : "#e8e4d8";
        x.fillText(n, X + 20, Y + 84 + i * 36);
        x.textAlign = "right";
        x.fillText(p, X + W - 20, Y + 84 + i * 36);
      });
      K.stains(x, X, Y, W, H, 8, 93, 0.35, [60, 50, 30]);
    });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
