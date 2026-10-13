/* src/poi_midtown2/80_content.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 2 — 80_content.js
 * The Round Table (Algonquin settlement): named NPCs, dialogue, merchant
 * stock, the hotel cat, room rental — and the module's three side quests:
 *   pm2_q_cat     "Nine Lives"            (Francis Case IV — find Matilda in room 207)
 *   pm2_q_critic  "Everyone's a Critic"   (Aldous Penrose — his painting from MoMA)
 *   pm2_q_archivist  "Ink and Ash"           (Archivist Evangeline Park — the Morgan's Gutenberg Bible)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pm2) return;
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
  PM.dialogue("pm2_dlg_dottie", {
    start: "root",
    nodes: {
      root: {
        text: () =>
          PM.flag("dottie_rumour")
            ? "You again. The usual? We don't have a usual. We have gin."
            : "Welcome to the Blue Bar, where the lighting is flattering and the company is not. I'm Dottie. What'll it be — drink, gossip, or both, in that order?",
        responses: [
          {
            text: "[5 scrip] An Algonquin Martini.",
            cond: () => PM.inv.scrip() >= 5,
            action: () => {
              PM.inv.addScrip(-5);
              PM.inv.add("pm2_martini", 1);
            },
            next: "martini",
            repeatable: true,
          },
          {
            text: "On the house, Mr. Case says. (Returned the cat)",
            cond: () => !!PM.flag("alg_cat_home") && !PM.flag("dottie_free"),
            action: () => {
              PM.setFlag("dottie_free", true);
              PM.inv.add("pm2_martini", 2);
            },
            next: "free",
          },
          {
            text: "Heard anything interesting?",
            next: "rumour",
            repeatable: true,
          },
          { text: "Let's trade.", barter: true },
          { text: "Why the Blue Bar?", next: "blue" },
          { text: "Later, Dottie." },
        ],
      },
      martini: {
        text: "One martini. Bathtub gin, a whisper of vermouth, and an olive we have all agreed to believe in. Try not to fall into anything.",
        responses: [{ text: "Cheers." }],
      },
      free: {
        text: "Two, then, on the Case account. [She pours.] You found the cat. You're the most popular person in this hotel, which I realise is a low bar. Ha. Bar.",
        responses: [{ text: "Cheers." }],
      },
      rumour: {
        text: () => {
          const i = (PM.flag("dottie_rumour") || 0) % RUMOURS.length;
          PM.setFlag("dottie_rumour", (PM.flag("dottie_rumour") || 0) + 1);
          return RUMOURS[i];
        },
        responses: [
          { text: "Anything else?", next: "rumour", repeatable: true },
          { text: "Thanks.", next: "root" },
        ],
      },
      blue: {
        text: "The lights. Before the war they were blue on purpose. Now they're blue because the only neon Rex could find was blue. Also, the drawings on the walls — caricatures of the old Round Table crowd. I talk to them when it's quiet. They never interrupt. Unlike some people.",
        responses: [{ text: "Noted.", next: "root" }],
      },
    },
  });

  // -------------------------------------------------------------------
  // Aldous Penrose (painter, burned in '67) — "Everyone's a Critic"
  // -------------------------------------------------------------------
  function giveNocturne(how) {
    PM.inv.remove("pm2_nocturne", 1);
    PM.setFlag("crane_outcome", how);
    if (how === "gift") {
      PM.standing(25, "Returned Penrose's painting");
      PM.inv.add("pm2_crane_sketch", 1);
      PM.inv.addScrip(150);
    } else if (how === "bargain") {
      PM.inv.addScrip(300);
    }
    PM.q.done("pm2_q_critic");
    PM.news(
      "A painting has come home to the Algonquin. Aldous Penrose, painter and Round Table regular, reportedly wept, then complained about the frame.",
    );
  }
  PM.dialogue("pm2_dlg_crane", {
    start: () =>
      PM.inv.count("pm2_nocturne") > 0
        ? "have"
        : PM.q.complete("pm2_q_critic")
          ? "after"
          : "root",
    nodes: {
      root: {
        text: 'Aldous Penrose. Painter. Before the war I was "promising". Now I\'m "well preserved", like a pickle. [He gestures at the old burns down one side of his face.] You\'re staring. Everybody stares. At least stare at the brushwork.',
        responses: [
          {
            text: "I hear you have a painting in the Museum of Modern Art.",
            cond: () => !PM.q.started("pm2_q_critic"),
            next: "painting",
          },
          {
            text: "About your painting...",
            cond: () => PM.q.active("pm2_q_critic"),
            next: "progress",
          },
          { text: "What was the Round Table?", next: "table" },
          { text: "Goodbye, Aldous." },
        ],
      },
      painting: {
        text: '"Nocturne for a Dying City." Oil, 1966. I painted it on the roof of this hotel. The Modern bought it that winter, in January of \'67 — the only time in my life anyone important agreed with me. Six weeks later the city agreed with me too. Rather emphatically.',
        responses: [{ text: "And now?", next: "now" }],
      },
      now: {
        text: 'Now the Modern belongs to Brutes who call themselves critics. Their leader wears a beret. A BERET. I have heard they "review" visitors, and that the reviews are not kind. I would like to see my painting once more before my eyes finish going. Would you bring it to me?',
        responses: [
          {
            text: "I'll get your painting back.",
            action: () => PM.q.start("pm2_q_critic"),
            next: "go",
          },
          {
            text: "[Persuasion 35] What's in it for me?",
            check: { skill: "persuasion", value: 35 },
            next: "pay",
            failNext: "nopay",
          },
          { text: "Not a chance. Brutes." },
        ],
      },
      pay: {
        text: "Honesty! How refreshing. A hundred and fifty scrip — all of it — and a portrait of you, by me, which will one day be worth considerably more than a hundred and fifty scrip. Or nothing. Art is a gamble. So is walking into the Modern.",
        responses: [
          {
            text: "Deal.",
            action: () => PM.q.start("pm2_q_critic"),
            next: "go",
          },
        ],
      },
      nopay: {
        text: "In it for you? The satisfaction of a job well done, the gratitude of an old man with a bar tab, and a mention in my memoirs. The memoirs are one page long. It's a very good page.",
        responses: [
          {
            text: "Fine. I'll do it.",
            action: () => PM.q.start("pm2_q_critic"),
            next: "go",
          },
          { text: "Pass." },
        ],
      },
      go: {
        text: "The museum is on 53rd, between Fifth and Sixth — the white building with the milky glass and the roof full of holes. The curators would have hidden it somewhere safe. Curators always do. Mind the man in the beret.",
        responses: [{ text: "I'll be back." }],
      },
      progress: {
        text: "Any news of my Nocturne? The Modern is on 53rd. If the curators hid it, it'll be in storage — third floor, if memory serves. My memory serves. My knees do not.",
        responses: [{ text: "Working on it." }],
      },
      have: {
        text: "[He stops breathing. For a moment you wonder whether to fetch Cutman Ike.] That's — that's it. Look at the moon. I painted that moon green because I was angry. And now — [He turns the canvas over.] \"GOOD. MAKE CRITIC SAD. 5 STARS.\" [Long silence.] Twenty-two years. My only review. From a Brute. [He laughs until he coughs.] Five stars!",
        responses: [
          {
            text: "It's yours. Welcome home, Nocturne.",
            action: () => giveNocturne("gift"),
            next: "thanks",
          },
          {
            text: "[Barter] A five-star painting is worth more than 150 scrip.",
            check: { skill: "trade", value: 45 },
            action: () => giveNocturne("bargain"),
            next: "bargained",
            failNext: "nobargain",
          },
          { text: "I think I'll hold on to it.", next: "keep" },
        ],
      },
      thanks: {
        text: "Sit. No — stay exactly like that. [He sketches you in charcoal on the back of a menu in four furious minutes.] There. The Stranger, Seated. And the scrip, as promised. Now go away before I get sentimental. It's terrible for the skin.",
        responses: [{ text: "Thank you, Aldous." }],
      },
      bargained: {
        text: "Three hundred! You'd have made a fine gallerist — utterly without shame. Take it. The painting is worth it. Everything else in my life has been worth considerably less.",
        responses: [{ text: "Pleasure doing business." }],
      },
      nobargain: {
        text: "My dear, I am a painter with a bar tab. A hundred and fifty scrip and a portrait. Take it or keep the painting and hang it over your bed so it can stare at you.",
        responses: [
          {
            text: "Fine. It's yours.",
            action: () => giveNocturne("gift"),
            next: "thanks",
          },
          { text: "I'll keep it.", next: "keep" },
        ],
      },
      keep: {
        text: "Then keep it somewhere dry. And when you look at it, think of me, and feel appropriately guilty. [Rex Hadley, at his stall, has noticed the canvas. He is pretending not to.]",
        responses: [{ text: "Goodbye." }],
      },
      after: {
        text: () =>
          PM.flag("crane_outcome") === "sold"
            ? 'Rex tells me my painting went to "a private collector". I know what that means. It means you. It means scrip. [He turns back to his drink.] I hope they were worth it.'
            : "The Nocturne hangs in my room now. I look at it every morning. Some mornings it looks back. Five stars. Ha.",
        responses: [{ text: "Goodbye, Aldous." }],
      },
      table: {
        text: "The original Round Table: writers and critics who lunched here every day in the twenties, trading insults like other people trade recipes. We revived it in '72. Same table, same insults, fewer teeth. Everyone at this table is a writer, a critic, or a liar — the categories overlap considerably.",
        responses: [{ text: "Goodbye." }],
      },
    },
  });

  // -------------------------------------------------------------------
  // Archivist Evangeline Park (ex-Covenant archivist) — "Ink and Ash"
  // -------------------------------------------------------------------
  function giveBible(how) {
    PM.inv.remove("pm2_gutenberg", 1);
    PM.setFlag("park_outcome", how);
    if (how === "gift") {
      PM.standing(35, "Gave the Gutenberg Bible to the Algonquin library");
      PM.inv.addScrip(200);
      PM.inv.add("book_art_of_the_pitch", 1);
      PM.inv.add("book_popular_circuits", 1);
    } else if (how === "more") {
      PM.inv.addScrip(400);
      PM.inv.add("book_popular_circuits", 1);
    }
    PM.q.done("pm2_q_archivist");
    PM.news(
      "Rumour from the Algonquin: a Gutenberg Bible has come up from the Morgan Library's vault — the oldest book in Manhattan now has a library card.",
    );
  }
  PM.dialogue("pm2_dlg_park", {
    start: () =>
      PM.inv.count("pm2_gutenberg") > 0
        ? "have"
        : PM.q.complete("pm2_q_archivist")
          ? "after"
          : "root",
    nodes: {
      root: {
        text: "Archivist Evangeline Park. Formerly of the Iron Covenant, Records division. I left because they wanted me to copy tank manuals for the rest of my life. I wanted to copy something that mattered. [She taps a stack of salvaged books.] This is the Algonquin library. It is small. I intend to fix that.",
        responses: [
          {
            text: "What are you looking for?",
            cond: () => !PM.q.started("pm2_q_archivist"),
            next: "want",
          },
          {
            text: "About the Morgan Library...",
            cond: () => PM.q.active("pm2_q_archivist"),
            next: "progress",
          },
          { text: "Why did you really leave the Covenant?", next: "why" },
          { text: "Goodbye, Archivist." },
        ],
      },
      want: {
        text: "The Morgan Library, on 36th Street. J. P. Morgan bought three Gutenberg Bibles — the first books ever printed with movable type. Before the war, the director moved them into a rare-book vault under the building. The building is now a Maniac nest. The vault, as far as I know, is intact.",
        responses: [{ text: "You want me to bring you a Bible.", next: "ask" }],
      },
      ask: {
        text: "I want you to bring the world a Bible. I will copy it, page by page, and send copies to every settlement that can read. The Covenant hoards knowledge in its Hold. I would rather it walked around. Will you go?",
        responses: [
          {
            text: "I'll get it.",
            action: () => PM.q.start("pm2_q_archivist"),
            next: "how",
          },
          {
            text: "[Wits 7] Movable type, 1455. Mainz. You don't need all three, just one intact volume.",
            check: { attr: "wits", value: 7 },
            action: () => PM.q.start("pm2_q_archivist"),
            next: "smart",
            failNext: "how",
          },
          { text: "Maniacs? No thanks." },
        ],
      },
      smart: {
        text: "[She actually smiles.] Finally, someone who reads. Yes — one volume, whichever survived. Take this, for the stacks. [She hands you a bottle of Prussian Blue.] The water glows down there, I'm told. The reading lamps do not.",
        onEnter() {
          if (!PM.flag("park_purge")) {
            PM.setFlag("park_purge", true);
            PM.inv.add("prussian_blue", 1);
          }
        },
        responses: [{ text: "I'll be careful.", next: "how" }],
      },
      how: {
        learn: "pm2_term_morgan",
        text: "The director — Belle da Costa Greene's successors kept the tradition — would have kept the vault combination close. Her teletype word was always BELLE; every reader in the building knew it. Her office was the North Room, off the rotunda. Morgan's own vault is in his study, the red room. The stacks are below. Bring a light. Bring a gun. Bring the Bible.",
        responses: [{ text: "On my way." }],
      },
      progress: {
        text: "The Morgan is on 36th, between Madison and Park — a marble box with no windows and two stone lionesses. The vault combination should be in the director's office. If you find anything else worth reading, I am always buying.",
        responses: [{ text: "I'll keep looking." }],
      },
      have: {
        text: "[She takes the book with both hands, the way people used to hold newborns.] Vol. I. The paper is sound. The binding is — hot. Radiologically. I'll wear gloves. [She turns a page and does not speak for some time.] Do you know what this is? It's the first time anyone made a thousand copies of the same thought.",
        responses: [
          {
            text: "It belongs here. Make your copies.",
            action: () => giveBible("gift"),
            next: "thanks",
          },
          {
            text: "[Persuasion 55] Rex Hadley would pay a fortune for this. Match it.",
            check: { skill: "persuasion", value: 55 },
            action: () => giveBible("more"),
            next: "matched",
            failNext: "nomatch",
          },
          { text: "I'm keeping it.", next: "keep" },
        ],
      },
      thanks: {
        text: "Two hundred scrip, and two books from my own shelf — the two I'd save from a fire. Everybody at this table owes you now. We pay our debts in words, mostly, but I'll see what I can do about the scrip.",
        responses: [{ text: "Happy copying, Archivist." }],
      },
      matched: {
        text: "Four hundred. It is everything the library has. [She counts it out with an archivist's precision and a mercenary's resentment.] Worth it. Get out of my scriptorium.",
        responses: [{ text: "Pleasure." }],
      },
      nomatch: {
        text: "Rex would pay you in counterfeit scrip and sell it to the Covenant by morning. Two hundred, two books, and my gratitude, which does not come cheap.",
        responses: [
          {
            text: "Fine. It's yours.",
            action: () => giveBible("gift"),
            next: "thanks",
          },
          { text: "I'll keep it.", next: "keep" },
        ],
      },
      keep: {
        text: "Then it's a book in a bag. It could be a thousand books in a thousand hands. Think about it.",
        responses: [{ text: "Goodbye." }],
      },
      after: {
        text: () =>
          PM.flag("park_outcome") === "sold"
            ? "Rex sold a Bible to the Covenant last week. I recognised the burn mark on the spine. [She does not look up.] I hope the scrip keep you warm."
            : "Page two hundred and six. My hand cramps, the candles run out, and the Maniacs in the Morgan are welcome to the rest of the building. We have the book.",
        responses: [{ text: "Goodbye, Archivist." }],
      },
      why: {
        text: "They said knowledge was a weapon and had to be kept from the Ruins. I said a weapon nobody can pick up is a paperweight. They said that was insubordination. I said it was a metaphor. They said metaphors were insubordination. So here I am.",
        responses: [{ text: "Goodbye." }],
      },
    },
  });

  // -------------------------------------------------------------------
  // Doc Benchley (doctor), Rex Hadley (merchant, fence), Woolcott (guard)
  // -------------------------------------------------------------------
  PM.dialogue("pm2_dlg_benchley", {
    start: "root",
    nodes: {
      root: {
        text: 'Robert Benchley, M.D. — the M.D. stands for "Mostly Diagnoses". Room 201, the only room in this hotel that has been properly cleaned since 1967. What ails you? Besides the obvious.',
        responses: [
          {
            text: "[30 scrip] Patch me up.",
            cond: () => PM.inv.scrip() >= 30,
            action: () => {
              PM.inv.addScrip(-30);
              try {
                G.player.heal(999);
              } catch (e) {
                /* core */
              }
              PM.sfx("inject");
            },
            next: "healed",
          },
          {
            text: "[50 scrip] Flush out the radiation.",
            cond: () => PM.inv.scrip() >= 50 && G.player && G.player.rads > 0,
            action: () => {
              PM.inv.addScrip(-50);
              try {
                if (PM.live("rpg") && G.rpg.removeRads) G.rpg.removeRads(9999);
                else G.player.addRads(-G.player.rads);
              } catch (e) {
                /* core */
              }
              PM.sfx("iodine_tabs");
            },
            next: "flushed",
          },
          { text: "What do you have for sale?", barter: true },
          { text: "Goodbye, Doc." },
        ],
      },
      healed: {
        text: "There. Stitched, jetted and sterilised, in order of importance. Try not to get shot again. Or do; I need the scrip.",
        responses: [{ text: "Thanks, Doc." }],
      },
      flushed: {
        text: "Prussian Blue, a glass of water and a stern lecture. The lecture is free. You may notice some... bathroom urgency. That is the radiation leaving. Wave goodbye.",
        responses: [{ text: "Thanks, Doc." }],
      },
    },
  });
  PM.dialogue("pm2_dlg_rex", {
    start: "root",
    nodes: {
      root: {
        text: "Rex Hadley. Books, bullets, batteries, and the occasional work of art, no questions asked, no answers given. Browse. Touch everything. Break it and it's yours at full price.",
        responses: [
          { text: "Let's trade.", barter: true },
          {
            text: 'I have a painting. A Penrose. "Nocturne for a Dying City".',
            cond: () =>
              PM.inv.count("pm2_nocturne") > 0 && PM.q.active("pm2_q_critic"),
            next: "painting",
          },
          {
            text: "I have a Gutenberg Bible.",
            cond: () =>
              PM.inv.count("pm2_gutenberg") > 0 &&
              PM.q.active("pm2_q_archivist"),
            next: "bible",
          },
          { text: "Goodbye, Rex." },
        ],
      },
      painting: {
        text: "[His eyes do a thing.] A Penrose, with a provenance, and a Brute review on the back? I have a buyer uptown who collects \"survivor art\". Five hundred scrip. Aldous never has to know. Aldous also never has to see it again. That's the part you'll have to live with.",
        responses: [
          {
            text: "Sold. [Sell the painting for 500 scrip]",
            action: () => {
              PM.inv.remove("pm2_nocturne", 1);
              PM.inv.addScrip(500);
              PM.setFlag("crane_outcome", "sold");
              PM.standing(-25, "Sold Penrose's painting");
              PM.q.done("pm2_q_critic");
            },
            next: "sold",
          },
          { text: "No. It goes back to Penrose." },
        ],
      },
      bible: {
        text: "A Gutenberg. An actual — [He lowers his voice.] The Covenant pays in scrip for anything old-world and holy, and they pay very well for anything old-world and holy and FIRST. Seven hundred scrip. Park gets over it. Park always gets over it.",
        responses: [
          {
            text: "Sold. [Sell the Bible for 700 scrip]",
            action: () => {
              PM.inv.remove("pm2_gutenberg", 1);
              PM.inv.addScrip(700);
              PM.setFlag("park_outcome", "sold");
              PM.standing(-35, "Sold the Gutenberg Bible to a fence");
              PM.q.done("pm2_q_archivist");
            },
            next: "sold",
          },
          { text: "No. It stays in the Algonquin library." },
        ],
      },
      sold: {
        text: "Pleasure doing business. [He wraps it in oilcloth with the tenderness of a man who has already spent the money.] If anyone asks, you never saw me, and I have never been seen.",
        responses: [{ text: "Goodbye." }],
      },
    },
  });
  PM.dialogue("pm2_dlg_woolcott", {
    start: "root",
    nodes: {
      root: {
        text: () =>
          PM.flag("woolcott_talked")
            ? "Still here. Still watching. Still armed."
            : "Sergeant Woolcott, Round Table security. Guns stay holstered past the sandbags, voices stay down past the lobby, and nobody — nobody — insults the poetry. You look literate enough. Go on in.",
        onEnter() {
          PM.setFlag("woolcott_talked", true);
        },
        responses: [
          { text: "Any trouble lately?", next: "trouble" },
          { text: "Thanks, Sergeant." },
        ],
      },
      trouble: {
        text: 'Brutes from the Modern come by some nights, sniffing. One of them left a note on the door that said "HOTEL: 2 STARS". Penrose took it personally. Maniacs from the Morgan don\'t come out much. Must be good reading down there.',
        responses: [{ text: "Thanks." }],
      },
    },
  });

  // -------------------------------------------------------------------
  // Quests
  // -------------------------------------------------------------------
  const ALG = () => {
    const a = PM.anchorOf("algonquin", "exterior_entrance");
    return a || { x: -79, z: -145 };
  };
  PM.quest({
    id: "pm2_q_cat",
    name: "Nine Lives",
    giver: "Francis Case IV",
    location: "The Algonquin Hotel",
    desc: "The Algonquin's cat, Matilda, has gone missing. Francis Case IV, the hotel's manager, would very much like her back.",
    stages: [
      {
        id: "find",
        text: "Find Matilda in Room 207 on the Algonquin's second floor.",
        markers: () => {
          const a = AN("cat_hide");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Room 207",
                  interior: "algonquin",
                },
              ]
            : [];
        },
      },
      {
        id: "return",
        text: "Return Matilda to Francis Case IV at the front desk.",
        markers: () => {
          const a = AN("manager");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Francis Case IV",
                  interior: "algonquin",
                },
              ]
            : [];
        },
      },
    ],
    rewards: { xp: 100, scrip: 50, items: [["pm2_alg_pass", 1]], standing: 5 },
  });
  PM.quest({
    id: "pm2_q_critic",
    name: "Everyone's a Critic",
    giver: "Aldous Penrose",
    location: "The Algonquin Hotel",
    desc: 'Aldous Penrose, an old painter at the Algonquin\'s Round Table, wants his 1966 painting "Nocturne for a Dying City" back from the Museum of Modern Art — now home to Brute "art critics".',
    stages: [
      {
        id: "retrieve",
        text: 'Recover "Nocturne for a Dying City" from the Museum of Modern Art.',
        markers: () => {
          const a = PM.anchorOf("moma", "nocturne");
          const e = PM.anchorOf("moma", "exterior_entrance");
          return [
            e ? { x: e.x, z: e.z, label: "Museum of Modern Art" } : null,
            a
              ? {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Collection Storage",
                  interior: "moma",
                }
              : null,
          ].filter(Boolean);
        },
      },
      {
        id: "return",
        text: "Bring the painting to Aldous Penrose at the Algonquin.",
        markers: () => {
          const a = AN("seat_crane");
          const e = ALG();
          return [
            { x: e.x, z: e.z, label: "The Algonquin" },
            a
              ? {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Aldous Penrose",
                  interior: "algonquin",
                }
              : null,
          ].filter(Boolean);
        },
      },
    ],
    rewards: { xp: 300 },
  });
  PM.quest({
    id: "pm2_q_archivist",
    name: "Ink and Ash",
    giver: "Archivist Evangeline Park",
    location: "The Algonquin Hotel",
    desc: "Archivist Evangeline Park, who left the Iron Covenant to copy books that matter, wants a Gutenberg Bible from the rare-book vault beneath the Morgan Library.",
    stages: [
      {
        id: "vault",
        text: "Retrieve the Gutenberg Bible from the Morgan Library's Rare Book Vault.",
        markers: () => {
          const a = PM.anchorOf("morgan_library", "bible");
          const e = PM.anchorOf("morgan_library", "exterior_entrance");
          return [
            e ? { x: e.x, z: e.z, label: "The Morgan Library" } : null,
            a
              ? {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Rare Book Vault",
                  interior: "morgan_library",
                }
              : null,
          ].filter(Boolean);
        },
      },
      {
        id: "return",
        text: "Bring the Gutenberg Bible to Archivist Park at the Algonquin.",
        markers: () => {
          const a = AN("archivist");
          const e = ALG();
          return [
            { x: e.x, z: e.z, label: "The Algonquin" },
            a
              ? {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Archivist Park",
                  interior: "algonquin",
                }
              : null,
          ].filter(Boolean);
        },
      },
    ],
    rewards: { xp: 350 },
  });
  // item pickups advance (or start) the quests
  G.events.on("itemAdded", (id) => {
    if (id === "pm2_nocturne") {
      if (!PM.q.started("pm2_q_critic")) PM.q.start("pm2_q_critic");
      PM.q.advance("pm2_q_critic", "retrieve", "return");
    }
    if (id === "pm2_gutenberg") {
      if (!PM.q.started("pm2_q_archivist")) PM.q.start("pm2_q_archivist");
      PM.q.advance("pm2_q_archivist", "vault", "return");
    }
  });

  // -------------------------------------------------------------------
  // NPC roster (spawned on newGame / after load, stable ids)
  // -------------------------------------------------------------------
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
})();
