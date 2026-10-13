// play-inline-194 09 — shelf
// Lines 3208-3364 of readable/play-inline-194.pretty.js (statement-aligned).
  function closeShelf() {
    if (!shelf) return;
    shelf.open = false;
    shelf.t = 0;
    shelf.group.position.x = -4;
    if (!shelf.col) {
      const O = shelf.O;
      shelf.col = G.world.addBox(
        O.x - 5.25,
        O.y,
        O.z - 23.95,
        O.x - 2.75,
        O.y + 2.4,
        O.z - 23.45,
        { tag: "poi_village", walkable: false },
      );
    }
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    if (PV.flag("ct_shelf_open")) {
      openShelf(false);
      shelf.group.position.x = -6.6;
    } else closeShelf();
    if (PV.flag("ct_manhole_open")) K.lockUnlock(LK.manhole.id);
    if (!PV.flag("ct_lifter_taken"))
      K.safe("lifter", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("pv_ct_manhole_lifter", 1, v(A.lifter), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    if (PV.flag("ct_armory_open")) PV.unlockTagged("chinatown", "armory");
    // the station's ex-agents: half-mad after twenty-two years underground, still holding the post (hostile)
    const soldier = (id, name, p, lvl, weapon, extra) =>
      PV.spawnActor(
        ctx,
        Object.assign(
          {
            id,
            type: "human",
            gender: "m",
            outfit: "combat_armor",
            name,
            faction: "maniacs",
            level: lvl,
            hostile: true,
            pos: v(p),
            yaw: 0,
            ai: "guard",
            home: "here",
            homeR: 5,
            noRespawn: true,
            weapon: K.itemExists(weapon) ? weapon : undefined,
            inventory: K.stock([["ammo_556", 20]]),
            loot: "settler",
            barks: [
              "...écoutez... the post...",
              "Halte! Identify yourself! ...What year is it?",
              "Extraction... is coming...",
            ],
          },
          extra || {},
        ),
      );
    soldier("pv_ct_soldier1", "Bureau Sept Sentry", A.soldier1, 6, RIFLE());
    soldier(
      "pv_ct_soldier2",
      "Bureau Sept Signals Officer",
      A.soldier2,
      6,
      RIFLE(),
    );
    soldier(
      "pv_ct_soldier3",
      "Bureau Sept Agent",
      A.soldier3,
      5,
      "combat_knife",
    );
    soldier("pv_ct_soldier4", "Bureau Sept Agent", A.soldier4, 6, RIFLE());
    soldier("pv_ct_delorme", "Commandant Armand Delorme", A.boss, 10, RIFLE(), {
      hp: 260,
      dr: 18,
      aggroRange: 30,
      xp: 150,
      homeR: 3,
      inventory: K.stock([
        ["ammo_556", 40],
        ["rally_tonic", 2],
      ]), // his armory key is handed over on death (below)
      onDeath: () => {
        PV.setFlag("ct_cdt_dead", true);
        K.give("pv_key_ct_armory", 1);
        PV.unlockTagged("chinatown", "armory");
        PV.setFlag("ct_armory_open", true);
        K.notify(
          "You take the Commandant's armory key. The shade suit locker clicks open.",
        );
        sync();
      },
      barks: [
        "I remember my name! Do YOU remember yours?",
        "Le poste tient! The post is always held!",
        "The book stays in the post!",
      ],
    });
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  function update(dt, realDt, ctx) {
    if (shelf && shelf.open && shelf.t < 1) {
      shelf.t = Math.min(1, shelf.t + dt * 0.6);
      shelf.group.position.x = -4 - 2.6 * (1 - Math.pow(1 - shelf.t, 2));
    }
    const p = G.player && G.player.pos;
    if (!p || !ctx.inside) return;
    const lx = p.x - ctx.O.x,
      lz = p.z - ctx.O.z,
      below = p.y < ctx.O.y - 4;
    // quest progression by position: entering the bunker; reaching the Commandant's office
    if (below && -lz > 38 && !PV.flag("ct_bunker_seen")) advance("bunker");
    if (
      below &&
      lx > 2 &&
      lx < 12 &&
      lz < -60 &&
      lz > -71 &&
      !PV.flag("ct_office_seen")
    )
      advance("office");
  }
  G.events.on("itemAdded", (id) => {
    if (id === "pv_reel_ct_intercept") advance("passage");
    if (id === "pv_ct_manhole_lifter") PV.setFlag("ct_lifter_taken", true);
    if (id === "bureau_stealth_suit") PV.setFlag("ct_suit_taken", true);
  });

  PV.define({
    id: "chinatown",
    name: "Chinatown",
    interior: "chinatown",
    order: 40,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
    reset() {
      closeShelf();
    },
  });
