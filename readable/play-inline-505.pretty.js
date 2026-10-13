/* src/weapons/90_api.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: public API (G.weapons) & module
 *
 * G.weapons.equip(id|null), current(), holster(bool), isHolstered(),
 * getDef(id), createWorldModel(id), ammoInMag(), reload(), setFavorite(slot,id),
 * favorites(), useFavorite(slot), unarmedDef(),
 * plus: list(), ammoList(), spread(), isAiming(), isBlocking(), isReloading(),
 * createAmmoModel(ammoId), throwGrenade(id?).
 * Events: weaponFired(def), weaponEquipped(id), ammoChanged(cur), reloaded(id),
 *         weaponJammed(id), grenadeThrown(id).
 * ===================================================================== */
(function () {
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
  W.throwGrenade = (id) => {
    const g = id || P.bestThrowable();
    return g ? P.startThrow(g, true, null) : false;
  };
  W.condition = (id) => P.getCond(id || (S.cur && S.cur.id));
  W.setCondition = (id, v) => P.setCond(id, v);
  W.repair = (id, amount) => P.setCond(id, P.getCond(id) + (amount || 0.25));
  /**
   * Field repair: cannibalise a donor weapon of the same kind to fix `id`.
   * Gain scales with the donor's condition and the Mechanics skill, which also
   * limits the maximum condition you can reach (60% at 0 skill → 100% at 100).
   * Consumes one donor from the inventory. Returns {ok, condition, gain} or {ok:false, reason}.
   */
  W.repairWith = function (id, donorId) {
    donorId = donorId || id;
    const def = W.getDef(id),
      dd = W.getDef(donorId);
    if (!def || !dd || id === "unarmed" || def.weapon.reloadType === "throw")
      return { ok: false, reason: "Cannot be repaired." };
    if (!W.canRepairWith(id, donorId))
      return { ok: false, reason: "Incompatible parts." };
    const inv = P.invReal();
    if (inv && (G.inventory.count(id) || 0) < (donorId === id ? 2 : 1))
      return { ok: false, reason: "You need another " + def.name + "." };
    if (inv && donorId !== id && !((G.inventory.count(donorId) || 0) >= 1))
      return { ok: false, reason: "No donor weapon." };
    const skill =
      !G.isStub("rpg") && G.rpg && typeof G.rpg.skill === "function"
        ? G.util.clamp(G.rpg.skill("mechanics") || 0, 0, 100)
        : 30;
    const cap = Math.min(1, 0.6 + (skill / 100) * 0.4);
    const cur = P.getCond(id);
    if (cur >= cap - 0.001)
      return {
        ok: false,
        reason: "Your Mechanics skill is too low to improve it further.",
      };
    const donorCond = donorId === id ? cur : P.getCond(donorId);
    const gain = Math.max(0.05, donorCond * (0.25 + (0.6 * skill) / 100));
    const next = Math.min(cap, cur + gain);
    // consume the donor (its loaded rounds, if any, are refunded by the inventoryChanged handler)
    if (inv) {
      try {
        G.inventory.remove(donorId, 1, { silent: true });
      } catch (e) {
        G.reportError("weapons:repairWith", e);
        return { ok: false, reason: "error" };
      }
    }
    P.setCond(id, next);
    G.sfx.play("reload", { volume: 0.5, pitch: 0.75 });
    G.events.emit("weaponRepaired", id, next);
    if (S.cur && S.cur.id === id) G.events.emit("ammoChanged", W.current());
    return { ok: true, condition: next, gain: next - cur };
  };
  /** Donor compatibility: same item, or the same weapon family (viewmodel kind), like a "similar item" field repair. */
  W.canRepairWith = function (id, donorId) {
    const a = W.getDef(id),
      b = W.getDef(donorId);
    if (!a || !b || !a.weapon || !b.weapon) return false;
    if (id === donorId) return true;
    return a.weapon.viewmodel === b.weapon.viewmodel && !b.unique;
  };

  // ------------------------------------------------------------------
  // Favorites (slots 1..8)
  // ------------------------------------------------------------------
  W.setFavorite = function (slot, itemId) {
    // slots are 1..8 (contract); 0 or anything else is rejected rather than silently mapped
    const i = (slot | 0) - 1;
    if (!(slot >= 1 && slot <= 8) || i !== slot - 1) return false;
    // one slot per item
    if (itemId)
      for (let j = 0; j < 8; j++)
        if (S.favorites[j] === itemId) S.favorites[j] = null;
    S.favorites[i] = itemId || null;
    G.events.emit("favoritesChanged", S.favorites.slice());
    return true;
  };
  W.favorites = () => S.favorites.slice();
  W.useFavorite = function (slot) {
    const id = S.favorites[(slot | 0) - 1];
    if (!id) return false;
    const def = W.getDef(id);
    if (P.invReal() && !(G.inventory.count(id) > 0)) {
      G.notify("You don't have that anymore.");
      return false;
    }
    if (def && def.weapon) {
      if (!S.cur || S.cur.id !== id) W.equip(id);
      else if (S.holstered) W.holster(false);
      return true;
    }
    if (!G.isStub("inventory") && G.inventory.use) {
      G.inventory.use(id);
      return true;
    }
    return false;
  };
  function autoFavorite(id) {
    const def = P.defs.get(id);
    if (!def || def.type !== "weapon") return;
    if (S.favorites.indexOf(id) >= 0) return;
    const i = S.favorites.indexOf(null);
    if (i < 0) return;
    S.favorites[i] = id;
    G.events.emit("favoritesChanged", S.favorites.slice());
  }

  // ------------------------------------------------------------------
  // World models (NPC hands, pickups, projectiles)
  // ------------------------------------------------------------------
  /**
   * Returns a new Object3D for the weapon/ammo item: metres, origin at the
   * grip (where a right hand holds it), barrel along -Z, up +Y.
   * userData: {weaponId, muzzle: Vector3 (local), twoHanded, kind}
   */
  W.createWorldModel = function (id) {
    let def = W.getDef(id);
    if (!def) def = P.defs.get(id);
    if (!def) return null;
    if (def.type === "ammo") return W.createAmmoModel(id);
    const key = modelKey(def);
    let proto = worldCache.get(key);
    if (!proto) {
      const inst = P.buildModel(def.weapon.viewmodel, def.weapon.skin, true);
      if (!inst) return null;
      // bake to ≤3 meshes + distance LOD (see 85_world.js); only long guns cast shadows
      const w = def.weapon;
      const small =
        w.reloadType === "throw" || (!w.twoHanded && w.reloadType !== "melee");
      proto = P.bakeWorld
        ? P.bakeWorld(inst.root, {
            castShadow: !!w.twoHanded,
            far: small ? P.WORLD_LOD.farSmall : P.WORLD_LOD.far,
          })
        : inst.root;
      proto.userData.muzzle = inst.sockets.muzzle
        ? inst.sockets.muzzle.getWorldPosition(new THREE.Vector3())
        : new THREE.Vector3(0, 0.05, -0.3);
      proto.userData.kind = inst.kind;
      proto.traverse((o) => {
        if (o.isMesh) o.frustumCulled = true;
      });
      worldCache.set(key, proto);
    }
    const obj = proto.clone(true);
    obj.userData = {
      weaponId: id,
      muzzle: proto.userData.muzzle.clone(),
      twoHanded: !!def.weapon.twoHanded,
      kind: proto.userData.kind,
      itemId: id,
    };
    obj.name = "weapon_" + id;
    return obj;
  };
  /** Small ammo pickup model (box / can / battery / missile / recoilless round). */
  W.createAmmoModel = function (ammoId) {
    const key = "ammo|" + ammoId;
    let proto = worldCache.get(key);
    if (!proto) {
      proto = P.MODELS._ammo ? P.MODELS._ammo(ammoId) : null;
      if (!proto) {
        proto = new THREE.Mesh(
          P.paintGeo(new THREE.BoxGeometry(0.12, 0.06, 0.08)),
          P.mat("tan", true),
        );
      } else if (P.bakeWorld)
        proto = P.bakeWorld(proto, {
          castShadow: false,
          far: P.WORLD_LOD.farSmall,
        });
      proto.traverse((o) => {
        if (o.isMesh) o.castShadow = false;
      });
      worldCache.set(key, proto);
    }
    const obj = proto.clone(true);
    obj.userData = { itemId: ammoId };
    return obj;
  };

  // ------------------------------------------------------------------
  // Save / load & events
  // ------------------------------------------------------------------
  G.save.register("weapons", {
    save: () => ({
      cur: S.cur ? S.cur.id : null,
      holstered: S.holstered,
      mags: Object.assign({}, S.mags),
      cond: Object.assign({}, S.cond),
      favs: S.favorites.slice(),
      lastThrown: S.lastThrown,
      skin: S.skinTone || null,
    }),
    load: (d) => {
      S.mags = d.mags || {};
      S.cond = d.cond || {};
      S.favorites = (d.favs || [])
        .concat([null, null, null, null, null, null, null, null])
        .slice(0, 8);
      S.lastThrown = d.lastThrown || "frag_grenade";
      S._loadCur = d.cur;
      S._loadHolster = !!d.holstered;
      if (d.skin) applySkinTone(d.skin);
    },
  });

  // ------------------------------------------------------------------
  // Player skin tone for the first-person hands (view material only)
  // ------------------------------------------------------------------
  function resolveTone(t) {
    if (t === undefined || t === null || t === "") return null;
    if (typeof t === "number") return t;
    if (typeof t === "string") {
      if (/^#?[0-9a-f]{6}$/i.test(t)) return parseInt(t.replace("#", ""), 16);
      const tables = [
        G.chars && G.chars.SKIN,
        G.chars && G.chars._ && G.chars._.SKIN,
        G.chars && G.chars.L && G.chars.L.SKIN,
      ];
      for (const tb of tables) if (tb && tb[t] !== undefined) return tb[t];
      const named = {
        pale: 0xf1d0b8,
        fair: 0xe6b894,
        light: 0xe0b08a,
        medium: 0xc68e62,
        tan: 0xb57c52,
        olive: 0xa87850,
        brown: 0x8a5a3a,
        dark: 0x6a4028,
        deep: 0x4e2e1c,
      };
      return named[t] !== undefined ? named[t] : null;
    }
    return null;
  }
  function applySkinTone(t) {
    const hex = resolveTone(t);
    if (hex === null) return;
    S.skinTone = t;
    // the material colour multiplies the (light) skin texture: lift it slightly so darker tones don't go muddy
    const c = new THREE.Color(hex);
    try {
      P.arms.setSkinTone(c.getHex());
    } catch (e) {
      /* arms not built yet */
    }
  }
  W.setSkinTone = applySkinTone;
  // ui_interact announces the chosen look (new game + save load)
  G.events.on("playerAppearance", (a) => {
    try {
      if (a && a.skinTone !== undefined) applySkinTone(a.skinTone);
    } catch (e) {
      /* ignore */
    }
  });
  function readPlayerTone(opts) {
    opts = opts || {};
    let t = opts.skinTone !== undefined ? opts.skinTone : opts.skin;
    if (t === undefined && opts.appearance) t = opts.appearance.skinTone; // chargen passes {appearance:{skinTone,...}}
    if (t === undefined && G.player && G.player.appearance)
      t = G.player.appearance.skinTone;
    if (t === undefined && G.player)
      t =
        G.player.skinTone !== undefined
          ? G.player.skinTone
          : G.player.look && G.player.look.skinTone;
    if (
      t === undefined &&
      !G.isStub("chars") &&
      G.chars &&
      G.chars.playerLook
    ) {
      try {
        const L =
          typeof G.chars.playerLook === "function"
            ? G.chars.playerLook()
            : G.chars.playerLook;
        t = L && (L.skinTone || L.skin);
      } catch (e) {
        /* ignore */
      }
    }
    return t;
  }

  // ------------------------------------------------------------------
  // Loaded magazines follow the weapon: when a weapon leaves the inventory
  // (sold, dropped, stored in a container, cannibalised) its loaded rounds go
  // back into the inventory as loose ammo instead of vanishing with it.
  // ------------------------------------------------------------------
  let refunding = false;
  function refundMags() {
    if (refunding || !P.invReal()) return;
    refunding = true;
    try {
      for (const id of Object.keys(S.mags)) {
        if (id === "unarmed" || (S.cur && S.cur.id === id)) continue;
        const def = P.defs.get(id);
        if (!def || !def.weapon || def.weapon.reloadType === "throw") {
          if (!def) delete S.mags[id];
          continue;
        }
        if ((G.inventory.count(id) || 0) > 0) continue;
        const n = S.mags[id] | 0;
        delete S.mags[id];
        if (n > 0 && def.weapon.ammo) {
          try {
            G.inventory.add(def.weapon.ammo, n, { silent: true });
          } catch (e) {
            G.reportError("weapons:refund", e);
          }
        }
      }
    } finally {
      refunding = false;
    }
  }
  P.refundMags = refundMags;
  function resetState() {
    P.cancelAction();
    P.stopLoops();
    P.clearProjectiles();
    S.skinTone = null;
    S.mags = {};
    S.cond = {};
    S.favorites = [null, null, null, null, null, null, null, null];
    S.cur = null;
    S.holstered = false;
    S.bloom = 0;
    S.autoReloadT = -1;
    S._prevInvWeapon = null;
    if (S.lastFov) {
      G.player.setFov(G.player.fovBase);
      S.lastFov = null;
    }
  }
  G.events.on("reset", () => {
    resetState();
  });
  G.events.on("newGame", (opts) => {
    applySkinTone(readPlayerTone(opts));
    if (!S.cur) W.equip(null, { fromInventory: true });
    // debug: ?wpn=<id> equips a weapon (and gives ammo when the inventory exists)
    const dbg = G.QS && G.QS.get("wpn");
    if (dbg && P.defs.get(dbg)) {
      const d = P.defs.get(dbg);
      if (P.invReal()) {
        try {
          G.inventory.add(dbg, d.weapon.reloadType === "throw" ? 5 : 1, {
            silent: true,
          });
          if (d.weapon.ammo && d.weapon.ammo !== dbg)
            G.inventory.add(d.weapon.ammo, 200, { silent: true });
        } catch (e) {
          /* ignore */
        }
      }
      W.equip(dbg);
    }
  });
  G.events.on("loaded", () => {
    const id = S._loadCur;
    S._loadCur = undefined;
    const ok =
      id && id !== "unarmed" && (!P.invReal() || G.inventory.count(id) > 0);
    S.cur = null;
    W.equip(ok ? id : null, { fromInventory: true });
    S.holstered = !!S._loadHolster;
  });
  G.events.on("itemAdded", (id) => {
    const def = P.defs.get(id);
    if (!def || def.type !== "weapon") return;
    autoFavorite(id);
    // first real weapon: draw it (players always want the gun they just got). Deferred to the
    // next frame in play: gifts usually hand over the gun and THEN its rounds in the same tick, and
    // drawing in between would pull an empty gun and play a reload as the very first animation.
    if (def.weapon.reloadType !== "throw" && (!S.cur || S.cur.id === "unarmed"))
      S._pendingDraw = id;
  });
  // ammo arriving for a gun that was drawn empty (see S._freshEmpty): load it silently
  G.events.on("itemAdded", (id) => {
    const c = S.cur;
    if (!c || S._freshEmpty !== c.id || c.mag > 0) return;
    const w = c.def.weapon;
    if (w.ammo !== id || (P.action && P.action.name === "reload")) return;
    const got = P.takeAmmo(w.ammo, Math.min(w.magSize, P.reserve(c.def)));
    if (got > 0) {
      c.mag = got;
      S.mags[c.id] = got;
      S.autoReloadT = -1;
      S._freshEmpty = null;
      G.events.emit("ammoChanged", W.current());
    }
  });
  G.events.on("reloaded", () => {
    S._freshEmpty = null;
  });
  G.events.on("weaponFired", () => {
    S._freshEmpty = null;
  });
  // (a pending draw is performed by the module update on the first frame back in 'play')
  G.events.on("reset", () => {
    S._pendingDraw = null;
  });
  G.events.on("inventoryChanged", () => {
    if (refunding || !P.invReal()) return;
    const c = S.cur;
    if (
      c &&
      c.id !== "unarmed" &&
      !(P.action && P.action.name === "throw") &&
      !(G.inventory.count(c.id) > 0)
    ) {
      // the equipped weapon left the inventory: unload it first, then fall back to fists
      const n = c.mag | 0,
        def = c.def;
      c.mag = 0;
      S.mags[c.id] = 0;
      W.equip(null, { noUnequip: true });
      delete S.mags[def.id];
      if (n > 0 && def.weapon.ammo && def.weapon.reloadType !== "throw") {
        refunding = true;
        try {
          G.inventory.add(def.weapon.ammo, n, { silent: true });
        } catch (e) {
          G.reportError("weapons:refund", e);
        } finally {
          refunding = false;
        }
      }
    }
    refundMags();
  });
  G.events.on("equipChanged", (slot, id) => {
    if (inEquip) return;
    const isWeaponSlot =
      slot === "weapon" ||
      (id && P.defs.get(id) && P.defs.get(id).type === "weapon");
    if (!isWeaponSlot) return;
    if (!id && P.action && P.action.name === "throw") return; // last grenade thrown: the throw's onEnd handles it
    if (id && P.defs.get(id)) {
      if (!S.cur || S.cur.id !== id) W.equip(id, { fromInventory: true });
    } else if (!id && S.cur && S.cur.id !== "unarmed")
      W.equip(null, { fromInventory: true });
  });
  G.events.on("land", (vy) => {
    V().landImpulse && V().landImpulse(vy);
  });
  G.events.on("sneak", () => {
    V().springs && (V().springs.land.v -= 0.12);
  });
  G.events.on("playerDied", () => {
    P.cancelAction();
    P.stopLoops();
  });
  G.events.on("state", (s) => {
    if (s !== "play") {
      P.stopLoops();
      const v = V();
      v.ads = false;
      v.blocking = false;
      v.triggerHeld = false;
      if (S.lastFov) {
        G.player.setFov(G.player.fovBase);
        S.lastFov = null;
      }
      if (P.action && P.action.name === "melee") P.cancelAction();
    }
  });

  // ------------------------------------------------------------------
  // Module
  // ------------------------------------------------------------------
  G.registerModule({
    name: "weapons",
    order: 45,
    init() {
      P.defineAll();
      V().build();
      // start with fists so the rig exists even before newGame
      if (!S.cur) W.equip(null, { fromInventory: true });
    },
    update(dt, realDt) {
      if (S._pendingDraw && G.state === "play") {
        const id = S._pendingDraw;
        S._pendingDraw = null;
        try {
          if (
            (!S.cur || S.cur.id === "unarmed") &&
            (!P.invReal() || G.inventory.count(id) > 0)
          )
            W.equip(id);
        } catch (e) {
          G.reportError("weapons:pendingDraw", e);
        }
      }
      P.logic(dt, realDt);
      P.updateProjectiles(dt);
      if (P.craftUpdate) P.craftUpdate(dt, realDt);
      V().update(dt, realDt);
    },
  });
  G.events.on("initDone", () => {
    P.defineAll();
    P.healSounds();
  });
})();
