// play-inline-367 03 — title
// Lines 370-720 of readable/play-inline-367.pretty.js (statement-aligned).
  PF.note(
    "pws_note_director",
    "Director's Letter",
    "TO WHOMEVER OPENS THIS VAULT",
    'If you are reading this, the Bank of the Manhattan Company has failed — the first failure in one hundred and sixty-eight years of never missing a dividend. I do not know what has happened outside. The Colonel says it is "a disagreement with the Russians" and has offered to settle it personally. The radio says it is not the Russians at all. I do not know which of them to believe.\n\nTake the pistol. It was my father\'s. He said the bank was founded on a technicality and a duel, and that a gentleman ought to be ready for both.\n— J. Vandermeer III, President',
  );
  PF.note(
    "pws_note_seizure",
    "Seizure Report",
    "U.S. CUSTOMS — SEIZURE No. 67-02-27-114",
    'Seized from passenger trunk, S.S. Atlantic Star, Pier 11:\n1 revolver, nickel, .44 cal., serial defaced, engraved "PAY UP"\n4 cases Fizzo Cola (undeclared; import duty on beverages from the Boston bottling plant)\n2 boxes Rush (!!)\n$1,200 in U.S. currency, bundled\n\nOwner detained. Owner claims to be "a close personal friend of the Mayor." Owner released pending verification.\nVerification pending.',
  );
  PF.note(
    "pws_note_manifest",
    "Convoy Manifest",
    "FENWICK & SONS — MANIFEST, BATTERY → GRAND CENTRAL",
    '4 pack oxen (2 lame)\n220 lb Golden Plain Jerky\n60 purified water\n2 crates 10mm (from Cyrus — CHECK THE COUNT, he short-changed us in May)\n1 crate "medical" (Gorski\'s — do not open, do not shake)\nGuards: Tex, Juniper, Pete\n\nNote from H.: Toll at the Brooklyn Bridge doubled again. Route through City Hall instead. Stay off Wall St after dark — the bank robot is patrolling the steps again.',
  );
  PF.tapeReel(
    "pws_reel_marsh",
    "Hattie's Tape reel",
    'TAPE REEL — "THE WATER THING"',
    "[Hattie Fenwick, recording to herself.]\n\"Grandma Fenwick always said our family had 'paper' in the old bank. I thought she meant money. Turns out she meant a water charter — the Manhattan Company's. Aaron Burr's little trick: a water company that was really a bank. Near two hundred years later, nobody remembers the bank, and water is the only thing worth fighting over.\n\nI get that charter, I walk into every settlement from here to Harlem with the oldest legal claim to supplying water in the city. Nobody'll honour it, of course. But they'll listen. And a convoy master who gets listened to gets rich.\"",
  );

  // ---------------------------------------------------------------
  // Terminals
  // ---------------------------------------------------------------
  PF.terminal("pws_sp_parish", {
    title: "ST. PAUL'S CHAPEL — PARISH OFFICE",
    header:
      "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL — TRINITY PARISH NETWORK",
    entries: [
      {
        title: "History of the Chapel",
        text: "St. Paul's Chapel, consecrated October 30, 1766. Oldest surviving church building in Manhattan. George Washington worshipped here on Inauguration Day, April 30, 1789, and his pew is preserved in the north aisle beneath the first painting of the Great Seal of the United States. The chapel survived the Great Fire of 1776 and — the parish notes with some pride — every calamity since.",
      },
      {
        title: "Refuge Log (C.)",
        text: "Year 22 of the Refuge.\nSheltered this winter: 34. Buried: 3. Born: 2 (both loud).\nRamona has the gate. Hezekiah has the steeple. Doc Ainsworth has everything else, and complains about it.\nThe Stitchers came again in the spring. They did not come for food. They came for the Seal. Their leader cut it down with shears while I prayed and I did not stop praying. I am still not sure if that was faith or cowardice.",
      },
      {
        title: "Supply Ledger",
        text: "Water: 3 weeks (purifier in the undercroft needs a filter)\nFood: 2 weeks (potatoes, pigeon, Golden Plain Jerky from the Custom House — thank you Hattie)\nMedicine: low. Rally Tonic 4. Prussian Blue 2.\nAmmunition: we are a church.\nHope: adequate.",
      },
      {
        title: "Reliquary (restricted)",
        text: "The Reliquary under the chancel holds the parish silver, the General's sword and the vestry's emergency fund. The key is in the belfry strongbox, which Hezekiah guards, which is why it is safe, and also why nobody can get into it.",
      },
      {
        title: "Rector's Safe",
        text: "Combination reset after the spring raid: 0-4-3-0. (Inauguration Day. The General would approve.) The emergency fund is for EMERGENCIES, Wendell. — C.",
        learn: "pws_lk_sp_safe",
      },
    ],
  });
  PF.terminal("pws_sg_foreman", {
    title: "SINGER MFG. CO. — FLOOR 2 FOREMAN",
    header: "KESTREL TELETYPE CORP. — MODEL 40 — SINGER MANUFACTURING COMPANY",
    lock: { id: "pws_lk_sg_term", passcode: "PRESSERFOOT" },
    entries: [
      {
        title: 'Memo: Model 1967 "Atomic Stitch"',
        text: "The Atomic Stitch (with electric treadle assist!) will be demonstrated to buyers from Sterling's next Tuesday. The demonstrator machine sews 4,000 stitches a minute and has only caught one sleeve on fire this week. Remind the models to wear the asbestos gloves.",
      },
      {
        title: "Memo: Tower Security",
        text: 'The Observation Lantern is CLOSED to visitors until the Army finishes installing its "weather radar" up there. Please stop asking the Army what the weather radar is for.',
      },
      {
        title: "STITCHERS SHOPPING LIST",
        text: '[Typed with two fingers.]\n- MORE THREAD\n- more needles (Needles ate some)\n- leather (good) (not the other kind) (ok the other kind is fine too)\n- paint for mannequins, red\n- find the church painting a frame that is less "church"\n- BOBBIN SAYS: nobody goes up to the Lantern without knocking. KNOCK.',
      },
      {
        title: "Payroll 3/67 (corrupted)",
        text: "EMPLOYEE    HOURS    RATE\nBOBBIN, M.   ####     ####\n...\n[DATA CORRUPTED — PLEASE CONTACT YOUR KESTREL TELETYPE REPRESENTATIVE]",
      },
    ],
  });
  PF.terminal("pws_fw_security", {
    title: "BANK OF THE MANHATTAN CO. — SECURITY",
    header:
      "KESTREL TELETYPE CORP. — MODEL 40 — MANHATTAN CO. SECURITY SUBSYSTEM",
    lock: { id: "pws_lk_fw_secterm", passcode: "WEEHAWKEN" },
    entries: [
      {
        title: "Robot Status",
        text: 'UNIT "COLONEL BURR" (Valet-M, dueling etiquette module v1.804): ACTIVE — patrolling SAFE DEPOSIT VAULT. Mood: aggrieved.\nPATROLMAN UNITS: ACTIVE (banking hall)\nBULWARK UNIT "TELLER 9": ACTIVE (vault antechamber)\nSTATUS OF CUSTOMERS: none present for 5,740 business days.',
      },
      {
        title: "Turret Control",
        text: "Banking-hall defence turrets: 2 units, currently ARMED (Hostiles: everyone).",
        entries: [
          {
            title: "Deactivate Hall Turrets",
            action: () => {
              if (PF.live("props") && G.props.setTurrets)
                G.props.setTurrets("pws_fw_turrets", "off");
              G.notify("Banking-hall turrets: OFFLINE.");
              PF.setFlag("fw_turrets_off", true);
            },
            text: "Turrets powering down. Thank you for banking with the Manhattan Company.",
          },
          {
            title: "Activate Hall Turrets",
            action: () => {
              if (PF.live("props") && G.props.setTurrets)
                G.props.setTurrets("pws_fw_turrets", "on");
              G.notify("Banking-hall turrets: ARMED.");
              PF.setFlag("fw_turrets_off", false);
            },
            text: "Turrets armed.",
          },
        ],
      },
      {
        title: "Vault Beam Grid",
        text: () =>
          "Photoelectric intrusion grid (vault level): " +
          (PF.flag("fw_lasers_off")
            ? "OFFLINE."
            : "ARMED — 3 beams. Breach response: PATROLMAN DISPATCH."),
        entries: [
          {
            title: "Disable Beam Grid",
            cond: () => !PF.flag("fw_lasers_off"),
            action: () => {
              PF.setFlag("fw_lasers_off", true);
              G.notify("Vault beam grid: OFFLINE.");
            },
            text: "Grid disengaged. Please do not touch the gold.",
          },
        ],
      },
      {
        title: "Vault Time Lock",
        text: "Time lock status: ENGAGED. Scheduled release: MONDAY 09:00 (next banking day).\nCurrent date: ERROR.",
        entries: [
          {
            title: "Emergency Override — Open Vault Door",
            cond: () => !PF.flag("fw_vault_open"),
            action: () => {
              PF.lockUnlock("pws_lk_fw_vault");
              PF.openFortyVault(
                "Far below, ninety tons of Mosler steel shudder and begin to swing open.",
              );
            },
            text: "OVERRIDE ACCEPTED. The vault door is opening. Please mind the gap.",
          },
        ],
      },
      {
        title: "Incident Log",
        text: "MAR '67 09:47 — Power surge. Staff evacuated to the basement (the Civil Defense shelter allotment never came through).\nMAR '67 10:12 — Colonel Burr reports \"enemy action\". Colonel Burr challenges enemy to a duel. Enemy is a mushroom cloud.\n'67 — '89 — [14,203 entries: \"INTRUDER DETECTED. INTRUDER CORRECTED.\"]",
      },
    ],
  });
  PF.terminal("pws_fw_president", {
    title: "OFFICE OF THE PRESIDENT — J. VANDERMEER III",
    header: "KESTREL TELETYPE CORP. — MODEL 40 — MANHATTAN CO. EXECUTIVE",
    lock: { id: "pws_lk_fw_presterm", passcode: "DIVIDEND" },
    entries: [
      {
        title: "Letter to the Board",
        text: 'Gentlemen, the Chrysler people have again written to "congratulate" us on our height. I would remind the Board that we were the tallest building in the world for eleven days in 1930, and that eleven days is eleven days. I will not have that spire mentioned at the Christmas party.',
      },
      {
        title: "Re: Colonel Burr",
        text: 'The security unit has once again refused to process a deposit made in ten-dollar bills, on the grounds that they bear "the face of a scoundrel." I have asked Maintenance to remove the historical personality module. Maintenance informs me the Colonel has "challenged them to a duel" and they are "taking it under advisement."',
      },
      {
        title: "Safe Deposit Box 1804",
        text: 'Box 1804 — renter of record: M. Fenwick & Sons, Carriers. Contents declared: "family papers." Rent paid through 1999. Note from the manager: the renter asked that the box never be opened for anyone without the claim ticket. I have assured her the Bank has never once lost a document. The Colonel would be most offended at the suggestion.',
      },
      {
        title: "Personal: Wall Safe",
        text: "Combination: 0-7-1-1, the date of the Colonel's favourite duel. He will not stop bringing it up, so at least I will never forget it.",
        learn: "pws_lk_fw_pres_safe",
      },
    ],
  });
  PF.terminal("pws_ch_collector", {
    title: "CUSTOM HOUSE — COLLECTOR'S OFFICE",
    header:
      "KESTREL TELETYPE CORP. — MODEL 40 — U.S. CUSTOMS SERVICE, PORT OF NEW YORK",
    entries: [
      {
        title: "Trading Post Rules (H. Fenwick)",
        text: "1. Weapons holstered past the Continents.\n2. Scales are checked every morning. Complaints to Hattie. Hattie does not accept complaints.\n3. No oxen in the Rotunda. (Looking at you, Pete.)\n4. Thieves are handed to Tex. Tex hands them to the harbour.\n5. The murals are not target practice.",
      },
      {
        title: "About the Building",
        text: "Alexander Hamilton U.S. Custom House, 1907, Cass Gilbert. Built to collect the import duties that paid for most of the Federal government. The Four Continents out front by Daniel Chester French. The Rotunda murals — ships entering the harbour — were painted in 1937. Hamilton would have approved of the building. He would have approved even more of the duties.",
      },
      {
        title: "Convoy Accounts",
        learn: "pws_lk_ch_safe",
        text: 'FENWICK & SONS — Q3\nIncome: 4,210 scrip\nExpenses: 3,960 scrip (ammo 1,100 — CYRUS; tolls 900; ox feed 640; Tex 800; "misc. Gorski" 520)\nNet: 250 scrip and a lame ox.\n\nLedger Room safe: 1-9-0-7 (the year they built this place — even Tex can remember that).\n\nWith the water charter, I could bid for the Chambers St. pumping station contract. Without it, I\'m just another trader with a scale.',
      },
    ],
  });

  // ---------------------------------------------------------------
  // Quests
  // ---------------------------------------------------------------
  const ext = (k) => (PF[k] && PF[k].door) || null;
  const inner = (poi, name) => {
    try {
      return G.pois.getAnchor(poi, name);
    } catch (e) {
      return null;
    }
  };
  PF.quest({
    id: "pws_seal",
    name: "The Great Seal",
    giver: "Sister Constance",
    location: "St. Paul's Chapel",
    desc: "The Stitchers — raiders who hold the Singer Building — cut the painting of the Great Seal from the canopy over George Washington's pew at St. Paul's Chapel and carried it up to their matriarch's nest in the Singer's lantern. Sister Constance, keeper of St. Paul's Refuge, wants it back.",
    stages: [
      {
        id: "singer",
        text: "Recover the Great Seal from Madame Bobbin's nest in the lantern of the Singer Building.",
        markers: () => {
          if (PF.inCell("singer_building")) {
            const a = inner("singer_building", "lantern");
            return a
              ? [
                  {
                    x: a.x,
                    z: a.z,
                    y: a.y,
                    label: "The Lantern",
                    interior: true,
                  },
                ]
              : [];
          }
          // on the doorstep (the portal itself sits in the facade): where the lobby exit puts the player
          const S = PF.SG;
          if (S && isFinite(S.X1) && isFinite(S.TZC))
            return [{ x: S.X1 + 2.6, z: S.TZC, label: "Singer Building" }];
          const d = ext("SG");
          return d ? [{ x: d.x, z: d.z, label: "Singer Building" }] : [];
        },
      },
      {
        id: "return",
        text: "Return the Great Seal to Sister Constance at St. Paul's Chapel.",
        markers: () => {
          if (PF.inCell("st_pauls_chapel")) {
            const a = inner("st_pauls_chapel", "constance");
            return a
              ? [
                  {
                    npc: "pws_sp_constance",
                    x: a.x,
                    z: a.z,
                    y: a.y,
                    label: "Sister Constance",
                    interior: true,
                  },
                ]
              : [];
          }
          const d = ext("SP");
          return d ? [{ x: d.x, z: d.z, label: "St. Paul's Chapel" }] : [];
        },
      },
    ],
    rewards: { xp: 400, scrip: 150, standing: 40 },
  });
  PF.quest({
    id: "pws_deposit",
    name: "Safe Deposit",
    giver: "Hattie Fenwick",
    location: "Custom House Trading Post",
    desc: "Hattie Fenwick, convoy master of the Custom House Trading Post, holds the claim ticket to safe-deposit box No. 1804 in the vault of 40 Wall Street — once Aaron Burr's Bank of the Manhattan Company. Inside, she believes, is the company's 1799 water charter. The bank's security robots never stopped working.",
    stages: [
      {
        id: "enter",
        text: "Get into the Bank of the Manhattan Company at 40 Wall Street.",
        markers: () => {
          const d = ext("FW");
          return d ? [{ x: d.x, z: d.z, label: "40 Wall Street" }] : [];
        },
      },
      {
        id: "vault",
        text: "Open the time-locked vault door (the security office terminal, or an override card).",
        markers: () => {
          const a = inner(
            "forty_wall",
            PF.flag("fw_turrets_off") ? "vault_door" : "sec",
          );
          const d = ext("FW");
          return PF.inCell("forty_wall") && a
            ? [{ x: a.x, z: a.z, y: a.y, label: "Vault", interior: true }]
            : d
              ? [{ x: d.x, z: d.z, label: "40 Wall Street" }]
              : [];
        },
      },
      {
        id: "box",
        text: "Open safe-deposit box No. 1804.",
        markers: () => {
          const a = inner("forty_wall", "box1804");
          const d = ext("FW");
          return PF.inCell("forty_wall") && a
            ? [
                {
                  x: a.x - 0.9,
                  z: a.z,
                  y: a.y - 1.25,
                  label: "Box No. 1804",
                  interior: true,
                },
              ]
            : d
              ? [{ x: d.x, z: d.z, label: "40 Wall Street" }]
              : [];
        },
      },
      {
        id: "return",
        text: "Bring the Manhattan Company charter to Hattie Fenwick at the Custom House.",
        markers: () => {
          if (PF.inCell("custom_house")) {
            const a = inner("custom_house", "hattie");
            return a
              ? [
                  {
                    npc: "pws_ch_hattie",
                    x: a.x,
                    z: a.z,
                    y: a.y,
                    label: "Hattie Fenwick",
                    interior: true,
                  },
                ]
              : [];
          }
          const d = ext("CH");
          return d ? [{ x: d.x, z: d.z, label: "Custom House" }] : [];
        },
      },
    ],
    rewards: { xp: 450, standing: 10 },
  });
  // quest triggers: picking up the Seal; entering the bank
