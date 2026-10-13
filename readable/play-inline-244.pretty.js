/* src/poi_roosevelt/07_locks.js */
/* =====================================================================
 * NEW RAD CITY — POI ROOSEVELT ISLAND — 07_locks.js
 * Every lock in the module (G.locks specs), defined before the site files
 * that use them. Each unlock is placed in this module's content:
 *   pr_oct_office      key pr_oct_office_key   (the night nurse's desk, Octagon L1)
 *   pr_oct_cell6       key pr_oct_master_key   (the Superintendent's bag in the dome) — or his teletype release
 *   pr_oct_harrow      passcode COUNTING       the night-nurse station teletype
 *   pr_oct_office_safe code 0212               the Superintendent's teletype
 *   pr_oct_dome_safe   code 0340               the Superintendent's last entry (dome)
 *   pr_ren_cellar      key pr_ren_quarantine_key (Nurse Pell's locker, Renwick)
 *   pr_ren_morgue      passcode LAZARUS        the Renwick nursing teletype
 *   pr_ren_seal        code 1856               the morgue teletype (it can also release the seal)
 *   pr_ren_lab         passcode VARIOLA        the morgue teletype
 *   pr_ren_lab_locker  code 0419               the culture-control teletype
 * The Octagon service-stair gate is chained on one side (one-way), not a lock.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G._pr) return;
  const PR = G._pr;
  PR.LOCKS = {
    oct_office: {
      id: "pr_oct_office",
      label: "Superintendent's Office",
      kind: "door",
      key: "pr_oct_office_key",
      hint: "The night nurse kept the key at her desk.",
    },
    oct_cell6: {
      id: "pr_oct_cell6",
      label: "Isolation Cell 6",
      kind: "door",
      key: "pr_oct_master_key",
      hint: "The Superintendent's master key, up in the dome; his teletype can release the cell.",
    },
    oct_harrow: {
      id: "pr_oct_harrow",
      label: "Superintendent — Teletype",
      kind: "terminal",
      passcode: "COUNTING",
      hint: "The night-nurse station teletype.",
    },
    oct_office_safe: {
      id: "pr_oct_office_safe",
      label: "Superintendent's Safe",
      kind: "safe",
      code: "0212",
      hint: "The Superintendent's teletype.",
    },
    oct_dome_safe: {
      id: "pr_oct_dome_safe",
      label: "Superintendent's Strongbox",
      kind: "safe",
      code: "0340",
      hint: "The Superintendent's last entry, in the dome.",
    },
    ren_cellar: {
      id: "pr_ren_cellar",
      label: "Quarantine Cellar",
      kind: "door",
      key: "pr_ren_quarantine_key",
      hint: "Nurse Pell kept the key in her locker.",
    },
    ren_morgue: {
      id: "pr_ren_morgue",
      label: "Renwick — Morgue Teletype",
      kind: "terminal",
      passcode: "LAZARUS",
      hint: "The Renwick nursing teletype.",
    },
    ren_seal: {
      id: "pr_ren_seal",
      label: "Laboratory Seal",
      kind: "door",
      code: "1856",
      hint: "The morgue teletype.",
    },
    ren_lab: {
      id: "pr_ren_lab",
      label: "Project Variola — Culture Control",
      kind: "terminal",
      passcode: "VARIOLA",
      hint: "The morgue teletype.",
    },
    ren_lab_locker: {
      id: "pr_ren_lab_locker",
      label: "Hazard Suit Locker",
      kind: "container",
      code: "0419",
      hint: "The culture-control teletype.",
    },
  };
  for (const k in PR.LOCKS) PR.lockReg(PR.LOCKS[k]);
})();
