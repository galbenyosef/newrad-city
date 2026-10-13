// play-inline-173 03 — gates
// Lines 367-651 of readable/play-inline-173.pretty.js (statement-aligned).
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
