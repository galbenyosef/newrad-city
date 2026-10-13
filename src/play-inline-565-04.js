// play-inline-565 04 — walk
// Lines 1028-1089 of readable/play-inline-565.pretty.js (statement-aligned).
  ms.walk = walk;

  // ------------------------------------------------------------------
  // Debug: G.quests.debug.ms
  // ------------------------------------------------------------------
  G.quests.debug.ms = {
    walk: (id) => walk(id),
    /** Walk the whole spine from wherever it is (each quest started by its solver walk). */
    walkAll(upTo) {
      const out = [];
      for (const s of SPINE) {
        if (!Q.get(s.id)) {
          out.push({ id: s.id, ok: false, err: "undefined" });
          continue;
        }
        if (Q.isComplete(s.id)) continue;
        const r = walk(s.id);
        out.push(r);
        if (!r.ok) break;
        if (upTo && s.id === upTo) break;
      }
      return out;
    },
    solvers: () => Object.keys(SOLVERS),
    spine: () =>
      SPINE.map(
        (s) =>
          s.n +
          " " +
          s.id +
          " [" +
          (Q.isComplete(s.id)
            ? "done"
            : Q.isActive(s.id)
              ? "active:" + Q.stage(s.id)
              : Q.get(s.id)
                ? "-"
                : "UNDEFINED") +
          "] " +
          s.title,
      ),
    /** Complete every spine quest before `id` (no rewards) and start `id`. */
    skipTo(id) {
      for (const s of SPINE) {
        if (s.id === id) break;
        if (Q.get(s.id) && !Q.isComplete(s.id)) {
          if (!Q.isStarted(s.id)) Q.start(s.id);
          L.completeSilently(s.id);
        }
      }
      if (Q.get(id) && !Q.isStarted(id)) Q.start(id);
      return Q.stage(id);
    },
    inputs: () => ms.finaleInputs(),
    trust: (v) => (v === undefined ? ms.trust() : ms.setTrust(v)),
    rose: () => {
      const a = rose.actor();
      return a
        ? { mode: rose.mode(), pos: [a.pos.x, a.pos.y, a.pos.z], name: a.name }
        : rose.mode();
    },
  };
