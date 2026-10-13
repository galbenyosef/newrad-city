// play-inline-184 03 — chat
// Lines 30-242 of readable/play-inline-184.pretty.js (statement-aligned).
  const firstDefine = !G.poiSandbox;

  const REG = new Map(); // id → entry
  const rnd = Math.random;
  let t = 0;

  function actorOf(e) {
    try {
      const a = G.actors && G.actors.get && G.actors.get(e.id);
      return a && !a.removed && !a._removed ? a : null;
    } catch (err) {
      return null;
    }
  }
  function busy(a) {
    if (!a || a.dead || a.knockedOut || a.inCombat || a.following) return true;
    try {
      if (a.hostile && a.hostile()) return true;
    } catch (err) {
      return true;
    }
    try {
      const c = G.dialogue && G.dialogue.current && G.dialogue.current();
      if (c && c.actor === a) return true;
    } catch (err) {
      /* ignore */
    }
    return a.state && a.state !== "idle" && a.state !== "move";
  }
  function setHome(a, x, z, yaw) {
    a.home = { x, z, r: 0.5 };
    a.homeYaw = yaw;
    a.aiMode = "guard";
    a.ai = "guard";
  }
  function say(a, text) {
    try {
      if (a.say) a.say(text, 3.2);
    } catch (err) {
      /* ignore */
    }
    try {
      a.oneShot && a.oneShot("talk");
    } catch (err) {
      /* ignore */
    }
  }

  function tick(dt) {
    if (
      !REG.size ||
      !G.player ||
      !G.actors ||
      typeof G.actors.get !== "function"
    )
      return;
    t += dt;
    const pp = G.player.pos;
    for (const e of REG.values()) {
      const a = actorOf(e);
      if (!a) continue;
      if (Math.abs(a.pos.x - pp.x) > 160 || Math.abs(a.pos.z - pp.z) > 160)
        continue; // other cell / far outside
      if (busy(a)) {
        if (e.chat) endChat(e);
        continue;
      }
      if (e.phase === "chat") {
        const b = actorOf(e.chat.with);
        if (!b || busy(b) || t > e.until) {
          endChat(e);
          continue;
        }
        a.faceTowards(b.pos.x, b.pos.z, 3, dt);
        if (t > e.nextLine && e.chat.lines.length) {
          const line = e.chat.lines.shift();
          say(a, line);
          e.nextLine = t + 3.6;
          e.chat.with.nextLine = t + 1.8;
        } else if (t > e.nextGesture) {
          e.nextGesture = t + 2.5 + rnd() * 3;
          try {
            a.oneShot("talk");
          } catch (err) {
            /* ignore */
          }
        }
        continue;
      }
      if (t < e.until) continue;
      // lingering done → maybe start a chat, else walk somewhere else
      if (e.chatPool && e.chatPool.length && rnd() < (e.chatChance || 0.35)) {
        const partner = [...REG.values()].find(
          (o) =>
            o !== e &&
            o.group === e.group &&
            o.phase !== "chat" &&
            actorOf(o) &&
            !busy(actorOf(o)) &&
            actorOf(o).pos.distanceTo(a.pos) < 18,
        );
        if (partner) {
          startChat(e, partner, a, actorOf(partner));
          continue;
        }
      }
      const s =
        e.spots.length > 1
          ? e.spots.filter((q) => q !== e.at)[
              (rnd() * (e.spots.length - 1)) | 0
            ]
          : e.spots[0];
      if (!s) continue;
      e.at = s;
      e.phase = "go";
      setHome(
        a,
        s.x + (rnd() - 0.5) * 0.6,
        s.z + (rnd() - 0.5) * 0.6,
        s.yaw || 0,
      );
      e.until = t + 15 + rnd() * 30;
    }
  }
  function startChat(e, o, a, b) {
    const mx = (a.pos.x + b.pos.x) / 2,
      mz = (a.pos.z + b.pos.z) / 2;
    const dx = b.pos.x - a.pos.x,
      dz = b.pos.z - a.pos.z,
      d = Math.hypot(dx, dz) || 1;
    setHome(a, mx - (dx / d) * 0.65, mz - (dz / d) * 0.65, 0);
    setHome(b, mx + (dx / d) * 0.65, mz + (dz / d) * 0.65, 0);
    const pair = e.chatPool[(rnd() * e.chatPool.length) | 0];
    const dur = 14 + rnd() * 8;
    e.phase = "chat";
    o.phase = "chat";
    e.chat = { with: o, lines: [pair[0]] };
    o.chat = { with: e, lines: pair.slice(1) };
    e.until = o.until = t + dur;
    e.nextLine = t + 3.5;
    o.nextLine = t + 6.5;
    e.nextGesture = o.nextGesture = t + 4;
  }
  function endChat(e) {
    const o = e.chat && e.chat.with;
    e.chat = null;
    e.phase = "idle";
    e.until = t + 3 + rnd() * 6;
    if (o && o.chat) {
      o.chat = null;
      o.phase = "idle";
      o.until = t + 5 + rnd() * 8;
    }
  }

  const API = {
    version: VERSION,
    add(id, o) {
      o = o || {};
      if (!id || !o.spots || !o.spots.length) return;
      // combat's navMove walks straight lines with wall sliding: keep every spot on the home spot's floor and close by
      const h = o.spots[0];
      const spots = o.spots.filter(
        (q) =>
          Math.abs((q.y || 0) - (h.y || 0)) < 0.9 &&
          Math.hypot(q.x - h.x, q.z - h.z) < 40,
      );
      if (spots.length < 2) return;
      o = Object.assign({}, o, { spots });
      REG.set(id, {
        id,
        group: o.group || "default",
        spots: o.spots,
        chatPool: o.chat || null,
        chatChance: o.chatChance,
        phase: "idle",
        until: t + 4 + rnd() * 12,
        at: null,
        chat: null,
      });
    },
    remove(id) {
      REG.delete(id);
    },
    clear(group) {
      for (const [k, e] of REG) if (!group || e.group === group) REG.delete(k);
    },
    list() {
      return [...REG.values()].map((e) => ({
        id: e.id,
        group: e.group,
        phase: e.phase,
        spots: e.spots.length,
      }));
    },
    _tick: tick,
  };
  G.poiSandbox = API;
  if (firstDefine && G.registerModule) {
    G.registerModule({
      name: "poi_sandbox",
      order: 58,
      update(dt) {
        if (dt > 0 && G.poiSandbox && G.poiSandbox._tick) {
          try {
            G.poiSandbox._tick(dt);
          } catch (err) {
            G.reportError("poi_sandbox", err);
          }
        }
      },
    });
  }
