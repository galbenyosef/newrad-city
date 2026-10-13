// play-inline-567 10 — next
// Lines 2422-2750 of readable/play-inline-567.pretty.js (statement-aligned).
  RD.add({
    // ---- one-offs (Act II) ----
    mq13_planted: {
      speaker: () => ms.roseName(),
      text: "[She doesn't get up.] Grand Central's taps glow. Okafor's got kids drinking river water out of buckets. [She looks at you, finally.] You're one of them.",
      onEnter() {
        L.setFlag("ms_rose_said_planted");
      },
      responses: [
        { text: "It's not what you think.", next: "mq13_planted2" },
        { text: "[Say nothing.]" },
      ],
    },
    mq13_planted2: {
      text: "It never is. [She goes back to cleaning her rifle.]",
      responses: [{ text: "[Leave her be.]" }],
    },
    mq13_glow: {
      speaker: () => ms.roseName(),
      text: () =>
        L.flag("ms_glow") === "convinced"
          ? "Heard the Keeper sent his lead box back down the stairs. Heard somebody talked him into it. [She almost smiles.] Hollowell doesn't change his mind. He must have liked you."
          : "Okafor's got two guards on her water tower and a third one guarding the guards. Word is a sleeper told her. [A shrug.] ...Okay. That was okay.",
      onEnter() {
        L.setFlag("ms_rose_said_glow");
      },
      responses: [{ text: "Thanks, Flint." }],
    },
    mq13_riot: {
      speaker: () => ms.roseName(),
      text:
        "[You tell her what Crowe told you: the line at the Relief Station, the match, eleven children. She checks the bolt of her rifle for much longer than a bolt needs checking.] " +
        "Everybody under Grand Central has a riot story. Mine's short. I was too young to have one.",
      onEnter() {
        L.setFlag("ms_rose_said_riot");
      },
      responses: [{ text: "[Let it go.]" }],
    },
    mq14_jam: {
      speaker: () => ms.roseName(),
      text: "Rocky's tubes stopped cooking. I've been swapping them every week since the Waldorf put that thing on the roof. [She looks at you sideways.] That you? ...Thanks. Don't tell him I said thanks; he'll want a hug.",
      onEnter() {
        L.setFlag("ms_rose_said_jam");
      },
      responses: [{ text: "Your secret's safe." }],
    },
    mq15_chin: {
      speaker: () => ms.roseName(),
      text:
        "[You tell her Lys said to ask whose chin she has. Her hand goes to her chin before she can stop it.] " +
        "Lys says a lot of things for five scrip a page. [She turns to the sign and starts checking connections that don't need checking.] She's French. They think everything's a love story.",
      onEnter() {
        L.setFlag("ms_rose_said_chin");
      },
      responses: [{ text: "[Let it go. For now.]" }],
    },
    mq16_nell: {
      speaker: () => ms.roseName(),
      text: "[You ask whether the name Nell Brady means anything to her.] Never heard of her. [Too fast. She hears it too, and doesn't fix it.]",
      onEnter() {
        L.setFlag("ms_rose_said_nell");
      },
      responses: [{ text: "[Let it go.]" }],
    },
    // ---- mq17 ----
    mq17_rc: {
      speaker: () => ms.roseName(),
      text:
        "[Flint is elbow-deep in the back of Rocky's transmitter, swapping tubes.] Don't look at me like that. I run his tubes. He pays in batteries and bad jokes. " +
        "...You're taking a bearing on the Dawn Hour. [A pause that goes on a little too long.] Five forty-seven. Don't be late. She never is.",
      onEnter() {
        L.setFlag("ms_rose_mq17_rc");
      },
      responses: [
        { text: "You listen to it?", next: "mq17_rc2" },
        { text: "See you at five forty-seven." },
      ],
    },
    mq17_rc2: {
      text: "I wake up for it. Every morning. Can't help it. It's like a dripping tap.",
      responses: [{ text: "[Leave her to the tubes.]" }],
    },
    mq17_after: {
      speaker: () => ms.roseName(),
      text: "[You tell her she knew that sermon before it came.] Everybody under Grand Central knows it by heart. It's on every morning. I don't sleep past five forty-seven. [She snaps a tube into its socket harder than she needs to.] Bad habit.",
      onEnter() {
        L.setFlag("ms_rose_mq17_after");
      },
      responses: [{ text: "[Let it go.]" }],
    },
    // ---- mq18 ----
    mq18_start: {
      speaker: () => ms.roseName(),
      text:
        "[Flint is sitting on the gantry under the red TUDOR CITY letters, her rifle across her knees. She doesn't look round.] " +
        "You've been busy. Wren's book. The Neon. The Waldorf. Blackwell's. Rocky's radio. [She slings the rifle.] There's something you ought to see. St. Patrick's. The garden, not the church. " +
        "I said I'd never go back there, so walk slow, and don't ask me anything on the way.",
      responses: [
        { text: "Lead the way.", action: () => startWalk() },
        { text: "Not now." },
      ],
    },
    mq18_walk: {
      speaker: () => ms.roseName(),
      text: "Garden's on the north side. Inside the railings. Keep walking.",
      responses: [{ text: "[Keep walking.]" }],
    },
    mq18_atstone: {
      speaker: () => ms.roseName(),
      text: "Go on. Read it.",
      responses: [{ text: "[Go to the stone.]" }],
    },
    mq18_confront: {
      speaker: () => ms.roseName(),
      text: "[Flint stands a little way off from the stone with her back to the cathedral, the leather cuff pulled down over her left wrist. She is watching you, not the stone.]",
      responses: [
        { text: "Your name isn't Flint.", next: "mq18_clues" },
        { text: "[Not yet.]" },
      ],
    },
    mq18_clues: {
      speaker: () => L.heroName(),
      text: () => {
        const parts = [];
        if (Q.isComplete("mq11") || L.has("ms_note_register_61"))
          parts.push(
            "Wren's Register. ROSE MEAD, born on Track 61 at dawn, the eleventh of November '67. Father: E. W., asleep. And a girl of sixteen who climbed his stairs in '84 to ask if her father was in the book.",
          );
        if (L.flag("ms_lys_chin"))
          parts.push("Lys told me to ask you whose chin you have.");
        if (L.flag("ms_rose_mouthed"))
          parts.push("You knew the Dawn Hour before she said it.");
        if (L.flag("ms_rose_said_nell"))
          parts.push("You'd never heard of Nell Brady. You said it too fast.");
        parts.push(
          "You looked at that photo strip in 9C like you'd seen it every night of your life. And Sol has never once said your name.",
        );
        return (
          "[You say it slowly, because you are working it out as you go.] " +
          parts.join(" ") +
          "\n\n[And you look at her face, and for the first time you let yourself see it: Nicky's eyes. And your own stubborn chin.] You're Rose."
        );
      },
      responses: [{ text: "[Wait.]", next: "mq18_brand" }],
    },
    mq18_brand: {
      speaker: () => "Flint",
      text: () =>
        "[For a long moment she does nothing at all. Then she unbuckles the leather cuff on her left wrist and turns the inside of her arm to the light. Burned into the skin, old and silver: a sun with twelve rays.]\n\n" +
        "Little Sun. The Dawn's child. I ran at sixteen. [She buckles the cuff again, carefully.] That's what they called me, down there. ...Rose. My name's Rose. Rose Mead. [The next word comes out like something she has carried in her mouth for years.] Hi, Dad.",
      onEnter() {
        reveal();
      },
      responses: [
        { text: "Your mother. Nicky. Where is she?", next: "mq18_lie" },
      ],
    },
    mq18_lie: {
      speaker: "Rose",
      text: "[Rose looks past you, at the stone with the sun on it.] My mother's dead. [Flat. Final. She doesn't blink.] The riot, the fire. They carried her down the tracks and she never came up again. That's her name, under that sun. That's all there is.",
      onEnter() {
        L.setFlag("ms_rose_lie1");
        ms.set("rose_lie1");
      },
      responses: [
        { text: "[Embrace her.]", next: "mq18_hug" },
        {
          text: "Why didn't you tell me? All this time you let me walk around this city—",
          next: "mq18_angry",
        },
        {
          text: "[Show her Wren's certified copy.]",
          cond: () => ms.hasToken("rose_page") && !L.flag("ms_rose_saw_page"),
          next: "mq18_page",
        },
        { text: "[Stand beside her. Say nothing.]", next: "mq18_quiet" },
      ],
    },
    mq18_page: {
      speaker: "Rose",
      text: '[She takes the copy and reads it twice. Father: E. W. (asleep). Her thumb rubs at the raised seal.] He kept it. Wren. I asked him in \'84 and he said "asleep" like it was a place you could go. [She folds it into her breast pocket without asking.]',
      onEnter() {
        L.setFlag("ms_rose_saw_page");
      },
      responses: [
        { text: "[Embrace her.]", next: "mq18_hug" },
        { text: "Why didn't you tell me?", next: "mq18_angry" },
        { text: "[Stand beside her. Say nothing.]", next: "mq18_quiet" },
      ],
    },
    mq18_hug: {
      speaker: "Rose",
      text: "Don't. ...[She stands stiff as a fence post for a second.] Okay. Fine. Once. [Her forehead bumps your shoulder, hard, the way you knock on a door. Then she steps back, wipes her face with the heel of her hand and looks furious about it.]",
      onEnter() {
        if (ms.once("mq18_hug")) ms.addTrust(1, "Once.");
      },
      responses: [{ text: "[...]", next: "mq18_nothere" }],
    },
    mq18_angry: {
      speaker: "Rose",
      text: "[Her jaw sets. That chin.] Tell you what? That I'm line eleven in a dead clerk's book? You'd have run. [She turns and walks to the railings and stands there with her back to you for a long, long minute. Then she comes back.] ...I didn't know how. Okay? There isn't a way.",
      onEnter() {
        if (ms.once("mq18_angry")) ms.addTrust(-1, "Why didn't you tell me?");
      },
      responses: [{ text: "[...]", next: "mq18_nothere" }],
    },
    mq18_quiet: {
      speaker: "Rose",
      text: "[You stand beside her and look at the stone, and after a while her shoulder is touching your arm, and neither of you mentions it.]",
      responses: [{ text: "[...]", next: "mq18_nothere" }],
    },
    mq18_nothere: {
      speaker: "Rose",
      text: "Not here. They watch this garden from the bell tower; they always did. [She jerks her chin north-east.] Roof. My roof. There's a reason I've been following you since Chambers Street, and it isn't just— [She stops.] It isn't just that. Come on.",
      onEnter() {
        if (at("mq18", "confront")) Q.setStage("mq18", "roof");
      },
      responses: [{ text: "Lead the way." }],
    },
    mq18_roof_wait: {
      speaker: "Rose",
      text: "Roof first. I'm not saying it in the street.",
      responses: [{ text: "Roof it is." }],
    },
    mq18_roof: {
      speaker: "Rose",
      text:
        "[Up here the TUDOR CITY sign hums over both of you, red letters taller than a man, and all of 42nd Street runs away west toward the river. Rose sits on the gantry with her boots over the drop.]\n\n" +
        "The Dawn keeps a bomb under Grand Central. When the list comes back, she lights it. The list is back. It needs two keys; one's on Liberty. Get your friend, get me that key, and nobody ever turns it.",
      responses: [
        { text: "A bomb? Under Grand Central?", next: "mq18_sun" },
        { text: "What list?", next: "mq18_list" },
        { text: "Why the key? Why me?", next: "mq18_why" },
        { text: "I'll get you the key.", next: "mq18_promise" },
      ],
    },
    mq18_sun: {
      speaker: "Rose",
      text:
        "Two planes came over in '67. One flash. The second one came down in the North Woods with its bomb still in its belly, and the bomb didn't go off. The Continuity looked for it for two years and gave up. The Glowkeepers didn't. " +
        "They dug it out in '71 and took it under Grand Central on a railway flatcar, and they've been praying to it ever since. They call it the Second Sun.",
      onEnter() {
        ms.set("knows_second_sun");
      },
      responses: [
        { text: "What list?", next: "mq18_list" },
        { text: "Why the key? Why me?", next: "mq18_why" },
        { text: "I'll get you the key.", next: "mq18_promise" },
      ],
    },
    mq18_list: {
      speaker: "Rose",
      text:
        "Directive 7-A. The Continuity's. Everybody who isn't on the 1967 enrolment rolls gets fixed so they can't have kids. Every kid born down there. Every kid born anywhere since the bombs. Me. [She smiles without any humour at all.] " +
        'It leaked last November. The Dawn read it out on the air at five forty-seven: "The list has returned." I\'ve known what that means since I was sixteen.',
      responses: [
        { text: "A bomb? Under Grand Central?", next: "mq18_sun" },
        { text: "Why the key? Why me?", next: "mq18_why" },
        { text: "I'll get you the key.", next: "mq18_promise" },
      ],
    },
    mq18_why: {
      speaker: "Rose",
      text:
        "Two keys, turned together. Pilot's and navigator's. The Dawn wears one round her neck. The other one is in a locker on Liberty Island, same place they're holding your friend Zeke. The Covenant wants Liberty, the Continuity is Liberty, " +
        "and you're the sleeper: every door in this city has been waiting for you to walk through it. [Quieter.] And you're the only one I'd trust to put it in my hand.",
      responses: [
        { text: "A bomb? Under Grand Central?", next: "mq18_sun" },
        { text: "What list?", next: "mq18_list" },
        { text: "I'll get you the key.", next: "mq18_promise" },
      ],
    },
    mq18_promise: {
      speaker: "Rose",
      text: "Bring it to me. I'll drop it in the river off the Battery and nobody ever turns it. [She holds out her hand, flat, like a deal at the market.] Deal?",
      responses: [
        {
          text: "[Shake her hand.] Deal.",
          action: () => {
            L.setFlag("ms_rose_deal");
            heardOut();
          },
          next: () => (at("mq18", "ring") ? "mq18_ring" : null),
        },
        {
          text: "One thing at a time. First Liberty.",
          action: () => heardOut(),
          next: () => (at("mq18", "ring") ? "mq18_ring" : null),
        },
      ],
    },
    mq18_ring: {
      speaker: "Rose",
      text: "[Your hand has found its way into your coat pocket, around the little box you have carried since Pod 7. Your grandmother's ring. You were going to give it to Nicky on the twenty-first of May, 1967, in the Whispering Gallery.]\n\n[Rose sees the box. She doesn't say anything.]",
      responses: [
        { text: "[Give the ring to Rose.]", next: "mq18_ring_rose" },
        {
          text: "This was hers. I'll leave it with her, on the stone.",
          next: "mq18_ring_plan",
        },
        { text: "[Keep it.]", next: "mq18_ring_keep" },
      ],
    },
    mq18_ring_rose: {
      speaker: "Rose",
      text: "[She looks at it in your palm for a long time, and doesn't take it, and then does.] This was for her. [She tries it on her little finger, then on her ring finger, where it fits.] ...I'll look after it. I'm good at looking after things. Ask the sign.",
      onEnter() {
        ringTo("rose");
      },
      responses: [{ text: "[...]" }],
    },
    mq18_ring_plan: {
      speaker: "Rose",
      text: "[She shrugs, and doesn't quite manage it.] Your ring. Your stone. ...Her stone. Third row from the wall.",
      onEnter() {
        L.setFlag("ms_ring_plan_stone");
      },
      responses: [{ text: "[...]" }],
    },
    mq18_ring_keep: {
      speaker: "Rose",
      text: "[You close your hand on it again. Rose watches the box go back into your pocket and doesn't say anything, which says plenty.]",
      onEnter() {
        ringTo("kept");
      },
      responses: [{ text: "[...]" }],
    },
  });

