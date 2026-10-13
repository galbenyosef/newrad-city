// play-inline-8 01 — opts
// Lines 18-185 of readable/play-inline-8.pretty.js (statement-aligned).
  "use strict";
  const G = (window.G = window.G || {});
  const THREE = window.THREE;

  const SHEET_W = 1940,
    SHEET_H = 900;
  const TOP = { x: 0, y: 0, w: 900, h: 900 };
  const CELL_W = 520,
    CELL_H = 300;

  /** Problems in an XZ rect: colliders intruding on road carriageways, blocked doors. */
  function lint(x0, z0, x1, z1) {
    const L = G.LAYOUT,
      W = G.world,
      out = [];
    // colliders standing in the drivable carriageway (not sidewalks) — tall ones only (cars/rubble are fine)
    for (const c of W.query(x0, z0, x1, z1)) {
      if (c.maxY - c.minY < 2.5 || c.minY > 3) continue;
      if (c.cx < x0 || c.cx > x1 || c.cz < z0 || c.cz > z1) continue;
      if (/actor|island|monument|car|vehicle|bus|truck|wreck/.test(c.tag || ""))
        continue; // wrecked vehicles belong on roads
      const onRoad = L.isRoad(c.cx, c.cz, true);
      if (onRoad && c.hx * c.hz > 4)
        out.push({
          kind: "collider_on_road",
          x: c.cx,
          z: c.cz,
          tag: c.tag,
          w: c.hx * 2,
          d: c.hz * 2,
        });
    }
    // doors whose approach (1.5 m in front) is inside a collider taller than a step
    for (const d of W.doors) {
      const p = d.pos || (d.getPos && d.getPos());
      if (!p || p.x < x0 || p.x > x1 || p.z < z0 || p.z > z1) continue;
      let blocked = 0,
        n = 0;
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2,
          qx = p.x + Math.sin(ang) * 1.4,
          qz = p.z + Math.cos(ang) * 1.4;
        n++;
        for (const c of W.query(qx - 0.1, qz - 0.1, qx + 0.1, qz + 0.1)) {
          if (
            c.maxY > (p.y || 0) + 0.6 &&
            c.minY < (p.y || 0) + 1.8 &&
            W.pointInCollider(c, qx, qz, 0.05)
          ) {
            blocked++;
            break;
          }
        }
      }
      if (blocked >= 7)
        out.push({
          kind: "door_blocked",
          x: p.x,
          z: p.z,
          label: d.def && d.def.label,
        });
    }
    // sites straddling road carriageways (sampled)
    for (const s of L.SITES) {
      if (
        s.x1 < x0 ||
        s.x0 > x1 ||
        s.z1 < z0 ||
        s.z0 > z1 ||
        s.plaza ||
        s.deckY ||
        s.owner === "map"
      )
        continue;
      let hits = 0;
      for (let i = 1; i < 8; i++)
        for (let j = 1; j < 8; j++) {
          if (
            L.isRoad(
              s.x0 + ((s.x1 - s.x0) * i) / 8,
              s.z0 + ((s.z1 - s.z0) * j) / 8,
              true,
            )
          )
            hits++;
        }
      if (hits > 2)
        out.push({
          kind: "site_on_road",
          id: s.id,
          x: (s.x0 + s.x1) / 2,
          z: (s.z0 + s.z1) / 2,
          samples: hits,
        });
    }
    return out;
  }

  function hideUI() {
    const st = document.createElement("style");
    st.textContent =
      "body > *:not(#survey-sheet):not(#game-root){visibility:hidden!important} #game-root{visibility:hidden!important}";
    document.head.appendChild(st);
  }

  function makeCam(fov) {
    const c = new THREE.PerspectiveCamera(
      fov || 62,
      CELL_W / CELL_H,
      0.1,
      4000,
    );
    c.rotation.order = "YXZ";
    return c;
  }

  /** Move the player to (x,z) so LOD/interior visibility/atmosphere follow, then settle a few frames. */
  function settleAt(x, y, z) {
    const P = G.player;
    P.fly = true;
    P.noclip = true;
    P.pos.set(x, y, z);
    P.vel.set(0, 0, 0);
    for (let i = 0; i < 9; i++) G._step(1 / 30);
  }

  function renderView(cam, opts) {
    opts = opts || {};
    const r = G.renderer,
      sc = G.scene;
    const fog = sc.fog;
    if (opts.noFog) sc.fog = null;
    r.clippingPlanes = opts.clip ? [opts.clip] : [];
    r.setRenderTarget(null);
    r.render(sc, cam);
    r.clippingPlanes = [];
    sc.fog = fog;
  }

  function streetViewPoint(cx, cz, dirX, dirZ, dist) {
    // walk outward and keep the farthest spot up to `dist` that isn't inside a collider at eye height (prefer roads)
    const W = G.world,
      L = G.LAYOUT;
    let best = null;
    for (let t = dist; t >= 6; t -= 2) {
      const x = cx + dirX * t,
        z = cz + dirZ * t;
      const gy = W.groundHeight(x, z, 60);
      let inside = false;
      for (const c of W.query(x - 0.3, z - 0.3, x + 0.3, z + 0.3)) {
        if (
          c.maxY > gy + 0.6 &&
          c.minY < gy + 1.8 &&
          W.pointInCollider(c, x, z, 0.3)
        ) {
          inside = true;
          break;
        }
      }
      if (inside) continue;
      if (L.isRoad(x, z) || !best) {
        best = { x, z, y: gy };
        if (L.isRoad(x, z)) break;
      }
    }
    return best || { x: cx + dirX * dist, z: cz + dirZ * dist, y: 0 };
  }

