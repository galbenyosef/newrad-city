// play-inline-192 02 — code
// Lines 27-74 of readable/play-inline-192.pretty.js (statement-aligned).
  const PV = G._pv;
  const K = PV.kit;

  // ---- locks (G.locks): both combinations are on the management teletype in the office ----
  const LK = {
    safe: K.regLock({
      id: "pv_lk_vv_safe",
      label: "Vanguard Club Safe",
      kind: "safe",
      code: "1935",
      hint: "The management teletype in the office lists the combination.",
      learnedFrom: "Vanguard management teletype",
    }),
    reserve: K.regLock({
      id: "pv_lk_vv_reserve",
      label: "Mags's Reserve Chest",
      kind: "container",
      code: "0529",
      hint: "Mags's notes on the management teletype give the reserve chest's combination.",
      learnedFrom: "Vanguard management teletype (Mags's notes)",
    }),
  };
  const PI = Math.PI,
    HP = PI / 2;

  // exterior wedge (world)
  const A = [-51, 320],
    B = [-51, 347],
    C = [-78, 347];
  const H = 8.6;
  const DOOR_Z = 324.2;
  // interior (local)
  const FY = -4.2,
    CY = -1.2; // club floor / ceiling
  const WL = [
    [-9, -10],
    [-2.5, -28],
  ]; // left wall A→B
  const WR = [
    [9, -10],
    [2.5, -28],
  ]; // right wall
  const CELLAR = -7.6;
  const STAGE_Y = FY + 0.35;

  // ==================================================================
  // EXTERIOR
  // ==================================================================
