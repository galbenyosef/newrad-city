// play-inline-180 07 — rec
// Lines 2023-2226 of readable/play-inline-180.pretty.js (statement-aligned).
  function content(rec, I) {
    const C = K.content("metlife_tower", rec);
    const { ox, oz, EY, KX, KY, KZ, CX0, CX1, CZ0, CZ1, QX, QY, QZ } = I;
    C.prop("file_cabinet", CX0 + 0.5, 0, CZ0 + 22, HP, {
      name: "Claims — Pending",
      loot: "file_cabinet",
    });
    C.prop("file_cabinet", CX0 + 0.5, 0, CZ0 + 8.4, HP, {
      name: "Claims — Denied",
      loot: "file_cabinet",
    });
    C.prop("desk", ox + 5, 0, oz + 20, -HP, {
      name: "Security Desk",
      loot: "desk",
      mount: "bare",
    });
    C.prop("safe", ox - 13.6, EY + 1.0, oz + 8, HP, {
      wall: true,
      name: "President's Wall Safe",
      locked: 0,
      lock: K.LOCKS.ml_pres_safe,
      items: [
        ["scrip", 180],
        ["stock_certificate", 4],
        ["old_dollars", 10],
      ],
    });
    C.prop("first_aid", ox + 13.7, EY + 1.4, oz - 14, -HP, {
      loot: "first_aid",
    });
    C.prop("toolbox", KX + 8, KY + 0.8, KZ + 3.6, PI, {
      chest: false,
      name: "Clockwinder's Toolbox",
      loot: "toolbox",
    });
    C.prop("ammo_box", KX - 9, KY, KZ + 9, 0, {
      name: "Robot Parts Crate",
      items: [
        ["dry_cell", 2],
        ["relay_board", 1],
        ["scrap_electronics", 3],
        ["ammo_dry_cell", 4],
      ],
    });
    C.terminal("pmid_ml_claims", ox - 1, 0.78, CZ0 + 4, PI, "bare");
    C.terminal("pmid_ml_mainframe", KX - 8, KY, KZ + 8, PI * 0.75, "own_desk");
    C.terminal("pmid_ml_security", ox + 5, 1.12, oz + 18.5, -HP, "bare");
    C.prop("skeleton", ox - 6.2, 0, CZ0 + 13.2, 0.2, { pose: "seated" }); // clerk at a desk
    C.prop("skeleton", ox + 9.3, 0, CZ0 + 8.5, PI, { pose: "lying" });
    C.prop("skeleton", ox - 8.2, EY, oz + 7.4, PI, { pose: "seated" }); // the president at his desk
    C.prop("skeleton", ox + 11, EY, oz + 8, -HP, { pose: "curled" }); // locked in the records vault
    C.prop("skeleton", KX - 4, KY, KZ - 9.5, 0.6, { pose: "reaching" }); // the clockwinder
    C.tape("pmid_ml_winder", KX + 7.6, KY + 0.8, KZ + 2.6, {
      name: "Clockwinder's Log",
      title: "Tape reel — E. Farnsworth, Chief Clockwinder",
      text: "[Recording]\nForty-one years I've oiled these wheels. The company put in the robots last spring — 'maintenance automation' — and they don't oil a thing, they just ADJUST. Adjust the claims, adjust the staff, adjust the sick leave.\nThis morning the ADJUSTER unit came up the lift and told me my 'continued employment presents an unacceptable actuarial risk'. Then the sirens started.\nThe hands froze at 9:47 when the shock came through. The movement's still going. It'll go till the weights hit the floor. I suppose so will I.\nIf anyone finds this: turn the pendulum by hand once in a while. She likes that.\n[End]",
    });
    C.note("pmid_ml_memo", ox + 6, EY + 0.78, oz - 14.2, {
      name: "Inter-Office Memo",
      title: "MEMO — Claims Division, Mar. 4, 1967",
      text: "TO: All Claims Adjusters (human and automated)\nFROM: Office of the Vice-President, Risk\nRE: 'War Exclusion' and 'Act of God'\n\nEffective immediately, any claim arising from nuclear, atomic, radiological or 'Soviet' causes shall be classified under Clause 17(b) ('Act of God or of Foreign Powers') and DENIED.\nThe new ADJUSTER Mk. IV robots are authorised to communicate denials in person.\nRemember: The Light That Never Fails never pays out, either. Ha ha. (Legal: please remove this sentence before distribution.)",
    });
    C.note("pmid_ml_postcard", QX + 1.2, QY + 0.9, QZ - 3.6, {
      name: "Postcard from the Tower",
      title: 'Postcard — "Greetings from the Metropolitan Life Tower!"',
      text: "Dear Ruthie — We went up the tower on the tour! You can see the whole city, the Flatiron looks like a slice of pie. The guide says the light on top 'never fails'. Daddy says that's the only thing about this company that doesn't. Home Tuesday. Love, Bea. (Mar. 3, 1967)",
    });
    C.pickup("dry_cell", 1, KX + 8.6, KY + 0.78, KZ + 2.8);
    C.pickup("pmid_ml_prudence_card", 1, KX + 7.9, KY + 0.78, KZ + 2.2); // clockwinder's override card: password for "Prudence"
    C.pickup("rally_tonic", 1, ox - 8.4, EY + 0.78, oz + 5.7);
    C.pickup("focus_pills", 1, ox - 7.6, EY + 0.78, oz + 6.2);
    // round 1b (quest walk): "Act of God" items were never placed — the quest could not be finished.
    C.pickup("q_pmid_ml_vaultkey", 1, ox - 8.1, EY + 0.78, oz + 5.1); // president's desk
    C.pickup("q_pmid_ml_policy", 1, ox + 6.4, EY + 0.03, oz + 3.7); // dropped in the records vault, in front of the P-shelves
    // security: two ceiling-less lobby turrets flanking the claims-floor doorway (switchable at the security desk)
    for (const sx of [-7.5, 7.5])
      C.prop("turret", ox + sx, 0, oz + 13.2, 0, {
        faction: "robots",
        hostile: true,
        group: "pmid_ml_turrets",
        hp: 60,
        damage: 4,
        range: 22,
      });
    // hazards: the clock room's frayed motor conduits arc across the catwalk stair and the gearbox
    K.hazard({
      x: KX - 1.8,
      y: KY + 0.8,
      z: KZ + 1.8,
      r: 1.3,
      dps: 10,
      kind: "shock",
    });
    K.hazard({
      x: KX - 12 + 1.1,
      y: KY + 5,
      z: KZ + 4,
      r: 1.2,
      dps: 10,
      kind: "shock",
      every: 0.9,
    });
    // the claims floor: burst radiator pipe venting scalding steam across the east aisle
    K.hazard({
      x: CX1 - 2,
      y: 0.8,
      z: CZ1 - 6,
      r: 1.4,
      dps: 6,
      kind: "steam",
      every: 0.7,
    });
  }

  K.defineSite("metlife_tower", 40, function () {
    art();
    const rec = K.record("metlife_tower", "metlife_tower");
    const ext = buildExterior(rec);
    const I = buildInterior(rec);
    K.door(rec, {
      id: "pmid_ml_front",
      pos: ext.doorPos,
      label: "Metropolitan Life Tower",
      verb: "Enter",
      target: I.arrival,
      onEnter: () => K.discover("metlife_tower"),
    });
    K.door(rec, {
      id: "pmid_ml_exit",
      pos: I.exitPos,
      label: "Madison Square",
      verb: "Exit to",
      target: ext.outside,
    });
    K.door(rec, {
      id: "pmid_ml_elev_lobby",
      pos: I.elevLobby,
      label: "Express Elevator — Clock Room",
      verb: "Ride",
      target: I.elevClockArrival,
      lock: K.lockReg(K.LOCKS.ml_elev),
    });
    K.door(rec, {
      id: "pmid_ml_elev_exec",
      pos: I.elevExec,
      label: "Tower Elevator — Clock Room",
      verb: "Ride",
      target: I.elevClockArrival,
    });
    K.door(rec, {
      id: "pmid_ml_elev_clock",
      pos: I.elevClock,
      label: "Tower Elevator — Lobby",
      verb: "Ride",
      target: I.elevLobbyArrival,
    });
    K.door(rec, {
      id: "pmid_ml_hatch_up",
      pos: I.hatchUp,
      label: "Cupola Stair",
      verb: "Climb",
      target: I.hatchUpArrival,
    });
    K.door(rec, {
      id: "pmid_ml_hatch_down",
      pos: I.hatchDown,
      label: "Clock Room",
      verb: "Descend",
      target: I.hatchDownArrival,
    });
    K.door(rec, {
      id: "pmid_ml_loggia_out",
      pos: I.cupolaDoor,
      label: "Loggia",
      verb: "Step out onto",
      target: ext.loggiaArrival,
    });
    K.door(rec, {
      id: "pmid_ml_loggia_in",
      pos: ext.loggiaDoor,
      label: "Cupola",
      verb: "Enter",
      target: I.cupolaArrival,
    });
    // records vault gate on the executive floor (the vault key on the president's desk)
    K.gate(rec, {
      id: "pmid_ml_vault",
      x: I.ox + 2,
      y: I.EY,
      z: I.oz + 5,
      w: 1.6,
      h: 2.4,
      yaw: HP,
      mat: "metal_dark",
      tint: 0x5a5e5a,
      lock: K.LOCKS.ml_records,
      label: "Records Vault",
      mode: "slide",
      wheel: true,
      sign: K.paint("ml_vaultsign", 256, 96),
    });
    G.PMID.mlInt = I;
    content(rec, I);
  });
