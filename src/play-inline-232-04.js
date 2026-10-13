// play-inline-232 04 — armed
// Lines 1505-1799 of readable/play-inline-232.pretty.js (statement-aligned).
  LI.addBuilder(KEY, 40, function () {
    LI.ww = build();
  });

  // ======================================================================
  // Gameplay: Penny Dreadful, the stair tripwire, items, terminal
  // ======================================================================
  LI.readyFns.push(function () {
    const C = LI.ww;
    if (!C) return;
    LI.defineItems([
      {
        id: "li_gilbert_bowler",
        type: "apparel",
        slot: "head",
        name: "Architect's Bowler",
        weight: 1,
        value: 260,
        dr: 1,
        attrs: { wits: 1 },
        skills: { mechanics: 10, electronics: 5 },
        mesh: "hat_bowler",
        unique: true,
        tags: ["apparel", "hat", "unique"],
        desc: "A black bowler with a tiny gothic spire drawn in pencil on the band — the same hat the lobby grotesque of the building's architect is carved wearing. Makes load-bearing thoughts come easier.",
      },
      {
        id: "li_first_nickel",
        type: "misc",
        name: "The First Nickel",
        weight: 0,
        value: 500,
        mesh: "token",
        tags: ["junk_valuable"],
        noSell: true, // (the memorial box needs it: selling it soft-locked the quest)
        desc: 'A worn 1879 five-cent piece mounted on a velvet card: "THE FIRST NICKEL TAKEN — UTICA STORE". The Five & Dime raiders fought over it for years without once suspecting it was worth more than five cents.',
      },
      {
        id: "li_note_cass",
        type: "note",
        name: "Letter on the Founder's Desk",
        title: "Woolworth Co. — Executive Offices, 1913 (framed copy)",
        learn: LI.LOCKS.ww_strongbox.id,
        text: '"Mr. Gilbert — I asked for a building that would advertise my stores around the world. You have given me a cathedral. I am told the carvers put my likeness in the lobby, counting nickels. Leave it. It is accurate."\n\n[Added underneath in grease pencil, much later:]\nPENNY — THE NICKELS ARE STILL IN THE COUNTERS. ALL OF THEM. WE COUNTED TWICE. — SQUINT\n\n[And under that, smaller:]\nNOTE TO SELF: SHE SET HER BOX TO THE YEAR ON HER LUCKY NICKEL. 1-8-7-9. DONT TELL HER I LOOKED. — SQUINT',
      },
      {
        id: "li_reel_dime",
        type: "tape",
        name: "Tape Reel: Five & Dime Orders",
        title: "Penny Dreadful — Standing Orders",
        learn: LI.LOCKS.ww_office_term.id,
        text: "[A woman's voice, bored, dangerous.]\n\nListen up, dimes. One: nobody touches my nickels. Two: the wire on the grand stair stays up. If you forget it's there, that's natural selection and I won't be sad. Three: Gutter doesn't come in the lobby. I don't care how much he paid Rook. Four: the elevator to the top still works, and the top is mine. Five: the word for the office teletype is CATHEDRAL. Squint, write it on your hand.\n\nQuestions? No? Good. Get out.",
      },
      {
        id: "li_ww_strongbox_key",
        type: "key",
        name: "Penny's Strongbox Key",
        desc: "A small brass key on a bootlace, warm from being worn around somebody's neck. It fits the strongbox in the Observation Crown.",
      },
    ]);
    LI.terminal("li_ww_office", {
      title: "F.W. WOOLWORTH CO. — EXECUTIVE OFFICE",
      header: 'WOOLWORTH CO. — ACCOUNTS TELETYPE\n"NOTHING OVER TEN CENTS"',
      lock: {
        id: LI.LOCKS.ww_office_term.id,
        passcode: LI.LOCKS.ww_office_term.passcode,
      },
      entries: [
        {
          title: "Store Count (1967)",
          text: "Stores in operation 03.04.1967: 4,211\nStores in operation 03.06.1967: [NO DATA]\n\nNote: the Manhattan flagship reports record lunch-counter sales for 10.23. The report was filed at 9:40 a.m.",
        },
        {
          title: "Building History",
          text: 'Completed 1913 at a cost of $13.5 million — paid in cash, in nickels and dimes, as the founder liked to remind visitors. The tallest building in the world until 1930. The lobby ceiling is Byzantine glass mosaic. The observation gallery on the 57th floor admitted visitors for fifty cents until the Civil Defense blackout of \'66 closed it "temporarily".',
        },
        {
          title: "Tenant Notice",
          text: "The tripwire on the grand staircase is NOT a building fixture. Management has asked the tenants in the lobby to remove it. The tenants have asked management to come down and do it himself.",
        },
        Object.assign(
          { title: "Petty Cash" },
          LI.codeText(
            "ww_mezz_safe",
            "Petty cash is kept in the mezzanine safe by the Empire Room. Combination: 0-4-2-4 (opening day, 24 April 1913). Nothing over ten cents is to be taken without a chit.",
          ),
        ),
      ],
    });
    // ---------- quest: Nothing Over Ten Cents ----------
    const QID = "li_ww_nickel";
    LI.defineItems([
      {
        id: "li_ww_capsule_letter",
        type: "note",
        name: "1913 Time Capsule Letter",
        title: "To Be Opened By Whoever Brings Back the First Nickel",
        text: '"April 24th, 1913. To my successor, whoever you are:\n\nThis building was paid for in cash — nickels and dimes, every one of them earned across a counter. I have sealed the first of them in this box because a man should be reminded where he started. If you have brought it back, you have done something difficult for something small, which is the whole of retail.\n\nThe contents are yours. Spend them in one of my stores.\n\n— F.W.W."\n\n[The stores are gone. The advice holds.]',
      },
    ]);
    const qTrack = () => {
      if (Q.done(QID)) return;
      if (!Q.started(QID))
        Q.start(QID, LI.has("li_first_nickel") ? "return" : "find");
      else if (Q.stage(QID) === "find" && LI.has("li_first_nickel"))
        Q.setStage(QID, "return");
    };
    Q.define({
      id: QID,
      name: "Nothing Over Ten Cents",
      giver: "The founder's letter",
      location: "Woolworth Building",
      desc: "The Woolworth lobby hides a memorial box beneath the carving of the founder counting his nickels. Its slot is marked for the very first nickel his first store ever took — which Penny Dreadful keeps in her strongbox at the top of the tower.",
      stages: [
        {
          id: "find",
          text: "Recover the First Nickel from Penny Dreadful's strongbox in the Observation Crown.",
          markers: () => [
            {
              x: C.anchors.loot3.x,
              z: C.anchors.loot3.z,
              label: "Penny's Strongbox",
              interior: true,
            },
          ],
        },
        {
          id: "return",
          text: "Deposit the First Nickel in the Founder's memorial box in the Woolworth lobby.",
          markers: () => [
            {
              x: C.anchors.memorial.x,
              z: C.anchors.memorial.z,
              label: "Memorial Box",
              interior: true,
            },
          ],
        },
        {
          id: "done",
          text: "The memorial box opened: the founder's 1913 time capsule was yours.",
          complete: true,
        },
      ],
      rewards: { xp: 150, standing: 5 },
    });
    G.events.on("itemAdded", (id) => {
      if (id === "li_first_nickel" || id === "li_note_cass") qTrack();
    });
    let capsuleOpen = false;
    LI.saveHooks.ww_capsule = {
      save: () => ({ open: capsuleOpen }),
      load(d) {
        capsuleOpen = !!(d && d.open);
      },
      reset() {
        capsuleOpen = false;
      },
    };
    LI.interact(
      C.anchors.memorial,
      "Founder's Memorial Box",
      () =>
        LI.has("li_first_nickel") ? "Deposit the First Nickel" : "Examine",
      () => {
        if (capsuleOpen) {
          LI.notify(
            "The memorial box is open and empty. Somebody spent it all.",
          );
          return;
        }
        if (!LI.has("li_first_nickel")) {
          LI.notify(
            'A bronze box with a single coin slot: "DEPOSIT THE FIRST NICKEL". The raiders have hammered on it for years. It has not noticed.',
          );
          qTrack();
          return;
        }
        LI.take("li_first_nickel", 1);
        capsuleOpen = true;
        LI.sfx("door_open", { pos: C.anchors.memorial, volume: 0.5 });
        LI.sfx("pickup_scrip");
        LI.giveScrip(260);
        LI.give("old_dollars", 4);
        LI.give("li_ww_capsule_letter", 1);
        LI.give("fizzo_blue", 1);
        LI.notify(
          "Clink. Somewhere inside the pedestal, a 1913 mechanism wakes up and opens.",
        );
        if (!Q.started(QID)) Q.start(QID, "return");
        Q.setStage(QID, "done");
      },
      { enabled: () => !capsuleOpen },
    );
    // tripwire: walking through it blows the trap; disarm it with a steady hand (Explosives)
    const T = C.trap;
    let armed = true;
    const tpos = C.W((T.a[0] + T.b[0]) / 2, T.a[1], 0);
    LI.saveHooks.ww = {
      save: () => ({ armed }),
      load(d) {
        armed = !(d && d.armed === false);
      },
      reset() {
        armed = true;
      },
    };
    LI.interact(
      tpos,
      "Tripwire",
      "Disarm",
      () => {
        if (!armed) return;
        armed = false;
        LI.sfx("ui_select");
        LI.give("frag_grenade", 2);
        LI.xp(15, "Trap disarmed");
        LI.notify("Tripwire disarmed.");
      },
      { enabled: () => armed, priority: 2 },
    );
    LI.animators.push({
      cell: C,
      fn() {
        if (!armed || !G.player) return;
        const P = G.player.pos,
          lx = C.O.x + T.a[0];
        if (
          Math.abs(P.x - lx) < 0.35 &&
          Math.abs(P.z - C.O.z) < 2.9 &&
          P.y < T.a[1] + 0.3 &&
          P.y > T.a[1] - 1.5
        ) {
          armed = false;
          try {
            if (!G.isStub("combat") && G.combat.explode)
              G.combat.explode(new THREE.Vector3(lx, T.a[1], P.z), 3.2, 45, {
                source: "trap",
                kind: "normal",
              });
            else {
              G.player.damage(35, { type: "explosive" });
              try {
                G.fx.explosion(new THREE.Vector3(lx, T.a[1], P.z), 3);
              } catch (e) {
                /* */
              }
            }
          } catch (e) {
            /* */
          }
        }
      },
    });
  });
  LI.spawnFns.push(function () {
    const C = LI.ww;
    if (!C) return;
    LI.spawnNPC(
      {
        id: "li_ww_penny",
        type: "human",
        name: "Penny Dreadful",
        outfit: "raider_heavy",
        gender: "f",
        faction: "raiders",
        ai: "guard",
        homeR: 4,
        hostile: true,
        noRespawn: true,
        level: 9,
        hp: 260,
        weapon: "hunting_rifle",
        voice: "raider",
        hair: "wild",
        inventory: [
          ["li_ww_strongbox_key", 1],
          ["scrip", 75],
          ["ammo_308", 20],
          ["rush", 1],
        ],
        barks: {
          idle: [
            "Five... ten... fifteen...",
            "Best view in the city, and it's MINE.",
          ],
          alert: [
            "Who let a customer up here?!",
            "You break it, you BOUGHT it!",
          ],
        },
      },
      C.anchors.penny,
    );
  });
