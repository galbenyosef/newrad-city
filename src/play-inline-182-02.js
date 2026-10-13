// play-inline-182 02 — title
// Lines 12-319 of readable/play-inline-182.pretty.js (statement-aligned).
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
