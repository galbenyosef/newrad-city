// play-inline-617 02 — kind
// Lines 352-613 of readable/play-inline-617.pretty.js (statement-aligned).
  function scanWorld() {
    const doors = safe(() => G.world.doors, []) || [];
    for (const d of doors) {
      const def = d && d.def;
      if (!def) continue;
      if (def.lock && def.lock.id) {
        if (!specs.has(def.lock.id))
          register(Object.assign({ kind: "door", label: def.label }, def.lock));
      } else if (def.locked > 0)
        noteUnconverted(
          'door "' + (def.label || "?") + '" @' + posKey(def.pos),
          "door",
          null,
        );
    }
    if (X.live("containers")) {
      for (const c of safe(() => G.containers.list(), [])) {
        if (!c) continue;
        if (c.lock && c.lock.id) {
          if (!specs.has(c.lock.id))
            register(
              Object.assign({ kind: "container", label: c.name }, c.lock),
            );
        } else if (typeof c.locked === "number" && c.locked > 0)
          noteUnconverted(
            'container "' + (c.name || c.id || "?") + '" @' + posKey(c.pos),
            "container",
            null,
          );
      }
    }
  }
  /**
   * opts: {problemsOnly:bool} → [{id, label, kind, key?, code?, passcode?, learnable:[...], keySources:[...], problems:[...]}]
   * plus one pseudo-entry per unconverted legacy call site (id 'unconverted:<where>').
   */
  function audit(opts) {
    opts = opts || {};
    scanWorld();
    const items = itemSources(),
      lsrc = learnSources();
    const out = [];
    for (const s of specs.values()) {
      const p = [];
      const learnable = lsrc.get(s.id) || [];
      let keySources = [];
      if (!s.key && !s.code && !s.passcode) p.push("no key, code or passcode");
      if (s.code && !/^\d{4,6}$/.test(s.code))
        p.push('code "' + s.code + '" is not 4-6 digits');
      if (s.key) {
        const def = safe(
          () => (X.live("items") ? G.items.get(s.key) : null),
          null,
        );
        keySources = items.get(s.key) || [];
        if (X.live("items") && !def)
          p.push('key item "' + s.key + '" is not defined');
        else if (!keySources.length)
          p.push(
            'key "' +
              s.key +
              '" is never obtainable (not in the world, a container, an NPC inventory or a quest reward; declare scripted gifts with G.locks.obtainableFrom)',
          );
      }
      if ((s.code || s.passcode) && !learnable.length)
        p.push(
          (s.code ? "code" : "passcode") +
            " is never learnable (no note, tape reel, terminal entry or dialogue teaches it; declare with G.locks.learnableFrom or a `learn` field)",
        );
      for (const l of learnable) {
        const m = /#([\w.-]+)$/.exec(l); // notes / tape reels: the item itself must be obtainable
        if (m && !items.has(m[1]))
          p.push('teaching item "' + m[1] + '" is never obtainable');
      }
      if (s.legacy) p.push("unconverted legacy lock (" + s.legacy + ")");
      if (!opts.problemsOnly || p.length) {
        out.push({
          id: s.id,
          label: s.label,
          kind: s.kind || "",
          key: s.key || null,
          code: s.code || null,
          passcode: s.passcode || null,
          learnable,
          keySources,
          problems: p,
        });
      }
    }
    for (const id of lsrc.keys())
      if (!specs.has(id))
        out.push({
          id,
          label: "(unregistered)",
          kind: "",
          learnable: lsrc.get(id),
          keySources: [],
          problems: ["a learn source names a lock that was never registered"],
        });
    for (const id of learned.keys())
      if (!specs.has(id) && !lsrc.has(id))
        out.push({
          id,
          label: "(unregistered)",
          kind: "",
          learnable: [],
          keySources: [],
          problems: [
            "G.locks.learn() was called for a lock that was never registered",
          ],
        });
    for (const u of unconverted.values()) {
      if (u.ids.size) continue; // already reported on its lock entries
      out.push({
        id: "unconverted:" + u.where,
        label: u.where,
        kind: u.kind,
        learnable: [],
        keySources: [],
        problems: ["unconverted legacy " + u.kind + " lock at " + u.where],
      });
    }
    return out;
  }
  function auditSummary() {
    const a = audit();
    const bad = a.filter((e) => e.problems.length);
    return {
      locks: specs.size,
      ok: a.length - bad.length,
      withProblems: bad.length,
      unconverted: unconverted.size,
      byProblem: bad.reduce((m, e) => {
        for (const p of e.problems) {
          const k = p
            .replace(/"[^"]*"/g, '"…"')
            .replace(/\(.*$/, "")
            .trim();
          m[k] = (m[k] || 0) + 1;
        }
        return m;
      }, {}),
    };
  }

  // ------------------------------------------------------------------
  // Cheat: "Reveal all codes & keys"
  // ------------------------------------------------------------------
  function revealAll(opts) {
    opts = opts || {};
    let codes = 0,
      keys = 0;
    for (const s of specs.values()) {
      if ((s.code || s.passcode) && learn(s.id, "Revealed", { silent: true }))
        codes++;
      if (s.key && opts.keys !== false && X.invCount(s.key) <= 0) {
        X.invAdd(s.key, 1);
        keys++;
      }
    }
    try {
      G.notify("Revealed " + codes + " codes and " + keys + " keys.");
    } catch (e) {
      /* ignore */
    }
    return { codes, keys };
  }

  // ------------------------------------------------------------------
  // Unconverted call sites (legacy numeric difficulty locks)
  // ------------------------------------------------------------------
  function posKey(p) {
    return p ? Math.round(p.x) + "," + Math.round(p.z) : "?";
  }
  function noteUnconverted(where, kind, lockId) {
    let u = unconverted.get(where);
    if (!u) {
      unconverted.set(where, (u = { where, kind, ids: new Set(), count: 0 }));
      console.warn("[locks] unconverted " + kind + " call at " + where);
    }
    u.count++;
    if (lockId) u.ids.add(lockId);
    return u;
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  G.locks = {
    register,
    get: (id) => specs.get(id) || null,
    list: () => Array.from(specs.values()),
    open,
    isOpen: (id) => opened.has(String(id)),
    unlock(id, how) {
      const s = specs.get(String(id)) || register({ id: String(id) });
      if (!opened.has(s.id)) markOpen(s, how || "script");
      return true;
    },
    relock(id) {
      opened.delete(String(id));
    },
    learn,
    isKnown: (id) => learned.has(String(id)),
    learnableFrom(id, label) {
      addSrc(learnSrc, String(id), label);
    },
    obtainableFrom(itemId, label) {
      addSrc(keySrc, String(itemId), label);
    },
    known,
    audit,
    auditSummary,
    unconverted: () =>
      Array.from(unconverted.values()).map((u) => ({
        where: u.where,
        kind: u.kind,
        count: u.count,
        ids: Array.from(u.ids),
      })),
    revealAll,
    isKeypadOpen: () => !!(X.keypad && X.keypad.isOpen()),
  };

  // ------------------------------------------------------------------
  // Save / load / reset
  // ------------------------------------------------------------------
  G.events.on("reset", () => {
    opened.clear();
    learned.clear();
    learnN = 0;
    try {
      if (X.keypad) X.keypad.close(true);
    } catch (e) {
      /* ignore */
    }
  });
  G.save.register("locks", {
    save: () => ({
      open: Array.from(opened),
      learned: Array.from(learned.entries()).map(([id, e]) => [
        id,
        e.src,
        e.day,
        e.hour,
      ]),
    }),
    load: (d) => {
      opened.clear();
      learned.clear();
      learnN = 0;
      if (!d) return;
      for (const id of d.open || []) opened.add(id);
      for (const e of d.learned || [])
        learned.set(e[0], {
          n: ++learnN,
          src: e[1] || "",
          day: e[2] || 1,
          hour: e[3] || 0,
        });
    },
  });
