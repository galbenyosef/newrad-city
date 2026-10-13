// play-inline-553 05 — ack
// Lines 1114-1459 of readable/play-inline-553.pretty.js (statement-aligned).
  function spawnQuestActors() {
    // The Rematch — Danny "The Kid" Kearns and his entourage.
    if (
      Q.isActive("sq_malone") &&
      (Q.stage("sq_malone") === "find" || Q.stage("sq_malone") === "belt")
    ) {
      const kid = L.spawnNPC({
        id: "msg_kid",
        type: "maniac",
        name: 'Danny "The Kid" Kearns',
        faction: "maniacs",
        level: 9,
        hp: 230,
        damage: 1.5,
        ai: "guard",
        home: "here",
        homeR: 7,
        at: { fallback: KID_SPOT, maxR: 10 },
        inventory: [
          ["q_garden_belt", 1],
          ["scrip", 17],
        ],
        noRespawn: true,
      });
      if (kid && !kid.dead) {
        for (let i = 0; i < 3; i++) {
          const ang = i * 2.1 + 0.4;
          L.spawnNPC({
            id: "msg_maniac_" + i,
            type: "maniac",
            faction: "maniacs",
            level: 5,
            ai: "wander",
            home: "here",
            homeR: 8,
            noRespawn: true,
            at: {
              fallback: {
                x: kid.pos.x + Math.cos(ang) * 6,
                z: kid.pos.z + Math.sin(ang) * 6,
              },
              maxR: 6,
            },
          });
        }
      }
    }
    // Chapter and Verse — the press core at the top of the Guggenheim spiral.
    if (
      Q.isActive("sq_tull") &&
      Q.stage("sq_tull") === "fetch" &&
      !L.has("q_press_core")
    ) {
      const p = L.anchor("guggenheim", ["loot", "top", "boss"], {
        x: 160,
        z: -755,
      });
      if (p) L.pickup("tull_press", "q_press_core", 1, p);
    }
    // Severance Package — Gutter and Rook's lockbox at the Woolworth raider den.
    if (Q.isActive("sq_rook") && Q.stage("sq_rook") === "stash") {
      if (!L.has("q_rook_lockbox")) {
        const p = L.anchor("woolworth", ["spawn2", "spawn1", "entrance"], {
          x: 5.6,
          z: 595,
        });
        if (p)
          L.pickup("rook_lockbox", "q_rook_lockbox", 1, {
            x: p.x + 0.8,
            y: p.y,
            z: p.z - 0.6,
          });
      }
      if (!L.isDead("comp_gutter")) {
        L.spawnNPC({
          id: "comp_gutter",
          type: "human",
          name: "Gutter",
          outfit: "raider_heavy",
          gender: "m",
          hair: "wild",
          faction: "raiders",
          ai: "guard",
          home: "here",
          homeR: 5,
          hostile: true,
          level: 9,
          hp: 240,
          weapon: ["combat_shotgun", "sawed_off_shotgun"],
          inventory: [
            ["scrip", 60],
            ["rage", 1],
            ["q_note_rook_bounty", 1],
          ],
          noRespawn: true,
          at: {
            site: "woolworth",
            anchors: ["spawn4", "spawn1", "boss"],
            fallback: { x: 4.2, z: 617 },
          },
          barks: {
            alert: ["Rook sent you? ROOK SENT YOU?", "That's my money now!"],
            idle: ["Rook, you little... when I find her..."],
          },
        });
      }
    }
  }

  L.hook("spawn", function () {
    for (const k of KEYS) cfg[k]._home = null;
    for (const k of KEYS) {
      try {
        spawnCompanion(k);
      } catch (e) {
        G.reportError("quests:spawnCompanion:" + k, e);
      }
    }
    spawnQuestActors();
    if (L.flag("tull_library")) dressLibrary();
    if (!st("rook").hostile) dressRookCamp();
    for (const k of KEYS) talentOn[k] = null; // rpg may have restored (or not) the effect: re-sync
  });
  L.hook("reset", function () {
    for (const k of KEYS) {
      talentOn[k] = null;
      cfg[k]._home = null;
    }
    L.world.tullLibrary = false;
    L.world.rookCamp = false;
    barkGate = 0;
    tickT = 0;
    slowT = 0;
    aggroT = 0;
    farewellFor = null;
  });

  // ------------------------------------------------------------------
  // Dialogue — shared companion wheel + per-character trees
  // ------------------------------------------------------------------
  function statusLine(k) {
    const s = st(k);
    return (
      "[" +
      (s.far ? "Keeping distance" : "Staying close") +
      "  ·  " +
      (s.melee ? "Melee" : "Ranged") +
      "  ·  " +
      (s.passive ? "Passive" : "Aggressive") +
      "]"
    );
  }
  function commonNodes(k, extraResponses) {
    const c0 = cfg[k];
    const S = () => st(k);
    return {
      comp: {
        speaker: c0.name,
        text: () => {
          const s = S();
          if (s.wait)
            return (
              pick(c0.greet) +
              " " +
              pick([
                "Still here, like you asked.",
                "Waiting, like a good little hireling.",
                "Holding position.",
              ])
            );
          return pick(c0.greet) + (c0.compLine ? " " + c0.compLine() : "");
        },
        responses: () =>
          [
            {
              id: cid(k, "tac"),
              text: "Let's talk about how you're handling things.",
              next: "tactics",
            },
            {
              id: cid(k, "wait"),
              text: "Wait here.",
              cond: () => !S().wait,
              action: () => {
                doWait(k);
                L.later(0.3, () => bark(k, pick(c0.wait), 3, true));
              },
            },
            {
              id: cid(k, "fol"),
              text: "Follow me.",
              cond: () => !!S().wait,
              action: () => {
                doFollow(k);
                L.later(0.3, () => bark(k, pick(c0.follow), 3, true));
              },
            },
            {
              id: cid(k, "trade"),
              text: "Let's trade some equipment.",
              action: () => {
                bump(k);
                L.later(0.1, () => openInventory(k));
              },
            },
          ]
            .concat(extraResponses ? extraResponses() : [])
            .concat([
              {
                id: cid(k, "part"),
                text: "I think it's time we parted ways.",
                next: "part",
              },
              { id: cid(k, "bye"), text: "Never mind.", end: true },
            ]),
      },
      tactics: {
        speaker: c0.name,
        text: () => {
          const s = S();
          const ack = s.ack || "How do you want it done?";
          s.ack = null;
          return ack + "\n\n" + statusLine(k);
        },
        responses: () => [
          {
            id: cid(k, "far"),
            text: "Keep your distance.",
            cond: () => !S().far,
            action: () => {
              S().far = true;
              S().ack = c0.ack.far;
              bump(k);
            },
            next: "tactics",
          },
          {
            id: cid(k, "near"),
            text: "Stay close to me.",
            cond: () => S().far,
            action: () => {
              S().far = false;
              S().ack = c0.ack.near;
              bump(k);
            },
            next: "tactics",
          },
          {
            id: cid(k, "mel"),
            text: "Switch to your melee weapon.",
            cond: () => !S().melee,
            action: () => {
              S().melee = true;
              S().ack = c0.ack.melee;
              bump(k);
              ensureWeapon(k);
            },
            next: "tactics",
          },
          {
            id: cid(k, "rng"),
            text: "Use your ranged weapon.",
            cond: () => S().melee,
            action: () => {
              S().melee = false;
              S().ack = c0.ack.ranged;
              bump(k);
              ensureWeapon(k);
            },
            next: "tactics",
          },
          {
            id: cid(k, "pas"),
            text: "Be passive. Only fight if we're attacked.",
            cond: () => !S().passive,
            action: () => {
              S().passive = true;
              S().ack = c0.ack.passive;
              bump(k);
            },
            next: "tactics",
          },
          {
            id: cid(k, "agg"),
            text: "Be aggressive. Engage anything hostile on sight.",
            cond: () => S().passive,
            action: () => {
              S().passive = false;
              S().ack = c0.ack.aggressive;
              bump(k);
            },
            next: "tactics",
          },
          { id: cid(k, "tdone"), text: "That's all.", next: "comp" },
        ],
      },
      part: {
        speaker: c0.name,
        text: c0.partAsk,
        responses: () => [
          {
            id: cid(k, "part_y"),
            text: "Yes. Go home.",
            action: () => {
              release(k, "dismiss");
              L.later(0.3, () => bark(k, c0.partBye, 4, true));
            },
          },
          {
            id: cid(k, "part_n"),
            text: "On second thought, stick around.",
            next: "comp",
          },
        ],
      },
      farewell: {
        speaker: c0.name,
        text: c0.farewell,
        noExit: true,
        onEnter: () => {
          if (S().rec) {
            release(k, "standing");
            L.notify(c0.short + " has left you.");
          }
        },
        responses: [{ text: c0.farewellReply, end: true }],
      },
      full: {
        speaker: c0.name,
        text: c0.fullText,
        responses: [{ text: "[Leave.]", end: true }],
      },
    };
  }
  function makeTree(k, start, nodes, extra) {
    const t = { start, nodes: Object.assign(commonNodes(k, extra), nodes) };
    L.dialogue(cfg[k].dlg, t);
  }
  /** Shared start logic: farewell > companion wheel > (per-character) intro. */
  // Personal-quest turn-in that must also work when the companion is NOT hired (dismissed, or left over
  // over standing after the quest started) — otherwise the quest could get stuck forever.
  const TURN_IN = {
    malone: { q: "sq_malone", item: "q_garden_belt", node: "belt_back" },
    tull: { q: "sq_tull", item: "q_press_core", node: "press_back" },
    rook: { q: "sq_rook", item: "q_rook_lockbox", node: "stash_back" },
  };
