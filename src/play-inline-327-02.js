// play-inline-327 02 — the
// Lines 24-129 of readable/play-inline-327.pretty.js (statement-aligned).
  const PF = G._pch;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const KEY = "nabisco_factory";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const NEST = 0,
    FAC = 6,
    UP = 12,
    ROOF = 17.6;
  const XW = -28,
    XE = 28,
    ZN = -20,
    ZS = 20;

  // ---------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------
  PF.item({
    id: "pch_royal_jelly",
    type: "aid",
    name: "Ant Queen Royal Jelly",
    weight: 0.5,
    value: 150,
    quest: true,
    tags: ["food"],
    effects: { hp: 40, rads: 12, attrs: { grit: 1, reflex: 1 }, duration: 300 },
    sound: "eat",
    desc: 'A fist-sized glob of amber jelly from the Queen\'s brood cell under the Nabisco bakery. Smells like burnt sugar and formic acid. Gina at Webster Hall wants it for something she calls "the Queen Bee".',
  });
  PF.item({
    id: "pch_golden_cake",
    type: "misc",
    name: "The Golden Zeppelin",
    weight: 1,
    value: 450,
    unique: true,
    desc: "The one-billionth Chocolate Zeppelin, dipped in 24-karat gold leaf and mounted on a walnut plinth for the Plant Manager's desk (June 1966). Still technically edible. Please don't.",
  });
  PF.item({
    id: "pch_recipe",
    type: "note",
    name: "Chocolate Zeppelin Master Formula",
    title: "NATIONAL BISCUIT CO. — FORMULA CZ-1 (CONFIDENTIAL)",
    text: 'CHOCOLATE ZEPPELIN — MASTER FORMULA CZ-1, rev. 31\n\nCake: enriched flour, sugar, invert sugar, shortening, egg product, cocoa (Dutch), leavening, salt.\nVanilla filling: sugar, shortening, corn syrup, "Stabilizer 7" (see Civil Defense addendum), vanilla, vanillin.\nCoating: sugar, cocoa, cocoa butter, carnauba wax. Wrap: silver foil, airship fold No. 3.\n\nADDENDUM (Office of Civil Defense contract OCD-C-1966-88, shelter provisioning): increase Stabilizer 7 to 0.4% for 25-year shelf life. Do NOT exceed 0.5% (see incident report 1964-12, "the ants").\n\nShelf life at 0.4%: indefinite.\nInsect attraction at 0.4%: "manageable".',
  });
  PF.note(
    "pch_note_qc",
    "Quality Control Report",
    "QC REPORT — LINE 2 — 19 FEB 1967",
    'Samples pulled: 48. Samples passed: 48.\nSamples still passing when re-tested after 30 days on the loading dock: 48.\nSamples EATEN by ants on the loading dock overnight: 211 (see attached photographs, which are mostly of ants).\n\nThe ants on the dock are getting bigger. I measured one at nine inches. Maintenance says that is "not a thing." Maintenance has not been to the loading dock.\n\n— D. Park, QC',
  );
  PF.tapeReel(
    "pch_reel_foreman",
    'Tape reel: "Night Foreman"',
    "Night Foreman's log — Bakery No. 1",
    "\"Day one. Sunday, 09:30. Sirens. The Sunday skeleton crew ran for the subway. I stayed — somebody has to shut the ovens down or we lose the building.\n\nDay two. Ovens won't shut down. The new automatic burners have a failsafe that keeps them at proving temperature. Proving temperature for WHAT, I asked. Nobody answers the phone.\n\nDay eleven. The ants from the dock came in through the flour chutes. They are the size of dogs. They took the whole Line 2 run in one night. They don't want me. They want the creme.\n\nDay forty. Something under the mixing room floor. I hear it laying. I'm going up to the offices. Mr. Haskell's teletype word is BILLION — he typed it with one finger while I stood there holding his coffee. Maybe it can call somebody. If I can get to the siding I can walk the High Line north. God help me, I'm taking a box of cakes.\"",
    { learn: "pch_lk_nb_term" },
  );
  PF.regLock({
    id: "pch_lk_nb_term",
    label: "Plant Manager's Teletype",
    kind: "terminal",
    passcode: "BILLION",
    hint: "The night foreman's tape reel mentions it.",
  });
  PF.terminal("pch_nb_manager", {
    title: "NATIONAL BISCUIT CO. — PLANT MANAGER",
    header:
      "KESTREL TELETYPE CORP. — MODEL 40 — NBC BAKERY No. 1 / PLANT MANAGEMENT",
    lock: { id: "pch_lk_nb_term", passcode: "BILLION" },
    entries: [
      {
        title: "Production — Week 8, 1967",
        text: 'LINE 1 (Chocolate Zeppelin original): 1,204,800 units\nLINE 2 (Chocolate Zeppelin Midnight Mint): 611,200 units\nLINE 3 (Freedom Flakes breakfast biscuit — pilot, for Brooklyn Sugar Works): HALTED\n\nCivil Defense standing order (shelter provisioning): 40 tons/week, "Stabilizer 7" formula. Shipped via the High Line, reefer NBC 88.',
      },
      {
        title: "Memo: Pest Control",
        text: 'To: Plant Manager\nFrom: Facilities\n\nRe: the dock ants. We have tried: poison (they ate it), traps (they ate them), the exterminator (unclear). Our current recommendation is to "stop leaving Chocolate Zeppelins on the dock". Also, please stop leaving Chocolate Zeppelins on the dock.',
      },
      {
        title: "Memo: The Golden Zeppelin",
        text: "Congratulations to all staff on our ONE BILLIONTH Chocolate Zeppelin! The Golden Zeppelin will be displayed in my office. It is NOT a snack. Whoever took a bite out of the first one — we know it was you, Gary.",
      },
      {
        title: "Civil Defense Addendum OCD-C-1966-88",
        text: "[RESTRICTED — see printed copy in the office safe]",
      },
      {
        title: "Note to Self",
        text: "Office safe: 0-6-0-2-6-6. The day we baked the billionth cake. If I forget THAT date I deserve to be locked out. — H.H.",
        learn: "pch_lk_nb_safe",
      },
    ],
  });

  // ---------------------------------------------------------------
  // Builder
  // ---------------------------------------------------------------
