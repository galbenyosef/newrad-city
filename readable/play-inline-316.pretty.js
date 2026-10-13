/* src/poi_herald/20_automat.js */
/* =====================================================================
 * NEW RAD CITY — poi_herald / 20_automat.js
 * PENNY & PRICE AUTOMAT (block x −30..30, z 2..33, front on 23rd St)
 * — friendly food stop / settlement.
 *
 * EXTERIOR: two-storey white-marble & bronze deco front with a huge
 *   leaded stained-glass window, "PENNY & PRICE" band, an AUTOMAT neon
 *   marquee and corner blade, fluted pilasters, a fan crest; "LESS WORK
 *   FOR MOTHER" ghost ad; a bombed-out lot to the west (wall fragment,
 *   burnt car) and the settlers' "Automat Garden" to the east (scrap
 *   fence, picnic tables, awning, string lights, cook-fire).
 * INTERIOR (cell automat, origin 8600,0,1200):
 *   HALL — the wall of little glass doors (8 food sections, 5×24
 *   compartments), change booth, dolphin-spout coffee bar, steam-table
 *   counter (Penny the robot cook), marble pedestal tables, mezzanine
 *   under the stained glass (Pembroke) → service door → KITCHEN behind
 *   the wall (compartment backs, ovens, kettles, urns, pie racks) →
 *   stairs down → BASEMENT COMMISSARY (the Master Carousel nickel pump,
 *   giant roach nest) → stairs back up into the hall (loop).
 * Quest "Nickel and Dime" (Penny): clear the commissary, restart the
 *   Master Carousel → the automat wall vends again (scrip per door).
 * NPCs: Penny (Valet cook, food merchant), Nickel Nell (change
 *   booth, general merchant), Archibald Pembroke (old ex-bellhop, gives
 *   "The Pigeon Man of Room 3327"), settlers, a door guard.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
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
  function exterior(ctx) {
    const b = K.builder({ name: "am_ext", grime: 0.55, seg: 4 });
    const r = K.rng("am_ext");
    const marble = [0.92, 0.9, 0.84],
      brick = [0.85, 0.78, 0.66];
    // body (brick sides & back, marble front)
    b.face("brick_tan", AX1, 0, AZ1, 0, 0, -1, 0, 1, 0, AZ1 - AZ0, FH, {
      tint: brick,
    }); // east
    b.face("brick_tan", AX0, 0, AZ0, 0, 0, 1, 0, 1, 0, AZ1 - AZ0, FH, {
      tint: brick,
    }); // west
    b.face("brick_tan", AX1, 0, AZ0, -1, 0, 0, 0, 1, 0, AX1 - AX0, FH, {
      tint: [0.75, 0.68, 0.58],
    }); // back
    b.face(
      "concrete_dark",
      AX0,
      FH,
      AZ1,
      1,
      0,
      0,
      0,
      0,
      -1,
      AX1 - AX0,
      AZ1 - AZ0,
      { uv: "top", tint: [0.5, 0.48, 0.45] },
    );
    b.col(AX0, 0, AZ0, AX1, FH, AZ1, { tag: "building" });
    // FRONT (z = AZ1): marble frame, pilasters, storefront, stained glass
    const F = AZ1;
    b.face("marble", AX0, 0, F, 1, 0, 0, 0, 1, 0, AX1 - AX0, FH, {
      tint: marble,
    });
    b.boxMM("granite", AX0 - 0.3, 0, F, AX1 + 0.3, 0.8, F + 0.3, {
      tint: [0.16, 0.15, 0.16],
    });
    // pilasters (fluted) + capitals
    for (const px of [-15, -12, 12, 15]) {
      b.boxMM("marble", px - 0.7, 0.8, F, px + 0.7, FH - 0.4, F + 0.45, {
        tint: [0.95, 0.93, 0.88],
      });
      for (let k = -2; k <= 2; k++)
        b.boxMM(
          "marble",
          px + k * 0.24 - 0.06,
          1.2,
          F + 0.45,
          px + k * 0.24 + 0.06,
          FH - 1.6,
          F + 0.5,
          { tint: [0.78, 0.76, 0.7] },
        );
      for (let k = 0; k < 3; k++)
        b.boxMM(
          "bronze",
          px - 0.8 - k * 0.1,
          FH - 1.5 + k * 0.3,
          F,
          px + 0.8 + k * 0.1,
          FH - 1.3 + k * 0.3,
          F + 0.55 + k * 0.08,
          { tint: [0.55, 0.42, 0.24] },
        );
    }
    // storefront (ground): display windows + recessed entrance + revolving door
    for (const [x0, x1] of [
      [-11, -3.2],
      [3.2, 11],
    ]) {
      b.boxMM("bronze", x0, 0.8, F + 0.02, x1, 1.1, F + 0.25, {
        tint: [0.5, 0.38, 0.2],
      });
      b.plate(
        "glass",
        (x0 + x1) / 2,
        2.8,
        F + 0.05,
        0,
        1,
        x1 - x0 - 0.2,
        3.3,
        null,
        { tint: [0.35, 0.4, 0.4] },
      );
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 3)
        b.boxMM("bronze", x - 0.07, 0.8, F + 0.02, x + 0.07, 4.6, F + 0.2, {
          tint: [0.5, 0.38, 0.2],
        });
      b.boxMM("bronze", x0, 4.45, F + 0.02, x1, 4.6, F + 0.22, {
        tint: [0.5, 0.38, 0.2],
      });
      // window display: stacked pies / cakes on tiers (seen through the glass)
      for (let k = 0; k < 4; k++) {
        const cx = x0 + 1 + (k * (x1 - x0 - 2)) / 3;
        b.cyl("chrome", cx, 1.1, F - 0.6, 0.35, 0.35, 0.03, 10);
        b.cyl("flat", cx, 1.14, F - 0.6, 0.28, 0.28, 0.08, 10, {
          tint: [0.75, 0.5, 0.25],
        });
      }
      if (x0 < 0) {
        b.plate(
          "decal",
          (x0 + x1) / 2 + 1.5,
          2.6,
          F + 0.07,
          0,
          1,
          1.6,
          1.4,
          K.decal("crack", 5),
        );
      } else
        for (let k = 0; k < 4; k++)
          b.beam(
            "wood_rotten",
            x0 + 0.2,
            1.4 + k * 0.8,
            F + 0.28,
            x1 - 0.2,
            1.6 + k * 0.75,
            F + 0.28,
            0.25,
            0.05,
            { tint: [0.6, 0.52, 0.42] },
          );
    }
    // entrance recess (x −3.2..3.2)
    b.boxMM("paint_black", -3.2, 0.8, F - 1.5, 3.2, 4.6, F - 1.45, {
      tint: [0.05, 0.05, 0.05],
    });
    b.boxMM("marble", -3.2, 0, F - 1.5, 3.2, 0.16, F, {
      tint: [0.8, 0.78, 0.72],
    });
    b.boxMM("marble", -3.3, 0.8, F - 1.5, -3.1, 4.6, F, { tint: marble });
    b.boxMM("marble", 3.1, 0.8, F - 1.5, 3.3, 4.6, F, { tint: marble });
    b.col(-3.3, 0, F - 1.5, -3.1, 4.6, F, {});
    b.col(3.1, 0, F - 1.5, 3.3, 4.6, F, {});
    // revolving door: glass drum, 4 bronze wings, canopy
    b.cyl("glass_clear", 0, 0.16, F - 1.1, 1.2, 1.2, 2.6, 16, {
      top: false,
      arc0: 0.3,
      arc: PI - 0.6,
      tint: [0.7, 0.8, 0.8],
    });
    b.cyl("glass_clear", 0, 0.16, F - 1.1, 1.2, 1.2, 2.6, 16, {
      top: false,
      arc0: PI + 0.3,
      arc: PI - 0.6,
      tint: [0.7, 0.8, 0.8],
    });
    b.cyl("bronze", 0, 2.76, F - 1.1, 1.3, 1.3, 0.35, 16, {
      tint: [0.5, 0.38, 0.2],
    });
    for (let k = 0; k < 4; k++) {
      const a = k * HP + 0.4;
      b.beam(
        "bronze",
        0,
        1.4,
        F - 1.1,
        Math.cos(a) * 1.15,
        1.4,
        F - 1.1 + Math.sin(a) * 1.15,
        0.05,
        2.4,
        { tint: [0.5, 0.38, 0.2] },
      );
    }
    b.pipe("bronze", 0, 0.16, F - 1.1, 0, 2.8, F - 1.1, 0.06, 6);
    b.plate(
      "art",
      0,
      4.05,
      F - 1.43,
      0,
      1,
      5.4,
      0.6,
      K.signCell("am_entry", "ENTRANCE · OPEN ALL NIGHT", 512, 64, {
        bg: "#121212",
        fg: "#e8d080",
        font: "Georgia, serif",
      }),
    );
    // AUTOMAT marquee canopy
    b.boxMM("bronze", -11.5, 4.7, F, 11.5, 5.5, F + 2.4, {
      tint: [0.35, 0.28, 0.18],
    });
    b.boxMM("paint_black", -11.4, 4.62, F + 0.1, 11.4, 4.7, F + 2.3, {
      tint: [0.08, 0.07, 0.06],
    });
    const am = K.neonCell("am_neon", "AUTOMAT", 768, 128, {
      color: "#ff3a28",
      font: "Georgia, serif",
      weight: "bold",
      broken: 1,
    });
    b.plate("lamp", 0, 5.1, F + 2.42, 0, 1, 22.8, 0.72, null, {
      tint: [0.12, 0.1, 0.08],
    });
    b.plate("neon", 0, 5.1, F + 2.44, 0, 1, 9.6, 0.72, am);
    for (const s of [-1, 1])
      b.plate(
        "neon",
        s * 11.52,
        5.1,
        F + 1.2,
        s,
        0,
        2.2,
        0.6,
        K.neonCell("am_neon_s", "FOOD 5¢", 256, 80, { color: "#ffe060" }),
      );
    b.glow(0, 5.1, F + 3.2, [1, 0.25, 0.15], 8);
    for (let x = -11.2; x <= 11.2; x += 0.8)
      b.glow(x, 4.58, F + 2.3, [1, 0.8, 0.5], r() < 0.3 ? 0.2 : 0.45);
    for (const s of [-1, 1])
      b.beam(
        "black_iron",
        s * 10.5,
        5.4,
        F + 2.3,
        s * 10.5,
        8.5,
        F + 0.1,
        0.07,
        0.07,
      );
    // the great stained-glass window (x −11..11, y 5.8..11.8)
    b.boxMM("bronze", -11.2, 5.7, F - 0.05, 11.2, 12.0, F + 0.12, {
      tint: [0.45, 0.34, 0.2],
    });
    b.plate("art", 0, 8.8, F + 0.14, 0, 1, 21.6, 5.9, stainedCell("art"), {
      tint: [0.95, 0.95, 0.95],
    });
    for (let x = -11; x <= 11.01; x += 22 / 6)
      b.boxMM("bronze", x - 0.09, 5.7, F + 0.12, x + 0.09, 12.0, F + 0.3, {
        tint: [0.5, 0.38, 0.2],
      });
    b.boxMM("bronze", -11.2, 8.7, F + 0.12, 11.2, 8.85, F + 0.3, {
      tint: [0.5, 0.38, 0.2],
    });
    b.glow(-4, 9, F + 0.6, [0.9, 0.6, 0.2], 3);
    b.glow(4, 9, F + 0.6, [0.9, 0.6, 0.2], 3); // warm light behind the glass (settlement lamps)
    // PENNY & PRICE band + parapet + fan crest
    b.boxMM("granite", AX0 - 0.2, 12.1, F, AX1 + 0.2, FH, F + 0.4, {
      tint: [0.1, 0.1, 0.1],
    });
    b.plate("art", 0, 12.75, F + 0.42, 0, 1, 22, 1.2, bandCell());
    b.boxMM("marble", AX0 - 0.3, FH, F - 0.3, AX1 + 0.3, FH + 1.2, F + 0.5, {
      tint: marble,
    });
    for (let k = 0; k < 4; k++)
      b.boxMM(
        "marble",
        -5 + k * 0.9,
        FH + 1.2 + k * 0.5,
        F - 0.2,
        5 - k * 0.9,
        FH + 1.7 + k * 0.5,
        F + 0.45,
        { tint: [0.95, 0.93, 0.88] },
      );
    b.plate(
      "art",
      0,
      FH + 2.1,
      F + 0.47,
      0,
      1,
      3.2,
      1.2,
      K.signCell("am_crest", "H & H", 256, 96, {
        bg: "#e8e2d2",
        fg: "#8a6a30",
        font: "Georgia, serif",
      }),
    );
    // corner blade sign (SE)
    {
      const bx = AX1 + 0.9,
        bz = F - 0.8;
      b.box("enamel_cream", bx, 5.8, bz, 1.5, 8.2, 0.4, {
        yaw: HP,
        tint: [0.9, 0.86, 0.75],
      });
      const vt = K.neonCell("am_vert", "AUTOMAT", 128, 768, {
        color: "#ff2a1a",
        vertical: true,
        font: "Georgia, serif",
      });
      b.plate("neon", bx, 9.9, bz - 0.21, 0, -1, 1.2, 7.6, vt);
      b.plate("neon", bx, 9.9, bz + 0.21, 0, 1, 1.2, 7.6, vt);
      b.glow(bx, 9.9, bz + 1, [1, 0.25, 0.15], 6);
      for (const y of [7, 13])
        b.beam("black_iron", bx, y, bz, AX1 - 0.02, y, bz, 0.08, 0.08);
    }
    // ghost ads on the side walls
    b.plate(
      "decal",
      AX1 + 0.03,
      9,
      20,
      1,
      0,
      18,
      5,
      K.signCell(
        "am_mother",
        "GOOD FOOD AT A FAIR PRICE\nPENNY & PRICE RETAIL SHOPS",
        1024,
        256,
        {
          bg: null,
          fg: "rgba(240,228,200,0.8)",
          font: "Georgia, serif",
          weather: true,
        },
      ),
    );
    b.plate(
      "decal",
      AX0 - 0.03,
      8,
      20,
      -1,
      0,
      16,
      4.5,
      K.signCell("am_nickel", "FRESH FOOD · A NICKEL · AUTOMATIC", 1024, 200, {
        bg: null,
        fg: "rgba(240,228,200,0.75)",
        font: '"Arial Black", sans-serif',
        weather: true,
      }),
    );
    b.plate(
      "decal",
      AX0 - 0.03,
      2,
      26,
      -1,
      0,
      3.2,
      1.2,
      K.tag("EATS INSIDE", "#40d060", 256, 96),
    );
    // back wall: loading door, pipes
    b.boxMM("metal_dark", -3, 0, AZ0 - 0.15, 3, 3.6, AZ0, {
      tint: [0.35, 0.33, 0.3],
    });
    b.pipe("rust", 12, 0, AZ0 - 0.2, 12, FH, AZ0 - 0.2, 0.12, 6);
    b.burn(-12, 13, AZ1, 6, 0.5);
    b.burn(AX0, 4, 14, 5, 0.6);

    // ---------- WEST LOT: bombed-out ruin ----------
    {
      const wx = -29.2;
      b.boxMM("brick_red", wx - 0.4, 0, 4, wx + 0.4, 9, 30, {
        tint: [0.75, 0.6, 0.52],
      });
      for (let z = 4; z < 30; z += 2) {
        const hh = 9 + Math.sin(z * 0.7) * 2 + r() * 2.5;
        b.boxMM("brick_red", wx - 0.4, 9, z, wx + 0.4, hh, z + 2, {
          tint: [0.72, 0.58, 0.5],
        });
      }
      b.col(wx - 0.4, 0, 4, wx + 0.4, 9, 30, {});
      for (let y = 2.8; y < 9; y += 3)
        for (let z = 7; z < 28; z += 4)
          K.window(b, wx + 0.4, y + 0.8, z, 1, 0, 1.2, 1.8, {
            state: r() < 0.4 ? "boarded" : "dark",
            surround: "brick_red",
            surroundTint: [0.6, 0.48, 0.4],
            lintel: 0.15,
          });
      // fire escape clinging on
      for (let y = 3; y < 9; y += 3) {
        b.boxMM("black_iron", wx + 0.4, y, 12, wx + 1.6, y + 0.06, 18, {
          tint: [0.25, 0.2, 0.18],
        });
        K.railing(b, wx + 1.6, 12, wx + 1.6, 18, y, {
          h: 0.9,
          mat: "black_iron",
          handMat: "black_iron",
          col: false,
        });
      }
      b.plate(
        "decal",
        wx + 0.42,
        6,
        22,
        1,
        0,
        8,
        2.6,
        K.signCell("am_ghost_w", "SCHRAFFT'S · CANDIES · SODA", 1024, 200, {
          bg: null,
          fg: "rgba(230,220,190,0.6)",
          font: "Georgia, serif",
          weather: true,
        }),
      );
      K.rubble(b, -24, 0, 12, 4.5, 2.4, { seed: 31 });
      K.rubble(b, -21, 0, 24, 3.6, 1.8, { seed: 32 });
      K.rubble(b, -26.5, 0, 28, 2.4, 1.2, { seed: 33 });
      for (let k = 0; k < 5; k++)
        b.beam(
          "rust",
          -27 + r() * 8,
          0.2,
          6 + r() * 22,
          -27 + r() * 8,
          1.5 + r() * 2,
          6 + r() * 22,
          0.25,
          0.35,
          { tint: [0.5, 0.36, 0.26] },
        );
      b.hplate("rubble", -23, 0.03, 17.5, 13, 27, 0, null, {
        tint: [0.6, 0.57, 0.52],
      });
    }
    // ---------- EAST LOT: the Automat Garden (settler yard) ----------
    {
      const ex0 = 17,
        ex1 = 29.5,
        ez0 = 3.5,
        ez1 = 32;
      b.hplate(
        "dirt",
        (ex0 + ex1) / 2,
        0.03,
        (ez0 + ez1) / 2,
        ex1 - ex0 + 1,
        ez1 - ez0,
        0,
        null,
        { tint: [0.6, 0.55, 0.45] },
      );
      // scrap fence along 6th Ave and 23rd St (gap at the gate)
      const fence = (ax, az, bx, bz) => {
        const len = Math.hypot(bx - ax, bz - az),
          n = Math.ceil(len / 1.3);
        for (let k = 0; k < n; k++) {
          const t0 = k / n,
            t1 = (k + 1) / n,
            h = 2.0 + r() * 0.6;
          const x0 = ax + (bx - ax) * t0,
            z0 = az + (bz - az) * t0,
            x1 = ax + (bx - ax) * t1,
            z1 = az + (bz - az) * t1;
          const mat =
            r() < 0.5 ? "corrugated" : r() < 0.5 ? "rust" : "wood_rotten";
          b.quadN(
            mat,
            [x0, 0, z0],
            [x1, 0, z1],
            [x1, h, z1],
            [x0, h, z0],
            [bz - az, 0, ax - bx].map((v) => v / len),
            { tint: [0.75 + r() * 0.2, 0.7, 0.62] },
          );
          b.quadN(
            mat,
            [x0, 0, z0],
            [x1, 0, z1],
            [x1, h, z1],
            [x0, h, z0],
            [az - bz, 0, bx - ax].map((v) => v / len),
            { tint: [0.6, 0.56, 0.5] },
          );
        }
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          b.pipe(
            "rust",
            ax + (bx - ax) * t,
            0,
            az + (bz - az) * t,
            ax + (bx - ax) * t,
            2.5,
            az + (bz - az) * t,
            0.05,
            5,
          );
        }
        b.col(
          Math.min(ax, bx) - 0.1,
          0,
          Math.min(az, bz) - 0.1,
          Math.max(ax, bx) + 0.1,
          2.4,
          Math.max(az, bz) + 0.1,
          { tag: "fence" },
        );
      };
      fence(ex1, ez0, ex1, ez1); // 6th Ave side
      fence(ex0 + 5, ez1, ex1, ez1); // 23rd St side (gate at x 17..22)
      fence(ex0, ez0, ex1, ez0); // 34th St side
      b.plate(
        "art",
        19.5,
        2.6,
        ez1 + 0.1,
        0,
        1,
        3.2,
        1.1,
        K.signCell(
          "am_garden",
          "AUTOMAT GARDEN\nSAFE ZONE · NO GUNS OUT",
          384,
          128,
          { bg: "#d8ccb0", fg: "#2a4a20", font: '"Arial Black", sans-serif' },
        ),
      );
      b.pipe("rust", 17.9, 0, ez1 + 0.05, 17.9, 3.3, ez1 + 0.05, 0.06, 5);
      b.pipe("rust", 21.1, 0, ez1 + 0.05, 21.1, 3.3, ez1 + 0.05, 0.06, 5);
      // patched canvas awning off the east wall
      b.quad(
        "fabric",
        [AX1 + 0.1, 4.2, 12],
        [AX1 + 0.1, 4.2, 28],
        [AX1 + 7, 3.0, 28],
        [AX1 + 7, 3.0, 12],
        { tint: [0.72, 0.6, 0.45] },
      );
      b.quad(
        "fabric",
        [AX1 + 7, 3.0, 12],
        [AX1 + 7, 3.0, 28],
        [AX1 + 0.1, 4.2, 28],
        [AX1 + 0.1, 4.2, 12],
        { tint: [0.55, 0.45, 0.35] },
      );
      for (const z of [12, 20, 28])
        b.pipe("rust", AX1 + 7, 0, z, AX1 + 7, 3.0, z, 0.05, 5);
      // picnic tables + benches
      for (const [tx, tz] of [
        [19.5, 15],
        [19.5, 22],
        [24.5, 18.5],
        [24.5, 25.5],
      ]) {
        b.boxMM("wood", tx - 1.2, 0.72, tz - 0.4, tx + 1.2, 0.78, tz + 0.4, {
          tint: [0.6, 0.48, 0.35],
        });
        for (const s of [-1, 1]) {
          b.boxMM(
            "wood",
            tx - 1.2,
            0.42,
            tz + s * 0.75 - 0.15,
            tx + 1.2,
            0.47,
            tz + s * 0.75 + 0.15,
            { tint: [0.55, 0.44, 0.32] },
          );
          b.beam(
            "wood",
            tx - 0.9,
            0,
            tz - s * 0.5,
            tx - 0.9,
            0.72,
            tz + s * 0.2,
            0.08,
            0.08,
          );
          b.beam(
            "wood",
            tx + 0.9,
            0,
            tz - s * 0.5,
            tx + 0.9,
            0.72,
            tz + s * 0.2,
            0.08,
            0.08,
          );
        }
        b.col(tx - 1.2, 0, tz - 0.9, tx + 1.2, 0.78, tz + 0.9, {
          tag: "furniture",
        });
        b.cyl("metal", tx + 0.3, 0.78, tz, 0.05, 0.05, 0.12, 6, {
          tint: [0.7, 0.3, 0.2],
        });
      }
      // string lights
      for (let k = 0; k < 3; k++) {
        const z = 14 + k * 6;
        for (let x = AX1 + 0.5; x < ex1 - 0.5; x += 0.9) {
          const sag = Math.sin(((x - AX1) / (ex1 - AX1)) * PI) * 0.5;
          b.glow(x, 4.4 - sag, z, [1, 0.8, 0.45], 0.35);
        }
        b.pipe("black_iron", AX1, 4.5, z, ex1, 4.5, z, 0.008, 3);
      }
      // garden beds (gnarlberry & spuds in tires)
      for (let k = 0; k < 5; k++) {
        const tx = 27.5,
          tz = 6 + k * 2.2;
        b.geo("rubber", new THREE.TorusGeometry(0.45, 0.16, 6, 12), {
          x: tx,
          y: 0.16,
          z: tz,
          rx: HP,
        });
        b.cyl("dirt", tx, 0.05, tz, 0.4, 0.4, 0.2, 10);
        for (let j = 0; j < 4; j++)
          b.beam(
            "flat",
            tx,
            0.25,
            tz,
            tx + (r() - 0.5) * 0.6,
            0.7 + r() * 0.4,
            tz + (r() - 0.5) * 0.6,
            0.06,
            0.02,
            { tint: [0.35, 0.5, 0.2] },
          );
      }
      K.anchor(ctx, "garden", 22, 0, 20, false);
      K.anchor(ctx, "guard_gate", 19.5, 0, 33.2, false);
    }
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_automat_ext";
    K.anchor(ctx, "door", 0, 0, AZ1 + 1.2, false);
    K.loot(ctx, "barrel", 22.5, 0, 9, 0, {
      world: true,
      burning: true,
      container: false,
    });
    K.loot(ctx, "fizzo_machine", 17.6, 0, 30.6, -HP, {
      world: true,
      loot: "fizzo_machine",
    });
    K.loot(ctx, "crate", 28.4, 0, 30.4, 0.3, {
      world: true,
      kind: "fizzo",
      loot: "crate",
    });
    K.loot(ctx, "car", -22, 0, 6.5, 1.3, {
      world: true,
      kind: "coupe",
      burnt: true,
      wreck: true,
    });
    K.loot(ctx, "dumpster", 8, 0, AZ0 - 1.4, 0, {
      world: true,
      loot: "dumpster",
    });
    K.skel(ctx, -19, 0, 18, 2.1, "lying", { world: true });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "am_int",
      off: O,
      lit: true,
      amb: [0.11, 0.1, 0.09],
      floors: [0, BY, MEZ],
      grime: 0.4,
    });
    const r = K.rng("am_int");
    const HB = [-14.1, -0.3, -22.1, 14.1, HALL_H + 0.2, 0.1];
    const cream = [0.9, 0.86, 0.76];
    // ---------------- HALL ----------------
    K.gap(ctx, -13, -22, 1.2, 0, 2.4); // hall → kitchen (service door)
    K.room(b, ctx, {
      x0: -14,
      z0: -22,
      x1: 14,
      z1: 0,
      y: 0,
      h: HALL_H,
      floor: "hextile",
      fc: [0.86, 0.84, 0.8],
      wall: "plaster",
      wc: cream,
      wain: "marble",
      wainC: [0.85, 0.82, 0.76],
      wainH: 1.4,
      ceil: "tin",
      cc: [0.78, 0.72, 0.58],
      noFloor: true,
      cornice: true,
      corniceMat: "plaster",
      trimMat: "bronze",
    });
    // floor with the SE stair hole (x 11.2..13.8, z −6.5..−1)
    const fl = (x0, z0, x1, z1) => {
      b.face("hextile", x0, 0, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.86, 0.84, 0.8],
      });
      b.col(x0, -0.3, z0, x1, 0, z1, { tag: "floor" });
    };
    fl(-14, -22, 11.2, 0);
    fl(11.2, -22, 14, -6.5);
    fl(11.2, -1, 14, 0);
    fl(13.8, -6.5, 14, -1);
    K.railing(b, 11.2, -6.5, 11.2, -1, 0, {
      h: 1.0,
      mat: "bronze",
      handMat: "brass",
    });
    K.railing(b, 11.2, -1, 13.8, -1, 0, {
      h: 1.0,
      mat: "bronze",
      handMat: "brass",
    });
    b.plate(
      "art",
      12.5,
      2.2,
      -0.12,
      0,
      -1,
      1.8,
      0.35,
      K.signCell("am_down", "COMMISSARY ↓ STAFF", 384, 64, {
        bg: "#121212",
        fg: "#e8d080",
      }),
    );
    // entrance: revolving drum from inside + exit
    b.cyl("glass_clear", 0, 0, -0.9, 1.2, 1.2, 2.6, 16, {
      top: false,
      arc0: 0.3,
      arc: PI - 0.6,
      tint: [0.7, 0.8, 0.8],
    });
    b.cyl("bronze", 0, 2.6, -0.9, 1.3, 1.3, 0.3, 16, {
      tint: [0.5, 0.38, 0.2],
    });
    b.plate("lamp", 0, 1.3, -0.1, 0, -1, 2.2, 2.4, null, {
      tint: [0.4, 0.42, 0.36],
    });
    b.light(0, 1.6, -1.5, [0.6, 0.64, 0.5], 0.5, 5, { box: HB });
    // ---- the AUTOMAT WALL (north, z = −22) ----
    const WZ = -21.9,
      NCOL = 24,
      NROW = 5,
      CX0 = -12,
      CW = 1.0,
      RY0 = 0.95,
      RH = 0.5;
    b.boxMM("marble", -12.3, 0, WZ, 12.3, RY0, WZ + 0.35, {
      tint: [0.35, 0.3, 0.28],
    }); // dado
    b.boxMM(
      "chrome",
      -12.3,
      RY0 + NROW * RH,
      WZ,
      12.3,
      RY0 + NROW * RH + 0.35,
      WZ + 0.3,
      { tint: [0.8, 0.82, 0.84] },
    );
    b.col(-12.3, 0, WZ - 0.1, 12.3, RY0 + NROW * RH + 0.35, WZ + 0.35, {
      tag: "wall",
    });
    for (let i = 0; i <= NCOL; i++)
      b.boxMM(
        "chrome",
        CX0 + i * CW - 0.03,
        RY0,
        WZ,
        CX0 + i * CW + 0.03,
        RY0 + NROW * RH,
        WZ + 0.22,
        { tint: [0.82, 0.84, 0.86] },
      );
    for (let j = 0; j <= NROW; j++)
      b.boxMM(
        "chrome",
        CX0,
        RY0 + j * RH - 0.03,
        WZ,
        CX0 + NCOL * CW,
        RY0 + j * RH + 0.03,
        WZ + 0.22,
        { tint: [0.82, 0.84, 0.86] },
      );
    for (let i = 0; i < NCOL; i++)
      for (let j = 0; j < NROW; j++) {
        const sec = Math.floor(i / 3),
          x = CX0 + i * CW + CW / 2,
          y = RY0 + j * RH + RH / 2;
        const empty = r() < 0.35,
          open = r() < 0.12;
        // back of the compartment (food or empty) + glass door
        if (empty)
          b.plate(
            "paint_black",
            x,
            y - 0.02,
            WZ + 0.02,
            0,
            1,
            CW - 0.12,
            RH - 0.12,
            null,
            { tint: [0.1, 0.09, 0.08] },
          );
        else
          b.plate(
            "art",
            x,
            y - 0.02,
            WZ + 0.02,
            0,
            1,
            CW - 0.12,
            RH - 0.12,
            foodCell(sec),
            { tint: [0.9, 0.9, 0.88] },
          );
        if (open) {
          b.quad(
            "glass",
            [x - 0.44, y - 0.2, WZ + 0.22],
            [x - 0.44, y - 0.2, WZ + 0.72],
            [x - 0.44, y + 0.2, WZ + 0.72],
            [x - 0.44, y + 0.2, WZ + 0.22],
            { tint: [0.6, 0.66, 0.68] },
          );
        } else if (r() < 0.1)
          b.plate(
            "decal",
            x,
            y,
            WZ + 0.2,
            0,
            1,
            CW - 0.12,
            RH - 0.12,
            K.decal("crack", (i + j) % 6),
          );
        else
          b.plate(
            "glass_clear",
            x,
            y,
            WZ + 0.21,
            0,
            1,
            CW - 0.12,
            RH - 0.12,
            null,
            { tint: [0.75, 0.82, 0.82] },
          );
        b.cyl("chrome", x + 0.38, y - 0.02, WZ + 0.22, 0.03, 0.03, 0.06, 6); // knob (vertical stub)
        b.box("brass", x - 0.3, y + 0.16, WZ + 0.22, 0.12, 0.08, 0.03, {
          tint: [0.7, 0.55, 0.3],
        }); // coin slot plate
      }
    // section labels + the big sign above the wall
    for (let s = 0; s < 8; s++) {
      const fd = FOODS[s],
        x = CX0 + s * 3 + 1.5;
      b.light(x, 2.2, WZ + 0.5, [1, 0.92, 0.72], 0.45, 2.6, { box: HB }); // the little bulbs behind each section
      b.plate(
        "art",
        x,
        RY0 + NROW * RH + 0.18,
        WZ + 0.31,
        0,
        1,
        2.8,
        0.28,
        K.signCell("am_lab_" + s, fd.label + " · " + fd.price + "¢", 384, 40, {
          bg: "#121212",
          fg: "#e8d080",
          font: "Georgia, serif",
          weather: false,
        }),
      );
    }
    b.plate(
      "art",
      0,
      RY0 + NROW * RH + 1.3,
      WZ + 0.05,
      0,
      1,
      16,
      1.0,
      bandCell(),
    );
    b.plate(
      "neon",
      0,
      RY0 + NROW * RH + 2.5,
      WZ + 0.06,
      0,
      1,
      7,
      0.9,
      K.neonCell("am_neon_in", "AUTOMAT", 768, 128, {
        color: "#ff3a28",
        font: "Georgia, serif",
      }),
    );
    b.glow(0, RY0 + NROW * RH + 2.5, WZ + 0.8, [1, 0.3, 0.2], 5);
    b.light(0, 4.5, -19, [1, 0.45, 0.35], 0.8, 9, { box: HB });
    b.light(-6, 2.2, -19.5, [1, 0.9, 0.7], 0.6, 6, { box: HB });
    b.light(6, 2.2, -19.5, [1, 0.9, 0.7], 0.6, 6, { box: HB });
    // service door (west end of the wall)
    b.boxMM("stainless", -13.6, 0, WZ + 0.02, -12.4, 2.4, WZ + 0.06, {
      tint: [0.7, 0.72, 0.74],
    });
    b.plate(
      "art",
      -13,
      2.65,
      WZ + 0.1,
      0,
      1,
      1.2,
      0.25,
      K.signCell("am_staff", "KITCHEN · STAFF", 256, 48, {
        bg: "#121212",
        fg: "#e8d080",
      }),
    );
    // ---- change booth (centre) ----
    {
      const bx = 0,
        bz = -9;
      b.cyl("marble", bx, 0, bz, 1.6, 1.6, 1.15, 20, {
        tint: [0.4, 0.34, 0.3],
      });
      b.cyl("bronze", bx, 1.15, bz, 1.66, 1.66, 0.06, 20, {
        tint: [0.6, 0.45, 0.25],
      });
      b.cyl("glass_clear", bx, 1.21, bz, 1.55, 1.55, 1.1, 20, {
        top: false,
        tint: [0.7, 0.8, 0.8],
      });
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * PI * 2;
        b.pipe(
          "bronze",
          bx + Math.cos(a) * 1.56,
          1.21,
          bz + Math.sin(a) * 1.56,
          bx + Math.cos(a) * 1.56,
          2.31,
          bz + Math.sin(a) * 1.56,
          0.02,
          4,
        );
      }
      b.cyl("bronze", bx, 2.31, bz, 1.8, 1.2, 0.5, 20, {
        tint: [0.5, 0.38, 0.2],
      });
      b.plate(
        "art",
        bx,
        2.56,
        bz + 1.52,
        0,
        1,
        1.6,
        0.3,
        K.signCell("am_change", "CHANGE", 256, 48, {
          bg: "#121212",
          fg: "#e8d080",
          font: "Georgia, serif",
        }),
      );
      b.plate(
        "art",
        bx,
        2.56,
        bz - 1.52,
        0,
        -1,
        1.6,
        0.3,
        K.signCell("am_change", "CHANGE", 256, 48, {
          bg: "#121212",
          fg: "#e8d080",
          font: "Georgia, serif",
        }),
      );
      b.cyl("marble", bx, 1.15, bz + 1.5, 0.35, 0.35, 0.04, 10, {
        tint: [0.9, 0.88, 0.8],
      }); // the famous worn marble dish
      b.col(bx - 1.6, 0, bz - 1.6, bx + 1.6, 2.8, bz + 1.6, {});
      b.light(bx, 2.1, bz, [1, 0.85, 0.6], 0.7, 4, { box: HB });
      K.anchor(ctx, "nell", bx, 0, bz + 2.1);
    }
    // ---- coffee bar with the dolphin spouts (west wall, north of the stair) ----
    b.boxMM("marble", -14, 0, -21.4, -12.9, 1.05, -17, {
      tint: [0.4, 0.34, 0.3],
    });
    b.boxMM("marble", -14, 1.05, -21.5, -12.8, 1.12, -16.9, {
      tint: [0.9, 0.88, 0.82],
    });
    b.col(-14, 0, -21.5, -12.8, 1.12, -16.9, { tag: "counter" });
    b.boxMM("marble", -14, 1.12, -21.4, -13.8, 3.2, -17, {
      tint: [0.85, 0.82, 0.76],
    });
    for (let k = 0; k < 3; k++) {
      const z = -20.6 + k * 1.4;
      b.geo("brass", K.sphereGeo(), {
        x: -13.6,
        y: 2.0,
        z,
        sx: 0.16,
        sy: 0.12,
        sz: 0.12,
        tint: [0.8, 0.62, 0.32],
      }); // dolphin head
      b.pipe("brass", -13.6, 1.95, z, -13.25, 1.72, z, 0.035, 6, {
        tint: [0.8, 0.62, 0.32],
      }); // snout spout
      b.geo("brass", K.sphereGeo(), {
        x: -13.72,
        y: 2.12,
        z,
        sx: 0.06,
        sy: 0.14,
        sz: 0.04,
        tint: [0.8, 0.62, 0.32],
      }); // fin
      b.cyl("brass", -13.6, 2.2, z, 0.05, 0.02, 0.15, 6);
      b.cyl("ceramic", -13.2, 1.12, z, 0.05, 0.04, 0.09, 8);
    }
    b.plate(
      "art",
      -13.78,
      2.8,
      -19.2,
      1,
      0,
      2.6,
      0.4,
      K.signCell("am_coffee", "COFFEE · 5¢ · FRESH EVERY 20 MINUTES", 512, 64, {
        bg: "#121212",
        fg: "#e8d080",
      }),
    );
    b.light(-12.6, 2.4, -19.2, [1, 0.8, 0.5], 0.7, 4, { box: HB });
    for (let k = 0; k < 4; k++)
      b.cyl("ceramic", -13.3, 1.12 + k * 0.08, -17.4, 0.06, 0.05, 0.08, 8, {
        tint: [0.95, 0.94, 0.9],
      });
    // ---- steam-table counter (east wall) with Penny behind ----
    b.boxMM("stainless", 10.6, 0, -19.5, 11.6, 0.95, -8, {
      tint: [0.8, 0.82, 0.84],
    });
    b.boxMM("steel", 10.5, 0.95, -19.6, 11.7, 1.02, -7.9, {
      tint: [0.7, 0.72, 0.74],
    });
    b.col(10.5, 0, -19.6, 11.7, 1.02, -7.9, { tag: "counter" });
    for (let z = -18.5; z < -8.5; z += 1.3) {
      b.boxMM("steel", 10.7, 1.02, z - 0.5, 11.5, 1.12, z + 0.5, {
        tint: [0.55, 0.57, 0.6],
      });
      b.cyl("flat", 11.1, 1.06, z, 0.3, 0.3, 0.07, 10, {
        tint: r.pick([
          [0.6, 0.35, 0.2],
          [0.8, 0.7, 0.3],
          [0.4, 0.5, 0.3],
          [0.7, 0.6, 0.5],
        ]),
      });
      b.glow(11.1, 1.3, z, [0.4, 0.38, 0.35], 0.8);
    }
    b.quad(
      "glass_clear",
      [10.55, 1.02, -19.5],
      [10.55, 1.02, -8],
      [10.75, 1.6, -8],
      [10.75, 1.6, -19.5],
      { tint: [0.7, 0.75, 0.75] },
    );
    b.plate("art", 13.86, 3.2, -13.8, -1, 0, 4.2, 3.1, menuCell());
    K.shelf(b, 13.7, 0, -18.5, -HP, 2.6, {
      mat: "stainless",
      items: ["jar", "can", "box"],
      seed: 211,
      h: 1.8,
    });
    b.light(12.6, 3.0, -13.5, [1, 0.85, 0.6], 0.8, 6, { box: HB });
    K.anchor(ctx, "penny", 12.8, 0, -13.5);
    // ---- tables: marble tops on pedestals, bentwood chairs ----
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 5; col++) {
        const tx = -9 + col * 4.2,
          tz = -18.5 + row * 4;
        if (Math.abs(tx) < 2.5 && tz > -12.5) continue; // clear of the booth
        K.roundTable(b, tx, 0, tz, 0.55, {
          mat: "marble",
          tint: [0.9, 0.88, 0.84],
        });
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * PI * 2 + r() * 0.5;
          const fallen = r() < 0.12;
          K.chair(
            b,
            tx + Math.cos(a) * 0.95,
            0,
            tz + Math.sin(a) * 0.95,
            HP - a,
            { mat: "wood_dark", fallen },
          );
        }
        if (r() < 0.6) {
          b.cyl("ceramic", tx + 0.15, 0.76, tz, 0.12, 0.1, 0.02, 10);
          b.cyl("ceramic", tx - 0.2, 0.76, tz + 0.1, 0.05, 0.04, 0.09, 8);
        }
      }
    // mezzanine along the south wall (y 4.2, z −5..0) with stair up the west wall
    b.boxMM("marble", -14, MEZ - 0.3, -5, 14, MEZ, 0, {
      tint: [0.8, 0.76, 0.7],
      faces: "nsewtb",
    });
    b.col(-14, MEZ - 0.3, -5, 14, MEZ, 0, { tag: "floor" });
    K.railing(b, -12.3, -5, 14, -5, MEZ, {
      h: 1.0,
      mat: "bronze",
      handMat: "brass",
    });
    K.stairs(b, -14, -16.2, -12.4, -5, 0, MEZ, "+z", {
      mat: "marble",
      tint: [0.8, 0.76, 0.7],
      rail: "l",
      railMat: "bronze",
      handMat: "brass",
      solid: false,
      thick: 0.3,
    });
    for (const x of [-10.5, -5.5, 5.5, 9.5]) {
      b.boxMM("marble", x - 0.25, 0, -5.2, x + 0.25, MEZ - 0.3, -4.7, {
        tint: [0.85, 0.82, 0.76],
      });
      b.col(x - 0.25, 0, -5.2, x + 0.25, MEZ - 0.3, -4.7, {});
    }
    for (const tx of [-8, -3, 4, 9]) {
      K.roundTable(b, tx, MEZ, -2.4, 0.5, {
        mat: "marble",
        tint: [0.9, 0.88, 0.84],
      });
      K.chair(b, tx, MEZ, -1.5, 0, { mat: "wood_dark" });
      K.chair(b, tx, MEZ, -3.3, PI, { mat: "wood_dark" });
    }
    K.anchor(ctx, "pembroke", -8, MEZ, -1.5);
    K.anchor(ctx, "mezzanine", 0, MEZ, -2.5);
    // stained glass from inside (additive over black): above the mezzanine
    b.plate("paint_black", 0, MEZ + 2.2, -0.14, 0, -1, 21.6, 3.6, null, {
      tint: [0.02, 0.02, 0.02],
    });
    b.plate(
      "neon",
      0,
      MEZ + 2.2,
      -0.15,
      0,
      -1,
      21.5,
      3.55,
      stainedCell("neon"),
      { tint: [0.9, 0.85, 0.75] },
    );
    for (let x = -10; x <= 10.1; x += 5) {
      b.light(x, MEZ + 2.2, -1.2, [1, 0.7, 0.35], 0.8, 7, { box: HB });
    }
    // lights: deco globe pendants + wall sconces
    for (let x = -9; x <= 9; x += 6)
      for (const z of [-17, -11])
        K.lamp(
          b,
          x,
          5.6,
          z,
          "globe",
          [1, 0.86, 0.62],
          x === 3 && z === -11 ? 0 : 0.8,
          8,
          {
            ceil: HALL_H,
            size: 0.28,
            dead: x === 3 && z === -11,
            lightOpts: { box: HB },
          },
        );
    // wear & tear, settlers' touches
    K.litter(b, -13, -21, 10, -1, 0, 20, 5);
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -12 + r() * 22,
        0.012 + k * 0.0005,
        -20 + r() * 18,
        1 + r(),
        1 + r(),
        r() * 6,
        K.decal(k % 3 ? "grime" : "puddle", k + 60),
      );
    b.plate(
      "art",
      -13.86,
      5.5,
      -11,
      1,
      0,
      3.6,
      1.0,
      K.signCell(
        "am_rules",
        "HOUSE RULES: NO GUNS OUT · NO FIGHTING\nPAY THE ROBOT · BUS YOUR TABLE",
        512,
        140,
        { bg: "#d8ccb0", fg: "#2a2a20", font: "Arial, sans-serif" },
      ),
    );
    K.loot(ctx, "fizzo_machine", 13.2, 0, -3.2, HP, { loot: "fizzo_machine" });

    // ---------------- KITCHEN (x −14..14, z −34..−22) ----------------
    const KB = [-14.1, -0.3, -34.1, 14.1, 4.4, -21.9];
    K.room(b, ctx, {
      x0: -14,
      z0: -34,
      x1: 14,
      z1: -22,
      y: 0,
      h: 4.2,
      floor: "checker",
      fc: [0.66, 0.64, 0.6],
      wall: "subway_tile",
      wc: [0.86, 0.86, 0.8],
      ceil: "plaster",
      cc: [0.55, 0.54, 0.5],
      noFloor: true,
      trim: false,
    });
    const kf = (x0, z0, x1, z1) => {
      b.face("checker", x0, 0, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.66, 0.64, 0.6],
      });
      b.col(x0, -0.3, z0, x1, 0, z1, { tag: "floor" });
    };
    kf(-14, -34, 11.2, -22);
    kf(11.2, -26, 14, -22);
    kf(13.8, -34, 14, -26);
    K.railing(b, 11.2, -26, 11.2, -33.8, 0, {
      h: 1.0,
      mat: "steel",
      handMat: "steel",
    });
    // backs of the compartments (open boxes with trays) right behind the wall
    b.boxMM("steel", -12.3, 0, -22.7, 12.3, 0.9, -22.1, {
      tint: [0.55, 0.57, 0.6],
    });
    for (let i = 0; i < NCOL; i++)
      for (let j = 0; j < NROW; j++) {
        const x = CX0 + i * CW + CW / 2,
          y = RY0 + j * RH + RH / 2;
        b.plate("paint_black", x, y, -22.12, 0, -1, CW - 0.1, RH - 0.1, null, {
          tint: [0.06, 0.06, 0.06],
        });
        if (r() < 0.4)
          b.box("steel", x, y - 0.2, -22.3, 0.7, 0.03, 0.3, {
            tint: [0.6, 0.62, 0.64],
          });
      }
    for (let i = 0; i <= NCOL; i++)
      b.boxMM(
        "steel",
        CX0 + i * CW - 0.04,
        RY0,
        -22.3,
        CX0 + i * CW + 0.04,
        RY0 + NROW * RH,
        -22.1,
        { tint: [0.55, 0.57, 0.6] },
      );
    b.light(0, 2.5, -23.2, [1, 0.9, 0.7], 0.5, 8, { box: KB });
    // ovens, kettles, coffee urns, pie racks, prep tables
    for (let k = 0; k < 4; k++) {
      const x = -12 + k * 2.4;
      b.boxMM("steel", x - 1.1, 0, -33.9, x + 1.1, 1.9, -32.6, {
        tint: [0.5, 0.52, 0.55],
      });
      b.plate("paint_black", x, 1.0, -32.58, 0, 1, 1.6, 0.8, null, {
        tint: [0.1, 0.1, 0.1],
      });
      b.beam("chrome", x - 0.7, 1.5, -32.5, x + 0.7, 1.5, -32.5, 0.04, 0.04);
      b.glow(x, 0.6, -32.5, [1, 0.4, 0.15], 0.5);
    }
    b.col(-13.2, 0, -33.9, -2.3, 1.9, -32.6, {});
    b.boxMM("steel", -13, 1.9, -33.9, -3, 2.2, -32.4, {
      tint: [0.45, 0.47, 0.5],
    }); // hood
    for (const x of [0, 2.4]) {
      b.cyl("steel", x, 0, -32.8, 0.8, 0.7, 1.1, 14, {
        tint: [0.6, 0.62, 0.65],
      });
      b.cyl("flat", x, 1.06, -32.8, 0.7, 0.7, 0.02, 14, {
        tint: [0.6, 0.5, 0.3],
      });
      b.col(x - 0.8, 0, -33.6, x + 0.8, 1.1, -32, {});
      b.glow(x, 1.4, -32.8, [0.4, 0.4, 0.38], 1.2);
    }
    for (const x of [5.5, 7.2]) {
      b.cyl("brass", x, 0.9, -33.3, 0.45, 0.4, 1.4, 14, {
        tint: [0.75, 0.58, 0.3],
      });
      b.cyl("brass", x, 2.3, -33.3, 0.4, 0.1, 0.35, 14, {
        tint: [0.75, 0.58, 0.3],
      });
      b.boxMM("steel", x - 0.5, 0, -33.8, x + 0.5, 0.9, -32.8, {
        tint: [0.5, 0.52, 0.55],
      });
    } // coffee urns
    b.col(4.9, 0, -33.8, 7.8, 2.6, -32.8, {});
    b.plate(
      "art",
      6.35,
      3.2,
      -33.88,
      0,
      1,
      2.2,
      0.35,
      K.signCell("am_urns", "COFFEE · DRAWN FRESH · 20 MIN", 384, 64, {
        bg: "#121212",
        fg: "#e8d080",
      }),
    );
    for (const z of [-29.5, -26.5]) {
      K.table(b, -6, 0, z, 6, 1.1, { mat: "steel", tint: [0.65, 0.67, 0.7] });
      for (let k = 0; k < 6; k++) {
        const px = -8.5 + k,
          pz = z + (r() - 0.5) * 0.5;
        if (r() < 0.6) {
          b.cyl("ceramic", px, 0.76, pz, 0.18, 0.18, 0.02, 10);
          b.cyl("flat", px, 0.78, pz, 0.15, 0.15, 0.05, 10, {
            tint: [0.75, 0.5, 0.25],
          });
        }
      }
    }
    for (const x of [2, 4.5]) {
      for (let j = 0; j < 6; j++) {
        b.boxMM(
          "steel",
          x - 0.5,
          0.2 + j * 0.3,
          -30.2,
          x + 0.5,
          0.22 + j * 0.3,
          -29.2,
          { tint: [0.6, 0.62, 0.64] },
        );
        if (r() < 0.6)
          b.cyl(
            "flat",
            x + (r() - 0.5) * 0.4,
            0.22 + j * 0.3,
            -29.7,
            0.16,
            0.16,
            0.04,
            10,
            { tint: [0.72, 0.5, 0.26] },
          );
      }
      for (const dx of [-0.5, 0.5])
        for (const dz of [-30.2, -29.2])
          b.pipe("steel", x + dx, 0, dz, x + dx, 2, dz, 0.015, 4);
      b.col(x - 0.5, 0, -30.2, x + 0.5, 2, -29.2, {});
    }
    b.plate(
      "art",
      3.3,
      2.4,
      -30.25,
      0,
      -1,
      2,
      0.3,
      K.signCell("am_pies", "PIE RACK — ROTATE STOCK", 256, 48, {
        bg: "#e8e0c8",
        fg: "#2a2a20",
      }),
    );
    b.boxMM("stainless", 8.2, 0, -33.9, 11.0, 1.0, -32.9, {
      tint: [0.75, 0.78, 0.8],
    });
    b.col(8.2, 0, -33.9, 11.0, 1.0, -32.9, {}); // sinks
    for (const x of [-11, -3, 5])
      K.lamp(b, x, 3.6, -28, "tube", [0.92, 0.95, 1.0], x === -3 ? 0 : 0.9, 8, {
        ceil: 4.2,
        len: 1.6,
        dead: x === -3,
        lightOpts: { box: KB },
      });
    K.loot(ctx, "fridge", -13.4, 0, -24, HP, {
      loot: "fridge",
      name: "Walk-in Cooler",
    });
    K.loot(ctx, "locker", -13.5, 0, -27.5, HP, {
      loot: "locker",
      name: "Cook's Locker",
    });
    K.note(ctx, "ph_am_note_recipe", -6.4, 0.77, -26.3, {
      name: "Recipe Card: Baked Beans",
      title: "Penny & Price — Baked Beans (commissary card #3)",
      text: 'BAKED BEANS, IN THE CROCK (serves 400)\n\nNavy beans, soaked overnight. Molasses, the dark kind. Salt pork. Mustard. Onion, whole, one per crock, removed before serving so no one ever knows it was there.\n\nBake low. Bake long. Never hurry beans; beans remember.\n\n(pencil, in a different hand:) 1971 — no molasses. Used Fizzo Cola. Customers said it was "the best they ever had." Customers are so hungry now they would eat the crock. — H.',
    });
    // ---------------- stairs kitchen → basement (x 11.2..13.8, z −33.8..−26) ----------------
    K.stairs(b, 11.3, -33.8, 13.8, -26, BY, 0, "+z", {
      mat: "concrete",
      tint: [0.55, 0.53, 0.5],
      rail: "r",
      railMat: "rust",
      handMat: "rust",
      solid: false,
      thick: 0.3,
    });
    // ---------------- stairs basement → hall (x 11.2..13.8, z −6.5..−1) ----------------
    K.stairs(b, 11.3, -6.5, 13.8, -1, BY, 0, "-z", {
      mat: "concrete",
      tint: [0.55, 0.53, 0.5],
      rail: "r",
      railMat: "rust",
      handMat: "rust",
      solid: false,
      thick: 0.3,
    });

    // ---------------- BASEMENT COMMISSARY (y −4.2) ----------------
    const BB = [-14.1, BY - 0.2, -34.1, 14.1, -0.2, 0.1];
    K.room(b, ctx, {
      x0: -14,
      z0: -34,
      x1: 14,
      z1: 0,
      y: BY,
      h: 3.9,
      floor: "concrete",
      fc: [0.5, 0.49, 0.46],
      wall: "brick_brown",
      wc: [0.6, 0.5, 0.42],
      ceil: "concrete",
      cc: [0.36, 0.35, 0.33],
      noCeil: true,
      trim: false,
    });
    // ceiling (with stair holes)
    const cf = (x0, z0, x1, z1) =>
      b.face("concrete", x0, -0.3, z0, 1, 0, 0, 0, 0, 1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.36, 0.35, 0.33],
      });
    cf(-14, -34, 11.2, 0);
    cf(11.2, -26, 14, -6.5);
    cf(11.2, -1, 14, 0);
    for (const x of [-8, 6])
      for (let z = -28; z <= -6; z += 7.3) {
        b.boxMM("concrete", x - 0.3, BY, z - 0.3, x + 0.3, -0.3, z + 0.3, {
          tint: [0.5, 0.48, 0.45],
        });
        b.col(x - 0.3, BY, z - 0.3, x + 0.3, -0.3, z + 0.3, {});
      }
    for (let z = -32; z <= -2; z += 5)
      b.beam("rust", -14, -0.55, z, 11.2, -0.55, z, 0.2, 0.3, {
        tint: [0.5, 0.4, 0.32],
      });
    // the MASTER CAROUSEL: a great wheel of food drums feeding pneumatic tubes up to the wall
    {
      const mx = -1,
        mz = -21.5;
      b.boxMM("concrete", mx - 3, BY, mz - 1.4, mx + 3, BY + 0.5, mz + 1.4, {
        tint: [0.45, 0.44, 0.42],
      });
      b.geo("steel", K.unitCyl(24), {
        x: mx,
        y: BY + 2.0,
        z: mz,
        sx: 1.5,
        sy: 0.3,
        sz: 1.5,
        rx: HP,
        tint: [0.55, 0.57, 0.6],
      });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * PI * 2;
        b.geo("brass", K.unitCyl(10), {
          x: mx + Math.cos(a) * 1.2,
          y: BY + 2.0 + Math.sin(a) * 1.2,
          z: mz,
          sx: 0.28,
          sy: 0.9,
          sz: 0.28,
          rx: HP,
          tint: [0.75, 0.58, 0.3],
        });
      }
      b.geo("steel", K.unitCyl(10), {
        x: mx,
        y: BY + 2.0,
        z: mz,
        sx: 0.15,
        sy: 1.8,
        sz: 0.15,
        rx: HP,
      });
      for (const dx of [-1.8, 1.8])
        b.boxMM(
          "black_iron",
          mx + dx - 0.15,
          BY + 0.5,
          mz - 0.3,
          mx + dx + 0.15,
          BY + 2.2,
          mz + 0.3,
          {},
        );
      for (let k = 0; k < 6; k++) {
        const px = mx - 2.5 + k;
        b.pipe("brass", px, BY + 3.0, mz, px, -0.3, mz - 0.5, 0.09, 8, {
          tint: [0.72, 0.55, 0.3],
        });
      }
      b.pipe("brass", mx - 2.5, BY + 3.0, mz, mx + 2.5, BY + 3.0, mz, 0.12, 8, {
        tint: [0.72, 0.55, 0.3],
      });
      b.boxMM(
        "paint_red",
        mx + 2.6,
        BY + 0.5,
        mz + 0.8,
        mx + 3.1,
        BY + 1.6,
        mz + 1.3,
        { tint: [0.6, 0.12, 0.1] },
      ); // crank housing
      b.plate(
        "art",
        mx,
        BY + 0.8,
        mz + 1.42,
        0,
        1,
        3.4,
        0.4,
        K.signCell(
          "am_carousel",
          "MASTER CAROUSEL · PNEUMATIC NICKEL SYSTEM",
          512,
          64,
          { bg: "#2a2a20", fg: "#e0d080", font: "Arial, sans-serif" },
        ),
      );
      b.col(mx - 3, BY, mz - 1.4, mx + 3.1, BY + 3.2, mz + 1.4, {});
      K.anchor(ctx, "carousel", mx + 2.85, BY, mz + 1.6);
      b.light(mx, BY + 3.2, mz + 2, [1, 0.72, 0.4], 0.8, 7, { box: BB });
    }
    // stores: sacks, crates, shelves of cans, a pie freezer, flour
    for (let k = 0; k < 10; k++)
      b.box(
        "fabric",
        -12.6 + (k % 5) * 0.8,
        BY + Math.floor(k / 5) * 0.45,
        -32.8 + (k % 2) * 0.3,
        0.7,
        0.45,
        0.5,
        { yaw: r() * 0.3, tint: [0.82, 0.78, 0.66] },
      );
    b.col(-13, BY, -33.2, -8.6, BY + 0.9, -32.1, {});
    b.plate(
      "art",
      -10.8,
      BY + 1.6,
      -33.88,
      0,
      1,
      2.6,
      0.4,
      K.signCell("am_flour", "FLOUR · SUGAR · BEANS · COFFEE", 512, 64, {
        bg: "#d8ccb0",
        fg: "#2a2a20",
      }),
    );
    for (const x of [-5, 0, 5])
      K.shelf(b, x, BY, -33.6, 0, 3.6, {
        mat: "metal",
        items: ["can", "can", "jar", "box"],
        seed: 300 + x,
        h: 2.4,
      });
    for (const z of [-14, -8])
      K.shelf(b, -13.6, BY, z, HP, 4, {
        mat: "wood",
        items: ["can", "box", "jar"],
        seed: 320 + z,
        h: 2.2,
      });
    for (let k = 0; k < 6; k++) {
      const cx = 3 + (k % 3) * 1.1,
        cz = -12 + Math.floor(k / 3) * 1.1;
      b.box("wood", cx, BY + (k > 2 ? 0 : 0), cz, 1.0, 0.8, 1.0, {
        yaw: r() * 0.2,
        tint: [0.6, 0.5, 0.36],
      });
    }
    b.col(2.4, BY, -12.6, 6.8, BY + 0.8, -10.3, {});
    // giant roach nest in the south-west
    for (let k = 0; k < 16; k++)
      b.hplate(
        "decal",
        -13 + r() * 9,
        BY + 0.012 + k * 0.0004,
        -8 + r() * 7,
        1.2 + r() * 1.4,
        1.2 + r() * 1.4,
        r() * 6,
        K.decal(k % 4 === 0 ? "blood" : "roach", k + 70),
      );
    for (let k = 0; k < 18; k++)
      b.geo("flat", K.sphereGeo(), {
        x: -13 + r() * 6,
        y: BY + 0.12 + (r() < 0.3 ? r() * 1.5 : 0),
        z: -7 + r() * 6,
        sx: 0.14 + r() * 0.1,
        sy: 0.1,
        sz: 0.12,
        tint: [0.8, 0.74, 0.5],
      });
    b.boxMM("paint_black", -13.95, BY, -4.5, -13.9, BY + 1.6, -2.4, {
      tint: [0.03, 0.03, 0.03],
      faces: "e",
    }); // breach to the sewer
    K.rubble(b, -12.6, BY, -3.4, 1.4, 0.9, { seed: 41 });
    K.skel(ctx, -9.4, BY, -4.6, 1.8, "curled");
    K.note(ctx, "ph_am_reel_night", -9.0, BY + 0.03, -4.1, {
      type: "tape",
      name: "Tape reel: Night Porter",
      title: "Penny & Price — night porter's recorder",
      text: "(a clatter; the whirr of a big wheel turning)\n\nNight porter, Penny & Price, Thirty-Fourth and Broadway. It's — what is it — 4 A.M. the sixth. The radio says stay indoors. Penny's still upstairs, loading the wall. I told him nobody's coming. He said \"Then the food will be very fresh when they do.\"\n\nThe carousel's jammed. Nickel return's backed up with something — no. Roaches. In the tubes. Big as your hand and they are NOT scared of me.\n\nIf the wall ever stops, it's the carousel. Grease the drive, clear the tubes, throw the crank. Tell Penny I tried.",
    });
    // lighting
    for (const [x, z, i] of [
      [-6, -30, 0.6],
      [6, -30, 0.7],
      [-6, -12, 0.35],
      [6, -18, 0.6],
      [0, -4, 0.4],
      [12.5, -14, 0.5],
    ])
      K.lamp(b, x, -1.0, z, "bulb", [1, 0.72, 0.4], i, 7, {
        ceil: -0.3,
        lightOpts: { box: BB },
      });
    b.light(-12.5, BY + 0.6, -3.5, [0.35, 1.0, 0.3], 0.8, 5, { box: BB });
    b.glow(-12.6, BY + 0.4, -3.4, [0.3, 0.8, 0.25], 1.6);
    K.loot(ctx, "footlocker", 13.3, BY, -20, HP, {
      loot: "footlocker",
      name: "Porter's Chest",
    });
    K.loot(ctx, "toolbox", -1, BY, -18.6, PI, {
      loot: "toolbox",
      items: [
        ["dry_cell", 1],
        ["scrap_metal", 2],
      ],
    });
    K.loot(ctx, "fridge", 13.4, BY, -23, HP, {
      loot: "food_oldworld",
      name: "Pie Freezer",
      items: [["ph_am_pie", 2]],
    });

    // ---------------- doors & anchors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "ph_am_in",
      pos: new THREE.Vector3(0, 1.3, AZ1 + 0.05),
      label: "Penny & Price Automat",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 2.4, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("automat")),
    });
    K.door(ctx, {
      id: "ph_am_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.4),
      label: "23rd Street",
      verb: "Leave",
      target: { x: 0, y: 0, z: AZ1 + 2.6, yaw: PI },
    });
    K.anchor(ctx, "entrance", 0, 0, -2.4);
    K.anchor(ctx, "settler1", -5, 0, -13);
    K.anchor(ctx, "settler2", 3.6, 0, -18.5);
    K.anchor(ctx, "npc1", -5, 0, -13);
    K.anchor(ctx, "npc2", 3.6, 0, -18.5);
    K.anchor(ctx, "merchant", 12.8, 0, -13.5);
    const roaches = [
      [-10, BY, -6],
      [-7, BY, -2.5],
      [-11, BY, -10],
      [4, BY, -26],
      [-6, BY, -24],
    ];
    roaches.forEach((p, i) =>
      K.anchor(ctx, "roach" + (i + 1), p[0], p[1], p[2]),
    );
    const sp = [
      [-9, BY, -6],
      [4, BY, -26],
      [-6, BY, -24],
      [8, BY, -8],
      [-4, 0, -26],
      [6, 0, -30],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 13.3, BY, -20);
    K.anchor(ctx, "loot2", -13.4, 0, -24);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_automat_int";
    ctx.wallZ = WZ;
    buildInteractables(ctx);
  }

  // ==================================================================
  // INTERACTABLES: automat sections, coffee, the carousel crank
  // ==================================================================
  function buildInteractables(ctx) {
    const O = ctx.O;
    FOODS.forEach((fd, s) => {
      const x = -12 + s * 3 + 1.5;
      G.world.addInteractable({
        pos: new THREE.Vector3(O.x + x, O.y + 1.9, O.z + ctx.wallZ + 0.3),
        radius: 1.3,
        priority: 0.3,
        label: () =>
          PH.flag("am_fixed")
            ? "Automat — " + itemName(fd.id) + " (" + fd.price + " scrip)"
            : "Automat — " + fd.label,
        verb: () => (PH.flag("am_fixed") ? "Insert scrip" : "Examine"),
        enabled: () => ctx.inside,
        onInteract() {
          vend(ctx, fd);
        },
      });
    });
    G.world.addInteractable({
      pos: new THREE.Vector3(O.x - 13.2, O.y + 1.6, O.z - 19.2),
      radius: 1.2,
      priority: 0.3,
      label: "Dolphin Coffee Spout",
      verb: () => (PH.flag("am_fixed") ? "Pour (2 scrip)" : "Try"),
      enabled: () => ctx.inside,
      onInteract() {
        if (!PH.flag("am_fixed")) {
          K.notify(
            "The brass dolphin coughs up a spoonful of cold sludge. The system is down.",
          );
          K.sfx("empty_click");
          return;
        }
        if (!pay(2)) return;
        K.give("ph_am_coffee", 1);
        K.sfx("drink", null, { volume: 0.5 });
      },
    });
    const c = ctx.anchors.carousel;
    G.world.addInteractable({
      pos: new THREE.Vector3(c.x, c.y + 1.1, c.z - 0.3),
      radius: 1.0,
      priority: 0.6,
      label: "Master Carousel Crank",
      verb: () => (PH.flag("am_fixed") ? "Examine" : "Throw"),
      enabled: () => ctx.inside,
      onInteract() {
        throwCrank(ctx);
      },
    });
  }
  function itemName(id) {
    try {
      const d = !G.isStub("items") && G.items.get && G.items.get(id);
      return d ? d.name : id;
    } catch (e) {
      return id;
    }
  }
  function pay(n) {
    if (G.isStub("inventory")) return true;
    if (K.scripCount() < n) {
      K.notify("You need " + n + " scrip.");
      K.sfx("ui_error");
      return false;
    }
    K.safe("pay", () => G.inventory.addScrip(-n));
    return true;
  }
  function vend(ctx, fd) {
    if (!PH.flag("am_fixed")) {
      K.sfx("empty_click");
      K.notify(
        PH.flag("am_asked")
          ? "The little door won't budge. Penny says the Master Carousel in the basement is jammed."
          : 'The little glass door is locked tight. There\'s a coin slot, and a sign: "PLEASE SEE ATTENDANT."',
      );
      return;
    }
    if (!pay(fd.price)) return;
    K.give(fd.id, 1);
    K.sfx("pickup_scrip", null, { volume: 0.6 });
    PH.setFlag("am_bought", (PH.flag("am_bought") || 0) + 1);
  }
  function throwCrank(ctx) {
    if (PH.flag("am_fixed")) {
      K.notify(
        "The Master Carousel turns steadily, humming and clicking like a happy clock.",
      );
      return;
    }
    if (!roachesClear(ctx)) {
      K.notify(
        "Giant roaches are swarming around the drive. Deal with them first.",
      );
      K.sfx("roach_hiss");
      return;
    }
    const rep = K.skill("mechanics");
    if (rep < 35 && !K.has("dry_cell")) {
      K.notify("The drive motor is dead. (Mechanics 35, or a Dry Cell)");
      K.sfx("ui_error");
      return;
    }
    if (rep < 35) {
      K.take("dry_cell", 1);
      K.notify("You swap in a Dry Cell and throw the crank.");
    } else
      K.notify(
        "[Mechanics 35] You clear the tubes, grease the drive and throw the crank.",
      );
    PH.setFlag("am_fixed", true);
    K.sfx("cryo_door", null, { volume: 0.4, pitch: 1.6 });
    K.xp(80, "Restarted the Master Carousel");
    if (K.q.active("ph_nickel")) K.q.set("ph_nickel", "return");
  }
  function roachesClear(ctx) {
    if (G.isStub("actors") || !G.actors.get) return true;
    for (let i = 1; i <= 5; i++) {
      const a = G.actors.get("ph_am_roach" + i);
      if (a && !a.dead) return false;
    }
    return true;
  }

  // ==================================================================
  // DATA: items, quest, dialogue
  // ==================================================================
  function data() {
    K.defineItem({
      id: "ph_am_pie",
      type: "aid",
      name: "Automat Apple Pie",
      weight: 0.5,
      value: 12,
      tags: ["food"],
      mesh: "sweet_roll",
      sound: "eat",
      effects: { hpOverTime: [30, 8], rads: 1 },
      desc: "A wedge of apple pie from behind a little glass door. Baked by a robot with 22 years of practice. The apples are gnarlberry. Nobody minds.",
    });
    K.defineItem({
      id: "ph_am_sandwich",
      type: "aid",
      name: "Automat Sandwich",
      weight: 0.5,
      value: 14,
      tags: ["food"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [40, 10] },
      desc: "Pack oxen loaf on rye, waxed paper, a pickle spear. Penny cuts the crusts off whether you want him to or not.",
    });
    K.defineItem({
      id: "ph_am_beans",
      type: "aid",
      name: "H&H Baked Beans",
      weight: 1,
      value: 10,
      tags: ["food"],
      mesh: "can_beans",
      sound: "eat",
      effects: { hpOverTime: [35, 10], attrs: { grit: 1 }, duration: 240 },
      desc: "The famous beans, in the famous little crock. Slow-baked with Fizzo Cola since the molasses ran out. +1 END while it lasts.",
    });
    K.defineItem({
      id: "ph_am_mac",
      type: "aid",
      name: "Automat Macaroni au Gratin",
      weight: 1,
      value: 12,
      tags: ["food"],
      mesh: "box_tvdinner",
      sound: "eat",
      effects: { hpOverTime: [30, 8] },
      desc: "Baked macaroni with a crust you could shingle a roof with. Rich, cheesy, faintly glowing.",
    });
    K.defineItem({
      id: "ph_bellhop_cap",
      type: "apparel",
      slot: "head",
      name: "Pembroke's Bellhop Cap",
      weight: 0.5,
      value: 80,
      dr: 1,
      attrs: { presence: 1 },
      desc: "A red pillbox cap with a tarnished brass badge: HOTEL NEW YORKER. Doors open for a bellhop. +1 CHA.",
    });
    K.defineItem({
      id: "ph_am_coffee",
      type: "aid",
      name: "Automat Coffee",
      weight: 0.5,
      value: 6,
      tags: ["drink"],
      mesh: "bottle_milk",
      sound: "drink",
      effects: { stamina: 20, hp: 5 },
      desc: "Poured from a brass dolphin's mouth. Fresh every twenty minutes, as it has been since 1912. +20 AP.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph_nickel",
        name: "Nickel and Dime",
        giver: "Penny",
        location: "Penny & Price Automat",
        desc: "Penny, the Penny & Price's robot cook, has kept the wall of little glass doors stocked for twenty-two years — but the wall stopped vending the night after the bombs. The Master Carousel in the basement commissary is jammed, and something is living in the pneumatic tubes.",
        stages: [
          {
            id: "cellar",
            text: "Clear the giant roaches out of the Automat's basement commissary.",
            markers: [() => amMarker("carousel", "Commissary")],
          },
          {
            id: "crank",
            text: "Restart the Master Carousel in the basement (Mechanics 35, or a Dry Cell).",
            markers: [() => amMarker("carousel", "Master Carousel")],
          },
          {
            id: "return",
            text: "Tell Penny the automat is running again.",
            markers: [{ npc: "ph_penny", label: "Penny" }],
          },
        ],
        rewards: { xp: 200, scrip: 100 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("ph_dlg_penny", {
      start: () =>
        K.q.active("ph_nickel") && PH.flag("am_fixed")
          ? "fixed"
          : PH.flag("met_penny")
            ? "again"
            : "hello",
      nodes: {
        hello: {
          speaker: "Penny",
          onEnter: () => PH.setFlag("met_penny", true),
          text: "Welcome to Penny & Price, where the food is fresh, the coffee is hot, and the service is fully automatic! I am Penny, Commissary Unit Number One. Might I interest you in something from the steam table? Today's special is the same as every day's special.",
          responses: [
            {
              text: "Let me see what you're serving.",
              barter: true,
              end: true,
            },
            {
              text: "Why are all the little doors locked?",
              next: "wall",
              cond: () => !PH.flag("am_fixed"),
            },
            {
              text: "You've been cooking for twenty-two years?",
              next: "years",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Penny",
          text: "Back again! Splendid. Nothing warms a robot's servos like a repeat customer.",
          responses: [
            { text: "Show me the steam table.", barter: true, end: true },
            {
              text: "About the wall of doors...",
              next: "wall",
              cond: () => !PH.flag("am_fixed") && !K.q.started("ph_nickel"),
            },
            {
              text: "How's the wall holding up?",
              next: "wall_ok",
              cond: () => !!PH.flag("am_fixed"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        years: {
          speaker: "Penny",
          text: 'Twenty-two, as of this Tuesday. The customers have changed — rather more ragged, some of them — but the pie crust has not. Mr. Price always said: "The customer is always right, and always hungry." Mr. Penny said: "Good food at a fair price." He said it so often they painted it on the building. I was named for him. I have never met him. I assume he is resting.',
          responses: [
            {
              text: "Why are the little doors locked?",
              next: "wall",
              cond: () => !PH.flag("am_fixed"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        wall: {
          speaker: "Penny",
          onEnter: () => PH.setFlag("am_asked", true),
          text: "Ah. A delicate matter. The Master Carousel in the commissary — the great wheel that lifts every pie to every little door — seized the night after the unpleasantness. And now there are... tenants... in the pneumatic tubes. Giant roaches. I am a cook, not an exterminator. My flamethrower is strictly for crème brûlée.",
          responses: [
            {
              text: "I'll clear them out and get the wheel turning.",
              next: "accept",
              action: () => startNickel(),
            },
            {
              text: "[Trade 40] What's it worth to you?",
              check: { skill: "trade", value: 40 },
              next: "haggle",
              failNext: "haggle_fail",
            },
            { text: "Not my problem.", end: true },
          ],
        },
        haggle: {
          speaker: "Penny",
          onEnter: () => PH.setFlag("am_bonus", 60),
          text: "A negotiator! How refreshing. Very well: one hundred and sixty scrip, three of my finest pies, and — this is unprecedented — free coffee. For life. Yours, not mine.",
          responses: [
            { text: "Deal.", next: "accept", action: () => startNickel() },
          ],
        },
        haggle_fail: {
          speaker: "Penny",
          text: "I am authorised to offer one hundred scrip and a pie. The pie is non-negotiable. It is also delicious.",
          responses: [
            { text: "Fine.", next: "accept", action: () => startNickel() },
            { text: "Maybe later.", end: true },
          ],
        },
        accept: {
          speaker: "Penny",
          text: "Splendid! The commissary stairs are behind the railing in the south-east corner, or through the kitchen. The crank is on the carousel housing — the red box. Mind the tubes. They are hot. So are the roaches, in a manner of speaking.",
          responses: [{ text: "On it.", end: true }],
        },
        fixed: {
          speaker: "Penny",
          text: "Listen — do you hear that? Click... whirr... THUNK. That is the sound of four hundred little doors being loaded at once. I have not heard it in twenty-two years. If I had tear ducts I would be a hazard to the electrics.",
          responses: [
            {
              text: "Glad I could help.",
              next: "reward",
              action: () => finishNickel(),
            },
          ],
        },
        reward: {
          speaker: "Penny",
          text: "Please — your reward, and a pie. Then go and put a scrip in a slot. There is nothing in this world like the little door opening for you.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        wall_ok: {
          speaker: "Penny",
          text: "Running like a Swiss watch, if the Swiss had made watches out of pie. Help yourself — scrip in the slot, turn the knob, and the little door does the rest.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("ph_dlg_nell", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Nickel Nell",
          text: "Change, hon? I been throwin' nickels since before you were a twinkle in your daddy's eye. Scrip, nickels, bottle tops — I don't judge. What do you need?",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "What is this place?", next: "place" },
            { text: "Who's the old fellow on the balcony?", next: "pem" },
            { text: "Goodbye.", end: true },
          ],
        },
        place: {
          speaker: "Nickel Nell",
          text: "The Automat. Folks from all over Herald Square come here to eat off a marble table like civilized people. The robot cooks, I make change, the Garden grows spuds out back. Rules are simple: no guns out, pay the robot, bus your table. Break 'em and the Garden boys escort you out. In pieces.",
          responses: [
            { text: "Who's the old fellow on the balcony?", next: "pem" },
            { text: "Goodbye.", end: true },
          ],
        },
        pem: {
          speaker: "Nickel Nell",
          text: "Archie Pembroke. Used to be a bellhop at the Hotel New Yorker, up on 34th. He's got a story about the thirty-third floor he tells anybody who'll sit still. Buy him a coffee and you'll hear it twice.",
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
    G.dialogue.register("ph_dlg_pembroke", {
      start: () =>
        K.has("ph_ny_q_notebook") && !K.q.done("ph_room_3327")
          ? "notebook"
          : K.q.done("ph_room_3327")
            ? "after"
            : PH.flag("met_pem")
              ? "again"
              : "hello",
      nodes: {
        hello: {
          speaker: "Archibald Pembroke",
          onEnter: () => PH.setFlag("met_pem", true),
          text: "Evening. Or morning — hard to tell down here without the doorman calling it. Archibald Pembroke, formerly of the Hotel New Yorker. Bellhop. Forty-one years, man and boy. Pull up a chair, I don't bite. Not since '83.",
          responses: [
            { text: "The Hotel New Yorker?", next: "hotel" },
            { text: "Just passing through.", end: true },
          ],
        },
        again: {
          speaker: "Archibald Pembroke",
          text: "You again. Good. I was running out of people who hadn't heard about the thirty-third floor.",
          responses: [
            {
              text: "Tell me about the thirty-third floor.",
              next: "hotel",
              cond: () => !K.q.started("ph_room_3327"),
            },
            {
              text: "About Room 3327...",
              next: "hint",
              cond: () => K.q.active("ph_room_3327"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        hotel: {
          speaker: "Archibald Pembroke",
          text: "Two thousand five hundred rooms and a radio in every one. Big red sign on the roof — you can see it from the river. My floors were thirty through thirty-five. And on thirty-three there's Room 3327: the Tesla Suite. Old Nikola Tesla lived there till he passed in '43. Died alone, with his pigeons.",
          responses: [{ text: "And?", next: "hotel2" }],
        },
        hotel2: {
          speaker: "Archibald Pembroke",
          text: "And somebody kept working in there. A lady scientist — Stanhope Foundation, very hush-hush — rented the whole floor. Robots in the hallway. Lights dimming every night at nine. I took seed up for the birds, nine o'clock sharp. Morning of the bombs, the whole floor sang like a tuning fork. Then nothing. The robots are still up there, and so is whatever she built.",
          responses: [
            { text: "What do you want from it?", next: "want" },
            { text: "Sounds like a death trap.", end: true },
          ],
        },
        want: {
          speaker: "Archibald Pembroke",
          text: "Tesla kept a notebook. Stanhope used to carry it like a Bible. I don't want the ray, or whatever it is — keep it, sell it, shoot a Colossus with it. I want the notebook. Somebody ought to remember that he was right about everything and died broke feeding birds. Bring it to me and I'll make it worth your while.",
          responses: [
            {
              text: "I'll get your notebook.",
              next: "accept",
              action: () => PH.nyQuestTo("find"),
            },
            {
              text: "[Persuasion 35] How do I get past the robots?",
              check: { skill: "persuasion", value: 35 },
              next: "tips",
              failNext: "tips_fail",
              action: () => PH.nyQuestTo("find"),
            },
            { text: "Maybe some other time.", end: true },
          ],
        },
        tips: {
          speaker: "Archibald Pembroke",
          onEnter: () => {
            if (!PH.flag("pem_key_hint")) {
              PH.setFlag("pem_key_hint", true);
            }
          },
          text: 'Car 3 is the express to thirty-three — locked out, but the front desk terminal can restore it, and the Bell Captain kept a spare key in his lockbox by the door. And the robots\' charging bay on thirty-three has a terminal. Meridian passwords were never very clever. Try "PIGEON."',
          responses: [{ text: "Thanks, Archie.", next: "accept" }],
        },
        tips_fail: {
          speaker: "Archibald Pembroke",
          text: "Get past them? Son, I got past them by being a bellhop. You're not a bellhop. Try the elevator.",
          responses: [{ text: "Right.", next: "accept" }],
        },
        accept: {
          speaker: "Archibald Pembroke",
          text: "Thirty-fourth and Eighth, the entrance with the marquee. Mind the ballroom — they never cleared the Shamrock Ball. And feed the birds, if there are any left.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        hint: {
          speaker: "Archibald Pembroke",
          text: "Stanhope was always in and out of 3327, but nobody ever saw her come back out the door. Always thought it was something to do with the wardrobe. Old man kept his notebook behind his clothes, the story goes.",
          responses: [{ text: "Thanks.", end: true }],
        },
        notebook: {
          speaker: "Archibald Pembroke",
          text: "(His hands shake as he unwraps the oilcloth.) That's his hand. That's — look at that, a white feather. She kept it. Twenty-two years in a hotel room and she kept the feather.",
          responses: [
            {
              text: "It's yours, Archie.",
              next: "thanks",
              standing: 20,
              action: () => finishPembroke(false),
            },
            {
              text: "[Trade 50] It nearly got me killed. It's worth more than that.",
              check: { skill: "trade", value: 50 },
              next: "thanks_more",
              failNext: "haggle_no",
            },
            { text: "I think I'll hold on to it.", next: "keep" },
          ],
        },
        thanks: {
          speaker: "Archibald Pembroke",
          text: "Here — my cap from the old uniform, and every cap I've got that isn't on my head. Wear it with pride. Doors open for a bellhop. That's the whole secret of the job.",
          responses: [{ text: "Take care, Archie.", end: true }],
        },
        thanks_more: {
          speaker: "Archibald Pembroke",
          text: "Ha! Fair. Fair. You earned it. Two hundred and fifty scrip and the cap off my head. Don't spend it all on pie.",
          responses: [
            { text: "Deal.", end: true, action: () => finishPembroke(true) },
          ],
        },
        haggle_no: {
          speaker: "Archibald Pembroke",
          text: "I'm a bellhop, not a bank. What I've got is what I've got.",
          responses: [
            {
              text: "Fine. It's yours.",
              next: "thanks",
              action: () => finishPembroke(false),
            },
            { text: "Then I'll keep it.", next: "keep" },
          ],
        },
        keep: {
          speaker: "Archibald Pembroke",
          text: "...Well. It's yours to keep, I suppose. Just — read it sometime. He'd have liked that.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        after: {
          speaker: "Archibald Pembroke",
          text: "I read a page a night. Can't understand one word in ten. Doesn't matter. It's his voice. You did a good thing.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
  }
  function amMarker(name, label) {
    const a = PH.anchor("automat", name);
    return a ? { x: a.x, y: a.y, z: a.z, label } : null;
  }
  function startNickel() {
    K.q.start("ph_nickel");
    const ctx = PH.amCtx;
    if (ctx && roachesClear(ctx)) K.q.set("ph_nickel", "crank");
    if (PH.flag("am_fixed")) K.q.set("ph_nickel", "return");
  }
  function finishNickel() {
    if (PH.flag("am_paid")) return;
    PH.setFlag("am_paid", true);
    K.scrip(PH.flag("am_bonus") || 0);
    K.give("ph_am_pie", 3);
    K.q.complete("ph_nickel");
  }
  function finishPembroke(more) {
    if (!K.has("ph_ny_q_notebook")) return;
    K.take("ph_ny_q_notebook", 1);
    K.scrip(more ? 250 : 150);
    K.give("ph_bellhop_cap", 1);
    PH.setFlag("ny_notebook_given", true);
    PH.nyQuestTo("return");
    K.q.complete("ph_room_3327");
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    const food = [
      ["ph_am_pie", 4],
      ["ph_am_sandwich", 3],
      ["ph_am_beans", 4],
      ["ph_am_mac", 3],
      ["ph_am_coffee", 6],
      ["fizzo_cola", 4],
      ["purified_water", 3],
      ["chocolate_zeppelin", 2],
    ];
    PH.spawnActor(ctx, {
      id: "ph_penny",
      type: "valet",
      name: "Penny",
      faction: "settlers",
      level: 8,
      essential: true,
      hostile: false,
      pos: v(A.penny),
      yaw: HP,
      ai: "merchant",
      home: "here",
      homeR: 2.5,
      dialogue: "ph_dlg_penny",
      voice: "robot",
      merchant: {
        scrip: 420,
        stock: K.stock(food, "merchant_food", 4),
        restock: 2,
      },
      barks: [
        "Pie! Fresh pie! Fresh as of twenty-two years ago, re-baked this morning!",
        "Less work for Mother!",
        "Please bus your table. Mother is resting.",
        "Coffee is fresh every twenty minutes. I set a timer. I have always set a timer.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_nell",
      type: "human",
      gender: "f",
      outfit: "merchant",
      name: "Nickel Nell",
      faction: "settlers",
      level: 5,
      essential: true,
      pos: v(A.nell),
      yaw: PI,
      ai: "merchant",
      home: "here",
      homeR: 0.6,
      dialogue: "ph_dlg_nell",
      merchant: {
        scrip: 300,
        stock: K.stock(
          [
            ["rally_tonic", 2],
            ["scrap_metal", 6],
            ["ammo_10mm", 30],
            ["purified_water", 3],
          ],
          "merchant_general",
          4,
        ),
        restock: 3,
      },
      barks: [
        "Change! Nickels, scrip, bottle tops!",
        "Don't lean on the booth, hon.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_pembroke",
      type: "human",
      gender: "m",
      outfit: "survivor_layers",
      name: "Archibald Pembroke",
      faction: "settlers",
      level: 6,
      essential: true,
      pos: v(A.pembroke),
      yaw: 0,
      ai: "sit",
      home: "here",
      homeR: 0.5,
      dialogue: "ph_dlg_pembroke",
      voice: "settler",
      barks: [
        "Two thousand five hundred rooms, and a radio in every one.",
        "Nine o'clock. Seed for the birds.",
        "Thirty-third floor. Never again. Unless.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_am_settler1",
      type: "human",
      gender: "m",
      outfit: "settler",
      name: "Automat Regular",
      faction: "settlers",
      level: 3,
      pos: v(A.settler1),
      ai: "sit",
      home: "here",
      homeR: 0.5,
      barks: [
        "Best beans in Manhattan.",
        "You put the cap in, the little door opens. Never gets old.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_am_settler2",
      type: "human",
      gender: "f",
      outfit: "drifter",
      name: "Automat Regular",
      faction: "settlers",
      level: 3,
      pos: v(A.settler2),
      ai: "sit",
      home: "here",
      homeR: 0.5,
      barks: [
        "Don't order the hash.",
        "Penny remembers everybody's order. Everybody's. Since 1950-something.",
      ],
    });
    const ext = PH.anchor("automat", "guard_gate");
    if (ext)
      PH.spawnActor(ctx, {
        id: "ph_am_guard",
        type: "human",
        gender: "m",
        outfit: "leather_armor",
        name: "Garden Guard",
        faction: "settlers",
        level: 6,
        pos: v(ext),
        yaw: PI,
        ai: "guard",
        home: "here",
        homeR: 2,
        weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
        barks: [
          "Guns away inside. Robot's rules.",
          "Automat's open. Always open.",
        ],
      });
    const gar = PH.anchor("automat", "garden");
    if (gar)
      PH.spawnActor(ctx, {
        id: "ph_am_gardener",
        type: "human",
        gender: "f",
        outfit: "settler",
        name: "Garden Keeper",
        faction: "settlers",
        level: 3,
        pos: v(gar),
        ai: "wander",
        home: "here",
        homeR: 5,
        barks: ["Tatos are coming in nice.", "Mind the tire beds."],
      });
    // commissary roaches (until the carousel is running)
    if (!PH.flag("am_fixed")) {
      for (let i = 1; i <= 5; i++) {
        PH.spawnActor(ctx, {
          id: "ph_am_roach" + i,
          type: i === 5 ? "burrow_rat" : "giant_roach",
          name: i === 5 ? "Pie Thief" : "Giant roach",
          faction: "creatures",
          level: i === 5 ? 3 : 2,
          hostile: true,
          pos: v(A["roach" + i]),
          yaw: i,
          ai: "wander",
          home: "here",
          homeR: 4,
          noRespawn: true,
          onDeath: () => {
            if (roachesClear(ctx)) {
              PH.setFlag("am_roaches", true);
              if (
                K.q.active("ph_nickel") &&
                K.q.stage("ph_nickel") === "cellar"
              ) {
                K.q.set("ph_nickel", "crank");
              }
            }
          },
        });
      }
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  function update(dt, realDt, ctx) {
    if (!ctx.inside || !dt) return;
    // entering the commissary starts the quest softly if Penny already explained the problem
    const P = G.player.pos;
    if (P.y - ctx.O.y < -2 && PH.flag("am_asked") && !K.q.started("ph_nickel"))
      startNickel();
  }

  PH.define({
    id: "automat",
    lod: 520,
    name: "Penny & Price Automat",
    interior: "automat",
    order: 20,
    lift: 5, // lift: the commissary cellar (y −4.2) must stay ≥ 0
    build(ctx) {
      PH.amCtx = ctx;
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
  });
})();
