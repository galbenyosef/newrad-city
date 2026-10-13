// play-inline-576 05 — math
// Lines 1296-1315 of readable/play-inline-576.pretty.js (statement-aligned).
  QX.trigger({
    id: "g_dot_wave",
    once: false,
    cooldown: 90,
    pos: () => {
      const a = QX.npc("qx_dot");
      return a && !a.dead ? a.pos : null;
    },
    r: 7,
    cond: () => /_ret$/.test(QX.stage(QID) || ""),
    fire: () =>
      QX.say(
        "qx_dot",
        [
          "There's my researcher!",
          "Ooh! News? You have a news face!",
          "You're back! Tell me EVERYTHING.",
        ][Math.floor(Math.random() * 3)],
      ),
  });
