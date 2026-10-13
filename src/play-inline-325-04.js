// play-inline-325 04 — the
// Lines 1633-1652 of readable/play-inline-325.pretty.js (statement-aligned).
  PF.hl = PF.hl || {};
  /** A line of fallen plaster / bricks along the collapsed corner and under the portal. */
  function D_rubbleLine(b) {
    for (let i = 0; i < 6; i++)
      PF.dress.rubble(
        b,
        X(-24 + i * 2),
        TRK,
        Z(-22.8),
        0.5 + (i % 3) * 0.2,
        4,
        300 + i,
      );
  }

  // Death flags for every named actor of this module (so they stay dead across saves)
  G.events.on("actorKilled", (a) => {
    if (!a || typeof a.id !== "string" || a.id.indexOf("pch_") !== 0) return;
    PF.setFlag("dead_" + a.id, true);
  });
