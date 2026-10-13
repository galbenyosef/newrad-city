// play-inline-191 02 — the
// Lines 33-102 of readable/play-inline-191.pretty.js (statement-aligned).
  const PV = G._pv;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // ---- exterior frame (AUTHORING frame, world units) ----
  // Loop round 1: the building now fills its whole LAYOUT site (x −110..−50, z 47..78 — flush to the building line
  // of 7th / 8th Avenue and 26th / 23rd Street) and is turned 180° (FLIP) so the façade authored here "facing north"
  // stands on WEST 23RD STREET (the site's south side, z = 78) as in NYC; the old front faced 26th Street.
  // Everything built by the exterior builder is flipped by the kit; world positions made here go through fp().
  const X0 = -110,
    X1 = -50,
    Z0 = 47,
    Z1 = 78;

  // ---- locks (G.locks): every unlock is placed in this file ----
  const LK = {
    hotelSafe: K.regLock({
      id: "pv_lk_chelsea_safe",
      label: "Hotel Safe (Front Office)",
      kind: "safe",
      code: "1884",
      hint: "The front-office teletype gives the combination.",
      learnedFrom: "Hotel Chelsea front-office teletype",
    }),
    storage: K.regLock({
      id: "pv_lk_chelsea_storage",
      label: "Laundry Storage Locker",
      kind: "container",
      code: "4119",
      hint: "Stanley's laundry complaint, pinned over Tub #2, ends with the combination.",
      learnedFrom: "Laundry Complaint (third floor)",
    }),
    strongbox: K.regLock({
      id: "pv_lk_chelsea_strongbox",
      label: "Moretz's Strongbox",
      kind: "safe",
      code: "311896",
      hint: "Moretz's sketchbook in the penthouse ends with his birthday.",
      learnedFrom: "Moretz's Sketchbook (penthouse)",
    }),
    penthouse: K.regLock({
      id: "pv_lk_chelsea_penthouse",
      label: "Penthouse — A. Moretz",
      kind: "door",
      key: "pv_key_penthouse",
      hint: "Odile gives Moretz's key for her portrait; Stanley sells the spare for the back rent.",
      keyFrom: [
        "Odile (The Last Portrait reward)",
        "Stanley, front desk (200 scrip back rent)",
      ],
    }),
  };
  const FLIP = { cx: (X0 + X1) / 2, cz: (Z0 + Z1) / 2 };
  const fp = (x, z) => ({ x: 2 * FLIP.cx - x, z: 2 * FLIP.cz - z });
  const GF = 5.0,
    FH = 3.3,
    NF = 9; // ground floor, upper floor height, upper floors
  const TOP = GF + NF * FH; // 34.7
  const BAYW = (X1 - X0) / 8; // 8 bays (7.5 m)
  const WIN_OFF = 1.8; // paired windows ± from the bay centre
  const DOOR_X = X0 + BAYW * 3.5; // entrance bay (bay 3) centre (authoring frame)
  const ROOF = { x: -84, y: TOP, z: 66 }; // roof-garden bulkhead door
  // ---- interior levels ----
  const LV = [0, 4.2, 8.4, 12.6];
  const CH = 3.8; // ceiling height

  // ==================================================================
  // EXTERIOR
  // ==================================================================
