// play-inline-195 07 — the
// Lines 2449-2790 of readable/play-inline-195.pretty.js (statement-aligned).
  function data(ctx) {
    K.defineItem({
      id: "pv_key_tombs_cells",
      type: "key",
      name: "Block C Key Ring",
      weight: 0,
      value: 0,
      desc: 'A ring of heavy brass keys stamped "BLOCK C". Maddox wore it like a medal.',
    });
    K.defineItem({
      id: "pv_key_tombs_padlock",
      type: "key",
      name: "Courts Padlock Key",
      weight: 0,
      value: 0,
      desc: "A small steel key on a bootlace. The gatekeepers lock the Criminal Courts side door with it.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pv_jailbreak",
        name: "Jailbreak",
        giver: "Carmen Medina",
        location: "The Tombs",
        desc: 'Raiders under a self-appointed "Warden Maddox" hold three prisoners in Block C of the Tombs, waiting to be sold to Gallowglass slavers.',
        stages: [
          {
            id: "free",
            text: "Free the prisoners held in Block C of the Tombs.",
            markers: [
              () => {
                const a = PV.anchor("tombs", "blockc");
                return a ? { x: a.x, z: a.z, y: a.y, label: "Block C" } : null;
              },
            ],
          },
          {
            id: "jb_ctrl",
            text: "(Optional) Open Block C from the control-room teletype (the raiders use a passcode).",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.stage("pv_jailbreak") === "free",
            doneIf: () => false,
          },
          {
            id: "jb_key",
            text: "(Optional) Take the Block C key from Warden Maddox.",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.stage("pv_jailbreak") === "free",
            doneIf: () => K.has("pv_key_tombs_cells"),
          },
          {
            id: "sold",
            text: "You sold the prisoners to the Gallowglass slavers.",
            hidden: false,
          },
        ],
        rewards: { xp: 300 },
      });
    }
    // cell door interactables
    for (const d of cellDoors) {
      const p = ctx.anchors["celldoor" + d.cell];
      G.world.addInteractable({
        pos: p,
        radius: 0.9,
        label: "Block C Cell Door",
        verb: "Open",
        priority: 2,
        locked: () => (d.open || K.has("pv_key_tombs_cells") ? null : "Locked"),
        enabled: () => !d.open && !PV.flag("tombs_prisoners"),
        onInteract() {
          if (!K.has("pv_key_tombs_cells") && !K.lockIsOpen(LK.blockc.id)) {
            K.sfx("door_locked");
            K.notify(
              "Locked. The key ring is with Maddox — or try the control room upstairs.",
            );
            return;
          }
          K.lockOpen(LK.blockc, () => releasePrisoners("key"));
        },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("pv_dlg_rosa", {
      start: () => (PV.flag("tombs_prisoners") === "freed" ? "free" : "caged"),
      nodes: {
        caged: {
          speaker: "Carmen Medina",
          onEnter: () => K.q.start("pv_jailbreak"),
          text: "Hey — HEY. You're not one of Maddox's. Please. They're selling us to the Gallowglass slavers when the runner comes. Maddox has the key ring. Or the control room — upstairs, second tier — can pop every door in Block C.",
          responses: [
            { text: "I'll get you out.", next: "promise" },
            { text: "Why are you here?", next: "why" },
            { text: "What's in it for me?", next: "pay" },
            { text: "Goodbye.", end: true },
          ],
        },
        why: {
          speaker: "Carmen Medina",
          text: "I sing at the Vanguard. Sang. Maddox came in for a drink and didn't like the song. Ike was guarding a trade wagon they hit. Elias... Elias was just old and slow. That's a crime now, apparently.",
          responses: [
            { text: "I'll get you out.", next: "promise" },
            { text: "Goodbye.", end: true },
          ],
        },
        pay: {
          speaker: "Carmen Medina",
          text: "Scrip? I've got a voice and a bar tab. Mags at the Vanguard will stand you drinks forever. That's the best I can do from in here.",
          responses: [
            { text: "Sit tight.", next: "promise" },
            { text: "Not my problem.", end: true, standing: -5 },
          ],
        },
        promise: {
          speaker: "Carmen Medina",
          text: "Hurry. And if you get to Maddox's office — he keeps a painting up there he stole from the Chelsea. Some painter lady's been crying over it for a year.",
          responses: [{ text: "Hang on.", end: true }],
        },
        free: {
          speaker: "Carmen Medina",
          text: "We're out! We're heading for the Vanguard. First song's for you.",
          responses: [{ text: "Go. Stay safe.", end: true }],
        },
      },
    });
    G.dialogue.register("pv_dlg_sam", {
      start: () => (PV.flag("met_sam") ? "again" : "hello"),
      nodes: {
        hello: {
          speaker: "Solitary Sam",
          onEnter: () => PV.setFlag("met_sam", true),
          text: "Shh. Shh. Don't open the door. I'm serving my time. Inmate 44-117, thirty days in the Hole for fighting in the yard. That was March 1967. By my count I have... six days left.",
          responses: [
            { text: "Sam, it's been twenty-two years.", next: "years" },
            { text: "What do you know about Maddox?", next: "maddox" },
            { text: "Goodbye.", end: true },
          ],
        },
        years: {
          speaker: "Solitary Sam",
          text: "That's what the raiders say too. But nobody signed my release. You don't just WALK out of the Hole. There's paperwork. Six more days. I'm a model prisoner.",
          responses: [{ text: "Fair enough.", next: "hello" }],
        },
        maddox: {
          speaker: "Solitary Sam",
          text: "The \"Warden.\" Hah. Real warden kept his safe combination on a sticky note. This one's worse: he TELLS people. One-two, seven, six-seven. Twelve-seven-sixty-seven. Never forgets it because it's his birthday. Tell him Sam says hello.",
          learn: LK.wsafe.id,
          responses: [
            {
              text: "(Remember the combination.)",
              learn: LK.wsafe.id,
              action: () => K.learn(LK.wsafe.id),
              end: true,
            },
          ],
        },
        again: {
          speaker: "Solitary Sam",
          text: "Five days left. Or six. The light doesn't change down here. Don't let the door hit you.",
          responses: [{ text: "Goodbye, Sam.", end: true }],
        },
      },
    });
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    // doors reflect saved state
    for (const d of cellDoors) {
      if (PV.flag("tombs_prisoners") === "freed") openDoor(d, true);
      else closeDoor(d);
    }
    if (PV.flag("tombs_courts_open")) K.lockUnlock(LK.courts.id);
    // the portrait on Maddox's desk (Chelsea quest)
    if (
      !PV.flag("portrait") &&
      !K.has("pv_q_portrait") &&
      !K.q.done("pv_last_portrait")
    ) {
      K.safe("portrait", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("pv_q_portrait", 1, v(A.portrait), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    }
    // prisoners (only while still caged)
    if (!PV.flag("tombs_prisoners")) {
      for (const p of PRISONERS) {
        PV.spawnActor(ctx, {
          id: p.id,
          type: "human",
          gender: p.gender,
          outfit: p.outfit,
          name: p.name,
          faction: "settlers",
          level: 3,
          essential: true,
          hostile: false,
          pos: v(A["prison" + p.cell]),
          yaw: -HP,
          ai: "static",
          home: "here",
          homeR: 0.5,
          dialogue: p.id === "pv_prisoner_rosa" ? "pv_dlg_rosa" : undefined,
          barks: [
            "Psst! Over here!",
            "Please... get us out.",
            "Maddox has the keys.",
          ],
        });
      }
    } else if (PV.flag("tombs_prisoners") === "freed") {
      moveFreedToVanguard(ctx);
    }
    // the warden and his crew
    if (!PV.flag("maddox_dead")) {
      PV.spawnActor(ctx, {
        id: "pv_tombs_maddox",
        type: "raider",
        outfit: "raider_heavy",
        name: "Warden Maddox",
        faction: "raiders",
        level: 9,
        hostile: true,
        hp: 280,
        dr: 16,
        aggroRange: 28,
        xp: 150,
        pos: v(A.boss),
        yaw: 0,
        ai: "guard",
        home: "here",
        homeR: 5,
        noRespawn: true,
        weapon: K.itemExists("combat_shotgun") ? "combat_shotgun" : undefined,
        inventory: K.stock([
          ["pv_key_tombs_cells", 1],
          ["ammo_12ga", 16],
          ["rally_tonic", 2],
          ["rush", 1],
        ]),
        loot: "raider_boss",
        barks: [
          "Visiting hours are OVER!",
          "You're gonna love the Hole!",
          "Nobody escapes the Tombs!",
        ],
        onDeath: () => PV.setFlag("maddox_dead", true),
      });
    }
    const crew = [
      ["pv_tombs_r1", A.raider1, "hunting_rifle"],
      ["pv_tombs_r2", A.raider2, "hunting_rifle"],
      ["pv_tombs_r3", A.raider3, "lead_pipe"],
      ["pv_tombs_r4", A.raider4, "smg_10mm"],
    ];
    // round 1b: one of the crew walks a beat between the mess hall and Block C (a guard patrol), the rest hold posts
    const O = ctx.O,
      beat = [
        [3, -50],
        [0, -47],
        [0, -41],
        [1, -31],
        [0, -41],
        [0, -47],
      ].map((q) => ({ x: O.x + q[0], z: O.z + q[1] }));
    for (const [id, p, w] of crew)
      PV.spawnActor(
        ctx,
        Object.assign(
          {
            id,
            type: "raider",
            faction: "raiders",
            level: 6,
            hostile: true,
            pos: v(p),
            ai: "guard",
            home: "here",
            homeR: 4,
            noRespawn: true,
            weapon: K.itemExists(w) ? w : undefined,
            loot: "raider",
          },
          id === "pv_tombs_r3" ? { ai: "patrol", patrol: beat, homeR: 12 } : {},
        ),
      );
    for (const [id, p] of [
      ["pv_tombs_s1", A.sentry1],
      ["pv_tombs_s2", A.sentry2],
    ])
      PV.spawnActor(ctx, {
        id,
        type: "raider",
        faction: "raiders",
        level: 5,
        hostile: true,
        pos: v(p),
        ai: "guard",
        home: "here",
        homeR: 3,
        noRespawn: true,
        weapon: K.itemExists("smg_10mm") ? "smg_10mm" : undefined,
        loot: "raider",
        name: "Tombs Gatekeeper",
        inventory:
          id === "pv_tombs_s1"
            ? K.stock([["pv_key_tombs_padlock", 1]])
            : undefined,
      });
    // Solitary Sam
    PV.spawnActor(ctx, {
      id: "pv_tombs_sam",
      type: "human",
      gender: "m",
      outfit: "survivor_layers",
      name: "Solitary Sam",
      faction: "settlers",
      level: 5,
      essential: true,
      hostile: false,
      pos: v(A.sam),
      yaw: -HP,
      ai: "static",
      home: "here",
      homeR: 0.5,
      dialogue: "pv_dlg_sam",
      voice: "settler",
      barks: ["Six days...", "Model prisoner. Model prisoner."],
    });
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  /**
   * Freed prisoners make their way to the Vanguard: once the player has left the Tombs (or on load) the Block C actors
   * are replaced by their settler selves in the Vanguard yard (stable ids *_vv), so Carmen can be found there in the same
   * session — before round 2 they only moved after a save/load and otherwise loitered at the Tombs' intake forever.
   */
