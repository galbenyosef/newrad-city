// play-inline-521 02 — spot
// Lines 376-607 of readable/play-inline-521.pretty.js (statement-aligned).
  let CONVOYS = []; // dynamic, per game
  let ROUTES = []; // static (per trader index)
  let campFire = null;

  function freshMerchant(T) {
    return K.merchant(K.randInt(T.funds[0], T.funds[1]), K.stock(T.stock));
  }
  function newConvoy(ti) {
    const T = TRADERS[ti],
      R = ROUTES[ti];
    const stopIdx = R.pts
      .map((p, i) => (p.stop ? i : -1))
      .filter((i) => i >= 0);
    const wp = K.pick(stopIdx);
    return {
      ti,
      wp,
      x: R.pts[wp].x,
      z: R.pts[wp].z,
      state: "stop",
      stopUntil: K.gameHours() + K.rand(0.5, 3.5),
      alive: true,
      deadDay: 0,
      gen: 0,
      merchant: freshMerchant(T),
      restockDay: K.day(),
      live: null,
      stuckT: 0,
    };
  }
  function traderName(c) {
    const T = TRADERS[c.ti];
    return c.gen > 0 ? T.heir : T.name;
  }
  function nextStopName(c) {
    const R = ROUTES[c.ti];
    for (let k = 0; k < R.pts.length; k++) {
      const p = R.pts[(c.wp + k + (c.state === "stop" ? 1 : 0)) % R.pts.length];
      if (p.stop) return LOCNAME(p.stop);
    }
    return "somewhere";
  }
  function currentStop(c) {
    const p = ROUTES[c.ti].pts[c.wp];
    return c.state === "stop" && p.stop ? p.stop : null;
  }

  /** Abstract travel along the loop by `dist` metres. */
  function advance(c, dist) {
    const R = ROUTES[c.ti];
    let guard = 0;
    while (dist > 0 && guard++ < 50) {
      const t = R.pts[c.wp];
      const dx = t.x - c.x,
        dz = t.z - c.z,
        d = Math.hypot(dx, dz);
      if (d <= dist) {
        c.x = t.x;
        c.z = t.z;
        dist -= d;
        if (t.stop) {
          arriveStop(c);
          return;
        }
        c.wp = (c.wp + 1) % R.pts.length;
      } else {
        c.x += (dx / d) * dist;
        c.z += (dz / d) * dist;
        dist = 0;
      }
    }
  }
  function arriveStop(c) {
    c.state = "stop";
    c.stopUntil = K.gameHours() + K.rand(2, 4);
    // restock every three days
    if (K.day() - c.restockDay >= 3) {
      const T = TRADERS[c.ti],
        fresh = freshMerchant(T);
      K.setFunds(c.merchant, Math.max(K.funds(c.merchant), K.funds(fresh)));
      const have = new Map((c.merchant.stock || []).map((e) => [e[0], e[1]]));
      for (const [id, n] of fresh.stock)
        have.set(id, Math.max(have.get(id) || 0, n));
      c.merchant.stock = Array.from(have.entries());
      c.restockDay = K.day();
    }
  }
  function departStop(c) {
    c.state = "travel";
    c.wp = (c.wp + 1) % ROUTES[c.ti].pts.length;
  }
  /** Stop timer / night camp. Returns true if the convoy should leave now. */
  function stopOver(c) {
    if (K.gameHours() < c.stopUntil) return false;
    if (K.isBedTime(0) || K.isStormy()) {
      c.stopUntil = K.gameHours() + 0.5;
      return false;
    } // camp for the night / sit out the storm
    return true;
  }

  // ------------------------------------------------------------------
  // Materialisation
  // ------------------------------------------------------------------
  function guardWeapon(lvl) {
    const pool =
      lvl >= 8
        ? ["assault_rifle", "combat_shotgun", "hunting_rifle"]
        : ["hunting_rifle", "combat_shotgun", "pistol_10mm", "smg_10mm"];
    const ok = pool.filter((w) => K.itemExists(w) || G.isStub("items"));
    return ok.length ? K.pick(ok) : "none";
  }
  function materialize(c) {
    const T = TRADERS[c.ti];
    const spot =
      K.freeSpotNear(c.x, c.z, 5, 16) || K.freeSpotNear(c.x, c.z, 10, 16);
    if (!spot) return false;
    const R = ROUTES[c.ti];
    const tgt = R.pts[c.wp];
    const yaw = K.yawTo(spot.x, spot.z, tgt.x, tgt.z);
    const pl = K.level();
    const trader = K.spawnActor({
      type: "human",
      outfit: T.outfit(),
      gender: T.gender,
      hat: T.hat,
      faction: "settlers",
      name: traderName(c),
      level: 8,
      pos: spot,
      yaw,
      ai: "patrol",
      patrol: [{ x: tgt.x, z: tgt.z }],
      weapon: K.itemExists("pistol_10mm") ? "pistol_10mm" : "none",
      voice: "merchant",
      merchant: c.merchant,
      dialogue: "amb_dlg_" + T.key,
      barks: { greet: T.greet, idle: T.idle },
      noRespawn: true,
      seed: "amb_" + T.key + c.gen,
      inventory: K.stock([
        [K.SCRIP, K.randInt(20, 60)],
        ["rally_tonic", 1],
      ]),
      hp: 150,
    });
    if (!trader) return false;
    trader._ambConvoy = c;
    const live = {
      trader,
      guards: [],
      oxen: [],
      spawnT: K.now(),
      lastX: spot.x,
      lastZ: spot.z,
      moveT: K.now(),
      outsideT: 0,
    };
    for (let i = 0; i < 2; i++) {
      const gp =
        K.freeSpotNear(
          spot.x - Math.sin(yaw) * -3 + (i ? 2 : -2),
          spot.z - Math.cos(yaw) * -3,
          3,
          10,
        ) || spot;
      const lvl = Math.max(6, pl + K.randInt(-1, 1));
      const g = K.spawnActor({
        type: "human",
        outfit: K.pick(["combat_armor", "leather_armor", DRIFTER()]),
        faction: "settlers",
        name: "Convoy Guard",
        voice: "guard",
        level: lvl,
        pos: gp,
        yaw,
        ai: "follow",
        weapon: guardWeapon(lvl),
        noRespawn: true,
        gender: Math.random() < 0.7 ? "m" : "f",
      });
      if (g) {
        try {
          g.follow(trader);
        } catch (e) {
          /* ignore */
        }
        live.guards.push(g);
      }
    }
    for (let i = 0; i < T.oxen; i++) {
      const bp = K.freeSpotNear(
        spot.x + Math.sin(yaw) * (3 + i * 3),
        spot.z + Math.cos(yaw) * (3 + i * 3),
        3,
        10,
      );
      if (!bp) continue;
      const b = K.oxen.spawnActor({
        pos: bp,
        yaw,
        variant: T.pack + i,
        ai: "follow",
        follow: trader,
        name: "Pack Ox",
      });
      if (b) live.oxen.push(b);
    }
    c.live = live;
    K.log("convoy materialised", T.key, spot);
    return true;
  }
  function dematerialize(c) {
    const lv = c.live;
    if (!lv) return;
    if (K.actorAlive(lv.trader)) {
      c.x = lv.trader.pos.x;
      c.z = lv.trader.pos.z;
    }
    for (const a of [lv.trader].concat(lv.guards, lv.oxen)) K.removeActor(a);
    c.live = null;
    if (campFire && campFire.convoy === c) {
      K.removeProp(campFire.h);
      campFire = null;
    }
  }

  function liveAll(lv) {
    return [lv.trader].concat(lv.guards, lv.oxen);
  }

  /** Drive a materialised convoy (2 Hz). */
