// play-inline-518 02 — opts
// Lines 367-712 of readable/play-inline-518.pretty.js (statement-aligned).
  K.relock = function (id) {
    try {
      if (!G.isStub("locks") && G.locks.relock) G.locks.relock(id);
    } catch (e) {
      /* ignore */
    }
  };
  K.learnCode = function (id, src) {
    try {
      if (!G.isStub("locks") && G.locks.learn) G.locks.learn(id, src);
    } catch (e) {
      /* ignore */
    }
  };
  K.spawnPickup = function (id, n, pos) {
    if (
      G.isStub("items") ||
      typeof G.items.spawnPickup !== "function" ||
      !K.itemExists(id)
    )
      return null;
    try {
      return G.items.spawnPickup(id, n || 1, pos, {
        noSave: true,
        dropped: true,
      });
    } catch (e) {
      G.reportError("ambient:pickup", e);
      return null;
    }
  };
  K.removePickup = function (p) {
    if (!p || p.taken) return;
    try {
      if (!G.isStub("items") && typeof G.items.removePickup === "function")
        G.items.removePickup(p);
    } catch (e) {
      /* ignore */
    }
  };
  K.spawnProp = function (type, opts) {
    if (G.isStub("props") || typeof G.props.spawn !== "function") return null;
    try {
      return G.props.spawn(type, opts) || null;
    } catch (e) {
      G.reportError("ambient:prop " + type, e);
      return null;
    }
  };
  K.removeProp = function (h) {
    try {
      if (h && h.remove) h.remove();
    } catch (e) {
      /* ignore */
    }
  };

  // ------------------------------------------------------------------
  // Actors (defensive wrappers)
  // ------------------------------------------------------------------
  K.hasActors = () =>
    !G.isStub("actors") && typeof G.actors.spawn === "function";
  K.spawnActor = function (def) {
    if (!K.hasActors()) return null;
    try {
      return G.actors.spawn(def) || null;
    } catch (e) {
      G.reportError("ambient:spawn " + (def && def.type), e);
      return null;
    }
  };
  K.removeActor = function (a) {
    if (!a || a.removed) return;
    try {
      if (!G.isStub("actors")) G.actors.remove(a);
    } catch (e) {
      /* ignore */
    }
    a._ambGone = true;
  };
  K.actorAlive = (a) => !!(a && !a.dead && !a.removed && !a._ambGone);
  K.say = function (a, text, dur) {
    try {
      if (K.actorAlive(a) && a.say) a.say(text, dur || 4);
    } catch (e) {
      /* ignore */
    }
  };
  K.distToPlayer = function (x, z) {
    const P = G.player;
    return Math.hypot(P.pos.x - x, P.pos.z - z);
  };
  /** Is an actor being talked to / bartered with right now? (never yank them away mid-conversation) */
  K.actorBusy = function (a) {
    if (!a) return false;
    if (a.talking) return true;
    try {
      if (
        !G.isStub("dialogue") &&
        G.dialogue.isActive &&
        G.dialogue.isActive()
      ) {
        const c = G.dialogue.current && G.dialogue.current();
        if (c && c.actor === a) return true;
      }
    } catch (e) {
      /* ignore */
    }
    return G.state === "barter" || G.state === "dialogue";
  };
  K._dlg = {}; // id -> tree (self-test walks every node's text/cond functions)
  K.registerDialogue = function (id, tree) {
    K._dlg[id] = tree;
    try {
      if (!G.isStub("dialogue") && typeof G.dialogue.register === "function") {
        G.dialogue.register(id, tree);
        return true;
      }
    } catch (e) {
      G.reportError("ambient:dialogue " + id, e);
    }
    return false;
  };

  // ------------------------------------------------------------------
  // Placement
  // ------------------------------------------------------------------
  const L = () => G.LAYOUT;
  /** Solid collider overlapping a circle (x,z,r) at body height above y? */
  K.blocked = function (x, y, z, r) {
    const W = G.world;
    const cs = W.query(x - r - 0.5, z - r - 0.5, x + r + 0.5, z + r + 0.5);
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];
      if (c.maxY <= y + 0.5 || c.minY >= y + 1.8) continue;
      if (W.pointInCollider(c, x, z, r)) return true;
    }
    return false;
  };
  /** Ground y at (x,z) if it's plain, dry, outdoor walkable ground near y≈0; else null. */
  K.groundAt = function (x, z, yRef) {
    const Ly = L();
    if (!Ly.isLand(x, z) || Ly.isInterior(x)) return null;
    const y = G.world.groundHeight(x, z, yRef === undefined ? 1.0 : yRef, 0.3);
    if (
      !(y > G.world.waterLevel + 0.3) ||
      Math.abs(y - (yRef === undefined ? 0 : yRef)) > 1.6
    )
      return null;
    return y;
  };
  /** A free standing spot near (x,z): tries offsets; returns {x,y,z} or null. */
  K.freeSpotNear = function (x, z, r, tries, yRef) {
    for (let k = 0; k < (tries || 12); k++) {
      const a = Math.random() * Math.PI * 2,
        d = k === 0 ? 0 : Math.random() * (r || 4);
      const px = x + Math.sin(a) * d,
        pz = z + Math.cos(a) * d;
      const y = K.groundAt(px, pz, yRef);
      if (y === null) continue;
      if (K.blocked(px, y, pz, 0.6)) continue;
      return { x: px, y, z: pz };
    }
    return null;
  };
  /** Friendly settlement containing (x,z) (+pad), or null. */
  K.friendlyLocAt = function (x, z, pad) {
    const locs = L().LOCATIONS;
    for (let i = 0; i < locs.length; i++) {
      const l = locs[i];
      if (l.hostile || l.sub) continue;
      if (Math.hypot(x - l.x, z - l.z) <= l.r + (pad || 0)) return l;
    }
    return null;
  };
  K.hostileLocAt = function (x, z, pad) {
    const locs = L().LOCATIONS;
    for (let i = 0; i < locs.length; i++) {
      const l = locs[i];
      if (!l.hostile) continue;
      if (Math.hypot(x - l.x, z - l.z) <= l.r + (pad || 0)) return l;
    }
    return null;
  };
  /**
   * Random outdoor street spot around (cx,cz) at rMin..rMax.
   * opts: {road:true (roadway/sidewalk only), hidden:true (prefer out of the player's view), notSettlement:true, park:true (allow park)}
   */
  K.streetSpot = function (cx, cz, rMin, rMax, opts) {
    opts = opts || {};
    // debug/staging: a one-shot forced spot (G.ambient.stage / encounterAt)
    if (K._forceSpot) {
      const f = K._forceSpot;
      K._forceSpot = null;
      return {
        x: f.x,
        y: f.y !== undefined ? f.y : K.groundAt(f.x, f.z, 0.5) || 0,
        z: f.z,
      };
    }
    const Ly = L();
    for (let k = 0; k < (opts.tries || 40); k++) {
      const a = Math.random() * Math.PI * 2,
        d = K.rand(rMin, rMax);
      const x = cx + Math.sin(a) * d,
        z = cz + Math.cos(a) * d;
      if (!Ly.isLand(x, z) || Ly.isInterior(x)) continue;
      const onRoad = Ly.isRoad(x, z);
      if (opts.road !== false && !onRoad && !(opts.park && Ly.inPark(x, z)))
        continue;
      if (opts.notSettlement && K.friendlyLocAt(x, z, 25)) continue;
      const y = K.groundAt(x, z, 0.5);
      if (y === null || Math.abs(y) > 1.2) continue;
      if (K.blocked(x, y, z, opts.clear || 0.8)) continue;
      if (
        opts.hidden &&
        k < (opts.tries || 40) - 8 &&
        K.inView(x, y + 1, z, 1.5, true)
      )
        continue;
      return { x, y, z };
    }
    return null;
  };

  // ------------------------------------------------------------------
  // Visibility (frustum refreshed once per frame by the module update)
  // ------------------------------------------------------------------
  const _frustum = new THREE.Frustum(),
    _pm = new THREE.Matrix4(),
    _sph = new THREE.Sphere(),
    _va = new THREE.Vector3(),
    _vb = new THREE.Vector3();
  K.refreshFrustum = function () {
    const cam = G.camera;
    if (!cam) return;
    cam.updateMatrixWorld();
    _pm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    _frustum.setFromProjectionMatrix(_pm);
  };
  /** Is the point on screen (sphere radius r)? los=true also requires line of sight from the eye. */
  K.inView = function (x, y, z, r, los) {
    _sph.center.set(x, y, z);
    _sph.radius = r || 1;
    if (!_frustum.intersectsSphere(_sph)) return false;
    if (!los) return true;
    const P = G.player;
    if (!P || !P.eye) return true;
    _vb.set(x, y, z);
    try {
      return !!G.world.lineOfSight(P.eye, _vb);
    } catch (e) {
      return true;
    }
  };

  // ------------------------------------------------------------------
  // Materials & geometry helpers (shared, never disposed per instance)
  // ------------------------------------------------------------------
  const MATS = new Map();
  K.mat = function (key, make) {
    let m = MATS.get(key);
    if (!m) {
      m = make();
      m.userData.shared = true;
      MATS.set(key, m);
    }
    return m;
  };
  K.vcMat = (key, opts) =>
    K.mat(
      key,
      () =>
        new THREE.MeshStandardMaterial(
          Object.assign(
            { vertexColors: true, roughness: 0.85, metalness: 0.05 },
            opts || {},
          ),
        ),
    );
  /** Paint a flat vertex colour (with optional per-vertex noise & vertical shading) onto a geometry. */
  K.paint = function (geo, color, noise, seed, shade) {
    const c = new THREE.Color(color);
    const p = geo.attributes.position,
      n = p.count,
      a = new Float32Array(n * 3);
    const U = G.util;
    for (let i = 0; i < n; i++) {
      let k = 1;
      if (noise)
        k +=
          (U.noise2(
            p.getX(i) * 9 + (seed || 0),
            p.getZ(i) * 9 + p.getY(i) * 5,
          ) -
            0.5) *
          noise *
          2;
      if (shade) k *= 1 - shade + shade * K.clamp(0.5 + p.getY(i) * 0.5, 0, 1);
      a[i * 3] = c.r * k;
      a[i * 3 + 1] = c.g * k;
      a[i * 3 + 2] = c.b * k;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(a, 3));
    return geo;
  };
  /** Transform a geometry (non-destructive clone) and paint it. */
  K.part = function (geo, color, pos, rot, scale, noise, seed) {
    const g = G.util.bake(
      geo,
      pos ? new THREE.Vector3(pos[0], pos[1], pos[2]) : null,
      rot ? rot[1] : 0,
      scale
        ? typeof scale === "number"
          ? scale
          : new THREE.Vector3(scale[0], scale[1], scale[2])
        : 1,
      rot ? rot[0] : 0,
      rot ? rot[2] : 0,
    );
    return K.paint(g, color, noise, seed);
  };
  K.merge = function (parts) {
    const g = G.util.mergeGeometries(parts);
    for (const p of parts) p.dispose();
    return g;
  };
  /** Displace vertices along their normal with value noise (organic lumps). Geometry must be non-indexed or indexed; works on both. */
  K.lump = function (geo, amp, freq, seed) {
    const p = geo.attributes.position;
    if (!geo.attributes.normal) geo.computeVertexNormals();
    const nr = geo.attributes.normal,
      U = G.util;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const d =
        (U.noise2(x * freq + seed, z * freq + y * freq * 0.7) - 0.5) * 2 * amp;
      p.setXYZ(i, x + nr.getX(i) * d, y + nr.getY(i) * d, z + nr.getZ(i) * d);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  };
  /** Canvas texture helper (sRGB). */
