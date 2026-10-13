/* src/quests_extra/45_lancer.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS_EXTRA — 45: "LANCER DOWN" (distress pulse)
 * An Iron Covenant exo-rig transponder pulsing on the emergency band from
 * Hell's Kitchen (10th Avenue & 40th Street). Lancer Imogen Rask of Survey
 * Detail Kestrel is pinned under collapsed scaffolding with a broken leg,
 * Maniacs circling.
 *
 * Start: walk within range of the pulse (the VIGIL goggles pick it up — the
 * beacon pips are audible near the source), or tune the signal if the
 * sound module lists it ('sig_covenant_distress', see NOTES "Requests").
 * Free her: [Brawn 7] lift / [Mechanics 45] servo bypass / [Explosives 50]
 * shaped charge / the hydraulic jack from the tow-truck wreck on 40th.
 * Then her leg: a Rally Tonic / [Medicine 40] splint / let her lean on you.
 * Or (cruel) take her gyrojet carbine and leave her to the Maniacs.
 * Sets G.quests flag 'qx_rask_saved' / 'qx_rask_robbed' for the Covenant.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const QX = G.qx;
  const K = () => QX.kit;

  const QID = "qx_lancer";
  const NPC = "qx_rask";
  // Shared ids owned by other modules (characters / combat / rpg).
  const RASK_TYPE = "covenant_warden",
    RASK_FACTION = "covenant",
    RASK_VOICE = "covenant",
    MANIAC_TYPE = "maniac",
    MANIAC_FACTION = "maniacs";
  const REEL_TYPE = "tape",
    TONIC = "rally_tonic",
    SIDEARM = "gyrojet_pistol",
    CARBINE = "gyrojet_carbine",
    ROCKETS = "ammo_gyrojet",
    SK_MECH = "mechanics";
  const SP = {
    knight: { x: -281, z: -197 }, // 10th Ave × 40th St, west kerb, under a fallen scaffold
    jack: { x: -262, z: -206 }, // tow-truck wreck on 40th St, a short walk east
    rock: { x: 80, z: -320 }, // Rockefeller Center (Iron Covenant chapterhouse), where she heads
  };
  QX.lancerSpots = SP;
  const MANIACS = 3;
  const qflag = (k, v) => {
    if (QX.qlive() && G.quests.setFlag)
      QX.safe("qflag", () => G.quests.setFlag(k, v));
  };

  // ==================================================================
  // Items & quest
  // ==================================================================
  QX.hook("items", function () {
    QX.defineItem({
      id: "qx_kd_jack",
      name: "Hydraulic Bottle Jack",
      type: "misc",
      weight: 6,
      value: 30,
      quest: true,
      noLoot: true,
      mesh: "toolbox",
      tags: ["quest"],
      desc: "A twelve-ton hydraulic bottle jack from a tow truck. Still holds pressure, which is more than can be said for the tow truck.",
    });
    QX.defineItem({
      id: "qx_rask_tag",
      name: "Lancer Rask's Service Tag",
      type: "misc",
      weight: 0,
      value: 0,
      quest: false,
      noLoot: true,
      mesh: "key",
      tags: ["unique"],
      desc: 'A stamped steel tag on a bead chain, the Iron Covenant\'s anvil on one side: RASK, I. — LANCER — SURVEY DETAIL KESTREL. Lancer Rask pressed it into your hand: "Show this at Rockefeller. Somebody will owe you a drink."',
    });
    QX.defineItem({
      id: "qx_rask_log",
      type: REEL_TYPE,
      name: "Tape Reel: Survey Detail Kestrel — Field Log",
      title: "SURVEY DETAIL KESTREL — FIELD LOG (Lancer I. Rask)",
      weight: 0,
      value: 0,
      noLoot: true,
      mesh: "tape",
      tags: ["tape"],
      text:
        "Day 1. Detail Kestrel: Lancer Vey (detail lead), Lancer Brannock, Lancer Rask. Objective: count the Brute raiding parties coming west out of Bellevue along 40th Street. Lancer-Commander Stroud wants numbers.\n\n" +
        "Day 3. Numbers: a lot. They have a Colossus. Vey says we observe and report. Brannock says we observe from further away.\n\n" +
        "Day 4. The Brutes have a mortar now, God knows from where. They were not aiming at us. They were not aiming at anything. The scaffold on 40th came down. " +
        "Vey and Brannock went for help at first light. My leg is broken below the knee. Rig servos are fried. I am sitting in my own exo-rig like a tin of beans.\n\n" +
        "Day 5. Transponder is on. Every Maniac in Hell's Kitchen has heard it. So far the carbine has heard them first.\n\n" +
        "Day 6. If anyone finds this: tell Vey I did not panic. Tell Brannock he still owes me six Scrip.",
    });
  });
  QX.hook("quests", function () {
    QX.define({
      id: QID,
      name: "Lancer Down",
      giver: "Iron Covenant Distress Pulse",
      location: "Hell's Kitchen",
      order: 53,
      desc:
        "An automated pulse on the emergency band: an Iron Covenant exo-rig transponder, broadcasting a distress code from somewhere around " +
        "10th Avenue and 40th Street. Transponders only do that when the person inside the rig can't switch them off.",
      stages: [
        {
          id: "find",
          text: "Find the source of the Iron Covenant distress pulse near 10th Avenue and 40th Street.",
          markers: () => [
            { x: SP.knight.x, z: SP.knight.z, label: "Distress Pulse" },
          ],
        },
        {
          id: "free",
          text: "Free Lancer Rask from the collapsed scaffolding.",
          markers: () => {
            const m = [
              {
                npc: NPC,
                label: "Lancer Rask",
                x: SP.knight.x,
                z: SP.knight.z,
              },
            ];
            if (
              QX.flag("kd_jack_hint") &&
              !QX.has("qx_kd_jack") &&
              !QX.flag("kd_freed")
            )
              m.push({ x: SP.jack.x, z: SP.jack.z, label: "Tow Truck" });
            return m;
          },
        },
        {
          id: "heal",
          text: "Lancer Rask's leg is broken. Patch her up.",
          markers: () => [
            { npc: NPC, label: "Lancer Rask", x: SP.knight.x, z: SP.knight.z },
          ],
        },
        {
          id: "done_saved",
          complete: true,
          text: () =>
            "Lancer Rask limped home toward Rockefeller Center" +
            (QX.flag("kd_limp") ? ", leaning on a scaffold pole." : ".") +
            " The Iron Covenant owes you one.",
        },
        {
          id: "done_left",
          complete: true,
          text: "You took Lancer Rask's gyrojet carbine and left her pinned in the rubble. The pulse is still going.",
        },
        {
          id: "o_maniacs",
          sideObjective: true,
          text: "(Optional) Deal with the Maniacs circling the scaffold.",
          doneIf: () => maniacsLeft() === 0,
          showIf: () => ["find", "free", "heal"].indexOf(QX.stage(QID)) >= 0,
        },
        {
          id: "o_jack",
          sideObjective: true,
          text: "(Optional) Find a jack in the tow-truck wreck on 40th Street.",
          doneIf: () => QX.has("qx_kd_jack") || !!QX.flag("kd_freed"),
          showIf: () => !!QX.flag("kd_jack_hint") && QX.stage(QID) === "free",
        },
      ],
      rewards: { xp: 200 },
    });
  });
  function maniacsLeft() {
    let n = 0;
    for (let i = 0; i < MANIACS; i++)
      if (!QX.flag("dead_qx_kd_maniac" + i) && QX.alive("qx_kd_maniac" + i))
        n++;
    return n;
  }

  // ==================================================================
  // Actions
  // ==================================================================
  const A = (QX.lancer = {
    start(silent) {
      if (QX.started(QID)) return false;
      QX.start(QID, { stage: QX.flag("kd_met") ? "free" : "find" });
      if (!silent)
        QX.notify(
          "Your goggles pick up a repeating pulse on the emergency band: an Iron Covenant exo-rig transponder, broadcasting a distress code. It's close.",
          { sub: "Lancer Down" },
        );
      return true;
    },
    met() {
      QX.setFlag("kd_met");
      if (!QX.started(QID)) A.start(true);
      if (QX.stage(QID) === "find") QX.setStage(QID, "free");
    },
    free(how) {
      if (QX.flag("kd_freed")) return false;
      A.met();
      QX.setFlag("kd_freed");
      QX.setFlag("kd_free_how", how);
      if (how === "jack") QX.take("qx_kd_jack", 1);
      if (how === "boom") {
        const a = QX.npc(NPC);
        if (a && a.damage)
          QX.safe("boom", () =>
            a.damage(20, { type: "explosive", source: "quest" }),
          );
        QX.sfx("explosion", {
          pos: QX.V3(SP.knight.x, (SP.knight.y || 0) + 0.5, SP.knight.z),
          volume: 0.6,
        });
      }
      QX.sfx("debris", {
        pos: QX.V3(SP.knight.x, (SP.knight.y || 0) + 0.5, SP.knight.z),
      });
      QX.xp(how === "jack" ? 40 : 60, "Lancer Down — freed Lancer Rask");
      QX.setStage(QID, "heal");
      return true;
    },
    heal(how) {
      if (!QX.flag("kd_freed") || QX.done(QID)) return false;
      if (how === "stim" && !QX.take(TONIC, 1)) return false;
      if (how === "limp") QX.setFlag("kd_limp");
      QX.setFlag("kd_healed", how);
      QX.standing(how === "limp" ? 40 : 60, "Rescued an Iron Covenant Lancer");
      QX.give(SIDEARM, 1);
      QX.give(ROCKETS, how === "stim" ? 24 : 16);
      QX.give("qx_rask_tag", 1);
      QX.give("qx_rask_log", 1);
      qflag("qx_rask_saved", true);
      QX.setStage(QID, "done_saved");
      QX.news(
        "Word from the Iron Covenant, of all people: a Lancer thought lost in Hell's Kitchen walked through the gates of Rockefeller Center " +
          "this morning with a splint on her leg and a story about a sleeper in a cryo suit. The Covenant does not say thank you on the radio. Rocky says it for them.",
      );
      QX.later(6, walkOff);
      return true;
    },
    rob() {
      if (QX.done(QID)) return false;
      A.met();
      QX.setFlag("kd_robbed");
      QX.standing(-100, "Robbed a wounded Iron Covenant Lancer");
      QX.give(CARBINE, 1);
      QX.give(ROCKETS, 20);
      qflag("qx_rask_robbed", true);
      const a = QX.npc(NPC);
      if (a) {
        a.barks = ["Coward.", "The Covenant remembers faces.", "Go on. Run."];
        if (a.inventory) a.inventory = [];
      }
      QX.setStage(QID, "done_left");
      return true;
    },
  });

  /** Freed & healed: she limps east along 40th Street and is gone once the player is far (or out of sight long enough). */
  let walkT = 0;
  function walkOff() {
    const a = QX.npc(NPC);
    if (!a || a.dead) {
      QX.setFlag("kd_gone");
      return;
    }
    a.barks = [
      "Iron and oath.",
      "Rockefeller. One step at a time.",
      "Tell Brannock he owes me six Scrip.",
    ];
    // guard mode walks to its home: make the destination her new "post" (east along 40th Street, toward Rockefeller)
    a.aiMode = "guard";
    a.ai = "guard";
    a.home = { x: SP.knight.x + 34, z: SP.knight.z + 1, r: 2 };
    a.homeYaw = Math.PI / 2;
    if (a.moveTo) QX.safe("walk", () => a.moveTo(a.home.x, a.home.z));
    walkT = 0;
  }
  QX.hook("update", function (dt, realDt) {
    if (!QX.reached(QID, "done_saved") || QX.flag("kd_gone")) return;
    walkT += realDt;
    const a = QX.npc(NPC);
    if (!a) {
      QX.setFlag("kd_gone");
      return;
    }
    if (walkT > 5 && (QX.dist(a.pos.x, a.pos.z) > 60 || walkT > 180)) {
      QX.removeNPC(NPC);
      QX.setFlag("kd_gone");
    }
  });

  // ==================================================================
  // World: scaffold collapse, transponder, tow-truck wreck
  // ==================================================================
  let beacon = null;
  QX.hook("world", function () {
    const k = K();
    const p = QX.freeSpot(SP.knight.x, SP.knight.z, undefined, {
      maxR: 8,
      radius: 1.6,
    });
    SP.knight.x = p.x;
    SP.knight.z = p.z;
    SP.knight.y = p.y;
    const yaw = Math.PI / 2; // she faces east, across the avenue; the scaffold lies across her legs
    const g = k.group(p.x, p.y, p.z, yaw, 140);
    const b = k.builder();
    const pipe = k.mat("rust", 0x6a3a22),
      plank = k.mat("wood_planks", 0x6a5238),
      slab = k.mat("concrete_dark", 0x55524c);
    const tarp = k.tint("qx_kd_tarp", 0x3f5a4a, {
      roughness: 1,
      side: THREE.DoubleSide,
    });
    // the standing half of the scaffold behind her (against the building line)
    for (const sx of [-1.8, 1.8])
      for (const sz of [0.9, 2.3]) k.cyl(b, pipe, 0.035, 3.6, sx, 1.8, sz, 6);
    for (const y of [1.2, 2.4, 3.5]) {
      k.cyl(b, pipe, 0.03, 3.7, 0, y, 0.9, 6, 0, Math.PI / 2);
      k.cyl(b, pipe, 0.03, 3.7, 0, y, 2.3, 6, 0, Math.PI / 2);
    }
    k.box(b, plank, 3.8, 0.05, 1.5, 0, 2.43, 1.6);
    k.box(b, tarp, 3.6, 1.1, 0.02, 0, 3.0, 2.34, 0, 0.05);
    // the collapsed half: planks & a girder across her shins (her legs point toward local -Z)
    k.box(
      b,
      pipe,
      0.22,
      0.28,
      4.4,
      0.05,
      0.42,
      -0.72,
      Math.PI / 2 - 0.12,
      0,
      0.08,
    ); // steel I-beam across the legs
    k.box(
      b,
      pipe,
      0.02,
      0.3,
      4.4,
      0.05,
      0.42,
      -0.72,
      Math.PI / 2 - 0.12,
      0,
      0.08,
    );
    k.box(b, plank, 2.8, 0.05, 0.28, -0.6, 0.62, -1.05, 0.5, 0.2, 0.35);
    k.box(b, plank, 2.6, 0.05, 0.28, 0.9, 0.3, -1.6, -0.4, 0.1, -0.2);
    for (let i = 0; i < 4; i++)
      k.cyl(
        b,
        pipe,
        0.035,
        2.8 + i * 0.4,
        -1.2 + i * 0.8,
        0.25 + (i % 2) * 0.35,
        -1.3 - i * 0.25,
        6,
        1.35 - i * 0.3,
        0.2 * i,
      );
    for (let i = 0; i < 6; i++)
      k.box(
        b,
        slab,
        0.5 + (i % 3) * 0.2,
        0.18 + (i % 2) * 0.1,
        0.4,
        -1.8 + i * 0.7,
        0.1,
        -2.1 + (i % 2) * 0.5,
        i,
      );
    k.flush(b, g, false);
    k.collider(p.x, p.z, 4.4, 1.2, p.y, p.y + 0.6, yaw, "metal");
    const c1 = k.local(g, 0, 1.6);
    k.collider(c1.x, c1.z, 3.8, 1.6, p.y + 2.4, p.y + 2.5, yaw, "wood");
    // the transponder: a hardened box on her exo-rig's backpack frame, with a whip antenna and a red strobe
    const tp = k.local(g, 0.55, 0.35);
    const tg = k.group(tp.x, p.y, tp.z, yaw, 160);
    const tb = k.builder();
    k.box(tb, k.mat("metal_panel", 0x4a4a44), 0.2, 0.26, 0.14, 0, 0.13, 0);
    k.cyl(tb, k.mat("metal_panel", 0x4a4a44), 0.006, 1.6, 0.06, 1.06, 0, 5);
    k.flush(tb, tg, false);
    const strobeMat = new THREE.MeshStandardMaterial({
      color: 0x401010,
      emissive: 0xff2a1a,
      emissiveIntensity: 0.2,
      roughness: 0.4,
    });
    const strobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 10, 6),
      strobeMat,
    );
    strobe.position.set(0.06, 1.88, 0);
    tg.add(strobe);
    beacon = {
      pos: QX.V3(tp.x, p.y + 1.2, tp.z),
      mat: strobeMat,
      t: 0,
      beep: 0,
    };
    // the tow-truck wreck with the jack in its toolbox
    const j = QX.freeSpot(SP.jack.x, SP.jack.z, undefined, {
      maxR: 8,
      radius: 2.5,
    });
    SP.jack.x = j.x;
    SP.jack.z = j.z;
    SP.jack.y = j.y;
    QX.prop("car", {
      x: j.x,
      z: j.z,
      yaw: 0.2,
      kind: "pickup",
      wreck: true,
      persistent: true,
    });
    if (QX.live("containers") && G.containers.create) {
      QX.world.kdToolbox = QX.safe("kdToolbox", () =>
        G.containers.create({
          id: "qx_kd_towbox",
          kind: "toolbox",
          name: "Tow Truck Toolbox",
          pos: { x: j.x + 2.4, y: j.y, z: j.z + 0.6 },
          yaw: -Math.PI / 2,
          items: [
            ["qx_kd_jack", 1],
            ["scrap_metal", 2],
            ["duct_tape", 1],
            ["wrench", 1],
          ].filter((e) => QX.itemExists(e[0])),
        }),
      );
    }
    if (!QX.world.kdToolbox)
      QX.hook("spawn", () => {
        if (!QX.has("qx_kd_jack") && !QX.flag("kd_freed"))
          QX.pickup("kd_jack", "qx_kd_jack", 1, {
            x: j.x + 2.4,
            y: j.y + 0.05,
            z: j.z + 0.6,
          });
      });
  });

  // Strobe blink + transponder pips (only near, only while the pulse is on).
  QX.hook("update", function (dt, realDt) {
    if (!beacon) return;
    const on = !QX.reached(QID, "done_saved") && !QX.flag("kd_gone");
    beacon.t += realDt;
    const ph = beacon.t % 2.4;
    const lit = on && (ph < 0.12 || (ph > 0.3 && ph < 0.42));
    beacon.mat.emissiveIntensity = lit ? 3.2 : 0.15;
    if (!on || QX.inInterior()) return;
    const d = QX.dist(beacon.pos.x, beacon.pos.z);
    if (d > 45) return;
    if (
      (ph < 0.12 || (ph > 0.3 && ph < 0.42)) &&
      beacon.beep !== Math.floor(beacon.t / 0.3)
    ) {
      beacon.beep = Math.floor(beacon.t / 0.3);
      QX.sfx("mine_beep", { pos: beacon.pos, pitch: 0.62, volume: 0.7 });
    }
  });

  // ==================================================================
  // NPCs: Rask and the Maniacs
  // ==================================================================
  QX.hook("spawn", function () {
    if (QX.flag("kd_gone")) return;
    const p = SP.knight;
    if (p.y === undefined) return;
    const saved = QX.reached(QID, "done_saved");
    QX.spawnNPC({
      id: NPC,
      type: RASK_TYPE,
      name: "Lancer Rask",
      gender: "f",
      faction: RASK_FACTION,
      level: 8,
      essential: true,
      noRespawn: true,
      ai: saved ? "wander" : "sit",
      home: "here",
      homeR: saved ? 4 : 0.2,
      voice: RASK_VOICE,
      dialogue: "qx_dlg_rask",
      weapon: QX.flag("kd_robbed") ? undefined : CARBINE,
      inventory: [[ROCKETS, 12]],
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: Math.PI / 2,
      barks: QX.flag("kd_robbed")
        ? ["Coward.", "The Covenant remembers faces."]
        : [
            "Stay back from the Maniacs' side of the street.",
            "Transponder's still going. Every Maniac in the Kitchen knows I'm here.",
            "Iron and oath... ow.",
          ],
    });
    if (saved) QX.later(1, walkOff);
    if (!QX.done(QID)) {
      for (let i = 0; i < MANIACS; i++) {
        const id = "qx_kd_maniac" + i;
        if (QX.flag("dead_" + id)) continue;
        const a = (i / MANIACS) * Math.PI * 2 + 0.7;
        QX.spawnNPC({
          id,
          type: MANIAC_TYPE,
          name: i === 0 ? "Maniac Roamer" : "Maniac",
          faction: MANIAC_FACTION,
          hostile: true,
          level: 4 + i,
          noRespawn: true,
          ai: "wander",
          home: { x: p.x + Math.cos(a) * 12, z: p.z + Math.sin(a) * 12, r: 7 },
          aggroRange: 18,
          at: {
            fallback: { x: p.x + Math.cos(a) * 12, z: p.z + Math.sin(a) * 12 },
            maxR: 6,
          },
        });
      }
    }
  });

  // Start: the pulse is picked up within ~110 m outdoors (the goggles' emergency band), or by tuning the signal.
  QX.trigger({
    id: "kd_pulse",
    pos: () => SP.knight,
    r: 110,
    cond: () => !QX.started(QID) && !QX.inInterior() && G.player.pos.y < 30,
    fire: () => A.start(false),
  });
  QX.trigger({
    id: "kd_arrive",
    pos: () => SP.knight,
    r: 9,
    cond: () => QX.stage(QID) === "find",
    fire: () => {
      QX.say(NPC, "Civilian! Over here — keep your head down!", 4);
    },
  });
  G.events.on("radioSignalFound", (e) => {
    if (e && (e.id === "sig_covenant_distress" || e.id === "sig_lancer"))
      QX.later(2, () => A.start(false));
  });
  G.events.on("itemAdded", (id) => {
    if (id === "qx_kd_jack" && QX.started(QID) && !QX.flag("kd_freed"))
      QX.notify("A twelve-ton bottle jack. That should shift a girder.", {
        quiet: true,
      });
  });

  // ==================================================================
  // Dialogue
  // ==================================================================
  QX.hook("register", function () {
    const R = "Lancer Rask";
    QX.dialogue("qx_dlg_rask", {
      start: () => {
        if (QX.flag("kd_robbed")) return "coward";
        if (QX.reached(QID, "done_saved")) return "after";
        if (!QX.flag("kd_freed"))
          return QX.flag("kd_met") ? "pinned2" : "pinned";
        return "leg";
      },
      nodes: {
        pinned: {
          speaker: R,
          onEnter: () => A.met(),
          text:
            "[An Iron Covenant Lancer in a scorched Mk I exo-rig sits propped against the scaffold, legs buried under a steel beam, gyrojet carbine across her lap. Her slit visor is pushed up.] " +
            "Civilian? Stay low. There are Maniacs working this block — three that I know of. Lancer Imogen Rask, Iron Covenant, Survey Detail Kestrel. " +
            "A Brute mortar round out of the east brought the scaffold down on me. Leg's broken, rig servos are fried, and I can't reach the transponder to switch it off. So every Maniac in Hell's Kitchen knows where lunch is.",
          responses: [
            {
              text: "I heard your distress pulse. Let's get you out of there.",
              next: "options",
            },
            { text: "Where's the rest of your detail?", next: "squad" },
            {
              id: "rask_rob",
              text: "(Cruel) That's a fine carbine. You won't be needing it.",
              next: "rob",
            },
          ],
        },
        pinned2: {
          speaker: R,
          text: "Still here. Still pinned. Still not panicking, for the record.",
          responses: [
            { text: "Let's try this again.", next: "options" },
            {
              id: "rask_rob2",
              text: "(Cruel) Hand over the carbine.",
              next: "rob",
            },
            { text: "I'll be back.", end: true },
          ],
        },
        squad: {
          speaker: R,
          text:
            "Lancer Vey and Lancer Brannock went for help at first light. Four days ago. Either Rockefeller said no, or they didn't make it to Rockefeller. " +
            "I'd rather not guess which while I'm sitting here.",
          responses: [
            { text: "Then let's not wait for them.", next: "options" },
          ],
        },
        options: {
          speaker: R,
          text: "That beam weighs as much as a pack ox. I tried. The rig tried. Got any ideas that don't involve a Rotorcraft?",
          responses: [
            {
              id: "rask_str",
              text: "Brace yourself. I'll lift it.",
              check: { attr: "brawn", value: 7 },
              next: "lift",
              failNext: "lift_fail",
            },
            {
              id: "rask_rep",
              text: "Your leg actuators are fine — it's the servo relay. I can bypass it, and your rig lifts the beam for you.",
              check: { skill: "mechanics", value: 45 },
              next: "servo",
              failNext: "servo_fail",
            },
            {
              id: "rask_exp",
              text: "A small shaped charge under the far end will kick it off you.",
              check: { skill: "explosives", value: 50 },
              next: "boom",
              failNext: "boom_fail",
            },
            {
              id: "rask_jack",
              text: "[Use the hydraulic bottle jack.]",
              cond: () => QX.has("qx_kd_jack"),
              next: "jack",
            },
            {
              text: "I can't shift it on my own. What else is there?",
              next: "jackhint",
              cond: () => !QX.has("qx_kd_jack"),
            },
            { text: "Hold on. I'll be back.", end: true },
          ],
        },
        lift: {
          speaker: R,
          onEnter: () => A.free("str"),
          text:
            "[You get your shoulder under the beam. Something in your back files a complaint. The beam lifts an inch — two — and she drags herself clear.] " +
            "...That was either very brave or very stupid. The Ledger has a word for both. I'll look it up later.",
          responses: [{ text: "You're out. Now, that leg.", next: "leg" }],
        },
        lift_fail: {
          speaker: R,
          text: "[The beam doesn't move. You do — backwards, onto the pavement.] Appreciate the effort. Let's not both end up under it.",
          responses: [
            { text: "Let me think of something else.", next: "options" },
          ],
        },
        servo: {
          speaker: R,
          onEnter: () => A.free("servo"),
          text:
            "[You pry the panel off her thigh plate and short the relay with a scaffold clip. The rig whines, then heaves the beam aside like a blanket.] " +
            'Hah! The Archivists said that relay was "not field-serviceable". I\'m putting you in my report.',
          responses: [{ text: "Now, about that leg.", next: "leg" }],
        },
        servo_fail: {
          speaker: R,
          text: "[Sparks. The rig twitches and slaps you with its own gauntlet.] ...Maybe leave the exo-rigs to the Archivists.",
          responses: [{ text: "Something else, then.", next: "options" }],
        },
        boom: {
          speaker: R,
          onEnter: () => A.free("boom"),
          text:
            "[A flat crack. The beam jumps off her legs and clangs into the gutter. Her ears are ringing; so are yours.] " +
            "WHAT? ...I SAID, THAT WAS A VERY PRECISE CHARGE. THANK YOU.",
          responses: [{ text: "YOU'RE WELCOME. NOW, YOUR LEG.", next: "leg" }],
        },
        boom_fail: {
          speaker: R,
          text: "Where exactly were you going to put that? No. Absolutely not. Not next to my knees.",
          responses: [{ text: "Fair. Something else.", next: "options" }],
        },
        jack: {
          speaker: R,
          onEnter: () => A.free("jack"),
          text:
            "[You seat the bottle jack under the beam and pump. Slowly, with a groan of old steel, it rises off her shins, and she hauls herself free.] " +
            "Twelve tons of good old American hydraulics. Where did you find that?",
          responses: [
            { text: "Tow truck down the street. Now, your leg.", next: "leg" },
          ],
        },
        jackhint: {
          speaker: R,
          onEnter: () => {
            QX.setFlag("kd_jack_hint");
            if (QX.active(QID)) QX.refresh(QID);
          },
          text: "There's a wrecked tow truck on Fortieth, just east of here — saw it on the way in. Tow trucks carry jacks. A bottle jack would lift this beam. Watch the Maniacs on the way.",
          responses: [{ text: "I'll find it.", end: true }],
        },
        leg: {
          speaker: R,
          text: "Out. Thank you. Leg's broken below the knee — clean break, I think, which is the only kind of good news this city does. I can't walk to Rockefeller on it. Not like this.",
          responses: [
            {
              id: "rask_stim",
              text: "[Give her a Rally Tonic.]",
              cond: () => QX.has(TONIC),
              next: "stim",
            },
            {
              id: "rask_med",
              text: "Bite down on this. I'm going to set it and splint it with a scaffold pole.",
              check: { skill: "medicine", value: 40 },
              next: "med",
              failNext: "med_fail",
            },
            {
              text: "I've got nothing to fix it with. Lean on me, I'll get you to the avenue.",
              next: "limp",
            },
          ],
        },
        stim: {
          speaker: R,
          onEnter: () => A.heal("stim"),
          text: "[The needle goes in through the gap at her knee. She hisses, then flexes her foot and laughs.] Street medicine. The Archivists hate it. I love it.",
          responses: [{ text: "Can you make it back?", next: "thanks" }],
        },
        med: {
          speaker: R,
          onEnter: () => A.heal("med"),
          text: "[One pull. She doesn't make a sound — through the bite guard, anyway. You lash the scaffold pole to her greave.] ...Good work. Clean, fast. You've done that before.",
          responses: [{ text: "Can you make it back?", next: "thanks" }],
        },
        med_fail: {
          speaker: R,
          text: "[You pull. It is the wrong direction. She makes a noise you will remember.] STOP. Stop. Let's... not do that again.",
          responses: [
            {
              text: "[Give her a Rally Tonic.]",
              cond: () => QX.has(TONIC),
              next: "stim",
            },
            { text: "Lean on me, then.", next: "limp" },
          ],
        },
        limp: {
          speaker: R,
          onEnter: () => A.heal("limp"),
          text:
            "[She hooks an arm over your shoulder and heaves up, all four hundred pounds of exo-rig, and takes a step. Then another.] " +
            "Hah. Hurts. Walks. I'll use a scaffold pole for a crutch from here. Rockefeller's only thirty blocks.",
          responses: [{ text: "Will you make it?", next: "thanks" }],
        },
        thanks: {
          speaker: R,
          text:
            "I'll make it. The Covenant doesn't pay debts in Scrip, but it pays them. Take my sidearm and the rockets — I've got the carbine. " +
            "And this. [She presses her service tag into your hand.] Show it at Rockefeller. Somebody will owe you a drink. Probably Oduya. He owes everyone.",
          responses: [
            { text: "Iron and oath, Lancer.", next: "bye" },
            { text: "Stay out from under scaffolding.", next: "bye" },
          ],
        },
        bye: {
          speaker: R,
          text: "Iron and oath. [She switches off the transponder with a click. The strobe dies.] Finally. That thing was driving me insane.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        rob: {
          speaker: R,
          text:
            "[She looks at you for a long moment. Then she unclips the carbine and holds it out, stock first.] Take it. I hope it's worth it. " +
            "When the Covenant finds my transponder, they'll find out who was here.",
          responses: [
            {
              text: "[Take the carbine and leave.]",
              action: () => A.rob(),
              end: true,
            },
            {
              text: "Forget it. I was joking. Let's get you out.",
              next: "options",
            },
          ],
        },
        coward: {
          speaker: R,
          text: [
            "Get out of my sight.",
            "You've got my carbine. What else do you want — my boots?",
            "Keep walking.",
          ],
          responses: [{ text: "[Leave.]", end: true }],
        },
        after: {
          speaker: R,
          text: "Rockefeller's that way. I've got it from here. Go on — somebody else in this city is under a beam.",
          responses: [{ text: "Take care, Lancer.", end: true }],
        },
      },
    });
  });
})();
