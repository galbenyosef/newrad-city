// play-inline-275 02 — push
// Lines 28-59 of readable/play-inline-275.pretty.js (statement-aligned).
  const P = G._uw,
    D = P.dress,
    X = P.parts;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  const X0 = -186,
    X1 = -134,
    Z0 = -898,
    Z1 = -852,
    ZC = -875;
  const BODY = 50,
    PENT = 56,
    TOWER = 70,
    LOGGIA = 74,
    ATTIC = 77.5;
  const TX = -141,
    TZ = [-891, -859]; // tower centres (14×14, flush with the park front)
  const ROWS = [];
  for (let i = 0; i < 13; i++)
    ROWS.push({
      y: 7.2 + i * 3.2,
      h: 1.9,
      hood: i === 0 ? "pediment" : i === 12 ? "cornice" : undefined,
    });
  const TROWS = [];
  for (let i = 0; i < 4; i++) TROWS.push({ y: 57.2 + i * 3.2, h: 1.9 });

  // ===================================================================
  // EXTERIOR
  // ===================================================================
