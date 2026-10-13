// play-inline-183 06 — end
// Lines 1207-1232 of readable/play-inline-183.pretty.js (statement-aligned).
  K.dialogueDef("pmid_dlg_brick", {
    start: () => (K.q.flag("pmid_pit_champion") ? "after" : "hi"),
    nodes: {
      hi: {
        speaker: "Brick Bruno",
        text: () =>
          wins() >= 2
            ? "...So you beat the rats. Good. Been a long time since anybody got this far. Don't go easy on me, kid. Everybody goes easy on the old man. It's insulting."
            : "Fifty-seven fights. Fifty-seven wins. You know what that is? That's fifty-seven times I didn't get to go home early.",
        responses: [
          R("Why do you still fight?", "why"),
          R("See you in the ring.", null, { end: true }),
        ],
      },
      why: {
        speaker: "Brick Bruno",
        text: "Fought my first pro bout right there, February 11th, 1967. Won in the third. Three weeks later, the whole world lost in the first. Figure I'm still waiting for somebody to go the distance. Then maybe I'll know the fight's over.",
        responses: [R("Maybe I'll be the one.", null, { end: true })],
      },
      after: {
        speaker: "Brick Bruno",
        text: "Champ. Heh. Feels good to say it to somebody else. Wear that belt proud — and if you ever get tired of it, I'll be right here. Always am.",
        responses: [R("Thanks, Brick.", null, { end: true })],
      },
    },
  });
