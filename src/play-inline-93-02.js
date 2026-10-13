// play-inline-93 02 — math
// Lines 317-479 of readable/play-inline-93.pretty.js (statement-aligned).
  M.buildBillboards = function () {
    const L = G.LAYOUT;
    const r = M.rng("billboards");
    const lots = M.lots || [];
    // index lots by rounded x edges for neighbour lookups
    const idx = new Map();
    for (const l of lots) {
      for (const x of [Math.round(l.x0), Math.round(l.x1)]) {
        for (const k of [x - 1, x, x + 1]) {
          let a = idx.get(k);
          if (!a) {
            a = [];
            idx.set(k, a);
          }
          a.push(l);
        }
      }
    }
    // ---- 1. rooftop billboards on mid-rise buildings facing streets/avenues ----
    const cand = lots.filter(
      (l) =>
        l.h > 10 &&
        l.h < 60 &&
        (l.kind === "commercial" ||
          l.kind === "tenement" ||
          l.kind === "apartment" ||
          l.kind === "warehouse") &&
        l.x1 - l.x0 > 9,
    );
    // spread: at most one per ~100 m cell
    const used = new Set();
    let roofCount = 0;
    const order = cand
      .map((l) => [r(), l])
      .sort((a, b) => a[0] - b[0])
      .map((e) => e[1]);
    for (const l of order) {
      if (roofCount >= 46) break;
      const cx = (l.x0 + l.x1) / 2,
        cz = (l.z0 + l.z1) / 2;
      const key = Math.floor(cx / 95) + "," + Math.floor(cz / 80);
      if (used.has(key)) continue;
      // face a street side (prefer avenue-facing e/w for north-south views, else n/s)
      const fr = {
        n: l.front.n || l.faceN,
        s: l.front.s || l.faceS,
        e: l.front.e,
        w: l.front.w,
      };
      const sides = Object.keys(fr).filter((k) => fr[k]);
      if (!sides.length) continue;
      const k = r.pick(sides);
      const nx = k === "e" ? 1 : k === "w" ? -1 : 0,
        nz = k === "s" ? 1 : k === "n" ? -1 : 0;
      const span = nz !== 0 ? l.x1 - l.x0 : l.z1 - l.z0;
      const w = Math.min(span - 2, r.range(9, 15));
      if (w < 7) continue;
      const h = w * 0.5;
      const px = nz !== 0 ? cx : k === "e" ? l.x1 - 2.5 : l.x0 + 2.5;
      const pz = nx !== 0 ? cz : k === "s" ? l.z1 - 2.5 : l.z0 + 2.5;
      rooftopBillboard(px, l.h + 0.2, pz, nx, nz, w, h, nextBrand(r), r);
      used.add(key);
      roofCount++;
    }
    // ---- 2. painted ads on exposed party walls (taller than the neighbour) ----
    let wallCount = 0;
    for (const l of lots) {
      if (wallCount >= 70) break;
      if (l.kind === "collapsed" || l.kind === "tower" || !(l.h > 14)) continue;
      for (const k of ["e", "w"]) {
        if (l.front[k]) continue; // street face has windows
        const nb = neighbour(l, k, idx);
        const nh = nb ? nb.h || 0 : 0;
        const exposed = l.h - nh;
        if (exposed < 9) continue;
        if (r() < 0.4) continue;
        const d = l.z1 - l.z0;
        const w = Math.min(d - 2, (exposed - 2) * 2, r.range(10, 18));
        if (w < 6) continue;
        const h = w * 0.5;
        const y = nh + 1 + (exposed - 2 - h) * r.range(0.3, 0.8) + h / 2;
        const nx = k === "e" ? 1 : -1;
        const x = (k === "e" ? l.x1 : l.x0) + nx * 0.06;
        const z = (l.z0 + l.z1) / 2 + r.range(-(d - w) / 2, (d - w) / 2) * 0.8;
        panel(nextBrand(r), x, y, z, nx, 0, w, h, {
          c: M.mulc([1, 1, 1], r.range(0.62, 0.9)),
          layer: "main",
        });
        wallCount++;
        break;
      }
    }
    // ---- 3. Brooklyn warehouse walls facing Manhattan (west) ----
    const bk = lots
      .filter(
        (l) => l.district === "brooklyn" && l.kind === "warehouse" && l.h > 12,
      )
      .sort((a, b) => a.x0 - b.x0)
      .slice(0, 6);
    for (const l of bk) {
      const d = l.z1 - l.z0,
        w = Math.min(d - 3, 22),
        h = w * 0.5;
      if (w < 8) continue;
      panel(
        nextBrand(r),
        l.x0 - 0.08,
        Math.max(h / 2 + 3, l.h - h / 2 - 2),
        (l.z0 + l.z1) / 2,
        -1,
        0,
        w,
        h,
        { c: [0.8, 0.8, 0.8] },
      );
    }
    // ---- 4. The giant rooftop FIZZO COLA sign on the Brooklyn waterfront ----
    const cand2 = lots
      .filter(
        (l) =>
          l.district === "brooklyn" &&
          l.kind === "warehouse" &&
          l.z0 > 390 &&
          l.z1 < 560,
      )
      .sort((a, b) => a.x0 - b.x0);
    const host = cand2[0];
    if (host) {
      const x = host.x0 + 4,
        z = (host.z0 + host.z1) / 2;
      rooftopBillboard(x, host.h + 0.2, z, -1, 0, 34, 12, "fizzo_cola", r);
      M.giantSign = { x, z, y: host.h };
    }
    // ---- 5. vertical banners on a few midtown towers ----
    const towers = lots.filter(
      (l) => l.kind === "tower" && l.h > 70 && l.district === "midtown",
    );
    for (let i = 0; i < Math.min(8, towers.length); i++) {
      const l = towers[(i * 7) % towers.length];
      const fr = ["n", "s"].filter((k) => l.front[k]);
      if (!fr.length) continue;
      const k = fr[0],
        nz = k === "s" ? 1 : -1;
      const z = (k === "s" ? l.z1 : l.z0) + nz * 0.25;
      const w = Math.min(16, l.x1 - l.x0 - 4),
        h = w * 0.5;
      if (w < 8) continue;
      panel(
        nextBrand(r),
        (l.x0 + l.x1) / 2,
        9 + h / 2 + r.range(0, 4),
        z,
        0,
        nz,
        w,
        h,
        { c: [0.85, 0.85, 0.85] },
      );
    }
    M.billboardCount = M.billboards.length;
    void L;
    return M.billboards.length;
  };
