// play-inline-594 01 — expect
// Lines 1-843 of readable/play-inline-594.pretty.js (statement-aligned).
/* src/lair/80_test.js */
/* =====================================================================
 * NEW RAD CITY — lair / 80_test.js
 * Forced walk of the finale through EVERY ending variant (?lairtest, run
 * with ?smoke=1). For each variant it resets the finale, sets the story
 * inputs directly (ms_* flags, skill/attribute overrides), enters the Sun
 * Room, plays the conversation by calling the same node/response functions
 * the dialogue engine would, takes the ending's branch (fight + each disarm
 * method for A), checks the result flags, the slides (gating: no slide for a
 * dead person acting), the quest completion and free-roam hand-back.
 * Also: lints the lair's dialogue trees and runs the quest audit over mq36
 * and the lair's doors. Results → console, G.warnings ('[lairtest] …'),
 * window.LAIR_TEST and <pre id="lairtest-out">. Never runs in normal play.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const K = G.lair && G.lair._;
  if (!K) return;
  const ON = /[?&]lairtest\b/.test(location.search);

  const RESULT_FLAGS = [
    "ms_ending",
    "ms_ending_variant",
    "ms_nicole_dead",
    "ms_rose_dead",
    "ms_second_sun",
    "ms_glowkeepers",
    "ms_disarm_method",
    "ms_eli_wounded",
    "ms_fin_violence",
    "ms_rose_mortal",
    "ms_breaker_tripped",
    "ms_battery_pulled",
    "ms_finale_done",
    "ms_city_burned_twice",
    "ms_rose_survived_c",
    "ms_keyway_drilled",
    "ms_eli_joined",
    "ms_fin_started",
    "consequences_applied",
    "ms_array_fired",
    "ending_played",
    "mq06_pending_complete",
  ];
  const INPUT_FLAGS = [
    "ms_rose_trust",
    "ms_rose_with_eli",
    "ms_rose_stays",
    "ms_rose_captive",
    "ms_rose_promise",
    "ms_ring",
    "ms_rose_has_photo",
    "ms_notice",
    "ms_eli_replied",
    "ms_glow",
    "ms_lock_truth",
    "ms_keel",
    "ms_microfilm",
    "ms_attribution_read",
    "ms_torch",
    "ms_keyB",
    "ms_sun_word_denied",
    "ms_hollowell",
    "ms_children_sent",
    "ms_evacuation_called",
    "ms_evac_gc",
    "ms_musters",
    "ms_zeke_free",
    "ms_calloway_free",
    "mq_faction",
    "ms_tinder_dead",
    "dead_ms_tinder",
    "ms_token_ring",
    "ms_token_record",
    "ms_token_booth",
    "ms_token_rose_page",
    "ms_token_pass",
    "ms_token_nell",
    "ms_token_voice",
    "ms_token_poster",
  ];

  function closeSlides() {
    try {
      const H = G.hud && G.hud._;
      if (H && H.END && H.END.on && H.END.cleanup) H.END.cleanup();
    } catch (e) {
      /* */
    }
    if (G.timeScale === 0) G.timeScale = 1;
    if (G.state !== "play") G.setState("play");
  }
  function reset() {
    const Q = G.quests,
      L = Q.lib;
    closeSlides();
    if (G.dialogue && G.dialogue.isActive && G.dialogue.isActive())
      G.dialogue.end(true);
    K.cardsAbort();
    K.clock.hide();
    K.despawnSunCast(false);
    for (const id of [
      "lair_nicole",
      "lair_rose",
      "lair_tinder",
      "lair_hollowell",
    ].concat(K.ZEALOTS)) {
      Q.setFlag("dead_" + id, null);
    }
    for (const f of RESULT_FLAGS.concat(INPUT_FLAGS)) Q.setFlag(f, null);
    L.STATE.delete("mq36");
    K.state.fin = { phase: "pre" };
    K.testSkills = {};
    K.sunDress();
  }
  function setup(flags, skills) {
    const Q = G.quests;
    Q.setFlag("ms_lair_open", true);
    Q.setFlag("ms_track61_open", true);
    if (Q.get("mq35") && !Q.isComplete("mq35")) {
      if (!Q.isStarted("mq35")) Q.start("mq35");
      Q.lib.completeSilently("mq35");
    }
    for (const k in flags) Q.setFlag(k, flags[k]);
    K.testSkills = Object.assign(
      {
        firearms: 30,
        persuasion: 30,
        presence: 5,
        electronics: 20,
        mechanics: 20,
      },
      skills || {},
    );
    if (!Q.isStarted("mq36")) Q.start("mq36");
    const a = K.anchors.m42_arrival;
    G.player.teleport(a.x, 0, a.z, a.yaw);
    K.onEnterSunRoom();
  }
  /** Run one node as the dialogue engine would and choose a response (by text match); pass = result of its check. */
  function say(node, match, pass) {
    const T = K.fin_.DAWN;
    const n = T.nodes[node];
    if (!n) throw new Error("no node " + node);
    if (n.onEnter) n.onEnter(null, {});
    const text = typeof n.text === "function" ? n.text() : n.text;
    if (!text) throw new Error("empty text " + node);
    if (match === undefined) return null;
    const rs = (
      typeof n.responses === "function" ? n.responses() : n.responses
    ).filter((r) => !r.cond || r.cond());
    const r =
      rs.find((x) => {
        const t = typeof x.text === "function" ? x.text() : x.text;
        return typeof match === "number"
          ? false
          : String(t).indexOf(match) >= 0;
      }) || (typeof match === "number" ? rs[match] : null);
    if (!r)
      throw new Error(
        node +
          ': no response matching "' +
          match +
          '" in [' +
          rs
            .map((x) => (typeof x.text === "function" ? x.text() : x.text))
            .join(" | ") +
          "]",
      );
    const ok = r.check ? pass !== false : true;
    if (ok && r.action) r.action(null, {});
    let next = ok ? r.next : r.failNext;
    if (typeof next === "function") next = next();
    return r.end ? null : next || null;
  }
  /** Follow a path of [node, match, pass?] steps, checking each step leads to the next node. */
  function walk(steps) {
    let cur = steps[0][0];
    for (const st of steps) {
      if (st[0] !== cur)
        throw new Error(
          "expected node " + st[0] + " but the conversation is at " + cur,
        );
      cur = say(st[0], st[1], st[2]);
    }
    return cur;
  }

  function run() {
    const res = { ok: true, steps: [], fails: [], variants: {} };
    const Q = G.quests,
      F = () => K.fin();
    const slidesOf = {};
    G.events.on("ending", (slides, id) => {
      slidesOf[id] = slides;
    });
    const expect = (c, m) => {
      if (!c) throw new Error(m);
    };
    const step = (name, fn) => {
      try {
        fn();
        res.steps.push(name);
      } catch (e) {
        res.ok = false;
        res.fails.push(name + ": " + (e && e.message));
      }
    };
    K.testMode = true;
    K.fastCards = true;
    const errs0 = G.errors.length;

    /** Shared tail: checks after an ending fired. */
    function finish(variant, extra) {
      const f = F();
      expect(f.variant === variant, "variant " + f.variant + " != " + variant);
      expect(
        Q.flag("ms_ending_variant") === variant,
        "flag ms_ending_variant " + Q.flag("ms_ending_variant"),
      );
      const sl = slidesOf["lair_" + variant];
      expect(
        sl && sl.length >= 5,
        "slides for " + variant + " missing (" + (sl ? sl.length : 0) + ")",
      );
      for (const s of sl)
        expect(
          typeof s.text === "string" && s.text.length > 0,
          "empty slide " + s.title,
        );
      // gating: a dead person never acts in the slides
      const txt = sl.map((s) => s.text).join(" ");
      if (Q.flag("ms_rose_dead"))
        expect(
          !/Rose (walked|stayed|went west|took the roof|never fired|left by)/.test(
            txt,
          ),
          "dead Rose acts in the slides",
        );
      if (Q.flag("ms_nicole_dead"))
        expect(
          !/She lived three more winters/.test(txt),
          "dead Nicole acts in the slides",
        );
      expect(Q.stage("mq36") === "ending", "stage " + Q.stage("mq36"));
      closeSlides();
      K.settle();
      expect(Q.isComplete("mq36"), "mq36 not complete");
      expect(Q.flag("ms_finale_done") === variant, "finale_done");
      if (extra) extra(sl);
      res.variants[variant] = (res.variants[variant] || []).concat([
        sl.length + " slides",
      ]);
    }
    const baseRecog = () => {
      expect(
        Q.stage("mq36") === "face",
        "stage after recognition " + Q.stage("mq36"),
      );
      expect(F().phase === "hello", "phase " + F().phase);
      expect(K.npcAlive("lair_nicole"), "Nicole not spawned");
    };
    const openingWithRose = [
      ["hello", "You knew."],
      ["rose_knew", "..."],
      ["hello_rose", "Tell me"],
      ["story1", "Go on."],
      ["story2", "Listen"],
    ];
    const openingAlone = [
      ["hello", "Nicky. I came"],
      ["story1", "Go on."],
      ["story2", "Listen"],
    ];

    // ---------------- static: dialogue lint + quest audit ----------------
    step("lint lair dialogues", () => {
      const bad = [];
      for (const [id, tree] of [
        ["lair_dlg_dawn", K.fin_.DAWN],
        ["lair_dlg_rose", K.fin_.ROSE_DLG],
        ["lair_dlg_firing", K.fin_.FIRING],
      ]) {
        const nodes = tree.nodes;
        const s = typeof tree.start === "function" ? tree.start() : tree.start;
        if (!nodes[s]) bad.push(id + " start → " + s);
        for (const nid in nodes) {
          const n = nodes[nid];
          try {
            const t = typeof n.text === "function" ? n.text() : n.text;
            if (!t) bad.push(id + "." + nid + " empty");
          } catch (e) {
            bad.push(id + "." + nid + " text threw " + e.message);
          }
          let rs = [];
          try {
            rs =
              typeof n.responses === "function" ? n.responses() : n.responses;
          } catch (e) {
            bad.push(id + "." + nid + " responses threw " + e.message);
          }
          for (const r of rs || [])
            for (const k of ["next", "failNext"]) {
              let v = r[k];
              if (typeof v === "function") {
                try {
                  v = v();
                } catch (e) {
                  bad.push(id + "." + nid + " next() threw");
                }
              }
              if (typeof v === "string" && !nodes[v])
                bad.push(id + "." + nid + " " + k + " → " + v);
            }
        }
        if (G.dialogue && G.dialogue.get && !G.dialogue.get(id))
          bad.push(id + " not registered with G.dialogue");
      }
      expect(!bad.length, bad.join("; "));
    });
    step("quest audit (mq36 markers, lair doors)", () => {
      const D = Q.debug && Q.debug.audit;
      if (!D) return;
      const a = D({
        filter: /^mq36$/,
        dialogue: /^lair_/,
        npcs: false,
        locks: false,
      });
      const hi = a.issues.filter((i) => i.sev === "high");
      const doorProbs = ((a.doors && a.doors.problems) || []).filter((p) =>
        /M-61|T-61|Bulkhead|M42|Hatch|Ladder|Park Avenue/.test(p),
      );
      res.audit = {
        high: hi.map((i) => i.stage + ": " + i.msg),
        doors: doorProbs,
        dlg: a.dialogue && a.dialogue.problems,
      };
      expect(!hi.length && !doorProbs.length, JSON.stringify(res.audit));
    });
    step("lock ms_track61_hatch registered", () => {
      if (G.locks && !G.isStub("locks") && G.locks.get)
        expect(!!G.locks.get("ms_track61_hatch"), "lock missing");
    });
    step("entrances gated", () => {
      reset();
      Q.setFlag("ms_lair_open", null);
      Q.setFlag("ms_track61_open", null);
      const d = K.doors.lair_waldorf_in;
      expect(
        d && d.locked() === "Welded",
        "Waldorf door not sealed before mq35: " + (d && d.locked()),
      );
      Q.setFlag("ms_track61_open", true);
      expect(
        d.locked() !== "Welded",
        "Waldorf door still sealed after ms_track61_open",
      );
      const m = K.doors.lair_m42_in;
      expect(
        m && m.locked() === "Barred",
        "M42 door not barred before ms_lair_open",
      );
      Q.setFlag("ms_lair_open", true);
      expect(!m.locked(), "M42 door barred after ms_lair_open");
    });

    // ---------------- A1: Eli's shot; disarm by the breaker ----------------
    step("A1 (Eli shoots; breaker)", () => {
      reset();
      setup({
        ms_rose_with_eli: true,
        ms_rose_trust: 3,
        ms_torch: "reclamation",
        ms_keyB: "kept",
      });
      baseRecog();
      walk(
        openingWithRose.concat([
          ["guilt", "Say nothing"],
          ["guilt_lost", "..."],
          ["list", "Say nothing"],
          ["list_lost", "..."],
          ["after_list", "..."],
          ["moment", "Draw and shoot"],
        ]),
      );
      expect(F().ending === "A" && Q.flag("ms_nicole_dead"), "no ending A");
      expect(Q.stage("mq36") === "stop", "stage " + Q.stage("mq36"));
      expect(!K.npcAlive("lair_nicole"), "Nicole alive");
      K.disarm("breaker");
      expect(
        Q.flag("ms_second_sun") === "disarmed" &&
          Q.flag("ms_disarm_method") === "breaker",
        "not disarmed",
      );
      finish("A1", (sl) =>
        expect(
          sl.some((s) => /ROSE/.test(s.title) && /TUDOR CITY/.test(s.text)),
          "A1 high-trust Rose slide",
        ),
      );
    });
    // ---------------- A2: Rose's shot; Rose disarms ----------------
    step("A2 (let Rose fire; Rose turns the wheel)", () => {
      reset();
      setup({
        ms_rose_with_eli: true,
        ms_rose_trust: 3,
        ms_torch: "charter",
        mq_faction: "covenant",
      });
      walk(
        openingWithRose.concat([
          ["guilt", "Say nothing"],
          ["guilt_lost", "..."],
          ["list", "Say nothing"],
          ["list_lost", "..."],
          ["after_list", "..."],
          ["moment", "Let her"],
        ]),
      );
      expect(F().variant === "A2" && !Q.flag("ms_rose_dead"), "not A2");
      K.disarm("rose");
      finish("A2", (sl) =>
        expect(
          sl.some((s) => /mountain Hold/.test(s.text)),
          "Covenant weapon slide",
        ),
      );
    });
    // ---------------- A3: Rose came alone, Eli can't cover her; the battery ----------------
    step("A3 (Rose alone, Firearms < 50; battery pulled)", () => {
      reset();
      setup(
        { ms_rose_stays: true, ms_rose_trust: 1, ms_torch: "destroyed" },
        { firearms: 35 },
      );
      walk(
        openingAlone.concat([
          ["guilt", "Say nothing"],
          ["guilt_lost", "..."],
          ["list", "Say nothing"],
          ["list_lost", "..."],
          ["after_list", "..."],
          ["rose_arrives", "Rose!"],
          ["moment", "Let her"],
        ]),
      );
      expect(
        F().variant === "A3" && Q.flag("ms_rose_dead"),
        "not A3 / Rose alive",
      );
      K.disarm("battery");
      expect(Q.flag("ms_battery_pulled"), "battery");
      finish("A3", (sl) =>
        expect(
          sl.some((s) => /buried beside her mother/.test(s.text)),
          "A3 Rose slide",
        ),
      );
    });
    step("A2 not A3 when Eli covers her (Firearms 50)", () => {
      reset();
      setup({ ms_rose_stays: true, ms_rose_trust: 1 }, { firearms: 55 });
      walk(
        openingAlone.concat([
          ["guilt", "Say nothing"],
          ["guilt_lost", "..."],
          ["list", "Say nothing"],
          ["list_lost", "..."],
          ["after_list", "..."],
          ["rose_arrives", "Rose!"],
          ["moment", "Let her"],
        ]),
      );
      expect(F().variant === "A2", "variant " + F().variant);
      K.disarm("electronics");
      finish("A2");
    });
    for (const [method, flags, skills] of [
      ["zeke", { ms_musters: ["zeke"], ms_zeke_free: true }, {}],
      ["wrongword", { ms_sun_word_denied: true }, {}],
      ["mechanics", {}, { mechanics: 70 }],
    ]) {
      step("A1 + disarm by " + method, () => {
        reset();
        setup(
          Object.assign({ ms_rose_captive: true, ms_rose_trust: 2 }, flags),
          skills,
        );
        walk([
          ["hello", "You knew."],
          ["rose_knew", "..."],
          ["hello_rose", "Tell me"],
          ["story1", "Go on."],
          ["story2", "Listen"],
          ["guilt", "Say nothing"],
          ["guilt_lost", "..."],
          ["list", "Say nothing"],
          ["list_lost", "..."],
          ["after_list", "..."],
          ["moment", "Draw and shoot"],
        ]);
        const opt = K.fin_.FIRING.nodes.set
          .responses()
          .filter((r) => !r.cond || r.cond())
          .map((r) => r.text);
        expect(opt.length >= 2, "firing-set options " + opt.join("|"));
        K.disarm(method);
        expect(Q.flag("ms_disarm_method") === method, "method");
        finish("A1", (sl) =>
          expect(
            !sl.some((s) => /Rose took the roof/.test(s.text)),
            "low-trust A1 should not keep Rose",
          ),
        );
      });
    }
    step("A1 when the player shoots Nicole mid-Reckoning", () => {
      reset();
      setup({ ms_rose_with_eli: true, ms_rose_trust: 3 });
      walk(
        openingWithRose.concat([
          ["guilt", "Say nothing"],
          ["guilt_lost", "..."],
        ]),
      );
      G.events.emit("actorDamaged", K.npc("lair_nicole"), 20, {
        source: "player",
      });
      expect(F().variant === "A1", "variant " + F().variant);
      K.disarm("breaker");
      finish("A1");
    });

    // ---------------- B1: all three won, trust 4 ----------------
    step("B1 (all arguments won, trust 4)", () => {
      reset();
      setup({
        ms_rose_with_eli: true,
        ms_rose_trust: 4,
        ms_lock_truth: true,
        ms_attribution_read: true,
        ms_torch: "reclamation",
        ms_ring: "rose",
        ms_token_ring: true,
        ms_token_record: true,
        ms_children_sent: true,
      });
      walk(
        openingWithRose.concat([
          ["guilt", "padlocked"],
          ["guilt_won", "..."],
          ["list", "Marsh signed"],
          ["list_won", "..."],
          ["after_list", "..."],
          ["moment", "Put it down"],
          ["rose_down", "..."],
          ["rose_answer", "..."],
          ["final", "wall it in"],
          ["b_join", "robe"],
        ]),
      );
      expect(
        F().ending === "B" && Q.flag("ms_second_sun") === "walled",
        "not B",
      );
      expect(K.sun.wall && K.sun.wall.visible, "the concrete is not shown");
      finish("B1", (sl) =>
        expect(
          sl.some(
            (s) =>
              /three names/.test(s.text) ||
              /Rose walked with them/.test(s.text),
          ),
          "B1 Rose slide",
        ),
      );
      expect(K.npcAlive("lair_nicole"), "Nicole should live in B");
    });
    // ---------------- B2: trust 3 ----------------
    step("B2 (trust 3; Keel + burned rolls)", () => {
      reset();
      setup({
        ms_rose_with_eli: true,
        ms_rose_trust: 3,
        ms_keel: "defects",
        ms_microfilm: "burned",
        ms_torch: "charter",
      });
      walk(
        openingWithRose.concat([
          ["guilt", "Keel wrote it down"],
          ["guilt_won", "..."],
          ["list", "burned the rolls"],
          ["list_won", "..."],
          ["after_list", "..."],
          ["moment", "Put it down"],
          ["rose_down", "..."],
          ["rose_answer", "..."],
          ["final", "wall it in"],
          ["b_join", "robe"],
        ]),
      );
      finish("B2", (sl) =>
        expect(
          sl.some((s) => /kept the sign lit/.test(s.text)),
          "B2 Rose slide",
        ),
      );
    });
    // ---------------- B3: Eli shields Nicole; the Register page ----------------
    step("B3 (Eli steps in front; ROSE_PAGE + Presence 7)", () => {
      reset();
      setup(
        {
          ms_rose_stays: true,
          ms_rose_trust: 1,
          ms_glow: "convinced",
          ms_torch: "destroyed",
          ms_token_rose_page: true,
        },
        { presence: 7, persuasion: 90 },
      );
      walk(
        openingAlone.concat([
          ["guilt", "third choice", true],
          ["guilt_won", "..."],
          ["list", "Your own Keeper"],
          ["list_won", "..."],
          ["after_list", "..."],
          ["rose_arrives", "Rose!"],
          ["moment", "Put it down"],
        ]),
      );
      walk([
        ["rose_wont", "Step in front"],
        ["shielded", "Get up"],
        ["rose_arg", "Wren", true],
        ["rose_arg_won", "..."],
        ["final", "wall it in"],
        ["b_join", "robe"],
      ]);
      expect(Q.flag("ms_eli_wounded"), "Eli should be wounded");
      finish("B3", (sl) =>
        expect(
          sl.some((s) => /went west alone/.test(s.text)),
          "B3 Rose slide",
        ),
      );
    });
    step("B locked by Directive 7-A (torch selective)", () => {
      reset();
      setup({
        ms_rose_with_eli: true,
        ms_rose_trust: 4,
        ms_lock_truth: true,
        ms_attribution_read: true,
        ms_torch: "selective",
      });
      // loading 7-A sends Rose off alone (statesIntoFinale): she arrives by the spur
      walk(
        openingAlone.concat([
          ["guilt", "padlocked"],
          ["guilt_won", "..."],
          ["list", "..."],
          ["after_list", "..."],
          ["rose_arrives", "Rose!"],
          ["moment", "Put it down"],
          ["rose_down", "..."],
          ["rose_answer", "..."],
        ]),
      );
      expect(!K.finale.bPossible(), "B should be locked");
      const opts = K.fin_.DAWN.nodes.final
        .responses()
        .filter((r) => !r.cond || r.cond())
        .map((r) => r.text);
      expect(
        !opts.some((t) => /wall it in/.test(t)) &&
          opts.some((t) => /Draw and shoot/.test(t)),
        "final options " + opts.join("|"),
      );
      say("final", "Draw and shoot");
      K.disarm("breaker");
      finish("A1");
    });

    // ---------------- C1: Rose sent north on the handcar ----------------
    step("C1 (turn the keys; Rose on the handcar; two confirmations)", () => {
      reset();
      setup({
        ms_rose_with_eli: true,
        ms_rose_trust: 3,
        ms_keyB: "kept",
        ms_torch: "charter",
        ms_evacuation_called: true,
      });
      walk(
        openingWithRose.concat([
          ["guilt", "Say nothing"],
          ["guilt_lost", "..."],
          ["list", "Say nothing"],
          ["list_lost", "..."],
          ["after_list", "..."],
          ["moment", "Put it down"],
          ["rose_down", "..."],
          ["rose_answer", "..."],
          ["final", "turn them together"],
          ["c_rose", "handcar"],
          ["c_sure1", "Yes"],
          ["c_sure2", "Yes"],
          ["c_turn", "Turn it"],
        ]),
      );
      expect(
        F().ending === "C" &&
          Q.flag("ms_second_sun") === "risen" &&
          !Q.flag("ms_rose_dead"),
        "not C1",
      );
      finish("C1", (sl) => {
        expect(
          sl.some((s) => /Harlem portal/.test(s.text)),
          "C1 Rose slide",
        );
        expect(
          sl.some((s) => /Half of Grand Central/.test(s.text)),
          "evacuation slide",
        );
      });
    });
    // ---------------- C2: she stays; Key B destroyed, Tinder's keyway; 7-A loaded (one confirmation) ----------------
    step(
      "C2 (captive Rose talked down by her promise; she stays; drilled keyway)",
      () => {
        reset();
        setup(
          {
            ms_rose_captive: true,
            ms_rose_trust: 2,
            ms_rose_promise: true,
            ms_keyB: "destroyed",
            ms_torch: "selective",
          },
          { presence: 6 },
        );
        walk([
          ["hello", "You knew."],
          ["rose_knew", "..."],
          ["hello_rose", "Tell me"],
          ["story1", "Go on."],
          ["story2", "Listen"],
          ["guilt", "Say nothing"],
          ["guilt_lost", "..."],
          ["list", "..."],
          ["after_list", "..."],
          ["moment", "Put it down"],
          ["rose_down", "..."],
          ["rose_arg", "Say nothing"],
          ["rose_arg_lost", "..."],
          ["final", "turn them together"],
          ["c_rose", "stays"],
          ["c_turn", "Turn it"],
        ]);
        expect(Q.flag("ms_rose_dead") && Q.flag("ms_keyway_drilled"), "not C2");
        finish("C2", (sl) =>
          expect(
            sl.some((s) => /three people beside it/.test(s.text)),
            "C2 slide",
          ),
        );
      },
    );
    step("C impossible with Key B destroyed and Tinder dead", () => {
      reset();
      setup({
        ms_rose_with_eli: true,
        ms_rose_trust: 3,
        ms_keyB: "destroyed",
        dead_ms_tinder: true,
        ms_tinder_dead: true,
      });
      expect(!K.finale.cPossible(), "C should be impossible");
      reset();
    });

    K.testMode = false;
    K.fastCards = false;
    reset();
    Q.setFlag("ms_lair_open", null);
    Q.setFlag("ms_track61_open", null);
    const newErrs = G.errors.slice(errs0);
    res.newErrors = newErrs.map((e) =>
      String(e.where || e.msg || e).slice(0, 200),
    );
    if (newErrs.length) {
      res.ok = false;
      res.fails.push(
        "errors during the walk: " + res.newErrors.slice(0, 5).join(" || "),
      );
    }
    const summary =
      "[lairtest] " +
      (res.ok ? "PASS" : "FAIL") +
      " " +
      res.steps.length +
      " ok, " +
      res.fails.length +
      " failed" +
      (res.fails.length ? ": " + res.fails.join(" || ") : "");
    console.log(summary);
    if (G.warnings) G.warnings.unshift(summary);
    window.LAIR_TEST = res;
    try {
      const pre = document.createElement("pre");
      pre.id = "lairtest-out";
      pre.style.display = "none";
      pre.textContent = "LAIRTEST" + JSON.stringify(res) + "LAIRTEST";
      document.body.appendChild(pre);
    } catch (e) {
      /* */
    }
    if (!res.ok)
      G.reportError("lair:selftest", new Error(res.fails.join(" || ")));
    return res;
  }
  K.selfTest = run;
  if (ON) {
    let done = false;
    G.events.on("newGame", () => {
      if (done) return;
      done = true;
      const L = K.L();
      if (L) L.later(0.5, run);
      else setTimeout(run, 500);
    });
  }
})();

// ---- ?shot=…&lairshot=<state>: stage the Sun Room cast for a screenshot (dev only) ----
