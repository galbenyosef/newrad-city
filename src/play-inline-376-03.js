// play-inline-376 03 — note
// Lines 252-463 of readable/play-inline-376.pretty.js (statement-aligned).
  function defineItems() {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    const note = (id, name, title, text) =>
      d({
        id,
        type: "note",
        name,
        title,
        text,
        weight: 0,
        value: 0,
        tags: ["note"],
      });
    const tape = (id, name, title, extra, text) =>
      d(
        Object.assign(
          {
            id,
            type: "tape",
            name,
            title,
            text,
            weight: 0,
            value: 0,
            tags: ["tape"],
          },
          extra || {},
        ),
      );
    // ---- '52' Club ----
    note(
      "m3_note_menu",
      '"52" Club Menu',
      '"52" — Supper, Saturday March 4th, 1967',
      "TO START\n  Oysters Rockefeller (Atlantic, pre-irradiated) ....... $3.25\n  Chilled Vichyssoise ................................... $1.75\n\n" +
        'THE "52" BURGER — the one the Senator ordered twice ........ $2.75\n  (Now served with 100% less French mustard. Patriotically.)\n' +
        "Chicken Hash à la Jack ........................................ $3.50\nSteak Diane, flambéed at your table ............................ $6.75\n\n" +
        "COCKTAILS\n  The Iron Curtain (vodka, beet, patriotism) ............. $1.25\n  Atomic Fizz ............................................. $1.50\n\n" +
        "A gratuity of 18% is added for parties of six or more, and for parties that mention the war.",
    );
    note(
      "m3_note_pen",
      "Scratched Note",
      "Scratched on the back of a betting slip",
      "day 11 in the pen. they race the roaches every night upstairs, you can hear the King calling the odds through the floor.\n\n" +
        'the old-timer they dragged in yesterday — Chaz, says he tended bar here "before" — keeps laughing at them. says they can dig all they want, ' +
        "Charlie's cellar never opened for a revenue man and it wont open for a raider. says the door is a wall and the key is dinner.\n\n" +
        'they took him upstairs to "ask" him. he hasnt come back.',
    );
    note(
      "m3_note_pen2",
      "Welcher's Tally",
      "Tally marks scratched into a torn racing form",
      "IIII IIII IIII II — sixteen nights.\n\nThey feed us the roaches that lose. The King says a welcher pays in silks or pays in skin, " +
        "and I got no silks.\n\nChaz says the boys will never find the cellar because they only dig where the bricks look OLD. " +
        "He says the one wall downstairs that looks too neat is the one to look at. Then he laughed till he coughed.\n\n" +
        "If you are reading this, the cage door don't lock. It never did. We just got nowhere to go.",
    );
    note(
      "m3_note_chaz",
      "Chaz's Betting Slip",
      "A betting slip, the back covered in shaky pencil",
      'Race 4 — "Big Sal" to win. (Crossed out.)\n\nWhoever finds this: I worked the bar at "52" for forty years, before and after. ' +
        "The King wants Charlie's cellar. He won't get it from me.\n\n" +
        "In 1930 the Feds raided us nine times and never found a bottle, because the cellar isn't in \"52\" at all. It's next door, under No. 19, " +
        "behind the basement wall. Two tons of brick on a hinge. There's a hole in the mortar no bigger than a pencil — you slide a meat skewer " +
        "through it and trip the latch. Kitchen's got a rack of 'em.\n\nThe Mayor's Reserve is still down there. Drink one for old Chaz. " +
        "And for God's sake, bet against Big Sal.",
    );
    tape(
      "m3_reel_sommelier",
      "Sommelier's Tape Reel",
      'Tape reel: "Cellar Book — Final Entries"',
      { learn: ["m3_locker_vanderhoof", "m3_locker_bradberton"] },
      '[A dry, patient voice. Glass clinks somewhere near the microphone.]\n\n"March 5th. The sirens started during the breakfast service. I have sent the staff to the subway and bolted the hatch. ' +
        "Somebody must stay with the collection; it would be an insult to leave a '32 Bourbon alone at a time like this.\n\n" +
        "...December the somethingth. The door is sealed and I have decided not to open it. The air is fine. The company is excellent: " +
        "two thousand bottles and not one of them has asked me about the war.\n\n" +
        "...I have been through the Burgundies. I am saving the Mayor's Reserve. One should always save the best for the end, and I believe " +
        "the end is being very courteous about arriving.\n\n" +
        "P.S. for the cellar book: Mrs. Vanderhoof's private locker is 1-9-3-1, Mr. Bradberton's is 4-4-2-2. They will not be needing them.\n\n" +
        'To whoever opens the door: the skewer goes back on the rack. Enjoy the Reserve. It was never meant for a mayor anyway."\n\n[Click.]',
    );
    d({
      id: "m3_meat_skewer",
      type: "key",
      name: "Meat Skewer",
      weight: 0.1,
      value: 1,
      quest: true,
      desc: 'A foot of stainless steel from the "52" kitchen, filed to a point. Good for shish kebab, better for secret doors.',
    });
    d({
      id: "m3_mayors_reserve",
      type: "aid",
      name: "The Mayor's Reserve",
      weight: 1,
      value: 450,
      mesh: "bottle_whiskey",
      sound: "drink",
      tags: ["drink", "alcohol", "unique"],
      effects: {
        hp: 40,
        duration: 600,
        attrs: { presence: 3, senses: 2, brawn: 1 },
        rads: -5,
        addiction: {
          chance: 0.02,
          id: "alcohol",
          name: "Alcohol Addiction",
          withdrawal: { attrs: { presence: -1, reflex: -1 } },
        },
      },
      desc: "Kentucky straight bourbon, bottled 1932, hidden from the Feds, the Mayor and the end of the world. It tastes like caramel, oak and very good decisions.",
    });
    d({
      id: "m3_jockey_cap",
      type: "apparel",
      slot: "head",
      name: "Jockey King's Silks Cap",
      weight: 0.5,
      value: 90,
      dr: 1,
      attrs: { reflex: 1, senses: 1 },
      tags: ["apparel", "hat"],
      mesh: "hat_officer",
      desc: "A satin racing cap in red and gold, stolen off a lawn jockey and sized up with a knife. Makes you feel faster. You aren't.",
    });
    P.safe("item:photo_finish", () =>
      cloneWeapon(
        "m3_photo_finish",
        "hunting_rifle",
        {
          damage: 38,
          critMult: 3,
          critChance: 4,
          condDecay: 0.0018,
          reloadTime: 2.4,
        },
        {
          name: "Photo Finish",
          value: 1400,
          desc: "The Jockey King's hunting rifle, its walnut stock inlaid with a mother-of-pearl horseshoe and eleven notches. Always wins by a nose.",
        },
      ),
    );
    // ---- Helmsley ----
    note(
      "m3_note_eviction",
      "Notice to Occupants",
      "NOTICE TO ALL OCCUPANTS OF 230 PARK AVENUE",
      "By order of the Continuity, lawful government of the United States of America, this structure is requisitioned for national signals purposes.\n\n" +
        "Occupants will vacate within one (1) hour. Occupants who are not able to vacate will be assisted.\n\n" +
        "Occupants who are mutated, irradiated, or otherwise of impure stock will be assisted first.\n\n— Lt. A. Voss, Detachment 7\n\n" +
        "[Scrawled underneath in charcoal:] WE LIVED HERE 20 YEARS",
    );
    tape(
      "m3_reel_duty",
      "Detachment 7 Duty Log",
      "Tape reel: Detachment 7 — Duty Log",
      { learn: "m3_armory_locker" },
      "[Clipped, military voice.] \"Duty log, Detachment 7, Relay Seven. Day 412.\n\nRelay performance nominal. Carrier repeating the President's addresses on the midtown band " +
        "and passing patrol telemetry to the Sky-Eye drones. The locals have started calling the beacon 'the red eye'. Morale effect: positive.\n\n" +
        "Reminder: the relay maintenance codes are to remain in the Lieutenant's personal possession at ALL times, not in the safe, not on a sticky note on " +
        "the console, Corporal Deane. The same goes for the armory locker: three-one-nine-seven is NOT to be chalked on the cage.\n\nThe express car to the crown is running again. The freight car is parked at the top and stays there. Nobody comes up from the lobby we don't send for.\"",
    );
    note(
      "m3_note_voss",
      "Voss's Orders",
      "ORDERS — DETACHMENT 7 (EYES ONLY)",
      "RELAY SEVEN is the Continuity's eye and voice over Manhattan until the Restoration is complete.\n\n1. Maintain the carrier at all costs.\n2. Should the station be " +
        'overrun, OVERLOAD THE CORE. Under no circumstances allow the transmitter to fall into the hands of the so-called "Radio Free Manhattan" — ' +
        "a relay of this power would put that degenerate jazz on every goggles from the Battery to Harlem.\n3. Destroy these orders.\n\n[They were not destroyed.]",
    );
    d({
      id: "m3_relay_codes",
      type: "key",
      name: "Relay 7 Code Card",
      weight: 0,
      value: 0,
      quest: true,
      learn: "m3_helms_relay",
      desc: "A laminated card of carrier frequencies and override codes for Continuity Relay 7, New York Central Building. Console passcode: REDEYE. Stamped EYES ONLY. Also, faintly, with a coffee ring.",
    });
    P.safe("item:park_ave_express", () =>
      cloneWeapon(
        "m3_park_ave_express",
        "gyrojet_pistol",
        {
          damage: 40,
          rof: 2.8,
          magSize: 8,
          critChance: 2,
          condDecay: 0.0015,
          skin: "gold",
        },
        {
          name: "Park Avenue Express",
          value: 2200,
          desc: "A Continuity officer's gyrojet pistol with a gold-plated frame engraved with the New York Central's old herald. Runs hot, runs fast, never late.",
        },
      ),
    );
  }

  // ==================================================================
  // TERMINALS
  // ==================================================================
