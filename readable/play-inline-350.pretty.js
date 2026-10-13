/* src/poi_civic/80_content.js */
/* =====================================================================
 * NEW RAD CITY — poi_civic / 80_content.js
 * Gameplay data for the Civic Center POIs: items, quests, dialogue,
 * quest logic helpers (PC.pd / PC.mb / PC.sp) and the exterior NPCs.
 *
 * Quests (one per POI, all small):
 *   pc_curfew   "Curfew Violation"   (Police HQ)   — free Lenny Mott from
 *               the holding cells and rescind Directive 67-C from the
 *               Commissioner's command terminal; the Patrolmen stand down.
 *   pc_records  "Paper Trail"        (Municipal)   — Clerk Tobias Wren, a
 *               captive of the brutes in the Hall of Records, needs his
 *               Register back from their cook-fire (and freedom); optional
 *               Deed Ledger. Absorbed into the main story as mq11.
 *   pc_relic    "The Bell of St. Patrick" (Old St. Patrick's) — Sister
 *               Agnes, the old nun in the churchyard, wants the silver bell
 *               reliquary back from the Bishops' Crypt in the catacombs.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
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
  const mb = (PC.mb = {
    /** The stage the quest should be at, from the world state. */
    wantStage() {
      if (!PC.flag("mb_wren_free")) return "free";
      return K.has("pc_mb_register") || PC.flag("mb_register_back")
        ? "return"
        : "register";
    },
    sync() {
      if (!K.q.active("pc_records")) return;
      if (PC.flag("mb_register_back")) {
        mb.finish();
        return;
      }
      const want = mb.wantStage();
      if (K.q.stage("pc_records") !== want) K.q.set("pc_records", want);
    },
    wrenFreed() {
      if (PC.flag("mb_wren_freed_evt")) return;
      PC.setFlag("mb_wren_freed_evt", true);
      PC.setFlag("mb_wren_free", true);
      const a =
        !G.isStub("actors") && G.actors.get && G.actors.get("pc_mb_wren");
      if (a && !a.dead)
        K.safe("wren out", () => {
          a.say &&
            a.say(
              "Out! OUT! Oh, I could kiss you. I won't. There's a form for that.",
            );
          const d = PC.anchor("municipal_building", "records_desk_stand");
          if (!d) return;
          a.ai = "static";
          a.aiMode = "guard";
          a.home = { x: d.x, z: d.z, r: 1.2 };
          a.homeYaw = Math.PI;
          a.moveGoal = null;
          if (a.setState && a.state !== "combat") a.setState("idle");
          if (a.anim) a.anim("idle");
        }); // 'guard' walks him to his post (the desk) now; a reload spawns him there
      K.xp(50, "Freed Tobias Wren");
      mb.sync();
    },
    /** Wren takes his Register back: the quest's story is done. */
    registerBack() {
      if (PC.flag("mb_register_back")) return;
      PC.setFlag("mb_register_back", true);
      K.take("pc_mb_register", 1);
      K.xp(100, "Returned the Register");
      K.standing(10, "Saved the Last Clerk's Register");
      K.setQFlag("ms_register_returned", true);
      mb.finish();
    },
    /** The Deed Ledger's fate (any time Wren is free and the hero carries it). */
    deed(mode) {
      if (PC.flag("mb_deed_done")) return;
      PC.setFlag("mb_deed_done", mode);
      K.setQFlag("ms_deed_ledger", mode);
      if (mode === "wren") {
        K.take("pc_mb_ledger", 1);
        K.scrip(150);
        K.standing(15, "Gave the Deed Ledger to the Last Clerk");
        K.give("pc_mb_stamp", 1);
      } else if (mode === "sold")
        K.standing(-10, "Meant to sell the Deed Ledger");
    },
    finish() {
      if (PC.flag("mb_wren_done")) return;
      PC.setFlag("mb_wren_done", true);
      if (!K.q.active("pc_records")) K.q.start("pc_records");
      K.q.complete("pc_records");
    },
  });
  function startRecords() {
    K.q.start("pc_records");
    mb.sync();
  }
  function dataMunicipal() {
    K.defineItem({
      id: "pc_mb_cage_key",
      type: "key",
      name: "Rusty Cage Key",
      weight: 0,
      value: 0,
      desc: 'Big Ledger kept it on a string with his "favourite" teeth. Opens the captive\'s cage in the Hall of Records.',
    });
    K.defineItem({
      id: "pc_mb_vault_key",
      type: "key",
      name: "Surrogate's Strongroom Key",
      weight: 0,
      value: 0,
      desc: 'A long brass key tagged "SURROGATE — STRONGROOM — DO NOT REMOVE FROM BUREAU". Somebody removed it from the bureau.',
    });
    K.defineItem({
      id: "pc_mb_key_city",
      type: "misc",
      name: "Key to the City",
      weight: 0.5,
      value: 500,
      desc: 'A gilded ceremonial key, a foot long, presented to "Distinguished Visitor [NAME TO BE ENGRAVED]". It opens nothing. It is worth a great deal to anyone who still believes in New York.',
    });
    K.defineItem(
      Object.assign(
        { id: "pc_mb_register", weight: 1, value: 0, quest: true },
        PC.REGISTER_DEF,
      ),
    );
    // uniques: the Surrogate's revolver (strongroom safe, code 4417) and Big Ledger's axe (boss drop)
    cloneWeapon(
      "pc_mb_eminent_domain",
      "magnum_44",
      {
        damage: 44,
        critMult: 1.8,
        critChance: 1.3,
        spread: 0.017,
        condDecay: 0.002,
        skin: "gold",
      },
      {
        name: "Eminent Domain",
        value: 1100,
        desc: 'An engraved nickel .44 from the Surrogate\'s safe, "presented to the Surrogate of New York County by a grateful Real Estate Board, 1961." It has taken more property than the city ever did.',
      },
    );
    cloneWeapon(
      "pc_mb_rubber_stamp",
      "fire_axe",
      { damage: 50, critMult: 1.5, condDecay: 0.001 },
      {
        name: "The Rubber Stamp",
        value: 2200,
        desc: 'Big Ledger\'s axe: a fire axe with a brass notary seal welded to the back of the head. Every blow leaves "APPROVED" backwards in whatever it hits.',
      },
    );
    K.defineItem({
      id: "pc_mb_stamp",
      type: "misc",
      name: "City Clerk's Seal",
      weight: 1,
      value: 120,
      desc: 'The embossing seal of the Office of the City Clerk. Tobias Wren gave it to you "so that SOMEONE in this city can make things official." Squeeze a paper and it says CITY OF NEW YORK in raised letters.',
    });
    const deadLedger = () => {
      try {
        const a =
          !G.isStub("actors") &&
          G.actors.get &&
          G.actors.get("pc_mb_bigledger");
        return !!(a && a.dead) || !!PC.flag("mb_bigledger_dead");
      } catch (e) {
        return false;
      }
    };
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pc_records",
        name: "Paper Trail",
        giver: "Tobias Wren",
        location: "Manhattan Municipal Building",
        desc: "Since the official books closed in March 1967, Tobias Wren, self-appointed Last Clerk of the City of New York, has kept a Register of every birth and death he could reach. The brutes who took the Hall of Records are burning it, page by page, to cook with. Wren is in a cage in the Hall, and his Register is beside their fire.",
        stages: [
          {
            id: "free",
            text: "Free Tobias Wren from the cage in the Hall of Records (Big Ledger keeps the key in his hoard by the throne of filing cabinets).",
            markers: [marker("municipal_building", "wren", "Captive's Cage")],
          },
          {
            id: "register",
            text: "Recover Wren's Register from beside Big Ledger's cook-fire in the Hall of Records, before it burns.",
            markers: [
              marker("municipal_building", "register_fire", "Wren's Register"),
            ],
          },
          // legacy stage id (saves from before the Register): migrated to 'register' / 'return' on load
          {
            id: "ledger",
            text: "Recover Wren's Register from beside Big Ledger's cook-fire in the Hall of Records.",
            hidden: true,
            markers: [
              marker("municipal_building", "register_fire", "Wren's Register"),
            ],
          },
          {
            id: "return",
            text: "Bring the Register to Tobias Wren.",
            markers: [{ npc: "pc_mb_wren", label: "Tobias Wren" }],
          },
          {
            id: "bigledger",
            sideObjective: true,
            text: "(Optional) Deal with Big Ledger.",
            doneIf: deadLedger,
          },
          {
            id: "deed",
            sideObjective: true,
            text: "(Optional) Recover the Deed Ledger from the Surrogate's Strongroom (Bureau of Vital Statistics, gallery level, east).",
            doneIf: () => K.has("pc_mb_ledger") || !!PC.flag("mb_deed_done"),
            markers: [
              marker(
                "municipal_building",
                "strongroom",
                "Surrogate's Strongroom",
              ),
            ],
          },
        ],
        rewards: { xp: 300, scrip: 60 },
      });
    }
    // contract: the quest may be started by the main story at any time; sync it to the world
    G.events.on("questStarted", (q) => {
      if (q && q.id === "pc_records") setTimeout(() => mb.sync(), 0);
    });
    G.events.on("loaded", () =>
      setTimeout(() => {
        if (K.q.active("pc_records")) mb.sync();
      }, 0),
    );
    G.events.on("itemAdded", (id) => {
      if (id === "pc_mb_register") {
        if (!K.q.started("pc_records") && PC.flag("mb_wren_free"))
          startRecords();
        mb.sync();
      }
    });
    G.events.on("actorKilled", (a) => {
      if (a && a.id === "pc_mb_bigledger")
        PC.setFlag("mb_bigledger_dead", true);
    });
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const deedOffer = () => K.has("pc_mb_ledger") && !PC.flag("mb_deed_done");
    G.dialogue.register("pc_dlg_wren", {
      start: () =>
        !PC.flag("mb_wren_free")
          ? PC.flag("mb_met_wren")
            ? "again"
            : "hello"
          : PC.flag("mb_register_back")
            ? deedOffer()
              ? "deed"
              : "after"
            : K.has("pc_mb_register")
              ? "register"
              : deedOffer()
                ? "deed"
                : "freed",
      nodes: {
        hello: {
          speaker: "Tobias Wren",
          onEnter: () => PC.setFlag("mb_met_wren", true),
          text: "Psst! Over here! In the — yes, the cage, thank you. Tobias Wren, Last Clerk of the City of New York. Self-appointed. Somebody had to. The big one, \"Big Ledger\" he calls himself, he can't read, is burning my Register to cook with. A page a meal. I tried to stop him. Now I'm on the menu for Tuesday.",
          responses: [
            {
              text: "I'll get you out.",
              next: "how",
              action: () => startRecords(),
            },
            { text: "What register?", next: "why" },
            { text: "Good luck with Tuesday.", end: true },
          ],
        },
        why: {
          speaker: "Tobias Wren",
          text: "When the official books closed in March of '67, I kept going. Every birth, every death I could reach: the Neon, the camps under Grand Central, the Battery, the river towns. Twenty-two years, in pencil, then in soot. When everyone who remembers is dead, the Register is all that says they were here. It's by the fire. He's working through it from the back.",
          responses: [
            {
              text: "All right. I'll get you out.",
              next: "how",
              action: () => startRecords(),
            },
            { text: "Not my problem.", end: true },
          ],
        },
        how: {
          speaker: "Tobias Wren",
          text: "Big Ledger keeps the cage key in his \"hoard,\" by that throne of filing cabinets at the north end. It's a cheap lock, but it's a MUNICIPAL lock: it only respects the proper key. And, quietly: the big one sleeps sitting up. He only looks awake.",
          responses: [{ text: "Sit tight.", end: true }],
        },
        again: {
          speaker: "Tobias Wren",
          text: "Still here. Still delicious, apparently. The key's in the hoard by the throne of filing cabinets. And the Register is by the fire. Please hurry. He had the 1978 deaths for breakfast.",
          responses: [
            { text: "Working on it.", end: true, action: () => startRecords() },
          ],
        },
        freed: {
          speaker: "Tobias Wren",
          text: "Free! My knees! My dignity, no, that's gone. Listen: the Register. Big Ledger keeps it on the paper pile beside his cook-fire, in the middle of the Hall. Bring it to my desk, here by the doors. I don't care what it costs him. Well. I care a little. Be careful.",
          responses: [
            { text: "I'll bring it.", end: true, action: () => startRecords() },
            { text: "Anything else up here worth saving?", next: "deedinfo" },
            { text: "Later.", end: true },
          ],
        },
        deedinfo: {
          speaker: "Tobias Wren",
          text: "The Deed Ledger, in the Surrogate's Strongroom, up the gallery stairs and east. The last volume before the bombs. The Registrar kept the strongroom key in her desk (the drawer combination is on file in the public index terminal on the gallery), the Bureau terminal can open the door too, and Big Ledger took a key off her. I would dearly like to read the last entry before it becomes kindling.",
          responses: [
            {
              text: "I'll keep an eye out.",
              end: true,
              action: () => startRecords(),
            },
          ],
        },
        register: {
          speaker: "Tobias Wren",
          text: "(He takes the Register in both arms, like a child pulled out of a river, and sits down on the floor with it.) ...He started at the back. The Grand Central pages, the Sixty-One Camp, under the Terminal. They're scorched and stuck together. I can lift them apart with a warm knife and a great deal of patience. Give me a little while.",
          responses: [
            {
              text: "Take all the time you need.",
              next: "register2",
              action: () => mb.registerBack(),
            },
          ],
        },
        register2: {
          speaker: "Tobias Wren",
          text: "Thank you. Truly. Here: twenty-two years of a clerk's pay, which is to say not much. If you are ever looking for someone, anyone, born or buried in this city since the bombs, come and ask me. That is what the book is for.",
          responses: [
            {
              text: "I found something else for you.",
              next: "deed",
              cond: deedOffer,
            },
            { text: "I'll be back.", end: true },
          ],
        },
        deed: {
          speaker: "Tobias Wren",
          text: '(He turns the Deed Ledger\'s pages with trembling reverence, then stops at the last entry and goes very quiet.) "Parcel 0001. Manhattan Island, all of it, sub-surface rights included. Transferred to the United States Office of Civil Defense, one dollar. Recorded the 4th of March, 1967. Purpose: classified." ...The day before the bombs. Washington bought the whole island for a dollar the day before it burned. Somebody knew.',
          responses: [
            { text: "It belongs with you. Keep it safe.", next: "deed_wren" },
            {
              text: "I'm keeping it. Someone should see this.",
              next: "deed_keep",
            },
            {
              text: "It's worth scrip to the right buyer. I'm selling it.",
              next: "deed_sell",
            },
          ],
        },
        deed_wren: {
          speaker: "Tobias Wren",
          text: "Legally the island belongs to the Office of Civil Defense, and I hear there are men on the radio who still think they ARE the government. As the Last Clerk I hereby rule that a deed signed by people who knew and said nothing is void for, for rudeness. There. It's official. Take this: the Clerk's seal, and my savings.",
          responses: [
            {
              text: "Glad to help.",
              next: "after",
              action: () => mb.deed("wren"),
            },
          ],
        },
        deed_keep: {
          speaker: "Tobias Wren",
          text: "You... want to keep it? Well. Show it to someone who ought to be ashamed of it. Just don't burn it. Promise me you won't burn it.",
          responses: [
            {
              text: "I promise.",
              next: "after",
              action: () => mb.deed("kept"),
            },
          ],
        },
        deed_sell: {
          speaker: "Tobias Wren",
          text: "(He looks at you over his glasses for a long moment.) It's yours to sell. You took it out of the strongroom. I only hope whoever buys it reads the last page before they use it to light a stove.",
          responses: [
            {
              text: "Business is business.",
              next: "after",
              action: () => mb.deed("sold"),
            },
          ],
        },
        after: {
          speaker: "Tobias Wren",
          text: () =>
            PC.flag("mb_bigledger_dead")
              ? "I've started a new page. First entry: \"Big Ledger, deceased. Good riddance.\" Second entry: you. Come back any time. If you're looking for someone, I keep the book."
              : "I keep my desk by the barricade now, where I can hear him snore. If you're looking for anyone, born or buried in this city since the bombs, I keep the book.",
          responses: [{ text: "Goodbye, Tobias.", end: true }],
        },
      },
    });
  }
  function spawnMunicipalExt(ctx) {
    // The doorman guards the Hall of Records from the inside of the barricade (not the arch): the street outside the
    // Municipal Building is the first thing a sleeper from Sub-basement C-9 sees, and it must not open with a brute.
    const h = ctx.anchors.hall;
    if (!h) return;
    PC.spawnActor(ctx, {
      id: "pc_mb_doorman",
      type: "brute",
      name: "Brute Doorman",
      faction: "brutes",
      level: 7,
      hostile: true,
      pos: { x: h.x + 2.5, y: h.y, z: h.z + 4.5 },
      yaw: Math.PI,
      ai: "guard",
      home: "here",
      homeR: 4,
      loot: "brute",
      weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
      barks: [
        "You got papers? NO? GOOD.",
        "Building closed. Forever.",
        "Take a number, puny human.",
      ],
    });
  }
  PC.part("municipal_building", {
    data: dataMunicipal,
    spawn: spawnMunicipalExt,
  });

  // ==================================================================
  // OLD ST. PATRICK'S — "The Bell of St. Patrick"
  // ==================================================================
  function startRelic() {
    K.q.start("pc_relic");
    if (K.has("pc_sp_reliquary")) K.q.set("pc_relic", "return");
  }
  function finishRelic(mode) {
    if (PC.flag("sp_relic_done")) return;
    PC.setFlag("sp_relic_done", mode);
    if (mode === "given" || mode === "paid") {
      K.take("pc_sp_reliquary", 1);
      K.give("pc_sp_holywater", mode === "paid" ? 2 : 4);
      K.scrip(mode === "paid" ? 200 : 60);
      K.standing(mode === "paid" ? 5 : 30, "Returned the Bell Reliquary");
      K.sfx("bell", null, { volume: 0.8 });
    } else K.standing(-15, "Kept the Bell Reliquary");
    if (!K.q.active("pc_relic")) K.q.start("pc_relic");
    K.q.complete("pc_relic");
  }
  function dataStPat() {
    K.defineItem({
      id: "pc_sp_sexton_key",
      type: "key",
      name: "Sexton's Key",
      weight: 0,
      value: 0,
      desc: "A black iron key on a length of knotted string, greasy with handling. Opens the grille of the Bishops' Crypt beneath Old St. Patrick's.",
    });
    K.defineItem({
      id: "pc_sp_holywater",
      type: "aid",
      name: "Holy Water",
      weight: 0.5,
      value: 25,
      tags: ["drink"],
      mesh: "bottle_milk",
      sound: "drink",
      effects: { hp: 30, rads: -25 },
      desc: "Water from the old cathedral's cistern, boiled, filtered through charcoal and blessed by Sister Agnes. Tastes like pennies. Heals 30 HP and flushes 25 rads.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pc_relic",
        name: "The Bell of St. Patrick",
        giver: "Sister Agnes",
        location: "Old St. Patrick's Cathedral",
        desc: "Sister Agnes, who has kept the churchyard of Old St. Patrick's since before the bombs, wants the cathedral's oldest treasure brought up from the Bishops' Crypt: a silver reliquary holding a fragment of the Bell of St. Patrick. The catacombs are full of Maniacs — her former parishioners — and the crypt was locked by the Sexton.",
        stages: [
          {
            id: "find",
            text: "Find the Bell Reliquary in the Bishops' Crypt, in the catacombs beneath Old St. Patrick's (the Sexton had the key).",
            markers: [marker("old_st_patricks", "crypt", "Bishops' Crypt")],
          },
          {
            id: "return",
            text: "Bring the Bell Reliquary to Sister Agnes in the churchyard.",
            markers: [{ npc: "pc_sp_agnes", label: "Sister Agnes" }],
          },
        ],
        rewards: { xp: 300 },
      });
    }
    G.events.on("itemAdded", (id) => {
      if (id === "pc_sp_reliquary" && K.q.active("pc_relic"))
        K.q.set("pc_relic", "return");
    });
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("pc_dlg_agnes", {
      start: () =>
        PC.flag("sp_relic_done")
          ? "after"
          : K.has("pc_sp_reliquary")
            ? "relic"
            : PC.flag("sp_met_agnes")
              ? "again"
              : "hello",
      nodes: {
        hello: {
          speaker: "Sister Agnes",
          onEnter: () => PC.setFlag("sp_met_agnes", true),
          text: "Peace be with you, child. Mind the graves — the Kiernans are touchy. I am Sister Agnes, of the Sisters of Charity, formerly of this parish and currently of this churchyard. Yes, I am seventy-one, and yes, I sleep out here. Most of my congregation sleeps below, and they are rather less conversational than I am. And no, I am not one of those sun people uptown. They took a cathedral on Fifth Avenue and lit it for their bomb. I kept a churchyard and lit it for the dead.",
          responses: [
            { text: "Your congregation?", next: "flock" },
            { text: "Do you have anything to trade?", barter: true, end: true },
            { text: "I should go.", end: true },
          ],
        },
        flock: {
          speaker: "Sister Agnes",
          text: "The people who sheltered in the catacombs when the bombs fell. The sick came down, and the sickness stayed. They walk the nave now, and the tunnels. I still say the Office for them at dusk. They don't mind. Much.",
          responses: [
            { text: "Is there anything I can do?", next: "ask" },
            { text: "That's grim.", end: true },
          ],
        },
        ask: {
          speaker: "Sister Agnes",
          text: "There is. Below the sanctuary, in the Bishops' Crypt, Father Delaney locked away our oldest treasure — a silver reliquary with a piece of the Bell of St. Patrick himself, carried here from Armagh in 1831. Our bell-cote has stood empty since before I took my vows. I would like to hear it ring again before I go. The Sexton had the only key to the crypt. I fear the Sexton is... still down there.",
          responses: [
            {
              text: "I'll bring back your relic.",
              next: "yes",
              action: () => startRelic(),
            },
            {
              text: "[Persuasion 40] What's in it for me?",
              check: { skill: "persuasion", value: 40 },
              next: "pay",
              failNext: "pay_fail",
            },
            { text: "Not today, Sister.", end: true },
          ],
        },
        pay: {
          speaker: "Sister Agnes",
          onEnter: () => PC.setFlag("sp_agnes_paid", true),
          text: "(A dry laugh.) Honest, at least. The poor box is not empty, and I brew holy water that will take the radiation out of a Ripjaw. You'll be paid.",
          responses: [
            {
              text: "Then I'll do it.",
              next: "yes",
              action: () => startRelic(),
            },
          ],
        },
        pay_fail: {
          speaker: "Sister Agnes",
          text: "The satisfaction of a good deed, and my prayers. They're worth more than you think. I also have holy water.",
          responses: [
            {
              text: "Fine. I'll do it.",
              next: "yes",
              action: () => startRelic(),
            },
            { text: "I'll think about it.", end: true },
          ],
        },
        yes: {
          speaker: "Sister Agnes",
          text: "God bless you. The way down is through the sacristy, behind the high altar, on the right. The catacombs run under the whole block — the crypt is off the long gallery. Be gentle with my flock if you can. Be quick if you can't.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        again: {
          speaker: "Sister Agnes",
          text: "Back so soon? The sacristy stair, child — behind the altar, on the right. And do take some holy water before you go down.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            {
              text: "About the reliquary...",
              next: "ask",
              cond: () => !K.q.started("pc_relic"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        relic: {
          speaker: "Sister Agnes",
          text: "(She takes the silver casket in both hands, very carefully, the way you would hold a sleeping bird. She tilts it. Inside, something rings — tiny, clear.) ...Oh. Oh, listen to that.",
          responses: [
            {
              text: "It belongs here. Take it.",
              next: "thanks",
              action: () =>
                finishRelic(PC.flag("sp_agnes_paid") ? "paid" : "given"),
            },
            { text: "Actually, I'm keeping it. Silver sells.", next: "keep" },
          ],
        },
        thanks: {
          speaker: "Sister Agnes",
          text: "Tonight I'll hang it in the bell-cote and ring it for the Sexton, and Father Delaney, and all of them down there. Take this — holy water, and what the poor box can spare. And come to Vespers sometime. The singing is terrible, but it's sincere.",
          responses: [{ text: "Goodbye, Sister.", end: true }],
        },
        keep: {
          speaker: "Sister Agnes",
          text: "(Her hands fall.) ...Then I will pray for you, too. Go on. The Lord is patient. I am less so, but I am old, and slow.",
          responses: [
            { text: "Goodbye.", end: true, action: () => finishRelic("kept") },
          ],
        },
        after: {
          speaker: "Sister Agnes",
          text: () =>
            PC.flag("sp_relic_done") === "kept"
              ? "Peace be with you, child. Even you."
              : "Did you hear it last night? Half the Maniacs in the nave stopped howling, just for a moment. Just to listen.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
  }
  function spawnStPatExt(ctx) {
    const a = ctx.anchors.agnes;
    if (!a) return;
    const stock = K.stock(
      [
        ["rally_tonic", 3],
        ["prussian_blue", 2],
        ["iodine_tabs", 2],
        ["pc_sp_holywater", 4],
        ["purified_water", 3],
      ],
      "merchant_doctor",
      4,
    );
    // a plain dark habit and veil (Sisters of Charity), never Glowkeeper robes (outline sideQuestChanges: pc_relic)
    PC.spawnActor(ctx, {
      id: "pc_sp_agnes",
      type:
        G.chars && G.chars.info && G.chars.info("sister_agnes")
          ? "sister_agnes"
          : "human",
      gender: "f",
      outfit: "settler",
      hat: "hood",
      hatColor: 0x26252b,
      name: "Sister Agnes",
      faction: "settlers",
      level: 6,
      essential: true,
      hostile: false,
      pos: v(a),
      yaw: -Math.PI / 2,
      ai: "merchant",
      home: "here",
      homeR: 3,
      dialogue: "pc_dlg_agnes",
      voice: "settler",
      merchant: { scrip: 250, stock, restock: 3 },
      barks: [
        "Peace be with you, child.",
        "Mind the graves.",
        "The Lord is my shepherd. The Maniacs are my flock. It's a complicated metaphor.",
        "Vespers at dusk. Singing optional. Screaming discouraged.",
      ],
    });
  }
  PC.part("old_st_patricks", { data: dataStPat, spawn: spawnStPatExt });
})();
