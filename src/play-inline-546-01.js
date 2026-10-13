// play-inline-546 01 — world
// Lines 9-145 of readable/play-inline-546.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const AR = G.arcade._;
  const QS = G.QS || new URLSearchParams(location.search);

  let quiet = false; // true between reset and loaded/newGame (item events from restoring inventories)

  function onItemAdded(id) {
    if (quiet || typeof id !== "string" || id.indexOf("arc_mini_") !== 0)
      return;
    AR.collect("mini", id.slice(9), { fromItem: true });
  }

  G.registerModule({
    name: "arcade",
    order: 57,
    init() {
      AR.defineItems();
      try {
        if (G.input && G.input.bindings && !G.input.bindings.collections)
          G.input.bindings.collections = [AR.KEY];
      } catch (e) {
        /* core */
      }
      G.save.register("arcade", {
        save: () => AR.serialize(),
        load: (d) => {
          AR.deserialize(d);
          if (AR.world) AR.world.refresh();
        },
      });
      G.events.on("reset", () => {
        quiet = true;
        AR.reset();
        if (AR.world) AR.world.refresh();
      });
      G.events.on("newGame", () => {
        quiet = false;
        if (G.SHOT && QS.has("arcAll")) unlockAllForShot();
        if (AR.world) AR.world.refresh();
      });
      G.events.on("loaded", () => {
        quiet = false;
        if (AR.world) AR.world.refresh();
      });
      G.events.on("itemAdded", onItemAdded);
      // screenshot mode: ?state=arcade&arcTab=minis&arcSel=2  |  ?state=arcade&arcGame=skypatrol&arcRun=1&arcSim=20
      G.events.on("state", (s) => {
        if (s === "arcade" && G.SHOT) setTimeout(shotSetup, 0);
      });
    },
    update(dt, realDt) {
      if (G.SHOT && QS.get("arcLook")) shotLook();
      if (G.state === "play") {
        if (G.input.justPressed(AR.KEY) && G.player && G.player.alive) {
          G.input.consume(AR.KEY);
          G.arcade.open();
        }
        if (AR.world) AR.world.update(realDt);
      } else if (G.state === "arcade" && AR.ui) AR.ui.update(realDt);
    },
  });

  // ------------------------------------------------------------------
  // Screenshot helpers
  // ------------------------------------------------------------------
  function unlockAllForShot() {
    const S = AR.STATE;
    for (const c of AR.CABINETS) S.cabinets.add(c.id);
    for (const g of AR.MINIS) S.minis.add(g.id);
    for (let i = 0; i < 9; i++) S.keys.add(AR.KEYS[i].id);
    S.rewards.add("minis4");
    S.rewards.add("minis8");
    S.champion.add("skypatrol");
    S.records.add("skypatrol");
    S.scores.skypatrol = [
      { score: 9450, name: AR.initials(), day: 3 },
      { score: 4900, name: AR.initials(), day: 2 },
    ];
    S.scores.catacomb = [{ score: 1270, name: AR.initials(), day: 2 }];
  }
  /** ?arcLook=kind:id[&arcDist=3&arcAng=0.5] — frame a placed cabinet / collectible (shot mode only; y/pitch from ?shot). */
  function shotLook() {
    if (!AR.world || !G.player || !G.player.teleport) return;
    const p = String(QS.get("arcLook")).split(":");
    const e = AR.world.entry(p[0], p[1]);
    if (!e) return;
    const d = +QS.get("arcDist") || 3,
      a = (+QS.get("arcAng") || 0) + e.root.rotation.y;
    const cx = e.x + Math.sin(a) * d,
      cz = e.z + Math.cos(a) * d;
    const pitch = G.player.pitch;
    G.player.teleport(
      cx,
      G.player.pos.y,
      cz,
      Math.atan2(-(e.x - cx), -(e.z - cz)),
    );
    G.player.pitch = pitch;
  }
  let shotDone = false;
  function shotSetup() {
    if (shotDone) return;
    shotDone = true;
    const UI = AR.ui;
    if (!UI) return;
    if (QS.get("arcTab")) UI.tab = QS.get("arcTab");
    if (QS.get("arcSel")) UI.sel[UI.tab] = +QS.get("arcSel") || 0;
    const game = QS.get("arcGame");
    if (game && AR.games[game]) {
      const cab = AR.world ? AR.world.nearestCabinet(game) : null;
      G.arcade.play(game, { force: true, cabinet: cab });
      if (QS.get("arcRun") === "1") UI.startRun({ demo: true });
      const sim = Math.min(120, +QS.get("arcSim") || 0);
      for (let i = 0; i < sim * 30; i++) UI.update(1 / 30);
    } else UI.render();
  }

  // ------------------------------------------------------------------
  // Scripted self-test (?arcadetest=1). Runs right after initDone (before the
  // engine smoke playthrough) and reports into console + G.errors + #arcadetest-result.
  // ------------------------------------------------------------------
  if (QS.has("arcadetest"))
    G.events.on("initDone", () => {
      try {
        selfTest();
      } catch (e) {
        G.reportError("arcadetest", e);
      }
    });

  function WORLD_SETS() {
    const o = {};
    for (const e of AR.world.entries) o[e.set] = (o[e.set] || 0) + 1;
    o.skeletons = AR.world.entries.filter((e) => e.skeleton).length;
    return o;
  }
