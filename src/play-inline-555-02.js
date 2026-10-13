// play-inline-555 02 — the
// Lines 351-700 of readable/play-inline-555.pretty.js (statement-aligned).
  L.hook("world", function () {
    const t = L.anchor("st_patricks", ["terminal", "altar", "pulpit"], {
      x: SP.x - 30,
      z: SP.z + 8,
    });
    if (t) L.spawnTerminal("glow_scripture", t, Math.PI / 2);
    const tn = L.anchor("times_square", ["terminal", "mayor_office", "stage"], {
      x: TS.x + 10,
      z: TS.z + 6,
    });
    if (tn) L.spawnTerminal("neon_mayor", tn, 0);
    // City Hall of the Neon is a windowless shack: light the Mayor's office so the first
    // meeting isn't in the dark (props' lamps are emissive + glow sprites, no dynamic lights).
    const mo =
      !G.isStub("landmarks") && G.landmarks.getAnchor
        ? G.landmarks.getAnchor("times_square", "mayor_office")
        : null;
    if (mo && isFinite(mo.x)) {
      L.prop("lamp", {
        x: mo.x - 0.7,
        y: mo.y || 0,
        z: mo.z + 0.8,
        kind: "hanging",
        persistent: true,
      });
      L.prop("lamp", {
        x: mo.x - 2.0,
        y: mo.y || 0,
        z: mo.z + 3.4,
        kind: "floor",
        yaw: 0.6,
        persistent: true,
      });
    }
    // The Grand Central water tower intake (only active while carrying the isotope).
    const w = waterTowerSpot();
    if (w) {
      L.world.waterTower = G.world.addInteractable({
        pos: L.V3(w.x, (w.y || 0) + 1.2, w.z),
        radius: 0.9,
        label: "Water Tower Intake",
        verb: "Use",
        priority: 2,
        enabled: () =>
          L.has("q_blessed_isotope") &&
          !L.flag("glow_isotope_planted") &&
          !L.flag("glow_placebo_planted"),
        onInteract() {
          if (!L.startDialogue("dlg_glow_tower", null)) plantIsotope(false);
        },
      });
    }
  });

  function subwayCoreSpot() {
    // Prefer map anchors; else next to the subway's inbound door target.
    const tries = [
      () => G.map.getAnchor && G.map.getAnchor("subway", "loot"),
      () => G.map.getAnchor && G.map.getAnchor("subway", "core"),
      () =>
        G.map.anchors &&
        G.map.anchors.subway &&
        (G.map.anchors.subway.loot || G.map.anchors.subway.car),
    ];
    for (const t of tries) {
      let a = null;
      try {
        a = t();
      } catch (e) {
        a = null;
      }
      if (a && isFinite(a.x)) return { x: a.x, y: a.y || 0, z: a.z };
    }
    const d = L.doorInto("subway");
    const o = G.LAYOUT.INTERIORS.subway.origin;
    if (d) {
      const t = d.def.target;
      return L.freeSpot(
        t.x + (o.x - t.x) * 0.6,
        t.z + (o.z - t.z) * 0.6,
        t.y || 0,
        { maxR: 12 },
      );
    }
    return L.freeSpot(o.x, o.z, o.y || 0, { maxR: 20 });
  }

  L.hook("spawn", function () {
    // ---- The Neon (Times Square) ----
    const ts = (anchors, dx, dz) => ({
      site: "times_square",
      anchors,
      fallback: { x: TS.x + dx, z: TS.z + dz },
    });
    L.spawnNPC({
      id: "neon_crowe",
      type: "human",
      name: "Mayor Lucius Crowe",
      outfit: "survivor_layers",
      gender: "m",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 3,
      at: ts(["mayor", "leader", "stage", "merchant1"], 0, 0),
      dialogue: "dlg_neon_crowe",
      essential: true,
      level: 10,
      hat: "top_hat",
      burn: "L",
      barks: [
        "Welcome to the Neon, where the lights are bright and nobody, but nobody, is on a list!",
        "Strangers welcome. Manners required.",
        "Vote Crowe! There is no election. Vote anyway!",
      ],
      voice: "settler",
    });
    L.spawnNPC({
      id: "neon_marigold",
      type: "human",
      name: "Marigold",
      outfit: "survivor_layers",
      gender: "f",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: ts(["bar", "lounge", "merchant2"], -14, 16),
      dialogue: "dlg_neon_marigold",
      essential: true,
      merchant: { scrip: 400, stock: STOCK_LOUNGE, restock: 3 },
      barks: [
        "Welcome to the Rad-Lounge, sugar.",
        "Drinks are cheap. The company's cheaper.",
        "I used to dance, you know. Before everything. Before my knees.",
      ],
      voice: "settler",
    });
    L.spawnNPC({
      id: "neon_wendell",
      type: "human",
      name: "Wendell Pruitt",
      outfit: "survivor_layers",
      gender: "m",
      faction: "settlers",
      ai: "wander",
      home: "here",
      homeR: 3,
      at: ts(["resident1", "settler1", "spawn1"], 12, -18),
      dialogue: "dlg_neon_wendell",
      essential: true,
      barks: [
        "Housewares, third floor. Can I help you find something?",
        "Twenty-two years and I still have the name tag.",
      ],
      voice: "settler",
    });
    L.spawnNPC({
      id: "neon_sal",
      type: "human",
      name: "Big Sal",
      outfit: "raider_heavy",
      gender: "m",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 2,
      at: ts(
        ["club_bouncer", "club_door", "bouncer", "gate", "entrance"],
        0,
        40,
      ),
      dialogue: "dlg_neon_sal",
      weapon: ["sawed_off_shotgun", "combat_shotgun"],
      level: 9,
      barks: [
        "No Maniacs, no raiders, no trouble.",
        "You're fine. You got a face like a face.",
      ],
      voice: "settler",
    });

    L.spawnNPC({
      id: "neon_needles",
      type: "human",
      name: "Doc Needles",
      outfit: "doctor",
      gender: "f",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: ts(["clinic_nurse", "doctor", "clinic"], 45, 32),
      dialogue: "dlg_neon_needles",
      voice: "settler",
      merchant: {
        scrip: 250,
        stock: [
          [["rally_tonic", /^rally tonic$/i], 5],
          [["prussian_blue", /^prussian blue$/i], 5],
          [["iodine_tabs", /iodine/i], 3],
          [["morphine_syrette", /morphine/i], 2],
          [["rush", /^rush$/i], 1],
        ],
        restock: 3,
      },
      barks: [
        "Doc Needles. Don't ask about the name.",
        "Rads? Sweetie, the dirt round here's been hot since '67. Take your Prussian Blue and stop licking things.",
      ],
    });

    // ---- St. Patrick's (the Glowkeepers) ----
    const sp = (anchors, dx, dz) => ({
      site: "st_patricks",
      anchors,
      fallback: { x: SP.x + dx, z: SP.z + dz },
    });
    L.spawnNPC({
      id: "glow_ezra",
      type: "keeper_hollowell",
      name: "Keeper Ezra Hollowell",
      outfit: "glowkeeper_robes",
      gender: "m",
      faction: "glowkeepers",
      ai: "guard",
      home: "here",
      homeR: 2,
      at: sp(["preacher", "priest", "altar", "pulpit", "entrance"], -36, 0),
      dialogue: "dlg_glow_ezra",
      essential: true,
      level: 8,
      barks: [
        "The Sun came down once, and it never truly left.",
        "Stand in the Noon, friend!",
        "Can you not feel it? The warmth?",
        "The Sun does not choose.",
      ],
      voice: "m_preacher",
    });
    L.spawnNPC({
      id: "glow_sister",
      type: "sister_noonday",
      name: "Sister Noonday",
      outfit: "glowkeeper_robes",
      gender: "f",
      faction: "glowkeepers",
      ai: "merchant",
      home: "here",
      at: sp(["merchant", "acolyte", "merchant1", "steps"], -36, 7),
      dialogue: "dlg_glow_sister",
      merchant: { scrip: 200, stock: STOCK_GLOW, restock: 3 },
      barks: [
        "Noon water! Kindled in the Light itself!",
        "The Noon be on you.",
      ],
      skinTone: 0.2,
    });

    // ---- Quest objects ----
    if (!L.flag("neon_core_resolved") && !L.has("q_neon_core")) {
      const c = subwayCoreSpot();
      if (c) L.pickup("neon_core", "q_neon_core", 1, c);
    }
    if (!L.flag("ring_resolved") && !L.has("q_wendell_ring")) {
      const s = L.anchor("sterlings", ["safe", "office", "loot2", "loot"], {
        x: -18,
        z: -58,
      });
      if (s) {
        L.pickup("wendell_ring", "q_wendell_ring", 1, s);
        L.pickup("wendell_letter", "q_note_wendell_letter", 1, {
          x: s.x + 0.6,
          y: s.y,
          z: s.z + 0.2,
        });
      }
    }
  });

  // ------------------------------------------------------------------
  // Outcomes
  // ------------------------------------------------------------------
  function plantIsotope(placebo) {
    if (placebo) {
      L.take("q_blessed_isotope", 1);
      L.take(FIZZO_BLUE(), 1);
      L.setFlag("glow_placebo_planted");
      L.notify(
        "You tip the isotope into a lead-lined gutter and seat a glowing bottle of Fizzo Blue in the reliquary instead. It looks very holy.",
      );
      L.xp(60, "Mechanics: a miracle in a bottle");
      L.standing(150, "Saved Grand Central's water");
    } else {
      L.take("q_blessed_isotope", 1);
      L.setFlag("glow_isotope_planted");
      L.notify(
        "The isotope slips into the intake with a soft, warm plop. Somewhere below, a thousand taps begin to glow.",
      );
      L.standing(-400, "Poisoned Grand Central's water");
      G.world.addRadSource({
        x: 240,
        y: 1,
        z: -222,
        radius: 26,
        strength: 1.2,
      });
      L.news(
        "Health bulletin, folks, and it's not a good one. The taps at Grand Central Market are running hot. Doc Hollis says don't drink the water, don't bathe in the water, don't look at the water. The Glowkeepers are calling it a sacrament. Rocky is calling it something I can't say on the air.",
      );
    }
    glowMirror();
    if (Q.stage("sq_glow") === "plant" || Q.stage("sq_glow") === "take")
      Q.setStage("sq_glow", "return");
  }
  /** Hollowell hands over the isotope (secret = the hero means to deal with it himself). */
  function takeIsotope(secret) {
    if (!L.has("q_blessed_isotope")) L.give("q_blessed_isotope", 1);
    if (secret) L.setFlag("glow_secret_plan");
    if (!Q.isStarted("sq_glow")) Q.start("sq_glow", { stage: "plant" });
    else if (Q.stage("sq_glow") === "take") Q.setStage("sq_glow", "plant");
  }
  /** The Keeper is told no, or given the isotope back. */
  function refuseIsotope() {
    if (L.has("q_blessed_isotope")) L.take("q_blessed_isotope", 1);
    L.setFlag("glow_refused");
    L.standing(25, "Refused the Glowkeepers");
    if (!Q.isStarted("sq_glow")) Q.start("sq_glow");
    glowMirror();
    Q.complete("sq_glow");
  }
  /** sq_glow may be started by the main story at any time: move it to the first step not yet done. */
  function glowSync() {
    if (!Q.isActive("sq_glow")) return;
    if (L.flag("glow_convinced") || L.flag("glow_refused")) {
      glowMirror();
      Q.complete("sq_glow");
      return;
    }
    const st = Q.stage("sq_glow");
    if (L.flag("glow_isotope_planted") || L.flag("glow_placebo_planted")) {
      if (st !== "return") Q.setStage("sq_glow", "return");
      return;
    }
    if (st === "take" && L.has("q_blessed_isotope"))
      Q.setStage("sq_glow", "plant");
  }
  /**
   * Main story mirror (story/outline.json mq12): ms_glow = 'planted' | 'convinced' | 'warned' | 'placebo' | 'refused'
   * (strongest first; ms_glow_warned is kept as well), plus Rose's trust: planting -2, warning Grand Central +1,
   * convincing the Keeper +1 (each once).
   */
