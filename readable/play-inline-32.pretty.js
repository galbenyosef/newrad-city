/* src/sound/45_radio_text.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 45_radio_text.js
 * All on-air writing for the goggle radio stations:
 * "Rocky" Delgado on Radio Free Manhattan (the DJ the quests send you to
 * at Radio City), Acting President Marsh on Continuity Radio, the Office
 * of Civil Defense Emergency Broadcast, Classical NYC, the lyrics of the
 * sung records, and the four range-limited signals you can stumble on.
 * Placeholders: {name} the hero's name (G.HERO.name), {title} {artist}
 * current/prev song, {standing} standing title, {dj} / {djFirst} the DJ.
 * Lore: the '67 War (Europe bombed the United States), one bomb north of
 * Manhattan, the year is 1989 and the survivors call it New Rad City.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = G._snd;

  const T = (S.radioText = {});

  T.djName = "Rocky Delgado";

  // ------------------------------------------------------------------
  // RADIO FREE MANHATTAN — records (all fictional).
  // vocal: 'male' | 'female' | 'group' → sung by the formant singer (48_radio_voice.js) from the
  // lyrics below. Swing/ballad lyrics: A1 A2 B A3 (+ optional B2 A4 for the out-chorus), four 2-bar
  // lines each. Jump blues: `blues` verses [line, answer line], sung AAB.
  // ------------------------------------------------------------------
  T.rfmSongs = [
    {
      title: "Atomic Sweetheart",
      artist: "Dotty Mae and the Atomettes",
      style: "swing",
      lead: "clarinet",
      vocal: "group",
      tempo: 152,
      lyrics: {
        A1: [
          "Oh, my atomic sweetheart,",
          "you light up the whole night sky,",
          "one little kiss and my counter clicks,",
          "honey, and I don't know why.",
        ],
        A2: [
          "Oh, my atomic sweetheart,",
          "you split my heart right in two,",
          "fission or fusion, it's no illusion,",
          "every electron's for you.",
        ],
        B: [
          "Duck and cover when you call me,",
          "hide me in your shelter tight,",
          "let the sirens sing the chorus,",
          "we'll be dancing through the night.",
        ],
        A3: [
          "Oh, my atomic sweetheart,",
          "the half-life of love is long,",
          "when the whole world ends in a flash of light,",
          "honey, we'll still have this song.",
        ],
      },
    },
    {
      title: "Rust on the Chrysler",
      artist: "The Five Borough Bop Band",
      style: "swing",
      lead: "clarinet",
    },
    {
      title: "Neon Over Broadway",
      artist: "The Billy Brass Quintet",
      style: "swing",
      lead: "mute",
    },
    {
      title: "Two Bits and a Kiss",
      artist: "Ruby Castellano",
      style: "ballad",
      lead: "sax",
      vocal: "female",
      lyrics: {
        A1: [
          "Two bits and a kiss, that's all I've got,",
          "a tin can heart and a rusty pot,",
          "but if you'll stay till the morning comes,",
          "I'll trade you everything, sugar, but one.",
        ],
        A2: [
          "Two bits and a kiss for the lonely man",
          "who walked all night through this broken land,",
          "you can keep the water, keep the gun,",
          "the kiss is free for the lucky one.",
        ],
        B: [
          "Oh, the market's full of lovely things,",
          "radio tubes and diamond rings,",
          "but nothing sold in this old town",
          "is worth the way you come around.",
        ],
        A3: [
          "Two bits and a kiss, and the deal is done,",
          "under a sky with a sickly sun,",
          "I'll never barter, I'll never miss,",
          "for you, my darling, it's two bits and a kiss.",
        ],
      },
    },
    {
      title: "The Automat Shuffle",
      artist: "The Hudson River Rhythm Kings",
      style: "boogie",
    },
    {
      title: "Radiation Rhumba",
      artist: "Xavier Montoya and His Orchestra",
      style: "rhumba",
    },
    {
      title: "Lonesome in the Shelter",
      artist: "Tex Mulligan",
      style: "ballad",
      lead: "sax",
    },
    {
      title: "Subway Serenade",
      artist: "The Johnny Delano Trio",
      style: "swing",
      lead: "vibes",
    },
    {
      title: "Sugar Works Boogie",
      artist: "Big Earl Whitaker",
      style: "jump",
      horns: true,
      vocal: "male",
      tempo: 148,
      lyrics: {
        blues: [
          [
            "Well, I woke up this morning, Freedom Flakes up in my bowl,",
            "it went crunch, it went crackle, and it lit up my very soul.",
          ],
          [
            "Now my baby up and left me, took my Fizzo and my car,",
            "but I got my Freedom Flakes, baby, and I don't need to go that far.",
          ],
          [
            "Doctor says, Earl, you're glowing, better put that spoon away,",
            "I said, Doc, I'm gonna boogie, I'll be glowing anyway.",
          ],
          [
            "So pour another bowl, let the milk be twenty years,",
            "Sugar Works boogie gonna chase away my fears.",
          ],
        ],
      },
    },
    {
      title: "Harbor Lights at Midnight",
      artist: "The Liberty Belles",
      style: "ballad",
      lead: "clarinet",
      vocal: "group",
      lyrics: {
        A1: [
          "Harbor lights at midnight,",
          "shining on the sea,",
          "somewhere past the lady's torch,",
          "you're sailing home to me.",
        ],
        A2: [
          "Harbor lights at midnight,",
          "flicker, fade and glow,",
          "the ferry's gone, the river's green,",
          "but still I'll never go.",
        ],
        B: [
          "Every night I watch the water,",
          "every night I light a flare,",
          "though the tide brings only shellbacks,",
          "I will wait for you right there.",
        ],
        A3: [
          "Harbor lights at midnight,",
          "burning soft and low,",
          "come back to me on Liberty's tide,",
          "I'll never let you go.",
        ],
      },
    },
    {
      title: "Don't Drink the River Water",
      artist: "Cootie Maxwell and the Mercury Seven",
      style: "jump",
      horns: true,
      vocal: "male",
      tempo: 156,
      lyrics: {
        blues: [
          [
            "Don't drink the river water, don't you drink it, don't you dare,",
            "it'll turn your toes to green and put a third eye in your hair.",
          ],
          [
            "My cousin drank the Hudson, now he's glowing in the dark,",
            "we use him for a night light when we're walking through the park.",
          ],
          [
            "Don't swim the East River, there's a shellback on the shore,",
            "he'll pinch you in the places that you never pinched before.",
          ],
          [
            "So bring a can of Fizzo, bring a bottle from the store,",
            "don't drink the river water, or you won't drink any more.",
          ],
        ],
      },
    },
    {
      title: "Moon Over the Reservoir",
      artist: "Vera Lindqvist",
      style: "ballad",
      lead: "clarinet",
    },
    {
      title: "Park Avenue Promenade",
      artist: "The Gotham Swing Collective",
      style: "swing",
      lead: "trumpet",
    },
    {
      title: "Mambo for a Mushroom Cloud",
      artist: "The Tito Ruiz Orchestra",
      style: "rhumba",
    },
    {
      title: "Brooklyn Bridge at Dawn",
      artist: "The Artie Kessler Sextet",
      style: "swing",
      lead: "sax",
    },
    {
      title: "Duck and Cover, Darling",
      artist: "The Sweethearts of Sector Nine",
      style: "swing",
      lead: "vibes",
      vocal: "group",
      lyrics: {
        A1: [
          "Duck and cover, darling,",
          "hold me close and low,",
          "when the siren's wailing,",
          "that's our cue to go.",
        ],
        A2: [
          "Duck and cover, darling,",
          "underneath the desk,",
          "we can practice kissing",
          "while they run the test.",
        ],
        B: [
          "Mister Civil Defense says hurry,",
          "get your head down, close your eyes,",
          "but I'd rather see you smiling",
          "than a pretty mushroom rise.",
        ],
        A3: [
          "Duck and cover, darling,",
          "baby, don't be slow,",
          "if the world should end tonight,",
          "I want you to know.",
        ],
      },
    },
    {
      title: "Glowing for You",
      artist: "Mel Fontaine",
      style: "ballad",
      lead: "sax",
      vocal: "male",
      lyrics: {
        A1: [
          "I'm glowing for you, baby,",
          "like a lamp in the dark,",
          "my Geiger counter's singing",
          "every time you leave your mark.",
        ],
        A2: [
          "I'm glowing for you, darling,",
          "and the doctor says it's bad,",
          "but a little bit of radiation",
          "is the sweetest love I've had.",
        ],
        B: [
          "They tell me take my Prussian Blue,",
          "they tell me stay inside,",
          "but I'd walk the whole Manhattan glow",
          "to have you by my side.",
        ],
        A3: [
          "I'm glowing for you, honey,",
          "now and ever through,",
          "when the stars burn out above us,",
          "I'll be glowing just for you.",
        ],
      },
    },
    {
      title: "Last Train from Grand Central",
      artist: "Ellis 'Sparky' Jones",
      style: "boogie",
    },
    {
      title: "Coffee and Corned Beef",
      artist: "The Nat Pemberton Quartet",
      style: "swing",
      lead: "clarinet",
    },
    {
      title: "Kiss Me Before the Sirens",
      artist: "Lana Duvall",
      style: "ballad",
      lead: "clarinet",
      vocal: "female",
      lyrics: {
        A1: [
          "Kiss me before the sirens,",
          "kiss me before the light,",
          "hold me like there's no tomorrow,",
          "maybe there's no tomorrow night.",
        ],
        A2: [
          "Kiss me before the sirens,",
          "whisper my name once more,",
          "the radio says hurry, darling,",
          "they're closing the shelter door.",
        ],
        B: [
          "Let the whole world run for cover,",
          "let the city hold its breath,",
          "I'd rather have one minute with you",
          "than a hundred years of rest.",
        ],
        A3: [
          "Kiss me before the sirens,",
          "kiss me and don't let go,",
          "and if the sky should fall on Broadway,",
          "at least, my love, I'll know.",
        ],
      },
    },
    {
      title: "Tickets to the Automatic Future",
      artist: "The Starlite Sweethearts",
      style: "swing",
      lead: "vibes",
    },
    {
      title: "Ration Scrip Blues",
      artist: "Lightnin' Lou Gaines",
      style: "jump",
      horns: false,
    },
    {
      title: "Love Among the Ruins",
      artist: "Frankie Delmonico",
      style: "ballad",
      lead: "sax",
      vocal: "male",
      lyrics: {
        A1: [
          "Love among the ruins,",
          "flowers through the stone,",
          "the city's lost its lights, my dear,",
          "but we are not alone.",
        ],
        A2: [
          "Love among the ruins,",
          "dancing in the dust,",
          "the Chrysler's gone to rust, my dear,",
          "but not the two of us.",
        ],
        B: [
          "Broadway's dark and Fifth is empty,",
          "no one's riding on the train,",
          "but I hear the music playing",
          "every time you say my name.",
        ],
        A3: [
          "Love among the ruins,",
          "stars above the park,",
          "just hold my hand and we will find",
          "our way home in the dark.",
        ],
      },
    },
    {
      title: "The Half-Life of Love",
      artist: "Dean Carrow and the Uptown Swingers",
      style: "swing",
      lead: "mute",
      vocal: "male",
      tempo: 132,
      lyrics: {
        A1: [
          "The half-life of love, baby,",
          "lasts a long, long time,",
          "ten thousand years of kisses,",
          "and every one is mine.",
        ],
        A2: [
          "The half-life of love, honey,",
          "never fades away,",
          "you can bury it in concrete,",
          "it'll glow another day.",
        ],
        B: [
          "Oh, the fellas in the lab coats",
          "measured my heart with a dial,",
          "they said, son, you're off the scale,",
          "every time she flashes that smile.",
        ],
        A3: [
          "The half-life of love, baby,",
          "is forever and a day,",
          "when the mushroom clouds have cleared, dear,",
          "I'll still be here to stay.",
        ],
      },
    },
  ];

  // ------------------------------------------------------------------
  // The DJ: "Rocky" Delgado. A Bronx kid, a three-time Golden Gloves runner-up
  // at the old Garden before the bombs (nineteen in the summer of '66), now broadcasting from the sub-basement
  // of Radio City Music Hall with ROCKETTE-7, his stagehand robot, and a pot of
  // something that is not coffee. Talks about himself in the third person,
  // calls everybody "champ", rings an imaginary bell ("ding ding!").
  // His old block in the Bronx is a crater now; he jokes about everything else.
  // Before MQ03 (the Signal Amplifier) his transmitter barely reaches past
  // Sixth Avenue: the *Weak lines play then; afterwards he's LOUD.
  // ------------------------------------------------------------------
  T.djGreetWeak = [
    "...hello? Is this thing on? ROCKETTE, is the needle moving? It's moving. Good day, Manhattan, this is Rocky Delgado on Radio Free Manhattan, coming to you on a transmitter held together with chewing gum and a prayer. If you can hear me, champ, you're closer to Radio City than you think.",
    "This is Radio Free Manhattan, the Voice of the Five Boroughs, currently reaching about one and a half of 'em. Rocky's amplifier is shot, champ. So lean in close to that radio. Closer. Closer. That's the stuff.",
    "Good evening, whoever's out there. Rocky Delgado here, broadcasting live from Radio City Music Hall, with a signal so weak it's technically a rumor. Stay in your corner. Rocky's still swinging.",
    "[whoop] Ding ding! Hey hey, New York! It's Rocky. If this sounds like I'm talking through a tin can at the bottom of the Hudson, that's because I basically am. Somebody find me an amplifier. I'll play your song. *Twice.*",
  ];
  T.djGreet = [
    "Good day, Manhattan! This is Rocky Delgado, the Voice of the Five Boroughs, the Bronx Bomber of the Airwaves, coming at you loud and clear from Radio City Music Hall. The last voice in the Big Apple that isn't trying to bite you.",
    "[whoop] Ding ding! Round one, New York! Rocky here. If you can hear this, congratulations: you're alive, you've got a radio, and you're already ahead on points.",
    "You're listening to Radio Free Manhattan. The signal's strong, the coffee's radioactive, and the records are older than the war. Just like Rocky. [laugh] Kidding. Mostly.",
    "Rise and shine, Rad City, or whatever's left of you! It's Rocky Delgado on Radio Free Manhattan, coming to you from the finest ruined music hall on the East Coast.",
    "Radio Free Manhattan! Free because nobody pays for it, Manhattan because Rocky refuses to be Radio Free Hoboken. [whoop] Let's go!",
  ];
  T.djIntro = [
    "Here's a little something from {artist}. It's called '{title}'.",
    "Let's slow things down, champ. This is {artist} with '{title}'.",
    "ROCKETTE found this one in a box under the stage. Smells like mildew and *victory.* '{title}', by {artist}.",
    "This next one goes out to the convoy guards on the Grand Central run. Keep those shotguns warm. '{title}'.",
    "Folks, if you're dancing right now, make sure it's not because something's biting you. Here's {artist}.",
    "One of Rocky's personal favorites. {artist}, '{title}'.",
    "Request line's open! Nobody called, so Rocky's picking. '{title}'.",
    "Put your feet up, check your Geiger counter, and enjoy {artist}.",
  ];
  T.djIntroVocal = [
    "Here's {artist} to sing you a little something. '{title}'.",
    "Now this one's got words, champ, and the words are beautiful. {artist}, '{title}'.",
    "Rocky used to sing this one in the shower, back when he had a shower. {artist}, with '{title}'.",
    "Lend an ear to {artist}. They're singing '{title}', and they mean every word.",
  ];
  T.djOutro = [
    "That was {artist} with '{title}'. They don't make 'em like that anymore. Mostly because nobody makes *anything* anymore. [chuckle]",
    "'{title}'. Ahh. You know, before the bombs, people used to listen to that in elevators. Elevators! A box that takes you up for *free!* [laugh]",
    "{artist}, everybody. May they rest in peace, or at least in pieces. [chuckle]",
    "Mm-hmm. '{title}'. If that didn't warm your heart, it might be the radiation. Either way, you're welcome.",
    "That was '{title}'. Keep it locked right here, Manhattan.",
    "Beautiful. Just beautiful. ROCKETTE, pass Rocky a tissue. A clean one, if we've got one.",
  ];
  T.djOutroVocal = [
    "That was {artist}, singing '{title}'. Champ, they don't write lyrics like that anymore. They don't write anything anymore.",
    "'{title}', by {artist}. Now tell me that didn't make you want to slow dance with a mannequin. No? Just Rocky? [sigh] Okay.",
    "{artist}, with '{title}'. Somebody out there knows every word to that one. Sing it louder, champ. Rocky can hear you.",
    "Ahh, '{title}'. {artist}. If you were holding somebody during that one, hold 'em a little longer. It's a dangerous city.",
    "That was {artist} with '{title}'. ROCKETTE, stop crying. You don't have tear ducts. You're leaking coolant. [laugh]",
  ];
  T.djBanterWeak = [
    "If Rocky's cutting out on you, don't touch that dial. Touch the antenna. Wiggle it. There. [chuckle] That's love.",
    "Zeke Marlow came by the station the other day, talking about strange signals off the Statue of Liberty. Rocky catches bits of 'em, but he can't pull 'em in clean on this old rig.",
    "Folks, the transmitter's running hot again. ROCKETTE's fanning it with a pie tin. If you smell burning, that's just the future of broadcasting. [laugh]",
    "Word to anyone with a screwdriver and a conscience: Radio City needs a proper broadcast amplifier. Rocky pays in scrip, gratitude and free song dedications.",
  ];
  T.djBanter = [
    "A friendly reminder from Rocky: the folks down in The Neon never signed up for anybody's census, and they're still the best neighbors in Midtown. Tip your bartender. He's had a rougher twenty years than you, and he has feelings.",
    "Word from Rockefeller Center: the Iron Covenant say they're 'recovering old-world technology.' Near as Rocky can tell, that means his toaster. Give it back, fellas. [chuckle]",
    "The Glowkeepers at Saint Patrick's want you to know that the bomb was a blessing. Rocky wants you to know that the glow is also how they find you in the dark. Choose wisely.",
    "Traders at Grand Central Market report prices are steady. Clean water, two scrip. A bottle of Rally Tonic, twenty. Your dignity, sadly, still worth *nothing.*",
    "If you're passing Wall Street, Bear Market Betty's boys at the Exchange are charging a toll. The toll is everything you own. Rocky recommends a detour.",
    "Uptown folks: stay out of the North Woods. I don't care what you heard. Whatever's making that noise is *not* a big dog.",
    "Down at Battery Park, the shellbacks are nesting again. Rule of thumb, champ: if a rock stands up, it's not a rock. *Run.*",
    "The Flatiron Trading Post is open for business. They'll buy your junk, sell you their junk, and call it commerce. Beautiful. Very American.",
    "Some fella came by the station today asking if Rocky was 'the real Rocky Delgado.' Buddy, I'm the only Rocky left. That makes me the real one by decision. [laugh]",
    "Rocky's been counting. That's four hundred and twelve days without a new record. You find vinyl out there, bring it to Radio City. I'll trade scrip and gratitude. Mostly gratitude. [chuckle]",
    "Weather report: cloudy with a chance of glow. Same as yesterday. Same as tomorrow. I'd tell you to bring an umbrella, but it won't help.",
    "Reminder to all you scavengers: that can of pork and beans is twenty-two years old. It is also delicious. Rocky doesn't make the rules.",
    "Stay away from the reservoir, kids. The water's not the only thing in there that'll kill you, but it's definitely on the list.",
    "The subway under Forty-Second Street is not a shortcut. It's a long cut. It's the *longest* cut. Nobody who takes it arrives anywhere.",
    "You know what Rocky misses? Pizza. Actual pizza. Not the thing they sell at The Neon that's technically pizza-shaped.",
    "To whoever keeps painting 'Rocky Lives' on the Radio City marquee: thank you. Also, please stop. The raiders think it's a dare. [laugh]",
    "Liberty Island's lit up like a Christmas tree at night. That's not a party, folks. That's the Continuity. Stay on your side of the harbor.",
    "Shout-out to Rosa over at Grand Central. She says she didn't cry last week. Rosa, champ, it's radio. Nobody saw *anything.* [chuckle]",
    "ROCKETTE wants everyone to know she's taking dance requests again. She has one move. It's a kick. It's a *very* good kick.",
    "A listener writes: 'Dear Rocky, is it safe to eat a burrow rat?' Champ, it's safe to eat anything once. Twice is where it gets complicated. [laugh]",
    "Okay, okay, okay, quick one before the next record, champ: Rocky's got water, Rocky's got scrip, Rocky's got a *roof,* and not one single working toilet. [laugh] Living the dream, Manhattan. Living the dream.",
    "You ever notice nobody in this town walks anymore? They run. From Maniacs, from raiders, from the Covenant, from their landlord. [chuckle] Cardio, folks. The Ruins keep you *trim.*",
    "Tollbooth Tony on the Brooklyn Bridge says his toll is 'very reasonable.' Tony, Rocky has seen your prices. Rocky has seen your face. *Neither* is reasonable.",
    "Twenty-two years, folks. Twenty-two years since the sirens. Every kid in this country spent the fifties hiding under a desk from the Russians, and then the bombers came from Europe. Two planes, one flash. Nobody saw that one coming. Rocky sure didn't. [sigh]",
    "Rocky's old block in the Bronx is a hole in the ground now. Biggest hole in New York. I don't go up there. But some nights, champ, I play this next one loud enough for the old neighborhood.",
    "A traveler from the west came through Radio City last week. Says Chicago looks like us. Says Philly looks worse. Says nobody anywhere has a working jukebox. So, folks, appreciate what you got.",
    "The Continuity's drones were buzzing over Herald Square again, reading the Acting President's speeches to a pile of bricks. The bricks were very attentive. [chuckle]",
  ];
  T.djPSA = [
    "A Radio Free Manhattan public service announcement: if your water glows, don't drink it. If your food glows, don't eat it. If your friend glows, give them a little space. [chuckle]",
    "Public service announcement: giant roaches are not a food group. Well. They're a food group. But it's a sad one.",
    "Friendly reminder from Rocky: a Rally Tonic in the pocket beats ten in the ground. Stock up, stay safe.",
    "Public service announcement: when a Brute says 'come closer,' do not come closer. When a Brute says *anything,* do not come closer.",
    "Iodine tabs before the storm, Prussian Blue after. That's not a jingle, champ, that's a lifestyle.",
    "Always carry your keys. Every key you find, keep it. Somewhere in this city there's a door that's been waiting twenty years for you.",
  ];
  // The sleeper from Cryo Unit C-9: name and standing-title callouts (the hero has come up to the streets).
  T.djPlayer = {
    good: [
      "Shout-out to {name}, the iceman from under the Municipal Building. Folks are calling you '{standing}' now. Rocky's getting a little misty over here, champ.",
      "Every time Rocky hears a story about {name}, it ends with somebody still alive. In this city! Keep it up, {standing}.",
      "This next hour of Radio Free Manhattan is dedicated to {name}, better known on the street as '{standing}'. You make an old Golden Gloves runner-up believe in people again.",
    ],
    neutral: [
      "Where in the world is {name}, the fella who slept through the war? Last Rocky heard, somewhere between a saint and a sinner. The street's calling you '{standing}'. It's a start, champ.",
      "Keeping tabs on our favorite sleeper, {name}. Not good, not bad, just… busy. The Big Apple's still making up its mind about you.",
      "Hey, {name}! Yeah, you, in the grey padded suit with the orange collar. Rocky sees you. Wave to the radio. Nobody will think it's weird.",
    ],
    evil: [
      "Folks are calling {name} '{standing}' now. Champ, Rocky remembers when you came up out of that cellar blinking at the sun. What happened?",
      "A word to {name}, the iceman. People are scared of you. Rocky's scared of you. Rocky is also still playing your requests, so maybe go easy on Radio City.",
      "Keep your doors locked, Manhattan. '{standing}' is walking your streets, and it answers to the name {name}.",
    ],
  };
  // Faction choice (MQ04 "The Company You Keep": quests flag mq_faction = 'covenant' | 'continuity' | 'none').
  T.djFaction = {
    pending: [
      "Word is the iceman has been shopping for friends. The Iron Covenant at Rockefeller, the Continuity at the U.N. Champ, choose carefully. One of 'em has ray guns. The other one also has ray guns.",
      "Rocky's advice to anybody picking sides in this town: pick the side that lets you keep listening to Radio Free Manhattan.",
    ],
    covenant: [
      "Big news from Rockefeller Center: {name} is running with the Iron Covenant now. Exo-rigs, gyrojets, the works. Fellas, if you're listening: Rocky still wants his toaster back.",
      "The Covenant's got a new friend, and the Continuity's got a new headache. Nice work, champ. Watch the skies over the East River.",
    ],
    continuity: [
      "Well, folks, it's official. {name} has been seen shaking hands with the Continuity at the U.N. Rocky's not saying anything. Rocky is choosing his next words very, very carefully.",
      "The iceman went and signed up with the Continuity. Makes sense, I guess. You both think it's still 1967. Champ, Rocky played you a lot of songs. Remember that when they start checking papers.",
    ],
    none: [
      "The iceman told the Covenant AND the Continuity to take a hike. Going it alone, huh? Rocky respects that. Rocky also fears for you. Both at once.",
      "Nobody owns {name}. Not the Covenant, not the Continuity. Just the open road and a pair of goggles full of Rocky's greatest hits.",
    ],
  };
  // Kong, the Brute king of the Empire State (quests flags kong_friend / kong_dead / kong_resolution).
  T.djKong = {
    friend: [
      "Update from Thirty-Fourth Street: Kong, king of the Empire State, is reportedly in love. With a mannequin. Her name is Fay. Rocky wishes them every happiness and a very tall wedding cake.",
      "This next song goes out to Kong and Fay, up on the observation deck. Big guy, if you're listening: Rocky got your letter. Yes, we'll play the good song again.",
    ],
    dead: [
      "The Empire State Building is quiet tonight, folks. Kong, the Brute who called himself a king, is dead. He wrote Rocky letters, you know. In crayon. Very large crayon.",
      "No more roaring from the top of the Empire State. Somebody put the king down. Rocky's not gonna pretend he's sad. But Rocky is gonna play something quiet.",
    ],
    speech: [
      "Somehow, somebody talked Kong the Brute king out of his favorite shiny rock. With words! The iceman has a silver tongue, folks. Or a death wish. Probably both.",
    ],
    trick: [
      "Rumor from Midtown says Kong gave up his prize because somebody told him it was making him smaller. Champ, that's the cruelest, cleverest thing Rocky's heard all year.",
    ],
  };
  T.djNewsIntro = [
    "News time, Manhattan. ",
    "Here's what's happening out there in the concrete jungle. ",
    "This just in, and by 'just in' Rocky means somebody yelled it through the window. ",
    "Radio Free Manhattan news desk, which is also Rocky's kitchen table. ",
    "Bulletin! ROCKETTE, hit the teletype. ",
  ];
  T.djNewsOutro = [
    "Back to the music.",
    "That's the news. Now back to the good stuff.",
    "More as it happens, champ. Or as somebody tells Rocky. Whichever comes first. [chuckle]",
  ];
  T.djSignOff = [
    "[breath] This has been Rocky Delgado. Keep your guard up and your radio louder. [whoop]",
    "Stay tuned, stay alive, and stay away from anything with more than six legs.",
  ];

  // Reactive news written by the sound module itself (quests add their own via G.radio.addNews)
  T.news = {
    sleeperOut: [
      "Folks, you are not going to believe this. A fella in a grey padded suit with an orange collar came walking up out of the Municipal Building downtown, blinking at the sun like he'd been asleep for twenty years. Word is he *was.* Some government icebox under Centre Street. Welcome back to New York, champ. Mind the rats. They got bigger while you were out.",
    ],
    standingGood: [
      "Word on the street is that our iceman from downtown, {name}, has been helping people. Actually helping! In this city! Rocky's getting a little choked up here.",
      "Another good deed from {name}. Keep this up, champ, and folks might start trusting each other again. Terrifying thought.",
    ],
    standingVeryGood: [
      "Ladies and gentlemen, the sleeper. {name}. They say saints don't exist anymore. They say a lot of things. Manhattan, we've got ourselves a hero.",
    ],
    standingBad: [
      "Keep your doors locked tonight, Manhattan. That new face from under the Municipal Building, {name}, has been leaving a trail of trouble a mile wide.",
      "Rocky's been hearing some ugly things about {name}. Now, Rocky's not one to judge. But Rocky is one to warn. Consider yourselves warned.",
    ],
    standingVeryBad: [
      "{name}. Rocky's gonna say this once. Whatever you are now, New York remembers what it was like to be scared. Don't make us remember.",
    ],
    killsBrutes: [
      "Somebody's been thinning out the Brutes around Midtown. Big grey bodies all over Thirty-Fourth Street. Whoever you are, the pigeons thank you. The pigeons are also terrified of you.",
    ],
    killsRaiders: [
      "Raider numbers are down this week. Down, as in, lying down, permanently. Rumor says it's that iceman. Remind Rocky never to borrow money from him.",
    ],
    killsManiacs: [
      "Maniac sightings are dropping across Midtown. Fewer screams at night, folks. Somebody's been doing hard, sad work with a lot of bullets. Those were people once. Rocky hopes they're resting now.",
    ],
    ripjaw: [
      "Hold the phone. A ripjaw. Dead. Somebody put down a ripjaw in this city. Folks, Rocky doesn't know whether to celebrate or hide under the desk. Rocky's doing both.",
    ],
    // used only when the quests module isn't running (it writes its own location news)
    empire: [
      "Rumor has it somebody walked into the Empire State Building and walked back out. With all their limbs. Let's all take a moment to be impressed.",
    ],
    liberty: [
      "Something's stirring out on Liberty Island. Searchlights, engines, the works. If you've got business with the Continuity, bring a very big gun and a very good excuse.",
    ],
    bridge: [
      "Travelers report the toll gate on the Brooklyn Bridge is back in business. The raiders call it a fee. Rocky calls it robbery with extra steps.",
    ],
  };

  // ------------------------------------------------------------------
  // CONTINUITY RADIO (also carried through the city by Sky-Eye drones).
  // The remnant federal government at the U.N.: uniformed, bureaucratic, and
  // officially still living in March 1967. Acting President Marsh took the
  // oath in a bunker on the first night and has never stopped broadcasting.
  // ------------------------------------------------------------------
  T.continuityMarches = [
    {
      title: "Liberty Stands Eternal",
      artist: "The Continuity Band of the United States",
      style: "march",
      key: "Bb",
    },
    {
      title: "Pride of the Eastern Seaboard",
      artist: "The Continuity Band of the United States",
      style: "march",
      key: "Eb",
    },
    {
      title: "The Gateway of Freedom",
      artist: "The Continuity Band of the United States",
      style: "march",
      key: "F",
    },
    {
      title: "Columbia Unbowed",
      artist: "The Continuity Band of the United States",
      style: "march",
      key: "Bb",
    },
    {
      title: "American Steel",
      artist: "The Continuity Band of the United States",
      style: "march",
      key: "Eb",
    },
    {
      title: "Sentinels of the Harbor",
      artist: "The Continuity Band of the United States",
      style: "march",
      key: "F",
    },
  ];
  T.continuityAnnouncer = [
    "This is Continuity Radio, broadcasting for the lawful government of the United States of America, in continuous session since March, 1967.",
    "You are listening to Continuity Radio. Please stand by for an address from the Acting President of the United States.",
  ];
  T.continuitySpeeches = [
    "My fellow Americans. For twenty years we were told to watch the east, past Europe, toward Moscow. We built our shelters for that war. And then the bombers came from our friends. From the capitals whose beaches we bled on. I will not pretend to understand it. I will only tell you this: the government of the United States did not fall. It is speaking to you now.",
    "When I was a boy, my father took me down into the subway at Forty-Second Street. Thousands of Americans, shoulder to shoulder, and every train on time. Today those tunnels belong to the dark. The Continuity will open them again, station by station. Every car will run on schedule. Every passenger will be counted. And every passenger, I assure you, will be registered.",
    "Some of you have seen our rotorcraft over the East River and asked, 'Are they here to help?' Of course they are. Helping is what a government does. We also count, inspect, license and file. But first, and always, we help.",
    "I have received a letter, a single letter, asking why the Continuity has taken residence at the United Nations. It is simple. The nations of Europe have left their chairs empty. A government must sit somewhere. We have chosen to sit where everyone can see us.",
    "One device detonated north of this island, over the line between the Bronx and Yonkers. The Office of Civil Defense has the figures. The Office of Civil Defense has not reported since that morning. I am told that this is entirely normal, and that its report is simply late.",
    "Some of you have been telling your children that it is 1989. I understand the impulse. But a great nation does not change its calendar because of one bad winter. Until the emergency is lifted by proper authority, it is March, 1967. It will remain March, 1967, for as long as it takes.",
    "Federal ration scrip remains legal tender in every borough of this city. Accept it. Honor it. A merchant who refuses scrip refuses the United States, and the United States keeps a list.",
    "To the citizens sheltering in the ruins of Midtown: do not be afraid of the searchlights. The searchlights are a service. If you do not feel reassured by them, please present yourself at the nearest checkpoint, and we will reassure you in person.",
    "There is a statue in our harbor. She was a gift, you will recall, from the people of France. In light of recent events, the Continuity has placed her under observation. We are confident she has nothing to hide. We are watching her anyway.",
    "A message to the armored gentlemen of the Iron Covenant at Rockefeller Center. The machinery you have salvaged is federal property. Your Wardens may return it to any Continuity office during regular hours. A receipt will be issued. That is all. For now.",
    "Remember: a good citizen reports burns, sickness and mutation to the proper authorities. A great citizen reports their neighbors, too. Together we will build the spring that was promised to us.",
    "I understand a certain disc jockey at Radio City has been saying unkind things about your government. We are listening, Mister Delgado. We are always listening. Please, continue. Every word is being filed.",
  ];
  T.continuitySignoff = [
    "God bless you, and God bless the United States of America.",
    "This is your Acting President, signing off. Remain calm, remain counted, New York.",
  ];

  // ------------------------------------------------------------------
  // OFFICE OF CIVIL DEFENSE — EMERGENCY BROADCAST (a recording from the morning
  // of the Bombing, Sunday 09:47, looping on an automatic transmitter for twenty-two years)
  // ------------------------------------------------------------------
  T.ebsSpeaker = "Civil Defense";
  T.ebs = [
    "This is the Office of Civil Defense Emergency Broadcast System. This is not a test. A state of emergency has been declared for the New York metropolitan area. Proceed calmly to the nearest public shelter. Civil Defense staff and reserve volunteers: report at once to your assigned posts. Do not run. Running spreads panic.",
    "This is the Office of Civil Defense Emergency Broadcast System. If you are hearing this message, remain indoors, close all windows, and place a damp towel beneath the door. Do not look toward the north. If you do not have a towel, use a coat. If you do not have a coat, the Office of Civil Defense regrets that you did not read the pamphlet.",
    "Attention. This is a recorded message from the Office of Civil Defense. Your shelter is your home, your community, and your future. Shelter doors will seal in accordance with protocol. Remain calm. Await further instructions. Further instructions will follow. This message will repeat.",
  ];

  // ------------------------------------------------------------------
  // CLASSICAL NYC
  // ------------------------------------------------------------------
  T.classicalPieces = [
    {
      title: "Nocturne in E minor",
      artist: "Josef Albrecht",
      style: "classical",
      form: "nocturne",
      key: "D",
      minor: true,
    },
    {
      title: "Sonata in C major, first movement",
      artist: "Friedrich Weller",
      style: "classical",
      form: "sonata",
      key: "C",
      minor: false,
    },
    {
      title: "Adagio for Strings in D minor",
      artist: "Clara Vandermeer",
      style: "classical",
      form: "adagio",
      key: "D",
      minor: true,
    },
    {
      title: "Hudson Waltz",
      artist: "Anton Lehrer",
      style: "classical",
      form: "waltz",
      key: "F",
      minor: false,
    },
    {
      title: "Sonatina in G",
      artist: "Aurelio Benedetti",
      style: "classical",
      form: "sonata",
      key: "G",
      minor: false,
    },
    {
      title: "Elegy for the Empire City",
      artist: "Clara Vandermeer",
      style: "classical",
      form: "adagio",
      key: "C",
      minor: true,
    },
    {
      title: "Nocturne in A-flat",
      artist: "Josef Albrecht",
      style: "classical",
      form: "nocturne",
      key: "Ab",
      minor: false,
    },
    {
      title: "Waltz of the Crystal Ballroom",
      artist: "Anton Lehrer",
      style: "classical",
      form: "waltz",
      key: "Bb",
      minor: false,
    },
    {
      title: "Sonata in A minor",
      artist: "Friedrich Weller",
      style: "classical",
      form: "sonata",
      key: "D",
      minor: true,
    },
  ];
  T.classicalIntro = [
    "Good evening. You are listening to Classical New York. Next, {artist}: {title}.",
    "Classical New York continues with {title}, by {artist}. A reminder that civilization, too, was here before the bombs.",
    "And now, from the archives of the old Philharmonic: {artist}'s {title}.",
    "Please, take a moment. Set down the rifle. Here is {title}.",
  ];
  T.classicalOutro = [
    "That was {title}, by {artist}. You are listening to Classical New York.",
    "{artist}. Some things endure. You are listening to Classical New York.",
    "Lovely. Classical New York will return after a brief moment of dignified silence.",
  ];

  // ------------------------------------------------------------------
  // RANGE-LIMITED SIGNALS (only on the dial within ~250 m of the source).
  // Tuning one in for the first time marks its location on the map and emits
  // 'radioSignalFound' for quests to hook.
  // ------------------------------------------------------------------
  T.signals = {
    // Cryo Unit C-4: a flooded Project Long Winter site's looping distress tape, from under Battery Park.
    c4: {
      speaker: "Director Brandt",
      profile: "director",
      lines: [
        "Mayday. Mayday. This is Facility Director Brandt of Cryo Unit C-4, Project Long Winter, Battery Park, Manhattan. The harbor has breached the seawall coupling. The pumps are down and the generator is dead. Every pod has been thawed. Sixty-one of us are waiting on the upper deck. Office of Civil Defense, if you receive this, please respond. Anyone. Please respond.",
        "This is Cryo Unit C-4. Day six since the breach. The pressure door is under water and we cannot open it from inside. To anyone who can hear this: the freight hatch is on the seawall, north of the old ferry pier. Please. This is Director Brandt. This message will repeat.",
      ],
    },
    // A numbers station by the U.N.: the Continuity's coded name readings (Static Okonkwo decodes them in
    // "Numbers Game"). The Morse repeats "Z MARLOW LIBERTY": Zeke is held on Liberty.
    numbers: {
      speaker: "Unidentified",
      profile: "numbers",
      morse: "Z MARLOW LIBERTY",
      lines: [
        "Attention. Attention. Seven. Four. Four. One. Nine. Three. Three. Eight. Zero. Two. One. Two. Zero. Five. Five. Repeat. Seven. Four. Four. One. Nine. Three. Three. Eight. Zero. Two. End of message.",
        "Attention. Group one. Six. Zero. Zero. Four. One. Group two. Nine. Nine. Two. Seven. Three. Group three. One. Two. Zero. One. Two. Zero. End of message.",
      ],
    },
    // Lancer Rask's exo-rig, pinned under a fallen gantry: the suit's automatic transponder.
    covenant: {
      speaker: "Exo-rig Transponder",
      profile: "transponder",
      lines: [
        "Iron Covenant exo-rig transponder. Lancer I. Rask, Survey Detail Harrow. Status: immobile. Repeat. Status: immobile.",
        "Iron Covenant exo-rig transponder. Lancer I. Rask, Survey Detail Harrow. Status: immobile. Any Covenant unit, respond on this frequency.",
      ],
    },
    // Bear Market Betty's "closing bell" ransom broadcast from the Stock Exchange.
    ransom: {
      speaker: "Bear Market Betty",
      profile: "raider",
      lines: [
        "Good evening, Manhattan, this is Bear Market Betty with the closing bell. Today's hot commodity: one convoy master, name of Harlan Pruitt, slightly used. Opening bid is five hundred in scrip, delivered to the Exchange by sundown. Every day you wait, the price goes up and Harlan goes down. One floor at a time.",
        "Market update from the Exchange. Harlan Pruitt is holding steady. Harlan Pruitt is also holding a rope. Five hundred scrip, Grand Central. You know where we are. Everybody knows where we are. That's the whole point.",
      ],
    },
  };
})();
