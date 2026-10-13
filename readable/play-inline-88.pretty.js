/* src/map/42_decay.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 42 DECAY (22 years after the bombs)
 * Everything that makes the generic city fabric read as a bombed-out ruin
 * rather than a clean procedural grid:
 *   - a transparent "grime" atlas (rain streaks, fire-soot plumes, base
 *     grime & splash, water stains, rust runs, dead vines, wall cracks,
 *     blast scorch, bullet sprays, damp moss, peeled plaster, soot bands,
 *     hanging vines, drain leaks, charred patches, settled dust)
 *   - per-façade weathering overlays driven by the wall log the building
 *     builders record (M.wallLog): streaks under every cornice, soot above
 *     burnt-out windows (fire-gutted buildings get many), grime & vines at
 *     street level, random stains / cracks / bullet sprays
 *   - soot bands above burnt-out storefronts
 *   - debris drifts at the foot of most buildings (bigger at ruins)
 *   - curb-side clutter every 8–18 m along every street: trash heaps,
 *     rubble drifts, leaf/dirt drifts; dead-grass tufts in the gutters and
 *     sidewalk cracks; standing water in potholes
 * All overlays live in the 'detail' / 'fine' layers (LOD 300 / 150 m) and
 * are merged per chunk like everything else (one extra draw call per
 * chunk for the grime material, one for the weeds).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  // -------------------------------------------------------------------
  // Grime atlas (4×4 cells, RGBA, drawn once)
  // -------------------------------------------------------------------
  const GR = {
    STREAKS: 0,
    SOOT: 1,
    BASE: 2,
    STAIN: 3,
    RUST: 4,
    VINES: 5,
    CRACKS: 6,
    SCORCH: 7,
    BULLETS: 8,
    MOSS: 9,
    PEEL: 10,
    SOOTBAND: 11,
    HANGVINES: 12,
    LEAK: 13,
    CHAR: 14,
    DUST: 15,
  };
  M.GR = GR;
  M.defineAtlas("grime", function () {
    const S = 1024,
      C = 256,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("grime-atlas");
    ctx.clearRect(0, 0, S, S);
    const cell = (i) => [(i % 4) * C, Math.floor(i / 4) * C];
    const clip = (i, fn) => {
      const [x, y] = cell(i);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, y + 2, C - 4, C - 4);
      ctx.clip();
      fn(x, y);
      ctx.restore();
    };
    const rgba = (c, a) =>
      "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a.toFixed(3) + ")";
    // vertical streak helper: gradient from y0 (alpha a0) to y0+len (0)
    function streak(x, y0, w, len, col, a0, wobble) {
      const g = ctx.createLinearGradient(0, y0, 0, y0 + len);
      g.addColorStop(0, rgba(col, a0));
      g.addColorStop(0.6, rgba(col, a0 * 0.45));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      const n = 8;
      let xx = x;
      for (let k = 1; k <= n; k++) {
        xx += (r() - 0.5) * (wobble || 1.5);
        ctx.lineTo(xx + w * (1 - (k / n) * 0.6), y0 + (len * k) / n);
      }
      for (let k = n; k >= 0; k--)
        ctx.lineTo(
          x + (r() - 0.5) * 1.2 - (k === 0 ? 0 : 0),
          y0 + (len * k) / n,
        );
      ctx.closePath();
      ctx.fill();
    }
    function blob(cx, cy, rds, col, a) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rds);
      g.addColorStop(0, rgba(col, a));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.fillRect(cx - rds, cy - rds, rds * 2, rds * 2);
    }
    const SOOT = [14, 12, 10],
      DIRT = [34, 28, 20],
      BROWN = [62, 44, 26],
      RUST = [118, 58, 24];
    // 0 rain streaks hanging from the top edge (under cornices / sills)
    clip(GR.STREAKS, (x, y) => {
      const g = ctx.createLinearGradient(0, y, 0, y + 34);
      g.addColorStop(0, rgba(DIRT, 0.55));
      g.addColorStop(1, rgba(DIRT, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, 34);
      for (let i = 0; i < 46; i++)
        streak(
          x + r() * C,
          y + r() * 12,
          2 + r() * 11,
          50 + r() * 200,
          r() < 0.8 ? DIRT : BROWN,
          0.25 + r() * 0.4,
          2,
        );
    });
    // 1 fire-soot plume rising from a window top (bottom-centre) and spreading upward
    clip(GR.SOOT, (x, y) => {
      for (let i = 0; i < 70; i++) {
        const t = i / 70,
          cy = y + C - 18 - t * (C - 40) + (r() - 0.5) * 10;
        const spread = 26 + t * 78,
          cx =
            x + C / 2 + (r() - 0.5) * spread * 0.9 + Math.sin(t * 5 + r()) * 10;
        blob(
          cx,
          cy,
          14 + t * 46 + r() * 16,
          SOOT,
          (0.22 - t * 0.16) * (0.7 + r() * 0.6),
        );
      }
      // hard black lip right above the opening
      ctx.fillStyle = rgba(SOOT, 0.8);
      ctx.beginPath();
      ctx.ellipse(x + C / 2, y + C - 14, 52, 14, 0, 0, 7);
      ctx.fill();
      for (let i = 0; i < 9; i++)
        streak(
          x + C / 2 + (r() - 0.5) * 90,
          y + C - 30 - r() * 40,
          3 + r() * 6,
          -60 - r() * 90,
          SOOT,
          0.25,
          3,
        );
    });
    // 2 base grime: dark at the bottom, splash specks, upward-fading drips
    clip(GR.BASE, (x, y) => {
      const g = ctx.createLinearGradient(0, y + C, 0, y);
      g.addColorStop(0, rgba(DIRT, 0.82));
      g.addColorStop(0.35, rgba(DIRT, 0.4));
      g.addColorStop(1, rgba(DIRT, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = rgba(r() < 0.7 ? DIRT : BROWN, 0.2 + r() * 0.5);
        const py = y + C - Math.pow(r(), 2.2) * C * 0.6;
        ctx.fillRect(x + r() * C, py, 1 + r() * 4, 1 + r() * 4);
      }
      for (let i = 0; i < 26; i++)
        streak(
          x + r() * C,
          y + C * (0.25 + r() * 0.4),
          2 + r() * 6,
          C * 0.6,
          DIRT,
          0.25,
          1,
        );
    });
    // 3 water stain / efflorescence with tide lines
    clip(GR.STAIN, (x, y) => {
      for (let k = 0; k < 5; k++) {
        const cx = x + C / 2 + (r() - 0.5) * 40,
          cy = y + C / 2 + (r() - 0.5) * 40,
          rds = 40 + k * 16 + r() * 10;
        blob(cx, cy, rds, BROWN, 0.18);
        ctx.strokeStyle = rgba(BROWN, 0.35);
        ctx.lineWidth = 2 + r() * 2;
        ctx.beginPath();
        for (let a = 0; a <= 6.3; a += 0.25) {
          const rr = rds * (0.85 + r() * 0.2);
          ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.2);
        }
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(220,214,196,0.18)";
      for (let i = 0; i < 90; i++)
        ctx.fillRect(
          x + 40 + r() * 170,
          y + 40 + r() * 170,
          2 + r() * 6,
          1 + r() * 3,
        );
    });
    // 4 rust runs (under iron: fire escapes, railings, bolts)
    clip(GR.RUST, (x, y) => {
      for (let i = 0; i < 34; i++)
        streak(
          x + 10 + r() * (C - 20),
          y + r() * 40,
          2 + r() * 7,
          60 + r() * 180,
          r() < 0.7 ? RUST : BROWN,
          0.35 + r() * 0.35,
          1.5,
        );
    });
    // 5 dead vines climbing from the bottom
    function vine(x0, y0, dir, len, w, col) {
      let px = x0,
        py = y0,
        a = dir;
      ctx.strokeStyle = col;
      ctx.lineCap = "round";
      for (let s = 0; s < len; s++) {
        const nx = px + Math.cos(a) * 7,
          ny = py + Math.sin(a) * 7;
        ctx.lineWidth = Math.max(0.6, w * (1 - s / len));
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        if (r() < 0.12 && s > 2 && len - s > 4)
          vine(
            nx,
            ny,
            a + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.6),
            Math.floor((len - s) * 0.6),
            w * 0.6,
            col,
          );
        if (r() < 0.5) {
          ctx.fillStyle =
            r() < 0.5 ? "rgba(60,48,30,0.8)" : "rgba(44,40,26,0.8)";
          ctx.beginPath();
          ctx.ellipse(
            nx + (r() - 0.5) * 6,
            ny,
            2 + r() * 2.5,
            1.2 + r(),
            r() * 3,
            0,
            7,
          );
          ctx.fill();
        }
        px = nx;
        py = ny;
        a += (r() - 0.5) * 0.5;
      }
    }
    clip(GR.VINES, (x, y) => {
      for (let i = 0; i < 7; i++)
        vine(
          x + 20 + r() * (C - 40),
          y + C - 3,
          -Math.PI / 2 + (r() - 0.5) * 0.5,
          22 + ((r() * 12) | 0),
          4.5,
          "rgba(46,36,24,0.92)",
        );
    });
    // 6 structural wall cracks
    clip(GR.CRACKS, (x, y) => {
      ctx.lineCap = "round";
      for (let k = 0; k < 4; k++) {
        let px = x + 30 + r() * (C - 60),
          py = y + 6;
        ctx.strokeStyle = "rgba(10,9,8,0.85)";
        let lw = 4;
        ctx.beginPath();
        ctx.moveTo(px, py);
        while (py < y + C - 8) {
          px += (r() - 0.5) * 26;
          py += 8 + r() * 14;
          ctx.lineTo(M.clamp(px, x + 6, x + C - 6), py);
        }
        ctx.lineWidth = lw;
        ctx.stroke();
        lw *= 0.5;
      }
      ctx.fillStyle = "rgba(200,190,170,0.12)";
      for (let i = 0; i < 40; i++)
        ctx.fillRect(x + r() * C, y + r() * C, 2 + r() * 5, 2 + r() * 5);
    });
    // 7 blast scorch (radial, ragged)
    clip(GR.SCORCH, (x, y) => {
      blob(x + C / 2, y + C / 2, C / 2 - 6, SOOT, 0.85);
      for (let i = 0; i < 40; i++) {
        const a = r() * 7,
          d = 30 + r() * 80;
        blob(
          x + C / 2 + Math.cos(a) * d,
          y + C / 2 + Math.sin(a) * d,
          10 + r() * 24,
          SOOT,
          0.35,
        );
      }
      ctx.fillStyle = "rgba(0,0,0,0.9)";
      ctx.beginPath();
      for (let a = 0; a < 6.3; a += 0.3) {
        const rr = 26 + r() * 22;
        ctx.lineTo(x + C / 2 + Math.cos(a) * rr, y + C / 2 + Math.sin(a) * rr);
      }
      ctx.fill();
    });
    // 8 bullet spray
    clip(GR.BULLETS, (x, y) => {
      for (let i = 0; i < 38; i++) {
        const px = x + C / 2 + (r() - 0.5) * 200,
          py = y + C / 2 + (r() - 0.5) * 120,
          rr = 3 + r() * 5;
        ctx.fillStyle = "rgba(210,200,180,0.45)";
        ctx.beginPath();
        ctx.arc(px, py, rr * 1.9, 0, 7);
        ctx.fill();
        ctx.fillStyle = "rgba(12,10,8,0.95)";
        ctx.beginPath();
        ctx.arc(px, py, rr, 0, 7);
        ctx.fill();
      }
    });
    // 9 damp moss / algae creeping up from the pavement
    clip(GR.MOSS, (x, y) => {
      for (let i = 0; i < 60; i++)
        blob(
          x + r() * C,
          y + C - Math.pow(r(), 1.8) * C * 0.7,
          12 + r() * 30,
          r() < 0.5 ? [40, 48, 24] : [28, 32, 18],
          0.3,
        );
      const g = ctx.createLinearGradient(0, y + C, 0, y + C * 0.55);
      g.addColorStop(0, "rgba(30,36,20,0.6)");
      g.addColorStop(1, "rgba(30,36,20,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
    });
    // 10 peeled plaster / spalled stucco showing brick & lath
    clip(GR.PEEL, (x, y) => {
      for (let k = 0; k < 3; k++) {
        const cx = x + 50 + r() * 150,
          cy = y + 50 + r() * 150;
        ctx.fillStyle = "rgba(96,52,36,0.85)";
        ctx.beginPath();
        for (let a = 0; a < 6.3; a += 0.35) {
          const rr = 26 + r() * 34;
          ctx.lineTo(cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(40,24,16,0.5)";
        ctx.lineWidth = 1.2;
        for (let yy = cy - 50; yy < cy + 50; yy += 9) {
          ctx.beginPath();
          ctx.moveTo(cx - 55, yy);
          ctx.lineTo(cx + 55, yy);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(20,16,12,0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    // 11 soot band (smoke that poured out of a burnt storefront and blackened the wall above)
    clip(GR.SOOTBAND, (x, y) => {
      const g = ctx.createLinearGradient(0, y + C, 0, y);
      g.addColorStop(0, rgba(SOOT, 0.85));
      g.addColorStop(0.45, rgba(SOOT, 0.45));
      g.addColorStop(1, rgba(SOOT, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
      for (let i = 0; i < 14; i++) {
        const cx = x + r() * C;
        for (let k = 0; k < 8; k++)
          blob(
            cx + (r() - 0.5) * 30,
            y + C - k * 26 - r() * 10,
            20 + k * 5,
            SOOT,
            0.12,
          );
      }
    });
    // 12 vines hanging from the top edge
    clip(GR.HANGVINES, (x, y) => {
      for (let i = 0; i < 8; i++)
        vine(
          x + 16 + r() * (C - 32),
          y + 3,
          Math.PI / 2 + (r() - 0.5) * 0.4,
          16 + ((r() * 16) | 0),
          3.5,
          "rgba(50,40,26,0.92)",
        );
    });
    // 13 drain leak: wet dark column from a point near the top
    clip(GR.LEAK, (x, y) => {
      blob(x + C / 2, y + 30, 26, DIRT, 0.6);
      for (let i = 0; i < 12; i++)
        streak(
          x + C / 2 - 20 + r() * 40,
          y + 24,
          4 + r() * 10,
          C - 40,
          r() < 0.5 ? DIRT : [30, 36, 26],
          0.4,
          1,
        );
    });
    // 14 charred patch (heavy fire damage, ragged black with ashy edges)
    clip(GR.CHAR, (x, y) => {
      ctx.fillStyle = rgba(SOOT, 0.92);
      ctx.beginPath();
      for (let a = 0; a < 6.3; a += 0.18) {
        const rr = (C / 2 - 30) * (0.6 + r() * 0.4);
        ctx.lineTo(x + C / 2 + Math.cos(a) * rr, y + C / 2 + Math.sin(a) * rr);
      }
      ctx.fill();
      for (let i = 0; i < 30; i++) {
        const a = r() * 7,
          d = 70 + r() * 40;
        blob(
          x + C / 2 + Math.cos(a) * d,
          y + C / 2 + Math.sin(a) * d,
          14 + r() * 20,
          SOOT,
          0.4,
        );
      }
      ctx.fillStyle = "rgba(150,140,120,0.3)";
      for (let i = 0; i < 60; i++)
        ctx.fillRect(
          x + 40 + r() * 170,
          y + 40 + r() * 170,
          1 + r() * 3,
          1 + r() * 3,
        );
    });
    // 15 settled dust / ash band (lighter)
    clip(GR.DUST, (x, y) => {
      const g = ctx.createLinearGradient(0, y + C, 0, y);
      g.addColorStop(0, "rgba(150,140,118,0.55)");
      g.addColorStop(0.5, "rgba(150,140,118,0.2)");
      g.addColorStop(1, "rgba(150,140,118,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, C, C);
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle =
          "rgba(170,160,138," + (0.1 + r() * 0.3).toFixed(2) + ")";
        ctx.fillRect(
          x + r() * C,
          y + C - Math.pow(r(), 2) * C * 0.7,
          1 + r() * 3,
          1 + r() * 3,
        );
      }
    });
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, transparent: true, roughness: 0.95 };
  });
  M.grimeUV = (i) => M.cellUV(i, 4, 4);

  /**
   * Grime overlay on a wall line a→b (outward normal n), spanning t0..t1 (m along a→b) and y0..y1.
   * The overlay floats 3–5 cm off the wall (plus the transparent material's polygon offset).
   */
  function overlay(
    ax,
    az,
    bx,
    bz,
    nx,
    nz,
    t0,
    t1,
    y0,
    y1,
    cellI,
    off,
    c,
    flip,
  ) {
    const len = Math.hypot(bx - ax, bz - az) || 1,
      ux = (bx - ax) / len,
      uz = (bz - az) / len;
    const o = off || 0.04;
    const P = (t, y) => [ax + ux * t + nx * o, y, az + uz * t + nz * o];
    const uv = M.grimeUV(cellI);
    // a→b runs right-to-left as seen from outside (see M.wall) → mirror u so drips read the same everywhere
    const u0 = flip ? uv[0] : uv[2],
      u1 = flip ? uv[2] : uv[0];
    const cx = ax + (ux * (t0 + t1)) / 2,
      cz = az + (uz * (t0 + t1)) / 2;
    M.quad(
      M.buf("my/grime", cx, cz, "detail"),
      P(t0, y0),
      P(t1, y0),
      P(t1, y1),
      P(t0, y1),
      [nx, 0, nz],
      [u0, uv[1], u1, uv[1], u1, uv[3], u0, uv[3]],
      c || M.WHITE,
    );
  }
  M.grimeOverlay = overlay;

  // -------------------------------------------------------------------
  // Façade weathering from the builders' wall log
  // -------------------------------------------------------------------
  function weatherWall(w, r) {
    const len = Math.hypot(w.bx - w.ax, w.bz - w.az);
    if (len < 2.5) return;
    const nx = w.nx,
      nz = w.nz;
    const H = w.y1 - w.y0;
    const lot = w.lot || {};
    const burnt = !!lot.burnt,
      ruined = !!lot.ruined;
    const dirt = lot.dirt === undefined ? 1 : lot.dirt;
    const O = (t0, t1, y0, y1, cell, off, c) =>
      overlay(
        w.ax,
        w.az,
        w.bx,
        w.bz,
        nx,
        nz,
        M.clamp(t0, 0, len),
        M.clamp(t1, 0, len),
        y0,
        y1,
        cell,
        off,
        c,
        r() < 0.5,
      );
    // --- rain streaks hanging from the top edge (cornice / parapet / tier top) ---
    if (w.top !== false && H > 3) {
      let t = r.range(0, 2);
      while (t < len - 1.5) {
        const sw = r.range(2.5, 6.5);
        if (r() < 0.9 * dirt) {
          const sh = Math.min(H - 0.2, r.range(8, 26) * (0.6 + dirt * 0.5));
          O(
            t,
            t + sw,
            w.y1 - sh,
            w.y1 - 0.05,
            r() < 0.12 ? GR.RUST : GR.STREAKS,
            0.045,
          );
        }
        t += sw + r.range(0.2, 2.5);
      }
      // tall walls: a second tier of run-off below the mid-height belt courses / window sills
      if (H > 26) {
        const ym = w.y0 + H * r.range(0.35, 0.6);
        for (let t2 = r.range(0, 3); t2 < len - 2; t2 += r.range(4, 9))
          if (r() < 0.6 * dirt) {
            const sw = r.range(2, 5);
            O(t2, t2 + sw, ym - r.range(6, 14), ym, GR.STREAKS, 0.043);
          }
      }
      if (r() < 0.12 * dirt && H > 8) {
        const t0 = r.range(0, Math.max(0.1, len - 5));
        O(
          t0,
          t0 + r.range(3, 5),
          w.y1 - Math.min(H, r.range(5, 12)),
          w.y1 - 0.1,
          GR.HANGVINES,
          0.05,
        );
      }
    }
    // --- fire soot above burnt-out windows ---
    if (H > 6.5 && w.f !== "b") {
      const floorH = M.FACADE.floorH,
        bayW = M.FACADE.bayW;
      const n = burnt
        ? r.int(3, 7)
        : ruined
          ? r.int(1, 4)
          : r() < 0.55
            ? r.int(1, 2)
            : 0;
      for (let i = 0; i < n; i++) {
        const nf = Math.max(1, Math.floor((H - 3) / floorH));
        const fy = w.y0 + (r.int(0, nf - 1) + 0.78) * floorH; // top of a window opening
        const bays = Math.max(1, Math.floor(len / bayW));
        const tc = (r.int(0, bays - 1) + 0.5) * (len / bays);
        const pw = r.range(3, 4.8),
          ph = Math.min(w.y1 - fy + 0.8, r.range(4.5, 11) * (burnt ? 1.3 : 1));
        if (ph < 2) continue;
        O(tc - pw / 2, tc + pw / 2, fy - 0.8, fy - 0.8 + ph, GR.SOOT, 0.05);
      }
      if (burnt && r() < 0.6) {
        const tc = r.range(3, Math.max(3.1, len - 3)),
          s = r.range(5, 9),
          yc = w.y0 + r.range(3, Math.max(3.1, H - 3));
        O(tc - s / 2, tc + s / 2, yc - s * 0.4, yc + s * 0.5, GR.CHAR, 0.052);
      }
    }
    // --- street level: base grime, moss, vines, dust ---
    if (w.y0 < 2.2) {
      for (let t = 0; t < len - 0.5; t += 6) {
        const t1 = Math.min(len, t + 6);
        O(
          t,
          t1,
          w.y0,
          w.y0 + r.range(1.8, 3.6) * (0.7 + dirt * 0.4),
          r() < 0.25 ? GR.MOSS : r() < 0.15 ? GR.DUST : GR.BASE,
          0.035,
        );
      }
      if (r() < 0.22 * dirt) {
        const t0 = r.range(0, Math.max(0.1, len - 5));
        O(t0, t0 + r.range(3, 6), w.y0, w.y0 + r.range(4, 9), GR.VINES, 0.055);
      }
    } else if (w.y0 < 8 && w.f !== "b" && lot.shopSoot) {
      // wall right above a burnt-out storefront: a soot band licking up the façade
      for (let t = 0; t < len - 0.5; t += 7)
        if (r() < 0.8)
          O(
            t,
            Math.min(len, t + 7),
            w.y0 - 0.05,
            w.y0 + r.range(3, 6),
            GR.SOOTBAND,
            0.05,
          );
    }
    // --- sprinkles: stains, leaks, cracks, peels, bullet sprays, scorch ---
    const nS =
      Math.floor(((len * H) / 220) * dirt) +
      (ruined ? 2 : 0) +
      (r() < 0.5 ? 1 : 0);
    for (let i = 0; i < Math.min(nS, 7); i++) {
      const k = r();
      const cell =
        k < 0.25
          ? GR.STAIN
          : k < 0.4
            ? GR.LEAK
            : k < 0.55
              ? GR.CRACKS
              : k < 0.68
                ? GR.PEEL
                : k < 0.82
                  ? GR.BULLETS
                  : GR.SCORCH;
      const s =
        cell === GR.BULLETS
          ? r.range(1.6, 3.2)
          : cell === GR.LEAK
            ? r.range(1.5, 2.5)
            : r.range(2.5, 6);
      const hh = cell === GR.LEAK ? s * r.range(3, 5) : s * r.range(0.8, 1.3);
      const yl =
        cell === GR.BULLETS
          ? w.y0 + r.range(0.6, Math.min(H, 6))
          : w.y0 + r.range(0, Math.max(0.1, H - hh));
      const t0 = r.range(0, Math.max(0.1, len - s));
      if (yl + hh > w.y1) continue;
      O(t0, t0 + s, yl, yl + hh, cell, 0.05 + i * 0.003);
    }
  }

  // -------------------------------------------------------------------
  // Debris drifts & curb clutter
  // -------------------------------------------------------------------
  let moundGeo = null;
  function driftGeo() {
    if (moundGeo) return moundGeo;
    const g = new THREE.SphereGeometry(1, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    const p = g.attributes.position,
      r = M.rng("drift");
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const k = y > 0.02 ? 0.78 + r() * 0.4 : 1;
      p.setXYZ(i, p.getX(i) * k, y * (0.6 + r() * 0.6), p.getZ(i) * k);
    }
    g.computeVertexNormals();
    moundGeo = g;
    return g;
  }
  /** Low elongated debris drift (len along yaw axis, depth across), with bricks, slabs, rebar & litter. */
  M.debrisDrift = function (x, z, len, depth, h, yaw, r, o) {
    o = o || {};
    const y0 =
      o.y !== undefined ? o.y : Math.max(0, G.world.terrainHeight(x, z));
    const tint = M.mulc([0.78, 0.75, 0.7], r.range(0.75, 1.02));
    M.geom(
      M.buf("rubble", x, z, "detail"),
      driftGeo(),
      M.mtx(x, y0 - 0.04, z, yaw, 0, 0, [depth / 2, h, len / 2]),
      { c: tint, us: Math.max(1, len / 4) },
    );
    const ca = Math.cos(yaw),
      sa = Math.sin(yaw);
    const n = Math.round(2 + len * 0.7);
    for (let i = 0; i < n; i++) {
      const a = r.range(-0.5, 0.5) * len * 0.9,
        b = r.range(-0.5, 0.5) * depth * 0.8;
      const px = x + a * sa + b * ca,
        pz = z + a * ca - b * sa;
      const k = r();
      const key =
        k < 0.45 ? "brick_red" : k < 0.8 ? "concrete" : "stone_limestone";
      const s = r.range(0.18, 0.7);
      M.obox(
        M.buf(key, px, pz, "detail"),
        px,
        y0 + h * 0.5 * r(),
        pz,
        s * r.range(1, 2.2),
        s * r.range(0.25, 0.6),
        s * r.range(0.7, 1.4),
        r() * 6,
        {
          pitch: r.range(-0.5, 0.5),
          roll: r.range(-0.5, 0.5),
          s: 1.5,
          c: M.mulc([0.85, 0.8, 0.76], r.range(0.7, 1)),
        },
      );
    }
    if (r() < 0.5) {
      const px = x + r.range(-0.3, 0.3) * len * sa,
        pz = z + r.range(-0.3, 0.3) * len * ca;
      M.beam(
        M.buf("rust", px, pz, "detail"),
        px,
        y0 + h * 0.5,
        pz,
        px + r.range(-1.2, 1.2),
        y0 + h + r.range(0.2, 0.9),
        pz + r.range(-1.2, 1.2),
        0.035,
        0.035,
        { c: [0.65, 0.48, 0.38] },
      );
    }
    M.decal(
      M.buf("my/markings", x, z, "fine"),
      x,
      y0 + 0.014,
      z,
      depth * 1.8,
      len * 1.2,
      yaw,
      r() < 0.5 ? M.MARK.DIRT : M.MARK.SAND,
      M.mulc(M.WHITE, r.range(0.7, 1)),
    );
  };

  // dead-grass / weed tufts (alpha-tested crossed quads)
  M.defineAtlas("weeds", function () {
    const S = 512,
      cv = M.canvas(S, S / 2),
      ctx = cv.getContext("2d");
    const r = M.rng("weeds");
    ctx.clearRect(0, 0, S, S / 2);
    // 4 tuft variants side by side (128×256 each)
    for (let v = 0; v < 4; v++) {
      const x0 = v * 128;
      const n = 30 + v * 8;
      for (let i = 0; i < n; i++) {
        const bx = x0 + 64 + (r() - 0.5) * 70,
          h = (0.35 + r() * 0.65) * 240 * (v === 3 ? 0.55 : 1);
        const lean = (r() - 0.5) * 60;
        // sun-bleached straw with a few darker, damp stems (dead grass reads tan-gold, not black)
        const c =
          r() < 0.45
            ? [176, 152, 96]
            : r() < 0.6
              ? [148, 128, 78]
              : r() < 0.7
                ? [122, 108, 66]
                : [96, 88, 56];
        ctx.strokeStyle = "rgb(" + c.join(",") + ")";
        ctx.lineWidth = 1.6 + r() * 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(bx, 254);
        ctx.quadraticCurveTo(
          bx + lean * 0.3,
          254 - h * 0.6,
          bx + lean,
          254 - h,
        );
        ctx.stroke();
        if (v === 2 && r() < 0.25) {
          ctx.fillStyle = "rgb(140,120,70)";
          ctx.beginPath();
          ctx.ellipse(bx + lean, 254 - h, 3, 7, 0.3, 0, 7);
          ctx.fill();
        }
      }
      if (v === 1) {
        ctx.strokeStyle = "rgb(96,82,56)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const bx = x0 + 40 + r() * 50;
          ctx.beginPath();
          ctx.moveTo(bx, 254);
          for (let k = 1; k < 6; k++)
            ctx.lineTo(bx + (r() - 0.5) * 50, 254 - k * 30);
          ctx.stroke();
        }
      }
    }
    // DataTexture with straw-coloured transparent texels: the mip chain no longer fades the tufts to black
    let t;
    try {
      t = M.cutoutTex(cv, [140, 122, 78]);
    } catch (e) {
      t = M.finishTex(new THREE.CanvasTexture(cv));
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    }
    return {
      texture: t,
      transparent: false,
      alphaTest: 0.35,
      roughness: 1,
      side: THREE.DoubleSide,
      keepNormal: true,
    };
  });
  function tuft(x, z, h, r, y) {
    const b = M.buf("my/weeds", x, z, "fine");
    const v = r.int(0, 3),
      u0 = v * 0.25 + 0.005,
      u1 = (v + 1) * 0.25 - 0.005;
    const a = r() * Math.PI,
      w = h * 0.55;
    const c = M.mulc([1, 1, 1], r.range(0.7, 1.05));
    const yy = y === undefined ? Math.max(0, G.world.terrainHeight(x, z)) : y;
    for (let k = 0; k < 2; k++) {
      const aa = a + (k * Math.PI) / 2,
        dx = Math.cos(aa) * w,
        dz = Math.sin(aa) * w;
      // up-facing normals: double-sided tufts are lit like the ground they grow from
      M.quad(
        b,
        [x - dx, yy - 0.02, z - dz],
        [x + dx, yy - 0.02, z + dz],
        [x + dx, yy + h, z + dz],
        [x - dx, yy + h, z - dz],
        [0, 1, 0],
        [u0, 0.01, u1, 0.01, u1, 0.99, u0, 0.99],
        c,
      );
    }
  }
  M.weedTuft = tuft;

  /** Trash heap: split bags, boxes, a tyre, paper litter. */
  function trashHeap(x, z, r) {
    const y = Math.max(0, G.world.terrainHeight(x, z));
    const fb = M.buf("fabric", x, z, "detail");
    const n = r.int(4, 8);
    for (let i = 0; i < n; i++) {
      const px = x + r.range(-1.1, 1.1),
        pz = z + r.range(-1.1, 1.1),
        s = r.range(0.4, 0.75);
      const col = r.pick([
        [0.16, 0.17, 0.15],
        [0.12, 0.13, 0.14],
        [0.28, 0.3, 0.22],
        [0.36, 0.32, 0.24],
      ]);
      M.obox(fb, px, y + s * 0.3, pz, s * 1.2, s * 0.62, s, r() * 6, {
        pitch: r.range(-0.3, 0.3),
        roll: r.range(-0.3, 0.3),
        s: 0.6,
        c: col,
      });
    }
    if (r() < 0.45) {
      const px = x + r.range(-0.7, 0.7),
        pz = z + r.range(-0.7, 0.7);
      M.obox(
        M.buf("wood_rotten", px, pz, "detail"),
        px,
        y + 0.2,
        pz,
        0.6,
        0.4,
        0.45,
        r() * 6,
        { roll: r.range(-0.3, 0.3), s: 0.8, c: [0.75, 0.65, 0.5] },
      );
    }
    if (r() < 0.25) {
      const px = x + r.range(-0.8, 0.8),
        pz = z + r.range(-0.8, 0.8);
      M.pushXF(
        M.mtx(px, y + 0.12, pz, r() * 6, Math.PI / 2 + r.range(-0.2, 0.2), 0),
      );
      M.cyl(
        M.buf("metal_painted", px, pz, "detail"),
        0,
        -0.12,
        0,
        0.36,
        0.36,
        0.24,
        10,
        { c: [0.1, 0.1, 0.1] },
      );
      M.popXF();
    }
    M.decal(
      M.buf("my/markings", x, z, "fine"),
      x,
      y + 0.014,
      z,
      r.range(2.6, 4),
      r.range(2.6, 4),
      r() * 6,
      M.MARK.LITTER,
      M.mulc(M.WHITE, r.range(0.75, 1)),
    );
    if (r() < 0.5)
      M.debrisDrift(
        x + r.range(-0.6, 0.6),
        z + r.range(-0.6, 0.6),
        r.range(1.2, 2.2),
        r.range(0.8, 1.2),
        r.range(0.15, 0.3),
        r() * 3,
        r,
        { y },
      );
  }
  M.trashHeap = trashHeap;

  function curbClutter() {
    const L = G.LAYOUT;
    const r = M.rng("curbclutter");
    const X = M.intersections || [];
    const nearX = (x, z, pad) => {
      for (const q of X)
        if (
          Math.abs(q.x - x) < q.a.road / 2 + pad &&
          Math.abs(q.z - z) < q.s.road / 2 + pad
        )
          return true;
      return false;
    };
    let heaps = 0,
      drifts = 0,
      tufts = 0;
    function along(ax, az, bx, bz, nx, nz) {
      // walk a curb line; (nx,nz) points from the road toward the sidewalk
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 4) return;
      const ux = (bx - ax) / len,
        uz = (bz - az) / len;
      let t = r.range(2, 10);
      while (t < len - 2) {
        const px = ax + ux * t,
          pz = az + uz * t;
        if (!nearX(px, pz, 4) && !L.siteAt(px, pz, 2)) {
          const k = r();
          const inGutter = r() < 0.6; // gutter side (road) or curb side (sidewalk edge)
          const off = inGutter ? -r.range(0.4, 1.1) : r.range(0.5, 1.2);
          const qx = px + nx * off,
            qz = pz + nz * off;
          if (k < 0.38) {
            trashHeap(qx, qz, r);
            heaps++;
          } else if (k < 0.68) {
            M.debrisDrift(
              qx,
              qz,
              r.range(1.6, 4),
              r.range(0.7, 1.4),
              r.range(0.14, 0.34),
              Math.atan2(ux, uz),
              r,
              {},
            );
            drifts++;
          } else {
            const cell = r.pick([
              M.MARK.LEAVES,
              M.MARK.DIRT,
              M.MARK.LEAVES,
              M.MARK.SAND,
            ]);
            M.decal(
              M.buf("my/markings", qx, qz, "fine"),
              qx,
              Math.max(0, G.world.terrainHeight(qx, qz)) + 0.016,
              qz,
              r.range(1, 1.8),
              r.range(2.5, 5),
              Math.atan2(ux, uz),
              cell,
              M.mulc(M.WHITE, r.range(0.75, 1)),
            );
          }
        }
        // weeds along the gutter line
        for (let s = 0; s < 3; s++) {
          const tt = t + r.range(0, 8);
          if (tt > len || r() < 0.45) continue;
          const wx = ax + ux * tt - nx * r.range(0.05, 0.35),
            wz = az + uz * tt - nz * r.range(0.05, 0.35);
          if (nearX(wx, wz, 1)) continue;
          tuft(wx, wz, r.range(0.22, 0.6), r);
          tufts++;
        }
        t += r.range(8, 18);
      }
    }
    for (const a of M.roads.avenues) {
      const hw = a.road / 2;
      along(a.x - hw, a.z0 + 2, a.x - hw, a.z1 - 2, -1, 0);
      along(a.x + hw, a.z0 + 2, a.x + hw, a.z1 - 2, 1, 0);
    }
    for (const s of M.roads.streets) {
      const hw = s.road / 2;
      along(s.x0 + 2, s.z - hw, s.x1 - 2, s.z - hw, 0, -1);
      along(s.x0 + 2, s.z + hw, s.x1 - 2, s.z + hw, 0, 1);
    }
    // weeds in sidewalk cracks and against building walls
    for (let i = 0; i < 2600; i++) {
      const p = G.map.randomStreetPoint
        ? G.map.randomStreetPoint(r, true)
        : null;
      if (!p) continue;
      tuft(p.x, p.z, r.range(0.15, 0.45), r);
      tufts++;
    }
    M.decayStats = Object.assign(M.decayStats || {}, { heaps, drifts, tufts });
  }

  /** Standing water in potholes & low spots (glossy, murky). */
  function puddles() {
    const r = M.rng("puddles");
    const R = M.roads;
    let n = 0;
    for (let i = 0; i < 520; i++) {
      const useAve = r() < 0.5;
      let x, z;
      if (useAve) {
        const a = r.pick(R.avenues);
        x = a.x + r.range(-a.road / 2 + 0.8, a.road / 2 - 0.8);
        z = r.range(a.z0, a.z1);
      } else {
        const s = r.pick(R.streets);
        x = r.range(s.x0, s.x1);
        z = s.z + r.range(-s.road / 2 + 0.8, s.road / 2 - 0.8);
      }
      if (M.rasterAt(x, z) !== M.RC.ROAD || G.LAYOUT.siteAt(x, z, 1)) continue;
      const rds = r.range(0.5, 1.8);
      // broken-edged pothole rim + murky water sheet
      M.decal(
        M.buf("my/markings", x, z, "fine"),
        x,
        0.013,
        z,
        rds * 2.6,
        rds * 2.3,
        r() * 6,
        M.MARK.POTHOLE,
        M.mulc(M.WHITE, r.range(0.8, 1)),
      );
      const pts = [];
      const k = r.int(9, 13);
      for (let j = 0; j < k; j++) {
        const a = (j / k) * Math.PI * 2,
          rr = rds * r.range(0.72, 1.05);
        pts.push([x + Math.cos(a) * rr * 1.1, z + Math.sin(a) * rr]);
      }
      M.poly(M.buf("water@gloss,fwd", x, z, "fine"), pts, 0.03, {
        s: 3,
        c: [0.42, 0.46, 0.38],
        convex: true,
      });
      n++;
    }
    M.decayStats = Object.assign(M.decayStats || {}, { puddles: n });
  }

  // -------------------------------------------------------------------
  // Entry point (after the buildings: needs M.wallLog, M.storefronts, M.lots)
  // -------------------------------------------------------------------
  M.buildDecay = function () {
    const r = M.rng("decay");
    let walls = 0;
    for (const w of M.wallLog || []) {
      weatherWall(w, r);
      walls++;
    }
    // debris at the foot of buildings: most street fronts get a drift, ruins a big spill
    let bases = 0;
    for (const lot of M.lots || []) {
      if (lot.kind === "shell" || lot.kind === "collapsed") continue;
      const rr = M.rng(
        "base" + Math.round(lot.x0 * 3) + "," + Math.round(lot.z0 * 3),
      );
      const fr = {
        n: lot.front.n || !!lot.faceN,
        s: lot.front.s || !!lot.faceS,
        e: lot.front.e,
        w: lot.front.w,
      };
      // wind-blown dirt, dead leaves and litter banked against every street wall
      for (const k of ["n", "s", "e", "w"]) {
        if (!fr[k]) continue;
        const alongX = k === "n" || k === "s";
        const span = alongX ? lot.x1 - lot.x0 : lot.z1 - lot.z0;
        for (let t = rr.range(0, 2); t < span - 1; t += rr.range(3, 6)) {
          const l = rr.range(2.5, 4.5),
            off = rr.range(0.35, 0.7);
          const x = alongX
            ? lot.x0 + t + l / 2
            : k === "e"
              ? lot.x1 + off
              : lot.x0 - off;
          const z = alongX
            ? k === "s"
              ? lot.z1 + off
              : lot.z0 - off
            : lot.z0 + t + l / 2;
          if (rr() < 0.3) continue;
          M.decal(
            M.buf("my/markings", x, z, "fine"),
            x,
            M.SIDEWALK_Y + 0.013,
            z,
            rr.range(0.9, 1.5),
            l,
            alongX ? Math.PI / 2 : 0,
            rr.pick([
              M.MARK.DIRT,
              M.MARK.LEAVES,
              M.MARK.GRIME,
              M.MARK.LITTER,
              M.MARK.SAND,
            ]),
            M.mulc(M.WHITE, rr.range(0.7, 1)),
          );
        }
      }
      for (const k of ["n", "s", "e", "w"]) {
        if (!fr[k]) continue;
        const p = lot.ruined ? 0.95 : lot.kind === "brownstone" ? 0.18 : 0.55;
        if (rr() > p) continue;
        const alongX = k === "n" || k === "s";
        const span = alongX ? lot.x1 - lot.x0 : lot.z1 - lot.z0;
        const len = Math.min(span * 0.8, rr.range(3, lot.ruined ? 12 : 7));
        const tc = rr.range(
          len / 2 + 0.3,
          Math.max(len / 2 + 0.31, span - len / 2 - 0.3),
        );
        const dep = lot.ruined ? rr.range(1.8, 3.2) : rr.range(0.9, 1.6);
        const out = dep * 0.4;
        const x = alongX
          ? lot.x0 + tc
          : k === "e"
            ? lot.x1 + out
            : lot.x0 - out;
        const z = alongX
          ? k === "s"
            ? lot.z1 + out
            : lot.z0 - out
          : lot.z0 + tc;
        M.debrisDrift(
          x,
          z,
          len,
          dep,
          lot.ruined ? rr.range(0.45, 0.9) : rr.range(0.18, 0.38),
          alongX ? Math.PI / 2 : 0,
          rr,
          {},
        );
        if (lot.ruined && rr() < 0.6)
          M.rubblePile(
            x + rr.range(-1, 1),
            z + rr.range(-1, 1),
            rr.range(1.4, 2.6),
            rr.range(0.5, 1.1),
            rr,
            { layer: "detail", noCollide: true },
          );
        bases++;
      }
    }
    curbClutter();
    puddles();
    M.decayStats = Object.assign(M.decayStats || {}, { walls, bases });
    M.wallLog = [];
  };
})();
