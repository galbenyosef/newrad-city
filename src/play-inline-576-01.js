// play-inline-576 01 — flag
// Lines 20-273 of readable/play-inline-576.pretty.js (statement-aligned).
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
