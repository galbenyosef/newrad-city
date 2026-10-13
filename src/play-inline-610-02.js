// play-inline-610 02 — pending
// Lines 305-375 of readable/play-inline-610.pretty.js (statement-aligned).
  H.part({
    name: "levelup",
    order: 60,
    init() {
      build();
      G.events.on("keydown", onKey);
      G.events.on("levelUp", () => {
        if (R()) LV.pending = true;
      });
      G.events.on("reset", () => {
        LV.pending = false;
        if (LV.open) close();
      });
      G.events.on("state", (s) => {
        if (s !== "levelup" && LV.open) {
          // something else took over (cheat menu, death, quit): hide, and re-arm while picks remain
          LV.open = false;
          LV.host.clear();
          LV.el.style.display = "none";
          if (anythingOwed()) LV.pending = true;
        }
      });
      G.events.on("loaded", () => {
        LV.pending = false;
        LV.recheck = 2;
      });
    },
    update(dt, realDt) {
      // review hook (screenshots only): ?state=levelup opens the readout even with nothing owed
      if (G.SHOT && G.state === "levelup" && !LV.open && !LV.shotDone) {
        LV.shotDone = true;
        const to = Number(G.QS && G.QS.get("levelTo")) || 0; // &levelTo=N: a real promotion for the shot
        if (to > 1 && R() && typeof R().addXP === "function") {
          try {
            R().addXP(
              Math.max(0, R().xpForLevel(to) - (R().xp || 0)),
              "review",
            );
          } catch (e) {
            /* ignore */
          }
        }
        open(true);
      }
      if (LV.open) return;
      if (G.SMOKE) {
        LV.pending = false;
        return;
      } // the smoke playthrough never stops for menus
      // safety net: picks the progression module reports that no pending flag knows about (old save, lost screen)
      LV.recheck = (LV.recheck || 0) - (realDt || 0);
      if (!LV.pending && LV.recheck <= 0) {
        LV.recheck = 4;
        if (G.state === "play" && R() && anythingOwed()) LV.pending = true;
      }
      if (!LV.pending) return;
      if (
        G.state === "play" &&
        H.prevState === "play" &&
        H.stateAge > 1.2 &&
        !H.combatActive() &&
        G.player.alive
      )
        open();
    },
  });

  G.hud.openLevelUp = function () {
    if (R()) open();
  };
  G.hud.levelUpPending = () => LV.pending || (!!R() && anythingOwed());
