// play-inline-525 01 — pos
// Lines 37-373 of readable/play-inline-525.pretty.js (statement-aligned).
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
