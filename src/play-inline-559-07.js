// play-inline-559 07 — the
// Lines 2867-3186 of readable/play-inline-559.pretty.js (statement-aligned).
  function nextRun() {
    return RUNS.find((r) => !Q.isComplete(r.q) && !Q.isActive(r.q)) || null;
  }
  function ballPartsCheck() {
    if (
      Q.stage("sq_neon_ball") === "parts" &&
      L.has("q_neon_winch_motor") &&
      L.has("q_neon_cable")
    )
      Q.setStage("sq_neon_ball", "install");
  }
  function opryCast(role) {
    L.setFlag("opry_role", role);
    if (Q.stage("sq_neon_opry") === "audition")
      Q.setStage("sq_neon_opry", L.flag("opry_wig_back") ? "show" : "wig");
  }
  // walked out of the show (Esc) before the bow: the curtain can go up again a little later (was stuck until a load)
  G.events.on("dialogueEnd", (actor, id) => {
    if (
      id === "dlg_neon_opry_show" &&
      Q.isActive("sq_neon_opry") &&
      L.flag("opry_show_running")
    )
      L.later(20, () => {
        if (Q.isActive("sq_neon_opry")) L.setFlag("opry_show_running", false);
      });
  });
  function opryFinish() {
    L.setFlag("opry_show_running", false);
    const sc = Number(L.flag("opry_score")) || 0;
    L.setFlag("opry_star", true);
    L.giveScrip(L.flag("opry_role") === "hand" ? 120 : sc >= 5 ? 300 : 200);
    L.give("q_neon_program", 1);
    Q.complete("sq_neon_opry");
    if (sc >= 5)
      L.news(
        "Tonight's Neon Revue brought the house down — reportedly in a good way. The critics (Nicky Two-Thumbs) called the new topsider lead \"not the worst thing I've seen, and I've seen a Colossus.\"",
      );
  }
  function clubOk() {
    return !!L.flag("club_member");
  }
  /** The club INTERIOR (neon_interiors cell: club_host / club_stage anchors + the street door) — Smiley Pete's act needs it. */
  function clubInterior() {
    return !!(N().place("club") && N().place("club_door"));
  }
  function clubAdmit(how) {
    if (L.flag("club_member")) return;
    L.setFlag("club_member", how);
    L.give("q_neon_club_card", 1);
    if (Q.stage("sq_neon_club") === "in") {
      if (clubInterior() && L.alive("neon_smiley"))
        Q.setStage("sq_neon_club", "meet");
      else {
        L.setFlag("club_card_only");
        Q.complete("sq_neon_club");
        L.later(1.5, () =>
          L.notify(
            "Honorary card-burner: the Neon's market traders now give you the neighbour price.",
          ),
        );
      }
    }
    // honorary card-burners get the neighbour price at the market
    for (const id of [
      "neon_tillie",
      "neon_brass",
      "neon_mags",
      "neon_joe",
      "neon_candy",
      "neon_willie",
    ]) {
      const a = L.npc(id);
      if (a && a.merchant)
        a.merchant.markup = Math.min(a.merchant.markup || 1, 0.93);
    }
  }
  function waitForRaid() {
    G.fadeTransition(() => {
      const h = G.time.hour,
        dh = (1.83 - h + 24) % 24;
      if (!G.isStub("rpg") && G.rpg.wait) {
        try {
          G.rpg.wait(dh);
        } catch (e) {
          G.time.hour = 1.83;
        }
      } else G.time.hour = 1.83;
      L.notify("You wait with the guards on the west wall…");
    }, 1.2);
  }

  // ------------------------------------------------------------------
  // World: the Ball winch, the breaker panel, the club door, Smiley
  // ------------------------------------------------------------------
  L.hook("world", function () {
    const S = ballSpots();
    if (S.base)
      G.world.addInteractable({
        pos: L.V3(S.base.x, (S.base.y || 0) + 1.1, S.base.z),
        radius: 1.2,
        label: "Ball Winch",
        verb: "Examine",
        priority: 0.7,
        enabled: () =>
          Q.stage("sq_neon_ball") === "install" ||
          Q.stage("sq_neon_ball") === "parts",
        onInteract() {
          L.startDialogue("dlg_neon_winch", null);
        },
      });
    const pp = powerPanelSpot();
    if (pp && !N().has(["power_generator", "power_panel"])) {
      const c = N().has(["plaza_centre", "center"]);
      try {
        buildCabinet({
          x: pp.x,
          y: pp.y,
          z: pp.z,
          yaw: c ? Math.atan2(c.x - pp.x, c.z - pp.z) : 0,
        });
      } catch (e) {
        G.reportError("quests:neon cabinet", e);
      }
    }
    if (pp)
      G.world.addInteractable({
        pos: L.V3(pp.x, (pp.y || 0) + 1.2, pp.z),
        radius: 1,
        label: "Main Breaker Panel",
        verb: "Inspect",
        priority: 0.7,
        enabled: () => Q.isStarted("sq_neon_power"),
        onInteract() {
          L.startDialogue("dlg_neon_panel", null);
        },
      });
    // The club door (interior stream): only members get through
    const cd = N().has(["club_door"]);
    if (cd) {
      for (const d of L.doors()) {
        const p = d.def && d.def.pos,
          t = d.def && d.def.target;
        if (!p || !t || d._neonClub) continue;
        if (
          p.x >= IXM() ||
          Math.hypot(p.x - cd.x, p.z - cd.z) > 5 ||
          t.x < IXM()
        )
          continue;
        d._neonClub = true;
        const prev = d.enabled;
        d.enabled = () => clubOk() && (!prev || prev());
        G.world.addInteractable({
          pos: p,
          radius: d.radius || 1.2,
          label: "Cinder Club (talk to Sal)",
          verb: "Enter",
          priority: 0.5,
          enabled: () => !clubOk(),
          onInteract() {
            L.say(
              "neon_sal",
              pick([
                "Whoa, whoa. Members only, topsider.",
                "Where do you think YOU'RE going?",
              ]),
              3,
            );
            L.sfx("door_locked");
          },
        });
      }
    }
  });
  L.hook("spawn", function () {
    // motor pickup in the library (once)
    if (
      !Q.isComplete("sq_neon_ball") &&
      !L.flag("neon_ball_fixed") &&
      !L.has("q_neon_winch_motor")
    ) {
      const m = motorSpot();
      if (m) L.pickup("neon_motor", "q_neon_winch_motor", 1, m);
    }
    // Big Sal moves to the club door once the club exists (45 spawns him at the older anchors)
    const sal = L.npc("neon_sal");
    const cb = N().spot(["club_bouncer", "club_door"], null, {
      requireAnchor: true,
    });
    if (sal && cb && !sal.dead) {
      sal.pos.set(cb.x, cb.y, cb.z);
      sal.home = { x: cb.x, z: cb.z, r: 1.5 };
      if (isFinite(cb.yaw)) {
        sal.yaw = cb.yaw;
        sal.homeYaw = cb.yaw;
      }
    }
    // Smiley Pete (only inside the club)
    const sm = clubInterior()
      ? N().spot(["club_host", "club_stage"], null, { requireAnchor: true })
      : null;
    if (
      Q.stage("sq_neon_club") === "meet" &&
      (!sm || L.isDead("neon_smiley"))
    ) {
      L.setFlag("club_card_only");
      Q.complete("sq_neon_club");
    }
    if (sm)
      L.spawnNPC({
        id: "neon_smiley",
        type: "human",
        name: "Smiley Pete",
        outfit: "merchant",
        gender: "m",
        hat: "bowler",
        hatColor: 0x222222,
        faction: "settlers",
        ai: "static",
        pos: { x: sm.x, y: sm.y, z: sm.z },
        yaw: sm.yaw || 0,
        home: { x: sm.x, z: sm.z, r: 1 },
        dialogue: "dlg_neon_smiley",
        voice: "settler",
        level: 4,
        barks: {
          idle: [
            "Is this thing on? Is ANYTHING on?",
            "I killed last night. Smoked the whole room. Old habit.",
          ],
          greet: ["Hey, the potato's back!"],
        },
      });
    // Kip exists while the power plot is live
    const ps = Q.stage("sq_neon_power");
    if (ps === "culprit" || ps === "confront") spawnKip();
    // bounties in progress
    const b = currentBounty();
    if (b) spawnBounty(b);
    RAID.spawned = false;
    RAID.actors = [];
    L.setFlag("opry_show_running", false);
    // an escort in progress resumes where the save left it (flag neon_exp_state); old saves restart at the Depot
    for (const r of RUNS)
      if (Q.isActive(r.q) && !EXP.run) {
        const st = L.flag("neon_exp_state");
        if (!startExpress(r, st && st.q === r.q ? st : null)) Q.fail(r.q);
        break;
      }
  });
  L.hook("reset", function () {
    BALL.seq = null;
    BALL.gatherOn = false;
    dropBallMesh();
    blackoutEnd(true);
    if (BALL.sprite) {
      try {
        if (BALL.sprite.parent) BALL.sprite.parent.remove(BALL.sprite);
      } catch (e) {
        /* ignore */
      }
      BALL.sprite = null;
    }
    RAID.actors = [];
    RAID.spawned = false;
    EXP.run = null;
    EXP.driver = null;
    EXP.ox = null;
  });
  G.events.on("questUpdated", (q) => {
    if (q && q.id === "sq_neon_power" && Q.stage("sq_neon_power") === "culprit")
      spawnKip();
  });
  G.events.on("itemAdded", (id) => {
    if (id === "q_neon_winch_motor" || id === "q_neon_cable") {
      if (!Q.isStarted("sq_neon_ball") && id === "q_neon_winch_motor")
        Q.start("sq_neon_ball");
      ballPartsCheck();
    }
    if (id === "q_neon_pay_note" && Q.stage("sq_neon_power") === "culprit")
      kipKnown("note");
  });
  G.events.on("actorKilled", (a) => {
    if (!a) return;
    const b = BOUNTIES.find((x) => x.id === a.id);
    if (b && Q.stage("sq_neon_guard") === b.stage) {
      Q.setStage("sq_neon_guard", "r" + (BOUNTIES.indexOf(b) + 1));
      L.notify(b.name + " is dead. Report to Captain Kincaid.");
    }
    // Sprocket is the only source of the Ball's cable: if she dies first, the spool is on her (lootable)
    if (
      a.id === "neon_sprocket" &&
      !Q.isComplete("sq_neon_ball") &&
      !L.flag("neon_ball_fixed") &&
      !L.has("q_neon_cable") &&
      Array.isArray(a.inventory)
    )
      a.inventory.push(["q_neon_cable", 1]);
    if (
      a.id === "neon_smiley" &&
      Q.isActive("sq_neon_club") &&
      Q.stage("sq_neon_club") === "meet"
    ) {
      L.setFlag("club_card_only");
      Q.complete("sq_neon_club");
    }
    if (
      a.id === "neon_kip" &&
      (Q.stage("sq_neon_power") === "confront" ||
        Q.stage("sq_neon_power") === "culprit")
    ) {
      L.setFlag("kip_gone");
      kipResolved("dead");
      if (Q.stage("sq_neon_power") === "culprit")
        Q.setStage("sq_neon_power", "defend");
    }
  });

  let t4 = 0;
