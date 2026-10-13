// play-inline-195 08 — ctx
// Lines 2791-2879 of readable/play-inline-195.pretty.js (statement-aligned).
  function moveFreedToVanguard(ctx) {
    ctx.prisonersMoved = true;
    const yard = PV.anchor("vanguard", "yard");
    if (!yard) return;
    PRISONERS.forEach((p, i) => {
      const old =
        !G.isStub("actors") && G.actors.get ? G.actors.get(p.id) : null;
      if (old && G.actors.remove)
        K.safe("rm prisoner", () => G.actors.remove(old));
      PV.spawnActor(ctx, {
        id: p.id + "_vv",
        type: "human",
        gender: p.gender,
        outfit: p.outfit,
        name: p.name,
        faction: "settlers",
        level: 3,
        pos: { x: yard.x + i * 1.5, y: 0, z: yard.z + 2 },
        ai: "wander",
        home: "here",
        homeR: 5,
        dialogue: p.id === "pv_prisoner_rosa" ? "pv_dlg_rosa" : undefined,
        barks: [p.bark, "Free air. Nothing like it."],
      });
    });
  }
  let ltT = 0;
  function update(dt, realDt, ctx) {
    // combat promotes one of the location's raiders to a generic 'Raider Boss'; Maddox is the Tombs' boss, so that one
    // becomes his turnkey (named lieutenant, keeps the combat buffs)
    ltT -= realDt || dt || 0;
    if (ctx.inside && ltT <= 0 && !G.isStub("actors") && G.actors.list) {
      ltT = 1;
      K.safe("tombs_lt", () => {
        for (const a of G.actors.list())
          if (
            a &&
            !a.dead &&
            a.name === "Raider Boss" &&
            a.pos &&
            Math.abs(a.pos.x - ctx.O.x) < 160 &&
            Math.abs(a.pos.z - ctx.O.z) < 160
          )
            a.name = "Turnkey Rourke";
      });
    }
    for (const d of cellDoors)
      if (d.open && d.t < 1) {
        d.t = Math.min(1, d.t + dt * 0.8);
        d.group.position.z = d.z0 - 1.1 * d.t;
      }
    // freed this session: they walk out while you're inside; by the time you're back on the street they're at the Vanguard
    if (
      !ctx.inside &&
      !ctx.prisonersMoved &&
      PV.flag("tombs_prisoners") === "freed"
    )
      K.safe("tombs_move", () => moveFreedToVanguard(ctx));
    // quest start when the player walks into Block C
    const p = G.player && G.player.pos;
    if (
      p &&
      ctx.inside &&
      !PV.flag("tombs_prisoners") &&
      !K.q.started("pv_jailbreak")
    ) {
      const lx = p.x - ctx.O.x,
        lz = p.z - ctx.O.z;
      if (lz < -14 && lz > -42 && Math.abs(lx) < 10 && p.y < ctx.O.y + 2)
        K.q.start("pv_jailbreak");
    }
  }

  PV.define({
    id: "tombs",
    name: "The Tombs",
    interior: "tombs",
    order: 50,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
    reset(ctx) {
      ctx.prisonersMoved = false;
    },
  });
