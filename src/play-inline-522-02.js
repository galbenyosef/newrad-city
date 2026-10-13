// play-inline-522 02 — phase
// Lines 355-369 of readable/play-inline-522.pretty.js (statement-aligned).
  K.neonDepot = {
    state: () => ({
      phase: phase(G.time.hour),
      live: !!D.live,
      spots: D.spots,
    }),
    spawnNow: () => {
      const S = spots();
      const ph = phase(G.time.hour);
      spawnAt(
        ph === "park" ? S.park : S.entry,
        ph === "park" ? "park" : "arrive",
      );
    },
  };
