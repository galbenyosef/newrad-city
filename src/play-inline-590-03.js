// play-inline-590 03 — pos
// Lines 241-424 of readable/play-inline-590.pretty.js (statement-aligned).
  K.spawnSunCast = function () {
    if (!K.O2()) return;
    const F = K.fin(),
      I = K.in();
    const ended = !!F.ending;
    // Nicole (alive unless an A or C ending happened)
    if (!K.flag("ms_nicole_dead") && !K.flag("dead_lair_nicole")) {
      const n = A("nicole");
      const recognised = F.phase && F.phase !== "pre";
      K.spawn({
        id: "lair_nicole",
        type: K.typeOr("sister_dawn", "human"),
        preset: "sister_dawn",
        name: recognised ? "Nicole" : "Sister Dawn",
        gender: "f",
        outfit: "glowkeeper_robes",
        hair: "long",
        skinTone: 0.18,
        age: 50,
        faction: "glowkeepers",
        hostile: false,
        essential: true,
        ai: "static",
        level: 14,
        hp: 200,
        dialogue: "lair_dlg_dawn",
        noRespawn: true,
        voice: "f_old",
        pos: { x: n.x, y: 0, z: n.z },
        yaw: recognised ? HP : -HP,
        barks: [],
      });
      const a = K.npc("lair_nicole");
      if (a) {
        a.name = recognised ? "Nicole" : "Sister Dawn";
        a.essential = !ended;
        a.dialogue = "lair_dlg_dawn";
        a.yaw = recognised ? HP : -HP;
      }
    }
    // Rose
    if (!K.flag("ms_rose_dead") && !K.flag("dead_lair_rose") && !F.roseGone) {
      const st = I.roseState;
      let pos = null,
        ai = "guard";
      if (F.roseArrived || st === "with_eli") {
        const p = A("m42_arrival");
        pos = { x: p.x + 1.2, z: p.z + 1.8 };
      }
      if (st === "captive" && !F.roseFreed) {
        const p = A("rose_captive");
        pos = { x: p.x, z: p.z };
        ai = "sit";
      }
      if (F.roseArrived && st === "alone") {
        const p = A("spur_mouth");
        pos = { x: p.x - 3, z: p.z - 1 };
        ai = "guard";
      }
      if (ended && F.rosePlace) pos = F.rosePlace;
      if (pos) {
        K.spawn({
          id: "lair_rose",
          type: K.typeOr("rose", "human"),
          preset: "rose",
          name: "Rose",
          gender: "f",
          outfit: "leather_armor",
          hair: "short",
          skinTone: 0.32,
          faction: "cryo",
          hostile: false,
          essential: !ended || !K.flag("ms_rose_mortal"),
          ai,
          level: 12,
          hp: 320,
          weapon: ai === "sit" ? undefined : ["sniper_rifle", "hunting_rifle"],
          dialogue: "lair_dlg_rose",
          noRespawn: true,
          voice: "f_young",
          variant: ai === "sit" ? "brand" : undefined,
          pos: { x: pos.x, y: 0, z: pos.z },
          yaw: HP * 0.5,
          barks: [],
        });
      }
    }
    if (ended) return;
    // Tinder
    if (K.alive("tinder") && !K.flag("dead_lair_tinder")) {
      const p = A("plate");
      K.despawn("ms_tinder");
      K.spawn({
        id: "lair_tinder",
        type: K.typeOr("brother_tinder", "human"),
        preset: "brother_tinder",
        name: "Brother Tinder",
        gender: "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: false,
        essential: true,
        ai: "static",
        level: 13,
        hp: 300,
        weapon: ["sledgehammer", "lead_pipe"],
        noRespawn: true,
        pos: { x: p.x + 0.4, y: 0, z: p.z - 1.6 },
        yaw: HP,
        barks: ["Nine forty-seven.", "Mind the cables."],
      });
    }
    // the kneeling zealots
    const n = K.zealotCount(),
      KN = K.SUN.KNEEL || [];
    for (let i = 0; i < K.ZEALOTS.length; i++) {
      const id = K.ZEALOTS[i];
      if (i >= n || K.flag("dead_" + id) || F.zealotsGone) {
        if (K.npc(id) && !K.flag("dead_" + id)) K.despawn(id);
        continue;
      }
      const p = KN[(i * 3) % KN.length] || {
        x: K.O2().x - 6,
        z: K.O2().z,
        yaw: -HP,
      };
      K.spawn({
        id,
        type: K.typeOr("glowkeeper_zealot", "human"),
        preset: "glowkeeper_zealot",
        seed: 900 + i,
        name: "Glowkeeper Zealot",
        gender: i % 3 === 1 ? "f" : "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: !!F.fight,
        essential: false,
        ai: F.fight ? "guard" : "kneel",
        level: 11,
        hp: 160,
        weapon: [
          ["pipe_pistol", "pistol_10mm"],
          ["machete", "lead_pipe"],
          ["hunting_rifle", "bolt_rifle_32"],
        ][i % 3],
        noRespawn: true,
        pos: { x: p.x, y: 0, z: p.z },
        yaw: p.yaw,
        barks: [
          "Keep the light on.",
          "A dimanche.",
          "The Sun does not choose.",
        ],
      });
    }
    // Hollowell, if he came down as an ally
    if (K.in().hollowell === "ally" && K.alive("hollowell")) {
      const p = A("m42_arrival");
      K.spawn({
        id: "lair_hollowell",
        type: K.typeOr("keeper_hollowell", "human"),
        preset: "keeper_hollowell",
        name: "Keeper Ezra Hollowell",
        gender: "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: false,
        essential: true,
        ai: "static",
        level: 8,
        noRespawn: true,
        pos: { x: p.x + 0.6, y: 0, z: p.z - 2.2 },
        yaw: -HP,
      });
    }
  };
  /** Everybody out (reset, test runs). */
  K.despawnSunCast = function (keepNicole) {
    for (const id of ["lair_rose", "lair_tinder", "lair_hollowell"].concat(
      K.ZEALOTS,
    ))
      K.despawn(id);
    if (!keepNicole) K.despawn("lair_nicole");
  };
