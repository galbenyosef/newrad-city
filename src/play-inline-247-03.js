// play-inline-247 03 — ren
// Lines 374-652 of readable/play-inline-247.pretty.js (statement-aligned).
  PR.purgeTanks = function () {
    PR.setFlag("ren_purged", true);
    for (const p of PR.tankPos || []) {
      try {
        if (PR.live("fx")) {
          G.fx.fire(p, 1.2);
          G.fx.flash(p, 0xff8030, 3, 0.6);
        }
      } catch (e) {
        /* optional */
      }
    }
    try {
      for (const s of G.world.radSources.slice())
        if (
          (PR.tankPos || []).some((p) => Math.hypot(p.x - s.x, p.z - s.z) < 0.5)
        )
          G.world.removeRadSource(s);
    } catch (e) {
      /* */
    }
    PR.sfx("explosion", PR.tankPos && PR.tankPos[1]);
    if (PR.q.active("pr_pox")) PR.q.set("pr_pox", "return");
    PR.standing(20, "Burned the Variola cultures");
    PR.news(
      "A little bird on Welfare Island tells me somebody went into that old smallpox ruin and burned out whatever the Army left in the basement. Folks, the island's one lighthouse keeper sends his thanks, and so do I. Sleep a little easier tonight, Manhattan.",
    );
  };

  // ===================================================================
  // QUESTS
  // ===================================================================
  const A = (poi, name) => PR.anchorOf(poi, name);
  /** Main-story flags live in the quests module (G.quests.flag); guarded. */
  const msFlag = (k, v) => {
    try {
      if (PR.live("quests") && G.quests.setFlag) G.quests.setFlag(k, v);
    } catch (e) {
      /* */
    }
  };
  const msDone = (id) => {
    try {
      return PR.live("quests") && !!G.quests.isComplete(id);
    } catch (e) {
      return false;
    }
  };
  const mk = (poi, name, label) => {
    const a = A(poi, name);
    return a ? [{ x: a.x, z: a.z, y: a.y, label, interior: a.x >= 2500 }] : [];
  };
  PR.quest({
    id: "pr_tendays",
    name: "Ten Days in the Madhouse",
    giver: "Old Mac",
    location: "Blackwell's Island",
    desc: "On 19 February 1967 a reporter named Nell Brady had herself committed to the Octagon asylum to find out what Project Long Winter really was. She hid three tape reels inside before the end. Old Mac, the island's lighthouse keeper, wants them on the air at last.",
    stages: [
      {
        id: "tapes",
        text: () =>
          "Find Nell Brady's tape reels inside the Octagon (" +
          tapeCount() +
          "/3). Mind Dr. Harrow on the stair.",
        onEnter: () => {
          if (tapeCount() >= 3) PR.q.set("pr_tendays", "beacon");
        },
        markers: () => {
          const out = [];
          const spots = [
            ["pr_reel_nell1", "ward_bed", "Tape One"],
            ["pr_reel_nell2", "lodge_tape", "Tape Two"],
            ["pr_reel_nell3", "treatment_tape", "Tape Three"],
          ];
          for (const [id, an, label] of spots)
            if (!(PR.inv.count(id) > 0 || PR.flag("tape_" + id)))
              out.push(...mk("roosevelt_octagon", an, label));
          return out;
        },
      },
      {
        id: "beacon",
        text: "Play Nell's recordings over the beacon transmitter at the lighthouse — or tell Old Mac you are keeping them.",
        markers: () =>
          mk("roosevelt_island", "transmitter", "Beacon Transmitter").concat([
            { npc: "pr_keeper", label: "Old Mac" },
          ]),
      },
      {
        id: "return",
        text: "Talk to Old Mac.",
        markers: () => [{ npc: "pr_keeper", label: "Old Mac" }],
      },
    ],
    rewards: {
      xp: 350,
      scrip: 120,
      standing: 25,
      items: [["pr_press_hat", 1]],
    },
  });
  PR.quest({
    id: "pr_pox",
    name: "The Pox House",
    giver: "Old Mac",
    location: "Renwick Smallpox Hospital",
    desc: 'Things "stitched out of other things" crawl out of the old Renwick smallpox ruin at night. Old Mac wants to know where they come from — and wants it stopped.',
    stages: [
      {
        id: "enter",
        text: "Get inside the Renwick Smallpox Hospital at the south end of the island.",
        markers: () =>
          mk(
            "smallpox_hospital",
            "exterior_entrance",
            "Renwick Smallpox Hospital",
          ),
      },
      // the gate is a key-only padlock (lock 100): until the player holds the key, also mark where it is (the senior nurse's locker)
      {
        id: "cellar",
        text: "Find a way into the quarantine cellar.",
        markers: () =>
          mk("smallpox_hospital", "cellar_gate", "Quarantine Cellar").concat(
            PR.inv.count("pr_ren_quarantine_key") > 0 ||
              PR.flag("ren_cellar_gate")
              ? []
              : mk(
                  "smallpox_hospital",
                  "nurse_locker",
                  "Nurses' Station (Cellar Key)",
                ),
          ),
      },
      {
        id: "lab",
        text: "Find the source of the stitched things.",
        markers: () => mk("smallpox_hospital", "lab", "Laboratory"),
      },
      {
        id: "prussian_blue",
        text: "Destroy the culture tanks from the laboratory teletype.",
        markers: () =>
          mk("smallpox_hospital", "lab_terminal", "Culture Control"),
      },
      {
        id: "return",
        text: "Tell Old Mac what you found.",
        markers: () => [{ npc: "pr_keeper", label: "Old Mac" }],
      },
    ],
    rewards: { xp: 400, scrip: 150 },
  });

  function onItem(id) {
    if (TAPES.indexOf(id) >= 0) {
      PR.setFlag("tape_" + id, true);
      if (!PR.q.started("pr_tendays"))
        PR.q.start("pr_tendays", { stage: "tapes" });
      if (
        PR.q.active("pr_tendays") &&
        PR.q.stage("pr_tendays") === "tapes" &&
        tapeCount() >= 3
      )
        PR.q.set("pr_tendays", "beacon");
      else {
        try {
          if (PR.live("quests") && G.quests.lib && G.quests.lib.refresh)
            G.quests.lib.refresh("pr_tendays");
        } catch (e) {
          /* */
        }
      }
    }
    if (id === "pr_ren_quarantine_key")
      PR.q.advance("pr_pox", ["enter"], "cellar");
    if (id === "pr_reel_variola" && !PR.q.started("pr_pox"))
      PR.q.start("pr_pox", { stage: "lab" });
  }
  G.events.on("itemAdded", (id) => PR.safe("itemAdded", () => onItem(id)));

  // area triggers: entering Renwick, reaching the lab
  PR.onInitDone.push(() => {
    const ren =
      G.LAYOUT.INTERIORS.smallpox_hospital &&
      G.LAYOUT.INTERIORS.smallpox_hospital.origin;
    if (ren) {
      PR.trigger(
        { x0: ren.x - 30, x1: ren.x + 30, z0: ren.z - 30, z1: ren.z + 30 },
        () => PR.q.advance("pr_pox", ["enter"], "cellar"),
        {
          repeat: true,
          cond: () => PR.q.active("pr_pox") && PR.q.stage("pr_pox") === "enter",
        },
      );
      PR.trigger(
        {
          x0: ren.x - 8,
          x1: ren.x + 8,
          z0: ren.z - 18,
          z1: ren.z - 6.5,
          y0: 0,
          y1: 4.5,
        },
        () => PR.q.advance("pr_pox", ["enter", "cellar", "lab"], "purge"),
        {
          repeat: true,
          cond: () => PR.q.active("pr_pox") && !PR.flag("ren_purged"),
        },
      );
      PR.trigger(
        {
          x0: ren.x - 8,
          x1: ren.x + 8,
          z0: ren.z - 18,
          z1: ren.z + 18,
          y0: 0,
          y1: 4.5,
        },
        () => PR.q.advance("pr_pox", ["enter", "cellar"], "lab"),
        { repeat: true, cond: () => PR.q.active("pr_pox") },
      );
    }
  });
  // "Find a way into the quarantine cellar": unlocking/opening its gate (Nurse Pell's key) is that way in.
  PR.flagWatch.push((k) => {
    if (k === "ren_cellar_gate" && PR.flag("ren_cellar_gate"))
      PR.q.advance("pr_pox", ["enter", "cellar"], "lab");
  });

  // ===================================================================
  // THE BEACON TRANSMITTER (quest hook at the Keeper's camp)
  // ===================================================================
  PR.onInitDone.push(() => {
    const pos = PR.transmitterPos;
    if (!pos) return;
    PR.use({
      pos,
      radius: 0.9,
      range: 2.8,
      label: "Beacon Transmitter",
      verb: () =>
        PR.q.active("pr_tendays") && PR.q.stage("pr_tendays") === "beacon"
          ? "Broadcast Tapes"
          : "Use",
      onInteract() {
        if (
          PR.q.active("pr_tendays") &&
          PR.q.stage("pr_tendays") === "beacon" &&
          tapeCount() >= 3
        ) {
          PR.sfx("terminal_enter", pos);
          G.notify(
            "You thread Nell Brady's tapes into Mac's rig. The lighthouse lamp dims as the transmitter draws power...",
            { duration: 6 },
          );
          PR.setFlag("tapes_aired", true);
          msFlag("ms_nell", "broadcast");
          PR.news(
            'Folks, something unusual tonight. A signal out of Welfare Island, of all places: a reporter named Nell Brady, recorded twenty-two years ago inside the old Octagon asylum. Civil Defense, sedatives, a man who counted. And one more thing, on her last tape, the Saturday night before the Bombing: a Civil Defense man on the telephone saying "tomorrow." Somebody knew, Manhattan. Somebody knew a day early and moved their paperwork instead of us. I\'m going to play all three tapes, start to finish. She asked for it to be put on the air. Seems the least we can do.',
          );
          PR.q.set("pr_tendays", "return");
          PR.say(
            "pr_keeper",
            "Twenty-two years. You hear that, Nellie? You're on the air.",
            6,
          );
          return;
        }
        PR.sfx("ui_error", pos);
        G.notify("Static. The rig hums, waiting for something worth saying.");
      },
    });
  });

  // ===================================================================
  // OLD MAC — the Light Keeper
  // ===================================================================
