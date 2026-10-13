// play-inline-200 02 — spots
// Lines 300-368 of readable/play-inline-200.pretty.js (statement-aligned).
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G._pv) return;
  const PV = G._pv;
  const CHELSEA = [
    [
      "The radiator knocked three times last night.",
      "Mr. Moretz. He always did want to be let in.",
    ],
    [
      "I am painting nothing but green this year.",
      "Everything IS green this year.",
    ],
    ["Stanley says rent is due.", "Rent has been due since '67."],
    [
      "Leopold offered me twelve scrip for my sonnet.",
      "Take it. Sonnets are not what they were.",
    ],
  ];
  const VANGUARD = [
    [
      "The drummer has a new fill.",
      "He has had the same fill for twenty-two years. It is still new to me.",
    ],
    [
      "You think the robots know it is jazz?",
      "Hon, they know it better than we do.",
    ],
    ["Mags is watering the gin again.", "Mags is watering the WATER again."],
  ];
  G.events.on("initDone", () => {
    try {
      const SB = G.poiSandbox;
      if (!SB) return;
      const spots = (poi, names) =>
        names
          .map((n) => PV.anchor(poi, n))
          .filter(Boolean)
          .map((v) => ({ x: v.x, y: v.y, z: v.z, yaw: v.yaw || 0 }));
      SB.add("pv_chelsea_res1", {
        group: "chelsea",
        spots: spots("chelsea", ["npc1", "stanley", "merchant", "npc2"]),
        chat: CHELSEA,
        chatChance: 0.5,
      });
      SB.add("pv_chelsea_res2", {
        group: "chelsea",
        spots: spots("chelsea", ["npc3", "npc2", "vivienne", "npc1"]),
        chat: CHELSEA,
        chatChance: 0.5,
      });
      SB.add("pv_vv_settler", {
        group: "vanguard",
        spots: spots("vanguard", ["yard", "stage", "bartender", "npc3"]),
        chat: VANGUARD,
        chatChance: 0.6,
      });
      SB.add("pv_vv_bouncer", {
        group: "vanguard",
        spots: spots("vanguard", ["npc3", "stage", "npc3", "bartender"]),
        chat: VANGUARD,
        chatChance: 0.3,
      });
    } catch (e) {
      G.reportError("poi_village:sandbox", e);
    }
  });
})();
