// play-inline-261 02 — ctx
// Lines 17-265 of readable/play-inline-261.pretty.js (statement-aligned).
  const P = G._ues,
    U = G.util;
  const TAU = P.TAU,
    PI = P.PI,
    HP = P.HP;
  const D = (P.dress = {});

  // ---------------------------------------------------------------
  // Paintings atlas (8 cells, 4×2) — original art, 1950s-museum mood
  // ---------------------------------------------------------------
  D.paintingTex = function () {
    return P.canvasTex("ues_paintings", 1024, 512, (ctx, w, h) => {
      const r = P.rng("paint");
      const cw = w / 4,
        ch = h / 2;
      const scenes = [
        (x, y) => {
          // Central Park in autumn
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#9ab4c8");
          g.addColorStop(0.55, "#e8d8a8");
          g.addColorStop(0.56, "#6a7a3a");
          g.addColorStop(1, "#3a4420");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 26; i++) {
            ctx.fillStyle = ["#c86a28", "#d8a030", "#8a3a1a", "#b88a30"][i % 4];
            ctx.beginPath();
            ctx.arc(
              x + r() * cw,
              y + ch * (0.45 + r() * 0.2),
              10 + r() * 22,
              0,
              TAU,
            );
            ctx.fill();
          }
          ctx.fillStyle = "#6a7a8a";
          ctx.fillRect(x + cw * 0.1, y + ch * 0.62, cw * 0.8, ch * 0.08);
        },
        (x, y) => {
          // portrait of a stern patron
          ctx.fillStyle = "#2a2016";
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#1a1410";
          ctx.beginPath();
          ctx.ellipse(
            x + cw / 2,
            y + ch * 0.95,
            cw * 0.36,
            ch * 0.4,
            0,
            0,
            TAU,
          );
          ctx.fill();
          ctx.fillStyle = "#c89a78";
          ctx.beginPath();
          ctx.ellipse(
            x + cw / 2,
            y + ch * 0.42,
            cw * 0.14,
            ch * 0.2,
            0,
            0,
            TAU,
          );
          ctx.fill();
          ctx.fillStyle = "#d8d0c0";
          ctx.fillRect(x + cw * 0.44, y + ch * 0.62, cw * 0.12, ch * 0.1);
          ctx.fillStyle = "#3a2a1a";
          ctx.fillRect(x + cw * 0.38, y + ch * 0.2, cw * 0.24, ch * 0.08);
        },
        (x, y) => {
          // harbour with liners
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#d8b888");
          g.addColorStop(0.6, "#8aa0a8");
          g.addColorStop(1, "#3a5060");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#2a2a2a";
          ctx.fillRect(x + cw * 0.2, y + ch * 0.5, cw * 0.5, ch * 0.1);
          ctx.fillStyle = "#a83a2a";
          ctx.fillRect(x + cw * 0.3, y + ch * 0.38, cw * 0.06, ch * 0.12);
          ctx.fillRect(x + cw * 0.45, y + ch * 0.38, cw * 0.06, ch * 0.12);
          ctx.fillStyle = "#6a6a70";
          for (let i = 0; i < 5; i++)
            ctx.fillRect(
              x + cw * (0.72 + i * 0.05),
              y + ch * (0.3 - i * 0.02),
              cw * 0.04,
              ch * (0.3 + i * 0.02),
            );
        },
        (x, y) => {
          // still life
          ctx.fillStyle = "#3a2e22";
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#6a4a2a";
          ctx.fillRect(x, y + ch * 0.7, cw, ch * 0.3);
          ctx.fillStyle = "#a82a20";
          ctx.beginPath();
          ctx.arc(x + cw * 0.35, y + ch * 0.62, 22, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#d8b040";
          ctx.beginPath();
          ctx.arc(x + cw * 0.55, y + ch * 0.64, 18, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#8ab0a0";
          ctx.fillRect(x + cw * 0.62, y + ch * 0.3, cw * 0.1, ch * 0.4);
        },
        (x, y) => {
          // savanna sketch
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#e8c888");
          g.addColorStop(0.6, "#d8a860");
          g.addColorStop(1, "#8a6a3a");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#3a2a1a";
          ctx.fillRect(x + cw * 0.6, y + ch * 0.35, 5, ch * 0.3);
          ctx.beginPath();
          ctx.ellipse(x + cw * 0.61, y + ch * 0.33, 50, 12, 0, 0, TAU);
          ctx.fill();
        },
        (x, y) => {
          // abstract modern
          ctx.fillStyle = "#e8e0d0";
          ctx.fillRect(x, y, cw, ch);
          const cols = ["#b8302a", "#1a3a8a", "#e8c030", "#1a1a1a"];
          for (let i = 0; i < 7; i++) {
            ctx.fillStyle = cols[i % 4];
            ctx.fillRect(
              x + r() * cw * 0.8,
              y + r() * ch * 0.8,
              20 + r() * 80,
              10 + r() * 60,
            );
          }
        },
        (x, y) => {
          // skyline at night
          ctx.fillStyle = "#10182a";
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 14; i++) {
            const bw = 12 + r() * 20,
              bh = 30 + r() * 140;
            ctx.fillStyle = "#1e2436";
            ctx.fillRect(x + (i * cw) / 14, y + ch - bh, bw, bh);
            for (let k = 0; k < 8; k++) {
              ctx.fillStyle = r() < 0.5 ? "#e8c870" : "#2a2a3a";
              ctx.fillRect(
                x + (i * cw) / 14 + 3 + r() * (bw - 6),
                y + ch - bh + r() * bh,
                2,
                3,
              );
            }
          }
        },
        (x, y) => {
          // lady with parasol
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#bcd0d8");
          g.addColorStop(1, "#8aa060");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#f0e8e0";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.5, y + ch * 0.35);
          ctx.lineTo(x + cw * 0.4, y + ch * 0.95);
          ctx.lineTo(x + cw * 0.6, y + ch * 0.95);
          ctx.fill();
          ctx.fillStyle = "#c86a6a";
          ctx.beginPath();
          ctx.arc(x + cw * 0.46, y + ch * 0.28, 36, PI, TAU);
          ctx.fill();
        },
      ];
      scenes.forEach((f, i) => {
        const x = (i % 4) * cw,
          y = Math.floor(i / 4) * ch;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cw, ch);
        ctx.clip();
        f(x, y);
        P.blotches(ctx, cw, ch, r, 0);
        ctx.restore();
      });
      // varnish yellowing + craquelure
      ctx.fillStyle = "rgba(120,90,30,0.18)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(30,20,10,0.25)";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 400; i++) {
        const x = r() * w,
          y = r() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (r() - 0.5) * 16, y + (r() - 0.5) * 16);
        ctx.stroke();
      }
    });
  };
  /** Framed painting (cell 0..7), facing ry (0 → +z). */
  D.painting = function (b, x, y, z, w, h, ry, cell, o) {
    o = o || {};
    const k = P.texMat("paintings", D.paintingTex(), { rough: 0.6 });
    const cx = cell % 4,
      cy = Math.floor(cell / 4);
    const m = P.m4(x, y, z, ry);
    b.geo(
      k,
      new THREE.PlaneGeometry(w, h),
      m.clone().multiply(P.m4(0, 0, 0.035)),
      {
        uv: "keep",
        uvRect: [cx / 4, 1 - (cy + 1) / 2, (cx + 1) / 4, 1 - cy / 2],
        noAO: true,
        grime: 0.05,
      },
    );
    const fk = o.frame || "gold",
      ft = o.ft || 0.09;
    for (const s of [-1, 1]) {
      b.geo(
        fk,
        new THREE.BoxGeometry(w + ft * 2, ft, 0.07),
        m.clone().multiply(P.m4(0, s * (h / 2 + ft / 2), 0.035)),
        { noAO: true },
      );
      b.geo(
        fk,
        new THREE.BoxGeometry(ft, h, 0.07),
        m.clone().multiply(P.m4(s * (w / 2 + ft / 2), 0, 0.035)),
        { noAO: true },
      );
    }
  };

  // ---------------------------------------------------------------
  // Skeletons: generic vertebrate from a spine polyline
  // ---------------------------------------------------------------
  /**
   * spec: {pts:[[x,y,z]...] tail tip → neck end, v (vertebra size), ribs:[t0,t1], ribLen, skull:{len,h,w,open, horns},
   *        legs:[{t, femur, tibia, meta, spread, fwd (knee dir sign)}], arms:[{t, upper, lower, hand, claws}], mount (steel rods), key}
   */
