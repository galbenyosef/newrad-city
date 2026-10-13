// play-inline-544 07 — world
// Lines 1993-2049 of readable/play-inline-544.pretty.js (statement-aligned).
  WORLD.update = function (dt) {
    if (!M || !WORLD.entries.length) return;
    WORLD.t += dt;
    const t = WORLD.t;
    M.glint.opacity = 0.35 + Math.max(0, Math.sin(t * 1.7)) * 0.4;
    const P = G.player && G.player.pos;
    if (!P) return;
    let near = null,
      nd = LIVE_R2;
    for (const e of WORLD.entries) {
      const dx = e.x - P.x,
        dz = e.z - P.z,
        d2 = dx * dx + dz * dz;
      if (e.kind === "cabinet") {
        if (d2 < nd) {
          nd = d2;
          near = e;
        }
        continue;
      } // within 10 m: never distance-culled
      if (!e.item.visible || !e.root.visible || d2 > 900) continue;
    }
    // swap the live screen onto the nearest cabinet
    if (near !== WORLD.live) {
      if (WORLD.live && WORLD.live.screen)
        WORLD.live.screen.material = M.screen[WORLD.live.game];
      WORLD.live = near;
      WORLD.liveHolder = { inst: null, t: 0 };
      WORLD.liveDt = LIVE_DT;
      if (near && near.screen) near.screen.material = M.screenLive;
    }
    if (!near) return;
    WORLD.liveDt += dt;
    if (WORLD.liveDt < LIVE_DT) return;
    try {
      AR.renderAttract(
        WORLD.liveHolder,
        near.game,
        WORLD.liveDt,
        WORLD.liveCtx,
        WORLD.liveCanvas.width,
        WORLD.liveCanvas.height,
      );
      M.screenLive.map.needsUpdate = true;
    } catch (e) {
      G.reportError("arcade:liveScreen", e);
    }
    WORLD.liveDt = 0;
  };

  G.events.on("initDone", () => {
    try {
      place();
    } catch (e) {
      G.reportError("arcade:place", e);
    }
  });
