// play-inline-412 02 — hint
// Lines 30-108 of readable/play-inline-412.pretty.js (statement-aligned).
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const VY = -5; // vault level
  const PY = 40; // Pyramid Room floor
  const DOOR = {
    hx: 2.25,
    hz: -61.55,
    r: 1.9,
    cy: 2.0,
    t: 0.7,
    open: 1.8,
    ro: 1.5,
  }; // cy ≥ r + 0.1: the disc clears the floor
  const VAULT = { x0: -7, x1: 7, z0: -76, z1: -62.2 };

  // ---- locks: keys, codes and passcodes (every unlock is placed in this file) ----
  const BT_LOCKS = {
    console: K.regLock({
      id: "pf3_lk_bt_console",
      label: "Mosler Time-Lock Console",
      passcode: "STEWARDSHIP",
      kind: "terminal",
      hint: "The vault clerk's duty card, by the clerk's remains in the boiler room.",
    }),
    override: K.regLock({
      id: "pf3_lk_bt_override",
      label: "Time-Lock Override Keypad",
      code: "149255",
      kind: "keypad",
      hint: "The Chairman's teletype in the Pyramid Room.",
    }),
    security: K.regLock({
      id: "pf3_lk_bt_security",
      label: "Bankers Trust Security Control",
      passcode: "NIGHTWATCH",
      kind: "terminal",
      hint: "The night guard's duty card, under the lobby waiting bench where he sat down.",
    }),
    lockers: K.regLock({
      id: "pf3_lk_bt_lockers",
      label: "Guard Lockers",
      code: "3308",
      kind: "container",
      hint: "The night guard's duty card, under the lobby waiting bench where he sat down.",
    }),
    chairman: K.regLock({
      id: "pf3_lk_bt_chairman",
      label: "Office of the Chairman Teletype",
      passcode: "MARGARET",
      kind: "terminal",
      hint: "The Chairman says it on the board-meeting tape reel.",
    }),
    wallsafe: K.regLock({
      id: "pf3_lk_bt_wallsafe",
      label: "Chairman's Wall Safe",
      code: "0614",
      kind: "safe",
      hint: "The Chairman's letter to Margaret, on his teletype.",
    }),
  };
  // safe-deposit boxes: each has its own code (the bank's carbon register, on the time-lock desk) and the master key opens them all
  const BOX_CODES = [null, "5814", "2290", null, "7736", "4061", "9127"];
  const boxLock = (i) =>
    BOX_CODES[i]
      ? K.regLock({
          id: "pf3_lk_bt_box" + (1041 + i * 17),
          label: "Safe Deposit Box " + (1041 + i * 17),
          code: BOX_CODES[i],
          key: "pf3_bt_box_key",
          kind: "container",
          hint: "The safe-deposit register on the time-lock desk; the master key is in the Chairman's wall safe.",
        })
      : null;
  const BOX_LOCKS = BOX_CODES.map((c, i) => boxLock(i));
  PV.BT_LOCKS = BT_LOCKS;
  K.keyFrom("pf3_bt_box_key", "Chairman's Wall Safe (Pyramid Room)");

