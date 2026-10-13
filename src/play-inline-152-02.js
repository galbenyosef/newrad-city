// play-inline-152 02 — len
// Lines 19-145 of readable/play-inline-152.pretty.js (statement-aligned).
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  /** Grid of windows on a facade. rows: [{y, h, arch, style}], bays: array of u centres. */
  P.windowGrid = function (F, bays, rows, o) {
    o = o || {};
    const rn = P.rng((o.seed || 1) + F.c * 7.1 + F.len);
    for (const u of bays)
      for (const R of rows) {
        let style = R.style || "dark";
        const q = rn();
        if (!R.style)
          style =
            q < (o.broken || 0.2)
              ? "broken"
              : q < (o.broken || 0.2) + (o.boarded || 0.08)
                ? "boarded"
                : q < (o.broken || 0.2) + (o.boarded || 0.08) + (o.lit || 0)
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
  /** Mansard / hip roof prism along a wing: eave line (x0,z0)-(x1,z1) axis-aligned, depth w, from y0 to y1, ridge width rw. */
  function mansard(b, key, cx, cz, len, w, alongX, y0, y1, rw, o) {
    o = o || {};
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(rw / 2, y1 - y0);
    sh.lineTo(-rw / 2, y1 - y0);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: len,
      bevelEnabled: false,
    }).translate(0, 0, -len / 2);
    // shape in XY, extruded along Z → the prism runs along Z; rotate for X-running wings
    b.geo(key, g, P.m4(cx, y0, cz, alongX ? HP : 0), { grime: 0.3 });
    // copper cresting on the ridge
    if (o.crest !== false)
      b.box(
        "verdigris",
        alongX ? cx - len / 2 : cx - rw / 2 - 0.1,
        y1,
        alongX ? cz - rw / 2 - 0.1 : cz - len / 2,
        alongX ? cx + len / 2 : cx + rw / 2 + 0.1,
        y1 + 0.35,
        alongX ? cz + rw / 2 + 0.1 : cz + len / 2,
        { seg: false },
      );
  }
  P.mansard = mansard;
  function dormer(b, F, u, y, d, o) {
    o = o || {};
    F.box(o.key || "slate", u - 0.8, u + 0.8, y, y + 1.9, d - 1.5, d, {
      seg: false,
    });
    const sh = new THREE.Shape();
    sh.moveTo(-0.95, 0);
    sh.lineTo(0.95, 0);
    sh.lineTo(0, 0.85);
    sh.closePath();
    b.extrude(o.trim || "brownstone", sh, 1.7, F.mat(u, y + 1.9, d - 1.6), {
      seg: false,
    });
    F.box(
      o.trim || "brownstone",
      u - 0.9,
      u + 0.9,
      y + 1.85,
      y + 2.0,
      d - 1.6,
      d + 0.1,
      { seg: false },
    );
    F.box(
      o.style === "lit"
        ? "window_lit"
        : o.style === "broken"
          ? "glass_broken"
          : "glass_dark",
      u - 0.5,
      u + 0.5,
      y + 0.25,
      y + 1.6,
      d,
      d + 0.03,
      { seg: false },
    );
    F.box(
      "paint_white",
      u - 0.03,
      u + 0.03,
      y + 0.25,
      y + 1.6,
      d + 0.02,
      d + 0.06,
      { seg: false },
    );
    const p = F.pt(u, d - 0.1);
    b.cyl("verdigris", p[0], y + 2.8, p[1], 0.02, 0.06, 0.7, 5);
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
