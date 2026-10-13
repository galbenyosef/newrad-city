// play-inline-559 05 — markers
// Lines 1326-1634 of readable/play-inline-559.pretty.js (statement-aligned).
  function cleanupExpress() {
    if (EXP.driverId) L.removeNPC(EXP.driverId);
    if (EXP.ox && !EXP.ox.removed && !G.isStub("actors"))
      try {
        G.actors.remove(EXP.ox);
      } catch (e) {
        /* ignore */
      }
    EXP.run = null;
    EXP.driver = null;
    EXP.ox = null;
    L.setFlag("neon_exp_state", null);
  }

  // ==================================================================
  // Quests
  // ==================================================================
  L.hook("init", function () {
    L.quest({
      id: "sq_neon_ball",
      name: "Drop the Ball",
      giver: "Mayor Lucius Crowe",
      location: "The Neon (Times Square)",
      desc: "The Times Square Ball has been stuck on its mast since the night of the bombs. Mayor Crowe believes that if it drops again at midnight, the Neon becomes a real city. It needs a new winch motor and cable.",
      stages: [
        {
          id: "parts",
          text: () =>
            "Find parts for the Ball's winch: an elevator motor from the Public Library" +
            (L.has("q_neon_winch_motor") ? " [done]" : "") +
            " and a spool of steel cable from Sprocket's Robo-Shop" +
            (L.has("q_neon_cable") ? " [done]" : "") +
            ".",
          markers: () =>
            [
              !L.has("q_neon_winch_motor") &&
                (L.pickups.neon_motor
                  ? {
                      x: L.pickups.neon_motor.pos.x,
                      z: L.pickups.neon_motor.pos.z,
                      label: "Book-Lift Motor",
                    }
                  : { x: 80, z: -162, label: "NY Public Library" }),
              !L.has("q_neon_cable") && npcM("neon_sprocket", "Sprocket"),
            ].filter(Boolean),
        },
        {
          id: "install",
          text: "Repair the Ball's winch at the base of One Times Square.",
          markers: () => {
            const b = ballSpots().base;
            return b ? [{ x: b.x, z: b.z, label: "Ball Winch" }] : [];
          },
        },
        {
          id: "midnight",
          text: "Be in Times Square at midnight for the first Ball drop since New Year's 1967.",
          markers: () => {
            const b = ballSpots().base;
            return b ? [{ x: b.x, z: b.z, label: "The Ball" }] : [];
          },
        },
      ],
      rewards: { xp: 400, scrip: 250, standing: 50 },
    });
    L.quest({
      id: "sq_neon_power",
      name: "Power to the People",
      giver: "Sparks Malloy",
      location: "The Neon Power Plant",
      desc: "The Neon's lights have been failing at the same hour every night. Sparks Malloy, the chief engineer, doesn't believe in coincidences.",
      stages: [
        {
          id: "inspect",
          text: "Inspect the main breaker panel of the Big Buzz.",
          markers: () => {
            const p = powerPanelSpot();
            return p ? [{ x: p.x, z: p.z, label: "Breaker Panel" }] : [];
          },
        },
        {
          id: "fuel",
          text: "(Optional) Bring Sparks three dry cells for the backup bank.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            ["culprit", "confront", "defend"].indexOf(
              Q.stage("sq_neon_power"),
            ) >= 0 && !L.flag("power_fuel"),
          doneIf: () => !!L.flag("power_fuel"),
          markers: () => [npcM("neon_sparks", "Sparks Malloy")],
        },
        {
          id: "culprit",
          text: 'Find out who "K.L." is. Someone in the Neon may know — try the Captain of the Guard, or Lucky Lou at the Rad Room.',
          markers: () => [
            npcM("neon_capt", "Captain Kincaid"),
            npcM("neon_dealer", "Lucky Lou"),
          ],
        },
        {
          id: "confront",
          text: "Confront Kip Lasko at the Neon Depot.",
          markers: () => {
            const k = L.npc("neon_kip"),
              p = k ? null : kipSpot();
            return [
              p
                ? { x: p.x, z: p.z, y: p.y, label: "Kip Lasko" }
                : npcM("neon_kip", "Kip Lasko"),
            ];
          },
        },
        {
          id: "defend",
          text: "Warn Captain Kincaid, then defend the west gate against Slag's raiders at 2:00 in the morning.",
          markers: () => {
            const g = N().spot(["gate_w"], { near: ["guard3"], dx: 3, dz: 0 });
            return [npcM("neon_capt", "Captain Kincaid")].concat(
              g ? [{ x: g.x, z: g.z, label: "West Gate" }] : [],
            );
          },
        },
        {
          id: "report",
          text: "Report to Sparks Malloy.",
          markers: () => [npcM("neon_sparks", "Sparks Malloy")],
        },
      ],
      rewards: { xp: 450, scrip: 300 },
    });
    L.quest({
      id: "sq_neon_opry",
      name: "The Show Must Go On",
      giver: "Lionel Fairweather",
      location: "The Neon Opry",
      desc: "The Neon Opry's leading man walked off in the middle of a number and kept walking. Lionel Fairweather needs a replacement for opening night — any replacement.",
      stages: [
        {
          id: "audition",
          text: "Audition for Lionel Fairweather at the Neon Opry.",
          markers: () => [npcM("neon_director", "Lionel Fairweather")],
        },
        {
          id: "wig",
          text: "Velvet Maloney's wig has been stolen. Find it before opening night.",
          markers: () =>
            L.flag("wig_thief_known")
              ? [npcM("neon_nicky", "Nicky Two-Thumbs")]
              : [npcM("neon_velvet", "Velvet Maloney")],
        },
        {
          id: "show",
          text: "Be on the Opry stage between 8 and 11 at night for opening night.",
          markers: () => {
            const s = stageSpot();
            return s ? [{ x: s.x, z: s.z, label: "The Opry Stage" }] : [];
          },
        },
      ],
      rewards: { xp: 350 },
    });
    L.quest({
      id: "sq_neon_guard",
      name: "Neon Nights",
      giver: "Captain Mercy Kincaid",
      location: "The Neon (Times Square)",
      desc: "Captain Kincaid of the Neon Guard is short on shooters. Three names on the Mayor's notice board, three bounties, and a promotion for whoever brings back proof.",
      stages: BOUNTIES.map((b, i) => [
        {
          id: b.stage,
          text: "Bounty " + (i + 1) + "/3: kill " + b.name + ".",
          markers: () => {
            const a = L.npc(b.id);
            if (a && !a.dead)
              return [{ x: a.pos.x, z: a.pos.z, label: b.name }];
            const p = bountyPos(b);
            return p ? [{ x: p.x, z: p.z, label: b.name }] : [];
          },
        },
        {
          id: "r" + (i + 1),
          text: "Report to Captain Kincaid at the north gate.",
          markers: () => [npcM("neon_capt", "Captain Kincaid")],
        },
      ]).flat(),
      rewards: { xp: 500 },
    });
    L.quest({
      id: "sq_neon_club",
      name: "Card Burners",
      giver: "Big Sal",
      location: "The Cinder Club",
      desc: "The Cinder Club is the most exclusive venue in the Neon: members only, and the members are the folks who burned their census cards in '67. Naturally, you want in.",
      stages: [
        {
          id: "in",
          text: "Get past Big Sal at the door of the Cinder Club.",
          markers: () => [npcM("neon_sal", "Big Sal")],
        },
        {
          id: "meet",
          text: "Catch Smiley Pete's act inside the Cinder Club.",
          markers: () =>
            clubInterior() ? [npcM("neon_smiley", "Smiley Pete")] : [],
        },
      ],
      rewards: { xp: 200 },
    });
    RUNS.forEach((r, i) =>
      L.quest({
        id: r.q,
        name:
          "The Neon Express" + (i ? " (" + ["I", "II", "III"][i] + ")" : ""),
        giver: "Eustace Byrd",
        location: "The Neon Depot",
        desc:
          "Eustace Byrd needs an escort for the Neon Express: " +
          r.cargo +
          ", bound for " +
          r.name +
          ". Raiders hit the Express about half the time. Eustace considers that good odds.",
        stages: [
          {
            id: "go",
            text: "Escort " + r.driver + " safely to " + r.name + ".",
            markers: () =>
              EXP.driver && !EXP.driver.dead
                ? [
                    {
                      x: EXP.driver.pos.x,
                      z: EXP.driver.pos.z,
                      label: r.driver,
                    },
                  ]
                : [npcM("neon_wagon", "Eustace Byrd")],
          },
        ],
        rewards: { xp: 150 + i * 50, scrip: r.pay, standing: r.standing || 0 },
      }),
    );
  });

  // ------------------------------------------------------------------
  // Jobs on the Mayor's notice board (48_ shows them)
  // ------------------------------------------------------------------
  L.neonJobs = function () {
    const J = [];
    const b =
      currentBounty() || (!Q.isStarted("sq_neon_guard") ? BOUNTIES[0] : null);
    J.push({
      title: "SHOOTERS WANTED — NEON GUARD",
      text: "The Neon Guard is hiring. Bounties posted weekly. Apply to Capt. M. Kincaid, north gate. Bring your own gun. Bring your own body bag.",
      cond: () => !Q.isStarted("sq_neon_guard"),
      act: () => {
        Q.start("sq_neon_guard");
        L.setFlag("neon_guard_member");
        spawnBounty(BOUNTIES[0]);
        L.notify("The first bounty is on the board: " + BOUNTIES[0].name + ".");
      },
    });
    if (b && Q.isActive("sq_neon_guard"))
      J.push({
        title: "WANTED: " + b.name.toUpperCase(),
        text: b.text,
        cond: () => true,
      });
    J.push({
      title: "BY ORDER OF THE MAYOR: THE BALL",
      text: 'A reward of 250 SCRIP to any citizen who repairs the winch of the Times Square Ball. See Mayor L. Crowe. "Make the Neon a city again!"',
      cond: () => !Q.isComplete("sq_neon_ball"),
      act: () => {
        if (!Q.isStarted("sq_neon_ball")) Q.start("sq_neon_ball");
      },
      done: () => Q.isStarted("sq_neon_ball"),
    });
    J.push({
      title: "HELP WANTED: POWER PLANT",
      text:
        "Night-shift hand wanted at the Big Buzz. Must not be afraid of the dark, electricity, or Sparks. " +
        (N().place("power")
          ? "Ask below the theatre."
          : "Ask at the breaker cabinet by the stage."),
      cond: () => !Q.isComplete("sq_neon_power"),
      act: () => {
        if (!Q.isStarted("sq_neon_power")) Q.start("sq_neon_power");
      },
      done: () => Q.isStarted("sq_neon_power"),
    });
    J.push({
      title: "CASTING CALL — THE NEON OPRY",
      text: "LEADING PLAYER wanted for the Neon Revue. Must sing, dance, or be willing to stand in the light. Topsiders considered (reluctantly). — L. Fairweather",
      cond: () => !Q.isComplete("sq_neon_opry"),
      act: () => {
        if (!Q.isStarted("sq_neon_opry")) Q.start("sq_neon_opry");
      },
      done: () => Q.isStarted("sq_neon_opry"),
    });
    J.push({
      title: "WAGON GUARDS — NEON EXPRESS",
      text: "Escorts wanted for the Neon Express. Good pay, fresh air, raiders. See E. Byrd at the Depot.",
      cond: () => RUNS.some((r) => !Q.isComplete(r.q)),
    });
    return J;
  };

  // ------------------------------------------------------------------
  // Dialogues
  // ------------------------------------------------------------------
