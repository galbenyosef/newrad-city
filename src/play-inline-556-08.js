// play-inline-556 08 — rec
// Lines 2278-2617 of readable/play-inline-556.pretty.js (statement-aligned).
  function fameLine(rec) {
    const g = !!rec.def.guard,
      out = [];
    if (L.flag("neon_guard_sergeant"))
      out.push(
        g
          ? pick([
              "Sergeant.",
              "Evening, Sergeant. Walls are quiet.",
              "*salutes* Sergeant on the square!",
            ])
          : "Evening, Sergeant. Keeping us safe?",
      );
    else if (L.flag("neon_guard_member") && g)
      out.push(
        pick([
          "Guardsman. Captain's been asking after you.",
          "Hey, it's the new blood. Don't die, we're short.",
        ]),
      );
    if (Q.isComplete("sq_neon_ball"))
      out.push(
        pick([
          "You're the one who got the Ball moving! Happy New Year! …Every night!",
          "Hey, it's the Ball fixer! I kissed a stranger at the drop. Might've been you.",
        ]),
      );
    if (Q.isComplete("sq_neon_power"))
      out.push(
        pick([
          "Lights stayed on all night. Heard that was you. Thanks, stranger.",
          "You're the one who stopped the blackouts? The dark's the only thing that scares me anymore.",
        ]),
      );
    if (L.flag("opry_star"))
      out.push(
        pick([
          "It's the star of the Revue! Sign my… anything. Sign my arm. It's not using it.",
          "Encore! ENCORE! …Sorry. Reflex.",
        ]),
      );
    if (L.flag("club_member") && !g)
      out.push("Card-burner! Welcome to the uncounted, pal. Suits you.");
    const kt = KT();
    if (kt >= 4)
      out.push(
        g
          ? "I know what you are. One wrong move in my square and you're meat."
          : pick([
              "Stay back. I heard what you did.",
              "Don't hurt me. I've been burned enough for one life.",
            ]),
      );
    else if (kt === 3)
      out.push(
        g
          ? "Keep your hands where I can see 'em. I've heard the stories."
          : "Hmph. Heard about you. Nothing good.",
      );
    else if (kt === 0)
      out.push(
        g
          ? "Good to have you in the Neon, friend. Word travels."
          : pick([
              "You're the one Rocky talks about on the radio! The good stuff!",
              "Bless you, stranger. The Neon owes you.",
            ]),
      );
    return out.length ? pick(out) : null;
  }
  const convo = { t: 0, busyUntil: 0 };
  function tryConversation() {
    const t = G.time.elapsed;
    if (t < convo.busyUntil || t < convo.t) return;
    convo.t = t + 10 + Math.random() * 12;
    const P = G.player.pos;
    const cands = [];
    for (const rec of town.recs.values()) {
      const a = rec.a;
      if (
        busy(a) ||
        rec.asleep ||
        rec.def.guard ||
        rec.def.role === "hawker" ||
        a.state === "move" ||
        !a.inScene
      )
        continue;
      if (Math.hypot(a.pos.x - P.x, a.pos.z - P.z) > 20) continue;
      cands.push(rec);
    }
    for (let i = 0; i < cands.length; i++)
      for (let j = i + 1; j < cands.length; j++) {
        const a = cands[i].a,
          b = cands[j].a;
        if (
          Math.hypot(a.pos.x - b.pos.x, a.pos.z - b.pos.z) > 6.5 ||
          Math.abs(a.pos.y - b.pos.y) > 1.5
        )
          continue;
        const rx = REACTIVE.filter((r) => {
          try {
            return !!r.cond();
          } catch (e) {
            return false;
          }
        });
        const lines =
          rx.length && Math.random() < 0.5 ? pick(rx).lines : pick(CONVOS);
        let k = 0;
        a.faceTowards(b.pos.x, b.pos.z);
        b.faceTowards(a.pos.x, a.pos.z);
        for (const [who, text] of lines) {
          const sp = who === "A" ? a : b;
          L.later(0.2 + k * 3.1, () => {
            if (!busy(sp)) sp.say(text, 3);
          });
          k++;
        }
        convo.busyUntil = t + lines.length * 3.1 + 25 + Math.random() * 20;
        return;
      }
  }
  function lifeTick() {
    const P = G.player;
    const t = G.time.elapsed;
    const f = P.forward || { x: -Math.sin(P.yaw), z: -Math.cos(P.yaw) };
    const night = nightNow();
    if (night !== town.night) {
      town.night = night;
      for (const rec of town.recs.values())
        if (rec.def.guard && !rec.def.barks && !busy(rec.a)) applyBarks(rec);
    }
    for (const rec of town.recs.values()) {
      const a = rec.a;
      if (busy(a) || !a.inScene) continue;
      const dx = a.pos.x - P.pos.x,
        dz = a.pos.z - P.pos.z,
        d = Math.hypot(dx, dz);
      if (d > 32) continue;
      // hawkers cry their wares; Velvet sings on stage
      if (
        rec.act === "work" &&
        rec.def.role === "hawker" &&
        rec.leg === "at" &&
        t > rec.hawkT
      ) {
        rec.hawkT = t + 9 + Math.random() * 8;
        a.say(pick(HAWK[rec.id] || HAWK.neon_newsie), 3.6);
        continue;
      }
      if (rec.act === "perform" && rec.leg === "at" && t > rec.hawkT) {
        rec.hawkT = t + 6 + Math.random() * 4;
        a.say(pick(rec.def.songs || SINGING), 4);
        if (a.char && a.char.playOneShot)
          try {
            a.char.playOneShot("talk");
          } catch (e) {
            /* ignore */
          }
        continue;
      }
      // greeting: walk up to someone and look at them
      if (
        d < 3.2 &&
        t > rec.greetT &&
        Math.abs(a.pos.y - P.pos.y) < 1.6 &&
        (dx * f.x + dz * f.z) / (d || 1) > 0.6
      ) {
        rec.greetT = t + 50 + Math.random() * 30;
        a.faceTowards(P.pos.x, P.pos.z);
        const fame = rec.asleep
          ? null
          : Math.random() < 0.55
            ? fameLine(rec)
            : null;
        if (fame) a.say(fame, 3.5);
        else a.bark("greet");
      }
    }
    tryConversation();
  }

  // ------------------------------------------------------------------
  // Public helpers for 48/49 (L.neonTown)
  // ------------------------------------------------------------------
  L.neonTown = {
    spot,
    has,
    series,
    rawAnchor,
    rec: (id) => town.recs.get(id) || null,
    recs: () => Array.from(town.recs.values()),
    asleep: (id) => {
      const r = town.recs.get(id);
      return !!(r && r.asleep && r.leg === "at");
    },
    /** Crowd event: everyone (townsfolk/hawkers/off-duty merchants) walks to `at(rec)` while `who(rec)` is true. */
    setGather(g) {
      town.gather = g || null;
      for (const r of town.recs.values())
        if (r.act === "gather" || (g && g.who(r))) {
          r.act = null;
        }
    },
    ROSTER,
    STOCK,
    ROUTINES,
    CONVOS,
    REACTIVE,
    HAWK,
    nightNow,
    place: placeOf,
    realOpry,
    PLACES,
    ALIAS,
    skipped: () => (town.skipped || []).slice(),
    customerSpot,
    fameLine,
    /**
     * Sleeping NPC wrapper for dialogue trees (shared trees too: the check uses the actor being
     * talked to): talking to a sleeper opens a groggy node first — you can wake people up.
     */
    sleepy(tree) {
      const start0 = tree.start;
      const real = (actor, A) =>
        typeof start0 === "function" ? start0(actor, A) : start0;
      tree.nodes.__asleep = {
        text: () =>
          pick([
            "Zzz… [They're fast asleep.]",
            "Hrrn… *wheezy snore* [Asleep.]",
            "[Curled up and snoring like a rotorcraft.]",
          ]),
        responses: [
          { text: "[Wake them up.]", next: "__woken" },
          {
            text: "[Go through their pockets while they sleep.]",
            check: { skill: "stealth", value: 40 },
            standing: -15,
            repeatStanding: true,
            cond: (actor) =>
              !!actor &&
              !actor.neonGuard &&
              L.flag("neon_lift_" + actor.id) !== G.time.day,
            action: (actor) => {
              L.setFlag("neon_lift_" + actor.id, G.time.day);
              const n = 6 + Math.floor(Math.random() * 22);
              L.giveScrip(n);
              L.incFlag("neon_lifts");
            },
            next: "__lifted",
            failNext: "__caught",
          },
          { text: "[Let them sleep.]" },
        ],
      };
      tree.nodes.__lifted = {
        text: '[A few folded scrip notes and a button. They mumble something about "…my mother\'s noodles…" and roll over.]',
        responses: [{ text: "[Slip away.]" }],
      };
      tree.nodes.__caught = {
        text: "[An eye snaps open. Then the other one, eventually.] HEY! Hands OFF, topsider! GUARD! THIEF!",
        onEnter(actor) {
          if (actor) L.setFlag("neon_lift_" + actor.id, G.time.day);
          L.standing(-5, "Caught stealing in the Neon");
          const g = Array.from(town.recs.values()).filter(
            (r) =>
              r.def.guard &&
              r.a &&
              !r.a.dead &&
              G.player &&
              Math.hypot(
                r.a.pos.x - G.player.pos.x,
                r.a.pos.z - G.player.pos.z,
              ) < 40,
          )[0];
          if (g)
            g.a.say(
              "Hands where I can see 'em! One more time and you're out of the Neon.",
              4,
            );
        },
        responses: [{ text: "[Back away.]" }],
      };
      tree.nodes.__woken = {
        text: () =>
          pick([
            "Wha—? Oh, it's you. Fine. FINE. What?",
            "This better be good, stranger.",
            "*cough* I'm up, I'm up. What do you want?",
          ]),
        responses: [
          { text: "I need something.", next: (actor, A) => real(actor, A) },
          { text: "Sorry. Go back to sleep." },
        ],
      };
      tree.start = (actor, A) =>
        actor && L.neonTown.asleep(actor.id) ? "__asleep" : real(actor, A);
      return tree;
    },
  };

  // ------------------------------------------------------------------
  // Dialogues (generic: guards, hawkers, townsfolk; stall merchants)
  // ------------------------------------------------------------------
  const PLACE_DIRS = [
    [
      "Where can I buy supplies?",
      "The Marquee Market, right under the billboards. Tillie for guns, Brass for ammo, Mags for clothes, Joe for junk. Old Sato does noodles all night.",
    ],
    [
      "I need a doctor.",
      "Doc Broadway's clinic, the old box office with the red cross on it. Tell him a guard sent you. He won't care, but tell him.",
    ],
    [
      "Where can a body sleep?",
      () =>
        placeOf("bunkhouse")
          ? "The Bunkhouse. Dottie rents beds, twenty scrip. Clean-ish."
          : "Nowhere with a door, yet. Dottie's still shovelling the old Astor out so she can rent beds again. Till then folks bunk wherever it's dry and the Guard can see 'em.",
    ],
    [
      "Where's the mayor?",
      "Crowe's office is the old Recruiting Station on the island. Notice board's out front if you're looking for work.",
    ],
    [
      "Where can I get a drink?",
      "The Rad Room. Marigold pours, Lucky Lou deals. Don't play cards with Lou.",
    ],
    [
      "Anything fun to do around here?",
      () =>
        (placeOf("gallery") ? "Ammo Annie's gallery, " : "") +
        (realOpry()
          ? "the Opry after dark"
          : "the Revue after dark on the Rad-Lounge stage") +
        ", Lucky Lou's cards, the Cinder Club if you can talk your way past Sal. Or stand under the Ball and wait for it to drop. Some folks been waiting twenty-two years.",
    ],
  ];
