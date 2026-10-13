// play-inline-521 04 — convoys
// Lines 942-1092 of readable/play-inline-521.pretty.js (statement-aligned).
  K.system({
    name: "convoys",
    order: 30,
    init() {
      try {
        buildGraph();
      } catch (e) {
        G.reportError("ambient:convoy graph", e);
        GRAPH = { nodes: [] };
      }
      ROUTES = TRADERS.map((T) => {
        try {
          return buildRoute(T);
        } catch (e) {
          G.reportError("ambient:route " + T.key, e);
          return null;
        }
      });
      if (ROUTES.some((r) => !r)) {
        console.warn(
          "[ambient] some convoy routes could not be built",
          ROUTES.map((r) => !!r),
        );
      }
      // hurt a pack ox and the whole convoy turns on you
      G.events.on("factionAngered", (faction, actor) => {
        try {
          if (faction !== "amb_oxen" || !actor) return;
          for (const c of CONVOYS) {
            const lv = c.live;
            if (!lv || lv.oxen.indexOf(actor) < 0) continue;
            for (const m of [lv.trader].concat(lv.guards))
              if (K.actorAlive(m) && !m.hostile()) {
                m.wasFriendly = true;
                m.setHostile(true);
              }
            K.say(
              lv.trader,
              K.pick([
                "That's my ox, you animal!",
                "Hey! Leave the livestock alone!",
                "Guards! They're going for the oxen!",
              ]),
              3,
            );
          }
        } catch (e) {
          G.reportError("ambient:convoy anger", e);
        }
      });
    },
    initDone() {
      registerDialogues();
    },
    newGame() {
      registerDialogues();
      CONVOYS = [];
      TRADERS.forEach((T, i) => {
        if (ROUTES[i]) CONVOYS.push(newConvoy(i));
      });
    },
    reset() {
      for (const c of CONVOYS) c.live = null; // combat clears its actors itself on reset
      CONVOYS = [];
      campFire = null;
    },
    loaded() {
      if (!CONVOYS.length)
        TRADERS.forEach((T, i) => {
          if (ROUTES[i]) CONVOYS.push(newConvoy(i));
        });
    },
    update,
    save() {
      return CONVOYS.map((c) => {
        const x =
            c.live && K.actorAlive(c.live.trader) ? c.live.trader.pos.x : c.x,
          z = c.live && K.actorAlive(c.live.trader) ? c.live.trader.pos.z : c.z;
        return {
          ti: c.ti,
          wp: c.wp,
          x,
          z,
          state: c.state,
          stopUntil: c.stopUntil,
          alive: c.alive,
          deadDay: c.deadDay,
          gen: c.gen,
          merchant: c.merchant,
          restockDay: c.restockDay,
          met: !!c.met,
        };
      });
    },
    load(d) {
      CONVOYS = [];
      if (!Array.isArray(d)) return;
      for (const s of d) {
        if (!ROUTES[s.ti]) continue;
        const c = newConvoy(s.ti);
        Object.assign(c, {
          wp: s.wp % ROUTES[s.ti].pts.length,
          x: s.x,
          z: s.z,
          state: s.state,
          stopUntil: s.stopUntil,
          alive: s.alive !== false,
          deadDay: s.deadDay || 0,
          gen: s.gen || 0,
          restockDay: s.restockDay || K.day(),
          met: !!s.met,
        });
        if (s.merchant && Array.isArray(s.merchant.stock))
          c.merchant = s.merchant;
        CONVOYS.push(c);
      }
    },
  });

  K.convoys = {
    list: () => CONVOYS,
    routes: () => ROUTES,
    traders: TRADERS,
    materialize,
    dematerialize,
    /** Debug/test: put convoy i right next to (x,z) and materialise it. */
    bringTo(i, x, z) {
      const c = CONVOYS[i];
      if (!c) return null;
      if (c.live) dematerialize(c);
      // nearest waypoint on its own route
      const R = ROUTES[c.ti];
      let best = 0,
        bd = 1e9;
      R.pts.forEach((p, k) => {
        const d = Math.hypot(p.x - x, p.z - z);
        if (d < bd) {
          bd = d;
          best = k;
        }
      });
      c.wp = best;
      c.x = x;
      c.z = z;
      c.state = "travel";
      c.alive = true;
      materialize(c);
      return c.live;
    },
    name: traderName,
  };
