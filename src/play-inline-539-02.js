// play-inline-539 02 — basey
// Lines 345-643 of readable/play-inline-539.pretty.js (statement-aligned).
  AR.drawLandmark = function (c, kind, cx, baseY, s, fill, stroke, opts) {
    const d = L[kind];
    if (!d) return;
    opts = opts || {};
    c.lineWidth = opts.lw || 1.5;
    if (kind === "bridge") {
      drawBridge(c, d, cx, baseY, s, fill, stroke);
      return;
    }
    c.beginPath();
    const p = d.poly;
    c.moveTo(cx + p[0][0] * s, baseY - p[0][1] * s);
    for (let i = 1; i < p.length; i++)
      c.lineTo(cx + p[i][0] * s, baseY - p[i][1] * s);
    c.closePath();
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.stroke();
    }
    const det = opts.detail || stroke;
    if (!det) return;
    c.strokeStyle = det;
    c.fillStyle = det;
    if (d.windows && opts.windows !== false) {
      const w = d.windows,
        cw = (w.x1 - w.x0) / w.cols,
        rh = (w.y1 - w.y0) / w.rows,
        ww = Math.max(1, cw * s * 0.4),
        wh = Math.max(1, rh * s * 0.45);
      const seed = opts.seed || 0;
      for (let j = 0; j < w.rows; j++)
        for (let i = 0; i < w.cols; i++) {
          if ((i * 7 + j * 13 + seed) % 5 === 0) continue; // dark windows
          c.fillRect(
            cx + (w.x0 + (i + 0.3) * cw) * s,
            baseY - (w.y0 + (j + 0.7) * rh) * s,
            ww,
            wh,
          );
        }
    }
    if (d.lines) {
      c.beginPath();
      for (const l of d.lines) {
        c.moveTo(cx + l[0] * s, baseY - l[1] * s);
        c.lineTo(cx + l[2] * s, baseY - l[3] * s);
      }
      c.stroke();
    }
    if (d.arcs) {
      for (const a of d.arcs) {
        c.beginPath();
        c.arc(cx + a[0] * s, baseY - a[1] * s, a[2] * s, Math.PI, 0);
        c.stroke();
      }
    }
    if (d.arches) {
      for (const a of d.arches) {
        const x = cx + a[0] * s,
          y0 = baseY - a[1] * s,
          hw = a[2] * s,
          h = a[3] * s;
        c.beginPath();
        c.moveTo(x - hw, y0);
        c.lineTo(x - hw, y0 - h + hw);
        c.arc(x, y0 - h + hw, hw, Math.PI, 0);
        c.lineTo(x + hw, y0);
        c.stroke();
      }
    }
    if (d.clock) {
      c.beginPath();
      c.arc(
        cx + d.clock[0] * s,
        baseY - d.clock[1] * s,
        d.clock[2] * s,
        0,
        Math.PI * 2,
      );
      c.stroke();
    }
    if (d.boards)
      for (const b of d.boards)
        c.strokeRect(
          cx + b[0] * s,
          baseY - (b[1] + b[3]) * s,
          b[2] * s,
          b[3] * s,
        );
    if (d.ball) {
      c.beginPath();
      c.arc(
        cx + d.ball[0] * s,
        baseY - d.ball[1] * s,
        d.ball[2] * s,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
    if (d.trees)
      for (const t of d.trees) {
        const x = cx + t[0] * s,
          y = baseY - t[1] * s,
          r = t[2] * s;
        c.beginPath();
        c.moveTo(x, y - r * 3.2);
        c.lineTo(x + r, y);
        c.lineTo(x - r, y);
        c.closePath();
        c.stroke();
      }
  };
  function drawBridge(c, d, cx, baseY, s, fill, stroke) {
    const deck = baseY - d.deckY * s,
      th = d.towerH * s,
      tw = d.towerW * s;
    c.strokeStyle = stroke || fill;
    c.fillStyle = fill || stroke;
    // deck
    c.beginPath();
    c.moveTo(cx - 0.75 * s, deck);
    c.lineTo(cx + 0.75 * s, deck);
    c.stroke();
    for (const tx of d.towers) {
      const x = cx + tx * s;
      if (fill) c.fillRect(x - tw / 2, baseY - th, tw, th);
      c.strokeRect(x - tw / 2, baseY - th, tw, th);
      // twin pointed arches
      c.beginPath();
      c.moveTo(x - tw * 0.35, deck);
      c.lineTo(x - tw * 0.35, baseY - th * 0.72);
      c.lineTo(x - tw * 0.12, baseY - th * 0.8);
      c.lineTo(x - tw * 0.12, deck);
      c.moveTo(x + tw * 0.12, deck);
      c.lineTo(x + tw * 0.12, baseY - th * 0.8);
      c.lineTo(x + tw * 0.35, baseY - th * 0.72);
      c.lineTo(x + tw * 0.35, deck);
      c.stroke();
    }
    // main cables (sagging) + suspenders
    const t0 = cx + d.towers[0] * s,
      t1 = cx + d.towers[1] * s,
      top = baseY - th * 0.97;
    c.beginPath();
    c.moveTo(cx - 0.75 * s, deck - 2);
    c.lineTo(t0, top);
    c.quadraticCurveTo((t0 + t1) / 2, deck + (top - deck) * -0.2 + 6, t1, top);
    c.lineTo(cx + 0.75 * s, deck - 2);
    c.stroke();
    c.beginPath();
    for (let i = 1; i < 8; i++) {
      const x = t0 + ((t1 - t0) * i) / 8,
        u = i / 8,
        y = top + (1 - (1 - 2 * u) * (1 - 2 * u)) * (deck - top) * 0.62;
      c.moveTo(x, y);
      c.lineTo(x, deck);
    }
    c.stroke();
  }

  /** Key to the City icon (SVG string) for the ledger: trefoil bow, collar, long shaft, stepped bit (horizontal). */
  AR.keySVG =
    '<svg viewBox="0 0 64 24" class="arc-key">' +
    '<circle cx="9" cy="12" r="6.2" class="arc-kb"/><circle cx="9" cy="4.6" r="2.4" class="arc-kb"/><circle cx="9" cy="19.4" r="2.4" class="arc-kb"/>' +
    '<circle cx="9" cy="12" r="2.4" class="arc-kh"/>' +
    '<path d="M15.5 10.4h3v3.2h-3zM20 10.6h1.6v2.8H20z" class="arc-kc"/>' +
    '<path d="M21.6 11h30v2h-30z" class="arc-ks"/>' +
    '<path d="M44 13h8v6h-2.5v-3H47v4.5h-3z" class="arc-kt"/></svg>';

  // ------------------------------------------------------------------
  // Marquee title art (used by the cabinet screen header AND the 3D cabinets' lit marquee).
  // Original 1960s arcade look: sunburst / starfield / girder backdrop, chunky outlined title.
  // ------------------------------------------------------------------
  AR.drawMarquee = function (x, w, h, def) {
    const A = def.art;
    x.save();
    x.fillStyle = A.bg;
    x.fillRect(0, 0, w, h);
    if (def.id === "skypatrol") {
      const r = G.util && G.util.rng ? G.util.rng(17) : Math.random;
      for (let i = 0; i < 90; i++) {
        x.fillStyle = "rgba(255,255,255," + (0.3 + r() * 0.7) + ")";
        x.fillRect(r() * w, r() * h, 1.5, 1.5);
      }
      // two saucers + a city strip
      for (const s of [
        [w * 0.12, h * 0.32, 1],
        [w * 0.88, h * 0.28, -1],
      ]) {
        x.fillStyle = "#c8d0d8";
        x.beginPath();
        x.ellipse(s[0], s[1], h * 0.16, h * 0.05, 0, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = A.c;
        x.beginPath();
        x.ellipse(s[0], s[1] - h * 0.04, h * 0.07, h * 0.05, 0, Math.PI, 0);
        x.fill();
        x.fillStyle = A.b;
        for (let k = -2; k <= 2; k++)
          x.fillRect(s[0] + k * h * 0.05 - 1.5, s[1] - 1.5, 3, 3);
      }
      x.fillStyle = "#121a40";
      for (let i = 0; i < 26; i++) {
        const bw = w / 26,
          bh = h * (0.12 + ((i * 37) % 11) / 40);
        x.fillRect(i * bw, h - bh, bw - 1, bh);
      }
    } else if (def.id === "catacomb") {
      // torch-lit stone arch
      const g = x.createRadialGradient(
        w / 2,
        h * 1.1,
        0,
        w / 2,
        h * 1.1,
        w * 0.6,
      );
      g.addColorStop(0, "rgba(255,150,40,0.55)");
      g.addColorStop(1, "rgba(255,150,40,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "rgba(160,110,70,0.55)";
      x.lineWidth = Math.max(1, h * 0.02);
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 12; i++)
          x.strokeRect(
            (i * w) / 12 + ((j % 2) * w) / 24,
            (j * h) / 4,
            w / 12,
            h / 4,
          );
      for (const tx of [w * 0.07, w * 0.93]) {
        x.fillStyle = "#ffd23a";
        x.beginPath();
        x.moveTo(tx - h * 0.05, h * 0.55);
        x.quadraticCurveTo(tx, h * 0.15, tx + h * 0.05, h * 0.55);
        x.fill();
        x.fillStyle = "#6a4a2a";
        x.fillRect(tx - 2, h * 0.55, 4, h * 0.3);
      }
    } else {
      // dusk sky + red girders
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#2a0c2a");
      g.addColorStop(1, "#ff7a3a");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#c8321e";
      x.lineWidth = Math.max(2, h * 0.05);
      for (let k = 0; k < 3; k++) {
        const y = h * (0.25 + k * 0.3);
        x.beginPath();
        x.moveTo(0, y + (k % 2 ? -4 : 4));
        x.lineTo(w, y - (k % 2 ? -4 : 4));
        x.stroke();
      }
      x.lineWidth = Math.max(1, h * 0.015);
      for (let i = 0; i < 24; i++) {
        const xx = (i * w) / 24;
        x.beginPath();
        x.moveTo(xx, h * 0.25);
        x.lineTo(xx + w / 48, h * 0.55);
        x.lineTo(xx + w / 24, h * 0.25);
        x.stroke();
      }
    }
    // title: chunky, outlined, slight drop shadow
    const fs = Math.round(h * 0.5);
    x.font = "900 " + fs + 'px "Arial Black", Impact, "Oswald", sans-serif';
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.lineJoin = "round";
    x.lineWidth = Math.max(3, fs * 0.16);
    x.strokeStyle = "#000";
    x.strokeText(def.title, w / 2 + fs * 0.05, h * 0.47 + fs * 0.06, w * 0.84);
    x.lineWidth = Math.max(2, fs * 0.08);
    x.strokeStyle = A.b;
    x.strokeText(def.title, w / 2, h * 0.47, w * 0.84);
    const tg = x.createLinearGradient(
      0,
      h * 0.47 - fs / 2,
      0,
      h * 0.47 + fs / 2,
    );
    tg.addColorStop(0, "#ffffff");
    tg.addColorStop(0.5, A.a);
    tg.addColorStop(1, A.b);
    x.fillStyle = tg;
    x.fillText(def.title, w / 2, h * 0.47, w * 0.84);
    x.font = "700 " + Math.round(h * 0.13) + 'px "Oswald", Arial, sans-serif';
    x.fillStyle = A.c;
    x.fillText(def.sub, w / 2, h * 0.86, w * 0.9);
    x.restore();
  };
