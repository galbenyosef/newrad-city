/* src/map/55_dungeon_kit.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 55 DUNGEON SIGNS (shared)
 * The dungeon signage atlas 'my/dngsigns' (door plates, painted wall
 * signs, shop names) and its label list M.DSIGNS (2 × 16 cells,
 * M.DSIGN_COLS / M.DSIGN_ROWS). Used by the street doors on the city
 * façades (56_dungeons.js) and by the interior kit
 * (55_dungeon_kit_interior.js).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  // -------------------------------------------------------------------
  // Signage atlas (door plates, painted wall signs, shop names)
  // -------------------------------------------------------------------
  const DSIGNS = [
    "KESSLER & SONS",
    "EMPLOYEES ONLY",
    "RESTROOM",
    "FOREMAN",
    "EXIT",
    "PHARMACY",
    "BIG APPLE FOOD FAIR",
    "CHELSEA ARMS",
    "DUNMORE MUTUAL TRUST",
    "FULTON ST",
    "PUMPING STATION No. 4",
    "DANGER — HIGH VOLTAGE",
    "STRONGROOM",
    "MANAGER",
    "STOCKROOM",
    "BOILER ROOM",
    "SUPERINTENDENT",
    "KEEP OUT",
    "CUTTING ROOM",
    "SEWING FLOOR 2",
    "RECORDS",
    "TELLERS",
    "SAFE DEPOSIT",
    "UPTOWN",
    "DOWNTOWN",
    "CHECKOUT",
    "FROZEN FOODS",
    "PRODUCE",
    "CANNED GOODS",
    "AISLE 3",
    "AISLE 4",
    "MAINTENANCE",
  ];
  const SIGN_COLS = 2,
    SIGN_ROWS = 16;
  M.defineAtlas("dngsigns", function () {
    const CW = 512,
      CH = 128;
    const cv = M.canvas(SIGN_COLS * CW, SIGN_ROWS * CH),
      ctx = cv.getContext("2d");
    const r = M.rng("dngsigns");
    DSIGNS.forEach((txt, i) => {
      const x = (i % SIGN_COLS) * CW,
        y = Math.floor(i / SIGN_COLS) * CH;
      const warn = /DANGER|KEEP OUT|EMPLOYEES|HIGH VOLT/.test(txt);
      const exit = txt === "EXIT";
      const deco = /KESSLER|DUNMORE|CHELSEA|FOOD FAIR|PUMPING|FULTON/.test(txt);
      const bg = exit
        ? "#2a0c08"
        : warn
          ? "#c9a21c"
          : deco
            ? "#1d2a24"
            : r() < 0.5
              ? "#2a2c2e"
              : "#3a2e22";
      ctx.fillStyle = bg;
      ctx.fillRect(x, y, CW, CH);
      if (deco) {
        ctx.strokeStyle = "#b89a52";
        ctx.lineWidth = 6;
        ctx.strokeRect(x + 10, y + 10, CW - 20, CH - 20);
      }
      ctx.fillStyle = exit
        ? "#ff4a30"
        : warn
          ? "#161410"
          : deco
            ? "#d8c07a"
            : "#e8e2d0";
      ctx.font = deco
        ? "bold 50px Georgia, serif"
        : exit
          ? "bold 84px Arial, sans-serif"
          : "bold 46px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(txt, x + CW / 2, y + CH / 2 + 3, CW - 50);
      // wear: chips, rust dribbles, dirt
      for (let k = 0; k < 60; k++) {
        ctx.fillStyle = "rgba(25,20,15," + (r() * 0.35).toFixed(2) + ")";
        ctx.fillRect(x + r() * CW, y + r() * CH, 2 + r() * 12, 1 + r() * 5);
      }
      for (let k = 0; k < 6; k++) {
        const g = ctx.createLinearGradient(0, y, 0, y + CH);
        g.addColorStop(0, "rgba(90,45,20,0.35)");
        g.addColorStop(1, "rgba(90,45,20,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x + r() * CW, y, 3 + r() * 5, CH);
      }
    });
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, roughness: 0.7 };
  });
  M.DSIGNS = DSIGNS;
  M.DSIGN_COLS = SIGN_COLS;
  M.DSIGN_ROWS = SIGN_ROWS;
})();
