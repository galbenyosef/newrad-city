// play-inline-201 05 — ctx
// Lines 927-1132 of readable/play-inline-201.pretty.js (statement-aligned).
  function paneDraw(cracked) {
    return (ctx, w, h) => {
      const r = U.rng(cracked ? 61 : 59);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      if (cracked) {
        g.addColorStop(0, "#6a7678");
        g.addColorStop(0.5, "#3a4446");
        g.addColorStop(1, "#1c2224");
      } else {
        g.addColorStop(0, "#b4c0bc");
        g.addColorStop(0.45, "#7d8c8a");
        g.addColorStop(1, "#3c4846");
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const s = ctx.createLinearGradient(0, h, w, 0);
      s.addColorStop(0.35, "rgba(255,255,245,0)");
      s.addColorStop(0.5, "rgba(255,255,245," + (cracked ? 0.08 : 0.2) + ")");
      s.addColorStop(0.62, "rgba(255,255,245,0)");
      ctx.fillStyle = s;
      ctx.fillRect(0, 0, w, h);
      const d = ctx.createLinearGradient(0, h * 0.7, 0, h);
      d.addColorStop(0, "rgba(70,58,40,0)");
      d.addColorStop(1, "rgba(70,58,40,0.55)");
      ctx.fillStyle = d;
      ctx.fillRect(0, h * 0.7, w, h * 0.3);
      for (let i = 0; i < 22; i++) {
        ctx.fillStyle = "rgba(60,50,36," + r() * 0.18 + ")";
        ctx.fillRect(
          r() * w,
          r() * h * 0.4,
          2 + r() * 5,
          h * (0.3 + r() * 0.7),
        );
      } // rain runs
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = "rgba(40,34,26," + r() * 0.3 + ")";
        ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
      }
      if (cracked) {
        const cx = w * (0.3 + r() * 0.4),
          cy = h * (0.3 + r() * 0.4);
        ctx.fillStyle = "#050606"; // punched-out hole
        ctx.beginPath();
        for (let k = 0; k < 9; k++) {
          const a = (k / 9) * TAU,
            rr = 14 + r() * 26;
          ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(225,235,235,0.75)";
        ctx.lineWidth = 1.4;
        for (let k = 0; k < 14; k++) {
          let a = r() * TAU,
            x = cx,
            y = cy;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let j = 0; j < 6; j++) {
            a += (r() - 0.5) * 0.5;
            const l = 12 + r() * 30;
            x += Math.cos(a) * l;
            y += Math.sin(a) * l;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        for (let k = 1; k <= 3; k++) {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            30 + k * 26 + r() * 10,
            r() * TAU,
            r() * TAU + 1.5 + r(),
          );
          ctx.stroke();
        }
      }
      ctx.strokeStyle = "rgba(15,18,18,0.8)";
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, w, h); // glazing gasket
    };
  }
  const CUSTOM_TEX = {
    goo: [192, 192, gooDraw],
    granite_ashlar: [
      512,
      512,
      ashlarDraw({
        base: 0x8e8a82,
        rows: 4,
        cols: 2,
        joint: 4,
        jointCol: 0x55524c,
        vary: 0.12,
        chips: 0.2,
        seed: 21,
        weather: { blotches: 70, dark: 0.18, streaks: 45 },
      }),
    ],
    screen: [256, 192, screenDraw],
    terracotta: [
      512,
      512,
      ashlarDraw({
        base: 0xe4dac2,
        rows: 8,
        cols: 3,
        joint: 3,
        jointCol: 0x9c9280,
        vary: 0.07,
        glaze: true,
        chips: 0.08,
        seed: 3,
        weather: { blotches: 55, dark: 0.1, streaks: 30 },
      }),
    ],
    buffstone: [
      512,
      512,
      ashlarDraw({
        base: 0xc8b08a,
        rows: 5,
        cols: 2,
        joint: 4,
        jointCol: 0x7a6a52,
        vary: 0.1,
        chips: 0.15,
        seed: 5,
      }),
    ],
    sandstone: [
      512,
      512,
      ashlarDraw({
        base: 0x9a6650,
        rows: 6,
        cols: 2,
        colVar: 1,
        joint: 4,
        jointCol: 0x5a4034,
        vary: 0.16,
        chips: 0.25,
        seed: 9,
        weather: { dark: 0.16 },
      }),
    ],
    limestone_fine: [
      512,
      512,
      ashlarDraw({
        base: 0xcdc3a8,
        rows: 6,
        cols: 2,
        joint: 2.5,
        jointCol: 0x8a826e,
        vary: 0.06,
        seed: 13,
      }),
    ],
    // the Met's Indiana-limestone walls: big coursed blocks, warm tone variation, rain streaks & soot blotches
    met_ashlar: [
      512,
      512,
      ashlarDraw({
        base: 0xcdc1a2,
        rows: 4,
        cols: 2,
        joint: 3,
        jointCol: 0x8a826c,
        vary: 0.08,
        chips: 0.12,
        seed: 31,
        weather: { blotches: 60, dark: 0.14, streaks: 70, streak: 0.11 },
      }),
    ],
    schist: [
      512,
      512,
      rubbleDraw({
        base: 0x6c6e66,
        mortar: 0x4a4740,
        rows: 7,
        vary: 0.2,
        seed: 17,
      }),
    ],
    stucco: [256, 256, stuccoDraw],
    marble_floor: [512, 512, marbleFloorDraw],
    glass_pane: [256, 256, paneDraw(false)],
    glass_crack: [256, 256, paneDraw(true)],
  };
  PF.customTex = function (name) {
    const d = CUSTOM_TEX[name];
    if (!d) return null;
    return PF.canvasTex("pf_c_" + name, d[0], d[1], d[2]);
  };

  // -------------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------------
  // key → { src: G.tex/G.mats surface name, custom: PF.customTex name (used when the src is missing, or always with
  //         prefer:'custom'), color (fallback), tint (material colour), rough, metal, uv: metres per tile (fallback),
  //         bump (custom-texture bump scale), emissive, noShadow }
