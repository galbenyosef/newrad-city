// play-inline-226 03 — hint
// Lines 315-499 of readable/play-inline-226.pretty.js (statement-aligned).
  LI.LOCKS = {
    // UN General Assembly
    un_sg_safe: {
      id: "li_un_sg_safe",
      label: "Secretary-General's Safe",
      kind: "safe",
      code: "2410",
      hint: "A memo on the UN records terminal (strongroom) gives the combination: UN Day, 24 October.",
      learnedFrom: "UN records terminal — memo on the Secretary-General's suit",
    },
    un_records_term: {
      id: "li_un_records_term",
      label: "UN Records Terminal",
      kind: "terminal",
      passcode: "PEACEKEEPER",
      hint: "The staff notice on the visitor centre terminal in the GA lobby.",
      learnedFrom: "UN visitor centre terminal — staff notice",
    },
    un_project_term: {
      id: "li_un_project_term",
      label: "Project Knickerbocker Terminal",
      kind: "terminal",
      passcode: "MORNINGSTAR",
      hint: "Major Keel's orders lie on the desk beside the terminal; Keel also gives it to a guest she trusts.",
      learnedFrom: ["Orders: Science Liaison Keel", "Major Keel"],
    },
    // 30 Rockefeller Plaza
    rock_war_term: {
      id: "li_rock_war_term",
      label: "War Room Terminal",
      kind: "terminal",
      passcode: "LONGWATCH",
      hint: "Lancer Dalca gives it out; it is also chalked on the case of the recall tape reel in the war room.",
      learnedFrom: ["Lancer Dalca", "Tape reel: Recall Order No. 5"],
    },
    // NYSE
    nyse_board_term: {
      id: "li_nyse_board_term",
      label: "NYSE Governors' Terminal",
      kind: "terminal",
      passcode: "BELLRINGER",
      hint: "The Board of Governors minutes on the boardroom table.",
      learnedFrom: "Board of Governors — Minutes",
    },
    nyse_gov_safe: {
      id: "li_nyse_gov_safe",
      label: "Governors' Safe",
      kind: "safe",
      code: "1817",
      hint: 'The governors\' terminal (boardroom), entry "Strongroom Access".',
      learnedFrom: "NYSE governors' terminal",
    },
    nyse_strongroom: {
      id: "li_nyse_strongroom",
      label: "Exchange Strongroom",
      kind: "door",
      key: "key_exchange_vault",
      code: "1792",
      hint: "Bull Market Bruno carries the key; the dial combination is on the governors' terminal.",
      keyFrom: '"Bull Market" Bruno',
      learnedFrom: "NYSE governors' terminal",
    },
    nyse_box_1929: {
      id: "li_nyse_box_1929",
      label: "Deposit Box 1929",
      kind: "safe",
      code: "1029",
      hint: 'The governors\' terminal (boardroom), entry "Strongroom Access".',
      learnedFrom: "NYSE governors' terminal",
    },
    nyse_cage: {
      id: "li_nyse_cage",
      label: "Pit Cage",
      kind: "door",
      key: "li_pit_key",
      hint: "Bruno carries the cage key; a spare lies at Post 11 on the trading floor.",
      keyFrom: ['"Bull Market" Bruno', "Post 11 (trading floor)"],
    },
    // Woolworth
    ww_office_term: {
      id: "li_ww_office_term",
      label: "Woolworth Accounts Terminal",
      kind: "terminal",
      passcode: "CATHEDRAL",
      hint: "Penny Dreadful's standing orders (tape reel in the five-and-dime den).",
      learnedFrom: "Tape reel: Five & Dime Orders",
    },
    ww_mezz_safe: {
      id: "li_ww_mezz_safe",
      label: "Petty Cash Safe",
      kind: "safe",
      code: "0424",
      hint: 'The accounts terminal on the office floor, entry "Petty Cash".',
      learnedFrom: "Woolworth accounts terminal",
    },
    ww_strongbox: {
      id: "li_ww_strongbox",
      label: "Penny's Strongbox",
      kind: "container",
      key: "li_ww_strongbox_key",
      code: "1879",
      hint: "Penny Dreadful carries the key; Squint's pencil note on the founder's letter (office floor) gives the dial.",
      keyFrom: "Penny Dreadful",
      learnedFrom: "Letter on the Founder's Desk",
    },
    // City Hall
    ch_mayor_safe: {
      id: "li_ch_mayor_safe",
      label: "The Mayor's Safe",
      kind: "safe",
      code: "1803",
      hint: "The Mayor's unaired address (tape reel on the Blue Room desk).",
      learnedFrom: "Tape reel: Mayor's Address",
    },
    ch_council_term: {
      id: "li_ch_council_term",
      label: "Speaker's Terminal",
      kind: "terminal",
      passcode: "QUORUM",
      hint: "The margin of the Council agenda in the chamber.",
      learnedFrom: "Council Agenda",
    },
    // Flatiron
    fl_ledger_term: {
      id: "li_fl_ledger_term",
      label: "Post Master's Ledger",
      kind: "terminal",
      passcode: "SKIDOO",
      hint: "The Wedge's guest ledger (Mavis's note) or Lorena Hightower once Nate is home.",
      learnedFrom: ["The Wedge — Guest Ledger", "Lorena Hightower"],
    },
    fl_post_safe: {
      id: "li_fl_post_safe",
      label: "Post Master's Safe",
      kind: "safe",
      code: "1902",
      hint: 'The Post Master\'s ledger terminal, entry "The Safe".',
      learnedFrom: "Post Master's ledger terminal",
    },
    fl_room22: {
      id: "li_fl_room22",
      label: "The Wedge, Room 22",
      kind: "door",
      key: "li_wedge_key",
      hint: "Rent it from Mavis at the reception.",
      keyFrom: "Mavis Wojcik (rent)",
    },
  };
  LI.readyFns.push(() => {
    for (const k in LI.LOCKS) LI.registerLock(LI.LOCKS[k]);
  });
  /** Items with `learn: lockId` teach their code when read (the locks module also does this on pickup). */
  try {
    G.events.on("noteRead", (id) => {
      if (
        typeof id !== "string" ||
        id.indexOf("li_") !== 0 ||
        !live("items") ||
        !G.items.get
      )
        return;
      const d = G.items.get(id);
      if (d && d.learn) LI.learnCode(d.learn, d.name);
    });
  } catch (e) {
    /* events absent */
  }
  /** Terminal entry text that also logs a code when printed. */
  LI.codeText = (lockKey, text) => {
    const s = LI.LOCKS[lockKey];
    return {
      learn: s.id,
      text: () => {
        LI.learnCode(s.id, s.learnedFrom && [].concat(s.learnedFrom)[0]);
        return text;
      },
    };
  };

  /** The hero's name (never hard-coded). */
  LI.hero = () => (G.HERO && G.HERO.name) || "stranger";

  /** Relation helpers */
  LI.inCell = (C, p) =>
    p && Math.abs(p.x - C.O.x) < 170 && Math.abs(p.z - C.O.z) < 170;
