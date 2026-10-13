// play-inline-550 02 — label
// Lines 224-553 of readable/play-inline-550.pretty.js (statement-aligned).
  L.hook("init", function () {
    L.quest({
      id: "mq01",
      main: true,
      category: "main",
      order: 1,
      act: 1,
      actLabel: "Act I: Thaw",
      name: "Long Winter",
      giver: "CUSTODIAN",
      location: "Cryo Unit C-9",
      desc: () =>
        "Project Long Winter froze " +
        L.heroName() +
        " in Cryo Unit C-9, under the Manhattan Municipal Building, on February 20, 1967, for a ninety-day trial. Two weeks later the bombs fell. " +
        "The pod has opened at last. The calendar on the wall says 1989. Every other pod is dark, and nobody has come to say why. " +
        "Somewhere up there, twenty-two years ago, Nicole Mead was keeping a light on for you.",
      stages: [
        {
          id: "wake",
          text: "Find your VIGIL goggles on the charging cradle in the prep room.",
          markers: () =>
            C.goggles
              ? [
                  {
                    x: C.goggles.x,
                    z: C.goggles.z,
                    y: C.goggles.y,
                    label: "VIGIL Goggles",
                  },
                ]
              : [],
          onEnter() {
            if (G.isStub("items"))
              L.later(1, () => {
                L.giveGoggles(true);
                advance();
              });
          },
        },
        {
          id: "director",
          text: () =>
            "Find out what happened: read Director Calloway's logs in her office.",
          markers: () => {
            const m = [];
            if (C.directorTerm)
              m.push({
                x: C.directorTerm.x,
                z: C.directorTerm.z,
                y: C.directorTerm.y,
                label: "Director's Terminal",
              });
            if (
              C.desk &&
              !L.has("q_note_director_memo") &&
              !L.flag("got_cryo_desk_note")
            )
              m.push({
                x: C.desk.x,
                z: C.desk.z,
                y: C.desk.y,
                label: "Director's Desk",
              });
            return m;
          },
          onEnter() {
            L.later(1.5, () =>
              custodian(
                "DIRECTOR CALLOWAY IS NOT IN HER OFFICE. DIRECTOR CALLOWAY HAS NOT BEEN IN HER OFFICE FOR TEN DAYS. THIS HAS BEEN LOGGED.",
              ),
            );
            if (!C.directorTerm && !C.desk)
              L.later(2, () => {
                readLogs("the Director's office");
              });
          },
        },
        {
          id: "locker7",
          text: "Open your locker, number 7: Nicole's photo strip, her letters, the ring box.",
          markers: () =>
            C.locker7
              ? [
                  {
                    x: C.locker7.x,
                    z: C.locker7.z,
                    y: C.locker7.y,
                    label: "Locker 7",
                  },
                ]
              : [],
          onEnter() {
            L.later(1.2, () =>
              custodian(
                "PERSONAL EFFECTS, POD 7, ARE IN LOCKER 7. THEY HAVE BEEN KEPT AT A CONSTANT TEMPERATURE. THIS UNIT IS PROUD OF THAT.",
              ),
            );
          },
        },
        {
          id: "armory",
          text: "Take the sidearm from the security locker.",
          markers: () =>
            C.securityLocker
              ? [
                  {
                    x: C.securityLocker.x,
                    z: C.securityLocker.z,
                    y: C.securityLocker.y,
                    label: "Security Locker",
                  },
                ]
              : [],
          onEnter() {
            L.later(1.2, () =>
              custodian(
                "PEST INCURSION, MAINTENANCE CORRIDOR. PEST CONTROL STAFF ON DUTY: 0. SECURITY LOCKER: UNLOCKED. PLEASE ASSIST.",
              ),
            );
            if (!pistolId()) L.later(0.5, advance);
          },
        },
        {
          id: "roaches",
          text: () =>
            "Clear the giant roaches out of the maintenance corridor (" +
            (3 - roachesLeft()) +
            "/3).",
          markers: () =>
            C.roach
              ? [
                  {
                    x: C.roach.x,
                    z: C.roach.z,
                    y: C.roach.y,
                    label: "Giant Roaches",
                  },
                ]
              : [],
          onEnter() {
            spawnRoaches();
            L.hint(
              "fire",
              (!G.isStub("weapons") &&
              G.weapons.isHolstered &&
              !G.weapons.isHolstered()
                ? ""
                : "Draw your weapon with [H]. ") +
                "[Left Mouse] fires, [Right Mouse] aims, [R] reloads.",
              0.5,
            );
            if (G.isStub("actors"))
              L.later(1, () => {
                L.setFlag("cryo_roaches_skipped");
                advance();
              });
          },
        },
        {
          id: "zeke",
          text: "Find out what became of Zeke Marlow: check his pod and his locker.",
          markers: () => {
            const m = [];
            if (C.zekeLocker)
              m.push({
                x: C.zekeLocker.x,
                z: C.zekeLocker.z,
                y: C.zekeLocker.y,
                label: "Zeke's Locker",
              });
            if (C.zekePod && !L.flag("cryo_zeke_pod_seen"))
              m.push({
                x: C.zekePod.x,
                z: C.zekePod.z,
                y: C.zekePod.y,
                label: "Zeke's Pod",
              });
            return m;
          },
          onEnter() {
            L.later(1.0, () =>
              custodian(
                "POD 9, MARLOW: DISCHARGED ON A THAW FAULT TWENTY-ONE DAYS AGO. OCCUPANT LEFT A PERSONAL ITEM IN LOCKER 9 AND AN UNAUTHORIZED SANDWICH IN THE INFIRMARY.",
              ),
            );
            L.hint(
              "notes",
              "Notes and tape reels are kept in your goggles: [Tab] → NOTES.",
              3,
            );
          },
        },
        {
          id: "door",
          text: () =>
            codeKnown()
              ? "Enter Director Calloway's code on the blast door keypad."
              : "Find the blast door code and open the door.",
          markers: () =>
            C.keypad
              ? [
                  {
                    x: C.keypad.x,
                    z: C.keypad.z,
                    y: C.keypad.y,
                    label: "Blast Door Keypad",
                  },
                ]
              : [],
          onEnter() {
            L.hint(
              "keypad",
              "Walk up to the keypad and press [E]. Codes you find are logged in your goggles under NOTES → CODES.",
              1.5,
            );
            if (!codeKnown() && !L.flag("cryo_logs_read"))
              L.later(2, () =>
                custodian(
                  "THE BLAST DOOR CODE IS HELD BY THE FACILITY DIRECTOR. THE FACILITY DIRECTOR IS NOT AVAILABLE. HAVE YOU TRIED HER DESK.",
                ),
              );
          },
        },
        {
          id: "leave",
          text: "Climb the service stair, go up through the Municipal Building and out onto Chambers Street.",
          markers: () => {
            const p = G.player.pos,
              o =
                G.LAYOUT.INTERIORS.cryo_c9 && G.LAYOUT.INTERIORS.cryo_c9.origin;
            const inCell =
              o && Math.abs(p.x - o.x) < 200 && Math.abs(p.z - o.z) < 200;
            if (inCell && C.exit)
              return [
                {
                  x: C.exit.x,
                  z: C.exit.z,
                  y: C.exit.y,
                  label: "Service Stair",
                },
              ];
            const X = G.LAYOUT.cryoExit;
            return X ? [{ x: X.x, z: X.z, label: "Chambers Street" }] : [];
          },
          onEnter() {
            L.later(0.8, () =>
              custodian(
                "BLAST DOOR OPEN. PLEASE CLOSE IT BEHIND YOU. GOODBYE, POD 7. IT WAS PLEASANT TO HAVE SOMEONE TO TALK TO.",
                6.5,
              ),
            );
          },
        },
        {
          id: "ring",
          text: "(Optional) Take the ring.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_locker7_opened"),
          doneIf: () => !!L.flag("ms_has_ring"),
          markers: () =>
            C.locker7
              ? [
                  {
                    x: C.locker7.x,
                    z: C.locker7.z,
                    y: C.locker7.y,
                    label: "Locker 7",
                  },
                ]
              : [],
        },
        {
          id: "candles",
          text: "(Optional) Look at what is on the step outside the service door.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            (Q.stage("mq01") === "door" || Q.stage("mq01") === "leave") &&
            !!C.exit,
          doneIf: () => !!L.flag("ms_candles_seen"),
          markers: () =>
            C.exit
              ? [
                  {
                    x: C.exit.x,
                    z: C.exit.z,
                    y: C.exit.y,
                    label: "Service door",
                  },
                ]
              : [],
        },
        {
          id: "custodian",
          text: "(Optional) Query CUSTODIAN at the computer core terminal.",
          sideObjective: true,
          optional: true,
          showIf: () => !!C.custodianTerm && !!L.flag("got_goggles"),
          doneIf: () => !!L.flag("cryo_custodian_talked"),
          markers: () =>
            C.custodianTerm
              ? [
                  {
                    x: C.custodianTerm.x,
                    z: C.custodianTerm.z,
                    y: C.custodianTerm.y,
                    label: "CUSTODIAN",
                  },
                ]
              : [],
        },
      ],
      rewards: { xp: 100 },
      onComplete() {
        L.later(
          4.5,
          () => {
            if (!Q.isStarted("mq02")) Q.start("mq02");
          },
          "chain",
        );
      },
    });
  });

  // ------------------------------------------------------------------
  // Scripted beats
  // ------------------------------------------------------------------
