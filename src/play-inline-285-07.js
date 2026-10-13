// play-inline-285 07 — def
// Lines 1433-1721 of readable/play-inline-285.pretty.js (statement-aligned).
  function stockFor(m) {
    const out = [];
    const ok = (id) => {
      try {
        return !G.isStub("items") && !!G.items.get(id);
      } catch (e) {
        return false;
      }
    };
    if (m.table) {
      try {
        const r = G.items.rollLoot(m.table, 8);
        if (Array.isArray(r))
          for (const e of r) if (ok(e[0])) out.push([e[0], e[1]]);
      } catch (e) {
        /* */
      }
    }
    for (const e of m.extra || []) if (ok(e[0])) out.push([e[0], e[1]]);
    return out;
  }
  function spawnNPC(def) {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return null;
    const ex = actor(def.id);
    if (ex && !ex.removed) return ex;
    const a = A(def.poi, def.at);
    if (!a) return null;
    const sd = {
      id: def.id,
      type: def.type,
      name: def.name,
      faction: def.faction || "settlers",
      level: def.level || 5,
      pos: { x: a.x, y: a.y, z: a.z },
      yaw: a.yaw || 0,
      ai: def.ai || "guard",
      home: { x: a.x, z: a.z, r: def.ai === "guard" ? 1.5 : 1.0 },
      dialogue: def.dialogue,
      essential: true,
      hostile: false,
      noRespawn: true,
      holdPos: def.ai !== "wander",
    };
    if (def.outfit) sd.outfit = def.outfit;
    if (def.gender) sd.gender = def.gender;
    if (def.barks) sd.barks = def.barks;
    if (def.voice) sd.voice = def.voice;
    if (def.weapon) {
      try {
        if (!G.isStub("items") && G.items.get(def.weapon))
          sd.weapon = def.weapon;
      } catch (e) {
        /* */
      }
    } else sd.weapon = "none";
    if (def.merchant)
      sd.merchant = {
        scrip: def.merchant.scrip,
        stock: stockFor(def.merchant),
        restock: 3,
      };
    return P.safe("spawn:" + def.id, () => G.actors.spawn(sd));
  }
  function spawnAll() {
    for (const d of NPCS) spawnNPC(d);
  }

  // ==================================================================
  // SET PIECES
  // ==================================================================
  // ---------- Ed Sullivan: power + go to air ----------
  function releaseSafe() {
    for (const S of P.sites)
      for (const c of S.containers)
        if (c.name === "Producer's Safe" && c.handle) {
          try {
            c.handle.locked = 0;
          } catch (e) {
            /* */
          }
        }
  }
  C.restorePower = function () {
    if (F.power) return;
    F.power = true;
    G.sfx.play("hum_electric", { volume: 0.8 });
    const a = A("ed_sullivan", "loot2");
    if (a)
      try {
        G.fx.flash(a.clone().setY(a.y + 1.5), 0x80b8ff, 3, 0.6);
      } catch (e) {
        /* */
      }
    G.notify("Deep in the building, a transformer hums awake.");
    xp(40, "Restored Studio 50 power");
    qStart("pt_deadair", "prep");
    checkDeadAir();
  };
  C.goToAir = function () {
    if (F.broadcast) return;
    F.broadcast = true;
    take("pt_es_master_reel");
    if (P.esOnAir) P.esOnAir.visible = true;
    G.sfx.play("terminal_success");
    G.notify("STUDIO 50 IS ON THE AIR.");
    news(
      "Strange one tonight, folks. Somebody up on Eighth Avenue got old Studio 50 humming — and what's coming out of it is a Civil Defense variety hour from the day the bombs fell. The host is still smiling. Tune your sets. Or maybe don't.",
    );
    if (!qActive("pt_deadair") && !qDone("pt_deadair"))
      qStart("pt_deadair", "broadcast");
    if (qActive("pt_deadair")) {
      qSet("pt_deadair", "broadcast");
      qComplete("pt_deadair");
    }
  };
  function checkDeadAir() {
    if (!qActive("pt_deadair") || qStage("pt_deadair") !== "prep") return;
    if (F.power && has("pt_es_master_reel")) qSet("pt_deadair", "broadcast");
  }

  // ---------- Port Authority: locker 417 ----------
  C.openLocker = function () {
    if (F.locker) {
      G.notify(
        "Locker 417 is empty now. Somebody finally came for the luggage.",
      );
      return;
    }
    F.locker = true;
    G.sfx.play("container_open");
    give("pt_commuter_fedora", 1);
    give("scrip", 175);
    give("pt_reel_pa_final_bus", 1);
    give("fizzo_blue", 1);
    give("shade_field", 1);
    G.notify(
      "Inside: a hard-shell suitcase, a hat, a tape reel, and money sewn into the lining.",
    );
    if (!qActive("pt_locker417") && !qDone("pt_locker417"))
      qStart("pt_locker417", "open");
    qComplete("pt_locker417");
  };

  // ---------- Lyceum: the performance ----------
  const SHOW = [
    [
      "pt_barnaby",
      'This play is called "Our Glowing Town". It takes place in Grover\'s Crater, New Hampshire — just after the end of the world.',
      7,
    ],
    [
      "pt_barnaby",
      "The sun comes up over the crater about quarter to six. Well — something comes up. We call it the sun. It's polite to.",
      7,
    ],
    ["pt_player2", "Emily! Take your Prussian Blue. You're growing.", 5],
    ["pt_vivienne", "Mama, am I pretty? Tell me the truth, Mama.", 5],
    [
      "pt_player2",
      "You're pretty enough for all normal purposes. And some abnormal ones.",
      6,
    ],
    [
      "pt_barnaby",
      "Act Two. Love and marriage. The wedding was lovely. Only four of the guests were Maniacs, and two of them were family.",
      8,
    ],
    [
      "pt_player1",
      "Emily Webb... will you... I got us a two-headed pack oxen. One head each.",
      6,
    ],
    ["pt_vivienne", "Oh, George. Yes. Both heads. Yes.", 5],
    [
      "pt_barnaby",
      "Act Three. Nine years go by. Then two hundred. In our town, the dead sit in the hill and wait. They get very good at waiting.",
      8,
    ],
    [
      "pt_vivienne",
      "Look at it — the whole town, glowing. The kitchen. Papa's hat. Nobody ever looks. Nobody ever LOOKS.",
      8,
    ],
    [
      "pt_vivienne",
      "Every minute of it was the most beautiful thing, and we were all too busy to notice. Goodbye, town. Goodbye, glow.",
      8,
    ],
    [
      "pt_barnaby",
      "Folks don't notice their lives while they're living them. It takes twenty-two years of spare time. We have had the practice.",
      9,
    ],
    [
      "pt_barnaby",
      "That's the end of the play. You can go home now. Mind the raiders on Eighth Avenue. Good night.",
      7,
    ],
  ];
  let show = null;
  P.showRunning = () => !!show; // 85_lighting: the house lights dim while the play runs
  C.setupShow = function () {
    // the company takes places on the stage
    const places = [
      ["pt_barnaby", "stage_c"],
      ["pt_vivienne", "stage_l"],
      ["pt_player1", "stage_r"],
      ["pt_player2", "npc4"],
    ];
    for (const [id, an] of places) {
      const a = actor(id),
        p = A("lyceum_theatre", an);
      if (a && p) {
        a.pos.set(p.x, p.y + 0.05, p.z);
        if (a.char && a.char.root) a.char.root.position.copy(a.pos);
        a.home = { x: p.x, z: p.z, r: 0.6 };
        a.yaw = p.yaw;
      }
    }
  };
  C.startShow = function () {
    if (show) return;
    const seat = A("lyceum_theatre", "seat");
    if (!seat) return;
    C.setupShow();
    show = { t: 0, i: -1, next: 1.5 };
    G.player.teleport(seat.x, seat.y + 0.05, seat.z, 0);
    G.player.frozen = true;
    G.notify(
      "The house lights dim. Somebody in the balcony coughs. The ghost light is carried off.",
    );
    try {
      if (!G.isStub("music")) G.music.setMood("settlement");
    } catch (e) {
      /* */
    }
  };
  function tickShow(dt, realDt) {
    if (!show) return;
    if (G.state !== "play") return;
    show.t += realDt;
    show.next -= realDt;
    if (G.player) {
      G.player.yaw = 0;
      G.player.frozen = true;
    }
    if (show.next > 0) return;
    show.i++;
    if (show.i >= SHOW.length) {
      endShow();
      return;
    }
    const [who, line, dur] = SHOW[show.i];
    const a = actor(who);
    if (a && a.say) a.say(line, dur);
    else G.notify((a && a.name ? a.name : "Actor") + ": " + line);
    show.next = dur;
  }
  function endShow() {
    show = null;
    G.player.frozen = false;
    F.showsSeen++;
    G.notify(
      "The curtain falls. The Lyceum Players take their bows to a house of one — and one is plenty.",
    );
    if (qActive("pt_show")) {
      F.showDone = true;
      if (F.bonusCaps) give("scrip", 100);
      qComplete("pt_show");
      news(
        "Theatre news from the Theater District, would you believe: the Lyceum Players — same company, twenty-two years older — finally opened their play twenty-two years after opening night. Word is the reviews are glowing, and the critic survived.",
      );
    }
    const places = [
      ["pt_barnaby", "director"],
      ["pt_vivienne", "npc1"],
      ["pt_player1", "npc2"],
      ["pt_player2", "npc3"],
    ];
    for (const [id, an] of places) {
      const a = actor(id),
        p = A("lyceum_theatre", an);
      if (a && p) a.home = { x: p.x, z: p.z, r: 1.5 };
    }
  }

  // ------------------------------------------------------------------
  // interactables (seat, locker 417, stage manager's log, ghost light)
  // ------------------------------------------------------------------
