// play-inline-537 03 — gameid
// Lines 544-868 of readable/play-inline-537.pretty.js (statement-aligned).
  AR.defineItems = function () {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    for (const s of AR.MINIS) {
      G.items.define({
        id: AR.miniItem(s.id),
        name: "Landmark Miniature - " + s.name,
        type: "misc",
        weight: 0,
        value: 0,
        tags: ["collectible", "landmark_mini"],
        noLoot: true,
        noSell: true,
        mesh: "misc",
        desc: s.desc,
      });
    }
    // The Keys to the City: one stack while the hunt runs, then the threaded set (the vault's key).
    G.items.define({
      id: AR.ITEM_KEY,
      name: "Gold Key to the City",
      type: "misc",
      weight: 0.2,
      value: 0,
      quest: true,
      tags: ["collectible", "key_to_the_city"],
      noLoot: true,
      noSell: true,
      mesh: "key",
      desc:
        "A foot-long ceremonial key in gilded bronze, the city seal on the bow and a red, white and blue ribbon through it. " +
        'Unlike most keys to most cities, this one has a working bit. Engraved on the shaft: "OFFICE OF THE MAYOR · NEW YORK".',
    });
    G.items.define({
      id: AR.ITEM_KEYRING,
      name: "The Keys to the City",
      type: "key",
      weight: 3,
      value: 0,
      quest: true,
      tags: ["key", "key_to_the_city"],
      noLoot: true,
      noSell: true,
      mesh: "key",
      desc:
        "All sixteen ceremonial Keys to the City, threaded on the Mayor's ribbon in the order they were given, 1954 to 1967. " +
        "Sixteen bits, sixteen locks. The vault is under Gracie Mansion.",
    });
    try {
      if (!G.isStub("locks") && G.locks.obtainableFrom)
        G.locks.obtainableFrom(
          AR.ITEM_KEYRING,
          "Keys to the City: all sixteen ceremonial keys found (arcade ledger, key K)",
        );
    } catch (e) {
      /* locks stub */
    }
  };
  function titleCase(s) {
    return String(s)
      .toLowerCase()
      .replace(/(^|[\s(!-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
  }
  AR.titleCase = titleCase;
  AR.heroName = () => (G.HERO && G.HERO.name) || "stranger";
  /** Three-letter arcade initials from the hero's name. */
  AR.initials = function () {
    const n = String(AR.heroName())
      .toUpperCase()
      .replace(/[^A-Z]/g, "");
    return (n + "XXX").slice(0, 3);
  };

  // ------------------------------------------------------------------
  // Collecting
  // ------------------------------------------------------------------
  function notify(text, opts) {
    try {
      G.notify(text, opts || {});
    } catch (e) {
      /* hud stub */
    }
  }
  function addXP(n, why) {
    try {
      if (!G.isStub("rpg")) G.rpg.addXP(n, why);
    } catch (e) {
      G.reportError("arcade:xp", e);
    }
  }
  function addItem(id, n, silent) {
    try {
      if (!G.isStub("inventory") && G.items.get && G.items.get(id)) {
        G.inventory.add(id, n || 1, { silent: !!silent });
        return true;
      }
    } catch (e) {
      G.reportError("arcade:addItem", e);
    }
    return false;
  }
  function addScrip(n) {
    try {
      if (!n || G.isStub("inventory")) return;
      if (G.inventory.addScrip) G.inventory.addScrip(n);
    } catch (e) {
      G.reportError("arcade:scrip", e);
    }
  }
  AR.addItem = addItem;
  AR.addScrip = addScrip;
  AR.addXP = addXP;
  AR.notify = notify;

  /**
   * Mark a collectible as found. kind: 'mini'|'key'. Returns true if newly found.
   * opts.fromItem: the inventory item already arrived (don't add it again).
   */
  AR.collect = function (kind, id, opts) {
    opts = opts || {};
    const S = AR.STATE;
    if (kind === "mini") {
      const def = AR.MINIS.find((g) => g.id === id);
      if (!def || S.minis.has(id)) return false;
      S.minis.add(id);
      if (!opts.fromItem) addItem(AR.miniItem(id), 1, true);
      G.sfx.play("pickup", { volume: 0.8 });
      notify(
        "Landmark Miniature: " +
          def.name +
          " (" +
          S.minis.size +
          "/" +
          AR.MINIS.length +
          ")",
        { icon: "collectible", sub: "Press K to view your collections." },
      );
      addXP(AR.XP_MINI, "Landmark miniature");
      checkMilestones("minis", S.minis.size);
    } else if (kind === "key") {
      const def = AR.keyDef(id);
      if (!def || S.keys.has(id)) return false;
      S.keys.add(id);
      if (!opts.fromItem && !S.rewards.has("keys16"))
        addItem(AR.ITEM_KEY, 1, true);
      G.sfx.play("pickup", { volume: 0.8 });
      notify(
        "Key to the City No. " +
          def.no +
          " (" +
          def.year +
          ", " +
          def.who +
          ") " +
          S.keys.size +
          "/" +
          AR.KEYS.length,
        {
          icon: "collectible",
          sub: "Keys to the City: press K for the Mayor's register.",
        },
      );
      addXP(AR.XP_KEY, "Key to the City");
      checkMilestones("keys", S.keys.size);
    } else return false;
    G.events.emit("arcadeCollected", kind, id);
    if (AR.world && AR.world.refresh) AR.world.refresh();
    if (AR.ui && AR.ui.isOpen && AR.ui.isOpen()) AR.ui.render();
    return true;
  };

  function checkMilestones(kind, count) {
    for (const r of AR.REWARDS[kind]) {
      if (count < r.n || AR.STATE.rewards.has(r.id)) continue;
      AR.STATE.rewards.add(r.id);
      payReward(r, kind);
    }
  }
  function payReward(r, kind) {
    try {
      if (r.scrip) addScrip(r.scrip);
      if (r.items) for (const it of r.items) addItem(it[0], it[1], true);
      if (r.skills && !G.isStub("rpg") && G.rpg.boostSkill)
        for (const k in r.skills) G.rpg.boostSkill(k, r.skills[k], "silent");
      if (r.keyring) threadKeyring();
      if (r.xp) addXP(r.xp, "Collection");
    } catch (e) {
      G.reportError("arcade:reward", e);
    }
    // the final milestone of a collection that runs as a quest: the QUEST COMPLETED banner presents it
    if (r.final && AR.quests && AR.quests.active(kind)) {
      notify("Collection reward: " + r.text, { icon: "check" });
      return;
    }
    G.sfx.play("quest_complete", { volume: 0.7 });
    try {
      if (!G.isStub("hud") && G.hud.banner)
        G.hud.banner({ title: "COLLECTION REWARD", sub: r.text });
      else notify("Collection reward: " + r.text);
    } catch (e) {
      notify("Collection reward: " + r.text);
    }
  }
  /** Sixteen loose keys → the threaded set (the vault lock's key item). */
  function threadKeyring() {
    try {
      if (G.isStub("inventory")) return;
      const n = G.inventory.count ? G.inventory.count(AR.ITEM_KEY) : 0;
      if (n > 0 && G.inventory.remove)
        G.inventory.remove(AR.ITEM_KEY, n, { silent: true });
      if (!G.inventory.count || G.inventory.count(AR.ITEM_KEYRING) === 0)
        addItem(AR.ITEM_KEYRING, 1, true);
    } catch (e) {
      G.reportError("arcade:keyring", e);
    }
  }
  AR.threadKeyring = threadKeyring;
  /** Has the Mayor's vault been opened (the end of the hunt)? */
  AR.vaultOpen = () => {
    try {
      return !G.isStub("locks") && G.locks.isOpen(AR.VAULT_LOCK);
    } catch (e) {
      return false;
    }
  };

  // ------------------------------------------------------------------
  // High scores. The cabinet board = the player's runs merged with the
  // old-world table burned into the machine.
  // ------------------------------------------------------------------
  AR.highScores = (gameId) => (AR.STATE.scores[gameId] || []).slice();
  AR.best = (gameId) => {
    const t = AR.STATE.scores[gameId];
    return t && t.length ? t[0].score : 0;
  };
  AR.houseRecord = (gameId) => {
    const d = AR.gameDef(gameId);
    return d && d.board.length ? d.board[0][1] : 0;
  };
  AR.allTimeBest = (gameId) =>
    Math.max(
      AR.best(gameId),
      (AR.allTime[gameId] && AR.allTime[gameId].score) || 0,
      AR.houseRecord(gameId),
    );
  /** The cabinet's top-5 table: [{name, score, mine}] */
  AR.board = function (gameId) {
    const d = AR.gameDef(gameId);
    if (!d) return [];
    const rows = d.board
      .map((b) => ({ name: b[0], score: b[1], mine: false }))
      .concat(
        AR.highScores(gameId).map((s) => ({
          name: s.name,
          score: s.score,
          mine: true,
        })),
      );
    rows.sort((a, b) => b.score - a.score || (a.mine ? -1 : 1));
    return rows.slice(0, 5);
  };
  /** Record a finished run. Returns the rank (0-based) on the cabinet board, or -1. */
  AR.recordScore = function (gameId, score) {
    score = Math.max(0, Math.floor(score || 0));
    const S = AR.STATE;
    S.plays[gameId] = (S.plays[gameId] || 0) + 1;
    if (score <= 0) return -1;
    const name = AR.initials();
    const t = S.scores[gameId] || (S.scores[gameId] = []);
    const entry = { score, name, day: (G.time && G.time.day) || 1 };
    t.push(entry);
    t.sort((a, b) => b.score - a.score);
    if (t.length > 5) t.length = 5;
    const at = AR.allTime[gameId];
    if (!at || score > at.score) {
      AR.allTime[gameId] = { score, name };
      saveAllTime();
    }
    const board = AR.board(gameId);
    let rank = -1;
    for (let i = 0; i < board.length; i++)
      if (board[i].mine && board[i].score === score) {
        rank = i;
        break;
      }
    if (score > AR.houseRecord(gameId) && !S.records.has(gameId)) {
      S.records.add(gameId);
      addXP(AR.XP_RECORD, "Arcade house record");
      G.events.emit("arcadeRecord", gameId, score);
    }
    if (rank === 0) G.events.emit("arcadeHighScore", gameId, score);
    return rank;
  };
  /** A game's goal reached (first time → XP). */
  AR.champion = function (gameId) {
    if (AR.STATE.champion.has(gameId)) return false;
    AR.STATE.champion.add(gameId);
    addXP(AR.XP_CHAMPION, "Arcade challenge");
    return true;
  };
  /** Has the player found (played at) a cabinet with this game? */
  AR.discovered = function (gameId) {
    for (const id of AR.STATE.cabinets) {
      const c = AR.cabinetDef(id);
      if (c && c.game === gameId) return true;
    }
    return AR.STATE.plays[gameId] > 0;
  };

  // ------------------------------------------------------------------
  // Save / load
  // ------------------------------------------------------------------
  AR.serialize = function () {
    const S = AR.STATE;
    return {
      v: 3,
      minis: Array.from(S.minis),
      keys: Array.from(S.keys),
      cabinets: Array.from(S.cabinets),
      rewards: Array.from(S.rewards),
      champion: Array.from(S.champion),
      records: Array.from(S.records),
      scores: S.scores,
      plays: S.plays,
    };
  };
