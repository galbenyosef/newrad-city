// play-inline-315 09 — ctx
// Lines 4297-4312 of readable/play-inline-315.pretty.js (statement-aligned).
  PH.define({
    id: "hotel_new_yorker",
    name: "Hotel New Yorker",
    interior: "hotel_new_yorker",
    order: 10,
    build(ctx) {
      PH.nyCtx = ctx;
      PH.nyExterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
    reset,
    loaded: applyState,
  });
