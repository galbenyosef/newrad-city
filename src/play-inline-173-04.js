// play-inline-173 04 — isstub
// Lines 652-796 of readable/play-inline-173.pretty.js (statement-aligned).
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
    started: (id) => {
      try {
        return (
          !G.isStub("quests") &&
          (G.quests.isStarted
            ? G.quests.isStarted(id)
            : G.quests.isActive(id) || G.quests.isComplete(id))
        );
      } catch (e) {
        return false;
      }
    },
    stage: (id) => {
      try {
        return G.isStub("quests") ? null : G.quests.stage(id);
      } catch (e) {
        return null;
      }
    },
    start: (id) => {
      try {
        if (!G.isStub("quests") && !K.q.started(id)) G.quests.start(id);
      } catch (e) {
        G.reportError("poi_midtown:quest start", e);
      }
    },
    set: (id, st) => {
      try {
        if (!G.isStub("quests")) G.quests.setStage(id, st);
      } catch (e) {
        G.reportError("poi_midtown:quest stage", e);
      }
    },
    complete: (id) => {
      try {
        if (!G.isStub("quests") && !K.q.done(id)) G.quests.complete(id);
      } catch (e) {
        G.reportError("poi_midtown:quest complete", e);
      }
    },
    flag: (n) => {
      try {
        return G.isStub("quests") ? A.state["f_" + n] : G.quests.flag(n);
      } catch (e) {
        return undefined;
      }
    },
    setFlag: (n, v) => {
      try {
        if (G.isStub("quests")) A.state["f_" + n] = v;
        else G.quests.setFlag(n, v);
      } catch (e) {
        /* ignore */
      }
    },
  };
  K.inv = {
    count: (id) => {
      try {
        return G.isStub("inventory") ? 0 : G.inventory.count(id) || 0;
      } catch (e) {
        return 0;
      }
    },
    add: (id, n, o) => {
      try {
        if (!G.isStub("inventory")) G.inventory.add(id, n || 1, o);
      } catch (e) {
        /* ignore */
      }
    },
    remove: (id, n) => {
      try {
        if (!G.isStub("inventory")) G.inventory.remove(id, n || 1);
      } catch (e) {
        /* ignore */
      }
    },
    scrip: () => {
      try {
        return G.isStub("inventory")
          ? 0
          : G.inventory.scrip
            ? G.inventory.scrip()
            : G.inventory.count("scrip");
      } catch (e) {
        return 0;
      }
    },
    addScrip: (n) => {
      try {
        if (G.isStub("inventory")) return 0;
        return G.inventory.addScrip
          ? G.inventory.addScrip(n)
          : n > 0
            ? G.inventory.add("scrip", n)
            : G.inventory.remove("scrip", -n);
      } catch (e) {
        return 0;
      }
    },
  };
  K.xp = (n, why) => {
    try {
      if (!G.isStub("rpg")) G.rpg.addXP(n, why);
    } catch (e) {
      /* ignore */
    }
  };
  K.standing = (n, why) => {
    try {
      if (!G.isStub("rpg")) G.rpg.addStanding(n, why);
    } catch (e) {
      /* ignore */
    }
  };
  K.say = (text) => {
    try {
      G.notify(text);
    } catch (e) {
      /* ignore */
    }
  };
  K.news = (text) => {
    try {
      if (!G.isStub("radio") && G.radio.addNews) G.radio.addNews(text);
    } catch (e) {
      /* ignore */
    }
  };
