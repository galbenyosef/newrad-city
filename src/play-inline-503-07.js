// play-inline-503 07 — mods
// Lines 1937-1998 of readable/play-inline-503.pretty.js (statement-aligned).
  G.save.register("weapons_craft", {
    save: () => ({
      schem: Object.assign({}, S.schem),
      mods: JSON.parse(JSON.stringify(S.mods || {})),
    }),
    load: (d) => {
      S.schem = (d && d.schem) || {};
      S.mods = (d && d.mods) || {};
    },
  });
  G.events.on("reset", () => {
    S.schem = {};
    S.mods = {};
    clearFlying();
    pendingRemove.length = 0;
    if (UI.open) W.closeWorkbench();
  });
  G.events.on("initDone", () => {
    // swallow props' "lack the schematics" line for the workbench call we just handled
    if (typeof G.notify === "function" && !G.notify.__wpnWrapped) {
      const orig = G.notify;
      const wrapped = function (text) {
        if (
          suppressT &&
          performance.now() < suppressT &&
          /lack the schematics/i.test(String(text))
        )
          return;
        return orig.apply(this, arguments);
      };
      wrapped.__wpnWrapped = true;
      G.notify = wrapped;
    }
    placeSchematics();
  });
  /** Per-frame work, called from the weapons module update (90_api). */
  P.craftUpdate = function (dt, realDt) {
    {
      if (pendingRemove.length && invReal()) {
        const list = pendingRemove.splice(0);
        for (const [id, n] of list) {
          try {
            if (count(id) > 0)
              G.inventory.remove(id, Math.min(n, count(id)), { silent: true });
          } catch (e) {
            /* ignore */
          }
        }
      }
      updateFlying(dt);
      updateDots(dt);
      updateClouds(dt);
      updateFires(dt);
      if (UI.open && UI.msgT > 0) {
        UI.msgT -= realDt;
        if (UI.msgT <= 0) {
          UI.msg = "";
          if (UI.msgEl) UI.msgEl.textContent = "";
        }
      }
    }
  };
