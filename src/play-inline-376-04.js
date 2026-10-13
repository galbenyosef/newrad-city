// play-inline-376 04 — title
// Lines 464-800 of readable/play-inline-376.pretty.js (statement-aligned).
  function defineTerminals() {
    if (G.isStub("terminals") || typeof G.terminals.register !== "function")
      return;
    const T = (id, def) =>
      P.safe("term:" + id, () => G.terminals.register(id, def));
    T("m3_club52_ledger", {
      title: "THE KING'S BOOK",
      header:
        '"52" CLUB — MANAGER\'S OFFICE\nMeridian Telelink (property of the Jockey King, touch it and die)',
      entries: [
        {
          title: "Tonight's Card",
          text: "RACE 1 — Big Sal / Lil Sal / Six Legs / Glowie / Ha'penny\nRACE 2 — same roaches, they don't know\nRACE 3 — Six Legs is fixed to lose. Don't tell Six Legs.\nRACE 4 — Big Sal to win (the King's money is on Big Sal)\nRACE 5 — winner gets eaten",
        },
        {
          title: "The King's Safe",
          learn: "m3_king_safe",
          text: "Combination: 1-1-0-5. Eleven wins, no losses, five-to-one. The King's lucky numbers.\nIf you are reading this and you are not the King: the King knows.",
        },
        {
          title: "Debts Owed",
          text: 'Scabby Pete ........ 40 scrip (fingers: 2 left)\nThe Hollister kid .. 15 scrip\nMad Dora ........... 60 scrip (DO NOT collect, she bites)\nThe Covenant .... 0 scrip, 1 insult — collect later\nChaz (old bartender) .. "the cellar" — see below',
        },
        {
          title: "RE: Charlie's Cellar",
          text:
            'Every old-timer in Midtown says "52" had a secret cellar in the Prohibition. Two thousand bottles. The MAYOR\'S private stash.\n\n' +
            'We have torn out the kitchen walls, the coat check, the ice room and Dutch\'s left ear. Nothing.\n\nThe old bartender knows. He keeps saying "the door is a wall and the key is dinner". ' +
            "Keep asking him until he stops being funny.\n\nUPDATE: he stopped being funny. Also stopped breathing. Dump him downstairs.",
        },
      ],
    });
    T("m3_helms_checkpoint", {
      title: "CHECKPOINT 7",
      header: "CONTINUITY — DETACHMENT 7\nAccess Control Telelink",
      entries: [
        {
          title: "Standing Orders",
          text: "All persons approaching Checkpoint 7 are to be challenged ONCE.\nPersons without clearance are to be removed from the gene pool.\nDo not engage the old drunk who waves at the portal every morning. He is harmless and it is bad for morale when we miss.",
        },
        {
          title: "Portal Traffic (last 24h)",
          text: "Northbound portal: 0 vehicles, 3 burrow rats (neutralized), 1 Covenant scout (observed, withdrew)\nSouthbound portal: 0 vehicles, 1 trade wagon (turned back, pack oxen confiscated — tasty)",
        },
        {
          title: "Elevator Status",
          text: "LOBBY CARS 1-6 ....... DEAD SINCE 1967\nEXPRESS (3rd → CROWN) .. OPERATIONAL\nFREIGHT ............... PARKED AT CROWN (security)",
        },
      ],
    });
    T("m3_helms_barracks", {
      title: "DETACHMENT 7 — QUARTERS",
      header:
        "CONTINUITY PERSONNEL TERMINAL\n(formerly N.Y. CENTRAL — DISPATCH DESK 4)",
      entries: [
        {
          title: "Watch Bill",
          learn: "m3_helms_officer",
          text: "Lobby checkpoint ....... Pvt. Kearney, Pvt. Adeyemi\nCrown relay ........... Cpl. Deane, EB-117 (Sky-Eye drone)\nOfficer on duty ....... Lt. A. Voss (permanently, apparently)\n\nDuty officer's teletype passcode this month: GILDEDCROWN. (Deane — STOP posting it on the watch bill. — V.)",
        },
        {
          title: "Found in Desk 4 (old-world file)",
          text: 'MEMO, NEW YORK CENTRAL SYSTEM, 03/02/67:\nThe Civil Defense "special" to the upstate shelters will depart the lower level at 06:00 daily until further notice. Seats by lottery. The executive floors will NOT be taking the lottery; the executive floors have made other arrangements.\n\n[There is no record of what the other arrangements were.]',
        },
        {
          title: "Personal: Pvt. Kearney",
          text: "Letter #31 to Mom (unsent). The city is not like the briefing films. There's a band on the radio from somewhere uptown that plays every night. I'm not supposed to listen. I listen.",
        },
      ],
    });
    T("m3_helms_comms", {
      title: "RADIO ROOM",
      header: "CONTINUITY SIGNALS — MIDTOWN BAND\nRelay 7 Monitor",
      entries: [
        {
          title: "Relay Status",
          text: () =>
            F.relay === "off"
              ? "RELAY 7: NO CARRIER\nCrown reports: [NO RESPONSE]"
              : F.relay === "rfm"
                ? 'RELAY 7: CARRIER HIJACKED\nNow repeating: "RADIO FREE MANHATTAN"\n(Please stop tapping the monitor. It is still jazz.)'
                : "RELAY 7: CARRIER NOMINAL\nRepeating: Presidential Address #212, #213, #214\nSky-Eye drone telemetry: 11 units reporting",
        },
        {
          title: "Intercepts",
          text: '"...this is Radio Free Manhattan, coming to you from the top of Radio City, and to our friends in the black armor: we can hear you breathing, fellas..."\n\n[Operator note: jam this. Operator note 2: can\'t, their antenna is taller. Operator note 3: get a taller antenna.]',
        },
      ],
    });
    T("m3_helms_officer", {
      title: "LT. A. VOSS",
      header: "CONTINUITY — OFFICER'S TERMINAL\nDetachment 7",
      lock: P.LOCKS.officer_term,
      entries: [
        {
          title: "Safe",
          learn: "m3_officer_safe",
          text: "Office safe combination reset to 0-7-1-2 after the Deane incident.",
        },
        {
          title: "Report to Liberty Station (draft)",
          text: 'Relay 7 fully operational. Local population pacified, relocated, or reclassified. Request replacement Sky-Eye drones (EB-109 fell off the crown again).\n\nNote: the squatters in the lower lobby have been removed. One of them called the building "home". Filed as a threat.',
        },
        {
          title: "Relay Codes",
          text: "Maintenance codes are on my person. Where they belong. Nice try, Deane.",
        },
        {
          title: "Personal Log",
          text: "Sometimes at night the lantern floodlights come on by themselves — some old timer circuit from before the war — and the whole crown glows gold. The men say it looks like the city is still alive. I have told them it does not.",
        },
      ],
    });
    T("m3_helms_relay", {
      title: "RELAY 7 — CARRIER CONTROL",
      header:
        "CONTINUITY SIGNALS CORPS\nRelay 7 Master Console · Meridian Telelink",
      lock: P.LOCKS.relay_term,
      onUnlock: () => {
        if (qActive("m3_dead_air")) qSet("m3_dead_air", "silence");
      },
      entries: [
        {
          title: "Carrier Status",
          text: () =>
            F.relay === "off"
              ? "CARRIER: NONE\nCORE: SLAG"
              : F.relay === "rfm"
                ? "CARRIER: 97.3 — SOURCE: RADIO CITY (external)\nMODE: REPEATER\nPOWER: 100%"
                : "CARRIER: CONTINUITY MIDTOWN BAND\nSOURCE: MOUNT WEATHER UPLINK\nSKY-EYE DRONES TELEMETRY: 11 UNITS\nPOWER: 100%",
        },
        {
          title: "OVERLOAD CORE (irreversible)",
          cond: () => F.relay === "on",
          text: "Overload sequence armed.",
          action: () => {
            C.overloadRelay();
            return "CORE TEMPERATURE: CRITICAL\nCARRIER LOST\n...\n...\n[The terminal screen fills with static.]";
          },
        },
        {
          title: "RE-TUNE CARRIER: Radio Free Manhattan",
          cond: () => F.relay === "on",
          text: "Re-tuning.",
          action: () => {
            C.retuneRelay();
            return "EXTERNAL SOURCE ACQUIRED: 97.3\nREPEATER MODE ENGAGED\nPOWER: 100%\n\n[Somewhere under the pyramid a trumpet starts playing.]";
          },
        },
        {
          title: "Beacon Test",
          cond: () => F.relay !== "off",
          text: () =>
            F.relay === "rfm"
              ? "BEACON: GREEN (non-standard — please report)"
              : "BEACON: RED (standard)",
        },
      ],
    });
  }

  // ==================================================================
  // QUESTS
  // ==================================================================
  function defineQuests() {
    const q = Q();
    if (!q) return;
    const mk = (poi, name, label) => () => {
      const a = A(poi, name);
      return a ? [{ x: a.x, z: a.z, y: a.y, label }] : [];
    };
    const inOrOut = (poi, inName, label, outLabel) => () =>
      P.inCell(poi)
        ? mk(poi, inName, label)()
        : mk(poi, "exterior_entrance", outLabel)();
    P.safe("quest:cellar", () =>
      q.define({
        id: "m3_cellar",
        name: "Behind the Brick",
        giver: "Chaz",
        location: '"52" Club',
        desc: 'The "52" Club hid a Prohibition wine cellar that the Feds never found. The raiders who call themselves the Jockeys have torn the club apart looking for it. An old bartender took the secret to his grave — almost.',
        stages: [
          {
            id: "find",
            text: 'Find the hidden wine cellar of the "52" Club.',
            markers: inOrOut(
              "club_52",
              "basement",
              "The Basement",
              '"52" Club',
            ),
          },
          {
            id: "open",
            text: "Open the hidden door in the basement wall. (A meat skewer from the kitchen should trip the latch.)",
            markers: () =>
              has("m3_meat_skewer")
                ? inOrOut("club_52", "secret_wall", "Brick Wall", '"52" Club')()
                : inOrOut(
                    "club_52",
                    "skewer",
                    "Kitchen Skewer Rack",
                    '"52" Club',
                  )(),
          },
          {
            id: "claim",
            text: "Claim the Mayor's Reserve in the wine cellar.",
            markers: inOrOut(
              "club_52",
              "reserve",
              "The Mayor's Reserve",
              '"52" Club',
            ),
          },
        ],
        rewards: { xp: 300, scrip: 0 },
      }),
    );
    P.safe("quest:dead_air", () =>
      q.define({
        id: "m3_dead_air",
        name: "Red Eye",
        giver: "Relay 7",
        location: "New York Central Building",
        desc: 'The Continuity have bolted a signals relay onto the gilded crown of the New York Central Building. "The red eye" repeats their broadcasts across Midtown and spots for their patrols. Whoever holds the crown holds the airwaves.',
        stages: [
          {
            id: "reach",
            text: "Reach Relay 7 in the crown of the New York Central Building (the express elevator on the 3rd floor).",
            markers: () =>
              P.inCell("helmsley")
                ? G.player && G.player.pos.y - P.I("helmsley").y > 11
                  ? mk("helmsley", "express", "Express Elevator")()
                  : mk("helmsley", "stairs", "Stairs")()
                : mk(
                    "helmsley",
                    "exterior_entrance",
                    "New York Central Building",
                  )(),
          },
          {
            id: "silence",
            text: "Silence Relay 7: overload the transmitter core — or re-tune it to carry Radio Free Manhattan.",
            markers: inOrOut(
              "helmsley",
              "relay_console",
              "Relay Console",
              "New York Central Building",
            ),
          },
        ],
        rewards: { xp: 450, standing: 10 },
      }),
    );
  }

  // ==================================================================
  // SET PIECES
  // ==================================================================
  // ---------- '52': the two-ton door ----------
  C.openCellar = function (instant) {
    const T = P.club52;
    if (!T || T.open) return;
    T.open = true;
    F.cellarOpen = true;
    if (T.leafCol) {
      P.safe("rmcol", () => G.world.removeCollider(T.leafCol));
      T.leafCol = null;
    }
    // the swung-open leaf (x 7.8..10 at the hinge line z -7) is still two tons of brick: give it a collider
    if (!T.openCol) {
      const lp = T.leaf.position;
      T.openCol = P.safe("opencol", () =>
        G.world.addBox(
          lp.x - 2.2,
          lp.y,
          lp.z - 0.25,
          lp.x,
          lp.y + 2.5,
          lp.z + 0.25,
          { tag: "poi", walkable: false },
        ),
      );
    }
    if (instant) {
      T.leaf.rotation.y = HP;
      T.anim = 1;
      return;
    }
    T.anim = 0.0001;
    sfx("cryo_door", { volume: 0.6, pitch: 0.7 });
    if (G.player) P.safe("shake", () => G.player.shake(0.25, 1.6));
    G.notify(
      "With a deep grinding groan, two tons of brick swing inward on a hidden hinge.",
    );
    if (!qDone("m3_cellar")) {
      qStart("m3_cellar", "claim");
      qSet("m3_cellar", "claim");
    }
    xp(40, "Found Charlie's cellar");
  };
  function tickCellar(dt) {
    const T = P.club52;
    if (!T || !T.anim || T.anim >= 1) return;
    T.anim = Math.min(1, T.anim + dt / 3.2);
    const e =
      T.anim < 0.5 ? 2 * T.anim * T.anim : 1 - Math.pow(-2 * T.anim + 2, 2) / 2;
    T.leaf.rotation.y = HP * e;
  }
  // ---------- Helmsley: Relay 7 ----------
  const RELAY_COL = { on: 0x5aa0ff, off: 0x000000, rfm: 0xffb040 };
  function applyRelay() {
    const R = P.helmsRelay,
      B = P.helmsBeacon;
    if (R) {
      R.ringMat.emissive.setHex(RELAY_COL[F.relay] || 0x5aa0ff);
      R.ringMat.emissiveIntensity = F.relay === "off" ? 0 : 1.8;
      R.ringMat.color.setHex(F.relay === "off" ? 0x151515 : 0x1a2a40);
      if (R.glow) R.glow.visible = F.relay !== "off";
      if (R.orb) R.orb.scale.setScalar(F.relay === "off" ? 0.8 : 1);
    }
    if (B) {
      B.mat.emissive.setHex(F.relay === "rfm" ? 0x40ff60 : 0xff2a1a);
      B.mat.emissiveIntensity = F.relay === "off" ? 0 : 2.4;
      if (B.glow) {
        B.glow.visible = F.relay !== "off";
        P.safe("bcol", () => {
          if (B.glow.material && B.glow.material.color)
            B.glow.material.color.setHex(
              F.relay === "rfm" ? 0x40ff60 : 0xff3020,
            );
        });
      }
    }
  }
