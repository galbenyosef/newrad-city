// play-inline-570 07 — next
// Lines 1574-1909 of readable/play-inline-570.pretty.js (statement-aligned).
  ms.inject("dlg_neon_capt", {
    start: () =>
      stage("mq32") === "choose" &&
      !raidSite() &&
      batteryKey() === "neon" &&
      !ms.f("kincaid_dead")
        ? "mq32_kin"
        : null,
    nodes: {
      mq32_kin: {
        text: "You heard. Robes at dusk, coming for the Buzz. My guards hold the gates; I need somebody under the stage who isn't afraid of the dark. [She looks at you properly.] And I hear your sharpshooter's got trouble of her own tonight. Your call, topsider. I won't think less of you. Much.",
        responses: [
          {
            text: "I'll hold the Buzz with you.",
            action: () => chooseRaid("battery"),
          },
          { text: "Not yet, Captain." },
        ],
      },
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq32",
      giver: "Rose / Captain Kincaid / Sparks Malloy",
      location: "Tudor City roof, or the battery",
      desc: () =>
        "At dusk the Glowkeepers will strike twice: at " +
        batteryName() +
        ', for the Second Sun\'s twenty-eight volts, and at Tudor City, to take Rose below "for her safety". You can only be in one place.',
      stages: [
        {
          id: "choose",
          text: () =>
            "Choose: defend Rose's roof at Tudor City (with the Unkindled and Sol), or defend " +
            batteryName() +
            ".",
          markers: () => [
            plain(siteLoc("roof"), "Rose's Roof"),
            plain(siteLoc(batteryKey()), SITE[batteryKey()].label),
          ],
          onEnter() {
            if (!captive()) rose.place("home");
            L.later(1.5, () =>
              L.news(
                "Word from the street, listeners: the sun people have been moving in daylight, and they never move in daylight. Lock your doors at dusk. That's not a joke. Rocky doesn't joke about dusk.",
              ),
            );
          },
        },
        {
          id: "raid",
          text: () =>
            "Survive the raid (" +
            raidersDown() +
            "/" +
            RAIDERS.length +
            " Glowkeepers down).",
          markers: () => [
            plain(
              siteLoc(raidKey()),
              raidSite() === "roof" ? "Rose's Roof" : SITE[raidKey()].label,
            ),
          ],
          onEnter() {
            raidStart();
          },
        },
        {
          id: "after",
          text: () =>
            raidSite() === "roof"
              ? "Across the gap, a lantern."
              : "High on One Times Square, a lantern.",
          markers: () => [],
          onEnter() {
            L.later(2.5, () =>
              dawnScene(raidSite() === "roof" ? "roof" : "battery"),
            );
          },
        },
      ],
      rewards: { xp: 700 },
    });
  });
  ms.solver("mq32", {
    choose() {
      L.setFlag("ms_mq32_site", "roof");
      Q.setStage("mq32", "raid");
    },
    raid() {
      endRaid(false);
    },
    after() {
      finishMq32();
    },
  });

  // ==================================================================
  // MQ33 — KEEPER OF THE KEYS (Hollowell, alone in St. Patrick's)
  // ==================================================================
  const SP_FB = { x: 158, z: -342 };
  const ROSE_SP = {
    site: "st_patricks",
    anchors: ["congregation4", "crossing"],
    fallback: SP_FB,
  };
  function giveKey(how) {
    if (!ms.f("hollowell")) ms.set("hollowell", how);
    if (!L.has("q_track61_key")) L.give("q_track61_key", 1);
    ms.set("route_known");
    if (stage("mq33") === "confront") Q.setStage("mq33", "leave");
  }
  function hollowellFight() {
    L.setFlag("ms_mq33_fight", true);
    const a = L.npc("glow_ezra");
    if (a && !a.dead) a.essential = false;
    L.hostile("glow_ezra", true);
  }
  G.events.on("actorKilled", (a) => {
    if (!a || a.id !== "glow_ezra" || !Q.isActive("mq33")) return;
    ms.set("hollowell", "dead");
    L.notify(
      "You take a long brass key on a loop of altar cord from his robe. On a card in the same pocket, in a careful hand: M-61, WALDORF. OR 42nd ST, THE BULKHEAD.",
      { duration: 7 },
    );
    giveKey("dead");
  });
  function sendChildren() {
    if (ms.f("children_sent")) return;
    ms.set("children_sent");
    L.xp(120, "Sent the children north");
    L.standing(60, "The cult's children sent out of the city");
  }
  ms.inject("dlg_glow_ezra", {
    start: () =>
      stage("mq33") === "confront"
        ? "mq33_open"
        : stage("mq33") === "leave" ||
            (Q.isComplete("mq33") && !Q.isComplete("mq35"))
          ? "mq33_after"
          : null,
    nodes: {
      mq33_open: {
        text: () =>
          "[The cathedral is empty. The pews are stacked against the walls, the sun disc has come down off the altar, and every candle in the place has been carried below. Keeper Hollowell sits alone on the altar step with a ring of keys in his lap.]\n\n" +
          (rosePresent()
            ? "[He looks past you, at Rose, and his whole face changes.] Little Sun. You came home."
            : "You came alone. They brought the Little Sun down the night of the raid. [He turns a key over and over.] She did not come quietly. She never did anything quietly."),
        responses: [
          {
            text: "[Rose steps forward.]",
            cond: () => rosePresent(),
            next: "mq33_dont",
          },
          {
            text: "I need the way down to Track 61, Keeper.",
            cond: () => !rosePresent(),
            next: "mq33_keys",
          },
        ],
      },
      mq33_dont: {
        speaker: "Rose",
        text: "Don't.",
        responses: [
          {
            text: "[To Hollowell] The way down to Track 61, Keeper.",
            next: "mq33_keys",
          },
        ],
      },
      mq33_keys: {
        text: () =>
          "[He holds up one key from the ring: long, brass, on a loop of altar cord.] Sunday. Alone. She asked for alone. " +
          (ms.f("glow") === "convinced"
            ? "[He looks at it, and then at you.] You spoke plainly to me once, about a blessing forced on people who never asked for it. I have prayed on that every night since, and my prayers have started to sound like you."
            : "I have kept this key for eighteen years. I am not sure I know how to stop."),
        responses: [
          {
            text: "Give me the key, Ezra.",
            cond: () => ms.f("glow") === "convinced",
            next: "mq33_ally",
          },
          {
            text: "[Persuasion 60] The Light you preach doesn't ask anyone to hide a bomb under a train station. Give me the key.",
            cond: () => ms.f("glow") !== "convinced",
            check: { skill: "persuasion", value: 60 },
            next: "mq33_given",
            failNext: "mq33_no",
          },
          {
            text: () => "Rose. Ask him.",
            cond: () =>
              ms.f("glow") !== "convinced" && rosePresent() && ms.trust() >= 3,
            next: "mq33_rose_asks",
          },
          {
            text: "Then I'll take it off you.",
            cond: () => ms.f("glow") !== "convinced",
            next: "mq33_fight",
          },
          {
            text: "Who is she, Ezra? The Dawn. What's her name?",
            next: "mq33_name",
          },
        ],
      },
      mq33_name: {
        text: "[He closes his hand over the key.] No. Not from me. You should see her face before you hear it. [Something in his voice is almost kind.] Trust an old man on that one thing.",
        responses: [{ text: "The key, then.", next: "mq33_keys" }],
      },
      mq33_ally: {
        text: "[He puts the key in your palm and folds your fingers over it with both his hands.] Two doors go down. The Waldorf's freight shaft, M-61, welded since the year the Little Sun ran; this opens the hatch. Or the bulkhead under 42nd Street, past the old lower-level stair. [He doesn't let go yet.] I will come down after you and talk the young ones out of the fight, if they will hear me. And I am asking you, as a man who has nothing left to ask with: bring her out alive.",
        onEnter() {
          ms.set("hollowell", "ally");
          giveKey("ally");
        },
        responses: [
          { text: "I'll try.", next: "mq33_children" },
          { text: "I can't promise that.", next: "mq33_children" },
        ],
      },
      mq33_given: {
        text: "[A long silence. Then he laughs, once, tiredly.] Under a train station. When you say it like that. [He works the key off the ring and holds it out.] The Waldorf's freight shaft, M-61; this opens the welded hatch. Or the bulkhead under 42nd Street, past the old lower-level stair. Go whichever way you like. She will know you are coming either way.",
        onEnter() {
          ms.set("hollowell", "given");
          giveKey("given");
        },
        responses: [{ text: "Thank you, Keeper.", next: "mq33_children" }],
      },
      mq33_rose_asks: {
        speaker: "Rose",
        text: "[She doesn't step closer. She doesn't have to.] Ezra. You carried me up the steps of this church on your shoulders every Easter. You taught me my letters off the hymn board. [Her voice doesn't shake. Her hand does.] Give him the key.",
        responses: [{ text: "[Wait.]", next: "mq33_rose_given" }],
      },
      mq33_rose_given: {
        text: "[The old man bows his head over the key for a long time. When he holds it out, he holds it out to her, and she has to nod at you before he will let you take it.] The Waldorf shaft, M-61, or the bulkhead under 42nd Street. Little Sun. Whatever you are going down there to do, I loved you before you could walk.",
        onEnter() {
          ms.set("hollowell", "given");
          giveKey("given");
        },
        responses: [{ text: "[Take the key.]", next: "mq33_children" }],
      },
      mq33_no: {
        text: "Persuasion is my trade, child, and you are not very good at it. [He closes his hand.] No.",
        responses: [
          { text: "Then I'll take it off you.", next: "mq33_fight" },
          { text: "Who is she, Ezra?", next: "mq33_name" },
          { text: "[Walk away for now.]" },
        ],
      },
      mq33_fight: {
        text: "[He stands up slowly, an old man in heavy vestments, and lets the ring of keys fall to the altar step behind him.] Then take it. I will not make it easy, and I will not make it hard. I am too old for either.",
        responses: [
          { text: "[Fight him.]", action: () => hollowellFight() },
          { text: "[Wait. Not like this.]", next: "mq33_keys" },
        ],
      },
      mq33_children: {
        text: "[He glances at the crypt stairs.] The children are below us with Sister Noonday. Thirty-one of them. Their parents went down to the Sun Room on Wednesday; the children were not invited. If you have any mercy in you, tell Noonday to take them north tonight, up the river, as far as their feet will go.",
        onEnter() {
          L.setFlag("ms_mq33_children_known", true);
        },
        responses: [{ text: "I'll talk to her." }, { text: "[Leave.]" }],
      },
      mq33_after: {
        text: () =>
          ms.f("hollowell") === "ally"
            ? "Go on. I will be on the platform before the young ones are. Bring her out alive."
            : "[He is sitting where you left him, turning a ring with one key missing.] Sunday. Alone. You will do what you like. Everyone always has.",
        responses: [{ text: "[Leave him.]" }],
      },
    },
  });
  ms.inject("dlg_glow_sister", {
    start: () =>
      (Q.isActive("mq33") || (Q.isComplete("mq33") && !Q.isStarted("mq35"))) &&
      !ms.f("children_sent")
        ? "mq33_noon"
        : null,
    nodes: {
      mq33_noon: {
        text: "[Sister Noonday is sitting on the crypt stairs with a child asleep across her knees. More of them below, in blankets, between the tombs.] Shh. They only just went down. [She looks up at you.] The Keeper sent you. He has that look on his face these days, like a man reading his own will.",
        responses: [
          {
            text: "Take the children out of the city. Tonight. North, up the river.",
            next: "mq33_noon_yes",
          },
          { text: "Let me see what you have.", barter: true },
          { text: "Never mind." },
        ],
      },
      mq33_noon_yes: {
        text: "[She doesn't argue. She doesn't even ask why, which tells you she already knows.] Thirty-one of them, and me, and a handcart. [She lifts the sleeping child onto her shoulder.] We'll be past the Harlem by morning. If anybody asks, we were never here. The Noon be on you. ...No. Just: be careful.",
        onEnter() {
          sendChildren();
        },
        responses: [{ text: "Go safely, Sister." }],
      },
    },
  });
  ms.dlg("dlg_ms_rose")
    .add({
      mq33_here: {
        speaker: "Rose",
        text: "[She is standing just inside the doors, rifle slung, not looking at the altar.] Not since I was sixteen. [A breath.] I'm here. Don't make me say anything to him.",
        responses: [{ text: "You don't have to say a word." }],
      },
    })
    .when(() => (stage("mq33") === "confront" ? "mq33_here" : null));
  // A dead Keeper (from earlier): his keys lie on the altar step.
  ms.spot({
    id: "ms5_ezra_keys",
    when: () =>
      stage("mq33") === "confront" &&
      !!L.flag("dead_glow_ezra") &&
      !L.has("q_track61_key"),
    at: {
      site: "st_patricks",
      anchors: ["altar", "preacher", "pulpit"],
      fallback: { x: 168, z: -342 },
    },
    label: "Ring of Keys",
    verb: "Take",
    radius: 1.4,
    use() {
      L.notify(
        "A ring of keys on the altar step, and on one long brass key a card: M-61, WALDORF. OR 42nd ST, THE BULKHEAD.",
        { duration: 6 },
      );
      giveKey("dead");
    },
  });

