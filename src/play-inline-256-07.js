// play-inline-256 07 — col
// Lines 2235-2301 of readable/play-inline-256.pretty.js (statement-aligned).
  function buildStoreGate(cell, int) {
    const b = PF.batch("bm_gate");
    const g = int.store_gate;
    for (let i = 0; i < 9; i++)
      b.box("iron", g.x - 1.0 + i * 0.25, g.y, g.z, 0.05, 2.8, 0.05, {
        seg: false,
      });
    for (const y of [0.3, 1.4, 2.6])
      b.box("iron", g.x, g.y + y, g.z, 2.2, 0.08, 0.08, { seg: false });
    const grp = b.build(cell.root, { noLOD: true });
    let col = null;
    const close = () => {
      if (!col)
        col = PF.col(g.x, g.z, 2.2, 0.3, g.y, g.y + 2.8, 0, {
          walkable: false,
          surface: "metal",
        });
      grp.visible = true;
    };
    const open = () => {
      if (col) {
        try {
          G.world.removeCollider(col);
        } catch (e) {
          /* core */
        }
        col = null;
      }
      grp.visible = false;
    };
    close();
    const unlock = () => {
      PF.setFlag("bm_store_open", true);
      open();
      PF.sfx("door_open", V3(g.x, g.y + 1, g.z));
    };
    PF.use({
      pos: V3(g.x, g.y + 1.2, g.z + 0.3),
      radius: 1.0,
      range: 2.4,
      label: "Storeroom Gate",
      verb: () => (PF.flag("bm_store_open") ? "Open" : "Unlock"),
      locked: () =>
        PF.flag("bm_store_open") ||
        PF.inv.count("pbr_bm_storekey") > 0 ||
        PF.lockIsOpen(PF.LOCKS.bm_store.id)
          ? null
          : "Locked",
      enabled: () => !PF.flag("bm_store_open"),
      onInteract() {
        if (PF.flag("bm_store_open")) return;
        if (!PF.locksLive() && PF.inv.count("pbr_bm_storekey") <= 0) {
          PF.sfx("door_locked");
          G.notify("The storeroom gate is locked.");
          return;
        }
        PF.lockOpen(PF.LOCKS.bm_store, unlock);
      },
    });
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "bm_store_open") {
        if (PF.flag("bm_store_open")) open();
        else close();
      }
    });
    PF.onReset.push(() => close());
  }
