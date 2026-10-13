// play-inline-207 06 — inv
// Lines 2879-3224 of readable/play-inline-207.pretty.js (statement-aligned).
  function windsor(b, x, y, z, ry) {
    const M = PF.m4(x, y, z, ry);
    const add = (g, m, k) =>
      b.add(k || "oak", g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    add(new THREE.CylinderGeometry(0.23, 0.23, 0.05, 10), PF.m4(0, 0.45, 0));
    for (const [dx, dz] of [
      [-0.16, -0.16],
      [0.16, -0.16],
      [-0.16, 0.16],
      [0.16, 0.16],
    ])
      add(
        new THREE.CylinderGeometry(0.018, 0.022, 0.45, 5),
        PF.m4(dx, 0.225, dz, 0, dz * 0.4, -dx * 0.4),
      );
    for (let i = 0; i < 5; i++) {
      const a = -0.7 + i * 0.35;
      add(
        new THREE.CylinderGeometry(0.012, 0.012, 0.5, 4),
        PF.m4(Math.sin(a) * 0.2, 0.72, -Math.cos(a) * 0.2),
      );
    }
    add(
      new THREE.TorusGeometry(0.21, 0.02, 4, 10, PI * 0.9),
      PF.m4(0, 0.97, 0, PI * 0.05, HP),
    );
  }

  // ===================================================================
  // CONTENT
  // ===================================================================
  PF.item({
    id: "pf_tricorn",
    type: "apparel",
    slot: "head",
    name: "Washington's Tricorn",
    weight: 1,
    value: 350,
    dr: 2,
    attrs: { presence: 1, senses: 1 },
    skills: { persuasion: 5 },
    desc: "A weathered felt tricorn from the Fraunces Tavern museum. Its authenticity is certified by a robot. +1 Presence, +1 Senses, +5 Persuasion.",
  });
  PF.item({
    id: "pf_whitlock_ring",
    type: "misc",
    name: "Whitlock Wedding Band",
    weight: 0,
    value: 60,
    desc: 'A plain gold ring engraved inside: "E.W. + N.W. — for richer, for poorer." Found on the Vault Manager\'s desk, deep under Liberty Street.',
  });
  PF.item({
    id: "pf_shellback_egg",
    type: "aid",
    name: "Shellback Egg",
    weight: 0.5,
    value: 12,
    tags: ["food"],
    effects: { hp: 15, rads: 3 },
    sound: "eat",
    desc: "A leathery, faintly glowing egg from the Seaport hatchery. Nan Whitlock pays good scrip for these.",
  });
  PF.item({
    id: "pf_shellback_omelette",
    type: "aid",
    name: "Shellback Omelette",
    weight: 0.5,
    value: 40,
    tags: ["food"],
    effects: { hp: 50, hpOverTime: [30, 20], stamina: 10 },
    sound: "eat",
    desc: "Nan's famous Seaport omelette. Fluffy, green-tinged, and very filling.",
  });
  PF.item({
    id: "pf_grog",
    type: "aid",
    name: "Fraunces Grog",
    weight: 1,
    value: 15,
    tags: ["drink", "alcohol"],
    effects: {
      hp: 5,
      attrs: { brawn: 1, presence: 1, wits: -1 },
      duration: 120,
      rads: 1,
    },
    sound: "drink",
    desc: "Rum, river water and something Tobin won't name. +1 Brawn, +1 Presence, -1 Wits for a while.",
  });
  PF.item({
    id: "pf_reel_sons",
    type: "tape",
    name: 'Tape reel: "Sons of Liberty Radio"',
    title: 'Attic Transmitter Log — "The New Sons of Liberty"',
    text: "[Crackle.]\n\nVOICE: This is the New Sons of Liberty, broadcasting from a secret location that is definitely not above a tavern. To the Continuity on Liberty Island: we did not beat one king to bow to a filing cabinet.\n\nVOICE 2: Bill, the tape's running out.\n\nVOICE: To the Iron Covenant at Rockefeller Center: nice armour. Terrible manners.\n\nVOICE 2: BILL.\n\nVOICE: Sons of Liberty, out. Meet in the cellar. Bring rum.\n\n[Recording ends.]",
  });
  PF.item({
    id: "pf_note_nan",
    type: "note",
    name: "Nan's Recipe Card",
    title: "Seaport Omelette (serves 1 hungry scavenger)",
    text: "5 shellback eggs (fresh — if it hisses, it is TOO fresh)\n1 handful potato greens\nSalt, if anybody has any\nA hot pan and no fear\n\nWhisk. Pray. Fry. Serve to Tobin last.",
  });

  // --- terminals: none here; the attic has a working radio set (props) ---

  // --- dialogue: Tobin Drummond (bartender, rumours) ---
  const RUMOURS = [
    {
      text: "Reverend Penhallow up at Trinity Church has been asking for somebody brave and stupid. Scratching in his crypt, he says. My money's on Maniacs. My money's always on Maniacs.",
      act: () => {
        if (!PF.q.started("pf_dust")) PF.q.start("pf_dust");
      },
      note: "Trinity Church — the crypt",
    },
    {
      text: "See the old gent in the good suit, corner table? Mortimer Vane. Used to push paper on Wall Street before the world ended. He's got a thing about the Federal Reserve. Everybody's got a thing about the Federal Reserve. Gold does that.",
      act: () => {
        if (!PF.q.started("pf_gold")) PF.q.start("pf_gold", { stage: "meet" });
      },
      note: "Mortimer Vane — the Fed",
    },
    {
      text: "Lottie Brennan and her salvage crew went out to that big old sailing ship at the Seaport — the Peking. Shellbacks got the crew. Lottie's holed up in the fish market, last anybody heard. She'll pay, if she's alive.",
      act: () => {
        if (!PF.q.started("pf_deep")) PF.q.start("pf_deep");
      },
      note: "Seaport — Lottie Brennan",
    },
    {
      text: "The raiders at the Stock Exchange call themselves The Exchange now. They charge a toll on Wall Street. In scrip, bullets, or teeth. Go around.",
      note: null,
    },
    {
      text: "Nan in the kitchen swears her husband ran the gold vault under Liberty Street. Twenty-two years she's been waiting for him to come home for dinner. Don't bring it up unless you've got news.",
      note: null,
    },
    {
      text: "Continuity patrol boats running lights around Liberty Island again. Men in pressed uniforms, saluting a flag nobody else salutes. Whatever they're doing in that statue, it glows at night.",
      note: null,
    },
    {
      text: "Dilly — runs the garden out back — keeps muttering about a civil-defense seed reserve in the Fulton Fish Market cold store. Real old-world seeds. If anybody could get past the shellbacks, she'd kiss them. Or pay them. Probably pay them.",
      note: null,
    },
    {
      text: "That patrolman upstairs in the Long Room? Calls itself George. Ask it about the Revolution and it won't shut up for an hour. Ask it right, it might give you a hat.",
      note: null,
    },
  ];
  PF.dialogue("pf_dlg_hollis", {
    start: "root",
    nodes: {
      root: {
        text: () =>
          PF.flag("ft_rumour")
            ? "Back again. What'll it be?"
            : "Welcome to Fraunces — oldest bar in the city and the only one with a roof. I'm Tobin. We've got grog, we've got water, we've got rooms upstairs, and we've got rumours. Rumours are free. The rest isn't.",
        responses: [
          { text: "Heard any rumours?", next: "rumour", repeatable: true },
          { text: "Let's trade.", barter: true },
          {
            text: "[10 scrip] I need a room for the night.",
            cond: () => PF.inv.scrip() >= 10,
            action: () => rentRoom(),
            next: null,
          },
          {
            text: "[5 scrip] Pour me a grog.",
            cond: () => PF.inv.scrip() >= 5,
            action: () => {
              PF.inv.addScrip(-5);
              PF.inv.add("pf_grog", 1);
            },
            next: "grog",
            repeatable: true,
          },
          { text: "Tell me about this place.", next: "history" },
          { text: "See you, Tobin." },
        ],
      },
      rumour: {
        text: () => {
          const i = (PF.flag("ft_rumour") || 0) % RUMOURS.length;
          const R = RUMOURS[i];
          PF.setFlag("ft_rumour", (PF.flag("ft_rumour") || 0) + 1);
          try {
            if (R.act) R.act();
          } catch (e) {
            /* optional */
          }
          return R.text;
        },
        responses: [
          { text: "Anything else?", next: "rumour", repeatable: true },
          { text: "Thanks.", next: "root" },
        ],
      },
      grog: {
        text: "One Fraunces Grog. It's like rum, if rum had been in a knife fight. Cheers.",
        responses: [{ text: "Cheers." }],
      },
      history: {
        text: "Samuel Fraunces opened this place in 1762. Washington said goodbye to his officers upstairs. Twenty-two years after the bombs, the building's still standing and the beer's still warm. Some traditions you keep.",
        responses: [
          { text: "Who else is around?", next: "who" },
          { text: "Thanks.", next: "root" },
        ],
      },
      who: {
        text: "Nan does the cooking — sweetest woman in the Financial District, don't mention her husband. Mortimer Vane in the corner, same suit since '67, don't mention the markets. Sal on the fiddle, don't request anything. And George upstairs. George is a robot. Don't mention King George.",
        responses: [{ text: "Got it.", next: "root" }],
      },
    },
  });
  function rentRoom() {
    PF.inv.addScrip(-10);
    PF.setFlag("ft_room", true);
    const a = PF.anchorOf("fraunces_tavern", "guest");
    G.fadeTransition(() => {
      if (a) G.player.teleport(a.x, a.y + 0.05, a.z, a.yaw);
      try {
        if (PF.live("rpg") && G.rpg.sleep) G.rpg.sleep(8, { owned: true });
        else G.player.heal(999);
      } catch (e) {
        /* ignore */
      }
      G.notify("You sleep soundly in a rented room at Fraunces Tavern.");
    }, 1.0);
  }

  // --- Nan Whitlock (cook) ---
  PF.dialogue("pf_dlg_nan", {
    start: "root",
    nodes: {
      root: {
        text: () =>
          PF.flag("ft_ring")
            ? "Oh, it's you, love. Sit, sit. There's always a plate for you in my kitchen."
            : "Mind the stove, dearie, it bites. I'm Nan. I cook. Forty-odd years of cooking, and the last twenty-two of them like this. You look half-starved — they all do.",
        responses: [
          {
            text: () =>
              "I brought shellback eggs. (" +
              PF.inv.count("pf_shellback_egg") +
              ")",
            cond: () => PF.inv.count("pf_shellback_egg") > 0,
            next: "eggs",
          },
          {
            text: "Could you use anything for the kitchen?",
            next: "need",
            cond: () => !PF.q.started("pf_shellback_omelette"),
          },
          {
            text: "I found something in the vault under the Federal Reserve. A ring.",
            cond: () =>
              PF.inv.count("pf_whitlock_ring") > 0 && !PF.flag("ft_ring"),
            next: "ring",
          },
          { text: "What's cooking?", barter: true },
          { text: "Goodbye, Nan." },
        ],
      },
      need: {
        text: "Eggs, love. Shellback eggs. The Seaport used to be full of them — the shellbacks nest on that old ship. Bring me five and I'll make you my omelette. Any more than that and I'll pay twenty scrip a piece.",
        responses: [
          {
            text: "Five shellback eggs. I'll see what I can do.",
            action: () => PF.q.start("pf_shellback_omelette"),
          },
          { text: "Maybe later." },
        ],
      },
      eggs: {
        text: () => {
          const n = PF.inv.count("pf_shellback_egg");
          if (PF.q.active("pf_shellback_omelette") && n >= 5)
            return "Five! Oh, and fresh. Sit down. [She cracks them into a pan the size of a manhole cover.] Nan's Seaport Omelette — and the recipe, so you never go hungry again.";
          return "Lovely. Twenty scrip each for those, love. Mind, they hiss.";
        },
        responses: [
          {
            text: "Here — make the omelette.",
            cond: () =>
              PF.q.active("pf_shellback_omelette") &&
              PF.inv.count("pf_shellback_egg") >= 5,
            action: () => {
              PF.inv.remove("pf_shellback_egg", 5);
              PF.q.done("pf_shellback_omelette");
            },
          },
          {
            text: () =>
              "Sell all of them. (" +
              PF.inv.count("pf_shellback_egg") * 20 +
              " scrip)",
            cond: () =>
              PF.inv.count("pf_shellback_egg") > 0 &&
              !(
                PF.q.active("pf_shellback_omelette") &&
                PF.inv.count("pf_shellback_egg") >= 5
              ),
            action: () => {
              const n = PF.inv.count("pf_shellback_egg");
              PF.inv.remove("pf_shellback_egg", n);
              PF.inv.addScrip(n * 20);
              PF.setFlag("ft_eggs", (PF.flag("ft_eggs") || 0) + n);
            },
          },
          { text: "Never mind." },
        ],
      },
      ring: {
        text: "That's... that's Edmund's. [Her ruined hands shake.] He said he'd be home for dinner. Twenty-two years I kept his plate warm. He stayed with his gold, the stubborn old fool — didn't he. [A long silence.] Thank you, love. Truly.",
        responses: [
          {
            text: "He wrote that the ledger mattered more than the gold. He was protecting it.",
            action: () => giveRing(true),
            next: "ring2",
          },
          {
            text: "Keep it. He'd want you to have it.",
            action: () => giveRing(false),
            next: "ring2",
          },
        ],
      },
      ring2: {
        text: "You take this. [She presses a small, heavy key into your hand.] It's for the strongbox under my bed upstairs — the owner's room. Edmund's savings. Better you than the rats. And there's always a plate here for you. Always.",
        responses: [{ text: "Thank you, Nan." }],
      },
    },
  });
  function giveRing(told) {
    PF.inv.remove("pf_whitlock_ring", 1);
    PF.setFlag("ft_ring", true);
    PF.inv.add("pf_nan_key", 1);
    PF.standing(told ? 40 : 25, "Returned the Whitlock ring");
    PF.xp(150, "Till Death");
    PF.inv.add("pf_shellback_omelette", 2);
  }
  // ---- locks: Nan's strongbox (her key), the museum's tricorn case (GW-1776 lets the code slip), the smugglers' cache (chalk) ----
