// play-inline-422 02 — along
// Lines 29-59 of readable/play-inline-422.pretty.js (statement-aligned).
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // Local frame along the Battery shore: Manhattan polygon edge (190,900) → (110,985).
  const SA = [190, 900],
    SB = [110, 985];
  const UL = Math.hypot(SB[0] - SA[0], SB[1] - SA[1]);
  const UX = (SB[0] - SA[0]) / UL,
    UZ = (SB[1] - SA[1]) / UL; // along the shore (→ SW)
  const NX = UZ,
    NZ = -UX; // offshore normal (→ SE): (0.728, 0.685)
  const T0 = 53; // pivot: 53 m from SA along the shore
  const F = K.frame(SA[0] + UX * T0, SA[1] + UZ * T0, Math.atan2(NX, NZ));
  const WH = (PV.wh = {
    F,
    AY: 0.3,
    FL: 0.9,
    X0: -18,
    X1: 18,
    Z0: 13,
    Z1: 31,
    H: 13.4, // terminal block (local)
    SLIPS: [-12, 0, 12],
    FERRY: { cx: -12, cz: 49, len: 32, beam: 8.4, deck: 1.1 },
  });

  // ==================================================================
  // EXTERIOR
  // ==================================================================
