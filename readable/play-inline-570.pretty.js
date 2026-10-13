/* src/quests/67_ms_act5.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 67: MAIN STORY ACT V "The Second Sun" (mq30–mq35)
 *
 *   mq30 Sirocco Two         — the second bomber's wreck in the North Woods
 *                              (Rose, Zeke): two keys, a word, a battery.
 *   mq31 Poste Dragon        — absorbs pv_red_star (poi_village): race the
 *                              Glowkeepers to the SIROCCO codebook.
 *   mq32 Blackout            — the double raid at dusk: Rose's roof or the
 *                              battery. The masked Dawn, seen once.
 *   mq33 Keeper of the Keys  — Hollowell, alone in St. Patrick's: the
 *                              Track 61 hatch key + the route; Noonday's
 *                              children.
 *   mq34 Sunday Best         — Saturday night at Grand Central: muster,
 *                              Zeke, Rose on the Oyster Bar steps,
 *                              evacuation, sleep until 05:00.
 *   mq35 Track 61            — the outer lair (src/lair): platform, Hall of
 *                              Candles, Brother Tinder's drill, the M42 door.
 * The finale mq36 is src/lair's. Text only: no speech synthesis anywhere.
 * Spec: story/outline.json quests[29..34]; contract: src/quests/NOTES.md.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const ms = L.ms;
  if (!ms) {
    console.warn("[quests:ms5] no main-story toolkit");
    return;
  }
  const first = () => String(L.heroName()).split(" ")[0];
  const rose = ms.rose;
  const stage = (id) => (Q.isActive(id) ? Q.stage(id) : null);
  const inStage = (id, list) => {
    const s = stage(id);
    return !!s && list.indexOf(s) >= 0;
  };
  const pl = () => (G.player ? G.player.pos : null);
  const dist2 = (p) => {
    const P = pl();
    return P && p ? Math.hypot(P.x - p.x, P.z - p.z) : 1e9;
  };
  const plain = (p, label) =>
    p ? { x: p.x, z: p.z, y: p.y || 0, label } : null;
  const captive = () => !!ms.f("rose_captive");
  const rosePresent = () =>
    !captive() && rose.mode() !== "gone" && !L.flag("ms_rose_released");
  const zekePlace = (spec) => {
    if (ms.zekePlace) {
      try {
        ms.zekePlace(spec);
      } catch (e) {
        G.reportError("quests:ms5:zeke", e);
      }
    }
  };
  const zekeNear = (r) => {
    const a = L.npc("lib_zeke");
    return !!(a && !a.dead && dist2(a.pos) < (r || 25));
  };
  const fade = (fn, d) => {
    if (typeof G.fadeTransition === "function") G.fadeTransition(fn, d || 1.0);
    else fn();
  };
  /** Pass game time to hour h (sleep=true: a real night's sleep). */
  function passTo(h, sleep) {
    const Tm = G.time;
    if (!Tm) return;
    const dh = (((h - (Tm.hour || 0)) % 24) + 24) % 24;
    if (dh < 0.05) return;
    try {
      if (
        !G.isStub("rpg") &&
        sleep &&
        typeof G.rpg.sleep === "function" &&
        dh >= 1
      ) {
        G.rpg.sleep(dh);
        return;
      }
      if (!G.isStub("rpg") && typeof G.rpg.wait === "function") {
        G.rpg.wait(dh);
        return;
      }
      if (G.atmos && typeof G.atmos.advanceHours === "function") {
        G.atmos.advanceHours(dh);
        return;
      }
    } catch (e) {
      G.reportError("quests:ms5:time", e);
    }
    Tm.hour = h;
  }
  /** An actor set to a quest-scripted essential state (another module's NPC): guarded. */
  function setEssential(id, v) {
    const a = L.npc(id);
    if (a && !a.dead) a.essential = !!v;
  }

  // ==================================================================
  // NOTES / ITEMS
  // ==================================================================
  ms.note({
    id: "ms_note_sirocco_plate",
    name: "Rubbing: Sirocco Two Weapon Plate",
    title:
      "Pencil rubbing of a brass plate (North Woods wreck), with Zeke's translation",
    text: "SIROCCO 2 — CHARGE SPÉCIALE\nARMEMENT : DEUX CLÉS TOURNÉES ENSEMBLE\n   CLÉ A — PILOTE        CLÉ B — NAVIGATEUR\nMOT D'ARMEMENT : RÉGLER LA ROUE CHIFFRANTE (VOIR CARNET SIROCCO)\nALIMENTATION DU BLOC DE MISE À FEU : 28 V CONTINU\n\n(Zeke, in carpenter's pencil, underneath:)\nTwo keys turned TOGETHER. A = pilot. B = navigator.\nA word set on the cipher wheel. Word is in their codebook.\n28 volts DC to the firing set = a rig battery, near enough.\nTake away any ONE of the three and it's scrap.\nPilot's key chain cut, not torn. Navigator taken out by the OCD in '67.\nYield: battery to Harlem. Don't let it.",
  });
  ms.note({
    id: "ms_note_sirocco_codebook",
    name: "SIROCCO Codebook (Poste Dragon copy)",
    title: "CARNET SIROCCO — Bureau Sept, copy No. 2 of 2",
    text: 'A water-stained ledger bound in grey card, stamped TRÈS SECRET and, below it, POSTE DRAGON.\n\nColumns of dates, March 1967 onward, and against each date a single word in capitals: the arming word for the cipher wheel of each SIROCCO aircraft. Most are ordinary French words. Some pages are blank where the flight never flew.\n\nOn the flyleaf, in pencil: "Copy 1 to the field officer (C.). Copy 2 stays below. If the post is lost, burn it."\n\nAs long as this book is out of the Glowkeepers\' hands, they cannot know which word the wheel wants.',
  });
  ms.note({
    id: "ms_note_brault_1970",
    name: "Sgt. Brault's Diary (a loose page)",
    title:
      "Carnet — Sgt. Ph. Brault, a page torn out and kept loose (English, cramped)",
    text: "October 1970.\n\nA woman came down the dumbwaiter shaft today. Nobody comes down the dumbwaiter shaft. She had a girl of three on her hip and burns on her neck under a scarf, and she spoke French like Montréal, quick and polite.\n\nShe did not want food. She wanted to know whether anything she had said in 1966, to anyone, had helped bring the bombers. She asked it as if she already knew the answer and needed someone to say it out loud.\n\nI told her the truth: we do not know anything here. We only listen. A whole sky is nobody's fault.\n\nShe did not believe me. While we talked she drew on the dust of my desk with one finger: a little sun, with too many rays. The Commandant gave the girl the last sugar cube from his tin. She held it like a jewel and would not eat it.\n\nThey went back up the shaft at dusk. The girl waved. I have not told Paris. There is no Paris.",
  });
  ms.note({
    id: "ms_note_journal_lantern",
    name: "Journal: The Ledge",
    title: "Your journal, the night of the raid",
    text: "They came for the battery at dusk and we held it. We held it, and while we were holding it they went up the stairs at Tudor City and took {ROSE} below. Sol says she shot two of them on the way down. Of course she did.\n\nWhen it was over there was a woman on the ledge of One Times Square. Grey robes. A gilt mask like a sun, twelve rays. A lantern held up at arm's length, the way you hold a light for someone coming down a dark stair. She wasn't looking at the battery. She was looking at me.\n\nThen the lantern went out.\n\nSomething about the way she held the lantern.",
  });
  ms.item({
    id: "q_track61_key",
    type: "key",
    name: "Track 61 Hatch Key",
    weight: 0,
    value: 0,
    quest: true,
    desc: "A long brass key on a loop of altar cord, stamped N.Y.C.R.R. — M-61. It opens the welded hatch of the Waldorf's freight shaft and the bulkhead under 42nd Street: the two doors down to Track 61.",
  });

  // ==================================================================
  // MQ30 — SIROCCO TWO (the North Woods wreck)
  // ==================================================================
  const WRECK = { x: 6, z: -950 };
  /** The wreck's centre: a POI owner's `sirocco_wreck` anchor, else a free spot near WRECK. */
  const wc = () =>
    L.anchor("north_woods", ["sirocco_wreck"], WRECK, { maxR: 16 }) || {
      x: WRECK.x,
      y: 0,
      z: WRECK.z,
    };
  const terrainY = (x, z, fb) => {
    const W = G.world;
    return W && W.terrainHeight ? W.terrainHeight(x, z) : fb || 0;
  };
  /** A point relative to the wreck centre, resolved when read (spots / markers / pickups). */
  function rel(dx, dz, dy) {
    return {
      get x() {
        return wc().x + dx;
      },
      get z() {
        return wc().z + dz;
      },
      get y() {
        const c = wc();
        return (
          (c.anchored ? c.y : terrainY(c.x + dx, c.z + dz, c.y)) + (dy || 0)
        );
      },
    };
  }
  const P_PLATE = rel(2.4, 2.6),
    P_COCKPIT = rel(-6.4, 1.8),
    P_INSCR = rel(15, 14),
    P_ROSE = rel(3.5, 5.2),
    P_ZEKE = rel(0.2, 5.4);

  // ---- set dressing: the fuselage, the empty cradle, the drag marks, the slab ----
  let wreckGen = -1;
  const WMAT = {};
  function wmat(k, c, r, m) {
    if (!WMAT[k]) {
      WMAT[k] = new window.THREE.MeshStandardMaterial({
        color: c,
        roughness: r,
        metalness: m,
      });
      WMAT[k].userData.shared = true;
    }
    return WMAT[k];
  }
  function buildWreck() {
    if (
      wreckGen === L.gen ||
      !G.scene ||
      !G.world ||
      !G.world.addCollider ||
      !window.THREE
    )
      return;
    const c = wc();
    if (!c || c.anchored) {
      wreckGen = L.gen;
      return;
    } // a POI owner built the real thing
    wreckGen = L.gen;
    const THREE = window.THREE,
      W = G.world;
    const y0 = terrainY(c.x, c.z, c.y);
    const hull = wmat("hull", 0x4b4f4a, 0.75, 0.55),
      burnt = wmat("burnt", 0x24221f, 0.95, 0.2),
      brass = wmat("brass", 0xa8833a, 0.45, 0.8),
      stone = wmat("slab", 0x6c6a64, 0.9, 0.3),
      drag = wmat("drag", 0x2c261d, 1, 0);
    const g = new THREE.Group();
    g.name = "ms_sirocco_wreck";
    const add = (geo, m, x, y, z, rx, ry, rz) => {
      const o = new THREE.Mesh(geo, m);
      o.position.set(x, y, z);
      o.rotation.set(rx || 0, ry || 0, rz || 0);
      o.castShadow = true;
      o.receiveShadow = true;
      g.add(o);
      return o;
    };
    // forward fuselage (nose ploughed in) and the broken-off tail section, both lying east-west
    add(
      new THREE.CylinderGeometry(1.35, 1.6, 9, 14, 1, true),
      hull,
      c.x - 2.6,
      y0 + 0.9,
      c.z,
      0.06,
      0,
      Math.PI / 2 + 0.07,
    );
    add(
      new THREE.SphereGeometry(1.36, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      burnt,
      c.x - 7.1,
      y0 + 0.65,
      c.z,
      0,
      0,
      Math.PI / 2,
    );
    add(
      new THREE.CylinderGeometry(1.5, 0.9, 7, 14, 1, true),
      hull,
      c.x + 6.6,
      y0 + 1.0,
      c.z - 0.9,
      0,
      0.32,
      Math.PI / 2 - 0.05,
    );
    add(
      new THREE.BoxGeometry(2.2, 2.8, 0.18),
      hull,
      c.x + 9.4,
      y0 + 2.4,
      c.z - 1.9,
      0,
      0.32,
      0.12,
    ); // tail fin
    add(
      new THREE.BoxGeometry(2.8, 0.22, 12),
      hull,
      c.x - 1.0,
      y0 + 0.35,
      c.z - 1.0,
      0.05,
      0.12,
      -0.06,
    ); // wing, snapped
    add(
      new THREE.BoxGeometry(1.8, 0.2, 4),
      burnt,
      c.x - 0.4,
      y0 + 0.25,
      c.z + 6.2,
      0.2,
      -0.4,
      0.1,
    ); // the other wing's stub
    // the empty bomb cradle: an open steel U where the belly split
    for (const dz of [1.7, 3.3])
      add(
        new THREE.BoxGeometry(3.2, 0.12, 0.12),
        burnt,
        c.x + 2.4,
        y0 + 0.75,
        c.z + dz,
      );
    for (const dx of [0.9, 3.9])
      add(
        new THREE.BoxGeometry(0.12, 0.9, 1.7),
        burnt,
        c.x + dx,
        y0 + 0.35,
        c.z + 2.5,
      );
    add(
      new THREE.BoxGeometry(0.55, 0.36, 0.04),
      brass,
      c.x + 2.4,
      y0 + 0.95,
      c.z + 3.36,
    ); // the weapon plate
    // drag marks: two dark furrows from the cradle to the slab
    const ins = { x: c.x + 15, z: c.z + 14 };
    const segs = 9;
    for (let i = 0; i < segs; i++) {
      for (const off of [-0.7, 0.7]) {
        const t0 = (i + 0.15) / segs,
          x = c.x + 2.4 + (ins.x - c.x - 2.4) * t0,
          z = c.z + 3.8 + (ins.z - c.z - 4.8) * t0;
        const ang = Math.atan2(ins.x - c.x - 2.4, ins.z - c.z - 4.8);
        const o = add(
          new THREE.PlaneGeometry(0.32, 1.5),
          drag,
          x + Math.cos(ang) * off,
          terrainY(x, z, y0) + 0.04,
          z - Math.sin(ang) * off,
          -Math.PI / 2,
          0,
          ang,
        );
        o.castShadow = false;
      }
    }
    // the slab: a panel of the bomber's own skin set upright, a sun disc riveted to it
    const iy = terrainY(ins.x, ins.z, y0);
    add(
      new THREE.BoxGeometry(1.3, 1.7, 0.16),
      stone,
      ins.x,
      iy + 0.85,
      ins.z,
      0,
      0.6,
      0,
    );
    add(
      new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12),
      brass,
      ins.x + Math.sin(0.6) * 0.1,
      iy + 1.35,
      ins.z + Math.cos(0.6) * 0.1,
      Math.PI / 2,
      0.6,
      0,
    );
    G.scene.add(g);
    const h = { object3d: g };
    const cols = [
      W.addCollider(c.x - 2.6, c.z, 9, 3.0, y0, y0 + 2.4, 0, { tag: "prop" }),
      W.addCollider(c.x + 6.6, c.z - 0.9, 7, 2.8, y0, y0 + 2.4, 0.32, {
        tag: "prop",
      }),
      W.addCollider(ins.x, ins.z, 1.3, 0.3, iy, iy + 1.7, 0.6, { tag: "prop" }),
    ];
    L.dyn(h);
    for (const col of cols) L.dyn({ collider: col });
    // the pilot, still in his straps; a few army crates the OCD never took home
    L.prop("skeleton", {
      x: c.x - 6.4,
      y: y0 + 0.6,
      z: c.z + 0.6,
      yaw: Math.PI / 2,
      pose: "sitting",
    });
    L.prop("crate", {
      x: c.x + 4.8,
      y: y0,
      z: c.z + 4.6,
      yaw: 0.4,
      kind: "army",
    });
    L.prop("debris", { x: c.x - 3.5, y: y0, z: c.z + 3.2, yaw: 1.2 });
  }
  L.hook("spawn", function () {
    L.later(0.3, buildWreck);
  });
  L.hook("reset", function () {
    wreckGen = -1;
  });

  // ---- the wreck's examine dialogues (also injected into Zeke's tree) ----
  function readPlate() {
    ms.set("knows_arming");
    if (!L.has("ms_note_sirocco_plate")) L.give("ms_note_sirocco_plate", 1);
    if (stage("mq30") === "wreck" || stage("mq30") === "plate")
      Q.setStage("mq30", "harness");
  }
  function checkHarness() {
    ms.set("mq30_harness");
    if (stage("mq30") === "harness") Q.setStage("mq30", "drag");
  }
  function readInscription() {
    ms.set("mq30_inscription");
    if (Q.isActive("mq30")) {
      if (!ms.f("knows_arming")) readPlate();
      Q.complete("mq30");
    }
  }
  const WRECK_NODES = {
    mq30_plate: {
      speaker: "Weapon Plate",
      text: "[A brass plate riveted to the empty bomb cradle, green with twenty-two winters. French, stamped deep:]\n\nSIROCCO 2 — CHARGE SPÉCIALE. ARMEMENT : DEUX CLÉS TOURNÉES ENSEMBLE (A : PILOTE / B : NAVIGATEUR). MOT D'ARMEMENT SUR LA ROUE CHIFFRANTE (VOIR CARNET SIROCCO). ALIMENTATION DU BLOC DE MISE À FEU : 28 V.",
      responses: [
        {
          text: "Zeke. Read it with me.",
          cond: () => zekeNear(30),
          next: "mq30_zplate",
        },
        {
          text: () => "You read French, " + ms.roseName() + "?",
          cond: () => !zekeNear(30),
          next: "mq30_rplate",
        },
      ],
    },
    mq30_zplate: {
      speaker: "Zeke Marlow",
      text: "Two keys, turned together. The pilot carries A, the navigator carries B. Then a word, dialled into a cipher wheel; the word's in their codebook, which we haven't got. And juice: twenty-eight volts to the firing set. [He raps the cradle with a knuckle.] That's a rig battery, near enough. Every Exo-rig in the city runs on twenty-eight.",
      responses: [{ text: "How big is it, Zeke?", next: "mq30_zyield" }],
    },
    mq30_zyield: {
      speaker: "Zeke Marlow",
      text: () =>
        "[He looks at the empty cradle a long time.] Enough to finish what the first one started. Battery to Harlem. " +
        (ms.f("keyB") === "destroyed"
          ? "Your girl took care of key B, so they're a key short. Unless somebody down there is clever with a drill. Somebody always is."
          : "And we know where key B is, don't we. In your pocket. Keep it there.") +
        " So: two keys, a word, a battery. Take away any one and it's the most expensive paperweight in New York.",
      onEnter() {
        readPlate();
      },
      responses: [
        { text: "[Look at the cockpit.]", next: "mq30_harness" },
        { text: "Let's keep looking." },
      ],
    },
    mq30_rplate: {
      speaker: "Rose",
      text: "I read French. Mom made sure. [She runs a finger under the stamped words.] Two keys, turned together: A for the pilot, B for the navigator. A word set on a cipher wheel, out of their codebook. Twenty-eight volts for the firing set. [Flat.] That's a rig battery. That's why they wanted the Neon's.",
      onEnter() {
        readPlate();
      },
      responses: [
        { text: "[Look at the cockpit.]", next: "mq30_harness" },
        { text: "Let's keep looking." },
      ],
    },
    mq30_harness: {
      speaker: "Cockpit",
      text: () =>
        "[The cockpit has torn away from the fuselage and lies nose-down in the leaf mould. The pilot is still in his harness, a skeleton in a flight suit gone the colour of the ground. Round his neck bones hangs a short chain, and the chain has been cut: cut clean, with a tool, not torn. Whatever hung on it is gone. The navigator's seat behind him is empty; his straps were slit by a Civil Defense recovery knife, the OCD's stencil still on the buckle.]" +
        (zekeNear(30)
          ? "\n\nZEKE: Key A, off the pilot. Somebody with a steady hand and a reason. And the navigator went home with the OCD in '67, key and all. That's how B ended up on Liberty."
          : "") +
        (rosePresent()
          ? "\n\n[" +
            ms.roseName() +
            " has turned away. She is looking at the trees.]"
          : ""),
      onEnter() {
        checkHarness();
      },
      responses: [{ text: "[Follow the drag marks.]" }],
    },
    mq30_inscr: {
      speaker: "Slab",
      text: "[Where the drag marks end, a panel of the bomber's own skin has been set upright in the earth like a headstone. A twelve-ray sun is punched into it, and the year 1971, and one line, cut letter by letter with a cold chisel:]\n\nHERE THE SECOND SUN CAME DOWN TO SLEEP. D.",
      responses: [
        {
          text: () => "[Look at " + ms.roseName() + ".]",
          cond: () => rosePresent(),
          next: "mq30_rinscr",
        },
        {
          text: "[Copy it into your notes.]",
          cond: () => !rosePresent(),
          action: () => readInscription(),
        },
      ],
    },
    mq30_rinscr: {
      speaker: "Rose",
      text: "[She doesn't touch the slab. She stands exactly where she must have stood, a hand held out a little from her side, as if someone were still holding it.] She held my hand right here, every March. She said it was sleeping like my father.",
      onEnter() {
        readInscription();
      },
      responses: [
        { text: "It isn't sleeping. And neither am I. Not any more." },
        { text: "[Say nothing. Stand with her.]" },
      ],
    },
  };
  const WD = ms.dlg("dlg_ms5_wreck", "idle");
  WD.add(
    Object.assign(
      {
        idle: {
          text: "[Nothing more to see here.]",
          responses: [{ text: "[Step back.]" }],
        },
      },
      WRECK_NODES,
    ),
  );

  ms.spot({
    id: "ms5_plate",
    when: () => inStage("mq30", ["wreck", "plate", "harness", "drag"]),
    at: P_PLATE,
    label: "Weapon Plate",
    verb: "Read",
    radius: 1.4,
    use() {
      if (stage("mq30") === "wreck") Q.setStage("mq30", "plate");
      ms.talk("dlg_ms5_wreck", "Weapon Plate", "mq30_plate");
    },
  });
  ms.spot({
    id: "ms5_cockpit",
    when: () => inStage("mq30", ["harness", "drag"]),
    at: P_COCKPIT,
    label: "Cockpit Harnesses",
    verb: "Check",
    radius: 1.6,
    use() {
      ms.talk("dlg_ms5_wreck", "Cockpit", "mq30_harness");
    },
  });
  ms.spot({
    id: "ms5_inscription",
    when: () => inStage("mq30", ["drag"]),
    at: P_INSCR,
    label: "Inscribed Slab",
    verb: "Read",
    radius: 1.4,
    use() {
      ms.talk("dlg_ms5_wreck", "Slab", "mq30_inscr");
    },
  });

  // Rose at the wreck (she led them here)
  ms.dlg("dlg_ms_rose")
    .add({
      mq30_wreck: {
        speaker: "Rose",
        text: () =>
          stage("mq30") === "drag"
            ? "The marks go that way, into the trees. They dragged it out on a sledge. Took them all winter. I wasn't born yet. I've heard about it a hundred times anyway."
            : "This is it. Sirocco Two. When I was little we came here every March. A pilgrimage, they called it. I thought it was a church that fell out of the sky. [She kicks a rivet.] Read the plate. That's what we came for.",
        responses: [
          {
            text: "Every March?",
            next: "mq30_march",
            cond: () => stage("mq30") !== "drag",
          },
          { text: "Let's read it.", cond: () => stage("mq30") !== "drag" },
          { text: "Lead on.", cond: () => stage("mq30") === "drag" },
        ],
      },
      mq30_march: {
        speaker: "Rose",
        text: "The fifth. The anniversary. Candles all the way up the path, and singing, and the little kids carried on shoulders so they could see the hole. [A shrug that doesn't quite work.] It was the best day of the year. That's the problem with being raised by people like that. The best days are the worst ones.",
        responses: [{ text: "Let's read the plate." }],
      },
    })
    .when(() =>
      inStage("mq30", ["wreck", "plate", "harness", "drag"])
        ? "mq30_wreck"
        : null,
    );

  // Zeke at the wreck: the same plate reading
  ms.inject("dlg_lib_zeke", {
    start: () =>
      inStage("mq30", ["wreck", "plate"]) && !ms.f("knows_arming")
        ? "mq30_zstart"
        : null,
    nodes: Object.assign(
      {
        mq30_zstart: {
          text: "Fresh air, trees, a downed bomber. Just like the Catskills. [He nods at the brass on the cradle.] There's a plate on the cradle. Come on, you were always better at forms than me.",
          onEnter() {
            if (stage("mq30") === "wreck") Q.setStage("mq30", "plate");
          },
          responses: [
            { text: "[Read the plate with him.]", next: "mq30_plate" },
            { text: "In a minute." },
          ],
        },
      },
      WRECK_NODES,
    ),
  });

  const ROSE_WRECK = () => ({
    fallback: { x: P_ROSE.x, z: P_ROSE.z, y: P_ROSE.y },
  });
  const ROSE_INSCR = () => ({
    fallback: { x: P_INSCR.x - 1.6, z: P_INSCR.z - 1.2, y: P_INSCR.y },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq30",
      giver: "Zeke Marlow / Rose",
      location: "The North Woods, Central Park",
      desc: () =>
        "Rose knows where the second bomber came down: the North Woods, where the Glowkeepers made their pilgrimages when she was a child. Zeke wants to see the weapon plate. Whatever the Second Sun still needs, they mean to deny it.",
      stages: [
        {
          id: "wreck",
          text: "Find the Sirocco Two wreck in the North Woods. Rose is leading the way.",
          markers: () =>
            [
              plain(wc(), "Sirocco Two"),
              rosePresent() ? { npc: rose.id, label: "Rose" } : null,
            ].filter(Boolean),
          onEnter() {
            if (!captive()) rose.place("at", ROSE_WRECK());
            zekePlace({
              site: "north_woods",
              anchors: ["sirocco_zeke", "sirocco_wreck"],
              fallback: { x: P_ZEKE.x, z: P_ZEKE.z },
            });
            L.later(1.5, () =>
              ms.say(
                "Rose",
                "North Woods. Past the Loch, where the path gives up. Bring Zeke. He'll want to read the plate.",
              ),
            );
          },
        },
        {
          id: "plate",
          text: "Read the weapon plate with Zeke.",
          markers: () => [plain(P_PLATE, "Weapon Plate")],
        },
        {
          id: "harness",
          text: "Check the cockpit harnesses.",
          markers: () => [plain(P_COCKPIT, "Cockpit")],
        },
        {
          id: "drag",
          text: "Follow the drag marks to where they end.",
          markers: () => [plain(P_INSCR, "Drag Marks")],
          onEnter() {
            if (!captive()) rose.place("at", ROSE_INSCR());
          },
        },
      ],
      rewards: { xp: 600 },
      onComplete() {
        ms.set("knows_arming");
        if (!captive()) rose.place("home");
        L.later(4, () => zekePlace(null));
        L.news(
          "Folks up by the Harlem Meer say there were lights in the North Woods last night, and nobody came back out screaming. In this city that counts as a nature walk. Rocky's advice: stay out of the trees.",
        );
      },
    });
  });
  // Reaching the wreck moves the story on.
  L.trigger({
    id: "ms5_wreck_reach",
    once: false,
    cooldown: 2,
    pos: () => wc(),
    r: 16,
    cond: () => stage("mq30") === "wreck",
    fire() {
      Q.setStage("mq30", "plate");
    },
  });
  ms.solver("mq30", {
    wreck() {
      Q.setStage("mq30", "plate");
    },
    plate() {
      readPlate();
    },
    harness() {
      checkHarness();
    },
    drag() {
      readInscription();
    },
  });

  // ==================================================================
  // MQ31 — POSTE DRAGON (absorbs pv_red_star)
  // ==================================================================
  const RACE_MAX = 420; // game seconds near the post before the Glowkeepers break through
  const POST_FB = { x: 164, z: 504 };
  const postPos = () => L.anchor("chinatown", ["boss", "transmitter"], POST_FB);
  const codebookDone = () =>
    !!(ms.f("sun_word_denied") || ms.f("sun_word_glow"));
  const lysGuides = () => ms.f("bureau") === "sell" && !L.flag("dead_bs_lys");
  const DIGGERS = ["ms_pd_dig1", "ms_pd_dig2", "ms_pd_dig3"];
  const diggersDead = () => DIGGERS.every((id) => !!L.flag("dead_" + id));

  function codebook(how) {
    if (codebookDone()) return;
    ms.set("sun_word_denied");
    ms.set("codebook_" + (how === "burn" ? "burned" : "held"));
    if (how === "burn") {
      L.sfx("fire_ignite");
      L.notify(
        "The ledger goes up page by page, dates first. In a minute there is no word left for the wheel to want.",
      );
    } else {
      L.give("ms_note_sirocco_codebook", 1);
    }
    L.xp(150, "Denied the Second Sun its word");
    if (stage("mq31") === "codebook") Q.complete("mq31");
  }
  function lostCodebook() {
    if (codebookDone()) return;
    ms.set("sun_word_glow");
    L.notify(
      "Through the wall: a crash of brick, a shout, and running feet going away up the kitchen tunnel. When you reach the Commandant's desk the cipher safe stands open and empty.",
      { duration: 7 },
    );
    L.news(
      "Chinatown's quiet again. The Golden Dragon's kitchen has a new hole in the floor, and the Lums' old cat won't go near it. Something got carried out of there in a hurry, folks. Something with pages.",
    );
    if (stage("mq31") === "codebook") Q.complete("mq31");
  }
  ms.dlg("dlg_ms5_codebook", "idle").add({
    idle: {
      text: "[The safe is empty.]",
      responses: [{ text: "[Step back.]" }],
    },
    safe: {
      speaker: "Cipher Safe",
      text: () =>
        "[Behind the Commandant's desk a small grey safe stands open; its dial has rusted at zero. Inside, wrapped in oilcloth, a ledger bound in grey card: CARNET SIROCCO — POSTE DRAGON.]" +
        (L.flag("ms_mq31_breach") && !diggersDead()
          ? "\n\n[Behind the east wall the picks have stopped. Somebody on the other side is shouting in a voice that has never once been told no.]"
          : "\n\n[Behind the east wall, faint and steady: picks.]"),
      responses: [
        {
          text: "[Take the codebook.] If it's with me, it isn't with them.",
          action: () => codebook("take"),
        },
        { text: "[Burn it, here and now.]", action: () => codebook("burn") },
        { text: "[Leave it for the moment.]" },
      ],
    },
  });
  ms.spot({
    id: "ms5_codebook",
    when: () => inStage("mq31", ["post", "codebook"]) && !codebookDone(),
    at: {
      site: "chinatown",
      anchors: ["cipher_safe", "boss", "transmitter"],
      fallback: POST_FB,
    },
    label: "Cipher Safe",
    verb: "Open",
    radius: 1.4,
    use() {
      ms.talk("dlg_ms5_codebook", "Cipher Safe", "safe");
    },
  });
  ms.pickup({
    key: "ms_brault_page",
    item: "ms_note_brault_1970",
    when: () => inStage("mq31", ["post", "codebook"]),
    at: {
      site: "chinatown",
      anchors: ["soldier1", "boss"],
      fallback: { x: POST_FB.x - 2, z: POST_FB.z + 1 },
    },
  });
  // the Glowkeepers break through from the kitchen
  for (let i = 0; i < DIGGERS.length; i++) {
    const id = DIGGERS[i];
    ms.actor({
      id,
      when: () =>
        Q.isActive("mq31") && !!L.flag("ms_mq31_breach") && !codebookDone(),
      def: () => ({
        type: "glowkeeper_zealot",
        seed: 310 + i,
        name: i === 0 ? "Brother Wick" : "Glowkeeper Digger",
        gender: i === 1 ? "f" : "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: true,
        ai: "guard",
        level: 10,
        hp: 150,
        weapon:
          i === 0
            ? ["pipe_pistol", "pistol_10mm"]
            : ["sledgehammer", "lead_pipe", "machete"],
        at: {
          site: "chinatown",
          anchors: [["loot2", "soldier3", "soldier4"][i]],
          fallback: { x: POST_FB.x + 3 + i, z: POST_FB.z - 3 },
          maxR: 4,
        },
        barks: [
          "For the Long Noon!",
          "The book belongs to the Dawn!",
          "Keep the light on!",
        ],
      }),
    });
  }
  /** The race: ticks while the hero is near/inside the post during mq31. */
  function raceUpdate(dt) {
    if (!inStage("mq31", ["post", "codebook"]) || codebookDone()) return;
    const sideStage = Q.isActive("pv_red_star") ? Q.stage("pv_red_star") : null;
    const p = postPos();
    const inside =
      sideStage === "bunker" ||
      sideStage === "armory" ||
      (p && (p.anchored ? dist2(p) < 60 : dist2(p) < 18));
    if (!inside && !L.flag("ms_mq31_race")) return;
    if (!L.flag("ms_mq31_race")) {
      ms.set("mq31_race");
      L.setFlag("ms_mq31_race_t", 0);
      L.notify(
        "Somewhere behind the east wall: the dull, steady knock of picks on brick. The Glowkeepers are digging in from the Golden Dragon's kitchen.",
        { duration: 7 },
      );
    }
    if (!(p && dist2(p) < 140)) return; // the clock only runs while you're in the area
    const t = (Number(L.flag("ms_mq31_race_t")) || 0) + dt;
    L.setFlag("ms_mq31_race_t", t);
    if (t > RACE_MAX * 0.5 && !L.flag("ms_mq31_half")) {
      L.setFlag("ms_mq31_half", true);
      L.notify("The picks are louder now. Closer.");
    }
    if (t > RACE_MAX * 0.6 && !L.flag("ms_mq31_breach")) {
      ms.set("mq31_breach");
      L.notify(
        "A wall gives way somewhere in the post. Robed figures with lanterns and hammers come through the dust.",
        { duration: 6 },
      );
      L.later(0.3, ms.pollRoster);
    }
    if (L.flag("ms_mq31_breach") && diggersDead() && !L.flag("ms_mq31_held")) {
      L.setFlag("ms_mq31_held", true);
      L.notify("The digging crew is down. Nobody else comes through the hole.");
    }
    if (t >= RACE_MAX && !(L.flag("ms_mq31_breach") && diggersDead()))
      lostCodebook();
  }

  // Lys guides (Bureau Sept path)
  ms.inject("dlg_bs_lys", {
    start: () => (stage("mq31") === "lead" ? "mq31_lys" : null),
    nodes: {
      mq31_lys: {
        text: "[She doesn't look up from the typewriter.] You want the other book. Of course you do. Corbeau's copy went where Corbeau went. The second copy never left the city: Poste Dragon, under the Golden Dragon on Mott Street. Push the shelf in the storeroom; the stairs are behind it.",
        responses: [{ text: "And the men down there?", next: "mq31_lys2" }],
      },
      mq31_lys2: {
        text: "Eleven men, once. Now: what the sky left of them. The Commandant still types his daughter's name into his teletype every morning, MARGUERITE, as if Paris might answer. [Now she looks up.] And hurry. The sun people have been buying shovels in Chinatown all week, and they do not garden.",
        onEnter() {
          if (!G.isStub("locks") && G.locks && G.locks.learn) {
            try {
              G.locks.learn("pv_lk_ct_commander", "Mademoiselle Lys");
            } catch (e) {
              /* optional */
            }
          }
          Q.setStage("mq31", "post");
        },
        responses: [{ text: "Merci, Lys." }],
      },
    },
  });
  // Rose's sugar cube
  ms.dlg("dlg_ms_rose")
    .add({
      mq31_sugar: {
        speaker: "Rose",
        text: "[You tell her about the page in Brault's diary: a woman from the tunnels in 1970, a girl of three on her hip, a sugar cube.] [She is quiet for a while.] I remember a man with a moustache giving me a sugar cube. I thought it was a dream.",
        onEnter() {
          ms.set("mq31_sugar");
        },
        responses: [
          { text: "It wasn't." },
          { text: "Did you eat it?", next: "mq31_sugar2" },
        ],
      },
      mq31_sugar2: {
        speaker: "Rose",
        text: "No. I kept it in my pocket until it went to sand. [Almost a laugh.] I was three. Don't look at me like that.",
        responses: [{ text: "[Let it be.]" }],
      },
    })
    .when(() =>
      !captive() &&
      (L.has("ms_note_brault_1970") || L.flag("got_ms_brault_page")) &&
      !ms.f("mq31_sugar") &&
      stage("mq32") !== "choose" &&
      stage("mq34") !== "rose" &&
      !Q.isStarted("mq35")
        ? "mq31_sugar"
        : null,
    );

  L.hook("init", function () {
    ms.quest({
      id: "mq31",
      giver: "Mademoiselle Lys / Delorme's beacon",
      location: "Chinatown, under the Golden Dragon",
      desc: () =>
        "The cipher wheel wants a word, and the word is in Bureau Sept's SIROCCO codebook. Unless Corbeau's copy was seized on Liberty, the only copy left in the city is in the buried French listening post under the Golden Dragon, and the Glowkeepers are digging toward it from the kitchen.",
      stages: [
        {
          id: "lead",
          text: () =>
            ms.f("codebook_taken")
              ? "The SIROCCO codebook was taken on Liberty. The Glowkeepers will not get the word."
              : lysGuides()
                ? "Ask Mademoiselle Lys at Grand Central where the other codebook is."
                : "Follow Delorme's beacon to Chinatown.",
          markers: () =>
            lysGuides() ? [{ npc: "bs_lys", label: "Mademoiselle Lys" }] : [],
          onEnter() {
            if (ms.f("codebook_taken")) {
              ms.set("sun_word_denied");
              L.later(1, () =>
                ms.say(
                  "Rose",
                  "Corbeau's book went into the harbour with the rest of Liberty's evidence. The Dragon's copy is just paper now; without the date page they can't use it. One less thing.",
                ),
              );
              Q.complete("mq31");
              return;
            }
            if (!lysGuides()) {
              L.news(
                "Strange one tonight, listeners. Under the static, down around Canal Street, there's a voice reading numbers. In French. Same voice, same numbers, twenty-two years. Rocky's theory? Somebody down there is still waiting for a call back.",
              );
              Q.setStage("mq31", "post");
            }
          },
        },
        ms.proxy("mq31", "pv_red_star", {
          id: "post",
          text: "Find the storeroom passage under the Golden Dragon in Chinatown and get into the listening post. Deal with Commandant Delorme.",
          next: "codebook",
          reach: {
            site: "chinatown",
            anchors: ["door", "gate", "entrance"],
            fallback: { x: 160, z: 506 },
            label: "The Golden Dragon",
          },
        }),
        {
          id: "codebook",
          text: () =>
            codebookDone()
              ? "The codebook is settled, one way or the other."
              : "Take or burn the SIROCCO codebook in the Commandant's office before the Glowkeepers break through.",
          markers: () =>
            codebookDone()
              ? []
              : [
                  {
                    anchor: ["chinatown", ["boss", "transmitter"]],
                    fallback: POST_FB,
                    label: "Cipher Safe",
                  },
                ],
          onEnter() {
            if (codebookDone())
              L.later(0.5, () => {
                if (stage("mq31") === "codebook") Q.complete("mq31");
              });
          },
        },
        {
          id: "race",
          text: "(Optional) Stop the Glowkeeper digging crew.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_mq31_breach") && !codebookDone(),
          doneIf: () => !!L.flag("ms_mq31_held"),
          failIf: () => !!ms.f("sun_word_glow"),
        },
        {
          id: "brault",
          text: "(Optional) Read Sgt. Brault's loose diary page.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_mq31_race"),
          doneIf: () =>
            L.has("ms_note_brault_1970") || !!L.flag("got_ms_brault_page"),
        },
      ],
      rewards: { xp: 650 },
      onComplete() {
        if (ms.f("sun_word_denied"))
          L.later(2, () =>
            ms.say("Rose", "No word, no wheel. That's one of three. Good."),
          );
        else if (ms.f("sun_word_glow"))
          L.later(2, () =>
            ms.say(
              "Rose",
              "They've got the word. Fine. Then they still need two keys and a battery. We take those.",
            ),
          );
      },
    });
  });
  // Lys gone (dead / left the city) while she was the lead: the beacon points the way instead.
  L.trigger({
    id: "ms5_lys_lost",
    once: false,
    cooldown: 3,
    cond: () =>
      stage("mq31") === "lead" &&
      (!!L.flag("dead_bs_lys") || ms.f("bureau") !== "sell"),
    fire() {
      Q.setStage("mq31", "post");
    },
  });
  ms.solver("mq31", {
    lead() {
      Q.setStage("mq31", "post");
    },
    post() {
      codebook("take");
      if (Q.get("pv_red_star")) Q.complete("pv_red_star");
      else Q.setStage("mq31", "codebook");
    },
    codebook() {
      codebook("take");
      if (Q.isActive("mq31")) Q.complete("mq31");
    },
  });

  // ==================================================================
  // MQ32 — BLACKOUT (the double raid at dusk)
  // ==================================================================
  const RAID_MAX = 180; // game seconds (near the site) before the survivors fall back
  const RAIDERS = [
    "ms_bo_r1",
    "ms_bo_r2",
    "ms_bo_r3",
    "ms_bo_r4",
    "ms_bo_r5",
    "ms_bo_r6",
  ];
  const SITE = {
    roof: {
      site: "tudor_city",
      anchors: ["rose_nook", "ext_roof"],
      fallback: { x: 316, z: -168 },
      label: "Rose's Roof",
    },
    neon: {
      site: "times_square",
      anchors: ["stage", "center"],
      fallback: { x: -40, z: -262 },
      label: "The Big Buzz",
    },
    covenant: {
      site: "rockefeller",
      anchors: ["rig_gantry", "workbench", "commander"],
      fallback: { x: 80, z: -320 },
      label: "The Rig Battery (Rockefeller)",
    },
    tap: {
      site: "times_square",
      anchors: ["subway"],
      fallback: { x: -60, z: -228 },
      label: "The Tunnel Tap",
    },
  };
  const batteryKey = () => {
    const b = ms.f("sun_battery");
    return b === "neon" ? "neon" : b === "covenant" ? "covenant" : "tap";
  };
  const raidSite = () => L.flag("ms_mq32_site") || null; // 'roof' | 'battery'
  const raidKey = () => (raidSite() === "roof" ? "roof" : batteryKey());
  const siteLoc = (k) => {
    const s = SITE[k];
    return L.anchor(s.site, s.anchors, s.fallback);
  };
  const raidOver = () => !!L.flag("ms_mq32_raid_over");
  const raidersDown = () =>
    RAIDERS.filter((id) => !!L.flag("dead_" + id)).length;
  const batteryName = () =>
    ({
      neon: "the Neon's battery under the stage at Times Square",
      covenant: "the rig battery at Rockefeller Center",
      tap: "the tunnel tap on the Neon's mains",
    })[batteryKey()];

  function chooseRaid(where) {
    if (raidSite() || stage("mq32") !== "choose") return;
    L.setFlag("ms_mq32_site", where);
    const h = G.time ? G.time.hour : 18;
    const dusk = () => {
      if (!(h >= 17.5 && h < 21.5)) passTo(18.6, false);
    };
    fade(() => {
      dusk();
      L.notify(
        where === "roof"
          ? "You take a position on the roof under the dead letters of the sign and wait for the light to go."
          : "You take a position by the battery and wait for the light to go.",
        { duration: 5 },
      );
    }, 1.0);
    L.later(1.4, () => Q.setStage("mq32", "raid"));
  }
  function raidStart() {
    L.setFlag("ms_mq32_raid_t", 0);
    if (raidKey() === "neon") setEssential("neon_capt", false);
    L.later(0.4, ms.pollRoster);
    const k = raidKey();
    const line =
      k === "roof"
        ? [
            "Rose",
            "Here they come. Up the stairs and over the parapet. Jory, Pockets: the door. Beanie, Ash: with me. Nobody gets taken tonight.",
          ]
        : k === "neon"
          ? [
              "Captain Mercy Kincaid",
              "Robes on the west gate! Guard, on me! Nobody touches the Buzz!",
            ]
          : k === "covenant"
            ? [
                "Lancer Ibarra",
                "Contact, north side! Hold the gantry! Iron keeps!",
              ]
            : [
                "Sparks Malloy",
                "(on the guard's radio) They're at the tap! Don't let them cut the feed, and for God's sake don't let them cut YOU, the cable's live!",
              ];
    L.later(1.2, () => ms.say(line[0], line[1]));
    L.hint(
      "ms5_raid",
      "Hold your ground until the raid breaks. Your allies fight beside you.",
      3,
    );
    if (!G.isStub("music") && G.music.setMood) {
      try {
        G.music.setMood("combat");
      } catch (e) {
        /* */
      }
    }
  }
  function endRaid(lost) {
    if (raidOver()) return;
    L.setFlag("ms_mq32_raid_over", true);
    const k = raidKey();
    if (k === "neon") {
      const kin = L.npc("neon_capt");
      if (lost && kin && !kin.dead) {
        kin.essential = false;
        if (kin.kill) {
          try {
            kin.kill();
          } catch (e) {
            /* */
          }
        }
        ms.set("kincaid_dead");
      } else setEssential("neon_capt", true);
    }
    if (raidSite() === "roof") {
      ms.set("rose_defended");
      ms.addTrust(2, "You held her roof");
      ms.set("battery_lost");
      L.notify(
        "The raiders break and run for the stairs. Somewhere across Midtown, at the same moment, the other raid is going the other way: " +
          batteryName() +
          " is lost.",
        { duration: 7 },
      );
    } else {
      ms.set("rose_captive");
      rose.place("gone");
      if (lost) ms.set("battery_lost");
      L.notify(
        lost
          ? "The raid is over and it went badly. The robes melt back into the tunnels with what they came for."
          : "The raid breaks. The battery is still here, still humming.",
        { duration: 6 },
      );
      L.later(5, () =>
        ms.say(
          "Sol",
          "(a runner, out of breath, with Sol's words) They came up the Tudor stairs while you were gone. Six of them, in the good robes. She shot two. They took her below. For her safety, they said.",
        ),
      );
    }
    Q.setStage("mq32", "after");
  }
  function raidUpdate(dt) {
    if (stage("mq32") !== "raid" || raidOver()) return;
    const c = siteLoc(raidKey());
    if (!c || dist2(c) > 110) return;
    const t = (Number(L.flag("ms_mq32_raid_t")) || 0) + dt;
    L.setFlag("ms_mq32_raid_t", t);
    const down = raidersDown();
    if (down !== (L.flag("ms_mq32_down") || 0)) {
      L.setFlag("ms_mq32_down", down);
      L.refresh("mq32");
    }
    if (down >= RAIDERS.length) endRaid(false);
    else if (t >= RAID_MAX) endRaid(RAIDERS.length - down >= 4);
  }
  // the raiders and the battery-side allies (spawned while the raid runs)
  function raiderDef(i) {
    const k = raidKey();
    const s = SITE[k];
    const c = siteLoc(k) || s.fallback;
    const ang = (i / RAIDERS.length) * Math.PI * 2 + 0.4,
      r = k === "roof" ? 5 : 14;
    const leader = i === 0;
    return {
      type: leader ? "glowkeeper_brother" : "glowkeeper_zealot",
      seed: 320 + i,
      name: leader ? "Brother Lumen" : "Glowkeeper Zealot",
      gender: i % 3 === 1 ? "f" : "m",
      outfit: "glowkeeper_robes",
      faction: "glowkeepers",
      hostile: true,
      ai: "guard",
      level: 11,
      hp: leader ? 220 : 160,
      weapon: leader
        ? ["glowkeeper_censer", "hunting_rifle"]
        : [
            ["machete", "lead_pipe"],
            ["pipe_pistol", "pistol_10mm"],
            ["sledgehammer", "machete"],
          ][i % 3],
      at: {
        fallback: {
          x: c.x + Math.cos(ang) * r,
          z: c.z + Math.sin(ang) * r,
          y: c.y,
        },
        maxR: 5,
      },
      barks:
        k === "roof"
          ? [
              "Little Sun! Come home!",
              "For your own safety, child!",
              "Keep the light on!",
            ]
          : [
              "Feed the Sun!",
              "The battery belongs to the Light!",
              "Keep the light on!",
            ],
    };
  }
  RAIDERS.forEach((id, i) =>
    ms.actor({
      id,
      when: () => stage("mq32") === "raid" && !!raidSite() && !raidOver(),
      def: () => raiderDef(i),
    }),
  );
  const ALLY = {
    covenant: [
      ["Lancer Ibarra", "m"],
      ["Lancer Voss", "f"],
    ],
    tap: [
      ["Lineman Dooley", "m"],
      ["Lineman Petra", "f"],
    ],
  };
  ["ms_bo_ally1", "ms_bo_ally2"].forEach((id, i) =>
    ms.actor({
      id,
      when: () =>
        stage("mq32") === "raid" &&
        raidSite() === "battery" &&
        !raidOver() &&
        !!ALLY[batteryKey()],
      def: () => {
        const k = batteryKey();
        const c = siteLoc(k) || SITE[k].fallback;
        const a = ALLY[k][i];
        return {
          type: "human",
          name: a[0],
          gender: a[1],
          outfit: k === "covenant" ? "covenant_exo_rig" : "drifter",
          hat: k === "tap" ? "hardhat" : undefined,
          faction: "settlers",
          hostile: false,
          essential: true,
          ai: "guard",
          home: "here",
          homeR: 4,
          level: 10,
          hp: 260,
          weapon:
            k === "covenant"
              ? ["gyrojet_carbine", "assault_rifle"]
              : ["combat_shotgun", "hunting_rifle"],
          at: {
            fallback: { x: c.x + (i ? 2 : -2), z: c.z + 2, y: c.y },
            maxR: 5,
          },
          barks:
            k === "covenant"
              ? ["Iron keeps!", "Hold the gantry!"]
              : ["Mind the live cable!", "Sparks'll kill us if they cut it!"],
        };
      },
    }),
  );

  // the masked Dawn, seen once (never reachable, never killable, gone after the scene)
  let dawnBusy = false,
    lantern = null;
  function dawnSpot(where) {
    const W = G.world;
    if (where === "roof") {
      const r = L.anchor("tudor_city", ["ext_roof"], null);
      if (r && r.anchored && W && W.groundHeight) {
        const y = W.groundHeight(304, -167.6, r.y - 22, 0.3);
        if (isFinite(y) && Math.abs(y - (r.y - 24)) < 3)
          return { x: 304, y, z: -167.6, look: r }; // the Windsor wing's sign gantry, across the gap
      }
      const c = siteLoc("roof") || SITE.roof.fallback;
      return Object.assign(
        L.freeSpot(c.x - 28, c.z + 6, undefined, { maxR: 10 }),
        { look: c },
      );
    }
    if (W && W.groundHeight) {
      const y = W.groundHeight(-31.6, -222.6, 61, 0.3);
      if (isFinite(y) && y > 50) return { x: -31.6, y, z: -222.6, look: pl() }; // the ledge of One Times Square
    }
    const P = pl() || { x: -40, z: -262 };
    return Object.assign(
      L.freeSpot(P.x + 30, P.z + 30, undefined, { maxR: 10 }),
      { look: P },
    );
  }
  function dawnScene(where) {
    if (dawnBusy) return;
    dawnBusy = true;
    const p = dawnSpot(where);
    const lk = p.look || pl() || p;
    L.spawnNPC({
      id: "ms_dawn_masked",
      type: "sister_dawn",
      variant: "masked",
      name: "Woman in a Sun Mask",
      gender: "f",
      outfit: "glowkeeper_robes",
      faction: "glowkeepers",
      hostile: false,
      essential: true,
      ai: "static",
      level: 20,
      hp: 9999,
      noRespawn: true,
      pos: { x: p.x, y: p.y || 0, z: p.z },
      lookYaw: Math.atan2(-(lk.x - p.x), -(lk.z - p.z)),
    });
    try {
      const THREE = window.THREE;
      if (THREE && G.scene) {
        lantern = new THREE.PointLight(0xffc06a, 2.2, 14, 2);
        lantern.position.set(p.x + 0.4, (p.y || 0) + 2.1, p.z);
        G.scene.add(lantern);
        L.dyn({ object3d: lantern });
      }
    } catch (e) {
      lantern = null;
    }
    const lines =
      where === "roof"
        ? [
            [
              null,
              "[Across the gap, on the gantry of the second TUDOR CITY sign, a woman in grey robes stands in the red light. A gilt mask with twelve rays hides her face. She lifts a lantern and holds it there, looking at the two of you. Just looking.]",
              6,
            ],
            [
              "Rose",
              "[She has the rifle up before you see her move. One shot. It sparks off the gantry a hand's width from the mask.]",
              4.5,
            ],
            ["Rose", "I never miss.", 4],
            [
              null,
              "[The lantern goes out. When the sign flickers back, the gantry is empty.]",
              4,
            ],
          ]
        : [
            [
              null,
              "[High on the ledge of One Times Square, above the dead screens, a woman in grey robes and a gilt twelve-ray mask holds up a lantern at arm's length, the way you hold a light for someone coming down a dark stair. She is not looking at the battery. She is looking at you.]",
              7,
            ],
            [null, "[Then the lantern goes out, and the ledge is empty.]", 4],
          ];
    const t = ms.scene(lines);
    L.later(t + 0.6, () => {
      L.removeNPC("ms_dawn_masked");
      if (lantern && lantern.parent) lantern.parent.remove(lantern);
      lantern = null;
      dawnBusy = false;
      if (where !== "roof" && !L.has("ms_note_journal_lantern")) {
        L.give("ms_note_journal_lantern", 1);
        L.notify('Journal: "Something about the way she held the lantern."', {
          duration: 5,
        });
      }
      finishMq32();
    });
  }
  function finishMq32() {
    if (!Q.isActive("mq32")) return;
    if (raidSite() !== "roof" && !L.has("ms_note_journal_lantern"))
      L.give("ms_note_journal_lantern", 1);
    Q.complete("mq32");
  }
  L.hook("reset", function () {
    dawnBusy = false;
    lantern = null;
  });
  L.hook("spawn", function () {
    L.later(1.0, () => {
      if (!dawnBusy) L.removeNPC("ms_dawn_masked");
      if (stage("mq32") === "after" && !dawnBusy) finishMq32(); // loaded between the raid and the ledge
      if (stage("mq32") !== "raid" && !ms.f("kincaid_dead"))
        setEssential("neon_capt", true);
    });
  });
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "neon_capt") ms.set("kincaid_dead");
  });

  // the choice: Rose's roof or the battery
  ms.dlg("dlg_ms5_choose", "idle").add({
    idle: { text: "[You look around.]", responses: [{ text: "[Step back.]" }] },
    roof: {
      speaker: "Tudor City Roof",
      text: () =>
        "[The roof under the TUDOR CITY sign. Rose's blankets, her spotting scope, the parapet she keeps her rifle on. If you hold here tonight, nobody holds " +
        batteryName() +
        ".]",
      responses: [
        {
          text: "[Hold the roof with Rose.]",
          action: () => chooseRaid("roof"),
        },
        { text: "[Not yet.]" },
      ],
    },
    battery: {
      speaker: "Battery",
      text: () =>
        "[" +
        batteryName().charAt(0).toUpperCase() +
        batteryName().slice(1) +
        ". Twenty-eight volts the Second Sun needs. If you hold here tonight, nobody but the Unkindled and an old doorman holds Rose's roof.]",
      responses: [
        { text: "[Hold the battery.]", action: () => chooseRaid("battery") },
        { text: "[Not yet.]" },
      ],
    },
  });
  ms.spot({
    id: "ms5_choose_roof",
    when: () => stage("mq32") === "choose",
    at: Object.assign({ dx: -1.4 }, SITE.roof),
    label: "Hold the Roof",
    verb: "Choose",
    radius: 1.6,
    use() {
      ms.talk("dlg_ms5_choose", "Tudor City Roof", "roof");
    },
  });
  for (const k of ["neon", "covenant", "tap"]) {
    ms.spot({
      id: "ms5_choose_" + k,
      when: () => stage("mq32") === "choose" && batteryKey() === k,
      at: Object.assign({ dx: 1.5 }, SITE[k]),
      label: "Hold the Battery",
      verb: "Choose",
      radius: 1.8,
      use() {
        ms.talk("dlg_ms5_choose", "Battery", "battery");
      },
    });
  }
  ms.dlg("dlg_ms_rose")
    .add({
      mq32_choose: {
        speaker: "Rose",
        text: () =>
          "Jory saw robes on the Tudor stairs at noon, counting steps. And Sparks says somebody's been walking the cable to " +
          batteryName() +
          '. Same night, same hour. Dusk. [She checks the bolt without looking at it.] They want the battery for the Sun. And they want me. "For my safety." You can\'t be in two places, ' +
          first() +
          ".",
        responses: [
          { text: "I'm staying here. With you.", next: "mq32_stay" },
          {
            text: "If they get the battery, everybody burns. I have to hold it.",
            next: "mq32_go",
          },
          { text: "Let me think." },
        ],
      },
      mq32_stay: {
        speaker: "Rose",
        text: "[A long look. She doesn't say thank you. She moves her blankets so there's room for two behind the parapet.] Then get down. They come up the east stair first. They always come up the east stair.",
        responses: [
          { text: "[Take your position.]", action: () => chooseRaid("roof") },
        ],
      },
      mq32_go: {
        speaker: "Rose",
        text: "Then go. I've held this roof against worse than robes. [She doesn't look at you.] Go on. You're wasting light.",
        responses: [{ text: "[Go to the battery.]" }],
      },
      mq32_after: {
        speaker: "Rose",
        text: "[She is cleaning the rifle she already cleaned.] Don't ask me about the shot. I had her. The wind didn't move. I had her, and I pulled it. [The cloth stops.] I never pull it.",
        onEnter() {
          ms.set("mq32_after_talk");
        },
        responses: [
          { text: "[Don't ask.]" },
          { text: "Maybe you didn't want to hit her.", next: "mq32_after2" },
        ],
      },
      mq32_after2: {
        speaker: "Rose",
        text: "[Very quietly.] Don't.",
        responses: [{ text: "[Leave it.]" }],
      },
    })
    .when(() =>
      stage("mq32") === "choose" && !raidSite() ? "mq32_choose" : null,
    )
    .when(() =>
      Q.isComplete("mq32") &&
      ms.f("rose_defended") &&
      !ms.f("mq32_after_talk") &&
      !Q.isStarted("mq34")
        ? "mq32_after"
        : null,
    );
  ms.inject("dlg_neon_capt", {
    start: () =>
      stage("mq32") === "choose" &&
      !raidSite() &&
      batteryKey() === "neon" &&
      !ms.f("kincaid_dead")
        ? "mq32_kin"
        : null,
    nodes: {
      mq32_kin: {
        text: "You heard. Robes at dusk, coming for the Buzz. My guards hold the gates; I need somebody under the stage who isn't afraid of the dark. [She looks at you properly.] And I hear your sharpshooter's got trouble of her own tonight. Your call, topsider. I won't think less of you. Much.",
        responses: [
          {
            text: "I'll hold the Buzz with you.",
            action: () => chooseRaid("battery"),
          },
          { text: "Not yet, Captain." },
        ],
      },
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq32",
      giver: "Rose / Captain Kincaid / Sparks Malloy",
      location: "Tudor City roof, or the battery",
      desc: () =>
        "At dusk the Glowkeepers will strike twice: at " +
        batteryName() +
        ', for the Second Sun\'s twenty-eight volts, and at Tudor City, to take Rose below "for her safety". You can only be in one place.',
      stages: [
        {
          id: "choose",
          text: () =>
            "Choose: defend Rose's roof at Tudor City (with the Unkindled and Sol), or defend " +
            batteryName() +
            ".",
          markers: () => [
            plain(siteLoc("roof"), "Rose's Roof"),
            plain(siteLoc(batteryKey()), SITE[batteryKey()].label),
          ],
          onEnter() {
            if (!captive()) rose.place("home");
            L.later(1.5, () =>
              L.news(
                "Word from the street, listeners: the sun people have been moving in daylight, and they never move in daylight. Lock your doors at dusk. That's not a joke. Rocky doesn't joke about dusk.",
              ),
            );
          },
        },
        {
          id: "raid",
          text: () =>
            "Survive the raid (" +
            raidersDown() +
            "/" +
            RAIDERS.length +
            " Glowkeepers down).",
          markers: () => [
            plain(
              siteLoc(raidKey()),
              raidSite() === "roof" ? "Rose's Roof" : SITE[raidKey()].label,
            ),
          ],
          onEnter() {
            raidStart();
          },
        },
        {
          id: "after",
          text: () =>
            raidSite() === "roof"
              ? "Across the gap, a lantern."
              : "High on One Times Square, a lantern.",
          markers: () => [],
          onEnter() {
            L.later(2.5, () =>
              dawnScene(raidSite() === "roof" ? "roof" : "battery"),
            );
          },
        },
      ],
      rewards: { xp: 700 },
    });
  });
  ms.solver("mq32", {
    choose() {
      L.setFlag("ms_mq32_site", "roof");
      Q.setStage("mq32", "raid");
    },
    raid() {
      endRaid(false);
    },
    after() {
      finishMq32();
    },
  });

  // ==================================================================
  // MQ33 — KEEPER OF THE KEYS (Hollowell, alone in St. Patrick's)
  // ==================================================================
  const SP_FB = { x: 158, z: -342 };
  const ROSE_SP = {
    site: "st_patricks",
    anchors: ["congregation4", "crossing"],
    fallback: SP_FB,
  };
  function giveKey(how) {
    if (!ms.f("hollowell")) ms.set("hollowell", how);
    if (!L.has("q_track61_key")) L.give("q_track61_key", 1);
    ms.set("route_known");
    if (stage("mq33") === "confront") Q.setStage("mq33", "leave");
  }
  function hollowellFight() {
    L.setFlag("ms_mq33_fight", true);
    const a = L.npc("glow_ezra");
    if (a && !a.dead) a.essential = false;
    L.hostile("glow_ezra", true);
  }
  G.events.on("actorKilled", (a) => {
    if (!a || a.id !== "glow_ezra" || !Q.isActive("mq33")) return;
    ms.set("hollowell", "dead");
    L.notify(
      "You take a long brass key on a loop of altar cord from his robe. On a card in the same pocket, in a careful hand: M-61, WALDORF. OR 42nd ST, THE BULKHEAD.",
      { duration: 7 },
    );
    giveKey("dead");
  });
  function sendChildren() {
    if (ms.f("children_sent")) return;
    ms.set("children_sent");
    L.xp(120, "Sent the children north");
    L.standing(60, "The cult's children sent out of the city");
  }
  ms.inject("dlg_glow_ezra", {
    start: () =>
      stage("mq33") === "confront"
        ? "mq33_open"
        : stage("mq33") === "leave" ||
            (Q.isComplete("mq33") && !Q.isComplete("mq35"))
          ? "mq33_after"
          : null,
    nodes: {
      mq33_open: {
        text: () =>
          "[The cathedral is empty. The pews are stacked against the walls, the sun disc has come down off the altar, and every candle in the place has been carried below. Keeper Hollowell sits alone on the altar step with a ring of keys in his lap.]\n\n" +
          (rosePresent()
            ? "[He looks past you, at Rose, and his whole face changes.] Little Sun. You came home."
            : "You came alone. They brought the Little Sun down the night of the raid. [He turns a key over and over.] She did not come quietly. She never did anything quietly."),
        responses: [
          {
            text: "[Rose steps forward.]",
            cond: () => rosePresent(),
            next: "mq33_dont",
          },
          {
            text: "I need the way down to Track 61, Keeper.",
            cond: () => !rosePresent(),
            next: "mq33_keys",
          },
        ],
      },
      mq33_dont: {
        speaker: "Rose",
        text: "Don't.",
        responses: [
          {
            text: "[To Hollowell] The way down to Track 61, Keeper.",
            next: "mq33_keys",
          },
        ],
      },
      mq33_keys: {
        text: () =>
          "[He holds up one key from the ring: long, brass, on a loop of altar cord.] Sunday. Alone. She asked for alone. " +
          (ms.f("glow") === "convinced"
            ? "[He looks at it, and then at you.] You spoke plainly to me once, about a blessing forced on people who never asked for it. I have prayed on that every night since, and my prayers have started to sound like you."
            : "I have kept this key for eighteen years. I am not sure I know how to stop."),
        responses: [
          {
            text: "Give me the key, Ezra.",
            cond: () => ms.f("glow") === "convinced",
            next: "mq33_ally",
          },
          {
            text: "[Persuasion 60] The Light you preach doesn't ask anyone to hide a bomb under a train station. Give me the key.",
            cond: () => ms.f("glow") !== "convinced",
            check: { skill: "persuasion", value: 60 },
            next: "mq33_given",
            failNext: "mq33_no",
          },
          {
            text: () => "Rose. Ask him.",
            cond: () =>
              ms.f("glow") !== "convinced" && rosePresent() && ms.trust() >= 3,
            next: "mq33_rose_asks",
          },
          {
            text: "Then I'll take it off you.",
            cond: () => ms.f("glow") !== "convinced",
            next: "mq33_fight",
          },
          {
            text: "Who is she, Ezra? The Dawn. What's her name?",
            next: "mq33_name",
          },
        ],
      },
      mq33_name: {
        text: "[He closes his hand over the key.] No. Not from me. You should see her face before you hear it. [Something in his voice is almost kind.] Trust an old man on that one thing.",
        responses: [{ text: "The key, then.", next: "mq33_keys" }],
      },
      mq33_ally: {
        text: "[He puts the key in your palm and folds your fingers over it with both his hands.] Two doors go down. The Waldorf's freight shaft, M-61, welded since the year the Little Sun ran; this opens the hatch. Or the bulkhead under 42nd Street, past the old lower-level stair. [He doesn't let go yet.] I will come down after you and talk the young ones out of the fight, if they will hear me. And I am asking you, as a man who has nothing left to ask with: bring her out alive.",
        onEnter() {
          ms.set("hollowell", "ally");
          giveKey("ally");
        },
        responses: [
          { text: "I'll try.", next: "mq33_children" },
          { text: "I can't promise that.", next: "mq33_children" },
        ],
      },
      mq33_given: {
        text: "[A long silence. Then he laughs, once, tiredly.] Under a train station. When you say it like that. [He works the key off the ring and holds it out.] The Waldorf's freight shaft, M-61; this opens the welded hatch. Or the bulkhead under 42nd Street, past the old lower-level stair. Go whichever way you like. She will know you are coming either way.",
        onEnter() {
          ms.set("hollowell", "given");
          giveKey("given");
        },
        responses: [{ text: "Thank you, Keeper.", next: "mq33_children" }],
      },
      mq33_rose_asks: {
        speaker: "Rose",
        text: "[She doesn't step closer. She doesn't have to.] Ezra. You carried me up the steps of this church on your shoulders every Easter. You taught me my letters off the hymn board. [Her voice doesn't shake. Her hand does.] Give him the key.",
        responses: [{ text: "[Wait.]", next: "mq33_rose_given" }],
      },
      mq33_rose_given: {
        text: "[The old man bows his head over the key for a long time. When he holds it out, he holds it out to her, and she has to nod at you before he will let you take it.] The Waldorf shaft, M-61, or the bulkhead under 42nd Street. Little Sun. Whatever you are going down there to do, I loved you before you could walk.",
        onEnter() {
          ms.set("hollowell", "given");
          giveKey("given");
        },
        responses: [{ text: "[Take the key.]", next: "mq33_children" }],
      },
      mq33_no: {
        text: "Persuasion is my trade, child, and you are not very good at it. [He closes his hand.] No.",
        responses: [
          { text: "Then I'll take it off you.", next: "mq33_fight" },
          { text: "Who is she, Ezra?", next: "mq33_name" },
          { text: "[Walk away for now.]" },
        ],
      },
      mq33_fight: {
        text: "[He stands up slowly, an old man in heavy vestments, and lets the ring of keys fall to the altar step behind him.] Then take it. I will not make it easy, and I will not make it hard. I am too old for either.",
        responses: [
          { text: "[Fight him.]", action: () => hollowellFight() },
          { text: "[Wait. Not like this.]", next: "mq33_keys" },
        ],
      },
      mq33_children: {
        text: "[He glances at the crypt stairs.] The children are below us with Sister Noonday. Thirty-one of them. Their parents went down to the Sun Room on Wednesday; the children were not invited. If you have any mercy in you, tell Noonday to take them north tonight, up the river, as far as their feet will go.",
        onEnter() {
          L.setFlag("ms_mq33_children_known", true);
        },
        responses: [{ text: "I'll talk to her." }, { text: "[Leave.]" }],
      },
      mq33_after: {
        text: () =>
          ms.f("hollowell") === "ally"
            ? "Go on. I will be on the platform before the young ones are. Bring her out alive."
            : "[He is sitting where you left him, turning a ring with one key missing.] Sunday. Alone. You will do what you like. Everyone always has.",
        responses: [{ text: "[Leave him.]" }],
      },
    },
  });
  ms.inject("dlg_glow_sister", {
    start: () =>
      (Q.isActive("mq33") || (Q.isComplete("mq33") && !Q.isStarted("mq35"))) &&
      !ms.f("children_sent")
        ? "mq33_noon"
        : null,
    nodes: {
      mq33_noon: {
        text: "[Sister Noonday is sitting on the crypt stairs with a child asleep across her knees. More of them below, in blankets, between the tombs.] Shh. They only just went down. [She looks up at you.] The Keeper sent you. He has that look on his face these days, like a man reading his own will.",
        responses: [
          {
            text: "Take the children out of the city. Tonight. North, up the river.",
            next: "mq33_noon_yes",
          },
          { text: "Let me see what you have.", barter: true },
          { text: "Never mind." },
        ],
      },
      mq33_noon_yes: {
        text: "[She doesn't argue. She doesn't even ask why, which tells you she already knows.] Thirty-one of them, and me, and a handcart. [She lifts the sleeping child onto her shoulder.] We'll be past the Harlem by morning. If anybody asks, we were never here. The Noon be on you. ...No. Just: be careful.",
        onEnter() {
          sendChildren();
        },
        responses: [{ text: "Go safely, Sister." }],
      },
    },
  });
  ms.dlg("dlg_ms_rose")
    .add({
      mq33_here: {
        speaker: "Rose",
        text: "[She is standing just inside the doors, rifle slung, not looking at the altar.] Not since I was sixteen. [A breath.] I'm here. Don't make me say anything to him.",
        responses: [{ text: "You don't have to say a word." }],
      },
    })
    .when(() => (stage("mq33") === "confront" ? "mq33_here" : null));
  // A dead Keeper (from earlier): his keys lie on the altar step.
  ms.spot({
    id: "ms5_ezra_keys",
    when: () =>
      stage("mq33") === "confront" &&
      !!L.flag("dead_glow_ezra") &&
      !L.has("q_track61_key"),
    at: {
      site: "st_patricks",
      anchors: ["altar", "preacher", "pulpit"],
      fallback: { x: 168, z: -342 },
    },
    label: "Ring of Keys",
    verb: "Take",
    radius: 1.4,
    use() {
      L.notify(
        "A ring of keys on the altar step, and on one long brass key a card: M-61, WALDORF. OR 42nd ST, THE BULKHEAD.",
        { duration: 6 },
      );
      giveKey("dead");
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq33",
      giver: "Keeper Ezra Hollowell",
      location: "St. Patrick's Cathedral",
      desc: () =>
        "Hollowell stayed behind in the empty cathedral when the Glowkeepers went below. He has the key to Track 61, and he knows the Dawn's name. He will not say it.",
      stages: [
        {
          id: "confront",
          text: "Confront Keeper Hollowell in St. Patrick's Cathedral. Get the Track 61 key and the route.",
          markers: () =>
            [
              { npc: "glow_ezra", label: "Keeper Hollowell" },
              L.flag("dead_glow_ezra")
                ? {
                    anchor: ["st_patricks", ["altar", "preacher"]],
                    fallback: { x: 168, z: -342 },
                    label: "Ring of Keys",
                  }
                : null,
            ].filter(Boolean),
          onEnter() {
            if (!captive()) rose.place("at", ROSE_SP);
          },
        },
        {
          id: "leave",
          text: "You have the key and the way down. Speak to Sister Noonday about the children, or leave the cathedral.",
          markers: () =>
            ms.f("children_sent") || L.flag("dead_glow_sister")
              ? []
              : [{ npc: "glow_sister", label: "Sister Noonday" }],
        },
        {
          id: "children",
          text: "(Optional) Send the cult's children out of the city with Sister Noonday.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_mq33_children_known"),
          doneIf: () => !!ms.f("children_sent"),
          failIf: () => !!L.flag("dead_glow_sister") && !ms.f("children_sent"),
          markers: () => [{ npc: "glow_sister", label: "Sister Noonday" }],
        },
      ],
      rewards: { xp: 700, items: [["q_track61_key", 1]] },
      onComplete() {
        if (L.count("q_track61_key") > 1)
          L.take("q_track61_key", L.count("q_track61_key") - 1); // handed over in dialogue + the reward
        if (!ms.f("route_known")) ms.set("route_known");
        if (!ms.f("hollowell"))
          ms.set("hollowell", L.flag("dead_glow_ezra") ? "dead" : "given");
        if (!captive()) rose.place("home");
        if (ms.f("children_sent"))
          L.later(3, () =>
            L.news(
              "Odd sight on the Harlem River Drive this morning, listeners: a nun in yellow pushing a handcart, and thirty-odd kids behind her in a line, holding hands. Heading north. Whoever you are, Sister: Godspeed. Rocky means that.",
            ),
          );
      },
    });
  });
  // leaving the cathedral (or sending the children) closes the quest
  L.trigger({
    id: "ms5_sp_leave",
    once: false,
    cooldown: 2,
    cond: () =>
      stage("mq33") === "leave" &&
      (ms.f("children_sent") ||
        dist2(SP_FB) > 75 ||
        L.flag("dead_glow_sister")),
    fire() {
      Q.complete("mq33");
    },
  });
  ms.solver("mq33", {
    confront() {
      giveKey(ms.f("glow") === "convinced" ? "ally" : "given");
    },
    leave() {
      sendChildren();
      Q.complete("mq33");
    },
  });

  // ==================================================================
  // MQ34 — SUNDAY BEST (Saturday night at Grand Central)
  // ==================================================================
  const GC = { x: 240, z: -230 };
  const OYSTER = {
    site: "grand_central",
    anchors: ["bar", "oyster_bar", "merchant2"],
    fallback: { x: 226, z: -238 },
  };
  const ROSE_STEPS = {
    site: "grand_central",
    anchors: ["whispering_gallery", "bar", "oyster_bar"],
    fallback: { x: 229, z: -236 },
  };
  /** Allies the hero has earned, each with its condition (outline mq34 / NOTES). */
  const ALLIES = [
    {
      id: "lancers",
      name: "Lancers of the Iron Covenant",
      call: true,
      ok: () =>
        L.flag("mq_faction") === "covenant" || ms.f("torch") === "charter",
    },
    {
      id: "hale",
      name: "Lt. Hale and her defectors",
      call: true,
      ok: () => !!L.flag("hale_defects") && !L.flag("hale_dead"),
    },
    {
      id: "keel",
      name: "Major Keel",
      call: true,
      ok: () => ms.f("keel") === "defects",
    },
    {
      id: "kong",
      name: "KONG and his Brutes",
      call: true,
      ok: () => ms.f("kong") === "friend" && !L.flag("kong_dead"),
    },
    {
      id: "neon",
      name: "Captain Kincaid's Neon Guard",
      ok: () =>
        ms.f("sun_battery") === "neon" &&
        !ms.f("kincaid_dead") &&
        !L.flag("dead_neon_capt"),
    },
    {
      id: "gc_guards",
      name: "Grand Central's guards",
      ok: () => ms.f("glow") === "warned",
    },
    {
      id: "lys",
      name: "Mademoiselle Lys",
      ok: () => ms.f("bureau") === "sell" && !L.flag("dead_bs_lys"),
    },
    {
      id: "zeke",
      name: "Zeke Marlow",
      ok: () => ms.f("torch") !== "selective" && !L.flag("dead_lib_zeke"),
    },
    {
      id: "calloway",
      name: "Dr. Ruth Calloway",
      ok: () =>
        !L.flag("dead_ms_calloway") &&
        (!!ms.f("calloway_free") || L.alive("ms_calloway")),
    },
  ];
  const ALLY_BY = {};
  for (const a of ALLIES) ALLY_BY[a.id] = a;
  const musters = () => {
    const m = ms.f("musters");
    return Array.isArray(m) ? m.slice() : [];
  };
  const mustered = (id) => musters().indexOf(id) >= 0;
  function muster(id, quiet) {
    const a = ALLY_BY[id];
    if (!a || !a.ok() || mustered(id)) return false;
    const m = musters();
    m.push(id);
    ms.set("musters", m);
    if (!quiet)
      L.notify(a.name + " will hold the tunnels tomorrow.", {
        sub: "Sunday Best",
        quiet: true,
        duration: 4,
      });
    L.later(0.3, ms.pollRoster);
    return true;
  }
  function rockyCall() {
    if (ms.f("mq34_called")) return;
    ms.set("mq34_called");
    const came = [];
    for (const a of ALLIES) if (a.call && muster(a.id, true)) came.push(a.name);
    L.news(
      "A message for some friends of ours, listeners, and you know who you are. Tomorrow's Sunday. Wear your Sunday best, and wear it to Grand Central tonight. Bring the good boots. That's all. Rocky out.",
    );
    L.later(6, () =>
      L.notify(
        came.length
          ? "Over the evening, word comes back down the line to Grand Central: " +
              came.join(", ") +
              "."
          : "The call goes out. Nobody answers it tonight. Some favours don't stretch this far.",
        { duration: 7 },
      ),
    );
  }
  function closeMuster() {
    if (stage("mq34") === "muster") Q.setStage("mq34", "zeke");
  }
  function zekeDone() {
    ms.set("mq34_zeke");
    muster("zeke", true);
    muster("calloway", true);
    if (stage("mq34") === "zeke")
      Q.setStage("mq34", captive() ? "evac" : "rose");
  }
  function roseChoice(come) {
    if (ms.f("rose_with_eli") || ms.f("rose_stays")) {
      if (stage("mq34") === "rose") Q.setStage("mq34", "evac");
      return;
    }
    if (come && ms.trust() >= 3) ms.set("rose_with_eli");
    else ms.set("rose_stays");
    if (stage("mq34") === "rose") Q.setStage("mq34", "evac");
  }
  function evac(yes) {
    ms.set("mq34_evac_decided");
    if (yes) {
      ms.set("evac_gc");
      L.news(
        "Grand Central Market is closed tomorrow, folks. Stationmaster's orders. Don't ask, don't argue, don't come. Go see your cousins in Queens. Rocky's going to see his.",
      );
    }
    if (stage("mq34") === "evac") Q.setStage("mq34", "sleep");
  }
  function sleepToFive() {
    if (stage("mq34") !== "sleep") return;
    fade(() => {
      passTo(5.0, true);
      L.notify(
        "You sleep the way you slept in 1967: badly, and all at once. Delphine shakes you at five. Down on the concourse, somebody is already lacing boots.",
        { duration: 7 },
      );
    }, 1.4);
    L.later(1.6, () => {
      if (Q.isActive("mq34")) Q.complete("mq34");
    });
  }
  const rollText = () => {
    const m = musters()
      .map((id) => ALLY_BY[id] && ALLY_BY[id].name)
      .filter(Boolean);
    return m.length
      ? "On my board for tomorrow: " + m.join("; ") + "."
      : "My board for tomorrow is empty. That's not a criticism. That's a board.";
  };
  ms.inject("dlg_gc_delphine", {
    start: () => {
      const s = stage("mq34");
      return s === "muster"
        ? "mq34_roll"
        : s === "evac"
          ? "mq34_evac"
          : s === "sleep"
            ? "mq34_sleep"
            : null;
    },
    nodes: {
      mq34_roll: {
        text: () =>
          '[The Stationmaster has a chalkboard propped against the information booth and a stub of chalk behind her ear.] Everybody who walks in and says "Sunday best" gets their name on here and a cot for the night. ' +
          rollText(),
        responses: [
          {
            text: "Will your guards hold the lower stair tomorrow?",
            cond: () => ALLY_BY.gc_guards.ok() && !mustered("gc_guards"),
            next: "mq34_guards",
          },
          {
            text: "Will your guards hold the lower stair tomorrow?",
            cond: () =>
              !ALLY_BY.gc_guards.ok() && !L.flag("ms_mq34_guards_asked"),
            next: "mq34_noguards",
          },
          { text: "That's everyone who's coming.", next: "mq34_closed" },
          { text: "Not yet. I've got more people to ask." },
        ],
      },
      mq34_guards: {
        text: "You warned us about the water tower when you could have looked the other way. Kowalski and Ng have been waiting all week for somebody to shoot at who deserves it. They'll hold the lower stair. [She chalks it up.]",
        onEnter() {
          muster("gc_guards");
        },
        responses: [{ text: "Thank you, Stationmaster.", next: "mq34_roll" }],
      },
      mq34_noguards: {
        text: () =>
          ms.f("glow") === "planted"
            ? "Half my guards are still sick from whatever got into the water tower last month. I can't spare the ones who aren't."
            : "My guards guard my market. That's the job. Tomorrow, the market's the job. I'm sorry.",
        onEnter() {
          L.setFlag("ms_mq34_guards_asked", true);
        },
        responses: [{ text: "I understand.", next: "mq34_roll" }],
      },
      mq34_closed: {
        text: () =>
          rollText() +
          " [She dusts the chalk off her hands.] Then that's the board. Zeke's been sitting at Moe's bar for an hour pretending he isn't waiting for you. Go on.",
        onEnter() {
          closeMuster();
        },
        responses: [{ text: "Going." }],
      },
      mq34_evac: {
        text: "One more thing, and it's mine to decide but I want your word on it. Tomorrow there are two thousand people in this market by nine. If whatever's under my floor goes up, they go up with it. I can close the doors tonight and send everybody home. The robes will notice, if they're watching. They're always watching.",
        responses: [
          {
            text: "Close the market. Send everyone home.",
            action: () => evac(true),
            next: "mq34_evac_yes",
          },
          {
            text: "Keep it open. If the market empties, they'll know we're coming.",
            action: () => evac(false),
            next: "mq34_evac_no",
          },
        ],
      },
      mq34_evac_yes: {
        text: "Done. Rocky'll put it out on the air. [She looks up at the dark ceiling, at the old painted stars.] I was eight in the Camp, down there. I minded a baby so her mother could hand out candles. Funny what comes back.",
        responses: [{ text: "Get some sleep, Delphine." }],
      },
      mq34_evac_no: {
        text: "[A long breath through the nose.] Your call, sleeper. I'll keep the doors open and the coffee on and pretend it's a Sunday. [Quieter.] I was eight in the Camp, down there. I minded a baby so her mother could hand out candles. Funny what comes back.",
        responses: [{ text: "Get some sleep, Delphine." }],
      },
      mq34_sleep: {
        text: "There's a cot in my office behind the booth. Five o'clock, I'll shake you. I've never once overslept and I'm not starting tomorrow.",
        responses: [
          {
            text: "Wake me at five. [Sleep until 05:00.]",
            action: () => sleepToFive(),
          },
          { text: "Not yet." },
        ],
      },
    },
  });
  ms.spot({
    id: "ms5_cot",
    when: () => stage("mq34") === "sleep",
    at: {
      site: "grand_central",
      anchors: ["stationmaster", "office", "leader"],
      fallback: { x: 262, z: -236 },
      dx: 1.2,
    },
    label: "Cot (Stationmaster's Office)",
    verb: "Sleep until 05:00",
    radius: 1.5,
    use() {
      sleepToFive();
    },
  });
  // Rocky puts out the call
  ms.inject("dlg_rc_rocky", {
    start: () =>
      stage("mq34") === "muster" && !ms.f("mq34_called") ? "mq34_call" : null,
    nodes: {
      mq34_call: {
        text: "Pal. [He turns the mic off, which he never does.] I heard. Everybody's heard something, nobody's heard the same thing. What do you need?",
        responses: [
          {
            text: "Put out a call, Rocky. Everybody who owes me a favour: Grand Central, tonight.",
            next: "mq34_call2",
          },
          { text: "Nothing yet." },
        ],
      },
      mq34_call2: {
        text: 'In clear? On my air? [He thinks about it for exactly one second.] No. In code. Old trick from the fight game. "Wear your Sunday best." The ones who need to know will know. [Mic on. Big voice.] Good evening, New Rad City, this is Radio Free Manhattan, and I\'ve got a message for some friends...',
        onEnter() {
          rockyCall();
        },
        responses: [{ text: "Thanks, Rocky." }],
      },
    },
  });
  ms.inject("dlg_bs_lys", {
    start: () =>
      stage("mq34") === "muster" && ALLY_BY.lys.ok() && !mustered("lys")
        ? "mq34_lys"
        : null,
    nodes: {
      mq34_lys: {
        text: "You have the look of a man about to ask a woman to do something stupid on a Sunday. [She rolls a fresh sheet into the typewriter.] Ask, then.",
        responses: [
          { text: "Hold the tunnels with us tomorrow.", next: "mq34_lys2" },
          { text: "Never mind." },
        ],
      },
      mq34_lys2: {
        text: "[She types a line, reads it, pulls the sheet out and folds it into her coat.] I owe someone down there a debt I cannot pay in scrip. Very well. I will be on the platform stair at five, with a pistol I have never fired. Do not tell Paris.",
        onEnter() {
          muster("lys");
        },
        responses: [{ text: "There is no Paris, Lys." }],
      },
    },
  });
  ms.inject("dlg_neon_capt", {
    start: () =>
      stage("mq34") === "muster" && ALLY_BY.neon.ok() && !mustered("neon")
        ? "mq34_kin"
        : null,
    nodes: {
      mq34_kin: {
        text: "Topsider. You've got the face of a man with a favour and no scrip.",
        responses: [
          {
            text: "Tomorrow at five, under Grand Central. I need the Neon Guard on the tunnel stairs.",
            next: "mq34_kin2",
          },
          { text: "Never mind, Captain." },
        ],
      },
      mq34_kin2: {
        text: "You held the Buzz for us. [She doesn't make you wait.] Six guards and me. The Neon's been burned once already; we know the smell coming. We'll be there.",
        onEnter() {
          muster("neon");
        },
        responses: [{ text: "Thank you, Captain." }],
      },
    },
  });
  ms.inject("dlg_gc_moe", {
    add: [
      {
        node: "bar",
        responses: [
          {
            text: "Pour one for tomorrow, Moe.",
            cond: () => Q.isActive("mq34"),
            next: "mq34_moe",
          },
        ],
      },
    ],
    nodes: {
      mq34_moe: {
        text: "[He pours two, pushes one across, and drinks the other himself, which he never does.] On the house. Really on the house, this time. [He looks at the stool with ZEKE scratched into it.] You bring him back up those stairs. Both of you. I'm not scratching another name.",
        responses: [{ text: "Both of us, Moe." }],
      },
    },
  });
  // Zeke: he nearly says the name
  const ZEKE34 = {
    mq34_zeke: {
      speaker: "Zeke Marlow",
      text: "[Zeke is on his stool at the Oyster Bar, nursing something he hasn't touched.] Sit down. No, sit. [He waits until you do.] Something's been eating me since the North Woods. That sun on the slab. Twelve rays. The way they all say \"keep the light on\". I knew a girl who said that. Every night, at the door, like a joke between the two of you that I wasn't in on.",
      responses: [{ text: "Zeke.", next: "mq34_zeke2" }],
    },
    mq34_zeke2: {
      speaker: "Zeke Marlow",
      text: "[He turns the glass a full circle on the bar.] If it's who I think it is... she was always braver than the both of us. Don't make her be brave alone. She—",
      responses: [
        {
          text: "[Stop him.] Don't, Zeke. Whatever you're about to say. Not tonight.",
          next: "mq34_zeke3",
        },
        { text: "[Put a hand on his arm.] Not tonight.", next: "mq34_zeke3" },
      ],
    },
    mq34_zeke3: {
      speaker: "Zeke Marlow",
      text: () =>
        "...Okay. Okay, kid. [He finally drinks.] " +
        (ms.f("torch") === "selective"
          ? "I'm not holding a door for you tomorrow. You loaded that Directive, and I can't look at you and that at the same time. Ruth says she'll go down. She signed us into those pods; she figures she can sign us out of this. I'll be here. On my stool. Where I can see the stairs."
          : "I'll be on the platform stair at five with Ruth. Calloway. She signed us into those pods, she figures she can sign us out of this. And if you get to that firing set and you don't know which wire, you shout for me. I've been waiting twenty-two years to be useful."),
      onEnter() {
        zekeDone();
      },
      responses: [{ text: "Get some sleep, Zeke." }],
    },
  };
  ms.inject("dlg_lib_zeke", {
    start: () =>
      stage("mq34") === "zeke" ||
      (stage("mq34") === "muster" && !ms.f("mq34_zeke"))
        ? "mq34_zeke"
        : null,
    nodes: ZEKE34,
  });
  ms.dlg("dlg_ms5_zeke", "idle").add(
    Object.assign(
      {
        idle: {
          text: "[Zeke's stool is empty.]",
          responses: [{ text: "[Step back.]" }],
        },
      },
      ZEKE34,
    ),
  );
  ms.spot({
    id: "ms5_zeke_stool",
    when: () => stage("mq34") === "zeke" && !L.alive("lib_zeke"),
    at: Object.assign({ dx: 1.5, dz: 1 }, OYSTER),
    label: "Zeke's Stool",
    verb: "Sit",
    radius: 1.5,
    use() {
      if (L.flag("dead_lib_zeke")) {
        L.notify(
          "Zeke's stool. ZEKE, scratched into the seat. Nobody sits on it.",
        );
        zekeDone();
      } else ms.talk("dlg_ms5_zeke", "Zeke Marlow", "mq34_zeke");
    },
  });
  // Rose on the Oyster Bar steps
  ms.dlg("dlg_ms_rose")
    .add({
      mq34_steps: {
        speaker: "Rose",
        text: () =>
          "[Rose is sitting on the steps down to the Oyster Bar with the rifle across her knees, under the low tiled arches." +
          (ms.f("ring") === "rose" && ms.trust() >= 4
            ? " Your grandmother's ring is on her finger. She keeps turning it."
            : "") +
          "] Sit. [She shifts over.] Tell me about the blackout.",
        responses: [
          { text: "[Tell her.]", next: "mq34_blackout" },
          { text: "Why that?", next: "mq34_why" },
        ],
      },
      mq34_why: {
        speaker: "Rose",
        text: "Because it's the night before. Because everybody in this building is telling stories tonight and that's the one I want. Tell me.",
        responses: [{ text: "[Tell her.]", next: "mq34_blackout" }],
      },
      mq34_blackout: {
        speaker: "Rose",
        text: '[You tell her. November 1965, the whole Northeast dark at once, this concourse black as a mine. You broke open a Civil Defense locker for candles. A woman went from group to group with a box of matches, lighting them, saying somebody has to keep the light on. She drew a little sun on your candle box. You walked her home along 42nd Street.]\n\n[Rose listens without interrupting, and when you finish she says the last line with you, quietly, a beat ahead.] "...somebody has to keep the light on." [She looks at her hands.] I know it. I could say it before I could read. I wanted to hear it from somebody who was there.',
        responses: [
          { text: "Tomorrow. Come with me.", next: "mq34_come" },
          { text: "Tomorrow, stay up here. Please.", next: "mq34_stay" },
        ],
      },
      mq34_come: {
        speaker: "Rose",
        text: () =>
          ms.trust() >= 3
            ? "[She doesn't answer for a long time. Then she stands up, slings the rifle, and offers you a hand up off the step.] Five o'clock. I know a better way in than theirs. I've used it once, going the other direction."
            : "[She shakes her head.] No. You go your way, I go mine. I know a way in you don't, and I'll be there when it counts. [She doesn't look at you.] That's the most I've got.",
        onEnter() {
          roseChoice(true);
        },
        responses: [
          {
            text: () =>
              ms.trust() >= 3 ? "Five o'clock." : "Be careful, Rose.",
          },
        ],
      },
      mq34_stay: {
        speaker: "Rose",
        text: "[She looks at you for a long moment, and doesn't argue, and doesn't agree. She just starts cleaning the scope.] Get some sleep, Dad.",
        onEnter() {
          roseChoice(false);
        },
        responses: [{ text: "[Leave her be.]" }],
      },
    })
    .when(() => (stage("mq34") === "rose" ? "mq34_steps" : null));

  // the mustered allies at Grand Central (visible representatives; named characters stay with their own modules)
  const REPS = [
    {
      id: "ms_mu_lancer",
      ally: "lancers",
      name: "Lancer-Sergeant Okafor-Price",
      gender: "m",
      outfit: "covenant_exo_rig",
      weapon: ["gyrojet_carbine", "assault_rifle"],
      dx: 8,
      dz: 6,
      barks: ["Iron keeps.", "Five o'clock. We'll be ready at four."],
    },
    {
      id: "ms_mu_defector",
      ally: "hale",
      name: "Corporal Dunleavy",
      gender: "f",
      outfit: "continuity_uniform",
      weapon: ["gyrojet_carbine", "assault_rifle"],
      dx: -8,
      dz: 6,
      barks: [
        "The Lieutenant sends her regards. And twelve rifles.",
        "Never thought I'd sleep in a train station on purpose.",
      ],
    },
    {
      id: "ms_mu_neon",
      ally: "neon",
      name: "Neon Guard Sergeant Tobey",
      gender: "m",
      outfit: "combat_armor",
      weapon: ["assault_rifle", "hunting_rifle"],
      dx: 6,
      dz: -6,
      barks: [
        "Captain says hold the stair, we hold the stair.",
        "Smells like the Neon down there. Burnt.",
      ],
    },
  ];
  for (const r of REPS) {
    ms.actor({
      id: r.id,
      when: () =>
        (Q.isActive("mq34") ||
          (Q.isComplete("mq34") && !Q.isComplete("mq35"))) &&
        mustered(r.ally),
      def: () => ({
        type: "human",
        name: r.name,
        gender: r.gender,
        outfit: r.outfit,
        faction: "settlers",
        hostile: false,
        essential: true,
        ai: "guard",
        home: "here",
        homeR: 3,
        level: 12,
        hp: 320,
        weapon: r.weapon,
        at: {
          site: "grand_central",
          anchors: [],
          fallback: { x: GC.x + r.dx, z: GC.z + r.dz },
          maxR: 6,
        },
        barks: r.barks,
      }),
    });
  }

  L.hook("init", function () {
    ms.quest({
      id: "mq34",
      giver: "Stationmaster Delphine Okafor / Zeke / Rose",
      location: "Grand Central Market, Saturday night",
      desc: () =>
        "Tomorrow is Sunday. Grand Central fills up with whoever you have earned, to hold the tunnels while you go the last stretch. One quiet night first.",
      stages: [
        {
          id: "muster",
          text: "Muster your allies for the morning, then tell Stationmaster Delphine who is coming.",
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Delphine" },
          ],
          onEnter() {
            zekePlace(null);
            if (!captive()) rose.place("at", ROSE_STEPS);
            L.later(2, () =>
              L.hint(
                "ms5_muster",
                "Allies you muster tonight hold the tunnels behind you tomorrow, and the finale remembers who came.",
              ),
            );
          },
        },
        {
          id: "call",
          text: "(Optional) Ask Rocky Delgado to put out the call on Radio Free Manhattan.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            stage("mq34") === "muster" && ALLIES.some((a) => a.call && a.ok()),
          doneIf: () => !!ms.f("mq34_called"),
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
        {
          id: "ask_neon",
          text: "(Optional) Ask Captain Kincaid to bring the Neon Guard.",
          sideObjective: true,
          optional: true,
          showIf: () => stage("mq34") === "muster" && ALLY_BY.neon.ok(),
          doneIf: () => mustered("neon"),
          markers: () => [{ npc: "neon_capt", label: "Captain Kincaid" }],
        },
        {
          id: "ask_lys",
          text: "(Optional) Ask Mademoiselle Lys to stand with you.",
          sideObjective: true,
          optional: true,
          showIf: () => stage("mq34") === "muster" && ALLY_BY.lys.ok(),
          doneIf: () => mustered("lys"),
          markers: () => [{ npc: "bs_lys", label: "Mademoiselle Lys" }],
        },
        {
          id: "ask_guards",
          text: "(Optional) Ask Delphine for Grand Central's guards.",
          sideObjective: true,
          optional: true,
          showIf: () => stage("mq34") === "muster" && ALLY_BY.gc_guards.ok(),
          doneIf: () => mustered("gc_guards"),
        },
        {
          id: "zeke",
          text: "Talk to Zeke at the Oyster Bar.",
          markers: () =>
            L.alive("lib_zeke")
              ? [{ npc: "lib_zeke", label: "Zeke Marlow" }]
              : [
                  {
                    anchor: [OYSTER.site, OYSTER.anchors],
                    fallback: OYSTER.fallback,
                    label: "Zeke's Stool",
                  },
                ],
          onEnter() {
            if (ms.f("mq34_zeke"))
              L.later(0.2, () => {
                if (stage("mq34") === "zeke") zekeDone();
              });
          },
        },
        {
          id: "rose",
          text: "Talk to Rose on the Oyster Bar steps.",
          markers: () => [{ npc: rose.id, label: "Rose" }],
          onEnter() {
            if (captive() || ms.f("rose_with_eli") || ms.f("rose_stays")) {
              L.later(0.2, () => {
                if (stage("mq34") === "rose") Q.setStage("mq34", "evac");
              });
              return;
            }
            rose.place("at", ROSE_STEPS);
          },
        },
        {
          id: "evac",
          text: "Decide with Delphine whether to evacuate Grand Central.",
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Delphine" },
          ],
          onEnter() {
            if (captive())
              L.later(3, () =>
                L.notify(
                  "The Oyster Bar steps are empty tonight. Somewhere under your feet, they have her.",
                  { duration: 6 },
                ),
              );
          },
        },
        {
          id: "sleep",
          text: "Sleep until 05:00 (the cot in the Stationmaster's office).",
          markers: () => [
            {
              anchor: ["grand_central", ["stationmaster", "office", "leader"]],
              fallback: { x: 262, z: -236 },
              label: "Cot",
            },
          ],
        },
      ],
      rewards: { xp: 500 },
      onComplete() {
        if (ms.f("mq34_zeke")) {
          muster("zeke", true);
          muster("calloway", true);
        }
        if (!Array.isArray(ms.f("musters"))) ms.set("musters", []);
        if (!ms.f("rose_with_eli") && !ms.f("rose_stays") && !captive())
          ms.set("rose_stays");
      },
    });
  });
  ms.solver("mq34", {
    muster() {
      rockyCall();
      closeMuster();
    },
    zeke() {
      zekeDone();
    },
    rose() {
      roseChoice(true);
    },
    evac() {
      evac(false);
    },
    sleep() {
      sleepToFive();
      if (Q.isActive("mq34")) Q.complete("mq34");
    },
  });

  // ==================================================================
  // MQ35 — TRACK 61 (the outer lair; src/lair builds the place)
  // ==================================================================
  // Lair anchors (site 'lair', G.lair.getAnchor); fallbacks at Grand Central / the Waldorf so the quest degrades.
  const LAIR_FB = {
    m61_shaft: {
      site: "waldorf",
      anchors: ["m61_door", "sub_basement", "freight_elevator"],
      fallback: { x: 240, z: -342 },
    },
    bulkhead: {
      site: "grand_central",
      anchors: ["track61_bulkhead", "lower_stair"],
      fallback: { x: 236, z: -246 },
    },
    handcar_spur: {
      site: "grand_central",
      anchors: ["lower_stair"],
      fallback: { x: 240, z: -266 },
    },
    platform: {
      site: "grand_central",
      anchors: ["lower_stair"],
      fallback: { x: 248, z: -240 },
    },
    railcar: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 252, z: -238 },
    },
    candles_hall: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 254, z: -226 },
    },
    candle_r: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 255, z: -224 },
    },
    candle_pod7: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 252, z: -223 },
    },
    record_player: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 256, z: -228 },
    },
    drill: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 230, z: -222 },
    },
    m42_door: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 226, z: -226 },
    },
  };
  const lairOn = () =>
    !!(
      G.lair &&
      (typeof G.lair.getAnchor === "function" ||
        typeof G.lair.anchor === "function")
    );
  /** A lair anchor (or its fallback): {x,y,z, lair:true|false}. */
  function lp(name) {
    if (lairOn()) {
      const a = L.anchor("lair", [name], null, { noCache: true });
      if (a) return Object.assign(a, { lair: true });
    }
    const f = LAIR_FB[name];
    const p = L.anchor(f.site, f.anchors, f.fallback);
    return p ? Object.assign(p, { lair: false }) : null;
  }
  const lpAt = (name, dx, dz) => ({
    get x() {
      const p = lp(name);
      return p ? p.x + (dx || 0) : 0;
    },
    get z() {
      const p = lp(name);
      return p ? p.z + (dz || 0) : 0;
    },
    get y() {
      const p = lp(name);
      return p ? p.y : 0;
    },
  });
  const roseWithEli = () => !!ms.f("rose_with_eli") && !captive();
  const T61_Z = ["ms_t61_ember", "ms_t61_z1", "ms_t61_z2", "ms_t61_z3"];
  const T61_CREW = ["ms_t61_crew1", "ms_t61_crew2"];
  const killedAny = (ids) => ids.some((id) => !!L.flag("dead_" + id));
  const platformClear = () =>
    !!ms.f("mq35_stood_down") || T61_Z.every((id) => !!L.flag("dead_" + id));
  const tinderResolved = () => !!ms.f("mq35_drill_resolved");

  function alliesHold() {
    const m = musters()
      .map((id) => ALLY_BY[id] && ALLY_BY[id].name)
      .filter(Boolean);
    L.notify(
      m.length
        ? "Behind you, on the stairs, " +
            m.join(", ") +
            " take their places and hold."
        : "Behind you the stairs are empty. Nobody is holding them. You go on anyway.",
      { duration: 7 },
    );
  }
  function standDown(how) {
    if (ms.f("mq35_stood_down")) return;
    ms.set("mq35_stood_down", how || true);
    for (const id of T61_Z) {
      const a = L.npc(id);
      if (a && !a.dead && a.setHostile) {
        try {
          a.setHostile(false);
        } catch (e) {
          /* */
        }
      }
    }
    L.notify(
      how === "hollowell"
        ? 'An old voice from the stair behind you: "Children. Put them down." Keeper Hollowell comes down onto the platform in his vestments, and one by one the zealots lower their weapons and walk past you, up toward the light.'
        : "One by one the zealots lower their weapons and walk past you, up toward the light.",
      { duration: 8 },
    );
    L.later(5, () => {
      L.setFlag("ms_mq35_left", true);
      if (stage("mq35") === "platform") Q.setStage("mq35", "candles");
    });
  }
  function platformFight() {
    ms.set("mq35_fight");
    for (const id of T61_Z) L.hostile(id, true);
    const a = L.npc("ms_t61_ember");
    if (a) a.essential = false;
  }
  function tinder(how) {
    if (tinderResolved()) return;
    ms.set("mq35_drill_resolved", how);
    if (how === "persuade" || how === "jam") {
      ms.set("tinder_stopped");
      L.notify(
        how === "jam"
          ? "The bit seizes with a shriek and shears off at the chuck. Nobody is cutting anything through that plate before nine forty-seven."
          : "Brother Tinder lets the drill spin down. In the silence you can hear the record player again, two halls away.",
        { duration: 6 },
      );
      for (const id of T61_CREW) {
        const a = L.npc(id);
        if (a && !a.dead && a.setHostile) {
          try {
            a.setHostile(false);
          } catch (e) {
            /* */
          }
        }
      }
    } else if (how === "fight") {
      const a = L.npc("ms_tinder");
      if (a) a.essential = false;
      L.hostile("ms_tinder", true);
      for (const id of T61_CREW) L.hostile(id, true);
    }
    if (how !== "fight" && stage("mq35") === "drill")
      L.later(1, () => {
        if (stage("mq35") === "drill") Q.setStage("mq35", "door");
      });
  }
  function reachDoor() {
    if (!Q.isActive("mq35")) return;
    if (!killedAny(T61_Z.concat(T61_CREW))) ms.set("zealots_spared");
    if (G.time) passTo(9.5, false);
    Q.complete("mq35");
  }
  // the platform zealots (stand in the way; talk, fight, or Hollowell talks them down)
  T61_Z.forEach((id, i) =>
    ms.actor({
      id,
      when: () =>
        inStage("mq35", ["enter", "platform"]) && !L.flag("ms_mq35_left"),
      def: () => {
        const leader = i === 0;
        const c = lp("platform") || LAIR_FB.platform.fallback;
        return {
          type: leader ? "glowkeeper_brother" : "glowkeeper_zealot",
          seed: 340 + i,
          name: leader ? "Brother Ember" : "Glowkeeper Zealot",
          gender: i === 2 ? "f" : "m",
          outfit: "glowkeeper_robes",
          faction: "glowkeepers",
          hostile: !!ms.f("mq35_fight"),
          essential: leader && !ms.f("mq35_fight"),
          ai: "guard",
          home: "here",
          homeR: 3,
          level: 12,
          hp: leader ? 240 : 170,
          weapon: leader
            ? ["hunting_rifle", "bolt_rifle_32"]
            : [
                ["machete", "lead_pipe"],
                ["pipe_pistol", "pistol_10mm"],
                ["sledgehammer", "machete"],
              ][i % 3],
          dialogue: leader ? "dlg_ms5_ember" : undefined,
          at: {
            fallback: {
              x: c.x + (i - 1.5) * 2.2,
              z: c.z + (i % 2 ? 2 : -1),
              y: c.y,
            },
            maxR: 5,
          },
          barks: [
            "Keep the light on.",
            "Turn back, sleeper.",
            "She said you would come.",
          ],
        };
      },
    }),
  );
  ms.dlg("dlg_ms5_ember", "idle")
    .when(() =>
      !ms.f("mq35_stood_down") && !ms.f("mq35_fight") ? "ember" : null,
    )
    .add({
      idle: {
        text: () =>
          ms.f("mq35_stood_down")
            ? "Go on. We are going up."
            : "[Brother Ember bars the platform with a rifle held across his chest.]",
        responses: [
          {
            text: "Stand aside, Brother.",
            next: "ember",
            cond: () => !ms.f("mq35_stood_down") && !ms.f("mq35_fight"),
          },
          { text: "[Leave.]" },
        ],
      },
      ember: {
        text: () =>
          "[A young man in ivory robes, a gold stole, a rifle he holds like a broom. Three zealots behind him, faces wrapped.] The Dawn said the sleeper would come down this way. She said to let you pass. [His jaw works.] She didn't say anything about letting you pass with a gun in your hand." +
          (ms.f("hollowell") === "ally"
            ? " ...Is that the Keeper's voice? On the stair?"
            : ""),
        responses: [
          {
            text: "[Wait for Hollowell.]",
            cond: () => ms.f("hollowell") === "ally",
            action: () => standDown("hollowell"),
          },
          {
            text: "[Persuasion 50] Nobody on this platform has to burn today. Go up. It's a Sunday. Go and see it.",
            check: { skill: "persuasion", value: 50 },
            next: "ember_yes",
            failNext: "ember_no",
          },
          {
            text: "[Presence 6] [Say nothing. Walk toward him until he has to decide.]",
            check: { attr: "presence", value: 6 },
            next: "ember_yes",
            failNext: "ember_no",
          },
          { text: "Move, or I move you.", next: "ember_fight" },
        ],
      },
      ember_yes: {
        text: "[He looks at you for a long time. Then at the three behind him. Then he lowers the rifle, and they lower theirs.] Up, then. [Almost a laugh.] I've never seen it on a Sunday. The sky.",
        onEnter() {
          standDown("talk");
        },
        responses: [{ text: "Go on." }],
      },
      ember_no: {
        text: "No. No. You don't get to walk in here and make it simple. [The rifle comes up.]",
        responses: [{ text: "[Fight.]", action: () => platformFight() }],
      },
      ember_fight: {
        text: "[He swallows.] Then keep the light on, sleeper. [The rifle comes up.]",
        responses: [{ text: "[Fight.]", action: () => platformFight() }],
      },
    });
  // Brother Tinder's drill crew
  // removeWhenOff:false — after mq35 the finale may spawn/reuse `ms_tinder`; this file must never remove that actor.
  ms.actor({
    id: "ms_tinder",
    removeWhenOff: false,
    when: () => inStage("mq35", ["candles", "drill", "door"]),
    def: () => {
      const c = lp("drill") || LAIR_FB.drill.fallback;
      return {
        type: "brother_tinder",
        name: "Brother Tinder",
        gender: "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: ms.f("mq35_drill_resolved") === "fight",
        essential: ms.f("mq35_drill_resolved") !== "fight",
        ai: "guard",
        home: "here",
        homeR: 2,
        level: 13,
        hp: 300,
        weapon: ["sledgehammer", "lead_pipe"],
        dialogue: "dlg_ms5_tinder",
        at: { fallback: { x: c.x, z: c.z, y: c.y }, maxR: 4 },
        barks: [
          "Mind the swarf.",
          "Nine forty-seven. Plenty of time.",
          "Water on the bit! WATER!",
        ],
      };
    },
  });
  T61_CREW.forEach((id, i) =>
    ms.actor({
      id,
      when: () => inStage("mq35", ["candles", "drill", "door"]),
      def: () => {
        const c = lp("drill") || LAIR_FB.drill.fallback;
        return {
          type: "glowkeeper_acolyte",
          seed: 360 + i,
          name: "Drill Crew",
          gender: i ? "f" : "m",
          outfit: "glowkeeper_robes",
          faction: "glowkeepers",
          hostile: ms.f("mq35_drill_resolved") === "fight",
          ai: "guard",
          home: "here",
          homeR: 2,
          level: 9,
          hp: 120,
          weapon: ["lead_pipe", "machete"],
          at: {
            fallback: { x: c.x + (i ? 1.8 : -1.8), z: c.z + 1.2, y: c.y },
            maxR: 4,
          },
        };
      },
    }),
  );
  ms.dlg("dlg_ms5_tinder", "idle")
    .when(() => (!tinderResolved() ? "tinder" : null))
    .add({
      idle: {
        text: () =>
          tinderResolved()
            ? "[Brother Tinder sits on an upturned bucket beside the silent drill, wiping his goggles on his apron.]"
            : "[The drill screams.]",
        responses: [
          { text: "Tinder.", next: "tinder", cond: () => !tinderResolved() },
          { text: "[Leave him.]" },
        ],
      },
      tinder: {
        text: () =>
          "[A stocky man in a leather apron over his robe, welding goggles pushed up into a grey beard, stands at a steel door-plate with a drill rig bolted to it. The bit screams into the plate; two Brothers feed it water from buckets.] Mind the swarf, sleeper. The Dawn said you'd come by this way and to let you through. She didn't say anything about letting you touch my drill. " +
          (ms.f("keyB") === "destroyed"
            ? "Somebody dropped the navigator's key in the harbour. So I'm cutting a new keyway into the lock plate. Through by nine forty-seven, God and the bit willing."
            : "You've got the navigator's key in your pocket, I hear. The Dawn doesn't like depending on one man's pocket. So: a spare keyway. Through by nine forty-seven."),
        responses: [
          {
            text: "[Persuasion 55] Put it down, Tinder. You build things. This unbuilds everything you ever built.",
            check: { skill: "persuasion", value: 55 },
            next: "tinder_yes",
            failNext: "tinder_no",
          },
          {
            text: "[Mechanics 50] [Reach past him and slam the feed lever into reverse while the bit is under load.]",
            check: { skill: "mechanics", value: 50 },
            next: "tinder_jam",
            failNext: "tinder_no",
          },
          { text: "Step away from the drill. Now.", next: "tinder_fight" },
          {
            text: "[Walk on.] Keep drilling, Brother. It isn't my door.",
            next: "tinder_pass",
          },
        ],
      },
      tinder_yes: {
        text: "[He looks at the bit for a long moment. Then he reaches up and shuts off the motor, and the silence is enormous.] Twenty years I've been her hands. [He sits down on a bucket.] I'll wait here. If she wants it finished she can come and tell me herself.",
        onEnter() {
          tinder("persuade");
        },
        responses: [{ text: "[Go on.]" }],
      },
      tinder_jam: {
        text: "[The bit bites, binds, and shears off at the chuck with a sound like a church bell dropped down a stair. Tinder stares at it.] ...That was a good bit. That was my last good bit. [He sits down heavily on a bucket.]",
        onEnter() {
          tinder("jam");
        },
        responses: [{ text: "[Go on.]" }],
      },
      tinder_no: {
        text: "[He doesn't even look round.] Go on, sleeper. She's waiting. I've got a schedule.",
        responses: [
          { text: "Step away from the drill. Now.", next: "tinder_fight" },
          { text: "[Walk on.]", next: "tinder_pass" },
        ],
      },
      tinder_fight: {
        text: "[He picks up a sledge from beside the rig.] Then come and stop it.",
        responses: [{ text: "[Fight.]", action: () => tinder("fight") }],
      },
      tinder_pass: {
        text: "Good man. Mind the swarf.",
        onEnter() {
          tinder("pass");
        },
        responses: [{ text: "[Walk on.]" }],
      },
    });
  // Shooting at the platform crew (or the drill crew) before the talk turns it into a fight.
  G.events.on("actorDamaged", (a, dmg, info) => {
    if (!a || !Q.isActive("mq35") || !info || info.source !== "player") return;
    if (
      T61_Z.indexOf(a.id) >= 0 &&
      !ms.f("mq35_fight") &&
      !ms.f("mq35_stood_down")
    )
      platformFight();
    if (
      (a.id === "ms_tinder" || T61_CREW.indexOf(a.id) >= 0) &&
      !tinderResolved()
    )
      tinder("fight");
  });
  G.events.on("actorKilled", (a) => {
    if (!a || !Q.isActive("mq35")) return;
    if (a.id === "ms_tinder" && ms.f("mq35_drill_resolved") === "fight") {
      ms.set("tinder_stopped");
      if (stage("mq35") === "drill")
        L.later(1, () => {
          if (stage("mq35") === "drill") Q.setStage("mq35", "door");
        });
    }
  });
  // the Hall of Candles
  const HALL = {
    candle_r: { label: 'Candle Marked "R."', node: "r" },
    candle_pod7: { label: "Burned-Down Candle", node: "pod7" },
    record_player: { label: "Record Player", node: "record" },
  };
  ms.dlg("dlg_ms5_candles", "idle").add({
    idle: {
      text: "[Candles. More than you can count.]",
      responses: [{ text: "[Step back.]" }],
    },
    hall: {
      speaker: "Hall of Candles",
      text: "[A long vaulted hall off the platform, once a baggage room, given over now to candles: on every ledge, on crates, on the floor in rows, one for every name the city lost. The air is warm and thick with wax. Near the door, apart from the rest, eleven small candles burn in a ring of jam jars.]",
      onEnter() {
        ms.set("mq35_hall");
      },
      responses: [{ text: "[Go further in.]" }],
    },
    r: {
      speaker: "Candle",
      text: () =>
        "[A candle in a glass, by itself on a ledge, the letter R scratched into the glass. The wax is new, the wick trimmed this morning. It has the look of something that has never once been allowed to go out.]" +
        (roseWithEli()
          ? "\n\n[Rose stops in front of it. She stands there long enough that you hear the record player change sides of the room in your head. She doesn't blow it out.]"
          : ""),
      onEnter() {
        ms.set("mq35_candle_r");
        if (roseWithEli())
          L.later(0.5, () => rose.say("...Leave it. Let's go."));
      },
      responses: [{ text: "[Move on.]" }],
    },
    pod7: {
      speaker: "Candle",
      text: '[In the middle of the hall, on an upturned crate, the stump of a candle that has been burned down and replaced and burned down again: twenty-two rings of wax, one on top of another, each a slightly different colour, like the rings of a tree. Pinned under the bottom ring, a scrap of paper gone brown. Two words, in pencil: "pod 7".]\n\n[You told one person on earth where you would be sleeping.]',
      onEnter() {
        ms.set("mq35_pod7");
        L.later(0.5, () => {
          if (stage("mq35") === "candles") Q.setStage("mq35", "drill");
        });
      },
      responses: [{ text: "[...]" }],
    },
    record: {
      speaker: "Record Player",
      text: '[In an alcove, a wind-up record player turns, slow and a little warped: "Two Bits and a Kiss". Somebody wound it this morning. Somebody winds it every morning.]',
      onEnter() {
        ms.set("mq35_record");
      },
      responses: [{ text: "[Let it play.]" }],
    },
  });
  for (const k in HALL) {
    ms.spot({
      id: "ms5_" + k,
      when: () => inStage("mq35", ["candles", "drill", "door"]),
      at: lpAt(k),
      label: HALL[k].label,
      verb: "Look",
      radius: 1.3,
      use() {
        ms.talk("dlg_ms5_candles", HALL[k].label, HALL[k].node);
      },
    });
  }
  ms.spot({
    id: "ms5_m42",
    when: () => stage("mq35") === "door",
    at: lpAt("m42_door"),
    label: "M42 Door",
    verb: "Open",
    radius: 1.8,
    use() {
      reachDoor();
    },
  });
  // progression by place
  function t61Update() {
    const s = stage("mq35");
    if (!s) return;
    if (s === "enter") {
      const pf = lp("platform");
      if (pf && pf.lair && dist2(pf) < 30 && L.inInterior())
        Q.setStage("mq35", "platform");
      else if (!lairOn()) {
        for (const k of ["m61_shaft", "bulkhead", "handcar_spur"]) {
          const p = lp(k);
          if (p && dist2(p) < 6) {
            Q.setStage("mq35", "platform");
            break;
          }
        }
      }
    } else if (s === "platform") {
      if (
        ms.f("hollowell") === "ally" &&
        !ms.f("mq35_stood_down") &&
        !ms.f("mq35_fight")
      ) {
        const pf = lp("platform");
        if (pf && dist2(pf) < 14) standDown("hollowell");
      }
      const em = L.npc("ms_t61_ember");
      if (
        em &&
        !em.dead &&
        !ms.f("mq35_stood_down") &&
        !ms.f("mq35_fight") &&
        !L.flag("ms_mq35_ember_met") &&
        dist2(em.pos) < 6 &&
        G.state === "play"
      ) {
        L.setFlag("ms_mq35_ember_met", true);
        L.startDialogue("dlg_ms5_ember", "ms_t61_ember");
      }
      const ch = lp("candles_hall");
      if (platformClear() || (ch && dist2(ch) < 7))
        Q.setStage("mq35", "candles");
    } else if (s === "candles") {
      const ch = lp("candles_hall");
      if (ch && dist2(ch) < 6 && !ms.f("mq35_hall") && G.state === "play") {
        ms.set("mq35_hall");
        ms.talk("dlg_ms5_candles", "Hall of Candles", "hall");
      }
      const dr = lp("drill");
      if (dr && dist2(dr) < 6) Q.setStage("mq35", "drill");
    } else if (s === "drill") {
      if (
        ms.f("mq35_drill_resolved") === "fight" &&
        (L.flag("dead_ms_tinder") ||
          T61_CREW.every((id) => !!L.flag("dead_" + id)))
      ) {
        ms.set("tinder_stopped");
        Q.setStage("mq35", "door");
        return;
      }
      const dr = lp("drill");
      const a = L.npc("ms_tinder");
      if (
        !tinderResolved() &&
        a &&
        !a.dead &&
        dr &&
        dist2(dr) < 5 &&
        !L.flag("ms_mq35_tinder_met") &&
        G.state === "play"
      ) {
        L.setFlag("ms_mq35_tinder_met", true);
        L.startDialogue("dlg_ms5_tinder", "ms_tinder");
      }
      const d = lp("m42_door");
      if (d && dist2(d) < 7) Q.setStage("mq35", "door");
    } else if (s === "door") {
      const d = lp("m42_door");
      if (d && dist2(d) < 3.2) reachDoor();
    }
  }

  L.hook("init", function () {
    ms.quest({
      id: "mq35",
      giver: "Sunday, 05:00",
      location: "Track 61, under Grand Central",
      desc: () =>
        "Sunday, five in the morning. Down the welded shaft or through the bulkhead" +
        (roseWithEli() ? ", or by Rose's old handcar spur," : "") +
        " to the platform where a President's armoured railcar has sat since before the war, through the Hall of Candles, to the M42 door. The Second Sun is set for 09:47.",
      stages: [
        {
          id: "enter",
          text: () =>
            roseWithEli()
              ? "Go down to Track 61: Rose knows the handcar spur, or use the hatch key at the Waldorf M-61 shaft or the 42nd Street bulkhead."
              : "Go down to Track 61 with the hatch key: the Waldorf M-61 shaft or the 42nd Street bulkhead.",
          markers: () => {
            const out = [
              plain(lp("m61_shaft"), "M-61 Shaft (Waldorf)"),
              plain(lp("bulkhead"), "The Bulkhead (42nd St)"),
            ];
            if (roseWithEli() || ms.f("rose_stays"))
              out.push(plain(lp("handcar_spur"), "Handcar Spur"));
            return out.filter(Boolean);
          },
          onEnter() {
            ms.set("track61_open");
            if (captive()) rose.place("gone");
            else if (roseWithEli()) {
              rose.place("follow");
              L.later(2, () =>
                rose.say(
                  "Handcar spur's at the Park Avenue end. I left a lantern on the rail in '84. Bet it's still there.",
                ),
              );
            } else rose.place("gone"); // she goes in alone by her own route
            L.later(1.2, () =>
              L.notify(
                "Sunday. 05:00. The concourse clock still says 9:47, the way it has for twenty-two years.",
                { duration: 6 },
              ),
            );
          },
        },
        {
          id: "platform",
          text: "Cross Track 61. Your allies hold the stairs behind you.",
          markers: () =>
            [
              ms.f("mq35_stood_down")
                ? null
                : { npc: "ms_t61_ember", label: "Brother Ember" },
              plain(lp("railcar"), "Track 61"),
              plain(lp("candles_hall"), "Hall of Candles"),
            ]
              .filter(Boolean)
              .slice(0, 2),
          onEnter() {
            alliesHold();
            L.later(0.3, ms.pollRoster);
          },
        },
        {
          id: "candles",
          text: "Pass through the Hall of Candles.",
          markers: () => [plain(lp("candle_pod7"), "Hall of Candles")],
        },
        {
          id: "drill",
          text: "Stop Brother Tinder's drill crew, or let them work.",
          markers: () =>
            [
              tinderResolved()
                ? null
                : { npc: "ms_tinder", label: "Brother Tinder" },
              plain(lp("m42_door"), "M42 Door"),
            ]
              .filter(Boolean)
              .slice(0, 1),
        },
        {
          id: "door",
          text: "Reach the M42 door.",
          markers: () => [plain(lp("m42_door"), "M42 Door")],
          onEnter() {
            L.notify("09:30.", { duration: 3 });
          },
        },
        {
          id: "spare",
          text: "(Optional) Get past the zealots without killing them.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            inStage("mq35", ["platform", "candles", "drill", "door"]),
          doneIf: () => !!ms.f("zealots_spared"),
          failIf: () => killedAny(T61_Z.concat(T61_CREW)),
        },
        {
          id: "r_candle",
          text: '(Optional) The candle marked "R."',
          sideObjective: true,
          optional: true,
          showIf: () => !!ms.f("mq35_hall"),
          doneIf: () => !!ms.f("mq35_candle_r"),
          markers: () => [plain(lp("candle_r"), 'Candle "R."')],
        },
        {
          id: "record",
          text: "(Optional) The record player in the alcove.",
          sideObjective: true,
          optional: true,
          showIf: () => !!ms.f("mq35_hall"),
          doneIf: () => !!ms.f("mq35_record"),
          markers: () => [plain(lp("record_player"), "Record Player")],
        },
      ],
      rewards: { xp: 900 },
      onComplete() {
        ms.set("lair_open");
        L.setFlag("ms_mq35_left", true);
        // the drill crew stays for the finale's own Tinder (src/lair may reuse ms_tinder): leave him where he is
        L.later(0.5, () => {
          for (const id of T61_Z)
            if (L.npc(id) && !L.flag("dead_" + id)) L.removeNPC(id);
        });
        if (!Q.get("mq36"))
          L.later(2, () =>
            L.notify(
              "The M42 door stands open. Beyond it, a dosimeter is clicking and a record is playing.",
              { duration: 6 },
            ),
          );
      },
    });
  });
  ms.solver("mq35", {
    enter() {
      Q.setStage("mq35", "platform");
    },
    platform() {
      standDown("talk");
      Q.setStage("mq35", "candles");
    },
    candles() {
      ms.set("mq35_hall");
      ms.set("mq35_pod7");
      Q.setStage("mq35", "drill");
    },
    drill() {
      tinder("persuade");
      Q.setStage("mq35", "door");
    },
    door() {
      reachDoor();
    },
  });

  // ==================================================================
  // Polling (game time) + lock audit
  // ==================================================================
  let tick = 0;
  L.hook("update", function (dt) {
    tick += dt;
    if (tick < 0.5) return;
    const step = tick;
    tick = 0;
    if (!L.isWorldBuilt() || !G.player) return;
    try {
      raceUpdate(step);
    } catch (e) {
      G.reportError("quests:ms5:race", e);
    }
    try {
      raidUpdate(step);
    } catch (e) {
      G.reportError("quests:ms5:raid", e);
    }
    try {
      t61Update();
    } catch (e) {
      G.reportError("quests:ms5:t61", e);
    }
  });
  L.hook("register", function () {
    if (
      !G.isStub("locks") &&
      G.locks &&
      typeof G.locks.obtainableFrom === "function"
    ) {
      try {
        G.locks.obtainableFrom("q_track61_key", "Keeper Hollowell (mq33)");
      } catch (e) {
        /* optional */
      }
    }
  });

  // Debug: G.quests.debug.ms5
  G.quests.debug.ms5 = {
    wreck: () => {
      const c = wc();
      return { x: c.x, y: c.y, z: c.z, anchored: !!c.anchored };
    },
    race: () => ({
      t: L.flag("ms_mq31_race_t"),
      breach: !!L.flag("ms_mq31_breach"),
      denied: !!ms.f("sun_word_denied"),
      glow: !!ms.f("sun_word_glow"),
    }),
    raid: () => ({
      site: raidSite(),
      key: raidKey(),
      t: L.flag("ms_mq32_raid_t"),
      down: raidersDown(),
      over: raidOver(),
    }),
    dawn: (w) => dawnScene(w || "roof"),
    musters: () => musters(),
    lair: () =>
      Object.keys(LAIR_FB).map((k) => {
        const p = lp(k);
        return (
          k +
          ": " +
          (p
            ? Math.round(p.x) +
              "," +
              Math.round(p.z) +
              (p.lair ? " (lair)" : " (fallback)")
            : "-")
        );
      }),
  };
})();
