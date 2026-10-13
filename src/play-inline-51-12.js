// play-inline-51 12 — atmos
// Lines 3023-3049 of readable/play-inline-51.pretty.js (statement-aligned).
  ATMOS.setDynamicResolution = function (on) {
    P.dyn.on = !!on;
    try {
      localStorage.setItem("nrc_dynres", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (!on) {
      P.dyn.dynTier = 0;
      setScale(1);
      setTier();
    }
    return P.dyn.on;
  };
  /** Current scene render scale (0.6..1) — 1 when post-fx is off. */
  ATMOS.renderScale = () => (P.enabled ? P.dyn.fixed || P.dyn.scale : 1);
  /** {scale, avgMs, tier, lodScale, shadow} for debug overlays. */
  ATMOS.perfStats = () => ({
    scale: ATMOS.renderScale(),
    avgMs: +P.dyn.avgMs.toFixed(1),
    tier: ATMOS.perfTier,
    lodScale: ATMOS.lodScale,
    dynres: P.dyn.on,
    shadow: ATMOS.shadowInfo ? ATMOS.shadowInfo() : null,
  });

  A.addSystem({ name: "postfx", order: 90, init, update });
