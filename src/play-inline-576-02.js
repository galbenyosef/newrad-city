// play-inline-576 02 — qid
// Lines 274-495 of readable/play-inline-576.pretty.js (statement-aligned).
  const G_ = (QX.guide = {
    VIEWS,
    EATS,
    TRACKS,
    photos,
    eaten,
    bonuses,
    accept() {
      if (QX.started(QID)) return;
      QX.start(QID, { stage: "ch1" });
      if (!QX.has("qx_pocket_snap")) QX.give("qx_pocket_snap", 1);
      if (QX.qlive() && G.quests.setTracked) G.quests.setTracked(QID);
    },
    turnIn1() {
      if (QX.stage(QID) !== "ch1_ret") return;
      for (const v of VIEWS) QX.take(v.item, QX.count(v.item));
      if (photos() >= 5) QX.setFlag("g_b1");
      QX.xp(
        100 + (QX.flag("g_b1") ? 50 : 0),
        "Big Apple Survival Guide — Chapter I",
      );
      pay(40 + (QX.flag("g_b1") ? 30 : 0));
      QX.setFlag("g_ch1_done");
      QX.setStage(QID, "ch2");
      checkEats();
    },
    turnIn2() {
      if (QX.stage(QID) !== "ch2_ret") return;
      QX.xp(
        125 + (QX.flag("g_b2") ? 50 : 0),
        "Big Apple Survival Guide — Chapter II",
      );
      pay(45 + (QX.flag("g_b2") ? 30 : 0));
      QX.setFlag("g_ch2_done");
      QX.setStage(QID, "ch3");
    },
    turnIn3(lied) {
      if (QX.stage(QID) !== "ch3_ret" && !(lied && QX.stage(QID) === "ch3"))
        return;
      if (lied) QX.setFlag("g_lied");
      QX.xp(
        lied ? 75 : 150 + (QX.flag("g_b3") ? 50 : 0),
        "Big Apple Survival Guide — Chapter III",
      );
      pay(50 + (QX.flag("g_b3") ? 40 : 0));
      if (!lied) QX.give(PRUSSIAN, 2);
      QX.setFlag("g_ch3_done");
      QX.setStage(QID, "ch4");
      spawnSubwayToken();
    },
    copyPlacard() {
      if (QX.stage(QID) !== "ch4") return false;
      if (QX.has("subway_token")) {
        QX.setFlag("g_b4");
        QX.take("subway_token", 1);
        QX.notify(
          "You drop a token in the fare box of a train that will never leave. It feels right.",
        );
      }
      QX.setFlag("g_placard");
      QX.notify('Route placard copied: "1 — SOUTH FERRY — ALL STOPS".');
      QX.sfx("ui_select");
      QX.setStage(QID, "ch4_ret");
      return true;
    },
    turnIn4() {
      if (QX.stage(QID) !== "ch4_ret") return;
      QX.xp(
        150 + (QX.flag("g_b4") ? 40 : 0),
        "Big Apple Survival Guide — Chapter IV",
      );
      pay(55 + (QX.flag("g_b4") ? 25 : 0));
      QX.setFlag("g_ch4_done");
      QX.setStage(QID, "ch5");
      if (!QX.has("qx_plaster") && !QX.has("qx_claw_cast"))
        QX.give("qx_plaster", 1);
    },
    makeCast() {
      if (QX.stage(QID) !== "ch5" || !QX.has("qx_plaster")) return false;
      let det = "hidden";
      if (QX.live("combat") && G.combat.detection)
        det = QX.safe("detection", () => G.combat.detection()) || "hidden";
      const hidden =
        det === "hidden" &&
        !!(G.player && G.player.sneaking) &&
        !(QX.live("combat") && G.combat.inCombat && G.combat.inCombat());
      if (hidden) QX.setFlag("g_b5");
      QX.take("qx_plaster", 1);
      QX.give("qx_claw_cast", 1);
      QX.sfx("container_close");
      QX.notify(
        hidden
          ? "You pour the plaster without a sound. Something enormous breathes in its sleep nearby."
          : "You pour the plaster. Somewhere in the trees, something large stops breathing to listen.",
      );
      QX.setStage(QID, "ch5_ret");
      return true;
    },
    turnIn5(lied) {
      const st = QX.stage(QID);
      if (st !== "ch5_ret" && !(lied && st === "ch5")) return;
      if (lied) {
        QX.setFlag("g_lied");
        QX.take("qx_plaster", 1);
      } else QX.take("qx_claw_cast", 1);
      QX.xp(
        lied ? 100 : 200 + (QX.flag("g_b5") ? 50 : 0),
        "Big Apple Survival Guide — Chapter V",
      );
      pay(80 + (QX.flag("g_b5") ? 40 : 0));
      QX.setFlag("g_ch5_done");
      QX.setStage(QID, "done");
    },
  });

  // Chapter II: count delicacies eaten while the chapter is open.
  function onAid(id) {
    if (EATS.indexOf(id) < 0) return;
    const st = QX.stage(QID);
    if (st !== "ch2" && st !== "ch2_ret") return;
    if (QX.flag("ate_" + id)) return;
    QX.setFlag("ate_" + id);
    QX.notify(
      "Research note: " +
        EAT_NAMES[id] +
        ". " +
        [
          "Tastes like the Before Times, if the Before Times were stale.",
          "You feel very local.",
          "Your stomach files a complaint.",
          "Delicious, probably.",
          "Dot will want adjectives.",
        ][eaten() % 5],
      { quiet: true },
    );
    checkEats();
  }
  function checkEats() {
    if (eaten() >= 5) QX.setFlag("g_b2");
    if (QX.stage(QID) === "ch2") {
      if (eaten() >= 3) QX.setStage(QID, "ch2_ret");
      else QX.refresh(QID);
    }
  }
  G.events.on("aidUsed", onAid);

  // Chapter III: poll the radiation dose (1 Hz) while the chapter is open.
  let radT = 0;
  QX.hook("update", function (dt, realDt) {
    radT -= realDt;
    if (radT > 0) return;
    radT = 1;
    const st = QX.stage(QID);
    if (st !== "ch3" && st !== "ch3_ret") return;
    const r = QX.radLevel();
    if (r >= 600 && !QX.flag("g_b3")) {
      QX.setFlag("g_b3");
      QX.notify("Advanced radiation sickness. Dot is going to be SO pleased.", {
        quiet: true,
      });
    }
    if (st === "ch3" && r >= 200) QX.setStage(QID, "ch3_ret");
  });

  // ------------------------------------------------------------------
  // Photos
  // ------------------------------------------------------------------
  function photoFlash(name) {
    if (G.SMOKE || G.SHOT) return;
    const vf = QX.el("div", "qx-viewfinder");
    vf.innerHTML =
      "<i></i><i></i><i></i><i></i><b></b><span>" +
      name.toUpperCase() +
      "</span>";
    void vf.offsetWidth;
    vf.classList.add("on");
    const fl = QX.el("div", "qx-flash");
    QX.later(0.45, () => {
      fl.style.transition = "none";
      fl.style.opacity = "0.95";
      QX.sfx("ui_select");
      void fl.offsetWidth;
      fl.style.transition = "";
      fl.style.opacity = "0";
      vf.remove();
    });
    QX.later(1.4, () => fl.remove());
    // safety: cleaned up on reset even if the scheduler is cancelled
    flashEls.push(vf, fl);
  }
  const flashEls = [];
  QX.hook("reset", () => {
    for (const e of flashEls.splice(0)) e.remove();
  });

  G_.takePhoto = function (v) {
    const st = QX.stage(QID);
    if ((st !== "ch1" && st !== "ch1_ret") || QX.flag("photo_" + v.key))
      return false;
    if (!QX.has("qx_pocket_snap")) {
      QX.notify("You need Dot's Brightline Pocket Snap camera.");
      return false;
    }
    QX.setFlag("photo_" + v.key);
    QX.give(v.item, 1, true);
    QX.sfx("ui_click");
    photoFlash(v.name);
    const n = photos();
    QX.notify(
      "Photograph taken: " + v.name + " (" + n + "/" + VIEWS.length + ")",
    );
    if (n >= 5) QX.setFlag("g_b1");
    if (st === "ch1") {
      if (n >= 3) QX.setStage(QID, "ch1_ret");
      else QX.refresh(QID);
    }
    return true;
  };

  // ------------------------------------------------------------------
  // World: tripods, ripjaw tracks, subway placard, Dot's sign
  // ------------------------------------------------------------------
