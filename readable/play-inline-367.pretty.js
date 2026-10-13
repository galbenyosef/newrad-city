/* src/poi_wallst/80_content.js */
/* =====================================================================
 * NEW RAD CITY — POI WALL STREET — 80_content.js
 * Items, notes, tape reels, terminals, dialogue and the module's two side
 * quests:
 *   "The Great Seal" (pws_seal)   — Sister Constance of St. Paul's Refuge
 *        wants the painting of the Great Seal (stolen from above
 *        Washington's pew) back from Madame Bobbin, whose Stitchers hold
 *        the Singer Building. Return it (Standing, The Vigil) — or sell it to
 *        Hattie Fenwick at the Custom House (scrip, lost Standing).
 *   "Safe Deposit" (pws_deposit)  — Hattie Fenwick, convoy master of the
 *        Custom House Trading Post, sends you into Aaron Burr's old bank at
 *        40 Wall Street for the contents of box No. 1804: the Manhattan
 *        Company's water charter. Past the security robots, the time-locked
 *        vault door and Colonel Burr.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pws) return;
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
  PF.onInitDone.push(() => {
    G.events.on("itemAdded", (id) => {
      if (
        id === "pws_great_seal" &&
        !PF.q.complete("pws_seal") &&
        !PF.flag("seal_sold")
      ) {
        if (!PF.q.started("pws_seal")) PF.q.start("pws_seal");
        if (PF.q.stage("pws_seal") !== "return") PF.q.set("pws_seal", "return");
      }
    });
  });
  PF.trigger(
    { x0: 9400 - 150, x1: 9400 + 150, z0: 1600 - 150, z1: 1600 + 150 },
    () => {
      PF.q.advance(
        "pws_deposit",
        ["enter"],
        PF.flag("fw_vault_open") ? "box" : "vault",
      );
    },
    {
      repeat: true,
      cond: () =>
        PF.q.active("pws_deposit") && PF.q.stage("pws_deposit") === "enter",
    },
  );

  // ---------------------------------------------------------------
  // Dialogue — St. Paul's Refuge
  // ---------------------------------------------------------------
  const haveSeal = () => PF.inv.count("pws_great_seal") > 0;
  PF.dialogue("pws_dlg_constance", {
    start: () =>
      PF.q.complete("pws_seal")
        ? "after"
        : haveSeal()
          ? "return"
          : PF.q.active("pws_seal")
            ? "waiting"
            : PF.flag("seal_sold")
              ? "sold"
              : "root",
    nodes: {
      root: {
        speaker: "Sister Constance",
        text: "Welcome to St. Paul's, traveller. The door is unlocked, the soup is at sundown, and the only rule that matters is the one on the board: weapons holstered. I'm Sister Constance. I keep this place — or it keeps me. Hard to say, after twenty years.",
        responses: [
          { text: "What is this place?", next: "history" },
          {
            text: "There's an empty frame over the pew in the north aisle.",
            next: "seal",
          },
          { text: "Is there anything I can do to help?", next: "seal" },
          { text: "Take care, Sister." },
        ],
      },
      history: {
        speaker: "Sister Constance",
        text: "The oldest church on the island. 1766. It survived the fire of '76, when the rest of the west side burned. It survived the bombs, and the fires that followed. Washington prayed in that pew after they swore him in on Wall Street. These days, people who have nowhere else to pray — or sleep — use it. He wouldn't mind. He was a practical man.",
        responses: [
          { text: "And the empty frame?", next: "seal" },
          { text: "Thank you, Sister." },
        ],
      },
      seal: {
        speaker: "Sister Constance",
        text: "That held the first painting ever made of the Great Seal. Eagle, shield, thirteen stars. In the spring the Stitchers came — the raiders in the Singer Building, the tall red tower with the dome on Liberty Street. Their matriarch, a woman who calls herself Madame Bobbin, cut it down with a pair of shears while I prayed. It hangs in her nest now, up in the lantern at the very top. A trophy.",
        responses: [
          {
            text: "I'll get it back for you.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_seal")) PF.q.start("pws_seal");
            },
          },
          {
            text: "[Persuasion 50] Climbing a raider tower for a painting? I'd need a reason.",
            check: { skill: "persuasion", value: 50 },
            next: "speech",
            failNext: "speechFail",
          },
          { text: "It's a painting. People are starving.", next: "painting" },
          { text: "Not my business.", next: "decline" },
        ],
      },
      painting: {
        speaker: "Sister Constance",
        text: "They are. And they come here, and they eat, and then they sit in that aisle and look up at the empty frame. I didn't understand it either, at first. It isn't about the painting. It's about whether anything old can stay where it belongs. Out there, nothing does.",
        responses: [
          {
            text: "All right. I'll bring it back.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_seal")) PF.q.start("pws_seal");
            },
          },
          { text: "Maybe some other time.", next: "decline" },
        ],
      },
      speech: {
        speaker: "Sister Constance",
        text: "[She smiles thinly.] A practical soul. Very well: the refuge's watch rifle has been waiting for someone better than Hezekiah, and the Lord knows he'll be relieved to be rid of the responsibility. Bring the Seal home and the Vigil is yours — and whatever the collection plate holds that week.",
        responses: [
          {
            text: "Deal.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_seal")) PF.q.start("pws_seal");
              PF.setFlag("constance_bonus", true);
            },
          },
        ],
      },
      speechFail: {
        speaker: "Sister Constance",
        text: "A reason? You have a conscience, I assume. It's usually reason enough. If yours is out of order, the soup is still free.",
        responses: [
          {
            text: "Fine. I'll get your painting.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_seal")) PF.q.start("pws_seal");
            },
          },
          { text: "Pass.", next: "decline" },
        ],
      },
      accept: {
        speaker: "Sister Constance",
        text: "God go with you — and a lot of ammunition. The Singer is two blocks south, this side of Trinity. They charge a toll in the lobby. Hezekiah in our belfry says the stairs are the only way up; the elevators have been dead since the bombs. Bobbin herself sits in the lantern with a long rifle. She waves at Hezekiah. Don't let her wave at you.",
        responses: [{ text: "I'll be back with it." }],
      },
      decline: {
        speaker: "Sister Constance",
        text: "Then rest a while at least. You look like you need it.",
        responses: [{ text: "[Leave]" }],
      },
      waiting: {
        speaker: "Sister Constance",
        text: "The Singer Building, the lantern at the very top. Please be careful. I would rather have an empty frame than another grave in the yard.",
        responses: [
          { text: "Tell me about the Stitchers again.", next: "accept" },
          { text: "I'm on it." },
        ],
      },
      return: {
        speaker: "Sister Constance",
        text: "Is that — oh. Oh, look at it. They didn't even scratch the gilt. [She takes the frame in both hands and is quiet for a long moment.] Thank you.",
        responses: [
          { text: "It belongs here.", next: "reward" },
          { text: "[Keep it for now]", next: "keep" },
        ],
      },
      keep: {
        speaker: "Sister Constance",
        text: "[Her face doesn't change, but her hands let go.] I see. Well. It's yours to carry, then. The door is still unlocked.",
        responses: [{ text: "[Leave]" }],
      },
      reward: {
        speaker: "Sister Constance",
        text: () =>
          "Take the Vigil — the watch rifle from our belfry. Hezekiah says it shoots true and he's the most honest man I know, mostly because he can't lie with a straight face." +
          (PF.flag("constance_bonus")
            ? " And the collection plate. Don't argue."
            : "") +
          " Whenever you're on Fulton Street, there's a cot here with your name on it.",
        onEnter: () => {
          if (!PF.q.active("pws_seal") && !PF.q.started("pws_seal"))
            PF.q.start("pws_seal");
          if (PF.q.complete("pws_seal")) return;
          PF.inv.remove("pws_great_seal", 1);
          PF.setFlag("seal_returned", true);
          PF.inv.add("pws_vigil", 1);
          if (PF.flag("constance_bonus")) PF.inv.addScrip(75);
          PF.q.done("pws_seal");
          PF.news(
            "From Fulton Street: the painting of the Great Seal is back above George Washington's pew at St. Paul's Chapel. The Stitchers in the Singer Building are reportedly short one matriarch and one painting, and long on bad moods.",
          );
        },
        responses: [{ text: "Thank you, Sister." }],
      },
      after: {
        speaker: "Sister Constance",
        text: "Every evening someone sits in the north aisle and looks up at it. I think that's worth more than I can say. Rest well, friend.",
        responses: [
          { text: "Tell me about the chapel again.", next: "history" },
          { text: "Goodbye, Sister." },
        ],
      },
      sold: {
        speaker: "Sister Constance",
        text: "Hattie Fenwick sent word she's \"holding\" our Seal. Holding. [She folds her hands.] Well. The frame will wait. It has patience; I'm learning it.",
        responses: [{ text: "[Leave]", standing: -5 }],
      },
    },
  });
  PF.dialogue("pws_dlg_doc", {
    start: "root",
    nodes: {
      root: {
        speaker: "Doc Ainsworth",
        text: "Doctor Ainsworth. Yes, a real one, no, I don't take chickens anymore, and yes, I was a doctor before the war — pediatrics, if you can believe it. Where does it hurt?",
        responses: [
          {
            text: "Patch me up. (30 scrip)",
            cond: () => PF.inv.scrip() >= 30,
            action: () => {
              if (PF.inv.pay(30)) {
                try {
                  G.player.heal(G.player.maxHp);
                } catch (e) {
                  /* core */
                }
                G.notify(
                  "Doc Ainsworth stitches you up. Good as new. Well, as new as anything is.",
                );
                PF.sfx("inject");
              }
            },
          },
          {
            text: "Flush the rads. (60 scrip)",
            cond: () => PF.inv.scrip() >= 60,
            action: () => {
              if (PF.inv.pay(60)) {
                try {
                  G.player.addRads(-(G.player.rads || 0));
                } catch (e) {
                  /* core */
                }
                G.notify(
                  "Four capsules of Prussian Blue and a lecture later, your Geiger counter calms down.",
                );
                PF.sfx("iodine_tabs");
              }
            },
          },
          { text: "What do you have for sale?", barter: true },
          { text: "Pediatrics?", next: "kids" },
          { text: "I'm fine." },
        ],
      },
      kids: {
        speaker: "Doc Ainsworth",
        text: "Mount Sinai, twelve years. Then the bombs, and then twenty-two years of setting bones for grown-ups who should know better. The refuge has two babies now. First babies I've delivered since 1967. I cried. Don't tell Ramona.",
        responses: [{ text: "Your secret's safe." }],
      },
    },
  });
  PF.dialogue("pws_dlg_mercy", {
    start: "root",
    nodes: {
      root: {
        speaker: "Mercy Tolliver",
        text: "Soup's at sundown, supplies are whenever. I trade for the refuge — everything goes back into the pot, so don't haggle too hard, you'll make the orphans cry.",
        responses: [
          { text: "Let's trade.", barter: true },
          { text: "Heard anything interesting around here?", next: "rumors" },
          { text: "See you around." },
        ],
      },
      rumors: {
        speaker: "Mercy Tolliver",
        text: "Four things you should know about this end of the island. One: the Stitchers in the Singer tower charge a toll and take ears. Two: the old bank at 40 Wall — green roof — is full of robots that think it's still Monday morning, 1967. Three: Hattie Fenwick at the Custom House buys and sells anything, and pays fair. Four: the Sister stole my ladle and I want it back.",
        responses: [
          { text: "The Custom House?", next: "ch" },
          { text: "Thanks, Mercy." },
        ],
      },
      ch: {
        speaker: "Mercy Tolliver",
        text: "Big stone palace down by the Battery, with the four ladies on thrones out front. Convoys come and go from there all day. Hattie's been asking around for someone crazy enough to go into the bank. Figured you might qualify.",
        responses: [{ text: "I'll take that as a compliment." }],
      },
    },
  });
  PF.dialogue("pws_dlg_wendell", {
    start: "root",
    nodes: {
      root: {
        speaker: "Old Wendell",
        text: "Hm? Oh. Sit, sit. This is Washington's pew, you know. The General himself. After they swore him in over on Wall Street — right by that bank with the robots, as it happens — he walked up Broadway and sat right here. Right where I'm sitting. Well. Near enough.",
        responses: [
          { text: "What was above the pew?", next: "seal" },
          { text: "You look comfortable.", next: "comfy" },
          { text: "I'll let you rest." },
        ],
      },
      seal: {
        speaker: "Old Wendell",
        text: "The Seal! The eagle! Painted for the General's visit, they said. And those needle-and-thread hooligans cut it down. Took the eagle and left the Sister praying. Bah. In my day we stole things with dignity.",
        responses: [
          { text: "Your day?", next: "day" },
          { text: "I'll see what I can do." },
        ],
      },
      day: {
        speaker: "Old Wendell",
        text: "My granddad fixed the steeple clock. It's been at a quarter to ten since the bombs. Every clock in Manhattan says a quarter to ten. You'd think somebody would take the hint.",
        responses: [{ text: "Take care, Wendell." }],
      },
      comfy: {
        speaker: "Old Wendell",
        text: "Box pews. Kept the drafts off the gentry. Kept the Sister off me when I nap. Best seat in the house. There's a key to the Reliquary somewhere up in Hezekiah's box in the steeple, by the way. You didn't hear it from me. I'm asleep.",
        responses: [{ text: "[Leave him to his nap]" }],
      },
    },
  });
  PF.dialogue("pws_dlg_hezekiah", {
    start: "root",
    nodes: {
      root: {
        speaker: "Hezekiah",
        text: "Mind the rope, that's the bell. You ring that and the whole refuge grabs a gun. Last guy who leaned on it caused a stampede and a very awkward wedding.",
        responses: [
          { text: "What can you see from up here?", next: "see" },
          { text: "What's in the strongbox?", next: "box" },
          { text: "How do you open the strongbox?", next: "combo" },
          { text: "Carry on." },
        ],
      },
      see: {
        speaker: "Hezekiah",
        text: "Singer tower's south — tall red one with the dome. Bobbin sits up in the lantern with a rifle like mine. The green pyramid past it is the Manhattan Company bank; lights still on in the basement at night, robots walking the steps. And the Custom House down by the water, with the convoys. Good neighbourhood, if you don't count the neighbours.",
        responses: [{ text: "Thanks." }],
      },
      box: {
        speaker: "Hezekiah",
        text: "Emergency kit and the Reliquary key. Sister's orders: nobody opens it unless it's an emergency. I've decided it's never an emergency. It's very restful.",
        responses: [{ text: "Fair enough." }],
      },
      combo: {
        speaker: "Hezekiah",
        text: "Combination's the year the chapel was built. Seventeen sixty-six. One-seven-six-six. ...I wasn't supposed to say that out loud, was I. Well. If it's an emergency, it's an emergency.",
        learn: "pws_lk_sp_belfry",
        responses: [{ text: "Your secret's safe." }],
      },
    },
  });
  PF.dialogue("pws_dlg_ramona", {
    start: "root",
    nodes: {
      root: {
        speaker: "Ramona Diaz",
        text: "Hold up. Gun stays holstered past this gate. Soup's at sundown, cots are first-come, and if you start trouble I finish it. We clear?",
        responses: [
          { text: "Crystal. Who runs the place?", next: "who" },
          { text: "Any trouble around here?", next: "trouble" },
          { text: "We're clear." },
        ],
      },
      who: {
        speaker: "Ramona Diaz",
        text: "Sister Constance. Inside, by the altar, probably fussing with the candles. Doc Ainsworth's in the vestry if you're leaking.",
        responses: [{ text: "Thanks." }],
      },
      trouble: {
        speaker: "Ramona Diaz",
        text: "Stitchers from the Singer, twice a season. Bank robots on Wall Street if you go down there after dark. Burrow rats under the Custom House, which is Hattie's problem. And an old-timer from Pearl Street who keeps trying to sell me a \"genuine Washington tooth.\" That one's mostly my problem.",
        responses: [{ text: "Good to know." }],
      },
    },
  });

  // ---------------------------------------------------------------
  // Dialogue — Custom House Trading Post
  // ---------------------------------------------------------------
  const haveCharter = () => PF.inv.count("pws_charter") > 0;
  PF.dialogue("pws_dlg_hattie", {
    start: () =>
      haveCharter() && PF.q.active("pws_deposit")
        ? "charter"
        : haveCharter() && !PF.q.complete("pws_deposit")
          ? "charter"
          : PF.q.complete("pws_deposit")
            ? "after"
            : PF.q.active("pws_deposit")
              ? "waiting"
              : "root",
    nodes: {
      root: {
        speaker: "Hattie Fenwick",
        text: "Hattie Fenwick, convoy master. Welcome to the Custom House — the only place south of Canal where the scales are honest and the guards are sober. Mostly sober. If you're buying, see the stalls. If you're selling, see me. If you're looking for work, sit down.",
        responses: [
          { text: "I'm looking for work.", next: "job" },
          {
            text: "I have something to sell. A painting.",
            cond: haveSeal,
            next: "sell",
          },
          { text: "Tell me about this place.", next: "place" },
          { text: "Just browsing." },
        ],
      },
      place: {
        speaker: "Hattie Fenwick",
        text: "Alexander Hamilton's Custom House. Built to count the country's money. Now it counts mine. The convoys run from here up to Grand Central and across to the Seaport. Four ladies on thrones out front — the Continents. The one with the torch is America. She gets the most bird droppings. Symbolic, I think.",
        responses: [
          { text: "About that work...", next: "job" },
          { text: "Thanks." },
        ],
      },
      job: {
        speaker: "Hattie Fenwick",
        text: "My family's been hauling freight in this city since before the war — M. Fenwick & Sons, Carriers. Grandma rented a safe-deposit box in the Bank of the Manhattan Company, 40 Wall Street. The green pyramid up the avenue. Box eighteen-oh-four. I have the claim ticket. I don't have a death wish.",
        responses: [
          { text: "What's in the box?", next: "box" },
          { text: "Why not go yourself?", next: "why" },
        ],
      },
      why: {
        speaker: "Hattie Fenwick",
        text: 'Because the bank is still guarded. Robots. Turrets. A Valet-M that calls himself "Colonel Burr" and challenges anyone holding a ten-dollar bill to a duel — Hamilton\'s on the ten, see. Two of my people went in last year. The Colonel sent their boots back. Politely.',
        responses: [{ text: "And what's in the box?", next: "box" }],
      },
      box: {
        speaker: "Hattie Fenwick",
        text: "Paper. The Manhattan Company's original charter — 1799, the water company Aaron Burr set up that was secretly a bank. Near two hundred years on, the bank's dead and water's the only thing worth anything. The oldest legal claim to supplying water in the city. Nobody will honour it, of course. But they'll listen to whoever holds it.",
        responses: [
          {
            text: "I'll get it.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_deposit")) PF.q.start("pws_deposit");
              PF.inv.add("pws_claim_ticket", 1);
            },
          },
          {
            text: "[Trade 50] Robots, turrets and a dueling robot. What's it pay?",
            check: { skill: "trade", value: 50 },
            next: "pay",
            failNext: "payFail",
          },
          { text: "Not interested.", next: "decline" },
        ],
      },
      pay: {
        speaker: "Hattie Fenwick",
        text: "[She laughs.] A trader. Fine: three hundred scrip on delivery, and I'll throw in my spare duster — plated, hundred pockets, better than whatever you're wearing. And the key to the Evidence Cage downstairs, if you can get past the burrow rats.",
        responses: [
          {
            text: "Deal.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_deposit")) PF.q.start("pws_deposit");
              PF.inv.add("pws_claim_ticket", 1);
              PF.setFlag("hattie_bonus", true);
            },
          },
        ],
      },
      payFail: {
        speaker: "Hattie Fenwick",
        text: "It pays what it pays, and it pays on delivery. You want a better deal, go rob the bank yourself. Oh wait.",
        responses: [
          {
            text: "Fine. Give me the ticket.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_deposit")) PF.q.start("pws_deposit");
              PF.inv.add("pws_claim_ticket", 1);
            },
          },
          { text: "Pass.", next: "decline" },
        ],
      },
      accept: {
        speaker: "Hattie Fenwick",
        text: "Here's the ticket — the little brass key on the string opens the renter's lock. The vault is on a time lock that's been waiting for Monday morning since 1967; there's a security office behind the tellers, and a president who liked to write his passcodes down. Or take the override off the Colonel. Try not to let him take anything off you.",
        responses: [{ text: "I'll be back." }],
      },
      decline: {
        speaker: "Hattie Fenwick",
        text: "Suit yourself. The offer stands. The bank's not going anywhere, and neither am I.",
        responses: [{ text: "[Leave]" }],
      },
      waiting: {
        speaker: "Hattie Fenwick",
        text: "Forty Wall Street. Green pyramid. Box eighteen-oh-four. And mind the Colonel.",
        responses: [
          { text: "On my way." },
          {
            text: "I have something to sell. A painting.",
            cond: haveSeal,
            next: "sell",
          },
        ],
      },
      charter: {
        speaker: "Hattie Fenwick",
        text: 'Is that — let me see it. [She unrolls it on the desk with two fingers.] "...for supplying the City of New York with pure and wholesome water..." A hundred and ninety years old, and it\'s going to make me the most annoying woman in Manhattan.',
        responses: [
          { text: "Here. It's yours.", next: "paid" },
          {
            text: "[Persuasion 60] This is worth more to you than the fee.",
            check: { skill: "persuasion", value: 60 },
            next: "more",
            failNext: "moreFail",
          },
        ],
      },
      more: {
        speaker: "Hattie Fenwick",
        text: "[She sighs.] It is. Another hundred and fifty. You'd have done well in this family.",
        responses: [
          {
            text: "Pleasure doing business.",
            next: "paid",
            action: () => PF.setFlag("hattie_more", true),
          },
        ],
      },
      moreFail: {
        speaker: "Hattie Fenwick",
        text: "Don't push it. A deal's a deal, and I'm the one with the guards.",
        responses: [{ text: "Fine. Here.", next: "paid" }],
      },
      paid: {
        speaker: "Hattie Fenwick",
        text: () =>
          "Your pay" +
          (PF.flag("hattie_bonus")
            ? ", the duster, and the Evidence Cage key — the burrow rats are a bonus"
            : " and the key to the Evidence Cage downstairs — mind the burrow rats") +
          ". And friend: whatever the Colonel said to you, don't take it personally. He challenges everyone.",
        onEnter: () => {
          if (PF.q.complete("pws_deposit")) return;
          PF.inv.remove("pws_charter", 1);
          PF.inv.addScrip(300 + (PF.flag("hattie_more") ? 150 : 0));
          PF.inv.add("pws_evidence_key", 1);
          if (PF.flag("hattie_bonus")) PF.inv.add("pws_convoy_duster", 1);
          if (!PF.q.started("pws_deposit")) PF.q.start("pws_deposit");
          PF.q.done("pws_deposit");
          PF.news(
            "Down at the Battery, Hattie Fenwick of the Custom House is waving a hundred-and-ninety-year-old water charter at anyone who'll listen. Most people are listening. Water's like that.",
          );
        },
        responses: [{ text: "Thanks, Hattie." }],
      },
      sell: {
        speaker: "Hattie Fenwick",
        text: "[She turns the frame over, whistles.] The Great Seal. From the chapel. That's... well, that's either four hundred scrip or a lot of explaining to Sister Constance. I don't explain things. Four hundred.",
        responses: [
          {
            text: "Sold.",
            standing: -50,
            action: () => {
              PF.inv.remove("pws_great_seal", 1);
              PF.inv.addScrip(400);
              PF.setFlag("seal_sold", true);
              if (PF.q.active("pws_seal")) {
                try {
                  G.quests.fail("pws_seal");
                } catch (e) {
                  /* optional */
                }
              }
            },
          },
          { text: "On second thought, no." },
        ],
      },
      after: {
        speaker: "Hattie Fenwick",
        text: "My favourite employee who doesn't work here. The charter's framed in my office — next to the one Hamilton would've hated. Anything I can do for you?",
        responses: [
          { text: "Tell me about this place.", next: "place" },
          {
            text: "I have something to sell. A painting.",
            cond: haveSeal,
            next: "sell",
          },
          { text: "Just saying hello." },
        ],
      },
    },
  });
  const trader = (id, name, text) =>
    PF.dialogue(id, {
      start: "root",
      nodes: {
        root: {
          speaker: name,
          text,
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Maybe later." },
          ],
        },
      },
    });
  trader(
    "pws_dlg_cyrus",
    "Cyrus Belle",
    "Cyrus Belle, purveyor of fine violence. Ten-mil, five-five-six, shells, the occasional grenade with most of its pin. Hattie checks my scales. I check my ammo counts. Mostly.",
  );
  trader(
    "pws_dlg_lin",
    "Lin Hua",
    "Everything a person needs to survive, at prices a person can almost afford. Needles, water, batteries — and yes, that's real Golden Plain Jerky, sealed in '66. \"Tough enough for any trail,\" says the packet. It isn't wrong.",
  );
  trader(
    "pws_dlg_gorski",
    "Doc Gorski",
    "Tonic, Prussian Blue, and the other stuff Hattie pretends she doesn't see me sell. Doctor's orders, friend. I'm the doctor. These are my orders.",
  );
  PF.dialogue("pws_dlg_juniper", {
    start: "root",
    nodes: {
      root: {
        speaker: "Juniper",
        text: "Mm? Oh, I'm awake. Resting my eyes. You try walking a pack ox from the Seaport to Grand Central and back. He wants to go one way, I want the other, and he weighs a ton.",
        responses: [
          { text: "Any advice for the road?", next: "advice" },
          { text: "Sleep well." },
        ],
      },
      advice: {
        speaker: "Juniper",
        text: "Stay off Wall Street after dark — the bank robots walk the steps. Pay the Stitchers' toll or go around the Singer. And if you ever get the chance, look up in the Rotunda. Those murals. Ships coming into the harbour, full of people. Makes you think the harbour's got to fill up again someday.",
        responses: [{ text: "Maybe it will." }],
      },
    },
  });
})();
