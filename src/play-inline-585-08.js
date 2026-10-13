// play-inline-585 08 — math
// Lines 1988-2311 of readable/play-inline-585.pretty.js (statement-aligned).
  BP.vaultZ = function (mat, x0, x1, z0, z1, ys, rise, o) {
    o = o || {};
    const segs = o.segs || 16,
      cx = (x0 + x1) / 2,
      hw = (x1 - x0) / 2,
      L = z1 - z0;
    const b = this._b(mat);
    const tint = tintOf(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime,
      tile = o.tile || K.tile(mat);
    const zs = Math.max(1, Math.ceil(L / (o.seg || this.seg)));
    const base = b.vc;
    let arcLen = 0;
    const arcs = [0];
    for (let i = 1; i <= segs; i++) {
      const a0 = (Math.PI * (i - 1)) / segs,
        a1 = (Math.PI * i) / segs;
      arcLen += Math.hypot(
        hw * (Math.cos(a1) - Math.cos(a0)),
        rise * (Math.sin(a1) - Math.sin(a0)),
      );
      arcs.push(arcLen);
    }
    for (let j = 0; j <= zs; j++) {
      const z = z0 + (L * j) / zs;
      for (let i = 0; i <= segs; i++) {
        const a = (Math.PI * i) / segs,
          x = cx + hw * Math.cos(a),
          y = ys + rise * Math.sin(a);
        let nx = -Math.cos(a) / hw,
          ny = -Math.sin(a) / rise;
        const nl = Math.hypot(nx, ny);
        nx /= nl;
        ny /= nl;
        let u, v;
        if (o.rect) {
          const r = o.rect;
          u = r[0] + (r[2] - r[0]) * (arcs[i] / arcLen);
          v = r[1] + (r[3] - r[1]) * (j / zs);
        } else {
          u = arcs[i] / tile[0];
          v = z / tile[1];
        }
        this._push(b, x, y, z, nx, ny, 0, u, v, tint, grime);
      }
    }
    const row = segs + 1;
    for (let j = 0; j < zs; j++)
      for (let i = 0; i < segs; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + row, a + row + 1, a, a + row + 1, a + 1);
      }
    b.vc += row * (zs + 1);
    return this;
  };
  /** Same along X (spanning z0..z1, running x0..x1). */
  BP.vaultX = function (mat, z0, z1, x0, x1, ys, rise, o) {
    o = o || {};
    const segs = o.segs || 16,
      cz = (z0 + z1) / 2,
      hw = (z1 - z0) / 2,
      L = x1 - x0;
    const b = this._b(mat);
    const tint = tintOf(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime,
      tile = o.tile || K.tile(mat);
    const xs = Math.max(1, Math.ceil(L / (o.seg || this.seg)));
    const base = b.vc;
    for (let j = 0; j <= xs; j++) {
      const x = x0 + (L * j) / xs;
      for (let i = 0; i <= segs; i++) {
        const a = (Math.PI * i) / segs,
          z = cz + hw * Math.cos(a),
          y = ys + rise * Math.sin(a);
        let nz = -Math.cos(a) / hw,
          ny = -Math.sin(a) / rise;
        const nl = Math.hypot(nz, ny);
        nz /= nl;
        ny /= nl;
        this._push(
          b,
          x,
          y,
          z,
          0,
          ny,
          nz,
          (a * hw) / tile[0],
          x / tile[1],
          tint,
          grime,
        );
      }
    }
    const row = segs + 1;
    for (let j = 0; j < xs; j++)
      for (let i = 0; i < segs; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + 1, a + row + 1, a, a + row + 1, a + row);
      }
    b.vc += row * (xs + 1);
    return this;
  };

  // ---- baking ----
  BP._bake = function () {
    const lights = this.lights;
    const amb = this.ambient,
      M = this.maxLight;
    // light grid (6 m cells) for small lights; big ones are tested for every vertex
    const CELL = 6,
      small = new Map(),
      big = [];
    for (const L of lights) {
      if (L.r > 9) {
        big.push(L);
        continue;
      }
      const x0 = Math.floor((L.x - L.r) / CELL),
        x1 = Math.floor((L.x + L.r) / CELL),
        z0 = Math.floor((L.z - L.r) / CELL),
        z1 = Math.floor((L.z + L.r) / CELL);
      for (let i = x0; i <= x1; i++)
        for (let j = z0; j <= z1; j++) {
          const k = i + "," + j;
          let a = small.get(k);
          if (!a) small.set(k, (a = []));
          a.push(L);
        }
    }
    const lit = [0, 0, 0];
    const one = (L, x, y, z, nx, ny, nz) => {
      if (L.zone) {
        const Z = L.zone;
        if (
          x < Z[0] - 0.3 ||
          x > Z[3] + 0.3 ||
          y < Z[1] - 0.3 ||
          y > Z[4] + 0.3 ||
          z < Z[2] - 0.3 ||
          z > Z[5] + 0.3
        )
          return;
      }
      const dx = L.x - x,
        dy = L.y - y,
        dz = L.z - z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= L.r2) return;
      const d = Math.sqrt(d2) || 1e-3;
      let f = 1 - d / L.r;
      f *= f;
      const lam =
        L.wrap + (1 - L.wrap) * Math.max(0, (dx * nx + dy * ny + dz * nz) / d);
      lit[0] += L.cr * f * lam;
      lit[1] += L.cg * f * lam;
      lit[2] += L.cb * f * lam;
    };
    for (const [, b] of this.bk) {
      if (b.unlit) continue;
      const P = b.p,
        N = b.n,
        Lc = (b.l = new Float32Array(b.vc * 3));
      for (let i = 0, n = b.vc; i < n; i++) {
        const x = P[i * 3],
          y = P[i * 3 + 1],
          z = P[i * 3 + 2],
          nx = N[i * 3],
          ny = N[i * 3 + 1],
          nz = N[i * 3 + 2];
        lit[0] = amb;
        lit[1] = amb;
        lit[2] = amb;
        for (let k = 0; k < big.length; k++) one(big[k], x, y, z, nx, ny, nz);
        const arr = small.get(
          Math.floor(x / CELL) + "," + Math.floor(z / CELL),
        );
        if (arr)
          for (let k = 0; k < arr.length; k++) one(arr[k], x, y, z, nx, ny, nz);
        Lc[i * 3] = Math.min(M, lit[0]);
        Lc[i * 3 + 1] = Math.min(M, lit[1]);
        Lc[i * 3 + 2] = Math.min(M, lit[2]);
      }
    }
  };
  /** Merge every bucket into meshes under a Group added to parent. o: {cast, receive} */
  BP.finish = function (parent, o) {
    o = o || {};
    this._bake();
    const grp = new THREE.Group();
    grp.name = "lair_" + this.name;
    for (const [mat, b] of this.bk) {
      if (!b.vc) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(b.n, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
      g.setAttribute("color", new THREE.Float32BufferAttribute(b.c, 3));
      if (b.l) g.setAttribute("bakeLight", new THREE.BufferAttribute(b.l, 3));
      g.setIndex(
        b.vc > 65535
          ? new THREE.Uint32BufferAttribute(b.i, 1)
          : new THREE.Uint16BufferAttribute(b.i, 1),
      );
      g.computeBoundingSphere();
      g.computeBoundingBox();
      const mesh = new THREE.Mesh(g, K.mat(mat));
      mesh.name = this.name + ":" + mat;
      const def = MATDEF[mat] || {};
      mesh.castShadow =
        o.cast === true && !def.basic && !def.transparent && !def.noShadow;
      mesh.receiveShadow = o.receive !== false && !def.basic;
      if (def.transparent) mesh.renderOrder = 2;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      grp.add(mesh);
    }
    this.bk.clear();
    (parent || G.scene).add(grp);
    return grp;
  };
  BP.tris = function () {
    let n = 0;
    for (const b of this.bk.values()) n += b.i.length / 3;
    return n;
  };

  // ------------------------------------------------------------------
  // Colliders (core collider yaw is the NEGATIVE of the three.js yaw)
  // ------------------------------------------------------------------
  K.colliders = [];
  K.col = function (x0, y0, z0, x1, y1, z1, opts) {
    const c = G.world.addBox(
      Math.min(x0, x1),
      Math.min(y0, y1),
      Math.min(z0, z1),
      Math.max(x0, x1),
      Math.max(y0, y1),
      Math.max(z0, z1),
      Object.assign({ tag: "lair" }, opts || {}),
    );
    K.colliders.push(c);
    return c;
  };
  K.colRot = function (cx, cz, w, d, y0, y1, yaw, opts) {
    const c = G.world.addCollider(
      cx,
      cz,
      w,
      d,
      y0,
      y1,
      -(yaw || 0),
      Object.assign({ tag: "lair" }, opts || {}),
    );
    K.colliders.push(c);
    return c;
  };
  /**
   * A straight stair (visual + walkable step colliders, risers <= 0.22 m).
   * Runs from (x0,z0) along unit (dx,dz) for `run` metres, rising from yb to yt, width w (centred on the line).
   */
  K.stairs = function (b, mat, x0, z0, dx, dz, run, w, yb, yt, o) {
    o = o || {};
    const rise = yt - yb,
      n = Math.max(2, Math.ceil(Math.abs(rise) / 0.2)),
      step = run / n,
      h = rise / n;
    const px = -dz,
      pz = dx; // perpendicular
    const yaw = Math.atan2(dx, dz);
    for (let i = 0; i < n; i++) {
      const t0 = i * step,
        cx = x0 + dx * (t0 + step / 2),
        cz = z0 + dz * (t0 + step / 2);
      const top = yb + h * (i + 1);
      const bot = Math.min(yb, yt) - 0.05;
      b.box(mat, cx, bot, cz, w, top - bot, step + 0.02, {
        yaw,
        tint: o.tint,
        grime: o.grime,
        faces: "nsewt",
      });
      if (o.nosing)
        b.box(
          o.nosing,
          cx + dx * (step / 2 - 0.03),
          top - 0.04,
          cz + dz * (step / 2 - 0.03),
          w,
          0.05,
          0.06,
          { yaw, grime: 0.2 },
        );
      K.colRot(cx, cz, w, step + 0.02, bot, top, yaw, {
        surface: o.surface || "concrete",
      });
      if (o.each) o.each(i, cx, top, cz, px, pz);
    }
    return { n, step, h };
  };

  // ------------------------------------------------------------------
  // Glow points (candle flames, bulbs, embers): one Points draw call per set,
  // flicker in the vertex shader (per-point phase / speed / amount).
  // ------------------------------------------------------------------
  let glowTex = null;
  function getGlowTex() {
    if (glowTex) return glowTex;
    const S = 64,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.75)");
    g.addColorStop(0.45, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, S, S);
    glowTex = K.texFromCanvas(c, { clamp: true });
    return glowTex;
  }
  const glowTime = { value: 0 };
  K.glowTime = glowTime;
