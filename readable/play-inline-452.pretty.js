/* src/props/65_doorguard.js */
/* =====================================================================
 * props / 65_doorguard.js — DOOR GUARD: keeps every street entrance and
 * every interior exit's landing spot clear of set dressing.
 *
 * The city is dressed at props init (order 30). Most street doors exist by
 * then (and the scatter keeps 4.5 m from them), but doors are also added
 * later — by modules initialised after props, in initDone / onReady hooks,
 * or by quests on newGame — and a dumpster, wreck, scaffold or collapse
 * heap could end up in front of them. At initDone (before the containers
 * are registered) and again on the first newGame, every exterior door gets
 * a clear apron: a 2 m circle round the door plus a 5 m × 2.8 m walkway out
 * toward the street (direction from its interior exit's landing point, or
 * probed from the facade), and every exit door's landing point gets a
 * 1.5 m circle plus 2.5 m ahead of the facing the player arrives with.
 * Anything of ours inside it is taken out: batched statics are collapsed to
 * degenerate triangles (Batcher.hideItem), their colliders / glows / fires /
 * containers removed; street cars removed; scatter-spawned dynamic props
 * removed. Flat litter (< 25 cm) stays — trash at a doorstep is fine.
 * Results: G.props.stats().doorGuard.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const P = G.props;
  const X = P._;

  const DONE = new WeakSet();
  const CELL = 10;
  let INDEX = null,
    indexedN = 0;

  function footprint(rec) {
    if (rec.fp) return rec.fp;
    const b = rec.pr.box,
      s = rec.s || 1;
    let x0 = b.min.x * s,
      x1 = b.max.x * s;
    if (rec.mirror) {
      const m = Math.max(-x0, x1);
      x0 = -m;
      x1 = m;
    }
    rec.fp = {
      x0,
      x1,
      z0: b.min.z * s,
      z1: b.max.z * s,
      h: b.max.y * s,
      y0: Math.min(0, b.min.y * s),
      R: Math.hypot(Math.max(-x0, x1), Math.max(-b.min.z * s, b.max.z * s)),
      c: Math.cos(rec.yaw || 0),
      sn: Math.sin(rec.yaw || 0),
    };
    return rec.fp;
  }
  /** Distance from world point (px,pz) to the item's rotated footprint box. */
  function distTo(rec, px, pz) {
    const f = footprint(rec);
    const dx = px - rec.x,
      dz = pz - rec.z;
    const lx = dx * f.c - dz * f.sn,
      lz = dx * f.sn + dz * f.c;
    const qx = Math.max(0, lx - f.x1, f.x0 - lx),
      qz = Math.max(0, lz - f.z1, f.z0 - lz);
    return Math.hypot(qx, qz);
  }
  function buildIndex() {
    if (INDEX && indexedN === X.PLACED.length) return INDEX;
    INDEX = new Map();
    indexedN = X.PLACED.length;
    for (const rec of X.PLACED) {
      const f = footprint(rec);
      for (
        let cx = Math.floor((rec.x - f.R) / CELL);
        cx <= Math.floor((rec.x + f.R) / CELL);
        cx++
      ) {
        for (
          let cz = Math.floor((rec.z - f.R) / CELL);
          cz <= Math.floor((rec.z + f.R) / CELL);
          cz++
        ) {
          const k = cx * 100003 + cz;
          let a = INDEX.get(k);
          if (!a) INDEX.set(k, (a = []));
          a.push(rec);
        }
      }
    }
    return INDEX;
  }
  /** Zone = list of {x,z,r} discs (a capsule is sampled into discs every 0.4 m) + y band. */
  function capsule(out, ax, az, bx, bz, r) {
    const L = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.ceil(L / 0.4));
    for (let i = 0; i <= n; i++)
      out.push({ x: ax + ((bx - ax) * i) / n, z: az + ((bz - az) * i) / n, r });
  }

  function removeSc(sc) {
    if (!sc) return;
    if (sc.rec) {
      try {
        X.destroyContainer(sc.rec);
      } catch (e) {
        /* ignore */
      }
      sc.rec = null;
      sc.container = null;
      sc.fallback = null;
    }
    const i = X.SC_CONTAINERS.indexOf(sc);
    if (i >= 0) X.SC_CONTAINERS.splice(i, 1);
  }
  function hideRec(rec, st) {
    if (rec.hidden) return;
    const B = X.Batcher;
    if (!B.hideItem(rec)) rec.hidden = true;
    for (const c of rec.cols || []) if (c) G.world.removeCollider(c);
    rec.cols = null;
    if (rec.fx) {
      const fires = rec.fx.fires.slice();
      X.removeProtoFx(rec.fx);
      if (fires.length)
        X.FIRE_SPOTS = X.FIRE_SPOTS.filter((f) => fires.indexOf(f.h) < 0);
    }
    removeSc(rec.sc);
    rec.sc = null;
    st.hidden[rec.name] = (st.hidden[rec.name] || 0) + 1;
    if (rec.pair) for (const p of rec.pair) hideRec(p, st);
  }

  /** Outward (street-facing) direction of an exterior door, or null. */
  const _o = new THREE.Vector3(),
    _d = new THREE.Vector3();
  function probeNormal(p) {
    let best = null,
      bd = 1e9,
      free = 0;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      _o.set(p.x, (p.y || 0) + 1.0, p.z);
      _d.set(Math.sin(a), 0, Math.cos(a));
      const h = G.world.raycast(_o, _d, 6, {
        ignoreTags: ["prop", "prop_car", "actor", "interactable_self"],
      });
      if (!h) {
        free++;
        continue;
      }
      if (h.dist < bd) {
        bd = h.dist;
        best = a;
      }
    }
    if (best === null || free < 3) return null;
    return { x: -Math.sin(best), z: -Math.cos(best) };
  }

  X.runDoorGuard = function (phase) {
    const t0 = performance.now();
    const W = G.world,
      L = G.LAYOUT,
      XM = L.INTERIOR_X_MIN;
    const st =
      X.doorGuard ||
      (X.doorGuard = {
        doors: 0,
        exits: 0,
        probed: 0,
        circleOnly: 0,
        hidden: {},
        cars: 0,
        spawned: 0,
        ms: 0,
        phases: [],
      });
    const all = (W.doors || []).filter((d) => d && d.def && d.def.pos);
    const exits = all
      .filter((d) => d.def.pos.x >= XM && d.def.target && d.def.target.x < XM)
      .map((d) => d.def);
    const discs = [];
    let nNew = 0;
    for (const d of all) {
      if (DONE.has(d)) continue;
      DONE.add(d);
      const def = d.def,
        p = def.pos,
        py = p.y || 0;
      if (p.x < XM) {
        // exterior entrance
        nNew++;
        st.doors++;
        let n = null,
          t = null,
          bd = 12;
        for (const e of exits) {
          const dd = Math.hypot(e.target.x - p.x, e.target.z - p.z);
          if (dd < bd) {
            bd = dd;
            t = e.target;
          }
        }
        if (t) {
          const dd = Math.hypot(t.x - p.x, t.z - p.z);
          n =
            dd > 0.5
              ? { x: (t.x - p.x) / dd, z: (t.z - p.z) / dd }
              : { x: -Math.sin(t.yaw || 0), z: -Math.cos(t.yaw || 0) };
        } else {
          n = probeNormal(p);
          if (n) st.probed++;
        }
        const ds = [];
        ds.push({ x: p.x, z: p.z, r: 2.0 });
        if (n) capsule(ds, p.x, p.z, p.x + n.x * 5, p.z + n.z * 5, 1.4);
        else {
          st.circleOnly++;
          ds[0].r = 3.0;
        }
        discs.push({ ds, y0: py - 0.6, y1: py + 2.6 });
      } else if (def.target && def.target.x < XM) {
        // interior exit: where the player lands outside, and the first steps they take
        st.exits++;
        const t = def.target,
          ty = t.y || 0,
          fx = -Math.sin(t.yaw || 0),
          fz = -Math.cos(t.yaw || 0);
        const ds = [{ x: t.x, z: t.z, r: 1.5 }];
        capsule(ds, t.x, t.z, t.x + fx * 2.5, t.z + fz * 2.5, 1.0);
        discs.push({ ds, y0: ty - 0.6, y1: ty + 2.6 });
      }
    }
    // walk-in storefront shells (map): their doorway + a walkway out to the kerb
    if (!st.shops) {
      st.shops = 0;
      let list = null;
      try {
        list =
          !G.isStub("map") && typeof G.map.getStorefronts === "function"
            ? G.map.getStorefronts()
            : null;
      } catch (e) {
        list = null;
      }
      if (Array.isArray(list))
        for (const sf of list) {
          const d = sf && sf.door;
          if (!d || typeof d.x !== "number" || typeof sf.x !== "number")
            continue;
          let nx = -Math.sin(sf.yaw || 0),
            nz = -Math.cos(sf.yaw || 0);
          if (nx * (d.x - sf.x) + nz * (d.z - sf.z) < 0) {
            nx = -nx;
            nz = -nz;
          }
          // (short: the doorway and the sidewalk in front of it — a wreck parked at the kerb may stay)
          const ds = [{ x: d.x, z: d.z, r: 1.3 }],
            y = sf.floorY || 0;
          capsule(ds, d.x, d.z, d.x + nx * 1.8, d.z + nz * 1.8, 1.0);
          discs.push({ ds, y0: y - 0.6, y1: y + 2.6 });
          st.shops++;
        }
    }
    if (!discs.length) return st;
    // --- static batched props ---
    const idx = buildIndex();
    for (const z of discs) {
      const seen = new Set();
      for (const q of z.ds) {
        const a = idx.get(
          Math.floor(q.x / CELL) * 100003 + Math.floor(q.z / CELL),
        );
        if (!a) continue;
        for (const rec of a) {
          if (rec.hidden || seen.has(rec)) continue;
          const f = footprint(rec);
          if (f.h < 0.25) continue; // flat litter / decals stay
          if (rec.y + f.y0 > z.y1 || rec.y + f.h < z.y0) continue; // not at the door's height
          if (Math.hypot(q.x - rec.x, q.z - rec.z) > f.R + q.r) continue;
          if (distTo(rec, q.x, q.z) < q.r) {
            seen.add(rec);
            hideRec(rec, st);
          }
        }
      }
      // --- street cars ---
      if (X.carsNear)
        for (const q of z.ds) {
          for (const { car, d } of X.carsNear({ x: q.x, z: q.z }, q.r)) {
            if (car.removed || d > q.r) continue;
            X.removeCar(car);
            st.cars++;
            if (car.trunkSc) {
              removeSc(car.trunkSc);
              car.trunkSc = null;
            }
          }
        }
      // --- dynamic props the scatter spawned (barrels, footlockers, turrets...) ---
      for (const rec of X.SPAWNED.slice()) {
        if (rec.removed || !rec.opts || !rec.opts._sc || !rec.obj) continue;
        const o = rec.obj.position;
        if (Math.hypot(o.x - z.ds[0].x, o.z - z.ds[0].z) > 8) continue;
        for (const q of z.ds) {
          if (Math.hypot(o.x - q.x, o.z - q.z) < q.r + 0.4) {
            X.removeSpawnRec(rec);
            st.spawned++;
            break;
          }
        }
      }
    }
    st.ms += Math.round(performance.now() - t0);
    st.phases.push(phase + ":" + nNew);
    return st;
  };
})();
