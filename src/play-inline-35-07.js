// play-inline-35 07 — emitter
// Lines 2077-2086 of readable/play-inline-35.pretty.js (statement-aligned).
  S.radioLoad = (d) => {
    if (!d) return;
    R.flags = d.flags || {};
    R.kills = d.kills || {};
    R.newsQueue = d.news || [];
    if (d.station)
      setTimeout(() => tune(d.station, d.at ? { pos: d.at } : null), 500);
  };
  /** How loud the radio is for the player right now (1 = goggles; a distant world radio → ~0). */
  S.radioPresence = () => (!R.on ? 0 : R.emitter ? R.emitter.gainAt() : 1);
