// play-inline-347 04 — pos
// Lines 2559-2699 of readable/play-inline-347.pretty.js (statement-aligned).
  const CRYO_LABEL = "Service Stair — Sub-basement C-9";
  function cryoLink() {
    const C = PC.cryo;
    if (!C || !C.ctx || !C.pos) return;
    const T = G.pois && G.pois.cryoAccessTarget; // a target may also be left as data by a module that loads first
    if (!C.target && T && typeof T.x === "number")
      C.target = { x: T.x, y: T.y, z: T.z, yaw: T.yaw || 0 };
    if (C.ia) {
      K.safe("cryo ia", () => G.world.removeInteractable(C.ia));
      C.ia = null;
    }
    if (C.target) {
      if (!C.door)
        C.door = K.door(C.ctx, {
          id: "pc_mb_cryo",
          pos: C.pos.clone(),
          label: CRYO_LABEL,
          verb: "Descend",
          sound: "cryo_door",
          target: Object.assign({}, C.target),
        });
      return;
    }
    C.ia = K.safe("cryo placeholder", () =>
      G.world.addInteractable({
        pos: C.pos.clone(),
        radius: 1.0,
        label: CRYO_LABEL,
        verb: "Examine",
        enabled: () => !!C.ctx.inside,
        onInteract() {
          K.notify(
            "A steel blast door stencilled OFFICE OF CIVIL DEFENSE, FACILITY C-9. The wheel will not turn: it is sealed from below.",
          );
          K.sfx("door_locked", C.pos);
        },
      }),
    );
  }
  G.events.on("initDone", () => {
    if (PC.cryo && !PC.cryo.door) cryoLink();
  });
  /** Link the C-9 door to the cryo facility's stair landing. target: {x, y, z, yaw} (world). */
  PC.setCryoAccessTarget = function (target) {
    PC.cryo = PC.cryo || {};
    if (PC.cryo.door) return; // already linked
    PC.cryo.target = target
      ? { x: target.x, y: target.y, z: target.z, yaw: target.yaw || 0 }
      : null;
    cryoLink();
  };

  // ------------------------------------------------------------------ NPCs (interior)
  function spawn(ctx) {
    const A = ctx.anchors;
    const v = (a) => ({ x: a.x, y: a.y, z: a.z });
    PC.spawnActor(ctx, {
      id: "pc_mb_bigledger",
      type: "brute",
      name: "Big Ledger",
      faction: "brutes",
      level: 11,
      hostile: true,
      pos: v(A.boss),
      yaw: 0,
      ai: "guard",
      home: "here",
      homeR: 7,
      loot: "brute",
      hp: 260,
      weapon: K.itemExists("pc_mb_rubber_stamp")
        ? "pc_mb_rubber_stamp"
        : K.itemExists("fire_axe")
          ? "fire_axe"
          : undefined,
      // he also carries the strongroom key he took from the Bureau (the Registrar's desk / Bureau terminal are the other routes)
      inventory: (K.itemExists("pc_mb_rubber_stamp")
        ? [["pc_mb_rubber_stamp", 1]]
        : []
      ).concat([["pc_mb_vault_key", 1]]),
      barks: [
        "YOU NOT IN FILE! BIG LEDGER PUT YOU IN FILE!",
        "Stamp! STAMP!",
        "Form say you already dead. Big Ledger make form true.",
        "Paper burn nice. Human burn nicer.",
      ],
    });
    PC.spawnActor(ctx, {
      id: "pc_mb_clerkbrute",
      type: "brute",
      name: "Brute Clerk",
      faction: "brutes",
      level: 8,
      hostile: true,
      pos: v(A.offices),
      yaw: HP,
      ai: "wander",
      home: "here",
      homeR: 6,
      loot: "brute",
      weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
      barks: [
        "Next!",
        "Take number. Number is DEATH.",
        "Form wrong. Start over. In pieces.",
      ],
    });
    {
      // Wren stays in the Hall after Paper Trail: at his desk by the barricade (the main story's Register beat needs him)
      const free = !!PC.flag("mb_wren_free");
      const st = A.records_desk_stand || {
        x: A.hall.x - 6.5,
        y: 0,
        z: A.hall.z + 3.1,
      };
      PC.spawnActor(ctx, {
        id: "pc_mb_wren",
        type: "human",
        gender: "m",
        outfit: "survivor",
        name: "Tobias Wren",
        faction: "settlers",
        level: 4,
        essential: true,
        hostile: false,
        pos: free ? { x: st.x, y: 0, z: st.z } : v(A.wren),
        yaw: free ? PI : HP,
        ai: free ? "static" : "sit",
        home: "here",
        homeR: free ? 1.2 : 0.3,
        dialogue: "pc_dlg_wren",
        barks: [
          "Psst! You there! Please — before the big one comes back!",
          "They're going to eat me with a side of property tax records.",
          "I am a CLERK. I have RIGHTS. Somewhere. In a file.",
        ],
      });
    }
  }

  PC.part("municipal_building", { int: interior, spawn });
