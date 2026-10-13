// play-inline-397 04 — title
// Lines 1893-1980 of readable/play-inline-397.pretty.js (statement-aligned).
  function termDocket() {
    return {
      title: "JEFFERSON MARKET — DOCKET",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\nThird Judicial District · Ardent Robotics Judicial Automation Pilot · Docket Server",
      entries: [
        {
          title: "Today's Calendar",
          text: "DOCKET 67-0413 · People v. F. Zielinski · Curfew violation (L.L. 9/1957), resisting · Status: HELD PENDING TRIAL (19 days)\nDOCKET 67-0412 · People v. Pigeon (unnamed) · Littering · Status: CONTINUED (8,034 days)\nDOCKET 67-0411 · People v. Weather · Arson (lightning) · Status: DEFENDANT DID NOT APPEAR",
        },
        {
          title: "Municipal Code Index — Curfews",
          text: "Local Law 9 of 1957 — Youth & Public Curfew, 22:00–05:00.\n  Amended 1961, 1963.\n  REPEALED: Local Law 44 of 1966 (see law library, bound volume 1966, shelf C).\n\nNOTE TO MAGISTRATE UNIT: repeal table not loaded into case-law core. Ticket #88213 open since 10/1967.",
        },
        {
          title: "Evidence Room — Custody Codes",
          learn: [LK.evidence.id, LK.spare.id],
          text: () => {
            K.learn(LK.evidence.id);
            K.learn(LK.spare.id);
            return "Locker 67-0413 (Zielinski, F. — personal effects): custody code 6704.\nLocker 66-9120 (bailiff spares — cell keys, sidearm ammunition): custody code 6691.\n\nCodes are for HUMAN clerks. Bailiff units do not require codes. Bailiff units ARE the code.";
          },
        },
        {
          title: "Magistrate Unit — Service Notes",
          learn: LK.detention.id,
          text: () => {
            K.learn(LK.detention.id);
            return 'MK-IX exhibits "procedural attachment." Will not dismiss a case without a motion, evidence, or a pardon from chambers. Will not recognise the end of the world as a legal event.\n\nTechnician remark: honestly, same as the last judge.\n\nTicket #88214: detention cell-control console password reset to HABEAS. Tell the night clerk.';
          },
        },
      ],
    };
  }
  function termChambers() {
    return {
      title: "CHAMBERS — HON. E. HALLORAN",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\nJudicial Override Console — AUTHORISED JUSTICES ONLY",
      lock: LK.chambers,
      entries: [
        {
          title: "Personal Log — 03/02/67",
          learn: LK.safe.id,
          text: () => {
            K.learn(LK.safe.id);
            return 'The magistrate unit wants my signature key "for continuity." I gave it the key. I kept the override. A judge should always be able to say: enough.\n\nNote to self, since my memory is going the way of the docket: the safe is 1-1-2-6, the day I was sworn in.';
          },
        },
        {
          title: "Pending Matters",
          text: 'One active detention: Docket 67-0413 (Zielinski). Magistrate recommends: "Continue until the law is followed."',
        },
        {
          title: "Issue Executive Pardon: Docket 67-0413",
          cond: () => PV.jm && PV.jm.canPardon(),
          text: "PARDON ENTERED. Detention release order transmitted to the detention level.",
          action: () => PV.jm && PV.jm.release("pardon"),
        },
      ],
    };
  }
  function termDetention() {
    return {
      title: "DETENTION LEVEL — CELL CONTROL",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\nWomen's House of Detention (annex) · Bailiff Network",
      lock: LK.detention,
      entries: [
        {
          title: "Occupancy",
          text: "CELL 1 — deceased (1967). Record retained.\nCELL 2 — KAMINSKI, D. · held pending trial.\nCELL 3 — vacant.\nCELL 4 — deceased (1968). Record retained.\nCELL 5 — vacant.",
        },
        {
          title: "Bailiff Directive",
          text: 'Unauthorised cell release will be treated as CONTEMPT OF COURT. Bailiff units are authorised to use Proportionate Force (see Directive 7: "Proportionate" is at the unit\'s discretion).',
        },
        {
          title: "Open Cell 2 (unauthorised)",
          cond: () => PV.jm && PV.jm.dotHeld(),
          text: "CELL 2 BOLTS RELEASED. WARNING: BAILIFF NETWORK NOTIFIED.",
          action: () => PV.jm && PV.jm.release("jailbreak"),
        },
      ],
    };
  }

  PV.INT.jm = interior;
