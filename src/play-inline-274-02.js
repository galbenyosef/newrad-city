// play-inline-274 02 — style
// Lines 31-196 of readable/play-inline-274.pretty.js (statement-aligned).
  const P = G._uw,
    D = P.dress,
    X = P.parts;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  /** Grid of windows on a facade (bays × rows). */
  P.windowGrid = function (F, bays, rows, o) {
    o = o || {};
    const rn = P.rng((o.seed || 1) + F.c * 7.1 + F.len);
    for (const u of bays)
      for (const R of rows) {
        let style = R.style || "dark";
        const q = rn();
        const br = o.broken === undefined ? 0.2 : o.broken,
          bo = o.boarded === undefined ? 0.08 : o.boarded,
          li = o.lit || 0;
        if (!R.style)
          style =
            q < br
              ? "broken"
              : q < br + bo
                ? "boarded"
                : q < br + bo + li
                  ? "lit"
                  : "dark";
        F.window(
          u,
          R.y,
          R.w || o.w || 1.3,
          R.h,
          Object.assign(
            {
              arch: R.arch,
              style,
              frame: o.frame || "paint_white",
              sill: o.sill,
              hood: R.hood || o.hood,
              hoodKey: o.hoodKey,
              keystone: R.arch ? o.keystone || o.sill : undefined,
              mull: R.mull,
            },
            R.extra || {},
          ),
        );
      }
  };
  /** Mansard prism along one facade: slope from the wall line (y0) back to inset `ins` at y1. */
  P.mansardSide = function (S, F, u0, u1, y0, y1, ins, key) {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(0.35, 0);
    sh.lineTo(0.2, 0.35);
    sh.lineTo(-ins, y1 - y0);
    sh.lineTo(-ins - 0.8, y1 - y0);
    sh.lineTo(-ins - 0.8, 0);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: u1 - u0,
      bevelEnabled: false,
    });
    // shape x = outward (d), y = up; extrude along -u from u1 → u0
    const p = F.pt(u1, 0);
    const m = new THREE.Matrix4()
      .makeBasis(
        new THREE.Vector3(F.nx, 0, F.nz),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(-F.dx, 0, -F.dz),
      )
      .setPosition(p[0], y0, p[1]);
    S.b.geo(key || "slate", g, m, { uv: "box", grime: 0.35 });
    // copper cresting on the top edge
    F.box("verdigris", u0, u1, y1 - 0.05, y1 + 0.3, -ins - 0.1, -ins + 0.1, {
      seg: false,
    });
  };
  function dormer(S, F, u, y, d, o) {
    o = o || {};
    const b = S.b;
    F.box(
      o.key || "terracotta_cream",
      u - 0.75,
      u + 0.75,
      y,
      y + 1.9,
      d - 1.4,
      d,
      { seg: false },
    );
    F.box(
      o.style === "lit"
        ? "window_lit"
        : o.style === "broken"
          ? "glass_broken"
          : "glass_dark",
      u - 0.48,
      u + 0.48,
      y + 0.2,
      y + 1.5,
      d,
      d + 0.03,
      { seg: false },
    );
    F.box(
      "paint_white",
      u - 0.03,
      u + 0.03,
      y + 0.2,
      y + 1.5,
      d + 0.02,
      d + 0.06,
      { seg: false },
    );
    // arched hood
    F.arch(
      o.trim || "terracotta_cream",
      u,
      y + 1.55,
      0.55,
      0.22,
      d - 0.1,
      d + 0.12,
    );
    F.box(
      "verdigris",
      u - 0.85,
      u + 0.85,
      y + 1.9,
      y + 2.05,
      d - 1.5,
      d + 0.1,
      { seg: false },
    );
    void b;
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  const X0 = -186,
    X1 = -134,
    Z0 = -538,
    Z1 = -492,
    XC = -160,
    ZC = -515;
  const TR = 5.2,
    BASE = 7.5,
    CORN = 40,
    TOPW = 41.2,
    DECK = 48;
  const TOW = [
    [X0 + 4.5, Z0 + 4.5],
    [X1 - 4.5, Z0 + 4.5],
    [X0 + 4.5, Z1 - 4.5],
    [X1 - 4.5, Z1 - 4.5],
  ];
  const ROWS = [];
  for (let i = 0; i < 9; i++)
    ROWS.push({
      y: 8.7 + i * 3.35,
      h: 2.1,
      hood: i === 0 ? "pediment" : i % 3 === 2 ? "cornice" : undefined,
    });
  ROWS.push({ y: 38.2, h: 1.5, arch: true });

