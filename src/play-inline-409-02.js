// play-inline-409 02 — the
// Lines 28-72 of readable/play-inline-409.pretty.js (statement-aligned).
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // the Congress's tax box in the scrap annex: the combination is chalked on the annex wall beside it
  const TAXBOX = K.regLock({
    id: "pf3_lk_fh_taxbox",
    label: "Congress Tax Box",
    code: "2611",
    hint: "Chalked on the annex wall beside the box.",
  });

  /** mq22: the core's last priority traffic (Deputy Director Marsh's order of Saturday 4 March 1967). */
  PV.MARSH_MEMO =
    "[A curl of yellow teleprinter paper, torn off at the cradle. Below the routing header, in capitals:]\n\n" +
    "PRIORITY — FLASH — EYES ONLY\nSAT 04 MAR 67 1810 EST\nFROM: DEP DIR OCD (MARSH)\nTO: ALL CONTINUITY NODES EASTERN SEABOARD / LIBERTY STATION\n\n" +
    "SOURCE CONFIRMS. EXECUTION 05 MAR, MORNING.\nMOVE THE ROLLS AND ENROLLED STAFF TO LIBERTY TONIGHT.\nNO PUBLIC NOTICE.\nPROTECT THE SOURCE.\nM.\n\n" +
    "[Under it, the node's automatic acknowledgement:] NODE 7 ACK 1814 EST. CUSTODIAN NOT CLEARED FOR CONTENT.\n\n" +
    "[The date is Saturday, the fourth of March. The Bombing came the next morning at 09:47. Nobody warned the city.]";

  const FH = (PV.fh = {
    X0: 65,
    X1: 95,
    Z0: 818,
    Z1: 842,
    XC: 80,
    PODIUM: 3.0, // portico floor height
    STEP_Z1: 824.5, // top of the steps
    COL_Z: 826.3, // column centre line
    CELLA_Z: 831.5, // front wall of the cella (the doors)
    COL_TOP: 13.4,
  });
  FH.door = new THREE.Vector3(FH.XC, FH.PODIUM + 1.3, FH.CELLA_Z - 0.45);

  /** Atlas rect with u flipped (the back face of a banner). */
  function flipU(rc) {
    const o = [rc[2], rc[1], rc[0], rc[3]];
    o.atlas = rc.atlas;
    return o;
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
