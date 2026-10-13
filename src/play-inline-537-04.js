// play-inline-537 04 — state
// Lines 869-971 of readable/play-inline-537.pretty.js (statement-aligned).
  AR.deserialize = function (d) {
    const S = freshState();
    if (d && typeof d === "object") {
      const set = (a, valid) =>
        new Set(
          (Array.isArray(a) ? a : []).filter(
            (x) => typeof x === "string" && (!valid || valid(x)),
          ),
        );
      S.minis = set(d.minis, (x) => AR.MINIS.some((g) => g.id === x));
      S.keys = set(d.keys, (x) => !!AR.keyDef(x));
      S.cabinets = set(d.cabinets, (x) => !!AR.cabinetDef(x));
      S.rewards = set(d.rewards);
      S.champion = set(d.champion);
      S.records = set(d.records, (x) => !!AR.gameDef(x));
      if (d.scores && typeof d.scores === "object") {
        for (const k in d.scores)
          if (AR.gameDef(k) && Array.isArray(d.scores[k])) {
            S.scores[k] = d.scores[k]
              .filter((e) => e && isFinite(e.score))
              .slice(0, 5)
              .map((e) => ({
                score: Math.floor(e.score),
                name: String(e.name || "").slice(0, 12),
                day: e.day | 0,
              }));
          }
      }
      if (d.plays && typeof d.plays === "object")
        for (const k in d.plays) S.plays[k] = d.plays[k] | 0;
    }
    AR.STATE = S;
  };

  // ------------------------------------------------------------------
  // Public namespace
  // ------------------------------------------------------------------
  G.arcade = {
    _: AR,
    play: (id, opts) => (AR.ui ? AR.ui.play(id, opts) : false),
    open: (tab) => (AR.ui ? AR.ui.open(tab) : false),
    close: () => (AR.ui ? AR.ui.close() : false),
    toggle: () =>
      AR.ui ? (AR.ui.isOpen() ? AR.ui.close() : AR.ui.open()) : false,
    isOpen: () => !!(AR.ui && AR.ui.isOpen()),
    games: () =>
      AR.GAME_DEFS.map((g) => ({
        id: g.id,
        title: g.title,
        discovered: AR.discovered(g.id),
        best: AR.best(g.id),
        houseRecord: AR.houseRecord(g.id),
        record: AR.STATE.records.has(g.id),
        champion: AR.STATE.champion.has(g.id),
      })),
    highScores: (id) => AR.board(id),
    houseRecord: (id) => AR.houseRecord(id),
    cabinets: () =>
      AR.world
        ? AR.world.entries
            .filter((e) => e.kind === "cabinet")
            .map((e) => ({
              id: e.id,
              game: e.game,
              style: e.style,
              area: e.area,
              x: e.x,
              z: e.z,
            }))
        : [],
    collect: (kind, id) => AR.collect(kind, id),
    collectibles: () => ({
      minis: {
        found: AR.STATE.minis.size,
        total: AR.MINIS.length,
        list: AR.MINIS.map((g) => ({
          id: g.id,
          name: g.name,
          found: AR.STATE.minis.has(g.id),
        })),
      },
      keys: {
        found: AR.STATE.keys.size,
        total: AR.KEYS.length,
        vault: AR.vaultOpen(),
        list: AR.KEYS.map((q) => ({
          id: q.id,
          no: q.no,
          year: q.year,
          who: q.who,
          area: q.area,
          site: q.site,
          found: AR.STATE.keys.has(q.id),
        })),
      },
      cabinets: { found: AR.STATE.cabinets.size, total: AR.CABINETS.length },
    }),
    stats: () => ({
      state: AR.serialize(),
      allTime: AR.allTime,
      placed: AR.world ? AR.world.placedCount() : 0,
    }),
  };
