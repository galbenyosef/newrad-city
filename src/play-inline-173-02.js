// play-inline-173 02 — def
// Lines 20-366 of readable/play-inline-173.pretty.js (statement-aligned).
  const K = G.PMID.kit,
    A = G.PMID;
  const U = G.util;

  A.content = A.content || {}; // poi → {props:[], notes:[], pickups:[], terminals:[], rads:[], npcs:[]}
  A.items = A.items || []; // item defs
  A.terminalDefs = A.terminalDefs || {};
  A.dialogues = A.dialogues || {};
  A.quests = A.quests || [];
  A.npcDefs = A.npcDefs || []; // () => def | def
  A.spawnedNPCs = A.spawnedNPCs || [];
  A.spawnedProps = A.spawnedProps || [];
  A.state = A.state || {}; // saved module state (see 99_main)

  K.discover = function (id) {
    try {
      if (G.discover) G.discover(id);
    } catch (e) {
      /* ignore */
    }
  };
  K.site = K.site || ((id) => G.LAYOUT.getSite(id));

  /** Teleport door wrapper (keeps a list per record for debugging). */
  K.door = function (rec, def) {
    const d = G.world.addDoor(
      Object.assign({ sound: "door_open", radius: 1.3 }, def),
    );
    (rec.doors = rec.doors || []).push(d);
    return d;
  };

  /** Declare content for a POI. Coordinates are world-space. */
  K.content = function (poi, rec) {
    const C =
      A.content[poi] ||
      (A.content[poi] = {
        rec,
        props: [],
        notes: [],
        pickups: [],
        terminals: [],
        rads: [],
      });
    C.rec = rec;
    let n = 0;
    const Y = (y) => y + (K.yOff || 0); // interiors authored below 0 are lifted (see Builder.yOff)
    return {
      /** Any G.props.spawn type (containers, skeletons, lamps …). */
      prop(type, x, y, z, yaw, opts) {
        C.props.push({
          type,
          x,
          y: Y(y),
          z,
          yaw: yaw || 0,
          opts: Object.assign({}, opts || {}),
          idx: n++,
        });
        // contract: interiors publish loot1..n anchors — every lootable container inside the cell becomes one
        if (
          opts &&
          opts.loot &&
          rec &&
          rec.anchors &&
          x >= G.LAYOUT.INTERIOR_X_MIN
        ) {
          let k = 1;
          while (rec.anchors["loot" + k]) k++;
          const v = new THREE.Vector3(x, Y(y), z);
          v.yaw = yaw || 0;
          rec.anchors["loot" + k] = v;
        }
      },
      terminal(id, x, y, z, yaw, mount) {
        C.props.push({
          type: "terminal",
          x,
          y: Y(y),
          z,
          yaw: yaw || 0,
          opts: { terminalId: id, mount: mount || "own_desk" },
          idx: n++,
        });
      },
      note(id, x, y, z, def) {
        C.notes.push(Object.assign({ id, x, y: Y(y), z, type: "note" }, def));
      },
      tape(id, x, y, z, def) {
        C.notes.push(Object.assign({ id, x, y: Y(y), z, type: "tape" }, def));
      },
      pickup(item, count, x, y, z) {
        C.pickups.push({ item, count: count || 1, x, y: Y(y), z });
      },
      bobble() {
        /* World's Fair Medallions are placed by the quests module (all 20); intentionally unused */
      },
      rad(x, y, z, radius, strength) {
        C.rads.push({ x, y: Y(y), z, radius, strength });
      },
    };
  };
  // ------------------------------------------------------------------
  // Environmental hazards (static positions, built in init): arcing live conduits, steam leaks, fire.
  // Damage ticks every 0.5 s while the player stands inside r (and within 2 m vertically); sparks /
  // puffs are emitted through the shared G.fx pools only while the player is near (no permanent lights).
  // o: {x, y, z, r, dps, kind:'shock'|'steam'|'fire', every?:seconds between visual bursts}
  // ------------------------------------------------------------------
  A.hazards = A.hazards || [];
  K.hazard = function (o) {
    A.hazards.push(
      Object.assign(
        {
          r: 1.2,
          dps: 8,
          kind: "shock",
          every: 1.2,
          t: Math.random(),
          dmgT: 0,
        },
        o,
        { y: o.y + (K.yOff || 0) },
      ),
    );
  };
  const _hz = new THREE.Vector3();
  K.animate(function (dt) {
    if (!dt || !A.hazards.length || !G.player) return;
    const p = G.player.pos;
    for (const h of A.hazards) {
      const dx = p.x - h.x,
        dz = p.z - h.z,
        d2 = dx * dx + dz * dz;
      if (d2 > 40 * 40 || Math.abs(p.y - h.y) > 12) continue;
      h.t -= dt;
      if (h.t <= 0) {
        h.t = h.every * (0.5 + Math.random());
        _hz.set(h.x, h.y, h.z);
        try {
          if (G.isStub("fx")) {
            /* no visuals */
          } else if (h.kind === "shock") {
            G.fx.sparks(_hz);
            if (Math.random() < 0.35 && d2 < 20 * 20)
              G.fx.flash(_hz, 0x9ac8ff, 1.6, 0.08);
          } else if (h.kind === "steam") {
            if (G.fx.dust) G.fx.dust(_hz);
          } else if (h.kind === "fire") {
            G.fx.sparks(_hz);
          }
        } catch (e) {
          /* fx optional */
        }
        if (d2 < 15 * 15) {
          try {
            G.sfx.play(h.kind === "steam" ? "steam_hiss" : "zap", {
              pos: _hz,
              volume: 0.4,
            });
          } catch (e) {
            /* */
          }
        }
      }
      if (
        d2 < h.r * h.r &&
        p.y > h.y - 2 &&
        p.y < h.y + 2 &&
        G.player.alive !== false
      ) {
        h.dmgT -= dt;
        if (h.dmgT <= 0) {
          h.dmgT = 0.5;
          try {
            G.player.damage(h.dps * 0.5, {
              type: h.kind === "shock" ? "energy" : "fire",
              source: "hazard",
            });
          } catch (e) {
            /* */
          }
          if (h.kind === "shock") {
            try {
              G.player.shake(0.25, 0.2);
            } catch (e) {
              /* */
            }
          }
        }
      }
    }
  });
  K.item = function (def) {
    A.items.push(def);
  };
  K.terminalDef = function (id, def) {
    A.terminalDefs[id] = def;
  };
  K.dialogueDef = function (id, tree) {
    A.dialogues[id] = tree;
  };
  K.questDef = function (def) {
    A.quests.push(def);
  };
  /** Named NPC: def (or a function returning def|null, evaluated at spawn time). Must carry a stable `id`. */
  K.npc = function (def) {
    A.npcDefs.push(def);
  };

  // ------------------------------------------------------------------
  // Registration on initDone
  // ------------------------------------------------------------------
  function defineItems() {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    for (const d of A.items) {
      try {
        const def = typeof d === "function" ? d() : d;
        if (!def) continue;
        if (G.items.get && G.items.get(def.id)) continue;
        G.items.define(def);
      } catch (e) {
        G.reportError("poi_midtown:item", e);
      }
    }
    for (const poi in A.content)
      for (const nt of A.content[poi].notes) {
        try {
          if (G.items.get && G.items.get(nt.id)) continue;
          G.items.define({
            id: nt.id,
            type: nt.type,
            name: nt.name,
            title: nt.title || nt.name,
            text: nt.text,
            weight: 0,
            value: nt.value || 0,
            desc: nt.desc,
            learn: nt.learn,
          });
        } catch (e) {
          G.reportError("poi_midtown:note", e);
        }
      }
  }
  function registerTerminals() {
    if (G.isStub("terminals") || typeof G.terminals.register !== "function")
      return;
    for (const id in A.terminalDefs) {
      try {
        G.terminals.register(id, A.terminalDefs[id]);
      } catch (e) {
        G.reportError("poi_midtown:terminal " + id, e);
      }
    }
  }
  function registerDialogues() {
    if (G.isStub("dialogue") || typeof G.dialogue.register !== "function")
      return;
    for (const id in A.dialogues) {
      try {
        G.dialogue.register(id, A.dialogues[id]);
      } catch (e) {
        G.reportError("poi_midtown:dialogue " + id, e);
      }
    }
  }
  function defineQuests() {
    if (G.isStub("quests") || typeof G.quests.define !== "function") return;
    for (const q of A.quests) {
      try {
        if (G.quests.get && G.quests.get(q.id)) continue;
        G.quests.define(q);
      } catch (e) {
        G.reportError("poi_midtown:quest " + q.id, e);
      }
    }
  }
  function spawnWorld() {
    const XMIN = G.LAYOUT.INTERIOR_X_MIN;
    for (const poi in A.content) {
      const C = A.content[poi],
        rec = C.rec;
      if (!G.isStub("props") && typeof G.props.spawn === "function") {
        for (const p of C.props) {
          try {
            const o = Object.assign(
              {
                x: p.x,
                y: p.y,
                z: p.z,
                yaw: p.yaw,
                id: "pmid:" + poi + ":" + p.idx + ":" + p.type,
                persistent: true,
              },
              p.opts,
            );
            if (rec) o.parent = p.x >= XMIN ? rec.interiorRoot : rec.root;
            const h = G.props.spawn(p.type, o);
            if (h) A.spawnedProps.push(h);
            if (h && o.lock) K.lockContainer(h, o.lock);
          } catch (e) {
            G.reportError("poi_midtown:prop " + poi, e);
          }
        }
      }
      if (!G.isStub("items") && typeof G.items.spawnPickup === "function") {
        for (const nt of C.notes) {
          try {
            G.items.spawnPickup(
              nt.id,
              1,
              new THREE.Vector3(nt.x, nt.y + 0.02, nt.z),
              { static: true, keepY: true, yaw: nt.yaw || 0.4 },
            );
          } catch (e) {
            G.reportError("poi_midtown:note spawn", e);
          }
        }
        for (const pk of C.pickups) {
          try {
            if (G.items.get && !G.items.get(pk.item)) continue;
            G.items.spawnPickup(
              pk.item,
              pk.count,
              new THREE.Vector3(pk.x, pk.y + 0.02, pk.z),
              { static: true, keepY: true, yaw: (pk.x * 7) % 6 },
            );
          } catch (e) {
            G.reportError("poi_midtown:pickup", e);
          }
        }
      }
      for (const r of C.rads) {
        try {
          G.world.addRadSource({
            x: r.x,
            y: r.y,
            z: r.z,
            radius: r.radius,
            strength: r.strength,
          });
        } catch (e) {
          /* ignore */
        }
      }
    }
  }
