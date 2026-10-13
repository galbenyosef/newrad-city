// play-inline-521 03 — pos
// Lines 608-941 of readable/play-inline-521.pretty.js (statement-aligned).
  function driveLive(c, dt) {
    const lv = c.live,
      a = lv.trader,
      P = G.player,
      t = K.now();
    if (!a || a.removed || a._ambGone) {
      c.live = null;
      return;
    }
    if (a.dead) {
      if (c.alive) {
        c.alive = false;
        c.deadDay = K.day();
        K.log("convoy trader died", traderName(c));
      }
      // survivors mill around; despawn with distance
    } else {
      c.x = a.pos.x;
      c.z = a.pos.z;
      const R = ROUTES[c.ti];
      const calm =
        a.state === "idle" || a.state === "move" || a.state === "follow";
      const busy = K.actorBusy(a);
      if (c.state === "stop") {
        if (calm && a.aiMode !== "merchant") {
          a.aiMode = "merchant";
        }
        const sp = R.pts[c.wp];
        if (calm && Math.hypot(a.pos.x - sp.x, a.pos.z - sp.z) > 4 && !busy) {
          a.aiMode = "patrol";
          a.patrol = [{ x: sp.x, z: sp.z }];
          a.patrolIdx = 0;
        }
        if (!busy && stopOver(c)) {
          departStop(c);
          a.aiMode = "patrol";
          a.say &&
            K.say(
              a,
              K.pick([
                "Pack it up, we're moving out!",
                "Alright, let's go. " +
                  nextStopName(c) +
                  " won't trade with itself.",
                "Heads up, moving on.",
              ]),
              3.5,
            );
        }
      } else {
        const tp = R.pts[c.wp];
        if (calm && !busy) {
          if (a.aiMode !== "patrol") a.aiMode = "patrol";
          if (
            !a.patrol ||
            !a.patrol.length ||
            a.patrol[0].x !== tp.x ||
            a.patrol[0].z !== tp.z
          ) {
            a.patrol = [{ x: tp.x, z: tp.z }];
            a.patrolIdx = 0;
          }
        }
        if (Math.hypot(a.pos.x - tp.x, a.pos.z - tp.z) < 3.5) {
          if (tp.stop) {
            arriveStop(c);
            a.aiMode = "merchant";
            K.say(
              a,
              "Here we are — " + LOCNAME(tp.stop) + ". Open for business!",
              3.5,
            );
          } else c.wp = (c.wp + 1) % R.pts.length;
        }
        // stuck detection (a car wreck in the way, a collapsed street...)
        if (Math.hypot(a.pos.x - lv.lastX, a.pos.z - lv.lastZ) > 1.2) {
          lv.lastX = a.pos.x;
          lv.lastZ = a.pos.z;
          lv.moveT = t;
        } else if (calm && !busy && t - lv.moveT > 25) {
          lv.moveT = t;
          const nx = tp.x,
            nz = tp.z;
          if (
            !K.inView(a.pos.x, a.pos.y + 1, a.pos.z, 2, true) &&
            !K.inView(nx, 1, nz, 2, true)
          ) {
            const s = K.freeSpotNear(nx, nz, 4, 10);
            if (s)
              for (const m of liveAll(lv))
                if (K.actorAlive(m)) {
                  m.pos.set(
                    s.x + (Math.random() - 0.5) * 3,
                    s.y,
                    s.z + (Math.random() - 0.5) * 3,
                  );
                  if (m.nav) {
                    m.nav.path = null;
                    m.nav.search = null;
                  }
                }
          }
        }
      }
    }
    // followers drift back into formation after a fight
    for (const m of lv.guards.concat(lv.oxen)) {
      if (!K.actorAlive(m) || !K.actorAlive(a)) continue;
      if (m.state === "idle" && m.followTarget !== a) {
        try {
          m.follow(a);
        } catch (e) {
          /* ignore */
        }
      }
    }
    // camp fire at a night stop
    if (
      c.state === "stop" &&
      K.isDark() &&
      K.actorAlive(a) &&
      !campFire &&
      Math.hypot(P.pos.x - c.x, P.pos.z - c.z) < 120
    ) {
      const s = K.freeSpotNear(c.x + 3, c.z + 2, 3, 8);
      if (s) {
        const h = K.spawnProp("campfire", {
          x: s.x,
          y: s.y,
          z: s.z,
          yaw: Math.random() * 6.28,
          pot: true,
        });
        if (h) campFire = { h, convoy: c };
      }
    }
    if (
      campFire &&
      campFire.convoy === c &&
      (c.state !== "stop" || !K.isDark())
    ) {
      K.removeProp(campFire.h);
      campFire = null;
    }
    // dematerialise with distance (never mid-conversation / while fighting the player nearby)
    const d = Math.hypot(P.pos.x - c.x, P.pos.z - c.z);
    if (d < 25 && c.alive) c.met = true;
    const inside = K.isInterior(P.pos.x);
    lv.outsideT = inside ? lv.outsideT + dt : 0;
    const fightingPlayer = liveAll(lv).some(
      (m) => K.actorAlive(m) && m.inCombat && m.target === "player",
    );
    if (
      (d > K.CFG.CONVOY_DESPAWN_R || lv.outsideT > 6) &&
      !K.actorBusy(a) &&
      !(fightingPlayer && d < 300)
    )
      dematerialize(c);
  }

  let tickT = 0;
  function update(dt) {
    if (!ROUTES.length || !CONVOYS.length) return;
    if (dt <= 0) return;
    tickT += dt;
    if (tickT < 0.5) return;
    const step = tickT;
    tickT = 0;
    const P = G.player;
    const outdoors = K.playerOutdoors();
    let liveN = 0;
    for (const c of CONVOYS) if (c.live) liveN++;
    for (const c of CONVOYS) {
      // a replacement trader takes over a dead route after 4 days
      if (!c.alive && !c.live && K.day() - c.deadDay >= 4) {
        const fresh = newConvoy(c.ti);
        fresh.gen = c.gen + 1;
        Object.assign(c, fresh);
      }
      if (c.live) {
        driveLive(c, step);
        continue;
      }
      if (!c.alive) continue;
      // abstract simulation
      if (c.state === "stop") {
        if (stopOver(c)) departStop(c);
      } else advance(c, SPEED * step);
      // materialise near the player
      if (
        outdoors &&
        liveN < K.CFG.CONVOY_LIVE_MAX &&
        G.state === "play" &&
        Math.hypot(P.pos.x - c.x, P.pos.z - c.z) < K.CFG.CONVOY_SPAWN_R
      ) {
        if (materialize(c)) liveN++;
      }
    }
  }

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
  function convoyOf(key) {
    const ti = TRADERS.findIndex((T) => T.key === key);
    return CONVOYS.find((c) => c.ti === ti) || null;
  }
  function registerDialogues() {
    for (const T of TRADERS) {
      const id = "amb_dlg_" + T.key;
      const rumorSeen = new Set();
      K.registerDialogue(id, {
        start: "hello",
        nodes: {
          hello: {
            text: () => {
              const c = convoyOf(T.key);
              const k = K.standing();
              let line = K.pick(T.greet);
              if (c && c.gen > 0)
                line =
                  "Name's " +
                  traderName(c) +
                  ". Took over the route after " +
                  T.name.split(" ").slice(-1)[0] +
                  " got... retired. Same prices, same oxen.";
              if (k <= -750)
                line += " ...And keep your hands where my guards can see them.";
              else if (k >= 750)
                line += " Heard good things about you, by the way.";
              return line;
            },
            responses: [
              {
                text: "Let's see what you're selling.",
                barter: true,
                end: true,
              },
              { text: "Where's the convoy headed?", next: "route" },
              { text: "Heard any news on the road?", next: "rumor" },
              { text: "Tell me about yourself.", next: "bio" },
              { text: "Goodbye.", end: true },
            ],
          },
          route: {
            text: () => {
              const c = convoyOf(T.key);
              const loop = T.stops.map(LOCNAME).join(", ");
              const here = c ? currentStop(c) : null;
              return (
                (here
                  ? "We're trading here at " +
                    LOCNAME(here) +
                    " for a few hours, then on to "
                  : "Next stop's ") +
                (c ? nextStopName(c) : LOCNAME(T.stops[0])) +
                ". The loop runs " +
                loop +
                ", and round again. We make camp at sundown — only fools and raiders walk Manhattan at night."
              );
            },
            responses: [
              { text: "Back to business.", next: "hello" },
              { text: "Safe travels.", end: true },
            ],
          },
          rumor: {
            text: () => {
              let pool = RUMORS.filter((r) => !rumorSeen.has(r));
              if (!pool.length) {
                rumorSeen.clear();
                pool = RUMORS;
              }
              const r = K.pick(pool);
              rumorSeen.add(r);
              return "Road talk? " + r;
            },
            responses: [
              { text: "Anything else?", next: "rumor2" },
              { text: "Back to business.", next: "hello" },
            ],
          },
          rumor2: {
            text: () => {
              let pool = RUMORS.filter((r) => !rumorSeen.has(r));
              if (!pool.length) pool = RUMORS;
              const r = K.pick(pool);
              rumorSeen.add(r);
              return "Let me think... " + r;
            },
            responses: [
              { text: "Back to business.", next: "hello" },
              { text: "Thanks. Goodbye.", end: true },
            ],
          },
          bio: {
            text: () => T.bio,
            responses: [
              {
                text: "Must be lonely work. Lonely enough for a discount?",
                check: { skill: "trade", value: 45 },
                next: "discount",
                failNext: "nodiscount",
              },
              { text: "Back to business.", next: "hello" },
            ],
          },
          discount: {
            text: "Ha! Lonely, no. Charmed, maybe. Here — a little something for the road, on the house.",
            onEnter: () => {
              const gift =
                T.key === "sal"
                  ? ["ammo_10mm", 20]
                  : T.key === "pike"
                    ? ["rally_tonic", 1]
                    : T.key === "eddie"
                      ? ["duct_tape", 2]
                      : ["purified_water", 2];
              if (K.give(gift[0], gift[1])) K.sfx("pickup");
            },
            responses: [{ text: "Much obliged.", next: "hello" }],
          },
          nodiscount: {
            text: "Nice try. Prices are prices, friend.",
            responses: [{ text: "Worth a shot.", next: "hello" }],
          },
        },
      });
    }
  }

  // ------------------------------------------------------------------
  // System
  // ------------------------------------------------------------------
