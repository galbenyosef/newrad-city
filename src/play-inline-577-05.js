// play-inline-577 05 — stage
// Lines 963-1308 of readable/play-inline-577.pretty.js (statement-aligned).
  const A = (QX.miscActions = {
    // ---- franks ----
    franksStart(stage) {
      if (!QX.started("qx_franks"))
        QX.start("qx_franks", { stage: stage || "feud" });
      else if (stage) QX.setStage("qx_franks", stage);
    },
    hireIggy() {
      A.franksStart("sab_mort");
      QX.give("qx_doctored_mustard", 1);
    },
    hireMort() {
      A.franksStart("sab_iggy");
      QX.give("qx_mort_relish", 1);
    },
    sabotage(victim) {
      const item = victim === "mort" ? "qx_doctored_mustard" : "qx_mort_relish";
      if (!QX.take(item, 1)) return;
      QX.standing(-75, "Poisoned a hot-dog vendor's cart");
      QX.setStage("qx_franks", victim === "mort" ? "ret_iggy" : "ret_mort");
      const id = victim === "mort" ? "qx_mort" : "qx_iggy";
      QX.setFlag("franks_" + victim + "_sick");
      QX.later(4, () =>
        QX.say(id, "Oh... oh, that's not right. That's not right at ALL."),
      );
      QX.later(9, () =>
        QX.say(
          id,
          "I gotta... I gotta go lie down. For a week. Maybe forever.",
        ),
      );
      QX.later(14, () => {
        QX.setFlag("franks_" + victim + "_gone");
        QX.removeNPC(id);
        absorbMenu(victim === "mort" ? "iggy" : "mort");
      });
    },
    payout(who) {
      QX.giveScrip(120);
      QX.give("coney_dog", 3);
      QX.setStage("qx_franks", who === "iggy" ? "done_iggy" : "done_mort");
      QX.news(
        "Bad news from Grand Central Market: a hot-dog vendor out front came down with a mysterious case of food poisoning and has closed for good. " +
          'His rival says it was "a tragedy" and is now offering two-for-one.',
      );
    },
    mergeHalf(first) {
      A.franksStart(first === "iggy" ? "merge_mort" : "merge_iggy");
      QX.setFlag("franks_open_" + first);
    },
    merge() {
      QX.setStage("qx_franks", "done_merge");
      QX.standing(50, "Brokered peace between hot-dog vendors");
      QX.giveScrip(100);
      QX.give("qx_franks_recipe", 1);
      QX.give("coney_dog", 2);
      QX.give("egg_cream", 1);
      setFrankBarks();
      absorbMenu("iggy");
      absorbMenu("mort");
      for (const it of ["qx_doctored_mustard", "qx_mort_relish"])
        QX.take(it, QX.count(it));
      QX.news(
        "Peace in our time, folks: the hot-dog carts outside Grand Central have MERGED. Iggy and Mort's. The onion sauce contains cinnamon " +
          "on Mondays, Wednesdays and Fridays. Negotiations about Sundays continue.",
      );
    },
    // ---- extra ----
    extraStart() {
      if (!QX.started("qx_extra")) {
        QX.start("qx_extra", { stage: "deliver" });
        QX.give("qx_gazette", 3);
      }
    },
    deliver(k, tip) {
      if (QX.flag("gaz_" + k) || !QX.take("qx_gazette", 1)) return;
      QX.setFlag("gaz_" + k);
      QX.inc("gaz_dues", 10);
      QX.giveScrip(10 + (tip || 0));
      if (QX.misc.delivered() >= 3) QX.setStage("qx_extra", "return");
      else QX.refresh("qx_extra");
    },
    extraFinish(kept) {
      if (QX.stage("qx_extra") !== "return") return;
      if (kept) {
        QX.setFlag("extra_kept");
        QX.standing(-25, "Pocketed a newsboy's dues");
        QX.giveScrip(15);
      } else {
        QX.giveScrip(-Math.min(30, QX.scrip()));
        QX.giveScrip(45);
        QX.give("newsboy_cap", 1);
        QX.standing(15, "Honest delivery");
      }
      QX.setStage("qx_extra", "done");
      QX.scoopBarks();
    },
    // ---- commute ----
    pennStart(stage) {
      if (!QX.started("qx_commute"))
        QX.start("qx_commute", { stage: stage || "talk" });
      else if (stage) QX.setStage("qx_commute", stage);
      if (stage === "find") spawnTimetable();
    },
    pennHome(viaProof) {
      if (viaProof) QX.take("qx_m42_timetable", 1);
      QX.standing(viaProof ? 50 : 35, "Gave a lost commuter closure");
      QX.give("qx_pocket_watch", 1);
      QX.setFlag("penn_moved");
      A.pennStart("done_home");
      QX.xp(viaProof ? 50 : 25, "Last Stop");
      // he walks off; once the player isn't looking (far away) he is at Grand Central
      QX.later(6, relocatePenn);
    },
    pennWait() {
      QX.standing(-25, "Lied to a lost commuter");
      A.pennStart("done_wait");
    },
    // ---- parking ----
    muniStart() {
      if (!QX.started("qx_parking")) {
        QX.start("qx_parking", { stage: "fine" });
        QX.give("qx_citation", 1);
      }
    },
    muniEnd(stage) {
      A.muniStart();
      QX.setStage("qx_parking", stage);
      const a = QX.npc("qx_muni7");
      if (stage === "done_good") {
        QX.standing(50, "Reformed a ticket robot");
        QX.give("qx_impound_key", 1);
        if (a) {
          a.faction = "settlers";
          a.barks = [
            "CITIZEN. YOU ARE PROTECTED.",
            "HAVE A SAFE DAY.",
            "NO ONE WILL BE FINED TODAY.",
          ];
          if (a.inventory)
            a.inventory = a.inventory.filter((e) => e[0] !== "qx_impound_key");
        }
      }
      if (stage === "done_evil") {
        QX.standing(-75, "Turned a ticket robot into a racket");
        QX.give("qx_impound_key", 1);
        if (a) {
          a.barks = [
            "FINE ISSUED. FINE ISSUED. FINE ISSUED.",
            "ALL COLLECTIONS FORWARDED TO THE BENEFICIARY.",
            "PAY THE BENEFICIARY.",
          ];
          if (a.inventory)
            a.inventory = a.inventory.filter((e) => e[0] !== "qx_impound_key");
        }
        QX.setFlag("muni_day", G.time.day | 0);
      }
    },
    muniFight() {
      A.muniStart();
      QX.setStage("qx_parking", "scrap");
      const a = QX.npc("qx_muni7");
      if (a) {
        a[KILL_STANDING] = 0;
        if (a.setHostile) QX.safe("hostile", () => a.setHostile(true));
      }
      extraRouteCheck();
    },
    // ---- buttons ----
    buttonsStart(stage) {
      if (!QX.started("qx_buttons"))
        QX.start("qx_buttons", { stage: stage || "find" });
      else if (stage) QX.setStage("qx_buttons", stage);
    },
    buttonsFollow() {
      A.buttonsStart("escort");
      QX.setFlag("buttons_follow");
      const b = QX.npc("qx_buttons");
      if (b && b.follow) QX.safe("follow", () => b.follow("player"));
    },
    buttonsHome() {
      QX.setFlag("buttons_home");
      QX.setFlag("buttons_follow", false);
      const b = QX.npc("qx_buttons");
      if (b) {
        if (b.follow) QX.safe("unfollow", () => b.follow(null));
        b.home = { x: SPOT.edna.x + 1.5, z: SPOT.edna.z + 1, r: 3 };
      }
      A.buttonsStart("return");
    },
    buttonsReward(refuse) {
      if (refuse) {
        QX.standing(40, "Returned a lost pet for nothing");
        QX.give("qx_edna_cookies", 5);
      } else {
        QX.giveScrip(60);
        QX.give("qx_edna_cookies", 3);
        QX.standing(15, "Returned a lost pet");
      }
      A.buttonsStart("done");
      const e = QX.npc("qx_edna");
      if (e)
        e.barks = ["Who's a good boy? Buttons is a good boy.", "Cookie, dear?"];
    },
    buttonsSell(buyer) {
      QX.setFlag("buttons_sold");
      QX.setFlag("buttons_follow", false);
      QX.standing(-100, "Sold a pet burrow rat for meat");
      QX.giveScrip(60);
      QX.removeNPC("qx_buttons");
      A.buttonsStart("sold");
      QX.say(
        buyer,
        "Pleasure doing business. Don't ask what's in tomorrow's special.",
      );
    },
    // ---- bixby ----
    bixStart() {
      if (!QX.started("qx_bixby")) {
        QX.start("qx_bixby", { stage: "pages" });
        spawnPages();
        if (QX.misc.pagesHave() >= 3) QX.setStage("qx_bixby", "return");
      }
    },
    bixHandIn(costar) {
      for (let i = 1; i <= 3; i++) {
        if (QX.take("qx_script_page_" + i, 1)) QX.setFlag("bix_page_" + i);
      }
      if (costar) QX.setFlag("bix_costar");
      QX.setStage("qx_bixby", "show");
      performance(costar);
    },
    bixTear() {
      for (let i = 1; i <= 3; i++) QX.take("qx_script_page_" + i, 1);
      QX.fail("qx_bixby");
      QX.say("qx_bixby", "No... NO! Twenty-two years I carried that script!");
    },
  });

  // MUNI-7: shooting it turns the citation into a fight; destroying it closes the case.
  G.events.on("actorDamaged", (a, amt, info) => {
    if (!a || a.id !== "qx_muni7" || !info || info.source !== "player") return;
    if (!QX.done("qx_parking") && QX.stage("qx_parking") !== "scrap")
      A.muniFight();
  });
  G.events.on("actorKilled", (a) => {
    if (!a || a.id !== "qx_muni7") return;
    if (!QX.started("qx_parking")) A.muniStart();
    if (!QX.done("qx_parking")) QX.setStage("qx_parking", "done_scrap");
    extraRouteCheck();
  });
  // a cancelled subscriber may have been the last stop on Scoop's route
  function extraRouteCheck() {
    if (
      QX.stage("qx_extra") === "deliver" &&
      QX.active("qx_extra") &&
      QX.misc.delivered() >= 3
    )
      QX.setStage("qx_extra", "return");
  }

  function relocatePenn() {
    // Walk off-screen: teleport when the player is far enough or not looking; retry until done.
    const a = QX.npc("qx_pennington");
    if (!a || a.dead) return;
    if (QX.dist(a.pos.x, a.pos.z) < 35 && QX.dist(GC_PENN.x, GC_PENN.z) > 35) {
      QX.later(4, relocatePenn);
      if (a.moveTo)
        QX.safe("walk", () => a.moveTo(SPOT.busStop.x, SPOT.busStop.z - 25));
      return;
    }
    const p = QX.anchor("grand_central", ["lobby_bench"], GC_PENN);
    QX.moveNPC("qx_pennington", p);
    a.barks = [
      "Lovely ceiling. Lovely.",
      "I used to catch the 9:47. Now I catch my breath.",
      "No bus. No boss. No rush.",
    ];
    a.yaw = QX.yawTo(p.x, p.z, 240, -226);
  }
  QX.hook("loaded", function () {
    if (QX.flag("penn_moved")) QX.later(1, relocatePenn);
  });

  /** Bixby's street performance: a short scripted scene of barks (game time). */
  function performance(costar) {
    const lines = costar
      ? [
          [
            "qx_bixby",
            "Ladies, gentlemen, showfolk and assorted riff-raff — HAMLET OF HOBOKEN!",
          ],
          [
            "qx_bixby",
            "Who's there? Nay, answer me! ...That's your cue, Horatio.",
          ],
          [
            "you",
            "You deliver Horatio's line. Two retired chorus girls in the audience gasp.",
          ],
          ["qx_bixby", "To glow, or not to glow — that is the question!"],
          ["you", "You hold up a skull on cue. It is still wearing a hat."],
          [
            "qx_bixby",
            "Alas, poor Yorick! I knew him, Horatio. He owed me eleven Scrip.",
          ],
          [
            "qx_bixby",
            "The rest... is... STATIC. [He dies magnificently. It takes a while.]",
          ],
          [
            "qx_bixby",
            "Thank you! Thank you! You've been a wonderful audience of three!",
          ],
        ]
      : [
          [
            "qx_bixby",
            "Ladies, gentlemen, showfolk and assorted riff-raff — HAMLET OF HOBOKEN!",
          ],
          [
            "qx_bixby",
            "O, that this too too solid flesh would melt... in this humidity, it might. Moving on.",
          ],
          ["qx_bixby", "To glow, or not to glow — that is the question!"],
          [
            "qx_bixby",
            "Alas, poor Yorick! I knew him, Horatio. He owed me eleven Scrip.",
          ],
          [
            "qx_bixby",
            "The rest... is... STATIC. [He dies magnificently. It takes a while.]",
          ],
          ["qx_bixby", "Thank you! You've been a wonderful audience of one!"],
        ];
    let t = 1;
    for (const [who, text] of lines) {
      QX.later(t, () => {
        if (who === "you") QX.notify(text);
        else QX.say(who, text, 5);
      });
      t += 5.2;
    }
    QX.later(t, () => finishShow(costar));
  }
  /** Curtain: the reward (also called directly by the self-test). */
