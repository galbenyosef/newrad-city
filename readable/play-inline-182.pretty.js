/* src/poi_midtown/80_data.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 80_data.js
 * Items, terminals and the POI bosses/NPC placement helpers.
 * All writing is original.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.PMID) return;
  const K = G.PMID.kit,
    A = G.PMID;
  const HP = Math.PI / 2;

  // ------------------------------------------------------------------
  // Helpers used by terminals/dialogue
  // ------------------------------------------------------------------
  /** Spawned prop handle by POI + container name (e.g. to unlock a safe from a terminal). */
  K.propByName = function (poi, name) {
    for (const h of A.spawnedProps) {
      const rec = h && h.record;
      if (!rec || !rec.opts) continue;
      if (
        String(rec.opts.id || "").indexOf("pmid:" + poi + ":") === 0 &&
        rec.opts.name === name
      )
        return h;
    }
    return null;
  };
  K.unlockContainer = function (poi, name) {
    const h = K.propByName(poi, name);
    if (!h) return false;
    try {
      const L =
        (h.container && h.container.lock) ||
        (h.record && h.record.opts && h.record.opts.lock);
      if (L && K.locksLive() && G.locks.unlock) G.locks.unlock(L.id);
      if (h.container) h.container.locked = 0;
      if (h.record && h.record.cdef) h.record.cdef.locked = 0;
      return true;
    } catch (e) {
      return false;
    }
  };
  K.doorById = function (id) {
    for (const d of G.world.doors) if (d.def && d.def.id === id) return d;
    return null;
  };
  K.anchor = (poi, n) => {
    try {
      return G.pois.getAnchor(poi, n);
    } catch (e) {
      return null;
    }
  };

  // ------------------------------------------------------------------
  // Items
  // ------------------------------------------------------------------
  const quest = (id, name, desc, o) =>
    K.item(
      Object.assign(
        { id, name, type: "misc", weight: 0, value: 0, quest: true, desc },
        o || {},
      ),
    );
  quest(
    "q_pmid_wa_codes",
    "Continuity Jammer Codes",
    'A punch-card deck labelled "PARK AVENUE — 97.3 SCREEN". Someone at Radio City would love these.',
    { value: 60, quest: false },
  );
  quest(
    "q_pmid_ledger",
    "Ondine's Ledger",
    "Every bet ever placed at The Pit, in tiny, merciless handwriting.",
    { value: 40, quest: false },
  );
  quest(
    "q_pmid_ml_policy",
    "Policy No. 7741-P (Pfeiffer)",
    'Metropolitan Life whole-life policy, Hector J. Pfeiffer, paid up in full, 1955–1967. "Payable upon death or total incapacity."',
  );
  quest(
    "q_pmid_ml_cheque",
    "Certified Claim Cheque",
    "An old-world cashier's cheque, embossed and APPROVED by an actuarial engine twenty-two years late. $48,000.00. Nobody will ever cash it.",
  );
  K.item({
    id: "q_pmid_ml_vaultkey",
    name: "Records Vault Key",
    type: "key",
    weight: 0,
    value: 0,
    desc: 'A heavy brass key tagged "RECORDS — EXEC. FLOOR".',
  });
  K.item({
    id: "q_pmid_bv_keycard",
    name: "Kessler-Haas Keycard",
    type: "key",
    weight: 0,
    value: 0,
    desc: 'A laminated Kessler-Haas access card: "ANNEX B — PRUITT, I. (PATHOLOGY) — SPARE".',
  });
  quest(
    "q_pmid_bv_meds",
    "Bellevue Pharmacy Cache",
    "A steel case of old-world antibiotics, sulfa powder, morphine syrettes and sterile dressings. Cutman Ike will want this.",
    { weight: 4 },
  );
  // Both quest-critical teletypes (Waldorf command, MetLife "Prudence") open with a card that lies in the world (the card
  // is the lock's key and also teaches its word), so "Dead Air" and "Act of God" never depend on a skill.
  K.item({
    id: "pmid_wa_dray_card",
    name: "Lt. Dray's Signals Card",
    type: "key",
    weight: 0,
    value: 5,
    learn: "pmid_wa_command",
    desc: 'A Continuity duty card, laminated and initialled. The back reads, in pencil: "CMD TELELINK — word COLUMBIA. Do NOT leave lying around. — D."',
  });
  K.item({
    id: "pmid_ml_prudence_card",
    name: "Appeals Override Card",
    type: "key",
    weight: 0,
    value: 5,
    learn: "pmid_ml_prudence",
    desc: 'A punched Hollerith card stamped "PRUDENCE — MAINTENANCE OVERRIDE — CLOCKWINDER\'S COPY". Typed along the edge: OPERATOR WORD: ACTUARY.',
  });
  K.item({
    id: "q_pmid_penn_key",
    name: "Conductor's Watch Key",
    type: "key",
    weight: 0,
    value: 0,
    desc: 'A small brass key on a watch chain, stamped "B.L. PAYROLL".',
  });
  K.item({
    id: "pmid_champion_belt",
    name: "The Pit Championship Belt",
    type: "misc",
    weight: 3,
    value: 300,
    desc: "Gold-plated tin, red velvet, and the words CHAMPION OF THE PIT hand-punched into the buckle. Brick wore it for eleven years.",
  });
  K.item({
    id: "pmid_pocket_watch",
    name: "Conductor's Pocket Watch",
    type: "misc",
    weight: 0.2,
    value: 90,
    desc: "Railroad-grade, still ticking. The radium dial still shows faintly green in the dark.",
  });
  // unique weapons cloned from the weapons module's defs at initDone (skipped if the base doesn't exist)
  K.item(
    K.uniqueFrom("brass_knuckles", (d) => ({
      id: "pmid_twocount_brass",
      name: "Two-Count's Brass",
      value: (d.value || 20) * 6,
      desc: "Mickey Brannigan's knuckles from his own fighting days. Each punch counts twice — or that's the legend.",
      weapon: Object.assign({}, d.weapon || {}, {
        damage: Math.round(((d.weapon && d.weapon.damage) || 8) * 1.8),
        critChance: ((d.weapon && d.weapon.critChance) || 0.05) + 0.1,
      }),
    })),
  );
  K.item(
    K.uniqueFrom("gyrojet_pistol", (d) => ({
      id: "pmid_fine_print",
      name: "The Fine Print",
      value: (d.value || 150) * 2,
      desc: "The Claims Adjuster Mk. IV's built-in gyrojet launcher, pried loose and given a grip. Deals more damage the less the target expected it.",
      weapon: Object.assign({}, d.weapon || {}, {
        damage: Math.round(((d.weapon && d.weapon.damage) || 15) * 1.35),
        critMult: ((d.weapon && d.weapon.critMult) || 1.5) + 0.5,
      }),
    })),
  );

  // ------------------------------------------------------------------
  // Terminals — Waldorf
  // ------------------------------------------------------------------
  K.terminalDef("pmid_wa_frontdesk", {
    title: "WALDORF-ASTORIA FRONT DESK",
    header: 'HOTEL MANAGEMENT SYSTEM — "SERVICE IS OUR ART"',
    lock: 0,
    entries: [
      {
        title: "Guest Register — Mar. 5, 1967",
        text: 'SUITE 35-A: "Mr. Smith" (party of 14). Account: FEDERAL — DO NOT BILL.\nSUITE 28-C: Civil Defense Board, gala party. Late checkout requested ("indefinitely").\nROOM 1112: Mr. & Mrs. Fenwick, honeymoon. Complaint: "radio keeps saying the word SHELTER".\nROOM 607: Dr. M. Hasselby (Kessler-Haas). Checked out 6:02 A.M. Left without paying. Left luggage marked BIOHAZARD in the cloakroom.',
      },
      {
        title: "Staff Notice",
        text: "TO ALL STAFF: Our guests from Suite 35-A have commandeered the Towers staircase, the switchboard and two of our finest bellhops. Please extend them every courtesy. They are armed. — Management",
      },
      {
        title: "The World's Fair Clock",
        text: "Our lobby clock was built for the 1893 Columbian Exposition and has kept perfect time for seventy-four years. It stopped at 9:47 A.M. We have filed a complaint with the manufacturer.",
      },
    ],
  });
  K.terminalDef("pmid_wa_command", {
    title: "CONTINUITY FORWARD COMMAND — PARK AVENUE",
    header: "CONTINUITY SECURE TELELINK · AUTH REQUIRED · GOD BLESS AMERICA",
    lock: K.LOCKS.wa_command,
    entries: [
      {
        title: "Quartermaster",
        learn: "pmid_wa_spares",
        text: "EXO-RIG SPARES LOCKER (35th floor): combination 4-7-4-7. Spares are signed out to the Major ONLY.",
      },
      {
        title: "Signals Log",
        text: '0300: DJ at Radio City broadcast settler trade wagon routes. Jam applied.\n0412: DJ switched to 94.1. Jam re-tuned.\n0650: DJ played "a song for our friends in the funny hats at the Waldorf". Major Vale requested permission to shell Radio City. Denied by Liberty Station.\n0700: Morale unit (sorbet machine) repaired.',
      },
      {
        title: "Jamming Array — Status",
        text: () =>
          K.q.flag("pmid_jammer_off")
            ? "ARRAY STATUS: OFFLINE.\nTransmitters cold. The 97.3 band is clear."
            : "ARRAY STATUS: ACTIVE — 97.3 / 94.1 / 88.9 MHz\nOutput: 40 kW. Target: RADIO CITY MUSIC HALL.\nWarning: disabling the array requires field-officer authorisation.",
      },
      {
        title: "Disable Jamming Array",
        cond: () => !K.q.flag("pmid_jammer_off"),
        action: () => {
          K.q.setFlag("pmid_jammer_off", true);
          K.q.setFlag("ms_waldorf_jammer_down", true); // main story (mq14): Rocky's range grows
          K.xp(100, "Silenced the Continuity jammer");
          K.standing(25, "Freed the airwaves");
          K.q.complete("pmid_q_deadair");
          K.news(
            "Well, well, well, Manhattan! Somebody went up to the Waldorf-Astoria and switched off whatever those tin-hatted gentlemen were using to step on my signal. Wherever you are, friend: this next one's for you.",
          );
          try {
            G.sfx.play("terminal_success");
          } catch (e) {
            /* */
          }
          return "COMMAND ACCEPTED. Array powering down... 40 kW... 12 kW... 0 kW.\nThe hum you had stopped noticing is gone.";
        },
      },
      {
        title: "Suite Defence Turrets — Disable",
        cond: () => !A.state.wa_turrets_off,
        action: () => {
          A.state.wa_turrets_off = 1;
          let n = 0;
          try {
            if (!G.isStub("props") && G.props.setTurrets)
              n = G.props.setTurrets("pmid_wa_turrets", "off");
          } catch (e) {
            /* */
          }
          return n
            ? n + " AUTOMATED DEFENCE UNIT(S) OFFLINE."
            : "NO DEFENCE UNITS RESPONDING.";
        },
      },
      {
        title: "Personnel Roster",
        text: "Major C. Vale (CO) · Lt. Dray (signals) · Sgt. Okwu · Pvt. Oduya (KP) · Pvt. Dooley · Pvt. Stiles · 2 × Sky-Eye drone (propaganda)\nNOTE: Pvt. Dooley disciplined for humming along to enemy broadcasts. (See also: Oduya.)",
      },
      {
        title: "Operation: BELLEVUE RECOVERY",
        text: 'Objective: recover Kessler-Haas K-agent stock and "Resilience" research from Bellevue sub-basement (Annex B).\nObstacle: Brute population led by an unusually articulate specimen styling itself "Chief Resident".\nStatus: two recovery teams lost. Third team postponed "until the Major stops shouting".',
      },
    ],
  });
  K.terminalDef("pmid_wa_major", {
    title: "MAJ. C. VALE — PERSONAL",
    header: "CONTINUITY SECURE TELELINK · OFFICER CLEARANCE",
    lock: K.LOCKS.wa_major,
    entries: [
      {
        title: "Safe Combination",
        learn: "pmid_wa_vale_safe",
        text: "Personal safe: 1-8-9-8. San Juan Hill. A soldier remembers.",
      },
      {
        title: "Letter to Liberty Station (draft)",
        text: "Colonel — I respectfully request, again, authorisation to remove the disc jockey. Every night he tells the savages that they are people. Every morning more of them believe him. This is not a radio problem, sir. It is a morale problem. OURS.",
      },
      {
        title: "Personal Log",
        text: "The Presidential Suite. Hoover slept here, they say, and Eisenhower, and every man who ever sat in the Oval Office. I sleep here now. I have their desk. I have their seal on the rug. When we take back this country I intend to have the rest.",
      },
      {
        title: "Wall Safe — Release",
        action: () => {
          const ok = K.unlockContainer("waldorf", "Major Vale's Safe");
          try {
            G.sfx.play(ok ? "terminal_success" : "terminal_fail");
          } catch (e) {
            /* */
          }
          return ok ? "SAFE BOLTS RETRACTED." : "NO RESPONSE FROM SAFE.";
        },
      },
    ],
  });

  // "Jamming Season" (Waldorf) — absorbed into the main story as mq14 (src/quests runs it through a proxy stage and
  // adds Ruby Kehoe, the 1968 file and the M-61 beat; see NOTES). It may be started at ANY time (by the main story,
  // by walking into the Waldorf or by Pvt. Oduya's tape reel) and completes from the command terminal's
  // "Disable Jamming Array" (sets pmid_jammer_off + ms_waldorf_jammer_down). If the array is already dark when it
  // starts, it completes at once (never a soft-lock).
  const inWaldorf = () => {
    try {
      const o = G.LAYOUT.INTERIORS.waldorf.origin,
        p = G.player && G.player.pos;
      return !!p && Math.abs(p.x - o.x) < 160 && Math.abs(p.z - o.z) < 160;
    } catch (e) {
      return false;
    }
  };
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
  K.terminalDef("pmid_bv_lab", {
    title: "KESSLER-HAAS — RESILIENCE STUDY",
    header: "CONTRACT CD-BLV-7 · OFFICE OF CIVIL DEFENSE · CLASSIFIED",
    lock: K.LOCKS.bv_lab,
    entries: [
      {
        title: "Contract Summary",
        text: 'Civil Defense requires a "pre-hardened" civilian cohort for long-term shelter viability. Kessler-Haas will supply the K-agent, strain BLV-7, administered via routine vaccination. Subjects sourced from Bellevue psychiatric intake (no next of kin).\nCompensation: $14,000,000 + naming rights.',
      },
      {
        title: "Subject Log: T. Grogan",
        text: 'Day 3: height +4 cm. Day 9: height +31 cm. Day 12: subject restrained after "diagnosing" a nurse with a fractured spine (subject caused the fracture). Day 14: subject has memorised the Merck Manual. Day 15: subject asks to be called "Doctor". Day 16: we are calling him Doctor.',
      },
      {
        title: "Tank Status",
        text: () =>
          K.q.flag("pmid_kagent_purged")
            ? "TANKS 1-7: PURGED. CONTENTS NEUTRALISED."
            : 'TANKS 1, 5: RUPTURED.\nTANKS 2, 3, 4, 6: VIABLE — K-agent BLV-7, 400 L each.\nTANK 7: "Occupied".',
      },
      {
        title: "Emergency Purge (all tanks)",
        cond: () => !K.q.flag("pmid_kagent_purged"),
        action: () => {
          K.q.setFlag("pmid_kagent_purged", true);
          K.xp(150, "Purged the K-agent tanks");
          K.standing(100, "Destroyed the Bellevue K-agent stock");
          K.news(
            "A little bird tells me the lights went out for good under Bellevue Hospital tonight. Whatever was brewing down there, it isn't anymore. Good work, whoever you are. Wash your hands.",
          );
          try {
            G.sfx.play("alarm");
          } catch (e) {
            /* */
          }
          return "PURGE SEQUENCE INITIATED. Caustic flush... thermal sterilisation... TANKS NEUTRALISED.\nThe Continuity will not be getting its samples.";
        },
      },
    ],
  });

  // ------------------------------------------------------------------
  // Bosses (named, stable ids — combat restores dead/alive state on load)
  // ------------------------------------------------------------------
  const typeOk = (t) => {
    try {
      return (
        !G.isStub("chars") && G.chars.types && G.chars.types().indexOf(t) >= 0
      );
    } catch (e) {
      return false;
    }
  };
  const at = (poi, n, dy) => {
    const v = K.anchor(poi, n);
    return v ? { x: v.x, y: v.y + (dy || 0), z: v.z, yaw: v.yaw || 0 } : null;
  };
  K.npc(() => {
    const p = at("waldorf", "boss");
    if (!p) return null;
    return {
      id: "pmid_wa_vale",
      type: typeOk("continuity_soldier") ? "continuity_soldier" : "human",
      outfit: "continuity_exo_rig",
      gender: "f",
      name: "Major Constance Vale",
      faction: "continuity",
      level: 15,
      hostile: true,
      ai: "guard",
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: p.yaw,
      home: { x: p.x, z: p.z, r: 7 },
      weapon: "gyrojet_carbine",
      voice: "continuity",
      noRespawn: true,
      inventory: [
        ["gyrojet_carbine", 1],
        ["ammo_gyrojet", 20],
        ["rally_tonic", 2],
        ["q_pmid_wa_codes", 1],
      ],
      barks: {
        combat: [
          "You are trespassing on federal property!",
          "For the Continuity!",
          "I have waited twenty-two years for a target like you.",
        ],
        idle: ["Signals, report.", "Where is my Bellevue team?"],
      },
      onDeath: () => {
        K.q.setFlag("pmid_vale_dead", true);
        K.news(
          "Reports from Park Avenue: the Continuity officer holed up in the Waldorf-Astoria has checked out. Permanently.",
        );
      },
    };
  });
  K.npc(() => {
    const p = at("metlife_tower", "boss");
    if (!p) return null;
    return {
      id: "pmid_ml_adjuster",
      type: typeOk("bulwark") ? "bulwark" : "patrolman",
      name: "Claims Adjuster Mk. IV",
      faction: "robots",
      level: 11,
      hostile: true,
      ai: "guard",
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: p.yaw,
      home: { x: p.x, z: p.z, r: 9 },
      voice: "patrolman",
      noRespawn: true,
      inventory: [
        ["pmid_fine_print", 1],
        ["pmid_ml_prudence_card", 1],
        ["dry_cell", 2],
        ["ammo_gyrojet", 12],
      ],
      barks: {
        combat: [
          "YOUR CLAIM HAS BEEN DENIED.",
          "PRE-EXISTING CONDITION DETECTED: MORTALITY.",
          "THIS ENCOUNTER IS NOT A COVERED EVENT.",
          "ADJUSTING... ADJUSTING...",
        ],
        idle: [
          "Reviewing claims. All claims denied.",
          "The light that never fails. The claim that never pays.",
        ],
      },
      onDeath: () => {
        K.q.setFlag("pmid_adjuster_dead", true);
      },
    };
  });
  K.npc(() => {
    const p = at("penn_station", "boss");
    if (!p) return null;
    return {
      id: "pmid_penn_conductor",
      type: typeOk("maniac_bruiser") ? "maniac_bruiser" : "maniac",
      name: "The Conductor",
      faction: "maniacs",
      level: 9,
      hostile: true,
      ai: "guard",
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: p.yaw,
      home: { x: p.x, z: p.z, r: 12 },
      noRespawn: true,
      inventory: [
        ["q_pmid_penn_key", 1],
        ["pmid_pocket_watch", 1],
        ["prussian_blue", 1],
      ],
      barks: {
        combat: [
          "[a long howl, like a train whistle]",
          "Aaaaa-BOOOOOO...",
          "[gibbering, punching an invisible ticket]",
        ],
      },
    };
  });
  K.npc(() => {
    const p = at("bellevue", "boss");
    if (!p) return null;
    return {
      id: "pmid_bv_chief",
      type: typeOk("brute") ? "brute" : "human",
      name: "Chief Resident Grogan",
      faction: "brutes",
      level: 12,
      hostile: true,
      ai: "guard",
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: p.yaw,
      home: { x: p.x, z: p.z, r: 10 },
      weapon: "fire_axe",
      voice: "brute",
      noRespawn: true,
      hp: 520,
      inventory: [
        ["fire_axe", 1],
        ["rally_tonic", 2],
        ["focus_pills", 1],
        ["scrip", 85],
      ],
      barks: {
        combat: [
          "Time for your CHECK-UP, humie!",
          "Doctor says: HOLD STILL!",
          "This will only hurt A LOT.",
          "Nurse! NURSE! ...Nurse is dead. Doctor does it himself.",
        ],
        idle: ["Hmm. Chart says patient is... tasty.", "Next!"],
      },
      onDeath: () => {
        K.q.setFlag("pmid_chief_dead", true);
      },
    };
  });

  // Picking up the Conductor's watch key unlocks the payroll box.
  G.events.on("itemAdded", (id) => {
    if (id === "q_pmid_penn_key") {
      if (K.unlockContainer("penn_station", "Broadway Limited Payroll Box"))
        K.say("The watch key fits the Broadway Limited payroll box.");
    }
  });
})();
