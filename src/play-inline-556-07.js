// play-inline-556 07 — rec
// Lines 1958-2277 of readable/play-inline-556.pretty.js (statement-aligned).
  function steer(rec, dt) {
    const a = rec.a;
    const want =
      town.gather && town.gather.who(rec)
        ? "gather"
        : activityAt(rec.def.routine, G.time.hour);
    if (
      want !== rec.act ||
      !rec.dest ||
      (rec.leg === "at" && rec.dest.repick && G.time.elapsed > rec.pickT)
    ) {
      if (
        rec.act === "sleep" &&
        want !== "sleep" &&
        rec.bunk &&
        rec.bunk.i !== undefined
      ) {
        town.bunkUsed.delete(rec.bunk.i);
        rec.bunk = null;
      }
      if (
        rec.asleep &&
        want !== "sleep" &&
        rec.a &&
        G.player &&
        Math.hypot(a.pos.x - G.player.pos.x, a.pos.z - G.player.pos.z) < 20 &&
        Math.random() < 0.5
      )
        a.say(
          pick([
            "*yawn* Another beautiful night in the Neon.",
            "Rise and shine. Mostly shine.",
            "Ugh. My back. My everything.",
          ]),
          3,
        );
      rec.act = want;
      rec.dest = destFor(rec, want);
      rec.leg = null;
      rec.door = null;
      rec.asleep = false;
      rec.moveT = G.time.elapsed;
      applyBarks(rec);
    }
    const d = rec.dest;
    if (!d) return;
    if (rec.leg === "at") {
      // drifted away (pushed, wandered past the home radius): go back
      const dd = Math.hypot(a.pos.x - d.x, a.pos.z - d.z);
      if (isInt(a.pos.x) === isInt(d.x) && dd > (d.r || 1.2) + 4)
        rec.leg = null;
      else return;
    }
    // cross-space: walk to the door, go through it (townsfolk use doors)
    if (isInt(a.pos.x) !== isInt(d.x)) {
      if (!rec.door) rec.door = findDoor(a.pos, d) || { none: true };
      if (rec.door.none) {
        if (!observed(a.pos.x, a.pos.y, a.pos.z) && !observed(d.x, d.y, d.z)) {
          place(a, d);
          arrive(rec);
        } else if (G.time.elapsed - rec.moveT > 45) loiter(rec, 25);
        return;
      }
      const fr = rec.door.from,
        dd = Math.hypot(a.pos.x - fr.x, a.pos.z - fr.z);
      if (dd < 2.2 || G.time.elapsed - rec.moveT > 40) {
        if (
          !observed(rec.door.to.x, rec.door.to.y, rec.door.to.z) ||
          dd < 2.2
        ) {
          place(a, rec.door.to);
          rec.door = null;
          rec.moveT = G.time.elapsed;
          if (G.sfx && !G.isStub("sfx") && observed(fr.x, fr.y, fr.z))
            L.sfx("door_open", {
              pos: L.V3(fr.x, fr.y + 1, fr.z),
              volume: 0.5,
            });
        } else if (G.time.elapsed - rec.moveT > 70) loiter(rec, 25); // the far side is watched and the door is out of reach
        return;
      }
      if (
        !a.moveGoal ||
        Math.hypot(a.moveGoal.x - fr.x, a.moveGoal.z - fr.z) > 0.5
      )
        a.moveTo(fr.x, fr.z);
      return;
    }
    const dd = Math.hypot(a.pos.x - d.x, a.pos.z - d.z);
    if (dd < 1.3) {
      arrive(rec);
      return;
    }
    // stuck / taking forever: pop there when nobody's looking
    if (Math.hypot(a.pos.x - rec.lastX, a.pos.z - rec.lastZ) > 1) {
      rec.lastX = a.pos.x;
      rec.lastZ = a.pos.z;
      rec.moveT = G.time.elapsed;
    } else if (
      G.time.elapsed - rec.moveT > 20 &&
      !observed(a.pos.x, a.pos.y, a.pos.z) &&
      !observed(d.x, d.y, d.z)
    ) {
      place(a, d);
      arrive(rec);
      return;
    } else if (G.time.elapsed - rec.moveT > 60 && !d.loiter) {
      loiter(rec, 25);
      return;
    } // stuck in plain view: re-plan instead of freezing
    if (
      a.state !== "move" ||
      !a.moveGoal ||
      Math.hypot(a.moveGoal.x - d.x, a.moveGoal.z - d.z) > 0.5
    ) {
      a.aiMode = "static";
      a.moveTo(d.x, d.z);
    }
  }

  // ------------------------------------------------------------------
  // Life: greetings, hawkers, the singer, guard night barks, conversations
  // ------------------------------------------------------------------
  const CONVOS = [
    [
      ["A", "You hear Crowe's running for mayor again?"],
      ["B", "He's the only candidate."],
      ["A", "And he STILL almost lost."],
    ],
    [
      ["A", "Found a hair on my head this morning."],
      ["B", "Just the one?"],
      ["A", "I named it Gordon. I keep it under a glass."],
      ["B", "Classy."],
    ],
    [
      ["A", "Topside kid at the gallery hit nine tin cans in a row."],
      ["B", "Annie let 'em keep the scrip?"],
      ["A", "Annie let 'em keep their FINGERS. That's the prize."],
    ],
    [
      ["A", "Velvet was flat last night."],
      ["B", "She's been flat since '67."],
      ["A", "Say that to her face."],
      ["B", "Which part?"],
    ],
    [
      ["A", "Pack train's late."],
      ["B", "Pack train's always late."],
      ["A", "Late's better than eaten."],
    ],
    [
      ["A", "You ever miss the sun on your skin?"],
      ["B", "I miss Coney Island. Same thing."],
    ],
    [
      ["A", "Lou took me for forty scrip last night."],
      ["B", "That's why they call him Lucky."],
      ["A", "I thought they called him Lucky 'cause he survived the bombs."],
      ["B", "That too."],
    ],
    [
      ["A", "Power flickered again."],
      ["B", "Sparks says it's the grid."],
      ["A", "Sparks says everything's the grid."],
      ["B", "Everything IS the grid."],
    ],
    [
      ["A", "Did you see the Ball? Stuck halfway, same as always."],
      ["B", "Like my career."],
      ["A", "Like all of us, pal."],
    ],
    [
      ["A", "They let a topsider into the Cinder Club last week."],
      ["B", "No!"],
      [
        "A",
        "Told a joke about the census. Rocco laughed so hard he cracked a rib.",
      ],
    ],
    [
      ["A", "Doc Broadway says I got the constitution of a man half my age."],
      ["B", "You're seventy-four."],
      ["A", "So I'm thirty-seven inside. Beautiful."],
    ],
    [
      ["A", "Candy's selling Rush by the Opry again."],
      ["B", "Captain know?"],
      ["A", "Captain BUYS."],
      ["B", "…I didn't hear that."],
    ],
    [
      ["A", "Scoop's paper says the Continuity's coming."],
      ["B", "Scoop's paper said that last year."],
      ["A", "And?"],
      ["B", "And they came. Just not here."],
    ],
    [
      ["A", "Nice night."],
      ["B", "It's always night for you. You never go out in the day."],
      ["A", "That's why it's always nice."],
    ],
    [
      ["A", "You going to the drop tonight?"],
      ["B", "The Ball don't drop. The Ball ain't dropped in twenty-two years."],
      ["A", "A fella can dream."],
    ],
  ];
  /**
   * Reactive talk (townsfolk gossip about what YOU did). Picked about half the time when one applies.
   * Speaker A/B lines; `cond` is read when the conversation starts.
   */
  const KT = () => L.standingTier();
  const REACTIVE = [
    {
      cond: () => Q.isComplete("sq_neon_ball"),
      lines: [
        ["A", "You see the Ball come down last night?"],
        ["B", "Cried like a baby. First real New Year's since '67."],
        ["A", "Worth it."],
      ],
    },
    {
      cond: () => Q.isComplete("sq_neon_ball"),
      lines: [
        ["A", "Crowe gave a speech after the drop."],
        ["B", "How long?"],
        ["A", 'He\'s still going. I left at "Fourscore".'],
      ],
    },
    {
      cond: () => Q.isComplete("sq_neon_power"),
      lines: [
        ["A", "Lights haven't flickered in days."],
        ["B", "Sparks is insufferable about it."],
        [
          "A",
          "Sparks was always insufferable. Now she's insufferable with a working grid.",
        ],
      ],
    },
    {
      cond: () =>
        Q.isComplete("sq_neon_power") && L.flag("kip_outcome") === "arrested",
      lines: [
        ["A", "Kip Lasko's in the barracks cell."],
        ["B", "Poor kid. Slag had him by the debts."],
        [
          "A",
          "Slag had him by the neck. Now the Guard's got him by the ankles. Progress.",
        ],
      ],
    },
    {
      cond: () => !!L.flag("opry_star"),
      lines: [
        ["A", "That topsider at the Opry, though."],
        ["B", "Terrible voice."],
        ["A", "Terrible! I went twice."],
      ],
    },
    {
      cond: () => !!L.flag("neon_guard_sergeant"),
      lines: [
        ["A", "Kincaid made a topsider a Sergeant."],
        ["B", "Next she'll make an ox Mayor."],
        ["A", "Better than Crowe."],
        ["B", "Don't let him hear you."],
      ],
    },
    {
      cond: () => Q.isComplete("mq05"),
      lines: [
        ["A", "Scoop says the big ape on the Empire State is gone."],
        ["B", "Gone where?"],
        ["A", "Gone gone."],
        ["B", "Huh. Skyline looks naked without him."],
      ],
    },
    {
      cond: () => Q.isComplete("mq03"),
      lines: [
        ["A", "Rocky Delgado was on about some sleeper again."],
        ["B", "Rocky's always on about somebody."],
        ["A", "This one's real. I think they're standing right there."],
      ],
    },
    {
      cond: () => Q.isComplete("sq_neon"),
      lines: [
        ["A", "Crowe got a new heart for the grid."],
        ["B", "Crowe got a new heart? Didn't know he had the old one."],
      ],
    },
    {
      cond: () => KT() >= 3,
      lines: [
        ["A", "(quietly) That's the one. The one from the radio."],
        ["B", "Don't look. Don't LOOK."],
        ["A", "I'm not looking. I'm not even here."],
      ],
    },
    {
      cond: () => KT() <= 0,
      lines: [
        ["A", "See that stranger? Pulled Gus out of a Maniac nest, I heard."],
        ["B", "Which Gus?"],
        ["A", "Does it matter? A Gus was saved."],
      ],
    },
    {
      cond: () => !!L.flag("club_member"),
      lines: [
        ["A", "They gave a topsider a Cinder Club card."],
        ["B", "What's next, the key to the city?"],
        ["A", "Crowe sold that in '71."],
      ],
    },
  ];
  /** Fame greetings: residents and guards remember your deeds (and your standing). */
