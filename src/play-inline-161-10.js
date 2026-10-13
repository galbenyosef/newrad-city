// play-inline-161 10 — best
// Lines 2784-2946 of readable/play-inline-161.pretty.js (statement-aligned).
  function tickKeys() {
    if (!P.inCell("tiffany") || G.isStub("actors")) {
      keyWait = 0;
      return;
    }
    const list = G.actors.list();
    let holder = null;
    for (const a of list) {
      if (!a || a.group !== "tiffany") continue;
      if (a._puKey) {
        holder = a;
        continue;
      }
      if (a.isBoss || a.name === "Raider Boss") {
        a._puKey = true;
        holder = a;
        try {
          a.inventory = a.inventory || [];
          a.inventory.push(["pu_key_tiffany_vault", 1]);
        } catch (e) {
          /* */
        }
      }
    }
    // Fallback (combat only crowns a boss for gangs of 3+ at level 5+): after 2 s in the cell with no boss,
    // the living raider closest to the throne becomes the Raider Boss and carries the key. Skipped once the
    // key is in the player's pockets or the vault is already open.
    if (holder || F.vaultOpen || has("pu_key_tiffany_vault")) return;
    keyWait += 0.5;
    if (keyWait < 2) return;
    const th = A("tiffany", "boss");
    if (!th) return;
    let best = null,
      bd = 1e9;
    for (const a of list) {
      if (
        !a ||
        a.dead ||
        !a.pos ||
        (a.group !== "tiffany" &&
          !(a.id && String(a.id).indexOf("pu_g_tif") === 0))
      )
        continue;
      if (a.type !== "raider" || a.pos.x < G.LAYOUT.INTERIOR_X_MIN) continue;
      const d = a.pos.distanceToSquared(th);
      if (d < bd) {
        bd = d;
        best = a;
      }
    }
    if (!best) return;
    best._puKey = true;
    best.isBoss = true;
    best.name = "Raider Boss";
    try {
      best.maxHp = Math.round((best.maxHp || 60) * 1.5);
      best.hp = best.maxHp;
      best.inventory = best.inventory || [];
      best.inventory.push(["pu_key_tiffany_vault", 1]);
    } catch (e) {
      /* */
    }
  }

  // ------------------------------------------------------------------
  // world state from flags (after a load / on reset)
  // ------------------------------------------------------------------
  function resetWorld() {
    const Sd = P.dakotaSealed;
    if (Sd && Sd.open) {
      Sd.open = false;
      Sd.root.visible = true;
      Sd.col = P.readd(Sd.col);
    }
    const g = P.plazaGate;
    if (g && g.open) {
      g.open = false;
      g.root.visible = true;
      g.col = P.readd(g.col);
    }
    const T = P.tiffany;
    if (T && T.open) {
      T.open = false;
      T.leaf.rotation.y = 0;
      T.leafCol = P.readd(T.leafCol);
    }
    if (P.amnhShow) {
      P.amnhShow.powered = true;
      P.amnhShow.active = false;
    }
    if (P.carnegieConcert) P.carnegieConcert.group.visible = false;
    show = null;
    concert = null;
    vaultAnim = 0;
  }
  function applyWorldState() {
    if (F.hollisOpen) C.openHollis(true);
    if (F.presOpen) C.openPresidential(true);
    if (F.vaultOpen) C.openVault(false, true);
    if (P.amnhShow) P.amnhShow.powered = !F.cellTaken;
    if (P.carnegieConcert) P.carnegieConcert.group.visible = !!F.dynamoOn;
  }
  /** Re-add a removed collider with the same box. */
  P.readd = function (c) {
    if (!c) return c;
    if (G.world.colliders.indexOf(c) >= 0) return c;
    return G.world.addCollider(
      c.cx,
      c.cz,
      c.hx * 2,
      c.hz * 2,
      c.minY,
      c.maxY,
      c.yaw,
      { tag: c.tag, surface: c.surface, walkable: c.walkable },
    );
  };

  // ------------------------------------------------------------------
  // lifecycle
  // ------------------------------------------------------------------
  P.onPreReady.push(() => {
    defineItems();
    defineTerminals();
    defineDialogue();
    defineQuests();
  });
  P.onReady.push(() => {
    interactables();
  });
  P.onReset.push(() => {
    resetWorld();
    F = DEF_STATE();
    cryT = 20;
  });
  P.onNewGame.push(() => {
    F = DEF_STATE();
    applyWorldState();
    spawnAll();
  });
  P.onLoaded.push(() => {
    applyWorldState();
    spawnAll();
  });
  let slow = 0;
  P.tick.push((dt, realDt) => {
    tickShow(dt, realDt);
    tickConcert(dt, realDt);
    tickTiffany(dt, realDt);
    slow -= realDt;
    if (slow > 0) return;
    slow = 0.5;
    tickDakota(dt, 0.5);
    tickHaggle();
    tickKeys();
  });
  // Killing the Nanny while hostile / Agnes's quest bookkeeping
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "pu_nanny" && F.nanny !== "rest" && F.nanny !== "agnes") {
      F.nanny = "destroyed";
      if (qActive("pu_nursery")) qSet("pu_nursery", "report");
    }
  });
