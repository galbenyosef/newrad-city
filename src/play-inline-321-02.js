// play-inline-321 02 — fillstyle
// Lines 15-346 of readable/play-inline-321.pretty.js (statement-aligned).
  const PF = G._pch;
  const U = G.util;
  const TAU = Math.PI * 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const D = (PF.dress = {});

  // -------------------------------------------------------------------
  // Paintings atlas: 4 × 2 canvases of 256 px, all original procedural art
  // -------------------------------------------------------------------
  function paintAtlas(ctx, W, H) {
    const S = 256;
    const r = U.rng(4242);
    const cell = (i, fn) => {
      const x = (i % 4) * S,
        y = Math.floor(i / 4) * S;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, S, S);
      ctx.clip();
      ctx.translate(x, y);
      fn(ctx, S);
      ctx.restore();
    };
    const grad = (c, y0, y1, a, b) => {
      const g = c.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, a);
      g.addColorStop(1, b);
      return g;
    };
    // 0 — Hudson River pastoral: golden sky, blue mountains, river, trees
    cell(0, (c, s) => {
      c.fillStyle = grad(c, 0, s * 0.6, "#e8c888", "#b8a878");
      c.fillRect(0, 0, s, s);
      c.fillStyle = "rgba(255,240,200,0.7)";
      c.beginPath();
      c.arc(s * 0.7, s * 0.3, 22, 0, TAU);
      c.fill();
      c.fillStyle = "#6a7a8a";
      c.beginPath();
      c.moveTo(0, s * 0.55);
      c.lineTo(s * 0.25, s * 0.35);
      c.lineTo(s * 0.45, s * 0.5);
      c.lineTo(s * 0.7, s * 0.38);
      c.lineTo(s, s * 0.55);
      c.lineTo(s, s);
      c.lineTo(0, s);
      c.fill();
      c.fillStyle = "#4a5a3a";
      c.fillRect(0, s * 0.6, s, s * 0.4);
      c.fillStyle = "#8ab0c0";
      c.beginPath();
      c.moveTo(s * 0.3, s);
      c.quadraticCurveTo(s * 0.5, s * 0.7, s * 0.62, s * 0.6);
      c.lineTo(s * 0.7, s * 0.6);
      c.quadraticCurveTo(s * 0.6, s * 0.75, s * 0.6, s);
      c.fill();
      for (let i = 0; i < 9; i++) {
        c.fillStyle = "#2a3a22";
        c.beginPath();
        c.ellipse(
          r() * s * 0.3,
          s * 0.62 + r() * 30,
          14 + r() * 14,
          26 + r() * 20,
          0,
          0,
          TAU,
        );
        c.fill();
      }
    });
    // 1 — portrait of a stern 18th-century gentleman
    cell(1, (c, s) => {
      c.fillStyle = grad(c, 0, s, "#3a2a1c", "#1a120c");
      c.fillRect(0, 0, s, s);
      c.fillStyle = "#1c1c22";
      c.beginPath();
      c.moveTo(s * 0.2, s);
      c.quadraticCurveTo(s * 0.25, s * 0.6, s * 0.5, s * 0.58);
      c.quadraticCurveTo(s * 0.75, s * 0.6, s * 0.8, s);
      c.fill();
      c.fillStyle = "#e8e0d0";
      c.beginPath();
      c.moveTo(s * 0.42, s * 0.62);
      c.lineTo(s * 0.5, s * 0.78);
      c.lineTo(s * 0.58, s * 0.62);
      c.fill();
      c.fillStyle = "#d0a080";
      c.beginPath();
      c.ellipse(s * 0.5, s * 0.42, s * 0.12, s * 0.16, 0, 0, TAU);
      c.fill();
      c.fillStyle = "#d8d4cc";
      c.beginPath();
      c.ellipse(s * 0.5, s * 0.33, s * 0.15, s * 0.1, 0, Math.PI, TAU);
      c.fill(); // powdered wig
      c.fillStyle = "#2a1a10";
      c.fillRect(s * 0.44, s * 0.4, 8, 3);
      c.fillRect(s * 0.53, s * 0.4, 8, 3);
      c.fillRect(s * 0.47, s * 0.5, 14, 2);
    });
    // 2 — seascape with a sailing ship in a storm
    cell(2, (c, s) => {
      c.fillStyle = grad(c, 0, s * 0.55, "#4a4a48", "#9a9078");
      c.fillRect(0, 0, s, s);
      c.fillStyle = grad(c, s * 0.55, s, "#3a5050", "#1a2a2a");
      c.fillRect(0, s * 0.55, s, s * 0.45);
      for (let i = 0; i < 14; i++) {
        c.fillStyle = "rgba(230,230,210," + (0.2 + r() * 0.3) + ")";
        c.beginPath();
        c.ellipse(
          r() * s,
          s * 0.6 + r() * s * 0.35,
          20 + r() * 20,
          3,
          r() - 0.5,
          0,
          TAU,
        );
        c.fill();
      }
      c.fillStyle = "#2a1a10";
      c.beginPath();
      c.moveTo(s * 0.35, s * 0.6);
      c.lineTo(s * 0.7, s * 0.6);
      c.lineTo(s * 0.65, s * 0.68);
      c.lineTo(s * 0.4, s * 0.68);
      c.fill();
      c.fillStyle = "#d8d0b8";
      for (const [x, h] of [
        [0.45, 0.25],
        [0.55, 0.3],
        [0.63, 0.2],
      ]) {
        c.beginPath();
        c.moveTo(s * x, s * 0.58);
        c.lineTo(s * x, s * (0.58 - h));
        c.lineTo(s * (x + 0.07), s * 0.56);
        c.fill();
      }
    });
    // 3 — still life: fruit bowl, jug and a Fizzo Cola bottle (period piece, 1961)
    cell(3, (c, s) => {
      c.fillStyle = grad(c, 0, s, "#2a2418", "#141008");
      c.fillRect(0, 0, s, s);
      c.fillStyle = "#5a3a22";
      c.fillRect(0, s * 0.7, s, s * 0.3);
      c.fillStyle = "#c8b890";
      c.beginPath();
      c.ellipse(s * 0.35, s * 0.68, 50, 14, 0, 0, TAU);
      c.fill();
      for (const [x, y, col] of [
        [0.28, 0.62, "#b83a22"],
        [0.36, 0.6, "#c8a030"],
        [0.43, 0.63, "#6a8a2a"],
        [0.33, 0.56, "#8a2a4a"],
      ]) {
        c.fillStyle = col;
        c.beginPath();
        c.arc(s * x, s * y, 14, 0, TAU);
        c.fill();
      }
      c.fillStyle = "#8a8070";
      c.beginPath();
      c.ellipse(s * 0.66, s * 0.55, 22, 42, 0, 0, TAU);
      c.fill();
      c.fillStyle = "#3a2418";
      c.fillRect(s * 0.82, s * 0.45, 12, 44);
      c.fillStyle = "#c83020";
      c.fillRect(s * 0.82, s * 0.55, 12, 10);
    });
    // 4 — non-objective composition (circles & lines) for the Guggenheim
    cell(4, (c, s) => {
      c.fillStyle = "#e8dcc0";
      c.fillRect(0, 0, s, s);
      const cols = ["#c8302a", "#2a4a8a", "#e8b830", "#1a1a1a", "#3a8a5a"];
      for (let i = 0; i < 9; i++) {
        c.fillStyle = cols[i % 5];
        c.globalAlpha = 0.85;
        c.beginPath();
        c.arc(r() * s, r() * s, 8 + r() * 40, 0, TAU);
        c.fill();
      }
      c.globalAlpha = 1;
      c.strokeStyle = "#1a1a1a";
      c.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        c.beginPath();
        c.moveTo(r() * s, r() * s);
        c.lineTo(r() * s, r() * s);
        c.stroke();
      }
      c.strokeStyle = "#c8302a";
      c.lineWidth = 6;
      c.beginPath();
      c.arc(s * 0.6, s * 0.4, 50, 0.5, 3.5);
      c.stroke();
    });
    // 5 — primary-colour grid composition
    cell(5, (c, s) => {
      c.fillStyle = "#ece6d6";
      c.fillRect(0, 0, s, s);
      const blocks = [
        [0, 0, 0.35, 0.4, "#c8302a"],
        [0.72, 0.62, 0.28, 0.38, "#2a4a8a"],
        [0.35, 0.82, 0.37, 0.18, "#e8b830"],
      ];
      for (const bl of blocks) {
        c.fillStyle = bl[4];
        c.fillRect(bl[0] * s, bl[1] * s, bl[2] * s, bl[3] * s);
      }
      c.fillStyle = "#141414";
      for (const x of [0.35, 0.72]) c.fillRect(x * s - 4, 0, 8, s);
      for (const y of [0.4, 0.62, 0.82]) c.fillRect(0, y * s - 4, s, 8);
    });
    // 6 — "Atomic Dawn": Civil Defense commissioned mural study (family watching a mushroom cloud, 1965)
    cell(6, (c, s) => {
      c.fillStyle = grad(c, 0, s, "#f0a040", "#6a2a2a");
      c.fillRect(0, 0, s, s);
      c.fillStyle = "#f8e8b0";
      c.beginPath();
      c.ellipse(s * 0.62, s * 0.3, 44, 30, 0, 0, TAU);
      c.fill();
      c.fillRect(s * 0.6, s * 0.3, 14, s * 0.4);
      c.fillStyle = "#e8c870";
      c.beginPath();
      c.ellipse(s * 0.62, s * 0.72, 60, 12, 0, 0, TAU);
      c.fill();
      c.fillStyle = "#2e2a2a"; // silhouettes of a family in shelter coveralls
      for (const [x, h] of [
        [0.12, 0.3],
        [0.2, 0.26],
        [0.27, 0.16],
        [0.33, 0.14],
      ]) {
        c.fillRect(s * x, s * (1 - h), 14, s * h);
        c.beginPath();
        c.arc(s * x + 7, s * (1 - h) - 8, 9, 0, TAU);
        c.fill();
      }
      c.fillStyle = "#c87838";
      c.fillRect(s * 0.12, s * 0.83, s * 0.26, 4);
    });
    // 7 — Revolutionary-war river crossing in a winter dusk
    cell(7, (c, s) => {
      c.fillStyle = grad(c, 0, s * 0.6, "#c8a878", "#5a5a60");
      c.fillRect(0, 0, s, s);
      c.fillStyle = "#6a7a80";
      c.fillRect(0, s * 0.6, s, s * 0.4);
      for (let i = 0; i < 12; i++) {
        c.fillStyle = "#d8dce0";
        c.fillRect(r() * s, s * 0.62 + r() * s * 0.35, 18 + r() * 20, 5);
      }
      c.fillStyle = "#2a2018";
      c.beginPath();
      c.moveTo(s * 0.2, s * 0.7);
      c.lineTo(s * 0.8, s * 0.68);
      c.lineTo(s * 0.75, s * 0.76);
      c.lineTo(s * 0.25, s * 0.77);
      c.fill();
      for (let i = 0; i < 7; i++) {
        const x = 0.28 + i * 0.07;
        c.fillRect(s * x, s * (0.56 + (i % 2) * 0.03), 10, s * 0.14);
      }
      c.fillStyle = "#8a2a24";
      c.fillRect(s * 0.6, s * 0.4, 30, 18);
      c.fillStyle = "#2a2018";
      c.fillRect(s * 0.59, s * 0.4, 3, s * 0.3);
    });
    // aging: yellowed varnish, craquelure, grime, bullet holes & tears
    ctx.fillStyle = "rgba(160,120,40,0.18)";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(20,12,4,0.25)";
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 700; i++) {
      let x = r() * W,
        y = r() * H;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 3; k++) {
        x += (r() - 0.5) * 14;
        y += (r() - 0.5) * 14;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 40; i++) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      void g;
      ctx.fillStyle = "rgba(30,22,10," + (0.08 + r() * 0.2) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * W,
        r() * H,
        10 + r() * 50,
        6 + r() * 30,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
    for (let i = 0; i < 14; i++) {
      const x = r() * W,
        y = r() * H;
      ctx.fillStyle = "#0c0a08";
      ctx.beginPath();
      ctx.arc(x, y, 2 + r() * 3, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(230,220,200,0.5)";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, TAU);
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++) {
      const x = r() * W,
        y = r() * H;
      ctx.fillStyle = "rgba(15,12,8,0.9)";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 30 + r() * 30, y + 4);
      ctx.lineTo(x + 10, y + 50 + r() * 30);
      ctx.fill();
    }
  }
  D.paintingsKey = function () {
    return PF.texMat(
      "paintings",
      PF.canvasTex("pch_paintings", 1024, 512, paintAtlas),
      { rough: 0.7 },
    );
  };
  /** Framed painting on a wall. idx 0..7, facing ry (0 → +Z). (x,y,z) = centre on the wall surface. */
