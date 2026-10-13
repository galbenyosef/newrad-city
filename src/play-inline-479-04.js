// play-inline-479 04 — spec
// Lines 1630-1976 of readable/play-inline-479.pretty.js (statement-aligned).
  const COVERS = {
    sb_riflemans_companion: {
      style: "hard",
      t: "THE RIFLEMAN'S",
      t2: "COMPANION",
      bg: "#3a4a2a",
      fg: "#e0c060",
      art: "rifle",
      ink: "#e8d890",
    },
    sb_super_sergeant: {
      style: "comic",
      t: "SUPER",
      t2: "SERGEANT #22",
      bg: "#1e3a6a",
      fg: "#f2c43a",
      art: "chevron",
      ink: "#c8201a",
    },
    sb_golden_gloves: {
      style: "mag",
      t: "GOLDEN GLOVES",
      t2: "ANNUAL",
      bg: "#e8e0c8",
      band: "#1e3a7a",
      fg: "#ffffff",
      art: "glove",
      ink: "#b02020",
    },
    sb_demolitions: {
      style: "pamphlet",
      t: "FM 5-25",
      t2: "DEMOLITIONS",
      bg: "#d8d0a8",
      fg: "#3a4a1a",
      art: "grenade",
      ink: "#3a4a1a",
    },
    sb_bellevue_manual: {
      style: "journal",
      t: "BELLEVUE HOSPITAL",
      t2: "EMERGENCY WARD",
      bg: "#f0ece2",
      fg: "#1e2a4a",
      art: "cross",
      ink: "#b01c18",
    },
    sb_motor_manual: {
      style: "mag",
      t: "HOLLIS MOTOR",
      t2: "REPAIR MANUAL",
      bg: "#d87a28",
      band: "#2a2a2a",
      fg: "#f0c050",
      art: "wrench",
      ink: "#2a1a0c",
    },
    sb_handyman: {
      style: "hard",
      t: "HANDYMAN'S",
      t2: "BIG BOOK",
      bg: "#7a2a1a",
      fg: "#e8d090",
      art: "wrench",
      ink: "#e8d090",
    },
    sb_radio_handbook: {
      style: "hard",
      t: "RADIO AMATEUR",
      t2: "HANDBOOK",
      bg: "#1e2c52",
      fg: "#d8b048",
      art: "bolt",
      ink: "#e8d070",
    },
    sb_popular_circuits: {
      style: "mag",
      t: "POPULAR",
      t2: "CIRCUITS",
      bg: "#20306a",
      band: "#f0c020",
      fg: "#1a1a3a",
      art: "tube",
      ink: "#f0f0ff",
    },
    sb_bureau_manual: {
      style: "hard",
      t: "BUREAU SEPT",
      t2: "MANUEL DE TERRAIN",
      bg: "#1a1a24",
      fg: "#c8c8d8",
      art: "eye",
      ink: "#c8c8d8",
    },
    sb_art_of_the_pitch: {
      style: "hard",
      t: "THE ART OF",
      t2: "THE PITCH",
      bg: "#1a2448",
      fg: "#d8d8e0",
      art: "handshake",
      ink: "#c8c8d8",
    },
    sb_pushcart_king: {
      style: "pamphlet",
      t: "PUSHCART",
      t2: "KING",
      bg: "#c89a60",
      fg: "#4a2410",
      art: "hat",
      ink: "#4a2410",
    },
    sb_survival_handbook: {
      style: "pamphlet",
      t: "SURVIVAL",
      t2: "HANDBOOK",
      bg: "#ece0bc",
      fg: "#1e3a7a",
      art: "tent",
      ink: "#3a5a2a",
    },
  };
  function paintCover(c, x, y, spec, seed) {
    const r = rng(seed);
    const art = PICTO[spec.art] || PICTO.star;
    c.fillStyle = spec.bg;
    c.fillRect(x, y, CELL, CELL);
    if (spec.style === "mag") {
      c.fillStyle = spec.band;
      c.fillRect(x, y, CELL, 38);
      text(c, spec.t, x + 64, y + 13, 15, spec.fg, { maxW: 118 });
      text(c, spec.t2, x + 64, y + 30, 13, spec.fg, {
        maxW: 118,
        italic: true,
      });
      // halftone backdrop behind the art
      c.fillStyle = "rgba(0,0,0,0.08)";
      for (let i = 0; i < 70; i++) {
        c.beginPath();
        c.arc(
          x + 20 + (i % 10) * 10,
          y + 48 + Math.floor(i / 10) * 10,
          2.2,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
      art(c, x + 64, y + 80, 58, spec.ink, spec.bg);
      c.fillStyle = spec.band;
      c.beginPath();
      c.arc(x + 108, y + 110, 13, 0, Math.PI * 2);
      c.fill();
      text(c, "25¢", x + 108, y + 110, 10, spec.fg);
      text(c, "MAR 1967", x + 30, y + 118, 8, spec.ink, {
        weight: "normal",
        font: "Arial, sans-serif",
      });
    } else if (spec.style === "comic") {
      c.fillStyle = spec.fg;
      c.beginPath();
      for (let i = 0; i < 18; i++) {
        const a = (i * Math.PI) / 9,
          rr = i % 2 ? 40 : 58;
        c.lineTo(x + 64 + Math.cos(a) * rr, y + 80 + Math.sin(a) * rr * 0.8);
      }
      c.closePath();
      c.fill();
      art(
        c,
        x + 64,
        y + 82,
        54,
        spec.ink === "#f0f0f0" ? spec.bg : spec.ink,
        spec.fg,
      );
      text(c, spec.t, x + 64, y + 16, 19, spec.fg, {
        maxW: 120,
        stroke: "#1a0a04",
        strokeW: 4,
      });
      text(c, spec.t2, x + 64, y + 34, 10, spec.ink, { maxW: 118 });
      c.fillStyle = "#ffffff";
      c.fillRect(x + 6, y + 6, 18, 14);
      text(c, "10¢", x + 15, y + 13, 8, "#1a1a1a");
    } else if (spec.style === "hard") {
      c.strokeStyle = spec.fg;
      c.lineWidth = 3;
      c.strokeRect(x + 9, y + 9, CELL - 18, CELL - 18);
      c.lineWidth = 1;
      c.strokeRect(x + 14, y + 14, CELL - 28, CELL - 28);
      text(c, spec.t, x + 64, y + 32, 14, spec.fg, {
        maxW: 96,
        font: 'Georgia, "Times New Roman", serif',
      });
      text(c, spec.t2, x + 64, y + 48, 10, spec.fg, {
        maxW: 96,
        font: 'Georgia, "Times New Roman", serif',
      });
      art(c, x + 64, y + 86, 44, spec.ink, spec.bg);
      // cloth weave
      c.fillStyle = "rgba(255,255,255,0.035)";
      for (let i = 0; i < CELL; i += 3) c.fillRect(x, y + i, CELL, 1);
    } else if (spec.style === "journal") {
      c.fillStyle = spec.fg;
      c.fillRect(x, y + 6, CELL, 4);
      c.fillRect(x, y + 44, CELL, 2);
      text(c, spec.t, x + 64, y + 20, 10, spec.fg, {
        maxW: 116,
        font: 'Georgia, "Times New Roman", serif',
      });
      text(c, spec.t2, x + 64, y + 34, 9, spec.fg, {
        maxW: 116,
        font: 'Georgia, "Times New Roman", serif',
        weight: "normal",
      });
      art(c, x + 64, y + 76, 40, spec.ink, spec.bg);
      lines(c, x + 14, y + 100, 100, 22, 4, "rgba(30,40,70,0.45)", seed + 5);
    } else {
      // pamphlet
      c.fillStyle = spec.fg;
      c.fillRect(x + 6, y + 6, CELL - 12, 40);
      text(c, spec.t, x + 64, y + 18, 15, spec.bg, { maxW: 110 });
      text(c, spec.t2, x + 64, y + 36, 13, spec.bg, { maxW: 110 });
      art(c, x + 64, y + 84, 56, spec.ink, spec.bg);
      text(c, "CIVIL DEFENSE SERIES", x + 64, y + 120, 7, spec.fg, {
        weight: "normal",
        font: "Arial, sans-serif",
      });
    }
    // age: sun-faded top, foxing, creased corner
    wear(c, x, y, seed, 1.1);
    c.fillStyle = "rgba(150,110,50,0.10)";
    for (let i = 0; i < 8; i++) {
      c.beginPath();
      c.arc(x + r() * CELL, y + r() * CELL, 2 + r() * 5, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "rgba(245,235,210,0.5)";
    c.beginPath();
    c.moveTo(x + CELL, y + CELL - 16);
    c.lineTo(x + CELL, y + CELL);
    c.lineTo(x + CELL - 16, y + CELL);
    c.closePath();
    c.fill();
  }
  Object.keys(COVERS).forEach((name, i) => {
    PAINT[name] = (c, x, y) => paintCover(c, x, y, COVERS[name], 200 + i * 13);
  });
  /** Stacked page edges (side faces of books, comics and pamphlets). */
  PAINT.page_edge = (c, x, y) => {
    c.fillStyle = "#e4dac0";
    c.fillRect(x, y, CELL, CELL);
    const r = rng(311);
    for (let i = 0; i < CELL; i += 2) {
      c.fillStyle = "rgba(90,70,40," + (0.06 + r() * 0.12) + ")";
      c.fillRect(x, y + i, CELL, 1);
    }
    wear(c, x, y, 312, 0.8);
  };

  function build() {
    if (built) return tex;
    built = true;
    if (typeof document === "undefined" || !THREE) return null;
    try {
      canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      for (const name of CELLS) {
        const p = cellXY(name);
        ctx.save();
        ctx.beginPath();
        ctx.rect(p.x, p.y, CELL, CELL);
        ctx.clip();
        try {
          (PAINT[name] || PAINT.white)(ctx, p.x, p.y);
        } catch (e) {
          ctx.fillStyle = "#fff";
          ctx.fillRect(p.x, p.y, CELL, CELL);
        }
        ctx.restore();
      }
      tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.userData = { shared: true };
    } catch (e) {
      G.reportError("rpg:art", e);
      tex = null;
    }
    return tex;
  }

  /** UV rect of a cell (inset so mip levels don't bleed the neighbours in). */
  function cell(name) {
    const p = cellXY(INDEX[name] !== undefined ? name : "white");
    const u0 = (p.x + INSET) / SIZE,
      u1 = (p.x + CELL - INSET) / SIZE;
    const v1 = 1 - (p.y + INSET) / SIZE_H,
      v0 = 1 - (p.y + CELL - INSET) / SIZE_H;
    return { u0, v0, u1, v1 };
  }
  const WHITE = (() => {
    const c = cell("white");
    return { u: (c.u0 + c.u1) / 2, v: (c.v0 + c.v1) / 2 };
  })();

  // ------------------------------------------------------------------
  // Geometry kit (vertex colour + atlas UVs; parts are merged into one mesh)
  // ------------------------------------------------------------------
  /** Vertex colour with subtle per-vertex grime variation (AO-ish, darker at the base). */
  function paintVar(g, color, jitter) {
    const c = new THREE.Color(color),
      n = g.attributes.position.count,
      a = new Float32Array(n * 3);
    const pos = g.attributes.position;
    for (let i = 0; i < n; i++) {
      const y = pos.getY(i);
      const k =
        1 -
        (jitter === undefined ? 0.08 : jitter) *
          U.hash2(i * 7 + 3, Math.round(y * 97)) -
        (y < 0.005 ? 0.12 : 0);
      a[i * 3] = c.r * k;
      a[i * 3 + 1] = c.g * k;
      a[i * 3 + 2] = c.b * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(a, 3));
    return g;
  }
  /** Point every UV at the white texel (plain vertex-coloured part). */
  function uvWhite(g) {
    const n = g.attributes.position.count,
      a = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      a[i * 2] = WHITE.u;
      a[i * 2 + 1] = WHITE.v;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(a, 2));
    return g;
  }
  /** Remap the geometry's own 0..1 UVs into a cell; `filter(i)` limits it to some vertices (others → white). */
