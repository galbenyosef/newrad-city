/* src/poi_midtown/06_locks.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 06_locks.js
 * Every lock in the module (G.locks specs), defined before the site and
 * data files that use them. Each unlock is placed in this module's content:
 *   pmid_wa_desk_safe   code 1931       the bell captain's note (Waldorf front desk)
 *   pmid_wa_command     passcode COLUMBIA, or Lt. Dray's signals card (35th floor)
 *   pmid_wa_spares      code 4747       the Continuity command teletype
 *   pmid_wa_major       passcode ROUGHRIDER  Major Vale's orders tape reel
 *   pmid_wa_vale_safe   code 1898       the Major's teletype (its "Wall Safe — Release" also opens it)
 *   pmid_msg_strongbox  code 5700       Ondine's margin note on The Pit's house rules
 *   pmid_penn_ticket_safe code 1910     the stationmaster's teletype
 *   pmid_penn_payroll   key q_pmid_penn_key (the Conductor carries it)
 *   pmid_ml_elev        code 0947       the MetLife security desk teletype (it can also release the car)
 *   pmid_ml_pres_safe   code 1909       the MetLife security desk teletype
 *   pmid_ml_records     key q_pmid_ml_vaultkey (the president's desk)
 *   pmid_ml_prudence    passcode ACTUARY, or the clockwinder's override card (Clock Room)
 *   pmid_bv_pharmacy    code 2016       the Bellevue nurses' station teletype (it can also release the cage)
 *   pmid_bv_narcotics   code 7112       the Bellevue nurses' station teletype
 *   pmid_bv_door        passcode RESILIENCE  the Bellevue nurses' station teletype
 *   pmid_bv_annex       key q_pmid_bv_keycard (the pathologist's coat) — or the door-control teletype override
 *   pmid_bv_lab         passcode HASSELBY  the Annex B door-control teletype
 * Barred one-way doors (Waldorf service car, Bellevue ambulance bay) are not locks.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.PMID || !G.PMID.kit) return;
  const K = G.PMID.kit;
  K.LOCKS = {
    wa_desk_safe: {
      id: "pmid_wa_desk_safe",
      label: "Waldorf Front Desk Safe",
      kind: "safe",
      code: "1931",
      hint: "The bell captain's note on the front desk.",
    },
    wa_command: {
      id: "pmid_wa_command",
      label: "Continuity Forward Command — Teletype",
      kind: "terminal",
      passcode: "COLUMBIA",
      key: "pmid_wa_dray_card",
      hint: "Lt. Dray's signals card, 35th floor.",
    },
    wa_spares: {
      id: "pmid_wa_spares",
      label: "Exo-rig Spares",
      kind: "container",
      code: "4747",
      hint: "The Continuity command teletype.",
    },
    wa_major: {
      id: "pmid_wa_major",
      label: "Maj. C. Vale — Teletype",
      kind: "terminal",
      passcode: "ROUGHRIDER",
      hint: "Major Vale's orders tape reel.",
    },
    wa_vale_safe: {
      id: "pmid_wa_vale_safe",
      label: "Major Vale's Safe",
      kind: "safe",
      code: "1898",
      hint: "The Major's teletype.",
    },
    msg_strongbox: {
      id: "pmid_msg_strongbox",
      label: "Bookie's Strongbox",
      kind: "safe",
      code: "5700",
      hint: "Ondine's margin note on the house rules of The Pit.",
    },
    penn_ticket_safe: {
      id: "pmid_penn_ticket_safe",
      label: "Ticket Office Safe",
      kind: "safe",
      code: "1910",
      hint: "The stationmaster's teletype.",
    },
    penn_payroll: {
      id: "pmid_penn_payroll",
      label: "Broadway Limited Payroll Box",
      kind: "safe",
      key: "q_pmid_penn_key",
      hint: "The Conductor carries the watch key.",
      keyFrom: "NPC: the Conductor (Penn Station)",
    },
    ml_elev: {
      id: "pmid_ml_elev",
      label: "Express Elevator — Clock Room",
      kind: "door",
      code: "0947",
      hint: "The MetLife security desk teletype.",
    },
    ml_pres_safe: {
      id: "pmid_ml_pres_safe",
      label: "President's Wall Safe",
      kind: "safe",
      code: "1909",
      hint: "The MetLife security desk teletype.",
    },
    ml_records: {
      id: "pmid_ml_records",
      label: "Records Vault",
      kind: "door",
      key: "q_pmid_ml_vaultkey",
      hint: "The key lies on the president's desk.",
    },
    ml_prudence: {
      id: "pmid_ml_prudence",
      label: 'Actuarial Engine "Prudence"',
      kind: "terminal",
      passcode: "ACTUARY",
      key: "pmid_ml_prudence_card",
      hint: "The clockwinder's override card in the Clock Room.",
    },
    bv_pharmacy: {
      id: "pmid_bv_pharmacy",
      label: "Pharmacy Cage",
      kind: "door",
      code: "2016",
      hint: "The nurses' station teletype.",
    },
    bv_narcotics: {
      id: "pmid_bv_narcotics",
      label: "Narcotics Locker",
      kind: "safe",
      code: "7112",
      hint: "The nurses' station teletype.",
    },
    bv_door: {
      id: "pmid_bv_door",
      label: "Kessler-Haas Annex B — Door Control",
      kind: "terminal",
      passcode: "RESILIENCE",
      hint: "The nurses' station teletype.",
    },
    bv_annex: {
      id: "pmid_bv_annex",
      label: "Annex B Containment Door",
      kind: "door",
      key: "q_pmid_bv_keycard",
      hint: "The pathologist's spare keycard is in his coat; the door-control teletype can override the seal.",
    },
    bv_lab: {
      id: "pmid_bv_lab",
      label: "Kessler-Haas — Resilience Study",
      kind: "terminal",
      passcode: "HASSELBY",
      hint: "The Annex B door-control teletype.",
    },
  };
  for (const k in K.LOCKS) K.lockReg(K.LOCKS[k]);
})();
