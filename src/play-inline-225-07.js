// play-inline-225 07 — fixed
// Lines 1600-1934 of readable/play-inline-225.pretty.js (statement-aligned).
  Batch.prototype.build = function (parent, opts) {
    opts = opts || {};
    const out = new THREE.Group();
    out.name = "li_" + this.name;
    const jobs = [];
    for (const [key, list] of this.parts) {
      const baked = list.some((g) => g.userData.liBake);
      let total = 0;
      for (const g of list) total += g.attributes.position.count;
      const P = new Float32Array(total * 3),
        N = new Float32Array(total * 3),
        U = new Float32Array(total * 2),
        C = new Float32Array(total * 3),
        B = baked ? new Float32Array(total * 3) : null;
      let o = 0;
      const ranges = [];
      for (const g of list) {
        const n = g.attributes.position.count;
        P.set(g.attributes.position.array.subarray(0, n * 3), o * 3);
        N.set(g.attributes.normal.array.subarray(0, n * 3), o * 3);
        U.set(g.attributes.uv.array.subarray(0, n * 2), o * 2);
        C.set(g.attributes.color.array.subarray(0, n * 3), o * 3);
        if (B && g.userData.liBake) {
          const last = ranges[ranges.length - 1];
          if (
            last &&
            last.mul === g.userData.liBake &&
            last.o + last.n === o &&
            last.n + n < 900
          )
            last.n += n; // merge tiny pieces
          else
            for (let k = 0; k < n; k += 1500)
              ranges.push({
                o: o + k,
                n: Math.min(1500, n - k),
                mul: g.userData.liBake,
              }); // big pieces (tessellated floors) split so a time slice never overruns
        }
        o += n;
        g.dispose();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(P, 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(N, 3));
      geo.setAttribute("uv", new THREE.BufferAttribute(U, 2));
      geo.setAttribute("color", new THREE.BufferAttribute(C, 3));
      if (B) {
        const BA = new THREE.BufferAttribute(B, 3);
        geo.setAttribute("bake", BA);
        if (ranges.length) jobs.push({ attr: BA, P, N, B, ranges });
      }
      geo.computeBoundingSphere();
      geo.computeBoundingBox();
      const mesh = new THREE.Mesh(geo, LI.mat(key, !!B));
      mesh.castShadow = !!opts.cast;
      mesh.receiveShadow = !!opts.receive;
      mesh.name = "li:" + key;
      if (mesh.material.transparent) mesh.renderOrder = 2;
      out.add(mesh);
    }
    this.parts.clear();
    parent.add(out);
    this.jobs = jobs;
    this.baked = false;
    if (!opts.deferBake) this.bakeStep(Infinity);
    return out;
  };

  /**
   * World anchor published by the landmark that owns the facade (landmarks_a/b build first), e.g. the Woolworth's
   * Broadway portal `door`. Returns {x,y,z,yaw} or the fallback, so doors follow the exterior when a site is refitted.
   */
  LI.siteAnchor = function (siteId, name, fb) {
    try {
      const e = G.landmarks && G.landmarks[siteId];
      const a = e && e.anchors && e.anchors[name];
      if (a && isFinite(a.x) && isFinite(a.z))
        return { x: a.x, y: a.y || 0, z: a.z, yaw: a.yaw || 0, w: a.w, h: a.h };
    } catch (e) {
      /* landmark module absent */
    }
    return fb;
  };
  // =====================================================================
  // Cell: an interior (or a world-space group of additions)
  // =====================================================================
  /**
   * LI.cell(key, {world:true}) — key = LAYOUT.INTERIORS key. Local coordinates are relative to the cell origin
   * (world additions use origin 0,0,0).
   */
  LI.cell = function (key, opts) {
    opts = opts || {};
    const L = G.LAYOUT;
    const def = opts.world ? null : L.INTERIORS[key];
    const O = def ? def.origin : { x: 0, y: 0, z: 0 };
    const root = new THREE.Group();
    root.name = "li_cell_" + key;
    root.position.set(O.x, O.y || 0, O.z);
    G.scene.add(root);
    const C = {
      key,
      O,
      def,
      root,
      world: !!opts.world,
      anchors: {},
      props: [],
      pickups: [],
      doors: [],
      colliders: [],
      glows: [],
      b: new Batch(key),
      batches: [],
      /** world position of a local point */
      W: (x, y, z) => new THREE.Vector3(O.x + x, (O.y || 0) + y, O.z + z),
    };
    /** Axis-aligned collider (local coords). */
    C.col = function (x0, y0, z0, x1, y1, z1, o) {
      const c = G.world.addBox(
        O.x + Math.min(x0, x1),
        (O.y || 0) + Math.min(y0, y1),
        O.z + Math.min(z0, z1),
        O.x + Math.max(x0, x1),
        (O.y || 0) + Math.max(y0, y1),
        O.z + Math.max(z0, z1),
        Object.assign({ tag: "li", surface: "concrete" }, o || {}),
      );
      C.colliders.push(c);
      return c;
    };
    /** Rotated collider, ry = three.js rotation.y of the box. */
    C.colRot = function (cx, cz, w, d, y0, y1, ry, o) {
      const c = G.world.addCollider(
        O.x + cx,
        O.z + cz,
        w,
        d,
        (O.y || 0) + y0,
        (O.y || 0) + y1,
        -(ry || 0),
        Object.assign({ tag: "li", surface: "concrete" }, o || {}),
      );
      C.colliders.push(c);
      return c;
    };
    /** Named anchor (local coords) → stored as a world Vector3 with .yaw. */
    C.anchor = function (name, x, y, z, yaw) {
      const v = C.W(x, y, z);
      v.yaw = yaw || 0;
      C.anchors[name] = v;
      return v;
    };
    /** Prop spawned at initDone (persistent world prop). */
    C.prop = function (type, x, y, z, yaw, o) {
      C.props.push({ type, x, y, z, yaw: yaw || 0, o: o || {} });
    };
    /** Static world pickup spawned at initDone (after item defs). */
    C.pickup = function (id, n, x, y, z, yaw) {
      C.pickups.push({ id, n: n || 1, x, y, z, yaw: yaw || 0 });
    };
    /** Glow sprite (created at initDone through G.fx / atmos fixtures). */
    C.glow = function (x, y, z, color, size, o) {
      C.glows.push({ x, y, z, color, size: size || 1, o: o || {} });
    };
    /** Door (world coords are computed from local unless o.worldPos). */
    C.door = function (def) {
      C.doors.push(def);
      return def;
    };
    C.finish = function () {
      const dress = LI.dress && LI.dress[key];
      if (dress) {
        try {
          dress(C);
        } catch (e) {
          G.reportError("landmark_interiors:dress " + key, e);
        }
      }
      const defer = !!(LI.deferBake && !opts.world);
      const g = C.b.build(root, { deferBake: defer });
      for (const b of C.batches) b.build(root, { deferBake: defer });
      if (LI._buildAtmos) LI._buildAtmos(C);
      // world dressing is small but always in the scene: distance-cull it (draw calls in the busy street views)
      if (opts.world && opts.lod !== false) {
        try {
          const bb = new THREE.Box3().setFromObject(g);
          if (!bb.isEmpty())
            G.world.addLOD(
              g,
              opts.lod || 160,
              bb.getCenter(new THREE.Vector3()),
            );
        } catch (e) {
          /* core without LODs */
        }
      }
      return g;
    };
    if (opts.world) {
      C.b.seg = 0;
      C.b.occlude = false;
    }
    if (!opts.world) LI.cells.push(C);
    else LI.worldCells = (LI.worldCells || []).concat([C]);
    return C;
  };

  /** Finish (ms = Infinity) or advance the deferred bake of a cell. Returns true when the cell is fully lit. */
  LI.bakeCell = function (C, ms) {
    let done = true;
    for (const b of [C.b].concat(C.batches || [])) {
      if (!b.bakeStep(ms === undefined ? Infinity : ms)) {
        done = false;
        break;
      }
    }
    return done;
  };

  // =====================================================================
  // Architecture helpers (operate on a Cell; local coords)
  // =====================================================================
  const A = (LI.arch = {});
  /**
   * Wall along X (z fixed) or along Z (x fixed) with door/window gaps.
   * A.wall(C, key, {x0,x1,z} | {z0,z1,x}, y0, y1, t, gaps:[{a,b,top (y of lintel), sill?}], o:{col:true, trim, lining})
   */
  A.wall = function (C, key, line, y0, y1, t, gaps, o) {
    o = o || {};
    const b = o.batch || C.b;
    const alongX = line.x0 !== undefined;
    const a0 = alongX ? line.x0 : line.z0,
      a1 = alongX ? line.x1 : line.z1,
      fixed = alongX ? line.z : line.x;
    const segs = [];
    let cur = a0;
    const gs = (gaps || []).slice().sort((p, q) => p.a - q.a);
    for (const g of gs) {
      if (g.a > cur) segs.push([cur, g.a, y0, y1]);
      const top = g.top === undefined ? y0 + 2.4 : g.top;
      if (top < y1) segs.push([g.a, g.b, top, y1]);
      if (g.sill !== undefined && g.sill > y0)
        segs.push([g.a, g.b, y0, g.sill]);
      cur = g.b;
    }
    if (cur < a1) segs.push([cur, a1, y0, y1]);
    for (const s of segs) {
      if (s[1] - s[0] < 0.01 || s[3] - s[2] < 0.01) continue;
      if (alongX)
        b.box(key, s[0], s[2], fixed - t / 2, s[1], s[3], fixed + t / 2, o);
      else b.box(key, fixed - t / 2, s[2], s[0], fixed + t / 2, s[3], s[1], o);
      if (o.col !== false) {
        if (alongX)
          C.col(s[0], s[2], fixed - t / 2, s[1], s[3], fixed + t / 2, {
            walkable: false,
            surface: o.surface,
          });
        else
          C.col(fixed - t / 2, s[2], s[0], fixed + t / 2, s[3], s[1], {
            walkable: false,
            surface: o.surface,
          });
      }
    }
    // door casings
    if (o.casing)
      for (const g of gs) {
        const top = g.top === undefined ? y0 + 2.4 : g.top,
          ck = o.casing,
          cw = 0.14,
          cd = t + 0.08;
        if (alongX) {
          b.box(
            ck,
            g.a - cw,
            y0,
            fixed - cd / 2,
            g.a,
            top + cw,
            fixed + cd / 2,
          );
          b.box(
            ck,
            g.b,
            y0,
            fixed - cd / 2,
            g.b + cw,
            top + cw,
            fixed + cd / 2,
          );
          b.box(
            ck,
            g.a - cw,
            top,
            fixed - cd / 2,
            g.b + cw,
            top + cw,
            fixed + cd / 2,
          );
        } else {
          b.box(
            ck,
            fixed - cd / 2,
            y0,
            g.a - cw,
            fixed + cd / 2,
            top + cw,
            g.a,
          );
          b.box(
            ck,
            fixed - cd / 2,
            y0,
            g.b,
            fixed + cd / 2,
            top + cw,
            g.b + cw,
          );
          b.box(
            ck,
            fixed - cd / 2,
            top,
            g.a - cw,
            fixed + cd / 2,
            top + cw,
            g.b + cw,
          );
        }
      }
  };
  /**
   * Wall between two arbitrary points p→q (XZ) with gaps measured along it: [{a,b,top,sill}] (metres from p).
   * The wall is centred on the line; o.off shifts it along the left normal.
   */
