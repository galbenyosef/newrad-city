// play-inline-211 10 — opts
// Lines 2595-2942 of readable/play-inline-211.pretty.js (statement-aligned).
  PH.window = function (b, fx, fz, ry, lx, y0, w, h, kind, opts) {
    opts = opts || {};
    const M = (dz, dy) => {
      const [x, z] = PH.rot(fx, fz, ry, lx, dz);
      return PH.m4(x, y0 + (dy || 0), z, ry);
    };
    const shape = opts.arch ? PH.archShape(w, h, opts.rise) : null;
    const pane = shape
      ? new THREE.ShapeGeometry(shape, 16)
      : (() => {
          const g = new THREE.PlaneGeometry(w, h);
          g.translate(0, h / 2, 0);
          return g;
        })();
    // paneZ: pane offset along the outward normal (−0.12 = recessed into an opening; use ≈+0.03 on solid façades)
    const pz = opts.paneZ === undefined ? -0.12 : opts.paneZ,
      mz = opts.paneZ === undefined ? -0.08 : opts.paneZ + 0.03;
    if (kind !== "open")
      b.geo(kind === "glass" ? "glass" : "shadow", pane, M(pz), { grime: 0.2 }); // 'open': caller supplies its own pane
    if (kind === "boarded") {
      const r = PH.rng("brd" + fx + lx + y0);
      for (let k = 0; k < Math.max(2, Math.round(h / 0.45)); k++) {
        const yy = 0.2 + k * 0.42;
        if (yy > h - (opts.arch ? w * 0.4 : 0.2)) break;
        const [x, z] = PH.rot(
          fx,
          fz,
          ry,
          lx + (r() - 0.5) * 0.1,
          Math.max(0.03, pz + 0.05),
        );
        b.box("rotten", x, y0 + yy, z, w * 1.05, 0.3, 0.04, {
          ry,
          rz: (r() - 0.5) * 0.12,
          seg: false,
        });
      }
    }
    if (kind === "glass" || kind === "broken" || kind === "open") {
      const mk = opts.mull || "paint_white";
      const [x, z] = PH.rot(fx, fz, ry, lx, mz);
      b.box(mk, x, y0, z, 0.07, h - (opts.arch ? 0.05 : 0), 0.05, {
        ry,
        seg: false,
      });
      for (let t = 1; t < 3; t++) {
        const [x2, z2] = PH.rot(fx, fz, ry, lx, mz);
        b.box(
          mk,
          x2,
          y0 + (h * t) / 3 - (opts.arch ? w * 0.18 : 0),
          z2,
          w,
          0.06,
          0.05,
          { ry, seg: false },
        );
      }
    }
    if (opts.frame !== false) {
      const fk = opts.frame || "limestone";
      if (shape)
        b.extrude(fk, PH.archRing(w, h, opts.ft || 0.22, opts.rise), 0.18, {
          m: M(-0.05),
        });
      else {
        const [x, z] = PH.rot(fx, fz, ry, lx, 0.04);
        b.box(fk, x, y0 + h, z, w + 0.44, 0.24, 0.2, { ry, seg: false });
        for (const s of [-1, 1]) {
          const [x2, z2] = PH.rot(fx, fz, ry, lx + s * (w / 2 + 0.11), 0.04);
          b.box(fk, x2, y0, z2, 0.22, h, 0.18, { ry, seg: false });
        }
      }
      if (opts.keystone !== false && shape) {
        const [x, z] = PH.rot(fx, fz, ry, lx, 0.08);
        b.box(fk, x, y0 + h - 0.05, z, 0.34, 0.5, 0.26, { ry, seg: false });
      }
      const [sx, sz] = PH.rot(fx, fz, ry, lx, 0.1);
      b.box(opts.sill || fk, sx, y0 - 0.16, sz, w + 0.5, 0.16, 0.3, {
        ry,
        seg: false,
      });
    }
  };

  // -------------------------------------------------------------------
  // Registry / anchors
  // -------------------------------------------------------------------
  PH.publish = function () {
    if (!G.pois || G.pois.__stub) G.pois = {};
    const P = G.pois;
    for (const id in PH.entries) P[id] = PH.entries[id];
    if (typeof P.getAnchor !== "function") {
      P.getAnchor = function (idOrKey, name) {
        const PP = G.pois;
        const cl = (v) => {
          const c = v.clone();
          c.yaw = v.yaw || 0;
          return c;
        };
        for (const k in PP) {
          const e = PP[k];
          if (!e || typeof e !== "object" || !e.anchors) continue;
          if (idOrKey && e.id !== idOrKey && e.interiorKey !== idOrKey)
            continue;
          if (e.anchors[name]) return cl(e.anchors[name]);
        }
        return null;
      };
    }
  };
  PH.register = function (id, e) {
    e.id = id;
    e.owner = "poi_harbor";
    PH.entries[id] = e;
    PH.publish();
    return e;
  };
  PH.getAnchor = function (id, name) {
    const e = PH.entries[id];
    if (e && e.anchors && e.anchors[name]) {
      const c = e.anchors[name].clone();
      c.yaw = e.anchors[name].yaw || 0;
      return c;
    }
    return null;
  };
  /** Interior root: hidden unless the player is inside that cell. */
  PH.interiorRoot = function (key, name) {
    const I = G.LAYOUT.INTERIORS[key];
    const root = new THREE.Group();
    root.name = name || "ph_int_" + key;
    root.visible = false;
    G.scene.add(root);
    PH.interiors.push({ key, root, origin: I.origin });
    return root;
  };

  // -------------------------------------------------------------------
  // Props / items / interactables (safe wrappers; called at initDone+)
  // -------------------------------------------------------------------
  const LOOT_FIX = {
    common: "footlocker",
    raider: "raider_stash",
    ammo: "ammo_box",
    military: "weapon_crate",
  };
  PH.lootId = function (id, fallback) {
    if (!id) return id;
    let has = null;
    try {
      if (!G.isStub("items") && typeof G.items.hasLootTable === "function")
        has = G.items.hasLootTable;
    } catch (e) {
      has = null;
    }
    if (!has) return LOOT_FIX[id] || id;
    if (has(id)) return id;
    if (LOOT_FIX[id] && has(LOOT_FIX[id])) return LOOT_FIX[id];
    if (fallback && has(fallback)) return fallback;
    return undefined;
  };
  PH.spawned = [];
  /** Persistent world prop (spawned at initDone, stable id → props/rpg restore it per game). */
  PH.prop = function (type, opts) {
    opts = Object.assign({}, opts || {});
    if (opts.loot) {
      const l = PH.lootId(opts.loot, opts.lootFallback);
      if (l) opts.loot = l;
      else delete opts.loot;
    }
    delete opts.lootFallback;
    if (opts.persistent === undefined) opts.persistent = true;
    if (!opts.id)
      opts.id =
        "ph:" +
        type +
        "@" +
        (+opts.x || 0).toFixed(1) +
        "," +
        (+opts.y || 0).toFixed(1) +
        "," +
        (+opts.z || 0).toFixed(1);
    const rec = { type, opts, handle: null };
    rec.handle = spawnRaw(type, opts);
    PH.spawned.push(rec);
    return rec.handle;
  };
  function spawnRaw(type, opts) {
    try {
      if (G.isStub("props") || typeof G.props.spawn !== "function") return null;
      return G.props.spawn(type, opts);
    } catch (e) {
      if (!PH._propWarned) {
        PH._propWarned = true;
        console.warn(
          "[poi_harbor] props.spawn failed for " +
            type +
            ": " +
            (e && e.message),
        );
      }
      return null;
    }
  }
  PH.respawnMissing = function () {
    for (const rec of PH.spawned) {
      const h = rec.handle,
        r = h && h.record;
      const gone = h
        ? !!(r && r.removed)
        : !G.isStub("props") && typeof G.props.spawn === "function";
      if (!gone) continue;
      if (h && typeof h.remove === "function") {
        try {
          h.remove();
        } catch (e) {
          /* */
        }
      }
      rec.handle = spawnRaw(rec.type, rec.opts);
    }
  };
  /** Deferred persistent prop at LOCAL coords (current origin captured now, spawned at initDone). */
  PH.propAt = function (type, x, y, z, yaw, opts) {
    const o = Object.assign({}, opts || {}, {
      x: x + PH.ofs.x,
      y: y || 0,
      z: z + PH.ofs.z,
      yaw: yaw || 0,
    });
    PH.onReady.push(() => PH.prop(type, o));
  };
  /** Deferred "Read" interactable at LOCAL coords. */
  PH.readAt = function (x, y, z, title, text) {
    const p = PH.wv(x, y, z);
    PH.onReady.push(() => PH.readable(p, title, text));
  };
  /** "Read" interactable (plaques, chalkboards, graffiti). */
  PH.readable = function (pos, title, text, opts) {
    try {
      return G.world.addInteractable({
        pos,
        radius: (opts && opts.radius) || 0.7,
        label: title,
        verb: "Read",
        range: 2.6,
        onInteract() {
          G.notify(title + " — " + text, { duration: 10 });
          try {
            G.sfx.play("ui_click");
          } catch (e) {
            /* */
          }
        },
      });
    } catch (e) {
      return null;
    }
  };
  /** Session pickup (quest items / notes): tracked so reset can remove them. */
  PH.sessionPickups = [];
  PH.pickup = function (id, n, pos, opts) {
    if (G.isStub("items") || typeof G.items.spawnPickup !== "function")
      return null;
    try {
      const h = G.items.spawnPickup(id, n || 1, pos, opts || {});
      if (h) PH.sessionPickups.push(h);
      return h;
    } catch (e) {
      PH.safe("pickup " + id, () => {
        throw e;
      });
      return null;
    }
  };
  PH.hasItem = (id) => {
    try {
      return !G.isStub("inventory") && G.inventory.count(id) > 0;
    } catch (e) {
      return false;
    }
  };
  PH.give = (id, n, silent) => {
    try {
      if (!G.isStub("inventory"))
        G.inventory.add(id, n || 1, { silent: !!silent });
    } catch (e) {
      /* */
    }
  };
  PH.take = (id, n) => {
    try {
      if (!G.isStub("inventory")) G.inventory.remove(id, n || 1);
    } catch (e) {
      /* */
    }
  };
  /** Scrip (federal ration scrip) and Standing; the rpg API names settle during the rebrand, so resolve at call time. */
  PH.scrip = () => {
    try {
      if (G.isStub("inventory")) return 0;
      const I = G.inventory;
      return I.scrip ? I.scrip() : I.count("scrip");
    } catch (e) {
      return 0;
    }
  };
  PH.addScrip = (n) => {
    try {
      if (G.isStub("inventory")) return;
      const I = G.inventory;
      if (I.addScrip) I.addScrip(n);
      else if (n > 0) I.add("scrip", n);
      else I.remove("scrip", -n);
    } catch (e) {
      /* */
    }
  };
  PH.xp = (n, why) => {
    try {
      if (!G.isStub("rpg")) G.rpg.addXP(n, why);
    } catch (e) {
      /* */
    }
  };
  PH.standing = (n, why) => {
    try {
      if (!G.isStub("rpg") && G.rpg.addStanding) G.rpg.addStanding(n, why);
    } catch (e) {
      /* */
    }
  };
  PH.sfx = (name, opts) => {
    try {
      return G.sfx.play(name, opts);
    } catch (e) {
      return null;
    }
  };
  PH.itemExists = (id) => {
    try {
      return !G.isStub("items") && !!G.items.get(id);
    } catch (e) {
      return false;
    }
  };
  /** First existing item id from candidates. */
