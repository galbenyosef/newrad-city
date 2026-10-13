// play-inline-208 08 — responses
// Lines 3485-3832 of readable/play-inline-208.pretty.js (statement-aligned).
  const SP_LOCKS = (PF.spLocks = {
    captain: PF.regLock({
      id: "pf_lk_sp_captain_safe",
      label: "Captain's Safe (PEKING)",
      code: "5558",
      kind: "safe",
      hint: "Pencilled at Cape Horn on the chart in the captain's saloon.",
    }),
  });
  PF.item({
    id: "pf_reel_cal",
    type: "tape",
    name: "Tape reel: Cal Brennan",
    title: "Cal Brennan — Salvage Log",
    text: "[Water dripping. Heavy breathing.]\n\nCAL: Lot, if you get this — the hold's not full of nitrate. It's full of eggs. Hundreds. The big one sleeps on them like a hen. Mick and Dash are... Mick and Dash are gone.\n\n[Clicking, very close.]\n\nCAL: I'm wedged behind the ballast. It can't reach me. It's just waiting. Burn the nest, Lot. Burn the whole damned hold. And sell the captain's safe — the combination's pencilled on his chart, by the Horn, under the coffee stain. Love you, kid. Tell Nan I'm sorry about the omelette.\n\n[Recording ends.]",
  });
  PF.item({
    id: "pf_note_captain",
    type: "note",
    name: "Captain's Log — PEKING",
    title: "Log of the Barque PEKING — Museum Ship, South St.",
    text: 'Mar 4, 1967. Museum closed for the "civil defense drill." Volunteers sent home. I stayed aboard; a ship should never be left unwatched.\n\nMar 5, Sunday. The sky to the north, over the Bronx, turned white. The ship rolled like she was rounding the Horn again. Every mast held. Magnificent girl.\n\nMar 12. The river is warm and wrong. Things are coming up out of it.\n\n[Much later, shakier hand.] They have taken the hold. I have taken the saloon. We have an arrangement. I will not go down, and they will not come up. The safe combination is written where a sailor would look: the Horn.',
  });
  PF.item({
    id: "pf_old_salt",
    build() {
      const base = PF.live("items") ? G.items.get("sawed_off_shotgun") : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 8) * 1.35),
              critChance: 1.5,
              spread: (base.weapon.spread || 0.1) * 0.8,
              condDecay: (base.weapon.condDecay || 0.003) * 0.6,
            })
          : undefined;
      return {
        id: "pf_old_salt",
        type: w ? "weapon" : "misc",
        name: "Old Salt",
        weight: 4,
        value: 850,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: "The Peking captain's sawed-off, its stock carved with the names of every port she ever made. Tighter spread, harder hits — and shellbacks seem to hate it personally.",
        weapon: w,
      };
    },
  });

  // --- dialogue: Lottie Brennan ---
  PF.dialogue("pf_dlg_lottie", {
    start: () => {
      if (PF.q.active("pf_deep") && PF.q.stage("pf_deep") === "report")
        return "report";
      if (PF.q.complete("pf_deep")) return "after";
      return PF.flag("sp_met") ? "again" : "first";
    },
    nodes: {
      first: {
        text: "Easy with that thing. I'm Lottie Brennan — Brennan Salvage, what's left of it. Me and my brother Cal and three idiots took a job clearing the Peking for scrap. The shellbacks had other plans. I ran. Cal didn't make it out of the hold. I've been sitting behind this door for four days listening to them click.",
        onEnter() {
          PF.setFlag("sp_met", true);
          if (!PF.q.started("pf_deep"))
            PF.q.start("pf_deep", { stage: "talk" });
        },
        responses: [
          {
            text: "I'll go aboard and look for Cal.",
            action: () => PF.q.advance("pf_deep", ["find", "talk"], "ship"),
            next: "go",
          },
          { text: "What's in it for me?", next: "pay" },
          {
            text: "[Medicine 30] You're bleeding. Let me see that arm.",
            check: { skill: "medicine", value: 30 },
            next: "arm",
            failNext: "arm_fail",
            cond: () => !PF.flag("sp_arm"),
          },
          { text: "Not my problem." },
        ],
      },
      pay: {
        text: "Two hundred scrip — the job's whole advance. And there's a safe in the captain's saloon, aft. Cal said he'd found the combination. Whatever's in it, it's yours. Just... bring him back to me. Or what's left.",
        responses: [
          {
            text: "Deal.",
            action: () => PF.q.advance("pf_deep", ["find", "talk"], "ship"),
            next: "go",
          },
          { text: "I'll think about it." },
        ],
      },
      arm: {
        text: "Ow — careful — okay. That's... that's actually better. You're handy. [She flexes her fingers.] Here, take these. I'm not going anywhere with one working arm anyway.",
        onEnter() {
          PF.setFlag("sp_arm", true);
          PF.inv.add("ammo_12ga", 12);
          PF.xp(40, "Treated Lottie");
        },
        responses: [
          {
            text: "I'll find your brother.",
            action: () => PF.q.advance("pf_deep", ["find", "talk"], "ship"),
            next: "go",
          },
        ],
      },
      arm_fail: {
        text: "Ow! No — stop — I'll live. Probably. Just... go find Cal.",
        responses: [
          {
            text: "Right.",
            action: () => PF.q.advance("pf_deep", ["find", "talk"], "ship"),
            next: "go",
          },
        ],
      },
      go: {
        text: "Board from Pier 16 — the gangway's still up. Fore hatch takes you below. The middle of the 'tween deck caved in; you'll have to go down into the hold to get aft. That's where the nest is. That's where the big one sleeps. Burn it all if you can.",
        responses: [{ text: "I'll be back." }],
      },
      again: {
        text: () =>
          PF.flag("sp_nest")
            ? "The clicking stopped. I heard it stop. Is it — tell me."
            : "Still here. Still listening to them click. Find Cal. Please.",
        responses: [{ text: "Working on it." }],
      },
      report: {
        text: () =>
          PF.flag("sp_cal")
            ? "You found him. [She takes the tape reel and holds it for a long time without playing it.] Four days behind a pile of ballast. He waited for me. Stubborn as our dad."
            : "The nest is gone? Really gone? And Cal... you didn't find him. That means he's still down there somewhere. Or it means nothing. I'll look. Later.",
        responses: [
          {
            text: "I'm sorry, Lottie.",
            action: () => finishDeep(),
            next: "thanks",
          },
          {
            text: "[Persuasion 50] Cal's money doesn't change hands for free. Make it three hundred.",
            check: { skill: "persuasion", value: 50 },
            action: () => {
              PF.inv.addScrip(100);
              finishDeep();
              PF.standing(-10, "Haggled with a grieving sister");
            },
            next: "thanks_cold",
            failNext: "thanks",
          },
        ],
      },
      thanks: {
        text: "I'm going to reopen the market. Brennan Salvage & Fish. Cal always wanted a shop that didn't move. Come by — I'll trade fair. For you, fairer.",
        responses: [{ text: "I will." }],
      },
      thanks_cold: {
        text: "Fine. Take it. [She counts the scrip into your hand one by one.] Market reopens tomorrow. Your prices will be... standard.",
        responses: [{ text: "Business is business." }],
      },
      after: {
        text: "Brennan Salvage & Fish. Open for business, rain or crabs. What do you need?",
        responses: [
          { text: "Let's trade.", barter: true },
          { text: "How's the market?", next: "market" },
          { text: "Take care, Lottie." },
        ],
      },
      market: {
        text: "Folks from Fraunces come down for fish again. Nan buys every egg I find. Somebody even fixed the lamp on the Ambrose — you can see it from the bridge at night. It's almost like a port again.",
        responses: [{ text: "Glad to hear it." }],
      },
    },
  });
  function finishDeep() {
    PF.inv.remove("pf_reel_cal", 1);
    PF.setFlag("sp_market", true);
    PF.q.done("pf_deep");
    PF.news(
      "Good news from the South Street Seaport: the fish market is open again, under new management. Brennan Salvage & Fish — the only shop in town where the merchandise used to try to eat you.",
    );
    // Lottie heads down to her new stall
    const a = PF.getNpc("pf_sp_lottie"),
      st = PF.anchorOf("seaport", "lottie_stall");
    if (a && st && a.moveTo) {
      try {
        a.home = { x: st.x, z: st.z, r: 2 };
        a.moveTo(st.x, st.z);
      } catch (e) {
        /* ignore */
      }
    }
  }

  // --- dialogue: the hatchery (actor-less) ---
  PF.dialogue("pf_dlg_nest", {
    start: "root",
    nodes: {
      root: {
        speaker: "Shellback Hatchery",
        text: () =>
          PF.flag("sp_harvest")
            ? "The mounds are picked over now. What's left is pulsing, warm and very much alive."
            : "Mounds of river mud crusted with shell, and dozens of leathery eggs the size of footballs, each one glowing faintly green. Something inside the nearest one twitches.",
        responses: [
          {
            text: "Harvest some eggs first. (6 Shellback Eggs)",
            cond: () => !PF.flag("sp_harvest"),
            action: () => {
              PF.setFlag("sp_harvest", true);
              PF.inv.add("pf_shellback_egg", 6);
              PF.sfx("pickup");
            },
            next: "root",
          },
          {
            text: "Smash every egg and burn the nest.",
            action: () => destroyNest(),
            next: null,
          },
          { text: "Leave it." },
        ],
      },
    },
  });
  function destroyNest() {
    if (PF.flag("sp_nest")) return;
    PF.setFlag("sp_nest", true);
    PF.sfx("melee_hit");
    PF.sfx("shellback_click", null, { volume: 0.9, pitch: 1.4 });
    try {
      if (PF.live("fx")) {
        const a = PF.anchorOf("seaport", "nest");
        if (a) {
          G.fx.fire(a.clone().setY(a.y + 0.4), 1.2);
          G.fx.flash(a.clone().setY(a.y + 1), 0x90ff40, 3, 0.6);
        }
      }
    } catch (e) {
      /* optional */
    }
    G.notify(
      "You stamp, smash and burn the hatchery. The clicking in the dark goes very quiet.",
    );
    PF.xp(200, "Destroyed the Peking hatchery");
    PF.standing(15, "Destroyed a shellback hatchery");
    PF.q.advance("pf_deep", ["find", "talk", "ship", "nest"], "report");
    // a last brood of hatchlings bursts out
    const n = PF.anchorOf("seaport", "nest");
    if (n && PF.live("actors"))
      for (let i = 0; i < 3; i++)
        PF.safe("hatch", () => {
          const a = G.actors.spawn({
            type: "shellback",
            name: "Shellback Hatchling",
            faction: "creatures",
            level: 2,
            pos: { x: n.x + (i - 1) * 1.6, y: n.y + 0.2, z: n.z + 1.5 },
            hp: 18,
            ai: "wander",
            noRespawn: true,
          });
          if (a && a.char && a.char.root) a.char.root.scale.setScalar(0.45);
        });
  }
  PF.spDestroyNest = destroyNest;

  PF.quest({
    id: "pf_deep",
    name: "Low Tide",
    giver: "Lottie Brennan",
    location: "South Street Seaport",
    desc: "Lottie Brennan's salvage crew went into the hold of the tall ship Peking at the South Street Seaport. The shellbacks got them. Her brother Cal never came out.",
    stages: [
      {
        id: "find",
        text: "Find Lottie Brennan in the Fulton Fish Market at the South Street Seaport.",
        markers: () => {
          const a = PF.anchorOf("seaport", "exterior_entrance");
          return [
            {
              x: a ? a.x : 204,
              z: a ? a.z + 1 : 712,
              label: "Fulton Fish Market",
            },
          ];
        },
      },
      {
        id: "talk",
        text: "Talk to Lottie Brennan.",
        markers: () => [{ npc: "pf_sp_lottie", label: "Lottie Brennan" }],
      },
      {
        id: "ship",
        text: "Board the Peking from Pier 16 and search the hold for Cal.",
        markers: () => {
          const g = PF.anchorOf("seaport", "gangway");
          return [
            {
              x: g ? g.x : 300,
              z: g ? g.z : 729,
              label: "The Peking — Gangway",
            },
          ];
        },
      },
      {
        id: "sp_cal",
        text: "(Optional) Find out what happened to Cal Brennan.",
        sideObjective: true,
        optional: true,
        doneIf: () => !!PF.flag("sp_cal"),
        markers: () => {
          const a = PF.anchorOf("seaport", "cal");
          return a && !PF.flag("sp_cal")
            ? [{ x: a.x, z: a.z, y: a.y, label: "Cal", interior: "seaport" }]
            : [];
        },
      },
      {
        id: "nest",
        text: "Destroy the shellback hatchery in the Peking's hold.",
        markers: () => {
          const a = PF.anchorOf("seaport", "nest");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Hatchery",
                  interior: "seaport",
                },
              ]
            : [];
        },
      },
      {
        id: "report",
        text: "Return to Lottie Brennan in the fish market.",
        markers: () => [{ npc: "pf_sp_lottie", label: "Lottie Brennan" }],
      },
    ],
    rewards: { xp: 400, scrip: 200, standing: 30 },
  });
