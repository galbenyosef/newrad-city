// play-inline-621 02 — step
// Lines 359-483 of readable/play-inline-621.pretty.js (statement-aligned).
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
