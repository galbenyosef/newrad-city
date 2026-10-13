// play-inline-424 04 — hour
// Lines 1089-1102 of readable/play-inline-424.pretty.js (statement-aligned).
  PA.setHands = function (hour) {
    if (!PA.handMeshes) return;
    const hh = ((hour % 12) / 12) * PI * 2,
      mm = (hour % 1) * PI * 2;
    for (const p of PA.handMeshes) {
      p.h.rotation.z = -hh;
      p.m.rotation.z = -mm;
    }
  };

  // ------------------------------------------------------------------
  // Fireboat: hull (bow/transom), wheelhouse, deckhouse, monitor tower, masts
  // built in boat-local coords (length along z, bow +z), placed by a pitched/rolled group
  // ------------------------------------------------------------------
