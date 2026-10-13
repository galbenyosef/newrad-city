// play-inline-150 04 — key
// Lines 860-901 of readable/play-inline-150.pretty.js (statement-aligned).
  function parapet(S, x0, z0, x1, z1, y, key) {
    const t = 0.45,
      h = 1.1;
    S.b.box(key, x0, y, z0, x1, y + h, z0 + t);
    S.b.box(key, x0, y, z1 - t, x1, y + h, z1);
    S.b.box(key, x0, y, z0, x0 + t, y + h, z1);
    S.b.box(key, x1 - t, y, z0, x1, y + h, z1);
    S.b.box(
      key,
      x0 - 0.1,
      y + h,
      z0 - 0.1,
      x1 + 0.1,
      y + h + 0.15,
      z0 + t + 0.1,
      { seg: false },
    );
    S.b.box(
      key,
      x0 - 0.1,
      y + h,
      z1 - t - 0.1,
      x1 + 0.1,
      y + h + 0.15,
      z1 + 0.1,
      { seg: false },
    );
  }
  P.parapet = parapet;

  // ===================================================================
  // Registration: right after the exterior is built, 10_amnh_interior.js
  // (P.interiorBuilders.amnh) builds the interior cell, the street<->interior doors
  // and registers the G.pois entry (see P.finishSite in 00_kit.js).
  // ===================================================================
  P.addBuilder(
    "amnh",
    function () {
      P.finishSite("amnh", buildExterior());
    },
    10,
  );
