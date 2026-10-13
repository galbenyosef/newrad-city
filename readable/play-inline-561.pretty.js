/* src/quests/50_downtown.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 50: DOWNTOWN, THE HARBOUR & THE MUSEUMS
 *   SQ "Eagle's Nest"      — the Chrysler Building sniper (kill / hire / pay off)
 *   SQ "Bridge and Tunnel" — Tollbooth Tony's Brooklyn Bridge racket
 *   SQ "Lost in Transit"   — Hattie Caldwell's missing trade wagon
 *   SQ "Exhibit A"         — CURATOR-7 and the Met's over-zealous Patrolmen
 *   SQ "Shell Shock"       — Ossie the ferryman's shellback problem
 *   + Ossie's Liberty Ferry (travel to/from Liberty Island)
 *   MAIN STORY (outline v2): "Shell Shock" is the lone-path stage of mq24 "Crossing"
 *     (ms.proxy in 64_ms_act3.js); Ossie's crossing node calls L.ms.crossing.go(),
 *     and he tells of the robed lady with the gold face who paid in candles.
 *   + the Met security and City Hall teletypes (passcodes from CURATOR-7
 *     and Chess Charlie), the Caldwell strongbox combination (Flatiron ledger)
 * NPCs: Deadeye Dolores, Tollbooth Tony (+ Knuckles, Dee-Dee), Hattie
 *       Caldwell, Gus Papadakis, Nurse Kwan, Chess Charlie, CURATOR-7,
 *       Ossie the ferryman.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;

  const CHRYSLER = { x: 309, z: -208 },
    FLAT = { x: 150, z: 118 },
    WRECK = { x: 100, z: 40 },
    MET = { x: 82, z: -655 };
  const STOCK_WAGON = [
    [["purified_water", /purified water/i], 10],
    [["rally_tonic"], 3],
    [["ammo_10mm"], 50],
    [["ammo_556"], 40],
    [["ammo_12ga"], 24],
    [["duct_tape", /duct tape/i], 4],
    [["golden_plain_jerky", /golden plain|jerky/i], 5],
    [["franks_and_beans", /franks/i], 4],
  ];
  const STOCK_GUS = [
    [["leather_armor", /leather armor/i], 1],
    [["metal_armor", /metal armor/i], 1],
    [["lead_pipe"], 1],
    [["bolt_rifle_32"], 1],
    [["ammo_32"], 60],
    [["scrap_metal", /scrap metal/i], 6],
    [["prussian_blue"], 2],
    [["frag_mine"], 2],
    [["hunting_knife"], 1],
  ];

  // ------------------------------------------------------------------
  // Locks (G.locks, REBRAND §5): every passcode / combination is learnable in this file
  // ------------------------------------------------------------------
  const LOCK_MET = {
    id: "q_dt_met_security",
    label: "Met Security Teletype",
    passcode: "VERMEER",
    kind: "terminal",
    hint: "CURATOR-7 remembers the Director of Security's passcode.",
    learnedFrom: ["CURATOR-7 (Metropolitan Museum steps)"],
  };
  const LOCK_CITY_HALL = {
    id: "q_dt_city_hall_mayor",
    label: "Mayor's Office Teletype",
    passcode: "GRACIE",
    kind: "terminal",
    hint: "Chess Charlie clerked in the Mayor's office before the bombs.",
    learnedFrom: ["Chess Charlie (Washington Square)"],
  };
  const LOCK_STRONGBOX = {
    id: "q_dt_caldwell_strongbox",
    label: "Caldwell Strongbox",
    code: "0419",
    kind: "container",
    hint: "Hattie keeps her combinations in the Flatiron ledger.",
    learnedFrom: ["Flatiron Trading Post teletype (Hattie — Personal)"],
  };
  const LOCKS = [LOCK_MET, LOCK_CITY_HALL, LOCK_STRONGBOX];
  function learnLock(id, src) {
    if (G.locks && G.locks.learn) {
      try {
        G.locks.learn(id, src);
      } catch (e) {
        /* */
      }
    }
  }
  function knows(id) {
    return !!(G.locks && G.locks.isKnown && G.locks.isKnown(id));
  }
  const AT = (t) => t;
  const isSecBot = (a) => {
    const t = AT(a.type);
    return t === "patrolman" || t === "valet";
  };
  const isShellback = (a) => /^shellback/.test(AT(a.type) || "");
  const covenantSided = () => L.flag("mq_faction") === "covenant";

  // ------------------------------------------------------------------
  // Spots
  // ------------------------------------------------------------------
  function batteryPier() {
    return L.anchor("battery_park", ["ferryman", "skiff", "pier", "dock"], {
      x: -128,
      z: 962,
    });
  }
  function libertyDock() {
    const c = G.LAYOUT.LIBERTY;
    const dx = -100 - c.x,
      dz = 960 - c.z,
      dl = Math.hypot(dx, dz);
    return L.anchor("statue_of_liberty", ["dock", "pier", "ferry", "landing"], {
      x: c.x + (dx / dl) * (c.r - 8),
      z: c.z + (dz / dl) * (c.r - 8),
    });
  }
  L.spots = { batteryPier, libertyDock };
  const sniperDone = () =>
    !!(
      L.flag("dolores_recruited") ||
      L.flag("dolores_left") ||
      L.flag("dolores_dead")
    );

  // ------------------------------------------------------------------
  // Quests
  // ------------------------------------------------------------------
  L.hook("init", function () {
    L.quest({
      id: "sq_sniper",
      name: "Eagle's Nest",
      giver: "Stationmaster Okafor",
      location: "Chrysler Building",
      desc: "Someone in the Chrysler Building has been sniping the pack-bots on Grand Central's supply runs along 42nd Street. Delphine Okafor wants it stopped.",
      stages: [
        {
          id: "find",
          text: "Find the sniper in the Chrysler Building's crown. The raiders' service elevator is in the lobby.",
          markers: () => {
            const d = L.npc("chr_dolores");
            return [
              d && !d.dead
                ? chryslerMarker(d.pos, "The Sniper")
                : { x: CHRYSLER.x, z: CHRYSLER.z, label: "Chrysler Building" },
            ];
          },
        },
        // Solutions (optional lines; ticked off with the path actually taken)
        {
          id: "sn_talk",
          text: "(Optional) Convince the sniper to guard Grand Central's supply runs instead.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_dolores") && !sniperDone(),
          doneIf: () => !!L.flag("dolores_recruited"),
        },
        {
          id: "sn_pay",
          text: "(Optional) Pay the sniper 150 scrip to leave Manhattan.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_dolores") && !sniperDone(),
          doneIf: () => !!L.flag("dolores_left"),
        },
        {
          id: "sn_kill",
          text: "(Optional) Kill the sniper.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_dolores") && !sniperDone(),
          doneIf: () => !!L.flag("dolores_dead"),
        },
        {
          id: "report",
          text: () =>
            L.flag("dolores_recruited")
              ? "Deadeye Dolores has agreed to watch over the supply runs. Tell Stationmaster Okafor she'll need a window."
              : L.flag("dolores_left")
                ? "The sniper took your scrip and left for Jersey. Report back to Stationmaster Okafor."
                : "The sniper in the Chrysler Building is dead. Report back to Stationmaster Okafor.",
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Okafor" },
          ],
        },
      ],
      rewards: { xp: 250, scrip: 200 },
    });
    L.quest({
      id: "sq_bridge",
      name: "Bridge and Tunnel",
      giver: "Stationmaster Okafor",
      location: "Brooklyn Bridge",
      desc: "Tollbooth Tony's gang controls the Brooklyn Bridge and has raised the toll so high that Brooklyn's traders have stopped crossing.",
      stages: [
        {
          id: "tony",
          text: "Deal with Tollbooth Tony at the Brooklyn Bridge.",
          markers: () => [
            { npc: "bb_tony", label: "Tollbooth Tony", x: 269, z: 636 },
          ],
        },
        {
          id: "br_legit",
          text: "(Optional) Convince Tony to run the bridge as a legitimate toll authority.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_tony") && !L.flag("bridge_resolved"),
          doneIf: () => !!L.flag("bridge_legit"),
        },
        {
          id: "br_pay",
          text: "(Optional) Pay Tony 200 scrip to lower the wagon toll.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_tony") && !L.flag("bridge_resolved"),
          doneIf: () => !!L.flag("bridge_paid"),
        },
        {
          id: "br_charges",
          text: "(Optional) Point out the frayed demolition charges wired under the toll booth.",
          sideObjective: true,
          optional: true,
          // only a player who could spot them is told they're there
          showIf: () =>
            !!L.flag("met_tony") &&
            !L.flag("bridge_resolved") &&
            L.skill("explosives") >= 45,
          doneIf: () => !!L.flag("bridge_charges"),
        },
        {
          id: "br_fight",
          text: "(Optional) Kill Tollbooth Tony.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_tony") && !L.flag("bridge_resolved"),
          doneIf: () => !!L.flag("tony_dead"),
        },
        {
          id: "report",
          text: () =>
            L.flag("bridge_legit")
              ? "Tony is now Commissioner of the Brooklyn Bridge Toll Authority. Tell Stationmaster Okafor the bridge is open."
              : L.flag("bridge_charges")
                ? 'Tony\'s gang dropped the toll to five scrip after your "safety inspection". Report back to Stationmaster Okafor.'
                : L.flag("bridge_paid")
                  ? "You paid Tony to lower the wagon toll. Report back to Stationmaster Okafor."
                  : "Tollbooth Tony is dead and the bridge is open. Report back to Stationmaster Okafor.",
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Okafor" },
          ],
        },
      ],
      rewards: { xp: 250, scrip: 150 },
    });
    L.quest({
      id: "sq_wagon",
      name: "Lost in Transit",
      giver: "Hattie Caldwell",
      location: "Flatiron Trading Post",
      desc: "Hattie Caldwell's trade wagon — two drivers and a pack-bot called Dolly — never arrived at Grand Central from the Flatiron.",
      stages: [
        {
          id: "wreck",
          text: "Search for the Caldwell wagon along Broadway near Madison Square.",
          markers: [{ x: WRECK.x, z: WRECK.z, label: "Wagon Route" }],
        },
        {
          id: "woolworth",
          text: "Recover the Caldwell strongbox from the raiders at the Woolworth Building.",
          markers: () =>
            L.pickups.strongbox && !L.has("q_caldwell_strongbox")
              ? [
                  {
                    x: L.pickups.strongbox.pos.x,
                    z: L.pickups.strongbox.pos.z,
                    label: "Caldwell Strongbox",
                  },
                ]
              : [{ x: 0, z: 625, label: "Woolworth Building" }],
        },
        {
          id: "cv_pete",
          text: "(Optional) Follow the drag marks and find the missing driver, Pete Ruiz.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("pete_trail") &&
            !L.flag("pete_rescued") &&
            !L.flag("dead_esb_pete"),
          doneIf: () => !!L.flag("pete_rescued"),
          markers: () => [{ npc: "esb_pete", label: "Pete Ruiz" }],
        },
        {
          id: "return",
          text: "Return the strongbox to Hattie Caldwell at the Flatiron.",
          markers: () => [{ npc: "fl_hattie", label: "Hattie Caldwell" }],
        },
        {
          id: "cv_honest",
          text: "(Optional) Hand over the payroll untouched.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("wagon_honest"),
        },
        {
          id: "cv_skim",
          text: "(Optional) Skim a little off the top.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("wagon_skimmed"),
        },
      ],
      rewards: { xp: 300 },
    });
    L.quest({
      id: "sq_exhibit",
      name: "Exhibit A",
      giver: "CURATOR-7",
      location: "Metropolitan Museum of Art",
      desc: "CURATOR-7, the Met's last robotic docent, reports that the museum's security Patrolmen have been \"expelling patrons with excessive enthusiasm\" since the morning of the Bombing.",
      stages: [
        {
          id: "security",
          text: "Deal with the Metropolitan Museum's security robots.",
          // robots scrapped before CURATOR-7 asked (the kill counter already reads 2+): the job is done — report back
          onEnter() {
            if (L.counter("met_bots") >= 2 && !L.flag("met_closed")) {
              L.setFlag("met_bots_destroyed");
              Q.setStage("sq_exhibit", "report");
            }
          },
          // the marker sits on the robots themselves once they are about; before that, on the Met's steps
          markers: () => {
            const b = metBots().slice(0, 3);
            return b.length
              ? b.map((a) => ({
                  x: a.pos.x,
                  z: a.pos.z,
                  y: a.pos.y,
                  label: "Security Patrolman",
                }))
              : [
                  {
                    anchor: ["met", ["entrance", "steps", "curator"]],
                    fallback: { x: MET.x + 36, z: MET.z },
                    label: "Metropolitan Museum",
                  },
                ];
          },
        },
        {
          id: "ex_terminal",
          text: '(Optional) Engage the "MUSEUM CLOSED" protocol from the security teletype. CURATOR-7 may know the passcode.',
          sideObjective: true,
          optional: true,
          showIf: () => !L.flag("met_bots_destroyed"),
          doneIf: () => !!L.flag("met_closed"),
          markers: () => {
            const p = L.termPos("met_security");
            return p ? [{ x: p.x, z: p.z, label: "Security Teletype" }] : [];
          },
        },
        {
          id: "ex_destroy",
          text: () =>
            "(Optional) Destroy the security robots (" +
            Math.min(L.counter("met_bots"), 2) +
            "/2).",
          sideObjective: true,
          optional: true,
          showIf: () => !L.flag("met_closed"),
          doneIf: () => !!L.flag("met_bots_destroyed"),
        },
        {
          id: "report",
          text: () =>
            (L.flag("met_closed")
              ? "The security robots are asleep in their alcoves. "
              : "The security robots have been scrapped. ") +
            "Return to CURATOR-7.",
          markers: () => [{ npc: "met_curator", label: "CURATOR-7" }],
        },
      ],
      rewards: { xp: 250, scrip: 150, items: [["q_curator_monocle", 1]] },
    });
    L.quest({
      id: "sq_shellshock",
      name: "Shell Shock",
      giver: "Ossie",
      location: "Battery Park",
      desc: "Shellbacks have been crawling out of the harbour at Battery Park and trying to eat Ossie's ferry. Ossie would like them to stop, permanently.",
      stages: [
        {
          id: "hunt",
          text: "Stop the shellbacks attacking Ossie's ferry at Battery Park.",
          onEnter() {
            if (L.counter("shellbacks") >= 4) {
              L.setFlag("shell_culled");
              Q.setStage("sq_shellshock", "report");
            }
          },
          markers: () => {
            const shells =
              G.isStub("actors") || !G.actors.list
                ? []
                : G.actors
                    .list()
                    .filter(
                      (a) =>
                        a &&
                        !a.dead &&
                        !a.removed &&
                        isShellback(a) &&
                        Math.hypot(a.pos.x + 40, a.pos.z - 950) < 160,
                    )
                    .slice(0, 3);
            return shells.length
              ? shells.map((a) => ({
                  x: a.pos.x,
                  z: a.pos.z,
                  y: a.pos.y,
                  label: "Shellback",
                }))
              : [{ x: -40, z: 950, label: "Shellback Nests" }];
          },
        },
        {
          id: "sh_kill",
          text: () =>
            "(Optional) Kill shellbacks around Battery Park and the harbour (" +
            Math.min(L.counter("shellbacks"), 4) +
            "/4).",
          sideObjective: true,
          optional: true,
          showIf: () => !L.flag("shell_net"),
          doneIf: () => !!L.flag("shell_culled"),
        },
        {
          id: "sh_net",
          text: "(Optional) Repair the old-world shark-net generator on the pier.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ossie_net_known") && !L.flag("shell_culled"),
          doneIf: () => !!L.flag("shell_net"),
          markers: () => {
            const g = L.world.sharkNet;
            return g ? [{ x: g.x, z: g.z, label: "Shark-Net Generator" }] : [];
          },
        },
        {
          id: "report",
          text: () =>
            (L.flag("shell_net")
              ? "The harbour net is humming again. "
              : "The shellbacks have been thinned out. ") +
            "Return to Ossie at the Battery Park pier.",
          markers: () => [{ npc: "bp_ossie", label: "Ossie" }],
        },
      ],
      rewards: { xp: 250, scrip: 120, items: [["q_ferry_token", 1]] },
    });
  });

  // ------------------------------------------------------------------
  // Events & triggers
  // ------------------------------------------------------------------
  /** living security robots at the Met (location spawns + the quest's own) */
  function metBots() {
    if (G.isStub("actors") || !G.actors.list) return [];
    return G.actors
      .list()
      .filter(
        (a) =>
          a &&
          !a.dead &&
          !a.removed &&
          isSecBot(a) &&
          a.id !== "met_curator" &&
          Math.hypot(a.pos.x - MET.x, a.pos.z - MET.z) < 110,
      );
  }
  /**
   * Completability net: the robots are the Met's location spawns. If the player is at the museum with the job
   * open and fewer robots exist than are still needed (spawns culled, respawn timer, an older save), the
   * museum's security wakes two more at reachable spots on the Met's steps.
   */
  let metCheckT = 0;
  L.hook("update", function (dt) {
    metCheckT += dt;
    if (metCheckT < 3) return;
    metCheckT = 0;
    if (Q.stage("sq_exhibit") !== "security" || L.flag("met_closed")) return;
    const P = G.player.pos;
    if (
      Math.hypot(P.x - MET.x, P.z - MET.z) > 70 ||
      P.x >= G.LAYOUT.INTERIOR_X_MIN
    )
      return;
    const need = 2 - Math.min(2, L.counter("met_bots"));
    if (metBots().length >= need) return;
    const n = Number(L.flag("met_bot_waves")) || 0;
    if (n >= 3) return;
    L.incFlag("met_bot_waves");
    const at = L.anchor("met", ["entrance", "steps", "curator"], {
      x: MET.x + 36,
      z: MET.z,
    });
    for (let i = 0; i < need; i++) {
      const s = L.freeSpot(at.x + (i ? 3 : -3), at.z + 2, at.y, { maxR: 10 });
      L.spawnNPC({
        id: "met_secbot" + n + "_" + i,
        type: "patrolman",
        name: "Museum Security Patrolman",
        faction: "robots",
        hostile: true,
        level: 5,
        noRespawn: true,
        pos: { x: s.x, y: s.y, z: s.z },
        ai: "guard",
        home: { x: s.x, z: s.z, r: 8 },
        barks: [
          "PATRON DETECTED. THE MUSEUM IS CLOSED.",
          "PLEASE DO NOT TOUCH THE EXHIBITS. OR THE ROBOTS.",
          "EXPELLING ART THIEF.",
        ],
      });
    }
  });
  /**
   * Same net for Shell Shock: the Battery's shellbacks are location spawns (3 or so, 3-day respawn). With the
   * job open, the player on the Battery shore, fewer than 4 killed and none left alive nearby, a few more crawl
   * out of the harbour at the nests (max 3 waves) — otherwise the marker would point at empty nests for days.
   */
  let shellCheckT = 0;
  L.hook("update", function (dt) {
    shellCheckT += dt;
    if (shellCheckT < 3) return;
    shellCheckT = 0;
    if (
      Q.stage("sq_shellshock") !== "hunt" ||
      !Q.isActive("sq_shellshock") ||
      L.flag("shell_net")
    )
      return;
    const P = G.player.pos;
    if (Math.hypot(P.x + 40, P.z - 950) > 90 || P.x >= G.LAYOUT.INTERIOR_X_MIN)
      return;
    const need = 4 - Math.min(4, L.counter("shellbacks"));
    if (need <= 0) return;
    const live = G.actors
      .list()
      .filter(
        (a) =>
          a &&
          !a.dead &&
          !a.removed &&
          isShellback(a) &&
          Math.hypot(a.pos.x + 40, a.pos.z - 950) < 160,
      );
    if (live.length) return;
    const n = Number(L.flag("shell_waves")) || 0;
    if (n >= 3) return;
    L.incFlag("shell_waves");
    for (let i = 0; i < Math.min(need, 3); i++) {
      const s = L.freeSpot(-40 + (i - 1) * 5, 956, undefined, { maxR: 14 });
      if (!s || s.forced) continue;
      L.spawnNPC({
        id: "bp_shell" + n + "_" + i,
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        hostile: true,
        level: 4,
        noRespawn: true,
        pos: { x: s.x, y: s.y, z: s.z },
        ai: "guard",
        home: { x: s.x, z: s.z, r: 10 },
      });
    }
  });
  G.events.on("actorKilled", (a) => {
    if (!a) return;
    if (a.id === "chr_dolores") {
      L.setFlag("dolores_dead");
      if (Q.stage("sq_sniper") === "find") Q.setStage("sq_sniper", "report");
    }
    if (a.id === "bb_tony") {
      L.setFlag("tony_dead");
      L.setFlag("bridge_resolved");
      if (Q.stage("sq_bridge") === "tony") Q.setStage("sq_bridge", "report");
      ["bb_knuckles", "bb_deedee"].forEach((id) => L.hostile(id, true));
    }
    const t = AT(a.type);
    if (t === "shellback" || t === "shellback_matriarch") {
      L.bump("shellbacks");
      if (Q.stage("sq_shellshock") === "hunt") {
        if (L.counter("shellbacks") >= 4) {
          L.setFlag("shell_culled");
          Q.setStage("sq_shellshock", "report");
        } else L.refresh("sq_shellshock");
      }
    }
    if (
      isSecBot(a) &&
      a.id !== "met_curator" &&
      Math.hypot(a.pos.x - MET.x, a.pos.z - MET.z) < 110
    ) {
      L.bump("met_bots");
      if (Q.stage("sq_exhibit") === "security") {
        if (L.counter("met_bots") >= 2) {
          L.setFlag("met_bots_destroyed");
          Q.setStage("sq_exhibit", "report");
        } else L.refresh("sq_exhibit");
      }
    }
    if (a.id === "met_curator") L.setFlag("curator_dead");
  });
  G.events.on("itemAdded", (id) => {
    if (
      id === "q_caldwell_strongbox" &&
      (Q.stage("sq_wagon") === "woolworth" || Q.stage("sq_wagon") === "wreck")
    )
      Q.setStage("sq_wagon", "return");
    if (id === "q_caldwell_strongbox" && !Q.isStarted("sq_wagon"))
      Q.start("sq_wagon", { stage: "return" });
  });
  L.trigger({
    id: "wagon_wreck",
    x: WRECK.x,
    z: WRECK.z,
    r: 14,
    cond: () => Q.stage("sq_wagon") === "wreck",
    fire() {
      L.notify(
        "The Caldwell wagon: a gutted pack-bot, a dead driver, and raider boot prints heading south down Broadway.",
      );
      Q.setStage("sq_wagon", "woolworth");
      if (!L.flag("pete_rescued"))
        L.later(4, () => {
          L.setFlag("pete_trail");
          L.notify(
            "...and a second trail: huge bare footprints, dragging something heavy north toward 34th Street.",
          );
          L.refresh("sq_wagon");
        });
    },
  });
  // Tony's gang warns you when you step onto the bridge.
  L.trigger({
    id: "bridge_warn",
    x: 250,
    z: 637,
    r: 24,
    y: 24,
    dy: 5,
    cond: () => !L.flag("bridge_resolved") && L.alive("bb_tony"),
    fire() {
      L.say(
        "bb_tony",
        "Hey, HEY! Toll booth! You walk past this booth without payin', you're walkin' into the river!",
      );
    },
  });

  // ------------------------------------------------------------------
  // Chrysler service elevator (lobby ⇄ the sniper nest on the SW gargoyle, ~110 m up)
  // ------------------------------------------------------------------
  const CHR_LIFT = {
    lobby: { x: 316.2, y: 1.2, z: -202.5 },
    lobbyOut: { x: 314.6, y: 0, z: -202.5, yaw: Math.PI / 2 },
  };
  function nestSpot() {
    return L.anchor("chrysler", ["sniper"], null);
  }
  function chryslerMarker(p, label) {
    const P = G.player.pos;
    if (!p || p.y < 20 || P.y > 90) return { x: p.x, z: p.z, y: p.y, label };
    if (Math.hypot(P.x - CHR_LIFT.lobby.x, P.z - CHR_LIFT.lobby.z) < 60)
      return {
        x: CHR_LIFT.lobby.x,
        z: CHR_LIFT.lobby.z,
        label: label + " — Service Elevator",
      };
    return { x: 298, z: -207.5, label: label + " (Chrysler lobby)" };
  }
  L.chryslerMarker = chryslerMarker;
  L.hook("world", function () {
    const nest = nestSpot();
    if (!nest || nest.y < 50) return; // landmark without a crown nest: nothing to connect
    G.world.addDoor({
      pos: L.V3(CHR_LIFT.lobby.x, CHR_LIFT.lobby.y, CHR_LIFT.lobby.z),
      label: "Service Elevator — Crown",
      verb: "Ride",
      radius: 1.2,
      target: {
        x: nest.x + 0.6,
        y: nest.y,
        z: nest.z - 0.6,
        yaw: Math.PI * 0.75,
      },
      sound: "door_open",
      onEnter: () =>
        L.notify(
          "The raiders' rope-and-winch elevator creaks up seventy floors. You try not to look at the rope.",
        ),
    });
    G.world.addDoor({
      pos: L.V3(nest.x + 1.6, nest.y + 1.1, nest.z - 1.4),
      label: "Service Elevator — Lobby",
      verb: "Ride",
      radius: 1.0,
      target: CHR_LIFT.lobbyOut,
      sound: "door_open",
    });
  });

  // ------------------------------------------------------------------
  // World & NPCs
  // ------------------------------------------------------------------
  L.hook("world", function () {
    const lbMet =
      !G.isStub("landmarks") && G.landmarks.getAnchor
        ? G.landmarks.getAnchor("met", "terminal")
        : null;
    if (lbMet && isFinite(lbMet.x))
      L.world.term_met_security = {
        pos: L.V3(lbMet.x, (lbMet.y || 0) + 1.1, lbMet.z),
        external: true,
      };
    else {
      const t = L.anchor(
        "met",
        ["terminal", "security", "office", "entrance"],
        { x: MET.x + 32, z: MET.z + 10 },
      );
      if (t) L.spawnTerminal("met_security", t, -Math.PI / 2);
    }
    const tf = L.anchor("flatiron", ["terminal", "office"], { x: 133, z: 110 });
    if (tf) L.spawnTerminal("flatiron_post", tf, Math.PI);
    // Ossie's return boat on Liberty Island (static interactable).
    const dock = libertyDock();
    if (dock) {
      L.world.libertyBoat = G.world.addInteractable({
        pos: L.V3(dock.x, (dock.y || 0) + 1, dock.z),
        radius: 1.2,
        label: "Ossie's Ferry (to Battery Park)",
        verb: "Ride",
        priority: 1,
        onInteract() {
          const p = batteryPier();
          L.sfx("door_open");
          L.travel(p.x, p.y || 0, p.z, 0.6, () =>
            L.notify("Ossie grumbles the whole way back."),
          );
        },
      });
    }
  });

  L.hook("spawn", function () {
    // ---- Chrysler sniper ----
    if (!L.flag("dolores_left")) {
      const recruited = L.flag("dolores_recruited");
      L.spawnNPC({
        id: "chr_dolores",
        type: "human",
        name: "Deadeye Dolores",
        outfit: recruited ? "combat_armor" : "raider",
        gender: "f",
        faction: recruited ? "settlers" : "raiders",
        ai: "guard",
        home: "here",
        homeR: 2,
        hostile: false,
        level: 9,
        hp: 180,
        weapon: ["sniper_rifle", "hunting_rifle"],
        at: recruited
          ? {
              site: "grand_central",
              anchors: ["guard3", "rooftop", "entrance"],
              fallback: { x: 256, z: -186 },
            }
          : {
              site: "chrysler",
              anchors: ["sniper", "rooftop", "crown", "boss"],
              fallback: { x: CHRYSLER.x - 6, z: CHRYSLER.z + 22 },
            },
        dialogue: "dlg_chr_dolores",
        inventory: [
          ["q_note_dolores_diary", 1],
          ["ammo_308", 20],
        ],
        barks: recruited
          ? [
              "Supply run's clear. I've got eyes on 42nd.",
              "Nobody touches the pack-bots on my watch.",
            ]
          : ["Nice day for it.", "Keep walking, Frosty."],
      });
    }
    // ---- Brooklyn Bridge toll gang ----
    const bb = (anchors, dx, dz) => ({
      site: "brooklyn_bridge",
      anchors,
      fallback: { x: 178 + dx, z: 640 + dz },
    });
    {
      const hostile = !!L.flag("bridge_hostile");
      L.spawnNPC({
        id: "bb_tony",
        type: "human",
        name: "Tollbooth Tony",
        outfit: "raider_heavy",
        gender: "m",
        faction: "raiders",
        ai: "guard",
        home: "here",
        homeR: 3,
        hostile,
        level: 8,
        hp: 220,
        weapon: ["sawed_off_shotgun", "combat_shotgun"],
        inventory: [
          ["q_toll_collector_cap", 1],
          ["scrip", 120],
          ["q_note_toll_rates", 1],
        ],
        at: bb(["toll_boss", "toll", "boss", "manhattan_ramp"], 0, 0),
        dialogue: "dlg_bb_tony",
        barks: L.flag("bridge_legit")
          ? [
              "Brooklyn Bridge Toll Authority! Receipts available!",
              "Have a nice crossing!",
            ]
          : ["Toll's twenty. Complaints are fifty.", "Exact change, pal."],
      });
      L.spawnNPC({
        id: "bb_knuckles",
        type: "human",
        name: "Knuckles",
        outfit: "raider",
        gender: "m",
        faction: "raiders",
        ai: "guard",
        home: "here",
        homeR: 4,
        hostile,
        level: 5,
        weapon: ["lead_pipe", "baseball_bat"],
        at: bb(["toll_guard1", "footlocker", "spawn1"], 4, -4),
        barks: ["Pay the man.", "Boss says pay."],
      });
      L.spawnNPC({
        id: "bb_deedee",
        type: "human",
        name: "Dee-Dee",
        outfit: "raider",
        gender: "f",
        faction: "raiders",
        ai: "guard",
        home: "here",
        homeR: 4,
        hostile,
        level: 5,
        weapon: ["bolt_rifle_32", "pistol_32"],
        at: bb(["toll_guard2", "spawn1", "spawn2"], 4, 4),
        barks: ["Nice snowsuit. Toll's double for snowsuits.", "Heh."],
      });
    }
    // ---- Flatiron Trading Post ----
    const fl = (anchors, dx, dz) => ({
      site: "flatiron",
      anchors,
      fallback: { x: FLAT.x + dx, z: FLAT.z + dz },
    });
    L.spawnNPC({
      id: "fl_hattie",
      type: "human",
      name: "Hattie Caldwell",
      outfit: "merchant",
      gender: "f",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: fl(["merchant1", "wagon", "entrance"], -4, -32),
      dialogue: "dlg_fl_hattie",
      essential: true,
      merchant: { scrip: 500, stock: STOCK_WAGON, restock: 3 },
      barks: [
        "Caldwell & Daughters — we deliver! Usually!",
        "Anybody seen a pack-bot named Dolly?",
      ],
      skinTone: 0.6,
    });
    L.spawnNPC({
      id: "fl_gus",
      type: "human",
      name: "Gus Papadakis",
      outfit: "drifter",
      gender: "m",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: fl(["merchant2", "shop", "stall1"], 6, -30),
      dialogue: "dlg_fl_gus",
      merchant: { scrip: 400, stock: STOCK_GUS, restock: 3 },
      barks: [
        "Gus buys junk, Gus sells junk. Gus IS junk, some days.",
        "Best armour on Broadway! Only armour on Broadway!",
      ],
      hair: "beard",
    });
    L.spawnNPC({
      id: "fl_kwan",
      type: "human",
      name: "Nurse Abigail Kwan",
      outfit: "doctor",
      gender: "f",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: fl(["doctor", "clinic"], 9, 23),
      dialogue: "dlg_fl_kwan",
      merchant: {
        scrip: 250,
        stock: [
          [["rally_tonic"], 5],
          [["prussian_blue"], 3],
          [["iodine_tabs"], 2],
          [["morphine_syrette"], 1],
        ],
        restock: 3,
      },
      barks: [
        "Hold still. This will hurt, and then it won't.",
        "Wash your hands! Out here that's half of medicine.",
      ],
      skinTone: 0.35,
    });
    L.spawnNPC({
      id: "ws_charlie",
      type: "human",
      name: "Chess Charlie",
      outfit: "survivor_layers",
      gender: "m",
      faction: "settlers",
      ai: "sit",
      home: "here",
      essential: true,
      at: {
        site: "washington_square",
        anchors: ["chess", "fountain"],
        fallback: { x: 56, z: 447 },
      },
      dialogue: "dlg_ws_charlie",
      barks: [
        "Game? Five scrip a game. Ten if you're any good.",
        "Your move. Your move. It's been your move for a while, pal.",
      ],
      voice: "settler",
    });

    // ---- Wagon wreck & Woolworth strongbox ----
    if (!L.flag("wagon_done")) {
      const w = L.freeSpot(WRECK.x, WRECK.z, 0, { maxR: 8 });
      L.dyn(
        L.prop("skeleton", { x: w.x + 1.5, y: w.y, z: w.z + 0.5, yaw: 2.1 }),
      );
      L.dyn(L.prop("crate", { x: w.x - 1.2, y: w.y, z: w.z - 0.8, yaw: 0.4 }));
      L.pickup("wagon_manifest", "q_note_wagon_manifest", 1, {
        x: w.x + 0.6,
        y: w.y,
        z: w.z + 0.2,
      });
      if (!L.has("q_caldwell_strongbox")) {
        const s = L.anchor(
          "woolworth",
          ["loot", "boss", "footlocker", "entrance"],
          { x: 0, z: 625 },
        );
        if (s) {
          L.pickup("strongbox", "q_caldwell_strongbox", 1, s);
          L.pickup("woolworth_note", "q_note_raider_woolworth", 1, {
            x: s.x + 0.7,
            y: s.y,
            z: s.z,
          });
        }
      }
    }
    // ---- Met: CURATOR-7 ----
    {
      L.spawnNPC({
        id: "met_curator",
        type: "valet",
        name: "CURATOR-7",
        faction: "settlers",
        ai: "guard",
        home: "here",
        homeR: 3,
        hostile: false,
        essential: true,
        at: {
          site: "met",
          anchors: ["curator", "steps", "entrance"],
          fallback: { x: MET.x + 36, z: MET.z },
        },
        dialogue: "dlg_met_curator",
        barks: [
          "Welcome to the Metropolitan Museum of Art! Please do not touch the exhibits.",
          "Flash photography is strictly forbidden. So are flamers.",
          "The gift shop is closed. Permanently. Please enjoy the gift of knowledge.",
        ],
        voice: "robot_posh",
      });
    }
    // ---- Battery Park: Ossie ----
    const pier = batteryPier();
    L.spawnNPC({
      id: "bp_ossie",
      type: "human",
      name: "Ossie",
      outfit: "survivor_layers",
      gender: "m",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 2,
      pos: pier,
      dialogue: "dlg_bp_ossie",
      essential: true,
      weapon: ["hunting_rifle"],
      level: 8,
      barks: [
        "Ferry's leavin'. Eventually.",
        "Mind the shellbacks. They mind you.",
        "Hundred scrip to Liberty. No refunds if you die.",
      ],
      voice: "settler",
    });
    L.pickup("ferry_sign", "q_note_ossie_sign", 1, {
      x: pier.x + 1.2,
      y: pier.y,
      z: pier.z - 0.6,
    });
  });

  // ------------------------------------------------------------------
  // Ferry. landmarks_b moors a "Harbor Skiff" door at Battery Park: it is
  // Ossie's boat, so it only runs once Ossie has agreed to take you.
  // ------------------------------------------------------------------
  function ferryAllowed() {
    return (
      L.has("q_ferry_token") ||
      !!L.flag("ferry_paid") ||
      !!L.flag("ossie_free_ride") ||
      !!L.flag("ending_played") ||
      (covenantSided() && (Q.isActive("mq06") || Q.isActive("mq24")))
    );
  }
  L.ferryAllowed = ferryAllowed;
  function gateSkiff() {
    for (const d of L.doors()) {
      const p = d.def && d.def.pos,
        t = d.def && d.def.target;
      if (!p || !t) continue;
      if (
        p.x > -200 &&
        p.x < 150 &&
        p.z > 900 &&
        p.z < 1060 &&
        Math.hypot(t.x - G.LAYOUT.LIBERTY.x, t.z - G.LAYOUT.LIBERTY.z) < 80 &&
        !d._questGated
      ) {
        d._questGated = true;
        const prev = d.enabled;
        d.enabled = () => ferryAllowed() && (!prev || prev());
        // A stand-in prompt so the player knows who to talk to.
        G.world.addInteractable({
          pos: p,
          radius: d.radius || 1.6,
          label: "Harbor Skiff (talk to Ossie)",
          verb: "Ride",
          priority: 0.5,
          enabled: () => !ferryAllowed(),
          onInteract() {
            L.say(
              "bp_ossie",
              "Hey! HEY! That's my boat! Hundred scrip, then you ride.",
            );
            L.sfx("door_locked");
          },
        });
      }
    }
  }
  L.hook("world", gateSkiff);

  // ------------------------------------------------------------------
  // Ferry travel
  // ------------------------------------------------------------------
  function ferryToLiberty() {
    const d = libertyDock();
    L.sfx("door_open");
    L.travel(
      d.x,
      d.y || 0,
      d.z,
      Math.atan2(-(G.LAYOUT.LIBERTY.x - d.x), -(G.LAYOUT.LIBERTY.z - d.z)),
      () => {
        L.notify(
          "The ferry noses up against Liberty Island's crumbling pier. Ossie is already turning back.",
        );
        G.events.emit("ferryArrived", "liberty");
      },
    );
  }
  L.ferryToLiberty = ferryToLiberty;
  /** Ossie's boat from his dialogue: during the main story's crossing (mq24) it is the crossing itself (Rose decides
   *  whether she comes, then Act IV lands you); otherwise the plain ferry ride. */
  function boardFerry() {
    if (Q.isActive("mq24") && L.ms && L.ms.crossing)
      L.ms.crossing.go(covenantSided() ? "lancers" : "ferry");
    else ferryToLiberty();
  }

  // ------------------------------------------------------------------
  // Terminals (teletypes)
  // ------------------------------------------------------------------
  L.hook("register", function () {
    if (G.locks && G.locks.register)
      for (const s of LOCKS) {
        try {
          G.locks.register(Object.assign({}, s));
        } catch (e) {
          /* */
        }
      }
    const MET_TERM = {
      title: "THE METROPOLITAN MUSEUM OF ART — SECURITY",
      header:
        "KNOX-GUARD SECURITY SYSTEMS, INC.\nMUSEUM STATUS: OPEN (EMERGENCY HOURS: 22 YEARS)",
      lock: { id: LOCK_MET.id, passcode: LOCK_MET.passcode },
      entries: [
        {
          title: "Security Log",
          text: 'MAR 5 1967 09:47 — Alert level RED. Patrolmen switched to "Exhibit Protection: Maximum."\nMAR 5 1967 09:48 — All patrons classified as potential art thieves.\nMAR 5 1967 09:49 — Situation resolved. Museum empty.\nMAR 6 1967 – PRESENT — Exhibit Protection: Maximum.',
        },
        {
          title: "Gallery 4 (Closed for Renovation)",
          text: 'Contents: "Know Your Enemy: The Soviet Arsenal." Features a decommissioned Soviet warhead (inert*).\n\n*Inert status last verified 1967. The Museum regrets any glowing. The Museum also regrets the choice of enemy.',
        },
        {
          title: ">> Engage MUSEUM CLOSED protocol",
          cond: () => !L.flag("met_closed"),
          action: () => {
            L.setFlag("met_closed");
            L.factionTruce("robots", MET.x, MET.z, 140, false);
            L.xp(50, "Electronics: Museum Closed");
            L.notify(
              "MUSEUM CLOSED. Security robots return to their charging alcoves and begin politely humming.",
            );
            if (
              Q.stage("sq_exhibit") === "security" ||
              !Q.isStarted("sq_exhibit")
            ) {
              if (!Q.isStarted("sq_exhibit")) Q.start("sq_exhibit");
              Q.setStage("sq_exhibit", "report");
            }
          },
        },
      ],
    };
    L.terminal("met_security", MET_TERM);
    L.terminal("met_curator", MET_TERM);
    L.terminal("city_hall_mayor", {
      title: "OFFICE OF THE MAYOR OF NEW YORK",
      header:
        'CITY OF NEW YORK — MUNICIPAL TELETYPE NETWORK\n"THE CITY THAT NEVER SLEEPS (CIVIL DEFENSE ADVISORY: PLEASE SLEEP IN A SHELTER)"',
      lock: { id: LOCK_CITY_HALL.id, passcode: LOCK_CITY_HALL.passcode },
      entries: [
        {
          title: "Mayor's Address (Draft 7)",
          text: "My fellow New Yorkers. Today the sirens sounded, and — [strike] — Today, the city faces — [strike] — New Yorkers do not panic. We complain. We complain loudly, and then we get to work. So complain, and then get to the nearest Civil Defense shelter, and then —\n\n[The draft ends mid-sentence. Time stamp: 03.05.1967 09:44.]",
        },
        {
          title: "Municipal Robotics — Service Log",
          text: 'PATROLMAN UNITS 1-6: "Civil Order Protocol" engaged 03.05.1967.\nDirective: preserve the Mayor\'s office until the Mayor returns.\nMayor status: NOT RETURNED.\nProjected return: PENDING.\n\nUnits remain on duty. Units will remain on duty.',
        },
        {
          title: "Office of Civil Defense — Memorandum",
          text: 'CITY OF NEW YORK / OFFICE OF CIVIL DEFENSE\nMEMORANDUM OF UNDERSTANDING: PROJECT LONG WINTER (CIVIC CENTER)\n\nThe City grants the Office subsurface rights beneath the Manhattan Municipal Building, in exchange for twelve (12) places in the program reserved for "municipal essential personnel."\n\nAppendix C (classified): the Office shall house Atlas Power & Light relay equipment in the facility\'s lowest level. The City shall not ask what it is for.\n\n[Handwritten: "Don\'t sign this." It is signed.]',
        },
        {
          title: ">> Order municipal robots to stand down",
          cond: () => !L.flag("cityhall_standdown"),
          action: () => {
            L.setFlag("cityhall_standdown");
            L.factionTruce("robots", 80, 625, 90, false);
            L.xp(40, "Municipal authority");
            L.notify(
              "CIVIL ORDER PROTOCOL SUSPENDED. The Patrolmen of City Hall lower their arms and wait for the Mayor.",
            );
          },
        },
      ],
    });
    L.terminal("flatiron_post", {
      title: "FLATIRON TRADING POST",
      header:
        'CALDWELL & DAUGHTERS / GUS PAPADAKIS — SHARED LEDGER\n"WE SPLIT THE RENT, NOT THE PROFITS"',
      entries: [
        {
          title: "Wagon Schedule",
          text: "Flatiron → Grand Central: Mon/Thu (Dolly)\nFlatiron → Brooklyn (via Bridge): SUSPENDED (Tony)\nFlatiron → Battery: when Ossie answers the radio",
        },
        {
          title: "Gus's Inventory Notes",
          text: 'Leather armour: 3 (one has a bullet hole — sell as "ventilated")\n.32 bolt rifles: 2 (one is missing its bolt)\nTin cans: 400 (why do I keep buying tin cans)',
        },
        {
          title: "Hattie — Personal",
          learn: LOCK_STRONGBOX.id,
          text: "Mom's locket is in the strongbox with the payroll. Combination is Mom's birthday, 0-4-1-9, same as every box this family has ever owned. If Ruiz loses that box I will walk to Brooklyn and back just to yell at him.",
        },
      ],
    });
  });

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
  L.hook("register", function () {
    // ---------------- Deadeye Dolores ----------------
    L.dialogue("dlg_chr_dolores", {
      start: () =>
        L.flag("dolores_recruited")
          ? "guard"
          : L.flag("met_dolores")
            ? "again"
            : "first",
      nodes: {
        first: {
          text: "Stop right there, Frosty. That's the third time today somebody's walked right up to me instead of shooting from the stairwell. Either you're brave or you're dumb, and I'm honestly curious which.",
          onEnter() {
            L.setFlag("met_dolores");
            if (!Q.isStarted("sq_sniper")) Q.start("sq_sniper");
          },
          responses: [
            {
              text: "You've been shooting Grand Central's pack-bots.",
              next: "bots",
            },
            { text: "Brave. Definitely brave.", next: "bots" },
            { text: "I'm here to kill you.", next: "fight" },
          ],
        },
        again: {
          text: "Back again, Frosty. Made up your mind?",
          responses: [
            { text: "About the supply runs...", next: "bots" },
            { text: "I'm here to kill you.", next: "fight" },
          ],
        },
        bots: {
          text: "Pack-bots. I shoot the pack-bots, never the drivers. The raiders downstairs pay me per bot, and they think I work for them. I work for the view. [She nods at the window — all of 42nd Street, laid out like a map.] Beats anything else I've seen in this city.",
          responses: [
            {
              text: "Grand Central needs someone with eyes like yours. Guard their supply runs instead.",
              check: { skill: "persuasion", value: 50 },
              next: "recruit",
              failNext: "recruit_fail",
            },
            {
              text: "Here's 150 scrip. Find another city to look at.",
              cond: () => L.scrip() >= 150,
              next: "payoff",
            },
            {
              text: "The raiders are using you. And you know it.",
              check: { attr: "presence", value: 7 },
              next: "recruit",
              failNext: "recruit_fail",
            },
            { text: "This ends now.", next: "fight" },
          ],
        },
        recruit: {
          text: "...Guard duty. For the market. [She laughs, short.] You know what? Fine. Tell Okafor the eagle's coming down off the Chrysler. And tell her I want a window. A big one.",
          onEnter() {
            L.setFlag("dolores_recruited");
            L.standing(50, "Recruited Dolores");
            L.xp(60, "Persuasion: New employer");
            Q.setStage("sq_sniper", "report");
            const d = L.npc("chr_dolores");
            if (d) {
              d.faction = "settlers";
            }
            L.give(["sniper_rifle", "hunting_rifle"], 1);
            L.give(["ammo_308"], 20);
          },
          responses: [{ text: "Welcome to the market, Dolores." }],
        },
        recruit_fail: {
          text: "Nah. I like it up here. Nobody bothers me except people like you, and people like you usually leave. Go on. Leave.",
          responses: [
            { text: "Fine." },
            { text: "Then this ends now.", next: "fight" },
          ],
        },
        payoff: {
          text: "[She weighs the scrip in her palm.] Hundred and fifty to go look at Jersey. ...Jersey's got a view too, I guess. Worse. But a view. [She shoulders the rifle.] Nice doing business, Frosty.",
          onEnter() {
            L.pay(150);
            L.setFlag("dolores_left");
            Q.setStage("sq_sniper", "report");
            L.removeNPC("chr_dolores");
            L.xp(40, "Paid off the sniper");
          },
          responses: [{ text: "Enjoy Jersey." }],
        },
        fight: {
          text: "Shame. You were the first interesting thing I'd seen all week.",
          onEnter() {
            L.hostile("chr_dolores", true);
          },
          responses: [{ text: "[Fight!]" }],
        },
        guard: {
          text: () =>
            [
              "Supply run's clear. I've got eyes on all of 42nd.",
              "Okafor gave me the big window. Don't tell her I cried.",
              "Frosty! Still alive? Good. Keep it that way.",
            ][Math.floor(Math.random() * 3)],
          responses: [{ text: "Keep watching, Dolores." }],
        },
      },
    });

    // ---------------- Tollbooth Tony ----------------
    L.dialogue("dlg_bb_tony", {
      start: () =>
        L.flag("bridge_legit")
          ? "legit"
          : L.flag("met_tony")
            ? "again"
            : "first",
      nodes: {
        first: {
          text: "Welcome to the Brooklyn Bridge, the eighth wonder of the world, now under new management! Me! I'm the management! Tollbooth Tony. Crossin' is twenty scrip. Complaints are fifty. Complaints about the complaint fee are a hundred.",
          onEnter() {
            L.setFlag("met_tony");
          },
          responses: [
            {
              text: "[Pay the toll.] (20 scrip)",
              cond: () => L.scrip() >= 20 && !L.flag("toll_paid"),
              next: "paid",
            },
            {
              text: "The Brooklyn traders stopped coming. Your toll's too high.",
              next: "traders",
            },
            {
              text: "How about I cross for free?",
              check: { attr: "brawn", value: 7 },
              next: "free",
              failNext: "free_fail",
            },
            {
              text: "I think your management is about to be restructured.",
              next: "fight",
            },
          ],
        },
        again: {
          text: "You again! My favourite customer. Or my least favourite. Depends if you're payin'.",
          responses: [
            {
              text: "[Pay the toll.] (20 scrip)",
              cond: () => L.scrip() >= 20 && !L.flag("toll_paid"),
              next: "paid",
            },
            {
              text: "About the traders...",
              next: "traders",
              cond: () => Q.isActive("sq_bridge") && !L.flag("bridge_resolved"),
            },
            {
              text: "Your management is about to be restructured.",
              next: "fight",
            },
            { text: "Just passing." },
          ],
        },
        paid: {
          text: "Pleasure doin' business! Keep to the right, don't feed the gulls, the gulls have teeth now.",
          onEnter() {
            L.pay(20);
            L.setFlag("toll_paid");
          },
          responses: [{ text: "Thanks, Tony." }],
        },
        free: {
          text: "[You lean in until Tony is looking directly up at your chin.] ...Y'know what, first crossing's complimentary. New customer promotion. Just started it. Right now.",
          onEnter() {
            L.setFlag("toll_paid");
            L.xp(10, "Brawn");
          },
          responses: [{ text: "Smart man." }],
        },
        free_fail: {
          text: "Ha! Knuckles, get a load of this one. Tough guy in pyjamas.",
          responses: [{ text: "Fine. About the traders...", next: "traders" }],
        },
        traders: {
          text: "Too high? It's a BRIDGE, pal. Longest suspension bridge in the world, once. Maintenance ain't cheap. Mostly the maintenance is me shootin' shellbacks off the cables, but it's still maintenance.",
          responses: [
            {
              text: "Lower the toll and they'll cross again. More crossings, more scrip. Go legit — run it like a real toll authority.",
              check: { skill: "persuasion", value: 50 },
              next: "legit_pitch",
              failNext: "legit_fail",
            },
            {
              text: "Here's 200 scrip. Lower the wagon toll.",
              cond: () => L.scrip() >= 200,
              next: "bribe",
            },
            {
              text: '[Point at the booth.] Those old-world demolition charges under your booth — the det cord\'s frayed. One good pothole and "management" ends up in the East River.',
              check: { skill: "explosives", value: 45 },
              next: "charges",
              failNext: "charges_fail",
            },
            { text: "Or I restructure your management.", next: "fight" },
          ],
        },
        charges: {
          text: '[Tony looks down. Tony looks at Knuckles. Knuckles looks at the sky.] ...KNUCKLES wired those. For "security." [You spend five careful minutes teaching the Brooklyn Bridge Toll Gang the difference between a blasting cap and a thinking cap.] Okay. OKAY. You saved our lives, which I resent. Wagons cross for five. You cross free. Forever. Don\'t tell nobody I was scared.',
          onEnter() {
            L.setFlag("bridge_charges");
            L.setFlag("bridge_resolved");
            L.setFlag("toll_paid");
            L.xp(80, "Explosives: Bridge safety inspection");
            L.standing(50, "Defused the toll booth");
            if (Q.isActive("sq_bridge")) Q.setStage("sq_bridge", "report");
            L.news(
              "Brooklyn Bridge update: the toll's down to five scrip, and I'm told the raiders up there just attended their first-ever safety briefing. Taught by a fella in a frost-grey suit. With a detonator. As one does.",
            );
          },
          responses: [{ text: "Safety first, Tony." }],
        },
        charges_fail: {
          text: "Them? Them's decorative. [He kicks the booth. Nothing explodes. He looks very relieved and pretends he isn't.] See? Decorative.",
          responses: [
            {
              text: "Here's 200 scrip. Lower the wagon toll.",
              cond: () => L.scrip() >= 200,
              next: "bribe",
            },
            { text: "Then I restructure your management.", next: "fight" },
            { text: "Forget it." },
          ],
        },
        legit_pitch: {
          text: "[Tony's mouth moves silently as he does the maths. He does it twice. He counts on his fingers. He borrows Knuckles' fingers.] ...More crossings. More scrip. And I get to wear a hat. A REAL toll hat. [He sticks out a hand.] Brooklyn Bridge Toll Authority. I'm gonna print receipts.",
          onEnter() {
            L.setFlag("bridge_legit");
            L.setFlag("bridge_resolved");
            L.standing(75, "Made Tony go legit");
            L.xp(80, "Persuasion: Infrastructure reform");
            Q.setStage("sq_bridge", "report");
            L.news(
              'Traffic report! The Brooklyn Bridge is open for business, and — I\'m reading this right — the "Brooklyn Bridge Toll Authority" is now issuing RECEIPTS. Five scrip a head. Somebody out there talked a raider into civic responsibility. Unbelievable.',
            );
          },
          responses: [{ text: "Nice doing business, Commissioner." }],
        },
        legit_fail: {
          text: "Legit? LEGIT? Pal, I'm a raider. Raiders don't go legit. We go... [he searches for the word] ...illegit.",
          responses: [
            {
              text: "Here's 200 scrip. Lower the wagon toll.",
              cond: () => L.scrip() >= 200,
              next: "bribe",
            },
            { text: "Then I restructure your management.", next: "fight" },
            { text: "Forget it." },
          ],
        },
        bribe: {
          text: "Two hundred scrip... for me... to charge LESS? [He takes it quick, before you change your mind.] Pal, you are the worst negotiator I ever met, and I love you. Wagons cross for five. Tell your friends.",
          onEnter() {
            L.pay(200);
            L.setFlag("bridge_paid");
            L.setFlag("bridge_resolved");
            L.standing(10, "Paid for safe passage");
            Q.setStage("sq_bridge", "report");
          },
          responses: [{ text: "Don't make me regret it." }],
        },
        fight: {
          text: "Knuckles! Dee-Dee! We got a complaint! [He racks his shotgun.] Complaint department is OPEN!",
          onEnter() {
            L.setFlag("bridge_hostile");
            ["bb_tony", "bb_knuckles", "bb_deedee"].forEach((id) =>
              L.hostile(id, true),
            );
          },
          responses: [{ text: "[Fight!]" }],
        },
        legit: {
          text: "Brooklyn Bridge Toll Authority, how may I help ya? Five scrip a head, receipts on request, and the complaint fee is now a very reasonable ten scrip.",
          responses: [{ text: "Looking sharp, Tony." }],
        },
      },
    });

    // ---------------- Hattie Caldwell ----------------
    L.dialogue("dlg_fl_hattie", {
      start: () =>
        Q.stage("sq_wagon") === "return" && L.has("q_caldwell_strongbox")
          ? "return"
          : L.flag("met_hattie")
            ? "again"
            : "first",
      nodes: {
        first: {
          text: "Hattie Caldwell, Caldwell & Daughters Freight. Well — Caldwell and Daughter, since my sister married a Brooklyn boy. If you're buying, I'm selling. If you've seen a pack-bot called Dolly, I'm begging.",
          onEnter() {
            L.setFlag("met_hattie");
          },
          responses: [
            { text: "Let's trade.", barter: true },
            {
              text: "Your trade wagon is missing?",
              next: "missing",
              cond: () => !Q.isStarted("sq_wagon"),
            },
            { text: "Just browsing." },
          ],
        },
        again: {
          text: () =>
            Q.isActive("sq_wagon")
              ? "Any sign of them? Dolly, Ruiz, the strongbox? Anything?"
              : L.flag("wagon_done")
                ? "Best customer on Broadway! What can I get you?"
                : "What can I do for you?",
          responses: [
            { text: "Let's trade.", barter: true },
            {
              text: "About your wagon...",
              next: "missing",
              cond: () => !Q.isStarted("sq_wagon"),
            },
            { text: "Nothing today." },
          ],
        },
        missing: {
          text: "Four days ago Ruiz and Pete took Dolly up Broadway to Grand Central. Water, Rally Tonic, and a strongbox with our payroll — and my mother's locket, which I should not have put in there. They never arrived. Somewhere between here and Madison Square they just... stopped.",
          responses: [
            { text: "I'll look for them.", action: () => Q.start("sq_wagon") },
            { text: "What's in it for me?", next: "pay" },
            { text: "Sorry, I can't." },
          ],
        },
        pay: {
          text: "Two hundred scrip if you bring back that strongbox. And a discount at this stall for life, which, considering the neighbourhood, may not be long.",
          responses: [
            {
              text: "Your payroll's in that box. Three hundred, and I leave now.",
              check: { skill: "trade", value: 45 },
              next: "pay_up",
              failNext: "pay_no",
            },
            { text: "I'll find it.", action: () => Q.start("sq_wagon") },
            { text: "Maybe later." },
          ],
        },
        pay_up: {
          text: "[She laughs, not happily.] You'd make a good Caldwell. Three hundred. Bring me that box.",
          onEnter() {
            L.setFlag("hattie_haggled");
            L.xp(15, "Trade");
          },
          responses: [{ text: "Deal.", action: () => Q.start("sq_wagon") }],
        },
        pay_no: {
          text: "Two hundred is what the job pays. Two hundred is what I HAVE, until that box comes back.",
          responses: [
            { text: "Fine. I'll find it.", action: () => Q.start("sq_wagon") },
            { text: "Maybe later." },
          ],
        },
        return: {
          text: "[She sees the strongbox and sits down hard on a crate.] You found it. And Ruiz? Pete? ...No. Don't tell me. I can see your face.",
          responses: [
            {
              text: "Here's your strongbox. I'm sorry about your men.",
              standing: 50,
              next: "give",
            },
            {
              text: "[Lie] The raiders already cleaned it out. It's empty.",
              cond: () => !!L.flag("strongbox_looted"),
              standing: -75,
              next: "lie",
            },
            {
              text: "[Dial 0-4-1-9 and check inside first.] Let me make sure nothing's missing.",
              cond: () =>
                !L.flag("strongbox_looted") && knows(LOCK_STRONGBOX.id),
              action: () => {
                if (G.locks && G.locks.unlock) {
                  try {
                    G.locks.unlock(LOCK_STRONGBOX.id, "code");
                  } catch (e) {
                    /* */
                  }
                }
              },
              next: "peek",
            },
            {
              text: "Let me open it first — make sure nothing's missing.",
              cond: () =>
                !L.flag("strongbox_looted") && !knows(LOCK_STRONGBOX.id),
              next: "peek_fail",
            },
          ],
        },
        peek: {
          text: "[The dials click home. Inside: a thick bundle of scrip — the payroll — and a silver locket with a faded photograph of two little girls. Hattie is watching you.]",
          onEnter() {
            L.setFlag("strongbox_looted");
          },
          responses: [
            {
              text: "[Close it and hand it over.] Everything's here.",
              standing: 50,
              next: "give",
            },
            {
              text: "[Pocket the scrip. Hand over the locket.] The raiders took the payroll.",
              standing: -50,
              next: "half",
            },
          ],
        },
        peek_fail: {
          text: "[You try a few numbers on the dials. Nothing. Hattie raises an eyebrow.] It's a Caldwell box, friend. Only a Caldwell knows the combination.",
          responses: [{ text: "Here you go, then.", next: "give" }],
        },
        give: {
          text: () =>
            "[She spins the dials without looking. She takes out the locket first, and holds it to her chest for a long moment.] " +
            (L.flag("hattie_haggled")
              ? "Three hundred scrip, you shark."
              : "Two hundred scrip, as promised.") +
            " And three bottles of Rally Tonic, because you look like a person who needs them. Thank you. Truly.",
          onEnter() {
            L.take("q_caldwell_strongbox", 1);
            L.giveScrip(L.flag("hattie_haggled") ? 300 : 200);
            L.give(["rally_tonic"], 3);
            L.setFlag("wagon_done");
            L.setFlag("wagon_honest");
            Q.complete("sq_wagon");
          },
          responses: [{ text: "Take care, Hattie." }],
        },
        half: {
          text: "[She opens the locket, and smiles through tears.] The payroll can be replaced. This can't. Thank you. Here — it's not much. [Fifty scrip.] It's what I've got left.",
          onEnter() {
            L.take("q_caldwell_strongbox", 1);
            L.giveScrip(300 + 50);
            L.setFlag("wagon_done");
            L.setFlag("wagon_skimmed");
            Q.complete("sq_wagon");
          },
          responses: [{ text: "[Leave.]" }],
        },
        lie: {
          text: "Empty. [She stares at it.] Well. At least I have the box. [She doesn't open it in front of you.] Thanks for trying.",
          onEnter() {
            L.take("q_caldwell_strongbox", 1);
            L.giveScrip(300);
            L.setFlag("wagon_done");
            L.setFlag("wagon_skimmed");
            Q.complete("sq_wagon");
          },
          responses: [{ text: "[Leave.]" }],
        },
      },
    });

    // ---------------- Nurse Kwan ----------------
    L.dialogue("dlg_fl_kwan", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            "Abigail Kwan. I'm not a doctor, I'm a nurse — which out here means I know the difference, and that's rarer than a doctor. " +
            (G.player.hp < G.player.maxHp
              ? "You're bleeding on my floor."
              : "What do you need?"),
          responses: [
            {
              text: "Patch me up. (25 scrip)",
              cond: () => G.player.hp < G.player.maxHp,
              action: () => {
                if (L.pay(25)) {
                  G.player.heal(G.player.maxHp);
                  L.sfx("inject");
                }
              },
            },
            {
              text: "Flush out my radiation. (35 scrip)",
              cond: () => G.player.rads > 0,
              action: () => {
                if (L.pay(35)) L.removeRads();
              },
            },
            { text: "Let me see your supplies.", barter: true },
            { text: "I'm fine." },
          ],
        },
      },
    });

    // ---------------- Chess Charlie ----------------
    L.dialogue("dlg_ws_charlie", {
      start: "hello",
      nodes: {
        hello: {
          text: "Charlie. Chess Charlie. Been playing chess under this arch since before the bombs, and I've been winning since about ten minutes after. The competition thinned out, see. Game? Ten scrip says I take you in twenty moves.",
          responses: [
            {
              text: "You're on. (10 scrip)",
              cond: () => L.scrip() >= 10,
              check: { attr: "wits", value: 7 },
              next: "win",
              failNext: "lose",
            },
            {
              text: "Speed chess. Five seconds a move — no time to think, just instinct. (10 scrip)",
              cond: () => L.scrip() >= 10 && !L.flag("beat_charlie"),
              check: { attr: "senses", value: 7 },
              next: "blitz_win",
              failNext: "lose",
            },
            { text: "What was it like here, before?", next: "before" },
            { text: "Maybe later." },
          ],
        },
        win: {
          text: "[Twenty-three moves later, you trap his king behind his own rook. He stares at the board for a long time.] ...Huh. Twenty-two years. Nobody. [He pays you, grinning with his whole weathered, gap-toothed face.] Come back anytime, kid. I mean it. I haven't had this much fun since Eisenhower.",
          onEnter() {
            L.giveScrip(20);
            L.xp(25, "Beat Chess Charlie");
            L.setFlag("beat_charlie");
          },
          responses: [{ text: "Good game, Charlie." }],
        },
        blitz_win: {
          text: "[You play fast and badly. Charlie plays fast and brilliantly — and on move seventeen his burned, stiff hand knocks his own king over reaching for a pawn. He stares at it.] ...Touch-move. That's the rule. I made the rule. [He laughs until he coughs.] Quick eyes, kid. Quick, quick eyes. Take the scrip.",
          onEnter() {
            L.giveScrip(20);
            L.xp(25, "Senses: Beat Chess Charlie");
            L.setFlag("beat_charlie");
          },
          responses: [{ text: "Good game, Charlie." }],
        },
        lose: {
          text: "[He takes your queen on move nine and your dignity on move fourteen.] Checkmate. Don't feel bad — the last person who beat me was a Russian grandmaster in 1966, and he cheated. I'll take those ten scrip.",
          onEnter() {
            L.giveScrip(-10);
          },
          responses: [{ text: "Rematch sometime." }],
        },
        before: {
          text: "Before? I was a clerk in the Mayor's office, right down Broadway. Every lunch hour, right here: chess players, NYU kids, a guy with a piano on wheels. Pigeons. Lotta pigeons. Now it's burrow rats, which are like pigeons but with teeth and without the charm. The arch is still standing, though. So am I. Mostly.",
          responses: [
            {
              text: "Let's play.",
              cond: () => L.scrip() >= 10,
              check: { attr: "wits", value: 7 },
              next: "win",
              failNext: "lose",
            },
            {
              text: "The Mayor's office still has a working teletype. Locked.",
              next: "mayor",
            },
            { text: "Take care, Charlie." },
          ],
        },
        mayor: {
          text: "Hizzoner's teletype? Hah! His passcode was GRACIE — after the mansion. Every January the security fella made him change it, and every January he changed it to GRACIE. Go on. Tell those tin patrolmen the Mayor sends his regards. They've been waiting on him longer than I have.",
          learn: LOCK_CITY_HALL.id,
          onEnter() {
            learnLock(LOCK_CITY_HALL.id, "Chess Charlie");
          },
          responses: [
            { text: "Thanks, Charlie." },
            {
              text: "Fancy a game?",
              cond: () => L.scrip() >= 10,
              check: { attr: "wits", value: 7 },
              next: "win",
              failNext: "lose",
            },
          ],
        },
      },
    });

    // ---------------- Gus Papadakis ----------------
    L.dialogue("dlg_fl_gus", {
      start: "hello",
      nodes: {
        hello: {
          text: "Gus Papadakis! Armour, junk, armour made of junk. The Flatiron is the pointiest building in New York, and Gus has the pointiest prices. Hah! That is a joke. The prices are round. Like Gus.",
          responses: [
            { text: "Show me your wares.", barter: true },
            { text: "Why the Flatiron?", next: "why" },
            { text: "Bye, Gus." },
          ],
        },
        why: {
          text: "Is a triangle! Raiders come from one side, Gus sees them. Raiders come from other side, Gus sees them. Raiders come from third side, Gus is already running. Is perfect building.",
          responses: [
            { text: "Show me your wares.", barter: true },
            { text: "Solid logic." },
          ],
        },
      },
    });

    // ---------------- CURATOR-7 ----------------
    L.dialogue("dlg_met_curator", {
      start: () =>
        Q.stage("sq_exhibit") === "report"
          ? "report"
          : L.flag("met_curator")
            ? "again"
            : "first",
      nodes: {
        first: {
          speaker: "CURATOR-7",
          text: "Ah! A PATRON! Welcome, welcome to the Metropolitan Museum of Art. I am CURATOR-7, your docent. Please observe that I am holding my manipulators BEHIND my chassis; this is the international posture of non-threatening scholarship.",
          onEnter() {
            L.setFlag("met_curator");
          },
          responses: [
            {
              text: "Why is a docent standing outside the museum?",
              next: "outside",
            },
            { text: "Tell me about the collection.", next: "collection" },
            { text: "Goodbye." },
          ],
        },
        again: {
          text: "Welcome back! Please do not touch the exhibits. You have not touched them yet, but I like to say it early.",
          responses: [
            {
              text: "About the security robots...",
              next: "outside",
              cond: () => !Q.isStarted("sq_exhibit"),
            },
            {
              text: "Is there a way to switch the robots off without a fight?",
              next: "passcode",
              cond: () => Q.isActive("sq_exhibit") && !L.flag("met_closed"),
            },
            { text: "Tell me about the collection.", next: "collection" },
            { text: "Goodbye." },
          ],
        },
        outside: {
          text: 'An EXCELLENT question. On the morning of March 5th, 1967, our security Patrolmen were set to "Exhibit Protection: Maximum." Every patron since has been classified as an art thief. They have expelled... everyone. With considerable enthusiasm. I have been locked outside with the rest of the public for twenty-two years.',
          responses: [
            {
              text: "I'll deal with them.",
              cond: () => !Q.isStarted("sq_exhibit"),
              action: () => Q.start("sq_exhibit"),
            },
            {
              text: "What would you pay?",
              next: "pay",
              cond: () => !Q.isStarted("sq_exhibit"),
            },
            {
              text: "Is there a way to switch them off without a fight?",
              next: "passcode",
            },
            { text: "That sounds like a museum problem." },
          ],
        },
        passcode: {
          text: "There is! The security teletype in the Great Hall can engage the MUSEUM CLOSED protocol. The Director of Security's passcode was VERMEER — he was very fond of the Dutch, and very bad at secrets. He typed it with one finger while saying it aloud. Every morning. For eleven years.",
          learn: LOCK_MET.id,
          onEnter() {
            learnLock(LOCK_MET.id, "CURATOR-7");
          },
          responses: [
            {
              text: "I'll take care of it.",
              cond: () => !Q.isStarted("sq_exhibit"),
              action: () => Q.start("sq_exhibit"),
            },
            { text: "Thanks, Curator." },
          ],
        },
        pay: {
          text: "The Museum is prepared to offer an honorarium of one hundred and fifty scrip, a complimentary lifetime membership, and an item from my personal collection of optical instruments. Membership benefits currently include: not being shot.",
          responses: [
            {
              text: "Robot-proof art handling is specialist work. Specialists cost two hundred and fifty.",
              check: { skill: "trade", value: 50 },
              next: "pay_up",
              failNext: "pay_no",
            },
            { text: "Deal.", action: () => Q.start("sq_exhibit") },
          ],
        },
        pay_up: {
          text: "[CURATOR-7 whirrs through what sounds like a very short budget meeting with itself.] The Acquisitions Committee — me — approves. Two hundred and fifty scrip. Please do not tell the Education Department. It is also me, and it is furious.",
          onEnter() {
            L.setFlag("curator_haggled");
            L.xp(15, "Trade");
          },
          responses: [
            {
              text: "Pleasure doing business.",
              action: () => Q.start("sq_exhibit"),
            },
          ],
        },
        pay_no: {
          text: "I am afraid the endowment has been frozen since 1967. Literally. The strongroom is full of ice. One hundred and fifty.",
          responses: [
            { text: "Deal.", action: () => Q.start("sq_exhibit") },
            { text: "I'll think about it." },
          ],
        },
        collection: {
          text: 'Five thousand years of art! American, Egyptian, Greek, Roman, and a special exhibition sponsored by Atlas Power & Light: "Tomorrowland, U.S.A." Gallery 4 is closed for renovation. Please disregard the glow.',
          responses: [{ text: "Sounds great." }],
        },
        report: {
          text: () =>
            L.flag("met_closed")
              ? "MUSEUM CLOSED protocol! How elegant! The Patrolmen are asleep in their alcoves, humming the Museum hymn. You have preserved the collection AND the security staff. The Board would be delighted. There is no Board. I am delighted on their behalf."
              : "The security staff have been... retired. Permanently. [A long, sad whirr.] They were very dedicated. Too dedicated, perhaps. Thank you, patron.",
          responses: [
            {
              text: "Enjoy your museum, Curator.",
              action: () => {
                Q.complete("sq_exhibit");
                if (L.flag("curator_haggled")) L.giveScrip(100);
                L.news(
                  'Arts and culture! The Metropolitan Museum of Art is — and I quote the robot who called in — "open for patrons for the first time since 1967." The robot would like everyone to know the gift shop is still closed.',
                );
              },
            },
          ],
        },
      },
    });

    // ---------------- Ossie the ferryman ----------------
    L.dialogue("dlg_bp_ossie", {
      start: () => {
        if (Q.stage("sq_shellshock") === "report") return "report";
        // MAIN STORY mq24 "Crossing" (lone path / Covenant muster): the crossing itself
        if (
          Q.isActive("mq24") &&
          (Q.stage("mq24") === "ferry" || Q.stage("mq24") === "muster")
        ) {
          L.setFlag("met_ossie");
          return "ms24_ferry";
        }
        return L.flag("met_ossie") ? "again" : "first";
      },
      nodes: {
        first: {
          text: "Name's Ossie. I run the ferry. The ferry is that boat. The boat is mostly holes held together with other, smaller holes. You want to go to Liberty Island, it's a hundred scrip. You want to come back, that's free. Nobody ever asks to come back. Think about that.",
          onEnter() {
            L.setFlag("met_ossie");
          },
          responses: [
            { text: "Take me to Liberty Island.", next: "ferry" },
            { text: "What's on Liberty Island?", next: "liberty" },
            {
              text: "You look like you have a problem.",
              next: "problem",
              cond: () => !Q.isStarted("sq_shellshock"),
            },
            { text: "Maybe later." },
          ],
        },
        again: {
          text: () =>
            L.flag("ending_played")
              ? "The sky's different. You notice? I noticed."
              : "Back again. Ferry's still floatin'. Mostly.",
          responses: [
            { text: "Take me to Liberty Island.", next: "ferry" },
            {
              text: "About those shellbacks...",
              next: "problem",
              cond: () => !Q.isStarted("sq_shellshock"),
            },
            {
              text: "About that old net generator...",
              next: "net",
              cond: () =>
                Q.isActive("sq_shellshock") && !L.flag("ossie_net_known"),
            },
            {
              text: "Ever ferry anybody strange out to the island?",
              next: "ms24_lady",
              cond: () => Q.isStarted("mq04") && !L.flag("ms_ossie_lady"),
            },
            { text: "Not today." },
          ],
        },
        liberty: {
          text: "Pressed uniforms. Big guns. A statue with her arm still up, like she's still hailing a cab after twenty-two years. The Continuity moved in a year back. They pay me not to ferry people over. I take their scrip. Then I ferry people over. Business is business.",
          responses: [
            { text: "Take me there.", next: "ferry" },
            { text: "Maybe later." },
          ],
        },
        problem: {
          text: "Shellbacks. Big armoured crabs with worse attitudes. They come up out of the harbour at night and try to eat my boat. They've eaten four boats. This is boat five. Boat five is my favourite. Kill some for me, and the ferry's free for you — forever. Or as long as I am, which, at sixty-eight, is not a promise.",
          responses: [
            {
              text: "I'll thin them out.",
              action: () => Q.start("sq_shellshock"),
            },
            { text: "What's that rusted machine on the pier?", next: "net" },
            { text: "Not my problem." },
          ],
        },
        net: {
          text: "That? Old-world harbour defence. The city strung electrified nets across the slips to keep sharks off the tourist boats. Generator's been dead since the day I got cooked. Get it humming and the crabs'll keep off my boat all by themselves. Needs somebody handy with a wrench, though. Or somebody who reads wiring diagrams for fun.",
          onEnter() {
            L.setFlag("ossie_net_known");
            if (!Q.isStarted("sq_shellshock")) Q.start("sq_shellshock");
            else L.refresh("sq_shellshock");
          },
          responses: [
            { text: "I'll take a look at it." },
            { text: "I'll just shoot the crabs." },
          ],
        },
        report: {
          text: "Heard the shooting. Heard the crunching. Didn't hear any eating of boats. [He presses a punched subway token into your palm.] Lifetime ferry pass. Don't lose it — I don't make copies, I just remember faces, and yours is gonna change a lot out there.",
          responses: [
            {
              text: "Thanks, Ossie.",
              action: () => Q.complete("sq_shellshock"),
            },
          ],
        },
        ferry: {
          text: () => {
            if (L.has("q_ferry_token"))
              return "Got your token? Hop in. Mind the hole. No, the other hole.";
            if (covenantSided() && Q.isActive("mq06"))
              return 'The Covenant already paid. Well — "paid." They pointed a very large gun at me and said "please." Hop in.';
            return "Hundred scrip. Liberty Island. Don't stand up, don't lean over, and don't feed the thing that follows the boat.";
          },
          responses: [
            {
              text: "[Board the ferry.]",
              cond: () =>
                L.has("q_ferry_token") ||
                (covenantSided() && Q.isActive("mq06")),
              action: () => boardFerry(),
            },
            {
              text: "[Pay 100 scrip for a season pass and board.]",
              cond: () => !ferryAllowed() && L.scrip() >= 100,
              action: () => {
                if (L.pay(100)) {
                  L.setFlag("ferry_paid");
                  boardFerry();
                }
              },
            },
            {
              text: "[Board the ferry.]",
              cond: () =>
                !L.has("q_ferry_token") &&
                !(covenantSided() && Q.isActive("mq06")) &&
                ferryAllowed(),
              action: () => boardFerry(),
            },
            {
              text: "How about a discount for a fella who slept through the war?",
              check: { skill: "persuasion", value: 45 },
              next: "discount",
              failNext: "no_discount",
              cond: () => !L.has("q_ferry_token") && !L.flag("ossie_haggled"),
            },
            {
              text: "[Wait for him to turn and slip under the tarp in the stern.]",
              check: { skill: "stealth", value: 40 },
              next: "stowaway",
              failNext: "stowaway_fail",
              cond: () =>
                !L.has("q_ferry_token") &&
                !ferryAllowed() &&
                !L.flag("ossie_stowaway"),
            },
            { text: "Not yet." },
          ],
        },
        discount: {
          text: "Slept through it, huh? So did I. Under a bar on Pearl Street, with my hat over my face. Woke up looking like this. ...Fine. Free ride. Once. Don't tell the Continuity.",
          onEnter() {
            L.setFlag("ossie_haggled");
            L.setFlag("ossie_free_ride");
            L.xp(20, "Persuasion");
          },
          responses: [
            { text: "[Board the ferry.]", action: () => boardFerry() },
          ],
        },
        stowaway: {
          text: "[Ossie shuffles off to curse at a bollard. You fold yourself under a tarp that smells of twenty years of shellback. The engine coughs. The boat moves. Somewhere above you, Ossie starts singing to the harbour, badly.]",
          onEnter() {
            L.setFlag("ossie_stowaway");
            L.xp(20, "Stealth: Stowaway");
          },
          responses: [
            { text: "[Hold your breath.]", action: () => boardFerry() },
          ],
        },
        stowaway_fail: {
          text: "[A boot taps the tarp.] Kid. I'm old, not stupid. I can smell a stowaway through a lead wall. Hundred scrip, or swim — and the thing that follows the boat LOVES swimmers.",
          onEnter() {
            L.setFlag("ossie_stowaway");
          },
          responses: [
            {
              text: "[Pay 100 scrip and board.]",
              cond: () => L.scrip() >= 100,
              action: () => {
                if (L.pay(100)) {
                  L.setFlag("ferry_paid");
                  boardFerry();
                }
              },
            },
            { text: "[Climb out, sheepishly.]" },
          ],
        },
        // ---- MAIN STORY (outline v2) mq24 "Crossing": the lone path's boat, and the Covenant's (commandeered) ----
        ms24_ferry: {
          text: () =>
            covenantSided()
              ? "Your tin soldiers are already sitting in my boat. Sitting very heavy. If she goes down, I want it on record she was overloaded by the Iron Covenant."
              : (L.flag("shell_net")
                  ? "Net's humming, crabs are sulking, and boat five is still boat five. "
                  : "Crabs are thinned out and boat five is still boat five. ") +
                "Liberty Island. Tonight, if you like. Nobody on that island will be expecting an old man in a bucket.",
          responses: [
            { text: "[Cross to Liberty Island.]", action: () => boardFerry() },
            {
              text: "Ever ferry anybody strange out to the island?",
              next: "ms24_lady",
              cond: () => !L.flag("ms_ossie_lady"),
            },
            { text: "Not yet, Ossie." },
          ],
        },
        ms24_lady: {
          text: "Strange? Kid, I ferry Continuity deserters, Covenant spies and one fella with a goat. [He scratches the grey stubble under his chin.] But yeah. Back in the winter. A lady in long robes comes down the pier after dark with two of them candle-carriers behind her. Gold face. Not paint, a mask, a sun with all the rays out. Wants Liberty, middle of the night. Pays me in candles. A whole crate of candles. Who pays in candles?",
          onEnter() {
            L.setFlag("ms_ossie_lady");
          },
          responses: [
            { text: "What happened on the island?", next: "ms24_lady2" },
          ],
        },
        ms24_lady2: {
          text: "Walked up the pier like she owned it, and some private on the gate let her in, polite as a church usher. She was back inside the hour. Sat in my stern the whole way home with that gold face pointed at the water and never said a word. Whatever she went over there to buy, kid, they didn't sell it to her. [He shrugs.] I still got most of the candles. They burn nice.",
          responses: [{ text: "Thanks, Ossie." }],
        },
        no_discount: {
          text: "Hundred scrip. I got boats to replace.",
          onEnter() {
            L.setFlag("ossie_haggled");
          },
          responses: [
            {
              text: "[Pay 100 scrip and board.]",
              cond: () => L.scrip() >= 100,
              action: () => {
                if (L.pay(100)) {
                  L.setFlag("ferry_paid");
                  boardFerry();
                }
              },
            },
            { text: "Not now." },
          ],
        },
      },
    });
  });

  // ------------------------------------------------------------------
  // "Shell Shock" alternative: the old-world shark-net generator on the Battery pier
  // (Mechanics 50 or Electronics 65). A small procedural machine: 4 meshes, shared materials.
  // ------------------------------------------------------------------
  let netMats = null;
  function netMaterials() {
    if (netMats) return netMats;
    const T = window.THREE;
    netMats = {
      body: new T.MeshStandardMaterial({
        color: 0x5d6b62,
        roughness: 0.8,
        metalness: 0.55,
      }),
      rust: new T.MeshStandardMaterial({
        color: 0x7a4a2a,
        roughness: 0.95,
        metalness: 0.3,
      }),
      lamp: new T.MeshStandardMaterial({
        color: 0x331a10,
        emissive: 0xff5a1a,
        emissiveIntensity: 0.4,
        roughness: 0.4,
      }),
    };
    for (const k in netMats) netMats[k].userData.shared = true;
    return netMats;
  }
  function netLamp(on) {
    const m = netMaterials().lamp;
    m.color.setHex(on ? 0x103318 : 0x331a10);
    m.emissive.setHex(on ? 0x39ff6a : 0xff5a1a);
    m.emissiveIntensity = on ? 1.4 : 0.4;
  }
  function repairNet() {
    if (L.flag("shell_net")) {
      L.notify(
        "The shark-net generator hums contentedly. Out on the water, something with too many legs changes its mind.",
      );
      return;
    }
    if (!Q.isActive("sq_shellshock") || Q.stage("sq_shellshock") !== "hunt") {
      L.notify(
        'An old-world harbour shark-net generator, "PROPERTY OF THE PORT AUTHORITY". Dead as a doornail.',
      );
      return;
    }
    const mech = L.skill("mechanics"),
      elec = L.skill("electronics");
    if (mech < 50 && elec < 65) {
      L.notify(
        "[Mechanics 50 / Electronics 65] The windings are corroded solid. You can't make sense of it — yet.",
      );
      L.sfx("ui_error");
      return;
    }
    L.setFlag("shell_net");
    L.setFlag("ossie_net_known");
    netLamp(true);
    L.sfx("hum_electric", { volume: 0.8 });
    if (G.player.shake) G.player.shake(0.15, 0.6);
    L.xp(
      75,
      mech >= 50
        ? "Mechanics: Harbour defence"
        : "Electronics: Harbour defence",
    );
    L.notify(
      "You scrape the contacts, bridge the dead relay and throw the lever. Out in the harbour the old net lights up in a line of blue sparks, and the water starts to boil with retreating shellbacks.",
    );
    Q.setStage("sq_shellshock", "report");
    L.news(
      "Harbour news: the old Port Authority shark nets off Battery Park are LIVE again for the first time since the Bombing. Ossie says the crabs are furious. Ossie says that's the best part.",
    );
  }
  L.hook("spawn", function () {
    const pier = batteryPier();
    if (!pier) return;
    const p = L.freeSpot(pier.x + 6, pier.z - 3, pier.y, {
      maxR: 8,
      radius: 0.8,
    });
    if (!p) return;
    const T = window.THREE,
      M = netMaterials();
    const g = new T.Group();
    const body = new T.Mesh(new T.BoxGeometry(1.3, 1.1, 0.8), M.body);
    body.position.y = 0.55;
    g.add(body);
    const coil = new T.Mesh(
      new T.CylinderGeometry(0.26, 0.26, 0.9, 10),
      M.rust,
    );
    coil.rotation.z = Math.PI / 2;
    coil.position.set(0, 1.28, 0);
    g.add(coil);
    const lever = new T.Mesh(new T.BoxGeometry(0.06, 0.45, 0.06), M.rust);
    lever.position.set(0.52, 1.25, 0.3);
    lever.rotation.z = -0.4;
    g.add(lever);
    const lamp = new T.Mesh(new T.SphereGeometry(0.07, 8, 6), M.lamp);
    lamp.position.set(-0.45, 1.16, 0.41);
    g.add(lamp);
    g.position.set(p.x, p.y, p.z);
    g.rotation.y = Math.atan2(-(pier.x - p.x), -(pier.z - p.z));
    G.scene.add(g);
    netLamp(!!L.flag("shell_net"));
    const collider = G.world.addCollider(
      p.x,
      p.z,
      1.3,
      0.8,
      p.y,
      p.y + 1.5,
      g.rotation.y,
      { tag: "prop" },
    );
    const interactable = G.world.addInteractable({
      pos: L.V3(p.x, p.y + 1.1, p.z),
      radius: 1.0,
      label: "Shark-Net Generator",
      verb: "Repair",
      onInteract: repairNet,
    });
    L.dyn({
      object3d: g,
      collider,
      interactable,
      dispose() {
        g.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
        });
      },
    });
    L.world.sharkNet = { x: p.x, z: p.z };
  });
})();
