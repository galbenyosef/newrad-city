// play-inline-582 01 — knight
// Lines 19-301 of readable/play-inline-582.pretty.js (statement-aligned).
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
