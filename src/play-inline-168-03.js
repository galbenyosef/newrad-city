// play-inline-168 03 — pos
// Lines 259-409 of readable/play-inline-168.pretty.js (statement-aligned).
  async function actAt(id, p, log, before, talkOnly) {
    const changed = () => sig(id) !== before;
    // 1. hostiles
    if (G.actors && G.actors.list) {
      for (const a of G.actors.list()) {
        if (!a || a.dead || !a.pos) continue;
        let hostile = false;
        try {
          hostile = typeof a.hostile === "function" ? a.hostile() : !!a.hostile;
        } catch (e) {
          /* ignore */
        }
        if (
          !hostile ||
          Math.hypot(a.pos.x - p.x, a.pos.z - p.z) > 18 ||
          Math.abs(a.pos.y - p.y) > 6
        )
          continue;
        try {
          if (a.kill) a.kill();
          else a.damage(1e6, { source: "player" });
          log.push("  kill " + (a.name || a.type));
        } catch (e) {
          /* ignore */
        }
      }
      await pump(250);
      if (changed()) return true;
    }
    // 2. talk
    const ints = G.world.interactables.filter((it) => {
      const q = it.getPos ? it.getPos() : it.pos;
      if (!q) return false;
      return (
        Math.hypot(q.x - p.x, q.z - p.z) < 6 &&
        Math.abs((q.y || 0) - p.y) < 3.5 &&
        (!it.enabled || it.enabled() !== false)
      );
    });
    const label = (it) => {
      try {
        return (
          String(typeof it.label === "function" ? it.label() : it.label || "") +
          " " +
          String(typeof it.verb === "function" ? it.verb() : it.verb || "")
        );
      } catch (e) {
        return "";
      }
    };
    const isDoor = (it) =>
      /door|exit|enter|leave|elevator|ladder|hatch|stairs|go (up|down)|travel/i.test(
        label(it),
      ) && !/vault|sealed|gate|cell|3b/i.test(label(it));
    const talkers = (G.actors && G.actors.list ? G.actors.list() : []).filter(
      (a) =>
        a &&
        !a.dead &&
        a.pos &&
        a.interactable &&
        Math.hypot(a.pos.x - p.x, a.pos.z - p.z) < 6 &&
        Math.abs(a.pos.y - p.y) < 3.5,
    );
    for (const a of talkers) {
      try {
        if (!a.inScene && a.attach) a.attach();
      } catch (e) {
        /* ignore */
      }
    }
    await pump(100);
    for (const it of talkers
      .map((a) => a.interactable)
      .filter((q) => {
        try {
          return !q.enabled || q.enabled();
        } catch (e) {
          return false;
        }
      })) {
      for (let visit = 0; visit < 3; visit++) {
        try {
          it.onInteract();
        } catch (e) {
          log.push("  ! talk " + e);
        }
        await pump(120);
        const cur = G.dialogue.current();
        log.push(
          " talk " + label(it).trim() + " (" + (cur ? cur.id : "-") + ")",
        );
        if (cur) await drive(cur.id, log);
        if (changed()) return true;
      }
    }
    if (talkOnly) return changed();
    // 3. containers
    if (G.containers && G.containers.near) {
      for (const c of G.containers.near(p, 7)) {
        if (c.pos && Math.abs(c.pos.y - p.y) > 3) continue;
        try {
          if (c.locked) c.locked = 0;
          if (c.takeAll) {
            const n = (c.list ? c.list() : []).length;
            c.takeAll();
            if (n) log.push("  loot " + (c.name || c.id) + " (" + n + ")");
          }
        } catch (e) {
          /* ignore */
        }
      }
      if (changed()) return true;
    }
    // 4. other interactables (terminals via a captured open)
    for (const it of ints) {
      if (/talk/i.test(label(it)) || isDoor(it)) continue;
      const q = it.getPos ? it.getPos() : it.pos;
      if (Math.hypot(q.x - p.x, q.z - p.z) > 5) continue;
      if (it.locked) it.locked = 0;
      let termId = null;
      const T = G.terminals,
        open0 = T && T.open;
      if (T)
        T.open = (tid) => {
          termId = tid;
          return true;
        };
      try {
        it.onInteract();
        log.push("  use " + label(it).trim());
      } catch (e) {
        log.push("  ! use " + label(it).trim() + " " + e);
      }
      if (T) T.open = open0;
      await pump(150);
      if (termId) runTerminal(termId, log);
      if (G.dialogue.isActive()) await drive(G.dialogue.current().id, log);
      if (G.state !== "play") {
        key("Escape");
        await pump(100);
        try {
          G.setState("play");
        } catch (e) {
          /* ignore */
        }
      }
      if (changed()) return true;
    }
    return changed();
  }

