// play-inline-417 03 — custom
// Lines 343-464 of readable/play-inline-417.pretty.js (statement-aligned).
  P.water_int = function (x, S, r) {
    x.fillStyle = "#1e2a22";
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 60; i++) {
      const px = r() * S,
        py = r() * S,
        rad = 20 + r() * 80,
        g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, "rgba(60,80,56,0.4)");
      g.addColorStop(1, "rgba(60,80,56,0)");
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
    x.strokeStyle = "rgba(170,200,170,0.18)";
    x.lineWidth = 1.2;
    for (let i = 0; i < 70; i++) {
      const px = r() * S,
        py = r() * S,
        w = 10 + r() * 40;
      x.beginPath();
      x.moveTo(px, py);
      x.quadraticCurveTo(px + w / 2, py - 3, px + w, py);
      x.stroke();
    }
    for (let i = 0; i < 25; i++) {
      x.fillStyle = "rgba(120,130,70,0.35)";
      x.beginPath();
      x.ellipse(r() * S, r() * S, 4 + r() * 16, 2 + r() * 6, r() * 3, 0, 6.3);
      x.fill();
    } // scum
  };

  P.planks_iron = function (x, S, r) {
    const n = 6,
      w = S / n;
    for (let i = 0; i < n; i++) {
      const v = 0.75 + r() * 0.3;
      x.fillStyle = rgba(108 * v, 80 * v, 56 * v, 1);
      x.fillRect(0, i * w, S, w);
      for (let k = 0; k < 10; k++) {
        x.strokeStyle = rgba(50, 34, 20, 0.3);
        x.beginPath();
        const py = i * w + 3 + r() * (w - 6);
        x.moveTo(0, py);
        x.bezierCurveTo(
          S * 0.3,
          py + (r() - 0.5) * 6,
          S * 0.6,
          py + (r() - 0.5) * 6,
          S,
          py,
        );
        x.stroke();
      }
      x.fillStyle = "rgba(20,14,8,0.8)";
      x.fillRect(0, i * w, S, 2);
    }
    for (const px of [S * 0.25, S * 0.75]) {
      x.fillStyle = "rgba(40,36,32,0.85)";
      x.fillRect(px - 6, 0, 12, S);
      for (let py = 8; py < S; py += 20) {
        x.fillStyle = "rgba(90,80,70,0.9)";
        x.beginPath();
        x.arc(px, py, 2.2, 0, 6.3);
        x.fill();
      }
    }
    K.stains(x, 0, 0, S, S, 18, 3801, 0.5, [30, 20, 10]);
    K.grain(x, 0, 0, S, S, 20, 3802);
  };

  const M = K.MATDEF;
  M.clapboard = { custom: "clapboard", tile: [2.4, 2.4], rough: 0.85 };
  M.hull_orange = {
    custom: "hull_orange",
    tile: [6, 6],
    rough: 0.7,
    metal: 0.2,
  };
  M.hull_dark = { custom: "hull_dark", tile: [6, 6], rough: 0.75, metal: 0.25 };
  M.hull_red = { custom: "hull_red", tile: [5, 5], rough: 0.7, metal: 0.2 };
  M.deck = { custom: "deck", tile: [3.2, 3.2], rough: 0.95 };
  M.shutter = { custom: "shutter", tile: [1.2, 1.2], rough: 0.7, metal: 0.35 };
  M.pressed = { custom: "pressed", tile: [2.4, 2.4], rough: 0.6, metal: 0.3 };
  M.slime = { custom: "slime", tile: [2.5, 2.5], rough: 0.35 };
  M.glaze = { custom: "glaze", tile: [1.6, 1.2], rough: 0.35 };
  M.water_int = {
    custom: "water_int",
    tile: [5, 5],
    rough: 0.08,
    metal: 0.4,
    transparent: true,
    opacity: 0.82,
  };
  M.planks_iron = { custom: "planks_iron", tile: [3, 3], rough: 0.9 };

  const A = K.ALIAS;
  Object.assign(A, {
    patina: ["flat", 0x55705f],
    silver: ["shiny", 0xc4c8cc],
    crystal: ["lamp", 0xfff0d8],
    ferry_green: ["metal", 0x3e6a52],
    cream_paint: ["flat", 0xd8ceb0],
    navy_paint: ["flat", 0x24324a],
    canvas_tarp: ["fabric", 0xa8966e],
    canvas_red: ["fabric", 0x8a3a2a],
    canvas_blue: ["fabric", 0x3a4a62],
    canvas_green: ["fabric", 0x4e5e3e],
    rope: ["fabric", 0x9a8460],
    egg: ["flat", 0xd8d0a8],
    shell: ["flat", 0x6a4a2e],
    bone_old: ["plaster", 0xcfc2a2],
    brick_dark: ["brick_brown", 0x8a6a5a],
    granite_pale: ["granite", 0xd2cec6],
    granite_dark: ["granite", 0x6a6660],
    oxblood: ["flat", 0x4a1210],
    ivory: ["flat", 0xe8e0c8],
    walnut: ["wood", 0x4a2e1c],
    paint_olive: ["flat", 0x4a5236],
    fdny_red: ["shiny", 0xa8261c],
    brass_old: ["shiny", 0x8a6a34],
  });
