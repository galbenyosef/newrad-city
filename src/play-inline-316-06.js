// play-inline-316 06 — responses
// Lines 2166-2568 of readable/play-inline-316.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "ph_am_pie",
      type: "aid",
      name: "Automat Apple Pie",
      weight: 0.5,
      value: 12,
      tags: ["food"],
      mesh: "sweet_roll",
      sound: "eat",
      effects: { hpOverTime: [30, 8], rads: 1 },
      desc: "A wedge of apple pie from behind a little glass door. Baked by a robot with 22 years of practice. The apples are gnarlberry. Nobody minds.",
    });
    K.defineItem({
      id: "ph_am_sandwich",
      type: "aid",
      name: "Automat Sandwich",
      weight: 0.5,
      value: 14,
      tags: ["food"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [40, 10] },
      desc: "Pack oxen loaf on rye, waxed paper, a pickle spear. Penny cuts the crusts off whether you want him to or not.",
    });
    K.defineItem({
      id: "ph_am_beans",
      type: "aid",
      name: "H&H Baked Beans",
      weight: 1,
      value: 10,
      tags: ["food"],
      mesh: "can_beans",
      sound: "eat",
      effects: { hpOverTime: [35, 10], attrs: { grit: 1 }, duration: 240 },
      desc: "The famous beans, in the famous little crock. Slow-baked with Fizzo Cola since the molasses ran out. +1 END while it lasts.",
    });
    K.defineItem({
      id: "ph_am_mac",
      type: "aid",
      name: "Automat Macaroni au Gratin",
      weight: 1,
      value: 12,
      tags: ["food"],
      mesh: "box_tvdinner",
      sound: "eat",
      effects: { hpOverTime: [30, 8] },
      desc: "Baked macaroni with a crust you could shingle a roof with. Rich, cheesy, faintly glowing.",
    });
    K.defineItem({
      id: "ph_bellhop_cap",
      type: "apparel",
      slot: "head",
      name: "Pembroke's Bellhop Cap",
      weight: 0.5,
      value: 80,
      dr: 1,
      attrs: { presence: 1 },
      desc: "A red pillbox cap with a tarnished brass badge: HOTEL NEW YORKER. Doors open for a bellhop. +1 CHA.",
    });
    K.defineItem({
      id: "ph_am_coffee",
      type: "aid",
      name: "Automat Coffee",
      weight: 0.5,
      value: 6,
      tags: ["drink"],
      mesh: "bottle_milk",
      sound: "drink",
      effects: { stamina: 20, hp: 5 },
      desc: "Poured from a brass dolphin's mouth. Fresh every twenty minutes, as it has been since 1912. +20 AP.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph_nickel",
        name: "Nickel and Dime",
        giver: "Penny",
        location: "Penny & Price Automat",
        desc: "Penny, the Penny & Price's robot cook, has kept the wall of little glass doors stocked for twenty-two years — but the wall stopped vending the night after the bombs. The Master Carousel in the basement commissary is jammed, and something is living in the pneumatic tubes.",
        stages: [
          {
            id: "cellar",
            text: "Clear the giant roaches out of the Automat's basement commissary.",
            markers: [() => amMarker("carousel", "Commissary")],
          },
          {
            id: "crank",
            text: "Restart the Master Carousel in the basement (Mechanics 35, or a Dry Cell).",
            markers: [() => amMarker("carousel", "Master Carousel")],
          },
          {
            id: "return",
            text: "Tell Penny the automat is running again.",
            markers: [{ npc: "ph_penny", label: "Penny" }],
          },
        ],
        rewards: { xp: 200, scrip: 100 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("ph_dlg_penny", {
      start: () =>
        K.q.active("ph_nickel") && PH.flag("am_fixed")
          ? "fixed"
          : PH.flag("met_penny")
            ? "again"
            : "hello",
      nodes: {
        hello: {
          speaker: "Penny",
          onEnter: () => PH.setFlag("met_penny", true),
          text: "Welcome to Penny & Price, where the food is fresh, the coffee is hot, and the service is fully automatic! I am Penny, Commissary Unit Number One. Might I interest you in something from the steam table? Today's special is the same as every day's special.",
          responses: [
            {
              text: "Let me see what you're serving.",
              barter: true,
              end: true,
            },
            {
              text: "Why are all the little doors locked?",
              next: "wall",
              cond: () => !PH.flag("am_fixed"),
            },
            {
              text: "You've been cooking for twenty-two years?",
              next: "years",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Penny",
          text: "Back again! Splendid. Nothing warms a robot's servos like a repeat customer.",
          responses: [
            { text: "Show me the steam table.", barter: true, end: true },
            {
              text: "About the wall of doors...",
              next: "wall",
              cond: () => !PH.flag("am_fixed") && !K.q.started("ph_nickel"),
            },
            {
              text: "How's the wall holding up?",
              next: "wall_ok",
              cond: () => !!PH.flag("am_fixed"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        years: {
          speaker: "Penny",
          text: 'Twenty-two, as of this Tuesday. The customers have changed — rather more ragged, some of them — but the pie crust has not. Mr. Price always said: "The customer is always right, and always hungry." Mr. Penny said: "Good food at a fair price." He said it so often they painted it on the building. I was named for him. I have never met him. I assume he is resting.',
          responses: [
            {
              text: "Why are the little doors locked?",
              next: "wall",
              cond: () => !PH.flag("am_fixed"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        wall: {
          speaker: "Penny",
          onEnter: () => PH.setFlag("am_asked", true),
          text: "Ah. A delicate matter. The Master Carousel in the commissary — the great wheel that lifts every pie to every little door — seized the night after the unpleasantness. And now there are... tenants... in the pneumatic tubes. Giant roaches. I am a cook, not an exterminator. My flamethrower is strictly for crème brûlée.",
          responses: [
            {
              text: "I'll clear them out and get the wheel turning.",
              next: "accept",
              action: () => startNickel(),
            },
            {
              text: "[Trade 40] What's it worth to you?",
              check: { skill: "trade", value: 40 },
              next: "haggle",
              failNext: "haggle_fail",
            },
            { text: "Not my problem.", end: true },
          ],
        },
        haggle: {
          speaker: "Penny",
          onEnter: () => PH.setFlag("am_bonus", 60),
          text: "A negotiator! How refreshing. Very well: one hundred and sixty scrip, three of my finest pies, and — this is unprecedented — free coffee. For life. Yours, not mine.",
          responses: [
            { text: "Deal.", next: "accept", action: () => startNickel() },
          ],
        },
        haggle_fail: {
          speaker: "Penny",
          text: "I am authorised to offer one hundred scrip and a pie. The pie is non-negotiable. It is also delicious.",
          responses: [
            { text: "Fine.", next: "accept", action: () => startNickel() },
            { text: "Maybe later.", end: true },
          ],
        },
        accept: {
          speaker: "Penny",
          text: "Splendid! The commissary stairs are behind the railing in the south-east corner, or through the kitchen. The crank is on the carousel housing — the red box. Mind the tubes. They are hot. So are the roaches, in a manner of speaking.",
          responses: [{ text: "On it.", end: true }],
        },
        fixed: {
          speaker: "Penny",
          text: "Listen — do you hear that? Click... whirr... THUNK. That is the sound of four hundred little doors being loaded at once. I have not heard it in twenty-two years. If I had tear ducts I would be a hazard to the electrics.",
          responses: [
            {
              text: "Glad I could help.",
              next: "reward",
              action: () => finishNickel(),
            },
          ],
        },
        reward: {
          speaker: "Penny",
          text: "Please — your reward, and a pie. Then go and put a scrip in a slot. There is nothing in this world like the little door opening for you.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        wall_ok: {
          speaker: "Penny",
          text: "Running like a Swiss watch, if the Swiss had made watches out of pie. Help yourself — scrip in the slot, turn the knob, and the little door does the rest.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("ph_dlg_nell", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Nickel Nell",
          text: "Change, hon? I been throwin' nickels since before you were a twinkle in your daddy's eye. Scrip, nickels, bottle tops — I don't judge. What do you need?",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "What is this place?", next: "place" },
            { text: "Who's the old fellow on the balcony?", next: "pem" },
            { text: "Goodbye.", end: true },
          ],
        },
        place: {
          speaker: "Nickel Nell",
          text: "The Automat. Folks from all over Herald Square come here to eat off a marble table like civilized people. The robot cooks, I make change, the Garden grows spuds out back. Rules are simple: no guns out, pay the robot, bus your table. Break 'em and the Garden boys escort you out. In pieces.",
          responses: [
            { text: "Who's the old fellow on the balcony?", next: "pem" },
            { text: "Goodbye.", end: true },
          ],
        },
        pem: {
          speaker: "Nickel Nell",
          text: "Archie Pembroke. Used to be a bellhop at the Hotel New Yorker, up on 34th. He's got a story about the thirty-third floor he tells anybody who'll sit still. Buy him a coffee and you'll hear it twice.",
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
    G.dialogue.register("ph_dlg_pembroke", {
      start: () =>
        K.has("ph_ny_q_notebook") && !K.q.done("ph_room_3327")
          ? "notebook"
          : K.q.done("ph_room_3327")
            ? "after"
            : PH.flag("met_pem")
              ? "again"
              : "hello",
      nodes: {
        hello: {
          speaker: "Archibald Pembroke",
          onEnter: () => PH.setFlag("met_pem", true),
          text: "Evening. Or morning — hard to tell down here without the doorman calling it. Archibald Pembroke, formerly of the Hotel New Yorker. Bellhop. Forty-one years, man and boy. Pull up a chair, I don't bite. Not since '83.",
          responses: [
            { text: "The Hotel New Yorker?", next: "hotel" },
            { text: "Just passing through.", end: true },
          ],
        },
        again: {
          speaker: "Archibald Pembroke",
          text: "You again. Good. I was running out of people who hadn't heard about the thirty-third floor.",
          responses: [
            {
              text: "Tell me about the thirty-third floor.",
              next: "hotel",
              cond: () => !K.q.started("ph_room_3327"),
            },
            {
              text: "About Room 3327...",
              next: "hint",
              cond: () => K.q.active("ph_room_3327"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        hotel: {
          speaker: "Archibald Pembroke",
          text: "Two thousand five hundred rooms and a radio in every one. Big red sign on the roof — you can see it from the river. My floors were thirty through thirty-five. And on thirty-three there's Room 3327: the Tesla Suite. Old Nikola Tesla lived there till he passed in '43. Died alone, with his pigeons.",
          responses: [{ text: "And?", next: "hotel2" }],
        },
        hotel2: {
          speaker: "Archibald Pembroke",
          text: "And somebody kept working in there. A lady scientist — Stanhope Foundation, very hush-hush — rented the whole floor. Robots in the hallway. Lights dimming every night at nine. I took seed up for the birds, nine o'clock sharp. Morning of the bombs, the whole floor sang like a tuning fork. Then nothing. The robots are still up there, and so is whatever she built.",
          responses: [
            { text: "What do you want from it?", next: "want" },
            { text: "Sounds like a death trap.", end: true },
          ],
        },
        want: {
          speaker: "Archibald Pembroke",
          text: "Tesla kept a notebook. Stanhope used to carry it like a Bible. I don't want the ray, or whatever it is — keep it, sell it, shoot a Colossus with it. I want the notebook. Somebody ought to remember that he was right about everything and died broke feeding birds. Bring it to me and I'll make it worth your while.",
          responses: [
            {
              text: "I'll get your notebook.",
              next: "accept",
              action: () => PH.nyQuestTo("find"),
            },
            {
              text: "[Persuasion 35] How do I get past the robots?",
              check: { skill: "persuasion", value: 35 },
              next: "tips",
              failNext: "tips_fail",
              action: () => PH.nyQuestTo("find"),
            },
            { text: "Maybe some other time.", end: true },
          ],
        },
        tips: {
          speaker: "Archibald Pembroke",
          onEnter: () => {
            if (!PH.flag("pem_key_hint")) {
              PH.setFlag("pem_key_hint", true);
            }
          },
          text: 'Car 3 is the express to thirty-three — locked out, but the front desk terminal can restore it, and the Bell Captain kept a spare key in his lockbox by the door. And the robots\' charging bay on thirty-three has a terminal. Meridian passwords were never very clever. Try "PIGEON."',
          responses: [{ text: "Thanks, Archie.", next: "accept" }],
        },
        tips_fail: {
          speaker: "Archibald Pembroke",
          text: "Get past them? Son, I got past them by being a bellhop. You're not a bellhop. Try the elevator.",
          responses: [{ text: "Right.", next: "accept" }],
        },
        accept: {
          speaker: "Archibald Pembroke",
          text: "Thirty-fourth and Eighth, the entrance with the marquee. Mind the ballroom — they never cleared the Shamrock Ball. And feed the birds, if there are any left.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        hint: {
          speaker: "Archibald Pembroke",
          text: "Stanhope was always in and out of 3327, but nobody ever saw her come back out the door. Always thought it was something to do with the wardrobe. Old man kept his notebook behind his clothes, the story goes.",
          responses: [{ text: "Thanks.", end: true }],
        },
        notebook: {
          speaker: "Archibald Pembroke",
          text: "(His hands shake as he unwraps the oilcloth.) That's his hand. That's — look at that, a white feather. She kept it. Twenty-two years in a hotel room and she kept the feather.",
          responses: [
            {
              text: "It's yours, Archie.",
              next: "thanks",
              standing: 20,
              action: () => finishPembroke(false),
            },
            {
              text: "[Trade 50] It nearly got me killed. It's worth more than that.",
              check: { skill: "trade", value: 50 },
              next: "thanks_more",
              failNext: "haggle_no",
            },
            { text: "I think I'll hold on to it.", next: "keep" },
          ],
        },
        thanks: {
          speaker: "Archibald Pembroke",
          text: "Here — my cap from the old uniform, and every cap I've got that isn't on my head. Wear it with pride. Doors open for a bellhop. That's the whole secret of the job.",
          responses: [{ text: "Take care, Archie.", end: true }],
        },
        thanks_more: {
          speaker: "Archibald Pembroke",
          text: "Ha! Fair. Fair. You earned it. Two hundred and fifty scrip and the cap off my head. Don't spend it all on pie.",
          responses: [
            { text: "Deal.", end: true, action: () => finishPembroke(true) },
          ],
        },
        haggle_no: {
          speaker: "Archibald Pembroke",
          text: "I'm a bellhop, not a bank. What I've got is what I've got.",
          responses: [
            {
              text: "Fine. It's yours.",
              next: "thanks",
              action: () => finishPembroke(false),
            },
            { text: "Then I'll keep it.", next: "keep" },
          ],
        },
        keep: {
          speaker: "Archibald Pembroke",
          text: "...Well. It's yours to keep, I suppose. Just — read it sometime. He'd have liked that.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        after: {
          speaker: "Archibald Pembroke",
          text: "I read a page a night. Can't understand one word in ten. Doesn't matter. It's his voice. You did a good thing.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
  }
