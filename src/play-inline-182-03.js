// play-inline-182 03 — title
// Lines 320-654 of readable/play-inline-182.pretty.js (statement-aligned).
  K.questDef({
    id: "pmid_q_deadair",
    name: "Jamming Season",
    giver: '"Rocky" Delgado / Pvt. Oduya (tape reel)',
    location: "Waldorf-Astoria",
    desc: "The Continuity has turned the Waldorf-Astoria into a forward command post, and the array on its roof hums all night: a jamming screen stepping on every free broadcast in Manhattan, Rocky Delgado's first of all. Get inside and silence it.",
    stages: [
      {
        id: "enter",
        text: "Get into the Waldorf-Astoria on Park Avenue (Continuity forward post).",
        markers: () => {
          const s = G.LAYOUT.getSite("waldorf");
          return s
            ? [{ x: s.x0 - 4, z: (s.z0 + s.z1) / 2, label: "Waldorf-Astoria" }]
            : [];
        },
        onEnter: () => {
          if (K.q.flag("pmid_jammer_off")) K.q.complete("pmid_q_deadair");
          else if (inWaldorf()) K.q.set("pmid_q_deadair", "silence");
        },
      },
      {
        id: "silence",
        text: "Silence the jamming array: its controls are in the Continuity command post in the Presidential Suite (35th floor, up the Towers staircase off the Grand Ballroom balcony).",
        markers: () => {
          const v = K.anchor("waldorf", "radio");
          if (v)
            return [
              {
                x: v.x,
                z: v.z,
                y: v.y,
                label: "Continuity Radio Room",
                interior: "waldorf",
              },
            ];
          const s = G.LAYOUT.getSite("waldorf");
          return [
            { x: s.x0 - 4, z: (s.z0 + s.z1) / 2, label: "Waldorf-Astoria" },
          ];
        },
        onEnter: () => {
          if (K.q.flag("pmid_jammer_off")) K.q.complete("pmid_q_deadair");
        },
      },
    ],
    rewards: { xp: 150, scrip: 100 },
  });
  /** Start (or advance) "Jamming Season": safe to call at any time. */
  K.startDeadAir = function () {
    if (K.q.flag("pmid_jammer_off")) {
      if (K.q.started("pmid_q_deadair")) K.q.complete("pmid_q_deadair");
      return;
    }
    if (!K.q.started("pmid_q_deadair")) K.q.start("pmid_q_deadair");
    if (
      K.q.active("pmid_q_deadair") &&
      K.q.stage("pmid_q_deadair") === "enter" &&
      inWaldorf()
    )
      K.q.set("pmid_q_deadair", "silence");
  };
  // entering the Waldorf advances the quest however it was started (the main story's proxy starts it outside)
  let deadAirPoll = 0;
  K.animate(function (dt) {
    deadAirPoll -= dt || 0;
    if (deadAirPoll > 0) return;
    deadAirPoll = 1;
    if (
      K.q.active("pmid_q_deadair") &&
      K.q.stage("pmid_q_deadair") === "enter" &&
      inWaldorf()
    )
      K.q.set("pmid_q_deadair", "silence");
  });
  G.events.on("itemAdded", (id) => {
    if (id === "pmid_wa_log1") K.startDeadAir();
  });

  A.resets = A.resets || [];
  A.resets.push(() => {
    try {
      if (!G.isStub("props") && G.props.setTurrets) {
        G.props.setTurrets("pmid_wa_turrets", "on");
        G.props.setTurrets("pmid_ml_turrets", "on");
      }
    } catch (e) {
      /* ignore */
    }
  });
  // re-apply terminal-disabled turret groups after a load (props rebuilds turrets in their default state)
  K.onNewGame(() => {
    try {
      if (G.isStub("props") || !G.props.setTurrets) return;
      if (A.state.wa_turrets_off) G.props.setTurrets("pmid_wa_turrets", "off");
      if (A.state.ml_turrets_off) G.props.setTurrets("pmid_ml_turrets", "off");
    } catch (e) {
      /* ignore */
    }
  });

  // ------------------------------------------------------------------
  // Terminals — MSG, Penn
  // ------------------------------------------------------------------
  K.terminalDef("pmid_msg_promoter", {
    title: "THE PIT — FIGHT CARD",
    header:
      "MADISON SQUARE GARDEN CORP. — EVENT MANAGEMENT (REPURPOSED BY M. MALLOY)",
    entries: [
      {
        title: "Tonight",
        text: () =>
          'BOUT 1: "Scrapper" Sully vs. ANY NEWCOMER — 3 to 1\nBOUT 2: The Burrow Rat Melee (two rats, one fool) — 4 to 1\nMAIN EVENT: BRICK BRUNO (Champion, 57-0) vs. whoever survives — 9 to 1\n\nCurrent contender: ' +
          (A.state.pitWins
            ? "the sleeper kid (" + A.state.pitWins + "-0)"
            : "nobody yet"),
      },
      {
        title: "Brick's Record",
        text: "Brick Bruno. Heavyweight, forty-six years old. Fought his first pro bout in this building in February 1967, in front of 18,000 people. Fought his second in 1971, in front of nine drunks and a giant roach. Undefeated both times, and every time since.\nNobody goes the distance with Brick. That's the whole act.",
      },
      {
        title: "Debts Owed to the House",
        text: 'Sully — 40 scrip (bet against himself, lost anyway)\nCarla — 0 (Carla doesn\'t gamble. Carla wins.)\nOld Hector — 1 life insurance policy, "worth a fortune once I get it paid". Accepted as collateral. Heaven help me.',
      },
    ],
  });
  K.terminalDef("pmid_penn_station", {
    title: "PENNSYLVANIA STATION — STATIONMASTER",
    header: "PENNSYLVANIA RAILROAD — THE STANDARD RAILROAD OF THE WORLD",
    entries: [
      {
        title: "Ticket Office Safe",
        learn: "pmid_penn_ticket_safe",
        text: "Ticket office safe: 1-9-1-0, the year the station opened. Cash to be banked daily. (It was not banked on the 5th.)",
      },
      {
        title: "Departures, Mar. 5, 1967",
        text: '9:40 Broadway Limited (Chicago) — CANCELLED\n9:45 The Congressional (Washington) — CANCELLED\n9:50 Keystone Express — BOARDING, TRK 3 (never departed)\n10:05 Civil Defense Special — "SEE AGENT" (no agent)',
      },
      {
        title: "Notice to Staff (1963)",
        text: "The Board of Estimate has voted down the proposal to demolish this station and build a new Madison Square Garden on the site. The Garden stays on Eighth Avenue at 49th Street; the Station stays where it is. Thank you, New York. — The Management",
      },
      {
        title: "Tunnel Maintenance Log",
        text: 'East River tunnels: persistent reports of a "green glow" and a man in a conductor\'s cap walking the tracks after hours. Signal crew refuses night shifts. Recommend: raise wages or buy better flashlights.',
      },
      {
        title: "Public Address — Last Announcement",
        action: () => {
          K.say(
            '"...all passengers, proceed calmly to the platforms. Trains to the Civil Defense shelters will depart on schedule. Thank you for traveling Pennsylvania."',
          );
          return "Playing recording on waiting-room speakers... (the speakers crackle and die)";
        },
      },
    ],
  });

  // ------------------------------------------------------------------
  // Terminals — MetLife
  // ------------------------------------------------------------------
  K.terminalDef("pmid_ml_security", {
    title: "METLIFE SECURITY DESK",
    header: "METROPOLITAN LIFE — AUTOMATED SECURITY (PATROLMAN SERIES)",
    lock: 0,
    entries: [
      {
        title: "Patrolman Roster",
        text: 'UNIT P-1 through P-3: LOBBY. Directive: "Greet visitors. Verify policy status. Remove the uninsured."\nUNIT ADJUSTER Mk. IV: CLOCK ROOM (maintenance of executive privilege).',
      },
      {
        title: "Lobby Turrets — Disable",
        cond: () => !A.state.ml_turrets_off,
        action: () => {
          A.state.ml_turrets_off = 1;
          let n = 0;
          try {
            if (!G.isStub("props") && G.props.setTurrets)
              n = G.props.setTurrets("pmid_ml_turrets", "off");
          } catch (e) {
            /* */
          }
          return n
            ? "TURRETS STANDING DOWN. Have a safe and fully insured day."
            : "NO TURRETS RESPONDING.";
        },
      },
      {
        title: "Express Car Keypad",
        learn: "pmid_ml_elev",
        text: "EXPRESS CAR to the Clock Room: keypad 0-9-4-7. (The time the clock stopped. Facilities thought it was funny.)",
      },
      {
        title: "President's Office",
        learn: "pmid_ml_pres_safe",
        text: "EXECUTIVE FLOOR — President's wall safe: 1-9-0-9 (tower completion). Security unit P-1 holds the override.",
      },
      {
        title: "Express Elevator — Release Lock",
        action: () => {
          K.safe("unlock", () => {
            if (K.locksLive()) G.locks.unlock(K.LOCKS.ml_elev.id);
          });
          try {
            G.sfx.play("terminal_success");
          } catch (e) {
            /* */
          }
          return "EXPRESS CAR RELEASED. Please mind the gap. Please mind the robots.";
        },
      },
    ],
  });
  K.terminalDef("pmid_ml_claims", {
    title: "CLAIMS DIVISION",
    header: 'METROPOLITAN LIFE — "THE LIGHT THAT NEVER FAILS"',
    entries: [
      {
        title: "Claim #7741-P (PFEIFFER, H.)",
        text: 'CLAIMANT: Hector J. Pfeiffer, 44, longshoreman.\nPOLICY: whole life, paid up.\nEVENT: "total incapacity" (claimant reports burns "over half of me", cannot lift a crate).\nSTATUS: DENIED — Clause 17(b), Act of God or of Foreign Powers.\nAPPEAL: pending review by ACTUARIAL ENGINE "PRUDENCE" (Clock Room).\nPOLICY ORIGINAL: Records Vault, Executive Floor.',
      },
      {
        title: "Denial Templates",
        text: '"Dear Valued Policyholder, we regret to inform you that radiation is not a covered peril."\n"...that your house being on fire does not constitute a fire."\n"...that death, while unfortunate, was avoidable with better planning."',
      },
      {
        title: "ADJUSTER Directives",
        text: '1. Deny.\n2. If claimant persists, deny with emphasis.\n3. If claimant becomes hostile, reclassify claimant as "loss" and adjust accordingly.',
      },
    ],
  });
  K.terminalDef("pmid_ml_mainframe", {
    title: 'ACTUARIAL ENGINE "PRUDENCE" MK II',
    header: "METROPOLITAN LIFE — FINAL REVIEW OF APPEALS",
    lock: K.LOCKS.ml_prudence,
    entries: [
      {
        title: "Engine Status",
        text: "UPTIME: 192,720 hours.\nCLAIMS REVIEWED SINCE 03/05/1967: 0.\nCLAIMS DENIED SINCE 03/05/1967: 11,406 (automatic).\nNOTE: clock hands seized at 9:47. Movement nominal.",
      },
      {
        title: "Review Appeal #7741-P",
        cond: () =>
          K.inv.count("q_pmid_ml_policy") > 0 &&
          K.inv.count("q_pmid_ml_cheque") === 0 &&
          !K.q.flag("pmid_claim_paid"),
        action: () => {
          K.inv.add("q_pmid_ml_cheque", 1);
          K.q.setFlag("pmid_claim_approved", true);
          K.xp(75, "Appealed a claim");
          if (K.q.active("pmid_q_claim")) K.q.set("pmid_q_claim", "return");
          try {
            G.sfx.play("terminal_success");
          } catch (e) {
            /* */
          }
          return 'ORIGINAL POLICY VERIFIED. CLAUSE 17(b) OVERRIDDEN: "Foreign Powers" no longer exist.\nCLAIM APPROVED. Printing certified cheque... [ka-CHUNK]\nThank you for choosing Metropolitan Life.';
        },
      },
      {
        title: "Recalibrate Clock Hands",
        action: () => {
          K.say(
            "Somewhere above you, four giant hands shudder, then settle back on 9:47.",
          );
          return "ERROR: HANDS OBSTRUCTED. (Recommend clockwinder. Clockwinder status: DECEASED.)";
        },
      },
    ],
  });

  // ------------------------------------------------------------------
  // Terminals — Bellevue
  // ------------------------------------------------------------------
  K.terminalDef("pmid_bv_nurse", {
    title: "BELLEVUE — NURSES' STATION, PSYCH WARDS",
    header: "NEW YORK CITY DEPARTMENT OF HOSPITALS",
    lock: 0,
    entries: [
      {
        title: "Pharmacy & Narcotics",
        learn: ["pmid_bv_pharmacy", "pmid_bv_narcotics"],
        text: "PHARMACY CAGE keypad: 2-0-1-6. NARCOTICS LOCKER: 7-1-1-2. Night staff only. Do NOT write these on the cage. (Somebody has written them on the cage.)",
      },
      {
        title: "Ward Roster",
        text: 'WARD A: 14 patients, 2 orderlies.\nWARD B (Isolation): 6 patients — "Kessler-Haas Resilience cohort". Access restricted to Dr. Hasselby.\nPADDED CELLS: 3 occupied. Cell 2 requests paper. Cell 2 is not to be given paper.',
      },
      {
        title: "Medication Schedule",
        text: '0600: Chlorpromazine, Wards A & B.\n0800: "Vitamin supplement" (Kessler-Haas) — night staff and Ward B ONLY. Do not log dosage.\nNOTE from Nurse Kalinowski: the vitamin shots are green. Vitamins are not green.',
      },
      {
        title: "Pharmacy Cage — Release",
        action: () => {
          K.openGate("pmid_bv_pharmacy");
          return "CAGE LOCK RELEASED.";
        },
      },
      {
        title: "Annex B Door Control",
        learn: "pmid_bv_door",
        text: "Annex B door-control teletype: word is RESILIENCE. Dr. Hasselby says nobody will guess it. Dr. Hasselby named the project after it.",
      },
    ],
  });
  K.terminalDef("pmid_bv_door", {
    title: "KESSLER-HAAS ANNEX B — DOOR CONTROL",
    header: "KESSLER-HAAS RESEARCH FACILITY · AUTHORISED PERSONNEL ONLY",
    lock: K.LOCKS.bv_door,
    entries: [
      {
        title: "Door Status",
        text: () =>
          A.state.gate_pmid_bv_annex
            ? "ANNEX DOOR: OPEN."
            : "ANNEX DOOR: SEALED (CONTAINMENT PROTOCOL 4).",
      },
      {
        title: "Lab Console",
        learn: "pmid_bv_lab",
        text: "Resilience Study console (lab): operator word HASSELBY. The doctor is not a modest man.",
      },
      {
        title: "Override Containment Seal",
        cond: () => !A.state.gate_pmid_bv_annex,
        action: () => {
          K.openGate("pmid_bv_annex");
          return "CONTAINMENT OVERRIDE ACCEPTED. May God have mercy on the operator.";
        },
      },
    ],
  });
