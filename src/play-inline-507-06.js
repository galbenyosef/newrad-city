// play-inline-507 06 — alert
// Lines 1825-2210 of readable/play-inline-507.pretty.js (statement-aligned).
  C.BARKS = {
    raider: {
      idle: [
        "Who keeps stealing my good knife? I KNOW it was one of you.",
        "Smells like burnt tires and regret out here. Home sweet home.",
        "I traded a whole crate of hubcaps for these boots. Worth it.",
        "Pass the Rush. No, the OTHER Rush.",
        "Another day, another dead guy's wallet.",
        "You ever think about goin' straight? ...Nah, me neither.",
        "Boss says we hit the market tomorrow. Boss says a lot of things.",
      ],
      alert: [
        "Well, well! Something shiny wandered in!",
        "Ooh, fresh meat with a lunchbox!",
        "Hey! That one's wearing a whole padded suit! Dibs!",
        "You lost, pumpkin? Good. Stay lost!",
        "Wake up, boys! We got a customer!",
        "A sleeper! Fresh out the icebox! I want them goggles!",
      ],
      search: [
        "Come out, come out, little popsicle...",
        "I can smell the soap on you. Where are ya?",
        "Somebody's creeping around. I hate creeping.",
        "I ain't mad. I just wanna talk. With my knife.",
      ],
      lost: [
        "Eh. Probably a burrow rat.",
        "Forget it. Too hungover for this.",
        "Whatever it was, it's gone now.",
      ],
      combat: [
        "Hold still, I'm tryin' to shoot you!",
        "Gonna hang your teeth on my necklace!",
        "Bleed for me, sweetheart!",
        "Flank 'em! Somebody flank 'em! ...Anybody?",
        "You're gonna look great on a pike!",
        "Thawed out just to die, huh?",
      ],
      hurt: [
        "Agh! That's my good arm!",
        "You'll pay for that, icebox!",
        "Ow! OW! Rude!",
        "Now you made me angry AND leaky!",
      ],
      flee: [
        "Nope! Nope nope nope!",
        "This ain't worth the scrip!",
        "I'm out! Tell my ma... actually, don't.",
        "Retreat! Tactical... running!",
      ],
      kill: [
        "Heh. Another one for the pile.",
        "Check the pockets!",
        "That's what you get!",
      ],
      reload: [
        "Reloading!",
        "Cover me, I'm dry!",
        "Hang on, hang on, gotta feed it!",
      ],
      grenade: ["Catch!", "Fire in the hole!", "Present for ya!"],
      allyDown: [
        "They got Stitches!",
        "Aw, not Mikey! He owed me scrip!",
        "Man down! ...Eh, more loot for me.",
      ],
      disarmed: [
        "My gun! You shot my GUN!",
        "Hey! That was a family heirloom!",
      ],
    },
    brute: {
      idle: [
        "Hrrm. Ground shakes when Brute walks. Good.",
        "Bones itch. Plates growing again.",
        "Rooftop is warm. Brute sleeps on rooftop.",
        "Who touched the trophy pile? Counted. Twice.",
        "Grey sky. Grey skin. Grey city. Hrrm.",
      ],
      alert: [
        "Hrrraagh! Soft-skin!",
        "Something soft walks on Brute street!",
        "Smell it. Fear-sweat. Close.",
        "Come. Brute will make you small.",
      ],
      search: [
        "Hide, soft-skin. Brute is patient.",
        "Brute hears little heart. Thump. Thump.",
        "Under rubble? Behind car? Brute looks everywhere.",
      ],
      lost: [
        "Gone. Hrrm. Next time.",
        "Little thing ran. Smart little thing.",
        "Bah. Wind. Only wind.",
      ],
      combat: [
        "BREAK!",
        "You snap like dry stick!",
        "Hold still! Brute is not fast!",
        "Plates stop bullets! Hah!",
        "Brute is the bomb now!",
      ],
      hurt: [
        "Hrrrnh! Sting!",
        "You crack plate! Now Brute is angry!",
        "Grrah! Little thing bites!",
      ],
      kill: [
        "Stopped. Good.",
        "Too soft. Always too soft.",
        "Add to the pile.",
      ],
      reload: ["Stupid gun! Too small for Brute hand!"],
      grenade: ["Catch, soft-skin!"],
      allyDown: [
        "Kin falls! You pay with bones!",
        "Soft-skin killed kin! BREAK IT!",
      ],
      disarmed: ["Gun gone? Fine. Fists bigger."],
    },
    colossus: {
      alert: [
        "HHHHRRRRAAAAAAGH!",
        "SMALL... ONE...",
        "BREAK... THE... SMALL...",
      ],
      combat: ["BREAK!", "GRAAAHH!", "FALL DOWN!"],
      hurt: ["RRRRAAAGH!"],
      search: ["WHERE...?"],
    },
    continuity: {
      idle: [
        "Form 22-B, in triplicate. As always.",
        "Reminder: fraternizing with unregistered civilians is a reportable offense.",
        "Command wants the island secured by nightfall. As it has every night since '67.",
        "I miss real coffee. Federal coffee.",
        "Eyes open. The Brutes learn.",
      ],
      alert: [
        "Unregistered civilian in a federal exclusion zone!",
        "Contact! Unregistered hostile!",
        "Target acquired. Weapons free.",
        "Irradiated local spotted. Engaging.",
      ],
      search: [
        "Movement on the scope. Sweep the area.",
        "Something's out there. Stay sharp.",
        "Show yourself! By authority of the Acting President!",
      ],
      lost: [
        "False reading. Resume patrol.",
        "Area clear. Logging the anomaly.",
        "Negative contact. Back to posts.",
      ],
      combat: [
        "Suppressing fire!",
        "Squad, bound forward!",
        "You are in violation of the Emergency Powers Act!",
        "Drop the weapon, citizen! Permanently!",
        "Flank left! Move!",
      ],
      hurt: [
        "I'm hit! Rig holding!",
        "Corpsman! ...Right. No corpsman.",
        "Damn it! Plate's breached!",
      ],
      kill: [
        "Target neutralized.",
        "Hostile down. Next.",
        "Strike that one from the census.",
      ],
      reload: ["Changing packs!", "Reloading, cover me!"],
      grenade: ["Grenade out!", "Frag out!"],
      allyDown: [
        "Man down! Man down!",
        "We lost Sergeant Hale!",
        "Trooper down! Avenge him!",
      ],
      greet: [
        "Citizen. Stay behind the patrol and you'll be fine.",
        "Liberty Island sends its regards.",
        "Keep moving, friend of the Continuity.",
      ],
    },
    covenant: {
      idle: [
        "Iron remembers what flesh forgets.",
        "Keep the perimeter tight. Brutes love this plaza.",
        "The archivists catalogue the library tomorrow. Escort detail again.",
        "My rig's left knee grinds. Again.",
        "Every circuit we save is a prayer answered.",
      ],
      alert: [
        "Hostile in sight! Engaging!",
        "Contact! Weapons free!",
        "For the Covenant!",
      ],
      search: ["Stay sharp. Something's moving.", "Sweep the sector."],
      lost: ["Nothing. Back to post.", "Clear. Stay vigilant."],
      combat: [
        "Iron holds!",
        "Hold the line!",
        "Burn them down!",
        "Keep firing!",
      ],
      hurt: ["Plate breach!", "I'm hit!"],
      kill: ["Target down.", "Threat erased.", "One less threat."],
      reload: ["Cell swap!", "Reloading!"],
      allyDown: ["Lancer down!", "We lost a sworn one!"],
      greet: [
        "Civilian. Keep your weapons holstered in the outpost.",
        "The Iron Covenant holds this plaza. Behave.",
        "Move along, stranger. Nothing to salvage here.",
      ],
    },
    settler: {
      idle: [
        "Water's up two scrip again. Two!",
        "I used to sell insurance. Can you believe that? Insurance.",
        "If the oxen get out again I'm moving to Jersey.",
      ],
      alert: [
        "Raiders! Get inside!",
        "Trouble! Somebody help!",
        "Grab your guns, folks!",
      ],
      search: ["Who's there? I'm armed! ...Sort of."],
      lost: ["Must be my nerves.", "Probably just the wind."],
      combat: [
        "Stay back! I mean it!",
        "Get away from our homes!",
        "Somebody shoot it!",
      ],
      hurt: ["Ah! I'm bleeding!", "Help! I'm hit!"],
      flee: ["I'm not dying for this market!", "Run! Everybody run!"],
      kill: ["Did... did I get it?", "Oh lord, I actually hit it."],
      reload: ["Reloading!"],
      cower: [
        "Please don't hurt me!",
        "I have a family! Well, I had a cat.",
        "Take the scrip! Take the scrip!",
      ],
      greet: [
        "Welcome, friend. Wipe your feet, the floor's the only clean thing we got.",
        "You came out of the ice? Huh. You look... well-rested.",
        "Keep your weapon down in the market and we'll get along fine.",
        "Stranger. Good to see someone who isn't trying to eat me.",
        "Mind the dog. He bites. Mostly raiders.",
        "If you're buying, talk to the stalls. If you're stealing, talk to the guards.",
      ],
    },
    neon: {
      idle: [
        "Twenty-two years and my back STILL hurts.",
        "Nobody tell the topsiders the neon runs on borrowed power.",
        "Used to be an usher on Broadway. Still know every line.",
      ],
      alert: ["Maniacs! Or worse, tourists!", "Trouble on the square!"],
      combat: [
        "I've had worse days. I was THERE when it hit!",
        "Not on my square, you don't!",
      ],
      hurt: ["Ow! I'm a dancer, not a target!"],
      kill: ["Rest easy, pal."],
      reload: ["Loading up!"],
      greet: [
        "Welcome to The Neon. No census cards, no questions.",
        "Welcome to The Neon. Keep your hands where the lights can see them.",
        "Relax, stranger. I'm not the screaming kind. Just the grumpy kind.",
        "You look lost. Everybody looks lost. It's a whole thing here.",
      ],
    },
    glowkeeper: {
      idle: [
        "The light came down and made us new.",
        "Every burn a blessing, every blessing a burn.",
        "The sun touched the earth once. It will again.",
      ],
      alert: ["An unbeliever draws steel in the house of the Light!"],
      combat: ["The Light judges you!", "Burn clean!"],
      hurt: ["The pain is... radiant!"],
      greet: [
        "The Light upon you, traveler.",
        "Have you stood in the warm places, child?",
        "Stand closer to the crater stone. Closer. Feel that?",
      ],
    },
    patrolman: {
      idle: [
        "Scheduled maintenance overdue: eight thousand and twelve days.",
        "Please enjoy the exhibits. Do not touch the exhibits.",
        "All citizens are reminded: loitering is a misdemeanor.",
      ],
      alert: [
        "Halt, citizen. Present identification.",
        "Unauthorized visitor detected. Remain where you are.",
        "Please state your business. You have three seconds.",
      ],
      search: [
        "Scanning for unauthorized persons.",
        "Motion detected. Investigating.",
      ],
      lost: [
        "Scan complete. Resuming patrol route.",
        "Area secure. Have a pleasant day.",
      ],
      combat: [
        "Non-compliance detected. Commencing correction.",
        "Please remain still while you are corrected.",
        "Resistance has been noted in your permanent record.",
        "You have been found in violation.",
      ],
      hurt: [
        "Warning: chassis integrity compromised.",
        "Damage sustained. Filing incident report.",
      ],
      kill: ["Citizen corrected.", "Violation resolved."],
    },
    valet_m: {
      idle: [
        "Hup, two, three, four! Keep it tight, recruits!",
        "Perimeter secure, sir! Probably!",
        "Polishing my chassis for inspection, sir!",
      ],
      alert: [
        "Intruder! Sound the alarm!",
        "Continental infiltrator sighted! Deploying liberty!",
        "Unidentified civilian! Hands where I can see 'em!",
      ],
      search: [
        "Come out, you croissant-munching saboteur!",
        "I know you're out there, spy!",
      ],
      lost: [
        "Must've been a French pigeon. Back to patrol!",
        "All clear! The homeland holds!",
      ],
      combat: [
        "Have some liberty!",
        "You call that a haircut, recruit?!",
        "Burn, you subversive!",
        "The homeland never sleeps!",
      ],
      hurt: [
        "That the best you got?!",
        "Just a flesh wound! I don't HAVE flesh!",
      ],
      kill: ["Target liberated!", "Another victory for the homeland!"],
    },
    sky_eye: {
      alert: [
        "[Loudhailer crackles: ...exclusion zone... citizens will comply...]",
      ],
    },
    maniac: {},
    ripjaw: {},
    guard: {
      greet: [
        "Keep it civil and we'll keep you breathing.",
        "Market rules: no shooting, no stealing, no Rush on the stairs.",
        "Evening. Don't make me earn my scrip today.",
        "Heard somebody crawled out of a freezer downtown. That you? Welcome to the worst city in the world.",
      ],
      idle: [
        "Quiet shift. I love a quiet shift.",
        "My feet hurt. My everything hurts.",
      ],
      alert: ["Hostiles! Defend the market!", "Contact! Everybody down!"],
      combat: [
        "Keep them off the stalls!",
        "Push them back!",
        "Not in my market!",
      ],
      hurt: ["I'm hit!", "Ahh! Somebody cover me!"],
      kill: ["Got one!", "Down you go."],
      reload: ["Reloading!"],
    },
    merchant: {
      greet: [
        "Scrip, trades, IOUs from reputable skeletons. What'll it be?",
        "Everything's for sale, except my dignity. That went years ago.",
        "Ah, a customer! You look like someone with spare scrip.",
      ],
    },
  };
  /** Pick a random bark line from category; returns null if none. Old voice ids resolve. */
