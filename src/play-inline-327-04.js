// play-inline-327 04 — advance
// Lines 1632-1639 of readable/play-inline-327.pretty.js (statement-aligned).
  G.events.on("itemAdded", (id) => {
    if (id === "pch_royal_jelly")
      PF.q.advance("pch_sweet", ["talk", "factory", "queen"], "return");
  });
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "pch_nb_queen")
      PF.q.advance("pch_sweet", ["talk", "factory"], "queen");
  });
