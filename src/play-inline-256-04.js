// play-inline-256 04 — responses
// Lines 1036-1372 of readable/play-inline-256.pretty.js (statement-aligned).
  PF.item({
    id: "pbr_bm_fuse",
    type: "misc",
    name: "Tidal Governor Fuse",
    weight: 0.5,
    value: 40,
    quest: true,
    desc: 'A ceramic cartridge fuse the size of a rolling pin, stencilled FIVE BOROUGHS — TIDAL GOVERNOR — 600A. Someone scratched "SPARE — DUTCH" into the glaze.',
  });
  PF.item({
    id: "pbr_bm_storekey",
    type: "key",
    name: "Bridgemarket Storeroom Key",
    weight: 0,
    value: 0,
    desc: "A brass key on a loop of fishing line, stamped B.M. — STORES.",
  });
  PF.item({
    id: "pbr_reel_dutch",
    type: "tape",
    name: "Tape reel: Dutch Varga",
    title: "Dutch Varga — Pier Works Log",
    text: "[Water sloshing. A wrench taps on metal, three times, like knocking.]\n\nDUTCH: Log. Day... whatever. The governor fuse cooked again. Third one this year. River's too warm — the turbine runs hot, the fuse runs hotter. I brought the spare. Always bring the spare.\n\n[Clicking. Distant, then less distant.]\n\nDUTCH: The cistern's full of eggs. That's new. That's... Ruth is going to love that. Okay. Okay. Fuse first, then crabs. No — crabs first. No—\n\n[A heavy splash. Clicking, very close. The recording keeps running for a long time.]\n\nDUTCH (whispering): Spare's in my bag. Somebody tell Ruth the spare's in my bag.\n\n[Recording ends.]",
  });
  PF.item({
    id: "pbr_note_guastavino",
    type: "note",
    name: "Guastavino Co. — Tile Specification",
    title:
      "R. Guastavino Company — Specification for the Bridge Market Vaults (1914)",
    text: "SYSTEM: Timbrel (tile) vault, three courses, laid in herringbone with quick-setting Portland cement.\n\nThe first course is laid without centering — each tile holds the one before it until the mortar takes. The vault builds itself out of thin air, one hand-width at a time. Clients ask where the steel is. There is no steel. The tiles ARE the structure.\n\nLIVE LOAD: sufficient for a public market, two hundred carts, and a brass band.\n\n[Pencilled beneath, in a much later hand:] Also sufficient for one (1) atomic war. We checked. — R.O.",
  });
  PF.item({
    build() {
      const base = PF.live("items") ? G.items.get("magnum_44") : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 40) * 1.2),
              critChance: (base.weapon.critChance || 1) * 1.6,
              spread: (base.weapon.spread || 0.02) * 0.75,
              condDecay: (base.weapon.condDecay || 0.003) * 0.5,
            })
          : undefined;
      return {
        id: "pbr_groovy",
        type: w ? "weapon" : "misc",
        name: "Feelin' Groovy",
        weight: 4,
        value: 1100,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: 'A .44 revolver with hand-painted daisies up the barrel and "59" carved in the grip. Ruth Adebayo carried it across the Queensboro the day she founded the market. Hits harder, crits more, and never seems to jam.',
        weapon: w,
      };
    },
  });

  PF.terminal("pbr_bm_ledger", {
    title: "BRIDGEMARKET — MARKET LEDGER",
    header:
      'MERIDIAN TELELINK — OWNER: R. OKAFOR\n"UNDER THE BRIDGE, OVER THE ODDS"',
    entries: [
      {
        title: "Market Safe",
        learn: "pbr_bm_safe",
        text: "Market safe (stores key, rent box): 5-9-0-9. Fifty-ninth street, the year they built the bridge. Ruth says nobody would guess it. Lou guessed it.",
      },
      {
        title: "Charter of the Bridgemarket",
        text: 'We, the undersigned, being cold, wet and tired of being shot at, hereby found a market under the Queensboro Bridge.\n\n1. Any trader may rent a stall. Rent is 5 scrip a week or one useful thing.\n2. No raiders. No slavers. No Brutes, "even the nice one".\n3. The vaults are older than all of us and will outlive all of us. Do not hang anything heavy from them.\n4. Disputes are settled by the Mayor, or failing that, by Kowalski.\n\n— R. Adebayo, Mayor (elected, 31 votes to 2)',
      },
      {
        title: "Power — Tidal Generator",
        text: "The old-world Five Boroughs tidal governor under the Manhattan pier still spins with the river. When it runs, we have lights, the water pumps, and Lou's cooler hums. When it doesn't, we have candles and complaints.\n\nDutch went down to replace the governor fuse 6 days ago. Dutch has not come back up. The pumps are running on the hand crank. Morty says there is clicking in the drains.",
      },
      {
        title: "Trade Notes",
        text: "Grand Central Market: buys our tile salvage, sells us meds.\nThe Neon: buys anything that glows. Do not ask.\nChinatown: pays for river mussels, bad debts.\n\nCaravan from Canal Street overdue. Tomas Ybarra swore he'd be here by the new moon. Tomas is never late. Lou says the Brutes took the Manhattan Bridge anchorage for a larder. I am choosing not to believe Lou until I have to.",
      },
      {
        title: "Personal",
        text: 'Twenty years ago my grandmother walked me across this bridge on her shoulders. The top half of the bridge was full of dead cars and the bottom half was full of live raiders. She said: "Look up, baby." So I looked up, and there were the tiles.\n\nPeople built something beautiful here once, for no better reason than they could. We can too.',
      },
    ],
  });
  PF.terminal("pbr_bm_governor", {
    title: "FIVE BOROUGHS — TIDAL GOVERNOR 3",
    header:
      "FIVE BOROUGHS POWER COMPANY OF NEW YORK\nQUEENSBORO PIER WORKS — TIDAL GOVERNOR 3",
    lock: 0,
    entries: [
      {
        title: "Status",
        text: () =>
          PF.flag("bm_power")
            ? "TURBINE: 212 RPM\nGOVERNOR: NOMINAL\nOUTPUT: 41 kW → BRIDGE MARKET BUS\n\nHave a safe day!"
            : "TURBINE: 0 RPM\nGOVERNOR: FAULT 0x3F — FUSE OPEN CIRCUIT\nOUTPUT: 0 kW\n\nReplace governor fuse (part CE-600A) and cycle the main breaker.",
      },
      {
        title: "Maintenance Log (1967)",
        text: '03.01 — River temp +2.1°C over seasonal. Blade fouling (mussels). Scraped.\n03.03 — Management asks if the tidal units can "run without staff for extended periods". Told them they can run without staff for a century if nobody touches them. Management seemed relieved.\n03.05 — [NO ENTRY]',
      },
      {
        title: "Log — D. Varga (1989)",
        text: "Found this terminal still running under an inch of silt. Beautiful machine. Nobody builds anything to last anymore, except apparently the people who built everything that lasted.\n\nSpare governor fuse kept in my bag. If you are reading this and I am not standing next to you, find my bag.",
      },
    ],
  });

  // --- dialogue: Mayor Ruth Adebayo ---
  PF.dialogue("pbr_dlg_ruth", {
    start: () => {
      if (PF.q.active("pbr_current") && PF.q.stage("pbr_current") === "report")
        return "report";
      if (PF.q.complete("pbr_current")) return "after";
      if (PF.q.active("pbr_current")) return "progress";
      return PF.flag("bm_met_ruth") ? "again" : "first";
    },
    nodes: {
      first: {
        speaker: "Ruth Adebayo",
        text: "Welcome to the Bridgemarket — mind the drips, those are just the river, probably. I'm Ruth Adebayo. Mayor, landlady, and the only person down here who reads the ledger. You're not a raider, you're not a Brute, and you haven't tried to sell me a giant roach as \"mystery chicken\". That already makes you my favourite customer today.",
        onEnter() {
          PF.setFlag("bm_met_ruth", true);
        },
        responses: [
          { text: "What is this place?", next: "place" },
          { text: "You look like you have a problem.", next: "problem" },
          { text: "Just passing through." },
        ],
      },
      place: {
        speaker: "Ruth Adebayo",
        text: "Before the war it was a market under the Queensboro Bridge — they built it in 1914 and it outlived every shop that ever rented it. Look up. Those are Guastavino tile vaults: three layers of tile thinner than your thumb, no steel at all. The blast up north knocked down half of Harlem and never cracked a single one. So we moved in under them. Seemed like the smart thing.",
        responses: [
          { text: "You look like you have a problem.", next: "problem" },
          { text: "Nice place. Goodbye." },
        ],
      },
      problem: {
        speaker: "Ruth Adebayo",
        text: "Sharp eyes. There's an old-world tidal generator under the Manhattan pier — the Pier Works. It gives us light, pumps our water, keeps Lou's beer cold. It died six days ago. My engineer, Dutch Varga, went down to fix it. Dutch hasn't come back up, and now there's clicking in the drains. Get that turbine turning again and I'll make it worth your while.",
        responses: [
          {
            text: "I'll go down and have a look.",
            action: () => startCurrent(),
            next: "go",
          },
          { text: "Worth my while how?", next: "pay" },
          {
            text: "[Persuasion 40] Clicking means shellbacks. That's hazard pay.",
            check: { skill: "persuasion", value: 40 },
            next: "hazard",
            failNext: "hazard_fail",
          },
          { text: "Not my problem." },
        ],
      },
      pay: {
        speaker: "Ruth Adebayo",
        text: "One hundred and fifty scrip from the market chest, free patching from Doc Hattie for as long as you live — which, if you go down there, may not be long — and something of mine I've been saving for someone worth giving it to.",
        responses: [
          { text: "Deal.", action: () => startCurrent(), next: "go" },
          { text: "I'll think about it." },
        ],
      },
      hazard: {
        speaker: "Ruth Adebayo",
        text: "Shellbacks. Of course it's shellbacks. [She sighs and counts out scrip.] Fifty now, as hazard pay, the rest when the lights come on. Don't tell Kowalski I negotiate.",
        onEnter() {
          PF.inv.addScrip(50);
        },
        responses: [
          {
            text: "Pleasure doing business.",
            action: () => startCurrent(),
            next: "go",
          },
        ],
      },
      hazard_fail: {
        speaker: "Ruth Adebayo",
        text: 'Nice try. Everybody gets hazard pay down here — it\'s called "being alive at the end of the week". The offer stands.',
        responses: [
          { text: "Fine. I'll go.", action: () => startCurrent(), next: "go" },
          { text: "Maybe later." },
        ],
      },
      go: {
        speaker: "Ruth Adebayo",
        text: "The stair's off the north corridor, past the guard — tell Moss I sent you. The turbine room is at the east end of the pump hall. If you find Dutch... if you find Dutch, bring him home. Or bring me something of his.",
        responses: [{ text: "I'll be back." }],
      },
      progress: {
        speaker: "Ruth Adebayo",
        text: () =>
          PF.flag("bm_power")
            ? "The lights are on — I can hear the pumps from here. Come tell me what you found."
            : "Still dark down there? The stair's off the north corridor. Please hurry — Lou is threatening to open the warm beer.",
        responses: [{ text: "Working on it." }],
      },
      report: {
        speaker: "Ruth Adebayo",
        text: () =>
          PF.inv.count("pbr_reel_dutch") > 0 || PF.flag("bm_dutch")
            ? 'The lights came on and half the market cheered and the other half cried, because they thought it meant Dutch was back. [You hand her the tape reel. She listens to it twice.] "Always bring the spare." Stubborn old goat. Thank you for bringing him home.'
            : "Listen to that. Pumps, lights, and Lou's cooler humming like a choir. You did it. And Dutch? ...No. Don't tell me. I think I already know.",
        responses: [
          {
            text: "He kept the market running to the end.",
            action: () => finishCurrent(),
            next: "reward",
          },
        ],
      },
      reward: {
        speaker: "Ruth Adebayo",
        text: "This was mine. I carried it across the bridge the day we founded the market — the daisies were my grandmother's idea of a joke. \"Feelin' Groovy,\" she called it. Take it. And tell Doc Hattie your patching's on the house, forever.",
        responses: [{ text: "Thank you, Mayor." }],
      },
      again: {
        speaker: "Ruth Adebayo",
        text: "Back again? The market's still dark and I still need a hero, or failing that, someone who owns a flashlight.",
        responses: [
          { text: "Tell me about the generator.", next: "problem" },
          { text: "Tell me about this place.", next: "place" },
          { text: "Later." },
        ],
      },
      after: {
        speaker: "Ruth Adebayo",
        text: "Our favourite electrician! Everyone on the bridge knows your name now. Mostly they get it wrong, but with great affection.",
        responses: [
          { text: "Any news?", next: "news" },
          { text: "Tell me about this place.", next: "place" },
          { text: "Take care, Ruth." },
        ],
      },
      news: {
        speaker: "Ruth Adebayo",
        text: () =>
          PF.q.complete("pbr_anchor")
            ? "Tomas Ybarra is back running the Canal Street trade wagon — he tells everybody you walked into a Brute larder and walked out with him. I let him exaggerate. It's good for business."
            : "The Canal Street trade wagon is still missing. Lou swears the Brutes are keeping people in the Manhattan Bridge anchorage like canned goods. If anybody could find out, it's you.",
        responses: [
          {
            text: "I'll look into it.",
            action: () => {
              if (!PF.q.started("pbr_anchor")) PF.q.start("pbr_anchor");
            },
          },
          { text: "Goodbye." },
        ],
      },
    },
  });
  function startCurrent() {
    if (!PF.q.started("pbr_current")) PF.q.start("pbr_current");
    PF.q.advance("pbr_current", ["talk"], "works");
  }
  function finishCurrent() {
    if (PF.inv.count("pbr_reel_dutch") > 0) {
      PF.inv.remove("pbr_reel_dutch", 1);
      PF.setFlag("bm_dutch", true);
      PF.standing(10, "Brought Dutch home");
    }
    PF.inv.add("pbr_groovy", 1);
    PF.setFlag("bm_heal_free", true);
    PF.q.done("pbr_current");
    PF.news(
      'The lights are back on at the Bridgemarket under the Queensboro Bridge. Mayor Adebayo credits a mysterious stranger, the river, and "several hundred very angry crabs, now deceased."',
    );
  }

  // --- the generator (actor-less dialogue) ---
  PF.dialogue("pbr_dlg_generator", {
    start: () => (PF.flag("bm_power") ? "on" : "off"),
    nodes: {
      off: {
        speaker: "Tidal Governor 3",
        text: () =>
          "The control panel is dark except for one red lamp blinking FAULT 0x3F. Behind a cracked inspection glass, the governor fuse holder is empty and scorched." +
          (PF.inv.count("pbr_bm_fuse") > 0
            ? " Dutch's spare fuse would fit."
            : ""),
        onEnter() {
          PF.q.advance("pbr_current", ["talk", "works"], "fix");
        },
        responses: [
          {
            text: "Fit Dutch's spare fuse and throw the breaker.",
            cond: () => PF.inv.count("pbr_bm_fuse") > 0,
            action: () => {
              PF.inv.remove("pbr_bm_fuse", 1);
              powerOn("fuse");
            },
          },
          {
            text: "[Mechanics 50] Bridge the fuse holder with scrap copper and throw the breaker.",
            check: { skill: "mechanics", value: 50 },
            cond: () => PF.inv.count("pbr_bm_fuse") === 0,
            action: () => powerOn("repair"),
            failNext: "fail",
          },
          {
            text: "[Electronics 60] Reroute the governor through the backup bus.",
            check: { skill: "electronics", value: 60 },
            cond: () => PF.inv.count("pbr_bm_fuse") === 0,
            action: () => powerOn("science"),
            failNext: "fail",
          },
          {
            text: "Leave it.",
            action: () => {
              if (!PF.flag("bm_fuse_hint")) {
                PF.setFlag("bm_fuse_hint", true);
                G.notify(
                  "Dutch Varga went down with a spare fuse. It must be somewhere in the Pier Works.",
                );
              }
            },
          },
        ],
      },
      fail: {
        speaker: "Tidal Governor 3",
        text: "Sparks bite your fingers and the breaker kicks straight back out. This needs the proper fuse.",
        responses: [{ text: "Leave it." }],
      },
      on: {
        speaker: "Tidal Governor 3",
        text: "The turbine thrums behind its casing. Every lamp on the panel is green.",
        responses: [{ text: "Leave it." }],
      },
    },
  });
