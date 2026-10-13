/* src/poi_financial/02_dress.js */
/* =====================================================================
 * LANDMARKS B — set dressing kit (interiors & clutter)
 * Paintings atlas (8 procedural, weathered canvases), framed paintings,
 * chairs (upright / toppled), paper drifts, market stalls with striped
 * awnings, hanging shop signs, string lights, CRT monitor banks,
 * crate stacks, bottle shelves, fluorescent fixtures, cable runs,
 * rubble drifts, mattresses. Everything goes into a Batch (merged).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pf) return;
  const PF = G._pf;
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
    // 3 — still life: fruit bowl, jug and a Fizzo Cola bottle (period piece, 2061)
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
    // 6 — "Atomic Dawn": a Civil Defense poster study (a family in Sunday coats watching a distant mushroom cloud, 1962)
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
      c.fillStyle = "#2a2420"; // silhouettes of a family in dark Sunday coats
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
      c.fillStyle = "#c84030";
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
      PF.canvasTex("pf_paintings", 1024, 512, paintAtlas),
      { rough: 0.7 },
    );
  };
  /** Framed painting on a wall. idx 0..7, facing ry (0 → +Z). (x,y,z) = centre on the wall surface. */
  D.painting = function (b, idx, x, y, z, w, h, ry, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const fk = opts.frame || "gilt";
    const t = 0.12;
    b.box(fk, x + s * 0.04, y - h / 2 - t, z + c * 0.04, w + 2 * t, t, 0.1, {
      ry,
      seg: false,
      grime: 0.3,
    });
    b.box(fk, x + s * 0.04, y + h / 2, z + c * 0.04, w + 2 * t, t, 0.1, {
      ry,
      seg: false,
      grime: 0.3,
    });
    for (const sg of [-1, 1])
      b.box(
        fk,
        x + s * 0.04 + c * sg * (w / 2 + t / 2),
        y - h / 2,
        z + c * 0.04 - s * sg * (w / 2 + t / 2),
        t,
        h,
        0.1,
        { ry, seg: false, grime: 0.3 },
      );
    const i = idx % 8,
      u0 = (i % 4) / 4,
      v0 = Math.floor(i / 4) === 0 ? 0.5 : 0;
    b.quad(D.paintingsKey(), x + s * 0.03, y, z + c * 0.03, w, h, {
      ry,
      uvRect: [u0, v0, u0 + 0.25, v0 + 0.5],
      grime: 0.2,
      rz: opts.tilt || 0,
    });
  };

  // -------------------------------------------------------------------
  // Furniture & clutter
  // -------------------------------------------------------------------
  /** Wooden / steel chair. fallen: lying on its back. */
  D.chair = function (b, x, y, z, ry, fallen, key) {
    key = key || "rotten";
    const M = PF.m4(
      x,
      y + (fallen ? 0.24 : 0),
      z,
      ry,
      fallen ? -Math.PI / 2 + 0.1 : 0,
      0,
    );
    const add = (g, m, k) =>
      b.add(k || key, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    add(new THREE.BoxGeometry(0.46, 0.05, 0.44), PF.m4(0, 0.46, 0));
    add(
      new THREE.BoxGeometry(0.46, 0.5, 0.04),
      PF.m4(0, 0.73, -0.21, 0, -0.08),
    );
    for (const [dx, dz] of [
      [-0.2, -0.19],
      [0.2, -0.19],
      [-0.2, 0.19],
      [0.2, 0.19],
    ])
      add(new THREE.BoxGeometry(0.04, 0.46, 0.04), PF.m4(dx, 0.23, dz), "iron");
  };
  /** Scattered paper sheets (ticker tape, ledgers, currency) around (cx, cz). */
  D.papers = function (b, cx, y, cz, radius, n, seed) {
    const r = PF.rng(seed || cx * 7 + cz * 3);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * radius;
      const g = new THREE.PlaneGeometry(0.22 + r() * 0.12, 0.3 + r() * 0.1);
      g.rotateX(-Math.PI / 2);
      b.add("paper", g, {
        m: PF.m4(
          cx + Math.cos(a) * d,
          y + 0.012 + r() * 0.02,
          cz + Math.sin(a) * d,
          r() * TAU,
          (r() - 0.5) * 0.15,
          (r() - 0.5) * 0.15,
        ),
        uv: "keep",
        grime: 0.35,
        noAO: true,
      });
    }
  };
  /** Market stall: counter, 4 posts, striped canvas awning, hanging sign, goods. */
  D.stall = function (b, x, z, ry, w, d, opts) {
    opts = opts || {};
    const r = PF.rng(opts.seed || x * 5 + z * 13);
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    const y0 = opts.y || 0;
    // counter (front at local +Z)
    const [cx, cz] = P(0, d / 2 - 0.35);
    b.box(opts.counterKey || "planks", cx, y0, cz, w, 1.05, 0.7, {
      ry,
      seg: false,
      grime: 0.55,
    });
    b.box("rust", cx, y0 + 1.05, cz, w + 0.1, 0.06, 0.8, { ry, seg: false });
    PF.col(cx, cz, w, 0.7, y0, y0 + 1.1, ry, {
      walkable: false,
      surface: "wood",
    });
    // posts
    for (const [lx, lz] of [
      [-w / 2, d / 2 - 0.1],
      [w / 2, d / 2 - 0.1],
      [-w / 2, -d / 2],
      [w / 2, -d / 2],
    ]) {
      const [px, pz] = P(lx, lz);
      b.box("rust", px, y0, pz, 0.1, 2.6 + (lz < 0 ? 0.3 : 0), 0.1, {
        ry,
        seg: false,
      });
    }
    // striped awning: alternating stripes, sloped toward the front
    const stripes = Math.max(3, Math.round(w / 0.5));
    const k1 = opts.awning || (r() < 0.5 ? "stripe_red" : "awning_green"),
      k2 = "stripe_cream";
    for (let i = 0; i < stripes; i++) {
      const lx = -w / 2 + ((i + 0.5) * w) / stripes;
      const [ax, az] = P(lx, 0.1);
      b.box(
        i % 2 ? k2 : k1,
        ax,
        y0 + 2.62,
        az,
        w / stripes + 0.01,
        0.04,
        d + 0.5,
        { ry, rx: 0.18, seg: false, grime: 0.6 },
      );
    }
    // valance flaps along the front
    for (let i = 0; i < stripes; i++) {
      const lx = -w / 2 + ((i + 0.5) * w) / stripes;
      const [ax, az] = P(lx, d / 2 + 0.33);
      b.box(i % 2 ? k2 : k1, ax, y0 + 2.2, az, w / stripes - 0.03, 0.32, 0.03, {
        ry,
        seg: false,
        grime: 0.6,
      });
    }
    // goods on the counter
    const goods = opts.goods || "cans";
    for (let i = 0; i < Math.round(w * 2.2); i++) {
      const lx = -w / 2 + 0.25 + r() * (w - 0.5);
      const [gx, gz] = P(lx, d / 2 - 0.35 + (r() - 0.5) * 0.4);
      if (goods === "cans")
        b.cyl(
          r() < 0.5 ? "paint_red" : "chrome",
          gx,
          y0 + 1.11,
          gz,
          0.06,
          0.06,
          0.14,
          6,
          { hSeg: 1 },
        );
      else if (goods === "bottles") {
        b.cyl(
          r() < 0.3 ? "paint_red" : "glass_dark",
          gx,
          y0 + 1.11,
          gz,
          0.05,
          0.06,
          0.24,
          6,
          { hSeg: 1 },
        );
      } else if (goods === "guns")
        b.box("iron", gx, y0 + 1.11, gz, 0.6, 0.06, 0.14, {
          ry: ry + r() * 0.5,
          seg: false,
        });
      else if (goods === "meds")
        b.box(
          r() < 0.5 ? "paint_cream" : "paint_red",
          gx,
          y0 + 1.11,
          gz,
          0.22,
          0.1,
          0.14,
          { ry: ry + r(), seg: false },
        );
      else if (goods === "junk")
        b.box(
          r() < 0.5 ? "rust" : "panel",
          gx,
          y0 + 1.11,
          gz,
          0.2 + r() * 0.25,
          0.08 + r() * 0.15,
          0.2,
          { ry: ry + r(), seg: false },
        );
    }
    // back shelf with crates
    const [bx, bz] = P(0, -d / 2 + 0.3);
    b.box("rust", bx, y0, bz, w - 0.3, 1.8, 0.45, {
      ry,
      seg: false,
      grime: 0.6,
    });
    for (let k = 0; k < 3; k++)
      b.box("rust", bx, y0 + 0.4 + k * 0.5, bz, w - 0.3, 0.04, 0.5, {
        ry,
        seg: false,
      });
    for (const i of [0, 2]) {
      const [qx, qz] = P(-w / 2 + 0.5 + (i * (w - 1)) / 2, -d / 2 + 0.9);
      b.box("crate", qx, y0, qz, 0.7, 0.55, 0.55, {
        ry: ry + (r() - 0.5) * 0.4,
        seg: false,
        grime: 0.4,
      });
    }
    PF.col(bx, bz, w - 0.3, 0.5, y0, y0 + 1.8, ry, { walkable: false });
    // hanging sign above the awning front
    if (opts.sign) {
      const sk = PF.texMat(
        "stall_" + opts.sign.replace(/\W/g, "_"),
        PF.signTex(
          "stall_" + opts.sign,
          [opts.sign],
          opts.signStyle || "raider",
          512,
          160,
          opts.signColors || { bg: "#4a4638", fg: "#e8d8a0" },
        ),
      );
      const [hx, hz] = P(0, d / 2 + 0.36);
      b.quad(
        sk,
        hx,
        y0 + 2.95,
        hz,
        Math.min(w * 0.8, 2.6),
        Math.min(w * 0.8, 2.6) * 0.31,
        { ry, grime: 0.2 },
      );
      const [hx2, hz2] = P(0, d / 2 + 0.34);
      b.box(
        "rust",
        hx2,
        y0 + 2.5,
        hz2,
        Math.min(w * 0.8, 2.6) + 0.1,
        0.05,
        0.05,
        { ry, seg: false },
      );
    }
  };
  /** Stack of wooden crates (1..n) with a random twist. */
  D.crates = function (b, x, y, z, n, seed, collide) {
    const r = PF.rng(seed || x * 3 + z);
    let h = y;
    for (let i = 0; i < n; i++) {
      const s = 0.6 + r() * 0.3;
      b.box(
        "crate",
        x + (r() - 0.5) * 0.15,
        h,
        z + (r() - 0.5) * 0.15,
        s,
        s * 0.8,
        s,
        { ry: r() * 0.6, seg: false, grime: 0.45 },
      );
      h += s * 0.8;
    }
    if (collide !== false)
      PF.col(x, z, 0.9, 0.9, y, h, 0, { walkable: false, surface: "wood" });
  };
  /** Catenary string of lamp bulbs between two points (emissive bulbs + a couple of glow sprites). */
  D.stringLights = function (b, a, c, sag, n, color) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push(
        V(
          a.x + (c.x - a.x) * t,
          a.y + (c.y - a.y) * t - Math.sin(t * Math.PI) * sag,
          a.z + (c.z - a.z) * t,
        ),
      );
    }
    for (let i = 0; i < n; i++)
      b.beam("iron", pts[i], pts[i + 1], 0.015, 0.015, {
        noAO: true,
        grime: 0,
      });
    for (let i = 1; i < n; i++) {
      b.sphere(
        i % 5 === 3 ? "glass_broken" : "lamp",
        pts[i].x,
        pts[i].y - 0.08,
        pts[i].z,
        0.06,
        { ws: 6, hs: 4, noAO: true, grime: 0 },
      );
      if (i % 4 === 2)
        PF.glows.push({
          pos: pts[i].clone().setY(pts[i].y - 0.08),
          color: color || 0xffd090,
          size: 0.45,
        });
    }
  };
  /** Bank of CRT monitors on a desk or trading post ring. */
  D.monitor = function (b, x, y, z, ry, on) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    b.box("paint_cream", x, y, z, 0.55, 0.45, 0.5, {
      ry,
      seg: false,
      grime: 0.6,
    });
    b.box(
      "paint_cream",
      x - s * 0.18,
      y + 0.05,
      z - c * 0.18,
      0.4,
      0.35,
      0.25,
      { ry, seg: false, grime: 0.6 },
    );
    b.quad(
      on ? "screen" : "glass_dark",
      x + s * 0.252,
      y + 0.23,
      z + c * 0.252,
      0.42,
      0.32,
      { ry, noAO: true, grime: 0 },
    );
  };
  /** Fluorescent tube fixture hanging on two wires (emissive or broken). */
  D.fluoro = function (b, x, y, z, ry, len, lit, ceilY) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    b.box("panel", x, y, z, len, 0.1, 0.3, { ry, seg: false, grime: 0.4 });
    b.box(
      lit ? "lamp" : "glass_broken",
      x,
      y - 0.06,
      z,
      len - 0.1,
      0.06,
      0.16,
      { ry, seg: false, noAO: true, grime: 0 },
    );
    for (const sg of [-1, 1])
      b.beam(
        "iron",
        V(x + c * sg * len * 0.4, y + 0.1, z - s * sg * len * 0.4),
        V(x + c * sg * len * 0.4, ceilY, z - s * sg * len * 0.4),
        0.015,
        0.015,
        { noAO: true },
      );
    if (lit)
      PF.glows.push({ pos: V(x, y - 0.1, z), color: 0xe8f4ff, size: 0.9 });
  };
  /** Cable run hanging between points (sagging). */
  D.cable = function (b, pts, sag) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1],
        n = 6;
      for (let k = 0; k < n; k++) {
        const t0 = k / n,
          t1 = (k + 1) / n;
        const p0 = V(
          a.x + (c.x - a.x) * t0,
          a.y + (c.y - a.y) * t0 - Math.sin(t0 * Math.PI) * sag,
          a.z + (c.z - a.z) * t0,
        );
        const p1 = V(
          a.x + (c.x - a.x) * t1,
          a.y + (c.y - a.y) * t1 - Math.sin(t1 * Math.PI) * sag,
          a.z + (c.z - a.z) * t1,
        );
        b.beam("tire", p0, p1, 0.035, 0.035, { noAO: true, grime: 0 });
      }
    }
  };
  /** Low rubble drift (chunks + dust mound). */
  D.rubble = function (b, x, y, z, r0, n, seed) {
    const r = PF.rng(seed || x * 11 + z * 5);
    b.rock("rubble", x, y - r0 * 0.35, z, r0, {
      flat: 0.3,
      rough: 0.5,
      seed: seed || x,
    });
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = r0 * (0.6 + r() * 0.9);
      b.rock(
        r() < 0.3 ? "concrete" : "rubble",
        x + Math.cos(a) * d,
        y,
        z + Math.sin(a) * d,
        0.15 + r() * 0.35,
        { flat: 0.6, detail: 0, seed: i + (seed || 0) },
      );
    }
  };
  /** Stained mattress on the floor (raider bedding). */
  D.mattress = function (b, x, y, z, ry, tint) {
    b.box("fabric", x, y, z, 1.0, 0.2, 1.95, {
      ry,
      seg: false,
      c: tint || 0xa89070,
      grime: 0.8,
    });
    b.box(
      "fabric",
      x + Math.sin(ry) * -0.7,
      y + 0.2,
      z + Math.cos(ry) * -0.7,
      0.6,
      0.12,
      0.35,
      { ry, seg: false, c: 0xc8c0a8, grime: 0.6 },
    );
  };
  /** A shelf unit with bottles/cans (bar back, shop). */
  D.shelf = function (b, x, y, z, ry, w, rows, seed) {
    const r = PF.rng(seed || x + z * 7);
    const c = Math.cos(ry),
      s = Math.sin(ry);
    b.box("rotten", x, y, z, w, rows * 0.45 + 0.2, 0.4, {
      ry,
      seg: false,
      grime: 0.6,
    });
    for (let k = 0; k < rows; k++) {
      b.box(
        "rotten",
        x + s * 0.05,
        y + 0.25 + k * 0.45,
        z + c * 0.05,
        w,
        0.04,
        0.42,
        { ry, seg: false },
      );
      for (let i = 0; i < Math.round(w * 4); i++) {
        if (r() < 0.3) continue;
        const lx = -w / 2 + 0.12 + i * 0.25;
        b.cyl(
          r() < 0.25 ? "paint_red" : r() < 0.5 ? "glass_dark" : "chrome",
          x + c * lx + s * 0.1,
          y + 0.29 + k * 0.45,
          z - s * lx + c * 0.1,
          0.045,
          0.05,
          0.2 + r() * 0.1,
          6,
          { hSeg: 1 },
        );
      }
    }
    PF.col(x, z, w, 0.45, y, y + rows * 0.45 + 0.2, ry, { walkable: false });
  };
})();
