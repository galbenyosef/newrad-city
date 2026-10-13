// play-inline-389 04 — next
// Lines 1001-1294 of readable/play-inline-389.pretty.js (statement-aligned).
  const WALT_LETTER =
    "Mabel —\n\nLeave came through! Home Sunday on the 6:10 into Penn Station, a block from you. I'll ring the board at eight like I promised, and when you hear \"PEnnsylvania 6-5000\" in my voice you better say yes, because I have a ring in my pocket that cost me three months of hazard pay and I am NOT carrying it back to Keflavík.\n\nWear the blue dress.\n\n— Walt\n\nP.S. Don't tell your mother.";
  function data() {
    K.defineItem({
      id: "ppn_hotel_passkey",
      type: "key",
      name: "Hotel Pennsylvania Passkey",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: 'A heavy brass master key on a red leather fob: HOTEL PENNSYLVANIA — HOUSEKEEPING — ALL FLOORS. Mabel kept it in her coffee can "for emergencies."',
    });
    K.defineItem({
      id: "ppn_walts_letter",
      type: "note",
      name: "Walt's Letter",
      title: "Walt's Letter (opened)",
      text: WALT_LETTER,
      weight: 0,
      value: 0,
      desc: 'Twenty-two years late. Mabel gave it back to you to keep, "so someone remembers it."',
    });
    K.defineItem({
      id: "ppn_baton",
      type: "misc",
      name: "Johnny Starr's Baton",
      weight: 0.2,
      value: 90,
      tags: ["valuable", "unique"],
      desc: 'An ebony conductor\'s baton with a silver ferrule engraved "J.S. — CAFÉ ROUGE — 1000 NIGHTS." It still sets a Geiger counter clicking.',
    });
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    const sign = (how) => () => {
      K.take("ppn_special_letter", 1);
      if (!K.has("ppn_receipt")) K.give("ppn_receipt", 1);
      PV.setFlag("ho_delivered", how);
      if (q.active("ppn_rounds")) q.set("ppn_rounds", "receipt");
    };
    const D = "Mabel";
    G.dialogue.register("ppn_dlg_dottie", {
      start: () => {
        if (PV.flag("ho_delivered"))
          return PV.flag("ho_dottie_cruel") ? "after_cruel" : "after";
        if (K.has("ppn_special_letter")) return "hello_letter";
        return PV.flag("ho_met") ? "hello2" : "hello";
      },
      nodes: {
        hello: {
          speaker: D,
          onEnter: () => PV.setFlag("ho_met", true),
          text: "[A thin woman in a threadbare operator's uniform sits at the switchboard, headset clamped over grey pin curls. She doesn't turn around.] Hotel Pennsylvania, PEnnsylvania six, five-oh-oh-oh. How may I direct your call? ...Oh! A walk-in. We don't get a lot of walk-ins, hon.",
          responses: [
            { text: "Who are you?", next: "who" },
            { text: "What about all the Maniacs out there?", next: "guests" },
            { text: "You're... not one of them.", next: "notmaniac" },
            { text: "Sorry. Wrong number.", end: true },
          ],
        },
        hello2: {
          speaker: D,
          text: "Hotel Pennsylvania, how may I— oh, it's you, hon. Still no call. Line twelve's quiet. Line twelve's always quiet.",
          responses: [
            { text: "Who are you waiting for?", next: "waiting" },
            { text: "Tell me about the Café Rouge.", next: "rouge" },
            { text: "Take care, Mabel.", end: true },
          ],
        },
        who: {
          speaker: D,
          text: "Mabel. Mabel Kowalczyk, night operator, Hotel Pennsylvania switchboard, since nineteen fifty-eight. I'm on shift.",
          responses: [
            { text: "How long have you been on shift?", next: "long" },
            { text: "Who are you waiting for?", next: "waiting" },
          ],
        },
        long: {
          speaker: D,
          text: "What's today, hon? ...No, don't tell me. I stopped asking. I'm waiting on a call, that's all, and you don't leave the board when you're waiting on a call. That's the first thing they teach you.",
          responses: [{ text: "Whose call?", next: "waiting" }],
        },
        waiting: {
          speaker: D,
          text: "My Walter. Private Walter Nowak, First Infantry, Iceland garrison. He's got leave this weekend. He said he'd ring the hotel at eight sharp Sunday morning, end of my shift, and I'd better be on the board. [She smooths her skirt.] So I'm on the board.",
          responses: [
            {
              text: "Mabel... the war's over. It's been a long time.",
              next: "over",
            },
            { text: "I hope he calls.", next: "hope0" },
          ],
        },
        over: {
          speaker: D,
          text: "[She laughs, a dry rustle.] Oh, I know that, hon. I know it the way you know you're not twenty any more. But knowing and hanging up are two different things. Operators never hang up first. It's rude.",
          responses: [
            { text: "Tell me about the Café Rouge.", next: "rouge" },
            { text: "Goodbye, Mabel.", end: true },
          ],
        },
        hope0: {
          speaker: D,
          text: "So do I. Every morning at eight. [She checks a stopped clock.] Any minute now.",
          responses: [{ text: "Goodbye, Mabel.", end: true }],
        },
        guests: {
          speaker: D,
          text: "The guests? They don't come in here. Steel door, and they've forgotten how doors work. Just don't make any sudden moves in the Café Rouge, hon. The bandleader's got a temper, and he's the biggest of the lot.",
          responses: [
            { text: "The bandleader?", next: "rouge" },
            { text: "Who are you?", next: "who" },
          ],
        },
        notmaniac: {
          speaker: D,
          text: 'Neither are you, and nobody\'s giving you a medal for it. [She taps her headset.] Keeping busy helps. Routine. Plug in, plug out, "one moment please." The ones out there, they just... stopped being busy.',
          responses: [{ text: "Who are you waiting for?", next: "waiting" }],
        },
        rouge: {
          speaker: D,
          text: "Johnny Starr and his Stardust Orchestra, Saturday nights at the Café Rouge, and the Sunday-morning brunch hour on the radio. The whole city danced to that band. They were playing the brunch broadcast when the lights went — well. They never stopped, is the thing. Johnny's still up on the bandstand, waving his baton at nobody, big as a stevedore and screaming the count-in. Don't go up there without a lot of bullets and a little Prussian Blue.",
          responses: [{ text: "Thanks for the warning.", end: true }],
        },
        hello_letter: {
          speaker: D,
          text: "Hotel Pennsylvania, PEnnsylvania six, five-oh-oh-oh. How may I direct— [She turns, sees the envelope in your hand. Her hands stop on the cords.]",
          responses: [
            {
              text: "Special delivery for Miss Mabel Kowalczyk. From Iceland.",
              next: "letter",
            },
            { text: "Postage due on this one. Fifty scrip.", next: "due" },
          ],
        },
        due: {
          speaker: D,
          onEnter: () => {
            K.scrip(50);
            K.standing(-5, "Charged Mabel postage due");
          },
          text: "Postage due? [She fishes in a coffee can full of old-world coins and scrip and counts out fifty with shaking fingers.] Here. Robbery. Now give it here, hon, give it here.",
          responses: [{ text: "[Hand over the letter]", next: "letter" }],
        },
        letter: {
          speaker: D,
          text: "[She takes it in both hands. Turns it over. Over again. Her thumb finds the postmark.] Keflavík. March fourth. That's — that's a Saturday. He mailed it Friday. [A long, shaky breath.] My eyes aren't what they were. Would you read it to me, hon?",
          responses: [
            { text: "[Open it and read it aloud]", next: "read" },
            { text: "Are you sure you want to hear it?", next: "sure" },
          ],
        },
        sure: {
          speaker: D,
          text: "I have been sitting at this board for — for a long time, hon. I am sure.",
          responses: [{ text: "[Open it and read it aloud]", next: "read" }],
        },
        read: {
          speaker: D,
          text: "\"Mabel — Leave came through! Home Sunday on the 6:10 into Penn Station, a block from you. I'll ring the board at eight like I promised, and when you hear PEnnsylvania 6-5000 in my voice you better say yes, because I have a ring in my pocket that cost me three months of hazard pay and I am not carrying it back to Keflavík. Wear the blue dress. — Walt. P.S. Don't tell your mother.\"",
          responses: [{ text: "[Wait]", next: "after_read" }],
        },
        after_read: {
          speaker: D,
          text: "[A sound comes out of her that might be a laugh.] The six-ten. The six-ten Sunday morning. [Quiet.] The bombs were Sunday morning, hon. He was a block away. Twenty-two years I've had this board plugged into line twelve, waiting on a call that was never — [She stops.] He was going to ask me.",
          responses: [
            {
              text: "I'm so sorry, Mabel. He loved you. It's all over that letter.",
              next: "kind",
              action: sign("kind"),
            },
            {
              text: "[Persuasion 50] Maybe he made it to a shelter under the station. Maybe he's still out there.",
              check: { skill: "persuasion", value: 50 },
              next: "hope",
              failNext: "hope_fail",
            },
            {
              text: "He's dead. Everyone from back then is dead. Stop waiting.",
              next: "cruel",
              action: () => {
                sign("cruel")();
                PV.setFlag("ho_dottie_cruel", true);
                K.standing(-15, "Crushed Mabel");
              },
            },
          ],
        },
        kind: {
          speaker: D,
          onEnter: () => {
            K.standing(15, "Delivered Walt's letter");
            K.give("ppn_hotel_passkey", 1);
            K.give("ppn_walts_letter", 1, true);
          },
          text: "[She wipes her eyes with the back of a glove.] He did, didn't he. [She signs your green card — M-A-B-E-L — with the switchboard pencil.] Here. You tell that machine the mail went through. And take this. [A brass key on a red fob.] The passkey. Every room in the house. Management won't mind — management's been gone since '67. And keep the letter, would you? So somebody remembers it.",
          responses: [{ text: "What will you do now?", next: "now" }],
        },
        hope: {
          speaker: D,
          onEnter: () => {
            K.give("ppn_hotel_passkey", 1);
            K.xp(25, "Gave Mabel hope");
          },
          text: "[She looks at you a long time. Then she almost smiles.] ...The shelters under Penn Station. They say some folks down there go back to before the war. [She signs your card.] I'll keep line twelve open a little longer, then. Here — the passkey, hon. You'll get further in this old barn with it than without it.",
          responses: [
            {
              text: "Take care of yourself, Mabel.",
              end: true,
              action: sign("hope"),
            },
          ],
        },
        hope_fail: {
          speaker: D,
          text: "[She shakes her head, very gently.] Don't, hon. I'm old, I'm not stupid. [She signs your card anyway.] But thank you for trying.",
          responses: [
            { text: "I'm sorry.", next: "kind", action: sign("kind") },
          ],
        },
        cruel: {
          speaker: D,
          text: "[She pulls the headset off. Sets it on the desk, very carefully, like it might break.] ...Sign your card, carrier. [She signs.] Then get out of my exchange.",
          responses: [{ text: "[Leave]", end: true }],
        },
        now: {
          speaker: D,
          text: "Now? [She looks at the board. At line twelve.] Now I think I'll finally unplug it. [She pulls the cord. It's the smallest sound.] And then I think I'll go up and see the Café Rouge. I never got to go dancing there. Walt was going to take me.",
          responses: [{ text: "Goodbye, Mabel.", end: true }],
        },
        after: {
          speaker: D,
          text: "Hotel Pennsylvania... oh. Hello, hon. Line twelve's unplugged. It's strange, the quiet. Good strange.",
          responses: [{ text: "Goodbye, Mabel.", end: true }],
        },
        after_cruel: {
          speaker: D,
          text: "[She doesn't look up from the board.] We're closed.",
          responses: [{ text: "[Leave]", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN: Mabel (friendly settler, barricaded in her exchange)
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    if (A.dottie)
      PV.spawnActor(ctx, {
        id: "ppn_dottie",
        type: "human",
        gender: "f",
        outfit: "settler",
        hat: "headphones",
        hatColor: 0x2a2a2a,
        name: "Mabel",
        faction: "settlers",
        level: 5,
        hostile: false,
        essential: true,
        pos: { x: A.dottie.x, y: A.dottie.y, z: A.dottie.z },
        yaw: -HP,
        ai: "sit",
        home: "here",
        homeR: 0.6,
        dialogue: "ppn_dlg_dottie",
        noRespawn: true,
        lookYaw: -HP,
        barks: [
          "Hotel Pennsylvania, one moment please.",
          "PEnnsylvania six, five-oh-oh-oh...",
          "Line twelve. Still quiet.",
          "Connecting you now, hon.",
        ],
      });
  }
  function update(dt, realDt, ctx) {
    if (PV.hoInteriorUpdate) PV.hoInteriorUpdate(dt, realDt, ctx);
  }

  PV.define({
    id: "hotel_pennsylvania",
    name: "Hotel Pennsylvania",
    interior: "hotel_pennsylvania",
    order: 20,
    build(ctx) {
      exterior(ctx);
      if (PV.hoInterior) PV.hoInterior(ctx);
    },
    data,
    spawn,
    update,
  });
