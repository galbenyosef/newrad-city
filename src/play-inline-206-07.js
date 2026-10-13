// play-inline-206 07 — title
// Lines 3677-3909 of readable/play-inline-206.pretty.js (statement-aligned).
  PF.terminal("pf_fed_vault", {
    title: "LEVEL V — VAULT CONTROL",
    header:
      "KESTREL TELETYPE CORP. — MODEL 40 — BULLION VAULT CONTROL (CLASS A)",
    lock: FED_LOCKS.vault,
    entries: [
      {
        title: () =>
          PF.flag("fed_vault")
            ? "Cylinder Door: OPEN"
            : "Rotate Cylinder Door to OPEN",
        action: () => {
          if (!PF.flag("fed_vault")) {
            PF.setFlag("fed_vault", true);
            return "ROTATION SEQUENCE INITIATED. STAND CLEAR OF THE CYLINDER.";
          }
          return "Door is open.";
        },
      },
      {
        title: () =>
          PF.flag("fed_warden_off")
            ? "VAULT SENTINEL: MAINTENANCE MODE"
            : "Place VAULT SENTINEL in Maintenance Mode",
        action: () => {
          PF.setFlag("fed_warden_off", true);
          wardenOff();
          return "SENTINEL UNIT 01: MAINTENANCE MODE. Weapons safed. Have a nice day.";
        },
      },
      {
        title: () =>
          PF.flag("fed_grid")
            ? "Disable Checkpoint Beam Grid"
            : "Beam Grid: OFFLINE",
        action: () => {
          PF.setFlag("fed_grid", false);
          return "Beam grid disabled.";
        },
      },
      {
        title: () => (PF.flag("fed_alarm") ? "Silence Alarm" : "Alarm: quiet"),
        cond: () => !!PF.flag("fed_alarm"),
        action: () => {
          PF.setFlag("fed_alarm", false);
          return "Alarm silenced. (The robots are still angry.)";
        },
      },
      {
        title: "Bullion Inventory (summary)",
        text: () =>
          "COMPARTMENTS: 122 (48 ON THIS LEVEL)\nBARS ON HAND: " +
          (PF.fedBarCount || 0) +
          ' visible, ~500,000 total\nLAST AUDIT: MAR 3 1967\nLAST WITHDRAWAL: "OCD LONG WINTER/EXPEDITE" — NOT EXECUTED.\n\nOPEN-CAGE CRATES: 001 (forced), 046 (forced), 012 (comb. 4825), 024 (RESERVE — MANAGER\'S KEY), 026 (comb. on tag), 030 (see manager).',
        learn: "pf_lk_fed_comp012",
      },
    ],
  });
  PF.terminal("pf_fed_office", {
    title: "VAULT MANAGER — E. WHITLOCK",
    header: "KESTREL TELETYPE CORP. — MODEL 40 — PERSONAL",
    lock: FED_LOCKS.office,
    entries: [
      {
        title: "Telegram from the Office of Civil Defense",
        text: 'WESTERN UNION — SAT MAR 4 1967 1105 EST\nMR. WHITLOCK, FEDERAL RESERVE BANK OF NEW YORK\n\nIN ANTICIPATION OF CERTAIN FUTURE DEVELOPMENTS THE OFFICE OF CIVIL DEFENSE REQUESTS IMMEDIATE TRANSFER OF BULLION HELD UNDER ACCOUNT LW-9 TO SECURE STORAGE BENEATH THE MUNICIPAL BUILDING. OUR AUDITORS ARRIVE TOMORROW MORNING. ALSO REQUEST COPY OF RESERVE LEDGER. FOR OUR RECORDS. NO PUBLIC NOTICE.\n\nM. DEPUTY DIRECTOR OCD\n\n[Pencilled under it in Whitlock\'s hand: "On a Sunday? Refuse until Monday."]',
      },
      { title: "Reply (unsent)", text: "No.\n\n— E.W." },
      {
        title: "Compartment Audit",
        text: "CMPT 030 — 14 bars, foreign account, CLOSED. Crate combination 9361 (dual control; second officer deceased).",
        learn: "pf_lk_fed_comp030",
      },
      {
        title: "Personal Log",
        text: "The staff went down into the shelter level and did not come up. I stayed in the office. The Sentinel brings me coffee. It does not know the coffee ran out in '68. Neither, officially, do I.\n\nThe safe is still set to our wedding day, 0-9-1-5. Nan made me promise never to change it. I kept the reserve key in there, and her ring on the desk where I can see it.",
        learn: "pf_lk_fed_office_safe",
      },
    ],
  });
  function wardenOff() {
    const a = PF.getNpc("pf_fed_warden");
    if (!a || a.dead) return;
    try {
      a.setHostile(false);
    } catch (e) {
      /* ignore */
    }
    a.name = "Vault Sentinel (Maintenance)";
    try {
      if (a.stop) a.stop();
    } catch (e) {
      /* ignore */
    }
  }

  // --- quest ---
  PF.quest({
    id: "pf_gold",
    name: "The Gold Standard",
    giver: "Mortimer Vane",
    location: "Federal Reserve Bank",
    desc: "Mortimer Vane, an old bond man who once worked the trading floors, wants the Reserve Ledger out of the gold vault under the Federal Reserve Bank on Liberty Street. Whatever gold I carry out is mine.",
    stages: [
      {
        id: "meet",
        text: "Talk to Mortimer Vane at Fraunces Tavern.",
        markers: () => [{ npc: "pf_ft_vane", label: "Mortimer Vane" }],
      },
      {
        id: "enter",
        text: "Get inside the Federal Reserve Bank on Liberty Street.",
        markers: () => [{ x: 80, z: 764, label: "Federal Reserve Bank" }],
      },
      {
        id: "power",
        text: "Restore power to the vault elevator from the ground-floor security office.",
        markers: () => {
          const a = PF.anchorOf("federal_reserve", "sec_terminal");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Security Terminal",
                  interior: "federal_reserve",
                },
              ]
            : [];
        },
      },
      {
        id: "descend",
        text: "Ride the vault elevator down to Level V.",
        markers: () => {
          const a = PF.anchorOf("federal_reserve", "elevator_up");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Vault Elevator",
                  interior: "federal_reserve",
                },
              ]
            : [];
        },
      },
      {
        id: "door",
        text: "Open the vault's cylinder door from the Level V control room.",
        markers: () => {
          const a = PF.anchorOf("federal_reserve", "vault_terminal");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z + 1.0,
                  y: a.y,
                  label: "Vault Control",
                  interior: "federal_reserve",
                },
              ]
            : []; /* in front of the wall-mounted terminal */
        },
      },
      {
        id: "fed_warden",
        text: "(Optional) Deal with the Vault Sentinel.",
        sideObjective: true,
        optional: true,
        doneIf: () =>
          !!PF.flag("fed_warden_off") || !!PF.flag("fed_warden_dead"),
      },
      {
        id: "ledger",
        text: "Recover the Reserve Ledger from the vault manager's office.",
        markers: () => {
          const a = PF.anchorOf("federal_reserve", "ledger");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Reserve Ledger",
                  interior: "federal_reserve",
                },
              ]
            : [];
        },
      },
      {
        id: "return",
        text: () =>
          "Bring the Reserve Ledger to Mortimer Vane at Fraunces Tavern." +
          (PF.inv.count("gold_bar")
            ? " (You are carrying " +
              PF.inv.count("gold_bar") +
              " gold bar" +
              (PF.inv.count("gold_bar") > 1 ? "s" : "") +
              ".)"
            : ""),
        markers: () => [{ npc: "pf_ft_vane", label: "Mortimer Vane" }],
      },
    ],
    rewards: { xp: 500, scrip: 250 },
  });
  // ledger pickup → stage
  G.events.on("itemAdded", (id) => {
    if (id === "pf_reserve_ledger") {
      PF.setFlag("fed_ledger", true);
      PF.q.advance(
        "pf_gold",
        ["meet", "enter", "power", "descend", "door", "ledger"],
        "return",
      );
      if (!PF.q.started("pf_gold")) {
        PF.q.start("pf_gold", { stage: "return" });
      }
    }
    if (id === "pf_reel_heist" && !PF.q.started("pf_gold"))
      PF.q.start("pf_gold", { stage: "meet" });
  });
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "pf_fed_warden") PF.setFlag("fed_warden_dead", true);
  });

  // ===================================================================
  // BUILDER
  // ===================================================================
