// play-inline-106 06 — three
// Lines 1343-1686 of readable/play-inline-106.pretty.js (statement-aligned).
  BP.prism = function (mat, pts, y0, y1, o) {
    o = o || {};
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        b2 = pts[(i + 1) % pts.length];
      area += a[0] * b2[1] - b2[0] * a[1];
    }
    // We want the outward normal to be the right-hand perpendicular (dz,-dx): requires area2 > 0 in (x,z) math orientation.
    const P = area > 0 ? pts.slice() : pts.slice().reverse();
    const tint = tintOf(o.tint);
    let uo = o.uo || 0;
    const h = y1 - y0;
    if (o.sides !== false) {
      for (let i = 0; i < P.length; i++) {
        const a = P[i],
          bq = P[(i + 1) % P.length];
        const dx = bq[0] - a[0],
          dz = bq[1] - a[1],
          L = Math.hypot(dx, dz);
        if (L < 1e-4) continue;
        // origin at b, u toward a (so that u × up = outward normal)
        this.face(mat, bq[0], y0, bq[1], -dx / L, 0, -dz / L, 0, 1, 0, L, h, {
          tintObj: tint,
          grime: o.grime,
          tile: o.tile,
          uo,
          seg: o.seg,
        });
        uo += L;
      }
    }
    const tri = (y, up) => {
      const b = this._b(mat);
      const contour = P.map((p) => new THREE.Vector2(p[0], p[1]));
      const faces = THREE.ShapeUtils.triangulateShape(contour, []);
      const base = b.vc;
      const tile = o.tile || K.tile(mat);
      for (const p of P) {
        b.p.push(p[0], y, p[1]);
        b.n.push(0, up ? 1 : -1, 0);
        b.uv.push(p[0] / tile[0], -p[1] / tile[1]);
        const col = this._color(
          p[0],
          y,
          p[1],
          up ? 1 : -1,
          tint,
          o.grime !== undefined ? o.grime : this.grime,
        );
        b.c.push(col[0], col[1], col[2]);
      }
      for (const f of faces) {
        // orient each triangle explicitly: (a×b).y > 0 means it faces +Y
        const p0 = P[f[0]],
          p1 = P[f[1]],
          p2 = P[f[2]];
        const ax = p1[0] - p0[0],
          az = p1[1] - p0[1],
          bx = p2[0] - p0[0],
          bz = p2[1] - p0[1];
        const facesUp = az * bx - ax * bz > 0;
        if (facesUp === up) b.i.push(base + f[0], base + f[1], base + f[2]);
        else b.i.push(base + f[0], base + f[2], base + f[1]);
      }
      b.vc += P.length;
    };
    if (o.top !== false) tri(y1, true);
    if (o.bottom) tri(y0, false);
    return this;
  };

  /**
   * Extrude a THREE.Shape (in local x = along wall, y = up) by depth (local z, centred).
   * o: {x,y,z, ry (three yaw), curveSegments, tint, grime, tile, uv}
   */
  BP.extrude = function (mat, shape, depth, o) {
    o = o || {};
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: o.curveSegments || 8,
    });
    g.translate(0, 0, -depth / 2);
    this.geo(mat, g, {
      x: o.x,
      y: o.y,
      z: o.z,
      ry: o.ry,
      rx: o.rx,
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
      uv: o.uv,
      rect: o.rect,
    });
    g.dispose();
    return this;
  };

  /**
   * Wall with rectangular/arched openings between points A and B (xz), from y0 to y1, thickness t.
   * openings: [{at (m from A), w, h (height of opening incl. arch), y (sill, default 0), arch:bool}]
   * Wall faces its local +z to the right of A→B... we simply place it; both faces are rendered by extrusion.
   */
  BP.wall = function (mat, ax, az, bx, bz, y0, y1, t, openings, o) {
    o = o || {};
    const L = Math.hypot(bx - ax, bz - az);
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(L, 0);
    sh.lineTo(L, y1 - y0);
    sh.lineTo(0, y1 - y0);
    sh.lineTo(0, 0);
    for (const op of openings || []) {
      const hw = op.w / 2,
        sy = op.y || 0,
        top = op.h + sy;
      const p = new THREE.Path();
      if (op.arch) {
        const springY = top - hw;
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, springY);
        p.absarc(op.at, springY, hw, 0, Math.PI, false);
        p.lineTo(op.at - hw, sy);
      } else if (op.pointed) {
        const springY = top - op.w * 0.85;
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, springY);
        p.quadraticCurveTo(op.at + hw, top - op.w * 0.2, op.at, top);
        p.quadraticCurveTo(op.at - hw, top - op.w * 0.2, op.at - hw, springY);
        p.lineTo(op.at - hw, sy);
      } else {
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, top);
        p.lineTo(op.at - hw, top);
        p.lineTo(op.at - hw, sy);
      }
      sh.holes.push(p);
    }
    const yaw = -Math.atan2(bz - az, bx - ax); // local x → direction A→B
    const mx = (ax + bx) / 2,
      mz = (az + bz) / 2;
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: t,
      bevelEnabled: false,
      curveSegments: o.curveSegments || 10,
    });
    g.translate(-L / 2, 0, -t / 2);
    this.geo(mat, g, {
      x: mx,
      y: y0,
      z: mz,
      ry: yaw,
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
    });
    g.dispose();
    if (o.collide !== false)
      K.colWall(ax, az, bx, bz, t, y0, y1, openings, o.colOpts);
    return this;
  };

  /**
   * Merge all buckets into meshes under a Group. o: {cast=true, receive=true, lod: metres, parent, name}
   */
  BP.finish = function (parent, o) {
    o = o || {};
    const grp = new THREE.Group();
    grp.name = "lma_" + this.name;
    const box = new THREE.Box3();
    const st = ((A.buildStats = A.buildStats || {})[this.name] = {
      tris: 0,
      meshes: 0,
      shadowTris: 0,
    });
    for (const [mat, b] of this.bk) {
      if (!b.vc) continue;
      st.tris += b.i.length / 3;
      st.meshes++;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(b.n, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
      g.setAttribute("color", new THREE.Float32BufferAttribute(b.c, 3));
      g.setIndex(
        b.vc > 65535
          ? new THREE.Uint32BufferAttribute(b.i, 1)
          : new THREE.Uint16BufferAttribute(b.i, 1),
      );
      g.computeBoundingSphere();
      g.computeBoundingBox();
      box.union(g.boundingBox);
      const material = K.mat(mat);
      const mesh = new THREE.Mesh(g, material);
      mesh.name = this.name + ":" + mat;
      const def = MATDEF[mat] || {};
      mesh.castShadow =
        o.cast !== false && !def.basic && !def.transparent && !def.noShadow;
      mesh.receiveShadow = o.receive !== false && !def.basic;
      if (def.renderOrder) mesh.renderOrder = def.renderOrder;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      if (mesh.castShadow) st.shadowTris += b.i.length / 3;
      grp.add(mesh);
    }
    this.bk.clear();
    (parent || G.scene).add(grp);
    if (o.lod && !box.isEmpty())
      G.world.addLOD(grp, o.lod, box.getCenter(new THREE.Vector3()));
    return grp;
  };
  /** Triangle count currently batched (debug). */
  BP.tris = function () {
    let n = 0;
    for (const b of this.bk.values()) n += b.i.length / 3;
    return n;
  };

  // ------------------------------------------------------------------
  // Colliders (core yaw convention = -three.js yaw)
  // ------------------------------------------------------------------
  K.colBox = function (x0, y0, z0, x1, y1, z1, opts) {
    return G.world.addBox(
      Math.min(x0, x1),
      Math.min(y0, y1),
      Math.min(z0, z1),
      Math.max(x0, x1),
      Math.max(y0, y1),
      Math.max(z0, z1),
      opts || {},
    );
  };
  /** Rotated box collider, yaw in three.js convention (same as Builder.box). */
  K.colRot = function (cx, cz, w, d, y0, y1, yaw, opts) {
    return G.world.addCollider(cx, cz, w, d, y0, y1, -(yaw || 0), opts || {});
  };
  /** Collider for a wall segment A→B with thickness t; openings leave gaps (door holes, from their sill). */
  K.colWall = function (ax, az, bx, bz, t, y0, y1, openings, opts) {
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) return;
    const dx = (bx - ax) / L,
      dz = (bz - az) / L,
      yaw = -Math.atan2(bz - az, bx - ax);
    const ops = (openings || [])
      .filter((op) => (op.y || 0) < 0.6 && op.h > 1.9)
      .sort((a, b) => a.at - b.at);
    let s = 0;
    const seg = (a, b, ya, yb) => {
      if (b - a < 0.05) return;
      const m = (a + b) / 2;
      K.colRot(ax + dx * m, az + dz * m, b - a, t, ya, yb, yaw, opts);
    };
    for (const op of ops) {
      seg(s, op.at - op.w / 2, y0, y1);
      // lintel above opening
      seg(
        op.at - op.w / 2,
        op.at + op.w / 2,
        y0 + (op.y || 0) + op.h - (op.arch ? op.w * 0.25 : 0),
        y1,
      );
      s = op.at + op.w / 2;
    }
    seg(s, L, y0, y1);
    // windows (raised openings) are left solid for collision
  };
  /**
   * Straight stair flight: from bottom (x,z) running along direction yaw (three.js: 0 → -Z north... we use explicit dx,dz)
   * K.colStairs(x0,z0, dx,dz (unit run direction), width, run, yBottom, yTop, steps)
   * Each step collider rises ≤ 0.5 m and extends to the top of the flight.
   */
  K.colStairs = function (x0, z0, dx, dz, width, run, yb, yt, steps, opts) {
    const L = Math.hypot(dx, dz);
    dx /= L;
    dz /= L;
    const yaw = -Math.atan2(dz, dx);
    steps = steps || Math.max(1, Math.ceil((yt - yb) / 0.4));
    for (let i = 0; i < steps; i++) {
      const a = (run * i) / steps,
        b = run;
      const m = (a + b) / 2,
        top = yb + ((yt - yb) * (i + 1)) / steps;
      K.colRot(
        x0 + dx * m,
        z0 + dz * m,
        b - a,
        width,
        yb - 0.2,
        top,
        yaw,
        opts || { surface: "concrete" },
      );
    }
  };
  /** Visual stair flight (same params as colStairs) + collider. */
  BP.stairs = function (mat, x0, z0, dx, dz, width, run, yb, yt, steps, o) {
    o = o || {};
    const L = Math.hypot(dx, dz);
    dx /= L;
    dz /= L;
    steps = steps || Math.max(1, Math.ceil((yt - yb) / 0.4));
    const yaw = Math.atan2(dx, dz); // three.js yaw such that local +z points along (dx,dz)
    for (let i = 0; i < steps; i++) {
      const a = (run * i) / steps,
        b = (run * (i + 1)) / steps,
        m = (a + b) / 2;
      const top = yb + ((yt - yb) * (i + 1)) / steps;
      const bot = o.solid ? yb : top - (yt - yb) / steps - 0.05;
      this.box(mat, x0 + dx * m, bot, z0 + dz * m, width, top - bot, b - a, {
        yaw,
        tint: o.tint,
        grime: o.grime,
      });
    }
    if (o.collide !== false)
      K.colStairs(x0, z0, dx, dz, width, run, yb, yt, steps, o.colOpts);
    return this;
  };

  // ------------------------------------------------------------------
  // Texture atlases (shelf packer)
  // ------------------------------------------------------------------
  function Atlas(name, size, bg, height) {
    this.name = name;
    this.size = size;
    this.W = size;
    this.H = height || size;
    this.canvas = K.canvas(this.W, this.H);
    this.ctx = this.canvas.getContext("2d");
    if (bg) {
      this.ctx.fillStyle = bg;
      this.ctx.fillRect(0, 0, this.W, this.H);
    }
    this.sky = [{ x: 0, y: 0, w: this.W }];
    this.slots = {};
    this.used = 0;
    this.tex = K.texFromCanvas(this.canvas, { clamp: true });
  }
  /** Skyline bottom-left packing. Returns {x,y,w,h,rect:[u0,v0,u1,v1]} (rect ready for 'rect' UVs). */
