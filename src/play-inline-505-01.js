// play-inline-505 01 — inst
// Lines 14-361 of readable/play-inline-505.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const W = G.weapons;
  const P = W._;
  const S = P.state;
  const V = () => P.view;

  // ------------------------------------------------------------------
  // Model cache
  // ------------------------------------------------------------------
  P.MODELS = P.MODELS || {};
  const viewCache = new Map();
  const worldCache = new Map();
  // key = kind|skin|mods (mods: installed weapon-mod kinds, attached to the view model by 42_mods.js)
  function modelKey(def) {
    const w = def.weapon;
    return (
      w.viewmodel +
      "|" +
      (w.skin || "") +
      (def.mods && def.mods.length ? "|" + def.mods.join(",") : "")
    );
  }
  P.modelKey = modelKey;
  function finalizeModel(inst, kind, world) {
    inst.kind = kind;
    inst.parts = inst.parts || {};
    inst.sockets = inst.sockets || {};
    inst.cfg = inst.cfg || {};
    if (P.TUNE && P.TUNE[kind]) Object.assign(inst.cfg, P.TUNE[kind]);
    for (const k in inst.parts) {
      const part = inst.parts[k];
      if (!part.userData.rest)
        part.userData.rest = {
          p: part.position.clone(),
          q: part.quaternion.clone(),
        };
    }
    inst.root.traverse((o) => {
      if (o.isMesh) {
        o.frustumCulled = false;
        o.castShadow = false;
        o.receiveShadow = false;
      }
    });
    if (!world)
      consolidateStatic(inst.root, new Set(Object.values(inst.parts)));
    return inst;
  }
  /**
   * View draw-call trim: models are assembled from several Builder outputs added straight to the
   * root (receiver, stock, furniture...). Meshes in those static root-level build groups that share
   * a material are merged into one (animated parts, sockets and nested groups are left alone).
   */
  const _cm = new THREE.Matrix4();
  function mergeIndexed(geos) {
    const names = Object.keys(geos[0].attributes).filter((k) =>
      geos.every((g) => g.attributes[k]),
    );
    let vCount = 0,
      iCount = 0;
    for (const g of geos) {
      vCount += g.attributes.position.count;
      iCount += g.index ? g.index.count : g.attributes.position.count;
    }
    const out = new THREE.BufferGeometry();
    for (const k of names) {
      const sz = geos[0].attributes[k].itemSize,
        arr = new Float32Array(vCount * sz);
      let o = 0;
      for (const g of geos) {
        const a = g.attributes[k];
        for (let i = 0; i < a.count; i++)
          for (let c = 0; c < sz; c++)
            arr[(o + i) * sz + c] = a.getComponent(i, c);
        o += a.count;
      }
      out.setAttribute(k, new THREE.BufferAttribute(arr, sz));
    }
    const idx =
      vCount > 65535 ? new Uint32Array(iCount) : new Uint16Array(iCount);
    let io = 0,
      vo = 0;
    for (const g of geos) {
      const n = g.attributes.position.count;
      if (g.index)
        for (let i = 0; i < g.index.count; i++)
          idx[io++] = g.index.getX(i) + vo;
      else for (let i = 0; i < n; i++) idx[io++] = i + vo;
      vo += n;
    }
    out.setIndex(new THREE.BufferAttribute(idx, 1));
    return out;
  }
  function consolidateStatic(root, parts) {
    const byMat = new Map();
    for (const grp of root.children) {
      if (!grp.isGroup || grp.name || parts.has(grp)) continue; // Builder outputs are anonymous, never animated parts
      for (const m of grp.children)
        if (m.isMesh && !m.isSkinnedMesh && !m.children.length && m.visible) {
          const k = m.material.uuid;
          if (!byMat.has(k)) byMat.set(k, []);
          byMat.get(k).push(m);
        }
    }
    try {
      root.updateMatrix();
      root.updateMatrixWorld(true);
      for (const list of byMat.values()) {
        if (list.length < 2) continue;
        const keep = list[0],
          geos = [];
        const invKeep = new THREE.Matrix4()
          .copy(keep.parent.matrix)
          .multiply(keep.matrix)
          .invert();
        for (const m of list) {
          _cm.copy(m.parent.matrix).multiply(m.matrix).premultiply(invKeep);
          const g = m.geometry.clone();
          g.applyMatrix4(_cm);
          geos.push(g);
        }
        const merged = mergeIndexed(geos);
        geos.forEach((g) => g.dispose());
        list.forEach((m) => {
          m.geometry.dispose();
          if (m !== keep) m.parent.remove(m);
        });
        keep.geometry = merged;
      }
    } catch (e) {
      G.reportError("weapons:consolidate", e);
    }
  }
  P.buildModel = function (kind, skin, world) {
    const fn = P.MODELS[kind] || P.MODELS.pistol_10mm;
    if (!fn) return null;
    P.buildingWorld = !!world;
    let inst = null;
    try {
      inst = fn(skin || "", !!world);
    } catch (e) {
      G.reportError("weapons:model " + kind, e);
      inst = null;
    }
    P.buildingWorld = false;
    if (!inst) return null;
    return finalizeModel(inst, kind, !!world);
  };
  P.getViewModel = function (key) {
    if (viewCache.has(key)) return viewCache.get(key);
    const parts = key.split("|");
    const kind = parts[0],
      skin = (parts[1] || "").split("#")[0];
    const mods = (parts[2] || "").split("#")[0];
    const inst = P.buildModel(kind, skin, false);
    if (inst && mods && P.attachMods) {
      try {
        P.attachMods(inst, mods.split(","), kind);
      } catch (e) {
        G.reportError("weapons:attachMods", e);
      }
    }
    viewCache.set(key, inst);
    return inst;
  };
  /** Small item for the throwing hand (grenade etc.), view materials. */
  P.buildViewItem = function (id) {
    const def = P.defs.get(id);
    if (!def) return null;
    const inst = P.getViewModel(modelKey(def) + "#item");
    return inst ? inst.root : null;
  };

  // pending swap after lowering (called from the view update)
  P.swapToPending = function () {
    const v = V();
    const key = v.pendingKind;
    v.pendingKind = null;
    const base = key.split("#")[0];
    const inst = P.getViewModel(base);
    v.setModel(inst);
    v.spin = 0;
    v.cylTarget = 0;
    v.cylAngle = 0;
    if (!S.holstered && inst) {
      G.sfx.play("weapon_draw", { volume: 0.6 });
      P.armAutoReload(0.3);
    }
  };

  // ------------------------------------------------------------------
  // Defs
  // ------------------------------------------------------------------
  W.getDef = function (id) {
    if (!id || id === "unarmed") return P.UNARMED;
    let d = P.defs.get(id);
    if (!d && !G.isStub("items") && G.items.get) {
      const it = G.items.get(id);
      if (it && it.weapon) d = it;
    }
    return d || null;
  };
  W.unarmedDef = () => P.UNARMED;
  W.list = () => Array.from(P.defs.values()).filter((d) => d.type === "weapon");
  W.ammoList = () =>
    Array.from(P.defs.values()).filter((d) => d.type === "ammo");
  W.defs = () => Array.from(P.defs.values());

  // ------------------------------------------------------------------
  // Equip / holster
  // ------------------------------------------------------------------
  let inEquip = false;
  W.equip = function (id, opts) {
    opts = opts || {};
    if (id === "unarmed") id = null;
    const def0 = id ? W.getDef(id) : P.UNARMED;
    if (!def0 || !def0.weapon) return false;
    // installed weapon mods produce a per-player derived def: bigger mag, scope, silencer...
    const def = id && P.moddedDef ? P.moddedDef(def0) : def0;
    const wid = id || "unarmed";
    const same = S.cur && S.cur.id === wid && !opts.refresh;
    if (!same) {
      P.cancelAction();
      P.stopLoops();
      // store previous
      if (S.cur) S.mags[S.cur.id] = S.cur.mag;
      const w = def.weapon;
      let mag = S.mags[wid];
      if (mag === undefined) {
        // weapons come loaded if you have the ammo (quietly)
        if (w.magSize > 0 && w.ammo && w.reloadType !== "throw") {
          const want = Math.min(w.magSize, P.reserve(def));
          mag = P.invReal()
            ? P.takeAmmo(w.ammo, want)
            : Math.min(w.magSize, want);
        } else mag = w.magSize > 0 ? 1 : 0;
      }
      if (w.reloadType === "throw") mag = 1;
      // equipped empty only because the ammo hasn't arrived yet (story gives gun, then rounds):
      // the first rounds that do arrive load it quietly instead of playing a reload on first draw
      S._freshEmpty =
        S.mags[wid] === undefined &&
        mag === 0 &&
        w.magSize > 0 &&
        w.ammo &&
        w.reloadType !== "throw"
          ? wid
          : null;
      S.cur = { id: wid, def, mag };
      S.mags[wid] = mag;
      S.bloom = 0;
      S.rofT = 0.15;
      S.autoReloadT = -1;
      if (w.reloadType === "throw") S.lastThrown = wid;
      const v = V();
      v.ads = false;
      v.blocking = false;
      if (S.lastFov) {
        G.player.setFov(G.player.fovBase);
        S.lastFov = null;
      }
      if (v.built) {
        v.pendingKind = modelKey(def);
        if (!v.model) {
          v.lowerT = 1;
          P.swapToPending();
        }
      }
      G.events.emit("weaponEquipped", wid);
      G.events.emit("ammoChanged", W.current());
    }
    if (!opts.keepHolster) S.holstered = false;
    // keep the inventory's equip slot in sync (guard against ping-pong)
    if (
      !inEquip &&
      !opts.fromInventory &&
      !G.isStub("inventory") &&
      G.inventory.equip
    ) {
      inEquip = true;
      try {
        if (id) {
          if (!G.inventory.isEquipped || !G.inventory.isEquipped(id)) {
            if (G.inventory.has ? G.inventory.has(id) : true)
              G.inventory.equip(id);
          }
        } else if (G.inventory.unequip && !opts.noUnequip && S._prevInvWeapon)
          G.inventory.unequip("weapon");
      } catch (e) {
        G.reportError("weapons:inventory.equip", e);
      }
      inEquip = false;
    }
    S._prevInvWeapon = id;
    return true;
  };
  W.current = function () {
    const c = S.cur;
    if (!c) return null;
    const w = c.def.weapon;
    return {
      id: c.id,
      def: c.def,
      weapon: w,
      name: c.def.name,
      ammoInMag: c.mag,
      ammoId: w.ammo,
      reserve: w.ammo
        ? P.invReal()
          ? G.inventory.count(w.ammo) || 0
          : 999
        : 0,
      condition: P.getCond(c.id),
      holstered: S.holstered,
      jammed: !!(P.action && P.action.name === "jam"),
      magSize: w.magSize,
    };
  };
  W.holster = function (b) {
    b = b === undefined ? true : !!b;
    if (b === S.holstered) return;
    S.holstered = b;
    P.cancelAction();
    P.stopLoops();
    V().ads = false;
    if (S.lastFov) {
      G.player.setFov(G.player.fovBase);
      S.lastFov = null;
    }
    if (!b) {
      G.sfx.play("weapon_draw", { volume: 0.6 });
      P.armAutoReload(0.35);
    } else if (P.hasSfx("weapon_holster"))
      P.snd("weapon_holster", null, { volume: 0.55 });
    G.events.emit("weaponHolstered", b);
  };
  W.isHolstered = () => S.holstered;
  W.ammoInMag = () => (S.cur ? S.cur.mag : 0);
  W.reload = () => P.reload();
  W.spread = () => P.currentSpread();
  W.isAiming = () => !!V().ads && V().adsT > 0.5;
  W.isScoped = () => !!V().scoped && V().adsT > 0.85;
  /** Scoped hold-breath state {breath 0..1, holding, winded} (HUD may draw a breath meter). */
  W.breath = () => P.breathState();
  W.isBlocking = () => !!V().blocking && V().blockT > 0.5;
  W.isReloading = () => !!P.action && P.action.name === "reload";
