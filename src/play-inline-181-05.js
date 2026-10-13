// play-inline-181 05 — prop
// Lines 1840-2032 of readable/play-inline-181.pretty.js (statement-aligned).
  function content(rec, I) {
    const C = K.content("bellevue", rec);
    const { ox, oz, MY, LY, MZ0, LX0, OTZ } = I;
    C.prop("desk", ox + 6, 0, oz + 23.6, PI, {
      name: "Admissions Desk",
      loot: "desk",
      mount: "bare",
    });
    C.prop("file_cabinet", ox + 9.4, 0, oz + 21, -HP, {
      name: "Patient Files",
    });
    C.prop("first_aid", ox + 13.7, 1.3, oz + 12, -HP, {
      name: "Nurses' Station Kit",
      loot: "medical_cabinet",
    });
    C.prop("footlocker", ox - 12, 0, oz - 17.5, HP, {
      name: "Brute Stash",
      loot: "brute",
    });
    C.prop("safe", ox + 8.5, 0, oz - 8.4, HP, {
      name: "Narcotics Locker",
      locked: 0,
      lock: K.LOCKS.bv_narcotics,
      items: [
        ["morphine_syrette", 2],
        ["rage", 1],
        ["bull_tabs", 1],
        ["prussian_blue", 2],
      ],
    });
    C.prop("first_aid", ox + 13.7, 1.3, oz + 5, -HP, {
      floor: false,
      name: "Pharmacy Cabinet",
      loot: "medical_cabinet",
    });
    // round 1b (quest walk): the quest items of "Second Opinion" were never placed — the quest could not be finished.
    C.prop("ammo_box", ox + 12.4, 0, oz - 1.2, -HP, {
      name: "Sealed Pharmacy Case",
      items: [
        ["q_pmid_bv_meds", 1],
        ["rally_tonic", 1],
      ],
    });
    C.pickup("q_pmid_bv_keycard", 1, ox + 21.9, MY + 0.06, MZ0 + 3.4); // "the spare — it's in my coat" (the pathologist)
    C.prop("file_cabinet", ox + 23.6, MY, MZ0 + 3.8, -HP, {
      name: "Pathologist's Files",
    });
    C.prop("locker", LX0 + 0.6, LY, oz - 64, HP, {
      count: 2,
      name: "Lab Locker",
      loot: "locker",
    });
    C.prop("ammo_box", ox + 26, LY, oz - 84.5, 0, {
      large: true,
      name: "Kessler-Haas Security Crate",
      loot: "weapon_crate",
    });
    C.prop("first_aid", ox + 31.6, LY + 1.4, oz - 60, -HP, {
      name: "Decon Station",
      items: [
        ["prussian_blue", 3],
        ["iodine_tabs", 2],
        ["rally_tonic", 1],
      ],
    });
    C.prop("barrel", ox + 18, LY, oz - 83, 0, { chem: true });
    C.prop("barrel", ox - 3, LY, oz - 58.5, 0, { radioactive: true });
    C.terminal("pmid_bv_nurse", ox + 6, 1.05, oz + 16.2, -HP, "bare");
    C.terminal("pmid_bv_lab", LX0 + 3.3, LY + 0.77, oz - 74, HP, "bare");
    C.terminal("pmid_bv_door", ox + 15.2, MY, MZ0 + 0.6, 0, "wall");
    C.prop("skeleton", ox - 12.6, 0.62, oz + 14.4, -HP, { pose: "lying" }); // restrained patient
    C.prop("skeleton", ox + 7.2, 0, oz + 2.4, -HP, { pose: "curled" }); // padded cell 3 (straitjacket)
    C.prop("skeleton", ox + 21.5, MY, MZ0 + 2.9, PI, { pose: "lying" }); // the pathologist (keycard)
    C.prop("skeleton", ox + 3.6, -1.0, oz - 38.4, PI, { pose: "seated" }); // a student in the gallery
    C.prop("skeleton", LX0 + 3, LY, oz - 72.8, HP, { pose: "seated" }); // lab chief at the terminal
    C.rad(ox + 5.5, LY + 0.5, oz - 70.5, 6, 3);
    C.rad(ox + 21, LY + 0.5, oz - 77, 6, 3);
    C.note("pmid_bv_intake", ox + 7.4, 1.1, oz + 23.8, {
      name: "Intake Form",
      title: "BELLEVUE PSYCHIATRIC — INTAKE (Mar. 2, 1967)",
      text: "Patient: 'Grogan, T.' — orderly, 34.\nPresenting complaint: patient insists the 'new vitamin shots' the Kessler-Haas people give the night staff 'make the walls breathe'. Complains of thirst, growth pains (!), and hearing the tanks 'singing'.\nDisposition: admitted to Ward B for observation at the request of Dr. Hasselby (Kessler-Haas liaison).\nNote in margin: Hasselby says NO sedatives. Hasselby says 'let him grow.' Ask Admin who Hasselby answers to.",
    });
    C.tape("pmid_bv_hasselby", LX0 + 3.6, LY + 0.8, oz - 73.4, {
      name: "Tape reel: Resilience Study, Final",
      title:
        'Kessler-Haas / Civil Defense Contract VT-BLV-7 — "Resilience" (Dr. M. Hasselby)',
      text: "[Recording]\nFinal entry, Resilience Study, Bellevue annex. Civil Defense wanted to know whether a population could be 'pre-hardened' before sealing — a little K-agent in the flu shots, and your sleepers survive anything.\nThe answer is yes. They survive anything. They also stop being people.\nOrderly Grogan responded best. He is nine feet tall now and he has read every chart in this building. He calls himself Chief Resident. He has started 'treating' the other patients.\nThe sirens are going. Civil Defense's courier never came for the samples. The door is set to seal. God help whoever opens it.\n[End of recording]",
    });
    C.note("pmid_bv_keynote", ox + 21.2, MY + 0.78, MZ0 + 1.8, {
      name: "Pathologist's Note",
      title: "Note taped to the desk",
      text: "Whoever relieves me: the Kessler-Haas people took the annex keycard back but I kept the spare — it's in my coat. Don't use it. Whatever they keep behind that door came through here on a gurney last week and got UP.\nThe cold room is full. I stopped labelling them.\n— Dr. I. Pruitt, Pathology",
    });
    C.note("pmid_bv_chart", ox + 0.6, -0.92, OTZ + 0.9, {
      name: "Surgical Chart (fresh)",
      title: "Chart — scrawled over an old-world surgical form",
      text: "PATIENT: HUMIE (small)\nPROCEDURE: MAKE BIGGER\nRESULT: BROKE\nNEXT PATIENT: TRY GREEN WATER FIRST\n— CHIEF RESIDENT (ME)",
    });
    C.pickup("rally_tonic", 2, ox + 13.2, 1.0, oz - 5.5);
    C.pickup("prussian_blue", 1, ox + 13.2, 1.0, oz + 2.5);
    C.pickup("field_surgery_kit", 1, ox + 6, 1.1, oz + 14);
    C.pickup("focus_pills", 1, LX0 + 2.7, LY + 0.78, oz - 74.3);
  }

  K.defineSite("bellevue", 50, function () {
    art();
    const rec = K.record("bellevue", "bellevue");
    const ext = buildExterior(rec);
    // authored with the morgue and lab below 0; lifted so the K-agent lab floor sits at y = 0
    const OFF = 10;
    K.yOff = OFF;
    let I;
    try {
      I = buildInterior(rec);
      content(rec, I);
      // pharmacy cage (nurses' station → pharmacy) and the sealed Kessler-Haas annex door
      K.gate(rec, {
        id: "pmid_bv_pharmacy",
        x: I.ox + 11.5,
        y: 0,
        z: I.oz + 10,
        w: 1.6,
        h: 2.4,
        yaw: 0,
        mat: "black_metal",
        tint: 0x3a3a38,
        lock: K.LOCKS.bv_pharmacy,
        label: "Pharmacy Cage",
        mode: "hinge",
        sign: K.paint("bv_pharmacy", 256, 96),
      });
      K.gate(rec, {
        id: "pmid_bv_annex",
        x: I.ox + 13,
        y: I.MY,
        z: I.MZ0,
        w: 1.8,
        h: 2.4,
        yaw: 0,
        mat: "metal_dark",
        tint: 0x6a6e60,
        lock: K.LOCKS.bv_annex,
        keyName: "Kessler-Haas Keycard",
        label: "Kessler-Haas Annex Door",
        lockLabel: "Sealed — keycard",
        lockMsg:
          "The Kessler-Haas door is sealed. A keycard reader blinks red.",
        mode: "lift",
        wheel: true,
        sound: "cryo_door",
      });
    } finally {
      K.yOff = 0;
    }
    K.shiftY(I, OFF);
    K.door(rec, {
      id: "pmid_bv_front",
      pos: ext.doorPos,
      label: "Bellevue Hospital",
      verb: "Enter",
      target: I.arrival,
      onEnter: () => K.discover("bellevue"),
    });
    K.door(rec, {
      id: "pmid_bv_exit",
      pos: I.exitPos,
      label: "First Avenue",
      verb: "Exit to",
      target: ext.outside,
    });
    // one-way: barred from the inside until the player leaves through it (not a lock)
    const bay = K.barDoor(
      K.door(rec, {
        id: "pmid_bv_bay_in",
        pos: ext.bayDoor,
        label: "Bellevue — Ambulance Bay",
        verb: "Enter",
        target: I.emergencyArrival,
      }),
      { message: "The ambulance bay doors are barred from the inside." },
    );
    K.door(rec, {
      id: "pmid_bv_bay_out",
      pos: I.emergencyDoor,
      label: "Emergency Exit — Ambulance Bay",
      verb: "Exit to",
      target: ext.bayOutside,
      onEnter: () => {
        if (bay && bay.unbar) bay.unbar();
      },
    });
    G.PMID.bvInt = I;
  });
