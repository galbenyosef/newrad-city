// play-inline-299 02 — cats
// Lines 15-356 of readable/play-inline-299.pretty.js (statement-aligned).
  const PM = G._pm2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2;
  const AN = (name) => PM.anchorOf("algonquin", name);
  const posOf = (a) => (a ? { x: a.x, y: a.y + 0.05, z: a.z } : null);

  Object.assign(PM.flagDefaults, {
    crane_outcome: "",
    park_outcome: "",
    dottie_rumour: 0,
    woolcott_talked: false,
    doc_heals: 0,
  });

  // -------------------------------------------------------------------
  // Items
  // -------------------------------------------------------------------
  PM.item({
    id: "pm2_martini",
    type: "aid",
    name: "Algonquin Martini",
    weight: 0.5,
    value: 20,
    tags: ["drink", "alcohol"],
    sound: "drink",
    effects: {
      hp: 5,
      attrs: { presence: 2, wits: -1 },
      duration: 180,
      rads: 1,
    },
    desc: 'Gin distilled in a bathtub on the ninth floor, vermouth rumoured, olive theoretical. +2 Presence, −1 Wits. "I like to have a martini, two at the very most." — attributed, wrongly, to everyone.',
  });
  PM.item({
    id: "pm2_alg_key207",
    type: "key",
    name: "Algonquin Room Key — 207",
    weight: 0,
    value: 0,
    desc: "A heavy brass room key on a tasselled fob. The tassel has been chewed.",
  });
  PM.item({
    id: "pm2_note_rex",
    type: "note",
    name: "Rex's Stock Sheet",
    title: "Pinned inside a crate lid",
    learn: "pm2_alg_safe",
    weight: 0,
    value: 0,
    tags: ["note"],
    text: "STOCK — R. HARROW\nBooks (assorted) .......... 41\nBullets (assorted) ........ 230\nBooks about bullets ........ 2\n\nStrongbox: 7-1-1-3. If you are not Rex and you are reading this, put it back.",
  });
  PM.item({
    id: "pm2_alg_key204",
    type: "key",
    name: "Algonquin Storeroom Key — 204",
    weight: 0,
    value: 0,
    desc: "Rex Hadley's storeroom key. He will notice it is missing. Eventually.",
  });
  PM.item({
    id: "pm2_alg_pass",
    type: "misc",
    name: "Algonquin Guest Card (Lifetime)",
    weight: 0,
    value: 0,
    desc: 'Signed by Francis Case IV: "The bearer shall have a room at the Algonquin for as long as there is an Algonquin." Room 203 is yours to sleep in, free.',
  });
  PM.item({
    id: "pm2_crane_sketch",
    type: "misc",
    name: 'Penrose Sketch: "The Stranger, Seated"',
    weight: 0.5,
    value: 250,
    desc: "A charcoal sketch of you, by Aldous Penrose, dashed off on the back of a menu at the Round Table. You look braver than you felt.",
  });
  PM.item({
    id: "pm2_note_minutes",
    type: "note",
    name: "Round Table Minutes",
    title: "Minutes of the Round Table, Meeting No. 4,016",
    text: 'Present: A. Penrose (painter, late). E. Park (archivist, early). H. Vey (poet, drunk). F. Case IV (host, sober, disapproving).\n\nOld business: Penrose moved that the Brutes at the Modern be sent a strongly worded letter. Seconded. Nobody volunteered to deliver it.\n\nNew business: Park reports the Morgan Library is "full of Maniacs and first editions". Vey asked whether the Maniacs were also first editions. Laughter. Park did not laugh.\n\nThe cat is missing again. Case asked that everyone check under their beds. Vey found a raider under hers. Resolved: lock the fire escape.',
  });

  // -------------------------------------------------------------------
  // The hotel cat: hiding in room 207 until found, then home on the desk
  // -------------------------------------------------------------------
  const cats = { hide: null, home: null };
  function placeCats() {
    const cell = PM.cells.algonquin;
    if (!cell) return;
    const hideA = AN("cat_hide"),
      homeA = AN("cat_bed");
    if (!cats.hide && hideA) {
      cats.hide = PM.catMesh();
      cats.hide.position.set(hideA.x, hideA.y, hideA.z);
      cats.hide.rotation.y = hideA.yaw || 0;
      cell.root.add(cats.hide);
    }
    if (!cats.home && homeA) {
      cats.home = PM.catMesh();
      cats.home.position.set(homeA.x, homeA.y, homeA.z);
      cats.home.rotation.y = homeA.yaw || 0;
      cell.root.add(cats.home);
    }
    syncCats();
    if (hideA)
      PM.use({
        pos: V3(hideA.x, hideA.y + 0.2, hideA.z),
        radius: 0.5,
        range: 2.6,
        label: "Matilda",
        verb: "Coax",
        enabled: () => !PM.flag("alg_cat_found"),
        onInteract() {
          PM.setFlag("alg_cat_found", true);
          syncCats();
          PM.sfx("ui_select");
          G.notify(
            "Matilda considers you for a long moment, then allows herself to be carried. She smells of mothballs and pigeon.",
            { duration: 6 },
          );
          if (!PM.q.started("pm2_q_cat")) PM.q.start("pm2_q_cat");
          PM.q.set("pm2_q_cat", "return");
        },
      });
    if (homeA)
      PM.use({
        pos: V3(homeA.x, homeA.y + 0.2, homeA.z),
        radius: 0.5,
        range: 2.6,
        label: "Matilda",
        verb: "Pet",
        enabled: () => !!PM.flag("alg_cat_home"),
        onInteract() {
          const n = (PM.flag("alg_cat_pets") || 0) + 1;
          PM.setFlag("alg_cat_pets", n);
          const lines = [
            "Matilda purrs like a rotorcraft idling.",
            "Matilda headbutts your goggles. The Geiger counter clicks, embarrassed.",
            "Matilda tolerates exactly three strokes, then bites. Affectionately.",
            "Matilda closes her eyes. For a moment, the world is not over.",
          ];
          G.notify(lines[n % lines.length], { duration: 5 });
          if (n === 1) {
            PM.xp(10, "Petted the Algonquin cat");
            try {
              G.player.heal(10);
            } catch (e) {
              /* core */
            }
          }
        },
      });
  }
  function syncCats() {
    const found = !!PM.flag("alg_cat_found"),
      home = !!PM.flag("alg_cat_home");
    if (cats.hide) cats.hide.visible = !found;
    if (cats.home) cats.home.visible = home;
  }
  PM.flagWatch.push((k) => {
    if (k === "*" || k === "alg_cat_found" || k === "alg_cat_home") syncCats();
  });
  PM.onReset.push(syncCats);
  PM.onNewGame.push(syncCats);
  PM.onLoaded.push(syncCats);
  PM.onInitDone.push(placeCats);
  // tail flick
  PM.animate(null, 0, (t) => {
    for (const c of [cats.hide, cats.home])
      if (c && c.visible && c.userData.tail)
        c.userData.tail.rotation.y =
          Math.sin(t * 1.7 + (c === cats.home ? 1 : 0)) * 0.6;
  });

  // -------------------------------------------------------------------
  // Room rental
  // -------------------------------------------------------------------
  function sleepInRoom(paid) {
    const a = AN("rental_bed") || AN("rental");
    if (paid) PM.inv.addScrip(-10);
    PM.setFlag("alg_room_rented", true);
    G.fadeTransition(() => {
      if (a) G.player.teleport(a.x + 1.0, a.y + 0.05, a.z + 1.5, PI);
      try {
        if (PM.live("rpg") && G.rpg.sleep) G.rpg.sleep(8, { owned: true });
        else G.player.heal(999);
      } catch (e) {
        /* ignore */
      }
      G.notify(
        "You sleep in Room 203 of the Algonquin. Someone upstairs is typing all night. It is oddly comforting.",
        { duration: 6 },
      );
    }, 1.0);
  }
  PM.onInitDone.push(() => {
    const a = AN("rental_bed");
    if (!a) return;
    PM.use({
      pos: V3(a.x, a.y + 0.7, a.z),
      radius: 0.9,
      range: 2.6,
      label: "Room 203 Bed",
      verb: () =>
        PM.inv.count("pm2_alg_pass") > 0 || PM.flag("alg_room_rented")
          ? "Sleep"
          : "Sleep (rent first)",
      onInteract() {
        if (PM.inv.count("pm2_alg_pass") > 0 || PM.flag("alg_room_rented"))
          sleepInRoom(false);
        else
          G.notify(
            'The bed has a card on the pillow: "Rooms 10 scrip — see the front desk."',
          );
      },
    });
  });

  // -------------------------------------------------------------------
  // Dialogue: Francis Case IV (hotel manager) — rooms, the cat
  // -------------------------------------------------------------------
  PM.dialogue("pm2_dlg_case", {
    start: () => (PM.q.stage("pm2_q_cat") === "return" ? "catback" : "root"),
    nodes: {
      root: {
        text: () =>
          PM.flag("alg_cat_home")
            ? "Welcome back to the Algonquin. Matilda has asked after you. That is to say she sat on your chair."
            : "Good evening, and welcome to the Algonquin. Francis Case, the Fourth. My father managed this hotel before the war; I manage what the war left of it. Will you be staying with us?",
        responses: [
          {
            text: "[10 scrip] I'd like a room for the night.",
            cond: () =>
              PM.inv.scrip() >= 10 && PM.inv.count("pm2_alg_pass") === 0,
            action: () => sleepInRoom(true),
          },
          {
            text: "I'd like to rest in my room.",
            cond: () => PM.inv.count("pm2_alg_pass") > 0,
            action: () => sleepInRoom(false),
          },
          {
            text: "You look worried.",
            cond: () => !PM.q.started("pm2_q_cat"),
            next: "worried",
          },
          {
            text: "About Matilda...",
            cond: () => PM.q.stage("pm2_q_cat") === "find",
            next: "catwhere",
          },
          { text: "Tell me about the hotel.", next: "hotel" },
          { text: "Who else is here?", next: "who" },
          { text: "Good evening, Mr. Case." },
        ],
      },
      worried: {
        text: "Is it so obvious? The hotel cat is missing. Matilda. The ninth of her name, or the twelfth — the records were eaten. There has been a cat at the Algonquin since 1932, through Prohibition, a world war, another world war, and the end of the world. I will not be the Case who lost the cat.",
        responses: [
          {
            text: "I'll find her.",
            action: () => {
              PM.q.start("pm2_q_cat");
              PM.inv.add("pm2_alg_key207", 1);
            },
            next: "catkey",
          },
          { text: "It's a cat. It'll come back.", next: "itsacat" },
        ],
      },
      itsacat: {
        text: "That is precisely what my grandfather said in 1932, and we had no cat for eleven months. Eleven months, stranger. The mice unionised.",
        responses: [
          {
            text: "Fine. I'll look for her.",
            action: () => {
              PM.q.start("pm2_q_cat");
              PM.inv.add("pm2_alg_key207", 1);
            },
            next: "catkey",
          },
          { text: "Good luck with that." },
        ],
      },
      catkey: {
        text: "Bless you. She was last heard upstairs — scratching, behind a door that is locked because the room is... unfit. Room 207. Here is the spare key. If she hisses, that means she likes you. If she doesn't hiss, back away slowly.",
        responses: [{ text: "Room 207. Got it." }],
      },
      catwhere: {
        text: "Room 207, second floor, north side of the corridor. The key I gave you should open it. If you've lost it — well, the lock is old. So am I.",
        responses: [{ text: "On my way." }],
      },
      catback: {
        text: "[He sees the cat under your arm and exhales for what seems like the first time in days.] Matilda. You wretched, perfect animal. [She is placed on her cushion; she immediately ignores everyone.] You have my thanks — and something better than thanks.",
        responses: [
          {
            text: "She's all yours.",
            action: () => {
              PM.setFlag("alg_cat_home", true);
              PM.q.done("pm2_q_cat");
              PM.standing(10, "Returned the Algonquin cat");
            },
            next: "catpass",
          },
        ],
      },
      catpass: {
        text: "A lifetime guest card. Room 203 is yours whenever you need it, free of charge, for as long as there is an Algonquin. And a drink on the house, if Dottie can be persuaded. She usually can't.",
        responses: [{ text: "Thank you, Mr. Case." }],
      },
      hotel: {
        text: "Built 1902. The Round Table met here from 1919 — writers, critics, wits, all of them famous for insulting each other over lunch. We still keep the table. We still keep the lunch, when there is lunch. The insults, sadly, we have in abundance.",
        responses: [
          { text: "And now?", next: "now" },
          { text: "Thanks.", next: "root" },
        ],
      },
      now: {
        text: "Now we are a settlement. Forty-one souls, three floors that don't leak, a bar, a doctor, a bookseller, and an archivist who left the Iron Covenant because they wanted her to copy manuals. We trade in books, drink and gossip. Raiders leave us alone. We are too well-read to be worth robbing.",
        responses: [{ text: "Thanks.", next: "root" }],
      },
      who: {
        text: "Dottie runs the Blue Bar — sharp tongue, sharper gin. Doc Benchley has room 201. Rex Hadley sells books and whatever else fits in a pocket. At the Round Table: Aldous Penrose, a painter, and Archivist Park, who keeps our library. Sergeant Woolcott watches the door. Irving plays the piano. Matilda runs the hotel.",
        responses: [{ text: "Thanks.", next: "root" }],
      },
    },
  });

  // -------------------------------------------------------------------
  // Dottie Parrish (bartender, merchant) — rumours toward MoMA & the Morgan
  // -------------------------------------------------------------------
  const RUMOURS = [
    "Aldous Penrose — the old painter at the Round Table — painted a picture before the war that ended up in the Museum of Modern Art. Now the Modern is full of Brutes who think they're critics. He asks everyone who comes in. Nobody comes back.",
    "Archivist Park wants into the Morgan Library. Three floors of books and a basement full of Maniacs. She says there's a Bible down there older than the Declaration of Independence. I said I'd settle for a bottle older than last Tuesday.",
    "The Critic — big Brute at the Modern, wears a hat. Kills people and arranges them. Leaves little signs. Gives them stars. The worst part is he's not wrong about the drip paintings.",
    "The Morgan's East Room has a hidden staircase behind one of the bookcases. Old staff secret. Everybody knew it. That's the thing about secrets in this town.",
    "Doc Benchley says the glowing puddle under the Morgan is from a burst pipe. A pipe of what, I asked. He changed the subject. Then he changed his gloves.",
    "Somebody keeps leaving Matilda offerings on the fire escape. Mice, mostly. Once a giant roach the size of a shoe. We suspect Irving.",
  ];
