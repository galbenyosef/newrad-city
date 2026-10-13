// play-inline-526 06 — pos
// Lines 1331-1473 of readable/play-inline-526.pretty.js (statement-aligned).
  function encPatrolman() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 35, 60, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return null;
    const ax = G.LAYOUT.isRoad(s.x + 20, s.z) && G.LAYOUT.isRoad(s.x - 20, s.z);
    const pts = ax
      ? [
          { x: s.x - 30, z: s.z },
          { x: s.x + 30, z: s.z },
        ]
      : [
          { x: s.x, z: s.z - 30 },
          { x: s.x, z: s.z + 30 },
        ];
    const a = K.spawnActor({
      type: "patrolman",
      faction: "amb_civic",
      hostile: false,
      name: "Police Patrolman",
      level: Math.max(3, K.level()),
      pos: s,
      ai: "patrol",
      patrol: pts,
      noRespawn: true,
      voice: "amb_none",
      barks: { idle: COP_LINES, greet: ["HALT, CITIZEN."] },
      inventory: K.stock([
        ["ammo_dry_cell", K.randInt(1, 3)],
        ["scrap_electronics", 1],
      ]),
    });
    if (!a) return null;
    const E = {
      kind: "patrolman",
      x: s.x,
      z: s.z,
      actors: [a],
      pickups: [],
      t: 0,
      cited: false,
      talkT: 3,
    };
    E.update = function (dt) {
      E.t += dt;
      if (!K.actorAlive(a)) return U.castGone(E) ? "gone" : null;
      E.x = a.pos.x;
      E.z = a.pos.z;
      E.talkT -= dt;
      const d = K.distToPlayer(a.pos.x, a.pos.z);
      if (a.inCombat || a.hostile()) return U.castGone(E) ? "gone" : null;
      if (E.talkT <= 0 && d < 40) {
        E.talkT = K.rand(9, 16);
        K.say(a, K.pick(COP_LINES), 4.5);
        K.sfx("robot_voice", { pos: a.pos, volume: 0.5 });
      }
      if (!E.cited && d < 6) {
        E.cited = true;
        E.stopT = 5;
        a.aiMode = "static";
        a.faceTowards(G.player.pos.x, G.player.pos.z);
        K.say(
          a,
          "HALT, CITIZEN. YOU HAVE CROSSED AGAINST THE SIGNAL. A CITATION HAS BEEN ISSUED. HAVE A SAFE AND PRODUCTIVE DAY.",
          6,
        );
        K.sfx("robot_beep", { pos: a.pos, volume: 0.6 });
        if (
          K.itemExists("amb_note_citation") &&
          !(G.inventory.count && G.inventory.count("amb_note_citation") > 0)
        )
          K.give("amb_note_citation", 1);
      }
      if (E.stopT !== undefined) {
        E.stopT -= dt;
        a.faceTowards(G.player.pos.x, G.player.pos.z, 2, dt);
        if (E.stopT <= 0) {
          E.stopT = undefined;
          a.aiMode = "patrol";
        }
      }
      if (
        E.t > 90 &&
        d > 120 &&
        !K.inView(a.pos.x, a.pos.y + 1, a.pos.z, 1, true)
      )
        return "gone";
      return U.castGone(E) || E.t > 360 ? "gone" : null;
    };
    E.cleanup = function () {
      U.removeCast(E);
    };
    return E;
  }

  // ------------------------------------------------------------------
  // Registration
  // ------------------------------------------------------------------
  const reg = K.encounters.register;
  reg("slavers", {
    make: encSlavers,
    cd: 30,
    w: () => (K.level() >= 2 ? (K.isDark() ? 0.4 : 1.0) : 0),
  });
  reg("ambush", {
    make: encAmbush,
    cd: 26,
    w: () => (K.level() >= 2 ? (K.isDark() ? 1.1 : 0.8) : 0),
  });
  reg("sky_eye", {
    make: encSkyEye,
    cd: 30,
    w: () => (K.relation("player", "continuity") === "ally" ? 0.3 : 0.8),
  });
  reg("patrolman", {
    make: encPatrolman,
    cd: 40,
    w: () => (K.isDark() ? 0.8 : 0.5),
  });

  K.system({
    name: "encounters_more",
    order: 61,
    initDone() {
      defineNotes();
      slaverDialogues();
      baitDialogue();
    },
    newGame() {
      defineNotes();
      slaverDialogues();
      baitDialogue();
    },
    reset() {
      slaverE = null;
      baitE = null;
    },
  });
