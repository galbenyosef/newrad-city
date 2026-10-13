// play-inline-553 02 — desc
// Lines 365-669 of readable/play-inline-553.pretty.js (statement-aligned).
  function setBarks(k) {
    const a = actor(k);
    const c0 = cfg[k];
    if (a)
      a.customBarks = {
        idle: st(k).rec ? c0.idle : c0.ambient,
        greet: c0.greet,
        alert: c0.combat,
        kill: c0.kill,
      };
  }

  // ------------------------------------------------------------------
  // Barks
  // ------------------------------------------------------------------
  let barkGate = 0; // one companion line every few seconds at most
  function bark(k, text, dur, force) {
    if (!text) return false;
    const a = actor(k);
    if (!a || a.dead) return false;
    if (!force && now() < barkGate) return false;
    if (a.distToPlayer && a.distToPlayer() > 30) return false;
    barkGate = now() + 6;
    try {
      a.say(text, dur || 4.5);
    } catch (e) {
      return false;
    }
    return true;
  }

  // ------------------------------------------------------------------
  // THE ROSTER
  // ------------------------------------------------------------------
  cfg.malone = {
    id: "comp_malone",
    dlg: "dlg_comp_malone",
    short: "Malone",
    name: '"Gentleman" Jim Malone',
    faction: "settlers",
    quest: "sq_malone",
    look: {
      type: "human",
      outfit: "merchant",
      gender: "m",
      hat: "fedora",
      burn: "L",
      voice: "settler",
      level: 9,
      hp: 260,
      dr: 12,
    },
    startInv: [
      [["combat_shotgun", "sawed_off_shotgun", "pistol_10mm"], 1],
      [["brass_knuckles", "spud_wrench", "lead_pipe"], 1],
      [["ammo_12ga"], 24],
      [["rally_tonic"], 2],
      [["whiskey", "beer"], 1],
    ],
    home() {
      const b = L.anchor("times_square", ["bar_patron", "bar"], {
        x: -35.5,
        z: -301.9,
      });
      return L.freeSpot(b.x - 1.6, b.z + 2.4, b.y, { maxR: 5 });
    },
    canHire: () => tier() <= 3,
    leaves: () => tier() >= 4,
    talent() {
      const champ = !!L.flag("malone_belt_given");
      return champ
        ? {
            name: "Companion: The Undisputed",
            mods: { skills: { melee: 20 }, dr: 5 },
            desc: "Melee +20, DR +5",
          }
        : {
            name: "Companion: Corner Man",
            mods: { skills: { melee: 10 } },
            desc: "Melee +10",
          };
    },
    ambient: [
      "Bartender. Another. The brown one.",
      "Twenty-two years and my knees still hurt. The bomb fixed everything but knees.",
      "For hire. Ask nice.",
    ],
    idle: [
      "You hear that? No? Good. Neither do I.",
      "Twenty-two years and my knees still hurt. The bomb fixed everything but knees.",
      "I had a manager once. Sal Tortelli. Took thirty percent. You take nothing, boss. You're a better manager already.",
      "Keep your chin down and your hands up. Applies to most things.",
      "Scar tissue don't sweat. Half my face stays dry all August. Silver linings.",
    ],
    combat: [
      "Ding ding, round one.",
      "Let's dance.",
      "Here comes the undercard!",
      "Hands up, boss!",
      "I'll take the big one.",
    ],
    kill: [
      "Stay down.",
      "Ten count. Don't bother getting up.",
      "Split decision. Mostly split.",
      "And the winner is... still me.",
    ],
    hurt: [
      "Boss, you're bleeding like a cut man's nightmare. Patch up!",
      "You're wobbling! Drink a Rally Tonic, now!",
    ],
    good: [
      "Huh. Nice. Don't let it go to your head.",
      "Soft touch. I respect it. Don't tell anybody.",
    ],
    bad: [
      "Ugly work, boss. I've done uglier. Not much uglier.",
      "That one's gonna follow you. Trust me.",
    ],
    newWeapon: (n) => "A " + n + "? Heh. I'll make it look good.",
    wait: ["I'll hold the corner.", "Right here. Like a lamp post."],
    follow: ["Lead on, boss.", "Round two."],
    loc: {
      times_square:
        "Home sweet home. Don't touch the signs, the Mayor counts them.",
      grand_central:
        "Grand Central. I missed a train here once, 1958. Best thing that ever happened to me. The train went to Philadelphia.",
      sterlings:
        "Sterling's. I bought my fight suit here. Wore it to the Garden. Wore it out of the Garden. Wearing it now, practically.",
      empire_state:
        "They say a big grey Brute calls himself king up top now. I'd like to see his reach.",
      radio_city:
        "Rocky Delgado called one of my fights on the radio, back before the bombs. Talked faster than I punched.",
      rockefeller:
        "Tin cans. The Covenant don't like the Neon. The Covenant don't like much.",
      st_patricks:
        "Glowkeepers in there. They look at me like I'm a saint. I'm not. Ask my ex-wife.",
      chrysler:
        "Pretty building. Sniper nest. Everything pretty in this town has a gun in it.",
      bryant_park:
        "Used to do roadwork around this park. Five a.m. Pigeons were the only ones awake. Still are.",
      nypl: "Library. I read a book once. Liked it. Never found the second one.",
      flatiron:
        "Flatiron. Good bar in there, if you're not particular about what's in the glass.",
      washington_square:
        "Chess Charlie still playing? Don't bet him. I bet him. I lost a car. I didn't own a car.",
      wall_street:
        "Wall Street. Bunch of guys in there beat people for money. Hey, I'm not judging.",
      brooklyn_bridge:
        "Brooklyn. Fought in Flatbush a couple times. Crowds threw chairs. Good crowds.",
      battery_park:
        "Salt air. Smells like the corner bucket after twelve rounds.",
      liberty:
        "Lady Liberty. My old man came in under her. Said she waved. She didn't wave.",
      central_park: "The park. Nobody jogs anymore. Everybody runs, though.",
      un_hq:
        "Continuity boys. Pressed uniforms. I've fought guys in armour. You go for the joints.",
    },
    greet: ["Boss.", "What's the plan?", "You call it, I swing it."],
    farewell:
      "Hold up, boss. [He stops, and doesn't follow when you keep walking.] I told you my one rule, first night at the bar. I've done ugly work. I don't do yours. Whatever you're becoming out here, I heard it on the radio three times this week, and I'm not gonna stand in the corner for it. Keep the change. I'm going back to the Neon.",
    farewellReply: "[Let him go.]",
  };

  cfg.tull = {
    id: "comp_tull",
    dlg: "dlg_comp_tull",
    short: "Tull",
    name: "Ambrose Tull",
    faction: "settlers",
    quest: "sq_tull",
    look: {
      type: "human",
      outfit: "lab_coat",
      gender: "m",
      hair: "balding",
      beard: "stubble",
      skinTone: "fair",
      voice: "settler",
      level: 7,
      hp: 170,
      dr: 6,
    },
    startInv: [
      [["gyrojet_pistol", "pistol_10mm"], 1],
      [["combat_knife", "hunting_knife", "lead_pipe"], 1],
      [["ammo_gyrojet", "ammo_10mm"], 40],
      [["rally_tonic"], 2],
      [["prussian_blue"], 1],
    ],
    home() {
      if (L.flag("tull_library")) {
        const r = libSpot();
        return L.freeSpot(r.x + 1.2, r.z + 1.6, r.y, { maxR: 5 });
      }
      const b = L.anchor("grand_central", ["waiting_room", "lobby"], {
        x: 240,
        z: -199,
      });
      return L.freeSpot(b.x + 7, b.z + 1.5, b.y, { maxR: 6 });
    },
    canHire: () => tier() <= 1,
    leaves: () => tier() >= 3,
    talent() {
      const lib = !!L.flag("tull_library");
      return lib
        ? {
            name: "Companion: Free Press",
            mods: { skills: { electronics: 15, mechanics: 15, medicine: 5 } },
            desc: "Electronics +15, Mechanics +15, Medicine +5",
          }
        : {
            name: "Companion: Margin Notes",
            mods: { skills: { electronics: 10, mechanics: 10 } },
            desc: "Electronics +10, Mechanics +10",
          };
    },
    ambient: [
      '"...and the filtration membrane shall be..." no. No, that\'s wrong.',
      "Page three hundred and twelve. Only nine hundred to go.",
      "Please mind the books.",
    ],
    idle: [
      "Did you know the city had eleven hundred miles of water main? Had. Past tense. Mostly.",
      "I'm keeping a list of everything we find. Footnoted. Obviously.",
      "The Covenant's Rule says knowledge must be kept. Kept from whom, I always asked. Nobody ever answered.",
      "If you see a book, any book, please do not burn it for warmth. Burn me instead. I'm less rare.",
      "Our boots are wearing unevenly. You favour your left side. Just an observation.",
    ],
    combat: [
      "Oh dear. Here we go.",
      "Hostiles! I'll — I'll cover you!",
      "Right. Right. Safety off. Safety — where is the safety?",
      "For the record, I object to this!",
    ],
    kill: [
      "I... got one. I got one! That's going in the notes.",
      "Neutralised. I hate that word. It's accurate.",
      "Sorry. Sorry! Not really.",
    ],
    hurt: [
      "You're badly hurt — drink a Rally Tonic, the anatomy is not optional!",
      "That's arterial! Tonic! Now!",
    ],
    good: [
      "That was kind. I'll write that down.",
      'You know, the Keep would have called that "inefficient." I call it decent.',
    ],
    bad: [
      "I... don't think that was necessary.",
      "I'm writing that down too. I write everything down. I wish I didn't, sometimes.",
    ],
    newWeapon: (n) =>
      "A " + n + ". I've read the manual for this. Not the whole manual.",
    wait: [
      "I'll be right here. Reading.",
      "Of course. I'll catalogue the ceiling.",
    ],
    follow: [
      "Coming! Coming.",
      "Right behind you. Well — slightly to the left.",
    ],
    loc: {
      grand_central:
        "Grand Central. Forty-one people alive here because of one copied manual. I would do it again.",
      rockefeller:
        "The Keep. Please don't make me go inside. Lancer-Commander Stroud does a thing with his jaw when he sees me.",
      nypl: "The Library. Two lions: Patience and Fortitude. I've needed both since the day they expelled me.",
      guggenheim:
        "The Guggenheim. A spiral. Frank Lloyd Wright wanted you to see everything in one continuous thought. Also, robots.",
      met: "The Metropolitan. There's a robot in there that cares about art more than the Covenant cares about people.",
      times_square:
        "The Neon. They burned their census cards and kept the lights on for twenty-two years. Tell me again which of us are the monsters.",
      empire_state:
        "Structural steel, 1931. Built in thirteen months. We can't build a fence in thirteen months.",
      chrysler:
        "Art deco. Stainless-steel eagles. They were built to look at the future. It looked back.",
      un_hq:
        "The United Nations. A building full of people agreeing to talk instead of shoot. Look what's in it now.",
      st_patricks:
        "The Glowkeepers. Their hymnals are riveting. Heretical, but riveting.",
      radio_city:
        "A working transmitter and a man who uses it to tell the truth. Rocky Delgado is the closest thing this city has to an Archivist.",
      city_hall:
        "City Hall. The teletypes in there have tax records going back to 1921. I'm told that's not exciting.",
      brooklyn_bridge:
        "Roebling's bridge. Wire rope, spun on site. Every strand still sings when the wind comes up.",
      liberty:
        "Liberty Island. Whatever is in that torch, we should understand it before anybody uses it.",
      wall_street:
        "The Exchange. They traded promises there. Now they trade bullets. At least the bullets are real.",
      central_park:
        "Eight hundred acres, designed so the poor had somewhere to breathe. Olmsted would like it now. Fewer carriages.",
      flatiron: "Triangular floorplan. Hell to furnish. Lovely to look at.",
    },
    greet: [
      "Yes? Oh — yes, of course.",
      "I was just annotating. Go on.",
      "Ready when you are. Mostly.",
    ],
    farewell:
      "[Tull closes his notebook, carefully, the way he does everything.] I need to stop here. I've been writing down what we do, you see. All of it. And last night I read it back. [He swallows.] I don't want to be the footnote to that. I'm going back to Grand Central. If you ever... if the radio ever has something kind to say about you again, I'll be on my bench.",
    farewellReply: "[Let him go.]",
  };

