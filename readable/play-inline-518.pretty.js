/* src/ambient_life/00_core.js */
/* =====================================================================
 * NEW RAD CITY — AMBIENT LIFE — 00: core toolkit
 * Owned by: ambient_life (order 55).  Namespace: G.ambient (public),
 * G.ambient._ (private toolkit shared by the files in this directory).
 *
 * The "living city" layer: bird flocks & vermin, trade convoys with pack
 * oxen travelling between settlements, Rotorcraft flyovers, distant
 * firefights, a random street-encounter director (incl. standing-based
 * hit squads) and night / weather schedules for settlement NPCs.
 *
 * This file: shared helpers (time, standing, placement, visibility, safe
 * wrappers around other modules), a tiny WebAudio synth for the few
 * sounds the sound module doesn't have (rotor wash, ox bellow, wing
 * flutter, the Stranger's sting), and the per-system registry the
 * module file (90_module.js) drives.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;

  const A = (G.ambient = { __module: "ambient_life" });
  const K = (A._ = {});

  // ------------------------------------------------------------------
  // Tunables & hard performance limits
  // ------------------------------------------------------------------
  K.CFG = {
    BIRDS_MAX: 48, // instanced birds (3 draw calls total)
    RATS_MAX: 8, // instanced rats (1 draw call)
    CONVOY_LIVE_MAX: 2, // trade convoys materialised as actors at once
    CONVOY_SPAWN_R: 165, // materialise inside this radius (combat attaches actors < ~190 m)
    CONVOY_DESPAWN_R: 235, // dematerialise beyond this
    ENCOUNTER_DESPAWN_R: 260,
    FIREFIGHT_MAX_EVENTS: 64, // pooled scheduled shots/booms
    NIGHT_START: 22,
    NIGHT_END: 6,
  };

  // ------------------------------------------------------------------
  // Small utilities
  // ------------------------------------------------------------------
  K.now = () => (G.time ? G.time.elapsed : 0);
  /** Absolute game hours since day 1, 00:00. */
  K.gameHours = () =>
    G.time ? (Math.max(1, G.time.day || 1) - 1) * 24 + (G.time.hour || 0) : 0;
  K.day = () => (G.time ? G.time.day || 1 : 1);
  K.hour = () => (G.time ? G.time.hour || 0 : 12);
  K.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  K.lerp = (a, b, t) => a + (b - a) * t;
  K.rand = (a, b) => a + Math.random() * (b - a);
  K.randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  K.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  K.chance = (p) => Math.random() < p;
  K.weighted = function (pairs) {
    // [[item, w], ...]
    let tot = 0;
    for (const p of pairs) tot += Math.max(0, p[1]);
    if (tot <= 0) return null;
    let r = Math.random() * tot;
    for (const p of pairs) {
      r -= Math.max(0, p[1]);
      if (r <= 0) return p[0];
    }
    return pairs[pairs.length - 1][0];
  };
  K.wrap = (a) => {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  };
  /** Yaw (player convention: 0 = -Z) that looks from (x0,z0) toward (x1,z1). */
  K.yawTo = (x0, z0, x1, z1) => Math.atan2(-(x1 - x0), -(z1 - z0));
  K.dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
  K.v3 = () => new THREE.Vector3();

  K.P = () => G.player;
  K.playerOk = () => !!(G.player && G.player.pos && G.player.alive !== false);
  K.isInterior = (x) => !!(G.LAYOUT && G.LAYOUT.isInterior(x));
  K.playerOutdoors = () => K.playerOk() && !K.isInterior(G.player.pos.x);

  K.weather = function () {
    try {
      if (!G.isStub("atmos") && typeof G.atmos.getWeather === "function")
        return G.atmos.getWeather() || "clear";
    } catch (e) {
      /* ignore */
    }
    return "clear";
  };
  K.isStormy = () => {
    const w = K.weather();
    return w === "thunderstorm" || w === "dust";
  };
  K.isRainy = () => {
    const w = K.weather();
    return w === "rain" || w === "thunderstorm";
  };
  /** Dark outside (lighting-based when atmosphere is present). */
  K.isDark = function () {
    try {
      if (!G.isStub("atmos") && typeof G.atmos.isNight === "function")
        return !!G.atmos.isNight();
    } catch (e) {
      /* ignore */
    }
    const h = K.hour();
    return h < 5.5 || h > 20.5;
  };
  /** Settlement "bed time" (settlers sleep), with a per-actor jitter in hours. */
  K.isBedTime = function (jitter) {
    const h = (K.hour() + (jitter || 0) + 24) % 24;
    return h >= K.CFG.NIGHT_START || h < K.CFG.NIGHT_END;
  };

  // ------------------------------------------------------------------
  // Shared ids owned by other modules
  // ------------------------------------------------------------------
  K.SCRIP = "scrip"; // currency item id (also the merchant funds field)
  K.SFX_PAY = "pickup_scrip"; // sound id (src/sound)
  /** Character outfit by its new name when the characters module knows it, else a neutral stand-in. */
  K.outfit = function (want, fallback) {
    try {
      const list =
        !G.isStub("chars") && typeof G.chars.outfits === "function"
          ? G.chars.outfits()
          : null;
      if (list && list.indexOf(want) >= 0) return want;
    } catch (e) {
      /* ignore */
    }
    return fallback;
  };
  /** Merchant record for G.actors.spawn({merchant}). */
  K.merchant = function (funds, stock, extra) {
    return Object.assign({ stock }, extra || {}, { scrip: funds });
  };
  K.funds = (m) => (m && typeof m.scrip === "number" ? m.scrip : 0);
  K.setFunds = function (m, n) {
    if (m) m.scrip = n;
  };

  /** Player standing (-1000 … 1000; good deeds raise it). */
  K.standing = function () {
    try {
      return !G.isStub("rpg") && typeof G.rpg.standing === "number"
        ? G.rpg.standing
        : 0;
    } catch (e) {
      return 0;
    }
  };
  K.level = function () {
    try {
      return !G.isStub("rpg") && typeof G.rpg.level === "number"
        ? G.rpg.level
        : 1;
    } catch (e) {
      return 1;
    }
  };
  K.inCombat = function () {
    try {
      return (
        !G.isStub("combat") &&
        typeof G.combat.inCombat === "function" &&
        !!G.combat.inCombat()
      );
    } catch (e) {
      return false;
    }
  };
  K.qFlag = function (name) {
    try {
      return !G.isStub("quests") && typeof G.quests.flag === "function"
        ? G.quests.flag(name)
        : undefined;
    } catch (e) {
      return undefined;
    }
  };
  K.qDone = function (id) {
    try {
      return (
        !G.isStub("quests") &&
        typeof G.quests.isComplete === "function" &&
        !!G.quests.isComplete(id)
      );
    } catch (e) {
      return false;
    }
  };
  K.relation = function (a, b) {
    try {
      if (!G.isStub("combat") && typeof G.combat.relation === "function")
        return G.combat.relation(a, b);
    } catch (e) {
      /* ignore */
    }
    return "neutral";
  };

  // ------------------------------------------------------------------
  // Items / inventory (defensive)
  // ------------------------------------------------------------------
  K.itemExists = function (id) {
    if (id === K.SCRIP) return true;
    if (G.isStub("items") || typeof G.items.get !== "function") return false;
    try {
      return !!G.items.get(id);
    } catch (e) {
      return false;
    }
  };
  K.itemName = function (id) {
    if (id === K.SCRIP) return "Scrip";
    try {
      const d = G.items.get(id);
      if (d && d.name) return d.name;
    } catch (e) {
      /* ignore */
    }
    return id;
  };
  /** Filter an [[id, n], ...] list to items that exist. */
  K.stock = (list) =>
    list.filter((e) => K.itemExists(e[0])).map((e) => [e[0], e[1]]);
  K.give = function (id, n) {
    if (G.isStub("inventory")) return false;
    try {
      if (id === K.SCRIP && typeof G.inventory.addScrip === "function")
        G.inventory.addScrip(n);
      else if (K.itemExists(id)) G.inventory.add(id, n || 1);
      else return false;
      return true;
    } catch (e) {
      G.reportError("ambient:give", e);
      return false;
    }
  };
  /** Scrip the player carries / pay scrip (false when short). */
  K.scrip = function () {
    try {
      return !G.isStub("inventory") && typeof G.inventory.scrip === "function"
        ? G.inventory.scrip()
        : 0;
    } catch (e) {
      return 0;
    }
  };
  K.takeScrip = function (n) {
    if (K.scrip() < n) return false;
    try {
      if (typeof G.inventory.addScrip === "function") G.inventory.addScrip(-n);
      else G.inventory.remove(K.SCRIP, n);
      return true;
    } catch (e) {
      return false;
    }
  };
  K.addStanding = function (n, reason) {
    try {
      if (!G.isStub("rpg") && typeof G.rpg.addStanding === "function")
        G.rpg.addStanding(n, reason);
    } catch (e) {
      /* ignore */
    }
  };
  K.addXP = function (n, reason) {
    try {
      if (!G.isStub("rpg") && G.rpg.addXP) G.rpg.addXP(n, reason);
    } catch (e) {
      /* ignore */
    }
  };
  /** Attribute 1-10 by its new name (brawn, reflex, grit, wits, senses, presence). */
  K.attr = function (name) {
    try {
      if (G.isStub("rpg") || typeof G.rpg.attr !== "function") return 5;
      const v = G.rpg.attr(name);
      return typeof v === "number" && !isNaN(v) ? v : 5;
    } catch (e) {
      return 5;
    }
  };
  K.skill = function (id) {
    try {
      return !G.isStub("rpg") && typeof G.rpg.skill === "function"
        ? G.rpg.skill(id) || 0
        : 0;
    } catch (e) {
      return 0;
    }
  };
  /** Define a note item once (G.items must be present). extra: e.g. {learn: lockId} (teaches a code on pickup). */
  K.defineNote = function (id, name, title, text, value, extra) {
    if (G.isStub("items") || typeof G.items.define !== "function") return false;
    try {
      if (G.items.get(id)) return true;
      G.items.define(
        Object.assign(
          {
            id,
            name,
            type: "note",
            title,
            text,
            weight: 0,
            value: value || 0,
            desc: title,
          },
          extra || {},
        ),
      );
      return true;
    } catch (e) {
      return false;
    }
  };
  /** Define a key item once. */
  K.defineKey = function (id, name, desc) {
    if (G.isStub("items") || typeof G.items.define !== "function") return false;
    try {
      if (G.items.get(id)) return true;
      G.items.define({
        id,
        name,
        type: "key",
        weight: 0,
        value: 0,
        tags: ["key"],
        mesh: "key",
        desc,
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  // ------------------------------------------------------------------
  // Locks: keys / codes / passcodes (G.locks). While the locks module is absent the lock simply opens.
  // ------------------------------------------------------------------
  K.openLock = function (spec, onOpen) {
    try {
      if (!G.isStub("locks") && G.locks && typeof G.locks.open === "function") {
        if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
          onOpen();
          return;
        }
        G.locks.open(spec, onOpen);
        return;
      }
    } catch (e) {
      G.reportError && G.reportError("locks:" + spec.id, e);
    }
    onOpen();
  };
  K.registerLock = function (spec) {
    try {
      if (!G.isStub("locks") && G.locks.register) G.locks.register(spec);
    } catch (e) {
      /* ignore */
    }
  };
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
  K.canvasTex = function (w, h, draw) {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d");
    draw(ctx, w, h);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace || t.colorSpace;
    if (
      THREE.sRGBEncoding !== undefined &&
      t.encoding !== undefined &&
      !THREE.SRGBColorSpace
    )
      t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  };

  // ------------------------------------------------------------------
  // Sound: sound-module names + a tiny custom synth on the same AudioContext
  // ------------------------------------------------------------------
  K.sfx = function (name, opts) {
    try {
      if (!G.isStub("sfx") && typeof G.sfx.play === "function")
        return G.sfx.play(name, opts || {}) || null;
    } catch (e) {
      /* ignore */
    }
    return null;
  };
  const SY = (K.synth = {});
  SY.ctx = function () {
    try {
      const c = !G.isStub("sfx") ? G.sfx.context : null;
      return c && c.state === "running" ? c : null;
    } catch (e) {
      return null;
    }
  };
  /** Effective SFX volume (master × sfx), from the sound module's persisted settings. */
  SY.vol = function () {
    try {
      const v = G.sfx.getVolumes ? G.sfx.getVolumes() : null;
      if (v)
        return (
          (v.master !== undefined ? v.master : 1) *
          (v.sfx !== undefined ? v.sfx : 1)
        );
    } catch (e) {
      /* ignore */
    }
    return 0.8;
  };
  let noiseBuf = null;
  SY.noise = function (c) {
    if (noiseBuf && noiseBuf.sampleRate === c.sampleRate) return noiseBuf;
    const n = Math.floor(c.sampleRate * 2);
    noiseBuf = c.createBuffer(1, n, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b = 0.97 * b + 0.03 * w;
      d[i] = w * 0.55 + b * 2.2;
    }
    return noiseBuf;
  };
  /** Positional output chain → destination. Returns {input, panner, out}. */
  SY.chain = function (c, pos, refDist, gain) {
    const out = c.createGain();
    out.gain.value = (gain || 1) * SY.vol();
    let input = out,
      panner = null;
    if (pos) {
      panner = c.createPanner();
      panner.panningModel = "equalpower";
      panner.distanceModel = "inverse";
      panner.refDistance = refDist || 6;
      panner.rolloffFactor = 1.2;
      panner.maxDistance = 3000;
      if (panner.positionX) {
        panner.positionX.value = pos.x;
        panner.positionY.value = pos.y;
        panner.positionZ.value = pos.z;
      } else panner.setPosition(pos.x, pos.y, pos.z);
      panner.connect(out);
      input = panner;
    }
    out.connect(c.destination);
    return { input, panner, out };
  };
  /** World is paused / dead / title → no new world sounds. */
  SY.worldAudible = () => G.worldRunning && G.worldRunning() && K.playerOk();

  /** Ox bellow: a formant "mooo" from one throat; `low` adds a short grunt a beat later. */
  SY.moo = function (pos, pitch, grunt) {
    const c = SY.ctx();
    if (!c || !SY.worldAudible()) return;
    const t0 = c.currentTime + 0.02;
    const voice = (tt, f0, dur, g) => {
      const ch = SY.chain(c, pos, 7, g);
      const o1 = c.createOscillator(),
        o2 = c.createOscillator();
      o1.type = "sawtooth";
      o2.type = "sawtooth";
      o1.frequency.setValueAtTime(f0 * 1.15, tt);
      o1.frequency.exponentialRampToValueAtTime(f0, tt + 0.25);
      o1.frequency.exponentialRampToValueAtTime(f0 * 0.8, tt + dur);
      o2.frequency.setValueAtTime(f0 * 1.16, tt);
      o2.frequency.exponentialRampToValueAtTime(f0 * 1.01, tt + 0.25);
      o2.frequency.exponentialRampToValueAtTime(f0 * 0.79, tt + dur);
      const f1 = c.createBiquadFilter();
      f1.type = "bandpass";
      f1.frequency.setValueAtTime(320, tt);
      f1.frequency.linearRampToValueAtTime(620, tt + 0.35);
      f1.frequency.linearRampToValueAtTime(380, tt + dur);
      f1.Q.value = 3;
      const f2 = c.createBiquadFilter();
      f2.type = "bandpass";
      f2.frequency.value = 950;
      f2.Q.value = 5;
      const env = c.createGain();
      env.gain.setValueAtTime(0.0001, tt);
      env.gain.exponentialRampToValueAtTime(0.5, tt + 0.12);
      env.gain.setValueAtTime(0.5, tt + dur * 0.7);
      env.gain.exponentialRampToValueAtTime(0.0001, tt + dur);
      const mix = c.createGain();
      mix.gain.value = 0.35;
      o1.connect(f1);
      o2.connect(f1);
      o1.connect(f2);
      f1.connect(env);
      f2.connect(mix);
      mix.connect(env);
      env.connect(ch.input);
      o1.start(tt);
      o2.start(tt);
      o1.stop(tt + dur + 0.05);
      o2.stop(tt + dur + 0.05);
    };
    const f = 88 * (pitch || 1);
    voice(t0, f, 1.35, 0.9);
    if (grunt) voice(t0 + 1.5 + Math.random() * 0.3, f * 0.92, 0.35, 0.5);
  };
  /** Wing flutter burst (a pigeon flock taking off). */
  SY.flutter = function (pos, strength) {
    const c = SY.ctx();
    if (!c || !SY.worldAudible()) return;
    const t0 = c.currentTime + 0.01,
      dur = 0.9 + 0.4 * (strength || 1);
    const ch = SY.chain(c, pos, 5, 0.9 * (strength || 1));
    const src = c.createBufferSource();
    src.buffer = SY.noise(c);
    src.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2400;
    bp.Q.value = 0.8;
    const am = c.createGain();
    am.gain.value = 0;
    const lfo = c.createOscillator();
    lfo.type = "square";
    lfo.frequency.setValueAtTime(19, t0);
    lfo.frequency.linearRampToValueAtTime(12, t0 + dur);
    const lg = c.createGain();
    lg.gain.value = 0.5;
    lfo.connect(lg);
    lg.connect(am.gain);
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(0.7, t0 + 0.05);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp);
    bp.connect(am);
    am.connect(env);
    env.connect(ch.input);
    src.start(t0, Math.random());
    lfo.start(t0);
    src.stop(t0 + dur + 0.05);
    lfo.stop(t0 + dur + 0.05);
  };
  /** The Stranger's three-note sting (original motif: low brass-ish swell). */
  SY.sting = function () {
    const c = SY.ctx();
    if (!c) return;
    const t0 = c.currentTime + 0.02;
    const ch = SY.chain(c, null, 1, 0.35);
    const notes = [
      [146.8, 0, 0.32],
      [138.6, 0.36, 0.32],
      [110, 0.74, 1.6],
    ];
    for (const [f, dt, d] of notes) {
      const tt = t0 + dt;
      const o = c.createOscillator(),
        o2 = c.createOscillator();
      o.type = "sawtooth";
      o2.type = "square";
      o.frequency.value = f;
      o2.frequency.value = f * 0.5;
      const lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(400, tt);
      lp.frequency.linearRampToValueAtTime(1400, tt + d * 0.4);
      lp.frequency.linearRampToValueAtTime(500, tt + d);
      const env = c.createGain();
      env.gain.setValueAtTime(0.0001, tt);
      env.gain.exponentialRampToValueAtTime(0.6, tt + 0.06);
      env.gain.setValueAtTime(0.6, tt + d * 0.6);
      env.gain.exponentialRampToValueAtTime(0.0001, tt + d);
      const g2 = c.createGain();
      g2.gain.value = 0.4;
      o.connect(lp);
      o2.connect(g2);
      g2.connect(lp);
      lp.connect(env);
      env.connect(ch.input);
      o.start(tt);
      o2.start(tt);
      o.stop(tt + d + 0.05);
      o2.stop(tt + d + 0.05);
    }
  };
  /**
   * Continuous rotor wash for a Rotorcraft (blade-slap AM on filtered noise + turbine whine).
   * Returns a handle {update(pos, vel, level, realDt), stop()}. Silently a no-op without audio.
   */
  SY.rotor = function () {
    const H = {
      alive: true,
      update() {
        /* no audio */
      },
      stop() {
        H.alive = false;
      },
    };
    const c = SY.ctx();
    if (!c) return H;
    const t0 = c.currentTime;
    const ch = SY.chain(c, { x: 0, y: 0, z: 0 }, 38, 0.0001);
    ch.panner.rolloffFactor = 1.05;
    // blade slap: low noise through a lowpass, amplitude-modulated at blade-pass frequency
    const src = c.createBufferSource();
    src.buffer = SY.noise(c);
    src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    lp.Q.value = 0.7;
    const am = c.createGain();
    am.gain.value = 0.35;
    const lfo = c.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 11;
    const shp = c.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = i / 127.5 - 1;
      curve[i] = Math.pow(Math.max(0, x), 3) * 1.6;
    }
    shp.curve = curve;
    lfo.connect(shp);
    shp.connect(am.gain);
    // thump body: sub sine at the same rate
    const sub = c.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 55;
    const subG = c.createGain();
    subG.gain.value = 0;
    const subShp = c.createGain();
    subShp.gain.value = 0.5;
    shp.connect(subShp);
    subShp.connect(subG.gain);
    // turbine whine
    const wh = c.createOscillator();
    wh.type = "sawtooth";
    wh.frequency.value = 820;
    const whBp = c.createBiquadFilter();
    whBp.type = "bandpass";
    whBp.frequency.value = 1650;
    whBp.Q.value = 6;
    const whG = c.createGain();
    whG.gain.value = 0.05;
    src.connect(lp);
    lp.connect(am);
    am.connect(ch.input);
    sub.connect(subG);
    subG.connect(ch.input);
    wh.connect(whBp);
    whBp.connect(whG);
    whG.connect(ch.input);
    src.start(t0);
    lfo.start(t0);
    sub.start(t0);
    wh.start(t0);
    let lvl = 0;
    H.update = function (pos, vel, level, realDt) {
      if (!H.alive) return;
      const now = c.currentTime;
      const P = ch.panner;
      if (P.positionX) {
        P.positionX.setTargetAtTime(pos.x, now, 0.05);
        P.positionY.setTargetAtTime(pos.y, now, 0.05);
        P.positionZ.setTargetAtTime(pos.z, now, 0.05);
      } else P.setPosition(pos.x, pos.y, pos.z);
      // cheap Doppler: radial speed toward the camera
      let dop = 1;
      const cam = G.camera;
      if (cam && vel) {
        const dx = cam.position.x - pos.x,
          dy = cam.position.y - pos.y,
          dz = cam.position.z - pos.z;
        const d = Math.hypot(dx, dy, dz) || 1;
        const vr = (vel.x * dx + vel.y * dy + vel.z * dz) / d; // + approaching
        dop = K.clamp(343 / (343 - vr), 0.8, 1.25);
      }
      const running = G.worldRunning && G.worldRunning();
      const target = running ? K.clamp(level, 0, 1) : 0;
      lvl += (target - lvl) * Math.min(1, (realDt || 0.016) * 3);
      ch.out.gain.setTargetAtTime(
        Math.max(0.0001, lvl * 1.1 * SY.vol()),
        now,
        0.08,
      );
      lfo.frequency.setTargetAtTime(11 * dop, now, 0.1);
      wh.frequency.setTargetAtTime(820 * dop, now, 0.1);
      src.playbackRate.setTargetAtTime(dop, now, 0.1);
    };
    H.stop = function () {
      if (!H.alive) return;
      H.alive = false;
      const now = c.currentTime;
      try {
        ch.out.gain.cancelScheduledValues(now);
        ch.out.gain.setTargetAtTime(0.0001, now, 0.15);
      } catch (e) {
        /* ignore */
      }
      const st = now + 0.8;
      for (const n of [src, lfo, sub, wh]) {
        try {
          n.stop(st);
        } catch (e) {
          /* ignore */
        }
      }
      setTimeout(() => {
        try {
          ch.out.disconnect();
        } catch (e) {
          /* ignore */
        }
      }, 1200);
    };
    return H;
  };

  // ------------------------------------------------------------------
  // System registry (driven by 90_module.js)
  // ------------------------------------------------------------------
  // def: {name, order, init(), initDone(), newGame(opts), reset(), loaded(), update(dt, realDt), save() → json, load(d)}
  K.systems = [];
  K.system = function (def) {
    K.systems.push(def);
    K.systems.sort((a, b) => (a.order || 50) - (b.order || 50));
    return def;
  };
  K.sys = (name) => K.systems.find((s) => s.name === name) || null;
  K.log = function () {
    if (G.DEBUG || (G.QS && G.QS.has("ambdebug")))
      console.log.apply(console, ["[ambient]"].concat(Array.from(arguments)));
  };
})();
