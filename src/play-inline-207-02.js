// play-inline-207 02 — opts
// Lines 25-114 of readable/play-inline-207.pretty.js (statement-aligned).
  const PF = G._pf;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = Math.PI / 2,
    TAU = Math.PI * 2;

  const TX0 = 92,
    TX1 = 108,
    TZ0 = 858,
    TZ1 = 872; // tavern footprint
  const EAVE = 11.5,
    RIDGE = 15.2;
  const BASE = 6;

  Object.assign(PF.flagDefaults, {
    ft_rumour: 0,
    ft_quiz: 0,
    ft_tricorn: false,
    ft_room: false,
    ft_ring: false,
    ft_eggs: 0,
  });

  /** Georgian 12-over-12 sash window with white frame, muntins, stone lintel+keystone and sill. */
  function sash(b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    b.quad(
      opts.broken ? "glass_broken" : opts.lit ? "window_lit" : "glass_dark",
      x + s * 0.01,
      y + h / 2,
      z + c * 0.01,
      w,
      h,
      { ry, noAO: true, grime: 0.1 },
    );
    const fk = "white_paint";
    const f = (lx, ly, ww, hh) => {
      const p = P(lx, ly, 0.05);
      b.box(fk, p.x, p.y, p.z, ww, hh, 0.1, { ry, seg: false, grime: 0.3 });
    };
    f(0, -0.06, w + 0.2, 0.12);
    f(0, h - 0.06, w + 0.2, 0.12);
    f(-w / 2 - 0.05, 0, 0.1, h);
    f(w / 2 + 0.05, 0, 0.1, h);
    f(0, h / 2 - 0.04, w, 0.08); // meeting rail
    if (!opts.broken) {
      for (let i = 1; i < 3; i++) {
        const lx = -w / 2 + (i * w) / 3;
        const p = P(lx, 0, 0.04);
        b.box(fk, p.x, p.y, p.z, 0.035, h, 0.04, { ry, seg: false });
      }
      for (const yy of [h * 0.25, h * 0.75]) {
        const p = P(0, yy, 0.04);
        b.box(fk, p.x, p.y, p.z, w, 0.035, 0.04, { ry, seg: false });
      }
    }
    // splayed stone lintel with keystone, sill
    const l = P(0, h + 0.02, 0.08);
    b.box("limestone", l.x, l.y, l.z, w + 0.55, 0.32, 0.18, {
      ry,
      seg: false,
      grime: 0.4,
    });
    const k = P(0, h, 0.12);
    b.box("limestone", k.x, k.y, k.z, 0.26, 0.42, 0.2, { ry, seg: false });
    const sl = P(0, -0.12, 0.12);
    b.box("limestone", sl.x, sl.y, sl.z, w + 0.35, 0.1, 0.25, {
      ry,
      seg: false,
    });
    if (opts.shutters)
      for (const sg of [-1, 1]) {
        const p = P(sg * (w / 2 + 0.33), 0, 0.08);
        b.box("paint_teal", p.x, p.y, p.z, 0.5, h, 0.05, {
          ry: ry + sg * (opts.shutOpen ? 0.25 : 0),
          seg: false,
          grime: 0.6,
        });
      }
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
