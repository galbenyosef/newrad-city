// play-inline-292 02 — fillstyle
// Lines 19-335 of readable/play-inline-292.pretty.js (statement-aligned).
  const PM = G._pm2;
  const U = G.util;
  const TAU = Math.PI * 2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  PM.anchorOf = function (poi, name) {
    try {
      return G.pois.getAnchor(poi, name);
    } catch (e) {
      return null;
    }
  };

  // -------------------------------------------------------------------
  // small canvas helpers
  // -------------------------------------------------------------------
  function rnd(seed) {
    return U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  }
  function grime(ctx, w, h, r, amt) {
    amt = amt === undefined ? 1 : amt;
    for (let i = 0; i < 40 * amt; i++) {
      const x = r() * w,
        y = r() * h,
        rr = 6 + r() * 50;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, "rgba(40,30,18," + (0.05 + r() * 0.15) * amt + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (let i = 0; i < 500 * amt; i++) {
      ctx.fillStyle = "rgba(20,14,8," + r() * 0.25 + ")";
      ctx.fillRect(r() * w, r() * h, 1.2, 1.2);
    }
  }
  function crackle(ctx, x0, y0, w, h, r, n) {
    ctx.strokeStyle = "rgba(30,20,10,0.35)";
    ctx.lineWidth = 0.6;
    for (let i = 0; i < n; i++) {
      let x = x0 + r() * w,
        y = y0 + r() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        x += (r() - 0.5) * 18;
        y += (r() - 0.5) * 18;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  PM.m2grime = grime;

  // -------------------------------------------------------------------
  // ART ATLAS: 4×4 original canvases, 256 px each (1024²)
  //  0 grid-of-primaries   1 drip & splatter     2 colour field (red)   3 colour field (dusk)
  //  4 circles & lines     5 floating squares    6 NOCTURNE (quest)     7 cut-out shapes
  //  8 bottle grid (pop)   9 atomic pop panel   10 ration-tin prints    11 night diner
  // 12 blue biomorphs     13 grid of glyphs     14 brute blood canvas  15 empty/slashed canvas
  // -------------------------------------------------------------------
  const ART = [];
  ART[0] = (c, s, r) => {
    // grid of primaries
    c.fillStyle = "#efeadc";
    c.fillRect(0, 0, s, s);
    const xs = [0, 0.22, 0.61, 0.8, 1].map((v) => v * s),
      ys = [0, 0.3, 0.55, 0.9, 1].map((v) => v * s);
    const fills = {
      "0,0": "#c8261c",
      "2,2": "#1e3c8c",
      "3,0": "#e8c21c",
      "1,3": "#e8c21c",
      "3,3": "#111",
    };
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const f = fills[i + "," + j];
        if (f) {
          c.fillStyle = f;
          c.fillRect(xs[i], ys[j], xs[i + 1] - xs[i], ys[j + 1] - ys[j]);
        }
      }
    c.fillStyle = "#111";
    for (const x of xs) c.fillRect(x - 4, 0, 8, s);
    for (const y of ys) c.fillRect(0, y - 4, s, 8);
  };
  ART[1] = (c, s, r) => {
    // drip & splatter
    c.fillStyle = "#d8ceb4";
    c.fillRect(0, 0, s, s);
    const cols = ["#1a1a1a", "#e8e2d0", "#8a5a2a", "#3a4a6a", "#c8a020"];
    for (const col of cols) {
      c.strokeStyle = col;
      c.lineCap = "round";
      for (let k = 0; k < 14; k++) {
        c.lineWidth = 1 + r() * 4;
        c.beginPath();
        let x = r() * s,
          y = r() * s;
        c.moveTo(x, y);
        for (let q = 0; q < 12; q++) {
          x += (r() - 0.5) * 90;
          y += (r() - 0.5) * 90;
          c.quadraticCurveTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 60, x, y);
        }
        c.stroke();
      }
      c.fillStyle = col;
      for (let k = 0; k < 40; k++) {
        c.beginPath();
        c.arc(r() * s, r() * s, 1 + r() * 4, 0, TAU);
        c.fill();
      }
    }
  };
  function field(c, s, r, bg, a, b) {
    c.fillStyle = bg;
    c.fillRect(0, 0, s, s);
    const blk = (y0, y1, col) => {
      for (let i = 0; i < 6; i++) {
        c.fillStyle = col;
        c.globalAlpha = 0.18;
        c.fillRect(
          s * 0.08 + (r() - 0.5) * 6,
          y0 + (r() - 0.5) * 6,
          s * 0.84,
          y1 - y0,
        );
      }
      c.globalAlpha = 1;
    };
    blk(s * 0.08, s * 0.5, a);
    blk(s * 0.58, s * 0.92, b);
  }
  ART[2] = (c, s, r) => field(c, s, r, "#6a1a14", "#c8401c", "#2a0a0a");
  ART[3] = (c, s, r) => field(c, s, r, "#2a2440", "#b86a2a", "#4a3a6a");
  ART[4] = (c, s, r) => {
    // circles & lines
    c.fillStyle = "#e4dcc4";
    c.fillRect(0, 0, s, s);
    const cols = [
      "#1e3c8c",
      "#c8261c",
      "#e8b01c",
      "#2a7a4a",
      "#111",
      "#8a3a8a",
    ];
    for (let i = 0; i < 9; i++) {
      c.fillStyle = cols[i % cols.length];
      c.globalAlpha = 0.85;
      c.beginPath();
      c.arc(r() * s, r() * s, 8 + r() * 40, 0, TAU);
      c.fill();
      c.globalAlpha = 1;
      c.strokeStyle = "#111";
      c.lineWidth = 2;
      c.stroke();
    }
    c.strokeStyle = "#111";
    for (let i = 0; i < 10; i++) {
      c.lineWidth = 1 + r() * 3;
      c.beginPath();
      c.moveTo(r() * s, r() * s);
      c.lineTo(r() * s, r() * s);
      c.stroke();
    }
    c.fillStyle = "#111";
    c.beginPath();
    c.moveTo(s * 0.2, s * 0.8);
    c.lineTo(s * 0.35, s * 0.45);
    c.lineTo(s * 0.5, s * 0.8);
    c.fill();
  };
  ART[5] = (c, s, r) => {
    // floating squares
    c.fillStyle = "#ece6d6";
    c.fillRect(0, 0, s, s);
    const cols = ["#111", "#c8261c", "#1e3c8c", "#e8b01c", "#555"];
    for (let i = 0; i < 12; i++) {
      c.save();
      c.translate(r() * s, r() * s);
      c.rotate((r() - 0.5) * 1.2);
      c.fillStyle = cols[i % cols.length];
      const w = 10 + r() * (i === 0 ? 110 : 60),
        h = 6 + r() * 30;
      c.fillRect(-w / 2, -h / 2, w, i === 0 ? w : h);
      c.restore();
    }
  };
  ART[6] = (c, s, r) => {
    // "NOCTURNE FOR A DYING CITY" — the quest painting: swirling night over a skyline
    const g = c.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, "#0c1a4a");
    g.addColorStop(0.7, "#1e3a7a");
    g.addColorStop(1, "#0a0e1a");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    c.lineCap = "round";
    for (let k = 0; k < 260; k++) {
      // swirling brush strokes
      const cx = s * 0.5 + Math.sin(k * 0.13) * s * 0.3,
        cy = s * 0.32 + Math.cos(k * 0.21) * s * 0.18,
        rr = 8 + (k % 23) * 2.2;
      const a0 = r() * TAU;
      c.strokeStyle = ["#4a6ac8", "#8aa8e8", "#2a3a8a", "#c8d8f0", "#e8d060"][
        k % 5
      ];
      c.globalAlpha = 0.5;
      c.lineWidth = 2 + r() * 3;
      c.beginPath();
      c.arc(cx, cy, rr, a0, a0 + 1 + r() * 1.5);
      c.stroke();
    }
    c.globalAlpha = 1;
    // a green-glowing moon (a mushroom cloud, if you look twice)
    const mg = c.createRadialGradient(
      s * 0.78,
      s * 0.2,
      2,
      s * 0.78,
      s * 0.2,
      36,
    );
    mg.addColorStop(0, "#f0f0a0");
    mg.addColorStop(0.4, "#b8e070");
    mg.addColorStop(1, "rgba(120,200,80,0)");
    c.fillStyle = mg;
    c.fillRect(s * 0.6, 0, s * 0.4, s * 0.45);
    c.fillStyle = "#d8e8a0";
    c.beginPath();
    c.ellipse(s * 0.78, s * 0.19, 16, 10, 0, 0, TAU);
    c.fill();
    c.fillRect(s * 0.775, s * 0.2, 6, 26);
    for (let i = 0; i < 14; i++) {
      c.fillStyle = "#f0e070";
      c.beginPath();
      c.arc(r() * s, r() * s * 0.55, 1.5 + r() * 3, 0, TAU);
      c.fill();
    }
    // skyline silhouette with a few lit windows
    c.fillStyle = "#05070c";
    let x = 0;
    while (x < s) {
      const w = 10 + r() * 26,
        h = 40 + r() * 90;
      c.fillRect(x, s - h, w, h);
      if (r() < 0.3) {
        c.beginPath();
        c.moveTo(x, s - h);
        c.lineTo(x + w / 2, s - h - 20 - r() * 30);
        c.lineTo(x + w, s - h);
        c.fill();
      }
      for (let k = 0; k < 5; k++) {
        c.fillStyle = "#e8c060";
        c.fillRect(x + r() * w, s - r() * h, 2, 3);
        c.fillStyle = "#05070c";
      }
      x += w + 1;
    }
    // a tall cypress-like flame of a ruined spire on the left
    c.fillStyle = "#0a1408";
    c.beginPath();
    c.moveTo(s * 0.12, s);
    c.quadraticCurveTo(s * 0.02, s * 0.5, s * 0.16, s * 0.18);
    c.quadraticCurveTo(s * 0.26, s * 0.55, s * 0.22, s);
    c.fill();
  };
  ART[7] = (c, s, r) => {
    // cut-out shapes
    c.fillStyle = "#e8e0cc";
    c.fillRect(0, 0, s, s);
    const cols = ["#1e48a8", "#1e48a8", "#e86a1c", "#2a8a4a", "#111"];
    for (let i = 0; i < 9; i++) {
      c.fillStyle = cols[i % cols.length];
      c.beginPath();
      const cx = r() * s,
        cy = r() * s,
        R = 20 + r() * 35;
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * TAU,
          rr = R * (k % 2 ? 0.45 + r() * 0.2 : 1);
        c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      c.closePath();
      c.fill();
    }
  };
  ART[8] = (c, s, r) => {
    // pop grid of cola bottles
    c.fillStyle = "#f0e8d8";
    c.fillRect(0, 0, s, s);
    const n = 5,
      cw = s / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const x = i * cw + cw / 2,
          y = j * cw + cw / 2;
        c.fillStyle = r() < 0.15 ? "#c8261c" : "#2a1a14";
        c.beginPath();
        c.moveTo(x - 5, y - 22);
        c.lineTo(x + 5, y - 22);
        c.lineTo(x + 5, y - 12);
        c.quadraticCurveTo(x + 14, y - 4, x + 12, y + 20);
        c.lineTo(x - 12, y + 20);
        c.quadraticCurveTo(x - 14, y - 4, x - 5, y - 12);
        c.fill();
        c.fillStyle = "#e8e0d0";
        c.fillRect(x - 11, y, 22, 7);
        c.fillStyle = "#c8261c";
        c.beginPath();
        c.arc(x, y - 23, 4, 0, TAU);
        c.fill();
      }
  };
