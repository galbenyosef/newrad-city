// play-inline-193 02 — building
// Lines 25-56 of readable/play-inline-193.pretty.js (statement-aligned).
  const PV = G._pv;
  const K = PV.kit;

  // ---- locks (G.locks) ----
  const LK = {
    safe: K.regLock({
      id: "pv_lk_katz_safe",
      label: "Katz Family Safe",
      kind: "safe",
      code: "1888",
      hint: "The office teletype's brisket schedule gives the year over the door.",
      learnedFrom: "Katz's office teletype (Brisket Schedule)",
    }),
  };
  const PI = Math.PI,
    HP = PI / 2;

  // building (front at Z1 on Houston St, facing +z). Loop round 1: flush with the site's building lines
  // (Bowery x 210, corner x 270, 8th St z 407, Houston z 438) — it used to stand 1–4 m back on bare lot.
  const X0 = 210,
    X1 = 270,
    Z0 = 407,
    Z1 = 438; // (8th St sidewalk ends at z 407)
  const GH = 4.4,
    H2 = 10.2;
  const DOOR_X = 261.5;
  const BY = -3.8; // basement floor (local)
  const HALL_H = 4.2;

  // ==================================================================
  // EXTERIOR
  // ==================================================================
