// play-inline-561 03 — the
// Lines 471-762 of readable/play-inline-561.pretty.js (statement-aligned).
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

