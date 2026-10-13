// play-inline-277 07 — the
// Lines 1427-1776 of readable/play-inline-277.pretty.js (statement-aligned).
  function spawnToby() {
    if (actor("uw_toby")) return;
    const where = F.tobyHome
      ? A("san_remo", "toby_home")
      : A("bellamys", "cage");
    if (!where) return;
    spawnNPC(
      {
        id: "uw_toby",
        poi: "bellamys",
        at: "cage",
        type: "human",
        name: "Toby Finch",
        outfit: "settler",
        gender: "m",
        ai: F.tobyHome ? "guard" : "static",
        dialogue: "dlg_uw_toby",
        level: 3,
        barks: F.tobyHome
          ? ["I still need a coat."]
          : ["Help! Somebody!", "Three bangs, pause, three bangs..."],
      },
      where,
    );
  }
  function spawnHostiles() {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return;
    // Old Stokes — a Maniac Bruiser, still tending the dead farm on the Ansonia roof
    if (!F.stokesDead && !actor("uw_stokes")) {
      const a = A("ansonia", "boss_roof");
      if (a)
        P.safe("spawn:stokes", () =>
          G.actors.spawn({
            id: "uw_stokes",
            type: "maniac_bruiser",
            name: "Old Stokes",
            faction: "maniacs",
            level: 9,
            pos: { x: a.x, y: a.y, z: a.z },
            yaw: 0,
            ai: "guard",
            home: { x: a.x, z: a.z, r: 10 },
            hostile: true,
            noRespawn: true,
            inventory: [
              ["uw_key_stokes", 1],
              ["scrip", 35],
            ],
            onDeath: () => {
              F.stokesDead = true;
            },
          }),
        );
    }
    // two extra Maniacs in the Baths, two Mannequins guarding Fashion
    for (const [id, poi, at, type, name] of [
      ["uw_ans_maniac1", "ansonia", "spawn3", "maniac", "Maniac Bather"],
      ["uw_ans_maniac2", "ansonia", "pool", "maniac", "Maniac Bather"],
      ["uw_bl_raider1", "bellamys", "fashion", "raider", "Mannequin"],
      ["uw_bl_raider2", "bellamys", "stockroom", "raider", "Mannequin"],
    ]) {
      if (actor(id)) continue;
      const a = A(poi, at);
      if (!a) continue;
      P.safe("spawn:" + id, () =>
        G.actors.spawn({
          id,
          type,
          name,
          faction: type === "raider" ? "raiders" : "maniacs",
          level: type === "raider" ? 5 : 6,
          pos: { x: a.x, y: a.y, z: a.z },
          yaw: a.yaw || 0,
          ai: "guard",
          home: { x: a.x, z: a.z, r: 6 },
          hostile: true,
          noRespawn: true,
        }),
      );
    }
    // Ansonia ambushes: a Maniac guarding Herman's den (2A, the unique bat), and two "corpses" that are
    // not dead — one sprawled on 1B's mattress pile under the hole, one at the splintered edge in 2B.
    for (const [id, at, dx, dz, dormant, lvl] of [
      ["uw_ans_den", "spawn6", 0, 0, false, 7],
      ["uw_ans_nest", "nest", 0.6, 0.4, true, 6],
      ["uw_ans_hole", "hole", 3.2, 2.8, true, 6],
    ]) {
      if (actor(id)) continue;
      const a = A("ansonia", at);
      if (!a) continue;
      const x = a.x + dx,
        z = a.z + dz;
      const ac = P.safe("spawn:" + id, () =>
        G.actors.spawn({
          id,
          type: "maniac",
          name: "Maniac",
          faction: "maniacs",
          level: lvl,
          pos: { x, y: a.y, z },
          yaw: a.yaw || 0,
          ai: "guard",
          home: { x, z, r: dormant ? 8 : 5 },
          hostile: true,
          noRespawn: true,
        }),
      );
      if (ac && dormant)
        P.safe("dormant:" + id, () => {
          if (typeof ac.setState === "function") ac.setState("dormant");
          if (typeof ac.anim === "function") ac.anim("dead");
        });
    }
  }
  function spawnAll() {
    for (const d of NPCS) spawnNPC(d);
    spawnBirdie();
    spawnToby();
    spawnHostiles();
  }

  // ==================================================================
  // Scripted bits
  // ==================================================================
  // --- cage ---
  let cageCol = null,
    cageAnim = 0;
  function closeCage() {
    const c = P.bloomCage;
    if (!c) return;
    c.group.rotation.y = 0;
    cageAnim = 0;
    if (!cageCol) {
      const b = c.colBox;
      cageCol = G.world.addBox(b[0], b[1], b[2], b[3], b[4], b[5], {
        tag: "poi",
        walkable: false,
      });
    }
  }
  C.openCage = function (silent) {
    const c = P.bloomCage;
    if (!F.cageOpen) {
      F.cageOpen = true;
      if (!silent) {
        sfx("keypad_accept");
        sfx("door_open");
        G.notify("The hold cage swings open.");
        xp(25, "Opened the hold cage");
      }
    }
    if (cageCol) {
      try {
        G.world.removeCollider(cageCol);
      } catch (e) {
        /* */
      }
      cageCol = null;
    }
    if (c) cageAnim = silent ? 1 : Math.max(cageAnim, 0.001);
    if (
      qActive("uw_window") &&
      (qStage("uw_window") === "find" || qStage("uw_window") === "free")
    )
      qSet("uw_window", "free");
  };
  let tobyRunT = 0;
  C.sendTobyHome = function () {
    if (F.tobyFreed) return;
    F.tobyFreed = true;
    const a = actor("uw_toby");
    const ex = A("bellamys", "freight_top");
    if (a && ex) {
      P.safe("toby:run", () => {
        a.hostile && a.setHostile && a.setHostile(false);
        if (a.moveTo) a.moveTo(ex.x, ex.z);
      });
      tobyRunT = 7;
    } else tobyHome();
    if (!qDone("uw_window")) qSet("uw_window", "report");
    xp(50, "Freed Toby Finch");
    standing(10, "Freed a captive");
  };
  function tobyHome() {
    const a = actor("uw_toby");
    if (a) {
      try {
        G.actors.remove(a);
      } catch (e) {
        /* */
      }
    }
    F.tobyHome = true;
    spawnToby();
  }
  C.finishWindow = function () {
    qComplete("uw_window");
  };
  // --- garden ---
  C.deliverSeeds = function () {
    if (!take("uw_seed_bank")) return;
    F.seedsGiven = true;
    F.planted = true;
    if (F.bonus) give("scrip", 150);
    if (P.srGardenAlive) P.srGardenAlive.visible = true;
    qComplete("uw_gardens");
  };
  // --- boss hook from 90_main (Bellamy's raider boss) ---
  C.onBoss = function (key, a) {
    if (key !== "bellamys" || a._uwBoss) return;
    a._uwBoss = true;
    a.name = "The Window Dresser";
    try {
      a.inventory = a.inventory || [];
      a.inventory.push(["uw_key_cage", 1]);
    } catch (e) {
      /* */
    }
  };

  function interactables() {
    const W = G.world;
    // cage door (the Window Dresser's key, or the manager teletype's remote release)
    const cd = A("bellamys", "cage_door");
    if (cd)
      W.addInteractable({
        pos: new THREE.Vector3(cd.x - 0.3, cd.y + 1.2, cd.z),
        radius: 1.0,
        label: "Hold Cage",
        verb: () => (has("uw_key_cage") ? "Unlock" : "Open"),
        priority: 0.8,
        locked: () =>
          F.cageOpen || has("uw_key_cage") || P.lockIsOpen(P.LOCKS.bl_cage.id)
            ? null
            : "Locked",
        enabled: () => !F.cageOpen,
        onInteract() {
          if (!P.locksLive() && !has("uw_key_cage")) {
            sfx("door_locked");
            G.notify("Locked. A padlock the size of a fist.");
            return;
          }
          P.lockOpen(P.LOCKS.bl_cage, () => C.openCage(false));
        },
      });
    // the Toby signal: three bangs from the stockroom (flavour) handled in tick
    // garden planting fallback: if the player planted without Adeline's dialogue (no dialogue module)
    const gd = A("san_remo", "garden");
    if (gd)
      W.addInteractable({
        pos: new THREE.Vector3(gd.x, gd.y + 0.8, gd.z),
        radius: 2.0,
        label: "Commune Planters",
        verb: () =>
          F.planted
            ? "Inspect"
            : has("uw_seed_bank")
              ? "Plant Seeds"
              : "Inspect",
        priority: -0.2,
        onInteract() {
          if (F.planted) {
            G.notify(
              "Green shoots in every bed. Somebody has written names on little sticks.",
            );
            return;
          }
          if (has("uw_seed_bank") && G.isStub("dialogue")) {
            C.deliverSeeds();
            G.notify("You plant the Stokes seeds.");
            return;
          }
          G.notify(
            has("uw_seed_bank")
              ? "Adeline would want to see these first."
              : "Five beds of hauled-up soil. Nothing growing.",
          );
        },
      });
  }

  // ------------------------------------------------------------------
  // world state from flags (after a load / on reset)
  // ------------------------------------------------------------------
  function resetWorld() {
    closeCage();
    if (P.srGardenAlive) P.srGardenAlive.visible = false;
  }
  function applyWorldState() {
    if (F.cageOpen) C.openCage(true);
    else closeCage();
    if (P.srGardenAlive) P.srGardenAlive.visible = !!F.planted;
  }

  // ------------------------------------------------------------------
  // tick: cage swing, Toby's signal, boss renaming
  // ------------------------------------------------------------------
  let bangT = 6,
    bangN = 0;
  function tickCage(realDt) {
    const c = P.bloomCage;
    if (!c) return;
    if (cageAnim > 0 && cageAnim < 1) {
      cageAnim = Math.min(1, cageAnim + realDt * 0.8);
    }
    const target = F.cageOpen
      ? 1.9 * (cageAnim > 0 ? 1 - Math.pow(1 - cageAnim, 3) : 1)
      : 0;
    c.group.rotation.y = target;
    // Toby bangs on the bars: three, pause, three (only while caged and the player is in the store)
    if (!F.cageOpen && P.inCell("bellamys")) {
      bangT -= realDt;
      if (bangT <= 0) {
        const a = A("bellamys", "cage");
        if (a) sfx("melee_hit", { pos: a, volume: 0.5 });
        bangN++;
        bangT = bangN % 3 === 0 ? 5 : 0.45;
      }
    }
  }

  // ------------------------------------------------------------------
  // lifecycle
  // ------------------------------------------------------------------
  P.onPreReady.push(() => {
    defineItems();
    defineTerminals();
    defineDialogue();
    defineQuests();
  });
  P.onReady.push(() => {
    interactables();
    closeCage();
  });
  P.onReset.push(() => {
    resetWorld();
    F = DEF_STATE();
    tobyRunT = 0;
    bangT = 6;
    bangN = 0;
  });
  P.onNewGame.push(() => {
    F = DEF_STATE();
    applyWorldState();
    spawnAll();
  });
  P.onLoaded.push(() => {
    applyWorldState();
    spawnAll();
  });
