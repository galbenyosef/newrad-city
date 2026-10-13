// play-inline-468 05 — pool
// Lines 2755-3070 of readable/play-inline-468.pretty.js (statement-aligned).
  L.Character = Character;
  Object.defineProperty(Character.prototype, "meta", {
    get() {
      return this.tpl.meta;
    },
  });

  /** Ray vs capsule (segment a-b radius r). Returns t or null. */
  function rayCapsule(o, d, a, b, r) {
    // closest points between ray (o + t d) and segment (a + s (b-a))
    const bax = b.x - a.x,
      bay = b.y - a.y,
      baz = b.z - a.z;
    const oax = o.x - a.x,
      oay = o.y - a.y,
      oaz = o.z - a.z;
    const baba = bax * bax + bay * bay + baz * baz;
    const bard = bax * d.x + bay * d.y + baz * d.z;
    const baoa = bax * oax + bay * oay + baz * oaz;
    const rdoa = d.x * oax + d.y * oay + d.z * oaz;
    const oaoa = oax * oax + oay * oay + oaz * oaz;
    const aa = baba - bard * bard;
    let bb = baba * rdoa - baoa * bard;
    let cc = baba * oaoa - baoa * baoa - r * r * baba;
    let h = bb * bb - aa * cc;
    if (aa > 1e-9 && h >= 0) {
      const t = (-bb - Math.sqrt(h)) / aa;
      const y = baoa + t * bard;
      if (y > 0 && y < baba) return t;
    }
    // end domes (spheres)
    let best = null;
    for (const c of [a, b]) {
      const ocx = o.x - c.x,
        ocy = o.y - c.y,
        ocz = o.z - c.z;
      bb = ocx * d.x + ocy * d.y + ocz * d.z;
      cc = ocx * ocx + ocy * ocy + ocz * ocz - r * r;
      h = bb * bb - cc;
      if (h >= 0) {
        const t = -bb - Math.sqrt(h);
        if (best === null || t < best) best = t;
      }
    }
    return best;
  }
  L.rayCapsule = rayCapsule;

  // ------------------------------------------------------------------
  // Gibs: severed limbs, gore chunks, stumps, ash piles / goo puddles
  // ------------------------------------------------------------------
  const GIBS = (L.gibs = { list: [], max: 90 });
  let chunkGeo = null,
    stumpGeo = null;
  function chunkGeometry() {
    if (chunkGeo) return chunkGeo;
    const g = new THREE.IcosahedronGeometry(1, 0);
    L.prim.deform(g, (v) =>
      v.multiplyScalar(0.7 + L.hash3(v.x * 13, v.y * 13, v.z * 13) * 0.6),
    );
    chunkGeo = g;
    return g;
  }
  function paintGeo(geo, color, emis, rough, metal) {
    const g = geo;
    const n = g.attributes.position.count;
    const c = L.col(color),
      col = new Float32Array(n * 3),
      pbr = new Float32Array(n * 3),
      uv = new Float32Array(n * 2),
      part = new Float32Array(n).fill(9);
    const t = L.regionUV("white", 0.5, 0.5);
    for (let i = 0; i < n; i++) {
      const k =
        0.75 +
        L.hash3(
          g.attributes.position.getX(i) * 50,
          g.attributes.position.getY(i) * 50,
          i,
        ) *
          0.5;
      col[i * 3] = c.r * k;
      col[i * 3 + 1] = c.g * k;
      col[i * 3 + 2] = c.b * k;
      pbr[i * 3] = rough;
      pbr[i * 3 + 1] = metal;
      pbr[i * 3 + 2] = emis;
      uv[i * 2] = t[0];
      uv[i * 2 + 1] = t[1];
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.setAttribute("pbr", new THREE.BufferAttribute(pbr, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setAttribute("partId", new THREE.BufferAttribute(part, 1));
    g.setAttribute("mcls", new THREE.BufferAttribute(new Float32Array(n), 1));
    return g;
  }
  // Raw stump ends: one painted geometry per gore colour, shared by every stump.
  const stumpCache = new Map();
  GIBS.stumpMesh = function (color, r, oil) {
    if (!stumpGeo) {
      stumpGeo = new THREE.SphereGeometry(1, 8, 6);
      L.prim.deform(stumpGeo, (v) => {
        v.y *= 0.55;
        v.multiplyScalar(0.85 + L.hash3(v.x * 9, v.y * 9, v.z * 9) * 0.3);
      });
    }
    const key = (oil ? "oil" : "c") + color;
    let g = stumpCache.get(key);
    if (!g) {
      g = paintGeo(
        stumpGeo.clone(),
        oil ? 0x2a2a28 : color,
        oil ? 0 : 0.08,
        oil ? 0.4 : 0.35,
        oil ? 0.6 : 0,
      );
      g.userData.shared = true;
      stumpCache.set(key, g);
    }
    const m = new THREE.Mesh(g, L.sharedMaterial());
    m.scale.setScalar(r);
    m.name = "stump";
    return m;
  };

  // ------------------------------------------------------------------
  // Gore chunks: ONE InstancedMesh per chunk kind (flesh / bone / metal),
  // so a full-body burst costs no new geometry and ≤3 draw calls.
  // ------------------------------------------------------------------
  const POOL_SIZE = 72;
  const POOL_KINDS = {
    flesh: { rough: 0.35, metal: 0, emis: 0.02 },
    bone: { rough: 0.55, metal: 0, emis: 0 },
    metal: { rough: 0.5, metal: 0.7, emis: 0 },
  };
  const pools = {};
  const _zeroM = new THREE.Matrix4().makeScale(0, 0, 0);
  const _pc = new THREE.Color();
  function pool(kind) {
    let P = pools[kind];
    if (P && P.mesh.parent) return P;
    if (!P) {
      const d = POOL_KINDS[kind];
      const g = paintGeo(
        chunkGeometry().clone(),
        0xffffff,
        d.emis,
        d.rough,
        d.metal,
      );
      const mesh = new THREE.InstancedMesh(g, L.sharedMaterial(), POOL_SIZE);
      mesh.name = "gorePool:" + kind;
      mesh.frustumCulled = false;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let i = 0; i < POOL_SIZE; i++) {
        mesh.setMatrixAt(i, _zeroM);
        mesh.setColorAt(i, _pc.setRGB(1, 1, 1));
      }
      P = pools[kind] = { mesh, free: [], used: new Map(), dirty: true };
      for (let i = POOL_SIZE - 1; i >= 0; i--) P.free.push(i);
    }
    if (G.scene && !P.mesh.parent) G.scene.add(P.mesh);
    return P;
  }
  function takeSlot(P) {
    if (P.free.length) return P.free.pop();
    // pool full: recycle the oldest chunk of this kind
    let oldest = null;
    for (const g of P.used.values())
      if (!oldest || g.age > oldest.age) oldest = g;
    if (oldest) {
      const s = oldest.slot;
      GIBS.remove(oldest, true);
      P.free = P.free.filter((x) => x !== s);
      return s;
    }
    return 0;
  }

  /** Add a physics-driven gib (Object3D) to the world. o.pool → instanced chunk. */
  GIBS.add = function (obj, vel, life, o) {
    o = o || {};
    if (!o.pool && !obj.parent && G.scene) G.scene.add(obj);
    const g = {
      obj,
      vel: vel.clone(),
      ang: new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14,
      ),
      life,
      age: 0,
      radius: o.radius || 0.06,
      keep: !!o.keep,
      rest: false,
      bleed: o.bleed ? 0.8 : 0,
      pool: o.pool || null,
      slot: -1,
    };
    if (g.pool) {
      g.slot = takeSlot(g.pool);
      g.pool.used.set(g.slot, g);
      g.pool.mesh.visible = true;
      g.pool.mesh.setColorAt(g.slot, o.color || _pc.setRGB(1, 1, 1));
      if (g.pool.mesh.instanceColor)
        g.pool.mesh.instanceColor.needsUpdate = true;
    }
    GIBS.list.push(g);
    while (GIBS.list.length > GIBS.max) {
      const old =
        GIBS.list.find((x) => !x.keep && !x.pool) ||
        GIBS.list.find((x) => !x.keep) ||
        GIBS.list[0];
      GIBS.remove(old);
    }
    return g;
  };
  GIBS.remove = function (g, keepSlotBusy) {
    const i = GIBS.list.indexOf(g);
    if (i >= 0) GIBS.list.splice(i, 1);
    if (g.pool) {
      if (g.slot >= 0 && g.pool.used.get(g.slot) === g) {
        g.pool.used.delete(g.slot);
        g.pool.mesh.setMatrixAt(g.slot, _zeroM);
        g.pool.dirty = true;
        if (!keepSlotBusy) g.pool.free.push(g.slot);
        // no live chunks of this kind: stop drawing the pool (no idle draw call / vertex work)
        if (!g.pool.used.size && !keepSlotBusy) g.pool.mesh.visible = false;
      }
      return;
    }
    if (!g.keep) {
      if (g.obj.parent) g.obj.parent.remove(g.obj);
      g.obj.traverse((o) => {
        if (
          o.geometry &&
          o.geometry !== chunkGeo &&
          !o.geometry.userData.shared
        )
          o.geometry.dispose();
      });
    }
  };
  /** Spray of meat/bone (or metal) chunks — instanced. Returns lightweight Object3D handles. */
  GIBS.chunks = function (pos, n, color, dir, metal, scale) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const bone = !metal && Math.random() < 0.25;
      const P = pool(metal ? "metal" : bone ? "bone" : "flesh");
      const col = L.col(
        metal
          ? L.mix(0x5a5a58, 0x2a2a28, Math.random())
          : bone
            ? 0xd8ceb0
            : L.mix(color, 0x8a1a10, Math.random() * 0.4),
      );
      const m = new THREE.Object3D();
      const s = (0.04 + Math.random() * 0.07) * (scale || 1);
      m.scale.set(s * (bone ? 0.5 : 1), s * (bone ? 1.8 : 1), s);
      m.position
        .copy(pos)
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
          ),
        );
      m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        2 + Math.random() * 5,
        (Math.random() - 0.5) * 6,
      );
      if (dir) v.addScaledVector(dir, 3 + Math.random() * 4);
      const g = GIBS.add(m, v, 8 + Math.random() * 10, {
        radius: s,
        bleed: !metal,
        pool: P,
        color: col,
      });
      m.updateMatrix();
      P.mesh.setMatrixAt(g.slot, m.matrix);
      P.mesh.instanceMatrix.needsUpdate = true;
      out.push(m);
    }
    return out;
  };
  /** Ash pile or glowing goo puddle left by energy-weapon disintegration. */
  GIBS.remains = function (ch, kind) {
    const geo = new THREE.SphereGeometry(1, 12, 6, 0, PI * 2, 0, PI / 2);
    L.prim.deform(geo, (v) => {
      const n = L.noise3(v.x * 3, 0, v.z * 3);
      v.y *= 0.35 * (0.6 + n * 0.8);
      v.x *= 1 + (n - 0.5) * 0.4;
    });
    const goo = kind === "goo";
    paintGeo(geo, goo ? 0x3aa020 : 0x4a4640, goo ? 0.9 : 0, goo ? 0.25 : 1, 0);
    const m = new THREE.Mesh(geo, L.sharedMaterial());
    const r = 0.45 * ch.scale * (ch.kind === "biped" ? 1 : 0.8);
    m.scale.set(r * 1.3, goo ? r * 0.25 : r * 0.6, r);
    ch.getPartWorldPos("torso", m.position);
    const gh =
      G.world && G.world.groundHeight
        ? G.world.groundHeight(m.position.x, m.position.z, m.position.y + 0.5)
        : ch.root.position.y;
    m.position.y = gh;
    m.name = goo ? "goo_puddle" : "ash_pile";
    G.scene.add(m);
    GIBS.add(m, new THREE.Vector3(), 90, { radius: 0 }).rest = true;
    return m;
  };
