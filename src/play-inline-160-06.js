// play-inline-160 06 — def
// Lines 1067-1308 of readable/play-inline-160.pretty.js (statement-aligned).
  function spawnGarrison(key) {
    if (!live("actors") || typeof G.actors.spawn !== "function") return;
    spawnedCell[key] = true;
    const lvl = locLevel(key),
      fac = locFaction(key);
    for (const g of GARRISON[key]) {
      const ex = G.actors.get && G.actors.get(g.id);
      if (ex && !ex.removed) continue;
      let pos;
      if (g.exterior) {
        const a = extAnchor(key + "_ext", g.exterior);
        if (!a) continue;
        pos = a;
      } else if (g.world)
        pos = snap(
          new THREE.Vector3(g.world[0], g.world[1], g.world[2]),
          0.45,
          3,
        );
      else pos = snap(W(key, g.at[0], g.at[1], g.at[2]), 0.45, 2.8);
      if (!pos) {
        P.threatStats.garrisonSkipped.push(g.id);
        continue;
      }
      let wid = g.weapon;
      try {
        if (wid && live("items") && !G.items.get(wid)) wid = undefined;
      } catch (e) {
        wid = undefined;
      }
      const def = {
        id: g.id,
        type: g.type,
        level: Math.max(
          1,
          lvl + (g.lvl || 0) + (g.id.charCodeAt(g.id.length - 1) % 3) - 1,
        ),
        pos: { x: pos.x, y: pos.y, z: pos.z },
        yaw: typeof g.yaw === "number" ? g.yaw : Math.random() * TAU,
        ai: g.dormant ? "guard" : g.ai || "wander",
        noRespawn: true,
        home: { x: pos.x, z: pos.z, r: g.ai === "guard" || g.holdPos ? 2 : 8 },
      };
      const faction =
        g.faction ||
        (g.type === "raider"
          ? "raiders"
          : g.type === "maniac"
            ? "maniacs"
            : null) ||
        (fac === "raiders" ? "raiders" : null);
      if (faction) def.faction = faction;
      if (g.name) def.name = g.name;
      if (wid) def.weapon = wid;
      if (g.barks) def.barks = g.barks;
      if (g.holdPos) def.holdPos = true;
      if (g.patrol)
        def.patrol = g.patrol.map((q) => {
          const w = W(key, q[0], q[1], q[2]);
          return { x: w.x, z: w.z };
        });
      const a = P.safe("garrison:" + g.id, () => G.actors.spawn(def));
      if (!a) continue;
      P.threatStats.garrison++;
      if (g.sight)
        try {
          a.sight = Math.max(a.sight || 0, g.sight);
        } catch (e) {
          /* */
        }
      if (g.dormant && !a.dead)
        P.safe("dormant", () => {
          if (typeof a.setState === "function") {
            a.setState("dormant");
            a.denWake = g.dormant;
            if (typeof a.anim === "function") a.anim("dead");
          }
        });
    }
  }
  function tickGarrisons() {
    const pp = G.player && G.player.pos;
    if (!pp) return;
    for (const key in GARRISON) {
      if (spawnedCell[key]) continue;
      if (P.inCell(key)) {
        spawnGarrison(key);
        continue;
      }
      // the street-side members (Tiffany lookout, Dakota arch, AMNH lawn) must be in place before you walk up
      const s = G.LAYOUT.getSite ? G.LAYOUT.getSite(key) : null;
      if (
        s &&
        Math.abs(pp.x - (s.x0 + s.x1) / 2) < 260 &&
        Math.abs(pp.z - (s.z0 + s.z1) / 2) < 260
      )
        spawnGarrison(key);
    }
  }

  // ==================================================================
  // VIGNETTES & MANUALS (queued into the interior sites → spawned by 90_main at initDone)
  // ==================================================================
  function defineItems() {
    if (!live("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    d({
      id: "pu_note_pinkerton",
      type: "note",
      name: "Pinkerton's Field Notes",
      title: "Scav crew — egg job, AMNH",
      weight: 0,
      value: 0,
      tags: ["note"],
      text:
        "Day 1. Buyer at the Plaza says a chef will pay two thousand scrip for one egg. ONE EGG. Dex says that's suspicious. Dex says everything is suspicious.\n\n" +
        "Day 2. Found the nest past the big lizard skeletons. Mother's out hunting. Laid two mines on the approach and a bouquet on the side aisle so nothing " +
        'sneaks up on us while we work. Dex took the bear traps down to the storage rooms "for the rats."\n\n' +
        "Day 3. She came back through the WALL. Not the door. The wall. Mines didn't even slow her down. If you're reading this, the mines are still there. " +
        "So is Dex, mostly.\n\n— P.",
    });
    d({
      id: "pu_note_ruiz",
      type: "note",
      name: "Note Pinned to a Chair",
      title: "To whoever",
      weight: 0,
      value: 0,
      tags: ["note"],
      text:
        "TO WHOEVER COMES DOWN HERE — the tenants on 2 are not tenants anymore. Mrs. Pell is still setting the table. I have locked myself in and rigged " +
        "the door, God forgive me. Do NOT come through the office door without cutting the string first. It is the shotgun from the Van Rensselaer gun " +
        "room, and it is loaded with both barrels.\n\n— M. Ruiz, Superintendent",
    });
  }
  const BOOKS = [
    { site: "amnh_int", id: "book_popular_circuits", at: [-55.2, 0, -9.6] }, // curator's office, by the desk
    { site: "amnh_int", id: "pu_note_pinkerton", at: [-27.2, 6, -18.6] }, // the dead scavenger in the Dinosaur Hall
    { site: "dakota_int", id: "book_art_of_the_pitch", at: [13.4, 4.5, -5.2] }, // the Pell study (senator's widow)
    { site: "dakota_int", id: "pu_note_ruiz", at: [-11.9, -4.5, -1.1] }, // on the rigged chair
    { site: "tiffany_int", id: "book_handyman", at: [-7.0, 0, -2.8] }, // the dead guard's reading
    {
      site: "tiffany_int",
      id: "book_riflemans_companion",
      at: [12.4, 6.8, 23.2],
    }, // raider bunks, by the workbench
  ];
  const PROPS = [
    {
      site: "amnh_int",
      type: "skeleton",
      at: [-27.6, 6, -19.6],
      yaw: 2.2,
      opts: { pose: "lying" },
    },
    {
      site: "amnh_int",
      type: "duffle_bag",
      at: [-26.7, 6, -20.7],
      yaw: 0.6,
      opts: {
        loot: "duffle_bag",
        items: [
          ["frag_mine", 1],
          ["rally_tonic", 1],
          ["scrip", 22],
        ],
      },
    },
  ];
  P.onBuilt.push(() => {
    for (const bk of BOOKS) {
      const S = P.sites.find((s) => s.id === bk.site);
      if (S) {
        S.pickup(bk.id, 1, bk.at[0], bk.at[1] + 0.02, bk.at[2]);
        P.threatStats.books++;
      }
    }
    for (const pr of PROPS) {
      const S = P.sites.find((s) => s.id === pr.site);
      if (S) S.prop(pr.type, pr.at[0], pr.at[1], pr.at[2], pr.yaw, pr.opts);
    }
  });

  // ==================================================================
  // lifecycle
  // ==================================================================
  P.onPreReady.push(defineItems);
  // CONTRACT anchor names every POI publishes: friendly settlements `merchant`, hostile ones `loot1..n` (aliases of existing spots)
  const ALIAS = {
    plaza_hotel: { merchant: "bartender" },
    carnegie_hall: { merchant: "vendor" },
    dakota: { loot1: "super_office", loot2: "storage", loot3: "parlour" },
    tiffany: { loot1: "security", loot2: "silver_floor", loot3: "vault" },
  };
  P.onInitDone.push(() => {
    for (const id in ALIAS) {
      const p = G.pois && G.pois[id];
      if (!p || !p.anchors) continue;
      for (const n in ALIAS[id])
        if (!p.anchors[n] && p.anchors[ALIAS[id][n]]) {
          const v = p.anchors[ALIAS[id][n]].clone();
          v.yaw = p.anchors[ALIAS[id][n]].yaw || 0;
          p.anchors[n] = v;
        }
    }
    for (const def of TRAP_DEFS) {
      const t = P.safe("trap:" + def.id, () => makeTrap(def));
      if (t) P.threatStats.traps++;
      else P.threatStats.trapsSkipped.push(def.id);
    }
    refreshAll();
  });
  P.onReset.push(() => {
    TS = {};
    spotted = {};
    for (const k in spawnedCell) delete spawnedCell[k];
    for (const t of traps) {
      t.fuse = -1;
      t.beep = 0;
    }
    refreshAll();
  });
  P.onNewGame.push(() => {
    refreshAll();
  });
  P.onLoaded.push(() => {
    for (const k in spawnedCell) delete spawnedCell[k];
    refreshAll();
  });
  let slowT = 0;
  P.tick.push((dt, realDt) => {
    if (dt > 0) tickTraps(Math.min(dt, 0.1));
    slowT -= realDt;
    if (slowT > 0) return;
    slowT = 0.5;
    tickGarrisons();
  });
  P.threats = { traps, TS: () => TS, trip, disarm, spawnGarrison, GARRISON };
