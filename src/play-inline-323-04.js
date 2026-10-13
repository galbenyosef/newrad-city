// play-inline-323 04 — opts
// Lines 706-854 of readable/play-inline-323.pretty.js (statement-aligned).
  PF.flushFires = function () {
    const list = PF.fires.splice(0);
    PF.onInitDone.push(() => {
      if (!PF.live("fx") || typeof G.fx.fire !== "function") return;
      for (const p of list) PF.safe("fire", () => G.fx.fire(p.clone(), 0.5));
    });
  };
  /**
   * Horizontal slab with a walkable collider (floors, platforms). (x0,z0)-(x1,z1), top at y, thickness t.
   */
  PF.slab = function (b, key, x0, z0, x1, z1, y, t, opts) {
    opts = opts || {};
    t = t || 0.3;
    b.boxMM(key, x0, y - t, z0, x1, y, z1, {
      grime: opts.grime,
      segLen: opts.segLen || 6,
      c: opts.c,
    });
    if (!opts.noCollide)
      PF.colMM(x0, y - (opts.colT || Math.max(t, 0.5)), z0, x1, y, z1, {
        surface: opts.surface || "concrete",
      });
  };
  /** Steel-stringer stair with treads, handrails and step colliders (≤0.34 m rise). ry: climbing toward local +Z. */
  PF.steelStair = function (b, x, z, ry, width, run, y0, y1, opts) {
    opts = opts || {};
    const key = opts.key || "steel";
    const rise = y1 - y0,
      n = Math.max(1, Math.ceil(Math.abs(rise) / 0.3));
    const sr = run / n,
      sh = rise / n;
    const P = (lx, ly, lz) => {
      const [wx, wz] = PF.rot(x, z, ry, lx, lz);
      return V3(wx, ly, wz);
    };
    for (let i = 0; i < n; i++) {
      const top = y0 + sh * (i + 1);
      const [wx, wz] = PF.rot(x, z, ry, 0, sr * (i + 0.5));
      b.box(
        opts.tread || "diamond",
        wx,
        top - 0.06,
        wz,
        width,
        0.06,
        sr + 0.04,
        { ry, seg: false, grime: 0.4 },
      );
      PF.col(wx, wz, width, sr + 0.04, top - 0.35, top, ry, {
        surface: "metal",
      });
    }
    // stringers (sloped beams) + handrails
    for (const sg of [-1, 1]) {
      b.beam(
        key,
        P((sg * width) / 2, y0 - 0.1, 0),
        P((sg * width) / 2, y1 - 0.1, run),
        0.08,
        0.3,
        { twist: ry },
      );
      if (opts.rails !== false) {
        b.beam(
          opts.railKey || key,
          P(sg * (width / 2 + 0.02), y0 + 1.0, 0),
          P(sg * (width / 2 + 0.02), y1 + 1.0, run),
          0.05,
          0.05,
          {},
        );
        for (let k = 0; k <= n; k += 3) {
          const t = k / n;
          b.beam(
            opts.railKey || key,
            P(sg * (width / 2 + 0.02), y0 + rise * t, run * t),
            P(sg * (width / 2 + 0.02), y0 + rise * t + 1.0, run * t),
            0.04,
            0.04,
            {},
          );
        }
        const [cx, cz] = PF.rot(x, z, ry, sg * (width / 2 + 0.05), run / 2);
        PF.col(cx, cz, 0.1, run, Math.min(y0, y1), Math.max(y0, y1) + 1.0, ry, {
          walkable: false,
          surface: "metal",
        });
      }
    }
    return n;
  };
  /** Railing run between two points at y (posts + 2 rails) with optional collider. */
  PF.rail = function (b, x0, z0, x1, z1, y, opts) {
    opts = opts || {};
    const key = opts.key || "iron",
      h = opts.h || 1.05;
    b.beam(key, V3(x0, y + h, z0), V3(x1, y + h, z1), 0.06, 0.06, {
      grime: 0.3,
    });
    b.beam(key, V3(x0, y + h * 0.5, z0), V3(x1, y + h * 0.5, z1), 0.04, 0.04, {
      grime: 0.3,
    });
    const len = Math.hypot(x1 - x0, z1 - z0),
      n = Math.max(1, Math.round(len / (opts.step || 1.6)));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      b.box(key, x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, 0.06, h, 0.06, {
        seg: false,
        grime: 0.3,
      });
    }
    if (!opts.noCollide)
      PF.colWall(x0, z0, x1, z1, 0.2, y - 0.2, y + h + 0.2, {
        walkable: false,
        surface: "metal",
      });
  };
  /** Ceiling light bulb in a cage + baked light record + glow. Returns the light record for setLights. */
  PF.cageLamp = function (b, x, y, z, color, parent) {
    b.cyl("iron", x, y + 0.2, z, 0.02, 0.02, 0.6, 4, { hSeg: 1 });
    b.cyl("iron", x, y, z, 0.18, 0.12, 0.2, 8, { hSeg: 1, open: true });
    b.sphere("bulb", x, y - 0.05, z, 0.08, {
      ws: 6,
      hs: 4,
      noAO: true,
      grime: 0,
    });
    PF.glow(V3(x, y - 0.1, z), color || 0xffd8a0, 1.3, parent, {
      intensity: 1.1,
    });
  };
  /** Readable sign interactable + register. */
  /** extra: optional fields merged into the def, e.g. {learn: 'lock_id'} (reading it teaches that code / passcode). */
  PF.note = function (id, name, title, text, extra) {
    return PF.item(
      Object.assign(
        { id, type: "note", name, title, text, weight: 0, value: 0 },
        extra || {},
      ),
    );
  };
  PF.tapeReel = function (id, name, title, text, extra) {
    return PF.item(
      Object.assign(
        { id, type: "tape", name, title, text, weight: 0, value: 0 },
        extra || {},
      ),
    );
  };
