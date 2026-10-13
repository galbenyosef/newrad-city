// play-inline-440 04 — three
// Lines 985-1325 of readable/play-inline-440.pretty.js (statement-aligned).
  class Batcher {
    constructor(name, chunk, lodDist, opts) {
      this.name = name;
      this.chunk = chunk;
      this.lod = lodDist;
      this.opts = opts || {};
      this.cells = new Map();
      this.count = 0;
      this.tris = 0;
    }
    add(pr, x, y, z, yaw, o) {
      o = o || {};
      const cx = Math.floor(x / this.chunk),
        cz = Math.floor(z / this.chunk),
        key = cx + "," + cz;
      let cell = this.cells.get(key);
      if (!cell) {
        cell = { cx, cz, items: [] };
        this.cells.set(key, cell);
      }
      const sc = o.s === undefined ? 1 : o.s;
      // o.mirror: reflect across the prop's own X axis (left/right) — winding is flipped at build time
      const m = xform({
        x,
        y,
        z,
        ry: yaw || 0,
        rx: o.rx || 0,
        rz: o.rz || 0,
        s: o.mirror ? [-sc, sc, sc] : sc,
      }).clone();
      cell.items.push({
        pr,
        m,
        tint: o.tint ? X.color(o.tint) : null,
        rec: o.rec || null,
        flip: !!o.mirror,
      });
      if (o.rec) {
        o.rec.ranges = o.rec.ranges || [];
        o.rec.batcher = this;
      }
      this.count++;
      this.tris += pr.tris;
    }
    build(parent) {
      const nm = new THREE.Matrix3();
      const out = [];
      for (const cell of this.cells.values()) {
        const byMat = new Map();
        for (const it of cell.items) {
          for (const part of it.pr.parts) {
            const mk = STATIC_REMAP[part.mat] || part.mat;
            if (!byMat.has(mk)) byMat.set(mk, []);
            byMat.get(mk).push({
              part,
              m: it.m,
              tint: part.tint ? it.tint : null,
              rec: it.rec,
              flip: it.flip,
            });
          }
        }
        const grp = new THREE.Group();
        grp.name = "props_" + this.name + "_" + cell.cx + "_" + cell.cz;
        for (const [mk, list] of byMat) {
          let vc = 0,
            ic = 0;
          for (const e of list) {
            vc += e.part.geom.attributes.position.count;
            ic += e.part.geom.index
              ? e.part.geom.index.count
              : e.part.geom.attributes.position.count;
          }
          const pos = new Float32Array(vc * 3),
            nor = new Float32Array(vc * 3),
            uv = new Float32Array(vc * 2),
            col = new Float32Array(vc * 3);
          const idx = vc > 65535 ? new Uint32Array(ic) : new Uint16Array(ic);
          let vo = 0,
            io = 0;
          const v = new THREE.Vector3();
          const recRanges = [];
          for (const e of list) {
            if (e.rec)
              recRanges.push(e.rec, vo, e.part.geom.attributes.position.count);
            const g = e.part.geom,
              gp = g.attributes.position,
              gn = g.attributes.normal,
              gu = g.attributes.uv,
              gc = g.attributes.color;
            nm.getNormalMatrix(e.m);
            const me = e.m.elements,
              ne = nm.elements;
            const tr = e.tint ? e.tint.r : 1,
              tg = e.tint ? e.tint.g : 1,
              tb = e.tint ? e.tint.b : 1;
            const wuv = WHITE_UV_MATS[e.part.mat]
              ? X.atlasRegion("white")
              : null;
            for (let i = 0; i < gp.count; i++) {
              const px = gp.array[i * 3],
                py = gp.array[i * 3 + 1],
                pz = gp.array[i * 3 + 2];
              const o3 = (vo + i) * 3;
              pos[o3] = me[0] * px + me[4] * py + me[8] * pz + me[12];
              pos[o3 + 1] = me[1] * px + me[5] * py + me[9] * pz + me[13];
              pos[o3 + 2] = me[2] * px + me[6] * py + me[10] * pz + me[14];
              const nx = gn.array[i * 3],
                ny = gn.array[i * 3 + 1],
                nz = gn.array[i * 3 + 2];
              v.set(
                ne[0] * nx + ne[3] * ny + ne[6] * nz,
                ne[1] * nx + ne[4] * ny + ne[7] * nz,
                ne[2] * nx + ne[5] * ny + ne[8] * nz,
              ).normalize();
              nor[o3] = v.x;
              nor[o3 + 1] = v.y;
              nor[o3 + 2] = v.z;
              if (wuv) {
                uv[(vo + i) * 2] = (wuv.u0 + wuv.u1) / 2;
                uv[(vo + i) * 2 + 1] = (wuv.v0 + wuv.v1) / 2;
              } else {
                uv[(vo + i) * 2] = gu.array[i * 2];
                uv[(vo + i) * 2 + 1] = gu.array[i * 2 + 1];
              }
              col[o3] = gc.array[i * 3] * tr;
              col[o3 + 1] = gc.array[i * 3 + 1] * tg;
              col[o3 + 2] = gc.array[i * 3 + 2] * tb;
            }
            if (g.index) {
              const ia = g.index.array;
              if (e.flip)
                for (let i = 0; i + 2 < ia.length; i += 3) {
                  idx[io++] = ia[i] + vo;
                  idx[io++] = ia[i + 2] + vo;
                  idx[io++] = ia[i + 1] + vo;
                }
              else for (let i = 0; i < ia.length; i++) idx[io++] = ia[i] + vo;
            } else if (e.flip)
              for (let i = 0; i + 2 < gp.count; i += 3) {
                idx[io++] = i + vo;
                idx[io++] = i + 2 + vo;
                idx[io++] = i + 1 + vo;
              }
            else for (let i = 0; i < gp.count; i++) idx[io++] = i + vo;
            vo += gp.count;
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
          geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
          geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
          geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
          geo.setIndex(new THREE.BufferAttribute(idx, 1));
          geo.computeBoundingSphere();
          geo.computeBoundingBox();
          for (let i = 0; i < recRanges.length; i += 3)
            recRanges[i].ranges.push(
              geo.attributes.position,
              recRanges[i + 1],
              recRanges[i + 2],
            );
          const mesh = new THREE.Mesh(geo, X.mat(mk));
          mesh.castShadow =
            !!this.opts.castShadow && mk !== "glow" && mk !== "screen";
          mesh.receiveShadow = true;
          mesh.matrixAutoUpdate = false;
          mesh.updateMatrix();
          grp.add(mesh);
        }
        grp.matrixAutoUpdate = false;
        parent.add(grp);
        const center = new THREE.Vector3(
          (cell.cx + 0.5) * this.chunk,
          0,
          (cell.cz + 0.5) * this.chunk,
        );
        // LOD distance is measured from chunk centre → pad by half diagonal
        G.world.addLOD(grp, this.lod + this.chunk * 0.7, center);
        out.push(grp);
      }
      this.groups = out;
      this.cells.clear();
      return out;
    }
  }
  /**
   * Hide one already-built batched item (put() with o.rec): collapses its vertices onto its first vertex
   * (degenerate triangles, nothing drawn). Used by the door guard for props that ended up in front of a
   * door that another module added after the city was dressed.
   */
  Batcher.hideItem = function (rec) {
    if (!rec || !rec.ranges || rec.hidden) return false;
    const r = rec.ranges;
    for (let i = 0; i < r.length; i += 3) {
      const attr = r[i],
        s = r[i + 1],
        n = r[i + 2],
        a = attr.array;
      const x0 = a[s * 3],
        y0 = a[s * 3 + 1],
        z0 = a[s * 3 + 2];
      for (let k = s + 1; k < s + n; k++) {
        a[k * 3] = x0;
        a[k * 3 + 1] = y0;
        a[k * 3 + 2] = z0;
      }
      attr.needsUpdate = true;
    }
    rec.hidden = true;
    return true;
  };
  X.Batcher = Batcher;

  // ------------------------------------------------------------------
  // GlowField — fake lights: one Points draw call. Per-point colour, size
  // (metres), flicker amount/phase. Night factor boosts intensity.
  // ------------------------------------------------------------------
  const GLOW_VS = [
    "attribute float size; attribute vec3 gcolor; attribute vec2 fl;",
    "uniform float time; uniform float night; uniform float pxScale;",
    "varying vec3 vC; varying float vA;",
    "float h1(float n){ return fract(sin(n)*43758.5453); }",
    "void main(){",
    "  vec4 mv = modelViewMatrix * vec4(position, 1.0);",
    "  float t = time * 9.0 + fl.y * 31.0;",
    "  float f = 1.0;",
    "  float inside = step(1.5, fl.x); float fk = fl.x - 2.0 * inside;", // fl.x >= 2: interior light (ignores daylight)
    "  if (fk > 0.0) { float r = h1(floor(t)); f = mix(1.0, step(0.35, r) * (0.75 + 0.25*h1(floor(t*3.1))), fk); }",
    "  float d = -mv.z;",
    "  vA = f * mix(mix(0.12, 1.0, night), 0.85, inside) * clamp(1.4 - d / 900.0, 0.0, 1.0);",
    "  vC = gcolor;",
    "  gl_PointSize = clamp(size * pxScale / max(d, 0.5), 0.0, 256.0);",
    "  gl_Position = projectionMatrix * mv;",
    "}",
  ].join("\n");
  const GLOW_FS = [
    "varying vec3 vC; varying float vA;",
    "void main(){",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0; float r = dot(p, p);",
    "  if (r > 1.0) discard;",
    "  float a = pow(1.0 - r, 2.2) * vA;",
    "  float core = pow(max(0.0, 1.0 - r * 6.0), 2.0) * vA;",
    "  gl_FragColor = vec4(vC * a + vec3(core) * 0.6, 1.0);",
    "}",
  ].join("\n");
  class GlowField {
    constructor(cap) {
      this.cap = cap;
      this.n = 0;
      const g = new THREE.BufferGeometry();
      this.pos = new Float32Array(cap * 3);
      this.col = new Float32Array(cap * 3);
      this.size = new Float32Array(cap);
      this.fl = new Float32Array(cap * 2);
      g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
      g.setAttribute("gcolor", new THREE.BufferAttribute(this.col, 3));
      g.setAttribute("size", new THREE.BufferAttribute(this.size, 1));
      g.setAttribute("fl", new THREE.BufferAttribute(this.fl, 2));
      g.setDrawRange(0, 0);
      this.geo = g;
      this.mat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          night: { value: 0 },
          pxScale: { value: 600 },
        },
        vertexShader: GLOW_VS,
        fragmentShader: GLOW_FS,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      this.points = new THREE.Points(g, this.mat);
      this.points.frustumCulled = false;
      this.points.renderOrder = 5;
      this.points.name = "props_glowfield";
      this.free = [];
    }
    /** Returns slot index (use set/remove). */
    add(x, y, z, color, size, flicker, interior) {
      let i = this.free.length ? this.free.pop() : this.n++;
      if (i >= this.cap) {
        this.n = this.cap;
        return -1;
      }
      const c = X.color(color);
      this.pos[i * 3] = x;
      this.pos[i * 3 + 1] = y;
      this.pos[i * 3 + 2] = z;
      this.col[i * 3] = c.r;
      this.col[i * 3 + 1] = c.g;
      this.col[i * 3 + 2] = c.b;
      this.size[i] = size;
      this.fl[i * 2] = (flicker || 0) + (interior ? 2 : 0);
      this.fl[i * 2 + 1] = Math.random();
      this.dirty = true;
      return i;
    }
    setColor(i, color, size) {
      if (i < 0) return;
      const c = X.color(color);
      this.col[i * 3] = c.r;
      this.col[i * 3 + 1] = c.g;
      this.col[i * 3 + 2] = c.b;
      if (size !== undefined) this.size[i] = size;
      this.dirty = true;
    }
    setPos(i, x, y, z) {
      if (i < 0) return;
      this.pos[i * 3] = x;
      this.pos[i * 3 + 1] = y;
      this.pos[i * 3 + 2] = z;
      this.dirty = true;
    }
    remove(i) {
      if (i < 0) return;
      this.size[i] = 0;
      this.free.push(i);
      this.dirty = true;
    }
    update(time, night, h) {
      this.mat.uniforms.time.value = time;
      this.mat.uniforms.night.value = night;
      this.mat.uniforms.pxScale.value =
        h / (2 * Math.tan((G.camera.fov * Math.PI) / 180 / 2));
      if (this.dirty) {
        this.dirty = false;
        for (const k of ["position", "gcolor", "size", "fl"])
          this.geo.attributes[k].needsUpdate = true;
        this.geo.setDrawRange(0, this.n);
      }
    }
  }
  X.GlowField = GlowField;

  // ------------------------------------------------------------------
  // FlameField — instanced camera-facing quads animated in the shader.
  // kind 0 = flame (additive), kind 1 = smoke (alpha).
  // Emitters own a contiguous run of particle slots.
  // ------------------------------------------------------------------
