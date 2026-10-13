// play-inline-256 05 — flag
// Lines 1373-1633 of readable/play-inline-256.pretty.js (statement-aligned).
  function powerOn(how) {
    if (PF.flag("bm_power")) return;
    PF.setFlag("bm_power", true);
    PF.sfx("hum_electric", PF.anchorOf("queensboro_bridge", "generator"), {
      volume: 0.9,
    });
    PF.sfx("terminal_success");
    G.notify(
      "The turbine groans, catches the tide, and spins up. Somewhere overhead, a whole market cheers.",
    );
    PF.xp(how === "fuse" ? 150 : 200, "Restarted the tidal generator");
    if (!PF.q.started("pbr_current")) PF.q.start("pbr_current");
    PF.q.set("pbr_current", "report");
    applyPower();
  }
  PF.quest({
    id: "pbr_current",
    name: "Current Events",
    giver: "Ruth Adebayo",
    location: "Queensboro Bridge & Bridgemarket",
    desc: "The tidal generator under the Queensboro Bridge powers the Bridgemarket's lights and pumps. It has stopped, and the engineer sent to fix it never came back.",
    stages: [
      {
        id: "talk",
        text: "Talk to Mayor Ruth Adebayo in the Bridgemarket.",
        markers: () => [{ x: 316, z: -422, label: "Bridgemarket" }],
      },
      {
        id: "works",
        text: "Go down to the Pier Works beneath the Bridgemarket.",
        markers: () => {
          const a = PF.anchorOf(KEY, "stair_top");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Pier Works stair",
                  interior: KEY,
                },
              ]
            : [];
        },
      },
      {
        id: "dutch",
        text: "(Optional) Find out what happened to Dutch Varga.",
        optional: true,
        sideObjective: true,
        doneIf: () =>
          PF.inv.count("pbr_reel_dutch") > 0 || !!PF.flag("bm_dutch"),
        markers: () => {
          const a = PF.anchorOf(KEY, "dutch");
          return a
            ? [{ x: a.x, z: a.z, y: a.y, label: "Dutch Varga", interior: KEY }]
            : [];
        },
      },
      {
        id: "fix",
        text: "Restart the tidal generator in the Pier Works.",
        markers: () => {
          const a = PF.anchorOf(KEY, "generator");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Tidal Governor",
                  interior: KEY,
                },
              ]
            : [];
        },
      },
      {
        id: "report",
        text: "Return to Ruth Adebayo.",
        markers: () => [{ npc: "pbr_bm_ruth", label: "Ruth Adebayo" }],
      },
    ],
    rewards: { xp: 350, scrip: 150, standing: 15 },
  });

  // --- merchants & residents ---
  PF.dialogue("pbr_dlg_sol", {
    start: "root",
    nodes: {
      root: {
        speaker: "Morty Weintraub",
        text: () =>
          PF.flag("bm_power")
            ? "Lights! Real lights! I can finally see how bad my merchandise looks. What'll it be?"
            : "Morty's Sundries: if I don't have it, you don't need it, and if you need it, I'll find it by Tuesday. What'll it be?",
        responses: [
          { text: "Let's trade.", barter: true },
          { text: "How long have you been down here?", next: "bridge" },
          { text: "See you, Morty." },
        ],
      },
      bridge: {
        speaker: "Morty Weintraub",
        text: "Since March 5th, 1967, 9:47 in the morning. I was in a Strato-Eight on the upper level of this bridge, doing four miles an hour toward Queens, when the sky went white. Traffic hasn't moved since. Twenty-two years in the same jam — I'm told that's a record even for the Queensboro. When the radiator boiled dry I figured I'd walk the rest of the way. Got as far as down here.",
        responses: [{ text: "That's... one way to commute.", next: "root" }],
      },
    },
  });
  PF.dialogue("pbr_dlg_hattie", {
    start: "root",
    nodes: {
      root: {
        speaker: "Doc Hattie Lin",
        text: () =>
          PF.flag("bm_heal_free")
            ? "My favourite patient. Sit, sit. It's on the house — Ruth's orders, and honestly, mine."
            : "Doc Hattie. I stitch, I splint, I pull bullets and I never ask how they got there. What hurts?",
        responses: [
          {
            text: () =>
              PF.flag("bm_heal_free")
                ? "Patch me up. (Free)"
                : "Patch me up. (40 scrip)",
            action: () => doctor("heal"),
          },
          {
            text: () =>
              PF.flag("bm_heal_free")
                ? "Flush the radiation. (Free)"
                : "Flush the radiation. (80 scrip)",
            action: () => doctor("rads"),
          },
          { text: "I need supplies.", barter: true },
          { text: "Nothing, thanks." },
        ],
      },
    },
  });
  function doctor(what) {
    const cost = PF.flag("bm_heal_free") ? 0 : what === "heal" ? 40 : 80;
    if (cost && !PF.inv.pay(cost)) {
      G.notify("You can't afford that.");
      return;
    }
    const P = G.player;
    if (!P) return;
    if (what === "heal") {
      try {
        P.heal(P.maxHp);
      } catch (e) {
        /* core */
      }
      PF.sfx("inject");
      G.notify("Doc Hattie patches you up. HP restored.");
    } else {
      try {
        if (P.rads > 0) P.addRads(-P.rads);
      } catch (e) {
        /* core */
      }
      PF.sfx("iodine_tabs");
      G.notify(
        "Doc Hattie doses you with Prussian Blue and a lecture. Radiation removed.",
      );
    }
  }
  PF.dialogue("pbr_dlg_benny", {
    start: "root",
    nodes: {
      root: {
        speaker: 'Lou "Two-Tone" Mazur',
        text: () =>
          PF.flag("bm_power")
            ? 'Welcome to The Span! Cold beer, warm cakes, lukewarm conversation. The cooler\'s humming again, so the beer is officially "cold-adjacent".'
            : "Welcome to The Span. Beer's warm, cakes are cold, generator's dead. I'm doing my best here.",
        responses: [
          { text: "What's on the menu?", barter: true },
          { text: "Heard any rumours?", next: "rumour" },
          { text: 'Why "Two-Tone"?', next: "name" },
          { text: "Later, Lou." },
        ],
      },
      rumour: {
        speaker: 'Lou "Two-Tone" Mazur',
        text: "The Canal Street trade wagon — Tomas Ybarra and his guards — never showed. Last anybody saw, they were crossing under the Manhattan Bridge arch. And you know what's in the Manhattan Bridge anchorage? Brutes. Big ones. They pack people away in there like canned hams. Tomas owes me forty scrip, so I'd really prefer he wasn't a ham.",
        onEnter() {
          if (!PF.q.started("pbr_anchor") && !PF.q.complete("pbr_anchor"))
            PF.q.start("pbr_anchor");
        },
        responses: [
          { text: "I'll check the anchorage.", next: "root" },
          { text: "Not my business.", next: "root" },
        ],
      },
      name: {
        speaker: 'Lou "Two-Tone" Mazur',
        text: "[He props a foot on the rail: a brown-and-white wing-tip spectator, polished to a mirror.] Florsheim, 1966. Twenty-two years and not a scuff. A man can lose his city, his car and his hair, but he does not lose his standards.",
        responses: [{ text: "Sharp shoes.", next: "root" }],
      },
    },
  });
  PF.dialogue("pbr_dlg_kowalski", {
    start: "root",
    nodes: {
      root: {
        speaker: "Wanda Kowalski",
        text: "Kowalski's. Guns, ammo, and the only returns policy on the bridge: if it jams, I shoot you with a better one. What are we buying?",
        responses: [
          { text: "Show me your guns.", barter: true },
          { text: "Who keeps the peace here?", next: "peace" },
          { text: "Just looking." },
        ],
      },
      peace: {
        speaker: "Wanda Kowalski",
        text: 'Moss and his watchmen, the ramp sentries, and me — I settle "disputes". Ruth writes the rules, I underline them. You\'ll notice nobody has broken a rule in a while.',
        responses: [{ text: "Noted.", next: "root" }],
      },
    },
  });
  PF.dialogue("pbr_dlg_guard", {
    start: "root",
    nodes: {
      root: {
        speaker: "Moss, Bridgemarket Watch",
        text: () =>
          PF.flag("bm_power")
            ? "Power's back, crabs are dead, and I finally got a full night's sleep. You're all right, stranger."
            : "Stairs go down to the Pier Works. Nobody goes down since Dutch. You hear the clicking? That's not the pipes.",
        responses: [
          {
            text: "Ruth sent me.",
            cond: () => PF.q.active("pbr_current") && !PF.flag("bm_power"),
            next: "sent",
          },
          { text: "Stay safe." },
        ],
      },
      sent: {
        speaker: "Moss, Bridgemarket Watch",
        text: "Then go with God, and with a shotgun if you've got one. The pump hall floods up to the ankles, and the cistern at the west end is where the eggs are. Don't go in the cistern.",
        responses: [{ text: "Thanks." }],
      },
    },
  });

  const powerGlows = [];
  function applyPower() {
    const pow = !!PF.flag("bm_power");
    for (const rec of powerGlows)
      if (rec && rec.sprite) rec.sprite.visible = pow;
  }
  PF.flagWatch.push((k) => {
    if (k === "*" || k === "bm_power") applyPower();
  });
  PF.onReset.push(() => applyPower());

  // ===================================================================
  // BUILDER
  // ===================================================================
