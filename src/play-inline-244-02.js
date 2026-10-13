// play-inline-244 02 — hint
// Lines 22-95 of readable/play-inline-244.pretty.js (statement-aligned).
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
