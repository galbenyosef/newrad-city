// play-inline-410 02 — hint
// Lines 28-86 of readable/play-inline-410.pretty.js (statement-aligned).
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const BY = -4.5; // Sub-Treasury floor
  const RC = { x: 0, z: -19, r: 12 };

  // ---- locks: keys, codes and passcodes (the unlock for each is placed in this file) ----
  const FH_LOCKS = {
    archive: K.regLock({
      id: "pf3_lk_fh_archive",
      label: "Continuity Archive 7 (Mosler door)",
      key: "pf3_fh_archive_key",
      code: "043089",
      kind: "door",
      hint: "Speaker Voss wears the key; Archivist Ames's notebook (vault hall, by her body) has the combination.",
    }),
    loading: K.regLock({
      id: "pf3_lk_fh_loading",
      label: "Sub-Treasury Loading Door",
      code: "1862",
      kind: "door",
      hint: "Acolyte Quintero's field log (vault hall) mentions the code.",
    }),
    strongbox: K.regLock({
      id: "pf3_lk_fh_speaker_box",
      label: "Speaker's Strongbox",
      code: "4419",
      kind: "safe",
      hint: "Item 8 of the Speaker's Order of Business, on the table by the throne.",
    }),
    locker: K.regLock({
      id: "pf3_lk_fh_guard_locker",
      label: "Sub-Treasury Locker",
      code: "7140",
      kind: "container",
      hint: "Stencilled on the gold cage beside the locker.",
    }),
    safe: K.regLock({
      id: "pf3_lk_fh_archivist_safe",
      label: "Custodian's Safe",
      code: "0612",
      kind: "safe",
      hint: "Custodian Pryce's log on the Archive 7 teletype.",
    }),
    term: K.regLock({
      id: "pf3_lk_fh_cog_term",
      label: "Continuity Archive 7 Teletype",
      passcode: "PALISADE",
      kind: "terminal",
      hint: "Custodian Pryce's desk blotter, on the floor by his chair.",
    }),
  };
  PV.FH_LOCKS = FH_LOCKS;
  K.keyFrom(
    "pf3_fh_archive_key",
    "Speaker Voss (yields it to a Persuasion point of order, or from his body)",
  );

