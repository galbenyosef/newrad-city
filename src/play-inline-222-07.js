// play-inline-222 07 — home
// Lines 1429-1771 of readable/play-inline-222.pretty.js (statement-aligned).
  function spawnDomino() {
    const P = (n, dx, dz) => OUT("domino_sugar", n, dx, dz);
    let p = P("boss");
    if (p)
      spawn({
        id: "ph_sweet_tooth",
        type: "brute",
        name: "Sweet Tooth",
        faction: "brutes",
        hostile: true,
        level: 12,
        hp: 420,
        dr: 12,
        pos: p,
        ai: "guard",
        home: home(p, 7),
        noRespawn: true,
        inventory: [
          ["ph_key_domino_qc", 1],
          ["ph_candy_cane", 1],
          ["freedom_flakes", 4],
          ["scrip", 85],
        ],
        barks: [
          "TINY HUMAN! TINY HUMAN IS CANDY!",
          "SWEET TOOTH WANTS A TREAT!",
          "DIP IN SYRUP! ROLL IN SUGAR!",
          "NO TOUCH SWEET TOOTH SUGAR!",
        ],
      });
    p = P("spawn4");
    if (p)
      spawn({
        id: "ph_dom_gumdrop",
        type: "brute",
        name: "Gumdrop",
        faction: "brutes",
        hostile: true,
        level: 9,
        pos: p,
        ai: "guard",
        home: home(p, 6),
        noRespawn: true,
        barks: ["Gumdrop hear you.", "Tiny human. Tiny snack."],
      });
    p = P("spawn6");
    if (p)
      spawn({
        id: "ph_dom_taffy",
        type: "brute",
        name: "Taffy",
        faction: "brutes",
        hostile: true,
        level: 9,
        pos: p,
        ai: "wander",
        home: home(p, 8),
        noRespawn: true,
        barks: ["Boiler warm. Taffy warm. Human warm soon."],
      });
    // the yard camp outside (the refinery's welcoming committee)
    p = P("spawn_out1");
    if (p)
      spawn({
        id: "ph_dom_yard1",
        type: "brute",
        name: "Lollipop",
        faction: "brutes",
        hostile: true,
        level: 8,
        pos: p,
        ai: "guard",
        home: home(p, 9),
        noRespawn: true,
        barks: [
          "TINY HUMAN COME TO CANDY FACTORY!",
          "Lollipop hungry. Lollipop ALWAYS hungry.",
        ],
      });
    p = P("spawn_out2");
    if (p)
      spawn({
        id: "ph_dom_yard2",
        type: "brute",
        name: "Butterscotch",
        faction: "brutes",
        hostile: true,
        level: 8,
        pos: p,
        ai: "wander",
        home: home(p, 10),
        noRespawn: true,
        barks: ["Butterscotch smell tiny human.", "FREEDOM! FLAKES!"],
      });
    // the Pure Cane Reserve (quest item)
    if (
      !qDone("ph_q_sugar") &&
      !PH.hasItem("ph_sugar_crate") &&
      !PH.flag("sugar_taken")
    ) {
      const c = A("domino_sugar", "qc_crate");
      if (c)
        PH.pickup("ph_sugar_crate", 1, PH.v3(c.x, c.y + 0.05, c.z), {
          noSave: true,
        });
    }
  }
  function spawnHudson() {
    const P = (n, dx, dz) => OUT("uss_hudson", n, dx, dz);
    let p = P("boss");
    if (p)
      spawn({
        id: "ph_commodore",
        type: "raider",
        outfit: "raider_heavy",
        name: "Commodore Hatch",
        faction: "raiders",
        hostile: true,
        level: 13,
        hp: 380,
        dr: 14,
        pos: p,
        ai: "guard",
        home: home(p, 5),
        noRespawn: true,
        weapon: PH.item("ph_broadside", "combat_shotgun", "sawed_off_shotgun"),
        inventory: [
          ["ph_key_hudson", 1],
          ["ph_commodore_hat", 1],
          ["scrip", 160],
          [PH.item("ammo_12ga") || "scrip", 16],
        ],
        barks: [
          "All hands! Repel boarders!",
          "You're standing on MY bridge!",
          "I am the Commodore of this harbor!",
          "Fire as she bears!",
        ],
      });
    p = P("brig_guard");
    if (p)
      spawn({
        id: "ph_brig_sentry",
        type: "raider",
        name: "Brig Sentry",
        faction: "raiders",
        hostile: true,
        level: 9,
        pos: p,
        ai: "guard",
        home: home(p, 3),
        noRespawn: true,
        inventory: [["ph_key_brig", 1]],
        barks: ["Nobody talks to the prisoner!"],
      });
    p = P("mess", 2, 3);
    if (p)
      spawn({
        id: "ph_bosun_kegs",
        type: "raider",
        name: "Bosun Kegs",
        faction: "raiders",
        hostile: true,
        level: 11,
        pos: p,
        ai: "guard",
        home: home(p, 6),
        noRespawn: true,
        barks: ["Mess hall's closed!", "Kegs is gonna keg you!"],
      });
    p = P("cic");
    if (p)
      spawn({
        id: "ph_hudson_lookout",
        type: "raider",
        name: "Pirate Lookout",
        faction: "raiders",
        hostile: true,
        level: 9,
        pos: p,
        ai: "guard",
        home: home(p, 4),
        noRespawn: true,
      });
    // topside watch: gangway sentry & a deckhand by the scrap wall
    p = P("gangway");
    if (p)
      spawn({
        id: "ph_hudson_gangway",
        type: "raider",
        name: "Gangway Sentry",
        faction: "raiders",
        hostile: true,
        level: 8,
        pos: p,
        ai: "guard",
        home: home(p, 4),
        noRespawn: true,
        barks: [
          "Permission to come aboard: DENIED!",
          "Toll's everything you own, landlubber!",
        ],
      });
    p = P("deck");
    if (p)
      spawn({
        id: "ph_hudson_deckhand",
        type: "raider",
        name: "Pirate Deckhand",
        faction: "raiders",
        hostile: true,
        level: 8,
        pos: p,
        ai: "guard",
        home: home(p, 6),
        noRespawn: true,
        barks: ["Boarders! Boarders on the starboard side!", "All hands!"],
      });
    if (!PH.flag("nadia_freed")) {
      p = P("captive");
      if (p)
        spawn({
          id: "ph_nadia",
          type: "human",
          outfit: "settler",
          gender: "f",
          name: "Nadia Osei",
          faction: "settlers",
          hostile: false,
          essential: true,
          pos: p,
          ai: "static",
          home: home(p, 1),
          dialogue: "ph_dlg_nadia",
          barks: [
            "Somebody out there? HEY!",
            "Commodore's a jumped-up bilge rat.",
          ],
        });
    }
  }
  /** Free Nadia: she slips away (removed here, reappears in the Registry). */
  PH.freeNadia = function () {
    PH.setFlag("nadia_freed");
    if (qActive("ph_q_huddled")) qSet("ph_q_huddled", "return");
    PH.xp(50, "Freed Nadia Osei");
    PH.later(3.0, () => {
      const a = actor("ph_nadia");
      if (a && a.pos.x > 6000 && a.pos.z > 600) {
        try {
          G.actors.remove(a);
        } catch (e) {
          /* */
        }
      }
    });
  };
  PH.applyScram = function () {
    if (PH._reactorRad) PH._reactorRad.strength = 0.25;
  };

  // tiny dt-driven scheduler (pauses with menus)
  const pending = [];
  PH.later = (sec, fn) => pending.push({ t: sec, fn });
  PH.updaters.push(function (dt) {
    for (let i = pending.length - 1; i >= 0; i--) {
      pending[i].t -= dt || 0;
      if (pending[i].t <= 0) {
        const p = pending.splice(i, 1)[0];
        PH.safe("later", p.fn);
      }
    }
  });

  // =====================================================================
  // STATIC PICKUPS (notes, loot) — spawned once at initDone, rpg remembers them
  // =====================================================================
  function staticPickups() {
    if (G.isStub("items") || !G.items.spawnPickup) return;
    const S = (id, n, poi, anchor, dx, dy, dz) => {
      const v = A(poi, anchor);
      if (!v || !PH.itemExists(id)) return;
      PH.safe("pickup " + id, () =>
        G.items.spawnPickup(
          id,
          n,
          PH.v3(v.x + (dx || 0), v.y + (dy || 0), v.z + (dz || 0)),
          { static: true },
        ),
      );
    };
    S("ph_note_quarantine", 1, "ellis_island", "quarantine", -2, 0.02, 1.4);
    S("ph_reel_bsi", 1, "ellis_island", "inquiry", 0.6, 1.57, 4.3);
    S("ph_book_arrivals", 1, "ellis_island", "records", 1.2, 0.02, 1.5);
    S("rally_tonic", 1, "ellis_island", "surgery", 1.5, 0.9, 0);
    S("ph_note_foreman", 1, "domino_sugar", "spawn1", -3, 0.02, -8);
    S("ph_note_sweettooth", 1, "domino_sugar", "boss", 2.4, 0.02, 1.0);
    S("freedom_flakes", 2, "domino_sugar", "boss", -1.5, 0.02, 0.6);
    S("fizzo_blue", 1, "domino_sugar", "qc", 6, 0.97, -5);
    S("ph_reel_captains_log", 1, "uss_hudson", "captain_desk", 0.3, 0.02, 0);
    S("ph_note_commodore", 1, "uss_hudson", "bridge", -7.5, 0.97, -1.9);
    S(
      PH.item("ammo_recoilless") || "frag_grenade",
      1,
      "uss_hudson",
      "mag_loot",
      1.2,
      1.32,
      -1.2,
    );
    S(
      PH.item("missile_launcher") || "hunting_rifle",
      1,
      "uss_hudson",
      "mag_loot",
      1.4,
      1.32,
      0.8,
    );
    S("ammo_missile", 2, "uss_hudson", "mag_loot", 1.0, 1.32, 0);
  }

  // =====================================================================
  // Lifecycle
  // =====================================================================
  let spawnPending = false,
    maintT = 0;
  PH.onReady.unshift(function () {
    defineItems();
    defineTerminals();
    defineDialogue();
    defineQuests();
  });
  PH.onReady.push(staticPickups);
  PH.onNewGame.push(() => {
    spawnPending = true;
  });
  PH.onLoaded.push(() => {
    spawnPending = true;
  });
  PH.onReset.push(() => {
    pending.length = 0;
  });
