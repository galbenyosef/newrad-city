// play-inline-12 08 — band
// Lines 1953-2126 of readable/play-inline-12.pretty.js (statement-aligned).
  X.facadeMask = function (name) {
    if (maskTex[name] !== undefined) return maskTex[name];
    if (!X.GEN[name] || !X.GEN[name].facade) {
      maskTex[name] = null;
      return null;
    }
    G.tex.get(name);
    let src = maskCanvas[name];
    if (!src) {
      const d = X.GEN[name];
      wantM[name] = true;
      try {
        X.paintSurface(name, d);
      } finally {
        wantM[name] = false;
      }
      src = maskCanvas[name];
    }
    if (!src) {
      maskTex[name] = null;
      return null;
    }
    const regen = () => {
      const d = X.GEN[name];
      wantM[name] = true;
      try {
        X.paintSurface(name, d);
      } finally {
        wantM[name] = false;
      }
      const c = maskCanvas[name];
      delete maskCanvas[name];
      return c;
    };
    const tex = X.toTexture(src, { name: name + "_win", regen, srgb: false });
    delete maskCanvas[name];
    maskTex[name] = tex;
    return tex;
  };
  /**
   * Window placement inside one room cell (bay × storey) for the interior shader, in cell units [-1, 1] (y up):
   * [window half-width, sill y, head y, windows per cell]. Mirrors the generator geometry above (glass rect incl. reveal).
   */
  const WIN_RECT = {
    tenement: [0.42, -0.53, 0.56, 1],
    artdeco: [0.63, -0.33, 0.8, 1],
    brownstone: [0.45, -0.6, 0.56, 1],
    warehouse: [0.68, -0.58, 0.49, 1],
    office: [0.9, -0.25, 0.97, 2],
    office_3: [0.9, 0.03, 0.97, 2],
  };
  X.facadeWinRect = function (name) {
    const m = /^facade_([a-z]+)_(\d+)$/.exec(name || "");
    if (!m) return null;
    return (
      (m[1] === "office" && m[2] === "3"
        ? WIN_RECT.office_3
        : WIN_RECT[m[1]]) || null
    );
  };
  /** Procedural wall-detail parameters for a façade atlas: {a:[kind,cols,rows,stagger], b:[offU,offV,jointHalfW,relief]} or null. */
  X.facadeWallSpec = function (name) {
    const m = /^facade_([a-z]+)_(\d+)$/.exec(name || "");
    if (!m || !TRIM_WALL[m[1]]) return null;
    const wall = TRIM_WALL[m[1]][(+m[2] - 1) % TRIM_WALL[m[1]].length];
    const sp = WALL_SPEC[/^brick_/.test(wall) ? "brick" : wall];
    return sp ? { a: sp[0], b: sp[1] } : null;
  };
  /** Legacy no-op (night is handled by the material glow driver). */
  X.setFacadeNight = function () {};

  // ==================================================================
  // STOREFRONTS
  // ==================================================================
  const SHOPS = [
    {
      name: "DELICATESSEN",
      font: "didone",
      band: "#2a4a3a",
      ink: "#e8d8a0",
      state: "broken",
      sub: "KOSHER · SANDWICHES",
    },
    {
      name: "Pharmacy",
      font: "script",
      band: "#7a1e1a",
      ink: "#f0e6c8",
      state: "intact",
      sub: "PRESCRIPTIONS · SODA FOUNTAIN",
    },
    {
      name: "HARDWARE",
      font: "slab",
      band: "#1e2e4a",
      ink: "#e0c060",
      state: "shutter",
      sub: "TOOLS · PAINT · KEYS CUT",
    },
    {
      name: "PAWN SHOP",
      font: "impact",
      band: "#3a2a1a",
      ink: "#e8c040",
      state: "boarded",
      sub: "LOANS · GOLD · RADIOS",
    },
    {
      name: "Bar & Grill",
      font: "script",
      band: "#1a1a1a",
      ink: "#ff5a3a",
      state: "broken",
      sub: "COCKTAILS · STEAKS",
    },
    {
      name: "LONLY TV",
      font: "deco",
      band: "#2a2a4a",
      ink: "#f0d060",
      state: "intact",
      sub: "SALES · SERVICE · TUBES",
    },
    {
      name: "LAUNDROMAT",
      font: "rounded",
      band: "#3a7a8a",
      ink: "#f8f4e8",
      state: "shutter",
      sub: "COIN-OP · 24 HRS",
    },
    {
      name: "DINER",
      font: "deco",
      band: "#b02a22",
      ink: "#fff4d0",
      state: "broken",
      sub: "BREAKFAST ALL DAY",
    },
    {
      name: "Bakery",
      font: "script",
      band: "#6a4a2a",
      ink: "#f4e4c0",
      state: "boarded",
      sub: "CHOCOLATE ZEPPELINS SOLD HERE",
    },
    {
      name: "LIQUORS",
      font: "impact",
      band: "#2a3a1a",
      ink: "#e8e0c0",
      state: "broken",
      sub: "WINES · SPIRITS",
    },
    {
      name: "BOOKS",
      font: "serif",
      band: "#4a2a3a",
      ink: "#e8d8b0",
      state: "intact",
      sub: "NEW & USED · COMICS",
    },
    {
      name: "BARBER",
      font: "copper",
      band: "#e8e0d0",
      ink: "#9a1e1a",
      state: "shutter",
      sub: "SHAVE & A HAIRCUT",
    },
  ];
  X.SHOPS = SHOPS;

