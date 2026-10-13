/* src/poi_bridges/06_locks.js */
/* =====================================================================
 * NEW RAD CITY — POI BRIDGES — 06_locks.js
 * Every lock in the module (G.locks specs), defined before the site files
 * that use them. Each unlock is placed in this module's content:
 *   pbr_bm_safe   code 5909   the Bridgemarket ledger teletype (Ruth's office)
 *   pbr_bm_store  key pbr_bm_storekey (in the market safe)
 *   pbr_mb_cage   key pbr_mb_cagekey (Ironjaw carries it) — or code 0909, which Tomas tells you from the cage
 *   pbr_mb_hoard  key pbr_mb_cagekey, or code 0909 (Ironjaw's footlocker, same dial)
 * The Pier Works river hatch is one-way (bolted from inside), not a lock.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G._pbr) return;
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
})();
