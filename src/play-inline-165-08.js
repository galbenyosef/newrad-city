// play-inline-165 08 — cell
// Lines 1593-1861 of readable/play-inline-165.pretty.js (statement-aligned).
  function run(cell) {
    const t0 = performance.now();
    const out = {
      pieces: 0,
      decals: 0,
      collapses: 0,
      props: [],
      notes: [],
      cols: [],
      ms: 0,
    };
    if (
      !cell ||
      !cell.adapter ||
      !G.world ||
      typeof G.world.query !== "function"
    )
      return out;
    const rnd = U().rng(cell.seed || U().hashStr(cell.key || "poi"));
    const pts = sample(cell, rnd);
    const E = new Emitter(cell, rnd);
    const taken = []; // cleared circles
    const isTaken = (x, z, rr) => {
      for (const t of taken) {
        const dx = x - t.x,
          dz = z - t.z;
        if (dx * dx + dz * dz < (t.r + rr) * (t.r + rr)) return true;
      }
      return false;
    };
    // 1. vignettes: nearest wall spot to the requested point (same level)
    for (const v of cell.vignettes || []) {
      let best = null,
        bd = 1e9;
      const R = v.r || 8;
      for (const p of pts) {
        if (
          Math.abs(p.y - v.at.y) > 1.2 ||
          p.wd > 1.0 ||
          isTaken(p.x, p.z, 1.5)
        )
          continue;
        const d = Math.hypot(p.x - v.at.x, p.z - v.at.z);
        if (d > R) continue;
        const sc = d + (p.corner ? -1.0 : 0) + p.wd * 1.5;
        if (sc < bd) {
          bd = sc;
          best = p;
        }
      }
      if (!best) continue;
      vignette(E, v, best, out);
      taken.push({
        x: best.x + Math.sin(best.wa + Math.PI) * 1.2,
        z: best.z + Math.cos(best.wa + Math.PI) * 1.2,
        r: 2.4,
      });
    }
    // 2. collapses: on the biggest floors, 2–5 m from a wall, 3 m clear of everything taken
    const nCol = cell.collapses || 0;
    if (nCol > 0) {
      const byFloor = new Map();
      for (const p of pts) {
        let a = byFloor.get(p.c);
        if (!a) {
          a = [];
          byFloor.set(p.c, a);
        }
        a.push(p);
      }
      const floors = [...byFloor.keys()]
        .filter((c) => c.hx * c.hz * 4 >= 90)
        .sort((a, b) => b.hx * b.hz - a.hx * a.hz);
      let fi = 0,
        tries = 0;
      while (out.collapses < nCol && tries < 40 && floors.length) {
        tries++;
        const f = floors[fi++ % floors.length];
        const cand = byFloor
          .get(f)
          .filter((p) => p.wd >= 1.5 && p.wd <= 2.4 && !isTaken(p.x, p.z, 2.8));
        if (!cand.length) continue;
        const p = cand[(rnd() * cand.length) | 0];
        const ceil = ceilingAbove(cell, p.x, p.y, p.z);
        if (!ceil && tries < 20) continue;
        collapse(cell, E, p, ceil, out.collapses);
        (out.collapseAt = out.collapseAt || []).push([
          +p.x.toFixed(1),
          +p.y.toFixed(1),
          +p.z.toFixed(1),
          ceil ? +ceil.toFixed(1) : 0,
          +p.wa.toFixed(2),
        ]);
        taken.push({ x: p.x, z: p.z, r: 2.6 });
        out.collapses++;
      }
    }
    // 3. scatter
    const st = STYLES[cell.style] || STYLES.ruin;
    const dens = cell.density === undefined ? 1 : cell.density;
    const nearWallOnly = {
      pile: 1,
      bricks: 1,
      table: 1,
      crate: 1,
      tire: 1,
      barrel: 1,
      mattress: 1,
      desk: 1,
    };
    for (const p of pts) {
      if (isTaken(p.x, p.z, 0.3)) continue;
      const base =
        p.wd <= 0.45 ? 0.7 : p.wd <= 0.9 ? 0.45 : p.wd <= 1.5 ? 0.2 : 0.11;
      const pr = dens * base * (p.corner ? 1.5 : 1);
      if (p.wd > 1.5 && rnd() < 0.03 * dens && !isTaken(p.x, p.z, 1.6)) {
        EMIT.field(E, p);
        taken.push({ x: p.x, z: p.z, r: 1.4 });
        continue;
      }
      if (rnd() < pr) {
        let kind = pickW(p.wd > 1.5 && st.mid ? st.mid : st.items, rnd);
        if (nearWallOnly[kind] && p.wd > 0.9)
          kind = rnd() < 0.5 ? "papers" : "chair";
        if (kind === "table" && !p.corner) kind = "chair";
        if (EMIT[kind]) EMIT[kind](E, p);
      }
      // decals
      const dd =
        (cell.decals === undefined ? 1 : cell.decals) *
        (p.wd > 1.5 ? 0.1 : 0.07);
      if (rnd() < dd) {
        const kind = pickW(st.decals, rnd);
        const s =
          kind === "drag"
            ? 0.8
            : p.wd > 1.5
              ? 1.4 + rnd() * 1.8
              : 0.9 + rnd() * 1.4;
        E.decal(
          kind,
          p.x,
          p.y,
          p.z,
          rnd() * TAU,
          s,
          kind === "drag" ? 2 + rnd() : s,
        );
      }
      if (p.wd <= 0.45 && rnd() < 0.18 * Math.min(1.5, dens))
        E.decal(
          "drift",
          p.x - Math.sin(p.wa) * -0.05,
          p.y,
          p.z - Math.cos(p.wa) * -0.05,
          p.wa,
          1.6 + rnd() * 1.4,
          0.9 + rnd() * 0.5,
          0.75,
        );
    }
    out.pieces = E.n;
    // (vignette furniture stays non-colliding: a table dropped into a narrow corridor must never soft-lock a path)
    // 4. decal mesh
    if (E.decals.length && cell.root) {
      const n = E.decals.length,
        pos = new Float32Array(n * 12),
        uv = new Float32Array(n * 8),
        col = new Float32Array(n * 12),
        idx = new Uint32Array(n * 6);
      const gain = cell.decalGain || 1;
      E.decals.forEach((d, i) => {
        const c = Math.cos(d.yaw),
          s = Math.sin(d.yaw),
          hw = d.w / 2,
          hl = d.l / 2;
        // local u across (x), v along (z); for drift, v = 0 edge sits on the wall side (+wa direction)
        const corners = [
          [-hw, hl],
          [hw, hl],
          [hw, -hl],
          [-hw, -hl],
        ];
        const L = cell.lightAt
          ? cell.lightAt(d.x, d.y + 0.05, d.z)
          : [0.6, 0.6, 0.6];
        const u0 = (d.i % 4) * 0.25,
          v0 = 1 - Math.floor(d.i / 4) * 0.5;
        const UV = [
          [u0 + 0.002, v0 - 0.002],
          [u0 + 0.248, v0 - 0.002],
          [u0 + 0.248, v0 - 0.498],
          [u0 + 0.002, v0 - 0.498],
        ];
        corners.forEach((q, k) => {
          pos[i * 12 + k * 3] = d.x + q[0] * c + q[1] * s;
          pos[i * 12 + k * 3 + 1] = d.y;
          pos[i * 12 + k * 3 + 2] = d.z - q[0] * s + q[1] * c;
          uv[i * 8 + k * 2] = UV[k][0];
          uv[i * 8 + k * 2 + 1] = UV[k][1];
          for (let j = 0; j < 3; j++)
            col[i * 12 + k * 3 + j] = Math.min(1.4, L[j] * gain) * d.a;
        });
        const b = i * 4;
        idx.set([b, b + 2, b + 1, b, b + 3, b + 2], i * 6);
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      g.setIndex(new THREE.BufferAttribute(idx, 1));
      g.computeVertexNormals();
      g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, getDecalMat());
      mesh.name = "poi_decals_" + (cell.key || "");
      mesh.renderOrder = 1;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      cell.root.add(mesh);
      out.decals = n;
    }
    try {
      if (cell.adapter.finish) cell.adapter.finish();
    } catch (e) {
      G.reportError("poiClutter:finish", e);
    }
    out.ms = Math.round(performance.now() - t0);
    out.samples = pts.length;
    G.poiClutterStats = G.poiClutterStats || {};
    G.poiClutterStats[cell.key || "?"] = {
      at: out.collapseAt,
      pieces: out.pieces,
      decals: out.decals,
      collapses: out.collapses,
      vignettes: out.props.length,
      samples: pts.length,
      ms: out.ms,
    };
    return out;
  }

  /** Spawn the props / notes a run() returned (call at initDone, when props/items exist). */
  function spawn(res, noteSpawner) {
    const hp =
      !G.isStub("props") && G.props && typeof G.props.spawn === "function";
    for (const pr of (res && res.props) || []) {
      if (!hp) break;
      try {
        G.props.spawn(pr.type, pr.opts);
      } catch (e) {
        G.reportError("poiClutter:prop " + pr.type, e);
      }
    }
    for (const n of (res && res.notes) || []) {
      try {
        noteSpawner && noteSpawner(n);
      } catch (e) {
        G.reportError("poiClutter:note", e);
      }
    }
  }

  // ------------------------------------------------------------------
  // fill light: find the darkest walkable spots of a cell (before its builder bakes) and add a
  // readable pool of light there — a caged emergency lamp on the nearest wall, or a tripod work
  // light in the open — as baked light + emissive bulb + glow sprite (no runtime lights).
  // cell: {key, ox, oz, half, avoid, lum(x,y,z)→0..n, threshold, max, spacing, color,
  //        adapter:{add(role, geom, m), light(x,y,z,color,intensity,radius), glow(x,y,z,color,size)}}
  // ------------------------------------------------------------------
