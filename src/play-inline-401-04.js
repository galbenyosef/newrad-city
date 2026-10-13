// play-inline-401 04 — title
// Lines 2054-2127 of readable/play-inline-401.pretty.js (statement-aligned).
  function termGrid() {
    return {
      title: "SYSTEM OPERATIONS — GRID CONTROL",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\nFive Boroughs Power · Manhattan System Operations · SECURITY: ROBOTIC",
      lock: LK.grid,
      entries: [
        {
          title: "Network Status",
          text: "FEEDERS IN SERVICE: 0 of 2,114\nTRANSFORMER A: FAULTED (03/05/1967 09:47)\nTRANSFORMER B: ENERGISED — NO LOAD\nTOWER LANTERN: DARK — ARC REGULATOR MISSING (removed for maintenance the day before)",
        },
        {
          title: "Security Directive 1",
          text: "Security units will GUARD THE GRID until relieved by an authorised System Operator.\n\nSystem Operators on shift: 0.\nRelief ETA: —",
        },
        {
          title: "Blackout of 1965 — Memo",
          text: 'November 9, 1965: for 13 hours Manhattan was dark. Only this tower stayed lit, its lantern on the station\'s own emergency generator, and all night long people walked toward it down dark avenues. The linemen worked through the night by lantern light. In their honour the tower lantern burns every night from dusk to dawn, and will never be switched off.\n\n(Handwritten below: "never is a long time, Walt.")',
        },
        {
          title: "Relieve Security Units (stand down)",
          cond: () => !(PV.ce && PV.ce.pacified()),
          text: 'Operator relief accepted. Security units: "Thank you for your service." Units returning to standby.',
          action: () => PV.ce && PV.ce.pacify(),
        },
      ],
    };
  }
  function termBeacon() {
    return {
      title: "TOWER OF LIGHT — LANTERN CONTROL",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\nMemorial Lantern · 40,000 lumen arc · Backfeed from Transformer B",
      entries: [
        {
          title: "Lantern Status",
          cond: () => !PV.flag("ce_mode"),
          text: "ARC REGULATOR: MISSING (rack B, transformer hall)\nLANTERN: DARK SINCE 03/1967\nBACKFEED: TRANSFORMER B READY",
        },
        {
          title: "Maintenance",
          learn: LK.safe.id,
          text: () => {
            K.learn(LK.safe.id);
            return "Clock-room maintenance safe: 1-9-6-5. Same as the plaque downstairs, so nobody forgets.\nSpare brushes, lamp carbons, the good wrench. Return the good wrench.";
          },
        },
        {
          title: "Lantern Status",
          cond: () => PV.flag("ce_mode") === "beacon",
          text: "ARC REGULATOR: INSTALLED\nMODE: BEACON — lantern lit dusk to dawn.\n\nThe lights stay on.",
        },
        {
          title: "Lantern Status",
          cond: () => PV.flag("ce_mode") === "grid",
          text: "ARC REGULATOR: INSTALLED\nMODE: GRID — lantern dark, Village feeder 7 energised (Bedford St., 6th Ave., W. 10th St.).",
        },
        {
          title: "Install Regulator — BEACON MODE (relight the Tower of Light)",
          cond: () => PV.ce && PV.ce.canInstall(),
          text: "Regulator seated. Arc striking... LANTERN LIT. The Tower of Light is shining over Manhattan.",
          action: () => PV.ce && PV.ce.install("beacon"),
        },
        {
          title: "Install Regulator — GRID MODE (power Village feeder 7)",
          cond: () => PV.ce && PV.ce.canInstall(),
          text: "Regulator seated. Lantern bypassed. Feeder 7 energised: Greenwich Village — Bedford St., 6th Ave., W. 10th St.",
          action: () => PV.ce && PV.ce.install("grid"),
        },
      ],
    };
  }

  PV.INT.ce = interior;
