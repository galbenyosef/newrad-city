// play-inline-312 13 — quests
// Lines 3815-3871 of readable/play-inline-312.pretty.js (statement-aligned).
  K.q = {
    active: (id) => {
      try {
        return !G.isStub("quests") && G.quests.isActive(id);
      } catch (e) {
        return false;
      }
    },
    done: (id) => {
      try {
        return !G.isStub("quests") && G.quests.isComplete(id);
      } catch (e) {
        return false;
      }
    },
    stage: (id) => {
      try {
        return !G.isStub("quests") ? G.quests.stage(id) : null;
      } catch (e) {
        return null;
      }
    },
    start: (id, o) =>
      K.safe("qstart " + id, () => {
        if (
          !G.isStub("quests") &&
          !G.quests.isActive(id) &&
          !G.quests.isComplete(id)
        )
          G.quests.start(id, o);
      }),
    set: (id, st) =>
      K.safe("qstage " + id, () => {
        if (!G.isStub("quests") && G.quests.isActive(id))
          G.quests.setStage(id, st);
      }),
    complete: (id) =>
      K.safe("qdone " + id, () => {
        if (!G.isStub("quests") && G.quests.isActive(id)) G.quests.complete(id);
      }),
    fail: (id) =>
      K.safe("qfail " + id, () => {
        if (!G.isStub("quests") && G.quests.isActive(id)) G.quests.fail(id);
      }),
    started: (id) => {
      try {
        return (
          !G.isStub("quests") &&
          (G.quests.isActive(id) ||
            G.quests.isComplete(id) ||
            (G.quests.stage && G.quests.stage(id) != null))
        );
      } catch (e) {
        return false;
      }
    },
  };
