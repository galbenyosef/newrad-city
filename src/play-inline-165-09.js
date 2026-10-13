// play-inline-165 09 — cell
// Lines 1862-2014 of readable/play-inline-165.pretty.js (statement-aligned).
  function fill(cell) {
    const out = { added: 0, dark: 0, at: [] };
    if (
      !cell ||
      !cell.adapter ||
      !cell.lum ||
      !G.world ||
      typeof G.world.query !== "function"
    )
      return out;
    const rnd = U().rng(
      cell.seed || U().hashStr((cell.key || "poi") + ":fill"),
    );
    const pts = sample(Object.assign({}, cell, { avoid: [] }), rnd);
    const T = cell.threshold,
      sp = cell.spacing || 9,
      max = cell.max || 10,
      placed = [];
    const dark = [];
    for (const p of pts) {
      const l = cell.lum(p.x, p.y + 1.0, p.z);
      if (l < T) dark.push({ p, l });
    }
    out.dark = dark.length;
    dark.sort((a, b) => a.l - b.l);
    const A = cell.adapter,
      col = cell.color || 0xffc27a;
    for (const d of dark) {
      if (placed.length >= max) break;
      const p = d.p;
      if (
        placed.some(
          (q) =>
            Math.hypot(q.x - p.x, q.z - p.z) < sp && Math.abs(q.y - p.y) < 3,
        )
      )
        continue;
      // at least a few dark neighbours → a real dark area, not a single shadowed corner sample
      let n = 0;
      for (const e of dark) {
        if (
          Math.abs(e.p.y - p.y) < 1 &&
          Math.hypot(e.p.x - p.x, e.p.z - p.z) < 4
        )
          n++;
        if (n >= 4) break;
      }
      if (n < 4) continue;
      const c = new THREE.Color(col)
        .offsetHSL((rnd() - 0.5) * 0.02, 0, (rnd() - 0.5) * 0.08)
        .getHex();
      if (p.wd <= 1.0) {
        // caged bulb on a bracket, 2.3 m up the nearest wall
        const wx = p.x + Math.sin(p.wa) * (p.wd - 0.12),
          wz = p.z + Math.cos(p.wa) * (p.wd - 0.12),
          y = p.y + 2.3;
        const ix = wx - Math.sin(p.wa) * 0.18,
          iz = wz - Math.cos(p.wa) * 0.18;
        A.add("metal", box(), M(wx, y, wz, 0, p.wa, 0, 0.16, 0.2, 0.05));
        A.add(
          "metal",
          box(),
          M(
            (wx + ix) / 2,
            y + 0.06,
            (wz + iz) / 2,
            0,
            p.wa,
            0,
            0.03,
            0.03,
            0.2,
          ),
        );
        A.add("bulb", cyl(), M(ix, y - 0.02, iz, 0, 0, 0, 0.09, 0.13, 0.09));
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * TAU;
          A.add(
            "metal",
            box(),
            M(
              ix + Math.cos(a) * 0.065,
              y - 0.02,
              iz + Math.sin(a) * 0.065,
              0,
              a,
              0,
              0.012,
              0.17,
              0.012,
            ),
          );
        }
        A.light(ix, y - 0.1, iz, c, cell.intensity || 1.3, cell.radius || 11);
        A.glow(ix, y - 0.02, iz, c, 1.1);
        out.at.push([+ix.toFixed(1), +y.toFixed(1), +iz.toFixed(1), "wall"]);
      } else {
        // tripod work light aimed at the floor
        const y = p.y + 1.9;
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * TAU + 0.3;
          A.add(
            "metal",
            cyl(),
            M(
              p.x + Math.cos(a) * 0.28,
              p.y + 0.95,
              p.z + Math.sin(a) * 0.28,
              Math.sin(a) * 0.28,
              0,
              -Math.cos(a) * 0.28,
              0.025,
              1.95,
              0.025,
            ),
          );
        }
        A.add(
          "metal",
          box(),
          M(p.x, y + 0.08, p.z, -0.5, rnd() * TAU, 0, 0.34, 0.24, 0.16),
        );
        A.add("bulb", box(), M(p.x, y, p.z, -0.5, 0, 0, 0.26, 0.16, 0.02));
        A.light(
          p.x,
          y,
          p.z,
          c,
          (cell.intensity || 1.3) * 1.1,
          (cell.radius || 11) * 1.15,
        );
        A.glow(p.x, y, p.z, c, 1.4);
        out.at.push([
          +p.x.toFixed(1),
          +y.toFixed(1),
          +p.z.toFixed(1),
          "tripod",
        ]);
      }
      placed.push({ x: p.x, y: p.y, z: p.z });
      out.added++;
    }
    G.poiFillStats = G.poiFillStats || {};
    G.poiFillStats[cell.key || "?"] = {
      added: out.added,
      dark: out.dark,
      samples: pts.length,
      at: out.at,
    };
    return out;
  }

  G.poiClutter = { version: VERSION, run, spawn, fill, STYLES, EMIT };
