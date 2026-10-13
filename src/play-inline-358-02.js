// play-inline-358 02 — ctx
// Lines 22-361 of readable/play-inline-358.pretty.js (statement-aligned).
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
