// play-inline-480 05 — pos
// Lines 1652-1984 of readable/play-inline-480.pretty.js (statement-aligned).
  const KIND_MAT = {
    bottle_fizzo_blue: "glowBlue",
    fungus_glow: "glowGreen",
    shade_field: "glowBlue",
    gold_bar: "shiny",
    key: "shiny",
    tag: "shiny",
    medallion: "shiny",
    battery: "shiny",
    bottle_fizzo: "shiny",
    bottle_fizzo_frost: "shiny",
    bottle_fizzo_lime: "shiny",
    bottle_water: "shiny",
    bottle_beer: "shiny",
    bottle_wine: "shiny",
    bottle_vodka: "shiny",
    bottle_empty: "shiny",
    bottle_rootbeer: "shiny",
    helmet_continuity: "shiny",
    wrap_zeppelin: "shiny",
    pouch_astro: "shiny",
    // exo-rigs & metal pieces read as painted steel
    rig_mk1: "shiny",
    rig_mk2: "shiny",
    crate_rig: "shiny",
    helmet_rig_mk2: "shiny",
    helmet_rig: "shiny",
    armor_metal: "shiny",
    lighter: "shiny",
    fork: "shiny",
    token: "shiny",
    rig_mk3: "shiny",
    tape_reel: "shiny",
    rally_tonic: "shiny",
    rally_tonic_extra: "shiny",
    wf_case: "shiny",
  };

  // ---- skill manuals: one builder per cover (48_art COVERS) ----
  // Hardbacks: cloth boards over a page block + gilt spine. Comics / pamphlets / annuals: thin
  // (the cover art carries the creased corner). All one merged mesh per kind.
  (function coverBuilders() {
    const covers = (G.items._art && G.items._art.COVERS) || {};
    const hexToNum = (h) =>
      parseInt(String(h).replace("#", ""), 16) || 0x888888;
    for (const name in covers) {
      const spec = covers[name];
      if (name.indexOf("sb_") !== 0) continue;
      const kind = "manual_" + name.slice(3);
      BUILDERS[kind] = (k) => {
        if (spec.style === "hard") {
          const w = 0.16,
            d = 0.225,
            t = 0.042,
            b = hexToNum(spec.bg);
          k.boxL(
            w - 0.008,
            t - 0.008,
            d - 0.01,
            0xffffff,
            "page_edge",
            "xzZ",
            0.003,
            t / 2,
            0,
          ); // page block
          k.boxL(w, 0.004, d, 0xffffff, name, "y", 0, t - 0.002, 0); // front board (cover art)
          k.box(w, 0.004, d, b, 0, 0.002, 0); // back board
          k.box(0.006, t, d, b, -w / 2 + 0.001, t / 2, 0); // spine
          k.box(
            0.0065,
            0.004,
            d * 0.9,
            hexToNum(spec.fg),
            -w / 2 + 0.0008,
            t * 0.7,
            0,
          ); // gilt spine band
          return k;
        }
        const w = spec.style === "pamphlet" ? 0.15 : 0.18,
          d = spec.style === "pamphlet" ? 0.21 : 0.255,
          t = spec.style === "comic" ? 0.004 : 0.006;
        k.boxL(
          w * 0.985,
          t,
          d * 0.985,
          0xffffff,
          "page_edge",
          "xXzZ",
          0.001,
          t / 2,
          0,
        ); // pages
        k.boxL(w, 0.0014, d, 0xffffff, name, "y", 0, t + 0.0007, 0); // front cover
        k.box(w, 0.0014, d, 0xd8d0c0, 0, 0.0007, 0); // back cover
        return k;
      };
    }
  })();

  const GEO = new Map();
  function kindFor(d) {
    if (!d) return "misc";
    if (d.mesh && BUILDERS[d.mesh]) return d.mesh;
    if (d.type === "ammo") return "ammo";
    if (d.type === "weapon") return "weapon";
    if (d.type === "note") return "note";
    if (d.type === "tape") return "tape_reel";
    if (d.type === "key") return "key";
    if (d.type === "apparel")
      return d.slot === "head" ? "hat_cap" : "cloth_grey";
    // keyword heuristics for items defined by other modules (quest items etc.)
    const s = (d.id + " " + (d.name || "")).toLowerCase();
    if (d.type === "aid") {
      if (/cake|roll|pie/.test(s)) return "sweet_roll";
      if (/jet|syringe|inject/.test(s)) return "injector";
      return d.tags.indexOf("drink") >= 0
        ? "bottle_water"
        : d.tags.indexOf("food") >= 0
          ? "can_beans"
          : "pills_white";
    }
    if (/book|manual|journal|ledger/.test(s)) return "book";
    if (
      /note|letter|card|manifest|flyer|playbill|postcard|map|plaque|sign|memo|orders/.test(
        s,
      )
    )
      return "note";
    if (/reel|tape/.test(s)) return "tape_reel";
    if (/\btag\b|_tag|token|ring|medal|badge/.test(s)) return "tag";
    if (/key/.test(s)) return "key";
    if (/core|cell|battery|isotope|reactor/.test(s)) return "battery";
    if (/amplifier|module|circuit|transmitter|radio|chip/.test(s))
      return "electronics";
    if (/strongbox|box|crate|case|chest/.test(s)) return "lunchbox";
    if (/bottle/.test(s)) return "bottle_empty";
    if (/teddy|bear|doll|toy|mannequin/.test(s)) return "teddy";
    return "misc";
  }
  function geometryFor(kind, d) {
    // meat colour and ammo tint vary per item — cache by item id for those
    const key =
      kind === "meat" || kind === "ammo" || kind === "ball"
        ? kind + ":" + (d ? d.id : "")
        : kind;
    let g = GEO.get(key);
    if (!g) {
      const k = kit();
      try {
        (BUILDERS[kind] || BUILDERS.misc)(k, d);
      } catch (e) {
        G.reportError("rpg:itemMesh:" + kind, e);
      }
      g = k.parts.length ? k.build() : new THREE.BoxGeometry(0.1, 0.1, 0.1);
      GEO.set(key, g);
    }
    return g;
  }

  /** Small procedural world model for an item (weapons via G.weapons.createWorldModel when available). */
  function createItemModel(id) {
    const d = G.items.get(id);
    if (
      d &&
      d.type === "weapon" &&
      !G.isStub("weapons") &&
      G.weapons.createWorldModel
    ) {
      try {
        const m = G.weapons.createWorldModel(id);
        if (m) {
          const holder = new THREE.Group();
          holder.add(m);
          // lay it flat and rest it on the ground
          const box = new THREE.Box3().setFromObject(m);
          const sz = box.getSize(new THREE.Vector3());
          if (sz.y > Math.max(sz.x, sz.z)) {
            m.rotation.x = -Math.PI / 2;
          }
          m.updateMatrixWorld(true);
          const b2 = new THREE.Box3().setFromObject(m);
          m.position.y -= b2.min.y - 0.005;
          m.traverse((o) => {
            o.castShadow = false;
            o.receiveShadow = false;
          });
          return holder;
        }
      } catch (e) {
        /* fall through to generic */
      }
    }
    const kind = kindFor(d);
    const M = mats();
    const mesh = new THREE.Mesh(
      geometryFor(kind, d),
      M[KIND_MAT[kind] || "base"],
    );
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.name = "item:" + id;
    return mesh;
  }

  // ------------------------------------------------------------------
  // Pickups
  // ------------------------------------------------------------------
  let pickups = []; // live pickups
  let staticDefs = []; // static pickup definitions (re-created on reset)
  let takenStatic = new Set(); // keys of static pickups the player took
  let initPhase = true; // true until initDone → pickups spawned are static
  let pickupSeq = 0;
  const CULL = 70;

  function stableKey(id, pos) {
    return (
      "p_" +
      id +
      "_" +
      Math.round(pos.x * 10) +
      "_" +
      Math.round(pos.z * 10) +
      "_" +
      Math.round((pos.y || 0) * 10)
    );
  }

  function groundAt(pos) {
    const W = G.world;
    try {
      return W.groundHeight(
        pos.x,
        pos.z,
        (pos.y !== undefined ? pos.y : 0) + 0.3,
        0.05,
      );
    } catch (e) {
      return pos.y || 0;
    }
  }

  /**
   * Spawn a world pickup. pos {x,y,z} (y optional → ground).
   * opts: {cond, owner, yaw, static, dropped, noSave, keepY}
   */
  function spawnPickup(id, count, pos, opts) {
    if (!id || !pos) return null;
    opts = opts || {};
    count = Math.max(1, Math.floor(count || 1));
    if (!G.scene) return null;
    const isStatic = opts.static !== undefined ? !!opts.static : initPhase;
    const key = isStatic ? stableKey(id, pos) : "d" + ++pickupSeq;
    if (isStatic && !opts._restore) {
      staticDefs.push({
        id,
        count,
        pos: { x: pos.x, y: pos.y, z: pos.z },
        opts: Object.assign({}, opts, { static: true }),
        key,
      });
      if (takenStatic.has(key)) return null;
    }
    const obj = new THREE.Group();
    const model = createItemModel(id);
    // Readability: real-size small loot vanishes against rubble at standing height, so small items are
    // shown ~1.3–1.5× (a common trick for small clutter). Weapons & big items stay 1:1.
    const sc = readableScale(model);
    if (sc !== 1) model.scale.multiplyScalar(sc);
    obj.add(model);
    const y = opts.keepY && pos.y !== undefined ? pos.y : groundAt(pos);
    obj.position.set(pos.x, y, pos.z);
    obj.rotation.y =
      opts.yaw !== undefined
        ? opts.yaw
        : U.hash2(Math.round(pos.x * 13), Math.round(pos.z * 17)) * Math.PI * 2;
    G.scene.add(obj);
    const p = {
      key,
      id,
      count,
      cond: opts.cond,
      owner: opts.owner || null,
      object3d: obj,
      static: isStatic,
      dropped: !!opts.dropped,
      noSave: !!opts.noSave,
      pos: obj.position,
    };
    const d = G.items.get(id);
    const labelPos = new THREE.Vector3(pos.x, y + 0.12, pos.z);
    p.interactable = G.world.addInteractable({
      getPos: () => labelPos,
      radius: 0.45,
      priority: 0.5,
      range: 2.8,
      label: () => G.items.displayName(id, p.count),
      verb: () => (isOwnedByOther(p.owner) ? "Steal" : "Take"),
      stealing: () => isOwnedByOther(p.owner),
      itemId: id,
      _rpgPickup: p,
      onInteract: () => takePickup(p),
    });
    p.labelPos = labelPos;
    pickups.push(p);
    return p;
  }

  const _box = new THREE.Box3(),
    _sz = new THREE.Vector3();
  function readableScale(model) {
    try {
      if (model.isMesh && model.geometry) {
        if (!model.geometry.boundingBox) model.geometry.computeBoundingBox();
        _box.copy(model.geometry.boundingBox);
      } else _box.setFromObject(model);
      _box.getSize(_sz);
      const m = Math.max(_sz.x, _sz.y, _sz.z);
      if (!(m > 0)) return 1;
      if (m < 0.1) return 1.5;
      if (m < 0.2) return 1.4;
      if (m < 0.32) return 1.25;
      return 1;
    } catch (e) {
      return 1;
    }
  }

  // ------------------------------------------------------------------
  // Focus highlight (soft glow on the item under the crosshair)
  // ------------------------------------------------------------------
  const HL = new Map(); // source material uuid -> highlighted twin (shared)
