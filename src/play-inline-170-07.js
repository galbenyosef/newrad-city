// play-inline-170 07 — math
// Lines 1622-1971 of readable/play-inline-170.pretty.js (statement-aligned).
  BP.finish = function (parent, o) {
    if (
      this.ambient !== null &&
      /_int$/.test(this.name) &&
      K.A &&
      K.A.fillCell &&
      !this._filled
    ) {
      this._filled = true;
      try {
        K.A.fillCell(this, parent);
      } catch (e) {
        G.reportError("poi_midtown:fill " + this.name, e);
      }
    }
    o = o || {};
    const grp = new THREE.Group();
    grp.name = "pmid_" + this.name;
    const box = new THREE.Box3();
    for (const [mat, b] of this.bk) {
      if (!b.vc) continue;
      if (this.yOff)
        for (let i = 1; i < b.p.length; i += 3) b.p[i] += this.yOff;
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
  K.yOff = 0;
  K.colBox = function (x0, y0, z0, x1, y1, z1, opts) {
    const o = K.yOff || 0;
    return G.world.addBox(
      Math.min(x0, x1),
      Math.min(y0, y1) + o,
      Math.min(z0, z1),
      Math.max(x0, x1),
      Math.max(y0, y1) + o,
      Math.max(z0, z1),
      opts || {},
    );
  };
  /** Rotated box collider, yaw in three.js convention (same as Builder.box). */
  K.colRot = function (cx, cz, w, d, y0, y1, yaw, opts) {
    const o = K.yOff || 0;
    return G.world.addCollider(
      cx,
      cz,
      w,
      d,
      y0 + o,
      y1 + o,
      -(yaw || 0),
      opts || {},
    );
  };
  /** Shift the .y of every point-like value in an object by K.yOff (door targets / positions returned by builders). */
  K.shiftY = function (obj, off) {
    if (!off) return obj;
    for (const k in obj) {
      const v = obj[k];
      if (
        v &&
        typeof v === "object" &&
        typeof v.x === "number" &&
        typeof v.y === "number" &&
        typeof v.z === "number"
      )
        v.y += off;
    }
    return obj;
  };
  /** Collider for a wall segment A→B with thickness t; openings leave gaps (door holes, from their sill). */
  K.colWall = function (ax, az, bx, bz, t, y0, y1, openings, opts) {
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) return;
    const dx = (bx - ax) / L,
      dz = (bz - az) / L,
      yaw = -Math.atan2(bz - az, bx - ax);
    const H = y1 - y0;
    // Every opening is a real gap (from its sill to its head); the sill piece stays solid, so a window 1 m above a
    // floor still blocks (> step height) while a door raised onto an upper floor / platform is walkable.
    // (Round 1: the old version only opened holes with a sill < 0.6 m, which walled up every upper-floor doorway
    // of a multi-storey wall — MetLife's executive floor, Bellevue's theatre, the MSG bookie office…)
    const ops = (openings || [])
      .map((op) => {
        const sy = Math.max(0, op.y || 0),
          top = Math.min(
            H,
            sy + op.h - (op.arch ? op.w * 0.25 : op.pointed ? op.w * 0.3 : 0),
          );
        return [
          Math.max(0, op.at - op.w / 2),
          Math.min(L, op.at + op.w / 2),
          sy,
          top,
        ];
      })
      .filter((h) => h[1] - h[0] > 0.05 && h[3] - h[2] > 0.05);
    const cuts = [0, L];
    for (const h of ops) cuts.push(h[0], h[1]);
    const xs = Array.from(
      new Set(cuts.map((v) => Math.round(v * 1e4) / 1e4)),
    ).sort((p, q) => p - q);
    const pieces = [];
    for (let i = 0; i < xs.length - 1; i++) {
      const u0 = xs[i],
        u1 = xs[i + 1];
      if (u1 - u0 < 0.05) continue;
      const um = (u0 + u1) / 2;
      const gaps = ops
        .filter((h) => h[0] < um && h[1] > um)
        .map((h) => [h[2], h[3]])
        .sort((p, q) => p[0] - q[0]);
      let v = 0;
      for (const g of gaps) {
        if (g[0] > v + 0.02) pieces.push([u0, u1, v, g[0]]);
        v = Math.max(v, g[1]);
      }
      if (v < H - 0.02) pieces.push([u0, u1, v, H]);
    }
    pieces.sort((p, q) => p[2] - q[2] || p[3] - q[3] || p[0] - q[0]);
    for (let i = pieces.length - 1; i > 0; i--) {
      const a = pieces[i - 1],
        c2 = pieces[i];
      if (a[2] === c2[2] && a[3] === c2[3] && Math.abs(a[1] - c2[0]) < 1e-6) {
        a[1] = c2[1];
        pieces.splice(i, 1);
      }
    }
    for (const pc of pieces) {
      const m = (pc[0] + pc[1]) / 2;
      K.colRot(
        ax + dx * m,
        az + dz * m,
        pc[1] - pc[0],
        t,
        y0 + pc[2],
        y0 + pc[3],
        yaw,
        opts,
      );
    }
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
  Atlas.prototype.alloc = function (key, w, h, draw) {
    if (key && this.slots[key]) return this.slots[key];
    const pad = 3;
    w = Math.ceil(w);
    h = Math.ceil(h);
    const W = w + pad,
      Hh = h + pad;
    let bestY = Infinity,
      bestX = 0,
      bestI = -1;
    for (let i = 0; i < this.sky.length; i++) {
      const x = this.sky[i].x;
      if (x + W > this.W) break;
      let y = 0,
        span = 0,
        j = i;
      while (span < W && j < this.sky.length) {
        y = Math.max(y, this.sky[j].y);
        span += this.sky[j].w;
        j++;
      }
      if (span < W || y + Hh > this.H) continue;
      if (y < bestY) {
        bestY = y;
        bestX = x;
        bestI = i;
      }
    }
    if (bestI < 0) {
      if (!this.quiet)
        console.warn(
          "[poi_midtown] atlas " +
            this.name +
            " full: " +
            key +
            " " +
            w +
            "x" +
            h,
        );
      return { x: 0, y: 0, w, h, rect: [0, 0, 0.001, 0.001], full: true };
    }
    // update skyline
    const node = { x: bestX, y: bestY + Hh, w: W };
    const out = [];
    for (const n of this.sky) {
      const n0 = n.x,
        n1 = n.x + n.w,
        c0 = bestX,
        c1 = bestX + W;
      if (n1 <= c0 || n0 >= c1) {
        out.push(n);
        continue;
      }
      if (n0 < c0) out.push({ x: n0, y: n.y, w: c0 - n0 });
      if (n0 >= c0 && out.indexOf(node) < 0) out.push(node);
      else if (n0 < c0 && out.indexOf(node) < 0) out.push(node);
      if (n1 > c1) out.push({ x: c1, y: n.y, w: n1 - c1 });
    }
    out.sort((a2, b2) => a2.x - b2.x);
    const merged = [];
    for (const n of out) {
      const l = merged[merged.length - 1];
      if (l && l.y === n.y && l.x + l.w === n.x) l.w += n.w;
      else merged.push({ x: n.x, y: n.y, w: n.w });
    }
    this.sky = merged;
    const s = { x: bestX, y: bestY, w, h };
    const e = 1.5;
    s.rect = [
      (s.x + e) / this.W,
      1 - (s.y + h - e) / this.H,
      (s.x + w - e) / this.W,
      1 - (s.y + e) / this.H,
    ];
    if (draw) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(s.x, s.y, w, h);
      this.ctx.clip();
      this.ctx.translate(s.x, s.y);
      draw(this.ctx, w, h);
      this.ctx.restore();
    }
    if (key) this.slots[key] = s;
    this.used += w * h;
    this.tex.needsUpdate = true;
    return s;
  };
  K.Atlas = Atlas;
  K.atlases = {};
  K.atlas = function (name) {
    return K.atlases[name];
  };

  // ------------------------------------------------------------------
  // Glow points (fake lights) — one THREE.Points per size class
  // ------------------------------------------------------------------
