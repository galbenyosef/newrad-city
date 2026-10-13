// play-inline-574 01 — assign
// Lines 8-53 of readable/play-inline-574.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const QX = G.qx;
  // Shared ids owned by rpg / characters.
  const REEL_TYPE = "tape",
    SUIT_OUTFIT = "cryo_suit",
    SUIT_MESH = "cloth_cryo";

  const Q = (d) =>
    Object.assign(
      {
        type: "misc",
        weight: 0,
        value: 0,
        quest: true,
        noLoot: true,
        tags: ["quest"],
      },
      d,
    );
  const NOTE = (d) =>
    Object.assign(
      {
        type: "note",
        weight: 0,
        value: 0,
        noLoot: true,
        mesh: "paper",
        tags: ["note"],
      },
      d,
    );
  // Tape reels: the item type id 'tape' is shared with the rpg registry.
  const REEL = (d) =>
    Object.assign(
      {
        type: REEL_TYPE,
        weight: 0,
        value: 0,
        noLoot: true,
        mesh: "tape",
        tags: ["tape"],
      },
      d,
    );

