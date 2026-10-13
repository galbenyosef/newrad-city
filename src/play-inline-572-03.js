// play-inline-572 03 — out
// Lines 538-574 of readable/play-inline-572.pretty.js (statement-aligned).
  function auditLocks(issues) {
    const out = { total: 0, problems: [] };
    if (G.isStub("locks") || !G.locks || typeof G.locks.audit !== "function") {
      out.skipped = "locks module not loaded";
      return out;
    }
    const rows = safe(() => G.locks.audit(), []);
    if (!Array.isArray(rows)) {
      out.error =
        rows && rows.__err ? rows.__err : "G.locks.audit() returned no list";
      return out;
    }
    out.total = rows.length;
    for (const r of rows) {
      const probs = (r && r.problems) || [];
      if (!probs.length) continue;
      out.problems.push(
        (r.id || "?") +
          (r.label ? " (" + r.label + ")" : "") +
          ": " +
          probs.join("; "),
      );
      issues.push({
        sev: "high",
        quest: null,
        stage: null,
        kind: "lock",
        msg: 'lock "' + (r.id || "?") + '" ' + probs.join("; "),
      });
    }
    return out;
  }

  G.quests.debug.audit = audit;
  G.quests.debug.auditLocks = () => auditLocks([]);
  G.quests.debug.checkPos = checkPos;
  G.quests.debug.lintDialogues = lintDialogues;
