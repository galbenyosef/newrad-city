// play-inline-3 07 — player
// Lines 1993-2038 of readable/play-inline-3.pretty.js (statement-aligned).
  function runShot() {
    const v = G.SHOT.split(",").map(Number);
    G.newGame({ name: "Shot", skipIntro: true });
    if (QS.has("hour")) G.time.hour = Number(QS.get("hour"));
    G.player.teleport(v[0], v[1] || 0, v[2], v[3] || 0);
    G.player.pitch = v[4] || 0;
    G.player.fly = true;
    G.player.pos.y = v[1] || 0;
    if (QS.get("state")) G.setState(QS.get("state"));
    if (QS.get("nohud")) {
      const st = document.createElement("style");
      st.textContent = "#ui-root,#cheat-badge{display:none!important}";
      document.head.appendChild(st);
    } // screenshot-only: clean frame for mockups
    if (QS.get("tp") === "1" && G.player.setThirdPerson)
      G.player.setThirdPerson(true);
    for (let f = 0; f < 45; f++) {
      step(1 / 30);
      // discovery XP can pop the level-up screen over a world shot: close it (shot mode only)
      if (
        !QS.get("state") &&
        (G.state === "levelup" || G.state === "dialogue") &&
        G.player.alive
      )
        G.setState("play");
    }
    G.player.pos.y = v[1] || 0;
    step(1 / 30);
    document.title = "SHOT_READY";
    const pre = document.createElement("pre");
    pre.id = "smoke-result";
    pre.style.display = "none";
    pre.textContent =
      SMOKE_B +
      JSON.stringify({
        errors: G.errors.slice(0, 40),
        calls: G.renderer.info.render.calls,
        tris: G.renderer.info.render.triangles,
      }) +
      SMOKE_E;
    document.body.appendChild(pre);
  }

  window.addEventListener("load", () => {
    boot().catch((e) => G.reportError("boot", e));
  });
