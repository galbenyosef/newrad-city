// play-inline-208 09 — quests
// Lines 3833-3846 of readable/play-inline-208.pretty.js (statement-aligned).
  G.events.on("itemAdded", (id) => {
    if (id === "pf_reel_cal") {
      PF.setFlag("sp_cal", true);
      try {
        if (PF.live("quests") && G.quests.refresh) G.quests.refresh("pf_deep");
      } catch (e) {
        /* optional */
      }
    }
  });

  // ===================================================================
  // BUILDER
  // ===================================================================
