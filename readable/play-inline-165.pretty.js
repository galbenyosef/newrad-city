/* src/poi_uptown/94_clutter_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI clutter & decay pass (shared by poi_uptown / poi_midtown / poi_village).
 *
 * Each of the three POI dirs carries an IDENTICAL copy of this file; the copy with the highest
 * VERSION defines G.poiClutter (so a fix made to one copy wins regardless of load order — bump
 * VERSION and copy the file to the other two dirs). Requested in NOTES: core/world should own a
 * single shared "interior dressing" utility; until then this is the canonical implementation.
 *
 * What it does (per interior cell, called once in init after the cell is built):
 *  1. Samples every walkable floor collider of the cell on a jittered 0.8 m grid and keeps points
 *     that are the top walkable surface, not under furniture, not on a stair and clear of doors,
 *     anchors and queued props. For every point it measures the distance/direction to the nearest
 *     wall (a blocking collider or a drop).
 *  2. Resolves authored "vignettes" (skeleton last stands, camps, barricades, lovers, blood trails)
 *     onto the nearest good wall spot to an anchor, emits their geometry and returns the prop/note
 *     spawns for the caller to place at initDone.
 *  3. Scatters post-Bombing decay weighted toward walls and corners: rubble piles, plaster and
 *     concrete slabs, planks, fallen ceiling tiles, papers and newspaper drifts, cans, bottles,
 *     rags, knocked-over chairs and tables, shell casings — by style ('ruin','office','hotel',
 *     'raider','hospital','bunker','settled').
 *  4. Collapses N ceiling sections in the largest halls: a black hole in the ceiling with a jagged
 *     rim, a still-attached hanging slab, dangling rebar and lath, and a walkable rubble mound
 *     (two stepped walkable colliders, tag 'poi_clutter') with leaning slabs below.
 *  5. Floor decals (blood splats & drag trails, scorch, water stains, puddles, cracks, paper scraps,
 *     dirt drifts along walls) from one procedural atlas → ONE transparent mesh per cell.
 *
 * All solid geometry goes through the calling kit's own builder (adapter.add(role, geom, matrix))
 * so it gets the kit's materials and baked interior light and merges per material
 * (≈ +6–9 draw calls per cell, only while the player is inside it).
 *
 * G.poiClutter.run(cell) → {pieces, decals, collapses, props:[{type,opts}], notes:[{x,y,z,note}], ms}
 * cell: {key, ox, oz, half=150, seed, style, density=1, decals=1, collapses=0,
 *        avoid:[{x,z,r,y?}], vignettes:[{kind, at:{x,y,z}, r, note?, pose?}],
 *        adapter:{add(role, geom, worldMatrix, o), finish()}, lightAt(x,y,z)→[r,g,b], root, decalGain,
 *        ceilMeshes: Object3D (meshes to ray-cast for the ceiling; default root)}
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const VERSION = 1;
  if (G.poiClutter && (G.poiClutter.version || 0) >= VERSION) return;

  const TAU = Math.PI * 2;
  const U = () => G.util;

  // ------------------------------------------------------------------
  // unit geometries (cloned per use — kit builders may consume them)
  // ------------------------------------------------------------------
  const GEO = {};
  function rockGeo(v) {
    const k = "rock" + v;
    if (GEO[k]) return GEO[k];
    const g = new THREE.IcosahedronGeometry(0.5, 0);
    const p = g.attributes.position,
      r = U().rng(911 + v * 37);
    // weld-free jitter: identical positions get identical offsets (keyed by rounded position)
    const off = new Map();
    for (let i = 0; i < p.count; i++) {
      const key =
        Math.round(p.getX(i) * 100) +
        "," +
        Math.round(p.getY(i) * 100) +
        "," +
        Math.round(p.getZ(i) * 100);
      let o = off.get(key);
      if (!o) {
        o = 0.72 + r() * 0.5;
        off.set(key, o);
      }
      p.setXYZ(i, p.getX(i) * o, p.getY(i) * o, p.getZ(i) * o);
    }
    g.computeVertexNormals();
    return (GEO[k] = g);
  }
  const box = () => GEO.box || (GEO.box = new THREE.BoxGeometry(1, 1, 1));
  const plane = () =>
    GEO.plane ||
    (GEO.plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)); // faces +Y
  const planeDown = () =>
    GEO.planeD ||
    (GEO.planeD = new THREE.PlaneGeometry(1, 1).rotateX(Math.PI / 2)); // faces -Y
  const cyl = () =>
    GEO.cyl || (GEO.cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 7, 1));
  const bottle = () =>
    GEO.bottle ||
    (GEO.bottle = new THREE.LatheGeometry(
      [
        [0.001, 0],
        [0.5, 0],
        [0.5, 0.62],
        [0.2, 0.8],
        [0.17, 1],
        [0.001, 1],
      ].map((q) => new THREE.Vector2(q[0], q[1])),
      7,
    ));
  function holeGeo(seed) {
    const k = "hole" + seed;
    if (GEO[k]) return GEO[k];
    const r = U().rng(4441 + seed),
      n = 14,
      pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU,
        rr = 0.36 + r() * 0.16;
      pts.push(new THREE.Vector2(Math.cos(a) * rr, Math.sin(a) * rr));
    }
    const g = new THREE.ShapeGeometry(new THREE.Shape(pts)).rotateX(
      Math.PI / 2,
    ); // normal −Y (seen from below)
    return (GEO[k] = g);
  }
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _p = new THREE.Vector3(),
    _s = new THREE.Vector3();
  function M(x, y, z, rx, ry, rz, sx, sy, sz) {
    _e.set(rx || 0, ry || 0, rz || 0, "YXZ");
    _q.setFromEuler(_e);
    return new THREE.Matrix4().compose(
      _p.set(x, y, z),
      _q,
      _s.set(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz),
    );
  }

  // ------------------------------------------------------------------
  // decal atlas: 4×2 cells (256²): 0 blood, 1 drag trail, 2 scorch, 3 stain, 4 puddle, 5 cracks, 6 scraps, 7 drift
  // ------------------------------------------------------------------
  let decalMat = null;
  function getDecalMat() {
    if (decalMat) return decalMat;
    const W = 1024,
      H = 512,
      C = 256;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const x = cv.getContext("2d");
    const r = U().rng(77);
    const blob = (cx, cy, rad, col, a) => {
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, col + a + ")");
      g.addColorStop(1, col + "0)");
      x.fillStyle = g;
      x.beginPath();
      x.arc(cx, cy, rad, 0, TAU);
      x.fill();
    };
    const cell = (i, fn) => {
      const ox = (i % 4) * C,
        oy = Math.floor(i / 4) * C;
      x.save();
      x.beginPath();
      x.rect(ox, oy, C, C);
      x.clip();
      x.translate(ox, oy);
      fn();
      x.restore();
    };
    // 0 blood splat
    cell(0, () => {
      for (let k = 0; k < 14; k++)
        blob(
          128 + (r() - 0.5) * 70,
          128 + (r() - 0.5) * 70,
          18 + r() * 42,
          "rgba(70,6,4,",
          0.55 + r() * 0.35,
        );
      x.fillStyle = "rgba(55,4,3,0.85)";
      for (let k = 0; k < 40; k++) {
        const a = r() * TAU,
          d = 50 + r() * 70;
        x.beginPath();
        x.arc(
          128 + Math.cos(a) * d,
          128 + Math.sin(a) * d,
          1 + r() * 5,
          0,
          TAU,
        );
        x.fill();
      }
      for (let k = 0; k < 7; k++) {
        const a = r() * TAU;
        x.strokeStyle = "rgba(60,5,3,0.7)";
        x.lineWidth = 2 + r() * 4;
        x.beginPath();
        x.moveTo(128, 128);
        x.lineTo(
          128 + Math.cos(a) * (70 + r() * 50),
          128 + Math.sin(a) * (70 + r() * 50),
        );
        x.stroke();
      }
    });
    // 1 drag trail (runs along v)
    cell(1, () => {
      for (let y = 8; y < 248; y += 3) {
        const w = 26 + Math.sin(y * 0.05) * 8 + r() * 10,
          a = 0.25 + 0.5 * (1 - y / 256) + r() * 0.15;
        x.fillStyle = "rgba(62,6,4," + a.toFixed(2) + ")";
        for (let s = 0; s < 3; s++)
          x.fillRect(
            128 - w / 2 + (r() - 0.5) * 16 + s * 9 - 9,
            y,
            5 + r() * 7,
            4,
          );
      }
      blob(128, 30, 40, "rgba(58,5,3,", 0.8);
    });
    // 2 scorch
    cell(2, () => {
      blob(128, 128, 120, "rgba(8,6,5,", 0.9);
      for (let k = 0; k < 12; k++)
        blob(
          128 + (r() - 0.5) * 120,
          128 + (r() - 0.5) * 120,
          20 + r() * 30,
          "rgba(20,14,10,",
          0.5,
        );
    });
    // 3 water / grime stain (ring)
    cell(3, () => {
      blob(128, 128, 118, "rgba(48,40,26,", 0.45);
      x.strokeStyle = "rgba(40,30,18,0.35)";
      for (let k = 0; k < 4; k++) {
        x.lineWidth = 3 + r() * 6;
        x.beginPath();
        x.ellipse(
          128,
          128,
          70 + k * 12 + r() * 6,
          60 + k * 11 + r() * 6,
          r(),
          0,
          TAU,
        );
        x.stroke();
      }
    });
    // 4 dark puddle (irregular)
    cell(4, () => {
      for (let k = 0; k < 10; k++)
        blob(
          128 + (r() - 0.5) * 110,
          128 + (r() - 0.5) * 80,
          30 + r() * 50,
          "rgba(14,16,12,",
          0.75,
        );
    });
    // 5 cracks
    cell(5, () => {
      x.strokeStyle = "rgba(12,10,8,0.85)";
      const crack = (px, py, a, len, w) => {
        if (len < 8 || w < 0.4) return;
        x.lineWidth = w;
        x.beginPath();
        x.moveTo(px, py);
        const nx = px + Math.cos(a) * len,
          ny = py + Math.sin(a) * len;
        x.lineTo(nx, ny);
        x.stroke();
        crack(nx, ny, a + (r() - 0.5) * 1.1, len * 0.7, w * 0.75);
        if (r() < 0.45)
          crack(nx, ny, a + (r() - 0.5) * 2.4, len * 0.5, w * 0.55);
      };
      for (let k = 0; k < 5; k++)
        crack(128, 128, r() * TAU, 30 + r() * 20, 3.5);
    });
    // 6 paper scraps / confetti of litter
    cell(6, () => {
      for (let k = 0; k < 26; k++) {
        x.save();
        x.translate(20 + r() * 216, 20 + r() * 216);
        x.rotate(r() * TAU);
        const t = 150 + r() * 70;
        x.fillStyle =
          "rgba(" +
          (t | 0) +
          "," +
          ((t * 0.94) | 0) +
          "," +
          ((t * 0.78) | 0) +
          ",0.95)";
        x.fillRect(-10 - r() * 10, -7 - r() * 8, 18 + r() * 18, 12 + r() * 14);
        x.restore();
      }
    });
    // 7 dirt drift (dense at v=0 edge = the wall side)
    cell(7, () => {
      for (let y = 0; y < 256; y += 2) {
        const a = Math.pow(1 - y / 256, 1.6) * 0.8;
        x.fillStyle = "rgba(52,44,32," + a.toFixed(3) + ")";
        x.fillRect(0, y, 256, 2);
      }
      for (let k = 0; k < 400; k++) {
        x.fillStyle = "rgba(30,26,20," + (r() * 0.6).toFixed(2) + ")";
        const yy = Math.pow(r(), 2) * 160;
        x.fillRect(r() * 256, yy, 2 + r() * 4, 2 + r() * 3);
      }
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace || tex.colorSpace;
    tex.anisotropy = 4;
    decalMat = new THREE.MeshBasicMaterial({
      map: tex,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    decalMat.userData.shared = true;
    return decalMat;
  }
  const DECAL = {
    blood: 0,
    drag: 1,
    scorch: 2,
    stain: 3,
    puddle: 4,
    crack: 5,
    scraps: 6,
    drift: 7,
  };

  // ------------------------------------------------------------------
  // styles: item weights + decal weights
  // ------------------------------------------------------------------
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
  const EMIT = {
    pile(E, p) {
      const r = E.rnd,
        R = 0.45 + r() * 0.85,
        n = 7 + ((r() * 8 + R * 10) | 0);
      const ox = p.x + Math.sin(p.wa) * Math.max(0, p.wd - R * 0.8),
        oz = p.z + Math.cos(p.wa) * Math.max(0, p.wd - R * 0.8);
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          d = Math.sqrt(r()) * R,
          s = 0.12 + r() * 0.34 * (1 - (d / R) * 0.5);
        E.put(
          ROCK_ROLES[(r() * 4) | 0],
          rockGeo((r() * 5) | 0),
          M(
            ox + Math.cos(a) * d,
            p.y + s * 0.18 + (1 - d / R) * R * 0.3,
            oz + Math.sin(a) * d,
            r() * 3,
            r() * 6,
            r() * 3,
            s,
            s * (0.5 + r() * 0.4),
            s,
          ),
        );
      }
      if (r() < 0.5) EMIT.slab(E, { x: ox, y: p.y, z: oz, wa: p.wa, wd: 0 });
      E.decal(
        "drift",
        ox - Math.sin(p.wa) * 0.2,
        p.y,
        oz - Math.cos(p.wa) * 0.2,
        p.wa,
        R * 2.8,
        R * 2.2,
        0.8,
      );
    },
    bricks(E, p) {
      const r = E.rnd,
        n = 4 + ((r() * 7) | 0);
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          d = r() * 0.5;
        E.put(
          "brick",
          box(),
          M(
            p.x + Math.cos(a) * d,
            p.y + 0.035 + (i > 4 ? 0.07 : 0),
            p.z + Math.sin(a) * d,
            r() < 0.3 ? r() * 0.6 : 0,
            r() * 6,
            0,
            0.21,
            0.065,
            0.1,
          ),
        );
      }
    },
    slab(E, p) {
      const r = E.rnd,
        w = 0.5 + r() * 1.0,
        d = 0.4 + r() * 0.7,
        t = 0.05 + r() * 0.07,
        tilt = 0.12 + r() * 0.5;
      E.put(
        r() < 0.5 ? "plaster" : "concrete",
        box(),
        M(
          p.x,
          p.y + Math.sin(tilt) * d * 0.5 + t * 0.5,
          p.z,
          tilt,
          p.wa + (r() - 0.5) * 1.2,
          (r() - 0.5) * 0.2,
          w,
          t,
          d,
        ),
      );
    },
    plank(E, p) {
      const r = E.rnd,
        L = 0.8 + r() * 1.6,
        tilt = r() < 0.4 ? 0.15 + r() * 0.35 : 0.02;
      E.put(
        "wood",
        box(),
        M(
          p.x,
          p.y + 0.03 + Math.sin(tilt) * L * 0.5,
          p.z,
          0,
          r() * TAU,
          tilt,
          L,
          0.03,
          0.12 + r() * 0.08,
        ),
      );
      if (r() < 0.5)
        E.put(
          "wood",
          box(),
          M(
            p.x + (r() - 0.5) * 0.6,
            p.y + 0.045,
            p.z + (r() - 0.5) * 0.6,
            0,
            r() * TAU,
            0,
            0.6 + r() * 0.8,
            0.03,
            0.1,
          ),
        );
    },
    papers(E, p) {
      const r = E.rnd,
        n = 3 + ((r() * 8) | 0);
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          d = r() * 0.8;
        E.put(
          "paper",
          plane(),
          M(
            p.x + Math.cos(a) * d,
            p.y + 0.006 + i * 0.002,
            p.z + Math.sin(a) * d,
            (r() - 0.5) * 0.1,
            r() * TAU,
            (r() - 0.5) * 0.1,
            r() < 0.2 ? 0.42 : 0.22,
            1,
            r() < 0.2 ? 0.58 : 0.29,
          ),
        );
      }
      if (r() < 0.5)
        E.decal("scraps", p.x, p.y, p.z, r() * TAU, 1.2 + r() * 0.8);
    },
    binder(E, p) {
      const r = E.rnd;
      for (let i = 0; i < 1 + ((r() * 3) | 0); i++)
        E.put(
          "dark",
          box(),
          M(
            p.x + (r() - 0.5) * 0.5,
            p.y + 0.02 + i * 0.04,
            p.z + (r() - 0.5) * 0.5,
            0,
            r() * TAU,
            0,
            0.3,
            0.04,
            0.24,
          ),
        );
      EMIT.papers(E, p);
    },
    tiles(E, p) {
      const r = E.rnd,
        n = 2 + ((r() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const tilt = r() < 0.4 ? 0.2 + r() * 0.4 : 0.03;
        E.put(
          "tile",
          box(),
          M(
            p.x + (r() - 0.5) * 1.4,
            p.y + 0.015 + i * 0.02 + Math.sin(tilt) * 0.3,
            p.z + (r() - 0.5) * 1.4,
            tilt,
            r() * TAU,
            (r() - 0.5) * 0.1,
            0.6 - r() * 0.2,
            0.02,
            0.6 - r() * 0.25,
          ),
        );
      }
    },
    can(E, p) {
      const r = E.rnd,
        n = 1 + ((r() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const lying = r() < 0.7;
        E.put(
          "metal",
          cyl(),
          M(
            p.x + (r() - 0.5) * 0.7,
            p.y + (lying ? 0.034 : 0.06),
            p.z + (r() - 0.5) * 0.7,
            lying ? Math.PI / 2 : 0,
            r() * TAU,
            0,
            0.068,
            0.12,
            0.068,
          ),
        );
      }
    },
    bottle(E, p) {
      const r = E.rnd,
        n = 1 + ((r() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const lying = r() < 0.6;
        E.put(
          "glass",
          bottle(),
          M(
            p.x + (r() - 0.5) * 0.6,
            p.y + (lying ? 0.035 : 0),
            p.z + (r() - 0.5) * 0.6,
            lying ? Math.PI / 2 : 0,
            r() * TAU,
            0,
            0.07,
            0.27,
            0.07,
          ),
        );
      }
    },
    rag(E, p) {
      const r = E.rnd;
      E.put(
        "fabric",
        rockGeo((r() * 5) | 0),
        M(
          p.x,
          p.y + 0.03,
          p.z,
          0,
          r() * TAU,
          0,
          0.5 + r() * 0.4,
          0.07,
          0.4 + r() * 0.3,
        ),
      );
    },
    field(E, p) {
      // a loose spray of debris in the open floor: chunks, a plank or two, papers, a stain under it
      const r = E.rnd,
        R = 1.2 + r() * 1.4,
        n = 6 + ((r() * 10) | 0);
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          d = Math.sqrt(r()) * R,
          s = 0.06 + r() * 0.2;
        E.put(
          ROCK_ROLES[(r() * 4) | 0],
          rockGeo((r() * 5) | 0),
          M(
            p.x + Math.cos(a) * d,
            p.y + s * 0.2,
            p.z + Math.sin(a) * d,
            r() * 3,
            r() * 6,
            r() * 3,
            s,
            s * 0.6,
            s,
          ),
        );
      }
      if (r() < 0.6) EMIT.plank(E, p);
      if (r() < 0.6)
        EMIT.papers(E, {
          x: p.x + (r() - 0.5) * R,
          y: p.y,
          z: p.z + (r() - 0.5) * R,
        });
      E.decal(
        r() < 0.5 ? "stain" : "crack",
        p.x,
        p.y,
        p.z,
        r() * TAU,
        R * 2,
        R * 1.7,
        0.8,
      );
    },
    scrap(E, p) {
      // a sheet of corrugated scrap / sign panel, lying or propped against the wall
      const r = E.rnd,
        w = 0.9 + r() * 0.7,
        L = 1.4 + r() * 1.0;
      if (p.wd <= 0.9 && r() < 0.6) {
        const lean = 0.25 + r() * 0.25,
          bx = p.x + Math.sin(p.wa) * (p.wd - L * Math.sin(lean) * 0.5 - 0.05),
          bz = p.z + Math.cos(p.wa) * (p.wd - L * Math.sin(lean) * 0.5 - 0.05);
        E.put(
          "sheet",
          box(),
          M(
            bx,
            p.y + Math.cos(lean) * L * 0.5,
            bz,
            -lean,
            p.wa,
            0,
            w,
            L,
            0.025,
          ),
        );
      } else
        E.put(
          "sheet",
          box(),
          M(
            p.x,
            p.y + 0.03,
            p.z,
            (r() - 0.5) * 0.12,
            r() * TAU,
            (r() - 0.5) * 0.12,
            w,
            0.02,
            L,
          ),
        );
    },
    barrel(E, p) {
      const r = E.rnd,
        tip = r() < 0.35;
      E.put(
        "metal",
        cyl(),
        M(
          p.x,
          p.y + (tip ? 0.29 : 0.45),
          p.z,
          tip ? Math.PI / 2 : 0,
          r() * TAU,
          0,
          0.58,
          0.9,
          0.58,
        ),
      );
      if (!tip && r() < 0.4)
        E.put(
          "dark",
          cyl(),
          M(p.x, p.y + 0.905, p.z, 0, 0, 0, 0.54, 0.01, 0.54),
        );
    },
    mattress(E, p) {
      const r = E.rnd,
        yaw = p.wa + Math.PI / 2 + (r() - 0.5) * 0.3;
      E.put(
        "fabric",
        box(),
        M(p.x, p.y + 0.09, p.z, (r() - 0.5) * 0.04, yaw, 0, 1.9, 0.18, 0.9),
      );
      if (r() < 0.6)
        E.put(
          "fabric",
          rockGeo((r() * 5) | 0),
          M(
            p.x + (r() - 0.5) * 0.6,
            p.y + 0.22,
            p.z + (r() - 0.5) * 0.3,
            0,
            r() * TAU,
            0,
            0.9,
            0.12,
            0.6,
          ),
        );
      if (r() < 0.5)
        EMIT.can(E, {
          x: p.x + Math.sin(p.wa + Math.PI) * 0.8,
          y: p.y,
          z: p.z + Math.cos(p.wa + Math.PI) * 0.8,
        });
    },
    desk(E, p) {
      // office desk shoved over on its back / side, drawers spilled
      const r = E.rnd,
        yaw = p.wa + (r() - 0.5) * 0.6;
      const T = new THREE.Matrix4().compose(
        _p.set(p.x, p.y, p.z),
        _q.setFromEuler(_e.set(0, yaw, 0, "YXZ")),
        _s.set(1, 1, 1),
      );
      const put = (role, lx, ly, lz, sw, sh, sd) =>
        E.put(
          role,
          box(),
          T.clone().multiply(M(lx, ly, lz, 0, 0, 0, sw, sh, sd)),
        );
      put("wood", 0, 0.38, 0, 1.4, 0.76, 0.05);
      put("wood", -0.62, 0.38, 0.35, 0.05, 0.76, 0.7);
      put("wood", 0.62, 0.38, 0.35, 0.05, 0.76, 0.7);
      put("wood", 0.3, 0.02, -0.5, 0.4, 0.04, 0.5);
      EMIT.papers(E, {
        x: p.x + Math.sin(yaw + Math.PI) * 0.9,
        y: p.y,
        z: p.z + Math.cos(yaw + Math.PI) * 0.9,
      });
    },
    tire(E, p) {
      const r = E.rnd;
      const g =
        GEO.tire || (GEO.tire = new THREE.TorusGeometry(0.3, 0.1, 6, 12));
      E.put(
        "dark",
        g,
        M(
          p.x,
          p.y + 0.1,
          p.z,
          Math.PI / 2 + (r() - 0.5) * 0.2,
          r() * TAU,
          0,
          1,
        ),
      );
    },
    crate(E, p) {
      const r = E.rnd,
        s = 0.4 + r() * 0.25;
      E.put(
        "wood",
        box(),
        M(p.x, p.y + s / 2, p.z, 0, p.wa + (r() - 0.5) * 0.4, 0, s, s, s),
      );
      if (r() < 0.4)
        E.put(
          "wood",
          box(),
          M(
            p.x + (r() - 0.5) * 0.1,
            p.y + s + s * 0.4,
            p.z,
            0,
            r() * TAU,
            0,
            s * 0.8,
            s * 0.8,
            s * 0.8,
          ),
        );
    },
    casings(E, p) {
      const r = E.rnd,
        n = 6 + ((r() * 14) | 0);
      for (let i = 0; i < n; i++)
        E.put(
          "brass",
          cyl(),
          M(
            p.x + (r() - 0.5) * 1.2,
            p.y + 0.006,
            p.z + (r() - 0.5) * 1.2,
            Math.PI / 2,
            r() * TAU,
            0,
            0.012,
            0.03,
            0.012,
          ),
        );
    },
    chair(E, p) {
      // knocked-over wooden chair: seat, back, 4 legs (one snapped off)
      const r = E.rnd,
        yaw = r() * TAU,
        lie = r() < 0.7;
      const T = new THREE.Matrix4().compose(
        _p.set(p.x, p.y, p.z),
        _q.setFromEuler(_e.set(0, yaw, 0, "YXZ")),
        _s.set(1, 1, 1),
      );
      if (lie)
        T.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2)).multiply(
          new THREE.Matrix4().makeTranslation(0, 0.02, -0.02),
        );
      const put = (lx, ly, lz, w, h, d, rx) =>
        E.put(
          "wood",
          box(),
          T.clone().multiply(M(lx, ly, lz, rx || 0, 0, 0, w, h, d)),
        );
      put(0, 0.45, 0, 0.44, 0.04, 0.42);
      put(0, 0.72, 0.2, 0.44, 0.5, 0.03, -0.08);
      const skip = (r() * 5) | 0;
      [
        [-0.19, -0.18],
        [0.19, -0.18],
        [-0.19, 0.18],
        [0.19, 0.18],
      ].forEach((q, i) => {
        if (i !== skip) put(q[0], 0.22, q[1], 0.035, 0.45, 0.035);
      });
    },
    table(E, p) {
      // overturned table on its side, top facing the room (only in corners/near walls)
      const r = E.rnd,
        yaw = p.wa + Math.PI + (r() - 0.5) * 0.5,
        w = 1.0 + r() * 0.5;
      const T = new THREE.Matrix4().compose(
        _p.set(p.x, p.y, p.z),
        _q.setFromEuler(_e.set(0, yaw, 0, "YXZ")),
        _s.set(1, 1, 1),
      );
      const put = (lx, ly, lz, sw, sh, sd) =>
        E.put(
          "wood",
          box(),
          T.clone().multiply(M(lx, ly, lz, 0, 0, 0, sw, sh, sd)),
        );
      put(0, 0.4, 0, w, 0.8, 0.05);
      for (const sx of [-1, 1])
        for (const sy of [0.12, 0.68])
          put(sx * (w / 2 - 0.08), sy, 0.36, 0.05, 0.05, 0.7);
    },
  };

  // ------------------------------------------------------------------
  // collapsed ceiling
  // ------------------------------------------------------------------
  const _ray = new THREE.Raycaster();
  function ceilingAbove(cell, x, y, z) {
    const root = cell.ceilMeshes || cell.root;
    if (!root) return null;
    root.updateMatrixWorld(true);
    const meshes = [];
    root.traverse((o) => {
      if (!o.isMesh || !o.geometry || (o.material && o.material.transparent))
        return;
      const g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      const b = g.boundingBox; // kit meshes carry identity transforms (world-space vertices)
      if (
        x < b.min.x ||
        x > b.max.x ||
        z < b.min.z ||
        z > b.max.z ||
        b.max.y < y + 2
      )
        return;
      meshes.push(o);
    });
    _ray.set(new THREE.Vector3(x, y + 0.6, z), new THREE.Vector3(0, 1, 0));
    _ray.far = 16;
    const hits = _ray.intersectObjects(meshes, false);
    for (const h of hits) {
      if (h.distance < 1.8) return null;
      if (h.face && h.face.normal.y < -0.5) return y + 0.6 + h.distance;
      return null;
    }
    return null;
  }
  function collapse(cell, E, p, ceil, idx) {
    const r = E.rnd,
      W = G.world;
    const R = 1.3 + r() * 1.1,
      H = Math.min(1.5, 0.8 + R * 0.3),
      y = p.y,
      cx = p.x,
      cz = p.z;
    // mound
    const n = Math.round(26 + R * 16);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = Math.pow(r(), 0.7) * R,
        h = H * Math.pow(Math.max(0, 1 - d / R), 1.1);
      const s = 0.14 + r() * 0.34 * (0.5 + d / R);
      E.put(
        ROCK_ROLES[(r() * 4) | 0],
        rockGeo((r() * 5) | 0),
        M(
          cx + Math.cos(a) * d,
          y + Math.max(s * 0.2, h - s * 0.25),
          cz + Math.sin(a) * d,
          r() * 3,
          r() * 6,
          r() * 3,
          s,
          s * (0.55 + r() * 0.35),
          s,
        ),
      );
    }
    // leaning slabs (fallen ceiling)
    for (let i = 0; i < 3 + ((r() * 3) | 0); i++) {
      const a = r() * TAU,
        d = R * (0.35 + r() * 0.6),
        tilt = 0.35 + r() * 0.6,
        w = 0.9 + r() * 1.0,
        L = 0.8 + r() * 0.9;
      E.put(
        r() < 0.6 ? "concrete" : "plaster",
        box(),
        M(
          cx + Math.cos(a) * d,
          y + H * 0.35 + Math.sin(tilt) * L * 0.3,
          cz + Math.sin(a) * d,
          tilt,
          Math.atan2(Math.cos(a), Math.sin(a)) + Math.PI,
          (r() - 0.5) * 0.3,
          w,
          0.1 + r() * 0.06,
          L,
        ),
      );
    }
    // rebar sticking out of the mound
    for (let i = 0; i < 6 + ((r() * 5) | 0); i++) {
      const a = r() * TAU,
        d = r() * R * 0.7,
        L = 0.7 + r() * 1.3;
      E.put(
        "metal",
        cyl(),
        M(
          cx + Math.cos(a) * d,
          y + H * (1 - d / R) * 0.7 + L * 0.35,
          cz + Math.sin(a) * d,
          (r() - 0.5) * 1.6,
          r() * TAU,
          (r() - 0.5) * 1.6,
          0.024,
          L,
          0.024,
        ),
      );
    }
    for (let i = 0; i < 4; i++)
      EMIT.plank(E, {
        x: cx + (r() - 0.5) * R * 1.6,
        y: y + 0.05,
        z: cz + (r() - 0.5) * R * 1.6,
        wa: 0,
        wd: 9,
      });
    // dust fan around it
    E.decal("stain", cx, y, cz, r() * TAU, R * 3.4, R * 3.0, 0.9);
    E.decal("scraps", cx + R, y, cz - R * 0.5, r() * TAU, 1.4);
    // colliders: two walkable steps so the mound is climbable and never blocks a path
    W.addCollider(
      cx,
      cz,
      R * 1.15,
      R * 1.15,
      y - 0.2,
      y + Math.min(0.42, H * 0.35),
      r() * TAU,
      { tag: "poi_clutter", surface: "rubble" },
    );
    W.addCollider(
      cx,
      cz,
      R * 0.6,
      R * 0.6,
      y - 0.2,
      y + Math.min(0.84, H * 0.7),
      r() * TAU,
      { tag: "poi_clutter", surface: "rubble" },
    );
    // the hole in the ceiling (+ jagged rim, a hanging slab, lath & rebar)
    if (ceil) {
      const hr = R * 1.05,
        yc = ceil - 0.015;
      E.put(
        "dark",
        holeGeo(idx % 4),
        M(cx, yc, cz, 0, r() * TAU, 0, hr * 2, 1, hr * 2),
      );
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + r() * 0.3,
          d = hr * (0.72 + r() * 0.2);
        E.put(
          r() < 0.5 ? "plaster" : "concrete",
          box(),
          M(
            cx + Math.cos(a) * d,
            yc - 0.08 - r() * 0.12,
            cz + Math.sin(a) * d,
            (r() - 0.5) * 0.8,
            -a,
            (r() - 0.5) * 0.8,
            0.3 + r() * 0.4,
            0.07,
            0.2 + r() * 0.2,
          ),
        );
      }
      const ha = r() * TAU,
        hl = Math.min(ceil - y - 1.2, 1.3 + r() * 0.8);
      E.put(
        "concrete",
        box(),
        M(
          cx + Math.cos(ha) * hr * 0.55,
          yc - Math.sin(1.05) * hl * 0.5,
          cz + Math.sin(ha) * hr * 0.55,
          1.05,
          Math.atan2(Math.cos(ha), Math.sin(ha)),
          0,
          1.2,
          0.1,
          hl,
        ),
      );
      for (let i = 0; i < 7; i++) {
        const a = r() * TAU,
          d = hr * (0.5 + r() * 0.4),
          L = 0.4 + r() * 1.2;
        E.put(
          r() < 0.4 ? "wood" : "metal",
          r() < 0.4 ? box() : cyl(),
          M(
            cx + Math.cos(a) * d,
            yc - L / 2,
            cz + Math.sin(a) * d,
            (r() - 0.5) * 0.5,
            0,
            (r() - 0.5) * 0.5,
            r() < 0.4 ? 0.04 : 0.02,
            L,
            r() < 0.4 ? 0.02 : 0.02,
          ),
        );
      }
    }
  }

  // ------------------------------------------------------------------
  // vignettes (environmental stories)
  // ------------------------------------------------------------------
  function vignette(E, v, p, out) {
    const r = E.rnd,
      face = p.wa + Math.PI; // facing away from the wall, into the room
    const fx = Math.sin(face),
      fz = Math.cos(face);
    const at = (d, side) => ({
      x: p.x + fx * d + Math.cos(face) * (side || 0),
      z: p.z + fz * d - Math.sin(face) * (side || 0),
    });
    const wallBack = Math.max(0, p.wd - 0.35);
    const base = {
      x: p.x + Math.sin(p.wa) * wallBack,
      y: p.y,
      z: p.z + Math.cos(p.wa) * wallBack,
    };
    const prop = (type, x, z, yaw, o) =>
      out.props.push({
        type,
        opts: Object.assign({ x, y: p.y, z, yaw, collide: false }, o || {}),
      });
    const note = (x, z) => {
      if (v.note) out.notes.push({ x, y: p.y + 0.02, z, note: v.note });
    };
    const k = v.kind;
    if (k === "last_stand") {
      prop("skeleton", base.x + fx * 0.15, base.z + fz * 0.15, face + Math.PI, {
        pose: "sitting",
      });
      const b = at(1.3);
      EMIT.table(E, { x: b.x, y: p.y, z: b.z, wa: p.wa + Math.PI, wd: 0 });
      out.cols.push({
        x: b.x,
        z: b.z,
        w: 1.3,
        d: 0.3,
        yaw: face,
        h: 0.85,
        y: p.y,
      });
      const c = at(1.0, 1.0);
      EMIT.chair(E, { x: c.x, y: p.y, z: c.z });
      EMIT.casings(E, { x: base.x + fx * 0.8, y: p.y, z: base.z + fz * 0.8 });
      E.decal(
        "blood",
        base.x + fx * 0.5,
        p.y,
        base.z + fz * 0.5,
        r() * TAU,
        1.3,
      );
      const n = at(0.6, -0.6);
      note(n.x, n.z);
    } else if (k === "camp") {
      const m = at(0.7, -0.4);
      E.put(
        "fabric",
        box(),
        M(m.x, p.y + 0.09, m.z, 0, face + Math.PI / 2, 0, 1.9, 0.18, 0.85),
      );
      E.put(
        "fabric",
        rockGeo(2),
        M(m.x + 0.2, p.y + 0.2, m.z, 0, face, 0, 0.9, 0.14, 0.6),
      );
      const f = at(1.9, 0.5);
      prop("campfire", f.x, f.z, 0, { pot: true, collide: true });
      const cr = at(0.5, 1.2);
      EMIT.crate(E, { x: cr.x, y: p.y, z: cr.z, wa: p.wa });
      EMIT.can(E, { x: f.x + 0.5, y: p.y, z: f.z + 0.3 });
      EMIT.can(E, { x: f.x - 0.4, y: p.y, z: f.z - 0.5 });
      EMIT.bottle(E, { x: m.x, y: p.y, z: m.z });
      E.decal("scorch", f.x, p.y, f.z, r() * TAU, 1.6);
      if (v.dead)
        prop("skeleton", m.x, m.z, face + Math.PI / 2, {
          pose: "curled",
          y: p.y + 0.18,
        });
      const n = at(0.4, 0.4);
      note(n.x, n.z);
    } else if (k === "lovers") {
      const a = at(0.6, -0.3),
        b = at(0.6, 0.35);
      prop("skeleton", a.x, a.z, face + Math.PI / 2, { pose: "lying" });
      prop("skeleton", b.x, b.z, face + Math.PI / 2 + 0.15, { pose: "curled" });
      E.decal("stain", (a.x + b.x) / 2, p.y, (a.z + b.z) / 2, r() * TAU, 2.2);
      const n = at(0.3, 1.0);
      note(n.x, n.z);
      EMIT.bottle(E, { x: n.x + 0.3, y: p.y, z: n.z });
    } else if (k === "barricade") {
      // chairs, a table and planks piled across a corner; someone didn't make it over
      for (let i = 0; i < 3; i++) {
        const q = at(1.2 + (r() - 0.5) * 0.4, (i - 1) * 0.9);
        EMIT.chair(E, { x: q.x, y: p.y, z: q.z });
      }
      const t = at(1.5);
      EMIT.table(E, { x: t.x, y: p.y, z: t.z, wa: p.wa + Math.PI, wd: 0 });
      out.cols.push({
        x: t.x,
        z: t.z,
        w: 1.3,
        d: 0.3,
        yaw: face,
        h: 0.85,
        y: p.y,
      });
      for (let i = 0; i < 3; i++) {
        const q = at(1.3, (r() - 0.5) * 2);
        EMIT.plank(E, { x: q.x, y: p.y + 0.3, z: q.z, wa: 0, wd: 9 });
      }
      const s = at(2.4, 0.3);
      prop("skeleton", s.x, s.z, face + Math.PI, { pose: "reaching" });
      E.decal("drag", at(3.3, 0.3).x, p.y, at(3.3, 0.3).z, face, 0.7, 2.2);
      const n = at(0.4);
      note(n.x, n.z);
    } else if (k === "trail") {
      // a blood trail along the floor to a body curled against the wall
      prop(
        "skeleton",
        base.x + fx * 0.3,
        base.z + fz * 0.3,
        face + Math.PI / 2,
        { pose: "curled" },
      );
      for (let i = 0; i < 3; i++) {
        const q = at(1.2 + i * 1.8, (r() - 0.5) * 0.3);
        E.decal("drag", q.x, p.y, q.z, face + (r() - 0.5) * 0.3, 0.8, 2.0, 0.9);
      }
      E.decal(
        "blood",
        base.x + fx * 0.6,
        p.y,
        base.z + fz * 0.6,
        r() * TAU,
        1.2,
      );
      const n = at(0.5, 0.6);
      note(n.x, n.z);
    } else if (k === "shrine") {
      // candles, a photo, flowers long dead: someone mourned here
      prop("skeleton", base.x + fx * 0.2, base.z + fz * 0.2, face + Math.PI, {
        pose: "seated" === v.pose ? "seated" : "sitting",
      });
      for (let i = 0; i < 6; i++) {
        const q = at(0.9 + r() * 0.4, (r() - 0.5) * 1.2);
        E.put(
          "candle",
          cyl(),
          M(q.x, p.y + 0.06, q.z, 0, 0, 0, 0.05, 0.12 + r() * 0.1, 0.05),
        );
      }
      E.decal("stain", at(0.9).x, p.y, at(0.9).z, 0, 1.5);
      const n = at(0.9, 0.2);
      note(n.x, n.z);
    }
  }

  // ------------------------------------------------------------------
  // main entry
  // ------------------------------------------------------------------
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
})();
