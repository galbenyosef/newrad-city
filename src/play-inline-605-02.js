// play-inline-605 02 — col
// Lines 261-665 of readable/play-inline-605.pretty.js (statement-aligned).
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
