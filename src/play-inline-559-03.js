// play-inline-559 03 — black
// Lines 655-975 of readable/play-inline-559.pretty.js (statement-aligned).
  function blackoutStart() {
    if (BLACK.on) return;
    BLACK.on = true;
    BLACK.t = 0;
    BLACK.popT = 0;
    BLACK.arcT = 0;
    BLACK.pops = billboardPoints();
    BLACK.landmark = landmarkPower(0.15);
    servicesLamps(false);
    L.sfx("explosion", { volume: 0.35, pitch: 0.45 });
    L.notify("The lights of the Neon go out.");
    L.later(0.8, () =>
      shout(
        pick([
          "The lights! THE LIGHTS!",
          "Who turned off the Neon?!",
          "Stay in the square! Stay together!",
        ]),
        5,
      ),
    );
  }
  function blackoutEnd(silent) {
    if (!BLACK.on) return;
    BLACK.on = false;
    landmarkPower(1);
    servicesLamps(true);
    if (!silent) {
      L.sfx("terminal_success", { volume: 0.5 });
      L.later(0.5, () =>
        shout(
          pick(["Lights! We got lights!", "THERE she is!", "The Neon's back!"]),
          5,
        ),
      );
    }
  }
  function blackoutTick(dt) {
    if (!BLACK.on || !nearNeon(220) || G.isStub("fx")) return;
    BLACK.t += dt;
    // the first seconds: a chain of blown transformers across the billboards
    if (BLACK.pops.length && BLACK.t > 0.3) {
      BLACK.popT -= dt;
      if (BLACK.popT <= 0) {
        BLACK.popT = 0.28 + Math.random() * 0.3;
        const p = BLACK.pops.shift();
        try {
          if (G.fx.flash) G.fx.flash(p, 0xbfe4ff, 3.2, 0.18);
        } catch (e) {
          /* ignore */
        }
        try {
          if (G.fx.sparks) {
            G.fx.sparks(p);
            G.fx.sparks(p.clone().add(new THREE.Vector3(0, -1.2, 0)));
          }
        } catch (e) {
          /* ignore */
        }
        L.sfx("explosion", {
          pos: p,
          volume: 0.18,
          pitch: 2.2 + Math.random() * 0.4,
        });
      }
    }
    // then: the cut feed arcs every few seconds
    BLACK.arcT -= dt;
    if (BLACK.arcT <= 0) {
      BLACK.arcT = 1.5 + Math.random() * 2.5;
      const pp = powerPanelSpot();
      if (pp) {
        const p = new THREE.Vector3(pp.x, (pp.y || 0) + 1.9, pp.z);
        try {
          if (G.fx.sparks) G.fx.sparks(p);
        } catch (e) {
          /* ignore */
        }
        if (Math.random() < 0.5)
          try {
            if (G.fx.flash) G.fx.flash(p, 0xa8d8ff, 1.6, 0.1);
          } catch (e) {
            /* ignore */
          }
      }
    }
  }
  /** Stand-in breaker cabinet + conduit riser (only while no power_generator / power_panel anchor is built). */
  function buildCabinet(p) {
    const parts = [
      [new THREE.BoxGeometry(1.3, 1.9, 0.55), 0x4a5048, 0, 0.95, 0],
      [new THREE.BoxGeometry(1.36, 0.08, 0.62), 0x2e322c, 0, 1.94, 0],
      [new THREE.BoxGeometry(1.1, 1.5, 0.03), 0x5d665a, 0, 1.0, 0.29],
      [new THREE.BoxGeometry(0.16, 0.16, 0.05), 0xd8c070, -0.3, 1.5, 0.31],
      [new THREE.BoxGeometry(0.16, 0.16, 0.05), 0xd8c070, 0.3, 1.5, 0.31],
      [new THREE.BoxGeometry(0.7, 0.05, 0.05), 0x1c1c1c, 0, 1.2, 0.31],
      [new THREE.BoxGeometry(0.7, 0.05, 0.05), 0x1c1c1c, 0, 1.0, 0.31],
      [new THREE.BoxGeometry(0.7, 0.05, 0.05), 0x1c1c1c, 0, 0.8, 0.31],
      [new THREE.BoxGeometry(0.34, 0.22, 0.02), 0xc8b020, 0, 0.45, 0.31],
      [new THREE.BoxGeometry(0.12, 9.5, 0.12), 0x2a2a26, -0.45, 6.7, -0.1],
      [new THREE.BoxGeometry(0.09, 9.5, 0.09), 0x1a1a18, 0.45, 6.7, -0.1],
      [new THREE.BoxGeometry(0.5, 0.35, 0.3), 0x3a3e38, 0, 2.15, 0],
    ];
    const geos = parts.map(([g, c, x, y, z]) => {
      g.translate(x, y, z);
      const col = new THREE.Color(c),
        n = g.attributes.position.count,
        a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        a[i * 3] = col.r;
        a[i * 3 + 1] = col.g;
        a[i * 3 + 2] = col.b;
      }
      g.setAttribute("color", new THREE.BufferAttribute(a, 3));
      return g.index ? g.toNonIndexed() : g;
    });
    const merged =
      G.util && G.util.mergeGeometries ? G.util.mergeGeometries(geos) : null;
    if (!merged) return null;
    const m = new THREE.Mesh(
      merged,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.75,
        metalness: 0.35,
      }),
    );
    m.name = "neon_breaker_cabinet";
    m.position.set(p.x, p.y || 0, p.z);
    m.rotation.y = p.yaw || 0;
    m.castShadow = true;
    G.scene.add(m);
    try {
      G.world.addCollider(
        p.x,
        p.z,
        1.4,
        0.6,
        p.y || 0,
        (p.y || 0) + 2.3,
        p.yaw || 0,
        { tag: "prop", walkable: false, surface: "metal" },
      );
    } catch (e) {
      /* ignore */
    }
    if (G.world.addLOD) G.world.addLOD(m, 110);
    return m;
  }
  function raidTick() {
    if (Q.stage("sq_neon_power") !== "defend") return;
    const h = G.time.hour;
    if (!RAID.spawned) {
      if (h >= 1.95 && h < 5 && nearNeon(170)) spawnRaid();
      return;
    }
    const alive = RAID.actors.filter((a) => a && !a.dead && !a.removed);
    if (!alive.length) {
      RAID.spawned = false;
      blackoutEnd(false);
      L.setFlag("neon_raid_beaten");
      Q.setStage("sq_neon_power", "report");
      const capt = L.npc("neon_capt");
      if (capt && !capt.dead)
        capt.say(
          "That's the last of them! Hold the gate! …Good work, everyone. GOOD work.",
          5,
        );
    }
  }
  function kipKnown(how) {
    if (!L.flag("kip_known")) {
      L.setFlag("kip_known", how);
      if (Q.stage("sq_neon_power") === "culprit")
        Q.setStage("sq_neon_power", "confront");
    }
  }
  function kipResolved(how) {
    L.setFlag("kip_outcome", how);
    if (how === "arrested" || how === "fled") {
      L.later(4, () => {
        L.setFlag("kip_gone");
        L.removeNPC("neon_kip");
      });
    }
    const st = Q.stage("sq_neon_power");
    if (st === "confront" || st === "culprit")
      Q.setStage("sq_neon_power", "defend");
  }

  // ==================================================================
  // THE SHOW MUST GO ON
  // ==================================================================
  function stageSpot() {
    return N().spot(["opry_stage", "singer", "stage"], {
      near: ["stage"],
      dx: 0,
      dz: 1,
    });
  }
  function showTick() {
    if (
      !Q.isActive("sq_neon_opry") ||
      Q.stage("sq_neon_opry") !== "show" ||
      L.flag("opry_show_running")
    )
      return; // (the stage stays 'show' after completion)
    const h = G.time.hour;
    if (h < 19.75 || h >= 23.5) return;
    const s = stageSpot();
    if (!s || !G.player) return;
    if (
      Math.hypot(G.player.pos.x - s.x, G.player.pos.z - s.z) > 9 ||
      Math.abs(G.player.pos.y - s.y) > 4
    )
      return;
    if (G.state !== "play") return;
    L.setFlag("opry_show_running", true);
    const dir = L.npc("neon_director");
    L.startDialogue(
      "dlg_neon_opry_show",
      dir &&
        !dir.dead &&
        Math.hypot(dir.pos.x - G.player.pos.x, dir.pos.z - G.player.pos.z) < 14
        ? "neon_director"
        : null,
    );
  }
  function applause(n) {
    const c = crowdNear(40);
    for (let i = 0; i < Math.min(n, c.length); i++) {
      const a = pick(c).a;
      L.later(Math.random() * 1.5, () =>
        a.say(
          pick([
            "Bravo!",
            "Encore!",
            "*raspy clapping*",
            "Woo!",
            "That's my topsider!",
            "Brava! Bravo! Whatever!",
          ]),
          2.5,
        ),
      );
    }
  }
  function boo(n) {
    const c = crowdNear(40);
    for (let i = 0; i < Math.min(n, c.length); i++) {
      const a = pick(c).a;
      L.later(Math.random() * 1.5, () =>
        a.say(
          pick([
            "Boooo!",
            "I've heard better from a Patrolman!",
            "Get the hook!",
            "I sat through the Bombing and THIS is worse!",
          ]),
          2.5,
        ),
      );
    }
  }

  // ==================================================================
  // NEON NIGHTS — the bounties
  // ==================================================================
  const BOUNTIES = [
    {
      id: "nb_librarian",
      stage: "b1",
      standing: 0,
      name: "The Night Librarian",
      type: "maniac_bruiser",
      faction: "maniacs",
      loc: "nypl",
      anchors: ["boss", "spawn1", "entrance"],
      fb: { x: 80, z: -168 },
      minions: [["maniac", 3]],
      pay: 150,
      text: 'WANTED: "THE NIGHT LIBRARIAN" — a Maniac the size of a card catalogue, running a pack on the steps of the Public Library. Still wears a library smock. Still shushes. Put it down. 150 SCRIP. — Capt. M. Kincaid',
    },
    {
      id: "nb_hinges",
      stage: "b2",
      standing: 50,
      name: "Rusty Hinges",
      type: "raider",
      faction: "raiders",
      loc: "port_authority",
      anchors: ["entrance", "boss"],
      fb: { x: -150, z: -196 },
      minions: [["raider", 3]],
      pay: 200,
      weapon: "assault_rifle",
      text: 'WANTED: RUSTY HINGES, boss of the Terminal Boys, camped outside the Port Authority bus terminal. Robbery, murder, and "unlicensed dentistry". 200 SCRIP. — Capt. M. Kincaid',
    },
    {
      id: "nb_gristle",
      stage: "b3",
      standing: 25,
      name: "Gristle",
      type: "brute",
      faction: "brutes",
      loc: null,
      anchors: [],
      fb: { x: -40, z: -128 },
      minions: [["brute", 2]],
      pay: 300,
      weapon: "minigun",
      text: 'WANTED: "GRISTLE", Brute war-chief, with a war party on Seventh Avenue below Herald Square. He wears a crown of teeth. Some of them are ours. 300 SCRIP. — Capt. M. Kincaid',
    },
  ];
  function bountyPos(b) {
    if (b.loc) {
      const p = L.anchor(b.loc, b.anchors, b.fb);
      if (p) return p;
    }
    return L.freeSpot(b.fb.x, b.fb.z, 0, { maxR: 16 });
  }
