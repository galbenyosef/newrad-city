// play-inline-546 02 — check
// Lines 146-545 of readable/play-inline-546.pretty.js (statement-aligned).
  function selfTest() {
    const R = { ok: true, checks: [], fails: [] };
    const check = (name, cond, info) => {
      R.checks.push(
        name +
          (cond ? " ok" : " FAIL") +
          (info !== undefined ? " " + JSON.stringify(info) : ""),
      );
      if (!cond) {
        R.ok = false;
        R.fails.push(name);
        G.reportError(
          "arcadetest",
          name + " " + JSON.stringify(info === undefined ? "" : info),
        );
      }
    };
    const step = (n) => {
      for (let i = 0; i < (n || 1); i++) G._step(1 / 30);
    };
    const key = (code, rep) => {
      G.input.pressed[code] = true;
      G.input.keys[code] = true;
      G.events.emit("keydown", code, { repeat: !!rep });
    };
    const up = (code) => {
      G.input.keys[code] = false;
    };
    const UI = AR.ui;
    const t0 = performance.now();

    G.newGame({
      name: G.HERO && G.HERO.name,
      skipIntro: true,
      cheatSkipStart: true,
    });
    step(3);
    const ex = G.LAYOUT.cryoExit;
    if (ex) G.player.teleport(ex.x, 0, ex.z, ex.yaw);
    step(2);
    check(
      "placed",
      AR.world.placedCount() ===
        AR.CABINETS.length + AR.MINIS.length + AR.KEYS.length + 2,
      AR.world.placedCount(),
    );
    R.keySpots = AR.world.entries
      .filter((e) => e.kind === "key")
      .map(
        (e) =>
          e.id +
          "@" +
          (e.anchor || "street") +
          ":" +
          Math.round(e.x) +
          "," +
          Math.round(e.y * 10) / 10 +
          "," +
          Math.round(e.z),
      );
    check(
      "keys anchored",
      AR.world.entries.filter((e) => e.kind === "key" && e.anchor).length >= 12,
      R.keySpots,
    );
    R.badSpots = AR.world.entries.filter((e) => !e.ok).map((e) => e.id);
    R.spots = AR.world.entries.map(
      (e) => e.id + "@" + Math.round(e.x) + "," + Math.round(e.z),
    );
    check(
      "cabinets placed",
      AR.world.entries.filter((e) => e.kind === "cabinet").length ===
        AR.CABINETS.length,
    );
    check(
      "every game has a cabinet",
      AR.GAME_DEFS.every((g) => !!AR.world.nearestCabinet(g.id)),
    );

    // the flyer starts the hunt; keys + the keyring; miniature milestones
    const fl = AR.world.entry("flyer", "flyer_chambers");
    check("flyer board", !!fl && fl.interactable.enabled() === true);
    if (fl) fl.interactable.onInteract();
    if (!G.isStub("quests")) {
      check(
        "keys quest started by flyer",
        G.quests.isActive(AR.quests.KEYS) &&
          G.quests.stage(AR.quests.KEYS) === "collect",
        G.quests.stage(AR.quests.KEYS),
      );
      check(
        "flyer note",
        G.isStub("inventory") || G.inventory.count(AR.quests.FLYER) === 1,
      );
      check("flyer board done", fl && fl.interactable.enabled() === false);
    }
    for (let i = 0; i < 4; i++)
      AR.world.entry("key", AR.KEYS[i].id).interactable.onInteract();
    check(
      "keys x4",
      AR.STATE.keys.size === 4 &&
        (G.isStub("inventory") || G.inventory.count(AR.ITEM_KEY) === 4),
    );
    check(
      "nearest key",
      !!AR.world.nearestUnfound("key"),
      AR.world.nearestUnfound("key") && AR.world.nearestUnfound("key").dir,
    );
    if (!G.isStub("quests"))
      check("keys quest marker", AR.quests.keyMarker().length === 1);
    for (const q of AR.KEYS) AR.collect("key", q.id);
    check(
      "keys x16",
      AR.STATE.keys.size === AR.KEYS.length && AR.STATE.rewards.has("keys16"),
    );
    check(
      "keyring threaded",
      G.isStub("inventory") ||
        (G.inventory.count(AR.ITEM_KEYRING) === 1 &&
          G.inventory.count(AR.ITEM_KEY) === 0),
      G.isStub("inventory")
        ? "stub"
        : [G.inventory.count(AR.ITEM_KEYRING), G.inventory.count(AR.ITEM_KEY)],
    );
    if (!G.isStub("quests")) {
      check(
        "keys quest vault stage",
        G.quests.isActive(AR.quests.KEYS) &&
          G.quests.stage(AR.quests.KEYS) === "vault",
        G.quests.stage(AR.quests.KEYS),
      );
      check("vault marker", AR.quests.vaultMarker().length === 1);
    }
    if (!G.isStub("locks") && G.locks.get(AR.VAULT_LOCK)) {
      let opened = false;
      G.locks.open(AR.VAULT_LOCK, () => {
        opened = true;
      });
      check(
        "vault opens with the keyring",
        opened && G.locks.isOpen(AR.VAULT_LOCK),
      );
      step(2);
      if (!G.isStub("quests"))
        check("keys quest complete", G.quests.isComplete(AR.quests.KEYS));
    }
    R.sets = WORLD_SETS();
    AR.world.entry("mini", "empire").interactable.onInteract();
    check(
      "mini",
      AR.STATE.minis.has("empire") &&
        (G.isStub("inventory") || G.inventory.count("arc_mini_empire") === 1),
    );
    if (!G.isStub("quests"))
      check("mini quest", G.quests.isActive(AR.quests.MINIS));
    check("no double collect", AR.collect("mini", "empire") === false);

    // ledger: open with K, tabs, close
    key(AR.KEY);
    step(1);
    up(AR.KEY);
    check(
      "K opens ledger",
      G.state === "arcade" && UI.isOpen() && UI.mode === "ledger",
      G.state,
    );
    step(3);
    key("KeyE");
    step(2);
    check("tab → keys", UI.tab === "keys");
    check(
      "keys register",
      document.querySelectorAll(".arc-kleft .arc-item").length ===
        AR.KEYS.length,
    );
    key("KeyE");
    step(2);
    check("tab → arcade", UI.tab === "arcade");
    check("ledger never starts a game", !UI.session);
    key("KeyE");
    step(2);
    check("tab wraps → minis", UI.tab === "minis");
    key("Escape");
    step(1);
    check("Esc closes ledger", G.state === "play", G.state);

    // --- a cabinet in the world: interact → cabinet screen
    const cab = AR.world.entry("cabinet", "rr_skypatrol");
    check("cabinet interactable", cab && cab.interactable.enabled() === true);
    cab.interactable.onInteract();
    check(
      "cabinet opens the game",
      G.state === "arcade" &&
        UI.mode === "cabinet" &&
        UI.session &&
        UI.session.id === "skypatrol",
      [G.state, UI.mode],
    );
    check("cabinet power-on", UI.session && UI.session.phase === "boot");
    check("cabinet found", AR.STATE.cabinets.has("rr_skypatrol"));
    if (!G.isStub("quests"))
      check("records quest started", G.quests.isActive(AR.quests.RECORDS));
    step(2);
    key("Escape");
    step(1);
    check("Esc steps away", G.state === "play" && !UI.isOpen(), G.state);

    // --- play each game in attract/demo mode for a while
    const sim = (secs) => {
      for (let i = 0; i < secs * 30; i++) UI.update(1 / 30);
    };
    R.demo = {};
    for (const g of AR.GAME_DEFS) {
      G.arcade.play(g.id, {
        force: true,
        cabinet: AR.world.nearestCabinet(g.id),
      });
      check(
        "session " + g.id,
        UI.session && UI.session.id === g.id && UI.mode === "cabinet",
      );
      sim(2.5); // power-on → title / attract
      UI.startRun({ demo: true });
      const tt = performance.now();
      sim(40);
      const inst = UI.session.inst;
      R.demo[g.id] = {
        score: inst ? inst.score : -1,
        over: UI.session.phase,
        ms: Math.round(performance.now() - tt),
      };
      check("demo " + g.id + " scores", inst && inst.score > 0, R.demo[g.id]);
      UI.session.phase = "title";
      UI.session.inst = null;
      UI.stepAway();
      step(1);
    }
    // --- real-input runs
    G.arcade.play("skypatrol", { force: true });
    key("Enter");
    step(1);
    check("skypatrol run started", UI.session.phase === "play");
    sim(1.6);
    const ammo = () => UI.session.inst._bats.reduce((a, b) => a + b.ammo, 0);
    const a0 = ammo();
    key("Space");
    sim(0.1);
    check("skypatrol fired", ammo() === a0 - 1, [a0, ammo()]);
    UI.session.inst.over = true;
    sim(0.2);
    check(
      "skypatrol game over → score recorded",
      UI.session.phase === "over" && AR.STATE.plays.skypatrol >= 1,
      AR.STATE.plays,
    );
    key("Escape");
    step(1);
    key("Escape");
    step(1);
    check("title → step away", G.state === "play", G.state);

    G.arcade.play("catacomb", { force: true });
    key("Enter");
    step(1);
    const dg = UI.session.inst;
    const turns0 = dg._g.turns;
    for (const k of ["KeyD", "KeyS", "KeyA", "KeyW", "Space"]) {
      key(k);
      sim(0.12);
      up(k);
    }
    check("catacomb turns advance", dg._g.turns > turns0, dg._g.turns);
    key("KeyE");
    sim(0.1);
    key("Escape");
    step(1);
    check("catacomb paused", UI.session.phase === "paused");
    key("Enter");
    step(1);
    check("catacomb resumed", UI.session.phase === "play");
    // force a win above the house record: champion + record + quest progress
    dg._g.score = AR.houseRecord("catacomb") + 50;
    dg._g.won = true;
    dg._g.champion = true;
    dg._g.endT = 0;
    sim(3.2);
    check(
      "catacomb champion",
      AR.STATE.champion.has("catacomb") && UI.session.phase === "over",
    );
    check(
      "catacomb house record",
      AR.STATE.records.has("catacomb") && AR.board("catacomb")[0].mine === true,
      AR.board("catacomb")[0],
    );
    check(
      "catacomb high score",
      AR.highScores("catacomb").length === 1,
      AR.highScores("catacomb"),
    );

    G.arcade.play("steelworks", { force: true });
    key("Enter");
    step(1);
    const gd = UI.session.inst;
    sim(0.5);
    for (const k of ["KeyA", "KeyD", "KeyW", "KeyS", "Space", "Enter", "KeyE"])
      up(k); // nothing left held from earlier runs
    key("Space");
    sim(0.05);
    up("Space");
    check("steelworks jump", gd._p.st === "jump", gd._p.st);
    G.input.keys.KeyD = true;
    sim(1.0);
    G.input.keys.KeyD = false; // ~0.64 s airborne, then walk
    check("steelworks walked", gd._p.x > 112, Math.round(gd._p.x));

    // Tab closes the cabinet (game paused); the same cabinet resumes it
    key("Tab");
    step(1);
    check("Tab closes", G.state === "play" && !UI.isOpen(), G.state);
    AR.world.playAt(AR.world.nearestCabinet("steelworks"));
    check(
      "same game resumes paused",
      G.state === "arcade" &&
        UI.mode === "cabinet" &&
        UI.session.phase === "paused",
      UI.session && UI.session.phase,
    );
    key("Escape");
    step(1); // quit to title
    key("Escape");
    step(1); // step away
    check("Esc closes", G.state === "play", G.state);

    // records quest completes when all three house records fall
    for (const g of AR.GAME_DEFS)
      AR.recordScore(g.id, AR.houseRecord(g.id) + 1);
    step(2);
    if (!G.isStub("quests"))
      check("records quest complete", G.quests.isComplete(AR.quests.RECORDS));

    // state leaves arcade (e.g. cheat menu) → overlay hides
    G.arcade.open("minis");
    step(1);
    G.setState("play");
    step(1);
    check("hides on state change", !UI.isOpen());

    // live attract screen on the nearest cabinet
    const rr = AR.world.entry("cabinet", "rr_catacomb");
    G.player.teleport(rr.x + 1.5, rr.y, rr.z, 0);
    step(4);
    check(
      "live cabinet screen",
      AR.world.live === AR.world.nearestCabinet(null),
      AR.world.live && AR.world.live.id,
    );

    // save / load round trip
    const snap = JSON.stringify(AR.serialize());
    G.save.saveGame("arcadetest", "arcadetest");
    AR.collect("mini", "liberty");
    G.save.loadGame("arcadetest");
    G.save.deleteSlot("arcadetest");
    step(2);
    check(
      "save/load",
      JSON.stringify(AR.serialize()) === snap && !AR.STATE.minis.has("liberty"),
    );
    check(
      "world visibility restored",
      AR.world.entry("mini", "liberty").item.visible === true &&
        AR.world.entry("mini", "empire").item.visible === false,
    );
    // new game clears the run
    G.newGame({ name: G.HERO && G.HERO.name, skipIntro: true });
    step(2);
    check(
      "newGame clears",
      AR.STATE.minis.size === 0 &&
        AR.STATE.keys.size === 0 &&
        AR.STATE.cabinets.size === 0 &&
        AR.world.entry("mini", "empire").item.visible &&
        AR.world.entry("key", AR.KEYS[0].id).item.visible,
    );

    R.ms = Math.round(performance.now() - t0);
    R.placeMs = AR.world.placeMs;
    R.errors = G.errors.slice(0, 20);
    const pre = document.createElement("pre");
    pre.id = "arcadetest-result";
    pre.style.display = "none";
    pre.textContent = "ARCADETEST_BEGIN" + JSON.stringify(R) + "ARCADETEST_END";
    document.body.appendChild(pre);
    console.log(
      "[arcadetest] " + (R.ok ? "PASS" : "FAIL") + " " + R.fails.join(", "),
    );
    G.setState("title");
  }
