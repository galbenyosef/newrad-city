// play-inline-397 02 — hint
// Lines 31-92 of readable/play-inline-397.pretty.js (statement-aligned).
  const PV = G._pv3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  PV.INT = PV.INT || {};

  // ---- locks (G.locks): every unlock is placed in this file ----
  const LK = (PV.LK_JM = {
    chambers: K.regLock({
      id: "pv3_lk_jm_chambers",
      label: "Chambers Override Teletype",
      kind: "terminal",
      passcode: "ENOUGH",
      hint: "Judge Harrigan's last note on the chambers desk names the override word.",
      learnedFrom: "Judge Harrigan's Last Ruling (chambers desk)",
    }),
    detention: K.regLock({
      id: "pv3_lk_jm_detention",
      label: "Detention Cell-Control Teletype",
      kind: "terminal",
      passcode: "HABEAS",
      hint: "The service notes on the clerk's docket teletype record the console reset.",
      learnedFrom: "Docket teletype (Magistrate Unit — Service Notes)",
    }),
    safe: K.regLock({
      id: "pv3_lk_jm_safe",
      label: "Judge Harrigan's Safe",
      kind: "safe",
      code: "1126",
      hint: "The judge's personal log on the chambers teletype gives the combination.",
      learnedFrom: "Chambers teletype (Personal Log)",
    }),
    evidence: K.regLock({
      id: "pv3_lk_jm_evid_0413",
      label: "Evidence Locker 67-0413",
      kind: "container",
      code: "6704",
      hint: "Custody codes are listed on the clerk's docket teletype.",
      learnedFrom: "Docket teletype (Evidence Room — Custody Codes)",
    }),
    spare: K.regLock({
      id: "pv3_lk_jm_evid_9120",
      label: "Evidence Locker 66-9120",
      kind: "container",
      code: "6691",
      hint: "Custody codes are listed on the clerk's docket teletype.",
      learnedFrom: "Docket teletype (Evidence Room — Custody Codes)",
    }),
    cell2: K.regLock({
      id: "pv3_lk_jm_cell2",
      label: "Cell 2 (Zielinski)",
      kind: "door",
      key: "pv3_key_jm_cells",
      hint: "The bailiffs' spare key ring is in evidence locker 66-9120; the cell-control teletype also opens it.",
      keyFrom: "Evidence Locker 66-9120 (detention level)",
    }),
  });

  const BY = -4.5; // detention level floor (local)
  const TWR = { x: 34, y: 24, z: -4 }; // clock room centre (local), well away from the main block
  PV.JM = { BY, TWR, CELL_X: -6, DOT_CELL: { z0: -25, z1: -21 } };

