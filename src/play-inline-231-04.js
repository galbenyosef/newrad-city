// play-inline-231 04 — col
// Lines 1486-1786 of readable/play-inline-231.pretty.js (statement-aligned).
  LI.addBuilder(KEY, 30, function () {
    LI.nyse = build();
  });

  // ======================================================================
  // Gameplay: Bruno (pit champion), the captive, the barred exit, the live wire
  // ======================================================================
  const QID = "li_nyse_captive";
  LI.readyFns.push(function () {
    const C = LI.nyse;
    if (!C) return;
    LI.defineItems([
      {
        id: "li_trader_jacket",
        type: "apparel",
        slot: "body",
        name: "Floor Trader's Jacket",
        weight: 2,
        value: 380,
        dr: 3,
        attrs: { senses: 1 },
        skills: { trade: 15 },
        outfit: "merchant",
        mesh: "cloth_yellow",
        unique: true,
        tags: ["apparel", "clothing", "old_world", "unique"],
        desc: "A canary-yellow trading-floor jacket with a brass badge — POST 11 · SPECIALIST — and twenty-two years of pencil in the pockets. Buy the rumour, sell the news, survive the apocalypse.",
      },
      {
        id: "li_note_margin_call",
        type: "note",
        name: 'Note: "Margin Call"',
        title: "Scrawled on a trade ticket, Post 3",
        text: 'Mar 5 1967 — 09:29\nCalled the desk. Told them to sell everything. They asked "sell it to who?"\n\n09:31 — the Board halted trading. First time since the Crash of \'29 they stopped the whole floor.\n\n09:40 — Myers says the bell is still going to ring at four. I told Myers there is not going to be a four.\n\nIf anybody finds this: I was right. Tell my wife I was right. It is the only thing I was ever right about.',
      },
      {
        id: "li_reel_closing_bell",
        type: "tape",
        name: 'Tape Reel: "Ring the Bell"',
        title: "The Exchange — Pit Night (raider recording)",
        text: "[Crowd noise. A bell clangs, badly.]\n\nFLOOR MANAGER: LADIES AND GENTLEMEN AND RAIDERS! Welcome to the only market in Manhattan that's still going UP! In the red corner: a convoy guard who strayed in off Broad Street! In the other red corner — they're both red, we don't clean the floor — BULL MARKET BRUNO!\n\n[Roaring.]\n\nFLOOR MANAGER: Bets close at the bell! Remember: Betty takes ten percent, the Pit takes the rest, and the loser takes a nap!\n\n[The bell. A very short fight. Cheering.]\n\nFLOOR MANAGER: ...and the market CORRECTS!",
      },
      {
        id: "li_note_board_minutes",
        type: "note",
        name: "Board of Governors — Minutes",
        title: "Minutes of the Special Meeting, 4 Mar 1967",
        learn: LI.LOCKS.nyse_board_term.id,
        text: 'PRESENT: nine governors. ABSENT: one governor (in the strongroom, "checking something").\n\n1. Motion to suspend trading in Halvorsen Atomic pending "clarification of the product". Carried.\n2. Motion to install a bomb shelter under the trading floor. Tabled — cost.\n3. Motion to open the floor tomorrow, Sunday, in emergency session, and ring the opening bell as usual "to reassure the public". Carried, 8–1.\n4. The governors\' teletype password is changed to BELLRINGER, at the Secretary\'s insistence. Carried.\n\nThe dissenting governor asked that her objection be recorded in full. Her objection, in full: "There is nobody left to reassure."',
      },
      {
        id: "li_pit_key",
        type: "key",
        name: "Pit Cage Key",
        desc: "A heavy padlock key on a loop of barbed wire, taken from the Pit.",
      },
    ]);
    LI.terminal("li_nyse_board", {
      title: "NYSE — BOARD OF GOVERNORS",
      header: "NEW YORK STOCK EXCHANGE — GOVERNORS' TELETYPE\nCONFIDENTIAL",
      lock: {
        id: LI.LOCKS.nyse_board_term.id,
        passcode: LI.LOCKS.nyse_board_term.passcode,
      },
      entries: [
        {
          title: "Market Status 03.05.1967",
          text: "09:30  OPEN (EMERGENCY SUNDAY SESSION)\n09:31  SELL ORDERS EXCEED FLOOR CAPACITY\n09:31  GOVERNORS CONVENED ON THE FLOOR\n09:32  TRADING HALTED BY ORDER OF THE BOARD\n09:47  [NO DATA]\n\nMarket will reopen at: [NO DATA]",
        },
        {
          title: "Strongroom Access",
          learn: [
            LI.LOCKS.nyse_strongroom.id,
            LI.LOCKS.nyse_gov_safe.id,
            LI.LOCKS.nyse_box_1929.id,
          ],
          text: () => {
            for (const k of [
              "nyse_strongroom",
              "nyse_gov_safe",
              "nyse_box_1929",
            ])
              LI.learnCode(LI.LOCKS[k].id, "NYSE governors' terminal");
            return (
              "Strongroom door: primary key held by the Specialist, Post 11. Dial combination (governors only): 1-7-9-2, the Buttonwood year.\n" +
              "Governors' safe (this room): 1-8-1-7.\nDeposit Box 1929 (the Specialist's): 1-0-2-9. He thought that was funny.\n\n" +
              'Spare cage and door keys: "somewhere at Post 11", per the Specialist, who has never once put anything back where it belongs.'
            );
          },
        },
        {
          title: "Memo: The Bell",
          text: "The opening and closing bells will be rung by honoured guests only. Guests are reminded that the bell is an antique, the hammer is heavy, and that last year's guest from Halvorsen Atomic rang it for eleven minutes.",
        },
      ],
    });
    LI.dialogue("dlg_li_captive", {
      start: () => (Q.flag("li_nyse_freed") ? "thanks" : "first"),
      nodes: {
        first: {
          speaker: "Nate Oduya",
          text: "Hey — hey! You're not one of them. They've got me down for tonight's card against Bruno. Forty to one. Please. The cage key's on Bruno — or there's a spare somewhere at Post 11, I heard the Floor Manager griping about it. Post 11 — one of the round trading booths, west of the Pit.",
          onEnter() {
            if (!Q.started(QID)) Q.start(QID);
          },
          responses: [
            { text: "I'll get you out." },
            { text: "Why did they grab you?", next: "why" },
          ],
        },
        why: {
          speaker: "Nate Oduya",
          text: 'I run water for the Flatiron Trading Post. Ran. Betty\'s boys "audited" my cart on Broad Street. Turns out the audit comes with a cage.',
          responses: [{ text: "Hang on." }],
        },
        thanks: {
          speaker: "Nate Oduya",
          text: "I owe you my whole life, which out here is about forty scrip. Take it anyway.",
          responses: [{ text: "Get home safe." }],
        },
      },
    });
    Q.define({
      id: QID,
      name: "Short Position",
      giver: "Nate Oduya",
      location: "NYSE Trading Floor",
      desc: "The Exchange's raiders caged a Flatiron water runner, Nate Oduya, to fight their pit champion. The odds are forty to one — against Nate.",
      stages: [
        {
          id: "free",
          text: "Free Nate Oduya from the Pit cage (Bruno's key or the spare key at Post 11).",
          markers: () => [
            {
              x: C.O.x + 20,
              z: C.O.z - 2.2,
              label: "Pit Cage",
              interior: true,
            },
          ],
        }, // the cage door (Nate stands inside the bars)
        {
          id: "done",
          text: "Nate Oduya is free. The Pit is one fighter short tonight.",
          complete: true,
        },
      ],
      rewards: { xp: 200, standing: 25 },
    });
    // the captive's cage door
    const cpos = C.W(20, 1.2, -2.7);
    let freed = false;
    const freeHim = () => {
      if (freed) return;
      freed = true;
      Q.set("li_nyse_freed");
      LI.sfx("door_open", { pos: cpos });
      const a = LI.npc("li_nyse_captive");
      if (a && !a.dead) {
        try {
          a.say && a.say("Thank you! THANK YOU!");
        } catch (e) {
          /* */
        }
        LI.giveScrip(40);
        setTimeout(() => {
          try {
            const b = LI.npc("li_nyse_captive");
            if (b) G.actors.remove(b);
          } catch (e) {
            /* */
          }
        }, 6000);
      }
      if (!Q.started(QID)) Q.start(QID);
      Q.setStage(QID, "done");
      if (Q.active("li_fl_dryspell")) Q.setStage("li_fl_dryspell", "return"); // Lorena's "Dry Spell": report back
    };
    LI.interact(
      cpos,
      "Pit Cage",
      () => (Q.flag("li_nyse_freed") ? "Empty" : "Open"),
      () => {
        if (Q.flag("li_nyse_freed")) return;
        if (LI.has("li_pit_key") || LI.has("key_exchange_vault")) {
          freeHim();
          return;
        }
        LI.openLock(LI.LOCKS.nyse_cage, freeHim);
      },
      { enabled: () => !Q.flag("li_nyse_freed") },
    );
    // the barred emergency exit (strongroom side lifts the bar; trading-floor side is barred)
    const bin = C.W(-10, 1.2, -23.5),
      bout = C.W(-10, 1.2, -21.6);
    const openBar = () => {
      if (!C.exitBar.col) return;
      try {
        G.world.removeCollider(C.exitBar.col);
      } catch (e) {
        /* */
      }
      C.exitBar.col = null;
      C.exitBar.mesh.visible = false;
      Q.set("li_nyse_bar_open");
      LI.sfx("door_open", { pos: bin });
    };
    const vpos = C.W(0.2, 1.3, -25.1);
    const openStrong = (instant) => {
      const V = C.strong;
      if (V.open) return;
      V.open = true;
      Q.set("li_nyse_strongroom_open");
      try {
        G.world.removeCollider(V.col);
      } catch (e) {
        /* */
      }
      V.col = null;
      if (instant) V.door.rotation.y = 1.7;
      else {
        LI.sfx("cryo_door", { pos: vpos, volume: 0.8 });
        V.anim = 0;
      }
    };
    const closeStrong = () => {
      const V = C.strong;
      if (!V.open) return;
      V.open = false;
      V.anim = null;
      V.door.rotation.y = 0;
      V.col = C.col(-1.3, 0, -26.3, -0.2, 2.6, -23.9, {
        walkable: false,
        surface: "metal",
      });
    };
    LI.animators.push({
      cell: C,
      fn: (dt) => {
        const V = C.strong;
        if (V.anim === null || V.anim === undefined) return;
        V.anim = Math.min(1, V.anim + dt * 0.35);
        V.door.rotation.y = 1.7 * (1 - Math.pow(1 - V.anim, 3));
        if (V.anim >= 1) V.anim = null;
      },
    });
    LI.interact(
      vpos,
      "Exchange Strongroom",
      () => (C.strong.open ? "Open" : "Unlock"),
      () => {
        if (C.strong.open) return;
        LI.openLock(LI.LOCKS.nyse_strongroom, () => openStrong());
      },
      {
        enabled: () => !C.strong.open,
        locked: () =>
          C.strong.open || LI.lockOpen(LI.LOCKS.nyse_strongroom.id)
            ? null
            : "Key or code",
      },
    );
    LI.saveHooks.nyse = {
      save: () => ({ bar: !C.exitBar.col, strong: C.strong.open }),
      load(d) {
        d = d || {};
        if (d.bar) openBar();
        if (d.strong) openStrong(true);
      },
      reset() {
        if (!C.exitBar.col) {
          C.exitBar.col = C.col(-11.2, 0, -22.8, -8.8, 2.7, -22.2, {
            walkable: false,
            surface: "metal",
          });
          C.exitBar.mesh.visible = true;
        }
        closeStrong();
        freed = false;
      },
    };
    LI.interact(bin, "Emergency Exit", "Lift the bar", openBar, {
      enabled: () => !!C.exitBar.col,
    });
    LI.interact(
      bout,
      "Emergency Exit",
      "Open",
      () => LI.notify("Barred from the other side."),
      { enabled: () => !!C.exitBar.col },
    );
    C.pickup(
      "li_pit_key",
      1,
      C.anchors.spare_key.x - C.O.x,
      C.anchors.spare_key.y,
      C.anchors.spare_key.z - C.O.z,
      0.7,
    );
  });

