// play-inline-505 02 — def
// Lines 362-704 of readable/play-inline-505.pretty.js (statement-aligned).
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
