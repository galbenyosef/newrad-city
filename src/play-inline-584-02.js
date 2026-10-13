// play-inline-584 02 — expect
// Lines 280-761 of readable/play-inline-584.pretty.js (statement-aligned).
  function run() {
    const res = { ok: true, steps: [], fails: [] };
    let phys = null;
    try {
      phys = physicalAudit();
    } catch (e) {
      phys = { issues: ["audit threw " + (e && e.message)], notes: [] };
    }
    res.physical = phys;
    // where every named NPC of ours actually stands (after freeSpot / anchors) — for screenshots & layout QA
    res.npcPos = {};
    for (const id of QX.roster) {
      const a = QX.npc(id);
      if (a && a.pos)
        res.npcPos[id] = [
          +a.pos.x.toFixed(1),
          +a.pos.y.toFixed(1),
          +a.pos.z.toFixed(1),
          +(a.yaw || 0).toFixed(2),
        ];
    }
    if (phys.issues.length) {
      res.ok = false;
      res.fails.push(
        "physical audit: " +
          phys.issues.length +
          " issue(s): " +
          phys.issues.slice(0, 8).join(" | "),
      );
    }
    const step = (name, fn) => {
      try {
        const v = fn();
        if (v === false) throw new Error("returned false");
        res.steps.push("ok " + name);
      } catch (e) {
        res.ok = false;
        res.fails.push(name + ": " + (e && e.message));
      }
    };
    const expect = (cond, msg) => {
      if (!cond) throw new Error(msg);
    };
    const scrip = (n) => QX.giveScrip(n);

    step("dialogue lint", () => {
      const b = lintDialogues();
      expect(!b.length, b.slice(0, 6).join(" | "));
    });
    step("quests defined", () => {
      for (const id of [
        "qx_guide",
        "qx_franks",
        "qx_extra",
        "qx_commute",
        "qx_parking",
        "qx_buttons",
        "qx_bixby",
        "qx_c4",
        "qx_numbers",
        "qx_bell",
        "qx_prophecy",
        "qx_lasthand",
        "qx_chalk",
        "qx_lancer",
      ])
        expect(G.quests.get ? G.quests.get(id) : true, "missing " + id);
    });
    step("npcs spawned", () => {
      for (const id of [
        "qx_sparks",
        "qx_harlan",
        "qx_brandt",
        "qx_zora",
        "qx_lou",
        "qx_dot",
        "qx_iggy",
        "qx_mort",
        "qx_scoop",
        "qx_pennington",
        "qx_muni7",
        "qx_edna",
        "qx_buttons",
        "qx_bixby",
        "qx_rask",
      ])
        expect(QX.npc(id), "no npc " + id);
    });

    // ---------------- Water Rising
    step("c4: interior built", () => {
      expect(
        QX.c4 && QX.c4.root && QX.c4.root.children.length > 5,
        "root empty",
      );
    });
    step("c4: set dressing + water FX", () => {
      const D = QX.c4dress;
      expect(D && D.normal && D.waterMat, "no water material");
      expect(
        QX.c4.water.every((w) => w.material === D.waterMat),
        "water sheet not upgraded",
      );
      expect(
        D.debris.length === 3 && D.rings.length >= 6,
        "debris " + D.debris.length + " rings " + D.rings.length,
      );
      expect(
        D.debris.every((d) => d.group.parent === QX.c4.root),
        "dressing not parented to the facility root",
      );
    });
    step("c4: start + enter", () => {
      QX.radioQuests.startC4(true);
      expect(QX.stage("qx_c4") === "hatch", "stage " + QX.stage("qx_c4"));
      QX.c4.entered();
      expect(QX.stage("qx_c4") === "inside", "stage " + QX.stage("qx_c4"));
    });
    step("c4: floor walkable", () => {
      const o = QX.c4.origin();
      const gy = G.world.groundHeight(o.x, o.z + 33 + 5, 1.5, 0.3);
      expect(Math.abs(gy) < 0.3, "atrium ground " + gy);
    });
    step("c4: intercom → bulkhead", () => {
      say("qx_dlg_brandt", "intercom");
      say("qx_dlg_brandt", "ic_help", 0);
      expect(QX.flag("c4_bulkhead"), "bulkhead closed");
      expect(QX.stage("qx_c4") === "talk", "stage " + QX.stage("qx_c4"));
    });
    step("c4: pumps", () => {
      QX.c4.drain(true);
      expect(QX.flag("c4_pumps"), "no pumps");
    });
    step("c4: locks registered (key / code / passcode)", () => {
      const L = QX.c4Locks;
      expect(L && L.office && L.footlocker && L.armory, "no lock specs");
      expect(
        L.office.key === "qx_c4_director_key" &&
          /^\d{4}$/.test(L.office.code) &&
          /^\d{4}$/.test(L.armory.code),
        "lock spec",
      );
      if (QX.locksLive() && G.locks.get)
        for (const id of [
          "qx_c4_office",
          "qx_c4_footlocker",
          "qx_c4_armory",
          "qx_bell_shackles",
        ])
          expect(G.locks.get(id), "lock not registered: " + id);
    });
    step("c4: talk → roll → truth", () => {
      say("qx_dlg_brandt", "hello");
      say("qx_dlg_brandt", "where");
      expect(QX.stage("qx_c4") === "roll", "stage " + QX.stage("qx_c4"));
      QX.give("qx_c4_roll", 1);
      expect(QX.has("qx_c4_roll"), "roll not given");
      say("qx_dlg_brandt", "truth");
      say("qx_dlg_brandt", "truth2");
      expect(
        QX.done("qx_c4") && QX.stage("qx_c4") === "done_truth",
        "not done: " + QX.stage("qx_c4"),
      );
      expect(QX.has("qx_c4_director_key"), "no key");
    });

    // ---------------- Numbers Game
    step("numbers: sparks → pad → decode → jam", () => {
      say("qx_dlg_sparks", "hello");
      say("qx_dlg_sparks", "accept");
      expect(
        QX.stage("qx_numbers") === "pad",
        "stage " + QX.stage("qx_numbers"),
      );
      QX.give("qx_cipher_sheet", 1);
      expect(
        QX.stage("qx_numbers") === "decode",
        "stage after pad " + QX.stage("qx_numbers"),
      );
      say("qx_dlg_sparks", "gotpad", 0);
      expect(
        QX.stage("qx_numbers") === "choose" && QX.has("qx_decoded_signal"),
        "decode failed " + QX.stage("qx_numbers"),
      );
      QX.numbers.jam();
      expect(QX.done("qx_numbers"), "not done " + QX.stage("qx_numbers"));
    });

    // ---------------- The Closing Bell
    step("bell: ransom → release", () => {
      QX.radioQuests.startBell();
      expect(QX.stage("qx_bell") === "find", "stage " + QX.stage("qx_bell"));
      scrip(600);
      QX.setFlag("bell_note", true); // skip the Trade note path
      QX.bell.dropBox();
      expect(QX.flag("bell_paid"), "not paid");
      QX.bell.release("ransom");
      expect(QX.stage("qx_bell") === "gc", "stage " + QX.stage("qx_bell"));
      QX.bell.reward();
      expect(
        QX.done("qx_bell") && QX.has("qx_pruitt_voucher"),
        "not done " + QX.stage("qx_bell"),
      );
    });

    // ---------------- Street: Zora / Ninth Stone / Fingers
    step("zora: deep reading → prophecy → stash", () => {
      scrip(100);
      QX.setFlag("zora_day", -1);
      expect(QX.zora.read(true), "read failed");
      expect(QX.flag("zora_prophecy_due"), "no prophecy due");
      say("qx_dlg_zora", "prophecy");
      expect(
        QX.stage("qx_prophecy") === "seek",
        "stage " + QX.stage("qx_prophecy"),
      );
      QX.zora.openStash();
      expect(QX.done("qx_prophecy"), "not done");
    });
    step("lou: rigged detection + caught refund", () => {
      expect(QX.monte.rigged(50) && !QX.monte.rigged(10), "rig rule");
      QX.setFlag("monte_lost", 40);
      QX.setFlag("lou_caught");
      const before = QX.scrip();
      say("qx_dlg_lou", "caught", 0);
      expect(
        QX.scrip() === before + 40 && QX.flag("lou_honest"),
        "refund failed",
      );
      expect(!QX.monte.rigged(50), "still rigged after settling");
    });
    step("lou: minigame opens + closes", () => {
      QX.monte.bet = 10;
      QX.monte.open();
      expect(
        document.querySelectorAll(".qx-monte-card").length === 3,
        "no cards",
      );
      QX.monte.finish();
      if (G.state !== "play") G.setState("play");
      expect(!document.querySelector(".qx-monte"), "overlay left behind");
    });

    // ---------------- id collisions: every quest id we define must still be ours in the engine
    step("quest ids: no collisions", () => {
      const bad = [];
      for (const id in QX.defs) {
        const v = G.quests.get ? G.quests.get(id) : null;
        if (!v) bad.push(id + " missing");
        else if (v.name && v.name !== QX.defs[id].name)
          bad.push(id + ' overwritten by "' + v.name + '"');
      }
      for (const id of QX.roster)
        if (!/^qx_/.test(id)) bad.push("npc id without qx_ prefix: " + id);
      expect(!bad.length, bad.join(", "));
    });

    // ---------------- The Big Apple Survival Guide (all five chapters)
    step("guide: five chapters → published", () => {
      const GD = QX.guide;
      GD.accept();
      expect(
        QX.stage("qx_guide") === "ch1" && QX.has("qx_pocket_snap"),
        "accept " + QX.stage("qx_guide"),
      );
      for (let i = 0; i < 3; i++) GD.takePhoto(GD.VIEWS[i]);
      expect(
        QX.stage("qx_guide") === "ch1_ret",
        "photos " + QX.stage("qx_guide"),
      );
      say("qx_dlg_dot", "done1");
      expect(
        QX.stage("qx_guide") === "ch2",
        "ch1 turn-in " + QX.stage("qx_guide"),
      );
      for (const id of GD.EATS.slice(0, 3)) G.events.emit("aidUsed", id);
      expect(
        QX.stage("qx_guide") === "ch2_ret",
        "eats " + QX.stage("qx_guide"),
      );
      say("qx_dlg_dot", "done2");
      expect(
        QX.stage("qx_guide") === "ch3",
        "ch2 turn-in " + QX.stage("qx_guide"),
      );
      say("qx_dlg_dot", "lie3");
      expect(QX.stage("qx_guide") === "ch4", "ch3 lie " + QX.stage("qx_guide"));
      expect(GD.copyPlacard !== undefined && QX.guide.copyPlacard(), "placard");
      say("qx_dlg_dot", "done4");
      expect(
        QX.stage("qx_guide") === "ch5" && QX.has("qx_plaster"),
        "ch4 turn-in " + QX.stage("qx_guide"),
      );
      expect(QX.guide.makeCast(), "cast");
      expect(QX.has("qx_claw_cast"), "no cast");
      say("qx_dlg_dot", "ret5", 0);
      say("qx_dlg_dot", "finale");
      expect(
        QX.done("qx_guide") && QX.has("qx_guide_book"),
        "not published " + QX.stage("qx_guide"),
      );
    });

    // ---------------- the six street quests
    step("franks: merger", () => {
      const A = QX.miscActions;
      A.mergeHalf("iggy");
      expect(
        QX.stage("qx_franks") === "merge_mort",
        "stage " + QX.stage("qx_franks"),
      );
      A.merge();
      expect(
        QX.done("qx_franks") && QX.has("qx_franks_recipe"),
        "not merged " + QX.stage("qx_franks"),
      );
    });
    step("extra: three deliveries → honest", () => {
      const A = QX.miscActions;
      A.extraStart();
      expect(QX.count("qx_gazette") >= 3, "no papers");
      scrip(40);
      A.deliver("penn");
      A.deliver("edna");
      A.deliver("muni");
      expect(
        QX.stage("qx_extra") === "return",
        "stage " + QX.stage("qx_extra"),
      );
      A.extraFinish(false);
      expect(QX.done("qx_extra"), "not done");
    });
    step("commute: timetable → home", () => {
      const A = QX.miscActions;
      A.pennStart("find");
      QX.give("qx_m42_timetable", 1);
      expect(
        QX.stage("qx_commute") === "tell",
        "stage " + QX.stage("qx_commute"),
      );
      A.pennHome(true);
      expect(
        QX.done("qx_commute") && QX.has("qx_pocket_watch"),
        "not done " + QX.stage("qx_commute"),
      );
    });
    step("parking: reprogram (good)", () => {
      const A = QX.miscActions;
      A.muniStart();
      expect(
        QX.stage("qx_parking") === "fine",
        "stage " + QX.stage("qx_parking"),
      );
      A.muniEnd("done_good");
      expect(QX.done("qx_parking") && QX.has("qx_impound_key"), "not done");
    });
    step("buttons: escort home", () => {
      const A = QX.miscActions;
      A.buttonsStart("find");
      A.buttonsFollow();
      expect(
        QX.stage("qx_buttons") === "escort",
        "stage " + QX.stage("qx_buttons"),
      );
      A.buttonsHome();
      A.buttonsReward(false);
      expect(QX.done("qx_buttons"), "not done " + QX.stage("qx_buttons"));
    });
    step("bixby: pages → show → curtain", () => {
      const A = QX.miscActions;
      A.bixStart();
      for (let i = 1; i <= 3; i++) QX.give("qx_script_page_" + i, 1);
      expect(
        QX.stage("qx_bixby") === "return",
        "stage " + QX.stage("qx_bixby"),
      );
      A.bixHandIn(false);
      expect(QX.stage("qx_bixby") === "show", "stage " + QX.stage("qx_bixby"));
      A.bixFinish();
      expect(
        QX.done("qx_bixby") && QX.has("qx_bixby_hat"),
        "not done " + QX.stage("qx_bixby"),
      );
    });

    // ---------------- unmarked: Dead Man's Hand / Getting Warmer
    step("lasthand: scorecard → cheat → skull box", () => {
      const U = QX.unmarked;
      expect(
        !G.containers ||
          G.isStub("containers") ||
          G.containers.get("qx_lh_skullbox"),
        "no skull box container",
      );
      QX.give("qx_lh_scorecard", 1);
      expect(
        QX.stage("qx_lasthand") === "key",
        "stage " + QX.stage("qx_lasthand"),
      );
      U.searchRemains("sal");
      U.searchRemains("deke");
      expect(
        QX.has("qx_lh_key") && QX.stage("qx_lasthand") === "box",
        "no key " + QX.stage("qx_lasthand"),
      );
      U.boxOpened();
      expect(
        QX.done("qx_lasthand") && !QX.has("qx_lh_key"),
        "not done " + QX.stage("qx_lasthand"),
      );
    });
    step("chalk: note → 4 arrows → drain", () => {
      const U = QX.unmarked;
      QX.give("qx_chalk_note", 1);
      expect(
        QX.stage("qx_chalk") === "follow",
        "stage " + QX.stage("qx_chalk"),
      );
      for (let i = 0; i < QX.unmarkedSpots.arrows.length; i++) U.arrow(i);
      expect(QX.stage("qx_chalk") === "x", "stage " + QX.stage("qx_chalk"));
      U.openDrain();
      expect(
        QX.done("qx_chalk") && QX.has("qx_chalk_card"),
        "not done " + QX.stage("qx_chalk"),
      );
    });

    // ---------------- Lancer Down
    step("lancer: pulse → jack → splint → saved", () => {
      expect(QX.npc("qx_rask"), "no lancer");
      QX.lancer.start(true);
      expect(
        QX.stage("qx_lancer") === "find",
        "stage " + QX.stage("qx_lancer"),
      );
      say("qx_dlg_rask", "pinned");
      expect(
        QX.stage("qx_lancer") === "free",
        "stage " + QX.stage("qx_lancer"),
      );
      say("qx_dlg_rask", "jackhint");
      QX.give("qx_kd_jack", 1);
      say("qx_dlg_rask", "jack");
      expect(
        QX.stage("qx_lancer") === "heal" && !QX.has("qx_kd_jack"),
        "stage " + QX.stage("qx_lancer"),
      );
      say("qx_dlg_rask", "limp");
      expect(
        QX.done("qx_lancer") &&
          QX.has("qx_rask_tag") &&
          QX.qflag("qx_rask_saved"),
        "not done " + QX.stage("qx_lancer"),
      );
    });

    const summary =
      "[qxtest] " +
      (res.ok ? "PASS" : "FAIL") +
      " " +
      res.steps.length +
      " ok, " +
      res.fails.length +
      " failed" +
      (res.fails.length ? ": " + res.fails.join(" || ") : "");
    console.log(summary);
    if (G.warnings) G.warnings.unshift(summary);
    if (!res.ok)
      G.reportError("quests_extra:selftest", new Error(res.fails.join(" || ")));
    window.QX_TEST = res;
    // headless harness: dump everything into the DOM (read back from --dump-dom)
    try {
      const pre = document.createElement("pre");
      pre.id = "qxtest-out";
      pre.style.display = "none";
      pre.textContent = JSON.stringify(res, null, 1);
      document.body.appendChild(pre);
    } catch (e) {
      /* ignore */
    }
    return res;
  }
