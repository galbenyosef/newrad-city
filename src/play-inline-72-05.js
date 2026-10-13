// play-inline-72 05 — near
// Lines 1025-1096 of readable/play-inline-72.pretty.js (statement-aligned).
  function dispose() {
    const sun = sunLight();
    if (sun) sun.shadow.autoUpdate = true;
    U.nrcCsm.value.x = 0;
    U.nrcCsm3.value.w = 0;
    setNearCast(false);
    if (near && S.inMode) {
      try {
        leaveInterior();
      } catch (e) {
        /* ignore */
      }
    }
    if (near) {
      near.shadow.autoUpdate = false;
      if (near.shadow.map) {
        near.shadow.map.dispose();
        near.shadow.map = null;
      }
    }
    S.active = false;
  }
  R.disposeCascade = dispose;

  /** Enable/disable the near cascade (persisted per viewer). Disabling frees the map at once;
   *  the carrier light (and its shader cost) only goes away on the next load. */
  RL.setCascades = function (on) {
    RL.cascades = !!on;
    try {
      localStorage.setItem("nrc_rl_cascades", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (!on) dispose();
  };
  RL.cascadeInfo = () => ({
    active: S.active,
    skipped: !!S.skipped,
    tier: S.tier,
    size: S.size,
    extent: S.extent,
    orderOk: S.orderOk,
    overcast: +(S.oc || 0).toFixed(2),
    nearCasters: nearCasters.length,
    clutterTris: S.clutterTris,
    clutterMaxTris: S.clutterMaxTris,
    clutterInBox: S.clutterIn,
    clutterActive: active.length,
    clutterUsedTris: Math.round(S.clutterUsed),
    clutterBudget: Math.round(S.budget),
    frameTrisFar: Math.round(S.tFar),
    frameTrisNear: Math.round(S.tNear),
    mapMB: S.size ? +((S.size * S.size * 8) / 1048576).toFixed(1) : 0,
    passes: {
      far: S.nFar,
      near: S.nNear,
      headroom: !!S.both,
      avgMs: +((S.avgDt || 0) * 1000).toFixed(1),
    },
    interior: {
      on: !!S.inMode,
      cell: inKey,
      cut: S.inCut,
      collected: S.inCollected,
      casters: S.inCasters,
      tris: S.inTris,
      inBox: S.inCand,
    },
    far: G.atmos && G.atmos.shadowInfo ? G.atmos.shadowInfo() : null,
  });

  R.addSystem({ name: "cascade", order: 10, init, late, dispose });
