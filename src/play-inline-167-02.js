// play-inline-167 02 — spots
// Lines 375-479 of readable/play-inline-167.pretty.js (statement-aligned).
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G._pu) return;
  const P = G._pu;
  const PLAZA = [
    [
      "Did you see what she wore to luncheon? Leather. LEATHER.",
      "Raider chic. It will pass, like the Unpleasantness.",
    ],
    [
      "The soup was tepid again.",
      "Everything is tepid, Reginald. We live in a tepid age.",
    ],
    [
      "I hear the Waldorf has been let to soldiers.",
      "New money. Exo-rigged new money.",
    ],
    [
      "Is it true a ripjaw ate the Van Rensselaers?",
      "Only the parts that mattered, dear.",
    ],
    [
      "Pemberton says we are out of caviar.",
      "Then we shall eat the pack oxen and CALL it caviar.",
    ],
  ];
  const CARNEGIE = [
    [
      "Bar forty-two again. The horns keep dragging.",
      "The horns are two rust-buckets and a man with one lung.",
    ],
    [
      "If the dynamo runs, we play Friday.",
      "We said that last Friday. And in '71.",
    ],
    [
      "Rudy is tuning the piano again.",
      "It has not been in tune since the war. Neither has Rudy.",
    ],
    [
      "Do you think anyone will actually come?",
      "Someone always comes to hear music. Even here. Especially here.",
    ],
  ];
  G.events.on("initDone", () =>
    P.safe("sandbox", () => {
      const SB = G.poiSandbox;
      if (!SB) return;
      const spots = (poi, names) =>
        names
          .map((n) => P.anchor(poi, n))
          .filter(Boolean)
          .map((v) => ({ x: v.x, y: v.y, z: v.z, yaw: v.yaw || 0 }));
      SB.add("pu_social4", {
        group: "plaza",
        spots: spots("plaza_hotel", [
          "npc3",
          "palm_court",
          "oak_bar",
          "ballroom",
          "stage",
        ]),
        chat: PLAZA,
      });
      SB.add("pu_social2", {
        group: "plaza",
        spots: spots("plaza_hotel", ["npc2", "oak_bar", "palm_court", "lobby"]),
        chat: PLAZA,
        chatChance: 0.5,
      });
      SB.add("pu_clara", {
        group: "carnegie",
        spots: spots("carnegie_hall", [
          "violinist",
          "greenroom",
          "lobby",
          "auditorium",
        ]),
        chat: CARNEGIE,
        chatChance: 0.5,
      });
      SB.add("pu_cellist", {
        group: "carnegie",
        spots: spots("carnegie_hall", [
          "cellist",
          "greenroom",
          "lobby",
          "office",
        ]),
        chat: CARNEGIE,
        chatChance: 0.4,
      });
      SB.add("pu_stagehand", {
        group: "carnegie_bots",
        spots: spots("carnegie_hall", [
          "stagehand",
          "dynamo",
          "greenroom",
          "auditorium",
        ]),
      });
    }),
  );
})();
