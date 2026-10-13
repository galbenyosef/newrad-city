// play-inline-570 12 — dist2
// Lines 3235-3549 of readable/play-inline-570.pretty.js (statement-aligned).
  function t61Update() {
    const s = stage("mq35");
    if (!s) return;
    if (s === "enter") {
      const pf = lp("platform");
      if (pf && pf.lair && dist2(pf) < 30 && L.inInterior())
        Q.setStage("mq35", "platform");
      else if (!lairOn()) {
        for (const k of ["m61_shaft", "bulkhead", "handcar_spur"]) {
          const p = lp(k);
          if (p && dist2(p) < 6) {
            Q.setStage("mq35", "platform");
            break;
          }
        }
      }
    } else if (s === "platform") {
      if (
        ms.f("hollowell") === "ally" &&
        !ms.f("mq35_stood_down") &&
        !ms.f("mq35_fight")
      ) {
        const pf = lp("platform");
        if (pf && dist2(pf) < 14) standDown("hollowell");
      }
      const em = L.npc("ms_t61_ember");
      if (
        em &&
        !em.dead &&
        !ms.f("mq35_stood_down") &&
        !ms.f("mq35_fight") &&
        !L.flag("ms_mq35_ember_met") &&
        dist2(em.pos) < 6 &&
        G.state === "play"
      ) {
        L.setFlag("ms_mq35_ember_met", true);
        L.startDialogue("dlg_ms5_ember", "ms_t61_ember");
      }
      const ch = lp("candles_hall");
      if (platformClear() || (ch && dist2(ch) < 7))
        Q.setStage("mq35", "candles");
    } else if (s === "candles") {
      const ch = lp("candles_hall");
      if (ch && dist2(ch) < 6 && !ms.f("mq35_hall") && G.state === "play") {
        ms.set("mq35_hall");
        ms.talk("dlg_ms5_candles", "Hall of Candles", "hall");
      }
      const dr = lp("drill");
      if (dr && dist2(dr) < 6) Q.setStage("mq35", "drill");
    } else if (s === "drill") {
      if (
        ms.f("mq35_drill_resolved") === "fight" &&
        (L.flag("dead_ms_tinder") ||
          T61_CREW.every((id) => !!L.flag("dead_" + id)))
      ) {
        ms.set("tinder_stopped");
        Q.setStage("mq35", "door");
        return;
      }
      const dr = lp("drill");
      const a = L.npc("ms_tinder");
      if (
        !tinderResolved() &&
        a &&
        !a.dead &&
        dr &&
        dist2(dr) < 5 &&
        !L.flag("ms_mq35_tinder_met") &&
        G.state === "play"
      ) {
        L.setFlag("ms_mq35_tinder_met", true);
        L.startDialogue("dlg_ms5_tinder", "ms_tinder");
      }
      const d = lp("m42_door");
      if (d && dist2(d) < 7) Q.setStage("mq35", "door");
    } else if (s === "door") {
      const d = lp("m42_door");
      if (d && dist2(d) < 3.2) reachDoor();
    }
  }

  L.hook("init", function () {
    ms.quest({
      id: "mq35",
      giver: "Sunday, 05:00",
      location: "Track 61, under Grand Central",
      desc: () =>
        "Sunday, five in the morning. Down the welded shaft or through the bulkhead" +
        (roseWithEli() ? ", or by Rose's old handcar spur," : "") +
        " to the platform where a President's armoured railcar has sat since before the war, through the Hall of Candles, to the M42 door. The Second Sun is set for 09:47.",
      stages: [
        {
          id: "enter",
          text: () =>
            roseWithEli()
              ? "Go down to Track 61: Rose knows the handcar spur, or use the hatch key at the Waldorf M-61 shaft or the 42nd Street bulkhead."
              : "Go down to Track 61 with the hatch key: the Waldorf M-61 shaft or the 42nd Street bulkhead.",
          markers: () => {
            const out = [
              plain(lp("m61_shaft"), "M-61 Shaft (Waldorf)"),
              plain(lp("bulkhead"), "The Bulkhead (42nd St)"),
            ];
            if (roseWithEli() || ms.f("rose_stays"))
              out.push(plain(lp("handcar_spur"), "Handcar Spur"));
            return out.filter(Boolean);
          },
          onEnter() {
            ms.set("track61_open");
            if (captive()) rose.place("gone");
            else if (roseWithEli()) {
              rose.place("follow");
              L.later(2, () =>
                rose.say(
                  "Handcar spur's at the Park Avenue end. I left a lantern on the rail in '84. Bet it's still there.",
                ),
              );
            } else rose.place("gone"); // she goes in alone by her own route
            L.later(1.2, () =>
              L.notify(
                "Sunday. 05:00. The concourse clock still says 9:47, the way it has for twenty-two years.",
                { duration: 6 },
              ),
            );
          },
        },
        {
          id: "platform",
          text: "Cross Track 61. Your allies hold the stairs behind you.",
          markers: () =>
            [
              ms.f("mq35_stood_down")
                ? null
                : { npc: "ms_t61_ember", label: "Brother Ember" },
              plain(lp("railcar"), "Track 61"),
              plain(lp("candles_hall"), "Hall of Candles"),
            ]
              .filter(Boolean)
              .slice(0, 2),
          onEnter() {
            alliesHold();
            L.later(0.3, ms.pollRoster);
          },
        },
        {
          id: "candles",
          text: "Pass through the Hall of Candles.",
          markers: () => [plain(lp("candle_pod7"), "Hall of Candles")],
        },
        {
          id: "drill",
          text: "Stop Brother Tinder's drill crew, or let them work.",
          markers: () =>
            [
              tinderResolved()
                ? null
                : { npc: "ms_tinder", label: "Brother Tinder" },
              plain(lp("m42_door"), "M42 Door"),
            ]
              .filter(Boolean)
              .slice(0, 1),
        },
        {
          id: "door",
          text: "Reach the M42 door.",
          markers: () => [plain(lp("m42_door"), "M42 Door")],
          onEnter() {
            L.notify("09:30.", { duration: 3 });
          },
        },
        {
          id: "spare",
          text: "(Optional) Get past the zealots without killing them.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            inStage("mq35", ["platform", "candles", "drill", "door"]),
          doneIf: () => !!ms.f("zealots_spared"),
          failIf: () => killedAny(T61_Z.concat(T61_CREW)),
        },
        {
          id: "r_candle",
          text: '(Optional) The candle marked "R."',
          sideObjective: true,
          optional: true,
          showIf: () => !!ms.f("mq35_hall"),
          doneIf: () => !!ms.f("mq35_candle_r"),
          markers: () => [plain(lp("candle_r"), 'Candle "R."')],
        },
        {
          id: "record",
          text: "(Optional) The record player in the alcove.",
          sideObjective: true,
          optional: true,
          showIf: () => !!ms.f("mq35_hall"),
          doneIf: () => !!ms.f("mq35_record"),
          markers: () => [plain(lp("record_player"), "Record Player")],
        },
      ],
      rewards: { xp: 900 },
      onComplete() {
        ms.set("lair_open");
        L.setFlag("ms_mq35_left", true);
        // the drill crew stays for the finale's own Tinder (src/lair may reuse ms_tinder): leave him where he is
        L.later(0.5, () => {
          for (const id of T61_Z)
            if (L.npc(id) && !L.flag("dead_" + id)) L.removeNPC(id);
        });
        if (!Q.get("mq36"))
          L.later(2, () =>
            L.notify(
              "The M42 door stands open. Beyond it, a dosimeter is clicking and a record is playing.",
              { duration: 6 },
            ),
          );
      },
    });
  });
  ms.solver("mq35", {
    enter() {
      Q.setStage("mq35", "platform");
    },
    platform() {
      standDown("talk");
      Q.setStage("mq35", "candles");
    },
    candles() {
      ms.set("mq35_hall");
      ms.set("mq35_pod7");
      Q.setStage("mq35", "drill");
    },
    drill() {
      tinder("persuade");
      Q.setStage("mq35", "door");
    },
    door() {
      reachDoor();
    },
  });

  // ==================================================================
  // Polling (game time) + lock audit
  // ==================================================================
  let tick = 0;
  L.hook("update", function (dt) {
    tick += dt;
    if (tick < 0.5) return;
    const step = tick;
    tick = 0;
    if (!L.isWorldBuilt() || !G.player) return;
    try {
      raceUpdate(step);
    } catch (e) {
      G.reportError("quests:ms5:race", e);
    }
    try {
      raidUpdate(step);
    } catch (e) {
      G.reportError("quests:ms5:raid", e);
    }
    try {
      t61Update();
    } catch (e) {
      G.reportError("quests:ms5:t61", e);
    }
  });
  L.hook("register", function () {
    if (
      !G.isStub("locks") &&
      G.locks &&
      typeof G.locks.obtainableFrom === "function"
    ) {
      try {
        G.locks.obtainableFrom("q_track61_key", "Keeper Hollowell (mq33)");
      } catch (e) {
        /* optional */
      }
    }
  });

  // Debug: G.quests.debug.ms5
  G.quests.debug.ms5 = {
    wreck: () => {
      const c = wc();
      return { x: c.x, y: c.y, z: c.z, anchored: !!c.anchored };
    },
    race: () => ({
      t: L.flag("ms_mq31_race_t"),
      breach: !!L.flag("ms_mq31_breach"),
      denied: !!ms.f("sun_word_denied"),
      glow: !!ms.f("sun_word_glow"),
    }),
    raid: () => ({
      site: raidSite(),
      key: raidKey(),
      t: L.flag("ms_mq32_raid_t"),
      down: raidersDown(),
      over: raidOver(),
    }),
    dawn: (w) => dawnScene(w || "roof"),
    musters: () => musters(),
    lair: () =>
      Object.keys(LAIR_FB).map((k) => {
        const p = lp(k);
        return (
          k +
          ": " +
          (p
            ? Math.round(p.x) +
              "," +
              Math.round(p.z) +
              (p.lair ? " (lair)" : " (fallback)")
            : "-")
        );
      }),
  };
