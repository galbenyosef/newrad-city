// play-inline-416 07 — off
// Lines 1819-2141 of readable/play-inline-416.pretty.js (statement-aligned).
  BP.pipe = function (mat, ax, ay, az, bx, by, bz, r, seg, o) {
    const dx = bx - ax,
      dy = by - ay,
      dz = bz - az,
      len = Math.hypot(dx, dy, dz);
    if (len < 1e-4) return this;
    const g = K.unitCyl(seg || 6);
    const dir = new THREE.Vector3(dx / len, dy / len, dz / len);
    _q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    _s.set(r, len, r);
    const m = new THREE.Matrix4().compose(
      _v1.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2),
      _q,
      _s,
    );
    return this.geo(mat, g, Object.assign({}, o || {}, { matrix: m }));
  };
  /** Vertical plate facing (nx,nz) centred (cx,cy,cz) size w×h, optional atlas rect. */
  BP.plate = function (mat, cx, cy, cz, nx, nz, w, h, rect, o) {
    o = o || {};
    const rx = nz,
      rz = -nx,
      hw = w / 2,
      hh = h / 2,
      off = o.off !== undefined ? o.off : 0.015;
    const px = cx + nx * off,
      pz = cz + nz * off;
    return this.quad(
      mat,
      [px - rx * hw, cy - hh, pz - rz * hw],
      [px + rx * hw, cy - hh, pz + rz * hw],
      [px + rx * hw, cy + hh, pz + rz * hw],
      [px - rx * hw, cy + hh, pz - rz * hw],
      Object.assign({ rect, grime: 0 }, o),
    );
  };
  /** Horizontal plate (rug, decal, puddle) at height y, yaw rotation. */
  BP.hplate = function (mat, cx, y, cz, w, d, yaw, rect, o) {
    o = o || {};
    const c = Math.cos(yaw || 0),
      s = Math.sin(yaw || 0);
    const P = (lx, lz) => [cx + lx * c + lz * s, y, cz - lx * s + lz * c];
    const hw = w / 2,
      hd = d / 2;
    return this.quad(
      mat,
      P(-hw, hd),
      P(hw, hd),
      P(hw, -hd),
      P(-hw, -hd),
      Object.assign({ rect, grime: 0 }, o),
    );
  };

  let _ubox = null,
    _ucyl = {};
  K.unitBox = () => _ubox || (_ubox = new THREE.BoxGeometry(1, 1, 1));
  K.unitCyl = (seg) =>
    _ucyl[seg] ||
    (_ucyl[seg] = new THREE.CylinderGeometry(1, 1, 1, seg, 1, false));

  /** Colliders (local coords → world). */
  BP.col = function (x0, y0, z0, x1, y1, z1, o) {
    const off = this.off;
    const c = G.world.addBox(
      Math.min(x0, x1) + off.x,
      Math.min(y0, y1) + off.y,
      Math.min(z0, z1) + off.z,
      Math.max(x0, x1) + off.x,
      Math.max(y0, y1) + off.y,
      Math.max(z0, z1) + off.z,
      Object.assign({ tag: "poi_harbor2", surface: "concrete" }, o || {}),
    );
    this.colliders.push(c);
    return c;
  };
  /** Rotated collider: centre, size, three.js yaw (core yaw is the negative). */
  BP.ocol = function (cx, cz, w, d, y0, y1, yaw, o) {
    const off = this.off;
    const c = G.world.addCollider(
      cx + off.x,
      cz + off.z,
      w,
      d,
      y0 + off.y,
      y1 + off.y,
      -(yaw || 0),
      Object.assign({ tag: "poi_harbor2", surface: "concrete" }, o || {}),
    );
    this.colliders.push(c);
    return c;
  };

  // ------------------------------------------------------------------
  // Finish: bake lights into vertex colours, create one mesh per material
  // ------------------------------------------------------------------
  BP.lightAt = function (x, y, z, nx, ny, nz, out) {
    let r = this.amb[0],
      g = this.amb[1],
      b = this.amb[2];
    for (let k = 0; k < this.lights.length; k++) {
      const L = this.lights[k];
      if (
        L.box &&
        (x < L.box[0] ||
          x > L.box[3] ||
          y < L.box[1] ||
          y > L.box[4] ||
          z < L.box[2] ||
          z > L.box[5])
      )
        continue;
      const dx = L.x - x,
        dy = L.y - y,
        dz = L.z - z,
        d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= L.r2) continue;
      const d = Math.sqrt(d2) || 1e-3,
        f = 1 - d / L.r,
        att = f * f;
      const ndl = (dx * nx + dy * ny + dz * nz) / d;
      const k2 = att * (L.wrap + (1 - L.wrap) * Math.max(0, ndl)) * L.i;
      r += L.c[0] * k2;
      g += L.c[1] * k2;
      b += L.c[2] * k2;
    }
    out[0] = r;
    out[1] = g;
    out[2] = b;
    return out;
  };
  BP.finish = function (parent) {
    const group = new THREE.Group();
    group.name = "ph2_" + this.name;
    const tmp = [0, 0, 0];
    for (const [key, b] of this.bk) {
      if (!b.vc) continue;
      if (this.lit && !MATDEF[key].neon && !MATDEF[key].lamp) {
        for (let i = 0; i < b.vc; i++) {
          this.lightAt(
            b.p[i * 3],
            b.p[i * 3 + 1],
            b.p[i * 3 + 2],
            b.n[i * 3],
            b.n[i * 3 + 1],
            b.n[i * 3 + 2],
            tmp,
          );
          b.c[i * 3] *= tmp[0];
          b.c[i * 3 + 1] *= tmp[1];
          b.c[i * 3 + 2] *= tmp[2];
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
      geo.setAttribute("normal", new THREE.Float32BufferAttribute(b.n, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
      geo.setAttribute("color", new THREE.Float32BufferAttribute(b.c, 3));
      geo.setIndex(
        b.vc > 65535
          ? new THREE.Uint32BufferAttribute(b.i, 1)
          : new THREE.Uint16BufferAttribute(b.i, 1),
      );
      geo.computeBoundingSphere();
      geo.computeBoundingBox();
      const mesh = new THREE.Mesh(geo, K.mat(key, this.lit));
      mesh.name = "ph2_" + this.name + "_" + key;
      const d = MATDEF[key];
      if (
        this.shadows &&
        !d.neon &&
        !d.lamp &&
        !d.transparent &&
        key !== "glass"
      ) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      } else if (!this.lit && !d.neon && !d.lamp) mesh.receiveShadow = true;
      if (d.transparent || d.neon) mesh.renderOrder = 2;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      group.add(mesh);
    }
    this.bk.clear();
    // glow sprites: one Points per size class
    if (this.glows.length) {
      const classes = {};
      for (const gl of this.glows) {
        const k = gl.s < 0.8 ? 0.5 : gl.s < 2 ? 1.4 : gl.s < 4 ? 3 : 6;
        (classes[k] = classes[k] || []).push(gl);
      }
      for (const k in classes) {
        const list = classes[k];
        const pos = new Float32Array(list.length * 3),
          col = new Float32Array(list.length * 3);
        list.forEach((gl, i) => {
          pos[i * 3] = gl.x;
          pos[i * 3 + 1] = gl.y;
          pos[i * 3 + 2] = gl.z;
          col[i * 3] = gl.c[0];
          col[i * 3 + 1] = gl.c[1];
          col[i * 3 + 2] = gl.c[2];
        });
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("color", new THREE.BufferAttribute(col, 3));
        g.computeBoundingSphere();
        const m = new THREE.PointsMaterial({
          size: +k,
          map: K.glowTex(),
          vertexColors: true,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
          toneMapped: false,
          fog: !this.lit,
        });
        m.userData.shared = true;
        const pts = new THREE.Points(g, m);
        pts.name = "ph2_glow_" + this.name;
        pts.renderOrder = 3;
        pts.frustumCulled = true;
        pts.matrixAutoUpdate = false;
        group.add(pts);
      }
    }
    if (parent) parent.add(group);
    return group;
  };
  let glowTex = null;
  K.glowTex = function () {
    if (glowTex) return glowTex;
    const S = 64,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.55)");
    g.addColorStop(0.5, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, S, S);
    return (glowTex = K.texFromCanvas(c, { clamp: true }));
  };

  // ------------------------------------------------------------------
  // Architectural helpers (all local coords, on a builder `b`)
  // ------------------------------------------------------------------
  const T = 0.2; // interior wall thickness
  K.WALL_T = T;
  /**
   * Interior room. R: {x0,z0,x1,z1, y, h, floor, wall, ceil, fc, wc, cc (tints), wain, wainC, wainH,
   *   open:{n,s,e,w}, noCeil, noFloor, surface, slab (floor collider thickness), trim}
   * Door gaps are read from ctx.gaps (added with K.gap on the same context).
   */
  K.room = function (b, ctx, R) {
    R = Object.assign(
      {
        y: 0,
        h: 3.4,
        floor: "concrete",
        wall: "plaster",
        ceil: "plaster",
        fc: [0.8, 0.78, 0.74],
        wc: [0.85, 0.82, 0.76],
        cc: [0.7, 0.68, 0.64],
        open: {},
        surface: "concrete",
        slab: 0.3,
      },
      R,
    );
    const { x0, z0, x1, z1, y, h } = R;
    if (!R.noFloor) {
      b.face(R.floor, x0, y, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: R.fc,
      });
      b.col(x0, y - R.slab, z0, x1, y, z1, {
        tag: "floor",
        surface: R.surface,
      });
    }
    if (!R.noCeil) {
      b.face(R.ceil, x0, y + h, z0, 1, 0, 0, 0, 0, 1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: R.cc,
        grime: 0.3,
      });
      if (R.ceilCol)
        b.col(x0, y + h, z0, x1, y + h + 0.3, z1, { tag: "ceiling" });
    }
    const sides = [
      { s: "n", alongX: true, line: z0, a: x0, e: x1, nx: 0, nz: 1 },
      { s: "s", alongX: true, line: z1, a: x0, e: x1, nx: 0, nz: -1 },
      { s: "w", alongX: false, line: x0, a: z0, e: z1, nx: 1, nz: 0 },
      { s: "e", alongX: false, line: x1, a: z0, e: z1, nx: -1, nz: 0 },
    ];
    for (const sd of sides) if (!R.open[sd.s]) K.wallRun(b, ctx, R, sd);
    return R;
  };
  /** Point on a side at along-coordinate t, offset into the room. */
  function PT(sd, t, off) {
    return sd.alongX ? [t, sd.line + sd.nz * off] : [sd.line + sd.nx * off, t];
  }
  function wallFace(b, mat, sd, t0, t1, y0, y1, off, tint, grime) {
    if (t1 - t0 < 0.005 || y1 - y0 < 0.005) return;
    // U axis along the wall such that U × V(up) = inner normal
    const A = PT(sd, t0, off),
      B = PT(sd, t1, off);
    // inner normal n; U must satisfy U×Y = n → U = (−nz, 0, nx)?  check: (ux,0,uz)×(0,1,0) = (−uz, 0, ux) = n → uz = −nx, ux = nz
    const ux = sd.nz,
      uz = -sd.nx;
    // choose origin so that the face spans t0..t1 in +U direction
    const dirT = sd.alongX ? ux : uz; // how U moves t
    const O = dirT > 0 ? A : B;
    b.face(mat, O[0], y0, O[1], ux, 0, uz, 0, 1, 0, t1 - t0, y1 - y0, {
      tint,
      grime,
      uo: dirT > 0 ? t0 : -t1,
    });
  }
