// play-inline-21 13 — math
// Lines 3627-3962 of readable/play-inline-21.pretty.js (statement-aligned).
  const AUTO_WIN_NAME =
    /fac|facade|tower|office|window|curtain|bldg|building|skyscr|shaft|annex|brick|stone/i;
  const AUTO_WIN_SKIP =
    /tile|floor|carpet|fence|grate|vent|screen|sign|atlas|poster|bill|neon|glass|decal|ground|road|roof|lamp|glow|paint/i;
  const autoSeen = new WeakSet(),
    autoBySource = new WeakMap();
  X.autoWin = [];
  function detectWindowGrid(img, hint, hasEmissive) {
    const iw = img.width || img.naturalWidth || 0,
      ih = img.height || img.naturalHeight || 0;
    if (iw < 96 || ih < 96) return null;
    const W = 192,
      H = Math.max(64, Math.min(576, Math.round((W * ih) / iw)));
    const cv = X.canvas(W, H);
    let d;
    try {
      cv.ctx.drawImage(img, 0, 0, W, H);
      d = cv.ctx.getImageData(0, 0, W, H).data;
    } catch (e) {
      return null;
    }
    const N = W * H,
      L = new Float32Array(N);
    for (let i = 0; i < N; i++)
      L[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.5 + d[i * 4 + 2] * 0.2;
    const pxp = new Float32Array(W),
      pyp = new Float32Array(H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const l = L[y * W + x];
        pxp[x] += l / H;
        pyp[y] += l / W;
      }
    // finest period k (repeats per texture) whose shifts by 1..4 periods all correlate: rejects sub-harmonics and near-misses
    function period(p, kMax, minLag) {
      const n = p.length;
      let mean = 0;
      for (let i = 0; i < n; i++) mean += p[i] / n;
      let vr = 0;
      for (let i = 0; i < n; i++) vr += (p[i] - mean) * (p[i] - mean);
      if (vr / n < 6) return null;
      const corr = (lag) => {
        let s = 0;
        for (let i = 0; i < n; i++) {
          const t = i + lag,
            i0 = Math.floor(t),
            f = t - i0;
          const v = p[i0 % n] * (1 - f) + p[(i0 + 1) % n] * f;
          s += (p[i] - mean) * (v - mean);
        }
        return s / vr;
      };
      let best = null;
      for (let k = 2; k <= kMax; k++) {
        const lag = n / k;
        if (lag < minLag) break;
        let sc = 1;
        for (let m = 1; m <= Math.min(k - 1, 4); m++)
          sc = Math.min(sc, corr(lag * m));
        if (sc > 0.62) best = { k, c: sc };
      }
      return best;
    }
    const rej = (why) => {
      detectWindowGrid.why = why;
      return null;
    };
    const bx = period(pxp, 24, 8),
      by = period(pyp, 32, 8);
    if (!bx || !by)
      return rej("period " + (bx ? bx.k : "-") + "x" + (by ? by.k : "-"));
    const nb = bx.k,
      nf = by.k,
      cw = W / nb,
      ch = H / nf,
      S = 24;
    // fold all cells into one mean cell
    const F = new Float32Array(S * S * 3);
    for (let cy = 0; cy < nf; cy++)
      for (let cx = 0; cx < nb; cx++)
        for (let j = 0; j < S; j++)
          for (let i = 0; i < S; i++) {
            const x = Math.min(W - 1, (cx * cw + ((i + 0.5) / S) * cw) | 0),
              y = Math.min(H - 1, (cy * ch + ((j + 0.5) / S) * ch) | 0),
              o = (y * W + x) * 4,
              f = (j * S + i) * 3;
            F[f] += d[o];
            F[f + 1] += d[o + 1];
            F[f + 2] += d[o + 2];
          }
    for (let i = 0; i < F.length; i++) F[i] /= nb * nf;
    const at = (i, j) => (j * S + i) * 3;
    const dist = (f, c) =>
      Math.hypot(F[f] - c[0], F[f + 1] - c[1], F[f + 2] - c[2]);
    const wall = [0, 0, 0];
    let wn = 0;
    for (const j of [0, 1, S - 2, S - 1])
      for (const i of [0, 1, S - 2, S - 1]) {
        const f = at(i, j);
        wall[0] += F[f];
        wall[1] += F[f + 1];
        wall[2] += F[f + 2];
        wn++;
      }
    wall[0] /= wn;
    wall[1] /= wn;
    wall[2] /= wn;
    const run = (prof, th) => {
      let mx = 0,
        am = 0;
      for (let i = 0; i < S; i++)
        if (prof[i] > mx) {
          mx = prof[i];
          am = i;
        }
      let s = am,
        e = am;
      while (s > 0 && prof[s - 1] > mx * th) s--;
      while (e < S - 1 && prof[e + 1] > mx * th) e++;
      return { s, e, mx };
    };
    const A = new Float32Array(S);
    for (let i = 0; i < S; i++) {
      let a = 0;
      for (let j = 0; j < S; j++) a += dist(at(i, j), wall);
      A[i] = a / S;
    }
    const rx = run(A, 0.5);
    if (rx.s < 1 || rx.e > S - 2 || rx.mx < 14)
      return rej("cols " + rx.s + "-" + rx.e + " " + rx.mx.toFixed(0));
    const x0 = rx.s / S,
      x1 = (rx.e + 1) / S;
    if (
      Math.abs((x0 + x1) / 2 - 0.5) > 0.07 ||
      x1 - x0 < 0.15 ||
      x1 - x0 > 0.85
    )
      return rej("xrect " + x0.toFixed(2) + "-" + x1.toFixed(2));
    // rows: distance from what sits above / below the window in the same columns (wall or spandrel)
    const ref = [0, 0, 0];
    let rn = 0;
    for (let i = rx.s; i <= rx.e; i++)
      for (const j of [0, S - 1]) {
        const f = at(i, j);
        ref[0] += F[f];
        ref[1] += F[f + 1];
        ref[2] += F[f + 2];
        rn++;
      }
    ref[0] /= rn;
    ref[1] /= rn;
    ref[2] /= rn;
    const Bp = new Float32Array(S);
    for (let j = 0; j < S; j++) {
      let a = 0;
      for (let i = rx.s; i <= rx.e; i++) a += dist(at(i, j), ref);
      Bp[j] = a / (rx.e - rx.s + 1);
    }
    const ry = run(Bp, 0.35);
    if (ry.s < 1 || ry.e > S - 2 || ry.mx < 12)
      return rej("rows " + ry.s + "-" + ry.e + " " + ry.mx.toFixed(0));
    const y1 = 1 - ry.s / S,
      y0 = 1 - (ry.e + 1) / S;
    if (y1 - y0 < 0.2 || y1 - y0 > 0.92)
      return rej("yrect " + y0.toFixed(2) + "-" + y1.toFixed(2));
    // masonry / tile joints, not windows: a fine grid whose "openings" fill most of the cell (brick faces between thin
    // mortar lines — brick_tan / brick_white read as 24 × 12 "window" grids, every brick a room). Real façade grids
    // here are ≤ 10 bays per texture with openings ≤ ~0.5 of the cell.
    if ((x1 - x0) * (y1 - y0) > 0.55 && (nb >= 12 || nf >= 12))
      return rej(
        "joints " + nb + "x" + nf + " " + ((x1 - x0) * (y1 - y0)).toFixed(2),
      );
    // per-cell pane colour (where the shader classifies it): median = painted glass, bright warm outliers = lit
    const samples = [];
    for (let cy = 0; cy < nf; cy++)
      for (let cx = 0; cx < nb; cx++) {
        let r = 0,
          g = 0,
          b = 0,
          n = 0;
        for (const fx of [0.3, 0.7])
          for (let k = -1; k <= 1; k++) {
            const x = Math.min(
              W - 1,
              Math.max(0, (cx * cw + (x0 + (x1 - x0) * fx) * cw + k) | 0),
            );
            const y = Math.min(
                H - 1,
                Math.max(0, (cy * ch + (1 - (y0 + (y1 - y0) * 0.62)) * ch) | 0),
              ),
              o = (y * W + x) * 4;
            r += d[o];
            g += d[o + 1];
            b += d[o + 2];
            n++;
          }
        samples.push([r / n, g / n, b / n]);
      }
    const lumOf = (c) => c[0] * 0.3 + c[1] * 0.5 + c[2] * 0.2;
    const sorted = samples.slice().sort((a, b) => lumOf(a) - lumOf(b));
    const glass = sorted[(sorted.length / 2) | 0];
    const dg = Math.hypot(
      glass[0] - wall[0],
      glass[1] - wall[1],
      glass[2] - wall[2],
    );
    if (dg < 18) return rej("contrast " + dg.toFixed(0));
    let cons = 0;
    for (const c of samples)
      if (
        Math.hypot(c[0] - glass[0], c[1] - glass[1], c[2] - glass[2]) <
        Math.hypot(c[0] - wall[0], c[1] - wall[1], c[2] - wall[2])
      )
        cons++;
    cons /= samples.length;
    const strong = bx.c > 0.8 && by.c > 0.8 && cons > 0.7;
    if (cons < 0.5 || !(hint || strong))
      return rej(
        "cons " + cons.toFixed(2) + " score " + Math.min(bx.c, by.c).toFixed(2),
      );
    let lit = null;
    if (hasEmissive) {
      const lg = lumOf(glass),
        L2 = samples.filter((c) => lumOf(c) > lg * 1.8 + 25 && c[0] > c[2]);
      if (L2.length)
        lit = L2.reduce(
          (a, c) => [
            a[0] + c[0] / L2.length,
            a[1] + c[1] / L2.length,
            a[2] + c[2] / L2.length,
          ],
          [0, 0, 0],
        );
    }
    const hx = (c) =>
      "#" +
      c
        .map((v) =>
          Math.max(0, Math.min(255, Math.round(v)))
            .toString(16)
            .padStart(2, "0"),
        )
        .join("");
    const m = 0.4 / S; // the painted frame belongs to the wall
    return {
      cells: [nb, nf],
      win: { x0: x0 + m, x1: x1 - m, y0: y0 + m, y1: y1 - m },
      mullions: 1,
      bayPx: iw / nb,
      glass: hx(glass),
      lit: lit ? hx(lit) : 0,
      recess: 0.2,
      office:
        x1 - x0 > 0.55 ||
        /office|tower|esb|metlife|rock|chrysler|un_/i.test(hint || ""),
      score: +Math.min(bx.c, by.c).toFixed(2),
      cons: +cons.toFixed(2),
    };
  }
  X.detectWindowGrid = detectWindowGrid;
  /** Sweep: patch foreign window-grid façades (once per material; detection cached per texture). */
  X.autoWinRej = [];
  // Detections found by the periodic sweep are not run inside the frame: they queue here and run one at a time in idle
  // time (requestIdleCallback with a deadline check, setTimeout fallback), so the getImageData readback never lands in a
  // frame. Load-time sweeps (initDone / newGame, behind the loading screen) still detect synchronously.
  const autoQueue = [];
  let autoIdleOn = false;
  X.sweepStats.detectMaxMs = 0;
  X.sweepStats.idleRuns = 0;
  function autoIdle(deadline) {
    autoIdleOn = false;
    let n = 0;
    while (autoQueue.length) {
      if (
        deadline &&
        typeof deadline.timeRemaining === "function" &&
        n > 0 &&
        deadline.timeRemaining() < 6
      )
        break;
      const it = autoQueue.shift();
      const t0 = now();
      try {
        autoDetect(it.m, it.obj);
      } catch (e) {
        /* optional */
      }
      const dt = now() - t0;
      if (dt > X.sweepStats.detectMaxMs)
        X.sweepStats.detectMaxMs = +dt.toFixed(2);
      X.sweepStats.idleRuns++;
      n++;
      if (!deadline) break; // setTimeout fallback: one per tick
    }
    if (autoQueue.length) scheduleAutoIdle();
  }
  function scheduleAutoIdle() {
    if (autoIdleOn) return;
    autoIdleOn = true;
    if (typeof window.requestIdleCallback === "function")
      window.requestIdleCallback(autoIdle, { timeout: 4000 });
    else setTimeout(() => autoIdle(null), 50);
  }
  function autoVisit(m, obj, deferred) {
    if (!m || autoSeen.has(m)) return 0;
    autoSeen.add(m);
    if (
      !m.isMeshStandardMaterial ||
      m.onBeforeCompile !== protoOBC ||
      !m.map ||
      m.transparent ||
      m.alphaTest > 0
    )
      return 0;
    const ud = m.userData || {};
    if (ud.txWin || ud.txWinGrid || ud.noAutoWindows) return 0;
    const nm = m.name || "";
    if (AUTO_WIN_SKIP.test(nm) && !/fac/i.test(nm)) return 0;
    if (isSurfaceTile(m.map)) return 0;
    if (deferred && autoBySource.get(m.map.source || m.map) === undefined) {
      if (autoQueue.length < 400) {
        autoQueue.push({ m, obj });
        scheduleAutoIdle();
      }
      return 0;
    }
    return autoDetect(m, obj);
  }
  // Our own seamless surface tiles (G.tex.get: brick_*, stone_*, tile_*, concrete…) are never window grids — POI kits put
  // them on plain MeshStandardMaterials (pv_brick_tan, lma_brick_tan, pmid_brick_white…), and their perfectly periodic
  // courses passed the detector: every brick became a tiny fake room (USER REPORT 2026-10-06). Façade atlases stay eligible.
  function isSurfaceTile(tex) {
    const rec = tex && recBySource.get(tex.source || tex);
    const def = rec && rec.name && X.GEN[rec.name];
    return !!(def && !def.facade);
  }
