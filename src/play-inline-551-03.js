// play-inline-551 03 — title
// Lines 675-750 of readable/play-inline-551.pretty.js (statement-aligned).
  L.hook("register", function () {
    registerLocks();
    L.terminal("gc_stationmaster", {
      title: "STATIONMASTER'S OFFICE",
      header:
        "NEW YORK CENTRAL — TERMINAL OPERATIONS TELETYPE\n(Repurposed: GRAND CENTRAL MARKET ADMINISTRATION)",
      lock: { id: LOCK_GC.id, passcode: LOCK_GC.passcode },
      entries: [
        {
          title: "Market Ledger",
          text: "STALL RENT THIS WEEK:\nMoe (Oyster Bar) ...... paid\nRosa (arms) ........... paid, complained\nDoc Hollis ............ paid in Rally Tonic (accepted)\nINFO-BOT .............. paid in information (disputed)\nCaldwell convoy ....... OVERDUE (wagons missing)",
        },
        {
          title: "Security Concerns",
          text: 'Three convoys hit on 42nd this month. Single shots, long range, always the pack-bot — never the drivers, so far. Kowalski swears the flashes come from up the Chrysler, "where the eagles are."\n\nThe Brooklyn Bridge gang raised the toll again. Sixty percent of our imports come across that bridge.',
        },
        {
          title: "The Glowkeepers",
          text: 'One of the sun-disc people came by asking about our water tower. Specifically: how tall it is, who guards it, and whether it is "ready to receive the Light." I told him water towers don\'t receive anything but water. He said "not yet."\n\nDoubled the guard on the tower.',
        },
        {
          title: "Personal — Do Not Read",
          text: "If you're reading this, Kowalski, I know it's you. The passcode is my birthday. You SIGNED THE CARD. Get back to work.",
        },
      ],
    });
    L.terminal("rc_console", {
      title: "RADIO FREE MANHATTAN — BROADCAST CONSOLE",
      header:
        "RCA BROADCAST SYSTEMS / TELETYPE INTERFACE\nON AIR: " + "YES (ALWAYS)",
      entries: [
        {
          title: "Tonight's Running Order",
          text: "1. Open with the good song\n2. Weather (it's bad)\n3. News (it's worse)\n4. Listener letters\n5. The other good song\n6. Emergency stretch of talking if I forget the third good song",
        },
        {
          title: "Listener Letters",
          text: '"Dear Rocky, my husband got burned in the Bombing and now he won\'t stop saying he\'s \'fine\'. Is he fine?" — Worried in Queens\n\n"Dear Rocky, you played the good song four times on Tuesday. Please never stop." — Your Biggest Fan (Kong)\n\n[Rocky has circled "Kong" and written "???" next to it.]',
        },
        {
          title: "Signal Log",
          text: () =>
            "UNKNOWN FEDERAL CIPHER — ORIGIN: LIBERTY ISLAND\nCARRIER: CONTINUITY RADIO (sub-channel, under the anthem)\nDetected: 11 times this month\nStrength: too weak to decode on current amplifier\n\n" +
            (Q.isComplete("mq03")
              ? "UPDATE: decoded. Recording filed. Somebody say a prayer for Zeke."
              : "NOTE: Need a proper amplifier. Zeke says the Chrysler raiders stripped one off the old WNYC relay."),
        },
        {
          title: "Interference Log",
          text: 'DAWN HOUR: pirate, 05:47 daily since \'79, a woman reading scripture. Wideband, sloppy, strong. Comes from somewhere east of here and LOW, like out of a hole. Fifteen minutes, then gone.\n\nFlint says ignore it.\n\n[Underneath, in different pencil: "Flint knows the words. Ask her how."]',
        },
        {
          title: "Missing Persons Hour",
          text: () =>
            'TONIGHT\'S NAMES (9 PM):\n- ROSSI, ANGELO: "Pop, the farm is still there. Come north."\n- THE TWINS FROM THE CANAL ST. SHELTER: "We\'re at the Neon. Both of us. Come home."\n' +
            (L.flag("ms_notice")
              ? "- MEAD, NICOLE: " +
                (L.flag("ms_notice") === "sundays"
                  ? '"' + first() + "'s awake. Whispering Gallery, Sundays.\""
                  : "interpreter, Canadian, dark hair. Last seen at the UN, March '67.") +
                "\n"
              : "") +
            '- (Kong\'s queen): "Kong still looking." [Rocky has not read this one on air.]',
        },
        {
          title: "Rockette-7 Maintenance",
          text: "Oil: weekly. Choreography reels: DO NOT REWIND (last rewind resulted in 36 continuous hours of the Charleston).",
        },
      ],
    });
  });

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
  const barterR = { text: "Let's trade.", barter: true };
