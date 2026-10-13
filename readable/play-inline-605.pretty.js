/* src/ui_hud/34_gg_map.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : GOGGLES  MAP  (Local / City) + fast travel.
 *
 * A wireframe survey of the city painted from G.LAYOUT: shorelines with
 * depth contours offshore, terrain contour lines over the park hills,
 * building lots as wire outlines, landmark footprints hatched, district /
 * avenue / street names placed without collisions.  Indoors the local map
 * is a blueprint of the cell built from the world colliders.
 * Shared helpers for the HUD ring minimap: H.ggMapRaster(), H.ggW2M().
 * ===================================================================== */
(function () {
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
  function paintLayout(g, S, col, cw, ch, cull, k, placer) {
    const L = G.LAYOUT,
      w = W();
    k = k || 1; // screen px per map px (1 for the cached raster)
    const detail = !!cull && k > 1.5; // local-map level of detail: outlines, hatching, street names
    const X = (x) => (x - w.minX) * S,
      Z = (z) => (z - w.minZ) * S;
    const cx0 = cull ? cull[0] : 0,
      cy0 = cull ? cull[1] : 0,
      cx1 = cull ? cull[2] : cw,
      cy1 = cull ? cull[3] : ch;
    const vis = (x0, y0, x1, y1) =>
      x1 >= cx0 && x0 <= cx1 && y1 >= cy0 && y0 <= cy1;
    // water: dark, with depth contours stepping out from every shore
    g.fillStyle = BG;
    g.fillRect(cx0, cy0, cx1 - cx0, cy1 - cy0);
    const shapes = (fn) => {
      fn((gg) => {
        gg.beginPath();
        L.MANHATTAN.forEach((p, i) =>
          i ? gg.lineTo(X(p[0]), Z(p[1])) : gg.moveTo(X(p[0]), Z(p[1])),
        );
        gg.closePath();
      });
      fn((gg) => {
        gg.beginPath();
        L.BROOKLYN.forEach((p, i) =>
          i ? gg.lineTo(X(p[0]), Z(p[1])) : gg.moveTo(X(p[0]), Z(p[1])),
        );
        gg.closePath();
      });
      fn((gg) => {
        gg.beginPath();
        gg.arc(X(L.LIBERTY.x), Z(L.LIBERTY.z), L.LIBERTY.r * S, 0, Math.PI * 2);
      });
      fn((gg) => {
        gg.beginPath();
        gg.arc(X(L.ELLIS.x), Z(L.ELLIS.z), L.ELLIS.r * S, 0, Math.PI * 2);
      });
    };
    g.save();
    g.lineJoin = "round";
    for (const d of [95, 65, 40, 20]) {
      // largest first: each band's inner clear leaves the outer rings intact
      const lw = 2 * d * S,
        edge = 1.6 / k;
      shapes((path) => {
        path(g);
        g.strokeStyle = rgba(col, d > 50 ? 0.2 : 0.3);
        g.lineWidth = lw + edge;
        g.stroke();
      });
      shapes((path) => {
        path(g);
        g.strokeStyle = BG;
        g.lineWidth = Math.max(0, lw - edge);
        g.stroke();
      });
    }
    g.restore();
    const poly = (pts, fill, stroke, lw) => {
      g.beginPath();
      pts.forEach((p, i) =>
        i ? g.lineTo(X(p[0]), Z(p[1])) : g.moveTo(X(p[0]), Z(p[1])),
      );
      g.closePath();
      if (fill) {
        g.fillStyle = fill;
        g.fill();
      }
      if (stroke) {
        g.strokeStyle = stroke;
        g.lineWidth = lw || 2;
        g.stroke();
      }
    };
    const circle = (cx, cz, r, fill, stroke) => {
      g.beginPath();
      g.arc(X(cx), Z(cz), r * S, 0, Math.PI * 2);
      if (fill) {
        g.fillStyle = fill;
        g.fill();
      }
      if (stroke) {
        g.strokeStyle = stroke;
        g.lineWidth = 2;
        g.stroke();
      }
    };
    // land: near-black fill, bright shoreline with bloom
    g.save();
    if (!cull) {
      g.shadowColor = rgba(col, 0.7);
      g.shadowBlur = 10;
    } // blur is too costly per-frame in vector mode
    poly(
      L.MANHATTAN,
      "rgba(10,22,30,0.92)",
      rgba(col, 0.9),
      2.2 / Math.max(1, k * 0.6),
    );
    poly(
      L.BROOKLYN,
      "rgba(10,22,30,0.92)",
      rgba(col, 0.9),
      2.2 / Math.max(1, k * 0.6),
    );
    circle(
      L.LIBERTY.x,
      L.LIBERTY.z,
      L.LIBERTY.r,
      "rgba(10,22,30,0.92)",
      rgba(col, 0.9),
    );
    circle(
      L.ELLIS.x,
      L.ELLIS.z,
      L.ELLIS.r,
      "rgba(10,22,30,0.92)",
      rgba(col, 0.9),
    );
    g.restore();
    // city blocks subdivided into building lots
    for (const b of L.blocks) {
      if (
        L.rectOverlapsSite(b.x0, b.z0, b.x1, b.z1, -2) &&
        L.inPark((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2)
      )
        continue;
      if (!vis(X(b.x0), Z(b.z0), X(b.x1), Z(b.z1))) continue;
      const nx = Math.max(1, Math.round((b.x1 - b.x0) / 22)),
        nz = Math.max(1, Math.round((b.z1 - b.z0) / 16));
      for (let i = 0; i < nx; i++)
        for (let j = 0; j < nz; j++) {
          const x0 = b.x0 + ((b.x1 - b.x0) * i) / nx + 1.5,
            x1 = b.x0 + ((b.x1 - b.x0) * (i + 1)) / nx - 1.5;
          const z0 = b.z0 + ((b.z1 - b.z0) * j) / nz + 1.5,
            z1 = b.z0 + ((b.z1 - b.z0) * (j + 1)) / nz - 1.5;
          const cx = (x0 + x1) / 2,
            cz = (z0 + z1) / 2;
          if (!L.isLand(cx, cz) || L.inPark(cx, cz) || L.siteAt(cx, cz))
            continue;
          const hh = G.util.hash2(Math.round(x0 * 3), Math.round(z0 * 3));
          if (detail) {
            // topographic look: faint fill + crisp footprint outline; rubble lots are hatched, not solid
            if (hh < 0.08) {
              g.fillStyle = hatch(g, col, 0.3, 5);
              g.fillRect(X(x0), Z(z0), (x1 - x0) * S, (z1 - z0) * S);
              continue;
            }
            const a = 0.05 + ((hh * 7.31) % 1) * 0.1;
            g.fillStyle = rgba(col, a);
            g.fillRect(X(x0), Z(z0), (x1 - x0) * S, (z1 - z0) * S);
            g.strokeStyle = rgba(col, 0.5);
            g.lineWidth = 1.1 / k;
            g.strokeRect(X(x0), Z(z0), (x1 - x0) * S, (z1 - z0) * S);
            if ((hh * 13.7) % 1 < 0.18) {
              // collapsed corner / courtyard notch
              g.strokeStyle = rgba(col, 0.35);
              g.beginPath();
              g.moveTo(X(x0), Z(z0 + (z1 - z0) * 0.5));
              g.lineTo(X(x0 + (x1 - x0) * 0.5), Z(z0));
              g.stroke();
            }
            continue;
          }
          if (hh < 0.08) continue; // rubble lot
          const a = 0.22 + ((hh * 7.31) % 1) * 0.28;
          g.strokeStyle = rgba(col, a);
          g.lineWidth = 0.75;
          g.strokeRect(
            X(x0) + 0.4,
            Z(z0) + 0.4,
            (x1 - x0) * S - 0.8,
            (z1 - z0) * S - 0.8,
          );
        }
    }
    // Central Park: terrain contour lines (every 4th one brighter)
    const P = L.PARK;
    g.fillStyle = rgba(col, 0.03);
    g.fillRect(X(P.x0), Z(P.z0), (P.x1 - P.x0) * S, (P.z1 - P.z0) * S);
    if (vis(X(P.x0), Z(P.z0), X(P.x1), Z(P.z1))) {
      const segs = parkContours();
      for (let pass = 0; pass < 2; pass++) {
        g.strokeStyle = rgba(col, pass ? 0.55 : 0.24);
        g.lineWidth = (pass ? 1.1 : 0.8) / Math.max(1, k * 0.5);
        g.beginPath();
        for (let i = 0; i < segs.length; i += 5) {
          if ((segs[i + 4] % 4 === 0) !== !!pass) continue;
          g.moveTo(X(segs[i]), Z(segs[i + 1]));
          g.lineTo(X(segs[i + 2]), Z(segs[i + 3]));
        }
        g.stroke();
      }
    }
    g.strokeStyle = rgba(col, 0.6);
    g.lineWidth = 1.5 / Math.max(1, k * 0.6);
    g.setLineDash([6, 4]);
    g.strokeRect(X(P.x0), Z(P.z0), (P.x1 - P.x0) * S, (P.z1 - P.z0) * S);
    g.setLineDash([]);
    for (const kk of ["lake", "reservoir"]) {
      const r = L.PARK_FEATURES[kk];
      if (!r) continue;
      g.fillStyle = BG;
      g.beginPath();
      g.ellipse(
        X((r.x0 + r.x1) / 2),
        Z((r.z0 + r.z1) / 2),
        ((r.x1 - r.x0) / 2) * S,
        ((r.z1 - r.z0) / 2) * S,
        0,
        0,
        Math.PI * 2,
      );
      g.fill();
      g.strokeStyle = rgba(col, 0.7);
      g.lineWidth = 1.2 / Math.max(1, k * 0.6);
      g.stroke();
    }
    // Broadway
    g.strokeStyle = rgba(col, 0.28);
    g.lineWidth = 3;
    g.beginPath();
    L.BROADWAY.forEach((p, i) =>
      i ? g.lineTo(X(p[0]), Z(p[1])) : g.moveTo(X(p[0]), Z(p[1])),
    );
    g.stroke();
    // landmark sites: bright outlines + hatch
    for (const s of L.SITES) {
      if (s.id === "brooklyn_bridge") continue;
      if (cull && !vis(X(s.x0), Z(s.z0), X(s.x1), Z(s.z1))) continue;
      const rx = X(s.x0) + 2,
        rz = Z(s.z0) + 2,
        rw = (s.x1 - s.x0) * S - 4,
        rh = (s.z1 - s.z0) * S - 4;
      g.save();
      if (!detail) {
        g.shadowColor = rgba(col, 0.7);
        g.shadowBlur = 6;
      }
      g.strokeStyle = rgba(col, 0.9);
      g.lineWidth = detail ? 2 / k : 1.6;
      if (detail) {
        // landmark: hatched footprint, double outline, inner "roof" setback for towers, name label
        g.fillStyle = rgba(col, 0.08);
        g.fillRect(rx, rz, rw, rh);
        g.fillStyle = hatch(
          g,
          col,
          s.height > 40 ? 0.55 : 0.32,
          s.height > 40 ? 4 : 6,
        );
        g.fillRect(rx, rz, rw, rh);
        g.strokeRect(rx, rz, rw, rh);
        g.lineWidth = 1 / k;
        g.strokeStyle = rgba(col, 0.55);
        g.strokeRect(rx + 3, rz + 3, Math.max(0, rw - 6), Math.max(0, rh - 6));
        if (s.height > 60) {
          const ix = rw * 0.28,
            iz = rh * 0.28;
          g.strokeStyle = rgba(col, 0.8);
          g.strokeRect(rx + ix, rz + iz, rw - ix * 2, rh - iz * 2);
        }
      } else {
        g.fillStyle = rgba(col, s.height > 40 ? 0.45 : 0.18);
        g.fillRect(rx, rz, rw, rh);
        g.strokeRect(rx, rz, rw, rh);
      }
      g.restore();
    }
    // Brooklyn Bridge
    const bb = L.getSite("brooklyn_bridge");
    if (bb) {
      g.strokeStyle = rgba(col, 0.9);
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(X(bb.x0), Z((bb.z0 + bb.z1) / 2));
      g.lineTo(X(bb.x1), Z((bb.z0 + bb.z1) / 2));
      g.stroke();
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(X(bb.x0), Z(bb.z0));
      g.lineTo(X(bb.x1), Z(bb.z0));
      g.moveTo(X(bb.x0), Z(bb.z1));
      g.lineTo(X(bb.x1), Z(bb.z1));
      g.stroke();
    }
    // Labels (local-map detail only), in priority order through the placer:
    // landmark names > avenue names > street names.  District names are drawn
    // later in screen space by drawMap (see drawDistricts).
    if (detail && k > 1.6) {
      const upper = (t) => String(t || "").toUpperCase();
      g.save();
      g.textAlign = "center";
      g.textBaseline = "middle";
      // landmark names on a dark plate
      const lfs = 12 / k;
      g.font = "600 " + lfs.toFixed(2) + 'px "Share Tech Mono", monospace';
      for (const s of L.SITES) {
        if (
          !s.name ||
          s.id === "brooklyn_bridge" ||
          !vis(X(s.x0), Z(s.z0), X(s.x1), Z(s.z1))
        )
          continue;
        const t = upper(s.name.replace(/^The /, ""));
        const tw = g.measureText(t).width + 6 / k;
        g.save();
        g.translate(X((s.x0 + s.x1) / 2), Z((s.z0 + s.z1) / 2));
        const r = placer ? placer.rectFor(g, tw, 16 / k, 0) : null;
        if (!r || placer.take(r)) {
          g.fillStyle = "rgba(3,8,12,0.84)";
          g.fillRect(-tw / 2, -8 / k, tw, 16 / k);
          g.strokeStyle = rgba(col, 0.5);
          g.lineWidth = 1 / k;
          g.strokeRect(-tw / 2, -8 / k, tw, 16 / k);
          g.fillStyle = rgba(col, 0.95);
          g.fillText(t, 0, 0);
        }
        g.restore();
      }
      const fs = 10.5 / k;
      g.font = "600 " + fs.toFixed(2) + 'px "Share Tech Mono", monospace';
      g.fillStyle = rgba(col, 0.6);
      for (const a of L.avenues || []) {
        if (!a.name || !vis(X(a.x) - 10, Z(a.z0), X(a.x) + 10, Z(a.z1)))
          continue;
        for (
          let z = Math.ceil(a.z0 / 180) * 180 + 60;
          z < a.z1 - 30;
          z += 180
        ) {
          if (
            !vis(X(a.x) - 5, Z(z) - 60, X(a.x) + 5, Z(z) + 60) ||
            L.inPark(a.x, z)
          )
            continue;
          g.save();
          g.translate(X(a.x), Z(z));
          g.rotate(-Math.PI / 2);
          placeText(g, placer, upper(a.name), fs, false, 3 / k);
          g.restore();
        }
      }
      for (const st of L.streets || []) {
        if (!st.name || !vis(X(st.x0), Z(st.z) - 5, X(st.x1), Z(st.z) + 5))
          continue;
        const len = st.x1 - st.x0;
        if (len < 60) continue;
        for (let x = st.x0 + Math.min(80, len / 2); x < st.x1 - 30; x += 240) {
          if (!vis(X(x) - 50, Z(st.z) - 4, X(x) + 50, Z(st.z) + 4)) continue;
          g.save();
          g.translate(X(x), Z(st.z));
          placeText(g, placer, upper(st.name), fs, false, 3 / k);
          g.restore();
        }
      }
      g.restore();
    }
    // compass rose
    g.save();
    g.translate(cw - 70, ch - 90);
    g.strokeStyle = rgba(col, 0.6);
    g.fillStyle = rgba(col, 0.6);
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(0, 0, 30, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(0, -40);
    g.lineTo(6, 0);
    g.lineTo(0, 40);
    g.lineTo(-6, 0);
    g.closePath();
    g.stroke();
    g.beginPath();
    g.moveTo(0, -40);
    g.lineTo(6, 0);
    g.lineTo(-6, 0);
    g.closePath();
    g.fill();
    g.font = '16px "Share Tech Mono", monospace';
    g.fillText("N", 0, -46);
    g.restore();
    // vignette grid lines
    g.strokeStyle = rgba(col, 0.05);
    g.lineWidth = 1;
    for (let x = 0; x < cw; x += 75) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, ch);
      g.stroke();
    }
    for (let y = 0; y < ch; y += 75) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(cw, y);
      g.stroke();
    }
  }

  // ------------------------------------------------------------------
  // Shared map drawing
  // ------------------------------------------------------------------
  let lastOutdoor = { x: -65, z: -705 };
  /** Indoors: the street door that leads into this interior (nearest door whose target lands near us). */
  let entranceCache = { key: null, pos: null };
  function interiorEntrance(p) {
    const key = Math.round(p.x / 100) + "," + Math.round(p.z / 100);
    if (entranceCache.key === key) return entranceCache.pos;
    let best = null,
      bd = 260;
    for (const d of (G.world && G.world.doors) || []) {
      const def = d.def,
        pos = d.pos || (def && def.pos);
      if (
        !def ||
        !def.target ||
        !pos ||
        G.LAYOUT.isInterior(pos.x) ||
        !G.LAYOUT.isInterior(def.target.x)
      )
        continue;
      const dd = Math.hypot(def.target.x - p.x, def.target.z - p.z);
      if (dd < bd) {
        bd = dd;
        best = { x: pos.x, z: pos.z };
      }
    }
    entranceCache = { key, pos: best };
    return best;
  }
  function playerMapPos() {
    const p = G.player.pos;
    if (!G.LAYOUT.isInterior(p.x)) {
      lastOutdoor = { x: p.x, z: p.z };
      return { x: p.x, z: p.z, inside: false };
    }
    const e = interiorEntrance(p);
    if (e) return { x: e.x, z: e.z, inside: true };
    return { x: lastOutdoor.x, z: lastOutdoor.z, inside: true };
  }
  /** Map marker pictogram (26_mapicons.js). */
  function drawLocIcon(g, l, x, y, s, filled, col) {
    const kind = H.locIconKind ? H.locIconKind(l) : "marker";
    if (H.drawMapIcon) {
      H.drawMapIcon(g, kind, x, y, s, filled, col, BG);
      return;
    }
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    g.strokeStyle = col;
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(0, -7);
    g.lineTo(7, 0);
    g.lineTo(0, 7);
    g.lineTo(-7, 0);
    g.closePath();
    g.stroke();
    g.restore();
  }
  // District / water names, drawn in screen space so they stay readable at
  // every zoom (baked-in raster labels shrink to nothing on the overview).
  const DISTRICTS = [
    // [text, x, z, size, rotated?, priority water?]
    ["MIDTOWN", 180, -130, 20],
    ["CENTRAL PARK", 0, -460, 15],
    ["UPPER WEST SIDE", -230, -700, 15, 1],
    ["UPPER EAST SIDE", 230, -700, 15, 1],
    ["HELL’S KITCHEN", -250, -250, 14, 1],
    ["CHELSEA", -220, 120, 15],
    ["GREENWICH VILLAGE", -80, 360, 15],
    ["FINANCIAL DISTRICT", 60, 760, 15],
    ["BROOKLYN", 640, 470, 22],
    ["EAST RIVER", 405, 250, 16, 1, 1],
    ["HUDSON RIVER", -470, 200, 18, 1, 1],
    ["UPPER BAY", -200, 1200, 20, 0, 1],
    ["LIBERTY ISLAND", -420, 1330, 12],
    ["ELLIS ISLAND", -520, 1145, 11],
  ];
  function drawDistricts(g, toS, zoom, dpr, col, placer, detail) {
    g.save();
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (const d of DISTRICTS) {
      const p = toS(d[1], d[2]);
      const fs = H.clamp(d[3] * zoom * 1.25, 10.5, d[3] * 1.05) * dpr;
      g.save();
      g.translate(p[0], p[1]);
      if (d[4] && !detail) g.rotate(-Math.PI / 2); // rivers/long districts run vertically on the overview only
      g.font = "600 " + fs.toFixed(1) + 'px "Share Tech Mono", monospace';
      g.fillStyle = rgba(col, d[5] ? 0.5 : detail ? 0.62 : 0.72);
      const t = d[0].split("").join(detail ? " " : String.fromCharCode(8202));
      placeText(g, placer, t, fs, false, detail ? 3.5 * dpr : 2.5 * dpr);
      g.restore();
    }
    g.restore();
  }

  /**
   * Draw a map view. view: {cx, cz, zoom (px per metre)}. Returns screen-space
   * marker hit list [{x,y,loc}] for mouse picking.
   * opts: selected, hover (location ids), labelZoom, showAll (known-but-undiscovered
   * locations as hollow icons), reserve: [[x0,y0,x1,y1] css px] areas covered by DOM
   * overlays (caption, info box) where no map label may go.
   */
  function drawMap(cv, view, opts) {
    opts = opts || {};
    // keep the backing store matched to the element (layout can settle after the first render)
    const pw = cv.parentNode ? cv.parentNode.offsetWidth : 0,
      ph = cv.parentNode ? cv.parentNode.offsetHeight : 0;
    if (
      cv._size &&
      pw > 10 &&
      (Math.abs(pw * (cv._dpr || 1) - cv.width) > 2 ||
        Math.abs(ph * (cv._dpr || 1) - cv.height) > 2)
    )
      cv._size();
    const g = cv.getContext("2d");
    const Wd = cv.width,
      Hd = cv.height,
      dpr = cv._dpr || 1;
    const col = H.tint().c;
    const src = getMap(),
      own = true;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = BG;
    g.fillRect(0, 0, Wd, Hd);
    const w = W();
    const scale = (view.zoom * dpr) / MAP_S; // screen px per vector-map px
    const toS = (x, z) => [
      ((x - view.cx) * view.zoom + Wd / dpr / 2) * dpr,
      ((z - view.cz) * view.zoom + Hd / dpr / 2) * dpr,
    ];
    // label placer: reserve DOM overlays + the player arrow first so nothing prints under them
    const placer = makePlacer(Wd, Hd, 3 * dpr);
    for (const r of opts.reserve || [])
      placer.block(r[0] * dpr, r[1] * dpr, r[2] * dpr, r[3] * dpr);
    const pp = playerMapPos();
    const pS = toS(pp.x, pp.z);
    placer.block(
      pS[0] - 14 * dpr,
      pS[1] - 14 * dpr,
      pS[0] + 14 * dpr,
      pS[1] + 14 * dpr,
    );
    // building-entrance markers (local map): reserved before any label is placed
    const doorS = [];
    if (opts.doors && G.world && G.world.doors) {
      for (const d of G.world.doors) {
        const pos = d.pos || (d.def && d.def.pos);
        if (!pos || G.LAYOUT.isInterior(pos.x) || (pos.y || 0) > 6) continue;
        const p = toS(pos.x, pos.z);
        if (p[0] < -10 || p[1] < -10 || p[0] > Wd + 10 || p[1] > Hd + 10)
          continue;
        doorS.push(p);
        placer.block(
          p[0] - 5 * dpr,
          p[1] - 7 * dpr,
          p[0] + 5 * dpr,
          p[1] + 7 * dpr,
        );
      }
    }
    const srcPPM = MAP_S; // resolution of the cached raster (px per metre)
    const vector = (view.zoom * dpr) / srcPPM > 1.25 || opts.vector;
    if (vector) {
      // zoomed in: draw the layout as vectors (crisp) with culling
      const S = MAP_S,
        cw = Math.round((w.maxX - w.minX) * S),
        ch = Math.round((w.maxZ - w.minZ) * S);
      const mx = (view.cx - w.minX) * S,
        mz = (view.cz - w.minZ) * S;
      g.save();
      g.setTransform(
        scale,
        0,
        0,
        scale,
        Wd / 2 - mx * scale,
        Hd / 2 - mz * scale,
      );
      const hw = Wd / 2 / scale,
        hh = Hd / 2 / scale;
      paintLayout(
        g,
        S,
        col,
        cw,
        ch,
        [mx - hw, mz - hh, mx + hw, mz + hh],
        scale,
        placer,
      );
      g.restore();
    } else {
      // map image: compute source rect from view
      const wm = Wd / (view.zoom * dpr),
        hm = Hd / (view.zoom * dpr); // metres visible
      const a = w2m(view.cx - wm / 2, view.cz - hm / 2),
        b = w2m(view.cx + wm / 2, view.cz + hm / 2);
      const sx = a.u * src.width,
        sy = a.v * src.height,
        sw = (b.u - a.u) * src.width,
        sh = (b.v - a.v) * src.height;
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
      try {
        g.drawImage(src, sx, sy, sw, sh, 0, 0, Wd, Hd);
      } catch (e) {
        /* ignore */
      }
    }
    // quest markers are reserved before labels so names never cover them
    const qm =
      H.call("quests", "allMarkers", [], null) ||
      H.call("quests", "activeMarkers", [true], []) ||
      [];
    const qS = [];
    for (const m of qm) {
      if (!m || m.x === undefined || G.LAYOUT.isInterior(m.x)) continue;
      const p = toS(m.x, m.z);
      if (p[0] < -30 || p[1] < -30 || p[0] > Wd + 30 || p[1] > Hd + 30)
        continue;
      qS.push([m, p]);
      placer.block(p[0] - 8 * dpr, p[1] - 22 * dpr, p[0] + 8 * dpr, p[1]);
    }
    // location icons: reserve their footprint, draw labels after
    const locs = [];
    for (const l of G.LAYOUT.LOCATIONS) {
      if (l.interior) continue;
      const disc = !!(G.discovered && G.discovered.has(l.id));
      if (!disc && !opts.showAll) continue;
      const p = toS(l.x, l.z);
      if (p[0] < -40 || p[1] < -40 || p[0] > Wd + 40 || p[1] > Hd + 40)
        continue;
      locs.push({ l, p, disc });
      placer.block(
        p[0] - 8 * dpr,
        p[1] - 8 * dpr,
        p[0] + 8 * dpr,
        p[1] + 8 * dpr,
      );
    }
    // district names in screen space
    if (vector || own)
      drawDistricts(
        g,
        toS,
        view.zoom,
        dpr,
        col,
        placer,
        vector && view.zoom > 1,
      );
    const hits = [];
    g.font = 12 * dpr + 'px "Share Tech Mono", monospace';
    g.textAlign = "center";
    g.textBaseline = "middle";
    // selected / hovered first so their labels always win the placement
    locs.sort(
      (a, b) =>
        (b.l.id === opts.selected || b.l.id === opts.hover ? 1 : 0) -
        (a.l.id === opts.selected || a.l.id === opts.hover ? 1 : 0),
    );
    for (const it of locs) {
      const l = it.l,
        p = it.p,
        disc = it.disc;
      const sel = opts.selected === l.id,
        hov = opts.hover === l.id;
      g.shadowColor = col;
      g.shadowBlur = disc ? 6 * dpr : 0;
      // Overview: known-but-unvisited places shrink to faint pips so the city stays readable
      // (the whole-city view stays clean); their hollow pictograms appear once zoomed in
      // or on hover/selection. Visited places always show their solid marker.
      const overview = view.zoom < 0.5;
      if (!disc && overview && !sel && !hov) {
        g.globalAlpha = 0.42;
        g.shadowBlur = 0;
        g.strokeStyle = col;
        g.lineWidth = 1 * dpr;
        g.strokeRect(p[0] - 2 * dpr, p[1] - 2 * dpr, 4 * dpr, 4 * dpr);
        hits.push({ x: p[0] / dpr, y: p[1] / dpr, loc: l, disc });
        g.globalAlpha = 1;
        continue;
      }
      g.globalAlpha = disc ? 1 : sel || hov ? 0.95 : 0.6;
      if (disc) {
        // dark plate behind solid markers so they read over the bright lot raster
        g.save();
        g.shadowBlur = 0;
        g.fillStyle = "rgba(3,8,12,0.78)";
        g.beginPath();
        g.arc(
          p[0],
          p[1],
          8.6 * dpr * (sel ? 1.4 : overview ? 0.8 : 1.1),
          0,
          Math.PI * 2,
        );
        g.fill();
        g.restore();
      }
      drawLocIcon(
        g,
        l,
        p[0],
        p[1],
        dpr * (sel || hov ? 1.35 : disc ? (overview ? 0.82 : 1.1) : 0.95),
        disc,
        col,
      );
      g.shadowBlur = 0;
      if (sel || hov || (disc && view.zoom > (opts.labelZoom || 0.9))) {
        const t =
          sel || hov ? (disc ? l.name : l.name + " (?)") : shortName(l.name);
        g.save();
        g.translate(p[0], p[1] - 15 * dpr);
        g.fillStyle = col;
        placeText(g, placer, t, 12 * dpr, sel || hov, 3 * dpr);
        g.restore();
      }
      if (sel) {
        g.strokeStyle = col;
        g.lineWidth = 1.2 * dpr;
        g.strokeRect(p[0] - 13 * dpr, p[1] - 13 * dpr, 26 * dpr, 26 * dpr);
      }
      hits.push({ x: p[0] / dpr, y: p[1] / dpr, loc: l, disc });
      g.globalAlpha = 1;
    }
    // quest markers: red objective diamonds on a stalk (tracked = filled)
    const tracked = H.call("quests", "tracked", [], null);
    g.shadowColor = H.RED;
    g.shadowBlur = 6 * dpr;
    for (const q of qS) {
      const m = q[0],
        p = q[1];
      const tr = !tracked || m.questId === tracked;
      const s = dpr * 1.1;
      drawObjective(g, p[0], p[1] - 12 * s, s, tr);
      if (opts.questLabels !== false && m.label && view.zoom > 0.8) {
        g.save();
        g.shadowBlur = 0;
        g.translate(p[0], p[1] - 28 * s);
        placeText(g, placer, m.label, 12 * dpr, false, 3 * dpr);
        g.restore();
      }
      g.globalAlpha = 1;
    }
    // local map: building entrances as small door markers (outdoor doors that lead inside)
    if (doorS.length) {
      g.save();
      g.shadowColor = col;
      g.shadowBlur = 4 * dpr;
      for (const p of doorS) {
        const s = dpr * 0.8;
        g.fillStyle = "rgba(3,8,12,0.85)";
        g.fillRect(p[0] - 5 * s, p[1] - 7.5 * s, 10 * s, 15 * s);
        g.strokeStyle = col;
        g.lineWidth = 1.4 * s;
        g.strokeRect(p[0] - 4 * s, p[1] - 6.5 * s, 8 * s, 13 * s);
        g.fillStyle = col;
        g.beginPath();
        g.arc(p[0] + 1.8 * s, p[1] + 0.5 * s, 1.1 * s, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }
    // player: chevron in a ring
    drawPlayer(g, pS[0], pS[1], G.player.yaw, dpr, col);
    if (pp.inside && opts.insideLabel !== false) {
      g.save();
      g.shadowBlur = 0;
      g.fillStyle = col;
      g.translate(pS[0], pS[1] + 24 * dpr);
      placeText(g, placer, "(INDOORS)", 12 * dpr, true, 3 * dpr);
      g.restore();
    }
    g.shadowBlur = 0;
    g.globalAlpha = 1;
    return hits;
  }
  /** Objective marker: a diamond with a short stalk, amber (dimmed when not tracked). */
  function drawObjective(g, x, y, s, on) {
    g.save();
    g.globalAlpha = on ? 1 : 0.55;
    g.strokeStyle = H.RED;
    g.fillStyle = H.RED;
    g.lineWidth = (1.8 * s) / 1.1;
    g.beginPath();
    g.moveTo(x, y - 7 * s);
    g.lineTo(x + 6 * s, y);
    g.lineTo(x, y + 7 * s);
    g.lineTo(x - 6 * s, y);
    g.closePath();
    if (on) {
      g.globalAlpha = 0.35;
      g.fill();
      g.globalAlpha = 1;
    }
    g.stroke();
    g.beginPath();
    g.moveTo(x, y + 7 * s);
    g.lineTo(x, y + 12 * s);
    g.stroke();
    g.restore();
  }
  /** Player marker: open chevron inside a thin ring (heading = yaw). */
  function drawPlayer(g, x, y, yaw, dpr, col) {
    g.save();
    g.translate(x, y);
    g.strokeStyle = col;
    g.lineWidth = 1 * dpr;
    g.globalAlpha = 0.6;
    g.beginPath();
    g.arc(0, 0, 11 * dpr, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
    g.rotate(-yaw);
    g.shadowColor = col;
    g.shadowBlur = 6 * dpr;
    g.fillStyle = col;
    g.strokeStyle = BG;
    g.lineWidth = 1.5 * dpr;
    g.beginPath();
    g.moveTo(0, -10 * dpr);
    g.lineTo(7 * dpr, 8 * dpr);
    g.lineTo(0, 3.5 * dpr);
    g.lineTo(-7 * dpr, 8 * dpr);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
  }
  H.drawObjective = drawObjective;
  H.drawPlayerMark = drawPlayer;
  function shortName(n) {
    return String(n)
      .replace(/\s*[—(-].*$/, "")
      .replace(/^The /, "");
  }

  function setupCanvas(parent) {
    const cv = H.el("canvas", "gg-map", parent);
    const size = () => {
      // offsetWidth/Height ignore CSS transforms (the screen 'power-on' animation scales it)
      const rw = parent.offsetWidth,
        rh = parent.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(10, Math.round(rw * dpr));
      cv.height = Math.max(10, Math.round(rh * dpr));
      cv.style.width = rw + "px";
      cv.style.height = rh + "px";
      cv._dpr = dpr;
    };
    size();
    cv._size = size;
    return cv;
  }

  // ------------------------------------------------------------------
  // Fast travel
  // ------------------------------------------------------------------
  function safeSpot(l) {
    const L = G.LAYOUT;
    for (let r = Math.max(10, l.r * 0.6); r < l.r + 80; r += 6) {
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2 + 0.3;
        const x = l.x + Math.sin(a) * r,
          z = l.z + Math.cos(a) * r;
        if (L.isLand(x, z) && L.isRoad(x, z, false) && !L.siteAt(x, z, 1))
          return { x, z };
      }
    }
    for (let r = l.r * 0.5; r < l.r + 80; r += 6) {
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        const x = l.x + Math.sin(a) * r,
          z = l.z + Math.cos(a) * r;
        if (L.isLand(x, z) && !L.siteAt(x, z, 1)) return { x, z };
      }
    }
    return { x: l.x, z: l.z + l.r };
  }
  function canFastTravel() {
    if (H.combatActive())
      return "You cannot fast travel while enemies are nearby.";
    if (G.player.isOverencumbered && G.player.isOverencumbered())
      return "You are carrying too much to fast travel.";
    if (!G.player.alive) return "You are dead.";
    return null;
  }
  function fastTravel(l) {
    const why = canFastTravel();
    if (why) {
      G.notify(why);
      H.sfx("ui_error");
      return;
    }
    const from = playerMapPos();
    const spot = safeSpot(l);
    const dist = Math.hypot(spot.x - from.x, spot.z - from.z);
    const hours = Math.max(0.25, (dist / 900) * 1.6);
    if (G.goggles && G.goggles.close) G.goggles.close();
    H.showTravel && H.showTravel(l.name);
    G.fadeTransition(() => {
      const yaw = Math.atan2(-(l.x - spot.x), -(l.z - spot.z));
      G.player.teleport(spot.x, 0, spot.z, yaw);
      let h = (G.time.hour || 0) + hours;
      while (h >= 24) {
        h -= 24;
        G.time.day = (G.time.day || 1) + 1;
      }
      if (H.has("atmos", "setHour")) H.call("atmos", "setHour", [h]);
      else G.time.hour = h;
      G.events.emit("fastTravel", l, hours);
    }, 0.6);
  }
  H.fastTravel = fastTravel;

  // ------------------------------------------------------------------
  // INTERIOR local map: indoors the local map is a blueprint of the
  // cell. Built from the world colliders on the player's storey: floor
  // slabs (faint), furniture/obstacles (outlined), walls (bright), doors
  // with their destination names, quest markers inside, the player arrow.
  // ------------------------------------------------------------------
  function interiorName() {
    return H.placeName();
  }
  function drawInterior(cv, view, opts) {
    opts = opts || {};
    const pw = cv.parentNode ? cv.parentNode.offsetWidth : 0,
      ph = cv.parentNode ? cv.parentNode.offsetHeight : 0;
    if (
      cv._size &&
      pw > 10 &&
      (Math.abs(pw * (cv._dpr || 1) - cv.width) > 2 ||
        Math.abs(ph * (cv._dpr || 1) - cv.height) > 2)
    )
      cv._size();
    const g = cv.getContext("2d");
    const Wd = cv.width,
      Hd = cv.height,
      dpr = cv._dpr || 1;
    const col = H.tint().c;
    const z = view.zoom * dpr; // device px per metre
    const toS = (x, zz) => [
      (x - view.cx) * z + Wd / 2,
      (zz - view.cz) * z + Hd / 2,
    ];
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = BG;
    g.fillRect(0, 0, Wd, Hd);
    // blueprint grid: 5 m minor, 25 m major
    const hwm = Wd / z / 2,
      hhm = Hd / z / 2;
    const gx0 = view.cx - hwm,
      gx1 = view.cx + hwm,
      gz0 = view.cz - hhm,
      gz1 = view.cz + hhm;
    for (let gx = Math.floor(gx0 / 5) * 5; gx <= gx1; gx += 5) {
      const sx = toS(gx, 0)[0];
      g.strokeStyle = rgba(col, gx % 25 === 0 ? 0.09 : 0.04);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(sx, 0);
      g.lineTo(sx, Hd);
      g.stroke();
    }
    for (let gz = Math.floor(gz0 / 5) * 5; gz <= gz1; gz += 5) {
      const sy = toS(0, gz)[1];
      g.strokeStyle = rgba(col, gz % 25 === 0 ? 0.09 : 0.04);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, sy);
      g.lineTo(Wd, sy);
      g.stroke();
    }
    const feet = G.player.pos.y;
    const Wo = G.world;
    const cols =
      Wo && Wo.query ? Wo.query(gx0 - 4, gz0 - 4, gx1 + 4, gz1 + 4) : [];
    const floors = [],
      walls = [],
      things = [];
    for (const c of cols) {
      if (
        !c ||
        c.tag === "actor" ||
        c.tag === "player" ||
        c.tag === "interactable_self" ||
        c.tag === "trigger"
      )
        continue;
      if (!G.LAYOUT.isInterior(c.cx)) continue;
      const top = c.maxY,
        bot = c.minY;
      if (top <= feet + 0.35 && top >= feet - 0.8) {
        if (c.hx * c.hz * 4 > 3) floors.push(c);
        continue;
      }
      if (top < feet + 0.35 || bot > feet + 2.1) continue; // other storeys / ceilings
      const tall = top - Math.max(bot, feet) > 1.7,
        thin = Math.min(c.hx, c.hz) < 0.9,
        long = Math.max(c.hx, c.hz) > 1.2;
      if (tall && ((thin && long) || c.hx * c.hz * 4 > 30)) walls.push(c);
      else things.push(c);
    }
    const box = (c, fill, stroke, lw, pad) => {
      const p = toS(c.cx, c.cz);
      g.save();
      g.translate(p[0], p[1]);
      g.rotate(c.yaw || 0);
      const w = (c.hx + (pad || 0)) * z,
        h = (c.hz + (pad || 0)) * z;
      if (fill) {
        g.fillStyle = fill;
        g.fillRect(-w, -h, w * 2, h * 2);
      }
      if (stroke) {
        g.strokeStyle = stroke;
        g.lineWidth = lw;
        g.strokeRect(-w, -h, w * 2, h * 2);
      }
      g.restore();
    };
    for (const c of floors) box(c, rgba(col, 0.07), rgba(col, 0.22), 1 * dpr);
    for (const c of things) box(c, rgba(col, 0.13), rgba(col, 0.5), 1 * dpr);
    g.save();
    g.shadowColor = rgba(col, 0.8);
    g.shadowBlur = 4 * dpr;
    for (const c of walls)
      box(
        c,
        rgba(col, 0.82),
        null,
        0,
        Math.max(0, 1.3 / view.zoom - Math.min(c.hx, c.hz)),
      );
    g.restore();
    if (opts.minimal) return { walls: walls.length, doors: 0 }; // HUD minimap: geometry only
    const placer = makePlacer(Wd, Hd, 3 * dpr);
    for (const r of opts.reserve || [])
      placer.block(r[0] * dpr, r[1] * dpr, r[2] * dpr, r[3] * dpr);
    const pS = toS(G.player.pos.x, G.player.pos.z);
    placer.block(
      pS[0] - 14 * dpr,
      pS[1] - 14 * dpr,
      pS[0] + 14 * dpr,
      pS[1] + 14 * dpr,
    );
    // doors: door marker + destination
    const doors = (Wo && Wo.doors) || [];
    const dm = [];
    for (const d of doors) {
      const pos = d.pos || (d.def && d.def.pos);
      if (!pos || !G.LAYOUT.isInterior(pos.x)) continue;
      if (
        pos.x < gx0 - 2 ||
        pos.x > gx1 + 2 ||
        pos.z < gz0 - 2 ||
        pos.z > gz1 + 2
      )
        continue;
      if (Math.abs((pos.y || 0) - feet) > 3.2) continue;
      const p = toS(pos.x, pos.z);
      const out = d.def && d.def.target && !G.LAYOUT.isInterior(d.def.target.x);
      dm.push({ p, d, out });
      placer.block(
        p[0] - 8 * dpr,
        p[1] - 10 * dpr,
        p[0] + 8 * dpr,
        p[1] + 10 * dpr,
      );
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (const it of dm) {
      const p = it.p,
        s = dpr;
      g.save();
      g.shadowColor = col;
      g.shadowBlur = 5 * dpr;
      g.fillStyle = "rgba(3,8,12,0.85)";
      g.fillRect(p[0] - 6 * s, p[1] - 9 * s, 12 * s, 17 * s);
      g.strokeStyle = col;
      g.lineWidth = 1.6 * s;
      g.strokeRect(p[0] - 5 * s, p[1] - 8 * s, 10 * s, 15 * s);
      if (it.out) {
        g.fillStyle = col;
        g.fillRect(p[0] - 5 * s, p[1] - 8 * s, 10 * s, 15 * s);
        g.fillStyle = BG;
      } else g.fillStyle = col;
      g.beginPath();
      g.arc(p[0] + 2.4 * s, p[1] + 0.5 * s, 1.3 * s, 0, Math.PI * 2);
      g.fill();
      g.restore();
      const lab = String(
        (it.d.def && it.d.def.label) ||
          (typeof it.d.label === "string" ? it.d.label : "") ||
          "Door",
      );
      g.font = "600 " + 11.5 * dpr + 'px "Share Tech Mono", monospace';
      g.fillStyle = col;
      g.save();
      g.translate(p[0], p[1] - 17 * dpr);
      if (
        !placeText(
          g,
          placer,
          (it.out ? "EXIT: " : "") + lab.toUpperCase(),
          11.5 * dpr,
          false,
          3 * dpr,
        )
      ) {
        g.translate(0, 34 * dpr);
        placeText(
          g,
          placer,
          (it.out ? "EXIT: " : "") + lab.toUpperCase(),
          11.5 * dpr,
          false,
          3 * dpr,
        );
      }
      g.restore();
    }
    // quest markers inside this cell
    const qm =
      H.call("quests", "allMarkers", [], null) ||
      H.call("quests", "activeMarkers", [true], []) ||
      [];
    const tracked = H.call("quests", "tracked", [], null);
    for (const m of qm) {
      if (!m || m.x === undefined || !G.LAYOUT.isInterior(m.x)) continue;
      if (m.x < gx0 - 30 || m.x > gx1 + 30 || m.z < gz0 - 30 || m.z > gz1 + 30)
        continue;
      let p = toS(m.x, m.z);
      const s = dpr * 1.1;
      p = [
        H.clamp(p[0], 12 * dpr, Wd - 12 * dpr),
        H.clamp(p[1], 24 * dpr, Hd - 6 * dpr),
      ]; // off-screen: pinned to the edge
      drawObjective(
        g,
        p[0],
        p[1] - 12 * s,
        s,
        !tracked || m.questId === tracked,
      );
    }
    drawPlayer(g, pS[0], pS[1], G.player.yaw, dpr, col);
    // scale bar (5 m) bottom-right, above the caption
    const sb = 5 * z,
      sx = Wd - sb - 14 * dpr,
      sy = Hd - 40 * dpr;
    g.strokeStyle = rgba(col, 0.7);
    g.lineWidth = 1.5 * dpr;
    g.beginPath();
    g.moveTo(sx, sy - 4 * dpr);
    g.lineTo(sx, sy);
    g.lineTo(sx + sb, sy);
    g.lineTo(sx + sb, sy - 4 * dpr);
    g.stroke();
    g.fillStyle = rgba(col, 0.7);
    g.font = 10 * dpr + 'px "Share Tech Mono", monospace';
    g.fillText("5 M", sx + sb / 2, sy - 9 * dpr);
    return { walls: walls.length, doors: dm.length };
  }
  H.ggDrawInterior = drawInterior;

  // ------------------------------------------------------------------
  // LOCAL MAP
  // ------------------------------------------------------------------
  H.ggPage("map", "local", {
    render(body) {
      const wrap = H.el("div", "gg-mapwrap", body);
      this.cv = setupCanvas(wrap);
      this.inside = G.LAYOUT.isInterior(G.player.pos.x);
      this.zoom = this.zoom || 1.4;
      this.izoom = this.izoom || 4.5;
      const cap = H.el("div", "gg-mapcap", wrap);
      this.cap = cap;
      this.wrap = wrap;
      this.note = null;
      this.t = 0;
      this.key = null;
      this.draw();
    },
    draw() {
      const W2 = this.wrap.offsetWidth,
        H2 = this.wrap.offsetHeight;
      const reserve = [[0, this.cap.offsetTop - 3, W2, H2]];
      const inside = G.LAYOUT.isInterior(G.player.pos.x);
      if (inside !== this.inside) {
        this.inside = inside;
      }
      if (inside) {
        const p = G.player.pos;
        const r = drawInterior(
          this.cv,
          { cx: p.x, cz: p.z, zoom: this.izoom },
          { reserve },
        );
        // storey: 0 = entrance level (the floor is added for tall interiors)
        const fl = Math.round(p.y / 3.6);
        H.setText(
          this.cap,
          H.up(interiorName()) +
            (fl
              ? "  ·  " + (fl > 0 ? "LEVEL " + (fl + 1) : "BASEMENT " + -fl)
              : "") +
            (r && !r.walls ? "  ·  NO SCHEMATIC DATA" : ""),
        );
        return;
      }
      const pp = playerMapPos();
      drawMap(
        this.cv,
        { cx: pp.x, cz: pp.z, zoom: this.zoom },
        { labelZoom: 0, reserve, doors: this.zoom >= 1.2 },
      );
      H.setText(
        this.cap,
        H.up(H.placeName()) +
          "  ·  GRID " +
          Math.round(pp.x) +
          " / " +
          Math.round(-pp.z),
      );
    },
    update(dt) {
      // redraw when the player moves/turns (the world is paused while the goggles are up, so this is mostly idle)
      this.t -= dt;
      if (this.t > 0) return;
      this.t = 0.2;
      const p = G.player.pos,
        key =
          Math.round(p.x * 2) +
          "," +
          Math.round(p.z * 2) +
          "," +
          Math.round(p.y) +
          "," +
          Math.round(G.player.yaw * 20) +
          "," +
          this.zoom +
          "," +
          this.izoom;
      if (key !== this.key) {
        this.key = key;
        this.draw();
      }
    },
    zoomBy(f) {
      if (this.inside) this.izoom = H.clamp(this.izoom * f, 1.5, 14);
      else this.zoom = H.clamp(this.zoom * f, 0.8, 6);
      this.draw();
    },
    onWheel(e) {
      this.zoomBy(e.deltaY > 0 ? 0.85 : 1.18);
      return true;
    },
    onKey(code) {
      if (code === "KeyW" || code === "ArrowUp" || code === "Equal") {
        this.zoomBy(1.2);
        return true;
      }
      if (code === "KeyS" || code === "ArrowDown" || code === "Minus") {
        this.zoomBy(1 / 1.2);
        return true;
      }
      return false;
    },
    hints() {
      return [["W/S", "Zoom"]];
    },
  });

  // ------------------------------------------------------------------
  // CITY MAP (pan / zoom / select / fast travel)
  // ------------------------------------------------------------------
  H.ggPage("map", "city", {
    view: null,
    render(body) {
      const self = this;
      const cols = H.el("div", "gg-worldcols", body);
      const wrap = H.el("div", "gg-mapwrap", cols);
      const side = H.el("div", "gg-mapside", cols);
      this.cv = setupCanvas(wrap);
      this.wrap = wrap;
      const pp = playerMapPos();
      // review hook (screenshots only): &discoverAll=1 marks every other location discovered
      if (G.SHOT && G.QS && G.QS.get("discoverAll") && G.discovered)
        G.LAYOUT.LOCATIONS.forEach((l, i) => {
          if (i % 2 === 0) G.discovered.add(l.id);
        });
      // the city map opens on the whole city; zoom/drag from there
      if (!this.view || this.view.fit) this.view = this.fitView();
      if (G.SHOT && G.QS && G.QS.get("mapZoom") && this.view.fit)
        this.view = {
          cx: pp.x,
          cz: pp.z,
          zoom: Number(G.QS.get("mapZoom")) || 1,
        }; // review hook
      this.info = H.el("div", "gg-mapinfo", wrap);
      this.key = null;
      this.infoHTML = null;
      // discovered locations list
      const locs = G.LAYOUT.LOCATIONS.filter(
        (l) => !l.interior && G.discovered && G.discovered.has(l.id),
      ).sort((a, b) => a.name.localeCompare(b.name));
      this.locs = locs;
      H.el("div", "gg-h", side, "[ FAST TRAVEL ]");
      const icol = H.tint().c;
      const iconMark = (l) => {
        const u =
          H.mapIconURL && H.locIconKind
            ? H.mapIconURL(H.locIconKind(l), icol, true)
            : "";
        return u ? '<img class="gg-lic" alt="" src="' + u + '">' : "";
      };
      this.list = H.ggList(
        side,
        locs.map((l) => ({
          label: shortName(l.name),
          mark: iconMark(l),
          right: Math.round(Math.hypot(l.x - pp.x, l.z - pp.z) / 10) * 10 + "m",
        })),
        "map/city",
        {
          empty: "No locations discovered yet.",
          onSelect(i, it) {
            const l = locs[i];
            self.selected = l.id;
            if (self.view && !self.view.fit) self.panTo(l.x, l.z);
            self.draw();
          },
          onActivate(i) {
            self.travel(locs[i]);
          },
        },
      );
      // mouse: drag to pan, wheel zoom, click marker select, double-click travel
      let drag = null;
      this.cv.addEventListener("mousedown", (e) => {
        drag = {
          x: e.clientX,
          y: e.clientY,
          cx: self.view.cx,
          cz: self.view.cz,
          moved: false,
        };
      });
      if (self._up) window.removeEventListener("mouseup", self._up); // re-renders must not stack listeners
      self._up = () => {
        drag = null;
      };
      window.addEventListener("mouseup", self._up);
      this.cv.addEventListener("mousemove", (e) => {
        // offsetX/Y are in the canvas' own (untransformed) space
        const mx = e.offsetX,
          my = e.offsetY;
        if (drag) {
          const dx = e.clientX - drag.x,
            dy = e.clientY - drag.y;
          if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
          self.view.cx = drag.cx - dx / self.view.zoom;
          self.view.cz = drag.cz - dy / self.view.zoom;
          self.view.fit = false;
          self.clampView();
          self.draw();
          return;
        }
        const h = self.pick(mx, my);
        const id = h ? h.loc.id : null;
        if (id !== self.hover) {
          self.hover = id;
          self.draw();
        }
      });
      this.cv.addEventListener("click", (e) => {
        if (drag && drag.moved) return;
        const h = self.pick(e.offsetX, e.offsetY);
        if (h) {
          const i = locs.indexOf(h.loc);
          if (i >= 0) self.list.setSel(i, true);
          else {
            self.selected = h.loc.id;
            self.draw();
            H.sfx("ui_hover", { volume: 0.35 });
          }
        }
      });
      this.cv.addEventListener("dblclick", (e) => {
        const h = self.pick(e.offsetX, e.offsetY);
        if (h) self.travel(h.loc);
      });
      this.draw();
    },
    leave() {
      if (this._up) {
        window.removeEventListener("mouseup", this._up);
        this._up = null;
      }
      this.view = null;
      this.selected = null;
      this.hover = null; // reopen on the whole-city view
    },
    /** zoom that fits the whole playable world (Manhattan, Brooklyn shore, the bay and islands) */
    fitZoom() {
      const w = W(),
        cw = (this.cv && this.cv.width / (this.cv._dpr || 1)) || 600,
        ch = (this.cv && this.cv.height / (this.cv._dpr || 1)) || 420;
      return Math.min(cw / (w.maxX - w.minX), ch / (w.maxZ - w.minZ)) * 0.98;
    },
    fitView() {
      const w = W();
      return {
        cx: (w.minX + w.maxX) / 2,
        cz: (w.minZ + w.maxZ) / 2,
        zoom: this.fitZoom(),
        fit: true,
      };
    },
    minZoom() {
      return Math.min(0.22, this.fitZoom() * 0.95);
    },
    pick(mx, my) {
      let best = null,
        bd = 16;
      for (const h of this.hits || []) {
        const d = Math.hypot(h.x - mx, h.y - my);
        if (d < bd) {
          bd = d;
          best = h;
        }
      }
      return best;
    },
    panTo(x, z) {
      this.view.cx = x;
      this.view.cz = z;
      this.clampView();
    },
    clampView() {
      const w = W();
      this.view.cx = H.clamp(this.view.cx, w.minX, w.maxX);
      this.view.cz = H.clamp(this.view.cz, w.minZ, w.maxZ);
    },
    setZoom(z) {
      this.view.zoom = H.clamp(z, this.minZoom(), 4);
      this.view.fit = false;
      this.draw();
    },
    /** redraw key: anything that changes the picture (the world is paused while the goggles are up) */
    viewKey() {
      const v = this.view,
        p = G.player.pos;
      return (
        v.cx.toFixed(1) +
        "," +
        v.cz.toFixed(1) +
        "," +
        v.zoom.toFixed(4) +
        "|" +
        this.selected +
        "|" +
        this.hover +
        "|" +
        Math.round(p.x) +
        "," +
        Math.round(p.z) +
        "," +
        Math.round(G.player.yaw * 20) +
        "|" +
        (this.cv ? this.cv.width + "x" + this.cv.height : "") +
        "|" +
        (G.discovered ? G.discovered.size : 0) +
        "|" +
        H.settings.tint
      );
    },
    draw() {
      if (!this.cv) return;
      // the info box (top-left) is a DOM overlay: keep map labels out from under it
      const ib = this.info,
        reserve =
          ib && ib.offsetWidth
            ? [
                [
                  ib.offsetLeft - 4,
                  ib.offsetTop - 4,
                  ib.offsetLeft + ib.offsetWidth + 4,
                  ib.offsetTop + ib.offsetHeight + 4,
                ],
              ]
            : [];
      this.hits = drawMap(this.cv, this.view, {
        selected: this.selected,
        hover: this.hover,
        labelZoom: 0.95,
        showAll: true,
        reserve,
      });
      this.key = this.viewKey();
      const l = G.LAYOUT.getLocation(this.selected || this.hover);
      let html;
      if (l) {
        const disc = G.discovered && G.discovered.has(l.id);
        const kind = H.locIconKind ? H.locIconKind(l) : "";
        const kl =
          kind && H.locKindLabel
            ? H.locKindLabel(kind)
            : (l.type || "").toUpperCase();
        html =
          "<b>" +
          H.esc(H.up(l.name)) +
          "</b><br>" +
          H.esc(kl) +
          (disc && l.hostile
            ? H.call("combat", "isLocationCleared", [l.id], false)
              ? " · CLEARED"
              : " · HOSTILE"
            : "") +
          (disc && l.level ? " · LVL " + H.esc(l.level) : "") +
          (disc
            ? '<br><span class="gg-hint-sm">ENTER / DOUBLE-CLICK: FAST TRAVEL</span>'
            : '<br><span class="gg-hint-sm">UNDISCOVERED &middot; REACH IT ON FOOT</span>');
      } else
        html =
          H.esc(H.up(H.placeName())) +
          '<br><span class="gg-hint-sm">' +
          H.gameDate() +
          " · " +
          H.gameClock() +
          "</span>";
      if (html !== this.infoHTML) {
        this.infoHTML = html;
        H.setHTML(this.info, html);
      }
    },
    travel(l) {
      if (!l) return;
      if (!(G.discovered && G.discovered.has(l.id))) {
        H.sfx("ui_error");
        return;
      }
      const why = canFastTravel();
      if (why) {
        G.notify(why);
        H.sfx("ui_error");
        return;
      }
      GG.confirm(
        "Fast travel to " + l.name + "?",
        () => fastTravel(l),
        "Travel",
        "Cancel",
      );
    },
    t: 0,
    update(dt) {
      // redraw only when something visible changed (was: full redraw every 0.12 s)
      this.t -= dt;
      if (this.t > 0 || !this.view) return;
      this.t = 0.12;
      if (this.view.fit) {
        const z = this.fitZoom();
        if (Math.abs(z - this.view.zoom) > 1e-4) this.view.zoom = z;
      }
      if (this.viewKey() !== this.key) this.draw();
    },
    onWheel(e) {
      this.setZoom(this.view.zoom * (e.deltaY > 0 ? 0.85 : 1.18));
      return true;
    },
    onKey(code) {
      const v = this.view;
      if (code === "Equal" || code === "NumpadAdd") {
        this.setZoom(v.zoom * 1.25);
        return true;
      }
      if (code === "Minus" || code === "NumpadSubtract") {
        this.setZoom(v.zoom / 1.25);
        return true;
      }
      if (code === "KeyF") {
        this.view = this.fitView();
        this.draw();
        H.sfx("ui_hover", { volume: 0.35 });
        return true;
      }
      if (code === "KeyC") {
        const pp = playerMapPos();
        this.panTo(pp.x, pp.z);
        if (v.zoom < 0.6) v.zoom = 0.6;
        v.fit = false;
        this.selected = null;
        this.draw();
        return true;
      }
      return false;
    },
    hints() {
      return [
        ["Enter", "Travel"],
        ["Drag", "Pan"],
        ["+/-", "Zoom"],
        ["C", "Centre"],
        ["F", "Whole city"],
      ];
    },
  });

  // Track last outdoor position every frame (for the map arrow while indoors)
  H.part({
    name: "ggmap",
    order: 31,
    update() {
      playerMapPos();
    },
  });
  H.playerMapPos = playerMapPos;
})();
