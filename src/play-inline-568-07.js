// play-inline-568 07 — responses
// Lines 1857-2170 of readable/play-inline-568.pretty.js (statement-aligned).
  function mq24Poll() {
    if (!Q.isActive("mq24")) return;
    // no Hale, no Rotorcraft: Ossie's ferry, then
    if (
      Q.stage("mq24") === "rotorcraft" &&
      (L.flag("hale_dead") || L.flag("con_hostile"))
    ) {
      L.notify(
        "With Lieutenant Hale gone, the Rotorcraft isn't going anywhere. Ossie's ferry, then.",
      );
      Q.setStage("mq24", "shells");
      return;
    }
    // reached Liberty some other way (the Harbor Skiff, swimming): that is the crossing
    if (ms.f("mq24_departed")) return;
    const c = G.LAYOUT && G.LAYOUT.LIBERTY,
      p = G.player && G.player.pos;
    if (
      c &&
      p &&
      Math.hypot(p.x - c.x, p.z - c.z) < (c.r || 60) + 28 &&
      p.x < (G.LAYOUT.INTERIOR_X_MIN || 2500)
    ) {
      if (!ms.f("rose_on_liberty") && !ms.f("rose_overwatch")) {
        if (rose.mode() === "follow" && ms.trust() >= 2) roseComes();
        else roseStays();
      }
      const how = howForPath();
      const lib = ms.liberty;
      if (lib && typeof lib.arrive === "function") {
        try {
          lib.arrive(how);
          return;
        } catch (e) {
          G.reportError("quests:ms:mq24:arrive", e);
        }
      }
      Q.complete("mq24");
    }
  }

  // ==================================================================
  // Injections into existing trees (narrow conditions)
  // ==================================================================
  // ---- Lieutenant Hale: the Sky-Eye room, the skiff report, the archive core ----
  ms.inject("dlg_con_hale", {
    nodes: {
      ms19_skyeye: {
        text: () =>
          faction() === "continuity" ||
          L.flag("hale_knows") ||
          L.flag("hale_defects")
            ? "The Sky-Eye room? [She glances up at the tower.] The drones fly the harbour all night and nobody watches the monitors after midnight. Somebody should. I'll sign you in. Don't touch the anthem switch; there isn't one, and that's the problem."
            : "The monitor room is for cleared personnel, citizen. [She studies you.] Why would a civilian want to watch the harbour at night?",
        onEnter() {
          if (
            faction() === "continuity" ||
            L.flag("hale_knows") ||
            L.flag("hale_defects")
          )
            ms.set("skyeye_room_ok");
          refresh("mq19");
        },
        responses: [
          {
            text: "Because something is moving on Liberty that your Colonel doesn't know about.",
            cond: () => !ms.f("skyeye_room_ok"),
            check: { skill: "persuasion", value: 45 },
            next: "ms19_skyeye_ok",
            failNext: "ms19_skyeye_no",
          },
          {
            text: "Thank you, Lieutenant.",
            cond: () => !!ms.f("skyeye_room_ok"),
          },
          { text: "Never mind.", cond: () => !ms.f("skyeye_room_ok") },
        ],
      },
      ms19_skyeye_ok: {
        text: "[A long look.] If it's moving on Liberty, the Colonel should know about it. Fine. One night. I'll sign the log myself, in triplicate, God help me.",
        onEnter() {
          ms.set("skyeye_room_ok");
          refresh("mq19");
        },
        responses: [{ text: "Thank you." }],
      },
      ms19_skyeye_no: {
        text: "Then the Colonel will hear about it through channels. Good day, citizen. [There are other lenses in this city. The Chrysler crown, for one.]",
        responses: [{ text: "[Leave.]" }],
      },
      ms19_report: {
        text: "[You tell her: two in the morning, a candle-lantern skiff, a private on the pier with a brass sun at his collar.] [Her jaw sets.] Teague. I signed his leave chits. [She is quiet for a moment.] I'll pass it to the Colonel's adjutant. He will be arrested before breakfast. That is what we do.",
        onEnter() {
          teagueReported("hale");
        },
        responses: [{ text: "[Leave.]" }],
      },
      ms22_core: {
        text: "[She reads the carbon in the core's sleeve once, standing very still.] \"Move the rolls and enrolled staff to Liberty tonight. No public notice.\" Fourth of March. [She hands the carbon back and keeps the core.] My mother was on the platform at Track 61 that Sunday. She wasn't on any roll. Somebody decided that the day before. [Quietly.] I am going to find out who.",
        onEnter() {
          coreTo("hale");
        },
        responses: [{ text: "[Leave.]" }],
      },
    },
    add: [
      {
        node: "again",
        responses: [
          {
            text: "I need a long lens on Liberty tonight. The Sky-Eye room.",
            next: "ms19_skyeye",
            cond: () => at("mq19", "lens") && !ms.f("skyeye_room_ok"),
          },
          {
            text: "A skiff met one of your soldiers on the Liberty pier at two in the morning.",
            next: "ms19_report",
            cond: () => at("mq19", "report"),
          },
          {
            text: "[Give her the archive core.] Read what your government knew.",
            next: "ms22_core",
            cond: () => at("mq22", "fate") && L.has("pf3_cog_core"),
          },
        ],
      },
    ],
  });
  // ---- Lancer-Commander Stroud: the skiff report (Covenant) ----
  ms.inject("dlg_cov_stroud", {
    nodes: {
      ms19_report: {
        text: "[You tell him about the skiff.] A Continuity soldier selling to the sun cult on Liberty's own pier. [He turns a brass pin over in his gauntlet.] Then Crane will hear about it from us, through the usual channels. Nothing weakens a garrison like a hanging. Good work, sleeper.",
        onEnter() {
          teagueReported("stroud");
        },
        responses: [{ text: "Hold fast." }],
      },
    },
    add: [
      {
        node: "again",
        responses: [
          {
            text: "We watched Liberty after midnight. A Glowkeeper skiff met a Continuity private on the pier.",
            next: "ms19_report",
            cond: () => at("mq19", "report"),
          },
        ],
      },
    ],
  });
  // ---- Rocky Delgado: the skiff on the air (mq19), the archive core broadcast (mq22) ----
  ms.inject("dlg_rc_rocky", {
    nodes: {
      ms19_report: {
        text: "A Continuity private, two in the morning, a skiff full of candles? [He is already reaching for the microphone.] Pal, the Continuity listens to this station more than they listen to their own. You put it on my air, they'll have that boy in irons by lunch. You sure?",
        responses: [
          { text: "Put it on the air.", action: () => teagueReported("rocky") },
          { text: "Not yet." },
        ],
      },
      ms22_rocky: {
        text: "[Rocky reads the carbon in the core's sleeve, then reads it again with his lips moving.] \"Move the rolls and enrolled staff to Liberty tonight. No public notice.\" The fourth of March. The DAY BEFORE. [He puts it down very carefully, like it might go off.] Leave it with me, pal. I'm going to read this on the air every hour until my tubes melt.",
        onEnter() {
          coreTo("rocky");
        },
        responses: [{ text: "Read it loud, Rocky." }],
      },
    },
    add: [
      {
        node: "again",
        responses: [
          {
            text: "I have a story for you. A skiff, two in the morning, Liberty's pier.",
            next: "ms19_report",
            cond: () => at("mq19", "report"),
          },
          {
            text: "[Give him the archive core.] Put this on the air.",
            next: "ms22_rocky",
            cond: () => at("mq22", "fate") && L.has("pf3_cog_core"),
          },
        ],
      },
    ],
  });
  // ---- Deadeye Dolores: her view (mq19, lone path) ----
  ms.inject("dlg_chr_dolores", {
    nodes: {
      ms19_view: {
        text: "Liberty? [She grins without taking her eye off 42nd Street.] Two in the morning's when the boats move. Smugglers, Continuity relief, the odd fella in a bathrobe with a lantern. Bring a coat, Frosty. It's cold up here, and the gargoyle doesn't share.",
        responses: [{ text: "Thanks, Dolores." }],
      },
    },
    add: [
      {
        node: "again",
        responses: [
          {
            text: "I need your view of Liberty Island tonight.",
            next: "ms19_view",
            cond: () =>
              Q.isActive("mq19") &&
              (Q.stage("mq19") === "lens" || Q.stage("mq19") === "watch"),
          },
        ],
      },
      {
        node: "guard",
        responses: [
          {
            text: "Mind if I borrow your old nest tonight? I need a look at Liberty.",
            next: "ms19_view",
            cond: () =>
              Q.isActive("mq19") &&
              (Q.stage("mq19") === "lens" || Q.stage("mq19") === "watch"),
          },
        ],
      },
    ],
  });
  // ---- Moe: the hooded man in the gallery (mq23) ----
  ms.inject("dlg_gc_moe", {
    nodes: {
      ms23_gallery: {
        text: "Funny you ask. Tall fella in a hood's been standing in the far corner of the Whispering Gallery every night this week, face to the wall like a kid in detention. Doesn't drink. Doesn't buy. Just listens. [He polishes a glass that is already clean.] Asked for you by name, Popsicle. Your first name.",
        responses: [{ text: "Thanks, Moe." }],
      },
    },
    add: [
      {
        node: "bar",
        responses: [
          {
            text: "Anyone been hanging around the Whispering Gallery?",
            next: "ms23_gallery",
            cond: () => at("mq23", "gallery"),
          },
        ],
      },
    ],
  });

  // ==================================================================
  // Rose (dlg_ms_rose): Act III beats
  // ==================================================================
  const RD = ms.dlg("dlg_ms_rose");
  RD.when(() =>
    Q.isActive("mq04") &&
    L.flag("ms_rose_revealed") &&
    !L.flag("ms_mq04_rose_asked")
      ? "mq04_side"
      : null,
  )
    .when(() =>
      Q.isStarted("mq04") &&
      faction() === "continuity" &&
      !ms.f("mq04_con_seen")
        ? "mq04_con"
        : null,
    )
    .when(() =>
      ms.f("mq19_rose_taper_pending") && Q.isStarted("mq19")
        ? "mq19_taper"
        : null,
    )
    .when(() =>
      at("mq19", "report") && !ms.f("mq19_rose_talked") ? "mq19_report" : null,
    )
    .when(() => (at("mq20", "rose") ? "mq20_list" : null))
    .when(() => (at("mq21", "keel") ? "mq21_keel" : null))
    .when(() =>
      ms.f("memo_read") && !ms.f("mq22_rose_line") && Q.isStarted("mq22")
        ? "mq22_memo"
        : null,
    )
    .when(() => (at("mq23", "rose") ? "mq23_after" : null))
    .when(() =>
      Q.isActive("mq24") &&
      !ms.f("rose_on_liberty") &&
      !ms.f("rose_overwatch") &&
      !ms.f("mq24_rose_hello")
        ? "mq24_hello"
        : null,
    );
  // standing options on her idle node while a beat is open
  if (RD.nodes.idle && Array.isArray(RD.nodes.idle.responses)) {
    const r = RD.nodes.idle.responses;
    const i = Math.max(0, r.length - 1);
    r.splice(
      i,
      0,
      {
        text: "Who would you trust to take us across?",
        next: "mq04_side",
        cond: () => Q.isActive("mq04"),
      },
      {
        text: "About the skiff on Liberty's pier...",
        next: "mq19_report",
        cond: () => at("mq19", "report"),
      },
      {
        text: "Before we cross...",
        next: "mq24_hello",
        cond: () =>
          Q.isActive("mq24") &&
          !ms.f("rose_on_liberty") &&
          !ms.f("rose_overwatch"),
      },
    );
  }
