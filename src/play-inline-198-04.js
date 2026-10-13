// play-inline-198 04 — papers
// Lines 340-688 of readable/play-inline-198.pretty.js (statement-aligned).
  const STYLES = {
    ruin: {
      items: {
        pile: 30,
        slab: 12,
        plank: 10,
        papers: 10,
        can: 5,
        bottle: 4,
        chair: 7,
        table: 3,
        rag: 4,
        bricks: 8,
        tiles: 2,
        scrap: 5,
        desk: 2,
        barrel: 2,
      },
      mid: {
        field: 6,
        slab: 8,
        plank: 8,
        papers: 6,
        chair: 6,
        scrap: 4,
        bricks: 3,
      },
      decals: {
        stain: 4,
        crack: 4,
        puddle: 2,
        blood: 1.5,
        scorch: 1,
        scraps: 2,
      },
    },
    office: {
      items: {
        papers: 30,
        tiles: 16,
        chair: 12,
        pile: 12,
        slab: 4,
        plank: 3,
        can: 4,
        binder: 8,
        bottle: 3,
        table: 2,
        desk: 7,
      },
      mid: { papers: 14, chair: 10, tiles: 8, field: 4, binder: 4, scrap: 1 },
      decals: { scraps: 6, stain: 4, crack: 2, blood: 1.5, puddle: 1 },
    },
    hotel: {
      items: {
        pile: 16,
        slab: 6,
        plank: 6,
        papers: 10,
        can: 7,
        bottle: 9,
        chair: 12,
        table: 4,
        rag: 8,
        tiles: 2,
        bricks: 2,
        mattress: 2,
        scrap: 2,
      },
      mid: {
        chair: 10,
        field: 5,
        slab: 5,
        plank: 5,
        papers: 6,
        rag: 4,
        bottle: 4,
      },
      decals: {
        stain: 5,
        crack: 3,
        puddle: 2,
        blood: 1,
        scraps: 2,
        scorch: 0.5,
      },
    },
    raider: {
      items: {
        can: 16,
        bottle: 14,
        pile: 14,
        rag: 8,
        plank: 8,
        papers: 4,
        chair: 6,
        tire: 5,
        casings: 8,
        bricks: 3,
        scrap: 10,
        barrel: 7,
        mattress: 7,
        crate: 5,
      },
      mid: {
        scrap: 8,
        field: 5,
        chair: 5,
        plank: 6,
        rag: 5,
        bottle: 5,
        can: 5,
        casings: 4,
        tire: 2,
      },
      decals: {
        blood: 5,
        scorch: 3,
        stain: 3,
        puddle: 2,
        drag: 1.5,
        scraps: 1,
      },
    },
    hospital: {
      items: {
        papers: 20,
        rag: 14,
        bottle: 12,
        pile: 12,
        tiles: 10,
        chair: 7,
        slab: 4,
        can: 3,
        binder: 5,
        mattress: 5,
        desk: 3,
        scrap: 2,
      },
      mid: {
        papers: 10,
        rag: 8,
        field: 4,
        chair: 6,
        tiles: 5,
        bottle: 4,
        scrap: 1,
      },
      decals: { blood: 5, drag: 2, stain: 4, puddle: 2, scraps: 3, crack: 1 },
    },
    bunker: {
      items: {
        pile: 18,
        can: 12,
        papers: 8,
        crate: 12,
        plank: 10,
        rag: 8,
        casings: 10,
        bottle: 6,
        bricks: 4,
        barrel: 6,
        scrap: 5,
        mattress: 3,
      },
      mid: {
        field: 5,
        plank: 5,
        papers: 4,
        casings: 6,
        scrap: 4,
        can: 4,
        rag: 3,
      },
      decals: { stain: 4, puddle: 3, blood: 2, scorch: 2, crack: 3 },
    },
    settled: {
      items: {
        can: 14,
        bottle: 12,
        rag: 9,
        papers: 8,
        crate: 10,
        pile: 10,
        plank: 8,
        chair: 5,
        tire: 2,
        barrel: 5,
        scrap: 5,
        mattress: 3,
      },
      mid: {
        can: 6,
        bottle: 6,
        rag: 5,
        papers: 5,
        plank: 4,
        chair: 3,
        scrap: 3,
      },
      decals: { stain: 4, puddle: 2, scraps: 3, crack: 2, scorch: 1 },
    },
  };
  function pickW(w, rnd) {
    let t = 0;
    for (const k in w) t += w[k];
    let v = rnd() * t;
    for (const k in w) {
      v -= w[k];
      if (v <= 0) return k;
    }
    return Object.keys(w)[0];
  }

  // ------------------------------------------------------------------
  // floor sampling
  // ------------------------------------------------------------------
  function sample(cell, rnd) {
    const W = G.world,
      half = cell.half || 150,
      ox = cell.ox,
      oz = cell.oz;
    const all = W.query(ox - half, oz - half, ox + half, oz + half);
    const floors = all.filter(
      (c) =>
        c.walkable !== false &&
        c.tag !== "poi_guard" &&
        c.tag !== "prop" &&
        c.tag !== "poi_clutter" &&
        Math.min(c.hx, c.hz) >= 0.8 &&
        c.hx * c.hz * 4 >= 4 &&
        c.cx > ox - half &&
        c.cx < ox + half &&
        c.cz > oz - half &&
        c.cz < oz + half,
    );
    const avoid = cell.avoid || [];
    const near = (x, z, y) => {
      for (const a of avoid) {
        const dx = x - a.x,
          dz = z - a.z;
        if (
          dx * dx + dz * dz < a.r * a.r &&
          (a.y === undefined || Math.abs(a.y - y) < 3)
        )
          return true;
      }
      return false;
    };
    const blocked = (x, z, y, pad, self) => {
      for (const c of W.query(x - 0.3, z - 0.3, x + 0.3, z + 0.3)) {
        if (c === self || c.tag === "poi_guard") continue;
        if (
          c.maxY > y + 0.05 &&
          c.minY < y + 1.8 &&
          W.pointInCollider(c, x, z, pad)
        )
          return true;
      }
      return false;
    };
    const DIRS = [];
    for (let i = 0; i < 8; i++)
      DIRS.push([Math.cos((i / 8) * TAU), Math.sin((i / 8) * TAU)]);
    const pts = [];
    const S = 0.8;
    for (const c of floors) {
      const y = c.maxY;
      const nx = Math.max(1, Math.floor((2 * c.hx) / S)),
        nz = Math.max(1, Math.floor((2 * c.hz) / S));
      for (let i = 0; i < nx; i++)
        for (let j = 0; j < nz; j++) {
          const lx = -c.hx + (i + 0.2 + rnd() * 0.6) * ((2 * c.hx) / nx),
            lz = -c.hz + (j + 0.2 + rnd() * 0.6) * ((2 * c.hz) / nz);
          const x = c.cx + lx * c.cos + lz * c.sin,
            z = c.cz - lx * c.sin + lz * c.cos;
          if (Math.abs(W.groundHeight(x, z, y + 0.3) - y) > 0.03) continue;
          if (near(x, z, y)) continue;
          if (blocked(x, z, y, 0.18, c)) continue;
          // stairs / platform edges nearby → skip
          let step = false;
          for (let k = 0; k < 8 && !step; k += 2) {
            const g = W.groundHeight(
              x + DIRS[k][0] * 0.55,
              z + DIRS[k][1] * 0.55,
              y + 0.6,
            );
            const d = g - y;
            if ((d > 0.07 && d < 0.6) || (d < -0.07 && d > -0.6)) step = true;
          }
          if (step) continue;
          // wall distance & direction
          let wd = 9,
            wa = 0,
            hits = 0;
          for (let k = 0; k < 8; k++) {
            for (const d of [0.45, 0.9, 1.5, 2.4]) {
              if (d >= wd && hits) break;
              const px = x + DIRS[k][0] * d,
                pz = z + DIRS[k][1] * d;
              const g = W.groundHeight(px, pz, y + 0.3);
              if (blocked(px, pz, y, 0.02, null) || g < y - 0.6) {
                if (d < wd) {
                  wd = d;
                  wa = Math.atan2(DIRS[k][0], DIRS[k][1]);
                }
                if (d <= 0.9) hits++;
                break;
              }
            }
          }
          pts.push({ x, y, z, wd, wa, corner: hits >= 3, c });
        }
    }
    return pts;
  }

  // ------------------------------------------------------------------
  // emitters
  // ------------------------------------------------------------------
  function Emitter(cell, rnd) {
    const A = cell.adapter;
    this.n = 0;
    this.put = (role, geo, m, o) => {
      try {
        A.add(role, geo.clone(), m, o || {});
        this.n++;
      } catch (e) {
        if (!this._err) {
          this._err = true;
          G.reportError("poiClutter:add", e);
        }
      }
    };
    this.decals = [];
    this.decal = (kind, x, y, z, yaw, w, l, a) =>
      this.decals.push({
        i: DECAL[kind],
        x,
        y: y + 0.012 + this.decals.length * 0.00002,
        z,
        yaw,
        w,
        l: l || w,
        a: a === undefined ? 1 : a,
      });
    this.rnd = rnd;
  }
  const ROCK_ROLES = ["concrete", "concrete", "plaster", "rubble"];
