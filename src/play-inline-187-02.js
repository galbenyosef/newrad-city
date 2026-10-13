// play-inline-187 02 — spots
// Lines 370-428 of readable/play-inline-187.pretty.js (statement-aligned).
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.PMID) return;
  const PIT = [
    [
      "Brick is gonna fold somebody in half tonight.",
      "Two scrip says he folds 'em in thirds.",
    ],
    ["Carla, is the squirrel fresh?", "It was fresh when it was a squirrel."],
    [
      "You see the new kid in the ring?",
      "cryo suit. They always last one round.",
    ],
    [
      "Ondine took my last ten scrip.",
      "Ondine takes everybody's last ten scrip. It's a service.",
    ],
    [
      "Heard the Continuity got the Waldorf now.",
      "Let 'em. Nobody's taking The Pit.",
    ],
  ];
  G.events.on("initDone", () => {
    try {
      const SB = G.poiSandbox;
      if (!SB) return;
      const spots = (names) =>
        names
          .map((n) => {
            try {
              return G.pois.getAnchor("msg", n);
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean)
          .map((v) => ({ x: v.x, y: v.y, z: v.z, yaw: v.yaw || 0 }));
      SB.add("pmid_msg_fan1", {
        group: "pit",
        spots: spots(["crowd2", "merchant", "npc1", "ring_red", "bookie"]),
        chat: PIT,
        chatChance: 0.5,
      });
      SB.add("pmid_msg_fan3", {
        group: "pit",
        spots: spots(["crowd4", "npc2", "merchant", "ring_blue", "doctor"]),
        chat: PIT,
        chatChance: 0.5,
      });
      SB.add("pmid_msg_guard", {
        group: "pit_guard",
        spots: spots(["guard1", "guard2", "entrance", "guard1"]),
      });
    } catch (e) {
      G.reportError("poi_midtown:sandbox", e);
    }
  });
})();
