// play-inline-76 06 — tofixed
// Lines 1015-1062 of readable/play-inline-76.pretty.js (statement-aligned).
  RL.lightsInfo = () => ({
    patched: !!R.vlPatched,
    on: enabled && U.nrcVL.value.x > 0.5,
    perTile: VL.PER,
    candidates: S.cands,
    selected: S.sel,
    tilesUsed: S.tilesUsed,
    maxPerTile: S.maxTile,
    gatherMs: S.gatherMs,
    suppressed: S.supp,
    sources: S.sources,
    tracked: {
      glows: glows.length,
      fixtures: fixtures.length,
      api: apiLights.length,
      glowField: !!glowField,
      pool: poolLights ? poolLights.length : 0,
      combat: trans.length,
      combatTotal: S.transTotal | 0,
    },
  });
  /** debug: the selected lights (nearest first) */
  RL.lightsList = (n) =>
    sel.slice(0, n || 20).map((c, k) => ({
      col: [
        VL.data[(VL.TW + k) * 4],
        VL.data[(VL.TW + k) * 4 + 1],
        VL.data[(VL.TW + k) * 4 + 2],
      ].map((v) => +v.toFixed(2)),
      night: +night.toFixed(2),
      x: +c.x.toFixed(1),
      y: +c.y.toFixed(1),
      z: +c.z.toFixed(1),
      range: +c.range.toFixed(1),
      i: +c.i.toFixed(2),
      cone: c.cone,
      fire: !!c.fire,
    }));

  R.addSystem({
    name: "lights",
    order: 50,
    init,
    late,
    dispose() {
      U.nrcVL.value.x = 0;
    },
  });
