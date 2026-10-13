// play-inline-94 02 — beam
// Lines 909-1042 of readable/play-inline-94.pretty.js (statement-aligned).
(function () {
  "use strict";
  const G = window.G;
  const M = G.map._;
  M.buildQueensboro = function () {
    const L = G.LAYOUT;
    const z = L.STREET_Z0; // 59th Street
    const x0 = (M.shoreX(L.MANHATTAN, z, 1) || 338) + 2,
      x1 = 900;
    const DY = 27,
      HW = 11;
    const towers = [x0 + 40, x0 + 200, x0 + 360, x0 + 520].filter(
      (x) => x < x1 - 10,
    );
    const b = M.buf("rust", 600, z, "far");
    const st = M.buf("granite", 600, z, "far");
    const col = [0.62, 0.55, 0.5],
      colD = [0.5, 0.45, 0.4];
    const gapA = towers[1] + 55,
      gapB = towers[2] - 55; // collapsed centre span
    const topAt = (x) => {
      // top chord: high over the towers, dipping between them (cantilever silhouette)
      let d = 1e9;
      for (const t of towers) d = Math.min(d, Math.abs(x - t));
      return DY + 12 + 26 * Math.max(0, 1 - d / 80);
    };
    // Manhattan anchorage block
    M.box(st, x0 - 12, 0, z - HW - 2, x0 + 4, DY, z + HW + 2, {
      s: 3,
      c: [0.8, 0.77, 0.72],
    });
    // stone piers under the towers
    for (const t of towers) {
      M.box(st, t - 7, -8, z - HW - 4, t + 7, DY - 1.5, z + HW + 4, {
        s: 3,
        c: [0.78, 0.75, 0.7],
      });
      M.box(st, t - 8, DY - 3, z - HW - 5, t + 8, DY - 1.5, z + HW + 5, {
        s: 3,
        c: [0.85, 0.82, 0.76],
      });
    }
    const STEP = 10;
    for (const sz of [-HW, HW]) {
      for (let x = x0; x < x1 - 1; x += STEP) {
        const xa = x,
          xb = Math.min(x + STEP, x1);
        const inGap = xa > gapA && xb < gapB;
        if (inGap) continue;
        const ta = topAt(xa),
          tb = topAt(xb);
        // chords
        M.beam(b, xa, DY, z + sz, xb, DY, z + sz, 1.0, 1.4, { c: colD });
        M.beam(b, xa, ta, z + sz, xb, tb, z + sz, 0.9, 1.1, { c: col });
        // verticals & a diagonal per panel
        M.beam(b, xa, DY, z + sz, xa, ta, z + sz, 0.6, 0.6, { c: col });
        M.beam(b, xa, DY, z + sz, xb, tb, z + sz, 0.45, 0.45, { c: colD });
      }
      // drooping torn truss ends at the collapse
      M.beam(b, gapA, DY, z + sz, gapA + 16, DY - 14, z + sz + 2, 0.9, 1.2, {
        c: colD,
      });
      M.beam(
        b,
        gapA,
        topAt(gapA),
        z + sz,
        gapA + 12,
        DY - 6,
        z + sz + 3,
        0.8,
        1.0,
        { c: col },
      );
      M.beam(b, gapB, DY, z + sz, gapB - 18, DY - 17, z + sz - 2, 0.9, 1.2, {
        c: colD,
      });
      M.beam(
        b,
        gapB,
        topAt(gapB),
        z + sz,
        gapB - 13,
        DY - 8,
        z + sz - 3,
        0.8,
        1.0,
        { c: col },
      );
    }
    // deck (with the gap) and lateral bracing
    for (const [a, c] of [
      [x0, gapA],
      [gapB, x1],
    ]) {
      M.box(b, a, DY - 1.4, z - HW, c, DY + 0.2, z + HW, {
        s: 4,
        c: [0.45, 0.42, 0.4],
      });
      for (let x = a; x < c; x += 20)
        M.beam(b, x, topAt(x), z - HW, x, topAt(x), z + HW, 0.4, 0.4, {
          c: colD,
        });
    }
    // fallen span lying in the river
    M.obox(b, (gapA + gapB) / 2, -2, z + 4, gapB - gapA - 10, 3, 2 * HW, 0.06, {
      roll: 0.25,
      s: 4,
      c: [0.45, 0.4, 0.36],
    });
    // towers: legs + finials
    for (const t of towers)
      for (const sz of [-HW, HW]) {
        const top = topAt(t);
        for (const dx of [-3, 3])
          M.beam(
            b,
            t + dx,
            DY,
            z + sz,
            t + dx * 0.5,
            top + 6,
            z + sz,
            0.9,
            0.9,
            { c: col },
          );
        M.cyl(b, t, top + 6, z + sz, 1.2, 0.05, 9, 6, { c: col });
        M.cyl(b, t - 4, top + 2, z + sz, 0.5, 0.05, 5, 4, { c: col });
        M.cyl(b, t + 4, top + 2, z + sz, 0.5, 0.05, 5, 4, { c: col });
      }
    M.queensboro = { x0, x1, z, deckY: DY };
  };
})();
