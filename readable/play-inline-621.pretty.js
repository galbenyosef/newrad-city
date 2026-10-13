/* src/ui_interact/90_module.js */
/* =====================================================================
 * NEW RAD CITY — ui_interact / 90_module.js
 * Module registration (order 70): per-frame ticking of the screens,
 * state-machine routing (the pre-game state 'chargen' is owned by
 * 50_intro.js), save / load, reset handling, a fallback title screen
 * when ui_hud is absent, and screenshot/debug demos (?shot=...&uidemo=
 * terminal|passcode|keypad|dialogue|barter|container|intro).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = G._uix;
  const QS = G.QS || new URLSearchParams(location.search);
  const intro = () =>
    X.intro || {
      isActive: () => false,
      isOpaque: () => false,
      stop() {},
      update() {},
      play(cb) {
        if (cb) cb();
      },
    };

  // ------------------------------------------------------------------
  // 'chargen' state: the pre-game opening (owned by 50_intro.js)
  // ------------------------------------------------------------------
  function beginChargen(data) {
    if (intro().isActive()) return;
    const skipIntro = (data && data.skipIntro) || QS.has("nointro");
    const after = () => {
      if (G.state !== "chargen") return;
      if (X.intro && X.intro.startGame) X.intro.startGame();
      else G.newGame({});
    };
    if (skipIntro || !X.intro) {
      after();
      return;
    }
    intro().play(after);
  }

  // ------------------------------------------------------------------
  // Fallback title (only when ui_hud is missing — core's own fallback
  // is disabled because G.ui is no longer a stub)
  // ------------------------------------------------------------------
  let ftitle = null;
  function showFallbackTitle() {
    if (ftitle || !G.isStub("hud")) return;
    ftitle = G.ui.el("div", "ui-screen ui-ftitle");
    ftitle.innerHTML = "<h1>" + X.esc(X.gameName()) + "</h1><h2>1989</h2>";
    const mk = (t, fn) => {
      const b = G.ui.el("div", "ui-btn", ftitle);
      b.textContent = t;
      b.onclick = fn;
      return b;
    };
    if (G.save.hasAny())
      mk("CONTINUE", () => {
        const s = G.save.listSlots()[0];
        if (s) G.save.loadGame(s.slot);
      });
    mk("NEW GAME", () => G.setState("chargen"));
    mk("QUICK START", () => G.newGame({}));
  }
  function hideFallbackTitle() {
    if (ftitle) {
      ftitle.remove();
      ftitle = null;
    }
  }

  G.events.on("state", (s, prev, data) => {
    try {
      X.dialogue.onState(s, prev);
    } catch (e) {
      G.reportError("uix:state:dialogue", e);
    }
    try {
      X.barter.onState(s, prev);
    } catch (e) {
      G.reportError("uix:state:barter", e);
    }
    try {
      X.container.onState(s, prev);
    } catch (e) {
      G.reportError("uix:state:container", e);
    }
    try {
      X.terminal.onState(s, prev);
    } catch (e) {
      G.reportError("uix:state:terminal", e);
    }
    try {
      X.keypad.onState(s, prev);
    } catch (e) {
      G.reportError("uix:state:keypad", e);
    }
    if (s === "title") showFallbackTitle();
    else hideFallbackTitle();
    if (s !== "chargen" && intro().isActive()) intro().stop();
    if (demoPending(s)) {
      runDemo();
      return;
    }
    if (s === "chargen") beginChargen(data);
  });

  G.events.on("reset", () => {
    for (const k of ["dialogue", "barter", "container", "terminal", "keypad"]) {
      try {
        X[k].reset();
      } catch (e) {
        G.reportError("uix:reset:" + k, e);
      }
    }
    X.screens.length = 0;
  });

  // ------------------------------------------------------------------
  // Player appearance (kept while 55_chargen.js still sets one; the hero is
  // a fixed character, so this goes away with it). Mirrored on
  // G.player.appearance, announced with 'playerAppearance', saved.
  // ------------------------------------------------------------------
  let appearance = null;
  X.applyAppearance = function (a) {
    appearance = a ? Object.assign({}, a) : null;
    try {
      if (G.player && appearance)
        G.player.appearance = Object.assign({}, appearance);
    } catch (e) {
      /* ignore */
    }
    if (appearance)
      G.events.emit("playerAppearance", Object.assign({}, appearance));
  };
  G.events.on("reset", () => {
    appearance = null;
  });
  G.events.on("newGame", (opts) => {
    if (opts && opts.appearance) X.applyAppearance(opts.appearance);
  });

  G.save.register("ui_interact", {
    save: () => ({
      dialogue: X.dialogue.save(),
      terminals: X.terminal.save(),
      appearance,
    }),
    load: (d) => {
      if (!d) return;
      X.dialogue.load(d.dialogue);
      X.terminal.load(d.terminals);
      if (d.appearance) X.applyAppearance(d.appearance);
    },
  });

  // ------------------------------------------------------------------
  // Render gate. The intro and the teletype terminals are fully opaque, so drawing the whole city behind them is wasted GPU
  // time (it was pinning weak machines at ~1 fps during the intro). While
  // one of them is up we skip the world render entirely and publish
  // G.renderPaused = true so other modules can skip render-only work too.
  // We wrap whatever G.render is at init time (it already honours
  // atmosphere's G.renderHook at call time), so post-processing is kept.
  // ------------------------------------------------------------------
  function opaqueUp() {
    try {
      const it = intro();
      return (
        (it.isOpaque ? it.isOpaque() : it.isActive()) ||
        (G.terminals && G.terminals.isOpen && G.terminals.isOpen())
      );
    } catch (e) {
      return false;
    }
  }
  function installRenderGate() {
    const orig = G.render;
    if (typeof orig !== "function" || orig._uixGate) return;
    const gated = function () {
      if (G.renderPaused) return undefined; // last world frame stays on the canvas under the opaque screen
      return orig.apply(this, arguments);
    };
    gated._uixGate = true;
    G.render = gated;
    gateInstalls++;
  }
  G.renderPaused = false;
  let gateInstalls = 0;

  // ------------------------------------------------------------------
  // Headless locks audit: ?locksaudit=1 (problems only) or ?locksaudit=all.
  // Writes <pre id="locks-audit">LOCKS_AUDIT_BEGIN{json}LOCKS_AUDIT_END</pre>
  // 30 frames after newGame and 30 frames after every load (see NOTES.md).
  // ------------------------------------------------------------------
  let auditIn = -1;
  function writeLocksAudit() {
    try {
      const all = QS.get("locksaudit") === "all";
      const res = {
        summary: G.locks.auditSummary(),
        locks: G.locks.audit({ problemsOnly: !all }),
        unconverted: G.locks.unconverted(),
      };
      let pre = document.getElementById("locks-audit");
      if (!pre) {
        pre = document.createElement("pre");
        pre.id = "locks-audit";
        pre.style.display = "none";
        document.body.appendChild(pre);
      }
      pre.textContent =
        "LOCKS_AUDIT_BEGIN" + JSON.stringify(res) + "LOCKS_AUDIT_END";
    } catch (e) {
      G.reportError("locks:audit", e);
    }
  }
  if (QS.has("locksaudit")) {
    G.events.on("newGame", () => {
      auditIn = 30;
    });
    G.events.on("loaded", () => {
      auditIn = 30;
    }); // after the cell's NPCs / quest pickups are back (key holders, teaching notes)
  }

  let lastWall = 0;
  G.registerModule({
    name: "ui_interact",
    order: 70,
    init() {
      if (G.DEBUG || G.SHOT) registerDemoContent();
      installRenderGate();
    },
    update(dt, realDt) {
      // The core clamps realDt to 0.1 s, so on a struggling machine (a few fps while the world renders
      // behind an opaque screen) timed presentation - the intro typewriter/slides and terminal printing -
      // would crawl. Those use wall-clock time (capped at 1 s so a background tab doesn't skip ahead).
      // Scripted runs (smoke/shot drive frames with G._step) keep the engine's deterministic dt.
      const now = performance.now();
      let wall = realDt;
      if (!G.SMOKE && !G.SHOT && lastWall)
        wall = Math.max(realDt, Math.min(1.0, (now - lastWall) / 1000));
      lastWall = now;
      X.terminal.update(wall);
      intro().update(wall);
      if (auditIn > 0 && --auditIn === 0) writeLocksAudit();
      // decide for this frame's render (G.render runs after every module's update/lateUpdate)
      G.renderPaused = opaqueUp();
      if (G.render && !G.render._uixGate && gateInstalls < 3)
        installRenderGate(); // G.render was replaced after us: re-wrap (bounded)
    },
    lateUpdate(dt, realDt) {
      X.dialogue.lateUpdate(realDt);
    },
  });

  // ------------------------------------------------------------------
  // Demo content (debug / screenshot harness only)
  // ------------------------------------------------------------------
  function registerDemoContent() {
    G.locks.register({
      id: "uix_demo_records",
      label: "Records Room",
      code: "4719",
      kind: "door",
      hint: "demo: taught by the stall registry terminal",
    });
    G.locks.register({
      id: "uix_demo_ledger",
      label: "Ledger Terminal",
      passcode: "MARIGOLD",
      kind: "terminal",
      hint: "demo: taught by Mags",
    });
    G.dialogue.register("uix_demo", {
      start: "hello",
      nodes: {
        hello: {
          text: "Well, look what crawled out of the park. Name's Mags. I run the best scrap stall in Grand Central, and the only one that doesn't short its customers. Much.",
          responses: [
            { text: "Show me what you're selling.", barter: true },
            {
              text: "You look like you could use a steady customer. Knock a little off for me.",
              check: { skill: "persuasion", value: 60 },
              next: "hello",
              failNext: "hello",
            },
            {
              text: "That generator of yours is wired backwards. I could fix it.",
              check: { skill: "mechanics", value: 40 },
              next: "hello",
              failNext: "hello",
            },
            {
              text: "Tell me about the Neon.",
              check: { attr: "wits", value: 7 },
              next: "hello",
            },
            { text: "What's the password on the ledger machine?", next: "pw" },
            {
              text: "Hand over your scrip, or I take it.",
              standing: -10,
              next: "hello",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        pw: {
          text: "Marigold. My mother's flower. Don't make me regret it.",
          learn: "uix_demo_ledger",
          responses: [{ text: "Thanks.", next: "hello" }],
        },
      },
    });
    G.terminals.register("uix_demo", {
      title: "Grand Central -- Stall Registry",
      header:
        'MARKET COUNCIL RECORDS\n"KEEPING THE CONCOURSE HONEST SINCE 1913"',
      entries: [
        {
          title: "Stall Assignments",
          text: 'TRACK 17: MAGS -- SALVAGE & SCRAP\nTRACK 19: DOC FERRIS -- MEDICINE\nTRACK 23: "UNCLE" SAL -- FOOD & WATER\n\nAll stall holders pay the Market Council ten scrip a week. No exceptions. Yes, Sal, that means you.',
        },
        {
          title: "Security Log",
          entries: [
            {
              title: "Entry 0431",
              text: "Maniacs spotted in the 42nd Street tunnels again. Doubled the guard on the east ramp.",
            },
            {
              title: "Entry 0432",
              text: "Records room combination changed to 4719. Burn this after reading. (Nobody ever does.)",
              learn: "uix_demo_records",
            },
          ],
        },
        {
          title: "Disable Turrets",
          action: () => "TURRET NETWORK STATUS: OFFLINE",
        },
      ],
    });
    G.terminals.register("uix_demo_locked", {
      title: "Market Council -- Ledger",
      lock: { id: "uix_demo_ledger", passcode: "MARIGOLD" },
      entries: [
        {
          title: "Ledger 1989",
          text: "TAKINGS ARE DOWN. SAL SAYS IT IS THE WEATHER. SAL SAYS A LOT OF THINGS.",
        },
      ],
    });
  }

  let demoDone = false;
  function demoPending(s) {
    if (demoDone || !G.SHOT || !QS.get("uidemo")) return false;
    const want = {
      dialogue: "dialogue",
      barter: "barter",
      container: "container",
      terminal: "terminal",
      passcode: "terminal",
      keypad: "keypad",
      intro: "chargen",
      chargen: "chargen",
    }[QS.get("uidemo")];
    return want === s;
  }
  function demoActor() {
    const P = G.player;
    const fx = -Math.sin(P.yaw),
      fz = -Math.cos(P.yaw);
    const pos = { x: P.pos.x + fx * 1.6, y: P.pos.y, z: P.pos.z + fz * 1.6 };
    const stock = [
      ["rally_tonic", 4],
      ["prussian_blue", 2],
      ["fizzo_cola", 6],
      ["ammo_10mm", 60],
      ["golden_plain_jerky", 3],
    ];
    let actor = null;
    try {
      if (X.live("actors"))
        actor = G.actors.spawn({
          type: "human",
          name: "Mags",
          faction: "settlers",
          outfit: "merchant",
          gender: "f",
          pos,
          yaw: P.yaw + Math.PI,
          ai: "static",
          hostile: false,
          merchant: { scrip: 340, stock: stock.map((e) => e.slice()) },
        });
    } catch (e) {
      G.reportError("uix:demoActor", e);
    }
    if (!actor)
      actor = {
        name: "Mags",
        type: "human",
        pos: new window.THREE.Vector3(pos.x, pos.y, pos.z),
        height: 1.75,
      };
    if (!actor.merchant)
      actor.merchant = { scrip: 340, stock: stock.map((e) => e.slice()) };
    return actor;
  }
  function runDemo() {
    demoDone = true;
    const d = QS.get("uidemo"),
      step = QS.get("uistep") || "";
    try {
      // give the player a few things to show
      [
        ["rally_tonic", 3],
        ["scrip", 150],
        ["fizzo_cola", 2],
        ["tin_can", 4],
      ].forEach(([id, n]) => X.invAdd(id, n));
      if (d === "dialogue") {
        G.dialogue.start("uix_demo", demoActor());
        if (step) {
          // uistep=N → pick reply N (1-based) after the open guard, e.g. 2 = the [Persuasion] check
          for (let i = 0; i < 12; i++) G._step(1 / 30);
          const top = X.screens[X.screens.length - 1];
          if (top && top.onKey) top.onKey("Digit" + Number(step));
          for (let i = 0; i < 12; i++) G._step(1 / 30);
        }
      } else if (d === "barter") {
        const a = demoActor();
        G.barter.open(a);
      } else if (d === "container" && step === "pick")
        G.ui.openContainer({
          name: "Mags",
          pickpocket: true,
          owner: "settlers",
          actor: { name: "Mags" },
          items: new Map([
            ["scrip", 43],
            ["rally_tonic", 1],
            ["fizzo_cola", 2],
            ["ammo_10mm", 12],
          ]),
        });
      else if (d === "container")
        G.ui.openContainer({
          name: "Footlocker",
          owner: step === "owned" ? "settlers" : null,
          items: new Map([
            ["rally_tonic", 2],
            ["scrip", 37],
            ["ammo_10mm", 24],
            ["tin_can", 1],
            ["homeguard_cleanser", 1],
          ]),
        });
      else if (d === "terminal")
        G.terminals.open("uix_demo", { skipBoot: !step });
      else if (d === "passcode") {
        if (step === "known") G.locks.learn("uix_demo_ledger", "demo");
        G.terminals.open("uix_demo_locked", { skipBoot: true });
        for (let i = 0; i < 40; i++) G._step(1 / 30);
        if (step === "wrong") X._termType("BUTTERCUP");
      } else if (d === "keypad") {
        if (step === "known") G.locks.learn("uix_demo_records", "demo");
        G.locks.open("uix_demo_records", () => {});
        if (step === "typed" || step === "wrong")
          X._keypadType(step === "wrong" ? "1234\n" : "47");
      } else if (d === "intro" && X.intro) {
        X.intro.play(() => {}, { start: Number(step || 1) });
        for (let i = 0; i < 3; i++) G._step(1 / 30);
        if (X._introChars) X._introChars(99999);
      }
    } catch (e) {
      G.reportError("uix:demo", e);
    }
  }
})();
