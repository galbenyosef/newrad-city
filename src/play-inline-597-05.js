// play-inline-597 05 — dpr
// Lines 1235-1559 of readable/play-inline-597.pretty.js (statement-aligned).
  function drawMinimap() {
    const cv = HUD.mm,
      g = HUD.mmCtx,
      dpr = HUD.mmDpr,
      S = HUD.mmS;
    const P = G.player,
      col = H.tint().c;
    const W = S * dpr,
      c = W / 2,
      R = W / 2 - 13 * dpr,
      Rin = R - 1.5 * dpr;
    const zoom = MM.zoom * (S / MM.css) * dpr; // device px per metre
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, W);
    const inside = G.LAYOUT.isInterior(P.pos.x);
    // map disc
    g.save();
    g.beginPath();
    g.arc(c, c, Rin, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = "rgba(3,8,12,0.62)";
    g.fillRect(0, 0, W, W);
    if (!inside && H.ggMapRaster) {
      const src = H.ggMapRaster(),
        ms = H.MAP_S,
        wd = G.LAYOUT.WORLD;
      const k = zoom / ms; // device px per raster px
      const rr = Rin / k + 4; // raster px radius needed
      const px = (P.pos.x - wd.minX) * ms,
        pz = (P.pos.z - wd.minZ) * ms;
      const sx = Math.max(0, px - rr),
        sy = Math.max(0, pz - rr),
        ex = Math.min(src.width, px + rr),
        ey = Math.min(src.height, pz + rr);
      g.translate(c, c);
      g.rotate(P.yaw);
      g.scale(k, k);
      g.globalAlpha = 0.95;
      if (ex > sx && ey > sy) {
        try {
          g.drawImage(
            src,
            sx,
            sy,
            ex - sx,
            ey - sy,
            sx - px,
            sy - pz,
            ex - sx,
            ey - sy,
          );
        } catch (e) {
          /* ignore */
        }
      }
      g.globalAlpha = 1;
    } else if (inside && H.ggDrawInterior) {
      // indoors: blueprint of the cell (refreshed a few times a second, blitted heading-up)
      if (!HUD.mmInterior) {
        HUD.mmInterior = document.createElement("canvas");
        HUD.mmInteriorT = 0;
      }
      const ic = HUD.mmInterior,
        isz = Math.ceil(Rin * 2.9);
      if (ic.width !== isz) {
        ic.width = ic.height = isz;
        HUD.mmInteriorT = 0;
      }
      if (HUD.mmInteriorT <= 0) {
        HUD.mmInteriorT = 0.25;
        ic._dpr = 1;
        try {
          H.ggDrawInterior(
            ic,
            { cx: P.pos.x, cz: P.pos.z, zoom: zoom * 2.2 },
            { minimal: true },
          );
        } catch (e) {
          H.warnOnce("minimap.interior", e);
        }
        HUD.mmIntPos = { x: P.pos.x, z: P.pos.z };
      }
      const z2 = zoom * 2.2,
        dx = (HUD.mmIntPos.x - P.pos.x) * z2,
        dz = (HUD.mmIntPos.z - P.pos.z) * z2;
      g.translate(c, c);
      g.rotate(P.yaw);
      g.drawImage(ic, -isz / 2 + dx, -isz / 2 + dz);
    }
    g.restore();
    // faint scan cross (no inner ring: it distracted from the map)
    g.lineWidth = 1 * dpr;
    g.strokeStyle = rgba(col, 0.1);
    g.beginPath();
    g.moveTo(c - Rin, c);
    g.lineTo(c + Rin, c);
    g.moveTo(c, c - Rin);
    g.lineTo(c, c + Rin);
    g.stroke();
    // markers (map space → heading-up screen)
    const zIn = inside ? zoom * 2.2 : zoom;
    const toScr = (x, z) => {
      const dx = (x - P.pos.x) * zIn,
        dz = (z - P.pos.z) * zIn;
      const cs = Math.cos(P.yaw),
        sn = Math.sin(P.yaw);
      return [c + dx * cs - dz * sn, c + dx * sn + dz * cs];
    };
    for (const m of markerCache) {
      let p = toScr(m.x, m.z);
      const dd = Math.hypot(p[0] - c, p[1] - c);
      const out = dd > Rin - 6 * dpr;
      if (out && m.kind !== "quest") continue;
      if (out) {
        const f = (Rin - 6 * dpr) / dd;
        p = [c + (p[0] - c) * f, c + (p[1] - c) * f];
      }
      if (m.kind === "enemy") {
        g.fillStyle = H.RED;
        g.globalAlpha = m.alerted ? 1 : 0.7;
        g.shadowColor = H.RED;
        g.shadowBlur = 5 * dpr;
        g.beginPath();
        g.arc(p[0], p[1], 2.6 * dpr, 0, Math.PI * 2);
        g.fill();
        g.shadowBlur = 0;
        g.globalAlpha = 1;
      } else if (m.kind === "friend") {
        g.strokeStyle = col;
        g.globalAlpha = 0.7;
        g.lineWidth = 1.2 * dpr;
        g.beginPath();
        g.arc(p[0], p[1], 2.4 * dpr, 0, Math.PI * 2);
        g.stroke();
        g.globalAlpha = 1;
      } else if (m.kind === "loc") {
        g.globalAlpha = m.disc ? 0.95 : 0.6;
        if (H.drawMapIcon)
          H.drawMapIcon(
            g,
            m.icon || "marker",
            p[0],
            p[1],
            0.72 * dpr,
            m.disc,
            col,
            "rgba(3,8,12,0.9)",
          );
        g.globalAlpha = 1;
      } else if (m.kind === "quest" && H.drawObjective) {
        H.drawObjective(
          g,
          p[0],
          p[1] - (out ? 0 : 5 * dpr),
          dpr * 0.85,
          m.tracked,
        );
      }
    }
    // player chevron (always pointing up)
    g.save();
    g.translate(c, c);
    g.shadowColor = col;
    g.shadowBlur = 6 * dpr;
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, -7 * dpr);
    g.lineTo(5 * dpr, 6 * dpr);
    g.lineTo(0, 3 * dpr);
    g.lineTo(-5 * dpr, 6 * dpr);
    g.closePath();
    g.fill();
    g.restore();
    // compass ring: ticks every 10°, N/E/S/W on the rim
    g.save();
    g.translate(c, c);
    g.strokeStyle = col;
    g.fillStyle = col;
    g.shadowColor = rgba(col, 0.8);
    g.shadowBlur = 8 * dpr;
    g.lineWidth = 2 * dpr;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.stroke();
    g.shadowBlur = 3 * dpr;
    g.shadowColor = col;
    g.lineWidth = 1.2 * dpr;
    g.font = "600 " + 10 * dpr + 'px "Share Tech Mono", monospace';
    g.textAlign = "center";
    g.textBaseline = "middle";
    const cs = Math.cos(P.yaw),
      sn = Math.sin(P.yaw);
    for (let deg = 0; deg < 360; deg += 10) {
      // compass heading (0 = N, 90 = E) → world direction (sin, -cos) → heading-up screen direction
      const d = (deg * Math.PI) / 180,
        wx = Math.sin(d),
        wz = -Math.cos(d);
      const ux = wx * cs - wz * sn,
        uy = wx * sn + wz * cs;
      if (deg % 90 === 0) {
        g.globalAlpha = deg === 0 ? 1 : 0.75;
        g.fillStyle = col;
        g.fillText(
          { 0: "N", 90: "E", 180: "S", 270: "W" }[deg],
          ux * (R + 7.5 * dpr),
          uy * (R + 7.5 * dpr),
        );
        g.fillStyle = col;
      } else {
        const len = (deg % 30 === 0 ? 5 : 3) * dpr;
        g.globalAlpha = deg % 30 === 0 ? 0.8 : 0.4;
        g.beginPath();
        g.moveTo(ux * R, uy * R);
        g.lineTo(ux * (R - len), uy * (R - len));
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    // heading caret at 12 o'clock
    g.beginPath();
    g.moveTo(-4 * dpr, -R + 1);
    g.lineTo(0, -R + 6 * dpr);
    g.lineTo(4 * dpr, -R + 1);
    g.stroke();
    g.restore();
    const hdg = Math.round(((((-P.yaw * 180) / Math.PI) % 360) + 360) % 360);
    H.setText(HUD.mmHead, String(hdg).padStart(3, "0") + "°");
  }
  let mmYaw = 1e9,
    mmX = 1e9,
    mmZ = 1e9;
  function updateMinimap(realDt) {
    markerPoll -= realDt;
    if (HUD.mmInteriorT > 0) HUD.mmInteriorT -= realDt;
    let dirty = HUD.mmDirty;
    if (markerPoll <= 0) {
      markerPoll = 0.12;
      markerCache = collectMarkers();
      dirty = true;
    }
    const P = G.player;
    if (
      Math.abs(P.yaw - mmYaw) > 0.002 ||
      Math.abs(P.pos.x - mmX) > 0.05 ||
      Math.abs(P.pos.z - mmZ) > 0.05
    )
      dirty = true;
    if (dirty) {
      mmYaw = P.yaw;
      mmX = P.pos.x;
      mmZ = P.pos.z;
      HUD.mmDirty = false;
      drawMinimap();
    }
  }

  // ------------------------------------------------------------------
  // Objective tracker (top right)
  // ------------------------------------------------------------------
  let objPoll = 0;
  function updateObjective(realDt) {
    objPoll -= realDt;
    if (objPoll > 0) return;
    objPoll = 0.15;
    const P = G.player,
      L = G.LAYOUT;
    let trackedId = H.call("quests", "tracked", [], null);
    let q = trackedId ? H.call("quests", "get", [trackedId], null) : null;
    if (!q || !(q.active || q.status === "active")) {
      // nothing tracked: follow the newest active main quest (the quest log lists main first)
      q =
        (H.call("quests", "list", [], []) || []).find(
          (x) => x && (x.active || x.status === "active") && x.main,
        ) || null;
      trackedId = q && q.id;
    }
    if (!q) {
      H.toggle(HUD.obj, "on", false);
      return;
    }
    const cur = (q.objectives || []).filter((o) => o.current && !o.done);
    const text = cur.length ? cur[0].text : q.stageText || stageText(q);
    H.setText(HUD.objQ, H.up(q.name));
    H.setText(HUD.objT, text || "");
    const inside = L.isInterior(P.pos.x);
    let best = null,
      bd = 1e9;
    for (const m of H.call("quests", "activeMarkers", [], []) || []) {
      if (
        !m ||
        m.x === undefined ||
        (m.questId && m.questId !== trackedId) ||
        inside !== L.isInterior(m.x)
      )
        continue;
      const d = Math.hypot(m.x - P.pos.x, m.z - P.pos.z);
      if (d < bd) {
        bd = d;
        best = m;
      }
    }
    if (best) {
      const yawTo = Math.atan2(-(best.x - P.pos.x), -(best.z - P.pos.z));
      const rel = G.util.wrapAngle(yawTo - P.yaw);
      HUD.objArrow.style.transform =
        "rotate(" + (-rel * 57.2958).toFixed(1) + "deg)";
      H.setText(
        HUD.objM,
        bd < 1000 ? Math.round(bd) + " M" : (bd / 1000).toFixed(1) + " KM",
      );
      const hdgTo = ((((-yawTo * 180) / Math.PI) % 360) + 360) % 360;
      H.setText(
        HUD.objDir,
        ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
          Math.round(hdgTo / 45) % 8
        ],
      );
      H.toggle(HUD.obj, "near", bd < 8);
    } else H.setText(HUD.objM, "—");
    H.toggle(HUD.obj, "nodist", !best);
    H.toggle(HUD.obj, "on", true);
  }

  // Location name when walking into a named location
  let locPoll = 0;
