// play-inline-492 04 — skin
// Lines 887-918 of readable/play-inline-492.pretty.js (statement-aligned).
  M.revolver_32 = function (skin) {
    return revolver({
      name: "revolver_32",
      barrelLen: 0.05,
      barrelR: 0.0075,
      cylR: 0.017,
      cylLen: 0.036,
      rodLen: 0.03,
      lug: false,
      vent: false,
      gripMat: "bakelite",
      checker: "bakelite",
      metal: "blued",
    });
  };
  M.magnum_44 = function (skin) {
    return revolver({
      name: "magnum_44",
      barrelLen: skin === "gold" ? 0.17 : 0.15,
      barrelR: 0.0095,
      cylR: 0.021,
      cylLen: 0.044,
      rodLen: 0.06,
      lug: true,
      vent: true,
      gripMat: skin === "gold" ? "bakelite" : "wood",
      checker: skin === "gold" ? "bakelite" : "gripWood",
      metal: skin === "gold" ? "steel" : "blued",
      gold: skin === "gold",
      scope: skin === "gold",
    });
  };
