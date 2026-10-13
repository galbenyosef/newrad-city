// play-inline-511 09 — delayed
// Lines 2549-2618 of readable/play-inline-511.pretty.js (statement-aligned).
  C.computeDetection = function (dt) {
    detT -= dt;
    if (detT > 0) return;
    detT = 0.15;
    let danger = false,
      caution = 0;
    for (const a of C.list) {
      if (a.dead || !a.inScene || !a.hostile()) continue;
      if (a.distToPlayer() > 160) continue;
      if (a.state === "combat" && a.target === "player") {
        danger = true;
        break;
      }
      if (a.state === "search" || a.awareness > 0.2)
        caution = Math.max(caution, a.awareness);
    }
    detMax = danger ? 1 : caution;
    const prev = detVal;
    detVal = danger ? "danger" : caution > 0.2 ? "caution" : "hidden";
    if (prev !== detVal) {
      // sneak-attack stingers
      if (G.player.sneaking && G.state === "play") {
        if (detVal === "danger") C.sfx("sneak_detected", { volume: 0.8 });
        else if (detVal === "caution" && prev === "hidden")
          C.sfx("caution", { volume: 0.5 });
      }
      G.events.emit("detectionChanged", detVal, prev);
    }
  };
  /** 'hidden' | 'caution' | 'danger' — [HIDDEN] / [CAUTION] / [DANGER] */
  CB.detection = () => detVal;
  /** 0..1 how close the nearest hostile is to detecting the player. */
  CB.detectionLevel = () => detMax;

  // ------------------------------------------------------------------
  // Per-frame update pieces (called by 90_main)
  // ------------------------------------------------------------------
  /** Game-time delayed callbacks (scaled dt: frozen in menus, dropped on reset). */
  const delayed = [];
  C.later = function (sec, fn) {
    delayed.push({ t: sec, fn });
  };
  function updateDelayed(dt) {
    for (let i = delayed.length - 1; i >= 0; i--) {
      const d = delayed[i];
      d.t -= dt;
      if (d.t <= 0) {
        delayed.splice(i, 1);
        try {
          d.fn();
        } catch (e) {
          G.reportError("update:combat:delayed", e);
        }
      }
    }
  }
  C.updateCombatFx = function (dt) {
    updateDelayed(dt);
    updateProjectiles(dt);
    updateGibs(dt);
    updateDisints(dt);
    updateTempRads(dt);
    updateBursts(dt);
  };
  C.updateBurn = updateBurn;
  C.clearCombatFx = function () {
    C.clearProjectiles();
    C.clearGibs();
    delayed.length = 0;
  };
