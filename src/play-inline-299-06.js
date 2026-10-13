// play-inline-299 06 — pos
// Lines 1016-1340 of readable/play-inline-299.pretty.js (statement-aligned).
  PM.onInitDone.push(() => {
    const A = (n) => posOf(AN(n));
    const yawOf = (n) => {
      const a = AN(n);
      return a ? a.yaw || 0 : 0;
    };
    const base = {
      type: "human",
      faction: "settlers",
      essential: true,
      weapon: "none",
    };
    const spawnDef = (d) => {
      if (d.pos) PM.npc(d);
    };
    spawnDef(
      Object.assign({}, base, {
        id: "pm2_alg_case",
        name: "Francis Case IV",
        outfit: "merchant",
        gender: "m",
        level: 5,
        pos: A("manager"),
        yaw: yawOf("manager"),
        ai: "guard",
        home: {
          x: A("manager") && A("manager").x,
          z: A("manager") && A("manager").z,
          r: 1.5,
        },
        dialogue: "pm2_dlg_case",
        voice: "merchant",
        seed: 7201,
        barks: [
          "Welcome to the Algonquin.",
          "Has anyone seen the cat?",
          "Please, no firearms in the lobby.",
          "The Round Table is by reservation. The reservation is being interesting.",
        ],
      }),
    );
    spawnDef(
      Object.assign({}, base, {
        id: "pm2_alg_dottie",
        name: "Dottie Parrish",
        outfit: "settler",
        gender: "f",
        level: 6,
        pos: A("bartender"),
        yaw: yawOf("bartender"),
        ai: "guard",
        home: {
          x: A("bartender") && A("bartender").x,
          z: A("bartender") && A("bartender").z,
          r: 2.5,
        },
        dialogue: "pm2_dlg_dottie",
        voice: "merchant",
        seed: 7202,
        merchant: {
          scrip: 450,
          stock: [
            ["pm2_martini", 8],
            ["beer", 6],
            ["whiskey", 4],
            ["scotch", 2],
            ["vodka", 2],
            ["purified_water", 6],
            ["fizzo_cola", 4],
            ["prairie_root_beer", 3],
            ["egg_cream", 2],
            ["bodega_pretzel", 3],
          ],
          restock: 3,
        },
        barks: [
          "Gin's fresh. Define fresh.",
          "Tip jar's the skull on the left.",
          "You look like a martini. That wasn't a compliment.",
        ],
      }),
    );
    spawnDef(
      Object.assign({}, base, {
        id: "pm2_alg_crane",
        name: "Aldous Penrose",
        outfit: "survivor_layers",
        gender: "m",
        burn: "L",
        level: 5,
        pos: A("seat_crane"),
        yaw: yawOf("seat_crane"),
        ai: "sit",
        home: {
          x: A("seat_crane") && A("seat_crane").x,
          z: A("seat_crane") && A("seat_crane").z,
          r: 0.3,
        },
        dialogue: "pm2_dlg_crane",
        voice: "settler",
        seed: 7203,
        barks: [
          "Everyone's a critic. Some of them are also Brutes.",
          "I was promising, once.",
          "Light is just paint that hasn't landed yet.",
        ],
      }),
    );
    spawnDef(
      Object.assign({}, base, {
        id: "pm2_alg_park",
        name: "Archivist Evangeline Park",
        outfit: "lab_coat",
        gender: "f",
        level: 7,
        pos: A("seat_park"),
        yaw: yawOf("seat_park"),
        ai: "sit",
        home: {
          x: A("seat_park") && A("seat_park").x,
          z: A("seat_park") && A("seat_park").z,
          r: 0.3,
        },
        dialogue: "pm2_dlg_park",
        voice: "settler",
        seed: 7204,
        weapon: "gyrojet_pistol",
        barks: [
          "Knowledge is not a weapon. It's a lamp.",
          "Page one hundred and six...",
          "Quiet, please. The books are listening.",
        ],
      }),
    );
    spawnDef(
      Object.assign({}, base, {
        id: "pm2_alg_benchley",
        name: "Doc Benchley",
        outfit: "doctor",
        gender: "m",
        level: 6,
        pos: A("doctor"),
        yaw: yawOf("doctor"),
        ai: "guard",
        home: {
          x: A("doctor") && A("doctor").x,
          z: A("doctor") && A("doctor").z,
          r: 1.5,
        },
        dialogue: "pm2_dlg_benchley",
        voice: "settler",
        seed: 7205,
        merchant: {
          scrip: 400,
          stock: [
            ["rally_tonic", 6],
            ["prussian_blue", 3],
            ["iodine_tabs", 3],
            ["morphine_syrette", 1],
            ["purified_water", 4],
            ["field_surgery_kit", 1],
          ],
          restock: 3,
        },
        barks: [
          'Say "ahh". Not you. The other you.',
          "I have a bedside manner. The bed is somewhere.",
          "Rally Tonic: now with 20% fewer side effects.",
        ],
      }),
    );
    spawnDef(
      Object.assign({}, base, {
        id: "pm2_alg_rex",
        name: "Rex Hadley",
        outfit: "merchant",
        gender: "m",
        level: 6,
        pos: A("merchant"),
        yaw: yawOf("merchant"),
        ai: "guard",
        home: {
          x: A("merchant") && A("merchant").x,
          z: A("merchant") && A("merchant").z,
          r: 1.2,
        },
        dialogue: "pm2_dlg_rex",
        voice: "merchant",
        seed: 7206,
        weapon: "pistol_10mm",
        merchant: {
          scrip: 700,
          stock: [
            ["book_handyman", 1],
            ["book_demolitions", 1],
            ["book_survival_handbook", 1],
            ["old_world_book", 4],
            ["ammo_10mm", 60],
            ["ammo_556", 30],
            ["ammo_gyrojet", 18],
            ["scrap_metal", 10],
            ["dry_cell", 2],
            ["rally_tonic", 2],
            ["fedora", 1],
            ["reading_glasses", 1],
            ["typewriter", 1],
          ],
          restock: 3,
        },
        barks: [
          "Books! Bullets! Books about bullets!",
          "Everything's for sale. Especially that.",
          "Cash, scrip, or a good story.",
        ],
      }),
    );
    spawnDef(
      Object.assign({}, base, {
        id: "pm2_alg_woolcott",
        name: "Sgt. Woolcott",
        outfit: "combat_armor",
        gender: "m",
        level: 9,
        essential: false,
        pos: A("guard1"),
        yaw: PI,
        ai: "guard",
        home: {
          x: A("guard1") && A("guard1").x,
          z: A("guard1") && A("guard1").z,
          r: 3,
        },
        dialogue: "pm2_dlg_woolcott",
        voice: "guard",
        seed: 7207,
        weapon: "hunting_rifle",
        barks: [
          "Holster it, friend.",
          "Round Table's open. Behave.",
          "Nobody insults the poetry.",
        ],
      }),
    );
    spawnDef(
      Object.assign({}, base, {
        id: "pm2_alg_irving",
        name: "Irving",
        outfit: "settler",
        gender: "m",
        level: 3,
        pos: A("pianist"),
        yaw: yawOf("pianist"),
        ai: "sit",
        home: {
          x: A("pianist") && A("pianist").x,
          z: A("pianist") && A("pianist").z,
          r: 0.3,
        },
        voice: "settler",
        seed: 7208,
        barks: [
          "[He plays something slow in a key that no longer exists.]",
          'This one\'s called "Ruins in the Rain".',
          "Requests cost extra. Silence costs double.",
        ],
      }),
    );
    spawnDef(
      Object.assign({}, base, {
        id: "pm2_alg_hazel",
        name: "Hazel Vey",
        outfit: "drifter",
        gender: "f",
        level: 3,
        pos: A("seat_hazel"),
        yaw: yawOf("seat_hazel"),
        ai: "sit",
        home: {
          x: A("seat_hazel") && A("seat_hazel").x,
          z: A("seat_hazel") && A("seat_hazel").z,
          r: 0.3,
        },
        voice: "settler",
        seed: 7209,
        barks: [
          "stingers are poems with the rhyme scheme removed.",
          "I'd tell you my best line, but you'd steal it.",
          "Brevity is the soul of wit. Bullets are the soul of brevity.",
        ],
      }),
    );
    spawnDef(
      Object.assign({}, base, {
        id: "pm2_alg_guard2",
        name: "Round Table Guard",
        outfit: "leather_armor",
        gender: "f",
        level: 6,
        essential: false,
        pos: A("guard2"),
        yaw: PI,
        ai: "guard",
        home: {
          x: A("guard2") && A("guard2").x,
          z: A("guard2") && A("guard2").z,
          r: 3,
        },
        voice: "guard",
        seed: 7210,
        weapon: "pistol_10mm",
        barks: ["Keep moving.", "Nice night for it."],
      }),
    );
    // the minutes on the round table
    const t = AN("table");
    if (t)
      PM.pickupNow("pm2_note_minutes", 1, V3(t.x + 0.6, t.y + 0.84, t.z - 0.4));
  });
  /** Pickup that is spawned right away (content registered at initDone). */
  PM.pickupNow = function (id, n, pos) {
    if (PM.live("items") && typeof G.items.spawnPickup === "function")
      PM.safe("pickup:" + id, () =>
        G.items.spawnPickup(id, n || 1, pos, { static: true }),
      );
  };
