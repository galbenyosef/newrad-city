// play-inline-559 04 — exp
// Lines 976-1325 of readable/play-inline-559.pretty.js (statement-aligned).
  function spawnBounty(b) {
    if (L.flag("bounty_done_" + b.id) || L.isDead(b.id)) return;
    const p = bountyPos(b);
    if (!p) return;
    const lvl = Math.max(4, L.level() + (b.stage === "b3" ? 3 : 1));
    const boss = L.spawnNPC({
      id: b.id,
      type: b.type,
      faction: b.faction,
      name: b.name,
      level: lvl + 2,
      pos: { x: p.x, y: p.y, z: p.z },
      ai: "guard",
      home: { x: p.x, z: p.z, r: 6 },
      hostile: true,
      weapon: b.weapon,
      hp: b.type === "brute" ? 420 : b.type === "maniac_bruiser" ? 260 : 220,
      noRespawn: true,
      inventory: [["scrip", 40 + lvl * 5]],
    });
    if (boss) boss.bountyTarget = b.id;
    let k = 0;
    for (const [type, n] of b.minions)
      for (let i = 0; i < n; i++) {
        const s = L.freeSpot(
          p.x + (Math.random() - 0.5) * 10,
          p.z + (Math.random() - 0.5) * 10,
          p.y,
          { maxR: 6 },
        );
        L.spawnNPC({
          id: b.id + "_m" + k++,
          type,
          faction: b.faction,
          level: lvl,
          pos: { x: s.x, y: s.y, z: s.z },
          ai: "guard",
          home: { x: s.x, z: s.z, r: 8 },
          hostile: true,
          noRespawn: true,
        });
      }
  }
  function currentBounty() {
    const st = Q.stage("sq_neon_guard");
    return BOUNTIES.find((b) => b.stage === st) || null;
  }

  // ==================================================================
  // THE NEON EXPRESS — escort contracts
  // ==================================================================
  const RUNS = [
    {
      q: "sq_neon_express1",
      dest: "grand_central",
      name: "Grand Central Market",
      pay: 150,
      driver: "Wagoneer Hank Lowry",
      cargo: "forty crates of Fizzo Cola and one very nervous pack ox",
    },
    {
      q: "sq_neon_express2",
      dest: "radio_city",
      name: "Radio City",
      pay: 175,
      driver: "Wagoneer Rosa Ybarra",
      cargo: "replacement tubes for Rocky Delgado's transmitter",
    },
    {
      q: "sq_neon_express3",
      dest: "carnegie_hall",
      name: "Carnegie Hall",
      pay: 225,
      driver: 'Wagoneer "Deacon" Boyle',
      cargo: "Rally Tonic and Prussian Blue for the Carnegie settlement",
      standing: 50,
    },
  ];
  const EXP = {
    run: null,
    driver: null,
    ox: null,
    ambushed: false,
    done: false,
    waitT: 0,
    pts: [],
    idx: 0,
    doneT: 0,
  };
  function expressRoute(dest) {
    const start = N().spot(["convoy_arrive", "convoy_park_1", "depot_door"], {
      near: ["entrance_south", "subway"],
      dx: 0,
      dz: 6,
    });
    const loc = G.LAYOUT.getLocation(dest);
    if (!start || !loc) return null;
    const Ly = G.LAYOUT;
    // L-shaped street route: along the avenue to the destination's street, then along the street
    const zS = loc.z,
      xA = -40;
    const pts = [{ x: start.x, z: start.z }];
    const corner1 = { x: xA, z: start.z },
      corner2 = { x: xA, z: zS },
      end = { x: loc.x, z: loc.z };
    const onRoad = (p) => Ly.isRoad(p.x, p.z);
    if (onRoad(corner1)) pts.push(corner1);
    pts.push(onRoad(corner2) ? corner2 : { x: xA, z: zS });
    // pull the end point a little out of the settlement footprint onto the street
    const dx = end.x - corner2.x,
      dz = end.z - corner2.z,
      d = Math.hypot(dx, dz) || 1;
    const stop = L.freeSpot(
      end.x - (dx / d) * Math.min(12, d * 0.3),
      end.z - (dz / d) * Math.min(12, d * 0.3),
      0,
      { maxR: 12 },
    );
    pts.push({ x: stop.x, z: stop.z });
    return { start, pts };
  }
  /**
   * resume = the saved progress {q, idx, x, z, amb, n} (flag neon_exp_state, written every 2 s while
   * the wagon rolls): after a load the driver + pack ox reappear where the save left them, on the
   * same leg of the route, instead of restarting from the Depot.
   */
  function startExpress(run, resume) {
    const r = expressRoute(run.dest);
    if (!r) {
      L.notify("The wagon isn't ready. Try again later.");
      return false;
    }
    if (!resume) L.incFlag("neon_exp_n");
    EXP.run = run;
    EXP.pts = r.pts;
    EXP.idx = 1;
    EXP.ambushed = false;
    EXP.done = false;
    EXP.waitT = 0;
    EXP.doneT = 0;
    EXP.saveT = 0;
    EXP.driverId =
      "neon_exp_driver" +
      (resume && resume.n !== undefined
        ? resume.n
        : Number(L.flag("neon_exp_n")) || 0);
    let at = r.start;
    if (resume) {
      EXP.idx = Math.max(1, Math.min(r.pts.length - 1, resume.idx || 1));
      EXP.ambushed = !!resume.amb;
      const f = L.freeSpot(resume.x, resume.z, 0, { maxR: 10 });
      if (f && !f.forced) at = f;
    }
    EXP.driver = L.spawnNPC({
      id: EXP.driverId,
      type: "human",
      faction: "settlers",
      name: run.driver,
      outfit: "merchant",
      gender: run.q === "sq_neon_express2" ? "f" : "m",
      hat: "cowboy",
      hatColor: 0x4a3420,
      pos: { x: at.x, y: at.y || 0, z: at.z },
      ai: "patrol",
      patrol: [EXP.pts[EXP.idx]],
      hp: 220,
      level: 6,
      weapon: "pistol_10mm",
      voice: "merchant",
      noRespawn: true,
      barks: {
        idle: [
          "Steady, girl. Steady.",
          "Keep your eyes on the rooftops.",
          "Nice and slow.",
        ],
        combat: ["Protect the wagon!", "Ambush! AMBUSH!"],
      },
    });
    const bp = L.freeSpot(at.x + 2, at.z + 2, at.y, { maxR: 5 });
    try {
      if (!G.isStub("ambient") && G.ambient.ox && EXP.driver)
        EXP.ox = G.ambient.ox({
          pos: { x: bp.x, y: bp.y, z: bp.z },
          variant: 1,
          pack: true,
          ai: "follow",
          follow: EXP.driver,
          name: "Neon Express Pack Ox",
        });
    } catch (e) {
      EXP.ox = null;
    }
    if (EXP.driver)
      EXP.driver.say(
        resume
          ? "There you are, partner. " +
              run.name +
              " ain't getting any closer by itself."
          : "Alright, partner. " + run.name + ", nice and easy. Stay close.",
        4,
      );
    if (EXP.driver) saveExpress();
    return !!EXP.driver;
  }
  function saveExpress() {
    const d = EXP.driver;
    if (!EXP.run || !d || !d.pos) return;
    L.setFlag("neon_exp_state", {
      q: EXP.run.q,
      idx: EXP.idx,
      x: +d.pos.x.toFixed(1),
      z: +d.pos.z.toFixed(1),
      amb: EXP.ambushed,
      n: Number(EXP.driverId.replace(/\D+/g, "")) || 0,
    });
  }
  function ambush() {
    if (EXP.ambushed || !EXP.driver) return;
    EXP.ambushed = true;
    const d = EXP.driver,
      nx = EXP.pts[Math.min(EXP.idx, EXP.pts.length - 1)];
    const dx = nx.x - d.pos.x,
      dz = nx.z - d.pos.z,
      dl = Math.hypot(dx, dz) || 1;
    const ax = d.pos.x + (dx / dl) * 28,
      az = d.pos.z + (dz / dl) * 28;
    const lvl = Math.max(3, L.level());
    const n =
      3 +
      (EXP.run.q === "sq_neon_express3"
        ? 2
        : EXP.run.q === "sq_neon_express2"
          ? 1
          : 0);
    for (let i = 0; i < n; i++) {
      const s = L.freeSpot(
        ax + (Math.random() - 0.5) * 10,
        az + (Math.random() - 0.5) * 10,
        0,
        { maxR: 8 },
      );
      L.spawnNPC({
        id:
          "neon_exp_raider" +
          RUNS.indexOf(EXP.run) +
          "_" +
          (Number(L.flag("neon_exp_n")) || 0) +
          "_" +
          i,
        type: "raider",
        faction: "raiders",
        level: lvl,
        hostile: true,
        pos: { x: s.x, y: s.y, z: s.z },
        ai: "patrol",
        patrol: [
          { x: d.pos.x, z: d.pos.z },
          { x: ax, z: az },
        ],
        noRespawn: true,
        voice: "raider",
      });
    }
    d.say("Raiders! Protect the wagon!", 3);
  }
  function expressTick(dt) {
    const run = EXP.run;
    if (!run) return;
    const d = EXP.driver;
    if (!Q.isActive(run.q)) {
      cleanupExpress();
      return;
    }
    if (!d || d.removed) {
      cleanupExpress();
      return;
    }
    if (d.dead) {
      Q.fail(run.q);
      L.notify("The Neon Express driver is dead. Contract failed.");
      cleanupExpress();
      return;
    }
    EXP.saveT = (EXP.saveT || 0) + dt;
    if (EXP.saveT > 2 && !EXP.done) {
      EXP.saveT = 0;
      saveExpress();
    }
    if (EXP.done) {
      EXP.doneT += dt;
      if (
        EXP.doneT > 40 ||
        (G.player &&
          Math.hypot(G.player.pos.x - d.pos.x, G.player.pos.z - d.pos.z) > 90)
      )
        cleanupExpress();
      return;
    }
    const P = G.player.pos;
    const far = Math.hypot(P.x - d.pos.x, P.z - d.pos.z);
    const tgt = EXP.pts[EXP.idx];
    if (
      d.inCombat ||
      d.state === "combat" ||
      d.state === "flee" ||
      d.state === "cower"
    )
      return;
    // wait for the escort
    if (far > 35) {
      if (d.aiMode !== "static") {
        d.aiMode = "static";
        d.say(
          pick([
            "Hey! Where'd you go? I'm not moving without you.",
            "Partner? PARTNER?",
          ]),
          3,
        );
      }
      return;
    }
    if (d.aiMode !== "patrol" || !d.patrol || d.patrol[0] !== tgt) {
      d.aiMode = "patrol";
      d.patrol = [tgt];
      d.patrolIdx = 0;
    }
    if (Math.hypot(d.pos.x - tgt.x, d.pos.z - tgt.z) < 3.5) {
      if (EXP.idx < EXP.pts.length - 1) EXP.idx++;
      else {
        EXP.done = true;
        d.aiMode = "static";
        d.say(
          "We made it! " +
            run.name +
            "! Eustace'll have your scrip — here, take your cut now.",
          5,
        );
        Q.complete(run.q);
      }
    }
    // ambush at about half way
    if (
      !EXP.ambushed &&
      EXP.idx >= Math.max(1, Math.floor(EXP.pts.length / 2)) &&
      Math.random() < dt * 0.25
    )
      ambush();
  }
