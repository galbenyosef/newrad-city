// play-inline-298 05 — title
// Lines 1883-1963 of readable/play-inline-298.pretty.js (statement-aligned).
  PM.item({
    id: "pm2_gutenberg",
    type: "misc",
    quest: true,
    name: "Gutenberg Bible (Morgan copy, Vol. I)",
    weight: 6,
    value: 1000,
    desc: "Printed in Mainz around 1455 — one of the first books made with movable type, and one of three the Morgan owned. The pages are sound. A radioactive glow clings faintly to the binding.",
  });
  PM.item({
    id: "pm2_morgan_combo",
    type: "key",
    name: "Vault Combination (index card)",
    weight: 0,
    value: 0,
    learn: "pm2_morgan_vault",
    desc: 'A library index card in a precise hand: "MORGAN VAULT — 12 · 04 · 37. Burn after reading. (Do NOT burn the library.) — B.G."',
  });
  PM.item({
    id: "pm2_morgan_glasses",
    type: "apparel",
    slot: "eyes",
    name: "Morgan's Reading Spectacles",
    weight: 0,
    value: 150,
    attrs: { wits: 1 },
    skills: { electronics: 5 },
    desc: "Gold pince-nez left on the highest tier of the East Room. The world looks smaller and better organised through them. +1 Wits, +5 Electronics.",
  });
  PM.item({
    id: "pm2_reel_greene",
    type: "tape",
    name: 'Tape reel: "The Director, Mar. 4"',
    title: "Director's Dictation — March 4, 1967",
    text: '[A clipped, amused voice.]\n\nMemo to the trustees. The Civil Defense gentleman has again requested the Bibles "for safekeeping underground". I have again declined. He asked what I intend to do if the bombs fall. I told him I intend to be in the Rare Book Vault with the door shut, which is more than can be said for his.\n\nThe Bibles go down to the vault tonight. The combination is on a card in my desk, in the only place no one ever looks: under a book.\n\nIf anyone finds this: the collection is not for sale. It never was. Read it.\n\n[End of dictation.]',
  });
  PM.item({
    id: "pm2_note_page",
    type: "note",
    name: "A Page of Blank Verse",
    title: "Found in the East Room, tucked into a ledger",
    text: "Three tiers of books and none of them read\nSince the lights went out and the readers went dead.\nThe Maniacs are the only patrons now —\nthey shelve by screaming. I don't know how.\n\n— left by a scavenger who did not come back for it",
  });

  PM.terminal("pm2_term_morgan", {
    title: "PIERPONT MORGAN LIBRARY — DIRECTOR'S TELELINK",
    header: "Office of the Director · Collections Security",
    lock: PM.LOCKS.morgan_term,
    entries: [
      {
        title: "Mr. Morgan's safe",
        learn: "pm2_morgan_safe",
        text: "The study safe keeps Mr. Morgan's own combination, 1-9-0-6 — the year the library was finished. My dictation tapes are in it.",
      },
      {
        title: "Collections log — Mar 4, 1967",
        text: "Gutenberg Bibles (3): removed from East Room vitrines to the Rare Book Vault, Stack Level B.\nAccess: through Mr. Morgan's private vault in the West Room.\nVault combination held by the Director.\n\nCivil Defense representative escorted from the premises (twice).",
      },
      {
        title: "Staff notice: the stacks",
        text: "The ventilation in Stack Level B has been making a noise like breathing. Maintenance says it is the pipes. Maintenance has not been down there since Tuesday.",
      },
      {
        title: "Staff notice: the East Room",
        text: "Reminder: the hidden staircase in the East Room (south-east corner, third bookcase) is for staff only. It is not a secret. It is a staircase. Please stop pretending to be in a novel.",
      },
      {
        title: "Release West Room vault lock",
        text: "Time lock on the private vault: DISENGAGED.\n\nThe Director would like to remind whoever is reading this that she is watching.",
        action() {
          PM.setFlag("morgan_combo", true);
          PM.unlockDoor("pm2_morgan_vault");
          G.notify("The West Room vault door unlocks with a heavy clunk.");
        },
      },
    ],
  });

  // ===================================================================
  // BUILDER
  // ===================================================================
