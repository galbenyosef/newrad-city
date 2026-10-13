// play-inline-423 05 — title
// Lines 1892-1960 of readable/play-inline-423.pretty.js (statement-aligned).
  function termLedger() {
    return {
      title: "CARAVAN GUILD LEDGER",
      header:
        "WHITEHALL CARAVAN STAGE — DOCKAGE & ACCOUNTS\n(Kestrel teletype, formerly Dept. of Marine & Aviation)",
      lock: {
        id: "ph2_lk_wh_ledger",
        passcode: "DOCKAGE",
        hint: "Big Bertha chalked the passcode on the slate by her counter.",
      },
      entries: [
        {
          title: "Dockage — this week",
          text: "Crow's Hat Co. (Brooklyn): 4 pack oxen, 2 guards — PAID.\nTwo-Horn Traders (Bronx): 6 pack oxen, 3 guards — 12 scrip owing.\nSlate & Sons: route closed, raiders on Broadway. Refund? — NO. — R.",
        },
        {
          title: "Notes on the Corbin",
          text: "Tilly's bar brings in more than the bunks and the pen put together. If the Corbin goes down like the Richmond we lose the whole stern trade. Told Gus to fix it. Gus told me something anatomically unlikely. Find him a mechanic. Or a miracle.",
        },
        {
          title: "Empire Stores",
          text: 'Hattie Szabo\'s market under the bridges is buying everything we bring over. Her prices are fair, which is suspicious. Her scale is "certified," which is more suspicious. Somebody is skimming her cellar. Not my problem. Unless it becomes my problem.',
        },
        {
          title: "Security",
          text: "Shellback sign on the Battery again. Two more guards on nights. Nobody sleeps on the racks — I don't care how hot it is.",
        },
        {
          title: "Strongbox",
          learn: "ph2_lk_wh_strongbox",
          text: "Strongbox combination reset after the Slate & Sons business: 0-5-0-5. Fifth of May, the day this stage opened. — R.",
        },
      ],
    };
  }
  function termPA() {
    return {
      title: "PUBLIC ADDRESS CONSOLE",
      header:
        "DEPT. OF MARINE & AVIATION — WHITEHALL TERMINAL\nPA / ANNOUNCEMENT QUEUE",
      entries: [
        {
          title: "[Queued] 09:42",
          text: '"Attention passengers. Due to a CIVIL DEFENSE ADVISORY, the 10:00 boat to St. George is cancelled. Please remain calm and proceed to the nearest civil-defense shelter. The nearest civil-defense shelter is... [NOT FOUND]."',
        },
        {
          title: "[Queued] 09:46",
          text: '"This is a reminder that running in the terminal is prohibited."',
        },
        {
          title: "[Queued] 09:47",
          text: '"Attention all p—" [END OF RECORDING]',
        },
        {
          title: "Lost and Found",
          text: "1 umbrella (black). 1 briefcase (brown, locked). 1 child's shoe (red). 214 umbrellas (various).",
        },
      ],
    };
  }

  // Pumps: hide the engine-room water once Gus is happy
  PV.whPumps = function () {
    const c = PV.ctxs && PV.ctxs.find((q) => q.id === "whitehall_terminal");
    if (c && c.whFlood) c.whFlood.visible = false;
  };
  PV.whUpdate = function (dt, realDt, ctx) {
    if (ctx.whFlood && ctx.inside) ctx.whFlood.visible = !PV.flag("wh_pumps");
  };
