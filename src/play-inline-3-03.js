// play-inline-3 03 — math
// Lines 712-962 of readable/play-inline-3.pretty.js (statement-aligned).
  const W = (G.world = {
    colliders: [],
    grid: new Map(),
    CELL,
    waterLevel: -1.2,
    stepHeight: 0.55,
    interactables: [],
    focus: null,
    radSources: [],
    lods: [],
    doors: [],
    interactRange: 3.2,
  });
  function cellKey(cx, cz) {
    return (cx * 73856093) ^ (cz * 19349663);
  }
  function colliderAABB(c) {
    const cos = Math.abs(Math.cos(c.yaw)),
      sin = Math.abs(Math.sin(c.yaw));
    const ex = c.hx * cos + c.hz * sin,
      ez = c.hx * sin + c.hz * cos;
    return { x0: c.cx - ex, x1: c.cx + ex, z0: c.cz - ez, z1: c.cz + ez };
  }
  /**
   * Add a collider: an XZ-rotated box. opts: {tag, walkable=true, surface:'concrete'|'metal'|'grass'|'dirt'|'wood'|'water', data}
   * @returns collider handle (pass to removeCollider)
   */
  W.addCollider = function (cx, cz, w, d, minY, maxY, yaw, opts) {
    opts = opts || {};
    const c = {
      cx,
      cz,
      hx: w / 2,
      hz: d / 2,
      minY,
      maxY,
      yaw: yaw || 0,
      cos: Math.cos(-(yaw || 0)),
      sin: Math.sin(-(yaw || 0)),
      tag: opts.tag || "static",
      walkable: opts.walkable !== false,
      surface: opts.surface || "concrete",
      data: opts.data || null,
      _stamp: 0,
      cells: [],
    };
    const bb = colliderAABB(c);
    c.bb = bb;
    for (let x = Math.floor(bb.x0 / CELL); x <= Math.floor(bb.x1 / CELL); x++) {
      for (
        let z = Math.floor(bb.z0 / CELL);
        z <= Math.floor(bb.z1 / CELL);
        z++
      ) {
        const k = cellKey(x, z);
        let arr = W.grid.get(k);
        if (!arr) {
          arr = [];
          W.grid.set(k, arr);
        }
        arr.push(c);
        c.cells.push(k);
      }
    }
    W.colliders.push(c);
    return c;
  };
  /** Axis-aligned convenience: min/max corners. */
  W.addBox = function (minX, minY, minZ, maxX, maxY, maxZ, opts) {
    return W.addCollider(
      (minX + maxX) / 2,
      (minZ + maxZ) / 2,
      maxX - minX,
      maxZ - minZ,
      minY,
      maxY,
      0,
      opts,
    );
  };
  /** Collider from a mesh/group: uses local bounding box, world position, world yaw and scale. */
  W.addFromObject = function (obj, opts) {
    obj.updateWorldMatrix(true, true);
    const box = new THREE.Box3();
    // local-space bounds of the whole object (relative to obj)
    const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert();
    obj.traverse((o) => {
      if (!o.geometry) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      const b = o.geometry.boundingBox
        .clone()
        .applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
      box.union(b);
    });
    if (box.isEmpty()) return null;
    const pos = new THREE.Vector3(),
      quat = new THREE.Quaternion(),
      scl = new THREE.Vector3();
    obj.matrixWorld.decompose(pos, quat, scl);
    const e = new THREE.Euler().setFromQuaternion(quat, "YXZ");
    const center = box
      .getCenter(new THREE.Vector3())
      .multiply(scl)
      .applyQuaternion(quat)
      .add(pos);
    const size = box.getSize(new THREE.Vector3()).multiply(scl);
    return W.addCollider(
      center.x,
      center.z,
      size.x,
      size.z,
      center.y - size.y / 2,
      center.y + size.y / 2,
      e.y,
      opts,
    );
  };
  W.removeCollider = function (c) {
    if (!c) return;
    for (const k of c.cells) {
      const arr = W.grid.get(k);
      if (arr) {
        const i = arr.indexOf(c);
        if (i >= 0) arr.splice(i, 1);
      }
    }
    const i = W.colliders.indexOf(c);
    if (i >= 0) W.colliders.splice(i, 1);
  };
  let stamp = 1;
  /** Colliders whose grid cells touch the XZ rect. */
  W.query = function (x0, z0, x1, z1) {
    stamp++;
    const out = [];
    for (let x = Math.floor(x0 / CELL); x <= Math.floor(x1 / CELL); x++) {
      for (let z = Math.floor(z0 / CELL); z <= Math.floor(z1 / CELL); z++) {
        const arr = W.grid.get(cellKey(x, z));
        if (!arr) continue;
        for (const c of arr)
          if (c._stamp !== stamp) {
            c._stamp = stamp;
            out.push(c);
          }
      }
    }
    return out;
  };
  function toLocal(c, x, z) {
    const dx = x - c.cx,
      dz = z - c.cz;
    return [dx * c.cos - dz * c.sin, dx * c.sin + dz * c.cos];
  }
  function toWorldDir(c, lx, lz) {
    return [lx * c.cos + lz * c.sin, -lx * c.sin + lz * c.cos];
  }
  W.pointInCollider = (c, x, z, pad) => {
    const l = toLocal(c, x, z);
    pad = pad || 0;
    return Math.abs(l[0]) <= c.hx + pad && Math.abs(l[1]) <= c.hz + pad;
  };

  /** Terrain height (land y≈0; map module may override for park hills; river bed below water). */
  W.terrainHeight = function (x, z) {
    return G.LAYOUT && G.LAYOUT.isLand(x, z) ? 0 : -6;
  };
  /** Highest walkable surface under (x,z) that is at or below yRef + stepHeight. */
  W.groundHeight = function (x, z, yRef, radius) {
    if (yRef === undefined) yRef = 1e6;
    radius = radius || 0;
    let best = W.terrainHeight(x, z);
    const cs = W.query(x - radius, z - radius, x + radius, z + radius);
    for (const c of cs) {
      if (!c.walkable) continue;
      if (
        c.maxY > best &&
        c.maxY <= yRef + W.stepHeight &&
        W.pointInCollider(c, x, z, radius * 0.5)
      )
        best = c.maxY;
    }
    return best;
  };
  /**
   * Move a vertical cylinder (feet at pos.y, given height) by (dx,dz) with wall sliding.
   * Returns {x, z, blocked}. Colliders whose top is within stepHeight of feet are ignored (stepped onto).
   */
  W.moveCircle = function (pos, radius, height, dx, dz, ignore) {
    let x = pos.x + dx,
      z = pos.z + dz,
      blocked = false;
    const feet = pos.y + W.stepHeight,
      head = pos.y + height;
    for (let iter = 0; iter < 3; iter++) {
      let pushed = false;
      const cs = W.query(
        x - radius - 1,
        z - radius - 1,
        x + radius + 1,
        z + radius + 1,
      );
      for (const c of cs) {
        if (c === ignore || c.maxY <= feet || c.minY >= head) continue;
        const l = toLocal(c, x, z);
        const qx = U.clamp(l[0], -c.hx, c.hx),
          qz = U.clamp(l[1], -c.hz, c.hz);
        let ox = l[0] - qx,
          oz = l[1] - qz;
        const d2 = ox * ox + oz * oz;
        if (d2 >= radius * radius) continue;
        let nx, nz, pen;
        if (d2 > 1e-8) {
          const d = Math.sqrt(d2);
          nx = ox / d;
          nz = oz / d;
          pen = radius - d;
        } else {
          // center inside box: push out along smallest axis
          const px = c.hx - Math.abs(l[0]),
            pz = c.hz - Math.abs(l[1]);
          if (px < pz) {
            nx = Math.sign(l[0]) || 1;
            nz = 0;
            pen = px + radius;
          } else {
            nx = 0;
            nz = Math.sign(l[1]) || 1;
            pen = pz + radius;
          }
        }
        const wd = toWorldDir(c, nx, nz);
        x += wd[0] * pen;
        z += wd[1] * pen;
        pushed = true;
        blocked = true;
      }
      if (!pushed) break;
    }
    // world bounds
    const WB = G.LAYOUT ? G.LAYOUT.WORLD : null;
    if (WB && x < G.LAYOUT.INTERIOR_X_MIN) {
      x = U.clamp(x, WB.minX + 2, WB.maxX - 2);
      z = U.clamp(z, WB.minZ + 2, WB.maxZ - 2);
    }
    return { x, z, blocked };
  };
  /**
   * Raycast against colliders + terrain.  dir must be normalized.
   * opts: {ignoreTags:Set|Array, includeWater:false}
   * returns {dist, point:Vector3, normal:Vector3, collider|null, surface} or null
   */
  const _v = new THREE.Vector3();
