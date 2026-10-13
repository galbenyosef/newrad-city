// play-inline-34 01 — the
// Lines 17-270 of readable/play-inline-34.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;
  const T = S.radioText;

  // ------------------------------------------------------------------
  // THE DAWN HOUR (captions only). Each sermon: array of caption lines.
  // A line given as [speaker, text] overrides the speaker for that line.
  // ------------------------------------------------------------------
  S.dawnText = {
    speaker: "The Dawn",
    station: "The Dawn Hour",
    open: [
      "It is forty-seven minutes past five. Light a candle if you have one. If you have none, sit close to someone who does. This is the Dawn Hour.",
      "Good morning, children of the Long Noon. Somebody has to keep the light on. This morning it is us.",
      "Forty-seven past five. The city is dark and we are awake in it. This is the Dawn Hour, and you are not alone.",
    ],
    close: [
      "Keep your candle dry. Keep your neighbour warm. A dimanche.",
      "The Sun does not choose. Neither will we. A dimanche, children.",
      "Go gently into the grey. We keep the light on. A dimanche.",
    ],
    sermons: {
      // ---- the standing pool (on the air since long before the sleeper woke) ----
      match: [
        "The Parable of the Match. One November night before the Bombing, the whole city went dark at once. Every light from the river to the Bronx, gone in a breath.",
        "In the great hall of the trains thousands of people stood in the dark and did not know what to do with their hands. A young woman went from group to group with a box of matches, and she said: somebody has to keep the light on.",
        "A clerk broke open a supply locker for her and handed her the candles, because he was the kind of man who knows where things are kept. She drew a little sun on his box, twelve rays, so he would know which candles were hers.",
        "That is the whole parable. A match, a clerk, a box of candles, a sun drawn in pencil. Nobody was saved that night. Nobody needed saving. They only needed the light kept on.",
      ],
      psalm: [
        "The Psalm of the Sleepers. Say it with me, if you know it. Ninety days of winter, and then the spring.",
        "Ninety days, a man once said, as if winter were a thing a government could put on a schedule. Ninety days of winter, and then the spring. The girl he said it to laughed until the porters stared.",
        "There are sleepers under this city still. Under stone, under ice, under paperwork. We keep a candle for every one of them. Ninety days of winter, and then the spring.",
      ],
      nochoose: [
        "The Rule. The Sun does not choose. It does not ask to see your card. It does not read your name off a list. It rose on the enrolled and the unenrolled alike, and it will again.",
        "Every list ever written was written by someone standing on the right side of a door. Remember that, the next time a man with a clipboard smiles at you.",
        "We are the people who were not on the list. Our children were born after it. The Light knew their names before any clerk did.",
      ],
      list: [
        "Children, I said this to you in the winter and I will say it again until you are tired of it. The list has returned.",
        "A voice on the island reads names in the night. It calls itself a census. It has a number now, a seven and a letter, as though a number could make a thing gentle.",
        "Every child born under the Long Noon is on the wrong page of that book. Every one. Do not be afraid. Be awake. When the list returns, the Sun will rise, and no one will be chosen again.",
      ],
      february: [
        "Every February I carry one candle down a long corridor and leave it at a door that does not open. I have done it twenty-two times now.",
        "Some of you ask me what is behind that door. A promise. Promises keep very well in the cold.",
        "If you have a door like that, take a candle to it. Not because it will open. Because you said you would.",
      ],
      kindling: [
        "The Rule of the Kindling. When you come into the Light, the old name is laid beneath a stone.",
        "We do not dig. A name under a stone is not a grave. It is a coat you took off because the room grew warm.",
        "I laid mine down a long time ago. I do not miss it. Most mornings.",
      ],
      // ---- unlocked as the search finds the places she lived ----
      interpreter: [
        "Before the Long Noon I worked in a little glass room above the nations, carrying other people’s words across a table. I was good at it. I could make a man’s rage sound like a reasonable request.",
        "On the last Sunday morning a delegate leaned to his microphone and said: these aircraft did not leave from Paris. I put it into English. It was the last thing I ever translated.",
        "Here is what the glass room taught me. The words are never the trouble. The trouble is whoever holds the list of who is allowed to speak.",
      ],
      eleven: [
        "The Parable of the Eleven. A woman had a child with a fever, and a man at a table had medicine, and a list, and the child was not on the list.",
        "She struck a match to save one child, and the fire took eleven. And she asked the Sun why. And the Sun said: I do not choose. Be like me.",
        "We light eleven candles for them every night. We do not read their names on the air. They have heard enough of their names read out by strangers.",
      ],
      song: [
        "There was a song on every jukebox the winter before the Bombing. Two bits and a kiss, that’s all I’ve got. Some of you still hum it without knowing why.",
        "A man once told me it was the only song in the world worth a dime, and then he paid a quarter for it, because he never had a dime. I kept the record. I kept the quarter too.",
        "Hum it today, if you know it. A song is a candle you can carry in your mouth.",
      ],
      notice: [
        "There is a sleeper on the wireless asking after an old name. Poor man. He woke up in the wrong year and he wants the right one back.",
        "Listen to me, sleeper, if you are listening. We do not keep the old names here. The old names are under stone, and the stone is warm, and it is better so.",
        "Stop looking. She is in the Light.",
      ],
      noticeSundays:
        "He asks for Sundays at the whispering place. Sleeper, every day under this city is a Sunday.",
      spring: [
        "Children, I will tell you something a sleeper said to a woman once, in a whispering place, from one corner of a great room to the other.",
        "Wake me when it’s spring, the sleeper said. And the Dawn said: I will keep the light on.",
        "It has been a long winter. Longer than anybody planned. The light is still on.",
      ],
      // after the sleeper recorded a message into the relay (ms_eli_replied): she heard it alone and does not air it
      reply: [
        "Something came down our wire this week. A voice, eleven seconds long. I listened to it in the dark, twice, and then I switched it off.",
        "I will not play it for you. Some things are not for the air.",
        "Sleepers say all kinds of things in their sleep. We keep the light on for them anyway.",
      ],
      theyknew: [
        "You have heard it now from their own mouths. They knew the hour. They read the bombers’ orders a day early, and they moved their list to an island, and they told nobody.",
        "No public notice. Those were the words. Three words, and the city went to church that Sunday morning like any other.",
        "I do not ask you to hate them. Hate is a list too. I ask you to remember that every list keeps a door.",
      ],
      // ---- the Second Dawn: after the Torch is set (every frequency) ----
      secondDawn: [
        "This is the Dawn. Some of you heard me on every frequency in the city. For those who slept through it, I will say it once more.",
        "On Sunday, at nine forty-seven in the morning, the hour of the first Kindling, the Second Sun will rise over New Rad City.",
        "{torch}",
        "Go upriver if you are afraid. Nobody will stop you. Nobody will be chosen.",
        "Sleeper. You have something of mine. Bring it. Come alone. A dimanche.",
      ],
      torch: {
        def: "The men on the island have set their machine for noon. The Sun rises first.",
        destroyed:
          "The men on the island have lost their machine. They have not lost their list. Lists do not burn.",
        selective:
          "The men on the island have loaded their list into their machine, and it fires at noon. Our children’s names are in it. The Sun rises first.",
      },
      vigil: [
        "Children, the hour is close. Sit with the people you love. Tell them the true things. There will not be another winter to say them in.",
        "I have held a child with a fever. I know exactly what I am asking of you.",
        "We have kept the light on for twenty-two years. On Sunday we let it go up, all at once, so that nobody ever has to choose who stands nearest to it.",
      ],
      littleSun: [
        "Little Sun has come home to the Light. She is angry. She is allowed to be angry.",
        "She will understand on Sunday, or she will not, and the Sun will not choose either way.",
      ],
      last: [
        "This is the last Dawn Hour. I have read it every morning for ten years, and I have never once been sure anyone was listening.",
        "Somebody has to keep the light on. This morning, at nine forty-seven, I am going to stop keeping it and let it go.",
        "If you can hear me, sleeper, you are late. You always were. Come down anyway.",
      ],
    },
  };

  // ------------------------------------------------------------------
  // RADIO FREE MANHATTAN — the main story on the air (voiceable).
  // ------------------------------------------------------------------
  T.story = {
    // Rocky right after the Dawn Hour stepped on his signal
    dawnBleed: [
      "...and she's gone. Every morning at five forty-seven, folks, somebody parks a sermon right on top of Rocky's signal. Rocky's got nothing against scripture. Rocky's got a lot against trespassing.",
      "That was the Dawn Hour, champ. Pirate broadcast, five forty-seven every morning since '79, and nobody knows where it comes from. Rocky's tube runner says ignore it. She says it like she's heard it a thousand times.",
      "Rocky apologizes for the interruption. Rocky did not book a sermon. Rocky would like it noted that Rocky doesn't even get up before six.",
    ],
    dawnBleedKnown: [
      "There's our five forty-seven visitor again. We know where your wire runs now, lady. Rocky's leaving it alone. Rocky's not sure why.",
      "The Dawn Hour, folks, coming down a cable under Forty-Second Street. Rocky could cut it. Rocky keeps not cutting it.",
    ],
    dawnCut: [
      "Five forty-seven and nobody's stepping on Rocky. Somebody cut a wire in the First Journal Building, and Rocky slept in for the first time in ten years. Felt wrong, champ.",
    ],
    dawnAfterSecond: [
      "That was no sermon, New Rad City. That was a date and a time. Rocky's writing it on the wall: Sunday, nine forty-seven. Rocky's going to be on the air at nine forty-six, and so are you.",
      "She's on every frequency now, folks, even Rocky's. Sunday, nine forty-seven. Rocky's going to keep playing records, because somebody has to.",
    ],
    dawnQuiet: [
      "Five forty-seven came and went this morning, and nobody stepped on Rocky's signal. Rocky held the record for a minute anyway. Seemed right.",
    ],
    // story patter, gated in 52_radio_story.js
    missingHour: [
      "Missing Persons Hour, folks. Rocky reads every notice that comes in. There are a lot of them. There are always a lot of them. Write care of Radio City, and somebody, somewhere, will hear your name.",
    ],
    noticeSundays: [
      "Missing Persons Hour. This one's from the iceman himself, word for word: Nicole Mead, {first}'s awake. Whispering Gallery, Sundays. Nicole, champ, if you're out there, that man slept twenty-two years and woke up asking for you. Rocky's seen worse reasons to get out of bed.",
    ],
    noticePlain: [
      "Missing Persons Hour. Nicole Mead. Interpreter at the U.N., twenty-eight in '67, so fifty now. Canadian, dark hair, a gap in her front teeth, laughs with her whole face. You know her, you write care of Radio City. A sleeper's asking.",
    ],
    reply: [
      "Rocky's been in radio a long time, champ. And the only answer he ever got to the Missing Persons Hour came sealed with a little sun with twelve rays. Rocky handed it over with tongs.",
    ],
    flint: [
      "Shout-out to Flint, Rocky's tube runner. Kid can find a good tube in a raider camp and walk out without a scratch. Don't ask Rocky how. Rocky doesn't ask. Rocky pays in tea.",
      "Flint's the only person in Manhattan who's up before Rocky. Five forty-seven on the dot, every morning, like somebody rang a bell. Strange kid. Good kid.",
    ],
    wren: [
      "Tobias Wren at the Hall of Records wants it known: if you were born, married or buried in this city since '67 and nobody wrote it down, go see him. He's got a book. He's got a lot of ink. He tells Rocky he's got all the time in the world.",
    ],
    jammer: [
      "Rocky's signal is reaching places it hasn't reached in years, folks. Hello, Murray Hill! Somebody took the Continuity's jammer off the Waldorf roof. Rocky's not asking who. Rocky's just playing that somebody a song.",
    ],
    directive: [
      "Rocky's been reading a document, folks. Directive Seven-A. Big words. Public health. Enrolment. Rocky read it slow, twice, and here's the short version: if you were born after March of '67, the Continuity has plans for you, and you are not going to like them. Every kid in this city. Every one.",
    ],
    liberty: [
      "The lights on Liberty Island were blinking funny last night, folks. Searchlights pointing every which way. Rocky hears the Statue had visitors, and one of them was a sleeper in a grey suit.",
    ],
    zeke: [
      "Look who's back on his stool at the Oyster Bar: Zeke Marlow! Twenty-two years in a freezer, a month in a gift shop on Liberty, and he still owes Rocky a beer. Welcome home, champ.",
    ],
    torch: {
      reclamation: [
        "Word from the harbor: the Torch is charging on the tide. Noon Sunday, they say, the sky over this city goes blue. Rocky's had the word blue ready for twenty-two years. Rocky's going to say it on the air and not apologize.",
      ],
      selective: [
        "Rocky's not playing a song right now. Rocky's going to sit here a minute. Somebody loaded Directive Seven-A into the Torch. Noon Sunday. Every kid born since '67. Rocky's tube runner is one of them.",
      ],
      charter: [
        "The Iron Covenant has the keys to the Torch now, folks. Nothing happens at noon on Sunday, by design. Rocky has never been so glad to hear about nothing.",
      ],
      destroyed: [
        "If you saw the Statue's torch go up like a roman candle last night, you saw right. No machine, no noon, no list. Rocky's playing something loud.",
      ],
    },
    secondSun: [
      "This is not a bit, New Rad City. Sunday, nine forty-seven, something under Grand Central is set to go off, and the lady who reads the Dawn Hour says it's a sun. Rocky believes her. Rocky has seen one.",
      "Rocky's playing the good songs this week. All of them. Twice. Call it a hunch.",
    ],
    evacuation: [
      "Grand Central, this is Rocky, and this is not a bit. If you can walk, walk. North, west, anywhere but under that station by Sunday morning. Take water. Take your neighbor. Rocky will keep the music on so you've got something to walk toward.",
    ],
    endA: [
      "This is Radio Free Manhattan. Keep the lights on, New Rad City. Somebody has to.",
    ],
    endB: [
      "Rocky got a letter from the road today, folks. Somewhere up the Hudson, a lot of people in grey robes are teaching river towns to boil water. It's signed with a little sun, and under it, {count} names. Rocky's not reading them on the air. Some things you keep.",
    ],
    blue: [
      "Blue, folks. The sky over this city is blue. Rocky said it on the air. Blue.",
    ],
  };

  // ------------------------------------------------------------------
  // CONTINUITY RADIO — Directive 7-A and the Liberty chapter (voiceable).
  // ------------------------------------------------------------------
  T.continuityStory = {
    base: [
      "Citizens. The rolls of nineteen sixty-seven are the nation. Every name on them is a promise your government intends to keep. A name that is not on them is not a citizen. It is an oversight, and oversights will be corrected.",
      "The Office of Civil Defense will shortly read the names of enrolled citizens requested to present themselves at Liberty Station. Please listen for your name. If you do not hear your name, you need not listen.",
      "Some of you were born after March of nineteen sixty-seven. Your government does not hold this against you. Your government simply has no record of you, which is a different thing entirely.",
      "Directive Seven-A is a public health measure. It is quiet, it is painless, and it is entirely in accordance with the rolls. Enrolled citizens need take no action of any kind.",
      "The Knickerbocker Array will one day give this city a clean sky. A clean sky is a privilege of citizenship. Citizenship, I remind you, is a matter of record.",
      "Two aircraft came out of the east that Sunday morning. One was stopped. One was not. The Office of Civil Defense did everything that could be done, and it did it in good order.",
    ],
    liberty: [
      "This is Continuity Radio. The Acting President's address is postponed. There has been an incident at Liberty Station. Citizens are reminded that incidents are temporary and the rolls are permanent.",
    ],
    craneDead: [
      "The Acting President regrets to inform the nation that Colonel Augustus Crane has died in the performance of his duties. His forms have been filed. His post will be filled in due course.",
    ],
    order: [
      "Continuity Radio has no comment on documents of foreign origin. Personnel who heard them are reminded that listening is not believing, and believing is not leaving your post.",
    ],
    torch: {
      selective: [
        "Enrolled citizens: on Sunday at noon, remain indoors and keep your enrolment card on your person. The unenrolled need take no action. No action of any kind will help.",
      ],
      reclamation: [
        "Unauthorized persons have instructed the Knickerbocker Array to clean the sky for everyone. The Acting President did not approve this. The sky will be clean regardless. We regret any inconvenience.",
      ],
      charter: [
        "The Acting President does not recognize the Iron Covenant's claim to federal property. A complaint has been filed. The Acting President has filed it with himself.",
      ],
      destroyed: [
        "The Knickerbocker Array is undergoing unscheduled maintenance. The rolls are unaffected. The rolls are always unaffected.",
      ],
    },
  };

  // ------------------------------------------------------------------
  // VOX lexicon entries for the words above (appended before first use).
  // ------------------------------------------------------------------
