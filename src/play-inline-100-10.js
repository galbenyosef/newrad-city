// play-inline-100 10 — cleared
// Lines 3853-3881 of readable/play-inline-100.pretty.js (statement-aligned).
  M.updateDungeonNames = function () {
    if (G.isStub("combat") || typeof G.combat.isLocationCleared !== "function")
      return;
    const L = G.LAYOUT;
    for (const D of M.dungeons) {
      const ext = D.extId && L.getLocation(D.extId);
      if (!ext) continue;
      let cleared = false;
      try {
        cleared = !!G.combat.isLocationCleared(D.intId);
      } catch (e) {
        cleared = false;
      }
      if (cleared !== !!ext.cleared) {
        ext.cleared = cleared;
        ext.name = cleared ? D.name + " [Cleared]" : D.name;
      }
    }
  };
  M.dungeonVisibility = function (cam, indoor) {
    for (const D of M.dungeons) {
      const root = M.roots["int_" + D.key];
      if (!root) continue;
      root.visible =
        indoor &&
        Math.abs(cam.x - D.origin.x) < 200 &&
        Math.abs(cam.z - D.origin.z) < 200;
    }
  };
