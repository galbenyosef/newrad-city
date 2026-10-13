// play-inline-605 05 — dpr
// Lines 1107-1439 of readable/play-inline-605.pretty.js (statement-aligned).
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
