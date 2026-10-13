// play-inline-605 04 — dpr
// Lines 770-1106 of readable/play-inline-605.pretty.js (statement-aligned).
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

