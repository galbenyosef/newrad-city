// play-inline-605 03 — pos
// Lines 666-769 of readable/play-inline-605.pretty.js (statement-aligned).
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
