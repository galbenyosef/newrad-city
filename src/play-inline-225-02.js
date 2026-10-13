// play-inline-225 02 — fillstyle
// Lines 22-356 of readable/play-inline-225.pretty.js (statement-aligned).
  const LI = (G._li = G._li || {});
  const TAU = Math.PI * 2;
  LI.TAU = TAU;
  LI.cells = LI.cells || [];
  LI.builders = LI.builders || []; // [{key, order, build(LI)}]
  LI.readyFns = LI.readyFns || []; // run at initDone (props, terminals, pickups, items, dialogues)
  LI.spawnFns = LI.spawnFns || []; // run on newGame / loaded (actors)
  LI.resetFns = LI.resetFns || [];
  LI.animators = LI.animators || []; // (dt, t) per frame while the cell is visible
  LI.saveHooks = LI.saveHooks || {}; // key → {save(), load(d)}

  LI.addBuilder = (key, order, fn) =>
    LI.builders.push({ key, order, build: fn });
  LI.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  LI.smooth = (a, b, x) => {
    const t = LI.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  LI.rng = function (seed) {
    let a = (typeof seed === "string" ? hashStr(seed) : seed) >>> 0 || 1;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function vnh(a, b) {
    let n = ((a * 73856093) | 0) ^ ((b * 19349663) | 0);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, z) {
    const xi = Math.floor(x),
      zi = Math.floor(z),
      xf = x - xi,
      zf = z - zi,
      sx = xf * xf * (3 - 2 * xf),
      sz = zf * zf * (3 - 2 * zf);
    const a = vnh(xi, zi),
      b = vnh(xi + 1, zi),
      c = vnh(xi, zi + 1),
      d = vnh(xi + 1, zi + 1);
    const ab = a + (b - a) * sx;
    return ab + (c + (d - c) * sx - ab) * sz;
  }
  LI.noise = vnoise;

  // =====================================================================
  // Canvas textures
  // =====================================================================
  const texCache = {};
  LI.canvas = (w, h) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  /** Cached CanvasTexture drawn by fn(ctx, w, h). */
  LI.canvasTex = function (key, w, h, fn, opts) {
    if (texCache[key]) return texCache[key];
    const c = LI.canvas(w, h),
      x = c.getContext("2d");
    try {
      fn(x, w, h);
    } catch (e) {
      G.reportError("landmark_interiors:tex " + key, e);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT =
      opts && opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.anisotropy = 4;
    t.needsUpdate = true;
    texCache[key] = t;
    return t;
  };
  /** Wear: grime blotches, streaks and scratches over a painted canvas. */
  LI.wear = function (x, W, H, seed, amt) {
    const r = LI.rng(seed || 7);
    amt = amt === undefined ? 1 : amt;
    for (let i = 0; i < 40 * amt; i++) {
      const g = x.createRadialGradient(
        r() * W,
        r() * H,
        0,
        r() * W,
        r() * H,
        10 + r() * W * 0.15,
      );
      g.addColorStop(0, "rgba(30,24,16," + (0.18 * amt).toFixed(2) + ")");
      g.addColorStop(1, "rgba(30,24,16,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
    }
    for (let i = 0; i < 18 * amt; i++) {
      const sx = r() * W,
        gg = x.createLinearGradient(0, 0, 0, H);
      gg.addColorStop(0, "rgba(40,30,18,0.0)");
      gg.addColorStop(
        r() * 0.5 + 0.2,
        "rgba(40,30,18," + (0.22 * amt).toFixed(2) + ")",
      );
      gg.addColorStop(1, "rgba(40,30,18,0)");
      x.fillStyle = gg;
      x.fillRect(sx, r() * H * 0.3, 1 + r() * 4, H);
    }
    for (let i = 0; i < 120 * amt; i++) {
      x.fillStyle =
        "rgba(" +
        (r() < 0.5 ? "255,250,230" : "20,16,10") +
        "," +
        (r() * 0.25).toFixed(2) +
        ")";
      x.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3);
    }
  };
  /** Fit text into width. */
  LI.fitText = function (x, text, cx, cy, maxW, size, font) {
    let s = size;
    x.font = font.replace("%s", s);
    while (x.measureText(text).width > maxW && s > 8) {
      s -= 2;
      x.font = font.replace("%s", s);
    }
    x.fillText(text, cx, cy);
  };
  /** Generic sign canvas: lines of text. style: {bg, fg, border, font, size, emboss, glow}. */
  LI.signTex = function (key, lines, st, w, h) {
    st = st || {};
    w = w || 512;
    h = h || 128;
    return LI.canvasTex(
      "sign_" + key,
      w,
      h,
      (x, W, H) => {
        x.fillStyle = st.bg || "#2a2a26";
        x.fillRect(0, 0, W, H);
        if (st.border) {
          x.strokeStyle = st.border;
          x.lineWidth = Math.max(4, H * 0.05);
          x.strokeRect(H * 0.06, H * 0.06, W - H * 0.12, H - H * 0.12);
        }
        x.textAlign = "center";
        x.textBaseline = "middle";
        const n = lines.length;
        for (let i = 0; i < n; i++) {
          const sz =
            (st.size || (H * 0.55) / n) * (i === 0 ? 1 : st.subScale || 0.62);
          const yy =
            (H * (i + 0.5)) / n +
            (n > 1 ? (i === 0 ? H * 0.04 : -H * 0.02) : 0);
          if (st.glow) {
            x.shadowColor = st.glow;
            x.shadowBlur = sz * 0.5;
          }
          x.fillStyle =
            i === 0 ? st.fg || "#e8e0c8" : st.fg2 || st.fg || "#e8e0c8";
          LI.fitText(
            x,
            lines[i],
            W / 2,
            yy,
            W * 0.9,
            Math.round(sz),
            st.font || "bold %spx Georgia, serif",
          );
          x.shadowBlur = 0;
        }
        if (st.wear !== 0)
          LI.wear(x, W, H, hashStr(key), st.wear === undefined ? 0.6 : st.wear);
      },
      { clamp: true },
    );
  };

  // =====================================================================
  // Tileable surface canvases (drawn with wrap-around so they tile)
  // =====================================================================
  function wrapBlob(x, W, H, cx, cy, r, col) {
    for (const ox of [-W, 0, W])
      for (const oy of [-H, 0, H]) {
        const g = x.createRadialGradient(
          cx + ox,
          cy + oy,
          0,
          cx + ox,
          cy + oy,
          r,
        );
        g.addColorStop(0, col);
        g.addColorStop(1, "rgba(0,0,0,0)");
        x.fillStyle = g;
        x.fillRect(cx + ox - r, cy + oy - r, r * 2, r * 2);
      }
  }
  LI.CANVAS = {
    goldleaf(x, W, H) {
      const r = LI.rng(303),
        n = 8,
        s = W / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const v = r();
          x.fillStyle =
            "rgb(" +
            Math.round(200 + v * 40) +
            "," +
            Math.round(150 + v * 40) +
            "," +
            Math.round(60 + v * 30) +
            ")";
          x.fillRect(i * s, j * s, s, s);
          const g = x.createLinearGradient(i * s, j * s, i * s + s, j * s + s);
          g.addColorStop(0, "rgba(255,240,190,0.18)");
          g.addColorStop(1, "rgba(120,80,20,0.18)");
          x.fillStyle = g;
          x.fillRect(i * s, j * s, s, s);
          x.strokeStyle = "rgba(120,84,30,0.35)";
          x.lineWidth = 1;
          x.strokeRect(i * s + 0.5, j * s + 0.5, s - 1, s - 1);
        }
      for (let i = 0; i < 900; i++) {
        x.fillStyle =
          r() < 0.5 ? "rgba(255,245,210,0.25)" : "rgba(90,60,20,0.2)";
        x.fillRect(r() * W, r() * H, 1 + r() * 3, 1);
      }
      for (let i = 0; i < 14; i++)
        wrapBlob(
          x,
          W,
          H,
          r() * W,
          r() * H,
          20 + r() * 50,
          "rgba(70,50,20,0.14)",
        );
    },
    plaster(x, W, H) {
      x.fillStyle = "#d6d2ca";
      x.fillRect(0, 0, W, H);
      const r = LI.rng(101);
      for (let i = 0; i < 60; i++)
        wrapBlob(
          x,
          W,
          H,
          r() * W,
          r() * H,
          20 + r() * 90,
          r() < 0.5 ? "rgba(255,255,250,0.10)" : "rgba(90,80,64,0.07)",
        );
      for (let i = 0; i < 5000; i++) {
        const v = r() < 0.5 ? 255 : 60;
        x.fillStyle =
          "rgba(" +
          v +
          "," +
          v +
          "," +
          (v - 10) +
          "," +
          (0.03 + r() * 0.05).toFixed(3) +
          ")";
        x.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
      }
      for (let i = 0; i < 7; i++) {
        const sx = r() * W,
          w = 3 + r() * 10,
          g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(96,80,56,0)");
        g.addColorStop(0.5, "rgba(96,80,56,0.10)");
        g.addColorStop(1, "rgba(96,80,56,0)");
        x.fillStyle = g;
        x.fillRect(sx, 0, w, H);
      }
      x.strokeStyle = "rgba(70,60,48,0.18)";
      x.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        let px = r() * W,
          py = r() * H;
        x.beginPath();
        x.moveTo(px, py);
        for (let k = 0; k < 8; k++) {
          px += (r() - 0.5) * 40;
          py += r() * 30;
          x.lineTo(px, py);
        }
        x.stroke();
      }
    },
    paint(x, W, H) {
      x.fillStyle = "#dcdad4";
      x.fillRect(0, 0, W, H);
      const r = LI.rng(202);
      for (let i = 0; i < 40; i++)
        wrapBlob(
          x,
          W,
          H,
          r() * W,
          r() * H,
          30 + r() * 80,
          r() < 0.5 ? "rgba(255,255,255,0.08)" : "rgba(80,70,60,0.08)",
        );
      for (let i = 0; i < 20; i++) {
        x.fillStyle = "rgba(120,110,96," + (0.08 + r() * 0.12).toFixed(2) + ")";
        const px = r() * W,
          py = r() * H;
        x.beginPath();
        x.ellipse(px, py, 3 + r() * 14, 2 + r() * 8, r() * 3, 0, TAU);
        x.fill();
      }
      for (let i = 0; i < 3000; i++) {
        x.fillStyle = "rgba(40,36,30," + (r() * 0.05).toFixed(3) + ")";
        x.fillRect(r() * W, r() * H, 1, 1);
      }
    },
  };

  // =====================================================================
  // Materials
  // =====================================================================
  // key → {src (G.mats surface), tint, rough, metal, uv (m per tile), emissive, ei, custom (canvas key), keep (uv as given),
  //        transparent, opacity, side, fallback colour c}
