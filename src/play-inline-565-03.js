// play-inline-565 03 — rose
// Lines 678-1027 of readable/play-inline-565.pretty.js (statement-aligned).
  const rose = (ms.rose = {
    id: "ms_rose",
    HOME: ROSE_HOME,
    /** Where Rose is: mode 'home' (her roof), 'at' (a spot), 'follow' (beside the hero), 'gone' (not in the world). Persists. */
    place(mode, at) {
      L.setFlag("ms_rose_place", { mode, at: at || null });
      rose.apply();
    },
    mode() {
      const p = L.flag("ms_rose_place");
      return p && p.mode ? p.mode : L.flag("ms_rose_met") ? "home" : "gone";
    },
    spec() {
      return {
        id: rose.id,
        type: "rose",
        preset: "rose",
        name: ms.roseName(),
        gender: "f",
        outfit: "leather_armor",
        hair: "ponytail",
        hairColor: 0x3a2616,
        skinTone: 0.32,
        age: 21,
        faction: "cryo",
        hostile: false,
        essential: true,
        level: 12,
        hp: 320,
        weapon: ["sniper_rifle", "hunting_rifle"],
        dialogue: "dlg_ms_rose",
        voice: "f_young",
        noRespawn: true,
      };
    },
    barks() {
      if (!L.flag("ms_rose_revealed"))
        return [
          "Eyes up.",
          "Keep moving, sleeper.",
          "I don't do candles.",
          "You walk like a man who's been asleep. You have.",
        ];
      return [
        "Stay close, Dad. ...Don't make it a thing.",
        "Eyes up.",
        "I've got the high ground. I always have the high ground.",
        "Five forty-seven. I'm always up at five forty-seven.",
      ];
    },
    apply() {
      if (!L.isWorldBuilt() || !G.player) return;
      const m = rose.mode();
      if (m === "gone" || L.flag("ms_rose_released")) {
        if (L.npc(rose.id)) L.removeNPC(rose.id);
        return;
      }
      const P = L.flag("ms_rose_place") || {};
      // normalise the spot: {site, anchors, fallback} | {fallback:{x,z,y}} | {x,z,y}
      let at = m === "home" ? ROSE_HOME : P.at || ROSE_HOME;
      if (m === "follow") {
        const p = G.player.pos;
        at = { fallback: { x: p.x + 1.6, z: p.z + 1.2, y: p.y } };
      }
      if (at.x !== undefined && !at.fallback)
        at = { fallback: { x: at.x, z: at.z, y: at.y } };
      let a = L.npc(rose.id);
      if (!a || a.dead) {
        const def = Object.assign(rose.spec(), {
          ai: m === "follow" ? "follow" : "guard",
          home: "here",
          homeR: 2,
        });
        def.barks = rose.barks();
        def.at = {
          site: at.site,
          anchors: at.anchors || [],
          fallback: at.fallback,
          maxR: 6,
        };
        if (!at.site) def.at = { fallback: at.fallback, maxR: 6 };
        a = L.spawnNPC(def);
      } else if (m !== "follow") {
        const p = at.site
          ? L.anchor(at.site, at.anchors || [], at.fallback, { maxR: 6 })
          : L.freeSpot(at.fallback.x, at.fallback.z, at.fallback.y, {
              maxR: 6,
            });
        if (p && Math.hypot(a.pos.x - p.x, a.pos.z - p.z) > 4)
          L.moveNPC(rose.id, p);
      }
      if (!a) return;
      a.name = ms.roseName();
      a.essential = !L.flag("ms_rose_mortal");
      if (a.setHostile) {
        try {
          a.setHostile(false);
        } catch (e) {
          /* */
        }
      }
      if (m === "follow") {
        a.ai = "follow";
        if (a.follow) {
          try {
            a.follow(G.player);
          } catch (e) {
            /* */
          }
        }
      } else {
        a.ai = "guard";
        if (a.stop) {
          try {
            a.stop();
          } catch (e) {
            /* */
          }
        }
      }
    },
    actor() {
      return L.npc(rose.id);
    },
    say(text, dur) {
      const a = L.npc(rose.id);
      if (a && !a.dead && a.say) {
        try {
          a.say(ms.t(text), dur || 4.5);
        } catch (e) {
          /* */
        }
      } else ms.say(ms.roseName(), text, dur);
    },
    /** The finale takes over Rose: remove the scripted ally (helper module spawns its own) or keep it (keep=true). */
    release(keep) {
      L.setFlag("ms_rose_released", !keep);
      if (!keep) L.removeNPC(rose.id);
    },
    marker(label) {
      return [{ npc: rose.id, label: label || ms.roseName() }];
    },
  });
  // Rose stays where the story put her (spawn/load) and keeps up when following.
  L.hook("spawn", function () {
    L.later(0.4, () => rose.apply());
  });
  let roseT = 0;
  L.hook("update", function (dt, realDt) {
    roseT -= realDt;
    if (roseT > 0) return;
    roseT = 2.0;
    if (!L.isWorldBuilt()) return;
    const m = rose.mode();
    if (m === "gone" || L.flag("ms_rose_released")) return;
    const a = L.npc(rose.id);
    if (!a) {
      rose.apply();
      return;
    }
    if (a.dead && !L.flag("ms_rose_mortal")) {
      L.removeNPC(rose.id);
      rose.apply();
      return;
    } // never dies before the finale
    if (m === "follow") {
      const p = G.player.pos;
      const d = Math.hypot(a.pos.x - p.x, a.pos.z - p.z);
      // left behind (fast travel, a load door): catch up
      if (d > 60 || Math.abs(a.pos.y - p.y) > 8) {
        const f = L.freeSpot(p.x + 1.6, p.z + 1.2, p.y, { maxR: 5 });
        L.moveNPC(rose.id, f);
      }
      if (a.follow && a.ai !== "follow") {
        a.ai = "follow";
        try {
          a.follow(G.player);
        } catch (e) {
          /* */
        }
      }
    }
    if (a.hp !== undefined && a.maxHp && a.hp < a.maxHp * 0.25 && a.heal) {
      try {
        a.heal(a.maxHp * 0.5);
      } catch (e) {
        /* */
      }
    }
  });

  // Rose's composite dialogue: act files add nodes + start selectors (ms.dlg('dlg_ms_rose')).
  const RD = ms.dlg("dlg_ms_rose", "idle");
  RD.add({
    idle: {
      speaker: () => ms.roseName(),
      text: () => {
        const t = ms.trust();
        if (!L.flag("ms_rose_revealed"))
          return [
            "Flint. Rifle. Roof. That's all there is to know.",
            "You want something, sleeper, or are you just standing in my light?",
            "I keep the sign lit. The sign keeps me fed. Simple.",
          ][Math.floor(Math.random() * 3)];
        if (t <= 1) return "[She doesn't look up from her rifle.] What.";
        if (t >= 4)
          return "[She almost smiles.] Hey, Dad. ...Still weird. Saying it. Go on.";
        return "Rose. Still here. What do you need?";
      },
      responses: [
        {
          text: "How are you holding up?",
          next: "holding",
          cond: () => !!L.flag("ms_rose_revealed"),
        },
        {
          text: "Come with me for a while.",
          next: "follow",
          cond: () => rose.mode() !== "follow" && !!L.flag("ms_rose_follow_ok"),
        },
        {
          text: "Wait here.",
          next: "stay",
          cond: () => rose.mode() === "follow" && !!L.flag("ms_rose_follow_ok"),
        },
        { text: "Never mind." },
      ],
    },
    holding: {
      text: () => {
        const t = ms.trust();
        if (t <= 1)
          return "Holding. Don't ask me again like that. Like you're somebody's father.";
        if (t === 2)
          return "I sleep three hours a night and I wake up at five forty-seven for a radio show I hate. So: normal.";
        if (t === 3)
          return "Better than I was. You talk in your sleep, you know. About radiators.";
        return "Better. Don't tell anybody. [She bumps your shoulder with hers, once, very fast.]";
      },
      responses: [{ text: "Good." }],
    },
    follow: {
      text: "Fine. I'll walk. Don't talk too much.",
      onEnter() {
        rose.place("follow");
      },
      responses: [{ text: "Let's go." }],
    },
    stay: {
      text: "I'll head back to the roof. You know where the sign is.",
      onEnter() {
        rose.place("home");
      },
      responses: [{ text: "See you there." }],
    },
  });

  // ------------------------------------------------------------------
  // Finale inputs: everything the lair/finale module reads, in one place
  // ------------------------------------------------------------------
  /** Rose's state going into the finale: 'captive' | 'with_eli' | 'alone'. */
  ms.roseState = function () {
    if (L.flag("ms_rose_captive")) return "captive";
    if (
      L.flag("ms_rose_with_eli") &&
      ms.trust() >= 3 &&
      L.flag("ms_torch") !== "selective"
    )
      return "with_eli";
    return "alone";
  };
  ms.finaleInputs = function () {
    const f = (k) => L.flag("ms_" + k);
    return {
      roseTrust: ms.trust(),
      roseState: ms.roseState(),
      rosePromise: !!f("rose_promise"),
      ring: f("ring") || (f("has_ring") ? "kept" : null), // 'rose' | 'stone' | 'kept' | null
      roseHasPhoto: !!f("rose_has_photo"),
      tokens: ms.tokens(),
      notice: f("notice") || null, // 'sundays' | 'plain'
      eliReplied: !!f("eli_replied"),
      glow: f("glow") || null, // 'planted' | 'warned' | 'placebo' | 'convinced' | 'refused'
      sunBattery: f("sun_battery") || null, // 'neon' | 'covenant' | 'glowkeepers' | 'repaired'
      lockTruth: !!f("lock_truth"),
      keel: f("keel") || null, // keel: 'defects' | 'dead' | 'spared'
      microfilm: f("microfilm") || null, // 'burned' | 'covenant' | 'continuity'
      attributionRead: !!f("attribution_read"),
      attributionBroadcast: !!f("attribution_broadcast"),
      torch: f("torch") || null, // 'reclamation' | 'selective' | 'charter' | 'destroyed'
      keyB: f("keyB") || null, // 'destroyed' | 'kept'
      sunWordDenied: !!f("sun_word_denied"),
      sunWordGlow: !!f("sun_word_glow"),
      knowsArming: !!f("knows_arming"),
      hollowell: f("hollowell") || null, // 'ally' | 'dead' | 'given'
      childrenSent: !!f("children_sent"),
      evacuation: !!(f("evacuation_called") || f("evac_gc")),
      zealotsSpared: !!f("zealots_spared"),
      tinderStopped: !!f("tinder_stopped"),
      faction: L.flag("mq_faction") || "none",
      musters: f("musters") || [],
      zekeFree: !!f("zeke_free"),
      calloway: !!f("calloway_free"),
      crane: f("crane") || null,
      dawnPact: f("dawn_pact") || null,
    };
  };

  // New game: Rose's trust starts at 1.
  L.hook("newGame", function () {
    if (typeof L.flag("ms_rose_trust") !== "number")
      L.setFlag("ms_rose_trust", 1);
  });

  // ------------------------------------------------------------------
  // Test solvers: per quest, per stage, a function that performs the stage's default resolution exactly as the
  // player would (the same functions dialogue responses / spots call: flags, items, setStage). Used by the forced
  // stage walk (G.quests.debug.ms.walk) to prove every main quest can be completed.
  // ------------------------------------------------------------------
  const SOLVERS = {};
  ms.solver = function (questId, stages) {
    SOLVERS[questId] = Object.assign(SOLVERS[questId] || {}, stages);
  };
  /** Walk a quest to completion with its solvers: returns the log of stages and any stall. */
  function walk(id, maxSteps) {
    const log = [];
    if (!Q.get(id)) return { id, ok: false, err: "undefined" };
    if (!Q.isStarted(id)) Q.start(id);
    for (let i = 0; i < (maxSteps || 40); i++) {
      if (Q.isComplete(id)) return { id, ok: true, log };
      const st = Q.stage(id);
      log.push(st);
      const fn = SOLVERS[id] && (SOLVERS[id][st] || SOLVERS[id]["*"]);
      if (!fn) return { id, ok: false, err: "no solver for stage " + st, log };
      try {
        fn(st);
      } catch (e) {
        return {
          id,
          ok: false,
          err: "solver threw at " + st + ": " + e.message,
          log,
        };
      }
      pollProxies();
      if (!Q.isComplete(id) && Q.stage(id) === st)
        return { id, ok: false, err: "stalled at " + st, log };
    }
    return { id, ok: Q.isComplete(id), log };
  }
