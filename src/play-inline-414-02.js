// play-inline-414 02 — hint
// Lines 21-65 of readable/play-inline-414.pretty.js (statement-aligned).
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const CY = -5;

  // ---- locks: keys, codes and passcodes (every unlock is placed in this POI) ----
  const DM_LOCKS = {
    cold: K.regLock({
      id: "pf3_lk_dm_cold",
      label: "Delmonico's Cold Storage",
      key: "pf3_dm_key",
      code: "1876",
      kind: "door",
      hint: "Chef Bastien and Hock carry the key; Chef Bastien says the code on Walt's kitchen tape reel.",
    }),
    cage: K.regLock({
      id: "pf3_lk_dm_cage",
      label: "Larder Cage Padlock",
      key: "pf3_dm_key",
      code: "4219",
      kind: "cage",
      hint: "The cold-storage key fits; Walt has watched Hock dial the combination every morning.",
    }),
    strongbox: K.regLock({
      id: "pf3_lk_dm_strongbox",
      label: "Society Strongbox",
      code: "7419",
      kind: "safe",
      hint: "The Society's recent minutes, on the Morgan Room teletype.",
    }),
    rolls: K.regLock({
      id: "pf3_lk_dm_rolls",
      label: "Gilded Fork Society Teletype",
      passcode: "PORTERHOUSE",
      kind: "terminal",
      hint: "Pencilled at the foot of the Book of Receipts, on the Morgan Room table.",
    }),
  };
  PV.DM_LOCKS = DM_LOCKS;
  K.keyFrom(
    "pf3_dm_key",
    'Chef Bastien (Persuasion: "inventory") or from his / Hock\'s body',
  );

