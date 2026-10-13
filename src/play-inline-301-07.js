// play-inline-301 07 — key
// Lines 1501-1849 of readable/play-inline-301.pretty.js (statement-aligned).
  Batch.prototype.lathe = function (key, prof, seg, x, y, z, o) {
    o = o || {};
    const pts = prof.map(
      (p) => new THREE.Vector2(Math.max(0.0001, p[0]), p[1]),
    );
    const geo = new THREE.LatheGeometry(pts, seg || 16, o.p0 || 0, o.pl || TAU);
    const m = P.m4(
      x,
      y,
      z,
      o.ry,
      o.rx,
      o.rz,
      o.sx || 1,
      o.sy || 1,
      o.sz || o.sx || 1,
    );
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  Batch.prototype.torus = function (key, x, y, z, R, r, arc, o) {
    o = o || {};
    const geo = new THREE.TorusGeometry(
      R,
      r,
      o.rs || 6,
      o.ts || 24,
      arc || TAU,
    );
    const m = P.m4(x, y, z, o.ry, o.rx, o.rz, o.sx || 1, o.sy || 1, o.sz || 1);
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  /** Quad centred at (x,y,z), size w×h; faces +Z when ry=0. uv kept 0..1 by default. */
  Batch.prototype.quad = function (key, x, y, z, w, h, o) {
    o = o || {};
    const geo = new THREE.PlaneGeometry(w, h, o.ws || 1, o.hs || 1);
    const m = P.m4(x, y, z, o.ry, o.rx, o.rz);
    if (o.m) m.premultiply(o.m);
    return this.add(
      key,
      geo,
      Object.assign({ uv: "keep", grime: 0.1, noAO: true }, o, { m }),
    );
  };
  Batch.prototype.geo = function (key, geo, m, o) {
    return this.add(key, geo, Object.assign({}, o || {}, { m }));
  };
  /** Extrude a THREE.Shape (XY) by depth along +Z, then transform by m. */
  Batch.prototype.extrude = function (key, shape, depth, m, o) {
    o = o || {};
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: o.curve || 10,
    });
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  /** Add a geometry seen from INSIDE (winding + normals flipped): vaults, domes, drums. */
  Batch.prototype.inside = function (key, geo, m, o) {
    return this.add(key, P.flipGeo(geo), Object.assign({}, o || {}, { m }));
  };
  /** Irregular rock / rubble lump. */
  Batch.prototype.rock = function (key, x, y, z, r, o) {
    o = o || {};
    const geo = new THREE.IcosahedronGeometry(
      r,
      o.detail === undefined ? 1 : o.detail,
    );
    const p = geo.attributes.position,
      seed = o.seed || x * 13.1 + z * 7.7 + y * 3.3;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i),
        vy = p.getY(i),
        vz = p.getZ(i);
      const n =
        U.fbm2((vx / r) * 1.2 + seed, (vz / r) * 1.2 + (vy / r) * 0.6) - 0.5;
      const k = 1 + n * (o.rough === undefined ? 0.6 : o.rough);
      p.setXYZ(i, vx * k, vy * k * (o.flat || 1), vz * k);
    }
    geo.computeVertexNormals();
    const m = P.m4(
      x,
      y,
      z,
      o.ry || seed % 6,
      o.rx || 0,
      o.rz || 0,
      o.sx || 1,
      o.sy || 1,
      o.sz || 1,
    );
    return this.add(key, geo, Object.assign({ grime: 0.5 }, o, { m }));
  };
  // ---- UV projection + vertex colour AO / grime -------------------------
  function shade(g, key, o, b) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    const bk = baseKey(key),
      def = MAT[bk];
    const keep =
      o.uv === "keep" || bk.indexOf("tex:") === 0 || (def && def.keep);
    if (!keep) {
      const s = 1 / (o.uvScale || metersFor(bk));
      const arr = new Float32Array(cnt * 2);
      for (let i = 0; i < cnt; i++) {
        const nx = Math.abs(n.getX(i)),
          ny = Math.abs(n.getY(i)),
          nz = Math.abs(n.getZ(i));
        const x = p.getX(i),
          y = p.getY(i),
          z = p.getZ(i);
        let u, v;
        if (ny >= nx && ny >= nz) {
          u = x;
          v = z;
        } else if (nx >= nz) {
          u = z;
          v = y;
        } else {
          u = x;
          v = y;
        }
        arr[i * 2] = u * s;
        arr[i * 2 + 1] = v * s;
      }
      g.setAttribute("uv", new THREE.BufferAttribute(arr, 2));
    } else {
      let uv = g.attributes.uv;
      if (!uv) {
        uv = new THREE.BufferAttribute(new Float32Array(cnt * 2), 2);
        g.setAttribute("uv", uv);
      } else if (o.uvRect) {
        const R = o.uvRect;
        for (let i = 0; i < cnt; i++)
          uv.setXY(
            i,
            R[0] + uv.getX(i) * (R[2] - R[0]),
            R[1] + uv.getY(i) * (R[3] - R[1]),
          );
      } else if (o.us || o.vs) {
        for (let i = 0; i < cnt; i++)
          uv.setXY(i, uv.getX(i) * (o.us || 1), uv.getY(i) * (o.vs || 1));
      }
    }
    const col = new Float32Array(cnt * 3);
    const tint = new THREE.Color(o.c === undefined ? 0xffffff : o.c);
    const grime = o.grime === undefined ? b.grime : o.grime;
    const ground = (o.ground === undefined ? b.ground : o.ground) + b.oy;
    const aoH = o.aoH || b.aoH,
      noAO = !!o.noAO,
      aoK = b.ao;
    for (let i = 0; i < cnt; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      let k = 1;
      if (!noAO) {
        const t = U.clamp((y - ground + 0.2) / aoH, 0, 1);
        k *= 1 - aoK + aoK * t * t * (3 - 2 * t);
      }
      let gr = 0;
      if (grime > 0) {
        const blot = U.fbm2(x * 0.11 + z * 0.05 + 3.1, y * 0.13 + z * 0.09, 3);
        const streak = U.noise2((x + z) * 0.9, y * 0.02 + 7.3);
        gr =
          grime *
          (Math.max(0, blot - 0.42) * 1.3 + Math.max(0, streak - 0.58) * 0.8);
        if (n.getY(i) > 0.7) gr += grime * 0.2;
        gr = Math.min(0.8, gr);
        k *=
          0.92 +
          0.16 * U.hash2(Math.floor(x * 2.3), Math.floor(z * 2.3 + y * 1.7));
      }
      col[i * 3] = (tint.r * (1 - gr) + GRIME.r * gr) * k;
      col[i * 3 + 1] = (tint.g * (1 - gr) + GRIME.g * gr) * k;
      col[i * 3 + 2] = (tint.b * (1 - gr) + GRIME.b * gr) * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  // ---- baked light --------------------------------------------------
  function bake(g, lights, amb) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    if (!g.boundingSphere) g.computeBoundingSphere();
    const bs = g.boundingSphere;
    const L = lights.filter((l) => l.p.distanceTo(bs.center) < l.r + bs.radius);
    const out = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {
      let r = amb ? amb.r : 0,
        gg = amb ? amb.g : 0,
        bb = amb ? amb.b : 0;
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i),
        nx = n.getX(i),
        ny = n.getY(i),
        nz = n.getZ(i);
      for (let k = 0; k < L.length; k++) {
        const l = L[k];
        const dx = l.p.x - x,
          dy = l.p.y - y,
          dz = l.p.z - z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > l.r * l.r) continue;
        const d = Math.sqrt(d2) || 1e-3;
        const f = 1 - d / l.r,
          att = f * f * l.i;
        const ndl = (nx * dx + ny * dy + nz * dz) / d;
        const w = att * (0.22 + 0.78 * Math.max(0, ndl));
        r += l.c.r * w;
        gg += l.c.g * w;
        bb += l.c.b * w;
      }
      out[i * 3] = Math.min(1.8, r);
      out[i * 3 + 1] = Math.min(1.8, gg);
      out[i * 3 + 2] = Math.min(1.8, bb);
    }
    g.setAttribute("bake", new THREE.BufferAttribute(out, 3));
  }
  function mergeAll(geoms) {
    const names = Object.keys(geoms[0].attributes).filter((nm) =>
      geoms.every(
        (g) =>
          g.attributes[nm] &&
          g.attributes[nm].itemSize === geoms[0].attributes[nm].itemSize,
      ),
    );
    let count = 0;
    for (const g of geoms) count += g.attributes.position.count;
    const out = new THREE.BufferGeometry();
    for (const nm of names) {
      const size = geoms[0].attributes[nm].itemSize,
        arr = new Float32Array(count * size);
      let off = 0;
      for (const g of geoms) {
        arr.set(
          g.attributes[nm].array.subarray(
            0,
            g.attributes.position.count * size,
          ),
          off,
        );
        off += g.attributes.position.count * size;
      }
      out.setAttribute(nm, new THREE.BufferAttribute(arr, size));
    }
    out.computeBoundingSphere();
    out.computeBoundingBox();
    return out;
  }
  P.mergeAll = mergeAll;
  /** Merge everything into one mesh per material under parent. o: {shadow (cast), lod (dist for detail mats), receive} */
  Batch.prototype.build = function (parent, o) {
    o = o || {};
    const group = new THREE.Group();
    group.name = "pe_" + this.name;
    const byKey = new Map();
    for (const it of this.items) {
      let key = it.key;
      if (
        this.lit &&
        !isEmissive(key) &&
        key.indexOf("tex:") !== 0 &&
        !it.noBake
      ) {
        bake(it.g, this.lights, this.ambient);
        key = key + "@lit";
      } else if (this.lit && key.indexOf("tex:") === 0 && !it.noBake) {
        bake(it.g, this.lights, this.ambient);
        key = key + "@lit";
      }
      let arr = byKey.get(key);
      if (!arr) {
        arr = [];
        byKey.set(key, arr);
      }
      arr.push(it.g);
    }
    for (const [key, arr] of byKey) {
      // bakes/no-bakes of one material must share attribute sets → split by attribute signature
      const sigs = new Map();
      for (const g of arr) {
        const s = Object.keys(g.attributes).sort().join(",");
        let a = sigs.get(s);
        if (!a) {
          a = [];
          sigs.set(s, a);
        }
        a.push(g);
      }
      for (const list of sigs.values()) {
        let chunk = [],
          cnt = 0;
        const flush = () => {
          if (!chunk.length) return;
          const geo = mergeAll(chunk);
          for (const g of chunk) g.dispose();
          let mat =
            key.indexOf("tex:") === 0
              ? P.mat(key.replace("@lit", ""))
              : P.mat(key);
          if (key.indexOf("tex:") === 0 && key.slice(-4) === "@lit")
            mat = texBaked(key);
          const mesh = new THREE.Mesh(geo, mat);
          mesh.name = this.name + ":" + key;
          const bk = baseKey(key);
          mesh.castShadow = !!o.shadow && !NO_SHADOW.has(bk) && !DETAIL.has(bk);
          mesh.receiveShadow = o.receive !== false;
          mesh.matrixAutoUpdate = false;
          mesh.updateMatrix();
          group.add(mesh);
          if (
            o.lod &&
            (DETAIL.has(bk) || geo.attributes.position.count < 3000)
          ) {
            try {
              G.world.addLOD(
                mesh,
                o.lod + geo.boundingSphere.radius,
                geo.boundingSphere.center.clone(),
              );
            } catch (e) {
              /* core */
            }
          }
          chunk = [];
          cnt = 0;
        };
        for (const g of list) {
          chunk.push(g);
          cnt += g.attributes.position.count;
          if (cnt > 500000) flush();
        }
        flush();
      }
    }
    this.items = [];
    if (parent) parent.add(group);
    return group;
  };
  function texBaked(key) {
    if (matCache[key]) return matCache[key];
    return (matCache[key] = bakedVariant(P.mat(key.slice(0, -4)), key));
  }

  /** Flip a geometry inside-out (non-indexed result). */
