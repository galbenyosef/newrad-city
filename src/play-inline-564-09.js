// play-inline-564 09 — setstage
// Lines 2559-2632 of readable/play-inline-564.pretty.js (statement-aligned).
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.solver("mq06", {
      land() {
        landed();
        if (at("mq06", "land")) Q.setStage("mq06", "pedestal");
      },
      pedestal() {
        Q.setStage("mq06", "command");
      },
      command() {
        Q.complete("mq06");
      },
    });
    M.solver("mq25", {
      confront() {
        craneSurrender();
      },
    });
    M.solver("mq26", {
      zeke() {
        L.setFlag("ms_zeke_free");
        L.setFlag("zeke_freed");
        L.give("ms_casemate_key", 1);
        Q.setStage("mq26", "calloway");
      },
      calloway() {
        L.setFlag("ms_casemate_open");
        L.setFlag("ms_calloway_free");
        L.setFlag("ms_nicole_alive_known");
        Q.setStage("mq26", "locker");
      },
      locker() {
        L.give("ms_key_b", 1);
        if (at("mq26", "locker")) Q.setStage("mq26", "keyb");
      },
      keyb() {
        keyB("destroyed");
      },
    });
    M.solver("mq27", {
      safe() {
        L.give("ms_note_file_670305", 1);
        if (at("mq27", "safe")) Q.setStage("mq27", "read");
      },
      read() {
        fileRead();
      },
      decide() {
        fileDecide("keep");
      },
    });
    M.solver("mq28", {
      climb() {
        readyTorch();
        Q.setStage("mq28", "choose");
      },
      choose() {
        L.setFlag("ms_torch", "reclamation");
        L.take("q_knickerbocker_core", 1);
        Q.complete("mq28");
      },
    });
  });
  G.quests.debug.finale = (choice) => {
    if (G.quests.debug.ms) G.quests.debug.ms.skipTo("mq28");
    L.give("q_liberty_key", 1, true);
    L.give("q_knickerbocker_core", 1, true);
    L.setFlag("crane_surrendered");
    if (Q.isActive("mq28")) Q.setStage("mq28", "choose");
    if (choice) choose(choice);
    return Q.stage("mq28");
  };
