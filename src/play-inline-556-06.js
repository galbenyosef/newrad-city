// play-inline-556 06 — rec
// Lines 1664-1957 of readable/play-inline-556.pretty.js (statement-aligned).
  function destFor(rec, act) {
    const def = rec.def;
    switch (act) {
      case "work":
        return Object.assign({}, rec.post, {
          mode: def.ai === "wander" ? "static" : def.ai,
          r: 1.2,
        });
      case "perform":
        return Object.assign({}, rec.post, {
          mode: "static",
          r: 1,
          perform: true,
        });
      case "sleep": {
        const b = freeBunk(rec);
        return b
          ? Object.assign({}, b, { mode: "sit", r: 0.8, sleep: true })
          : null;
      }
      case "barracks": {
        // off-shift Neon Guards sleep in the barracks bunks (subway kiosk), not the Bunkhouse
        const d = randomOf(nums("barracks_bunk_", 4), null);
        if (d) return Object.assign(d, { mode: "sit", r: 0.8, sleep: true });
        const b = freeBunk(rec);
        return b
          ? Object.assign({}, b, { mode: "sit", r: 0.8, sleep: true })
          : null;
      }
      case "eat": {
        // queue at an OPEN food stall (Sato's noodles, Bev's grill, the hot-dog cart), face the counter, eat, move on
        const d =
          stallVisit(FOOD_STALLS, true) || stallVisit(FOOD_STALLS, false);
        if (d)
          return Object.assign(d, {
            mode: "static",
            r: 1,
            repick: 45,
            eating: true,
          });
        return destFor(rec, "shop");
      }
      case "shop": {
        // market life: browse at a stall counter (facing the trader) or mill about the plaza
        if (Math.random() < 0.65) {
          const d = stallVisit(
            nums("", 12)
              .map(Number)
              .filter((n) => FOOD_STALLS.indexOf(n) < 0),
            true,
          );
          if (d) return Object.assign(d, { mode: "static", r: 1, repick: 35 });
        }
        const d = randomOf(nums("crowd_", 20), {
          near: ["merchant1", "plaza", "center"],
          dx: 2,
          dz: 2,
          spread: 14,
        });
        return d && Object.assign(d, { mode: "wander", r: 3.5, repick: 70 });
      }
      case "drink": {
        const d = randomOf(
          nums("radroom_patron_", 6).concat([
            "bar_patron",
            "rad_room",
            "radroom_bar",
          ]),
          { near: ["bar_patron", "bar", "rad_room"], dx: 0, dz: 0, spread: 5 },
        );
        return d && Object.assign(d, { mode: "static", r: 1, repick: 240 });
      }
      case "show": {
        const d = randomOf(nums("opry_seat_", 12), {
          near: ["stage", "singer"],
          dx: 0,
          dz: 6,
          spread: 7,
        });
        return (
          d &&
          Object.assign(d, {
            mode: d.real ? "sit" : "static",
            r: 0.8,
            faceStage: !d.real,
          })
        );
      }
      case "party": {
        const d = randomOf(
          ["screen_view", "plaza_centre", "ball_base"].concat(
            nums("crowd_", 20),
          ),
          {
            near: ["plaza_centre", "center", "plaza"],
            dx: 0,
            dz: 0,
            spread: 16,
          },
        );
        return d && Object.assign(d, { mode: "wander", r: 4, repick: 90 });
      }
      case "bench": {
        const d = randomOf(nums("bench_", 8), {
          near: ["plaza", "totem", "center"],
          dx: 0,
          dz: 0,
          spread: 12,
        });
        return (
          d &&
          Object.assign(d, {
            mode: d.real ? "sit" : "wander",
            r: d.real ? 0.8 : 3,
          })
        );
      }
      case "depot": {
        const d = randomOf(
          [
            "ox_pen",
            "convoy_park_1",
            "convoy_park_2",
            "convoy_park_3",
            "convoy_arrive",
          ],
          {
            near: ["convoy_master", "entrance_south", "subway"],
            dx: -4,
            dz: 3,
            spread: 8,
          },
        );
        return d && Object.assign(d, { mode: "wander", r: 4, repick: 120 });
      }
      case "gather":
        return town.gather
          ? Object.assign({}, town.gather.at(rec), { mode: "static", r: 1.5 })
          : null;
      default:
        return null;
    }
  }

  // ------------------------------------------------------------------
  // Scheduler (2 Hz, staggered)
  // ------------------------------------------------------------------
  function busy(a) {
    return (
      !a ||
      a.dead ||
      a.removed ||
      a.talking ||
      a.inCombat ||
      a.knockedOut ||
      a.following ||
      ["combat", "flee", "cower", "search", "knocked", "follow"].indexOf(
        a.state,
      ) >= 0
    );
  }
  function observed(x, y, z) {
    const P = G.player;
    if (!P) return false;
    if (isInt(P.pos.x) !== isInt(x)) return false;
    const dx = x - P.pos.x,
      dz = z - P.pos.z,
      d = Math.hypot(dx, dz);
    if (d < 18) return true;
    if (d > 90) return false;
    const f = P.forward || { x: -Math.sin(P.yaw), z: -Math.cos(P.yaw) };
    return (dx * f.x + dz * f.z) / (d || 1) > 0.45;
  }
  function findDoor(fromPos, dest) {
    const wantIn = isInt(dest.x);
    let best = null,
      bd = 1e9;
    for (const d of L.doors()) {
      const p = d.def && d.def.pos,
        t = d.def && d.def.target;
      if (!p || !t) continue;
      if (isInt(p.x) === wantIn || isInt(t.x) !== wantIn) continue;
      const dd =
        Math.hypot(t.x - dest.x, t.z - dest.z) +
        Math.hypot(p.x - fromPos.x, p.z - fromPos.z);
      if (
        Math.hypot(t.x - dest.x, t.z - dest.z) > 90 ||
        Math.hypot(p.x - fromPos.x, p.z - fromPos.z) > 160
      )
        continue;
      if (dd < bd) {
        bd = dd;
        best = {
          from: { x: p.x, y: p.y || 0, z: p.z },
          to: { x: t.x, y: t.y || 0, z: t.z },
        };
      }
    }
    return best;
  }
  function place(a, p) {
    const y = G.world.groundHeight(p.x, p.z, (p.y || 0) + 0.6, 0.3);
    a.pos.set(p.x, isFinite(y) ? y : p.y || 0, p.z);
    if (a.nav) {
      a.nav.path = null;
      a.nav.search = null;
    }
    a.moveGoal = null;
    if (a.state === "move") a.setState("idle");
  }
  function arrive(rec) {
    const a = rec.a,
      d = rec.dest;
    rec.leg = "at";
    a.home = { x: d.x, z: d.z, r: d.r || 1.2 };
    a.aiMode = d.mode || "static";
    let yaw = d.yaw;
    if (d.faceStage) {
      const st = has(["opry_stage", "stage", "singer"]);
      if (st) yaw = Math.atan2(-(st.x - d.x), -(st.z - d.z));
    }
    if (isFinite(yaw) && a.aiMode !== "wander") {
      a.yaw = yaw;
      a.homeYaw = yaw;
      if (a.applyYaw) a.applyYaw();
    }
    if (a.aiMode === "sit" && a.anim) a.anim("sit");
    rec.asleep = !!d.sleep;
    applyBarks(rec);
    if (
      d.eating &&
      G.player &&
      Math.hypot(a.pos.x - G.player.pos.x, a.pos.z - G.player.pos.z) < 14 &&
      Math.random() < 0.35
    )
      a.say(pick(EAT_BARKS), 3);
    rec.pickT = G.time.elapsed + (d.repick || 0) * (0.6 + Math.random() * 0.8);
  }
  function applyBarks(rec) {
    const a = rec.a;
    if (rec.asleep) {
      a.customBarks = SLEEP_BARKS;
      return;
    }
    if (rec.def.guard) {
      a.customBarks = rec.def.barks || (nightNow() ? GUARD_NIGHT : GUARD_DAY);
      return;
    }
    a.customBarks = rec.def.barks || null;
  }
  function nightNow() {
    const h = G.time.hour;
    return h >= 20 || h < 6;
  }
  /**
   * Can't get where the routine wants while the player is watching (door blocked, path stuck):
   * mill about on this side for a while instead of freezing mid-street, then try again.
   */
  function loiter(rec, secs) {
    const a = rec.a;
    const f = L.freeSpot(
      a.pos.x + (Math.random() - 0.5) * 5,
      a.pos.z + (Math.random() - 0.5) * 5,
      a.pos.y,
      { maxR: 5 },
    );
    rec.dest = {
      x: f.x,
      y: f.y,
      z: f.z,
      r: 1.6,
      mode: "wander",
      repick: secs || 25,
      loiter: true,
    };
    rec.leg = null;
    rec.door = null;
    rec.moveT = G.time.elapsed;
    rec.lastX = a.pos.x;
    rec.lastZ = a.pos.z;
    if (
      Math.random() < 0.3 &&
      G.player &&
      Math.hypot(a.pos.x - G.player.pos.x, a.pos.z - G.player.pos.z) < 16
    )
      a.say(
        pick([
          "Hm. Where was I going?",
          "Forgot what I came out here for.",
          "Eh, it'll keep.",
        ]),
        2.5,
      );
  }
