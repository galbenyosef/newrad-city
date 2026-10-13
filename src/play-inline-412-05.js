// play-inline-412 05 — ctx
// Lines 2524-2699 of readable/play-inline-412.pretty.js (statement-aligned).
  function termChairman() {
    return {
      title: "OFFICE OF THE CHAIRMAN",
      header: "BANKERS TRUST COMPANY — EXECUTIVE TELETYPE\nCONFIDENTIAL",
      lock: BT_LOCKS.chairman,
      entries: [
        {
          title: "Memo: The OCD Account (LW-9)",
          text: 'The Office of Civil Defense has deposited a classified construction budget (account LW-9, purpose not stated) with us, in gold, pending "disbursement." They have asked that the time lock be set to its maximum movement and that it NOT be opened "under any circumstances, including the end of the world."\n\nI assume that is a figure of speech. Fee structure attached.',
        },
        {
          title: "Memo: Time-Lock Override Code",
          text: "For the Chairman's eyes only. In the event the time lock must be overridden, the keypad beside the vault accepts the code below. The override also grants an extended cycle.\n\nCODE: 14-9255 (that is 14 W-A-L-L on the telephone dial)\n\n(Please do not use the address of the building as the code again. — Security)",
          learn: BT_LOCKS.override.id,
          action: () => {
            if (!PV.flag("bt_code")) {
              PV.setFlag("bt_code", true);
              K.notify("You note down the vault override code.");
              if (K.q.active("pf3_bt_heist"))
                K.xp(25, "Found the override code");
            }
          },
        },
        {
          title: "Personal: to Margaret",
          text: "The board voted to stay in session. I voted with them. I have voted with them for thirty years.\n\nThe view from up here is the finest in the city, Maggie. I can see all the way up the island. There is a light up north, past the Bronx, that is getting brighter.\n\nI should have stayed home this morning. It was Sunday. The wall safe is still set to our anniversary, 0-6-1-4. You always said I'd forget it. I never did.",
          learn: BT_LOCKS.wallsafe.id,
        },
      ],
    };
  }

  // ------------------------------------------------------------------
  // Data: items, quest
  // ------------------------------------------------------------------
  PV.btData = function () {
    K.defineItem({
      id: "pf3_bt_bonds",
      type: "misc",
      name: "Bankers Trust Bearer Bonds",
      weight: 0.5,
      value: 600,
      tags: ["valuable", "unique"],
      desc: "A sheaf of engraved bearer bonds, payable to whoever holds them, redeemable at any Bankers Trust branch. There is one Bankers Trust branch left. It is run by robots.",
    });
    K.defineItem({
      id: "pf3_bt_box_key",
      type: "key",
      name: "Safe Deposit Master Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: "A long nickel key with a brass tag: BANKERS TRUST · SAFE DEPOSIT · MASTER · CHAIRMAN ONLY. It opens every box in the vault.",
    });
    K.defineItem({
      id: "pf3_bt_pen",
      type: "misc",
      name: "Chairman's Gold Fountain Pen",
      weight: 0.1,
      value: 180,
      tags: ["valuable", "unique"],
      desc: 'Solid gold, engraved "Thirty Years of Prudent Stewardship." It signed the Long Winter account. It still writes.',
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pf3_bt_heist",
        name: "The Last Withdrawal",
        giver: "",
        location: "Bankers Trust Building",
        desc: "The Bankers Trust vault under 14 Wall Street has been time-locked since the bombs fell. A dead robber's plan says it can be opened — for a little while.",
        stages: [
          {
            id: "open",
            text: "Open the vault: log on to the time-lock console (a vault clerk kept the password on a duty card), or find the Chairman's override code in the Pyramid Room.",
            markers: [
              () => {
                const a = PV.anchor("bankers_trust", "console");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Time-Lock Console",
                      interior: "bankers_trust",
                    }
                  : null;
              },
            ],
          },
          {
            id: "loot",
            text: "Clean out the vault — and get out before the time lock re-engages.",
            markers: [
              () => {
                const a = PV.anchor("bankers_trust", "vault");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Vault",
                      interior: "bankers_trust",
                    }
                  : null;
              },
            ],
          },
          {
            id: "escape",
            text: "You are sealed in the vault. Escape through the ventilation duct before the halon gets you.",
            markers: [
              () => {
                const a = PV.anchor("bankers_trust", "vent");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Ventilation Duct",
                      interior: "bankers_trust",
                    }
                  : null;
              },
            ],
          },
        ],
        rewards: { xp: 250 },
      });
    }
  };
  PV.btSpawn = function (ctx) {
    H.ctx = ctx;
    // the doorman on the loggia: a Patrolman that still bows customers in (harmless unless provoked)
    {
      const B = PV.bt;
      PV.spawnActor(ctx, {
        id: "pf3_bt_doorman",
        type: "patrolman",
        name: "Doorman-Unit 2",
        faction: "robots",
        level: 6,
        hostile: false,
        pos: { x: B.XC + 4.3, y: B.LOG_Y, z: B.LOG_Z - 1.6 },
        yaw: PI,
        ai: "static",
        loot: "patrolman",
        noRespawn: true,
        barks: [
          "GOOD MORNING, VALUED CUSTOMER. BANKERS TRUST IS OPEN FOR BUSINESS.",
          "PLEASE WIPE YOUR FEET. YOUR FEET ARE RADIOACTIVE.",
          "THE LOBBY UNITS ARE ALSO OPEN FOR BUSINESS. THEIR BUSINESS IS SECURITY.",
        ],
      });
    }
    // the robot "greeter" at the door keeps its bank open (in addition to the location's security units)
    PV.spawnActor(ctx, {
      id: "pf3_bt_greeter",
      type: "patrolman",
      name: "Teller-Unit 7",
      faction: "robots",
      level: 8,
      hostile: true,
      pos: { x: ctx.O.x + 2.5, y: ctx.O.y, z: ctx.O.z - 8 },
      yaw: PI,
      ai: "guard",
      home: { x: ctx.O.x + 2.5, z: ctx.O.z - 8, r: 4 },
      loot: "patrolman",
      noRespawn: true,
      barks: [
        "WELCOME TO BANKERS TRUST. PLEASE TAKE A NUMBER.",
        "YOUR NUMBER IS: TERMINATED.",
        "BANKING HOURS ARE NINE TO THREE. IT IS ALWAYS NINE TO THREE.",
        "HAVE YOU CONSIDERED A CHRISTMAS CLUB ACCOUNT?",
      ],
    });
  };
