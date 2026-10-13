// play-inline-438 05 — flag
// Lines 860-1025 of readable/play-inline-438.pretty.js (statement-aligned).
  let clockT = 0,
    bellT = 0,
    noteT = 0,
    noteI = 0,
    lastHour = -1;
  const TUNE = [
    1.0, 1.26, 1.5, 1.26, 1.0, 0.84, 1.0, 1.12, 1.26, 1.12, 1.0, 0.75,
  ];
  function playClock(first) {
    const z = ctxOf("cp_zoo_arsenal");
    if (!z) return;
    clockT = 13;
    bellT = 0;
    noteT = 0;
    noteI = 0;
    if (first && !PK.flag("clock_wound")) {
      PK.setFlag("clock_wound", true);
      K.xp(15, "Wound the Delacorte Clock");
      K.notify(
        "Gears grind. The bronze animals lurch into motion and dance round the clock again.",
      );
    }
  }
  function worldHooks() {
    const z = ctxOf("cp_zoo_arsenal");
    if (z && z.clockCrank) {
      G.world.addInteractable({
        pos: z.clockCrank,
        radius: 1.0,
        label: "Delacorte Clock",
        verb: "Wind",
        priority: 1,
        enabled: () => clockT <= 0,
        onInteract() {
          K.sfx("key_turn", z.clockCrank);
          playClock(true);
        },
      });
    }
    // food pile in the polar trough (shown once the feeders run)
    if (z && z.intRoot) {
      const fb = K.builder({
        name: "zoo_food",
        off: z.O,
        lit: true,
        amb: [0.3, 0.3, 0.32],
        floors: [-4.5],
      });
      const rr = K.rng("food");
      for (let k = 0; k < 14; k++)
        fb.geo("meat", K.sphereGeo(), {
          x: -29.0 + (rr() - 0.5) * 1.8,
          y: -4.5 + 0.5 + rr() * 0.12,
          z: -60.2 + (rr() - 0.5) * 0.9,
          sx: 0.18,
          sy: 0.08,
          sz: 0.14,
          ry: rr() * 3,
          tint: [0.55, 0.3, 0.24],
        });
      fb.light(-29, -3.2, -60.2, [0.62, 0.82, 1.0], 0.6, 4);
      z.foodGroup = fb.finish(z.intRoot);
      z.foodGroup.visible = !!PK.flag("feeders_on");
    }
  }

  // ==================================================================
  // SPAWN (newGame / loaded)
  // ==================================================================
  function whiten(a) {
    K.safe("whiten", () => {
      const root = a && a.char && a.char.root;
      if (!root || root.userData.ppkWhite) return;
      root.userData.ppkWhite = true;
      root.traverse((o) => {
        if (
          !o.isMesh ||
          !o.geometry ||
          !o.geometry.attributes ||
          !o.geometry.attributes.color
        )
          return;
        const g = o.geometry.clone(),
          c = g.attributes.color;
        for (let i = 0; i < c.count; i++) {
          const r = c.getX(i),
            gg = c.getY(i),
            bb = c.getZ(i),
            l = Math.max(r, gg, bb);
          if (l < 0.45) {
            const k = 0.8 + l * 0.45;
            c.setXYZ(i, 0.88 * k, 0.86 * k, 0.76 * k);
          }
        }
        c.needsUpdate = true;
        o.geometry = g;
      });
      root.scale.multiplyScalar(1.28);
    });
  }
  function spawnZoo(ctx) {
    const A = ctx.anchors;
    if (ctx.foodGroup) ctx.foodGroup.visible = !!PK.flag("feeders_on");
    if (!PK.flag("gus_dead")) {
      const fed = !!PK.flag("feeders_on");
      const pos = fed ? V(A.feeder) : V(A.boss);
      const gus = PK.spawnActor(ctx, {
        id: "ppk_gus",
        type: "ash_bear",
        name: "Gus",
        faction: "creatures",
        level: 12,
        hostile: !fed,
        hp: 520,
        dr: 16,
        damage: 1.4,
        speed: 1.1,
        pos,
        yaw: PI,
        ai: "guard",
        home: { x: pos.x, z: pos.z, r: fed ? 3 : 7 },
        noRespawn: true,
        aggroRange: 22,
        loot: "creature",
        inventory: [
          ["ppk_gus_pelt", 1],
          ["ppk_formula_n", 1],
        ],
        barks: ["*huffing*", "*a long, low moan*", "*claws scraping concrete*"],
        onDeath: () => {
          if (PK.flag("gus_dead")) return;
          PK.setFlag("gus_dead", true);
          K.xp(150, "Killed Gus");
          K.notify("Gus, the Central Park Zoo's last polar bear, is dead.");
          if (q.active(QF) && q.stage(QF) !== "return") q.set(QF, "return");
        },
      });
      if (gus) {
        whiten(gus);
        gus.isBoss = true;
      }
    }
    // loose animals among the enclosures (outside)
    if (!PK.flag("zoo_ext_cleared")) {
      const ext = [
        ["ppk_zoo_rat1", "burrow_rat", "ext_spawn1"],
        ["ppk_zoo_rat2", "burrow_rat", "ext_spawn2"],
        ["ppk_zoo_scorp", "stinger", "ext_spawn3"],
      ];
      for (const [id, type, an] of ext) {
        if (!A[an]) continue;
        PK.spawnActor(ctx, {
          id,
          type,
          faction: "creatures",
          level: type === "stinger" ? 6 : 4,
          hostile: true,
          pos: V(A[an]),
          yaw: Math.random() * 6.28,
          ai: "wander",
          home: { x: A[an].x, z: A[an].z, r: 7 },
          noRespawn: true,
        });
      }
    }
  }
