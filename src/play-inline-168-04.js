// play-inline-168 04 — giver
// Lines 410-679 of readable/play-inline-168.pretty.js (statement-aligned).
  G.poiQuestWalk = async function (opts) {
    opts = opts || {};
    const ids = opts.ids || DEFAULT_IDS,
      maxIter = opts.maxIter || 24;
    const report = [];
    // test harness: god mode, skills and attributes maxed, scrip
    try {
      if (G.cheat) G.cheat.god = true;
    } catch (e) {
      /* ignore */
    }
    const skill0 = G.rpg && G.rpg.skill,
      attr0 = G.rpg && G.rpg.attr;
    try {
      if (G.rpg) {
        G.rpg.skill = () => 100;
        if (typeof attr0 === "function") G.rpg.attr = () => 10;
      }
    } catch (e) {
      /* ignore */
    }
    try {
      if (G.inventory && G.inventory.addScrip) G.inventory.addScrip(5000);
    } catch (e) {
      /* ignore */
    }
    // modal helpers answer themselves: confirmations say yes, every lock opens (as if its key or code were known;
    // the locks audit separately proves each key / code is obtainable in the world)
    const confirm0 = G.ui && G.ui.confirm,
      lo0 = G.locks && G.locks.open;
    try {
      if (G.ui && !G.isStub("ui")) G.ui.confirm = () => Promise.resolve(true);
    } catch (e) {
      /* ignore */
    }
    try {
      if (G.locks && !G.isStub("locks"))
        G.locks.open = (spec, ok) => {
          try {
            const id = typeof spec === "string" ? spec : spec && spec.id;
            if (id && G.locks.unlock) G.locks.unlock(id);
          } catch (e) {
            /* ignore */
          }
          try {
            ok && ok();
          } catch (e) {
            /* ignore */
          }
          return true;
        };
    } catch (e) {
      /* ignore */
    }
    for (const id of ids) {
      const log = [],
        path = [];
      let res = "inactive";
      if (!G.quests || !G.quests.get || !G.quests.get(id)) {
        report.push({ id, result: "undefined" });
        continue;
      }
      // start it the way a player would: talk to the giver (if the quest has one and they are around)
      if (status(id) === "inactive") {
        let giver = null;
        try {
          const v = G.quests.get(id);
          const gn = v && (v.giver || (v.def && v.def.giver));
          if (gn)
            giver = G.actors
              .list()
              .find(
                (a) =>
                  a &&
                  !a.dead &&
                  a.name &&
                  (a.name === gn ||
                    a.name.indexOf(gn) >= 0 ||
                    gn.indexOf(a.name) >= 0),
              );
        } catch (e) {
          /* ignore */
        }
        if (giver) {
          const gp = { x: giver.pos.x, y: giver.pos.y, z: giver.pos.z };
          tp(gp, gp);
          await pump(400);
          log.push(" giver " + giver.name);
          for (let k = 0; k < 4 && status(id) === "inactive"; k++)
            await actAt(id, gp, log, sig(id), true);
        }
        if (status(id) === "inactive") {
          log.push(" (forced start)");
          try {
            G.quests.start(id);
          } catch (e) {
            log.push("! start " + e);
          }
        }
      }
      let stuck = 0,
        iter = 0;
      const visitedDoors = new Set();
      let lingered = false;
      while (iter++ < maxIter) {
        const s = status(id);
        if (s === "complete" || s === "failed") {
          res = s;
          break;
        }
        const stage = st(id);
        if (path[path.length - 1] !== stage) path.push(stage);
        let ms = [];
        try {
          ms = G.quests
            .activeMarkers(true)
            .filter((m) => m.questId === id || m.quest === id);
        } catch (e) {
          /* ignore */
        }
        log.push(
          "[" + stage + "] markers " + ms.map((m) => m.label || "?").join(", "),
        );
        const before = sig(id);
        let progressed = false;
        let entered = false;
        for (const m of ms) {
          const p = markerPos(m);
          // an objective marker on a building's street door → walk in through that door (markers then resolve in-cell)
          if (p.x < G.LAYOUT.INTERIOR_X_MIN) {
            const d = (G.world.doors || [])
              .filter((q) => !q._barred)
              .map((q) => q.def || q)
              .find(
                (f) =>
                  f.pos &&
                  f.target &&
                  f.target.x >= G.LAYOUT.INTERIOR_X_MIN &&
                  Math.hypot(f.pos.x - p.x, f.pos.z - p.z) < 7 &&
                  !(
                    f.locked > 0 &&
                    f.id &&
                    /rose|service|manhole|bay_in|courts/i.test(f.id)
                  ),
              );
            if (d && !visitedDoors.has(d)) {
              visitedDoors.add(d);
              G.player.teleport(
                d.target.x,
                (d.target.y || 0) + 0.05,
                d.target.z,
                d.target.yaw || 0,
              );
              // a real door use also runs the door's onEnter hook (discovery, quest progress on entry)
              try {
                if (typeof d.onEnter === "function") d.onEnter();
                G.events.emit("doorTransition", d);
              } catch (e) {
                log.push(" ! door onEnter " + e);
              }
              await pump(500);
              log.push(" enter " + (d.label || d.id || "door"));
              entered = true;
              break;
            }
          }
          const s2 = tp(p, p);
          await pump(450);
          log.push(
            " at " +
              (m.label || "?") +
              " (" +
              p.x.toFixed(1) +
              "," +
              p.y.toFixed(1) +
              "," +
              p.z.toFixed(1) +
              ") stood " +
              s2.x.toFixed(1) +
              "," +
              s2.y.toFixed(1) +
              "," +
              s2.z.toFixed(1),
          );
          if (await actAt(id, p, log, before)) {
            progressed = true;
            break;
          }
        }
        if (entered) continue;
        if (!progressed) {
          // fallback: some stages are handed in / kicked off by the quest giver (e.g. "tell Mickey you're ready")
          const v = G.quests.get(id),
            gn = v && v.giver;
          const giver =
            gn &&
            G.actors
              .list()
              .find(
                (a) =>
                  a &&
                  !a.dead &&
                  a.name &&
                  (a.name === gn ||
                    a.name.indexOf(gn) >= 0 ||
                    gn.indexOf(a.name) >= 0),
              );
          if (giver && stuck === 0) {
            const gp = { x: giver.pos.x, y: giver.pos.y, z: giver.pos.z };
            tp(gp, gp);
            await pump(300);
            log.push(" back to giver " + giver.name);
            if (await actAt(id, gp, log, before, true)) {
              stuck = 0;
              visitedDoors.clear();
              continue;
            }
          }
          // some objectives just take time (a concert, a countdown): linger ~55 s of game time once before giving up
          if (stuck === 0 && !lingered) {
            lingered = true;
            log.push(" linger");
            const n = 280;
            for (let i = 0; i < n && sig(id) === before; i++) {
              try {
                G._step(0.2);
              } catch (e) {
                /* */
              }
              if (i % 20 === 19) await sleep(0);
            }
            if (sig(id) !== before) {
              stuck = 0;
              continue;
            }
          }
          if (++stuck >= 2) {
            res = "stuck@" + stage;
            break;
          }
        } else {
          stuck = 0;
          visitedDoors.clear();
        }
      }
      if (res === "inactive")
        res = status(id) === "complete" ? "complete" : "timeout@" + st(id);
      report.push({
        id,
        result: res,
        path,
        log: opts.verbose ? log : log.slice(-14),
      });
    }
    try {
      if (G.rpg) {
        G.rpg.skill = skill0;
        if (attr0) G.rpg.attr = attr0;
      }
    } catch (e) {
      /* ignore */
    }
    try {
      if (confirm0) G.ui.confirm = confirm0;
      if (lo0) G.locks.open = lo0;
    } catch (e) {
      /* ignore */
    }
    return report;
  };
