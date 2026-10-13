// play-inline-175 06 — prop
// Lines 2500-2723 of readable/play-inline-175.pretty.js (statement-aligned).
  function content(rec, I) {
    const C = K.content("waldorf", rec);
    const { ox, oz, YL, SX, SZ, SY0, BZ0 } = I;
    // loot
    C.prop("desk", ox + 5.5, 0, oz + 44, -HP, {
      name: "Continuity Checkpoint Desk",
      loot: "continuity",
    });
    C.prop("cash_register", ox + 11.4, YL + 1.2, oz + 23, -HP, {
      name: "Front Desk Register",
      mount: "bare",
    });
    C.prop("safe", ox + 14.6, YL + 0.9, oz + 26.5, -HP, {
      wall: true,
      name: "Front Desk Safe",
      locked: 0,
      lock: K.LOCKS.wa_desk_safe,
      loot: "safe",
    });
    C.prop("first_aid", ox - 14.7, YL + 1.4, oz + 30, HP, {
      name: "Lobby First Aid",
      loot: "first_aid",
    });
    C.prop("fridge", ox + 6, YL, oz - 12.5, HP, {
      name: "Kitchen Refrigerator",
    });
    C.prop("file_cabinet", ox + 15.4, YL, oz - 19, -HP, {
      name: "Service Ledger Cabinet",
    });
    C.prop("ammo_box", ox + 5.5, YL, oz - 29, 0, {
      large: true,
      name: "Continuity Ammo Crate",
      loot: "continuity_crate",
    });
    C.prop("crate", ox + 9, YL, oz - 54.5, 0.3, {
      kind: "army",
      name: "Continuity Supply Crate",
      loot: "continuity_crate",
      container: true,
    });
    C.prop("footlocker", ox + 14.2, YL + 5.5, oz - 34, -HP, {
      name: "Balcony Footlocker",
      loot: "footlocker",
    });
    C.prop("footlocker", SX + 11, SY0, SZ - 14, PI, {
      name: "Exo-rig Spares",
      loot: "continuity_crate",
      locked: 0,
      lock: K.LOCKS.wa_spares,
    });
    C.prop("locker", SX + 0.6, SY0, SZ - 16, HP, {
      count: 3,
      name: "Continuity Locker",
      loot: "continuity",
    });
    C.prop("ammo_box", SX + 8, SY0, SZ - 14, 0, {
      large: true,
      name: "Gyrojet Rocket Crate",
      items: [
        ["ammo_gyrojet", 40],
        ["riot_gas_grenade", 2],
      ],
    });
    C.prop("safe", SX + 31.6, SY0 + 1.0, SZ - 27, -HP, {
      wall: true,
      name: "Major Vale's Safe",
      locked: 0,
      lock: K.LOCKS.wa_vale_safe,
      items: [
        ["scrip", 350],
        ["continuity_officer_cap", 1],
        ["exo_rig_mk3_helmet", 1],
        ["q_pmid_wa_codes", 1],
      ],
    });
    C.prop("first_aid", SX + 0.6, SY0 + 1.4, SZ - 26, HP, {
      name: "Field Medkit",
      loot: "first_aid",
    });
    // Continuity auto-turrets: one guarding the command room from the stair hall, one on the ballroom stage
    C.prop("turret", SX + 18.5, SY0, SZ + 5.5, PI * 0.75, {
      continuity: true,
      faction: "continuity",
      hostile: true,
      group: "pmid_wa_turrets",
      hp: 90,
      damage: 6,
      range: 26,
    });
    C.prop("turret", ox + 5.5, YL + 1.2, oz - 57.5, 0, {
      continuity: true,
      faction: "continuity",
      hostile: true,
      group: "pmid_wa_turrets",
      hp: 90,
      damage: 6,
      range: 30,
    });
    // hazard: the radio room's overloaded jammer bus bars arc behind the consoles
    K.hazard({
      x: SX + 29.8,
      y: SY0 + 1.2,
      z: SZ - 1,
      r: 1.1,
      dps: 12,
      kind: "shock",
      every: 0.8,
    });
    // terminals
    C.terminal("pmid_wa_command", SX + 26, SY0 + 0.77, SZ - 3.3, -HP, "bare");
    C.terminal("pmid_wa_major", SX + 21.2, SY0 + 0.8, SZ - 25.5, PI, "bare");
    C.terminal(
      "pmid_wa_frontdesk",
      ox + 11.5,
      YL + 1.2,
      oz + 18.5,
      -HP,
      "bare",
    );
    // skeleton vignettes (FO-style storytelling)
    C.prop("skeleton", ox + 3.8, YL, oz - 18, -HP, { pose: "sitting" }); // bartender slumped behind the bar
    C.prop("skeleton", ox - 3.6, YL, oz + 19.8, 0.4, { pose: "reaching" }); // reaching for the clock
    C.prop("skeleton", ox - 9, YL, oz - 44.5, 0.2, { pose: "seated" }); // gala guests
    C.prop("skeleton", ox + 3, YL, oz - 38.6, -2.5, { pose: "seated" });
    C.prop("skeleton", ox - 3, YL, oz - 49.2, 1.2, { pose: "lying" });
    C.prop("skeleton", ox + 12.5, YL, oz + 30.5, PI, { pose: "curled" }); // behind the reception desk
    C.prop("skeleton", SX + 23.8, SY0, SZ - 26.6, 0, { pose: "lying" }); // a old-world Secret Service man still in the study
    // notes & tape reels
    C.note("pmid_wa_gala_menu", ox - 3.2, YL + 0.78, oz - 44.5, {
      name: "Winter Gala Menu",
      title: "The Waldorf-Astoria — Winter Gala Breakfast, March 5th, 1967",
      text: "THE WALDORF-ASTORIA\nWinter Gala Breakfast in Honour of the Civil Defense Board of Directors\nSunday, March the Fifth, 1967, at Nine O\'Clock\n\n— Oeufs Bénédictine\n— Terrine of Pack oxen-Fed Veal (Imported from California!)\n— Lobster Thermidor, Atomic Style\n— The Waldorf Salad (the original, since 1896)\n— Fizzo Cola Sorbet with Gold Leaf\n\nDancing to the Lester Kane Orchestra from 10:00 A.M.\nGuests are kindly reminded that civil defence drills will NOT interrupt the champagne course.",
    });
    C.note("pmid_wa_bellhop", ox + 12.8, YL + 1.23, oz + 25, {
      name: "Bellhop's Note",
      title: "Note left on the front desk",
      text: "Mr. Garrity —\nThe gentlemen from Suite 35-A (the ones with the black cars and no luggage) say the Towers staircase is 'off limits to civilian staff, effective immediately'. They also took the master keys, the switchboard, and Mrs. Hopkins' radio.\nI said we'd have to bill them. The tall one laughed. I don't think they're from the State Department.\n— Eddie, Bell Captain\n\nP.S. Front desk safe is 1-9-3-1, same as ever.",
      learn: "pmid_wa_desk_safe",
    });
    C.tape("pmid_wa_log1", ox + 11.2, YL + 0.95, oz - 4.6, {
      name: "Continuity Tape reel: Kitchen Duty",
      title: "Continuity field log — Pvt. Oduya",
      text: "[Recording]\nDay 41 at the hotel. They have us boiling giant roach in a kitchen built for three thousand covers. Sergeant says the Major wants 'morale'. Morale is a sorbet machine that still works.\nThe jammer on the roof hums all night. You can hear the Radio City DJ trying to punch through — the Major calls it 'the frequency problem'.\nI hum along with him when nobody's listening. Don't tell the Major.\n[End of recording]",
    });
    C.tape("pmid_wa_log2", SX + 23.5, SY0 + 0.82, SZ - 25.2, {
      name: "Major Vale's Orders",
      title: "Operation PARK AVENUE — orders of the day",
      text: "[Recording — Major Constance Vale, Continuity Forward Command, Suite 35-A]\nPriority one: maintain the jamming screen on 97.3. The settlers at Grand Central must not organise around that disc jockey.\nPriority two: retrieve the Kessler-Haas material from the Bellevue sub-basement. The Brutes took the east wards. I want the K-agent stock intact and the 'Resilience' data on my desk. No survivors, no witnesses.\nPriority three: the Covenant at Rockefeller is not to be engaged until Liberty Station says so.\nPersonal: my teletype word is ROUGHRIDER. If you are not me, stop listening.\nGod bless the Continuity, and God bless America. Vale out.",
      learn: "pmid_wa_major",
    });
    C.pickup("rally_tonic", 2, SX + 8.2, SY0 + 0.86, SZ - 0.8);
    C.pickup("pmid_wa_dray_card", 1, SX + 7.4, SY0 + 0.86, SZ - 1.0); // Lt. Dray's signals card: password for the command terminal
    C.pickup("fizzo_cola", 1, ox + 7.2, YL + 1.23, oz - 16);
    C.pickup("whiskey", 1, ox + 3.7, YL + 1.2, oz - 20.5);
    C.pickup("ammo_gyrojet", 12, ox + 9.4, YL + 0.3, oz - 53.8);
    C.bobble("CHA", SX + 22.6, SY0 + 0.84, SZ - 25.4);
  }

  // ------------------------------------------------------------------
  K.defineSite("waldorf", 10, function () {
    art();
    const rec = K.record("waldorf", "waldorf");
    const ext = buildExterior(rec);
    const I = buildInterior(rec);
    // doors
    K.door(rec, {
      id: "pmid_wa_front",
      pos: ext.doorPos,
      label: "Waldorf-Astoria",
      verb: "Enter",
      target: I.arrival,
      onEnter: () => {
        K.discover("waldorf");
        if (K.startDeadAir) K.startDeadAir();
      },
    });
    K.door(rec, {
      id: "pmid_wa_exit",
      pos: I.exitPos,
      label: "Park Avenue",
      verb: "Exit to",
      target: ext.outside,
    });
    K.door(rec, {
      id: "pmid_wa_towers",
      pos: I.towersDoor,
      label: "Towers Staircase — 35th Floor",
      verb: "Climb",
      target: I.suiteArrival,
    });
    K.door(rec, {
      id: "pmid_wa_towers_down",
      pos: I.suiteStairDoor,
      label: "Towers Staircase — Grand Ballroom",
      verb: "Descend",
      target: I.towersTarget,
    });
    // one-way: the service car is parked on 35 until the player rides it down once (not a lock)
    const lower = K.barDoor(
      K.door(rec, {
        id: "pmid_wa_svc_low",
        pos: I.svcLowerDoor,
        label: "Service Elevator — 35th Floor",
        verb: "Ride",
        target: I.svcUpperArrival,
      }),
      {
        lockText: "Called from the 35th floor only",
        message:
          "The service car is parked on the 35th floor. The call button is dead.",
      },
    );
    K.door(rec, {
      id: "pmid_wa_svc_up",
      pos: I.svcUpperDoor,
      label: "Service Elevator — Kitchen",
      verb: "Ride",
      target: I.svcLowerArrival,
      onEnter: () => {
        if (lower && lower.unbar) lower.unbar(true);
      },
    });
    content(rec, I);
  });
