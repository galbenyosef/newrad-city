/* src/poi_wallst/05_extras.js */
/* =====================================================================
 * NEW RAD CITY — POI WALL STREET — 05_extras.js
 * Round-2 toolkit for the four Wall Street POIs:
 *  • per-building floor & wall surfaces (worn sandstone flags, Singer
 *    white marble with verde inlay, 40 Wall terrazzo with brass strips,
 *    Custom House mosaic, oak parquet, squared Manhattan-schist rubble)
 *  • the WINDOW VIEW: a procedural ruined-Manhattan skyline seen through
 *    dirty glass (street-level and 140 m-high variants) for every window
 *  • sign ATLASES (one material → one draw call per building exterior)
 *  • set dressing: standing draped statues (Custom House attic), desk
 *    clutter, leather club chairs, oriental rugs, posters & pin-ups,
 *    bullion shelving, money carts, burst coin sacks, carved skulls
 *  • TRAPS (tripwire + grenade bouquet, bear trap, laser tripwire, tin-can
 *    alarm) — armed/tripped/disarmed state saved in the module flags.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pws) return;
  const PF = G._pws;
  const U = G.util;
  const TAU = Math.PI * 2,
    PI = Math.PI,
    HP = PI / 2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  // -------------------------------------------------------------------
  // small canvas helpers
  // -------------------------------------------------------------------
  const rgb = (c, a) =>
    "rgba(" +
    (c[0] | 0) +
    "," +
    (c[1] | 0) +
    "," +
    (c[2] | 0) +
    "," +
    (a === undefined ? 1 : a) +
    ")";
  const jit = (c, r, amt) => {
    const k = (r() - 0.5) * amt;
    return [
      c[0] * (1 + k) + (r() - 0.5) * amt * 24,
      c[1] * (1 + k) + (r() - 0.5) * amt * 24,
      c[2] * (1 + k) + (r() - 0.5) * amt * 24,
    ];
  };
  function weatherLite(ctx, w, h, r, o) {
    o = o || {};
    for (let i = 0; i < (o.blotches || 40); i++) {
      ctx.fillStyle = "rgba(20,16,10," + r() * (o.dark || 0.1) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        r() * h,
        10 + r() * 50,
        6 + r() * 30,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
    for (let i = 0; i < (o.light || 20); i++) {
      ctx.fillStyle = "rgba(255,250,235," + r() * 0.05 + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        r() * h,
        10 + r() * 40,
        6 + r() * 20,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
    for (let i = 0; i < (o.specks || 500); i++) {
      ctx.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.08)";
      ctx.fillRect(r() * w, r() * h, 1 + r(), 1 + r());
    }
  }
  /** Draw fn twice when a shape crosses the right/bottom edge so the tile wraps seamlessly. */
  function wrapDraw(w, h, x, y, sw, sh, fn) {
    fn(x, y);
    if (x + sw > w) fn(x - w, y);
    if (y + sh > h) fn(x, y - h);
    if (x + sw > w && y + sh > h) fn(x - w, y - h);
  }

  /** Squared, coursed Manhattan-schist rubble (St. Paul's): dark grey-brown blocks, pale lime mortar, mica. */
  function schistSqDraw(ctx, w, h) {
    const r = U.rng(41);
    ctx.fillStyle = "#8c877a";
    ctx.fillRect(0, 0, w, h);
    const rows = 8,
      hs = [];
    let tot = 0;
    for (let i = 0; i < rows; i++) {
      const v = 0.7 + r() * 0.6;
      hs.push(v);
      tot += v;
    }
    let y = 0;
    for (let i = 0; i < rows; i++) {
      const rh = (hs[i] / tot) * h;
      let x = r() * 30;
      const x0 = x;
      while (x < w + x0 - 20) {
        const sw = Math.min(28 + r() * 80, w + x0 - x - 3);
        const base =
          r() < 0.14 ? [110, 92, 74] : r() < 0.3 ? [78, 80, 80] : [94, 88, 76];
        const col = jit(base, r, 0.35);
        const j = () => (r() - 0.5) * 4;
        const yy = y + 1.5,
          hh = rh - 3,
          xx = x + 1.5,
          ww = sw - 3;
        const c0 = [j(), j(), j(), j(), j(), j(), j(), j()];
        wrapDraw(w, h, xx, yy, ww, hh, (px, py) => {
          ctx.fillStyle = rgb(col);
          ctx.beginPath();
          ctx.moveTo(px + c0[0], py + c0[1]);
          ctx.lineTo(px + ww + c0[2], py + c0[3]);
          ctx.lineTo(px + ww + c0[4], py + hh + c0[5]);
          ctx.lineTo(px + c0[6], py + hh + c0[7]);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "rgba(255,245,225,0.10)";
          ctx.fillRect(px + 2, py + 1, ww - 4, 2);
          ctx.fillStyle = "rgba(0,0,0,0.22)";
          ctx.fillRect(px + 2, py + hh - 3, ww - 4, 3);
          for (let s = 0; s < 3; s++) {
            ctx.fillStyle = "rgba(0,0,0," + (0.05 + r() * 0.08) + ")";
            ctx.fillRect(px + r() * ww, py + r() * hh, 4 + r() * 14, 1);
          } // foliation
          for (let s = 0; s < 5; s++) {
            ctx.fillStyle = "rgba(225,230,235," + r() * 0.5 + ")";
            ctx.fillRect(px + r() * ww, py + r() * hh, 1.5, 1.5);
          } // mica
        });
        x += sw;
      }
      y += rh;
    }
    weatherLite(ctx, w, h, r, { blotches: 50, dark: 0.16, specks: 600 });
    for (let i = 0; i < 16; i++) {
      const x = r() * w;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(10,8,6,0.16)");
      g.addColorStop(1, "rgba(10,8,6,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, 4 + r() * 10, h * (0.4 + r() * 0.6));
    }
  }
  /** Worn sandstone / brownstone flags (St. Paul's aisles and narthex). */
  function flagsDraw(ctx, w, h) {
    const r = U.rng(43);
    ctx.fillStyle = "#4a4034";
    ctx.fillRect(0, 0, w, h);
    const rows = 5,
      rh = h / rows;
    for (let i = 0; i < rows; i++) {
      let x = r() * 60;
      const x0 = x;
      while (x < w + x0 - 30) {
        const sw = Math.min(110 + r() * 90, w + x0 - x);
        const col = jit(r() < 0.3 ? [150, 128, 104] : [168, 150, 124], r, 0.2);
        wrapDraw(w, h, x + 2, i * rh + 2, sw - 4, rh - 4, (px, py) => {
          ctx.fillStyle = rgb(col);
          ctx.fillRect(px, py, sw - 4, rh - 4);
          const g = ctx.createRadialGradient(
            px + sw / 2,
            py + rh / 2,
            5,
            px + sw / 2,
            py + rh / 2,
            sw * 0.6,
          );
          g.addColorStop(0, "rgba(255,245,225,0.14)");
          g.addColorStop(1, "rgba(40,30,20,0.12)"); // foot-worn centres
          ctx.fillStyle = g;
          ctx.fillRect(px, py, sw - 4, rh - 4);
          if (r() < 0.25) {
            ctx.strokeStyle = "rgba(30,24,18,0.5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            let cx = px + r() * sw,
              cy = py;
            ctx.moveTo(cx, cy);
            for (let k = 0; k < 5; k++) {
              cx += (r() - 0.5) * 30;
              cy += rh / 5;
              ctx.lineTo(cx, cy);
            }
            ctx.stroke();
          }
        });
        x += sw;
      }
    }
    weatherLite(ctx, w, h, r, { blotches: 60, dark: 0.14, specks: 900 });
  }
  /** Singer lobby floor: white Carrara slabs framed by verde-antique and bronze inlay bands. */
  function singerFloorDraw(ctx, w, h) {
    const r = U.rng(47),
      n = 2,
      s = w / n;
    ctx.fillStyle = "#23372c";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const x = i * s + 14,
          y = j * s + 14,
          ss = s - 28;
        ctx.fillStyle = rgb(jit([226, 222, 212], r, 0.05));
        ctx.fillRect(x, y, ss, ss);
        ctx.strokeStyle = "rgba(120,118,112,0.35)";
        ctx.lineWidth = 1.3;
        for (let v = 0; v < 6; v++) {
          let vx = x + r() * ss,
            vy = y;
          ctx.beginPath();
          ctx.moveTo(vx, vy);
          for (let k = 0; k < 8; k++) {
            vx += (r() - 0.5) * ss * 0.3;
            vy += ss / 8;
            ctx.lineTo(Math.max(x, Math.min(x + ss, vx)), vy);
          }
          ctx.stroke();
        }
        ctx.strokeStyle = "#9a7a3a";
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 5, y - 5, ss + 10, ss + 10); // bronze fillet
        for (let v = 0; v < 30; v++) {
          ctx.fillStyle = "rgba(180,200,180," + r() * 0.2 + ")";
          ctx.fillRect(
            i * s + r() * s,
            j * s + (r() < 0.5 ? r() * 12 : s - r() * 12),
            3,
            2,
          );
        } // verde veins
        ctx.fillStyle = "#b8903e";
        ctx.beginPath();
        ctx.arc(i * s + 7, j * s + 7, 5, 0, TAU);
        ctx.fill(); // bronze rosette at the crossings
      }
    weatherLite(ctx, w, h, r, { blotches: 45, dark: 0.12, specks: 700 });
  }
  /** 40 Wall: travertine-toned terrazzo with brass divider strips and inlaid stars at the crossings. */
  function terrazzoDraw(ctx, w, h) {
    const r = U.rng(53);
    ctx.fillStyle = "#c4b89c";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const c = [
        [150, 138, 118],
        [210, 200, 180],
        [120, 104, 88],
        [176, 160, 120],
        [90, 90, 88],
      ][(r() * 5) | 0];
      ctx.fillStyle = rgb(c, 0.8);
      const s = 1 + r() * 3.5;
      ctx.fillRect(r() * w, r() * h, s, s * (0.6 + r() * 0.6));
    }
    ctx.strokeStyle = "#a8843c";
    ctx.lineWidth = 3;
    for (const p of [0, w / 2]) {
      ctx.beginPath();
      ctx.moveTo(p + 1.5, 0);
      ctx.lineTo(p + 1.5, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p + 1.5);
      ctx.lineTo(w, p + 1.5);
      ctx.stroke();
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(168,132,60,0.8)";
    for (const [cx, cy] of [
      [w / 4, h / 4],
      [(3 * w) / 4, (3 * h) / 4],
    ]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 70);
      ctx.lineTo(cx + 70, cy);
      ctx.lineTo(cx, cy + 70);
      ctx.lineTo(cx - 70, cy);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.fillStyle = "#b89448";
    for (const [cx, cy] of [
      [1.5, 1.5],
      [w / 2 + 1.5, 1.5],
      [1.5, h / 2 + 1.5],
      [w / 2 + 1.5, h / 2 + 1.5],
    ])
      PF.drawStar(ctx, cx, cy, 11);
    ctx.fillStyle = "#b89448";
    for (const [cx, cy] of [
      [w - 0.5, 1.5],
      [1.5, h - 0.5],
      [w - 0.5, h - 0.5],
      [w - 0.5, h / 2 + 1.5],
      [w / 2 + 1.5, h - 0.5],
    ])
      PF.drawStar(ctx, cx, cy, 11);
    weatherLite(ctx, w, h, r, { blotches: 50, dark: 0.12, specks: 300 });
  }
  /** Custom House: marble mosaic of tesserae — interlaced terracotta rings, grey lozenges on a cream field. */
  function mosaicDraw(ctx, w, h) {
    const r = U.rng(59),
      t = 8;
    ctx.fillStyle = "#6a6258";
    ctx.fillRect(0, 0, w, h);
    const ring = (x, y, cx, cy, R, wd) => {
      const d = Math.hypot(x - cx, y - cy);
      return Math.abs(d - R) < wd;
    };
    for (let y = 0; y < h; y += t)
      for (let x = 0; x < w; x += t) {
        const cx = x + t / 2,
          cy = y + t / 2;
        let c = [214, 204, 184];
        const onRing = [
          [0, 0],
          [w, 0],
          [0, h],
          [w, h],
          [w / 2, h / 2],
        ].some(([ox, oy]) => ring(cx, cy, ox, oy, 150, 10));
        const lz =
          Math.abs(cx - w / 2) + Math.abs(cy) < 40 ||
          Math.abs(cx - w / 2) + Math.abs(cy - h) < 40 ||
          Math.abs(cx) + Math.abs(cy - h / 2) < 40 ||
          Math.abs(cx - w) + Math.abs(cy - h / 2) < 40;
        const inner = Math.hypot(cx - w / 2, cy - h / 2) < 34;
        if (onRing) c = [150, 74, 48];
        else if (lz) c = [96, 100, 104];
        else if (inner) c = [196, 150, 64];
        else if (
          Math.abs(((cx + cy) % 64) - 32) < 3 &&
          Math.hypot(cx - w / 2, cy - h / 2) < 110
        )
          c = [178, 168, 146];
        ctx.fillStyle = rgb(jit(c, r, 0.12));
        ctx.fillRect(
          x + 0.8 + (r() - 0.5),
          y + 0.8 + (r() - 0.5),
          t - 1.6,
          t - 1.6,
        );
      }
    weatherLite(ctx, w, h, r, { blotches: 50, dark: 0.14, specks: 400 });
  }
  /** Oak parquet in basket weave (offices). */
  function parquetDraw(ctx, w, h) {
    const r = U.rng(61),
      n = 4,
      s = w / n,
      p = s / 4;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const vert = (i + j) % 2 === 0;
        for (let k = 0; k < 4; k++) {
          const col = jit([122, 86, 52], r, 0.22);
          const x = i * s + (vert ? k * p : 0),
            y = j * s + (vert ? 0 : k * p),
            ww = vert ? p : s,
            hh = vert ? s : p;
          ctx.fillStyle = rgb(col);
          ctx.fillRect(x, y, ww, hh);
          ctx.strokeStyle = "rgba(40,24,12,0.25)";
          ctx.lineWidth = 0.8;
          for (let g = 0; g < 4; g++) {
            ctx.beginPath();
            if (vert) {
              const gx = x + 3 + r() * (p - 6);
              ctx.moveTo(gx, y);
              ctx.bezierCurveTo(
                gx + 3,
                y + hh * 0.3,
                gx - 3,
                y + hh * 0.7,
                gx,
                y + hh,
              );
            } else {
              const gy = y + 3 + r() * (p - 6);
              ctx.moveTo(x, gy);
              ctx.bezierCurveTo(
                x + ww * 0.3,
                gy + 3,
                x + ww * 0.7,
                gy - 3,
                x + ww,
                gy,
              );
            }
            ctx.stroke();
          }
          ctx.strokeStyle = "rgba(20,12,6,0.6)";
          ctx.lineWidth = 1.2;
          ctx.strokeRect(x, y, ww, hh);
        }
      }
    weatherLite(ctx, w, h, r, { blotches: 40, dark: 0.16, specks: 600 });
  }
  /**
   * The window view: ruined Manhattan through dirty glass. Canvas top half = street level (towers rising,
   * broken tops, haze), bottom half = from 140 m up (rooftops below the horizon, the Woolworth's spire,
   * 40 Wall's green pyramid, the harbour haze).
   */
  function skylineDraw(ctx, W, H) {
    const r = U.rng(67),
      hh = H / 2;
    const sky = (y0, y1, hz) => {
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, "#8a9a88");
      g.addColorStop(hz * 0.7, "#b8b894");
      g.addColorStop(hz, "#d8cfa4");
      g.addColorStop(1, "#c0b894");
      ctx.fillStyle = g;
      ctx.fillRect(0, y0, W, y1 - y0);
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = "rgba(245,240,215," + (0.05 + r() * 0.1) + ")";
        ctx.beginPath();
        ctx.ellipse(
          r() * W,
          y0 + r() * (y1 - y0) * hz * 0.8,
          40 + r() * 120,
          6 + r() * 14,
          0,
          0,
          TAU,
        );
        ctx.fill();
      }
    };
    const tower = (x, base, wd, ht, tone, top, rr) => {
      ctx.fillStyle = tone;
      ctx.fillRect(x, base - ht, wd, ht);
      if (top === "spire") {
        ctx.beginPath();
        ctx.moveTo(x, base - ht);
        ctx.lineTo(x + wd / 2, base - ht - wd * 1.6);
        ctx.lineTo(x + wd, base - ht);
        ctx.fill();
      } else if (top === "pyramid") {
        ctx.fillStyle = "#5a7a6a";
        ctx.beginPath();
        ctx.moveTo(x - 1, base - ht);
        ctx.lineTo(x + wd / 2, base - ht - wd * 1.1);
        ctx.lineTo(x + wd + 1, base - ht);
        ctx.fill();
        ctx.fillStyle = tone;
        ctx.fillRect(x + wd / 2 - 1, base - ht - wd * 1.6, 2, wd * 0.6);
      } else if (top === "broken") {
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(x + wd * 0.2, base - ht - 1);
        ctx.lineTo(x + wd * 0.5, base - ht + wd * 0.6);
        ctx.lineTo(x + wd * 0.9, base - ht - 1);
        ctx.fill();
        ctx.restore();
      } else if (top === "setback") {
        ctx.fillRect(x + wd * 0.2, base - ht - wd * 0.5, wd * 0.6, wd * 0.5);
        ctx.fillRect(x + wd * 0.35, base - ht - wd * 0.8, wd * 0.3, wd * 0.3);
      }
      // windows: a grid of darker cells, the odd one knocked out
      for (let wy = base - ht + 4; wy < base - 3; wy += 5)
        for (let wx = x + 2; wx < x + wd - 2; wx += 4) {
          if (rr() < 0.55) {
            ctx.fillStyle =
              rr() < 0.1 ? "rgba(15,12,8,0.7)" : "rgba(40,40,34,0.35)";
            ctx.fillRect(wx, wy, 2, 3);
          }
        }
    };
    // ---------------- top half: street level ----------------
    sky(0, hh, 0.72);
    for (let layer = 0; layer < 3; layer++) {
      const base = hh,
        tone = ["#a8a690", "#7e7e6c", "#4a4a40"][layer];
      let x = -20;
      while (x < W + 20) {
        const wd = [34, 52, 80][layer] + r() * [30, 50, 70][layer];
        const ht = [150, 120, 80][layer] + r() * [80, 90, 70][layer];
        const roll = r();
        tower(
          x,
          base,
          wd,
          ht,
          tone,
          roll < 0.18
            ? "broken"
            : roll < 0.28
              ? "setback"
              : roll < 0.33
                ? "spire"
                : null,
          r,
        );
        x += wd + [4, 8, 14][layer] + r() * [10, 20, 30][layer];
      }
      ctx.fillStyle = "rgba(200,196,160," + [0.34, 0.2, 0.05][layer] + ")";
      ctx.fillRect(0, 0, W, hh); // atmospheric haze between layers
    }
    // ---------------- bottom half: from the Singer's lantern ----------------
    const hz = hh + hh * 0.42;
    sky(hh, H, 0.42);
    // distant skyline on the horizon, the landmarks picked out
    let x = 0;
    while (x < W) {
      const wd = 10 + r() * 22,
        ht = 6 + r() * 26;
      tower(x, hz, wd, ht, "#8c8c7c", r() < 0.1 ? "spire" : null, r);
      x += wd + 2 + r() * 8;
    }
    tower(W * 0.23, hz, 26, 70, "#9a9480", "spire", r); // the Woolworth
    tower(W * 0.62, hz, 22, 58, "#8a806a", "pyramid", r); // 40 Wall
    tower(W * 0.86, hz, 16, 44, "#7a7c78", "setback", r);
    ctx.fillStyle = "rgba(210,205,170,0.35)";
    ctx.fillRect(0, hz - 60, W, 60);
    // rooftops falling away below the horizon, street canyons
    for (let row = 0; row < 6; row++) {
      const y0 = hz + (row * (H - hz)) / 6,
        tone = 70 - row * 8;
      let xx = -r() * 40;
      while (xx < W) {
        const wd = 30 + r() * 70 + row * 12,
          dh = 8 + r() * 14;
        ctx.fillStyle = rgb([tone + 10, tone + 8, tone], 1);
        ctx.fillRect(xx, y0 - dh, wd, (H - hz) / 6 + dh);
        ctx.fillStyle = rgb([tone + 40, tone + 38, tone + 30], 1);
        ctx.fillRect(xx, y0 - dh, wd, 2); // lit roof edge
        if (r() < 0.3) {
          ctx.fillStyle = rgb([tone - 20, tone - 22, tone - 24]);
          ctx.fillRect(xx + wd * 0.3, y0 - dh - 6, 6, 6);
        } // water tank
        xx += wd + 6 + r() * 16;
      }
    }
    ctx.fillStyle = "rgba(200,196,160,0.16)";
    ctx.fillRect(0, hz, W, H - hz);
    // ---------------- dirty glass over both halves ----------------
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = "rgba(70,60,40," + (0.04 + r() * 0.1) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * W,
        r() * H,
        10 + r() * 60,
        8 + r() * 40,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
    for (let i = 0; i < 120; i++) {
      const sx = r() * W,
        sy = r() * H;
      const g = ctx.createLinearGradient(0, sy, 0, sy + 60);
      g.addColorStop(0, "rgba(60,50,36,0.2)");
      g.addColorStop(1, "rgba(60,50,36,0)");
      ctx.fillStyle = g;
      ctx.fillRect(sx, sy, 2 + r() * 3, 60);
    }
    ctx.strokeStyle = "rgba(235,240,235,0.45)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      let a = r() * TAU,
        px = r() * W,
        py = r() * H;
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (let k = 0; k < 5; k++) {
        a += (r() - 0.5) * 0.8;
        px += Math.cos(a) * (10 + r() * 40);
        py += Math.sin(a) * (10 + r() * 40);
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  /** Pressed-tin ceiling panels (embossed squares & rosettes), cream paint flaking to rust. */
  function tinDraw(ctx, w, h) {
    const r = U.rng(71),
      n = 4,
      s = w / n;
    ctx.fillStyle = "#c8c0a8";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const x = i * s,
          y = j * s;
        ctx.strokeStyle = "rgba(255,250,235,0.5)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 6, y + 6, s - 12, s - 12);
        ctx.strokeStyle = "rgba(60,50,36,0.45)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 9, y + 9, s - 18, s - 18);
        ctx.fillStyle = "rgba(255,250,235,0.35)";
        ctx.beginPath();
        ctx.arc(x + s / 2 - 1, y + s / 2 - 1, s * 0.2, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(60,50,36,0.35)";
        ctx.beginPath();
        ctx.arc(x + s / 2 + 2, y + s / 2 + 2, s * 0.2, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#c8c0a8";
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s / 2, s * 0.18, 0, TAU);
        ctx.fill();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * TAU;
          ctx.fillStyle = "rgba(60,50,36,0.3)";
          ctx.beginPath();
          ctx.arc(
            x + s / 2 + Math.cos(a) * s * 0.3,
            y + s / 2 + Math.sin(a) * s * 0.3,
            4,
            0,
            TAU,
          );
          ctx.fill();
        }
      }
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle =
        "rgba(" + ((110 + r() * 40) | 0) + ",70,40," + (0.12 + r() * 0.2) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        r() * h,
        4 + r() * 20,
        3 + r() * 10,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    } // rust blooms
    weatherLite(ctx, w, h, r, { blotches: 30, dark: 0.16, specks: 300 });
  }
  /** Guastavino tile vault: thin terracotta tiles in herringbone, buff mortar. */
  function guastavinoDraw(ctx, w, h) {
    const r = U.rng(73),
      tw = 64,
      th = 22;
    ctx.fillStyle = "#b8a888";
    ctx.fillRect(0, 0, w, h);
    for (let y = -th; y < h + th; y += th)
      for (let x = -tw; x < w + tw; x += tw) {
        const row = Math.round(y / th),
          off = ((row % 2) * tw) / 2;
        ctx.save();
        ctx.translate(x + off, y);
        ctx.rotate((row % 2 ? 1 : -1) * 0.12);
        ctx.fillStyle = rgb(jit([196, 150, 110], r, 0.18));
        ctx.fillRect(1.5, 1.5, tw - 3, th - 3);
        ctx.fillStyle = "rgba(255,240,220,0.12)";
        ctx.fillRect(1.5, 1.5, tw - 3, 3);
        ctx.restore();
      }
    weatherLite(ctx, w, h, r, { blotches: 40, dark: 0.12, specks: 500 });
  }
  /** Veined white marble panelling (Custom House halls). */
  function marblePanelDraw(ctx, w, h) {
    const r = U.rng(79);
    ctx.fillStyle = "#e0dbd0";
    ctx.fillRect(0, 0, w, h);
    for (let v = 0; v < 26; v++) {
      ctx.strokeStyle =
        "rgba(" +
        ((90 + r() * 40) | 0) +
        "," +
        ((88 + r() * 30) | 0) +
        ",80," +
        (0.15 + r() * 0.3) +
        ")";
      ctx.lineWidth = 0.6 + r() * 2;
      let x = r() * w,
        y = r() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 12; k++) {
        x += (r() - 0.3) * 60;
        y += (r() - 0.5) * 40;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(70,64,56,0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    ctx.strokeRect(w / 2, 1, 0.5, h - 2); // panel joints
    weatherLite(ctx, w, h, r, { blotches: 30, dark: 0.08, specks: 300 });
  }
  Object.assign(PF.CUSTOM_TEX, {
    schist_sq: [512, 512, schistSqDraw],
    flags_sand: [512, 512, flagsDraw],
    singer_marble: [512, 512, singerFloorDraw],
    terrazzo_brass: [512, 512, terrazzoDraw],
    mosaic_ch: [512, 512, mosaicDraw],
    parquet: [512, 512, parquetDraw],
    skyline: [1024, 512, skylineDraw],
    tin_ceiling: [512, 512, tinDraw],
    guastavino: [512, 512, guastavinoDraw],
    marble_panel: [512, 512, marblePanelDraw],
  });
  Object.assign(PF.MAT_DEFS, {
    sp_flags: {
      custom: "flags_sand",
      prefer: "custom",
      color: 0xa89478,
      tint: 0xe8dcc8,
      rough: 0.9,
      uv: 3.2,
      bump: 0.5,
    },
    sg_floor: {
      custom: "singer_marble",
      prefer: "custom",
      color: 0xd8d4c8,
      rough: 0.3,
      uv: 2.6,
    },
    fw_terrazzo: {
      custom: "terrazzo_brass",
      prefer: "custom",
      color: 0xc4b89c,
      rough: 0.35,
      uv: 4.8,
    },
    ch_mosaic: {
      custom: "mosaic_ch",
      prefer: "custom",
      color: 0xc8bca4,
      rough: 0.45,
      uv: 3.6,
    },
    parquet_ws: {
      custom: "parquet",
      prefer: "custom",
      color: 0x7a5634,
      tint: 0xd8c0a0,
      rough: 0.55,
      uv: 2.4,
    },
    // the view out of every window (emissive: interiors read daylit, the view reads through dirty glass)
    sky_view: {
      custom: "skyline",
      prefer: "custom",
      color: 0xb8b8a0,
      tint: 0x9a9888,
      emissive: 0xffffff,
      emissiveIntensity: 0.62,
      emissiveMapCustom: true,
      rough: 0.2,
      metal: 0.1,
      uv: 1,
      noShadow: true,
    },
    window_amber: {
      color: 0x3a3020,
      emissive: 0xffb050,
      emissiveIntensity: 0.32,
      rough: 0.6,
      uv: 2,
      plain: true,
      noShadow: true,
    },
    statue_ws: {
      custom: "stucco",
      prefer: "custom",
      color: 0xa8a292,
      tint: 0xb4ad9c,
      rough: 0.85,
      uv: 1.4,
    }, // weathered, sooty marble
    money: { color: 0x6a7a58, rough: 0.9, uv: 1, plain: true },
    leather_ws: {
      src: "leather",
      color: 0x4a2a1a,
      tint: 0x9a6a48,
      rough: 0.6,
      uv: 1.2,
    },
    china: { color: 0xe8e4da, rough: 0.3, uv: 1, plain: true },
    felt: { src: "carpet", color: 0x2a5a3a, tint: 0x3e7a50, rough: 1, uv: 1 },
    tin_ceil: {
      custom: "tin_ceiling",
      prefer: "custom",
      color: 0xc8c0a8,
      tint: 0xe8e0d0,
      rough: 0.6,
      metal: 0.25,
      uv: 2.4,
      bump: 0.6,
    },
    guastavino: {
      custom: "guastavino",
      prefer: "custom",
      color: 0xc49a70,
      tint: 0xf0dcc8,
      rough: 0.85,
      uv: 2.2,
      bump: 0.4,
    },
    marble_pnl: {
      custom: "marble_panel",
      prefer: "custom",
      color: 0xe0dbd0,
      tint: 0xf4f0e8,
      rough: 0.35,
      uv: 2.4,
    },
    wall_clean: {
      custom: "stucco",
      prefer: "custom",
      color: 0xd8d0bc,
      tint: 0xc8bea8,
      rough: 0.9,
      uv: 4,
    },
    walnut: {
      src: "wood_planks",
      color: 0x3a2618,
      tint: 0x6a4a34,
      rough: 0.5,
      uv: 1.6,
    },
    gilt_matte: {
      color: 0xb08a3c,
      emissive: 0x2a1a04,
      emissiveIntensity: 0.15,
      rough: 0.82,
      metal: 0.2,
      uv: 2,
      plain: true,
    }, // weathered exterior gilding: no sun hotspots / bloom
  });
  /** A random view rectangle for a window of w×h metres. high = the view from 140 m (Singer lantern). */
  PF.skyRect = function (r, w, h, high) {
    const du = Math.min(0.95, Math.max(0.05, (w / h) * 0.25));
    const u0 = r() * (1 - du);
    return high ? [u0, 0, u0 + du, 0.5] : [u0, 0.5, u0 + du, 1];
  };

  // -------------------------------------------------------------------
  // Sign atlas: many sign canvases → one texture/material (one draw call)
  // -------------------------------------------------------------------
  /**
   * entries: [[name, THREE.Texture (canvas)] ...] → {key, rect(name) → [u0,v0,u1,v1]}. Shelf-packed, 4 px padding.
   * opts: {transparent, side, emissive}
   */
  PF.atlas = function (key, entries, opts) {
    opts = opts || {};
    const W = 2048,
      pad = 4,
      rects = {};
    let x = 0,
      y = 0,
      rowH = 0;
    const place = entries.map(([name, tex]) => {
      const img = tex.image,
        w = img.width,
        h = img.height;
      if (x + w + pad > W) {
        x = 0;
        y += rowH + pad;
        rowH = 0;
      }
      const p = { name, img, x, y, w, h };
      x += w + pad;
      rowH = Math.max(rowH, h);
      return p;
    });
    const H = y + rowH;
    const tex = PF.canvasTex(
      "pws_atlas_" + key,
      W,
      H,
      (ctx) => {
        ctx.clearRect(0, 0, W, H);
        for (const p of place) {
          try {
            ctx.drawImage(p.img, p.x, p.y);
          } catch (e) {
            /* canvas missing */
          }
        }
      },
      { clamp: true },
    );
    for (const p of place)
      rects[p.name] = [
        (p.x + 0.5) / W,
        1 - (p.y + p.h - 0.5) / H,
        (p.x + p.w - 0.5) / W,
        1 - (p.y + 0.5) / H,
      ];
    const k = PF.texMat("atlas_" + key, tex, {
      rough: opts.rough === undefined ? 0.85 : opts.rough,
      transparent: !!opts.transparent,
      side: opts.side,
      noShadow: true,
      emissive: opts.emissive,
    });
    return { key: k, rect: (name) => rects[name] || [0, 0, 1, 1] };
  };

  // -------------------------------------------------------------------
  // Statues: standing draped figure (Custom House attic — the trading nations)
  // -------------------------------------------------------------------
  /**
   * Standing classical figure, ~2.6 m at s = 1, faces +z. variant: 0 oar, 1 caduceus, 2 cornucopia, 3 spear & shield,
   * 4 anchor, 5 book & torch. opts: {grime, broken (head lost)}.
   */
  PF.standingFigure = function (b, key, x, y, z, ry, variant, s, opts) {
    opts = opts || {};
    s = s || 1;
    const M = PF.m4(x, y, z, ry, 0, 0, s, s, s);
    const gr = opts.grime === undefined ? 0.7 : opts.grime;
    const add = (g, m, k) =>
      b.add(k || key, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: gr,
      });
    const lathe = (prof, seg) =>
      new THREE.LatheGeometry(
        prof.map((p) => new THREE.Vector2(Math.max(0.001, p[0]), p[1])),
        Math.min(seg || 9, 10),
      );
    const limb = (a, c, r0) => {
      const A = V3(a[0], a[1], a[2]),
        C = V3(c[0], c[1], c[2]),
        d = C.clone().sub(A),
        len = d.length();
      const g = new THREE.CapsuleGeometry(r0, Math.max(0.01, len), 1, 6);
      g.translate(0, len / 2, 0);
      add(
        g,
        new THREE.Matrix4().compose(
          A,
          new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), d.normalize()),
          V3(1, 1, 1),
        ),
      );
    };
    const hip = (variant % 2 ? -1 : 1) * 0.07; // contrapposto
    // plinth
    add(new THREE.BoxGeometry(0.9, 0.18, 0.75), PF.m4(0, 0.09, 0));
    // robe: long chiton with deep vertical folds, weight-leg knee pushing through
    const robe = lathe(
      [
        [0.001, 0.18],
        [0.44, 0.18],
        [0.4, 0.5],
        [0.33, 0.95],
        [0.29, 1.3],
        [0.26, 1.42],
        [0.001, 1.44],
      ],
      16,
    );
    PF.deform(robe, (v) => {
      const a = Math.atan2(v.z, v.x);
      const t = Math.max(0, (1.4 - v.y) / 1.2);
      const f = 1 + 0.12 * t * Math.sin(a * 9 + v.y * 2.2);
      v.x = v.x * f + hip * (v.y - 0.18);
      v.z *= f * 0.78;
      if (v.z > 0.1 && v.y > 0.6 && v.y < 1.0 && v.x * Math.sign(hip) > 0)
        v.z += 0.05;
    });
    add(robe, PF.m4(0, 0, 0));
    // torso + himation (mantle) slung across the body
    const torso = lathe(
      [
        [0.001, 0],
        [0.27, 0],
        [0.24, 0.2],
        [0.27, 0.42],
        [0.28, 0.55],
        [0.22, 0.66],
        [0.08, 0.72],
        [0.001, 0.73],
      ],
      12,
    );
    torso.scale(1.15, 1, 0.75);
    add(torso, PF.m4(hip * 1.25, 1.36, 0, 0, 0, -hip * 0.6));
    const mantle = new THREE.CylinderGeometry(
      0.33,
      0.4,
      0.62,
      8,
      1,
      true,
      -HP * 0.2,
      PI * 1.25,
    );
    PF.deform(mantle, (v) => {
      const a = Math.atan2(v.z, v.x);
      const f = 1 + 0.07 * Math.sin(a * 6 + v.y * 4);
      v.x *= f;
      v.z *= f * 0.8;
    });
    add(mantle, PF.m4(hip, 1.25, 0.0, 0.5, 0, 0.3));
    for (const sx of [-1, 1])
      add(
        new THREE.SphereGeometry(0.12, 6, 4),
        PF.m4(hip * 1.3 + sx * 0.27, 1.95, 0, 0, 0, 0, 1, 0.85, 1),
      );
    // head
    const hx = hip * 1.4,
      hy = 2.2;
    if (!opts.broken) {
      add(
        new THREE.CylinderGeometry(0.06, 0.075, 0.16, 7),
        PF.m4(hx, 2.02, 0.01),
      );
      add(
        new THREE.SphereGeometry(0.125, 8, 6),
        PF.m4(hx, hy, 0.02, 0, 0.08, 0, 0.86, 1.08, 1),
      );
      add(new THREE.BoxGeometry(0.07, 0.05, 0.05), PF.m4(hx, hy - 0.01, 0.13));
      if (variant === 3)
        add(
          lathe(
            [
              [0.14, 0],
              [0.15, 0.12],
              [0.11, 0.22],
              [0.02, 0.3],
            ],
            10,
          ),
          PF.m4(hx, hy - 0.02, 0),
        ); // helmet
      else {
        add(
          new THREE.SphereGeometry(0.13, 7, 4, 0, TAU, 0, PI * 0.55),
          PF.m4(hx, hy + 0.02, -0.02, 0, -0.3, 0, 1, 1, 1.05),
        );
        add(new THREE.SphereGeometry(0.07, 5, 4), PF.m4(hx, hy - 0.02, -0.14));
      }
    } else {
      add(
        new THREE.CylinderGeometry(0.05, 0.075, 0.08, 7),
        PF.m4(hx, 2.0, 0.01, 0, 0.3, 0.2),
      ); // snapped neck
    }
    const sh = (sx) => [hip * 1.3 + sx * 0.3, 1.93, 0];
    // per-variant arms and attributes
    if (variant === 0) {
      // Commerce by sea: the steering oar
      limb(sh(1), [0.42, 1.55, 0.12], 0.07);
      limb([0.42, 1.55, 0.12], [0.36, 1.3, 0.3], 0.06);
      limb(sh(-1), [-0.4, 1.5, 0.05], 0.07);
      limb([-0.4, 1.5, 0.05], [-0.36, 1.2, 0.12], 0.06);
      add(
        new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6),
        PF.m4(0.38, 1.25, 0.32, 0, 0.1, 0.12),
      );
      add(
        new THREE.BoxGeometry(0.22, 0.6, 0.05),
        PF.m4(0.28, 0.35, 0.36, 0, 0.1, 0.12),
      );
    } else if (variant === 1) {
      // Mercury's caduceus
      limb(sh(1), [0.4, 1.95, 0.1], 0.07);
      limb([0.4, 1.95, 0.1], [0.42, 2.35, 0.14], 0.06);
      add(
        new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6),
        PF.m4(0.43, 2.4, 0.15),
      );
      for (let k = 0; k < 3; k++)
        add(
          new THREE.TorusGeometry(0.06, 0.018, 4, 8),
          PF.m4(0.43, 2.2 + k * 0.14, 0.15, k * 1.2, HP),
        );
      for (const sx of [-1, 1])
        add(
          new THREE.BoxGeometry(0.14, 0.03, 0.06),
          PF.m4(0.43 + sx * 0.08, 2.92, 0.15, 0, 0, sx * 0.5),
        );
      limb(sh(-1), [-0.36, 1.45, 0.02], 0.07);
      limb([-0.36, 1.45, 0.02], [-0.3, 1.18, 0.1], 0.06);
    } else if (variant === 2) {
      // Abundance: the cornucopia
      limb(sh(-1), [-0.4, 1.55, 0.12], 0.07);
      limb([-0.4, 1.55, 0.12], [-0.12, 1.5, 0.3], 0.06);
      const horn = new THREE.ConeGeometry(0.2, 0.9, 10, 4, true);
      PF.deform(horn, (v) => {
        const t = (v.y + 0.45) / 0.9;
        v.x += Math.sin(t * PI) * 0.18;
      });
      add(horn, PF.m4(-0.28, 1.72, 0.3, 0, -0.5, 0.9));
      for (let k = 0; k < 5; k++)
        add(
          new THREE.SphereGeometry(0.07, 6, 5),
          PF.m4(
            -0.02 + (k % 3) * 0.08,
            2.0 + (k > 2 ? 0.08 : 0),
            0.36 + (k % 2) * 0.05,
          ),
        );
      limb(sh(1), [0.38, 1.5, 0.0], 0.07);
      limb([0.38, 1.5, 0.0], [0.34, 1.2, 0.1], 0.06);
    } else if (variant === 3) {
      // Defence: spear and round shield
      limb(sh(1), [0.42, 1.85, 0.1], 0.07);
      limb([0.42, 1.85, 0.1], [0.44, 2.2, 0.14], 0.06);
      add(
        new THREE.CylinderGeometry(0.025, 0.025, 2.8, 6),
        PF.m4(0.45, 1.6, 0.15),
      );
      add(new THREE.ConeGeometry(0.05, 0.22, 5), PF.m4(0.45, 3.1, 0.15));
      limb(sh(-1), [-0.38, 1.55, 0.1], 0.07);
      limb([-0.38, 1.55, 0.1], [-0.32, 1.3, 0.3], 0.06);
      add(
        new THREE.CylinderGeometry(0.4, 0.4, 0.06, 16),
        PF.m4(-0.42, 1.2, 0.3, 0, HP, 0.2),
      );
    } else if (variant === 4) {
      // the Port: an anchor at her side
      limb(sh(1), [0.4, 1.5, 0.05], 0.07);
      limb([0.4, 1.5, 0.05], [0.44, 1.2, 0.18], 0.06);
      add(
        new THREE.CylinderGeometry(0.035, 0.035, 1.2, 6),
        PF.m4(0.5, 0.82, 0.22),
      );
      add(
        new THREE.TorusGeometry(0.28, 0.04, 5, 10, PI),
        PF.m4(0.5, 0.52, 0.22, 0, 0, PI),
      );
      add(new THREE.BoxGeometry(0.5, 0.05, 0.05), PF.m4(0.5, 1.28, 0.22));
      limb(sh(-1), [-0.3, 1.55, 0.15], 0.07);
      limb([-0.3, 1.55, 0.15], [0.0, 1.62, 0.3], 0.06);
    } else {
      // Learning: book and lamp
      limb(sh(1), [0.4, 1.7, 0.12], 0.07);
      limb([0.4, 1.7, 0.12], [0.36, 2.05, 0.24], 0.06);
      add(
        lathe(
          [
            [0.001, 0],
            [0.06, 0.03],
            [0.1, 0.1],
            [0.04, 0.14],
            [0.02, 0.22],
          ],
          8,
        ),
        PF.m4(0.36, 2.08, 0.26),
      );
      limb(sh(-1), [-0.36, 1.5, 0.12], 0.07);
      limb([-0.36, 1.5, 0.12], [-0.12, 1.42, 0.3], 0.06);
      add(
        new THREE.BoxGeometry(0.3, 0.06, 0.24),
        PF.m4(-0.12, 1.45, 0.34, 0, 0.3, 0.2),
      );
    }
  };

  // -------------------------------------------------------------------
  // Carved skull (statue attribute / ossuary): cranium, brow, sockets, nose, jaw, teeth row
  // -------------------------------------------------------------------
  PF.skull = function (b, key, sockKey, x, y, z, s, ry, rx, opts) {
    opts = opts || {};
    const M = PF.m4(x, y, z, ry || 0, rx || 0, 0, s, s, s);
    const add = (g, m, k) =>
      b.add(k || key, g, {
        m: new THREE.Matrix4().multiplyMatrices(
          opts.M ? new THREE.Matrix4().multiplyMatrices(opts.M, M) : M,
          m,
        ),
        grime: opts.grime === undefined ? 0.5 : opts.grime,
      });
    add(
      new THREE.SphereGeometry(0.1, 8, 6),
      PF.m4(0, 0.1, -0.015, 0, 0, 0, 0.92, 0.9, 1.12),
    ); // cranium
    add(new THREE.BoxGeometry(0.15, 0.035, 0.05), PF.m4(0, 0.1, 0.075)); // brow ridge
    add(new THREE.BoxGeometry(0.13, 0.08, 0.09), PF.m4(0, 0.04, 0.05)); // maxilla / cheekbones
    for (const sx of [-1, 1])
      add(
        new THREE.SphereGeometry(0.03, 5, 4),
        PF.m4(sx * 0.037, 0.075, 0.093, 0, 0, 0, 1, 0.9, 0.5),
        sockKey,
      ); // orbits
    add(
      new THREE.ConeGeometry(0.016, 0.03, 3),
      PF.m4(0, 0.035, 0.098, 0, HP * 0.1, PI),
      sockKey,
    ); // nasal aperture
    add(
      new THREE.BoxGeometry(0.1, 0.035, 0.07),
      PF.m4(0, -0.005, 0.045, 0, -0.15),
    ); // jaw
    add(
      new THREE.BoxGeometry(0.085, 0.012, 0.012),
      PF.m4(0, 0.012, 0.092),
      sockKey,
    ); // teeth line
  };

  // -------------------------------------------------------------------
  // Office dressing
  // -------------------------------------------------------------------
  /**
   * Desk-top clutter centred at (x, y = desk top, z), rotated ry (front of desk toward +z local):
   * blotter, typewriter or ledger, telephone, banker's lamp (optionally lit), ashtray, pen stand, papers.
   */
  PF.deskClutter = function (b, x, y, z, ry, seed, opts) {
    opts = opts || {};
    const r = PF.rng("desk" + seed);
    const M = PF.m4(x, y, z, ry);
    const add = (k, g, m, o) =>
      b.add(
        k,
        g,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.35 },
          o || {},
        ),
      );
    add(
      "felt",
      new THREE.BoxGeometry(0.62, 0.012, 0.42),
      PF.m4(0, 0.006, 0.05),
    );
    if (opts.typewriter !== false && r() < 0.8) {
      add(
        "black_enamel",
        new THREE.BoxGeometry(0.42, 0.09, 0.34),
        PF.m4(-0.05, 0.045, 0.02),
      );
      add(
        "black_enamel",
        new THREE.BoxGeometry(0.4, 0.05, 0.16),
        PF.m4(-0.05, 0.1, 0.1, 0, 0.35),
      );
      add(
        "iron",
        new THREE.CylinderGeometry(0.03, 0.03, 0.44, 8),
        PF.m4(-0.05, 0.14, -0.1, 0, 0, HP),
      );
      add(
        "paper",
        new THREE.PlaneGeometry(0.2, 0.26),
        PF.m4(-0.05, 0.25, -0.12, 0, -0.25),
        { uv: "keep", noAO: true },
      );
      for (let k = 0; k < 4; k++)
        add(
          "chrome",
          new THREE.BoxGeometry(0.34, 0.01, 0.02),
          PF.m4(-0.05, 0.1 + k * 0.012, 0.16 - k * 0.03, 0, 0.35),
        );
    } else {
      add(
        "mahog_ws",
        new THREE.BoxGeometry(0.34, 0.05, 0.26),
        PF.m4(-0.05, 0.025, 0.05, 0.2),
      ); // ledger
      add(
        "paper",
        new THREE.BoxGeometry(0.32, 0.03, 0.24),
        PF.m4(-0.05, 0.05, 0.05, 0.2),
      );
    }
    // telephone
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.16, 0.06, 0.18),
      PF.m4(0.36, 0.03, -0.08, -0.3),
    );
    add(
      "black_enamel",
      new THREE.CapsuleGeometry(0.02, 0.16, 2, 6),
      PF.m4(0.36, 0.085, -0.08, -0.3, 0, HP),
    );
    // banker's lamp
    add(
      "brass_ws",
      new THREE.CylinderGeometry(0.06, 0.07, 0.03, 10),
      PF.m4(-0.36, 0.015, -0.14),
    );
    add(
      "brass_ws",
      new THREE.CylinderGeometry(0.01, 0.01, 0.3, 5),
      PF.m4(-0.36, 0.17, -0.14),
    );
    add(
      opts.lit ? "lamp_ws" : "paint_teal",
      new THREE.CylinderGeometry(0.1, 0.1, 0.24, 10, 1, false, 0, PI),
      PF.m4(-0.36, 0.34, -0.1, 0, 0, HP),
    );
    if (opts.lit)
      PF.glow(
        new THREE.Vector3(-0.36, 0.3, -0.05).applyMatrix4(M),
        0x9affb0,
        0.8,
        opts.parent || null,
        { intensity: 0.8 },
      );
    // ashtray + butts, pen stand, loose papers & a coffee cup
    add(
      "chrome",
      new THREE.CylinderGeometry(0.06, 0.05, 0.02, 10),
      PF.m4(0.3, 0.01, 0.16),
    );
    for (let k = 0; k < 3; k++)
      add(
        "paper",
        new THREE.CylinderGeometry(0.006, 0.006, 0.04, 4),
        PF.m4(0.28 + k * 0.02, 0.025, 0.15 + (k % 2) * 0.02, 0, 0, HP),
      );
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.1, 0.02, 0.05),
      PF.m4(0.12, 0.01, 0.2),
    );
    add(
      "black_enamel",
      new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4),
      PF.m4(0.1, 0.07, 0.2, 0, 0.3),
    );
    add(
      "china",
      new THREE.CylinderGeometry(0.04, 0.033, 0.08, 10),
      PF.m4(0.22, 0.04, -0.16),
    );
    for (let k = 0; k < 4; k++)
      add(
        "paper",
        new THREE.PlaneGeometry(0.21, 0.28),
        PF.m4(
          0.05 + (r() - 0.5) * 0.4,
          0.014 + k * 0.002,
          -0.1 + (r() - 0.5) * 0.15,
          r() * 3,
          -HP,
        ),
        { uv: "keep", noAO: true },
      );
  };
  /** Leather club chair (key = leather). */
  PF.clubChair = function (b, x, y, z, ry, key, tipped) {
    key = key || "leather_ws";
    const M = PF.m4(
      x,
      y + (tipped ? 0.42 : 0),
      z,
      ry,
      tipped ? -HP + 0.15 : 0,
      0,
    );
    const add = (g, m) =>
      b.add(key, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.45,
      });
    add(new THREE.BoxGeometry(0.8, 0.28, 0.78), PF.m4(0, 0.2, 0));
    add(new THREE.BoxGeometry(0.62, 0.14, 0.62), PF.m4(0, 0.4, 0.06));
    add(new THREE.BoxGeometry(0.8, 0.5, 0.18), PF.m4(0, 0.55, -0.32, 0, -0.1));
    for (const sx of [-1, 1])
      add(
        new THREE.CapsuleGeometry(0.1, 0.62, 2, 8),
        PF.m4(sx * 0.36, 0.52, 0.02, 0, HP),
      );
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        b.add("mahog_ws", new THREE.BoxGeometry(0.06, 0.08, 0.06), {
          m: new THREE.Matrix4().multiplyMatrices(
            M,
            PF.m4(sx * 0.34, 0.04, sz * 0.32),
          ),
          grime: 0.3,
        });
  };
  /** Bookcase (w wide, rows of shelves) filled with leather-bound books, a few leaning or fallen. */
  PF.bookcase = function (b, x, y, z, ry, w, rows, seed, key) {
    const r = PF.rng("books" + seed);
    const M = PF.m4(x, y, z, ry);
    const add = (k, g, m, o) =>
      b.add(
        k,
        g,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.4 },
          o || {},
        ),
      );
    const H = rows * 0.42 + 0.25,
      wood = key || "walnut";
    add(wood, new THREE.BoxGeometry(w, H, 0.06), PF.m4(0, H / 2, -0.17));
    for (const sx of [-1, 1])
      add(
        wood,
        new THREE.BoxGeometry(0.05, H, 0.4),
        PF.m4(sx * (w / 2 - 0.025), H / 2, 0),
      );
    add(
      wood,
      new THREE.BoxGeometry(w + 0.08, 0.08, 0.44),
      PF.m4(0, H + 0.04, 0),
    );
    const cols = [0x5a1a14, 0x1e3a2a, 0x2a2440, 0x6a4a2a, 0x3a2a1a, 0x7a6a4a];
    for (let k = 0; k < rows; k++) {
      const sy = 0.08 + k * 0.42;
      add(wood, new THREE.BoxGeometry(w - 0.1, 0.03, 0.36), PF.m4(0, sy, 0.01));
      let bx = -w / 2 + 0.08;
      while (bx < w / 2 - 0.12) {
        const bw = 0.03 + r() * 0.04,
          bh = 0.24 + r() * 0.1;
        if (r() < 0.08) {
          bx += 0.15;
          continue;
        }
        const lean = r() < 0.06 ? 0.3 : 0;
        add(
          "leather_ws",
          new THREE.BoxGeometry(bw, bh, 0.24),
          PF.m4(bx + bw / 2, sy + 0.015 + bh / 2, 0.02, 0, 0, lean),
          { c: cols[(r() * cols.length) | 0], grime: 0.3 },
        );
        bx += bw + 0.004 + (lean ? 0.06 : 0);
      }
    }
    for (let k = 0; k < 3; k++)
      add(
        "leather_ws",
        new THREE.BoxGeometry(0.2, 0.05, 0.28),
        PF.m4((r() - 0.5) * w, 0.03 - y + y, 0.45 + r() * 0.3, r() * 3),
        { c: cols[k], grime: 0.4 },
      ); // fallen books
    PF.col(x, z, w, 0.45, y, y + H, ry, { walkable: false });
  };
  /** Oriental rug texture atlas (2 designs) + a rug quad on the floor. */
  PF.rugKey = function () {
    return PF.texMat(
      "rugs",
      PF.canvasTex(
        "pws_rugs",
        512,
        256,
        (ctx, W, H) => {
          const r = PF.rng("rugs");
          for (let v = 0; v < 2; v++) {
            const x0 = v * 256,
              cx = x0 + 128,
              cy = 128;
            const field = v ? "#1e2a4a" : "#6a1a1a",
              border = v ? "#8a2a20" : "#1e2a44",
              gold = "#c89a4a";
            ctx.fillStyle = border;
            ctx.fillRect(x0, 0, 256, 256);
            ctx.fillStyle = gold;
            ctx.fillRect(x0 + 14, 14, 228, 228);
            ctx.fillStyle = field;
            ctx.fillRect(x0 + 22, 22, 212, 212);
            for (let k = 0; k < 28; k++) {
              ctx.fillStyle = k % 2 ? gold : "#e8dcc0";
              ctx.fillRect(x0 + 4 + k * 9, 4, 5, 6);
              ctx.fillRect(x0 + 4 + k * 9, 246, 5, 6);
            }
            ctx.fillStyle = gold;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 80);
            ctx.lineTo(cx + 60, cy);
            ctx.lineTo(cx, cy + 80);
            ctx.lineTo(cx - 60, cy);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = v ? "#6a1a1a" : "#1e2a44";
            ctx.beginPath();
            ctx.moveTo(cx, cy - 56);
            ctx.lineTo(cx + 40, cy);
            ctx.lineTo(cx, cy + 56);
            ctx.lineTo(cx - 40, cy);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#e8dcc0";
            ctx.beginPath();
            ctx.arc(cx, cy, 14, 0, TAU);
            ctx.fill();
            for (const [dx, dy] of [
              [-80, -80],
              [80, -80],
              [-80, 80],
              [80, 80],
            ]) {
              ctx.fillStyle = gold;
              ctx.beginPath();
              ctx.arc(cx + dx, cy + dy, 16, 0, TAU);
              ctx.fill();
            }
            for (let i = 0; i < 160; i++) {
              ctx.fillStyle =
                "rgba(" +
                (r() < 0.5 ? "0,0,0" : "230,210,170") +
                "," +
                r() * 0.15 +
                ")";
              ctx.fillRect(x0 + 22 + r() * 212, 22 + r() * 212, 2 + r() * 6, 2);
            }
            for (let i = 0; i < 20; i++) {
              ctx.fillStyle = "rgba(40,30,20," + r() * 0.3 + ")";
              ctx.beginPath();
              ctx.ellipse(
                x0 + r() * 256,
                r() * 256,
                8 + r() * 30,
                5 + r() * 16,
                r() * 3,
                0,
                TAU,
              );
              ctx.fill();
            } // stains
          }
        },
        { clamp: true },
      ),
      { rough: 1 },
    );
  };
  PF.rug = function (b, x, y, z, w, d, ry, v) {
    b.quad(PF.rugKey(), x, y + 0.012, z, w, d, {
      rx: -HP,
      rz: ry || 0,
      uvRect: v ? [0.5, 0, 1, 1] : [0, 0, 0.5, 1],
      grime: 0.4,
      noAO: true,
    });
  };
  /** Posters atlas: 0 pin-up, 1 Fizzo Cola, 2 WANTED, 3 Civil Defense. */
  PF.posterKey = function () {
    return PF.texMat(
      "posters",
      PF.canvasTex(
        "pws_posters",
        512,
        256,
        (ctx) => {
          const r = PF.rng("posters");
          const panel = (i, bg) => {
            ctx.fillStyle = bg;
            ctx.fillRect(i * 128 + 2, 2, 124, 252);
          };
          // 0: pin-up (silhouette in a swimsuit on a sun-yellow ground)
          panel(0, "#e8c05a");
          ctx.fillStyle = "#c83a2a";
          ctx.beginPath();
          ctx.arc(64, 70, 16, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#f0d0b0";
          ctx.beginPath();
          ctx.ellipse(64, 104, 18, 26, 0, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(58, 160, 14, 38, 0.2, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(76, 160, 12, 36, -0.35, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#1e4a8a";
          ctx.fillRect(48, 112, 32, 26);
          ctx.fillStyle = "#3a2a1a";
          ctx.beginPath();
          ctx.arc(64, 72, 14, PI, 0);
          ctx.fill();
          ctx.fillStyle = "#7a1a14";
          ctx.font = "bold 20px Georgia, serif";
          ctx.textAlign = "center";
          ctx.fillText("ATOMIC", 64, 226);
          ctx.font = "italic 14px Georgia, serif";
          ctx.fillText("Bombshell", 64, 244);
          // 1: Fizzo Cola
          panel(1, "#a81c18");
          ctx.fillStyle = "#f0e8d8";
          ctx.font = "bold italic 22px Georgia, serif";
          ctx.fillText("Fizzo Cola", 192, 46);
          ctx.fillStyle = "#2a1a14";
          ctx.beginPath();
          ctx.moveTo(182, 90);
          ctx.lineTo(202, 90);
          ctx.lineTo(206, 120);
          ctx.quadraticCurveTo(214, 150, 208, 210);
          ctx.lineTo(176, 210);
          ctx.quadraticCurveTo(170, 150, 178, 120);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#e8e0d0";
          ctx.fillRect(176, 150, 32, 20);
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "#f0e8d8";
          ctx.fillText("ZAP THAT THIRST!", 192, 240);
          // 2: WANTED
          panel(2, "#d8c8a0");
          ctx.fillStyle = "#2a1a10";
          ctx.font = "bold 26px Georgia, serif";
          ctx.fillText("WANTED", 320, 40);
          ctx.fillStyle = "#6a5a44";
          ctx.fillRect(282, 56, 76, 90);
          ctx.fillStyle = "#3a2a1a";
          ctx.beginPath();
          ctx.arc(320, 92, 20, 0, TAU);
          ctx.fill();
          ctx.fillRect(296, 112, 48, 34);
          ctx.fillStyle = "#2a1a10";
          ctx.font = "bold 13px Georgia, serif";
          ctx.fillText("MADAME BOBBIN", 320, 170);
          ctx.font = "11px Georgia, serif";
          ctx.fillText("Stitchers gang", 320, 188);
          ctx.font = "bold 16px Georgia, serif";
          ctx.fillText("500 SCRIP", 320, 216);
          ctx.font = "10px Georgia, serif";
          ctx.fillText("— H. Fenwick, C.H.T.P.", 320, 238);
          // 3: Civil Defense (circle-and-triangle insignia)
          panel(3, "#e4dcc6");
          ctx.fillStyle = "#24305a";
          ctx.beginPath();
          ctx.arc(448, 100, 40, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#f4f0e4";
          ctx.beginPath();
          ctx.moveTo(448, 68);
          ctx.lineTo(476, 118);
          ctx.lineTo(420, 118);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#b8241c";
          ctx.font = "bold 18px Arial";
          ctx.fillText("CD", 448, 110);
          ctx.fillStyle = "#24305a";
          ctx.font = "bold 15px Arial";
          ctx.fillText("CIVIL DEFENSE", 448, 176);
          ctx.font = "bold 11px Arial";
          ctx.fillText("KNOW YOUR", 448, 200);
          ctx.fillText("SHELTER!", 448, 216);
          for (let i = 0; i < 260; i++) {
            ctx.fillStyle = "rgba(60,40,20," + r() * 0.18 + ")";
            ctx.beginPath();
            ctx.arc(r() * 512, r() * 256, 1 + r() * 8, 0, TAU);
            ctx.fill();
          }
          for (let i = 0; i < 4; i++) {
            ctx.fillStyle = "rgba(230,220,190,0.5)";
            ctx.beginPath();
            ctx.moveTo(i * 128 + 128, 256);
            ctx.lineTo(i * 128 + 100, 256);
            ctx.lineTo(i * 128 + 128, 226);
            ctx.fill();
          } // torn corners
        },
        { clamp: true },
      ),
      { rough: 0.9, noShadow: true },
    );
  };
  PF.poster = function (b, i, x, y, z, w, h, ry, tilt) {
    b.quad(PF.posterKey(), x, y, z, w, h, {
      ry,
      rz: tilt || 0,
      uvRect: [i * 0.25, 0, i * 0.25 + 0.25, 1],
      grime: 0.25,
      noAO: true,
    });
  };

  // -------------------------------------------------------------------
  // Bank strongroom dressing: bullion shelves, cash bricks, money carts, coin sacks
  // -------------------------------------------------------------------
  /** Steel shelving (w wide along local x, 0.6 deep) stacked with gold bars (pyramids) and strapped cash bricks. */
  PF.bullionShelf = function (b, x, y, z, ry, w, rows, seed, opts) {
    opts = opts || {};
    const r = PF.rng("bullion" + seed);
    const M = PF.m4(x, y, z, ry);
    const add = (k, g, m) =>
      b.add(k, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: k === "goldbar" ? 0.1 : 0.35,
      });
    const H = rows * 0.5 + 0.2;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        add(
          "vault_ws",
          new THREE.BoxGeometry(0.05, H, 0.05),
          PF.m4(sx * (w / 2 - 0.03), H / 2, sz * 0.27),
        );
    for (let k = 0; k < rows; k++) {
      const sy = 0.15 + k * 0.5;
      add("vault_ws", new THREE.BoxGeometry(w, 0.03, 0.6), PF.m4(0, sy, 0));
      const cash = opts.cash && k % 2 === 1;
      for (let xx = -w / 2 + 0.2; xx < w / 2 - 0.15; xx += 0.36) {
        if (r() < 0.15) continue;
        if (cash) {
          for (let l = 0; l < 3; l++)
            for (let zz = 0; zz < 2; zz++)
              add(
                "money",
                new THREE.BoxGeometry(0.16, 0.06, 0.07),
                PF.m4(
                  xx,
                  sy + 0.045 + l * 0.062,
                  -0.1 + zz * 0.18,
                  (r() - 0.5) * 0.1,
                ),
              );
        } else {
          // bar pyramid: 3 + 2 + 1, each bar a trapezoid prism
          for (let l = 0; l < 3; l++)
            for (let i = 0; i < 3 - l; i++) {
              const g = new THREE.CylinderGeometry(0.05, 0.068, 0.045, 4, 1);
              g.rotateY(PI / 4);
              g.scale(1.45, 1, 0.8);
              add(
                "goldbar",
                g,
                PF.m4(
                  xx,
                  sy + 0.038 + l * 0.046,
                  -0.1 + (i - (2 - l) / 2) * 0.1,
                ),
              );
            }
        }
      }
    }
    PF.col(x, z, w, 0.62, y, y + H, ry, { walkable: false, surface: "metal" });
  };
  /** Canvas coin sack: upright, or burst open with coins spilled around it. */
  PF.coinSack = function (b, x, y, z, burst, seed) {
    const r = PF.rng("sack" + seed);
    if (!burst) {
      b.sphere("canvas_ws", x, y + 0.24, z, 0.26, {
        ws: 8,
        hs: 6,
        sy: 1.1,
        c: 0xc8b890,
        deform: (v) => {
          v.x *= 1 + 0.1 * Math.sin(v.y * 20);
        },
      });
      b.cyl("rope", x, y + 0.5, z, 0.06, 0.08, 0.08, 6, { hSeg: 1 });
      b.cyl("canvas_ws", x, y + 0.56, z, 0.1, 0.05, 0.1, 6, {
        hSeg: 1,
        c: 0xc8b890,
      });
      return;
    }
    b.sphere("canvas_ws", x, y + 0.1, z, 0.3, {
      ws: 8,
      hs: 6,
      sy: 0.4,
      c: 0xc0b088,
    });
    for (let k = 0; k < 26; k++) {
      const a = r() * TAU,
        d = 0.2 + Math.pow(r(), 0.7) * 0.9;
      b.cyl(
        r() < 0.3 ? "brass_ws" : "vault_ws",
        x + Math.cos(a) * d,
        y + 0.004,
        z + Math.sin(a) * d,
        0.022,
        0.022,
        0.006,
        8,
        { hSeg: 1, rx: (r() - 0.5) * 0.3, noAO: true, grime: 0.2 },
      );
    }
    for (let k = 0; k < 4; k++)
      b.cyl(
        "brass_ws",
        x + 0.15 + k * 0.01,
        y + 0.01 + k * 0.007,
        z - 0.2,
        0.022,
        0.022,
        0.006,
        8,
        { hSeg: 1, noAO: true },
      );
  };
  /** Steel money cart: wire basket on four castors, cash bricks and a ledger inside. */
  PF.moneyCart = function (b, x, y, z, ry, seed, tipped) {
    const r = PF.rng("cart" + seed);
    const M = PF.m4(
      x,
      y + (tipped ? 0.45 : 0),
      z,
      ry,
      0,
      tipped ? HP - 0.1 : 0,
    );
    const add = (k, g, m) =>
      b.add(k, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.4,
      });
    add("vault_dk", new THREE.BoxGeometry(1.0, 0.04, 0.6), PF.m4(0, 0.25, 0));
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      add(
        "vault_ws",
        new THREE.BoxGeometry(0.03, 0.62, 0.03),
        PF.m4(sx * 0.48, 0.55, sz * 0.28),
      );
      add(
        "tire",
        new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8),
        PF.m4(sx * 0.42, 0.06, sz * 0.24, 0, 0, HP),
      );
    }
    for (let k = 0; k < 7; k++) {
      add(
        "vault_ws",
        new THREE.BoxGeometry(1.0, 0.02, 0.02),
        PF.m4(0, 0.3 + k * 0.09, 0.29),
      );
      add(
        "vault_ws",
        new THREE.BoxGeometry(1.0, 0.02, 0.02),
        PF.m4(0, 0.3 + k * 0.09, -0.29),
      );
    }
    add(
      "vault_ws",
      new THREE.BoxGeometry(0.03, 0.03, 0.62),
      PF.m4(0.62, 0.95, 0),
    );
    for (let k = 0; k < 10; k++)
      add(
        "money",
        new THREE.BoxGeometry(0.16, 0.06, 0.07),
        PF.m4(
          -0.35 + (k % 5) * 0.17,
          0.3 + Math.floor(k / 5) * 0.065,
          (r() - 0.5) * 0.3,
          r() * 0.3,
        ),
      );
    if (!tipped)
      PF.col(x, z, 1.1, 0.7, y, y + 0.9, ry, {
        walkable: false,
        surface: "metal",
      });
  };

  // -------------------------------------------------------------------
  // Decals: bullet-hole clusters, water stains, blood, scorch, graffiti arrows (transparent atlas 4×2)
  // -------------------------------------------------------------------
  PF.decalKey = function () {
    return PF.texMat(
      "decals",
      PF.canvasTex(
        "pws_decals",
        1024,
        512,
        (ctx) => {
          const r = PF.rng("decals"),
            S = 256;
          ctx.clearRect(0, 0, 1024, 512);
          const cell = (i, fn) => {
            ctx.save();
            ctx.translate((i % 4) * S, Math.floor(i / 4) * S);
            fn();
            ctx.restore();
          };
          // 0, 1: bullet-hole clusters (spalled plaster ring + dark core)
          for (const i of [0, 1])
            cell(i, () => {
              for (let k = 0; k < 9 + i * 6; k++) {
                const x = 40 + r() * 176,
                  y = 40 + r() * 176,
                  rr = 5 + r() * 8;
                ctx.fillStyle = "rgba(235,228,212,0.8)";
                ctx.beginPath();
                ctx.arc(x, y, rr * 2.1, 0, TAU);
                ctx.fill();
                ctx.fillStyle = "rgba(110,100,86,0.9)";
                ctx.beginPath();
                ctx.arc(x, y, rr * 1.2, 0, TAU);
                ctx.fill();
                ctx.fillStyle = "rgba(20,16,12,1)";
                ctx.beginPath();
                ctx.arc(x, y, rr * 0.55, 0, TAU);
                ctx.fill();
              }
            });
          // 2: water stain run from the ceiling
          cell(2, () => {
            const g = ctx.createLinearGradient(0, 0, 0, S);
            g.addColorStop(0, "rgba(90,70,40,0.75)");
            g.addColorStop(1, "rgba(90,70,40,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(60, 0);
            for (let k = 0; k <= 10; k++)
              ctx.lineTo(60 + k * 14 + (r() - 0.5) * 10, 40 + r() * 190);
            ctx.lineTo(200, 0);
            ctx.fill();
            ctx.strokeStyle = "rgba(70,50,30,0.6)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(55, 0);
            ctx.lineTo(62, 90);
            ctx.stroke();
          });
          // 3: blood splatter & drag
          cell(3, () => {
            ctx.fillStyle = "rgba(80,10,8,0.9)";
            ctx.beginPath();
            ctx.ellipse(128, 128, 60, 40, 0.3, 0, TAU);
            ctx.fill();
            for (let k = 0; k < 30; k++) {
              const a = r() * TAU,
                d = 50 + r() * 70;
              ctx.beginPath();
              ctx.arc(
                128 + Math.cos(a) * d,
                128 + Math.sin(a) * d * 0.7,
                2 + r() * 6,
                0,
                TAU,
              );
              ctx.fill();
            }
          });
          // 4: scorch (ray / arc blast)
          cell(4, () => {
            const g = ctx.createRadialGradient(128, 128, 5, 128, 128, 120);
            g.addColorStop(0, "rgba(10,8,6,0.95)");
            g.addColorStop(0.5, "rgba(30,22,14,0.6)");
            g.addColorStop(1, "rgba(30,22,14,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            for (let k = 0; k < 16; k++) {
              const a = (k / 16) * TAU,
                d = 70 + r() * 55;
              ctx.lineTo(128 + Math.cos(a) * d, 128 + Math.sin(a) * d);
            }
            ctx.fill();
          });
          // 5: blood trail (footprints / drips in a line)
          cell(5, () => {
            ctx.fillStyle = "rgba(80,10,8,0.85)";
            for (let k = 0; k < 14; k++) {
              ctx.beginPath();
              ctx.ellipse(
                128 + Math.sin(k * 0.7) * 20,
                10 + k * 17,
                8 + r() * 6,
                5 + r() * 4,
                r(),
                0,
                TAU,
              );
              ctx.fill();
            }
          });
          // 6: painted raider arrow
          cell(6, () => {
            ctx.strokeStyle = "rgba(200,40,30,0.9)";
            ctx.lineWidth = 16;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(30, 128);
            ctx.lineTo(210, 128);
            ctx.moveTo(160, 80);
            ctx.lineTo(215, 128);
            ctx.lineTo(160, 176);
            ctx.stroke();
          });
          // 7: grime / soot patch
          cell(7, () => {
            for (let k = 0; k < 40; k++) {
              ctx.fillStyle = "rgba(30,24,16," + r() * 0.15 + ")";
              ctx.beginPath();
              ctx.ellipse(
                128 + (r() - 0.5) * 140,
                128 + (r() - 0.5) * 140,
                20 + r() * 40,
                10 + r() * 30,
                r() * 3,
                0,
                TAU,
              );
              ctx.fill();
            }
          });
        },
        { clamp: true },
      ),
      { transparent: true, rough: 0.95, noShadow: true },
    );
  };
  /** Decal quad: kind 0..7 (see PF.decalKey). floor: lies on the floor (y = floor height). */
  PF.decal = function (b, kind, x, y, z, w, h, ry, opts) {
    opts = opts || {};
    const u0 = (kind % 4) * 0.25,
      v0 = kind < 4 ? 0.5 : 0;
    b.quad(PF.decalKey(), x, y + (opts.floor ? 0.012 : 0), z, w, h, {
      ry: ry || 0,
      rx: opts.floor ? -HP : 0,
      rz: opts.rz || 0,
      uvRect: [u0, v0, u0 + 0.25, v0 + 0.5],
      noAO: true,
      grime: 0,
    });
  };
  /** Engraved memorial plaques (8 names) for the undercroft loculi. */
  PF.plaqueKey = function () {
    return PF.texMat(
      "loculi",
      PF.canvasTex(
        "pws_loculi",
        1024,
        256,
        (ctx) => {
          const r = PF.rng("loculi");
          const names = [
            "JOHN WATTS",
            "ELIZ. RUTGERS",
            "CAPT. J. LEAKE",
            "MARY BAYARD",
            "THOS. BARCLAY",
            "ANNA VAN HORNE",
            "REV. S. AUCHMUTY",
            "W. LIVINGSTON",
          ];
          for (let i = 0; i < 8; i++) {
            const x = (i % 4) * 256,
              y = Math.floor(i / 4) * 128;
            ctx.fillStyle = ["#d8d2c4", "#cfc8b8", "#e0dace", "#c8c0b0"][i % 4];
            ctx.fillRect(x, y, 256, 128);
            ctx.strokeStyle = "rgba(60,54,44,0.6)";
            ctx.lineWidth = 3;
            ctx.strokeRect(x + 10, y + 10, 236, 108);
            ctx.fillStyle = "rgba(40,34,26,0.8)";
            ctx.textAlign = "center";
            ctx.font = "bold 20px Georgia, serif";
            ctx.fillText(names[i], x + 128, y + 52);
            ctx.font = "14px Georgia, serif";
            ctx.fillText(
              "OB. " + (1768 + i * 9) + "  ·  AET. " + (34 + i * 7),
              x + 128,
              y + 78,
            );
            ctx.fillText("R. I. P.", x + 128, y + 100);
            for (let k = 0; k < 40; k++) {
              ctx.fillStyle = "rgba(40,30,20," + r() * 0.2 + ")";
              ctx.beginPath();
              ctx.arc(x + r() * 256, y + r() * 128, 1 + r() * 7, 0, TAU);
              ctx.fill();
            }
            if (i % 3 === 1) {
              ctx.strokeStyle = "rgba(30,24,18,0.8)";
              ctx.lineWidth = 2;
              ctx.beginPath();
              let cx = x + 40 + r() * 60,
                cy = y;
              ctx.moveTo(cx, cy);
              for (let k = 0; k < 6; k++) {
                cx += 20 + r() * 20;
                cy += 10 + r() * 14;
                ctx.lineTo(cx, cy);
              }
              ctx.stroke();
            } // cracked slab
          }
        },
        { clamp: true },
      ),
      { rough: 0.6 },
    );
  };
  /** Soft additive light shaft (skylights, holes): a tapered open cone with a vertical fade. One draw call. */
  let shaftMat = null;
  PF.lightShaft = function (parent, x, y, z, rTop, rBot, h, opts) {
    opts = opts || {};
    if (!shaftMat) {
      const tex = PF.canvasTex(
        "pws_shaft",
        16,
        128,
        (ctx, w, hh) => {
          const g = ctx.createLinearGradient(0, 0, 0, hh);
          g.addColorStop(0, "rgba(255,255,255,0.0)");
          g.addColorStop(0.15, "rgba(255,255,255,0.9)");
          g.addColorStop(1, "rgba(255,255,255,0.0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, hh);
        },
        { clamp: true },
      );
      shaftMat = new THREE.MeshBasicMaterial({
        color: opts.color || 0xfff0d0,
        map: tex,
        transparent: true,
        opacity: opts.opacity || 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: true,
      });
      shaftMat.userData.shared = true;
    }
    const g = new THREE.CylinderGeometry(rTop, rBot, h, 20, 1, true);
    if (opts.sz) g.scale(1, 1, opts.sz);
    const m = new THREE.Mesh(g, shaftMat);
    m.position.set(x, y - h / 2, z);
    if (opts.rz) m.rotation.z = opts.rz;
    if (opts.rx) m.rotation.x = opts.rx;
    m.castShadow = false;
    m.receiveShadow = false;
    m.renderOrder = 5;
    m.name = "pws_lightshaft";
    (parent || G.scene).add(m);
    return m;
  };

  // -------------------------------------------------------------------
  // TRAPS
  // -------------------------------------------------------------------
  PF.trapList = PF.trapList || [];
  const trapState = (t) => PF.flag("trap_" + t.id) || "armed";
  const trapArmed = (t) =>
    trapState(t) === "armed" && !(t.offFlag && PF.flag(t.offFlag));
  const segDist2 = (p, a, c) => {
    const dx = c.x - a.x,
      dz = c.z - a.z,
      L = dx * dx + dz * dz || 1e-6;
    const t = Math.max(
      0,
      Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / L),
    );
    const qx = a.x + dx * t - p.x,
      qz = a.z + dz * t - p.z;
    return qx * qx + qz * qz;
  };
  /**
   * def: {id, kind: 'tripwire'|'beartrap'|'laser'|'chime', parent (cell root), a, c (world endpoints, line kinds),
   * pos (point kinds), floorY, bouquet (world pos of the grenades), dmg, offFlag, onTrip(), label}
   * Builds its own small merged meshes (hidden once tripped/disarmed) and registers the disarm interactable.
   */
  PF.trap = function (def) {
    const t = Object.assign({ dmg: 40, fuse: -1 }, def);
    const mk = (name) => {
      const mb = PF.batch("trap_" + t.id + name);
      mb.ground = t.floorY;
      mb.aoH = 1;
      mb.setLights([], 0xb0a898, 0.45);
      return mb;
    };
    const armedB = mk("a"),
      sprungB = t.kind === "beartrap" ? mk("s") : null;
    const a = t.a,
      c = t.c;
    if (t.kind === "tripwire" || t.kind === "chime") {
      armedB.rod("steel", a, c, 0.005, 3, { noAO: true, grime: 0 });
      for (const p of [a, c])
        armedB.cyl(
          "iron",
          p.x,
          t.floorY,
          p.z,
          0.015,
          0.02,
          p.y - t.floorY + 0.08,
          4,
          { hSeg: 1 },
        ); // stakes
      if (t.kind === "tripwire") {
        const q = t.bouquet || a;
        for (let k = 0; k < 3; k++) {
          // grenade bouquet: three frags wired to the stake
          const gx = q.x + Math.cos(k * 2.1) * 0.07,
            gz = q.z + Math.sin(k * 2.1) * 0.07;
          armedB.sphere("army", gx, q.y + 0.02, gz, 0.045, {
            ws: 7,
            hs: 5,
            sy: 1.25,
            noAO: true,
          });
          armedB.cyl("iron", gx, q.y + 0.07, gz, 0.012, 0.012, 0.03, 5, {
            hSeg: 1,
          });
        }
        armedB.cyl("rope", q.x, q.y - 0.01, q.z, 0.08, 0.08, 0.05, 8, {
          hSeg: 1,
          open: true,
        });
      } else {
        const n = 7;
        for (let k = 1; k < n; k++) {
          // tin cans strung along the wire
          const p = a.clone().lerp(c, k / n);
          p.y -= 0.12 + Math.sin((k / n) * PI) * 0.05;
          armedB.cyl(
            k % 2 ? "rust" : "chrome",
            p.x,
            p.y,
            p.z,
            0.035,
            0.035,
            0.1,
            7,
            { hSeg: 1, open: true, rz: ((k % 3) - 1) * 0.2 },
          );
          armedB.rod(
            "steel",
            V3(p.x, p.y + 0.1, p.z),
            V3(p.x, p.y + 0.14, p.z),
            0.003,
            3,
            { noAO: true },
          );
        }
      }
    } else if (t.kind === "laser") {
      for (const p of [a, c]) {
        armedB.box("vault_dk", p.x, p.y - 0.12, p.z, 0.14, 0.24, 0.14, {
          seg: false,
        });
      }
      armedB.rod("laser", a, c, 0.008, 4, { noAO: true, grime: 0 });
    } else if (t.kind === "beartrap") {
      const p = t.pos;
      const jaws = (bb, open) => {
        bb.cyl("rust", p.x, t.floorY + 0.005, p.z, 0.2, 0.2, 0.02, 12, {
          hSeg: 1,
          grime: 0.5,
        });
        bb.cyl("rust", p.x, t.floorY + 0.02, p.z, 0.04, 0.04, 0.03, 8, {
          hSeg: 1,
        });
        for (const sg of [-1, 1]) {
          const g = new THREE.TorusGeometry(0.2, 0.012, 4, 12, PI);
          bb.add("rust", g, {
            m: PF.m4(
              p.x,
              t.floorY + (open ? 0.02 : 0.12),
              p.z + (open ? sg * 0.02 : 0),
              0,
              open ? sg * HP * 0.98 : sg * 0.25,
              0,
            ),
          });
          for (let k = 1; k < 8; k++) {
            const aa = (k / 8) * PI,
              lx = Math.cos(aa) * 0.2;
            const ly = open ? 0.02 : 0.12 + Math.sin(aa) * 0.2 * Math.cos(0.25);
            const lz = open
              ? sg * (0.02 + Math.sin(aa) * 0.2)
              : sg * Math.sin(aa) * 0.2 * Math.sin(0.25);
            bb.cyl(
              "rust",
              p.x + lx,
              t.floorY + ly,
              p.z + lz,
              0.001,
              0.012,
              0.05,
              3,
              { hSeg: 1, rx: open ? -sg * HP : -sg * 0.3 },
            );
          }
        }
        bb.rod(
          "iron",
          V3(p.x + 0.2, t.floorY + 0.01, p.z),
          V3(p.x + 0.55, t.floorY + 0.01, p.z + 0.2),
          0.006,
          3,
          { noAO: true },
        ); // chain
      };
      jaws(armedB, true);
      jaws(sprungB, false);
    }
    const gA = new THREE.Group();
    gA.name = "pws_trap_" + t.id;
    armedB.build(gA, { noLOD: true, castShadow: false });
    (t.parent || G.scene).add(gA);
    t.gArmed = gA;
    if (sprungB) {
      const gS = new THREE.Group();
      sprungB.build(gS, { noLOD: true, castShadow: false });
      (t.parent || G.scene).add(gS);
      t.gSprung = gS;
    }
    t.mid = t.pos ? t.pos.clone() : a.clone().lerp(c, 0.5);
    // disarm / disable
    const label =
      t.label ||
      {
        tripwire: "Tripwire",
        beartrap: "Bear Trap",
        laser: "Photoelectric Tripwire",
        chime: "Can Alarm",
      }[t.kind];
    PF.use({
      pos: t.mid.clone().setY(Math.max(t.mid.y, t.floorY + 0.3)),
      radius: 0.6,
      range: 2.4,
      priority: 2,
      label,
      verb: t.kind === "laser" ? "Disable" : "Disarm",
      enabled: () => trapArmed(t),
      onInteract() {
        if (!trapArmed(t)) return;
        if (t.kind === "laser") {
          const sci = PF.live("rpg") ? PF.skill("electronics") : 100;
          if (sci < (t.skill || 35)) {
            G.notify(
              "The emitter's housing is sealed with a tamper circuit. (Electronics " +
                (t.skill || 35) +
                ")",
            );
            PF.sfx("ui_error");
            return;
          }
        }
        PF.setFlag("trap_" + t.id, "disarmed");
        PF.sfx("ui_select", t.mid);
        if (t.kind === "tripwire") {
          PF.inv.add("frag_grenade", 3);
          G.notify("Tripwire disarmed. You pocket the grenade bouquet.");
        } else if (t.kind === "beartrap")
          G.notify(
            "You spring the bear trap with a stick. It bites the stick in half.",
          );
        else if (t.kind === "laser")
          G.notify("Emitter bypassed. The beam flickers and dies.");
        else G.notify("You unhook the cans without a sound.");
        PF.xp(t.kind === "laser" ? 20 : 10, "Trap disarmed");
      },
    });
    PF.trapList.push(t);
    return t;
  };
  function tripTrap(t, p) {
    PF.setFlag("trap_" + t.id, "tripped");
    if (t.kind === "tripwire") {
      PF.sfx("empty_click", t.bouquet || t.a);
      G.notify("*click*", { duration: 1.2 });
      t.fuse = 0.85;
    } else if (t.kind === "beartrap") {
      PF.sfx("melee_hit", t.pos);
      try {
        G.player.damage(t.dmg || 25, { type: "trap" });
      } catch (e) {
        /* optional */
      }
      G.notify("SNAP! A bear trap bites into your leg.");
    } else if (t.kind === "laser") {
      PF.sfx("alarm", t.mid);
      try {
        G.player.damage(t.dmg || 12, { type: "energy" });
      } catch (e) {
        /* optional */
      }
      G.notify("INTRUDER DETECTED. Security response dispatched.");
      if (t.onTrip) PF.safe("trap:onTrip", t.onTrip);
    } else {
      PF.sfx("ricochet", t.mid);
      G.notify("Tin cans clatter along the wire!");
      if (t.onTrip) PF.safe("trap:onTrip", t.onTrip);
    }
    void p;
  }
  PF.updaters.push(function (dt) {
    const p = G.player && G.player.pos;
    for (const t of PF.trapList) {
      const armed = trapArmed(t);
      if (t.gArmed) t.gArmed.visible = armed;
      if (t.gSprung) t.gSprung.visible = trapState(t) === "tripped";
      if (t.fuse > 0) {
        t.fuse -= dt;
        if (t.fuse <= 0) {
          const q = t.bouquet || t.a;
          PF.safe("trap:boom", () => {
            if (PF.live("combat") && G.combat.explode)
              G.combat.explode(q.clone(), 3.4, t.dmg, {
                source: "trap",
                kind: "normal",
              });
            else {
              G.player.damage(t.dmg, { type: "explosive" });
              try {
                G.fx.explosion(q.clone(), 3);
              } catch (e) {
                /* optional */
              }
            }
          });
        }
      }
      if (!armed || !p) continue;
      if (Math.abs(p.x - t.mid.x) > 12 || Math.abs(p.z - t.mid.z) > 12)
        continue;
      if (Math.abs(p.y - t.floorY) > (t.kind === "laser" ? 1.4 : 0.9)) continue;
      const hit =
        t.kind === "beartrap"
          ? (p.x - t.pos.x) ** 2 + (p.z - t.pos.z) ** 2 < 0.45 * 0.45
          : segDist2(p, t.a, t.c) <
            (t.kind === "laser" ? 0.3 * 0.3 : 0.32 * 0.32);
      if (hit) tripTrap(t, p);
    }
  });
  PF.onReset.push(() => {
    for (const t of PF.trapList) t.fuse = -1;
  });
})();
