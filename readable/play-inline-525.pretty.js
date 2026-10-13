/* src/ambient_life/60_encounters.js */
/* =====================================================================
 * NEW RAD CITY — AMBIENT LIFE — 60: random-encounter director
 *
 * Small scripted surprises that happen *to you* while travelling the
 * city. The director rolls one every so often (outdoors, not in combat,
 * not inside a settlement), weighted by time of day, player level and
 * standing, each with its own cooldown:
 *
 *   stranger      The Man in the Grey Hat. At night, down the street,
 *                 under a dead lamp. Watches. Look away and he's gone,
 *                 and something's been left where he stood.
 *   preacher      Brother Amos Vell, last evangelist of Broadway, with a
 *                 sandwich board, a sermon for nobody and a donation hat.
 *   lost_sleeper  Timothy Pell, a Project Long Winter volunteer who just
 *                 thawed out of the failing Cryo Unit C-7, lost on his
 *                 first day in 1989. Point the way, rob him, patch him up,
 *                 or escort him to Grand Central (a small misc quest).
 *   dog_chase     A scavenger running for his life from a wild-dog pack.
 *   dead_drop     A skeleton, a footlocker and a note: someone's last
 *                 day, with a little loot.
 *   crash_site    A downed Rotorcraft (Continuity or Iron Covenant),
 *                 burning, with a flight locker. The locker key is on the
 *                 pilot's remains a few steps away (G.locks).
 *   hit_squad     Standing: very good players get mercenaries sent by the
 *                 people they've annoyed, very bad ones a posse of
 *                 lawmen. Delegates to combat's `spawnSpecialEncounter`
 *                 (Gallowglass Company / Lantern Marshals) when present
 *                 so both modules share one cooldown; own fallback squad
 *                 otherwise.
 *
 * Also owns `K.encounters.adopt(actors, tag)`: groups spawned by other
 * ambient systems (firefights, Rotorcraft drops) are tracked here and
 * cleaned up once the player has moved on. Hard limit on live actors.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;

  const MAX_ADOPTED_ACTORS = 16;
  const DESPAWN_R = K.CFG.ENCOUNTER_DESPAWN_R;

  // ------------------------------------------------------------------
  // Adopted actor groups (firefights, drops, encounter casts)
  // ------------------------------------------------------------------
  const groups = []; // {tag, actors:[], t, keep?:fn}
  function adopt(actors, tag, keep) {
    if (!actors || !actors.length) return null;
    const g = {
      tag: tag || "misc",
      actors: actors.slice(),
      t: K.now(),
      keep: keep || null,
    };
    groups.push(g);
    // cap: drop the oldest groups (far away first) when over budget
    let n = 0;
    for (const gg of groups)
      for (const a of gg.actors) if (K.actorAlive(a)) n++;
    for (let i = 0; i < groups.length - 1 && n > MAX_ADOPTED_ACTORS; i++) {
      const old = groups[i];
      if (old.keep && old.keep()) continue;
      for (const a of old.actors) {
        if (K.actorAlive(a)) n--;
        K.removeActor(a);
      }
      old.actors.length = 0;
    }
    return g;
  }
  function liveAdopted() {
    let n = 0;
    for (const g of groups) for (const a of g.actors) if (K.actorAlive(a)) n++;
    return n;
  }
  function updateGroups() {
    const P = G.player;
    const pin = K.isInterior(P.pos.x);
    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i];
      let any = false,
        allFar = true,
        allDeadOld = true;
      for (const a of g.actors) {
        if (!a || a.removed || a._ambGone) continue;
        any = true;
        const far =
          Math.hypot(a.pos.x - P.pos.x, a.pos.z - P.pos.z) > DESPAWN_R ||
          K.isInterior(a.pos.x) !== pin;
        if (!far) allFar = false;
        if (!a.dead) allDeadOld = false;
      }
      if (!any) {
        groups.splice(i, 1);
        continue;
      }
      const stale = allDeadOld && K.now() - g.t > 600;
      if ((allFar || stale) && !(g.keep && g.keep())) {
        for (const a of g.actors)
          if (!a.following || a.following !== "player") K.removeActor(a);
        groups.splice(i, 1);
      }
    }
  }
  function clearGroups() {
    groups.length = 0;
  } // combat removes every actor on reset itself

  // ------------------------------------------------------------------
  // Shared encounter plumbing
  // ------------------------------------------------------------------
  let active = null; // the one scripted encounter running now
  const cooldown = {}; // kind -> game-hours timestamp when it may fire again
  const stats = {
    strangerSeen: 0,
    lostSleeper: 0,
    preacher: 0,
    hitSquads: 0,
    lastHitSquadDay: -99,
  };
  let nextRollT = 0;

  function end(E, reason) {
    if (!E) return;
    try {
      if (E.cleanup) E.cleanup(reason);
    } catch (e) {
      G.reportError("ambient:encounter cleanup " + E.kind, e);
    }
    if (active === E) active = null;
    K.log("encounter end", E.kind, reason);
  }
  function setCooldown(kind, hours) {
    cooldown[kind] = K.gameHours() + hours;
  }
  function ready(kind) {
    return !(cooldown[kind] > K.gameHours());
  }
  /** Standard despawn check for a cast of actors + props. */
  function castGone(E) {
    const P = G.player;
    if (K.isInterior(P.pos.x)) {
      E.insideT = (E.insideT || 0) + 1;
      if (E.insideT > 20) return true;
    } else E.insideT = 0;
    return Math.hypot(P.pos.x - E.x, P.pos.z - E.z) > DESPAWN_R;
  }
  function removeCast(E) {
    for (const a of E.actors || [])
      if (!(a && a.following === "player")) K.removeActor(a);
    for (const p of E.props || []) K.removeProp(p);
    for (const c of E.colliders || []) {
      try {
        G.world.removeCollider(c);
      } catch (e) {
        /* ignore */
      }
    }
    for (const p of E.pickups || []) K.removePickup(p);
    if (E.objs)
      for (const o of E.objs) {
        try {
          if (o.dispose) o.dispose();
          else if (o.parent) o.parent.remove(o);
        } catch (e) {
          /* ignore */
        }
      }
    for (const f of E.fx || []) {
      try {
        if (f.stop) f.stop();
      } catch (e) {
        /* ignore */
      }
    }
  }

  // ------------------------------------------------------------------
  // Notes (original writing)
  // ------------------------------------------------------------------
  const NOTES = {
    amb_note_calling_card: [
      "Calling Card",
      "A Stranger's Calling Card",
      "A stiff, yellowed card, the corners soft with age. Printed in neat old-world type:\n\n    COMPLIMENTS OF A FRIEND\n\nOn the back, in pencil:\n\n\"You owe me one. Don't worry. I'll know when to collect.\"",
    ],
    amb_note_last_day_1: [
      "Crumpled Note",
      "Tuesday, Probably",
      "Legs are gone. Not gone-gone, just done. Sat down to rest by the mailbox and couldn't get up again.\n\nIf you're reading this I didn't make it to Grand Central. The footlocker's yours. The scrip was for my sister Dot at Grand Central. Tell her I tried. Or don't. She never liked me much.\n\nThe water in the red can is clean. The water in the blue can is NOT. Learned that one the hard way.\n\n- Walt",
    ],
    amb_note_last_day_2: [
      "Scavenger's Log",
      "Scav Log, Last Page",
      "Day 41. Hauled the locker six blocks. Two bottles of Rally Tonic, a whole box of shells, a good knife. Best haul all year.\nDay 41, later. Something followed me from 23rd. Big. Quiet. Didn't see it, heard it breathing.\nDay 41, later still. Hid under the bus. Breathing stopped. Going to make a run for it at dawn.\nDay 42.",
    ],
    amb_note_last_day_3: [
      "Folded Letter",
      "To Whoever Finds Me",
      "I was a teacher before the bombs. Third grade, P.S. 41. Twenty-two years ago I was explaining fractions; these days I explain boiling water. It's the same job: explaining things to people who aren't listening.\n\nSo listen. Boil the water. Don't trust anyone who smiles with all their teeth. Pay the toll on the bridge, it's cheaper than the alternative. And if you see a man in a grey hat, don't say anything. Just nod.\n\nThat's the lesson. Class dismissed.",
    ],
    amb_note_pamphlet: [
      "Pamphlet",
      '"The Warm-Up Is Over": a Sermon',
      "BROTHERS! SISTERS! NEIGHBORS OF INDETERMINATE AFFILIATION!\n\nThe Bombs were not the End. The Bombs were the OPENING ACT. The Lord, being a showman, has saved the big number for last.\n\nRepent of your Rush. Repent of your Rage. Repent of the thing you did in the Neon that you think nobody saw. SOMEBODY SAW.\n\nDonations accepted in scrip, clean water, or Chocolate Zeppelins (unopened).\n\n- Br. Amos Vell, Broadway Mission of the Second Warm-Up",
    ],
    amb_note_wake_card: [
      "Wake-Up Card",
      "Project Long Winter: Revival Card",
      "OFFICE OF CIVIL DEFENSE - PROJECT LONG WINTER\nCRYO UNIT C-7 - VOLUNTEER REVIVAL CARD\n\nWelcome back, Volunteer! Your service to the nation is appreciated. Please remember:\n  1. Remain calm. Revival dizziness passes within the hour.\n  2. Report to your Facility Director for reassignment.\n  3. Expect light radioactive dust until spring 1968.*\n\n*Projection only. The Office of Civil Defense makes no warranty as to surface conditions.\n\n(Handwritten:) Director's office: a skeleton at the desk. Every other pod in my row: dark. Nobody answers. Where IS everybody?",
    ],
    amb_note_contract: [
      "Torn Contract",
      "Contract (Torn)",
      'PAYABLE ON PROOF: one (1) head, attached or otherwise, of the thawed-out sleeper in the grey padded suit.\nRate: 600 scrip. Half up front.\nDescription: "smug, heavily armed, keeps doing good deeds. Bad for business."\n\n(The signature has been torn away.)',
    ],
    amb_note_warrant: [
      "Warrant",
      "Warrant of Arrest (Posse Copy)",
      'By order of the Lantern Marshals of Manhattan, the bearer is empowered to bring in, alive or otherwise, the stranger out of the Municipal Building basement, wanted for:\n  - murder of innocents (multiple),\n  - theft (numerous),\n  - "general menace."\nReward payable at Grand Central Market. No questions asked.',
    ],
    amb_note_flight_card: [
      "Pilot's Card",
      "Rotorcraft Crew Card",
      "CREW CARD - TWIN-ROTOR TRANSPORT\n\nPre-flight: rotor brake OFF, sync shaft CHECK, ramp UP.\nFlight locker key: carried by the pilot in command AT ALL TIMES. Do not hang it in the cockpit. (Again.)\n\n(Scrawled on the back:) If we go down, the key's in my breast pocket. Somebody get the lunch out of the locker before the rats do.",
    ],
  };
  const FLIGHT_KEY = "amb_flight_locker_key";
  const CRASH_LOCK = {
    id: "amb_crash_flight_locker",
    label: "Flight Locker",
    key: FLIGHT_KEY,
    kind: "container",
    hint: "The pilot in command carries the flight locker key.",
    keyFrom: "Crashed Rotorcraft: the pilot's remains beside the wreck",
  };
  function defineNotes() {
    for (const id in NOTES)
      K.defineNote(id, NOTES[id][0], NOTES[id][1], NOTES[id][2], 0);
    K.defineKey(
      FLIGHT_KEY,
      "Flight Locker Key",
      "A stamped steel key on a lanyard: the standard flight-locker key of a twin-rotor transport.",
    );
    K.registerLock(CRASH_LOCK);
    try {
      if (!G.isStub("locks") && G.locks.obtainableFrom)
        G.locks.obtainableFrom(FLIGHT_KEY, CRASH_LOCK.keyFrom);
    } catch (e) {
      /* ignore */
    }
  }

  // ------------------------------------------------------------------
  // Encounter: The Man in the Grey Hat
  // ------------------------------------------------------------------
  function encStranger() {
    const P = G.player.pos;
    // off-screen at first; he's there when you turn around
    const s = K.streetSpot(P.x, P.z, 24, 42, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1.2,
      tries: 40,
    });
    if (!s) return null;
    const a = K.spawnActor({
      type: "human",
      outfit: K.outfit("drifter", "merchant"),
      gender: "m",
      hat: "fedora",
      hatColor: 0x5b5a56,
      hair: "short",
      faction: "settlers",
      name: "Stranger",
      level: 20,
      pos: s,
      yaw: K.yawTo(s.x, s.z, P.x, P.z),
      ai: "static",
      hostile: false,
      essential: true,
      weapon: "none",
      noLoot: true,
      noRespawn: true,
      voice: "amb_none",
      barks: { greet: ["..."], idle: ["..."] },
      seed: "amb_greyhat",
    });
    if (!a) return null;
    a.noSearch = true;
    const E = {
      kind: "stranger",
      x: s.x,
      z: s.z,
      actors: [a],
      pickups: [],
      seenT: 0,
      seen: false,
      t: 0,
    };
    E.update = function (dt) {
      E.t += dt;
      if (!K.actorAlive(a)) return "gone";
      a.faceTowards(G.player.pos.x, G.player.pos.z, 1.5, dt);
      const d = K.distToPlayer(a.pos.x, a.pos.z);
      const vis = K.inView(a.pos.x, a.pos.y + 1.2, a.pos.z, 0.7, true);
      if (vis) {
        if (!E.seen) {
          E.seen = true;
          K.synth.sting();
          stats.strangerSeen++;
        }
        E.seenT += dt;
      }
      // he never lets you get close; look away and he's gone
      if (
        d < 9 ||
        (E.seen && !vis && E.seenT > 2.5) ||
        E.t > 150 ||
        a.inCombat ||
        a.hp < a.maxHp
      )
        return vanish();
      return null;
    };
    function vanish() {
      const x = a.pos.x,
        y = a.pos.y,
        z = a.pos.z;
      if (E.seen) {
        _v.set(x, y + 0.9, z);
        try {
          if (!G.isStub("fx")) G.fx.dust(_v, { scale: 1.4, count: 18 });
        } catch (e) {
          /* ignore */
        }
        // what he leaves behind
        _v.set(x, y + 0.05, z);
        if (stats.strangerSeen <= 1 && K.itemExists("amb_note_calling_card"))
          E.pickups.push(K.spawnPickup("amb_note_calling_card", 1, _v.clone()));
        const gift = K.pick([
          ["ammo_44", 12],
          ["rally_tonic", 2],
          [K.SCRIP, 44],
          ["fizzo_blue", 1],
          ["ammo_10mm", 24],
        ]);
        _v.x += 0.4;
        if (gift[0] !== K.SCRIP && K.itemExists(gift[0]))
          E.pickups.push(K.spawnPickup(gift[0], gift[1], _v.clone()));
        else if (K.itemExists(K.SCRIP))
          E.pickups.push(K.spawnPickup(K.SCRIP, gift[1], _v.clone()));
        E.pickups = E.pickups.filter(Boolean);
        E.keepPickups = true;
      }
      K.removeActor(a);
      return "vanished";
    }
    // pickups he left behind stay in the world (they're ordinary dropped items)
    E.cleanup = function () {
      E.pickups.length = 0;
      removeCast(E);
    };
    return E;
  }

  // ------------------------------------------------------------------
  // Encounter: Brother Amos Vell, street preacher
  // ------------------------------------------------------------------
  let boardGeo = null;
  function sandwichBoard() {
    if (!boardGeo) {
      const tex = K.canvasTex(256, 384, (c, w, h) => {
        c.fillStyle = "#d9cfae";
        c.fillRect(0, 0, w, h);
        for (let i = 0; i < 900; i++) {
          c.fillStyle = "rgba(80,60,30," + Math.random() * 0.12 + ")";
          c.fillRect(
            Math.random() * w,
            Math.random() * h,
            2 + Math.random() * 6,
            1 + Math.random() * 3,
          );
        }
        c.fillStyle = "#7a1a14";
        c.textAlign = "center";
        c.font = "bold 50px Impact, Oswald, sans-serif";
        c.fillText("REPENT!", w / 2, 70);
        c.fillStyle = "#231a12";
        c.font = "bold 30px Impact, Oswald, sans-serif";
        const lines = ["THE BOMBS", "WERE JUST", "THE WARM-UP"];
        lines.forEach((l, i) => c.fillText(l, w / 2, 140 + i * 42));
        c.font = "italic 22px Georgia, serif";
        c.fillText("— Br. Amos, Broadway", w / 2, 300);
        c.strokeStyle = "#3a2a1a";
        c.lineWidth = 8;
        c.strokeRect(6, 6, w - 12, h - 12);
        c.fillStyle = "rgba(60,40,20,0.35)";
        c.fillRect(0, h - 40, w, 40);
      });
      const m = K.mat(
        "amb_board",
        () => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }),
      );
      const g = new THREE.PlaneGeometry(0.5, 0.74);
      boardGeo = {
        g,
        m,
        frame: K.merge([
          K.part(
            new THREE.BoxGeometry(0.52, 0.76, 0.02),
            0x4a3522,
            [0, 0, 0],
            null,
            null,
            0.2,
            3,
          ),
        ]),
      };
    }
    const grp = new THREE.Group();
    grp.name = "amb_sandwich_board";
    const fm = K.vcMat("amb_board_frame");
    for (const s of [-1, 1]) {
      const fr = new THREE.Mesh(boardGeo.frame, fm);
      fr.position.set(0, 0, s * 0.19);
      fr.rotation.x = -s * 0.1;
      grp.add(fr);
      const pl = new THREE.Mesh(boardGeo.g, boardGeo.m);
      pl.position.set(0, 0, s * 0.203);
      pl.rotation.x = -s * 0.1;
      if (s < 0) pl.rotation.y = Math.PI;
      grp.add(pl);
    }
    return grp;
  }
  const SERMON = [
    'The Lord looked upon Manhattan and said: "Eh." And lo, the Bombs fell.',
    "Repent! The Bombs were only the warm-up act!",
    "Brothers, sisters! Your Rush will not save you! Unless it's the good Rush. Even then, no.",
    "Blessed are the irradiated, for they shall glow in the Kingdom! Not like THAT, Glowkeepers. Sit down.",
    "I have seen the Second Warm-Up! It had FOUR heads! Like a committee, but worse!",
    "Ask not what the Ruins can do for you! They can do nothing! They are ruins!",
    "The Continuity flies! The Iron Covenant marches! And the Lord? The Lord is taking notes!",
    "Donations! Scrip, water, snack cakes! The Almighty accepts all currencies!",
    "They told us it would be the Russians! It was the French! Read your Revelation, people, it is ALL in there!",
  ];
  function encPreacher() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 35, 60, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return null;
    // walk a line down the street, back and forth, preaching
    const ax = G.LAYOUT.isRoad(s.x + 12, s.z) && G.LAYOUT.isRoad(s.x - 12, s.z);
    const pts = ax
      ? [
          { x: s.x - 18, z: s.z },
          { x: s.x + 18, z: s.z },
        ]
      : [
          { x: s.x, z: s.z - 18 },
          { x: s.x, z: s.z + 18 },
        ];
    const a = K.spawnActor({
      type: "human",
      outfit: "settler",
      gender: "m",
      hair: "wild",
      faction: "settlers",
      name: "Brother Amos Vell",
      level: 4,
      pos: s,
      ai: "patrol",
      patrol: pts,
      weapon: "none",
      noRespawn: true,
      dialogue: "amb_dlg_preacher",
      voice: "settler",
      barks: {
        idle: SERMON,
        greet: ["Ah! A lost lamb! Or a lost... whatever you are!"],
      },
      inventory: K.stock([
        [K.SCRIP, 12],
        ["amb_note_pamphlet", 3],
      ]),
      seed: "amb_preacher",
    });
    if (!a) return null;
    // sandwich board over the torso (follows the rig)
    const E = {
      kind: "preacher",
      x: s.x,
      z: s.z,
      actors: [a],
      objs: [],
      t: 0,
      nextSermon: K.now() + 3,
    };
    try {
      const torso = a.char && a.char.parts && a.char.parts.torso;
      if (torso) {
        const b = sandwichBoard();
        b.position.set(0, 0.05, 0);
        torso.add(b);
        E.objs.push(b);
      }
    } catch (e) {
      /* cosmetic */
    }
    stats.preacher++;
    E.update = function (dt) {
      E.t += dt;
      if (!K.actorAlive(a)) return castGone(E) ? "gone" : null;
      E.x = a.pos.x;
      E.z = a.pos.z;
      const d = K.distToPlayer(a.pos.x, a.pos.z);
      if (d < 45 && K.now() > E.nextSermon && !K.actorBusy(a) && !a.inCombat) {
        E.nextSermon = K.now() + K.rand(7, 14);
        K.say(a, K.pick(SERMON), 5);
      }
      return castGone(E) || E.t > 900 ? "gone" : null;
    };
    E.cleanup = function () {
      removeCast(E);
    };
    return E;
  }
  function registerPreacherDialogue() {
    K.registerDialogue("amb_dlg_preacher", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            K.standing() <= -500
              ? "YOU. I know that walk. That is the walk of someone who has done Things. Repent! Repent at once! ...Or at least tithe."
              : "Brother! Sister! Popsicle-person! Have you heard the Good News? The Bombs were only the warm-up. The main event is coming, and the tickets are FREE.",
          responses: [
            { text: "What exactly is coming?", next: "doom" },
            {
              text: "[Give 10 scrip] For the mission.",
              cond: () => K.scrip() >= 10,
              action: () => {
                if (K.takeScrip(10)) {
                  K.addStanding(10, "Donated to a street preacher");
                  K.sfx(K.SFX_PAY);
                }
              },
              next: "thanks",
            },
            {
              text: "If the Lord wanted us saved, why'd He make the bomb so easy to build?",
              check: { skill: "persuasion", value: 40 },
              next: "debate_win",
              failNext: "debate_lose",
            },
            { text: "Your sign is upside down.", next: "sign" },
            { text: "Goodbye, preacher.", end: true },
          ],
        },
        doom: {
          text: "The Second Warm-Up! Fire from the sky, but slower, so you can see it coming. Brutes in the streets, but polite, so it hurts more. And the rivers shall run with Fizzo Cola. Flat Fizzo Cola.",
          responses: [
            { text: "That sounds... specific.", next: "hello" },
            { text: "I'll keep an eye out.", end: true },
          ],
        },
        thanks: {
          text: "Bless you! May your Geiger stay quiet and your tonic bottles be many. Here: the Word, in portable form.",
          onEnter: () => {
            if (
              K.itemExists("amb_note_pamphlet") &&
              !G.isStub("inventory") &&
              !(G.inventory.count("amb_note_pamphlet") > 0)
            )
              K.give("amb_note_pamphlet", 1);
          },
          responses: [{ text: "Thanks, I guess.", end: true }],
        },
        debate_win: {
          text: "...Huh. Huh! I... the Lord works in... hm. You know, nobody's ever argued BACK before. Take this. It's the only copy I haven't sold. It's free. Theologically, it's now yours.",
          onEnter: () => {
            K.addXP(25, "Out-argued a preacher");
            if (K.itemExists("amb_note_pamphlet"))
              K.give("amb_note_pamphlet", 1);
          },
          responses: [{ text: "Go in peace, Brother.", end: true }],
        },
        debate_lose: {
          text: "AH-HA! A doubter! The Lord LOVES a doubter. They fall the funniest! Begone, heathen, you're scaring off my congregation. (There is no congregation.)",
          responses: [{ text: "Fine.", end: true }],
        },
        sign: {
          text: "...It is NOT. It's just that the whole world's upside down, friend. The sign's the only thing that's right.",
          responses: [{ text: "Deep.", next: "hello" }],
        },
      },
    });
  }

  // ------------------------------------------------------------------
  // Encounter: Timothy Pell, a lost sleeper out of Cryo Unit C-7 (not C-4: C-4 thawed all its pods in 1967)
  // ------------------------------------------------------------------
  const GC_ID = "grand_central";
  let sleeper = null; // the live actor while the encounter/quest runs
  function encLostSleeper() {
    const P = G.player.pos;
    const gc = G.LAYOUT.getLocation(GC_ID);
    if (!gc || Math.hypot(P.x - gc.x, P.z - gc.z) < 120) return null;
    const s = K.streetSpot(P.x, P.z, 22, 40, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return null;
    const a = K.spawnActor({
      type: "human",
      outfit: K.outfit("cryo_suit", "lab_coat"),
      gender: "m",
      hair: "short",
      faction: "settlers",
      name: "Timothy Pell",
      level: 2,
      hp: 60,
      pos: s,
      yaw: K.yawTo(s.x, s.z, P.x, P.z),
      ai: "patrol",
      patrol: [{ x: P.x, z: P.z }],
      weapon: K.itemExists("bb_gun") ? "bb_gun" : "none",
      noRespawn: true,
      dialogue: "amb_dlg_sleeper",
      inventory: K.stock([
        [K.SCRIP, 40],
        ["amb_note_wake_card", 1],
        ["purified_water", 1],
      ]),
      seed: "amb_pell",
      barks: {
        idle: [
          "Is it always this... big?",
          "Where is everybody?",
          "Okay. Okay. Think, Timothy. What would the Facility Director do?",
        ],
        greet: ["Oh thank goodness, a person!"],
      },
    });
    if (!a) return null;
    sleeper = a;
    stats.lostSleeper++;
    const E = {
      kind: "lost_sleeper",
      x: s.x,
      z: s.z,
      actors: [a],
      t: 0,
      hailed: false,
      state: "approach",
      thinkT: 0,
    };
    E.update = function (dt) {
      E.t += dt;
      if (!K.actorAlive(a)) {
        if (a.dead && questActive()) failQuest();
        return castGone(E) ? "gone" : null;
      }
      E.x = a.pos.x;
      E.z = a.pos.z;
      const d = K.distToPlayer(a.pos.x, a.pos.z);
      E.thinkT -= dt;
      if (E.state === "approach" && E.thinkT <= 0 && !a.inCombat) {
        E.thinkT = 2;
        if (!E.hailed && d < 30) {
          E.hailed = true;
          K.say(
            a,
            "Hey! Hey, you! Is that a Long Winter suit? Are you a volunteer too? Wait up!",
            4,
          );
        }
        if (d > 3.5 && !K.actorBusy(a)) {
          a.patrol = [{ x: G.player.pos.x, z: G.player.pos.z }];
          a.patrolIdx = 0;
        } else if (d <= 3.5) {
          a.patrol = [{ x: a.pos.x, z: a.pos.z }];
          a.patrolIdx = 0;
          a.faceTowards(G.player.pos.x, G.player.pos.z);
        }
      }
      if (E.state === "escort") {
        const gcL = G.LAYOUT.getLocation(GC_ID);
        if (gcL && Math.hypot(a.pos.x - gcL.x, a.pos.z - gcL.z) < gcL.r + 12) {
          arrived(a);
          E.state = "home";
          E.t = 0;
        } else if (a.following !== "player" && !a.inCombat && E.thinkT <= 0) {
          E.thinkT = 3;
          try {
            a.follow("player");
          } catch (e) {
            /* ignore */
          }
        }
      }
      if (E.state === "walk" && E.thinkT <= 0) {
        // walking to Grand Central on his own; vanishes (arrives) once out of sight
        E.thinkT = 4;
        if (d > 90 && !K.inView(a.pos.x, a.pos.y + 1, a.pos.z, 1, true))
          return "gone";
      }
      if (E.state === "escort") return null; // never despawn a follower mid-escort
      if (E.state === "approach" && E.t > 240 && d > 80) return "gone";
      return castGone(E) ? "gone" : null;
    };
    E.cleanup = function () {
      // told to wait and then left behind until he despawned: the escort is over
      if (E.state === "wait" && questActive()) {
        failQuest();
        try {
          G.notify("Timothy Pell got tired of waiting and wandered off.");
        } catch (e) {
          /* ignore */
        }
      }
      if (sleeper === a && E.state !== "escort") sleeper = null;
      removeCast(E);
    };
    E.keep = () => E.state === "escort";
    return E;
  }
  const Q_ID = "amb_q_lost_and_found";
  function questApi() {
    return !G.isStub("quests") && typeof G.quests.define === "function";
  }
  function questActive() {
    try {
      return questApi() && G.quests.isActive(Q_ID);
    } catch (e) {
      return false;
    }
  }
  function defineQuest() {
    if (!questApi()) return;
    try {
      if (G.quests.get && G.quests.get(Q_ID)) return;
      const gc = G.LAYOUT.getLocation(GC_ID);
      G.quests.define({
        id: Q_ID,
        name: "Lost and Found",
        giver: "Timothy Pell",
        desc: "Timothy Pell, a Project Long Winter volunteer, has just thawed out of the failing Cryo Unit C-7 under the Hudson piers and walked into 1989 with a 1967 street map and no idea where anyone is. He's heard of a market at Grand Central.",
        stages: [
          {
            id: "escort",
            text: "Escort Timothy Pell to Grand Central Market",
            markers: gc
              ? [{ x: gc.x, z: gc.z, label: "Grand Central Market" }]
              : [],
          },
          { id: "done", text: "Timothy Pell reached Grand Central Market" },
        ],
        rewards: { xp: 60 },
      });
    } catch (e) {
      G.reportError("ambient:quest define", e);
    }
  }
  function startQuest() {
    try {
      if (questApi()) {
        if (!G.quests.get || G.quests.get(Q_ID)) G.quests.start(Q_ID);
      }
    } catch (e) {
      G.reportError("ambient:quest start", e);
    }
  }
  function failQuest() {
    try {
      if (questApi() && G.quests.isActive(Q_ID)) G.quests.fail(Q_ID);
    } catch (e) {
      /* ignore */
    }
  }
  function arrived(a) {
    try {
      a.follow(null);
    } catch (e) {
      /* ignore */
    }
    const gc = G.LAYOUT.getLocation(GC_ID);
    if (gc) {
      a.aiMode = "wander";
      a.home = { x: gc.x, z: gc.z, r: Math.max(8, gc.r * 0.5) };
    }
    K.say(
      a,
      "Grand Central! It's real! People! Oh, here. It's not much, but it's everything I've got. Thank you. Really.",
      6,
    );
    K.give(K.SCRIP, 60);
    K.addStanding(15, "Escorted a lost sleeper to safety");
    try {
      if (questApi() && G.quests.isActive(Q_ID)) {
        G.quests.setStage(Q_ID, "done");
        G.quests.complete(Q_ID);
      } else K.addXP(60, "Lost and Found");
    } catch (e) {
      /* ignore */
    }
    try {
      if (!G.isStub("radio") && typeof G.radio.addNews === "function")
        G.radio.addNews(
          "Word from Grand Central: a freshly thawed government sleeper walked in yesterday, escorted by another one. That's two popsicles in one week, folks. Somebody check the basements.",
        );
    } catch (e) {
      /* ignore */
    }
    sleeper = null;
  }
  function sleeperDialogue() {
    const E = () => (active && active.kind === "lost_sleeper" ? active : null);
    K.registerDialogue("amb_dlg_sleeper", {
      start: () =>
        E() && E().state === "escort"
          ? "escorting"
          : E() && E().state === "walk"
            ? "walking"
            : "hello",
      nodes: {
        hello: {
          text: "Oh thank goodness, a person! A normal person! You ARE normal, right? I'm Timothy. Timothy Pell, Project Long Winter, Cryo Unit C-7. My pod popped this morning. The lights were down to one bulb. And I think I'm the only one who got out.",
          responses: [
            { text: "What are you doing out here?", next: "why" },
            { text: "You look lost.", next: "lost" },
            { text: "Goodbye.", end: true },
          ],
        },
        why: {
          text: "The card they pinned to my suit says \"report to your Facility Director.\" My Director has been sitting at her desk for a very long time. She's a skeleton. I said excuse me anyway. The card also says it's March 1967. It is not. A lady with a cart told me it's 1989. Also there are dogs with no fur. Is that normal? Please tell me that's normal.",
          responses: [{ text: "That's normal.", next: "lost" }],
        },
        lost: {
          text: "I'm looking for \"Grand Central Market.\" A man with burns all over his face, very friendly, said everyone trades there. My map is from 1967. It says there's a Woolworth's on every corner. There is not a Woolworth's on every corner.",
          responses: [
            {
              text: "Grand Central is north-east of here. Stay off the avenues after dark.",
              action: () => {
                K.addStanding(5, "Gave directions");
                K.addXP(15, "Gave directions");
                goWalk();
              },
              next: "directions",
            },
            {
              text: "I'll take you there myself. Stay close.",
              action: () => goEscort(),
              next: "escort",
            },
            {
              text: "Here, take a Rally Tonic. You'll need it more than I will.",
              cond: () =>
                !G.isStub("inventory") && G.inventory.count("rally_tonic") > 0,
              action: () => {
                try {
                  G.inventory.remove("rally_tonic", 1);
                } catch (e) {
                  /* ignore */
                }
                K.addStanding(20, "Gave a Rally Tonic to a lost sleeper");
                goWalk();
              },
              next: "gift",
            },
            {
              text: "Guides cost scrip. Pay up front. The city isn't free.",
              check: { skill: "persuasion", value: 50 },
              action: () => {
                K.give(K.SCRIP, 40);
                K.addStanding(-15, "Swindled a lost sleeper");
                goWalk();
              },
              next: "swindle",
              failNext: "noswindle",
            },
            {
              text: "Not my problem, kid.",
              action: () => goWalk(),
              next: "alone",
            },
          ],
        },
        directions: {
          text: "North-east. Avenues bad. Got it. Got it! I'm writing that down. On my arm. Thank you, you're the nicest person I've met all day! You're also the only person I've met all day.",
          responses: [{ text: "Good luck, Timothy.", end: true }],
        },
        escort: {
          text: "Really? Oh gosh. Okay! I'll be right behind you. Not too close. Unless there's danger. Then very close.",
          responses: [{ text: "Let's go.", end: true }],
        },
        gift: {
          text: "Real Rally Tonic? We only had the training bottles in C-7, full of cold tea and good intentions. I'll... I'll pay you back someday. Grand Central, here I come!",
          responses: [{ text: "Stay safe.", end: true }],
        },
        swindle: {
          text: "Oh. Oh, of course. Surface economics. Here... that's all my scrip. So where is it? ...North-east? Thank you! I think. I feel like I got the bad end of that.",
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        noswindle: {
          text: 'Hm. My Long Winter handbook says: "Never pay a stranger in advance." It also says the surface would be safe by spring 1968, so. I\'ll hold on to my scrip, thanks.',
          responses: [
            { text: "Fine. North-east.", action: () => goWalk(), end: true },
          ],
        },
        alone: {
          text: "Right. Right! Self-reliance. The Civil Defense way. I'll just... pick a direction. That one. That one looks good.",
          responses: [{ text: "...", end: true }],
        },
        escorting: {
          text: "I'm right behind you! Is it much farther? My legs have been asleep for twenty-two years.",
          responses: [
            { text: "Almost there. Keep up.", end: true },
            {
              text: "Wait here. I'll come back for you.",
              action: () => {
                try {
                  sleeper && sleeper.follow(null);
                } catch (e) {
                  /* ignore */
                }
                if (E()) E().state = "wait";
              },
              end: true,
            },
          ],
        },
        walking: {
          text: "North-east! Avenues bad! I remember!",
          responses: [
            {
              text: "Actually, I'll take you there. Stay close.",
              action: () => goEscort(),
              end: true,
            },
            { text: "Good luck.", end: true },
          ],
        },
      },
    });
    function goWalk() {
      const e = E();
      if (!e || !K.actorAlive(sleeper)) return;
      e.state = "walk";
      const gc = G.LAYOUT.getLocation(GC_ID);
      if (gc) {
        sleeper.aiMode = "patrol";
        sleeper.patrol = [{ x: gc.x, z: gc.z }];
        sleeper.patrolIdx = 0;
      }
    }
    function goEscort() {
      const e = E();
      if (!e || !K.actorAlive(sleeper)) return;
      e.state = "escort";
      try {
        sleeper.follow("player");
      } catch (err) {
        /* ignore */
      }
      startQuest();
    }
  }

  // ------------------------------------------------------------------
  // Encounter: scavenger chased by wild dogs
  // ------------------------------------------------------------------
  function encDogChase() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 40, 60, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return null;
    const lvl = K.level();
    const victim = K.spawnActor({
      type: "human",
      outfit: K.outfit("drifter", "settler"),
      faction: "settlers",
      name: "Scavenger",
      level: Math.max(2, lvl - 1),
      hp: 70,
      pos: s,
      yaw: K.yawTo(s.x, s.z, P.x, P.z),
      ai: "patrol",
      patrol: [{ x: P.x, z: P.z }],
      weapon: "none",
      noRespawn: true,
      voice: "settler",
      seed: "amb_scav" + Math.floor(Math.random() * 99),
      inventory: K.stock([
        [K.SCRIP, K.randInt(15, 40)],
        ["scrap_metal", 2],
      ]),
      speed: 5.4,
      barks: {
        idle: ["Help! HELP!", "Get them off me!", "Somebody shoot them!"],
        combat: ["Help! HELP!", "Get them off me!"],
        flee: ["Get them off me!"],
      },
    });
    if (!victim) return null;
    const dogs = [];
    const n = K.randInt(2, 3) + (lvl >= 6 ? 1 : 0);
    const ang = K.yawTo(P.x, P.z, s.x, s.z); // behind the scavenger, away from the player
    for (let i = 0; i < n; i++) {
      const bx = s.x - Math.sin(ang) * (6 + i * 1.5),
        bz = s.z - Math.cos(ang) * (6 + i * 1.5);
      const sp = K.freeSpotNear(bx, bz, 3, 8);
      if (!sp) continue;
      const d = K.spawnActor({
        type: "dog",
        variant: "wild",
        faction: "creatures",
        level: Math.max(1, lvl - 2 + K.randInt(0, 2)),
        pos: sp,
        yaw: K.yawTo(sp.x, sp.z, s.x, s.z),
        ai: "wander",
        home: { x: s.x, z: s.z, r: 10 },
        noRespawn: true,
      });
      if (d) dogs.push(d);
    }
    const E = {
      kind: "dog_chase",
      x: s.x,
      z: s.z,
      actors: [victim].concat(dogs),
      t: 0,
      done: false,
      hailT: 0,
    };
    E.update = function (dt) {
      E.t += dt;
      E.hailT -= dt;
      if (K.actorAlive(victim)) {
        E.x = victim.pos.x;
        E.z = victim.pos.z;
        const d = K.distToPlayer(victim.pos.x, victim.pos.z);
        // keep running toward the player (the dogs chase him in)
        if (!E.done && d > 4 && E.hailT <= 0) {
          E.hailT = 1.5;
          victim.patrol = [{ x: G.player.pos.x, z: G.player.pos.z }];
          victim.patrolIdx = 0;
          if (victim.state === "flee" || victim.state === "cower") {
            try {
              victim.setState && victim.setState("idle");
            } catch (e) {
              /* ignore */
            }
          }
          if (Math.random() < 0.4)
            K.say(
              victim,
              K.pick([
                "Help! HELP!",
                "Shoot them! Shoot them!",
                "They're right behind me!",
              ]),
              2.5,
            );
        }
        // make the dogs go for him
        for (const dg of dogs) {
          if (!K.actorAlive(dg) || dg.inCombat) continue;
          try {
            if (typeof G.combat.provoke === "function")
              G.combat.provoke(dg, victim);
            else if (dg.moveTo) dg.moveTo(victim.pos.x, victim.pos.z);
          } catch (e) {
            /* ignore */
          }
          dg.home = { x: victim.pos.x, z: victim.pos.z, r: 3 };
        }
        if (!E.done && dogs.every((dg) => !K.actorAlive(dg))) {
          E.done = true;
          victim.patrol = [{ x: G.player.pos.x, z: G.player.pos.z }];
          K.say(
            victim,
            "You... you saved my life! Here, take this, it's all I found today. And the scrip. Mostly the scrip.",
            6,
          );
          const loot = K.pick([
            ["rally_tonic", 1],
            ["ammo_10mm", 20],
            ["purified_water", 2],
            ["duct_tape", 2],
            ["iodine_tabs", 1],
          ]);
          if (K.distToPlayer(victim.pos.x, victim.pos.z) < 30) {
            K.give(K.SCRIP, K.randInt(20, 45));
            K.give(loot[0], loot[1]);
            K.addStanding(10, "Saved a scavenger");
            K.addXP(20, "Saved a scavenger");
          }
          E.doneT = E.t;
        }
      } else if (!E.done) {
        E.done = true;
        E.doneT = E.t;
      }
      if (E.done && E.t - E.doneT > 20 && K.actorAlive(victim)) {
        victim.aiMode = "patrol";
        victim.patrol = [
          {
            x: victim.pos.x + (Math.random() - 0.5) * 200,
            z: victim.pos.z + (Math.random() - 0.5) * 200,
          },
        ];
      }
      return castGone(E) || E.t > 600 ? "gone" : null;
    };
    E.cleanup = function () {
      removeCast(E);
    };
    return E;
  }

  // ------------------------------------------------------------------
  // Encounter: dead drop (skeleton + footlocker + last note)
  // ------------------------------------------------------------------
  function encDeadDrop() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 30, 70, {
      road: false,
      hidden: true,
      notSettlement: true,
      clear: 1.2,
      tries: 50,
    });
    if (!s) return null;
    const E = {
      kind: "dead_drop",
      x: s.x,
      z: s.z,
      props: [],
      pickups: [],
      t: 0,
    };
    const yaw = Math.random() * 6.28;
    const sk = K.spawnProp("skeleton", {
      x: s.x,
      y: s.y,
      z: s.z,
      yaw,
      pose: K.pick(["sitting", "lying", "reaching"]),
    });
    if (sk) E.props.push(sk);
    const lx = s.x + Math.sin(yaw + 1.2) * 1.1,
      lz = s.z + Math.cos(yaw + 1.2) * 1.1;
    const loot = K.stock(
      K.pick([
        [
          [K.SCRIP, K.randInt(25, 70)],
          ["rally_tonic", 1],
          ["duct_tape", 1],
          ["purified_water", 1],
        ],
        [
          ["ammo_12ga", 14],
          ["ammo_10mm", 22],
          ["rally_tonic", 2],
          ["scrap_metal", 1],
        ],
        [
          ["iodine_tabs", 1],
          ["prussian_blue", 1],
          ["dirty_water", 2],
          ["golden_plain_jerky", 2],
          [K.SCRIP, K.randInt(15, 40)],
        ],
      ]),
    );
    const box = K.spawnProp("footlocker", {
      x: lx,
      y: s.y,
      z: lz,
      yaw: yaw + Math.PI / 2,
      items: loot,
      name: "Scavenger's Footlocker",
    });
    if (box) E.props.push(box);
    const note = K.pick([
      "amb_note_last_day_1",
      "amb_note_last_day_2",
      "amb_note_last_day_3",
    ]);
    const pk = K.spawnPickup(
      note,
      1,
      new THREE.Vector3(
        s.x + Math.sin(yaw) * 0.5,
        s.y + 0.05,
        s.z + Math.cos(yaw) * 0.5,
      ),
    );
    if (pk) E.pickups.push(pk);
    if (!E.props.length && !E.pickups.length) return null;
    // a crow or two already knows
    if (K.fauna && Math.random() < 0.6 && !K.isDark())
      K.fauna.spawnFlock(
        "crow",
        s.x,
        s.y + K.rand(14, 20),
        s.z,
        K.randInt(3, 5),
        { r: 8 },
      );
    E.update = function (dt) {
      E.t += dt;
      return castGone(E) ? "gone" : null;
    };
    E.cleanup = function () {
      removeCast(E);
    };
    return E;
  }

  // ------------------------------------------------------------------
  // Encounter: crashed Rotorcraft (flight locker: the key is on the pilot)
  // ------------------------------------------------------------------
  function encCrash() {
    if (!K.rotorcraft) return null;
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 70, 110, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 7,
      tries: 50,
    });
    if (!s) return null;
    const kind = Math.random() < 0.6 ? "continuity" : "covenant";
    const rc = K.rotorcraft.create(kind, { crashed: true });
    const yaw = Math.random() * 6.28;
    rc.root.position.set(s.x, s.y + 1.7, s.z);
    rc.root.rotation.set(0.1, yaw, 0.3, "YXZ");
    G.scene.add(rc.root);
    try {
      G.world.addLOD(rc.root, 420);
    } catch (e) {
      /* ignore */
    }
    const E = {
      kind: "crash_site",
      x: s.x,
      z: s.z,
      objs: [rc],
      props: [],
      pickups: [],
      colliders: [],
      fx: [],
      t: 0,
    };
    try {
      E.colliders.push(
        G.world.addCollider(s.x, s.z, 3.2, 15.0, s.y, s.y + 3.4, yaw, {
          tag: "amb_crash",
          surface: "metal",
        }),
      );
    } catch (e) {
      /* ignore */
    }
    // local axes of the wreck: forward (-Z of the model) and right (+X)
    const fx = -Math.sin(yaw),
      fz = -Math.cos(yaw),
      rx = Math.cos(yaw),
      rz = -Math.sin(yaw);
    if (!G.isStub("fx")) {
      try {
        const fp = new THREE.Vector3(
          s.x + fx * 4.5 + rx * 1.2,
          s.y + 1.4,
          s.z + fz * 4.5 + rz * 1.2,
        ); // aft engines burning
        const f = G.fx.fire(
          new THREE.Vector3(
            s.x - fx * 5 + rx * 1.3,
            s.y + 2.2,
            s.z - fz * 5 + rz * 1.3,
          ),
          1.2,
          { smoke: true, glow: true, sound: true },
        );
        if (f) E.fx.push(f);
        const sm = G.fx.smoke(fp, 2.4, { dark: true });
        if (sm) E.fx.push(sm);
      } catch (e) {
        /* ignore */
      }
    }
    const loot =
      kind === "continuity"
        ? [
            ["ammo_gyrojet", 24],
            ["ammo_dry_cell", 4],
            ["rally_tonic", 2],
            ["riot_gas_grenade", 1],
            ["gyrojet_pistol", 1],
          ]
        : [
            ["ammo_gyrojet", 18],
            ["ammo_556", 60],
            ["rally_tonic", 2],
            ["frag_grenade", 2],
            ["gyrojet_pistol", 1],
          ];
    // the flight locker sits by the open crew door; a fresh wreck means a fresh (locked) locker
    K.relock(CRASH_LOCK.id);
    const bx = s.x + rx * 2.8 + fx * 3.5,
      bz = s.z + rz * 2.8 + fz * 3.5;
    const box = K.spawnProp("locker", {
      x: bx,
      y: s.y,
      z: bz,
      yaw: yaw + Math.PI / 2,
      items: K.stock(loot),
      lock: CRASH_LOCK,
      name:
        kind === "continuity"
          ? "Continuity Flight Locker"
          : "Covenant Flight Locker",
    });
    if (box) E.props.push(box);
    // the pilot didn't make it far: remains, the locker key and the crew card a few steps from the nose
    const px = s.x + fx * 9.5 + rx * 1.8,
      pz = s.z + fz * 9.5 + rz * 1.8;
    const py = K.groundAt(px, pz, s.y + 0.5);
    if (py !== null) {
      const sk = K.spawnProp("skeleton", {
        x: px,
        y: py,
        z: pz,
        yaw: yaw + 2.2,
        pose: "reaching",
        name: "Pilot's Remains",
      });
      if (sk) E.props.push(sk);
      const kp = K.spawnPickup(
        FLIGHT_KEY,
        1,
        new THREE.Vector3(px + rx * 0.45, py + 0.05, pz + rz * 0.45),
      );
      if (kp) E.pickups.push(kp);
      const cp = K.spawnPickup(
        "amb_note_flight_card",
        1,
        new THREE.Vector3(px - rx * 0.4, py + 0.05, pz - rz * 0.4),
      );
      if (cp) E.pickups.push(cp);
    } else {
      // nowhere to lay the pilot: the key hangs in the locker door instead (the lock still resolves)
      const kp = K.spawnPickup(
        FLIGHT_KEY,
        1,
        new THREE.Vector3(bx + rx * 0.6, s.y + 0.05, bz + rz * 0.6),
      );
      if (kp) E.pickups.push(kp);
    }
    if (K.fauna) K.fauna.scare(s.x, s.z, 60);
    E.update = function (dt) {
      E.t += dt;
      return castGone(E) ? "gone" : null;
    };
    E.cleanup = function () {
      removeCast(E);
    };
    return E;
  }

  // ------------------------------------------------------------------
  // Encounter: standing hit squad
  // ------------------------------------------------------------------
  function hitSquadKind() {
    const k = K.standing();
    if (k >= 750) return "merc";
    if (k <= -750) return "marshal";
    return null;
  }
  function encHitSquad(force) {
    const kind = force || hitSquadKind();
    if (!kind) return null;
    let actors = [];
    if (
      !G.isStub("combat") &&
      typeof G.combat.spawnSpecialEncounter === "function"
    ) {
      try {
        actors = G.combat.spawnSpecialEncounter(kind) || [];
      } catch (e) {
        G.reportError("ambient:hitsquad", e);
        actors = [];
      }
    }
    if (!actors.length) actors = fallbackSquad(kind);
    if (!actors.length) return null;
    stats.hitSquads++;
    stats.lastHitSquadDay = K.day();
    // they announce themselves as soon as they spot you
    const lead = actors[0];
    const E = {
      kind: "hit_squad",
      x: lead.pos.x,
      z: lead.pos.z,
      actors,
      t: 0,
      shouted: false,
      owned: !lead.group,
    };
    E.update = function (dt) {
      E.t += dt;
      const alive = actors.filter((a) => K.actorAlive(a));
      if (!alive.length) return "dead";
      E.x = alive[0].pos.x;
      E.z = alive[0].pos.z;
      if (!E.shouted && K.distToPlayer(E.x, E.z) < 45) {
        E.shouted = true;
        K.say(
          alive[0],
          kind === "merc"
            ? K.pick([
                "There's the do-gooder! Contract says dead, boys!",
                "Nothing personal, popsicle. Somebody paid a lot of scrip.",
                "That's the mark! Light 'em up!",
              ])
            : K.pick([
                "By order of the Lantern Marshals, you're coming in. Dead's fine.",
                "There's the butcher! Weapons free!",
                "Your kind of trouble ends here, murderer.",
              ]),
          4,
        );
      }
      if (E.owned) {
        // own fallback squad: keep homing in (combat's squads home in on their own)
        if (E.t % 6 < dt)
          for (const a of alive)
            if (!a.inCombat) {
              a.patrol = [{ x: G.player.pos.x, z: G.player.pos.z }];
              a.patrolIdx = 0;
            }
        return castGone(E) ? "gone" : null;
      }
      return E.t > 30 ? "handed_off" : null; // combat owns and despawns its roaming groups
    };
    E.cleanup = function (reason) {
      if (E.owned && reason !== "handed_off") removeCast(E);
    };
    return E;
  }
  function squadWeapon() {
    const ok = [
      "assault_rifle",
      "combat_shotgun",
      "hunting_rifle",
      "pistol_10mm",
    ].filter((w) => K.itemExists(w));
    return ok.length ? K.pick(ok) : "none";
  }
  function fallbackSquad(kind) {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 70, 110, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return [];
    const factions =
      !G.isStub("combat") && G.combat.factions ? G.combat.factions() : [];
    const fac =
      kind === "merc"
        ? factions.indexOf("mercenaries") >= 0
          ? "mercenaries"
          : "raiders"
        : factions.indexOf("lawmen") >= 0
          ? "lawmen"
          : "raiders";
    const out = [],
      n = K.randInt(3, 4),
      lvl = K.level();
    for (let i = 0; i < n; i++) {
      const sp = K.freeSpotNear(
        s.x + (Math.random() - 0.5) * 5,
        s.z + (Math.random() - 0.5) * 5,
        3,
        8,
      );
      if (!sp) continue;
      const lead = i === 0;
      const a = K.spawnActor({
        type: "human",
        outfit: kind === "merc" ? "combat_armor" : "leather_armor",
        hat: kind === "merc" ? "helmet" : "cowboy",
        faction: fac,
        hostile: true,
        name:
          kind === "merc"
            ? lead
              ? "Mercenary Captain"
              : "Mercenary"
            : lead
              ? "Posse Marshal"
              : "Posse Deputy",
        level: Math.max(4, lvl + (lead ? 2 : 0)),
        pos: sp,
        ai: "patrol",
        patrol: [{ x: P.x, z: P.z }],
        weapon: squadWeapon(),
        noRespawn: true,
        inventory: K.stock(
          lead
            ? [
                [K.SCRIP, K.randInt(40, 120)],
                [kind === "merc" ? "amb_note_contract" : "amb_note_warrant", 1],
                ["rally_tonic", 1],
              ]
            : [[K.SCRIP, K.randInt(5, 30)]],
        ),
      });
      if (a) out.push(a);
    }
    return out;
  }

  // ------------------------------------------------------------------
  // Director
  // ------------------------------------------------------------------
  const KINDS = {
    stranger: { make: encStranger, cd: 60, w: () => (K.isDark() ? 0.7 : 0) },
    preacher: { make: encPreacher, cd: 36, w: () => (K.isDark() ? 0.15 : 1) },
    lost_sleeper: {
      make: encLostSleeper,
      cd: 24 * 5,
      w: () => (questDone() || sleeper ? 0 : K.isDark() ? 0.2 : 0.9),
    },
    dog_chase: { make: encDogChase, cd: 20, w: () => 1.0 },
    dead_drop: { make: encDeadDrop, cd: 10, w: () => 1.3 },
    crash_site: { make: encCrash, cd: 48, w: () => (K.level() >= 3 ? 0.5 : 0) },
    hit_squad: {
      make: () => encHitSquad(),
      cd: 72,
      w: () =>
        K.level() >= 4 && hitSquadKind() && K.day() - stats.lastHitSquadDay >= 3
          ? 2.2
          : 0,
    },
  };
  function questDone() {
    try {
      return (
        questApi() &&
        (G.quests.isComplete(Q_ID) ||
          (G.quests.isFailed && G.quests.isFailed(Q_ID)))
      );
    } catch (e) {
      return false;
    }
  }

  function start(kind) {
    const k = KINDS[kind];
    if (!k) return null;
    if (active) end(active, "replaced");
    let E = null;
    try {
      E = k.make();
    } catch (e) {
      G.reportError("ambient:encounter " + kind, e);
      E = null;
    }
    if (!E) return null;
    active = E;
    setCooldown(kind, k.cd);
    K.log("encounter", kind, Math.round(K.distToPlayer(E.x, E.z)) + "m");
    G.events.emit("ambientEncounter", kind, E);
    return E;
  }
  function roll() {
    const P = G.player;
    if (
      !K.playerOutdoors() ||
      G.state !== "play" ||
      K.inCombat() ||
      !K.hasActors()
    )
      return;
    if (
      K.friendlyLocAt(P.pos.x, P.pos.z, 20) ||
      K.hostileLocAt(P.pos.x, P.pos.z, 10)
    )
      return;
    // guarded towns (combat 45_safezone): encounters spawn 60–120 m out, so keep clear of zone + 120 m
    try {
      if (
        !G.isStub("combat") &&
        G.combat.isSafeZone &&
        G.combat.isSafeZone(P.pos.x, P.pos.z, 120)
      )
        return;
    } catch (e) {
      /* ignore */
    }
    if (liveAdopted() > MAX_ADOPTED_ACTORS - 4) return;
    const pairs = [];
    for (const kind in KINDS) {
      if (!ready(kind)) continue;
      const w = KINDS[kind].w();
      if (w > 0) pairs.push([kind, w]);
    }
    const kind = K.weighted(pairs);
    if (kind) start(kind);
  }
  function update(dt) {
    if (dt <= 0 || !K.playerOk()) return;
    const t = K.now();
    // encounter + adopted groups (4 Hz is plenty)
    E_T += dt;
    if (E_T >= 0.25) {
      const step = E_T;
      E_T = 0;
      if (active) {
        let r = null;
        try {
          r = active.update(step);
        } catch (e) {
          G.reportError("ambient:encounter " + active.kind, e);
          r = "error";
        }
        if (r) end(active, r);
      }
      if (t > G_T) {
        G_T = t + 2;
        updateGroups();
      }
    }
    // roll for a new one every 45–90 s of game time while nothing is running
    if (!nextRollT) nextRollT = t + K.rand(60, 120);
    if (!active && t > nextRollT) {
      nextRollT = t + K.rand(45, 90);
      if (Math.random() < 0.55) roll();
    }
  }
  let E_T = 0,
    G_T = 0;

  K.system({
    name: "encounters",
    order: 60,
    initDone() {
      defineNotes();
      registerPreacherDialogue();
      sleeperDialogue();
      defineQuest();
    },
    newGame() {
      defineNotes();
      registerPreacherDialogue();
      sleeperDialogue();
      defineQuest();
    },
    reset() {
      if (active) {
        try {
          active.cleanup("reset");
        } catch (e) {
          /* ignore */
        }
        active = null;
      }
      clearGroups();
      sleeper = null;
      nextRollT = 0;
      for (const k in cooldown) delete cooldown[k];
      Object.assign(stats, {
        strangerSeen: 0,
        lostSleeper: 0,
        preacher: 0,
        hitSquads: 0,
        lastHitSquadDay: -99,
      });
    },
    update,
    save: () => ({
      cd: Object.assign({}, cooldown),
      stats: Object.assign({}, stats),
    }),
    load(d) {
      if (!d) return;
      if (d.cd)
        for (const k in d.cd)
          if (KINDS[k] && typeof d.cd[k] === "number") cooldown[k] = d.cd[k];
      if (d.stats)
        for (const k in stats)
          if (typeof d.stats[k] === "number") stats[k] = d.stats[k];
      // an escort in progress doesn't survive a load (the actor is transient): let the quest fail gracefully
      if (questActive()) failQuest();
    },
  });

  const _v = new THREE.Vector3();
  K.encounters = {
    adopt,
    start,
    end: (r) => end(active, r || "debug"),
    active: () => active,
    kinds: () => Object.keys(KINDS),
    stats: () =>
      Object.assign(
        {
          active: active ? active.kind : null,
          groups: groups.length,
          adopted: liveAdopted(),
        },
        stats,
      ),
    roll,
    cooldowns: () => Object.assign({}, cooldown),
    QUEST_ID: Q_ID,
    /** Register an extra encounter kind (62_encounters_more.js): def {make() → E|null, cd: game hours, w() → weight}. */
    register(kind, def) {
      KINDS[kind] = def;
      return def;
    },
    /** Shared plumbing for encounter files. */
    util: { castGone, removeCast, setCooldown, ready, questApi },
    /** Force a hit squad now: 'merc' (high standing) | 'marshal' (low standing) | undefined (by standing). */
    hitSquad(kind) {
      if (active) end(active, "replaced");
      let E = null;
      try {
        E = encHitSquad(
          kind === "merc" || kind === "marshal" ? kind : undefined,
        );
      } catch (e) {
        G.reportError("ambient:hitsquad", e);
      }
      if (E) {
        active = E;
        setCooldown("hit_squad", KINDS.hit_squad.cd);
      }
      return E;
    },
  };
})();
