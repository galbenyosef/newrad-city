// play-inline-454 07 — geo
// Lines 1660-2014 of readable/play-inline-454.pretty.js (statement-aligned).
  class Rig {
    constructor(kind) {
      this.kind = kind || "biped";
      this.bones = []; // {name, parent, pos:[x,y,z], part, world:[x,y,z]}
      this.map = {};
      this.prims = []; // {bone, geo(with color/pbr), part}
      this.hit = []; // hit volumes {part, bone, a:[x,y,z], b:[x,y,z], r}
      this.markers = {}; // part → {bone, pos:[x,y,z], r}
      this.sockets = {}; // name → {bone, pos, rot}
      this.meta = {};
      this.soft = []; // per bone: soft joint at the bone's origin {r, reach, axis} (smooth skinning)
    }
    /**
     * Mark the joint at `name`'s origin as SOFT: vertices within ±r (along the
     * joint axis) and within `reach` of the axis are linearly blended between the
     * bone and its parent (and the parent's geometry toward this bone), so
     * elbows, knees, hips and the waist bend as one smooth surface instead of
     * rigid overlapping segments. axis defaults to the direction to the bone's
     * first child (or away from the parent).
     */
    softJoint(name, r, reach, axis) {
      const bi = this.map[name];
      if (bi === undefined || this.bones[bi].parent < 0) return;
      let ax = axis;
      if (!ax) {
        const ch = this.bones.find((b) => b.parent === bi);
        const v = ch ? ch.pos : this.bones[bi].pos;
        const l = Math.hypot(v[0], v[1], v[2]) || 1;
        ax = [v[0] / l, v[1] / l, v[2] / l];
      }
      this.soft[bi] = { r, reach, axis: ax };
    }
    /** Add a bone. pos is relative to parent. part: body part this bone belongs to (inherits parent's if omitted). */
    bone(name, parent, x, y, z, part) {
      const pi = parent ? this.map[parent] : -1;
      if (parent && pi === undefined)
        throw new Error("Rig: unknown parent bone " + parent);
      const pw = pi >= 0 ? this.bones[pi].world : [0, 0, 0];
      const b = {
        name,
        parent: pi,
        pos: [x, y, z],
        part: part || (pi >= 0 ? this.bones[pi].part : "torso"),
        world: [pw[0] + x, pw[1] + y, pw[2] + z],
      };
      this.map[name] = this.bones.length;
      this.bones.push(b);
      return this.bones.length - 1;
    }
    has(name) {
      return this.map[name] !== undefined;
    }
    world(name) {
      const b = this.bones[this.map[name]];
      return b ? b.world : [0, 0, 0];
    }
    /**
     * Attach geometry to a bone. o: {color, color2 (gradient top), grad:[bottomMul, topMul], noise,
     *   rough, metal, emis, region, uvScale, paint(fn(x,y,z,nx,ny,nz, out[3])), part}
     * geometry is in the bone's local space.
     */
    add(boneName, geo, o) {
      o = o || {};
      const bi = this.map[boneName];
      if (bi === undefined) {
        geo.dispose();
        return;
      }
      if (!geo.attributes.normal) geo.computeVertexNormals();
      // keep only the attributes we use (indexed geometry is preserved)
      for (const k of Object.keys(geo.attributes))
        if (k !== "position" && k !== "normal" && k !== "uv")
          geo.deleteAttribute(k);
      // open surfaces (coat panels, masks, hoods, decals) get an inner shell so the
      // shared material can use back-face culling
      if (!o.noDouble && L.isOpen(geo)) geo = L.doubleSided(geo);
      const n = geo.attributes.position.count;
      const pos = geo.attributes.position,
        nor = geo.attributes.normal;
      // --- vertex colours ---
      const base = L.col(o.color === undefined ? 0xaaaaaa : o.color);
      // near-black fabrics/paints vanish under the game's dim overcast light:
      // lift explicit material classes to a readable floor (tiny details keep true black)
      if (o.region && !o.keepDark && o.region !== "grille") {
        const lum = base.r * 0.2126 + base.g * 0.7152 + base.b * 0.0722;
        const floor = 0.026; // ≈ sRGB #2c: still reads as black, but keeps folds & panel lines visible
        if (lum < floor) {
          const k = lum > 1e-5 ? floor / lum : 0;
          if (k) base.multiplyScalar(k);
          else base.setRGB(floor, floor, floor);
        }
      }
      const top = o.color2 !== undefined ? L.col(o.color2) : null;
      const grad = o.grad || [0.9, 1.06];
      const noiseAmt = o.noise === undefined ? 0.12 : o.noise;
      geo.computeBoundingBox();
      const bb = geo.boundingBox;
      const hy = Math.max(1e-4, bb.max.y - bb.min.y);
      const col = new Float32Array(n * 3);
      const bw = this.bones[bi].world;
      const tmp = [0, 0, 0];
      const cc = new THREE.Color();
      for (let i = 0; i < n; i++) {
        const x = pos.getX(i),
          y = pos.getY(i),
          z = pos.getZ(i);
        const t = (y - bb.min.y) / hy;
        cc.copy(base);
        if (top) cc.lerp(top, t);
        const g = lerp(grad[0], grad[1], t);
        // grime noise in world-bind space (so parts line up)
        const wx = x + bw[0],
          wy = y + bw[1],
          wz = z + bw[2];
        const nz =
          (L.noise3(wx * 9, wy * 9, wz * 9) - 0.5) * 2 * noiseAmt +
          (L.hash3(wx * 97, wy * 97, wz * 97) - 0.5) * noiseAmt * 0.5;
        let r = cc.r * g * (1 + nz),
          gg = cc.g * g * (1 + nz),
          b = cc.b * g * (1 + nz * 0.9);
        if (o.paint) {
          tmp[0] = r;
          tmp[1] = gg;
          tmp[2] = b;
          o.paint(
            x,
            y,
            z,
            nor.getX(i),
            nor.getY(i),
            nor.getZ(i),
            tmp,
            wx,
            wy,
            wz,
          );
          r = tmp[0];
          gg = tmp[1];
          b = tmp[2];
        }
        if (o.vtint) {
          const vi = (i % (o.vtint.length / 3)) * 3;
          r *= o.vtint[vi];
          gg *= o.vtint[vi + 1];
          b *= o.vtint[vi + 2];
        } // baked AO / blush
        col[i * 3] = clamp(r, 0, 4);
        col[i * 3 + 1] = clamp(gg, 0, 4);
        col[i * 3 + 2] = clamp(b, 0, 4);
      }
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      // --- PBR attribute ---
      const pbr = new Float32Array(n * 3);
      const rough = o.rough === undefined ? 0.85 : o.rough,
        metal = o.metal || 0,
        emis = o.emis || 0;
      for (let i = 0; i < n; i++) {
        pbr[i * 3] = rough;
        pbr[i * 3 + 1] = metal;
        pbr[i * 3 + 2] = emis;
      }
      geo.setAttribute("pbr", new THREE.BufferAttribute(pbr, 3));
      // --- material class (per-instance tint) ---
      let cls = o.cls;
      if (cls === undefined) {
        const rg = o.region;
        if (emis > 0.3 || rg === "grille" || o.uvClamp)
          cls = 0; // lights, decals, screens keep their colour
        else if (rg === "skin" || rg === "crackskin") cls = 2;
        else if (rg === "fur") cls = 3;
        else if (rg === "cloth" || rg === "rags" || rg === "denim") cls = 1;
        else if (rg === "leather") cls = 4;
        else if (rg === "metal" || rg === "raidpaint" || metal > 0.3) cls = 5;
        else cls = 0;
      }
      geo.setAttribute(
        "mcls",
        new THREE.BufferAttribute(new Float32Array(n).fill(cls), 1),
      );
      // HAIR COVERAGE (hair shells): per-vertex 0..1 → mcls 2.55..3.0 (still class 3 = hair tint);
      // the shader discards strand-shaped gaps where coverage < 1 (soft, stranded hairlines and
      // a broken-up silhouette instead of a painted helmet edge)
      const hcv = geo.userData.hairCov;
      if (hcv && hcv.length === n && cls === 3) {
        const m = geo.attributes.mcls.array;
        for (let i = 0; i < n; i++) m[i] = 3 - 0.45 * (1 - clamp(hcv[i], 0, 1));
      }
      // --- UVs into atlas region ---
      const region = o.region || (metal > 0.3 ? "metal" : "grime");
      let uv = geo.attributes.uv;
      const uvOut = new Float32Array(n * 2);
      const us = o.uvScale || 1;
      if (o.faceUV && uv) {
        // face texture space: geometry uv = (s, t) with t = 0 at the canvas top
        for (let i = 0; i < n; i++) {
          uvOut[i * 2] = 2 + clamp(uv.getX(i), 0, 0.999);
          uvOut[i * 2 + 1] = 1 - clamp(uv.getY(i), 0, 1);
        }
      } else
        for (let i = 0; i < n; i++) {
          let u, v;
          if (uv && !o.boxUV) {
            u = uv.getX(i);
            v = uv.getY(i);
            if (us !== 1) {
              u = u * us;
              v = v * us;
              u -= Math.floor(u);
              v -= Math.floor(v);
            }
          } else {
            // box projection (no wrapping: parts sit within ~±1 m of their bone)
            const ax = Math.abs(nor.getX(i)),
              ay = Math.abs(nor.getY(i));
            const x = pos.getX(i),
              y = pos.getY(i),
              z = pos.getZ(i);
            if (ax > ay && ax > Math.abs(nor.getZ(i))) {
              u = z;
              v = y;
            } else if (ay > Math.abs(nor.getZ(i))) {
              u = x;
              v = z;
            } else {
              u = x;
              v = y;
            }
            u = u * 0.45 * us + 0.5;
            v = v * 0.45 * us + 0.5;
          }
          u = clamp(u, 0, 1);
          v = clamp(v, 0, 1);
          const t = L.regionUV(region, u, 1 - v);
          uvOut[i * 2] = t[0];
          uvOut[i * 2 + 1] = t[1];
        }
      geo.setAttribute("uv", new THREE.BufferAttribute(uvOut, 2));
      const part = o.part || this.bones[bi].part;
      geo.userData.part = part;
      geo.userData.keepLod = !!o.keepLod || emis > 0.8; // glowing eyes & lamps survive LOD
      geo.userData.rigid = !!o.rigid; // never soft-skinned (lenses, gadgets, straps)
      // custom skin weights (faces: chin → jaw, mouth corners, brows, cheeks):
      // o.skin(wx, wy, wz) → [[boneName, weight], …] (≤3 extra influences, the
      // rest stays on this bone). Evaluated in bind WORLD space.
      if (typeof o.skin === "function") {
        const idx = new Uint16Array(n * 4),
          wts = new Float32Array(n * 4);
        let any = false;
        for (let i = 0; i < n; i++) {
          const list = o.skin(
            pos.getX(i) + bw[0],
            pos.getY(i) + bw[1],
            pos.getZ(i) + bw[2],
          );
          let sum = 0,
            m = 0;
          idx[i * 4] = bi;
          if (list)
            for (const e of list) {
              if (m >= 3) break;
              const ob = this.map[e[0]],
                w = e[1];
              if (ob === undefined || !(w > 0.004)) continue;
              idx[i * 4 + 1 + m] = ob;
              wts[i * 4 + 1 + m] = w;
              sum += w;
              m++;
            }
          if (sum > 1) {
            for (let q = 1; q <= m; q++) wts[i * 4 + q] /= sum;
            sum = 1;
          }
          wts[i * 4] = 1 - sum;
          if (m) any = true;
        }
        if (any) geo.userData.infl = { idx, w: wts };
      }
      this.prims.push({ bone: bi, geo, part, rigid: !!o.rigid });
      return geo;
    }
    /** Same as add() but geometry is given in bind WORLD space (creature builders). */
    addW(boneName, geo, o) {
      const bi = this.map[boneName];
      if (bi === undefined) {
        geo.dispose();
        return;
      }
      const w = this.bones[bi].world;
      geo.translate(-w[0], -w[1], -w[2]);
      return this.add(boneName, geo, o);
    }
    /** Decal quad mapped to a full atlas region (uv 0..1 → region), white vertex colour. */
    decal(boneName, region, w, h, x, y, z, rx, ry, rz, o) {
      const g = P.decal(w, h);
      P.xf(g, x, y, z, rx || 0, ry || 0, rz || 0);
      o = Object.assign(
        { color: 0xffffff, noise: 0.04, grad: [1, 1], region, uvClamp: true },
        o || {},
      );
      return this.add(boneName, g, o);
    }
    /** Hit volume (capsule a→b in bone-local space) for raycasts & part targeting. */
    hitVol(part, boneName, a, b, r) {
      const bi = this.map[boneName];
      if (bi === undefined) return;
      this.hit.push({ part, bone: bi, a, b, r });
    }
    /** Part marker: the Object3D exposed as char.parts[part]. */
    marker(part, boneName, x, y, z, r) {
      const bi = this.map[boneName];
      if (bi === undefined) return;
      this.markers[part] = { bone: bi, pos: [x, y, z], r: r || 0.2 };
    }
    /** Named socket (weapon grip, muzzle, jet, eyes…). */
    socket(name, boneName, x, y, z, rx, ry, rz) {
      const bi = this.map[boneName];
      if (bi === undefined) return;
      this.sockets[name] = {
        bone: bi,
        pos: [x, y, z],
        rot: [rx || 0, ry || 0, rz || 0],
      };
    }

    /** Merge all prims into one skinned geometry. Returns a template object. */
    build() {
      const perBone = this.bones.map(() => []);
      for (const p of this.prims) perBone[p.bone].push(p.geo);
      const soft = this.bones.map((b, i) => this.soft[i] || null);
      const geo = L.mergeSkinned(this.prims, this.bones, soft);
      const tpl = {
        kind: this.kind,
        geometry: geo,
        bones: this.bones.map((b) => ({
          name: b.name,
          parent: b.parent,
          pos: b.pos.slice(),
          part: b.part,
          world: b.world.slice(),
        })),
        map: Object.assign({}, this.map),
        perBone, // bone-local geometries (non-skinned), used for gibs & LOD
        hit: this.hit.slice(),
        markers: Object.assign({}, this.markers),
        sockets: Object.assign({}, this.sockets),
        meta: Object.assign({}, this.meta),
        soft,
        triangles: geo.index.count / 3,
        vertices: geo.attributes.position.count,
        lods: [geo], // lods[1], lods[2] built lazily by L.getLod
      };
      this.prims = [];
      return tpl;
    }
  }
