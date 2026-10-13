// play-inline-481 02 — kind
// Lines 356-377 of readable/play-inline-481.pretty.js (statement-aligned).
  function modelKind(kind) {
    kind = String(kind || "crate");
    if (MODEL_ALIAS[kind]) return MODEL_ALIAS[kind];
    if (BUILD[kind]) return kind;
    if (/fridge|refrig/.test(kind)) return "fridge";
    if (/cool/.test(kind)) return "cooler";
    if (/desk/.test(kind)) return "desk";
    if (/cabinet|filing/.test(kind)) return "file_cabinet";
    if (/locker/.test(kind)) return "locker";
    if (/safe/.test(kind)) return "safe";
    if (/ammo|weapon|military/.test(kind)) return "ammo_box";
    if (/aid|medic|doctor/.test(kind)) return "first_aid";
    if (/trash|garbage/.test(kind)) return "trash_can";
    if (/mail/.test(kind)) return "mailbox";
    if (/tool/.test(kind)) return "toolbox";
    if (/foot|trunk|chest|stash/.test(kind)) return "footlocker";
    if (/brief|suit|luggage/.test(kind)) return "suitcase";
    return "crate";
  }
  const CHROME = 0xc8c8c0,
    STEEL = 0x6a6c6a,
    DARK = 0x2a2a2a;
