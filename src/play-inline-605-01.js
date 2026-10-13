// play-inline-605 01 — step
// Lines 13-260 of readable/play-inline-605.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const H = G.hud._;
  const GG = H.GG;

  // ------------------------------------------------------------------
  // Map source (theirs or ours)
  // ------------------------------------------------------------------
  const MAPSRC = { canvas: null, color: null };
  function W() {
    return G.LAYOUT.WORLD;
  }
  function w2m(x, z) {
    const w = W();
    return {
      u: (x - w.minX) / (w.maxX - w.minX),
      v: (z - w.minZ) / (w.maxZ - w.minZ),
    };
  }
  /** The cached wireframe raster (MAP_S px per metre) in the current goggle tint. */
  function getMap() {
    const col = H.tint().c;
    if (!MAPSRC.canvas || MAPSRC.color !== col) {
      MAPSRC.canvas = paintOwnMap(col);
      MAPSRC.color = col;
    }
    return MAPSRC.canvas;
  }
  H.ggMapRaster = getMap;
  H.ggW2M = w2m;
  const BG = "#03080c";

  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return (
      "rgba(" +
      ((n >> 16) & 255) +
      "," +
      ((n >> 8) & 255) +
      "," +
      (n & 255) +
      "," +
      a +
      ")"
    );
  }
  /** Paint the wireframe survey map from the layout (cached raster). */
  const MAP_S = 0.75; // px per metre of the cached raster map
  H.MAP_S = MAP_S;
  function paintOwnMap(col) {
    const w = W(),
      S = MAP_S;
    const cw = Math.round((w.maxX - w.minX) * S),
      ch = Math.round((w.maxZ - w.minZ) * S);
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    paintLayout(c.getContext("2d"), S, col, cw, ch, null);
    return c;
  }
  /**
   * Paint the layout in "map pixel" space (X = (x-minX)*S). Used both for the
   * cached raster and, with a zooming transform + cull rect, for crisp vector
   * rendering of the local / zoomed-in world map.
   */
  const hatchCache = {};
  /** Diagonal hatch pattern (map-pixel space) used for landmark footprints and ruined lots. */
  function hatch(g, col, a, step) {
    const key = col + a + step;
    if (!hatchCache[key]) {
      const c = document.createElement("canvas");
      c.width = c.height = step;
      const h = c.getContext("2d");
      h.strokeStyle = rgba(col, a);
      h.lineWidth = 1;
      h.beginPath();
      h.moveTo(-1, step + 1);
      h.lineTo(step + 1, -1);
      h.stroke();
      hatchCache[key] = c;
    }
    return g.createPattern(hatchCache[key], "repeat");
  }
  /**
   * Label placer: keeps a list of screen-space (device px) rectangles already
   * used by labels/markers.  A label is drawn only if its rotated bounding box
   * lies fully inside the viewport and overlaps nothing placed before it, so
   * names never clip at the edge ("MIDT…") or overprint each other.
   */
  function makePlacer(w, h, margin) {
    return {
      w,
      h,
      m: margin === undefined ? 3 : margin,
      rects: [],
      /** rect of a text box centred at the current transform origin, size tw×th in current units */
      rectFor(g, tw, th, pad) {
        const M = g.getTransform(),
          hx = tw / 2 + (pad || 0),
          hy = th / 2 + (pad || 0);
        let x0 = Infinity,
          y0 = Infinity,
          x1 = -Infinity,
          y1 = -Infinity;
        for (let i = 0; i < 4; i++) {
          const x = i & 1 ? hx : -hx,
            y = i & 2 ? hy : -hy;
          const sx = M.a * x + M.c * y + M.e,
            sy = M.b * x + M.d * y + M.f;
          if (sx < x0) x0 = sx;
          if (sx > x1) x1 = sx;
          if (sy < y0) y0 = sy;
          if (sy > y1) y1 = sy;
        }
        return [x0, y0, x1, y1];
      },
      fits(r, edgeOk) {
        if (
          !edgeOk &&
          (r[0] < this.m ||
            r[1] < this.m ||
            r[2] > this.w - this.m ||
            r[3] > this.h - this.m)
        )
          return false;
        for (const q of this.rects)
          if (r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1])
            return false;
        return true;
      },
      take(r, force) {
        if (!force && !this.fits(r)) return false;
        this.rects.push(r);
        return true;
      },
      block(x0, y0, x1, y1) {
        this.rects.push([x0, y0, x1, y1]);
      },
    };
  }
  H.ggPlacer = makePlacer;
  /** Draw text centred at the current origin if the placer accepts it (dark outline for legibility). */
  function placeText(g, placer, t, fs, force, outline) {
    const tw = g.measureText(t).width;
    if (placer) {
      const r = placer.rectFor(g, tw, fs, fs * 0.15);
      if (!placer.take(r, force)) return false;
    }
    if (outline) {
      g.lineJoin = "round";
      g.strokeStyle = "rgba(3,8,12,0.92)";
      g.lineWidth = outline;
      g.strokeText(t, 0, 0);
    }
    g.fillText(t, 0, 0);
    return true;
  }
  /**
   * Contour segments over the park hills (marching squares on
   * G.world.terrainHeight, 1.5 m interval).  Flat array [x0,z0,x1,z1,level,…]
   * in world metres, built once.
   */
  let CONTOURS = null;
  function parkContours() {
    if (CONTOURS) return CONTOURS;
    const P = G.LAYOUT.PARK,
      step = 8,
      LV = 1.5,
      out = [];
    const nx = Math.max(1, Math.ceil((P.x1 - P.x0) / step)),
      nz = Math.max(1, Math.ceil((P.z1 - P.z0) / step));
    const hs = new Float32Array((nx + 1) * (nz + 1));
    let hmax = 0;
    for (let j = 0; j <= nz; j++)
      for (let i = 0; i <= nx; i++) {
        let h = 0;
        try {
          h = G.world.terrainHeight(P.x0 + i * step, P.z0 + j * step) || 0;
        } catch (e) {
          h = 0;
        }
        hs[j * (nx + 1) + i] = h;
        if (h > hmax) hmax = h;
      }
    const lerpT = (a, b, l) =>
      Math.abs(b - a) < 1e-6 ? 0.5 : (l - a) / (b - a);
    for (let li = 1; li * LV < hmax; li++) {
      const l = li * LV;
      for (let j = 0; j < nz; j++)
        for (let i = 0; i < nx; i++) {
          const a = hs[j * (nx + 1) + i],
            b = hs[j * (nx + 1) + i + 1],
            c = hs[(j + 1) * (nx + 1) + i + 1],
            d = hs[(j + 1) * (nx + 1) + i];
          const idx =
            (a > l ? 8 : 0) |
            (b > l ? 4 : 0) |
            (c > l ? 2 : 0) |
            (d > l ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          const x = P.x0 + i * step,
            z = P.z0 + j * step;
          const T = [x + lerpT(a, b, l) * step, z],
            Rr = [x + step, z + lerpT(b, c, l) * step],
            B = [x + lerpT(d, c, l) * step, z + step],
            Lf = [x, z + lerpT(a, d, l) * step];
          const seg = (p, q) => out.push(p[0], p[1], q[0], q[1], li);
          switch (idx) {
            case 1:
            case 14:
              seg(Lf, B);
              break;
            case 2:
            case 13:
              seg(B, Rr);
              break;
            case 3:
            case 12:
              seg(Lf, Rr);
              break;
            case 4:
            case 11:
              seg(T, Rr);
              break;
            case 6:
            case 9:
              seg(T, B);
              break;
            case 7:
            case 8:
              seg(Lf, T);
              break;
            case 5:
              seg(Lf, T);
              seg(B, Rr);
              break;
            case 10:
              seg(T, Rr);
              seg(Lf, B);
              break;
            default:
              break;
          }
        }
    }
    CONTOURS = out;
    return out;
  }
