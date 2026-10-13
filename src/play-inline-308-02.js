// play-inline-308 02 — fillstyle
// Lines 30-211 of readable/play-inline-308.pretty.js (statement-aligned).
  const P = G._pe,
    D = P.dress,
    E = P.dress2;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const TC = (P.tc = P.tc || {});
  // keep in step with 20_tudor_city.js
  const TY = 4.5,
    AX0 = 312,
    AX1 = 328,
    AZ0 = -176,
    AZ1 = -158,
    ATOP = 64,
    BZ1 = -165,
    BTOP = 40,
    F3 = 10;
  const Y9 = 30; // apartment 9C floor level in the cell (a separate storey, reached by a door)

  // ------------------------------------------------------------------
  // textures
  // ------------------------------------------------------------------
  function calendarTex() {
    return P.texMat(
      "tc_9c_calendar",
      P.canvasTex("tc_9c_calendar", 256, 360, (x, w, h) => {
        x.fillStyle = "#efe6cc";
        x.fillRect(0, 0, w, h);
        x.fillStyle = "#7a2a22";
        x.fillRect(0, 0, w, 96);
        x.fillStyle = "#f4ecd4";
        x.textAlign = "center";
        x.font = "bold 18px " + P.FONTS.SERIF;
        x.fillText("TUDOR CITY PHARMACY", w / 2, 26);
        x.font = "italic 13px " + P.FONTS.SERIF;
        x.fillText(
          '"Your Neighbourhood Druggist" · MUrray Hill 2-0417',
          w / 2,
          46,
        );
        x.font = "bold 30px " + P.FONTS.SERIF;
        x.fillText("MARCH 1967", w / 2, 84);
        x.fillStyle = "#2a2218";
        x.font = "bold 11px " + P.FONTS.SANS;
        const days = ["S", "M", "T", "W", "T", "F", "S"];
        for (let i = 0; i < 7; i++) x.fillText(days[i], 22 + i * 35, 116);
        x.font = "15px " + P.FONTS.SERIF;
        // March 1967 starts on a Wednesday
        for (let d = 1; d <= 31; d++) {
          const c = (d + 2) % 7,
            r = Math.floor((d + 2) / 7);
          const cx = 22 + c * 35,
            cy = 142 + r * 34;
          x.fillStyle = "#2a2218";
          x.fillText(String(d), cx, cy);
          if (d === 4) {
            x.strokeStyle = "#b8261e";
            x.lineWidth = 2.5;
            x.beginPath();
            x.ellipse(cx, cy - 5, 15, 12, 0, 0, TAU);
            x.stroke();
            x.fillStyle = "#b8261e";
            x.font = "bold 10px " + P.FONTS.SANS;
            x.fillText("OUI!!", cx, cy + 12);
            x.font = "15px " + P.FONTS.SERIF;
          }
          if (d === 5) {
            x.strokeStyle = "rgba(40,30,20,0.5)";
            x.lineWidth = 1;
            x.beginPath();
            x.moveTo(cx - 12, cy - 14);
            x.lineTo(cx + 12, cy + 6);
            x.stroke();
          }
        }
        // the twelve-ray sun doodled in the margin
        const sx = w - 34,
          sy = h - 30;
        x.strokeStyle = "#1e3a7a";
        x.lineWidth = 1.6;
        x.beginPath();
        x.arc(sx, sy, 6, 0, TAU);
        x.stroke();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          x.beginPath();
          x.moveTo(sx + Math.cos(a) * 9, sy + Math.sin(a) * 9);
          x.lineTo(sx + Math.cos(a) * 15, sy + Math.sin(a) * 15);
          x.stroke();
        }
        P.blotches(x, w, h, P.rng("cal9c"), 14, 0.18);
      }),
      { rough: 0.9 },
    );
  }
  function windowTex() {
    // the view from 9C: 42nd Street at dusk, the dark slab of the Secretariat, a red glow from the sign above
    return P.texMat(
      "tc_9c_view",
      P.canvasTex(
        "tc_9c_view",
        512,
        384,
        (x, w, h) => {
          const g = x.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#2a2438");
          g.addColorStop(0.55, "#6a3a3a");
          g.addColorStop(1, "#1a1418");
          x.fillStyle = g;
          x.fillRect(0, 0, w, h);
          const r = P.rng("9cview");
          for (let i = 0; i < 70; i++) {
            x.fillStyle = "rgba(255,240,220," + r() * 0.6 + ")";
            x.fillRect(r() * w, r() * h * 0.4, 1.5, 1.5);
          }
          x.fillStyle = "#121016";
          x.fillRect(w * 0.55, h * 0.18, w * 0.22, h * 0.82); // the Secretariat slab
          for (let yy = h * 0.2; yy < h; yy += 9)
            for (let xx = w * 0.56; xx < w * 0.76; xx += 7)
              if (r() < 0.04) {
                x.fillStyle = "#e8c070";
                x.fillRect(xx, yy, 3, 4);
              }
          let xx = 0;
          while (xx < w) {
            const bw = 20 + r() * 50,
              bh = 60 + r() * 140;
            x.fillStyle = "#0e0c12";
            x.fillRect(xx, h - bh, bw, bh);
            xx += bw + 3;
          }
          const rg = x.createRadialGradient(w * 0.2, 0, 0, w * 0.2, 0, h * 0.7);
          rg.addColorStop(0, "rgba(255,60,40,0.55)");
          rg.addColorStop(1, "rgba(255,60,40,0)");
          x.fillStyle = rg;
          x.fillRect(0, 0, w, h);
        },
        { clamp: true },
      ),
      { emissive: 0.85, rough: 1 },
    );
  }
  function sunScratchTex() {
    return P.texMat(
      "tc_9c_sun",
      P.canvasTex(
        "tc_9c_sun",
        256,
        256,
        (x, w, h) => {
          x.clearRect(0, 0, w, h);
          const c = w / 2;
          x.strokeStyle = "rgba(232,220,190,0.85)";
          x.lineWidth = 5;
          x.beginPath();
          x.arc(c, c, 34, 0, TAU);
          x.stroke();
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU;
            x.beginPath();
            x.moveTo(c + Math.cos(a) * 46, c + Math.sin(a) * 46);
            x.lineTo(c + Math.cos(a) * 96, c + Math.sin(a) * 96);
            x.stroke();
          }
          x.strokeStyle = "rgba(30,24,20,0.9)";
          x.lineWidth = 9; // crossed out, hard
          x.beginPath();
          x.moveTo(30, 30);
          x.lineTo(w - 30, h - 30);
          x.moveTo(w - 30, 30);
          x.lineTo(30, h - 30);
          x.stroke();
        },
        { clamp: true },
      ),
      { transparent: true, rough: 1 },
    );
  }

  // ------------------------------------------------------------------
  // INTERIOR: apartment 9C + Sol's desk + the Court end of the stair
  // ------------------------------------------------------------------
