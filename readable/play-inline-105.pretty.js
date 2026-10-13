/* src/map/90_module_interior.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 90 MODULE — INTERIOR RUNTIME
 * Everything the module registration (90_module.js) does for the interior
 * cells, reached through M.* hooks: the Cryo Unit C-9 blast-door public
 * API, adding the interior cell roots to the scene (hidden) and their
 * borrowed fixture lights, publishing MAP.cryoAnchors / MAP.dungeons,
 * per-frame interior updates (blast door, sliding doors, "Cleared" dungeon
 * names), interior root visibility (only the cell the camera is in), loot
 * containers in the enterable shops / the cryo unit / subway / dungeons
 * (newGame / loaded), dungeon notes & terminals (initDone) and the save
 * block (blast door state).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const M = G.map._;
  const MAP = G.map;

  // -------------------------------------------------------------------
  // Public API: the Cryo Unit C-9 blast door
  // -------------------------------------------------------------------
  /**
   * Open the blast door (instant → snap open). opts.sound: play the alarm + rumble (default: yes,
   * except when the quests module is loaded — it narrates the story opening itself).
   * Player-driven openings (keypads) always play the map's sounds.
   */
  MAP.openBlastDoor = (instant, opts) => {
    if (!M.openBlastDoor) return;
    const sound =
      opts && opts.sound !== undefined ? !!opts.sound : G.isStub("quests");
    M.openBlastDoor(!!instant, { silent: !sound });
  };
  MAP.closeBlastDoor = (instant) =>
    M.closeBlastDoor && M.closeBlastDoor(!!instant);
  MAP.isBlastDoorOpen = () =>
    !!(
      M.blastDoor &&
      (M.blastDoor.state === "open" || M.blastDoor.state === "opening")
    );
  MAP.blastDoorState = () => (M.blastDoor ? M.blastDoor.state : "closed");
  /** Hold the keypad dead (quests: e.g. while the hero is still thawing). message = what the keypad says. */
  MAP.lockBlastDoor = function (locked, message) {
    if (M.blastDoor) {
      M.blastDoor.locked = !!locked;
      if (message !== undefined) M.blastDoor.message = message;
    }
  };
  MAP.useBlastKeypad = () => M.useBlastKeypad && M.useBlastKeypad();
  MAP.blastLockId = "q_cryo_blast_door";

  // -------------------------------------------------------------------
  // Init hooks (called by 90_module.js init, in the same places as before)
  // -------------------------------------------------------------------
  /** After the chunk flush: the interior cell roots go into the scene (dungeon cells start hidden). */
  M.addInteriorRoots = function () {
    for (const k of ["cryo", "subway", "cryoDyn"])
      if (M.roots[k]) G.scene.add(M.roots[k]);
    for (const k in M.roots)
      if (k.startsWith("int_")) {
        M.roots[k].visible = false;
        G.scene.add(M.roots[k]);
      }
  };
  /** Flickering subway tubes get real (borrowed) light pools (atmos present; called before the extraFixtures loop). */
  M.addInteriorFixtures = function () {
    for (const p of M.subwayFlicker || [])
      G.atmos.addFixtureLight(p, 0xd8f0ff, {
        flicker: 0.7,
        range: 9,
        intensity: 1.1,
        glowSize: 1.3,
      });
  };
  /** Public interior data on G.map. */
  M.publishInteriorData = function () {
    MAP.cryoAnchors = M.anchors.cryo_c9;
    // dungeons: {key, name, origin, extId (outdoor LOCATIONS id), intId (interior LOCATIONS id), entrance, anchors}
    MAP.dungeons = (M.dungeons || []).map((d) => ({
      key: d.key,
      name: d.name,
      origin: d.origin,
      extId: d.extId,
      intId: d.intId,
      entrance: d.entrance,
      outside: d.outside,
      anchors: d.anchors,
    }));
  };

  // -------------------------------------------------------------------
  // Runtime hooks (called by 90_module.js update)
  // -------------------------------------------------------------------
  let nameTimer = 3;
  M.updateInteriors = function (dt, realDt) {
    if (M.updateBlastDoor) M.updateBlastDoor(dt);
    if (M.updateSlideDoors && dt > 0) M.updateSlideDoors(dt);
    nameTimer -= realDt;
    if (nameTimer <= 0) {
      nameTimer = 2;
      if (M.updateDungeonNames) {
        try {
          M.updateDungeonNames();
        } catch (e) {
          /* */
        }
      }
    }
  };
  /** Interior cell roots: visible only while the camera is indoors and within 200 m of that cell. */
  M.interiorVisibility = function (cam, indoor) {
    const near = (o, r) =>
      Math.abs(cam.x - o.x) < r && Math.abs(cam.z - o.z) < r;
    const co = G.LAYOUT.INTERIORS.cryo_c9.origin,
      so = G.LAYOUT.INTERIORS.subway.origin;
    if (M.roots.cryo) M.roots.cryo.visible = indoor && near(co, 200);
    if (M.roots.cryoDyn) M.roots.cryoDyn.visible = indoor && near(co, 200);
    if (M.roots.subway) M.roots.subway.visible = indoor && near(so, 200);
    if (M.dungeonVisibility) M.dungeonVisibility(cam, indoor);
  };

  // -------------------------------------------------------------------
  // Loot, events, save
  // -------------------------------------------------------------------
  // Loot containers in storefront shells & cryo-unit / subway spots (dynamic → newGame)
  let spawned = [];
  function spawnLoot() {
    clearLoot();
    if (G.isStub("props") || !G.props.spawn) return;
    const tryS = (type, o) => {
      try {
        const h = G.props.spawn(type, o);
        if (h) {
          spawned.push(h);
          if (o.lock && h.container && !h.container.lock)
            h.container.lock = o.lock;
        }
      } catch (e) {
        G.reportError("map:props.spawn", e);
      }
    };
    for (const s of M.shells || [])
      for (const l of s.loot)
        tryS(l.type, {
          x: l.x,
          y: s.floorY || 0.15,
          z: l.z,
          yaw: l.yaw || 0,
          id: s.id + "_" + l.type,
          loot:
            l.type === "first_aid"
              ? "first_aid"
              : l.type === "ammo_box"
                ? "ammo"
                : "store",
        });
    const ca = M.anchors.cryo_c9 || {};
    const cs = [
      ["first_aid", ca.infirmary_cabinet, "first_aid", 0, 0],
      ["toolbox", ca.boiler, "tools", -1.2, Math.PI / 2],
      ["file_cabinet", ca.security, "file_cabinet", 2.2, 0],
    ];
    for (const [type, p, loot, dx, yaw] of cs)
      if (p)
        tryS(type, {
          x: p.x + dx,
          y: p.y,
          z: p.z,
          yaw,
          id: "cryo_" + type,
          loot,
        });
    const sa = M.anchors.subway || {};
    if (sa.maintenance_loot)
      tryS("toolbox", {
        x: sa.maintenance_loot.x,
        y: sa.maintenance_loot.y,
        z: sa.maintenance_loot.z,
        yaw: 0,
        id: "subway_toolbox",
        loot: "tools",
      });
    // the token booth safe: its keypad combination is on the clerk's tally card (60_subway_interior.js)
    if (sa.booth)
      tryS("safe", {
        x: sa.booth.x,
        y: sa.booth.y,
        z: sa.booth.z,
        yaw: Math.PI,
        id: "subway_booth_safe",
        loot: "safe",
        lock: M.SUBWAY_BOOTH_LOCK
          ? Object.assign({}, M.SUBWAY_BOOTH_LOCK)
          : undefined,
      });
    if (M.spawnDungeonLoot) {
      try {
        M.spawnDungeonLoot();
      } catch (e) {
        G.reportError("map:dungeonLoot", e);
      }
    }
  }
  function clearLoot() {
    for (const h of spawned) {
      try {
        if (h.object3d && h.object3d.parent)
          h.object3d.parent.remove(h.object3d);
        if (h.interactable) G.world.removeInteractable(h.interactable);
        if (h.dispose) h.dispose();
      } catch (e) {
        /* */
      }
    }
    spawned = [];
    if (M.clearDungeonLoot) {
      try {
        M.clearDungeonLoot();
      } catch (e) {
        /* */
      }
    }
  }

  G.on("newGame", () => {
    // a fresh start: the blast door is shut (its keypad lock state lives in G.locks)
    if (M.closeBlastDoor) M.closeBlastDoor(true);
    if (M.blastDoor) {
      M.blastDoor.locked = false;
      M.blastDoor.message = "";
    }
    spawnLoot();
  });
  G.on("reset", () => {
    clearLoot();
  });
  // dungeon notes (static pickups, persisted by rpg) & terminals need items / terminals → after every module's init
  G.on("initDone", () => {
    if (M.initDungeonData) {
      try {
        M.initDungeonData();
      } catch (e) {
        G.reportError("map:dungeonData", e);
      }
    }
  });
  G.on("loaded", () => {
    spawnLoot();
  });

  G.save.register("map", {
    save: () => ({
      blastDoor: M.blastDoor ? M.blastDoor.state : "closed",
      locked: M.blastDoor ? !!M.blastDoor.locked : false,
      message: M.blastDoor ? M.blastDoor.message || "" : "",
    }),
    load: (d) => {
      if (!d || !M.blastDoor) return;
      M.blastDoor.locked = !!d.locked;
      M.blastDoor.message = d.message || "";
      if (d.blastDoor === "open" || d.blastDoor === "opening")
        M.openBlastDoor(true);
      else M.closeBlastDoor(true);
    },
  });
})();
