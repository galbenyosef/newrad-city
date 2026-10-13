// play-inline-450 01 — proto
// Lines 12-352 of readable/play-inline-450.pretty.js (statement-aligned).
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
