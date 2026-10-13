/* src/poi_midtown/05_content.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 05_content.js
 * Gameplay content plumbing for the POIs. Build files only DECLARE content
 * (props/containers, terminals, notes, tape reels, pickups, rad sources,
 * named NPCs, items, dialogue trees, quests); this file registers it with
 * the owning modules at the right time:
 *   initDone → items, terminals, dialogues, quests defined; props, notes,
 *              pickups spawned once (persistent world: rpg keeps containers
 *              pristine per game, "taken" pickups are remembered by rpg)
 *   newGame / loaded → named NPCs (stable ids; combat re-applies saved state)
 *   reset → our NPCs removed, module state cleared
 * Every call into another module is guarded (G.isStub / typeof checks).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.PMID) return;
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
  A.registerAll = function () {
    defineItems();
    registerTerminals();
    registerDialogues();
    defineQuests();
  };
  A.onInitDone = function () {
    A.registerAll();
    spawnWorld();
    for (const fn of A.ready) {
      try {
        fn();
      } catch (e) {
        G.reportError("poi_midtown:ready", e);
      }
    }
  };

  // ------------------------------------------------------------------
  // Named NPCs (newGame / loaded)
  // ------------------------------------------------------------------
  A.clearNPCs = function () {
    for (const a of A.spawnedNPCs) {
      try {
        if (!G.isStub("actors") && G.actors.remove) G.actors.remove(a);
      } catch (e) {
        /* ignore */
      }
    }
    A.spawnedNPCs.length = 0;
  };
  A.spawnNPCs = function () {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return;
    A.clearNPCs();
    for (const d of A.npcDefs) {
      let def = null;
      try {
        def = typeof d === "function" ? d() : Object.assign({}, d);
      } catch (e) {
        G.reportError("poi_midtown:npc def", e);
      }
      if (!def) continue;
      try {
        if (def.id && G.actors.get) {
          const old = G.actors.get(def.id);
          if (old) {
            try {
              G.actors.remove(old);
            } catch (e) {
              /* ignore */
            }
          }
        }
        const a = G.actors.spawn(def);
        if (a) {
          A.spawnedNPCs.push(a);
          if (def.after)
            try {
              def.after(a);
            } catch (e) {
              /* ignore */
            }
        }
      } catch (e) {
        G.reportError("poi_midtown:npc " + (def && def.id), e);
      }
    }
  };

  // ------------------------------------------------------------------
  // Gates: physical interior doors (their own mesh + collider) that can be
  // locked (a G.locks spec — key / code — or released by a terminal) and swing or slide open.
  // Open state is saved in A.state; reset closes them again.
  // ------------------------------------------------------------------
  A.gates = A.gates || {};
  /**
   * o: {id, x, y, z, w, h, yaw (three.js: the door plane runs along local x), mat, tint, lock ({id, key?|code?}),
   *     label, mode: 'hinge'|'slide'|'lift', parent, onOpen(), lockMsg}
   */
  K.gate = function (rec, o) {
    const w = o.w || 1.2,
      h = o.h || 2.2;
    o = Object.assign({}, o, { y: o.y + (K.yOff || 0) });
    const pivot = new THREE.Group();
    const leafB = K.builder("gate_" + o.id, { grime: 0.4, yOff: 0 });
    const hingeOff = o.mode === "hinge" ? w / 2 : 0;
    leafB.box(o.mat || "metal_dark", hingeOff, 0, 0, w, h, o.th || 0.1, {
      tint: o.tint,
      faces: "nsewtb",
    });
    if (o.window)
      leafB.box(
        "glass",
        hingeOff,
        h * 0.6,
        0,
        w * 0.35,
        h * 0.2,
        (o.th || 0.1) + 0.02,
        { faces: "ns", grime: 0.3 },
      );
    if (o.wheel)
      leafB.geo("chrome", K.T.torusThick, {
        x: hingeOff,
        y: h * 0.5,
        z: (o.th || 0.1) / 2 + 0.06,
        s: 0.25,
        grime: 0.3,
      });
    else
      leafB.box(
        "chrome",
        hingeOff + w * 0.35,
        h * 0.47,
        (o.th || 0.1) / 2 + 0.03,
        0.05,
        0.05,
        0.12,
        { grime: 0.2 },
      );
    if (o.sign)
      leafB.panel(
        "atlas_paint",
        hingeOff,
        h * 0.75,
        (o.th || 0.1) / 2 + 0.012,
        w * 0.7,
        w * 0.26,
        0,
        { rect: o.sign, grime: 0.3 },
      );
    leafB.finish(pivot, { cast: false });
    const c = Math.cos(o.yaw || 0),
      sn = Math.sin(o.yaw || 0);
    pivot.position.set(
      o.x - (o.mode === "hinge" ? (c * w) / 2 : 0),
      o.y,
      o.z + (o.mode === "hinge" ? (sn * w) / 2 : 0),
    );
    pivot.rotation.y = o.yaw || 0;
    (o.parent || (rec && rec.interiorRoot) || G.scene).add(pivot);
    if (o.lock)
      K.lockReg(Object.assign({ kind: "door", label: o.label }, o.lock));
    const isLocked = () =>
      !!o.lock &&
      !g.opened &&
      !(K.locksLive() && G.locks.isOpen && G.locks.isOpen(o.lock.id));
    const g = { id: o.id, o, pivot, collider: null, opened: false, t: 0 };
    const addCol = () => {
      if (!g.collider)
        g.collider = G.world.addCollider(
          o.x,
          o.z,
          w,
          0.3,
          o.y,
          o.y + h,
          -(o.yaw || 0),
          { surface: "metal", tag: "gate" },
        );
    }; // o.y is absolute
    addCol();
    g.close = function () {
      g.opened = false;
      g.t = 0;
      pivot.rotation.y = o.yaw || 0;
      pivot.position.y = o.y;
      addCol();
    };
    g.open = function (instant) {
      if (g.opened) return;
      g.opened = true;
      if (o.lock) {
        try {
          if (K.locksLive() && G.locks.unlock) G.locks.unlock(o.lock.id);
        } catch (e) {
          /* locks module */
        }
      }
      if (g.collider) {
        G.world.removeCollider(g.collider);
        g.collider = null;
      }
      A.state["gate_" + o.id] = 1;
      if (instant) g.t = 1;
      else {
        try {
          G.sfx.play(o.sound || "door_open", {
            pos: new THREE.Vector3(o.x, o.y + 1, o.z),
          });
        } catch (e) {
          /* ignore */
        }
      }
      if (!instant && o.onOpen) {
        try {
          o.onOpen();
        } catch (e) {
          G.reportError("poi_midtown:gate", e);
        }
      }
    };
    g.interactable = G.world.addInteractable({
      pos: new THREE.Vector3(o.x, o.y + 1.2, o.z),
      radius: Math.max(0.9, w * 0.6),
      priority: 1,
      label: o.label || "Door",
      verb: () => (isLocked() ? "Unlock" : "Open"),
      locked: () => (isLocked() ? o.lockLabel || "Locked" : null),
      enabled: () => !g.opened,
      onInteract() {
        if (g.opened) return;
        if (isLocked()) {
          if (!K.locksLive() && !(o.lock.key && K.inv.count(o.lock.key) > 0)) {
            try {
              G.sfx.play("door_locked");
            } catch (e) {
              /* */
            }
            K.say(o.lockMsg || "This door is locked.");
            return;
          }
          K.lockOpen(o.lock, () => g.open());
          return;
        }
        g.open();
      },
    });
    A.gates[o.id] = g;
    return g;
  };
  K.openGate = function (id, instant) {
    const g = A.gates[id];
    if (g) g.open(instant);
  };
  A.updateGates = function (dt) {
    for (const id in A.gates) {
      const g = A.gates[id];
      if (!g.opened || g.t >= 1) continue;
      g.t = Math.min(1, g.t + dt * 1.2);
      const e = g.t * g.t * (3 - 2 * g.t);
      if (g.o.mode === "lift" || g.o.mode === "slide")
        g.pivot.position.y = g.o.y + e * ((g.o.h || 2.2) - 0.2);
      else g.pivot.rotation.y = (g.o.yaw || 0) + e * (g.o.swing || -1.6);
    }
  };
  A.resetGates = function () {
    for (const id in A.gates) A.gates[id].close();
  };
  A.restoreGates = function () {
    for (const id in A.gates)
      if (A.state["gate_" + id]) {
        A.gates[id].open(true);
        A.gates[id].t = 0.999;
      }
  };
  /** Helper: clone an existing item def (e.g. a weapon) into a unique variant at initDone. */
  K.uniqueFrom = function (baseId, over) {
    return function () {
      if (G.isStub("items") || !G.items.get) return null;
      const base = G.items.get(baseId);
      if (!base) return null;
      const d = JSON.parse(
        JSON.stringify(base, (k, v) =>
          typeof v === "function" ? undefined : v,
        ),
      );
      // keep function members of the base (e.g. apply hooks) by reference
      for (const k in base) if (typeof base[k] === "function") d[k] = base[k];
      const o = typeof over === "function" ? over(d, base) : over;
      for (const k in o) {
        if (
          o[k] &&
          typeof o[k] === "object" &&
          !Array.isArray(o[k]) &&
          d[k] &&
          typeof d[k] === "object"
        )
          d[k] = Object.assign({}, d[k], o[k]);
        else d[k] = o[k];
      }
      return d;
    };
  };
  /** Quest helpers (guarded). */
  K.q = {
    active: (id) => {
      try {
        return !G.isStub("quests") && G.quests.isActive(id);
      } catch (e) {
        return false;
      }
    },
    done: (id) => {
      try {
        return !G.isStub("quests") && G.quests.isComplete(id);
      } catch (e) {
        return false;
      }
    },
    started: (id) => {
      try {
        return (
          !G.isStub("quests") &&
          (G.quests.isStarted
            ? G.quests.isStarted(id)
            : G.quests.isActive(id) || G.quests.isComplete(id))
        );
      } catch (e) {
        return false;
      }
    },
    stage: (id) => {
      try {
        return G.isStub("quests") ? null : G.quests.stage(id);
      } catch (e) {
        return null;
      }
    },
    start: (id) => {
      try {
        if (!G.isStub("quests") && !K.q.started(id)) G.quests.start(id);
      } catch (e) {
        G.reportError("poi_midtown:quest start", e);
      }
    },
    set: (id, st) => {
      try {
        if (!G.isStub("quests")) G.quests.setStage(id, st);
      } catch (e) {
        G.reportError("poi_midtown:quest stage", e);
      }
    },
    complete: (id) => {
      try {
        if (!G.isStub("quests") && !K.q.done(id)) G.quests.complete(id);
      } catch (e) {
        G.reportError("poi_midtown:quest complete", e);
      }
    },
    flag: (n) => {
      try {
        return G.isStub("quests") ? A.state["f_" + n] : G.quests.flag(n);
      } catch (e) {
        return undefined;
      }
    },
    setFlag: (n, v) => {
      try {
        if (G.isStub("quests")) A.state["f_" + n] = v;
        else G.quests.setFlag(n, v);
      } catch (e) {
        /* ignore */
      }
    },
  };
  K.inv = {
    count: (id) => {
      try {
        return G.isStub("inventory") ? 0 : G.inventory.count(id) || 0;
      } catch (e) {
        return 0;
      }
    },
    add: (id, n, o) => {
      try {
        if (!G.isStub("inventory")) G.inventory.add(id, n || 1, o);
      } catch (e) {
        /* ignore */
      }
    },
    remove: (id, n) => {
      try {
        if (!G.isStub("inventory")) G.inventory.remove(id, n || 1);
      } catch (e) {
        /* ignore */
      }
    },
    scrip: () => {
      try {
        return G.isStub("inventory")
          ? 0
          : G.inventory.scrip
            ? G.inventory.scrip()
            : G.inventory.count("scrip");
      } catch (e) {
        return 0;
      }
    },
    addScrip: (n) => {
      try {
        if (G.isStub("inventory")) return 0;
        return G.inventory.addScrip
          ? G.inventory.addScrip(n)
          : n > 0
            ? G.inventory.add("scrip", n)
            : G.inventory.remove("scrip", -n);
      } catch (e) {
        return 0;
      }
    },
  };
  K.xp = (n, why) => {
    try {
      if (!G.isStub("rpg")) G.rpg.addXP(n, why);
    } catch (e) {
      /* ignore */
    }
  };
  K.standing = (n, why) => {
    try {
      if (!G.isStub("rpg")) G.rpg.addStanding(n, why);
    } catch (e) {
      /* ignore */
    }
  };
  K.say = (text) => {
    try {
      G.notify(text);
    } catch (e) {
      /* ignore */
    }
  };
  K.news = (text) => {
    try {
      if (!G.isStub("radio") && G.radio.addNews) G.radio.addNews(text);
    } catch (e) {
      /* ignore */
    }
  };
})();
