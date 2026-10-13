// play-inline-577 02 — label
// Lines 96-443 of readable/play-inline-577.pretty.js (statement-aligned).
  QX.hook("quests", function () {
    // ---------------------------------------------------------------- Franks
    QX.define({
      id: "qx_franks",
      name: "A Frank Exchange of Views",
      giver: "Iggy Bellini / Mort Feldstein",
      location: "Grand Central Market",
      order: 41,
      desc:
        "Two hot-dog vendors have been parked on either side of Grand Central's front door for eleven years, sharing a supplier, a wall and a " +
        "hatred you could bottle. Each would pay handsomely to see the other gone. Someone could also try getting them to shake hands.",
      stages: [
        {
          id: "feud",
          text: "Settle the feud between Iggy and Mort, the hot-dog vendors outside Grand Central.",
          markers: () => [
            { npc: "qx_iggy", label: "Iggy Bellini" },
            { npc: "qx_mort", label: "Mort Feldstein" },
          ],
        },
        {
          id: "sab_mort",
          text: "Slip Iggy's doctored mustard into Mort's cart.",
          markers: () => [{ npc: "qx_mort", label: "Mort's cart" }],
        },
        {
          id: "sab_iggy",
          text: "Slip Mort's \"special\" relish into Iggy's cart.",
          markers: () => [{ npc: "qx_iggy", label: "Iggy's cart" }],
        },
        {
          id: "ret_iggy",
          text: "Collect your payment from Iggy.",
          markers: () => [{ npc: "qx_iggy", label: "Iggy Bellini" }],
        },
        {
          id: "ret_mort",
          text: "Collect your payment from Mort.",
          markers: () => [{ npc: "qx_mort", label: "Mort Feldstein" }],
        },
        {
          id: "merge_mort",
          text: "Iggy will consider a partnership. Convince Mort.",
          markers: () => [{ npc: "qx_mort", label: "Mort Feldstein" }],
        },
        {
          id: "merge_iggy",
          text: "Mort will consider a partnership. Convince Iggy.",
          markers: () => [{ npc: "qx_iggy", label: "Iggy Bellini" }],
        },
        {
          id: "done_merge",
          complete: true,
          text: "Iggy & Mort's Genuine Coney Island Kosher-Style Franks is open for business. The argument about cinnamon continues.",
        },
        {
          id: "done_iggy",
          complete: true,
          text: "Mort went home sick and never came back. Iggy has the front door to himself.",
        },
        {
          id: "done_mort",
          complete: true,
          text: "Iggy went home sick and never came back. Mort has the front door to himself.",
        },
        {
          id: "o_secret",
          sideObjective: true,
          text: "(Optional) Find out where both vendors get their meat.",
          doneIf: () => !!QX.flag("franks_secret"),
          showIf: () =>
            QX.stage("qx_franks") === "feud" ||
            /^merge/.test(QX.stage("qx_franks") || ""),
        },
      ],
      rewards: { xp: 125 },
    });

    // ---------------------------------------------------------------- Extra! Extra!
    // MUNI-7 turned on you / scrapped (No Standing Anytime): its subscription is cancelled — the route is two stops, not a soft-lock
    const subGone = (k) =>
      k === "muni" &&
      (QX.stage("qx_parking") === "scrap" ||
        QX.stage("qx_parking") === "done_scrap");
    const delivered = () =>
      ["penn", "edna", "muni"].filter((k) => QX.flag("gaz_" + k) || subGone(k))
        .length;
    QX.define({
      id: "qx_extra",
      name: "Extra! Extra!",
      giver: "Scoop Moretti",
      location: "Sixth Avenue & 42nd Street",
      order: 42,
      desc:
        "Scoop Moretti hawks the Manhattan Clarion on Sixth Avenue and will not hear a word about the Neon's showbiz rag. He has three subscribers left and no legs left to reach them. The Clarion " +
        "must go through. Subscribers pay their dues on delivery.",
      stages: [
        {
          id: "deliver",
          text: () =>
            "Deliver the Manhattan Clarion to Scoop's three subscribers (" +
            delivered() +
            "/3).",
          markers: () => {
            const m = [];
            if (!QX.flag("gaz_penn"))
              m.push({
                npc: "qx_pennington",
                label: "Subscriber: Harold Pennington",
              });
            if (!QX.flag("gaz_edna"))
              m.push({ npc: "qx_edna", label: "Subscriber: Edna Vukovich" });
            if (!QX.flag("gaz_muni") && !subGone("muni"))
              m.push({ npc: "qx_muni7", label: "Subscriber: MUNI-7" });
            return m;
          },
        },
        {
          id: "return",
          text: "Return to Scoop with the subscription dues.",
          markers: () => [{ npc: "qx_scoop", label: "Scoop Moretti" }],
        },
        {
          id: "done",
          complete: true,
          text: () =>
            QX.flag("extra_kept")
              ? "You told Scoop the subscribers didn't pay, and kept the dues. The Clarion will fold within the month."
              : "The Clarion went through. Scoop is already writing tomorrow's headline, which is about you.",
        },
      ],
      rewards: { xp: 100 },
    });

    // ---------------------------------------------------------------- Last Stop
    QX.define({
      id: "qx_commute",
      name: "Last Stop",
      giver: "Harold Pennington",
      location: "Park Avenue & 38th Street",
      order: 43,
      desc:
        "Harold Pennington, actuary, has been waiting for the 9:47 M42 crosstown bus at Park Avenue and 38th Street since Sunday morning, " +
        "March 5th, 1967 (quarter-end waits for no one, not even the Sabbath). He is sixty-three now, and every morning he is back at the stop. He has not noticed. The bus is running a little late.",
      stages: [
        {
          id: "talk",
          text: "Talk to Harold Pennington about his bus.",
          markers: () => [{ npc: "qx_pennington", label: "Harold Pennington" }],
        },
        {
          id: "find",
          text: "Find out what happened to the 9:47 M42 bus. It should be somewhere down Park Avenue.",
          markers: () =>
            QX.flag("got_penn_timetable") || QX.has("qx_m42_timetable")
              ? []
              : [
                  {
                    x: SPOT.busWreck.x,
                    z: SPOT.busWreck.z,
                    label: "The M42 bus",
                  },
                ],
        },
        {
          id: "tell",
          text: "Show Harold Pennington the M42 timetable.",
          markers: () => [{ npc: "qx_pennington", label: "Harold Pennington" }],
        },
        {
          id: "done_home",
          complete: true,
          text: "Harold Pennington finally stopped waiting. He walked to Grand Central, where the ceiling reminds him of the sky before it went strange.",
        },
        {
          id: "done_wait",
          complete: true,
          text: "You told Harold the bus was on its way. He is still waiting. He will always be waiting.",
        },
      ],
      rewards: { xp: 100 },
    });

    // ---------------------------------------------------------------- No Standing Anytime
    QX.define({
      id: "qx_parking",
      name: "No Standing Anytime",
      giver: "MUNI-7",
      location: "5th Avenue",
      order: 44,
      desc:
        "MUNI-7, a Department of Traffic enforcement Patrolman robot, has been ticketing the wrecked cars of 5th Avenue for twenty-two years. " +
        "It has now ticketed you. The fine is $1,967.",
      stages: [
        {
          id: "fine",
          text: "Deal with MUNI-7's parking citation.",
          markers: () => [{ npc: "qx_muni7", label: "MUNI-7" }],
        },
        {
          id: "scrap",
          text: 'MUNI-7 is "escalating enforcement". Destroy it.',
          markers: () => [{ npc: "qx_muni7", label: "MUNI-7" }],
        },
        {
          id: "done_paid",
          complete: true,
          text: "You paid the fine. MUNI-7 thanks you for your civic contribution and has already ticketed a skeleton.",
        },
        {
          id: "done_talk",
          complete: true,
          text: 'MUNI-7 recognized your "diplomatic immunity". It salutes you whenever you pass.',
        },
        {
          id: "done_good",
          complete: true,
          text: "You rewrote MUNI-7's directives. It now protects the people of 5th Avenue instead of fining them — and handed over the impound locker key.",
        },
        {
          id: "done_evil",
          complete: true,
          text: "You rewrote MUNI-7's directives. It now fines everyone on 5th Avenue and deposits the collections in the impound locker. For you.",
        },
        {
          id: "done_scrap",
          complete: true,
          text: "MUNI-7 has been permanently decommissioned. The impound locker key was in its evidence tray.",
        },
      ],
      rewards: { xp: 75 },
    });

    // ---------------------------------------------------------------- Mister Buttons
    QX.define({
      id: "qx_buttons",
      name: "Mister Buttons",
      giver: "Edna Vukovich",
      location: "5th Avenue & 23rd Street",
      order: 45,
      desc:
        "Edna Vukovich's pet burrow rat, Mister Buttons, has run away again. He was last seen heading south toward Union Square, which is where " +
        "he goes when he feels unappreciated.",
      stages: [
        {
          id: "find",
          text: "Find Mister Buttons. He was last seen near Union Square.",
          markers: () => [
            {
              x: SPOT.buttons.x + 4,
              z: SPOT.buttons.z - 6,
              label: "Last seen: Union Square",
            },
          ],
        },
        {
          id: "escort",
          text: "Bring Mister Buttons home to Edna.",
          markers: () => [{ npc: "qx_edna", label: "Edna Vukovich" }],
        },
        {
          id: "return",
          text: "Tell Edna that Mister Buttons is home.",
          markers: () => [{ npc: "qx_edna", label: "Edna Vukovich" }],
        },
        {
          id: "done",
          complete: true,
          text: "Mister Buttons is home. Edna has baked you cookies. The cookies are very hard.",
        },
        {
          id: "sold",
          complete: true,
          text: "You sold Mister Buttons to a hot-dog vendor. Edna still leaves a saucer out for him. Try the coney dogs.",
        },
      ],
      rewards: { xp: 100 },
    });

    // ---------------------------------------------------------------- To Glow, or Not to Glow
    const pagesHave = () =>
      [1, 2, 3].filter(
        (i) => QX.has("qx_script_page_" + i) || QX.flag("bix_page_" + i),
      ).length;
    QX.define({
      id: "qx_bixby",
      name: "To Glow, or Not to Glow",
      giver: "Bartholomew Bixby",
      location: "Times Square",
      order: 46,
      desc:
        'Bartholomew Bixby, septuagenarian, tragedian, and the last working actor on Broadway, is mounting a one-man "Hamlet of Hoboken" north of ' +
        "Times Square. A gust of wind has scattered his only script across Midtown. The show must go on. The show cannot go on without the script.",
      stages: [
        {
          id: "pages",
          text: () =>
            "Find Bixby's three missing script pages (" + pagesHave() + "/3).",
          markers: () =>
            SPOT.pages
              .map((p, i) =>
                QX.has("qx_script_page_" + (i + 1)) ||
                QX.flag("bix_page_" + (i + 1))
                  ? null
                  : { x: p.x, z: p.z, label: "Script Page" },
              )
              .filter(Boolean),
        },
        {
          id: "return",
          text: "Return the script pages to Bartholomew Bixby.",
          markers: () => [{ npc: "qx_bixby", label: "Bartholomew Bixby" }],
        },
        {
          id: "show",
          text: 'Watch Bixby\'s performance of "Hamlet of Hoboken".',
          markers: () => [{ npc: "qx_bixby", label: "Bartholomew Bixby" }],
        },
        {
          id: "done",
          complete: true,
          text: () =>
            QX.flag("bix_costar")
              ? "You played Horatio opposite Bartholomew Bixby. The reviews were mixed. The review was Scoop."
              : 'Bixby performed "Hamlet of Hoboken" to an audience of you, two retired chorus girls and a very attentive burrow rat.',
        },
        {
          id: "torn",
          text: "You tore up Bixby's script in front of him. There will be no show.",
        },
      ],
      rewards: { xp: 125 },
      onFail() {
        QX.standing(-50, "Ruined Bixby's show");
      },
    });
    QX.misc = { delivered, pagesHave };
  });

  // ==================================================================
  // NPCs
  // ==================================================================
  const FRANK_STOCK_I = [
    ["coney_dog", 10],
    ["egg_cream", 4],
    [FIZZO, 3],
    ["purified_water", 2],
  ];
