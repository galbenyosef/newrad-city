// play-inline-367 02 — the
// Lines 22-369 of readable/play-inline-367.pretty.js (statement-aligned).
  const PF = G._pws;
  const HP = Math.PI / 2;

  // ---------------------------------------------------------------
  // Unique weapons & apparel (built from the live weapon defs at initDone)
  // ---------------------------------------------------------------
  const uniqueWeapon = (id, baseId, name, mult, extra, desc, value, weight) =>
    PF.item({
      id,
      build() {
        const base = PF.live("items") ? G.items.get(baseId) : null;
        const w =
          base && base.weapon
            ? Object.assign(
                {},
                base.weapon,
                { damage: Math.round((base.weapon.damage || 20) * mult) },
                extra || {},
              )
            : undefined;
        return {
          id,
          type: w ? "weapon" : "misc",
          name,
          weight: weight || (base ? base.weight : 3),
          value,
          unique: true,
          icon: base ? base.icon : undefined,
          desc,
          weapon: w,
        };
      },
    });
  uniqueWeapon(
    "pws_vigil",
    "hunting_rifle",
    "The Vigil",
    1.35,
    { spread: 0.004, critChance: 1.5, condDecay: 0.0012 },
    "The refuge's watch rifle, kept oiled in St. Paul's belfry for twenty years and passed from lookout to lookout. Notches on the stock: one for every night nobody died. There are a great many notches.",
    900,
    9,
  );
  uniqueWeapon(
    "pws_montgomery_saber",
    "combat_knife",
    "General Montgomery's Sword",
    2.2,
    { critMult: 3, meleeRange: 2.6 },
    "A Continental Army officer's small-sword, entombed with the General's memory under St. Paul's since 1818. The blade has kept better than the Republic did.",
    700,
    3,
  );
  uniqueWeapon(
    "pws_bobbin_shears",
    "switchblade",
    "Madame Bobbin's Shears",
    2.4,
    { critChance: 4, critMult: 2.5 },
    "Nine inches of German tailoring steel, honed to a whisper. The Stitchers' matriarch cut cloth, hair and throats with them, in roughly that order.",
    450,
    2,
  );
  uniqueWeapon(
    "pws_manhattan_pistol",
    "pistol_10mm",
    "Burr's Reply",
    1.4,
    { spread: 0.012, critChance: 2.5 },
    'A presentation-grade 10mm from the Director\'s vault, gold inlay on the slide: "THE BANK OF THE MANHATTAN COMPANY — EST. 1799 — WE NEVER MISS." A little on the nose, considering.',
    1100,
    3,
  );
  uniqueWeapon(
    "pws_duty_collector",
    "magnum_44",
    "The Duty Collector",
    1.3,
    { spread: 0.014, critChance: 2 },
    'Seized by U.S. Customs from a smuggler\'s trunk in March 1967: a nickel .44 with the serial number filed off and "PAY UP" engraved on the cylinder. Evidence, technically.',
    1000,
    4,
  );
  PF.item({
    id: "pws_convoy_duster",
    type: "apparel",
    slot: "body",
    name: "Convoy Master's Duster",
    weight: 5,
    value: 380,
    dr: 12,
    attrs: { presence: 1, grit: 1 },
    outfit: "survivor",
    unique: true,
    desc: "Hattie Fenwick's spare coat: oxhide over a steel-plated vest, a hundred pockets for a hundred receipts. People haggle less with whoever wears it.",
  });

  // ---------------------------------------------------------------
  // Quest / key / misc items
  // ---------------------------------------------------------------
  PF.item({
    id: "pws_great_seal",
    type: "misc",
    name: "The Great Seal of St. Paul's",
    weight: 3,
    value: 400,
    quest: true,
    desc: 'The oldest painting of the arms of the United States, from the canopy over George Washington\'s pew. Oil on canvas, gilt frame, and a Stitchers price tag pinned to the corner: "NOT 4 SALE — BOBBIN".',
  });
  PF.item({
    id: "pws_claim_ticket",
    type: "key",
    name: "Claim Ticket No. 1804",
    weight: 0,
    value: 0,
    quest: true,
    desc: 'A Bank of the Manhattan Company safe-deposit claim ticket for box No. 1804, with a tiny brass key threaded on its string. Renter: "M. FENWICK & SONS, CARRIERS".',
  });
  PF.item({
    id: "pws_charter",
    type: "misc",
    name: "The Manhattan Company Charter",
    weight: 1,
    value: 250,
    quest: true,
    desc: 'A 1799 legislative charter "for supplying the City of New York with pure and wholesome water" — with, in the small print, a clause letting the company do anything else it liked with its capital. Aaron Burr wrote the small print.',
  });
  PF.item({
    id: "pws_override_card",
    type: "key",
    name: "Vault Override Card",
    weight: 0,
    value: 0,
    desc: 'A brass-edged keycard stamped "MANHATTAN CO. — SECURITY — TIME LOCK OVERRIDE".',
  });
  PF.item({
    id: "pws_director_key",
    type: "key",
    name: "Director's Vault Key",
    weight: 0,
    value: 0,
    desc: 'A long key on a velvet fob: "DIRECTOR\'S VAULT. DO NOT DUPLICATE."',
  });
  PF.item({
    id: "pws_evidence_key",
    type: "key",
    name: "Customs Evidence Key",
    weight: 0,
    value: 0,
    desc: "Hattie Fenwick's old U.S. Customs key to the Evidence Cage in the Custom House basement.",
  });
  PF.item({
    id: "pws_reliq_key",
    type: "key",
    name: "Reliquary Key",
    weight: 0,
    value: 0,
    desc: 'An iron key tagged in neat handwriting: "Reliquary — for emergencies only — C."',
  });
  PF.item({
    id: "pws_communion_silver",
    type: "misc",
    name: "Colonial Communion Silver",
    weight: 2,
    value: 180,
    desc: "A chalice and paten of 1766 New York silver, black with tarnish. Worth a fortune to a collector, or a lot of guilt to a thief.",
  });

  // ---------------------------------------------------------------
  // Locks (G.locks): every key, code and passcode in the module, and where its unlock is
  // ---------------------------------------------------------------
  PF.regLock({
    id: "pws_lk_sp_reliq",
    label: "Reliquary Grille",
    kind: "door",
    key: "pws_reliq_key",
    hint: "The Reliquary key is in the Lookout's Strongbox in the belfry.",
  });
  PF.regLock({
    id: "pws_lk_sp_belfry",
    label: "Lookout's Strongbox",
    kind: "container",
    code: "1766",
    hint: "Hezekiah will tell you; his belfry log hints at it too.",
  });
  PF.regLock({
    id: "pws_lk_sp_safe",
    label: "Rector's Safe",
    kind: "safe",
    code: "0430",
    hint: "The parish office teletype has the combination.",
  });
  PF.regLock({
    id: "pws_lk_sg_term",
    label: "Singer Foreman's Teletype",
    kind: "terminal",
    passcode: "PRESSERFOOT",
    hint: "The Stitchers' toll ledger in the lobby.",
  });
  PF.regLock({
    id: "pws_lk_sg_armory",
    label: "Stitchers Armory Locker",
    kind: "container",
    code: "5190",
    hint: "Scratched into the dome wall beside the locker.",
  });
  PF.regLock({
    id: "pws_lk_sg_chest",
    label: "Madame Bobbin's Hope Chest",
    kind: "container",
    key: "pws_bobbin_key",
    hint: "Madame Bobbin wears the key.",
  });
  PF.regLock({
    id: "pws_lk_fw_secterm",
    label: "Manhattan Co. Security Teletype",
    kind: "terminal",
    passcode: "WEEHAWKEN",
    hint: "The sticky note on the President's blotter.",
  });
  PF.regLock({
    id: "pws_lk_fw_presterm",
    label: "President's Teletype",
    kind: "terminal",
    passcode: "DIVIDEND",
    hint: "The sticky note on the President's blotter.",
  });
  PF.regLock({
    id: "pws_lk_fw_pres_safe",
    label: "President's Safe",
    kind: "safe",
    code: "0711",
    hint: "The President's teletype.",
  });
  PF.regLock({
    id: "pws_lk_fw_vault",
    label: "Vault Door (time lock)",
    kind: "door",
    key: "pws_override_card",
    hint: "Colonel Burr carries the override card; the security teletype can also open the door.",
  });
  PF.regLock({
    id: "pws_lk_fw_director",
    label: "Director's Vault Gate",
    kind: "door",
    key: "pws_director_key",
    hint: "Colonel Burr carries the Director's key.",
  });
  PF.regLock({
    id: "pws_lk_fw_1804",
    label: "Safe-Deposit Box No. 1804",
    kind: "container",
    key: "pws_claim_ticket",
    hint: "Hattie Fenwick holds the claim ticket and its renter's key.",
  });
  PF.regLock({
    id: "pws_lk_ch_cage",
    label: "Evidence Cage",
    kind: "door",
    key: "pws_evidence_key",
    hint: 'Hattie Fenwick hands over the key when "Safe Deposit" is done.',
  });
  PF.regLock({
    id: "pws_lk_ch_safe",
    label: "Ledger Room Safe",
    kind: "safe",
    code: "1907",
    hint: 'The Collector\'s Office teletype, "Convoy Accounts".',
  });
  PF.keyFrom("pws_claim_ticket", 'NPC: Hattie Fenwick (starts "Safe Deposit")');
  PF.keyFrom("pws_evidence_key", "quest reward: Safe Deposit (Hattie Fenwick)");
  PF.keyFrom("pws_override_card", "NPC: Colonel Burr (carried)");
  PF.keyFrom("pws_director_key", "NPC: Colonel Burr (carried)");
  PF.keyFrom("pws_bobbin_key", "NPC: Madame Bobbin (carried)");
  PF.item({
    id: "pws_bobbin_key",
    type: "key",
    name: "Bobbin's Chest Key",
    weight: 0,
    value: 0,
    desc: "A tiny brass key on a red ribbon, the kind that comes with a hope chest. Madame Bobbin wore it round her neck.",
  });

  // ---------------------------------------------------------------
  // Notes & tape reels
  // ---------------------------------------------------------------
  PF.note(
    "pws_note_1776",
    "Parish Record, 1776",
    "VESTRY MINUTES — SEPTEMBER 22, 1776",
    "The fire began in a tavern by Whitehall Slip and ran up the west side of the town all night. Trinity is lost. St. Paul's stands only because the men of the parish stood on her roof with buckets until dawn, and the wind turned.\n\nLet it be written that the chapel was saved not by miracle but by stubbornness. God may take the credit if He wishes.",
  );
  PF.note(
    "pws_note_lookout",
    "Hezekiah's Log",
    "BELFRY LOG — HEZEKIAH",
    "Day 1. Sister gave me the Vigil and the key. Said watch the north. Watched the north.\nDay 40. Raiders on Fulton. Rang the bell. Nobody died.\nDay 212. Smoke from the Singer again. The ones in the lantern have a rifle as good as mine. I can see her up there sometimes, the woman in the scrap pauldron. She waves. I do not wave back.\nDay 213. I waved back. She shot the weathervane. Sister says I am not to wave anymore.",
  );
  PF.tapeReel(
    "pws_reel_constance",
    "Sister Constance's Recording",
    'TAPE REEL — "ON KEEPING"',
    "[A woman's voice, tired but even.]\n\"They ask me what order I belong to. I tell them the Order of the Unlocked Door. There were other chapels, other shelters. They closed their doors to keep the dying out and they died anyway, only slower and among fewer friends.\n\nThis building has stood since before there was a country. It burned around, it was bombed around, it was looted and it was loved. It is still here. So are we.\n\nIf you are hearing this and I am gone: keep the door unlocked. Keep the soup hot. Keep the Seal over Washington's pew, if those scissors-happy lunatics ever give it back. The rest will work itself out.\"",
  );
  PF.note(
    "pws_note_soup",
    "Soup Roster",
    "ST. PAUL'S — SOUP ROSTER",
    "MON — Mercy (potato & pigeon)\nTUE — Brother Amos (pigeon & potato)\nWED — Mercy (rooftop-garden surprise — surprise: it's potato)\nTHU — Wendell (NO. We discussed this. Not after the raccoon incident.)\nFRI — Mercy\nSAT — Whoever didn't hide\nSUN — Sister C. (she burns it; eat it anyway, she's the Sister)",
  );
  PF.tapeReel(
    "pws_reel_singer",
    "Elevator Operator's Tape reel",
    "TAPE REEL — OTIS CAR No. 2, MARCH 1967",
    "[Elevator music, then a man clearing his throat.]\n\"Floor thirty-four, the Lantern, gentlemen. Sunday shift for the Army's weather radar, I know, I know — oh. Oh, what's that light up north, over the Bronx? That's — gentlemen, please remain calm, please stay in the car — no, don't — the doors don't — sir, that's the emergency brake, don't—\"\n[A long metallic shriek. The recording keeps running for eleven minutes of silence and one very quiet \"Going down.\"]",
  );
  PF.note(
    "pws_note_toll",
    "Toll Ledger",
    "STITCHERS TOLL — THE LOBBY",
    "Paid: 50 scrip (merchant)\nPaid: 50 scrip (other merchant)\nPaid: 1 ear (Dutch Tony. said he was \"good for it.\" he was not)\nPaid: 50 scrip + a very nice hat\nNot paid: the big guy with the burn scars. just walked through. we let him. he was scary\nNot paid: Needles' mom. Needles says she doesn't have to. Needles is a baby.\n\nPS: Bobbin says the sewing-floor typing machine word is PRESSERFOOT now. Bobbin says if you can spell it you can use it. Needles can't spell it.",
    { learn: "pws_lk_sg_term" },
  );
  PF.note(
    "pws_note_bobbin",
    "Madame Bobbin's Diary",
    "MY BOOK — DO NOT READ",
    "Moved the Collection up to the Lantern. The boys complain about the stairs. Let them. Up here I can see all of the Island: the church people with their soup, the robots walking the bank at night, the convoys at the Custom House counting and counting.\n\nThe painting from the church is the prize of the lot. Eagle, stripes, gold frame, older than anything but the church itself. I cut it off the wall myself while the Sister was praying. She didn't even look up. I think about that more than I'd like.\n\nThe lookout in the steeple waved at me today. Shot his weathervane. It's the nicest thing I've done in years.",
  );
  PF.tapeReel(
    "pws_reel_heist",
    "Heist Crew Tape reel",
    'TAPE REEL — "BIG SCORE" CREW',
    '"...okay, so the plan is: we go in quiet, we wait for banking hours, and at nine sharp the time lock — no, Rico, listen — at nine the time lock opens on its own. That\'s the whole trick. Nine a.m.! Easy money.\n[pause] What day is it?\n[pause] What year is it?\n[Gunfire. A cheerful robotic voice: "PISTOLS AT TEN PACES, SIR! ONE!"]\n[Static.]"\n\n[Scratched onto the label in pencil: THE OVERRIDE IS ON THE ROBOT. OR THE SECURITY OFFICE. OR NOWHERE. —R]',
  );
  PF.note(
    "pws_note_teller",
    "Teller's Memo",
    "MEMO — TELLER STATION 4",
    "Reminder: Mr. Vandermeer's passcode is NOT to be written on sticky notes on the President's blotter.\n\nAlso reminder: Mr. Vandermeer has written his passcode on a sticky note on his blotter.\n\nAlso: Colonel Burr (security unit) has again challenged a customer to a duel for using a Hamilton-era ten dollar bill. Maintenance has been notified. Maintenance has declined.",
  );
  PF.note(
    "pws_note_president",
    "Vandermeer's Passcode Note",
    "STICKY NOTE — PRESIDENT'S BLOTTER",
    'SECURITY TERMINAL: "WEEHAWKEN"\n(don\'t tell the Colonel, he gets emotional)\n\nMINE: "DIVIDEND"',
    { learn: ["pws_lk_fw_secterm", "pws_lk_fw_presterm"] },
  );
