/* src/quests_extra/10_guide.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS_EXTRA — 10: "THE BIG APPLE SURVIVAL GUIDE"
 * Quest-giver: Dorothea "Dot" Finch, Finch's Facts & Fixes, Grand Central
 * Market (stall anchor grand_central.merchant3 — the SCRAP stall: "Facts &
 * Fixes"; merchant1 is the GUNS & AMMO stall and does not suit her).
 *
 * Five chapters, each with an optional bonus line:
 *   I   Sights & Sounds   photograph 3 of 5 landmarks at Dot's tripods (bonus: all 5)
 *   II  Local Cuisine     eat 3 different New York delicacies (bonus: all 5)
 *   III Blending In       radiation sickness, a 200 dose (bonus: 600) — or lie [Persuasion]
 *   IV  Public Transit    copy the route placard of the derailed train in the
 *                         42nd St subway (bonus: carry a subway token)
 *   V   Wildlife          plaster-cast a ripjaw footprint in the North Woods
 *                         (bonus: while [HIDDEN]) — or lie [Persuasion]
 * Reward: the book + a permanent "Big Apple Survivor" / "Big Apple
 * Know-It-All" talent depending on the bonuses earned.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const QX = G.qx;
  const K = () => QX.kit;

  const QID = "qx_guide";
  // Shared ids owned by other modules (rpg).
  const BAGEL = "old_world_bagel",
    CHOWDER = "shellback_chowder",
    PRUSSIAN = "prussian_blue",
    IODINE = "iodine_tabs",
    EFFECT_KIND_TALENT = "talent";
  const GC = { x: 240, z: -230 };

  // ------------------------------------------------------------------
  // Data
  // ------------------------------------------------------------------
  /** Scenic viewpoints: tripod spot + the landmark it looks at. */
  const VIEWS = [
    {
      key: "flatiron",
      name: "The Flatiron",
      item: "qx_photo_flatiron",
      x: 123,
      z: 64,
      look: { x: 150, z: 118 },
    },
    {
      key: "times",
      name: "Times Square",
      item: "qx_photo_times",
      x: -38,
      z: -216,
      look: { x: -40, z: -280 },
    },
    {
      key: "chrysler",
      name: "The Chrysler Building",
      item: "qx_photo_chrysler",
      x: 276,
      z: -238,
      look: { x: 309, z: -208 },
    },
    {
      key: "bridge",
      name: "The Brooklyn Bridge",
      item: "qx_photo_bridge",
      x: 132,
      z: 664,
      look: { x: 300, z: 640 },
    },
    {
      key: "liberty",
      name: "Lady Liberty",
      item: "qx_photo_liberty",
      x: -62,
      z: 992,
      look: { x: -420, z: 1250 },
    },
  ];
  /** New York delicacies for Chapter II (rpg item ids). */
  const EATS = ["coney_dog", "bodega_pretzel", BAGEL, "egg_cream", CHOWDER];
  const EAT_NAMES = {
    coney_dog: "a Coney Island dog",
    bodega_pretzel: "a street pretzel",
    [BAGEL]: "a bagel",
    egg_cream: "an egg cream",
    [CHOWDER]: "Manhattan chowder",
  };
  /** Ripjaw tracks (North Woods, ~25 m from the den centre). */
  const TRACKS = { x: -16, z: -936 };

  const photos = () => VIEWS.filter((v) => QX.flag("photo_" + v.key)).length;
  const eaten = () => EATS.filter((id) => QX.flag("ate_" + id)).length;
  const bonuses = () =>
    ["g_b1", "g_b2", "g_b3", "g_b4", "g_b5"].filter((k) => QX.flag(k)).length;
  const payMult = () => (QX.flag("dot_haggled") ? 1.5 : 1);
  const pay = (n) => QX.giveScrip(Math.round(n * payMult()));

  // ------------------------------------------------------------------
  // Quest
  // ------------------------------------------------------------------
  QX.hook("quests", function () {
    QX.define({
      id: QID,
      name: "The Big Apple Survival Guide",
      giver: "Dot Finch",
      location: "Grand Central Market",
      order: 40,
      desc:
        'Dorothea "Dot" Finch of Finch\'s Facts & Fixes is writing the first guidebook to New Rad City, for the tourists she is ' +
        "certain will come back. She needs a field researcher with durable legs and a flexible attitude to radiation.",
      stages: [
        {
          id: "ch1",
          text: () =>
            "Chapter I — Sights & Sounds: photograph three landmarks from Dot's scenic viewpoints (" +
            Math.min(3, photos()) +
            "/3).",
          markers: () =>
            VIEWS.filter((v) => !QX.flag("photo_" + v.key)).map((v) => ({
              x: v.x,
              z: v.z,
              label: "Scenic Viewpoint: " + v.name,
            })),
        },
        {
          id: "ch1_ret",
          text: "Bring your photographs back to Dot Finch.",
          markers: () => [{ npc: "qx_dot", label: "Dot Finch" }],
        },
        {
          id: "ch2",
          text: () =>
            "Chapter II — Local Cuisine: eat three different New York delicacies (" +
            Math.min(3, eaten()) +
            "/3).",
          markers: () => [
            { npc: "qx_iggy", label: "Iggy's Franks" },
            { npc: "qx_mort", label: "Mort's Dogs" },
          ],
        },
        {
          id: "ch2_ret",
          text: "Tell Dot Finch about the local cuisine.",
          markers: () => [{ npc: "qx_dot", label: "Dot Finch" }],
        },
        {
          id: "ch3",
          text: "Chapter III — Blending In: get radiation sickness (a dose of 200 or more).",
        },
        {
          id: "ch3_ret",
          text: "Show Dot Finch your healthy glow.",
          markers: () => [{ npc: "qx_dot", label: "Dot Finch" }],
        },
        {
          id: "ch4",
          text: "Chapter IV — Public Transit: copy down the route placard of the derailed train in the 42nd Street subway.",
          markers: () => [
            {
              anchor: ["subway", ["train", "car", "platform"]],
              fallback: { x: -60, z: -228 },
              label: "Derailed Train",
            },
          ],
        },
        {
          id: "ch4_ret",
          text: "Tell Dot Finch where the train was going.",
          markers: () => [{ npc: "qx_dot", label: "Dot Finch" }],
        },
        {
          id: "ch5",
          text: "Chapter V — Wildlife: make a plaster cast of a ripjaw footprint in the North Woods.",
          markers: () => [{ x: TRACKS.x, z: TRACKS.z, label: "Ripjaw Tracks" }],
        },
        {
          id: "ch5_ret",
          text: "Bring the ripjaw footprint cast to Dot Finch.",
          markers: () => [{ npc: "qx_dot", label: "Dot Finch" }],
        },
        {
          id: "done",
          complete: true,
          text: () =>
            "The Big Apple Survival Guide is published. " +
            (QX.flag("g_knowitall")
              ? "You are a certified Big Apple Know-It-All."
              : "You are a certified Big Apple Survivor."),
        },
        // bonus objectives (optional lines, ticked when achieved)
        {
          id: "b1",
          sideObjective: true,
          text: "(Optional) Photograph all five landmarks.",
          doneIf: () => !!QX.flag("g_b1"),
          showIf: () => ["ch1", "ch1_ret"].indexOf(QX.stage(QID)) >= 0,
        },
        {
          id: "b2",
          sideObjective: true,
          text: "(Optional) Try all five delicacies: Coney dog, pretzel, bagel, egg cream and chowder.",
          doneIf: () => !!QX.flag("g_b2"),
          showIf: () => ["ch2", "ch2_ret"].indexOf(QX.stage(QID)) >= 0,
        },
        {
          id: "b3",
          sideObjective: true,
          text: "(Optional) Reach advanced radiation sickness (a dose of 600).",
          doneIf: () => !!QX.flag("g_b3"),
          showIf: () => ["ch3", "ch3_ret"].indexOf(QX.stage(QID)) >= 0,
        },
        {
          id: "b4",
          sideObjective: true,
          text: "(Optional) Pay your fare: carry a subway token when you visit the train.",
          doneIf: () => !!QX.flag("g_b4"),
          showIf: () => QX.stage(QID) === "ch4",
        },
        {
          id: "b5",
          sideObjective: true,
          text: "(Optional) Make the cast without being detected.",
          doneIf: () => !!QX.flag("g_b5"),
          showIf: () => QX.stage(QID) === "ch5",
        },
      ],
      rewards: { xp: 300 },
      onComplete() {
        QX.give("qx_guide_book", 1);
        grantTalent();
        QX.news(
          "Hot off the presses at Grand Central Market: Dot Finch's Big Apple Survival Guide! Twelve copies, hand-lettered, " +
            "field-tested by our own favourite thawed-out sleeper. Chapter three recommends radiation. Please do not follow chapter three.",
        );
      },
    });
  });

  function grantTalent() {
    const guru = bonuses() >= 4 && !QX.flag("g_lied");
    QX.setFlag("g_knowitall", guru);
    QX.addEffect(
      guru
        ? {
            id: "qx_talent_guide",
            name: "Big Apple Know-It-All",
            kind: EFFECT_KIND_TALENT,
            duration: 0,
            source: "The Big Apple Survival Guide",
            desc: "You researched every chapter of the Big Apple Survival Guide the hard way. +10 Survival, +5 Persuasion, +5 Trade.",
            mods: { skills: { survival: 10, persuasion: 5, trade: 5 } },
          }
        : {
            id: "qx_talent_guide",
            name: "Big Apple Survivor",
            kind: EFFECT_KIND_TALENT,
            duration: 0,
            source: "The Big Apple Survival Guide",
            desc: "You helped write the Big Apple Survival Guide. +5 Survival, +3 Persuasion.",
            mods: { skills: { survival: 5, persuasion: 3 } },
          },
    );
    QX.notify(
      guru
        ? "Talent gained: Big Apple Know-It-All"
        : "Talent gained: Big Apple Survivor",
    );
  }

  // ------------------------------------------------------------------
  // Chapter hand-ins (named so dialogue + self-test share them)
  // ------------------------------------------------------------------
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
  QX.hook("world", function () {
    const k = K();
    for (const v of VIEWS) {
      const p = QX.freeSpot(v.x, v.z, undefined, { maxR: 6 });
      v.x = p.x;
      v.z = p.z;
      v.y = p.y;
      const yaw = QX.yawTo(p.x, p.z, v.look.x, v.look.z);
      k.tripod(p.x, p.y, p.z, yaw);
      k.collider(p.x, p.z, 0.5, 0.5, p.y, p.y + 1.7, 0, "metal");
      QX.interact({
        pos: QX.V3(p.x, p.y + 1.55, p.z),
        radius: 0.5,
        label: "Scenic Viewpoint: " + v.name,
        verb: "Take Photograph",
        priority: 1,
        enabled: () => {
          const st = QX.stage(QID);
          return (
            (st === "ch1" || st === "ch1_ret") && !QX.flag("photo_" + v.key)
          );
        },
        onInteract: () => G_.takePhoto(v),
      });
    }

    // Ripjaw tracks: three huge toe gouges and a dragging fourth claw pressed into the mud.
    const ty = G.world.terrainHeight(TRACKS.x, TRACKS.z);
    const g = k.group(TRACKS.x, ty, TRACKS.z, 0.6, 90);
    const b = k.builder();
    const mud = k.tint("qx_mud", 0x2a2218, { roughness: 1 });
    for (let i = 0; i < 3; i++) {
      k.box(
        b,
        mud,
        0.28,
        0.04,
        1.1,
        (i - 1) * 0.42,
        0.01,
        -0.35 - (i === 1 ? 0.2 : 0),
        (i - 1) * 0.25,
      );
      k.box(b, mud, 1.1, 0.03, 0.9, 0.3, 0.01, 1.8 + i * 1.6); // stride continues
    }
    k.box(b, mud, 1.2, 0.035, 0.9, 0, 0.012, 0.4);
    k.flush(b, g, false);
    QX.interact({
      pos: QX.V3(TRACKS.x, ty + 0.3, TRACKS.z),
      radius: 0.9,
      label: "Ripjaw Footprint",
      verb: "Make Plaster Cast",
      priority: 1,
      enabled: () => QX.stage(QID) === "ch5" && QX.has("qx_plaster"),
      onInteract: () => G_.makeCast(),
    });

    // Dot's stall dressing: her own hand-painted banner over the counter front (the landmark's awning
    // board says SCRAP — "fixes"), a sandwich board out front, and her stock on the counter.
    const dp = QX.anchor("grand_central", ["merchant3", "merchant1"], {
      x: 247.5,
      z: -239.5,
    });
    if (dp) {
      const y0 = dp.y || 0;
      const banner = k.sign(
        "FINCH'S FACTS & FIXES\nmaps \u00b7 advice \u00b7 zippers \u00b7 guidebooks",
        "wood",
        3.3,
        0.72,
        { fg: "#f2e6c0", bg: "#27402c" },
      );
      banner.position.set(dp.x, y0 + 0.56, dp.z + 1.27);
      G.scene.add(banner);
      if (G.world.addLOD) G.world.addLOD(banner, 90);
      // counter goods (the counter top is at +1.1 m, its front at +1.25 m from Dot's spot)
      const cg = k.group(dp.x, y0, dp.z, 0, 70);
      const cb = k.builder();
      const paper = k.tint("qx_dot_paper", 0xd8ceb0, { roughness: 1 }),
        red = k.tint("qx_dot_red", 0x8a2a20, { roughness: 0.8 }),
        tin = k.mat("metal_painted", 0x6a7078);
      const books = [
        k.tint("qx_dot_book_a", 0x2a5a4a, { roughness: 0.9 }),
        k.tint("qx_dot_book_b", 0x7a4a22, { roughness: 0.9 }),
      ];
      for (let i = 0; i < 4; i++)
        k.cyl(
          cb,
          paper,
          0.035,
          0.62,
          -1.3 + i * 0.09,
          1.14,
          0.78 + (i % 2) * 0.05,
          8,
          0,
          Math.PI / 2,
          0.2,
        ); // rolled maps
      for (let i = 0; i < 5; i++)
        k.box(
          cb,
          books[i % 2],
          0.24,
          0.035,
          0.17,
          -0.45,
          1.12 + i * 0.036,
          0.72,
          i * 0.12,
        ); // guidebook stack
      k.box(cb, paper, 0.26, 0.004, 0.19, 0.05, 1.105, 0.78, -0.2);
      k.box(cb, paper, 0.26, 0.004, 0.19, 0.12, 1.109, 0.8, 0.3); // open maps
      k.cyl(cb, tin, 0.08, 0.2, 0.62, 1.2, 0.72, 10);
      k.cyl(cb, red, 0.082, 0.03, 0.62, 1.31, 0.72, 10); // the zipper tin
      k.cyl(cb, tin, 0.02, 0.9, 1.45, 1.55, 0.72, 6);
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        k.box(
          cb,
          i % 2 ? paper : red,
          0.12,
          0.16,
          0.005,
          1.45 + Math.sin(a) * 0.07,
          1.55 + (i % 3) * 0.2,
          0.72 + Math.cos(a) * 0.07,
          a,
        );
      } // postcard spinner
      k.flush(cb, cg, false);
      const bp = QX.freeSpot(dp.x - 2.6, dp.z + 2.0, y0, {
        maxR: 2,
        radius: 0.5,
      }) || { x: dp.x - 2.6, z: dp.z + 2.0, y: y0 };
      const sb = k.group(bp.x, bp.y || y0, bp.z, Math.PI * 0.85, 90);
      const bb = k.builder();
      const wood = k.mat("wood_planks", 0x6a4a2a);
      k.box(bb, wood, 0.7, 1.0, 0.04, 0, 0.5, -0.18, 0, 0.18);
      k.box(bb, wood, 0.7, 1.0, 0.04, 0, 0.5, 0.18, 0, -0.18);
      k.flush(bb, sb, false);
      for (const s of [-1, 1]) {
        const sg = k.sign(
          "FINCH'S\nFACTS & FIXES\nmaps · advice\nzippers",
          "wood",
          0.62,
          0.8,
          { fg: "#f2e6c0", bg: "#27402c" },
        );
        sg.position.set(0, 0.55, 0.2 * s + 0.015 * s);
        sg.rotation.x = -0.18 * s;
        if (s < 0) sg.rotation.y = Math.PI;
        sb.add(sg);
      }
      k.collider(
        bp.x,
        bp.z,
        0.8,
        0.5,
        bp.y || y0,
        (bp.y || y0) + 1.0,
        Math.PI * 0.85,
        "wood",
      );
    }
  });

  // Subway: placard interactable at the derailed train (interior anchor), token by the booth.
  let placardIt = null;
  QX.hook("spawn", function () {
    const tr = QX.anchor("subway", ["train", "car", "train_b"], null);
    const pos = tr ? QX.V3(tr.x, (tr.y || 0) + 1.5, tr.z) : null;
    if (pos) {
      placardIt = QX.sessionInteract({
        pos,
        radius: 1.2,
        label: "Route Placard",
        verb: "Copy Down",
        priority: 2,
        enabled: () => QX.stage(QID) === "ch4",
        onInteract: () => G_.copyPlacard(),
      });
    }
    if (QX.stage(QID) === "ch4") spawnSubwayToken();
  });
  // Fallback when the map module (subway) is absent: reaching the entrance counts.
  QX.trigger({
    id: "g_subway_fallback",
    x: -60,
    z: -228,
    r: 6,
    once: false,
    cooldown: 5,
    cond: () => QX.stage(QID) === "ch4" && !placardIt,
    fire: () => G_.copyPlacard(),
  });
  function spawnSubwayToken() {
    if (QX.flag("got_g_token") || QX.pickups.g_token) return;
    const b = QX.anchor("subway", ["booth", "mezzanine"], null);
    if (b)
      QX.pickup("g_token", "subway_token", 1, {
        x: b.x + 0.6,
        y: (b.y || 0) + 0.05,
        z: b.z + 0.4,
      });
  }

  // ------------------------------------------------------------------
  // Dot Finch
  // ------------------------------------------------------------------
  const DOT_STOCK = [
    ["scrap_metal", 6],
    ["duct_tape", 3],
    ["tuff_bond", 2],
    ["scrap_electronics", 2],
    ["subway_token", 3],
    ["souvenir_paperweight", 1],
    ["pencil", 4],
    ["clipboard", 1],
    ["old_world_book", 2],
    ["purified_water", 3],
    [PRUSSIAN, 1],
  ];
  QX.hook("spawn", function () {
    const cust = QX.anchor(
      "grand_central",
      ["merchant3_customer", "merchant1_customer"],
      { x: 247.5, z: -237.5 },
    );
    const dot = QX.spawnNPC({
      id: "qx_dot",
      type: "human",
      name: "Dot Finch",
      outfit: "settler",
      gender: "f",
      hair: "bun",
      hat: "beret",
      skinTone: "fair",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      homeR: 1.5,
      essential: true,
      level: 4,
      at: {
        site: "grand_central",
        anchors: ["merchant3", "merchant1"],
        fallback: { x: 247.5, z: -239.5 },
      },
      lookAt: cust || { x: 247.5, z: -230 },
      dialogue: "qx_dlg_dot",
      voice: "merchant",
      merchant: { scrip: 220, stock: DOT_STOCK, restock: 3 },
      barks: [
        "Maps! Advice! Zippers!",
        "Finch's Facts: if it's not in the book, it didn't happen!",
        "Welcome to New York! Please keep your limbs inside the city at all times.",
        "Ask me anything! Except where the bathroom is. There isn't one. There's a bucket.",
      ],
    });
    // saves from before round 2 restore her at the old GUNS & AMMO stall: walk her over to her own
    QX.safe("dotMove", () => {
      const want = QX.anchor("grand_central", ["merchant3", "merchant1"], null);
      if (
        !dot ||
        dot.dead ||
        !want ||
        !dot.pos ||
        Math.hypot(dot.pos.x - want.x, dot.pos.z - want.z) < 3
      )
        return;
      dot.pos.x = want.x;
      dot.pos.z = want.z;
      if (want.y !== undefined) dot.pos.y = want.y;
      if (dot.home && typeof dot.home === "object") {
        dot.home.x = want.x;
        dot.home.z = want.z;
      }
      if (cust) dot.yaw = QX.yawTo(want.x, want.z, cust.x, cust.z);
    });
  });

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
  QX.hook("register", function () {
    const st = () => QX.stage(QID);
    const R_BARTER = { text: "What've you got for sale?", barter: true };
    QX.dialogue("qx_dlg_dot", {
      start: () => {
        if (QX.done(QID)) return "after";
        const s = st();
        if (!s) return QX.flag("met_dot") ? "again" : "hello";
        if (s === "ch1_ret") return "ret1";
        if (s === "ch2_ret") return "ret2";
        if (s === "ch3_ret") return "ret3";
        if (s === "ch4_ret") return "ret4";
        if (s === "ch5_ret") return "ret5";
        return "prog";
      },
      nodes: {
        hello: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.setFlag("met_dot");
          },
          text:
            "Oh! A customer! Or a tourist! Or a customer who is ALSO a tourist! You have the look — lost, a little frightened, holding a gun like it might bite you. " +
            "Welcome to Finch's Facts and Fixes: maps, directions, advice and the occasional fix. Mostly zippers. I'm Dot. Dorothea Finch, but nobody's called me Dorothea since the '67 War.",
          responses: [
            {
              text: "I just woke up in a cryo pod under the Municipal Building.",
              next: "sleeper",
            },
            { text: 'What exactly are "Facts"?', next: "facts" },
            R_BARTER,
            { text: "Nice to meet you. Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Dot Finch",
          text: "My favourite potential research assistant! Changed your mind? The future of tourism is holding its breath. Mostly because of the air.",
          responses: [
            { text: "Tell me about the book again.", next: "pitch" },
            R_BARTER,
            { text: "Just passing through.", end: true },
          ],
        },
        sleeper: {
          speaker: "Dot Finch",
          text:
            "A SLEEPER! A real live Long Winter sleeper! Oh, this is perfect. You're exactly my target audience — fresh eyes, soft hands, no idea which way is up. " +
            "Do you know how rare that is? Everyone else in this city was born knowing which puddles are hungry.",
          responses: [{ text: "Target audience for what?", next: "facts" }],
        },
        facts: {
          speaker: "Dot Finch",
          text:
            "My BOOK! The first new book written in New York since the bombs. Probably. Maybe. Nobody's checked. " +
            '"The Big Apple Survival Guide: A Visitor\'s Companion to New Rad City." Because one day the tourists are coming back, and when they do, ' +
            "somebody has to tell them which bagels bite.",
          responses: [
            { text: "And where do I come in?", next: "pitch" },
            { text: "The tourists are not coming back.", next: "cynic" },
          ],
        },
        cynic: {
          speaker: "Dot Finch",
          text: "That's what they said about the pigeons, and look at them now! Three eyes each. Twice the sightseeing.",
          responses: [
            { text: "Fair point. What do you need?", next: "pitch" },
            { text: "I'll pass.", next: "decline" },
          ],
        },
        pitch: {
          speaker: "Dot Finch",
          text:
            "A guidebook needs research. Research needs legs. My legs are lovely, thank you, but they're sort of contractually committed to this stall. " +
            "I need a FIELD RESEARCHER. Five chapters, five little errands. I pay in Scrip, credit in the acknowledgements, and the undying gratitude of future generations.",
          responses: [
            { text: "Sounds fun. Count me in.", next: "accept" },
            { text: "Errands like what?", next: "what" },
            {
              id: "dot_haggle",
              text: "Future generations don't pay rent. Make it worth my while.",
              check: { skill: "persuasion", value: 40 },
              next: "haggle",
              failNext: "haggle_fail",
              cond: () => !QX.flag("dot_haggled"),
            },
            { text: "Not interested.", next: "decline" },
          ],
        },
        what: {
          speaker: "Dot Finch",
          text: "Oh, easy stuff! Sightseeing. Eating. Getting a little radiation. Riding the subway. Meeting some wildlife. Everything a real New Yorker does before lunch!",
          responses: [
            { text: 'Define "a little radiation".', next: "what2" },
            { text: "Alright, I'm in.", next: "accept" },
            { text: "No thanks.", next: "decline" },
          ],
        },
        what2: {
          speaker: "Dot Finch",
          text: "Enough to glow, not enough to glow in the dark. Mostly. It's chapter three. We'll cross that bridge when we get to it. Also there's a bridge in chapter one.",
          responses: [
            { text: "Alright, I'm in.", next: "accept" },
            { text: "No thanks.", next: "decline" },
          ],
        },
        haggle: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.setFlag("dot_haggled");
          },
          text: "...Ooh, you drive a hard bargain. I respect that. It's going in the chapter on haggling. Fine! Half again on every chapter. Don't tell my other researchers. I don't have other researchers.",
          responses: [{ text: "Then we have a deal.", next: "accept" }],
        },
        haggle_fail: {
          speaker: "Dot Finch",
          text: "Ha! You're funny. That's going in the chapter on humour. Standard rates, sweetie — it's a small press. It's a very small press. It's me and a pencil.",
          responses: [
            { text: "Fine. I'm in.", next: "accept" },
            { text: "Forget it.", next: "decline" },
          ],
        },
        decline: {
          speaker: "Dot Finch",
          text: "That's alright! The offer stands, like the Chrysler Building. Mostly standing. Somewhat leaning. Come back anytime!",
          responses: [{ text: "Goodbye.", end: true }],
        },
        accept: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.accept();
          },
          text:
            "Wonderful! Chapter One: SIGHTS AND SOUNDS. Take my Brightline Pocket Snap — it's a camera, don't make that face — and photograph at least three of our famous landmarks. " +
            "I set up scenic viewpoints with little tripods and everything: the Flatiron, Times Square, the Chrysler Building, the Brooklyn Bridge, and Lady Liberty from Battery Park. " +
            "A few of them might have a teeny raider problem.",
          responses: [
            { text: 'A "teeny" raider problem?', next: "teeny" },
            { text: "I'll be back with pictures.", end: true },
          ],
        },
        teeny: {
          speaker: "Dot Finch",
          text: 'Teeny! Tiny. Some of the raiders are quite large, obviously, but the PROBLEM is teeny. Just smile and say "cheese". Raiders love cheese. Everybody loves cheese. There is no more cheese.',
          responses: [{ text: "Right. Pictures.", end: true }],
        },

        prog: {
          speaker: "Dot Finch",
          text: () => {
            const s = st();
            if (s === "ch1")
              return (
                "How's the photography going? Three landmarks — any three! " +
                (photos() ? "You've got " + photos() + " so far. " : "") +
                "And no thumbs over the lens, please. This city has enough extra digits."
              );
            if (s === "ch2")
              return (
                "Eaten anything local yet? Three different delicacies — coney dogs, pretzels, bagels, egg creams, chowder. Iggy and Mort out front sell most of them. " +
                (eaten() ? "That's " + eaten() + " down!" : "Chew thoroughly.")
              );
            if (s === "ch3")
              return "Still not glowing? Two hundred roentgens, sweetie. Try the river. Or a nice crater. Or lick a car. Actually don't lick a car. Actually — for science — lick one car.";
            if (s === "ch4")
              return "The derailed train is in the 42nd Street station, down past the turnstiles and the Maniacs. Copy the route placard! And pay your fare if you find a token, we're not animals.";
            if (s === "ch5")
              return "The North Woods, top of the park. Big footprints. Bigger owners. Pour the plaster, let it set, back away slowly, then back away quickly.";
            return "Research is going beautifully! I can feel it.";
          },
          responses: [
            {
              id: "dot_lie3",
              text: "(Lie) I'm already glowing. Two hundred roentgens, easy. Look at this rash.",
              check: { skill: "persuasion", value: 60 },
              cond: () => st() === "ch3",
              next: "lie3",
              failNext: "lie3_fail",
            },
            {
              id: "dot_lie5",
              text: "(Lie) The cast broke on the way back. But the footprint was THIS big.",
              check: { skill: "persuasion", value: 70 },
              cond: () => st() === "ch5" && QX.has("qx_plaster"),
              next: "lie5",
              failNext: "lie5_fail",
            },
            {
              id: "dot_med3",
              text: "Radiation destroys bone marrow and the gut lining. This chapter is dangerous advice.",
              check: { skill: "medicine", value: 50 },
              cond: () => st() === "ch3" && !QX.flag("dot_med"),
              next: "med3",
            },
            {
              id: "dot_wits5",
              text: "Wouldn't a photograph of the tracks do?",
              check: { attr: "wits", value: 7 },
              cond: () => st() === "ch5",
              next: "int5",
            },
            R_BARTER,
            { text: "I'm on it.", end: true },
          ],
        },
        lie3: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn3(true);
          },
          text: "Ooh, that IS a rash. That's a beautiful rash. I'll just write \"moderate glow, rash, brave\". Here — half pay for a half-glow. ...What? I'm gullible, not stupid.",
          responses: [{ text: "What's next?", next: "intro4" }],
        },
        lie3_fail: {
          speaker: "Dot Finch",
          text: "That's a mosquito bite, sweetie. I've SEEN radiation sickness. I have a Geiger counter in my purse. It is, admittedly, also my purse.",
          responses: [{ text: "Fine. I'll go get irradiated.", end: true }],
        },
        med3: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.setFlag("dot_med");
            QX.give(PRUSSIAN, 1);
            QX.give(IODINE, 1);
          },
          text: "Oh. Oh, when you say it like THAT. ...Fine. I'll add a very large warning box. With a skull on it. Here, take these — iodine tabs to go in, Prussian Blue to come out. The chapter stays, but now it's RESPONSIBLE.",
          responses: [{ text: "That's all I ask.", end: true }],
        },
        lie5: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn5(true);
          },
          text: "THIS big? Oh my stars. Oh, I believe you, I absolutely believe you. I'll draw it from your description! It'll be the biggest footprint in publishing history. Pass me that plaster, I'm making a model.",
          responses: [{ text: "So the book's finished?", next: "finale" }],
        },
        lie5_fail: {
          speaker: "Dot Finch",
          text: "You still have the plaster, sweetie. It's right there in your pocket, making a little plaster-shaped bulge. Go on. The ripjaws won't bite. They'll crush, mostly.",
          responses: [{ text: "Fine.", end: true }],
        },
        int5: {
          speaker: "Dot Finch",
          text: "Photographs don't show DEPTH! Tourists need to understand depth. Emotionally and literally. Also the camera's out of film. Also I sold the camera. Also I'm going to buy it back.",
          responses: [{ text: "Plaster it is.", end: true }],
        },

        // ---- Chapter I hand-in ----
        ret1: {
          speaker: "Dot Finch",
          text: () =>
            "Let's see, let's see... [She fans out the " +
            photos() +
            " snapshots like a winning poker hand.] Oh, the light! Oh, is that a raider? He's waving! " +
            (photos() >= 5
              ? "And ALL FIVE? You absolute professional."
              : "These are perfect."),
          responses: [
            { text: "[Hand over the photographs.]", next: "done1" },
            {
              id: "dot_ret1_persuade",
              text: "Some of these were taken under fire. That deserves hazard pay.",
              check: { skill: "persuasion", value: 50 },
              next: "ret1_hazard",
              failNext: "ret1_hazard_fail",
            },
            {
              id: "dot_ret1_senses",
              text: "You're holding the Flatiron one upside down.",
              check: { attr: "senses", value: 7 },
              next: "ret1_per",
            },
          ],
        },
        ret1_hazard: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.giveScrip(25);
          },
          text: "Under FIRE? Oh, that's going in a caption. \"Photographed under fire.\" Here — hazard pay. It's small, like the hazard. Hopefully.",
          responses: [{ text: "[Hand over the photographs.]", next: "done1" }],
        },
        ret1_hazard_fail: {
          speaker: "Dot Finch",
          text: "Everything in this city is taken under fire, sweetie. Even breakfast.",
          responses: [{ text: "[Hand over the photographs.]", next: "done1" }],
        },
        ret1_per: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.xp(15, "Keen eye");
          },
          text: "...So I am. Huh. It looked like it was leaning the other way. You know what? It's a triangle. Nobody will notice.",
          responses: [{ text: "[Hand over the photographs.]", next: "done1" }],
        },
        done1: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn1();
          },
          text:
            'Chapter One is WRITTEN! "Bring a camera, and a second camera for when the first one is eaten." Here\'s your pay. Now — Chapter Two: LOCAL CUISINE! ' +
            "A city is its food. I want you to eat three different New York delicacies. Coney dogs, pretzels, bagels, egg creams, the chowder. Iggy and Mort sell most of it out front. " +
            "They'll also try to recruit you into their little war. Don't take sides! Or do. It'd make a lovely sidebar.",
          responses: [
            { text: "Eat things. I can do that.", end: true },
            { text: "What little war?", next: "war" },
          ],
        },
        war: {
          speaker: "Dot Finch",
          text: "Iggy and Mort have been parked on opposite sides of the front door for eleven years. They share a supplier, a wall, and a mutual hatred so pure you could bottle it. I think they're in love. Don't tell them.",
          responses: [
            { text: "My lips are sealed. Mostly around a hot dog.", end: true },
          ],
        },

        // ---- Chapter II hand-in ----
        ret2: {
          speaker: "Dot Finch",
          text: "Well? Well?? Describe the flavours. In detail. I'm taking notes. [She licks her pencil, grimaces, licks it again.]",
          responses: [
            {
              text: "The coney dog tasted like regret and nitrates.",
              next: "done2",
            },
            {
              id: "dot_ret2_surv",
              text: "Chowder's the only thing actually cooked through. Warn people about the bagels — hard enough to chip a tooth.",
              check: { skill: "survival", value: 40 },
              next: "ret2_surv",
            },
            {
              id: "dot_ret2_grit",
              text: "My stomach says it was delicious. My stomach is lying.",
              check: { attr: "grit", value: 7 },
              next: "ret2_end",
            },
          ],
        },
        ret2_surv: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.xp(25, "Practical advice");
          },
          text: "\"Bagels: dental hazard.\" Oh, that's GOOD. That's practical. You're a natural. This is going in a little box with an exclamation mark.",
          responses: [{ text: "Happy to help.", next: "done2" }],
        },
        ret2_end: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.xp(15, "Iron stomach");
          },
          text: 'An IRON stomach. I\'ll add a sidebar: "Is your stomach made of iron? If not, consider having it replaced with iron."',
          responses: [{ text: "Sound advice.", next: "done2" }],
        },
        done2: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn2();
          },
          text:
            'Chapter Two is DONE! "The New York hot dog has survived the \'67 War. Respect it. Do not ask what it is. It does not know either." Payment! And now... Chapter Three: BLENDING IN. ' +
            "The locals glow, sweetie. Literally. You can't write about a place until you've soaked in it. Get yourself radiation sickness — two hundred roentgens — and come let me look at you. " +
            "Six hundred if you're feeling ADVANCED.",
          responses: [
            { text: "You want me to poison myself.", next: "poison" },
            { text: "For the book. Fine.", end: true },
          ],
        },
        poison: {
          speaker: "Dot Finch",
          text: "Poison is such an ugly word. Let's say \"season\". You're seasoning yourself. Like a cast-iron pan. A glowing, slightly nauseous pan.",
          responses: [{ text: "...Fine.", end: true }],
        },

        // ---- Chapter III hand-in ----
        ret3: {
          speaker: "Dot Finch",
          text: () =>
            "Oh my goodness, look at you. You're practically luminous! Hold still — [She waves a clicking Geiger counter near your face.] ...Wow. Okay. " +
            (QX.flag("g_b3")
              ? "That's ADVANCED. Please don't stand near the snacks."
              : "Don't stand near the snacks."),
          responses: [
            { text: "Can I have that Prussian Blue now?", next: "done3" },
            { text: "I feel fantastic. I can taste colours.", next: "done3" },
          ],
        },
        done3: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn3(false);
          },
          text:
            'Prussian Blue, as promised — two bottles! Chapter Three: "Nothing says I\'m a local like a gentle healthy glow." Now — Chapter Four, PUBLIC TRANSIT. ' +
            "The Times Square–42nd Street station has a derailed train in the tunnel. Go copy down its route placard. What line, where it was going. Tourists LOVE that sort of thing. And pay your fare if you find a token!",
          responses: [
            { text: "Subway. Got it.", end: true },
            { text: "Isn't the subway full of Maniacs?", next: "maniacs" },
          ],
        },
        intro4: {
          speaker: "Dot Finch",
          text: "Chapter Four, PUBLIC TRANSIT! The Times Square–42nd Street station has a derailed train in the tunnel. Copy down its route placard. And pay your fare if you find a token!",
          responses: [
            { text: "Subway. Got it.", end: true },
            { text: "Isn't the subway full of Maniacs?", next: "maniacs" },
          ],
        },
        maniacs: {
          speaker: "Dot Finch",
          text: "Commuters, sweetie. They're just very, very late for work. Stand clear of the closing jaws.",
          responses: [{ text: "Charming.", end: true }],
        },

        // ---- Chapter IV hand-in ----
        ret4: {
          speaker: "Dot Finch",
          text: "You're back! You have all your limbs! I counted! Well? Where was the train going?",
          responses: [
            {
              text: 'The 1 train. "SOUTH FERRY — ALL STOPS."',
              next: "ret4_true",
            },
            {
              text: '(Joke) It said "HELL — EXPRESS, NO STOPS".',
              next: "ret4_joke",
            },
          ],
        },
        ret4_true: {
          speaker: "Dot Finch",
          text: "All stops. [She writes it down very carefully.] All stops. Oh, that's poetry. That's the whole city in three words.",
          responses: [{ text: "You're welcome.", next: "done4" }],
        },
        ret4_joke: {
          speaker: "Dot Finch",
          text: "Ooh, dramatic! I'm using it. Tourists love a bit of menace. I'll put the real one in a footnote, you did copy the real one? You did. I can see it on your sleeve.",
          responses: [{ text: "I did.", next: "done4" }],
        },
        done4: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn4();
          },
          text: () =>
            (QX.flag("g_b4") ? "And you PAID YOUR FARE. I could cry. " : "") +
            "Chapter Four is written! And now... the LAST chapter. WILDLIFE OF CENTRAL PARK. " +
            "The North Woods, at the top of the park, has ripjaws. I need a plaster cast of a ripjaw footprint — for scale! Here's the plaster. Sneak in, pour, sneak out. " +
            "If they never even notice you, that's a whole sidebar on stealth.",
          responses: [
            { text: "Ripjaws. You want me near RIPJAWS.", next: "near" },
            { text: "Consider it done.", end: true },
          ],
        },
        near: {
          speaker: "Dot Finch",
          text: "Near their FEET. Totally different part of the ripjaw. The feet have never hurt anyone. Well. Stepped on. The feet have stepped on people.",
          responses: [{ text: "I'll be careful.", end: true }],
        },

        // ---- Chapter V hand-in ----
        ret5: {
          speaker: "Dot Finch",
          text: "Is that... is that the cast? [You set it down on her counter. The counter creaks.] It's ENORMOUS. Oh, I'm going to need a bigger chapter. A bigger BOOK.",
          responses: [
            {
              text: "So the book is finished?",
              action: () => G_.turnIn5(false),
              next: "finale",
            },
          ],
        },
        finale: {
          speaker: "Dot Finch",
          text: () =>
            "It's FINISHED. Five chapters, one foreword, one afterword, and an acknowledgements page that just says \"" +
            QX.pname() +
            '" in very large letters. ' +
            "Here — the first copy. Signed! Well, signed, smudged, and slightly irradiated. " +
            (QX.flag("g_lied")
              ? "Some of the research was... creative, I think, but that's what editors are for. We don't have editors."
              : bonuses() >= 4
                ? "And you did EVERYTHING the hard way. You're not a survivor, you're a KNOW-IT-ALL. I mean that as the highest compliment."
                : "You're a real Big Apple Survivor now."),
          responses: [
            { text: "It was an honour, Dot.", standing: 10, next: "bye" },
            { text: "Next time, pay more.", next: "bye2" },
          ],
        },
        bye: {
          speaker: "Dot Finch",
          text: "The honour was mine! Come back anytime. I'm already planning the sequel: \"The Big Apple Survival Guide 2: Brooklyn.\" ...Don't look at me like that.",
          responses: [{ text: "Goodbye, Dot.", end: true }],
        },
        bye2: {
          speaker: "Dot Finch",
          text: "Next time I WILL pay more! In royalties! Twelve copies at two Scrip each, minus pencils... you're owed nearly a whole note. I'll put it on your tab.",
          responses: [{ text: "Goodbye, Dot.", end: true }],
        },

        after: {
          speaker: "Dot Finch",
          text: [
            "Twelve copies sold! Well, eleven. One was eaten. I'm counting it as a review.",
            "My favourite field researcher! Are you here about the sequel? It's Brooklyn. You'll need a boat. And a helmet. And a second helmet.",
            'People keep coming in asking where the "Scenic Viewpoints" are. I tell them: everywhere, sweetie, if you squint.',
          ],
          responses: [R_BARTER, { text: "Just saying hello.", end: true }],
        },
      },
    });
  });

  // Barks when she sees you come back (first time per chapter hand-in).
  QX.trigger({
    id: "g_dot_wave",
    once: false,
    cooldown: 90,
    pos: () => {
      const a = QX.npc("qx_dot");
      return a && !a.dead ? a.pos : null;
    },
    r: 7,
    cond: () => /_ret$/.test(QX.stage(QID) || ""),
    fire: () =>
      QX.say(
        "qx_dot",
        [
          "There's my researcher!",
          "Ooh! News? You have a news face!",
          "You're back! Tell me EVERYTHING.",
        ][Math.floor(Math.random() * 3)],
      ),
  });
})();
