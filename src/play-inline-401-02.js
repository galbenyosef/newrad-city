// play-inline-401 02 — floor
// Lines 26-67 of readable/play-inline-401.pretty.js (statement-aligned).
  const PV = G._pv3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  PV.INT = PV.INT || {};

  // ---- locks (G.locks): every unlock is placed in this building ----
  const LK = (PV.LK_CE = {
    elevator: K.regLock({
      id: "pv3_lk_ce_elevator",
      label: "Executive Elevator (Tower)",
      kind: "door",
      key: "pv3_fiveboro_key",
      hint: "The supervisor's keycard is in the desk on the System Control platform.",
      keyFrom: "Supervisor's Desk (System Control)",
    }),
    grid: K.regLock({
      id: "pv3_lk_ce_grid",
      label: "Grid Control Teletype",
      kind: "terminal",
      passcode: "LAMPLIGHTER",
      hint: "The operators' word is on the shift log beside the console; Hazel Adeyemi remembers it too.",
      learnedFrom: [
        "System Operator shift log (System Control)",
        "Hazel Adeyemi (dialogue)",
      ],
    }),
    safe: K.regLock({
      id: "pv3_lk_ce_safe",
      label: "Tower Maintenance Safe",
      kind: "safe",
      code: "1965",
      hint: "The lantern-room teletype's maintenance entry gives the combination.",
      learnedFrom: "Lantern Control teletype (Maintenance)",
    }),
  });

  const VY = -6; // transformer hall floor
  const CR = { x: 38, y: 40, z: -22 }; // clock room centre (floor y)
  const LY = 48; // lantern room floor
  PV.CE = { VY, CR, LY };

