// play-inline-224 02 — list
// Lines 11-218 of readable/play-inline-224.pretty.js (statement-aligned).
  const PH = G._pharbor;

  let blockT = 0;
  const _lastPos = new THREE.Vector3();
  let haveLast = false;

  function updateInteriors() {
    const p = G.player && G.player.pos;
    if (!p) return;
    for (const it of PH.interiors) {
      const inside =
        Math.abs(p.x - it.origin.x) < 170 && Math.abs(p.z - it.origin.z) < 170;
      if (it.root.visible !== inside) it.root.visible = inside;
    }
  }

  // ------------------------------------------------------------------
  // Combat scatters an interior location's spawns around the player's
  // arrival point; move them onto this module's authored spawn anchors.
  // ------------------------------------------------------------------
  const RELOC = {
    domino_sugar: {
      poi: "domino_sugar",
      list: ["spawn1", "spawn3", "spawn4", "spawn5", "spawn6", "spawn2"],
    },
    uss_hudson: {
      poi: "uss_hudson",
      list: ["spawn1", "spawn2", "spawn3", "spawn4", "spawn5", "spawn6"],
    },
  };
  const relocN = {};
  function fixSpawns() {
    if (G.isStub("actors") || typeof G.actors.list !== "function") return;
    const p = G.player && G.player.pos;
    if (!p) return;
    for (const key in RELOC) {
      const I = G.LAYOUT.INTERIORS[key];
      if (!I) continue;
      if (Math.abs(p.x - I.origin.x) > 170 || Math.abs(p.z - I.origin.z) > 170)
        continue;
      const poi = PH.entries[RELOC[key].poi];
      if (!poi || !poi.anchors) continue;
      for (const a of G.actors.list()) {
        if (!a || a.dead || a._phPlaced || a.group !== key || !a.pos) continue;
        a._phPlaced = true;
        const list = RELOC[key].list;
        const n = (relocN[key] = (relocN[key] || 0) + 1);
        const an = poi.anchors[list[(n - 1) % list.length]];
        if (!an) continue;
        const j = n > list.length ? 2.5 : 0;
        a.pos.set(
          an.x + (Math.random() - 0.5) * j,
          an.y + 0.05,
          an.z + (Math.random() - 0.5) * j,
        );
        if (a.char && a.char.root && a.char.root.position !== a.pos)
          a.char.root.position.copy(a.pos);
        a.home = { x: an.x, z: an.z, r: 8 };
        if (typeof an.yaw === "number") a.yaw = an.yaw;
      }
    }
  }
  let relocT = 0;
  G.events.on("newGame", () => {
    for (const k in relocN) delete relocN[k];
  });
  G.events.on("loaded", () => {
    for (const k in relocN) delete relocN[k];
  });

  G.registerModule({
    name: "poi_harbor",
    order: 29,
    init() {
      if (!G.pois || G.pois.__stub) G.pois = {};
      PH.publish();
      PH.builders.sort((a, b) => a.order - b.order);
      for (const bd of PH.builders) {
        try {
          bd.fn();
        } catch (e) {
          G.reportError("init:poi_harbor:" + bd.id, e);
        }
        PH.setOrigin(0, 0);
      }
      PH.updateBlockers();
      G.events.on("initDone", () => {
        for (const fn of PH.onReady) {
          try {
            fn();
          } catch (e) {
            G.reportError("poi_harbor:ready", e);
          }
        }
      });
      G.events.on("newGame", (opts) => {
        PH.respawnMissing();
        for (const fn of PH.onNewGame) {
          try {
            fn(opts);
          } catch (e) {
            G.reportError("poi_harbor:newGame", e);
          }
        }
        PH.updateBlockers();
      });
      G.events.on("reset", () => {
        PH.flags = {};
        for (const h of PH.sessionPickups) {
          try {
            if (h && h.remove) h.remove();
          } catch (e) {
            /* */
          }
        }
        PH.sessionPickups = [];
        for (const fn of PH.onReset) {
          try {
            fn();
          } catch (e) {
            G.reportError("poi_harbor:reset", e);
          }
        }
        PH.updateBlockers();
      });
      G.events.on("loaded", () => {
        PH.respawnMissing();
        for (const fn of PH.onLoaded) {
          try {
            fn();
          } catch (e) {
            G.reportError("poi_harbor:loaded", e);
          }
        }
        PH.updateBlockers();
      });
      G.events.on("teleport", () => {
        haveLast = false;
      });
      try {
        G.save.register("poi_harbor", {
          save() {
            const out = { flags: Object.assign({}, PH.flags) };
            for (const k in PH.saveHooks) {
              try {
                out[k] = PH.saveHooks[k].save();
              } catch (e) {
                /* */
              }
            }
            return out;
          },
          load(d) {
            PH.flags = Object.assign({}, (d && d.flags) || {});
            for (const k in PH.saveHooks) {
              try {
                PH.saveHooks[k].load(d ? d[k] : undefined);
              } catch (e) {
                /* */
              }
            }
            PH.updateBlockers();
          },
        });
      } catch (e) {
        G.reportError("poi_harbor:save", e);
      }
    },
    update(dt, realDt) {
      updateInteriors();
      blockT -= realDt;
      if (blockT <= 0) {
        blockT = 0.4;
        PH.updateBlockers();
      }
      relocT -= realDt;
      if (relocT <= 0) {
        relocT = 0.25;
        try {
          fixSpawns();
        } catch (e) {
          G.reportError("poi_harbor:reloc", e);
        }
      }
      const P = G.player;
      if (P && P.pos) {
        // hazards (sticky syrup, steam) act on the player's displacement this frame
        if (haveLast && dt > 0) {
          for (const hz of PH.hazards || []) {
            try {
              hz(P, _lastPos, dt);
            } catch (e) {
              /* */
            }
          }
        }
        _lastPos.copy(P.pos);
        haveLast = true;
      }
      for (const fn of PH.updaters) {
        try {
          fn(dt, realDt);
        } catch (e) {
          G.reportError("update:poi_harbor", e);
        }
      }
    },
  });
