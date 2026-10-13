// play-inline-211 11 — locks
// Lines 2943-3097 of readable/play-inline-211.pretty.js (statement-aligned).
  PH.item = (...ids) => {
    for (const id of ids) if (PH.itemExists(id)) return id;
    return null;
  };

  /** Invisible door blocker collider that exists while flag is NOT set (checked by the update loop). */
  PH.blockers = [];
  PH.lockBlocker = function (flag, x, z, w, d, y0, y1) {
    PH.blockers.push({ flag, x, z, w, d, y0, y1, col: null });
  };
  PH.updateBlockers = function () {
    for (const bl of PH.blockers) {
      const want = !PH.flag(bl.flag);
      if (want && !bl.col) {
        try {
          bl.col = G.world.addCollider(
            bl.x,
            bl.z,
            bl.w,
            bl.d,
            bl.y0,
            bl.y1,
            0,
            { tag: "poi_harbor_door", walkable: false },
          );
        } catch (e) {
          /* */
        }
      } else if (!want && bl.col) {
        try {
          G.world.removeCollider(bl.col);
        } catch (e) {
          /* */
        }
        bl.col = null;
      }
    }
  };

  // Quest-state flags (our own, saved with the module)
  PH.flags = {};
  PH.flag = (k) => PH.flags[k];
  PH.setFlag = (k, v) => {
    PH.flags[k] = v === undefined ? true : v;
  };

  // ---- locks: keys, codes and passcodes (G.locks; specs registered at initDone) ----
  PH._locks = [];
  PH._learnSrc = [];
  PH._keySrc = [];
  PH._locksLive = false;
  const regNow = (sp) => {
    if (!G.isStub("locks") && G.locks.register) {
      try {
        G.locks.register(sp);
      } catch (e) {
        G.reportError("poi_harbor:lock " + sp.id, e);
      }
    }
  };
  /** Declare a lock spec {id, label, key?, code?, passcode?, hint}; returns the spec (pass it inline as `lock:`). */
  PH.regLock = function (sp) {
    if (!sp || !sp.id) return sp;
    if (!PH._locks.some((x) => x.id === sp.id)) PH._locks.push(sp);
    if (PH._locksLive) regNow(sp);
    return sp;
  };
  PH.lockSpec = (id) => PH._locks.find((x) => x.id === id) || null;
  PH.learn = function (lockId) {
    if (!G.isStub("locks") && G.locks.learn) {
      try {
        G.locks.learn(lockId);
      } catch (e) {
        G.reportError("poi_harbor:learn " + lockId, e);
      }
    }
  };
  /** Declare (for G.locks.audit) where a code is learned / a key is handed over by script. */
  PH.learnFrom = (lockId, label) => {
    PH._learnSrc.push([lockId, label]);
    if (PH._locksLive && !G.isStub("locks") && G.locks.learnableFrom)
      PH.safe("learnsrc", () => G.locks.learnableFrom(lockId, label));
  };
  PH.keyFrom = (itemId, label) => {
    PH._keySrc.push([itemId, label]);
    if (PH._locksLive && !G.isStub("locks") && G.locks.obtainableFrom)
      PH.safe("keysrc", () => G.locks.obtainableFrom(itemId, label));
  };
  PH.lockIsOpen = (id) => {
    try {
      return !G.isStub("locks") && G.locks.isOpen
        ? !!G.locks.isOpen(id)
        : false;
    } catch (e) {
      return false;
    }
  };
  /** Interact with a lock: G.locks handles key / keypad / passcode; key-only fallback while the registry is absent. */
  PH.lockOpen = function (sp, onOpen) {
    if (typeof sp === "string") sp = PH.lockSpec(sp) || { id: sp };
    if (!G.isStub("locks") && G.locks.open) {
      try {
        G.locks.open(sp, onOpen);
      } catch (e) {
        G.reportError("poi_harbor:lockOpen " + sp.id, e);
      }
      return;
    }
    if (sp.key && PH.hasItem(sp.key)) {
      onOpen();
      return;
    }
    PH.sfx("door_locked");
    G.notify("Locked.");
  };
  /** "Read" interactable that teaches a code (deferred to initDone; LOCAL coords like PH.readAt). */
  PH.readLearnAt = function (x, y, z, title, text, lockId) {
    const p = PH.wv(x, y, z);
    PH.learnFrom(lockId, "readable: " + title);
    PH.onReady.push(() => {
      try {
        G.world.addInteractable({
          pos: p,
          radius: 0.7,
          label: title,
          verb: "Read",
          range: 2.6,
          onInteract() {
            G.notify(title + " — " + text, { duration: 10 });
            PH.sfx("ui_click");
            PH.learn(lockId);
          },
        });
      } catch (e) {
        /* */
      }
    });
  };
  G.events.on("initDone", () => {
    PH._locksLive = true;
    PH._locks.forEach(regNow);
    if (G.isStub("locks")) return;
    for (const [id, l] of PH._learnSrc)
      PH.safe(
        "learnsrc",
        () => G.locks.learnableFrom && G.locks.learnableFrom(id, l),
      );
    for (const [it, l] of PH._keySrc)
      PH.safe(
        "keysrc",
        () => G.locks.obtainableFrom && G.locks.obtainableFrom(it, l),
      );
  });

  PH.U = U;
