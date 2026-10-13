// play-inline-74 05 — rec
// Lines 969-1073 of readable/play-inline-74.pretty.js (statement-aligned).
  function update(dt, realDt) {
    // explicit async jobs
    for (let i = jobs.length - 1; i >= 0; i--) {
      const j = jobs[i];
      if (j.cancelled) {
        jobs.splice(i, 1);
        j.done = true;
        continue;
      }
      if (runState(j.st, j.ms)) {
        j.done = true;
        j.result = result(j.st);
        jobs.splice(i, 1);
      }
    }
    if (!RL.autoBake || !B_ready || !G.scene || !G.LAYOUT || !G.world) return;
    const cam = G.camera;
    const inside = R.interior();
    const sync = !!(G.SHOT || G.SURVEY);
    try {
      // the player's cell first
      if (inside && cam) {
        const c = cellAt(cam.position.x, cam.position.z);
        if (c) {
          const rec = startCell(c);
          if (rec.state === "running") {
            if (runState(rec.st, sync ? 1e9 : 6)) finishCell(rec);
            return;
          }
        }
      }
      // background: one queued cell at a time, only while a UI pauses the game, never in the first seconds
      bgT += realDt || 0.016;
      if (sync || bgT < 4 || !bgAllowed()) return;
      let rec = null;
      for (const r of cells.values())
        if (r.state === "running") {
          rec = r;
          break;
        }
      if (!rec) {
        for (const c of cellList()) {
          const r0 = cells.get(c.key);
          if (!r0 || r0.state === "queued") {
            rec = startCell(c);
            if (rec.state === "running") break;
            rec = null;
          }
        }
      }
      if (rec && rec.state === "running" && runState(rec.st, 5))
        finishCell(rec);
    } catch (e) {
      G.reportError("update:render_lighting/autobake", e);
    }
  }
  function finishCell(rec) {
    const st = rec.st;
    for (const w of st.pending) {
      try {
        applyWork(w, st);
      } catch (e) {
        G.reportError("render_lighting/autobake-apply", e);
      }
    }
    st.pending.length = 0;
    rec.res = result(st);
    rec.state = "done";
    rec.st = null;
    G.events.emit &&
      G.events.emit("rlightInteriorBaked", { key: rec.key, result: rec.res });
  }
  let B_ready = false;
  RL.setAutoBake = function (on) {
    RL.autoBake = !!on;
    try {
      localStorage.setItem("nrc_rl_bake", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
  };
  RL.bakeInfo = () => {
    const o = {};
    for (const r of cells.values())
      o[r.key] = {
        state: r.state,
        lamps: r.lamps,
        prepMs: r.prepMs,
        res:
          r.res ||
          (r.st ? { progress: r.st.li + "/" + r.st.list.length } : null),
      };
    return { auto: RL.autoBake, jobs: jobs.length, cells: o };
  };

  R.addSystem({
    name: "bake",
    order: 30,
    update,
    init() {
      G.events.on("initDone", () => {
        B_ready = true;
      });
    },
  });
