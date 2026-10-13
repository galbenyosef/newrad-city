// play-inline-566 04 — responses
// Lines 978-1282 of readable/play-inline-566.pretty.js (statement-aligned).
  ms.dlg("dlg_ms_herald", "hail").add({
    hail: {
      speaker: "Herald of the Court",
      text: "HALT. You stand at the gate of the Court of Tudor City, seat of His Grace the Lord Protector, Keeper of the Steps, Warden of the Boiler. Kneel, and pay tribute, and you may enter. Or don't, and we see how far you fall.",
      responses: [
        {
          text: "[Kneel.] [Pay 40 scrip.]",
          cond: () => L.scrip() >= 40,
          action: () => {
            if (L.pay(40)) {
              L.notify(
                "You kneel on the cracked steps of Tudor City. The herald looks deeply satisfied.",
              );
              passCourt("knelt");
            }
          },
          next: "in",
        },
        {
          text: "[Presence 6] I'm not here to take anything from His Grace. I'm looking for a woman who lived in 9C.",
          check: { attr: "presence", value: 6 },
          next: "talked",
          failNext: "nope",
        },
        { text: "I'll find my own way in.", next: "own" },
      ],
    },
    in: {
      text: "His Grace thanks you for your tribute. Mind the step. The step has been loose since Truman.",
      responses: [{ text: "[Go in.]" }],
    },
    talked: {
      text: "...9C? Nobody goes to 9C. That's the Lamplighter's. [He lowers his rifle a little.] The Lamplighter don't like visitors. Fine. Go up. If she shoots you, it was her idea, not the Court's.",
      onEnter() {
        passCourt("talked");
        L.xp(30, "Presence: the Court");
      },
      responses: [
        { text: "Who's the Lamplighter?", next: "lamplighter" },
        { text: "[Go in.]" },
      ],
    },
    lamplighter: {
      text: "The Royal Lamplighter. Keeps His Grace's sign lit, up top. TUDOR CITY in red, the only lit sign on the East Side. In exchange, she gets the roof and nobody asks her questions. I am not asking her questions. You shouldn't either.",
      responses: [{ text: "[Go in.]" }],
    },
    nope: {
      text: "Everybody's looking for somebody. Kneel or walk.",
      responses: [
        {
          text: "[Kneel and pay 40 scrip.]",
          cond: () => L.scrip() >= 40,
          action: () => {
            if (L.pay(40)) passCourt("knelt");
          },
          next: "in",
        },
        { text: "I'll find my own way in.", next: "own" },
      ],
    },
    own: {
      text: "Then you'll find it with your face. [He spits.] Plenty have.",
      responses: [{ text: "[Leave.]" }],
    },
  });
  // Getting in by any route moves mq07 on: the Tudor City interior, or the roof under the sign.
  let tcT = 0;
  L.hook("update", function (dt, realDt) {
    tcT -= realDt;
    if (tcT > 0) return;
    tcT = 0.5;
    if (!G.player) return;
    const p = G.player.pos;
    if (at("mq07", "court")) {
      const o = IX("tudor_city");
      const inside =
        p.x >= G.LAYOUT.INTERIOR_X_MIN &&
        Math.hypot(p.x - o.x, p.z - o.z) < 120;
      const roof = ms.resolve(P.tcRoof);
      const onRoof =
        roof && Math.hypot(p.x - roof.x, p.z - roof.z) < 10 && p.y > 8;
      if (inside) passCourt(L.flag("ms_court") || "fight");
      else if (onRoof) passCourt("roof");
    }
    if (at("mq07", "apt")) {
      const a = ms.resolve(P.apt9c());
      if (
        a &&
        Math.hypot(p.x - a.x, p.z - a.z) < 6 &&
        Math.abs(p.y - (a.y || 0)) < 3
      ) {
        if (!L.flag("ms_9c_entered")) {
          L.setFlag("ms_9c_entered");
          L.notify(
            "Apartment 9C. Two narrow beds, one made, one not. A kitchen calendar. A record player with its lid up. Dust on everything except the windowsill.",
            { duration: 7 },
          );
        }
        if (L.has("ms_note_9c_calendar") || L.flag("got_ms_9c_cal"))
          Q.setStage("mq07", "flint");
      }
    }
  });
  ms.pickup({
    key: "ms_9c_cal",
    item: "ms_note_9c_calendar",
    when: () => Q.isStarted("mq07"),
    at: P.aptCal(),
  });
  ms.pickup({
    key: "ms_9c_desk",
    item: "ms_note_nell_desk",
    when: () => Q.isStarted("mq07"),
    at: P.aptDesk(),
  });
  ms.pickup({
    key: "ms_9c_record",
    item: "ms_record_two_bits",
    when: () => Q.isStarted("mq07"),
    at: P.aptRecord(),
  });
  G.events.on("itemAdded", (id) => {
    if (id === "ms_note_9c_calendar" && at("mq07", "apt"))
      Q.setStage("mq07", "flint");
    if (id === "ms_record_two_bits" && !ms.hasToken("record")) {
      ms.token("record");
      L.xp(10, "Two Bits and a Kiss");
    }
    if (id === "ms_note_ilse_steno" && !ms.hasToken("booth")) ms.token("booth");
    if (id === "ms_note_dawn_reply" && at("mq10", "reply"))
      Q.setStage("mq10", "compare");
  });

  // Rose's first meeting (9C): nodes in her composite tree
  const RD = ms.dlg("dlg_ms_rose");
  RD.when(() => (at("mq07", "flint") ? "mq07_meet" : null));
  RD.when(() =>
    at("mq08", "hale") || at("mq08", "ilse") ? "mq08_gate" : null,
  );
  RD.when(() =>
    Q.isActive("mq10") &&
    !L.flag("ms_rose_mq10_steps") &&
    (at("mq10", "cathedral") || at("mq10", "keeper"))
      ? "mq10_steps"
      : null,
  );
  RD.add({
    mq07_meet: {
      speaker: "The woman with the rifle",
      text: () =>
        "[A young woman sits on the unmade bed with a scoped rifle across her knees, and the muzzle is on your chest. Leather jacket, a cuff on her left wrist, hair pulled back hard. She does not blink.] " +
        "That's far enough. This is a private apartment. Whose door did you think you were walking through?",
      responses: [
        {
          text: "[Lower your gun first.] Nicole Mead's. I'm not here to hurt anybody.",
          action: () => {
            L.setFlag("ms_rose_lowered");
            ms.addTrust(1, "You lowered your gun first");
          },
          next: "mq07_polite",
        },
        {
          text: "[Draw on her.] Put the rifle down. Now.",
          action: () => {
            ms.addTrust(-1, "You drew on her");
          },
          next: "mq07_window",
        },
        {
          text: "Nicole Mead's. She lived here. I'm looking for her.",
          next: "mq07_who",
        },
      ],
    },
    mq07_polite: {
      text: "...Huh. Polite. [The muzzle drops an inch.] Nobody's polite on this side of First Avenue. Who are you?",
      responses: [
        {
          text: () => "My name is " + L.heroName() + ". I knew Nicole. Before.",
          next: "mq07_photo",
        },
      ],
    },
    mq07_who: {
      text: "Lots of people lived places. Who are you?",
      responses: [
        {
          text: () => "My name is " + L.heroName() + ". I knew Nicole. Before.",
          next: "mq07_photo",
        },
      ],
    },
    mq07_window: {
      text: "Bad idea, sleeper. [In one movement she is off the bed and through the open window onto the fire escape, rifle and all. Her voice comes back in from outside.] I'll be around. You'll know.",
      onEnter() {
        L.setFlag("ms_rose_met");
        ms.rose.place("home");
        L.later(0.5, () => {
          if (at("mq07", "flint")) Q.setStage("mq07", "sol");
        });
      },
      responses: [{ text: "[She's gone.]" }],
    },
    mq07_photo: {
      text: () =>
        "[You take out the photo-booth strip. She looks at it — at the woman laughing in the second frame — for a long time. Then she looks at your face. Then at the strip again. Something goes very still in her.] " +
        (L.has("ms_flint_casing") || ms.f("saw_shooter")
          ? "...You kept my brass. [She almost smiles.] Chambers Street. The robe with the lantern was watching you. I don't like them watching people. "
          : "") +
        "I knew Nicole. From the tunnels. Under Grand Central. Everybody down there knew the Candle Lady.",
      responses: [
        { text: "Is she alive?", next: "mq07_alive" },
        { text: "Who are you?", next: "mq07_flint" },
      ],
    },
    mq07_alive: {
      text: "[A beat too long.] I don't know what she is. People went down there and came up different. ...I can help you look. I know the tunnels. I know who to ask and who to shoot.",
      responses: [{ text: "Who are you?", next: "mq07_flint" }],
    },
    mq07_flint: {
      text: "Flint. Rifle, roof, sign. I keep the Court's sign lit, the Court keeps out of my business. I sleep in here sometimes because it's quiet and nobody else will. [She stands, slings the rifle.] Can I— [She stops.] Can I keep that? The strip. Just for a while. I never had a picture of her laughing.",
      responses: [
        {
          text: "[Give her the photo strip.] Keep it safe.",
          action: () => {
            ms.set("rose_has_photo");
            ms.addTrust(1, "You let her keep the photo");
            L.take("ms_note_photo_strip", 1);
          },
          next: "mq07_kept",
        },
        { text: "I need it. I'm sorry.", next: "mq07_no" },
      ],
    },
    mq07_kept: {
      text: "[She puts it in her breast pocket and buttons the pocket.] Thanks. [Quietly.] Talk to Sol, downstairs. The doorman. He's been holding something for twenty years and never told anybody what. Then come find me under the sign. Roof. Don't come up the elevator shaft; that's mine.",
      onEnter() {
        meetDone();
      },
      responses: [{ text: "I will." }],
    },
    mq07_no: {
      text: "Sure. Course you do. [She doesn't argue.] Talk to Sol, downstairs. The doorman. He's been holding something for twenty years. Then come find me under the sign, if you want help. Roof.",
      onEnter() {
        meetDone();
      },
      responses: [{ text: "I will." }],
    },
    mq08_gate: {
      speaker: () => ms.roseName(),
      text: "[Flint leans on a dead flagpole outside the UN fence, as far from the Continuity guards as the street allows.] I don't go on their ground. Not since they started counting people. Go on. If Hale asks, I was never here. She'll ask.",
      responses: [
        { text: "You know Hale?", next: "mq08_hale" },
        { text: "Wait here." },
      ],
    },
    mq08_hale: {
      text: "We grew up a block apart. Tudor Place. She lent me books. Then she put on the uniform and I put on the rifle. [A shrug.] Go hear her pitch. Don't sign anything. They love it when you sign things.",
      responses: [{ text: "Back soon." }],
    },
    mq10_steps: {
      speaker: () => ms.roseName(),
      text: "[Flint is sitting on the cathedral steps with her back to the doors, cleaning the rifle's scope with her shirt.] I don't go in there. Not since I was sixteen. [She doesn't look up.] Don't let them give you a candle. Once you're holding one they think you're theirs.",
      onEnter() {
        L.setFlag("ms_rose_mq10_steps");
      },
      responses: [
        { text: "What happened when you were sixteen?", next: "mq10_sixteen" },
        { text: "I'll be quick." },
      ],
    },
    mq10_sixteen: {
      text: "I left. [That is the whole answer.] Go on, sleeper. Five forty-seven comes around every day whether you're ready or not.",
      responses: [{ text: "I'll be quick." }],
    },
  });
  function meetDone() {
    L.setFlag("ms_rose_met");
    ms.rose.place("home");
    if (at("mq07", "flint")) Q.setStage("mq07", "sol");
  }

  // ------------------------------------------------------------------
  // mq08: Hale, Ilse, Booth Four
  // ------------------------------------------------------------------
  // Hale's guests are not shot at: a local truce at the UN (plaza + Assembly Hall) while mq08 runs.
  function unTruce() {
    L.truceZone("ms_un_mq08", {
      faction: "continuity",
      x: 313,
      z: -320,
      r: 95,
      cond: () => Q.isActive("mq08") && !L.flag("con_hostile"),
    });
    const o = IX("un_assembly");
    L.truceZone("ms_un_mq08_in", {
      faction: "continuity",
      x: o.x,
      z: o.z,
      r: 160,
      cond: () => Q.isActive("mq08") && !L.flag("con_hostile"),
    });
  }
  L.hook("init", unTruce);
  L.hook("reset", unTruce);
