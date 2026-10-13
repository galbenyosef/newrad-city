// play-inline-254 02 — hint
// Lines 16-51 of readable/play-inline-254.pretty.js (statement-aligned).
  const PF = G._pbr;
  PF.LOCKS = {
    bm_safe: {
      id: "pbr_bm_safe",
      label: "Bridgemarket Safe",
      kind: "safe",
      code: "5909",
      hint: "The Bridgemarket ledger teletype in Ruth's office.",
    },
    bm_store: {
      id: "pbr_bm_store",
      label: "Storeroom Gate",
      kind: "door",
      key: "pbr_bm_storekey",
      hint: "The stores key is kept in the market safe.",
    },
    mb_cage: {
      id: "pbr_mb_cage",
      label: "Captives' Cage",
      kind: "door",
      key: "pbr_mb_cagekey",
      code: "0909",
      hint: "Ironjaw carries the key; Tomas watched him work the dial.",
      keyFrom: "NPC: Ironjaw (Anchor Pit)",
    },
    mb_hoard: {
      id: "pbr_mb_hoard",
      label: "Ironjaw's Hoard",
      kind: "container",
      key: "pbr_mb_cagekey",
      code: "0909",
      hint: "Same dial as the cage padlock.",
      keyFrom: "NPC: Ironjaw (Anchor Pit)",
    },
  };
  for (const k in PF.LOCKS) PF.lockReg(PF.LOCKS[k]);
