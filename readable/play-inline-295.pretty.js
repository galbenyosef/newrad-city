/* src/poi_midtown2/08_locks.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 2 — 08_locks.js
 * Every lock in the module (G.locks specs), defined before the site files
 * that use them. Each unlock is placed in this module's content:
 *   pm2_alg_207          key pm2_alg_key207  (Case gives it with the lost-cat job)
 *   pm2_alg_204          key pm2_alg_key204  (the Algonquin front-desk register)
 *   pm2_alg_safe         code 7113   Rex's stock sheet (in Rex's stock crate, room 204)
 *   pm2_moma_storage     key pm2_moma_key (the Critic wears it) — or the curators' teletype release
 *   pm2_term_moma_curator passcode NOCTURNE  the MoMA audio-guide tape reel (stop 12)
 *   pm2_moma_safe        code 1929   the curators' teletype
 *   pm2_term_morgan      passcode BELLE  Archivist Park tells you (Algonquin)
 *   pm2_morgan_vault     code 120437, or the index card pm2_morgan_combo (Director's North Room)
 *   pm2_morgan_safe      code 1906   the Director's teletype
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G._pm2) return;
  const PM = G._pm2;
  PM.LOCKS = {
    alg_207: {
      id: "pm2_alg_207",
      label: "Room 207",
      kind: "door",
      key: "pm2_alg_key207",
      hint: "Case Fairweather gives you his spare key.",
      keyFrom: "dialogue: Case (Algonquin front desk)",
    },
    alg_204: {
      id: "pm2_alg_204",
      label: "Room 204 — Storage",
      kind: "door",
      key: "pm2_alg_key204",
      hint: "Rex leaves his key in the front-desk register.",
    },
    alg_safe: {
      id: "pm2_alg_safe",
      label: "Rex's Strongbox",
      kind: "safe",
      code: "7113",
      hint: "Rex's stock sheet, in the crate in room 204.",
    },
    moma_storage: {
      id: "pm2_moma_storage",
      label: "MoMA Collection Storage",
      kind: "door",
      key: "pm2_moma_key",
      hint: "The Critic wears the registrar's key; the curators' teletype can release the door.",
      keyFrom: "NPC: the Critic (MoMA)",
    },
    moma_term: {
      id: "pm2_term_moma_curator",
      label: "MoMA Curatorial Network",
      kind: "terminal",
      passcode: "NOCTURNE",
      hint: "The audio-guide tape reel, stop 12.",
    },
    moma_safe: {
      id: "pm2_moma_safe",
      label: "Registrar's Safe",
      kind: "safe",
      code: "1929",
      hint: "The curators' teletype.",
    },
    morgan_term: {
      id: "pm2_term_morgan",
      label: "Morgan Library — Director's Teletype",
      kind: "terminal",
      passcode: "BELLE",
      hint: "Archivist Park at the Algonquin knows it.",
    },
    morgan_vault: {
      id: "pm2_morgan_vault",
      label: "Morgan's Private Vault",
      kind: "door",
      code: "120437",
      key: "pm2_morgan_combo",
      hint: "The combination card in the Director's North Room.",
    },
    morgan_safe: {
      id: "pm2_morgan_safe",
      label: "Mr. Morgan's Safe",
      kind: "safe",
      code: "1906",
      hint: "The Director's teletype.",
    },
  };
  for (const k in PM.LOCKS) PM.lockReg(PM.LOCKS[k]);
})();
