// play-inline-295 02 — hint
// Lines 20-89 of readable/play-inline-295.pretty.js (statement-aligned).
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
