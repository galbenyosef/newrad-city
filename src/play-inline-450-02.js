// play-inline-450 02 — rec
// Lines 353-699 of readable/play-inline-450.pretty.js (statement-aligned).
  function spawnImpl(type, o) {
    const x = +o.x || 0,
      z = +o.z || 0,
      yaw = +o.yaw || 0;
    const y = o.y !== undefined ? +o.y : X.ground(x, z);
    // rows of wall segments
    const R0 = TYPES[type];
    if (R0 && R0.row && o.count > 1) return spawnRow(type, o, R0.row);
    if (type === "lamp" && o.kind === "street") type = "lamp_post";
    if (type === "car") return spawnCar(o, x, y, z, yaw);
    if (type === "billboard") return spawnBillboard(o, x, y, z, yaw);
    if (type === "crate" && o.stack) type = "crate_stack";
    const rt = resolveType(type, o);
    if (!rt) {
      console.warn("props.spawn: unknown type " + type);
      return spawnImpl("crate", Object.assign({}, o, { kind: "plain" }));
    }
    let variant = rt.variant;
    if (type === "lamp_post") variant = o.variant !== undefined ? o.variant : 3;
    const pr = X.proto(rt.proto, variant);
    const obj = X.instantiate(pr, { castShadow: o.castShadow });
    obj.position.set(x, y, z);
    obj.rotation.y = yaw;
    const scale = o.scale || 1;
    if (scale !== 1) obj.scale.setScalar(scale);
    (o.parent || X.spawnRoot || G.scene).add(obj);
    obj.updateMatrixWorld(true);
    const tier = pr.meta.tier || "small";
    const lodDist =
      o.lod || (tier === "small" ? 110 : tier === "medium" ? 240 : 600);
    const lod = G.world.addLOD(obj, lodDist, obj.position.clone());
    const rec = {
      uid: ++uid,
      type,
      id:
        o.id ||
        type + "@" + x.toFixed(1) + "," + y.toFixed(1) + "," + z.toFixed(1),
      opts: o,
      pr,
      obj,
      lod,
      persistent: o.persistent !== undefined ? !!o.persistent : !firstResetDone,
      colliders:
        o.collide === false
          ? []
          : X.addProtoColliders(pr, x, y, z, yaw, scale, "prop", null),
      fx: X.addProtoFx(pr, x, y, z, yaw, scale, true),
      interactable: null,
      container: null,
      cdef: null,
      taken: false,
    };
    rec.ipos = worldPoint(
      obj,
      0,
      pr.meta.interactY !== undefined
        ? pr.meta.interactY
        : Math.min(1.0, pr.box.max.y * 0.6),
      0,
    );
    // --- behaviours ---
    const T = rt.T || {};
    const wantsContainer =
      o.container === true ||
      o.loot ||
      o.items ||
      (o.container !== false &&
        CONTAINER_TYPES.has(rt.proto) &&
        pr.meta.container);
    if (wantsContainer) {
      const md = pr.meta.container || { name: "Container", loot: "generic" };
      // lock: the caller's G.locks spec (props' own containers are never locked); locked: a legacy numeric value
      // still passed by some callers, handed to the containers module unchanged
      rec.cdef = {
        id: "props:" + rec.id,
        name: o.name || md.name,
        loot: o.loot || (o.items ? undefined : md.loot),
        defLoot: md.loot,
        items: o.items,
        lock: o.lock || md.lock,
        locked: o.locked,
        owner: o.owner,
        respawn: o.respawn,
      };
      makeContainer(rec);
    }
    if (T.interact) setupInteract(rec, T.interact, T);
    else if (o.onInteract) setupInteract(rec, "custom", T);
    if (T.special === "turret") setupTurret(rec);
    if (pr.meta.explosive && o.explodable !== false)
      registerExplosive(rec, pr.meta.explosive);
    RECS.push(rec);
    return handleFor(rec);
  }
  function handleFor(rec) {
    return {
      type: rec.type,
      id: rec.id,
      object3d: rec.obj,
      get interactable() {
        return rec.interactable;
      },
      get container() {
        return rec.container;
      },
      colliders: rec.colliders,
      collider: rec.colliders[0] || null,
      record: rec,
      remove() {
        removeRec(rec, true);
      },
    };
  }
  function spawnRow(type, o, step) {
    const n = Math.max(1, Math.min(40, o.count | 0));
    const grp = new THREE.Group();
    const parts = [];
    const c = Math.cos(o.yaw || 0),
      s = Math.sin(o.yaw || 0);
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * step;
      const h = spawnImpl(
        type,
        Object.assign({}, o, {
          count: 1,
          x: (o.x || 0) + off * c,
          z: (o.z || 0) - off * s,
          id: (o.id || type) + "#" + i,
        }),
      );
      parts.push(h);
    }
    grp.position.set(o.x || 0, o.y || 0, o.z || 0);
    return {
      type,
      object3d: parts[0] ? parts[0].object3d : grp,
      parts,
      interactable: null,
      container: null,
      remove() {
        parts.forEach((p) => p.remove());
      },
    };
  }
  function spawnCar(o, x, y, z, yaw) {
    const kind =
      X.carKind(o.kind) || (o.kind === "fizzo" ? "fizzo_truck" : "sedan");
    const car = X.addCar(kind, x, z, yaw, {
      y,
      stripped: o.stripped,
      wreck: o.wreck || o.gutted,
      burnt: o.burnt,
      flipped: o.flipped,
      onSide: o.onSide,
      tint: o.color || o.tint,
      roll: o.roll,
      pitch: o.pitch,
      id: o.id,
      persistent: o.persistent,
      explodable: o.explodable,
    });
    const anchor = new THREE.Group();
    anchor.position.set(x, y, z);
    anchor.rotation.y = yaw;
    anchor.name = "car_anchor";
    const rec = {
      uid: ++uid,
      type: "car",
      id: car.id,
      car,
      obj: anchor,
      colliders: [car.collider],
      persistent: car.persistent,
      fx: null,
    };
    RECS.push(rec);
    return {
      type: "car",
      id: car.id,
      object3d: anchor,
      car,
      interactable: null,
      container: null,
      colliders: rec.colliders,
      remove() {
        removeRec(rec, true);
      },
    };
  }
  /** Freestanding billboard: frame prop + brand face (opts.brand, opts.big, opts.damaged). */
  function spawnBillboard(o, x, y, z, yaw) {
    const h = spawnImpl(
      "billboard_frame",
      Object.assign({}, o, { variant: o.big ? 1 : o.damaged ? 2 : 0 }),
    );
    const f = h.record.pr.meta.face;
    const brands = G.LAYOUT.BRANDS;
    const brand =
      o.brand || brands[Math.abs(Math.round(x * 7 + z * 13)) % brands.length];
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(f.w, f.h),
      X.billboardMaterial(brand),
    );
    m.position.set(0, f.y, f.z - 0.08);
    m.rotation.set(-(f.rx || 0), PI, 0, "YXZ");
    m.receiveShadow = true;
    h.object3d.add(m);
    h.brand = brand;
    return h;
  }
  X.removeSpawnRec = (rec) => removeRec(rec, true);
  function removeRec(rec, drop) {
    if (rec.removed) return;
    rec.removed = true;
    if (rec.car) {
      X.removeCar(rec.car);
    }
    if (rec.obj && rec.obj.parent) rec.obj.parent.remove(rec.obj);
    if (rec.lod) {
      const i = G.world.lods.indexOf(rec.lod);
      if (i >= 0) G.world.lods.splice(i, 1);
    }
    for (const c of rec.colliders || []) if (c) G.world.removeCollider(c);
    X.removeProtoFx(rec.fx);
    if (rec.fx)
      X.FIRE_SPOTS = X.FIRE_SPOTS.filter((f) => rec.fx.fires.indexOf(f.h) < 0);
    destroyContainer(rec);
    if (rec.interactable) {
      G.world.removeInteractable(rec.interactable);
      rec.interactable = null;
    }
    if (rec.turret) X.TURRETS.splice(X.TURRETS.indexOf(rec.turret) >>> 0, 1);
    if (rec.explosive) rec.explosive.dead = true;
    if (drop) {
      const i = RECS.indexOf(rec);
      if (i >= 0) RECS.splice(i, 1);
    }
  }

  // ------------------------------------------------------------------
  // Containers (G.containers belongs to rpg, order 40 — may not exist yet)
  // ------------------------------------------------------------------
  const FALLBACK_LOOT = {
    mailbox: [
      ["scrip", 1, 8],
      ["old_dollars", 1, 3],
      ["scrap_metal", 0, 1],
    ],
    trash: [
      ["tin_can", 1, 2],
      ["scrap_metal", 1, 1],
      ["dirty_water", 1, 1],
    ],
    dumpster: [
      ["scrap_metal", 1, 3],
      ["tin_can", 1, 3],
      ["scrip", 1, 6],
    ],
    fizzo_machine: [
      ["fizzo_cola", 1, 3],
      ["scrip", 2, 10],
      ["fizzo_blue", 0, 1],
    ],
    first_aid: [
      ["rally_tonic", 1, 2],
      ["prussian_blue", 0, 1],
      ["iodine_tabs", 0, 1],
    ],
    ammo_box: [
      ["ammo_10mm", 8, 24],
      ["ammo_556", 0, 20],
      ["ammo_12ga", 0, 8],
      ["frag_grenade", 0, 1],
    ],
    safe: [
      ["scrip", 20, 90],
      ["old_dollars", 2, 6],
      ["rally_tonic", 0, 1],
      ["ammo_10mm", 0, 20],
    ],
    desk: [
      ["scrip", 0, 10],
      ["pencil", 0, 1],
      ["rally_tonic", 0, 1],
    ],
    file_cabinet: [
      ["old_world_book", 0, 1],
      ["scrip", 0, 5],
    ],
    locker: [
      ["ammo_10mm", 0, 12],
      ["rally_tonic", 0, 1],
      ["leather_armor", 0, 1],
      ["scrip", 0, 10],
    ],
    footlocker: [
      ["ammo_10mm", 4, 16],
      ["rally_tonic", 0, 2],
      ["scrip", 5, 25],
      ["frag_grenade", 0, 1],
    ],
    toolbox: [
      ["scrap_metal", 1, 3],
      ["dry_cell", 0, 1],
      ["relay_board", 0, 1],
    ],
    fridge: [
      ["fizzo_cola", 0, 2],
      ["purified_water", 0, 1],
      ["golden_plain_jerky", 0, 1],
      ["pigeon_on_a_stick", 0, 1],
    ],
    register: [
      ["scrip", 5, 30],
      ["old_dollars", 1, 4],
    ],
    scrip_stash: [["scrip", 30, 120]],
    duffle_bag: [
      ["ammo_10mm", 0, 16],
      ["rally_tonic", 0, 1],
      ["scrip", 3, 20],
      ["dirty_water", 0, 1],
    ],
    generic: [
      ["scrip", 1, 10],
      ["scrap_metal", 0, 1],
    ],
  };
  X.FALLBACK_LOOT = FALLBACK_LOOT;
  function fallbackItems(table, seed) {
    const r = U.rng(seed || 1);
    const t = FALLBACK_LOOT[table] || FALLBACK_LOOT.generic;
    const out = [];
    const have = (id) => {
      try {
        return !G.isStub("items") && G.items.get && !!G.items.get(id);
      } catch (e) {
        return false;
      }
    };
    for (const [id, lo, hi] of t) {
      if (!have(id)) continue;
      const n = Math.floor(lo + r() * (hi - lo + 1));
      if (n > 0) out.push([id, n]);
    }
    return out;
  }
