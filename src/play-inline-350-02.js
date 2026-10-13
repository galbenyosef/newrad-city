// play-inline-350 02 — the
// Lines 24-346 of readable/play-inline-350.pretty.js (statement-aligned).
  const PC = G._pc;
  const K = PC.kit;
  const PI = Math.PI;

  /** Unique weapon cloned from a weapons-module base (keeps its viewmodel/world model). */
  function cloneWeapon(id, baseId, patch, def) {
    if (G.isStub("items") || !G.items.define || !G.items.get || G.items.get(id))
      return;
    const base = G.items.get(baseId);
    if (!base || !base.weapon) return;
    K.safe("unique " + id, () => {
      const w = JSON.parse(
        JSON.stringify(base.weapon, (k, v) =>
          typeof v === "function" ? undefined : v,
        ),
      );
      Object.assign(w, patch);
      G.items.define(
        Object.assign(
          {
            type: "weapon",
            weight: base.weight || 3,
            value: (base.value || 100) * 3,
            unique: true,
            weapon: w,
          },
          def,
          { id },
        ),
      );
    });
  }
  const marker = (poi, name, label) => () => {
    const a = PC.anchor(poi, name);
    return a ? { x: a.x, y: a.y, z: a.z, label } : null;
  };
  const v = (a) => ({ x: a.x, y: a.y, z: a.z });

  // ==================================================================
  // POLICE HEADQUARTERS — "Curfew Violation"
  // ==================================================================
  const pd = (PC.pd = {
    /** Rescind Directive 67-C: every Patrolman in and around HQ stands down. */
    liftCurfew() {
      if (PC.flag("pd_curfew_lifted")) return;
      PC.setFlag("pd_curfew_lifted", true);
      K.xp(150, "Rescinded Directive 67-C");
      K.standing(10, "Lifted the eternal curfew");
      K.notify("Directive 67-C rescinded. The Patrolmen stand down.");
      K.sfx("terminal_unlock");
      pd.pacify();
      if (K.q.active("pc_curfew"))
        K.q.set("pc_curfew", PC.flag("pd_pike_free") ? "return" : "free");
    },
    pacify() {
      if (G.isStub("actors")) return;
      K.safe("pacify", () => {
        for (const id of [
          "pc_pd_sergeant",
          "pc_pd_patrol1",
          "pc_pd_warden",
          "pc_pd_enforcer",
        ]) {
          const a = G.actors.get && G.actors.get(id);
          if (a && !a.dead && a.setHostile) a.setHostile(false);
        }
        const pts = [];
        const ctx = PC.ctx("police_hq");
        if (ctx) pts.push(new THREE.Vector3(ctx.O.x, ctx.O.y, ctx.O.z - 15));
        pts.push(new THREE.Vector3(160, 0, 560));
        for (const p of pts)
          for (const a of (G.actors.inRadius ? G.actors.inRadius(p, 70) : []) ||
            [])
            if (a && !a.dead && a.faction === "robots" && a.setHostile)
              a.setHostile(false);
      });
    },
    pikeReleased() {
      if (PC.flag("pd_pike_released_evt")) return;
      PC.setFlag("pd_pike_released_evt", true);
      PC.setFlag("pd_pike_free", true);
      const a =
        !G.isStub("actors") && G.actors.get && G.actors.get("pc_pd_pike");
      if (a && !a.dead)
        K.safe("pike out", () => {
          a.say &&
            a.say(
              "Free! FREE! Oh, sweet sunlight — well, sweet fluorescent tubes.",
            );
          const c = PC.anchor("police_hq", "cells");
          if (c && a.moveTo) a.moveTo(c.x, c.z);
          if (a.home) {
            a.home.x = c.x;
            a.home.z = c.z;
            a.home.r = 3;
          }
        });
      K.xp(50, "Freed Lenny Mott");
      if (K.q.active("pc_curfew") && K.q.stage("pc_curfew") === "free")
        K.q.set("pc_curfew", PC.flag("pd_curfew_lifted") ? "return" : "curfew");
    },
  });
  function startCurfew() {
    K.q.start("pc_curfew");
    if (PC.flag("pd_pike_free"))
      K.q.set("pc_curfew", PC.flag("pd_curfew_lifted") ? "return" : "curfew");
  }
  function finishCurfew() {
    if (PC.flag("pd_pike_done")) return;
    PC.setFlag("pd_pike_done", true);
    K.scrip(120);
    K.give("scrap_metal", 8);
    K.give("pc_pd_shield", 1);
    if (!K.q.active("pc_curfew")) K.q.start("pc_curfew");
    K.q.complete("pc_curfew");
  }

  function dataPolice() {
    K.defineItem({
      id: "pc_pd_cellkey",
      type: "key",
      name: "Cell Block Key",
      weight: 0,
      value: 0,
      desc: 'A heavy brass key on a ring stamped "HQ — HOLDING". Opens the cell doors in the east wing.',
    });
    K.defineItem({
      id: "pc_pd_armory_key",
      type: "key",
      name: "HQ Armory Key",
      weight: 0,
      value: 0,
      desc: 'A key with a red tag: "ARMORY — COMMISSIONER ONLY". Opens the armory cage in the basement of Police Headquarters.',
    });
    K.defineItem({
      id: "pc_pd_shield",
      type: "misc",
      name: "Shield #4471",
      weight: 0.1,
      value: 75,
      desc: "Patrolman Orlov's badge, which Lenny Mott pried off a Patrolman's evidence tray. \"FIDELIS AD MORTEM.\" Faithful unto death — and then some.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pc_curfew",
        name: "Curfew Violation",
        giver: "Lenny Mott",
        location: "Police Headquarters",
        desc: 'The Patrolman police of 240 Centre Street are still enforcing a curfew declared on the morning the bombs fell. Lenny Mott, a scavenger who wandered in out of the rain, has been in a holding cell for three days for being "out after curfew."',
        stages: [
          {
            id: "free",
            text: "Free Lenny Mott from Cell S-3 in the Police Headquarters holding cells.",
            markers: [marker("police_hq", "pike", "Cell S-3")],
          },
          {
            id: "curfew",
            text: "Rescind Directive 67-C from the Commissioner's command terminal on the rotunda gallery.",
            markers: [marker("police_hq", "office", "Commissioner's Office")],
          },
          {
            id: "return",
            text: "Tell Lenny Mott the curfew has been lifted.",
            markers: [{ npc: "pc_pd_pike", label: "Lenny Mott" }],
          },
        ],
        rewards: { xp: 250 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("pc_dlg_pike", {
      start: () =>
        PC.flag("pd_pike_done")
          ? "after"
          : PC.flag("pd_pike_free")
            ? PC.flag("pd_curfew_lifted")
              ? "lifted"
              : "freed"
            : PC.flag("pd_met_pike")
              ? "again"
              : "hello",
      nodes: {
        hello: {
          speaker: "Lenny Mott",
          onEnter: () => PC.setFlag("pd_met_pike", true),
          text: 'Hey! HEY! You\'re not a robot! Oh thank God. Lenny Mott — scavenger, occasional poet, currently "detained for curfew violation." I came in here out of the rain three days ago looking for a bottle of tonic and a Patrolman put me in cuffs. It said I have the right to remain stationary.',
          responses: [
            {
              text: "Hold on, I'll get you out.",
              next: "how",
              action: () => startCurfew(),
            },
            {
              text: "[Persuasion 35] Curfew violation? What did you really do?",
              check: { skill: "persuasion", value: 35 },
              next: "truth",
              failNext: "truth_fail",
            },
            { text: "Enjoy the crackers.", end: true },
          ],
        },
        truth: {
          speaker: "Lenny Mott",
          text: '...Fine. I also took a revolver out of the evidence room. And the robots found it on me. And I may have called the Desk Sergeant a "toaster with a badge." But the curfew thing is what they booked me for! That\'s entrapment! Or something.',
          responses: [
            {
              text: "All right, I'll get you out anyway.",
              next: "how",
              action: () => startCurfew(),
            },
            { text: "Stay put, toaster-insulter.", end: true },
          ],
        },
        truth_fail: {
          speaker: "Lenny Mott",
          text: "Nothing! I'm as innocent as a baby burrow rat. Look at this face.",
          responses: [
            {
              text: "All right, I'll get you out.",
              next: "how",
              action: () => startCurfew(),
            },
            { text: "Maybe later.", end: true },
          ],
        },
        how: {
          speaker: "Lenny Mott",
          text: 'Two ways out, as far as I can figure. The desk sergeant — the human one, back before — kept the cell keys in his desk in the bullpen, west wing. Or there\'s a terminal at the guard station right there that controls the doors — the sergeants used to post its passcode on the muster desk terminal, out in the rotunda, every month like clockwork. I have been trying to guess it for three days. It is not "PASSWORD".',
          responses: [{ text: "I'll be back.", end: true }],
        },
        again: {
          speaker: "Lenny Mott",
          text: "Still here. Still innocent. Still crackers. Keys: sergeant's desk, bullpen, west wing. Or the guard-station terminal — passcode's posted on the muster desk terminal in the rotunda. Pick one!",
          responses: [
            { text: "Working on it.", end: true, action: () => startCurfew() },
          ],
        },
        freed: {
          speaker: "Lenny Mott",
          text: "Free! Almost. See, soon as I step out that door the tin cans run me right back in — curfew's still on, and they don't take \"it's been twenty-two years\" for an answer. Somebody has to lift it. The Commissioner's command terminal is upstairs, off the gallery. The robots keep saying the password is \"in evidence.\" Down in the basement, I bet.",
          responses: [
            {
              text: "I'll lift the curfew.",
              end: true,
              action: () => {
                startCurfew();
                if (K.q.active("pc_curfew")) K.q.set("pc_curfew", "curfew");
              },
            },
            { text: "You're on your own now.", end: true },
          ],
        },
        lifted: {
          speaker: "Lenny Mott",
          text: 'Did you hear that? "THE CURFEW HAS BEEN LIFTED. HAVE A NICE DAY, CITIZEN." The Desk Sergeant just waved at me. WAVED. I\'m gonna walk out the front door like a free man, in broad daylight, after nine, just because I can.',
          responses: [
            {
              text: "You're welcome.",
              next: "reward",
              action: () => finishCurfew(),
            },
          ],
        },
        reward: {
          speaker: "Lenny Mott",
          text: "Here — everything I had in my boot, plus the scrap I was saving to jimmy that lock, plus a badge I pried off a robot's evidence tray. Some patrolman named Orlov. Seems like it ought to go to somebody who actually did some police work around here.",
          responses: [{ text: "Take care, Lenny.", end: true }],
        },
        after: {
          speaker: "Lenny Mott",
          text: "Out after curfew and nobody cares. Best day of my life. Well — top five.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
  }
  function spawnPoliceExt(ctx) {
    const lifted = !!PC.flag("pd_curfew_lifted");
    const a = ctx.anchors.enforcer;
    if (a)
      PC.spawnActor(ctx, {
        id: "pc_pd_enforcer",
        type: "patrolman",
        name: "Curfew Enforcer",
        faction: "robots",
        level: 5,
        hostile: !lifted,
        pos: v(a),
        yaw: PI,
        ai: "guard",
        home: "here",
        homeR: 2.5,
        loot: "patrolman",
        barks: [
          "ATTENTION CITIZEN. THE CURFEW IS IN EFFECT.",
          "RETURN TO YOUR HOME OR ASSIGNED SHELTER.",
          "THIS IS FOR YOUR SAFETY.",
          "LOITERING IS A CLASS C MISDEMEANOR.",
        ],
      });
  }
  PC.part("police_hq", {
    data: dataPolice,
    spawn: spawnPoliceExt,
    loaded: () => {
      if (PC.flag("pd_curfew_lifted")) setTimeout(() => pd.pacify(), 500);
    },
  });
  // ==================================================================
  // MUNICIPAL BUILDING — "Paper Trail" (absorbed into the main story as mq11)
  //   free (Wren in the cage) → register (Wren's Register, by Big Ledger's cook-fire) → return (to Wren) → COMPLETE.
  //   Optional: deal with Big Ledger; the Deed Ledger from the Surrogate's Strongroom (to Wren / keep / sell →
  //   G.quests flag ms_deed_ledger = 'wren' | 'kept' | 'sold'). G.quests.start('pc_records') works at any time: the
  //   stage is synced to the world state on start/load (contract in src/quests/NOTES.md). Wren stays at his desk
  //   in the Hall afterwards (anchors 'records_desk' / 'register' / 'wren') for the main story's Register beat.
  // ==================================================================
  /** Wren's Register (pickup by Big Ledger's fire; 21_municipal_interior uses the same def). */
  PC.REGISTER_DEF = {
    type: "note",
    name: "The Register (T. Wren, 1967–1989)",
    title: "The Register — Births & Deaths, New York, kept by T. Wren, Clerk",
    text: 'A fat municipal ledger, swollen with damp, the spine mended with electrical tape. On the first page, in a careful clerk\'s hand:\n\n"REGISTER OF BIRTHS AND DEATHS, CITY OF NEW YORK, from the 5th of March 1967, the official books being closed. Kept by Tobias Wren, Clerk, because somebody must."\n\nTwenty-two years of entries follow: the Neon, the Grand Central camps, the Battery, the river towns, written in pencil, then in soot, then in pencil again. Births in black, deaths in red. Far more red.\n\nThe back third is scorched and loose. Whole gatherings have been torn out for kindling. What is left of the Grand Central pages ("THE SIXTY-ONE CAMP, under the Terminal, 1967–") is curled brown at the edges and stuck together. You would need Wren to separate them without tearing.',
  };
