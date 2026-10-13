// play-inline-325 02 — the
// Lines 24-197 of readable/play-inline-325.pretty.js (statement-aligned).
  const PF = G._pch;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const KEY = "high_line";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const TRK = 7,
    MEZ = 12.5,
    ROOF = 17.5;
  const XW = -26,
    XE = 26,
    ZN = -24,
    ZS = 22;
  const TA = -19,
    TB = -9; // track centre lines
  const PLAT = TRK + 1.1; // loading platform top

  // ---------------------------------------------------------------
  // Content: items, terminals, notes
  // ---------------------------------------------------------------
  PF.item({
    id: "pch_cage_key",
    type: "key",
    name: "Butcher's Cage Key",
    weight: 0,
    value: 0,
    desc: "A greasy iron key on a loop of butcher's twine. Opens the holding cage in the terminal's cold storage.",
  });
  // locks (G.locks): the holding cage (key on the Conductor), the armory cage (padlock code on the Conductor's
  // teletype), the Conductor's safe (combination on the same teletype) and the teletype itself (word in the toll ledger)
  const LK_CAGE = PF.regLock({
    id: "pch_lk_hl_cage",
    label: "Holding Cage",
    kind: "door",
    key: "pch_cage_key",
    hint: "The Conductor carries the Butcher's Cage Key.",
  });
  const LK_ARMORY = PF.regLock({
    id: "pch_lk_hl_armory",
    label: "Armory Cage",
    kind: "door",
    code: "1934",
    hint: "The Conductor's teletype lists the padlock code (the year the Line opened).",
  });
  const LK_SAFE = PF.regLock({
    id: "pch_lk_hl_safe",
    label: "Conductor's Safe",
    kind: "safe",
    code: "2704",
    hint: "The combination is filed on the Conductor's teletype.",
  });
  const LK_TERM = PF.regLock({
    id: "pch_lk_hl_term",
    label: "Superintendent's Teletype",
    kind: "terminal",
    passcode: "EXPRESS",
    hint: "The Conductors' toll ledger mentions the word.",
  });
  PF.keyFrom("pch_cage_key", "NPC: The Conductor (carried)");
  PF.item({
    id: "pch_switchman",
    build() {
      const base = PF.live("items") ? G.items.get("lead_pipe") : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 12) * 2.1),
              critChance: 1.5,
              critMult: 1.8,
              condDecay: (base.weapon.condDecay || 0.002) * 0.4,
              skin: "rust",
            })
          : undefined;
      return {
        id: "pch_switchman",
        type: w ? "weapon" : "misc",
        name: "The Switchman",
        weight: 6,
        value: 650,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: "A four-foot switch-stand lever wrenched off the High Line at 30th Street, the target plate still bolted to the end. The Conductors' boss used it to \"change the direction\" of people's lives. Heavy, brutal, and very hard to break.",
        weapon: w,
      };
    },
  });
  PF.note(
    "pch_note_toll",
    "Conductors' Toll Ledger",
    "TOLL LEDGER — THE HIGH LINE (property of the Conductors)",
    "Rates (by order of the Conductor):\n  Walkers ........ 20 scrip\n  Pack oxen ...... 40 scrip\n  Old-timers ....... 60 scrip (they take forever)\n  Webster Hall folk .. DOUBLE (they can afford it, they got a BAND)\n\nThis week:\n  Mon — 3 walkers paid. 1 walker \"chose the stairs.\" Rico helped.\n  Tue — a trade convoy tried to go UNDER us on 10th. Dropped a fridge on them. Paid in canned goods.\n  Wed — nothing. Rain.\n  Thu — grabbed the singer from Webster Hall off the 14th St stair. Conductor says she's worth more than a month of tolls. Ransom note sent. She sings when she's scared. Nobody tell the Conductor we like it.\n  Fri — Conductor changed the word on his office teletype again. EXPRESS. Says it out loud every time he types it, so that's secure.\n  Sat — ",
    { learn: LK_TERM.id },
  );
  PF.note(
    "pch_note_ransom",
    "Ransom Note (Draft)",
    "TO THE BAND LEADER AT WEBSTER HALL",
    'We got your canary.\n\n300 SCRIP left under the clock at the St. Johns freight house by Sunday or she sings for US from now on.\n\nNo tricks. No cops. (There are no cops.)\n\n— THE CONDUCTOR\n\n[Several drafts are crossed out. One says "PLEASE" and has been violently scribbled over.]',
  );
  PF.tapeReel(
    "pch_reel_freezer",
    'Tape reel: "Cold Storage 3"',
    "Personal recording — L. Abara, Night Receiving Clerk, March 1967",
    "[Heavy breathing. A fan hums.]\n\n\"Sirens went off at 9:47. Supervisor waved us into the reefer lockers — thick walls, he says, better than nothing. Then he shut the door. From the outside.\n\nIt's been... I don't know. The light went out. The door handle is on the other side. They always told us: never let the door close behind you in a meat locker. Company policy. Sign on the wall and everything.\n\nIf somebody finds this — tell my sister the Knicks ticket is in the blue coat. Tell her I'm sorry about the ticket. Tell her—\"\n\n[The recording ends.]",
  );
  PF.tapeReel(
    "pch_reel_conductor",
    'Tape reel: "The Conductor\'s Sermon"',
    "Conductors radio broadcast (unsent)",
    '"This is your Conductor speaking. The High Line is the only road in Manhattan that doesn\'t flood, doesn\'t burn and doesn\'t have a brute sleeping in it. The trains don\'t run no more. WE run. Pay the toll, ride the Line. Skip the toll — and you take the express. Straight down. Nine meters.\n\nAll aboard."\n\n[Muffled, off-mic:] "Boss, the singer\'s doing the thing again." "...Let her finish the song."',
  );
  PF.terminal("pch_hl_dispatch", {
    title: "NEW YORK CENTRAL — ST. JOHN'S PARK",
    header: "KESTREL TELETYPE CORP. — MODEL 40 — NYC RR FREIGHT DISPATCH v2.2",
    entries: [
      {
        title: "Car Movements — Last Shift, MAR 1967",
        text: '06:10  NYC 174022 (box, OFFICE OF CIVIL DEFENSE CONSIGNMENT — SEALED) set out on Track 1. DO NOT OPEN W/O OCD COURIER.\n06:40  NBC 88 (reefer, CHOC. ZEPPELIN 40 TONS) to Nabisco siding, 15th St.\n07:55  NYC 174387 (box, PAPER GOODS) Track 1.\n09:12  Flat 51120 (ARMY SURPLUS, see manifest) Track 2.\n09:47  *** CIVIL DEFENSE ALERT — ALL MOVEMENTS HALTED ***\n09:48  Yardmaster: "Leave them where they are."',
      },
      {
        title: "Memo: Reefer Locker Policy",
        text: "REMINDER TO ALL RECEIVING STAFF\n\nThe cold-storage lockers latch from the OUTSIDE. Always prop the door. Always tell a coworker. The company is not responsible for employees who fail to follow posted procedure.\n\nThe interior release handles are on order. (Back-ordered since 1961.)",
      },
      {
        title: "Memo: West Side Improvement Anniversary",
        text: 'The High Line turns 33 this June! Management reminds staff that the elevated line removed 105 grade crossings from Tenth Avenue and ended the era of the "West Side Cowboys" riding ahead of the trains with red flags. Cake in the break room at 3. Cake is Chocolate Zeppelins, courtesy of our friends at the National Biscuit Company.',
      },
    ],
  });
  PF.terminal("pch_hl_conductor", {
    title: "SUPERINTENDENT — PERSONAL",
    header:
      "KESTREL TELETYPE CORP. — MODEL 40 — PROPERTY OF THE CONDUCTOR (DON'T TOUCH)",
    lock: { id: LK_TERM.id, passcode: LK_TERM.passcode },
    entries: [
      {
        title: "Rules of the Line",
        text: "1. Everybody pays.\n2. The Conductor does not pay.\n3. No shooting the boxcars. The Civil Defense one is MINE when I figure out the seal.\n4. No eating the singer.\n5. Rico: stop pushing people off the Line before they pay.\n6. Armory padlock is 1-9-3-4, the year the Line opened. If you can't remember that, you don't get a gun.",
        learn: LK_ARMORY.id,
      },
      {
        title: "Business: Webster Hall",
        text: "Webster Hall has scrip, lights, and a band. We have the only dry road from 14th to 34th. Grabbed their singer (Lulu Monroe) on the 14th Street stair. She's in Cold Storage 3 with the key on my belt.\n\nIf Calhoun doesn't pay by Sunday, we start charging HIM to listen to her.",
      },
      {
        title: "Safe",
        text: "Combination: 2-7-0-4. Ransom goes in, nothing comes out unless I say so. Rico, if you're reading this, I WILL know.",
        learn: LK_SAFE.id,
      },
      {
        title: "Business: The Ants",
        text: "Scouts say the biscuit factory is crawling with giant ants. Big ones. Fire-spitting ones. Something bigger underneath. Nobody goes over the siding bridge. Nobody. I don't care how many Chocolate Zeppelins are in there.",
      },
      {
        title: "Open Armory Lock",
        action: () => {
          PF.setFlag("hl_armory_open", true);
          PF.lockUnlock(LK_ARMORY.id);
          return "Armory cage released.";
        },
      },
    ],
  });

  // ---------------------------------------------------------------
  // Builder
  // ---------------------------------------------------------------
