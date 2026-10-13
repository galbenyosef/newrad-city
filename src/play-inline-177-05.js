// play-inline-177 05 — prop
// Lines 1849-1945 of readable/play-inline-177.pretty.js (statement-aligned).
  function content(rec, I) {
    const C = K.content("msg", rec);
    const { ox, oz, BY, CY } = I;
    C.prop("mattress", ox - 13, 0, oz - 10, 0.1, {});
    C.prop("mattress", ox + 13, 0, oz + 9.5, PI, {});
    C.prop("bed", ox + 17, 0, oz + 41.5, PI, { owned: true });
    C.prop("workbench", ox - 16.5, 0, oz + 10.5, HP, {});
    C.prop("market_stall", ox + 14, 0, oz - 10.5, -HP * 0.9, {});
    C.prop("barrel", ox - 10, 0, oz + 8, 0, { burning: true, collide: false });
    C.prop("barrel", ox + 9, 0, oz - 9, 0, { burning: true, collide: false });
    C.prop("barrel", ox + 12, 0, oz + 9, 0, { burning: true, collide: false });
    C.prop("barrel", ox - 12, 0, oz - 8, 0, { burning: true, collide: false });
    C.prop("radio", ox + 8, 0.76, oz + 12.5, 0.3, {});
    C.prop("first_aid", ox + 27.7, 1.3, oz + 38, -HP, {
      name: "Cutman's Kit",
      owner: "settlers",
      loot: "medical_cabinet",
    });
    C.prop("locker", ox - 27.5, 0, oz + 38.5, HP, {
      count: 2,
      name: "Fighter Locker",
      owner: "settlers",
      loot: "locker",
    });
    C.prop("footlocker", ox - 13.2, 0, oz - 8.2, -HP, {
      name: "Squatter Footlocker",
      owner: "settlers",
      loot: "footlocker",
    });
    C.prop("safe", ox - 5.6, BY, oz - 32.4, 0, {
      name: "Bookie's Strongbox",
      owner: "settlers",
      locked: 0,
      lock: K.LOCKS.msg_strongbox,
      items: [
        ["scrip", 420],
        ["old_dollars", 6],
        ["q_pmid_ledger", 1],
      ],
    });
    C.prop("cash_register", ox - 8, 1.12, oz + 32.2, PI, {
      name: "Concession Till",
      owner: "settlers",
      mount: "bare",
    });
    C.prop("fizzo_machine", ox - 13.4, 0, oz + 35, HP, { owner: "settlers" });
    C.terminal("pmid_msg_promoter", ox - 1, BY + 0.77, oz - 30.5, 0, "bare");
    C.prop("skeleton", ox + 22, CY + 1.0, oz - 9, HP, { pose: "seated" }); // a fan who never left his seat
    C.prop("skeleton", ox - 22.2, CY + 1.5, oz + 6, -HP, { pose: "seated" });
    C.note("pmid_msg_rules", ox + 7.4, 0.77, oz + 12.2, {
      name: "House Rules of The Pit",
      title: "THE PIT — HOUSE RULES (nailed to the table)",
      text: "1. No guns in the ring. Fists, knuckles, clubs, whatever God gave you.\n2. When Mickey rings the bell, you stop. When Brick rings the bell, you run.\n3. Losers buy the next round. Winners buy the round after that.\n4. Bets are settled at Ondine's window, on the concourse. No IOUs, no pills, no old-world money unless it's got a President on it.\n5. Nobody sleeps in the ring.\n6. If you die, you forfeit.\n— Management (Mickey)\n\n(Pencilled in the margin, in Ondine's tiny hand: strongbox 5-7-0-0. Brick's record. Nobody's ever beaten it either.)",
      learn: "pmid_msg_strongbox",
    });
    C.pickup("tunnel_rat_skewer", 2, ox - 10.5, 1.12, oz + 32.0);
    C.pickup("purified_water", 1, ox + 21.4, 0.95, oz + 34.1);
    C.pickup("rally_tonic", 1, ox + 20.2, 0.95, oz + 33.8);
  }

  K.defineSite("msg", 20, function () {
    art();
    const rec = K.record("msg", "msg");
    const ext = buildExterior(rec);
    const I = buildInterior(rec);
    K.door(rec, {
      id: "pmid_msg_front",
      pos: ext.doorPos,
      label: "Madison Square Garden — The Pit",
      verb: "Enter",
      target: I.arrival,
      onEnter: () => K.discover("msg"),
    });
    K.door(rec, {
      id: "pmid_msg_exit",
      pos: I.exitPos,
      label: "Eighth Avenue",
      verb: "Exit to",
      target: ext.outside,
    });
    K.door(rec, {
      id: "pmid_msg_staff_up",
      pos: I.staffUpDoor,
      label: "Staff Stairs — Bookie's Office",
      verb: "Climb",
      target: I.staffUpArrival,
    });
    K.door(rec, {
      id: "pmid_msg_staff_down",
      pos: I.staffDownDoor,
      label: "Staff Stairs — Clinic",
      verb: "Descend",
      target: I.staffDownArrival,
    });
    G.PMID.msgInt = I;
    content(rec, I);
  });
