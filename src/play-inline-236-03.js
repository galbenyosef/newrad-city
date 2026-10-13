// play-inline-236 03 — math
// Lines 349-481 of readable/play-inline-236.pretty.js (statement-aligned).
  try {
    if (G.save && typeof G.save.register === "function") {
      G.save.register("landmark_interiors", {
        save() {
          const o = {};
          for (const k in LI.saveHooks) {
            try {
              o[k] = LI.saveHooks[k].save();
            } catch (e) {
              /* */
            }
          }
          return o;
        },
        load(d) {
          d = d || {};
          for (const k in LI.saveHooks) {
            try {
              LI.saveHooks[k].load(d[k]);
            } catch (e) {
              G.reportError("landmark_interiors:load " + k, e);
            }
          }
        },
      });
    }
  } catch (e) {
    /* core without save */
  }
  LI.resetFns.push(() => {
    for (const k in LI.saveHooks) {
      try {
        if (LI.saveHooks[k].reset) LI.saveHooks[k].reset();
      } catch (e) {
        /* */
      }
    }
  });

  // ------------------------------------------------------------------
  // Per-frame: interior visibility (only the cell the player/camera is in) + animators
  // ------------------------------------------------------------------
  const _cp = new THREE.Vector3();
  let t = 0,
    bakeT = 0,
    bakeNext = null,
    bakeD = 1e9,
    shaftT = 0;
  /** Doors whose target lies in one of our cells (world entrances, elevators, loops): {pos, C}. */
  let doorsInto = null;
  function nearestUnlit() {
    if (!doorsInto) {
      doorsInto = [];
      for (const D of LI.cells.concat(LI.worldCells || []))
        for (const d of D.doors) {
          const tg = d.target;
          if (!tg || !d.pos) continue;
          const C = LI.cells.find(
            (c) => Math.abs(tg.x - c.O.x) < 170 && Math.abs(tg.z - c.O.z) < 170,
          );
          if (C) doorsInto.push({ pos: d.pos, C });
        }
    }
    const P = G.player && G.player.pos;
    let best = null;
    bakeD = 1e9;
    for (const e of doorsInto) {
      if (e.C.lit) continue;
      const d = P
        ? Math.hypot(P.x - e.pos.x, P.z - e.pos.z) +
          Math.abs(P.y - e.pos.y) * 0.5
        : 0;
      if (d < bakeD) {
        bakeD = d;
        best = e.C;
      }
    }
    if (!best) best = LI.cells.find((c) => !c.lit) || null;
    return best;
  }
  function update(dt, realDt) {
    t += realDt;
    const P = G.player && G.player.pos;
    if (G.camera) G.camera.getWorldPosition(_cp);
    for (const C of LI.cells) {
      const inP =
        P && Math.abs(P.x - C.O.x) < 170 && Math.abs(P.z - C.O.z) < 170;
      const inC =
        Math.abs(_cp.x - C.O.x) < 170 && Math.abs(_cp.z - C.O.z) < 170;
      const vis = !!(inP || inC);
      if (vis && !C.lit) C.lit = LI.bakeCell(C); // entering an unlit cell: finish its bake now
      if (C.root.visible !== vis) C.root.visible = vis;
      C.active = vis;
    }
    // background baking, nearest cell first: the unlit cell with a door (into it) closest to the player gets the
    // slice; approaching such a door (or aiming at it) raises the budget so the bake is done before the fade ends
    bakeT -= realDt;
    if (bakeT <= 0 || !bakeNext || bakeNext.lit) {
      bakeT = 0.5;
      bakeNext = nearestUnlit();
    }
    if (bakeNext) {
      const f = G.world && G.world.focus,
        fd = f && f.def && f.def.target;
      const focusIn =
        fd &&
        Math.abs(fd.x - bakeNext.O.x) < 170 &&
        Math.abs(fd.z - bakeNext.O.z) < 170;
      bakeNext.lit = LI.bakeCell(bakeNext, focusIn ? 14 : bakeD < 18 ? 8 : 3);
    }
    if (LI.dustTick) LI.dustTick(t);
    shaftT -= realDt;
    if (shaftT <= 0 && LI.shaftTick) {
      shaftT = 0.25;
      try {
        LI.shaftTick();
      } catch (e) {
        /* optional */
      }
    }
    for (const a of LI.animators) {
      if (a.cell && !a.cell.active) continue;
      try {
        a.fn(dt, t, realDt);
      } catch (e) {
        G.reportError("update:landmark_interiors", e);
        LI.animators.splice(LI.animators.indexOf(a), 1);
        break;
      }
    }
  }

  G.registerModule({ name: "landmark_interiors", order: 29.8, init, update });
