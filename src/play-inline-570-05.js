// play-inline-570 05 — flag
// Lines 887-1227 of readable/play-inline-570.pretty.js (statement-aligned).
  ms.dlg("dlg_ms_rose")
    .add({
      mq31_sugar: {
        speaker: "Rose",
        text: "[You tell her about the page in Brault's diary: a woman from the tunnels in 1970, a girl of three on her hip, a sugar cube.] [She is quiet for a while.] I remember a man with a moustache giving me a sugar cube. I thought it was a dream.",
        onEnter() {
          ms.set("mq31_sugar");
        },
        responses: [
          { text: "It wasn't." },
          { text: "Did you eat it?", next: "mq31_sugar2" },
        ],
      },
      mq31_sugar2: {
        speaker: "Rose",
        text: "No. I kept it in my pocket until it went to sand. [Almost a laugh.] I was three. Don't look at me like that.",
        responses: [{ text: "[Let it be.]" }],
      },
    })
    .when(() =>
      !captive() &&
      (L.has("ms_note_brault_1970") || L.flag("got_ms_brault_page")) &&
      !ms.f("mq31_sugar") &&
      stage("mq32") !== "choose" &&
      stage("mq34") !== "rose" &&
      !Q.isStarted("mq35")
        ? "mq31_sugar"
        : null,
    );

  L.hook("init", function () {
    ms.quest({
      id: "mq31",
      giver: "Mademoiselle Lys / Delorme's beacon",
      location: "Chinatown, under the Golden Dragon",
      desc: () =>
        "The cipher wheel wants a word, and the word is in Bureau Sept's SIROCCO codebook. Unless Corbeau's copy was seized on Liberty, the only copy left in the city is in the buried French listening post under the Golden Dragon, and the Glowkeepers are digging toward it from the kitchen.",
      stages: [
        {
          id: "lead",
          text: () =>
            ms.f("codebook_taken")
              ? "The SIROCCO codebook was taken on Liberty. The Glowkeepers will not get the word."
              : lysGuides()
                ? "Ask Mademoiselle Lys at Grand Central where the other codebook is."
                : "Follow Delorme's beacon to Chinatown.",
          markers: () =>
            lysGuides() ? [{ npc: "bs_lys", label: "Mademoiselle Lys" }] : [],
          onEnter() {
            if (ms.f("codebook_taken")) {
              ms.set("sun_word_denied");
              L.later(1, () =>
                ms.say(
                  "Rose",
                  "Corbeau's book went into the harbour with the rest of Liberty's evidence. The Dragon's copy is just paper now; without the date page they can't use it. One less thing.",
                ),
              );
              Q.complete("mq31");
              return;
            }
            if (!lysGuides()) {
              L.news(
                "Strange one tonight, listeners. Under the static, down around Canal Street, there's a voice reading numbers. In French. Same voice, same numbers, twenty-two years. Rocky's theory? Somebody down there is still waiting for a call back.",
              );
              Q.setStage("mq31", "post");
            }
          },
        },
        ms.proxy("mq31", "pv_red_star", {
          id: "post",
          text: "Find the storeroom passage under the Golden Dragon in Chinatown and get into the listening post. Deal with Commandant Delorme.",
          next: "codebook",
          reach: {
            site: "chinatown",
            anchors: ["door", "gate", "entrance"],
            fallback: { x: 160, z: 506 },
            label: "The Golden Dragon",
          },
        }),
        {
          id: "codebook",
          text: () =>
            codebookDone()
              ? "The codebook is settled, one way or the other."
              : "Take or burn the SIROCCO codebook in the Commandant's office before the Glowkeepers break through.",
          markers: () =>
            codebookDone()
              ? []
              : [
                  {
                    anchor: ["chinatown", ["boss", "transmitter"]],
                    fallback: POST_FB,
                    label: "Cipher Safe",
                  },
                ],
          onEnter() {
            if (codebookDone())
              L.later(0.5, () => {
                if (stage("mq31") === "codebook") Q.complete("mq31");
              });
          },
        },
        {
          id: "race",
          text: "(Optional) Stop the Glowkeeper digging crew.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_mq31_breach") && !codebookDone(),
          doneIf: () => !!L.flag("ms_mq31_held"),
          failIf: () => !!ms.f("sun_word_glow"),
        },
        {
          id: "brault",
          text: "(Optional) Read Sgt. Brault's loose diary page.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_mq31_race"),
          doneIf: () =>
            L.has("ms_note_brault_1970") || !!L.flag("got_ms_brault_page"),
        },
      ],
      rewards: { xp: 650 },
      onComplete() {
        if (ms.f("sun_word_denied"))
          L.later(2, () =>
            ms.say("Rose", "No word, no wheel. That's one of three. Good."),
          );
        else if (ms.f("sun_word_glow"))
          L.later(2, () =>
            ms.say(
              "Rose",
              "They've got the word. Fine. Then they still need two keys and a battery. We take those.",
            ),
          );
      },
    });
  });
  // Lys gone (dead / left the city) while she was the lead: the beacon points the way instead.
  L.trigger({
    id: "ms5_lys_lost",
    once: false,
    cooldown: 3,
    cond: () =>
      stage("mq31") === "lead" &&
      (!!L.flag("dead_bs_lys") || ms.f("bureau") !== "sell"),
    fire() {
      Q.setStage("mq31", "post");
    },
  });
  ms.solver("mq31", {
    lead() {
      Q.setStage("mq31", "post");
    },
    post() {
      codebook("take");
      if (Q.get("pv_red_star")) Q.complete("pv_red_star");
      else Q.setStage("mq31", "codebook");
    },
    codebook() {
      codebook("take");
      if (Q.isActive("mq31")) Q.complete("mq31");
    },
  });

  // ==================================================================
  // MQ32 — BLACKOUT (the double raid at dusk)
  // ==================================================================
  const RAID_MAX = 180; // game seconds (near the site) before the survivors fall back
  const RAIDERS = [
    "ms_bo_r1",
    "ms_bo_r2",
    "ms_bo_r3",
    "ms_bo_r4",
    "ms_bo_r5",
    "ms_bo_r6",
  ];
  const SITE = {
    roof: {
      site: "tudor_city",
      anchors: ["rose_nook", "ext_roof"],
      fallback: { x: 316, z: -168 },
      label: "Rose's Roof",
    },
    neon: {
      site: "times_square",
      anchors: ["stage", "center"],
      fallback: { x: -40, z: -262 },
      label: "The Big Buzz",
    },
    covenant: {
      site: "rockefeller",
      anchors: ["rig_gantry", "workbench", "commander"],
      fallback: { x: 80, z: -320 },
      label: "The Rig Battery (Rockefeller)",
    },
    tap: {
      site: "times_square",
      anchors: ["subway"],
      fallback: { x: -60, z: -228 },
      label: "The Tunnel Tap",
    },
  };
  const batteryKey = () => {
    const b = ms.f("sun_battery");
    return b === "neon" ? "neon" : b === "covenant" ? "covenant" : "tap";
  };
  const raidSite = () => L.flag("ms_mq32_site") || null; // 'roof' | 'battery'
  const raidKey = () => (raidSite() === "roof" ? "roof" : batteryKey());
  const siteLoc = (k) => {
    const s = SITE[k];
    return L.anchor(s.site, s.anchors, s.fallback);
  };
  const raidOver = () => !!L.flag("ms_mq32_raid_over");
  const raidersDown = () =>
    RAIDERS.filter((id) => !!L.flag("dead_" + id)).length;
  const batteryName = () =>
    ({
      neon: "the Neon's battery under the stage at Times Square",
      covenant: "the rig battery at Rockefeller Center",
      tap: "the tunnel tap on the Neon's mains",
    })[batteryKey()];

  function chooseRaid(where) {
    if (raidSite() || stage("mq32") !== "choose") return;
    L.setFlag("ms_mq32_site", where);
    const h = G.time ? G.time.hour : 18;
    const dusk = () => {
      if (!(h >= 17.5 && h < 21.5)) passTo(18.6, false);
    };
    fade(() => {
      dusk();
      L.notify(
        where === "roof"
          ? "You take a position on the roof under the dead letters of the sign and wait for the light to go."
          : "You take a position by the battery and wait for the light to go.",
        { duration: 5 },
      );
    }, 1.0);
    L.later(1.4, () => Q.setStage("mq32", "raid"));
  }
  function raidStart() {
    L.setFlag("ms_mq32_raid_t", 0);
    if (raidKey() === "neon") setEssential("neon_capt", false);
    L.later(0.4, ms.pollRoster);
    const k = raidKey();
    const line =
      k === "roof"
        ? [
            "Rose",
            "Here they come. Up the stairs and over the parapet. Jory, Pockets: the door. Beanie, Ash: with me. Nobody gets taken tonight.",
          ]
        : k === "neon"
          ? [
              "Captain Mercy Kincaid",
              "Robes on the west gate! Guard, on me! Nobody touches the Buzz!",
            ]
          : k === "covenant"
            ? [
                "Lancer Ibarra",
                "Contact, north side! Hold the gantry! Iron keeps!",
              ]
            : [
                "Sparks Malloy",
                "(on the guard's radio) They're at the tap! Don't let them cut the feed, and for God's sake don't let them cut YOU, the cable's live!",
              ];
    L.later(1.2, () => ms.say(line[0], line[1]));
    L.hint(
      "ms5_raid",
      "Hold your ground until the raid breaks. Your allies fight beside you.",
      3,
    );
    if (!G.isStub("music") && G.music.setMood) {
      try {
        G.music.setMood("combat");
      } catch (e) {
        /* */
      }
    }
  }
  function endRaid(lost) {
    if (raidOver()) return;
    L.setFlag("ms_mq32_raid_over", true);
    const k = raidKey();
    if (k === "neon") {
      const kin = L.npc("neon_capt");
      if (lost && kin && !kin.dead) {
        kin.essential = false;
        if (kin.kill) {
          try {
            kin.kill();
          } catch (e) {
            /* */
          }
        }
        ms.set("kincaid_dead");
      } else setEssential("neon_capt", true);
    }
    if (raidSite() === "roof") {
      ms.set("rose_defended");
      ms.addTrust(2, "You held her roof");
      ms.set("battery_lost");
      L.notify(
        "The raiders break and run for the stairs. Somewhere across Midtown, at the same moment, the other raid is going the other way: " +
          batteryName() +
          " is lost.",
        { duration: 7 },
      );
    } else {
      ms.set("rose_captive");
      rose.place("gone");
      if (lost) ms.set("battery_lost");
      L.notify(
        lost
          ? "The raid is over and it went badly. The robes melt back into the tunnels with what they came for."
          : "The raid breaks. The battery is still here, still humming.",
        { duration: 6 },
      );
      L.later(5, () =>
        ms.say(
          "Sol",
          "(a runner, out of breath, with Sol's words) They came up the Tudor stairs while you were gone. Six of them, in the good robes. She shot two. They took her below. For her safety, they said.",
        ),
      );
    }
    Q.setStage("mq32", "after");
  }
  function raidUpdate(dt) {
    if (stage("mq32") !== "raid" || raidOver()) return;
    const c = siteLoc(raidKey());
    if (!c || dist2(c) > 110) return;
    const t = (Number(L.flag("ms_mq32_raid_t")) || 0) + dt;
    L.setFlag("ms_mq32_raid_t", t);
    const down = raidersDown();
    if (down !== (L.flag("ms_mq32_down") || 0)) {
      L.setFlag("ms_mq32_down", down);
      L.refresh("mq32");
    }
    if (down >= RAIDERS.length) endRaid(false);
    else if (t >= RAID_MAX) endRaid(RAIDERS.length - down >= 4);
  }
  // the raiders and the battery-side allies (spawned while the raid runs)
