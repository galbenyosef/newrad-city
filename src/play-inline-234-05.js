// play-inline-234 05 — settler
// Lines 1296-1422 of readable/play-inline-234.pretty.js (statement-aligned).
  LI.spawnFns.push(function () {
    const C = LI.fl;
    if (!C) return;
    const A2 = C.anchors;
    const settler = (o, at) =>
      LI.spawnNPC(
        Object.assign(
          {
            type: "human",
            faction: "settlers",
            ai: "merchant",
            homeR: 1.6,
            essential: true,
            voice: "merchant",
          },
          o,
        ),
        at,
      );
    settler(
      {
        id: "li_fl_dottie",
        name: "Mavis Wojcik",
        outfit: "settler",
        gender: "f",
        dialogue: "dlg_li_dottie",
        level: 4,
        weapon: "pistol_10mm",
        merchant: { scrip: 300, stock: STOCK_DOTTIE, restock: 2 },
        hair: "bun",
        skinTone: 0.25,
        barks: ["Twenty scrip, hon. No spitting.", "Room 25 is NOT for rent."],
      },
      A2.dottie,
    );
    settler(
      {
        id: "li_fl_marisol",
        name: "Marisol Vega",
        outfit: "merchant",
        gender: "f",
        dialogue: "dlg_li_marisol",
        level: 5,
        weapon: "switchblade",
        merchant: { scrip: 450, stock: STOCK_MARISOL, restock: 3 },
        skinTone: 0.55,
        barks: [
          "Stand still, I'm measuring you.",
          "That jacket's a crime. I can fix it.",
        ],
      },
      A2.marisol,
    );
    settler(
      {
        id: "li_fl_sparks",
        name: 'Horace "Tubes" Adeyemi',
        outfit: "settler",
        gender: "m",
        dialogue: "dlg_li_sparks",
        level: 5,
        weapon: "pistol_10mm",
        merchant: { scrip: 500, stock: STOCK_SPARKS, restock: 3 },
        skinTone: 0.85,
        barks: [
          "Don't lick the tubes.",
          "Hear that hum? That's the sound of money.",
        ],
      },
      A2.sparks,
    );
    settler(
      {
        id: "li_fl_lorena",
        name: "Lorena Hightower",
        outfit: "merchant",
        gender: "f",
        ai: "guard",
        dialogue: "dlg_li_lorena",
        level: 8,
        weapon: "hunting_rifle",
        skinTone: 0.45,
        hair: "bun",
        barks: [
          "One eye on Fifth, one eye on Broadway.",
          "Ledgers don't balance themselves. I've waited.",
        ],
      },
      A2.lorena,
    );
    settler(
      {
        id: "li_fl_guard",
        name: "Post Guard Kellerman",
        outfit: "combat_armor",
        gender: "m",
        ai: "guard",
        essential: false,
        level: 7,
        weapon: "combat_shotgun",
        homeR: 1.2,
        barks: [
          "No guns drawn inside the Post.",
          "Office upstairs is by appointment.",
        ],
      },
      A2.guard,
    );
    if (Q.flag("li_nyse_freed"))
      settler(
        {
          id: "li_fl_nate",
          name: "Nate Oduya",
          outfit: "settler",
          gender: "m",
          ai: "guard",
          level: 3,
          homeR: 1.5,
          skinTone: 0.75,
          barks: [
            "Forty to one. I still dream about it.",
            "Water's on me. Literally, I carry it.",
          ],
        },
        A2.nate,
      );
  });
