// play-inline-335 06 — ctx
// Lines 3320-3504 of readable/play-inline-335.pretty.js (statement-aligned).
  function spawn(ctx) {
    const A = ctx.anchors;
    // shutter state
    if (EV.flag("cu_shutter") || EV.flag("cu_exam_over"))
      openShutter(ctx, true);
    else shutterClosed(ctx);
    if (EV.flag("cu_drawer") && !EV.flag("cu_card_taken")) spawnOverride();
    if (!EV.flag("tom_thumb_taken"))
      K.safe("tt", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup(
            "pev_tom_thumb",
            1,
            { x: A.tom_thumb.x, y: A.tom_thumb.y, z: A.tom_thumb.z },
            { static: false, keepY: true, noSave: true },
          );
      });
    if (!EV.flag("cu_exam_over")) {
      // PROFESSOR LINCOLN-TRON (boss) on the stage + the library's silence enforcer
      if (!EV.flag("lincoln_dead")) {
        const a = EV.spawnActor(ctx, {
          id: "pev_lincolntron",
          type: "patrolman",
          name: "Professor Lincoln-Tron",
          faction: "robots",
          level: 8,
          hostile: true,
          hp: 260,
          dr: 20,
          damage: 1.3,
          pos: v(A.boss),
          yaw: 0,
          ai: "guard",
          home: "here",
          homeR: 6,
          noRespawn: true,
          aggroRange: 22,
          xp: 160,
          inventory: [
            ["pev_abe_hat", 1],
            ["ammo_dry_cell", 3],
          ],
          voice: "robot",
          barks: [
            "Four score and— HECKLER DETECTED.",
            "Let us have faith that right makes might!",
            "Pencils. Down.",
            "A house divided against itself cannot pass this exam.",
            "You are TARDY.",
          ],
          onDeath: () => {
            EV.setFlag("lincoln_dead", true);
            K.notify("Professor Lincoln-Tron has been expelled.");
          },
        });
        if (a) K.safe("hat", () => addStovepipe(a));
      }
      if (!EV.flag("proctor_dead")) {
        EV.spawnActor(ctx, {
          id: "pev_cu_proctor",
          type: "valet",
          name: "Proctor",
          faction: "robots",
          level: 6,
          hostile: true,
          pos: v(A.proctor),
          yaw: 0,
          ai: "patrol",
          patrol: [
            { x: A.proctor.x, z: A.proctor.z },
            { x: A.proctor.x + 8, z: A.proctor.z + 10 },
            { x: A.proctor.x - 6, z: A.proctor.z + 14 },
          ],
          noRespawn: true,
          voice: "robot",
          barks: [
            "SHHHHH.",
            "This is a LIBRARY.",
            "Your library card has EXPIRED. So will you.",
          ],
          onDeath: () => EV.setFlag("proctor_dead", true),
        });
      }
    }
    // radioactive spill in the chem lab (static source, re-added per game)
    ctx.radHandles = ctx.radHandles || [];
    if (!ctx.radHandles.length)
      for (const s of ctx.radSpots || [])
        K.safe("rad", () =>
          ctx.radHandles.push(
            G.world.addRadSource({
              x: s.x + ctx.O.x,
              y: s.y + ctx.O.y,
              z: s.z + ctx.O.z,
              radius: s.radius,
              strength: s.strength,
            }),
          ),
        );
  }
  function addStovepipe(a) {
    const head = a.char && a.char.parts && a.char.parts.head;
    if (!head) return;
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.6,
    });
    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.14, 0.34, 14),
      m,
    );
    crown.position.y = 0.3;
    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.02, 16),
      m,
    );
    brim.position.y = 0.13;
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.152, 0.152, 0.05, 14),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8 }),
    );
    band.position.y = 0.17;
    g.add(crown, brim, band);
    head.add(g);
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  function update(dt, realDt, ctx) {
    const s = ctx.shutter;
    if (s && s.opening) {
      s.t += realDt;
      s.obj.position.y = Math.min(3.1, s.t * 1.2);
      if (s.t > 2.8) {
        s.opening = false;
        s.obj.visible = false;
      }
    }
  }
  function reset(ctx) {
    for (const h of ctx.radHandles || [])
      K.safe("unrad", () => G.world.removeRadSource(h));
    ctx.radHandles = [];
  }

  G.events.on("itemAdded", (id) => {
    if (id === "pev_cu_override_card") {
      EV.setFlag("cu_card_taken", true);
      if (!K.q.started("pev_right_makes_might"))
        K.q.start("pev_right_makes_might");
      if (K.q.active("pev_right_makes_might")) {
        const st = K.q.stage("pev_right_makes_might");
        if (st === "enter" || st === "override")
          K.q.set("pev_right_makes_might", "hall");
      }
    }
    if (id === "pev_tom_thumb") EV.setFlag("tom_thumb_taken", true);
  });
  G.events.on("doorTransition", (def) => {
    if (
      def &&
      def.id === "pev_cu_in" &&
      K.q.active("pev_right_makes_might") &&
      K.q.stage("pev_right_makes_might") === "enter"
    )
      K.q.set("pev_right_makes_might", "override");
  });

  EV.define({
    id: "cooper",
    name: "Cooper Union Foundation Building",
    interior: "cooper_union",
    order: 10,
    lift: 6,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
    reset,
  });
