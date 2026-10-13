// play-inline-540 05 — math
// Lines 1212-1491 of readable/play-inline-540.pretty.js (statement-aligned).
  const BMap = {
    base: null,
    crop: null,
    t: 0,
    w2m(x, z) {
      try {
        if (!G.isStub("map") && G.map.worldToMap && G.map.mapSize) {
          const m = G.map.worldToMap(x, z);
          return {
            x: m.u * G.map.mapSize.width,
            y: m.v * G.map.mapSize.height,
          };
        }
      } catch (e) {
        /* stub */
      }
      return { x: x + 1200, y: z + 1400 }; // fallback: raw world metres
    },
    prepare() {
      if (!bmapCanvas) return;
      const cw = bmapCanvas.width,
        ch = bmapCanvas.height,
        pal = AR.ledgerPal;
      let x0 = 1e9,
        y0 = 1e9,
        x1 = -1e9,
        y1 = -1e9;
      const pts = AR.KEYS.map((q) => AR.keyHint(q));
      try {
        const gl = G.LAYOUT.getLocation
          ? G.LAYOUT.getLocation("gracie_mansion")
          : null;
        if (gl) pts.push({ x: gl.x, z: gl.z });
      } catch (e) {
        /* layout */
      }
      for (const h of pts) {
        const m = this.w2m(h.x, h.z);
        x0 = Math.min(x0, m.x);
        y0 = Math.min(y0, m.y);
        x1 = Math.max(x1, m.x);
        y1 = Math.max(y1, m.y);
      }
      const pad = Math.max(x1 - x0, y1 - y0) * 0.08 + 8;
      x0 -= pad;
      y0 -= pad;
      x1 += pad;
      y1 += pad;
      const k = cw / ch,
        bw = x1 - x0,
        bh = y1 - y0;
      if (bw / bh > k) {
        const nh = bw / k;
        y0 -= (nh - bh) / 2;
        y1 = y0 + nh;
      } else {
        const nw = bh * k;
        x0 -= (nw - bw) / 2;
        x1 = x0 + nw;
      }
      this.crop = { x0, y0, s: cw / (x1 - x0) };
      const b = this.base || (this.base = document.createElement("canvas"));
      b.width = cw;
      b.height = ch;
      const c = b.getContext("2d");
      c.fillStyle = pal.bg;
      c.fillRect(0, 0, cw, ch);
      let img = null;
      try {
        if (!G.isStub("map") && G.map.getMapImage) img = G.map.getMapImage();
      } catch (e) {
        img = null;
      }
      if (img && img.width) {
        c.globalAlpha = 0.8;
        c.imageSmoothingEnabled = true;
        c.drawImage(img, x0, y0, x1 - x0, y1 - y0, 0, 0, cw, ch);
        c.globalAlpha = 1;
      } else {
        c.strokeStyle = pal.al[2];
        c.lineWidth = 1;
        for (let i = 0; i < cw; i += 20) {
          c.beginPath();
          c.moveTo(i + 0.5, 0);
          c.lineTo(i + 0.5, ch);
          c.stroke();
        }
        for (let i = 0; i < ch; i += 20) {
          c.beginPath();
          c.moveTo(0, i + 0.5);
          c.lineTo(cw, i + 0.5);
          c.stroke();
        }
      }
      // keys: found = a little key glyph, missing = faint dot; Gracie Mansion (the vault) = an amber square
      const S = AR.STATE;
      for (const q of AR.KEYS) {
        const h = AR.keyHint(q),
          p = this.px(h.x, h.z);
        if (S.keys.has(q.id)) {
          c.strokeStyle = pal.hi;
          c.lineWidth = 1.5;
          c.beginPath();
          c.arc(p.x - 4, p.y, 2.6, 0, Math.PI * 2);
          c.moveTo(p.x - 1.4, p.y);
          c.lineTo(p.x + 6, p.y);
          c.moveTo(p.x + 4, p.y);
          c.lineTo(p.x + 4, p.y + 3);
          c.moveTo(p.x + 6, p.y);
          c.lineTo(p.x + 6, p.y + 3);
          c.stroke();
        } else {
          c.fillStyle = pal.al[4];
          c.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        }
      }
      try {
        const gs = G.LAYOUT.getLocation
          ? G.LAYOUT.getLocation("gracie_mansion")
          : null;
        if (gs) {
          const p = this.px(gs.x, gs.z);
          c.strokeStyle = "#ffb347";
          c.lineWidth = 1.5;
          c.strokeRect(p.x - 4, p.y - 4, 8, 8);
        }
      } catch (e) {
        /* layout */
      }
      c.strokeStyle = pal.al[4];
      c.lineWidth = 2;
      c.strokeRect(1, 1, cw - 2, ch - 2);
    },
    px(x, z) {
      const m = this.w2m(x, z),
        C = this.crop;
      return { x: (m.x - C.x0) * C.s, y: (m.y - C.y0) * C.s };
    },
    draw(cv, dt) {
      if (!this.base || !this.crop) return;
      this.t += dt;
      const c = cv.getContext("2d"),
        pal = AR.ledgerPal;
      c.drawImage(this.base, 0, 0);
      const sel =
        AR.KEYS[Math.max(0, Math.min(AR.KEYS.length - 1, UI.sel.keys))];
      if (sel) {
        const h = AR.keyHint(sel),
          p = this.px(h.x, h.z);
        c.strokeStyle = pal.hi;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(p.x, p.y, 7, 0, Math.PI * 2);
        c.stroke();
      }
      if (AR.world && AR.world.entries && AR.world.nearestUnfound) {
        const n = AR.world.nearestUnfound("key");
        if (n) {
          const h = AR.keyHint(n.def),
            p = this.px(h.x, h.z);
          for (let i = 0; i < 2; i++) {
            const k = (this.t * 0.8 + i * 0.5) % 1;
            c.strokeStyle = "rgba(255,179,71," + (1 - k).toFixed(2) + ")";
            c.lineWidth = 2;
            c.beginPath();
            c.arc(p.x, p.y, 4 + k * 22, 0, Math.PI * 2);
            c.stroke();
          }
          c.fillStyle = "#ffb347";
          c.fillRect(p.x - 2, p.y - 2, 4, 4);
        }
      }
      const P = G.player && G.player.pos;
      if (P && G.LAYOUT && P.x < G.LAYOUT.INTERIOR_X_MIN) {
        const p = this.px(P.x, P.z),
          yaw = G.player.yaw || 0;
        const f = this.px(P.x - Math.sin(yaw) * 40, P.z - Math.cos(yaw) * 40);
        const a = Math.atan2(f.y - p.y, f.x - p.x);
        if (
          p.x > -10 &&
          p.y > -10 &&
          p.x < cv.width + 10 &&
          p.y < cv.height + 10
        ) {
          c.save();
          c.translate(p.x, p.y);
          c.rotate(a);
          c.fillStyle = pal.hi;
          c.strokeStyle = pal.bg;
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(9, 0);
          c.lineTo(-6, -6);
          c.lineTo(-3, 0);
          c.lineTo(-6, 6);
          c.closePath();
          c.fill();
          c.stroke();
          c.restore();
        }
      }
    },
  };

  // Miniature viewer (2D vector): turntable plinth, the landmark silhouette, a sweeping highlight
  const Mini = {
    kind: null,
    t: 0,
    draw(cv, dt) {
      this.t += dt;
      const c = cv.getContext("2d"),
        w = cv.width,
        h = cv.height,
        pal = AR.ledgerPal;
      const gx = w / 2,
        base = h * 0.78;
      c.clearRect(0, 0, w, h);
      // plinth (ellipse top + front band)
      c.strokeStyle = pal.c;
      c.fillStyle = pal.al[1];
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(gx, base + 18, w * 0.36, 12, 0, 0, Math.PI);
      c.lineTo(gx - w * 0.36, base);
      c.ellipse(gx, base, w * 0.36, 12, 0, Math.PI, 0, true);
      c.closePath();
      c.fill();
      c.stroke();
      c.beginPath();
      c.ellipse(gx, base, w * 0.36, 12, 0, 0, Math.PI * 2);
      c.stroke();
      // rotating ring marks on the plinth top
      c.strokeStyle = pal.al[4];
      c.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const a = this.t * 0.6 + (i * Math.PI) / 6,
          ex = Math.cos(a) * w * 0.3,
          ey = Math.sin(a) * 10;
        if (ey < 0) continue;
        c.beginPath();
        c.moveTo(gx + ex, base + ey - 2);
        c.lineTo(gx + ex, base + ey + 2);
        c.stroke();
      }
      if (this.kind) {
        const lk = this.kind;
        const tall =
          lk === "empire" || lk === "chrysler"
            ? 3.4
            : lk === "liberty"
              ? 2.2
              : lk === "times_square"
                ? 1.9
                : lk === "bridge"
                  ? 1.7
                  : 1.5;
        const s = Math.min((h * 0.62) / tall, w * 0.3);
        AR.drawLandmark(c, lk, gx, base, s, pal.al[2], pal.c, {
          detail: pal.dim,
          lw: 2,
          seed: 3,
        });
        // sweeping glint
        const gxx = gx + Math.sin(this.t * 0.9) * w * 0.25;
        const g = c.createLinearGradient(gxx - 30, 0, gxx + 30, 0);
        g.addColorStop(0, "rgba(207,238,250,0)");
        g.addColorStop(0.5, "rgba(207,238,250,0.16)");
        g.addColorStop(1, "rgba(207,238,250,0)");
        c.fillStyle = g;
        c.fillRect(gxx - 30, base - h * 0.7, 60, h * 0.7);
      } else {
        c.fillStyle = pal.dim;
        c.font = "64px VT323, monospace";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("?", gx, base - h * 0.3);
      }
    },
  };
  AR.Mini = Mini;
