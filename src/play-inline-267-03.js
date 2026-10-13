// play-inline-267 03 — open
// Lines 376-398 of readable/play-inline-267.pretty.js (statement-aligned).
  function syncVault() {
    if (!VD.door) return;
    let open = false;
    try {
      open = !G.isStub("locks") && G.locks.isOpen(LOCK.id);
    } catch (e) {
      open = false;
    }
    VD.door.rotation.y = open ? -1.85 : 0; // swung out into the cellar
    VD.keys.visible = open;
    VD.glow.visible = open;
  }
  P.vault = { sync: syncVault, items: ITEMS, lock: LOCK };
  G.events.on("lockOpened", (id) => {
    if (id === LOCK.id) syncVault();
  });
  P.onReady.push(syncVault);
  P.onNewGame.push(syncVault);
  P.onLoaded.push(syncVault);

  // ------------------------------------------------------------------
  // Build: cellar + strongroom in the Gracie cell, and the doors
  // ------------------------------------------------------------------
