/* src/props/50_spawn.js */
/* =====================================================================
 * props / 50_spawn.js — the SPAWNABLE PROPS API and all prop gameplay:
 *   G.props.spawn(type, opts)  → {object3d, interactable?, container?, remove()}
 *   G.props.damageAt(pos, dmg, {radius})  (cars / explosive barrels / turrets)
 *   containers (deferred until G.containers exists; recreated each game),
 *   pickups (World's Fair medallions, Fizzo bottles, tape reels, teddy bears),
 *   beds (Sleep), radios, terminals, auto-turrets, explosive drums,
 *   explosion helper with graceful fallback when combat/fx are stubs.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const U = G.util;
  const P = G.props;
  const X = P._;
  const PI = Math.PI;

  // ------------------------------------------------------------------
  // Type table: spawn type → prototype + variant resolver + behaviour
  // ------------------------------------------------------------------
  const POSE_IDX = {
    lying: 0,
    sitting: 1,
    reaching: 2,
    curled: 3,
    seated: 4,
    child: 5,
    child_curled: 6,
  };
  const CRATE_IDX = {
    fizzo: 0,
    teletype: 1,
    electronics: 1,
    army: 2,
    military: 2,
    longwinter: 3,
    civil_defense: 3,
    plain: 4,
  };
  const LAMP_IDX = { floor: 0, desk: 1, hanging: 2, string: 3, lantern: 4 };
  const TYPES = {
    // mount: 'own_desk' (default) = terminal on its own small steel desk;
    //        'bare' = just the terminal, sitting on an EXISTING surface (aliases: 'desk' [legacy: "already on a desk"], 'none', onDesk:true);
    //        'wall' = wall-mounted unit.
    terminal: {
      proto: "terminal",
      v: (o) =>
        o.mount === "wall"
          ? 2
          : o.mount === "bare" ||
              o.mount === "desk" ||
              o.mount === "none" ||
              o.onDesk
            ? 1
            : 0,
      interact: "terminal",
    },
    safe: { proto: "safe", v: (o) => (o.wall ? 2 : o.variant || 0) },
    ammo_box: { proto: "ammo_box", v: (o) => (o.large ? 1 : 0) },
    first_aid: { proto: "first_aid", v: (o) => (o.floor ? 1 : 0) },
    fridge: { proto: "fridge" },
    desk: { proto: "desk" },
    file_cabinet: { proto: "file_cabinet" },
    locker: {
      proto: "locker",
      v: (o) => Math.max(0, Math.min(3, (o.count || 1) - 1)),
    },
    footlocker: { proto: "footlocker" },
    toolbox: { proto: "toolbox", v: (o) => (o.chest ? 1 : 0) },
    dumpster: { proto: "dumpster" },
    mailbox: { proto: "mailbox" },
    fizzo_machine: { proto: "fizzo_machine" },
    bed: { proto: "bed", v: (o) => (o.double ? 1 : 0), interact: "bed" },
    mattress: { proto: "mattress", interact: "bed_floor" },
    workbench: { proto: "workbench", interact: "workbench" },
    radio: { proto: "radio", interact: "radio" },
    tape_reel: {
      proto: "tape_reel",
      interact: "pickup",
      item: (o) => o.itemId || o.item || "tape_reel",
    },
    scrip_stash: { proto: "scrip_stash", v: (o) => (o.cooler ? 1 : 0) },
    campfire: { proto: "campfire", v: (o) => (o.spit ? 1 : o.pot ? 2 : 0) },
    shack: { proto: "shack" },
    sandbags: {
      proto: "sandbags",
      v: (o) => (o.curved ? 1 : o.low ? 2 : o.tall ? 3 : 0),
      row: 2.0,
    },
    turret: { proto: "turret_base", special: "turret" },
    barrel: {
      proto: "barrel",
      v: (o) =>
        o.radioactive
          ? 1
          : o.explosive || o.flammable
            ? 2
            : o.burning
              ? 3
              : o.chem
                ? 4
                : o.tipped
                  ? 5
                  : 0,
    },
    car: { special: "car" },
    lamp: {
      proto: "lamp",
      v: (o) => (LAMP_IDX[o.kind] !== undefined ? LAMP_IDX[o.kind] : 0),
      street: true,
    },
    crate: {
      proto: "crate",
      v: (o) =>
        CRATE_IDX[o.kind] !== undefined ? CRATE_IDX[o.kind] : o.variant || 0,
    },
    table: {
      proto: "table",
      v: (o) =>
        ({ diner: 0, wood: 1, overturned: 2, round: 3 })[o.kind] ||
        o.variant ||
        0,
    },
    chair: {
      proto: "chair",
      v: (o) =>
        ({ diner: 0, wood: 1, office: 2, knocked: 3 })[o.kind] ||
        o.variant ||
        0,
    },
    market_stall: {
      proto: "market_stall",
      v: (o) => (o.sign !== undefined ? o.sign : o.variant || 0),
    },
    skeleton: {
      proto: "skeleton",
      v: (o) =>
        POSE_IDX[o.pose] !== undefined ? POSE_IDX[o.pose] : o.variant || 0,
    },
    teddy_bear: {
      proto: "teddy_bear",
      interact: "pickup",
      item: () => "teddy_bear",
    },
    medallion: {
      proto: "medallion",
      v: (o) => medallionIndex(o),
      interact: "medallion",
    },
    fizzo_blue: {
      proto: "fizzo_blue",
      interact: "pickup",
      item: () => "fizzo_blue",
    },
    fizzo_cola: {
      proto: "fizzo_bottle",
      interact: "pickup",
      item: () => "fizzo_cola",
    },
    cash_register: { proto: "cash_register" },
    shelf: { proto: "shelf" },
    duffle_bag: { proto: "duffle_bag" },
    jersey_barrier: { proto: "jersey_barrier", row: 3.0 },
    chainlink: { proto: "chainlink", row: 3.0 },
    raider_wall: { proto: "raider_wall", row: 3.5 },
    trash_can: {
      proto: "trash_can",
      v: (o) => o.variant || 0,
      containerChance: 1,
    },
    billboard: { special: "billboard" },
  };
  // every other prototype is spawnable by its own name
  X.TYPES = TYPES;
  const CONTAINER_TYPES = new Set([
    "safe",
    "ammo_box",
    "first_aid",
    "fridge",
    "desk",
    "file_cabinet",
    "dresser",
    "locker",
    "footlocker",
    "toolbox",
    "dumpster",
    "mailbox",
    "fizzo_machine",
    "scrip_stash",
    "cash_register",
    "duffle_bag",
    "trash_can",
  ]);

  // Locks (G.locks: keys / codes / passcodes). Props never invent locks: a caller's `lock` spec rides on the
  // container def and is registered for the audit. While the locks module is absent this is a no-op.
  function registerLock(spec) {
    try {
      if (spec && spec.id && !G.isStub("locks") && G.locks.register)
        G.locks.register(spec);
    } catch (e) {
      /* ignore */
    }
  }

  // ------------------------------------------------------------------
  // Records & lifecycle
  // ------------------------------------------------------------------
  const RECS = (X.SPAWNED = []);
  let firstResetDone = false;
  let uid = 0;

  function worldPoint(obj, lx, ly, lz, out) {
    return (out || new THREE.Vector3())
      .set(lx, ly, lz)
      .applyMatrix4(obj.matrixWorld);
  }
  const _wp = new THREE.Vector3(),
    _muz = new THREE.Vector3();
  function rotOff(yaw, lx, lz) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    return [lx * c + lz * s, -lx * s + lz * c];
  }

  /** Colliders from proto meta at a world transform (yaw only). */
  X.addProtoColliders = function (pr, x, y, z, yaw, scale, tag, data) {
    const out = [];
    const list =
      pr.meta.colliders || (pr.meta.collider ? [pr.meta.collider] : []);
    const s = scale || 1;
    for (const c of list) {
      const o = rotOff(yaw, (c.cx || 0) * s, (c.cz || 0) * s);
      out.push(
        G.world.addCollider(
          x + o[0],
          z + o[1],
          c.w * s,
          c.d * s,
          y + (c.y0 || 0) * s,
          y + ((c.y0 || 0) + c.h) * s,
          yaw,
          { tag: tag || "prop", surface: pr.meta.surface || "metal", data },
        ),
      );
    }
    return out;
  };
  /** Glows / fires / radiation sources from proto meta at a transform. Returns handles for removal. */
  X.addProtoFx = function (pr, x, y, z, yaw, scale, persistentFx) {
    const h = { glows: [], fires: [], radSrc: [] };
    const s = scale || 1;
    for (const g of pr.meta.glows || []) {
      const o = rotOff(yaw, g.x * s, g.z * s);
      if (X.glow)
        h.glows.push(
          X.glow.add(
            x + o[0],
            y + g.y * s,
            z + o[1],
            g.color,
            g.size * s,
            g.flicker,
            g.interior,
          ),
        );
    }
    for (const f of pr.meta.fires || []) {
      const o = rotOff(yaw, f.x * s, f.z * s);
      if (X.flames) {
        const fh = X.flames.add(x + o[0], y + f.y * s, z + o[1], f.scale * s, {
          smokeCount: 3,
        });
        h.fires.push(fh);
        if (persistentFx)
          X.FIRE_SPOTS.push({
            x: x + o[0],
            y: y + f.y * s,
            z: z + o[1],
            h: fh,
          });
      }
    }
    if (pr.meta.radiation) {
      const r = pr.meta.radiation;
      h.radSrc.push(
        G.world.addRadSource({
          x,
          y: y + r.y,
          z,
          radius: r.radius,
          strength: r.strength,
        }),
      );
    }
    return h;
  };
  X.removeProtoFx = function (h) {
    if (!h) return;
    for (const i of h.glows) if (X.glow) X.glow.remove(i);
    for (const f of h.fires) if (f && f.stop) f.stop();
    for (const r of h.radSrc) G.world.removeRadSource(r);
    h.glows = [];
    h.fires = [];
    h.radSrc = [];
  };
  X.FIRE_SPOTS = [];

  function resolveType(type, o) {
    const T = TYPES[type];
    if (T)
      return {
        T,
        proto: T.proto,
        variant:
          typeof o.variant === "number" && !T.v
            ? o.variant
            : T.v
              ? T.v(o)
              : o.variant || 0,
      };
    if (X.hasProto(type))
      return { T: {}, proto: type, variant: o.variant || 0 };
    return null;
  }

  /**
   * Spawn a prop. opts: {x,y?,z,yaw?, scale?, parent?, id?, name?, label?,
   *   loot?, items?, lock? (G.locks spec), owner?, container?:bool, terminalId?, medallion?|stat?, itemId?,
   *   kind?, pose?, radioactive?, burning?, explosive?, count? (row of segments),
   *   collide?:bool, lod?:metres, onInteract?(), verb?, hostile?, faction? (turret)}
   * Returns {type, id, object3d, interactable, container, colliders, remove()}.
   */
  P.spawn = function (type, opts) {
    opts = opts || {};
    try {
      return spawnImpl(type, opts);
    } catch (e) {
      G.reportError("props:spawn:" + type, e);
      const obj = new THREE.Group();
      obj.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
      return {
        type,
        object3d: obj,
        interactable: null,
        container: null,
        remove() {},
      };
    }
  };
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
  function tableKnown(t) {
    try {
      if (typeof G.items.hasLootTable === "function")
        return !!G.items.hasLootTable(t);
      if (G.items.lootTables && typeof G.items.lootTables === "object")
        return !!G.items.lootTables[t];
    } catch (e) {
      /* ignore */
    }
    return null; // unknown
  }
  function makeContainer(rec) {
    if (!rec.cdef || rec.container || rec.removed || rec.taken) return;
    if (
      !G.isStub("containers") &&
      typeof G.containers.create === "function" &&
      !X.containersReady
    )
      return; // created at initDone
    if (G.isStub("containers") || typeof G.containers.create !== "function") {
      // fallback until rpg exists (or forever, if it never does)
      if (!rec.fallbackInteract) {
        rec.fallbackInteract = G.world.addInteractable({
          pos: rec.ipos,
          radius: 0.7,
          label: rec.cdef.name,
          verb: "Search",
          enabled: () => G.isStub("containers") || !rec.container,
          onInteract() {
            X.sfx("container_open", { pos: rec.ipos });
            G.notify("The " + rec.cdef.name.toLowerCase() + " is empty.");
          },
        });
      }
      return;
    }
    const d = rec.cdef;
    const def = {
      pos: rec.ipos.clone(),
      name: d.name,
      id: d.id,
      kind: d.kind || d.loot,
    };
    if (d.lock) {
      def.lock = d.lock;
      registerLock(d.lock);
    }
    if (d.locked) def.locked = d.locked;
    if (rec.obj) def.object3d = rec.obj;
    else {
      def.model = false;
      def.pos.y -= 0.4;
    } // rpg lifts pos-only containers by 0.4
    if (d.owner) def.owner = d.owner;
    if (d.respawn !== undefined) def.respawn = d.respawn;
    if (d.items) def.items = d.items;
    else if (d.loot) {
      const known = tableKnown(d.loot);
      if (known !== false) def.loot = d.loot;
      else if (d.defLoot && tableKnown(d.defLoot) !== false)
        def.loot = d.defLoot; // unknown table → the prop's own default
      else def.items = fallbackItems(d.loot, U.hashStr(d.id));
    }
    try {
      rec.container = G.containers.create(def) || null;
    } catch (e) {
      G.reportError("props:container", e);
      rec.container = null;
    }
    if (rec.fallbackInteract) {
      G.world.removeInteractable(rec.fallbackInteract);
      rec.fallbackInteract = null;
    }
  }
  function destroyContainer(rec) {
    if (rec.fallbackInteract) {
      G.world.removeInteractable(rec.fallbackInteract);
      rec.fallbackInteract = null;
    }
    const c = rec.container;
    if (!c) return;
    try {
      if (!G.isStub("containers") && typeof G.containers.remove === "function")
        G.containers.remove(c);
      else if (typeof G.containers.destroy === "function")
        G.containers.destroy(c);
      else if (typeof c.remove === "function") c.remove();
      else if (typeof c.dispose === "function") c.dispose();
      if (c.interactable) G.world.removeInteractable(c.interactable);
    } catch (e) {
      /* ignore */
    }
    rec.container = null;
  }
  X.makeContainer = makeContainer;
  X.destroyContainer = destroyContainer;

  // ------------------------------------------------------------------
  // Interactions
  // ------------------------------------------------------------------
  // World's Fair medallions: spawn('medallion', {medallion: key|itemId}) — `stat` (an attribute / skill key, any
  // spelling rpg understands) is accepted too. rpg owns the set (G.items.medallionId); the curator in src/quests/55_medallions.js buys them.
  function medallionKey(o) {
    return o.medallion || o.itemId || o.stat || null;
  }
  function medallionItem(o) {
    const key = medallionKey(o);
    if (!key) return null;
    try {
      if (G.isStub("items")) return null;
      const d = G.items.get(key);
      if (d && d.medallion) return d.id;
      if (typeof G.items.medallionId === "function") {
        const id = G.items.medallionId(key);
        if (id && G.items.get(id)) return id;
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  }
  function medallionIndex(o) {
    if (typeof o.index === "number") return o.index;
    return (
      U.hashStr(String(medallionItem(o) || medallionKey(o) || "medallion")) % 20
    );
  }
  function itemName(id) {
    try {
      const d = !G.isStub("items") && G.items.get(id);
      if (d && d.name) return d.name;
    } catch (e) {
      /* ignore */
    }
    return id.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  }
  function giveItem(id, n) {
    if (!G.isStub("inventory") && typeof G.inventory.add === "function") {
      try {
        G.inventory.add(id, n || 1);
        return true;
      } catch (e) {
        G.reportError("props:give", e);
      }
    }
    G.notify(itemName(id) + " added.");
    return false;
  }
  function setupInteract(rec, kind, T) {
    const o = rec.opts;
    const base = { pos: rec.ipos, radius: 0.6, priority: 0 };
    let def = null;
    switch (kind) {
      case "terminal":
        def = Object.assign(base, {
          label: o.name || o.label || "Teletype Terminal",
          verb: "Access",
          radius: 0.55,
          onInteract() {
            X.sfx("terminal_boot", { pos: rec.ipos });
            if (
              !G.isStub("terminals") &&
              typeof G.terminals.open === "function" &&
              o.terminalId
            )
              G.terminals.open(o.terminalId);
            else
              G.notify(
                o.terminalId
                  ? "The terminal flickers but will not boot."
                  : "The screen is dead.",
              );
          },
        });
        break;
      case "bed":
      case "bed_floor":
        def = Object.assign(base, {
          label: o.name || (kind === "bed" ? "Bed" : "Dirty Mattress"),
          verb: "Sleep",
          radius: 0.9,
          onInteract() {
            sleep(rec, kind === "bed" ? 1 : 0.6);
          },
        });
        break;
      case "radio":
        def = Object.assign(base, {
          label: o.name || "Radio",
          verb: () => (thisRadioOn(rec) ? "Turn Off" : "Turn On"),
          radius: 0.4,
          onInteract() {
            if (G.isStub("radio")) {
              G.notify("Only static...");
              X.sfx("ui_click", { pos: rec.ipos });
              return;
            }
            try {
              // the set itself plays the station (positional, small-speaker tone): G.radio.tune(id, {pos})
              if (thisRadioOn(rec)) G.radio.tune(null);
              else {
                const st = G.radio.stations() || [];
                let pick = o.station;
                if (!pick) {
                  try {
                    pick = G.radio.current && G.radio.current();
                  } catch (e) {
                    pick = null;
                  }
                }
                if (!pick)
                  pick = (st.find((s) => s.id === "rfm") || st[0] || {}).id;
                if (pick)
                  G.radio.tune(pick, {
                    pos: { x: rec.ipos.x, y: rec.ipos.y, z: rec.ipos.z },
                  });
              }
            } catch (e) {
              G.reportError("props:radio", e);
            }
          },
        });
        break;
      case "workbench":
        def = Object.assign(base, {
          label: o.name || "Workbench",
          verb: "Use",
          radius: 0.9,
          onInteract() {
            if (o.onInteract) o.onInteract(rec);
            else {
              G.emit("workbench", rec);
              // weapons owns the crafting screen; only fall back to the flavour line when it isn't loaded
              const crafting =
                !G.isStub("weapons") &&
                typeof G.weapons.openWorkbench === "function";
              if (!crafting)
                G.notify(
                  "You tinker with the workbench, but lack the schematics to build anything.",
                );
            }
          },
        });
        break;
      case "pickup": {
        const id = T.item ? T.item(o) : o.itemId;
        def = Object.assign(base, {
          label: o.name || o.label || itemName(id),
          verb: "Take",
          radius: 0.35,
          priority: 1,
          onInteract() {
            X.sfx("pickup", { pos: rec.ipos });
            giveItem(id, o.count || 1);
            takeRec(rec);
            if (o.onTake) o.onTake(rec);
          },
        });
        break;
      }
      case "medallion": {
        const mid = medallionItem(o);
        def = Object.assign(base, {
          label: o.name || (mid ? itemName(mid) : "World's Fair Medallion"),
          verb: "Take",
          radius: 0.3,
          priority: 2,
          onInteract() {
            collectMedallion(o);
            takeRec(rec);
            if (o.onTake) o.onTake(rec);
          },
        });
        break;
      }
      case "custom":
        def = Object.assign(base, {
          label: o.label || o.name || rec.type,
          verb: o.verb || "Use",
          onInteract() {
            o.onInteract(rec);
          },
        });
        break;
    }
    if (def) {
      def.object3d = rec.obj;
      def.enabled = () => !rec.taken && !rec.removed;
      rec.interactable = G.world.addInteractable(def);
    }
  }
  /** True when the world radio emitter is this set. */
  function thisRadioOn(rec) {
    if (!radioOn()) return false;
    try {
      const e = G.radio.emitter ? G.radio.emitter() : null;
      return !!e && Math.hypot(e.x - rec.ipos.x, e.z - rec.ipos.z) < 0.6;
    } catch (err) {
      return false;
    }
  }
  function radioOn() {
    try {
      return !G.isStub("radio") && G.radio.isOn && G.radio.isOn();
    } catch (e) {
      return false;
    }
  }
  function takeRec(rec) {
    rec.taken = true;
    rec.obj.visible = false;
    if (rec.lod) rec.lod._hidden = true;
    if (rec.obj.parent) rec.obj.parent.remove(rec.obj);
    X.removeProtoFx(rec.fx);
    if (rec.interactable) {
      G.world.removeInteractable(rec.interactable);
      rec.interactable = null;
    }
    X.TAKEN.add(rec.id);
  }
  X.TAKEN = new Set();
  function restoreRec(rec) {
    if (!rec.taken || rec.removed) return;
    rec.taken = false;
    (rec.opts.parent || X.spawnRoot || G.scene).add(rec.obj);
    rec.obj.visible = true;
    rec.fx = X.addProtoFx(
      rec.pr,
      rec.obj.position.x,
      rec.obj.position.y,
      rec.obj.position.z,
      rec.obj.rotation.y,
      rec.obj.scale.x,
      false,
    );
    const T = TYPES[rec.type] || {};
    if (T.interact) setupInteract(rec, T.interact, T);
    X.TAKEN.delete(rec.id);
  }
  function collectMedallion(o) {
    // rpg owns the bonus: adding the medallion item to the inventory records it, applies it and notifies.
    const mid = medallionItem(o);
    try {
      if (mid && !G.isStub("inventory")) {
        X.sfx("pickup", {});
        G.inventory.add(mid, 1);
        G.emit("medallionCollected", mid);
        return;
      }
    } catch (e) {
      G.reportError("props:medallion", e);
    }
    // rpg absent (or no medallion for this key): just a souvenir
    X.sfx("pickup", {});
    G.notify("You pocket a bronze World's Fair medallion.");
    G.emit("medallionCollected", mid || medallionKey(o));
  }
  function sleep(rec, quality) {
    try {
      if (
        !G.isStub("combat") &&
        G.combat.detection &&
        G.combat.detection() === "danger"
      ) {
        G.notify("You cannot sleep when enemies are nearby.");
        X.sfx("ui_error");
        return;
      }
    } catch (e) {
      /* ignore */
    }
    G.fadeTransition(() => {
      if (!G.isStub("rpg") && typeof G.rpg.sleep === "function") {
        try {
          G.rpg.sleep(8, { owned: quality >= 1 && rec.opts.owned !== false });
          if (quality < 1)
            G.notify("You slept for 8 hours on a filthy mattress.");
          return;
        } catch (e) {
          G.reportError("props:sleep", e);
        }
      }
      const hours = 8;
      const nh = (G.time.hour + hours) % 24;
      if (G.time.hour + hours >= 24) G.time.day++;
      try {
        if (!G.isStub("atmos") && G.atmos.setHour) G.atmos.setHour(nh);
        else G.time.hour = nh;
      } catch (e) {
        G.time.hour = nh;
      }
      const p = G.player;
      p.heal(p.maxHp * quality);
      p.stamina = p.maxStamina;
      G.emit("slept", { hours, quality, bed: rec.id });
      G.notify(
        quality >= 1
          ? "You slept for 8 hours and feel well rested."
          : "You slept for 8 hours on a filthy mattress.",
      );
    }, 0.9);
  }

  // ------------------------------------------------------------------
  // Explosive drums
  // ------------------------------------------------------------------
  X.EXPLOSIVES = [];
  function registerExplosive(rec, def) {
    const p = rec.obj.position;
    const e = {
      rec,
      x: p.x,
      y: p.y + 0.5,
      z: p.z,
      hp: def.hp,
      maxHp: def.hp,
      radius: def.radius,
      damage: def.damage,
      dead: false,
      fuse: -1,
    };
    rec.explosive = e;
    X.EXPLOSIVES.push(e);
  }
  /** Register an explosive that is part of a static batch (no object3d) — hide via callback. */
  X.registerStaticExplosive = function (x, y, z, def, onDestroy, restore) {
    const e = {
      x,
      y: y + 0.5,
      z,
      hp: def.hp,
      maxHp: def.hp,
      radius: def.radius,
      damage: def.damage,
      dead: false,
      fuse: -1,
      onDestroy,
      restore,
      static: true,
      id: "barrel@" + x.toFixed(1) + "," + z.toFixed(1),
    };
    X.EXPLOSIVES.push(e);
    return e;
  };
  function damageExplosive(e, dmg) {
    if (e.dead || e.fuse >= 0) return;
    e.hp -= dmg;
    if (e.hp <= 0) {
      e.fuse = 0.12 + Math.random() * 0.2;
      if (X.flames)
        e.fire = X.flames.add(e.x, e.y + 0.4, e.z, 0.6, { smokeCount: 2 });
    }
  }
  function explodeExplosive(e) {
    e.dead = true;
    if (e.fire && e.fire.stop) e.fire.stop();
    const p = new THREE.Vector3(e.x, e.y, e.z);
    if (e.rec) wreckRec(e.rec);
    if (e.onDestroy) e.onDestroy(e);
    X.explosion(p, e.radius, e.damage, { source: "barrel", kind: "normal" });
    X.EXPLODED_BARRELS.add(e.id || (e.rec && e.rec.id));
    G.emit("propExploded", {
      type: e.rec ? e.rec.type : "barrel",
      kind: "barrel",
      id: e.id || (e.rec && e.rec.id),
      pos: p,
    });
  }
  /** Remove an exploded prop from the world: mesh, colliders, interactable, container AND its fx (fire / glow / radiation source). */
  function wreckRec(r) {
    if (r.obj.parent) r.obj.parent.remove(r.obj);
    for (const c of r.colliders) G.world.removeCollider(c);
    r.colliders = [];
    if (r.interactable) {
      G.world.removeInteractable(r.interactable);
      r.interactable = null;
    }
    destroyContainer(r);
    if (r.fx) {
      const dead = r.fx.fires.slice();
      X.removeProtoFx(r.fx);
      X.FIRE_SPOTS = X.FIRE_SPOTS.filter((f) => dead.indexOf(f.h) < 0);
    }
    r.exploded = true;
  }
  X.EXPLODED_BARRELS = new Set();

  // ------------------------------------------------------------------
  // Auto-turrets
  // ------------------------------------------------------------------
  X.TURRETS = [];
  function setupTurret(rec) {
    const o = rec.opts;
    const head = X.instantiate(X.proto("turret_head", o.continuity ? 1 : 0));
    head.position.set(0, 1.18, 0);
    rec.obj.add(head);
    const t = {
      rec,
      head,
      hp: o.hp || 70,
      alive: true,
      yaw: 0,
      burst: 0,
      cool: 1 + Math.random(),
      scan: Math.random() * 6,
      faction: o.faction || (o.hostile ? "raiders" : "covenant"),
      hostileToPlayer: o.hostile !== undefined ? !!o.hostile : null,
      range: o.range || 38,
      damage: o.damage || 5,
      enabled: o.enabled !== false,
      group: o.terminalId || o.group || null,
      baseHostile: o.hostile !== undefined ? !!o.hostile : null,
      baseEnabled: o.enabled !== false,
      muzzle: new THREE.Vector3(),
      muzzleYaw: NaN,
      xp: o.xp !== undefined ? o.xp : 10,
    };
    rec.turret = t;
    if (!t.enabled) head.rotation.x = 0.38;
    X.TURRETS.push(t);
  }
  /**
   * Terminal / script control of turrets. key = the turret's opts.terminalId, opts.group or its spawn id.
   * state: {enabled?:bool, hostile?:bool} or 'off' | 'on' | 'friendly' | 'hostile'. Returns the number affected.
   * e.g. terminal entry: {title:'Deactivate Turrets', action: () => G.props.setTurrets('ex_sec', 'off')}
   */
  P.setTurrets = function (key, state) {
    if (typeof state === "string")
      state =
        state === "off"
          ? { enabled: false }
          : state === "on"
            ? { enabled: true }
            : state === "friendly"
              ? { hostile: false, enabled: true }
              : state === "hostile"
                ? { hostile: true, enabled: true }
                : {};
    state = state || {};
    let n = 0;
    for (const t of X.TURRETS) {
      if (
        key !== undefined &&
        key !== null &&
        t.group !== key &&
        t.rec.id !== key
      )
        continue;
      if (state.enabled !== undefined) {
        t.enabled = !!state.enabled;
        t.burst = 0;
        t.head.rotation.x = t.enabled || !t.alive ? (t.alive ? 0 : 0.5) : 0.38;
      }
      if (state.hostile !== undefined) t.hostileToPlayer = !!state.hostile;
      n++;
    }
    if (n) X.sfx(state.enabled === false ? "terminal_beep" : "ui_click", {});
    return n;
  };
  P.turrets = function (key) {
    return X.TURRETS.filter(
      (t) => key === undefined || t.group === key || t.rec.id === key,
    ).map((t) => ({
      id: t.rec.id,
      group: t.group,
      alive: t.alive,
      enabled: t.enabled,
      hostile: turretHostileToPlayer(t),
      hp: t.hp,
      pos: t.rec.obj.position.clone(),
    }));
  };
  function turretHostileToPlayer(t) {
    if (t.hostileToPlayer !== null) return t.hostileToPlayer;
    try {
      if (!G.isStub("combat") && G.combat.relation)
        return G.combat.relation(t.faction, "player") === "hostile";
    } catch (e) {
      /* ignore */
    }
    return false;
  }
  const _tp = new THREE.Vector3(),
    _td = new THREE.Vector3();
  function updateTurrets(dt) {
    if (!X.TURRETS.length || dt <= 0) return;
    const pl = G.player;
    for (const t of X.TURRETS) {
      if (!t.alive || t.rec.removed) continue;
      const obj = t.rec.obj;
      const dxp = pl.pos.x - obj.position.x,
        dzp = pl.pos.z - obj.position.z;
      if (dxp * dxp + dzp * dzp > 120 * 120) continue; // dormant far away
      if (!t.enabled) continue; // switched off from a terminal
      // muzzle position only changes when the head turns → cache it
      if (t.muzzleYaw !== t.yaw) {
        t.head.updateWorldMatrix(true, false);
        worldPoint(t.head, 0, 0.12, -0.9, t.muzzle);
        t.muzzleYaw = t.yaw;
      }
      const muzzle = t.muzzle;
      let target = null,
        tpos = null;
      if (turretHostileToPlayer(t) && pl.alive) {
        tpos = _tp.set(pl.pos.x, pl.pos.y + 1.2, pl.pos.z);
        if (
          muzzle.distanceTo(tpos) < t.range &&
          G.world.lineOfSight(muzzle, tpos, { ignoreTags: ["prop"] })
        )
          target = "player";
      }
      if (
        !target &&
        !G.isStub("actors") &&
        typeof G.actors.nearest === "function"
      ) {
        try {
          const a = G.actors.nearest(
            obj.position,
            t.range,
            (ac) =>
              !ac.dead &&
              ((ac.hostile && ac.hostile()) ||
                (G.combat.relation &&
                  G.combat.relation(t.faction, ac.faction) === "hostile")) &&
              ac.faction !== t.faction,
          );
          if (a) {
            tpos = _tp.set(a.pos.x, a.pos.y + 1.0, a.pos.z);
            if (
              G.world.lineOfSight(muzzle, tpos, {
                ignoreTags: ["prop", "actor"],
              })
            )
              target = a;
          }
        } catch (e) {
          /* ignore */
        }
      }
      let want;
      if (target)
        want =
          Math.atan2(-(tpos.x - obj.position.x), -(tpos.z - obj.position.z)) -
          obj.rotation.y;
      else {
        t.scan += dt * 0.5;
        want = Math.sin(t.scan) * 1.2;
      }
      const diff = U.wrapAngle(want - t.yaw);
      t.yaw += U.clamp(diff, -3 * dt, 3 * dt);
      t.head.rotation.y = t.yaw;
      t.cool -= dt;
      if (target && Math.abs(diff) < 0.15 && t.cool <= 0) {
        // burst fire
        t.burst = t.burst > 0 ? t.burst : 6;
        t.burst--;
        t.cool = t.burst > 0 ? 0.11 : 1.3 + Math.random() * 0.6;
        _td.subVectors(tpos, muzzle).normalize();
        X.sfx("gun_smg", { pos: muzzle, volume: 0.7 });
        if (!G.isStub("fx")) {
          try {
            G.fx.muzzleFlash(muzzle, _td, "smg");
          } catch (e) {
            /* ignore */
          }
        }
        let hit =
          Math.random() <
          (target === "player"
            ? (pl.sneaking ? 0.35 : 0.5) - Math.min(0.25, pl.moveSpeed * 0.03)
            : 0.6);
        const end = _wp.set(
          tpos.x + (Math.random() - 0.5) * (hit ? 0.2 : 1.6),
          tpos.y + (Math.random() - 0.5) * (hit ? 0.2 : 1.2),
          tpos.z + (Math.random() - 0.5) * (hit ? 0.2 : 1.6),
        );
        if (!G.isStub("fx")) {
          try {
            G.fx.tracer(muzzle, end, 0xffd080);
          } catch (e) {
            /* ignore */
          }
        }
        if (hit) {
          if (target === "player")
            pl.damage(t.damage, { type: "ballistic", source: "turret" });
          else
            try {
              target.damage(t.damage * 1.5, {
                type: "ballistic",
                source: "turret",
              });
            } catch (e) {
              /* ignore */
            }
        } else if (!G.isStub("fx")) {
          try {
            G.fx.impact(end, new THREE.Vector3(0, 1, 0), "concrete");
          } catch (e) {
            /* ignore */
          }
        }
      }
    }
  }
  function damageTurret(t, dmg) {
    if (!t.alive) return;
    t.hp -= dmg;
    if (!G.isStub("fx")) {
      try {
        G.fx.sparks(worldPoint(t.head, 0, 0.1, 0, _wp));
      } catch (e) {
        /* ignore */
      }
    }
    if (t.hp <= 0) {
      t.alive = false;
      t.head.rotation.x = 0.5;
      t.head.rotation.z = 0.3;
      t.muzzleYaw = NaN;
      const p = worldPoint(t.head, 0, 0.1, 0);
      X.explosion(p, 3, 25, { source: "turret", kind: "normal", small: true });
      X.sfx("robot_death", { pos: p });
      if (X.flames)
        t.smoke = X.flames.add(p.x, p.y, p.z, 0.5, {
          flames: 0,
          smokeCount: 4,
          smokeScale: 0.5,
        });
      G.emit("propExploded", {
        type: "turret",
        kind: t.rec.opts.continuity ? "continuity" : "turret",
        id: t.rec.id,
        pos: p,
      });
      G.emit("turretDestroyed", {
        id: t.rec.id,
        group: t.group,
        faction: t.faction,
        pos: p,
      });
      // XP like any robot kill (FO3 gives XP for turrets)
      if (t.xp > 0 && !G.isStub("rpg") && typeof G.rpg.addXP === "function") {
        try {
          G.rpg.addXP(t.xp, "Turret destroyed");
        } catch (e) {
          G.reportError("props:turretXP", e);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Explosions (combat when present; self-contained fallback otherwise)
  // ------------------------------------------------------------------
  let lastExplosion = { t: -1, x: 0, z: 0 };
  X.explosion = function (pos, radius, damage, o) {
    o = o || {};
    lastExplosion = { t: G.time.real, x: pos.x, z: pos.z };
    let handled = false;
    if (!G.isStub("combat") && typeof G.combat.explode === "function") {
      try {
        G.combat.explode(pos, radius, damage, {
          source: o.source || "prop",
          kind: o.kind || "normal",
        });
        handled = true;
      } catch (e) {
        G.reportError("props:explode", e);
      }
    }
    if (!handled) {
      if (!G.isStub("fx") && typeof G.fx.explosion === "function") {
        try {
          G.fx.explosion(pos, radius, o.kind || "normal");
        } catch (e) {
          /* ignore */
        }
      }
      X.sfx(o.small ? "explosion" : "explosion", {
        pos,
        volume: o.small ? 0.7 : 1,
      });
      // player damage + shake
      const pl = G.player,
        d = Math.hypot(
          pl.pos.x - pos.x,
          pl.pos.y + 1 - pos.y,
          pl.pos.z - pos.z,
        );
      if (d < radius)
        pl.damage(damage * (1 - d / radius), {
          type: "explosive",
          source: o.source || "prop",
        });
      if (d < radius * 5)
        pl.shake(Math.min(0.9, 2.5 / Math.max(1, d / radius)), 0.5);
      if (!G.isStub("actors") && typeof G.actors.inRadius === "function") {
        try {
          for (const a of G.actors.inRadius(pos, radius) || []) {
            if (a.dead) continue;
            const da = a.pos.distanceTo(pos);
            a.damage(damage * (1 - da / radius), {
              type: "explosive",
              source: o.source || "prop",
            });
          }
        } catch (e) {
          /* ignore */
        }
      }
    }
    // own flash & fireball (works even without the fx module)
    if (G.isStub("fx") && X.flames) {
      const f = X.flames.add(pos.x, pos.y - 0.3, pos.z, radius * 0.45, {
        flames: 16,
        smokeCount: 8,
        smokeScale: radius * 0.3,
        spread: 2.5,
      });
      const gi = X.glow
        ? X.glow.add(pos.x, pos.y + 1, pos.z, 0xffa040, radius * 5, 0)
        : -1;
      X.TIMERS.push(
        {
          t: 0.9,
          fn: () => {
            f.setScale(radius * 0.2);
          },
        },
        {
          t: 2.2,
          fn: () => {
            f.stop();
            if (gi >= 0) X.glow.remove(gi);
          },
        },
      );
    }
    // chain reaction into other props (slight delay so chains ripple)
    X.TIMERS.push({
      t: 0.08,
      fn: () => areaDamage(pos, radius * 1.15, damage),
    });
  };
  X.TIMERS = [];
  function areaDamage(pos, radius, dmg) {
    for (const { car, d } of X.carsNear(pos, radius))
      X.damageCar(car, dmg * (1 - d / (radius + 1)) * 1.3, {
        instant: d < radius * 0.35,
      });
    for (const e of X.EXPLOSIVES) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - pos.x, e.y - pos.y, e.z - pos.z);
      if (d < radius) damageExplosive(e, dmg * (1 - d / radius) * 1.5);
    }
    for (const t of X.TURRETS) {
      if (!t.alive) continue;
      const p = t.rec.obj.position;
      const d = Math.hypot(p.x - pos.x, p.z - pos.z);
      if (d < radius) damageTurret(t, dmg * (1 - d / radius));
    }
  }

  // ------------------------------------------------------------------
  // Public damage entry point (combat calls this for bullets / blasts)
  // ------------------------------------------------------------------
  let lastExternalHit = -1;
  P.damageAt = function (pos, dmg, opts) {
    if (typeof opts === "number") opts = { radius: opts }; // combat.explode passes the radius directly
    opts = opts || {};
    if (!pos) return false;
    if (!opts._internal) lastExternalHit = G.time.real;
    const r = opts.radius || 0;
    // ignore echoes of our own explosion
    if (
      r > 0 &&
      Math.abs(G.time.real - lastExplosion.t) < 0.06 &&
      Math.hypot(pos.x - lastExplosion.x, pos.z - lastExplosion.z) < 0.5
    )
      return false;
    if (r > 0) {
      areaDamage(pos, r, dmg);
      return true;
    }
    let hit = false;
    for (const { car } of X.carsNear(pos, 0.6)) {
      X.damageCar(car, dmg, opts);
      hit = true;
    }
    for (const e of X.EXPLOSIVES) {
      if (!e.dead && Math.hypot(e.x - pos.x, e.y - pos.y, e.z - pos.z) < 0.9) {
        damageExplosive(e, dmg);
        hit = true;
      }
    }
    for (const t of X.TURRETS) {
      if (!t.alive) continue;
      const tp = t.rec.obj.position;
      if (Math.abs(tp.x - pos.x) > 2 || Math.abs(tp.z - pos.z) > 2) continue;
      t.head.updateWorldMatrix(true, false);
      if (worldPoint(t.head, 0, 0.1, 0, _wp).distanceTo(pos) < 0.9) {
        damageTurret(t, dmg);
        hit = true;
      }
    }
    return hit;
  };
  P.explodeAt = function (pos, radius, dmg) {
    X.explosion(pos, radius || 5, dmg || 80, { source: "script" });
  };

  // Fallback bullet detection: if nobody reported a hit shortly after the
  // player fired, raycast ourselves (covers combat being a stub).
  let pendingShot = null;
  G.on("weaponFired", (def) => {
    try {
      const w = def && (def.weapon || (def.def && def.def.weapon) || def);
      const dmg = (w && (w.damage || 0)) * ((w && w.pellets) || 1) || 15;
      if (w && w.skill === "melee") return;
      pendingShot = { t: G.time.real, dmg, frames: 0 };
    } catch (e) {
      /* ignore */
    }
  });
  const _po = new THREE.Vector3(),
    _pd = new THREE.Vector3();
  X.processPendingShot = function () {
    if (!pendingShot) return;
    // the combat module resolves every shot itself and calls damageAt for world hits → never double-dip
    if (!G.isStub("combat") && typeof G.combat.fire === "function") {
      pendingShot = null;
      return;
    }
    if (++pendingShot.frames < 2) return;
    const s = pendingShot;
    pendingShot = null;
    if (lastExternalHit >= s.t - 0.001) return; // somebody already reported it
    _po.copy(G.player.eye);
    _pd.copy(G.player.forward).normalize();
    // do NOT ignore actors: an enemy standing in front of a car must stop the bullet
    const hit = G.world.raycast(_po, _pd, 300, {});
    if (!hit) return;
    const c = hit.collider;
    if (!c || c.actor || c.tag === "actor" || (c.data && c.data.actor)) return;
    if (c.tag === "prop_car" || c.tag === "prop" || c.tag === "prop_explosive")
      P.damageAt(hit.point, s.dmg, { _internal: true });
  };

  // ------------------------------------------------------------------
  // Lifecycle hooks (called from 70_module.js)
  // ------------------------------------------------------------------
  X.onReset = function () {
    firstResetDone = true;
    // remove session-scoped spawns, keep persistent (world) ones
    for (const rec of RECS.slice()) {
      if (!rec.persistent) {
        removeRec(rec, true);
        continue;
      }
      // persistent containers stay registered: rpg resets them to pristine on 'reset'
      if (rec.taken) restoreRec(rec);
      if (rec.exploded) {
        rec.exploded = false;
        (rec.opts.parent || X.spawnRoot || G.scene).add(rec.obj);
        const op = rec.obj.position;
        rec.colliders = X.addProtoColliders(
          rec.pr,
          op.x,
          op.y,
          op.z,
          rec.obj.rotation.y,
          rec.obj.scale.x,
          "prop",
          null,
        );
        rec.fx = X.addProtoFx(
          rec.pr,
          op.x,
          op.y,
          op.z,
          rec.obj.rotation.y,
          rec.obj.scale.x,
          true,
        );
        if (rec.cdef && !rec.container) makeContainer(rec);
        const T = TYPES[rec.type] || {};
        if (T.interact) setupInteract(rec, T.interact, T);
      }
      if (rec.turret) {
        const t = rec.turret;
        t.alive = true;
        t.hp = rec.opts.hp || 70;
        t.enabled = t.baseEnabled;
        t.hostileToPlayer = t.baseHostile;
        t.muzzleYaw = NaN;
        t.burst = 0;
        t.head.rotation.set(t.enabled ? 0 : 0.38, 0, 0);
        if (t.smoke) {
          t.smoke.stop();
          t.smoke = null;
        }
      }
    }
    for (const e of X.EXPLOSIVES) {
      if (e.fire && e.fire.stop) e.fire.stop();
      if (e.dead && e.restore) e.restore(e);
      if (e.rec && e.rec.removed) continue;
      e.dead = false;
      e.hp = e.maxHp;
      e.fuse = -1;
    }
    X.EXPLOSIVES = X.EXPLOSIVES.filter((e) => !(e.rec && e.rec.removed));
    X.EXPLODED_BARRELS.clear();
    X.TAKEN.clear();
    X.TIMERS.length = 0;
    X.resetCars();
  };
  /** (Re)create containers for every record + scattered world containers. */
  X.ensureContainers = function () {
    for (const rec of RECS)
      if (rec.cdef && !rec.container && !rec.removed) makeContainer(rec);
    if (X.ensureScatterContainers) X.ensureScatterContainers();
  };
  X.applySave = function (d) {
    if (!d) return;
    for (const id of d.taken || []) {
      const rec = RECS.find((r) => r.id === id);
      if (rec && !rec.taken) takeRec(rec);
    }
    for (const id of d.cars || []) {
      const car = X.CARS.byId.get(id);
      if (car && car.state !== "burnt") {
        car.state = "burnt";
        car.exploded = true;
        X.writeCar(car);
      }
    }
    for (const id of d.barrels || []) {
      const e = X.EXPLOSIVES.find((x) => (x.id || (x.rec && x.rec.id)) === id);
      if (e && !e.dead) {
        e.dead = true;
        if (e.rec) wreckRec(e.rec);
        if (e.onDestroy) e.onDestroy(e);
        X.EXPLODED_BARRELS.add(id);
      }
    }
  };
  X.collectSave = function () {
    return {
      taken: Array.from(X.TAKEN),
      cars: X.CARS.list
        .filter((c) => c.exploded && !c.removed)
        .map((c) => c.id),
      barrels: Array.from(X.EXPLODED_BARRELS).filter(Boolean),
    };
  };
  X.updateSpawn = function (dt, realDt) {
    // timers (explosion fx, chain reactions)
    if (X.TIMERS.length) {
      for (let i = X.TIMERS.length - 1; i >= 0; i--) {
        const t = X.TIMERS[i];
        t.t -= realDt;
        if (t.t <= 0) {
          X.TIMERS.splice(i, 1);
          try {
            t.fn();
          } catch (e) {
            G.reportError("props:timer", e);
          }
        }
      }
    }
    // explosive fuses
    for (const e of X.EXPLOSIVES)
      if (!e.dead && e.fuse >= 0) {
        e.fuse -= dt;
        if (e.fuse < 0) explodeExplosive(e);
      }
    updateTurrets(dt);
    X.processPendingShot();
  };

  // info helpers
  P.types = function () {
    return Object.keys(TYPES)
      .concat(X.protoNames().filter((n) => !TYPES[n]))
      .sort();
  };
  P.list = function () {
    return RECS.map((r) => ({
      type: r.type,
      id: r.id,
      pos: r.obj ? r.obj.position.clone() : null,
      container: !!r.container,
    }));
  };
})();
