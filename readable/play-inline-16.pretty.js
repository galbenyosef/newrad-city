/* src/textures/31b_brands_slate.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: the city's brand slate (billboards & posters)
 * Owned by: textures.
 *
 * v0 compositions (virtual 1000×500 billboard, 400×600 poster) for every
 * brand of the slate that isn't one of the heritage brands in 31_brands.js;
 * the odd-variant compositions live in 33_brands_v1.js. Copy is written as
 * period Madison Avenue advertising: confident, earnest products of 1966.
 * Illustrations come from 30_art.js / 30b_art_slate.js. All original.
 *
 * Sets X.BRAND_ORDER (28 canonical ids, = G.LAYOUT.BRANDS 1:1),
 * X.EXTRA_BRANDS and X.brandArt (package faces reused by 33_brands_v1.js).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = G._tx;
  const A = X.art;
  const K = X.adkit;
  const B = X.BRANDS;
  const TAU = Math.PI * 2;
  const INK = "#1d1712";
  const def = (id, spec) => {
    spec.id = id;
    B[id] = spec;
  };

  /** Puffy cumulus cloud made of overlapping circles. */
  function cloud(ctx, x, y, s, col) {
    ctx.fillStyle = col || "rgba(255,255,255,0.9)";
    for (const [dx, dy, r] of [
      [-1.1, 0.15, 0.6],
      [-0.45, -0.25, 0.8],
      [0.35, -0.35, 0.9],
      [1.05, 0.05, 0.65],
      [0, 0.25, 0.7],
    ]) {
      ctx.beginPath();
      ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU);
      ctx.fill();
    }
  }
  /** Small speech bubble with a tail toward (tx, ty). */
  function bubble(ctx, cx, cy, w, h, tx, ty) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, TAU);
    ctx.moveTo(cx + w * 0.12, cy + h * 0.3);
    ctx.lineTo(tx, ty);
    ctx.lineTo(cx + w * 0.26, cy + h * 0.2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2 - 2, h / 2 - 2, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  /** Plate of meatballs in marinara (top-ish view). */
  function meatballPlate(ctx, cx, cy, rx) {
    const ry = rx * 0.32;
    A.ell(ctx, cx, cy, rx, ry);
    A.fs(ctx, "#f8f4ea", 4);
    A.ell(ctx, cx, cy - ry * 0.05, rx * 0.72, ry * 0.68);
    ctx.fillStyle = "#b8281a";
    ctx.fill();
    const pts = [
      [-0.38, -0.05],
      [0.0, -0.18],
      [0.36, -0.02],
      [-0.16, 0.18],
      [0.2, 0.2],
    ];
    for (const [dx, dy] of pts) {
      const x = cx + dx * rx,
        y = cy + dy * ry * 2 - ry * 0.25;
      A.ell(ctx, x, y, rx * 0.17, rx * 0.15);
      ctx.fillStyle = A.rgrad(ctx, x - rx * 0.05, y - rx * 0.05, 1, rx * 0.17, [
        [0, "#a8683a"],
        [1, "#5a2a10"],
      ]);
      ctx.fill();
      A.fs(ctx, null, 2.5);
      A.ell(ctx, x - rx * 0.05, y - rx * 0.05, rx * 0.04, rx * 0.025);
      ctx.fillStyle = "rgba(255,220,180,0.6)";
      ctx.fill();
    }
    for (let k = 0; k < 5; k++) {
      A.ell(
        ctx,
        cx + (k - 2) * rx * 0.18,
        cy - ry * 0.55 + (k % 2) * ry * 0.2,
        rx * 0.04,
        rx * 0.025,
        k,
      );
      ctx.fillStyle = "#3a8a2a";
      ctx.fill();
    }
  }
  /** Steam curls. */
  function steam(ctx, x, y, n, h) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (let k = 0; k < n; k++) {
      const sx = x + (k - (n - 1) / 2) * 40;
      ctx.beginPath();
      ctx.moveTo(sx, y);
      ctx.bezierCurveTo(sx - 18, y - h * 0.3, sx + 18, y - h * 0.6, sx, y - h);
      ctx.stroke();
    }
    ctx.restore();
  }
  /** Lone rider on horseback, in silhouette. gy = ground. */
  function rider(ctx, cx, gy, s, col) {
    ctx.save();
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineCap = "round";
    A.ell(ctx, cx, gy - s * 1.15, s * 0.85, s * 0.38);
    ctx.fill();
    ctx.lineWidth = s * 0.16;
    for (const [x0, x1] of [
      [-0.6, -0.75],
      [-0.4, -0.3],
      [0.45, 0.55],
      [0.65, 0.9],
    ]) {
      ctx.beginPath();
      ctx.moveTo(cx + x0 * s, gy - s * 1.0);
      ctx.lineTo(cx + x1 * s, gy);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.6, gy - s * 1.3);
    ctx.quadraticCurveTo(
      cx + s * 0.95,
      gy - s * 1.9,
      cx + s * 1.25,
      gy - s * 1.8,
    );
    ctx.lineTo(cx + s * 1.35, gy - s * 1.55);
    ctx.lineTo(cx + s * 0.85, gy - s * 1.15);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.8, gy - s * 1.3);
    ctx.quadraticCurveTo(
      cx - s * 1.3,
      gy - s * 1.1,
      cx - s * 1.2,
      gy - s * 0.5,
    );
    ctx.lineWidth = s * 0.14;
    ctx.stroke();
    A.ell(ctx, cx + s * 0.05, gy - s * 1.85, s * 0.2, s * 0.42);
    ctx.fill();
    A.ell(ctx, cx + s * 0.08, gy - s * 2.35, s * 0.13, s * 0.14);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.08, gy - s * 2.45, s * 0.36, s * 0.07, 0, 0, TAU);
    ctx.fill();
    ctx.fillRect(cx - s * 0.08, gy - s * 2.72, s * 0.32, s * 0.25);
    ctx.restore();
  }
  /** Clock-face badge (stopwatch). */
  function stopwatch(ctx, cx, cy, r, label) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - r * 0.14, cy - r * 1.32, r * 0.28, r * 0.3);
    A.fs(ctx, "#c8c8c0", 4);
    A.ell(ctx, cx, cy, r, r);
    A.fs(ctx, "#f8f6f0", r * 0.08);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU;
      A.lin(
        ctx,
        cx + Math.cos(a) * r * 0.78,
        cy + Math.sin(a) * r * 0.78,
        cx + Math.cos(a) * r * 0.9,
        cy + Math.sin(a) * r * 0.9,
        r * 0.05,
      );
    }
    A.lin(ctx, cx, cy, cx + r * 0.55, cy - r * 0.32, r * 0.07, "#c8201a");
    X.text(ctx, label, cx, cy + r * 0.42, {
      font: "condensed",
      size: r * 0.3,
      color: INK,
      maxW: r * 1.3,
      noSafe: true,
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------- package faces (shared with 33_brands_v1.js)
  function flakesFront(ctx, x, y, w, h) {
    ctx.fillStyle = "#f6eee0";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(x, y, w, h * 0.38);
    ctx.fillStyle = "#fff";
    for (let k = 0; k < 9; k++) {
      X.starPath(
        ctx,
        x + w * (0.1 + (k % 5) * 0.2),
        y + h * (0.05 + Math.floor(k / 5) * 0.06),
        w * 0.03,
        w * 0.012,
        5,
      );
      ctx.fill();
    }
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = k % 2 ? "#f6eee0" : "#c8201a";
      ctx.fillRect(x, y + h * (0.38 + k * 0.03), w, h * 0.03);
    }
    X.text(ctx, "FREEDOM", x + w / 2, y + h * 0.2, {
      font: "rounded",
      size: w * 0.2,
      color: "#fff",
      stroke: INK,
      strokeW: w * 0.018,
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "FLAKES", x + w / 2, y + h * 0.31, {
      font: "rounded",
      size: w * 0.2,
      color: "#f4c21e",
      stroke: INK,
      strokeW: w * 0.018,
      maxW: w * 0.9,
      noSafe: true,
    });
    A.bowl(ctx, x + w / 2, y + h * 0.68, w * 0.72, "cereal", {
      color: "#1e3a8a",
    });
    X.text(ctx, "BROOKLYN SUGAR WORKS", x + w / 2, y + h * 0.93, {
      font: "condensed",
      size: w * 0.07,
      color: INK,
      maxW: w * 0.9,
      noSafe: true,
    });
  }
  function marinaraLabel(ctx, x, y, w, h) {
    ctx.fillStyle = "#c8281e";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#f6ecd4";
    ctx.fillRect(x, y + h * 0.3, w, h * 0.36);
    ctx.fillStyle = "#2a7a3a";
    ctx.fillRect(x, y + h * 0.66, w, h * 0.06);
    X.text(ctx, "Mama", x + w / 2, y + h * 0.16, {
      font: "script",
      weight: "normal",
      size: w * 0.3,
      color: "#f6ecd4",
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "MARINARA’S", x + w / 2, y + h * 0.4, {
      font: "slab",
      size: w * 0.15,
      color: "#c8281e",
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "INSTANT MEATBALLS", x + w / 2, y + h * 0.56, {
      font: "condensed",
      size: w * 0.09,
      color: "#2a7a3a",
      maxW: w * 0.9,
      noSafe: true,
    });
    for (let k = 0; k < 3; k++) {
      A.ell(ctx, x + w * (0.3 + k * 0.2), y + h * 0.84, w * 0.07, w * 0.06);
      ctx.fillStyle = "#6a3018";
      ctx.fill();
    }
  }
  function plainLabel(ctx, x, y, w, h) {
    ctx.fillStyle = "#f4e6c0";
    ctx.fillRect(x + w * 0.08, y + h * 0.04, w * 0.84, h * 0.62);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + w * 0.08, y + h * 0.04, w * 0.84, h * 0.62);
    ctx.clip();
    X.sunburst(ctx, x + w / 2, y + h * 0.5, h * 0.6, 14, "#f4e6c0", "#f2d68a");
    A.ell(ctx, x + w / 2, y + h * 0.5, w * 0.16, w * 0.16);
    ctx.fillStyle = "#e8902a";
    ctx.fill();
    ctx.fillStyle = "#7a3a12";
    ctx.fillRect(x, y + h * 0.5, w, h * 0.2);
    ctx.restore();
    X.text(ctx, "GOLDEN", x + w / 2, y + h * 0.13, {
      font: "slab",
      size: w * 0.15,
      color: "#7a2a12",
      maxW: w * 0.78,
      noSafe: true,
    });
    X.text(ctx, "PLAIN", x + w / 2, y + h * 0.27, {
      font: "slab",
      size: w * 0.19,
      color: "#7a2a12",
      maxW: w * 0.78,
      noSafe: true,
    });
    X.text(ctx, "BEEF JERKY", x + w / 2, y + h * 0.6, {
      font: "condensed",
      size: w * 0.1,
      color: "#f4e6c0",
      maxW: w * 0.78,
      noSafe: true,
    });
  }
  function homeguardLabel(ctx, x, y, w, h) {
    ctx.fillStyle = "#1e3a6a";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#c8201a";
    ctx.fillRect(x, y + h * 0.7, w, h * 0.08);
    ctx.fillStyle = "#f4f0e6";
    ctx.fillRect(x, y + h * 0.78, w, h * 0.05);
    const sx = x + w / 2,
      sy = y + h * 0.3,
      sw = w * 0.36;
    ctx.beginPath();
    ctx.moveTo(sx - sw / 2, sy - sw * 0.5);
    ctx.lineTo(sx + sw / 2, sy - sw * 0.5);
    ctx.lineTo(sx + sw / 2, sy);
    ctx.quadraticCurveTo(sx + sw / 2, sy + sw * 0.55, sx, sy + sw * 0.75);
    ctx.quadraticCurveTo(sx - sw / 2, sy + sw * 0.55, sx - sw / 2, sy);
    ctx.closePath();
    ctx.fillStyle = "#f4f0e6";
    ctx.fill();
    ctx.strokeStyle = "#c8201a";
    ctx.lineWidth = Math.max(1.5, w * 0.025);
    ctx.stroke();
    X.text(ctx, "H", sx, sy + sw * 0.05, {
      font: "impact",
      size: sw * 0.8,
      color: "#c8201a",
      maxW: sw,
      noSafe: true,
    });
    X.text(ctx, "HOMEGUARD", x + w / 2, y + h * 0.62, {
      font: "impact",
      size: w * 0.18,
      color: "#f4f0e6",
      maxW: w * 0.92,
      noSafe: true,
    });
    X.text(ctx, "CLEANSER", x + w / 2, y + h * 0.92, {
      font: "condensed",
      size: w * 0.1,
      color: "#f4f0e6",
      maxW: w * 0.9,
      noSafe: true,
    });
  }
  function maneLabel(ctx, x, y, w, h) {
    X.text(ctx, "DR. THATCHER’S", x + w / 2, y + h * 0.17, {
      font: "copper",
      size: w * 0.11,
      color: "#7a2a1a",
      maxW: w * 0.82,
      noSafe: true,
    });
    X.text(ctx, "Miracle", x + w / 2, y + h * 0.4, {
      font: "script",
      weight: "normal",
      size: w * 0.24,
      color: "#1e4a32",
      maxW: w * 0.82,
      noSafe: true,
    });
    X.text(ctx, "MANE", x + w / 2, y + h * 0.62, {
      font: "copper",
      size: w * 0.2,
      color: "#1e4a32",
      maxW: w * 0.82,
      noSafe: true,
    });
    X.text(ctx, "HAIR TONIC · 4 FL. OZ.", x + w / 2, y + h * 0.84, {
      font: "condensed",
      size: w * 0.08,
      color: "#7a2a1a",
      maxW: w * 0.82,
      noSafe: true,
    });
  }
  function pouchLabel(ctx, x, y, w, h) {
    ctx.fillStyle = "#0e1a44";
    X.rrect(ctx, x, y, w, h, w * 0.06);
    ctx.fill();
    X.text(ctx, "ASTRONAUT", x + w / 2, y + h * 0.13, {
      font: "deco",
      size: w * 0.15,
      color: "#fff",
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "ICE CREAM", x + w / 2, y + h * 0.27, {
      font: "deco",
      size: w * 0.13,
      color: "#ff9ab8",
      maxW: w * 0.9,
      noSafe: true,
    });
    A.neapolitan(ctx, x + w * 0.18, y + h * 0.38, w * 0.64, h * 0.28);
    X.text(ctx, "FREEZE-DRIED NEAPOLITAN", x + w / 2, y + h * 0.77, {
      font: "condensed",
      size: w * 0.075,
      color: "#cfe8ff",
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "JUNIOR ROCKETEER CO.", x + w / 2, y + h * 0.9, {
      font: "condensed",
      size: w * 0.075,
      color: "#f4d040",
      maxW: w * 0.9,
      noSafe: true,
    });
  }
  function kitFront(ctx, x, y, w, h) {
    ctx.fillStyle = A.grad(ctx, 0, y, 0, y + h, [
      [0, "#1e3a8a"],
      [1, "#5ab0e8"],
    ]);
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#c8201a";
    ctx.fillRect(x, y, w, h * 0.2);
    X.text(ctx, "JUNIOR", x + w / 2, y + h * 0.06, {
      font: "deco",
      size: w * 0.12,
      color: "#fff",
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "ROCKETEER", x + w / 2, y + h * 0.14, {
      font: "deco",
      size: w * 0.13,
      color: "#f4d040",
      maxW: w * 0.9,
      noSafe: true,
    });
    A.rocket(ctx, x + w * 0.5, y + h * 0.55, h * 0.42, -Math.PI / 2, {
      body: "#f4f0e6",
      accent: "#c8201a",
    });
    X.text(ctx, "MODEL ROCKET KIT No. 7", x + w / 2, y + h * 0.9, {
      font: "condensed",
      size: w * 0.08,
      color: "#fff",
      maxW: w * 0.9,
      noSafe: true,
    });
  }
  X.brandArt = {
    flakesFront,
    marinaraLabel,
    plainLabel,
    homeguardLabel,
    maneLabel,
    pouchLabel,
    kitFront,
    cloud,
    bubble,
    meatballPlate,
    steam,
    rider,
    stopwatch,
  };

  // ==================================================================
  // LIBERTY JETLINER (airline)
  // ==================================================================
  def("liberty_jetliner", {
    name: "Liberty Jetliner",
    colors: ["#13306a", "#f4f0e6", "#c8202a"],
    slogans: [
      "Fly the flag. Fly Liberty.",
      "Coast to coast in a single afternoon.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#2e6ab8", "#e4f0f8");
      ctx.fillStyle = A.rgrad(ctx, 880, 70, 10, 260, [
        [0, "rgba(255,250,220,0.9)"],
        [1, "rgba(255,250,220,0)"],
      ]);
      ctx.fillRect(600, 0, 400, 330);
      cloud(ctx, 560, 120, 26, "rgba(255,255,255,0.55)");
      cloud(ctx, 930, 300, 34, "rgba(255,255,255,0.7)");
      for (let k = 0; k < 9; k++)
        cloud(
          ctx,
          40 + k * 120,
          440 - (k % 2) * 16,
          46,
          "rgba(255,255,255,0.95)",
        );
      A.speedLines(ctx, 420, 180, 250, 110, 5, "rgba(255,255,255,0.7)");
      A.jetliner(ctx, 740, 215, 500, -0.1, { stripe: "#c8202a" });
      ctx.fillStyle = "#13306a";
      ctx.fillRect(0, 446, 1000, 54);
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = k % 2 ? "#f4f0e6" : "#c8202a";
        ctx.fillRect(0, 428 + k * 6, 1000, 6);
      }
      X.text(ctx, "LIBERTY", 250, 100, {
        font: "deco",
        size: 104,
        color: "#13306a",
        spacing: 8,
        stroke: "#f4f0e6",
        strokeW: 6,
        maxW: 420,
      });
      X.text(ctx, "J E T L I N E R", 250, 182, {
        font: "condensed",
        size: 42,
        color: "#c8202a",
        spacing: 4,
        maxW: 400,
      });
      X.text(ctx, this.slogans[0], 250, 262, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#13306a",
        maxW: 430,
      });
      X.text(
        ctx,
        "NEW YORK · WASHINGTON · CHICAGO · DENVER · LOS ANGELES",
        500,
        474,
        {
          font: "condensed",
          size: 24,
          color: "#f4f0e6",
          spacing: 3,
          maxW: 900,
        },
      );
    },
    art(ctx, cx, cy, s) {
      A.jetliner(ctx, cx, cy, s * 3.0, -0.35, { stripe: "#c8202a" });
    },
    posterBg: ["gradient", "#2e6ab8", "#e4f0f8"],
    posterInk: "#13306a",
    posterFont: "deco",
  });

  // ==================================================================
  // THE FIRST JOURNAL (newspaper)
  // ==================================================================
  def("first_journal", {
    name: "The First Journal",
    colors: ["#efe8d6", "#141210", "#b81c1c"],
    slogans: ["You heard it here first.", "Morning, evening and Sunday."],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "solid", "#efe8d6");
      ctx.fillStyle = "rgba(40,36,30,0.07)";
      for (let x = 20; x < 1000; x += 64) ctx.fillRect(x, 0, 2, 500);
      A.newspaper(ctx, 770, 250, 320, 410, {
        rot: 0.05,
        head: "GEMINI CREW HOME SAFE",
        sub: "Splashdown on target in the Atlantic",
      });
      ctx.fillStyle = "#b81c1c";
      ctx.fillRect(40, 300, 470, 6);
      X.text(ctx, "The First", 285, 90, {
        font: "didone",
        size: 84,
        color: "#141210",
        maxW: 470,
      });
      X.text(ctx, "Journal", 285, 185, {
        font: "didone",
        size: 112,
        color: "#141210",
        maxW: 470,
      });
      X.text(ctx, this.slogans[0], 285, 262, {
        font: "serif",
        size: 44,
        italic: true,
        color: "#b81c1c",
        maxW: 470,
      });
      X.text(ctx, "MORNING · EVENING · SUNDAY", 285, 345, {
        font: "condensed",
        size: 30,
        color: "#141210",
        spacing: 6,
        maxW: 460,
      });
      K.fine(
        ctx,
        "Delivered before the coffee perks · Five cents at every newsstand",
        285,
        468,
        "rgba(20,18,16,0.7)",
        17,
      );
    },
    art(ctx, cx, cy, s) {
      A.newspaper(ctx, cx, cy, s * 2.6, s * 3.2, {
        rot: -0.06,
        head: "EXTRA!",
        sub: "You heard it here first.",
      });
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "solid", "#efe8d6");
      A.newspaper(ctx, 200, 300, 330, 430, {
        rot: v % 2 ? 0.04 : -0.04,
        head: v % 2 ? "MOON BY 1970?" : "EXTRA!",
        sub: v % 2 ? "Scientists say yes" : "You heard it here first.",
      });
      X.text(ctx, "THE FIRST JOURNAL", 200, 45, {
        font: "didone",
        size: 40,
        color: "#141210",
        maxW: 370,
      });
      K.ribbonText(
        ctx,
        "YOU HEARD IT HERE FIRST.",
        200,
        555,
        330,
        48,
        "#b81c1c",
        "#6a0e0e",
        "#fff",
      );
    },
  });

  // ==================================================================
  // PIZZA GALAXY (pizza chain)
  // ==================================================================
  def("pizza_galaxy", {
    name: "Pizza Galaxy",
    colors: ["#2a1450", "#ffb030", "#5ad8ff"],
    slogans: [
      "Out of this world. Into your mouth in 30 minutes.",
      "Dine in · Take out · Rocket-fast delivery",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "radial", "#4a2480", "#0a0620", {
        cx: 700,
        cy: 250,
      });
      A.stars(ctx, 0, 0, 1000, 500, 160, r);
      const ring = (front) => {
        ctx.save();
        ctx.translate(700, 250);
        ctx.rotate(-0.18);
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          250,
          62,
          0,
          front ? 0 : Math.PI,
          front ? Math.PI : TAU,
        );
        ctx.strokeStyle = "#ffb030";
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.strokeStyle = "#ffe08a";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      };
      ring(false);
      A.pizza(ctx, 700, 250, 180, { tilt: 0.55, seed: 1 });
      ring(true);
      A.rocket(ctx, 905, 85, 95, 0.35, { body: "#ffb030", accent: "#c8321e" });
      X.text(ctx, "PIZZA", 240, 100, {
        font: "deco",
        size: 110,
        color: "#ffb030",
        glow: "#ff8a20",
        glowBlur: 14,
        stroke: "#2a0a10",
        strokeW: 6,
        maxW: 400,
      });
      X.text(ctx, "GALAXY", 240, 200, {
        font: "deco",
        size: 86,
        color: "#5ad8ff",
        spacing: 8,
        glow: "#5ad8ff",
        glowBlur: 12,
        maxW: 400,
      });
      X.text(ctx, "Out of this world.", 240, 282, {
        font: "serif",
        size: 38,
        italic: true,
        color: "#ffffff",
        maxW: 400,
      });
      X.text(ctx, "Into your mouth in 30 minutes.", 240, 330, {
        font: "serif",
        size: 32,
        italic: true,
        color: "#ffd27a",
        maxW: 400,
      });
      K.fine(
        ctx,
        "Dine in · Take out · Rocket-fast delivery in all five boroughs",
        500,
        472,
        "rgba(220,200,255,0.8)",
        17,
      );
    },
    art(ctx, cx, cy, s) {
      A.pizza(ctx, cx, cy, s * 1.3, { tilt: 0.55, seed: 2 });
    },
    posterBg: ["radial", "#4a2480", "#0a0620"],
    posterInk: "#ffb030",
    posterFont: "deco",
  });

  // ==================================================================
  // EMPIRE BREW HOUSE (beer)
  // ==================================================================
  def("empire_brew", {
    name: "Empire Brew House",
    colors: ["#2a1408", "#e8c060", "#8a1a1a"],
    slogans: [
      "Brewed in Brooklyn. Poured everywhere.",
      "The lager New York ordered by name.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#3a1c0a", "#1a0c04");
      ctx.fillStyle = "rgba(140,70,30,0.18)";
      for (let y = 0, row = 0; y < 440; y += 26, row++)
        for (let x = (row % 2) * 40 - 40; x < 1000; x += 80)
          ctx.fillRect(x + 2, y + 2, 76, 22);
      ctx.fillStyle = A.rgrad(ctx, 300, 280, 10, 300, [
        [0, "rgba(255,200,110,0.55)"],
        [1, "rgba(255,200,110,0)"],
      ]);
      ctx.fillRect(0, 0, 640, 500);
      ctx.fillStyle = "#4a2410";
      ctx.fillRect(0, 445, 1000, 55);
      ctx.fillStyle = "rgba(255,220,160,0.35)";
      ctx.fillRect(0, 445, 1000, 4);
      A.amberBottle(ctx, 455, 120, 330, {
        label: "#f4ecd4",
        band: "#8a1a1a",
        text: "EMPIRE",
      });
      A.pilsner(ctx, 285, 448, 340, {});
      X.text(ctx, "EMPIRE", 735, 105, {
        font: "copper",
        size: 100,
        color: "#e8c060",
        stroke: "#1a0c04",
        strokeW: 6,
        spacing: 4,
        maxW: 420,
      });
      X.text(ctx, "BREW HOUSE", 735, 180, {
        font: "copper",
        size: 44,
        color: "#f4ecd4",
        spacing: 8,
        maxW: 400,
      });
      X.text(ctx, "Brewed in Brooklyn.", 735, 262, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#f4ecd4",
        maxW: 420,
      });
      X.text(ctx, "Poured everywhere.", 735, 312, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#e8c060",
        maxW: 420,
      });
      K.fine(
        ctx,
        "Empire Brew House · Bushwick, Brooklyn, N.Y. · Lager · Ale · Bock",
        735,
        472,
        "rgba(244,236,212,0.75)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.pilsner(ctx, cx - s * 0.35, cy + s * 1.3, s * 2.6, {});
      A.amberBottle(ctx, cx + s * 0.6, cy - s * 1.0, s * 2.3, {
        label: "#f4ecd4",
        band: "#8a1a1a",
        text: "EMPIRE",
      });
    },
    posterBg: ["gradient", "#3a1c0a", "#1a0c04"],
    posterInk: "#e8c060",
    posterFont: "copper",
  });

  // ==================================================================
  // SILVER TORCH (cigarettes)
  // ==================================================================
  def("silver_torch", {
    name: "Silver Torch",
    colors: ["#16264a", "#d8dde2", "#e8c050"],
    slogans: [
      "Light up like the lady in the harbor.",
      "King size. Filter tip. Silver all the way.",
    ],
    bill(ctx, v, r) {
      ctx.fillStyle = A.grad(ctx, 0, 0, 0, 420, [
        [0, "#0c1634"],
        [0.6, "#3a4a7a"],
        [1, "#d8906a"],
      ]);
      ctx.fillRect(0, 0, 1000, 500);
      A.stars(ctx, 0, 0, 1000, 160, 50, r);
      A.skyline(ctx, 300, 412, 700, 70, "#0a1028", X.rng(77));
      ctx.fillStyle = A.grad(ctx, 0, 410, 0, 500, [
        [0, "#1a2a4a"],
        [1, "#060a18"],
      ]);
      ctx.fillRect(0, 410, 1000, 90);
      ctx.fillStyle = "rgba(255,220,150,0.35)";
      for (let k = 0; k < 18; k++)
        ctx.fillRect(170 + r() * 80 - 40, 420 + k * 4.5, 30 + r() * 50, 2);
      // the lady's raised arm, in weathered copper
      ctx.beginPath();
      ctx.moveTo(110, 500);
      ctx.quadraticCurveTo(150, 430, 186, 392);
      ctx.lineTo(222, 392);
      ctx.quadraticCurveTo(230, 450, 260, 500);
      ctx.closePath();
      ctx.fillStyle = A.grad(ctx, 110, 0, 260, 0, [
        [0, "#4a8a78"],
        [0.5, "#8ac8b0"],
        [1, "#3a7a68"],
      ]);
      ctx.fill();
      A.fs(ctx, null, 4);
      ctx.strokeStyle = "rgba(20,50,40,0.5)";
      ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(140 + k * 30, 500);
        ctx.quadraticCurveTo(170 + k * 18, 450, 196 + k * 10, 400);
        ctx.stroke();
      }
      A.torch(ctx, 204, 200, 125, {});
      A.cigPack(ctx, 840, 300, 150, 215, {});
      X.text(ctx, "SILVER", 505, 95, {
        font: "didone",
        size: 84,
        color: "#eef2f4",
        spacing: 10,
        maxW: 400,
      });
      X.text(ctx, "TORCH", 505, 180, {
        font: "didone",
        size: 84,
        color: "#e8c050",
        spacing: 10,
        maxW: 400,
      });
      X.text(ctx, this.slogans[0], 505, 258, {
        font: "serif",
        size: 30,
        italic: true,
        color: "#ffffff",
        maxW: 410,
      });
      X.text(ctx, "KING SIZE · FILTER TIP · 20 CLASS A CIGARETTES", 505, 312, {
        font: "condensed",
        size: 20,
        color: "#c8d0d8",
        spacing: 2,
        maxW: 400,
      });
      K.fine(
        ctx,
        "Silver Torch Tobacco Co. · Richmond, Virginia",
        600,
        476,
        "rgba(220,226,232,0.65)",
        15,
      );
    },
    art(ctx, cx, cy, s) {
      A.cigPack(ctx, cx + s * 0.3, cy + s * 0.25, s * 1.3, s * 1.9, {});
      A.torch(ctx, cx - s * 0.85, cy - s * 0.4, s * 0.8, {});
    },
    posterBg: ["gradient", "#0c1634", "#3a4a7a"],
    posterInk: "#eef2f4",
    posterFont: "didone",
  });

  // ==================================================================
  // BURGER BRIGADE (the first burger chain)
  // ==================================================================
  def("burger_brigade", {
    name: "Burger Brigade",
    colors: ["#c8201a", "#f4c21e", "#1e3a8a"],
    slogans: [
      "Fifteen cents. Fifteen seconds.",
      "Hot off the griddle, on the double.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "stripes", "#c8201a", "#b41a14", {
        w: 30,
        slant: 0.4,
      });
      ctx.fillStyle = "#f4c21e";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(500, 0);
      ctx.lineTo(430, 500);
      ctx.lineTo(0, 500);
      ctx.fill();
      ctx.fillStyle = "#1e3a8a";
      ctx.beginPath();
      ctx.moveTo(500, 0);
      ctx.lineTo(514, 0);
      ctx.lineTo(444, 500);
      ctx.lineTo(430, 500);
      ctx.fill();
      A.burger(ctx, 720, 285, 400);
      stopwatch(ctx, 905, 115, 62, "15 SEC.");
      X.text(ctx, "BURGER", 230, 100, {
        font: "impact",
        size: 110,
        color: "#c8201a",
        stroke: INK,
        strokeW: 8,
        maxW: 390,
        extrude: { color: "#6a0e0a", n: 6 },
      });
      X.text(ctx, "BRIGADE", 230, 200, {
        font: "impact",
        size: 92,
        color: "#1e3a8a",
        stroke: "#fff",
        strokeW: 7,
        maxW: 390,
      });
      X.text(ctx, "Fifteen cents.", 220, 285, {
        font: "impact",
        size: 46,
        italic: true,
        skew: -0.08,
        color: INK,
        maxW: 380,
      });
      X.text(ctx, "Fifteen seconds.", 215, 340, {
        font: "impact",
        size: 46,
        italic: true,
        skew: -0.08,
        color: "#c8201a",
        maxW: 370,
      });
      K.badge(ctx, ["ONLY", "15¢"], 370, 425, 54, "#1e3a8a", "#fff", -0.15);
      K.fine(
        ctx,
        "At 30 Brigade Posts in the Tri-State area",
        175,
        470,
        "rgba(0,0,0,0.65)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.burger(ctx, cx, cy, s * 2.6);
    },
    posterBg: ["stripes", "#c8201a", "#b41a14"],
    posterInk: "#f4c21e",
  });

  // ==================================================================
  // EXCALIBUR GARDENS (the park that was to open in the summer of '67)
  // ==================================================================
  function planks(ctx, r) {
    for (let x = 0, k = 0; x < 1000; x += 100, k++) {
      ctx.fillStyle = ["#c8a46a", "#bf9a60", "#d0ac74", "#c4a066"][k % 4];
      ctx.fillRect(x, 0, 100, 500);
      ctx.strokeStyle = "rgba(90,60,30,0.25)";
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 6; g++) {
        const gx = x + 10 + g * 15 + r() * 6;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.bezierCurveTo(gx + 6, 160, gx - 6, 330, gx + 3, 500);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(40,24,10,0.55)";
      ctx.fillRect(x, 0, 3, 500);
      ctx.fillStyle = "#5a4a3a";
      for (const y of [30, 250, 470]) {
        ctx.beginPath();
        ctx.arc(x + 50, y, 3.5, 0, TAU);
        ctx.fill();
      }
    }
  }
  function hazard(ctx, y, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y, 1000, h);
    ctx.clip();
    ctx.fillStyle = "#f2c43a";
    ctx.fillRect(0, y, 1000, h);
    ctx.fillStyle = "#1d1712";
    for (let x = -h; x < 1000 + h; x += h * 1.4) {
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + h * 0.7, y);
      ctx.lineTo(x + h * 1.4, y);
      ctx.lineTo(x + h * 0.7, y + h);
      ctx.fill();
    }
    ctx.restore();
  }
  def("excalibur_gardens", {
    name: "Excalibur Gardens",
    colors: ["#1e3a6a", "#f2c43a", "#8a1a1a"],
    slogans: [
      "COMING SOON · Summer 1967. Your kingdom awaits.",
      "Knights, castles and a dragon’s lair.",
    ],
    bill(ctx, v, r) {
      planks(ctx, r);
      hazard(ctx, 448, 52);
      // pasted artist's rendering
      ctx.save();
      ctx.translate(745, 200);
      ctx.rotate(0.025);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(-212, -152, 430, 310);
      ctx.fillStyle = A.grad(ctx, 0, -155, 0, 150, [
        [0, "#7ab8e8"],
        [1, "#fdf0d8"],
      ]);
      ctx.fillRect(-215, -155, 430, 305);
      ctx.fillStyle = "#6aa84a";
      ctx.beginPath();
      ctx.moveTo(-215, 150);
      ctx.lineTo(-215, 100);
      ctx.quadraticCurveTo(0, 50, 215, 95);
      ctx.lineTo(215, 150);
      ctx.fill();
      A.castle(ctx, 0, 110, 300, {});
      ctx.fillStyle = "#f4ecd8";
      ctx.fillRect(-215, 118, 430, 32);
      X.text(ctx, "ARTIST’S RENDERING", 0, 134, {
        font: "condensed",
        size: 20,
        color: INK,
        spacing: 4,
        maxW: 380,
        noSafe: true,
      });
      ctx.strokeStyle = "#f4ecd8";
      ctx.lineWidth = 6;
      ctx.strokeRect(-215, -155, 430, 305);
      ctx.fillStyle = "rgba(220,205,150,0.8)";
      for (const [tx, ty, a] of [
        [-200, -150, -0.6],
        [200, -150, 0.6],
      ]) {
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(a);
        ctx.fillRect(-30, -9, 60, 18);
        ctx.restore();
      }
      ctx.restore();
      X.text(ctx, "COMING SOON", 280, 80, {
        font: "stencil",
        size: 72,
        color: "#1d1712",
        spacing: 4,
        maxW: 440,
      });
      X.text(ctx, "EXCALIBUR", 280, 162, {
        font: "copper",
        size: 66,
        color: "#8a1a1a",
        stroke: "#f4ecd8",
        strokeW: 5,
        maxW: 440,
      });
      X.text(ctx, "GARDENS", 280, 228, {
        font: "copper",
        size: 54,
        color: "#1e3a6a",
        stroke: "#f4ecd8",
        strokeW: 4,
        spacing: 6,
        maxW: 420,
      });
      X.text(ctx, "Summer 1967", 280, 302, {
        font: "script",
        weight: "normal",
        size: 66,
        color: "#1e3a6a",
        maxW: 420,
      });
      X.text(ctx, "Your kingdom awaits.", 280, 368, {
        font: "serif",
        size: 36,
        italic: true,
        color: "#1d1712",
        maxW: 420,
      });
      X.text(
        ctx,
        "SITE OF THE FUTURE EXCALIBUR GARDENS · POST NO BILLS",
        280,
        420,
        {
          font: "stencil",
          size: 18,
          color: "rgba(29,23,18,0.8)",
          spacing: 1,
          maxW: 440,
        },
      );
    },
    art(ctx, cx, cy, s) {
      A.castle(ctx, cx, cy + s * 1.1, s * 2.8, {});
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "gradient", "#7ab8e8", "#fdf0d8");
      ctx.fillStyle = "#6aa84a";
      ctx.beginPath();
      ctx.moveTo(0, 600);
      ctx.lineTo(0, 400);
      ctx.quadraticCurveTo(200, 340, 400, 400);
      ctx.lineTo(400, 600);
      ctx.fill();
      A.castle(ctx, 200, 420, 330, {});
      A.swordStone(ctx, 330, 540, 40);
      X.text(ctx, "EXCALIBUR", 200, 52, {
        font: "copper",
        size: 50,
        color: "#8a1a1a",
        stroke: "#fff",
        strokeW: 4,
        maxW: 360,
      });
      X.text(ctx, "GARDENS", 200, 100, {
        font: "copper",
        size: 38,
        color: "#1e3a6a",
        spacing: 4,
        maxW: 340,
      });
      ctx.save();
      ctx.translate(200, 480);
      ctx.rotate(-0.08);
      K.ribbonText(
        ctx,
        "COMING SOON · SUMMER 1967",
        0,
        0,
        340,
        46,
        "#c8201a",
        "#7a0e0a",
        "#fff",
      );
      ctx.restore();
      X.text(ctx, "Your kingdom awaits.", 150, 560, {
        font: "serif",
        size: 26,
        italic: true,
        color: "#1d1712",
        maxW: 240,
      });
    },
  });

  // ==================================================================
  // JUNIOR ROCKETEER CO. (toys)
  // ==================================================================
  def("junior_rocketeer", {
    name: "Junior Rocketeer Co.",
    colors: ["#1e3a8a", "#c8201a", "#f4d040"],
    slogans: [
      "Real science. Real rockets.",
      "Model rocket kits for ages 8 to 80.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "sunburst", "#5ab0e8", "#6abcf0", {
        cx: 770,
        cy: 470,
        rays: 30,
      });
      cloud(ctx, 560, 70, 22, "rgba(255,255,255,0.8)");
      ctx.fillStyle = "#5a9a3a";
      ctx.beginPath();
      ctx.moveTo(0, 420);
      ctx.quadraticCurveTo(500, 395, 1000, 420);
      ctx.lineTo(1000, 500);
      ctx.lineTo(0, 500);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (let k = 0; k < 9; k++) {
        ctx.beginPath();
        ctx.arc(
          700 + (k - 4) * 26 + r() * 10,
          405 - Math.abs(k - 4) * 6 - r() * 10,
          24 + r() * 12,
          0,
          TAU,
        );
        ctx.fill();
      }
      A.lin(ctx, 770, 395, 735, 425, 5, "#4a4a48");
      A.lin(ctx, 770, 395, 805, 425, 5, "#4a4a48");
      A.lin(ctx, 770, 395, 770, 330, 3, "#8a8a88");
      A.rocket(ctx, 770, 200, 230, -Math.PI / 2, {
        body: "#f4f0e6",
        accent: "#c8201a",
        flameLen: 0.15,
      });
      A.kid(ctx, 575, 300, 58, { shirt: "#c8201a" });
      X.text(ctx, "JUNIOR", 245, 88, {
        font: "deco",
        size: 76,
        color: "#c8201a",
        stroke: "#fff",
        strokeW: 6,
        spacing: 6,
        maxW: 400,
      });
      X.text(ctx, "ROCKETEER", 245, 162, {
        font: "deco",
        size: 70,
        color: "#1e3a8a",
        stroke: "#fff",
        strokeW: 6,
        maxW: 400,
      });
      X.text(ctx, "Real science.", 245, 245, {
        font: "impact",
        size: 50,
        color: "#fff",
        stroke: INK,
        strokeW: 6,
        maxW: 400,
      });
      X.text(ctx, "Real rockets.", 245, 303, {
        font: "impact",
        size: 50,
        color: "#f4d040",
        stroke: INK,
        strokeW: 6,
        maxW: 400,
      });
      X.text(ctx, "MODEL ROCKET KITS · AGES 8 TO 80", 245, 360, {
        font: "condensed",
        size: 24,
        color: "#1e3a8a",
        spacing: 2,
        maxW: 400,
      });
      K.fine(
        ctx,
        "Junior Rocketeer Co. · Hempstead, Long Island · Launch with a grown-up, in an open field",
        500,
        474,
        "rgba(255,255,255,0.85)",
        15,
      );
    },
    art(ctx, cx, cy, s) {
      A.rocket(ctx, cx, cy, s * 2.4, -Math.PI / 2, {
        body: "#f4f0e6",
        accent: "#c8201a",
      });
    },
    posterBg: ["sunburst", "#5ab0e8", "#6abcf0"],
    posterInk: "#c8201a",
    posterFont: "deco",
  });

  // ==================================================================
  // DR. THATCHER'S MIRACLE MANE (hair tonic)
  // ==================================================================
  def("miracle_mane", {
    name: "Dr. Thatcher’s Miracle Mane",
    colors: ["#1e4a32", "#e8c060", "#f4ecd4"],
    slogans: [
      "Grows hair on anything. Anything.",
      "Ask your druggist for the green bottle.",
    ],
    bill(ctx, v, r) {
      ctx.fillStyle = "#8a9aa8";
      ctx.fillRect(0, 0, 1000, 500);
      ctx.fillStyle = "#f2d38a";
      ctx.beginPath();
      ctx.moveTo(360, 0);
      ctx.lineTo(1000, 0);
      ctx.lineTo(1000, 500);
      ctx.lineTo(320, 500);
      ctx.fill();
      X.sunburst(
        ctx,
        540,
        260,
        520,
        22,
        "rgba(0,0,0,0)",
        "rgba(255,255,255,0.18)",
      );
      ctx.fillStyle = "#c8201a";
      ctx.beginPath();
      ctx.moveTo(352, 0);
      ctx.lineTo(368, 0);
      ctx.lineTo(328, 500);
      ctx.lineTo(312, 500);
      ctx.fill();
      A.dad(ctx, 180, 215, 66, {
        hat: false,
        bald: true,
        suit: "#5a5a5e",
        tie: "#3a3a3a",
      });
      A.dad(ctx, 545, 215, 66, {
        hat: false,
        hairColor: "#2a1a0e",
        suit: "#2a4a7a",
        tie: "#c8201a",
      });
      A.tonicBottle(ctx, 830, 40, 340, maneLabel, { glass: "#2a7a4a" });
      X.text(ctx, "BEFORE", 180, 50, {
        font: "marker",
        size: 44,
        color: "#f4f4f0",
        maxW: 260,
      });
      X.text(ctx, "AFTER", 545, 50, {
        font: "marker",
        size: 44,
        color: "#1e4a32",
        maxW: 260,
      });
      ctx.fillStyle = "#1e4a32";
      ctx.fillRect(0, 380, 1000, 120);
      ctx.fillStyle = "#e8c060";
      ctx.fillRect(0, 380, 1000, 5);
      X.text(ctx, "DR. THATCHER’S MIRACLE MANE", 500, 418, {
        font: "copper",
        size: 50,
        color: "#e8c060",
        spacing: 2,
        maxW: 900,
      });
      X.text(ctx, this.slogans[0], 500, 466, {
        font: "serif",
        size: 32,
        italic: true,
        color: "#f4ecd4",
        maxW: 880,
      });
    },
    art(ctx, cx, cy, s) {
      A.tonicBottle(ctx, cx, cy - s * 1.35, s * 2.7, maneLabel, {
        glass: "#2a7a4a",
      });
    },
    posterBg: ["solid", "#1e4a32", "#1e4a32"],
    posterInk: "#e8c060",
    posterFont: "copper",
  });

  // ==================================================================
  // BIG APPLE MOTOR CAB (taxis)
  // ==================================================================
  def("big_apple_cab", {
    name: "Big Apple Motor Cab",
    colors: ["#f2c21a", "#151515", "#c8201a"],
    slogans: [
      "Just get in already!",
      "Five boroughs. One number. PLaza 7-1000.",
    ],
    bill(ctx, v, r) {
      ctx.fillStyle = A.grad(ctx, 0, 0, 0, 400, [
        [0, "#6a4a8a"],
        [0.7, "#f2a85a"],
        [1, "#f8d090"],
      ]);
      ctx.fillRect(0, 0, 1000, 500);
      A.skyline(ctx, 0, 405, 1000, 190, "#3a2a4a", X.rng(12));
      ctx.fillStyle = "rgba(255,220,130,0.8)";
      for (let k = 0; k < 120; k++)
        ctx.fillRect(r() * 1000, 260 + r() * 140, 3, 4);
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(0, 400, 1000, 100);
      ctx.strokeStyle = "#f2c21a";
      ctx.lineWidth = 5;
      ctx.setLineDash([34, 26]);
      ctx.beginPath();
      ctx.moveTo(0, 488);
      ctx.lineTo(1000, 488);
      ctx.stroke();
      ctx.setLineDash([]);
      A.taxi(ctx, 640, 455, 560, {});
      A.apple(ctx, 880, 95, 58, {});
      X.text(ctx, "BIG APPLE", 360, 90, {
        font: "impact",
        size: 104,
        color: "#f2c21a",
        stroke: INK,
        strokeW: 9,
        maxW: 620,
        extrude: { color: "#151515", n: 6 },
      });
      X.text(ctx, "M O T O R   C A B", 360, 170, {
        font: "condensed",
        size: 40,
        color: "#fff",
        spacing: 2,
        maxW: 520,
      });
      bubble(ctx, 190, 290, 290, 104, 380, 330);
      X.text(ctx, "Just get in", 190, 270, {
        font: "marker",
        size: 38,
        color: INK,
        maxW: 240,
      });
      X.text(ctx, "already!", 190, 312, {
        font: "marker",
        size: 42,
        color: "#c8201a",
        maxW: 240,
      });
      K.fine(
        ctx,
        "Radio-dispatched day & night · Call PLaza 7-1000",
        500,
        470,
        "rgba(255,255,255,0.75)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.taxi(ctx, cx, cy + s * 0.5, s * 3.2, {});
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "solid", "#f2c21a");
      for (let k = 0; k < 2; k++)
        for (let x = 0; x < 400; x += 20)
          if ((x / 20 + k) % 2) {
            ctx.fillStyle = "#151515";
            ctx.fillRect(x, 20 + k * 20, 20, 20);
            ctx.fillRect(x, 540 + k * 20, 20, 20);
          }
      A.apple(ctx, 200, 230, 110, {});
      X.text(ctx, "Just get in", 200, 405, {
        font: "impact",
        size: 52,
        color: INK,
        maxW: 360,
      });
      X.text(ctx, "already!", 200, 462, {
        font: "impact",
        size: 62,
        color: "#c8201a",
        maxW: 360,
      });
      X.text(ctx, "BIG APPLE MOTOR CAB", 200, 515, {
        font: "condensed",
        size: 28,
        color: INK,
        spacing: 3,
        maxW: 360,
      });
    },
  });

  // ==================================================================
  // MAMA MARINARA'S INSTANT MEATBALLS
  // ==================================================================
  def("mama_marinara", {
    name: "Mama Marinara’s Instant Meatballs",
    colors: ["#c8281e", "#f6ecd4", "#2a7a3a"],
    slogans: [
      "Just add water. Mama will never know.",
      "Sunday supper, any night of the week.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "solid", "#f6ecd4");
      ctx.fillStyle = "rgba(200,40,30,0.12)";
      for (let y = 0; y < 470; y += 40)
        for (let x = ((y / 40) % 2) * 40; x < 1000; x += 80)
          ctx.fillRect(x, y, 40, 40);
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = ["#2a7a3a", "#f6ecd4", "#c8281e"][k];
        ctx.fillRect((k * 1000) / 3, 470, 1000 / 3 + 1, 30);
      }
      A.housewife(ctx, 175, 190, 76, { dress: "#2a7a3a", hair: "#d8d4cc" });
      A.can(ctx, 830, 255, 190, 260, marinaraLabel, "#c8c8c0");
      meatballPlate(ctx, 515, 415, 120);
      steam(ctx, 515, 380, 3, 50);
      K.scriptLogo(ctx, "Mama", 515, 80, 100, "#c8281e", "#f6ecd4", {
        maxW: 360,
      });
      X.text(ctx, "MARINARA’S", 515, 162, {
        font: "slab",
        size: 56,
        color: "#2a7a3a",
        maxW: 370,
      });
      X.text(ctx, "INSTANT MEATBALLS", 515, 210, {
        font: "condensed",
        size: 30,
        color: "#c8281e",
        spacing: 4,
        maxW: 370,
      });
      X.text(ctx, "Just add water.", 515, 268, {
        font: "serif",
        size: 36,
        italic: true,
        color: INK,
        maxW: 370,
      });
      X.text(ctx, "Mama will never know.", 515, 314, {
        font: "serif",
        size: 36,
        italic: true,
        color: "#c8281e",
        maxW: 370,
      });
    },
    art(ctx, cx, cy, s) {
      A.can(ctx, cx, cy, s * 1.4, s * 1.9, marinaraLabel, "#c8c8c0");
    },
    posterBg: ["solid", "#f6ecd4", "#f6ecd4"],
    posterInk: "#c8281e",
    posterFont: "script",
  });

  // ==================================================================
  // HI-OCTANE HARRY'S (gas stations)
  // ==================================================================
  def("hi_octane", {
    name: "Hi-Octane Harry’s",
    colors: ["#d8261a", "#ffd23a", "#151515"],
    slogans: [
      "Full service. Full tank. Full speed ahead.",
      "Open six to midnight, every day of the year.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#4a9ae0", "#eaf4f6");
      cloud(ctx, 860, 250, 22, "rgba(255,255,255,0.8)");
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(0, 410, 1000, 90);
      ctx.strokeStyle = "#ffd23a";
      ctx.lineWidth = 6;
      ctx.setLineDash([36, 28]);
      ctx.beginPath();
      ctx.moveTo(0, 455);
      ctx.lineTo(1000, 455);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#e8e4d8";
      ctx.fillRect(470, 405, 210, 10);
      A.gasPump(ctx, 520, 408, 160, "#d8261a");
      A.gasPump(ctx, 625, 408, 160, "#151515");
      A.car(ctx, 840, 446, 300, { body: "#2a8a8a", top: "#f4ecd8" });
      A.harryMark(ctx, 600, 128, 66, {});
      X.text(ctx, "HI-OCTANE", 245, 98, {
        font: "impact",
        size: 104,
        italic: true,
        skew: -0.16,
        color: "#d8261a",
        stroke: "#fff",
        strokeW: 9,
        maxW: 420,
        extrude: { color: "#5a0a06", dx: 1, dy: 1, n: 6 },
      });
      K.scriptLogo(ctx, "Harry’s", 245, 190, 84, "#151515", "#ffd23a", {
        maxW: 380,
      });
      X.text(ctx, "Full service. Full tank.", 245, 272, {
        font: "deco",
        size: 32,
        color: INK,
        maxW: 420,
      });
      X.text(ctx, "Full speed ahead.", 245, 322, {
        font: "deco",
        size: 40,
        color: "#d8261a",
        maxW: 420,
      });
      X.text(ctx, "NEXT EXIT", 165, 455, {
        font: "impact",
        size: 40,
        color: "#fff",
        maxW: 240,
      });
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(300, 440);
      ctx.lineTo(350, 440);
      ctx.lineTo(350, 425);
      ctx.lineTo(385, 455);
      ctx.lineTo(350, 485);
      ctx.lineTo(350, 470);
      ctx.lineTo(300, 470);
      ctx.fill();
    },
    art(ctx, cx, cy, s) {
      A.harryMark(ctx, cx, cy, s * 0.7, {});
    },
    posterBg: ["gradient", "#4a9ae0", "#eaf4f6"],
    posterInk: "#d8261a",
  });

  // ==================================================================
  // FREEDOM FLAKES cereal (Brooklyn Sugar Works)
  // ==================================================================
  def("freedom_flakes", {
    name: "Freedom Flakes",
    colors: ["#1e3a8a", "#c8201a", "#f4c21e"],
    slogans: [
      "The breakfast of a free nation.",
      "Sugar-toasted golden corn, crisp to the last spoonful.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "sunburst", "#fbf2dc", "#f2e2b8", {
        cx: 470,
        cy: 560,
        rays: 34,
      });
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(0, 0, 1000, 26);
      ctx.fillStyle = "#c8201a";
      ctx.fillRect(0, 26, 1000, 8);
      for (let k = 0; k < 14; k++) {
        const x = r() * 1000,
          y = 60 + r() * 380;
        A.ell(ctx, x, y, 13, 9, r() * 3);
        A.fs(ctx, "#e8a83a", 2);
      }
      A.kid(ctx, 165, 200, 82, { shirt: "#1e3a8a", hair: "#e8b848" });
      A.bowl(ctx, 165, 440, 200, "cereal", { color: "#c8201a" });
      A.box3d(ctx, 745, 105, 170, 275, 50, flakesFront, "#14286a", "#f4e8c8");
      X.text(ctx, "FREEDOM", 480, 112, {
        font: "rounded",
        size: 104,
        color: "#1e3a8a",
        stroke: "#fff",
        strokeW: 9,
        maxW: 420,
        extrude: { color: "#0a1a4a", n: 6 },
      });
      X.text(ctx, "FLAKES", 480, 215, {
        font: "rounded",
        size: 110,
        color: "#c8201a",
        stroke: "#fff",
        strokeW: 9,
        maxW: 420,
        extrude: { color: "#6a0e0a", n: 6 },
      });
      K.ribbonText(
        ctx,
        this.slogans[0],
        480,
        322,
        440,
        56,
        "#1e3a8a",
        "#0a1a4a",
        "#fff",
      );
      K.fine(
        ctx,
        "Brooklyn Sugar Works · Part of a hearty breakfast with milk, toast and juice",
        560,
        474,
        "rgba(30,58,138,0.85)",
        15,
      );
    },
    art(ctx, cx, cy, s) {
      A.box3d(
        ctx,
        cx - s * 0.8,
        cy - s * 1.2,
        s * 1.4,
        s * 2.2,
        s * 0.4,
        flakesFront,
        "#14286a",
        "#f4e8c8",
      );
    },
    posterBg: ["sunburst", "#fbf2dc", "#f2e2b8"],
    posterInk: "#1e3a8a",
    posterFont: "rounded",
  });

  // ==================================================================
  // CHOCOLATE ZEPPELIN snack cakes (National Biscuit Co.)
  // ==================================================================
  def("chocolate_zeppelin", {
    name: "Chocolate Zeppelin",
    colors: ["#5a2c12", "#d8dde2", "#fbf2dc"],
    slogans: [
      "Lighter than air. Sweeter than pie.",
      "Chocolate cake with a vanilla-cream heart.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#8ac8ee", "#fdeed8");
      cloud(ctx, 520, 90, 30);
      cloud(ctx, 930, 230, 26, "rgba(255,255,255,0.8)");
      cloud(ctx, 610, 360, 24, "rgba(255,255,255,0.75)");
      A.skyline(ctx, 0, 500, 1000, 150, "rgba(90,110,150,0.55)", X.rng(23));
      A.zeppelin(ctx, 690, 205, 400, {});
      A.zeppelin(ctx, 885, 345, 160, { shadow: false });
      A.zeppelin(ctx, 520, 395, 120, { shadow: false });
      K.scriptLogo(ctx, "Chocolate", 240, 100, 96, "#5a2c12", "#fbf2dc", {
        maxW: 400,
      });
      X.text(ctx, "ZEPPELIN", 240, 188, {
        font: "deco",
        size: 78,
        color: "#5a2c12",
        stroke: "#fbf2dc",
        strokeW: 6,
        spacing: 6,
        maxW: 400,
      });
      X.text(ctx, "Lighter than air.", 240, 268, {
        font: "serif",
        size: 38,
        italic: true,
        color: "#1e3a6a",
        maxW: 400,
      });
      X.text(ctx, "Sweeter than pie.", 240, 316, {
        font: "serif",
        size: 38,
        italic: true,
        color: "#a8401a",
        maxW: 400,
      });
      K.fine(
        ctx,
        "Chocolate cake · vanilla-cream filling · baked by National Biscuit Co., Chelsea",
        500,
        476,
        "rgba(255,255,255,0.92)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.zeppelin(ctx, cx, cy, s * 3.1, { cut: false });
    },
    posterBg: ["gradient", "#8ac8ee", "#fdeed8"],
    posterInk: "#5a2c12",
    posterFont: "deco",
  });

  // ==================================================================
  // GOLDEN PLAIN beef jerky
  // ==================================================================
  def("golden_plain", {
    name: "Golden Plain Jerky",
    colors: ["#7a2a12", "#f4d27a", "#c8401a"],
    slogans: [
      "Tough enough for any trail.",
      "Hickory-smoked and cut thick in Omaha.",
    ],
    bill(ctx, v, r) {
      ctx.fillStyle = A.grad(ctx, 0, 0, 0, 420, [
        [0, "#5a1a2a"],
        [0.45, "#c8401a"],
        [1, "#f4a83a"],
      ]);
      ctx.fillRect(0, 0, 1000, 500);
      A.ell(ctx, 330, 365, 120, 120);
      ctx.fillStyle = A.rgrad(ctx, 330, 365, 20, 130, [
        [0, "#fff2b0"],
        [0.6, "#ffc84a"],
        [1, "rgba(255,170,60,0.4)"],
      ]);
      ctx.fill();
      ctx.fillStyle = "#2a0e08";
      ctx.beginPath();
      ctx.moveTo(0, 420);
      ctx.quadraticCurveTo(250, 380, 520, 405);
      ctx.quadraticCurveTo(780, 430, 1000, 395);
      ctx.lineTo(1000, 500);
      ctx.lineTo(0, 500);
      ctx.fill();
      rider(ctx, 430, 404, 30, "#2a0e08");
      A.jerkyBag(ctx, 820, 255, 200, 290, plainLabel, {});
      A.jerkyStrip(ctx, 700, 420, 120, -0.2, 1);
      A.jerkyStrip(ctx, 930, 425, 110, 0.25, 2);
      X.text(ctx, "GOLDEN PLAIN", 300, 92, {
        font: "slab",
        size: 78,
        color: "#f4d27a",
        stroke: "#3a0e06",
        strokeW: 7,
        maxW: 500,
        extrude: { color: "#3a0e06", n: 5 },
      });
      X.text(ctx, "B E E F   J E R K Y", 300, 165, {
        font: "slab",
        size: 40,
        color: "#fbf0d8",
        maxW: 460,
      });
      X.text(ctx, this.slogans[0], 300, 235, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#fbf0d8",
        maxW: 480,
      });
      K.fine(
        ctx,
        "Hickory-smoked · Cut thick in Omaha, Nebraska · Keeps on the trail, in the glovebox, in the pantry",
        500,
        474,
        "rgba(255,230,190,0.75)",
        15,
      );
    },
    art(ctx, cx, cy, s) {
      A.jerkyBag(ctx, cx, cy, s * 1.6, s * 2.3, plainLabel, {});
    },
    posterBg: ["gradient", "#5a1a2a", "#f4a83a"],
    posterInk: "#f4d27a",
    posterFont: "slab",
  });

  // ==================================================================
  // HOMEGUARD household cleanser
  // ==================================================================
  def("homeguard", {
    name: "Homeguard Cleanser",
    colors: ["#1e3a6a", "#c8201a", "#f4f0e6"],
    slogans: [
      "Defending the American kitchen.",
      "Tough on grease. Gentle on your good china.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "solid", "#cde8e0");
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (let x = 0; x < 1000; x += 50) ctx.fillRect(x, 0, 2, 380);
      for (let y = 380, row = 0; y < 500; y += 30, row++)
        for (let x = (row % 2) * 30; x < 1000; x += 60) {
          ctx.fillStyle = "#1e3a6a";
          ctx.fillRect(x, y, 30, 30);
        }
      ctx.fillStyle = "#f4f0e6";
      ctx.fillRect(0, 376, 1000, 6);
      ctx.fillStyle = "#1e3a6a";
      ctx.fillRect(0, 0, 1000, 56);
      ctx.fillStyle = "#c8201a";
      ctx.fillRect(0, 56, 1000, 6);
      A.housewife(ctx, 165, 205, 74, { dress: "#c8201a", hair: "#e8b848" });
      A.can(ctx, 820, 255, 190, 270, homeguardLabel, "#c8c8c0");
      for (let k = 0; k < 10; k++) {
        const x = 680 + r() * 300,
          y = 90 + r() * 300;
        X.starPath(ctx, x, y, 10 + r() * 14, 3, 4);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
      X.text(ctx, "NEW GRIT-FREE SCOURING ACTION", 500, 30, {
        font: "condensed",
        size: 28,
        color: "#f4f0e6",
        spacing: 6,
        maxW: 900,
      });
      X.text(ctx, "HOMEGUARD", 485, 130, {
        font: "impact",
        size: 92,
        color: "#1e3a6a",
        stroke: "#fff",
        strokeW: 8,
        maxW: 380,
        extrude: { color: "#0a1a3a", n: 5 },
      });
      X.text(ctx, "C L E A N S E R", 485, 205, {
        font: "condensed",
        size: 38,
        color: "#c8201a",
        maxW: 360,
      });
      X.text(ctx, "Defending the", 485, 268, {
        font: "serif",
        size: 36,
        italic: true,
        color: INK,
        maxW: 360,
      });
      X.text(ctx, "American kitchen.", 485, 316, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#c8201a",
        maxW: 370,
      });
    },
    art(ctx, cx, cy, s) {
      A.can(ctx, cx, cy, s * 1.3, s * 1.9, homeguardLabel, "#c8c8c0");
    },
    posterBg: ["solid", "#cde8e0", "#cde8e0"],
    posterInk: "#1e3a6a",
  });

  // ==================================================================
  // LONLY (television)
  // ==================================================================
  /** LONLY mark: the wordmark set in a rounded screen with two antenna strokes. */
  function lonlyMark(ctx, cx, cy, w, ink, fill) {
    const h = w * 0.42;
    A.lin(
      ctx,
      cx - w * 0.08,
      cy - h / 2,
      cx - w * 0.24,
      cy - h * 1.05,
      Math.max(2, w * 0.025),
      ink,
    );
    A.lin(
      ctx,
      cx + w * 0.08,
      cy - h / 2,
      cx + w * 0.26,
      cy - h * 1.0,
      Math.max(2, w * 0.025),
      ink,
    );
    X.rrect(ctx, cx - w / 2, cy - h / 2, w, h, h * 0.3);
    A.fs(ctx, fill, Math.max(2, w * 0.03), ink);
    X.text(ctx, "LONLY", cx, cy + h * 0.03, {
      font: "deco",
      size: h * 0.62,
      color: ink,
      spacing: w * 0.03,
      maxW: w * 0.86,
      noSafe: true,
    });
  }
  X.brandArt.lonlyMark = lonlyMark;
  def("lonly_tv", {
    name: "LONLY Television",
    colors: ["#14262e", "#f0c040", "#efe6d0"],
    slogans: [
      "The best company in the house.",
      "Twenty-three inches of picture, and every one of them sharp.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "radial", "#2a5a6a", "#0a1418", {
        cx: 720,
        cy: 260,
      });
      X.sunburst(
        ctx,
        720,
        260,
        520,
        24,
        "rgba(0,0,0,0)",
        "rgba(240,192,64,0.08)",
      );
      const scr = A.tv(ctx, 720, 285, 190, { cabinet: "#c8a46a" });
      K.testCard(ctx, scr);
      lonlyMark(ctx, 285, 125, 340, "#f0c040", "#14262e");
      X.text(ctx, "T E L E V I S I O N", 285, 240, {
        font: "condensed",
        size: 40,
        color: "#efe6d0",
        maxW: 460,
      });
      X.text(ctx, "The best company", 285, 305, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#efe6d0",
        maxW: 460,
      });
      X.text(ctx, "in the house.", 285, 352, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#f0c040",
        maxW: 460,
      });
      K.fine(
        ctx,
        "23-INCH PICTURE · WALNUT OR BLOND OAK · LONLY ELECTRIC CORP., NEWARK, N.J.",
        500,
        470,
        "rgba(240,192,64,0.85)",
        17,
      );
    },
    art(ctx, cx, cy, s) {
      const scr = A.tv(ctx, cx, cy, s * 1.2, { cabinet: "#c8a46a" });
      K.testCard(ctx, scr);
    },
    posterBg: ["radial", "#2a5a6a", "#0a1418"],
    posterInk: "#f0c040",
    posterFont: "deco",
  });

  // ==================================================================
  // EAGLE MOTORS (cars)
  // ==================================================================
  def("eagle_motors", {
    name: "Eagle Motors",
    colors: ["#1e2e4a", "#c8402a", "#e8eef0"],
    slogans: [
      "Freedom to Explore",
      "The 1967 Eagle Royale. Built for the long way home.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#5aa8e0", "#fbf0dc");
      ctx.fillStyle = "#8a7ab0";
      ctx.beginPath();
      ctx.moveTo(0, 330);
      ctx.lineTo(140, 230);
      ctx.lineTo(260, 300);
      ctx.lineTo(420, 190);
      ctx.lineTo(560, 290);
      ctx.lineTo(720, 170);
      ctx.lineTo(880, 280);
      ctx.lineTo(1000, 220);
      ctx.lineTo(1000, 360);
      ctx.lineTo(0, 360);
      ctx.fill();
      ctx.fillStyle = "#f4f4f8";
      for (const [x, y] of [
        [420, 190],
        [720, 170],
      ]) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 40, y + 28);
        ctx.lineTo(x - 12, y + 20);
        ctx.lineTo(x, y + 30);
        ctx.lineTo(x + 16, y + 20);
        ctx.lineTo(x + 42, y + 30);
        ctx.fill();
      }
      ctx.fillStyle = "#6a9a4a";
      ctx.fillRect(0, 350, 1000, 150);
      ctx.fillStyle = "#4a4a4c";
      ctx.beginPath();
      ctx.moveTo(220, 500);
      ctx.lineTo(690, 352);
      ctx.lineTo(712, 352);
      ctx.lineTo(1000, 500);
      ctx.fill();
      ctx.strokeStyle = "#f2c43a";
      ctx.lineWidth = 5;
      ctx.setLineDash([24, 20]);
      ctx.beginPath();
      ctx.moveTo(610, 500);
      ctx.lineTo(701, 354);
      ctx.stroke();
      ctx.setLineDash([]);
      A.car(ctx, 600, 470, 520, { body: "#c8402a", top: "#f4ecd8" });
      A.eagle(ctx, 860, 100, 82, {});
      X.text(ctx, "EAGLE MOTORS", 285, 78, {
        font: "copper",
        size: 64,
        color: "#1e2e4a",
        stroke: "#fff",
        strokeW: 5,
        spacing: 3,
        maxW: 480,
      });
      K.scriptLogo(ctx, "Freedom to Explore", 285, 160, 64, "#c8402a", "#fff", {
        maxW: 470,
      });
      X.text(ctx, "THE 1967 EAGLE ROYALE · V8", 285, 228, {
        font: "deco",
        size: 28,
        color: "#1e2e4a",
        spacing: 4,
        maxW: 460,
      });
    },
    art(ctx, cx, cy, s) {
      A.car(ctx, cx, cy + s * 0.6, s * 2.8, { body: "#c8402a" });
      A.eagle(ctx, cx, cy - s * 0.9, s * 0.45, {});
    },
    posterBg: ["gradient", "#5aa8e0", "#fbf0dc"],
    posterInk: "#1e2e4a",
    posterFont: "copper",
  });

  // ==================================================================
  // SUPER SERGEANT (Bowery Comics)
  // ==================================================================
  def("super_sergeant", {
    name: "Super Sergeant",
    colors: ["#f2c43a", "#5e6e3a", "#c8201a"],
    slogans: [
      "America’s finest fighting man!",
      "Issue #31: Operation Thunderhead!",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "sunburst", "#f2c43a", "#f8d45a", {
        cx: 720,
        cy: 300,
        rays: 26,
      });
      ctx.fillStyle = "#c8b890";
      ctx.beginPath();
      ctx.moveTo(440, 500);
      ctx.lineTo(520, 430);
      ctx.lineTo(640, 450);
      ctx.lineTo(760, 410);
      ctx.lineTo(880, 440);
      ctx.lineTo(1000, 420);
      ctx.lineTo(1000, 500);
      ctx.fill();
      A.sergeant(ctx, 720, 475, 82, {});
      K.panel(ctx, 0, 0, 420, 500, "#1e3a6a", 0);
      ctx.fillStyle = "#c8201a";
      ctx.fillRect(420, 0, 10, 500);
      X.text(ctx, "SUPER", 210, 92, {
        font: "impact",
        size: 96,
        color: "#f2c43a",
        stroke: INK,
        strokeW: 9,
        maxW: 390,
        extrude: { color: INK, n: 7 },
      });
      X.text(ctx, "SERGEANT", 210, 190, {
        font: "impact",
        size: 84,
        color: "#fff",
        stroke: INK,
        strokeW: 9,
        maxW: 390,
        extrude: { color: INK, n: 7 },
      });
      X.text(ctx, "America’s finest", 210, 272, {
        font: "marker",
        size: 40,
        color: "#fff",
        maxW: 380,
      });
      X.text(ctx, "fighting man!", 210, 322, {
        font: "marker",
        size: 46,
        color: "#f2c43a",
        stroke: INK,
        strokeW: 4,
        maxW: 380,
      });
      K.panel(ctx, 20, 395, 150, 85, "#fff", 4);
      X.text(ctx, "BOWERY", 95, 425, {
        font: "impact",
        size: 28,
        color: "#1e3a6a",
      });
      X.text(ctx, "COMICS", 95, 455, { font: "impact", size: 22, color: INK });
      K.badge(ctx, ["ONLY", "12¢"], 330, 440, 55, "#c8201a", "#fff", 0.15);
    },
    art(ctx, cx, cy, s) {
      A.sergeant(ctx, cx - s * 0.2, cy + s * 1.6, s * 0.72, {});
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "sunburst", "#f2c43a", "#f8d45a", {
        cx: 200,
        cy: 380,
      });
      A.sergeant(ctx, 185, 575, 82, {});
      ctx.fillStyle = "#1e3a6a";
      ctx.fillRect(0, 0, 400, 130);
      ctx.fillStyle = "#c8201a";
      ctx.fillRect(0, 130, 400, 8);
      X.text(ctx, "SUPER SERGEANT", 200, 52, {
        font: "impact",
        size: 52,
        color: "#f2c43a",
        stroke: INK,
        strokeW: 6,
        maxW: 370,
      });
      X.text(
        ctx,
        v % 2 ? "ISSUE #31 · ON SALE NOW" : "AMERICA’S FINEST FIGHTING MAN!",
        200,
        100,
        { font: "marker", size: 24, color: "#fff", maxW: 370 },
      );
      K.badge(ctx, ["BOWERY", "12¢"], 330, 200, 44, "#c8201a", "#fff", 0.15);
    },
  });

  // ==================================================================
  // AMERICAN AUTOMATON CO. (the Valet, the Patrolman, Valet-M)
  // ==================================================================
  def("american_automaton", {
    name: "American Automaton Co.",
    colors: ["#1e3a6a", "#e4dcc6", "#c8201a"],
    slogans: [
      "Built in America, to serve America.",
      "The Valet does the chores. You do the living.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#eef2f0", "#c4d0d8");
      ctx.fillStyle = "#1e3a6a";
      ctx.beginPath();
      ctx.moveTo(560, 0);
      ctx.lineTo(1000, 0);
      ctx.lineTo(1000, 500);
      ctx.lineTo(480, 500);
      ctx.fill();
      ctx.fillStyle = "#c8201a";
      ctx.beginPath();
      ctx.moveTo(540, 0);
      ctx.lineTo(560, 0);
      ctx.lineTo(480, 500);
      ctx.lineTo(460, 500);
      ctx.fill();
      A.stars(ctx, 600, 0, 400, 160, 30, r, "rgba(255,255,255,0.5)");
      A.patrolman(ctx, 690, 230, 90, {});
      A.valet(ctx, 885, 250, 78, { hold: "grip" });
      A.automatonMark(ctx, 100, 102, 46, "#1e3a6a", INK);
      X.text(ctx, "AMERICAN", 335, 82, {
        font: "deco",
        size: 72,
        color: "#1e3a6a",
        spacing: 4,
        maxW: 270,
      });
      X.text(ctx, "AUTOMATON CO.", 335, 152, {
        font: "condensed",
        size: 46,
        color: "#c8201a",
        spacing: 6,
        maxW: 280,
      });
      X.text(ctx, "Built in America,", 245, 250, {
        font: "serif",
        size: 38,
        italic: true,
        color: INK,
        maxW: 410,
      });
      X.text(ctx, "to serve America.", 245, 298, {
        font: "serif",
        size: 38,
        italic: true,
        color: "#c8201a",
        maxW: 410,
      });
      X.text(ctx, "THE VALET · THE PATROLMAN · VALET-M", 245, 360, {
        font: "condensed",
        size: 26,
        color: "#1e3a6a",
        spacing: 2,
        maxW: 410,
      });
      K.fine(
        ctx,
        "American Automaton Co. · Schenectady, New York · Service in every state",
        245,
        470,
        "rgba(0,0,0,0.55)",
        14,
      );
    },
    art(ctx, cx, cy, s) {
      A.valet(ctx, cx - s * 0.2, cy - s * 0.1, s * 0.62, {});
    },
    posterBg: ["gradient", "#eef2f0", "#c4d0d8"],
    posterInk: "#1e3a6a",
    posterFont: "deco",
  });

  // ==================================================================
  // FOREVER FRANKS (hot dog chain)
  // ==================================================================
  def("forever_franks", {
    name: "Forever Franks",
    colors: ["#c8201a", "#f4c21e", "#fbf0d8"],
    slogans: [
      "So good they’ll outlive you!",
      "Frank-in-a-Bun · sealed fresh with Miracle-Keep",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "sunburst", "#c8201a", "#d6301e", {
        cx: 260,
        cy: 330,
        rays: 28,
      });
      ctx.fillStyle = "#fbf0d8";
      ctx.fillRect(0, 440, 1000, 60);
      ctx.fillStyle = "#c8201a";
      for (let x = 0; x < 1000; x += 50) {
        ctx.beginPath();
        ctx.arc(x + 25, 440, 25, 0, Math.PI);
        ctx.fill();
      }
      A.frankMascot(ctx, 255, 452, 76, {});
      X.text(ctx, "FOREVER", 690, 92, {
        font: "rounded",
        size: 96,
        color: "#fbf0d8",
        stroke: INK,
        strokeW: 9,
        maxW: 500,
        extrude: { color: "#5a0a06", n: 6 },
      });
      X.text(ctx, "FRANKS", 690, 196, {
        font: "rounded",
        size: 116,
        color: "#f4c21e",
        stroke: INK,
        strokeW: 10,
        maxW: 500,
        extrude: { color: "#5a0a06", n: 7 },
      });
      K.scriptLogo(
        ctx,
        "So good they’ll outlive you!",
        690,
        290,
        56,
        "#fff",
        "#5a0a06",
        { maxW: 500 },
      );
      X.text(ctx, "HOT DOGS · FRANK-IN-A-BUN · ROOT BEER", 690, 352, {
        font: "condensed",
        size: 26,
        color: "#fbf0d8",
        spacing: 3,
        maxW: 480,
      });
      K.fine(
        ctx,
        "Now with Miracle-Keep*",
        690,
        398,
        "rgba(255,240,216,0.9)",
        18,
      );
      X.text(ctx, "AT CARTS & COUNTERS ALL OVER TOWN · 10¢", 640, 478, {
        font: "condensed",
        size: 26,
        color: "#c8201a",
        spacing: 2,
        maxW: 560,
      });
      K.fine(
        ctx,
        "*a Forever Franks freshness process",
        160,
        488,
        "rgba(200,32,26,0.75)",
        12,
      );
    },
    art(ctx, cx, cy, s) {
      A.frankMascot(ctx, cx - s * 0.1, cy + s * 1.75, s * 0.75, {});
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "sunburst", "#c8201a", "#d6301e", {
        cx: 200,
        cy: 330,
      });
      A.frankMascot(ctx, 190, 470, 74, {});
      X.text(ctx, "FOREVER FRANKS", 200, 55, {
        font: "rounded",
        size: 54,
        color: "#f4c21e",
        stroke: INK,
        strokeW: 7,
        maxW: 370,
      });
      K.ribbonText(
        ctx,
        "SO GOOD THEY’LL OUTLIVE YOU!",
        200,
        530,
        360,
        50,
        "#f4c21e",
        "#a8800a",
        INK,
      );
      K.fine(
        ctx,
        "Now with Miracle-Keep",
        200,
        578,
        "rgba(255,240,216,0.9)",
        16,
      );
    },
  });

  /** Canonical billboard brand order (the city's list, G.LAYOUT.BRANDS, maps onto it 1:1). */
  X.BRAND_ORDER = [
    "fizzo_cola",
    "fizzo_blue",
    "long_winter",
    "prairie_root_beer",
    "liberty_jetliner",
    "first_journal",
    "pizza_galaxy",
    "empire_brew",
    "silver_torch",
    "burger_brigade",
    "excalibur_gardens",
    "junior_rocketeer",
    "miracle_mane",
    "big_apple_cab",
    "mama_marinara",
    "hi_octane",
    "vigil",
    "freedom_flakes",
    "chocolate_zeppelin",
    "golden_plain",
    "homeguard",
    "lonly_tv",
    "eagle_motors",
    "super_sergeant",
    "american_automaton",
    "forever_franks",
    "sky_patrol",
    "worlds_fair",
  ];
  X.EXTRA_BRANDS = [];
})();
