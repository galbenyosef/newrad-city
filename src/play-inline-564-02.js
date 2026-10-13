// play-inline-564 02 — flag
// Lines 301-639 of readable/play-inline-564.pretty.js (statement-aligned).
  L.hook("init", function () {
    const M = ms();
    M.quest({
      id: "mq06",
      giver: "(continues the crossing)",
      location: "Liberty Island",
      desc: () =>
        "Liberty Station: the star fort and the pedestal under the Statue, where the Continuity holds Zeke, Dr. Calloway and Key B. " +
        (faction() === "covenant"
          ? "The Lancers are landing with you."
          : faction() === "continuity"
            ? "The Colonel is expecting you as a guest."
            : "You are on your own.") +
        (roseHere() ? " " + roseName() + " came with you." : ""),
      stages: [
        {
          id: "land",
          text: "Land on Liberty Island.",
          markers: () => {
            const d =
              L.spots && L.spots.libertyDock ? L.spots.libertyDock() : LIB();
            return [{ x: d.x, z: d.z, label: "Liberty Island" }];
          },
        },
        {
          id: "pedestal",
          text: () =>
            L.flag("ms_teague") === "free" && !L.flag("ms_gate_opened")
              ? "Get into the pedestal: storm the star fort, or try Private Teague's side gate."
              : "Get into the star fort and the pedestal.",
          markers: () => {
            const m = mk(SPOTS.command, "The pedestal");
            if (L.flag("ms_teague") === "free" && !L.flag("ms_gate_opened"))
              m.push({ npc: "ms_teague", label: "Side gate (Private Teague)" });
            return m;
          },
          onEnter() {
            stormBeach();
          },
        },
        {
          id: "command",
          text: "Reach the command post in the pedestal.",
          markers: () => mk(SPOTS.command, "Command post"),
        },
        {
          id: "poster",
          text: "(Optional) Take the wanted poster from the noticeboard.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq06", "pedestal"),
          doneIf: () => !!(ms() && ms().hasToken("poster")),
          markers: () => mk(SPOTS.poster, "Noticeboard"),
        },
      ],
      rewards: { xp: 600 },
      onComplete() {
        L.later(0.5, () => ms().next("mq25"));
      },
    });

    M.quest({
      id: "mq25",
      giver: "Colonel Augustus Crane",
      location: "Liberty Station command post",
      desc: () =>
        "Colonel Augustus Crane wants a clean sky by Directive 7-A, run on the very list that marked " +
        (L.flag("ms_rose_revealed") ? "Rose" : "your daughter") +
        ' for sterilisation. He also wants the "Match Woman" who burned his father in 1968.',
      stages: [
        {
          id: "confront",
          text: () =>
            L.flag("crane_fight")
              ? "Defeat Colonel Crane."
              : "Confront Colonel Crane.",
          markers: () => {
            const p = craneSpot() || LIB();
            return [
              { npc: "lib_crane", label: "Colonel Crane", x: p.x, z: p.z },
            ];
          },
        },
        {
          id: "cr_talk",
          text: "(Optional) Talk Colonel Crane into standing down.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () =>
            L.flag("ms_crane") === "surrendered" && !L.flag("crane_genome"),
        },
        {
          id: "cr_rolls",
          text: "(Optional) The rolls argument: his own soldiers aren't on the 1967 rolls.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("crane_genome"),
        },
        {
          id: "cr_kill",
          text: "(Optional) Defeat Colonel Crane.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("crane_dead"),
        },
        {
          id: "cr_ally",
          text: "(Optional) Stand with Colonel Crane.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("crane_ally"),
        },
        {
          id: "cr_shield",
          text: () =>
            "(Optional) Keep Crane from finding out who " + roseName() + " is.",
          sideObjective: true,
          optional: true,
          showIf: () => roseHere() && !L.flag("ms_rose_detained"),
          doneIf: () => !!L.flag("ms_rose_hidden"),
          failIf: () => !!L.flag("ms_rose_detained"),
        },
      ],
      rewards: { xp: 500 },
      onComplete() {
        L.later(0.5, () => ms().next("mq26"));
      },
    });

    M.quest({
      id: "mq26",
      giver: "Zeke Marlow / Dr. Ruth Calloway",
      location: "Liberty Island",
      desc: "Zeke is held in the old gift shop and Director Calloway in a casemate cell of Fort Wood. Somewhere in Liberty Station's evidence locker is Key B, the second key of the Glowkeepers' bomb.",
      stages: [
        {
          id: "zeke",
          text: "Free Zeke from the gift shop.",
          markers: () => [{ npc: "lib_zeke", label: "Zeke Marlow" }],
        },
        {
          id: "calloway",
          text: () =>
            L.flag("ms_casemate_open")
              ? "Talk to Dr. Calloway."
              : "Free Dr. Calloway from the casemate cell in Fort Wood.",
          markers: () =>
            L.flag("ms_casemate_open")
              ? [{ npc: "ms_calloway", label: "Dr. Calloway" }]
              : mk(SPOTS.casemate, "Casemate cell"),
        },
        {
          id: "locker",
          text: () =>
            "Open the evidence locker (" +
            (knows(LOCKS.evidence.id)
              ? "code 4471"
              : "the code is in Crane's duty log, or use his keys") +
            ").",
          markers: () =>
            liberty.evidence
              ? [
                  {
                    x: liberty.evidence.x,
                    z: liberty.evidence.z,
                    y: liberty.evidence.y,
                    label: "Evidence locker",
                  },
                ]
              : [],
        },
        {
          id: "keyb",
          text: "Decide what happens to Key B.",
          markers: () => (roseHere() ? ms().rose.marker("Rose") : []),
          onEnter() {
            L.later(0.6, () => {
              if (at("mq26", "keyb") && ms()) ms().talk("dlg_ms_keyb", "Key B");
            });
          },
        },
        {
          id: "brig",
          text: () => "(Optional) Get " + roseName() + " out of the brig.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_rose_detained"),
          doneIf: () => !!L.flag("ms_rose_freed"),
          markers: () =>
            L.flag("ms_rose_freed") ? [] : ms().rose.marker("Rose (detained)"),
        },
        {
          id: "sept",
          text: "(Optional) Free Lys and Corbeau and take the SIROCCO codebook.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            L.flag("ms_bureau") === "expose" && Q.reached("mq26", "locker"),
          doneIf: () =>
            !!L.flag("ms_codebook_taken") || !!L.flag("ms_sept_freed"),
          markers: () => [{ npc: "ms_lys_cell", label: "Lys and Corbeau" }],
        },
      ],
      rewards: { xp: 600 },
      onComplete() {
        L.later(0.5, () => ms().next("mq27"));
      },
    });

    M.quest({
      id: "mq27",
      giver: "(the file)",
      location: "Liberty Station: Crane's safe",
      desc: "Crane's safe holds FILE 67-03-05: who gave the order, who knew, and the missing second bomb. It is the answer Corbeau has wanted for twenty-two years.",
      stages: [
        {
          id: "safe",
          text: () =>
            "Open Crane's safe (" +
            (knows(LOCKS.safe.id)
              ? "code 0304"
              : "his duty log has the code, or use his keys") +
            ").",
          markers: () =>
            liberty.safe
              ? [
                  {
                    x: liberty.safe.x,
                    z: liberty.safe.z,
                    y: liberty.safe.y,
                    label: "Crane's safe",
                  },
                ]
              : [],
        },
        {
          id: "read",
          text: "Read FILE 67-03-05 (goggles → NOTES).",
          markers: () => [],
        },
        {
          id: "decide",
          text: "Decide what to do with the file.",
          markers: () => [],
        },
      ],
      rewards: { xp: 450 },
      onComplete() {
        L.later(0.5, () => ms().next("mq28"));
      },
    });

    M.quest({
      id: "mq28",
      giver: "Zeke Marlow",
      location: "Statue of Liberty: the torch teletype",
      desc: "The Knickerbocker Array charges on the tide for six days, so whatever you load fires at noon on Sunday. Choose what it will do.",
      stages: [
        {
          id: "climb",
          text: "Go up to the torch control teletype with Zeke.",
          markers: () => {
            const p = L.termPos("liberty_torch");
            return p
              ? [{ x: p.x, z: p.z, label: "Torch Control" }]
              : mk(SPOTS.torch, "Torch Control");
          },
        },
        {
          id: "choose",
          text: "Choose what the Array will do: RECLAMATION, SELECTIVE, CHARTER OVERRIDE or OVERLOAD.",
          markers: () => {
            const p = L.termPos("liberty_torch");
            return p ? [{ x: p.x, z: p.z, label: "Torch Control" }] : [];
          },
        },
      ],
      rewards: { xp: 800 },
      onComplete() {
        // Zeke and Calloway go home to Grand Central; Rose goes back to her roof.
        L.setFlag("zeke_home");
        if (L.flag("ms_calloway_free")) L.setFlag("ms_calloway_home");
        if (ms()) {
          ms().rose.place("home");
          L.later(0.5, () => ms().next("mq29"));
        }
        L.later(1, () => {
          placeZeke();
          placeCalloway();
        });
      },
    });
  });

  // ------------------------------------------------------------------
  // The crossing hand-off (called by mq24 in 64_ms_act3.js)
  // ------------------------------------------------------------------
  function arrive(how) {
    L.setFlag("ms_liberty_how", how || "ferry");
    if (Q.isActive("mq24")) Q.complete("mq24");
    const dock =
      L.spots && L.spots.libertyDock
        ? L.spots.libertyDock()
        : { x: LIB().x + 40, z: LIB().z - 40 };
    const d =
      how === "rotorcraft"
        ? L.anchor(
            "statue_of_liberty",
            ["rotorcraft", "helipad", "dock"],
            dock,
          ) || dock
        : dock;
    L.sfx(how === "rotorcraft" ? "ui_select" : "door_open", { volume: 0.5 });
    L.travel(
      d.x,
      d.y || 0,
      d.z,
      Math.atan2(-(LIB().x - d.x), -(LIB().z - d.z)),
      () => {
        L.notify(
          how === "rotorcraft"
            ? "The Rotorcraft banks low over the harbour and sets you down on Liberty Island in a storm of rotor-wash."
            : how === "lancers"
              ? "The Lancers' boats grind up onto the shingle under the star fort. Exo-rigs splash ashore around you, gyrojet carbines up."
              : "The ferry noses up against Liberty Island's crumbling pier. Ossie is already turning back.",
          { duration: 6 },
        );
        if (roseHere() && ms()) ms().rose.place("follow");
        L.later(0.6, () => {
          if (!Q.isStarted("mq06")) ms().next("mq06");
          L.later(0.8, landed);
        });
      },
    );
  }
