// play-inline-178 06 — prop
// Lines 2110-2221 of readable/play-inline-178.pretty.js (statement-aligned).
  function content(rec, I) {
    const C = K.content("penn_station", rec);
    const { ox, oz, WY, PY, BEDY, TX0 } = I;
    C.prop("cash_register", ox + 0.8, WY + 1.12, oz - 4, 0, {
      name: "Newsstand Till",
      mount: "bare",
    });
    C.prop("safe", ox + 31.6, WY + 0.9, oz - 9, -HP, {
      wall: true,
      name: "Ticket Office Safe",
      locked: 0,
      lock: K.LOCKS.penn_ticket_safe,
      loot: "safe",
    });
    C.prop("file_cabinet", ox + 31.4, WY, oz + 8, -HP, {
      name: "Stationmaster Files",
    });
    C.prop("first_aid", ox - 5.8, 1.4, oz + 40, HP, {
      name: "Arcade First Aid",
      loot: "first_aid",
    });
    C.prop("duffle_bag", ox + 8, PY, oz - 47.6, 0.4, {
      name: "Abandoned Luggage",
    });
    C.prop("footlocker", ox + 20, PY, oz - 48.6, 0, {
      name: "Porter's Trunk",
      loot: "luggage",
    });
    C.prop("safe", TX0 + 8, BEDY + 1.0, oz - 49.2, 0, {
      name: "Broadway Limited Payroll Box",
      locked: 0,
      lock: K.LOCKS.penn_payroll,
      items: [
        ["scrip", 260],
        ["old_dollars", 14],
        ["gold_bar", 1],
      ],
    });
    C.prop("ammo_box", ox + 44, WY, oz - 22.5, 0, {
      name: "Railroad Police Locker",
      loot: "ammo_box",
    });
    C.prop("toolbox", ox + 38.4, PY, oz - 36, 0, {
      name: "Track Crew Toolbox",
      loot: "toolbox",
    });
    C.prop("terminal", ox + 39, WY + 1.12, oz - 1, PI, {
      terminalId: "pmid_penn_station",
      mount: "bare",
    });
    C.prop("skeleton", ox - 12.5, WY + 0.45, oz - 11.8, PI, { pose: "seated" }); // commuters still waiting
    C.prop("skeleton", ox + 17, WY + 0.45, oz - 2, 0, { pose: "seated" });
    C.prop("skeleton", ox + 29.2, WY, oz - 6, -HP, { pose: "curled" }); // clerk behind the ticket counter
    C.prop("skeleton", ox + 12, PY, oz - 48, HP, { pose: "sitting" }); // in the coach
    C.prop("skeleton", ox - 6, WY, oz - 45, 0.5, { pose: "reaching" }); // fell short of the stairs
    C.prop("skeleton", ox - 2, BEDY + 4.3, oz - 50.2, 0.12, { pose: "lying" }); // engineer on the loco roof? (slumped at the cab)
    C.prop("barrel", TX0 + 16, BEDY, oz - 63, 0, { radioactive: true });
    C.rad(TX0 + 11, BEDY + 0.5, oz - 64, 9, 4);
    C.rad(ox - 20, WY + 0.5, oz - 14, 5, 0.6);
    C.tape("pmid_penn_conductor", ox + 12.6, PY + 0.5, oz - 47.4, {
      name: "Tape reel: Last Call",
      title: "Conductor Amos Whitlock — personal recording",
      text: "[Recording, heavy breathing]\nThis is Amos Whitlock, conductor, Broadway Limited, Track 3. It's — it's ten-fifteen. The sirens stopped a while ago. Then the lights.\nWe had the payroll box aboard for the Harrisburg yard. I locked it in the baggage car and put the key where I always do, on my watch chain. If anybody finds this: the combination is my daughter's birthday and I'm not telling you that.\nThe people in the waiting room just sat back down. Like the train might still come.\nI'm going to walk down the tunnel and see about the signal. Somebody has to.\n[End of recording]",
    });
    C.note("pmid_penn_ticket", ox - 1, WY + 1.12, oz - 4.3, {
      name: "Unused Ticket",
      title: "Pennsylvania Railroad — One Way, Coach",
      text: "PENNSYLVANIA RAILROAD\nONE WAY · COACH · NOT GOOD FOR PASSAGE AFTER MAR 5 1967\nNew York (Penn Sta.) → Harrisburg\nTrain 29 'The Broadway Limited' — Car 7, Seat 12\n\nScrawled on the back in pencil: 'Meet me under the clock. If I'm late it's because I'm bringing Ma.'",
    });
    C.note("pmid_penn_notice", ox + 40.2, WY + 1.12, oz - 1.2, {
      name: "Railroad Police Bulletin",
      title: "RAILROAD POLICE — BULLETIN 77-19",
      text: "To all station personnel:\nThe so-called 'track people' have been sighted again in the east tunnels beyond Track 4. They are NOT maintenance crew. Do NOT feed them. Do NOT follow the green light.\nAny employee reporting a 'screaming man in a conductor's cap' will be referred to the company physician.\n— Captain R. Doyle, PRR Police",
    });
    C.pickup("prussian_blue", 1, ox + 40.5, WY + 1.12, oz - 0.9);
    C.pickup("rally_tonic", 1, ox + 30.2, WY + 1.22, oz - 1);
    C.pickup("subway_token", 3, ox - 0.6, WY + 1.12, oz - 3.6);
    C.pickup("fizzo_cola", 2, ox + 5, 0.05, oz + 44);
  }

  K.defineSite("penn_station", 30, function () {
    art();
    const rec = K.record("penn_station", "penn_station");
    const ext = buildExterior(rec);
    // the interior is authored with the platforms below 0 and lifted so the track beds sit at y = 0
    const OFF = 13.2;
    K.yOff = OFF;
    let I;
    try {
      I = buildInterior(rec);
      content(rec, I);
    } finally {
      K.yOff = 0;
    }
    K.shiftY(I, OFF);
    K.door(rec, {
      id: "pmid_penn_front",
      pos: ext.doorPos,
      label: "Pennsylvania Station",
      verb: "Enter",
      target: I.arrival,
      onEnter: () => K.discover("penn_station"),
    });
    K.door(rec, {
      id: "pmid_penn_exit",
      pos: I.exitPos,
      label: "Seventh Avenue",
      verb: "Exit to",
      target: ext.outside,
    });
    G.PMID.pennInt = I;
  });
