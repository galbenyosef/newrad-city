// play-inline-568 09 — setstage
// Lines 2506-2577 of readable/play-inline-568.pretty.js (statement-aligned).
  ms.solver("mq22", {
    side() {
      if (Q.get("pf3_cog")) {
        if (!Q.isStarted("pf3_cog")) Q.start("pf3_cog");
        Q.complete("pf3_cog");
      } else Q.setStage("mq22", "memo");
    },
    memo() {
      if (!L.has(NOTE_MEMO)) L.give(NOTE_MEMO, 1, true);
      ms.set("memo_read");
      Q.setStage("mq22", "fate");
    },
    fate() {
      if (!ms.f("core")) {
        ms.set("core", "given");
        L.setFlag("core_given");
      }
      Q.complete("mq22");
    },
  });
  ms.solver("mq23", {
    gallery() {
      Q.setStage("mq23", "answer");
    },
    answer() {
      pactRefuse();
      Q.setStage("mq23", "rose");
    },
    follow() {
      ms.set("heard_humming");
      pactRefuse();
      Q.setStage("mq23", "rose");
    },
    rose() {
      Q.complete("mq23");
    },
  });
  ms.solver("mq24", {
    route() {
      routeCrossing();
    },
    muster() {
      solveCross("lancers");
    },
    rotorcraft() {
      solveCross("rotorcraft");
    },
    shells() {
      if (Q.get("sq_shellshock")) {
        if (!Q.isStarted("sq_shellshock")) Q.start("sq_shellshock");
        Q.complete("sq_shellshock");
      } else Q.setStage("mq24", "ferry");
    },
    ferry() {
      solveCross("ferry");
    },
  });
  function solveCross(how) {
    if (!ms.f("rose_on_liberty") && !ms.f("rose_overwatch")) {
      if (ms.trust() >= 2) roseComes();
      else roseStays();
    }
    const lib = ms.liberty;
    if (lib && typeof lib.arrive === "function") {
      try {
        lib.arrive(how);
      } catch (e) {
        G.reportError("quests:ms:mq24:solver", e);
      }
    }
    if (!Q.isComplete("mq24")) Q.complete("mq24");
  }
